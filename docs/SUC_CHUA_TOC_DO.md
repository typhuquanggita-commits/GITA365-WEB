# SỨC CHỨA & TỐC ĐỘ — GITA 365

## Mục tiêu

- First load < 3s trên 3G.
- Time to Interactive < 5s trên điện thoại tầm trung.
- Offline-ready sau lần đầu.

## Các biện pháp đã làm

1. **Gộp bundle** — `gita-app.js` (141 tệp → 1 request), `gita-nghe.js` lazy-load.
2. **Service Worker** — cache toàn bộ app và kho tĩnh.
3. **Mã hoá kho** — chỉ giải mã khi cần, giữ bộ nhớ nhẹ.
4. **Không ảnh/video nặng trong repo** — media lớn để R2/CDN riêng.

## Đo lường

Dùng Lighthouse trong Chrome DevTools:

```bash
npx http-server -p 8099
# Mở http://localhost:8099 và chạy Lighthouse
```

## Giới hạn

- Cloudflare Pages free: 100k requests/ngày.
- Worker free: 100k requests/ngày.
- Khi vượt, nâng lên gói Pro / Workers Paid.

## Mẹo tăng tốc

- Đặt `cache-control` dài cho static assets (đã có trong `_headers`).
- Dùng Cloudflare CDN cho toàn bộ tên miền.
- Tránh render-blocking scripts ngoài `gita-app.js` và `cau-hinh.js`.

> Xem thêm: [Tối ưu chi phí & chất lượng](TOI_UU_CHI_PHI_CHAT_LUONG.md) — mô hình 0đ (<200k TK) và <30 USD (200k–500k TK).
