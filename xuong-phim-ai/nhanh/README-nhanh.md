# GITA 365 · Làm phim nhanh — ảnh mẫu + kịch bản → video 1080p (~15 phút)

## Chủ hệ dùng thế nào (không cần biết kỹ thuật)

Vào app GITA → **Xưởng phim AI** → tab **⚡ Làm phim nhanh**:

1. **Ảnh mẫu:** bấm ô 📷 cạnh tên từng nhân vật, chọn một ảnh rõ mặt, nhìn thẳng.
2. **Kịch bản:** dán vào ô. Mỗi đoạn cách nhau một dòng trống:
   ```
   [Bục giảng studio GITA]
   Trainer: Chào anh chị, hôm nay chúng ta nói về kỷ luật tài chính.
   MC: Thưa thầy, bắt đầu từ đâu ạ?

   [Vườn tre] Trainer đi bộ chậm, mỉm cười nhìn về phía máy.
   ```
   `[ ]` là nơi quay · `Tên: lời` là người nói · câu thường là hành động.
   Xưởng tự phân cảnh và hiện ngay số cảnh, độ dài (bấm "Xem xưởng phân cảnh thế nào").
3. Bấm **🎬 Làm phim** → thanh tiến độ chạy → xem video ngay trên trang, bấm **Tải video 1080p**.

Xưởng tự lo: chọn phim trường, hành động, góc máy, giọng theo giới tính/độ tuổi, xử lý giọng chuẩn
phát sóng, phụ đề, thẻ tên Trainer/MC, nhạc nền, ráp 1080p (dọc 9:16 hoặc ngang 16:9).

## Bên trong chạy gì

```
App (trình duyệt) ── ảnh + kế hoạch cảnh ──▶ Trạm Cloudflare (R2) ──▶ Máy GPU Modal
                                                     ▲                    │ ① giọng VieNeu-TTS
                                                     │                    │ ② khung hình Qwen-Image-Edit (8 bước)
                                                     │                    │ ③ mỗi cảnh một H100, SONG SONG:
                                                     │                    │    nói → InfiniteTalk 720p (4 bước)
                                                     │                    │    diễn → Wan 2.2 A14B (4 bước)
                                                     └── phim 1080p ◀──── │ ④ hậu kỳ 30fps 1080p ⑤ ráp
```

| Khâu | Mô hình mở | Giấy phép |
|---|---|---|
| Đặt đúng người vào phim trường | Qwen-Image-Edit-2509 + Qwen-Image-Lightning (8 bước) | Apache-2.0 |
| Cảnh diễn (đi, chạy, cầm đồ vật…) | Wan 2.2 I2V A14B + LightX2V (4 bước) | Apache-2.0 |
| Cảnh nói khớp môi | InfiniteTalk + LightX2V (4 bước), 720p | Apache-2.0 |
| Giọng | VieNeu-TTS (Việt) · Chatterbox (Anh) | Apache-2.0 · MIT |
| Dịch kịch bản cho mô hình | opus-mt-vi-en | CC-BY-4.0 |

**Vì sao nhanh:** (1) mô hình rút gọn 4–8 bước thay vì 40–50 bước; (2) mỗi cảnh một GPU riêng chạy cùng
lúc, nên 10 cảnh xong gần bằng thời gian 1 cảnh; (3) sinh ở 720p rồi phóng 1080p + làm nét.

## Cài một lần (người kỹ thuật, ~30 phút + 1–2 giờ chờ tải mô hình)

1. **Modal:** tạo tài khoản modal.com (gói Starter: $30 tín dụng miễn phí/tháng) → Settings → API Tokens
   → tạo token (được `MODAL_TOKEN_ID`, `MODAL_TOKEN_SECRET`).
2. **Trạm Cloudflare** (`../tu-dong/worker`): `wrangler deploy` như hướng dẫn cũ, rồi đặt thêm:
   ```
   wrangler secret put GPU_TOKEN    # một chuỗi dài ngẫu nhiên (dùng lại ở bước 3)
   ```
3. **GitHub → Settings → Secrets → Actions:** thêm `MODAL_TOKEN_ID`, `MODAL_TOKEN_SECRET`,
   `GPU_TOKEN` (giống bước 2), `TRAM_URL` (địa chỉ trạm, vd `https://gita-xuong-phim.<tên>.workers.dev`).
4. **GitHub → Actions → "Triển khai máy GPU làm phim nhanh" → Run workflow**, tick **Tải mô hình**.
   Chờ xong (1–2 giờ, chỉ lần đầu). Cuối log có địa chỉ `https://…bat-dau….modal.run`.
5. Đặt địa chỉ đó cho trạm: `wrangler secret put MODAL_URL`.
6. Trong app → tab Làm phim nhanh → **Cài đặt một lần**: dán địa chỉ trạm + mật khẩu gửi phim (`SUBMIT_TOKEN`).

Tuỳ chọn: giọng mẫu riêng theo giới tính/độ tuổi (`nam-lon.wav`, `nu-lon.wav`…) và nhạc nền:
`modal volume put gita-mo-hinh giong/ /giong/` · `modal volume put gita-mo-hinh nhac/ /nhac/`.

## Chi phí ước tính (giá Modal tra 10/2026 — kiểm lại khi dùng)

H100 ~ $3,95/giờ (tính theo giây, tắt máy khi rảnh). Video 60 giây ≈ 10 cảnh × ~4–6 phút GPU
≈ 40–60 phút GPU ≈ **$2,6–4 / video** (~70–100 nghìn đồng). Tín dụng miễn phí $30/tháng ≈ 8–10 video.

## Giới hạn (nói thẳng)

- **Chưa chạy thử trên GPU** — môi trường dựng app không có GPU. Phần hậu kỳ, ráp, phụ đề, thẻ tên, giọng
  chuẩn phát sóng và trạm Cloudflare đã thử thật. Lần chạy đầu có thể lỗi phiên bản thư viện → gửi log Modal.
- **15 phút** là mục tiêu cho video ≤ 60 giây (≤ 14 cảnh) khi mô hình đã nằm sẵn trong kho và tài khoản
  cho chạy nhiều GPU cùng lúc. Lần đầu mỗi máy khởi động mất thêm 1–3 phút nạp mô hình.
- 1080p là **sinh 720p rồi phóng + làm nét** — nét tốt trên điện thoại, chưa bằng quay 1080p gốc.
- Giữ mặt bằng ảnh mẫu (không train) — giống người thật ở mức tốt, chưa tuyệt đối như LoRA đã train.
  Muốn khoá mặt chắc nhất cho Trainer/MC, dùng thêm `train-lora/` (quy trình đầy đủ).
