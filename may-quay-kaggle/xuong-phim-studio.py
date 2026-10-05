# ═══════════════════════════════════════════════════════════════
#  GITA 365 · XƯỞNG PHIM AI V21 — SẢN XUẤT PHIM HOÀN CHỈNH (0 ĐỒNG)
#
#  Dây chuyền trên GPU T4 miễn phí của Kaggle (đã được chủ hệ duyệt):
#    đề bài → TỰ VIẾT KỊCH BẢN (mẫu GITA / LLM Qwen2.5) → quay từng
#    cảnh bằng LTX-Video với ẢNH NHÂN VẬT ĐÃ KHÓA → đọc thoại edge-tts
#    đúng giọng vai → khớp môi (MuseTalk, dự phòng Wav2Lip) → chấm
#    điểm QC tự quay lại cảnh xấu → ghép FFmpeg + phụ đề SRT +
#    intro/outro GITA → nộp MP4 hoàn chỉnh về máy chủ.
#
#  CÁCH DÙNG (làm một lần, ~15 phút):
#    1. kaggle.com → New Notebook → Settings → Accelerator → GPU T4,
#       Internet → On.
#    2. Add-ons → Secrets → thêm GITA_KHOA_QUAY (khoá xưởng quay, lấy
#       ở GitHub secret GITA_KHOA_XUONG_QUAY của kho GITA365-WEB).
#    3. Dán TOÀN BỘ tệp này vào ô code → bấm Run. Máy tự nhận việc
#       'film' (đặt từ web app, Super Admin → quayPhimMoi) và 'tts'
#       (đọc thoại), làm xong tự nộp về máy chủ. Phiên tối đa ~9 giờ;
#       hết giờ bấm Run lại — việc dở tự chạy tiếp (resume).
#
#  NHÂN VẬT CHUẨN: máy tải bộ ảnh khóa (trainer/MC/giảng viên...) từ
#  máy chủ qua /quay/nvchuan. Nhân vật nào CHƯA khóa ảnh thì máy quay
#  cảnh đó bằng text-to-video và in CẢNH BÁO — danh tính không bảo
#  đảm cho tới khi chủ hệ khóa ảnh bằng tools/dat-nhan-vat-chuan.mjs.
#
#  Không in lời thoại/kịch bản ra nhật ký công khai; chỉ in mã việc,
#  thời gian và điểm QC.
# ═══════════════════════════════════════════════════════════════

import os, io, re, gc, json, time, subprocess, sys
from pathlib import Path

MAY_CHU = "https://gita365.typhuquanggita.workers.dev"
TEN_MAY = "kaggle-studio-" + str(int(time.time()))
STUDIO = Path("/kaggle/working/xuong-phim")
for d in ("jobs", "clips", "audio", "subs", "final", "assets/nvchuan"):
    (STUDIO / d).mkdir(parents=True, exist_ok=True)

# ── CÔNG TẮC VẬN HÀNH ──
LLM_ON = False            # True = Qwen2.5-7B (4-bit) viết kịch bản thay mẫu sẵn
LIPSYNC_ENGINE = "musetalk"   # "musetalk" | "wav2lip" | "off"
QC_ON = True              # chấm điểm nét/chuyển động, tự quay lại cảnh xấu
BRAND = {"ten": "GITA365", "slogan": "Đánh thức tiềm năng — Bứt phá giới hạn"}

CFG = dict(width=768, height=416, fps=24, frames=73, steps=8, guidance=3.0)
NEG = "blurry, low quality, distorted face, watermark, text, subtitles, glitch, deformed hands"


# ── KHOÁ VÀ GỌI MÁY CHỦ ──
def lay_khoa():
    k = os.environ.get("GITA_KHOA_QUAY", "").strip()
    if k:
        return k
    try:
        from kaggle_secrets import UserSecretsClient
        return UserSecretsClient().get_secret("GITA_KHOA_QUAY").strip()
    except Exception:
        return ""

KHOA = lay_khoa()
assert len(KHOA) >= 32, "Thiếu khoá. Vào Add-ons → Secrets, thêm GITA_KHOA_QUAY rồi Run lại."

import urllib.request

# Cloudflare Bot Fight Mode chặn UA mặc định "Python-urllib/3.x" (lỗi 403,
# mã 1010) trước cả khi tới kiểm tra khoá — phải mang UA giống trình duyệt.
UA_TRINH_DUYET = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                  "AppleWebKit/537.36 (KHTML, like Gecko) "
                  "Chrome/124.0.0.0 Safari/537.36")

def goi(duong, phuong_thuc="GET", than=None, kieu=None):
    req = urllib.request.Request(
        MAY_CHU + duong, data=than, method=phuong_thuc,
        headers={"X-Khoa-Quay": KHOA,
                 "User-Agent": UA_TRINH_DUYET,
                 "Content-Type": kieu or "application/json"})
    with urllib.request.urlopen(req, timeout=300) as r:
        return r.status, r.read()

