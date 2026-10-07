/* Thử TRUNG TÂM ĐO LƯỜNG & TỐI ƯU — D1 giả = node:sqlite trong RAM.
   Chứng minh: chỉ R01–R03 đọc · chỉ số tính đúng từ từng bảng · chấm đạt /
   cảnh báo / xấu đúng ngưỡng · từng vai, từng người, hoạt động, kiểm tra ·
   đọc KHÔNG ghi audit · ảnh chụp một dòng mỗi ngày · kế hoạch: kiểm mã,
   tự phân bổ người ít việc nhất, chặn trùng, quyền cập nhật, chưa đủ bước
   không đóng, đóng thì đo lại · thư viện app KHỚP máy chủ (chỉ số, chấm,
   mã giải pháp · vai · hạn), mỗi vấn đề 2–5 giải pháp, màn trỏ tới có thật.
   Dùng: node tools/thu-toi-uu.mjs   (Node >= 22.5) */
import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import vm from 'node:vm';
import { pathToFileURL, fileURLToPath } from 'node:url';
const ROOT = process.argv[2] || fileURLToPath(new URL('..', import.meta.url)).replace(/[\\/]$/, '');
const M = await import(pathToFileURL(ROOT + '/may-chu/trung-tam-toi-uu.js').href);
const CH = await import(pathToFileURL(ROOT + '/may-chu/toi-uu-cham.js').href);

const sq = new DatabaseSync(':memory:');
sq.exec(fs.readFileSync(ROOT + '/may-chu/csdl.sql', 'utf8'));
const db = { prepare(sql) { let a = []; const st = {
  bind(...x) { a = x; return st; },
  first() { return Promise.resolve(sq.prepare(sql).get(...a) || null); },
  all() { return Promise.resolve({ results: sq.prepare(sql).all(...a) }); },
  run() { const r = sq.prepare(sql).run(...a); return Promise.resolve({ meta: { changes: Number(r.changes) } }); } }; return st; } };
let dat = 0, truot = 0;
const kiem = (ten, dk) => { if (dk) { dat++; console.log('OK  ' + ten); } else { truot++; console.log('SAI ' + ten); } };
const hn = new Date().toISOString().slice(0, 10);
const lui = n => { const d = new Date(hn + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() - n); return d.toISOString().slice(0, 10); };
const gioLui = n => lui(n) + 'T09:00:00Z';

