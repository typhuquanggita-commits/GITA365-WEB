#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
GITA 365 · Xưởng phim AI — động cơ dựng phim từ cấu hình của app GITA.

Đọc file .json (xuất từ màn "Sản xuất phim AI") và chạy dây chuyền model MỞ:
  ảnh nhân vật nhất quán (SDXL + InstantID) → ảnh→video (CogVideoX I2V) →
  giọng Việt (XTTS v2) → lip-sync → nâng nét → ráp (ffmpeg).

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

# ───────────────────────── 1 · ẢNH NHÂN VẬT ─────────────────────────
def buoc_anh(cfg, base):
    """SDXL + InstantID: giữ khuôn mặt từ nhan-vat/<id>.png, dựng khung theo prompt_anh.
    Nếu thiếu asset InstantID, hạ về SDXL text→image (vẫn ra ảnh, kém nhất quán hơn)."""
    import torch
    from diffusers import StableDiffusionXLPipeline
    nvs = nv_map(cfg)
    instantid_ok = False
    pipe_id = None
    try:
        # Đường InstantID (khuyên dùng — giữ mặt). Cần: pip install insightface onnxruntime-gpu
        # và tải assets InstantID (ControlNetModel + ip-adapter.bin) theo repo InstantID.
        from insightface.app import FaceAnalysis
        from diffusers.models import ControlNetModel
        from diffusers import StableDiffusionXLControlNetPipeline
        import numpy as np, cv2  # noqa
        app = FaceAnalysis(name="antelopev2", providers=["CUDAExecutionProvider", "CPUExecutionProvider"])
        app.prepare(ctx_id=0, det_size=(640, 640))
        cn = ControlNetModel.from_pretrained("InstantX/InstantID",
                                             subfolder="ControlNetModel", torch_dtype=torch.float16)
        pipe_id = StableDiffusionXLControlNetPipeline.from_pretrained(
            "stabilityai/stable-diffusion-xl-base-1.0", controlnet=cn, torch_dtype=torch.float16)
        pipe_id.load_ip_adapter_instantid("InstantX/InstantID")  # cần file ip-adapter.bin
        pipe_id.to("cuda")
        instantid_ok = True
        log("InstantID sẵn sàng — giữ khuôn mặt từ ảnh mẫu.")
    except Exception as e:
        log("Không bật được InstantID (", str(e)[:120], ") → hạ về SDXL text→image.")
        pipe_id = StableDiffusionXLPipeline.from_pretrained(
            "stabilityai/stable-diffusion-xl-base-1.0", torch_dtype=torch.float16).to("cuda")

    for c in cfg["canh"]:
        out = base / "anh" / f"{c['id']}.png"
        if out.exists():
            log("bỏ qua ảnh (đã có):", out.name); continue
        prompt = c.get("prompt_anh", "")
        neg = c.get("negative") or ("hoạt hình, anime, cartoon, 2D, tranh vẽ, người que, ảnh tĩnh, mấp máy môi, "
                                    "méo mặt, biến dạng, thừa ngón tay, mờ nhoè, chất lượng thấp")
        seed = int(str(c.get("seed") or nvs.get(c.get("nhan_vat"), {}).get("seed") or 0) or 0)
        g = torch.Generator("cuda").manual_seed(seed)
        # LoRA khuôn mặt (nếu đã train cho nhân vật này): lora/<id>.safetensors
        da_lora = False
        if c.get("co_lora"):
            lpath = Path("lora") / f"{c.get('nhan_vat')}.safetensors"
            if lpath.exists():
                try: pipe_id.load_lora_weights(str(lpath.parent), weight_name=lpath.name); da_lora = True; log("nạp LoRA:", lpath.name)
                except Exception as e: log("không nạp được LoRA", lpath.name, "(", str(e)[:80], ")")
            else:
                log("THIẾU LoRA", lpath, "→ sinh không có LoRA (mặt có thể lệch).")
        if instantid_ok:
            import cv2, numpy as np
            face_path = Path("nhan-vat") / f"{c.get('nhan_vat')}.png"
            if not face_path.exists():
                log("THIẾU ảnh mặt mẫu:", face_path, "→ dùng text→image cho cảnh này.")
                img = pipe_id(prompt=prompt, negative_prompt=neg, num_inference_steps=30,
                              height=1344, width=768, generator=g).images[0]
            else:
                face = cv2.imread(str(face_path))
                info = app.get(face)
                info = sorted(info, key=lambda x: (x.bbox[2]-x.bbox[0])*(x.bbox[3]-x.bbox[1]))[-1]
                emb = info["embedding"]
                img = pipe_id(prompt=prompt, negative_prompt=neg, image_embeds=emb,
                              num_inference_steps=30, height=1344, width=768, generator=g).images[0]
        else:
            img = pipe_id(prompt=prompt, negative_prompt=neg, num_inference_steps=30,
                          height=1344, width=768, generator=g).images[0]
        img.save(out); log("ảnh xong:", out.name)
        if da_lora:
            try: pipe_id.unload_lora_weights()
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

