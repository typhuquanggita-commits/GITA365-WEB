# GITA 365 · TÀI KHOẢN TRẢI NGHIỆM

> ⚠ **Lớp đăng nhập DEMO chạy hoàn toàn trong trình duyệt.** Dùng để kiểm tra giao diện
> và mức hiện diện của từng vị trí. **Không phải hệ thống xác thực thật** — mật khẩu
> dưới đây nằm trong mã nguồn tải về máy khách. Trước khi mở cho khách bên ngoài,
> thay lớp này bằng `02_Security.gs` của v6.9 (băm mật khẩu + pepper, phiên có hạn,
> máy chủ kiểm lại mọi thao tác ghi). Xem `docs/BAO_MAT.md`.

Cách nhanh nhất: mở app → Cổng vào → bấm thẳng vào một vai trong danh sách,
hoặc bấm **“Xem 15 tài khoản trải nghiệm”**. Đã đăng nhập rồi thì đổi vai ở
**Tài khoản của tôi** hoặc **Quản trị con người**.

## Mười lăm vị trí trong hệ thống

| Vai | Tài khoản | Mật khẩu | Người | Vào thẳng |
|---|---|---|---|---|
| R01 · **Super Admin** | `superadmin@gita365.vn` | `Gita#Super01` | Trương Nhật Quang · Học viện GITA | Trung tâm điều hành |
| R02 · **Admin hệ thống** | `admin@gita365.vn` | `Gita#Admin02` | Ngô Hải Sơn · Ban vận hành | Trung tâm điều hành |
| R03 · **Giám đốc** | `giamdoc@gita365.vn` | `Gita#Giamdoc03` | Phạm Anh Thư · Ban điều hành | Trung tâm điều hành |
| R04 · **Quản lý chuyên môn** | `chuyenmon@gita365.vn` | `Gita#Chuyenmon04` | Lê Quốc Duy · Hội đồng chuyên môn | Trung tâm điều hành |
| R05 · **Trưởng nhóm Coach** | `truongcoach@gita365.vn` | `Gita#Truongcoach05` | Hoàng Mỹ Duyên · Nhóm Coach miền Bắc | Buồng lái Coach |
| R06 · **Senior Coach** | `seniorcoach@gita365.vn` | `Gita#Senior06` | Nguyễn Thu Trang · 4 gia đình T4–T5 | Buồng lái Coach |
| R07 · **Coach** | `coach@gita365.vn` | `Gita#Coach07` | Đặng Hoàng Nam · 3 gia đình T2–T3 | Buồng lái Coach |
| R08 · **Giáo viên** | `giaovien@gita365.vn` | `Gita#Giaovien08` | Trịnh Bảo Ngân · Lớp kỹ năng học tập | Buồng lái Coach |
| R09 · **Mentor** | `mentor@gita365.vn` | `Gita#Mentor09` | Lâm Tuyết Mai · 6 gia đình băng nền | Buồng lái Coach |
| R10 · **Chuyên gia đánh giá** | `danhgia@gita365.vn` | `Gita#Assessor10` | Hồ Bảo Khanh · Trung tâm đánh giá | Buồng lái Coach |
| R11 · **Chuyên gia tư vấn** | `tuvan@gita365.vn` | `Gita#Tuvan11` | Phan Đức Thắng · Khoang mở cửa | Khoang mở cửa |
| R12 · **Phân tích dữ liệu** | `phantich@gita365.vn` | `Gita#Phantich12` | Vũ Nhật Minh · Ban dữ liệu | Trung tâm điều hành |
| R13 · **Phụ huynh** | `phuhuynh@gita365.vn` | `Gita#Phuhuynh13` | Trần Quốc Bảo · Nhà Minh An | Bản đồ nhà mình |
| R14 · **Học viên** | `hocvien@gita365.vn` | `Gita#Hocvien14` | Trần Minh An · Nhà Minh An · Lớp 9 | Hành trình của con |
| R15 · **CTV giới thiệu** | `daisu@gita365.vn` | `Gita#Daisu15` | Trần Diễm Quỳnh · Vệ tinh miền Trung | Vệ tinh lan toả |

## Bốn chuyên gia phản biện

Đăng nhập bằng các tài khoản này để đọc hệ thống đúng theo góc nhìn của họ.
Kết luận của từng người nằm ở **Nhóm 05 → Phòng kiểm thử 4 chuyên gia**.

| Vai kiểm thử | Tài khoản | Mật khẩu | Chấm |
|---|---|---|---|
| **Khách hàng khó tính nhất** | `khotinh@gita365.vn` | `Gita#Kho01` | 88/100 |
| **Khách hàng hiểu biết nhất** | `hieubiet@gita365.vn` | `Gita#Hieu02` | 93/100 |
| **Chuyên gia lập trình** | `kysu@gita365.vn` | `Gita#Kysu03` | 90/100 |
| **Bậc thầy ngôn từ** | `ngontu@gita365.vn` | `Gita#Ngontu04` | 95/100 |

## Ai thấy được gì

Phân quyền theo **cấp bậc `lv`** — cấp càng nhỏ càng nhiều quyền — giữ nguyên
bảng `PERM` gốc của v6.9. Thanh điều hướng chỉ *ẩn* nút; **cổng thật nằm ở lớp
render**, nên vào thẳng bằng liên kết hay bằng trạng thái đã lưu đều bị chặn.

| Quyền | Cấp tối đa | Ai dùng được |
|---|---|---|
| `sys_config`, `sys_delete_user`, `sys_restore` | 1 | Super Admin |
| `sys_manage_user`, `sys_audit` | 2 | Super Admin, Admin |
| `sys_fraud`, `fin_view`, `fin_payout`, `fin_payroll` | 3 | … đến Giám đốc |
| `pro_approve`, `pro_report`, `pro_override`, `pro_view_all` | 4 | … đến Quản lý chuyên môn |
| `pro_assign` | 5 | … đến Trưởng nhóm Coach |
| `pro_coach` | 8 | … đến Giáo viên |
| `pro_assess` | 10 | … đến Chuyên gia đánh giá |
| `fin_create_order`, `pro_consult` | 11 | … đến Chuyên gia tư vấn |
| `usr_self_data`, `usr_do_test`, `usr_referral` | 15 | mọi vai |

Bảng đầy đủ và trạng thái của vai đang dùng: **Nhóm 05 → Quản trị con người**.
