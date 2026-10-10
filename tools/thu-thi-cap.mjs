/* Thử hệ thi chứng chỉ theo cấp (Tư vấn 50 · Coach 100) — D1 giả = node:sqlite.
   Chứng minh:
     · khung đủ 50/100 cấp, độ khó tăng theo cấp, đề ghép lúc chạy, mỗi người một đề
     · thi đúng vai; tối đa 2 lần/tháng; không thi khi kho chưa nạp
     · chấm: không tự chấm, đúng vai/cấp, chấm mù, cấp cao cần hai người chấm, lỗi trượt
     · cấp tính lúc đọc: đạt → lên; hết tháng không đạt → tụt một cấp; vi phạm → hạ, Super Admin huỷ được
     · cổng kho (khi bật): vượt cấp khoá, VVIP/Diamond bắt buộc xin ý kiến; duyệt/chuyển người
     · máy báo bài chép lời giải kho; máy không tự cấm, chỉ đề nghị lên Giám đốc + Super Admin
     · PHÁ THỬ: gỡ cổng tự chấm, gỡ luật tụt cấp → phép đo phải đỏ
   Dùng: node tools/thu-thi-cap.mjs   (Node >= 22.5) */
import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import { pathToFileURL, fileURLToPath } from 'node:url';
const ROOT = process.argv[2] || fileURLToPath(new URL('..', import.meta.url)).replace(/[\\/]$/, '');
globalThis.fetch = async () => { throw new Error('không gọi mạng ngoài'); };
let dat = 0, truot = 0;
/* Trên GitHub Actions, dòng SAI in thêm thành chú thích (::error::) — log của
   job nằm ở máy chủ khác, còn chú thích đọc được qua API ngay trên PR. */
const kiem = (ten, dk, ct) => { if (dk) { dat++; console.log('OK  ' + ten); } else { truot++; const d = 'SAI ' + ten + (ct ? ' — ' + ct : ''); console.log(d);
  if (process.env.GITHUB_ACTIONS) console.log('::error title=thu-thi-cap::' + d.replace(/[\r\n%]/g, ' ').slice(0, 900)); } };

const HANG = ['S1', 'S3', 'S5', 'VIP', 'VVIP', 'DIAMOND'];
const LOI_GIAI = 'Quan sát bảy tối liền, ghi giờ bắt đầu và người có mặt, không nhắc con trong lúc ghi, đọc lại cùng nhau cuối tuần để tìm mô thức lặp lại';
function banGhi(id, hang) {
  return { id, hang, ten: 'Vấn đề thử ' + id, van: 'Con khó bắt đầu buổi tối, cha mẹ nhắc nhiều lần trong tuần.',
    phanTich: { hienTuong: 'Khó bắt đầu.', boiCanh: 'Nhà mới vào tầng một, bố mẹ đi làm muộn.', nguyenNhan: ['Giả thuyết một', 'Giả thuyết hai'], tacDong: 'Căng thẳng buổi tối.', donBay: 'Ghi đúng điều thấy.' },
    phacDo: [LOI_GIAI, 'Không kết luận vội', 'Một người giữ phiếu'], t2080: { lam: ['Ghi đủ bảy tối'], gac: 'Gác sửa hành vi.' },
    kyNang: ['Hỏi mở: hỏi điều gì khó', 'Ghi hành vi: ghi điều thấy', 'Đọc mô thức: tìm điều lặp'], buoc: ['Vòng 1 (ngày 1–7): ghi', 'Ngày 8: đọc lại'],
    luuY: ['Không phạt', 'Không so sánh', 'Không dán nhãn'], thamVan: { khi: 'Dấu hiệu kéo dài', ai: 'Coach' },
    phuongAn: [{ ten: 'A', khi: 'a', cach: 'a' }, { ten: 'B', khi: 'b', cach: 'b' }, { ten: 'C', khi: 'c', cach: 'c' }],
    ketQua: 'Có bảng bảy tối.', doBang: ['Số tối có ghi', 'Số mô thức'], baiHoc: 'Thấy trước khi sửa.',
    goi: { phamVi: 'Hướng dẫn tự thực hiện', caNhanHoa: 'Theo hồ sơ', theoDoi: '7 ngày', dieuKien: 'Ghi đủ bảy tối' } };
}
const BAI = 'Tôi tách điều đã thấy với điều đang đoán. Đã thấy: con bắt đầu muộn bốn trên bảy tối, các tối có bố ở nhà con bắt đầu sớm hơn. Giả thuyết một là nhịp đón con muộn kéo lùi giờ học; dấu hiệu phản bác là tối đón sớm mà con vẫn muộn. Giả thuyết hai là nhắc nhiều làm con chờ được nhắc; phản bác là tối không ai nhắc con vẫn tự bắt đầu. Phần vượt quyền tôi xin ý kiến Trưởng nhóm trước khi nói với nhà.';

async function dung(M) {
  const sq = new DatabaseSync(':memory:');
  sq.exec(fs.readFileSync(ROOT + '/may-chu/csdl.sql', 'utf8'));
  const db = { prepare(sql) { let a = []; const st = { bind(...x) { a = x; return st; },
      first() { return Promise.resolve(sq.prepare(sql).get(...a) || null); }, all() { return Promise.resolve({ results: sq.prepare(sql).all(...a) }); },
      run() { const r = sq.prepare(sql).run(...a); return Promise.resolve({ meta: { changes: Number(r.changes) } }); } }; return st; },
    async batch(ds) { sq.exec('BEGIN'); try { for (const s of ds) await s.run(); sq.exec('COMMIT'); } catch (e) { sq.exec('ROLLBACK'); throw e; } } };
  const NG = [['U1', 'chu', 'R01'], ['U4', 'chuyenmon', 'R04'], ['U5', 'truongcoach', 'R05'], ['U7', 'coach1', 'R07'], ['U8', 'coach2', 'R07'],
    ['U11', 'tuvan1', 'R11'], ['U12', 'tuvan2', 'R11'], ['U13', 'ph1', 'R13']];
  for (const [id, u, r] of NG) sq.prepare('INSERT INTO users (id, username, email, role, active) VALUES (?,?,?,?,1)').run(id, u, u + '@gita.vn', r);
  sq.prepare("INSERT INTO hoSoKhach (maKhachHang, uidPhuHuynh, tang, coach, tuVan) VALUES ('K2','U13',2,'coach1','tuvan1')").run();
  return { sq, db };
}
const ho = (u, role, uid) => ({ u, role, uid });
const chu = ho('chu', 'R01', 'U1'), r04 = ho('chuyenmon', 'R04', 'U4'), r05 = ho('truongcoach', 'R05', 'U5'), c1 = ho('coach1', 'R07', 'U7'), c2 = ho('coach2', 'R07', 'U8'),
  tv1 = ho('tuvan1', 'R11', 'U11'), tv2 = ho('tuvan2', 'R11', 'U12'), ph = ho('ph1', 'R13', 'U13');

