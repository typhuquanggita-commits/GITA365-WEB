# GITA 365 · v7.1 — Hệ Sinh Thái Gia Đình Thịnh Vượng

> ⚠ **TÀI SẢN ĐỘC QUYỀN.** Toàn bộ nội dung chuyên môn của GITA 365 được mã hoá
> AES-256-GCM và chỉ mở cho tài khoản đã đăng nhập, trong đúng phạm vi vai và
> tầng được cấp phép. Xem [`LICENSE`](LICENSE) và
> [`docs/BAO_VE_TAI_SAN.md`](docs/BAO_VE_TAI_SAN.md).
> Cấm dùng bất kỳ phần nào để huấn luyện trí tuệ nhân tạo.

> **Một gia đình vận hành được — không cần ai canh.**

Web app + ứng dụng cài đặt được (PWA) cho hệ thống GITA 365. Nối tiếp nền tảng
v6.9 (Apps Script): giữ nguyên chuẩn phân quyền 15 vai, mô thức **G–I–T–A**,
**năm tầng** T1–T5 và toàn bộ kho tri thức — dựng lại thành một giao diện dẫn dắt
theo **Bản Đồ Gia Đình Thịnh Vượng**.

---


## Bắt đầu từ đâu

Mọi việc thường ngày nằm ở **[docs/CACH_LAM.md](docs/CACH_LAM.md)** — một trang.
Một lệnh làm hết: `node tools/phat-hanh.js`

Không đăng nhập được? **[docs/DANG_NHAP.md](docs/DANG_NHAP.md)** — bấm thẳng vào một vai là vào, không cần mật khẩu.

## Chạy thử — ba cách

| Cách | Làm gì | Dùng khi |
|---|---|---|
| **Mở thẳng** | Bấm đúp `index.html` | Xem nhanh, không cần cài gì |
| **Chạy web** | `npx http-server -p 8099` rồi mở `http://localhost:8099` | Bật được service worker và cài app |
| **Cài như ứng dụng** | Mở bản web → biểu tượng **＋** trên thanh trên, hoặc trình đơn trình duyệt → *Cài đặt GITA 365* | Dùng trên máy tính và điện thoại, chạy cả khi mất mạng |
| **Bản giới thiệu một tệp** | `python3 tools/dong-goi.py` → mở tệp HTML | Gửi email, chép USB — chế độ mẫu, **không kèm kho tri thức** |
| **Cài trên máy tính** | Bộ cài `.exe` / `.dmg` / `.AppImage` — xem [`docs/CAI_DAT_MAY_TINH.md`](docs/CAI_DAT_MAY_TINH.md) | Vận hành hằng ngày: trình đơn tiếng Việt, sao lưu, xuất PDF, hoàn toàn ngoại tuyến |

Dựng lại sau khi sửa nội dung: `python3 tools/dong-goi.py` (bản một tệp) ·
`cd desktop && npm run dist` (bộ cài máy tính)

Không có bước dựng, không phụ thuộc thư viện ngoài. Chỉ cần một trình duyệt.

### Cài trên điện thoại
- **Android · Chrome** — trình đơn ⋮ → *Thêm vào màn hình chính*
- **iPhone · iPad · Safari** — nút Chia sẻ → *Thêm vào MH chính*
- **Máy tính · Chrome/Edge** — biểu tượng cài đặt ở thanh địa chỉ

---

## Có gì bên trong

**Năm nhóm chính · 56 màn hình · 15 vai · 2 ngôn ngữ**

| Nhóm | Nội dung |
|---|---|
| **01 · BẢN ĐỒ THỊNH VƯỢNG** | Bắt đầu ở đây · Bản đồ 5 khoang – 9 vai · Chân dung nhà mình · Định vị · Tầm nhìn 5–20 năm · Từ nỗi đau đến khát khao · Hành trình của con · Bản đồ điểm chạm · Người đồng hành · Chuỗi WOW |
| **02 · HÀNH TRÌNH 5 TẦNG** | Lộ trình T1→T5 · Bản đồ G–I–T–A · Chu kỳ 21/90 ngày · Nhiệm vụ & Nhật ký 365 · 10 chân dung thành công · Cổng nghiệm thu · Kiến trúc 100 năm |
| **03 · KHO BÁU VẬT** | 220 phác đồ · 1.000 kịch bản · 42 mô thức gốc · 14 bài học · Sách gốc Học viện · Ngôn từ dẫn dắt · Nhận diện thương hiệu · Trợ lý GITA (có micro) |
| **04 · CÚ HÍCH & NHỊP SỐNG** | Chín vai giữ trong nhà · Thói quen & nghi lễ · Cú hích lớn · Bảng số gia đình · Ghi nhận · Cấp độ · Quà tặng · Vinh danh · Sáu ranh giới · Chuẩn vận hành |
| **05 · HỆ SINH THÁI & VẬN HÀNH** | Vệ tinh · Đại sứ · Cơ chế hoa hồng (trần 10%) · Sự kiện · Buồng lái Coach · Khoang mở cửa · Hành trình người dẫn dắt · Trung tâm điều hành · Quản trị con người · Kiểm duyệt · Tài chính · Hài lòng · Tài liệu khách gửi · Phòng kiểm thử 4 chuyên gia · Chuẩn 1000 điểm · AI điều phối · Lá chắn dữ liệu · Học từ những hệ thống lớn · Rà soát hệ thống · Nhật ký |

