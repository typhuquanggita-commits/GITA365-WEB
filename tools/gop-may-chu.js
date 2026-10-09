/* ═══════════════════════════════════════════════════════════════
   GITA 365 — GỘP MÃ MÁY CHỦ THÀNH MỘT TỆP

       node tools/gop-may-chu.js

   Các tệp trong server/ là cách chia để đọc và sửa. Nhưng người dựng máy
   chủ phải dán từng tệp một, và chỉ cần quên một tệp là cả bộ đứng im theo
   kiểu rất khó đoán ra.

   Công cụ này gộp hết các tệp ấy thành server/GITA365_TATCA.gs — dán một
   lần. Danh sách đọc thẳng từ thư mục, nên thêm tệp mới là tự có mặt.
   Nội dung nguyên văn, không cắt bớt dòng nào. Chạy lại sau mỗi lần sửa mã
   máy chủ; tools/phat-hanh.js tự gọi nên thường không phải nhớ.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
const fs = require('fs');
const path = require('path');
const GOC = path.join(__dirname, '..', 'server');

/* Lời giới thiệu cho từng phần. KHÔNG phải danh sách tệp — danh sách đọc
   từ thư mục ngay dưới.

   Trước 9.79 chỗ này là danh sách tên gõ thẳng, và nó đã cũ ngay lần đầu
   thêm tệp mới: server/GITA_DonDep.gs viết xong, thử riêng xanh hết, mà
   tệp gộp — thứ DUY NHẤT được dán lên Apps Script — không có nó. Bộ dọn
   coi như chưa từng tồn tại trên máy chủ thật.

   Cùng một lỗi đã xảy ra ở tools/thu-may-chu.js (bản 9.46, phát hiện ở
   9.73) và ở năm danh sách khác trong tools/. Danh sách khai tay thì đúng
   đúng một lần, vào hôm viết ra nó. */
const MO_TA = [
  ['GITA_Nen.gs',      'LỚP NỀN — bảng dữ liệu, phiên, băm mật khẩu, nhật ký, đăng nhập'],
  ['GITA_CapPhep.gs',  'CẤP PHÉP — doPost, cửa vào duy nhất, và việc cấp khoá mở kho'],
  ['GITA_DangKy.gs',   'ĐĂNG KÝ — OTP, kích hoạt, mã số khách hàng, nâng tầng'],
  ['GITA_MatKhau.gs',  'MẬT KHẨU — đổi, quên, đặt lại bằng mã'],
  ['GITA_TaiLieu.gs',  'TÀI LIỆU — nhận tài liệu và minh chứng, kiểm duyệt'],
  ['GITA_ChungCu.gs',  'CHỨNG CỨ — ký và đóng dấu giờ máy chủ cho hồ sơ hoa hồng kèm'],
  ['GITA_SoCongDong.gs','SỔ CỘNG ĐỒNG — bốn sổ đếm của bảng tin và hộp thư chuyện'],
  ['GITA_XemKhach.gs',  'QUYỀN XEM KHÁCH — trần vai theo tầng, giấy phép Super Admin, sổ lượt xem'],
  ['GITA_TinhHuongKhach.gs', 'TÌNH HUỐNG CHO GIA ĐÌNH — nạp theo phiên, cắt theo tầng; và bảng KPI cho Chuyên gia đánh giá'],
  ['GITA_TinhHuongKhach_DuLieu.gs', 'BẢN CHIẾU TÌNH HUỐNG — máy sinh, dựng lại bằng tools/xuat-tinh-huong-khach.js'],
  ['GITA_DongBo.gs',   'ĐỒNG BỘ — hồ sơ và cài đặt giữa bản web và bản cài trên máy'],
  ['GITA_XuatSheet.gs','XUẤT SHEET — đẩy bảng tính về thư mục Drive của Học viện'],
  ['GITA_BanWeb.gs',   'BẢN WEB — doGet: phục vụ trang, trả gói kho, báo tình trạng'],
  ['GITA_DonDep.gs',   'DỌN BẢNG — luật giữ cho bốn bảng chỉ lớn lên, và bộ hẹn giờ']
];

