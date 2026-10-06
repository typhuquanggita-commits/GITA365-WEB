#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════
# GITA 365 · Xưởng phim AI — BỘ CÀI NỘI BỘ MỘT LỆNH (máy GPU: Kaggle / Runpod / máy riêng)
#
#   bash xuong-phim-ai/cai-dat-noi-bo.sh            # cài theo cỡ card tự dò
#   MUC=nhe   bash xuong-phim-ai/cai-dat-noi-bo.sh  # chỉ phần nhẹ (ảnh + giọng + hậu kỳ)
#   MUC=day_du bash xuong-phim-ai/cai-dat-noi-bo.sh # thêm InfiniteTalk 14B (cần ≥ 120GB đĩa trống)
#
# Cài vào THƯ MỤC ĐANG ĐỨNG (động cơ tìm InstantID/, InfiniteTalk/, Practical-RIFE/, models/ ở đây).
# Chạy lại an toàn: phần nào có rồi thì bỏ qua. Không cần khoá bí mật nào (model đều công khai).
#
# GIẤY PHÉP (đọc trước khi dùng thương mại):
#   · Wan 2.2, InfiniteTalk, GFPGAN, VieNeu-TTS: Apache-2.0 · Real-ESRGAN: BSD-3 · RIFE, Chatterbox,
#     faster-whisper: MIT · SDXL: OpenRAIL++-M · opus-mt-vi-en: CC-BY-4.0  → dùng thương mại được.
#   · Mô hình mặt antelopev2 (InsightFace) mà InstantID cần: CHỈ cho nghiên cứu phi thương mại.
#     Vì vậy mặc định KHÔNG cài; xưởng khoá mặt bằng LoRA tự train (sạch bản quyền).
#     Muốn thử nghiệm nội bộ: CAI_INSTANTID=1 bash cai-dat-noi-bo.sh
# ═══════════════════════════════════════════════════════════════════════════
set -u
MUC="${MUC:-tu_dong}"
PIP="python -m pip install -q"
GOC="$(pwd)"
log(){ printf '\n▶ %s\n' "$*"; }
co(){ command -v "$1" >/dev/null 2>&1; }

# ── 0 · Dò máy ───────────────────────────────────────────────────────────────
VRAM=0
if co nvidia-smi; then
  VRAM=$(nvidia-smi --query-gpu=memory.total --format=csv,noheader,nounits 2>/dev/null | head -1 | awk '{print int($1/1024)}')
fi
DIA=$(df -Pk "$GOC" | awk 'NR==2{print int($4/1048576)}')
log "Card GPU: ${VRAM}GB · Đĩa trống: ${DIA}GB · Mức cài: ${MUC}"
if [ "$MUC" = "tu_dong" ]; then
  if [ "$VRAM" -ge 40 ] && [ "$DIA" -ge 120 ]; then MUC=day_du; else MUC=vua; fi
  log "Tự chọn mức: $MUC"
fi

# Tải một repo/tệp HuggingFace (bền qua mọi phiên bản huggingface_hub)
tai_hf(){  # $1 repo · $2 thư mục · $3 mẫu tệp (tuỳ chọn, cách nhau dấu phẩy) · $4 revision (tuỳ chọn)
  python - "$@" <<'PY'
import sys
from huggingface_hub import snapshot_download
repo, dich = sys.argv[1], sys.argv[2]
mau = [x for x in (sys.argv[3] if len(sys.argv) > 3 else "").split(",") if x] or None
rev = sys.argv[4] if len(sys.argv) > 4 and sys.argv[4] else None
snapshot_download(repo_id=repo, local_dir=dich, allow_patterns=mau, revision=rev)
print("  ✓", repo, "→", dich)
PY
}
tai(){ [ -s "$2" ] && { echo "  ✓ có sẵn $2"; return 0; }; mkdir -p "$(dirname "$2")"; curl -fL --retry 3 -o "$2" "$1" && echo "  ✓ $2"; }

