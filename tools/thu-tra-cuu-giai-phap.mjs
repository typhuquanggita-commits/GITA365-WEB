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

/* ── tỷ lệ xem theo vai (G.TCGP_TY_LE) — chạy THẬT data.core.js + màn trong vm,
   không dò chữ: phép đo phải cắt đúng số vấn đề, không chỉ "có bảng". ── */
import vm from 'node:vm';
const win = {}; win.window = win; const ctx = vm.createContext(win);
ctx.document = { addEventListener() {} };
vm.runInContext(fs.readFileSync(ROOT + '/src/data.core.js', 'utf8'), ctx);
const G = win.G; G.U = { h: s => s, ic: () => '' }; G.VIEWS = G.VIEWS || {};
vm.runInContext(fs.readFileSync(ROOT + '/src/tra-cuu-giai-phap.js', 'utf8'), ctx);
const bang = G.TCGP_TY_LE || [];
const VAI11 = ['R01', 'R02', 'R03', 'R04', 'R05', 'R06', 'R07', 'R08', 'R09', 'R10', 'R11'];
const thieuVai = VAI11.filter(v => !bang.some(r => r.vai.indexOf(v) >= 0));
const trungVai = VAI11.filter(v => bang.filter(r => r.vai.indexOf(v) >= 0).length > 1);
kiem('bảng tỷ lệ phủ đủ R01–R11, mỗi vai đúng một dòng', !thieuVai.length && !trungVai.length, 'thiếu ' + thieuVai.join(',') + ' · trùng ' + trungVai.join(','));
const pts = VAI11.map(v => G.tcgpTyLe(v));
kiem('tỷ lệ không tăng khi bậc vai lùi xuống (R01 ≥ … ≥ R11), trong 1–100', pts.every((p, i) => p >= 1 && p <= 100 && (i === 0 || p <= pts[i - 1])), pts.join(','));
kiem('R01 mở 100% kho tra cứu', G.tcgpTyLe('R01') === 100);
kiem('vai ngoài bảng (R12, khách) mở 0%', G.tcgpTyLe('R12') === 0 && G.tcgpTyLe('R13') === 0);
/* 30 vấn đề trộn tầng; vai 69% phải mở đúng ceil(30×0.69)=21, tầng thấp trước */
const dsThu = [];
for (let i = 0; i < 20; i++) dsThu.push({ loai: 'pd', ma: 'PD-' + i, goc: { tang: 'T' + (5 - (i % 5)) } });
for (let i = 0; i < 10; i++) dsThu.push({ loai: 'th', ma: 'TH-' + i, tang: 'T' + (1 + (i % 5)) });
const q11 = G.tcgpMo('R11', dsThu), soMo = dsThu.filter(v => q11.mo(v.ma)).length;
kiem('R11 mở đúng ceil(tổng × tỷ lệ) vấn đề', q11.pt === 69 && q11.so === 21 && soMo === 21, q11.so + ' / ' + soMo);
const moT1 = dsThu.filter(v => (v.goc ? v.goc.tang : v.tang) === 'T1').every(v => q11.mo(v.ma));
const moT5 = dsThu.filter(v => (v.goc ? v.goc.tang : v.tang) === 'T5').some(v => q11.mo(v.ma));
kiem('cắt từ tầng thấp lên: T1 mở hết, T5 khoá hết ở 69%', moT1 && !moT5);
const q01 = G.tcgpMo('R01', dsThu), q12 = G.tcgpMo('R12', dsThu);
kiem('R01 mở 30/30 · R12 mở 0/30', dsThu.every(v => q01.mo(v.ma)) && !dsThu.some(v => q12.mo(v.ma)));
/* ── KHO 1000 VẤN ĐỀ — máy chủ giữ nội dung, cắt tỷ lệ THẬT ở cửa ── */
const banGhi = (id, cap, them) => Object.assign({ id, ten: 'Vấn đề thử ' + id, cap, van: 'Con trì hoãn việc học mỗi tối.',
  phanTich: { hienTuong: 'Trì hoãn', boiCanh: 'Đầu năm học', nguyenNhan: ['Nhịp chưa đổi', 'Bài khó'], tacDong: 'Giằng co mỗi tối', donBay: 'Mười phút đầu dễ' },
  phacDo: ['Hỏi thay nhắc', 'Bắt đầu việc dễ', 'Khen nỗ lực'], t2080: { lam: ['Cố định giờ học'], gac: 'Tạm gác điểm số' },
  kyNang: ['Hỏi mở', 'Lắng nghe', 'Khen cụ thể'], buoc: ['Viết giờ học', 'Ngồi cạnh mười phút', 'Xem lại cuối tuần', 'Giảm dần', 'Đánh giá'],
  luuY: ['Không so sánh', 'Không đổi luật', 'Không thưởng bằng máy'], thamVan: { khi: 'Khóc mỗi tối quá hai tuần', ai: 'Chuyên gia tâm lý học đường' },
  phuongAn: [{ ten: 'A', khi: 'Con hợp tác', cach: 'Con tự viết' }, { ten: 'B', khi: 'Cần người cạnh', cach: 'Học cặp' }, { ten: 'C', khi: 'Mất tập trung', cach: 'Nhịp ngắn' }],
  ketQua: 'Hai tuần sau con tự bắt đầu năm tối mỗi tuần.', doBang: ['Bảng giờ 14 ngày', 'Thang 1–5'], baiHoc: 'Để con cùng viết kế hoạch.' }, them || {});
