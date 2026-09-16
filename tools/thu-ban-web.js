/* ═══════════════════════════════════════════════════════════════
   GITA 365 — THỬ BẢN WEB DO MÁY CHỦ PHỤC VỤ

       node tools/thu-ban-web.js

   Apps Script phục vụ bản web theo một đường khác hẳn bản tĩnh: vỏ ứng
   dụng là một tệp HTML đọc từ Drive, địa chỉ máy chủ được tiêm vào lúc
   trả trang, và bảy gói kho không nằm cạnh trang mà xin qua chính máy
   chủ, nhận về dạng base64.

   Ba chỗ ấy đều có thể hỏng mà không ai biết cho tới khi mở trang thật.
   Tệp này dựng một máy chủ giả bắt chước đúng cách GITA_BanWeb.gs làm,
   rồi mở bản web bằng trình duyệt thật và đếm xem kho có mở đủ không.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const PW = process.env.PW_PATH || '/opt/node22/lib/node_modules/playwright';
const { chromium } = require(PW);

const GOC = path.join(__dirname, '..');
/* Số gói đọc từ chính bộ khoá — kho có 7 gói tới bản 9.46 và 8 từ 9.47.
   Gõ con số ở đây là dựng bản thứ hai của một thứ đã có thật một chỗ. */
const KHOA_GOI = (() => {
  try { return JSON.parse(
    fs.readFileSync(path.join(GOC, 'kho', 'khoa.json'), 'utf8')).khoa; }
  catch (e) { return {}; }
})();
const SO_GOI_TBW = Object.keys(KHOA_GOI).length;
const CONG = 8123;
const BASE = 'http://127.0.0.1:' + CONG + '/';
/* DANH SÁCH GÓI CŨNG ĐỌC TỪ BỘ KHOÁ, KHÔNG GÕ TAY.
   SO_GOI_TBW ở trên đã đọc từ khoa.json từ 9.47 — nhưng danh sách gói
   mà máy chủ giả này PHỤC VỤ thì vẫn gõ tay bảy tên, nên nó không bao
   giờ trả về gói thứ tám và phép đo ngay dưới luôn thiếu một. Hai chỗ
   nói về cùng một thứ mà một chỗ đọc, một chỗ gõ: chỗ gõ sẽ cũ.

   Đây là lần thứ BA cùng một lớp lỗi lộ ra trong bản 9.73 — danh sách
   tệp máy chủ trong thu-may-chu.js, con số bảy gói của Coach, và chỗ
   này. Cả ba đều là một danh sách gõ tay về một thứ đã có sẵn nguồn. */
const GOI = Object.keys(KHOA_GOI);

const VO = path.join(GOC, 'GITA365.html');
if (!fs.existsSync(VO)) {
  console.error('  ✗ Chưa có GITA365.html. Chạy: python3 tools/dong-goi.py');
  process.exit(1);
}
let KHOA = null;
try { KHOA = JSON.parse(fs.readFileSync(path.join(GOC, 'kho', 'khoa.json'), 'utf8')).khoa; }
catch (e) {
  console.log('  ⚠ Không có kho/khoa.json — bỏ qua phép thử này.');
  process.exit(0);
}

/* Máy chủ giả: làm đúng ba việc mà GITA_BanWeb.gs làm. */
const may = http.createServer((req, res) => {
  const u = new URL(req.url, BASE);
  const json = o => {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(o));
  };

  if (req.method === 'POST') {
    let b = '';
    req.on('data', d => { b += d; });
    req.on('end', () => {
      const y = JSON.parse(b || '{}');
      if (y.fn === 'capKhoa')
        return json({ ok: true, khoa: KHOA, phamVi: GOI,
          hetHan: new Date(Date.now() + 12 * 3600e3).toISOString() });
      json({ ok: false, error: 'không hỗ trợ trong bản thử' });
    });
    return;
  }

  const goi = u.searchParams.get('goi');
  if (goi === 'mau') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(fs.readFileSync(path.join(GOC, 'kho', 'mau.json')));
  }
  if (goi) {
    if (GOI.indexOf(goi) < 0) return json({ ok: false, error: 'Không có gói tên này.' });
    return json({ ok: true, goi: goi,
      du: fs.readFileSync(path.join(GOC, 'kho', goi + '.enc')).toString('base64') });
  }

  /* Tiêm địa chỉ y hệt gitaTrangWeb_ trong GITA_BanWeb.gs */
  let html = fs.readFileSync(VO, 'utf8');
  const tiem = '<script>window.G=window.G||{};' +
    'window.G.API_CAP_PHEP=' + JSON.stringify(BASE) + ';' +
    'window.GITA_NGUON_KHO=' + JSON.stringify(BASE + '?goi=') + ';</script>';
  const i = html.toLowerCase().indexOf('<head>');
  html = i >= 0 ? html.slice(0, i + 6) + tiem + html.slice(i + 6) : tiem + html;
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(html);
});

