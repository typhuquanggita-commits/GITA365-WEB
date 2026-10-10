/* Thử lịch trả lương 05/08 · phiếu phản hồi từng khách · xếp hạng lương thưởng
   tháng (may-chu/xep-hang-luong.js). D1 giả = node:sqlite.
   Dùng: node tools/thu-xep-hang.mjs   (Node >= 22.5) */
import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import { pathToFileURL, fileURLToPath } from 'node:url';
const ROOT = process.argv[2] || fileURLToPath(new URL('..', import.meta.url)).replace(/[\\/]$/, '');
globalThis.fetch = async () => { throw new Error('không gọi mạng ngoài'); };
let dat = 0, truot = 0;
const kiem = (ten, dk, ct) => { if (dk) { dat++; console.log('OK  ' + ten); } else { truot++; const d = 'SAI ' + ten + (ct ? ' — ' + ct : ''); console.log(d);
  if (process.env.GITHUB_ACTIONS) console.log('::error title=thu-xep-hang::' + d.replace(/[\r\n%]/g, ' ').slice(0, 900)); } };

const BAI = 'Tôi tách điều đã thấy với điều đang đoán. Đã thấy: con bắt đầu muộn bốn trên bảy tối, các tối có bố ở nhà con bắt đầu sớm hơn. Giả thuyết một là nhịp đón con muộn kéo lùi giờ học; phản bác là tối đón sớm mà con vẫn muộn. Phần vượt quyền tôi xin ý kiến Trưởng nhóm.';

async function dung(XH, DL, T) {
  const sq = new DatabaseSync(':memory:');
  sq.exec(fs.readFileSync(ROOT + '/may-chu/csdl.sql', 'utf8'));
  const db = { prepare(sql) { let a = []; const st = { bind(...x) { a = x; return st; },
      first() { return Promise.resolve(sq.prepare(sql).get(...a) || null); }, all() { return Promise.resolve({ results: sq.prepare(sql).all(...a) }); },
      run() { const r = sq.prepare(sql).run(...a); return Promise.resolve({ meta: { changes: Number(r.changes) } }); } }; return st; },
    async batch(ds) { sq.exec('BEGIN'); try { for (const s of ds) await s.run(); sq.exec('COMMIT'); } catch (e) { sq.exec('ROLLBACK'); throw e; } } };
  const NG = [['U1', 'chu', 'R01'], ['U4', 'chuyenmon', 'R04'], ['U5', 'truongcoach', 'R05'], ['U7', 'coach1', 'R07'], ['U8', 'coach2', 'R07'], ['U11', 'tuvan1', 'R11']];
  for (const [id, u, r] of NG) sq.prepare('INSERT INTO users (id, username, email, role, active) VALUES (?,?,?,?,1)').run(id, u, u + '@gita.vn', r);
  /* năm nhà: K1–K3 của coach1 (K1 có tư vấn tuvan1), K4–K5 của coach2 */
  for (let i = 1; i <= 5; i++) {
    sq.prepare("INSERT INTO users (id, username, role, active, maKhachHang) VALUES (?,?,'R13',1,?)").run('P' + i, 'ph' + i, 'K' + i);
    sq.prepare('INSERT INTO hoSoKhach (maKhachHang, uidPhuHuynh, tang, coach, tuVan) VALUES (?,?,2,?,?)').run('K' + i, 'P' + i, i <= 3 ? 'coach1' : 'coach2', i === 1 ? 'tuvan1' : null);
  }
  return { sq, db };
}
const ho = (u, role, uid, mk) => ({ u, role, uid, maKhachHang: mk });
const chu = ho('chu', 'R01', 'U1'), r04 = ho('chuyenmon', 'R04', 'U4'), r05 = ho('truongcoach', 'R05', 'U5'),
  c1 = ho('coach1', 'R07', 'U7'), c2 = ho('coach2', 'R07', 'U8'), tv1 = ho('tuvan1', 'R11', 'U11');
const ph = i => ho('ph' + i, 'R13', 'P' + i, 'K' + i);

