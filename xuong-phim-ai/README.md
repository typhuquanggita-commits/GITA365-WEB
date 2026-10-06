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
| Cảnh dài 10–30s, nối tiếp liền mạch (đi, chạy, tương tác) | **LongCat-Video** 13,6B — nối đoạn 13 khung điều kiện | MIT | `_longcat()` · `chay_longcat.py` |
| **Máy quay nội bộ**: quay người thật bằng điện thoại → nhân vật GITA diễn y hệt / thay người giữ bối cảnh thật | **Wan 2.2 Animate-14B** | Apache-2.0 | `_wan_animate()` |
| Người dẫn nói cả thân, khớp môi · **hội thoại 2 người** | **InfiniteTalk** single / multi | Apache-2.0 | `_infinitetalk()` |
| Giọng | **Thu âm thật** `thu-am/<mã cảnh>.wav` → **VieNeu-TTS** (Việt) → **Chatterbox** (Anh) | Apache-2.0 · MIT | `buoc_giong()` |
| Khớp chất giọng nhân vật | **OpenVoice V2** — chuyển âm sắc về đúng giọng mẫu (áp được cho tiếng Việt) | MIT | `khop_chat_giong()` |
| Giọng chuẩn phát sóng | lọc ù · khử ồn · EQ rõ tiếng · giảm xì · nén · -16 LUFS; cả phim -14 LUFS, nhạc tự hạ khi có lời | (mã GITA, ffmpeg) | `master_giong()` |
| Giữ mặt + nâng nét | GFPGAN v1.4 + Real-ESRGAN x2 (từng khung hình) | Apache-2.0 · BSD-3 | `_khung_ai()` |
| Mượt 60fps | RIFE (thiếu thì ffmpeg minterpolate) | MIT | `_rife()` |
| **Máy quay ảo** | Đẩy vào/kéo ra/lia/nghiêng/cầm tay — di máy chính xác ở hậu kỳ trên khung 4K | (mã GITA) | `buoc_may_quay()` |
| Phụ đề + thẻ tên | từ thoại đã duyệt, 2 dòng × 32 ký tự (khổ dọc), cân dòng; thẻ tên Trainer/MC lần đầu xuất hiện | (mã GITA, libass) | `dung_ass()` |
| Ráp + nhạc nền | ffmpeg | LGPL/GPL | `buoc_rap()` |
| Thuê ngoài ≤10% | Veo 3.1 Fast cho cảnh then chốt (điểm nối `_goi_api()`) | có phí | `giu_tran_ngoai()` |

**Không dùng cho thương mại:** XTTS v2 (giấy phép CPML phi thương mại, lại không có tiếng Việt) và mô hình
mặt antelopev2 của InstantID (chỉ nghiên cứu). Hai thứ này **mặc định tắt**; khoá mặt bằng LoRA tự train.

## Diễn xuất & máy quay điện ảnh (khai báo trong form cảnh)

- **Diễn xuất:** chọn hành động có sẵn (đi bộ, chạy, ngồi xuống, đứng dậy, cầm/trao đồ vật, bắt tay, ôm,
  trò chuyện, thuyết trình, rót trà…) — động cơ viết sẵn ngữ pháp chuyển động tiếng Anh điện ảnh cho mô hình.
- **Diễn viên thứ hai** + thoại người thứ hai → hội thoại 2 người khớp môi (InfiniteTalk multi).
- **Nối tiếp cảnh trước** → LongCat-Video lấy chính clip trước làm điểm xuất phát: giữ người, tư thế, ánh sáng.
- **Video động tác quay thật** (`dong-tac/<mã cảnh>.mp4`): "diễn theo" hoặc "thay người, giữ bối cảnh thật".
- **Máy quay:** di máy 2D (đẩy, kéo, lia, nghiêng, cầm tay, zoom giật) làm chính xác ở hậu kỳ; di máy 3D
  (bám theo, xoay vòng, cẩu, trượt ngang, dolly zoom, đổi tiêu điểm, flycam) giao cho mô hình.

## Các kho tham khảo đã xét (10/2026)

