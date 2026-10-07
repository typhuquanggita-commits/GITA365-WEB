/* Thử NỀN TẢNG CHIẾN LƯỢC V20 — D1 giả = node:sqlite trong RAM.
   Chứng minh: toán đúng (Holt bám xu hướng, z bền, tách biến động cộng đúng
   tổng, mô phỏng & độ nhạy, tiến độ mục tiêu) · chuỗi 12 tháng gom đúng ·
   North Star, giữ lại / mất, churn, nhóm khách, LTV, CAC, phễu, bất thường,
   độ tin cậy · quyền · mục tiêu chiến lược: kiểm chỉ số, hạn, lý do khi đổi ·
   app KHỚP máy chủ trên 400 bộ số · bản tin chạy được trên số thật.
   Dùng: node tools/thu-v20.mjs   (Node >= 22.5) */
import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import vm from 'node:vm';
import { pathToFileURL, fileURLToPath } from 'node:url';
const ROOT = process.argv[2] || fileURLToPath(new URL('..', import.meta.url)).replace(/[\\/]$/, '');
const M = await import(pathToFileURL(ROOT + '/may-chu/chien-luoc-v20.js').href);
const T = await import(pathToFileURL(ROOT + '/may-chu/v20-toan.js').href);

const sq = new DatabaseSync(':memory:');
sq.exec(fs.readFileSync(ROOT + '/may-chu/csdl.sql', 'utf8'));
const db = { prepare(sql) { let a = []; const st = {
  bind(...x) { a = x; return st; },
  first() { return Promise.resolve(sq.prepare(sql).get(...a) || null); },
  all() { return Promise.resolve({ results: sq.prepare(sql).all(...a) }); },
  run() { const r = sq.prepare(sql).run(...a); return Promise.resolve({ meta: { changes: Number(r.changes) } }); } }; return st; } };
let dat = 0, truot = 0;
const kiem = (ten, dk) => { if (dk) { dat++; console.log('OK  ' + ten); } else { truot++; console.log('SAI ' + ten); } };

/* ── toán ── */
const f = T.holt([10, 20, 30, 40, 50, 60], 3);
kiem('Holt bám xu hướng tuyến tính: 70 · 80 · 90, sai số 0', f.duBao.join() === '70,80,90' && f.sai === 0 && f.xuHuong === 10);
kiem('Holt chuỗi < 3 điểm → không đoán', T.holt([5, 6], 3) === null);
const f2 = T.holt([100, 120, 90, 130, 110, 140], 3);
kiem('dải 80% rộng dần theo tầm xa và chứa điểm dự báo', f2.tren[2] - f2.duoi[2] > f2.tren[0] - f2.duoi[0] && f2.duoi[0] <= f2.duBao[0] && f2.duBao[0] <= f2.tren[0]);
const nen = [10, 11, 9, 10, 12, 10, 11, 9, 10, 10, 300];
kiem('z bền: một ngày đột biến trong nền không làm mù phép đo', T.zBen(nen, 30) > 3 && T.mucBatThuong(T.zBen(nen, 10)) === 'xanh');
kiem('z bền: nền < 7 điểm → chưa đo', T.zBen([1, 2, 3], 5) === null && T.mucBatThuong(null) === 'chuaDo');
const t = T.tachBienDong(100, 2000000, 120, 2100000);
kiem('tách biến động: phần số nhà + phần thu TB = đúng tổng thay đổi', Math.abs(t.phanSoNha + t.phanTrungBinh - t.tong) < 1 && t.tong === 120 * 2100000 - 100 * 2000000);
const co = { lead: 60, kichHoat: 0.5, vaoHoc: 0.4, nha: 100, giuChan: 0.9, traTien: 0.6, arpu: 2000000 };
const a0 = T.moPhong(co, {}, 12), a1 = T.moPhong(co, { giuChan: 0.05 }, 12);
kiem('mô phỏng: trạng thái dừng = mới ÷ (1 − giữ chân) (12 ÷ 0,1 = 120)', Math.abs(T.moPhong(co, {}, 400).nha[399] - 120) <= 1 && a0.nha.length === 12);
kiem('mô phỏng: tăng giữ chân → nhiều nhà và nhiều thu hơn', a1.nha[11] > a0.nha[11] && a1.tongThu > a0.tongThu);
const dn = T.doNhay(co, 12);
kiem('độ nhạy: 6 đòn bẩy, xếp giảm dần, ARPU +10% = thu +10%', dn.length === 6 && dn[0].pt >= dn[5].pt && dn.find(x => x.ma === 'arpu').pt === 10);
const mt = { giaTriDau: 100, mucTieu: 200, tuLuc: '2026-01-01', hanLuc: '2026-12-31' };
kiem('tiến độ: đã đạt', T.tienDo(mt, 210, '2026-06-01', null).trangThai === 'dat');
kiem('tiến độ: đúng hướng khi tiến độ ≥ kỳ vọng − 10', T.tienDo(mt, 150, '2026-07-01', null).trangThai === 'dungHuong');
kiem('tiến độ: chậm nhưng dự báo vẫn kịp → "cham"; không kịp → "nguyCo"', T.tienDo(mt, 110, '2026-07-01', 205).trangThai === 'cham' && T.tienDo(mt, 110, '2026-07-01', 150).trangThai === 'nguyCo');
kiem('tiến độ: quá hạn chưa đạt → trượt; chỉ số "thấp hơn tốt hơn" chấm đúng chiều', T.tienDo(mt, 150, '2027-01-05', null).trangThai === 'truot' && T.tienDo({ giaTriDau: 20, mucTieu: 10, tuLuc: '2026-01-01', hanLuc: '2026-12-31' }, 9, '2026-05-01', null).trangThai === 'dat');

