/* Thử kho Ngôi nhà thịnh vượng (may-chu/kho-nhiem-vu.js): cẩm nang ba cấp
   theo 21 ô bản đồ + kho 1000 nhiệm vụ. D1 giả = node:sqlite.
   Dùng: node tools/thu-kho-nha.mjs   (Node >= 22.5)

   Bản ghi thử dựng bằng máy (chữ đủ độ dài) — bộ soát đếm hình và độ dài,
   nên phép thử đo được CỔNG; chất lượng nội dung thật là việc của tổ biên
   soạn và của bộ soát độ sâu chạy trên nguồn thật (soat-kho-nha.mjs). */
import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import { pathToFileURL, fileURLToPath } from 'node:url';
const ROOT = process.argv[2] || fileURLToPath(new URL('..', import.meta.url)).replace(/[\\/]$/, '');
globalThis.fetch = async () => { throw new Error('không gọi mạng ngoài'); };
let dat = 0, truot = 0;
const kiem = (ten, dk, ct) => { if (dk) { dat++; console.log('OK  ' + ten); } else { truot++; const d = 'SAI ' + ten + (ct ? ' — ' + ct : ''); console.log(d);
  if (process.env.GITHUB_ACTIONS) console.log('::error title=thu-kho-nha::' + d.replace(/[\r\n%]/g, ' ').slice(0, 900)); } };