**Thanh phải — La bàn văn hoá** đi cùng mọi màn hình: Tầm nhìn · Sứ mệnh ·
6 kim chỉ nam · 7 giá trị cốt lõi · 10 nội quy · 4 nhịp · 6 ranh giới ·
nhịp sống · câu giữ lửa · giá trị cho cộng đồng.

---

## Tài khoản trải nghiệm

15 vị trí (R01–R15) + 4 chuyên gia phản biện — xem đầy đủ ở
[`docs/TAI_KHOAN.md`](docs/TAI_KHOAN.md) hoặc bấm **“Xem 15 tài khoản trải nghiệm”**
ngay ở Cổng vào.

```
admin@gita365.vn     Gita#Admin02      → Trung tâm điều hành
coach@gita365.vn     Gita#Coach07      → Buồng lái Coach
tuvan@gita365.vn     Gita#Tuvan11      → Khoang mở cửa
phuhuynh@gita365.vn  Gita#Phuhuynh13   → Bản đồ nhà mình
hocvien@gita365.vn   Gita#Hocvien14    → Hành trình của con
daisu@gita365.vn     Gita#Daisu15      → Vệ tinh lan toả
```

> ⚠ **Đây là lớp đăng nhập DEMO chạy trong trình duyệt** để kiểm tra giao diện và
> phạm vi của từng vai. **Không phải hệ thống xác thực thật.** Trước khi mở cho
> khách bên ngoài, phải nối `02_Security.gs` của v6.9 — xem
> [`docs/BAO_MAT.md`](docs/BAO_MAT.md).

---

## Đa ngôn ngữ

Tiếng Việt (gốc) và tiếng Anh. Bấm **VI / EN** ở thanh trên hoặc Cổng vào.
Bản tiếng Anh phủ trọn giao diện, la bàn văn hoá, năm tầng và bản đồ điểm chạm.
Kho chuyên môn 1.000 kịch bản giữ tiếng Việt gốc — bản địa hoá theo từng thị trường.
Thêm ngôn ngữ mới: chép khối `en` trong `src/i18n.js` và dịch, không phải sửa mã.

---

## Cấu trúc

```
index.html                 khung ứng dụng
manifest.webmanifest       khai báo cài đặt (PWA)
sw.js                      chạy được khi mất mạng
assets/style.css           hệ thiết kế "Trường năng lượng"
assets/icons/              biểu tượng ứng dụng
assets/fonts/              bộ chữ nhúng sẵn — không gọi ra mạng ngoài
desktop/                   bản cài đặt máy tính (Electron)
.github/workflows/         tự dựng bộ cài Windows · macOS · Linux
src/data.core.js           vai · quyền · năm tầng · điều hướng · la bàn văn hoá
src/kho-khoa.js            xin khoá · giải mã kho trong bộ nhớ
kho/*.enc                  kho tri thức đã mã hoá — vô nghĩa nếu không có khoá
kho-goc/                   nội dung gốc (KHÔNG lên kho mã)
server/GITA_CapPhep.gs     máy chủ cấp khoá theo vai và tầng
src/i18n.js                đa ngôn ngữ
src/ui.js                  mảnh giao diện dùng chung
src/guard.js               lá chắn dữ liệu chạy thật
src/views*.js              56 màn hình
src/app.js                 trạng thái · phân quyền · định tuyến
docs/                      tài khoản · bảo mật · bảo vệ tài sản · kiến trúc · chi phí · cài đặt
```

Đổi nội dung chỉ sửa `src/data.*.js`, không đụng vào mã hiển thị.

---

## Đã kiểm

- **1.064 lượt** (19 vai × 56 màn hình) — không lỗi runtime, 260 lượt chặn đúng quyền
- Không tiêm được mã qua ô nhập của người dùng
- 55 mục điều hướng ↔ 56 màn hình khớp 100%, không mục nào trỏ vào khoảng trống
- 1.000 kịch bản / 220 phác đồ đủ trường bắt buộc, không mã tầng lạ

Biên bản đầy đủ nằm trong app: **Nhóm 05 → Rà soát hệ thống**.

---

*Hotline 08.5555.4688 · truongnhatquang.com*
