/* ═══════════════════════════════════════════════════════════════
   GITA 365 — CỬA CHUYỂN TỪ APPS SCRIPT SANG CLOUDFLARE  (9.99.198)

   Chủ hệ: "full bên Cloudflare, không còn phần nào liên quan tới Script."
   Đây là các cửa cuối còn nằm ở Apps Script (danh sách CHUA_PORT của
   worker.js). Nay dựng lại trên D1 + R2, đúng hợp đồng mà máy khách gọi:
   kiemBanMoi · docTinCongDong · ghiTinCongDong · guiChuyen · napTaiLieu ·
   duyetTaiLieu · napTinhHuongKhach (bản chiếu tình huống cho gia đình).

   Ba cửa Google-riêng thì BỎ HẲN, không port (máy khách không còn gọi):
     · kiemDrive   — Cloudflare không có Drive để kiểm.
     · xuatSheet   — không có Google Sheet; máy khách nay hiện bảng để chép.
     · xemKpiKhach — màn không còn trong cột trái.
   ═══════════════════════════════════════════════════════════════ */

import { Kho, tokenMoi } from './nen.js';
import { TH_KHACH } from './tinh-huong-khach-du-lieu.js';

const SO_TANG = 5;

/* Bản app máy chủ ĐANG PHỤC VỤ — dùng cho cửa kiểm-bản-mới. Đây là một
   MỐC do lượt triển khai đặt, không phải bản chép của version máy khách:
   máy khách tự biết bản của nó (G.META.version); cửa này chỉ nói "bản
   mới nhất Học viện đã phát hành là gì". Cập nhật số này mỗi lượt phát
   hành app mới. */
const BAN_APP = '9.99.247';

const BAC = {R01:1,R02:2,R03:3,R04:4,R05:5,R06:6,R07:7,R08:8,
             R09:9,R10:10,R11:11,R12:12,R13:13,R14:14,R15:15};

/* Ngưỡng riêng tư của sổ cộng đồng: dưới ngưỡng thì KHÔNG nói con số
   chính xác theo tầng — "2 nhà đang ở tầng 5" là chỉ mặt từng nhà mà
   không cần tên. Cùng luật với ô daGoNgoai và cột lời khai của phễu:
   giữ kín cho tới khi đủ đông để một con số không còn chỉ vào ai. */
const NGUONG_TIN = 3;

/* ─── KIỂM BẢN MỚI (không cần phiên) ─── */
export async function kiemBanMoi(y, env, db) {
  return {ok: true, banMoiNhat: BAN_APP};
}

/* ─── BẢN CHIẾU TÌNH HUỐNG KHÁCH (theo tầng của gia đình) ───
   Gia đình KHÔNG nhận tình huống từ gói nghề — họ nhận một BẢN CHIẾU
   theo phiên, cắt đúng tầng của mình, và dữ liệu này ĐÃ bỏ cột nghề
   (không lộ thử thách của Tư vấn). Tầng đọc từ hoSo.tier (máy chủ tự
   biết), KHÔNG nhận tầng do máy khách gửi. */
export async function napTinhHuongKhach(y, env, db, hoSo) {
  let tang = Number(hoSo.tier || 0);
  if (!(tang >= 1)) return {ok: false, error: 'Tài khoản chưa có tầng.'};
  if (tang > SO_TANG) tang = SO_TANG;
  let ra = [];
  for (let t = 1; t <= tang; t++) ra = ra.concat(TH_KHACH['T' + t] || []);
  await Kho.ghiNhatKy(db, {uid: hoSo.uid, username: hoSo.u,
    viec: 'TINHHUONG_KHACH_NAP', chiTiet: 'T' + tang + ' · ' + ra.length});
  return {ok: true, tang: tang, so: ra.length, tinhHuong: ra};
}

/* ═══════════════ SỔ CỘNG ĐỒNG ═══════════════ */

/* Đọc sổ đếm cộng đồng. KHÔNG cần bật công tắc — công tắc quản việc GÓP
   số của nhà mình, không quản việc XEM số chung. Con số dưới ngưỡng đi
   vào `duoiNguong` (giữ kín), con số đủ đông đi vào `so`. */
export async function docTinCongDong(y, env, db, hoSo) {
  const r = await db.prepare(
    'SELECT loai, tang, COUNT(*) AS c FROM tinCongDong GROUP BY loai, tang'
  ).all();
  const so = {}, duoiNguong = [];
  for (const x of (r.results || [])) {
    const khoa = x.loai + '·' + x.tang;
    if (Number(x.c) >= NGUONG_TIN) so[khoa] = Number(x.c);
    else if (Number(x.c) > 0) duoiNguong.push(khoa);
  }
  const c = await db.prepare(
    "SELECT COUNT(*) AS c FROM chuyenCongDong WHERE trangThai = 'chon'"
  ).first();
  return {ok: true, nguong: NGUONG_TIN, so: so, duoiNguong: duoiNguong,
    chuyenDaChon: Number((c && c.c) || 0)};
}