/* ── bản ghi thử ── */
let dem = 0;
const T = n => { dem++; let s = 'Gia đình làm việc quan sát được, ghi lại bằng số và nói ra điều đã học ở lượt ' + dem + '.'; while (s.length < n + 10) s += ' Mỗi bước có người làm, có thời lượng, có dấu hiệu nhìn thấy.'; return s; };
const L = (k, n) => Array.from({ length: k }, () => T(n));
function nhiemVu(id, o) {
  const r = { id, ten: T(10).slice(0, 80), tenViec: T(40), noiDungViec: T(120), ketQua: T(80),
    thuocTinh: { doiTuong: T(12), thoiLuong: T(12), phamVi: T(12), vatLieu: T(12), dauRa: T(12), phanLoai: T(12) },
    nenTang: { ten: 'Năm bước', nguon: T(20), buoc: L(5, 40).map(x => ({ ten: 'Bước', cachLam: x, bangChung: T(15) })) },
    gita: { G: T(80), I: T(80), T: T(80), A: T(80) },
    c437: { yeuTo: L(4, 25).map(x => ({ ten: 'Yếu tố', hanhVi: x, hoTro: T(25) })), giaiDoan: { dung: T(40), du: T(40), deu: T(40) },
      buoc: L(7, 25).map(x => ({ ten: 'Bước', hanhDong: x, dauRa: T(10) })) },
    phanVai: L(3, 25).map(x => ({ vai: 'Người lớn', phanViec: x })),
    lich7: L(7, 40).map(x => ({ ten: 'Ngày', hoatDong: x, dauRa: T(10), cauHoi: T(10) })),
    baMuc: { toiThieu: T(30), tieuChuan: T(30), moRong: T(30) }, phucHoi: T(120),
    saoChuyenGia: L(5, 30).map(x => ({ kyNang: 'Chẩn đoán', hanhVi: x, chuaDat: T(20) })),
    phanHoi: T(120), cauHoiChuyenGia: L(6, 15), video: T(120),
    baiHocGiaTri: L(5, 20).map(x => ({ giaTri: 'Trách nhiệm', traiNghiem: x, cauHoi: T(15) })),
    kyThuat: { toChuc: T(100), anToan: T(100), quanHe: T(100) },
    moc: L(5, 8).map(x => ({ chiSo: 'Tỷ lệ', n7: x, n21: T(8), n90: T(8) })),
    ddd: { dung: T(30), du: T(30), deu: T(30) },
    cap: Array.from({ length: 10 }, (_, i) => ({ so: i + 1, ten: 'Cấp ' + (i + 1) + ' nhìn ra', traiNghiem: 'Trải nghiệm ' + (i + 1), credit: 10 * (i + 1),
      nangLuc: T(40), mucTieu: T(60), nhiemVu: T(60), huongDan: L(7, 15), gocTuDuy: L(3, 15), cauDaoSau: T(20), baiHoc: T(40), ungDung: T(30),
      chuanDat: T(60), bangChung: T(25), chuaDat: T(25), hoTro: T(40) + ' HO_TRO_COACH_NOI_BO', cuaLenCap: T(25) })),
    chang: { khoiTao: { phanGiao: T(40), dieuKien: T(20) }, thucHanh7: { phanGiao: T(40), dieuKien: T(20) }, duyTri21: { phanGiao: T(40), dieuKien: T(20) }, lamChu90: { phanGiao: T(40), dieuKien: T(20) } },
    canhBao: T(60) };
  Object.assign(r, o || {});
  return r;
}
function camNang(o, ten) {
  const T2 = n => T(n * 4), T5 = n => T(n * 6), L5 = (k, n) => L(k, n * 6);
  const g = () => ({ mucDich: T(150), dauHieuVao: T(100), thucHanh: L(5, 40), cauHoiKhaiVan: L(8, 15), bieuMau: T(120), chuanRa: T(100), bay: T(100), voiNhanSu: T(120) });
  const bm = k => Array.from({ length: k }, () => ({ ten: 'Phiếu', dung: T(30), truong: ['Ngày', 'Người làm', 'Việc', 'Số đo', 'Ghi chú'] }));
  const r = { id: 'CN-' + o, ten,
    cap1: { loiMo: T(120), viSao: T(200), buocDauTien: T(80), baViec: L(3, 60).map(x => ({ viec: T(15), cachLam: x, dauHieu: T(20) })),
      phieu7: L(7, 20), cauHoiNha: L(3, 15), dauHieuTienBo: L(3, 15), dungLam: L(3, 15), khiNaoHoi: T(80) },
    cap2: { mucTieuNghiepVu: T2(200), chanDoan: { dauHieu: L(5, 20), cauHoi: L(6, 15), ngheGi: T2(120) },
      kichBanBuoi: { mo: T2(150), khai: T2(150), thongNhat: T2(150), chot: T2(150) }, bieuMau: bm(3),
      loTrinh: { n7: T2(150), n21: T2(150), n90: T2(150) }, caNhanHoa: { T1: T2(60), T2: T2(60), T3: T2(60), T4: T2(60), T5: T2(60) },
      phanDoi: L(5, 80).map(x => ({ cau: T2(10), dap: x })), nguyenLy2080: T2(200), chuanDat: T2(200), khiChuyenCoach: T2(120) },
    cap3: { lyThuyet: { nguyenLy: T5(600), nenTang: L5(3, 60), nguon: T5(60) },
      chuoi5: { chuaLanh: g(), ganKet: g(), khaiMo: g(), dinhHuong: g(), nangTam: g() },
      trienKhai: L5(10, 40), loTrinh90: { tuan: L5(12, 40) },
      tuDuyKhacBiet: L5(5, 40).map(x => ({ thuongNghi: T5(15), gitaNghi: x, viSao: T5(40) })),
      nguyenLy2080: { hai: L5(3, 30), tamMuoi: T5(100), viSao: T5(150), boQua: L5(3, 20) },
      moThucGITA: { G: T5(150), I: T5(150), T: T5(150), A: T5(150), c437: T5(150) }, bieuMau: bm(6),
      caMau: L5(3, 150).map(x => ({ boiCanh: x, diBuoc: T5(300), ketQua: T5(80), baiHoc: T5(60) })),
      saoChuyenGia: L5(5, 40).map(x => ({ kyNang: 'Chẩn đoán', hanhVi: x, chuaDat: T5(25) })), anToan: T5(200) } };
  return r;
}

const K = await import(pathToFileURL(ROOT + '/may-chu/kho-nhiem-vu.js').href);

/* ── soát tĩnh ── */
const nvMau = nhiemVu('NV-NEN-01', { doiTuong: 'nha', tang: 3, traiNghiem: true });
kiem('một hồ sơ đủ phần qua bộ soát', K.soatNhiemVu(nvMau).length === 0, K.soatNhiemVu(nvMau).join(' | '));
const thieu7 = JSON.parse(JSON.stringify(nvMau)); delete thieu7.cap[6].gocTuDuy;
kiem('thiếu cột 5 của cấp 7 thì bộ soát gọi đúng tên "cap7.gocTuDuy"', K.soatNhiemVu(thieu7).some(l => l.startsWith('cap7.gocTuDuy')), K.soatNhiemVu(thieu7).join(' | '));
const saiCr = JSON.parse(JSON.stringify(nvMau)); saiCr.cap[2].credit = 99;
kiem('credit cấp n phải đúng 10·n', K.soatNhiemVu(saiCr).some(l => /cap3\.credit/.test(l)));
const mong = JSON.parse(JSON.stringify(nvMau)); mong.cap = mong.cap.slice(0, 9);
kiem('thiếu một cấp (9/10) thì không qua', K.soatNhiemVu(mong).some(l => /đúng 10 cấp/.test(l)));
kiem('ô lạ hoặc số thứ tự vượt ô bị chặn', K.soatNhiemVu(nhiemVu('NV-P1-46', { doiTuong: 'nha', tang: 3 })).some(l => /01–45/.test(l)) &&
  K.soatNhiemVu(nhiemVu('NV-KH-A-01', { doiTuong: 'nha', tang: 3 })).some(l => /id sai dạng/.test(l)));
