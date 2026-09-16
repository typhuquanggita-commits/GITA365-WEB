/* ═══════════════════════════════════════════════════════════════
   GITA 365 · CỬA VÀO MỚI — KÝ VÀ ĐÓNG DẤU GIỜ CHO CHỨNG CỨ HOA HỒNG

   ══ VÌ SAO PHẦN NÀY PHẢI Ở MÁY CHỦ ══

   Bảng chứng cứ ở máy khách (src/hoa-hong-kem.js) đã tự khai hai chỗ nó
   KHÔNG làm được, và in thẳng hai chỗ ấy ra màn:

     · Dấu kiểm ở máy khách bắt được sửa vô ý và sửa cẩu thả. Nó KHÔNG
       chặn được người cố tình dựng lại cả bản ghi lẫn dấu — vì thuật
       toán nằm ngay trong mã trang, ai cũng đọc được.
     · Giờ máy khách đổi được trong ba giây. Một dấu thời gian do chính
       bên đi đòi tiền tự đóng thì không phải bằng chứng.

   Hai chỗ ấy chỉ đóng được ở đây, và đóng được vì đúng một lý do: KHOÁ
   KHÔNG BAO GIỜ RỜI MÁY CHỦ. Nó nằm trong secret của Worker, không nằm
   trong mã nguồn, không nằm trong cơ sở dữ liệu, không đi trong bất kỳ
   phản hồi nào, và không có hàm nào trong tệp này trả nó ra.

   ══ MÁY KHÁCH GIỮ BIÊN NHẬN, KHÔNG GIỮ BẢN GỐC LÀM BẰNG ══

   Sau khi ký, máy chủ giữ bản gốc trong một bảng chỉ-thêm-dòng và trả
   về BIÊN NHẬN: mã, giờ máy chủ, chữ ký. Máy khách lưu biên nhận ấy
   cạnh bản ghi của mình.

   Tranh chấp thì đối chiếu hai bản. Lệch một ký tự là chữ ký không
   khớp, và bên nào sửa thì lộ ra.

   ══ BA ĐIỀU TỆP NÀY TỪ CHỐI LÀM ══

   1. Không sửa một bản đã ký. Sai thì ghi bản ĐÍNH CHÍNH trỏ về bản
      cũ, và cả hai cùng ở lại — xoá bản sai là xoá luôn bằng chứng
      rằng đã từng có bản sai, đúng thứ bên đối tụng sẽ hỏi.
   2. Không cho người ghi tự xác nhận cho mình. Đây là chỗ chống làm
      giả mạnh nhất của cả hệ, mạnh hơn mọi chữ ký.
   3. Không trả khoá ra, không trả một phần khoá, không trả một thứ suy
      ngược ra khoá được.
   ═══════════════════════════════════════════════════════════════ */

import { Kho, tokenMoi, soSanhAnToan } from './nen.js';

const TRAN_NOIDUNG = 4000;

/* ── CỔNG VAI (9.99.112) ──

   Ba cửa chứng cứ hoa hồng ĐỀU nằm trong CAN_PHIEN nhưng bản đầu KHÔNG
   kiểm vai — chỉ cần một phiên hợp lệ. Hậu quả (tổ thanh tra ma-trận-vai
   tái hiện thật): một khách R13/R14/R15 GHI được chứng cứ, ĐỌC được nội
   dung riêng chéo-nhà bằng mã, và — nặng nhất — một Coach nắm thêm một
   tài khoản khách TỰ XÁC NHẬN chứng cứ của chính mình, phá đúng "chỗ
   chống làm giả mạnh nhất của cả hệ" mà đầu tệp này tuyên bố. Cùng lớp
   lỗi traBoSung (cửa nội dung nghề chỉ chặn ở tầng phiên).

   Trần = Coach trở lên (lv ≤ 7), khớp hệ hoa hồng lân cận
   (ganChungCuHoaHong lv≤7 · traHoaHong R01–R03): staff ghi/xác nhận/soi
   chứng cứ, khách và đại sứ không. */
const BAC_CC = {R01:1,R02:2,R03:3,R04:4,R05:5,R06:6,R07:7,R08:8,
  R09:9,R10:10,R11:11,R12:12,R13:13,R14:14,R15:15};
function laNgheCC(hoSo) { return (BAC_CC[(hoSo || {}).role] || 99) <= 7; }
const CHAN_CC = {ok: false, code: 'NOPERM',
  error: 'Chứng cứ hoa hồng chỉ mở từ Coach trở lên (R01–R07). ' +
    'Người ghi và người xác nhận là lớp chống làm giả của hệ — khách không vào.'};

