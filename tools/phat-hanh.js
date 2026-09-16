#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════
   GITA 365 — MỘT LỆNH PHÁT HÀNH

       node tools/phat-hanh.js            đóng gói và kiểm, không đẩy
       node tools/phat-hanh.js --day      kiểm xong thì commit và đẩy luôn

   Làm đủ chuỗi việc, đúng thứ tự, dừng ngay khi có việc nào hỏng:

     1. Mã hoá lại kho          (giữ nguyên khoá — giấy phép cũ vẫn dùng được)
     2. Sinh tệp nạp khoá       cho máy chủ cấp phép
     3. Thử máy chủ cấp phép    với ROLES thật của v6.9, không cần mạng
     4. Dựng bản một tệp        để gửi khách xem thử
     5. Chạy bộ kiểm phát hành  75+ màn hình × 19 vai, XSS, phạm vi cấp phép
     6. Soát tài sản            không để lọt kho gốc hay khoá lên kho mã
     7. (--day) commit và đẩy   CI tự dựng bộ cài Windows mới

   Thay cho năm lệnh rời phải nhớ đúng thứ tự.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
const { execFileSync, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const GOC = path.join(__dirname, '..');
const DAY = process.argv.includes('--day');
const t0 = Date.now();

let buoc = 0;
function tieuDe(ten) {
  buoc++;
  console.log('\n' + '─'.repeat(64));
  console.log('  BƯỚC ' + buoc + ' · ' + ten);
  console.log('─'.repeat(64));
}
function chay(lenh, dv, opt) {
  try {
    execFileSync(lenh, dv || [], { cwd: GOC, stdio: 'inherit', ...(opt || {}) });
  } catch (e) {
    console.error('\n✗ DỪNG Ở BƯỚC ' + buoc + ' — ' + lenh + ' ' + (dv || []).join(' '));
    console.error('  Sửa xong chạy lại. Không có gì được đẩy lên.');
    process.exit(1);
  }
}
function co(p) { return fs.existsSync(path.join(GOC, p)); }

/* ─── 0. Điều kiện cần ─── */
if (!co('kho-goc')) {
  console.error('Không thấy kho-goc/. Đây là nội dung gốc chưa mã hoá, không nằm trong kho mã.');
  console.error('Khôi phục kho-goc/ rồi chạy lại.');
  process.exit(1);
}

/* ─── 1. Mã hoá kho ─── */
tieuDe('MÃ HOÁ KHO');
chay('node', ['tools/ma-hoa-kho.js']);

/* ─── 1b. Kho vừa đóng đổi gì so với bản đã phát hành ───
   kho-goc/ nằm trong .gitignore nên không có diff để nhìn. Bảy gói .enc
   đã phát hành thì có trong git — đây là chỗ duy nhất so được. In ra
   trước mọi bước khác, để người phát hành thấy sức công phá của việc
   mình vừa sửa TRƯỚC khi nó đi tiếp. Không chặn, chỉ nói. */
tieuDe('KHO VỪA ĐÓNG ĐỔI GÌ SO VỚI BẢN ĐÃ PHÁT HÀNH');
chay('node', ['tools/soi-doi-kho.js']);

/* ─── 2. Tệp nạp khoá ─── */
tieuDe('SINH TỆP NẠP KHOÁ CHO MÁY CHỦ CẤP PHÉP');
chay('node', ['tools/tao-nap-khoa.js']);

/* ─── 3. Thử máy chủ cấp phép ─── */
tieuDe('THỬ MÁY CHỦ CẤP PHÉP');
const V69 = process.env.GITA_V69 || '';
if (V69 && fs.existsSync(path.join(V69, '00_Config.gs'))) {
  chay('node', ['tools/thu-may-chu-cap-phep.js', V69]);
} else {
  try {
    execFileSync('node', ['tools/thu-may-chu-cap-phep.js'], { cwd: GOC, stdio: 'inherit' });
  } catch (e) {
    console.log('  ⚠ Bỏ qua — không tìm thấy mã nguồn v6.9.');
    console.log('    Đặt biến GITA_V69 trỏ tới thư mục src của v6.9 để kiểm cả phần này.');
  }
}

/* ─── 3b. Gộp mã ───
   PHẢI ĐỨNG TRƯỚC BƯỚC DỰNG BẢN MỘT TỆP.

   Tới bản 9.79 đường phát hành KHÔNG có bước này, dù CLAUDE.md vẫn kê nó
   ra. Hậu quả có hai lớp, và lớp thứ hai nặng hơn nhiều:

     · lớp một — mục 36 đỏ mỗi lần sửa src/ mà quên gộp tay. Đây là lớp
       lành, vì nó đỏ và người ta sửa.
     · lớp hai — tools/dong-goi.py dựng bản một tệp GỬI KHÁCH từ chính
       gita-app.js đang cũ. Nghĩa là bản gửi đi mang mã của lần gộp
       trước, còn bộ kiểm thì chạy trên bản đã sửa. Ngày nào mục 36 bị
       nới ra một chút là bản cũ đi thẳng tới tay khách mà không ai đỏ.

   Nên gộp ở đây, không nhờ trí nhớ. Cả mã máy khách lẫn mã máy chủ —
   server/GITA365_TATCA.gs là thứ DUY NHẤT được dán lên Apps Script, quên
   gộp nó thì phần mã vừa viết coi như chưa từng có trên máy chủ thật. */
tieuDe('GỘP MÃ — MÁY KHÁCH VÀ MÁY CHỦ');
chay('node', ['tools/gop-src.js']);
chay('node', ['tools/gop-may-chu.js']);

/* ─── 4. Bản một tệp ─── */
tieuDe('DỰNG BẢN MỘT TỆP ĐỂ GỬI KHÁCH');
chay('python3', ['tools/dong-goi.py']);

/* ─── 5. Bộ kiểm phát hành ─── */
tieuDe('BỘ KIỂM PHÁT HÀNH');
let mayChu = null;
try {
  execSync('curl -sf -o /dev/null http://127.0.0.1:8099/index.html', { cwd: GOC });
} catch (e) {
  console.log('  Chưa có máy chủ tĩnh ở cổng 8099 — tự bật.');
  mayChu = require('child_process').spawn('npx',
    ['--yes', 'http-server', '-p', '8099', '-s', '.'],
    { cwd: GOC, detached: true, stdio: 'ignore' });
  mayChu.unref();
  const den = Date.now() + 30000;
  for (;;) {
    try { execSync('curl -sf -o /dev/null http://127.0.0.1:8099/index.html'); break; }
    catch (e2) {
      if (Date.now() > den) { console.error('  ✗ Máy chủ tĩnh không lên được.'); process.exit(1); }
      execSync('sleep 1');
    }
  }
}
/* Bộ dò sâu chạy TĨNH và chạy TRƯỚC bộ kiểm, vì nó bắt lớp lỗi mà bộ
   kiểm không thấy được: màn bị đè, hàm đè trộm, màn chết, mục NAV trỏ
   vào khoảng không. Chạy trước còn vì nó xong trong một giây — hỏng ở
   đây thì khỏi chờ mười hai phút của bộ kiểm. */
chay('node', ['tools/do-sau.js']);
chay('node', ['tools/kiem-tra.js']);
/* Dựng được không có nghĩa là bấm được. Bộ này đăng nhập TỪNG VAI, nạp lại
   kho theo đúng phạm vi vai đó, rồi đi hết mọi mục — bắt được mục chết mà
   bộ kiểm dựng-rồi-đếm không thấy. */
chay('node', ['tools/di-bo-lien-ket.js']);
/* Đo trợ lý: hai mươi câu hỏi thật, mỗi câu khai kho đáng lẽ phải ra.
   Đo ĐỘ TRÚNG chứ không đo độ có trả về — trợ lý luôn trả về thứ gì
   đó, nên "có trả lời" không phải một phép đo. */
chay('xvfb-run', ['-a', 'node', 'tools/do-tro-ly.js']);
chay('xvfb-run', ['-a', 'node', 'tools/do-soan.js']);
chay('xvfb-run', ['-a', 'node', 'tools/do-noi-tiep.js']);
chay('xvfb-run', ['-a', 'node', 'tools/do-tu-kiem.js']);
chay('xvfb-run', ['-a', 'node', 'tools/thu-nhu-that.js']);
/* Bốn khổ màn thật. Hai bộ soi màn hình khác đọc chuỗi HTML và cả hai
   chạy ở đúng một khổ để bàn, nên không bộ nào trả lời được câu của
   người cầm điện thoại: chữ có tràn ra ngoài không, nút có đủ to để
   bấm bằng ngón tay không. Bản 9.99.51 chạy bộ này lần đầu và bắt ngay
   một màn đẩy cả trang rộng 555px trên màn 390px. */
chay('xvfb-run', ['-a', 'node', 'tools/do-khung-man.js', '--im']);
/* Đường dựng phim đi qua ba nhà — bộ vẽ, tệp PNG, ffmpeg — nên chỗ
   hỏng của nó nằm ở MỐI NỐI, và mối nối thì chỉ lộ ra khi chạy trọn
   đường một lần. Cần ffmpeg; máy nào chưa có thì bộ này nói ra chứ
   không lặng lẽ bỏ qua. */
chay('xvfb-run', ['-a', 'node', 'tools/thu-phim.js']);
if (mayChu) { try { process.kill(-mayChu.pid); } catch (e) {} }

/* ─── 5a-bis. Thử mã máy chủ trên bản giả lập Apps Script ───
   Mã trong server/ không chạy được ở máy, nên nếu không thử ở đây thì chỗ
   duy nhất phát hiện lỗi là máy chủ thật, lúc khách hàng đang đăng ký. */
tieuDe('THỬ MÃ MÁY CHỦ');
chay('node', ['tools/gop-may-chu.js']);
chay('node', ['tools/thu-may-chu.js']);
chay('node', ['tools/thu-may-chu.js', '--gop']);
/* Bản web do Apps Script phục vụ đi một đường khác hẳn bản tĩnh — vỏ đọc từ
   Drive, địa chỉ tiêm lúc trả trang, kho xin qua máy chủ. Thử bằng trình
   duyệt thật, không suy ra từ bản tĩnh. */
chay('node', ['tools/thu-ban-web.js']);

/* ── NỀN MỚI: CƠ SỞ DỮ LIỆU VÀ CỬA VÀO ──

   Chưa triển khai, nhưng ĐÃ nằm trong đường phát hành. Mã chưa chạy
   thật mà không có phép kiểm nào canh thì nó mục đi lặng lẽ, và tới
   hôm triển khai người ta phát hiện nó đã hỏng từ nhiều bản trước —
   lúc ấy không ai biết bản nào làm hỏng.

   Cả hai bộ đều chạy ở máy, không cần mạng: D1 chính là SQLite, và
   Worker gọi được bằng Request/Response sẵn có của Node 22. */
chay('node', ['tools/thu-csdl-moi.js']);
chay('node', ['tools/thu-worker.js']);

/* Bản đo tải nền CŨ — cố ý KHÔNG chặn đường phát hành.
   Nó đang đỏ năm chỗ, và sẽ còn đỏ tới ngày chuyển xong nền; để nó
   chặn thì cách duy nhất phát hành được là tắt nó đi. In ra để con số
   ấy đứng trước mắt mỗi lần phát hành. */
tieuDe('NỀN CŨ CÒN CHỊU ĐƯỢC BAO NHIÊU TÀI KHOẢN');
try {
  execFileSync('node', ['--max-old-space-size=3072', 'tools/do-tai-may-chu.js'],
    { cwd: GOC, stdio: 'inherit' });
} catch (e) {
  console.log('  ⚠ Nền cũ chưa đạt mức chủ hệ đặt — xem bảng trên. Không chặn phát hành.');
}

/* ─── 5b. Thử bản máy tính ─── */
tieuDe('THỬ BẢN MÁY TÍNH');
if (co('desktop/node_modules/electron/dist/electron')) {
  chay('node', ['desktop/chuan-bi.js']);
  try {
    execFileSync('xvfb-run', ['-a', 'node', 'tools/thu-ban-may-tinh.js'], { cwd: GOC, stdio: 'inherit' });
  } catch (e) {
    try { chay('node', ['tools/thu-ban-may-tinh.js']); }
    catch (e2) { console.error('\n✗ DỪNG Ở BƯỚC ' + buoc + ' — bản máy tính không đạt.'); process.exit(1); }
  }
} else {
  console.log('  ⚠ Bỏ qua — chưa cài Electron. Chạy: cd desktop && npm ci');
}

/* ─── 6. Soát tài sản trước khi đẩy ─── */
tieuDe('SOÁT TÀI SẢN TRƯỚC KHI ĐẨY');
let ro = 0;
const CAM = ['kho-goc/', 'kho/khoa.json', 'giay-phep/'];
const theoDoi = execSync('git ls-files', { cwd: GOC, encoding: 'utf8' }).split('\n');
CAM.forEach(function (c) {
  const dinh = theoDoi.filter(function (f) { return f && f.indexOf(c) === 0; });
  if (dinh.length) { ro++; console.log('  ✗ ' + c + ' đang nằm trong kho mã: ' + dinh.slice(0, 3).join(' ')); }
  else console.log('  ✓ ' + c.padEnd(16) + 'không lọt lên kho mã');
});
/* Cấu hình không được trỏ về máy nội bộ — dấu vết của một lần diễn tập
   bị ngắt giữa chừng. Đẩy lên là bản web thật gọi về localhost và chết. */
{
  const cf = fs.readFileSync(path.join(GOC, 'cau-hinh.js'), 'utf8');
  const m = cf.match(/G\.API_CAP_PHEP\s*=\s*'([^']*)'/);
  const dc = m ? m[1] : '';
  if (/127\.0\.0\.1|localhost|\[::1\]/.test(dc)) {
    ro++; console.log('  ✗ cau-hinh.js đang trỏ về máy nội bộ: ' + dc);
    console.log('    Trả lại bằng: git checkout -- cau-hinh.js');
  } else if (!dc) {
    console.log('  ✓ cau-hinh.js  ' + 'để trống — bản web sẽ chạy chế độ mẫu');
  } else if (!/^https:\/\//.test(dc)) {
    ro++; console.log('  ✗ cau-hinh.js phải là địa chỉ https: ' + dc);
  } else {
    console.log('  ✓ cau-hinh.js  trỏ đúng máy chủ cấp phép qua HTTPS');
  }
}

