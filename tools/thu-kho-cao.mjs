/* Thử Kho vấn đề cấp cao · 6 hạng · trả bằng credit — D1 giả = node:sqlite.
   Chứng minh:
     · bảng giá khởi đầu đúng thang chủ hệ duyệt (×1,5 tầng 4–5); chỉ R01
       sửa, phải có lý do, giá phải tăng dần theo hạng; dòng mới nhất thắng
     · nạp: chỉ R01, cả lô hoặc không bản nào, chặn Điều 13
     · đọc: Coach (R01–R07) đọc hệ coach; R08–R11, khách bị chặn
     · Coach đề xuất 1–3 phương án (chưa trừ); NHÀ thấy giá + gói và tự chọn,
       lúc ấy mới trừ; chọn hai lần không trừ thêm; tầng chưa tới bị chặn
     · hoàn thành có bằng chứng → thưởng credit nhiệm vụ (một lần)
     · AN TOÀN: cửa riêng, 0 credit, không cần mã vấn đề, báo R01 + R03
     · chống trùng bằng khoá chính xác (credit.js)
     · hệ Tư vấn: R11 chỉ thao tác với nhà ghi tên mình ở hoSoKhach.tuVan, chỉ vấn đề hệ Tư vấn
     · cửa nối vào worker, bảng có trong csdl.sql, màn có ngăn kho cấp cao
   Dùng: node tools/thu-kho-cao.mjs   (Node >= 22.5) */
import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import { pathToFileURL, fileURLToPath } from 'node:url';
const ROOT = process.argv[2] || fileURLToPath(new URL('..', import.meta.url)).replace(/[\\/]$/, '');
const K = await import(pathToFileURL(ROOT + '/may-chu/kho-cao.js').href);
const C = await import(pathToFileURL(ROOT + '/may-chu/credit.js').href);

const sq = new DatabaseSync(':memory:');
sq.exec(fs.readFileSync(ROOT + '/may-chu/csdl.sql', 'utf8'));
const db = {
  prepare(sql) { let a = []; const st = {
    bind(...x) { a = x; return st; },
    first() { return Promise.resolve(sq.prepare(sql).get(...a) || null); },
    all() { return Promise.resolve({ results: sq.prepare(sql).all(...a) }); },
    run() { const r = sq.prepare(sql).run(...a); return Promise.resolve({ meta: { changes: Number(r.changes) } }); } }; return st; },
  async batch(ds) { sq.exec('BEGIN'); try { for (const s of ds) await s.run(); sq.exec('COMMIT'); } catch (e) { sq.exec('ROLLBACK'); throw e; } }
};
globalThis.fetch = async () => { throw new Error('không gọi mạng ngoài trong bộ thử'); };
const env = {};
const ho = (u, role, mk) => ({ uid: 'U-' + u, u, role, maKhachHang: mk });
const r01 = ho('chu', 'R01'), r05 = ho('tnc', 'R05'), coach1 = ho('coach1', 'R07'), coach2 = ho('coach2', 'R07'),
  r08 = ho('gv', 'R08'), r11 = ho('tuvan', 'R11'), ph = ho('ph4', 'R13', 'K4');
sq.prepare("INSERT INTO users (id, username, role, active, maKhachHang) VALUES ('U-ph4','ph4','R13',1,'K4')").run();
sq.prepare("INSERT INTO hoSoKhach (maKhachHang, uidPhuHuynh, tang, coach) VALUES ('K4','U-ph4',4,'coach1')").run();
sq.prepare("INSERT INTO hoSoKhach (maKhachHang, uidPhuHuynh, tang, coach) VALUES ('K3','P3',3,'coach1')").run();
sq.prepare("INSERT INTO hoSoKhach (maKhachHang, uidPhuHuynh, tang, coach) VALUES ('K5','U-ph5',5,'coach1')").run();
sq.prepare("INSERT INTO users (id, username, role, active, maKhachHang) VALUES ('U-ph5','ph5','R13',1,'K5')").run();
const ph5 = ho('ph5', 'R13', 'K5');

let dat = 0, truot = 0;
const kiem = (ten, dk, ct) => { if (dk) { dat++; console.log('OK  ' + ten); } else { truot++; console.log('SAI ' + ten + (ct ? ' — ' + ct : '')); } };

