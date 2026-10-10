/* Thử VẬN HÀNH VIP/VVIP (may-chu/vvip-van-hanh.js) — ba bộ máy QD3:
   khởi động sáu mốc · bàn hỗ trợ có hạn · sổ chi phí phục vụ → lợi nhuận
   đóng góp. D1 giả = node:sqlite. Đo CỔNG và CON SỐ: ai được làm gì, M1/M3
   và lợi nhuận đóng góp tính từ sổ có đúng không, chỗ chưa đo được có trả
   null kèm lý do thay vì 0 không. Mỗi cổng chính có một phép phá thử.
   Dùng: node tools/thu-vvip-van-hanh.mjs   (Node >= 22.5) */
import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import { pathToFileURL, fileURLToPath } from 'node:url';
const ROOT = fileURLToPath(new URL('..', import.meta.url)).replace(/[\\/]$/, '');
globalThis.fetch = async () => { throw new Error('không gọi mạng ngoài'); };
let dat = 0, truot = 0;
const kiem = (ten, dk, ct) => { if (dk) { dat++; console.log('OK  ' + ten); } else { truot++; const d = 'SAI ' + ten + (ct ? ' — ' + ct : ''); console.log(d);
  if (process.env.GITHUB_ACTIONS) console.log('::error title=thu-vvip-van-hanh::' + d.replace(/[\r\n%]/g, ' ').slice(0, 900)); } };

const GIO = 3600000, NGAY = 24 * GIO, iso = t => new Date(t).toISOString();
const T0 = { K1: Date.now() - 40 * NGAY, K2: Date.now() - 35 * NGAY, K3: Date.now() - 3 * NGAY, K5: Date.now() - 10 * NGAY };
const sau = (k, gio) => iso(T0[k] + gio * GIO);

