/* ═══════════════════════════════════════════════════════════════
   GITA 365 — QUẢN LÝ TÀI KHOẢN NỘI BỘ

   Cổng dành cho Super Admin (R01) và Admin (R02) để:
     - Tạo tài khoản nội bộ
     - Cập nhật vai trò, phòng ban, thông tin
     - Xóa/offboard tài khoản
     - Khôi phục mật khẩu
     - Danh sách + tìm kiếm
   ═══════════════════════════════════════════════════════════════ */

import { Kho, kiemMatKhau, bamMoi, muoiMoi, kiemMkMoi } from './nen.js';
import { guiThu, CHAN_THU } from './thu.js';

const RE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const RE_TK    = /^[a-z0-9_.]{3,50}$/;
import { BAC } from './vai-tro.js';
import { vaBang } from './va-luoc-do.js';

function duocQuanLy(hoSo, muc) { return (BAC[hoSo.role] || 99) <= muc; }

/** Tạo tài khoản nội bộ — CHỈ Super Admin (V50·168: "việc cấp quyền hệ
    thống 100% do Super Admin"; mở tài khoản = cấp một vai). */
export async function taoTaiKhoanNoiBo(y, env, db, hoSo) {
  await vaBang(db, 'users');   /* V50·168: D1 dựng trước có thể thiếu phongBan · offboardedAt… */
  if (!duocQuanLy(hoSo, 1)) return { ok: false, code: 'NOPERM', error: 'Mở tài khoản và cấp vai do Super Admin.' };
  const d = y || {};
  const username = String(d.username || '').trim().toLowerCase();
  const email = String(d.email || '').trim().toLowerCase();
  const hoTen = String(d.hoTen || '').trim();
  const role = String(d.role || '').trim().toUpperCase();
  const phongBan = String(d.phongBan || '').trim().toUpperCase();
  const dienThoai = String(d.dienThoai || '').trim();
  const tempPw = String(d.matKhauTam || muoiMoi().slice(0, 12));

  if (!RE_TK.test(username)) return { ok: false, error: 'Tên đăng nhập 3-50 ký tự, chỉ chữ thường, số, dấu chấm, gạch dưới.' };
  if (!RE_EMAIL.test(email)) return { ok: false, error: 'Email chưa đúng.' };
  if (!hoTen) return { ok: false, error: 'Chưa điền họ tên.' };
  if (!BAC[role]) return { ok: false, error: 'Vai trò không hợp lệ.' };
  if ((BAC[hoSo.role] || 99) >= (BAC[role] || 99))
    return { ok: false, error: 'Không thể tạo tài khoản cấp cao hơn hoặc ngang cấp mình.' };

  const muoi = muoiMoi();
  const hash = await bamMoi(tempPw, muoi, env.GITA_TIEU);
  const uid = 'U-' + muoiMoi().slice(0, 16);
  const luc = new Date().toISOString();
  try {
    await db.prepare(
      /* Phòng ban vào ĐÚNG cột phongBan — bản cũ ghi nhầm vào maKhachHang (nhân
         sự mới mang "mã khách hàng" là tên phòng). '' thay "" (chuỗi chuẩn SQL). */
      'INSERT INTO users (id,username,hoTen,email,dienThoai,role,portal,' +
      'pwSalt,pwHash,active,createdAt,phongBan,boTro,mustChangePw) ' +
      "VALUES (?,?,?,?,?,?,?,?,?,1,?,?,'',1)"
    ).bind(uid, username, hoTen, email, dienThoai, role, 'noibo',
      muoi, hash, luc, phongBan || '').run();
  } catch (e) {
    if (/UNIQUE|unique/i.test(String(e && e.message || e)))
      return { ok: false, error: 'Tên đăng nhập hoặc email đã tồn tại.' };
    throw e;
  }

  await Kho.ghiNhatKy(db, { uid: hoSo.uid, username: hoSo.u,
    viec: 'TAO_TK_NOI_BO', doiTuong: uid, chiTiet: role + (phongBan ? '|' + phongBan : '') });

  await guiThu(env, { den: email,
    tieuDe: 'GITA 365 — tài khoản nội bộ đã mở',
    than: 'Chào ' + hoTen + ',\n\nTài khoản nội bộ GITA365 của bạn đã được tạo.\n' +
      'Tên đăng nhập: ' + username + '\n' +
      'Mật khẩu tạm thời: ' + tempPw + '\n\n' +
      'Vui lòng đăng nhập và đổi mật khẩu ngay trong 24 giờ.\n' + CHAN_THU });

  return { ok: true, uid, username, role, phongBan, ghiChu: 'Mật khẩu tạm đã gửi qua email.' };
}

