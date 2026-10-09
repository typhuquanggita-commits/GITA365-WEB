/* ═══════════════════════════════════════════════════════════════
   GITA 365 — ĐO BẢN SOẠN CỦA TRỢ LÝ
   Chạy: xvfb-run -a node tools/do-soan.js

   ĐO CÂU TRẢ LỜI, KHÔNG ĐO KẾT QUẢ TRA

   tools/do-tro-ly.js đo một việc khác: có tra ra ĐÚNG KHO không.
   Tra đúng kho rồi vẫn có thể trả lời sai — đổ ra mười hai thẻ khi
   người ta hỏi một con số cũng là trả lời sai, chỉ là sai theo kiểu
   không ai gọi tên được.

   Nên bộ này khai với mỗi câu hai thứ:
     y     — ý câu hỏi đáng lẽ phải đọc ra
     phai  — một mẩu chữ BẮT BUỘC phải có trong bản soạn

   Mẩu chữ ấy lấy nguyên văn từ kho, nên nếu bộ soạn bịa ra một câu
   trôi chảy mà không đúng nguồn thì nó trượt.

   VÌ SAO KHÔNG ĐẶT ĐÍCH TUYỆT ĐỐI

   Cùng lý do với do-tro-ly.js: một bộ đo đạt điểm tuyệt đối thường
   là bộ đo đã viết vừa khít lời giải. Đích ở đây là KHÔNG TỤT.
   ═══════════════════════════════════════════════════════════════ */
const { chromium } = require(process.env.PW_PATH || '/opt/node22/lib/node_modules/playwright');
const fs = require('fs');
const doiKhoXong = require('./doi-kho-xong');

/* [câu hỏi, ý phải đọc ra, mẩu chữ phải có trong bản soạn] */
const HOI = [
  ['Có bao nhiêu hợp đồng trong bộ hồ sơ',        'DEM',     '16'],
  ['Bộ hồ sơ gồm những hợp đồng nào',             'LIETKE',  'Hợp đồng lao động'],
  ['Bảy cửa trước khi ký kết là gì',              'LIETKE',  'Việc này thuộc luồng nào'],
  ['Mười hai luật hành lang thành công',          'LIETKE',  'Việc nhỏ mỗi ngày'],
  ['Chín khoá bất biến của hành lang',            'LIETKE',  'khoá'],
  ['Mười tám virus của hành lang',                'LIETKE',  'Biến mất im lặng'],
  ['Điều khoản DK16 nói gì',                      'MA',      'tuyển người'],
  ['Điều khoản DK09 nói gì',                      'MA',      'DK09'],
  ['Trần hoa hồng của đại sứ là bao nhiêu',       'GIATRI',  '10%'],
  ['Trần thông báo mỗi ngày là bao nhiêu',        'GIATRI',  '3'],
  ['Có bao nhiêu tình huống trong kho',           'DEM',     '250'],
  ['Chuẩn bằng chứng có mấy tính chất',           'DEM',     '6'],
  ['Bốn nguyên tắc trả lương gồm những gì',       'LIETKE',  'lương'],
  ['Máy không được nhận những việc gì',           'LIETKE',  'Ký tên'],
  ['Năm ngăn của bảng tin nội bộ',                'LIETKE',  'VIỆC CỦA TÔI'],
  ['Bảng vinh danh có mấy loại',                  'DEM',     '4'],
  ['Mười cấp độ khó của một ca',                  'LIETKE',  'Đụng tiền'],
  ['Chín bậc thu nhập của nhân sự',               'LIETKE',  'bậc'],
  ['Phác đồ cho trẻ mất tập trung',               'TOM',     'tập trung'],
  ['Mô thức về dòng thời gian',                   'TOM',     'thời gian'],
];

function boDau(s) {
  return String(s == null ? '' : s).toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd');
}

(async () => {
  const khoa = JSON.parse(fs.readFileSync('/home/user/Quang-GITA/kho/khoa.json', 'utf8')).khoa;
  const b = await chromium.launch();
  const p = await b.newPage();
  await p.addInitScript(x => { window.GITA_KHOA = x; }, khoa);
  await p.goto('http://127.0.0.1:8099/index.html');
  await p.waitForFunction(() => window.G && window.G.doLogin, null, { timeout: 30000 });
  await p.evaluate(() => G.doLogin('coach@gita365.vn'));
  await p.waitForFunction(() => window.G.tlSoan, null, { timeout: 40000 });
  console.log('  (kho đã mở ' + (await doiKhoXong(p)) + ' gói)');

  const r = await p.evaluate((HOI) => HOI.map(function (h) {
    var kq = G.aiTra(h[0]) || [];
    var s = null;
    try { s = G.tlSoan(h[0], kq); } catch (e) { s = null; }
    if (!s) return { hoi: h[0], y: '(không soạn được)', canY: h[1], het: '', trung: false };
    /* Toàn bộ chữ của bản soạn, để đối chiếu mẩu bắt buộc */
    var het = s.cau + ' ' + s.dong.map(function (d) {
      return d.nhan + ' ' + d.chu;
    }).join(' ');
    return { hoi: h[0], y: s.y, canY: h[1], kho: s.kho, het: het,
      cau: String(s.cau).slice(0, 64), soDong: s.dong.length };
  }), HOI);

  let dungY = 0, coChu = 0, ca = 0;
  r.forEach((x, i) => {
    const phai = HOI[i][2];
    const dY = x.y === x.canY;
    const dC = x.het && boDau(x.het).indexOf(boDau(phai)) >= 0;
    if (dY) dungY++;
    if (dC) coChu++;
    if (dY && dC) ca++;
    console.log((dY && dC ? ' ✓ ' : ' ✗ ') + x.hoi);
    console.log('     ý ' + x.y + (dY ? '' : ' (cần ' + x.canY + ')') +
      (dC ? '' : ' · THIẾU "' + phai + '"') +
      (x.kho ? ' · ' + x.kho : ''));
    if (x.cau) console.log('     → ' + x.cau);
  });

  console.log('\nĐỌC ĐÚNG Ý  ' + dungY + '/' + r.length);
  console.log('CÓ ĐÚNG CHỮ ' + coChu + '/' + r.length);
  console.log('CẢ HAI      ' + ca + '/' + r.length + ' = ' + Math.round(ca / r.length * 100) + '%');

  /* MỐC KHÔNG ĐƯỢC TỤT. Đặt bằng đúng số đo được lúc dựng bộ này. */
  const MOC = 17;
  if (ca < MOC) {
    console.log('✗ TỤT so với mốc ' + MOC + '/' + r.length + ' — bộ soạn vừa hỏng ở đâu đó');
    await b.close(); process.exit(1);
  }
  console.log('✓ Không tụt so với mốc ' + MOC + '/' + r.length);
  await b.close();
})();