/* ── dữ liệu 6 tháng ── */
const thang = k => { const d = new Date(); d.setUTCDate(1); d.setUTCMonth(d.getUTCMonth() - k); return d.toISOString().slice(0, 7); };
const ngay = (k, dd) => thang(k) + '-' + String(dd).padStart(2, '0');
sq.prepare("INSERT INTO users (id, username, role, active) VALUES ('A1','chu','R01',1),('A3','gd','R03',1),('A4','ql','R04',1)").run();
/* tháng -2: 10 nhà tích cực (N1..N10); tháng -1: giữ 8 (N1..N8) + 4 mới (N11..N14) */
const vaoNha = (ma, k) => sq.prepare("INSERT INTO hoSoKhach (maKhachHang, uidPhuHuynh, tang, coach, trangThai, vaoLuc) VALUES (?, 'P', 2, 'c1', 'dangHoc', ?)").run(ma, ngay(k, 3) + 'T08:00:00Z');
for (let i = 1; i <= 10; i++) vaoNha('N' + i, 2);
for (let i = 11; i <= 14; i++) vaoNha('N' + i, 1);
const tick = (ma, k, dd) => sq.prepare('INSERT INTO nhipXong (id,maNha,maNhip,ngay,bo,boiAi,ghiLuc) VALUES (?,?,?,?,0,?,?)').run(ma + k + dd + Math.random(), ma, 'n', ngay(k, dd), 'p', ngay(k, dd));
for (let i = 1; i <= 10; i++) tick('N' + i, 2, 10);
for (let i = 1; i <= 8; i++) tick('N' + i, 1, 10);
for (let i = 11; i <= 14; i++) tick('N' + i, 1, 12);
/* thu: tháng -2: 5 nhà × 2tr; tháng -1: 8 nhà × 2,5tr */
let p = 0; const thu = (ma, k, tien) => sq.prepare("INSERT INTO phieuThu (id,maKhachHang,soTien,hinhThuc,nguoiGhi,ghiLuc,trangThai) VALUES (?,?,?,'ck','nv',?,'daDuyet')").run('P' + (p++), ma, tien, ngay(k, 15) + 'T08:00:00Z');
for (let i = 1; i <= 5; i++) thu('N' + i, 2, 2000000);
for (let i = 1; i <= 8; i++) thu('N' + (i + 4), 1, 2500000);
/* tiếp thị: 3 tháng trọn gần nhất tổng 6tr; hoa hồng 2tr; nhà mới 3 tháng = 14 */
const chi = (id, km, tien, k) => sq.prepare("INSERT INTO chiPhi (id,khoanMuc,soTien,ngayChi,hinhThuc,dienGiai,nguoiDeXuat,deXuatLuc,trangThai) VALUES (?,?,?,?,'ck','x','nv',?, 'daDuyet')").run(id, km, tien, ngay(k, 5), ngay(k, 5));
chi('C1', 'tiepThi', 4000000, 1); chi('C2', 'tiepThi', 2000000, 2); chi('C3', 'luong', 9000000, 1);
sq.prepare("INSERT INTO hoaHongTra (id, nhaKem, nhaDuocKem, tangVuot, bac, phanTram, goiCanCu, soTien, trangThai, traLuc, sinhLuc) VALUES ('H1','N1','N11',2,'B5',5,40000000,2000000,'daTra',?,?)").run(ngay(1, 20), ngay(1, 20));
/* lead: tháng -1: 20, 10 kích hoạt */
for (let i = 0; i < 20; i++) sq.prepare('INSERT INTO dangKyCho (id, email, trangThai, createdAt) VALUES (?,?,?,?)').run('D' + i, i + '@x', i < 10 ? 'xong' : 'choKichHoat', ngay(1, 8) + 'T00:00:00Z');
/* đăng nhập đột biến hôm qua */
const hn = new Date().toISOString().slice(0, 10);
const luiN = n => { const d = new Date(hn + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() - n); return d.toISOString().slice(0, 10); };
let au = 0; for (let n = 2; n <= 40; n++) for (let j = 0; j < 3; j++) sq.prepare("INSERT INTO audit (id,luc,uid,viec) VALUES (?,?, 'A1','DANG_NHAP')").run('AU' + (au++), luiN(n) + 'T08:00:00Z');
for (let j = 0; j < 40; j++) sq.prepare("INSERT INTO audit (id,luc,uid,viec) VALUES (?,?, 'A1','DANG_NHAP')").run('AU' + (au++), luiN(1) + 'T08:00:00Z');