function dung() {
  const sq = new DatabaseSync(':memory:');
  sq.exec(fs.readFileSync(ROOT + '/may-chu/csdl.sql', 'utf8'));
  const db = { prepare(sql) { let a = []; const st = { bind(...x) { a = x; return st; },
      first() { try { return Promise.resolve(sq.prepare(sql).get(...a) || null); } catch (e) { return Promise.reject(e); } },
      all() { try { return Promise.resolve({ results: sq.prepare(sql).all(...a) }); } catch (e) { return Promise.reject(e); } },
      run() { try { const r = sq.prepare(sql).run(...a); return Promise.resolve({ meta: { changes: Number(r.changes) } }); } catch (e) { return Promise.reject(e); } } }; return st; },
    async batch(ds) { sq.exec('BEGIN'); try { for (const s of ds) await s.run(); sq.exec('COMMIT'); } catch (e) { sq.exec('ROLLBACK'); throw e; } } };
  for (const [id, u, r] of [['U1', 'chu', 'R01'], ['U3', 'giamdoc', 'R03'], ['U5', 'truongcoach', 'R05'], ['U7', 'coach1', 'R07'], ['U8', 'coach2', 'R07']])
    sq.prepare('INSERT INTO users (id, username, email, role, active) VALUES (?,?,?,?,1)').run(id, u, u + '@gita.vn', r);
  for (let i = 1; i <= 6; i++) {
    sq.prepare("INSERT INTO users (id, username, role, active, maKhachHang) VALUES (?,?,'R13',1,?)").run('P' + i, 'ph' + i, 'K' + i);
    sq.prepare("INSERT INTO hoSoKhach (maKhachHang, uidPhuHuynh, tang, coach, tuVan, trangThai, vaoLuc, band) VALUES (?,?,2,?,'tuvan1','dangHoc',?,'XANH')")
      .run('K' + i, 'P' + i, i <= 2 ? 'coach1' : 'coach2', iso(Date.now() - 400 * NGAY));
  }
  const hang = (id, k, nhom, luc) => sq.prepare("INSERT INTO hangVvip (id, maNha, nhom, lyDo, deXuat, deXuatLuc, trangThai, nguoiDuyet, duyetLuc) VALUES (?,?,?,'ly do','coach1',?,'daDuyet','giamdoc',?)").run(id, k, nhom, luc, luc);
  hang('H1', 'K1', 'VVIP', iso(T0.K1)); hang('H2', 'K2', 'VIP', iso(T0.K2)); hang('H3', 'K3', 'VVIP', iso(T0.K3));
  hang('H4', 'K4', 'CORE', iso(Date.now() - 50 * NGAY));
  /* K5 vào VIP, bị rút về CORE, rồi vào lại — khởi động tính từ lần vào lại */
  hang('H5a', 'K5', 'VIP', iso(Date.now() - 100 * NGAY)); hang('H5b', 'K5', 'CORE', iso(Date.now() - 60 * NGAY)); hang('H5c', 'K5', 'VIP', iso(T0.K5));
  const cham = (id, k, kieu, ai, luc) => sq.prepare("INSERT INTO soCham (id, maNha, ngay, kieu, noiDung, canCu, aiDuyet, boiAi, ghiLuc) VALUES (?,?,?,?,'chạm','thử','truongcoach',?,?)").run(id, k, luc.slice(0, 10), kieu, ai, luc);
  cham('C1', 'K1', 'goi', 'coach1', sau('K1', 2));            /* OB1 + OB4 K1 đúng hạn */
  cham('C2', 'K2', 'goi', 'coach1', sau('K2', 30));           /* OB1 K2 TRỄ (quá 24 giờ) */
  const pc = (id, k, ai, hg) => sq.prepare("INSERT INTO phanCongVvip (id, maNha, vaiTro, nguoi, hangNguoi, ky, boiAi, luc) VALUES (?,?,'coach',?,?,'2026-09','giamdoc',?)").run(id, k, ai, hg, iso(T0[k]));
  pc('PC1', 'K1', 'coach1', 'A'); pc('PC2', 'K2', 'coach1', 'B');
  for (const k of ['K1', 'K2']) for (const t of ['01', '02', '03', '04', '06'])
    sq.prepare("INSERT INTO hoSoVvip (id, maNha, taiLieu, phienBan, noiDungJson, boiAi, luc) VALUES (?,?,?,1,'{}','coach1',?)").run(k + t, k, t, sau(k, 48));
  for (const k of ['K1', 'K2']) for (const [m, g] of [['OB2', 20], ['OB5', 200], ['OB6', 600]])
    sq.prepare("INSERT INTO mocKhoiDong (id, maNha, tuLuc, ma, xongLuc, boiAi, canCu) VALUES (?,?,?,?,?,'coach1','căn cứ thử đủ dài để qua')").run(k + m, k, iso(T0[k]), m, sau(k, g));
  const thu = (id, k, tien) => sq.prepare("INSERT INTO phieuThu (id, maKhachHang, soTien, hinhThuc, nguoiGhi, ghiLuc, nguoiDuyet, duyetLuc, trangThai) VALUES (?,?,?,'chuyenKhoan','kt',?,'kt2',?,'daDuyet')").run(id, k, tien, iso(Date.now() - 20 * NGAY), iso(Date.now() - 20 * NGAY));
  thu('PT1', 'K1', 50e6); thu('PT2', 'K2', 30e6); thu('PT6', 'K6', 10e6);
  /* hai yêu cầu cũ: A trễ phân công (chưa giao, hạn 1 giờ đã qua); B đúng hạn trọn vòng */
  const tA = iso(Date.now() - 1 * NGAY), tB = Date.now() - 2 * NGAY;
  sq.prepare("INSERT INTO yeuCauVvip (id, maNha, nhom, kenh, mucDo, noiDung, tiepNhanLuc, moBoi, trangThai) VALUES ('YA','K1','VVIP','dienThoai','thuong','yêu cầu cũ chưa giao',?,'coach1','moi')").run(tA);
  sq.prepare("INSERT INTO yeuCauVvip (id, maNha, nhom, kenh, mucDo, noiDung, tiepNhanLuc, moBoi, trangThai, nguoiXuLy, phanCongLuc, phanHoiLuc, phanHoi, dongLuc, dongBoi, ketQua) " +
    "VALUES ('YB','K2','VIP','email','thuong','yêu cầu cũ đúng hạn',?,'coach1','daDong','coach1',?,?,'đã trả lời',?,'coach1','đã xong, gia đình xác nhận')")
    .run(iso(tB), iso(tB + 10 * 60000), iso(tB + 2 * GIO), iso(tB + 20 * GIO));
  return { sq, db };
}
const ho = (u, role, uid, mkh) => ({ u, role, uid, maKhachHang: mkh });
const chu = ho('chu', 'R01', 'U1'), gd = ho('giamdoc', 'R03', 'U3'), ql = ho('truongcoach', 'R05', 'U5'),
  c1 = ho('coach1', 'R07', 'U7'), c2 = ho('coach2', 'R07', 'U8'), ph1 = ho('ph1', 'R13', 'P1', 'K1');