const banGhi = (id, hang) => ({ id, hang, ten: 'Con bỏ dần buổi tự học tối sau chu kỳ đầu ' + id,
  van: 'Con giữ nhịp tốt ba tháng rồi bỏ dần buổi tự học tối, bảng theo dõi trống hai tuần.',
  phanTich: { hienTuong: 'Bảng theo dõi trống dần.', boiCanh: 'Chu kỳ hai tầng bốn, Coach đã giảm số buổi.', nguyenNhan: ['Cái mới hết mới', 'Lịch tối bị chen'], tacDong: 'Nhịp không đều.', donBay: 'Con tự chọn lại khung giờ.' },
  phacDo: ['Trao quyền chọn giờ', 'Nhịp nhỏ hơn là bỏ hẳn', 'Quan sát, không nhắc liên tục'],
  t2080: { lam: ['Con tự chọn khung giờ'], gac: 'Tạm gác môn mới hai tuần.' },
  kyNang: ['Hỏi mở: hỏi điều gì làm buổi tối khó', 'Thoả thuận nhỏ: hai mươi phút', 'Ghi nhận: nói rõ hành vi'],
  buoc: ['Ngày 1: quan sát', 'Ngày 4: trò chuyện', 'Ngày 5: con chọn giờ', 'Ngày 6–12: con tự đánh dấu', 'Ngày 14: rà lại'],
  luuY: ['Không biến bảng thành công cụ phạt', 'Không so với giai đoạn đầu', 'Chấp nhận một tối bỏ lỡ'],
  thamVan: { khi: 'Mệt kéo dài nhiều tuần', ai: 'chuyên gia sức khoẻ học đường' },
  phuongAn: [{ ten: 'Giảm liều', khi: 'quá tải', cach: 'rút còn hai mươi phút' }, { ten: 'Đổi giờ', khi: 'tối bị chen', cach: 'chuyển sáng sớm' }, { ten: 'Bạn học', khi: 'cần động lực', cach: 'học cùng anh chị' }],
  ketQua: 'Sau hai tuần, bốn tối mỗi tuần do con tự đánh dấu.', doBang: ['Số tối tự đánh dấu', 'Số lần phải nhắc'],
  baiHoc: 'Nhịp tụt là bình thường; trao lại quyền chọn giúp con giữ nhịp.',
  goi: { phamVi: 'Coach phụ trách riêng, 4 buổi/30 ngày.', caNhanHoa: 'Theo hồ sơ nhà.', theoDoi: 'Mỗi tuần, 30 ngày.', dieuKien: 'Con tự đánh dấu mỗi tối.' } });

/* ── bảng giá ── */
const g0 = await K.giaKhoCao({}, env, db, ph);
kiem('giá khởi đầu đúng thang duyệt: tầng 1 · 50/150/300/600/1200/2500', g0.ok && g0.khoiDau && JSON.stringify(Object.values(g0.theoTang[1])) === '[50,150,300,600,1200,2500]', JSON.stringify(g0.theoTang && g0.theoTang[1]));
kiem('tầng 4–5 nhân 1,5: Diamond tầng 5 = 3750, 1 sao tầng 4 = 75', g0.theoTang[5].DIAMOND === 3750 && g0.theoTang[4].S1 === 75);
kiem('mọi phiên đọc được bảng giá (gia đình cần thấy trước khi chọn)', g0.ok);
const goc2 = { S1: 60, S3: 160, S5: 320, VIP: 640, VVIP: 1280, DIAMOND: 2600 }, he2 = { 1: 1, 2: 1, 3: 1, 4: 1.5, 5: 1.5 };
kiem('Coach không sửa được giá', (await K.datGiaKhoCao({ goc: goc2, heSo: he2, lyDo: 'Điều chỉnh theo chi phí coach mới' }, env, db, r05)).code === 'NOPERM');
kiem('sửa giá thiếu lý do bị từ chối', (await K.datGiaKhoCao({ goc: goc2, heSo: he2, lyDo: 'ngắn' }, env, db, r01)).code === 'LYDO');
kiem('giá không tăng dần theo hạng bị từ chối (Vip rẻ hơn 5 sao)', (await K.datGiaKhoCao({ goc: Object.assign({}, goc2, { VIP: 200 }), heSo: he2, lyDo: 'Thử một bảng giá sai thứ tự' }, env, db, r01)).code === 'SAI');
kiem('hệ số tầng ngoài 1–5 bị từ chối', (await K.datGiaKhoCao({ goc: goc2, heSo: Object.assign({}, he2, { 5: 9 }), lyDo: 'Thử một hệ số quá tay' }, env, db, r01)).code === 'SAI');
const g1 = await K.datGiaKhoCao({ goc: goc2, heSo: he2, lyDo: 'Điều chỉnh theo chi phí coach mới' }, env, db, r01);
kiem('Super Admin sửa giá có lý do → dòng mới, bảng mới chạy ngay', g1.ok && (await K.giaKhoCao({}, env, db, ph)).bang.goc.S1 === 60);
await K.datGiaKhoCao({ goc: GIA_GOC(), heSo: he2, lyDo: 'Trả về thang chủ hệ duyệt' }, env, db, r01);
function GIA_GOC() { return Object.assign({}, K.GIA_KHOI_DAU.goc); }
kiem('sổ giá chỉ thêm dòng (2 dòng sau 2 lần sửa)', sq.prepare('SELECT COUNT(*) n FROM giaKhoCao').get().n === 2);