const hs = (uid, u, role) => ({ uid, u, role });
const A1 = hs('A1', 'chu', 'R01'), A3 = hs('A3', 'gd', 'R03'), A4 = hs('A4', 'ql', 'R04');
kiem('R04 không mở nền tảng chiến lược', (await M.docChienLuocV20({}, {}, db, A4)).code === 'NOPERM');
const d = await M.docChienLuocV20({}, {}, db, A1);
const iL = d.thang.length - 2, iP = iL - 1;
kiem('13 tháng (12 trọn + tháng đang chạy), chuỗi đủ', d.ok && d.thang.length === 13 && d.chuoi.thu.length === 13);
kiem('North Star: tháng -2 có 10, tháng -1 có 12 nhà tích cực', d.chuoi.nhaTichCuc[iP] === 10 && d.chuoi.nhaTichCuc[iL] === 12);
kiem('dòng chảy: giữ 8 · mất 2 · mới 4 · churn 20%', d.dong.giuLai === 8 && d.dong.mat === 2 && d.dong.moiVaQuayLai === 4 && d.chuoi.churn[iL] === 20);
kiem('cây động lực: thu 20tr = 8 nhà × 2,5tr (trước 10tr = 5 × 2tr)', d.cay.thu === 20000000 && d.cay.nha === 8 && d.cay.tb === 2500000 && d.cay.thuTruoc === 10000000);
kiem('tách: +10tr = số nhà +6,75tr + thu TB +3,25tr; nhà trả tiền N5..N12: mới vào tháng ấy 2 (N11, N12), cũ 6', d.cay.tach.tong === 10000000 && d.cay.tach.phanSoNha === 6750000 && d.cay.tach.phanTrungBinh === 3250000 && d.cay.nhaMoiTra === 2 && d.cay.nhaCuTra === 6);
kiem('CAC = (6tr tiếp thị + 2tr hoa hồng) ÷ 14 nhà mới; lương không tính', d.ktDonVi.cac === Math.round(8000000 / 14) && d.ktDonVi.nhaMoi3 === 14);
kiem('ARPU 2,5tr; LTV, LTV/CAC, hoàn vốn tính được', d.ktDonVi.arpu === 2500000 && d.ktDonVi.ltv > 0 && d.ktDonVi.ltvCac > 0 && d.ktDonVi.hoanVon > 0);
const nh = d.nhom.find(n => n.thang === thang(2));
kiem('nhóm khách tháng -2: 10 nhà, tháng 0 giữ 100%, tháng 1 giữ 80%', nh && nh.soNha === 10 && nh.giu[0] === 100 && nh.giu[1] === 80);
kiem('phễu: lead 20 → kích hoạt 10 (50%)', d.pheu[0].n === 20 && d.pheu[1].n === 10 && d.pheu[1].tyLe === 50);
const dnhap = d.batThuong.find(x => x.ma === 'dangnhap');
kiem('bất thường: đăng nhập hôm qua 40 (nền 3/ngày) → đỏ', dnhap.homQua === 40 && dnhap.muc === 'do' && dnhap.chuoi.length === 30);
kiem('bảng chưa có dữ liệu → bất thường "chưa đo", không báo động giả', d.batThuong.find(x => x.ma === 'loiai').muc === 'chuaDo');
kiem('độ tin cậy dữ liệu 0–100, có nguồn tươi và nguồn trống', d.tinCay >= 0 && d.tinCay <= 100 && d.nguon.some(n => n.tt === 'tuoi') && d.nguon.some(n => n.tt === 'trong'));
kiem('cơ số mô phỏng đủ 7 đòn bẩy', ['lead', 'kichHoat', 'vaoHoc', 'nha', 'giuChan', 'traTien', 'arpu'].every(k => typeof d.coSo[k] === 'number'));
kiem('dự báo: chuỗi 12 tháng có điểm 0 vẫn chạy, không âm', d.duBao.thu && d.duBao.thu.duBao.every(v => v >= 0));
kiem('đọc nền tảng KHÔNG ghi audit', sq.prepare('SELECT COUNT(*) n FROM audit').get().n === au);

