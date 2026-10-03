/* ═══════════════════════════════════════════════════════════════
   GITA 365 — AGENT TỰ SOÁT & TỰ CHỮA (chạy theo lịch đêm)

   Không phải một "AI" đoán lỗi: là một vòng kiểm cố định, rẻ, đi theo
   KHO DỮ LIỆU THẬT và chỉ chữa những thứ có nguồn sự thật để chữa.

     1. NHỊP TIM   — D1 trả lời SELECT 1? R2 ghi/đọc được một tệp nhỏ?
     2. SOÁT HỒ SƠ — mỗi đêm một trang ≤ 200 dòng hosoApp (con trỏ lưu ở
        R2, lượt sau đi tiếp, hết vòng quay lại đầu). Dòng nào sổ D1 có
        mà R2 mất tệp → dựng lại từ bản sao lưu gần nhất đọc được.
        (Tệp HỎNG được chữa ngay lúc người dùng đồng bộ — dongBo — vì
        soát hỏng phải đọc trọn tệp, đắt; soát MẤT chỉ cần head, rẻ.)
     3. KHOANG     — mở các khoang đã hết hạn khoá.
     4. BÁO CÁO    — ghi he-thong/suc-khoe.json; Super Admin đọc bằng
        cửa sucKhoeHe. Không gửi ra ngoài, không lộ dữ liệu người dùng.

   Chi phí mỗi đêm cố định: ≤ 1 câu D1 đọc trang + ≤ 200 head R2 (lớp B)
   + 3 lượt ghi R2 — không phình theo số người dùng.
   ═══════════════════════════════════════════════════════════════ */

import { khoiPhucTuSaoLuu } from './dong-bo.js';
import { donKhoangHetHan } from './khoang.js';

const KHOA_CON_TRO = 'he-thong/con-tro-tu-chua.txt';
const KHOA_BAO_CAO = 'he-thong/suc-khoe.json';

export async function tuSoatVaChua(env, trang) {
  const db = env && env.CSDL, kho = env && env.HOSO;
  const bc = {luc: new Date().toISOString(), d1: false, r2: false, daSoat: 0, mat: 0, daChua: 0,
    khongChuaDuoc: 0, moKhoang: 0, loi: []};

  try { const r = await db.prepare('SELECT 1 AS n').first(); bc.d1 = !!(r && r.n === 1); }
  catch (e) { bc.loi.push('d1: ' + String(e && e.message || e).slice(0, 120)); }
  try {
    await kho.put('he-thong/nhip-tim.txt', bc.luc);
    const o = await kho.get('he-thong/nhip-tim.txt');
    bc.r2 = !!(o && (await o.text()) === bc.luc);
  } catch (e) { bc.loi.push('r2: ' + String(e && e.message || e).slice(0, 120)); }

  if (bc.d1 && bc.r2) {
    let tu = '';
    try { const o = await kho.get(KHOA_CON_TRO); tu = o ? (await o.text()) || '' : ''; } catch (e) {}
    try {
      const r = await db.prepare('SELECT uid, khoaTep FROM hosoApp WHERE uid > ? ORDER BY uid LIMIT ?')
        .bind(tu, trang || 200).all();
      const ds = r.results || [];
      for (const x of ds) {
        bc.daSoat++;
        let co = null;
        try { co = await kho.head(x.khoaTep); } catch (e) { continue; }
        if (co) continue;
        bc.mat++;
        if (await khoiPhucTuSaoLuu(db, kho, x.uid, 'mat')) bc.daChua++; else bc.khongChuaDuoc++;
      }
      const tiep = ds.length === (trang || 200) ? ds[ds.length - 1].uid : '';
      await kho.put(KHOA_CON_TRO, tiep);
    } catch (e) { bc.loi.push('soat: ' + String(e && e.message || e).slice(0, 120)); }
    bc.moKhoang = await donKhoangHetHan(db);
  }

  try { if (kho) await kho.put(KHOA_BAO_CAO, JSON.stringify(bc)); } catch (e) {}
  if (!bc.d1 || !bc.r2 || bc.khongChuaDuoc) console.error('SUC_KHOE_HE', JSON.stringify(bc));
  return bc;
}

export async function sucKhoeHe(y, env, db, hoSo, BAC) {
  if ((BAC[hoSo && hoSo.role] || 99) > 2) return {ok: false, error: 'Chỉ Super Admin/Admin xem được sức khoẻ hệ.'};
  let bc = null;
  try { const o = await env.HOSO.get(KHOA_BAO_CAO); bc = o ? JSON.parse(await o.text()) : null; } catch (e) {}
  return {ok: true, baoCao: bc};
}
