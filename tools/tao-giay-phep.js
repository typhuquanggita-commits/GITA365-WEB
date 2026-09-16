/* ═══════════════════════════════════════════════════════════════
   GITA 365 — TẠO GIẤY PHÉP CHO MỘT MÁY

       node tools/tao-giay-phep.js "Tên người dùng" [số tháng] [gói…]

   Ví dụ:
     node tools/tao-giay-phep.js "Trương Nhật Quang" 24
     node tools/tao-giay-phep.js "Coach Minh" 12 nen nghe tang1 tang2
     node tools/tao-giay-phep.js "Cô Lan" 12 --tuyen MATH365

   Ra: giay-phep/giay-phep-<tên>.json

   Đưa tệp này cho đúng người, họ mở ứng dụng máy tính rồi vào
   menu Trợ giúp → Nạp giấy phép. Khoá chỉ nằm trong bộ nhớ phiên
   làm việc, không ghi ra đĩa.

   ⚠ Tệp giấy phép mang khoá thật. Không đưa lên kho mã, không gửi
   qua kênh công khai, không dùng chung một tệp cho nhiều người —
   mỗi bản cấp cho một người là một dấu vết truy nguồn.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const GOC = path.join(__dirname, '..');
const KHOA = path.join(GOC, 'kho', 'khoa.json');
const RA = path.join(GOC, 'giay-phep');

/* Danh sách gói KHÔNG gõ tay ở đây nữa. Đọc thẳng từ src/data.tuyen.js —
   cùng một tệp mà ứng dụng dùng — nên thêm một tuyến là công cụ này biết
   ngay, không phải nhớ sửa. Trước v7.8 danh sách bảy gói nằm ở ba chỗ
   khác nhau, và quên một chỗ thì máy chủ cấp khoá cho gói mà giấy phép
   không có, hoặc ngược lại. */
global.window = global.window || {};
require(path.join(GOC, 'src', 'data.tuyen.js'));
const G = global.window.G;
const TAT_CA = G.moiGoi();          /* mọi tên gói hợp lệ — để bắt tên gõ sai */

/* Không gõ gói nào thì cấp phần MẶC ĐỊNH: gói nền cộng toàn bộ gói của
   những tuyến ĐANG CHẠY. Hôm nay chỉ GITA365 chạy, nên mặc định vẫn
   đúng bảy gói như trước v7.8 — cấp giấy phép không đổi thói quen.
   Tuyến đang dựng chuẩn chưa có nội dung, cấp khống là cấp một cái tên
   rỗng. */
const MAC_DINH = ['nen'].concat(
  G.TUYEN.filter(t => t.trangThai === 'chay')
    .reduce((a, t) => a.concat(G.goiCuaTuyen(t.ma)), []));

/* Cấp theo TUYẾN cho gọn: --tuyen MATH365 nghĩa là cả gói nghề và năm
   gói tầng của tuyến ấy. Vẫn gõ tên gói lẻ được như cũ. */
function moRongTuyen(xin) {
  const ra = [];
  for (let i = 0; i < xin.length; i++) {
    if (xin[i] === '--tuyen' || xin[i] === '-t') {
      const mt = String(xin[++i] || '').toUpperCase();
      if (!G.tuyen(mt)) {
        console.error('Không có tuyến: ' + mt);
        console.error('Tuyến hợp lệ: ' + G.TUYEN.map(t => t.ma).join(' '));
        process.exit(1);
      }
      ra.push('nen', ...G.goiCuaTuyen(mt));
    } else ra.push(xin[i]);
  }
  return ra.filter((g, i) => ra.indexOf(g) === i);
}

if (!fs.existsSync(KHOA)) {
  console.error('Chưa có kho/khoa.json. Chạy trước: node tools/ma-hoa-kho.js');
  process.exit(1);
}
const bo = JSON.parse(fs.readFileSync(KHOA, 'utf8')).khoa;

const dv = process.argv.slice(2);

/* ─── Cấp hàng loạt từ một tệp CSV ───
   Mỗi dòng: tên,số tháng,gói gói gói
   Ví dụ:
     Coach Minh,12,nen nghe tang1 tang2
     Tư vấn Lan,12,nen nghe
     Phụ huynh Hà,6,nen tang1
   Dòng trống và dòng bắt đầu bằng # được bỏ qua. */
