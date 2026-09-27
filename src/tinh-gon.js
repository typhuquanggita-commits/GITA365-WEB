/* ═══════════════════════════════════════════════════════════════
   GITA 365 — QUY TRÌNH TINH GỌN VÀ BỘ GIẢI PHÁP NHIỀU TẦNG

   Kho chuẩn ở kho-goc/data.tinh-gon.js (TG_LANG · TG_GON · TG_GIAIDOAN ·
   TG_LOP · TG_GON_LUAT). Tệp này dựng hai màn và soi chính hai bảng ấy.

   MỘT ĐIỀU TỰ ĐẶT: màn này phải hiện CẢ PHẦN CHƯA CÓ. Một bảng bảo vệ mà
   ô nào cũng xanh là một bảng chưa nhìn kỹ, và người đọc nó sẽ yên tâm
   hơn thực tế — đó là kiểu sai nguy hiểm nhất, vì nó không kêu.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;
G.VIEWS = G.VIEWS || {};

(function () {
  var U = G.U, h = U.h, ic = U.ic;

  /* ─── Bảy loại lãng phí: loại nào đã có cơ chế chặn, loại nào chưa ───
     Nhận ra "chưa có" bằng chính lời khai trong kho: cột `co` mở đầu bằng
     "CHƯA CÓ" thì đó là chỗ trống được khai thật, không phải chỗ quên. */
  G.tgChuaChan = function () {
    return (G.TG_LANG || []).filter(function (x) {
      return !x.co || /^CHƯA CÓ/.test(x.co);
    }).map(function (x) { return x.ma; });
  };

  /* ─── Tầng bảo vệ nào còn chỗ hở đã khai ─── */
  G.tgLopHo = function () {
    return (G.TG_LOP || []).filter(function (l) { return l.chua && l.chua.length > 10; })
      .map(function (l) { return l.lop; });
  };

  /* ═══════════ MÀN: QUY TRÌNH TINH GỌN ═══════════ */
  G.VIEWS['tinh-gon'] = function () {
    if (!G.TG_LANG)
      return U.empty('Chưa mở được phần tinh gọn',
        'Đây là công cụ điều hành nội bộ, nằm trong gói nghề.');

    var chua = G.tgChuaChan();
    var o = U.ph({ eyebrow: 'QUY TRÌNH TINH GỌN', ic: 'lightning', grad: 1,
      t: 'Cắt lãng phí trước khi thêm người',
      lead: 'Thêm người vào một quy trình đang lãng phí là nhân lãng phí lên, và trả tiền cho phần nhân thêm ấy hằng tháng. ' +
        'Bảy loại dưới đây dịch từ cách người Nhật phân loại trong sản xuất sang việc của Học viện — ' +
        'chép nguyên bảy chữ gốc thì đẹp mà vô dụng.' });

    o += '<div class="grid g2 mb">' + (G.TG_LANG || []).map(function (x) {
      var trong = /^CHƯA CÓ/.test(x.co || '');
      var mau = trong ? '#BE0E16' : '#0B7350';
      return '<div class="card" style="border-color:' + mau + '26">' +
        '<div class="row wrap" style="gap:8px;align-items:baseline;margin-bottom:6px">' +
        '<b class="sm">' + h(x.ten) + '</b><span class="tiny muted">' + h(x.tu) + '</span>' +
        '<span class="tiny up" style="margin-left:auto;color:' + mau + '">' +
        (trong ? 'CHƯA CHẶN' : 'ĐÃ CÓ CƠ CHẾ') + '</span></div>' +
        '<p class="sm dim" style="line-height:1.8">' + h(x.la) + '</p>' +
        '<p class="tiny mt" style="line-height:1.7"><b>Cái giá:</b> ' + h(x.gia) + '</p>' +
        '<p class="tiny" style="line-height:1.7"><b>Đo bằng:</b> ' + h(x.do) + '</p>' +
        '<p class="tiny mt" style="line-height:1.7;color:' + mau + '"><b>' +
        (trong ? 'Chỗ trống: ' : 'Cơ chế đang chạy: ') + '</b>' + h(x.co) + '</p></div>';
    }).join('') + '</div>';

    o += '<div class="card mb" style="border-color:' + (chua.length ? '#BE0E16' : '#0B7350') + '2e">' +
      '<b class="sm">' + (chua.length ? chua.length + ' trên 7 loại lãng phí chưa có cơ chế chặn'
        : 'Cả bảy loại đều đã có cơ chế chặn') + '</b>' +
      '<p class="sm dim mt" style="line-height:1.8">' +
      (chua.length ? 'Ghi ra đây để không ai tưởng nó đã có. Chỗ trống được khai thật thì còn sửa được; ' +
        'chỗ trống bị giấu thì tới lúc hỏng mới biết.'
        : 'Ngày nào chỗ này không còn chữ nào thì phải đi tìm lại, không phải ăn mừng — ' +
          'một bảng mà ô nào cũng xanh là một bảng chưa nhìn kỹ.') + '</p></div>';

    o += U.sec('Mười nguyên tắc', 'Mỗi điều phải cắt được một chi phí gọi tên được. Không cắt được gì thì là khẩu hiệu.');
    o += '<div class="card mb">' + (G.TG_GON || []).map(function (n) {
      return '<div style="padding:9px 0;border-bottom:1px solid var(--gita-vien-2)">' +
        '<b class="sm">' + n.no + '. ' + h(n.t) + '</b>' +
        '<p class="tiny dim mt" style="line-height:1.7">' + h(n.y) + '</p>' +
        '<p class="tiny mt" style="line-height:1.7;color:#0B7350"><b>Cắt bằng:</b> ' + h(n.bang) + '</p></div>';
    }).join('') + '</div>';

    o += U.sec('Bốn luật của lớp này', '');
    o += '<div class="card">' + (G.TG_GON_LUAT || []).map(function (l) {
      return '<div style="padding:8px 0;border-bottom:1px solid var(--gita-vien-2)">' +
        '<b class="sm">' + l.no + '. ' + h(l.t) + '</b>' +
        '<p class="tiny dim mt" style="line-height:1.7">' + h(l.y) + '</p></div>';
    }).join('') + '</div>';
    return o;
  };

  /* ═══════════ MÀN: NĂM GIAI ĐOẠN VÀ BỐN TẦNG BẢO VỆ ═══════════ */
  G.VIEWS['giai-doan-bao-ve'] = function () {
    if (!G.TG_GIAIDOAN)
      return U.empty('Chưa mở được phần giai đoạn',
        'Đây là công cụ điều hành nội bộ, nằm trong gói nghề.');

    var o = U.ph({ eyebrow: 'GIAI ĐOẠN VÀ LỚP BẢO VỆ', ic: 'shield', grad: 1,
      t: 'Cùng một việc, khác thời điểm, khác kết quả',
      lead: 'Sai lầm hay gặp nhất không phải làm sai việc, mà là mang cách làm của giai đoạn này sang giai đoạn khác. ' +
        'Siết quy trình lúc còn đang dựng thì chết vì chậm; làm tuỳ hứng lúc đã mở rộng thì chết vì loạn.' });

    o += U.sec('Năm giai đoạn', 'Mỗi giai đoạn có một mối nguy chính, một việc phải làm chính, và một việc phải nhịn.');
    o += (G.TG_GIAIDOAN || []).map(function (g) {
      return '<div class="card mb" style="border-color:' + g.c + '2e">' +
        '<div class="row wrap" style="gap:10px;align-items:baseline;margin-bottom:7px">' +
        '<span class="tiny up" style="color:' + g.c + '">GIAI ĐOẠN ' + g.so + '</span>' +
        '<b>' + h(g.ten) + '</b><span class="tiny muted">' + h(g.dau) + '</span></div>' +
        '<p class="sm" style="line-height:1.8"><b style="color:#BE0E16">Mối nguy:</b> ' + h(g.nguy) + '</p>' +
        '<p class="sm mt" style="line-height:1.8"><b style="color:#0B7350">Việc chính:</b> ' + h(g.lam) + '</p>' +
        '<p class="sm mt" style="line-height:1.8"><b style="color:#B4720F">Phải nhịn:</b> ' + h(g.dung) + '</p>' +
        '<p class="tiny mt" style="line-height:1.7"><b>Xong giai đoạn khi:</b> ' + h(g.ra) + '</p></div>';
    }).join('');

    o += U.sec('Bốn tầng bảo vệ',
      'Bảo vệ không phải một bức tường mà là nhiều lớp, vì lớp nào cũng có ngày thủng. ' +
      'Mỗi tầng đều khai cả phần CHƯA CÓ — một bảng chỉ ghi phần đã làm là một bảng nói dối.');
    o += (G.TG_LOP || []).map(function (l) {
      return '<div class="card mb" style="border-color:' + l.c + '2e">' +
        '<div class="row wrap" style="gap:10px;align-items:baseline;margin-bottom:6px">' +
        '<span class="tiny up" style="color:' + l.c + '">LỚP ' + l.lop + '</span>' +
        '<b>' + h(l.ten) + '</b></div>' +
        '<p class="sm dim" style="line-height:1.8"><b>Giữ cái gì:</b> ' + h(l.giu) + '</p>' +
        '<div class="mt">' + U.list(l.co, l.c) + '</div>' +
        '<p class="tiny mt" style="line-height:1.7;color:#BE0E16"><b>Chưa có:</b> ' + h(l.chua) + '</p></div>';
    }).join('');
    return o;
  };
})();
