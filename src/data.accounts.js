/* ═══════════════════════════════════════════════════════════════
   GITA 365 · v7.0 — TÀI KHOẢN TRẢI NGHIỆM
   ⚠ Đây là tài khoản DEMO chạy hoàn toàn trong trình duyệt, dùng để
   kiểm tra giao diện và mức hiện diện của từng vai. KHÔNG phải hệ
   thống xác thực thật. Khi nối với máy chủ GITA 365 v6.9, thay lớp
   này bằng 02_Security.gs (băm mật khẩu + pepper + phiên có hạn).
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;

G.ACCOUNTS = [
  {u:'superadmin@gita365.vn', p:'Gita#Super01', role:'R01', ten:'Trương Nhật Quang', nha:'Học viện GITA'},
  {u:'admin@gita365.vn',      p:'Gita#Admin02', role:'R02', ten:'Ngô Hải Sơn',       nha:'Ban vận hành'},
  {u:'giamdoc@gita365.vn',    p:'Gita#Giamdoc03',role:'R03',ten:'Phạm Anh Thư',      nha:'Ban điều hành'},
  {u:'chuyenmon@gita365.vn',  p:'Gita#Chuyenmon04',role:'R04',ten:'Lê Quốc Duy',     nha:'Hội đồng chuyên môn'},
  {u:'truongcoach@gita365.vn',p:'Gita#Truongcoach05',role:'R05',ten:'Hoàng Mỹ Duyên',nha:'Nhóm Coach miền Bắc'},
  {u:'seniorcoach@gita365.vn',p:'Gita#Senior06',role:'R06', ten:'Nguyễn Thu Trang',  nha:'4 gia đình T4–T5'},
  {u:'coach@gita365.vn',      p:'Gita#Coach07', role:'R07', ten:'Đặng Hoàng Nam',    nha:'3 gia đình T2–T3'},
  {u:'giaovien@gita365.vn',   p:'Gita#Giaovien08',role:'R08',ten:'Trịnh Bảo Ngân',   nha:'Lớp kỹ năng học tập'},
  {u:'mentor@gita365.vn',     p:'Gita#Mentor09', role:'R09',ten:'Lâm Tuyết Mai',     nha:'6 gia đình băng nền'},
  {u:'danhgia@gita365.vn',    p:'Gita#Assessor10',role:'R10',ten:'Hồ Bảo Khanh',     nha:'Trung tâm đánh giá'},
  {u:'tuvan@gita365.vn',      p:'Gita#Tuvan11',  role:'R11',ten:'Phan Đức Thắng',    nha:'Khoang mở cửa'},
  {u:'phantich@gita365.vn',   p:'Gita#Phantich12',role:'R12',ten:'Vũ Nhật Minh',     nha:'Ban dữ liệu'},
  /* `tang` = tầng CAO NHẤT nhà này đã được cấp phép. Không khai thì bằng 1.
     Trước bản 9.9 trường này không tồn tại, và hậu quả là bảng cấp phát của
     máy chủ mở CẢ NĂM gói tầng cho mọi khách hàng: một nhà mới mua Tầng 1
     nhận về máy đủ tư liệu Tầng 5 — trái đúng luật anh Quang đặt ra, và
     tốn 6,6 MB đường truyền cho phần họ không được dùng. */
  {u:'phuhuynh@gita365.vn',   p:'Gita#Phuhuynh13',role:'R13',ten:'Trần Quốc Bảo',    nha:'Nhà Minh An', tang:3},
  {u:'hocvien@gita365.vn',    p:'Gita#Hocvien14', role:'R14',ten:'Trần Minh An',     nha:'Nhà Minh An · Lớp 9', tang:3},
  {u:'daisu@gita365.vn',      p:'Gita#Daisu15',  role:'R15',ten:'Trần Diễm Quỳnh',   nha:'Vệ tinh miền Trung'}
];

/* Bốn chuyên gia phản biện — đăng nhập để chấm hệ thống */
G.AUDITORS = [
  {u:'khotinh@gita365.vn',  p:'Gita#Kho01',  role:'R13', ten:'Khách hàng khó tính nhất', persona:'P1'},
  {u:'hieubiet@gita365.vn', p:'Gita#Hieu02', role:'R13', ten:'Khách hàng hiểu biết nhất',persona:'P2'},
  {u:'kysu@gita365.vn',     p:'Gita#Kysu03', role:'R12', ten:'Chuyên gia lập trình',     persona:'P3'},
  {u:'ngontu@gita365.vn',   p:'Gita#Ngontu04',role:'R11',ten:'Bậc thầy ngôn từ',        persona:'P4'}
];
