/* ═══════════════════════════════════════════════════════════════
   GITA 365 · CỬA VÀO MỚI — QUYỀN XEM HỒ SƠ KHÁCH, VÀ NÂNG TẦNG

   ══ BA CHIỀU, KHÔNG PHẢI MỘT ══

   Chủ hệ chốt: Tư vấn và Coach xem tầng 1-2-3; tầng 4-5 từ Coach lên
   tới Super Admin; Giáo viên, ban tài chính, ban sản phẩm không xem; và
   ai cũng phải được Super Admin cấp quyền.

   Luật ấy KHÔNG viết được bằng một cái thang bậc, và chỗ gãy nằm đúng ở
   người vừa bị gạch tên: Coach lv 7 · GIÁO VIÊN lv 8 · Tư vấn lv 11. Mở
   bậc tới 11 cho Tư vấn là Giáo viên lọt vào giữa. Nên ba chiều tách
   hẳn nhau:

     1. TRẦN VAI     — vai này đủ điều kiện xem tầng nào (danh sách trắng)
     2. GIẤY PHÉP    — Super Admin đã cấp chưa, còn hạn không
     3. TRẦN MỤC     — vai này xem được mục nào trong ba mục

   Đủ chiều một mà thiếu chiều hai vẫn là không. Đủ cả hai mà thiếu
   chiều ba cũng vẫn là không — Chuyên gia đánh giá đủ trần tầng 4-5
   nhưng chỉ được mục kpi.

   ══ VÌ SAO PHẢI CÓ CỬA NÀY, KHÔNG GÓI VÀO KHO ══

   Một gói kho đã cấp thì không gọi ngược về được: gỡ giấy phép hôm nay
   không xoá được bản sao nằm trong máy người ta từ hôm qua. Gói thi
   hành được TRẦN VAI mà không thi hành được GIẤY PHÉP THU HỒI ĐƯỢC.

   Nên hồ sơ MẪU đi theo gói, còn hồ sơ khách hàng THẬT đi qua đúng cửa
   này — có kiểm giấy phép và ghi sổ từng lượt. Cái giá là mất mạng thì
   không mở được, và nó đáng.
   ═══════════════════════════════════════════════════════════════ */

import { Kho, tokenMoi } from './nen.js';
import { ghiDoiTang } from './ho-so-khach.js';
import { sinhHoaHong } from './tai-chinh.js';

/* ── TRẦN VAI ──
   PHẢI khớp từng chữ với G.XK_TRAN trong kho. Khai lại ở đây không phải
   vì thích: máy chủ không đọc được kho đã mã hoá, nên ĐÂY là bản duy
   nhất có hiệu lực. Bản trong kho là bản để màn hình giải thích cho
   người đọc; bản này là bản CHẶN. Lệch một vai thì bản chặn thắng, và
   người dùng bị từ chối mà màn hình không giải thích được vì sao. */
const XK_TRAN = [
  {tang: ['T1', 'T2', 'T3'], vai: ['R01','R02','R03','R04','R05','R06','R07','R09','R10','R11']},
  {tang: ['T4', 'T5'],       vai: ['R01','R02','R03','R04','R05','R06','R07','R10']}
];

/* Chiều thứ BA — vai nào xem được mục nào. Vai không có tên ở đây thì
   xem đủ ba mục. Cũng phải khớp với G.XK_VAI_MUC trong kho. */
const XK_VAI_MUC = {R10: ['kpi']};
const XK_MUC = ['kpi', 'nhiemvu', 'hoso'];

/* Chỉ vai này cấp được quyền xem. */
const AI_CAP = 'R01';

const mucCuaVai = vai => XK_VAI_MUC[String(vai)] || XK_MUC;

const maTang = t => {
  t = String(t == null ? '' : t);
  return /^T[1-5]$/.test(t) ? t : (/^[1-5]$/.test(t) ? 'T' + t : '');
};

/** Vai này có nằm trong trần của tầng kia không. Nguồn sự thật của cả tệp. */
function duTran(vai, tang) {
  const t = maTang(tang);
  if (!t) return false;
  for (const d of XK_TRAN)
    if (d.tang.indexOf(t) >= 0) return d.vai.indexOf(String(vai)) >= 0;
  return false;
}

