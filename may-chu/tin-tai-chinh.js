/* ═══════════════════════════════════════════════════════════════
   GITA 365 · CỬA VÀO MỚI — BẢNG TIN PHÒNG TÀI CHÍNH

   Chốt của chủ hệ thống bản 9.99.3: kế toán trưởng chủ động cập nhật
   lên hệ, và có phương án xử lý ngay khi thấy thông tin quan trọng;
   tin phân cấp bằng MÀU để biết xử lý cái nào trước.

   ══ CHỖ HỎNG CỦA MỌI HỆ PHÂN CẤP MÀU ══

   Mức độ do người đăng tự chọn thì ai cũng chọn ĐỎ. Sau ba tháng cả
   bảng đỏ, và màu thôi mang nghĩa gì — lúc ấy người ta đọc từ trên
   xuống như một danh sách thường, đúng cái mà phân cấp sinh ra để
   tránh.

   Ba lớp chặn ở đây, và KHÔNG lớp nào cấm người ta đặt ĐỎ. Cấm là sai
   hướng: người biết việc của mình gấp mà bị chặn thì họ tìm đường khác,
   thường là gọi điện — và lúc ấy tin không nằm trong hệ nữa.

     1. Tin do MÁY sinh lấy mức từ LUẬT. Không ai chọn được, nên phần
        lớn tin trên bảng có mức đúng theo định nghĩa.
     2. Người đặt ĐỎ phải ghi VÌ SAO GẤP. Một câu, và câu ấy ở lại
        trong dòng cho người sau đọc — kể cả người đặt màu đọc lại
        chính mình tháng sau.
     3. TỶ LỆ TIN ĐỎ hiện ngay trên bảng. Đỏ hết thì con số ấy nói ra,
        và nó nói với chính người đang đặt màu.

   ══ MỘT TIN CÓ MÀU MÀ KHÔNG CÓ NGƯỜI VÀ KHÔNG CÓ HẠN LÀ MỘT CÁI MÀU ══

   Mức ĐỎ và CAM bắt buộc có người nhận và hạn xử lý. Không có chúng
   thì tin nằm đó, ai đọc cũng nghĩ người khác lo, và cái màu chỉ làm
   mọi người cùng lo mà không ai làm.

   ══ ĐÓNG MỘT TIN PHẢI NÓI ĐÃ LÀM GÌ ══

   Không có ô "đã xử lý" trống. Đóng mà không nói cách xử lý thì ba
   tháng sau cùng chuyện ấy lặp lại, và không ai biết lần trước đã làm
   gì — bảng tin thành một chỗ để đánh dấu cho hết việc.
   ═══════════════════════════════════════════════════════════════ */

import { Kho, tokenMoi } from './nen.js';
import { quyenCua, oDauTien, VI_TRI_TC } from './chi-tieu.js';

const BAC = {R01:1,R02:2,R03:3,R04:4,R05:5,R06:6,R07:7,R08:8,
             R09:9,R10:10,R11:11,R12:12,R13:13,R14:14,R15:15};

/* Bốn bậc. Mã màu KHÔNG nằm ở đây — nó nằm ở biến CSS của giao diện
   (--bad, --alert, --warn, --ok), vốn đã tính cả nền sáng lẫn nền tối.
   Gõ mã màu ở máy chủ là dựng bản thứ hai của bảng màu, và bản thứ hai
   thì không đổi theo nền. */
const MUC_DO = {
  do:   {ten: 'Gấp',       thu: 1, canNguoi: true,  canHan: true,
         y: 'Tiền đang chảy sai. Xử lý trong ngày.'},
  cam:  {ten: 'Cần xem',   thu: 2, canNguoi: true,  canHan: true,
         y: 'Chưa mất tiền nhưng sẽ mất nếu để lâu. Xử lý trong tuần.'},
  vang: {ten: 'Theo dõi',  thu: 3, canNguoi: false, canHan: false,
         y: 'Cần một cặp mắt, không gấp.'},
  xanh: {ten: 'Tin thường', thu: 4, canNguoi: false, canHan: false,
         y: 'Ghi lại để người sau biết.'}
};

