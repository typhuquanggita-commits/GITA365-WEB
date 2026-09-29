import { tokenMoi } from './nen.js';

const ADMIN = new Set(['R01', 'R02']);
const KHACH = new Set(['R13', 'R14']);
const TAI_CHINH = new Set(['R03', 'R04']);
const QR_MAX = 512000;

function coTheXem(role) {
  return ADMIN.has(role) || KHACH.has(role) || TAI_CHINH.has(role);
}

export async function xemThongTinThanhToan(y, env, db, hoSo) {
  if (!coTheXem(hoSo.role))
    return {ok: false, code: 'NOPERM',
      error: 'Thông tin nhận tiền chỉ mở tại màn thanh toán cho quản trị và tài khoản khách hàng.'};

  const r = await db.prepare(
    'SELECT nganHang, chuTk, soTk, qrDataUrl, noiDungCk, capLuc ' +
    'FROM taiKhoanNhan WHERE id = ?'
  ).bind('gita365').first();
  if (!r) return {ok: true, configured: false};
  return {ok: true, configured: true, taiKhoan: {
    nganHang: r.nganHang, chuTk: r.chuTk, soTk: r.soTk,
    qrDataUrl: r.qrDataUrl, noiDungCk: r.noiDungCk, capLuc: r.capLuc
  }};
}

export async function capNhatThongTinThanhToan(y, env, db, hoSo) {
  if (!ADMIN.has(hoSo.role))
    return {ok: false, code: 'NOPERM',
      error: 'Chỉ Super Admin hoặc Admin hệ thống được cập nhật thông tin nhận tiền.'};

  const nganHang = String(y.nganHang || '').trim();
  const chuTk = String(y.chuTk || '').trim();
  const soTk = String(y.soTk || '').replace(/\s+/g, '');
  const qrDataUrl = String(y.qrDataUrl || '').trim();
  const noiDungCk = String(y.noiDungCk || '').trim();
  if (!nganHang || nganHang.length > 100)
    return {ok: false, error: 'Tên ngân hàng phải có từ 1 đến 100 ký tự.'};
  if (!chuTk || chuTk.length > 100)
    return {ok: false, error: 'Tên chủ tài khoản phải có từ 1 đến 100 ký tự.'};
  if (!/^\d{6,34}$/.test(soTk))
    return {ok: false, error: 'Số tài khoản chỉ gồm 6–34 chữ số.'};
  const anh = /^data:image\/(jpeg|png);base64,([A-Za-z0-9+/]+={0,2})$/.exec(qrDataUrl);
  if (!anh || qrDataUrl.length > QR_MAX)
    return {ok: false, error: 'Ảnh QR phải là JPEG hoặc PNG hợp lệ, tối đa 512 KB.'};
  let nhiPhan;
  try { nhiPhan = atob(anh[2]); }
  catch { return {ok: false, error: 'Dữ liệu ảnh QR không phải Base64 hợp lệ.'}; }
  const dungAnh = anh[1] === 'jpeg'
    ? nhiPhan.length >= 3 && nhiPhan.charCodeAt(0) === 0xff &&
      nhiPhan.charCodeAt(1) === 0xd8 && nhiPhan.charCodeAt(2) === 0xff
    : nhiPhan.length >= 8 && nhiPhan.slice(0, 8) === '\x89PNG\r\n\x1a\n';
  if (!dungAnh || nhiPhan.length > 384000)
    return {ok: false, error: 'Ảnh QR không khớp định dạng hoặc vượt quá 384 KB.'};
  if (noiDungCk.length > 200)
    return {ok: false, error: 'Nội dung chuyển khoản tối đa 200 ký tự.'};

  const luc = new Date().toISOString();
  await db.batch([
    db.prepare(
      'INSERT INTO taiKhoanNhan (id, nganHang, chuTk, soTk, qrDataUrl, noiDungCk, capLuc, capBoi) ' +
      'VALUES (?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET ' +
      'nganHang=excluded.nganHang, chuTk=excluded.chuTk, soTk=excluded.soTk, ' +
      'qrDataUrl=excluded.qrDataUrl, noiDungCk=excluded.noiDungCk, ' +
      'capLuc=excluded.capLuc, capBoi=excluded.capBoi'
    ).bind('gita365', nganHang, chuTk, soTk, qrDataUrl, noiDungCk, luc, hoSo.u),
    db.prepare(
      'INSERT INTO audit (id, luc, uid, username, viec, doiTuong, chiTiet) ' +
      'VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).bind(tokenMoi().slice(0, 24), luc, hoSo.uid, hoSo.u,
      'CAP_NHAT_TAI_KHOAN_NHAN', 'THANHTOAN',
      'Cập nhật thông tin nhận chuyển khoản; chi tiết tài khoản không ghi vào nhật ký.')
  ]);
  return {ok: true, capLuc: luc};
}
