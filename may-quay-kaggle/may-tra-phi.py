# ═══════════════════════════════════════════════════════════════
#  GITA 365 · MÁY QUAY TRẢ PHÍ (GPU thuê theo giờ: RunPod · Modal · Vast…)
#
#  Chủ hệ mở 3–10 USD cho một tập phim 30 phút. Máy này là "thợ" của xưởng
#  phim có trần (may-chu/phim-ngan-sach.js):
#    · chỉ nhận việc ĐÃ GIỮ TIỀN trên máy chủ (khai traPhi);
#    · nhận kèm HẠN GIỜ GPU và TỰ DỪNG trước khi chạm hạn;
#    · quay xong gửi BIÊN NHẬN: bao nhiêu giây GPU, ra bao nhiêu giây phim,
#      một câu người đọc được. Tiền do máy chủ tính, máy này không gửi số tiền.
#
#  CÁCH CHẠY (trên máy GPU đã thuê, có Python 3.10+ và CUDA):
#    export GITA_KHOA_QUAY=...      # khoá xưởng quay (GitHub secret
#                                   # GITA_KHOA_XUONG_QUAY) — KHÔNG dán vào tệp
#    python3 may-tra-phi.py
#
#  ĐIỀU PHẢI BIẾT VỀ TIỀN (nói thẳng):
#    · Trần của máy chủ chỉ tính GIÂY QUAY từng cảnh. Thời gian máy thuê nằm
#      không, tải mô hình, khởi động KHÔNG nằm trong trần — nhà cho thuê vẫn
#      tính tiền những phút ấy. Nên máy này TỰ THOÁT khi hàng chờ trống quá
#      GITA_NGHI_TOI_DA phút (mặc định 10). Thoát xong phải TẮT máy thuê ở
#      trang của nhà cho thuê, hoặc dùng loại "serverless" chỉ tính giây chạy.
#    · Mô hình mặc định là LTX-Video (đã chạy ở bản Kaggle miễn phí). Mức
#      "canBang"/"caoNhat" xin Wan 2.2 qua GITA_WAN_ID; chưa khai thì máy
#      quay bằng LTX và NÓI RA điều đó trong biên nhận — không im lặng đổi.
#    · Các hệ số tốc độ trên máy chủ là ƯỚC TÍNH cho tới khi có 5 biên nhận
#      thật mỗi loại cảnh; từ đó máy chủ tự dùng số đo được.
# ═══════════════════════════════════════════════════════════════

import os, io, sys, time, json, urllib.request

MAY_CHU = os.environ.get("GITA_MAY_CHU", "https://gita365.typhuquanggita.workers.dev").rstrip("/")
TEN_MAY = os.environ.get("GITA_TEN_MAY", "thue-" + str(int(time.time())))
NGHI_TOI_DA = float(os.environ.get("GITA_NGHI_TOI_DA", "10")) * 60      # giây
SO_BUOC = int(os.environ.get("GITA_SO_BUOC", "30"))
LTX_ID = os.environ.get("GITA_LTX_ID", "Lightricks/LTX-Video")
WAN_ID = os.environ.get("GITA_WAN_ID", "").strip()                     # ví dụ: bản Wan 2.2 dạng Diffusers
DU_TRU = 0.92   # dừng khi chạm 92% hạn giờ — chừa chỗ cho bước ghi tệp

KHOA = os.environ.get("GITA_KHOA_QUAY", "").strip()
if len(KHOA) < 32:
    sys.exit("Thiếu khoá: export GITA_KHOA_QUAY=... rồi chạy lại. (Không dán khoá vào tệp.)")
# Khoá riêng của máy trả phí — chỉ cần khi máy chủ khai GITA_KHOA_MAY_TRA_PHI.
KHOA_TRA_PHI = os.environ.get("GITA_KHOA_TRA_PHI", "").strip()

UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36")


def goi(duong, phuong_thuc="GET", than=None, kieu=None):
    req = urllib.request.Request(
        MAY_CHU + duong, data=than, method=phuong_thuc,
        headers=dict({"X-Khoa-Quay": KHOA, "User-Agent": UA,
                      "Content-Type": kieu or "application/json"},
                     **({"X-Khoa-Tra-Phi": KHOA_TRA_PHI} if KHOA_TRA_PHI else {})))
    with urllib.request.urlopen(req, timeout=120) as r:
        return r.status, r.read()


