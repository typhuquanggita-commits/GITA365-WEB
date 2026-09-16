#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════
   GITA 365 — GỘP 65 TỆP MÃ THÀNH MỘT

       node tools/gop-src.js          gộp lại (chạy trước khi phát hành)
       node tools/gop-src.js --tach   tách ra như cũ (khi cần sửa mã)

   ── VÌ SAO ──
   Đo thật trên mạng mô phỏng, trước khi gộp:

       4G thường   DOMContentLoaded  6.683 ms   68 yêu cầu mạng
       3G yếu      DOMContentLoaded 27.316 ms   68 yêu cầu mạng

   Trên máy tính nối mạng dây thì 624 ms — không ai thấy vấn đề. Nhưng
   phụ huynh mở bằng điện thoại ngoài đường mới là người thật, và họ
   nhìn màn hình trắng bảy giây, có khi hai bảy giây.

   Thủ phạm không phải dung lượng: 1.223 KB mã nguồn nén gzip còn 335 KB,
   và máy chủ nào cũng nén. Thủ phạm là SỐ LƯỢT HỎI. Mỗi tệp là một lượt
   đi về, mỗi lượt phải trả một lần độ trễ đường truyền. 65 lượt × 70 ms
   là bốn giây rưỡi chỉ để chờ, chưa tải được byte nào có ích.

   Gộp 65 thành 1 thì phần chờ ấy còn đúng một lần.

   ── VÌ SAO PHẢI BỌC TỪNG TỆP ──
   Nối đuôi thẳng là hỏng ngầm. Có 30 cái tên được khai ở phạm vi ngoài
   cùng của nhiều tệp khác nhau — trong đó có docLai, ghiDoc, DA_DOC,
   KHO_DOC của hai kho chuyện khác nhau (chuyện theo cấp và chuyện người
   thật). Nối thẳng là hai kho dùng chung một sổ "đã đọc": đánh dấu đã
   đọc một chuyện học viên thì một chuyện Walt Disney cũng thành đã đọc.

   Không màn nào lỗi, không dòng nhật ký nào — đúng kiểu hỏng đắt nhất.

   Nên mỗi tệp được bọc trong một hàm riêng. Tệp nào cần ra ngoài thì đã
   tự gán vào window.G như trước, không tệp nào dựa vào việc biến ngoài
   cùng tự thành biến toàn cục.

   ── MỘT NGUỒN SỰ THẬT ──
   Thứ tự nạp là thứ tự trong index.html, và nó được chép sang
   tools/danh-sach-src.json để lần gộp sau vẫn còn. Sửa thứ tự thì sửa ở
   index.html lúc đang tách, rồi gộp lại.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
const fs = require('fs');
const path = require('path');

const GOC = path.join(__dirname, '..');
const TEP_INDEX = path.join(GOC, 'index.html');
const TEP_SW = path.join(GOC, 'sw.js');
const TEP_DS = path.join(__dirname, 'danh-sach-src.json');
const TEN_GOP = 'gita-app.js';
const TEN_NGHE = 'gita-nghe.js';
const TEP_DS_NGHE = path.join(__dirname, 'danh-sach-nghe.json');
const TACH = process.argv.includes('--tach');

const RE_THE = /^[ \t]*<script src="(src\/[^"]+\.js)"><\/script>[ \t]*\r?\n/gm;
const RE_GOP = /^[ \t]*<script src="gita-app\.js"><\/script>[ \t]*\r?\n/m;

let html = fs.readFileSync(TEP_INDEX, 'utf8');

/* ─── Thứ tự nạp: lấy từ index.html khi còn tách, từ danh sách khi đã gộp ─── */
function docDanhSach() {
  const tu = [...html.matchAll(RE_THE)].map(m => m[1]);
  if (tu.length >= 10) {
    fs.writeFileSync(TEP_DS, JSON.stringify({
      chuY: 'Thứ tự nạp mã của GITA 365. Sinh ra từ index.html lúc còn tách. ' +
            'Sửa thứ tự: chạy tools/gop-src.js --tach, sửa index.html, rồi gộp lại.',
      tep: tu
    }, null, 2) + '\n');
    return tu;
  }
  if (!fs.existsSync(TEP_DS))
    throw new Error('index.html đã gộp mà không có ' + path.basename(TEP_DS) + ' — không biết thứ tự nạp.');
  return JSON.parse(fs.readFileSync(TEP_DS, 'utf8')).tep;
}

