# GITA 365 — ĐĂNG NHẬP

## Cách nhanh nhất: không cần mật khẩu

Mở app hoặc bản web → ở cột bên phải có danh sách 15 vai →
**bấm thẳng vào một vai** là vào luôn. Không cần gõ gì cả.

Đây là cách để anh xem hệ thống đúng như từng vị trí nhìn thấy.

---

## Mười lăm tài khoản có sẵn trong app

Dùng được **ngay bây giờ**, không cần máy chủ, không cần mạng.

| Vị trí | Cấp | Tên đăng nhập | Mật khẩu |
|---|---|---|---|
| Super Admin | lv1 | `superadmin@gita365.vn` | `Gita#Super01` |
| Admin hệ thống | lv2 | `admin@gita365.vn` | `Gita#Admin02` |
| Giám đốc | lv3 | `giamdoc@gita365.vn` | `Gita#Giamdoc03` |
| Quản lý chuyên môn | lv4 | `chuyenmon@gita365.vn` | `Gita#Chuyenmon04` |
| Trưởng nhóm Coach | lv5 | `truongcoach@gita365.vn` | `Gita#Truongcoach05` |
| Senior Coach | lv6 | `seniorcoach@gita365.vn` | `Gita#Senior06` |
| Coach | lv7 | `coach@gita365.vn` | `Gita#Coach07` |
| Giáo viên | lv8 | `giaovien@gita365.vn` | `Gita#Giaovien08` |
| Mentor | lv9 | `mentor@gita365.vn` | `Gita#Mentor09` |
| Chuyên gia đánh giá | lv10 | `danhgia@gita365.vn` | `Gita#Assessor10` |
| Chuyên gia tư vấn | lv11 | `tuvan@gita365.vn` | `Gita#Tuvan11` |
| Phân tích dữ liệu | lv12 | `phantich@gita365.vn` | `Gita#Phantich12` |
| Phụ huynh | lv13 | `phuhuynh@gita365.vn` | `Gita#Phuhuynh13` |
| Học viên | lv14 | `hocvien@gita365.vn` | `Gita#Hocvien14` |
| CTV giới thiệu | lv15 | `daisu@gita365.vn` | `Gita#Daisu15` |

## Bốn tài khoản phản biện

| Vai | Tên đăng nhập | Mật khẩu |
|---|---|---|
| Khách hàng khó tính nhất | `khotinh@gita365.vn` | `Gita#Kho01` |
| Khách hàng hiểu biết nhất | `hieubiet@gita365.vn` | `Gita#Hieu02` |
| Chuyên gia lập trình | `kysu@gita365.vn` | `Gita#Kysu03` |
| Bậc thầy ngôn từ | `ngontu@gita365.vn` | `Gita#Ngontu04` |
---

## Vào app rồi thấy gì

Mỗi vai mở ra một cửa khác nhau:

| Vai | Vào thẳng màn hình | Thấy được gì |
|---|---|---|
| R01–R04 · Ban điều hành | Trung tâm điều hành | Toàn bộ 86 màn hình, in PDF, đẩy bảng tính lên Drive |
| R05–R10 · Coach | Buồng lái Coach | Kho nghề đủ 5 tầng; R05 in được PDF, R06–R10 thì không |
| R11 · Tư vấn | Khoang mở cửa | Kho nghề, phiếu referral, chân dung khách hàng |
| R13 · Phụ huynh | Bản đồ nhà mình | Chỉ tầng con đang học. **Không** mở kho nghề, **không** in PDF |
| R14 · Học viên | Hành trình của con | Như phụ huynh, giọng nói với chính đứa trẻ |
| R15 · Cộng tác viên | Đại sứ GITA 365 | Chỉ phần nền |

Đổi vai bất cứ lúc nào: thanh trái → **Đổi vai / Đăng xuất**.

---

## Hai bộ tài khoản — đừng lẫn

| | **Bộ A** — bảng ở trên | **Bộ B** — `BAN_GIAO_TAI_KHOAN.md` |
|---|---|---|
| Nằm ở đâu | Trong chính app | Máy chủ Apps Script |
| Chạy khi nào | Ngay bây giờ | Sau khi dựng xong máy chủ |
| Mật khẩu | `Gita#Super01`… | Ngẫu nhiên, buộc đổi lần đầu |
| Đổi mật khẩu được không | Không — nằm trong mã | Có |
| Lấy lại qua email được không | Không | Có |
| Để làm gì | Xem thử, kiểm tra | Vận hành thật |

**Bộ A là lớp demo chạy trong trình duyệt, không phải xác thực thật.**
Nó tồn tại để anh và đội ngũ xem được hệ thống trước khi dựng máy chủ.
Khi máy chủ chạy, bộ B thay hẳn bộ A.

---

## Tạo tài khoản trên bản web

Chưa có nút tự đăng ký, và đó là chủ ý: GITA 365 không phải nơi ai cũng
tự vào. Tài khoản do Admin cấp.

**Ba bước để có tài khoản thật:**

1. Dựng máy chủ — dán bốn tệp `server/*.gs` vào Apps Script, nạp bộ khoá,
   Deploy Web app, chép URL `/exec`. Chi tiết ở `docs/CACH_LAM.md`.
2. Điền URL vào một dòng trong `cau-hinh.js`, đẩy lên.
3. Nạp tài khoản:
   ```bash
   node tools/tao-tai-khoan.js
   ```
   Dán `giay-phep/GITA_NapTaiKhoan.gs` vào Apps Script → chạy
   `napTaiKhoanMotLan()` → **xoá tệp đó khỏi dự án** → phát mật khẩu
   trong `BAN_GIAO_TAI_KHOAN.md` cho từng người.

**Thêm một người mới về sau:** mở sổ `users` trong Google Sheets của GITA,
thêm một dòng, đặt `mustChangePw` = TRUE, rồi bảo họ dùng **Quên mật khẩu?**
để tự đặt mật khẩu qua email. Không ai phải biết mật khẩu của người khác.

---

## Quên mật khẩu

Chỉ chạy khi đã có máy chủ.

Màn hình đăng nhập → **Quên mật khẩu?** → nhập email → nhận mã sáu số →
đặt mật khẩu mới.

Mã sống 15 phút. Sai 5 lần thì huỷ. Mỗi tài khoản xin tối đa 5 lần một giờ.
Hệ thống trả lời giống hệt nhau dù tài khoản có thật hay không — để không ai
dò được danh sách tài khoản.

## Đổi mật khẩu

Thanh trái → **Đổi mật khẩu**. Đổi xong hệ thống đóng phiên, đăng nhập lại
bằng mật khẩu mới.

Mật khẩu cần ít nhất mười ký tự, có chữ hoa, chữ thường, chữ số và ký tự
đặc biệt.
