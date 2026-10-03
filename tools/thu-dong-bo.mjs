/* GITA 365 — THỬ ĐỒNG BỘ · KHOANG · TỰ CHỮA (chạy không cần Cloudflare)
   D1 giả = node:sqlite trong RAM, R2 giả = Map. Cần Node >= 22.5.
   Dùng: node tools/thu-dong-bo.mjs   (CI chạy ở mỗi PR) */
import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import { pathToFileURL, fileURLToPath } from 'node:url';
const ROOT = process.argv[2] || fileURLToPath(new URL('..', import.meta.url)).replace(/[\\/]$/, '');
const imp = p => import(pathToFileURL(ROOT + '/may-chu/' + p).href);
const { dongBo, quetSaoLuuMoCoi } = await imp('dong-bo.js');
const { veChiPhi, _xoaBoDem } = await imp('ve-chi-phi.js');
const worker = (await imp('worker.js')).default;

const sq = new DatabaseSync(':memory:');
sq.exec(fs.readFileSync(ROOT + '/may-chu/csdl.sql', 'utf8'));
let ghi = 0;
const db = { prepare(sql) { let a = []; const st = {
  bind(...x) { a = x; return st; },
  first() { const r = sq.prepare(sql).get(...a); return Promise.resolve(r || null); },
  all() { return Promise.resolve({ results: sq.prepare(sql).all(...a) }); },
  run() { ghi++; const r = sq.prepare(sql).run(...a); return Promise.resolve({ meta: { changes: Number(r.changes) } }); } }; return st; } };

let et = 0; const m = new Map(); let r2put = 0; let chen = null;
const kho = {
  async get(k) { const o = m.get(k); return o ? { etag: o.etag, text: async () => Buffer.from(o.v).toString('utf8'), arrayBuffer: async () => new Uint8Array(Buffer.from(o.v)).buffer } : null; },
  async head(k) { return m.has(k) ? { key: k } : null; },
  async put(k, v, op) { r2put++;
    if (chen && k.startsWith('hoso/')) { const f = chen; chen = null; await f(); }
    const o = m.get(k); if (op && op.onlyIf && op.onlyIf.etagMatches && (!o || o.etag !== op.onlyIf.etagMatches)) return null;
    m.set(k, { v: typeof v === 'string' ? v : Buffer.from(v), etag: 'e' + (++et), up: new Date() }); return {}; },
  async delete(k) { m.delete(k); },
  async list({ prefix, limit, cursor }) { const ks = [...m.keys()].filter(k => k.startsWith(prefix)).sort();
    const s = cursor ? Number(cursor) : 0; const sl = ks.slice(s, s + limit);
    return { objects: sl.map(k => ({ key: k, uploaded: m.get(k).up })), truncated: s + limit < ks.length, cursor: String(s + limit) }; } };
const env = { HOSO: kho, CSDL: db };
const hs = { uid: 'U1', u: 'an', role: 'R12' };
let loi = 0; const kiem = (t, d) => { console.log((d ? 'OK  ' : 'FAIL ') + t); if (!d) loi++; };

