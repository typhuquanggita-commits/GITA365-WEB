/* ═══════════════════════════════════════════════════════════════
   GITA 365 — DỰNG KHO BẢN VẼ TỪ BẢN ĐỌC

       python3 tools/doc-ban-ve.py <pdf>     → tools/ban-ve.json
       node    tools/dung-ban-ve.js          → kho-goc/data.ban-ve.js

   Tách hai bước có chủ ý: bước một đọc PDF (cần poppler), bước hai
   dựng kho (chỉ cần node). Chủ hệ đọc một lần, rồi sửa tay ban-ve.json
   nếu cần, mà không phải cài lại gì.

   ═══ BA THỨ CÔNG CỤ NÀY CỐ TÌNH BỎ ═══

   1. CỘT GIÁ. Bộ bản vẽ ghi giá năm tầng. Kho đã có HP_TANG, và bộ
      bản vẽ ghi tầng 4 khác kho. Rút giá vào đây là dựng bản thứ hai
      của bảng giá — mà dựng bằng máy thì khó thấy hơn chép tay.
      Giữ THỜI LƯỢNG, VAI DẪN, CAM KẾT GIAO HÀNG, TRẦN CÔNG SUẤT —
      bốn thứ ấy kho chưa có. Bỏ đúng một cột giá.

   2. MÃ CỔNG C1–C4 GIỮ NGUYÊN NHƯNG KHÔNG DÙNG LÀM KHOÁ. Kho đã có
      G.CHUYENDOI với tám cổng C0–C7, và C1 ở đó nghĩa KHÁC hẳn C1 ở
      đây. Nên cổng của bản vẽ mang khoá riêng BVC1–BVC4, còn mã gốc
      C1–C4 giữ ở trường maGoc để đối chiếu với tờ giấy. Trùng mã mà
      khác nghĩa là chỗ sáu tháng sau có người trỏ nhầm.

   3. KHÔNG ĐOÁN Ô TRỐNG. Ô nào bản vẽ để trống thì kho bỏ hẳn khoá,
      không điền chuỗi rỗng — đúng luật nhà: vắng mặt nghĩa là không
      áp dụng, rỗng nghĩa là đáng lẽ phải có.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
const fs = require('fs');
const path = require('path');
const GOC = path.join(__dirname, '..');
const NGUON = path.join(__dirname, 'ban-ve.json');

if (!fs.existsSync(NGUON)) {
  console.error('  ✗ Chưa có tools/ban-ve.json — chạy trước: python3 tools/doc-ban-ve.py <pdf>');
  process.exit(1);
}
const d = JSON.parse(fs.readFileSync(NGUON, 'utf8'));

/* Chuỗi đưa vào mã: bỏ ô trống hẳn, không để chuỗi rỗng. */
const q = s => JSON.stringify(String(s == null ? '' : s).replace(/\s+/g, ' ').trim());
function truong(ten, v, phay) {
  const s = String(v == null ? '' : v).replace(/\s+/g, ' ').trim();
  return s ? `${ten}: ${q(s)}${phay === false ? '' : ','}` : '';
}
function goi(cap, ...ds) {
  return ds.filter(Boolean).map(x => ' '.repeat(cap) + x).join('\n');
}

const MAU = { T1: '#0B6675', T2: '#B4720F', T3: '#5140B4', T4: '#B45309', T5: '#BE0E16' };

/* ── 50 ô cấp độ ── */
let capDo = '';
for (const t of ['T1', 'T2', 'T3', 'T4', 'T5']) {
  const ds = d.capdo[t] || [];
  capDo += `\n  /* ${t} — ${ds.length} cấp */\n`;
  capDo += ds.map(r => {
    const [cap, moc, bc, ai, nguoi, wow, tut] = r;
    return '  { tang: ' + q(t) + ', cap: ' + Number(cap) + ', ma: ' + q(t + '-C' + cap) + ',\n' +
      goi(4,
        truong('moc', moc),
        truong('bangChung', bc),
        ai && ai !== '—' ? truong('ai', ai) : '',
        nguoi && nguoi !== '—' ? truong('nguoi', nguoi) : '',
        truong('wow', wow),
        truong('neuTut', tut, false)) + ' }';
  }).join(',\n') + ',\n';
}

/* ── bốn cổng ── */
const cong = (d.cong.dong || []).map(r => {
  const [ma, chuyen, dk, dl, ai, cau, khong, thay] = r;
  return '  { ma: ' + q('BV' + ma) + ', maGoc: ' + q(ma) + ',\n' +
    goi(4,
      truong('chuyen', chuyen),
      truong('dieuKienMo', dk),
      truong('duLieuBatBuoc', dl),
      truong('nguoiQuyet', ai),
      truong('cauThoai', cau),
      truong('khiNaoKhongMo', khong),
      truong('duongThayThe', thay, false)) + ' }';
}).join(',\n');