async function chay(T, K) {
  const { sq, db } = await dung();
  const env = {}, r = {};
  r.khung = await T.khungThi({}, env, db, tv1);
  r.khungKhach = await T.khungThi({}, env, db, ph);
  r.khongKho = await T.batDauThi({ he: 'tuvan' }, env, db, tv1);
  /* nạp kho: 60 vấn đề Tư vấn trải đủ sáu hạng */
  const lo = []; for (let i = 1; i <= 60; i++) lo.push(banGhi('V1-A-' + String(i).padStart(3, '0'), HANG[(i - 1) % 6]));
  r.nap = await K.napKhoCao({ ds: lo, ban: 'THU' }, env, db, chu);
  r.khach = await T.batDauThi({ he: 'tuvan' }, env, db, ph);
  r.saiHe = await T.batDauThi({ he: 'coach' }, env, db, tv1);
  r.bd = await T.batDauThi({ he: 'tuvan' }, env, db, tv1);
  r.bd2 = await T.batDauThi({ he: 'tuvan' }, env, db, tv1);
  r.de1 = await T.docBaiThi({ luot: r.bd.luot }, env, db, tv1);
  r.bdTv2 = await T.batDauThi({ he: 'tuvan' }, env, db, tv2);
  r.deTv2 = await T.docBaiThi({ luot: r.bdTv2.luot }, env, db, tv2);
  r.docLa = await T.docBaiThi({ luot: r.bd.luot }, env, db, tv2);
  r.nopNgan = await T.nopBaiThi({ luot: r.bd.luot, baiLam: ['ngắn', 'ngắn'] }, env, db, tv1);
  r.nopHo = await T.nopBaiThi({ luot: r.bd.luot, baiLam: [BAI, BAI] }, env, db, tv2);
  r.nop = await T.nopBaiThi({ luot: r.bd.luot, baiLam: [BAI, BAI + ' ' + LOI_GIAI + ' ' + LOI_GIAI] }, env, db, tv1);
  r.canhBao = JSON.parse(sq.prepare('SELECT canhBao FROM thiLuot WHERE id = ?').get(r.bd.luot).canhBao);
  r.tuCham = await T.chamBaiThi({ luot: r.bd.luot, chiTiet: [[25, 25, 25, 25], [25, 25, 25, 25]], ghiChu: 'Tự chấm thử, không được phép theo luật.' }, env, db, tv1);
  r.chamR11 = await T.chamBaiThi({ luot: r.bd.luot, chiTiet: [[25, 25, 25, 25], [25, 25, 25, 25]], ghiChu: 'Đồng nghiệp cùng cấp chấm thử bài này.' }, env, db, tv2);
  r.chamSai = await T.chamBaiThi({ luot: r.bd.luot, chiTiet: [[30, 25, 25, 25]], ghiChu: 'Thiếu ca và điểm quá trần cho phép.' }, env, db, r04);
  r.hang = await T.dsBaiCham({}, env, db, r04);
  r.chamThap = await T.chamBaiThi({ luot: r.bd.luot, chiTiet: [[10, 10, 10, 10], [10, 10, 10, 10]], ghiChu: 'Giả thuyết chưa có dấu hiệu phản bác, chưa xin ý kiến.' }, env, db, r04);
  r.capSauTruot = await T.capCua(db, 'tuvan1', 'tuvan');
  /* lần 2 trong tháng — đạt */
  r.bdLai = await T.batDauThi({ he: 'tuvan' }, env, db, tv1);
  const deLai = JSON.parse(sq.prepare('SELECT de FROM thiLuot WHERE id = ?').get(r.bdLai.luot).de);
  await T.nopBaiThi({ luot: r.bdLai.luot, baiLam: deLai.map(() => BAI) }, env, db, tv1);
  r.docTruocCham = await T.docBaiThi({ luot: r.bdLai.luot }, env, db, tv1);
  r.chamDat = await T.chamBaiThi({ luot: r.bdLai.luot, chiTiet: deLai.map(() => [20, 20, 20, 20]), ghiChu: 'Tách thấy và đoán rõ, có dấu hiệu phản bác, biết xin ý kiến.' }, env, db, r04);
  r.capSauDat = await T.capCua(db, 'tuvan1', 'tuvan');
  r.hetLan = await T.batDauThi({ he: 'tuvan' }, env, db, tv1);
  /* tụt cấp theo tháng: đẩy mốc nộp lùi 70 ngày */
  sq.prepare('UPDATE thiLuot SET nopLuc = nopLuc - ?, batDau = batDau - ?, hanLuc = hanLuc - ? WHERE maNguoi = ?').run(70 * 864e5, 70 * 864e5, 70 * 864e5, 'tuvan1');
  r.capTut = await T.capCua(db, 'tuvan1', 'tuvan');
  sq.prepare('UPDATE thiLuot SET nopLuc = nopLuc + ?, batDau = batDau + ?, hanLuc = hanLuc + ? WHERE maNguoi = ?').run(70 * 864e5, 70 * 864e5, 70 * 864e5, 'tuvan1');
  /* vi phạm */
  r.vpTu = await T.ghiViPham({ maNguoi: 'truongcoach', he: 'coach', loai: 'TU_Y_XU_LY', mucDo: 1, chungCu: 'Tự xử lý ca hạng Diamond không xin ý kiến ngày mười hai.' }, env, db, r05);
  r.vpNgang = await T.ghiViPham({ maNguoi: 'chuyenmon', he: 'tuvan', loai: 'TU_Y_XU_LY', mucDo: 1, chungCu: 'Ghi thử cho người bậc cao hơn mình, phải bị chặn.' }, env, db, r05);
  r.vpR11 = await T.ghiViPham({ maNguoi: 'tuvan2', he: 'tuvan', loai: 'GIAU_VAN_DE', mucDo: 1, chungCu: 'Ghi thử bởi người không phải quản lý, phải bị chặn.' }, env, db, tv1);
  r.vp = await T.ghiViPham({ maNguoi: 'tuvan1', he: 'tuvan', loai: 'GIAU_VAN_DE', mucDo: 1, chungCu: 'Không báo dấu hiệu bất thường của nhà K2 trong ba ngày liền.', deXuat: 'dinhChi' }, env, db, r05);
  r.capSauVp = await T.capCua(db, 'tuvan1', 'tuvan');
  r.thongBao = sq.prepare("SELECT denVai FROM thongBao WHERE loai = 'viPham'").all().map(x => x.denVai).sort().join();
  r.vanHoatDong = sq.prepare("SELECT active FROM users WHERE username = 'tuvan1'").get().active;
  /* chép pha loãng: một đoạn lời giải kẹp giữa ba lần bài tự viết */
  r.chepLoang = T.doChep(BAI + ' ' + BAI.replace(/con/g, 'em') + ' ' + LOI_GIAI + ' ' + BAI.replace(/bố/g, 'mẹ'), LOI_GIAI + ' ' + LOI_GIAI);
  r.gtLa = await T.giaiTrinhViPham({ id: r.vp.id, noiDung: 'Tôi giải trình thay người khác, phải bị chặn theo luật.' }, env, db, tv2);
  r.gt = await T.giaiTrinhViPham({ id: r.vp.id, noiDung: 'Tôi đã báo miệng Trưởng nhóm ngày đầu, xin xem lại ghi chép buổi giao ca.' }, env, db, tv1);
  r.quyetR05 = await T.quyetViPham({ id: r.vp.id, quyet: 'huy', ghiChu: 'Không phải Super Admin, phải bị chặn.' }, env, db, r05);
  r.soVp = await T.dsViPham({}, env, db, chu);
  r.soVpR11 = await T.dsViPham({}, env, db, tv2);
  r.huy = await T.quyetViPham({ id: r.vp.id, quyet: 'huy', ghiChu: 'Có ghi chép giao ca, ghi vi phạm nhầm.' }, env, db, chu);
  r.capSauHuy = await T.capCua(db, 'tuvan1', 'tuvan');
  r.cua = await T.thiCuaToi({}, env, db, tv1);
  /* cổng kho */
  r.dsTat = await K.dsKhoCao({ he: 'tuvan' }, env, db, tv2);
  r.congR04 = await T.datCongThi({ bat: true, lyDo: 'Thử bật cổng bởi người không phải chủ hệ.' }, env, db, r04);
  r.cong = await T.datCongThi({ bat: true, lyDo: 'Bật cổng thi cho kỳ vận hành đầu tiên.' }, env, db, chu);
  r.dsBat = await K.dsKhoCao({ he: 'tuvan' }, env, db, tv2);
  r.dsBatTv1 = await K.dsKhoCao({ he: 'tuvan' }, env, db, tv1);
  r.dsQl = await K.dsKhoCao({ he: 'tuvan' }, env, db, r04);
  const khoaTv1 = r.dsBatTv1.ds.find(d => d.khoa), moTv1 = r.dsBatTv1.ds.find(d => !d.khoa);
  r.docKhoa = await K.docKhoCao({ ma: khoaTv1.ma }, env, db, tv1);
  r.docMo = moTv1 ? await K.docKhoCao({ ma: moTv1.ma }, env, db, tv1) : null;
  const vvip = 'V1-A-005';                                  // hạng VVIP (i=5)
  r.dxKho = await K.deXuatKhoCao({ maNha: 'K2', ds: [vvip] }, env, db, tv1);
  r.xinNgan = await T.xinYKienKho({ maNha: 'K2', ma: vvip, lyDo: 'khó' }, env, db, tv1);
  r.xin = await T.xinYKienKho({ maNha: 'K2', ma: vvip, lyDo: 'Ca nhiều thế hệ, đã quan sát bảy ngày, đề nghị Trưởng nhóm xem trước khi đề xuất.' }, env, db, tv1);
  r.tuDuyet = await T.duyetYKien({ id: r.xin.id, quyet: 'cho', ghiChu: 'Tự duyệt thử, phải bị chặn.' }, env, db, tv1);
  r.duyetR05 = await T.duyetYKien({ id: r.xin.id, quyet: 'cho', ghiChu: 'Trưởng nhóm Coach duyệt ca hệ Tư vấn.' }, env, db, r05);
  r.chuyenThap = await T.duyetYKien({ id: r.xin.id, quyet: 'chuyen', choAi: 'tuvan2@gita.vn', ghiChu: 'Chuyển cho người cấp thấp hơn, phải bị chặn.' }, env, db, r04);
  r.chuyenTuNhan = await T.duyetYKien({ id: r.xin.id, quyet: 'chuyen', choAi: 'chuyenmon@gita.vn', ghiChu: 'Người duyệt tự nhận ca, phải bị chặn.' }, env, db, r04);
  r.chuyen = await T.duyetYKien({ id: r.xin.id, quyet: 'chuyen', choAi: 'coach2@gita.vn', ghiChu: 'Chuyển cho người có kinh nghiệm ca nhiều thế hệ.' }, env, db, r04);
  r.dxNguoiXin = await K.deXuatKhoCao({ maNha: 'K2', ds: [vvip] }, env, db, tv1);
  r.dxNguoiNhan = await K.deXuatKhoCao({ maNha: 'K2', ds: [vvip] }, env, db, c2);
  r.dsYk = await T.dsYKien({}, env, db, r04);
  r.doi = await T.doiThi({ he: 'tuvan' }, env, db, r05);
  r.doiR11 = await T.doiThi({ he: 'tuvan' }, env, db, tv1);
  return r;
}

