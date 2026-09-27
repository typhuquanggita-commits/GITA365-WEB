/* ═══════════════════════════════════════════════════════════════
   GITA 365 — CRM NHÂN SỰ  (9.99.172)

   Theo yêu cầu chủ hệ: một hệ CRM cho nhân sự công ty làm việc, và
   Super Admin có TOÀN QUYỀN cấp · quản lý · xem.

   Cả phần này TRỎ, không chép. Dữ liệu khách đã sống ở bốn bảng chạy
   thật — hoSoKhach (tuyến · tầng · đèn · coach · tư vấn), users (tên ·
   liên hệ), soCham (mỗi lượt chạm), phieuThu (tiền đã thu). CRM KHÔNG
   dựng lại một bảng khách thứ hai; nó chỉ thêm một LỚP PHỦ nhỏ
   (crmKhach: ai phụ trách · đang ở chặng nào · hẹn tiếp khi nào) và
   gom mọi thứ về một chỗ đọc được. Dựng bảng khách thứ hai là bản thứ
   hai của một sự thật — hai bản thì có ngày lệch, và lúc ấy một nhân
   viên đọc hai con số khác nhau về cùng một nhà.

   CÁI RĂNG nằm ở cổng quyền, không ở màn:
   1. Super Admin (R01) và Admin hệ thống (R02) QUẢN LÝ đương nhiên —
      họ là tầng quản trị hệ. Mọi vai khác phải được CẤP quyền CRM
      (xem · sửa · quản lý) mới vào được, và chỉ R01–R02 cấp được.
   2. Quyền tính LÚC ĐỌC từ dòng mới nhất còn hiệu lực — không cột
      "đang có quyền". Một cột như thế hoặc bị gõ đè (một phép đo thành
      lời khai) hoặc cũ đi lặng lẽ. Cùng luật cột conHan (9.99.63),
      cột den (9.99.66), cột đã-đủ-ba-cửa (9.99.69).
   3. Người có quyền 'xem'/'sửa' chỉ thấy KHÁCH CỦA MÌNH (phụ trách ·
      coach · tư vấn); 'quản lý' và R01–R02 thấy tất cả. Lọc ở CÂU
      TRUY VẤN, không ở màn — lọc trên màn KHÔNG phải bảo vệ dữ liệu
      (luật đã cắn ba lần: KICHBAN · CV_MUC · 17 kho nghề).
   4. Không ai TỰ CẤP cho mình — so bằng định danh chính tắc (layUid),
      không so chuỗi thô (cùng lỗ 9.99.112 với capLenhGiamSat).

   Xem KHÁCH là việc NỘI BỘ, được phép — Điều 13 cấm dữ liệu gia đình
   RỜI HỆ ở dạng nhận dạng được, không cấm nhân sự trong hệ đọc để làm
   việc. Nên crmChiTiet KHÔNG đi qua cổng ẩn danh; nó chỉ KHÔNG trả về
   băm mật khẩu (select cột cụ thể), và GHI NHẬT KÝ mỗi lượt đọc (Luật
   91 Điều 6: ai truy cập nhà nào).
   ═══════════════════════════════════════════════════════════════ */
'use strict';

import { Kho, tokenMoi } from './nen.js';

const BAC = {R01:1,R02:2,R03:3,R04:4,R05:5,R06:6,R07:7,R08:8,
  R09:9,R10:10,R11:11,R12:12,R13:13,R14:14,R15:15};

/* Chặng của một nhà trong CRM — nguồn DUY NHẤT là ở đây (máy chủ).
   Màn KHÔNG giữ một danh sách thứ hai; crmDanhSach trả về bảng này để
   màn dựng ô chọn, nên không có bản chép nào để trôi. */
export const GIAI_DOAN = [
  {ma: 'moi',        ten: 'Mới quan tâm',   vi: 'Vừa biết tới, chưa tư vấn'},
  {ma: 'tuvan',      ten: 'Đang tư vấn',    vi: 'Đã chạm, đang tìm đường'},
  {ma: 'chotky',     ten: 'Chốt ký',        vi: 'Đồng ý tham gia, đang hoàn tất'},
  {ma: 'onboarding', ten: 'Nhập môn',       vi: 'Đã ký, đang dựng nền 30 ngày đầu'},
  {ma: 'donghanh',   ten: 'Đồng hành',      vi: 'Đang học đều, giữ nhịp'},
  {ma: 'rui',        ten: 'Có rủi ro',      vi: 'Đèn vàng/đỏ — cần chạm ngay'},
  {ma: 'roi',        ten: 'Đã rời',         vi: 'Tạm dừng hoặc nghỉ hẳn'}
];

/* Ba mức quyền CRM. muc là một THANG (xem < sửa < quản lý) — một người
   giữ đúng một mức tại một thời điểm, không xếp chồng. */
export const MUC_CRM = [
  {ma: 'xem',    ten: 'Xem',      vi: 'Đọc khách của mình'},
  {ma: 'sua',    ten: 'Sửa',      vi: 'Đọc + cập nhật chặng, hẹn tiếp, ghi chú khách của mình'},
  {ma: 'quanly', ten: 'Quản lý',  vi: 'Xem và sửa MỌI khách, gán người phụ trách'}
];
const MUC_HOP = {xem: 1, sua: 2, quanly: 3};

function laMa(ma) { return GIAI_DOAN.some(x => x.ma === ma); }

/* ── CƠ HỘI BÁN HÀNG — chặng riêng, MỖI CHẶNG MỘT XÁC SUẤT ──
   Khác GIAI_DOAN (vòng đời một NHÀ). Đây là vòng đời một THƯƠNG VỤ, và mỗi
   chặng mang xác suất chốt để tính giá trị TRỌNG SỐ (dự báo doanh thu sát
   hơn tổng thô). Nguồn DUY NHẤT ở máy chủ — màn lấy về, không giữ bản chép. */
export const CO_HOI_GD = [
  {ma:'moi',     ten:'Mới',          xs:10, vi:'Vừa nhận ra một nhu cầu có thể chốt'},
  {ma:'tuvan',   ten:'Đang tư vấn',  xs:30, vi:'Đang trao đổi, tìm gói phù hợp'},
  {ma:'baogia',  ten:'Đã báo giá',   xs:50, vi:'Đã đưa lộ trình và giá'},
  {ma:'damphan', ten:'Đàm phán',     xs:70, vi:'Đang chốt điều khoản cuối'},
  {ma:'chotky',  ten:'Chuẩn bị ký',  xs:90, vi:'Đồng ý, đang hoàn tất giấy tờ'}
];
const COHOI_TT = ['mo', 'thang', 'thua'];
function laCoHoiGD(ma) { return CO_HOI_GD.some(x => x.ma === ma); }