# ── 1 · Thư viện lõi ────────────────────────────────────────────────────────
log "1/7 Thư viện lõi (diffusers, transformers, ffmpeg…)"
co ffmpeg || { (apt-get update -qq && apt-get install -y -qq ffmpeg) >/dev/null 2>&1 || $PIP imageio-ffmpeg; }
$PIP "diffusers>=0.33" "transformers>=4.44" accelerate safetensors peft huggingface_hub \
     "imageio[ffmpeg]" opencv-python-headless pillow numpy sentencepiece sacremoses \
     faster-whisper boto3 || true

# ── 2 · Giọng nội bộ (dùng thương mại được) ─────────────────────────────────
log "2/7 Giọng: VieNeu-TTS (tiếng Việt, Apache-2.0) + Chatterbox (tiếng Anh, MIT)"
$PIP vieneu || echo "  ⚠ chưa cài được vieneu — xem https://github.com/pnnbao97/VieNeu-TTS"
$PIP chatterbox-tts || echo "  ⚠ chưa cài được chatterbox-tts"
python -c "from transformers import MarianMTModel,MarianTokenizer as T; T.from_pretrained('Helsinki-NLP/opus-mt-vi-en'); MarianMTModel.from_pretrained('Helsinki-NLP/opus-mt-vi-en'); print('  ✓ bộ dịch vi→en nội bộ')" || true

# ── 3 · Hậu kỳ AI: giữ mặt + nâng nét + mượt 60fps ─────────────────────────
log "3/7 Hậu kỳ: GFPGAN v1.4 + Real-ESRGAN x2 + RIFE"
$PIP basicsr facexlib gfpgan realesrgan || true
# basicsr cũ gọi torchvision.transforms.functional_tensor (đã bỏ ở torchvision mới) → vá một dòng
DEG=$(python -c "import importlib.util as u; s=u.find_spec('basicsr'); print(s.submodule_search_locations[0]+'/data/degradations.py' if s else '')" 2>/dev/null)
[ -n "$DEG" ] && [ -f "$DEG" ] && sed -i 's/torchvision.transforms.functional_tensor/torchvision.transforms.functional/' "$DEG" && echo "  ✓ đã vá basicsr"
tai https://github.com/TencentARC/GFPGAN/releases/download/v1.3.0/GFPGANv1.4.pth models/GFPGANv1.4.pth
tai https://github.com/xinntao/Real-ESRGAN/releases/download/v0.2.1/RealESRGAN_x2plus.pth models/RealESRGAN_x2plus.pth
[ -d Practical-RIFE ] || git clone -q --depth 1 https://github.com/hzwer/Practical-RIFE
if [ ! -d Practical-RIFE/train_log ]; then
  if [ -n "${RIFE_URL:-}" ]; then
    # Trọng số RIFE phát hành qua Google Drive/HF theo README của repo → đặt link vào RIFE_URL (.zip)
    curl -fL -o /tmp/rife.zip "$RIFE_URL" && (cd Practical-RIFE && python -m zipfile -e /tmp/rife.zip .) && echo "  ✓ RIFE"
  else
    echo "  ⚠ Chưa có trọng số RIFE (Practical-RIFE/train_log). Động cơ tự dùng minterpolate của ffmpeg."
    echo "    Tải theo README https://github.com/hzwer/Practical-RIFE rồi đặt RIFE_URL=<link .zip> và chạy lại."
  fi
fi

# ── 4 · Ảnh nhân vật: SDXL + LoRA (+ InstantID nếu tự bật) ─────────────────
log "4/7 Ảnh nhân vật: SDXL base (khoá mặt bằng LoRA tự train)"
python -c "from huggingface_hub import snapshot_download as s; s('stabilityai/stable-diffusion-xl-base-1.0', allow_patterns=['*.json','*.txt','*fp16.safetensors']); print('  ✓ SDXL')" || true
if [ "${CAI_INSTANTID:-0}" = "1" ]; then
  echo "  ⚠ InstantID dùng mô hình mặt antelopev2 — CHỈ nghiên cứu phi thương mại."
  $PIP insightface onnxruntime-gpu || $PIP insightface onnxruntime || true
  [ -d InstantID ] || git clone -q --depth 1 https://github.com/instantX-research/InstantID
  tai_hf InstantX/InstantID InstantID/checkpoints "ControlNetModel/config.json,ControlNetModel/diffusion_pytorch_model.safetensors,ip-adapter.bin" || true
  # antelopev2: README InstantID tải tay; đặt ANTELOPE_REPO=<repo HF chứa 5 tệp .onnx> nếu dùng bản sao
  if [ -n "${ANTELOPE_REPO:-}" ] && [ ! -d InstantID/models/antelopev2 ]; then
    tai_hf "$ANTELOPE_REPO" InstantID/models/antelopev2 "*.onnx" || true
  fi
  [ -d InstantID/models/antelopev2 ] || echo "  ⚠ Thiếu InstantID/models/antelopev2 → động cơ tự dùng SDXL + LoRA."