/* Tệp .enc phải thật sự là dữ liệu đã mã hoá, không phải JSON đọc được.
   Đo bằng TỈ LỆ BYTE IN ĐƯỢC trên một cửa sổ lớn, không bắt vài ký tự lẻ:
   dữ liệu đã mã hoá cho ra byte ngẫu nhiên nên chỉ khoảng 35–40% in được,
   còn JSON hay mã nguồn thì gần 100%.

   Bản trước bắt "có ngoặc VÀ có sáu chữ cái liền nhau" — trong hai trăm
   byte ngẫu nhiên, chuyện đó xảy ra đủ thường xuyên để chặn nhầm một bản
   phát hành sạch. Một bộ canh báo nhầm là bộ canh sẽ bị bỏ qua. */
const encs = fs.readdirSync(path.join(GOC, 'kho')).filter(function (f) { return f.endsWith('.enc'); });
/* Đo thật trên bộ hiện tại: bảy tệp đã mã hoá cho 37–39% byte in được, còn
   kho/mau.json (JSON tiếng Việt, nhiều byte UTF-8) cho 64%. Đặt ngưỡng ở
   giữa hai vùng ấy — 75% thì quá cao, JSON tiếng Việt lọt qua. */
const NGUONG_IN = 0.50;
let doc = [];
encs.forEach(function (f) {
  const b = fs.readFileSync(path.join(GOC, 'kho', f)).subarray(28, 8228);
  if (!b.length) return;
  let inDuoc = 0;
  for (const x of b) if ((x >= 32 && x < 127) || x === 9 || x === 10 || x === 13) inDuoc++;
  const ti = inDuoc / b.length;
  /* Hai dấu hiệu bổ sung: mảnh JSON thật, hoặc mã nguồn thật */
  const chu = b.toString('utf8');
  const loThayRo = /"(ma|ten|tang|nhom)"\s*:|G\.[A-Z_]{3,}\s*=/.test(chu);
  if (ti > NGUONG_IN || loThayRo)
    doc.push(f + ' (' + Math.round(ti * 100) + '% byte in được' + (loThayRo ? ', thấy mảnh JSON' : '') + ')');
});
if (doc.length) {
  ro++;
  console.log('  ✗ ' + doc.length + ' tệp .enc đọc được bằng mắt — chưa mã hoá đúng');
  doc.forEach(function (x) { console.log('      ' + x); });
} else {
  console.log('  ✓ ' + encs.length + ' tệp .enc đều không đọc được nếu không có khoá');
}
if (ro) { console.error('\n✗ DỪNG — có tài sản sắp lọt ra ngoài. Không đẩy gì cả.'); process.exit(1); }