/* ── KHOÁ KÝ ──

   Đọc từ secret, KHÔNG tự sinh rồi cất vào cơ sở dữ liệu như nền cũ làm
   với PropertiesService. Lý do: một bản sao lưu cơ sở dữ liệu bị lộ mà
   kéo theo khoá ký thì mọi chữ ký trở thành thứ ai cũng làm giả được —
   và lúc ấy cả bảng chứng cứ mất giá trị NGƯỢC VỀ QUÁ KHỨ, kể cả những
   bản ghi từ nhiều năm trước.

   Khoá này KHÁC khoá băm mật khẩu (GITA_TIEU): trộn hai việc vào một
   khoá thì ngày phải đổi khoá vì một việc là làm hỏng việc kia. */
function khoaKy(env) {
  const k = env.GITA_KHOA_KY;
  if (!k) throw new Error('Máy chủ chưa được nạp khoá ký chứng cứ.');
  return k;
}

/* ── CHUỖI CHUẨN HOÁ ĐỂ KÝ ──

   PHẢI khớp TỪNG KÝ TỰ với bên máy khách khi hai bên đối chiếu, nên
   thứ tự trường ở đây là một phần của hợp đồng — đổi thứ tự là làm mọi
   chữ ký cũ hết đối chiếu được. Chép nguyên văn từ
   gitaChuanChungCu_ của nền cũ, không sắp lại cho đẹp. */
function chuanHoa(o, gioMayChu) {
  return [
    'nhiemVu=' + String(o.nhiemVu || ''),
    'ngayLam=' + String(o.ngayLam || ''),
    'loai=' + String(o.loai || ''),
    'noiDung=' + String(o.noiDung || ''),
    'nguoiGhi=' + String(o.nguoiGhi || ''),
    'gioMayChu=' + String(gioMayChu || '')
  ].join('\n');
}

async function ky(env, chuoi) {
  const k = await crypto.subtle.importKey('raw',
    new TextEncoder().encode(khoaKy(env)),
    {name: 'HMAC', hash: 'SHA-256'}, false, ['sign']);
  const b = await crypto.subtle.sign('HMAC', k, new TextEncoder().encode(chuoi));
  return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join('');
}

const timBan = (db, ma) =>
  db.prepare('SELECT * FROM chungCu WHERE ma = ?').bind(String(ma || '')).first();

/* ═══════════════ KÝ ═══════════════

   nguoiGhi lấy từ PHIÊN, không lấy từ thân yêu cầu. Nhận từ thân thì
   người ta ghi tên ai cũng được, và cả bảng chứng cứ mất nghĩa. */
export async function kyChungCu(y, env, db, hoSo) {
  if (!laNgheCC(hoSo)) return CHAN_CC;
  const cc = y.cc || {};
  const thieu = ['nhiemVu', 'ngayLam', 'loai', 'noiDung']
    .filter(k => !String(cc[k] || '').trim());
  if (thieu.length) return {ok: false, error: 'Thiếu trường: ' + thieu.join(', ')};
  if (String(cc.noiDung).length > TRAN_NOIDUNG)
    return {ok: false, error: 'Nội dung quá ' + TRAN_NOIDUNG + ' ký tự.'};

  if (cc.dinhChinhCho && !(await timBan(db, cc.dinhChinhCho)))
    return {ok: false, error: 'Không thấy bản được đính chính.'};

  const gio = new Date().toISOString();
  const o = {nhiemVu: String(cc.nhiemVu), ngayLam: String(cc.ngayLam),
    loai: String(cc.loai), noiDung: String(cc.noiDung).trim(), nguoiGhi: hoSo.u};
  const chuKy = await ky(env, chuanHoa(o, gio));

  /* MÃ KHÔNG MANG MỘT MẨU CHỮ KÝ NÀO.

     Nền cũ ghép  'CC-' + uuid.slice(0,8) + '-' + chuKy.slice(0,6)  — tức
     là in 24 bit của chữ ký ra một chỗ ai cũng đọc được. Không đủ để dò
     ngược ra khoá, nhưng cũng không có lý do gì để cho đi: mã là để
     TRA, chữ ký là để CHỨNG, và trộn hai vai ấy là thói quen dẫn tới
     chỗ khác sai. Máy khách chỉ dùng mã như một chuỗi tra, nên đổi cách
     ghép không hỏng gì. */
  const ma = 'CC-' + tokenMoi().slice(0, 16);

  await db.prepare(
    'INSERT INTO chungCu (ma,nhiemVu,ngayLam,loai,noiDung,nguoiGhi,gioMayChu,chuKy,' +
    'dinhChinhCho,uidGhi) VALUES (?,?,?,?,?,?,?,?,?,?)'
  ).bind(ma, o.nhiemVu, o.ngayLam, o.loai, o.noiDung, o.nguoiGhi, gio, chuKy,
    cc.dinhChinhCho || null, hoSo.uid).run();

  await Kho.ghiNhatKy(db, {uid: hoSo.uid, username: hoSo.u, viec: 'CHUNGCU_KY',
    doiTuong: ma, chiTiet: o.nhiemVu});
  return {ok: true, bienNhan: {ma, gioMayChu: gio, chuKy}};
}

