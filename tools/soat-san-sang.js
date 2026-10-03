#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════
   GITA 365 — SOÁT SẴN SÀNG TRIỂN KHAI

   Chạy trước khi đưa bản web lên Cloudflare Pages:
     node tools/soat-san-sang.js

   Kiểm tra các điều kiện hay gây "đẩy lên xong mà không chạy":
     · cau-hinh.js và connect-src trong index.html cùng origin
     · origin của CNAME nằm trong GITA_DIA_CHI_WEB (CORS của Worker)
     · các tệp tĩnh cần thiết có mặt
     · gita-app.js / gita-nghe.js khớp với src/
     · sw.js cache version khớp với G.META.version
     · _headers không còn dòng bị Wrangler từ chối
     · Worker endpoints được gọi được (nếu máy chủ đã nối)

   Trả mã lỗi 0 nếu sẵn sàng, 1 nếu có vấn đề.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const log = console.log;
let loi = 0, canhBao = 0;

function ok(msg) { log('  ✓ ' + msg); }
function fail(msg) { log('  ✗ ' + msg); loi++; }
function warn(msg) { log('  ! ' + msg); canhBao++; }

function doc(p) { return fs.readFileSync(path.join(ROOT, p), 'utf8'); }

function chay(cmd) {
  try { return execSync(cmd, { cwd: ROOT, encoding: 'utf8', stdio: 'pipe' }); }
  catch (e) { return { err: e, out: e && e.stdout || '', stderr: e && e.stderr || '' }; }
}

log('GITA 365 — SOÁT SẴN SÀNG TRIỂN KHAI');
log('='.repeat(48));

/* 1. Phiên bản */
log('\n1. Phiên bản');
const meta = doc('src/data.core.js').match(/version:\s*['"]([^'"]+)['"]/);
const metaVer = meta ? meta[1] : null;
const swVerMatch = doc('sw.js').match(/CACHE\s*=\s*['"]gita365-v([^'"]+)['"]/);
const swVer = swVerMatch ? swVerMatch[1].replace(/-/g, '.') : null;
const trienKhaiVer = (doc('TRIEN-KHAI.md').match(/Bản full ([0-9.]+)/) || [])[1];
const readmeVer = (doc('README.md').match(/GITA 365 · v([0-9.]+)/) || [])[1];
const banAppVer = (doc('may-chu/cong-dong.js').match(/BAN_APP\s*=\s*['"]([^'"]+)['"]/) || [])[1];
if (metaVer) ok('G.META.version = ' + metaVer); else fail('Không đọc được G.META.version');
if (swVer) ok('sw.js cache = v' + swVer); else fail('Không đọc được sw.js CACHE');
if (metaVer && swVer && metaVer === swVer) ok('Phiên bản khớp giữa META và sw.js');
else if (metaVer && swVer) fail('Phiên bản KHÔNG khớp: META ' + metaVer + ' ≠ sw.js ' + swVer);
if (trienKhaiVer && metaVer && trienKhaiVer === metaVer) ok('TRIEN-KHAI.md khớp phiên bản');
else if (trienKhaiVer && metaVer) fail('TRIEN-KHAI.md ghi ' + trienKhaiVer + ' khác ' + metaVer);
else fail('Không đọc được phiên bản trong TRIEN-KHAI.md');
if (readmeVer && metaVer && readmeVer === metaVer) ok('README.md khớp phiên bản');
else if (readmeVer && metaVer) fail('README.md ghi ' + readmeVer + ' khác ' + metaVer);
else fail('Không đọc được phiên bản trong README.md');
if (banAppVer && metaVer && banAppVer === metaVer) ok('may-chu/cong-dong.js khớp phiên bản');
else if (banAppVer && metaVer) fail('may-chu/cong-dong.js ghi ' + banAppVer + ' khác ' + metaVer);
else fail('Không đọc được BAN_APP trong may-chu/cong-dong.js');

/* 2. Gộp mã */
log('\n2. Gộp mã nguồn');
const gop = chay('node tools/gop-src.js --kiem');
if (typeof gop === 'string' && gop.includes('khớp')) ok('gita-app.js + gita-nghe.js khớp src/');
else fail('Gộp mã lệch — chạy: node tools/gop-src.js\n' + (gop.out || gop.stderr || gop));

/* 3. Cú pháp */
log('\n3. Cú pháp');
['gita-app.js', 'gita-nghe.js'].forEach(f => {
  const r = chay('node --check ' + f);
  if (typeof r === 'string' && !r.err) ok(f + ' không lỗi cú pháp');
  else fail(f + ' lỗi cú pháp');
});

/* 4. Tệp triển khai */
log('\n4. Tệp triển khai');
const canThiet = [
  'index.html', 'cau-hinh.js', 'sw.js', 'manifest.webmanifest',
  'assets/style.css', 'assets/fonts.css',
  'kho/mau.json', 'kho/nen.enc',
  '_headers', '_redirects', '.nojekyll'
];
canThiet.forEach(f => {
  if (fs.existsSync(path.join(ROOT, f))) ok(f + ' có mặt');
  else fail(f + ' THIẾU');
});

