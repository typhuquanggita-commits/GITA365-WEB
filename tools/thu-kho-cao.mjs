/* Thử Kho vấn đề cấp cao · 6 hạng · trả bằng credit — D1 giả = node:sqlite.
   Chứng minh:
     · bảng giá khởi đầu đúng thang chủ hệ duyệt (×1,5 tầng 4–5); chỉ R01
       sửa, phải có lý do, giá phải tăng dần theo hạng; dòng mới nhất thắng
     · nạp: chỉ R01, cả lô hoặc không bản nào, chặn Điều 13
     · đọc: Coach (R01–R07) đọc hệ coach; R08–R11, khách bị chặn
     · áp dụng: trừ đúng giá hạng × tầng theo thứ tự tang → thuong → traPhi,
       gọi lại cùng tham chiếu không trừ lần hai, nhà chưa tới tầng bị chặn,
       Coach không phụ trách bị chặn, thiếu số dư bị chặn
     · AN TOÀN: không trừ credit, không cần số dư, không cần đúng tầng
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
sq.prepare("INSERT INTO hoSoKhach (maKhachHang, uidPhuHuynh, tang, coach) VALUES ('K5','P5',5,'coach1')").run();

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
const lo = [banGhi('C4-A-001', 'S1'), banGhi('C4-A-002', 'VIP'), banGhi('C5-A-001', 'DIAMOND')];
kiem('Coach không nạp được kho', (await K.napKhoCao({ ds: lo }, env, db, r05)).code === 'NOPERM');
const hong = await K.napKhoCao({ ds: lo.concat([Object.assign(banGhi('C4-A-003', 'S3'), { van: 'Gọi chị Nguyễn Thị Lan số 0912345678' })]) }, env, db, r01);
kiem('một bản ghi lộ tên + số điện thoại → từ chối CẢ lô (Điều 13)', hong.code === 'HONG' && /DIEU13/.test(hong.hong.join()) && !sq.prepare('SELECT COUNT(*) n FROM khoCao').get().n, JSON.stringify(hong.hong));
kiem('bản ghi thiếu ô gói (goi) bị từ chối', (await K.napKhoCao({ ds: [Object.assign(banGhi('C4-A-004', 'S5'), { goi: {} })] }, env, db, r01)).code === 'HONG');
kiem('hạng lạ bị từ chối', (await K.napKhoCao({ ds: [banGhi('C4-A-005', 'GOLD')] }, env, db, r01)).code === 'HONG');
const nap = await K.napKhoCao({ ds: lo, ban: 'KC-THU' }, env, db, r01);
kiem('Super Admin nạp lô sạch: 3 vấn đề, hệ coach', nap.ok && nap.dem.coach === 3, JSON.stringify(nap));

/* ── đọc ── */
const ds = await K.dsKhoCao({ he: 'coach' }, env, db, coach1);
kiem('Coach thấy danh sách kèm hạng + giá, không kèm nội dung', ds.ok && ds.tong === 3 && ds.ds[0].gia && !ds.ds[0].phacDo && ds.dem.VIP === 1, JSON.stringify(ds.ds[0]));
kiem('lọc theo tầng 5 + hạng Diamond', (await K.dsKhoCao({ he: 'coach', tang: 5, hang: 'DIAMOND' }, env, db, coach1)).tong === 1);
kiem('Giáo viên (R08) bị chặn kho Coach ở máy chủ', (await K.dsKhoCao({ he: 'coach' }, env, db, r08)).code === 'NOPERM');
kiem('Chuyên viên tư vấn (R11) bị chặn kho Coach', (await K.docKhoCao({ ma: 'C4-A-002' }, env, db, r11)).code === 'NOPERM');
kiem('phụ huynh bị chặn đọc nội dung', (await K.docKhoCao({ ma: 'C4-A-002' }, env, db, ph)).code === 'NOPERM');
const doc = await K.docKhoCao({ ma: 'C4-A-002' }, env, db, coach1);
kiem('Coach đọc đủ 13 mục + gói + giá Vip tầng 4 = 900', doc.ok && doc.vd.goi && doc.vd.phacDo && doc.vd.gia === 900 && doc.vd.tenHang === 'Vip', JSON.stringify({ gia: doc.vd && doc.vd.gia }));