kiem('nhiệm vụ nhân sự không mang tầng khách', K.soatNhiemVu(nhiemVu('NV-B02-01', { doiTuong: 'nhanSu', tang: 3 })).some(l => /tang/.test(l)));
const hua = nhiemVu('NV-NEN-02', { doiTuong: 'nha', tang: 3, ketQua: T(80) + ' Chúng tôi cam kết con sẽ thay đổi chắc chắn 100% hiệu quả.' });
kiem('lời hứa kết quả / từ tuyệt đối bị chặn', K.soatNhiemVu(hua).some(l => /lời hứa/.test(l)));
kiem('21 ô bản đồ: 1 mái · 8 phòng · cửa · nền · 10 bánh đà, tổng 1000 nhiệm vụ',
  Object.keys(K.O_NHA).length === 21 && Object.values(K.O_NHA).reduce((s, o) => s + o.soNV, 0) === 1000);
const nha = fs.readFileSync(ROOT + '/src/ngoi-nha.js', 'utf8');
const tenNha = [...nha.matchAll(/k:'(mai|n[1-8]|cua|nen)'[^}]*?ten:'([^']+)'/g)].map(m => m[2]);
kiem('tên 11 ô nhà khớp màn ngoi-nha (G.NHA_PHAN)', JSON.stringify(tenNha) === JSON.stringify(['MAI', 'P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8', 'CUA', 'NEN'].map(o => K.O_NHA[o].ten)), JSON.stringify(tenNha));
const cnMau = camNang('NEN', 'Nền móng');
kiem('cẩm nang ba cấp đủ phần qua bộ soát', K.soatCamNang(cnMau).length === 0, K.soatCamNang(cnMau).join(' | '));
const ngan = JSON.parse(JSON.stringify(cnMau)); ngan.cap3.lyThuyet.nguyenLy = T(600); ngan.cap1.loiMo = T(120) + T(9000);
kiem('cấp 3 dưới 10 lần cấp 1 thì không qua', K.soatCamNang(ngan).some(l => /10 × cap1/.test(l)), K.soatCamNang(ngan).join(' | '));
const thieuChuoi = JSON.parse(JSON.stringify(cnMau)); delete thieuChuoi.cap3.chuoi5.khaiMo;
kiem('thiếu một giai đoạn của chuỗi 5 (khai mở) thì gọi đúng tên', K.soatCamNang(thieuChuoi).some(l => l.startsWith('cap3.chuoi5.khaiMo')));
const saiTen = camNang('NEN', 'Móng nhà');
kiem('tên cẩm nang phải đúng tên ô', K.soatCamNang(saiTen).some(l => /đúng tên ô/.test(l)));