/* 5. Headers */
log('\n5. _headers');
const headers = doc('_headers');
if (/^\s*#/.test(headers)) warn('_headers còn dòng bắt đầu bằng # — Wrangler có thể từ chối');
else ok('_headers không bắt đầu bằng comment');

/* 6. CSP + máy chủ */
log('\n6. Máy chủ cấp phép');
const cauHinh = doc('cau-hinh.js');
const apiMatch = cauHinh.match(/G\.API_CAP_PHEP\s*=\s*G\.API_CAP_PHEP\s*\|\|\s*['"](https?:[^'"]+)['"]/);
const api = apiMatch ? apiMatch[1] : '';
const cspMatch = doc('index.html').match(/connect-src\s+([^";]+)/);
const csp = cspMatch ? cspMatch[1] : '';
if (api) ok('cau-hinh.js: ' + api); else warn('cau-hinh.js chưa đặt API_CAP_PHEP');
if (csp) ok('index.html connect-src: ' + csp.trim().split(/\s+/).join(', '));
else fail('Không tìm thấy connect-src trong index.html');

if (api) {
  const host = new URL(api).host;
  const ds = csp.split(/\s+/).filter(Boolean);
  const coOrigin = ds.some(x => {
    if (x === "'self'") return false;
    if (!/^https:\/\//.test(x)) return false;
    const hostPart = x.replace(/^https:\/\//, '');
    if (/^\*\./.test(hostPart)) {
      const pat = hostPart.replace(/^\*\./, '');
      return host === pat || host.endsWith('.' + pat);
    }
    try { return new URL(x).host === host; }
    catch (e) { return false; }
  });
  if (coOrigin) ok('Origin máy chủ nằm trong connect-src');
  else fail('Origin ' + new URL(api).origin + ' KHÔNG nằm trong connect-src');
}

/* 6b. CORS: mọi tên miền chạy web phải nằm trong GITA_DIA_CHI_WEB của Worker,
   nếu không trình duyệt chặn và app báo "không kết nối được máy chủ". */
const wrangler = doc('may-chu/wrangler.toml');
const dsWeb = ((wrangler.match(/^\s*GITA_DIA_CHI_WEB\s*=\s*"([^"]*)"/m) || [])[1] || '')
  .split(',').map(s => s.trim().replace(/\/+$/, '')).filter(Boolean);
if (!dsWeb.length) warn('wrangler.toml chưa đặt GITA_DIA_CHI_WEB — Worker trả CORS "*"');
else {
  ok('GITA_DIA_CHI_WEB: ' + dsWeb.join(', '));
  if (dsWeb.includes('null')) fail('GITA_DIA_CHI_WEB không được chứa origin "null"');
  if (fs.existsSync(path.join(ROOT, 'CNAME'))) {
    const tenMien = doc('CNAME').trim();
    const goc = 'https://' + tenMien;
    if (dsWeb.includes(goc)) ok('Origin CNAME ' + goc + ' nằm trong GITA_DIA_CHI_WEB');
    else fail('Origin CNAME ' + goc + ' KHÔNG nằm trong GITA_DIA_CHI_WEB (wrangler.toml) — web sẽ bị chặn CORS');
    if (!/^www\./.test(tenMien) && !dsWeb.includes('https://www.' + tenMien))
      warn('GITA_DIA_CHI_WEB chưa có https://www.' + tenMien);
  }
}

/* 7. Gọi thử máy chủ */
log('\n7. Gọi thử máy chủ');
if (api) {
  const r = chay('curl -sfL ' + JSON.stringify(api) + ' --max-time 8 || true');
  const out = typeof r === 'string' ? r : (r.out || '');
  if (out.includes('"ok":true')) ok('Máy chủ trả về ok');
  else warn('Không gọi được máy chủ tại ' + api + ' (có thể chưa triển khai hoặc cần mạng)');
} else {
  warn('Bỏ qua gọi thử vì chưa có API_CAP_PHEP');
}

/* 8. Git */
log('\n8. Git');
const status = chay('git status --short');
const statusStr = typeof status === 'string' ? status : status.out;
if (!statusStr.trim()) ok('Không có thay đổi chưa commit');
else warn('Có thay đổi chưa commit — xem git status');

log('\n' + '='.repeat(48));
if (loi === 0 && canhBao === 0) {
  log('SẴN SÀNG triển khai.');
  process.exit(0);
}
if (loi === 0) {
  log('SẴN SÀNG với ' + canhBao + ' cảnh báo.');
  process.exit(0);
}
log('CHƯA SẴN SÀNG: ' + loi + ' lỗi, ' + canhBao + ' cảnh báo.');
process.exit(1);