const ds = docDanhSach();
for (const t of ds)
  if (!fs.existsSync(path.join(GOC, t))) throw new Error('Thiếu tệp trong danh sách nạp: ' + t);

/* ─── CHIA MÃ THEO QUYỀN, ĐÚNG NHƯ KHO ĐÃ CHIA ───
   Kho chia theo quyền từ bản 8.x. Mã thì chưa: tới bản 9.22, mọi gia
   đình vẫn tải trọn 1.660 KB, trong đó 252 KB dựng những màn họ không
   bao giờ mở được.

   Danh sách nghề nằm ở tools/danh-sach-nghe.json, và điều kiện vào danh
   sách ấy ghi ngay trong tệp. Thứ tự nạp vẫn lấy từ danh sách ĐẦY ĐỦ —
   một nguồn sự thật, không hai. */
const dsNghe = fs.existsSync(TEP_DS_NGHE)
  ? JSON.parse(fs.readFileSync(TEP_DS_NGHE, 'utf8')).tep : [];
for (const t of dsNghe)
  if (ds.indexOf(t) < 0) throw new Error('Tệp nghề không có trong danh sách nạp: ' + t);
const laNghe = t => dsNghe.indexOf(t) >= 0;
const dsNen = ds.filter(t => !laNghe(t));

/* Tên màn nằm ở gói nghề — SINH RA lúc gộp, không chép tay. Gói nền cần
   biết chúng để phân biệt "màn chưa tải mã" với "màn không có thật":
   thiếu bảng này thì app âm thầm nhảy về bản đồ, đúng lớp hỏng ngầm mà
   đầu tệp này đã cảnh báo. */