/* ── MỨC QUYỀN CRM CỦA MỘT NGƯỜI, tính LÚC ĐỌC ──
   R01–R02 là tầng quản trị hệ → 'quanly' đương nhiên. Vai khác đọc
   dòng quyenCRM mới nhất CÒN HIỆU LỰC. Không có → null (chưa được cấp). */
async function mucCua(db, hoSo) {
  if ((BAC[hoSo.role] || 99) <= 2) return 'quanly';
  const bay = new Date().toISOString();
  const r = await db.prepare(
    'SELECT muc, hetHan FROM quyenCRM WHERE username = ? AND thuHoiLuc IS NULL ' +
    'ORDER BY capLuc DESC, rowid DESC LIMIT 1'
  ).bind(String(hoSo.u || '').toLowerCase()).first();
  if (!r) return null;
  if (r.hetHan && r.hetHan <= bay) return null;
  return r.muc;
}

function duMuc(co, can) { return (MUC_HOP[co] || 0) >= (MUC_HOP[can] || 99); }

/* Dùng ở ĐĂNG NHẬP — trả mức CRM của người vừa vào để máy khách biết có
   hiện mục CRM hay không. Không có quyền → null → máy khách không hiện.
   Đây là ĐƯỜNG DUY NHẤT một bộ phận được cấp "thấy" được CRM trên máy
   họ: bảng phân quyền theo vai (phanquyen) chỉ đồng bộ tới lv≤2 (dong-bo
   dòng 127), nên một coach được cấp không bao giờ nhận bảng ấy — chỉ
   dòng quyenCRM của chính họ, đọc lúc đăng nhập, mới bật được. */
export async function mucCrmCua(db, role, u) { return mucCua(db, {role: role, u: u}); }

/* ═══════════════ CẤP QUYỀN CRM — chỉ R01–R02 ═══════════════ */
export async function capQuyenCRM(y, env, db, hoSo) {
  if ((BAC[hoSo.role] || 99) > 2)
    return {ok: false, code: 'NOPERM',
      error: 'Chỉ Super Admin và Admin hệ thống cấp được quyền CRM.'};

  const ten = String(y.username || '').trim().toLowerCase();
  const muc = String(y.muc || '').trim();
  const lyDo = String(y.lyDo || '').trim();
  if (!ten) return {ok: false, error: 'Thiếu tên đăng nhập.'};
  if (!MUC_HOP[muc]) return {ok: false,
    error: 'Mức quyền phải là một trong: ' + MUC_CRM.map(m => m.ma).join(', ') + '.'};
  if (!lyDo) return {ok: false,
    error: 'Chưa nói vì sao cấp. Một quyền đọc dữ liệu khách mà không có lý do thì ' +
           'sang năm không ai dựng lại được vì sao người này được xem.'};

  const nd = await Kho.nguoiTheoTen(db, ten);
  if (!nd) return {ok: false, error: 'Không tìm thấy tài khoản này.'};

  /* KHÔNG AI TỰ CẤP CHO MÌNH — so bằng định danh chính tắc (uid), không
     so chuỗi: `username` nhận cả email, so chuỗi thô bỏ sót email của
     chính mình (lỗ 9.99.112). */
  if (String(nd.id) === String(hoSo.uid || ''))
    return {ok: false, code: 'TUCAP',
      error: 'Không tự cấp được quyền CRM cho chính mình (kể cả khai bằng email).'};

  /* LƯU TÊN CHÍNH TẮC (nd.username), không lưu chuỗi người gõ: cấp bằng
     email thì `ten` là email, mà mucCua tra bằng hoSo.u (tên đăng nhập
     của phiên) — hai chuỗi lệch nhau thì quyền cấp xong mà đọc không
     thấy. Quy về username chuẩn thì mọi lối gõ đều khớp. */
  const tenCanon = String(nd.username || ten).trim().toLowerCase();

  const id = 'QCRM-' + tokenMoi().slice(0, 14);
  const luc = new Date().toISOString();
  const hetHan = String(y.hetHan || '').trim() || null;

  /* Một người MỘT mức tại một thời điểm: thu hồi mức cũ (nếu có) rồi cấp
     mức mới, NGUYÊN TỬ bằng db.batch — hoặc đổi trọn, hoặc không gì. Nhờ
     thế đổi 'xem'→'sửa' là một lượt, không cần thu hồi tay trước. */
  await db.batch([
    db.prepare('UPDATE quyenCRM SET thuHoiLuc = ?, thuHoiBoi = ? ' +
      'WHERE username = ? AND thuHoiLuc IS NULL')
      .bind(luc, hoSo.u, tenCanon),
    db.prepare('INSERT INTO quyenCRM (id,username,muc,lyDo,boiAi,capLuc,hetHan) ' +
      'VALUES (?,?,?,?,?,?,?)')
      .bind(id, tenCanon, muc, lyDo.slice(0, 500), hoSo.u, luc, hetHan)
  ]);

  await Kho.ghiNhatKy(db, {uid: hoSo.uid, username: hoSo.u, viec: 'QUYENCRM_CAP',
    doiTuong: tenCanon, chiTiet: muc + ' · ' + lyDo});
  return {ok: true, id, username: tenCanon, muc};
}

/* ═══════════════ THU HỒI QUYỀN CRM — chỉ R01–R02 ═══════════════ */
export async function thuHoiQuyenCRM(y, env, db, hoSo) {
  if ((BAC[hoSo.role] || 99) > 2)
    return {ok: false, code: 'NOPERM', error: 'Chỉ R01–R02 thu hồi được quyền CRM.'};
  const goc = String(y.username || '').trim().toLowerCase();
  if (!goc) return {ok: false, error: 'Thiếu tên đăng nhập.'};
  /* Quy về tên chính tắc để thu hồi khớp cả khi cấp bằng email. */
  const nd = await Kho.nguoiTheoTen(db, goc);
  const ten = nd ? String(nd.username || goc).toLowerCase() : goc;
  const r = await db.prepare(
    'UPDATE quyenCRM SET thuHoiLuc = ?, thuHoiBoi = ? WHERE username = ? AND thuHoiLuc IS NULL'
  ).bind(new Date().toISOString(), hoSo.u, ten).run();
  const n = (r && r.meta && r.meta.changes) || 0;
  if (!n) return {ok: false, error: 'Người này không có quyền CRM đang hiệu lực.'};
  await Kho.ghiNhatKy(db, {uid: hoSo.uid, username: hoSo.u, viec: 'QUYENCRM_THUHOI',
    doiTuong: ten, chiTiet: 'thu hồi quyền CRM'});
  return {ok: true, daThuHoi: n};
}