const lo = (tien, a, b) => { const r = []; for (let i = a; i <= b; i++) r.push(banGhi(tien + '-' + String(i).padStart(2, '0'), 1 + ((i * 7) % 5))); return r; };
kiem('R11 không nạp được kho (chỉ Super Admin)', (await T.napKhoVanDe({ ds: lo('KH-A', 1, 2) }, env, db, r11)).code === 'NOPERM');
kiem('lô quá 100 bản ghi bị từ chối', (await T.napKhoVanDe({ ds: lo('KH-A', 1, 50).concat(lo('KH-B', 1, 50), lo('KH-C', 1, 1)) }, env, db, r01)).code === 'SAI');
const hong = await T.napKhoVanDe({ ds: lo('KH-A', 1, 3).concat([banGhi('KH-A-04', 2, { phacDo: [] }), banGhi('KH-A-05', 2, { van: 'Chị Nguyễn Thị Lan gọi 0912345678 than con khóc' })]) }, env, db, r01);
kiem('một bản ghi hỏng → cả lô không nạp, nói đúng mã hỏng (kể cả Điều 13)',
  hong.code === 'HONG' && hong.hong.some(x => /KH-A-04: phacDo/.test(x)) && hong.hong.some(x => /KH-A-05: DIEU13/.test(x)) &&
  Number(sq.prepare('SELECT COUNT(*) n FROM khoVanDe').get().n) === 0, JSON.stringify(hong.hong));
const n1 = await T.napKhoVanDe({ ds: lo('KH-A', 1, 50).concat(lo('KH-B', 1, 50)), ban: 'thu-1' }, env, db, r01);
const n2 = await T.napKhoVanDe({ ds: lo('NS-A', 1, 50), ban: 'thu-1' }, env, db, r01);
kiem('Super Admin nạp hai lô: đếm đúng theo loại', n1.ok && n2.ok && n2.dem.kh === 100 && n2.dem.ns === 50, JSON.stringify(n2));
await T.napKhoVanDe({ ds: [banGhi('KH-A-01', 1 + ((1 * 7) % 5), { ten: 'Tên đã sửa' })], ban: 'thu-2' }, env, db, r01);
kiem('nạp lại cùng mã thì CẬP NHẬT, không nhân đôi', Number(sq.prepare('SELECT COUNT(*) n FROM khoVanDe').get().n) === 150 &&
  sq.prepare("SELECT ten FROM khoVanDe WHERE ma='KH-A-01'").get().ten === 'Tên đã sửa');
const ds11 = await T.dsKhoVanDe({ loai: 'kh' }, env, db, r11);
const capTang = ds11.ds.every((v, i) => i === 0 || v.cap >= ds11.ds[i - 1].cap);
kiem('R11: danh sách đủ 100 tên, mở đúng ceil(100×69%)=69, xếp cấp thấp trước',
  ds11.ok && ds11.tong === 100 && ds11.so === 69 && ds11.ds.filter(v => v.mo).length === 69 && capTang && ds11.ds.every((v, i) => v.mo === (i < 69)));
