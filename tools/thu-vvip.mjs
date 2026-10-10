/* Thử GITA 365 VVIP — Master Blueprint 1.0 (may-chu/vvip.js).
   D1 giả = node:sqlite. Đo CỔNG và HÀNH VI: ai được làm gì, con số tính từ
   sổ có đúng không, chỗ chưa đo được có nói ra thay vì trả 0 không. Mỗi cổng
   chính có một phép phá thử — gỡ cổng thì phép đo phải đỏ.
   Dùng: node tools/thu-vvip.mjs   (Node >= 22.5) */
import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import { pathToFileURL, fileURLToPath } from 'node:url';
const ROOT = fileURLToPath(new URL('..', import.meta.url)).replace(/[\\/]$/, '');
globalThis.fetch = async () => { throw new Error('không gọi mạng ngoài'); };
let dat = 0, truot = 0;
const kiem = (ten, dk, ct) => { if (dk) { dat++; console.log('OK  ' + ten); } else { truot++; const d = 'SAI ' + ten + (ct ? ' — ' + ct : ''); console.log(d);
  if (process.env.GITHUB_ACTIONS) console.log('::error title=thu-vvip::' + d.replace(/[\r\n%]/g, ' ').slice(0, 900)); } };

const NGAY = 86400000, iso = t => new Date(t).toISOString(), truoc = n => iso(Date.now() - n * NGAY);
function dung() {
  const sq = new DatabaseSync(':memory:');
  sq.exec(fs.readFileSync(ROOT + '/may-chu/csdl.sql', 'utf8'));
  const db = { prepare(sql) { let a = []; const st = { bind(...x) { a = x; return st; },
      first() { try { return Promise.resolve(sq.prepare(sql).get(...a) || null); } catch (e) { return Promise.reject(e); } },
      all() { try { return Promise.resolve({ results: sq.prepare(sql).all(...a) }); } catch (e) { return Promise.reject(e); } },
      run() { try { const r = sq.prepare(sql).run(...a); return Promise.resolve({ meta: { changes: Number(r.changes) } }); } catch (e) { return Promise.reject(e); } } }; return st; },
    async batch(ds) { sq.exec('BEGIN'); try { for (const s of ds) await s.run(); sq.exec('COMMIT'); } catch (e) { sq.exec('ROLLBACK'); throw e; } } };
  for (const [id, u, r] of [['U1', 'chu', 'R01'], ['U2', 'admin', 'R02'], ['U3', 'giamdoc', 'R03'], ['U5', 'truongcoach', 'R05'],
    ['U7', 'coach1', 'R07'], ['U8', 'coach2', 'R07'], ['U11', 'tuvan1', 'R11']])
    sq.prepare('INSERT INTO users (id, username, email, role, active) VALUES (?,?,?,?,1)').run(id, u, u + '@gita.vn', r);
  /* Mười nhà: K1 doanh thu lớn nhất, K10 không doanh thu. K1–K3 do coach1 phụ trách. */
  for (let i = 1; i <= 10; i++) {
    sq.prepare("INSERT INTO users (id, username, role, active, maKhachHang) VALUES (?,?,'R13',1,?)").run('P' + i, 'ph' + i, 'K' + i);
    sq.prepare("INSERT INTO hoSoKhach (maKhachHang, uidPhuHuynh, tang, coach, tuVan, trangThai, vaoLuc, boTro, band) VALUES (?,?,?,?,?,'dangHoc',?,?,?)")
      .run('K' + i, 'P' + i, i <= 2 ? 4 : 2, i <= 3 ? 'coach1' : 'coach2', 'tuvan1', i <= 5 ? truoc(400) : truoc(60), i === 4 ? 'K1' : null, i === 3 ? 'DO' : 'XANH');
    if (i <= 9) sq.prepare("INSERT INTO phieuThu (id, maKhachHang, soTien, hinhThuc, nguoiGhi, ghiLuc, nguoiDuyet, duyetLuc, trangThai) VALUES (?,?,?,'chuyenKhoan','kt',?, 'kt2', ?, 'daDuyet')")
      .run('PT' + i, 'K' + i, i === 1 ? 50e6 : (i === 2 ? 30e6 : 2e6), truoc(30), truoc(30));
  }
  /* kỳ gốc: K1 đã có 20tr năm trước → tăng trưởng đo được */
  sq.prepare("INSERT INTO phieuThu (id, maKhachHang, soTien, hinhThuc, nguoiGhi, ghiLuc, nguoiDuyet, duyetLuc, trangThai) VALUES ('PT0','K1',20000000,'chuyenKhoan','kt',?,'kt2',?,'daDuyet')").run(truoc(500), truoc(500));
  /* phiếu CHỜ duyệt không được tính */
  sq.prepare("INSERT INTO phieuThu (id, maKhachHang, soTien, hinhThuc, nguoiGhi, ghiLuc, trangThai) VALUES ('PTC','K9',900000000,'chuyenKhoan','kt',?,'choDuyet')").run(truoc(5));
  /* hoàn đã duyệt trừ doanh thu K2 */
  sq.prepare("INSERT INTO hoanTien (id, maKhachHang, soTien, theoLuat, lyDo, nguoiDeXuat, deXuatLuc, nguoiDuyet, duyetLuc, trangThai) VALUES ('HT1','K2',5000000,'luat','ly do','kt',?,'gd',?,'daDuyet')").run(truoc(200), truoc(200));
  sq.prepare("INSERT INTO danhGiaKH (maNha, uid, thang, csat, nps, luc) VALUES ('K1','P1','2026-09',5,10,?)").run(truoc(20));
  sq.prepare("INSERT INTO lichSuTang (id, maKhachHang, tuTang, denTang, luc) VALUES ('LT1','K1',3,4,?)").run(truoc(100));
  sq.prepare("INSERT INTO soCham (id, maNha, ngay, kieu, noiDung, canCu, aiDuyet, boiAi, ghiLuc) VALUES ('SC1','K1',?,'goi','gọi','thử','truongcoach','coach1',?)").run(truoc(2).slice(0, 10), truoc(2));
  return { sq, db };
}
const ho = (u, role, uid) => ({ u, role, uid });
const chu = ho('chu', 'R01', 'U1'), ad = ho('admin', 'R02', 'U2'), gd = ho('giamdoc', 'R03', 'U3'), ql = ho('truongcoach', 'R05', 'U5'),
  c1 = ho('coach1', 'R07', 'U7'), c2 = ho('coach2', 'R07', 'U8'), ph1 = ho('ph1', 'R13', 'P1');
