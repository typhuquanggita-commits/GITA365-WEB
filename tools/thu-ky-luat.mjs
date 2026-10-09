/* GITA 365 — KỶ LUẬT KHO MÃ (cổng CI)

   Luật máy kiểm được thì máy kiểm — không viết thành lời dặn rồi mong người
   (hay trợ lý AI) nhớ. Mỗi luật dưới đây sinh ra từ một lần hỏng thật:

   K1  Mọi cửa trong CAN_PHIEN có nhánh xử lý `if (fn === '…')` trong
       worker.js, và không cửa nào khai hai lần. (Cửa khai mà không có nhánh
       = nút bấm trả lỗi im lặng.)
   K2  Mã app src/*.js giữ ES5: không `=>`, `let`, `const`, `class`,
       `async function`. (Bản cài trên máy cũ và một số webview chạy ES5.)
   K3  Không còn dấu gỡ lỗi tạm `[DEBUG-xxxx]` trong src/ và may-chu/ —
       đẩy lên main là triển khai thật.
   K4  .gitignore còn đủ các dòng chặn tài sản mật (kho-goc/, kho/khoa.json,
       giay-phep/, *.gita). Ngày 05/10/2026 một lượt "Add files via upload"
       đã ghi đè .gitignore bằng tệp của dự án khác và làm mất các dòng này.
   K5  LICENSE vẫn là giấy phép độc quyền GITA 365 — cùng lượt tải lên ấy đã
       thay nó bằng giấy phép MIT của Meituan.
   K6  Không tệp nào trong kho mã khai gói PyPI đã bị cách ly vì mã độc
       (tritonserverclient) hay tên gói chưa ai sở hữu (libsndfile1).
   K7  CSP của index.html không mở cửa cho mọi *.workers.dev / *.pages.dev —
       chỉ Worker thuộc tài khoản của Học viện.
   K8  Workflow GitHub chỉ dùng action đã GHIM theo mã commit (40 ký tự).

   Dùng: node tools/thu-ky-luat.mjs */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const doc = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
let dat = 0, truot = 0;
const kiem = (ten, dk, chiTiet) => { if (dk) { dat++; console.log('OK  ' + ten); } else { truot++; console.log('SAI ' + ten + (chiTiet ? '\n    ' + chiTiet : '')); } };

/* K1 */
const w = doc('may-chu/worker.js');
const khoi = w.match(/const CAN_PHIEN = \[([\s\S]*?)\];/);
const can = khoi ? [...khoi[1].replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/'([A-Za-z0-9_]+)'/g)].map(m => m[1]) : [];
const nhanh = new Set([...w.matchAll(/if \(fn === '([A-Za-z0-9_]+)'\)/g)].map(m => m[1]));
const thieu = can.filter(f => !nhanh.has(f));
const trung = can.filter((f, i) => can.indexOf(f) !== i);
kiem('K1 · ' + can.length + ' cửa CAN_PHIEN đều có nhánh xử lý, không khai trùng', can.length > 50 && !thieu.length && !trung.length,
  (thieu.length ? 'thiếu nhánh: ' + thieu.join(', ') : '') + (trung.length ? ' · khai trùng: ' + [...new Set(trung)].join(', ') : ''));

