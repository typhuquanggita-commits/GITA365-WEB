# BẢO MẬT — GITA 365

## Nguyên tắc vàng

**Khoá giải mã (`khoa.json`) không bao giờ được đưa lên GitHub.**

Repo này là công khai. Các tệp `kho/*.enc` đã mã hoá, vô hại nếu lộ. Nhưng nếu khoá bị lộ, bất kỳ ai cũng có thể giải mã toàn bộ nội dung chuyên môn.

## Khoá nằm ở đâu

| Vị trí | Lưu gì | An toàn |
|---|---|---|
| Cloudflare Worker secret `GITA_KHOA_KHO` | Nội dung `khoa.json` | ✅ Duy nhất |
| Máy khách (bộ nhớ) | Khoá tạm sau khi đăng nhập | ✅ Không lưu đĩa |
| Repo GitHub | Không lưu khoá | ✅ |

## Các secret khác của Worker

- `GITA_TIEU` — tiêu băm mật khẩu. Sinh một lần, giữ mãi.
- `GITA_TAO_ADMIN` — mã tạo Super Admin đầu tiên. Xoá ngay sau khi dùng.
- `GITA_KHOA_KY` — khoá ký chứng cứ (HMAC).
- `GITA_KHOA_THU` — khoá gửi thư qua Resend (nếu dùng email).

## Cấm

- Đưa `kho/khoa.json` vào commit.
- Đưa ảnh QR/thông tin nhận tiền vào bundle frontend.
- Log khoá ra console hoặc lưu vào `localStorage`.

## Kiểm tra trước khi đẩy

```bash
node tools/soat-san-sang.js
```

Nếu tool báo đỏ, dừng lại và sửa trước khi phát hành.