async function chay(XH, DL, T) {
  const { sq, db } = await dung();
  const env = { THI_MO_MOI_NGAY: '1' }, r = {};
  /* lịch trả lương */
  r.lich = await XH.lichTraLuong({ nam: 2026 }, env, db, c1);
  r.lichKhach = await XH.lichTraLuong({ nam: 2026 }, env, db, ph(1));
  r.khaiR04 = await XH.khaiNgayNghi({ ngay: '2027-02-05', ten: 'Mùng 9 Tết' }, env, db, r04);
  r.khai = await XH.khaiNgayNghi({ ngay: '2027-02-05', ten: 'Nghỉ Tết Nguyên đán' }, env, db, chu);
  r.lich27 = await XH.lichTraLuong({ nam: 2027 }, env, db, c1);
  r.go = await XH.khaiNgayNghi({ ngay: '2026-07-05', ten: 'Làm bù thứ Bảy', nghi: false }, env, db, chu);
  r.lich26b = await XH.lichTraLuong({ nam: 2026 }, env, db, c1);
  /* thứ Bảy · Chủ nhật nghỉ (10/10): khai 05/08/2026 (thứ Tư) là nghỉ thì 08/08 rơi
     thứ Bảy → dời tiếp sang thứ Hai 10/08, và từng nhân sự nhận thông báo đích danh */
  r.khaiT8 = await XH.khaiNgayNghi({ ngay: '2026-08-05', ten: 'Nghỉ thử giữa tuần' }, env, db, chu);
  r.baoLai = await XH.baoNgayTraLuong(db, '2026-07');
  r.tbCoach1 = sq.prepare("SELECT * FROM thongBao WHERE denAi = 'coach1' AND doiTuong = 'traLuong:2026-07:2026-08-10'").all();
  r.tbKhach = sq.prepare("SELECT COUNT(*) n FROM thongBao WHERE denAi = 'ph1'").get().n;
  r.hopC1 = await NH.hopThongBao({}, env, db, c1);
  r.sapToi = await XH.baoLichTraLuongSapToi(db, Date.parse('2026-12-03T03:00:00Z'));
  /* phiếu phản hồi */
  r.thieuTc = await DL.guiDanhGiaKH({ nps: 9, csat: 5 }, env, db, ph(1));
  r.nhanVien = await DL.guiDanhGiaKH({ nps: 9, csat: 5, tieuChi: [5, 5, 5, 5, 5] }, env, db, c1);
  const diem = [[10, 5, [5, 5, 5, 5, 5]], [9, 5, [5, 5, 4, 5, 5]], [8, 4, [4, 4, 4, 4, 5]], [3, 2, [2, 2, 2, 2, 2]], [2, 2, [2, 1, 2, 2, 2]]];
  r.gui = [];
  for (let i = 1; i <= 5; i++) r.gui.push(await DL.guiDanhGiaKH({ nps: diem[i - 1][0], csat: diem[i - 1][1], tieuChi: diem[i - 1][2] }, env, db, ph(i)));
  r.chup = sq.prepare("SELECT coach, tuVan FROM danhGiaKH WHERE maNha = 'K1'").get();
  /* đổi người phụ trách SAU khi gửi: phiếu tháng này vẫn thuộc coach1 */
  sq.prepare("UPDATE hoSoKhach SET coach = 'coach2' WHERE maKhachHang = 'K3'").run();
  /* thi ngày 28: coach1 đạt cấp 1 (cần kho) */
  const K = await import(pathToFileURL(ROOT + '/may-chu/kho-cao.js').href);
  const lo = []; for (let i = 1; i <= 30; i++) lo.push({ id: 'C4-A-' + String(i).padStart(3, '0'), hang: ['S1', 'S3', 'S5', 'VIP', 'VVIP', 'DIAMOND'][(i - 1) % 6], ten: 'Ca ' + i,
    van: 'Con khó bắt đầu buổi tối, cha mẹ nhắc nhiều lần.', phanTich: { hienTuong: 'a', boiCanh: 'b', nguyenNhan: ['a', 'b'], tacDong: 'a', donBay: 'a' },
    phacDo: ['a', 'b', 'c'], t2080: { lam: ['a'], gac: 'a' }, kyNang: ['a: a', 'b: b', 'c: c'], buoc: ['Ngày 1: a', 'Ngày 2: b'], luuY: ['a', 'b', 'c'],
    thamVan: { khi: 'a', ai: 'b' }, phuongAn: [{ ten: 'A', khi: 'a', cach: 'a' }, { ten: 'B', khi: 'b', cach: 'b' }, { ten: 'C', khi: 'c', cach: 'c' }],
    ketQua: 'a', doBang: ['a', 'b'], baiHoc: 'a', goi: { phamVi: 'a', caNhanHoa: 'a', theoDoi: '7 ngày', dieuKien: 'a' } });
  await K.napKhoCao({ ds: lo, ban: 'THU' }, env, db, chu);
  const b = await T.batDauThi({ he: 'coach' }, env, db, c1);
  const de = JSON.parse(sq.prepare('SELECT de FROM thiLuot WHERE id = ?').get(b.luot).de);
  await T.nopBaiThi({ luot: b.luot, baiLam: de.map(() => BAI) }, env, db, c1);
  await T.chamBaiThi({ luot: b.luot, chiTiet: de.map(() => [22, 22, 22, 22]), ghiChu: 'Tách thấy với đoán rõ, có phản bác, biết xin ý kiến đúng chỗ.' }, env, db, r04);
  r.ky = T.thangCua(Date.now());
  /* thi nghiệp vụ: coach1 sát hạch CO08 qua ĐÚNG cửa chấm (người chấm R05 khác người
     học) → 85; coach2 chỉ có lần sát hạch 400 ngày trước → quá hạn 365, tính 0;
     tuvan1 chưa sát hạch → 0. Coach1 tự chấm mình thì cửa chặn. */
  const DT = await import(pathToFileURL(ROOT + '/may-chu/dao-tao-ct.js').href);
  const NX = 'Làm đúng trình tự sát hạch, tách thấy với đoán, xin ý kiến đúng chỗ.';
  await DT.ghiDanhDaoTao({ ct: 'coach', maNguoi: 'coach1' }, env, db, r05);
  r.tuChamNV = await DT.ghiBuocDaoTao({ ct: 'coach', buoc: 'CO08', maNguoi: 'coach1', diem: 100, ghiChu: NX }, env, db, c1);
  r.chamNV = await DT.ghiBuocDaoTao({ ct: 'coach', buoc: 'CO08', maNguoi: 'coach1', diem: 85, ghiChu: NX }, env, db, r05);
  sq.prepare("INSERT INTO dtBuoc (id, maNguoi, ct, buoc, loai, boiAi, diem, ghiChu, ghiLuc) VALUES ('cu1','coach2','coach','CO08','nguoiCham','truongcoach',95,?,?)")
    .run(NX, new Date(Date.now() - 400 * 86400000).toISOString());
  r.xhQL = await XH.xepHangThang({ ky: r.ky }, env, db, r05);
  r.xhC1 = await XH.xepHangThang({ ky: r.ky }, env, db, c1);
  r.xhKhach = await XH.xepHangThang({ ky: r.ky }, env, db, ph(1));
  return r;
}

