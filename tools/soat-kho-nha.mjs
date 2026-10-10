/* Soát + ghép nguồn kho Ngôi nhà thịnh vượng trước khi đóng gói.

   Thư mục nguồn chứa:
     CN-<ô>.cap1.json · CN-<ô>.cap2.json · CN-<ô>.cap3.json   (cẩm nang ba cấp)
     NV-<ô>-<nn>.json                                       (một nhiệm vụ)
   Công cụ ghép ba tệp cấp thành CN-<ô>.json rồi chạy đúng bộ soát của máy
   chủ (soatCamNang · soatNhiemVu) — một bản soát, không chép luật sang đây.

   Dùng:  node tools/soat-kho-nha.mjs <thư-mục>            soát cả thư mục
          node tools/soat-kho-nha.mjs <thư-mục> CN-NEN     chỉ một mục */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url)).replace(/[\\/]$/, '');
const K = await import(pathToFileURL(path.join(ROOT, 'may-chu', 'kho-nhiem-vu.js')).href);
const dir = process.argv[2], chi = process.argv[3] || '';
if (!dir || !fs.existsSync(dir)) { console.log('Dùng: node tools/soat-kho-nha.mjs <thư-mục> [mã]'); process.exit(2); }

function chu(v) {
  if (typeof v === 'string') return v.length;
  if (Array.isArray(v)) return v.reduce((s, x) => s + chu(x), 0);
  if (v && typeof v === 'object') return Object.keys(v).reduce((s, k) => s + chu(v[k]), 0);
  return 0;
}
const doc = f => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
let loi = 0, dat = 0;
const tep = fs.readdirSync(dir).sort();

const oCN = [...new Set(tep.map(f => (/^CN-([A-Z0-9]+)\.cap[123]\.json$/.exec(f) || [])[1]).filter(Boolean))];
for (const o of oCN) {
  const ma = 'CN-' + o;
  if (chi && chi !== ma) continue;
  const thieu = [1, 2, 3].filter(n => !fs.existsSync(path.join(dir, ma + '.cap' + n + '.json')));
  if (thieu.length) { console.log('✗ ' + ma + ': thiếu tệp cấp ' + thieu.join(', ')); loi++; continue; }
  let r;
  try { r = { id: ma, ten: K.O_NHA[o] && K.O_NHA[o].ten, cap1: doc(ma + '.cap1.json'), cap2: doc(ma + '.cap2.json'), cap3: doc(ma + '.cap3.json') }; }
  catch (e) { console.log('✗ ' + ma + ': JSON hỏng — ' + e.message); loi++; continue; }
  const l = K.soatCamNang(r);
  const n1 = chu(r.cap1), n2 = chu(r.cap2), n3 = chu(r.cap3);
  const trang = Math.round((n1 + n2 + n3) / 2500);
  if (l.length) { console.log('✗ ' + ma + ' (' + n1 + ' · ' + n2 + ' · ' + n3 + ' ký tự)\n   ' + l.join('\n   ')); loi++; }
  else { fs.writeFileSync(path.join(dir, ma + '.json'), JSON.stringify(r)); console.log('✓ ' + ma + ' · cấp1 ' + n1 + ' · cấp2 ' + n2 + ' · cấp3 ' + n3 + ' (×' + (n3 / n1).toFixed(1) + ') · ~' + trang + ' trang'); dat++; }
}
for (const f of tep.filter(f => /^NV-.+\.json$/.test(f))) {
  if (chi && !f.startsWith(chi)) continue;
  let r;
  try { r = doc(f); } catch (e) { console.log('✗ ' + f + ': JSON hỏng — ' + e.message); loi++; continue; }
  const l = K.soatNhiemVu(r);
  if (l.length) { console.log('✗ ' + f + '\n   ' + l.join('\n   ')); loi++; }
  else { console.log('✓ ' + r.id + ' · ' + chu(r) + ' ký tự'); dat++; }
}
console.log('\n' + dat + ' đạt · ' + loi + ' lỗi');
process.exit(loi ? 1 : 0);
