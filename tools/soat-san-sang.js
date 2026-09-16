#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════
   GITA 365 — SOÁT SẴN SÀNG TRƯỚC KHI CHẠY THẬT

       node tools/soat-san-sang.js

   ══ VÌ SAO CẦN CÁI NÀY KHI ĐÃ CÓ kiem-trien-khai.js ══

   kiem-trien-khai.js chạy SAU, từ ngoài internet nhìn vào, và nó chỉ
   chạy được khi đã có một địa chỉ sống. Nghĩa là chỗ nó bắt lỗi là
   chỗ máy chủ ĐÃ chạy với một cấu hình thiếu — khoá chưa nạp thì
   người dùng thật đã gặp màn "chưa mở được kho" trước khi ai chạy bộ
   kiểm.

   Bộ này chạy TRƯỚC, ở máy của người triển khai, và trả lời đúng một
   câu: còn thiếu gì để bấm nút phát hành.

   ══ VÀ VÌ SAO NÓ KHÔNG PHẢI MỘT BẢN GHI NHỚ ══

   Danh sách "trước khi chạy thật" trước nay nằm trong đầu bài và
   trong chú giải wrangler.toml. Một danh sách như thế mục theo đúng
   cách sổ TR_CHUA đã mục: thêm một bí mật mới ở bản sau mà quên chép
   sang danh sách, thì lượt triển khai kế tiếp thiếu đúng cái ấy và
   không ai biết.

   Nên bộ này KHÔNG khai tay danh sách bí mật. Nó đọc thẳng
   may-chu/wrangler.toml, nhặt mọi tên bí mật mà chính tệp ấy dặn nạp,
   rồi đối chiếu với những gì Cloudflare đang giữ. Thêm một bí mật vào
   wrangler.toml là nó tự có mặt ở đây.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const GOC = path.join(__dirname, '..');
let thieu = 0, nhacNho = 0;

function dat(ok, ten, ct) {
  if (!ok) thieu++;
  console.log((ok ? '  ✓ ' : '  ✗ ') + ten + (ct ? ' — ' + ct : ''));
}
function nhac(ten, ct) { nhacNho++; console.log('  ! ' + ten + (ct ? ' — ' + ct : '')); }
function doc(p) { try { return fs.readFileSync(path.join(GOC, p), 'utf8'); } catch (e) { return ''; } }

console.log('\nSOÁT SẴN SÀNG TRƯỚC KHI CHẠY THẬT\n');

/* ═══════════ A · BÍ MẬT MÁY CHỦ ═══════════ */
console.log('A · BÍ MẬT MÁY CHỦ (Cloudflare Workers)');

const wr = doc('may-chu/wrangler.toml');
/* Đọc tên bí mật từ chính lời dặn trong tệp cấu hình, không khai tay.
   Khai tay là dựng bản thứ hai của một danh sách, và bản thứ hai mục. */
const canCo = [...new Set((wr.match(/wrangler secret put\s+([A-Z_]+)/g) || [])
  .map(x => x.split(/\s+/).pop()))].sort();