def nhan_viec():
    _, b = goi("/quay/nhan", "POST",
               json.dumps({"may": TEN_MAY, "loai": "film,tts"}).encode())
    return json.loads(b.decode())

def bao_song():
    try:
        goi("/quay/song", "POST", json.dumps({"may": TEN_MAY}).encode())
    except Exception:
        pass

def bao_loi(ma, loi):
    try:
        goi("/quay/loi/" + ma, "POST",
            json.dumps({"loi": str(loi)[:180]}).encode())
    except Exception:
        pass

def nop_ket_qua(ma, tep, kieu):
    with open(tep, "rb") as f:
        goi("/quay/kq/" + ma, "PUT", f.read(), kieu)


# ── BỘ NHÂN VẬT CHUẨN (ảnh khóa tải từ máy chủ) ──
def tai_nhan_vat():
    """Trả về {id: {ten, giong, promptEn, refs: [Path]}} — chỉ nhân vật đã khóa ảnh."""
    try:
        _, b = goi("/quay/nvchuan")
        ds = json.loads(b.decode()).get("ds", [])
    except Exception as e:
        print("⚠️ Không tải được bộ nhân vật chuẩn:", e)
        return {}
    cast = {}
    for nv in ds:
        refs = []
        for i, r in enumerate(nv.get("refs", [])):
            ext = ".png" if r.get("mime") == "image/png" else ".jpg"
            p = STUDIO / "assets" / "nvchuan" / (nv["id"] + "_" + str(i) + ext)
            try:
                if not p.exists():
                    _, anh = goi("/quay/nvchuan/" + r["ma"])
                    p.write_bytes(anh)
                refs.append(p)
            except Exception as e:
                print("⚠️ Tải ảnh khóa lỗi (%s ref %d): %s" % (nv["id"], i, e))
        if refs:
            cast[nv["id"]] = {"ten": nv.get("ten", nv["id"]),
                              "giong": nv.get("giong", "vi-VN-NamMinhNeural"),
                              "promptEn": nv.get("promptEn", ""),
                              "refs": refs}
    print("🎭 Nhân vật đã khóa:", ", ".join(cast) or "(chưa có — cảnh sẽ quay text-to-video, danh tính KHÔNG bảo đảm)")
    return cast


# ── NẠP THƯ VIỆN + MÔ HÌNH VIDEO ──
# Dọn cache cũ để tránh "No space left on device" trên Kaggle (20GB)
subprocess.run([sys.executable, "-m", "pip", "cache", "purge"], capture_output=True)
subprocess.run(["rm", "-rf", "/root/.cache/huggingface"], capture_output=True)
subprocess.run(["rm", "-rf", "/root/.cache/torch"], capture_output=True)
os.environ["HF_HOME"] = "/kaggle/working/.cache/huggingface"
os.environ["TORCH_HOME"] = "/kaggle/working/.cache/torch"

subprocess.run([sys.executable, "-m", "pip", "install", "-q",
                "diffusers>=0.32", "transformers", "accelerate", "sentencepiece",
                "imageio[ffmpeg]", "edge-tts", "opencv-python-headless", "numpy"], check=True)

import torch
assert torch.cuda.is_available(), "Chưa bật GPU: Settings → Accelerator → GPU T4 rồi Run lại."
from PIL import Image
from diffusers.utils import export_to_video

def free():
    gc.collect()
    torch.cuda.empty_cache()

_ong_i2v = None
_ong_t2v = None

def ong_i2v():
    global _ong_i2v
    if _ong_i2v is None:
        from diffusers import LTXImageToVideoPipeline
        print("Đang tải LTX-Video 0.9.7-distilled (I2V, chỉ lần đầu)...", flush=True)
        p = LTXImageToVideoPipeline.from_pretrained(
            "Lightricks/LTX-Video-0.9.7-distilled", torch_dtype=torch.float16)
        p.enable_model_cpu_offload()
        p.vae.enable_tiling()
        _ong_i2v = p
    return _ong_i2v

def ong_t2v():
    global _ong_t2v
    if _ong_t2v is None:
        from diffusers import LTXPipeline
        print("Đang tải LTX-Video 0.9.7-distilled (T2V, chỉ lần đầu)...", flush=True)
        p = LTXPipeline.from_pretrained(
            "Lightricks/LTX-Video-0.9.7-distilled", torch_dtype=torch.float16)
        p.enable_model_cpu_offload()
        p.vae.enable_tiling()
        _ong_t2v = p
    return _ong_t2v


