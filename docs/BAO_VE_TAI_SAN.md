# BẢO VỆ TÀI SẢN TRÍ TUỆ — GITA 365

Toàn bộ nội dung chuyên môn của GITA 365 là tài sản độc quyền của Học viện GITA.

## Quyền sử dụng

- Chỉ dùng trong phạm vi được cấp phép theo vai và tầng.
- Không sao chép, phân phối, hoặc sửa đổi nội dung cho bên thứ ba.
- **Cấm dùng bất kỳ phần nào để huấn luyện trí tuệ nhân tạo.**

## Kỹ thuật bảo vệ

1. **Mã hoá AES-256-GCM** — kho tri thức `kho/*.enc` chỉ mở được khi có khoá.
2. **Cấp phép theo phiên** — Worker cấp khoá sau khi xác thực và kiểm tra quyền.
3. **Không lưu khoá** — khoá chỉ tồn tại trong bộ nhớ máy khách trong phiên.
4. **Ghi nhật ký** — mọi lượt xin khoá đều được ghi lại ở máy chủ.

## Vi phạm

Mọi hành vi lộ khoá, giải mã trái phép, hoặc sử dụng nội dung sai mục đích sẽ bị thu hồi quyền ngay lập tức và xử lý theo quy định pháp luật.