let loi = 0;
const bao = (ok, ten, ct) => {
  if (!ok) loi++;
  console.log((ok ? '  ✓ ' : '  ✗ ') + ten + (ct ? ' — ' + ct : ''));
};

may.listen(CONG, async () => {
  const b = await chromium.launch();
  const p = await b.newPage();
  const loiTrang = [];
  p.on('pageerror', e => loiTrang.push(e.message));

  await p.goto(BASE, { waitUntil: 'networkidle' });
  await p.waitForFunction(() => window.G && window.G.VIEWS, null, { timeout: 20000 });

  const dau = await p.evaluate(() => ({
    api: window.G.API_CAP_PHEP, nguon: window.GITA_NGUON_KHO
  }));
  bao(!!dau.api, 'địa chỉ máy chủ được tiêm vào trang, không bị cau-hinh.js xoá mất', dau.api);
  bao(!!dau.nguon, 'trang biết lấy kho qua máy chủ');

  await p.evaluate(() => window.G.doLogin('superadmin@gita365.vn'));
  await p.waitForTimeout(9000);

  const r = await p.evaluate(() => ({
    cheDoMau: window.G.KHO.cheDoMau,
    daNap: window.G.KHO.daNap.slice(),
    kichBan: (window.G.KICHBAN || []).length,
    phacDo: (window.G.PHACDO || []).length,
    moThuc: (window.G.MOTHUC || []).length,
    tinhHuong: (window.G.TINHHUONG || []).length,
    drive: (window.G.TAILIEU_DRIVE || []).length,
    man: Object.keys(window.G.VIEWS).length
  }));

  bao(!r.cheDoMau, 'KHÔNG rơi về chế độ mẫu — kho thật đã mở');
  bao(r.daNap.length === SO_GOI_TBW, 'mở đủ ' + SO_GOI_TBW + ' gói kho qua đường máy chủ',
    r.daNap.join(', '));
  bao(r.kichBan >= 1000, 'kịch bản về đủ', r.kichBan.toLocaleString('vi-VN'));
  bao(r.phacDo >= 220 && r.moThuc >= 42, 'phác đồ và mô thức về đủ', r.phacDo + ' · ' + r.moThuc);
  bao(r.tinhHuong >= 250, 'tình huống về đủ', r.tinhHuong);
  bao(r.drive >= 10, 'tài liệu Drive về đủ', r.drive);
  bao(r.man >= 100, 'dựng đủ màn hình', r.man);
  bao(!loiTrang.length, 'không lỗi nào khi chạy', loiTrang.slice(0, 2).join(' | ') || 'sạch');

  /* Tên gói bịa đặt không được đọc trộm tệp khác trong Drive */
  const bia = await p.evaluate(n =>
    fetch(n + '../../bimat').then(r2 => r2.json()).then(d => d.ok).catch(() => 'loi'),
    dau.nguon);
  bao(bia === false || bia === 'loi', 'tên gói bịa đặt bị từ chối, không đọc được tệp khác');

  console.log('\n' + (loi ? '✗ CÒN ' + loi + ' ĐIỂM CHƯA ĐẠT' : '✓ TOÀN BỘ ĐẠT — bản web do máy chủ phục vụ chạy đúng'));
  await b.close();
  may.close();
  process.exit(loi ? 1 : 0);
});
