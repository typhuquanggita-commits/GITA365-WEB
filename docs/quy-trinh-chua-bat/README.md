# Quy trình chưa bật

Hai tệp này là quy trình GitHub Actions chuyển từ kho Quang-GITA. Chúng nằm ở đây, KHÔNG nằm trong `.github/workflows/`, nên không tự chạy.

- `trang-web.yml` — đưa trang lên GitHub Pages mỗi lần đẩy. Trái với địa chỉ chính thức `gita365.pages.dev`; đừng bật nếu chủ hệ chưa đổi quyết định ấy.
- `dong-goi-may-tinh.yml` — dựng bộ cài Windows/macOS/Linux từ `desktop/`. Muốn bật thì chủ hệ quyết, rồi chép vào `.github/workflows/`.

## Bản .exe — lỗ máy chủ khoá nội bộ đã vá (9/10/2026)

Soát an ninh 9/10/2026 tìm ra lỗ ở `desktop/may-chu.js`: nhận diện máy bằng IP +
trình duyệt (giả được), và một máy đã duyệt xin được khoá của BẤT KỲ tài khoản nào,
kể cả Super Admin, chỉ bằng cách gõ tên khác. Nay:

- Dấu máy là **mã ngẫu nhiên 144 bit** trong cookie `HttpOnly; SameSite=Strict`.
  Cùng IP, cùng trình duyệt mà khác cookie là máy khác — phải chờ duyệt.
- Duyệt một máy là duyệt cho **đúng một tài khoản** (tài khoản hiện trong hộp duyệt).
  Đổi tài khoản trên máy đã duyệt → `SAITAIKHOAN`; muốn đổi thì chủ hệ "Quên máy"
  rồi duyệt lại.
- Bộ thử `tools/thu-may-chu-may-tinh.mjs` chạy ở CI; phá thử (trả mã cũ) đỏ 7 chỗ.

Còn lại, nói thẳng: mạng nội bộ vẫn là **HTTP thường** — người nghe trộm được trong
cùng mạng thấy được cookie. Chỉ bật "phục vụ máy khác" trong mạng tin cậy. Các máy
đã duyệt trước bản này phải được duyệt lại một lần. Bật `dong-goi-may-tinh.yml`
vẫn là quyết định của chủ hệ.
