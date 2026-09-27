/* ═══════════════════════════════════════════════════════════════
   GITA 365 · CỬA VÀO MỚI — CHẤM KPI PHÒNG KẾ TOÁN – TÀI CHÍNH

   Định nghĩa các thước nằm ở kho: G.TC_KPI (TC-KP-01). Tệp này là chỗ
   ĐO chúng.

   ══ HAI BẢN, VÀ VÌ SAO CHÚNG PHẢI KHỚP ══

   Kho giữ ĐỊNH NGHĨA — tên thước, ngưỡng đạt, trọng số, cặp đối trọng.
   Máy chủ giữ PHÉP ĐO — câu lệnh chạy trên sổ thật.

   Máy chủ không đọc được kho đã mã hoá nên nó không tự biết ngưỡng là
   bao nhiêu. Nó trả về SỐ ĐO THÔ kèm mã thước; màn hình ghép số ấy với
   định nghĩa trong kho để ra điểm.

   Chia thế có một cái giá và một cái được. Giá: hai chỗ phải khớp tên
   thước, và bộ kiểm phải đối chiếu. Được: ngưỡng đổi được mà không phải
   phát hành lại máy chủ, và ngưỡng là thứ chủ hệ sẽ đổi.

   ══ KHÔNG THƯỚC NÀO DO NGƯỜI TỰ KHAI ══

   Mỗi số ở đây là một câu lệnh chạy trên sổ. Thước tự khai là thước đo
   lòng trung thực chứ không đo công việc — và nếu đã đo được lòng
   trung thực thì đã không cần KPI.
   ═══════════════════════════════════════════════════════════════ */

import { Kho } from './nen.js';
import { dungKy, soatChot, baoCaoKeToan } from './bao-cao.js';
import { doiSoat } from './tai-chinh.js';
import { quyenCua } from './chi-tieu.js';

const BAC = {R01:1,R02:2,R03:3,R04:4,R05:5,R06:6,R07:7,R08:8,
             R09:9,R10:10,R11:11,R12:12,R13:13,R14:14,R15:15};

const NGAY_TREO = 3;        /* phiếu / khoản chi chờ duyệt quá bao nhiêu ngày */
const NGAY_PHIEU_KHONG_TIEN = 7;

/** Tỷ lệ phần trăm, làm tròn một chữ số. Mẫu bằng 0 thì trả null chứ
    KHÔNG trả 100: "không có gì để đo" và "đo được và đạt tuyệt đối" là
    hai chuyện khác nhau, và gộp chúng là cho điểm tuyệt đối cho một
    tháng không ai làm gì. */
const tyLe = (tren, duoi) =>
  duoi ? Math.round(tren / duoi * 1000) / 10 : null;