/** Những tầng một vai ĐỦ ĐIỀU KIỆN xem. Chưa nói tới giấy phép. */
function tranCuaVai(vai) {
  const ra = [];
  for (const d of XK_TRAN)
    if (d.vai.indexOf(String(vai)) >= 0) for (const t of d.tang) ra.push(t);
  return ra;
}

/** Giấy phép CÒN HIỆU LỰC của một tài khoản.

    Hết hạn thì TỰ TẮT — không chờ ai nhớ ra đi gỡ. Một quyền chỉ mất
    khi có người chủ động gỡ là một quyền sẽ ở lại mãi.

    Lọc hết hạn ở TRONG câu lệnh, không lọc sau khi đọc về: lọc sau thì
    một dòng hết hạn vẫn đi qua đường truyền một lần, và ngày ai đó quên
    đoạn lọc ấy thì nó có hiệu lực. */
async function phepCua(db, u) {
  return await db.prepare(
    'SELECT * FROM quyenXem WHERE nguoiDuocCap = ? ' +
    "AND (thuHoiLuc IS NULL OR thuHoiLuc = '') AND hetHan > ? " +
    'ORDER BY capLuc DESC LIMIT 1'
  ).bind(String(u || '').toLowerCase(), new Date().toISOString()).first();
}

const tangCuaPhep = p => String(p && p.tangDuocXem || '').split(',').filter(Boolean);

/* ═══════════════ CẤP QUYỀN ═══════════════ */
export async function capQuyenXem(y, env, db, hoSo) {
  if (String(hoSo.role) !== AI_CAP)
    return {ok: false, error: 'Chỉ Super Admin cấp được quyền xem hồ sơ khách hàng.'};

  const c = y.cap || {};
  const ai = String(c.nguoiDuocCap || '').trim().toLowerCase();
  const vai = String(c.vai || '').trim();
  const lyDo = String(c.lyDo || '').trim();
  if (!ai || !vai) return {ok: false, error: 'Thiếu tài khoản hoặc vai được cấp.'};
  if (!lyDo) return {ok: false, error: 'Chưa nói vì sao cấp. Không cấp quyền mà không có lý do.'};

  const xin = (Array.isArray(c.tang) ? c.tang : []).map(maTang).filter(Boolean);
  if (!xin.length) return {ok: false, error: 'Chưa chọn tầng nào.'};

  /* TRẦN CHẶN THẬT, KỂ CẢ VỚI SUPER ADMIN.

     Đây là chỗ luật này khác một lời khuyên. Trần mà người cao nhất phá
     được thì nó không phải trần — và một lời khuyên thì tới ngày bận
     việc sẽ có người bỏ qua. */
  const vuot = xin.filter(t => !duTran(vai, t));
  if (vuot.length)
    return {ok: false, vuotTran: vuot,
      error: 'Vai ' + vai + ' không được phép xem tầng ' +
        vuot.map(t => t.slice(1)).join(', ') +
        '. Trần vai không cấp vượt được, kể cả bởi Super Admin.'};

  /* Hết hạn là BẮT BUỘC: giấy phép không hạn thì hôm giao là giao mãi. */
  if (!c.hetHan) return {ok: false, error: 'Chưa đặt ngày hết hạn cho giấy phép.'};
  const han = new Date(c.hetHan);
  if (isNaN(han.getTime()) || han <= new Date())
    return {ok: false, error: 'Ngày hết hạn phải là một ngày trong tương lai.'};

  if (await phepCua(db, ai))
    return {ok: false, error: 'Tài khoản này đang có giấy phép còn hiệu lực. ' +
      'Thu hồi bản cũ trước khi cấp bản mới — hai giấy phép cùng lúc thì ' +
      'không ai biết bản nào đang chạy.'};

  const id = 'QX-' + tokenMoi().slice(0, 12);
  await db.prepare(
    'INSERT INTO quyenXem (id,nguoiDuocCap,vai,tangDuocXem,nguoiCap,capLuc,hetHan,lyDo) ' +
    'VALUES (?,?,?,?,?,?,?,?)'
  ).bind(id, ai, vai, xin.join(','), hoSo.u, new Date().toISOString(),
    han.toISOString(), lyDo).run();

  await Kho.ghiNhatKy(db, {uid: hoSo.uid, username: hoSo.u, viec: 'QUYENXEM_CAP',
    doiTuong: ai, chiTiet: vai + ' · ' + xin.join(',') + ' · ' + lyDo});
  return {ok: true, id, nguoiDuocCap: ai, tang: xin, hetHan: han.toISOString()};
}