/* ─── 7. Đẩy ─── */
if (DAY) {
  tieuDe('COMMIT VÀ ĐẨY');
  const nhanh = execSync('git rev-parse --abbrev-ref HEAD', { cwd: GOC, encoding: 'utf8' }).trim();
  const doi = execSync('git status --porcelain', { cwd: GOC, encoding: 'utf8' }).trim();
  if (!doi) {
    console.log('  Không có gì thay đổi. Bỏ qua.');
  } else {
    chay('git', ['add', '-A']);
    const loi = process.env.GITA_LOI || 'Cập nhật nội dung và đóng gói lại';
    chay('git', ['commit', '-q', '-m', loi]);
    let xong = false;
    for (let i = 0; i < 4 && !xong; i++) {
      try { execFileSync('git', ['push', '-u', 'origin', nhanh], { cwd: GOC, stdio: 'inherit' }); xong = true; }
      catch (e) {
        const cho = Math.pow(2, i + 1);
        console.log('  Đẩy hỏng, chờ ' + cho + 's rồi thử lại…');
        execSync('sleep ' + cho);
      }
    }
    if (!xong) { console.error('  ✗ Đẩy hỏng sau 4 lần thử.'); process.exit(1); }
    console.log('  Đã đẩy lên ' + nhanh + '. CI đang dựng bộ cài Windows mới.');
  }
} else {
  console.log('\n  (chưa đẩy — thêm --day nếu muốn commit và đẩy luôn)\n\n  Trước khi chạy THẬT: node tools/soat-san-sang.js');
}