const CC = 'Gọi video 30 phút với mẹ, cả nhà chọn được việc nhỏ đầu tiên.';

async function chay(V) {
  const { sq, db } = dung(), env = {}, r = {};
  /* ── khởi động ── */
  r.mocMay = await V.ghiMocKhoiDong({ maNha: 'K3', ma: 'OB1', canCu: CC }, env, db, c2);
  r.mocNgan = await V.ghiMocKhoiDong({ maNha: 'K3', ma: 'OB2', canCu: 'ngắn' }, env, db, c2);
  r.mocNgoai = await V.ghiMocKhoiDong({ maNha: 'K1', ma: 'OB2', canCu: CC }, env, db, c2);
  r.mocKhach = await V.ghiMocKhoiDong({ maNha: 'K1', ma: 'OB2', canCu: CC }, env, db, ph1);
  r.mocSom = await V.ghiMocKhoiDong({ maNha: 'K3', ma: 'OB6', canCu: CC }, env, db, c2);
  r.mocNgoaiNhom = await V.ghiMocKhoiDong({ maNha: 'K4', ma: 'OB2', canCu: CC }, env, db, ql);
  r.moc = await V.ghiMocKhoiDong({ maNha: 'K3', ma: 'OB2', canCu: CC }, env, db, c2);
  r.mocTrung = await V.ghiMocKhoiDong({ maNha: 'K3', ma: 'OB2', canCu: CC }, env, db, c2);
  r.kdQL = await V.docKhoiDong({}, env, db, ql);
  r.kdC1 = await V.docKhoiDong({}, env, db, c1);
  r.kdKhach = await V.docKhoiDong({}, env, db, ph1);
  /* ── bàn hỗ trợ ── */
  r.ycKhach = await V.moYeuCauVvip({ maNha: 'K2', mucDo: 'gap', noiDung: 'Con không chịu đi học hai hôm nay, cần gặp coach.' }, env, db, ph1);
  r.ycKhachNha = r.ycKhach.id ? sq.prepare('SELECT maNha FROM yeuCauVvip WHERE id = ?').get(r.ycKhach.id).maNha : null;
  r.ycNgoai = await V.moYeuCauVvip({ maNha: 'K1', noiDung: 'Nhờ đổi lịch buổi gặp tuần sau.' }, env, db, c2);
  r.ycNgoaiNhom = await V.moYeuCauVvip({ maNha: 'K4', noiDung: 'Nhà ngoài nhóm cần hỗ trợ.' }, env, db, ql);
  r.ycNgan = await V.moYeuCauVvip({ maNha: 'K1', noiDung: 'ngắn' }, env, db, c1);
  r.yc1 = await V.moYeuCauVvip({ maNha: 'K1', mucDo: 'thuong', kenh: 'tinNhan', noiDung: 'Nhờ gửi lại tài liệu buổi trước.' }, env, db, c1);
  r.pcCoach = await V.phanCongYeuCau({ id: r.yc1.id, nguoi: 'coach1' }, env, db, c1);
  r.pcKhach = await V.phanCongYeuCau({ id: r.yc1.id, nguoi: 'ph1' }, env, db, ql);
  r.pc1 = await V.phanCongYeuCau({ id: r.yc1.id, nguoi: 'coach1@gita.vn' }, env, db, ql);
  r.nguoiLuu = sq.prepare('SELECT nguoiXuLy FROM yeuCauVvip WHERE id = ?').get(r.yc1.id).nguoiXuLy;
  r.dongSom = await V.dongYeuCau({ id: r.yc1.id, ketQua: 'Đã gửi lại tài liệu, mẹ xác nhận nhận được.' }, env, db, c1);
  r.phNguoiLa = await V.phanHoiYeuCau({ id: r.yc1.id, noiDung: 'Em gửi lại ngay chiều nay ạ.' }, env, db, c2);
  r.ph1 = await V.phanHoiYeuCau({ id: r.yc1.id, noiDung: 'Em gửi lại ngay chiều nay ạ.' }, env, db, c1);
  r.dong1 = await V.dongYeuCau({ id: r.yc1.id, ketQua: 'Đã gửi lại tài liệu, mẹ xác nhận nhận được.' }, env, db, c1);
  /* khiếu nại: giao cho một QUẢN LÝ bằng email — người ấy không tự đóng được */
  r.kn = await V.moYeuCauVvip({ maNha: 'K1', mucDo: 'khieuNai', noiDung: 'Buổi gặp bị huỷ sát giờ hai lần liền.' }, env, db, c1);
  r.pcKn = await V.phanCongYeuCau({ id: r.kn.id, nguoi: 'truongcoach@gita.vn' }, env, db, gd);
  r.phKn = await V.phanHoiYeuCau({ id: r.kn.id, noiDung: 'Xin lỗi gia đình, em sắp lịch bù tuần này.' }, env, db, ql);
  r.knTuDong = await V.dongYeuCau({ id: r.kn.id, ketQua: 'Đã bù hai buổi, gia đình đồng ý khép lại.' }, env, db, ql);
  r.knCoach = await V.dongYeuCau({ id: r.kn.id, ketQua: 'Đã bù hai buổi, gia đình đồng ý khép lại.' }, env, db, c1);
  r.knDong = await V.dongYeuCau({ id: r.kn.id, ketQua: 'Đã bù hai buổi, gia đình đồng ý khép lại.' }, env, db, gd);
  r.dsQL = await V.dsYeuCauVvip({}, env, db, ql);
  r.dsKhach = await V.dsYeuCauVvip({}, env, db, ph1);
  r.dsC2 = await V.dsYeuCauVvip({}, env, db, c2);
  /* ── chi phí phục vụ ── */
  r.lnRong = await V.dsChiPhiPhucVu({}, env, db, gd);
  r.cpNgoai = await V.ghiChiPhiPhucVu({ maNha: 'K1', loai: 'taiLieu', soTien: 1e6, ghiChu: 'In tài liệu buổi gặp' }, env, db, c2);
  r.cpKhong = await V.ghiChiPhiPhucVu({ maNha: 'K1', loai: 'taiLieu', soTien: 0, ghiChu: 'In tài liệu buổi gặp' }, env, db, c1);
  r.cpLon = await V.ghiChiPhiPhucVu({ maNha: 'K1', loai: 'taiLieu', soTien: 9e7, ghiChu: 'In tài liệu buổi gặp' }, env, db, c1);
  r.cpLoai = await V.ghiChiPhiPhucVu({ maNha: 'K1', loai: 'anUong', soTien: 1e6, ghiChu: 'In tài liệu buổi gặp' }, env, db, c1);
  r.cpTuongLai = await V.ghiChiPhiPhucVu({ maNha: 'K1', loai: 'taiLieu', soTien: 1e6, ngay: '2099-01-01', ghiChu: 'In tài liệu buổi gặp' }, env, db, c1);
  r.cpNgan = await V.ghiChiPhiPhucVu({ maNha: 'K1', loai: 'taiLieu', soTien: 1e6, ghiChu: 'in' }, env, db, c1);
  r.cp1 = await V.ghiChiPhiPhucVu({ maNha: 'K1', loai: 'gioNguoi', soTien: 5e6, soGio: 10, ghiChu: 'Mười giờ coach hạng A tháng này' }, env, db, c1);
  r.lnChiTD = await V.dsChiPhiPhucVu({}, env, db, gd);
  r.cp6 = await V.ghiChiPhiPhucVu({ maNha: 'K6', loai: 'suKien', soTien: 2e6, ghiChu: 'Buổi gặp nhóm phụ huynh tháng 9' }, env, db, ql);
  r.ln = await V.dsChiPhiPhucVu({}, env, db, gd);
  r.lnCoach = await V.dsChiPhiPhucVu({}, env, db, c1);
  r.lnQL = await V.dsChiPhiPhucVu({}, env, db, ql);
  return { sq, db, r };
}

