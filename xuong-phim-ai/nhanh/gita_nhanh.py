"""
GITA 365 · XƯỞNG PHIM — MÁY GPU "LÀM PHIM NHANH" (Modal, chạy song song từng cảnh)

Web app gửi ảnh mẫu + kế hoạch cảnh → trạm Cloudflare gọi `bat_dau` → `dao_dien` điều phối:

  ① Giọng      VieNeu-TTS (vi, Apache-2.0) / Chatterbox (en, MIT) → xử lý giọng chuẩn phát sóng
  ② Khung hình Qwen-Image-Edit-2509 + Lightning 8 bước (Apache-2.0): đặt ĐÚNG người trong ảnh mẫu
               vào phim trường GITA, đúng tư thế, đúng cỡ cảnh
  ③ Quay       SONG SONG — mỗi cảnh một GPU H100:
               · cảnh nói  → InfiniteTalk 720p + LightX2V 4 bước (khớp môi, cử động đầu/tay thật)
               · cảnh diễn → Wan 2.2 I2V A14B + LightX2V 4 bước (đi, chạy, cầm đồ vật…)
  ④ Hậu kỳ     mỗi clip: 30 hình/giây, phóng 1080p + làm nét, máy quay ảo (đẩy/kéo/lia…)
  ⑤ Ráp        phụ đề chuẩn Reels, thẻ tên Trainer/MC, nhạc tự hạ khi có lời, -14 LUFS → trả về trạm

Mục tiêu ~15 phút cho video ≤ 60 giây (≤ 14 cảnh) khi các cảnh chạy song song và mô hình đã nằm sẵn
trong kho Volume. Lần ĐẦU phải tải mô hình (~150GB) bằng `tai_mo_hinh` — chạy một lần, mất 1–2 giờ.

Triển khai (người kỹ thuật, một lần) — xem README-nhanh.md:
  modal secret create gita-xuong-phim GITA_GPU_TOKEN=<mật khẩu GPU> GITA_TRAM=<https://trạm...workers.dev>
  modal run    xuong-phim-ai/nhanh/gita_nhanh.py::tai_mo_hinh
  modal deploy xuong-phim-ai/nhanh/gita_nhanh.py        → lấy địa chỉ bat_dau → đặt MODAL_URL cho trạm

⚠ Mã này CHƯA chạy thử trên GPU (môi trường dựng app không có GPU). Phần ráp/giọng/phụ đề dùng chung
động cơ gita_xuong_phim.py đã thử thật trên CPU.
"""
import io, os, re, json, time, shutil, tempfile, subprocess, hmac
from pathlib import Path

import modal

app = modal.App("gita-phim-nhanh")
MH = "/mo-hinh"                                            # kho mô hình dùng chung (Volume)
kho = modal.Volume.from_name("gita-mo-hinh", create_if_missing=True)
bi_mat = modal.Secret.from_name("gita-xuong-phim")         # GITA_GPU_TOKEN, GITA_TRAM
GPU = "H100"                                               # đổi "A100-80GB" nếu muốn rẻ hơn (chậm hơn) rồi deploy lại
DONG_CO = Path(__file__).resolve().parent.parent / "gita_xuong_phim.py"
IT = f"{MH}/infinitetalk"
LORA_WAN = ("Kijai/WanVideo_comfy", "Lightx2v/lightx2v_I2V_14B_480p_cfg_step_distill_rank128_bf16.safetensors")
LORA_IT = ("Kijai/WanVideo_comfy", "Wan21_T2V_14B_lightx2v_cfg_step_distill_lora_rank32.safetensors")
LORA_QWEN = ("lightx2v/Qwen-Image-Lightning", "Qwen-Image-Edit-2509/Qwen-Image-Edit-2509-Lightning-8steps-V1.0-bf16.safetensors")