/* ── máy chủ ── */
async function dung() {
  const sq = new DatabaseSync(':memory:');
  sq.exec(fs.readFileSync(ROOT + '/may-chu/csdl.sql', 'utf8'));
  const db = { prepare(sql) { let a = []; const st = { bind(...x) { a = x; return st; },
      first() { try { return Promise.resolve(sq.prepare(sql).get(...a) || null); } catch (e) { return Promise.reject(e); } },
      all() { return Promise.resolve({ results: sq.prepare(sql).all(...a) }); },
      run() { const r = sq.prepare(sql).run(...a); return Promise.resolve({ meta: { changes: Number(r.changes) } }); } }; return st; },
    async batch(ds) { sq.exec('BEGIN'); try { for (const s of ds) await s.run(); sq.exec('COMMIT'); } catch (e) { sq.exec('ROLLBACK'); throw e; } } };
  const NG = [['U1', 'chu', 'R01'], ['U2', 'admin', 'R02'], ['U4', 'chuyenmon', 'R04'], ['U5', 'truongcoach', 'R05'], ['U7', 'coach1', 'R07'], ['U8', 'coach2', 'R07'], ['U11', 'tuvan1', 'R11']];
  for (const [id, u, r] of NG) sq.prepare('INSERT INTO users (id, username, email, role, active) VALUES (?,?,?,?,1)').run(id, u, u + '@gita.vn', r);
  /* K2 tầng 2 · K3 tầng 3 (coach1, tư vấn tuvan1) · K4 tầng 3 của coach2 */
  for (const [i, t, c] of [[2, 2, 'coach1'], [3, 3, 'coach1'], [4, 3, 'coach2']]) {
    sq.prepare("INSERT INTO users (id, username, role, active, maKhachHang) VALUES (?,?,'R13',1,?)").run('P' + i, 'ph' + i, 'K' + i);
    sq.prepare('INSERT INTO hoSoKhach (maKhachHang, uidPhuHuynh, tang, coach, tuVan) VALUES (?,?,?,?,?)').run('K' + i, 'P' + i, t, c, i === 3 ? 'tuvan1' : null);
  }
  return { sq, db };
}
const ho = (u, role, uid, mk) => ({ u, role, uid, maKhachHang: mk });
const chu = ho('chu', 'R01', 'U1'), adm = ho('admin', 'R02', 'U2'), r04 = ho('chuyenmon', 'R04', 'U4'), r05 = ho('truongcoach', 'R05', 'U5'),
  c1 = ho('coach1', 'R07', 'U7'), c2 = ho('coach2', 'R07', 'U8'), tv1 = ho('tuvan1', 'R11', 'U11');
const ph = i => ho('ph' + i, 'R13', 'P' + i, 'K' + i);
const PL = 'Buổi phân loại: con tự phân loại được năm đồ, cần gợi ý khi đặt nhãn, chưa cần làm mẫu.';
const BC = 'Cả nhà làm năm ngày trên bảy, tìm được bốn trên năm đồ dưới ba mươi giây. Khó nhất là ngày bận, nhà mình làm phần tối thiểu.';
const NT = 'Đạt đủ tiêu chí cấp: đúng thứ tự, có bằng chứng tuần, biết phục hồi. Kiểm lại sau 7 ngày.';