/* ═══════════════ THU HỒI ═══════════════ */
export async function thuHoiQuyenXem(y, env, db, hoSo) {
  if (String(hoSo.role) !== AI_CAP)
    return {ok: false, error: 'Chỉ Super Admin thu hồi được quyền xem.'};

  const p = await phepCua(db, String(y.nguoiDuocCap || ''));
  if (!p) return {ok: false, error: 'Tài khoản này không có giấy phép nào đang hiệu lực.'};

  /* THU HỒI LÀ ĐÁNH DẤU, KHÔNG XOÁ DÒNG. Xoá là xoá luôn bằng chứng đã
     từng cấp — đúng thứ cần trả lời khi có chuyện. */
  const gio = new Date().toISOString();
  await db.prepare('UPDATE quyenXem SET thuHoiLuc = ?, thuHoiBoi = ? WHERE id = ?')
    .bind(gio, hoSo.u, p.id).run();

  await Kho.ghiNhatKy(db, {uid: hoSo.uid, username: hoSo.u, viec: 'QUYENXEM_THUHOI',
    doiTuong: String(y.nguoiDuocCap || ''), chiTiet: p.tangDuocXem});
  return {ok: true, thuHoiLuc: gio};
}

/* ═══════════════ TỰ SOI ═══════════════

   Trả về CẢ trần lẫn giấy phép, vì hai câu "vai anh không được phép" và
   "vai anh được phép nhưng chưa ai cấp quyền" dẫn tới hai việc khác
   hẳn nhau cho người đọc. */
export async function soiQuyenXem(y, env, db, hoSo) {
  const tran = tranCuaVai(hoSo.role);
  const muc = mucCuaVai(hoSo.role);
  const p = await phepCua(db, hoSo.u);
  if (!p) return {ok: true, tang: [], tranVai: tran, muc, coGiayPhep: false};

  /* TRẦN ĐỌC LẠI LÚC DÙNG, KHÔNG TIN CỘT ĐÃ GHI.

     Vai của một người đổi được SAU khi giấy phép đã cấp — hạ bậc, đổi
     việc — và lúc ấy giấy phép cũ vẫn nằm nguyên trong bảng với cột vai
     cũ. Tin cột ấy là để một người vừa bị hạ bậc giữ nguyên quyền xem
     tầng cao cho tới ngày giấy phép hết hạn. */
  const con = tangCuaPhep(p).filter(t => duTran(hoSo.role, t));
  return {ok: true, tang: con, tranVai: tran, muc, coGiayPhep: true,
    hetHan: p.hetHan, nguoiCap: p.nguoiCap, lyDo: p.lyDo,
    tutTheoVai: con.length < tangCuaPhep(p).length};
}

/* ═══════════════ XEM HỒ SƠ KHÁCH TẦNG CAO ═══════════════

   Đây là cửa duy nhất tới dữ liệu ấy, nên mỗi lượt qua cửa là MỘT DÒNG
   SỔ — kể cả lượt bị từ chối. Không phải để rình người của mình: để
   ngày một hồ sơ rò ra ngoài thì trả lời được câu "ai đã mở nó". Câu
   ấy chỉ trả lời được nếu hôm nay đã ghi; ghi sau khi mất thì không
   ghi được nữa. */
