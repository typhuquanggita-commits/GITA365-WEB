# MÁY CHỦ — GITA 365

Máy chủ của GITA 365 là một Cloudflare Worker, mã nằm trong thư mục `may-chu/`.

## Địa chỉ

Mặc định trong `cau-hinh.js`:

```js
G.API_CAP_PHEP = 'https://gita365.typhuquanggita.workers.dev';
```

Có thể ghi đè trên từng máy qua màn **Quản trị trang → Nối máy chủ**.

## CORS — `GITA_DIA_CHI_WEB`

Biến `[vars] GITA_DIA_CHI_WEB` trong `may-chu/wrangler.toml` là **danh sách origin, phân tách bằng dấu phẩy**:

```toml
GITA_DIA_CHI_WEB = "https://gita.edu.vn,https://www.gita.edu.vn,https://gita365.pages.dev"
```

- Danh sách **phải gồm mọi tên miền đang chạy bản web** (tên miền trong `CNAME`, bản `www`, `*.pages.dev`…). Thiếu một tên miền thì trình duyệt chặn CORS và app báo *không kết nối được máy chủ* dù Worker vẫn chạy bình thường.
- Worker đọc header `Origin`: khớp danh sách thì trả lại đúng origin đó (kèm `Vary: Origin`); không khớp thì trả origin đầu tiên (trình duyệt sẽ chặn).
- Không bao giờ thêm `null` (trang mở bằng `file://`). Để trống biến thì Worker trả `*`.
- Origin **đầu tiên** được dùng để dựng đường dẫn kích hoạt trong thư.
- Đổi biến xong phải **deploy lại Worker** (`npx wrangler deploy` trong `may-chu/`, hoặc workflow deploy).
- Kiểm: `node tools/thu-cors.mjs` và `node tools/soat-san-sang.js` (đối chiếu `CNAME` với danh sách).

## Chức năng chính

- Đăng nhập / đăng xuất / kiểm phiên
- Đăng ký, xác thực OTP, kích hoạt tài khoản
- Cấp khoá giải mã kho (`GITA_KHOA_KHO`)
- Quản lý quyền xem hồ sơ khách và T5-PRO
- Tài chính: phiếu thu, công nợ, hoa hồng, đóng kỳ
- CRM, đồng bộ hồ sơ, cài đặt
- Cộng đồng, tài liệu, tình huống khách

## Triển khai

Xem chi tiết trong `TRIEN-KHAI.md`, Phần 2 — Cloudflare Worker.

## Kiểm tra

```bash
curl -sf "https://gita365.typhuquanggita.workers.dev/?fn=status" -X POST \
  -H "Content-Type: application/json" -d '{}'
```

Hoặc dùng màn **Nối máy chủ** trong app và bấm **Gọi thử**.
