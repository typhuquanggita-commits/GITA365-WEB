/* ═══════════════════════════════════════════════════════════════
   GITA 365 — MẠCH TỰ SOÁT VIỆC KẸT  (9/10/2026)

   Chủ hệ: "check kho openrig để hoàn thiện hệ thống, tạo một cỗ máy tối ưu
   sức mạnh nội lực, giảm phụ thuộc bên ngoài, tự động hoá 95%".

   OpenRig (github.com/mvschwarz/openrig, Apache-2.0) là phần mềm chạy cả
   một đội AI viết mã trên máy tính của lập trình viên — cần Node, tmux và
   tài khoản Claude Code/Codex. Không có gì trong đó chạy được trong Worker
   hay hợp với người không dùng dòng lệnh, nên ở đây không chép một dòng mã
   nào. Thứ đáng lấy là MỘT ý tưởng nền của nó, và GITA đang thiếu đúng ý ấy:

     Một đội làm việc hỏng không phải vì ai làm sai, mà vì một việc RƠI
     giữa hai người — đã chuyển đi nhưng chưa ai nhận, đang chờ nhưng không
     ai hẹn ngày quay lại. OpenRig gọi đó là "PARKED": một cái gậy tiếp sức
     bị đánh rơi. Nó phân biệt với "HELD": dừng CÓ CHỦ Ý, có người cầm và có
     hẹn đánh thức. Và nó coi "KHÔNG BIẾT" là một câu trả lời trung thực —
     không biết thì nói không biết, đừng đoán là ổn.

   GITA có hơn chục hàng đợi việc: phiếu thu chờ xác nhận, khoản chi chờ
   duyệt, hoàn tiền, miễn giảm, tin tài chính, bản nháp chờ ba chữ ký, phát
   sinh chưa ai soạn, đề án tài liệu, yêu cầu xoá dữ liệu có hạn luật 30
   ngày, khách mới chưa có Tư vấn, hẹn CRM quá hạn, đề xuất nâng cấp chưa
   ký, hộp thông báo chưa đọc, việc quay phim. Mỗi hàng có màn riêng — và
   chưa có chỗ nào trả lời câu "hôm nay có việc nào đang nằm im không ai
   cầm không". Một sự thật CÓ mà không đọc ra được thì trên thực tế là KHÔNG
   CÓ.

   ══ BỐN LUẬT ══
   1. TÍNH LÚC ĐỌC, KHÔNG LƯU. Không có cột "kẹt" nào trong bảng nào — cùng
      luật cột `conHan` · cột `den`: một cột tóm tắt hoặc bị gõ đè, hoặc cũ
      đi lặng lẽ.
   2. KẸT KHÁC CHỜ. Có người cầm VÀ có hạn còn sống = chờ có chủ (đúng). Quá
      hạn, hoặc không ai cầm, hoặc nằm im quá ngưỡng = kẹt.
   3. KHÔNG BIẾT LÀ MỘT GIÁ TRỊ. Câu truy vấn hỏng thì hàng ấy "không biết",
      không phải "0 việc kẹt". Bảng chưa tồn tại thì "chưa dùng" — nói đúng
      thế, không gộp vào "ổn".
   4. MÁY BÁO, NGƯỜI LÀM. Mạch này CHỈ ĐỌC. Bộ não vận hành dùng nó để ghi
      MỘT dòng vào hộp thông báo mỗi ngày; nó không tự duyệt, tự xoá, tự
      giao việc thay ai. Một cỗ máy tự gỡ việc kẹt bằng cách tự quyết là
      đúng cái hệ này cấm (ba chữ ký · không tự cấp quyền).
   ═══════════════════════════════════════════════════════════════ */
'use strict';

import { BAC } from './vai-tro.js';

const GIO = 3600e3;
const ngayVN = ms => new Date((ms || Date.now()) + 7 * GIO).toISOString().slice(0, 10);

/* Mỗi hàng đợi khai: câu SQL trả các cột id · tomTat · chu · tu · han.
   `tu` là lúc việc bắt đầu nằm ở chỗ hiện tại; `han` là hẹn đánh thức
   (hạn luật, hạn giao việc) nếu có; `chu` là người đang cầm nếu biết.
   `nguong` (giờ): nằm im quá chừng ấy mà không có hạn sống → kẹt.
   `cua`: màn xử lý — để người đọc đi thẳng tới chỗ gỡ. */