/* ── nạp ── */
const lo = [banGhi('C4-A-001', 'S1'), banGhi('C4-A-002', 'VIP'), banGhi('C5-A-001', 'DIAMOND'), banGhi('C4-A-009', 'S3')];
kiem('Coach không nạp được kho', (await K.napKhoCao({ ds: lo }, env, db, r05)).code === 'NOPERM');
const hong = await K.napKhoCao({ ds: lo.concat([Object.assign(banGhi('C4-A-003', 'S3'), { van: 'Gọi chị Nguyễn Thị Lan số 0912345678' })]) }, env, db, r01);
kiem('một bản ghi lộ tên + số điện thoại → từ chối CẢ lô (Điều 13)', hong.code === 'HONG' && /DIEU13/.test(hong.hong.join()) && !sq.prepare('SELECT COUNT(*) n FROM khoCao').get().n, JSON.stringify(hong.hong));
kiem('bản ghi thiếu ô gói (goi) bị từ chối', (await K.napKhoCao({ ds: [Object.assign(banGhi('C4-A-004', 'S5'), { goi: {} })] }, env, db, r01)).code === 'HONG');
kiem('hạng lạ bị từ chối', (await K.napKhoCao({ ds: [banGhi('C4-A-005', 'GOLD')] }, env, db, r01)).code === 'HONG');
const nap = await K.napKhoCao({ ds: lo, ban: 'KC-THU' }, env, db, r01);
kiem('Super Admin nạp lô sạch: 4 vấn đề, hệ coach', nap.ok && nap.dem.coach === 4, JSON.stringify(nap));

/* ── đọc ── */
const ds = await K.dsKhoCao({ he: 'coach' }, env, db, coach1);
kiem('Coach thấy danh sách kèm hạng + giá, không kèm nội dung', ds.ok && ds.tong === 4 && ds.ds[0].gia && !ds.ds[0].phacDo && ds.dem.VIP === 1, JSON.stringify(ds.ds[0]));
kiem('lọc theo tầng 5 + hạng Diamond', (await K.dsKhoCao({ he: 'coach', tang: 5, hang: 'DIAMOND' }, env, db, coach1)).tong === 1);
kiem('Giáo viên (R08) bị chặn kho Coach ở máy chủ', (await K.dsKhoCao({ he: 'coach' }, env, db, r08)).code === 'NOPERM');
kiem('Chuyên viên tư vấn (R11) bị chặn kho Coach', (await K.docKhoCao({ ma: 'C4-A-002' }, env, db, r11)).code === 'NOPERM');
kiem('phụ huynh bị chặn đọc nội dung', (await K.docKhoCao({ ma: 'C4-A-002' }, env, db, ph)).code === 'NOPERM');
const doc = await K.docKhoCao({ ma: 'C4-A-002' }, env, db, coach1);
kiem('Coach đọc đủ 13 mục + gói + giá Vip tầng 4 = 900', doc.ok && doc.vd.goi && doc.vd.phacDo && doc.vd.gia === 900 && doc.vd.tenHang === 'Vip', JSON.stringify({ gia: doc.vd && doc.vd.gia }));

