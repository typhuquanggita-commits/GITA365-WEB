/* ═══════════════════════════════════════════════════════════════
   GITA 365 — NẠP TÌNH HUỐNG CHO GIA ĐÌNH, THEO PHIÊN

   Chuỗi năm vòng dựng ở bản 9.49 chạy trên G.TINHHUONG. Kho ấy là TÀI
   SẢN NGHỀ nên không xuống máy gia đình — chuỗi chạy cho Tư vấn, im
   lặng cho gia đình. Đúng nhóm cần nó nhất thì không có.

   Bản 9.51 sửa lời hứa 30% cho đúng mẫu số. Đúng, nhưng CHƯA TRIỆT ĐỂ.

   Tệp này đóng hẳn: máy chủ trả về phần 30% của tầng nhà mình, theo
   PHIÊN, và máy này giữ nó trong BỘ NHỚ.

   KHÔNG GHI XUỐNG ĐĨA — VÀ ĐÓ LÀ CẢ ĐIỂM CỦA CÁCH LÀM NÀY

   Một gói đã cấp thì không gọi ngược về được. Ghi xuống localStorage
   cũng thế: gỡ quyền hôm nay không xoá được bản nằm trong máy người ta
   từ hôm qua.

   Giữ trong bộ nhớ thì đóng ứng dụng là hết, và ngừng phục vụ là phiên
   sau không còn. Cái giá: mất mạng thì chuỗi không chạy. Đáng — một
   lượt hỏi thu hồi được, một bản sao thì không.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;

(function () {

  /* Đã nạp chưa, và nạp được bao nhiêu. Chỉ để màn nói đúng trạng thái —
     KHÔNG dùng làm cờ chặn, vì cờ ở máy khách thì ai cũng bật được. */
  G.TH_KHACH = null;

  G.thKhachNap = function () {
    if (typeof G.tinGoiMayChu !== 'function')
      return Promise.resolve({ ok: false, ly: 'Chưa có đường gọi máy chủ.' });
    return G.tinGoiMayChu('napTinhHuongKhach').then(function (d) {
      if (!d || !d.ok) { G.TH_KHACH = null; return d || { ok: false }; }
      /* Gắn thẳng vào G.TINHHUONG để chuỗi năm vòng chạy KHÔNG SỬA GÌ.
         Dựng một tên kho thứ hai cho gia đình thì kbBoKey, kbLocKey và
         kbChuoi đều phải học thêm một nhánh — ba chỗ phải nhớ, và trí
         nhớ là thứ hỏng đầu tiên. */
      G.TINHHUONG = d.tinhHuong || [];
      G.TH_KHACH = { tang: d.tang, so: d.so, luc: new Date() };
      if (G.secLog) G.secLog('Nạp tình huống của nhà mình',
        'tầng ' + d.tang + ' · ' + d.so + ' tình huống', 'Ghi nhận');
      return d;
    });
  };

  /* Máy này đang có tình huống vì đã NẠP, hay vì là máy nghề?
     Hai đường khác nhau và màn phải nói khác nhau: máy nghề có đủ 250 và
     không phụ thuộc mạng; máy gia đình có 30% của tầng mình và mất mạng
     là mất. Gộp hai câu lại thì một trong hai luôn sai. */
  G.thKhachDangCo = function () {
    if (!(G.TINHHUONG || []).length) return { co: false, chuaNap: true };
    if (G.TH_KHACH) return { co: true, quaMayChu: true,
      tang: G.TH_KHACH.tang, so: G.TH_KHACH.so };
    return { co: true, tuGoiNghe: true, so: (G.TINHHUONG || []).length };
  };

  /* KHÔNG lưu xuống đĩa. Hàm này tồn tại để nói rõ điều đó, và để bộ
     kiểm hỏi được — một luật không ai hỏi được thì sáu tháng sau có
     người thêm một dòng localStorage.setItem và không ai biết. */
  G.thKhachKhongLuu = true;

})();