const V = await import(pathToFileURL(ROOT + '/may-chu/vvip-van-hanh.js').href);
const { sq, db, r } = await chay(V);
console.log('— khởi động sáu mốc');
kiem('mốc máy đo (OB1) không ghi tay được', r.mocMay.code === 'MAYDO', JSON.stringify(r.mocMay));
kiem('căn cứ ngắn bị từ chối', r.mocNgan.code === 'THIEUCANCU');
kiem('coach không phụ trách nhà không ghi được mốc', r.mocNgoai.code === 'NGOAINHA');
kiem('phụ huynh không ghi mốc thay người phục vụ', r.mocKhach.code === 'NGOAINHA');
kiem('rà soát 30 ngày ghi trước ngày 21 bị chặn', r.mocSom.code === 'SOM', JSON.stringify(r.mocSom));
kiem('nhà ngoài nhóm VIP/VVIP không có khởi động', r.mocNgoaiNhom.code === 'NGOAINHOM');
kiem('ghi mốc người làm kèm căn cứ → được; ghi lại → DAGHI', r.moc.ok && r.mocTrung.code === 'DAGHI');
const kdK = m => r.kdQL.ds.find(d => d.maNha === m);
kiem('quản lý thấy bốn nhà đang/đã khởi động (K4 rút về CORE không có)', r.kdQL.ok && r.kdQL.ds.length === 4 && !kdK('K4'), r.kdQL.ds.map(d => d.maNha).join(','));
kiem('vào lại sau khi rút về CORE thì khởi động tính từ lần vào lại', kdK('K5') && kdK('K5').tuLuc === iso(T0.K5));
kiem('K1 đủ sáu mốc đúng hạn (ba máy đọc sổ + ba người ghi)', kdK('K1').dungHanHet && kdK('K1').moc.every(m => m.trangThai === 'dungHan'), JSON.stringify(kdK('K1').moc.map(m => m.ma + ':' + m.trangThai)));
kiem('K2 gọi chào sau 30 giờ → OB1 "trễ", không tính đúng hạn', kdK('K2').moc.find(m => m.ma === 'OB1').trangThai === 'tre' && !kdK('K2').dungHanHet);
kiem('K2 phục vụ bởi người hạng B → OB4 vẫn đạt (VIP nhận A/B)', kdK('K2').moc.find(m => m.ma === 'OB4').trangThai === 'dungHan');
kiem('K3 ngày 3 chưa gọi chào → OB1 quá hạn; OB6 còn đang chờ', kdK('K3').moc.find(m => m.ma === 'OB1').trangThai === 'quaHan' && kdK('K3').moc.find(m => m.ma === 'OB6').trangThai === 'dangCho');
kiem('M1 = nhà qua 30 ngày đủ sáu mốc đúng hạn ÷ nhà qua 30 ngày = 1/2', r.kdQL.m1 === 50 && r.kdQL.m1Mau === 2, r.kdQL.m1 + '/' + r.kdQL.m1Mau);
kiem('coach chỉ thấy nhà mình phụ trách', r.kdC1.ok && r.kdC1.ds.map(d => d.maNha).sort().join() === 'K1,K2', r.kdC1.ds.map(d => d.maNha).join());
kiem('phụ huynh không đọc bảng khởi động nội bộ', r.kdKhach.code === 'NOPERM');
kiem('M1 chưa có nhà qua 30 ngày → null kèm lý do, không 0', V.chiSoKhoiDong([{ daHetHan: false }]).m1 === null && !!V.chiSoKhoiDong([]).m1Vi);

