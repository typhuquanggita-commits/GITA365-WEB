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
import os, sys, json, argparse, subprocess, shutil
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

# ───────────────────────── 2 · ẢNH → VIDEO ─────────────────────────
def buoc_video(cfg, base):
    """CogVideoX-5b I2V: mỗi khung ảnh → clip chuyển động theo prompt_video."""
    import torch
    from diffusers import CogVideoXImageToVideoPipeline
    from diffusers.utils import load_image, export_to_video
    pipe = CogVideoXImageToVideoPipeline.from_pretrained(
        "THUDM/CogVideoX-5b-I2V", torch_dtype=torch.bfloat16)
    pipe.enable_sequential_cpu_offload()   # chạy vừa 16GB VRAM (T4/P100)
    pipe.vae.enable_tiling(); pipe.vae.enable_slicing()
    for c in cfg["canh"]:
        anh = base / "anh" / f"{c['id']}.png"
        out = base / "clip" / f"{c['id']}.mp4"
        if out.exists(): log("bỏ qua clip (đã có):", out.name); continue
        if not anh.exists(): log("THIẾU ảnh cho cảnh", c["id"], "→ chạy bước --run anh trước."); continue
        image = load_image(str(anh))
        fps = 8
        frames = pipe(image=image, prompt=c.get("prompt_video", "chuyển động tự nhiên"),
                      num_frames=49, guidance_scale=6, num_inference_steps=50).frames[0]
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
        tts.tts_to_file(text=thoai, speaker_wav=str(mau), language="vi", file_path=str(out))
        log("giọng xong:", out.name)

# ───────────────────────── 4 · LIP-SYNC (repo ngoài) ─────────────────────────
def buoc_lipsync(cfg, base):
    """Khớp môi người dẫn với giọng. Dùng LatentSync hoặc Wav2Lip (clone repo ngoài).
    Đây là ĐIỂM NỐI: cần cài repo trước; lệnh dưới là mẫu cho Wav2Lip."""
    for c in cfg["canh"]:
        if not c.get("lip_sync"): continue
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

# ───────────────────────── 5 · NÂNG NÉT / GIỮ MẶT (tuỳ chọn) ─────────────────────────
def buoc_nang_net(cfg, base):
    """Real-ESRGAN + CodeFormer: nâng nét & ổn định khuôn mặt. Điểm nối repo ngoài."""
    log("Nâng nét: cài Real-ESRGAN/CodeFormer rồi chạy trên từng clip trong", base / "clip",
        "— bỏ qua nếu chưa cài.")

# ───────────────────────── 6 · PHỤ ĐỀ (faster-whisper) ─────────────────────────
def buoc_phu_de(cfg, base):
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
def buoc_rap(cfg, base, W=1080, Hh=1920, fps=30):
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
THU_TU = ["anh","video","giong","lipsync","nang_net","phu_de","rap"]

def plan(cfg, base):
    log("PHIM:", cfg["phim"]["ten"], "| cảnh:", len(cfg["canh"]),
        "| tổng ~", sum(c.get("giay",5) for c in cfg["canh"]), "giây")
    log("Pipeline:", json.dumps(cfg.get("pipeline",{}), ensure_ascii=False))
    for c in cfg["canh"]:
        print(f"   #{c.get('thu_tu')} [{c.get('nhan_vat')}] {c.get('loai')} · {c.get('giay')}s"
              f" · lip-sync={bool(c.get('lip_sync'))}")
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