/* ═══════════════ XÁC NHẬN — NHÀ ĐƯỢC KÈM ĐỐI CHỨNG ═══════════════

   Người ghi không tự xác nhận cho mình được. Đây là chỗ chống làm giả
   mạnh nhất của cả hệ: một người không tự dựng được hồ sơ cho mình. */
export async function xacNhanChungCu(y, env, db, hoSo) {
  if (!laNgheCC(hoSo)) return CHAN_CC;
  const t = await timBan(db, y.ma);
  if (!t) return {ok: false, error: 'Không thấy bản ghi này.'};
  if (String(hoSo.u) === String(t.nguoiGhi))
    return {ok: false, error: 'Người ghi không tự xác nhận cho mình được.'};
  if (String(t.xacNhanBoi || '').trim())
    return {ok: false, error: 'Bản này đã được xác nhận rồi.'};

  /* GHI CÓ ĐIỀU KIỆN, KHÔNG ĐỌC-RỒI-GHI.

     Hai người cùng bấm xác nhận trong một giây thì cả hai đều đọc thấy
     cột còn trống, và nếu chỉ ghi đè thì người bấm sau ghi tên mình lên
     tên người bấm trước — trên một bản ghi mà cả hệ dựng lên để đứng
     được khi đối chất. Câu UPDATE này tự nó là chỗ giành: ai đổi được
     dòng thì người ấy là người xác nhận. */
  const gio = new Date().toISOString();
  const r = await db.prepare(
    'UPDATE chungCu SET xacNhanBoi = ?, xacNhanLuc = ? ' +
    "WHERE ma = ? AND (xacNhanBoi IS NULL OR xacNhanBoi = '')"
  ).bind(hoSo.u, gio, t.ma).run();
  if (!((r && r.meta && r.meta.changes) || 0))
    return {ok: false, error: 'Bản này vừa được người khác xác nhận.'};

  await Kho.ghiNhatKy(db, {uid: hoSo.uid, username: hoSo.u,
    viec: 'CHUNGCU_XACNHAN', doiTuong: t.ma});
  return {ok: true, xacNhan: {ai: hoSo.u, luc: gio}};
}

/* ═══════════════ SOI — ĐỐI CHIẾU BẢN MÁY KHÁCH VỚI BẢN MÁY CHỦ ═══════════════

   Trả về ĐỦ để bên thứ ba đối chiếu, và KHÔNG trả khoá.

   Máy chủ ký LẠI từ chính dữ liệu đang lưu rồi so với chữ ký đã lưu.
   Nếu ai đó sửa thẳng vào bảng — kể cả người có quyền quản trị cơ sở dữ
   liệu — thì hai thứ ấy lệch nhau và khop trả về false. Đó là toàn bộ
   giá trị của lớp ký: nó không ngăn được người ta sửa, nó làm cho việc
   sửa KHÔNG GIẤU ĐƯỢC.

   MỖI LƯỢT SOI MỘT DÒNG SỔ. Nội dung một bản chứng cứ là chuyện riêng
   của hai nhà; ai mở nó ra thì phải trả lời được. Nền cũ không ghi chỗ
   này — thêm vào, vì đây là lớp việc mà ngày cần tới thì đã muộn. */
export async function soiChungCu(y, env, db, hoSo) {
  if (!laNgheCC(hoSo)) return CHAN_CC;
  const t = await timBan(db, y.ma);
  if (!t) return {ok: false, error: 'Không thấy bản ghi này.'};

  const o = {nhiemVu: t.nhiemVu, ngayLam: t.ngayLam, loai: t.loai,
    noiDung: t.noiDung, nguoiGhi: t.nguoiGhi};
  const lai = await ky(env, chuanHoa(o, String(t.gioMayChu)));

  await Kho.ghiNhatKy(db, {uid: hoSo.uid, username: hoSo.u, viec: 'CHUNGCU_SOI',
    doiTuong: t.ma, chiTiet: 'của ' + t.nguoiGhi});

  return {ok: true,
    ma: t.ma, gioMayChu: t.gioMayChu, chuKy: t.chuKy,
    khop: soSanhAnToan(lai, String(t.chuKy)),
    xacNhanBoi: t.xacNhanBoi || null, xacNhanLuc: t.xacNhanLuc || null,
    dinhChinhCho: t.dinhChinhCho || null,
    /* Bản máy chủ trả nguyên văn để bên kia TỰ so — không so hộ. */
    ban: o};
}