const TRANG_THAI = ['moi', 'dangXuLy', 'daXuLy', 'boQua'];

/** Ai đứng trong phòng tài chính, hoặc là quản lý. */
async function trongPhong(db, hoSo) {
  const lv = BAC[hoSo.role] || 99;
  const q = await quyenCua(db, hoSo.u);
  return {duoc: lv <= 3 || q.keToanThu || q.keToanChi || q.keToanTruong,
    quyen: q, lv};
}

/* ═══════════════ ĐĂNG MỘT TIN ═══════════════ */
export async function dangTinTaiChinh(y, env, db, hoSo) {
  const {duoc, quyen} = await trongPhong(db, hoSo);
  if (!duoc) return {ok: false, code: 'NOPERM',
    error: 'Chỉ R01–R03 hoặc người của phòng tài chính đăng được tin.'};

  const t = y.tin || {};
  const muc = String(t.mucDo || '').trim();
  const tieuDe = String(t.tieuDe || '').trim();
  const than = String(t.than || '').trim();

  if (!MUC_DO[muc]) return {ok: false,
    error: 'Mức độ phải là một trong: ' + Object.keys(MUC_DO).join(', ') + '.'};
  if (tieuDe.length < 5) return {ok: false, error: 'Tiêu đề quá ngắn.'};
  if (than.length < 10) return {ok: false,
    error: 'Chưa nói rõ chuyện gì. Một tin không có nội dung thì người đọc phải đi ' +
           'hỏi lại, và lúc ấy bảng tin không tiết kiệm được gì.'};

  /* ── ĐẶT ĐỎ THÌ PHẢI NÓI VÌ SAO GẤP ──
     Không cấm đặt đỏ — cấm là sai hướng, người biết việc mình gấp mà
     bị chặn thì họ gọi điện, và tin ra khỏi hệ. Chỉ đòi một câu, và
     câu ấy ở lại cho người sau đọc. */
  const viSao = String(t.viSaoGap || '').trim();
  if (muc === 'do' && viSao.length < 10)
    return {ok: false, code: 'THIEUVISAO',
      error: 'Đặt mức GẤP thì phải ghi VÌ SAO GẤP. Không cấm bạn đặt đỏ — chỉ ' +
             'đòi một câu, và câu ấy ở lại trong dòng cho người sau đọc.'};

  /* ── CÓ MÀU THÌ PHẢI CÓ NGƯỜI VÀ CÓ HẠN ── */
  const giao = String(t.giaoCho || '').trim();
  const han = String(t.hanXuLy || '').trim();
  const md = MUC_DO[muc];
  if (md.canNguoi && !giao)
    return {ok: false, code: 'THIEUNGUOI',
      error: 'Mức ' + md.ten + ' phải giao cho một người. Một tin có màu mà không ' +
             'có người là một cái màu: ai đọc cũng nghĩ người khác lo.'};
  if (md.canHan && !han)
    return {ok: false, code: 'THIEUHAN',
      error: 'Mức ' + md.ten + ' phải có hạn xử lý.'};
  if (han && isNaN(new Date(han).getTime()))
    return {ok: false, error: 'Hạn xử lý không đọc được.'};

  const id = 'TIN-' + tokenMoi().slice(0, 14);
  await db.prepare(
    /* HẰNG SỐ 'nguoiDang' PHẢI NẰM Ở Ô loai, KHÔNG PHẢI Ô tieuDe.
       Tới 9.99.8 nó nằm nhầm một ô: loai nhận tiêu đề, còn tieuDe nhận
       đúng chữ "nguoiDang" — nên MỌI tin do người đăng hiện tiêu đề là
       chữ ấy, và tiêu đề thật nằm im trong cột loai. Bộ thử xanh suốt
       vì nó đo ok, đo thứ tự xếp, đo số đếm — chưa bao giờ đọc lại
       tiêu đề xem có đúng cái vừa gửi không. Chạy demo mới thấy. */
    'INSERT INTO tinTaiChinh (id,mucDo,loai,tieuDe,than,viSaoGap,doiTuong,tuMay,' +
    "nguoiDang,luc,giaoCho,hanXuLy,trangThai) VALUES (?,?,'nguoiDang',?,?,?,?,0,?,?,?,?,'moi')"
  ).bind(id, muc, tieuDe.slice(0, 200), than.slice(0, 2000),
    viSao.slice(0, 500) || null, String(t.doiTuong || '').slice(0, 60) || null,
    hoSo.u, new Date().toISOString(), giao || null, han || null).run();

  await Kho.ghiNhatKy(db, {uid: hoSo.uid, username: hoSo.u, viec: 'TIN_DANG',
    doiTuong: id, chiTiet: muc + ' · ' + tieuDe.slice(0, 100)});
  return {ok: true, id, mucDo: muc, tenMuc: md.ten};
}