def _wan():
    import torch
    from diffusers import WanImageToVideoPipeline          # cần diffusers >= 0.33
    pipe = WanImageToVideoPipeline.from_pretrained("Wan-AI/Wan2.1-I2V-14B-480P-Diffusers", torch_dtype=torch.bfloat16)
    pipe.enable_model_cpu_offload()
    def chay(image, prompt, giay):
        n = max(33, min(81, int(16 * float(giay)) // 4 * 4 + 1))
        return pipe(image=image, prompt=prompt, height=832, width=480, num_frames=n,
                    guidance_scale=5.0).frames[0], 16
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
          "infinitetalk": "wan"}   # InfiniteTalk chưa cài → Wan + lip-sync

def _goi_api(dc, anh, prompt, giay, out):
    """ĐIỂM NỐI động cơ có phí. Viết hàm gọi API thật của nhà cung cấp vào đây khi có khoá.
    Trả True nếu đã tạo được `out`; False để hạ về động cơ mở."""
    if not os.environ.get(DONG_CO_PHI[dc]):
        log(f"  {dc}: chưa có {DONG_CO_PHI[dc]} → hạ về động cơ mở. Đường rẻ nhất: {DUONG_RE.get(dc,'-')}"); return False
    log(f"  {dc}: có khoá nhưng CHƯA NỐI API trong mã — điền hàm _goi_api() theo tài liệu nhà cung cấp."
        " Tạm hạ về động cơ mở."); return False

def _infinitetalk(anh, wav, prompt, out):
    """InfiniteTalk (MeiGen-AI, mở, Apache-2.0): ảnh + giọng → người nói cả thân, khớp môi, cử động
    đầu/tay. Cần: git clone https://github.com/MeiGen-AI/InfiniteTalk + tải trọng số theo README.
    Chạy được trên GPU 16GB ở chế độ tiết kiệm VRAM nhưng chậm; RTX 4090 nhanh hơn nhiều."""
    goc = Path("InfiniteTalk")
    w = goc / "weights"
    if not (goc / "generate_infinitetalk.py").exists() or not w.exists():
        log("  InfiniteTalk chưa cài (repo + weights) → hạ về Wan + lip-sync"); return False
    vao = base_tmp = out.parent.parent / "tmp" / f"it-{out.stem}.json"
    vao.write_text(json.dumps({"prompt": prompt, "cond_video": str(Path(anh).resolve()),
                               "cond_audio": {"person1": str(Path(wav).resolve())}}, ensure_ascii=False), encoding="utf-8")
    ra = out.with_suffix("")
    cmd = [sys.executable, str(goc / "generate_infinitetalk.py"),
           "--ckpt_dir", str(w / "Wan2.1-I2V-14B-480P"), "--wav2vec_dir", str(w / "chinese-wav2vec2-base"),
           "--infinitetalk_dir", str(w / "InfiniteTalk/single/infinitetalk.safetensors"),
           "--input_json", str(vao), "--size", "infinitetalk-480", "--sample_steps", "40",
           "--mode", "streaming", "--motion_frame", "9", "--num_persistent_param_in_dit", "0",
           "--save_file", str(ra)]
    try:
        subprocess.run(cmd, check=True)
        if Path(str(ra) + ".mp4").exists():
            shutil.move(str(ra) + ".mp4", str(out)); return True
    except Exception as e:
        log("  InfiniteTalk lỗi (", str(e)[:100], ") → hạ về Wan + lip-sync")
    return False

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
        prompt = c.get("prompt_video", "chuyển động tự nhiên"); giay = c.get("giay", 5)
        log(f"cảnh {c['id']} · động cơ: {dc}")
        if dc in DONG_CO_PHI and _goi_api(dc, anh, prompt, giay, out):
            c["_da_khop_moi"] = dc in TU_KHOP_MOI; continue
        if dc in ("infinitetalk", "infinitetalk_api", "heygen"):
            wav = base / "giong" / f"{c['id']}.wav"
            if wav.exists() and _infinitetalk(anh, wav, prompt, out):
                c["_da_khop_moi"] = True; (base / "clip" / f"{c['id']}.ok-sync").touch()
                log("clip xong (InfiniteTalk):", out.name); continue
            if not wav.exists(): log("  chưa có giọng cảnh này → chạy --run giong trước; tạm dùng Wan")
        frames, fps = lay(dc)(load_image(str(anh)), prompt, giay)
        export_to_video(frames, str(out), fps=fps)
        log("clip xong:", out.name)

# ───────────────────────── 3 · GIỌNG (XTTS v2, tiếng Việt) ─────────────────────────
def buoc_giong(cfg, base):
    from TTS.api import TTS
    tts = TTS("tts_models/multilingual/multi-dataset/xtts_v2").to("cuda")
    nvs = nv_map(cfg)
    for c in cfg["canh"]:
        thoai = (c.get("thoai") or "").strip()
        if not thoai: continue
        out = base / "giong" / f"{c['id']}.wav"
        if out.exists(): log("bỏ qua giọng (đã có):", out.name); continue
        # Giọng chia theo giới tính + độ tuổi: giong/<gioi-tuoi>.wav (vd nam-lon.wav, nu-teen.wav)
        key = c.get("giong_key") or c.get("nhan_vat")
        mau = Path("giong") / f"{key}.wav"
        if not mau.exists(): mau = Path("giong") / f"{c.get('nhan_vat')}.wav"   # dự phòng theo nhân vật
        if not mau.exists():
            log("THIẾU giọng mẫu:", mau, "→ bỏ qua giọng cảnh", c["id"]); continue
        lang = c.get("ngon_ngu") or cfg.get("ngon_ngu") or "vi"   # khoá ngôn ngữ: vi / en
        tts.tts_to_file(text=thoai, speaker_wav=str(mau), language=lang, file_path=str(out))
        log("giọng xong:", out.name, "(", lang, ")")

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

# ───────────────────────── 5 · HẬU KỲ CAO CẤP (theo hau_ky của app) ─────────────────────────
# Chạy trên từng clip, tại chỗ. Ưu tiên công cụ AI nếu đã cài (GFPGAN/CodeFormer, Real-ESRGAN, RIFE);
# chưa cài thì dùng bộ lọc ffmpeg tương đương (luôn có trên Kaggle) và NÓI RÕ là bản thay thế.
def _ff(src, vf, dst):
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(src), "-vf", vf,
                    "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "16", "-c:a", "copy", str(dst)], check=True)

def _thu_ai(lenh, ten):
    try: subprocess.run(lenh, check=True); return True
    except Exception: log(f"  {ten}: chưa cài → dùng bản thay thế"); return False

def buoc_nang_net(cfg, base):
    hk = cfg.get("hau_ky") or {}
    if not co_lenh("ffmpeg"): log("THIẾU ffmpeg — bỏ qua hậu kỳ."); return
    for c in cfg["canh"]:
        clip = base / "clip" / f"{c['id']}.mp4"
        if not clip.exists(): continue
        tmp = base / "tmp" / f"hk-{c['id']}.mp4"
        log("hậu kỳ cảnh", c["id"])
        if hk.get("giuMat", True):            # phục hồi khuôn mặt (AI) — sửa mặt mờ sau I2V/lip-sync
            if _thu_ai(["python", "GFPGAN/inference_gfpgan_video.py", "-i", str(clip), "-o", str(tmp)], "GFPGAN"):
                shutil.move(str(tmp), str(clip))
        if hk.get("napNet", True):            # nâng nét
            if _thu_ai(["realesrgan-ncnn-vulkan", "-i", str(clip), "-o", str(tmp), "-s", "2"], "Real-ESRGAN"):
                shutil.move(str(tmp), str(clip))
            else:
                _ff(clip, "scale=1080:1920:flags=lanczos:force_original_aspect_ratio=increase,crop=1080:1920,unsharp=5:5:0.6", tmp)
                shutil.move(str(tmp), str(clip))
        loc = []
        if hk.get("onDinh"):   loc.append("deshake")
        if hk.get("khuNhieu"): loc.append("hqdn3d=1.5:1.5:6:6")
        if hk.get("chinhMau", True): loc.append("eq=contrast=1.06:saturation=1.08:gamma=0.98,curves=preset=medium_contrast")
        if hk.get("muot60", True):   loc.append("minterpolate=fps=60:mi_mode=mci:mc_mode=aobmc:vsbmc=1")
        if loc:
            _ff(clip, ",".join(loc), tmp); shutil.move(str(tmp), str(clip))
        log("  hậu kỳ xong:", clip.name)

# ───────────────────────── 6 · PHỤ ĐỀ (faster-whisper) ─────────────────────────
def buoc_phu_de(cfg, base):
    if (cfg.get("hau_ky") or {}).get("phuDe") is False:
        log("Phụ đề: tắt theo cài đặt hậu kỳ."); return
    try:
        from faster_whisper import WhisperModel
    except Exception:
        log("Chưa cài faster-whisper → bỏ qua phụ đề."); return
    model = WhisperModel("small", device="cuda", compute_type="float16")
    srt = base / "tmp" / "phu-de.srt"
    # Phụ đề ghép từ thoại đã biết (chính xác hơn là nghe lại):
    def ts(t):
        h=int(t//3600); m=int((t%3600)//60); s=t%60
        return f"{h:02d}:{m:02d}:{s:06.3f}".replace(".",",")
    lines=[]; t=0.0; i=1
    for c in cfg["canh"]:
        d=float(c.get("giay",5)); thoai=(c.get("thoai") or "").strip()
        if thoai:
            lines.append(f"{i}\n{ts(t)} --> {ts(t+d)}\n{thoai}\n"); i+=1
        t+=d
    srt.write_text("\n".join(lines), encoding="utf-8")
    log("phụ đề (từ thoại) xong:", srt)

# ───────────────────────── 7 · RÁP PHIM (ffmpeg) ─────────────────────────
def buoc_rap(cfg, base, W=1080, Hh=1920, fps=None):
    fps = fps or (60 if (cfg.get("hau_ky") or {}).get("muot60") else 30)
    if not co_lenh("ffmpeg"):
        log("THIẾU ffmpeg — cài ffmpeg rồi chạy lại bước ráp."); return
    segs=[]; tmp=base/"tmp"
    for c in cfg["canh"]:
        clip = base/"clip"/f"{c['id']}.mp4"
        if not clip.exists():
            log("bỏ cảnh (chưa có clip):", c["id"]); continue
        d=float(c.get("giay",5)); wav=base/"giong"/f"{c['id']}.wav"
        seg=tmp/f"seg-{c['id']}.mp4"
        # Chuẩn hoá: vừa khung 9:16, đúng fps; ghép tiếng (giọng hoặc im lặng), cắt đúng thời lượng
        vf=f"scale={W}:{Hh}:force_original_aspect_ratio=increase,crop={W}:{Hh},fps={fps}"
        if wav.exists():
            cmd=["ffmpeg","-y","-i",str(clip),"-i",str(wav),"-vf",vf,"-t",str(d),
                 "-c:v","libx264","-pix_fmt","yuv420p","-c:a","aac","-ar","48000",
                 "-map","0:v:0","-map","1:a:0","-shortest",str(seg)]
        else:
            cmd=["ffmpeg","-y","-i",str(clip),"-f","lavfi","-i","anullsrc=r=48000:cl=stereo",
                 "-vf",vf,"-t",str(d),"-c:v","libx264","-pix_fmt","yuv420p","-c:a","aac",
                 "-map","0:v:0","-map","1:a:0","-shortest",str(seg)]
        subprocess.run(cmd, check=True); segs.append(seg)
    if not segs:
        log("Không có cảnh nào để ráp."); return
    lst=tmp/"danh-sach.txt"
    lst.write_text("".join(f"file '{s.resolve()}'\n" for s in segs), encoding="utf-8")
    out=base/"phim-cuoi.mp4"
    subprocess.run(["ffmpeg","-y","-f","concat","-safe","0","-i",str(lst),"-c","copy",str(out)], check=True)
    # Nhạc nền (hau_ky.nhacNen): trộn tệp đầu tiên trong nhac/ ở âm lượng thấp, giữ nguyên giọng
    nhac = sorted(glob.glob("nhac/*.mp3") + glob.glob("nhac/*.wav") + glob.glob("nhac/*.m4a"))
    if (cfg.get("hau_ky") or {}).get("nhacNen", True) and nhac:
        mix = base/"tmp"/"phim-nhac.mp4"
        subprocess.run(["ffmpeg","-y","-loglevel","error","-i",str(out),"-stream_loop","-1","-i",nhac[0],
            "-filter_complex","[1:a]volume=0.18[n];[0:a][n]amix=inputs=2:duration=first:dropout_transition=2[a]",
            "-map","0:v","-map","[a]","-c:v","copy","-c:a","aac","-shortest",str(mix)], check=True)
        shutil.move(str(mix), str(out)); log("đã trộn nhạc nền:", Path(nhac[0]).name)
    elif (cfg.get("hau_ky") or {}).get("nhacNen", True):
        log("Nhạc nền: bật nhưng chưa có tệp trong nhac/ — bỏ qua.")
    # Phụ đề (nếu có) — khắc cứng vào bản phụ đề riêng
    srt=tmp/"phu-de.srt"
    if srt.exists():
        out2=base/"phim-cuoi-phude.mp4"
        subprocess.run(["ffmpeg","-y","-i",str(out),"-vf",f"subtitles='{srt.as_posix()}'",
                        "-c:a","copy",str(out2)], check=False)
        log("phim có phụ đề:", out2)
    log("✅ PHIM CUỐI:", out)

# ───────────────────────── Điều phối ─────────────────────────
BUOC = {"anh":buoc_anh, "video":buoc_video, "giong":buoc_giong,
        "lipsync":buoc_lipsync, "nang_net":buoc_nang_net, "phu_de":buoc_phu_de, "rap":buoc_rap}
THU_TU = ["anh","giong","video","lipsync","nang_net","phu_de","rap"]   # giọng TRƯỚC video: InfiniteTalk cần giọng

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
