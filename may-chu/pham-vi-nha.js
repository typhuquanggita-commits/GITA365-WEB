/* ═══════════════════════════════════════════════════════════════
   GITA 365 — PHẠM VI NHÀ: MỘT LUẬT, DÙNG CHUNG (V50·168)

   "Nhân sự chỉ đọc / ghi dữ liệu của nhà mình phụ trách" từng được viết lại
   ở từng cửa — và mỗi lần viết lại là một cửa quên viết (soát 07/10/2026
   tìm ra: xemTepKhach, docSongSinh, doSoCham, lapSongSinh, xuatDuLieuNha,
   lichSuNhacThu… mở cho mọi nhân sự đọc MỌI nhà). Nay một hàm:

     nhaPhuTrach(db, hoSo, maNha, tran)
       · bậc ≤ tran (mặc định 5: R01–R05 — Trưởng nhóm Coach giám sát đội)
         → mọi nhà
       · R06–R12 → chỉ nhà mình là Coach hoặc Tư vấn phụ trách
       · khách (R13–R15) → false (cửa khách tự đối chiếu nhà của phiên)
   ═══════════════════════════════════════════════════════════════ */
import { BAC } from './vai-tro.js';

export const TRAN_QUAN_LY = 5;

export async function nhaPhuTrach(db, hoSo, maNha, tran) {
  const lv = BAC[(hoSo || {}).role] || 99;
  if (lv <= (tran == null ? TRAN_QUAN_LY : tran)) return true;
  if (lv > 12 || !maNha) return false;
  try {
    const r = await db.prepare('SELECT 1 AS c FROM hoSoKhach WHERE maKhachHang = ? AND (coach = ? OR tuVan = ?) LIMIT 1')
      .bind(String(maNha), hoSo.u, hoSo.u).first();
    return !!r;
  } catch (e) { return false; }
}

export const LOI_NGOAI_NHA = { ok: false, code: 'NGOAINHA', error: 'Chỉ Coach hoặc Tư vấn phụ trách nhà này (hoặc quản lý từ Trưởng nhóm Coach trở lên) mới mở được dữ liệu của nhà.' };