export async function xemKhachCao(y, env, db, hoSo) {
  const muc = mucCuaVai(hoSo.role);

  /* Trả về HỒ SƠ, nên phải qua cổng mục 'hoso'. Chuyên gia đánh giá đủ
     trần tầng 4-5 nhưng chỉ được mục kpi — đủ tầng mà không đủ mục thì
     vẫn là không. */
  if (muc.indexOf('hoso') < 0) {
    await Kho.ghiNhatKy(db, {uid: hoSo.uid, username: hoSo.u,
      viec: 'XEMKHACH_TUCHOI', doiTuong: hoSo.role, chiTiet: 'ngoài mục hoso'});
    return {ok: false, code: 'NOPERM',
      error: 'Vai này không xem được hồ sơ khách hàng. Chỉ xem được: ' + muc.join(', ') + '.'};
  }

  const q = await soiQuyenXem(y, env, db, hoSo);
  const cao = q.tang.filter(t => t === 'T4' || t === 'T5');
  if (!cao.length) {
    await Kho.ghiNhatKy(db, {uid: hoSo.uid, username: hoSo.u, viec: 'XEMKHACH_TUCHOI',
      doiTuong: hoSo.role, chiTiet: q.coGiayPhep ? 'ngoài trần' : 'chưa có giấy phép'});
    /* HAI CÂU TỪ CHỐI KHÁC NHAU, vì chúng dẫn tới hai việc khác nhau:
       một bên đi xin giấy phép, một bên thì xin cũng không được. */
    return {ok: false, code: 'NOPERM',
      error: q.coGiayPhep
        ? 'Giấy phép của tài khoản này không gồm tầng 4-5.'
        : 'Chưa được Super Admin cấp quyền xem hồ sơ khách hàng.'};
  }

  /* Lọc theo tầng ở TRONG câu lệnh, qua ix_students_tier. Nền cũ đọc cả
     bảng học viên rồi lọc trong bộ nhớ — ở nửa triệu hồ sơ thì đó là
     đọc cả nửa triệu dòng để trả về vài chục. */
  const dau = cao.map(() => '?').join(',');
  const r = await db.prepare(
    'SELECT * FROM students WHERE tier IN (' + dau + ') AND deletedAt IS NULL LIMIT 500'
  ).bind(...cao.map(t => Number(t.slice(1)))).all();
  const ds = r.results || [];

  await Kho.ghiNhatKy(db, {uid: hoSo.uid, username: hoSo.u, viec: 'XEMKHACH_CAO',
    doiTuong: cao.join(','), chiTiet: ds.length + ' hồ sơ'});
  return {ok: true, tang: cao, so: ds.length, nha: ds};
}

/* ═══════════════ NÂNG TẦNG ═══════════════

   Luồng chủ hệ đặt: hoàn thành KPI tầng → xác nhận thanh toán → kiểm cả
   hai → nâng tầng → mở quyền tương ứng.

   MÁY CHỦ KHÔNG TỰ NÂNG. Phải có người bậc ≤ 3 bấm, cả hai điều kiện
   phải đúng, và thiếu cái nào thì từ chối kèm lý do rõ ràng. */
const BAC = {R01:1,R02:2,R03:3,R04:4,R05:5,R06:6,R07:7,R08:8,
             R09:9,R10:10,R11:11,R12:12,R13:13,R14:14,R15:15};
const CUA_KPI = 80;