/* ── đề xuất → nhà chọn → trừ credit ── */
await C.viCredit({ maNha: 'K4' }, env, db, coach1);   // mở ví → 8.000 credit tặng tầng 4
const du0 = (await C.soDu(db, 'K4')).tong;
kiem('Coach không phụ trách nhà không đề xuất được', (await K.deXuatKhoCao({ maNha: 'K4', ds: ['C4-A-001'] }, env, db, coach2)).code === 'NOPERM');
kiem('phụ huynh không tự đề xuất', (await K.deXuatKhoCao({ maNha: 'K4', ds: ['C4-A-001'] }, env, db, ph)).code === 'NOPERM');
kiem('quá 3 phương án bị chặn', (await K.deXuatKhoCao({ maNha: 'K4', ds: ['C4-A-001', 'C4-A-002', 'C5-A-001', 'C4-A-009'] }, env, db, coach1)).code === 'SAI');
kiem('nhà tầng 3 không nhận được vấn đề tầng 4 (quyền lợi theo tầng)', (await K.deXuatKhoCao({ maNha: 'K3', ds: ['C4-A-001'] }, env, db, coach1)).code === 'TANGCHUA');
kiem('nhà tầng 4 không nhận được vấn đề tầng 5', (await K.deXuatKhoCao({ maNha: 'K4', ds: ['C5-A-001'] }, env, db, coach1)).code === 'TANGCHUA');
const dx = await K.deXuatKhoCao({ maNha: 'K4', ds: ['C4-A-001', 'C4-A-002'], ghiChu: 'Hai mức để nhà chọn' }, env, db, coach1);
kiem('Coach phụ trách đề xuất 2 phương án — CHƯA trừ credit', dx.ok && (await C.soDu(db, 'K4')).tong === du0, JSON.stringify(dx));
const xem = await K.dsDeXuatNha({}, env, db, ph);
const pa = xem.ok && xem.ds[0] ? xem.ds[0].phuongAn : [];
kiem('phụ huynh thấy từng phương án kèm hạng, giá, gói (nhà mình, không cần gõ mã)', xem.ok && pa.length === 2 && pa[0].gia === 75 && pa[1].gia === 900 && pa[1].goi.phamVi && pa[1].goi.dieuKien && !pa[1].phacDo, JSON.stringify(pa.map(x => [x.hang, x.gia])));
kiem('Coach không chọn thay nhà', (await K.chonDeXuat({ id: dx.id, ma: 'C4-A-002' }, env, db, coach1)).code === 'NOPERM');
kiem('chọn mã ngoài đề xuất bị chặn', (await K.chonDeXuat({ id: dx.id, ma: 'C4-A-009' }, env, db, ph)).code === 'SAI');
const ch = await K.chonDeXuat({ id: dx.id, ma: 'C4-A-002' }, env, db, ph);
kiem('NHÀ chọn Vip → trừ đúng 900 credit', ch.ok && ch.so === 900 && (await C.soDu(db, 'K4')).tong === du0 - 900, JSON.stringify(ch));
kiem('chọn lại lần hai không trừ thêm', (await K.chonDeXuat({ id: dx.id, ma: 'C4-A-001' }, env, db, ph)).code === 'DAXONG' && (await C.soDu(db, 'K4')).tong === du0 - 900);
kiem('đề xuất đã chọn không huỷ được', (await K.huyDeXuat({ id: dx.id }, env, db, coach1)).code === 'DAXONG');
const dx2 = await K.deXuatKhoCao({ maNha: 'K4', ds: ['C4-A-001'] }, env, db, coach1);
kiem('nhà từ chối đề xuất chưa chọn → không mất credit', (await K.huyDeXuat({ id: dx2.id }, env, db, ph)).ok && (await C.soDu(db, 'K4')).tong === du0 - 900);