anh_he = (
    modal.Image.debian_slim(python_version="3.11")
    .apt_install("ffmpeg", "git", "libgl1", "libglib2.0-0", "fonts-dejavu-core")
    .pip_install("torch==2.6.0", "torchvision==0.21.0", "torchaudio==2.6.0")
    .pip_install("diffusers>=0.35.1", "transformers>=4.51,<5", "accelerate>=1.2", "peft>=0.15", "safetensors",
                 "sentencepiece", "sacremoses", "ftfy", "imageio[ffmpeg]", "opencv-python-headless", "pillow",
                 "huggingface_hub[hf_transfer]", "requests", "soundfile", "librosa", "vieneu", "chatterbox-tts")
    .run_commands("git clone --depth 1 https://github.com/MeiGen-AI/InfiniteTalk /opt/InfiniteTalk",
                  "cd /opt/InfiniteTalk && pip install -r requirements.txt || true",
                  "pip install 'misaki[en]' || true")
    .env({"HF_HOME": f"{MH}/hf", "HF_HUB_ENABLE_HF_TRANSFER": "1", "PYTHONUNBUFFERED": "1"})
    .add_local_file(str(DONG_CO), "/root/gita_xuong_phim.py")
)
web_he = modal.Image.debian_slim(python_version="3.11").pip_install("fastapi[standard]")
with web_he.imports():
    from fastapi import Request, HTTPException


# ───────────────────────── tiện ích chung ─────────────────────────
def chay(cmd, **kw):
    print("$", " ".join(map(str, cmd))[:300], flush=True)
    return subprocess.run([str(x) for x in cmd], check=True, **kw)

def phu_kin(img, w, h):
    """Cắt-phủ ảnh về đúng khung w×h (không méo)."""
    from PIL import Image
    s = max(w / img.width, h / img.height)
    im = img.resize((round(img.width * s), round(img.height * s)), Image.LANCZOS)
    x, y = (im.width - w) // 2, (im.height - h) // 2
    return im.crop((x, y, x + w, y + h))

def hau_ky_clip(vao, ra, W, H, may, noi_suy):
    """Một lượt ffmpeg: (nội suy 30fps) → phóng 1080p lanczos + làm nét → máy quay ảo trên khung 2×."""
    import sys; sys.path.insert(0, "/root")
    from gita_xuong_phim import bieu_thuc_may, _thong_so
    chuyen = (may or {}).get("chuyen", "tinh")
    loc = []
    if noi_suy: loc.append("minterpolate=fps=30:mi_mode=mci:mc_mode=aobmc:vsbmc=1")
    else: loc.append("fps=30")
    bt = None
    if chuyen not in ("tinh", "bam_theo", "xoay_quanh", "cau_len", "truot_ngang", "dolly_zoom", "doi_net", "fpv", "ai"):
        n = max(2, int(round(_thong_so(vao)[1] * (30 / max(1.0, _thong_so(vao)[0])))))
        bt = bieu_thuc_may(chuyen, (may or {}).get("cuong", 0.4), n)
    if bt:
        z, x, y = bt
        loc += [f"scale={2*W}:{2*H}:flags=lanczos:force_original_aspect_ratio=increase,crop={2*W}:{2*H}",
                f"zoompan=z='{z}':x='{x}':y='{y}':d=1:s={W}x{H}:fps=30"]
    else:
        loc += [f"scale={W}:{H}:flags=lanczos:force_original_aspect_ratio=increase,crop={W}:{H}"]
    loc += ["unsharp=5:5:0.6:3:3:0.0", "setsar=1"]
    chay(["ffmpeg", "-y", "-loglevel", "error", "-i", vao, "-vf", ",".join(loc), "-an",
          "-c:v", "libx264", "-preset", "fast", "-crf", "17", "-pix_fmt", "yuv420p", ra])

CO_EN = {"dac_ta": "extreme close-up", "can": "close-up shot", "trung": "medium shot",
         "trung_rong": "medium wide shot", "toan": "wide establishing shot"}


# ───────────────────────── ① tải mô hình (một lần) ─────────────────────────
@app.function(image=anh_he, volumes={MH: kho}, timeout=4 * 3600, cpu=8, memory=32768)
def tai_mo_hinh():
    from huggingface_hub import snapshot_download, hf_hub_download
    import requests
    for repo in ["Qwen/Qwen-Image-Edit-2509", "Wan-AI/Wan2.2-I2V-A14B-Diffusers", "Helsinki-NLP/opus-mt-vi-en"]:
        print("tải", repo, flush=True); snapshot_download(repo)
    for r, f in [LORA_QWEN, LORA_WAN, LORA_IT]:
        print("tải", f, flush=True); hf_hub_download(r, f)
    snapshot_download("Wan-AI/Wan2.1-I2V-14B-480P", local_dir=f"{IT}/Wan2.1-I2V-14B-480P")
    snapshot_download("TencentGameMate/chinese-wav2vec2-base", local_dir=f"{IT}/chinese-wav2vec2-base")
    hf_hub_download("TencentGameMate/chinese-wav2vec2-base", "model.safetensors", revision="refs/pr/1",
                    local_dir=f"{IT}/chinese-wav2vec2-base")
    snapshot_download("MeiGen-AI/InfiniteTalk", allow_patterns=["single/*"], local_dir=f"{IT}/InfiniteTalk")
    Path(f"{MH}/fonts").mkdir(parents=True, exist_ok=True)
    for w in ["Bold", "Regular"]:
        u = f"https://github.com/google/fonts/raw/main/ofl/bevietnampro/BeVietnamPro-{w}.ttf"
        Path(f"{MH}/fonts/BeVietnamPro-{w}.ttf").write_bytes(requests.get(u, timeout=60).content)
    try:
        from vieneu import Vieneu; Vieneu()                    # kéo mô hình giọng về kho
    except Exception as e: print("VieNeu chưa tải được:", e)
    Path(f"{MH}/giong").mkdir(exist_ok=True); Path(f"{MH}/nhac").mkdir(exist_ok=True)
    kho.commit()
    print("✅ Đã tải đủ mô hình vào kho gita-mo-hinh.")