console.log('— bàn hỗ trợ có hạn');
kiem('phụ huynh mở yêu cầu luôn cho NHÀ MÌNH, gõ mã nhà khác cũng vậy', r.ycKhach.ok && r.ycKhachNha === 'K1', JSON.stringify(r.ycKhach));
kiem('mức gấp nhà VVIP: hạn phân công 30 phút', r.ycKhach.han && Date.parse(r.ycKhach.han.phanCong) - Date.parse(sq.prepare('SELECT tiepNhanLuc t FROM yeuCauVvip WHERE id = ?').get(r.ycKhach.id).t) === 30 * 60000);
kiem('coach không phụ trách không mở hộ', r.ycNgoai.code === 'NGOAINHA');
kiem('nhà ngoài nhóm dùng kênh chăm sóc chung', r.ycNgoaiNhom.code === 'NGOAINHOM');
kiem('nội dung ngắn bị từ chối', r.ycNgan.code === 'THIEU');
kiem('coach không tự phân công; giao cho phụ huynh bị chặn', r.pcCoach.code === 'NOPERM' && r.pcKhach.code === 'SAINGUOI');
kiem('giao bằng email → sổ lưu TÊN ĐĂNG NHẬP', r.pc1.ok && r.nguoiLuu === 'coach1', r.nguoiLuu);
kiem('chưa phản hồi gia đình thì chưa đóng được', r.dongSom.code === 'CHUAPHANHOI');
kiem('người không được giao không phản hồi', r.phNguoiLa.code === 'NOPERM');
kiem('người được giao phản hồi rồi đóng yêu cầu thường', r.ph1.ok && r.dong1.ok);
kiem('khiếu nại: người xử lý (giao bằng email) KHÔNG tự đóng', r.pcKn.ok && r.phKn.ok && r.knTuDong.code === 'TUDONG', JSON.stringify(r.knTuDong));
kiem('khiếu nại: coach không đóng; quản lý khác đóng được', r.knCoach.code === 'NOPERM' && r.knDong.ok && sq.prepare('SELECT dongBoi FROM yeuCauVvip WHERE id = ?').get(r.kn.id).dongBoi === 'giamdoc');
kiem('yêu cầu chưa giao quá 1 giờ → quá hạn phân công (tính lúc đọc)', r.dsQL.ds.find(x => x.id === 'YA').quaHanPhanCong === true);
kiem('M3 = giao đúng hạn ÷ đã tới hạn giao = 3/4 (YA trễ; YB, yêu cầu thường, khiếu nại đúng hạn)', r.dsQL.m3 === 75 && r.dsQL.m3Mau === 4, r.dsQL.m3 + '/' + r.dsQL.m3Mau);
kiem('xử lý vấn đề = đóng đúng hạn ÷ đã tới hạn đóng = 3/3', r.dsQL.xuLy === 100 && r.dsQL.xuLyMau === 3, r.dsQL.xuLy + '/' + r.dsQL.xuLyMau);
kiem('phụ huynh chỉ thấy yêu cầu nhà mình', r.dsKhach.ok && r.dsKhach.ds.length > 0 && r.dsKhach.ds.every(x => x.maNha === 'K1'));
kiem('coach chỉ thấy việc mình được giao hoặc mình mở', r.dsC2.ok && r.dsC2.ds.length === 0);
kiem('bảng không có cột "quá hạn" — hạn tính lúc đọc', !/quaHan/i.test(fs.readFileSync(ROOT + '/may-chu/csdl.sql', 'utf8').split('CREATE TABLE IF NOT EXISTS yeuCauVvip')[1].split(');')[0]));