const DC = { ten: 'Bản tin tiến độ tuần riêng cho nhà VVIP', giaiDoan: 'G4', nhomWow: 'WOW05', kieuCham: 'nhan',
  doiTuong: 'Phụ huynh nhà VVIP đã qua tuần đầu', thoiDiem: 'Cuối mỗi tuần theo nhịp đã thống nhất', nhuCau: 'Biết con đang ở đâu mà không phải hỏi',
  thongDiep: 'Ba việc đã xong, một việc cần cải thiện, một gợi ý tuần sau', hanhDong: 'Phụ huynh làm thử gợi ý tuần sau', chiuTrachNhiem: 'AI soạn nháp, coach hạng A duyệt và gửi',
  doLuong: 'Mức hữu ích của bản tin, tỷ lệ hoàn thành mục tiêu tuần' };
const CD = { mau: 'CS02', ten: 'Rà soát quý IV cùng coach hạng A', mucTieu: 'Mỗi nhà VVIP có biên bản rà soát quý nêu việc đã đổi, chưa đổi và một bước tiếp theo',
  doLuong: 'Số biên bản rà soát / số nhà VVIP', noiDung: 'Đọc sổ chạm và tiến bộ của quý trước buổi gặp, buổi rà soát 45 phút để cha mẹ nói trước, ghi biên bản trong 24 giờ sau buổi.',
  khongLam: 'Không biến buổi rà soát thành buổi chào gói mới', batDau: iso(Date.now() - 5 * NGAY).slice(0, 10), ketThuc: iso(Date.now() + 20 * NGAY).slice(0, 10), doiTuong: ['VVIP'] };