const T = await import(pathToFileURL(ROOT + '/may-chu/thi-cap.js').href);
const K = await import(pathToFileURL(ROOT + '/may-chu/kho-cao.js').href);
const r = await chay(T, K);
const CAP = T.CAP;
kiem('khung đủ 50 cấp Tư vấn và 100 cấp Coach', CAP.tuvan.length === 50 && CAP.coach.length === 100);
kiem('độ khó tăng theo cấp: số ca, biến cố, ngưỡng, % kho không giảm', ['tuvan', 'coach'].every(h => CAP[h].every((c, i) => !i ||
  (c.soCa >= CAP[h][i - 1].soCa && c.soBien >= CAP[h][i - 1].soBien && c.nguong >= CAP[h][i - 1].nguong && c.kho > CAP[h][i - 1].kho))));
kiem('cấp cao nhất mở 100% kho, cần hai người chấm', CAP.tuvan[49].kho === 100 && CAP.coach[99].kho === 100 && CAP.coach[99].soNguoiCham === 2);
kiem('mỗi cấp chỉ dùng dạng nhiệm vụ có thật', ['tuvan', 'coach'].every(h => CAP[h].every(c => c.dang.every(d => T.DANG.some(x => x.ma === d)))));
kiem('mỗi dạng có thang 4 tiêu chí', T.DANG.length === 14 && T.DANG.every(d => d.thang.length === 4));
kiem('khung đọc được cho nhân sự, khách hàng bị chặn', r.khung.ok && r.khungKhach.code === 'NOPERM');
kiem('kho chưa nạp thì không ghép được đề (nói rõ, không ra đề rỗng)', r.khongKho.code === 'KHOCHUANAP');
kiem('khách hàng không thi', r.khach.code === 'NOPERM');
kiem('Tư vấn viên không thi thang Coach', r.saiHe.code === 'NOPERM');
kiem('bắt đầu thi cấp 1 (lên), đề có đủ số ca của cấp', r.bd.ok && r.bd.cap === 1 && r.de1.de.length === CAP.tuvan[0].soCa, JSON.stringify(r.bd));
kiem('đang có bài chưa nộp thì không mở bài thứ hai', r.bd2.code === 'DANGLAM');
kiem('đề không chứa lời giải của kho (chỉ tình huống + yêu cầu + thang)', r.de1.de.every(c => c.van && c.yeuCau && c.thang.length === 4 && !('phacDo' in c) && !('buoc' in c)));
kiem('hai người cùng cấp cùng tháng ra hai đề khác nhau (lộ trình riêng)', JSON.stringify(r.de1.de.map(c => c.ma + c.dang)) !== JSON.stringify(r.deTv2.de.map(c => c.ma + c.dang)));
kiem('người khác (cùng cấp) không đọc được bài của mình', r.docLa.code === 'NOPERM');
kiem('bài quá ngắn bị từ chối', r.nopNgan.code === 'THIEU');
kiem('không nộp hộ người khác', r.nopHo.code === 'NOPERM');
kiem('máy báo ca chép lời giải của kho (ca 2), không báo ca tự viết (ca 1)', r.nop.ok && r.canhBao.length === 1 && r.canhBao[0].ca === 2 && r.canhBao[0].loai === 'chepKho', JSON.stringify(r.canhBao));
kiem('không tự chấm bài của mình', r.tuCham.code === 'TUCHAM');
kiem('Tư vấn viên cùng cấp không chấm được', r.chamR11.code === 'NOPERM');
kiem('chấm thiếu ca / điểm ngoài 0–25 bị từ chối', r.chamSai.code === 'SAI');
kiem('bài chờ chấm có trong hàng của quản lý, kèm cờ cảnh báo', r.hang.ok && r.hang.ds.some(d => d.luot === r.bd.luot && d.coCanhBao));
kiem('điểm dưới ngưỡng → trượt, cấp vẫn 0', r.chamThap.ok && r.chamThap.trangThai === 'truot' && r.capSauTruot.cap === 0);
kiem('người thi chưa thấy điểm khi bài còn chờ chấm', r.docTruocCham.trangThai === 'choCham' && r.docTruocCham.cham.length === 0);
kiem('đạt ngưỡng → lên cấp 1, đã giữ cấp tháng này', r.chamDat.trangThai === 'dat' && r.capSauDat.cap === 1 && r.capSauDat.datThangNay);
kiem('mỗi tháng tối đa 2 lần thi một hệ', r.hetLan.code === 'HETLAN');
kiem('hết tháng không thi lại → tụt một cấp (tính lúc đọc)', r.capTut.cap === 0, JSON.stringify(r.capTut));
kiem('chỉ quản lý (R01–R05) ghi vi phạm', r.vpR11.code === 'NOPERM');
kiem('không tự ghi vi phạm cho mình', r.vpTu.code === 'TUGHI');
kiem('không ghi vi phạm cho người bậc cao hơn hoặc ngang mình', r.vpNgang.code === 'NGANGCAP');
kiem('vi phạm mức 1 → hạ 1 cấp ngay', r.vp.ok && r.capSauVp.cap === 0);
kiem('đề nghị đình chỉ chỉ là ĐỀ NGHỊ: báo Giám đốc + Super Admin, tài khoản vẫn hoạt động (máy không tự khoá)',
  r.thongBao === 'R01,R03' && r.vanHoatDong === 1, JSON.stringify([r.thongBao, r.vanHoatDong]));
