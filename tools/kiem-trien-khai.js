#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════
   GITA 365 — KIỂM SAU KHI TRIỂN KHAI

       node tools/kiem-trien-khai.js <URL-may-chu-cap-phep> [URL-ban-web]

   Ví dụ:
       node tools/kiem-trien-khai.js \
         https://script.google.com/macros/s/AKfy…/exec \
         https://gita365.pages.dev

   Chạy từ ngoài vào, đúng như một người lạ trên internet nhìn thấy.
   Kiểm ba việc:
     A. Máy chủ cấp phép sống, đã nạp khoá, và KHÔNG cấp khoá cho
        yêu cầu không có phiên hợp lệ
     B. Bản web lên đúng, có đủ tiêu đề bảo mật, cài được như ứng dụng
     C. Không đường dẫn nào để lọt tài sản ra ngoài

   Thay cho bảng bảy dòng phải tự soi bằng mắt.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
const { execFileSync } = require('child_process');

const EXEC = process.argv[2];
const WEB = (process.argv[3] || '').replace(/\/+$/, '');

if (!EXEC) {
  console.error('Thiếu URL máy chủ cấp phép.\n' +
    '  node tools/kiem-trien-khai.js <URL-.../exec> [URL-ban-web]');
  process.exit(1);
}


/* Số gói đọc từ chính bộ khoá — kho có 7 gói tới bản 9.46 và 8 từ 9.47.
   Gõ con số ở đây là dựng bản thứ hai của một thứ đã có thật một chỗ. */
const SO_GOI_KT = (() => {
  try {
    return Object.keys(JSON.parse(require('fs').readFileSync(
      require('path').join(__dirname, '..', 'kho', 'khoa.json'), 'utf8')).khoa).length;
  } catch (e) { return 0; }
})();

let loi = 0, canhBao = 0;
function bao(ok, ten, ct) {
  if (!ok) loi++;
  console.log((ok ? '  ✓ ' : '  ✗ ') + ten + (ct ? ' — ' + ct : ''));
}
function nhac(ten, ct) { canhBao++; console.log('  ! ' + ten + (ct ? ' — ' + ct : '')); }

function goi(url, opt) {
  opt = opt || {};
  const dv = ['-sS', '-L', '--max-time', '25', '-w', '\n@@MA:%{http_code}'];
  /* Địa chỉ nội bộ không đi qua proxy — nếu không thì diễn tập tại máy sẽ treo */
  if (/^https?:\/\/(127\.0\.0\.1|localhost|\[::1\])/.test(url)) dv.push('--noproxy', '*');
  if (opt.body) dv.push('-X', 'POST', '-H', 'Content-Type: text/plain;charset=utf-8', '--data-binary', opt.body);
  if (opt.dau) dv.push('-D', '-', '-o', '/dev/null');
  dv.push(url);
  try {
    const ra = execFileSync('curl', dv, { encoding: 'utf8', maxBuffer: 8e6 });
    const i = ra.lastIndexOf('@@MA:');
    return { ma: Number(ra.slice(i + 5).trim()), than: ra.slice(0, i) };
  } catch (e) {
    return { ma: 0, than: String((e && e.stderr) || e), hong: true };
  }
}

console.log('\nKIỂM SAU KHI TRIỂN KHAI\n');
console.log('  Máy chủ cấp phép : ' + EXEC);
console.log('  Bản web          : ' + (WEB || '(chưa nhập — bỏ qua phần B và C)'));

/* ═══ A. MÁY CHỦ CẤP PHÉP ═══ */
console.log('\nA · MÁY CHỦ CẤP PHÉP');
{
  const r = goi(EXEC);
  let d = null;
  try { d = JSON.parse(r.than); } catch (e) { d = null; }
  bao(r.ma === 200, 'máy chủ trả lời', 'HTTP ' + r.ma);
  bao(!!(d && d.ok), 'trả về đúng dạng JSON của GITA', d ? (d.ten || '') : r.than.slice(0, 120));
  if (d) {
    bao(d.daNapKhoa === SO_GOI_KT, 'đã nạp đủ ' + SO_GOI_KT + ' gói khoá',
      d.daNapKhoa === 0 ? 'CHƯA nạp khoá — làm bước Script Properties' : d.daNapKhoa + ' gói');
    bao(d.khoa === undefined && !/[A-Za-z0-9+/]{40,}=/.test(r.than),
      'điểm kiểm sống không lộ khoá nào');
  }
}
{
  const r = goi(EXEC, { body: JSON.stringify({ fn: 'capKhoa', u: 'ai-do@vidu.com', token: 'token-bia', goi: ['nen','nghe','tang1','tang2','tang3','tang4','tang5'] }) });
  let d = null;
  try { d = JSON.parse(r.than); } catch (e) { d = null; }
  bao(!!(d && d.ok === false), 'token bịa KHÔNG được cấp khoá', d ? (d.code || d.error || '') : r.than.slice(0, 120));
  bao(!!d && !/[A-Za-z0-9+/]{40,}=/.test(r.than), 'phản hồi từ chối không chứa khoá nào',
    d ? '' : 'không có phản hồi để kiểm');
}
{
  const r = goi(EXEC, { body: JSON.stringify({ fn: 'khongCoThat' }) });
  let d = null;
  try { d = JSON.parse(r.than); } catch (e) { d = null; }
  bao(!!(d && d.ok === false), 'yêu cầu lạ bị từ chối gọn, không đổ lỗi hệ thống ra ngoài');
}