export async function nangTang(y, env, db, hoSo) {
  const lv = BAC[hoSo.role] || 99;
  if (lv > 3) return {ok: false, error: 'Chỉ R01–R03 nâng tầng được.'};

  const hv = await db.prepare('SELECT * FROM students WHERE id = ?')
    .bind(String(y.maHocVien || '')).first();
  if (!hv) return {ok: false, error: 'Không tìm thấy hồ sơ học viên.'};

  const tangMoi = Number(y.tang || 0);
  if (!(tangMoi >= 1 && tangMoi <= 5)) return {ok: false, error: 'Tầng phải từ 1 đến 5.'};
  if (tangMoi !== Number(hv.tier || 0) + 1)
    return {ok: false, error: 'Chỉ nâng được một tầng mỗi lần, theo thứ tự.'};

  const kpi = Number(hv.kpi || 0);
  if (kpi < CUA_KPI)
    return {ok: false, error: 'KPI tầng đang là ' + kpi + '%. Cửa nâng tầng là ' + CUA_KPI + '%.'};

  /* MÃ KHÁCH HÀNG PHẢI LÀ MÃ CỦA CHÍNH NHÀ NÀY.

     Trước bản 9.44 mã lấy thẳng từ thân yêu cầu và không đối chiếu với
     hồ sơ học viên, nên một phiếu thanh toán của nhà A mở được tầng cho
     con nhà B — chỉ cần gõ nhầm, hoặc cố ý gõ mã của nhà A. */
  const ph = await Kho.nguoiTheoId(db, hv.phuHuynhId);
  const maNha = ph && ph.maKhachHang;
  if (!maNha) return {ok: false, error: 'Hồ sơ học viên chưa gắn với tài khoản phụ huynh nào.'};
  if (String(y.maKhachHang || '') !== String(maNha))
    return {ok: false, error: 'Mã khách hàng không khớp với hồ sơ học viên này.'};

  /* PHIẾU THANH TOÁN DÙNG MỘT LẦN. Không đánh dấu thì cùng một phiếu mở
     được tầng cho bao nhiêu học viên cũng được.

     Và việc đánh dấu phải là một câu lệnh CÓ ĐIỀU KIỆN daDung = 0: hai
     người cùng bấm nâng tầng trong một giây thì cả hai đều đọc thấy
     phiếu chưa dùng, và nếu chỉ ghi đè thì cả hai cùng nâng. Ở đây câu
     UPDATE tự nó là chỗ giành phiếu — ai đổi được dòng thì người ấy
     được, người kia nhận 0 dòng đổi và dừng lại. */
  const tt = await db.prepare(
    "SELECT * FROM thanhToan WHERE maKhachHang = ? AND tier = ? " +
    "AND trangThai = 'daXacNhan' AND (daDung IS NULL OR daDung = 0) LIMIT 1"
  ).bind(String(maNha), tangMoi).first();
  if (!tt) return {ok: false,
    error: 'Chưa có xác nhận thanh toán còn hiệu lực cho tầng ' + tangMoi + '.'};

  const gianh = await db.prepare(
    'UPDATE thanhToan SET daDung = 1, dungChoHocVien = ?, dungLuc = ? ' +
    'WHERE id = ? AND (daDung IS NULL OR daDung = 0)'
  ).bind(hv.id, new Date().toISOString(), tt.id).run();
  if (!((gianh && gianh.meta && gianh.meta.changes) || 0))
    return {ok: false, error: 'Phiếu thanh toán vừa được dùng cho một lượt nâng khác. ' +
      'Kiểm lại rồi thử lại.'};

  await db.prepare("UPDATE students SET tier = ?, status = 'dangHoc' WHERE id = ?")
    .bind(tangMoi, hv.id).run();

  /* BA VIỆC ĐI CÙNG MỘT LƯỢT VƯỢT TẦNG, và đây là chỗ nền cũ chỉ làm
     một: đổi cột tier rồi thôi.

       · ghi LỊCH SỬ — "nhà này lên tầng ba lúc nào, ai duyệt, KPI bao
         nhiêu" là câu hỏi hằng tuần, chỉ trả lời được nếu hôm ấy đã ghi
       · dựng LỊCH THU của tầng mới — một nhà lên tầng mà không có lịch
         thu là một nhà học không có ai đòi tiền
       · sinh HOA HỒNG cho nhà bảo trợ, nếu có */
  const soKy = await ghiDoiTang(db, {maKhachHang: maNha,
    tuTang: Number(hv.tier || 0), denTang: tangMoi, kpi, boi: hoSo.u,
    lyDo: 'phiếu ' + tt.id,
    /* Mang theo chỗ trỏ để ghiDoiTang mở được tệp cho nhà chuyển từ nền
       cũ sang — xem chú giải ở ho-so-khach.js. */
    uidPhuHuynh: ph.id, maHocVien: hv.id});
  const hh = await sinhHoaHong(db, maNha, tangMoi, kpi);

  await Kho.ghiNhatKy(db, {uid: hoSo.uid, username: hoSo.u, viec: 'NANG_TANG',
    doiTuong: hv.id, chiTiet: 'Lên tầng ' + tangMoi + ' · KPI ' + kpi +
      '% · phiếu ' + tt.id + ' · nhà ' + maNha + ' · ' + soKy + ' kỳ thu' +
      (hh ? ' · hoa hồng ' + hh.bac + ' ' + hh.soTien + 'đ cho ' + hh.nhaKem : '')});
  return {ok: true, tang: tangMoi, kpi, soKyThu: soKy, hoaHong: hh || undefined};
}
