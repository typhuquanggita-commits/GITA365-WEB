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
- `GITA_AI_KHOA` — API key OpenAI cho soạn bản nháp XU-02 (tùy chọn, tắt nếu thiếu).
- `GITA_AI_MAU` — tên model OpenAI dùng cho XU-02 (tùy chọn).

XU-02 chỉ gửi đề bài người dùng nhập sau xác nhận, chỉ Super Admin gọi và quyền AI02 phải bật. Cổng ẩn danh từ chối đề bài có dấu hiệu dữ liệu cá nhân; không gửi hồ sơ khách hoặc nội dung kho, không lưu/phát hành đầu ra tự động. Nhà cung cấp vẫn nhận được đề bài đã qua cổng, vì vậy chỉ bật khi đã đánh giá điều khoản và quyền riêng tư của tài khoản OpenAI.

## Cấm

- Đưa `kho/khoa.json` vào commit.
- Đưa ảnh QR/thông tin nhận tiền vào bundle frontend.
- Log khoá ra console hoặc lưu vào `localStorage`.

## Kiểm tra trước khi đẩy

```bash
node tools/soat-san-sang.js
```

Nếu tool báo đỏ, dừng lại và sửa trước khi phát hành.