async function chay(V) {
  const { sq, db } = dung(), env = {}, r = {};
  /* nhận diện */
  r.ndKhach = await V.nhanDienVvip({}, env, db, ph1);
  r.ndCoach = await V.nhanDienVvip({}, env, db, c1);
  r.ndQL = await V.nhanDienVvip({}, env, db, ql);
  r.ndCEO = await V.nhanDienVvip({}, env, db, gd);
  /* quyết nhóm hai người */
  r.dxNgan = await V.deXuatNhomVvip({ maNha: 'K1', nhom: 'VVIP', lyDo: 'nhà tốt' }, env, db, c1);
  r.dxNgoai = await V.deXuatNhomVvip({ maNha: 'K5', nhom: 'VVIP', lyDo: 'Nhà đồng hành trên một năm, đã lên tầng bốn, giới thiệu một nhà.' }, env, db, c1);
  r.dx = await V.deXuatNhomVvip({ maNha: 'K1', nhom: 'VVIP', lyDo: 'Nhà đồng hành trên một năm, đã lên tầng bốn, giới thiệu nhà K4, phiếu hài lòng 5/5.' }, env, db, c1);
  r.dxTrung = await V.deXuatNhomVvip({ maNha: 'K1', nhom: 'VIP', lyDo: 'Đề xuất thứ hai cho cùng nhà khi đề xuất đầu còn đang chờ duyệt.' }, env, db, c1);
  r.duyetCoach = await V.duyetNhomVvip({ id: r.dx.id }, env, db, c1);
  r.dxQL = await V.deXuatNhomVvip({ maNha: 'K2', nhom: 'VIP', lyDo: 'Nhà tầng bốn, doanh thu trong nhóm đầu, nhịp chạm đều suốt tháng qua.' }, env, db, gd);
  r.tuDuyet = await V.duyetNhomVvip({ id: r.dxQL.id }, env, db, gd);
  r.duyet = await V.duyetNhomVvip({ id: r.dx.id }, env, db, gd);
  r.duyet2 = await V.duyetNhomVvip({ id: r.dxQL.id }, env, db, chu);
  r.tangSau = sq.prepare("SELECT tang FROM hoSoKhach WHERE maKhachHang = 'K1'").get().tang;
  /* phân công — hạng thật từ chamMotNguoi (không có dữ liệu thi → D) */
  r.pcCoach = await V.phanCongVvip({ maNha: 'K1', nguoi: 'coach1' }, env, db, c1);
  r.pcChuaNhom = await V.phanCongVvip({ maNha: 'K7', nguoi: 'coach1' }, env, db, gd);
  r.pcSaiVai = await V.phanCongVvip({ maNha: 'K1', nguoi: 'tuvan1', vaiTro: 'coach' }, env, db, gd);
  r.pcD = await V.phanCongVvip({ maNha: 'K1', nguoi: 'coach2' }, env, db, gd);
  /* đồng hồ phục vụ */
  r.pv = await V.soatPhucVuVvip({}, env, db, gd);
  r.pvCoach = await V.soatPhucVuVvip({}, env, db, c1);
  /* thư viện điểm chạm */
  r.dcThieu = await V.soanDiemCham({ diemCham: { ...DC, doLuong: 'ít' } }, env, db, c1);
  r.dcTuyetDoi = await V.soanDiemCham({ diemCham: { ...DC, thongDiep: 'Chương trình tốt nhất cho con nhà bạn, cam kết đúng hạn' } }, env, db, c1);
  r.dcKhach = await V.soanDiemCham({ diemCham: DC }, env, db, ph1);
  r.dc = await V.soanDiemCham({ ma: 'DC-T01', diemCham: DC }, env, db, c1);
  r.dcTuBat = await V.duyetDiemCham({ ma: 'DC-T01', chuan: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] }, env, db, ho('coach1', 'R05', 'U7'));
  r.dcChin = await V.duyetDiemCham({ ma: 'DC-T01', chuan: [0, 1, 2, 3, 4, 5, 6, 7, 8] }, env, db, ql);
  r.dcBat = await V.duyetDiemCham({ ma: 'DC-T01', chuan: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] }, env, db, ql);
  r.dcSuaDe = await V.soanDiemCham({ ma: 'DC-T01', diemCham: DC }, env, db, c1);
  r.mauKhach = await V.napMauDiemCham({}, env, db, gd);
  r.mau = await V.napMauDiemCham({}, env, db, chu);
  r.mau2 = await V.napMauDiemCham({}, env, db, chu);
  await V.duyetDiemCham({ ma: 'DC-M01', chuan: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] }, env, db, ql);
  await V.duyetDiemCham({ ma: 'DC-M08', chuan: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] }, env, db, ql);
  r.dsDC = await V.dsDiemCham({}, env, db, c1);
  /* kích hoạt — năm quy tắc tần suất */
  r.khChuaBat = await V.kichHoatDiemCham({ ma: 'DC-M02', maNha: 'K1' }, env, db, c1);
  r.khNgoaiNha = await V.kichHoatDiemCham({ ma: 'DC-T01', maNha: 'K6' }, env, db, c1);
  r.khQuangBaDangHoc = await V.kichHoatDiemCham({ ma: 'DC-M01', maNha: 'K1' }, env, db, c1);
  r.khRecovery = await V.kichHoatDiemCham({ ma: 'DC-T01', maNha: 'K3' }, env, db, c1);
  r.khRecoveryHoTro = await V.kichHoatDiemCham({ ma: 'DC-M08', maNha: 'K3' }, env, db, c1);
  sq.prepare("INSERT INTO soCham (id, maNha, ngay, kieu, noiDung, canCu, aiDuyet, boiAi, ghiLuc) VALUES ('SC2','K2',?,'nhan','x','DC:DC-T01 · WOW05','truongcoach','coach1',?)").run(truoc(3).slice(0, 10), truoc(3));
  r.khTrung = await V.kichHoatDiemCham({ ma: 'DC-T01', maNha: 'K2' }, env, db, c1);
  for (let i = 0; i < 3; i++) sq.prepare("INSERT INTO soCham (id, maNha, ngay, kieu, noiDung, canCu, aiDuyet, boiAi, ghiLuc) VALUES (?,'K1',?,'nhan','x','khác','truongcoach','coach1',?)").run('SN' + i, truoc(1).slice(0, 10), truoc(1));
  r.khTran = await V.kichHoatDiemCham({ ma: 'DC-T01', maNha: 'K1' }, env, db, c1);
  r.tcKhach = await V.tuyChonLienHeVvip({ nhanQuangBa: false, maNha: 'K9' }, env, db, ho('ph9', 'R13', 'P9'));
  sq.prepare("UPDATE hoSoKhach SET trangThai = 'tamDung' WHERE maKhachHang = 'K9'").run();
  r.khTuChoi = await V.kichHoatDiemCham({ ma: 'DC-M01', maNha: 'K9' }, env, db, gd);
  r.khQua = await V.kichHoatDiemCham({ ma: 'DC-T01', maNha: 'K5' }, env, db, gd);
  /* hồ sơ 12 tài liệu */
  r.hsMay = await V.luuHoSoVvip({ maNha: 'K1', taiLieu: '07', noiDung: {} }, env, db, c1);
  r.hsThieu = await V.luuHoSoVvip({ maNha: 'K1', taiLieu: '02', noiDung: { nhuCau: 'Con tự học được' } }, env, db, c1);
  r.hsNgoai = await V.luuHoSoVvip({ maNha: 'K6', taiLieu: '02', noiDung: {} }, env, db, c1);
  r.hs04 = await V.luuHoSoVvip({ maNha: 'K1', taiLieu: '04', noiDung: { nangLuc: 'a', diemManh: 'b', mucTieuTienBo: 'c' } }, env, db, c1);
  const N02 = { nhuCau: 'Con tự lập kế hoạch học mỗi tối', mongDoiPhuHuynh: 'Bớt nhắc con mỗi tối', mucTieuHocSinh: 'Tự làm xong bài trước 21 giờ', soCCCD: '001234567890' };
  r.hs1 = await V.luuHoSoVvip({ maNha: 'K1', taiLieu: '02', noiDung: N02 }, env, db, c1);
  r.hs2 = await V.luuHoSoVvip({ maNha: 'K1', taiLieu: '02', noiDung: { ...N02, mongDoiPhuHuynh: 'Bớt nhắc, con tự giác' } }, env, db, c1);
  r.docCoach = await V.docHoSoVvip({ maNha: 'K1' }, env, db, c1);
  r.docCEO = await V.docHoSoVvip({ maNha: 'K1' }, env, db, gd);
  r.docNgoai = await V.docHoSoVvip({ maNha: 'K1' }, env, db, c2);
  r.docKhach = await V.docHoSoVvip({ maNha: 'K1' }, env, db, ph1);
  r.auditDoc = sq.prepare("SELECT COUNT(*) c FROM audit WHERE viec = 'VVIP_HOSO_DOC' AND doiTuong = 'K1'").get().c;
  r.dongHs = sq.prepare("SELECT COUNT(*) c FROM hoSoVvip WHERE maNha = 'K1' AND taiLieu = '02'").get().c;
  /* chiến dịch */
  r.cdCoach = await V.lapChienDichVvip({ chienDich: CD }, env, db, c1);
  r.cdThieu = await V.lapChienDichVvip({ chienDich: { ...CD, khongLam: '' } }, env, db, ql);
  r.cdTuyetDoi = await V.lapChienDichVvip({ chienDich: { ...CD, noiDung: CD.noiDung + ' Chương trình hàng đầu cho gia đình.' } }, env, db, ql);
  r.cd = await V.lapChienDichVvip({ chienDich: CD }, env, db, gd);
  r.cdTuDuyet = await V.duyetChienDichVvip({ id: r.cd.id }, env, db, gd);
  r.cdDuyet = await V.duyetChienDichVvip({ id: r.cd.id }, env, db, chu);
  sq.prepare("INSERT INTO soCham (id, maNha, ngay, kieu, noiDung, canCu, aiDuyet, boiAi, ghiLuc) VALUES ('SCD','K1',?,'buoi','rà soát',?, 'truongcoach','coach1',?)").run(iso(Date.now()).slice(0, 10), 'CD:' + r.cd.id, iso(Date.now()));
  r.dsCD = await V.dsChienDichVvip({}, env, db, gd);
  r.dsCDQL = await V.dsChienDichVvip({}, env, db, ql);
  /* bảng 80% */
  r.bangQL = await V.bangVvip({}, env, db, ql);
  r.bang = await V.bangVvip({}, env, db, gd);
  r.ndKhachND = await V.noiDungVvip({}, env, db, ph1);
  r.nd = await V.noiDungVvip({}, env, db, c1);
  return r;
}

