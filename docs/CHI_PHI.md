# CHI PHÍ — GITA 365

## Ước tính chi phí Cloudflare (miễn phí → trả phí)

| Hạng mục | Gói miễn phí | Gói trả phí khi tăng trưởng |
|---|---|---|
| Cloudflare Pages | 500 builds/tháng, 100k requests/ngày | Pro khi vượt |
| Cloudflare Worker | 100k requests/ngày | Workers Paid Plan |
| D1 | 5M hàng đọc/ngày | D1 Paid |
| R2 (nếu lưu media) | 10GB/tháng | theo dung lượng |

## Lưu ý

- Frontend là static; chi phí chủ yếu ở Worker và D1.
- Không lưu media lớn trong repo hoặc Pages.
- QR và thông tin thanh toán không nằm trong bundle — được cấu hình trong D1 và trả qua API.

## Tối ưu

- Gộp 141 tệp JS thành `gita-app.js` để giảm requests.
- Lazy-load `gita-nghe.js` chỉ khi cần.
- Cache tích cực ở service worker.

Xem thêm `docs/SUC_CHUA_TOC_DO.md`.

> Xem thêm: [Tối ưu chi phí & chất lượng](TOI_UU_CHI_PHI_CHAT_LUONG.md) — mô hình 0đ (<200k TK) và <30 USD (200k–500k TK).