/* ═══════════════ SỔ QUYỀN CRM — R01–R03 đọc ═══════════════ */
export async function dsQuyenCRM(y, env, db, hoSo) {
  if ((BAC[hoSo.role] || 99) > 3)
    return {ok: false, code: 'NOPERM', error: 'Vai này không xem được sổ quyền CRM.'};
  const r = await db.prepare('SELECT * FROM quyenCRM ORDER BY capLuc DESC LIMIT 300').all();
  const bay = new Date().toISOString();
  const ds = (r.results || []).map(x => ({
    username: x.username, muc: x.muc,
    tenMuc: (MUC_CRM.filter(m => m.ma === x.muc)[0] || {}).ten || x.muc,
    lyDo: x.lyDo, boiAi: x.boiAi, capLuc: x.capLuc,
    hetHan: x.hetHan || undefined,
    conHieuLuc: !x.thuHoiLuc && !(x.hetHan && x.hetHan <= bay),
    thuHoiLuc: x.thuHoiLuc || undefined}));
  return {ok: true, dangCoQuyen: ds.filter(x => x.conHieuLuc), ds,
    mucCoThe: MUC_CRM,
    vi: 'R01–R02 quản lý CRM đương nhiên và KHÔNG cần dòng trong sổ này — sổ chỉ ghi ' +
        'quyền CẤP THÊM cho vai khác. Quyền tính lúc đọc; không cột "đang có quyền".'};
}

/* ── LỌC "KHÁCH CỦA MÌNH" ──
   Một nhân viên thấy nhà mình PHỤ TRÁCH (crmKhach.phuTrach), hoặc mình
   là coach / tư vấn của nhà ấy (hoSoKhach.coach/tuVan). Lọc trong CÂU
   TRUY VẤN, không ở màn. */
function laCuaMinh(kh, u) {
  const t = String(u || '').toLowerCase();
  return [kh.phuTrach, kh.coach, kh.tuVan]
    .some(x => String(x || '').toLowerCase() === t);
}

/* ═══════════════ DANH SÁCH KHÁCH ═══════════════ */
/* ─── Lọc quyền + tìm kiếm Ở SQL (100k khách không được kéo hết về rồi
   lọc trong JS). Trả về mệnh đề WHERE và danh sách tham số. ───
   Non-quản-lý: chỉ nhà MÌNH phụ trách/coach/tư vấn — lọc ngay trong truy
   vấn, không ở màn (lọc trên màn không phải bảo vệ dữ liệu). */
function loc(muc, hoSo, y) {
  const dk = [], b = [];
  if (muc !== 'quanly') {
    dk.push('(c.phuTrach = ? OR k.coach = ? OR k.tuVan = ?)');
    b.push(hoSo.u, hoSo.u, hoSo.u);
  }
  const q = String((y && y.q) || '').trim();
  if (q) {
    dk.push('(k.maKhachHang LIKE ? OR u.hoTen LIKE ? OR u.dienThoai LIKE ?)');
    const like = '%' + q.replace(/[%_]/g, '') + '%';
    b.push(like, like, like);
  }
  const chang = String((y && y.chang) || '').trim();
  if (chang) { dk.push('c.giaiDoan = ?'); b.push(chang); }
  return {where: dk.length ? ' WHERE ' + dk.join(' AND ') : '', binds: b};
}
const CRM_JOIN =
  'FROM hoSoKhach k ' +
  'LEFT JOIN users u ON u.id = k.uidPhuHuynh ' +
  'LEFT JOIN crmKhach c ON c.maKH = k.maKhachHang';
const CRM_TRANG = 50; /* mỗi trang 50 khách — đủ đọc, nhẹ đường truyền */

export async function crmDanhSach(y, env, db, hoSo) {
  const muc = await mucCua(db, hoSo);
  if (!muc) return {ok: false, code: 'NOPERM',
    error: 'Chưa được cấp quyền CRM. Super Admin cấp quyền xem/sửa/quản lý trước.'};

  const toanBo = muc === 'quanly';
  const f = loc(muc, hoSo, y);

  /* Đếm TỔNG (cho phân trang) — COUNT ở SQL, không kéo dòng về. */
  const dem = await db.prepare('SELECT COUNT(*) n ' + CRM_JOIN + f.where).bind(...f.binds).first();
  const tongTatCa = (dem && dem.n) || 0;

  let trang = Math.max(1, parseInt((y && y.trang) || 1, 10) || 1);
  const soTrang = Math.max(1, Math.ceil(tongTatCa / CRM_TRANG));
  if (trang > soTrang) trang = soTrang;
  const bo = (trang - 1) * CRM_TRANG;

  /* Chỉ lấy đúng MỘT trang — LIMIT/OFFSET ở SQL. */
  const r = await db.prepare(
    'SELECT k.maKhachHang, k.tang, k.band, k.coach, k.tuVan, k.trangThai, ' +
    '       u.hoTen, u.dienThoai, ' +
    '       c.phuTrach, c.giaiDoan, c.henTiep, c.capNhatLuc ' +
    CRM_JOIN + f.where +
    ' ORDER BY k.vaoLuc DESC LIMIT ? OFFSET ?'
  ).bind(...f.binds, CRM_TRANG, bo).all();

  const hang = (r.results || []).map(x => ({
    maKH: x.maKhachHang, hoTen: x.hoTen || '', dienThoai: x.dienThoai || '',
    tang: x.tang, band: x.band || '', coach: x.coach || '', tuVan: x.tuVan || '',
    trangThai: x.trangThai, phuTrach: x.phuTrach || '',
    giaiDoan: x.giaiDoan || '', henTiep: x.henTiep || '', capNhatLuc: x.capNhatLuc || ''}));

  return {ok: true, muc, toanBo, tong: hang.length, tongTatCa,
    trang, soTrang, moiTrang: CRM_TRANG,
    q: String((y && y.q) || '').trim(), chang: String((y && y.chang) || '').trim(),
    khach: hang, giaiDoanCoThe: GIAI_DOAN,
    vi: toanBo
      ? 'Quản lý CRM: thấy MỌI khách. Phân trang ' + CRM_TRANG + ' nhà/trang, tìm ở máy chủ — ' +
        'không kéo cả trăm nghìn nhà về máy. Chặng trống nghĩa là chưa ai xếp chặng.'
      : 'Chỉ thấy khách BẠN phụ trách, coach hoặc tư vấn — lọc Ở SQL, không ở màn.'};
}

