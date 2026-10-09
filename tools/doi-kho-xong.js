/* ═══════════════════════════════════════════════════════════════
   GITA 365 · v9.79 — ĐỢI KHO NẠP XONG HẲN

   ĐÃ HỎNG THẬT, HAI LẦN, THEO HAI KIỂU KHÁC NHAU

   Kho về theo TÁM GÓI, mỗi gói một lượt hỏi mạng riêng. Nghĩa là có
   một quãng — dài ngắn tuỳ máy — mà G đã có hàm, đã có vài kho, mà
   chưa có đủ kho. Đo trúng quãng ấy thì con số đo được nói về TỐC ĐỘ
   MẠNG chứ không nói về phần đang đo.

   Lần một, bản 9.78: tools/thu-nhu-that.js đợi gói đầu rồi đo ngay,
   đo trúng máy mới nạp xong một gói — 211 kho thay vì 528 — và báo
   ra 129 màn "ném lỗi", 217 màn "gần trống". Suýt nữa tôi đưa cho chủ
   hệ 350 chỗ hỏng không có thật.

   Lần hai, bản 9.79: bốn bộ đo trợ lý đợi ĐÚNG MỘT kho có tên rồi đo.
   tools/do-tro-ly.js vì thế ra 28/40 khi chạy riêng và 27/40 khi chạy
   trong đường phát hành — mốc chặn đúng bằng 28, nên đường phát hành
   DỪNG ở một chỗ không hỏng. Lớp này nguy hơn lớp trên: nó không đỏ
   mỗi lần, nó đỏ THỈNH THOẢNG, và một cái cổng đỏ thỉnh thoảng thì
   sau vài lần người ta chạy lại cho qua — tới hôm nó đỏ vì lý do thật
   thì cũng chạy lại cho qua nốt.

   LUẬT: đợi số gói ĐỨNG YÊN, không đợi một cái tên.

   Không đợi cho đủ tám gói, vì mỗi vai được cấp một số gói khác nhau
   — Coach không nhận đủ tám, và một con số đếm cứng ở đây là một danh
   sách khai tay nữa, thứ kho này đã sửa sáu lần rồi. Đứng yên hai
   lượt liền thì nghĩa là đã hết gói để chờ, đúng cho mọi vai.
   ═══════════════════════════════════════════════════════════════ */
'use strict';

/* p — trang Playwright. Trả về số gói đã mở, để bộ gọi in ra nếu muốn.
   Có in ra thì ngày kho nạp hỏng còn nhìn thấy được; đợi im lặng thì
   lúc hỏng nó chỉ là một con số đo thấp không rõ vì sao. */
module.exports = async function doiKhoXong(p, giay) {
  await p.waitForFunction(() => window.G && window.G.KHO && window.G.KHO.daNap &&
    window.G.KHO.daNap.length, null, { timeout: (giay || 40) * 1000 });
  let truoc = -1, n = 0;
  for (let i = 0; i < 40; i++) {
    n = await p.evaluate(() => (window.G.KHO.daNap || []).length);
    if (n === truoc && n > 0) return n;
    truoc = n;
    await p.waitForTimeout(400);
  }
  return n;
};
