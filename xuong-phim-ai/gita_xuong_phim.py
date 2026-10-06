#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
GITA 365 · Xưởng phim AI — động cơ dựng phim từ cấu hình của app GITA.

Đọc file .json (xuất từ màn "Sản xuất phim AI") và chạy dây chuyền model MỞ:
  ảnh nhân vật nhất quán (SDXL + InstantID) → ảnh→video (CogVideoX I2V) →
  giọng (thu âm thật / VieNeu-TTS / Chatterbox) → lip-sync → nâng nét → ráp (ffmpeg).

Chạy trên Kaggle (GPU). Phần --plan chạy được mọi nơi (không cần GPU) để
kiểm cấu hình, dựng khung thư mục và RÁP phim từ các clip đã có.

  python gita_xuong_phim.py --config cau-hinh.json --plan
  python gita_xuong_phim.py --config cau-hinh.json --run all
  python gita_xuong_phim.py --config cau-hinh.json --run anh|video|giong|lipsync|rap

Thư mục chuẩn bị:  nhan-vat/<id>.png (ảnh mặt mẫu) · giong/<id>.wav (giọng mẫu)
Kết quả:           ket-qua/<id_phim>/{anh,clip,giong,phim-cuoi.mp4}
"""
import os, sys, json, argparse, subprocess, shutil, glob
from pathlib import Path

# ───────────────────────── Tiện ích ─────────────────────────
def log(*a): print("·", *a, flush=True)
def co_lenh(x): return shutil.which(x) is not None

def doc_cfg(p):
    with open(p, "r", encoding="utf-8") as f:
        cfg = json.load(f)
    # kiểm tối thiểu
    assert "phim" in cfg and "canh" in cfg, "File cấu hình thiếu 'phim' hoặc 'canh'."
    cfg.setdefault("pipeline", {})
    cfg.setdefault("nhan_vat", [])
    for i, c in enumerate(cfg["canh"]):
        c.setdefault("id", f"c{i+1}")
        c.setdefault("giay", 5)
        c.setdefault("thu_tu", i + 1)
    cfg["canh"].sort(key=lambda c: c.get("thu_tu", 0))
    return cfg

def thu_muc(cfg, root="ket-qua"):
    base = Path(root) / str(cfg["phim"]["id"])
    for d in ("anh", "clip", "giong", "tmp"):
        (base / d).mkdir(parents=True, exist_ok=True)
    return base

def nv_map(cfg):
    return {n["id"]: n for n in cfg.get("nhan_vat", [])}

# ───────────────────────── 0 · DỊCH VIỆT → ANH NỘI BỘ + NGỮ PHÁP MÁY QUAY ─────────────────────────
# SDXL (CLIP) và Wan hiểu tiếng Anh tốt hơn hẳn tiếng Việt. Dịch tại máy bằng MarianMT
# Helsinki-NLP/opus-mt-vi-en (mở, ~300MB, chạy CPU được) — không gửi văn bản ra ngoài.
_DICH = {}
def _co_dau_viet(t):
    return any(ch in t for ch in "ăâđêôơưáàảãạấầẩẫậắằẳẵặéèẻẽẹếềểễệíìỉĩịóòỏõọốồổỗộớờởỡợúùủũụứừửữựýỳỷỹỵ")
def dich_en(t):
    t = (t or "").strip()
    if not t or not _co_dau_viet(t.lower()): return t
    if t in _DICH: return _DICH[t]
    try:
        if "m" not in _DICH:
            from transformers import MarianMTModel, MarianTokenizer
            _DICH["tk"] = MarianTokenizer.from_pretrained("Helsinki-NLP/opus-mt-vi-en")
            _DICH["m"] = MarianMTModel.from_pretrained("Helsinki-NLP/opus-mt-vi-en")
        tk, m = _DICH["tk"], _DICH["m"]
        # dịch theo từng cụm (ngăn bởi dấu phẩy) để giữ nguyên từ khoá trigger LoRA
        ra = []
        for cum in [x.strip() for x in t.split(",") if x.strip()]:
            if cum.startswith("gita") and " " not in cum: ra.append(cum); continue
            if not _co_dau_viet(cum.lower()): ra.append(cum); continue
            ids = tk([cum], return_tensors="pt", truncation=True)
            ra.append(tk.decode(m.generate(**ids, max_new_tokens=80)[0], skip_special_tokens=True))
        _DICH[t] = ", ".join(ra)
    except Exception as e:
        log("  chưa dịch được (", str(e)[:60], ") → dùng nguyên tiếng Việt"); _DICH[t] = t
    return _DICH[t]

CO_CANH = {"dac_ta": "extreme close-up shot", "can": "close-up shot", "trung": "medium shot",
           "trung_rong": "medium wide shot", "toan": "wide establishing shot"}
GOC_MAY = {"ngang_mat": "eye-level angle", "thap": "low-angle shot", "cao": "high-angle shot",
           "qua_vai": "over-the-shoulder shot", "nghieng": "dutch angle"}
QUALITY_EN = ("photorealistic, cinematic film still, shot on ARRI Alexa, 35mm lens, natural skin texture, "
              "sharp focus, high detail, soft cinematic lighting, vertical 9:16 composition")
NEG_EN = ("cartoon, anime, 3d render, illustration, painting, drawing, stick figure, static photo, "
          "deformed face, distorted, extra fingers, blurry, low quality, watermark, text")

# Ngữ pháp diễn xuất: viết sẵn bằng tiếng Anh điện ảnh để mô hình diễn đúng cơ học cơ thể người thật
HANH_DONG_EN = {
    "di_bo": "walks naturally toward the camera, realistic gait, weight shifting from foot to foot, arms swinging slightly",
    "di_ngang": "walks across the frame from left to right at a natural pace, realistic gait",
    "chay": "runs with a dynamic natural stride, arms pumping, clothes and hair reacting to motion",
    "ngoi_xuong": "sits down onto the chair naturally, bending knees, hands resting on the armrest",
    "dung_len": "stands up from the chair naturally, pushing up with the hands",
    "cam_do": "reaches out and picks up {obj}, fingers wrapping around it correctly, natural grip",
    "dua_do": "hands {obj} to the other person, who reaches out and receives it with both hands",
    "bat_tay": "two people step closer and shake hands warmly, steady eye contact, genuine smiles",
    "om": "two people embrace in a warm hug, natural arm placement",
    "tro_chuyen": "two people talk face to face, natural hand gestures, nodding, taking turns to speak",
    "thuyet_trinh": "presents confidently to the audience with open-hand gestures, turning to point at the screen",
    "rot_tra": "pours tea from the teapot into a small cup, steady hands, liquid flowing realistically",
    "go_may": "types on a laptop keyboard, fingers moving naturally, glancing at the screen",
    "vay_tay": "waves hello toward the camera with a friendly smile",
    "gat_dau": "listens attentively and nods slowly, subtle facial expressions",
}
# Di máy do MÔ HÌNH quay trong không gian 3D (hậu kỳ không làm được)
MAY_MO_HINH_EN = {
    "bam_theo": "smooth tracking shot following the subject, gimbal stabilized",
    "xoay_quanh": "slow orbiting shot circling around the subject, parallax background",
    "cau_len": "crane shot rising up and revealing the scene",
    "truot_ngang": "lateral truck shot moving sideways with depth parallax",
    "dolly_zoom": "dolly zoom vertigo effect, background stretching while the subject stays the same size",
    "doi_net": "rack focus from the foreground to the subject, shallow depth of field",
    "fpv": "smooth FPV drone shot flying through the space",
    "ai": "dynamic cinematic camera movement",
}
CHAT_NGUOI = "anatomically correct hands and fingers, consistent face identity, realistic body mechanics, natural skin"

def _hanh_dong_en(c):
    k = c.get("hanh_dong") or ""
    if k not in HANH_DONG_EN: return ""
    return HANH_DONG_EN[k].replace("{obj}", dich_en(c.get("do_vat") or "") or "the object")

def prompt_anh_en(c):
    mq = c.get("may_quay_ao") or {}
    phu = c.get("nv_phu") or {}
    phan = [c.get("trigger") if c.get("co_lora") else "",
            phu.get("trigger") if phu.get("co_lora") else "",
            c.get("boi_canh_trigger") if c.get("boi_canh_lora") else "",
            "two people in the frame" if phu else "",
            dich_en(c.get("prompt_anh", "")), CO_CANH.get(mq.get("co"), ""), GOC_MAY.get(mq.get("goc"), ""), QUALITY_EN]
    return ", ".join(x for x in phan if x)

def prompt_video_en(c):
    # Di máy 2D (đẩy/kéo/lia/nghiêng/cầm tay/zoom giật) làm CHÍNH XÁC ở hậu kỳ → mô hình giữ máy yên.
    # Di máy 3D (bám theo, xoay vòng, cẩu, dolly zoom, flycam…) giao cho mô hình bằng ngữ pháp điện ảnh.
    mq = c.get("may_quay_ao") or {}
    chuyen = mq.get("chuyen", "tinh")
    may = MAY_MO_HINH_EN.get(chuyen) or "steady locked-off camera"
    phan = [_hanh_dong_en(c), dich_en(c.get("prompt_video", "")), may,
            "seamless continuation of the previous shot" if c.get("noi_tiep") else "",
            CHAT_NGUOI, "natural realistic motion, cinematic"]
    return ", ".join(x for x in phan if x)

def negative_en(c):
    return NEG_EN + ((", " + dich_en(c.get("negative", ""))) if c.get("negative") else "")

# ───────────────────────── 1 · ẢNH KHỞI ĐẦU (nhân vật khoá mặt + phim trường) ─────────────────────────
# InstantID chính chủ (repo InstantX/InstantID, bộ cài nội bộ đã tải sẵn vào ./InstantID):
#   ảnh mặt mẫu → embedding + điểm mốc khuôn mặt → SDXL giữ đúng người. Cộng thêm tối đa 2 LoRA:
#   LoRA nhân vật (lora/<id-nhân-vật>.safetensors) + LoRA phim trường (lora/<id-bối-cảnh>.safetensors).
W_ANH, H_ANH = 768, 1344           # dọc 9:16 (SDXL chạy đẹp nhất quanh 1 megapixel)
NEG_MAC_DINH = ("hoạt hình, anime, cartoon, 2D, tranh vẽ, người que, ảnh tĩnh, mấp máy môi, "
                "méo mặt, biến dạng, thừa ngón tay, mờ nhoè, chất lượng thấp")

def _instantid():
    """Trả (pipe, app_mat, draw_kps) nếu InstantID đã cài đủ; không thì None."""
    goc = Path("InstantID")
    if not (goc / "pipeline_stable_diffusion_xl_instantid.py").exists() or not (goc / "checkpoints" / "ip-adapter.bin").exists():
        log("InstantID chưa cài (chạy cai-dat-noi-bo.sh) → dùng SDXL + LoRA"); return None
    import torch
    sys.path.insert(0, str(goc.resolve()))
    from pipeline_stable_diffusion_xl_instantid import StableDiffusionXLInstantIDPipeline, draw_kps
    from diffusers.models import ControlNetModel
    from insightface.app import FaceAnalysis
    app = FaceAnalysis(name="antelopev2", root=str(goc), providers=["CUDAExecutionProvider", "CPUExecutionProvider"])
    app.prepare(ctx_id=0, det_size=(640, 640))
    cn = ControlNetModel.from_pretrained(str(goc / "checkpoints" / "ControlNetModel"), torch_dtype=torch.float16)
    pipe = StableDiffusionXLInstantIDPipeline.from_pretrained(
        "stabilityai/stable-diffusion-xl-base-1.0", controlnet=cn, torch_dtype=torch.float16)
    pipe.load_ip_adapter_instantid(str(goc / "checkpoints" / "ip-adapter.bin"))
    pipe.to("cuda")
    log("InstantID sẵn sàng — khoá mặt từ ảnh mẫu.")
    return pipe, app, draw_kps

def _kps_doc(anh_mat, info, draw_kps):
    """Điểm mốc khuôn mặt đặt lên khung dọc 9:16 (mặt ở 1/3 trên, đúng bố cục người dẫn)."""
    from PIL import Image
    kps = draw_kps(anh_mat, info["kps"])
    nen = Image.new("RGB", (W_ANH, H_ANH), (0, 0, 0))
    ty = W_ANH * 0.9 / kps.width
    kps = kps.resize((int(kps.width * ty), int(kps.height * ty)))
    nen.paste(kps, ((W_ANH - kps.width) // 2, int(H_ANH * 0.12)))
    return nen

def _nap_lora(pipe, ds):
    """ds = [(tệp, tên, trọng số)]. Nạp đồng thời nhiều LoRA; trả danh sách đã nạp."""
    ten, ts = [], []
    for tep, nm, w in ds:
        if not Path(tep).exists():
            log("  THIẾU LoRA", tep); continue
        try:
            pipe.load_lora_weights(str(Path(tep).parent), weight_name=Path(tep).name, adapter_name=nm)
            ten.append(nm); ts.append(w)
        except Exception as e:
            log("  không nạp được LoRA", tep, "(", str(e)[:80], ")")
    if ten:
        try: pipe.set_adapters(ten, adapter_weights=ts)
        except Exception: pass
        log("  LoRA:", ", ".join(ten))
    return ten

def buoc_anh(cfg, base):
    import torch
    from PIL import Image
    nvs = nv_map(cfg)
    iid = None
    try: iid = _instantid()
    except Exception as e: log("Không bật được InstantID (", str(e)[:120], ") → SDXL + LoRA")
    thuong = {}
    def sdxl():                              # SDXL thường — nạp khi cần (cảnh không có ảnh mặt mẫu)
        if "p" not in thuong:
            from diffusers import StableDiffusionXLPipeline
            p_ = StableDiffusionXLPipeline.from_pretrained("stabilityai/stable-diffusion-xl-base-1.0", torch_dtype=torch.float16, variant="fp16")
            p_.enable_model_cpu_offload(); thuong["p"] = p_
        return thuong["p"]
    for c in cfg["canh"]:
        out = base / "anh" / f"{c['id']}.png"
        if out.exists(): log("bỏ qua ảnh (đã có):", out.name); continue
        prompt = prompt_anh_en(c); neg = negative_en(c)
        log(f"  prompt EN: {prompt[:140]}")
        seed = int(str(c.get("seed") or nvs.get(c.get("nhan_vat"), {}).get("seed") or 0) or 0)
        g = torch.Generator("cuda").manual_seed(seed)
        mat = Path("nhan-vat") / f"{c.get('nhan_vat')}.png"
        dung_iid = bool(iid) and mat.exists()
        pipe = iid[0] if dung_iid else sdxl()
        if iid and not mat.exists(): log("  THIẾU ảnh mặt mẫu", mat, "→ SDXL + LoRA cho cảnh này")
        ds = []
        if c.get("co_lora"):       ds.append((f"lora/{c.get('nhan_vat')}.safetensors", "nv", 0.9))
        if c.get("boi_canh_lora"): ds.append((f"lora/{c.get('boi_canh_id')}.safetensors", "bc", 0.7))
        da = _nap_lora(pipe, ds) if ds else []
        if dung_iid:
            _, app, draw_kps = iid
            import cv2, numpy as np
            anh_mat = Image.open(mat).convert("RGB")
            faces = app.get(cv2.cvtColor(np.array(anh_mat), cv2.COLOR_RGB2BGR))
            if faces:
                info = sorted(faces, key=lambda x: (x.bbox[2]-x.bbox[0])*(x.bbox[3]-x.bbox[1]))[-1]
                img = pipe(prompt=prompt, negative_prompt=neg, image_embeds=info["embedding"],
                           image=_kps_doc(anh_mat, info, draw_kps), controlnet_conditioning_scale=0.8,
                           ip_adapter_scale=0.8, num_inference_steps=30, guidance_scale=5.0,
                           width=W_ANH, height=H_ANH, generator=g).images[0]
            else:
                log("  ảnh mẫu không thấy mặt rõ → SDXL + LoRA"); dung_iid = False
        if not dung_iid:
            if pipe is not thuong.get("p"):
                if da:
                    try: pipe.unload_lora_weights()
                    except Exception: pass
                pipe = sdxl(); da = _nap_lora(pipe, ds) if ds else []
            img = pipe(prompt=prompt, negative_prompt=neg, num_inference_steps=30, guidance_scale=5.0,
                       width=W_ANH, height=H_ANH, generator=g).images[0]
        img.save(out); log("ảnh xong:", out.name)
        if da:
            try: pipe.unload_lora_weights()
            except Exception: pass

# ───────────────────────── 2 · ẢNH → VIDEO (định tuyến nhiều động cơ) ─────────────────────────
# Mỗi cảnh mang "dong_co" do app quyết (cảnh chọn riêng > tập > tự chọn). Động cơ MỞ chạy ngay trên
# GPU; động cơ CÓ PHÍ (veo3/kling/runway/heygen) là ĐIỂM NỐI API — chưa có khoá hoặc chưa nối thì tự
# hạ về động cơ mở, KHÔNG bao giờ làm hỏng cả tập.
DONG_CO_PHI = {"veo3": "VEO_API_KEY", "veo3fast": "VEO_API_KEY", "kling": "KLING_API_KEY", "runway": "RUNWAY_API_KEY",
               "heygen": "HEYGEN_API_KEY", "seedance": "SEEDANCE_API_KEY", "wan_api": "FAL_KEY",
               "infinitetalk_api": "INFINITETALK_API_KEY"}
# Đường rẻ nhất đã tra (10/2026) — dùng khi nối _goi_api():
DUONG_RE = {"seedance": "Kie.ai Seedance 1.0 Pro ~ $0.03/s 720p", "wan_api": "fal.ai Wan 2.2 A14B ~ $0.08/s 720p",
            "infinitetalk_api": "WaveSpeed/Kie InfiniteTalk ~ $0.06/s 720p (fal đắt hơn ~3 lần)",
            "veo3fast": "Gemini API Veo 3.1 Fast ~ $0.10/s 720p", "kling": "Kling 3.0 I2V ~ $0.075/s",
            "heygen": "HeyGen API Digital Twin ~ $4/phút"}
TU_KHOP_MOI = {"infinitetalk", "infinitetalk_api", "veo3", "veo3fast", "heygen"}   # không cần lip-sync thêm

def _cogvideox():
    import torch
    from diffusers import CogVideoXImageToVideoPipeline
    pipe = CogVideoXImageToVideoPipeline.from_pretrained("THUDM/CogVideoX-5b-I2V", torch_dtype=torch.bfloat16)
    pipe.enable_sequential_cpu_offload(); pipe.vae.enable_tiling(); pipe.vae.enable_slicing()
    def chay(image, prompt, giay):
        return pipe(image=image, prompt=prompt, num_frames=49, guidance_scale=6,
                    num_inference_steps=50).frames[0], 8
    return chay

def vram_gb():
    try:
        import torch
        return torch.cuda.get_device_properties(0).total_memory / 1e9 if torch.cuda.is_available() else 0
    except Exception: return 0

def _wan():
    """Wan 2.2 chọn theo card: ≥70GB → A14B 720p (chất cao nhất) · ≥20GB → TI2V-5B 720p ·
    nhỏ hơn (T4/P100 16GB) → TI2V-5B 480p có đẩy bớt sang RAM. Dọc 9:16."""
    import torch
    from diffusers import WanImageToVideoPipeline
    v = vram_gb()
    if v >= 70: mid, w, h, fps, buoc = "Wan-AI/Wan2.2-I2V-A14B-Diffusers", 720, 1280, 16, 40
    elif v >= 20: mid, w, h, fps, buoc = "Wan-AI/Wan2.2-TI2V-5B-Diffusers", 704, 1280, 24, 40
    else: mid, w, h, fps, buoc = "Wan-AI/Wan2.2-TI2V-5B-Diffusers", 480, 832, 24, 30
    log(f"  Wan 2.2 · card {v:.0f}GB → {mid.split('/')[-1]} · {w}x{h} · {fps}fps")
    pipe = WanImageToVideoPipeline.from_pretrained(mid, torch_dtype=torch.bfloat16)
    if v >= 70: pipe.to("cuda")
    else: pipe.enable_model_cpu_offload()
    try: pipe.vae.enable_tiling()
    except Exception: pass
    def chay(image, prompt, giay):
        n = int(fps * float(giay)) // 4 * 4 + 1          # Wan cần số khung = 4k+1
        n = max(33, min(161 if fps == 24 else 121, n))
        img = image.resize((w, h))
        return pipe(image=img, prompt=prompt, negative_prompt=NEG_EN, height=h, width=w,
                    num_frames=n, num_inference_steps=buoc, guidance_scale=4.0).frames[0], fps
    return chay

def _ltx():
    import torch
    from diffusers import LTXImageToVideoPipeline
    pipe = LTXImageToVideoPipeline.from_pretrained("Lightricks/LTX-Video", torch_dtype=torch.bfloat16)
    pipe.enable_model_cpu_offload()
    def chay(image, prompt, giay):
        n = max(41, min(161, int(24 * float(giay)) // 8 * 8 + 1))
        return pipe(image=image, prompt=prompt, width=512, height=768, num_frames=n,
                    num_inference_steps=40).frames[0], 24
    return chay

TAO_DONG_CO = {"cogvideox": _cogvideox, "wan": _wan, "ltx": _ltx}
# FramePack là repo riêng (lllyasviel/FramePack): chưa cài thì dùng Wan cho cảnh dài.
HA_CAP = {"framepack": "wan", "veo3": "wan", "veo3fast": "wan", "kling": "wan", "runway": "wan", "auto": "wan",
          "seedance": "wan", "wan_api": "wan", "heygen": "infinitetalk", "infinitetalk_api": "infinitetalk",
          "infinitetalk": "wan", "longcat": "wan", "wan_animate": "wan"}   # chưa cài → Wan (+ lip-sync)

def _goi_api(dc, anh, prompt, giay, out):
    """ĐIỂM NỐI động cơ có phí. Viết hàm gọi API thật của nhà cung cấp vào đây khi có khoá.
    Trả True nếu đã tạo được `out`; False để hạ về động cơ mở."""
    if not os.environ.get(DONG_CO_PHI[dc]):
        log(f"  {dc}: chưa có {DONG_CO_PHI[dc]} → hạ về động cơ mở. Đường rẻ nhất: {DUONG_RE.get(dc,'-')}"); return False
    log(f"  {dc}: có khoá nhưng CHƯA NỐI API trong mã — điền hàm _goi_api() theo tài liệu nhà cung cấp."
        " Tạm hạ về động cơ mở."); return False

def _infinitetalk(anh, wav, prompt, out, wav2=None):
    """InfiniteTalk (MeiGen-AI, mở, Apache-2.0): ảnh + giọng → người nói cả thân, khớp môi, cử động
    đầu/tay. Có wav2 → bản HAI NGƯỜI (multi/infinitetalk.safetensors): người 1 nói, rồi người 2 đáp
    (audio_type "para"), cả hai cùng diễn trong một khung. Cần: bộ cài nội bộ mức day_du."""
    goc = Path("InfiniteTalk")
    w = goc / "weights"
    loai = "multi" if wav2 else "single"
    trong_so = w / "InfiniteTalk" / loai / "infinitetalk.safetensors"
    if not (goc / "generate_infinitetalk.py").exists() or not trong_so.exists():
        log(f"  InfiniteTalk ({loai}) chưa cài → hạ về Wan + lip-sync"); return False
    vao = out.parent.parent / "tmp" / f"it-{out.stem}.json"
    am = {"person1": str(Path(wav).resolve())}
    if wav2: am["person2"] = str(Path(wav2).resolve())
    j = {"prompt": prompt, "cond_video": str(Path(anh).resolve()), "cond_audio": am}
    if wav2: j["audio_type"] = "para"
    vao.write_text(json.dumps(j, ensure_ascii=False), encoding="utf-8")
    ra = out.with_suffix("")
    co = "infinitetalk-480"            # bản 480p (đã có trọng số); hậu kỳ GFPGAN + Real-ESRGAN nâng lên 1080p
    cmd = [sys.executable, str(goc / "generate_infinitetalk.py"),
           "--ckpt_dir", str(w / "Wan2.1-I2V-14B-480P"), "--wav2vec_dir", str(w / "chinese-wav2vec2-base"),
           "--infinitetalk_dir", str(trong_so),
           "--input_json", str(vao), "--size", co, "--sample_steps", "40",
           "--mode", "streaming", "--motion_frame", "9", "--num_persistent_param_in_dit", "0",
           "--save_file", str(ra)]
    try:
        subprocess.run(cmd, check=True)
        if Path(str(ra) + ".mp4").exists():
            shutil.move(str(ra) + ".mp4", str(out)); return True
    except Exception as e:
        log("  InfiniteTalk lỗi (", str(e)[:100], ") → hạ về Wan + lip-sync")
    return False

def _longcat(anh, prompt, neg, giay, out, truoc=None):
    """LongCat-Video (Meituan, MIT): cảnh dài liền mạch — đi, chạy, tương tác — bằng cách nối đoạn;
    `truoc` = clip cảnh trước để NỐI TIẾP. Cần card ~80GB và bộ cài mức day_du."""
    goc = Path("LongCat-Video").resolve(); ck = goc / "weights" / "LongCat-Video"
    if not (goc / "longcat_video").exists() or not ck.exists():
        log("  LongCat-Video chưa cài → hạ về Wan"); return False
    if vram_gb() < 40:
        log(f"  LongCat-Video cần card ~80GB (đang {vram_gb():.0f}GB) → hạ về Wan"); return False
    cmd = ["torchrun", "--nproc_per_node=1", str(Path(__file__).resolve().parent / "chay_longcat.py"),
           "--checkpoint_dir", str(ck), "--image", str(Path(anh).resolve()), "--prompt", prompt,
           "--negative", neg, "--out", str(out.resolve()), "--giay", str(giay),
           "--resolution", "720p" if vram_gb() >= 70 else "480p"]
    if truoc and Path(truoc).exists():
        cmd += ["--cond_video", str(Path(truoc).resolve()), "--stride", str(max(1, round(_fps(truoc) / 15)))]
    env = dict(os.environ, PYTHONPATH=str(goc) + os.pathsep + os.environ.get("PYTHONPATH", ""))
    try:
        subprocess.run(cmd, check=True, env=env)
        return out.exists()
    except Exception as e:
        log("  LongCat-Video lỗi (", str(e)[:100], ") → hạ về Wan"); return False

def _wan_animate(anh, video_mau, out, che_do="dien"):
    """Wan 2.2 Animate-14B (Apache-2.0) — MÁY QUAY NỘI BỘ: quay người thật làm động tác bằng điện thoại
      · che_do "dien": nhân vật GITA (ảnh khoá mặt) diễn y hệt động tác trong video mẫu
      · che_do "thay": thay người trong video quay thật bằng nhân vật GITA, giữ nguyên bối cảnh thật + chỉnh sáng
    Dùng repo chính chủ Wan-Video/Wan2.2 (tiền xử lý tư thế/khuôn mặt + generate.py)."""
    goc = Path("Wan2.2").resolve(); ck = goc / "Wan2.2-Animate-14B"
    if not (goc / "generate.py").exists() or not ck.exists():
        log("  Wan-Animate chưa cài → hạ về Wan"); return False
    xu_ly = out.parent.parent / "tmp" / f"animate-{out.stem}"
    xu_ly.mkdir(parents=True, exist_ok=True)
    tien = [sys.executable, "./wan/modules/animate/preprocess/preprocess_data.py",
            "--ckpt_path", str(ck / "process_checkpoint"), "--video_path", str(Path(video_mau).resolve()),
            "--refer_path", str(Path(anh).resolve()), "--save_path", str(xu_ly.resolve()),
            "--resolution_area", "1280", "720"]
    tien += (["--iterations", "3", "--k", "7", "--w_len", "1", "--h_len", "1", "--replace_flag"]
             if che_do == "thay" else ["--retarget_flag"])
    sinh = [sys.executable, "generate.py", "--task", "animate-14B", "--ckpt_dir", str(ck),
            "--src_root_path", str(xu_ly.resolve()), "--refert_num", "1", "--save_file", str(out.resolve())]
    if che_do == "thay": sinh += ["--replace_flag", "--use_relighting_lora"]
    try:
        subprocess.run(tien, check=True, cwd=str(goc)); subprocess.run(sinh, check=True, cwd=str(goc))
        return out.exists()
    except Exception as e:
        log("  Wan-Animate lỗi (", str(e)[:100], ") → hạ về Wan"); return False

def giu_tran_ngoai(cfg):
    """Xưởng nội bộ 90%: tổng giây cảnh chạy động cơ thuê ngoài không vượt `ngoai_toi_da` (mặc định
    0.10 = 10%) thời lượng tập. Xét theo thứ tự cảnh; cảnh vượt trần tự chuyển về động cơ mở."""
    tran = float(cfg.get("ngoai_toi_da", 1))
    if tran >= 1: return
    canh = cfg.get("canh", [])
    tong = sum(float(c.get("giay", 5)) for c in canh) or 1
    dung = 0.0
    for c in sorted(canh, key=lambda x: x.get("thu_tu", 0)):
        dc = c.get("dong_co") or cfg.get("dong_co") or "auto"
        if dc not in DONG_CO_PHI: continue
        g = float(c.get("giay", 5))
        if dung + g <= tong * tran: dung += g; continue
        mo = dc
        while mo in DONG_CO_PHI or mo == "framepack": mo = HA_CAP.get(mo, "wan")
        log(f"  trần thuê ngoài {int(tran*100)}%: cảnh {c['id']} {dc} → {mo} (nội bộ)")
        c["dong_co"] = mo
    log(f"thuê ngoài: {dung:.0f}s / {tong:.0f}s = {dung/tong*100:.0f}% (trần {int(tran*100)}%)")

def buoc_video(cfg, base):
    from diffusers.utils import load_image, export_to_video
    nap = {}                                              # nạp mỗi động cơ một lần
    def lay(dc):
        while dc not in TAO_DONG_CO: dc = HA_CAP.get(dc, "cogvideox")
        if dc not in nap:
            try: log("nạp động cơ:", dc); nap[dc] = TAO_DONG_CO[dc]()
            except Exception as e:
                log(f"  không nạp được {dc} ({str(e)[:100]}) → dùng CogVideoX")
                if dc == "cogvideox": raise
                nap[dc] = lay("cogvideox")
        return nap[dc]
    for c in cfg["canh"]:
        anh = base / "anh" / f"{c['id']}.png"
        out = base / "clip" / f"{c['id']}.mp4"
        if out.exists(): log("bỏ qua clip (đã có):", out.name); continue
        if not anh.exists(): log("THIẾU ảnh cho cảnh", c["id"], "→ chạy bước --run anh trước."); continue
        dc = c.get("dong_co") or cfg.get("dong_co") or "auto"
        prompt = prompt_video_en(c); giay = c.get("giay", 5)
        log(f"cảnh {c['id']} · động cơ: {dc}")
        if dc in DONG_CO_PHI and _goi_api(dc, anh, prompt, giay, out):
            c["_da_khop_moi"] = dc in TU_KHOP_MOI; continue
        mau = Path("dong-tac") / f"{c['id']}.mp4"                # video động tác quay thật (nếu có)
        if c.get("dong_tac") or dc == "wan_animate":
            if mau.exists() and _wan_animate(anh, mau, out, c.get("dong_tac") or "dien"):
                log("clip xong (Wan-Animate · diễn theo video thật):", out.name); continue
            if not mau.exists(): log("  chưa có", mau, "→ quay động tác bằng điện thoại rồi đặt vào; tạm dùng mô hình tự diễn")
        if dc in ("infinitetalk", "infinitetalk_api", "heygen"):
            w1, w2 = base / "giong" / f"{c['id']}-1.wav", base / "giong" / f"{c['id']}-2.wav"
            wav = base / "giong" / f"{c['id']}.wav"
            hai = w1.exists() and w2.exists()
            if (hai and _infinitetalk(anh, w1, prompt, out, w2)) or (not hai and wav.exists() and _infinitetalk(anh, wav, prompt, out)):
                c["_da_khop_moi"] = True; (base / "clip" / f"{c['id']}.ok-sync").touch()
                log("clip xong (InfiniteTalk" + (" · 2 người" if hai else "") + "):", out.name); continue
            if not wav.exists(): log("  chưa có giọng cảnh này → chạy --run giong trước; tạm dùng Wan")
        truoc = None
        if c.get("noi_tiep"):
            i = cfg["canh"].index(c)
            if i > 0: truoc = base / "clip" / f"{cfg['canh'][i-1]['id']}.mp4"
        if dc == "longcat" or (truoc is not None and truoc.exists() and vram_gb() >= 40):
            if _longcat(anh, prompt, negative_en(c), giay, out, truoc):
                log("clip xong (LongCat" + (" · nối tiếp cảnh trước" if truoc else "") + "):", out.name); continue
        frames, fps = lay(dc)(load_image(str(anh)), prompt, giay)
        export_to_video(frames, str(out), fps=fps)
        log("clip xong:", out.name)

# ───────────────────────── 3 · GIỌNG (nội bộ, giấy phép dùng thương mại được) ─────────────────────────
# Thứ tự ưu tiên cho MỖI cảnh có thoại:
#   1. thu-am/<id_cảnh>.wav — giọng THẬT của Trainer/MC thu sẵn (đẹp nhất, sạch bản quyền nhất).
#   2. Tiếng Việt → VieNeu-TTS (pip: vieneu · Apache-2.0) · tiếng Anh → Chatterbox (pip: chatterbox-tts · MIT).
#      Cả hai clone giọng từ giong/<giới-tuổi>.wav (3–10 giây).
#   3. XTTS v2 (Coqui) — giấy phép CPML CHỈ phi thương mại, và KHÔNG có tiếng Việt. Chỉ dùng cho tiếng Anh
#      khi chủ xưởng tự đặt COQUI_TOS_AGREED=1 sau khi đọc giấy phép.
_TTS = {}

def _vieneu():
    if "vi" not in _TTS:
        from vieneu import Vieneu
        _TTS["vi"] = Vieneu()
    return _TTS["vi"]

def _chatterbox():
    if "en" not in _TTS:
        from chatterbox.tts import ChatterboxTTS
        _TTS["en"] = ChatterboxTTS.from_pretrained(device="cuda" if vram_gb() else "cpu")
    return _TTS["en"]

def _xtts():
    if "xtts" not in _TTS:
        from TTS.api import TTS
        _TTS["xtts"] = TTS("tts_models/multilingual/multi-dataset/xtts_v2").to("cuda" if vram_gb() else "cpu")
    return _TTS["xtts"]

def doc_mot_cau(thoai, mau, lang, out):
    """Sinh giọng một cảnh. Trả tên bộ đã dùng, hoặc None."""
    if lang == "vi":
        try:
            m = _vieneu(); m.save(m.infer(thoai, ref_audio=str(mau)), str(out)); return "VieNeu-TTS"
        except Exception as e: log("  VieNeu-TTS chưa dùng được (", str(e)[:100], ")")
        return None
    try:
        import torchaudio as ta
        m = _chatterbox(); ta.save(str(out), m.generate(thoai, audio_prompt_path=str(mau)), m.sr); return "Chatterbox"
    except Exception as e: log("  Chatterbox chưa dùng được (", str(e)[:100], ")")
    if os.environ.get("COQUI_TOS_AGREED") == "1":
        try:
            _xtts().tts_to_file(text=thoai, speaker_wav=str(mau), language="en", file_path=str(out)); return "XTTS v2 (phi thương mại)"
        except Exception as e: log("  XTTS lỗi (", str(e)[:100], ")")
    return None

# Khớp CHẤT GIỌNG (OpenVoice V2, MIT): giữ nội dung + ngữ điệu bản đọc, chuyển âm sắc về đúng giọng mẫu
# của nhân vật — áp được cho tiếng Việt vì bộ chuyển âm sắc không phụ thuộc ngôn ngữ.
def _openvoice():
    if "ov" not in _TTS:
        from openvoice import se_extractor
        from openvoice.api import ToneColorConverter
        ck = Path("OpenVoice/checkpoints_v2/converter")
        if not (ck / "checkpoint.pth").exists(): raise FileNotFoundError("thiếu OpenVoice/checkpoints_v2")
        tc = ToneColorConverter(str(ck / "config.json"), device="cuda:0" if vram_gb() else "cpu")
        tc.load_ckpt(str(ck / "checkpoint.pth"))
        _TTS["ov"] = (tc, se_extractor, {})
    return _TTS["ov"]

def khop_chat_giong(wav, mau):
    try:
        tc, se, nho = _openvoice()
        if str(mau) not in nho: nho[str(mau)] = se.get_se(str(mau), tc, vad=True)[0]
        src = se.get_se(str(wav), tc, vad=True)[0]
        tmp = wav.with_name(wav.stem + "-ov.wav")
        tc.convert(audio_src_path=str(wav), src_se=src, tgt_se=nho[str(mau)], output_path=str(tmp))
        shutil.move(str(tmp), str(wav)); return True
    except Exception as e:
        log("  khớp chất giọng bỏ qua (", str(e)[:90], ")"); return False

# Chuỗi xử lý giọng chuẩn phát sóng (ffmpeg, chạy CPU): cắt ù trầm → khử ồn → bớt đục 200Hz → sáng rõ
# 3,5kHz → giảm xì → nén động → chuẩn âm lượng -16 LUFS (giọng) · cả phim chốt -14 LUFS (chuẩn Reels/YouTube)
MASTER_GIONG = ("highpass=f=75,afftdn=nf=-25,equalizer=f=200:t=q:w=1:g=-2,equalizer=f=3500:t=q:w=1.2:g=2.5,"
                "deesser=i=0.4,acompressor=threshold=-20dB:ratio=3:attack=5:release=80:makeup=2,"
                "loudnorm=I=-16:TP=-1.5:LRA=9,aresample=48000")

def master_giong(wav):
    if not co_lenh("ffmpeg"): return False
    tmp = wav.with_name(wav.stem + "-m.wav")
    r = subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(wav), "-af", MASTER_GIONG,
                        "-ac", "1", "-c:a", "pcm_s16le", str(tmp)])
    if r.returncode == 0 and tmp.exists(): shutil.move(str(tmp), str(wav)); return True
    log("  xử lý giọng lỗi — giữ bản gốc"); return False

def noi_hai_giong(w1, w2, out, nghi=0.3):
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(w1), "-i", str(w2), "-filter_complex",
                    f"[0:a]aresample=48000,apad=pad_dur={nghi}[a];[1:a]aresample=48000[b];[a][b]concat=n=2:v=0:a=1",
                    "-ac", "1", "-c:a", "pcm_s16le", str(out)], check=True)

def _mau_giong(key, nv_id):
    mau = Path("giong") / f"{key}.wav"
    if not mau.exists(): mau = Path("giong") / f"{nv_id}.wav"      # dự phòng theo nhân vật
    return mau

def buoc_giong(cfg, base):
    hk = cfg.get("hau_ky") or {}
    lang_tap = cfg.get("ngon_ngu") or "vi"
    def mot_cau(thoai, ten_thu_am, key, nv_id, out, lang):
        that = Path("thu-am") / f"{ten_thu_am}.wav"
        if that.exists():
            shutil.copy(that, out); log("giọng THẬT (thu âm):", out.name)
        else:
            mau = _mau_giong(key, nv_id)
            if not mau.exists():
                log("THIẾU giọng mẫu:", mau, "→ bỏ qua", out.name); return False
            bo = doc_mot_cau(thoai, mau, lang, out)
            if not bo:
                log("KHÔNG sinh được", out.name, "→ chạy cai-dat-noi-bo.sh, hoặc đặt thu-am/" + ten_thu_am + ".wav"); return False
            log("giọng xong:", out.name, "(", lang, "·", bo, ")")
            if hk.get("khopGiong", True) and khop_chat_giong(out, mau): log("  ✓ khớp chất giọng", mau.name)
        if hk.get("masterGiong", True) and master_giong(out): log("  ✓ xử lý giọng chuẩn phát sóng")
        return True
    for c in cfg["canh"]:
        thoai = (c.get("thoai") or "").strip()
        if not thoai: continue
        out = base / "giong" / f"{c['id']}.wav"
        if out.exists(): log("bỏ qua giọng (đã có):", out.name); continue
        lang = c.get("ngon_ngu") or lang_tap                 # khoá ngôn ngữ: vi / en
        phu, thoai2 = c.get("nv_phu") or {}, (c.get("thoai2") or "").strip()
        key = c.get("giong_key") or c.get("nhan_vat")
        if phu and thoai2:                                   # hội thoại hai người: người 1 nói, người 2 đáp
            w1, w2 = base / "giong" / f"{c['id']}-1.wav", base / "giong" / f"{c['id']}-2.wav"
            ok1 = w1.exists() or mot_cau(thoai, c["id"], key, c.get("nhan_vat"), w1, lang)
            ok2 = w2.exists() or mot_cau(thoai2, c["id"] + "-2", phu.get("giong_key") or phu.get("id"), phu.get("id"), w2, lang)
            if ok1 and ok2: noi_hai_giong(w1, w2, out); log("hội thoại 2 người:", out.name)
        else:
            mot_cau(thoai, c["id"], key, c.get("nhan_vat"), out, lang)

# ───────────────────────── 4 · LIP-SYNC (repo ngoài) ─────────────────────────
def buoc_lipsync(cfg, base):
    """Khớp môi người dẫn với giọng. Dùng LatentSync hoặc Wav2Lip (clone repo ngoài).
    Đây là ĐIỂM NỐI: cần cài repo trước; lệnh dưới là mẫu cho Wav2Lip."""
    for c in cfg["canh"]:
        if not c.get("lip_sync"): continue
        if c.get("_da_khop_moi") or ((c.get("dong_co") in TU_KHOP_MOI) and (base / "clip" / f"{c['id']}.ok-sync").exists()):
            log("bỏ lip-sync (động cơ đã khớp môi):", c["id"]); continue
        clip = base / "clip" / f"{c['id']}.mp4"
        wav = base / "giong" / f"{c['id']}.wav"
        out = base / "clip" / f"{c['id']}-lip.mp4"
        if not (clip.exists() and wav.exists()): continue
        if out.exists(): continue
        # Mẫu Wav2Lip (cần: git clone https://github.com/Rudrabha/Wav2Lip + checkpoint):
        cmd = ["python", "Wav2Lip/inference.py", "--checkpoint_path", "Wav2Lip/checkpoints/wav2lip_gan.pth",
               "--face", str(clip), "--audio", str(wav), "--outfile", str(out)]
        log("lip-sync (nếu đã cài Wav2Lip):", " ".join(cmd))
        try:
            subprocess.run(cmd, check=True)
            shutil.move(str(out), str(clip))  # thay clip gốc bằng bản đã khớp môi
            log("lip-sync xong:", c["id"])
        except Exception as e:
            log("bỏ qua lip-sync cảnh", c["id"], "(", str(e)[:80], ")")

# ───────────────────────── 5 · HẬU KỲ CAO CẤP NỘI BỘ (theo hau_ky của app) ─────────────────────────
# AI theo TỪNG KHUNG HÌNH: GFPGAN phục hồi mặt + Real-ESRGAN nâng nét x2 (gộp một lượt: GFPGAN dùng
# Real-ESRGAN làm bộ nâng nền). RIFE nội suy lên 60fps. Bộ cài nội bộ tải sẵn trọng số vào ./models.
# Thiếu công cụ nào thì dùng bộ lọc ffmpeg tương đương và GHI RÕ là bản thay thế.
def _ff(src, vf, dst):
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(src), "-vf", vf,
                    "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "16", "-c:a", "copy", str(dst)], check=True)

def _thong_so(clip):
    """(fps, số khung) — dùng ffprobe nếu có, không thì đọc từ ffmpeg -i."""
    import re
    if co_lenh("ffprobe"):
        try:
            r = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-count_packets",
                                "-show_entries", "stream=r_frame_rate,nb_read_packets", "-of", "csv=p=0", str(clip)],
                               capture_output=True, text=True).stdout.strip().split(",")
            a, b = r[0].split("/"); return float(a) / float(b), int(r[1])
        except Exception: pass
    try:
        e = subprocess.run(["ffmpeg", "-i", str(clip)], capture_output=True, text=True).stderr
        fps = float(re.search(r"([\d.]+) fps", e).group(1))
        h, m, sec = re.search(r"Duration: (\d+):(\d+):([\d.]+)", e).groups()
        return fps, max(2, round((int(h)*3600 + int(m)*60 + float(sec)) * fps))
    except Exception: return 24.0, 120

def _fps(clip): return _thong_so(clip)[0]

_AI = {}
def _bo_ai(mat, net):
    """Nạp GFPGAN / Real-ESRGAN một lần. Trả (restorer, upsampler) hoặc None nếu chưa cài."""
    k = (mat, net)
    if k in _AI: return _AI[k]
    res = None
    try:
        bg = None
        if net and Path("models/RealESRGAN_x2plus.pth").exists():
            from basicsr.archs.rrdbnet_arch import RRDBNet
            from realesrgan import RealESRGANer
            bg = RealESRGANer(scale=2, model_path="models/RealESRGAN_x2plus.pth",
                              model=RRDBNet(num_in_ch=3, num_out_ch=3, num_feat=64, num_block=23, num_grow_ch=32, scale=2),
                              tile=400, tile_pad=10, pre_pad=0, half=True)
        rs = None
        if mat and Path("models/GFPGANv1.4.pth").exists():
            from gfpgan import GFPGANer
            rs = GFPGANer(model_path="models/GFPGANv1.4.pth", upscale=2 if bg else 1, arch="clean",
                          channel_multiplier=2, bg_upsampler=bg)
        res = (rs, bg) if (rs or bg) else None
    except Exception as e:
        log("  GFPGAN/Real-ESRGAN chưa dùng được (", str(e)[:100], ")")
    _AI[k] = res
    return res

def _khung_ai(clip, tmpdir, mat, net):
    bo = _bo_ai(mat, net)
    if not bo: return False
    import cv2
    rs, bg = bo
    vao, ra = tmpdir / "khung-vao", tmpdir / "khung-ra"
    for d in (vao, ra):
        shutil.rmtree(d, ignore_errors=True); d.mkdir(parents=True)
    fps = _fps(clip)
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(clip), str(vao / "%06d.png")], check=True)
    ds = sorted(vao.glob("*.png"))
    for i, f in enumerate(ds):
        im = cv2.imread(str(f))
        if rs: _, _, im2 = rs.enhance(im, has_aligned=False, only_center_face=False, paste_back=True)
        else:  im2, _ = bg.enhance(im, outscale=2)
        cv2.imwrite(str(ra / f.name), im2)
        if i % 40 == 0: log(f"    khung {i+1}/{len(ds)}")
    moi = tmpdir / "ai.mp4"
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-framerate", f"{fps}", "-i", str(ra / "%06d.png"),
                    "-i", str(clip), "-map", "0:v", "-map", "1:a?", "-c:v", "libx264", "-pix_fmt", "yuv420p",
                    "-crf", "15", "-c:a", "copy", "-shortest", str(moi)], check=True)
    shutil.move(str(moi), str(clip))
    log("  AI theo khung xong:", "phục hồi mặt" if rs else "", "+ nâng nét x2" if bg else "")
    return True

def _rife(clip, tmpdir):
    goc = Path("Practical-RIFE")
    if not (goc / "inference_video.py").exists() or not (goc / "train_log").exists(): return False
    if _fps(clip) >= 50: return True
    out = tmpdir / "rife.mp4"
    try:
        subprocess.run([sys.executable, "inference_video.py", "--multi=2", f"--video={Path(clip).resolve()}",
                        f"--output={out.resolve()}"], cwd=str(goc), check=True)
        if out.exists():
            if _fps(out) < 50:   # nguồn 24fps → 48fps, ép đúng 60fps bằng ffmpeg
                _ff(out, "fps=60", tmpdir / "rife60.mp4"); shutil.move(str(tmpdir / "rife60.mp4"), str(out))
            shutil.move(str(out), str(clip)); return True
    except Exception as e:
        log("  RIFE lỗi (", str(e)[:80], ")")
    return False

def buoc_nang_net(cfg, base):
    hk = cfg.get("hau_ky") or {}
    if not co_lenh("ffmpeg"): log("THIẾU ffmpeg — bỏ qua hậu kỳ."); return
    for c in cfg["canh"]:
        clip = base / "clip" / f"{c['id']}.mp4"
        if not clip.exists(): continue
        tmp = base / "tmp" / f"hk-{c['id']}"; tmp.mkdir(parents=True, exist_ok=True)
        log("hậu kỳ cảnh", c["id"])
        mat, net = hk.get("giuMat", True), hk.get("napNet", True)
        if (mat or net) and not _khung_ai(clip, tmp, mat, net):
            log("  bản thay thế: nâng cỡ lanczos + làm sắc (không phải AI)")
            if net:
                _ff(clip, "scale=1080:1920:flags=lanczos:force_original_aspect_ratio=increase,crop=1080:1920,unsharp=5:5:0.6", tmp / "a.mp4")
                shutil.move(str(tmp / "a.mp4"), str(clip))
        loc = []
        if hk.get("onDinh"):   loc.append("deshake")
        if hk.get("khuNhieu"): loc.append("hqdn3d=1.5:1.5:6:6")
        if hk.get("chinhMau", True): loc.append("eq=contrast=1.06:saturation=1.08:gamma=0.98,curves=preset=medium_contrast")
        if loc:
            _ff(clip, ",".join(loc), tmp / "b.mp4"); shutil.move(str(tmp / "b.mp4"), str(clip))
        if hk.get("muot60", True) and not _rife(clip, tmp):
            log("  bản thay thế: nội suy 60fps bằng ffmpeg (RIFE chưa cài)")
            _ff(clip, "minterpolate=fps=60:mi_mode=mci:mc_mode=aobmc:vsbmc=1", tmp / "c.mp4")
            shutil.move(str(tmp / "c.mp4"), str(clip))
        shutil.rmtree(tmp, ignore_errors=True)
        log("  hậu kỳ xong:", clip.name)

# ───────────────────────── 5b · MÁY QUAY ẢO NỘI BỘ ─────────────────────────
# Di máy CHÍNH XÁC trên chính video đã dựng (không phải ảnh tĩnh): đẩy vào, kéo ra, lia, nghiêng,
# cầm tay. Phóng clip lên 4K trước rồi mới cắt khung, nên chuyển động máy không làm mờ hình.
def _so_khung(clip): return _thong_so(clip)[1]

def bieu_thuc_may(chuyen, cuong, N):
    K = 0.06 + 0.16 * max(0.0, min(1.0, float(cuong)))     # biên độ di máy
    t = f"(on/{N - 1})"
    ease = f"(0.5-0.5*cos(PI*{t}))"                        # tăng/giảm tốc mềm như tay máy thật
    cx, cy = "iw/2-(iw/zoom/2)", "ih/2-(ih/zoom/2)"
    if chuyen == "day_vao":   return f"1+{K}*{ease}", cx, cy
    if chuyen == "keo_ra":    return f"1+{K}*(1-{ease})", cx, cy
    if chuyen == "lia_phai":  return f"{1+K}", f"(iw-iw/zoom)*{ease}", cy
    if chuyen == "lia_trai":  return f"{1+K}", f"(iw-iw/zoom)*(1-{ease})", cy
    if chuyen == "nghieng_len":   return f"{1+K}", cx, f"(ih-ih/zoom)*(1-{ease})"
    if chuyen == "nghieng_xuong": return f"{1+K}", cx, f"(ih-ih/zoom)*{ease}"
    if chuyen == "zoom_giat":                                 # crash zoom: lao vào trong 1/4 đầu rồi giữ
        return f"1+{2*K}*(1-pow(1-min(1,{t}*4),3))", cx, cy
    if chuyen == "cam_tay":
        return ("1.07", f"(iw-iw/zoom)/2+(iw-iw/zoom)/2*{0.35+0.4*float(cuong)}*sin(on/9)",
                f"(ih-ih/zoom)/2+(ih-ih/zoom)/2*{0.35+0.4*float(cuong)}*cos(on/13)")
    return None

def buoc_may_quay(cfg, base, W=1080, Hh=1920):
    if not co_lenh("ffmpeg"): return
    for c in cfg["canh"]:
        mq = c.get("may_quay_ao") or {}
        chuyen = mq.get("chuyen", "tinh")
        clip = base / "clip" / f"{c['id']}.mp4"
        if chuyen == "tinh" or chuyen in MAY_MO_HINH_EN or not clip.exists(): continue
        N, fps = _so_khung(clip), _fps(clip)
        bt = bieu_thuc_may(chuyen, mq.get("cuong", 0.5), N)
        if not bt: continue
        z, x, y = bt
        vf = (f"scale={2*W}:{2*Hh}:flags=lanczos:force_original_aspect_ratio=increase,crop={2*W}:{2*Hh},"
              f"zoompan=z='{z}':x='{x}':y='{y}':d=1:s={W}x{Hh}:fps={fps:.3f}")
        tmp = base / "tmp" / f"mq-{c['id']}.mp4"
        try:
            _ff(clip, vf, tmp); shutil.move(str(tmp), str(clip)); log("máy quay ảo:", c["id"], "·", chuyen)
        except Exception as e:
            log("  máy quay ảo lỗi cảnh", c["id"], "(", str(e)[:80], ")")

# ───────────────────────── 6 · PHỤ ĐỀ + THẺ TÊN (ASS, chuẩn Reels) ─────────────────────────
# Phụ đề lấy từ CHÍNH thoại đã duyệt (không nghe lại → không sai chính tả), cắt theo chuẩn phát sóng:
# tối đa 2 dòng × 32 ký tự (khổ dọc), ngắt ở dấu câu, thời gian chia theo độ dài giọng THẬT của từng cảnh.
TOI_DA_DONG = 32          # khổ dọc 9:16 (chuẩn 42 ký tự của Netflix là cho khổ ngang)
CHUC_DANH = {"trainer": "Chuyên gia đào tạo · GITA365", "mc": "Dẫn chương trình · GITA365"}

def _do_dai(f):
    """Thời lượng (giây) của tệp âm thanh/video — ffprobe nếu có, không thì đọc dòng Duration của ffmpeg."""
    if co_lenh("ffprobe"):
        r = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(f)],
                           capture_output=True, text=True)
        try: return float(r.stdout.strip())
        except ValueError: pass
    r = subprocess.run(["ffmpeg", "-hide_banner", "-i", str(f)], capture_output=True, text=True)
    import re
    m = re.search(r"Duration: (\d+):(\d+):([\d.]+)", r.stderr)
    return int(m.group(1)) * 3600 + int(m.group(2)) * 60 + float(m.group(3)) if m else 0.0

def cat_cau(text, toi_da=TOI_DA_DONG):
    """Cắt thoại thành các khung phụ đề: mỗi câu tách riêng, mỗi khung ≤ 2 dòng, mỗi dòng ≤ toi_da ký tự,
    ngắt ưu tiên ở dấu phẩy, và CÂN hai dòng cuối để không còn chữ lẻ trơ trọi (vd "đình.")."""
    import re
    khung = []
    for cau in [x for x in re.split(r"(?<=[.!?…;])\s+", text.strip()) if x]:
        dong, cur = [], ""
        for w in cau.split():
            if cur and len(cur) + 1 + len(w) > toi_da: dong.append(cur); cur = ""
            cur = (cur + " " + w).strip()
            if w[-1] in ",:" and len(cur) > toi_da * 0.6: dong.append(cur); cur = ""
        if cur: dong.append(cur)
        if len(dong) >= 2 and len(dong[-1]) < toi_da * 0.35:          # cân lại hai dòng cuối
            ws = (dong[-2] + " " + dong[-1]).split()
            tot, i = None, 1
            for j in range(1, len(ws)):
                a1, a2 = " ".join(ws[:j]), " ".join(ws[j:])
                if len(a1) <= toi_da and len(a2) <= toi_da:
                    lech = abs(len(a1) - len(a2))
                    if tot is None or lech < tot: tot, i = lech, j
            if tot is not None: dong[-2:] = [" ".join(ws[:i]), " ".join(ws[i:])]
        for k in range(0, len(dong), 2): khung.append(dong[k:k + 2])
    return khung

def _ass_t(t):
    t = max(0.0, t); h = int(t // 3600); m = int(t % 3600 // 60); s = t % 60
    return f"{h}:{m:02d}:{s:05.2f}"

def _ass_txt(x): return x.replace("\\", "").replace("{", "(").replace("}", ")")

def _font():
    for f in ["fonts/BeVietnamPro-Bold.ttf"]:
        if Path(f).exists(): return "Be Vietnam Pro"
    return "DejaVu Sans"

def dung_ass(cfg, lich, out, phu_de=True, the_ten=True, W=1080, H=1920):
    """lich = [(cảnh, bắt đầu, thời lượng, [(thoại, giây giọng)…])] theo thời lượng THẬT sau khi ráp."""
    f = _font()
    doc = H >= W                                            # dọc 9:16 hay ngang 16:9
    toi_da = TOI_DA_DONG if doc else 42
    co_pd, mv_pd, mv_ten = (56, 330, 560) if doc else (48, 70, 170)
    dau = (f"[Script Info]\nScriptType: v4.00+\nPlayResX: {W}\nPlayResY: {H}\nWrapStyle: 2\n\n"
           "[V4+ Styles]\nFormat: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, "
           "Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, "
           "Alignment, MarginL, MarginR, MarginV, Encoding\n"
           f"Style: PhuDe,{f},{co_pd},&H00FFFFFF,&H00FFFFFF,&H00101010,&H64000000,-1,0,0,0,100,100,0,0,1,4,1,2,80,80,{mv_pd},1\n"
           f"Style: TenNV,{f},46,&H00FFFFFF,&H00FFFFFF,&H005A2E0F,&H005A2E0F,-1,0,0,0,100,100,0,0,3,16,0,1,70,70,{mv_ten},1\n\n"
           "[Events]\nFormat: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n")
    ev, da_gioi_thieu = [], set()
    nvs = nv_map(cfg)
    for c, bd, dd, cau in lich:
        if the_ten:
            for ai in [c.get("nhan_vat")] + ([(c.get("nv_phu") or {}).get("id")] if c.get("nv_phu") else []):
                n = nvs.get(ai) or {}
                if ai and ai not in da_gioi_thieu and n.get("vai") in CHUC_DANH:
                    da_gioi_thieu.add(ai)
                    t0 = bd + 0.4; t1 = min(bd + dd - 0.2, t0 + 3.2)
                    ev.append(f"Dialogue: 1,{_ass_t(t0)},{_ass_t(t1)},TenNV,,0,0,0,,{{\\fad(250,250)}}"
                              f"{_ass_txt(n.get('ten',''))}\\N{{\\fs32\\b0}}{CHUC_DANH[n['vai']]}")
                    break
        if not phu_de: continue
        t = bd + 0.1
        for thoai, gl in cau:
            k = cat_cau(thoai, toi_da)
            tong = sum(len(" ".join(x)) for x in k) or 1
            for x in k:
                d = max(0.8, gl * len(" ".join(x)) / tong)
                chu = "\\N".join(_ass_txt(l) for l in x)
                ev.append(f"Dialogue: 0,{_ass_t(t)},{_ass_t(min(t + d, bd + dd))},PhuDe,,0,0,0,,{chu}")
                t += d
            t += 0.3
    Path(out).write_text(dau + "\n".join(ev) + "\n", encoding="utf-8")
    return len(ev)

def buoc_phu_de(cfg, base):
    if (cfg.get("hau_ky") or {}).get("phuDe") is False:
        log("Phụ đề: tắt theo cài đặt hậu kỳ."); return
    log("Phụ đề + thẻ tên được dựng trong bước ráp, theo thời lượng THẬT của từng cảnh (2 dòng × 32 ký tự, khổ dọc).")

# ───────────────────────── 7 · RÁP PHIM (ffmpeg) ─────────────────────────
def buoc_rap(cfg, base, W=1080, Hh=1920, fps=None):
    hk = cfg.get("hau_ky") or {}
    fps = fps or (60 if hk.get("muot60") else 30)
    if not co_lenh("ffmpeg"):
        log("THIẾU ffmpeg — cài ffmpeg rồi chạy lại bước ráp."); return
    segs, lich, t = [], [], 0.0
    tmp = base / "tmp"
    for c in cfg["canh"]:
        clip = base / "clip" / f"{c['id']}.mp4"
        if not clip.exists():
            log("bỏ cảnh (chưa có clip):", c["id"]); continue
        d = float(c.get("giay", 5)); wav = base / "giong" / f"{c['id']}.wav"
        seg = tmp / f"seg-{c['id']}.mp4"
        dv = _do_dai(clip)
        gl = _do_dai(wav) if wav.exists() else 0.0
        # Không bao giờ cắt mất lời: cảnh dài ít nhất bằng giọng + 0,3s; clip ngắn hơn thì giữ khung cuối.
        if (base / "clip" / f"{c['id']}.ok-sync").exists(): T = max(dv, gl + 0.1)   # clip khớp môi = dài bằng giọng
        else: T = max(d, gl + 0.3 if gl else 0)
        vf = (f"scale={W}:{Hh}:force_original_aspect_ratio=increase,crop={W}:{Hh},fps={fps},"
              f"tpad=stop_mode=clone:stop_duration={max(0.0, T - dv) + 0.1:.2f}")
        am = ["-i", str(wav)] if wav.exists() else ["-f", "lavfi", "-i", "anullsrc=r=48000:cl=stereo"]
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(clip)] + am +
                       ["-vf", vf, "-af", "aresample=48000,apad", "-t", f"{T:.3f}", "-map", "0:v:0", "-map", "1:a:0",
                        "-c:v", "libx264", "-preset", "medium", "-crf", "16", "-pix_fmt", "yuv420p",
                        "-c:a", "aac", "-b:a", "192k", "-ac", "2", str(seg)], check=True)
        segs.append(seg)
        cau = []
        w1, w2 = base / "giong" / f"{c['id']}-1.wav", base / "giong" / f"{c['id']}-2.wav"
        if (c.get("thoai") or "").strip():
            if w1.exists() and w2.exists() and (c.get("thoai2") or "").strip():
                cau = [(c["thoai"].strip(), _do_dai(w1)), (c["thoai2"].strip(), _do_dai(w2))]
            else:
                cau = [(c["thoai"].strip(), gl or T - 0.3)]
        dt = _do_dai(seg) or T
        lich.append((c, t, dt, cau)); t += dt
    if not segs:
        log("Không có cảnh nào để ráp."); return
    lst = tmp / "danh-sach.txt"
    lst.write_text("".join(f"file '{s.resolve()}'\n" for s in segs), encoding="utf-8")
    tho = tmp / "phim-tho.mp4"
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", str(lst), "-c", "copy", str(tho)], check=True)
    # Tiếng: nhạc nền tự HẠ khi có lời (sidechain) → chốt cả phim -14 LUFS, đỉnh -1 dBTP (chuẩn Reels/YouTube)
    nhac = sorted(glob.glob("nhac/*.mp3") + glob.glob("nhac/*.wav") + glob.glob("nhac/*.m4a"))
    chot = "loudnorm=I=-14:TP=-1.0:LRA=11,aresample=48000"
    tron = tmp / "phim-tieng.mp4"
    if hk.get("nhacNen", True) and nhac:
        fc = ("[0:a]asplit=2[v1][v2];[1:a]aresample=48000,volume=0.5[m];"
              "[m][v2]sidechaincompress=threshold=0.02:ratio=10:attack=15:release=350[md];"
              f"[v1][md]amix=inputs=2:duration=first:dropout_transition=0,{chot}[a]")
        cmd = ["ffmpeg", "-y", "-loglevel", "error", "-i", str(tho), "-stream_loop", "-1", "-i", nhac[0],
               "-filter_complex", fc, "-map", "0:v", "-map", "[a]"]
        log("nhạc nền:", Path(nhac[0]).name, "· tự hạ khi có lời")
    else:
        if hk.get("nhacNen", True): log("Nhạc nền: bật nhưng chưa có tệp trong nhac/ — bỏ qua.")
        cmd = ["ffmpeg", "-y", "-loglevel", "error", "-i", str(tho), "-af", chot, "-map", "0:v", "-map", "0:a"]
    subprocess.run(cmd + ["-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-shortest", str(tron)], check=True)
    out = base / "phim-cuoi.mp4"
    fd = ["fontsdir=fonts"] if Path("fonts").exists() else []
    def khac(ass, dich):
        loc = ":".join([f"filename='{Path(ass).resolve().as_posix()}'"] + fd)
        r = subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(tron), "-vf", f"ass={loc}",
                            "-c:v", "libx264", "-crf", "16", "-pix_fmt", "yuv420p", "-c:a", "copy", str(dich)])
        return r.returncode == 0
    the = hk.get("theTen", True)
    ass_ten = tmp / "the-ten.ass"
    if the and dung_ass(cfg, lich, ass_ten, phu_de=False, the_ten=True, W=W, H=Hh) and khac(ass_ten, out):
        log("đã gắn thẻ tên nhân vật")
    else:
        shutil.copy(tron, out)
    if hk.get("phuDe", True):
        ass_pd = tmp / "phu-de.ass"
        if dung_ass(cfg, lich, ass_pd, phu_de=True, the_ten=the, W=W, H=Hh) and khac(ass_pd, base / "phim-cuoi-phude.mp4"):
            log("phim có phụ đề:", base / "phim-cuoi-phude.mp4")
    log("✅ PHIM CUỐI:", out, f"· {t:.1f}s")

# ───────────────────────── Điều phối ─────────────────────────
BUOC = {"anh":buoc_anh, "video":buoc_video, "giong":buoc_giong, "may_quay":buoc_may_quay,
        "lipsync":buoc_lipsync, "nang_net":buoc_nang_net, "phu_de":buoc_phu_de, "rap":buoc_rap}
THU_TU = ["anh","giong","video","lipsync","nang_net","may_quay","phu_de","rap"]   # giọng TRƯỚC video: InfiniteTalk cần giọng

def plan(cfg, base):
    log("PHIM:", cfg["phim"]["ten"], "| cảnh:", len(cfg["canh"]),
        "| tổng ~", sum(c.get("giay",5) for c in cfg["canh"]), "giây")
    log("Pipeline:", json.dumps(cfg.get("pipeline",{}), ensure_ascii=False))
    log("Hậu kỳ:", json.dumps(cfg.get("hau_ky",{}), ensure_ascii=False))
    for c in cfg["canh"]:
        print(f"   #{c.get('thu_tu')} [{c.get('nhan_vat')}] {c.get('loai')} · {c.get('giay')}s"
              f" · lip-sync={bool(c.get('lip_sync'))} · động cơ={c.get('dong_co') or cfg.get('dong_co','auto')}")
        print(f"      ẢNH : {c.get('prompt_anh','')[:90]}")
        print(f"      VIDEO: {c.get('prompt_video','')[:90]}")
        if c.get("thoai"): print(f"      THOẠI: {c['thoai'][:90]}")
    log("Thư mục làm việc:", base)
    log("Đặt ảnh mặt mẫu vào nhan-vat/<id>.png, giọng mẫu vào giong/<id>.wav.")
    # Nếu đã có clip thì thử ráp luôn (không cần GPU)
    if any((base/"clip"/f"{c['id']}.mp4").exists() for c in cfg["canh"]):
        log("Phát hiện clip sẵn → thử ráp phim bằng ffmpeg…")
        buoc_phu_de_an_toan(cfg, base); buoc_rap(cfg, base)

def buoc_phu_de_an_toan(cfg, base):
    # Phụ đề từ thoại không cần GPU
    try:
        def ts(t):
            h=int(t//3600); m=int((t%3600)//60); s=t%60
            return f"{h:02d}:{m:02d}:{s:06.3f}".replace(".",",")
        srt=base/"tmp"/"phu-de.srt"; lines=[]; t=0.0; i=1
        for c in cfg["canh"]:
            d=float(c.get("giay",5)); thoai=(c.get("thoai") or "").strip()
            if thoai: lines.append(f"{i}\n{ts(t)} --> {ts(t+d)}\n{thoai}\n"); i+=1
            t+=d
        srt.write_text("\n".join(lines), encoding="utf-8")
    except Exception as e:
        log("bỏ qua phụ đề:", str(e)[:80])

def main():
    ap=argparse.ArgumentParser(description="GITA xưởng phim AI — động cơ Kaggle")
    ap.add_argument("--config", required=True, help="file .json xuất từ app GITA")
    ap.add_argument("--plan", action="store_true", help="chỉ kiểm & dựng khung (không GPU); ráp nếu có clip")
    ap.add_argument("--run", default="", help="all | " + " | ".join(THU_TU))
    ap.add_argument("--root", default="ket-qua")
    a=ap.parse_args()
    cfg=doc_cfg(a.config); base=thu_muc(cfg, a.root)
    giu_tran_ngoai(cfg)                                  # xưởng nội bộ: giữ trần thuê ngoài
    if a.plan or not a.run:
        plan(cfg, base);
        if not a.run: return
    steps = THU_TU if a.run=="all" else [s for s in a.run.split(",") if s in BUOC]
    if not steps: log("Không có bước hợp lệ. Dùng --run all hoặc", THU_TU); return
    for s in steps:
        log("━━ BƯỚC:", s, "━━"); BUOC[s](cfg, base)
    log("Xong các bước:", steps)

if __name__=="__main__":
    main()