/* ═══════════════ CHI TIẾT MỘT KHÁCH ═══════════════ */
export async function crmChiTiet(y, env, db, hoSo) {
  const muc = await mucCua(db, hoSo);
  if (!muc) return {ok: false, code: 'NOPERM', error: 'Chưa được cấp quyền CRM.'};
  const maKH = String(y.maKH || '').trim();
  if (!maKH) return {ok: false, error: 'Thiếu mã khách hàng.'};

  /* KHÔNG select * trên users — băm mật khẩu không được ra khỏi hàng
     users, kể cả cho nhân sự nội bộ. Chọn đúng cột cần. */
  const kh = await db.prepare(
    'SELECT k.*, u.hoTen, u.email, u.dienThoai ' +
    'FROM hoSoKhach k LEFT JOIN users u ON u.id = k.uidPhuHuynh ' +
    'WHERE k.maKhachHang = ?'
  ).bind(maKH).first();
  if (!kh) return {ok: false, error: 'Không tìm thấy khách này.'};

  const cr = await db.prepare('SELECT * FROM crmKhach WHERE maKH = ?').bind(maKH).first();
  const phu = {phuTrach: (cr && cr.phuTrach) || '', giaiDoan: (cr && cr.giaiDoan) || '',
    henTiep: (cr && cr.henTiep) || '', ghiChu: (cr && cr.ghiChu) || '',
    capNhatLuc: (cr && cr.capNhatLuc) || ''};

  /* Quyền dưới 'quản lý' chỉ mở được nhà của mình. */
  if (muc !== 'quanly' && !laCuaMinh(
    {phuTrach: phu.phuTrach, coach: kh.coach, tuVan: kh.tuVan}, hoSo.u))
    return {ok: false, code: 'NOPERM',
      error: 'Nhà này không thuộc phần bạn phụ trách. Nhờ quản lý CRM gán, hoặc mở nhà của mình.'};

  /* soCham dùng cột maNha (không phải maKH). */
  const sc = await db.prepare(
    'SELECT ngay, kieu, denLuc, noiDung, boiAi FROM soCham WHERE maNha = ? ' +
    'ORDER BY ngay DESC, rowid DESC LIMIT 20'
  ).bind(maKH).all();

  const tt = await db.prepare(
    "SELECT COUNT(*) n, COALESCE(SUM(soTien),0) tong FROM phieuThu " +
    "WHERE maKhachHang = ? AND trangThai = 'daDuyet'"
  ).bind(maKH).first();

  await Kho.ghiNhatKy(db, {uid: hoSo.uid, username: hoSo.u, viec: 'CRM_XEM',
    doiTuong: maKH, chiTiet: 'đọc hồ sơ CRM'});

  return {ok: true, muc,
    khach: {maKH, hoTen: kh.hoTen || '', email: kh.email || '', dienThoai: kh.dienThoai || '',
      tuyen: kh.tuyen, tang: kh.tang, band: kh.band || '', coach: kh.coach || '',
      tuVan: kh.tuVan || '', trangThai: kh.trangThai},
    crm: phu,
    soCham: (sc.results || []).map(s => ({ngay: s.ngay, kieu: s.kieu,
      denLuc: s.denLuc || '', noiDung: s.noiDung, boiAi: s.boiAi})),
    thu: {soPhieu: (tt && tt.n) || 0, tong: (tt && tt.tong) || 0},
    giaiDoanCoThe: GIAI_DOAN};
}

/* ═══════════════ QUẢN TRỊ CRM — CHỈ SUPER ADMIN (R01–R02) ═══════════════

   Chủ hệ: CRM có mục quản trị cho Super Admin kiểm soát cấp quyền · vận
   hành. Panel này TRỎ vào nhật ký ĐÃ GHI — không dựng sổ vết thứ hai.
   Mọi lượt cấp/thu quyền (QUYENCRM_CAP·THUHOI), mọi lượt đọc (CRM_XEM),
   cập nhật (CRM_GHI), điều phối AI (CRMAI_DIEUPHOI) đều đã vào audit;
   panel gom đúng những dòng ấy về một chỗ đọc được. Một sự thật CÓ mà
   không đọc ra được thì trên thực tế là KHÔNG CÓ (9.99.59). */
export async function crmQuanTri(y, env, db, hoSo) {
  if ((BAC[hoSo.role] || 99) > 2)
    return {ok: false, code: 'NOPERM',
      error: 'Mục quản trị CRM chỉ dành cho Super Admin và Admin hệ thống (R01–R02).'};

  const VIEC = ['QUYENCRM_CAP', 'QUYENCRM_THUHOI', 'CRM_XEM', 'CRM_GHI', 'CRMAI_DIEUPHOI'];
  const hoi = VIEC.map(() => '?').join(',');

  const dem = await db.prepare(
    'SELECT viec, COUNT(*) n FROM audit WHERE viec IN (' + hoi + ') GROUP BY viec'
  ).bind(...VIEC).all();
  const tomTat = {};
  VIEC.forEach(v => { tomTat[v] = 0; });
  (dem.results || []).forEach(r => { tomTat[r.viec] = r.n; });

  const nk = await db.prepare(
    'SELECT luc, username, viec, doiTuong, chiTiet FROM audit WHERE viec IN (' + hoi + ') ' +
    'ORDER BY luc DESC LIMIT 100'
  ).bind(...VIEC).all();

  const bay = new Date().toISOString();
  const q = await db.prepare('SELECT muc, thuHoiLuc, hetHan FROM quyenCRM').all();
  let dangCo = 0;
  (q.results || []).forEach(r => {
    if (!r.thuHoiLuc && !(r.hetHan && r.hetHan <= bay)) dangCo++;
  });

  return {ok: true,
    tomTat: {
      capQuyen: tomTat.QUYENCRM_CAP, thuHoiQuyen: tomTat.QUYENCRM_THUHOI,
      luotDoc: tomTat.CRM_XEM, luotCapNhat: tomTat.CRM_GHI,
      dieuPhoiAI: tomTat.CRMAI_DIEUPHOI, quyenDangCo: dangCo
    },
    nhatKy: (nk.results || []).map(r => ({
      luc: r.luc, ai: r.username, viec: r.viec,
      doiTuong: r.doiTuong || '', chiTiet: r.chiTiet || ''})),
    vi: 'Mọi thao tác CRM đã vào nhật ký kèm tên người làm — panel này gom lại, không dựng ' +
        'sổ vết thứ hai. Super Admin kiểm soát cấp quyền ở ngăn "Cấp quyền", vận hành ở đây.'};
}

/* ═══════════════ BẢNG ĐIỀU KHIỂN CRM ═══════════════

   Tầng phân tích — chỗ CRM này mạnh lên: không chỉ một sổ khách mà một
   buồng lái. Mọi con số tính LÚC ĐỌC từ dữ liệu thật, KHÔNG một cột tổng
   nào giữ sẵn (cột tổng hoặc bị gõ đè hoặc cũ đi lặng lẽ). Và mọi con số
   ở đây là ĐO ĐƯỢC — máy đếm thẳng trong sổ, không trộn với một lời khai
   nào (luật phễu 9.99.59). Tôn trọng muc: 'quản lý' đo toàn hệ, vai khác
   đo đúng phần mình phụ trách. */
