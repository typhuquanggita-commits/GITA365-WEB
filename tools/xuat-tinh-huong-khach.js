/* ═══════════════════════════════════════════════════════════════
   GITA 365 — DỰNG BẢN CHIẾU TÌNH HUỐNG CHO MÁY CHỦ

       node tools/xuat-tinh-huong-khach.js

   Sinh server/GITA_TinhHuongKhach_DuLieu.gs — phần 30% tình huống mỗi
   tầng mà gia đình được đọc, chỉ những trường gia đình cần.

   ═══ VÌ SAO PHẢI ĐI ĐƯỜNG NÀY ═══

   Chuỗi năm vòng dựng ở bản 9.49 chạy trên G.TINHHUONG. Nhưng TINHHUONG
   là TÀI SẢN NGHỀ và bộ kiểm mục 40 chặn mọi đường đưa nó vào gói tầng
   của khách — nên chuỗi chạy cho Tư vấn, im lặng cho gia đình. Đúng
   nhóm cần nó nhất thì không có.

   Bản 9.51 chọn đường giữ nguyên và sửa lời hứa 30% cho đúng mẫu số.
   Đúng nhưng CHƯA TRIỆT ĐỂ: gia đình vẫn không có chuỗi.

   Đường này giải quyết hẳn:

     · Bản chiếu KHÔNG nằm trong gói nào. Nó ở máy chủ, trong Drive của
       Học viện — cùng chỗ với sổ tài khoản, cùng lớp bảo vệ.
     · Máy gia đình nhận nó theo PHIÊN, giữ trong bộ nhớ, không ghi
       xuống đĩa. Đóng ứng dụng là hết. Ngừng phục vụ là phiên sau
       không còn — thu hồi được, khác hẳn một gói đã cấp.
     · Mỗi lượt nạp là một dòng nhật ký: ai, tầng nào, lúc nào.

   ═══ CẮT GÌ, GIỮ GÌ ═══

   GIỮ: th (biểu hiện) · mo (bối cảnh) · pt (phân tích) · chot · gp
   (giải pháp) · kpi · dich. Đó là năm khúc chuỗi cần, cộng đích tới.

   CẮT: tt và mọi trường còn lại. Và cắt theo TẦNG: gia đình tầng ba
   nhận tầng một tới ba, không nhận tầng bốn năm.

   Trần 30% đọc từ src/kho-khach.js, không gõ lại.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
const fs = require('fs');
const path = require('path');
const GOC = path.join(__dirname, '..');

global.window = global.window || {};
for (const f of fs.readdirSync(path.join(GOC, 'kho-goc')).filter(x => x.endsWith('.js')).sort()) {
  try { require(path.join(GOC, 'kho-goc', f)); } catch (e) { /* tệp không nạp được thì bỏ qua */ }
}
const G = global.window.G || {};

/* Trần đọc từ nguồn duy nhất — gõ lại 0.30 ở đây là dựng bản thứ hai
   của một con số có giá. */
const TRAN = (() => {
  const t = fs.readFileSync(path.join(GOC, 'src', 'kho-khach.js'), 'utf8');
  const m = /G\.TRAN_KHACH\s*=\s*([0-9.]+)/.exec(t);
  if (!m) { console.error('  ✗ Không đọc được G.TRAN_KHACH'); process.exit(1); }
  return Number(m[1]);
})();

/* Trường gia đình được đọc. Khai thành danh sách để thêm bớt là sửa một
   dòng, và để bộ kiểm đối chiếu được cái gì thật sự rời máy chủ. */
const COT = ['stt', 'tang', 'nhom', 'key', 'th', 'mo', 'pt', 'chot', 'gp', 'kpi', 'dich'];

const ra = {};
let dem = 0;
for (let t = 1; t <= 5; t++) {
  const cua = (G.TINHHUONG || []).filter(x => x.tang === 'T' + t);
  /* Thứ tự lấy y hệt luật thứ hạng của kho-khach.js: tầng trước, rồi
     thứ tự gốc — nên bản ghi nào gia đình mở được thì cả hai bên cùng
     chỉ ra một danh sách. */
  const lay = cua.slice(0, Math.ceil(cua.length * TRAN));
  ra['T' + t] = lay.map(x => {
    const o = {};
    /* Trường vắng thì BỎ HẲN KHOÁ, không để null: vắng nghĩa là không
       áp dụng, rỗng nghĩa là đáng lẽ phải có giá trị. */
    COT.forEach(c => { if (x[c] != null && x[c] !== '') o[c] = x[c]; });
    return o;
  });
  dem += lay.length;
}

const noi = JSON.stringify(ra);
const DAU = `/**
 * ═══════════════════════════════════════════════════════════════
 * GITA 365 — BẢN CHIẾU TÌNH HUỐNG CHO GIA ĐÌNH
 * TỆP NÀY DO MÁY SINH RA — KHÔNG SỬA TAY.
 * Dựng lại bằng: node tools/xuat-tinh-huong-khach.js
 *
 * Chỉ ${dem} tình huống — đúng ${Math.round(TRAN * 100)}% mỗi tầng, và
 * chỉ những trường gia đình cần. Phần còn lại của kho tình huống KHÔNG
 * có trong tệp này và không có đường nào tới máy gia đình.
 *
 * Sửa tay thì lần chạy công cụ sau đè mất, và tệ hơn: bản trên máy chủ
 * lệch với kho gốc mà không ai đối chiếu được.
 * ═══════════════════════════════════════════════════════════════
 */

var GITA_TH_KHACH = `;

fs.writeFileSync(path.join(GOC, 'server', 'GITA_TinhHuongKhach_DuLieu.gs'),
  DAU + noi + ';\n');

console.log('  ✓ server/GITA_TinhHuongKhach_DuLieu.gs — ' + dem + ' tình huống · ' +
  Math.round(noi.length / 1024) + ' KB · trần ' + Math.round(TRAN * 100) + '%');
[1, 2, 3, 4, 5].forEach(t => console.log('     T' + t + ': ' + ra['T' + t].length));
console.log('  ✓ ' + COT.length + ' trường: ' + COT.join(' · '));
console.log('  ✓ KHÔNG có trường tt và mọi trường nghề khác');
