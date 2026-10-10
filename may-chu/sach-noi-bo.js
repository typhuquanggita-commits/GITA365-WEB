/* ═══════════════════════════════════════════════════════════════
   GITA 365 — SÁCH NỘI BỘ · SỔ TRI THỨC "CÂY TIỀN" (Lý Tiễn)  (10/2026)

   Chủ hệ chụp trọn cuốn "Cây Tiền" lên Drive ngày 28/08/2026 để biên soạn.
   Lượt biên soạn đầu chỉ đọc 4 chương. Bản này đọc ĐỦ trang 25–292 (tám
   chương) và biên soạn thành sổ tri thức theo chương: luận điểm, chuẩn có
   dẫn số trang, trích ngắn, cách áp vào chăm sóc VIP/VVIP, chỗ va luật GITA.

   ══ VÌ SAO NỘI DUNG KHÔNG NẰM TRONG TỆP NÀY ══
   Kho mã gita365-web là CÔNG KHAI, còn sách là tác phẩm có bản quyền.
   Một dòng nào của sách lọt vào mã nguồn là đem sách đăng lên mạng. Nên:
     - kho mã chỉ chứa kho-sach/cay-tien.enc (AES-256-GCM, PBKDF2 250k);
     - mật khẩu nằm riêng ở Drive của chủ hệ, không qua máy chủ;
     - Super Admin mở gói NGAY TRÊN MÁY mình rồi nạp vào bảng sachNoiBo;
     - tệp này chỉ giữ CÁI KHUNG (lược đồ + cổng), không một chữ của sách.

   ══ AI ĐỌC ══
   Sách dùng cho QUẢN TRỊ quan hệ khách hàng, không dạy học viên, không cho
   khách xem (cùng ranh giới màn cay-tien). Đọc: R01–R11 — đúng bậc của
   quyền pro_consult mà Phòng VVIP và màn cay-tien đang dùng. Mỗi lượt mở
   một chương ghi nhật ký SACH_DOC: sách có bản quyền đọc nội bộ thì phải
   biết ai đã đọc.
   ═══════════════════════════════════════════════════════════════ */
'use strict';

import { BAC, roleOf, tenNguoiDung as ten } from './vai-tro.js';
import { Kho } from './nen.js';

export const SACH = Object.freeze({
  'cay-tien': Object.freeze({ ten: 'Cây Tiền', tacGia: 'Lý Tiễn', tuSach: 'Tinh hoa quản trị Trung Quốc', chuong: 8 })
});
export const BAC_DOC = 11;           /* pro_consult: R01–R11 */
export const NGAN_VVIP = Object.freeze(['nhan', 'phucvu', 'hoso', 'wow', 'chiendich', 'blueprint']);
const MA_CHUONG = /^C[1-8]$/;
const MA_MUC = /^C[1-8]\.\d{1,2}$/;
export const TRAN_TRICH = 40;        /* chữ — trích dài hơn là chép sách, không phải dẫn */

let daDung = false;
async function taoBang(db) {
  if (daDung) return;
  await db.prepare('CREATE TABLE IF NOT EXISTS sachNoiBo (ma TEXT PRIMARY KEY, sach TEXT NOT NULL, chuong TEXT NOT NULL, ten TEXT NOT NULL, ' +
    'trang TEXT, noiDung TEXT NOT NULL, ban TEXT, napLuc INTEGER NOT NULL)').run();
  daDung = true;
}

function chu(s, n) { return String(s == null ? '' : s).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '').trim().slice(0, n); }
function soChu(s) { return String(s || '').trim().split(/\s+/).filter(Boolean).length; }

/* Soát MỘT chương trước khi nạp — dùng chung cho công cụ đóng gói và cửa
   nạp, để hai nơi không giữ hai bản luật. Trả mảng lỗi (rỗng = qua). */
export function soatChuong(c) {
  const l = [];
  if (!c || typeof c !== 'object') return ['khongPhaiVat'];
  if (!MA_CHUONG.test(String(c.ma || ''))) l.push('ma');
  if (!chu(c.ten, 300)) l.push('ten');
  if (String(c.tomTat || '').trim().length < 80) l.push('tomTat');
  if (!Array.isArray(c.muc) || !c.muc.length) l.push('muc');
  (c.muc || []).forEach((m, i) => {
    const k = 'muc' + i;
    if (!MA_MUC.test(String(m && m.ma || '')) || !String(m.ma).startsWith(c.ma + '.')) l.push(k + '.ma');
    if (!chu(m && m.ten, 300)) l.push(k + '.ten');
    if (!Array.isArray(m.yChinh) || m.yChinh.length < 3) l.push(k + '.yChinh');
    if (!Array.isArray(m.apGita) || m.apGita.length < 1) l.push(k + '.apGita');
    (m.trich || []).forEach((t, j) => { if (soChu(t && t.cau) > TRAN_TRICH) l.push(k + '.trich' + j + '.dai'); });
    (m.noiVvip || []).forEach(n => { if (!NGAN_VVIP.includes(n)) l.push(k + '.noiVvip:' + n); });
  });
  if (!Array.isArray(c.canhBao)) l.push('canhBao');
  return l;
}

