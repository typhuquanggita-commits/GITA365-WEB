import { Kho, tokenMoi } from './nen.js';

const BAC = {R01:1,R02:2,R03:3,R04:4,R05:5,R06:6,R07:7,R08:8,
  R09:9,R10:10,R11:11,R12:12,R13:13,R14:14,R15:15};
const ADMIN_MAX = 2;

function laAdmin(hoSo) {
  return (BAC[hoSo.role] || 99) <= ADMIN_MAX;
}

export async function quyenT5ProDangHieuLuc(db, uid) {
  const bay = new Date().toISOString();
  const r = await db.prepare(
    'SELECT id FROM quyenT5Pro WHERE userId = ? AND thuHoiLuc IS NULL AND hetHan > ? ' +
    'ORDER BY capLuc DESC LIMIT 1'
  ).bind(String(uid || ''), bay).first();
  return !!r;
}

export async function capQuyenT5Pro(y, env, db, hoSo) {
  if (!laAdmin(hoSo))
    return {ok: false, code: 'NOPERM',
      error: 'Chỉ Super Admin hoặc Admin hệ thống cấp quyền T5-PRO.'};

  const username = String(y.username || '').trim().toLowerCase();
  const lyDo = String(y.lyDo || '').trim();
  const hetHan = new Date(String(y.hetHan || ''));
  if (!username) return {ok: false, error: 'Thiếu tên đăng nhập được cấp.'};
  if (!lyDo) return {ok: false, error: 'Phải ghi lý do cấp quyền T5-PRO.'};
  if (!y.hetHan || !Number.isFinite(hetHan.getTime()) || hetHan <= new Date())
    return {ok: false, error: 'Ngày hết hạn phải là thời điểm trong tương lai.'};

  const nd = await db.prepare(
    'SELECT id, username, role FROM users WHERE lower(username) = ? ' +
    'AND active = 1 AND deletedAt IS NULL LIMIT 1'
  ).bind(username).first();
  if (!nd) return {ok: false, error: 'Không tìm thấy tài khoản đang hoạt động.'};
  if (String(nd.id) === String(hoSo.uid || ''))
    return {ok: false, code: 'TUCAP', error: 'Không tự cấp quyền T5-PRO cho chính mình.'};
  if (!BAC[nd.role] || BAC[nd.role] <= ADMIN_MAX || BAC[nd.role] > 12)
    return {ok: false, error: 'Tài khoản R01–R02 đã có quyền quản trị mặc định; không cần cấp thêm.'};

  const luc = new Date().toISOString();
  const id = 'QT5-' + tokenMoi().slice(0, 14);
  const tenChuan = String(nd.username || username).trim().toLowerCase();
  await db.batch([
    db.prepare('UPDATE quyenT5Pro SET thuHoiLuc = ?, thuHoiBoi = ? ' +
      'WHERE userId = ? AND thuHoiLuc IS NULL')
      .bind(luc, hoSo.u, nd.id),
    db.prepare('INSERT INTO quyenT5Pro ' +
      '(id,userId,username,role,lyDo,nguoiCap,capLuc,hetHan) VALUES (?,?,?,?,?,?,?,?)')
      .bind(id, nd.id, tenChuan, nd.role, lyDo.slice(0, 500), hoSo.u, luc, hetHan.toISOString())
  ]);

  await Kho.ghiNhatKy(db, {uid: hoSo.uid, username: hoSo.u, viec: 'T5PRO_CAP',
    doiTuong: tenChuan, chiTiet: nd.role + ' · ' + hetHan.toISOString() + ' · ' + lyDo.slice(0, 300)});
  return {ok: true, id, username: tenChuan, role: nd.role, hetHan: hetHan.toISOString(),
    ghiChu: 'Tài khoản cần đăng nhập lại để nhận gói được cấp.'};
}

export async function thuHoiQuyenT5Pro(y, env, db, hoSo) {
  if (!laAdmin(hoSo))
    return {ok: false, code: 'NOPERM',
      error: 'Chỉ Super Admin hoặc Admin hệ thống thu hồi quyền T5-PRO.'};

  const username = String(y.username || '').trim().toLowerCase();
  if (!username) return {ok: false, error: 'Thiếu tên đăng nhập cần thu hồi.'};
  const nd = await db.prepare(
    'SELECT id, username FROM users WHERE lower(username) = ? LIMIT 1'
  ).bind(username).first();
  if (!nd) return {ok: false, error: 'Không tìm thấy tài khoản.'};
  const luc = new Date().toISOString();
  const r = await db.prepare(
    'UPDATE quyenT5Pro SET thuHoiLuc = ?, thuHoiBoi = ? ' +
    'WHERE userId = ? AND thuHoiLuc IS NULL'
  ).bind(luc, hoSo.u, nd.id).run();
  const soDong = (r && r.meta && r.meta.changes) || 0;
  if (!soDong) return {ok: false, error: 'Tài khoản không có quyền T5-PRO còn hiệu lực.'};

  await Kho.ghiNhatKy(db, {uid: hoSo.uid, username: hoSo.u, viec: 'T5PRO_THUHOI',
    doiTuong: String(nd.username || username), chiTiet: 'thu hồi ' + soDong + ' quyền'});
  return {ok: true, daThuHoi: soDong,
    ghiChu: 'Lượt xin khóa tiếp theo sẽ bị chặn; dữ liệu đã giải mã trong phiên hiện tại không thể thu hồi từ xa.'};
}

export async function dsQuyenT5Pro(y, env, db, hoSo) {
  if (!laAdmin(hoSo))
    return {ok: false, code: 'NOPERM',
      error: 'Chỉ Super Admin hoặc Admin hệ thống xem được sổ quyền T5-PRO.'};

  const r = await db.prepare(
    'SELECT username, role, lyDo, nguoiCap, capLuc, hetHan, thuHoiLuc, thuHoiBoi ' +
    'FROM quyenT5Pro ORDER BY capLuc DESC LIMIT 300'
  ).all();
  const bay = new Date().toISOString();
  const ds = (r.results || []).map(x => ({
    username: x.username, role: x.role, lyDo: x.lyDo, nguoiCap: x.nguoiCap,
    capLuc: x.capLuc, hetHan: x.hetHan, thuHoiLuc: x.thuHoiLuc || undefined,
    thuHoiBoi: x.thuHoiBoi || undefined,
    conHieuLuc: !x.thuHoiLuc && x.hetHan > bay
  }));
  return {ok: true, ds,
    vi: 'R01–R02 có quyền mặc định. Vai khác chỉ nhận gói khi có quyền cá nhân còn hạn.'};
}