export async function crmBangDieuKhien(y, env, db, hoSo) {
  const muc = await mucCua(db, hoSo);
  if (!muc) return {ok: false, code: 'NOPERM', error: 'Chưa được cấp quyền CRM.'};
  const toanBo = muc === 'quanly';
  const f = loc(muc, hoSo, {});          /* chỉ lọc theo quyền, không q/chang */
  const bay = new Date().toISOString().slice(0, 10);

  /* MỌI số tính bằng TRUY VẤN GỘP ở SQL — không kéo 100k dòng về máy chủ.
     Đây là chỗ CRM chịu được quy mô lớn: COUNT/GROUP BY chạy trong D1. */
  const demTong = await db.prepare('SELECT COUNT(*) n ' + CRM_JOIN + f.where).bind(...f.binds).first();
  const tongKhach = (demTong && demTong.n) || 0;

  /* Phễu theo chặng — GROUP BY ở SQL, rồi khớp về GIAI_DOAN để chặng vắng
     vẫn hiện 0 (một chặng vắng đọc ra là "không có bước ấy"). */
  const gc = await db.prepare(
    "SELECT COALESCE(c.giaiDoan,'') g, COUNT(*) n " + CRM_JOIN + f.where + ' GROUP BY COALESCE(c.giaiDoan,\'\')'
  ).bind(...f.binds).all();
  const dgc = {};
  (gc.results || []).forEach(r => { dgc[r.g] = r.n; });
  const theoChang = GIAI_DOAN.map(g => ({ma: g.ma, ten: g.ten, n: dgc[g.ma] || 0}));
  const chuaXep = dgc[''] || 0;

  const gb = await db.prepare(
    "SELECT COALESCE(k.band,'XAM') b, COUNT(*) n " + CRM_JOIN + f.where + ' GROUP BY COALESCE(k.band,\'XAM\')'
  ).bind(...f.binds).all();
  const dgb = {}; (gb.results || []).forEach(r => { dgb[r.b] = r.n; });
  const theoBand = ['XANH', 'VANG', 'DO', 'XAM'].map(b => ({band: b, n: dgb[b] || 0}));

  /* Hẹn quá hạn — đếm gộp, và lấy DANH SÁCH tối đa 50 nhà gấp nhất. */
  const dkQH = f.where ? f.where + " AND c.henTiep <> '' AND substr(c.henTiep,1,10) < ?"
                       : " WHERE c.henTiep <> '' AND substr(c.henTiep,1,10) < ?";
  const demQH = await db.prepare('SELECT COUNT(*) n ' + CRM_JOIN + dkQH).bind(...f.binds, bay).first();
  const soQuaHan = (demQH && demQH.n) || 0;
  const dsQH = await db.prepare(
    'SELECT k.maKhachHang mkh, c.henTiep ht, c.giaiDoan gd, c.phuTrach pt ' +
    CRM_JOIN + dkQH + ' ORDER BY substr(c.henTiep,1,10) ASC LIMIT 50'
  ).bind(...f.binds, bay).all();

  /* Nhà chưa có người phụ trách (chỉ có nghĩa với quản lý — vai khác đã lọc). */
  let chuaPhuTrach = 0;
  if (toanBo) {
    const cpt = await db.prepare(
      "SELECT COUNT(*) n " + CRM_JOIN + " WHERE c.phuTrach IS NULL OR c.phuTrach = ''"
    ).first();
    chuaPhuTrach = (cpt && cpt.n) || 0;
  }

  /* Doanh thu ĐÃ DUYỆT. Quản lý → toàn hệ; vai khác → phiếu của nhà mình
     bằng SUBQUERY (không dựng danh sách IN dài). */
  let doanhThu = 0, soPhieu = 0;
  if (toanBo) {
    const t = await db.prepare(
      "SELECT COUNT(*) n, COALESCE(SUM(soTien),0) tong FROM phieuThu WHERE trangThai='daDuyet'"
    ).first();
    doanhThu = (t && t.tong) || 0; soPhieu = (t && t.n) || 0;
  } else {
    const t = await db.prepare(
      "SELECT COUNT(*) n, COALESCE(SUM(soTien),0) tong FROM phieuThu " +
      "WHERE trangThai='daDuyet' AND maKhachHang IN (" +
      "SELECT k.maKhachHang " + CRM_JOIN + f.where + ")"
    ).bind(...f.binds).first();
    doanhThu = (t && t.tong) || 0; soPhieu = (t && t.n) || 0;
  }

  return {ok: true, muc, toanBo, tongKhach,
    theoChang, chuaXep, theoBand,
    quaHan: (dsQH.results || []).map(k => ({maKH: k.mkh, henTiep: k.ht,
      giaiDoan: k.gd || '', phuTrach: k.pt || ''})),
    soQuaHan, chuaPhuTrach, doanhThu, soPhieu,
    vi: toanBo
      ? 'Buồng lái toàn hệ. Mọi số đo bằng truy vấn gộp ở SQL lúc đọc — chịu được trăm nghìn khách, ' +
        'không cột tổng, không lời khai trộn vào.'
      : 'Buồng lái phần bạn phụ trách. Quản lý CRM thấy toàn hệ.'};
}

/* ═══════════════ VIỆC NÊN LÀM — tầng thông minh của CRM ═══════════════

   Đây là chỗ CRM "thông minh": không bắt người ngồi đọc cả sổ rồi tự
   nghĩ nên làm gì, mà ĐỌC dữ liệu thật lúc đọc và XẾP RA việc nên làm,
   GẤP lên trước (luật 9.99.59). Mỗi việc TRỎ vào một CỬA CÓ THẬT —
   không tự làm thay. Máy đề xuất, người/cổng quyết:

   · Cửa được nêu tên vẫn tự kiểm cổng của nó (ghiCham chặn nhắn-vào-nhà-
     đỏ, crmGhiKhach đòi mức 'sửa'…). crmUuTien KHÔNG ghi một dòng nào,
     nên nó không cần — và không được có — răng ghi. Nó chỉ ĐỌC.
   · Nhà đèn ĐỎ nêu việc "GỌI người thật trong 24 giờ", KHÔNG "nhắn" —
     luật 9.99.66: đèn đỏ đóng được bằng tin nhắn thì nó không phải đèn
     đỏ. Việc gọi vẫn phải đi qua ghiCham (cửa ấy chặn DOPHAIGOI).
   · Mọi con số ĐO ĐƯỢC ở SQL, lọc theo quyền (người mức xem/sửa chỉ
     thấy nhà mình) — cùng loc() với danh sách, không lọc tại màn.
   · Không cột tổng giữ sẵn: tính lúc đọc. Không trộn lời khai. */

/* Nối lượt chạm gần nhất của mỗi nhà — để biết nhà nào lâu chưa ai chạm.
   MAX(ngay) gộp ở SQL, không kéo cả sổ chạm về. */
