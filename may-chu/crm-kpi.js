/* ═══════════════════════════════════════════════════════════════
   GITA 365 — HỆ KPI CHUẨN CHO AGENT CRM  (9.99.172)

   Chủ hệ: "có hệ KPI chuẩn cho các Agent của CRM". Đây là tầng ĐO cho
   cả trợ lý AI CRM lẫn nhân sự CRM — và nó theo đúng ba luật đã chốt của
   kho, không phải một bảng KPI mới tự do:

   1. ĐO LÚC ĐỌC. Không bảng nào lưu sẵn con số KPI. Một cột KPI lưu sẵn
      hoặc bị gõ đè (một phép đo thành lời khai) hoặc cũ đi lặng lẽ. Cùng
      luật cột conHan (9.99.63), cột den (9.99.66), mẫu số B1 (9.99.87).

   2. MỖI KPI KHAI ĐÚNG MỘT ĐƯỜNG — mayDo (máy đếm thẳng trong sổ) HOẶC
      nguoiDo (người khai, kèm nguồn). Trình cả mười một như đã đo thì
      người duyệt thấy mười một dấu tick rồi thôi đọc — và ba KPI nặng
      nhất về NGƯỜI (hài lòng · chất lượng tư vấn · chuyển đổi thật) lại
      đúng là ba cái không ai đọc nữa. Cùng luật mayDo/nguoiDo (9.99.62).

   3. KHÔNG ĐẶT CHỈ TIÊU ĐỂ CHẠY CHO ĐỦ. CRM_KPI không mang một ô số
      `chiTieu`/`nguong` nào. Đặt ngưỡng cho một con số hành vi là mời
      người ta chạy cho đủ số — và một điểm chạm chạy cho đủ số là một
      điểm chạm làm phiền (SUP-01 9.99.86, chỉ số việc-tử-tế 9.99.71).
      Ngưỡng KPI là VÙNG ĐỎ: máy đo, chủ hệ chốt ngưỡng (CRM-KPI-01).

   KPI này ĐO, không CHẤM LƯƠNG. Nối KPI vào lương là quyết định riêng
   (L-02: máy không cắt cũng không tha), không nằm ở đây.
   ═══════════════════════════════════════════════════════════════ */
'use strict';

import { Kho } from './nen.js';

const BAC = {R01:1,R02:2,R03:3,R04:4,R05:5,R06:6,R07:7,R08:8,
  R09:9,R10:10,R11:11,R12:12,R13:13,R14:14,R15:15};

/* Mười một KPI chuẩn của CRM. Mỗi cái: mayDo HOẶC nguoiDo, và `nguon`
   trỏ chỗ con số đến từ đâu. `chieu` nói cao-tốt hay thấp-tốt (để đọc,
   KHÔNG phải một ngưỡng). KHÔNG ô chỉ tiêu/ngưỡng số nào. */
export const CRM_KPI = [
  {ma: 'K01', ten: 'Tỷ lệ nhà có người phụ trách', ai: 'mayDo',  nguon: 'crmKhach.phuTrach / hoSoKhach', chieu: 'cao tốt'},
  {ma: 'K02', ten: 'Tỷ lệ nhà đã xếp chặng',        ai: 'mayDo',  nguon: 'crmKhach.giaiDoan / hoSoKhach', chieu: 'cao tốt'},
  {ma: 'K03', ten: 'Số hẹn tiếp quá hạn',           ai: 'mayDo',  nguon: 'crmKhach.henTiep < hôm nay',    chieu: 'thấp tốt'},
  {ma: 'K04', ten: 'Số lượt chạm 30 ngày',          ai: 'mayDo',  nguon: 'soCham (30 ngày)',              chieu: 'cao tốt'},
  {ma: 'K05', ten: 'Doanh thu đã duyệt (đ)',        ai: 'mayDo',  nguon: 'phieuThu (đã duyệt)',           chieu: 'cao tốt'},
  {ma: 'K06', ten: 'Lượt điều phối trợ lý AI',      ai: 'mayDo',  nguon: 'audit CRMAI_DIEUPHOI',          chieu: 'đọc'},
  {ma: 'K07', ten: 'Lượt đọc hồ sơ CRM',            ai: 'mayDo',  nguon: 'audit CRM_XEM',                 chieu: 'đọc'},
  {ma: 'K08', ten: 'Lượt cập nhật CRM',             ai: 'mayDo',  nguon: 'audit CRM_GHI',                 chieu: 'đọc'},
  {ma: 'K09', ten: 'Mức hài lòng chăm sóc',         ai: 'nguoiDo', nguon: 'khảo sát khách (nền tảng ngoài)', chieu: 'cao tốt'},
  {ma: 'K10', ten: 'Chất lượng tư vấn',             ai: 'nguoiDo', nguon: 'người chấm, kèm tên',          chieu: 'cao tốt'},
  {ma: 'K11', ten: 'Tỷ lệ chuyển đổi thật',         ai: 'nguoiDo', nguon: 'đối chiếu nền tảng ngoài, người khai', chieu: 'cao tốt'}
];

