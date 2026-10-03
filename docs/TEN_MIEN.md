# TÊN MIỀN — GITA 365

## Địa chỉ chính thức

- **Frontend:** `https://gita365.pages.dev` (Cloudflare Pages) — địa chỉ web chính thức duy nhất
- **API Worker:** `https://gita365.typhuquanggita.workers.dev` (Cloudflare Worker)

Dự án **không dùng tên miền riêng**. Không thêm tệp `CNAME`; nếu GitHub Pages hoặc
Cloudflare Pages đã từng gắn custom domain thì gỡ trong phần cài đặt.

## CORS giữa Pages và Worker

Frontend và Worker khác origin, nên Worker chỉ trả CORS cho các origin trong
`GITA_DIA_CHI_WEB` (`may-chu/wrangler.toml`, hiện là `https://gita365.pages.dev`).
Đổi địa chỉ web thì phải sửa biến này và deploy lại Worker — xem `docs/MAY_CHU.md`.

- Đổi địa chỉ Worker thì sửa `cau-hinh.js` và bảo đảm origin nằm trong `connect-src` của `index.html`
  (đã mở sẵn `https://*.workers.dev` và `https://*.pages.dev`).

## CSP và tiêu đề bảo mật

- `Content-Security-Policy` nằm trong `index.html` dạng thẻ `<meta>`.
- `frame-ancestors`, HSTS, X-Frame-Options nằm trong `_headers` cho Cloudflare Pages.
- `_headers` không được có dòng bắt đầu bằng `#` — Wrangler sẽ báo lỗi.

## Kiểm tra

```bash
node tools/soat-san-sang.js
```

Tool sẽ đối chiếu `cau-hinh.js` với `connect-src` trong `index.html`, kiểm
`GITA_DIA_CHI_WEB` chứa `https://gita365.pages.dev`, và kiểm repo không còn tham chiếu tên miền cũ đã gỡ.
