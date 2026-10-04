/* ═══════════════════════════════════════════════════════════════
   GITA 365 — TRANG TRẠNG THÁI CÔNG KHAI

   Bảy điểm thiếu trong bản đồ 12 khối đều cần nguồn lực thật (người,
   máy, thời gian). Một việc KHÔNG cần: khách thấy hệ đang sống trước
   khi tin — đây là bản chất "ninety percent uptime page" của mọi hệ
   lớn, và nó làm được ngay hôm nay.

   CỬA CÔNG KHAI — KHÔNG PHIÊN. Luật an toàn của chính nó:
     · Chỉ TỔNG HỢP SỐ (đếm, giờ gần nhất, đúng/sai).
     · KHÔNG tên, KHÔNG định danh, KHÔNG nội dung ai — một hàng dữ
       liệu cá nhân lọt vào đây là sự cố.
     · Có chặn nhịp riêng (60 lượt/phút/IP qua ve-chi-phi ở tầng
       trước), không chạm bảng người dùng.
   ═══════════════════════════════════════════════════════════════ */
'use strict';

export async function trangThaiCongKhai(y, env, db) {
  const hn = new Date().toISOString().slice(0, 10);
  const dem = async (sql, ...a) => {
    try { const r = await db.prepare(sql).bind(...a).first(); return (r && r.n) || 0; }
    catch (e) { return -1; }
  };
  /* Cron 03:00 giờ VN chạy chuỗi dọn + tự soát chữa; nhịp gần nhất
     nằm ở nhipDaTri ('vongKhoaHoc') — chỉ công bố GIỜ, không chi tiết. */
  let lucTuSoat = null;
  try {
    const r = await db.prepare("SELECT luc FROM nhipDaTri WHERE viec = 'vongKhoaHoc'").first();
    lucTuSoat = r && r.luc ? new Date(r.luc).toISOString() : null;
  } catch (e) {}
  const locHomNay = await dem('SELECT COALESCE(SUM(luot),0) n FROM soLocDaTri WHERE ngay = ?', hn);
  const luotGhiHomNay = await dem('SELECT COUNT(*) n FROM audit WHERE substr(luc,1,10) = ?', hn);

  return { ok: true,
    ten: 'GITA 365 — trạng thái hệ thống',
    luc: new Date().toISOString(),
    he: {
      song: true,
      tuSoatGanNhat: lucTuSoat,
      soLuotLocTruocTokenHomNay: locHomNay >= 0 ? locHomNay : null,
      soLuotGhiSoHomNay: luotGhiHomNay >= 0 ? luotGhiHomNay : null
    },
    ghiChu: 'Chỉ tổng hợp số — không tên, không định danh, không nội dung của bất kỳ ai. ' +
      'Chi tiết sức khoẻ đầy đủ nằm trong hệ, sau đăng nhập (sucKhoeHe).' };
}