fi

# ── 5 · Video cảnh diễn: Wan 2.2 theo cỡ card ──────────────────────────────
log "5/7 Video cảnh diễn: Wan 2.2 (Apache-2.0)"
if [ "$VRAM" -ge 70 ] && [ "$DIA" -ge 100 ]; then WAN=Wan-AI/Wan2.2-I2V-A14B-Diffusers; else WAN=Wan-AI/Wan2.2-TI2V-5B-Diffusers; fi
if [ "$MUC" = "nhe" ]; then echo "  (mức nhẹ: Wan tải lúc chạy lần đầu)"; else
  python -c "from huggingface_hub import snapshot_download as s; s('$WAN'); print('  ✓ $WAN')" || echo "  ⚠ chưa tải được $WAN (động cơ sẽ tải lúc chạy)"
fi

# ── 6 · Người dẫn nói cả thân: InfiniteTalk (khớp môi thật, không "ảnh mấp máy") ──
log "6/7 InfiniteTalk (MeiGen-AI, Apache-2.0)"
if [ "$MUC" = "day_du" ]; then
  [ -d InfiniteTalk ] || git clone -q --depth 1 https://github.com/MeiGen-AI/InfiniteTalk
  $PIP -r InfiniteTalk/requirements.txt || true
  $PIP misaki[en] ninja psutil packaging librosa xformers || true
  W=InfiniteTalk/weights
  tai_hf Wan-AI/Wan2.1-I2V-14B-480P "$W/Wan2.1-I2V-14B-480P" || true
  tai_hf TencentGameMate/chinese-wav2vec2-base "$W/chinese-wav2vec2-base" || true
  tai_hf TencentGameMate/chinese-wav2vec2-base "$W/chinese-wav2vec2-base" "model.safetensors" "refs/pr/1" || true
  tai_hf MeiGen-AI/InfiniteTalk "$W/InfiniteTalk" "single/*" || true
else
  echo "  (bỏ qua — cần card ≥ 40GB và ≥ 120GB đĩa; chạy MUC=day_du trên A100 80GB / RTX 6000)"
  echo "   Không có InfiniteTalk, cảnh người dẫn chạy Wan 2.2 + lip-sync."
fi

# ── 7 · Kiểm tra cuối ──────────────────────────────────────────────────────
log "7/7 Kiểm tra"
python - <<'PY'
import importlib.util as u, pathlib as P
def ok(x): return "✓" if x else "✗"
print(f"  {ok(u.find_spec('diffusers'))} diffusers   {ok(u.find_spec('vieneu'))} VieNeu-TTS   {ok(u.find_spec('chatterbox'))} Chatterbox")
print(f"  {ok(P.Path('models/GFPGANv1.4.pth').exists())} GFPGAN   {ok(P.Path('models/RealESRGAN_x2plus.pth').exists())} Real-ESRGAN   {ok(P.Path('Practical-RIFE/train_log').exists())} RIFE")
print(f"  {ok(P.Path('InstantID/checkpoints/ip-adapter.bin').exists())} InstantID (tuỳ chọn)   {ok(P.Path('InfiniteTalk/weights/InfiniteTalk').exists())} InfiniteTalk")
PY
echo
echo "Xong. Chạy thử: python xuong-phim-ai/gita_xuong_phim.py --config cau-hinh.json --plan"
