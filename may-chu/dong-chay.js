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

   ══ MỘT CHỈ SỐ HỎNG KHÔNG ĐƯỢC KÉO SẬP CẢ MÀN (sửa 10/2026) ══
   Bản đầu chạy ~35 câu NỐI TIẾP, câu nào ném là cả cửa ném → 500. Trên
   D1 thật hai thứ làm nó ném: (1) bảng thêm sau chưa có trên D1 cũ —
   vaLuocDo chỉ THÊM CỘT, không dựng bảng; (2) lọc `substr(cot,1,10) >= ?`
   không dùng được chỉ mục, nên bấm "365 ngày" là quét trọn sổ audit một
   năm. Ba lượt 500 liền thì máy khách NGẮT cả ứng dụng 30 giây — người
   dùng thấy "máy chủ không trả lời" trong khi máy chủ vẫn chạy.
   Nay: mỗi chỉ số chạy RIÊNG trong `doRieng`, hỏng thì giá trị là null
   và tên chỉ số vào `chuaDo` (KHÔNG kèm lời lỗi — lời lỗi CSDL kể tên
   bảng, tên cột). Lọc ngày viết `cot >= ?` — cùng nghĩa với substr trên
   chuỗi ISO (tu dài 10 ký tự), nhưng đi được chỉ mục. Các câu chạy song
   song thay vì nối tiếp.
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

  /* Mỗi chỉ số một lời hứa riêng: hỏng thì null + ghi tên vào chuaDo.
     Lời lỗi chỉ vào nhật ký máy chủ, không ra máy khách. */
  const chuaDo = [];
  const doRieng = (ten, fn) => fn().catch(e => {
    chuaDo.push(ten);
    console.error('DONG_CHAY_CHI_SO_HONG', ten, String(e && e.message || e).slice(0, 160));
    return null;
  });

  const v = {};
  const viec = {
    /* ── DÒNG TIỀN ── */
    thu: ['Thu đã duyệt', () => so(db, "SELECT COALESCE(SUM(soTien),0) n FROM phieuThu WHERE trangThai = 'daDuyet' AND ghiLuc >= ?", tu)],
    hoan: ['Hoàn tiền', () => so(db, "SELECT COALESCE(SUM(soTien),0) n FROM hoanTien WHERE trangThai = 'daDuyet' AND deXuatLuc >= ?", tu)],
    hoaHong: ['Hoa hồng đã trả', () => so(db, "SELECT COALESCE(SUM(soTien),0) n FROM hoaHongTra WHERE trangThai = 'daTra' AND traLuc >= ?", tu)],
    theoThang: ['Thu theo tháng', () => dsach(db,
      "SELECT substr(ghiLuc,1,7) thang, COALESCE(SUM(soTien),0) n FROM phieuThu WHERE trangThai = 'daDuyet' GROUP BY thang ORDER BY thang DESC LIMIT 6")],
    /* ── DÒNG CHI PHÍ ── */
    chi: ['Chi phí vận hành', () => so(db, "SELECT COALESCE(SUM(soTien),0) n FROM chiPhi WHERE trangThai = 'daDuyet' AND ngayChi >= ?", tu)],
    chiTop: ['Khoản chi lớn nhất', () => dsach(db,
      "SELECT khoanMuc, COALESCE(SUM(soTien),0) n FROM chiPhi WHERE trangThai = 'daDuyet' AND ngayChi >= ? GROUP BY khoanMuc ORDER BY n DESC LIMIT 5", tu)],
    luong: ['Lương kỳ gần nhất', async () => (await db.prepare('SELECT ky, COALESCE(SUM(luongCung + phanKpi),0) n, COUNT(*) soNguoi FROM bangLuong GROUP BY ky ORDER BY ky DESC LIMIT 1').first()) || null],
    aiToken: ['Token AI', () => dsach(db, 'SELECT ncc, SUM(vao + ra) n FROM soTokenDaTri WHERE ngay >= ? GROUP BY ncc ORDER BY n DESC', tu)],
    /* ── DÒNG GIÁ TRỊ (thứ khách nhận được) ── */
    baiHoc: ['Bài học hoàn thành', () => so(db, 'SELECT COUNT(*) n FROM baiHocHoanThanh WHERE ngay >= ?', tu)],
    wow: ['Lượt WOW ghi sổ', () => so(db, "SELECT COUNT(*) n FROM soCham WHERE kieu = 'wow' AND ngay >= ?", tu)],
    lenTang: ['Lượt lên tầng', () => so(db, 'SELECT COUNT(*) n FROM lichSuTang WHERE denTang > COALESCE(tuTang,0) AND luc >= ?', tu)],
    khoDung: ['Kho giải pháp đã dùng', () => so(db, 'SELECT COALESCE(SUM(dung),0) n FROM khoGiaiPhapDaTri')],
    tuyenXong: ['Tuyến dự án hoàn tất', () => so(db, "SELECT COUNT(*) n FROM tuyenDaTri WHERE trangThai = 'xong'")],
    /* ── DÒNG CÔNG VIỆC (ai làm gì, bao nhiêu) ── */
    congViec: ['Việc nhiều nhất', () => dsach(db,
      'SELECT viec, COUNT(*) n FROM audit WHERE luc >= ? GROUP BY viec ORDER BY n DESC LIMIT 10', tu)],
    tongLuot: ['Tổng lượt ghi sổ', () => so(db, 'SELECT COUNT(*) n FROM audit WHERE luc >= ?', tu)],
    /* ── TÍN HIỆU 16 BAN ── */
    ttNang: ['B01 · mức NẶNG', () => so(db, "SELECT COUNT(*) n FROM thanhTraSo WHERE mucDo = 'nang' AND luc >= ?", tu)],
    baiViet: ['B02 · bài nội dung', () => so(db, 'SELECT COUNT(*) n FROM baiNoiDung')],
    tlCho: ['B03 · tài liệu chờ', () => so(db, "SELECT COUNT(*) n FROM tailieu WHERE trangThai = 'cho'")],
    khoNhap: ['B04 · giải pháp nháp', () => so(db, "SELECT COUNT(*) n FROM khoGiaiPhapDaTri WHERE trangThai = 'nhap'")],
    khoQuaHan: ['B04 · giải pháp quá hạn soát', () => so(db, "SELECT COUNT(*) n FROM khoGiaiPhapDaTri WHERE trangThai = 'duyet' AND lucSoat < ?", Date.now() - 90 * 86400e3)],
    chamDo: ['B05 · chạm lúc đèn ĐỎ', () => so(db, "SELECT COUNT(*) n FROM soCham WHERE denLuc = 'DO' AND ngay >= ?", tu)],
    chamTong: ['B05 · lượt chạm', () => so(db, 'SELECT COUNT(*) n FROM soCham WHERE ngay >= ?', tu)],
    xoaTre: ['B07 · yêu cầu xoá quá hạn', () => so(db, 'SELECT COUNT(*) n FROM yeuCauXoa WHERE xoaTrongSo IS NULL AND hanXuLy < ?', hn)],
    cong24: ['B07 · cổng bảo vệ 24 giờ', () => so(db,
      "SELECT COUNT(*) n FROM audit WHERE viec IN ('ATAI_DIEU13','XOA_DU_LIEU','KHOA_KHOANG','CUU_HE_DONG_BANG') AND luc >= ?", c24)],
    tuyenTre: ['B08 · tuyến treo', () => so(db, "SELECT COUNT(*) n FROM tuyenDaTri WHERE trangThai = 'dangChay' AND lucSua < ?", Date.now() - 7 * 86400e3)],
    dgXau: ['B09 · câu AI chưa tốt', () => so(db, 'SELECT COALESCE(SUM(xau),0) n FROM danhGiaDaTri')],
    dgTong: ['B09 · câu AI đã chấm', () => so(db, 'SELECT COALESCE(SUM(tot + xau),0) n FROM danhGiaDaTri')],
    thuTre: ['B11 · phiếu thu chờ quá 3 ngày', () => so(db, "SELECT COUNT(*) n FROM phieuThu WHERE trangThai = 'choDuyet' AND ghiLuc < ?", c3)],
    luongTrong: ['B13 · lương trọng số không đo', () => so(db, 'SELECT COUNT(*) n FROM bangLuong WHERE trongBoQua > 30')],
    henTre: ['B14 · hẹn chạm quá hạn', () => so(db, "SELECT COUNT(*) n FROM crmKhach WHERE henTiep IS NOT NULL AND henTiep < ? AND giaiDoan NOT IN ('roi')", hn)],
    vongKH: ['B15 · vòng nhà khoa học', async () => { const r = await db.prepare('SELECT MAX(luc) n FROM vongKhoaHocDaTri').first(); return (r && r.n) || 0; }]
  };
  await Promise.all(Object.keys(viec).map(k => doRieng(viec[k][0], viec[k][1]).then(x => { v[k] = x; })));

  /* null = chưa đo được. Phép trừ/so chỉ chạy khi đủ số — một số thiếu
     không được đọc ra như số 0. */
  const coDu = (...a) => a.every(x => x !== null && x !== undefined);
  const xauKhi = (x, dk) => x !== null && dk;

  const ban = {};
  ban.B01 = { chiSo: [{ ten: 'Phát hiện mức NẶNG chưa xử lý (kỳ này)', giaTri: v.ttNang, nguong: '= 0', xau: xauKhi(v.ttNang, v.ttNang > 0) }] };
  ban.B02 = { chiSo: [{ ten: 'Bài nội dung trong kho', giaTri: v.baiViet, nguong: 'tham chiếu', xau: false }] };
  ban.B03 = { chiSo: [{ ten: 'Tài liệu chờ duyệt', giaTri: v.tlCho, nguong: '= 0', xau: xauKhi(v.tlCho, v.tlCho > 0) }] };
  ban.B04 = { chiSo: [
    { ten: 'Giải pháp nháp chờ duyệt', giaTri: v.khoNhap, nguong: '= 0', xau: xauKhi(v.khoNhap, v.khoNhap > 0) },
    { ten: 'Giải pháp quá 90 ngày chưa soát', giaTri: v.khoQuaHan, nguong: '= 0', xau: xauKhi(v.khoQuaHan, v.khoQuaHan > 0) }] };
  ban.B05 = { chiSo: [
    { ten: 'Lượt chạm trong kỳ', giaTri: v.chamTong, nguong: 'tham chiếu', xau: false },
    { ten: 'Lượt chạm lúc đèn ĐỎ', giaTri: v.chamDo, nguong: '= 0', xau: xauKhi(v.chamDo, v.chamDo > 0) }] };
  ban.B06 = { chiSo: [{ ten: 'Bài học hoàn thành trong kỳ', giaTri: v.baiHoc, nguong: 'tham chiếu', xau: false }] };
  ban.B07 = { chiSo: [
    { ten: 'Yêu cầu xoá dữ liệu QUÁ HẠN xử lý', giaTri: v.xoaTre, nguong: '= 0', xau: xauKhi(v.xoaTre, v.xoaTre > 0) },
    { ten: 'Cổng bảo vệ hành động ra lệnh trong 24 giờ qua', giaTri: v.cong24, nguong: 'tham chiếu', xau: false }] };
  ban.B08 = { chiSo: [{ ten: 'Tuyến dự án treo quá 7 ngày', giaTri: v.tuyenTre, nguong: '= 0', xau: xauKhi(v.tuyenTre, v.tuyenTre > 0) }] };
  const dgDu = coDu(v.dgXau, v.dgTong);
  ban.B09 = { chiSo: [{ ten: 'Tỉ lệ câu AI bị chấm "chưa tốt"',
    giaTri: !dgDu ? null : (v.dgTong ? Math.round(v.dgXau * 1000 / v.dgTong) / 10 : 0), donVi: '%', nguong: '< 50%',
    xau: dgDu && v.dgTong >= 5 && v.dgXau * 2 > v.dgTong }] };
  ban.B10 = { chiSo: [{ ten: 'Lá chắn đo ở CI mỗi PR — không đo được từ D1', giaTri: null, nguong: 'xem tools/do-16-he.js', xau: false }] };
  ban.B11 = { chiSo: [{ ten: 'Phiếu thu chờ duyệt quá 3 ngày', giaTri: v.thuTre, nguong: '= 0', xau: xauKhi(v.thuTre, v.thuTre > 0) }] };
  ban.B12 = { chiSo: [{ ten: 'Nội dung tiếp thị: xem chỉ số B02 + thư đã gửi (sổ THU_)', giaTri: null, nguong: 'tham chiếu', xau: false }] };
  ban.B13 = { chiSo: [{ ten: 'Dòng lương có > 30% trọng số không đo được', giaTri: v.luongTrong, nguong: '= 0', xau: xauKhi(v.luongTrong, v.luongTrong > 0) }] };
  ban.B14 = { chiSo: [{ ten: 'Hẹn chạm khách QUÁ HẠN', giaTri: v.henTre, nguong: '= 0', xau: xauKhi(v.henTre, v.henTre > 0) }] };
  ban.B15 = { chiSo: [{ ten: 'Vòng nhà khoa học chạy trong 7 ngày qua',
    giaTri: v.vongKH === null ? null : (v.vongKH ? new Date(v.vongKH).toISOString().slice(0, 10) : 'chưa từng'), nguong: 'có',
    xau: v.vongKH !== null && (!v.vongKH || v.vongKH < Date.parse(c7)) }] };
  ban.B16 = { chiSo: [{ ten: 'Nhà cung cấp ngoài: theo dõi ở sổ bộ não (soDaTri)', giaTri: null, nguong: 'tham chiếu', xau: false }] };
  Object.keys(ban).forEach(ma => {
    const cs = ban[ma].chiSo;
    ban[ma].danhGia = cs.every(c => c.giaTri === null) ? 'chua-do' : (cs.some(c => c.xau) ? 'can-nang-cap' : 'chuan');
  });

  return { ok: true, ngay, tu, chuaDo,
    tien: { thu: v.thu, hoan: v.hoan, hoaHong: v.hoaHong,
      rong: coDu(v.thu, v.hoan, v.hoaHong) ? v.thu - v.hoan - v.hoaHong : null, theoThang: v.theoThang || [] },
    chiPhi: { tong: v.chi, top: v.chiTop || [], luong: v.luong, aiToken: v.aiToken },
    giaTri: { baiHoc: v.baiHoc, wow: v.wow, lenTang: v.lenTang, khoDung: v.khoDung, tuyenXong: v.tuyenXong },
    congViec: { top: v.congViec || [], tongLuot: v.tongLuot,
      trungBinhNgay: v.tongLuot === null ? null : Math.round(v.tongLuot / ngay) },
    ban,
    gioiHan: ['Ngưỡng xấu là ngưỡng vận hành do chủ hệ hiệu chỉnh, không phải chuẩn ngành.',
      'Đèn đỏ là để người nhìn vào — hệ không tự phạt, không tự đổi quy trình (AT5).',
      'B10 (lá chắn) đo ở CI, không đo được từ D1 — ghi thật.'] };
}
