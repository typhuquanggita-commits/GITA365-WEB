/* ═══════════════════════════════════════════════════════════════
   GITA 365 — THỬ NỀN DỮ LIỆU MỚI, VÀ ĐO LẠI CHI PHÍ ĐỌC

       node tools/thu-csdl-moi.js

   Chủ hệ chốt hướng: cửa vào mới + cơ sở dữ liệu thật, để tới được
   100.000 tài khoản và thiết kế theo mức đầy 500.000.

   BỘ THỬ NÀY KHÔNG PHẢI BẢN MÔ PHỎNG

   Cloudflare D1 CHÍNH LÀ SQLite. node:sqlite cũng là SQLite. Nên
   may-chu/csdl.sql chạy ở đây là chạy đúng lược đồ sẽ nằm trên máy
   chủ thật, không phải một bản dựng lại gần giống. Câu lệnh nào chạy
   được ở đây thì chạy được ở đó; chỉ mục nào SQLite chịu dùng ở đây
   thì nó cũng chịu dùng ở đó.

   Khác biệt còn lại: D1 chạy qua mạng nên mỗi lượt gọi có độ trễ
   đường truyền mà máy này không có. Bộ đo vì thế đếm SỐ DÒNG ĐỌC và
   SỐ LƯỢT GỌI, không đếm giây — cùng luật với tools/do-tai-may-chu.js.

   ĐO CHỖ QUAN TRỌNG NHẤT: CÓ CÒN QUÉT CẢ BẢNG KHÔNG

   Chuyển nền mà vẫn quét cả bảng thì không chữa được gì, chỉ đổi chỗ
   quét. SQLite tự khai điều đó qua EXPLAIN QUERY PLAN: câu nào còn
   chữ SCAN là câu còn quét. Bộ thử soi thẳng vào đấy, chứ không đo
   thời gian rồi đoán.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
const path = require('path');
process.chdir(path.join(__dirname, '..'));
const fs = require('fs');
const { DatabaseSync } = require('node:sqlite');

let loi = 0;
const bao = (ok, ten, ct) => {
  if (!ok) loi++;
  console.log((ok ? '  ✓ ' : '  ✗ ') + ten + (ct ? ' — ' + ct : ''));
};
const noi = (ten, ct) => console.log('  · ' + ten + (ct ? ' — ' + ct : ''));
const so = n => Number(n).toLocaleString('vi-VN');

console.log('\nTHỬ NỀN DỮ LIỆU MỚI — SQLite, y hệt Cloudflare D1\n');

/* ═══════════════ 1 · LƯỢC ĐỒ DỰNG ĐƯỢC ═══════════════ */
console.log('1 · LƯỢC ĐỒ');
const SQL = fs.readFileSync('may-chu/csdl.sql', 'utf8');
const db = new DatabaseSync(':memory:');
try { db.exec(SQL); }
catch (e) { console.error('  ✗ Lược đồ không dựng được: ' + e.message); process.exit(1); }

const bang = db.prepare(
  "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name"
).all().map(x => x.name);
const chiMuc = db.prepare(
  "SELECT name, tbl_name FROM sqlite_master WHERE type='index' AND name LIKE 'ix_%' ORDER BY name"
).all();

bao(bang.length >= 10, 'dựng đủ bảng', bang.length + ' bảng: ' + bang.join(', '));
bao(chiMuc.length >= 14, 'dựng đủ chỉ mục', chiMuc.length + ' chỉ mục');