def goi_json(duong, o):
    _, b = goi(duong, "POST", json.dumps(o).encode())
    return json.loads(b.decode() or "{}")


def bien_nhan(ma, ok, gpu_giay, giay_ra, say):
    """Một biên nhận — không mang số tiền nào."""
    try:
        return goi_json("/quay/bien-nhan/" + ma, {
            "ok": bool(ok), "gpuGiay": round(float(gpu_giay), 1),
            "giayRa": round(float(giay_ra), 2), "say": str(say)[:200],
            "khoaR2": "quay/" + ma + "/kq.mp4" if ok else ""})
    except Exception as e:
        print("Không gửi được biên nhận:", e, flush=True)
        return {}


def bao_loi(ma, loi):
    """Báo hỏng — KHÔNG tạm thời: máy chủ không giao lại việc trả phí trên
    cùng khoản giữ tiền; người giao lại cảnh bằng một lượt giữ tiền mới."""
    try:
        goi_json("/quay/loi/" + ma, {"loi": str(loi)[:180]})
    except Exception:
        pass


class HetGio(Exception):
    pass


# ── Nạp mô hình (không tính vào giờ của cảnh nào — xem ghi chú đầu tệp) ──
import torch
if not torch.cuda.is_available():
    sys.exit("Máy này không có GPU CUDA.")
from diffusers.utils import load_image, export_to_video

ONG = {}


def ong_ltx():
    if "ltx" not in ONG:
        from diffusers import LTXImageToVideoPipeline
        print("Tải LTX-Video…", flush=True)
        p = LTXImageToVideoPipeline.from_pretrained(LTX_ID, torch_dtype=torch.bfloat16).to("cuda")
        ONG["ltx"] = p
    return ONG["ltx"]


def ong_wan():
    """Wan 2.2 chỉ khi chủ hệ khai GITA_WAN_ID. Không khai → None."""
    if not WAN_ID:
        return None
    if "wan" not in ONG:
        from diffusers import WanImageToVideoPipeline
        print("Tải Wan:", WAN_ID, flush=True)
        ONG["wan"] = WanImageToVideoPipeline.from_pretrained(WAN_ID, torch_dtype=torch.bfloat16).to("cuda")
    return ONG["wan"]


def kich_thuoc(anh, boi):
    w, h = anh.size
    if w / h < 0.8:            # dọc 9:16
        return 512, 768
    if w / h > 1.25:           # ngang 16:9
        return 768, 512
    return 640, 640 - (640 % boi)