/* ── thực hiện chăm chỉ → thưởng ── */
kiem('ghi hoàn thành thiếu bằng chứng bị chặn', (await K.hoanThanhKhoCao({ id: dx.id, bangChung: 'xong' }, env, db, coach1)).code === 'SAI');
kiem('phụ huynh không tự ghi hoàn thành', (await K.hoanThanhKhoCao({ id: dx.id, bangChung: 'Con tự đánh dấu đủ 28 tối' }, env, db, ph)).code === 'NOPERM');
const ht = await K.hoanThanhKhoCao({ id: dx.id, bangChung: 'Bảng theo dõi 30 ngày: con tự đánh dấu 26/30 tối' }, env, db, coach1);
kiem('Coach ghi hoàn thành có bằng chứng → nhà được cộng credit thưởng nhiệm vụ', ht.ok && ht.thuong > 0 && (await C.soDu(db, 'K4')).tong === du0 - 900 + ht.thuong, JSON.stringify(ht));
kiem('ghi hoàn thành lần hai không thưởng thêm', (await K.hoanThanhKhoCao({ id: dx.id, bangChung: 'Bảng theo dõi 30 ngày: con tự đánh dấu 26/30 tối' }, env, db, coach1)).trung === true);

/* ── hết số dư ── */
await C.viCredit({ maNha: 'K5' }, env, db, coach1);   // 12.000 credit tặng tầng 5
let daTru = 0;
for (let i = 0; i < 4; i++) {
  const d = await K.deXuatKhoCao({ maNha: 'K5', ds: ['C5-A-001'] }, env, db, r05);
  const c = await K.chonDeXuat({ id: d.id, ma: 'C5-A-001' }, env, db, ph5);
  if (c.ok) daTru++; else kiem('lượt thứ 4 hết số dư → THIEU, ví không âm, đề xuất còn chờ', c.code === 'THIEU' && (await C.soDu(db, 'K5')).tong >= 0, JSON.stringify(c));
}
kiem('Diamond tầng 5 = 3.750 credit, đủ cho đúng 3 lượt từ 12.000', daTru === 3);

/* ── an toàn không bao giờ bị khoá theo gói ── */
const at = await K.chuyenAnToan({ maNha: 'K5', ghiChu: 'Con nói muốn biến mất, nhiều ngày liền' }, env, db, coach1);
kiem('AN TOÀN: nhà hết credit vẫn được chuyển, 0 credit, không cần mã vấn đề', at.ok && at.so === 0 && /không tính credit/.test(at.vi), JSON.stringify(at));
const tb = sq.prepare("SELECT denVai, mucDo FROM thongBao WHERE loai = 'anToan'").all();
kiem('AN TOÀN: báo ngay Giám đốc + Super Admin, mức gấp', tb.length === 2 && tb.every(x => x.mucDo === 'gap') && tb.map(x => x.denVai).sort().join() === 'R01,R03');
kiem('AN TOÀN: ghi lại trong cùng giờ không báo trùng', (await K.chuyenAnToan({ maNha: 'K5' }, env, db, coach1)).trung === true && sq.prepare("SELECT COUNT(*) n FROM thongBao WHERE loai = 'anToan'").get().n === 2);
kiem('AN TOÀN: Coach không phụ trách nhà không ghi được (báo Trưởng nhóm)', (await K.chuyenAnToan({ maNha: 'K3' }, env, db, coach2)).code === 'NOPERM');
kiem('AN TOÀN: không còn cờ anToan để giao gói mà né credit', typeof K.apDungKhoCao === 'undefined' && !/anToan\s*===\s*true/.test(fs.readFileSync(ROOT + '/may-chu/kho-cao.js', 'utf8')));

/* ── sổ ── */
const so = await K.soKhoCaoNha({}, env, db, ph5);
kiem('phụ huynh xem sổ nhà mình: 3 gói Diamond đã chọn', so.ok && so.ds.filter(r => r.so === 3750).length === 3);
kiem('phụ huynh không xem được sổ nhà khác', (await K.soKhoCaoNha({ maNha: 'K5' }, env, db, ph)).code === 'NOPERM');

