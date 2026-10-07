/* ═══════════════════════════════════════════════════════════════
   GITA 365 — TỰ VÁ LƯỢC ĐỒ D1 (V50·168)

   csdl.sql dựng bảng bằng CREATE TABLE IF NOT EXISTS, nên chạy lại trên một
   D1 đã có bảng thì CỘT THÊM SAU không tới — cửa dùng cột ấy hỏng âm thầm ở
   máy thật dù mọi phép thử (chạy trên lược đồ mới) đều xanh. Ở đây:

     vaBang(db, ten)     so PRAGMA table_info với luoc-do-cot.js, thêm cột
                         thiếu (ALTER TABLE ADD COLUMN). Mỗi bảng một lần /
                         một isolate — gọi ở đầu cửa dùng cột mới là rẻ.
     vaLuocDo(db)        soát toàn bộ bảng: cột thiếu đã thêm · cột không thêm
                         được (NOT NULL không mặc định) · bảng chưa có.
     soatLuocDo (cửa)    R01: chạy vaLuocDo và trả kết quả.
   Chỉ THÊM cột. Không bao giờ xoá, đổi tên hay đổi kiểu cột.
   ═══════════════════════════════════════════════════════════════ */
import { LUOC_DO_COT } from './luoc-do-cot.js';

const DA = {};
function khaiThem(khai) {
  /* ADD COLUMN không nhận PRIMARY KEY / UNIQUE; NOT NULL phải có DEFAULT. */
  const k = String(khai || '').replace(/\bPRIMARY KEY\b(\s+AUTOINCREMENT)?/i, '').replace(/\bUNIQUE\b/i, '').trim();
  if (/\bNOT NULL\b/i.test(k) && !/\bDEFAULT\b/i.test(k)) return null;
  return k;
}

export async function vaBang(db, ten) {
  if (DA[ten]) return DA[ten];
  const cot = LUOC_DO_COT[ten];
  const kq = { bang: ten, them: [], boQua: [], chuaCo: false };
  if (!cot) { DA[ten] = kq; return kq; }
  let co;
  try { co = ((await db.prepare('PRAGMA table_info(' + ten + ')').all()).results || []).map(r => r.name); } catch (e) { return kq; }
  if (!co.length) { kq.chuaCo = true; DA[ten] = kq; return kq; }
  for (const [ten2, khai] of cot) {
    if (co.indexOf(ten2) >= 0) continue;
    const k = khaiThem(khai);
    if (k === null) { kq.boQua.push(ten2); continue; }
    try { await db.prepare('ALTER TABLE ' + ten + ' ADD COLUMN ' + ten2 + (k ? ' ' + k : '')).run(); kq.them.push(ten2); }
    catch (e) { if (!/duplicate column/i.test(String(e && e.message || e))) kq.boQua.push(ten2); }
  }
  DA[ten] = kq;
  return kq;
}

export async function vaLuocDo(db) {
  const them = [], boQua = [], chuaCo = [];
  for (const ten of Object.keys(LUOC_DO_COT)) {
    delete DA[ten];
    const k = await vaBang(db, ten);
    k.them.forEach(c => them.push(ten + '.' + c));
    k.boQua.forEach(c => boQua.push(ten + '.' + c));
    if (k.chuaCo) chuaCo.push(ten);
  }
  return { ok: true, soBang: Object.keys(LUOC_DO_COT).length, them, boQua, chuaCo };
}

export async function soatLuocDo(y, env, db, hoSo) {
  if ((hoSo || {}).role !== 'R01') return { ok: false, code: 'NOPERM', error: 'Soát lược đồ dành cho Super Admin.' };
  return await vaLuocDo(db);
}