/* MỌI BẢNG CÓ TRA CỨU ĐỀU PHẢI CÓ ÍT NHẤT MỘT CHỈ MỤC.

   Hai bảng được tha, và mỗi bảng khai LÝ DO ngay ở đây — tha mà không
   khai thì lần sau người ta thêm một tên vào danh sách này cho bộ thử
   xanh, và cái danh sách trở thành chỗ giấu lỗi.

   soDem  — tra đúng bằng khoá chính, không có đường tra nào khác.
   caiDat — nhiều nhất BẢY dòng (một dòng mỗi cụm) và mỗi lượt đồng bộ
            đọc trọn cả bảng. Quét bảy dòng rẻ hơn đi qua chỉ mục; thêm
            một chỉ mục ở đây là thêm một thứ phải giữ mà không ai dùng.
   chotKet — khoá chính LÀ ngày, và cả hai đường tra đều đi theo ngày:
            dsChotKet xếp giảm dần theo ngày, boSoKhaiThue lọc khoảng
            ngày. SQLite tự dựng sqlite_autoindex_chotKet_1 cho khoá
            chính TEXT và dùng nó cho cả hai — đo được bằng EXPLAIN
            QUERY PLAN, không phải phỏng đoán. Thêm ix_ trên cùng cột
            ấy là dựng bản thứ hai của một chỉ mục đã có. */
const KHONG_CAN = ['soDem', 'caiDat', 'chotKet'];
const thieuChiMuc = bang.filter(b =>
  KHONG_CAN.indexOf(b) < 0 && !chiMuc.some(c => c.tbl_name === b));
bao(!thieuChiMuc.length, 'không bảng nào có đường tra cứu mà thiếu chỉ mục',
  thieuChiMuc.join(', ') || 'đủ cả');

/* ═══════════════ 2 · ĐỔ DỮ LIỆU ═══════════════

   Nửa triệu dòng users là mức ĐẦY chủ hệ đặt. Đổ thật, không suy ra:
   đây chính là chỗ nền cũ không dựng nổi, nên nó đáng được dựng thật
   một lần để xem có dựng nổi không. */
console.log('\n2 · ĐỔ NỬA TRIỆU TÀI KHOẢN — MỨC ĐẦY CHỦ HỆ ĐẶT');
const N = Number(process.env.GITA_N || 500000);

const t0 = Date.now();
db.exec('BEGIN');
const themU = db.prepare(
  'INSERT INTO users (id,username,hoTen,email,role,portal,active,createdAt,maKhachHang) ' +
  'VALUES (?,?,?,?,?,?,1,?,?)');
const themS = db.prepare(
  'INSERT INTO students (id,hoTen,tier,phuHuynhId,createdAt) VALUES (?,?,?,?,?)');
const themP = db.prepare(
  'INSERT INTO sessions (id,uid,username,role,portal,exp,createdAt) VALUES (?,?,?,?,?,?,?)');
const luc = new Date().toISOString();
const han = Date.now() + 3600e3;
for (let i = 0; i < N; i++) {
  const uid = 'U-' + i, ten = 'nguoi' + i + '@gita365.vn';
  themU.run(uid, ten, 'Người thử ' + i, ten, 'R13', 'ph', luc, 'GITA-' + (100000 + i));
  if (i % 5 < 3) themS.run('HV-' + i, 'Học viên ' + i, (i % 5) + 1, uid, luc);
  themP.run('S-' + i, uid, ten, 'R13', 'ph', han, luc);
}
db.exec('COMMIT');

const demU = db.prepare('SELECT count(*) c FROM users').get().c;
bao(demU === N, 'đổ đủ ' + so(N) + ' tài khoản vào MỘT cơ sở dữ liệu',
  so(demU) + ' dòng users · ' + so(db.prepare('SELECT count(*) c FROM sessions').get().c) +
  ' phiên · ' + so(db.prepare('SELECT count(*) c FROM students').get().c) + ' học viên · ' +
  ((Date.now() - t0) / 1000).toFixed(1) + ' giây');
noi('nền cũ chứa được 79.033 tài khoản — trần 10 triệu ô của Sheets',
  'nền này vừa nhận ' + so(N) + ', gấp ' + (N / 79033).toFixed(1) + ' lần');