/* ═══════════════ AI ĐANG TRỰC MỘT ĐẦU VIỆC ═══════════════

   Máy không biết tên người. Nó chỉ biết đầu việc — 'thu' hay 'chi' —
   nên hỏi bảng quyền xem ai đang giữ đầu ấy. Kế toán trưởng giữ cả hai
   đầu nên đứng sau, chỉ nhận khi không có người chuyên trách: giao
   thẳng cho trưởng phòng mọi việc thì trưởng phòng thành hộp thư. */
async function nguoiTruc(db, dau) {
  const cn = dau === 'thu' ? 'keToanThu' : dau === 'chi' ? 'keToanChi' : null;
  const bay = new Date().toISOString();
  const r = await db.prepare(
    'SELECT username, chucNang FROM quyenTaiChinh WHERE thuHoiLuc IS NULL ' +
    'AND (hetHan IS NULL OR hetHan > ?) AND chucNang IN (?, ?) ' +
    'ORDER BY CASE chucNang WHEN ? THEN 0 ELSE 1 END, capLuc DESC LIMIT 1'
  ).bind(bay, cn || 'keToanTruong', 'keToanTruong', cn || 'keToanTruong').first();
  return (r && r.username) || null;
}

/* ═══════════════ MÁY TỰ ĐĂNG MỘT TIN ═══════════════

   Gọi từ những chỗ máy phát hiện chuyện đáng nói. Mức lấy từ LUẬT của
   chỗ gọi, không ai chọn được — đó là lớp chặn thứ nhất của cả hệ phân
   cấp màu này.

   Không ném ra bao giờ: chỗ gọi đang làm một việc khác (duyệt chi,
   đối chiếu), và một dòng tin hỏng không được kéo đổ việc ấy. */
export async function mayDangTin(db, {mucDo, loai, tieuDe, than, doiTuong,
    giaoCho, hanXuLy, dau, soNgayHan}) {
  try {
    if (!MUC_DO[mucDo]) return null;
    let muc = mucDo, giao = giaoCho || null, han = hanXuLy || null, phu = '';

    /* ── LUẬT "CÓ MÀU THÌ PHẢI CÓ NGƯỜI" ÁP CHO CẢ MÁY ──
       Người đăng bị chặn ở cửa; máy thì không có cửa nào chặn được, nên
       nó phải tự giữ. Không tìm ra người trực thì HẠ MỨC xuống 'theo
       dõi' chứ không đăng một cái màu không có chủ — vì một cái màu
       không có chủ chính là thứ làm cả bảng mất nghĩa. */
    if (MUC_DO[muc].canNguoi && !giao) {
      giao = await nguoiTruc(db, dau);
      if (!giao) {
        muc = 'vang';
        phu = '\n\n[Máy hạ mức xuống "theo dõi": chưa ai được cấp quyền kế toán ' +
              (dau === 'thu' ? 'THU' : dau === 'chi' ? 'CHI' : 'tài chính') +
              ' nên không có người nhận. Cấp quyền xong thì tin sau sẽ về đúng mức.]';
      }
    }
    /* Hạn chỉ có nghĩa khi có người nhận. Một tin đã hạ mức vì không có
       chủ mà vẫn đeo hạn thì nó sẽ QUÁ HẠN, rồi nhảy lên đầu bảng mỗi
       sáng — một cái chuông không ai tắt được. */
    if (MUC_DO[muc].canHan) {
      if (!han) han = new Date(Date.now() +
        (soNgayHan || (muc === 'do' ? 1 : 7)) * 86400000).toISOString();
    } else han = null;
    mucDo = muc; giaoCho = giao; hanXuLy = han; than = String(than) + phu;

    const id = 'TIN-' + tokenMoi().slice(0, 14);
    await db.prepare(
      'INSERT INTO tinTaiChinh (id,mucDo,loai,tieuDe,than,doiTuong,tuMay,' +
      "nguoiDang,luc,giaoCho,hanXuLy,trangThai) VALUES (?,?,?,?,?,?,1,'may-chu',?,?,?,'moi')"
    ).bind(id, mucDo, loai, String(tieuDe).slice(0, 200), String(than).slice(0, 2000),
      doiTuong || null, new Date().toISOString(), giaoCho || null, hanXuLy || null).run();
    return id;
  } catch (e) {
    console.error('TIN_MAY_HONG', loai, String(e && e.message || e));
    return null;
  }
}