const V = await import(pathToFileURL(ROOT + '/may-chu/vvip.js').href);
const ND = await import(pathToFileURL(ROOT + '/may-chu/vvip-noi-dung.js').href);
const r = await chay(V);

console.log('— nhận diện');
kiem('khách không mở được danh sách nhận diện', r.ndKhach.code === 'NOPERM');
kiem('coach (R07) không mở danh sách cả hệ', r.ndCoach.code === 'NOPERM');
kiem('quản lý R05 thấy danh sách nhưng KHÔNG thấy số tiền', r.ndQL.ok && r.ndQL.xemTien === false && r.ndQL.ds.every(d => d.doanhThu12 === undefined));
kiem('R03 thấy số tiền, K2 = 30tr − 5tr hoàn = 25tr', r.ndCEO.ds.find(d => d.maNha === 'K2').doanhThu12 === 25e6);
kiem('phiếu CHỜ duyệt không tính vào doanh thu', r.ndCEO.ds.find(d => d.maNha === 'K9').doanhThu12 === 2e6);
const k1 = r.ndCEO.ds.find(d => d.maNha === 'K1');
kiem('bảy dấu hiệu, doanh thu chỉ là một', k1.dau.length === 7 && k1.dau.filter(d => d.ma === 'KINHTE').length === 1);
kiem('K1 đạt đủ dấu hiệu → máy NÊU VVIP (không tự xếp)', k1.neu === 'VVIP' && k1.nhom === 'CORE', JSON.stringify(k1.dau.map(d => d.dat)));
kiem('chưa có phiếu hài lòng thì dấu hiệu là null ("chưa biết"), không phải false', r.ndCEO.ds.find(d => d.maNha === 'K5').dau.find(d => d.ma === 'HAILONG').dat === null);
kiem('nhà đèn đỏ hiện cờ Recovery', (r.ndCEO.ds.find(d => d.maNha === 'K3').recovery || []).includes('đèn đỏ'));
console.log('— quyết nhóm');
kiem('lý do dưới 30 ký tự bị chặn', r.dxNgan.code === 'LYDONGAN');
kiem('coach không đề xuất cho nhà mình không phụ trách', r.dxNgoai.code === 'NGOAINHA');
kiem('đề xuất hợp lệ vào trạng thái chờ duyệt', r.dx.ok && r.dx.trangThai === 'choDuyet');
kiem('một nhà không có hai đề xuất cùng chờ', r.dxTrung.code === 'DANGCHO');
kiem('coach không duyệt được', r.duyetCoach.code === 'NOPERM');
kiem('người đề xuất không tự duyệt', r.tuDuyet.code === 'TUDUYET');
kiem('duyệt ghi ảnh chụp bảy dấu hiệu lúc duyệt', r.duyet.ok && r.duyet.canCuMay && r.duyet.canCuMay.dau.length === 7);
kiem('quyết nhóm KHÔNG đụng tầng học', r.tangSau === 4);
console.log('— phân công người phục vụ');
kiem('coach không phân công được', r.pcCoach.code === 'NOPERM');
kiem('nhà chưa vào nhóm không phân công theo nhóm', r.pcChuaNhom.code === 'CHUANHOM');
kiem('tư vấn viên không nhận vai coach', r.pcSaiVai.code === 'SAIVAI');
kiem('người hạng D (đọc từ bảng xếp hạng thật) không phục vụ nhà VVIP', r.pcD.code === 'DUOICHUAN' && r.pcD.hang === 'D', JSON.stringify(r.pcD));
console.log('— đồng hồ phục vụ');
kiem('coach không mở đồng hồ cả hệ', r.pvCoach.code === 'NOPERM');
const pvK1 = r.pv.ds.find(d => d.maNha === 'K1'), pvK2 = r.pv.ds.find(d => d.maNha === 'K2');
kiem('K1 chạm 2 ngày trước, nhịp VVIP 4 ngày → trong hạn', pvK1 && pvK1.nhip === 4 && pvK1.quaHan === false, JSON.stringify(pvK1));
kiem('K2 chưa có lượt chạm nào → quá hạn ngay (im lặng đếm từ đầu)', pvK2 && pvK2.quaHan === true && pvK2.ngayTuChamCuoi === null);
kiem('chưa có phân công đạt chuẩn thì nêu ra', pvK1.chuaPhanCongChuan === true);
console.log('— thư viện điểm chạm');
kiem('thiếu lớp "đo lường" bị chặn', r.dcThieu.code === 'THIEULOP' && r.dcThieu.thieu.includes('doLuong'));
kiem('từ tuyệt đối bị chặn (tiêu chuẩn 5)', r.dcTuyetDoi.code === 'TUYETDOI');
kiem('khách không soạn điểm chạm', r.dcKhach.code === 'NOPERM');
kiem('người soạn không tự bật', r.dcTuBat.code === 'TUDUYET');
kiem('tích chín tiêu chuẩn là không bật', r.dcChin.code === 'THIEUCHUAN' && r.dcChin.thieu.length === 1);
kiem('người khác tích đủ mười thì bật', r.dcBat.ok && r.dcBat.trangThai === 'daDuyet');
kiem('điểm chạm đang bật không sửa đè được', r.dcSuaDe.code === 'DABAT');
kiem('chỉ Super Admin nạp mẫu; nạp hai lần không nhân đôi', r.mauKhach.code === 'NOPERM' && r.mau.moi === 10 && r.mau2.moi === 0);
kiem('mẫu nạp ở trạng thái CHỜ duyệt', r.dsDC.ds.filter(d => /^DC-M/.test(d.ma) && d.trangThai === 'choDuyet').length === 8);
kiem('đếm theo năm giai đoạn, sức chứa 10.000, mốc 100', r.dsDC.theoGiaiDoan.length === 5 && r.dsDC.sucChua === 10000 && r.dsDC.moc === 100);
kiem('phân bổ năm giai đoạn giữ nguyên văn (8.500) và NÊU riêng 1.500 chưa phân bổ, không san cho khớp',
  r.dsDC.theoGiaiDoan.reduce((s, g) => s + g.phanBo, 0) === 8500 && r.dsDC.chuaPhanBo === 1500);
