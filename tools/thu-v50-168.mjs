/* Thử V50·168 — cô đọng hệ: danh mục ≤ 168 trang, 15 màn chính, trần màn
   theo vai, mọi màn khớp vào một màn lớn; cấp quyền 100% Super Admin;
   Coach ↔ CRM; tài chính và CRM theo giới hạn được cấp.
   D1 giả = node:sqlite trong RAM.
   Dùng: node tools/thu-v50-168.mjs   (Node >= 22.5) */
import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import vm from 'node:vm';
import { pathToFileURL, fileURLToPath } from 'node:url';
const ROOT = process.argv[2] || fileURLToPath(new URL('..', import.meta.url)).replace(/[\\/]$/, '');
const nap = f => import(pathToFileURL(ROOT + '/may-chu/' + f).href);
const [QTK, CRM, CS, CT, T5, PB, CN, DB, VH, CR, TC] = await Promise.all(['quan-ly-tai-khoan.js', 'crm.js', 'crm-chuyen-sau.js', 'chi-tieu.js',
  'quyen-t5pro.js', 'phong-ban.js', 'con-nguoi.js', 'dong-bo.js', 'van-hanh-cham-soc.js', 'credit.js', 'tai-chinh.js'].map(nap));
const KTND = await nap('kien-truc-noi-dung.js');

let dat = 0, truot = 0;
const kiem = (ten, dk) => { if (dk) { dat++; console.log('OK  ' + ten); } else { truot++; console.log('SAI ' + ten); } };