kiem('chép một đoạn lời giải rồi pha loãng bằng bài tự viết vẫn bị báo (tỉ lệ thấp nhưng cụm trùng ≥ CUM_CHEP)',
  r.chepLoang.ty <= 0.25 && r.chepLoang.cum >= T.CUM_CHEP, JSON.stringify(r.chepLoang));
kiem('chỉ người bị ghi viết giải trình', r.gtLa.code === 'NOPERM' && r.gt.ok);
kiem('sổ vi phạm cho quản lý: thấy chứng cứ + giải trình trước khi quyết; R11 không đọc được',
  r.soVp.ok && r.soVp.ds.some(v => v.id === r.vp.id && v.giaiTrinh && v.chungCu && v.maNguoi === 'tuvan1') && r.soVpR11.code === 'NOPERM');
kiem('chỉ Super Admin huỷ vi phạm; huỷ thì cấp trở lại', r.quyetR05.code === 'NOPERM' && r.huy.ok && r.capSauHuy.cap === 1);
kiem('bảng của tôi: cấp, % kho, giải trình và quyết định hiện ra', r.cua.ok && r.cua.he[0].cap === 1 && r.cua.viPham[0].giaiTrinh && r.cua.viPham[0].quyet === 'huy');
kiem('cổng TẮT: kho mở hết, không ô nào khoá', r.dsTat.pham.het && r.dsTat.ds.every(d => !d.khoa));
kiem('chỉ Super Admin bật cổng', r.congR04.code === 'NOPERM' && r.cong.ok);
kiem('cổng BẬT: người chưa có cấp thấy tên, mọi nội dung khoá', !r.dsBat.pham.het && r.dsBat.ds.every(d => d.khoa));
kiem('cấp 1 Tư vấn mở đúng 2% kho, từ hạng dễ', r.dsBatTv1.ds.filter(d => !d.khoa).length === Math.floor(60 * CAP.tuvan[0].kho / 100) && r.dsBatTv1.ds.filter(d => !d.khoa).every(d => d.hang === 'S1'));
kiem('quản lý (R04) không qua cổng', r.dsQl.pham.het);
kiem('đọc vấn đề vượt cấp → CAPCHUA, chỉ đường xin ý kiến', r.docKhoa.code === 'CAPCHUA' && /xin ý kiến/i.test(r.docKhoa.error));
kiem('đọc vấn đề trong phần được mở → được', !r.docMo || r.docMo.ok);
kiem('đề xuất vấn đề VVIP khi chưa xin ý kiến → XINYKIEN, nghiêm cấm tự xử lý', r.dxKho.code === 'XINYKIEN');
kiem('xin ý kiến phải viết đủ', r.xinNgan.code === 'THIEUCAU' && r.xin.ok);
kiem('không tự duyệt lượt xin của mình', r.tuDuyet.code === 'NOPERM' || r.tuDuyet.code === 'TUDUYET');
kiem('ca hệ Tư vấn: Trưởng nhóm Coach (R05) không duyệt, R01–R04 duyệt', r.duyetR05.code === 'NOPERM' && r.chuyen.ok && r.chuyen.choAi === 'coach2', JSON.stringify(r.chuyen));
kiem('chuyển phải tới người năng lực cao hơn: tư vấn cấp thấp hơn bị chặn, người duyệt không tự nhận ca',
  r.chuyenThap.code === 'CHUACAOHON' && r.chuyenTuNhan.code === 'TUNHAN', JSON.stringify([r.chuyenThap.code, r.chuyenTuNhan.code]));