console.log('— năm quy tắc tần suất');
kiem('điểm chạm chưa bật không gửi được', r.khChuaBat.code === 'CHUABAT');
kiem('không gửi cho nhà mình không phụ trách', r.khNgoaiNha.code === 'NGOAINHA');
kiem('TS3: nhà đang học không nhận điểm chạm thu hút', r.khQuangBaDangHoc.code === 'DANGHOC');
kiem('TS5: nhà Recovery chỉ nhận WOW09', r.khRecovery.code === 'RECOVERY');
kiem('TS5: WOW09 cho nhà Recovery đi tiếp tới ghiCham', r.khRecoveryHoTro.code !== 'RECOVERY' && r.khRecoveryHoTro.quyTac === undefined, JSON.stringify(r.khRecoveryHoTro));
kiem('TS2: cùng điểm chạm, cùng nhà trong 14 ngày bị chặn', r.khTrung.code === 'TRUNGLAP');
kiem('TS1: đủ 3 lượt nhắn trong 7 ngày thì chặn', r.khTran.code === 'VUOTTRAN');
kiem('TS4: gia đình tự từ chối quảng bá → dừng', r.tcKhach.ok && r.khTuChoi.code === 'TUCHOI', JSON.stringify(r.khTuChoi));
kiem('qua đủ năm quy tắc thì đi vào ĐÚNG ghiCham (gặp cổng của ghiCham, không lối riêng)', ['CHUACO', 'CHUAQUACUA', 'KHONGDONGY', 'CHUADONGY'].includes(r.khQua.code) || r.khQua.ok === true, JSON.stringify(r.khQua));
console.log('— bộ hồ sơ 12 tài liệu');
kiem('tài liệu máy ghép không gõ tay được', r.hsMay.code === 'MAYGHEP');
kiem('thiếu trường bắt buộc bị chặn', r.hsThieu.code === 'THIEUTRUONG');
kiem('coach không ghi hồ sơ nhà khác', r.hsNgoai.code === 'NGOAINHA');
kiem('tài liệu 04 (dữ liệu con) chặn khi chưa có đồng ý dữ liệu con', ['CHUAHOI', 'CHUACO', 'DARUT', 'CHUADONGY'].includes(r.hs04.code) || r.hs04.ok === false, JSON.stringify(r.hs04));
kiem('sửa là phiên bản mới, không ghi đè', r.hs1.phienBan === 1 && r.hs2.phienBan === 2 && r.dongHs === 2);
kiem('trường lạ (số giấy tờ) bị bỏ — chỉ thu thông tin cần thiết', r.docCoach.ban['02'] && r.docCoach.ban['02'].noiDung.soCCCD === undefined);
kiem('đọc ra bản mới nhất', r.docCoach.ban['02'].noiDung.mongDoiPhuHuynh === 'Bớt nhắc, con tự giác');
kiem('coach KHÔNG thấy tài liệu 09 (tài chính); R03 thấy', r.docCoach.may['09'] === undefined && r.docCEO.may['09'] && r.docCEO.may['09'].doanhThuThucThu12 === 50e6);
kiem('tài liệu 09: lợi nhuận đóng góp để trống, không ước bừa', r.docCEO.may['09'].loiNhuanDongGop === null);
kiem('coach khác và khách không mở được hồ sơ', r.docNgoai.code === 'NGOAINHA' && r.docKhach.code === 'NGOAINHA');
kiem('mỗi lượt mở hồ sơ vào nhật ký', r.auditDoc === 2);
kiem('độ đầy hồ sơ tính trên tài liệu cần viết', r.docCoach.doDay.canViet === ND.HO_SO_12.filter(t => t.truong).length && r.docCoach.doDay.coBan === 1);
console.log('— chiến dịch');
kiem('coach không lập chiến dịch', r.cdCoach.code === 'NOPERM');
kiem('thiếu ranh giới KHÔNG làm bị chặn', r.cdThieu.code === 'THIEU');
kiem('từ tuyệt đối trong chiến dịch bị chặn (QC1)', r.cdTuyetDoi.code === 'TUYETDOI');
kiem('người lập không tự duyệt chiến dịch', r.cdTuDuyet.code === 'TUDUYET');
const cd1 = r.dsCD.ds[0];
kiem('chiến dịch đang chạy, kết quả đo từ sổ chạm (1/1 nhà VVIP đã chạm)', cd1 && cd1.trangThai === 'dangChay' && cd1.ketQua.soDoiTuong === 1 && cd1.ketQua.daCham === 1, JSON.stringify(cd1 && cd1.ketQua));
kiem('R05 thấy độ phủ nhưng không thấy doanh thu chiến dịch', r.dsCDQL.ds[0].ketQua.doanhThuTrong === undefined && cd1.ketQua.doanhThuTrong !== undefined);
console.log('— bảng 80%');
kiem('bảng doanh thu chỉ R01–R03', r.bangQL.code === 'NOPERM');
const B = r.bang.baChiSo;
kiem('tỷ trọng doanh thu trọng điểm = (50 + 25) / tổng', B.DOANHTHU.trongDiem === 75e6 && B.DOANHTHU.tong === 89e6 && B.DOANHTHU.giaTri === 84.3, JSON.stringify(B.DOANHTHU));
kiem('lợi nhuận đóng góp: null kèm lý do, không phải 0', B.LOINHUAN.giaTri === null && /chi phí/.test(B.LOINHUAN.vi));
kiem('tăng trưởng: tách riêng, kỳ gốc 20tr', B.TANGTRUONG.tangTong === 69e6 && B.TANGTRUONG.tangTrongDiem === 55e6, JSON.stringify(B.TANGTRUONG));
kiem('đường cong tập trung có 10 điểm và số nhà làm ra 80%', r.bang.tapTrung.cong10.length === 10 && r.bang.tapTrung.soNha80 === 2);
kiem('cảnh báo phụ thuộc khi một nhà chiếm trên 15%', r.bang.ruiRo.some(x => /Một nhà chiếm/.test(x)));
kiem('KPI chưa đo được thì có lý do, không có giá trị', r.bang.kpi.filter(k => k.giaTri === undefined).every(k => k.vi));
kiem('K01, K07, K10 khai chưa đo — không bịa con số', ['K01', 'K07', 'K10'].every(m => r.bang.kpi.find(k => k.ma === m).giaTri === undefined));
kiem('M4 đo được từ CRM (chưa có ngày hẹn tiếp → 0%)', r.bang.thuNghiem.find(m => m.ma === 'M4').giaTri === 0);
kiem('M1, M3 chưa đo — nói vì sao', ['M1', 'M3'].every(m => r.bang.thuNghiem.find(x => x.ma === m).vi && r.bang.thuNghiem.find(x => x.ma === m).giaTri === undefined));
console.log('— nội dung Blueprint');
kiem('khách không tải được nội dung Blueprint', r.ndKhachND.code === 'NOPERM');
kiem('đủ 12 tài liệu · 5 nhóm · 7 lớp · 10 nhóm WOW · 10 mẫu · 10 chuẩn · 6 sản phẩm · 6 động cơ · 10 chiến dịch · 10 KPI · 4 giai đoạn · 6 quyết định (5 của Blueprint + QD6 chỗ lệch 8.500)',
  r.nd.hoSo12.length === 12 && r.nd.nhom5.length === 5 && r.nd.lop7.length === 7 && r.nd.nhomWow10.length === 10 && r.nd.mauDiemCham10.length === 10 &&
  r.nd.chuanWow10.length === 10 && r.nd.sanPham6.length === 6 && r.nd.dongCo6.length === 6 && r.nd.chienDichMkt10.length === 10 && r.nd.kpi10.length === 10 &&
  r.nd.loTrinh90.length === 4 && r.nd.quyetDinh5.length === 6);