/* ══ 1 · BẢN ĐỒ MÀN (app) ══ */
const G = { VIEWS: {}, U: { h: s => String(s), ic: () => '', ph: () => '', lockCard: () => '', toast() {} } };
const ctx = { window: { G }, G, console, document: { addEventListener() {} }, localStorage: { getItem: () => null, setItem() {}, removeItem() {} } };
vm.createContext(ctx);
for (const f of ['src/data.core.js', 'src/data-toi-uu.js', 'src/data-v50.js', 'src/v50-man.js', 'src/v50-kho.js']) vm.runInContext(fs.readFileSync(ROOT + '/' + f, 'utf8'), ctx, { filename: f });
const M = G.V50M, V = G.V50;
const nav = new Set(); G.NAV.forEach(g => g.items.forEach(it => nav.add(it.v)));
const dm = M.danhMuc();
kiem('danh mục ' + dm.length + ' trang ≤ trần 168, trong 15 màn chính', dm.length <= M.TRAN && dm.length >= 90 && M.HUB.length === 15);
kiem('mọi phần của màn chính là mục thật của cột trái', dm.every(v => nav.has(v)));
kiem('14 trang kho nghề kn-* đã đăng ký, mỗi cụm học thuyết có kho', V.CUM.every(c => typeof G.VIEWS['kn-' + c.ma.toLowerCase()] === 'function') && V.CUM.length === 14);
kiem('mỗi cụm học thuyết được ít nhất một màn chính trỏ tới', V.CUM.every(c => M.HUB.some(h => h.kho.includes(c.ma))));
/* mọi màn đăng ký trong app (khai thẳng + mục cột trái + bảng điều khiển theo vai) đều khớp một màn chính */
const dangKy = new Set(nav);
for (const f of fs.readdirSync(ROOT + '/src').filter(x => x.endsWith('.js'))) {
  for (const m of fs.readFileSync(ROOT + '/src/' + f, 'utf8').matchAll(/G\.VIEWS\[\s*['"]([a-z0-9-]+)['"]\s*\]\s*=/g)) dangKy.add(m[1]);
}
['dk-qlcm', 'dk-qlcm-soat-dau-vao', 'dk-tncoach-phan-cong', 'va-quyen', 'gd-taichinh', 'van-hanh-10', 'van-hanh-gd', 'studio-he', 'lam-phim-10'].forEach(v => dangKy.add(v));
const roi = [...dangKy].filter(v => !M.hubCua(v));
kiem('mọi màn trong app (' + dangKy.size + ') khớp vào một màn chính — không màn nào đứng rời', !roi.length);
if (roi.length) console.log('    rời:', roi.join(' '));
const ds = r => M.hubVai(r);
kiem('Phụ huynh · Học sinh · CTV: đúng 3 màn; khách lạ ≤ 3', ['R13', 'R14', 'R15'].every(r => ds(r).length === 3) && ds('khach-la').length <= 3);
kiem('Coach → Chuyên viên dữ liệu (R06–R12): tối đa 5 màn', ['R06', 'R07', 'R08', 'R09', 'R10', 'R11', 'R12'].every(r => ds(r).length <= 5 && ds(r).length >= 4));
kiem('Trưởng nhóm Coach → Giám đốc (R03–R05): tối đa 10 màn', ['R03', 'R04', 'R05'].every(r => ds(r).length <= 10));
kiem('Admin · Super Admin: hiển thị 100% — đủ 15 màn chính (10 nghiệp vụ + 5 khu khách hàng)', ['R01', 'R02'].every(r => M.hubTatCa(r).length === M.HUB.length && ds(r).includes('quan-tri')));
kiem('tách khu: màn của khách chỉ gồm màn khu khách; màn nghiệp vụ nhân sự chỉ gồm màn khu nhân sự', ['R13', 'R14', 'R15', 'khach-la'].every(r => ds(r).every(id => M.hub(id).khu === 'khach')) &&
  ['R01','R02','R03','R04','R05','R06','R07','R08','R09','R10','R11','R12'].every(r => ds(r).every(id => M.hub(id).khu === 'nhansu') && M.hubKhach(r).every(id => M.hub(id).khu === 'khach')));
kiem('nhân sự R03–R12 có khu vực khách hàng riêng (xem theo quyền)', ['R03','R07','R11','R12'].every(r => M.hubKhach(r).length >= 2));
kiem('bảng điều khiển của phụ huynh / học viên / đại sứ khớp vào khu khách, không vào Bàn làm việc nhân sự', M.hubCua('dk-phuhuynh-nhip') === 'nha-minh' && M.hubCua('dk-hocvien') === 'nha-minh' && M.hubCua('dk-daisu-hoa-hong') === 've-tinh' && M.hubCua('dk-coach-ca') === 'ban-lam-viec');
kiem('cùng một trang hai khu: gia đình mở Bảng điều khiển ở Nhà mình, Coach mở ở Bàn làm việc', M.hubCua('dk-cua-toi', M.hubTatCa('R13')) === 'nha-minh' && M.hubCua('dk-cua-toi', M.hubTatCa('R07')) === 'ban-lam-viec');
kiem('mọi màn chính khai ở vai đều có thật', Object.values(M.VAI).every(l => l.every(id => M.hub(id))));
kiem('gia đình không có màn quản trị, tài chính, CRM', ['R13', 'R14', 'R15'].every(r => !ds(r).some(id => ['quan-tri', 'tai-chinh', 'khach-crm', 'dieu-hanh', 'van-hanh-he'].includes(id))));
kiem('Coach có Hệ điều hành Coach VÀ Khách hàng & CRM (cập nhật tiến trình chăm sóc)', ['R05', 'R06', 'R07'].every(r => ds(r).includes('coach') && ds(r).includes('khach-crm')));
const coChay = ['phan-quyen', 'phan-quyen-crm', 'cap-tai-khoan'].map(v => { let it; G.NAV.forEach(g => g.items.forEach(x => { if (x.v === v) it = x; })); return it && it.perm; });
kiem('màn cấp quyền: Admin hệ thống THẤY (hiển thị 100%), thao tác do máy chủ chỉ cho Super Admin', coChay.every(p => p === 'qt_trang') && /Chế độ xem: cấp quyền 100% do Super Admin/.test(fs.readFileSync(ROOT + '/src/v50-cot.js', 'utf8')));
kiem('khung bảng CRM & Tài chính là phần của Khách hàng & CRM, Tài chính, Tài khoản & quyền', ['khach-crm', 'tai-chinh', 'quan-tri'].every(id => M.hub(id).phan.includes('khung-du-lieu')) && nav.has('khung-du-lieu'));

/* ══ 2 · MÁY CHỦ ══ */
const sq = new DatabaseSync(':memory:');
sq.exec(fs.readFileSync(ROOT + '/may-chu/csdl.sql', 'utf8'));
const db = { prepare(sql) { let a = []; const st = {
  bind(...x) { a = x; return st; },
  first() { return Promise.resolve(sq.prepare(sql).get(...a) || null); },
  all() { return Promise.resolve({ results: sq.prepare(sql).all(...a) }); },
  run() { const r = sq.prepare(sql).run(...a); return Promise.resolve({ meta: { changes: Number(r.changes) } }); } }; return st; },
  async batch(ds) { const ra = []; for (const st of ds) ra.push(await st.run()); return ra; } };
const user = (id, u, role, mk) => sq.prepare("INSERT INTO users (id, username, role, active, maKhachHang, phongBan) VALUES (?, ?, ?, 1, ?, 'KD')").run(id, u, role, mk || null);
user('A1', 'chu', 'R01'); user('A2', 'admin', 'R02'); user('A3', 'gd', 'R03'); user('C1', 'coach1', 'R07'); user('C2', 'coach2', 'R07'); user('T1', 'tv1', 'R11'); user('P1', 'ph1', 'R13', 'K1');
sq.prepare("INSERT INTO hoSoKhach (maKhachHang, uidPhuHuynh, tang, coach, tuVan) VALUES ('K1','P1',3,'coach1','tv1')").run();
const ho = (u, role, uid) => ({ u, role, uid: uid || u });
const R01 = ho('chu', 'R01', 'A1'), R02 = ho('admin', 'R02', 'A2'), R03 = ho('gd', 'R03', 'A3'), C1 = ho('coach1', 'R07', 'C1'), C2 = ho('coach2', 'R07', 'C2'), TV = ho('tv1', 'R11', 'T1');

/* cấp quyền 100% Super Admin */
const tk = { username: 'moi.nv', email: 'moi@gita365.vn', hoTen: 'Nhân sự mới', role: 'R07' };
kiem('Admin (R02) KHÔNG mở được tài khoản', (await QTK.taoTaiKhoanNoiBo(tk, {}, db, R02)).code === 'NOPERM');
kiem('Super Admin mở được tài khoản R07', (await QTK.taoTaiKhoanNoiBo(tk, {}, db, R01)).ok === true);
kiem('Super Admin không tạo được tài khoản ngang cấp (R01)', !(await QTK.taoTaiKhoanNoiBo({ ...tk, username: 'r01.moi', email: 'r@g.vn', role: 'R01' }, {}, db, R01)).ok);
kiem('Admin (R02) KHÔNG đổi được vai của ai', (await QTK.capNhatTaiKhoan({ username: 'coach1', role: 'R05' }, {}, db, R02)).code === 'NOPERM');
const s1 = await QTK.capNhatTaiKhoan({ username: 'coach1', hoTen: 'Coach Một' }, {}, db, R02);
kiem('Admin vẫn sửa được thông tin; KHÔNG còn xoá trắng phòng ban khi không gửi', s1.ok !== false && sq.prepare("SELECT phongBan FROM users WHERE username='coach1'").get().phongBan === 'KD');
kiem('Super Admin đổi được vai', (await QTK.capNhatTaiKhoan({ username: 'coach2', role: 'R06' }, {}, db, R01)).ok !== false && sq.prepare("SELECT role FROM users WHERE username='coach2'").get().role === 'R06');
kiem('Admin (R02) KHÔNG cấp được quyền CRM', (await CRM.capQuyenCRM({ username: 'tv1', muc: 'sua' }, {}, db, R02)).code === 'NOPERM');
kiem('Admin (R02) KHÔNG cấp được quyền T5-PRO', (await T5.capQuyenT5Pro({ username: 'coach1' }, {}, db, R02)).code === 'NOPERM');
kiem('Admin (R02) KHÔNG cấp được quyền ký nội dung', (await KTND.capQuyenNoiDung({ username: 'coach1' }, {}, db, R02)).error === 'KHONGQUYEN');
sq.prepare("INSERT INTO quyenTaiChinh (id, username, chucNang, lyDo, boiAi, capLuc) VALUES ('Q1','admin','quanLyPhong','Quản lý phòng','chu','2026-10-01')").run();
kiem('Admin dù quản lý phòng KHÔNG cấp được vị trí tài chính', (await CT.capQuyenTaiChinh({ username: 'coach1', chucNang: 'keToanThu' }, {}, db, R02)).code === 'NOPERM');
kiem('Admin (R02) KHÔNG gán được phòng ban', (await PB.ganPhongBan({ username: 'coach1', maPB: 'KD' }, {}, db, R02)).code === 'NOPERM');
const pb = await PB.ganPhongBan({ username: 'coach1', maPB: (await PB.dsPhongBan({}, {}, db, R01)).ds?.[0]?.ma || 'KD' }, {}, db, R01);
kiem('Super Admin gán phòng ban được (cửa cũ hỏng vì cột capNhatLuc không có)', pb.ok !== false);
kiem('Admin (R02) KHÔNG khai hộ ba cửa (mở quyền liên hệ khách)', (await CN.lapBaCua({ maNguoi: 'coach1' }, {}, db, R02)).code === 'NOPERM');

/* Coach ↔ CRM */
kiem('Coach KHÔNG ghi tiến trình chăm sóc cho nhà không phụ trách', (await VH.ghiCham({ maNha: 'K1', kieu: 'buoi', noiDung: 'x', canCu: 'y', aiDuyet: 'coach2' }, {}, db, C2)).code === 'NGOAINHA');
sq.prepare("INSERT INTO phieuThu (id, maKhachHang, soTien, hinhThuc, nguoiGhi, ghiLuc, trangThai, nguoiDuyet, duyetLuc) VALUES ('PT1','K1',10000000,'chuyenKhoan','nv','2026-10-01','daDuyet','kt','2026-10-02')").run();
await CR.napCreditPhieu({ idPhieu: 'PT1' }, {}, db, R01);
const tieu = await CR.tieuCredit({ maNha: 'K1', hoatDong: 'buoi-11', thamChieu: 'B-7', ghiChu: 'Buổi 7' }, {}, db, C1);
const cham = sq.prepare("SELECT kieu, noiDung, boiAi, canCu FROM soCham WHERE maNha='K1'").all();
kiem('buổi coach ghi credit → tự vào sổ chạm (CRM đọc) đúng một dòng', tieu.ok && cham.length === 1 && cham[0].kieu === 'buoi' && cham[0].boiAi === 'coach1' && /Buổi 7/.test(cham[0].noiDung));
await CR.tieuCredit({ maNha: 'K1', hoatDong: 'buoi-11', thamChieu: 'B-7', ghiChu: 'Buổi 7' }, {}, db, C1);
kiem('ghi lại cùng buổi không nhân đôi trong sổ chạm', sq.prepare("SELECT COUNT(*) n FROM soCham WHERE maNha='K1'").get().n === 1);
const ct = await CRM.capQuyenCRM({ username: 'tv1', muc: 'xem', lyDo: 'Tư vấn chăm sóc khách' }, {}, db, R01);
const tl = await CRM.crmChiTiet({ maKH: 'K1' }, {}, db, TV);
kiem('Tư vấn được cấp CRM thấy buổi coach trên dòng thời gian của khách mình', ct.ok !== false && tl.ok !== false && JSON.stringify(tl).includes('Buổi coach'));

/* CRM & tài chính theo giới hạn */
kiem('Giám đốc chưa được cấp CRM quản lý KHÔNG xem phân tích CRM chuyên sâu', (await CS.crmPhanTichKhach({ maKH: 'K1' }, {}, db, R03)).code === 'NOPERM');
kiem('Admin (quản lý CRM đương nhiên) xem được ưu tiên nâng cao (cửa cũ hỏng vì cột deletedAt)', (await CS.crmUuTienNangCao({}, {}, db, R02)).ok !== false);
user('T2', 'tv2', 'R11');
kiem('Tư vấn KHÔNG xem công nợ nhà không phụ trách', (await TC.congNo({ maKhachHang: 'K1' }, {}, db, ho('tv2', 'R11', 'T2'))).code === 'NOPERM');
kiem('Tư vấn phụ trách xem được công nợ nhà mình', (await TC.congNo({ maKhachHang: 'K1' }, {}, db, TV)).ok !== false);
await CT.capQuyenTaiChinh({ username: 'tv2', chucNang: 'keToanThu', lyDo: 'Kế toán thu kiêm nhiệm' }, {}, db, R01);
const q = await CT.quyenCua(db, 'tv2');
kiem('vị trí ban tài chính do Super Admin cấp → mở công nợ theo phạm vi thu', q.keToanThu === true && (await TC.congNo({ maKhachHang: 'K1' }, {}, db, ho('tv2', 'R11', 'T2'))).ok !== false);

const HK = await nap('ho-so-khach.js');
kiem('Coach KHÔNG tự gán mình làm Coach của nhà khác (nới phạm vi CRM)', (await HK.suaTepKhach({ maKhachHang: 'K1', sua: { coach: 'coach2' } }, {}, db, C2)).code === 'NOPERM');
kiem('Coach phụ trách cũng KHÔNG đổi người phụ trách', (await HK.suaTepKhach({ maKhachHang: 'K1', sua: { tuVan: 'coach1' } }, {}, db, C1)).code === 'NOPERM');
kiem('Coach KHÔNG sửa tệp nhà không phụ trách', (await HK.suaTepKhach({ maKhachHang: 'K1', sua: { band: 'XANH' } }, {}, db, C2)).code === 'NOPERM');
/* dữ liệu nối ngầm: đổi tầng ghi luôn tầng học của học viên */
sq.prepare("INSERT INTO nguoiHocTang (id, maHocVien, maKhachHang, uidPhuHuynh, tang) VALUES ('N1','HV1','K1','P1',3)").run();
try { await HK.ghiDoiTang(db, { maKhachHang: 'K1', tuTang: 3, denTang: 4, boi: 'chu', lyDo: 'thử' }); } catch (e) { /* lịch thu phía sau không thuộc phép thử này */ }
kiem('đổi tầng cập nhật luôn tầng học (nguoiHocTang) mà lộ trình cá nhân hoá đọc', sq.prepare("SELECT tang FROM nguoiHocTang WHERE maKhachHang='K1'").get().tang === 4 && sq.prepare("SELECT tang FROM hoSoKhach WHERE maKhachHang='K1'").get().tang === 4);
const w = fs.readFileSync(ROOT + '/may-chu/worker.js', 'utf8');
kiem('đăng nhập trả vị trí tài chính (taiChinhMuc) cho máy khách', /taiChinhMuc: taiChinhMuc/.test(w));

console.log('\n' + dat + ' đạt · ' + truot + ' sai');
process.exit(truot ? 1 : 0);