/* ── dữ liệu ── */
const u = (id, un, role, extra) => sq.prepare('INSERT INTO users (id, username, role, active, createdAt) VALUES (?,?,?,1,?)').run(id, un, role, (extra && extra.tao) || gioLui(200));
u('A1', 'chu', 'R01'); u('A3', 'giamdoc', 'R03'); u('A4', 'qlcm', 'R04'); u('C1', 'coach1', 'R07'); u('C2', 'coach2', 'R07');
u('T1', 'tuvan1', 'R11'); u('T2', 'tuvan2', 'R11'); u('N9', 'nvmoi', 'R07', { tao: gioLui(10) }); u('P1', 'ph1', 'R13');
const nha = (ma, band, coach, tuVan, vao, boTro) => sq.prepare("INSERT INTO hoSoKhach (maKhachHang, uidPhuHuynh, tang, band, coach, tuVan, trangThai, vaoLuc, boTro) VALUES (?, 'P1', 2, ?, ?, ?, 'dangHoc', ?, ?)").run(ma, band, coach, tuVan, vao, boTro || null);
for (let i = 1; i <= 10; i++) nha('K' + i, i <= 2 ? 'DO' : 'XANH', i <= 9 ? 'coach1' : '', i <= 9 ? 'tuvan1' : '', i <= 4 ? gioLui(5) : gioLui(100), i === 1 ? 'K9' : null);
/* kỳ trước: 2 nhà mới */
nha('K11', 'XANH', 'coach2', 'tuvan2', gioLui(40)); nha('K12', 'XANH', 'coach2', 'tuvan2', gioLui(45));
/* chạm: K1..K8 trong 7 ngày (24 lượt), K9..K12 không */
let n = 0; for (let i = 1; i <= 8; i++) for (let j = 0; j < 3; j++) sq.prepare("INSERT INTO soCham (id,maNha,ngay,kieu,noiDung,canCu,aiDuyet,boiAi,ghiLuc) VALUES (?,?,?,?,'x','y','z','coach1',?)").run('S' + (n++), 'K' + i, lui(j + 1), j === 0 && i === 1 ? 'wow' : 'nhan', gioLui(j + 1));
/* đăng ký: 10 trong kỳ, 4 kích hoạt */
for (let i = 0; i < 10; i++) sq.prepare('INSERT INTO dangKyCho (id, email, trangThai, createdAt) VALUES (?,?,?,?)').run('D' + i, 'x' + i + '@a.vn', i < 4 ? 'xong' : 'choKichHoat', gioLui(3));
/* cơ hội: 3 thắng, 2 thua trong kỳ; 1 mở 50 triệu quá hạn chốt */
[['O1', 'thang'], ['O2', 'thang'], ['O3', 'thang'], ['O4', 'thua'], ['O5', 'thua']].forEach(([id, tt]) => sq.prepare("INSERT INTO crmCoHoi (id, maKH, ten, giaTri, giaiDoan, trangThai, taoLuc, capNhatLuc) VALUES (?, 'K1', 'x', 1000000, 'chotky', ?, ?, ?)").run(id, tt, gioLui(20), gioLui(2)));
sq.prepare("INSERT INTO crmCoHoi (id, maKH, ten, giaTri, giaiDoan, trangThai, duKienChot, taoLuc) VALUES ('O6','K2','x',50000000,'baogia','mo',?,?)").run(lui(3), gioLui(10));
/* crm: K1 phụ trách, hẹn quá hạn K2, K3 */
sq.prepare("INSERT INTO crmKhach (maKH, phuTrach, giaiDoan, henTiep) VALUES ('K2','tuvan1','tuvan',?)").run(lui(4));
sq.prepare("INSERT INTO crmKhach (maKH, phuTrach, giaiDoan, henTiep) VALUES ('K3','tuvan1','tuvan',?)").run(lui(1));
/* tài chính: thu 30tr trong kỳ, 20tr kỳ trước; chi 12tr (3tr không hoá đơn) + 1 chi chờ quá 7 ngày; 1 phiếu chờ quá 3 ngày */
sq.prepare("INSERT INTO phieuThu (id,maKhachHang,idKy,soTien,hinhThuc,nguoiGhi,ghiLuc,trangThai) VALUES ('PT1','K1','KY1',30000000,'ck','nv',?,'daDuyet')").run(gioLui(5));
sq.prepare("INSERT INTO phieuThu (id,maKhachHang,soTien,hinhThuc,nguoiGhi,ghiLuc,trangThai) VALUES ('PT2','K2',20000000,'ck','nv',?,'daDuyet')").run(gioLui(40));
sq.prepare("INSERT INTO phieuThu (id,maKhachHang,soTien,hinhThuc,nguoiGhi,ghiLuc,trangThai) VALUES ('PT3','K3',1000000,'ck','nv',?,'choDuyet')").run(gioLui(5));
const chi = (id, tien, hd, tt, ngay) => sq.prepare("INSERT INTO chiPhi (id,khoanMuc,soTien,ngayChi,hinhThuc,coHoaDon,dienGiai,nguoiDeXuat,deXuatLuc,trangThai) VALUES (?,'x',?,?,'ck',?,'x','nv',?,?)").run(id, tien, ngay, hd, gioLui(10), tt);
chi('C1', 9000000, 1, 'daDuyet', lui(4)); chi('C2', 3000000, 0, 'daDuyet', lui(4)); chi('C3', 99000000, 0, 'choDuyet', lui(4)); chi('C4', 50000000, 0, 'tuChoi', lui(4));
/* kỳ thu: KY1 30tr đã đủ; KY2 quá hạn 3tr, miễn giảm 1tr → còn nợ; KY3 quá hạn miễn đủ */
const ky = (id, ma, phai, han) => sq.prepare('INSERT INTO kyThu (id,maKhachHang,tang,ky,soKy,ngayThu,phaiThu,hanLuc,taoLuc) VALUES (?,?,2,1,1,1,?,?,?)').run(id, ma, phai, han, gioLui(60));
ky('KY1', 'K1', 30000000, lui(10)); ky('KY2', 'K2', 3000000, lui(10)); ky('KY3', 'K3', 2000000, lui(10));
sq.prepare("INSERT INTO mienGiam (id,maKhachHang,idKy,soTien,loai,theoLuat,lyDo,nguoiDeXuat,deXuatLuc,trangThai) VALUES ('MG1','K2','KY2',1000000,'x','x','x','x',?,'daDuyet')").run(gioLui(9));
sq.prepare("INSERT INTO mienGiam (id,maKhachHang,idKy,soTien,loai,theoLuat,lyDo,nguoiDeXuat,deXuatLuc,trangThai) VALUES ('MG2','K3','KY3',2000000,'x','x','x','x',?,'daDuyet')").run(gioLui(9));
/* nhân sự: đăng nhập 7 ngày: chu, giamdoc, coach1, tuvan1 (4/8 nhân sự) ; nvmoi mới chưa qua cửa */
['A1', 'A3', 'C1', 'T1'].forEach((id, i) => sq.prepare("INSERT INTO audit (id,luc,uid,username,viec) VALUES (?,?,?,?, 'DANG_NHAP')").run('AU' + i, gioLui(1), id, id));
sq.prepare("INSERT INTO audit (id,luc,uid,username,viec) VALUES ('AUc','" + gioLui(2) + "','C1','coach1','CRM_GHI')").run();
/* an toàn: 1 thanh tra nặng, 1 yêu cầu xoá quá hạn */
sq.prepare("INSERT INTO thanhTraSo (loai, mucDo, noiDung, boiAi, luc) VALUES ('x','nang','x','tt',?)").run(gioLui(3));
sq.prepare("INSERT INTO yeuCauXoa (id, maNha, boiAi, ghiLuc, hanXuLy) VALUES ('X1','K5','ph1',?,?)").run(gioLui(40), lui(5));