/* CỬA · NẠP — chỉ Super Admin, cả lô hoặc không gì (db.batch). */
export async function napSachNoiBo(y, env, db, hoSo) {
  if (BAC[roleOf(hoSo)] !== 1) return { ok: false, code: 'NOPERM', error: 'Chỉ Super Admin nạp sách nội bộ.' };
  const x = y || {};
  const sach = String(x.sach || '');
  if (!SACH[sach]) return { ok: false, code: 'SAI', error: 'Sách không có trong danh mục.' };
  const ds = Array.isArray(x.ds) ? x.ds : [];
  if (!ds.length || ds.length > 8) return { ok: false, code: 'SAI', error: 'Mỗi lượt nạp từ 1 đến 8 chương.' };
  const hong = [];
  ds.forEach(c => { const l = soatChuong(c); if (l.length) hong.push((c && c.ma || '?') + ': ' + l.slice(0, 6).join(',')); });
  if (hong.length) return { ok: false, code: 'HONG', hong, error: hong.length + ' chương không qua soát — không nạp chương nào.' };
  await taoBang(db);
  const luc = Date.now(), ban = chu(x.ban, 40) || null;
  await db.batch(ds.map(c => db.prepare('INSERT INTO sachNoiBo (ma, sach, chuong, ten, trang, noiDung, ban, napLuc) VALUES (?,?,?,?,?,?,?,?) ' +
    'ON CONFLICT(ma) DO UPDATE SET ten=excluded.ten, trang=excluded.trang, noiDung=excluded.noiDung, ban=excluded.ban, napLuc=excluded.napLuc')
    .bind(sach + ':' + c.ma, sach, c.ma, chu(c.ten, 300), chu(c.trang, 20), JSON.stringify(c), ban, luc)));
  try { await Kho.ghiNhatKy(db, { uid: hoSo.uid, username: ten(hoSo), viec: 'SACH_NAP', doiTuong: sach, chiTiet: ds.length + ' chương · ' + (ban || '') }); } catch (e) {}
  return { ok: true, nap: ds.length };
}

function docDuoc(hoSo) { const b = BAC[roleOf(hoSo)]; return !!b && b <= BAC_DOC; }

/* CỬA · MỤC LỤC — tên chương + tên mục, không nội dung. */
export async function dsSachNoiBo(y, env, db, hoSo) {
  if (!docDuoc(hoSo)) return { ok: false, code: 'NOPERM', error: 'Sách nội bộ chỉ mở cho nhân sự có quyền công cụ tư vấn.' };
  const sach = String((y || {}).sach || 'cay-tien');
  if (!SACH[sach]) return { ok: false, code: 'SAI', error: 'Sách không có trong danh mục.' };
  await taoBang(db);
  const r = await db.prepare('SELECT chuong, ten, trang, noiDung, ban, napLuc FROM sachNoiBo WHERE sach = ? ORDER BY chuong').bind(sach).all();
  const ds = (r.results || []).map(x => {
    let n = {}; try { n = JSON.parse(x.noiDung); } catch (e) {}
    return { ma: x.chuong, ten: x.ten, trang: x.trang, muc: (n.muc || []).map(m => ({ ma: m.ma, ten: m.ten, trang: m.trang })), ban: x.ban, napLuc: x.napLuc };
  });
  return { ok: true, sach: SACH[sach], ds, du: ds.length === SACH[sach].chuong,
    vi: ds.length ? undefined : 'Chưa nạp gói sách. Super Admin mở gói kho-sach/cay-tien.enc bằng mật khẩu ở Drive rồi nạp.' };
}

/* CỬA · ĐỌC MỘT CHƯƠNG — có nhật ký. */
export async function docSachNoiBo(y, env, db, hoSo) {
  if (!docDuoc(hoSo)) return { ok: false, code: 'NOPERM', error: 'Sách nội bộ chỉ mở cho nhân sự có quyền công cụ tư vấn.' };
  const x = y || {}, sach = String(x.sach || 'cay-tien'), ma = String(x.chuong || '');
  if (!SACH[sach] || !MA_CHUONG.test(ma)) return { ok: false, code: 'SAI', error: 'Sai sách hoặc sai mã chương.' };
  await taoBang(db);
  const r = await db.prepare('SELECT noiDung, ban FROM sachNoiBo WHERE ma = ?').bind(sach + ':' + ma).first();
  if (!r) return { ok: false, code: 'CHUANAP', error: 'Chương này chưa được nạp.' };
  try { await Kho.ghiNhatKy(db, { uid: hoSo.uid, username: ten(hoSo), viec: 'SACH_DOC', doiTuong: sach + ':' + ma, chiTiet: r.ban || '' }); } catch (e) {}
  return { ok: true, chuong: JSON.parse(r.noiDung), ban: r.ban };
}
