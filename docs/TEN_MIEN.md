# TÊN MIỀN — GITA 365

## Mặc định

- **Frontend:** `https://gita365.pages.dev` (Cloudflare Pages)
- **API Worker:** `https://gita365.typhuquanggita.workers.dev` (Cloudflare Worker)

## Khi dùng tên miền riêng `gita.edu.vn`

Có hai cách phổ biến:

### Cách 1: Pages + Worker riêng origin

- Pages: `gita.edu.vn`
- Worker: `api.gita.edu.vn` hoặc route `gita.edu.vn/api/*`
- Sửa `cau-hinh.js` cho đúng origin Worker.
- Thêm origin vào `connect-src` trong `index.html`.

### Cách 2: Worker route trên cùng origin

- Pages phục vụ `gita.edu.vn/*`
- Worker đăng ký route `gita.edu.vn/api/*`
- Máy khách gọi `https://gita.edu.vn/api/?fn=...`

## CSP và tiêu đề bảo mật

- `Content-Security-Policy` nằm trong `index.html` dạng thẻ `<meta>`.
- `frame-ancestors`, HSTS, X-Frame-Options nằm trong `_headers` cho Cloudflare Pages.
- `_headers` không được có dòng bắt đầu bằng `#` — Wrangler sẽ báo lỗi.

## Kiểm tra

```bash
node tools/soat-san-sang.js
```

Tool sẽ đối chiếu `cau-hinh.js` với `connect-src` trong `index.html`.
