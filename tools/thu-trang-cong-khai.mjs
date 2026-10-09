#!/usr/bin/env node
/*
GITA 365 — THỬ TRANG CÔNG KHAI (đo, không khai)

Dựng lại ĐÚNG thư mục được đưa lên Cloudflare Pages bằng tools/dung-site.sh
(chung một danh sách trắng với deploy.yml), rồi soát:
  1. Mọi tệp nội bộ mà trang HTML nạp (script src, link href, img src) có mặt.
  2. Mọi tệp service worker cất sẵn (FILES trong sw.js) có mặt — thiếu một
     tệp thì addAll() hỏng và cả bản chạy ngoại tuyến không cài được.
  3. Mọi biểu tượng trong manifest.webmanifest có mặt.
  4. Không lọt thứ không được công khai: mã máy chủ, công cụ, khoá, zip.

Vì sao có: 9/10/2026, năm trang giới thiệu nạp src/i18n-marketing.js mà
deploy không chép src/ → trang thật trả 404. Mọi bộ kiểm khác đọc kho mã,
không đọc cái thư mục thật sự lên mạng, nên không bộ nào thấy.

Dùng: node tools/thu-trang-cong-khai.mjs
*/
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const RA = fs.mkdtempSync(path.join(os.tmpdir(), 'gita-site-'));
let dat = 0, sai = 0;
function kiem(ten, ok, chiTiet) {
  if (ok) { dat++; console.log('  ✓ ' + ten); }
  else { sai++; console.log('  ✗ ' + ten + (chiTiet ? ' — ' + chiTiet : '')); }
}

try {
  execFileSync('bash', [path.join(ROOT, 'tools/dung-site.sh'), RA], { cwd: ROOT, stdio: 'pipe' });
} catch (e) {
  console.log('✗ tools/dung-site.sh hỏng: ' + String(e.stderr || e.message).slice(0, 400));
  process.exit(1);
}

const coMat = rel => fs.existsSync(path.join(RA, rel.replace(/^\.?\//, '').split(/[?#]/)[0]));
const laNoiBo = u => u && !/^(?:[a-z][a-z0-9+.-]*:|\/\/|#|\{)/i.test(u) && !u.includes('${');

/* 1. Tham chiếu trong HTML */
const thieu = [];
for (const f of fs.readdirSync(RA).filter(x => x.endsWith('.html'))) {
  const s = fs.readFileSync(path.join(RA, f), 'utf8');
  const re = /<(?:script|img|link|source)\b[^>]*?\s(?:src|href)\s*=\s*"([^"]+)"/gi;
  let m;
  while ((m = re.exec(s))) {
    const u = m[1].trim();
    if (laNoiBo(u) && !coMat(u)) thieu.push(f + ' → ' + u);
  }
}
kiem('Mọi tệp nội bộ mà trang HTML nạp đều có trong thư mục công khai', !thieu.length, thieu.slice(0, 8).join(' · '));

/* 2. Service worker */
const sw = fs.readFileSync(path.join(RA, 'sw.js'), 'utf8');
const khoi = ((sw.match(/const FILES\s*=\s*\[([\s\S]*?)\];/) || [])[1] || '')
  .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');  // chú giải có thể chứa chữ trong ngoặc kép
const swTep = [...khoi.matchAll(/['"]([^'"]+)['"]/g)].map(x => x[1]).filter(u => u !== './');
const swThieu = swTep.filter(u => !coMat(u));
kiem('sw.js cất sẵn ' + swTep.length + ' tệp, tệp nào cũng có mặt', swTep.length > 0 && !swThieu.length, swThieu.join(' · ') || 'không đọc được FILES');

/* 3. Manifest */
const mf = JSON.parse(fs.readFileSync(path.join(RA, 'manifest.webmanifest'), 'utf8'));
const icon = [].concat(mf.icons || [], ...(mf.shortcuts || []).map(x => x.icons || [])).map(x => x.src);
const mfThieu = icon.filter(u => laNoiBo(u) && !coMat(u));
kiem('Biểu tượng trong manifest đều có mặt (' + icon.length + ')', !mfThieu.length, mfThieu.join(' · '));

/* 4. Không lọt thứ nội bộ */
const lot = [];
(function di(d) {
  for (const x of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, x.name), rel = path.relative(RA, p);
    if (x.isDirectory()) { if (/^(may-chu|tools|server|desktop|docs|kho-goc|giay-phep|xuong-|\.github|\.claude)/.test(rel)) lot.push(rel + '/'); else di(p); continue; }
    if (/\.(zip|gita|pem|key|p12|pfx|sql|gs|py|ipynb|sh)$/i.test(x.name) || /^(\.env|\.dev\.vars|khoa\.json|PHIEU-QUYET\.md)/.test(x.name)) lot.push(rel);
  }
})(RA);
kiem('Không lọt mã máy chủ, công cụ, khoá hay tệp nén lên trang công khai', !lot.length, lot.slice(0, 8).join(' · '));

fs.rmSync(RA, { recursive: true, force: true });
console.log(`\n${dat} đạt · ${sai} sai`);
process.exit(sai ? 1 : 0);