export const CRM_KPI_LUAT = [
  {ma: 'KP1', luat: 'Đo LÚC ĐỌC — không bảng nào lưu sẵn con số KPI',
    tro: 'cột conHan 9.99.63 · cột den 9.99.66'},
  {ma: 'KP2', luat: 'Mỗi KPI khai ĐÚNG MỘT đường: mayDo (máy đếm) hoặc nguoiDo (người khai, kèm nguồn)',
    tro: 'mayDo/nguoiDo 9.99.62'},
  {ma: 'KP3', luat: 'KHÔNG đặt chỉ tiêu số — ngưỡng KPI là Vùng Đỏ, chủ hệ chốt (CRM-KPI-01)',
    tro: 'SUP-01 9.99.86 · việc tử tế 9.99.71'},
  {ma: 'KP4', luat: 'KPI ĐO, không CHẤM LƯƠNG — nối vào lương là quyết định riêng',
    tro: 'L-02 máy không cắt cũng không tha'},
  {ma: 'KP5', luat: 'Không gộp cột đo được với cột lời khai thành một con số tổng',
    tro: 'phễu 9.99.59 · thang 1000 9.99.81'}
];

function quanTri(hoSo) { return (BAC[hoSo.role] || 99) <= 3; }
async function demAudit(db, viec) {
  const r = await db.prepare('SELECT COUNT(*) n FROM audit WHERE viec = ?').bind(viec).first();
  return (r && r.n) || 0;
}

/* ── BẢNG KPI CRM — TÍNH LÚC ĐỌC ── */
export async function crmKpiCham(y, env, db, hoSo) {
  if (!quanTri(hoSo))
    return {ok: false, code: 'NOPERM', error: 'Chỉ R01–R03 đọc được bảng KPI CRM.'};

  const tong = ((await db.prepare('SELECT COUNT(*) n FROM hoSoKhach').first()) || {}).n || 0;
  const coPt = ((await db.prepare(
    "SELECT COUNT(*) n FROM crmKhach WHERE phuTrach IS NOT NULL AND phuTrach <> ''").first()) || {}).n || 0;
  const coGd = ((await db.prepare(
    "SELECT COUNT(*) n FROM crmKhach WHERE giaiDoan IS NOT NULL AND giaiDoan <> ''").first()) || {}).n || 0;
  const bayNgay = new Date().toISOString().slice(0, 10);
  const quaHan = ((await db.prepare(
    "SELECT COUNT(*) n FROM crmKhach WHERE henTiep IS NOT NULL AND henTiep <> '' AND substr(henTiep,1,10) < ?"
  ).bind(bayNgay).first()) || {}).n || 0;
  const cutoff = new Date(Date.now() - 30 * 864e5).toISOString().slice(0, 10);
  const cham30 = ((await db.prepare(
    'SELECT COUNT(*) n FROM soCham WHERE substr(ngay,1,10) >= ?').bind(cutoff).first()) || {}).n || 0;
  const doanhThu = ((await db.prepare(
    "SELECT COALESCE(SUM(soTien),0) t FROM phieuThu WHERE trangThai = 'daDuyet'").first()) || {}).t || 0;

  const dp = await demAudit(db, 'CRMAI_DIEUPHOI');
  const xem = await demAudit(db, 'CRM_XEM');
  const ghi = await demAudit(db, 'CRM_GHI');

  function tyLe(a, b) { return b > 0 ? Math.round(a * 1000 / b) / 10 : null; }
  const soDo = {
    K01: tyLe(coPt, tong), K02: tyLe(coGd, tong), K03: quaHan,
    K04: cham30, K05: doanhThu, K06: dp, K07: xem, K08: ghi
  };

  const bang = CRM_KPI.map(k => ({
    ma: k.ma, ten: k.ten, ai: k.ai, nguon: k.nguon, chieu: k.chieu,
    giaTri: k.ai === 'mayDo' ? (k.ma in soDo ? soDo[k.ma] : null) : undefined,
    khai: k.ai === 'nguoiDo' ? 'người khai — chưa có sổ ghi' : undefined
  }));

  return {ok: true, tongKhach: tong, bang, luat: CRM_KPI_LUAT,
    soMayDo: CRM_KPI.filter(k => k.ai === 'mayDo').length,
    soNguoiDo: CRM_KPI.filter(k => k.ai === 'nguoiDo').length,
    vi: 'Tám KPI máy đo tính LÚC ĐỌC từ sổ thật; ba KPI người khai để RIÊNG, không con số ' +
        'giả. KHÔNG ngưỡng — đặt chỉ tiêu là mời chạy cho đủ số. Ngưỡng là Vùng Đỏ chờ chủ hệ.'};
}

/* ── KPI HOẠT ĐỘNG THEO TỪNG TRỢ LÝ AI ──
   Đếm lượt điều phối mỗi trợ lý (audit CRMAI_DIEUPHOI, doiTuong = mã trợ
   lý). Đo HOẠT ĐỘNG, không đo CHẤT LƯỢNG — một trợ lý bị gọi nhiều không
   có nghĩa nó tốt hơn, nên KHÔNG có ngưỡng và KHÔNG xếp hạng. */
export async function crmKpiTroLy(y, env, db, hoSo) {
  if (!quanTri(hoSo))
    return {ok: false, code: 'NOPERM', error: 'Chỉ R01–R03 đọc được KPI trợ lý.'};
  const r = await db.prepare(
    "SELECT doiTuong ma, COUNT(*) n FROM audit WHERE viec = 'CRMAI_DIEUPHOI' " +
    "GROUP BY doiTuong ORDER BY n DESC"
  ).all();
  const ds = (r.results || []).map(x => ({tro: x.ma, soLuot: x.n}));
  return {ok: true, theoTroLy: ds,
    vi: 'Đếm lượt điều phối mỗi trợ lý — ĐO HOẠT ĐỘNG, không đo chất lượng, không xếp hạng. ' +
        'Một trợ lý bị gọi nhiều không có nghĩa nó tốt hơn.'};
}