let r = await dongBo({ day: { checks: { a: 1 } }, mocTruong: { 'checks.a': 100 } }, env, db, hs);
kiem('lần đầu ghi', r.ok && r.doi === 1 && m.has('hoso/U1.json'));
ghi = 0; r2put = 0;
r = await dongBo({ day: {} }, env, db, hs);
kiem('kéo thuần: 0 ghi D1, 0 ghi R2', r.ok && ghi === 0 && r2put === 0 && r.keo.checks.a === 1);
r = await dongBo({ day: { checks: { a: 1 } }, mocTruong: { 'checks.a': 100 } }, env, db, hs);
kiem('đẩy lại y hệt: không ghi', r.doi === 0 && ghi === 0);
r = await dongBo({ day: { checks: { b: 2 } }, mocTruong: { 'checks.b': 200 } }, env, db, hs);
const sl = () => sq.prepare('SELECT COUNT(*) n FROM hosoAppSaoLuu').get().n;
kiem('đổi thật: có 1 bản sao lưu', r.doi === 1 && sl() === 1);
r = await dongBo({ day: { checks: { c: 3 } }, mocTruong: { 'checks.c': 300 } }, env, db, hs);
kiem('đổi tiếp trong 30 phút: không sao lưu thêm', sl() === 1 && r.keo.checks.c === 3);
// tranh chấp: một máy khác ghi chen giữa
chen = async () => { await dongBo({ day: { checks: { x: 9 } }, mocTruong: { 'checks.x': 400 } }, env, db, { ...hs }); };
r = await dongBo({ day: { checks: { y: 8 } }, mocTruong: { 'checks.y': 500 } }, env, db, hs);
const cuoi = JSON.parse(String(m.get('hoso/U1.json').v)).duLieu.checks;
kiem('ghi chen: giữ cả x và y', cuoi.x === 9 && cuoi.y === 8);
// mồ côi
m.set('hoso-sao/U1/mocoi.json', { v: '{}', etag: 'z', up: new Date(Date.now() - 2 * 86400e3) });
m.set('hoso-sao/U1/moi.json', { v: '{}', etag: 'z2', up: new Date() });
const q = await quetSaoLuuMoCoi(env, 500);
kiem('quét: xoá mồ côi cũ, giữ mồ côi mới & bản có sổ', !m.has('hoso-sao/U1/mocoi.json') && m.has('hoso-sao/U1/moi.json') && sl() === 1 && m.has(sq.prepare('SELECT khoaTep FROM hosoAppSaoLuu').get().khoaTep));
kiem('quét: kết quả', q.xoa === 1);
// vệ chi phí
_xoaBoDem();
const req = new Request('https://x/', { method: 'POST', headers: { 'CF-Connecting-IP': '1.2.3.4' } });
let chan = null; for (let i = 0; i < 21; i++) chan = await veChiPhi('dangNhap', {}, {}, req, 1000);
kiem('cửa: lượt 21 bị chặn RATE', chan && chan.code === 'RATE');
kiem('cửa: hết cửa sổ thì mở', (await veChiPhi('dangNhap', {}, {}, req, 62000)) === null);
kiem('không có CF-Connecting-IP: không đếm', (await veChiPhi('dangNhap', {}, {}, new Request('https://x/'), 1000)) === null);
kiem('tiết kiệm: đóng việc trả phí', (await veChiPhi('phimGuiViec', {u: 'a'}, { GITA_CHE_DO_TIET_KIEM: '1' }, req)).code === 'TIETKIEM');
kiem('binding trả false thì chặn', (await veChiPhi('docHomNay', {u: 'b'}, { GIOI_HAN: { limit: async () => ({ success: false }) } }, req)).code === 'RATE');
// worker: header mã và expose
const res = await worker.fetch(new Request('https://x/', { method: 'POST', body: JSON.stringify({ fn: 'khongCo' }) }), { CSDL: db, GITA_DIA_CHI_WEB: 'https://gita365.pages.dev' });
kiem('worker: có x-gita-ma + expose', !!res.headers.get('x-gita-ma') && res.headers.get('Access-Control-Expose-Headers') === 'x-gita-ma');
const g = await worker.fetch(new Request('https://x/'), {});
kiem('GET có Cache-Control', g.headers.get('Cache-Control') === 'public, max-age=30');
// ═══ KHOANG ═══
const K = await imp('khoang.js'); const { BAC } = await imp('vai-tro.js');
const mau = { dongBo:'dongbo', phimGuiViec:'phim', crmDanhSach:'crm', ghiPhieuThu:'taichinh', dangNhap:'cua', datKhoang:'cuuhe',
  aiPhanLoai:'ai', hoiChatbot:'ai', docTinCongDong:'congdong', dsTaiKhoan:'taikhoan', docBangGia:'taichinh', bangLuong:'taichinh',
  deXuatThiGiac:'thigiac', napBai:'noidung', soatCuuHe:'cuuhe', doiMatKhau:'cua', docHomNay:'khac' };