/* ── mục tiêu chiến lược ── */
const han = luiN(-90);
kiem('R03 không đặt mục tiêu chiến lược', (await M.taoMucTieuCL({ ten: 'Tăng nhà tích cực', chiSo: 'nhaTichCuc', giaTriDau: 12, mucTieu: 30, hanLuc: han }, {}, db, A3)).code === 'NOPERM');
kiem('chỉ số lạ bị chặn', !(await M.taoMucTieuCL({ ten: 'Mục tiêu lạ', chiSo: 'xyz', giaTriDau: 1, mucTieu: 2, hanLuc: han }, {}, db, A1)).ok);
kiem('hạn trong quá khứ bị chặn', !(await M.taoMucTieuCL({ ten: 'Tăng nhà tích cực', chiSo: 'nhaTichCuc', giaTriDau: 12, mucTieu: 30, hanLuc: luiN(3) }, {}, db, A1)).ok);
const m1 = await M.taoMucTieuCL({ ten: 'Tăng nhà tích cực', chiSo: 'nhaTichCuc', giaTriDau: 12, mucTieu: 30, hanLuc: han, chuSo: 'gd' }, {}, db, A1);
const m2 = await M.taoMucTieuCL({ ten: 'Giảm hẹn quá hạn', chiSo: 'tv4', giaTriDau: 20, mucTieu: 5, hanLuc: han }, {}, db, A1);
kiem('đặt mục tiêu theo chỉ số V20 và theo chỉ số Trung tâm (tv4)', m1.ok && m2.ok);
const ds = await M.dsMucTieuCL({}, {}, db, A3);
const x1 = ds.ds.find(x => x.id === m1.id), x2 = ds.ds.find(x => x.id === m2.id);
kiem('R03 xem mục tiêu: hiện tại 12, tiến độ 0%, có đánh giá và dự báo tại hạn', ds.ok && x1.hienTai === 12 && x1.tienDo === 0 && !!x1.danhGia && x1.trangThai === 'dang');
kiem('mục tiêu theo chỉ số Trung tâm đọc được giá trị hiện tại', x2.hienTai != null && !!x2.danhGia);
kiem('đổi mục tiêu không có lý do bị chặn', !(await M.capNhatMucTieuCL({ id: m1.id, mucTieu: 40 }, {}, db, A1)).ok);
kiem('đổi mục tiêu có lý do → ghi nối vào ghi chú', (await M.capNhatMucTieuCL({ id: m1.id, mucTieu: 40, lyDo: 'Quý này mở thêm kênh đại sứ' }, {}, db, A1)).ok &&
  /đại sứ/.test(sq.prepare('SELECT ghiChu FROM mucTieuChienLuoc WHERE id = ?').get(m1.id).ghiChu));