async function chay(K) {
  const { sq, db } = await dung(), env = {}, r = {};
  /* 12 nhiệm vụ: NEN-01..06 nhà tầng 3 (01–05 trải nghiệm), NEN-07 nhà tầng 4, B02-01..05 nhân sự */
  const ds = [];
  for (let i = 1; i <= 7; i++) ds.push(nhiemVu('NV-NEN-0' + i, { doiTuong: 'nha', tang: i === 7 ? 4 : 3, traiNghiem: i <= 5 ? true : undefined }));
  for (let i = 1; i <= 5; i++) ds.push(nhiemVu('NV-B02-0' + i, { doiTuong: 'nhanSu' }));
  ds.forEach(d => { if (d.traiNghiem === undefined) delete d.traiNghiem; });
  r.napR04 = await K.napKhoNhiemVu({ ds }, env, db, r04);
  r.nap = await K.napKhoNhiemVu({ ds, ban: 'THU' }, env, db, chu);
  /* quyền đọc */
  r.dsKhach = await K.dsKhoNhiemVu({}, env, db, ph(3));
  r.docKhach = await K.docNhiemVu({ ma: 'NV-NEN-01' }, env, db, ph(3));
  r.docAdmin = await K.docNhiemVu({ ma: 'NV-NEN-01' }, env, db, adm);
  r.docC1Truoc = await K.docNhiemVu({ ma: 'NV-NEN-01' }, env, db, c1);
  r.docR05 = await K.docNhiemVu({ ma: 'NV-NEN-01' }, env, db, r05);
  r.ganC1 = await K.ganNhiemVu({ maNguoi: 'coach1', ma: ['NV-NEN-01', 'NV-NEN-02', 'NV-NEN-03', 'NV-NEN-04', 'NV-NEN-05', 'NV-NEN-06', 'NV-NEN-07'] }, env, db, r05);
  r.ganVuot = await K.ganNhiemVu({ maNguoi: 'coach1', ma: ['NV-B02-01'] }, env, db, r05);
  r.ganBoiCoach = await K.ganNhiemVu({ maNguoi: 'coach2', ma: ['NV-NEN-01'] }, env, db, c1);
  r.docC1 = await K.docNhiemVu({ ma: 'NV-NEN-01' }, env, db, c1);
  r.ganTv = await K.ganNhiemVu({ maNguoi: 'tuvan1', ma: ['NV-NEN-01'] }, env, db, chu);
  r.docTv = await K.docNhiemVu({ ma: 'NV-NEN-01' }, env, db, tv1);
  r.dsC1 = await K.dsKhoNhiemVu({}, env, db, c1);
  /* giao — nhà tầng 2: chỉ trải nghiệm, cấp ≤2, tối đa 5 */
  r.t2NgoaiTN = await K.giaoPhieuNhiemVu({ ma: 'NV-NEN-06', cap: 1, chang: 'khoiTao', maNha: 'K2' }, env, db, c1);
  r.t2Cap3 = await K.giaoPhieuNhiemVu({ ma: 'NV-NEN-01', cap: 3, chang: 'khoiTao', maNha: 'K2', phanLoai: PL }, env, db, c1);
  r.t2Nam = [];
  for (let i = 1; i <= 5; i++) r.t2Nam.push(await K.giaoPhieuNhiemVu({ ma: 'NV-NEN-0' + i, cap: 1, chang: 'khoiTao', maNha: 'K2' }, env, db, c1));
  /* nhiệm vụ thứ sáu cho nhà tầng 2 — dùng nhiệm vụ trải nghiệm giả lập bằng một bản ghi mới */
  const n6 = nhiemVu('NV-P1-01', { doiTuong: 'nha', tang: 3, traiNghiem: true });
  await K.napKhoNhiemVu({ ds: [n6] }, env, db, chu);
  r.t2Sau = await K.giaoPhieuNhiemVu({ ma: 'NV-P1-01', cap: 1, chang: 'khoiTao', maNha: 'K2' }, env, db, r05);
  /* nhà tầng 3 */
  r.vuotTang = await K.giaoPhieuNhiemVu({ ma: 'NV-NEN-07', cap: 1, chang: 'khoiTao', maNha: 'K3' }, env, db, c1);
  r.khongPhuTrach = await K.giaoPhieuNhiemVu({ ma: 'NV-NEN-06', cap: 1, chang: 'khoiTao', maNha: 'K4' }, env, db, c1);
  r.cap2KhongPL = await K.giaoPhieuNhiemVu({ ma: 'NV-NEN-06', cap: 2, chang: 'khoiTao', maNha: 'K3' }, env, db, c1);
  r.cap2PL = await K.giaoPhieuNhiemVu({ ma: 'NV-NEN-06', cap: 2, chang: 'thucHanh7', maNha: 'K3', phanLoai: PL }, env, db, c1);
  r.cap3Som = await K.giaoPhieuNhiemVu({ ma: 'NV-NEN-06', cap: 3, chang: 'khoiTao', maNha: 'K3' }, env, db, c1);
  r.tvVuotCap = await K.giaoPhieuNhiemVu({ ma: 'NV-NEN-01', cap: 4, chang: 'khoiTao', maNha: 'K3', phanLoai: PL }, env, db, tv1);
  /* phiếu của nhà */
  r.phK3 = await K.phieuCuaToi({}, env, db, ph(3));
  r.phK4 = await K.phieuCuaToi({}, env, db, ph(4));
  r.phDaiSu = await K.phieuCuaToi({}, env, db, ho('ds', 'R15', 'U15'));
  const pid = r.cap2PL.id;
  r.nopTen = await K.nopNhiemVu({ phieu: pid, noiDung: 'Con Nguyễn Văn An 8 tuổi lớp 3 làm năm ngày trên bảy, tìm được đồ nhanh.' }, env, db, ph(3));
  r.nopNhaKhac = await K.nopNhiemVu({ phieu: pid, noiDung: BC }, env, db, ph(4));
  r.nop = await K.nopNhiemVu({ phieu: pid, noiDung: BC }, env, db, ph(3));
  r.ntKhach = await K.nghiemThuNhiemVu({ phieu: pid, ketQua: 'dat', ghiChu: NT }, env, db, ph(3));
  r.ntCoach2 = await K.nghiemThuNhiemVu({ phieu: pid, ketQua: 'dat', ghiChu: NT }, env, db, c2);
  r.nt = await K.nghiemThuNhiemVu({ phieu: pid, ketQua: 'dat', ghiChu: NT }, env, db, c1);
  r.ntLai = await K.nghiemThuNhiemVu({ phieu: pid, ketQua: 'dat', ghiChu: NT }, env, db, c1);
  r.cap3SauDat = await K.giaoPhieuNhiemVu({ ma: 'NV-NEN-06', cap: 3, chang: 'khoiTao', maNha: 'K3' }, env, db, c1);
  r.soCr = await K.soCreditNhiemVu({}, env, db, ph(3));
  r.soCrDong = sq.prepare("SELECT COUNT(*) n FROM soCreditNV WHERE doiTuong = 'K3'").get().n;
  /* nhân sự: giao cho tuvan1; tự nghiệm thu bị chặn */
  r.giaoNS = await K.giaoPhieuNhiemVu({ ma: 'NV-B02-01', cap: 1, chang: 'khoiTao', maNguoi: 'tuvan1' }, env, db, r05);
  await K.ganNhiemVu({ maNguoi: 'coach2', ma: ['NV-B02-01'] }, env, db, r05);
  r.giaoNSCoach = await K.giaoPhieuNhiemVu({ ma: 'NV-B02-01', cap: 1, chang: 'khoiTao', maNguoi: 'tuvan1' }, env, db, c2);
  r.nopNS = await K.nopNhiemVu({ phieu: r.giaoNS.id, noiDung: BC }, env, db, tv1);
  r.tuNT = await K.nghiemThuNhiemVu({ phieu: r.giaoNS.id, ketQua: 'dat', ghiChu: NT }, env, db, tv1);
  /* cẩm nang */
  r.napCN = await K.napCamNang({ ds: [camNang('NEN', 'Nền móng')] }, env, db, chu);
  r.napCNR04 = await K.napCamNang({ ds: [camNang('NEN', 'Nền móng')] }, env, db, r04);
  r.cn3C1 = await K.docCamNang({ ma: 'CN-NEN', cap: 3 }, env, db, c1);
  r.cn3Tv = await K.docCamNang({ ma: 'CN-NEN', cap: 3 }, env, db, tv1);
  r.cn2Tv = await K.docCamNang({ ma: 'CN-NEN', cap: 2 }, env, db, tv1);
  r.cn2Adm = await K.docCamNang({ ma: 'CN-NEN', cap: 2 }, env, db, adm);
  r.cn1Khach = await K.docCamNang({ ma: 'CN-NEN', cap: 1 }, env, db, ph(3));
  r.dsCNKhach = await K.dsCamNang({}, env, db, ph(3));
  r.giaoCNKhac = await K.giaoCamNang({ ma: 'CN-NEN', maNha: 'K4' }, env, db, c1);
  r.giaoCN = await K.giaoCamNang({ ma: 'CN-NEN', maNha: 'K3' }, env, db, c1);
  r.cnK3 = await K.camNangCuaNha({}, env, db, ph(3));
  r.cnK4 = await K.camNangCuaNha({}, env, db, ph(4));
  return r;
}
const r = await chay(K);

