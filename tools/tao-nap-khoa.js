/* ═══════════════════════════════════════════════════════════════
   GITA 365 — TẠO TỆP NẠP KHOÁ CHO MÁY CHỦ CẤP PHÉP

       node tools/tao-nap-khoa.js

   Ra: giay-phep/GITA_NapKhoa.gs — dán vào Apps Script, chạy đúng một
   lần rồi XOÁ NGAY khỏi dự án. Sau khi chạy, khoá nằm trong Script
   Properties, không nằm trong mã nguồn.

   ⚠ Tệp này mang khoá thật. Không đưa lên kho mã, không gửi qua kênh
   công khai. giay-phep/ nằm trong .gitignore.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
const fs = require('fs');
const path = require('path');

const GOC = path.join(__dirname, '..');
const KHOA = path.join(GOC, 'kho', 'khoa.json');
const RA = path.join(GOC, 'giay-phep');

if (!fs.existsSync(KHOA)) {
  console.error('Chưa có kho/khoa.json. Chạy trước: node tools/ma-hoa-kho.js');
  process.exit(1);
}
const bo = JSON.parse(fs.readFileSync(KHOA, 'utf8')).khoa;

const noi = `/**
 * GITA 365 — NẠP BỘ KHOÁ VÀO MÁY CHỦ CẤP PHÉP
 *
 * CÁCH DÙNG — làm đúng bốn bước, không bỏ bước nào:
 *   1. Dán toàn bộ tệp này vào dự án Apps Script của GITA 365.
 *   2. Chọn hàm napBoKhoaMotLan rồi bấm Run. Cấp quyền nếu Google hỏi.
 *   3. Xem log: phải báo "Đã nạp ${Object.keys(bo).length} khoá".
 *   4. XOÁ TỆP NÀY khỏi dự án Apps Script ngay lập tức.
 *
 * Sau bước 4, khoá nằm trong Script Properties — chỉ mã trong dự án đọc
 * được, không ai xem được từ bên ngoài, và không còn bản nào trong mã nguồn.
 *
 * ⚠ TỆP NÀY MANG KHOÁ THẬT CỦA KHO GITA 365.
 *   Không lưu vào kho mã. Không gửi qua email hay chat nhóm.
 *   Tạo lúc: ${new Date().toISOString()}
 */
function napBoKhoaMotLan() {
  var khoa = ${JSON.stringify(bo, null, 4).replace(/\n/g, '\n  ')};
  PropertiesService.getScriptProperties().setProperty('GITA_KHOA_KHO', JSON.stringify(khoa));
  var n = Object.keys(khoa).length;
  Logger.log('Đã nạp ' + n + ' khoá. XOÁ TỆP NÀY khỏi dự án ngay bây giờ.');
  return 'Đã nạp ' + n + ' khoá. XOÁ TỆP NÀY khỏi dự án ngay bây giờ.';
}

/** Kiểm đã nạp chưa mà không lộ khoá nào. */
function kiemBoKhoa() {
  var raw = PropertiesService.getScriptProperties().getProperty('GITA_KHOA_KHO');
  if (!raw) return 'CHƯA nạp khoá.';
  var k = JSON.parse(raw);
  return 'Đã nạp ' + Object.keys(k).length + ' gói: ' + Object.keys(k).join(', ');
}

/** Xoá sạch bộ khoá khỏi máy chủ. Dùng khi nghi rò rỉ. */
function xoaBoKhoa() {
  PropertiesService.getScriptProperties().deleteProperty('GITA_KHOA_KHO');
  return 'Đã xoá bộ khoá. Máy chủ sẽ trả lỗi NOKEY cho tới khi nạp lại.';
}
`;

fs.mkdirSync(RA, { recursive: true });
const duong = path.join(RA, 'GITA_NapKhoa.gs');
fs.writeFileSync(duong, noi);

/* Cách nhanh và an toàn hơn: dán thẳng vào ô Script Properties trên giao
   diện Apps Script. Không có mã nào phải dán rồi xoá, nên không có nguy cơ
   quên xoá. */
const oValue = path.join(RA, 'GITA_KHOA_KHO.txt');
fs.writeFileSync(oValue, JSON.stringify(bo));

console.log('  Gói khoá: ' + Object.keys(bo).join(' '));
console.log('\n  CÁCH 1 — nhanh và an toàn hơn, không phải dán mã rồi xoá:');
console.log('    Apps Script → Project Settings → Script Properties → Add script property');
console.log('      Property : GITA_KHOA_KHO');
console.log('      Value    : dán toàn bộ nội dung ' + path.relative(GOC, oValue));
console.log('    → Save script properties. Xong.');
console.log('\n  CÁCH 2 — nếu quen chạy hàm hơn:');
console.log('    Dán ' + path.relative(GOC, duong) + ' vào dự án → chạy napBoKhoaMotLan()');
console.log('    → thấy log "Đã nạp ' + Object.keys(bo).length + ' khoá" → XOÁ TỆP ĐÓ khỏi dự án ngay.');
console.log('\n  ⚠ Cả hai tệp đều mang khoá thật. giay-phep/ nằm trong .gitignore.');