const hs = (uid, un, role) => ({ uid, u: un, role });
const A1 = hs('A1', 'chu', 'R01'), A3 = hs('A3', 'giamdoc', 'R03'), A4 = hs('A4', 'qlcm', 'R04'), C1 = hs('C1', 'coach1', 'R07'), T2 = hs('T2', 'tuvan2', 'R11');

/* ── đọc ── */
kiem('R04 không mở được trung tâm', (await M.docTrungTamDo({}, {}, db, A4)).code === 'NOPERM');
const auTruoc = sq.prepare('SELECT COUNT(*) n FROM audit').get().n;
const r = await M.docTrungTamDo({ ngay: 30 }, {}, db, A1);
const K = ma => r.kpi.find(k => k.ma === ma);
kiem('đọc trung tâm KHÔNG ghi thêm dòng audit', sq.prepare('SELECT COUNT(*) n FROM audit').get().n === auTruoc);
kiem('7 khối · 41 chỉ số · có điểm tổng', r.ok && r.khoi.length === 7 && r.kpi.length === CH.KPI.length && typeof r.tong === 'number');
kiem('tv1 nhà mới 4 (kỳ trước 2) → đạt', K('tv1').gt === 4 && K('tv1').truoc === 2 && K('tv1').tt === 'dat');
kiem('tv2 kích hoạt 4/10 = 40% → cảnh báo', K('tv2').gt === 40 && K('tv2').tt === 'canhBao');
kiem('tv3 nhà chưa phụ trách (không coach, không tư vấn, không CRM) 1/12 = 8,3% → cảnh báo', K('tv3').gt === 8.3 && K('tv3').tt === 'canhBao');
kiem('tv4 hẹn quá hạn 2/12 = 16,7% → xấu', K('tv4').gt === 16.7 && K('tv4').tt === 'xau');
kiem('tv5 chốt 3/(3+2) = 60% → đạt; tv6 cơ hội mở 50 triệu', K('tv5').gt === 60 && K('tv5').tt === 'dat' && K('tv6').gt === 50000000);
kiem('co1 chạm 24/12 = 2 lượt/nhà → cảnh báo', K('co1').gt === 2 && K('co1').tt === 'canhBao');
kiem('co2 im lặng 4/12 = 33,3% → xấu; co3 đèn đỏ 2/12 = 16,7% → cảnh báo', K('co2').gt === 33.3 && K('co2').tt === 'xau' && K('co3').gt === 16.7 && K('co3').tt === 'canhBao');
kiem('co6 WOW 1 (kỳ trước 0) → đạt', K('co6').gt === 1 && K('co6').tt === 'dat');
kiem('mk1 = đăng ký 10; mk6 giới thiệu 1/4 = 25% → đạt', K('mk1').gt === 10 && K('mk6').gt === 25 && K('mk6').tt === 'dat');
kiem('tc1 thu 30tr (kỳ trước 20tr) → đạt', K('tc1').gt === 30000000 && K('tc1').truoc === 20000000 && K('tc1').tt === 'dat');
kiem('tc2 chi CHỈ tính khoản đã duyệt: 12/30 = 40% → đạt', K('tc2').gt === 40 && K('tc2').tt === 'dat');
kiem('tc3 ròng 30 − 12 = 18tr; tc6 không hoá đơn 3/12 = 25% → cảnh báo', K('tc3').gt === 18000000 && K('tc6').gt === 25 && K('tc6').tt === 'canhBao');
kiem('tc4 phiếu chờ quá 3 ngày 1; tc7 chi chờ quá 7 ngày 1 (chi bị từ chối không tính)', K('tc4').gt === 1 && K('tc7').gt === 0 + sq.prepare("SELECT COUNT(*) n FROM chiPhi WHERE trangThai='choDuyet'").get().n);
kiem('tc5 kỳ quá hạn trừ cả miễn giảm: chỉ KY2 còn nợ 2tr', K('tc5').gt === 1 && r.phu.tienNo === 2000000);
kiem('ns1 đăng nhập 7 ngày 4/8 nhân sự = 50% → xấu', K('ns1').gt === 50 && K('ns1').tt === 'xau');
kiem('ns3 nhân sự mới chưa qua ba cửa = 1', K('ns3').gt === 1);
kiem('ns5 nhân sự bỏ không 30 ngày (trừ người mới) = 3', K('ns5').gt === 3);
kiem('cn4 thanh tra nặng 1 → cảnh báo; cn5 yêu cầu xoá quá hạn 1 → xấu', K('cn4').gt === 1 && K('cn4').tt === 'canhBao' && K('cn5').gt === 1 && K('cn5').tt === 'xau');
kiem('bảng chưa từng có dữ liệu (token AI) → chưa đo, không đoán', K('cn1').tt === 'chuaDo' || K('cn1').gt === 0);
const vR07 = r.vai.find(v => v.vai === 'R07');
kiem('từng vai: R07 có 3 tài khoản, 1 đăng nhập 7 ngày, thao tác đếm được', vR07.taiKhoan === 3 && vR07.vao7 === 1 && vR07.thaoTac === 2);
const ng = r.nguoi.find(x => x.u === 'coach1');
kiem('từng người: coach1 kèm 9 nhà, 24 lượt chạm, 1 lượt CRM', ng.nhaKem === 9 && ng.cham === 24 && ng.crm === 1 && r.nguoi.every(x => x.vai !== 'R13'));
const hd = r.hoatDong.ds.find(x => x.ma === 'cham');
kiem('từng hoạt động: chạm 24 kỳ này; có 18 hoạt động + top việc', hd.nay === 24 && r.hoatDong.ds.length === 18 && r.hoatDong.topViec.length > 0);
const kt = id => r.kiemTra.find(x => x.ma === id);
kiem('kết quả kiểm tra: phiếu chờ, kỳ nợ, cơ hội quá hạn chốt bị đánh dấu', !kt('KT01').dat && !kt('KT02').dat && kt('KT13').so === 1 && kt('KT08').dat);
kiem('ảnh chụp ngày: một dòng, đọc lại không thêm', sq.prepare('SELECT COUNT(*) n FROM chupTrungTam').get().n === 1);
await M.docTrungTamDo({ ngay: 30 }, {}, db, A3);
kiem('đọc lần hai cùng ngày vẫn một dòng; R03 đọc được', sq.prepare('SELECT COUNT(*) n FROM chupTrungTam').get().n === 1);
const ls = await M.lichSuTrungTamDo({}, {}, db, A1);
kiem('lịch sử điểm đọc được', ls.ok && ls.ds.length === 1 && ls.ds[0].khoi.length === 7);
const r7 = await M.docTrungTamDo({ ngay: 7 }, {}, db, A1);
kiem('kỳ 7 ngày: ngưỡng chạm co theo kỳ (4 × 7/30 = 0,9)', r7.kpi.find(k => k.ma === 'co1').nguong.muc === 0.9);

