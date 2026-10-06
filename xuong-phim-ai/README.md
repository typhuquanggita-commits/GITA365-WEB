# GITA 365 · Xưởng phim AI nội bộ — Động cơ (model mở, chạy trên GPU)

Đây là **phần 2** của xưởng phim AI. Phần 1 (bộ điều khiển) nằm trong app GITA: màn **Sản xuất
phim AI** → nhân vật, phim trường, phân cảnh, máy quay, kỹ xảo → **"Tải cấu hình .json"** (hoặc bấm
**Dựng tự động** nếu đã nối Cloudflare + GitHub + Kaggle). File `.json` là đầu vào cho động cơ này.

> ⚠️ **Nói thẳng:** đây là mã chạy trên GPU, **không chạy trong trình duyệt**. Phần hậu kỳ, máy quay
> ảo và ráp phim **đã chạy thử thật** (ffmpeg, CPU). Các khâu cần GPU (ảnh, video, giọng, InfiniteTalk)
> **chưa chạy thử được ở đây** vì môi trường dựng app không có GPU — lần chạy GPU đầu tiên gặp lỗi
> phiên bản thư viện là chuyện bình thường; gửi log, sẽ sửa cùng.

## Xưởng nội bộ 90% — cái gì là "của GITA"

"Nội bộ" nghĩa là **mô hình, quy trình, dữ liệu, khuôn mặt, giọng, phim trường đều nằm trong tay GITA**
(mã nguồn trong repo, model mở tải về máy, LoRA tự train). Chỉ **sức máy (GPU) là thuê theo giờ** —
mua RTX 5090 hơn $3.000, còn thuê 4090 ~ $0,34/giờ. Thuê ngoài dịch vụ (Veo…) bị **khoá trần 10%**.

| Khâu | Nội bộ (model mở) | Giấy phép | Hàm |
|---|---|---|---|
| Dịch kịch bản vi→en cho model | opus-mt-vi-en (chạy trên máy) | CC-BY-4.0 | `dich_en()` |
| Ảnh nhân vật đúng mặt | SDXL + **LoRA nhân vật** tự train (+ LoRA phim trường) | OpenRAIL++-M | `buoc_anh()` |
| Cảnh diễn chuyển động | **Wan 2.2** (A14B 720p trên card ≥70GB · TI2V-5B 720p ≥20GB · 480p trên T4) | Apache-2.0 | `_wan()` |
| Người dẫn nói cả thân, khớp môi | **InfiniteTalk** (ảnh + giọng → video) | Apache-2.0 | `_infinitetalk()` |
| Giọng | **Thu âm thật** `thu-am/<mã cảnh>.wav` → **VieNeu-TTS** (Việt) → **Chatterbox** (Anh) | Apache-2.0 · MIT | `buoc_giong()` |
| Giữ mặt + nâng nét | GFPGAN v1.4 + Real-ESRGAN x2 (từng khung hình) | Apache-2.0 · BSD-3 | `_khung_ai()` |
| Mượt 60fps | RIFE (thiếu thì ffmpeg minterpolate) | MIT | `_rife()` |
| **Máy quay ảo** | Đẩy vào/kéo ra/lia/nghiêng/cầm tay — di máy chính xác ở hậu kỳ trên khung 4K | (mã GITA) | `buoc_may_quay()` |
| Phụ đề | faster-whisper / theo thoại | MIT | `buoc_phu_de()` |
| Ráp + nhạc nền | ffmpeg | LGPL/GPL | `buoc_rap()` |
| Thuê ngoài ≤10% | Veo 3.1 Fast cho cảnh then chốt (điểm nối `_goi_api()`) | có phí | `giu_tran_ngoai()` |

**Không dùng cho thương mại:** XTTS v2 (giấy phép CPML phi thương mại, lại không có tiếng Việt) và mô hình
mặt antelopev2 của InstantID (chỉ nghiên cứu). Hai thứ này **mặc định tắt**; khoá mặt bằng LoRA tự train.

## Cài một lệnh

```bash
git clone <repo GITA> repo && bash repo/xuong-phim-ai/cai-dat-noi-bo.sh
```

Bộ cài tự dò cỡ card và đĩa trống rồi chọn mức:

| Mức | Khi nào | Cài gì |
|---|---|---|
| `nhe` | thử nhanh | thư viện, giọng, hậu kỳ, SDXL (Wan tải lúc chạy) |
| `vua` (mặc định trên T4/4090) | Kaggle, RTX 4090 | + Wan 2.2 hợp cỡ card |
| `day_du` | card ≥ 40GB và ≥ 120GB đĩa (A100 80GB) | + InfiniteTalk 14B |

Chạy lại an toàn (bỏ qua phần đã có). Trọng số RIFE phát hành qua link ngoài → đặt `RIFE_URL=<link .zip>`.
Thử nghiệm InstantID (phi thương mại): `CAI_INSTANTID=1 ANTELOPE_REPO=<repo HF> bash cai-dat-noi-bo.sh`.

## Chuẩn bị bộ cast (một lần)

Đặt trong dataset Kaggle (hoặc cạnh thư mục chạy):

- `lora/<id nhân vật>.safetensors` — LoRA khuôn mặt (train bằng `train-lora/`). Trigger = `gita` + id.
- `lora/<id phim trường>.safetensors` — LoRA phim trường (tuỳ chọn, cùng cách train).
- `nhan-vat/<id>.png` — ảnh mặt mẫu.
- `giong/nam-lon.wav`, `nu-lon.wav`, `nam-teen.wav`, `nu-teen.wav`, `nam-treem.wav`, `nu-treem.wav`
  (3–10 giây mỗi file) · giọng riêng: `giong/<id nhân vật>.wav`.
- `thu-am/<mã cảnh>.wav` — **giọng thật** Trainer/MC đọc câu thoại (ưu tiên số 1).
- `nhac/` — nhạc nền có bản quyền (hậu kỳ trộn ở âm lượng thấp).

## Chạy

```bash
python gita_xuong_phim.py --config cau-hinh.json --plan          # kiểm, không cần GPU
python gita_xuong_phim.py --config cau-hinh.json --run all       # full
python gita_xuong_phim.py --config cau-hinh.json --run anh,giong,video   # từng khâu
```

Thứ tự: `anh → giong → video → lipsync → nang_net → may_quay → phu_de → rap`.
Kết quả: `ket-qua/<id phim>/phim-cuoi.mp4` (1080×1920, 60fps nếu bật Làm mượt).

## Bốn phương án (chọn trong app → Kỹ xảo & Động cơ)

| | **D · Nội bộ 90%** (mặc định) | A · Free | C · Lai | B · Có phí |
|---|---|---|---|---|
| Người dẫn nói | InfiniteTalk (máy GITA) | InfiniteTalk | InfiniteTalk | InfiniteTalk API |
| Cảnh diễn | Wan 2.2 (máy GITA) | Wan 2.2 / FramePack | Seedance API | Seedance API |
| Cảnh then chốt | Veo 3.1 Fast, **trần 10% thời lượng** | Wan 2.2 | Veo 3.1 Fast | Veo 3.1 Fast |
| Thuê ngoài | ≤ 10% | 0% | phần lớn cảnh | 100% |

App có **đồng hồ "% nội bộ"** cho từng tập, và động cơ **tự giữ trần** (`ngoai_toi_da` trong cấu hình):
cảnh vượt trần tự chạy model mở, không vỡ tập.

### Máy GPU thuê theo giờ (giá tra 10/2026, kiểm lại khi thuê)
- **Kaggle**: free ~30 giờ/tuần T4/P100 — không có gói trả phí GPU mạnh hơn. Hợp thử nghiệm, mẻ nhỏ.
- **RTX 4090 24GB** (Runpod Community) ~ $0,34/giờ — Wan 2.2 TI2V-5B 720p.
- **A100 80GB** ~ $1,19/giờ — Wan 2.2 A14B 720p (chất cao nhất bản mở) + InfiniteTalk 14B.

### Nối dịch vụ thuê ngoài (≤10%)
Đặt khoá vào biến môi trường (`VEO_API_KEY`…) và viết hàm `_goi_api()` theo tài liệu nhà cung cấp.
Chưa nối thì cảnh tự chạy model mở.

## Lưu trữ & phát
Đẩy `ket-qua/` lên **Cloudflare R2** (S3-API). Dây chuyền tự động: xem `../tu-dong/README-tu-dong.md`.
