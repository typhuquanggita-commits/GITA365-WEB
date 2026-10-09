// Thử cụm "xin thêm" của đồng bộ: mỗi nhà chỉ thay được PHẦN CỦA MÌNH.
// Chạy: node tools/thu-xin-them.mjs
//
// Vì sao có: tới 9/10/2026, một gia đình gửi xinthem là ghi đè CẢ khối dùng
// chung — lời xin của mọi nhà khác biến mất, và gửi {du:[]} là xoá sạch sổ.
// Bộ thử này đo HÀNH VI qua cửa dongBo thật, không đọc mã đoán.
import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import { pathToFileURL, fileURLToPath } from 'node:url';
const ROOT = fileURLToPath(new URL('..', import.meta.url)).replace(/[\\/]$/, '');
const { dongBo } = await import(pathToFileURL(ROOT + '/may-chu/dong-bo.js').href);

const sq = new DatabaseSync(':memory:');
sq.exec(fs.readFileSync(ROOT + '/may-chu/csdl.sql', 'utf8'));
const db = { prepare(sql) { let a = []; const st = {
  bind(...x) { a = x; return st; },
  first() { return Promise.resolve(sq.prepare(sql).get(...a) || null); },
  all() { return Promise.resolve({ results: sq.prepare(sql).all(...a) }); },
  run() { const r = sq.prepare(sql).run(...a); return Promise.resolve({ meta: { changes: Number(r.changes) } }); } }; return st; } };
const m = new Map(); let et = 0;
const kho = {
  async get(k) { const o = m.get(k); return o ? { etag: o.etag, text: async () => o.v, arrayBuffer: async () => new TextEncoder().encode(o.v).buffer } : null; },
  async head(k) { return m.has(k) ? { key: k } : null; },
  async put(k, v, op) { const o = m.get(k); if (op && op.onlyIf && op.onlyIf.etagMatches && (!o || o.etag !== op.onlyIf.etagMatches)) return null; m.set(k, { v: String(v), etag: 'e' + (++et), up: new Date() }); return {}; },
  async delete(k) { m.delete(k); },
  async list({ prefix }) { return { objects: [...m.keys()].filter(k => k.startsWith(prefix)).map(k => ({ key: k, uploaded: m.get(k).up })), truncated: false }; } };
const env = { HOSO: kho, CSDL: db };

for (const [id, u, role, ma] of [['UA', 'nhaa', 'R13', 'GITA-A'], ['UB', 'nhab', 'R13', 'GITA-B'], ['UT', 'tuvan', 'R09', '']])
  sq.prepare('INSERT INTO users (id, username, role, maKhachHang) VALUES (?,?,?,?)').run(id, u, role, ma || null);
const A = { uid: 'UA', u: 'nhaa', role: 'R13' }, B = { uid: 'UB', u: 'nhab', role: 'R13' }, T = { uid: 'UT', u: 'tuvan', role: 'R09' };
const soCu = () => JSON.parse((sq.prepare("SELECT du FROM caiDat WHERE cum='xinthem'").get() || { du: '[]' }).du);

let sai = 0; const kiem = (t, d, ct) => { console.log((d ? '  ✓ ' : '  ✗ ') + t + (d || !ct ? '' : ' — ' + ct)); if (!d) sai++; };

await dongBo({ day: {}, caiDat: { xinthem: { luc: 10, du: [{ nha: 'GITA-A', ma: 'a1' }] } } }, env, db, A);
await dongBo({ day: {}, caiDat: { xinthem: { luc: 20, du: [{ nha: 'GITA-B', ma: 'b1' }] } } }, env, db, B);
let s = soCu();
kiem('Nhà B gửi lời xin không xoá lời xin của nhà A', s.some(x => x.ma === 'a1') && s.some(x => x.ma === 'b1'), JSON.stringify(s));

await dongBo({ day: {}, caiDat: { xinthem: { luc: 30, du: [] } } }, env, db, B);
s = soCu();
kiem('Nhà B gửi danh sách rỗng chỉ xoá phần của B, phần A còn nguyên', s.some(x => x.ma === 'a1') && !s.some(x => x.ma === 'b1'), JSON.stringify(s));

await dongBo({ day: {}, caiDat: { xinthem: { luc: 40, du: [{ nha: 'GITA-A', ma: 'gia-mao' }, { nha: 'GITA-B', ma: 'b2' }] } } }, env, db, B);
s = soCu();
kiem('Nhà B không chèn được dòng mang mã nhà A', !s.some(x => x.ma === 'gia-mao') && s.some(x => x.ma === 'b2') && s.some(x => x.ma === 'a1'), JSON.stringify(s));

const r = await dongBo({ day: {} }, env, db, A);
const thay = (r.caiDat && r.caiDat.xinthem && r.caiDat.xinthem.du) || [];
kiem('Nhà A chỉ đọc được phần của mình', thay.length === 1 && thay[0].ma === 'a1', JSON.stringify(thay));

await dongBo({ day: {}, caiDat: { xinthem: { luc: 50, du: [{ nha: 'GITA-A', ma: 'a1' }] } } }, env, db, T);
s = soCu();
kiem('Đội ngũ (R09) vẫn ghi được cả khối như trước', s.length === 1 && s[0].ma === 'a1', JSON.stringify(s));

console.log(sai ? `\n✗ ${sai} phép đo sai` : '\n✓ Xin thêm: mỗi nhà chỉ chạm phần của mình');
process.exit(sai ? 1 : 0);