console.log('— chi phí phục vụ → lợi nhuận đóng góp');
kiem('chưa ghi chi phí nào → lợi nhuận đóng góp null kèm lý do, không 0', r.lnRong.ok && r.lnRong.tongHop.giaTri === null && /không coi là 0/.test(r.lnRong.tongHop.vi));
kiem('coach không phụ trách không ghi chi phí cho nhà', r.cpNgoai.code === 'NGOAINHA');
kiem('số tiền 0 hoặc vượt trần một khoản bị chặn', r.cpKhong.code === 'SOTIEN' && r.cpLon.code === 'SOTIEN');
kiem('loại lạ · ngày chưa tới · ghi chú ngắn bị chặn', r.cpLoai.code === 'SAI' && r.cpTuongLai.code === 'TUONGLAI' && r.cpNgan.code === 'THIEU');
kiem('ghi được khoản hợp lệ', r.cp1.ok && r.cp6.ok);
kiem('chỉ nhà trọng điểm có chi phí → tỷ trọng null (chia cho chính mình ra 100%)', r.lnChiTD.tongHop.giaTri === null && r.lnChiTD.tongHop.loiNhuanTrongDiem === 45e6, JSON.stringify(r.lnChiTD.tongHop));
const t = r.ln.tongHop;
kiem('lợi nhuận đóng góp = (50−5) ÷ (45 + 10−2) = 84,9%', t.giaTri === 84.9 && t.loiNhuanTrongDiem === 45e6 && t.loiNhuanTatCa === 53e6, JSON.stringify(t));
kiem('nói ra 3/4 nhà trọng điểm chưa ghi chi phí — không tính là 0', t.thieu === 3 && t.nhaCoChiPhi === 1 && /chưa ghi chi phí/.test(t.vi || ''));
kiem('dòng nhà chưa ghi chi phí để trống chi phí, không 0', r.ln.ds.find(d => d.maNha === 'K2').chiPhi === undefined && r.ln.ds.find(d => d.maNha === 'K1').chiPhi === 5e6);
kiem('bảng lợi nhuận theo nhà chỉ R01–R03 (coach, R05 bị chặn)', r.lnCoach.code === 'NOPERM' && r.lnQL.code === 'NOPERM');