/* ═══════════════ 3 · CÒN QUÉT CẢ BẢNG KHÔNG ═══════════════

   Đây là phép đo quan trọng nhất của cả bộ. Chuyển nền mà vẫn quét cả
   bảng thì chỉ đổi chỗ quét, không chữa được gì.

   Mỗi câu dưới đây lấy từ một đường tra cứu CÓ THẬT trong server/*.gs,
   ghi kèm chỗ lấy. Không nghĩ ra câu để bộ thử dễ xanh. */
console.log('\n3 · MỌI ĐƯỜNG TRA CỨU CÓ THẬT — CÒN QUÉT CẢ BẢNG KHÔNG');

const DUONG = [
  ['tra phiên theo token — MỌI lượt gọi có xác thực',
   'GITA_Nen.gs · readSession_',
   'SELECT * FROM sessions WHERE id = ?', ['S-1']],

  ['tra tài khoản theo id — mọi lượt gọi có xác thực',
   'GITA_CapPhep.gs · kiemTraPhien_',
   'SELECT * FROM users WHERE id = ?', ['U-1']],

  ['tra tầng học viên theo tài khoản cha — mọi lượt gọi có xác thực',
   'GITA_CapPhep.gs · kiemTraPhien_',
   'SELECT * FROM students WHERE phuHuynhId = ? AND deletedAt IS NULL', ['U-1']],

  ['đăng nhập bằng tên đăng nhập hoặc email',
   'GITA_Nen.gs · gitaDangNhap_',
   'SELECT * FROM users WHERE lower(username) = ? OR lower(email) = ?',
   ['nguoi7@gita365.vn', 'nguoi7@gita365.vn']],

  ['đá mọi phiên khác của một người khi đổi mật khẩu',
   'GITA_Nen.gs · xoaMoiPhien_',
   'SELECT id FROM sessions WHERE uid = ? AND exp > ?', ['U-1', Date.now()]],

  ['tìm lượt đăng ký chờ theo email',
   'GITA_DangKy.gs',
   "SELECT * FROM dangKyCho WHERE lower(email) = ? AND trangThai <> 'xong'", ['ai@do.vn']],

  ['tìm lượt đăng ký theo đường dẫn kích hoạt',
   'GITA_DangKy.gs',
   "SELECT * FROM dangKyCho WHERE tokenKichHoat = ? AND trangThai = 'choKichHoat'", ['tk-1']],

  ['đếm mã khách hàng đã cấp — sinh mã mới',
   'GITA_DangKy.gs',
   "SELECT count(*) c FROM users WHERE maKhachHang IS NOT NULL AND maKhachHang <> ''", []],

  ['tra chứng từ thanh toán để nâng tầng',
   'GITA_DangKy.gs',
   "SELECT * FROM thanhToan WHERE maKhachHang = ? AND tier = ? AND trangThai = 'daXacNhan'",
   ['GITA-100001', 2]],

  ['lọc học viên theo tầng — màn quyền xem khách',
   'GITA_XemKhach.gs · GITA_TinhHuongKhach.gs',
   'SELECT * FROM students WHERE tier = ? AND deletedAt IS NULL LIMIT 50', [4]],

  ['tra hồ sơ đang dùng của một người',
   'GITA_DongBo.gs',
   'SELECT * FROM hosoApp WHERE uid = ?', ['U-1']],

  ['lấy mười bản sao lưu gần nhất của một người',
   'GITA_DonDep.gs · GITA_HAN.hosoAppSaoLuu',
   'SELECT id FROM hosoAppSaoLuu WHERE uid = ? ORDER BY luc DESC LIMIT 10', ['U-1']],

  ['tìm phiên quá hạn để dọn',
   'GITA_DonDep.gs · GITA_HAN.sessions',
   'SELECT id FROM sessions WHERE exp > 0 AND exp < ? LIMIT 1000', [Date.now()]],

  ['sổ tài liệu đang chờ duyệt',
   'GITA_TaiLieu.gs',
   "SELECT * FROM tailieu WHERE trangThai = 'choDuyet' ORDER BY luc LIMIT 50", []],

  ['đọc cả bảng cài đặt — mỗi lượt đồng bộ',
   'may-chu/dong-bo.js · docCaiDat',
   'SELECT cum, du, luc, boi FROM caiDat', [],
   'bảng có nhiều nhất BẢY dòng, một dòng mỗi cụm, và lượt nào cũng cần cả bảy'],

  ['tra tệp khách hàng theo mã',
   'may-chu/ho-so-khach.js · xemTepKhach',
   'SELECT * FROM hoSoKhach WHERE maKhachHang = ?', ['GITA-0001']],

  ['sổ khách của một Coach',
   'may-chu/ho-so-khach.js · dsTepKhach',
   'SELECT maKhachHang FROM hoSoKhach WHERE coach = ? ORDER BY vaoLuc DESC LIMIT 100',
   ['coach@gita365.vn']],

  ['lịch sử tầng của một nhà',
   'may-chu/ho-so-khach.js · xemTepKhach',
   'SELECT * FROM lichSuTang WHERE maKhachHang = ? ORDER BY luc DESC LIMIT 20', ['GITA-0001']],

  ['công nợ một nhà — phải thu trừ đã thu',
   'may-chu/tai-chinh.js · congNo',
   'SELECT k.id, COALESCE(SUM(CASE WHEN p.trangThai = ? THEN p.soTien END),0) daThu ' +
   'FROM kyThu k LEFT JOIN phieuThu p ON p.idKy = k.id WHERE k.maKhachHang = ? GROUP BY k.id',
   ['daDuyet', 'GITA-0001']],

  ['phiếu thu đang chờ duyệt',
   'may-chu/tai-chinh.js · banKeTaiChinh',
   "SELECT id FROM phieuThu WHERE trangThai = 'choDuyet' ORDER BY ghiLuc LIMIT 100", []],

  ['hoa hồng còn phải trả',
   'may-chu/tai-chinh.js · banKeTaiChinh',
   "SELECT id FROM hoaHongTra WHERE trangThai = 'phaiTra' ORDER BY sinhLuc LIMIT 100", []],

  ['tra một bản chứng cứ theo mã',
   'may-chu/chung-cu.js · timBan',
   'SELECT * FROM chungCu WHERE ma = ?', ['CC-x']],

  ['sổ chứng cứ của một người',
   'may-chu/chung-cu.js · ix_cc_nguoi',
   'SELECT ma FROM chungCu WHERE nguoiGhi = ? ORDER BY gioMayChu DESC LIMIT 50',
   ['coach@gita365.vn']],

  ['tra giấy phép xem hồ sơ khách còn hiệu lực',
   'may-chu/quyen-xem.js · phepCua',
   "SELECT * FROM quyenXem WHERE nguoiDuocCap = ? AND (thuHoiLuc IS NULL OR thuHoiLuc = '') " +
   'AND hetHan > ? ORDER BY capLuc DESC LIMIT 1', ['coach@gita365.vn', new Date().toISOString()]],

  ['tra phiếu thanh toán chưa dùng để nâng tầng',
   'may-chu/quyen-xem.js · nangTang',
   "SELECT * FROM thanhToan WHERE maKhachHang = ? AND tier = ? AND trangThai = 'daXacNhan' " +
   'AND (daDung IS NULL OR daDung = 0) LIMIT 1', ['GITA-9001', 2]],

  ['tra mã lấy lại mật khẩu của một tài khoản',
   'may-chu/mat-khau.js · datLaiMatKhau',
   'SELECT * FROM maLayLai WHERE uid = ?', ['U-1']],

  ['tìm mã lấy lại mật khẩu đã quá hạn để dọn',
   'may-chu/worker.js · scheduled',
   'SELECT uid FROM maLayLai WHERE hetHan < ? LIMIT 1000', [Date.now()]],

  ['tìm dòng chặn nhịp đã quá hạn để dọn',
   'may-chu/csdl.sql · chanNhip',
   'SELECT khoa FROM chanNhip WHERE hetHan < ? LIMIT 1000', [Date.now()]]
];