if (!canCo.length) {
  dat(false, 'đọc được danh sách bí mật từ may-chu/wrangler.toml',
    'không thấy dòng "wrangler secret put" nào — tệp cấu hình vừa đổi hình?');
} else {
  console.log('  Tệp cấu hình dặn nạp ' + canCo.length + ' bí mật: ' + canCo.join(', '));

  /* Hỏi Cloudflare xem đang giữ những gì. Không đăng nhập được thì
     NÓI RA là chưa hỏi được, chứ không im lặng báo thiếu — báo thiếu
     một thứ có thật là cách chắc nhất để người ta thôi đọc bộ soát. */
  let dangGiu = null;
  try {
    const ra = execFileSync('npx', ['--yes', 'wrangler', 'secret', 'list'],
      { cwd: path.join(GOC, 'may-chu'), encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'],
        timeout: 90000 });
    dangGiu = (ra.match(/"name"\s*:\s*"([A-Z_]+)"/g) || [])
      .map(x => x.split('"')[3]);
  } catch (e) {
    dangGiu = null;
  }

  if (dangGiu === null) {
    nhac('CHƯA HỎI ĐƯỢC CLOUDFLARE',
      'wrangler chưa đăng nhập ở máy này, hoặc không có mạng. Chạy "npx wrangler login" ' +
      'rồi chạy lại để bộ soát tự đối chiếu.');
    console.log('\n  Lệnh nạp từng bí mật, chạy trong thư mục may-chu/:');
    canCo.forEach(k => console.log('    npx wrangler secret put ' + k));
  } else {
    canCo.forEach(k => dat(dangGiu.indexOf(k) >= 0, 'đã nạp ' + k,
      dangGiu.indexOf(k) >= 0 ? '' : 'chạy: npx wrangler secret put ' + k));
    const thua = dangGiu.filter(k => canCo.indexOf(k) < 0);
    if (thua.length) nhac('Cloudflare còn giữ bí mật không ai dùng: ' + thua.join(', '),
      'bí mật thừa không làm hỏng gì, nhưng nó là một khoá còn sống mà không ai nhớ để làm gì');
  }
}

/* ═══════════ B · CẤU HÌNH BẢN WEB ═══════════ */
console.log('\nB · BẢN WEB');