kiem('đã CHUYỂN người: người xin không đề xuất nữa, người nhận đề xuất được dù không phụ trách nhà', r.dxNguoiXin.code === 'XINYKIEN' && r.dxNguoiNhan.ok, JSON.stringify([r.dxNguoiXin.code, r.dxNguoiNhan]));
kiem('quản lý thấy danh sách ý kiến kèm quyết định', r.dsYk.ok && r.dsYk.ds.some(d => d.quyet === 'chuyen' && d.choAi === 'coach2'));
kiem('quản lý xem cấp cả đội; R11 không xem được', r.doi.ok && r.doi.ds.length === 2 && r.doiR11.code === 'NOPERM');

/* ── đối kháng: mỗi lỗ hai tổ soát tìm ra (10/2026) một phép đo ── */
async function doiKhang(T, K) {
  const { sq, db } = await dung();
  const env = {}, d = {};
  for (const [id, u, r] of [['U2', 'chu2', 'R01'], ['U6', 'truongcoach2', 'R05']]) sq.prepare('INSERT INTO users (id, username, email, role, active) VALUES (?,?,?,?,1)').run(id, u, u + '@gita.vn', r);
  const chu2 = ho('chu2', 'R01', 'U2'), r05b = ho('truongcoach2', 'R05', 'U6');
  const lo = []; for (let i = 1; i <= 60; i++) lo.push(banGhi('V1-A-' + String(i).padStart(3, '0'), HANG[(i - 1) % 6]));
  lo.push(banGhi('C4-A-001', 'VVIP'));
  await K.napKhoCao({ ds: lo, ban: 'THU' }, env, db, chu);
  const ganDat = async (ai, luot, nguoiCham, diem) => {
    const de = JSON.parse(sq.prepare('SELECT de FROM thiLuot WHERE id = ?').get(luot).de);
    const tg = sq.prepare('SELECT cap, muc, he FROM thiLuot WHERE id = ?').get(luot);
    const n = T.defThi(tg.he, tg.cap, tg.muc).chuToiThieu;
    await T.nopBaiThi({ luot, baiLam: de.map(() => (BAI + ' ').repeat(Math.ceil(n / BAI.length) + 1)) }, env, db, ai);
    return T.chamBaiThi({ luot, chiTiet: de.map(() => [diem, diem, diem, diem]), ghiChu: 'Nhận xét đủ dài cho phép đo đối kháng của hệ thi.' }, env, db, nguoiCham);
  };
  /* (2) không chấm lại; đủ người thì chốt */
  const b1 = await T.batDauThi({ he: 'tuvan' }, env, db, tv1);
  d.cham1 = await ganDat(tv1, b1.luot, r04, 22);
  d.chamLai = await T.chamBaiThi({ luot: b1.luot, chiTiet: [[0, 0, 0, 0], [0, 0, 0, 0]], ghiChu: 'Chấm lại để đảo kết quả — phải bị chặn.' }, env, db, r04);
  d.chamThem = await T.chamBaiThi({ luot: b1.luot, chiTiet: [[0, 0, 0, 0], [0, 0, 0, 0]], ghiChu: 'Thêm một điểm 0 vào bài đã chốt — phải bị chặn.' }, env, db, chu);
  d.capSau = (await T.capCua(db, 'tuvan1', 'tuvan')).cap;
  /* (8) gọi dồn ba lượt bắt đầu cùng lúc */
  d.dua = await Promise.all([1, 2, 3].map(() => T.batDauThi({ he: 'tuvan' }, env, db, tv2)));
  /* (10) đang thi thì kho không mở lời giải của chính ca ấy */
  const mo = d.dua.find(x => x.ok);
  const maCa = JSON.parse(sq.prepare('SELECT de FROM thiLuot WHERE id = ?').get(mo.luot).de)[0].ma;
  d.docDangThi = await K.docKhoCao({ ma: maCa }, env, db, tv2);
  /* (14) một ca 0 điểm thì trượt dù trung bình đủ */
  const deMo = JSON.parse(sq.prepare('SELECT de FROM thiLuot WHERE id = ?').get(mo.luot).de);
  const nMo = T.defThi('tuvan', 1, 'len').chuToiThieu;
  await T.nopBaiThi({ luot: mo.luot, baiLam: deMo.map(() => (BAI + ' ').repeat(Math.ceil(nMo / BAI.length) + 1)) }, env, db, tv2);
  d.motCaKhong = await T.chamBaiThi({ luot: mo.luot, chiTiet: deMo.map((_, i) => i ? [25, 25, 25, 25] : [10, 10, 10, 10]), ghiChu: 'Ca một bỏ gần trắng, ca hai rất tốt — trung bình vẫn đủ ngưỡng.' }, env, db, r04);
  /* (1) rút lại / chuyển đi thì quyền cũ hết */
  const vvip = 'V1-A-005';
  const x1 = await T.xinYKienKho({ maNha: 'K2', ma: vvip, lyDo: 'Ca nhiều thế hệ, đã quan sát bảy ngày, đề nghị xem trước khi đề xuất.' }, env, db, tv1);
  await T.duyetYKien({ id: x1.id, quyet: 'cho', ghiChu: 'Cho làm, có Trưởng nhóm kèm.' }, env, db, r04);
  d.truocRut = await T.coChoPhep(db, 'tuvan1', 'K2', vvip);
  await T.duyetYKien({ id: x1.id, quyet: 'tuChoi', ghiChu: 'Rút lại sau khi đọc kỹ hồ sơ.' }, env, db, chu);
  d.sauRut = await T.coChoPhep(db, 'tuvan1', 'K2', vvip);
  /* (4) không phụ trách nhà / nhà không có thật thì không xin được */
  d.xinNhaLa = await T.xinYKienKho({ maNha: 'K2', ma: vvip, lyDo: 'Xin cho nhà mình không phụ trách — phải bị chặn theo luật.' }, env, db, tv2);
  d.xinKhongNha = await T.xinYKienKho({ maNha: 'KHONG-CO', ma: vvip, lyDo: 'Xin cho một nhà không có thật — phải bị chặn theo luật.' }, env, db, tv1);
  /* (5) không tự quyết vi phạm của chính mình */
  const vChu = await T.ghiViPham({ maNguoi: 'chu', he: 'tuvan', loai: 'SAI_QUY_TRINH', mucDo: 1, chungCu: 'Ghi thử cho Super Admin bởi một Super Admin khác, ca ngày mười.' }, env, db, chu2);
  d.tuQuyet = await T.quyetViPham({ id: vChu.id, quyet: 'huy', ghiChu: 'Tự huỷ vi phạm của mình — phải bị chặn.' }, env, db, chu);
  /* (6) huỷ rồi xác nhận lại thì vi phạm áp */
  const capTruoc = (await T.capCua(db, 'tuvan1', 'tuvan')).cap;
  const v6 = await T.ghiViPham({ maNguoi: 'tuvan1', he: 'tuvan', loai: 'GIAU_VAN_DE', mucDo: 1, chungCu: 'Không báo dấu hiệu bất thường của nhà K2 trong ba ngày liền.' }, env, db, r04);
  await T.quyetViPham({ id: v6.id, quyet: 'huy', ghiChu: 'Huỷ nhầm, sẽ xác nhận lại.' }, env, db, chu);
  await T.quyetViPham({ id: v6.id, quyet: 'xacNhan', ghiChu: 'Xác nhận lại sau khi đọc ghi chép.' }, env, db, chu);
  d.huyRoiXacNhan = [capTruoc, (await T.capCua(db, 'tuvan1', 'tuvan')).cap];
  /* (13) ghi vi phạm sai thang */
  d.saiHe = await T.ghiViPham({ maNguoi: 'tuvan2', he: 'coach', loai: 'GIAU_VAN_DE', mucDo: 1, chungCu: 'Ghi ở thang Coach cho một Tư vấn viên — phải bị chặn.' }, env, db, r04);
  /* (11)(12) khoá mức 3: áp cả khi cổng tắt; người bị khoá không duyệt/chấm */
  await T.ghiViPham({ maNguoi: 'truongcoach2', he: 'coach', loai: 'TU_Y_XU_LY', mucDo: 3, chungCu: 'Tự xử lý ca Diamond không xin ý kiến, ca ngày mười hai.' }, env, db, chu);
  d.phamKhoa = await T.phamViKho(db, r05b, 'coach');
  const x2 = await T.xinYKienKho({ maNha: 'K2', ma: 'C4-A-001', lyDo: 'Ca nhiều thế hệ, xin Trưởng nhóm xem trước khi đề xuất cho nhà.' }, env, db, c1);
  d.duyetKhiKhoa = await T.duyetYKien({ id: x2.id, quyet: 'cho', ghiChu: 'Duyệt khi đang bị khoá — phải bị chặn.' }, env, db, r05b);
  d.duyetNgang = await T.duyetYKien({ id: x2.id, quyet: 'cho', ghiChu: 'Coach duyệt cho Coach — phải bị chặn.' }, env, db, ho('coach2', 'R07', 'U8'));
  /* sổ vi phạm của R05 không có vi phạm của người bậc trên */
  d.soR05 = await T.dsViPham({}, env, db, r05);
  /* (7) bài bắt đầu TRƯỚC khi bị hạ không dựng lại cấp */
  const tv3 = ho('tuvan3', 'R11', 'U14'); sq.prepare("INSERT INTO users (id, username, email, role, active) VALUES ('U14','tuvan3','tuvan3@gita.vn','R11',1)").run();
  const b7 = await T.batDauThi({ he: 'tuvan' }, env, db, tv3);
  await ganDat(tv3, b7.luot, r04, 22);
  const b7b = await T.batDauThi({ he: 'tuvan' }, env, db, tv3);                     // thi lên cấp 2
  sq.prepare('UPDATE thiLuot SET batDau = batDau - 60000 WHERE id = ?').run(b7b.luot);
  await T.ghiViPham({ maNguoi: 'tuvan3', he: 'tuvan', loai: 'SAI_QUY_TRINH', mucDo: 1, chungCu: 'Làm sai quy trình giao ca, ghi trong lúc bài thi đang mở.' }, env, db, r04);
  await ganDat(tv3, b7b.luot, r04, 22);
  d.batDauTruocHa = (await T.capCua(db, 'tuvan3', 'tuvan')).cap;
  /* (9) hàng chấm không bị 200 bài cũ che */
  const ins = sq.prepare("INSERT INTO thiLuot (id, maNguoi, he, cap, muc, thang, de, batDau, hanLuc, nopLuc, baiLam) VALUES (?, 'cu', 'tuvan', 1, 'len', '2026-01', '[]', 1, 9e15, ?, '[]')");
  const insC = sq.prepare("INSERT INTO thiCham (id, luot, boiAi, diem, chiTiet, ghiChu, luc) VALUES (?, ?, 'ai-do', 90, '[]', 'x', 1)");
  for (let i = 0; i < 205; i++) { ins.run('OLD' + i, 1000 + i); insC.run('C' + i, 'OLD' + i); }
  const bMoi = await T.batDauThi({ he: 'tuvan' }, env, db, tv2);
  d.bMoi = bMoi;
  const deMoi = JSON.parse(sq.prepare('SELECT de FROM thiLuot WHERE id = ?').get(bMoi.luot).de);
  await T.nopBaiThi({ luot: bMoi.luot, baiLam: deMoi.map(() => (BAI + ' ').repeat(4)) }, env, db, tv2);
  d.hang = await T.dsBaiCham({}, env, db, r04);
  d.luotMoi = bMoi.luot;
  /* (16) đề không lấy ca trong phần kho đã mở khi đủ ca ngoài */
  const tv4 = ho('tuvan4', 'R11', 'U15'); sq.prepare("INSERT INTO users (id, username, email, role, active) VALUES ('U15','tuvan4','tuvan4@gita.vn','R11',1)").run();
  const b16 = await T.batDauThi({ he: 'tuvan' }, env, db, tv4);
  await ganDat(tv4, b16.luot, r04, 22);
  await T.datCongThi({ bat: true, lyDo: 'Bật cổng để đo phần đã mở.' }, env, db, chu);
  const moTv1 = await T.maDuocMo(db, tv4, 'tuvan');
  const bG = await T.batDauThi({ he: 'tuvan', muc: 'giu' }, env, db, tv4);
  d.deTrongMo = bG.ok ? JSON.parse(sq.prepare('SELECT de FROM thiLuot WHERE id = ?').get(bG.luot).de).filter(c => moTv1.mo && moTv1.mo.has(c.ma)).length : -1;
  d.moSize = moTv1.mo ? moTv1.mo.size : 0;
  return d;
}
const dk = await doiKhang(T, K);
/* Trùng mili-giây giữa bài đạt và vi phạm: dựng thẳng hai dòng cùng mốc, không
   nhờ máy chạy nhanh hay chậm. Lần đỏ đầu của bước này trên CI là đúng chỗ ấy. */