let soQuet = 0;
DUONG.forEach(function (d) {
  const ke = db.prepare('EXPLAIN QUERY PLAN ' + d[2]).all(...d[3]);
  const loi2 = ke.map(x => x.detail).join(' | ');
  /* MỌI chữ SCAN đều tính là hỏng, không trừ trường hợp nào.

     Bản đầu tôi tha cho "SCAN ... USING INDEX", nghĩ rằng quét trên chỉ
     mục thì rẻ. Phép phá ở mục 5 bóc ngay: bỏ ix_students_ph đi thì
     SQLite chuyển sang "SCAN students USING INDEX ix_students_tier" —
     vẫn đọc cả nửa triệu dòng, chỉ đọc qua một chỉ mục khác — và phép
     soi của tôi gật đầu cho qua.

     Một lời tha viết theo khuôn chữ thì nó tha luôn những chỗ mình
     không định tha. Câu nào quét có lý do thì khai riêng ở cột thứ năm
     của chính câu ấy, kèm lý do — tha từng chỗ một, đọc được. */
  const quet = /\bSCAN\b/.test(loi2) && !d[4];
  if (quet) soQuet++;
  bao(!quet, d[0] + (d[4] ? '  (quét có khai: ' + d[4] + ')' : ''),
    quet ? 'CÒN QUÉT CẢ BẢNG · ' + d[1] + ' · ' + loi2 : loi2);
});