const XH = await import(pathToFileURL(ROOT + '/may-chu/xep-hang-luong.js').href);
const DL = await import(pathToFileURL(ROOT + '/may-chu/do-luong-kh.js').href);
const T = await import(pathToFileURL(ROOT + '/may-chu/thi-cap.js').href);
const NH = await import(pathToFileURL(ROOT + '/may-chu/ngan-hang.js').href);
const r = await chay(XH, DL, T);

/* ── lịch trả lương ── */
kiem('lương tháng 9/2026 trả 05/10 (thứ Hai, ngày làm việc)', XH.ngayTraLuong('2026-09', {}).ngay === '2026-10-05');
kiem('05 trùng Chủ nhật thì trả 08: lương 6/2026 trả 08/07', XH.ngayTraLuong('2026-06', {}).ngay === '2026-07-08' && XH.ngayTraLuong('2026-06', {}).doi);
kiem('lương tháng 12 trả sang năm sau: 05/01/2027', XH.ngayTraLuong('2026-12', {}).ngay === '2027-01-05');
kiem('lịch cả năm 12 kỳ cho nhân sự; khách hàng không xem được', r.lich.ok && r.lich.lich.length === 12 && r.lichKhach.code === 'NOPERM');
kiem('chỉ Super Admin khai ngày nghỉ', r.khaiR04.code === 'NOPERM' && r.khai.ok);
kiem('khai Tết rơi vào ngày 05 thì lương tháng 1/2027 trả 08/02', r.lich27.lich[0].ngay === '2027-02-08', JSON.stringify(r.lich27.lich[0]));
kiem('gỡ một Chủ nhật (làm bù) thì ngày 05 ấy trả lương bình thường', r.lich26b.lich[5].ngay === '2026-07-05', JSON.stringify(r.lich26b.lich[5]));
kiem('05 trùng thứ Bảy thì trả 08: lương 11/2026 trả 08/12 (05/12 là thứ Bảy)', XH.ngayTraLuong('2026-11', {}).ngay === '2026-12-08', JSON.stringify(XH.ngayTraLuong('2026-11', {})));
kiem('05 nghỉ và 08 cũng nghỉ (thứ Bảy) thì dời tiếp sang thứ Hai 10/08', XH.ngayTraLuong('2026-07', { '2026-08-05': 1 }).ngay === '2026-08-10', JSON.stringify(XH.ngayTraLuong('2026-07', { '2026-08-05': 1 })));
kiem('lý do dời nói rõ cả hai ngày nghỉ', /2026-08-05[\s\S]*2026-08-08 là thứ Bảy/.test(XH.ngayTraLuong('2026-07', { '2026-08-05': 1 }).lyDo || ''));
kiem('khai một thứ Bảy là ngày LÀM (làm bù) thì ngày ấy trả lương được', XH.ngayTraLuong('2026-11', { '2026-12-05': 0 }).ngay === '2026-12-05');
kiem('khai ngày nghỉ làm dời ngày trả thì báo NGAY cho đủ 6 nhân sự (không chờ lượt đêm)', r.khaiT8.ok && r.khaiT8.bao && r.khaiT8.bao.gui === 6, JSON.stringify(r.khaiT8.bao));
kiem('thông báo ĐÍCH DANH từng người, ghi ngày trả mới và lý do', r.tbCoach1.length === 1 && /10\/08\/2026/.test(r.tbCoach1[0].tieuDe) && /thứ Bảy/.test(r.tbCoach1[0].than), JSON.stringify(r.tbCoach1));
kiem('chạy lại không gửi trùng', r.baoLai.gui === 0, JSON.stringify(r.baoLai));
kiem('khách hàng không nhận thông báo lương', r.tbKhach === 0);
kiem('Coach đọc được thông báo trong hộp của mình', r.hopC1.ok && r.hopC1.ds.some(x => x.loai === 'traLuong'), JSON.stringify(r.hopC1.ds.map(x => x.tieuDe)));
kiem('lượt đêm báo trước kỳ sắp trả: đầu 12/2026 báo lương 11 (dời sang 08/12), kỳ 12 trả 05/01 thì không báo',
  r.sapToi[0].ky === '2026-11' && r.sapToi[0].gui === 6 && r.sapToi[1].doi === false, JSON.stringify(r.sapToi));