kiem('danh sách KHÔNG chứa nội dung (chỉ tên)', !JSON.stringify(ds11).includes('phanTich') && !JSON.stringify(ds11).includes('Mười phút đầu dễ'));
const dau = ds11.ds[0].ma, cuoi = ds11.ds[ds11.ds.length - 1].ma;
const d1 = await T.docKhoVanDe({ ma: dau }, env, db, r11);
kiem('R11 đọc vấn đề trong tỷ lệ: đủ 13 mục', d1.ok && d1.vd.phanTich && d1.vd.t2080 && d1.vd.phuongAn.length === 3 && d1.vd.nhomTen === 'Học tập & động lực học');
const d2 = await T.docKhoVanDe({ ma: cuoi }, env, db, r11);
kiem('R11 đọc vấn đề NGOÀI tỷ lệ → máy chủ từ chối, không trả nội dung', d2.code === 'NGOAITYLE' && !d2.vd);
kiem('R01 đọc được vấn đề cuối cùng', (await T.docKhoVanDe({ ma: cuoi }, env, db, r01)).ok);
const r05 = ho('coach', 'R05'), ds05 = await T.dsKhoVanDe({ loai: 'kh' }, env, db, r05);
kiem('R05 mở 77/100', ds05.so === 77 && ds05.ds.filter(v => v.mo).length === 77);
kiem('R12 và phụ huynh không đọc được kho', (await T.dsKhoVanDe({ loai: 'kh' }, env, db, r12)).code === 'NOPERM' && (await T.docKhoVanDe({ ma: dau }, env, db, r13)).code === 'NOPERM');
kiem('mã lạ / chưa nạp bị từ chối', (await T.docKhoVanDe({ ma: "KH-A-01' OR 1=1" }, env, db, r01)).code === 'SAI' && (await T.docKhoVanDe({ ma: 'NS-J-50' }, env, db, r01)).code === 'KHONGCO');
kiem('bảng tỷ lệ máy chủ KHỚP bảng tỷ lệ màn hình (hai bản, một sự thật)',
  JSON.stringify(T.TY_LE.map(r => [r.vai.slice(), r.pt])) === JSON.stringify(bang.map(r => [r.vai.slice(), r.pt])));
kiem('worker: ba cửa kho có trong CAN_PHIEN và có nhánh gọi; csdl.sql có bảng khoVanDe',
  ['napKhoVanDe', 'dsKhoVanDe', 'docKhoVanDe'].every(f => w.includes("'" + f + "'") && w.includes("fn === '" + f + "'")) &&
  /CREATE TABLE IF NOT EXISTS khoVanDe/.test(fs.readFileSync(ROOT + '/may-chu/csdl.sql', 'utf8')));
/* Kho mã là công khai: gói nguồn chỉ được nằm ở dạng mã hoá. */
const goiTep = ROOT + '/kho-van-de/goi.enc';
const tepKho = fs.existsSync(ROOT + '/kho-van-de') ? fs.readdirSync(ROOT + '/kho-van-de') : [];
kiem('kho-van-de/ chỉ chứa gói mã hoá — không có tệp nguồn trần', tepKho.every(f => f === 'goi.enc'), tepKho.join(','));
if (fs.existsSync(goiTep)) {
  const g = JSON.parse(fs.readFileSync(goiTep, 'utf8'));
  const chu = fs.readFileSync(goiTep, 'utf8');
  kiem('gói đúng định dạng màn hình mở được, không lộ chữ nguồn', g.v === 1 && g.n >= 200000 && g.salt && g.iv && g.ct &&
    !/phanTich|hienTuong|"ten"|Vấn đề/.test(chu) && /fetch\((tep \|\| )?'kho-van-de\/goi\.enc'/.test(ui));
}

kiem('màn chặn bấm vào vấn đề bị khoá (không chỉ ẩn bằng CSS)', /if\(!G\.tcgpMo\(G\.S\.role\)\.mo\(ma0\)\) return;/.test(ui) && /TC\.chon && quyen\.mo\(TC\.chon\)/.test(ui));

console.log('\n' + (truot ? '✗ ' + truot + ' SAI · ' : '✓ ') + dat + ' đạt');
process.exit(truot ? 1 : 0);