/* ── chống trùng chính xác (credit.js) ── */
await C.viCredit({ maNha: 'K3' }, env, db, coach1);
const t1 = await C.truTheoThuTu(db, { maNha: 'K3', gia: 10, viec: 'thu', tc: 'A:B' });
const t2 = await C.truTheoThuTu(db, { maNha: 'K3', gia: 10, viec: 'thu', tc: 'A' });
kiem('mã tham chiếu "A" không bị coi là trùng với "A:B" (khoá chính xác, không dò tiền tố)', t1.ok && !t1.trung && t2.ok && !t2.trung);
kiem('gọi lại đúng mã cũ thì trùng, không trừ lần hai', (await C.truTheoThuTu(db, { maNha: 'K3', gia: 10, viec: 'thu', tc: 'A' })).trung === true);

/* ── hệ Tư vấn (đợt 6): R11 phụ trách nhà ở hoSoKhach.tuVan ── */
sq.prepare("UPDATE hoSoKhach SET tuVan = 'TuVan' WHERE maKhachHang = 'K3'").run();   // viết hoa khác tên phiên — vẫn phải khớp
const ph3 = ho('ph3', 'R13', 'K3'), r11b = ho('tuvan2', 'R11');
const loV = [banGhi('V1-A-001', 'S1'), banGhi('V1-A-002', 'DIAMOND'), banGhi('V2-A-001', 'S5')];
const napV = await K.napKhoCao({ ds: loV, ban: 'KC-THU-V' }, env, db, r01);
kiem('nạp vấn đề hệ Tư vấn: mã V → hệ tuvan, tầng theo mã', napV.ok && napV.dem.tuvan === 3 &&
  sq.prepare("SELECT tang FROM khoCao WHERE ma = 'V2-A-001'").get().tang === 2, JSON.stringify(napV));
const dsV = await K.dsKhoCao({ he: 'tuvan' }, env, db, r11);
kiem('R11 đọc danh sách hệ Tư vấn, kèm tên nhóm Tư vấn', dsV.ok && dsV.tong === 3 && dsV.nhomTen['V1-A'] && dsV.nhomTen['V3-J'], JSON.stringify(dsV.dem));
kiem('R11 vẫn bị chặn hệ Coach', (await K.dsKhoCao({ he: 'coach' }, env, db, r11)).code === 'NOPERM');
kiem('giá tầng 1–3 không nhân hệ số: Diamond tầng 1 = 2500', (await K.docKhoCao({ ma: 'V1-A-002' }, env, db, r11)).vd.gia === 2500);
kiem('R11 không phụ trách nhà thì không đề xuất được', (await K.deXuatKhoCao({ maNha: 'K3', ds: ['V1-A-001'] }, env, db, r11b)).code === 'NOPERM');
kiem('R11 phụ trách K3 không đề xuất được cho nhà khác (K4)', (await K.deXuatKhoCao({ maNha: 'K4', ds: ['V1-A-001'] }, env, db, r11)).code === 'NOPERM');
const dxV = await K.deXuatKhoCao({ maNha: 'K3', ds: ['V1-A-001', 'V1-A-002'] }, env, db, r11);
kiem('R11 phụ trách nhà (khớp không phân biệt hoa thường) đề xuất vấn đề hệ Tư vấn', dxV.ok, JSON.stringify(dxV));
kiem('Coach phụ trách vẫn đề xuất được vấn đề hệ Tư vấn cho nhà mình', (await K.deXuatKhoCao({ maNha: 'K3', ds: ['V2-A-001'] }, env, db, coach1)).ok);
const xemV = await K.dsDeXuatNha({ maNha: 'K3' }, env, db, r11);
kiem('R11 xem được đề xuất của nhà mình phụ trách', xemV.ok && xemV.ds.length >= 1);
kiem('R11 không xem được đề xuất của nhà khác', (await K.dsDeXuatNha({ maNha: 'K4' }, env, db, r11)).code === 'NOPERM');
const chV = await K.chonDeXuat({ id: dxV.id, ma: 'V1-A-001' }, env, db, ph3);
kiem('nhà tự chọn phương án 1 sao tầng 1 → trừ 50 credit', chV.ok && chV.so === 50, JSON.stringify(chV));
const htV = await K.hoanThanhKhoCao({ id: dxV.id, bangChung: 'Bảng quan sát 7 ngày đủ cả bảy tối, cả nhà cùng ghi' }, env, db, r11);
kiem('R11 nộp bằng chứng: lượt CHƯA đóng, chưa thưởng, nói rõ chờ Coach/Trưởng nhóm', htV.ok && htV.thuong === 0 && htV.choXacNhan === true && /Trưởng nhóm/.test(htV.vi) &&
  sq.prepare('SELECT xongLuc, bangChung FROM luotKhoCao WHERE deXuat = ?').get(dxV.id).xongLuc == null, JSON.stringify(htV));