const CRM_JOIN_CHAM =
  CRM_JOIN +
  ' LEFT JOIN (SELECT maNha, MAX(ngay) chamCuoi FROM soCham GROUP BY maNha) sc ' +
  'ON sc.maNha = k.maKhachHang';

function nWhere(f, cond) { return (f.where ? f.where + ' AND ' : ' WHERE ') + cond; }
const UT_CAP = 25; /* mỗi loại việc nêu tối đa 25 nhà gấp nhất — đủ để bắt tay vào */

export async function crmUuTien(y, env, db, hoSo) {
  const muc = await mucCua(db, hoSo);
  if (!muc) return {ok: false, code: 'NOPERM',
    error: 'Chưa được cấp quyền CRM. Super Admin cấp quyền xem/sửa/quản lý trước.'};
  const toanBo = muc === 'quanly';
  const f = loc(muc, hoSo, {});
  const bay = new Date().toISOString().slice(0, 10);
  const nguong = new Date(Date.now() - 7 * 864e5).toISOString().slice(0, 10);

  const cot = 'k.maKhachHang mkh, u.hoTen ht, k.tang tg, k.band bd, ' +
    'c.giaiDoan gd, c.henTiep hen, c.phuTrach pt';

  /* 1 · ĐÈN ĐỎ — gấp nhất, gọi người thật (không nhắn). */
  const wDo = nWhere(f, "k.band = 'DO'");
  const demDo = await db.prepare('SELECT COUNT(*) n ' + CRM_JOIN + wDo).bind(...f.binds).first();
  const dsDo = await db.prepare('SELECT ' + cot + ' ' + CRM_JOIN + wDo +
    ' ORDER BY k.vaoLuc ASC LIMIT ?').bind(...f.binds, UT_CAP).all();

  /* 2 · HẸN TIẾP QUÁ HẠN — gấp, chạm lại và dời hẹn. */
  const wQH = nWhere(f, "c.henTiep <> '' AND substr(c.henTiep,1,10) < ?");
  const demQH = await db.prepare('SELECT COUNT(*) n ' + CRM_JOIN + wQH)
    .bind(...f.binds, bay).first();
  const dsQH = await db.prepare('SELECT ' + cot +
    ', CAST(julianday(?) - julianday(substr(c.henTiep,1,10)) AS INTEGER) treN ' +
    CRM_JOIN + wQH + ' ORDER BY substr(c.henTiep,1,10) ASC LIMIT ?')
    .bind(bay, ...f.binds, bay, UT_CAP).all();

  /* 3 · ĐÈN VÀNG lâu chưa chạm (>7 ngày hoặc chưa chạm lần nào). */
  const wV = nWhere(f, "k.band = 'VANG' AND (sc.chamCuoi IS NULL OR substr(sc.chamCuoi,1,10) < ?)");
  const demV = await db.prepare('SELECT COUNT(*) n ' + CRM_JOIN_CHAM + wV)
    .bind(...f.binds, nguong).first();
  const dsV = await db.prepare('SELECT ' + cot + ', sc.chamCuoi cc ' + CRM_JOIN_CHAM + wV +
    " ORDER BY COALESCE(sc.chamCuoi,'') ASC LIMIT ?").bind(...f.binds, nguong, UT_CAP).all();

  /* 4 · CHƯA XẾP CHẶNG — không xếp thì phễu mù một khúc. */
  const wCC = nWhere(f, "(c.giaiDoan IS NULL OR c.giaiDoan = '')");
  const demCC = await db.prepare('SELECT COUNT(*) n ' + CRM_JOIN + wCC).bind(...f.binds).first();
  const dsCC = await db.prepare('SELECT ' + cot + ' ' + CRM_JOIN + wCC +
    ' ORDER BY k.vaoLuc DESC LIMIT ?').bind(...f.binds, UT_CAP).all();

  /* 5 · CHƯA CÓ NGƯỜI PHỤ TRÁCH — chỉ có nghĩa với quản lý (vai khác đã
     lọc còn nhà mình). Không phụ trách thì không ai lo nhà ấy. */
  let demPT = {n: 0}, dsPT = {results: []};
  if (toanBo) {
    const wPT = " WHERE c.phuTrach IS NULL OR c.phuTrach = ''";
    demPT = await db.prepare('SELECT COUNT(*) n ' + CRM_JOIN + wPT).first();
    dsPT = await db.prepare('SELECT ' + cot + ' ' + CRM_JOIN + wPT +
      ' ORDER BY k.vaoLuc DESC LIMIT ?').bind(UT_CAP).all();
  }

  const nha = (r, extra) => ({
    maKH: r.mkh, hoTen: r.ht || '', tang: r.tg, band: r.bd || '',
    giaiDoan: r.gd || '', henTiep: r.hen || '', phuTrach: r.pt || '', ...extra});

  const gap = []
    .concat((dsDo.results || []).map(r => nha(r, {
      loai: 'do', viec: 'GỌI người thật trong 24 giờ',
      cua: 'ghiCham', vi: 'Đèn đỏ — luật buộc gọi, KHÔNG nhắn (đèn đỏ đóng bằng tin nhắn thì không phải đèn đỏ).'})))
    .concat((dsQH.results || []).map(r => nha(r, {
      loai: 'quahan', soNgay: r.treN || 0, viec: 'Chạm lại và dời hẹn',
      cua: 'crmGhiKhach', vi: 'Hẹn tiếp đã quá ' + (r.treN || 0) + ' ngày — để trôi là mất nhịp.'})));

  const thuong = []
    .concat((dsV.results || []).map(r => nha(r, {
      loai: 'vang', chamCuoi: r.cc || '', viec: 'Chạm để giữ nhịp',
      cua: 'ghiCham', vi: r.cc ? 'Đèn vàng, hơn 7 ngày chưa ai chạm.' : 'Đèn vàng, CHƯA có lượt chạm nào trong sổ.'})))
    .concat((dsCC.results || []).map(r => nha(r, {
      loai: 'chuachang', viec: 'Xếp chặng cho nhà này',
      cua: 'crmGhiKhach', vi: 'Chưa xếp chặng — phễu không đọc được nhà này đang ở đâu.'})))
    .concat((dsPT.results || []).map(r => nha(r, {
      loai: 'chuaphutrach', viec: 'Gán người phụ trách',
      cua: 'crmGhiKhach', vi: 'Chưa ai phụ trách — nhà không người lo là nhà bị bỏ quên.'})));

  const dem = {
    do: (demDo && demDo.n) || 0, quaHan: (demQH && demQH.n) || 0,
    vang: (demV && demV.n) || 0, chuaChang: (demCC && demCC.n) || 0,
    chuaPhuTrach: (demPT && demPT.n) || 0
  };
  dem.tongGap = dem.do + dem.quaHan;
  dem.tongThuong = dem.vang + dem.chuaChang + dem.chuaPhuTrach;

  return {ok: true, muc, toanBo, bay, dem, gap, thuong,
    vi: 'Máy ĐỌC dữ liệu lúc đọc và xếp việc nên làm — GẤP trước. Mỗi việc TRỎ một cửa có ' +
        'thật; bấm là mở nhà rồi làm qua cửa ấy, cửa tự kiểm cổng. Máy KHÔNG tự làm thay — ' +
        'máy đề xuất, người quyết. Đèn đỏ là GỌI người thật, không nhắn.'};
}

