/* ═══════════════════════════════════════════════════════════════
   GITA 365 — BÁO CÁO SOÁT TOÀN MÀN · CHỈ CẤT BẢN MÃ (SOAT-2026.10-a)

   Công cụ Soát toàn bộ màn (src/soat-toan-man.js) đi qua mọi màn bằng
   phiên thật của Super Admin rồi MÃ HOÁ báo cáo ngay trong trình duyệt
   (AES-256-GCM, khoá AES bọc RSA-OAEP-3072 bằng khoá công khai
   src/khoa-soat.js). Máy chủ không giải được và không cần giải:
     ghiSoatMan     R01 gửi bản mã. Kiểm đúng HÌNH của bản mã (chỉ các
                    trường v · dv · z · k · iv · d, base64, đúng độ dài khoá)
                    — từ chối mọi gói có chữ đọc được. Giữ 3 bản mới nhất.
     layBaoCaoSoat  KHÔNG cần phiên: trả bản mã mới nhất (≤ 14 ngày) để
                    workflow GitHub chuyển cho người giữ khoá riêng. Bản mã
                    không mở được nếu không có khoá riêng, nên cửa này không
                    lộ nội dung; nó không trả tên người gửi.
   ═══════════════════════════════════════════════════════════════ */
import { Kho } from './nen.js';

export const PHIEN_BAN_SOAT = 'SOAT-2026.10-a';
const TRAN = 1800000;                 /* D1: một ô chuỗi tối đa ~2 MB */
const B64 = /^[A-Za-z0-9+/]+={0,2}$/;
const HAN_NGAY = 14;

let daTao = false;
async function taoBang(db) {
  if (daTao) return;
  await db.prepare('CREATE TABLE IF NOT EXISTS soatMan (id TEXT PRIMARY KEY, luc TEXT NOT NULL, u TEXT NOT NULL, so INTEGER NOT NULL, dv TEXT NOT NULL, goi TEXT NOT NULL)').run();
  daTao = true;
}

/* Gói phải đúng là bản mã — không hơn một trường. */
export function laBanMa(goi) {
  if (!goi || typeof goi !== 'object' || Array.isArray(goi)) return false;
  const k = Object.keys(goi).sort().join(',');
  if (k !== 'd,dv,iv,k,v,z') return false;
  if (goi.v !== 1 || (goi.z !== 0 && goi.z !== 1)) return false;
  if (typeof goi.dv !== 'string' || !/^[0-9a-f]{16}$/.test(goi.dv)) return false;
  if (typeof goi.k !== 'string' || goi.k.length !== 512 || !B64.test(goi.k)) return false;   /* RSA-3072 = 384 byte */
  if (typeof goi.iv !== 'string' || goi.iv.length !== 16 || !B64.test(goi.iv)) return false;  /* 12 byte */
  if (typeof goi.d !== 'string' || goi.d.length < 24 || !B64.test(goi.d)) return false;
  return true;
}

export async function ghiSoatMan(y, env, db, hoSo) {
  if ((hoSo || {}).role !== 'R01') return { ok: false, code: 'NOPERM', error: 'Gửi báo cáo soát toàn màn chỉ dành cho Super Admin.' };
  const x = y || {}, than = String(x.goi || '');
  if (!than || than.length > TRAN) return { ok: false, error: 'Bản mã rỗng hoặc vượt ' + Math.round(TRAN / 1000) + ' KB.' };
  let goi;
  try { goi = JSON.parse(than); } catch (e) { return { ok: false, error: 'Bản mã hỏng.' }; }
  if (!laBanMa(goi)) return { ok: false, error: 'Chỉ nhận bản đã mã hoá đúng khuôn — không nhận dữ liệu đọc được.' };
  const so = Math.max(0, Math.min(5000, Math.floor(Number(x.so) || 0)));
  await taoBang(db);
  const id = 'SM-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), luc = new Date().toISOString();
  await db.prepare('INSERT INTO soatMan (id, luc, u, so, dv, goi) VALUES (?,?,?,?,?,?)').bind(id, luc, hoSo.u, so, goi.dv, than).run();
  await db.prepare('DELETE FROM soatMan WHERE id NOT IN (SELECT id FROM soatMan ORDER BY luc DESC, rowid DESC LIMIT 3)').run();
  await Kho.ghiNhatKy(db, { uid: hoSo.uid, username: hoSo.u, viec: 'SOAT_TOAN_MAN', doiTuong: id, chiTiet: so + ' màn · bản mã ' + Math.round(than.length / 1024) + ' KB · khoá ' + goi.dv });
  return { ok: true, id, luc, kb: Math.round(than.length / 1024) };
}

export async function layBaoCaoSoat(y, env, db) {
  await taoBang(db);
  const moc = new Date(Date.now() - HAN_NGAY * 86400000).toISOString();
  await db.prepare('DELETE FROM soatMan WHERE luc < ?').bind(moc).run();
  const r = await db.prepare('SELECT luc, so, dv, goi FROM soatMan ORDER BY luc DESC, rowid DESC LIMIT 1').first();
  if (!r) return { ok: true, trong: true };
  return { ok: true, luc: r.luc, so: r.so, dv: r.dv, goi: r.goi };
}