# ── MÁY VIẾT KỊCH BẢN (mẫu GITA, bám hành trình 5 tầng) ──
TEMPLATES = {
    "dao_tao": ["Mở đầu: giới thiệu vấn đề", "Tại sao vấn đề này quan trọng",
                "Nội dung chính thứ nhất", "Nội dung chính thứ hai",
                "Ví dụ thực tế dễ hiểu", "Lỗi thường gặp cần tránh",
                "Tổng kết và lời kêu gọi hành động"],
    "huan_luyen": ["Chào mở và khởi động năng lượng", "Mục tiêu buổi huấn luyện",
                   "Hoạt động trải nghiệm chính", "Phân tích và rút ra bài học",
                   "Thực hành theo nhóm", "Cam kết hành động sau buổi học"],
    "hotro_khach": ["Chào hỏi và lắng nghe khách hàng", "Xác định đúng vấn đề",
                    "Giải pháp bước một", "Giải pháp bước hai",
                    "Kết luận và hẹn theo dõi", "Cảm ơn và kết thúc"],
    "gita_hanh_trinh": ["Tầng 1 · Thức tỉnh ý thức: nhìn nhận điểm đang đứng",
                        "Tầng 2 · Xây thói quen: một việc nhỏ làm đều mỗi ngày",
                        "Tầng 3 · Rèn kỷ luật: giữ nhịp khi không ai nhắc",
                        "Tầng 4 · Bứt phá giới hạn: dám làm điều chưa từng làm",
                        "Tầng 5 · Chiến thắng chính mình: đứng vững sau hành trình"],
}

VISUAL_MAP = {
    "mở đầu": "cinematic wide establishing shot, bright Vietnamese training hall, energetic hopeful mood",
    "chào mở": "trainer walking confidently onto a large stage, warm spotlights sweeping, audience clapping",
    "khởi động": "large group of Vietnamese adults doing energetic warm-up claps together, joyful atmosphere",
    "vấn đề": "thoughtful Vietnamese person at a desk, soft dramatic window light, reflective mood",
    "quan trọng": "medium shot of speaker gesturing strongly on stage, serious inspiring tone",
    "nội dung": "trainer presenting beside a large LED screen in a modern hall, professional corporate style",
    "ví dụ": "warm family living room scene, parents and children talking together, golden daylight",
    "lỗi": "person recognizing a mistake and nodding thoughtfully, documentary close-up",
    "hoạt động": "teams of Vietnamese adults in a big hall discussing around tables, dynamic teamwork energy",
    "nhóm": "small circle of people putting hands together in the center, celebrating teamwork",
    "thực hành": "participants writing goals on large boards, focused engaged faces",
    "cam kết": "close-up of hands signing a commitment card, determined mood, cinematic light",
    "tổng kết": "inspiring wide shot of the whole hall standing and applauding, confetti light",
    "hành động": "trainer raising a fist on stage edge, crowd raising fists in answer, epic energy",
    "lắng nghe": "close-up of a listener nodding with warm eye contact, soft light",
    "giải pháp": "step-by-step demonstration at a whiteboard, clean bright office",
    "cảm ơn": "warm grateful smile to camera, gentle applause behind, golden light",
    "thức tỉnh": "person standing at a window at dawn realizing a truth, cinematic silhouette",
    "thói quen": "person calmly repeating a small daily habit at a tidy desk, morning light",
    "kỷ luật": "person training alone with focus in a quiet room, determined expression",
    "bứt phá": "person breaking through a finish-line ribbon in a hall, triumphant slow motion",
    "chiến thắng": "hero low-angle shot of a person standing tall, arms raised, dramatic stage light",
    "kết luận": "inspiring wide shot of a team working together, sunset office light",
}

CAMS = ["medium, stable camera", "close-up, slow push in", "medium, slow pan right",
        "close-up, stable", "wide, stable", "medium, gentle handheld", "wide, slow pull back"]

def pick_visual(sect):
    s = sect.lower()
    for kw, v in VISUAL_MAP.items():
        if kw in s:
            return v
    return "corporate training video scene, clean professional Vietnamese setting, cinematic lighting"