async function trungMoc(T) {
  const { sq, db } = await dung();
  const moc = Date.now() - 3600000;
  sq.prepare("INSERT INTO thiLuot (id, maNguoi, he, cap, muc, thang, de, batDau, hanLuc, nopLuc, baiLam) VALUES ('TM1','tuvan1','tuvan',1,'len',?,'[{\"ma\":\"X\",\"dang\":\"D01\",\"bien\":[]}]',?,?,?,'[]')")
    .run(T.thangCua(moc), moc - 60000, moc + 3600000, moc - 30000);
  sq.prepare("INSERT INTO thiCham (id, luot, boiAi, diem, chiTiet, ghiChu, luc) VALUES ('CM1','TM1','chuyenmon',90,'[[23,23,22,22]]','x',?)").run(moc);
  sq.prepare("INSERT INTO thiLuot (id, maNguoi, he, cap, muc, thang, de, batDau, hanLuc, nopLuc, baiLam) VALUES ('TM2','tuvan1','tuvan',2,'len',?,'[{\"ma\":\"X\",\"dang\":\"D01\",\"bien\":[]},{\"ma\":\"Y\",\"dang\":\"D01\",\"bien\":[]}]',?,?,?,'[]')")
    .run(T.thangCua(moc), moc - 20000, moc + 3600000, moc);
  sq.prepare("INSERT INTO thiCham (id, luot, boiAi, diem, chiTiet, ghiChu, luc) VALUES ('CM2','TM2','chuyenmon',90,'[[23,23,22,22],[23,23,22,22]]','x',?)").run(moc + 1);
  sq.prepare("INSERT INTO viPhamNangLuc (id, maNguoi, he, loai, mucDo, chungCu, boiAi, luc) VALUES ('VP1','tuvan1','tuvan','SAI_QUY_TRINH',1,'x','chuyenmon',?)").run(moc);
  return (await T.capCua(db, 'tuvan1', 'tuvan')).cap;
}
kiem('bài đạt và vi phạm trùng đúng mili-giây: vi phạm áp trước, bài bắt đầu trước đó không dựng lại cấp', (await trungMoc(T)) === 0, String(await trungMoc(T)));
kiem('không chấm lại bài mình đã chấm; đủ người rồi thì không ai chấm thêm; kết quả giữ nguyên',
  dk.cham1.ok && dk.chamLai.code === 'DACHAM' && dk.chamThem.code === 'DUNGUOI' && dk.capSau === 1, JSON.stringify([dk.chamLai.code, dk.chamThem.code, dk.capSau]));
