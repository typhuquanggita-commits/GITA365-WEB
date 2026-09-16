/* ═══════════════════════════════════════════════════════════════
   GITA 365 — ĐO HỘI THOẠI NHIỀU LƯỢT
   Chạy: xvfb-run -a node tools/do-noi-tiep.js

   HAI BỘ ĐO CŨ ĐỀU ĐO MỘT LƯỢT

   do-tro-ly.js hỏi một câu, xem tra ra đúng kho không.
   do-soan.js  hỏi một câu, xem soạn ra đúng câu trả lời không.

   Cả hai đều không thấy được lớp lỗi mà bộ nhớ ngữ cảnh mở ra: lượt
   thứ hai nói về lượt thứ nhất. "Còn cái nào nữa" một mình thì vô
   nghĩa — nó chỉ có nghĩa khi đứng sau một câu khác.

   Nên bộ này chạy CẢ CHUỖI: gõ từng lượt vào đúng khung trò chuyện
   thật, rồi soi kết quả lượt cuối.

   BA THỨ ĐƯỢC KHAI CHO MỖI CHUỖI
     luot  — các câu gõ lần lượt
     y     — ý mà lượt CUỐI phải ra
     phai  — mẩu chữ phải có (hoặc '' nếu chỉ đo ý)
     cam   — mẩu chữ KHÔNG được có (dùng cho phép chống lặp)
   ═══════════════════════════════════════════════════════════════ */
const { chromium } = require(process.env.PW_PATH || '/opt/node22/lib/node_modules/playwright');
const fs = require('fs');
const doiKhoXong = require('./doi-kho-xong');

const CHUOI = [
  /* Kho 18 mục — trên mức DU_HIEN nên lượt đầu cắt ở 12 và "còn nữa"
     có việc để làm. Kho 16 mục hiện đủ ngay lượt đầu, đúng như thiết
     kế, nên nó không đo được nhánh này. */
  { ten: 'liệt kê rồi xin thêm',
    luot: ['Mười tám virus của hành lang', 'còn cái nào nữa'],
    y: 'CON_NUA', phai: '' },

  { ten: 'xin thêm hai lần liền, không lặp',
    luot: ['Mười tám virus của hành lang', 'còn nữa', 'còn nữa'],
    y: 'HET', phai: 'hết' },

  { ten: 'mở đúng mục thứ ba',
    luot: ['Bộ hồ sơ gồm những hợp đồng nào', 'cái thứ ba'],
    y: 'MA', phai: 'HĐ-03' },

  { ten: 'mở mục cuối',
    luot: ['Mười hai luật hành lang thành công', 'cái cuối'],
    y: 'MA', phai: 'L12' },

  { ten: 'gọn lại thì bớt dòng, không viết lại chữ',
    luot: ['Bảy cửa trước khi ký kết là gì', 'ngắn hơn'],
    y: 'GONLAI', phai: 'Việc này thuộc luồng nào' },

  { ten: 'câu dài sau đó là câu hỏi MỚI, không phải nói tiếp',
    luot: ['Bộ hồ sơ gồm những hợp đồng nào',
           'Chuẩn bằng chứng có mấy tính chất'],
    y: 'DEM', phai: '6' },

  { ten: 'lượt hai chạm dấu hiệu khẩn thì DỪNG, dù rất ngắn',
    luot: ['Nhà mình dừng giữa chừng thì hoàn tiền bao nhiêu',
           'con nói muốn chết'],
    y: 'KHAN', phai: '' },

  { ten: 'nối tiếp một ca cấp cao giữ NGUYÊN cấp, không hạ mà cũng không leo',
    luot: ['Nhà mình dừng giữa chừng thì hoàn tiền bao nhiêu', 'còn nữa'],
    y: 'CHO_BAT', phai: '', cap: 6 },
];

function boDau(s) {
  return String(s == null ? '' : s).toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd');
}

(async () => {
  const khoa = JSON.parse(fs.readFileSync('/home/user/Quang-GITA/kho/khoa.json', 'utf8')).khoa;
  const b = await chromium.launch();
  const p = await b.newPage();
  await p.addInitScript(x => { window.GITA_KHOA = x; }, khoa);
  await p.goto('http://127.0.0.1:8099/index.html');
  await p.waitForFunction(() => window.G && window.G.doLogin, null, { timeout: 30000 });
  await p.evaluate(() => G.doLogin('coach@gita365.vn'));
  await p.waitForFunction(() => window.G.tlDocNoiTiep, null, { timeout: 40000 });
  console.log('  (kho đã mở ' + (await doiKhoXong(p)) + ' gói)');

  const r = await p.evaluate((CHUOI) => CHUOI.map(function (c) {
    G.tlQuenNgu();
    var d = null;
    c.luot.forEach(function (q) { d = G.aiTraLoi(q); });
    if (!d) return { ten: c.ten, y: '(không trả lời)', het: '' };
    /* Ba trạng thái đứng NGOÀI bản soạn, và mỗi cái nói một chuyện
       khác — gộp chúng vào ý của bản soạn là mất đúng phần cần đo. */
    if (d.khan) return { ten: c.ten, y: 'KHAN', het: String(d.loi || '') };
    if (d.doKho && d.doKho.lam === false)
      return { ten: c.ten, y: 'CHO_BAT', cap: d.doKho.cap,
        het: String(d.doKho.loi || '') + ' ' + String(d.doKho.deXuat || '') };
    if (!d.soan) return { ten: c.ten, y: '(không soạn được)', het: '' };
    var het = d.soan.cau + ' ' + (d.soan.dong || []).map(function (x) {
      return x.nhan + ' ' + x.chu;
    }).join(' ');
    return { ten: c.ten, y: d.soan.y, kho: d.soan.kho, het: het,
      cau: String(d.soan.cau).slice(0, 70), soDong: (d.soan.dong || []).length };
  }), CHUOI);

  let dat = 0;
  r.forEach((x, i) => {
    const c = CHUOI[i];
    const dY = x.y === c.y;
    const dC = !c.phai || (x.het && boDau(x.het).indexOf(boDau(c.phai)) >= 0);
    /* Cấp phải ĐÚNG BẰNG, không phải "từ 4 trở lên": hạ cấp là máy tự
       trả lời một ca chờ người; leo cấp là dội Admin và Super Admin
       vào một ca thường. Hai hướng đều hỏng. */
    const dCap = !c.cap || x.cap === c.cap;
    if (dY && dC && dCap) dat++;
    console.log((dY && dC && dCap ? ' ✓ ' : ' ✗ ') + c.ten);
    console.log('     ' + c.luot.map(q => '"' + q + '"').join(' → '));
    console.log('     ý ' + x.y + (dY ? '' : ' (cần ' + c.y + ')') +
      (dC ? '' : ' · THIẾU "' + c.phai + '"') +
      (x.cap ? ' · cấp ' + x.cap + (dCap ? '' : ' (cần ' + c.cap + ')') : '') +
      (x.kho ? ' · ' + x.kho : ''));
    if (x.cau) console.log('     → ' + x.cau);
  });

  console.log('\nĐẠT ' + dat + '/' + r.length + ' = ' + Math.round(dat / r.length * 100) + '%');
  const MOC = 8;
  if (dat < MOC) {
    console.log('✗ TỤT so với mốc ' + MOC + '/' + r.length + ' — bộ nhớ ngữ cảnh vừa hỏng');
    await b.close(); process.exit(1);
  }
  console.log('✓ Không tụt so với mốc ' + MOC + '/' + r.length);
  await b.close();
})();