/* K2 — bỏ chú thích và chuỗi rồi mới soi, để chữ "let" trong câu tiếng Anh không bị bắt nhầm */
function boChuThichChuoi(s) {
  let o = '', i = 0;
  while (i < s.length) {
    const c = s[i], d = s[i + 1];
    if (c === '/' && d === '*') { const j = s.indexOf('*/', i + 2); i = j < 0 ? s.length : j + 2; o += ' '; continue; }
    if (c === '/' && d === '/') { const j = s.indexOf('\n', i); i = j < 0 ? s.length : j; continue; }
    if (c === '"' || c === "'" || c === '`') {
      let j = i + 1;
      while (j < s.length && s[j] !== c) { if (s[j] === '\\') j++; if (s[j] === '\n' && c !== '`') break; j++; }
      i = j + 1; o += '""'; continue;
    }
    o += c; i++;
  }
  return o;
}
const viPham = [];
for (const f of fs.readdirSync(path.join(ROOT, 'src')).filter(x => x.endsWith('.js'))) {
  const s = boChuThichChuoi(doc('src/' + f));
  const dong = s.split('\n');
  dong.forEach((l, i) => {
    if (/=>/.test(l) || /(^|[^\w$.])(let|const)\s+[A-Za-z_$[{]/.test(l) || /(^|[^\w$.])class\s+[A-Za-z_$]/.test(l) || /\basync\s+function\b/.test(l))
      viPham.push(f + ':' + (i + 1));
  });
}
kiem('K2 · mã app src/*.js giữ ES5 (không =>, let, const, class, async)', !viPham.length, viPham.slice(0, 8).join(' · '));

/* K3 */
const goLoi = [];
for (const thu of ['src', 'may-chu']) for (const f of fs.readdirSync(path.join(ROOT, thu)).filter(x => /\.(js|mjs)$/.test(x))) {
  doc(thu + '/' + f).split('\n').forEach((l, i) => { if (/\[DEBUG-[0-9a-z]{3,}\]/i.test(l)) goLoi.push(thu + '/' + f + ':' + (i + 1)); });
}
kiem('K3 · không còn dấu gỡ lỗi tạm [DEBUG-…] trong src/ và may-chu/', !goLoi.length, goLoi.join(' · '));

/* K4 */
const gi = doc('.gitignore').split('\n').map(x => x.trim());
const canCo = ['kho-goc/', 'kho/khoa.json', 'giay-phep/', '*.gita', '*.bien-nhan.txt', '.dev.vars', '.env', '*.pem', '*.key', '.wrangler/'];
const mat = canCo.filter(x => !gi.includes(x));
kiem('K4 · .gitignore còn đủ dòng chặn tài sản mật', !mat.length, 'thiếu: ' + mat.join(', '));
let lot = [];
try { lot = execFileSync('git', ['ls-files', 'kho/khoa.json', 'kho-goc', 'giay-phep'], { cwd: ROOT, encoding: 'utf8' }).split('\n').filter(Boolean); } catch (e) {}
kiem('K4 · không tệp khoá / nội dung gốc nào đang nằm trong git', !lot.length, lot.slice(0, 5).join(', '));

/* K5 */
const lic = doc('LICENSE');
kiem('K5 · LICENSE là giấy phép độc quyền GITA 365', /GITA 365/.test(lic.slice(0, 200)) && !/MIT License/.test(lic.slice(0, 200)));

/* K6 */
let tepDs = [];
try { tepDs = execFileSync('git', ['ls-files'], { cwd: ROOT, encoding: 'utf8' }).split('\n').filter(f => /(^|\/)requirements[^/]*\.txt$|\.ipynb$|\.py$/.test(f)); } catch (e) {}
const goiXau = [];
for (const f of tepDs) { if (!fs.existsSync(path.join(ROOT, f))) continue; const s = doc(f); if (/\btritonserverclient\b|^\s*libsndfile1\s*==/m.test(s)) goiXau.push(f); }
kiem('K6 · không khai gói PyPI bị cách ly / tên gói trống (' + tepDs.length + ' tệp Python & requirements)', !goiXau.length, goiXau.join(', '));

/* K7 */
const csp = (doc('index.html').match(/Content-Security-Policy" content="([^"]+)"/) || [])[1] || '';
kiem('K7 · CSP không mở cho mọi *.workers.dev / *.pages.dev', !!csp && !/https:\/\/\*\.workers\.dev/.test(csp) && !/https:\/\/\*\.pages\.dev/.test(csp));
/* cdn.jsdelivr.net và cdnjs phục vụ mã của BẤT KỲ ai (mọi gói npm, mọi kho GitHub).
   Mở cả tên miền là cho một lỗ chèn mã đi vòng qua CSP — chỉ được mở đúng thư mục. */
const cdnTran = csp.split(/[\s;]+/).filter(x => /^https:\/\/(cdn\.jsdelivr\.net|cdnjs\.cloudflare\.com)\/?$/.test(x));
kiem('K7 · CSP không mở trọn cdn.jsdelivr.net / cdnjs (chỉ đúng thư mục thư viện)', !!csp && !cdnTran.length, cdnTran.join(' '));

/* K8 */
const khongGhim = [];
for (const f of fs.readdirSync(path.join(ROOT, '.github/workflows')).filter(x => /\.ya?ml$/.test(x))) {
  doc('.github/workflows/' + f).split('\n').forEach((l, i) => {
    const m = l.match(/uses:\s*([^\s#]+)/);
    if (m && !m[1].startsWith('./') && !/@[0-9a-f]{40}$/.test(m[1])) khongGhim.push(f + ':' + (i + 1) + ' ' + m[1]);
  });
}
kiem('K8 · mọi action trong workflow đã ghim theo mã commit', !khongGhim.length, khongGhim.slice(0, 6).join(' · '));

console.log('\n' + dat + ' đạt · ' + truot + ' sai');
process.exit(truot ? 1 : 0);
