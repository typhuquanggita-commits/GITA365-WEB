/* ═══════════════════════════════════════════════════════════════
   GITA 365 — TRUY VẤN ĐA CHIỀU · BỐN DÒNG CHẢY · BẢNG ĐIỂM 16 BAN

   Chủ hệ: rõ ràng dòng tiền · dòng giá trị · dòng chi phí · dòng công
   việc, thông suốt trên hệ thống; các phòng ban BẮT BUỘC nâng cấp,
   làm chuẩn — bằng con số đo được, không bằng lời nhắc.

   ══ ĐO, KHÔNG KHAI — CÙNG LUẬT CÂY TIỀN ══
   Mọi con số tính LÚC ĐỌC từ D1. Không ô nhập tay. Ban nào có tín
   hiệu xấu vượt ngưỡng (khai ngay tại đây, cột `nguong`) thì bảng
   điểm đánh "cần nâng cấp" — đó là cách "bắt buộc làm chuẩn" mà một
   hệ thống làm được: LỘT SÁNG, không phải gõ ai.

   ══ TRỎ, KHÔNG CHÉP ══
   Tên ban KHÔNG lặp lại ở đây — máy chủ chỉ trả tín hiệu theo mã
   B01…B16; màn bo-may-tap-doan (G.TD_BAN) giữ tên và sứ mệnh. Hai
   nơi cùng giữ tên ban là bản thứ hai của một bảng — bản nguy nhất.

   ══ GIỚI HẠN THẬT ══
   - Ngưỡng xấu ở đây là ngưỡng VẬN HÀNH do chủ hệ hiệu chỉnh, không
     phải chuẩn ngành.
   - Tín hiệu "cần nâng cấp" là đèn đỏ để người nhìn vào — nó không
     tự phạt, không tự đổi quy trình (máy đề xuất, người quyết, AT5).
   ═══════════════════════════════════════════════════════════════ */
'use strict';

import { laNguoiNha } from './vai-tro.js';

const so = async (db, sql, ...a) => {
  const r = await db.prepare(sql).bind(...a).first();
  return (r && (r.n ?? r.t)) || 0;
};
const dsach = async (db, sql, ...a) =>
  (await db.prepare(sql).bind(...a).all()).results || [];