console.log('— nối vào bảng 80%');
const VV = await import(pathToFileURL(ROOT + '/may-chu/vvip.js').href);
const b = await VV.bangVvip({}, {}, db, gd);
const tn = m => b.thuNghiem.find(x => x.ma === m);
kiem('bảng 80%: LOINHUAN lấy từ sổ chi phí (84,9%)', b.ok && b.baChiSo.LOINHUAN.giaTri === 84.9, JSON.stringify(b.baChiSo && b.baChiSo.LOINHUAN));
kiem('bảng 80%: M1 = 50% · M3 = 75%, có cỡ mẫu', tn('M1').giaTri === 50 && tn('M3').giaTri === 75 && tn('M1').mau === 2 && tn('M3').mau === 4);
kiem('bảng 80%: K06 tách riêng tỷ lệ xử lý vấn đề, không gộp vào CSAT', b.kpi.find(k => k.ma === 'K06').xuLyVanDe === 100);
kiem('bảng 80%: K04 nói lợi nhuận đóng góp đo trên bao nhiêu nhà', /1\/4 nhà/.test(b.kpi.find(k => k.ma === 'K04').ghiChu || b.kpi.find(k => k.ma === 'K04').vi || ''));
const ND = await import(pathToFileURL(ROOT + '/may-chu/vvip-noi-dung.js').href);
kiem('M1 · M3 khai cách đo, thôi khai "chưa đo"', ND.MUC_TIEU_THU_4.filter(m => m.ma === 'M1' || m.ma === 'M3').every(m => m.do && !m.vi));
kiem('QD3 ghi đã dựng đủ ba chức năng', /Đã dựng đủ ba/.test(ND.QUYET_DINH_5.find(q => q.ma === 'QD3').daDung || ''));