/* ── phân bổ & kế hoạch ── */
const goi = await M.goiYPhanBo({ maGiaiPhap: 'tv4-1' }, {}, db, A1);
kiem('gợi ý phân bổ tv4-1: vai R11, 2 ứng viên', goi.ok && goi.vai.join() === 'R11' && goi.ungVien.length === 2);
kiem('mã giải pháp lạ bị chặn', !(await M.taoKeHoachToiUu({ maGiaiPhap: 'xx-9', buoc: ['a'] }, {}, db, A1)).ok);
kiem('kế hoạch không có bước bị chặn', !(await M.taoKeHoachToiUu({ maGiaiPhap: 'tv4-1', buoc: [] }, {}, db, A1)).ok);
kiem('R04 không giao kế hoạch', (await M.taoKeHoachToiUu({ maGiaiPhap: 'tv4-1', buoc: ['a'] }, {}, db, A4)).code === 'NOPERM');
const k1 = await M.taoKeHoachToiUu({ maGiaiPhap: 'tv4-1', ten: 'Dọn hẹn quá hạn', buoc: ['Lọc', 'Gọi', 'Đóng'], giaTriDau: 16.7, mucTieu: 5 }, {}, db, A1);
kiem('tự phân bổ: chọn tư vấn đăng nhập gần nhất khi cùng 0 việc (tuvan1)', k1.ok && k1.cachChon === 'tuPhanBo' && k1.nguoiPhuTrach === 'tuvan1');
kiem('giao xong có dòng nhật ký TOIUU_GIAO', !!sq.prepare("SELECT 1 FROM audit WHERE viec='TOIUU_GIAO'").get());
kiem('cùng giải pháp đang chạy thì chặn trùng', (await M.taoKeHoachToiUu({ maGiaiPhap: 'tv4-1', buoc: ['a'] }, {}, db, A1)).code === 'TRUNG');
const k2 = await M.taoKeHoachToiUu({ maGiaiPhap: 'tv5-1', buoc: ['a'] }, {}, db, A1);
kiem('việc thứ hai cùng vai giao cho người ít việc hơn (tuvan2)', k2.ok && k2.nguoiPhuTrach === 'tuvan2');
kiem('người không phụ trách không cập nhật được', (await M.capNhatKeHoachToiUu({ id: k1.id, buocXong: [0] }, {}, db, T2)).code === 'NOPERM');
const T1 = hs('T1', 'tuvan1', 'R11');
let c = await M.capNhatKeHoachToiUu({ id: k1.id, buocXong: [0] }, {}, db, T1);
kiem('người phụ trách tick bước → tự chuyển "đang làm", tiến độ 33%', c.ok && c.trangThai === 'dangLam' && c.tienDo === 33);
kiem('còn bước chưa xong thì không đóng được', !(await M.capNhatKeHoachToiUu({ id: k1.id, trangThai: 'xong' }, {}, db, T1)).ok);
kiem('nhân sự không huỷ được kế hoạch', (await M.capNhatKeHoachToiUu({ id: k1.id, trangThai: 'huy' }, {}, db, T1)).code === 'NOPERM');
sq.prepare("UPDATE crmKhach SET henTiep = ? WHERE maKH = 'K2'").run(lui(-3));
c = await M.capNhatKeHoachToiUu({ id: k1.id, buocXong: [0, 1, 2], trangThai: 'xong' }, {}, db, T1);
kiem('đóng kế hoạch → máy ĐO LẠI chỉ số: hẹn quá hạn 16,7% → 8,3%', c.ok && c.trangThai === 'xong' && c.ketQua === 8.3 && c.giaTriDau === 16.7);
kiem('kế hoạch đã đóng không sửa được', !(await M.capNhatKeHoachToiUu({ id: k1.id, ghiChu: 'x' }, {}, db, A1)).ok);
const dsQ = await M.dsKeHoachToiUu({}, {}, db, A1), dsT = await M.dsKeHoachToiUu({}, {}, db, T2);
kiem('R01 thấy mọi kế hoạch + tải việc; nhân sự chỉ thấy việc mình', dsQ.ds.length === 2 && dsQ.taiViec.length === 1 && dsT.ds.length === 1 && dsT.ds[0].nguoiPhuTrach === 'tuvan2');
kiem('phụ huynh không xem việc tối ưu', (await M.dsKeHoachToiUu({}, {}, db, hs('P1', 'ph1', 'R13'))).code === 'NOPERM');
sq.prepare("UPDATE keHoachToiUu SET hanLuc = ? WHERE id = ?").run(lui(2), k2.id);
const r2 = await M.docTrungTamDo({ ngay: 30 }, {}, db, A1);
kiem('việc tối ưu quá hạn hiện ở ns4 và kiểm tra KT12', r2.kpi.find(k => k.ma === 'ns4').gt === 1 && !r2.kiemTra.find(x => x.ma === 'KT12').dat);