const ch = doc('cau-hinh.js');
const mDiaChi = ch.match(/API_CAP_PHEP\s*[:=]\s*['"](https?:\/\/[^'"]+)/);
if (mDiaChi) dat(true, 'cau-hinh.js đã trỏ vào một máy chủ thật', mDiaChi[1]);
else nhac('cau-hinh.js chưa trỏ máy chủ',
  'bản web sẽ chạy CHẾ ĐỘ MẪU — đúng cho bản xem thử, thiếu cho bản chạy thật');

/* ── ĐỊA CHỈ MÁY CHỦ PHẢI NẰM TRONG connect-src CỦA CSP ──

   Tìm ra ở 9.99.9 bằng cách CHẠY THẬT, không bằng cách đọc mã: bản web
   gọi máy chủ demo và trình duyệt trả về "Failed to fetch". CSP trong
   index.html chỉ cho connect tới 'self' và script.google.com — đúng cho
   nền Apps Script cũ, và chặn SẠCH nền Cloudflare Workers mới, vốn là
   một origin khác.

   Nghĩa là dán địa chỉ Worker vào cau-hinh.js thôi thì chưa đủ: bản web
   lên mạng, mọi lượt gọi bị trình duyệt chặn trước khi ra khỏi máy, và
   người dùng thấy đúng cái màn "chưa nối máy chủ" như khi chưa dán gì.
   Hai chỗ phải sửa cùng nhau, nên phải có một chỗ canh chúng đi cùng. */
const csp = (doc('index.html').match(/connect-src ([^;"]+)/) || [])[1] || '';
if (mDiaChi) {
  let goc = '';
  try { goc = new URL(mDiaChi[1]).origin; } catch (e) { goc = ''; }
  const trongCsp = !!goc && (csp.indexOf(goc) >= 0 ||
    /* khớp cả dạng hoa thị: https://*.workers.dev phủ mọi tên con */
    csp.split(/\s+/).some(x => x.indexOf('*.') > 0 &&
      goc.endsWith(x.replace(/^https?:\/\/\*\./, '.'))));
  dat(trongCsp, 'origin máy chủ nằm trong connect-src của CSP',
    trongCsp ? goc : 'THIẾU "' + goc + '" trong connect-src của index.html — ' +
      'trình duyệt sẽ chặn mọi lượt gọi và bản web trông y như chưa nối máy chủ. ' +
      'connect-src đang là: ' + (csp.trim() || '(không đọc được)'));
} else {
  nhac('chưa dán địa chỉ nên chưa soát được CSP',
    'dán địa chỉ vào cau-hinh.js xong phải thêm ĐÚNG origin ấy vào connect-src ' +
    'của index.html — hai chỗ đi cùng nhau, thiếu một chỗ là bị chặn im lặng.');
}

const cname = doc('CNAME').trim();
dat(!!cname, 'CNAME có tên miền', cname || 'trống — bản web sẽ chạy ở địa chỉ mặc định của GitHub Pages');

const wf = doc('.github/workflows/trang-web.yml');
dat(/pages/i.test(wf), 'có luồng GitHub Actions dựng trang',
  wf ? '' : 'thiếu .github/workflows/trang-web.yml');
nhac('Bật GitHub Pages là việc bấm tay',
  'Settings → Pages → Source: GitHub Actions. Không có lệnh nào làm hộ được, ' +
  'và luồng ở trên chạy xong vẫn không lên trang nếu chưa bật.');

/* ═══════════ C · TÀI SẢN KHÔNG ĐƯỢC LỌT ═══════════ */
console.log('\nC · TÀI SẢN');

const gi = doc('.gitignore');
dat(/^kho-goc\/?$/m.test(gi), 'kho-goc/ nằm trong .gitignore');
dat(/khoa\.json/.test(gi), 'kho/khoa.json nằm trong .gitignore');

let theoDoi = '';
try {
  theoDoi = execFileSync('git', ['ls-files', 'kho-goc', 'kho/khoa.json'],
    { cwd: GOC, encoding: 'utf8' });
} catch (e) { theoDoi = ''; }
dat(!theoDoi.trim(), 'kho mã KHÔNG đang theo dõi kho-goc/ hay khoá',
  theoDoi.trim() ? 'ĐANG THEO DÕI: ' + theoDoi.trim().split('\n').slice(0, 3).join(' · ') : '');

const soEnc = fs.existsSync(path.join(GOC, 'kho'))
  ? fs.readdirSync(path.join(GOC, 'kho')).filter(f => /\.enc$/.test(f)).length : 0;
dat(soEnc >= 8, 'có đủ gói kho đã mã hoá', soEnc + ' tệp .enc');

/* ═══════════ D · VIỆC CHỜ NGƯỜI, KHÔNG CHỜ MÃ ═══════════ */
console.log('\nD · CHỜ NGƯỜI, KHÔNG CHỜ MÃ');

/* ── ĐỌC THẲNG SỔ CHỜ TRONG KHO, KHÔNG KHAI TAY ──

   Phần này dựng ở 9.99.49 vì ba dòng nhac() gõ tay bên dưới đã bắt đầu
   mục đúng theo cách phần A nói: kho có mười hai sổ _CHOCHU với hàng
   chục mục chờ chủ hệ, mà bộ soát chỉ kể ba cái ai đó nhớ chép sang.

   Nên chỗ này nạp kho gốc vào một cái window giả rồi gọi ĐÚNG bộ đo mà
   màn Biên soạn đang dùng — src/cho-chu-he.js. Hai chỗ, một phép đo.
   Viết phép đo lần thứ hai ở đây là cách chắc nhất để hai chỗ nói hai
   con số khác nhau, và lúc ấy không ai tin chỗ nào. */
function napKhoGiaLap() {
  const vm = require('vm');
  const thuMuc = path.join(GOC, 'kho-goc');
  if (!fs.existsSync(thuMuc)) return { thieuKho: true };
  /* Thứ tự A–Z, y như lúc nạp thật: dấu '-' đứng trước dấu '.' */
  const ds = fs.readdirSync(thuMuc).filter(f => /\.js$/.test(f)).sort();
  const hop = { window: {}, document: undefined, console: { log() {}, warn() {}, error() {} } };
  hop.window.G = {};
  hop.globalThis = hop;
  vm.createContext(hop);
  let hongTep = [];
  for (const f of ds) {
    try {
      vm.runInContext(fs.readFileSync(path.join(thuMuc, f), 'utf8'), hop, { filename: f });
    } catch (e) { hongTep.push(f); }
  }
  try {
    vm.runInContext(fs.readFileSync(path.join(GOC, 'src', 'cho-chu-he.js'), 'utf8'),
      hop, { filename: 'cho-chu-he.js' });
  } catch (e) { return { hongBoDo: e.message }; }
  return { G: hop.window.G, hongTep };
}

const kg = napKhoGiaLap();
if (kg.thieuKho) {
  nhac('CHƯA ĐỌC ĐƯỢC SỔ CHỜ', 'không có thư mục kho-goc/ ở máy này — ' +
    'máy dựng bản công khai không giữ nội dung gốc, và đó là đúng. ' +
    'Chạy bộ soát ở máy người biên soạn để thấy phần này.');
} else if (kg.hongBoDo) {
  dat(false, 'nạp được bộ đo src/cho-chu-he.js', kg.hongBoDo);
} else {
  const g = kg.G;
  if (kg.hongTep.length) {
    nhac(kg.hongTep.length + ' tệp kho không nạp được trong bộ soát',
      kg.hongTep.slice(0, 3).join(' · ') + ' — sổ chờ đọc ra có thể còn thiếu');
  }
  const docRa = g.ccDocSo();
  const tt = g.ccTomTat(docRa);
  console.log('  ' + tt.so + ' sổ chờ · ' + tt.tong + ' mục · máy đo được ' +
    (tt.chua + tt.xong) + ', không đo được ' + tt.khongDo +
    ', chưa khai cách đo ' + tt.chuaKhai);

  /* Mục đã XONG mà vẫn nằm trong sổ là lỗi của người làm, không phải
     việc của chủ hệ — nên nó tính vào `thieu`, không tính vào `nhacNho`.
     Đây chính là chỗ sổ TR_CHUA từng mục: việc xong rồi mà lời khai còn
     nguyên, và vài bản sau không ai phân biệt được dòng nào thật. */
  /* Không phải sổ nào cũng có ô `ma` — BLV, BV, CS, SV, T5P dựng theo
     lối "hỏi rồi ghi câu trả lời cạnh", không đánh mã. Lấy thẳng m.muc.ma
     thì mấy sổ ấy in ra chữ "undefined", và người đọc không biết dòng
     nào trong sổ đang bị nói tới — tức là câu báo đúng mà vô dụng. */
  /* Tên một mục chờ ở BA dạng, vì mười sổ chờ dựng ở mười thời điểm
     khác nhau: sổ này gọi câu việc là `viec`, sổ kia gọi là `t`, sổ nữa
     gọi là `hoi`. Gom về MỘT chỗ đọc — bản trước có hai chỗ đọc viết
     tay, mỗi chỗ biết một nửa danh sách, nên phần nhắc in ra
     "CC-TEN · undefined" cho ba mục và ba dòng trống cho mấy mục không
     đánh mã. Một dòng nhắc không nói nó nhắc việc gì thì nó không nhắc
     được ai. Đúng thứ luật của kho cấm: bản thứ hai của một sự thật. */
  /* Ba hàm này TRỎ sang tools/so-cho.js, không khai lại ở đây. Bản
     trước để chúng là biến cục bộ, và khi phieu-quyet.js cần đúng ba
     hàm ấy thì lựa chọn là chép sang hay tách ra — chép sang là dựng
     bản thứ hai của một sự thật lần thứ BA ở đúng chỗ đã cắn một lần
     rồi (9.99.63). */
  const { cauGon: cau, ten, nhan } = require('./so-cho.js');
  docRa.forEach(s => s.muc.forEach(m => {
    if (m.ket.trang === 'hong') {
      dat(false, ten(m.muc) + ' khai sai đường đo', m.ket.vi);
    } else if (m.ket.trang === 'xong') {
      dat(false, ten(m.muc) + ' ĐÃ XONG mà vẫn nằm trong ' + s.so,
        'đo được ' + m.ket.so + ' — gỡ dòng ấy khỏi kho rồi đóng gói lại. ' +
        'Sổ chờ giữ việc đã xong thì lần sau không ai tin cả sổ.');
    }
  }));

  /* Mục còn chờ THẬT: in kèm con số và chỗ điền. Một dòng nhắc không
     nói điền ở đâu thì người đọc phải đi hỏi, và thường là không hỏi. */
  docRa.forEach(s => s.muc.forEach(m => {
    if (m.ket.trang !== 'chua') return;
    nhac(nhan(m.muc),
      'còn ' + m.ket.con + ' (' + m.ket.so + ')' +
      (m.muc.noiDien ? ' — điền tại: ' + m.muc.noiDien : ''));
  }));

  /* Mục máy không đo được: kể tên thôi, không kể lý do. Lý do dài và
     nằm sẵn trong kho; in cả ra đây thì phần D dài hơn cả bộ soát, và
     một báo cáo dài là một báo cáo không ai đọc tới cuối. */
  const khongDo = [];
  docRa.forEach(s => s.muc.forEach(m => {
    if (m.ket.trang === 'khongDo') khongDo.push(ten(m.muc));
  }));
  if (khongDo.length) nhac('Máy không đo được ' + khongDo.length + ' mục',
    khongDo.join(' · ') + ' — từng mục tự khai vì sao ở ô `khongDoDuoc`; ' +
    'xem màn Biên soạn nội dung → ngăn Chờ chủ hệ.');

  /* Gộp theo SỔ chứ không kể từng mục: những sổ cũ phần lớn không có ô
     `ma`, nên kể từng mục ra một dãy "BLV_CHOCHU · BLV_CHOCHU · …" —
     dài, và không nói thêm gì. */
  const chuaKhai = [];
  let demChuaKhai = 0;
  docRa.forEach(s => {
    const n = s.muc.filter(m => m.ket.trang === 'chuaKhai').length;
    if (n) { chuaKhai.push(s.so + ' (' + n + ')'); demChuaKhai += n; }
  });
  if (demChuaKhai) nhac(demChuaKhai + ' mục chưa khai cách đo',
    chuaKhai.join(' · ') +
    ' — sổ dựng trước 9.99.49. Chưa khai thì bộ soát không tự đóng được mục ' +
    'ấy khi nó xong, và nó nằm lại mãi.');
}

nhac('Đường lấy sao kê ngân hàng',
  'ba đường: webhook của ngân hàng · cổng thanh toán · nhập tay từ sao kê. ' +
  'Cửa nganHangBao đã sẵn cho cả ba; chọn đường nào là quyết định của chủ hệ.');
nhac('SPF và DKIM cho tên miền gửi thư',
  'thiếu thì thư báo dòng doanh thu vào hộp rác, và không ai biết là nó đã gửi.');
nhac('Hệ số lương ba vị trí phòng tài chính (L-01)',
  'Màn Phòng Kế toán – Tài chính → Lương → Đặt hệ số. Chưa đặt thì bảng lương ' +
  'vẫn chấm điểm, phần tiền để trống.');

/* ═══════════ KẾT ═══════════ */
console.log('');
if (thieu) {
  console.log('✗ CÒN ' + thieu + ' CHỖ THIẾU' +
    (nhacNho ? ' · và ' + nhacNho + ' việc chờ người' : ''));
  process.exitCode = 1;
} else {
  console.log('✓ KHÔNG THIẾU CHỖ NÀO MÁY SOÁT ĐƯỢC' +
    (nhacNho ? ' · còn ' + nhacNho + ' việc chờ người, xem phần ! ở trên' : ''));
}