/* ═══════════════ CHẤM MỘT KỲ ═══════════════ */
export async function chamKpiTaiChinh(y, env, db, hoSo) {
  const lv = BAC[hoSo.role] || 99;
  const q = await quyenCua(db, hoSo.u);
  if (lv > 3 && !q.keToanTruong && !q.keToanThu && !q.keToanChi)
    return {ok: false, code: 'NOPERM',
      error: 'Chỉ R01–R03 hoặc người của phòng tài chính xem được bảng KPI.'};

  const k = dungKy(String(y.loai || 'thang'),
    String(y.moc || new Date(Date.now() + 7 * 3600e3).toISOString().slice(0, 10)));
  if (!k) return {ok: false, error: 'Kỳ chấm không hợp lệ.'};

  const treo = new Date(Date.now() - NGAY_TREO * 86400e3).toISOString();

  /* ══════════ ĐẦU THU ══════════ */

  const ck = await db.prepare(
    "SELECT COUNT(*) so, SUM(CASE WHEN maThamChieu IS NOT NULL AND maThamChieu <> '' " +
    '  THEN 1 ELSE 0 END) coMa ' +
    "FROM phieuThu WHERE hinhThuc = 'chuyenKhoan' AND trangThai <> 'huy' " +
    'AND ghiLuc >= ? AND ghiLuc <= ?'
  ).bind(k.tuLuc, k.denLuc).first();

  const daKhop = await db.prepare(
    "SELECT COUNT(*) so FROM phieuThu p WHERE p.hinhThuc = 'chuyenKhoan' " +
    "AND p.trangThai <> 'huy' AND p.ghiLuc >= ? AND p.ghiLuc <= ? " +
    'AND p.id IN (SELECT idPhieuThu FROM giaoDichNganHang WHERE idPhieuThu IS NOT NULL)'
  ).bind(k.tuLuc, k.denLuc).first();

  const vaoKhongPhieu = await db.prepare(
    "SELECT COUNT(*) so FROM giaoDichNganHang WHERE huong = 'vao' " +
    'AND idPhieuThu IS NULL AND luc >= ? AND luc <= ?'
  ).bind(k.tuLuc, k.denLuc).first();

  const phieuTreo = await db.prepare(
    "SELECT COUNT(*) so FROM phieuThu WHERE trangThai = 'choDuyet' " +
    'AND ghiLuc >= ? AND ghiLuc <= ? AND ghiLuc < ?'
  ).bind(k.tuLuc, k.denLuc, treo).first();

  /* Nhà quá hạn TRONG KỲ có được nhắc trong kỳ không. Đếm theo NHÀ chứ
     không theo kỳ thu: một nhà nợ ba kỳ thì gọi một lần là đủ, đếm ba
     lần là bắt người ta gọi ba lần cho cùng một câu chuyện. */
  /* Trừ miễn giảm y như dsQuaHan trừ. Không trừ thì một nhà được giảm
     hết vẫn tính là quá hạn, và thước KT-T5 bắt kế toán đi gọi một nhà
     không còn nợ gì. */
  const quaHanNha = await db.prepare(
    'SELECT COUNT(DISTINCT maKhachHang) so FROM (' +
    '  SELECT k.maKhachHang, k.phaiThu, ' +
    "    COALESCE(SUM(CASE WHEN p.trangThai='daDuyet' THEN p.soTien END),0) daThu, " +
    "    (SELECT COALESCE(SUM(m.soTien),0) FROM mienGiam m " +
    "      WHERE m.idKy = k.id AND m.trangThai='daDuyet') giam " +
    '  FROM kyThu k LEFT JOIN phieuThu p ON p.idKy = k.id ' +
    '  WHERE k.hanLuc IS NOT NULL AND k.hanLuc < ? GROUP BY k.id' +
    ') WHERE daThu + giam < phaiThu'
  ).bind(k.denLuc).first();

  const daNhac = await db.prepare(
    'SELECT COUNT(DISTINCT n.maKhachHang) so FROM nhacThu n ' +
    'WHERE n.luc >= ? AND n.luc <= ?'
  ).bind(k.tuLuc, k.denLuc).first();

  /* ══════════ ĐẦU CHI ══════════ */

  const chi = await db.prepare(
    "SELECT COUNT(*) so, SUM(CASE WHEN coHoaDon = 1 THEN 1 ELSE 0 END) coHd " +
    "FROM chiPhi WHERE trangThai = 'daDuyet' AND ngayChi >= ? AND ngayChi <= ?"
  ).bind(k.tuLuc, k.denLuc).first();

  const chiTreo = await db.prepare(
    "SELECT COUNT(*) so FROM chiPhi WHERE trangThai = 'choDuyet' " +
    'AND ngayChi >= ? AND ngayChi <= ? AND deXuatLuc < ?'
  ).bind(k.tuLuc, k.denLuc, treo).first();

  /* Khoản ĐÃ DUYỆT mà thiếu chứng từ của nấc nó. Cổng chứng từ nằm ở
     lúc GHI, nên dòng nào lọt qua được là dòng vào sổ bằng một đường
     khác — và nó phải hiện lên đây. Ngưỡng nấc gõ theo giá gói, khớp
     với NAC_THANG ở chi-tieu.js. */
  const chiThieu = await db.prepare(
    "SELECT COUNT(*) so FROM chiPhi WHERE trangThai = 'daDuyet' " +
    'AND ngayChi >= ? AND ngayChi <= ? AND (' +
    '  (soTien >= 10000000 AND coHoaDon = 0) OR ' +
    '  (soTien >= 30000000 AND soBaoGia < 2) OR ' +
    "  (soTien >= 50000000 AND (soHopDong IS NULL OR soHopDong = '')))"
  ).bind(k.tuLuc, k.denLuc).first();

  const ket = await db.prepare(
    'SELECT COUNT(*) so, ' +
    '  SUM(CASE WHEN (chenh > 0.5 OR chenh < -0.5) AND ' +
    "    (lyDo IS NULL OR lyDo = '') THEN 1 ELSE 0 END) lechKhongLyDo " +
    'FROM chotKet WHERE ngay >= ? AND ngay <= ?'
  ).bind(k.tuNgay, k.denNgay).first();

  const soNgayTrongKy = Math.round(
    (new Date(k.denLuc).getTime() - new Date(k.tuLuc).getTime()) / 86400e3) + 1;

  /* ══════════ CẢ CUỐN SỔ — KẾ TOÁN TRƯỞNG ══════════ */

  const chot = await db.prepare(
    "SELECT COUNT(*) so FROM soChot WHERE loai = 'tuan' AND tuNgay >= ? AND denNgay <= ?"
  ).bind(k.tuNgay, k.denNgay).first();

  /* Số tuần ĐÃ ĐÓNG HẲN trong kỳ — chỉ những tuần ấy mới chốt được, nên
     chỉ những tuần ấy mới đếm vào mẫu số. Đếm cả tuần còn đang chạy là
     chấm người ta trượt vì một việc chưa tới lúc làm. */
  const nayVN = new Date(Date.now() + 7 * 3600e3).toISOString().slice(0, 10);
  let tuanDaDong = 0;
  {
    const d0 = new Date(k.tuNgay + 'T00:00:00Z').getTime();
    const d1 = Math.min(new Date(k.denNgay + 'T00:00:00Z').getTime(),
      new Date(nayVN + 'T00:00:00Z').getTime() - 86400e3);
    for (let t = d0; t <= d1; t += 7 * 86400e3) tuanDaDong++;
    if (tuanDaDong < 0) tuanDaDong = 0;
  }

  const dcTrongKy = await db.prepare(
    'SELECT COUNT(DISTINCT kyBiAnhHuong) so FROM dieuChinh WHERE luc >= ? AND luc <= ?'
  ).bind(k.tuLuc, k.denLuc).first();

  const phieuKhongTien = await db.prepare(
    "SELECT COUNT(*) so FROM phieuThu p WHERE p.hinhThuc = 'chuyenKhoan' " +
    "AND p.trangThai <> 'huy' AND p.ghiLuc >= ? AND p.ghiLuc <= ? " +
    'AND p.ghiLuc < ? ' +
    'AND p.id NOT IN (SELECT idPhieuThu FROM giaoDichNganHang ' +
    '  WHERE idPhieuThu IS NOT NULL)'
  ).bind(k.tuLuc, k.denLuc,
    new Date(Date.now() - NGAY_PHIEU_KHONG_TIEN * 86400e3).toISOString()).first();

  /* ── BA THƯỚC CỦA KẾ TOÁN TRƯỞNG CHẠY PHÉP SOI NẶNG ──

     Vân tay của từng kỳ đã chốt, sáu câu hỏi đối soát, hai đẳng thức
     cân đối. Gọi thẳng chính những hàm mà người dùng gọi, không viết
     lại phép đo ở đây: viết lại là dựng bản thứ hai của một sự thật, và
     hai bản thì sẽ có ngày bảng KPI nói sổ sạch trong khi bản đối soát
     nói ngược lại.

     Ba lượt gọi này mỗi lượt ghi một dòng nhật ký, và đó là đúng: bảng
     KPI chạy nghĩa là ba phép soi ấy vừa chạy thật. */
  const soatC = await soatChot({soKy: 60}, env, db, hoSo);
  const soatD = await doiSoat({}, env, db, hoSo);
  const banKe = await baoCaoKeToan({loai: k.loai, moc: k.tuNgay}, env, db, hoSo);

  await Kho.ghiNhatKy(db, {uid: hoSo.uid, username: hoSo.u, viec: 'KPI_TAICHINH',
    doiTuong: k.ky});

  /* Trả về SỐ ĐO THÔ kèm mã thước. Ngưỡng và trọng số nằm ở kho —
     xem chú giải đầu tệp về vì sao chia hai chỗ. */
  return {ok: true, ky: k.ky, loai: k.loai, tuNgay: k.tuNgay, denNgay: k.denNgay,

    keToanThu: {
      'KT-T1': tyLe(Number(daKhop.so), Number(ck.so)),
      'KT-T2': Number(vaoKhongPhieu.so),
      'KT-T3': tyLe(Number(ck.coMa || 0), Number(ck.so)),
      'KT-T4': Number(phieuTreo.so),
      'KT-T5': tyLe(Number(daNhac.so), Number((quaHanNha || {}).so || 0))
    },

    keToanChi: {
      'KT-C1': tyLe(Number(chi.coHd || 0), Number(chi.so)),
      'KT-C2': Number(chiTreo.so),
      'KT-C3': Number(chiThieu.so),
      'KT-C4': Number(ket.lechKhongLyDo || 0),
      'KT-C5': tyLe(Number(ket.so), soNgayTrongKy)
    },

    keToanTruong: {
      'KT-Tr1': tuanDaDong ? tyLe(Number(chot.so), tuanDaDong) : null,
      /* Kỳ đã chốt mà VÂN TAY đã đổi, và chưa có bút toán nào giải
         thích. Có bút toán thì đó là một chỗ đã có người xử lý; không
         có thì là một chỗ chưa ai biết. */
      'KT-Tr2': (soatC.lech || []).filter(x => !x.daGiaiThich).length,
      'KT-Tr3': Number(soatD.soLech || 0),
      /* Cân thì 100, lệch thì 0 — không có bậc giữa. Một bản kê lệch
         nửa đồng cũng là một bản kê chưa dùng được. */
      'KT-Tr4': (banKe.canDoi || {}).can ? 100 : 0,
      'KT-Tr5': Number(phieuKhongTien.so)
    },

    lechConLai: {
      kyDaChotBiDong: (soatC.lech || []).map(x => ({ky: x.ky, chenh: x.chenh,
        daGiaiThich: !!x.daGiaiThich})),
      doiSoat: (soatD.lech || []).map(x => ({ma: x.ma, viec: x.viec, so: x.so})),
      lechCongNo: (banKe.canDoi || {}).lechCongNo,
      lechHoaHong: (banKe.canDoi || {}).lechHoaHong
    },

    vi: 'Số đo THÔ. Ngưỡng đạt và trọng số nằm ở kho (TC-KP-01); màn hình ghép ' +
        'hai bên lại để ra điểm. Máy chủ không đọc được kho đã mã hoá nên nó ' +
        'không tự biết ngưỡng — và đó là chủ ý: ngưỡng đổi được mà không phải ' +
        'phát hành lại máy chủ.',
    soTuanDaDong: tuanDaDong,
    soKyDaDong: Number(dcTrongKy.so)};
}
