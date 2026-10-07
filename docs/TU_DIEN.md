# Từ điển GITA365 — lời chủ hệ ↔ tên trong mã

Một từ một nghĩa. Thêm từ khi chủ hệ chốt một khái niệm mới (skill `gita-hoi-chu-he`, bước 5).

| Chủ hệ nói | Trong mã | Nghĩa | Tránh nhầm với |
|---|---|---|---|
| Nhà, gia đình, khách | `maNha` = `hoSoKhach.maKhachHang` | Một gia đình đăng ký học — đơn vị đo mọi thứ | "người dùng" (một nhà có nhiều tài khoản) |
| Tầng (T1–T5) | `tang` | Gói học: Nhận diện · Giải mã · Kiến tạo · Chuyển hoá · Bứt phá | "cấp" |
| Cấp (1–10) | `cap` | Bậc độ khó trong một tầng (credit) | "tầng" |
| Vai (R01–R15) | `role`, `BAC` | Quyền tài khoản: R01 Super Admin … R13 Phụ huynh, R14 Học viên, R15 Đại sứ | "phòng ban" |
| Cửa (máy chủ) | `fn` trong `worker.js` | Một chức năng máy chủ app gọi tới | "màn" |
| Màn | `G.VIEWS['…']` | Một trang trong app | "cửa" |
| Khối (7) | `G.TU.KHOI` | Gom 16 ban thành 7 khối đo lường | "ban" (B01–B16), "hệ" (H01–H16) |
| Nhà học tích cực (North Star) | `nhaTichCuc` | Có tick việc / báo cáo ngày / dùng app trong tháng | "nhà đang học" (trạng thái hồ sơ) |
| Chạm | `soCham` | Một lượt nhân sự liên hệ nhà (nhắn · gọi · wow) | "tick" |
| Tick việc hôm nay | `nhipXong` | Nhà tự đánh dấu đã làm việc của ngày | "chạm" |
| Credit | `soCredit` | 10 đồng = 1 credit; tặng → thưởng → trả phí | "điểm" |
| Đèn xanh/vàng/đỏ | `band` | Tình trạng nhà do Coach đánh | "tầng chăm sóc A–E" (do máy tính) |
| Tầng chăm sóc A–E | `tangCS` | Phân bổ giờ Coach — chỉ nội bộ, không hiện cho gia đình | "xếp hạng gia đình" (cấm ở màn của khách) |
| Kho / kho nghề | `kho/*.enc`, `gita-nghe.js` | Nội dung chuyên môn đã mã hoá | "kho mã" (repo) |