/* ── áp dụng + credit ── */
await C.viCredit({ maNha: 'K4' }, env, db, coach1);   // mở ví → 8.000 credit tặng tầng 4
const du0 = (await C.soDu(db, 'K4')).tong;
const a1 = await K.apDungKhoCao({ ma: 'C4-A-002', maNha: 'K4', thamChieu: 'CA-01' }, env, db, coach1);
kiem('Coach phụ trách áp dụng Vip tầng 4 → trừ đúng 900 credit', a1.ok && a1.so === 900 && (await C.soDu(db, 'K4')).tong === du0 - 900, JSON.stringify(a1));
const a1b = await K.apDungKhoCao({ ma: 'C4-A-002', maNha: 'K4', thamChieu: 'CA-01' }, env, db, coach1);
kiem('gọi lại cùng tham chiếu không trừ lần hai', a1b.ok && a1b.trung && (await C.soDu(db, 'K4')).tong === du0 - 900);
kiem('Coach không phụ trách nhà bị chặn', (await K.apDungKhoCao({ ma: 'C4-A-001', maNha: 'K4', thamChieu: 'CA-02' }, env, db, coach2)).code === 'NOPERM');
kiem('phụ huynh không tự lấy gói', (await K.apDungKhoCao({ ma: 'C4-A-001', maNha: 'K4', thamChieu: 'CA-02' }, env, db, ph)).code === 'NOPERM');
kiem('thiếu tham chiếu bị chặn', (await K.apDungKhoCao({ ma: 'C4-A-001', maNha: 'K4' }, env, db, coach1)).code === 'THIEUTC');
kiem('nhà tầng 3 không nhận được vấn đề tầng 4 (quyền lợi theo tầng)', (await K.apDungKhoCao({ ma: 'C4-A-001', maNha: 'K3', thamChieu: 'CA-03' }, env, db, coach1)).code === 'TANGCHUA');
kiem('nhà tầng 4 không nhận được vấn đề tầng 5', (await K.apDungKhoCao({ ma: 'C5-A-001', maNha: 'K4', thamChieu: 'CA-04' }, env, db, coach1)).code === 'TANGCHUA');
await C.viCredit({ maNha: 'K5' }, env, db, coach1);   // 12.000 credit tặng tầng 5
const a5 = await K.apDungKhoCao({ ma: 'C5-A-001', maNha: 'K5', thamChieu: 'CA-05' }, env, db, r05);
kiem('Trưởng nhóm Coach áp dụng Diamond tầng 5 → 3750 credit', a5.ok && a5.so === 3750, JSON.stringify(a5));
await K.apDungKhoCao({ ma: 'C5-A-001', maNha: 'K5', thamChieu: 'CA-06' }, env, db, r05);
await K.apDungKhoCao({ ma: 'C5-A-001', maNha: 'K5', thamChieu: 'CA-07' }, env, db, r05);
const het = await K.apDungKhoCao({ ma: 'C5-A-001', maNha: 'K5', thamChieu: 'CA-08' }, env, db, r05);
kiem('hết số dư → THIEU, ví không âm', het.code === 'THIEU' && (await C.soDu(db, 'K5')).tong >= 0, JSON.stringify(het));

/* ── an toàn không bao giờ bị khoá theo gói ── */
const at = await K.apDungKhoCao({ ma: 'C5-A-001', maNha: 'K5', anToan: true }, env, db, r05);
kiem('AN TOÀN: nhà hết credit vẫn được chuyển, 0 credit', at.ok && at.anToan && at.so === 0 && /không tính credit/.test(at.vi), JSON.stringify(at));
const at2 = await K.apDungKhoCao({ ma: 'C5-A-001', maNha: 'K3', anToan: true }, env, db, coach2);
kiem('AN TOÀN: không cần đúng tầng, không cần là Coach phụ trách', at2.ok && at2.so === 0);
const so = await K.soKhoCaoNha({ maNha: 'K5' }, env, db, r05);
kiem('sổ áp dụng của nhà ghi cả lượt an toàn (so = 0)', so.ok && so.ds.some(r => r.anToan === 1 && r.so === 0) && so.ds.filter(r => r.so === 3750).length === 3);
kiem('phụ huynh xem được sổ nhà mình', (await K.soKhoCaoNha({ maNha: 'K4' }, env, db, ph)).ok);
kiem('phụ huynh không xem được sổ nhà khác', (await K.soKhoCaoNha({ maNha: 'K5' }, env, db, ph)).code === 'NOPERM');

/* ── nối dây ── */
const wk = fs.readFileSync(ROOT + '/may-chu/worker.js', 'utf8');
const cua = ['giaKhoCao', 'datGiaKhoCao', 'napKhoCao', 'dsKhoCao', 'docKhoCao', 'apDungKhoCao', 'soKhoCaoNha'];
kiem('7 cửa có trong danh sách phiên và bộ chia của worker', cua.every(c => wk.includes("'" + c + "'") && wk.includes("fn === '" + c + "'")));
const sqlTxt = fs.readFileSync(ROOT + '/may-chu/csdl.sql', 'utf8');
kiem('ba bảng có trong csdl.sql', ['khoCao', 'giaKhoCao', 'luotKhoCao'].every(b => sqlTxt.includes('CREATE TABLE IF NOT EXISTS ' + b + ' ')));
const man = fs.readFileSync(ROOT + '/src/tra-cuu-giai-phap.js', 'utf8');
kiem('màn tra cứu có ngăn kho cấp cao gọi đúng cửa', /dsKhoCao/.test(man) && /docKhoCao/.test(man) && /apDungKhoCao/.test(man) && /giaKhoCao/.test(man));
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