kiem('đánh dấu đạt; mọi thay đổi có nhật ký', (await M.capNhatMucTieuCL({ id: m2.id, trangThai: 'dat' }, {}, db, A1)).trangThai === 'dat' && sq.prepare("SELECT COUNT(*) n FROM audit WHERE viec LIKE 'CL_%'").get().n === 4);

/* ── app khớp máy chủ ── */
const ctx = { window: {} }; ctx.window.G = {}; ctx.G = ctx.window.G; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(ROOT + '/src/data-v20.js', 'utf8'), ctx);
const V = ctx.G.V20;
kiem('phiên bản app = máy chủ', V.PHIEN_BAN_V20 === T.PHIEN_BAN_V20);
kiem('danh mục chỉ số mục tiêu app = máy chủ', JSON.stringify(V.CHI_SO) === JSON.stringify(M.CHI_SO_V20));
let lech = 0, hat = 3; const rnd = () => { hat = (hat * 9301 + 49297) % 233280; return hat / 233280; };
for (let i = 0; i < 400; i++) {
  const s = Array.from({ length: 3 + Math.floor(rnd() * 10) }, () => Math.round(rnd() * 1000));
  const c2 = { lead: Math.round(rnd() * 200), kichHoat: rnd(), vaoHoc: rnd(), nha: Math.round(rnd() * 500), giuChan: rnd(), traTien: rnd(), arpu: Math.round(rnd() * 5e6) };
  const dc = { lead: rnd() - 0.5, giuChan: (rnd() - 0.5) / 5, arpu: rnd() - 0.3 };
  const m = { giaTriDau: Math.round(rnd() * 100), mucTieu: Math.round(rnd() * 200), tuLuc: '2026-01-01', hanLuc: '2026-12-31' };
  const pairs = [[T.holt(s, 3), V.holt(s, 3)], [T.zBen(s.slice(0, -1), s[s.length - 1]), V.zBen(s.slice(0, -1), s[s.length - 1])], [T.tachBienDong(s[0], s[1], s[2], s[3] || 0), V.tachBienDong(s[0], s[1], s[2], s[3] || 0)],
    [T.moPhong(c2, dc, 12), V.moPhong(c2, dc, 12)], [T.doNhay(c2, 12), V.doNhay(c2, 12)], [T.tienDo(m, s[0], '2026-0' + (1 + i % 9) + '-15', s[1]), V.tienDo(m, s[0], '2026-0' + (1 + i % 9) + '-15', s[1])]];
  if (pairs.some(([a, b]) => JSON.stringify(a) !== JSON.stringify(b))) lech++;
}
kiem('400 bộ số ngẫu nhiên: Holt · z bền · tách · mô phỏng · độ nhạy · tiến độ app = máy chủ', lech === 0);
const bt = V.banTin(JSON.parse(JSON.stringify(d)));
kiem('bản tin chiến lược chạy trên số thật: có North Star, cây động lực, LTV/CAC, đòn bẩy số 1, bất thường', bt.length >= 5 && bt.some(x => /North Star/.test(x.ten)) && bt.some(x => /LTV\/CAC/.test(x.ten)) && bt.some(x => x.donBay) && bt.some(x => /bất thường/.test(x.ten)));
kiem('mọi đòn bẩy trỏ về vấn đề có thật ở Trung tâm', (() => { const c3 = { window: {} }; c3.window.G = {}; c3.G = c3.window.G; vm.createContext(c3); vm.runInContext(fs.readFileSync(ROOT + '/src/data-toi-uu.js', 'utf8'), c3);
  return Object.values(V.DON_BAY_GP).every(a => a.every(ma => !!c3.G.TU.VAN_DE[ma])); })());

console.log('\n' + dat + ' đạt · ' + truot + ' sai');
process.exit(truot ? 1 : 0);
