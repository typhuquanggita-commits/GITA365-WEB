/* Thử LIÊN KẾT — tìm chỗ "đứt gãy" giữa app và máy chủ, giữa màn và màn.
     1. Mọi G.goiMayChu('cửa') trong src/ trỏ vào cửa CÓ THẬT ở worker.js
        (CAN_PHIEN hoặc cửa công khai đứng trước cổng phiên).
     2. Mọi nút data-v="màn" và G.go('màn') viết thẳng tên trong src/ trỏ vào
        màn CÓ THẬT (đăng ký G.VIEWS, mục cột trái, hoặc màn của gói nghề).
     3. Mọi phần của 15 màn chính (src/v50-man.js) là màn có thật.
   Dùng: node tools/thu-lien-ket.mjs */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const doc = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
let dat = 0, truot = 0;
const kiem = (ten, dk, ct) => { if (dk) { dat++; console.log('OK  ' + ten); } else { truot++; console.log('SAI ' + ten + (ct ? '\n    ' + ct : '')); } };

const w = doc('may-chu/worker.js');
const khoi = w.match(/const CAN_PHIEN = \[([\s\S]*?)\];/);
const cua = new Set(khoi ? [...khoi[1].replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/'([A-Za-z0-9_]+)'/g)].map(m => m[1]) : []);
for (const m of w.matchAll(/if \(fn === '([A-Za-z0-9_]+)'\)/g)) cua.add(m[1]);

const tep = fs.readdirSync(path.join(ROOT, 'src')).filter(f => f.endsWith('.js'));
const nguon = Object.fromEntries(tep.map(f => [f, doc('src/' + f)]));

/* 1 · cửa máy chủ */
const thieuCua = [];
for (const [f, s] of Object.entries(nguon)) for (const m of s.matchAll(/goiMayChu\(\s*'([A-Za-z0-9_]+)'/g)) if (!cua.has(m[1])) thieuCua.push(f + ' → ' + m[1]);
kiem('mọi lệnh gọi máy chủ trong app trỏ vào cửa có thật (' + cua.size + ' cửa)', !thieuCua.length, [...new Set(thieuCua)].join(' · '));

/* 2 · màn */
const man = new Set();
for (const s of Object.values(nguon)) {
  for (const m of s.matchAll(/G\.VIEWS\[\s*['"]([a-z0-9-]+)['"]\s*\]\s*=/g)) man.add(m[1]);
  for (const m of s.matchAll(/\{v:'([a-z0-9-]+)'/g)) man.add(m[1]);
}
const G = { VIEWS: {}, U: { h: s => String(s), ic: () => '' } };
const ctx = { window: { G }, G, console, localStorage: { getItem: () => null, setItem() {}, removeItem() {} }, document: { addEventListener() {} } };
vm.createContext(ctx);
for (const f of ['src/data.core.js', 'src/data-v50.js', 'src/v50-man.js']) vm.runInContext(doc(f), ctx, { filename: f });
(G.MAN_NGHE || []).forEach(v => man.add(v));
/* màn dựng theo vòng lặp (bảng điều khiển theo vai, coach-*, nghe-*, va-*, gd-*, kn-*): nhận theo tiền tố đã đăng ký */
const TIEN_TO = /^(dk|va|gd|kn|coach|nghe)-/;
const thieuMan = [];
for (const [f, s] of Object.entries(nguon)) {
  for (const m of s.matchAll(/data-v="([a-z0-9-]+)"/g)) if (!man.has(m[1]) && !TIEN_TO.test(m[1])) thieuMan.push(f + ' → ' + m[1]);
  for (const m of s.matchAll(/G\.go\(\s*'([a-z0-9-]+)'\s*\)/g)) if (!man.has(m[1]) && !TIEN_TO.test(m[1])) thieuMan.push(f + ' → ' + m[1]);
}
kiem('mọi nút chuyển màn viết thẳng tên trỏ vào màn có thật', !thieuMan.length, [...new Set(thieuMan)].slice(0, 30).join(' · '));

/* 3 · phần của màn chính */
const thieuPhan = [];
G.V50M.HUB.forEach(h => h.phan.forEach(v => { if (!man.has(v) && !TIEN_TO.test(v)) thieuPhan.push(h.id + ' → ' + v); }));
kiem('mọi phần của 15 màn chính là màn có thật', !thieuPhan.length, thieuPhan.join(' · '));

console.log('\n' + dat + ' đạt · ' + truot + ' sai');
process.exit(truot ? 1 : 0);
