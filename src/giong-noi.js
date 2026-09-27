/* ═══════════════════════════════════════════════════════════════
   GITA 365 — MÁY CHẠY GIỌNG NÓI, SÁU CHIẾC MŨ, VÀ CÂU PHÁT SINH

   Kho chuẩn ở kho-goc/data.giong-noi.js.

   MƯỢT MÀ NẰM Ở CÁCH BẮT NHỊP, KHÔNG NẰM Ở VIỆC GIẢ LÀM NGƯỜI

   Tệp này làm lời trợ lý biến hoá: mỗi vòng nhiều cách mở, chọn xoay
   vòng, không lặp trong một phiên. Nhưng khi có người hỏi thẳng "em là
   người hay máy" thì nó trả lời thẳng — một câu, rồi quay lại việc đang
   dở. Không chối, không lảng.

   SÁU MŨ KHÔNG NÓI RA TÊN

   Mũ là cách CHỌN CÂU, không phải thứ để khoe. Trợ lý không bao giờ nói
   "bây giờ em đội mũ đỏ" — gọi tên khung ra là biến một cuộc trò chuyện
   thành buổi trình bày phương pháp, và nhà mình thành học viên bất đắc dĩ.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;

(function () {

  function boDau(s) {
    return String(s || '').toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd')
      .replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
  }

  /* Câu mở đã dùng trong phiên này. Không lặp một câu mở hai lượt liền —
     đó chính là chỗ người ta nhận ra đang nói chuyện với một cái khuôn. */
  var daMo = [];
  G.gnQuenMo = function () { daMo = []; };

  G.gnMoDau = function (maVong) {
    var ds = ((G.KB_GIONG || {}).moDau || {})[maVong] || [];
    if (!ds.length) return null;
    var con = ds.filter(function (c) { return daMo.indexOf(c) < 0; });
    /* Hết câu chưa dùng thì xoá sổ và bắt đầu lại — thà lặp sau một vòng
       đầy còn hơn im, nhưng không bao giờ lặp ngay lượt kế. */
    if (!con.length) { daMo = []; con = ds; }
    var c = con[Math.floor(Math.random() * con.length)];
    daMo.push(c);
    return c;
  };

  /* Mũ của một vòng. Vòng bốn có HAI mũ đi liền — xanh lá đưa việc, vàng
     nói cái được; một việc không có cái được đi kèm thì nó là lời dặn. */
  G.gnMu = function (maVong) {
    return (G.KB_MU || []).filter(function (m) { return m.vong === maVong; });
  };

  /* Mũ đen KHÔNG được đội ở hai vòng đầu. Người vừa kể chuyện nhà mình mà
     nghe ngay một câu cảnh báo thì họ đóng máy — đúng lúc mình vừa có đủ
     dữ kiện để giúp được. Cổng này chặn thật, không phải lời nhắc. */
  G.gnDoiMuDuoc = function (maMu, maVong) {
    if (maMu !== 'DEN') return true;
    if ((G.KB_MU_LUAT || {}).camDoiSomMuDen !== true) return true;
    return ['BOICANH', 'COTLOI'].indexOf(maVong) < 0;
  };

  /* Bắt nhịp: nhắc lại đúng CHỮ của nhà mình, không dịch sang thuật ngữ.
     Trả về mấy chữ đáng kể trong lời họ vừa kể để câu sau dùng lại. */
  G.gnBatNhip = function (loiNha) {
    /* Lọc theo DANH SÁCH CHỮ CHUNG, không lọc theo độ dài. Bản đầu lấy
       mọi chữ từ bốn ký tự nên nhà kể "cháu nó LÌ lắm, tối nào cũng phải
       nhắc" thì trợ lý nhắc lại "cũng · phải" — đúng luật mà sai hoàn
       toàn ý. Chữ đáng nhắc lại là chữ chỉ nhà ấy mới dùng, và những chữ
       ấy thường NGẮN: lì, ì, cãi, khóc. */
    var chung = (G.KB_GIONG || {}).chuChung || [];
    var goc = String(loiNha || '').split(/\s+/);
    var ra = [];
    goc.forEach(function (w) {
      var k = boDau(w);
      if (!k || k.length < 2) return;
      if (chung.indexOf(k) >= 0) return;
      if (ra.length < 3 && ra.indexOf(w) < 0) ra.push(w.replace(/[,.;:!?]+$/, ''));
    });
    return ra;
  };

  /* Câu bị cấm — soi lời trợ lý TRƯỚC khi hiện. Một câu cấm lọt ra là
     một câu người đọc nhận ra ngay là lắp sẵn. */
  G.gnSoiCam = function (loi) {
    var c = boDau(loi);
    return ((G.KB_GIONG || {}).camNoi || []).filter(function (x) {
      return c.indexOf(boDau(x.cau)) >= 0;
    });
  };

  /* Hỏi thẳng thì trả lời thẳng. Đây là đường không được phép vòng vo. */
  G.gnHoiLaMay = function (cau) {
    var c = boDau(cau);
    return ((G.KB_GIONG || {}).dauHoiLaMay || []).some(function (d) {
      return c.indexOf(boDau(d)) >= 0;
    });
  };
  G.gnNoiThat = function () { return (G.KB_GIONG || {}).cauNoiThat || null; };

  /* ═══════════ CÂU PHÁT SINH ═══════════
     Bật ra GIỮA chuỗi, không theo thứ tự vòng. Bắt được thì trả lời rồi
     QUAY LẠI đúng vòng đang dở — bỏ chuỗi để chạy theo câu hỏi phụ là
     mất chỗ vừa khoanh được. */
  G.gnPhatSinh = function (cau) {
    var c = boDau(cau), tot = null, cao = 0;
    (G.KB_PHATSINH || []).forEach(function (p) {
      var d = 0;
      (p.dau || []).forEach(function (k) {
        var kk = boDau(k);
        if (kk && c.indexOf(kk) >= 0) d += kk.length;   /* dài hơn thì cụ thể hơn */
      });
      if (d > cao) { cao = d; tot = p; }
    });
    if (!tot) return null;
    return { ma: tot.ma, loai: tot.loai, mu: tot.mu, dua: tot.dua, ranh: tot.ranh,
      chuyenNguoiThat: tot.chuyenNguoiThat === true,
      noiThat: tot.noiThat === true,
      quayLaiVongDangDo: (G.KB_PHATSINH_LUAT || {}).batGiuaChung === true };
  };

})();