export const HANG_DOI = [
  { ma: 'PHIEU_THU', ten: 'Phiếu thu chờ xác nhận', cua: 'phong-tai-chinh', nguong: 48,
    vi: 'Khách đã trả mà sổ chưa ghi nhận là mất lòng khách.',
    sql: "SELECT id, maKhachHang AS tomTat, NULL AS chu, ghiLuc AS tu, NULL AS han FROM phieuThu WHERE trangThai = 'choDuyet'" },
  { ma: 'CHI_PHI', ten: 'Khoản chi chờ duyệt', cua: 'phong-tai-chinh', nguong: 72,
    vi: 'Người đề xuất đang chờ tiền để làm việc.',
    sql: "SELECT id, khoanMuc AS tomTat, NULL AS chu, deXuatLuc AS tu, NULL AS han FROM chiPhi WHERE trangThai = 'choDuyet'" },
  { ma: 'HOAN_TIEN', ten: 'Hoàn tiền chờ duyệt', cua: 'phong-tai-chinh', nguong: 72,
    vi: 'Một gia đình đang chờ tiền của họ.',
    sql: "SELECT id, maKhachHang AS tomTat, NULL AS chu, deXuatLuc AS tu, NULL AS han FROM hoanTien WHERE trangThai = 'choDuyet'" },
  { ma: 'MIEN_GIAM', ten: 'Miễn giảm chờ duyệt', cua: 'phong-tai-chinh', nguong: 72,
    vi: 'Kỳ thu của nhà ấy đang treo theo quyết định này.',
    sql: "SELECT id, maKhachHang AS tomTat, NULL AS chu, deXuatLuc AS tu, NULL AS han FROM mienGiam WHERE trangThai = 'choDuyet'" },
  { ma: 'TIN_TAI_CHINH', ten: 'Tin tài chính chưa xử lý', cua: 'toan-canh-tc', nguong: 24,
    vi: 'Tin có màu phải có người và có hạn.',
    sql: "SELECT id, tieuDe AS tomTat, giaoCho AS chu, luc AS tu, hanXuLy AS han FROM tinTaiChinh WHERE trangThai = 'moi'" },
  { ma: 'BAN_NHAP', ten: 'Bản nháp chờ ba chữ ký', cua: 'tu-hoan-thien', nguong: 168,
    vi: 'Nội dung đã soạn mà chưa ai ký thì gia đình không nhận được.',
    sql: "SELECT id, tieuDe AS tomTat, 'chuỗi ký ' || loaiDuyet AS chu, soanLuc AS tu, NULL AS han FROM banNhapKho WHERE trangThai = 'nhap'" },
  { ma: 'PHAT_SINH', ten: 'Phát sinh chưa ai soạn', cua: 'tu-hoan-thien', nguong: 168,
    vi: 'Một lỗ của kho đã ghi nhận mà chưa có bản nháp nào lấp.',
    sql: 'SELECT p.id, p.loai AS tomTat, NULL AS chu, p.luc AS tu, NULL AS han FROM phatSinh p ' +
      'WHERE NOT EXISTS (SELECT 1 FROM banNhapKho b WHERE b.phatSinhId = p.id)' },
  { ma: 'DE_AN_TAI_LIEU', ten: 'Đề án tài liệu', cua: 'tu-hoan-thien', nguong: 72,
    vi: 'Đề án dừng hoặc không ai đẩy tiếp thì kho tài liệu không lớn thêm.',
    /* Đề án đang dừng: hạn coi như đã qua (cần Super Admin). Đề án tự chạy: có
       chủ là bộ não, hạn là lượt kế tiếp. Còn lại: người đặt phải bấm tiếp. */
    sql: "SELECT id, chuDe AS tomTat, CASE WHEN tuChay = 1 THEN 'bộ não vận hành' ELSE taoBoi END AS chu, suaLuc AS tu, " +
      "CASE WHEN trangThai = 'dung' THEN suaLuc END AS han FROM deAnTaiLieu WHERE trangThai IN ('kienTruc','viet','dongGoi','dung')" },
  { ma: 'XOA_DU_LIEU', ten: 'Yêu cầu xoá dữ liệu (hạn luật 30 ngày)', cua: 'phap-ly-rui-ro', nguong: 720,
    vi: 'Luật 91/2025: quá hạn là vi phạm quyền của gia đình.',
    sql: 'SELECT id, maNha AS tomTat, boiAi AS chu, ghiLuc AS tu, hanXuLy AS han FROM yeuCauXoa WHERE xoaTrongSo IS NULL' },
  { ma: 'KHACH_MOI', ten: 'Khách mới chưa có Tư vấn', cua: 'crm', nguong: 24,
    vi: 'Khách vừa trả tiền mà chưa ai gọi là khách nguội nhanh nhất.',
    sql: "SELECT maKhachHang AS id, maKhachHang AS tomTat, NULL AS chu, vaoLuc AS tu, NULL AS han FROM hoSoKhach " +
      "WHERE trangThai = 'dangHoc' AND (tuVan IS NULL OR tuVan = '')" },
  { ma: 'HEN_CRM', ten: 'Hẹn chạm CRM quá hạn', cua: 'crm', nguong: 0,
    vi: 'Một lời hẹn với khách đã qua ngày mà chưa ai chạm.',
    /* henTiep là NGÀY giờ Việt Nam; hạn = cuối ngày ấy. Chỉ lấy hẹn đã qua. */
    sqlVN: true,
    sql: "SELECT maKH AS id, giaiDoan AS tomTat, NULLIF(phuTrach, '') AS chu, henTiep AS tu, henTiep AS han FROM crmKhach " +
      "WHERE henTiep IS NOT NULL AND henTiep <> '' AND henTiep < ?" },
  { ma: 'NANG_CAP', ten: 'Đề xuất nâng cấp chưa ký', cua: 'tu-nang-cap', nguong: 168,
    vi: 'Đề xuất nằm im thì người đề xuất không biết nên đợi hay bỏ.',
    sql: 'SELECT id, viec AS tomTat, NULL AS chu, deXuatLuc AS tu, NULL AS han FROM luotNangCap WHERE kyLuc IS NULL' },
  { ma: 'HOP_THU', ten: 'Thông báo cần xem chưa đọc', cua: 'trung-tam-do', nguong: 48,
    vi: 'Một lời nhắn của khách nằm trong hộp mà không ai mở.',
    sql: "SELECT id, tieuDe AS tomTat, COALESCE(denAi, denVai) AS chu, luc AS tu, NULL AS han FROM thongBao " +
      "WHERE docLuc IS NULL AND mucDo IN ('canXem','gap')" },
  { ma: 'QUAY_PHIM', ten: 'Việc quay phim chờ máy', cua: 'xuong-phim', nguong: 24, tuMs: true,
    vi: 'Việc chờ quá lâu nghĩa là không máy quay nào đang nhận việc.',
    sql: "SELECT ma AS id, loai AS tomTat, may AS chu, COALESCE(nhanLuc, taoLuc) AS tu, NULL AS han FROM quay_viec WHERE trangThai IN ('cho','dang')" },
  /* Tiền đã giữ cho cảnh trả phí mà chưa máy GPU trả phí nào nhận: tiền nằm
     im trong trần tháng, chặn cảnh khác. Sau 3 giờ lịch dọn tự trả về; ngưỡng
     2 giờ để người thấy trước khi tiền bị trả — thường nghĩa là chưa bật máy. */
  { ma: 'GIU_TIEN_PHIM', ten: 'Tiền giữ cho cảnh phim trả phí', cua: 'xuong-phim', nguong: 2,
    vi: 'Không máy trả phí nào nhận thì tiền giữ nằm im trong trần — bật máy may-tra-phi.py hoặc để lịch dọn trả tiền về.',
    sql: "SELECT c.id, ('Tập ' || c.tap || ' · ' || c.canh) AS tomTat, q.may AS chu, c.giuLuc AS tu, NULL AS han " +
      "FROM chiPhiPhim c LEFT JOIN quay_viec q ON q.ma = c.maViec WHERE c.trangThai = 'giu'" },
  /* Dự án phim nhảy cầu dao (máy chạy quá giờ GPU): đứng chờ Super Admin. Không
     ai cầm và hạn coi như đã qua — một cầu dao nằm im là cả bộ phim nằm im. */
  { ma: 'PHIM_DUNG', ten: 'Dự án phim dừng vì cầu dao', cua: 'xuong-phim', nguong: 24,
    vi: 'Máy GPU chạy quá giờ đã giữ — Super Admin xem biên nhận rồi mở lại kèm lý do.',
    sql: "SELECT id, ten AS tomTat, NULL AS chu, suaLuc AS tu, suaLuc AS han FROM duAnPhim WHERE trangThai = 'dung'" }
];