/* ═══════════════ ĐỌC BẢNG TIN ═══════════════ */
export async function bangTinTaiChinh(y, env, db, hoSo) {
  const {duoc} = await trongPhong(db, hoSo);
  if (!duoc) return {ok: false, code: 'NOPERM',
    error: 'Chỉ R01–R03 hoặc người của phòng tài chính xem được bảng tin.'};

  const conViec = y.tatCa !== true;
  const r = await db.prepare(
    'SELECT * FROM tinTaiChinh' +
    (conViec ? " WHERE trangThai IN ('moi','dangXuLy')" : '') +
    ' ORDER BY luc DESC LIMIT 300'
  ).all();
  const ds = r.results || [];

  const bay = new Date().toISOString();
  const tin = ds.map(x => ({
    id: x.id, mucDo: x.mucDo, tenMuc: (MUC_DO[x.mucDo] || {}).ten || x.mucDo,
    thuTu: (MUC_DO[x.mucDo] || {}).thu || 9,
    loai: x.loai, tieuDe: x.tieuDe, than: x.than,
    viSaoGap: x.viSaoGap || undefined,
    doiTuong: x.doiTuong || undefined,
    tuMay: !!Number(x.tuMay), nguoiDang: x.nguoiDang, luc: x.luc,
    giaoCho: x.giaoCho || undefined, hanXuLy: x.hanXuLy || undefined,
    /* Quá hạn tính ở đây chứ không để màn hình tự tính: hai chỗ tính
       thì sẽ có ngày một chỗ dùng giờ máy khách. */
    quaHan: !!(x.hanXuLy && x.hanXuLy < bay &&
      (x.trangThai === 'moi' || x.trangThai === 'dangXuLy')),
    trangThai: x.trangThai,
    cachXuLy: x.cachXuLy || undefined,
    nguoiXuLy: x.nguoiXuLy || undefined
  }));

  /* XẾP THEO MÀU TRƯỚC, RỒI THEO THỜI GIAN. Đó là cả mục đích của việc
     phân cấp: mở ra là thấy cái gấp nhất trên cùng, không phải cái mới
     nhất. Quá hạn thì lên trước cả trong cùng một màu. */
  tin.sort((a, b) => (a.thuTu - b.thuTu) ||
    (Number(b.quaHan) - Number(a.quaHan)) || (a.luc < b.luc ? 1 : -1));

  const dem = {do: 0, cam: 0, vang: 0, xanh: 0};
  for (const t of tin) if (dem[t.mucDo] !== undefined) dem[t.mucDo]++;
  const tong = tin.length;

  /* ── DANH SÁCH NGƯỜI NHẬN, TRẢ NGAY Ở ĐÂY ──
     Sổ quyền tài chính (dsQuyenTaiChinh) chỉ R01–R03 mở được, mà bảng
     tin thì kế toán trưởng dùng là chính — hỏi sổ ấy thì đúng người cần
     giao việc lại là người không thấy danh sách nào để chọn. Ở đây chỉ
     trả TÊN TÀI KHOẢN và TÊN VỊ TRÍ, không trả lý do cấp hay ai cấp:
     đủ để giao việc, không hơn. */
  const ns = await db.prepare(
    'SELECT username, chucNang FROM quyenTaiChinh WHERE thuHoiLuc IS NULL ' +
    'AND (hetHan IS NULL OR hetHan > ?) ORDER BY chucNang, username LIMIT 60'
  ).bind(bay).all();

  return {ok: true, so: tong, dem,
    nhanSu: (ns.results || []).map(x => ({username: x.username, viTri: x.chucNang,
      tenViTri: (VI_TRI_TC[x.chucNang] || {}).ten || x.chucNang})),
    /* TỶ LỆ TIN ĐỎ — lớp chặn thứ ba của hệ phân cấp màu. Đỏ hết thì
       con số này nói ra, và nó nói với chính người đang đặt màu. */
    tyLeDo: tong ? Math.round(dem.do / tong * 1000) / 10 : 0,
    canhBaoDoNhieu: tong >= 5 && dem.do / tong > 0.5,
    soQuaHan: tin.filter(t => t.quaHan).length,
    cuaToi: tin.filter(t => t.giaoCho === hoSo.u &&
      (t.trangThai === 'moi' || t.trangThai === 'dangXuLy')).length,
    mucDo: MUC_DO,
    tin,
    vi: 'Xếp theo MÀU trước rồi mới theo thời gian — mở ra là thấy cái gấp nhất ' +
        'trên cùng, không phải cái mới nhất.'};
}