const DS = dv.indexOf('--danh-sach');
if (DS >= 0) {
  const tep = dv[DS + 1];
  if (!tep || !fs.existsSync(tep)) {
    console.error('Không thấy tệp danh sách: ' + tep);
    console.error('  node tools/tao-giay-phep.js --danh-sach doi-ngu.csv');
    process.exit(1);
  }
  const dong = fs.readFileSync(tep, 'utf8').split('\n')
    .map(d => d.trim()).filter(d => d && d[0] !== '#');
  let n = 0, hong = 0;
  console.log('  Cấp ' + dong.length + ' giấy phép từ ' + path.basename(tep) + '\n');
  dong.forEach(d => {
    const c = d.split(',').map(x => x.trim());
    if (!c[0]) return;
    const t = Number(c[1]) > 0 ? Number(c[1]) : 24;
    const xin = (c[2] || '').split(/\s+/).filter(x => x);
    const g = xin.filter(x => TAT_CA.indexOf(x) >= 0);
    const la = xin.filter(x => TAT_CA.indexOf(x) < 0);
    try {
      /* Gõ sai tên gói thì DỪNG dòng đó. Không bao giờ im lặng rơi về
         cấp toàn bộ — một lỗi gõ sẽ mở hết kho cho người không được phép. */
      if (la.length) throw new Error('tên gói không có thật: ' + la.join(' '));
      if (xin.length && !g.length) throw new Error('không gói nào hợp lệ');
      const r = capMot(c[0], t, g.length ? g : MAC_DINH);
      console.log('  ✓ ' + r.so + '  ' + c[0].padEnd(24) + r.phamVi.join(' '));
      n++;
    } catch (e) {
      console.log('  ✗ ' + c[0].padEnd(24) + e.message);
      hong++;
    }
  });
  console.log('\n  Đã cấp ' + n + ' giấy phép' + (hong ? ', ' + hong + ' dòng hỏng' : '') +
    ' vào ' + path.relative(GOC, RA) + '/');
  console.log('  ⚠ Mỗi tệp mang khoá thật và mang dấu truy nguồn riêng.');
  console.log('    Gửi đúng một tệp cho đúng một người. Đừng gửi chung một tệp cho cả nhóm.');
  process.exit(hong ? 1 : 0);
}

const nguoi = dv[0];
if (!nguoi) {
  console.error('Thiếu tên người được cấp.\n' +
    '  node tools/tao-giay-phep.js "Tên người dùng" [số tháng] [gói…]\n' +
    '  node tools/tao-giay-phep.js --danh-sach doi-ngu.csv');
  process.exit(1);
}
const thang = Number(dv[1]) > 0 ? Number(dv[1]) : 24;
const xinCLI = moRongTuyen(dv.slice(2).filter(g => g));
const laCLI = xinCLI.filter(g => TAT_CA.indexOf(g) < 0);
if (laCLI.length) {
  console.error('Tên gói không có thật: ' + laCLI.join(' '));
  console.error('Gói hợp lệ: ' + TAT_CA.join(' '));
  process.exit(1);
}
const goi = xinCLI.length ? xinCLI : MAC_DINH;


function capMot(nguoi, thang, goi) {
const thieu2 = goi.filter(g => !bo[g]);
if (thieu2.length) {
  /* Gói của tuyến đang dựng chuẩn thì chưa có khoá — nói rõ là chưa có
     nội dung, đừng để người cấp tưởng bộ khoá hỏng. */
  const chuaChay = thieu2.filter(g => {
    const d = G.doiGoi(g), t = d && d.tuyen && G.tuyen(d.tuyen);
    return t && t.trangThai !== 'chay';
  });
  if (chuaChay.length)
    throw new Error('Chưa cấp được: ' + chuaChay.join(', ') +
      ' — tuyến này còn đang dựng chuẩn, chưa có nội dung để mã hoá.');
  throw new Error('Bộ khoá thiếu gói: ' + thieu2.join(', '));
}
const hetHan = new Date();
hetHan.setMonth(hetHan.getMonth() + thang);

const gp = {
  chuY: 'GIẤY PHÉP SỬ DỤNG GITA 365 — cấp riêng cho một người, một máy. ' +
        'Sao chép, chia sẻ hoặc trích xuất nội dung ra ngoài phạm vi được cấp là vi phạm hợp đồng.',
  capCho: nguoi,
  soGiayPhep: 'GP-' + crypto.randomBytes(6).toString('hex').toUpperCase(),
  capLuc: new Date().toISOString(),
  hetHan: hetHan.toISOString(),
  phamVi: goi,
  khoa: Object.fromEntries(goi.map(g => [g, bo[g]]))
};
/* Dấu truy nguồn: biết bản rò rỉ là bản của ai mà không cần mở tệp. */
gp.dauTruyNguon = crypto.createHash('sha256')
  .update(gp.soGiayPhep + '|' + nguoi + '|' + gp.capLuc).digest('hex').slice(0, 32);

fs.mkdirSync(RA, { recursive: true });
const ten = 'giay-phep-' + nguoi.normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/đ/gi, 'd').replace(/[^A-Za-z0-9]+/g, '-').replace(/^-|-$/g, '').toLowerCase() + '.json';
const duong = path.join(RA, ten);
fs.writeFileSync(duong, JSON.stringify(gp, null, 2));
return { so: gp.soGiayPhep, tep: duong, phamVi: goi, hetHan: hetHan };
}

let kq;
try { kq = capMot(nguoi, thang, goi); }
catch (e) { console.error(e.message); process.exit(1); }
console.log('  Đã cấp: ' + kq.so);
console.log('  Cho   : ' + nguoi);
console.log('  Phạm vi: ' + goi.join(' '));
console.log('  Hết hạn: ' + kq.hetHan.toLocaleDateString('vi-VN'));
console.log('  Tệp   : ' + path.relative(GOC, kq.tep));
console.log('\n  Mở ứng dụng máy tính → Trợ giúp → Nạp giấy phép → chọn tệp này.');
console.log('  ⚠ giay-phep/ nằm trong .gitignore. Đừng đẩy tệp này lên kho mã.');