/* ── mười nhịp, ghép câu chuẩn và câu cấm vào cùng hàng ── */
const cauTheoNhip = {};
(d.cau.dong || []).forEach(r => { cauTheoNhip[String(Number(r[0]))] = r; });
const nhip = (d.nhip.dong || []).map(r => {
  const [so, ten, mucDich, vao, aiLam, nguoiLam, raBuoc, loi] = r;
  const c = cauTheoNhip[String(Number(so))] || [];
  return '  { so: ' + Number(so) + ', ten: ' + q(ten) + ',\n' +
    goi(4,
      truong('mucDich', mucDich),
      truong('dauVao', vao),
      aiLam && aiLam !== '—' ? truong('mayLam', aiLam) : '',
      nguoiLam && nguoiLam !== '—' ? truong('nguoiLam', nguoiLam) : '',
      truong('dauRa', raBuoc),
      truong('loiThuongGap', loi),
      truong('cauChuan', c[2]),
      truong('cauCam', c[3], false)) + ' }';
}).join(',\n');

/* ── hai mươi tín hiệu đỏ ── */
const tinDo = (d.do.dong || []).map(r => {
  const [muc, so, tin, lam, nhan, han] = r;
  return '  { muc: ' + q(muc) + ', so: ' + Number(so) + ',\n' +
    goi(4,
      truong('tinHieu', tin),
      truong('hanhDong', lam),
      truong('nguoiNhan', nhan),
      truong('hanGio', han, false)) + ' }';
}).join(',\n');

/* ── trigger của máy ── */
const trig = (d.trigger.dong || []).map(r => {
  const [dk, lam, han, rao] = r;
  return '  { khi: ' + q(dk) + ',\n' +
    goi(4, truong('lam', lam), truong('hanGio', han), truong('hangRao', rao, false)) + ' }';
}).join(',\n');

/* ── tám module ── */
const mod = (d.module.dong || []).map(r => {
  const [ma, ten, chucNang, quyen, dl] = r;
  return '  { ma: ' + q(ma) + ', ten: ' + q(ten) + ',\n' +
    goi(4, truong('chucNang', chucNang), truong('phanQuyen', quyen),
        truong('duLieuChinh', dl, false)) + ' }';
}).join(',\n');

/* ── tám bảng dữ liệu lõi ── */
const bang = (d.bang.dong || []).map(r => {
  const [ten, khoa, truongQT, ghi, doc] = r;
  return '  { bang: ' + q(ten) + ', khoaChinh: ' + q(khoa) + ',\n' +
    goi(4, truong('truongQuanTrong', truongQT), truong('aiGhi', ghi),
        truong('aiDoc', doc, false)) + ' }';
}).join(',\n');

/* ── mười vai ── */
const vai = (d.vai.dong || []).map(r => {
  const [so, ten, nv, quyen, kpi, gioiHan, tran] = r;
  return '  { so: ' + Number(so) + ', ten: ' + q(ten) + ',\n' +
    goi(4,
      truong('nhiemVu', nv),
      truong('quyenHan', quyen),
      truong('kpi', kpi),
      truong('gioiHanTuyetDoi', gioiHan),
      tran && tran !== '—' ? truong('tran', tran, false) : '') + ' }';
}).join(',\n');

/* ── cấu hình tầng: GIỮ MỌI CỘT TRỪ GIÁ ── */
const cotCauHinh = d.cauhinh.cot || [];
const iGia = cotCauHinh.findIndex(x => /^Giá/.test(x));
const cauHinh = (d.cauhinh.dong || []).map(r => {
  const o = r.map((v, i) => (i === iGia ? null : v));
  const [tang, thoi, , vaiDan, camKet, tran] = o;
  const ma = 'T' + (String(tang).match(/(\d)/) || [])[1];
  return '  { tang: ' + q(ma) + ',\n' +
    goi(4,
      truong('thoiLuong', thoi),
      truong('vaiDan', vaiDan),
      truong('camKetGiaoHang', camKet),
      truong('tranCongSuat', tran, false)) + ' }';
}).join(',\n');

/* ── đường tụt cấp ── */
const tut = (d.tutcap.dong || []).map(r => {
  const [muc, dau, lam, khong] = r;
  return '  { muc: ' + q(muc) + ',\n' +
    goi(4, truong('dauHieu', dau), truong('hanhDong', lam),
        truong('tuyetDoiKhong', khong, false)) + ' }';
}).join(',\n');

/* ── bàn giao giữa vai ── */
const banGiao = (d.bangiao.dong || []).map(r => {
  const [chang, hoSo, truocKhi, han] = r;
  return '  { chang: ' + q(chang) + ',\n' +
    goi(4, truong('hoSoKemTheo', hoSo), truong('viecTruocKhiLienHe', truocKhi),
        truong('hanGio', han, false)) + ' }';
}).join(',\n');

