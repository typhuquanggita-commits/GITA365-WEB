/* Thử Tra cứu giải pháp · 13 mục — D1 giả = node:sqlite, Workers AI giả.
   Chứng minh:
     · chỉ R01–R11 (từ chuyên viên tư vấn) — R12, khách bị chặn ở MÁY CHỦ
     · sổ nhật ký: ghi đủ ô, từ chối tên/số điện thoại gia đình (Điều 13),
       đếm theo kết quả; bài học bắt buộc
     · soạn nháp mục kho chưa có: qua goiTheoLoai, trả bản nháp gắn nhãn,
       KHÔNG ghi vào kho nào
     · cửa nối vào worker, bảng có trong csdl.sql, màn đăng ký đúng quyền
   Dùng: node tools/thu-tra-cuu-giai-phap.mjs   (Node >= 22.5) */
import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import { pathToFileURL, fileURLToPath } from 'node:url';
const ROOT = process.argv[2] || fileURLToPath(new URL('..', import.meta.url)).replace(/[\\/]$/, '');
const T = await import(pathToFileURL(ROOT + '/may-chu/tra-cuu-giai-phap.js').href);

const sq = new DatabaseSync(':memory:');
sq.exec(fs.readFileSync(ROOT + '/may-chu/csdl.sql', 'utf8'));
const db = {
  prepare(sql) { let a = []; const st = {
    bind(...x) { a = x; return st; },
    first() { return Promise.resolve(sq.prepare(sql).get(...a) || null); },
    all() { return Promise.resolve({ results: sq.prepare(sql).all(...a) }); },
    run() { const r = sq.prepare(sql).run(...a); return Promise.resolve({ meta: { changes: Number(r.changes) } }); } }; return st; },
  async batch(ds) { for (const s of ds) await s.run(); }
};
globalThis.fetch = async () => { throw new Error('không gọi mạng ngoài trong bộ thử'); };
const luot = [];
const env = { GITA_DA_TRI_BAT: '1', AI: { async run(m, x) { luot.push(x); return { response: '1) Ngồi cạnh con mười phút mỗi tối. 2) Một câu hỏi mở.' }; } } };
const ho = (u, role) => ({ uid: 'U-' + u, u, role });
const r01 = ho('chu', 'R01'), r11 = ho('tuvan', 'R11'), r12 = ho('dulieu', 'R12'), r13 = ho('ph', 'R13');

let dat = 0, truot = 0;
const kiem = (ten, dk, ct) => { if (dk) { dat++; console.log('OK  ' + ten); } else { truot++; console.log('SAI ' + ten + (ct ? ' — ' + ct : '')); } };

const tot = { maVanDe: 'PD-001', tenVanDe: 'Con nghiện điện thoại', phuongAn: 'Thoả thuận giờ dùng máy cùng con, đặt máy ngoài phòng ngủ', ketQua: 'motPhan', danhGia: 'Bảng giờ dùng 7 ngày: giảm từ 5 giờ xuống 3 giờ', baiHoc: 'Thoả thuận phải do con cùng viết thì con mới giữ' };

/* ── quyền ── */
kiem('R11 (chuyên viên tư vấn) ghi được sổ', (await T.ghiNhatKyGiaiPhap(tot, env, db, r11)).ok);
kiem('R12 bị chặn ở máy chủ', (await T.ghiNhatKyGiaiPhap(tot, env, db, r12)).code === 'NOPERM');
kiem('phụ huynh bị chặn đọc sổ', (await T.docNhatKyGiaiPhap({ maVanDe: 'PD-001' }, env, db, r13)).code === 'NOPERM');
kiem('phụ huynh bị chặn soạn nháp', (await T.soanMucGiaiPhap({ muc: 'kyNang', tenVanDe: 'Con nghiện điện thoại' }, env, db, r13)).code === 'NOPERM');