/* ĐỌC THƯ MỤC, KHÔNG KHAI TAY. Thứ tự: GITA_Nen.gs trước (các tệp khác
   dựa vào nền), rồi A–Z. Trong một tệp gộp thì khai báo hàm được cẩu lên
   trước nên thứ tự không đổi kết quả chạy; xếp thế này chỉ để người đọc
   thấy nền ở đầu, và để mỗi lần gộp ra cùng một tệp. */
const DS = ['GITA_Nen.gs'].concat(
  fs.readdirSync(GOC).filter(f =>
    /\.gs$/.test(f) && f !== 'GITA_Nen.gs' && f !== 'GITA365_TATCA.gs').sort());

/* Tệp mới thì phải có một dòng nói nó là gì. Bắt ở đây chứ không lặng lẽ
   ghi 'server/<tên>' — người dán tệp gộp lên Apps Script đọc chính những
   dòng này để biết đang dán cái gì. */
const moTa = new Map(MO_TA);
const thieu = DS.filter(f => !moTa.has(f));
if (thieu.length) {
  console.error('  ✗ Tệp máy chủ chưa có lời giới thiệu trong MO_TA:\n     ' +
    thieu.join('\n     ') + '\n     Thêm một dòng cho mỗi tệp rồi chạy lại.');
  process.exit(1);
}
const PHAN = DS.map(f => [f, moTa.get(f)]);

const DAU = `/**
 * ═══════════════════════════════════════════════════════════════════════
 *  GITA 365 — MÁY CHỦ  ·  TOÀN BỘ TRONG MỘT TỆP
 *  Học viện GITA · Trương Nhật Quang · 08.5555.4688
 * ═══════════════════════════════════════════════════════════════════════
 *
 *  Toàn bộ mã máy chủ gộp lại một chỗ, để dán MỘT LẦN thay vì từng tệp.
 *  Nội dung y hệt các tệp trong thư mục server/ của kho mã — không cắt bớt.
 *
 *  ── KHÔNG CÓ MẬT KHẨU NÀO TRONG TỆP NÀY ──
 *  Mã nguồn đi qua kho mã, qua tin nhắn, qua email, qua màn hình người khác
 *  nhìn thấy. Một mật khẩu đặt cứng trong mã là mật khẩu đã lộ từ dòng đầu
 *  tiên nó được viết ra. Nên máy chủ tự sinh mật khẩu tạm khi cài đặt, hiện
 *  một lần trong log, gửi kèm một thư, rồi KHÔNG mở kho cho tới khi mật khẩu
 *  ấy được đổi.
 *
 *  ── LÀM THEO ĐÚNG BỐN BƯỚC ──
 *
 *  1. Vào script.google.com bằng tài khoản Google của Học viện.
 *     New project → đổi tên thành GITA 365 → xoá hết nội dung Code.gs
 *     → dán TOÀN BỘ tệp này vào.
 *
 *  2. Kiểm hai dòng ngay dưới đây. Sai thì sổ dữ liệu nằm nhầm chỗ.
 *
 *  3. Chọn hàm  caiDatLanDau  → Run.
 *     Google hỏi quyền ở lần đầu: Review permissions → chọn tài khoản →
 *     Advanced → Go to GITA 365 (unsafe) → Allow.
 *     ("unsafe" chỉ nghĩa là dự án chưa qua kiểm duyệt của Google.
 *      Đây là mã của chính Học viện.)
 *
 *     Log sẽ hiện MẬT KHẨU TẠM của Admin@gita365. Chép ngay — nó không hiện
 *     lại lần thứ hai. Một bản cũng được gửi tới email hệ thống.
 *     Lỡ mất thì chạy hàm  datLaiMatKhauSuperAdmin  để sinh mật khẩu mới.
 *
 *  4. Thêm một tệp mã nữa tên GITA_NapKhoa, dán nội dung tệp bộ khoá,
 *     chọn hàm  napBoKhoaMotLan  → Run → log báo "Đã nạp N khoá"
 *     (N là số gói trong kho/khoa.json — 8 từ bản 9.47)
 *     → XOÁ tệp GITA_NapKhoa khỏi dự án ngay lập tức.
 *
 *  Rồi triển khai:
 *     Deploy → New deployment → bánh răng → Web app
 *        Execute as      : Me
 *        Who has access  : Anyone
 *     → Deploy → chép địa chỉ kết thúc bằng /exec
 *
 *  Cuối cùng, trong ứng dụng GITA 365: đăng nhập Super Admin →
 *  Quản trị trang → Nối máy chủ → dán địa chỉ → Lưu → Gọi thử.
 *
 *  Lần đăng nhập đầu, ứng dụng sẽ đưa thẳng tới màn đổi mật khẩu. Kho chỉ
 *  mở sau khi đổi xong — đây là chặn thật ở máy chủ, không phải lời nhắc.
 *
 *  Hướng dẫn đầy đủ, kể cả phần xử lý khi có trục trặc: docs/MAY_CHU.md
 * ═══════════════════════════════════════════════════════════════════════
 */
`;