const htC = await K.hoanThanhKhoCao({ id: dxV.id, bangChung: 'Đã soát bảng quan sát 7 ngày cùng Tư vấn viên, đủ bảy tối' }, env, db, coach1);
kiem('Coach của nhà bấm hoàn thành SAU Tư vấn viên → lượt đóng và nhà được cộng thưởng (không mất lặng lẽ)', htC.ok && !htC.trung && htC.thuong > 0 &&
  sq.prepare('SELECT xongLuc FROM luotKhoCao WHERE deXuat = ?').get(dxV.id).xongLuc > 0, JSON.stringify(htC));
kiem('R11 không ghi hoàn thành được cho nhà mình không phụ trách', (await K.hoanThanhKhoCao({ id: dx.id, bangChung: 'Bảng theo dõi 30 ngày, đủ bằng chứng' }, env, db, r11)).code === 'NOPERM');
const dxV2 = await K.deXuatKhoCao({ maNha: 'K3', ds: ['V1-A-002'] }, env, db, r11);
kiem('R11 huỷ được đề xuất chưa chọn của nhà mình', (await K.huyDeXuat({ id: dxV2.id }, env, db, r11)).ok);
kiem('R11 không phụ trách không huỷ được', (await K.huyDeXuat({ id: dxV2.id }, env, db, r11b)).code === 'NOPERM');
const atV = await K.chuyenAnToan({ maNha: 'K3', ghiChu: 'Con nói không muốn sống nữa, cả tuần nay' }, env, db, r11);
kiem('AN TOÀN: Tư vấn viên phụ trách nhà ghi được lượt chuyển, 0 credit', atV.ok && atV.so === 0, JSON.stringify(atV));
kiem('AN TOÀN: Tư vấn viên không phụ trách không ghi được', (await K.chuyenAnToan({ maNha: 'K3' }, env, db, r11b)).code === 'NOPERM');
kiem('R11 xem sổ kho cấp cao của nhà mình phụ trách', (await K.soKhoCaoNha({ maNha: 'K3' }, env, db, r11)).ok);
sq.prepare("UPDATE hoSoKhach SET tuVan = 'tuvan' WHERE maKhachHang = 'K4'").run();
const dxC = await K.deXuatKhoCao({ maNha: 'K4', ds: ['C4-A-001'] }, env, db, coach1);
const xemK4 = await K.dsDeXuatNha({ maNha: 'K4' }, env, db, r11);
kiem('R11 phụ trách nhà tầng 4 KHÔNG thấy gói hệ Coach trong đề xuất của nhà', xemK4.ok && xemK4.ds.every(d => d.phuongAn.every(p => p.ma[0] === 'V')) && !JSON.stringify(xemK4).includes('C4-A'), JSON.stringify(xemK4.ds.length));
kiem('R11 phụ trách nhà tầng 4 không huỷ được đề xuất hệ Coach', (await K.huyDeXuat({ id: dxC.id }, env, db, r11)).code === 'NOPERM');
const soK4 = await K.soKhoCaoNha({ maNha: 'K4' }, env, db, r11);
kiem('R11 không thấy lượt hệ Coach trong sổ của nhà', soK4.ok && soK4.ds.every(r => r.ma[0] === 'V'));
await K.huyDeXuat({ id: dxC.id }, env, db, coach1);
kiem('R11 phụ trách nhà tầng 4 vẫn không ghi hoàn thành gói hệ Coach (chỉ đúng hệ của mình)', (await K.hoanThanhKhoCao({ id: dx.id, bangChung: 'Bảng theo dõi 30 ngày, đủ bằng chứng' }, env, db, r11)).code === 'NOPERM');
sq.prepare("UPDATE hoSoKhach SET tuVan = NULL WHERE maKhachHang = 'K4'").run();
/* tên đăng nhập nằm ở ô tuVan nhưng vai KHÔNG phải R11 → không có quyền Tư vấn */
const r12 = ho('phantich', 'R12');
sq.prepare("UPDATE hoSoKhach SET tuVan = 'phantich' WHERE maKhachHang = 'K3'").run();
kiem('vai khác R11 (R12) có tên ở ô tuVan vẫn không đọc, không đề xuất, không ghi an toàn', (await K.dsDeXuatNha({ maNha: 'K3' }, env, db, r12)).code === 'NOPERM' &&
  (await K.deXuatKhoCao({ maNha: 'K3', ds: ['V1-A-001'] }, env, db, r12)).code === 'NOPERM' && (await K.chuyenAnToan({ maNha: 'K3' }, env, db, r12)).code === 'NOPERM');
