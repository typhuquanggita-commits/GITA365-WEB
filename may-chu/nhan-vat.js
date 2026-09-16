/* ═══════════════════════════════════════════════════════════════
   GITA 365 — NHÂN VẬT KHÁCH · ĐỒNG BỘ THEO TÀI KHOẢN  (9.99.109 · CD-04)

   Chủ hệ: nhân vật đi cùng khách qua mọi máy, không chỉ lưu một máy.
   9.99.106 lưu localStorage (một máy); CD-04 thêm đồng bộ theo tài khoản.

   ══ CHỈ LƯU MẤY CHỈ MỤC — KHÔNG ẢNH, KHÔNG TÊN (Điều 13) ══

   Bảng `nhanVatKH` chỉ giữ NĂM SỐ: da · tocMau · toc · ao · kinh — mỗi
   cái là một chỉ mục vào phần dựng sẵn (G.NV). KHÔNG có cột ảnh, KHÔNG
   có cột tên. Một dump CSDL bị lộ không mang theo một khuôn mặt hay một
   cái tên nào — nhân vật dựng lại được từ năm con số, nhưng năm con số
   ấy không nhận ra ai. Cùng luật Điều 13 với `nvVe` vẽ tại chỗ ở máy
   khách: ảnh KHÔNG rời máy, và ở đây thứ rời máy chỉ là mấy chỉ mục.

   ══ VÌ SAO GHI ĐÈ Ở ĐÂY, KHÁC luật "dòng mới không ghi đè" ══

   Đồng ý dữ liệu · giá · yêu cầu xoá giữ LỊCH SỬ (dòng mới, không đè)
   vì câu hỏi *"hôm ấy đã đồng ý chưa"* cần trả lời được. Nhân vật là
   một LỰA CHỌN HIỂN THỊ hiện tại — như một ô cài đặt — không ai hỏi
   *"tháng trước tóc bạn màu gì"*. Nên ON CONFLICT ghi đè là đúng: giữ
   lịch sử một sở thích cosmetic là giữ rác.

   ══ KHOÁ THEO uid CỦA PHIÊN — nhân vật của AI thì của người ấy ══

   Ghi/đọc theo `hoSo.uid`, không nhận một ô `uid` do người gọi truyền
   vào: một ô như thế là lời khai, và nó cho người này ghi đè nhân vật
   người kia. Mọi vai có phiên hợp lệ đều có một nhân vật (cosmetic,
   không khoá theo vai). Bộ thử chứng minh hai tài khoản không thấy
   nhân vật của nhau.
   ═══════════════════════════════════════════════════════════════ */

const O = ['da', 'tocMau', 'toc', 'ao', 'kinh'];

/* Kẹp một chỉ mục về số nguyên nhỏ không âm — người gọi gửi rác thì
   không ghi rác vào sổ, và không có chỗ cho một chuỗi dài chui vào. */
function chiSo(v) {
  var n = parseInt(v, 10);
  if (!isFinite(n) || n < 0) return 0;
  if (n > 50) return 50;
  return n;
}

export async function luuNhanVat(y, env, db, hoSo) {
  const uid = String((hoSo || {}).uid || '');
  if (!uid) return { ok: false, code: 'AUTH', error: 'Phiên không hợp lệ.' };
  const x = y || {};
  const doc = {};
  for (const k of O) doc[k] = chiSo(x[k]);
  const luc = new Date().toISOString();
  await db.prepare(
    'INSERT INTO nhanVatKH (uid,da,tocMau,toc,ao,kinh,ghiLuc) VALUES (?,?,?,?,?,?,?) ' +
    'ON CONFLICT(uid) DO UPDATE SET da=excluded.da, tocMau=excluded.tocMau, ' +
    'toc=excluded.toc, ao=excluded.ao, kinh=excluded.kinh, ghiLuc=excluded.ghiLuc')
    .bind(uid, doc.da, doc.tocMau, doc.toc, doc.ao, doc.kinh, luc).run();
  return { ok: true, doc, ghiLuc: luc,
    vi: 'Nhân vật đồng bộ theo tài khoản — chỉ lưu mấy chỉ mục, không ảnh, không tên (Điều 13).' };
}

export async function docNhanVat(y, env, db, hoSo) {
  const uid = String((hoSo || {}).uid || '');
  if (!uid) return { ok: false, code: 'AUTH', error: 'Phiên không hợp lệ.' };
  const r = await db.prepare(
    'SELECT da,tocMau,toc,ao,kinh,ghiLuc FROM nhanVatKH WHERE uid = ?').bind(uid).first();
  if (!r) return { ok: true, chuaCo: true };
  return { ok: true, chuaCo: false,
    doc: { da: r.da, tocMau: r.tocMau, toc: r.toc, ao: r.ao, kinh: r.kinh },
    ghiLuc: r.ghiLuc };
}