/** Cập nhật thông tin tài khoản (R01/R02). ĐỔI VAI chỉ Super Admin. */
export async function capNhatTaiKhoan(y, env, db, hoSo) {
  await vaBang(db, 'users');   /* V50·168: D1 dựng trước có thể thiếu phongBan · offboardedAt… */
  if (!duocQuanLy(hoSo, 2)) return { ok: false, code: 'NOPERM' };
  const d = y || {};
  const username = String(d.username || '').trim().toLowerCase();
  const role = String(d.role || '').trim().toUpperCase();
  const phongBan = String(d.phongBan || '').trim().toUpperCase();
  const active = Number(d.active) === 0 ? 0 : 1;
  if (!username) return { ok: false, error: 'Thiếu username.' };

  const mucChoPhep = (BAC[hoSo.role] || 99);
  const taiKhoan = await db.prepare('SELECT id, role FROM users WHERE lower(username)=? LIMIT 1')
    .bind(username).first();
  if (!taiKhoan) return { ok: false, error: 'Không tìm thấy tài khoản.' };
  if (mucChoPhep >= (BAC[taiKhoan.role] || 99) && taiKhoan.id !== hoSo.uid)
    return { ok: false, error: 'Không được sửa tài khoản cấp cao hơn hoặc ngang cấp.' };

  const set = ['updatedAt = ?'];
  const val = [new Date().toISOString()];
  if (role && role !== taiKhoan.role) {
    if (hoSo.role !== 'R01') return { ok: false, code: 'NOPERM', error: 'Đổi vai (cấp quyền) do Super Admin.' };
    if (!BAC[role] || BAC[role] <= mucChoPhep) return { ok: false, error: 'Vai không hợp lệ hoặc ngang cấp Super Admin.' };
    set.push('role = ?'); val.push(role);
  }
  /* Chỉ ghi phòng ban khi lượt gọi CÓ gửi trường này — trước đây mọi lượt
     cập nhật không kèm phòng ban đều xoá trắng phòng ban của tài khoản. */
  if (d.phongBan !== undefined) { set.push('phongBan = ?'); val.push(phongBan); }
  if (d.active !== undefined) { set.push('active = ?'); val.push(active); }
  if (String(d.hoTen || '').trim()) { set.push('hoTen = ?'); val.push(String(d.hoTen).trim()); }
  if (String(d.email || '').trim() && RE_EMAIL.test(String(d.email).trim())) {
    set.push('email = ?'); val.push(String(d.email).trim().toLowerCase());
  }
  val.push(username);
  await db.prepare('UPDATE users SET ' + set.join(', ') + ' WHERE lower(username) = ?').bind(...val).run();

  await Kho.ghiNhatKy(db, { uid: hoSo.uid, username: hoSo.u,
    viec: 'CAP_NHAT_TK', doiTuong: username, chiTiet: set.join(', ') });
  return { ok: true, username };
}

/** Danh sách tài khoản nội bộ (R01–R04). */
export async function dsTaiKhoan(y, env, db, hoSo) {
  await vaBang(db, 'users');   /* V50·168: D1 dựng trước có thể thiếu phongBan · offboardedAt… */
  if (!duocQuanLy(hoSo, 4)) return { ok: false, code: 'NOPERM' };
  const q = y || {};
  const tim = String(q.tim || '').trim().toLowerCase();
  const phongBan = String(q.phongBan || '').trim().toUpperCase();
  const role = String(q.role || '').trim().toUpperCase();
  const limit = Math.min(200, Math.max(10, Number(q.limit) || 50));
  const offset = Math.max(0, Number(q.offset) || 0);

  let sql = 'SELECT id, username, hoTen, email, dienThoai, role, phongBan, active, createdAt, mustChangePw, deletedAt FROM users WHERE 1=1';
  const p = [];
  /* V50·168: Giám đốc / QLCM thấy danh bạ NHÂN SỰ; khách hàng (email, điện
     thoại của gia đình) chỉ R01–R02 xem ở đây — đội ngũ xem khách qua CRM theo quyền. */
  if ((BAC[hoSo.role] || 99) > 2) sql += " AND role IN ('R01','R02','R03','R04','R05','R06','R07','R08','R09','R10','R11','R12') AND deletedAt IS NULL";
  if (tim) { sql += ' AND (lower(username) LIKE ? OR lower(hoTen) LIKE ? OR lower(email) LIKE ?)'; p.push('%'+tim+'%','%'+tim+'%','%'+tim+'%'); }
  if (phongBan) { sql += ' AND phongBan = ?'; p.push(phongBan); }
  if (role) { sql += ' AND role = ?'; p.push(role); }
  sql += ' ORDER BY createdAt DESC LIMIT ? OFFSET ?';
  p.push(limit, offset);
  const rs = ((await db.prepare(sql).bind(...p).all()).results) || [];
  return { ok: true, ds: rs };
}