console.log('— nối dây');
const wk = fs.readFileSync(ROOT + '/may-chu/worker.js', 'utf8');
const CUA = ['ghiMocKhoiDong', 'docKhoiDong', 'moYeuCauVvip', 'phanCongYeuCau', 'phanHoiYeuCau', 'dongYeuCau', 'dsYeuCauVvip', 'ghiChiPhiPhucVu', 'dsChiPhiPhucVu'];
kiem('9 cửa có trong CAN_PHIEN và có đường gọi', CUA.every(f => wk.includes("'" + f + "'") && wk.includes("fn === '" + f + "'")), CUA.filter(f => !wk.includes("fn === '" + f + "'")).join(','));
const src = fs.readFileSync(ROOT + '/src/phong-vvip.js', 'utf8');
kiem('màn Phòng VVIP có ngăn Vận hành gọi đúng ba cửa đọc', /'vanhanh'/.test(src) && ['docKhoiDong', 'dsYeuCauVvip', 'dsChiPhiPhucVu'].every(f => src.includes("'" + f + "'")));

/* ── phá thử ── */
async function pha(ten, cu, moi, kiemDo) {
  const tep = ROOT + '/may-chu/vvip-van-hanh.js', goc = fs.readFileSync(tep, 'utf8');
  if (!goc.includes(cu)) { kiem('phá thử ' + ten + ': tìm thấy chỗ phá', false, cu.slice(0, 80)); return; }
  const tam = ROOT + '/may-chu/.pha-vvvh-' + process.pid + '-' + (++pha.n) + '.js';
  fs.writeFileSync(tam, goc.replace(cu, moi));
  try { const P = await import(pathToFileURL(tam).href); const { r: rp } = await chay(P); kiem('phá thử ' + ten + ': phép đo đỏ đúng chỗ', kiemDo(rp)); }
  finally { fs.unlinkSync(tam); }
}
pha.n = 0;
await pha('cho đánh dấu tay mốc máy đo', "if (moc.nguon === 'may') return", 'if (false) return', rp => rp.mocMay.ok === true);
await pha('bỏ chặn rà soát sớm', 'if (moc.sauGio && nay <', 'if (false && nay <', rp => rp.mocSom.ok === true);
await pha('cho người xử lý tự đóng khiếu nại', 'if (hoSo.u === r.nguoiXuLy) return', 'if (false) return', rp => rp.knTuDong.ok === true);
await pha('lưu chuỗi người giao gõ thay tên đăng nhập', '.bind(u.username, bayGio(), r.id)', '.bind(nguoi, bayGio(), r.id)', rp => rp.knTuDong.ok === true && rp.nguoiLuu === 'coach1@gita.vn');
await pha('cho phụ huynh chọn mã nhà', "maNha = String(hoSo.maKhachHang || '');", "maNha = maNha || String(hoSo.maKhachHang || '');", rp => rp.ycKhachNha === 'K2');
await pha('bỏ phạm vi đọc khởi động', 'if (lvCua(hoSo) > 5 && !(await nhaPhuTrach(db, hoSo, maNha))) continue;', '', rp => rp.kdC1.ds.length === 4);
await pha('coi nhà chưa ghi chi phí là 0', 'const coCP = nhaTD.filter(k => cp[k] != null);', 'for (const k of nhaTD) if (cp[k] == null) cp[k] = 0; const coCP = nhaTD;', rp => rp.ln.tongHop.thieu === 0 && rp.ln.tongHop.giaTri !== 84.9);
await pha('bỏ chặn tỷ trọng chia cho chính mình', 'if (!ngoaiCoCP.length) return', 'if (false) return', rp => rp.lnChiTD.tongHop.giaTri === 100);

console.log('\n' + dat + ' đạt · ' + truot + ' sai');
process.exit(truot ? 1 : 0);