function manCuaTep(t) {
  const ma = fs.readFileSync(path.join(GOC, t), 'utf8');
  return [...ma.matchAll(/G\.VIEWS\['([^']+)'\]\s*=/g)].map(m => m[1]);
}
const manNghe = [];
for (const t of dsNghe) for (const v of manCuaTep(t)) if (manNghe.indexOf(v) < 0) manNghe.push(v);

/* ─── sw.js: bộ nhớ đệm ngoại tuyến cũng phải còn một lượt hỏi ───
   Không thay bằng regex thô trên cả tệp: mảng FILES xếp nhiều mục trên
   một dòng, và một lần thay hụt sẽ để bộ đệm giữ nguyên 65 lượt hỏi mà
   không ai biết. Cách chắc: cắt đúng mảng FILES, lọc mục src, chèn tệp
   gộp vào ĐÚNG CHỖ mục src đầu tiên — thứ tự nạp phải giữ nguyên. */
function suaSW(themGop) {
  let sw = fs.readFileSync(TEP_SW, 'utf8');
  const d = sw.indexOf('const FILES = [');
  if (d < 0) throw new Error('Không thấy mảng FILES trong sw.js');
  const c = sw.indexOf('];', d);
  if (c < 0) throw new Error('Mảng FILES trong sw.js không đóng');
  const than = sw.slice(d + 'const FILES = ['.length, c);

  /* Giữ nguyên chú thích trong mảng: tách theo mục, không theo dấu phẩy */
  const muc = [...than.matchAll(/'([^']+)'/g)].map(m => m[1]);
  const soSrc = muc.filter(t => /^\.\/src\/.+\.js$/.test(t)).length;
  const soGop = muc.filter(t => t === './' + TEN_GOP).length;

  let moi;
  if (themGop) {
    if (soGop && !soSrc) return { doi: false, soSrc, soGop };
    let daChen = false;
    moi = [];
    for (const t of muc) {
      if (/^\.\/src\/.+\.js$/.test(t)) {
        if (!daChen) { daChen = true; moi.push('./' + TEN_GOP); }
        continue;
      }
      if (t === './' + TEN_GOP) continue;
      moi.push(t);
    }
    if (!daChen) moi.unshift('./' + TEN_GOP);
  } else {
    if (!soGop) return { doi: false, soSrc, soGop };
    moi = [];
    for (const t of muc) {
      if (t === './' + TEN_GOP) { for (const x of ds) moi.push('./' + x); continue; }
      if (/^\.\/src\/.+\.js$/.test(t)) continue;
      moi.push(t);
    }
  }

  const ra = '\n  ' + moi.map(t => "'" + t + "'").join(',\n  ') + ',\n';
  fs.writeFileSync(TEP_SW, sw.slice(0, d + 'const FILES = ['.length) + ra + sw.slice(c));
  return { doi: true, truoc: muc.length, sau: moi.length };
}

/* ═══════════ TÁCH ═══════════ */
if (TACH) {
  if (!RE_GOP.test(html)) { console.log('index.html đang ở dạng tách rồi — không phải làm gì.'); process.exit(0); }
  html = html.replace(RE_GOP, ds.map(t => '<script src="' + t + '"></script>').join('\n') + '\n');
  fs.writeFileSync(TEP_INDEX, html);

  suaSW(false);

  fs.rmSync(path.join(GOC, TEN_GOP), { force: true });
  fs.rmSync(path.join(GOC, TEN_NGHE), { force: true });
  console.log('Đã tách lại ' + ds.length + ' thẻ script trong index.html và sw.js.');
  console.log('Sửa xong nhớ chạy: node tools/gop-src.js');
  process.exit(0);
}

/* ═══════════ GỘP ═══════════ */
function boc(t) {
  const ma = fs.readFileSync(path.join(GOC, t), 'utf8');
  /* Bọc từng tệp trong một hàm riêng — xem lý do ở đầu tệp này.
     Xuống dòng trước dấu đóng là bắt buộc: tệp nào kết thúc bằng một
     dòng chú thích // thì thiếu nó là nuốt luôn dấu đóng hàm. */
  return { ma: '/* ═════════ ' + t + ' ═════════ */\n(function(){\n' + ma + '\n})();\n',
    byte: Buffer.byteLength(ma) };
}

/* ─── Gói nghề: dựng trước, để gói nền biết mình bỏ đi bao nhiêu ─── */
let byteNghe = 0;
if (dsNghe.length) {
  const pn = dsNghe.map(t => { const b = boc(t); byteNghe += b.byte; return b.ma; });
  fs.writeFileSync(path.join(GOC, TEN_NGHE),
    '/* ═══════════════════════════════════════════════════════════════\n' +
    '   GITA 365 — MÃ CỦA GÓI NGHỀ · ' + dsNghe.length + ' TỆP\n\n' +
    '   TỆP NÀY DỰNG RA, KHÔNG PHẢI MÃ NGUỒN. Sửa trong src/ rồi chạy:\n' +
    '   node tools/gop-src.js\n\n' +
    '   Tệp này KHÔNG nằm trong index.html và KHÔNG nằm trong danh sách\n' +
    '   đệm ngoại tuyến. Nó chỉ được nạp sau khi đăng nhập, và chỉ khi\n' +
    '   giấy phép có gói nghề — cùng lúc với gói kho nghề, cùng một điều\n' +
    '   kiện. Máy của gia đình không bao giờ hỏi tới nó.\n' +
    '   ═══════════════════════════════════════════════════════════════ */\n\n' +
    pn.join('\n'));
}

const phan = [];
let byte = 0;
/* Bảng tên màn của gói nghề, sinh ra lúc gộp — đặt ở ĐẦU gói nền để mọi
   tệp sau đó đọc được. */
phan.push('/* ═════════ sinh lúc gộp: màn nằm ở ' + TEN_NGHE + ' ═════════ */\n' +
  '(function(){var G=window.G||{};window.G=G;\n' +
  'G.MA_NGHE_TEP=' + JSON.stringify(TEN_NGHE) + ';\n' +
  'G.MAN_NGHE=' + JSON.stringify(manNghe) + ';\n})();\n');
for (const t of dsNen) {
  const b = boc(t);
  byte += b.byte;
  phan.push(b.ma);
}

const dau =
  '/* ═══════════════════════════════════════════════════════════════\n' +
  '   GITA 365 — BẢN GỘP CỦA ' + dsNen.length + ' TỆP MÃ NGUỒN\n' +
  '\n' +
  '   TỆP NÀY DỰNG RA, KHÔNG PHẢI MÃ NGUỒN. Đừng sửa ở đây — sửa trong\n' +
  '   src/ rồi chạy: node tools/gop-src.js\n' +
  '\n' +
  '   Gộp để cắt số lượt hỏi mạng từ ' + ds.length + ' xuống 1. Trên 3G yếu, mỗi\n' +
  '   lượt hỏi là một lần chờ độ trễ.\n' +
  '\n' +
  '   ' + dsNghe.length + ' tệp dựng màn của NGHỀ đã ra ' + TEN_NGHE + ' — chỉ tải khi\n' +
  '   giấy phép có gói nghề. Máy của gia đình nhẹ đi ' + Math.round(byteNghe/1024) + ' KB.\n' +
  '   lượt hỏi là một lần chờ độ trễ; cộng lại là hàng chục giây màn hình\n' +
  '   trắng với người dùng điện thoại.\n' +
  '\n' +
  '   Mỗi tệp nằm trong một hàm riêng, vì có 30 tên trùng nhau ở phạm vi\n' +
  '   ngoài cùng giữa các tệp. Nối thẳng là chúng giẫm lên nhau trong im\n' +
  '   lặng. Thứ tự nạp: tools/danh-sach-src.json\n' +
  '   ═══════════════════════════════════════════════════════════════ */\n\n';

fs.writeFileSync(path.join(GOC, TEN_GOP), dau + phan.join('\n'));

/* index.html: thay cả dãy thẻ bằng một thẻ, đúng chỗ thẻ đầu tiên */
if (RE_GOP.test(html)) {
  console.log('index.html đã trỏ vào ' + TEN_GOP + ' — chỉ dựng lại tệp gộp.');
} else {
  let dau1 = true;
  html = html.replace(RE_THE, () => dau1 ? (dau1 = false, '<script src="' + TEN_GOP + '"></script>\n') : '');
  fs.writeFileSync(TEP_INDEX, html);
}

/* sw.js: một mục thay cho cả dãy, để cài ngoại tuyến cũng còn một lượt hỏi */
const kqSW = suaSW(true);
if (kqSW.doi) console.log('sw.js: ' + kqSW.truoc + ' mục → ' + kqSW.sau + ' mục trong bộ nhớ đệm ngoại tuyến');
else console.log('sw.js đã trỏ vào ' + TEN_GOP + ' rồi.');

const raByte = fs.statSync(path.join(GOC, TEN_GOP)).size;
console.log('Đã gộp ' + dsNen.length + ' tệp · ' + Math.round(byte / 1024) + ' KB → ' +
  Math.round(raByte / 1024) + ' KB trong ' + TEN_GOP);
if (dsNghe.length) {
  const nb = fs.statSync(path.join(GOC, TEN_NGHE)).size;
  console.log('Gói nghề: ' + dsNghe.length + ' tệp · ' + Math.round(nb / 1024) + ' KB trong ' +
    TEN_NGHE + ' — ' + manNghe.length + ' màn, chỉ tải khi có gói nghề');
  console.log('Máy gia đình nhẹ đi ' + Math.round(byteNghe / 1024) + ' KB (' +
    Math.round(100 * byteNghe / (byte + byteNghe)) + '% gói mã)');
}
console.log('Số lượt hỏi mạng cho phần mã: ' + ds.length + ' → 1 (vai nghề: 2)');