| Kho | Dùng? | Lý do |
|---|---|---|
| meituan-longcat/LongCat-Video | ✅ đã nối | MIT, cảnh dài + nối tiếp liền mạch; có bản Avatar (âm thanh → người nói, nhiều người) để dùng sau |
| myshell-ai/OpenVoice | ✅ đã nối | MIT, khớp âm sắc giọng nhân vật |
| Wan-Video/Wan2.2 (Animate) | ✅ đã nối | Apache-2.0, diễn theo video động tác quay thật |
| k4yt3x/video2x | ⚪ không cần | cùng thuật toán (Real-ESRGAN, RIFE) xưởng đã có; giấy phép AGPL-3.0 |
| Huanshere/VideoLingo | ⚪ lấy ý tưởng | cắt phụ đề theo chuẩn, căn từng chữ; bản gốc cần API mô hình ngôn ngữ bên ngoài |
| remotion-dev/remotion | ❌ | công ty trên 3 nhân sự phải mua giấy phép; thẻ tên/phụ đề đã làm nội bộ bằng libass |
| coqui-ai/TTS (XTTS v2) | ❌ | mô hình giấy phép phi thương mại, không có tiếng Việt |
| rhasspy/piper | ⚪ dự phòng | đã lưu trữ (10/2025), chuyển sang bản GPL; giọng Việt kém hơn VieNeu, không clone giọng |
| topoteretes/cognee, openai/skills, cs-video-courses | ❌ | không phải công cụ dựng video/giọng |

## Cài một lệnh

```bash
git clone <repo GITA> repo && bash repo/xuong-phim-ai/cai-dat-noi-bo.sh
```

Bộ cài tự dò cỡ card và đĩa trống rồi chọn mức:

| Mức | Khi nào | Cài gì |
|---|---|---|
| `nhe` | thử nhanh | thư viện, giọng, hậu kỳ, SDXL (Wan tải lúc chạy) |
| `vua` (mặc định trên T4/4090) | Kaggle, RTX 4090 | + Wan 2.2 hợp cỡ card |
| `day_du` | card ~80GB và ≥ 250GB đĩa (A100/H100) | + InfiniteTalk (1 & 2 người), LongCat-Video, Wan-Animate |

Chạy lại an toàn (bỏ qua phần đã có). Trọng số RIFE phát hành qua link ngoài → đặt `RIFE_URL=<link .zip>`.
Thử nghiệm InstantID (phi thương mại): `CAI_INSTANTID=1 ANTELOPE_REPO=<repo HF> bash cai-dat-noi-bo.sh`.

## Chuẩn bị bộ cast (một lần)

Đặt trong dataset Kaggle (hoặc cạnh thư mục chạy):

- `lora/<id nhân vật>.safetensors` — LoRA khuôn mặt (train bằng `train-lora/`). Trigger = `gita` + id.
- `lora/<id phim trường>.safetensors` — LoRA phim trường (tuỳ chọn, cùng cách train).
- `nhan-vat/<id>.png` — ảnh mặt mẫu.
- `giong/nam-lon.wav`, `nu-lon.wav`, `nam-teen.wav`, `nu-teen.wav`, `nam-treem.wav`, `nu-treem.wav`
  (3–10 giây mỗi file) · giọng riêng: `giong/<id nhân vật>.wav`.
- `thu-am/<mã cảnh>.wav` — **giọng thật** Trainer/MC đọc câu thoại (ưu tiên số 1); người thứ hai: `thu-am/<mã cảnh>-2.wav`.
- `dong-tac/<mã cảnh>.mp4` — video động tác quay bằng điện thoại (cho cảnh chọn "Video động tác quay thật").
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

## Kho phim Google Drive (2TB) — đường miễn phí

Mọi phim lưu trong Drive của chủ hệ (`GITA365 · Kho phim/Phim/<tháng>/`), xem/chia sẻ ngay trong app (tab 🗄 Kho phim).
Màn "Làm phim nhanh" khi đã nối kho sẽ đi đường miễn phí: Drive → GitHub Action → Kaggle GPU → phim về Drive.
Cài 10 phút: `kho-drive/README-kho-drive.md`.

## Lưu trữ & phát
Đẩy `ket-qua/` lên **Cloudflare R2** (S3-API). Dây chuyền tự động: xem `../tu-dong/README-tu-dong.md`.