/* ═══════════════ 4 · MỘT LƯỢT GỌI CÓ XÁC THỰC ĐỌC BAO NHIÊU DÒNG ═══════════════

   Nền cũ: 50 ô × số tài khoản. Ở 500.000 là 25 triệu ô cho MỘT lượt.
   Nền mới phải là một con số KHÔNG ĐỔI theo số tài khoản — đo bằng
   cách đếm dòng SQLite thật sự chạm tới, không bằng cách tin lược đồ. */
console.log('\n4 · MỘT LƯỢT GỌI CÓ XÁC THỰC CHẠM BAO NHIÊU DÒNG');

function motLuotGoi(token) {
  const p = db.prepare('SELECT * FROM sessions WHERE id = ?').get(token);
  if (!p) return null;
  const u = db.prepare('SELECT * FROM users WHERE id = ?').get(p.uid);
  const h = db.prepare('SELECT * FROM students WHERE phuHuynhId = ? AND deletedAt IS NULL').all(p.uid);
  return {p: p, u: u, h: h.length};
}

/* SQLite đếm sẵn số dòng đã đọc qua bộ đếm trạng thái; node:sqlite chưa
   mở bộ đếm ấy ra, nên đo bằng đường chắc hơn: chạy cùng một lượt gọi ở
   hai cỡ bảng khác nhau và xem thời gian có bò lên theo số dòng không.
   Chỉ mục đúng thì nó KHÔNG bò. */
function doLuot(lan) {
  const b = process.hrtime.bigint();
  for (let i = 0; i < lan; i++) motLuotGoi('S-' + (i % N));
  return Number(process.hrtime.bigint() - b) / 1e6 / lan;
}
doLuot(2000);                                   /* làm nóng, không tính */
const msDay = doLuot(20000);
noi('ở ' + so(N) + ' tài khoản: ' + msDay.toFixed(4) + ' ms mỗi lượt gọi (3 câu lệnh)');

/* Xoá bớt còn một phần trăm rồi đo lại. Chi phí KHÔNG ĐỔI nghĩa là nó
   không phụ thuộc số tài khoản — đúng thứ nền cũ không làm được. */