/* ── app khớp máy chủ ── */
const ctx = { window: {} }; ctx.window.G = {}; ctx.G = ctx.window.G; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(ROOT + '/src/data-toi-uu.js', 'utf8'), ctx);
const TU = ctx.G.TU;
kiem('phiên bản app = máy chủ', TU.PHIEN_BAN_TU === CH.PHIEN_BAN_TU);
kiem('7 khối và 41 chỉ số app = máy chủ (mã, kiểu, ngưỡng)', JSON.stringify(TU.KHOI) === JSON.stringify(CH.KHOI) && JSON.stringify(TU.KPI) === JSON.stringify(CH.KPI));
let lech = 0, hat = 7; const rnd = () => { hat = (hat * 9301 + 49297) % 233280; return hat / 233280; };
for (let i = 0; i < 400; i++) {
  const gt = {}, tr = {}; CH.KPI.forEach(k => { gt[k.ma] = rnd() < 0.1 ? null : Math.round(rnd() * 120); tr[k.ma] = rnd() < 0.2 ? null : Math.round(rnd() * 100); });
  const ngay = [7, 30, 90][i % 3];
  if (JSON.stringify(TU.chamHet(gt, tr, ngay)) !== JSON.stringify(CH.chamHet(gt, tr, ngay))) lech++;
}
kiem('400 bộ số ngẫu nhiên: chấm từng chỉ số, điểm khối, điểm tổng app = máy chủ', lech === 0);
kiem('mã giải pháp · chỉ số · vai · hạn app = máy chủ (' + Object.keys(CH.GIAI_PHAP).length + ' giải pháp)', JSON.stringify(Object.keys(TU.GIAI_PHAP).sort().map(k => [k, TU.GIAI_PHAP[k]])) === JSON.stringify(Object.keys(CH.GIAI_PHAP).sort().map(k => [k, CH.GIAI_PHAP[k]])));
const chamDuoc = CH.KPI.filter(k => k.kieu !== 'theoDoi');
kiem('mọi chỉ số chấm được đều có vấn đề + 2–5 giải pháp', chamDuoc.every(k => TU.VAN_DE[k.ma] && TU.VAN_DE[k.ma].gp.length >= 2 && TU.VAN_DE[k.ma].gp.length <= 5));
kiem('mỗi giải pháp có ≥ 3 bước, tác động & công sức 1–3', Object.values(TU.VAN_DE).every(v => v.gp.every(g => g.buoc.length >= 3 && g.tacDong >= 1 && g.tacDong <= 3 && g.congSuc >= 1 && g.congSuc <= 3)));
const src = fs.readdirSync(ROOT + '/src').filter(f => f.endsWith('.js')).map(f => fs.readFileSync(ROOT + '/src/' + f, 'utf8')).join('\n');
const coMan = v => new RegExp("G\\.VIEWS\\[\\s*'" + v.replace(/[-]/g, '\\-') + "'\\s*\\]\\s*=").test(src) || new RegExp("VIEW\\s*=\\s*'" + v + "'").test(src) || (v.indexOf('coach-') === 0 && new RegExp("['\"]" + v + "['\"]").test(src));
const manTro = new Set(); Object.values(TU.VAN_DE).forEach(v => v.gp.forEach(g => manTro.add(g.man))); Object.values(TU.BAN_DO).forEach(a => a.forEach(x => manTro.add(x[0]))); TU.KHOI.forEach(k => manTro.add(k.man));
const thieu = [...manTro].filter(v => !coMan(v));
kiem('mọi màn được trỏ tới đều có thật' + (thieu.length ? ' — thiếu: ' + thieu.join(', ') : ''), thieu.length === 0);

console.log('\n' + dat + ' đạt · ' + truot + ' sai');
process.exit(truot ? 1 : 0);