kiem('sáu quyết định đều đã chốt, mỗi chốt có ngày và người chốt (chủ hệ 10/10/2026)', ND.QUYET_DINH_5.every(q => String(q.chot || '').length >= 40 && /^\d{4}-\d{2}-\d{2}$/.test(q.ngay || '') && q.boi));
kiem('QD6 giữ 1.500 làm dự phòng — không rải vào giai đoạn nào', ND.CHUA_PHAN_BO === 1500 && /dự phòng/i.test(ND.QUYET_DINH_5.find(q => q.ma === 'QD6').chot) && ND.GIAI_DOAN_5.reduce((a, g) => a + g.phanBo, 0) === 8500);
kiem('mười mẫu điểm chạm đều đủ bảy lớp', ND.MAU_DIEM_CHAM_10.every(m => ND.LOP_7.every(l => String(m[l.k] || '').length >= 12)));
kiem('nội dung Blueprint không có từ tuyệt đối', !(await import(pathToFileURL(ROOT + '/may-chu/noi-dung-tiep-thi.js').href)).CUM_TUYET_DOI
  .some(c => JSON.stringify(ND).toLowerCase().includes(c)));

console.log('— nối dây');
const wk = fs.readFileSync(ROOT + '/may-chu/worker.js', 'utf8');
const CUA = ['nhanDienVvip', 'deXuatNhomVvip', 'duyetNhomVvip', 'phanCongVvip', 'soatPhucVuVvip', 'tuyChonLienHeVvip', 'soanDiemCham', 'duyetDiemCham', 'napMauDiemCham',
  'dsDiemCham', 'kichHoatDiemCham', 'luuHoSoVvip', 'docHoSoVvip', 'lapChienDichVvip', 'duyetChienDichVvip', 'dsChienDichVvip', 'bangVvip', 'noiDungVvip'];