# ───────────────────────── ② khung hình: người thật trong phim trường ─────────────────────────
@app.cls(image=anh_he, gpu=GPU, volumes={MH: kho}, timeout=20 * 60, scaledown_window=120, memory=65536)
class KhungHinh:
    @modal.enter()
    def nap(self):
        import torch
        from diffusers import QwenImageEditPlusPipeline
        self.pipe = QwenImageEditPlusPipeline.from_pretrained("Qwen/Qwen-Image-Edit-2509", torch_dtype=torch.bfloat16).to("cuda")
        try:
            self.pipe.load_lora_weights(LORA_QWEN[0], weight_name=LORA_QWEN[1]); self.buoc, self.cfg = 8, 1.0
        except Exception as e:
            print("Lightning Qwen chưa nạp được:", e); self.buoc, self.cfg = 40, 4.0

    @modal.method()
    def ve(self, anh: list, prompt: str, w: int, h: int, seed: int) -> bytes:
        import torch
        from PIL import Image
        imgs = [Image.open(io.BytesIO(b)).convert("RGB") for b in anh]
        kw = dict(image=imgs, prompt=prompt, negative_prompt=" ", true_cfg_scale=self.cfg,
                  num_inference_steps=self.buoc, generator=torch.Generator("cuda").manual_seed(seed))
        try: out = self.pipe(**kw, height=h, width=w).images[0]
        except TypeError: out = self.pipe(**kw).images[0]
        b = io.BytesIO(); phu_kin(out, w, h).save(b, "PNG"); return b.getvalue()


