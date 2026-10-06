# GITA 365 · Xưởng phim AI — Động cơ Kaggle (model mở, free)

Đây là **phần 2** của xưởng phim AI. Phần 1 (bộ điều khiển) nằm trong app
GITA: màn **Sản xuất phim AI** → tạo nhân vật, phân cảnh, rồi bấm **"Tải
cấu hình .json"**. File `.json` đó là đầu vào cho động cơ này.

> ⚠️ **Nói thẳng:** đây là mã chạy trên GPU (Kaggle), **không chạy trong
> trình duyệt**. Toàn bộ dùng **model mở, miễn phí**. Chất lượng khá —
> giống reel Facebook tạm ổn; chưa bằng phim AI top YouTube (phần lớn hàng
> đó dùng Veo/Kling có phí). Mã này **chưa được chạy thử trên GPU ở đây**
> (môi trường dựng app không có GPU); khi chạy trên Kaggle gặp lỗi phiên
> bản thư viện là chuyện bình thường — báo lỗi, sẽ sửa cùng.

## Dây chuyền (tất cả model mở)

| Khâu | Model | File/hàm |
|---|---|---|
| Ảnh nhân vật nhất quán | SDXL + **InstantID** (giữ khuôn mặt từ 1 ảnh) | `buoc_anh()` |
| Ảnh → video chuyển động | **CogVideoX-5b I2V** (mặc định) · có thể đổi Wan 2.2 | `buoc_video()` |
| Giọng Việt | **XTTS v2** (clone từ giọng mẫu) | `buoc_giong()` |
| Lip-sync (người nói) | LatentSync / Wav2Lip (repo ngoài) | `buoc_lipsync()` |
| Nâng nét · giữ mặt | Real-ESRGAN + CodeFormer | `buoc_nang_net()` |
| Mượt 60fps | RIFE | (tuỳ chọn) |
| Phụ đề | faster-whisper | `buoc_phu_de()` |
| Ráp phim | ffmpeg | `buoc_rap()` |

## Chuẩn bị trên Kaggle (một lần)

1. Tạo tài khoản Kaggle, **xác minh số điện thoại** để mở GPU.
2. Tạo Notebook mới → Settings → **Accelerator = GPU T4 x2** (hoặc P100).
3. Internet = **On** (để tải model từ HuggingFace).
4. Tải mã này lên: kéo cả thư mục `xuong-phim-ai/` vào, hoặc
   `!git clone` repo GITA rồi `cd xuong-phim-ai`.

## Cách chạy một tập

1. Trong app GITA → **Sản xuất phim AI** → dựng nhân vật & phân cảnh →
   **Tải cấu hình .json**. Upload file đó lên Kaggle (vd `cau-hinh.json`).
2. Chuẩn bị **ảnh khuôn mặt mẫu** cho từng nhân vật, đặt trong thư mục
   `nhan-vat/<id_nhan_vat>.png` (id lấy trong file .json, vd `nv-nam.png`,
   `nv-nu.png`). Dùng chính bộ ảnh mẫu anh/chị đã có.
3. (Người dẫn nói) chuẩn bị **giọng mẫu chia theo giới tính + độ tuổi**:
   `giong/nam-lon.wav`, `giong/nu-lon.wav`, `giong/nam-teen.wav`,
   `giong/nu-teen.wav`, `giong/nam-treem.wav`, `giong/nu-treem.wav`
   (mỗi file 10–20 giây). Mọi nhân vật cùng giới+tuổi dùng chung một giọng;
   muốn giọng riêng cho một người thì thêm `giong/<id-nhân-vật>.wav`.
4. Chạy:

```bash
# Kiểm tra cấu hình + dựng khung thư mục (KHÔNG cần GPU) — chạy được mọi nơi
python gita_xuong_phim.py --config cau-hinh.json --plan

# Chạy full trên GPU (ảnh → video → giọng → lip-sync → ráp)
python gita_xuong_phim.py --config cau-hinh.json --run all

# Hoặc chạy từng khâu để tiết kiệm giờ GPU
python gita_xuong_phim.py --config cau-hinh.json --run anh
python gita_xuong_phim.py --config cau-hinh.json --run video
python gita_xuong_phim.py --config cau-hinh.json --run giong
python gita_xuong_phim.py --config cau-hinh.json --run rap
```

Kết quả nằm trong `ket-qua/<id_phim>/`:
`anh/` (khung tĩnh) · `clip/` (video từng cảnh) · `giong/` · `phim-cuoi.mp4`.

## Giới hạn & mẹo (thật)

- **Chậm:** mỗi clip 5 giây ~3–10 phút trên T4. 1 phút phim ~ 12 clip ~
  1–3 giờ. Kaggle cho ~9–12h/phiên, ~30h/tuần → làm theo mẻ, chạy từng khâu.
- **Giữ mặt nhất quán:** dùng **cùng ảnh mẫu + cùng seed** cho một nhân vật;
  bật CodeFormer để ổn định khuôn mặt sau khi dựng video.
- **Muốn đẹp hơn nữa:** train một **LoRA** cho mỗi nhân vật (10–20 ảnh) rồi
  điền tên LoRA trong app → prompt sẽ gọi LoRA đó.
- Kaggle là nền học/nghiên cứu, có giới hạn TOS — hợp R&D và làm mẻ nhỏ.
  Sản xuất đều/nhiều nên chuyển GPU trả phí (Runpod/Modal/Colab Pro).

## Lưu trữ & phát (tuỳ chọn, Cloudflare)

- Đẩy `ket-qua/` lên **Cloudflare R2** (free 10GB, không phí tải về) bằng
  `rclone`/`boto3` (R2 dùng S3-API). Xem cuối `gita_xuong_phim.py`.
- Phát: đưa `phim-cuoi.mp4` lên Facebook/YouTube trực tiếp, hoặc Cloudflare
  Stream nếu muốn host riêng.