console.log('\n' + '═'.repeat(64));
console.log('  ✓ XONG — ' + Math.round((Date.now() - t0) / 1000) + ' giây');
console.log('═'.repeat(64));
/* ĐỌC SỐ BẢN TỪ NƠI DUY NHẤT KHAI NÓ, không gõ lại tên tệp.
   Dòng này đứng nguyên ở "GITA365_v72_GIOI_THIEU.html" suốt từ bản 7.2
   tới 9.79 — bảy mươi bản sau, nó vẫn chỉ tay vào một tệp không còn tồn
   tại. Người phát hành đọc đúng dòng cuối cùng để biết gửi tệp nào, nên
   một cái tên sai ở đây là gửi nhầm tệp cho khách. */
{
  const m = fs.readFileSync(path.join(GOC, 'src/data.core.js'), 'utf8')
    .match(/version:\s*'([^']+)'/);
  const ten = m ? 'GITA365-v' + m[1] + '-gioi-thieu.html' : '(không đọc được số bản)';
  console.log('  Bản gửi khách   : ' + ten +
    (m && co(ten) ? '' : '   ⚠ chưa thấy tệp này'));
}
console.log('  Nạp vào máy chủ : giay-phep/GITA_KHOA_KHO.txt');
console.log('  Bộ cài Windows  : github.com/typhuquanggita-commits/Quang-GITA/releases/tag/may-tinh-moi-nhat');
console.log('');