const DAU = `/* ═══════════════════════════════════════════════════════════════
   GITA 365 — BỘ BẢN VẼ 13 TỜ A0, PHẦN MÁY ĐỌC ĐƯỢC

   TỆP NÀY DO MÁY SINH. Đừng sửa tay — sửa thì lần dựng sau nuốt mất.
       python3 tools/doc-ban-ve.py <pdf>   → tools/ban-ve.json
       node    tools/dung-ban-ve.js        → tệp này

   Luật của tệp và những chỗ lệch với kho nằm ở data.ban-ve-luat.js,
   viết tay, không bị dựng lại đè lên.

   ═══ VÌ SAO BỘ BẢN VẼ NÀY KHÁC MỌI TÀI LIỆU TRƯỚC ═══

   Chín tài liệu trước là NỘI DUNG: kịch bản, câu nói, tình huống. Bộ
   này là ĐẶC TẢ HỆ THỐNG. Nó không dạy nói gì với một nhà — nó khai
   hệ có bao nhiêu ô, ô nào ghi nhận bằng gì, ai ký tên, quá bao lâu
   thì tính là chưa xử lý.

   Câu quan trọng nhất của cả bộ nằm ở tờ T11: "Mỗi ô trong ma trận
   50 cấp độ là một tag — toàn bộ tự động hoá đều treo vào tag đó."

   Kho này CHƯA CÓ ma trận ấy. Có năm tầng, có cổng nghiệm thu, có
   nhịp — nhưng không có 50 ô, không có tag, nên không có chỗ để treo
   tự động hoá. Đó là lý do tệp này đáng dựng.

   ═══ LUẬT LỚN NHẤT CỦA MA TRẬN ═══

       Không có bằng chứng thì không ghi nhận cấp.

   Ghi theo lịch là cách một hệ tự nói dối với chính nó: bảng thì lên
   cấp đều, nhà thì đứng yên. Mỗi ô đều mang trường bangChung, và
   bvGhiNhanDuoc() từ chối khi trường ấy chưa có gì đối chiếu.

   Tài sản có bản quyền của Học viện GITA.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;
`;

const ra = DAU +
  '\n/* Năm tầng: thời lượng, vai dẫn, cam kết giao hàng, trần công suất.\n' +
  '   KHÔNG có cột giá — giá sống ở HP_TANG. Xem BV_LECH mã BL-2. */\n' +
  'G.BV_TANG = [\n' + cauHinh + '\n];\n' +
  '\n/* Năm mươi ô. Mỗi ô một tag. Mỗi tag một bằng chứng. */\n' +
  'G.BV_CAPDO = [' + capDo + '];\n' +
  '\n/* Bốn cổng chuyển tầng của bộ bản vẽ. Mã BVC* để không đụng\n' +
  '   G.CHUYENDOI vốn đã dùng C0–C7 với nghĩa khác. Xem BL-1. */\n' +
  'G.BV_CONG = [\n' + cong + '\n];\n' +
  '\n/* Bốn mức hụt và đường xuống — bắt buộc có ở cả 50 ô. */\n' +
  'G.BV_TUTCAP = [\n' + tut + '\n];\n' +
  '\n/* Cỗ máy mười nhịp chạy bên trong mọi ô. */\n' +
  'G.BV_NHIP = [\n' + nhip + '\n];\n' +
  '\n/* Hai mươi tín hiệu đỏ. Quá hạn giờ thì KHÔNG tính là đã xử lý. */\n' +
  'G.BV_DO = [\n' + tinDo + '\n];\n' +
  '\n/* Trigger tự động của máy, gắn vào tag cấp độ. */\n' +
  'G.BV_TRIGGER = [\n' + trig + '\n];\n' +
  '\n/* Tám module của Web App. Chỗ nào kho đã có màn thì nối ở BV_MODULE_NOI. */\n' +
  'G.BV_MODULE = [\n' + mod + '\n];\n' +
  '\n/* Tám bảng dữ liệu lõi. */\n' +
  'G.BV_BANG = [\n' + bang + '\n];\n' +
  '\n/* Mười vai của bộ bản vẽ. Hệ đang chạy mười lăm vai — xem BL-4. */\n' +
  'G.BV_VAI = [\n' + vai + '\n];\n' +
  '\n/* Bàn giao giữa các vai. Bàn giao không biên bản là chưa bàn giao. */\n' +
  'G.BV_BANGIAO = [\n' + banGiao + '\n];\n';

const DICH = path.join(GOC, 'kho-goc', 'data.ban-ve.js');
fs.writeFileSync(DICH, ra);

/* Soi ngay tệp vừa sinh: cú pháp chạy được, và đủ 50 ô. */
try { new Function(ra.replace(/^'use strict';/m, '').replace(/window\.G/g, 'globalThis.__g')); }
catch (e) { console.error('  ✗ Tệp sinh ra sai cú pháp: ' + e.message); process.exit(1); }

const so = (ra.match(/tang: "T\d", cap: /g) || []).length;
if (so !== 50) { console.error('  ✗ Sinh ra ' + so + ' ô cấp độ, phải 50.'); process.exit(1); }

console.log('  ✓ kho-goc/data.ban-ve.js — ' + Math.round(ra.length / 1024) + ' KB');
console.log('  ✓ 50 ô cấp độ · ' + (d.cong.dong || []).length + ' cổng · ' +
  (d.nhip.dong || []).length + ' nhịp · ' + (d.do.dong || []).length + ' tín hiệu đỏ · ' +
  (d.vai.dong || []).length + ' vai · ' + (d.module.dong || []).length + ' module');
console.log('  ✓ không có cột giá nào lọt vào — giá vẫn đọc từ HP_TANG');