const NHO = Math.max(1000, Math.floor(N / 100));
db.exec('DELETE FROM users WHERE CAST(substr(id,3) AS INTEGER) >= ' + NHO);
db.exec('DELETE FROM sessions WHERE CAST(substr(id,3) AS INTEGER) >= ' + NHO);
db.exec('DELETE FROM students WHERE CAST(substr(id,4) AS INTEGER) >= ' + NHO);
const conLai = db.prepare('SELECT count(*) c FROM users').get().c;
function doLuotNho(lan) {
  const b = process.hrtime.bigint();
  for (let i = 0; i < lan; i++) motLuotGoi('S-' + (i % conLai));
  return Number(process.hrtime.bigint() - b) / 1e6 / lan;
}
doLuotNho(2000);
const msNho = doLuotNho(20000);
noi('ở ' + so(conLai) + ' tài khoản: ' + msNho.toFixed(4) + ' ms mỗi lượt gọi');

const boLen = msDay / msNho;
bao(boLen < 2,
  'chi phí một lượt gọi KHÔNG bò lên theo số tài khoản',
  so(conLai) + ' → ' + so(N) + ' tài khoản (gấp ' + Math.round(N / conLai) +
  ' lần) mà chỉ chậm đi ' + boLen.toFixed(2) + ' lần');
noi('nền cũ ở cùng phép so này chậm đi đúng ' + Math.round(N / conLai) + ' lần',
  'vì Store.doc() đọc CẢ TRANG — xem tools/do-tai-may-chu.js mục 2');

/* ═══════════════ 5 · PHÉP SOI TỰ CHỨNG MINH CHƯA CÂM ═══════════════

   Mục 3 xanh mười bốn dòng. Một phép soi xanh hết mà chưa từng đỏ thì
   chưa phải phép soi — nó có thể đang đọc nhầm chỗ, hoặc luật nhận
   dạng "SCAN" của nó có thể đã hỏng từ lâu mà không ai biết.

   Nên: bỏ hẳn một chỉ mục có thật, hỏi lại đúng câu ấy, đòi nó ĐỎ.
   Rồi dựng lại chỉ mục và hỏi lần nữa, đòi nó XANH.

   Bỏ chỉ mục trong một cơ sở dữ liệu nằm trong bộ nhớ là việc cục bộ,
   dựng lại được nguyên trạng — khác hẳn lối tráo một hàm toàn cục mà
   kho này đã dính năm lần. */
console.log('\n5 · PHÉP SOI TỰ CHỨNG MINH CHƯA CÂM');
function conQuet(cau, dv) {
  const l = db.prepare('EXPLAIN QUERY PLAN ' + cau).all(...dv).map(x => x.detail).join(' | ');
  return {quet: /\bSCAN\b/.test(l), loi: l};   /* cùng luật với mục 3 */
}
const CAU = 'SELECT * FROM students WHERE phuHuynhId = ? AND deletedAt IS NULL';
db.exec('DROP INDEX ix_students_ph');
const khiThieu = conQuet(CAU, ['U-1']);
db.exec('CREATE INDEX ix_students_ph ON students (phuHuynhId)');
const khiDu = conQuet(CAU, ['U-1']);
bao(khiThieu.quet, 'bỏ chỉ mục đi thì phép soi ĐỎ đúng chỗ', khiThieu.loi);
bao(!khiDu.quet, 'dựng chỉ mục lại thì phép soi XANH lại', khiDu.loi);

console.log('');
if (loi) {
  console.log('✗ CÒN ' + loi + ' CHỖ CHƯA ĐẠT' + (soQuet ? ' · ' + soQuet + ' câu còn quét cả bảng' : ''));
  process.exit(1);
}
console.log('✓ TOÀN BỘ ĐẠT — nền dữ liệu mới nhận nổi ' + so(N) + ' tài khoản, không câu nào quét cả bảng');
