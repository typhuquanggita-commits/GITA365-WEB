# MÁY CHỦ — GITA 365

Máy chủ của GITA 365 là một Cloudflare Worker, mã nằm trong thư mục `may-chu/`.

## Địa chỉ

Mặc định trong `cau-hinh.js`:

```js
G.API_CAP_PHEP = 'https://gita365.typhuquanggita.workers.dev';
```

Có thể ghi đè trên từng máy qua màn **Quản trị trang → Nối máy chủ**.

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
