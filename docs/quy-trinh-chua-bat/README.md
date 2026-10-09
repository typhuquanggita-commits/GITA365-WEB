# Quy trình chưa bật

Hai tệp này là quy trình GitHub Actions chuyển từ kho Quang-GITA. Chúng nằm ở đây, KHÔNG nằm trong `.github/workflows/`, nên không tự chạy.

- `trang-web.yml` — đưa trang lên GitHub Pages mỗi lần đẩy. Trái với địa chỉ chính thức `gita365.pages.dev`; đừng bật nếu chủ hệ chưa đổi quyết định ấy.
- `dong-goi-may-tinh.yml` — dựng bộ cài Windows/macOS/Linux từ `desktop/`. Muốn bật thì chủ hệ quyết, rồi chép vào `.github/workflows/`.

## ⚠ Trước khi bật dong-goi-may-tinh.yml (bản .exe)

Soát an ninh 9/10/2026 tìm ra một lỗ ở `desktop/may-chu.js` (máy chủ khoá trong
mạng nội bộ của bản máy tính): nó nghe mọi địa chỉ qua HTTP thường, nhận diện
máy chỉ bằng IP + trình duyệt (giả được), và **cấp khoá kho theo tên tài khoản
mà không hỏi mật khẩu**. Một máy đã được duyệt trong cùng mạng xin được khoá
của tài khoản Super Admin. **Đừng phát hành bản .exe** cho tới khi máy chủ ấy
đòi đăng nhập thật (hoặc mã ghép cặp hiện trên màn hình chủ máy) trước khi cấp khoá.