kiem('bảng lương trả kèm ngày trả lương (luong.js)', /ngayTra = ngayTraLuong\(ky/.test(fs.readFileSync(ROOT + '/may-chu/luong.js', 'utf8')));

/* ── phiếu phản hồi ── */
kiem('phiếu tháng bắt buộc đủ năm tiêu chí', r.thieuTc.code === 'THIEUTIEUCHI');
kiem('nhân sự không gửi phiếu thay gia đình', r.nhanVien.code === 'NOPERM');
kiem('năm nhà gửi được phiếu đủ tiêu chí', r.gui.every(x => x.ok), JSON.stringify(r.gui));
kiem('phiếu chụp người phụ trách LÚC GỬI (coach + tư vấn)', r.chup.coach === 'coach1' && r.chup.tuVan === 'tuvan1');
kiem('điểm một phiếu: tối đa 100, tối thiểu 0, phiếu cũ không tiêu chí vẫn chấm được',
  XH.diemPhieu({ nps: 10, csat: 5, tieuChi: '[5,5,5,5,5]' }) === 100 && XH.diemPhieu({ nps: 0, csat: 1, tieuChi: '[1,1,1,1,1]' }) === 0 && XH.diemPhieu({ nps: 7, csat: 4 }) > 0);

/* ── xếp hạng ── */
const dong = (x, n) => x.ds.find(d => d.maNguoi === n);
const q1 = dong(r.xhQL, 'coach1'), q2 = dong(r.xhQL, 'coach2'), qt = dong(r.xhQL, 'tuvan1');
kiem('quản lý thấy cả đội (Coach + Tư vấn viên); khách hàng không xem được', r.xhQL.ok && q1 && q2 && qt && r.xhKhach.code === 'NOPERM');
kiem('Coach chỉ thấy dòng của chính mình', r.xhC1.ok && r.xhC1.chiDongCuaToi && r.xhC1.ds.length === 1 && r.xhC1.ds[0].maNguoi === 'coach1');
kiem('phiếu đi theo người làm tháng ấy: K3 đổi Coach sau khi gửi vẫn tính cho coach1 (3 nhà)', q1.soNhaPhanHoi === 3, String(q1.soNhaPhanHoi));
kiem('dưới 3 nhà có phiếu thì phản hồi "chưa đủ mẫu" (null), không đọc ra 0; trọng số bỏ được ghi ra',
  q2.thanhPhan.find(t => t.ma === 'phanHoi').giaTri === null && q2.trongBoQua === XH.TRONG_SO.phanHoi, JSON.stringify(q2.thanhPhan));
kiem('điểm thi ngày 28 vào xếp hạng: coach1 có bài đạt 88; coach2 không dự thi = 0',
  q1.thanhPhan.find(t => t.ma === 'thi').giaTri === 88 && q2.thanhPhan.find(t => t.ma === 'thi').giaTri === 0 && /không dự thi/.test(q2.thanhPhan.find(t => t.ma === 'thi').ghiChu));
kiem('hạng tính đúng ngưỡng A/B/C/D từ điểm tổng', r.xhQL.ds.every(d => d.hang === (d.diem >= 90 ? 'A' : d.diem >= 80 ? 'B' : d.diem >= 65 ? 'C' : 'D')));
kiem('coach1 (thi tốt + phản hồi tốt) xếp trên coach2', r.xhQL.ds.indexOf(q1) < r.xhQL.ds.indexOf(q2));
/* thưởng: KPI ≥ 90 VÀ ≥ 90% nhà hài lòng — hai điều kiện, không bù trừ */
const P4 = (n, hl) => ({ soNha: n, soNhaHaiLong: hl, tyLeHaiLong: n >= XH.MAU_TOI_THIEU ? Math.round(100 * hl / n) : null });
kiem('ngưỡng thưởng là 90 KPI và 90% hài lòng', XH.NGUONG_THUONG.kpi === 90 && XH.NGUONG_THUONG.haiLong === 90);
kiem('trọng số KPI chốt 10/10: thi 30 · cấp 30 · khối 40 = hài lòng 30 + thi nghiệp vụ 10; cộng đủ 100',
  XH.TRONG_SO.thi === 30 && XH.TRONG_SO.cap === 30 && XH.TRONG_SO.phanHoi === 30 && XH.TRONG_SO.nghiepVu === 10 &&
  Object.values(XH.TRONG_SO).reduce((a, b) => a + b, 0) === 100, JSON.stringify(XH.TRONG_SO));
const nv = d => d.thanhPhan.find(t => t.ma === 'nghiepVu');
kiem('thi nghiệp vụ đọc lần sát hạch do NGƯỜI CHẤM ghi: coach1 = 85, kèm tên người chấm', r.chamNV.ok && nv(q1).giaTri === 85 && /truongcoach/.test(nv(q1).ghiChu), JSON.stringify(nv(q1)));
kiem('người học tự chấm sát hạch của mình thì cửa chặn (điểm 100 tự gõ không vào KPI)', r.tuChamNV.code === 'TUCHAM' && nv(q1).giaTri !== 100);
kiem('sát hạch quá 365 ngày tính 0 và nói ra (coach2)', nv(q2).giaTri === 0 && /quá 365 ngày/.test(nv(q2).ghiChu), JSON.stringify(nv(q2)));
kiem('chưa sát hạch tính 0, KHÔNG bỏ trọng số (tuvan1 dùng bước TV08)', nv(qt).giaTri === 0 && /chưa sát hạch nghiệp vụ \(TV08\)/.test(nv(qt).ghiChu) && qt.trongBoQua === XH.TRONG_SO.phanHoi, JSON.stringify(nv(qt)) + ' bỏ ' + qt.trongBoQua + ' (chỉ được bỏ phần hài lòng thiếu mẫu)');
const CTdt = (await import(pathToFileURL(ROOT + '/may-chu/dao-tao-ct.js').href)).CT;
kiem('bước sát hạch của KPI khớp chương trình đào tạo (đúng bước, đúng loại nguoiCham, đúng màn sat-hach)',
  Object.values(XH.BUOC_NGHIEP_VU).every(b => { const c = CTdt.find(x => x.ma === b.ct); const s = c && c.buoc.find(x => x.ma === b.buoc); return s && s.loai === 'nguoiCham' && s.man === 'sat-hach'; }));
kiem('phần hài lòng là TỶ LỆ nhà hài lòng (coach1: 3/3 nhà hài lòng → 100)', q1.thanhPhan.find(t => t.ma === 'phanHoi').giaTri === 100, JSON.stringify(q1.thanhPhan.find(t => t.ma === 'phanHoi')));
kiem('mức thưởng 3–5% lương theo bậc KPI: 90→3 · 94→4 · 97→5 · 89→0', XH.ptThuong(90) === 3 && XH.ptThuong(93) === 3 && XH.ptThuong(94) === 4 && XH.ptThuong(97) === 5 && XH.ptThuong(100) === 5 && XH.ptThuong(89) === 0);
kiem('đạt thưởng thì trả kèm phần trăm lương; chưa đạt thì 0', XH.xetThuong(95, P4(4, 4)).ptLuong === 4 && XH.xetThuong(95, P4(4, 3)).ptLuong === 0);
kiem('KPI 92 và 100% hài lòng: đủ điều kiện thưởng', XH.xetThuong(92, P4(4, 4)).trangThai === 'dat');
kiem('KPI 95 nhưng hài lòng 75%: chưa đạt, nói rõ phần thiếu', XH.xetThuong(95, P4(4, 3)).trangThai === 'khongDat' && /hài lòng 75%/.test(XH.xetThuong(95, P4(4, 3)).lyDo));
kiem('hài lòng 100% nhưng KPI 89: chưa đạt', XH.xetThuong(89, P4(5, 5)).trangThai === 'khongDat' && /KPI 89/.test(XH.xetThuong(89, P4(5, 5)).lyDo));
kiem('KPI đủ mà chưa đủ 3 nhà có phiếu: CHƯA XÉT, không đọc ra đạt hay không đạt', XH.xetThuong(95, P4(2, 2)).trangThai === 'chuaXet');
kiem('đúng ngưỡng (90 và 90%) là đạt', XH.xetThuong(90, P4(10, 9)).trangThai === 'dat');
kiem('coach1: ba nhà đều hài lòng (CSAT ≥ 4) nên 100%; xếp hạng trả kèm xét thưởng', q1.thuong && q1.thuong.tyLeHaiLong === 100 && q1.thuong.trangThai === (q1.diem >= 90 ? 'dat' : 'khongDat'), JSON.stringify(q1.thuong) + ' KPI ' + q1.diem);
kiem('coach2 dưới 3 nhà có phiếu thì tỷ lệ hài lòng là null', q2.thuong && q2.thuong.tyLeHaiLong === null);
kiem('xếp hạng trả kèm ngày trả lương của kỳ', r.xhQL.ngayTra && /^\d{4}-\d{2}-0[58]$/.test(r.xhQL.ngayTra.ngay));

/* ── tĩnh ── */
const wk = fs.readFileSync(ROOT + '/may-chu/worker.js', 'utf8');
const canPhien = (wk.match(/const CAN_PHIEN = \[([\s\S]*?)\];/) || [])[1] || '';
kiem('ba cửa có trong CAN_PHIEN và có đường gọi', ['lichTraLuong', 'khaiNgayNghi', 'xepHangThang'].every(f => canPhien.includes("'" + f + "'") && wk.includes("fn === '" + f + "'")));
const sql = fs.readFileSync(ROOT + '/may-chu/csdl.sql', 'utf8');
kiem('danhGiaKH có tieuChi · coach · tuVan; bảng ngayNghi có trong csdl.sql', /danhGiaKH \([\s\S]*?tieuChi TEXT, coach TEXT, tuVan TEXT/.test(sql) && sql.includes('CREATE TABLE IF NOT EXISTS ngayNghi ('));
kiem('lượt đêm của Worker gọi baoLichTraLuongSapToi', /baoLichTraLuongSapToi\(env\.CSDL\)/.test(wk));
kiem('máy không tự đổi hạng ra tiền (không có cửa tính tiền thưởng)', !/export async function (tinhThuong|tinhTien|traThuong)/.test(fs.readFileSync(ROOT + '/may-chu/xep-hang-luong.js', 'utf8')));

/* ── màn hình ── */
const hst = fs.readFileSync(ROOT + '/src/ho-so-thang.js', 'utf8');
const banKhach = [...hst.matchAll(/\{ ma:'(T\d)', ten:'([^']+)' \}/g)].map(m => m[1] + '|' + m[2]);
kiem('năm tiêu chí ở phiếu gia đình khớp từng ô với máy chủ (TIEU_CHI)', JSON.stringify(banKhach) === JSON.stringify(XH.TIEU_CHI.map(t => t.ma + '|' + t.ten)), JSON.stringify(banKhach));
kiem('phiếu gia đình gửi kèm tieuChi', /guiDanhGiaKH', \{ nps:st\.nps, csat:st\.csat, tieuChi:/.test(hst));
const tcc = fs.readFileSync(ROOT + '/src/thi-chung-chi.js', 'utf8');
kiem('màn Thi chứng chỉ có ngăn xếp hạng gọi xepHangThang · lichTraLuong · khaiNgayNghi', ['xepHangThang', 'lichTraLuong', 'khaiNgayNghi'].every(f => tcc.includes("'" + f + "'")));
const v3 = fs.readFileSync(ROOT + '/src/views3.js', 'utf8'), htb = fs.readFileSync(ROOT + '/src/hop-thong-bao.js', 'utf8');
const khoiDeck = ten => { const a = v3.indexOf("G.VIEWS['" + ten + "']"); return a < 0 ? '' : v3.slice(a, v3.indexOf('G.VIEWS[', a + 10)); };
kiem('hộp thông báo hiện ở màn chính của Coach và Tư vấn', /G\.htbKhoi\(\)/.test(khoiDeck('coach-deck')) && /G\.htbKhoi\(\)/.test(khoiDeck('tuvan-deck')));
kiem('hộp thông báo có nhãn "Lịch trả lương" và vẽ lại ở cả ba màn', /traLuong:'Lịch trả lương'/.test(htb) && /'coach-deck':1/.test(htb) && /'tuvan-deck':1/.test(htb));
kiem('ngăn xếp hạng có cột Thưởng', /<th>Thưởng<\/th>/.test(tcc));
kiem('ngăn xếp hạng có cột Nghiệp vụ và nói trọng số thi nghiệp vụ', /<th>Nghiệp vụ<\/th>/.test(tcc) && /L\.trongSo\.nghiepVu/.test(tcc));
kiem('bảng lương hiện ngày trả lương', /d\.ngayTra/.test(fs.readFileSync(ROOT + '/src/phong-tai-chinh.js', 'utf8')));

/* ── phá thử ── */
async function pha(ten, tep, tu, sang, dieu) { // dieu(rp, P)
  const goc = fs.readFileSync(ROOT + '/may-chu/' + tep, 'utf8'), ban = goc.replace(tu, sang);
  if (ban === goc) { kiem('phá thử ' + ten + ': chuỗi phá có trong mã', false); return; }
  const tam = ROOT + '/may-chu/_pha-' + tep;
  try {
    fs.writeFileSync(tam, ban);
    const P = await import(pathToFileURL(tam).href + '?v=' + Date.now());
    const rp = tep === 'xep-hang-luong.js' ? await chay(P, DL, T) : await chay(XH, P, T);
    kiem('phá thử ' + ten + ': phép đo đỏ đúng chỗ', dieu(rp, P));
  } finally { fs.rmSync(tam, { force: true }); }
}
await pha('bỏ ngưỡng mẫu tối thiểu', 'xep-hang-luong.js', 'export const MAU_TOI_THIEU = 3;', 'export const MAU_TOI_THIEU = 1;',
  rp => rp.xhQL.ds.find(d => d.maNguoi === 'coach2').thanhPhan.find(t => t.ma === 'phanHoi').giaTri !== null);
await pha('không chụp người phụ trách lúc gửi', 'do-luong-kh.js', "String((ps && ps.coach) || '').toLowerCase() || null", 'null',
  rp => rp.xhQL.ds.find(d => d.maNguoi === 'coach1').soNhaPhanHoi !== 3);

await pha('quên thứ Bảy', 'xep-hang-luong.js', 'export const THU_NGHI = Object.freeze([0, 6]);', 'export const THU_NGHI = Object.freeze([0]);',
  (rp, P) => P.ngayTraLuong('2026-11', {}).ngay !== '2026-12-08');
await pha('08 nghỉ mà không dời tiếp', 'xep-hang-luong.js', 'for (let i = 0; i < 20 && laNgayNghi(ngay, khai); i++)', 'for (let i = 0; i < 0; i++)',
  (rp, P) => P.ngayTraLuong('2026-07', { '2026-08-05': 1 }).ngay !== '2026-08-10');
await pha('gửi trùng thông báo', 'xep-hang-luong.js', '    if (co) continue;\n', '',
  rp => rp.baoLai.gui !== 0);
await pha('thưởng vượt trần 5%', 'xep-hang-luong.js', '{ tu: 97, pt: 5 }', '{ tu: 97, pt: 8 }',
  (rp, P) => P.ptThuong(99) !== 5);
await pha('bỏ hạn 365 ngày', 'xep-hang-luong.js', 'if (tuoi > HAN_NGHIEP_VU_NGAY)', 'if (false)',
  rp => rp.xhQL.ds.find(d => d.maNguoi === 'coach2').thanhPhan.find(t => t.ma === 'nghiepVu').giaTri !== 0);
await pha('chưa sát hạch thì bỏ trọng số thay vì 0', 'xep-hang-luong.js', "if (!d) return { diem: 0,", "if (!d) return { diem: null,",
  rp => rp.xhQL.ds.find(d => d.maNguoi === 'tuvan1').trongBoQua !== 30);
await pha('bỏ điều kiện hài lòng', 'xep-hang-luong.js', 'if (ph.tyLeHaiLong < NGUONG_THUONG.haiLong)', 'if (false)',
  (rp, P) => P.xetThuong(95, { soNha: 4, soNhaHaiLong: 3, tyLeHaiLong: 75 }).trangThai === 'dat');

console.log('\n' + dat + ' đạt · ' + truot + ' sai');
process.exit(truot ? 1 : 0);
