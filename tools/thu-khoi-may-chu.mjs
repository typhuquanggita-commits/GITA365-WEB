/* Thử KHÓI toàn bộ cửa máy chủ — gọi từng cửa đã khai trong worker.js trên
   một D1 giả (node:sqlite, lược đồ thật csdl.sql + vài dòng mẫu) bằng phiên
   Super Admin, rồi bắt mọi lỗi SQL: bảng không có, cột không có, sai cú pháp.
   Đây là lớp lỗi "đứt gãy ngầm" — cửa vẫn khai, nút vẫn bấm, nhưng mỗi lần
   bấm là một lỗi 500 im lặng.

   Không gọi mạng (fetch bị chặn), không đụng khoá thật. Lỗi nghiệp vụ (thiếu
   tham số, sai quyền) KHÔNG tính là hỏng — chỉ lỗi SQL mới tính.
   Dùng: node tools/thu-khoi-may-chu.mjs [--chi-tiet]   (Node >= 22.5) */
import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import { pathToFileURL, fileURLToPath } from 'node:url';
const ROOT = process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : fileURLToPath(new URL('..', import.meta.url)).replace(/[\\/]$/, '');
const CHI_TIET = process.argv.includes('--chi-tiet');

globalThis.fetch = async () => { throw new Error('KHONG_MANG'); };
const sq = new DatabaseSync(':memory:');
sq.exec(fs.readFileSync(ROOT + '/may-chu/csdl.sql', 'utf8'));
const db = {
  /* Như D1: lỗi SQL là LỜI HỨA BỊ TỪ CHỐI (để .catch() của mã gốc bắt được), không ném ngay. */
  prepare(sql) { let a = []; const hua = f => { try { return Promise.resolve(f()); } catch (e) { return Promise.reject(e); } }; const st = {
    bind(...x) { a = x; return st; },
    first(col) { return hua(() => { const r = sq.prepare(sql).get(...a) || null; return col && r ? r[col] : r; }); },
    all() { return hua(() => ({ results: sq.prepare(sql).all(...a) })); },
    raw() { return hua(() => sq.prepare(sql).all(...a).map(o => Object.values(o))); },
    run() { return hua(() => { const r = sq.prepare(sql).run(...a); return { meta: { changes: Number(r.changes), last_row_id: Number(r.lastInsertRowid) } }; }); } }; return st; },
  async batch(ds) { const ra = []; for (const st of ds) ra.push(await st.run()); return ra; },
  async exec(s) { sq.exec(s); return {}; }
};
/* dữ liệu mẫu tối thiểu */
const chay = s => { try { sq.exec(s); } catch (e) { /* bảng có thể khác cột — bỏ qua dòng mẫu ấy */ } };
chay("INSERT INTO users (id, username, role, active, maKhachHang, phongBan) VALUES ('A1','chu','R01',1,NULL,'KD'),('C1','coach1','R07',1,NULL,'CM'),('P1','ph1','R13',1,'K1',NULL)");
chay("INSERT INTO hoSoKhach (maKhachHang, uidPhuHuynh, tang, coach, tuVan) VALUES ('K1','P1',2,'coach1','tv1')");
chay("INSERT INTO students (id, tenHocVien, tier, uidPhuHuynh) VALUES ('HV1','An',2,'P1')");

/* cửa → hàm: đọc thẳng worker.js */
const w = fs.readFileSync(ROOT + '/may-chu/worker.js', 'utf8');
const nhap = {};
for (const m of w.matchAll(/import\s*\{([^}]*)\}\s*from\s*'\.\/([^']+)'/g)) {
  for (const p of m[1].split(',').map(x => x.trim()).filter(Boolean)) {
    const [goc, bi] = p.split(/\s+as\s+/).map(x => x.trim());
    nhap[bi || goc] = { tep: m[2], ten: goc };
  }
}
for (const m of w.matchAll(/import\s+\*\s+as\s+(\w+)\s+from\s+'\.\/([^']+)'/g)) nhap[m[1]] = { tep: m[2], ns: true };
const cua = [...w.matchAll(/if \(fn === '([A-Za-z0-9_]+)'\)\s*return await ([A-Za-z0-9_.]+)\(([^)]*)\)/g)].map(m => ({ fn: m[1], goi: m[2], doi: m[3].split(',').map(x => x.trim()) }));
const MO = {};
async function mod(tep) { if (!MO[tep]) MO[tep] = await import(pathToFileURL(ROOT + '/may-chu/' + tep).href); return MO[tep]; }
const { BAC } = await mod('vai-tro.js');
const { Kho } = await mod('nen.js');

const HO_DS = [{ u: 'chu', uid: 'A1', role: 'R01', maKhachHang: '' }, { u: 'coach1', uid: 'C1', role: 'R07', maKhachHang: '' }, { u: 'ph1', uid: 'P1', role: 'R13', maKhachHang: 'K1' }];
const Y = { maNha: 'K1', maKhachHang: 'K1', maKH: 'K1', nha: 'K1', username: 'coach1', u: 'coach1', id: 'X1', thang: '2026-10', ngay: 30, tuyen: 'GITA365', tang: 2, maHocVien: 'HV1' };
const SQLLOI = /no such (table|column)|syntax error|SQLITE_ERROR|ambiguous column|has no column|misuse of aggregate|NOT NULL constraint failed/i;
const hong = [], khac = [], khongTim = [];
let daGoi = 0;
for (const HO of HO_DS) for (const c of cua) {
  const [goc, thuoc] = c.goi.split('.');
  const nguon = nhap[goc];
  if (!nguon) { if (new RegExp('function\\s+' + goc + '\\s*\\(').test(w)) continue;   /* hàm viết ngay trong worker.js */
    khongTim.push(c.fn + ' → ' + c.goi); continue; }
  let f;
  try { const M = await mod(nguon.tep); f = thuoc ? M[thuoc] : (nguon.ns ? null : M[nguon.ten]); } catch (e) { khac.push(c.fn + ': nạp ' + nguon.tep + ' — ' + e.message); continue; }
  if (typeof f !== 'function') { khongTim.push(c.fn + ' → ' + c.goi); continue; }
  const doi = c.doi.map(d => ({ y: { ...Y }, env: {}, db, hoSo: HO, BAC, Kho, CAN_PHIEN: [] })[d]);
  daGoi++;
  try {
    await Promise.race([f(...doi), new Promise((_, r) => setTimeout(() => r(new Error('QUA_GIO')), 4000))]);
  } catch (e) {
    const m = String(e && e.message || e);
    if (SQLLOI.test(m)) { const k = c.fn + ' (' + nguon.tep + '): ' + m.slice(0, 140); if (!hong.includes(k)) hong.push(k); }
    else if (CHI_TIET && !/KHONG_MANG|QUA_GIO/.test(m)) { const k = c.fn + ' [' + HO.role + ']: ' + m.slice(0, 120); if (!khac.includes(k)) khac.push(k); }
  }
}
console.log('Đã gọi ' + daGoi + ' lượt (' + cua.length + ' cửa × 3 vai: Super Admin · Coach · Phụ huynh).');
if (khongTim.length) console.log('\nKHÔNG TÌM THẤY HÀM (' + khongTim.length + '):\n  ' + khongTim.join('\n  '));
console.log('\nLỖI SQL (' + hong.length + '):' + (hong.length ? '\n  ' + hong.join('\n  ') : ' không có'));
if (CHI_TIET && khac.length) console.log('\nLỖI KHÁC (' + khac.length + '):\n  ' + khac.join('\n  '));
process.exit(hong.length || khongTim.length ? 1 : 0);