let ra = DAU;
let dong = 0;
for (const [ten, mo] of PHAN) {
  const s = fs.readFileSync(path.join(GOC, ten), 'utf8');
  dong += s.split('\n').length;
  ra += '\n\n/* ═══════════════════════════════════════════════════════════════════════\n' +
        '   ' + mo + '\n' +
        '   (nguyên văn server/' + ten + ')\n' +
        '   ═══════════════════════════════════════════════════════════════════════ */\n\n' +
        s.replace(/\s+$/, '') + '\n';
}

const RA = path.join(GOC, 'GITA365_TATCA.gs');
fs.writeFileSync(RA, ra);

/* Soát ngay: cú pháp phải chạy được, và không mật khẩu nào lọt vào. */
try { new Function(ra); }
catch (e) { console.error('  ✗ Tệp gộp sai cú pháp: ' + e.message); process.exit(1); }

/* Đọc một trường mà bảng không có cột thì Store trả undefined — không nổ,
   chỉ im lặng sai. Thư gửi khách hàng từng mở đầu bằng "Chào ," vì đúng lỗi
   này. Soi ở đây để không tái diễn. */
{
  const m = ra.match(/var GITA_BANG = \{[\s\S]*?\n\};/);
  if (m) {
    const cot = {};
    for (const x of m[0].matchAll(/(\w+):\s*\[([\s\S]*?)\]/g))
      cot[x[1]] = (x[2].match(/'[^']+'/g) || []).map(t => t.slice(1, -1));
    const BO_QUA = new Set(['id','_dong','length','filter','map','forEach','toLowerCase',
      'indexOf','replace','slice','match','trim','split','push','test','ma','ten','ok','error']);
    const CANH = [['nd','users'],['ndTim','users'],['hv','students'],['tt','thanhToan']];
    const ban = new Set();
    for (const [bien, bang] of CANH)
      for (const x of ra.matchAll(new RegExp('\\b' + bien + '\\.([a-zA-Z_][\\w]*)', 'g')))
        if (!BO_QUA.has(x[1]) && cot[bang] && !cot[bang].includes(x[1]))
          ban.add(bien + '.' + x[1] + ' — bảng ' + bang + ' không có cột này');
    if (ban.size) {
      console.error('  ✗ Đọc trường không có trong bảng:\n     ' + [...ban].join('\n     '));
      process.exit(1);
    }
  }
}

const lo = /toiyeugita365|password\s*=\s*['"]|pwHash:\s*hashPw_\(['"][^'"]{4,}['"]/.exec(ra);
if (lo) { console.error('  ✗ Có mật khẩu nằm cứng trong mã: ' + lo[0]); process.exit(1); }

/* Apps Script chỉ cho MỘT doGet và MỘT doPost trong cả dự án. Gộp nhầm hai
   cái là dự án không lưu được, mà lỗi báo ra thì mơ hồ. Đếm ngay ở đây. */
['doGet', 'doPost'].forEach(function (h) {
  const n = (ra.match(new RegExp('^function\\s+' + h + '\\s*\\(', 'gm')) || []).length;
  if (n !== 1) {
    console.error('  ✗ Phải có đúng một hàm ' + h + ', đang có ' + n + '.');
    process.exit(1);
  }
});

console.log('  ✓ server/GITA365_TATCA.gs — ' + PHAN.length + ' phần · ' +
  ra.split('\n').length + ' dòng · ' + Math.round(ra.length / 1024) + ' KB');
console.log('  ✓ cú pháp chạy được · đúng một doGet và một doPost');
console.log('  ✓ không mật khẩu nằm cứng · không trường nào đọc sai cột bảng');
