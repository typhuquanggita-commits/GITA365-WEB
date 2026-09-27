/* ═══════════════════════════════════════════════════════════════
   GITA 365 — CÂY GIÁ TRỊ  (khách hàng)  · sửa ở 9.99.162

   Chủ hệ chốt ranh giới AI HIỆN CHO AI:
     · CÂY TIỀN (điểm cây tiền · chăm sóc VIP · dòng tiền) = NỘI BỘ QUẢN
       TRỊ. Khách KHÔNG có quyền xem — khoá ở gói nghề + pro_consult.
     · Màn này (khách xem được) chỉ nói tới CÂY GIÁ TRỊ mà hệ thống
       GITA365 tạo ra cho một GIA ĐÌNH khi đi hết năm tầng — KHÔNG phải
       cây tiền, KHÔNG một chữ nào về dòng tiền/nguồn thu/hoa hồng.

   Vì sao tách gắt: "dòng tiền" là cách HỌC VIỆN nhìn một gia đình; "giá
   trị" là cái GIA ĐÌNH nhận được. Trình cách nhìn của Học viện cho chính
   gia đình đọc là để họ thấy mình bị tính như một nguồn thu — hỏng đúng
   thứ Học viện bán. Cùng ranh giới ngăn KHACH của trần giám sát (9.99.76):
   Học viện đo thứ mình GIAO, không đo người NHẬN.

   ══ MÀN NÀY TRỎ, KHÔNG CHÉP ══
   Năm tầng ĐÃ CÓ ở G.HP_NGAY (tên · gồm · ngày) — bản rút CÔNG KHAI, gói
   NỀN, mọi nhà có. Nhãn cây (Hạt/Rễ/Thân/Tán/Rừng) là KHUNG ánh vào đúng
   năm tầng ấy, không mang giá. Giá đi qua nút "Xem bảng giá" (một nguồn).
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;
G.VIEWS = G.VIEWS || {};

/* Nhãn CÂY cho năm tầng — nói cái GIA ĐÌNH TRỞ THÀNH, không nói tiền. */
G.CVIP_CAY = [
  { tang: 'T1', giai: 'HẠT',  bien: 'từ tò mò → nứt vỏ',              ic: 'seed' },
  { tang: 'T2', giai: 'RỄ',   bien: 'từ nghi ngờ → điểm tựa',          ic: 'seed' },
  { tang: 'T3', giai: 'THÂN', bien: 'từ làm theo → tự làm chủ',        ic: 'target' },
  { tang: 'T4', giai: 'TÁN',  bien: 'từ người theo → người đồng hành', ic: 'star' },
  { tang: 'T5', giai: 'RỪNG', bien: 'từ Cây Mẹ → gieo được cả rừng',   ic: 'crown' }
];

(function () {
  var U = G.U, h = U.h, ic = U.ic;

  G.VIEWS['cay-vip'] = function () {
    var o = '<div class="hd"><h2>' + ic('seed') + ' Cây giá trị của gia đình</h2>' +
      '<p class="sub">Đây là cái mà một gia đình LỚN LÊN qua năm tầng đồng hành cùng GITA365 — một hạt nứt vỏ, bén rễ, thành thân, xoè tán, rồi gieo được cả rừng.</p></div>';

    /* Đọc HP_NGAY (gói NỀN, MỌI nhà có) — tên + phần gồm của năm tầng.
       KHÔNG một con số tiền nào ở đây. */
    var hp = G.HP_NGAY || G.HP_TANG || [];
    var byTang = {}; hp.forEach(function (t) { byTang[t.tang] = t; });
    var homTang = (G.hoSo && G.hoSo.tang) || null;

    if (hp.length) {
      /* Cây mọc: Rừng trên đỉnh → Hạt dưới gốc */
      o += '<div class="cvip-cay">';
      G.CVIP_CAY.slice().reverse().forEach(function (s) {
        var t = byTang[s.tang] || {};
        var gom = (t.gom && t.gom.length) ? (' · gồm ' + t.gom.length + ' phần') : '';
        if (!gom && t.ngay) gom = ' · ' + t.ngay + ' ngày';
        var here = homTang === s.tang;
        o += '<div class="cvip-tang' + (here ? ' o-day' : '') + '">' +
          '<span class="cvip-giai">' + ic(s.ic) + '<b>' + h(s.giai) + '</b></span>' +
          '<div class="cvip-noi">' +
          '<div class="cvip-dau"><b>' + h(t.ten || s.tang) + '</b>' +
          (here ? '<span class="cvip-day">Nhà mình ở đây</span>' : '') +
          '</div>' +
          '<small>' + h(s.bien) + gom + '</small>' +
          '</div></div>';
      });
      o += '</div>';
      /* Nút giá CHỈ hiện cho vai mở được bảng giá (fin_view) — khách KHÔNG
         thấy: đây là màn GIÁ TRỊ, không phải màn tiền, và một nút dẫn khách
         vào cổng khoá là "mục chết" (9.99.101). Nhân sự tài chính xem màn
         này thì có lối mở nhanh; khách thì không có nút nào dead-end. */
      if (G.allowed && G.allowed('bang-gia')) {
        o += '<button class="btn ghost sm blk" data-v="bang-gia">' + ic('chart') +
          ' Xem bảng giá đầy đủ từng tầng</button>';
      }
    } else {
      o += U.empty('Cây giá trị nằm trong gói nền',
        'Phần này đọc năm tầng của Học viện (G.HP_NGAY). Đăng nhập lại để nạp, rồi mở lại.');
    }

    /* Đóng bằng GIÁ TRỊ, không bằng tiền: đi hết năm tầng thì gia đình
       không chỉ học xong — họ thành người gieo được rừng cho nhà khác.
       Đó là đỉnh của cây giá trị, và nó là chuyện của gia đình, không
       phải một đòn dòng tiền của Học viện. */
    o += '<div class="cvip-ket">' + ic('star') +
      '<p>Đi hết năm tầng, một gia đình không chỉ học xong một khoá. Họ trở thành <b>Cây Mẹ</b> — vững đến mức gieo được hạt cho những gia đình khác. Giá trị lớn nhất GITA365 tạo ra không nằm ở một tầng nào, mà ở chỗ một nhà đi trọn cả năm.</p></div>';

    return o;
  };
})();