def viet_kich_ban_luat(job, cast):
    khung = TEMPLATES.get(job.get("loaiPhim"), TEMPLATES["dao_tao"])[: job.get("soCanhToiDa", 7)]
    chu_de = job.get("chuDe", "")
    nv = job.get("nhanVat", "trainer")
    mo_ta_nv = cast.get(nv, {}).get("promptEn", "a charismatic Vietnamese professional trainer")
    canh = []
    for i, muc in enumerate(khung):
        thoai = ("%s. Phần %d trên %d: %s. " % (chu_de, i + 1, len(khung), muc.lower()) +
                 ("Hãy cùng bắt đầu nhé." if i == 0 else
                  "Hãy ghi nhớ điều này và áp dụng ngay hôm nay." if i == len(khung) - 1 else
                  "Đây là điểm quan trọng, xin hãy chú ý."))
        canh.append({
            "index": i + 1,
            "muc_vi": muc,
            "prompt_en": "%s, featuring %s, %s, consistent character identity, high detail, "
                         "cinematic film look, 35mm, natural motion" % (pick_visual(muc), mo_ta_nv, chu_de[:60]),
            "thoai_vi": thoai,
            "style": "talk" if i in (0, len(khung) - 1) else "noi",
            "camera": CAMS[i % len(CAMS)],
            "seed": 1000 + i,
        })
    return {"job": job.get("ma", ""), "tieuDe": job.get("tieuDe", ""), "loaiPhim": job.get("loaiPhim"),
            "chuDe": chu_de, "nhanVat": nv, "dongCo": "mau-gita", "scenes": canh}

# ── (Tuỳ chọn) LLM Qwen2.5-7B 4-bit viết kịch bản — bật LLM_ON ──
_llm = None
LLM_SYSTEM = ("Ban la bien kich video huan luyen cho GITA365 Viet Nam. "
              "Nhan de bai, viet storyboard JSON dung schema: "
              '{"scenes":[{"section_vi":"...","dialogue_vi":"...","visual_hint_en":"..."}]}. '
              "dialogue_vi: tieng Viet tu nhien 25-45 tu, cu the theo de bai, khong chung chung. "
              "visual_hint_en: 10-20 tu, phong cach corporate cinematic. Chi tra JSON hop le.")

def viet_kich_ban_llm(job, cast):
    global _llm
    try:
        if _llm is None:
            subprocess.run([sys.executable, "-m", "pip", "install", "-q", "bitsandbytes"], check=True)
            from transformers import AutoModelForCausalLM, AutoTokenizer, BitsAndBytesConfig
            bnb = BitsAndBytesConfig(load_in_4bit=True, bnb_4bit_compute_dtype=torch.float16)
            tok = AutoTokenizer.from_pretrained("Qwen/Qwen2.5-7B-Instruct")
            mod = AutoModelForCausalLM.from_pretrained(
                "Qwen/Qwen2.5-7B-Instruct", quantization_config=bnb,
                device_map="auto", torch_dtype=torch.float16)
            _llm = (tok, mod)
        tok, mod = _llm
        nguoi = ("Tieu de: %s\nDe bai: %s\nLoai: %s\nGhi chu: %s\nSo canh: %d" % (
            job.get("tieuDe", ""), job.get("chuDe", ""), job.get("loaiPhim", ""),
            job.get("ghiChu", "khong"), job.get("soCanhToiDa", 7)))
        prompt = tok.apply_chat_template(
            [{"role": "system", "content": LLM_SYSTEM},
             {"role": "user", "content": nguoi}],
            tokenize=False, add_generation_prompt=True)
        ids = tok(prompt, return_tensors="pt").to(mod.device)
        out = mod.generate(**ids, max_new_tokens=1400, temperature=0.8, top_p=0.9, do_sample=True)
        chu = tok.decode(out[0][ids.input_ids.shape[1]:], skip_special_tokens=True)
        goc = json.loads(re.search(r"\{.*\}", chu, re.DOTALL).group())
        kb = viet_kich_ban_luat(job, cast)
        nv = job.get("nhanVat", "trainer")
        mo_ta_nv = cast.get(nv, {}).get("promptEn", "a charismatic Vietnamese professional trainer")
        canh = []
        for i, s in enumerate(goc["scenes"][: job.get("soCanhToiDa", 7)]):
            canh.append({
                "index": i + 1,
                "muc_vi": s.get("section_vi", ""),
                "prompt_en": "%s, featuring %s, consistent character identity, high detail, "
                             "cinematic film look, 35mm" % (s.get("visual_hint_en", "corporate scene"), mo_ta_nv),
                "thoai_vi": s.get("dialogue_vi", ""),
                "style": "talk",
                "camera": CAMS[i % len(CAMS)],
                "seed": 1000 + i,
            })
        kb["scenes"] = canh
        kb["dongCo"] = "qwen2.5-7b"
        return kb
    except Exception as e:
        print("⚠️ LLM lỗi (%s) — quay về kịch bản mẫu" % e)
        return viet_kich_ban_luat(job, cast)

def viet_kich_ban(job, cast):
    return viet_kich_ban_llm(job, cast) if LLM_ON else viet_kich_ban_luat(job, cast)


# ── AUTO-QC: độ nét + chuyển động, tự quay lại seed khác ──
QC = {"blur_min": 60.0, "motion_min": 0.5, "motion_max": 50.0, "thu_lai": 2}