function lucMs(v, tuMs) {
  if (v === null || v === undefined || v === '') return NaN;
  if (tuMs || typeof v === 'number') return Number(v);
  const s = String(v);
  /* Chỉ có NGÀY (giờ Việt Nam) → tính tới cuối ngày ấy, giờ Việt Nam. */
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return Date.parse(s + 'T23:59:59+07:00');
  return Date.parse(s);
}

/* Xếp MỘT việc — luật 2. Trả { loai: 'dang'|'cho'|'ket'|'khongBiet', viSao }. */
export function xepViec(r, q, bay) {
  const tu = lucMs(r.tu, q.tuMs), han = lucMs(r.han, q.tuMs);
  if (!isFinite(tu) && !isFinite(han)) return { loai: 'khongBiet', viSao: 'Không đọc được mốc thời gian.' };
  const chu = r.chu ? String(r.chu) : '';
  if (isFinite(han)) {
    if (han < bay) return { loai: 'ket', viSao: 'Quá hạn ' + Math.max(1, Math.round((bay - han) / GIO)) + ' giờ' + (chu ? ' · đang ở ' + chu : '') + '.' };
    if (chu) return { loai: 'cho', viSao: 'Có người cầm (' + chu + '), hạn còn ' + Math.round((han - bay) / GIO) + ' giờ.' };
    return { loai: 'ket', viSao: 'Có hạn nhưng không ai cầm.' };
  }
  const tuoi = (bay - tu) / GIO;
  if (tuoi > q.nguong) return { loai: 'ket', viSao: 'Nằm im ' + Math.round(tuoi) + ' giờ (ngưỡng ' + q.nguong + ' giờ)' + (chu ? ' · đang ở ' + chu : ' · không ai cầm') + '.' };
  return { loai: 'dang', viSao: 'Mới ' + Math.max(0, Math.round(tuoi)) + ' giờ.' };
}