kiem('ba lượt bắt đầu gọi dồn cùng lúc chỉ mở đúng một bài', dk.dua.filter(x => x.ok).length === 1, JSON.stringify(dk.dua.map(x => x.code || 'ok')));
kiem('đang thi: kho không mở lời giải của ca trong bài (DANGTHI)', dk.docDangThi.code === 'DANGTHI', JSON.stringify(dk.docDangThi.code));
kiem('một ca dưới sàn ' + T.SAN_CA + ' điểm thì trượt dù trung bình đủ', dk.motCaKhong.ok && dk.motCaKhong.trangThai === 'truot', JSON.stringify(dk.motCaKhong));
kiem('duyệt rồi RÚT LẠI thì quyền hết (chỉ quyết định mới nhất có hiệu lực)', dk.truocRut === true && dk.sauRut === false);
kiem('không phụ trách nhà, hoặc nhà không có thật, thì không xin ý kiến được', dk.xinNhaLa.code === 'NOPERM' && dk.xinKhongNha.code === 'KHONGNHA', JSON.stringify([dk.xinNhaLa.code, dk.xinKhongNha.code]));
kiem('Super Admin không tự quyết vi phạm ghi cho chính mình', dk.tuQuyet.code === 'TUQUYET');
kiem('huỷ rồi xác nhận lại thì vi phạm vẫn áp (theo quyết định mới nhất)', dk.huyRoiXacNhan[1] === Math.max(0, dk.huyRoiXacNhan[0] - 1), JSON.stringify(dk.huyRoiXacNhan));
kiem('ghi vi phạm ở thang người ấy không thuộc thì bị chặn (hệ quả không áp được)', dk.saiHe.code === 'SAIHE');
kiem('khoá mức 3 áp cả khi cổng tắt: kho 0%', dk.phamKhoa.pct === 0 && dk.phamKhoa.ly === 'khoaDoViPham', JSON.stringify(dk.phamKhoa));
kiem('người đang bị khoá không duyệt ý kiến; người ngang bậc không duyệt cho nhau',
  dk.duyetKhiKhoa.code === 'DANGKHOA' && ['NOPERM', 'NGANGCAP'].includes(dk.duyetNgang.code), JSON.stringify([dk.duyetKhiKhoa.code, dk.duyetNgang.code]));
kiem('sổ vi phạm của Trưởng nhóm không có vi phạm của người bậc trên', dk.soR05.ok && !dk.soR05.ds.some(v => v.maNguoi === 'chu'));
kiem('bài bắt đầu trước lần bị hạ không dựng lại cấp đã mất', dk.batDauTruocHa === 0, String(dk.batDauTruocHa));
kiem('hàng chấm vẫn thấy bài mới khi đã có hơn 200 bài cũ', dk.hang.ok && dk.hang.ds.some(x => x.luot === dk.luotMoi), JSON.stringify([dk.bMoi, dk.hang.ds && dk.hang.ds.length]));
kiem('đề không lấy ca trong phần kho người thi đã mở khi đủ ca ngoài', dk.moSize > 0 && dk.deTrongMo === 0, JSON.stringify([dk.moSize, dk.deTrongMo]));
kiem('thi giữ cấp khó hơn lần đạt: thêm biến cố, ngưỡng cao hơn, bài dài hơn',
  ['tuvan', 'coach'].every(h => T.CAP[h].every(c => { const a = T.defThi(h, c.cap, 'len'), g = T.defThi(h, c.cap, 'giu');
    return g.nguong > a.nguong && g.chuToiThieu > a.chuToiThieu && (g.soBien > a.soBien || a.soBien === 3); })));
kiem('mọi cấp khó hơn cấp trước ít nhất ở độ dài bài tối thiểu', ['tuvan', 'coach'].every(h => T.CAP[h].every((c, i) => !i || T.chuToiThieu(h, c.cap) > T.chuToiThieu(h, c.cap - 1))));