def cham_diem_clip(tep):
    import cv2, numpy as np
    cap = cv2.VideoCapture(str(tep))
    nets, moves, truoc, n = [], [], None, 0
    while True:
        ok, fr = cap.read()
        if not ok:
            break
        nho = cv2.resize(cv2.cvtColor(fr, cv2.COLOR_BGR2GRAY), (256, 256))
        nets.append(cv2.Laplacian(nho, cv2.CV_64F).var())
        if truoc is not None:
            moves.append(float(np.mean(cv2.absdiff(nho, truoc))))
        truoc = nho
        n += 1
        if n > 60:
            break
    cap.release()
    if not nets:
        return {"net": 0, "dong": 0, "dat": False}
    s = float(np.median(nets))
    m = float(np.mean(moves)) if moves else 0.0
    return {"net": round(s, 1), "dong": round(m, 2),
            "dat": s >= QC["blur_min"] and QC["motion_min"] <= m <= QC["motion_max"]}

def quay_canh(anh_ref, prompt, seed, ra):
    """Render một cảnh; QC_ON thì tự quay lại với seed mới nếu xấu."""
    lan_tot, diem_tot = 0, None
    for lan in range(QC["thu_lai"] + 1 if QC_ON else 1):
        sd = seed + lan * 777
        for fr, st in [(CFG["frames"], CFG["steps"]), (49, 6), (25, 4)]:
            try:
                if anh_ref is not None:
                    out = ong_i2v()(prompt=prompt, image=anh_ref, negative_prompt=NEG,
                                    num_frames=fr, height=CFG["height"], width=CFG["width"],
                                    num_inference_steps=st, guidance_scale=CFG["guidance"],
                                    generator=torch.Generator("cuda").manual_seed(sd))
                else:
                    out = ong_t2v()(prompt=prompt, negative_prompt=NEG,
                                    num_frames=fr, height=CFG["height"], width=CFG["width"],
                                    num_inference_steps=st, guidance_scale=CFG["guidance"],
                                    generator=torch.Generator("cuda").manual_seed(sd))
                khung = out.frames[0]
                break
            except torch.cuda.OutOfMemoryError:
                free()
        else:
            raise RuntimeError("OOM ở cả 25 khung")
        export_to_video(khung, str(ra), fps=CFG["fps"])
        if not QC_ON:
            return len(khung) / CFG["fps"], {"net": -1, "dong": -1, "dat": True}, 0
        diem = cham_diem_clip(ra)
        print("   🔍 QC lần %d: net=%s dong=%s %s" % (lan + 1, diem["net"], diem["dong"],
                                                       "DAT" if diem["dat"] else "XAU"))
        if diem["dat"]:
            return len(khung) / CFG["fps"], diem, lan
        if diem_tot is None or diem["net"] > diem_tot["net"]:
            diem_tot, lan_tot = diem, lan
        free()
    print("   ⚠️ Dùng bản tốt nhất sau %d lần thử" % (lan_tot + 1))
    return len(khung) / CFG["fps"], diem_tot, lan_tot


# ── ĐỌC THOẠI edge-tts (giọng theo nhân vật) + PHỤ ĐỀ SRT ──
def doc_thoai(chu, giong, ra):
    """Gọi CLI edge-tts qua subprocess (tránh xung đột event-loop của
    notebook). Trả về thời lượng giây thật của file MP3, None nếu lỗi."""
    chu = (chu or "").strip()
    if not chu:
        return None
    r = subprocess.run([sys.executable, "-m", "edge_tts", "--voice", giong,
                        "--text", chu, "--write-media", str(ra)],
                       capture_output=True, timeout=180)
    if r.returncode != 0 or not Path(ra).exists():
        print("⚠️ TTS lỗi: %s" % (r.stderr or b"")[:120])
        return None
    return _thoi_luong_clip(ra)

