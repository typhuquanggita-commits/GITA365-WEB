/* ═══════════════════════════════════════════════════════════════
   GITA 365 — ĐO PHẦN TỰ KIỂM CỦA TRỢ LÝ
   Chạy: xvfb-run -a node tools/do-tu-kiem.js

   Năm khoá của src/tro-ly-soat.js, chạy trên máy thật có kho thật.
   Quan trọng nhất là khoá thứ hai: MỘT LƯỢT SOÁT KHÔNG ĐƯỢC SỬA GÌ.
   Người dùng hỏi một câu thì trạng thái máy họ phải y nguyên.
   ═══════════════════════════════════════════════════════════════ */
const { chromium } = require(process.env.PW_PATH || '/opt/node22/lib/node_modules/playwright');
const fs = require('fs');
const doiKhoXong = require('./doi-kho-xong');
(async () => {
  const khoa = JSON.parse(fs.readFileSync('/home/user/Quang-GITA/kho/khoa.json', 'utf8')).khoa;
  const b = await chromium.launch();
  const p = await b.newPage();
  await p.addInitScript(x => { window.GITA_KHOA = x; }, khoa);
  await p.goto('http://127.0.0.1:8099/index.html');
  await p.waitForFunction(() => window.G && window.G.doLogin, null, { timeout: 30000 });
  await p.evaluate(() => G.doLogin('coach@gita365.vn'));
  await p.waitForFunction(() => window.G.tlSoanSoat, null, { timeout: 40000 });
  console.log('  (kho đã mở ' + (await doiKhoXong(p)) + ' gói)');

  const r = await p.evaluate(() => ({
    khen: G.tsoSoiKhongKhen(), sua: G.tsoSoiKhongSua(),
    khach: G.tsoSoiKhachKhongChay(), ruot: G.tsoSoiKhongLoRuot(),
    ds: G.tsoSoiDanhSachThat(),
    /* Câu hỏi thường KHÔNG được rơi vào nhánh tự kiểm */
    thuong: (function () { var d = G.aiTraLoi('Phác đồ cho trẻ mất tập trung');
      return d.soan ? d.soan.y : '(không soạn)'; })()
  }));

  const TEN = { khen: 'không nói "đạt"', sua: 'một lượt soát không sửa gì',
    khach: 'khách không chạy được', ruot: 'không lộ ruột bản ghi',
    ds: 'danh sách khai an toàn có thật' };
  let loi = 0;
  Object.keys(TEN).forEach(k => {
    const x = r[k];
    if (x.loi.length) loi++;
    console.log((x.loi.length ? '  ✗ ' : '  ✓ ') + TEN[k] +
      (x.loi.length ? '\n      ' + x.loi.join('\n      ') : ''));
  });
  if (r.thuong === 'SOAT' || r.thuong === 'SOAT_CAM') {
    loi++;
    console.log('  ✗ câu hỏi thường rơi nhầm vào nhánh tự kiểm');
  } else {
    console.log('  ✓ câu hỏi thường vẫn đi đường tra kho — ' + r.thuong);
  }
  console.log('\n  ' + r.sua.daChay + '/' + r.sua.khai + ' phép chạy tại chỗ · toàn hệ ' +
    r.sua.tongCo + ' phép soát');
  if (loi) { console.log('✗ CÒN ' + loi + ' ĐIỂM CHƯA ĐẠT'); await b.close(); process.exit(1); }
  console.log('✓ TOÀN BỘ ĐẠT — phần tự kiểm của trợ lý chạy đúng');
  await b.close();
})();