/* Góp số của nhà mình. MỘT dòng mỗi (người · loại · tầng) — ghi lại lần
   nữa KHÔNG cộng thêm, nên không ai thổi được con số bằng cách bấm nhiều
   lần. Đòi dongY===true: máy chủ không tin công tắc ở máy khách. */
export async function ghiTinCongDong(y, env, db, hoSo) {
  const bao = y.bao || {};
  if (bao.dongY !== true)
    return {ok: false, error: 'Chưa có lời đồng ý chia sẻ.'};
  const loai = String(bao.loai || '').slice(0, 40);
  const tang = /^T[1-5]$/.test(String(bao.tang)) ? String(bao.tang) : '';
  if (!loai || !tang) return {ok: false, error: 'Thiếu loại hoặc tầng.'};
  await db.prepare(
    'INSERT INTO tinCongDong (uid, loai, tang, luc) VALUES (?,?,?,?) ' +
    'ON CONFLICT(uid, loai, tang) DO UPDATE SET luc = excluded.luc'
  ).bind(hoSo.uid, loai, tang, new Date().toISOString()).run();
  return {ok: true};
}

/* Gửi một chuyện vào hộp chờ duyệt. Máy chủ soi lại sáu tiêu chí — lớp
   soi ở máy khách là phép lịch sự, không phải phép chặn (dữ liệu gửi
   lên không tin được). Chuyện vào trạng thái 'cho', người duyệt mới
   chuyển sang 'chon'. */
export async function guiChuyen(y, env, db, hoSo) {
  const c = y.chuyen || {};
  const tang = /^T[1-5]$/.test(String(c.tang)) ? String(c.tang) : '';
  const nd = String(c.noiDung || '').trim();
  const duSauTieuChi = c.tc1 && c.tc2 && c.tc3 && c.tc4 && c.tc5 && c.tc6;
  if (!tang || !nd) return {ok: false, error: 'Thiếu tầng hoặc nội dung.'};
  if (!duSauTieuChi) return {ok: false, error: 'Chưa đủ sáu tiêu chí.'};
  await db.prepare(
    'INSERT INTO chuyenCongDong (id, uid, tang, noiDung, trangThai, luc) VALUES (?,?,?,?,?,?)'
  ).bind(tokenMoi().slice(0, 24), hoSo.uid, tang, nd.slice(0, 4000),
    'cho', new Date().toISOString()).run();
  await Kho.ghiNhatKy(db, {uid: hoSo.uid, username: hoSo.u,
    viec: 'GUI_CHUYEN', chiTiet: tang});
  return {ok: true};
}

/* ═══════════════ THƯ VIỆN TÀI LIỆU ═══════════════ */

/* Gửi một tài liệu lên. Ruột tệp đi vào R2 (env.HOSO), phần mô tả đi vào
   D1 — cùng lối "ruột ra kho tệp, chỉ mục ở cơ sở dữ liệu" của đồng bộ
   hồ sơ. Tài liệu vào trạng thái 'cho' cho tới khi có người duyệt. */
/* Chỉ nhận tài liệu và ảnh — CHẶN tệp chạy được. Danh sách CHO PHÉP
   (allowlist), không phải danh sách cấm: cấm thì thiếu một đuôi nguy hiểm
   là lọt, cho phép thì thiếu một đuôi lành chỉ là bất tiện. exe/js/sh/bat
   đương nhiên ngoài danh sách. */
const DUOI_CHO_PHEP = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx',
  'txt', 'csv', 'png', 'jpg', 'jpeg', 'gif', 'webp', 'heic',
  'mp3', 'mp4', 'm4a', 'wav'];
const TRAN_NGAY_TAILIEU = 30;   /* trần số tệp một tài khoản gửi mỗi ngày */