def lam_srt(kich_ban, thoi_luong, ra):
    t, dong = 0.0, []
    def fmt(s):
        h, m = int(s // 3600), int(s % 3600 // 60)
        return "%02d:%02d:%06.3f" % (h, m, s % 60)
    for sc, d in zip(kich_ban["scenes"], thoi_luong):
        txt = sc.get("thoai_vi") or sc.get("muc_vi", "")
        giua = len(txt) // 2 if len(txt) > 80 else len(txt)
        seg = (txt[:giua].strip() + "\n" + txt[giua:].strip()) if len(txt) > 80 else txt
        dong.append("%d\n%s --> %s\n%s\n" % (len(dong) + 1,
                    fmt(t).replace(".", ","), fmt(t + d).replace(".", ","), seg))
        t += d
    Path(ra).write_text("\n".join(dong), encoding="utf-8")
    return ra


# ── KHỚP MÔI (MuseTalk, dự phòng Wav2Lip) — chỉ cảnh có thoại ──
_muse_san_sang = None

def cai_musetalk():
    global _muse_san_sang
    if _muse_san_sang is not None:
        return _muse_san_sang
    try:
        if not (STUDIO / "MuseTalk").exists():
            subprocess.run(["git", "clone", "--depth", "1",
                            "https://github.com/TMElyralab/MuseTalk", str(STUDIO / "MuseTalk")],
                           check=True, capture_output=True)
            subprocess.run([sys.executable, "-m", "pip", "install", "-q",
                            "-r", str(STUDIO / "MuseTalk" / "requirements.txt")], check=True)
            from huggingface_hub import snapshot_download
            snapshot_download(repo_id="TMElyralab/MuseTalk",
                              local_dir=str(STUDIO / "MuseTalk" / "models" / "musetalk"))
        _muse_san_sang = True
    except Exception as e:
        print("⚠️ MuseTalk cài lỗi (%s) — thử Wav2Lip" % str(e)[:120])
        _muse_san_sang = False
    return _muse_san_sang

_w2l_san_sang = None

def cai_wav2lip():
    global _w2l_san_sang
    if _w2l_san_sang is not None:
        return _w2l_san_sang
    try:
        if not (STUDIO / "Wav2Lip").exists():
            subprocess.run(["git", "clone", "--depth", "1",
                            "https://github.com/justinjohn0306/Wav2Lip", str(STUDIO / "Wav2Lip")],
                           check=True, capture_output=True)
            ck = STUDIO / "Wav2Lip" / "checkpoints"
            ck.mkdir(exist_ok=True)
            subprocess.run(["wget", "-q", "-O", str(ck / "wav2lip_gan.pth"),
                            "https://github.com/justinjohn0306/Wav2Lip/releases/download/models/wav2lip_gan.pth"],
                           check=True, capture_output=True)
        _w2l_san_sang = True
    except Exception as e:
        print("⚠️ Wav2Lip cài lỗi (%s) — phát cảnh nói không khớp môi" % str(e)[:120])
        _w2l_san_sang = False
    return _w2l_san_sang

def khop_moi_canh(clip, am, ra):
    """Khớp môi cảnh nói; mọi lỗi đều trả clip gốc (không chết dây chuyền)."""
    import shutil
    try:
        if LIPSYNC_ENGINE == "musetalk" and cai_musetalk():
            t0 = time.time()
            r = subprocess.run([sys.executable, "-m", "musetalk.inference",
                                "--inference_config", str(STUDIO / "MuseTalk" / "configs/inference/test.yaml"),
                                "--video_path", str(clip), "--audio_path", str(am),
                                "--results_dir", str(STUDIO / "clips")],
                               capture_output=True, text=True, cwd=str(STUDIO / "MuseTalk"), timeout=600)
            # MuseTalk tự đặt tên file xuất — nhặt file mới sinh sau t0
            sinh = [p for p in (STUDIO / "clips").glob("*.mp4")
                    if p.stat().st_mtime >= t0 - 1 and p.resolve() not in (Path(clip).resolve(), Path(ra).resolve())]
            sinh.sort(key=lambda p: p.stat().st_mtime)
            if r.returncode == 0 and sinh:
                shutil.move(str(sinh[-1]), ra)
                return ra
        if LIPSYNC_ENGINE in ("musetalk", "wav2lip") and cai_wav2lip():
            r = subprocess.run([sys.executable, str(STUDIO / "Wav2Lip" / "inference.py"),
                                "--checkpoint_path", str(STUDIO / "Wav2Lip" / "checkpoints/wav2lip_gan.pth"),
                                "--face", str(clip), "--audio", str(am),
                                "--outfile", str(ra), "--nosmooth", "--pads", "0,10,0,5"],
                               capture_output=True, text=True, cwd=str(STUDIO / "Wav2Lip"), timeout=600)
            if r.returncode == 0 and Path(ra).exists():
                return ra
    except Exception as e:
        print("⚠️ Khớp môi lỗi (%s) — giữ clip gốc" % str(e)[:120])
    shutil.copy(clip, ra)
    return ra


# ── GHÉP PHIM + INTRO/OUTRO GITA ──
def ghep_tho(jid, clips, thoi_luong, ra):
    """Normalize từng cảnh rồi nối video + nối audio (im lặng cho cảnh không thoại)."""
    ds_v = STUDIO / "jobs" / ("%s_vlist.txt" % jid)
    chuan = []
    for i, p in enumerate(clips):
        f = STUDIO / "clips" / ("n_%s_%02d.mp4" % (jid, i))
        subprocess.run(["ffmpeg", "-y", "-i", str(p),
                        "-vf", "scale=%d:%d,setsar=1" % (CFG["width"], CFG["height"]),
                        "-r", str(CFG["fps"]), "-an",
                        "-c:v", "libx264", "-preset", "fast", "-crf", "20", str(f)],
                       capture_output=True)
        chuan.append(f)
    ds_v.write_text("\n".join("file '%s'" % f for f in chuan))
    v_only = STUDIO / "final" / ("%s_v.mp4" % jid)
    subprocess.run(["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", str(ds_v),
                    "-c", "copy", str(v_only)], capture_output=True)
    ds_a = []
    for i in range(len(thoi_luong)):
        am = STUDIO / "audio" / ("%s_%02d.mp3" % (jid, i + 1))
        if am.exists():
            ds_a.append(am)
        else:
            lang = STUDIO / "audio" / ("im_%s_%02d.wav" % (jid, i + 1))
            subprocess.run(["ffmpeg", "-y", "-f", "lavfi", "-i", "anullsrc=r=24000:cl=mono",
                            "-t", str(thoi_luong[i]), str(lang)], capture_output=True)
            ds_a.append(lang)
    a_list = STUDIO / "jobs" / ("%s_alist.txt" % jid)
    a_list.write_text("\n".join("file '%s'" % a for a in ds_a))
    a_full = STUDIO / "final" / ("%s_a.wav" % jid)
    subprocess.run(["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", str(a_list),
                    "-c:a", "pcm_s16le", "-ar", "24000", "-ac", "1", str(a_full)], capture_output=True)
    subprocess.run(["ffmpeg", "-y", "-i", str(v_only), "-i", str(a_full),
                    "-c:v", "copy", "-c:a", "aac", "-b:a", "128k", "-shortest", str(ra)],
                   capture_output=True)
    return ra

FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"

def clip_chu(jid, ten, chu, giay):
    """Intro/outro: nền xanh GITA + chữ giữa màn hình, kèm kênh âm IM
    (để concat với thân phim — có tiếng — không vỡ luồng)."""
    ra = STUDIO / "clips" / ("%s_%s.mp4" % (jid, ten))
    chu_sach = chu.replace(":", "\\:").replace("'", "")
    subprocess.run(["ffmpeg", "-y",
                    "-f", "lavfi", "-i",
                    "color=c=0x0d2b45:s=%dx%d:d=%s" % (CFG["width"], CFG["height"], giay),
                    "-f", "lavfi", "-i", "anullsrc=r=24000:cl=mono",
                    "-vf", "drawtext=fontfile=%s:text='%s':fontcolor=white:fontsize=52:"
                           "x=(w-text_w)/2:y=(h-text_h)/2,format=yuv420p" % (FONT, chu_sach),
                    "-r", str(CFG["fps"]), "-t", str(giay),
                    "-c:v", "libx264", "-preset", "fast", "-crf", "20",
                    "-c:a", "aac", "-b:a", "128k", "-ar", "24000", "-ac", "1",
                    str(ra)], capture_output=True)
    return ra

def gan_thuong_hieu(jid, tho, ra):
    intro = clip_chu(jid, "intro", BRAND["ten"], 2.5)
    outro = clip_chu(jid, "outro", BRAND["slogan"], 3.0)
    ds = STUDIO / "jobs" / ("%s_flist.txt" % jid)
    ds.write_text("file '%s'\nfile '%s'\nfile '%s'" % (intro, tho, outro))
    subprocess.run(["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", str(ds),
                    "-c:v", "libx264", "-preset", "fast", "-crf", "20",
                    "-c:a", "aac", "-b:a", "128k", str(ra)], capture_output=True)
    return ra


# ── DÂY CHUYỀN MỘT PHIM (có checkpoint để resume khi hết giờ) ──
def lam_phim(ma, job, cast):
    print("=" * 56)
    print("🏭 PHIM %s · loai=%s · nhan_vat=%s" % (ma, job.get("loaiPhim"), job.get("nhanVat")))
    nv = job.get("nhanVat", "trainer")
    vai = cast.get(nv)
    if not vai:
        print("⚠️ Nhân vật '%s' CHƯA khóa ảnh — quay text-to-video, danh tính không bảo đảm." % nv)
    giong = vai["giong"] if vai else "vi-VN-NamMinhNeural"

    kb = viet_kich_ban(job, cast)
    (STUDIO / "jobs" / ("%s_kichban.json" % ma)).write_text(
        json.dumps(kb, ensure_ascii=False, indent=2))
    print("📝 Kịch bản: %d cảnh (động cơ %s)" % (len(kb["scenes"]), kb["dongCo"]))

    ckpt = STUDIO / "jobs" / ("%s_tiendo.json" % ma)
    xong = set(json.loads(ckpt.read_text())["xong"]) if ckpt.exists() else set()
    clips, thoi_luong = [], []
    anh_ref = None
    if vai:
        anh_ref = Image.open(vai["refs"][0]).convert("RGB").resize((CFG["width"], CFG["height"]))

    for sc in kb["scenes"]:
        i = sc["index"]
        clip = STUDIO / "clips" / ("%s_%02d.mp4" % (ma, i))
        am = STUDIO / "audio" / ("%s_%02d.mp3" % (ma, i))
        if i in xong and clip.exists():
            print("  ⏭️ Cảnh %d (đã xong — bỏ qua)" % i)
            clips.append(clip)
            thoi_luong.append(_thoi_luong_clip(clip))
            continue
        t0 = time.time()
        d, diem, lan = quay_canh(anh_ref, sc["prompt_en"], sc["seed"], clip)
        # Đọc thoại rồi kéo video khớp lời (thoại dài hơn hình)
        dt = doc_thoai(sc.get("thoai_vi", ""), giong, am) if sc.get("thoai_vi") else None
        if dt and dt > d:
            sta = STUDIO / "clips" / ("%s_%02d_sync.mp4" % (ma, i))
            subprocess.run(["ffmpeg", "-y", "-i", str(clip),
                            "-vf", "setpts=%.4f*PTS" % (dt / d), "-r", str(CFG["fps"]),
                            "-c:v", "libx264", "-preset", "fast", "-crf", "20", str(sta)],
                           capture_output=True)
            clip, d = sta, dt
        # Khớp môi cho cảnh có thoại
        if sc.get("thoai_vi") and am.exists() and LIPSYNC_ENGINE != "off":
            ls = STUDIO / "clips" / ("%s_%02d_ls_tmp.mp4" % (ma, i))
            clip = khop_moi_canh(clip, am, ls)
        clips.append(clip)
        thoi_luong.append(d)
        xong.add(i)
        ckpt.write_text(json.dumps({"xong": sorted(xong)}))
        free()
        print("  🎬 Cảnh %d: %.1fs · QC net=%s · %.0fs" % (i, d, diem.get("net"), time.time() - t0))

    tho = STUDIO / "final" / ("%s_tho.mp4" % ma)
    ghep_tho(ma, clips, thoi_luong, tho)
    srt = lam_srt(kb, thoi_luong, STUDIO / "subs" / ("%s.srt" % ma))
    cuoi = STUDIO / "final" / ("%s.mp4" % ma)
    gan_thuong_hieu(ma, tho, cuoi)
    print("✅ PHIM XONG:", cuoi.name, "· phụ đề:", srt.name)
    return cuoi

def _thoi_luong_clip(p):
    r = subprocess.run(["ffprobe", "-v", "quiet", "-show_entries", "format=duration",
                        "-of", "csv=p=0", str(p)], capture_output=True, text=True)
    try:
        return float(r.stdout.strip()) or 3.0
    except ValueError:
        return 3.0


# ── VIỆC ĐỌC THOẠI (loại 'tts') ──
def lam_tts(ma):
    _, loi_b = goi("/quay/tep/" + ma + "/loi")
    goi_txt = loi_b.decode("utf-8", "replace")
    giong = "vi-VN-NamMinhNeural"
    m = re.match(r"^#giong=([\w-]+)\n", goi_txt)
    if m:
        giong = m.group(1)
        goi_txt = goi_txt[m.end():]
    ra = STUDIO / "audio" / (ma + ".mp3")
    doc_thoai(goi_txt.strip(), giong, ra)
    nop_ket_qua(ma, ra, "audio/mpeg")
    print("🔊 Đọc xong việc", ma)


# ── VÒNG LẶP CHÍNH ──
CAST = tai_nhan_vat()
SO_VIEC = 0
print("🏭 Xưởng phim sẵn sàng. Đang chờ việc (film/tts)...", flush=True)
while True:
    try:
        v = nhan_viec()
    except Exception as e:
        print("Lỗi mạng, thử lại sau 60 giây:", e, flush=True)
        time.sleep(60)
        continue
    if not v.get("ma"):
        bao_song()
        if SO_VIEC:
            print("Đã làm", SO_VIEC, "việc. Hàng chờ trống — ngủ 3 phút.", flush=True)
        time.sleep(180)
        continue
    try:
        if v.get("loai") == "tts":
            lam_tts(v["ma"])
        else:
            _, loi_b = goi("/quay/tep/" + v["ma"] + "/loi")
            job = json.loads(loi_b.decode("utf-8"))
            job["ma"] = v["ma"]
            if job.get("nhanVat") and job["nhanVat"] not in CAST:
                CAST = tai_nhan_vat()   # có thể vừa khóa thêm ảnh
            cuoi = lam_phim(v["ma"], job, CAST)
            nop_ket_qua(v["ma"], cuoi, "video/mp4")
        SO_VIEC += 1
    except Exception as e:
        print("Hỏng việc", v["ma"], ":", e, flush=True)
        bao_loi(v["ma"], e)
    finally:
        free()