if (!WEB) {
  console.log('\n' + (loi ? '✗ CÒN ' + loi + ' ĐIỂM CHƯA ĐẠT' : '✓ PHẦN MÁY CHỦ ĐẠT'));
  console.log('  Thêm URL bản web vào lệnh để kiểm nốt phần B và C.\n');
  process.exit(loi ? 1 : 0);
}

/* ═══ B. BẢN WEB ═══ */
console.log('\nB · BẢN WEB');
{
  const r = goi(WEB + '/index.html');
  bao(r.ma === 200, 'trang chính lên được', 'HTTP ' + r.ma);
  bao(/GITA 365/.test(r.than), 'đúng là trang GITA 365');
  bao(/cau-hinh\.js/.test(r.than), 'có nạp tệp cấu hình máy chủ cấp phép');
  bao(r.ma === 200 && !/GITA_KHOA|khoa\.json/.test(r.than), 'trang chính không nhắc tới bộ khoá',
    r.ma === 200 ? '' : 'không tải được trang để kiểm');
}
{
  const r = goi(WEB + '/cau-hinh.js');
  bao(r.ma === 200, 'tệp cấu hình phục vụ được', 'HTTP ' + r.ma);
  const m = r.than.match(/G\.API_CAP_PHEP\s*=\s*'([^']*)'/);
  const dat = m && m[1];
  bao(!!dat, 'đã điền địa chỉ máy chủ cấp phép', dat ? dat.slice(0, 60) + '…' : 'CÒN TRỐNG — bản web sẽ chạy chế độ mẫu');
  if (dat && dat.replace(/\/+$/, '') !== EXEC.replace(/\/+$/, ''))
    nhac('địa chỉ trong cau-hinh.js khác URL đang kiểm', dat);
}
{
  const r = goi(WEB + '/index.html', { dau: 1 });
  const h = r.than.toLowerCase();
  const CAN = [
    ['x-frame-options', 'chống nhúng vào khung người khác'],
    ['x-content-type-options', 'không cho đoán kiểu tệp'],
    ['referrer-policy', 'không rò địa chỉ trang khi bấm ra ngoài'],
    ['permissions-policy', 'chỉ mở đúng quyền micro'],
    ['strict-transport-security', 'ép HTTPS']
  ];
  CAN.forEach(function (c) { bao(h.indexOf(c[0]) >= 0, 'tiêu đề ' + c[0], c[1]); });
  bao(/^https:/i.test(WEB), 'chạy trên HTTPS', 'không có HTTPS thì không cài được như ứng dụng');
}
{
  const r = goi(WEB + '/manifest.webmanifest');
  bao(r.ma === 200 && /standalone/.test(r.than), 'cài được vào máy như ứng dụng thật', 'HTTP ' + r.ma);
  const s = goi(WEB + '/sw.js');
  bao(s.ma === 200, 'chạy được khi mất mạng', 'HTTP ' + s.ma);
}

/* ═══ C. TÀI SẢN KHÔNG LỌT RA NGOÀI ═══ */
console.log('\nC · TÀI SẢN KHÔNG LỌT RA NGOÀI');
{
  const r = goi(WEB + '/kho/khoa.json');
  bao(r.ma === 404 || r.ma === 403, 'bộ khoá KHÔNG tải được từ bản web', 'HTTP ' + r.ma);
}
['kho-goc/data.scripts.js', 'giay-phep/GITA_KHOA_KHO.txt', 'tools/ma-hoa-kho.js', 'server/GITA_CapPhep.gs']
  .forEach(function (d) {
    const r = goi(WEB + '/' + d);
    bao(r.ma === 404 || r.ma === 403, d.split('/')[0] + '/ không phục vụ ra ngoài', d + ' → HTTP ' + r.ma);
  });
{
  const r = goi(WEB + '/kho/nghe.enc');
  bao(r.ma === 200, 'gói kho phục vụ được cho người đã đăng nhập', 'HTTP ' + r.ma);
  const mau = r.than.slice(28, 400);
  bao(r.ma === 200 && mau.length > 100 && !/(phác đồ|kịch bản|GITA|"ma"|"ten")/i.test(mau),
    'gói kho tải về KHÔNG đọc được nếu không có khoá',
    r.ma === 200 ? '' : 'không tải được gói để kiểm');
}
{
  const r = goi(WEB + '/robots.txt');
  bao(r.ma === 200 && /GPTBot/i.test(r.than), 'chặn trình thu thập dữ liệu AI', 'HTTP ' + r.ma);
}

console.log('\n' + '═'.repeat(56));
if (loi) console.log('  ✗ CÒN ' + loi + ' ĐIỂM CHƯA ĐẠT' + (canhBao ? ' · ' + canhBao + ' điểm cần xem lại' : ''));
else console.log('  ✓ TOÀN BỘ ĐẠT' + (canhBao ? ' · ' + canhBao + ' điểm cần xem lại' : '') + ' — bản web chạy đúng chuẩn');
console.log('═'.repeat(56) + '\n');
process.exit(loi ? 1 : 0);
