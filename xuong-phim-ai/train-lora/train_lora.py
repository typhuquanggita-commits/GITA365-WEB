#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
GITA 365 · Train LoRA KHUÔN MẶT cho MỘT nhân vật (SDXL, chạy Kaggle GPU).

Từ 10–20 ảnh của một người → một file LoRA .safetensors khoá đúng mặt. Gắn
tên LoRA vào app (ô "LoRA" của nhân vật) là mọi cảnh sau ra đúng người đó.

Dùng kohya sd-scripts (chuẩn SDXL LoRA). Trigger (từ khoá) PHẢI khớp app:
  trigger = "gita" + id-nhân-vật bỏ ký tự đặc biệt, viết thường
  (vd id "nv-trainer" → "gitanvtrainer").

  # Kiểm ảnh (không GPU):
  python train_lora.py --nhan-vat nv-trainer --anh-dir anh-train/nv-trainer --plan
  # Train (GPU):
  python train_lora.py --nhan-vat nv-trainer --anh-dir anh-train/nv-trainer

Kết quả: lora/<id>.safetensors  → tải lên Kaggle dataset cast (thư mục lora/)
và điền tên "<id>" vào ô LoRA của nhân vật trong app.

⚠️ T4 16GB: SDXL LoRA khá nặng. Mặc định đặt resolution 768 + network_dim 16
cho vừa VRAM. Nếu hết VRAM (OOM): giảm --res 640 hoặc --dim 8. P100/≥24GB có
thể --res 1024.  Chưa chạy thử ở đây — lần đầu có thể cần chỉnh, báo log sẽ sửa.
"""
import os, sys, argparse, subprocess, shutil, glob
from pathlib import Path

def log(*a): print("·", *a, flush=True)

def trigger_cua(nid):
    return "gita" + "".join(ch for ch in str(nid) if ch.isalnum()).lower()

def chuan_bi_dataset(nid, anh_dir, repeats, mota, work):
    """kohya cần cấu trúc  <repeats>_<tên>/  chứa ảnh + .txt caption cùng tên."""
    trg = trigger_cua(nid)
    tdir = Path(work) / f"{repeats}_{trg}"
    tdir.mkdir(parents=True, exist_ok=True)
    anhs = []
    for ext in ("*.png", "*.jpg", "*.jpeg", "*.webp"):
        anhs += glob.glob(str(Path(anh_dir) / ext))
    anhs = sorted(anhs)
    if not anhs:
        raise SystemExit(f"Không thấy ảnh trong {anh_dir} (cần 10–20 ảnh của một người).")
    cap = trg + ((", " + mota) if mota else ", a photo of a person, photorealistic")
    for i, a in enumerate(anhs):
        dst = tdir / f"{trg}_{i:03d}{Path(a).suffix.lower()}"
        shutil.copy(a, dst)
        dst.with_suffix(".txt").write_text(cap, encoding="utf-8")
    log(f"Dataset: {len(anhs)} ảnh · trigger '{trg}' · caption: \"{cap}\"")
    return str(Path(work)), trg, len(anhs)

def cai_kohya(root="sd-scripts"):
    if not Path(root).exists():
        subprocess.run(["git", "clone", "--depth", "1",
                        "https://github.com/kohya-ss/sd-scripts", root], check=True)
    # Thư viện: cài gọn cho SDXL LoRA
    subprocess.run([sys.executable, "-m", "pip", "install", "-q",
                    "torch", "accelerate", "transformers", "diffusers", "safetensors",
                    "xformers", "bitsandbytes", "opencv-python-headless", "ftfy", "einops",
                    "library" if False else "voluptuous", "toml"], check=False)
    return root

def main():
    ap = argparse.ArgumentParser(description="Train LoRA khuôn mặt một nhân vật (SDXL)")
    ap.add_argument("--nhan-vat", required=True, help="id nhân vật (khớp app), vd nv-trainer")
    ap.add_argument("--anh-dir", default="", help="thư mục ảnh (mặc định anh-train/<id>)")
    ap.add_argument("--out", default="lora")
    ap.add_argument("--base", default="stabilityai/stable-diffusion-xl-base-1.0")
    ap.add_argument("--mota", default="", help="mô tả ngắn (tuỳ chọn) đưa vào caption")
    ap.add_argument("--repeats", type=int, default=10)
    ap.add_argument("--steps", type=int, default=1400)
    ap.add_argument("--res", type=int, default=768)
    ap.add_argument("--dim", type=int, default=16)
    ap.add_argument("--lr", default="1e-4")
    ap.add_argument("--plan", action="store_true", help="chỉ kiểm ảnh, không train (không GPU)")
    a = ap.parse_args()

    nid = a.nhan_vat
    anh_dir = a.anh_dir or f"anh-train/{nid}"
    Path(a.out).mkdir(parents=True, exist_ok=True)
    work = f"_train/{nid}"
    Path(work).mkdir(parents=True, exist_ok=True)

    tdir_root, trg, n = chuan_bi_dataset(nid, anh_dir, a.repeats, a.mota, work)
    log(f"Số bước train: {a.steps} · res {a.res} · dim {a.dim} · base {a.base}")
    log(f"Sau khi xong, điền ô LoRA của nhân vật trong app = '{nid}' (dùng trigger '{trg}').")
    if a.plan:
        log("PLAN xong — có GPU thì bỏ --plan để train thật.")
        return

    root = cai_kohya()
    out_name = nid
    cmd = [
        "accelerate", "launch", "--num_cpu_threads_per_process", "2",
        f"{root}/sdxl_train_network.py",
        "--pretrained_model_name_or_path", a.base,
        "--train_data_dir", tdir_root,
        "--output_dir", a.out, "--output_name", out_name,
        "--resolution", f"{a.res},{a.res}",
        "--network_module", "networks.lora",
        "--network_dim", str(a.dim), "--network_alpha", str(max(1, a.dim // 2)),
        "--train_batch_size", "1", "--max_train_steps", str(a.steps),
        "--learning_rate", a.lr, "--unet_lr", a.lr, "--text_encoder_lr", str(float(a.lr) / 2),
        "--lr_scheduler", "cosine", "--lr_warmup_steps", "50",
        "--optimizer_type", "AdamW8bit",
        "--mixed_precision", "fp16", "--save_precision", "fp16",
        "--cache_latents", "--cache_latents_to_disk",
        "--gradient_checkpointing", "--xformers", "--no_half_vae",
        "--save_model_as", "safetensors", "--caption_extension", ".txt",
        "--max_data_loader_n_workers", "1", "--seed", "42",
    ]
    log("Chạy kohya SDXL LoRA…")
    log(" ".join(cmd))
    try:
        subprocess.run(cmd, check=True)
        out = Path(a.out) / f"{out_name}.safetensors"
        if out.exists():
            log("✅ LoRA xong:", out, "· trigger:", trg)
            log("→ Tải file này lên Kaggle dataset cast (thư mục lora/) và điền ô LoRA =", nid, "trong app.")
        else:
            log("Train xong nhưng không thấy file .safetensors — kiểm log kohya.")
    except subprocess.CalledProcessError as e:
        log("Train lỗi (", str(e)[:120], ") — thường do hết VRAM: thử --res 640 hoặc --dim 8.")
        raise

if __name__ == "__main__":
    main()