kiem('18 cửa có trong CAN_PHIEN và có đường gọi', CUA.every(f => wk.includes("'" + f + "'") && wk.includes("fn === '" + f + "'")), CUA.filter(f => !wk.includes("fn === '" + f + "'")).join(','));
const src = fs.existsSync(ROOT + '/src/phong-vvip.js') ? fs.readFileSync(ROOT + '/src/phong-vvip.js', 'utf8') : '';
kiem('màn lấy lớp giao diện từ G.U (window.U không tồn tại — giữ vật rỗng là mọi U.tbl nổ)', /var U = G\.U/.test(src) && !/window\.U\b/.test(src.replace(/\/\*[\s\S]*?\*\//g, '')));
kiem('màn Phòng VVIP gọi máy chủ, không chép nội dung Blueprint vào gói công khai', src.includes("'noiDungVvip'") && !/Được phục vụ chu đáo|CUSTOMER INTELLIGENCE/.test(src));

/* ── phá thử ── */
async function pha(ten, cu, moi, kiemDo, truocKhi) {
  const tep = ROOT + '/may-chu/vvip.js', goc = fs.readFileSync(tep, 'utf8');
  if (!goc.includes(cu)) { kiem('phá thử ' + ten + ': tìm thấy chỗ phá', false, cu.slice(0, 80)); return; }
  const tam = ROOT + '/may-chu/.pha-vvip-' + process.pid + '.js';
  fs.writeFileSync(tam, goc.replace(cu, moi));
  try { const P = await import(pathToFileURL(tam).href + '?' + Date.now()); const rp = await chay(P); kiem('phá thử ' + ten + ': phép đo đỏ đúng chỗ', kiemDo(rp)); }
  finally { fs.unlinkSync(tam); }
}
await pha('cho tự duyệt nhóm', "if (String(d.deXuat).toLowerCase() === String(hoSo.u).toLowerCase())", 'if (false)', rp => rp.tuDuyet.ok === true);
await pha('bỏ cổng hạng người phục vụ', 'if (choPhep.indexOf(ch.hang) < 0) {', 'if (false) {', rp => rp.pcD.ok === true);
await pha('bật điểm chạm khi thiếu tiêu chuẩn', 'if (!du) return', 'if (false) return', rp => rp.dcChin.ok === true);
await pha('bỏ chặn trùng lặp TS2', "if (lap.c > 0) return", 'if (false) return', rp => rp.khTrung.code !== 'TRUNGLAP');
await pha('bỏ chặn Recovery TS5', "if (ho.length && d.nhomWow !== 'WOW09') return", 'if (false) return', rp => rp.khRecovery.code !== 'RECOVERY');
await pha('tính phiếu chờ duyệt vào doanh thu', "FROM phieuThu WHERE trangThai = 'daDuyet' AND", 'FROM phieuThu WHERE 1 = 1 AND', rp => rp.ndCEO.ds.find(d => d.maNha === 'K9').doanhThu12 !== 2e6);
await pha('cho coach đọc tài liệu tài chính', 'if (lv <= 3) {\n    const tu', 'if (lv <= 12) {\n    const tu', rp => rp.docCoach.may['09'] !== undefined);
await pha('giữ trường lạ trong hồ sơ', 'for (const f of tl.truong) {', 'Object.assign(ra, vao); for (const f of tl.truong) {', rp => rp.docCoach.ban['02'].noiDung.soCCCD !== undefined);

/* phân công thành công: biến thể cố định hạng — cổng còn nguyên, chỉ nguồn hạng đổi */
{
  const goc = fs.readFileSync(ROOT + '/may-chu/vvip.js', 'utf8'), cu = 'const ch = await chamMotNguoi(db, nguoi, u.role, ky);';
  const tam = ROOT + '/may-chu/.hang-vvip-' + process.pid + '.js';
  fs.writeFileSync(tam, goc.replace(cu, 'const ch = { hang: (globalThis.__HANG || {})[nguoi] || "D" };'));
  try {
    const P = await import(pathToFileURL(tam).href + '?' + Date.now());
    const { sq, db } = dung(), env = {};
    const dx = await P.deXuatNhomVvip({ maNha: 'K1', nhom: 'VVIP', lyDo: 'Nhà đồng hành trên một năm, đã lên tầng bốn, giới thiệu nhà K4.' }, env, db, c1);
    await P.duyetNhomVvip({ id: dx.id }, env, db, gd);
    globalThis.__HANG = { coach2: 'A', coach1: 'B' };
    const okA = await P.phanCongVvip({ maNha: 'K1', nguoi: 'coach2' }, env, db, gd);
    const coachSauA = sq.prepare("SELECT coach FROM hoSoKhach WHERE maKhachHang='K1'").get().coach;
    const bKhongLy = await P.phanCongVvip({ maNha: 'K1', nguoi: 'coach1' }, env, db, gd);
    const bCoLy = await P.phanCongVvip({ maNha: 'K1', nguoi: 'coach1', lyDo: 'Hai người hạng A đang kín lịch tới hết quý, coach1 đã kèm nhà này hai năm.' }, env, db, gd);
    kiem('người hạng A phục vụ nhà VVIP, và hoSoKhach.coach đổi cùng một giao dịch', okA.ok && okA.hang === 'A' && coachSauA === 'coach2', JSON.stringify(okA));
    kiem('hạng B cho nhà VVIP mà không lý do → chặn', bKhongLy.code === 'DUOICHUAN');
    kiem('hạng B có lý do ≥ 40 ký tự → được, đánh dấu ngoài chuẩn', bCoLy.ok && bCoLy.ngoaiChuan === true);
  } finally { fs.unlinkSync(tam); delete globalThis.__HANG; }
}

console.log('\n' + dat + ' đạt · ' + truot + ' sai');
process.exit(truot ? 1 : 0);
