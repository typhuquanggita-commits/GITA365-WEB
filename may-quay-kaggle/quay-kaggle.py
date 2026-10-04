# ═══════════════════════════════════════════════════════════════
#  GITA 365 · MÁY QUAY VIDEO TRÊN KAGGLE (GPU T4 miễn phí)
#
#  CÁCH DÙNG (làm một lần, khoảng 10 phút):
#    1. Vào kaggle.com → đăng ký bằng Gmail → xác minh số điện thoại
#       (bắt buộc để được GPU miễn phí, khoảng 30 giờ/tuần).
#    2. Bấm "New Notebook". Bên phải: Add-ons → Secrets → thêm 1 dòng:
#         GITA_KHOA_QUAY = (khoá xưởng quay — lấy ở GitHub secret
#                           GITA_KHOA_XUONG_QUAY của kho GITA365-WEB)
#       Panel bên phải: Settings → Accelerator → GPU T4 x2.
#       Settings → Internet → On.
#    3. Dán TOÀN BỘ tệp này vào ô code đầu tiên → bấm Run.
#    4. Máy tự nhận việc video từ hàng chờ, quay xong tự nộp về
#       máy chủ. Không làm gì thêm. Mỗi phiên Kaggle chạy tối đa
#       khoảng 9 giờ; hết thì bấm Run lại.
#
#  Chỉ nhận việc loại 'vd' (video chuyển động). Việc khớp môi và
#  chuyển động nhẹ vẫn do máy GitHub làm như cũ.
# ═══════════════════════════════════════════════════════════════

import os, io, time, json, urllib.request

MAY_CHU = "https://gita365.typhuquanggita.workers.dev"
TEN_MAY = "kaggle-" + str(int(time.time()))

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
    with urllib.request.urlopen(req, timeout=120) as r:
        return r.status, r.read()

def nhan_viec():
    _, b = goi("/quay/nhan", "POST",
               json.dumps({"may": TEN_MAY, "loai": "vd"}).encode())
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

# ── Nạp mô hình video (lần đầu khoảng 5–10 phút tải về) ──
import subprocess
subprocess.run(["pip", "install", "-q", "diffusers>=0.32", "transformers",
                "accelerate", "sentencepiece", "imageio[ffmpeg]"], check=True)

import torch
assert torch.cuda.is_available(), "Chưa bật GPU: Settings → Accelerator → GPU T4 rồi Run lại."

from diffusers import LTXImageToVideoPipeline
from diffusers.utils import load_image, export_to_video

print("Đang tải mô hình LTX-Video (chỉ lần đầu)...", flush=True)
ong = LTXImageToVideoPipeline.from_pretrained(
    "Lightricks/LTX-Video", torch_dtype=torch.bfloat16)
ong.enable_model_cpu_offload()
print("Mô hình sẵn sàng. Máy bắt đầu nhận việc.", flush=True)

def quay(ma):
    _, anh_b = goi("/quay/tep/" + ma + "/anh")
    _, loi_b = goi("/quay/tep/" + ma + "/loi")
    loi = loi_b.decode("utf-8", "replace")
    anh = load_image(io.BytesIO(anh_b))
    w, h = anh.size
    # Giữ tỷ lệ ảnh, làm tròn bội số 32; ảnh dọc 9:16 quay 384×640
    ty_le = w / h
    if ty_le < 0.8:
        ww, hh = 384, 640
    else:
        hh = 512
        ww = max(256, min(768, int(hh * ty_le // 32) * 32))
    loi_day_du = (loi +
        ", cinematic lighting, photorealistic, smooth motion, film quality")
    video = ong(
        image=anh.resize((ww, hh)),
        prompt=loi_day_du,
        negative_prompt="worst quality, inconsistent motion, blurry, distorted face",
        width=ww, height=hh,
        num_frames=65,            # 65 khung ≈ 2.7 giây ở 24 fps
        num_inference_steps=25,
        frames_per_second=24,
        generator=torch.Generator(device="cpu").manual_seed(42),
    ).frames[0]
    export_to_video(video, "/tmp/kq.mp4", fps=24)
    with open("/tmp/kq.mp4", "rb") as f:
        mp4 = f.read()
    goi("/quay/kq/" + ma, "PUT", mp4, "video/mp4")
    print("Xong việc", ma, flush=True)

SO_VIEC = 0
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
            print("Đã quay", SO_VIEC, "clip. Hàng chờ trống — ngủ 3 phút.", flush=True)
        time.sleep(180)
        continue
    try:
        quay(v["ma"])
        SO_VIEC += 1
    except Exception as e:
        print("Hỏng việc", v["ma"], ":", e, flush=True)
        bao_loi(v["ma"], e)