kiem('chỉ Super Admin nạp kho', r.napR04.code === 'NOPERM' && r.nap.ok && r.nap.nap === 12, JSON.stringify(r.nap));
kiem('khách hàng 0% kho nội bộ: danh sách và hồ sơ chủ đều đóng', r.dsKhach.code === 'NOPERM' && r.docKhach.code === 'NOPERM');
kiem('quản trị kỹ thuật (R02) không có quyền đọc mặc định', r.docAdmin.code === 'NOPERM');
kiem('Coach chưa được gán thì không đọc, dù còn trần (mặc định từ chối)', r.docC1Truoc.code === 'CHUAGAN');
kiem('Trưởng chuyên môn Coach (R05) đọc toàn kho, đủ 10 cấp', r.docR05.ok && r.docR05.nv.cap.length === 10);
kiem('gán trong trần 60% (7/12 kho)', r.ganC1.ok, JSON.stringify(r.ganC1));
kiem('gán vượt trần 60% bị chặn và nói rõ con số', r.ganVuot.code === 'VUOTTRAN' && /60%/.test(r.ganVuot.error), JSON.stringify(r.ganVuot));
kiem('Coach không tự gán danh mục cho người khác', r.ganBoiCoach.code === 'NOPERM');
kiem('Coach đọc được nhiệm vụ đã gán, đủ 10 cấp', r.docC1.ok && r.docC1.nv.cap.length === 10);
kiem('Tư vấn chưa có chứng nhận = tập sự: trần 10% → 13 nhiệm vụ cho 1, đọc tới cấp 3', r.ganTv.ok && r.docTv.ok && r.docTv.nv.cap.length === 3 && r.docTv.catBot === true, JSON.stringify(r.ganTv) + ' ' + (r.docTv.nv ? r.docTv.nv.cap.length : r.docTv.code));
kiem('danh sách đánh dấu khoá mã chưa gán, không trả nội dung', r.dsC1.ok && r.dsC1.ds.find(x => x.ma === 'NV-B02-01').khoa === true && !('noiDung' in r.dsC1.ds[0]));
kiem('nhà tầng 2: nhiệm vụ không phải trải nghiệm bị chặn', r.t2NgoaiTN.code === 'NGOAITRAINGHIEM');
kiem('nhà tầng 2: chỉ tới cấp 2', r.t2Cap3.code === 'VUOTTRAINGHIEM');
kiem('nhà tầng 2: nhận được 5 nhiệm vụ trải nghiệm', r.t2Nam.every(x => x.ok), JSON.stringify(r.t2Nam.filter(x => !x.ok)));
kiem('nhà tầng 2: nhiệm vụ thứ sáu bị chặn — mời lên tầng 3', r.t2Sau.code === 'DUTRAINGHIEM' && /tầng 3/.test(r.t2Sau.error), JSON.stringify(r.t2Sau));
kiem('nhà tầng 3 không nhận nhiệm vụ tầng 4', r.vuotTang.code === 'VUOTTANG');
kiem('không phụ trách nhà thì không giao', r.khongPhuTrach.code === 'NOPERM_NHA');
kiem('bắt đầu ở cấp 2 mà chưa ghi phân loại ban đầu thì chặn', r.cap2KhongPL.code === 'THIEUPHANLOAI');
kiem('có phân loại ban đầu thì giao được cấp 2', r.cap2PL.ok, JSON.stringify(r.cap2PL));
kiem('cấp 3 khi cấp 2 chưa đạt bị chặn ("chỉ tăng phạm vi khi đã làm đúng")', r.cap3Som.code === 'CHUADATCAPTRUOC', JSON.stringify(r.cap3Som));
kiem('tư vấn tập sự không giao vượt cấp 3', r.tvVuotCap.code === 'VUOTCAP');
const pK3 = r.phK3.ds.find(x => x.id === r.cap2PL.id);
kiem('nhà đọc đúng phiếu của mình; phiếu nhà khác không lọt', r.phK3.ok && !!pK3 && r.phK4.ds.length === 0);
kiem('phiếu giao KHÔNG có credit, cột Coach hỗ trợ, năm sao hay câu hỏi chuyên gia', pK3 && !JSON.stringify(pK3.phieu).includes('HO_TRO_COACH_NOI_BO') &&
  !('credit' in pK3.phieu) && !('saoChuyenGia' in pK3.phieu) && !('cauHoiChuyenGia' in pK3.phieu));