export async function napTaiLieu(y, env, db, hoSo) {
  const b = y.ban || {};
  const id = String(b.id || tokenMoi().slice(0, 24)).slice(0, 60);
  const dulieu = String(y.dulieu || '');
  if (!dulieu) return {ok: false, error: 'Không có nội dung tệp.'};
  /* Trần một tệp — chặn đẩy một tệp khổng lồ. base64 nở ~4/3 so với byte
     thật, nên 8 MB base64 ≈ 6 MB tệp. */
  if (dulieu.length > 8 * 1024 * 1024)
    return {ok: false, code: 'TOOBIG', error: 'Tệp vượt trần 6 MB.'};

  const duoi = String(b.tenTep || '').split('.').pop().toLowerCase();
  if (DUOI_CHO_PHEP.indexOf(duoi) < 0)
    return {ok: false, error: 'Chỉ nhận tài liệu và ảnh, không nhận tệp chạy được.'};

  /* Kiểm tra magic bytes nếu có thể đọc được dữ liệu nhị phân */
  let bytes;
  try {
    const bin = atob(dulieu);
    bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  } catch (e) {
    return {ok: false, error: 'Nội dung tệp không đọc được.'};
  }
  const mime = (await import('./an-toan.js')).doanMime(bytes);
  if (mime === 'application/octet-stream' && DUOI_CHO_PHEP.indexOf(duoi) >= 0 && duoi !== 'txt')
    return {ok: false, error: 'Tệp không nhận diện được định dạng nội dung.'};
  if (!(await import('./an-toan.js')).hopLeMime(duoi, mime))
    return {ok: false, error: 'Phần mở rộng tệp không khớp nội dung thật.'};

  /* Trần số tệp mỗi ngày cho một tài khoản — chặn một tài khoản bị chiếm
     đẩy hàng nghìn tệp vào R2. */
  const dauNgay = new Date().toISOString().slice(0, 10);
  const dem = await db.prepare(
    "SELECT COUNT(*) AS c FROM tailieu WHERE nguoiGui = ? AND substr(luc,1,10) = ?"
  ).bind(hoSo.u, dauNgay).first();
  if (Number((dem && dem.c) || 0) >= TRAN_NGAY_TAILIEU)
    return {ok: false, code: 'TRANNGAY', error: 'Đã tới trần số tệp gửi trong ngày.'};

  const driveId = 'tailieu/' + id;
  if (env.HOSO) {
    try {
      await env.HOSO.put(driveId, bytes);
    } catch (e) {
      return {ok: false, code: 'STORFAIL', error: 'Không lưu được tệp vào kho.'};
    }
  }

  const luc = new Date().toISOString();
  await db.prepare(
    'INSERT INTO tailieu (id,ten,loai,tang,moTa,driveId,tenTep,nguoiGui,vaiGui,luc,trangThai) ' +
    'VALUES (?,?,?,?,?,?,?,?,?,?,?) ' +
    'ON CONFLICT(id) DO UPDATE SET ten=excluded.ten, loai=excluded.loai, tang=excluded.tang, ' +
    'moTa=excluded.moTa, driveId=excluded.driveId, tenTep=excluded.tenTep, luc=excluded.luc'
  ).bind(id, String(b.ten || '').slice(0, 200), String(b.loai || ''), String(b.tang || ''),
    String(b.moTa || '').slice(0, 2000), driveId, String(b.tenTep || ''),
    hoSo.u, hoSo.role, luc, 'cho').run();
  await Kho.ghiNhatKy(db, {uid: hoSo.uid, username: hoSo.u,
    viec: 'NAP_TAI_LIEU', chiTiet: id + ' · ' + (b.ten || '')});
  return {ok: true, driveId: driveId};
}

/* Duyệt một tài liệu. Chỉ ĐỘI NGŨ (không phải khách) duyệt được — một
   quyết định vận hành. Ghi thẳng trạng thái, người duyệt, mốc, lý do:
   để Admin thứ hai mở máy mình KHÔNG thấy tài liệu đã duyệt còn "chờ". */
export async function duyetTaiLieu(y, env, db, hoSo) {
  /* Chỉ R01–R02 duyệt — cùng ngưỡng bản Apps Script cũ (lv > 2 bị chặn). */
  if ((BAC[hoSo.role] || 99) > 2)
    return {ok: false, error: 'Chỉ Super Admin và Admin hệ thống mới duyệt tài liệu.'};
  const ma = String(y.ma || '');
  if (!ma) return {ok: false, error: 'Thiếu mã tài liệu.'};
  const co = await db.prepare('SELECT id FROM tailieu WHERE id = ?').bind(ma).first();
  if (!co) return {ok: false, error: 'Không tìm thấy tài liệu.'};
  await db.prepare(
    'UPDATE tailieu SET trangThai = ?, nguoiDuyet = ?, lucDuyet = ?, lyDo = ? WHERE id = ?'
  ).bind(String(y.viec || 'duyet').slice(0, 40), hoSo.u, new Date().toISOString(),
    String(y.lyDo || '').slice(0, 500), ma).run();
  await Kho.ghiNhatKy(db, {uid: hoSo.uid, username: hoSo.u,
    viec: 'DUYET_TAI_LIEU', chiTiet: ma + ' → ' + (y.viec || 'duyet')});
  return {ok: true};
}