# ───────────────────────── ③a cảnh diễn: Wan 2.2 A14B + LightX2V 4 bước ─────────────────────────
@app.cls(image=anh_he, gpu=GPU, volumes={MH: kho}, timeout=25 * 60, scaledown_window=120, memory=98304, cpu=8.0)
class QuayCanh:
    @modal.enter()
    def nap(self):
        import torch
        from diffusers import WanImageToVideoPipeline
        from huggingface_hub import hf_hub_download
        self.pipe = WanImageToVideoPipeline.from_pretrained("Wan-AI/Wan2.2-I2V-A14B-Diffusers", torch_dtype=torch.bfloat16)
        self.pipe.enable_model_cpu_offload()                 # 2 chuyên gia 14B luân phiên lên GPU
        lp = hf_hub_download(*LORA_WAN)
        try:   # cách nạp LightX2V cho Wan 2.2 theo diffusers PR #12040
            self.pipe.load_lora_weights(lp, adapter_name="lx")
            self.pipe.set_adapters(["lx"], adapter_weights=[3.0])
            if getattr(self.pipe, "transformer_2", None) is not None:
                import safetensors.torch
                from diffusers.loaders.lora_conversion_utils import _convert_non_diffusers_wan_lora_to_diffusers
                sd = _convert_non_diffusers_wan_lora_to_diffusers(safetensors.torch.load_file(lp))
                self.pipe.transformer_2.load_lora_adapter(sd, adapter_name="lx2")
                self.pipe.transformer_2.set_adapters(["lx2"], weights=[1.5])
            self.buoc, self.cfg = 4, 1.0
        except Exception as e:
            print("LightX2V chưa nạp được → chạy đủ bước:", e); self.buoc, self.cfg = 30, 3.5

    @modal.method()
    def quay(self, png: bytes, prompt: str, neg: str, giay: float, w: int, h: int, W: int, H: int, may: dict) -> bytes:
        from PIL import Image
        from diffusers.utils import export_to_video
        img = Image.open(io.BytesIO(png)).convert("RGB")
        n = max(49, min(121, int(16 * float(giay)) // 4 * 4 + 1))   # 16 hình/giây, số khung 4k+1
        fr = self.pipe(image=img, prompt=prompt, negative_prompt=neg, height=h, width=w, num_frames=n,
                       num_inference_steps=self.buoc, guidance_scale=self.cfg).frames[0]
        d = Path(tempfile.mkdtemp()); export_to_video(fr, str(d / "tho.mp4"), fps=16)
        hau_ky_clip(d / "tho.mp4", d / "ra.mp4", W, H, may, noi_suy=True)
        return (d / "ra.mp4").read_bytes()


# ───────────────────────── ③b cảnh nói: InfiniteTalk 720p + LightX2V 4 bước ─────────────────────────
@app.cls(image=anh_he, gpu=GPU, volumes={MH: kho}, timeout=30 * 60, scaledown_window=120, memory=98304, cpu=8.0)
class NoiChuyen:
    @modal.method()
    def quay(self, png: bytes, wav: bytes, prompt: str, W: int, H: int, may: dict) -> bytes:
        from huggingface_hub import hf_hub_download
        d = Path(tempfile.mkdtemp())
        (d / "anh.png").write_bytes(png); (d / "giong.wav").write_bytes(wav)
        (d / "vao.json").write_text(json.dumps({"prompt": prompt, "cond_video": str(d / "anh.png"),
                                                "cond_audio": {"person1": str(d / "giong.wav")}}), encoding="utf-8")
        chay(["python", "generate_infinitetalk.py",
              "--ckpt_dir", f"{IT}/Wan2.1-I2V-14B-480P", "--wav2vec_dir", f"{IT}/chinese-wav2vec2-base",
              "--infinitetalk_dir", f"{IT}/InfiniteTalk/single/infinitetalk.safetensors",
              "--lora_dir", hf_hub_download(*LORA_IT), "--lora_scale", "1.0",
              "--input_json", d / "vao.json", "--size", "infinitetalk-720",
              "--sample_text_guide_scale", "1.0", "--sample_audio_guide_scale", "2.0",
              "--sample_steps", "4", "--sample_shift", "2", "--mode", "streaming", "--motion_frame", "9",
              "--num_persistent_param_in_dit", "0", "--save_file", d / "tho"], cwd="/opt/InfiniteTalk")
        hau_ky_clip(d / "tho.mp4", d / "ra.mp4", W, H, may, noi_suy=False)
        return (d / "ra.mp4").read_bytes()


# ───────────────────────── ④ đạo diễn: điều phối cả phim ─────────────────────────
class Tram:
    """Nói chuyện với trạm Cloudflare bằng GITA_GPU_TOKEN (chỉ đọc kế hoạch/ảnh, chỉ ghi kết quả)."""
    def __init__(self, jobid):
        import requests
        self.r, self.job = requests, jobid
        self.goc = os.environ["GITA_TRAM"].rstrip("/")
        self.h = {"x-gpu-token": os.environ["GITA_GPU_TOKEN"]}
        self.bat_dau = time.time()
    def doc(self, key):
        x = self.r.get(f"{self.goc}/api/gpu/doc/{key}", headers=self.h, timeout=60); x.raise_for_status(); return x.content
    def ghi(self, ten, data, loai):
        self.r.put(f"{self.goc}/api/gpu/ghi/{self.job}/{ten}", data=data,
                   headers={**self.h, "content-type": loai}, timeout=600).raise_for_status()
    def bao(self, tt, buoc, pt, **them):
        o = {"jobid": self.job, "trangThai": tt, "buoc": buoc, "phanTram": pt,
             "giay": round(time.time() - self.bat_dau), "capNhat": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()), **them}
        try: self.ghi("trang-thai.json", json.dumps(o, ensure_ascii=False).encode(), "application/json")
        except Exception as e: print("không báo được trạng thái:", e)
        print(f"[{pt}%] {buoc}", flush=True)

def _giong_mau(n):
    p = Path(f"{MH}/giong/{n.get('giong_key','')}.wav")
    return p if p.exists() else None

def sinh_giong(text, n, lang, ra):
    """Giọng nội bộ: có mẫu giong/<giới-tuổi>.wav thì clone; không thì giọng có sẵn theo giới tính."""
    import sys; sys.path.insert(0, "/root")
    from gita_xuong_phim import doc_mot_cau, master_giong, _vieneu
    mau = _giong_mau(n)
    ok = bool(mau) and doc_mot_cau(text, mau, lang, ra)
    if not ok and lang == "vi":
        m = _vieneu()
        try: co = [v if isinstance(v, str) else (v.get("name") or v.get("id")) for v in m.list_preset_voices()]
        except Exception: co = []
        thich = ["Thiện Minh", "Hải Đăng"] if n.get("gioi") != "nu" else ["Mai Anh", "Trúc Ly"]
        ten = next((x for x in thich if x in co), None)
        m.save(m.infer(text, voice=ten) if ten else m.infer(text), str(ra)); ok = True
    if not ok:
        from gita_xuong_phim import _chatterbox
        import torchaudio as ta
        c = _chatterbox(); ta.save(str(ra), c.generate(text), c.sr); ok = True
    master_giong(Path(ra))

def prompt_khung(c, nvs, ds_nv):
    import sys; sys.path.insert(0, "/root")
    from gita_xuong_phim import dich_en, HANH_DONG_EN
    ai = " and ".join(f"the person in image {i+1}" for i in range(len(nvs)))
    hd = HANH_DONG_EN.get(c.get("hanh_dong") or "", "").replace("{obj}", "the object")
    lam = hd or (dich_en(c.get("mo_ta", "")) if c.get("loai") == "dien" and c.get("mo_ta") else "")
    if c.get("loai") == "noi": lam = "speaking naturally to the camera with gentle hand gestures" + (", " + hd if hd else "")
    return (f"Keep the exact face, hairstyle, skin tone and identity of {ai}. Place {'them' if len(nvs) > 1 else 'this person'} "
            f"in {c.get('boi_canh_en', 'a modern studio')}. {lam}. {CO_EN.get((c.get('may') or {}).get('co'), 'medium shot')}, "
            "eye-level, photorealistic cinematic film still, shot on ARRI Alexa 35mm lens, natural skin texture, "
            "soft cinematic lighting, sharp focus, real photograph, not a cartoon, not a painting")

def prompt_quay(c):
    import sys; sys.path.insert(0, "/root")
    from gita_xuong_phim import prompt_video_en
    cc = {"hanh_dong": c.get("hanh_dong"), "do_vat": "", "prompt_video": c.get("mo_ta", "") if c.get("loai") == "dien" else "",
          "may_quay_ao": c.get("may") or {}}
    p = prompt_video_en(cc)
    return ("a person speaking naturally to the camera, expressive face, natural head and hand movement, " + p) if c.get("loai") == "noi" else p

@app.function(image=anh_he, volumes={MH: kho}, secrets=[bi_mat], timeout=60 * 60, cpu=8, memory=32768)
def dao_dien(jobid: str):
    import sys; sys.path.insert(0, "/root")
    T = Tram(jobid)
    try:
        T.bao("running", "Đọc kế hoạch cảnh…", 4)
        kh = json.loads(T.doc(f"jobs/{jobid}/ke-hoach.json"))
        canh, ds_nv = kh["canh"], {n["id"]: n for n in kh["nhan_vat"]}
        anh = {k: T.doc(n["anh"]) for k, n in ds_nv.items() if n.get("anh")}
        doc = kh.get("khung") != "ngang"
        W, H = (1080, 1920) if doc else (1920, 1080)
        w7, h7 = (720, 1280) if doc else (1280, 720)
        lang = kh.get("ngon_ngu") or "vi"
        lam = Path(tempfile.mkdtemp()); os.chdir(lam)
        base = lam / "ket-qua"; [(base / x).mkdir(parents=True, exist_ok=True) for x in ("clip", "giong", "tmp")]
        if Path(f"{MH}/fonts").exists(): shutil.copytree(f"{MH}/fonts", lam / "fonts")
        if Path(f"{MH}/nhac").exists() and any(Path(f"{MH}/nhac").iterdir()): shutil.copytree(f"{MH}/nhac", lam / "nhac")

        # ① giọng
        T.bao("running", "Đọc thoại bằng giọng nội bộ…", 8)
        for c in canh:
            if c.get("loai") == "noi" and c.get("thoai"):
                sinh_giong(c["thoai"], ds_nv.get(c["nv"][0], {}), lang, base / "giong" / f"{c['id']}.wav")

        # ② khung hình (song song)
        T.bao("running", f"Dựng {len(canh)} khung hình: nhân vật thật trong phim trường GITA…", 15)
        vao = []
        for i, c in enumerate(canh):
            nvs = [x for x in c["nv"] if x in anh][:2] or list(anh)[:1]
            vao.append(([anh[x] for x in nvs], prompt_khung(c, nvs, ds_nv), w7, h7, 1000 + i))
        khung = list(KhungHinh().ve.starmap(vao))

        # ③ quay song song: mỗi cảnh một GPU
        T.bao("running", f"Quay song song {len(canh)} cảnh trên GPU…", 30)
        viec = {}
        for c, png in zip(canh, khung):
            wav = base / "giong" / f"{c['id']}.wav"
            if c.get("loai") == "noi" and wav.exists():
                viec[c["id"]] = ("noi", NoiChuyen().quay.spawn(png, wav.read_bytes(), prompt_quay(c), W, H, c.get("may") or {}))
            else:
                from gita_xuong_phim import NEG_EN
                viec[c["id"]] = ("dien", QuayCanh().quay.spawn(png, prompt_quay(c), NEG_EN, c.get("giay", 5), w7, h7, W, H, c.get("may") or {}))
        xong, loi = {}, []
        while len(xong) + len(loi) < len(viec):
            for cid, (loai, fc) in viec.items():
                if cid in xong or cid in loi: continue
                try:
                    xong[cid] = fc.get(timeout=0)
                    (base / "clip" / f"{cid}.mp4").write_bytes(xong[cid])
                    if loai == "noi": (base / "clip" / f"{cid}.ok-sync").touch()
                except Exception as e:
                    if "Timeout" in type(e).__name__: continue          # cảnh này chưa xong
                    print("cảnh lỗi", cid, e); loi.append(cid)
            T.bao("running", f"Quay song song: xong {len(xong)}/{len(viec)} cảnh" + (f" · lỗi {len(loi)}" if loi else ""),
                  30 + int(55 * (len(xong) + len(loi)) / len(viec)))
            time.sleep(8)
        if not xong: raise RuntimeError("Không cảnh nào quay được — xem log Modal.")

        # ⑤ ráp
        T.bao("running", "Ráp phim 1080p: giọng, phụ đề, thẻ tên, nhạc…", 88)
        from gita_xuong_phim import buoc_rap
        cfg = {"phim": {"id": jobid, "ten": kh.get("tieu_de", "")}, "ngon_ngu": lang,
               "hau_ky": {"theTen": True, "phuDe": True, "nhacNen": True, "muot60": False},
               "nhan_vat": list(ds_nv.values()),
               "canh": [{"id": c["id"], "thu_tu": c.get("thu_tu"), "nhan_vat": c["nv"][0] if c["nv"] else "",
                         "giay": c.get("giay", 5), "thoai": c.get("thoai", "")} for c in canh if c["id"] in xong]}
        buoc_rap(cfg, base, W=W, Hh=H, fps=30)
        T.bao("running", "Gửi phim về trạm…", 96)
        T.ghi("phim-cuoi.mp4", (base / "phim-cuoi.mp4").read_bytes(), "video/mp4")
        if (base / "phim-cuoi-phude.mp4").exists():
            T.ghi("phim-cuoi-phude.mp4", (base / "phim-cuoi-phude.mp4").read_bytes(), "video/mp4")
        T.bao("done", f"Hoàn tất · {len(xong)} cảnh" + (f" (bỏ {len(loi)} cảnh lỗi: {', '.join(loi)})" if loi else ""), 100,
              phim=f"jobs/{jobid}/phim-cuoi.mp4", xong=time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()))
    except Exception as e:
        T.bao("error", "Dừng lại: " + str(e)[:240], 0)
        raise


# ───────────────────────── cổng nhận việc từ trạm Cloudflare ─────────────────────────
@app.function(image=web_he, secrets=[bi_mat])
@modal.fastapi_endpoint(method="POST")
async def bat_dau(request: "Request"):
    if not hmac.compare_digest(request.headers.get("x-gpu-token", ""), os.environ["GITA_GPU_TOKEN"]):
        raise HTTPException(status_code=401, detail="Sai GPU_TOKEN")
    body = await request.json()
    jobid = str(body.get("jobid", ""))
    if not re.fullmatch(r"[a-z0-9]{8,40}", jobid):
        raise HTTPException(status_code=400, detail="jobid không hợp lệ")
    await dao_dien.spawn.aio(jobid)
    return {"ok": True, "jobid": jobid}