export async function docDongChay(y, env, db, hoSo) {
  if (!laNguoiNha(hoSo)) return { ok: false, code: 'NOPERM', error: 'Mở cho R01–R12.' };
  const ngay = [7, 30, 90, 365].includes(Number((y || {}).ngay)) ? Number(y.ngay) : 30;
  const tu = new Date(Date.now() - ngay * 86400e3).toISOString().slice(0, 10);
  const hn = new Date().toISOString().slice(0, 10);
  const c3 = new Date(Date.now() - 3 * 86400e3).toISOString().slice(0, 10);
  const c7 = new Date(Date.now() - 7 * 86400e3).toISOString();
  const c24 = new Date(Date.now() - 86400e3).toISOString().slice(0, 19);

  /* ── DÒNG TIỀN ── */
  const thu = await so(db, "SELECT COALESCE(SUM(soTien),0) n FROM phieuThu WHERE trangThai = 'daDuyet' AND substr(ghiLuc,1,10) >= ?", tu);
  const hoan = await so(db, "SELECT COALESCE(SUM(soTien),0) n FROM hoanTien WHERE trangThai = 'daDuyet' AND substr(deXuatLuc,1,10) >= ?", tu);
  const hoaHong = await so(db, "SELECT COALESCE(SUM(soTien),0) n FROM hoaHongTra WHERE trangThai = 'daTra' AND substr(traLuc,1,10) >= ?", tu);
  const theoThang = await dsach(db,
    "SELECT substr(ghiLuc,1,7) thang, COALESCE(SUM(soTien),0) n FROM phieuThu WHERE trangThai = 'daDuyet' GROUP BY thang ORDER BY thang DESC LIMIT 6");

  /* ── DÒNG CHI PHÍ ── */
  const chi = await so(db, 'SELECT COALESCE(SUM(soTien),0) n FROM chiPhi WHERE trangThai = \'daDuyet\' AND substr(ngayChi,1,10) >= ?', tu);
  const chiTop = await dsach(db,
    'SELECT khoanMuc, COALESCE(SUM(soTien),0) n FROM chiPhi WHERE trangThai = \'daDuyet\' AND substr(ngayChi,1,10) >= ? GROUP BY khoanMuc ORDER BY n DESC LIMIT 5', tu);
  const luong = (await db.prepare('SELECT ky, COALESCE(SUM(luongCung + phanKpi),0) n, COUNT(*) soNguoi FROM bangLuong GROUP BY ky ORDER BY ky DESC LIMIT 1').first()) || null;
  const aiToken = await dsach(db, 'SELECT ncc, SUM(vao + ra) n FROM soTokenDaTri WHERE ngay >= ? GROUP BY ncc ORDER BY n DESC', tu);

  /* ── DÒNG GIÁ TRỊ (thứ khách nhận được) ── */
  const baiHoc = await so(db, 'SELECT COUNT(*) n FROM baiHocHoanThanh WHERE substr(ngay,1,10) >= ?', tu);
  const wow = await so(db, "SELECT COUNT(*) n FROM soCham WHERE kieu = 'wow' AND substr(ngay,1,10) >= ?", tu);
  const lenTang = await so(db, 'SELECT COUNT(*) n FROM lichSuTang WHERE denTang > COALESCE(tuTang,0) AND substr(luc,1,10) >= ?', tu);
  const khoDung = await so(db, 'SELECT COALESCE(SUM(dung),0) n FROM khoGiaiPhapDaTri');
  const tuyenXong = await so(db, "SELECT COUNT(*) n FROM tuyenDaTri WHERE trangThai = 'xong'");

  /* ── DÒNG CÔNG VIỆC (ai làm gì, bao nhiêu) ── */
  const congViec = await dsach(db,
    'SELECT viec, COUNT(*) n FROM audit WHERE substr(luc,1,10) >= ? GROUP BY viec ORDER BY n DESC LIMIT 10', tu);
  const tongLuot = await so(db, 'SELECT COUNT(*) n FROM audit WHERE substr(luc,1,10) >= ?', tu);

  /* ── BẢNG ĐIỂM 16 BAN — tín hiệu theo mã, ngưỡng khai ở đây ── */
  const ban = {};
  const ttNang = await so(db, "SELECT COUNT(*) n FROM thanhTraSo WHERE mucDo = 'nang' AND substr(luc,1,10) >= ?", tu);
  ban.B01 = { chiSo: [{ ten: 'Phát hiện mức NẶNG chưa xử lý (kỳ này)', giaTri: ttNang, nguong: '= 0', xau: ttNang > 0 }] };
  const baiViet = await so(db, 'SELECT COUNT(*) n FROM baiNoiDung');
  ban.B02 = { chiSo: [{ ten: 'Bài nội dung trong kho', giaTri: baiViet, nguong: 'tham chiếu', xau: false }] };
  const tlCho = await so(db, "SELECT COUNT(*) n FROM tailieu WHERE trangThai = 'cho'");
  ban.B03 = { chiSo: [{ ten: 'Tài liệu chờ duyệt', giaTri: tlCho, nguong: '= 0', xau: tlCho > 0 }] };
  const khoNhap = await so(db, "SELECT COUNT(*) n FROM khoGiaiPhapDaTri WHERE trangThai = 'nhap'");
  const khoQuaHan = await so(db, "SELECT COUNT(*) n FROM khoGiaiPhapDaTri WHERE trangThai = 'duyet' AND lucSoat < ?", Date.now() - 90 * 86400e3);
  ban.B04 = { chiSo: [
    { ten: 'Giải pháp nháp chờ duyệt', giaTri: khoNhap, nguong: '= 0', xau: khoNhap > 0 },
    { ten: 'Giải pháp quá 90 ngày chưa soát', giaTri: khoQuaHan, nguong: '= 0', xau: khoQuaHan > 0 }] };
  const chamDo = await so(db, "SELECT COUNT(*) n FROM soCham WHERE denLuc = 'DO' AND substr(ngay,1,10) >= ?", tu);
  const chamTong = await so(db, 'SELECT COUNT(*) n FROM soCham WHERE substr(ngay,1,10) >= ?', tu);
  ban.B05 = { chiSo: [
    { ten: 'Lượt chạm trong kỳ', giaTri: chamTong, nguong: 'tham chiếu', xau: false },
    { ten: 'Lượt chạm lúc đèn ĐỎ', giaTri: chamDo, nguong: '= 0', xau: chamDo > 0 }] };
  ban.B06 = { chiSo: [{ ten: 'Bài học hoàn thành trong kỳ', giaTri: baiHoc, nguong: 'tham chiếu', xau: false }] };
  const xoaTre = await so(db, 'SELECT COUNT(*) n FROM yeuCauXoa WHERE xoaTrongSo IS NULL AND hanXuLy < ?', hn);
  ban.B07 = { chiSo: [
    { ten: 'Yêu cầu xoá dữ liệu QUÁ HẠN xử lý', giaTri: xoaTre, nguong: '= 0', xau: xoaTre > 0 },
    { ten: 'Cổng bảo vệ hành động ra lệnh trong 24 giờ qua', giaTri: await so(db,
      "SELECT COUNT(*) n FROM audit WHERE viec IN ('ATAI_DIEU13','XOA_DU_LIEU','KHOA_KHOANG','CUU_HE_DONG_BANG') AND substr(luc,1,19) >= ?", c24),
      nguong: 'tham chiếu', xau: false }] };
  const tuyenTre = await so(db, "SELECT COUNT(*) n FROM tuyenDaTri WHERE trangThai = 'dangChay' AND lucSua < ?", Date.now() - 7 * 86400e3);
  ban.B08 = { chiSo: [{ ten: 'Tuyến dự án treo quá 7 ngày', giaTri: tuyenTre, nguong: '= 0', xau: tuyenTre > 0 }] };
  const dgXau = await so(db, 'SELECT COALESCE(SUM(xau),0) n FROM danhGiaDaTri');
  const dgTong = await so(db, 'SELECT COALESCE(SUM(tot + xau),0) n FROM danhGiaDaTri');
  ban.B09 = { chiSo: [
    { ten: 'Tỉ lệ câu AI bị chấm "chưa tốt"', giaTri: dgTong ? Math.round(dgXau * 1000 / dgTong) / 10 : 0, donVi: '%', nguong: '< 50%', xau: dgTong >= 5 && dgXau * 2 > dgTong }] };
  ban.B10 = { chiSo: [{ ten: 'Lá chắn đo ở CI mỗi PR — không đo được từ D1', giaTri: null, nguong: 'xem tools/do-16-he.js', xau: false }] };
  const thuTre = await so(db, "SELECT COUNT(*) n FROM phieuThu WHERE trangThai = 'choDuyet' AND substr(ghiLuc,1,10) < ?", c3);
  ban.B11 = { chiSo: [{ ten: 'Phiếu thu chờ duyệt quá 3 ngày', giaTri: thuTre, nguong: '= 0', xau: thuTre > 0 }] };
  ban.B12 = { chiSo: [{ ten: 'Nội dung tiếp thị: xem chỉ số B02 + thư đã gửi (sổ THU_)', giaTri: null, nguong: 'tham chiếu', xau: false }] };
  const luongTrong = (await db.prepare('SELECT COUNT(*) n FROM bangLuong WHERE trongBoQua > 30').first()) || { n: 0 };
  ban.B13 = { chiSo: [{ ten: 'Dòng lương có > 30% trọng số không đo được', giaTri: luongTrong.n || 0, nguong: '= 0', xau: (luongTrong.n || 0) > 0 }] };
  const henTre = await so(db, "SELECT COUNT(*) n FROM crmKhach WHERE henTiep IS NOT NULL AND henTiep < ? AND giaiDoan NOT IN ('roi')", hn);
  ban.B14 = { chiSo: [{ ten: 'Hẹn chạm khách QUÁ HẠN', giaTri: henTre, nguong: '= 0', xau: henTre > 0 }] };
  const vongKH = (await db.prepare('SELECT MAX(luc) n FROM vongKhoaHocDaTri').first()) || { n: 0 };
  const vongKHTre = !vongKH.n || vongKH.n < Date.parse(c7);
  ban.B15 = { chiSo: [{ ten: 'Vòng nhà khoa học chạy trong 7 ngày qua', giaTri: vongKH.n ? new Date(vongKH.n).toISOString().slice(0, 10) : 'chưa từng', nguong: 'có', xau: vongKHTre }] };
  ban.B16 = { chiSo: [{ ten: 'Nhà cung cấp ngoài: theo dõi ở sổ bộ não (soDaTri)', giaTri: null, nguong: 'tham chiếu', xau: false }] };
  Object.keys(ban).forEach(ma => {
    const cs = ban[ma].chiSo;
    ban[ma].danhGia = cs.every(c => c.giaTri === null) ? 'chua-do' : (cs.some(c => c.xau) ? 'can-nang-cap' : 'chuan');
  });

  return { ok: true, ngay, tu,
    tien: { thu, hoan, hoaHong, rong: thu - hoan - hoaHong, theoThang },
    chiPhi: { tong: chi, top: chiTop, luong, aiToken },
    giaTri: { baiHoc, wow, lenTang, khoDung, tuyenXong },
    congViec: { top: congViec, tongLuot, trungBinhNgay: Math.round(tongLuot / ngay) },
    ban,
    gioiHan: ['Ngưỡng xấu là ngưỡng vận hành do chủ hệ hiệu chỉnh, không phải chuẩn ngành.',
      'Đèn đỏ là để người nhìn vào — hệ không tự phạt, không tự đổi quy trình (AT5).',
      'B10 (lá chắn) đo ở CI, không đo được từ D1 — ghi thật.'] };
}