kiem('khoang: phân loại mẫu', Object.keys(mau).every(f => { const k = K.khoangCua(f); if (k !== mau[f]) console.log('   ', f, k); return k === mau[f]; }));
const wsrc = fs.readFileSync(ROOT + '/may-chu/worker.js', 'utf8'); const cp = wsrc.slice(wsrc.indexOf('const CAN_PHIEN'), wsrc.indexOf('];', wsrc.indexOf('const CAN_PHIEN')));
const pb = {}; [...cp.matchAll(/'(\w+)'/g)].forEach(x => { const k = K.khoangCua(x[1]); pb[k] = (pb[k] || 0) + 1; }); console.log('    phân bố:', JSON.stringify(pb));
kiem('khoang env: khoá phim', (await K.chanKhoang('phimGuiViec', { GITA_KHOA_KHOANG: 'phim' }, db)).code === 'KHOANG_KHOA' && (await K.chanKhoang('dongBo', { GITA_KHOA_KHOANG: 'phim' }, db)) === null);
kiem('khoang env *: không khoá cửa đăng nhập', (await K.chanKhoang('dangNhap', { GITA_KHOA_KHOANG: '*' }, db)) === null && (await K.chanKhoang('dongBo', { GITA_KHOA_KHOANG: '*' }, db)).code === 'KHOANG_KHOA');
const qt = { uid: 'A', u: 'admin', role: 'R01' }, thuong = { uid: 'B', u: 'b', role: 'R12' };
kiem('datKhoang: người thường bị từ chối', !(await K.datKhoang({ khoang: 'crm', khoa: 1 }, {}, db, thuong, BAC, { ghiNhatKy: async () => {} })).ok);
kiem('datKhoang: không khoá được cửa', !(await K.datKhoang({ khoang: 'cua', khoa: 1 }, {}, db, qt, BAC, { ghiNhatKy: async () => {} })).ok);
kiem('datKhoang: khoá crm', (await K.datKhoang({ khoang: 'crm', khoa: 1, lyDo: 'thử', phut: 10 }, {}, db, qt, BAC, { ghiNhatKy: async () => {} })).ok
  && (await K.chanKhoang('crmDanhSach', {}, db)).code === 'KHOANG_KHOA' && (await K.chanKhoang('dongBo', {}, db)) === null);
const ds = await K.dsKhoang({}, {}, db, qt, BAC); kiem('dsKhoang: thấy crm khoá', ds.ok && ds.ds.find(x => x.khoang === 'crm').khoaApp);
await K.datKhoang({ khoang: 'crm', khoa: 0 }, {}, db, qt, BAC, { ghiNhatKy: async () => {} });
kiem('datKhoang: mở crm', (await K.chanKhoang('crmDanhSach', {}, db)) === null);
for (let i = 0; i < 8; i++) K.ghiLoiKhoang('thuLaiCaiGi', 5000);
kiem('cầu dao: 8 lỗi → tự nghỉ', (await K.chanKhoang('docHomNay', {}, db, 6000)).code === 'KHOANG_NGHI');
kiem('cầu dao: hết 60s → nửa mở', (await K.chanKhoang('docHomNay', {}, db, 66000)) === null);
K._xoaKhoang();
const w2 = await worker.fetch(new Request('https://x/', { method: 'POST', body: JSON.stringify({ fn: 'khongCo' }) }), { CSDL: db, GITA_KHOA_KHOANG: 'khac' });
kiem('worker: khoang khoá trả KHOANG_KHOA', (await w2.json()).code === 'KHOANG_KHOA');
// ═══ TỰ CHỮA ═══
const tep = 'hoso/U1.json', truoc = JSON.parse(String(m.get(tep).v)).duLieu.checks;
const saoKhoa = sq.prepare('SELECT khoaTep FROM hosoAppSaoLuu').get().khoaTep;
kiem('sao lưu đã nén .gz', /\.json\.gz$/.test(saoKhoa));
m.set(tep, { v: '{hỏng', etag: 'h', up: new Date() });
r = await dongBo({ day: {} }, env, db, hs);
kiem('tự chữa tệp hỏng: đồng bộ vẫn chạy + giữ tệp hỏng', r.ok && r.keo.checks && r.keo.checks.a === 1 && [...m.keys()].some(k => k.startsWith('hoso-hong/U1/')));
m.delete(tep);
r = await dongBo({ day: {} }, env, db, hs);
kiem('tự chữa mất tệp: dựng lại từ sao lưu', r.ok && r.keo.checks && r.keo.checks.a === 1 && m.has(tep));
const { tuSoatVaChua } = await imp('tu-chua.js');
m.delete(tep);
const bc = await tuSoatVaChua(env);
kiem('agent đêm: soát + chữa + báo cáo', bc.d1 && bc.r2 && bc.mat === 1 && bc.daChua === 1 && m.has(tep) && m.has('he-thong/suc-khoe.json'));
process.exit(loi ? 1 : 0);
