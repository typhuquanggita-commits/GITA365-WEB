/* Chép web app vào desktop/app/ trước khi đóng gói.
   Một nguồn sự thật duy nhất: sửa nội dung ở gốc, bản máy tính tự có. */
'use strict';
const fs = require('fs');
const path = require('path');

const GOC = path.join(__dirname, '..');
const DICH = path.join(__dirname, 'app');
/* gita-app.js là bản gộp của 65 tệp trong src/ — index.html nạp nó, nên
   thiếu nó là bản máy tính mở ra màn trắng. src/ vẫn chép theo để còn
   đọc được mã gốc khi cần dò lỗi. */
const LAY = ['index.html', 'cau-hinh.js', 'gita-app.js', 'src', 'assets', 'manifest.webmanifest', 'kho'];

function chep(tu, den) {
  const st = fs.statSync(tu);
  if (st.isDirectory()) {
    fs.mkdirSync(den, { recursive: true });
    for (const t of fs.readdirSync(tu)) chep(path.join(tu, t), path.join(den, t));
  } else {
    fs.mkdirSync(path.dirname(den), { recursive: true });
    fs.copyFileSync(tu, den);
  }
}

fs.rmSync(DICH, { recursive: true, force: true });
for (const m of LAY) {
  const tu = path.join(GOC, m);
  if (!fs.existsSync(tu)) { console.error('Thiếu: ' + m); process.exit(1); }
  chep(tu, path.join(DICH, m));
}

/* Bộ khoá KHÔNG bao giờ được đóng vào ứng dụng.
   Bản máy tính lấy khoá từ tệp giấy phép trong thư mục dữ liệu người dùng. */
const khoaLo = path.join(DICH, 'kho', 'khoa.json');
if (fs.existsSync(khoaLo)) { fs.rmSync(khoaLo); console.log('Đã loại kho/khoa.json khỏi gói cài — đúng.'); }

/* Bản máy tính không dùng service worker — nội dung đã nằm sẵn trong ứng dụng */
const ip = path.join(DICH, 'index.html');
let html = fs.readFileSync(ip, 'utf8');
html = html.replace(/if \('serviceWorker' in navigator[\s\S]*?\n\}\n/, '');
fs.writeFileSync(ip, html);

/* ─── Số bản: một nguồn sự thật ───
   package.json của bản máy tính từng ghi cứng "7.5.0" trong khi ứng dụng
   đã đi tới v8.2. Tên tệp cài ra thành GITA365-7.5.0-win-x64.exe — người
   nhận tưởng mình đang cài bản cũ, hoặc tệ hơn, cài đè bản mới bằng bản
   cũ mà không biết vì tên trùng.

   Nay số bản đọc thẳng từ G.META.version trong src/data.core.js, đúng
   cùng một nguồn mà giao diện và tên tệp bản web dùng. */
const banMeta = (fs.readFileSync(path.join(GOC, 'src', 'data.core.js'), 'utf8')
  .match(/version:\s*'([^']+)'/) || [])[1];
if (!banMeta) { console.error('Không đọc được G.META.version trong src/data.core.js'); process.exit(1); }
const banDayDu = /^\d+\.\d+\.\d+$/.test(banMeta) ? banMeta : banMeta + '.0';

const pkgP = path.join(__dirname, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgP, 'utf8'));
if (pkg.version !== banDayDu) {
  console.log('Số bản: ' + pkg.version + ' → ' + banDayDu + ' (theo G.META.version)');
  pkg.version = banDayDu;
  fs.writeFileSync(pkgP, JSON.stringify(pkg, null, 2) + '\n');
} else {
  console.log('Số bản đã khớp G.META.version: ' + banDayDu);
}

let n = 0;
(function dem(d) { for (const t of fs.readdirSync(d)) {
  const p = path.join(d, t);
  fs.statSync(p).isDirectory() ? dem(p) : n++;
} })(DICH);
console.log('Đã chuẩn bị ' + n + ' tệp vào desktop/app/');