/* ═══════════════ NHẬN XỬ LÝ · ĐÓNG MỘT TIN ═══════════════ */
export async function xuLyTinTaiChinh(y, env, db, hoSo) {
  const {duoc} = await trongPhong(db, hoSo);
  if (!duoc) return {ok: false, code: 'NOPERM', error: 'Vai này không xử lý được tin.'};

  const t = await db.prepare('SELECT * FROM tinTaiChinh WHERE id = ?')
    .bind(String(y.id || '')).first();
  if (!t) return {ok: false, error: 'Không tìm thấy tin này.'};

  const den = String(y.trangThai || '').trim();
  if (TRANG_THAI.indexOf(den) < 0)
    return {ok: false, error: 'Trạng thái phải là một trong: ' + TRANG_THAI.join(', ') + '.'};

  /* ── ĐÓNG THÌ PHẢI NÓI ĐÃ LÀM GÌ ──
     Áp cho cả 'daXuLy' lẫn 'boQua'. Bỏ qua cũng là một quyết định, và
     một quyết định không có lý do thì ba tháng sau không ai bảo vệ
     được nó. */
  const cach = String(y.cachXuLy || '').trim();
  if ((den === 'daXuLy' || den === 'boQua') && cach.length < 10)
    return {ok: false, code: 'THIEUCACH',
      error: den === 'boQua'
        ? 'Bỏ qua cũng là một quyết định. Ghi vì sao bỏ qua.'
        : 'Đóng một tin thì phải nói ĐÃ LÀM GÌ. Không có câu ấy thì ba tháng sau ' +
          'cùng chuyện lặp lại và không ai biết lần trước đã xử lý thế nào.'};

  const luc = new Date().toISOString();
  const r = await db.prepare(
    'UPDATE tinTaiChinh SET trangThai = ?, cachXuLy = ?, nguoiXuLy = ?, xuLyLuc = ?, ' +
    'giaoCho = COALESCE(giaoCho, ?) WHERE id = ? AND trangThai <> ?'
  ).bind(den, cach || null, hoSo.u, luc, hoSo.u, t.id, den).run();
  if (!((r && r.meta && r.meta.changes) || 0))
    return {ok: false, error: 'Tin này đã ở trạng thái ấy rồi.'};

  await Kho.ghiNhatKy(db, {uid: hoSo.uid, username: hoSo.u, viec: 'TIN_XULY',
    doiTuong: t.id, chiTiet: t.mucDo + ' → ' + den + (cach ? ' · ' + cach.slice(0, 200) : '')});
  return {ok: true, trangThai: den};
}

export { MUC_DO };