sq.prepare("UPDATE hoSoKhach SET tuVan = 'TuVan' WHERE maKhachHang = 'K3'").run();
kiem('quyền R11 chỉ mở ở kho cấp cao — không mở ví credit của nhà (vaiVoiNha giữ nguyên)', (await C.viCredit({ maNha: 'K3' }, env, db, r11)).code === 'NOPERM');

/* ── nối dây ── */
const wk = fs.readFileSync(ROOT + '/may-chu/worker.js', 'utf8');
const cua = ['giaKhoCao', 'datGiaKhoCao', 'napKhoCao', 'dsKhoCao', 'docKhoCao', 'deXuatKhoCao', 'dsDeXuatNha', 'chonDeXuat', 'huyDeXuat', 'hoanThanhKhoCao', 'chuyenAnToan', 'soKhoCaoNha'];
kiem(cua.length + ' cửa có trong danh sách phiên và bộ chia của worker', cua.every(c => wk.includes("'" + c + "'") && wk.includes("fn === '" + c + "'")));
const sqlTxt = fs.readFileSync(ROOT + '/may-chu/csdl.sql', 'utf8');
kiem('năm bảng có trong csdl.sql', ['khoCao', 'giaKhoCao', 'deXuatKhoCao', 'luotKhoCao', 'chuyenAnToan'].every(b => sqlTxt.includes('CREATE TABLE IF NOT EXISTS ' + b + ' ')));
const man = fs.readFileSync(ROOT + '/src/tra-cuu-giai-phap.js', 'utf8');
kiem('màn tra cứu có ngăn kho cấp cao gọi đúng cửa', /dsKhoCao/.test(man) && /docKhoCao/.test(man) && /deXuatKhoCao/.test(man) && /chuyenAnToan/.test(man) && /giaKhoCao/.test(man));
const vi = fs.readFileSync(ROOT + '/src/credit-vi.js', 'utf8');
kiem('ví credit của nhà có chỗ xem đề xuất và tự chọn phương án', /dsDeXuatNha/.test(vi) && /chonDeXuat/.test(vi));
kiem('màn không chép bảng giá thứ hai (đọc giá từ máy chủ)', !/2500|3750/.test(man));

/* ── gói mã hoá trong kho mã ── */
const thuMucGoi = ROOT + '/kho-cao';
if (fs.existsSync(thuMucGoi)) {
  const tep = fs.readdirSync(thuMucGoi);
  kiem('kho-cao/ chỉ chứa gói mã hoá — không có tệp nguồn trần', tep.every(f => f === 'goi.enc'), tep.join(','));
  const chu = fs.readFileSync(thuMucGoi + '/goi.enc', 'utf8'), g = JSON.parse(chu);
  kiem('gói đúng định dạng màn hình mở được, không lộ chữ nguồn', g.v === 1 && g.n >= 200000 && g.salt && g.iv && g.ct &&
    !/phanTich|hienTuong|"goi"|Vấn đề|DIAMOND/.test(chu) && man.includes("'kho-cao/goi.enc'"));
}

console.log('\n' + (truot ? '✗ ' + truot + ' SAI · ' : '✓ ') + dat + ' đạt');
process.exit(truot ? 1 : 0);