def quay(viec):
    ma = viec["ma"]
    han = float(viec.get("tranGiayGpu") or 0)
    giay_ra = max(1.0, min(30.0, float(viec.get("giayRa") or 5)))
    chat = viec.get("chatLuong") or "canBang"
    if han <= 0:
        raise RuntimeError("Việc trả phí không mang hạn giờ GPU — không quay.")
    _, anh_b = goi("/quay/tep/" + ma + "/anh")
    _, loi_b = goi("/quay/tep/" + ma + "/loi")
    loi = loi_b.decode("utf-8", "replace")
    anh = load_image(io.BytesIO(anh_b))

    ong, ten_mo_hinh, ghi_chu = None, "LTX-Video", ""
    if chat in ("canBang", "caoNhat"):
        ong = ong_wan()
        if ong is not None:
            ten_mo_hinh = "Wan 2.2"
        else:
            ghi_chu = " (dự án xin " + chat + " nhưng máy chưa khai Wan — quay bằng LTX)"
    if ong is None:
        ong = ong_ltx()

    fps = 24 if ten_mo_hinh == "LTX-Video" else 16
    so_khung = int(giay_ra * fps)
    so_khung = so_khung - (so_khung % 8) + 1 if ten_mo_hinh == "LTX-Video" else so_khung - (so_khung % 4) + 1
    ww, hh = kich_thuoc(anh, 32 if ten_mo_hinh == "LTX-Video" else 16)
    buoc = SO_BUOC if chat != "tietKiem" else max(8, SO_BUOC // 3)

    bat_dau = time.time()
    buoc_xong = [0]
    moc = [bat_dau]

    def canh_gio(pipe, i, t, kw):
        # Dừng TRƯỚC bước sẽ làm quá hạn, không đợi quá rồi mới dừng: chỉ
        # kiểm ở cuối bước thì một bước dài là một lần vượt hạn — bộ soát
        # đối kháng chạy thử ra 120% hạn. Đoán bước sau dài bằng bước vừa xong.
        bay = time.time()
        buoc_xong[0] = i + 1
        dai = bay - moc[0]
        moc[0] = bay
        if (bay - bat_dau) + dai > han * DU_TRU:
            raise HetGio("dừng trước bước %d/%d để không vượt hạn giờ GPU" % (i + 2, buoc))
        return kw

    try:
        khung = ong(image=anh.resize((ww, hh)),
                    prompt=loi + ", cinematic lighting, natural motion, consistent face",
                    negative_prompt="worst quality, distorted face, flicker, blurry",
                    width=ww, height=hh, num_frames=so_khung,
                    num_inference_steps=buoc,
                    generator=torch.Generator(device="cuda").manual_seed(42),
                    callback_on_step_end=canh_gio).frames[0]
        export_to_video(khung, "/tmp/kq.mp4", fps=fps)
    except HetGio as e:
        gpu = time.time() - bat_dau
        bien_nhan(ma, False, gpu, 0, "Dừng: " + str(e) + " — giao lại ở mức rẻ hơn hoặc cảnh ngắn hơn.")
        bao_loi(ma, "Dừng vì chạm hạn giờ GPU.")
        print("Dừng việc", ma, "vì hạn giờ.", flush=True)
        return False
    except Exception as e:
        # Hỏng GIỮA lúc quay (hết bộ nhớ…): giờ GPU đã đi, biên nhận phải mang
        # đúng số giây ấy — báo 0 là để trần bị vượt mà sổ không biết.
        gpu = time.time() - bat_dau
        bien_nhan(ma, False, gpu, 0, "Hỏng ở bước %d: %s" % (buoc_xong[0], str(e)[:140]))
        bao_loi(ma, e)
        print("Hỏng việc", ma, ":", e, flush=True)
        return False

    gpu = time.time() - bat_dau
    that = round(len(khung) / fps, 2)
    say = "%s %dx%d · %.1f giây phim · %d bước%s" % (ten_mo_hinh, ww, hh, that, buoc, ghi_chu)
    kq = bien_nhan(ma, True, gpu, that, say)
    try:
        with open("/tmp/kq.mp4", "rb") as f:
            goi("/quay/kq/" + ma, "PUT", f.read(), "video/mp4")
    except Exception as e:
        # Nộp phim hỏng SAU khi đã quay: KHÔNG gửi thêm biên nhận nào (một
        # biên nhận 0 giây sẽ đè lên giờ GPU vừa chạy). Báo hỏng để máy chủ
        # giữ biên nhận vừa gửi, hoặc ghi bằng tiền đã giữ nếu biên nhận lạc.
        bao_loi(ma, "Không nộp được phim: " + str(e)[:120])
        print("Quay xong nhưng không nộp được", ma, ":", e, flush=True)
        return False
    print("Xong", ma, "·", say, "· máy chủ ghi", kq.get("thatUsd"), "USD", flush=True)
    if kq.get("duAnDung"):
        print("⚠ Máy chủ đã DỪNG dự án vì cảnh này vượt giờ. Máy thoát.", flush=True)
        sys.exit(0)
    return True


nghi_tu = time.time()
so_canh = 0
print("Máy", TEN_MAY, "bắt đầu nhận việc trả phí từ", MAY_CHU, flush=True)
while True:
    try:
        v = goi_json("/quay/nhan", {"may": TEN_MAY, "loai": "vd", "traPhi": True})
    except Exception as e:
        print("Lỗi mạng, thử lại sau 30 giây:", e, flush=True)
        time.sleep(30)
        continue
    if not v.get("ma"):
        if time.time() - nghi_tu > NGHI_TOI_DA:
            print("Hàng chờ trống quá %d phút — máy THOÁT. Nhớ TẮT máy thuê để ngừng tính tiền."
                  % (NGHI_TOI_DA // 60), flush=True)
            sys.exit(0)
        time.sleep(30)
        continue
    nghi_tu = time.time()
    t_nhan = time.time()
    try:
        if quay(v):
            so_canh += 1
    except Exception as e:
        # Ghi THỜI GIAN TỪ LÚC NHẬN, không ghi 0: không biết lỗi xảy ra trước
        # hay sau khi GPU chạy, mà ghi dư an toàn hơn ghi thiếu.
        print("Hỏng việc", v["ma"], ":", e, flush=True)
        bien_nhan(v["ma"], False, time.time() - t_nhan, 0, "Hỏng: " + str(e)[:150])
        bao_loi(v["ma"], e)
