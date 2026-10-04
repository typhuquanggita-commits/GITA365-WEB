# ═══════════════════════════════════════════════════════════════
#  GITA 365 · MÁY VẼ NHÂN VẬT AI TRÊN KAGGLE (GPU T4 miễn phí)
#
#  Vẽ nhân vật chất lượng điện ảnh bằng FLUX.1-schnell — mô hình
#  tạo người chân thực nhất hiện nay, giấy phép Apache-2.0 (được
#  dùng thương mại, không tốn tiền). Không dùng ảnh khách hàng:
#  nhân vật hoàn toàn do AI tạo ra từ lời mô tả.
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
#    4. Máy tự nhận việc vẽ nhân vật từ hàng chờ, vẽ xong tự nộp ảnh
#       về máy chủ. Mỗi phiên Kaggle chạy tối đa khoảng 9 giờ; hết
#       thì bấm Run lại.
#
#  Chỉ nhận việc loại 'nv' (tạo nhân vật). Nếu việc kèm "ảnh gốc"
#  (nhân vật AI đã vẽ trước đó), máy vẽ lại từ ảnh gốc để GIỮ NGUYÊN
#  gương mặt qua nhiều bối cảnh — nhân vật đồng nhất xuyên suốt phim.
#  Notebook này chạy được chung tài khoản Kaggle với notebook quay
#  video (quay-kaggle.py); mở 2 notebook song song thì cả 2 cùng làm.
# ═══════════════════════════════════════════════════════════════

import os, io, time, json, urllib.request

MAY_CHU = "https://gita365.typhuquanggita.workers.dev"
TEN_MAY = "kaggle-nv-" + str(int(time.time()))

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
               json.dumps({"may": TEN_MAY, "loai": "nv"}).encode())
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

# ── Nạp mô hình vẽ (lần đầu tải khoảng 35GB, mất 15–20 phút) ──
import subprocess
subprocess.run(["pip", "install", "-q", "diffusers>=0.32", "transformers",
                "accelerate", "sentencepiece", "safetensors"], check=True)

import torch
assert torch.cuda.is_available(), "Chưa bật GPU: Settings → Accelerator → GPU T4 rồi Run lại."

from diffusers import FluxPipeline, FluxImg2ImgPipeline
from diffusers.utils import load_image

print("Đang tải mô hình FLUX.1-schnell (chỉ lần đầu)...", flush=True)
ong_ve = FluxPipeline.from_pretrained(
    "black-forest-labs/FLUX.1-schnell", torch_dtype=torch.bfloat16)
ong_ve.enable_model_cpu_offload()
ong_giu_net = FluxImg2ImgPipeline.from_pretrained(
    "black-forest-labs/FLUX.1-schnell", torch_dtype=torch.bfloat16)
ong_giu_net.enable_model_cpu_offload()
print("Mô hình sẵn sàng. Máy bắt đầu nhận việc vẽ nhân vật.", flush=True)

# Đuôi chất lượng: theo chuẩn phim ngắn dọc đang hút khách — diễn viên
# đẹp như thần tượng nhưng da/tóc có chi tiết thật, ánh sáng điện ảnh,
# nền mờ nghệ thuật, cận cảnh cảm xúc. Bối cảnh (phòng khách, vườn,
# lớp học, quán cà phê...) do lời mô tả của từng cảnh quyết định.
DUOI_CHAT_LUONG = (", phim truyện chất lượng cao, gương mặt đẹp tự nhiên, "
    "da mịn có chi tiết thật, tóc tạo kiểu điện ảnh, ánh sáng vành tóc "
    "ấm, nền mờ nghệ thuật shallow depth of field, cận cảnh biểu cảm "
    "cảm xúc, màu phim điện ảnh ấm áp, chụp bằng ống kính 85mm f/1.4, "
    "vertical drama cinematography, photorealistic, cinematic film "
    "still, ultra detailed, sharp focus")

def ve(ma):
    _, loi_b = goi("/quay/tep/" + ma + "/loi")
    mo_ta = loi_b.decode("utf-8", "replace").strip()
    loi_day_du = mo_ta + DUOI_CHAT_LUONG

    # Việc có ảnh gốc (nhân vật AI đã vẽ trước): vẽ lại từ ảnh đó để
    # giữ cùng một gương mặt ở bối cảnh mới.
    anh_goc = None
    try:
        _, anh_b = goi("/quay/tep/" + ma + "/anh")
        anh_goc = load_image(io.BytesIO(anh_b)).convert("RGB")
    except Exception:
        anh_goc = None

    rong, cao = 720, 1280   # khung dọc 9:16 chuẩn phim ngắn, bội số 16
    seed = torch.Generator(device="cpu").manual_seed(42)
    if anh_goc is not None:
        anh_goc = anh_goc.resize((rong, cao))
        anh = ong_giu_net(
            prompt=loi_day_du, image=anh_goc,
            strength=0.55,            # giữ gương mặt, đổi bối cảnh/dáng
            num_inference_steps=8, guidance_scale=0.0,
            generator=seed,
        ).images[0]
    else:
        anh = ong_ve(
            prompt=loi_day_du,
            width=rong, height=cao,
            num_inference_steps=4, guidance_scale=0.0,
            max_sequence_length=256,
            generator=seed,
        ).images[0]

    anh.save("/tmp/kq.png", format="PNG")
    with open("/tmp/kq.png", "rb") as f:
        png = f.read()
    goi("/quay/kq/" + ma, "PUT", png, "image/png")
    print("Xong việc", ma, "(có ảnh gốc)" if anh_goc is not None else "", flush=True)

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
            print("Đã vẽ", SO_VIEC, "nhân vật. Hàng chờ trống — ngủ 3 phút.", flush=True)
        time.sleep(180)
        continue
    try:
        ve(v["ma"])
        SO_VIEC += 1
    except Exception as e:
        print("Hỏng việc", v["ma"], ":", e, flush=True)
        bao_loi(v["ma"], e)