/* Đọc toàn bộ — luật 1 và 3. Không ghi gì. */
export async function doViecKet(db, opt) {
  const bay = (opt && opt.bay) || Date.now();
  const hang = [];
  const tong = { dang: 0, cho: 0, ket: 0, khongBiet: 0 };
  for (const q of HANG_DOI) {
    const o = { ma: q.ma, ten: q.ten, cua: q.cua, vi: q.vi, so: { dang: 0, cho: 0, ket: 0, khongBiet: 0 }, mau: [] };
    let ds;
    try {
      const st = db.prepare(q.sql + ' LIMIT 300');
      ds = ((await (q.sqlVN ? st.bind(ngayVN(bay)) : st).all()).results) || [];
    } catch (e) {
      const loi = String(e && e.message || e);
      o.trangThai = /no such table/i.test(loi) ? 'chuaDung' : 'khongBiet';
      if (o.trangThai === 'khongBiet') { o.loi = loi.slice(0, 160); tong.khongBiet++; }
      hang.push(o);
      continue;
    }
    const ket = [];
    for (const r of ds) {
      const x = xepViec(r, q, bay);
      o.so[x.loai]++;
      if (x.loai === 'ket') ket.push({ id: String(r.id), tomTat: String(r.tomTat || '').slice(0, 80), chu: r.chu || undefined,
        tuoiGio: isFinite(lucMs(r.tu, q.tuMs)) ? Math.round((bay - lucMs(r.tu, q.tuMs)) / GIO) : undefined, viSao: x.viSao });
    }
    ket.sort((a, b) => (b.tuoiGio || 0) - (a.tuoiGio || 0));
    o.mau = ket.slice(0, 5);
    if (ds.length >= 300) o.itNhat = true;      /* đọc tới trần — con số là "ít nhất" */
    o.trangThai = o.so.ket ? 'ket' : o.so.khongBiet ? 'khongBiet' : 'ok';
    ['dang', 'cho', 'ket', 'khongBiet'].forEach(k => { tong[k] += o.so[k]; });
    hang.push(o);
  }
  return { luc: new Date(bay).toISOString(), tong, hang };
}

/* ═══════════════ CỬA ĐỌC — R01–R03 ═══════════════ */
export async function docViecKet(y, env, db, hoSo) {
  if (!(BAC[String((hoSo || {}).role || '')] <= 3))
    return { ok: false, code: 'NOPERM', error: 'Mạch việc kẹt mở cho Super Admin, Admin và Giám đốc.' };
  return Object.assign({ ok: true }, await doViecKet(db));
}

/* Một dòng tóm tắt cho hộp thông báo — nói hàng nào kẹt bao nhiêu, đi tới
   màn nào. Không chép nội dung việc (tên khách, số tiền) vào thông báo. */
export function tomTatViecKet(kq) {
  const ket = kq.hang.filter(h => h.so.ket > 0).sort((a, b) => b.so.ket - a.so.ket);
  const kb = kq.hang.filter(h => h.trangThai === 'khongBiet');
  if (!ket.length && !kb.length) return '';
  return ket.map(h => '· ' + h.ten + ': ' + h.so.ket + (h.itNhat ? '+' : '') + ' việc kẹt').join('\n') +
    (kb.length ? '\n· Không đọc được: ' + kb.map(h => h.ten).join(', ') + ' — cần người kiểm.' : '') +
    '\nMở Trung tâm đo lường → khối "Việc kẹt" để xem từng việc và màn xử lý.';
}