/* ═══════════════ GHI / CẬP NHẬT LỚP PHỦ CRM ═══════════════ */
export async function crmGhiKhach(y, env, db, hoSo) {
  const muc = await mucCua(db, hoSo);
  if (!muc || !duMuc(muc, 'sua'))
    return {ok: false, code: 'NOPERM', error: 'Cần quyền CRM mức "sửa" trở lên.'};
  const maKH = String(y.maKH || '').trim();
  if (!maKH) return {ok: false, error: 'Thiếu mã khách hàng.'};

  const kh = await db.prepare('SELECT * FROM hoSoKhach WHERE maKhachHang = ?').bind(maKH).first();
  if (!kh) return {ok: false, error: 'Không tìm thấy khách này.'};

  const cr = await db.prepare('SELECT * FROM crmKhach WHERE maKH = ?').bind(maKH).first();

  /* Quyền 'sửa' chỉ đụng được nhà của mình. */
  if (muc !== 'quanly' && !laCuaMinh(
    {phuTrach: (cr && cr.phuTrach) || '', coach: kh.coach, tuVan: kh.tuVan}, hoSo.u))
    return {ok: false, code: 'NOPERM', error: 'Nhà này không thuộc phần bạn phụ trách.'};

  const giaiDoan = String(y.giaiDoan || '').trim();
  if (giaiDoan && !laMa(giaiDoan)) return {ok: false,
    error: 'Chặng phải là một trong: ' + GIAI_DOAN.map(g => g.ma).join(', ') + '.'};

  /* GÁN NGƯỜI PHỤ TRÁCH là việc của QUẢN LÝ — 'sửa' không đổi được người
     phụ trách (đó là điều phối nhân sự, không phải cập nhật một nhà). */
  let phuTrach = (cr && cr.phuTrach) || '';
  if (y.phuTrach !== undefined) {
    const moi = String(y.phuTrach || '').trim().toLowerCase();
    if (moi !== String(phuTrach || '').toLowerCase()) {
      if (muc !== 'quanly') return {ok: false, code: 'CHIQUANLY',
        error: 'Chỉ quản lý CRM gán được người phụ trách.'};
      if (moi) {
        const nd = await Kho.nguoiTheoTen(db, moi);
        if (!nd) return {ok: false, error: 'Không tìm thấy tài khoản người phụ trách.'};
      }
      phuTrach = moi;
    }
  }

  const henTiep = String(y.henTiep || (cr && cr.henTiep) || '').trim();
  const ghiChu = String(y.ghiChu !== undefined ? y.ghiChu : (cr && cr.ghiChu) || '').slice(0, 2000);
  const gd = giaiDoan || (cr && cr.giaiDoan) || '';
  const luc = new Date().toISOString();

  await db.prepare(
    'INSERT INTO crmKhach (maKH,phuTrach,giaiDoan,henTiep,ghiChu,capNhatLuc,boiAi) ' +
    'VALUES (?,?,?,?,?,?,?) ' +
    'ON CONFLICT(maKH) DO UPDATE SET phuTrach=excluded.phuTrach, giaiDoan=excluded.giaiDoan, ' +
    'henTiep=excluded.henTiep, ghiChu=excluded.ghiChu, capNhatLuc=excluded.capNhatLuc, ' +
    'boiAi=excluded.boiAi'
  ).bind(maKH, phuTrach || null, gd || null, henTiep || null, ghiChu || null, luc, hoSo.u).run();

  await Kho.ghiNhatKy(db, {uid: hoSo.uid, username: hoSo.u, viec: 'CRM_GHI',
    doiTuong: maKH, chiTiet: 'chặng=' + (gd || '—') + ' · phụ trách=' + (phuTrach || '—')});
  return {ok: true, maKH, giaiDoan: gd, phuTrach, henTiep};
}

/* ═══════════════ CƠ HỘI BÁN HÀNG — GHI / CẬP NHẬT ═══════════════
   Cần mức 'sửa' trở lên, và mức 'sửa' chỉ đụng nhà của mình (cùng luật
   crmGhiKhach). Cơ hội THUA phải ghi lý do — để lần sau còn học; một cơ hội
   thua không lý do là một bài học rơi mất. */