/** Khóa/xóa (offboard) tài khoản — R01/R02, R03 trong phòng ban. */
export async function offboardTaiKhoan(y, env, db, hoSo) {
  await vaBang(db, 'users');   /* V50·168: D1 dựng trước có thể thiếu phongBan · offboardedAt… */
  if (!duocQuanLy(hoSo, 3)) return { ok: false, code: 'NOPERM' };
  const username = String((y || {}).username || '').trim().toLowerCase();
  const lyDo = String((y || {}).lyDo || '').trim();
  if (!username) return { ok: false, error: 'Thiếu username.' };

  const mucChoPhep = (BAC[hoSo.role] || 99);
  const taiKhoan = await db.prepare('SELECT id, role, phongBan FROM users WHERE lower(username)=? LIMIT 1')
    .bind(username).first();
  if (!taiKhoan) return { ok: false, error: 'Không tìm thấy tài khoản.' };
  if (mucChoPhep > (BAC[taiKhoan.role] || 99) && taiKhoan.id !== hoSo.uid)
    return { ok: false, error: 'Không được offboard tài khoản cấp cao hơn.' };
  if (taiKhoan.role === 'R01' && taiKhoan.id !== hoSo.uid)
    return { ok: false, error: 'Không được offboard Super Admin khác.' };

  const luc = new Date().toISOString();
  await db.batch([
    db.prepare("UPDATE users SET active=0, deletedAt=?, offboardedAt=?, offboardedBy=?, lyDoOffboard=? WHERE id=?")
      .bind(luc, luc, hoSo.uid, lyDo, taiKhoan.id),
    db.prepare("DELETE FROM sessions WHERE uid=?").bind(taiKhoan.id)
  ]);
  await Kho.ghiNhatKy(db, { uid: hoSo.uid, username: hoSo.u,
    viec: 'OFFBOARD_TK', doiTuong: username, chiTiet: lyDo });
  return { ok: true, username, luc };
}

/** Khôi phục mật khẩu bởi Admin/Super Admin. */
export async function adminKhoiPhucMatKhau(y, env, db, hoSo) {
  if (!duocQuanLy(hoSo, 2)) return { ok: false, code: 'NOPERM' };
  const username = String((y || {}).username || '').trim().toLowerCase();
  const matKhauMoi = String((y || {}).matKhauMoi || '').trim();
  if (!username) return { ok: false, error: 'Thiếu username.' };
  const cheMk = matKhauMoi ? await kiemMkMoi(matKhauMoi, {username}, env) : 'Thiếu mật khẩu mới.';
  if (cheMk) return { ok: false, code: 'WEAK', error: cheMk };

  const taiKhoan = await db.prepare('SELECT id, email, role FROM users WHERE lower(username)=? LIMIT 1')
    .bind(username).first();
  if (!taiKhoan) return { ok: false, error: 'Không tìm thấy tài khoản.' };
  /* Ngang cấp cũng chặn (trừ chính mình): một Admin không đặt lại mật khẩu
     của Admin khác — đó là đường chiếm tài khoản ngang hàng. */
  if ((BAC[hoSo.role] || 99) >= (BAC[taiKhoan.role] || 99) && taiKhoan.id !== hoSo.uid)
    return { ok: false, error: 'Không đổi mật khẩu tài khoản cấp cao hơn hoặc ngang cấp.' };

  const muoi = muoiMoi();
  const hash = await bamMoi(matKhauMoi, muoi, env.GITA_TIEU);
  const luc = new Date().toISOString();
  await db.batch([
    db.prepare('UPDATE users SET pwSalt=?, pwHash=?, mustChangePw=1, pwDoiLuc=?, updatedAt=? WHERE id=?')
      .bind(muoi, hash, luc, luc, taiKhoan.id),
    db.prepare('DELETE FROM sessions WHERE uid=?').bind(taiKhoan.id)
  ]);
  await Kho.ghiNhatKy(db, { uid: hoSo.uid, username: hoSo.u,
    viec: 'ADMIN_KHOI_PHUC_MK', doiTuong: username, chiTiet: '' });

  if (taiKhoan.email) {
    await guiThu(env, { den: taiKhoan.email,
      tieuDe: 'GITA 365 — mật khẩu đã được đặt lại',
      than: 'Tài khoản ' + username + ' đã được đặt lại mật khẩu bởi quản trị viên.\n' +
        'Vui lòng đăng nhập bằng mật khẩu mới và đổi ngay.\n' + CHAN_THU });
  }
  return { ok: true, username };
}
