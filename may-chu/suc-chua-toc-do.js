/* ═══════════════════════════════════════════════════════════════
   GITA 365 — SỨC CHỨA & TỐC ĐỘ · MÁY CHỦ

   Chủ hệ muốn bộ não "nhanh, ưu việt, chứa nhiều" trên Cloudflare. Cửa
   này ĐO THẬT sức chứa hiện tại — KHÔNG khai một con số "1TB" tự nghĩ.

   ══ ĐO THẬT, KHÔNG TỰ KHAI (chống bẫy SUP-01 / ×100) ══

   doSucChua đếm THẲNG trong cơ sở dữ liệu: bao nhiêu bảng, bao nhiêu chỉ
   mục, bao nhiêu dòng ở các bảng nóng. Con số già nhất là vài trăm mili
   giây, không phải một ô ghi tay cũ đi lặng lẽ (cùng luật cột conHan
   9.99.63). "1TB" không phải một mức của bộ não — nó là dung lượng, và
   đạt được bằng R2 (chứa hàng TB thật) + chia mảnh D1, KHÔNG bằng một nút.

   ══ CHỈ ĐỌC — KHÔNG GHI ══

   Cửa này chỉ đếm rồi trả về; KHÔNG có câu ghi nào. Nó nói ra GIỚI HẠN
   THẬT của Cloudflare (D1 có trần mỗi cơ sở dữ liệu; Workers có trần thời
   gian mỗi lượt) và ĐƯỜNG LỚN LÊN (chia mảnh D1 · R2 cho tệp lớn) — một
   lớp không nói giới hạn thì người đọc tin nó chứa được nhiều hơn thật
   (9.99.57).
   ═══════════════════════════════════════════════════════════════ */

import { laNguoiNha } from './vai-tro.js';

/* Bảng nóng — đường tra chạy mỗi ngày. Tên CỐ ĐỊNH trong mã (không phải
   dữ liệu người dùng) nên nội suy vào câu đếm là an toàn. */
const BANG_NONG = ['users', 'students', 'hoSoKhach', 'lichSuTang', 'theVungManh',
  'hoSoSongSinh', 'soCham', 'audit', 'chiPhi', 'phieuThu', 'giaoDichNganHang',
  'baiNoiDung', 'luotPrompt'];

/* Năm trụ tốc độ — bản tóm mã ở máy chủ; nội dung đầy đủ ở kho G.SC_TRU
   phía màn. Giải thích GIỚI HẠN Cloudflare nằm ở kho G.SC_TRAN phía màn
   (không giữ hai bản). KHÔNG phải bản chép của một bảng cấm. */
const SC_TRU_MC = ['SC1', 'SC2', 'SC3', 'SC4', 'SC5'];

async function demBang(db, ten) {
  try {
    const r = await db.prepare('SELECT COUNT(*) c FROM ' + ten).bind().first();
    return (r && typeof r.c === 'number') ? r.c : null;
  } catch (e) { return null; }   // bảng chưa có ở bản triển khai này
}

/* ═══════════════ ĐO SỨC CHỨA THẬT ═══════════════ */
export async function doSucChua(y, env, db, hoSo) {
  if (!laNguoiNha(hoSo)) return { ok: false, code: 'NOPERM',
    error: 'Sức chứa & tốc độ mở cho R01–R12.' };

  let soBang = null, soChiMuc = null;
  try {
    const b = await db.prepare("SELECT COUNT(*) c FROM sqlite_master WHERE type='table'").bind().first();
    soBang = b ? b.c : null;
    const i = await db.prepare("SELECT COUNT(*) c FROM sqlite_master WHERE type='index'").bind().first();
    soChiMuc = i ? i.c : null;
  } catch (e) { /* để null — nói là không đo được, không đoán */ }

  const dongLon = [];
  let dongTong = 0, docDuoc = 0;
  for (const t of BANG_NONG) {
    const n = await demBang(db, t);
    if (n !== null) { dongLon.push({ bang: t, so: n }); dongTong += n; docDuoc++; }
  }
  dongLon.sort((a, b) => b.so - a.so);

  return { ok: true,
    tru: SC_TRU_MC, soTru: SC_TRU_MC.length,
    soBang, soChiMuc,
    dongTong, doDuocMayBang: docDuoc,
    dongLon,
    r2CoBinding: !!(env && env.HOSO),
    vi: 'Đếm THẲNG trong D1 lúc gọi — con số này đo được, không tự khai. "1TB" đạt bằng R2 + ' +
      'chia mảnh D1, không bằng một con số ghi trong kho. Ô để TRỐNG (null) nghĩa là KHÔNG đo ' +
      'được, khác hẳn số 0.' };
}
