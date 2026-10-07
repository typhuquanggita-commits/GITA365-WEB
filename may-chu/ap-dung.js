/* ═══════════════════════════════════════════════════════════════
   GITA 365 — V50 · ĐO MỨC ÁP DỤNG HỌC THUYẾT (V50-2026.10-a)

   160 màn học thuyết được gom vào 14 cụm (src/data-v50.js). Mỗi cụm có
   một bảng việc áp dụng 5–6 dòng. Nhân sự tự soát: đã làm · đang làm ·
   chưa · không liên quan. Đây là chỗ biến "đọc" thành "làm" và đo được:
     ghiApDung   nhân sự ghi bảng tự soát một cụm (một dòng / người / cụm)
     docApDung   đọc các bảng của chính mình (để mở máy khác vẫn thấy)
     tongApDung  R01–R03: mức áp dụng từng cụm, từng vai, độ phủ, người
                 chưa soát — để biết học thuyết nào đang nằm trên giấy.

   Chỉ nhân sự (R01–R12) ghi. Không ghi nhật ký kiểm toán cho mỗi lượt
   tự soát — đây là tự đánh giá, không phải thao tác nghiệp vụ, và ghi
   audit sẽ làm sai chỉ số "thao tác mỗi nhân sự" của Trung tâm đo lường.
   ═══════════════════════════════════════════════════════════════ */
import { BAC } from './vai-tro.js';

export const PHIEN_BAN_AD = 'V50-2026.10-a';
/* Số việc của từng cụm — bản sao của src/data-v50.js (thu-ap-dung.mjs so). */
export const CUM_SO = { PP: 6, KHO: 5, NGHE: 5, COACH: 6, TUVAN: 5, VIP: 5, TRAI: 5, MK: 5, GD: 5, NHA: 5, PL: 5, TC: 5, KT: 5, CT: 5 };
const TT = { da: 1, dang: 1, chua: 1, kl: 1 };

export function chamApDung(tt) {
  let da = 0, dang = 0, kl = 0;
  const n = (tt || []).length;
  for (const x of tt || []) { if (x === 'da') da++; else if (x === 'dang') dang++; else if (x === 'kl') kl++; }
  const tong = n - kl;
  return { da, dang, tong, diem: tong > 0 ? Math.round(100 * (da + 0.5 * dang) / tong) : null };
}

const lvOf = hoSo => BAC[(hoSo || {}).role] || 99;
let daTao = false;
async function taoBang(db) {
  if (daTao) return;
  await db.prepare('CREATE TABLE IF NOT EXISTS apDung (u TEXT NOT NULL, vai TEXT NOT NULL, cum TEXT NOT NULL, diem REAL, da INTEGER NOT NULL, ' +
    'dang INTEGER NOT NULL, tong INTEGER NOT NULL, chiTiet TEXT NOT NULL, luc TEXT NOT NULL, PRIMARY KEY (u, cum))').run();
  daTao = true;
}

export async function ghiApDung(y, env, db, hoSo) {
  if (lvOf(hoSo) > 12) return { ok: false, code: 'NOPERM', error: 'Tự soát áp dụng dành cho đội ngũ GITA 365.' };
  const x = y || {}, cum = String(x.cum || '');
  if (!Object.prototype.hasOwnProperty.call(CUM_SO, cum)) return { ok: false, error: 'Không có cụm mang mã này.' };
  const tt = Array.isArray(x.tt) ? x.tt.map(String) : [];
  if (tt.length !== CUM_SO[cum] || tt.some(v => !TT[v])) return { ok: false, error: 'Bảng tự soát không khớp số việc của cụm.' };
  await taoBang(db);
  const c = chamApDung(tt), luc = new Date().toISOString();
  await db.prepare('INSERT INTO apDung (u, vai, cum, diem, da, dang, tong, chiTiet, luc) VALUES (?,?,?,?,?,?,?,?,?) ' +
    'ON CONFLICT(u, cum) DO UPDATE SET vai = excluded.vai, diem = excluded.diem, da = excluded.da, dang = excluded.dang, ' +
    'tong = excluded.tong, chiTiet = excluded.chiTiet, luc = excluded.luc')
    .bind(hoSo.u, hoSo.role, cum, c.diem, c.da, c.dang, c.tong, JSON.stringify(tt), luc).run();
  return { ok: true, cum, ...c, luc };
}

export async function docApDung(y, env, db, hoSo) {
  if (lvOf(hoSo) > 12) return { ok: true, ds: [] };
  await taoBang(db);
  const r = (await db.prepare('SELECT cum, diem, chiTiet, luc FROM apDung WHERE u = ?').bind(hoSo.u).all()).results || [];
  return { ok: true, ds: r.map(z => ({ cum: z.cum, diem: z.diem, tt: JSON.parse(z.chiTiet || '[]'), luc: z.luc })) };
}

export async function tongApDung(y, env, db, hoSo) {
  if (lvOf(hoSo) > 3) return { ok: false, code: 'NOPERM', error: 'Tổng hợp mức áp dụng mở cho R01–R03.' };
  await taoBang(db);
  let nhanSu = null;
  try {
    const n = await db.prepare("SELECT COUNT(*) AS n FROM users WHERE active = 1 AND deletedAt IS NULL AND role IN ('R01','R02','R03','R04','R05','R06','R07','R08','R09','R10','R11','R12')").first();
    nhanSu = n ? Number(n.n) : null;
  } catch (e) { nhanSu = null; }
  const cum = (await db.prepare('SELECT cum, COUNT(*) AS soNguoi, ROUND(AVG(diem), 1) AS diemTB, MIN(diem) AS thapNhat, MAX(luc) AS moiNhat ' +
    'FROM apDung WHERE diem IS NOT NULL GROUP BY cum').all()).results || [];
  const vai = (await db.prepare('SELECT vai, cum, ROUND(AVG(diem), 1) AS diemTB, COUNT(*) AS soNguoi FROM apDung WHERE diem IS NOT NULL GROUP BY vai, cum').all()).results || [];
  const soNguoiSoat = await db.prepare('SELECT COUNT(DISTINCT u) AS n FROM apDung').first();
  const thap = (await db.prepare('SELECT u, vai, cum, diem, luc FROM apDung WHERE diem IS NOT NULL AND diem < 50 ORDER BY diem ASC, luc ASC LIMIT 20').all()).results || [];
  return {
    ok: true, phienBan: PHIEN_BAN_AD, nhanSu, daSoat: soNguoiSoat ? Number(soNguoiSoat.n) : 0,
    phu: nhanSu ? Math.round(1000 * (soNguoiSoat ? Number(soNguoiSoat.n) : 0) / nhanSu) / 10 : null,
    cum, vai, thap
  };
}