/* ── sổ nhật ký ── */
kiem('kết quả lạ bị từ chối', (await T.ghiNhatKyGiaiPhap(Object.assign({}, tot, { ketQua: 'tuyetVoi' }), env, db, r01)).code === 'SAI');
kiem('thiếu bài học bị từ chối', (await T.ghiNhatKyGiaiPhap(Object.assign({}, tot, { baiHoc: '' }), env, db, r01)).code === 'SAI');
const ten = await T.ghiNhatKyGiaiPhap(Object.assign({}, tot, { phuongAn: 'Gọi chị Nguyễn Thị Lan số 0912345678 để thoả thuận' }), env, db, r01);
kiem('tên + số điện thoại gia đình bị chặn (Điều 13)', ten.code === 'DIEU13', JSON.stringify(ten));
await T.ghiNhatKyGiaiPhap(Object.assign({}, tot, { ketQua: 'tot' }), env, db, r01);
const so = await T.docNhatKyGiaiPhap({ maVanDe: 'PD-001' }, env, db, r11);
kiem('đọc sổ: đếm đúng theo kết quả, kèm người ghi', so.ok && so.tong === 2 && so.dem.tot === 1 && so.dem.motPhan === 1 && so.ds.every(r => r.boiAi), JSON.stringify(so.dem));
kiem('sổ không chứa dòng bị chặn', !so.ds.some(r => /0912345678/.test(r.phuongAn)));

/* ── soạn nháp ── */
luot.length = 0;
const n = await T.soanMucGiaiPhap({ muc: 'tuDuy2080', tenVanDe: 'Con nghiện điện thoại', boiCanh: 'Nguyên nhân: thiếu kết nối buổi tối' }, env, db, r11);
kiem('soạn nháp mục 20/80: trả bản nháp gắn nhãn chưa duyệt', n.ok && /Ngồi cạnh con/.test(n.nhap) && /chưa duyệt/.test(n.vi), JSON.stringify(n));
kiem('lời dặn mục 20/80 tới bộ não', luot.length === 1 && /20\/80/.test(JSON.stringify(luot[0])));
kiem('mục lạ không soạn được', (await T.soanMucGiaiPhap({ muc: 'xoaKho', tenVanDe: 'Con nghiện điện thoại' }, env, db, r11)).code === 'SAI');
const d13 = await T.soanMucGiaiPhap({ muc: 'kyNang', tenVanDe: 'Bé Nguyễn Thị Lan số 0912345678 nghiện máy' }, env, db, r11);
kiem('soạn nháp: tên + số điện thoại không tới bộ não', !d13.ok && luot.length === 1, JSON.stringify(d13));
kiem('bản nháp KHÔNG ghi vào kho giải pháp', Number(sq.prepare('SELECT COUNT(*) n FROM khoGiaiPhapDaTri').get().n) === 0);
const tat = await T.soanMucGiaiPhap({ muc: 'kyNang', tenVanDe: 'Con nghiện điện thoại' }, {}, db, r11);
kiem('bộ não tắt → nói rõ, không trả khung trống', !tat.ok && tat.code === 'CUADONG');

/* ── nối hệ ── */
const w = fs.readFileSync(ROOT + '/may-chu/worker.js', 'utf8');
kiem('worker: ba cửa có trong CAN_PHIEN và có nhánh gọi',
  ['ghiNhatKyGiaiPhap', 'docNhatKyGiaiPhap', 'soanMucGiaiPhap'].every(f => w.includes("'" + f + "'") && w.includes("fn === '" + f + "'")));
kiem('csdl.sql có bảng soNhatKyGiaiPhap', /CREATE TABLE IF NOT EXISTS soNhatKyGiaiPhap/.test(fs.readFileSync(ROOT + '/may-chu/csdl.sql', 'utf8')));
const core = fs.readFileSync(ROOT + '/src/data.core.js', 'utf8');
kiem("màn tra-cuu-gp trong G.NAV với quyền ca_xu_ly (R01–R11) — cùng ngưỡng cổng máy chủ",
  /\{v:'tra-cuu-gp'[^}]*perm:'ca_xu_ly'/.test(core) && /ca_xu_ly:11\b/.test(core) && T.BAC_TOI_DA === 11);
const ui = fs.readFileSync(ROOT + '/src/tra-cuu-giai-phap.js', 'utf8');
const muc13 = ['Vấn đề', 'Phân tích vấn đề', 'Phác đồ xử lý', 'Tư duy 20/80', 'Kỹ năng xử lý', 'Các bước xử lý', 'Sổ nhật ký giải pháp',
  'Các lưu ý khi xử lý', 'Tham vấn chuyên gia', 'Các phương án xử lý', 'Kết quả', 'Công cụ đánh giá kết quả', 'Bài học rút ra'];
const thieu = muc13.filter(m => ui.indexOf("'" + m) < 0);
kiem('màn dựng đủ 13 mục chủ hệ yêu cầu', !thieu.length, thieu.join(', '));

console.log('\n' + (truot ? '✗ ' + truot + ' SAI · ' : '✓ ') + dat + ' đạt');
process.exit(truot ? 1 : 0);