export async function crmGhiCoHoi(y, env, db, hoSo) {
  const muc = await mucCua(db, hoSo);
  if (!muc || !duMuc(muc, 'sua'))
    return {ok: false, code: 'NOPERM', error: 'Cần quyền CRM mức "sửa" trở lên.'};

  const maKH = String(y.maKH || '').trim();
  if (!maKH) return {ok: false, error: 'Thiếu mã khách hàng.'};
  const kh = await db.prepare('SELECT * FROM hoSoKhach WHERE maKhachHang = ?').bind(maKH).first();
  if (!kh) return {ok: false, error: 'Không tìm thấy khách này.'};

  const cr = await db.prepare('SELECT phuTrach FROM crmKhach WHERE maKH = ?').bind(maKH).first();
  if (muc !== 'quanly' && !laCuaMinh(
    {phuTrach: (cr && cr.phuTrach) || '', coach: kh.coach, tuVan: kh.tuVan}, hoSo.u))
    return {ok: false, code: 'NOPERM', error: 'Nhà này không thuộc phần bạn phụ trách.'};

  const ten = String(y.ten || '').trim().slice(0, 160);
  if (!ten) return {ok: false, error: 'Cần tên cơ hội (vd: "Nâng Tầng 4", "Gia hạn 365").'};
  const giaTri = Math.round(Number(y.giaTri) || 0);
  if (giaTri <= 0) return {ok: false, code: 'SOAM', error: 'Giá trị dự kiến phải lớn hơn 0.'};
  const giaiDoan = String(y.giaiDoan || 'moi').trim();
  if (!laCoHoiGD(giaiDoan)) return {ok: false,
    error: 'Chặng cơ hội phải là: ' + CO_HOI_GD.map(g => g.ma).join(', ') + '.'};
  const trangThai = String(y.trangThai || 'mo').trim();
  if (COHOI_TT.indexOf(trangThai) < 0)
    return {ok: false, error: 'Trạng thái phải là: mo, thang, thua.'};
  const lyDoThua = String(y.lyDoThua || '').trim().slice(0, 300);
  if (trangThai === 'thua' && !lyDoThua)
    return {ok: false, code: 'THIEULYDO',
      error: 'Cơ hội THUA phải ghi lý do — để lần sau còn học vì sao mất.'};
  const chot = String(y.duKienChot || '').trim().slice(0, 20) || null;
  const luc = new Date().toISOString();
  const id = String(y.id || '').trim();

  if (id) {
    /* Cổng SỬA phải kiểm trên CHÍNH dòng sẽ ghi (chọn theo id), không tin
       maKH người gọi truyền: khai maKH của mình nhưng id cơ hội của người
       khác thì cổng cũ (kiểm laCuaMinh trên y.maKH) vẫn lọt — lỗ IDOR. Nên
       tải nguoiPhuTrach thật của dòng và so với người đang thao tác. */
    const cu = await db.prepare(
      'SELECT id, maKH, nguoiPhuTrach FROM crmCoHoi WHERE id = ?').bind(id).first();
    if (!cu) return {ok: false, error: 'Không tìm thấy cơ hội để cập nhật.'};
    if (muc !== 'quanly' &&
        String(cu.nguoiPhuTrach || '').toLowerCase() !== String(hoSo.u || '').toLowerCase())
      return {ok: false, code: 'NOPERM', error: 'Cơ hội này không thuộc phần bạn phụ trách.'};
    await db.prepare(
      'UPDATE crmCoHoi SET ten=?, giaTri=?, giaiDoan=?, trangThai=?, lyDoThua=?, ' +
      'duKienChot=?, capNhatLuc=?, boiAi=? WHERE id=?'
    ).bind(ten, giaTri, giaiDoan, trangThai, lyDoThua || null, chot, luc, hoSo.u, id).run();
    await Kho.ghiNhatKy(db, {uid: hoSo.uid, username: hoSo.u, viec: 'CRM_COHOI',
      doiTuong: cu.maKH, chiTiet: 'sửa · ' + ten + ' · ' + trangThai});
    return {ok: true, id, maKH: cu.maKH, capNhat: true};
  }

  const moi = 'CH-' + tokenMoi().slice(0, 14);
  await db.prepare(
    'INSERT INTO crmCoHoi (id,maKH,ten,giaTri,giaiDoan,trangThai,lyDoThua,duKienChot,' +
    'nguoiPhuTrach,taoLuc,capNhatLuc,boiAi) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)'
  ).bind(moi, maKH, ten, giaTri, giaiDoan, trangThai, lyDoThua || null, chot,
    hoSo.u, luc, luc, hoSo.u).run();
  await Kho.ghiNhatKy(db, {uid: hoSo.uid, username: hoSo.u, viec: 'CRM_COHOI',
    doiTuong: maKH, chiTiet: 'tạo · ' + ten + ' · ' + giaTri + 'đ'});
  return {ok: true, id: moi, maKH, giaTri};
}

/* ═══════════════ CƠ HỘI — PHỄU DỰ BÁO DOANH THU ═══════════════
   Giá trị TRỌNG SỐ = Σ(giá trị × xác suất theo chặng) — tính LÚC ĐỌC, không
   lưu cột trọng số (xác suất đổi thì mọi dòng cũ sai). GROUP BY ở SQL nên
   chịu được số cơ hội lớn. Lọc quyền theo nguoiPhuTrach (vai dưới quản lý chỉ
   thấy cơ hội mình đẩy) — cùng lối lọc-ở-truy-vấn. */
export async function crmCoHoi(y, env, db, hoSo) {
  const muc = await mucCua(db, hoSo);
  if (!muc) return {ok: false, code: 'NOPERM', error: 'Chưa được cấp quyền CRM.'};
  const toanBo = muc === 'quanly';
  const rieng = toanBo ? '' : ' AND nguoiPhuTrach = ?';
  const bMo = toanBo ? [] : [hoSo.u];

  const gd = await db.prepare(
    "SELECT giaiDoan, COUNT(*) n, COALESCE(SUM(giaTri),0) tong FROM crmCoHoi " +
    "WHERE trangThai='mo'" + rieng + ' GROUP BY giaiDoan'
  ).bind(...bMo).all();
  const dgd = {};
  (gd.results || []).forEach(r => { dgd[r.giaiDoan] = {n: r.n, tong: Number(r.tong || 0)}; });

  let tongGiaTri = 0, tongTrongSo = 0, tongMo = 0;
  const theoGiaiDoan = CO_HOI_GD.map(g => {
    const o = dgd[g.ma] || {n: 0, tong: 0};
    const trongSo = Math.round(o.tong * g.xs / 100);
    tongGiaTri += o.tong; tongTrongSo += trongSo; tongMo += o.n;
    return {ma: g.ma, ten: g.ten, xs: g.xs, n: o.n, giaTri: o.tong, trongSo};
  });

  const thang = await db.prepare(
    "SELECT COUNT(*) n, COALESCE(SUM(giaTri),0) tong FROM crmCoHoi WHERE trangThai='thang'" + rieng
  ).bind(...bMo).first();
  const thua = await db.prepare(
    "SELECT COUNT(*) n, COALESCE(SUM(giaTri),0) tong FROM crmCoHoi WHERE trangThai='thua'" + rieng
  ).bind(...bMo).first();

  const ds = await db.prepare(
    'SELECT id,maKH,ten,giaTri,giaiDoan,duKienChot,nguoiPhuTrach FROM crmCoHoi ' +
    "WHERE trangThai='mo'" + rieng + ' ORDER BY capNhatLuc DESC LIMIT 100'
  ).bind(...bMo).all();

  const soThang = (thang && thang.n) || 0, soThua = (thua && thua.n) || 0;
  const tyLeThang = (soThang + soThua) > 0 ? Math.round(soThang / (soThang + soThua) * 100) : null;

  return {ok: true, muc, toanBo, theoGiaiDoan, tongGiaTri, tongTrongSo, tongMo,
    thang: {n: soThang, tong: Number((thang && thang.tong) || 0)},
    thua: {n: soThua, tong: Number((thua && thua.tong) || 0)}, tyLeThang,
    giaiDoanCoThe: CO_HOI_GD,
    ds: (ds.results || []).map(x => ({id: x.id, maKH: x.maKH, ten: x.ten,
      giaTri: Number(x.giaTri || 0), giaiDoan: x.giaiDoan,
      duKienChot: x.duKienChot || '', nguoiPhuTrach: x.nguoiPhuTrach || ''})),
    vi: (toanBo ? 'Phễu cơ hội toàn hệ. ' : 'Phễu cơ hội bạn đang đẩy. ') +
      'Giá trị TRỌNG SỐ = Σ(giá trị × xác suất theo chặng) — dự báo sát hơn tổng thô. ' +
      'Chỉ tính cơ hội ĐANG MỞ; thắng/thua để riêng. Tỷ lệ thắng = thắng / (thắng + thua).'};
}