kiem('phiếu chặng thực hành 7 ngày kèm lịch 7 ngày', pK3 && Array.isArray(pK3.phieu.lich7) && pK3.phieu.lich7.length === 7);
kiem('đại sứ (R15) không có phiếu nhiệm vụ gia đình', r.phDaiSu.code === 'NOPERM');
kiem('bằng chứng mang tên trẻ bị chặn (Điều 13)', r.nopTen.code === 'DULIEUNGUOI', JSON.stringify(r.nopTen));
kiem('nhà khác không nộp thay', r.nopNhaKhac.code === 'NOPERM');
kiem('nộp bằng chứng hợp lệ', r.nop.ok);
kiem('khách không tự nghiệm thu; coach không phụ trách không nghiệm thu', r.ntKhach.code === 'NOPERM' && r.ntCoach2.code === 'NOPERM');
kiem('nghiệm thu đạt ghi credit nghiệp vụ 10·cấp (cấp 2 = 20)', r.nt.ok && r.nt.credit === 20);
kiem('đạt rồi không nghiệm thu lại, credit chỉ một lần', r.ntLai.code === 'DADAT' && r.soCrDong === 1 && r.soCr.tong === 20, r.soCrDong + ' dòng · ' + r.soCr.tong);
kiem('cấp 2 đạt thì mở được cấp 3', r.cap3SauDat.ok, JSON.stringify(r.cap3SauDat));
kiem('sổ credit nói rõ không phải tiền', /không phải tiền/.test(r.soCr.luu));
kiem('nhiệm vụ nội bộ chỉ R01–R05 giao; nhân sự không tự nghiệm thu phiếu của mình',
  r.giaoNS.ok && r.giaoNSCoach.code === 'NOPERM' && r.nopNS.ok && r.tuNT.code === 'TUNGHIEMTHU', JSON.stringify([r.giaoNS.code, r.giaoNSCoach.code, r.tuNT.code]));