/* ── tĩnh ── */
const sql = fs.readFileSync(ROOT + '/may-chu/csdl.sql', 'utf8');
const BANG = ['thiCauHinh', 'thiLuot', 'thiCham', 'xinYKien', 'xinYKienQuyet', 'viPhamNangLuc', 'viPhamGiaiTrinh', 'viPhamQuyet'];
kiem('tám bảng có trong csdl.sql', BANG.every(b => sql.includes('CREATE TABLE IF NOT EXISTS ' + b + ' (')));
const khoiBang = b => (sql.match(new RegExp('CREATE TABLE IF NOT EXISTS ' + b + ' \\(([\\s\\S]*?)\\n\\);')) || [])[1] || '';
const cam = BANG.flatMap(b => ['capHienTai', 'trangThai', 'daDat', 'dangHieuLuc'].filter(c => new RegExp('^\\s*' + c + '\\b', 'm').test(khoiBang(b))).map(c => b + '.' + c));
kiem('không bảng nào có cột tóm tắt (cấp hiện tại, trạng thái, đã đạt)', !cam.length, cam.join(','));
const wk = fs.readFileSync(ROOT + '/may-chu/worker.js', 'utf8');
const CUA = ['datCongThi', 'batDauThi', 'docBaiThi', 'nopBaiThi', 'chamBaiThi', 'dsBaiCham', 'thiCuaToi', 'khungThi', 'xinYKienKho', 'duyetYKien', 'dsYKien', 'ghiViPham', 'giaiTrinhViPham', 'quyetViPham', 'doiThi', 'dsViPham'];
const canPhien = (wk.match(/const CAN_PHIEN = \[([\s\S]*?)\];/) || [])[1] || '';
kiem(CUA.length + ' cửa có trong CAN_PHIEN và có đường gọi', CUA.every(f => canPhien.includes("'" + f + "'") && wk.includes("fn === '" + f + "'")));
kiem('máy không có cửa tự đình chỉ hay tính bồi thường', !/export async function (dinhChi|tinhBoiThuong|camThamGia)/.test(fs.readFileSync(ROOT + '/may-chu/thi-cap.js', 'utf8')));

/* ── màn hình ── */
const man = fs.readFileSync(ROOT + '/src/thi-chung-chi.js', 'utf8');
const goiMan = [...man.matchAll(/(?:goiMayChu|doc|ghi)\(\s*(?:'[^']*'\s*,\s*)?'([a-zA-Z]+)'/g)].map(m => m[1]).filter(f => /[A-Z]/.test(f));
const laCua = [...new Set(goiMan)].filter(f => !CUA.includes(f));
kiem('màn chỉ gọi cửa thi có thật (' + new Set(goiMan).size + ' cửa)', new Set(goiMan).size >= 14 && !laCua.length, laCua.join(','));
const core = fs.readFileSync(ROOT + '/src/data.core.js', 'utf8'), ds = JSON.parse(fs.readFileSync(ROOT + '/tools/danh-sach-src.json', 'utf8'));
kiem('màn thi-chung-chi có trong NAV (nghe_chung), bản tiếng Anh và danh sách gộp',
  /\{v:'thi-chung-chi'[^}]*perm:'nghe_chung'/.test(core) && fs.readFileSync(ROOT + '/src/i18n.js', 'utf8').includes("'thi-chung-chi':[") &&
  JSON.stringify(ds).includes('src/thi-chung-chi.js') && man.includes("G.VIEWS['thi-chung-chi']"));
const maMan = man.replace(/\/\*[\s\S]*?\*\//g, '').replace(/'(?:\\.|[^'\\])*'/g, "''");
kiem('màn viết ES5 (không mũi tên, không let/const, không chuỗi `)', !/=>|\blet\s|\bconst\s|`/.test(maMan));
kiem('màn không giữ bài thi trong localStorage (máy dùng chung)', !/localStorage/.test(maMan));
kiem('màn không giữ bản chép khung cấp (khung đọc từ khungThi)', !/CO-0\d\d|TV-0\d|"trongTam"/.test(man));

/* ── phá thử ── */
async function pha(ten, tu, sang, dieu, chayBang) {
  const goc = fs.readFileSync(ROOT + '/may-chu/thi-cap.js', 'utf8'), ban = goc.replace(tu, sang);
  if (ban === goc) { kiem('phá thử ' + ten + ': chuỗi phá có trong mã', false); return; }
  const tam = ROOT + '/may-chu/_pha-thi-cap.js';
  try {
    fs.writeFileSync(tam, ban);
    const P = await import(pathToFileURL(tam).href + '?v=' + Date.now() + Math.random());
    const rp = await (chayBang || chay)(P, K);
    kiem('phá thử ' + ten + ': phép đo đỏ đúng chỗ', dieu(rp));
  } finally { fs.rmSync(tam, { force: true }); }
}
await pha('gỡ cổng tự chấm', "if (ai.ten === l.maNguoi) return { ok: false, code: 'TUCHAM'", "if (false) return { ok: false, code: 'TUCHAM'", rp => rp.tuCham.code !== 'TUCHAM');
await pha('gỡ luật tụt cấp', 'if (!giuDuoc && cap > 0) { cap -= 1;', 'if (false) {', rp => rp.capTut.cap === 1);
await pha('cho chấm thêm khi đã đủ người', "if (kq0.cham.length >= kq0.canNguoi) return", "if (false) return", rp => rp.chamThem.ok === true, doiKhang);
await pha('nhận mọi quyết định cũ thay vì quyết định mới nhất', ' AND q.rowid = (SELECT q2.rowid FROM xinYKienQuyet q2 WHERE q2.xin = x.id ORDER BY q2.luc DESC, q2.rowid DESC LIMIT 1)', '', rp => rp.sauRut === true, doiKhang);
await pha('bỏ kiểm-rồi-ghi một câu khi bắt đầu thi', "'WHERE (SELECT COUNT(*) FROM thiLuot WHERE maNguoi = ? AND he = ? AND thang = ?) < ? ' +", "'WHERE ? IS NOT NULL OR ? OR ? OR ? ' +", rp => rp.dua.filter(x => x.ok).length > 1, doiKhang);
await pha('xếp bài đạt trước vi phạm khi trùng mili-giây', ' || (a.muc ? 0 : 1) - (b.muc ? 0 : 1)', '', rp => rp.trung !== 0, async (P) => ({ trung: await trungMoc(P) }));
await pha('cho bài bắt đầu trước lần hạ dựng lại cấp', 'if (e.batDau >= haLuc && e.dat >= cap)', 'if (e.dat >= cap)', rp => rp.batDauTruocHa > 0, doiKhang);

console.log('\n' + dat + ' đạt · ' + truot + ' sai');
process.exit(truot ? 1 : 0);