kiem('chỉ Super Admin nạp cẩm nang', r.napCN.ok && r.napCNR04.code === 'NOPERM');
kiem('cấp 3 nằm trong kho Coach: Coach đọc được, Tư vấn không', r.cn3C1.ok && r.cn3C1.noiDung.chuoi5 && r.cn3Tv.code === 'NOPERM');
kiem('cấp 2 dành cho Tư vấn; quản trị kỹ thuật không đọc', r.cn2Tv.ok && r.cn2Tv.noiDung.kichBanBuoi && r.cn2Adm.code === 'NOPERM');
kiem('khách không đọc thẳng cẩm nang, kể cả cấp 1 và mục lục', r.cn1Khach.code === 'NOPERM' && r.dsCNKhach.code === 'NOPERM');
kiem('chỉ người phụ trách trao cẩm nang cấp 1 cho nhà', r.giaoCNKhac.code === 'NOPERM_NHA' && r.giaoCN.ok);
kiem('nhà đọc cẩm nang cấp 1 đã được trao — và chỉ cấp 1', r.cnK3.ok && r.cnK3.ds.length === 1 && r.cnK3.ds[0].cap1 && !r.cnK3.ds[0].cap2 && !r.cnK3.ds[0].cap3 && r.cnK4.ds.length === 0);

/* ── tĩnh ── */
const wk = fs.readFileSync(ROOT + '/may-chu/worker.js', 'utf8');
const canPhien = (wk.match(/const CAN_PHIEN = \[([\s\S]*?)\];/) || [])[1] || '';
const CUA = ['napKhoNhiemVu', 'ganNhiemVu', 'dsKhoNhiemVu', 'docNhiemVu', 'giaoPhieuNhiemVu', 'phieuCuaToi', 'nopNhiemVu', 'nghiemThuNhiemVu', 'soCreditNhiemVu', 'napCamNang', 'dsCamNang', 'docCamNang', 'giaoCamNang', 'camNangCuaNha'];
kiem('mười bốn cửa có trong CAN_PHIEN và có đường gọi', CUA.every(f => canPhien.includes("'" + f + "'") && wk.includes("fn === '" + f + "'")), CUA.filter(f => !wk.includes("fn === '" + f + "'")).join(','));
kiem('nguồn nội dung không nằm trong kho mã ở dạng chữ trần', !fs.existsSync(ROOT + '/kho-nha-nguon') && !fs.readdirSync(ROOT + '/tools').some(f => /^CN-|^NV-/.test(f)));

/* ── phá thử ── */
async function pha(ten, tu, sang, dieu) {
  const goc = fs.readFileSync(ROOT + '/may-chu/kho-nhiem-vu.js', 'utf8'), ban = goc.replace(tu, sang);
  if (ban === goc) { kiem('phá thử ' + ten + ': chuỗi phá có trong mã', false); return; }
  const tam = ROOT + '/may-chu/_pha-kho-nhiem-vu.js';
  try {
    fs.writeFileSync(tam, ban);
    const P = await import(pathToFileURL(tam).href + '?v=' + Date.now());
    kiem('phá thử ' + ten + ': phép đo đỏ đúng chỗ', await dieu(P));
  } finally { fs.rmSync(tam, { force: true }); }
}
await pha('bỏ trần trải nghiệm 5', 'export const TRAN_TRAI_NGHIEM = 5;', 'export const TRAN_TRAI_NGHIEM = 50;', async P => (await chay(P)).t2Sau.ok === true);
await pha('bỏ cổng cấp trước', 'if (so > 1 && !(await datCapTruoc(', 'if (false && !(await datCapTruoc(', async P => (await chay(P)).cap3Som.ok === true);
await pha('phiếu trả cả cột Coach hỗ trợ', 'nangLuc: x.nangLuc,', 'nangLuc: x.nangLuc, hoTro: x.hoTro,', async P => { const q = await chay(P); const p = q.phK3.ds.find(z => z.id === q.cap2PL.id); return JSON.stringify(p.phieu).includes('HO_TRO_COACH_NOI_BO'); });
await pha('mở cấp 3 cho Tư vấn', '3: lv => lv === 1 || (lv >= 4 && lv <= 7)', '3: lv => lv === 1 || (lv >= 4 && lv <= 11)', async P => (await chay(P)).cn3Tv.ok === true);
await pha('bỏ cổng Điều 13 ở bằng chứng', 'if (!s.sach) return { ok: false, code: \'DULIEUNGUOI\', error: \'Bằng chứng', 'if (false) return { ok: false, code: \'DULIEUNGUOI\', error: \'Bằng chứng', async P => (await chay(P)).nopTen.ok === true);

console.log('\n' + dat + ' đạt · ' + truot + ' sai');
process.exit(truot ? 1 : 0);
