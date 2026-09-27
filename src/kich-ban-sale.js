/* ═══════════════════════════════════════════════════════════════
   GITA 365 · 9.99.126 — KỊCH BẢN SALE · GIỌNG GITA (phần chạy)

   Kho GIỌNG + tình huống nằm ở kho-goc/data.giong-gita.js (chỉ dữ liệu).
   Tệp này là PHẦN CHẠY: khớp câu khách gõ vào đúng tình huống, đếm tiến
   độ thật, và vẽ màn. Tách vậy vì luật kho: hàm không sống trong kho.

   Khớp bằng `khoa` (cụm đã bỏ dấu) — dò cụm NHIỀU ÂM TIẾT trong câu đã bỏ
   dấu, không dò âm tiết trần (cùng bài học DN_TRU: âm tiết trần bắt oan).

   Chat KHÔNG đổ cả tình huống: khớp xong chỉ lấy MỘT câu trả lời + MỘT
   câu hỏi chẩn đoán. Một trọng tâm mỗi lượt (luật G5 của chuẩn giọng). */
'use strict';
var G = window.G || {}; window.G = G;

(function () {
  var U = G.U, h = U.h, ic = U.ic;

  function boDau(s) {
    return String(s || '').toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/đ/g, 'd').replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ').trim();
  }

  /* Khớp câu khách gõ vào tình huống hợp nhất. Điểm = số cụm khoá của tình
     huống XUẤT HIỆN trong câu (cụm nhiều âm tiết, khớp chuỗi con trên bản
     bỏ dấu). Trả về tình huống điểm cao nhất, hoặc null nếu không cụm nào
     khớp — không đoán bừa (luật G7).

     KHÔNG chỉ đủ "có khớp" — còn đo KHỚP CÓ RÕ KHÔNG. Một câu như "chưa
     sẵn sàng" trúng cụm khoá của HAI tình huống ở hai tầng khác nhau, điểm
     đầu bằng điểm nhì — lúc ấy chọn đại một tình huống là đưa ra một câu
     trả lời sâu cho một chuyện có thể không phải chuyện của khách. Nên trả
     về `doTin` (đỉnh vượt á quân bao nhiêu, chia cho đỉnh) và `ro` (đỉnh có
     tách hẳn á quân không). Màn chat đọc `ro`: rõ thì trả lời, chưa rõ thì
     HỎI LẠI một câu chứ không khẳng định. Đây là ý dùng được của lối định
     tuyến theo độ chắc (entropy) — nói/hỏi khi chưa chắc — áp vào đúng luật
     G7 sẵn có của kho: không đoán khi chưa đủ căn cứ.

     Trả về BẢN CHÉP NÔNG, không sửa bản ghi gốc trong G.KBS (nó dùng chung,
     gắn `ro`/`doTin` vào là mỗi lượt tìm đè lên lượt trước). */
  G.kbsTim = function (cauHoi) {
    var ds = G.KBS || [];
    if (!ds.length) return null;
    var c = ' ' + boDau(cauHoi) + ' ';
    var tot = null, d1 = 0, d2 = 0;   /* đỉnh, á quân */
    for (var i = 0; i < ds.length; i++) {
      var s = ds[i], d = 0;
      var ks = s.khoa || [];
      for (var j = 0; j < ks.length; j++) {
        var k = boDau(ks[j]);
        if (k && c.indexOf(' ' + k + ' ') >= 0) d += (k.indexOf(' ') >= 0 ? 2 : 1);
        else if (k && c.indexOf(k) >= 0) d += 1;   /* khớp chuỗi con, nhẹ hơn */
      }
      if (d > d1) { d2 = d1; d1 = d; tot = s; }
      else if (d > d2) { d2 = d; }
    }
    if (d1 <= 0) return null;                 /* không khớp gì — không đoán */
    var doTin = (d1 - d2) / d1;               /* 1 = tách hẳn · 0 = hoà đỉnh */
    var kq = {}; for (var p in tot) if (Object.prototype.hasOwnProperty.call(tot, p)) kq[p] = tot[p];
    kq.doTin = doTin;
    kq.ro = doTin >= 0.5;                      /* đỉnh phải vượt á quân rõ rệt */
    return kq;
  };

  /* Đếm THẬT — đọc thẳng số tình huống có trong kho, không gõ tay. */
  G.kbsDaSoan = function () { return (G.KBS || []).length; };
  G.kbsDich = function () {
    var t = G.KBS_TIENDO || {};
    return (t.tong) || ((t.tang || 5) * (t.cap || 10) * (t.moiO || 100));
  };

  /* ═══════════ MÀN ═══════════ */
  G.VIEWS = G.VIEWS || {};
  G.VIEWS['kich-ban-sale'] = function () {
    var GI = G.GIONG_GITA || {};
    var daSoan = G.kbsDaSoan(), dich = G.kbsDich();
    var pt = dich ? Math.round(daSoan / dich * 100) : 0;

    var o = U.ph({ eyebrow: 'KỊCH BẢN SALE · GIỌNG GITA365', ic: 'quote', grad: 1,
      t: 'Trả lời khách có chiều sâu, bằng giọng GITA — không bài sẵn',
      lead: 'Tham khảo kịch bản gốc rồi viết lại bằng lời GITA: ấm, thường ngày, hỏi để hiểu chứ ' +
        'không phán. Một chuẩn giọng giữ cho mọi tình huống nói cùng một kiểu, và một sổ tiến độ ' +
        'đếm thật — soạn tới đâu ghi tới đó, không con số cho đẹp.' });

    /* Sổ tiến độ — đếm thật, nói thẳng còn bao nhiêu. */
    o += U.sec('Sổ tiến độ · đếm thật', (G.KBS_TIENDO || {}).vi || '');
    o += '<div class="card mb"><div class="row" style="gap:18px;align-items:center;flex-wrap:wrap">' +
      (U.ring ? U.ring(pt, 'var(--gita)', 'ĐÃ SOẠN') : '') +
      '<div><b style="font-size:21px">' + daSoan.toLocaleString('vi-VN') + ' / ' +
        dich.toLocaleString('vi-VN') + '</b>' +
      '<p class="sm muted mt" style="line-height:1.6">tình huống — mẻ đầu <b>Tầng 1 · Cấp 1</b> ' +
        '(onboarding). Các nhóm còn lại soạn cùng khuôn ở những lượt sau, mỗi lượt một mẻ thật.</p>' +
      '</div></div></div>';

    /* Năm tư vấn — mỗi người một tầng */
    var tv = G.KBS_TUVAN || [], tvL = G.KBS_TUVAN_LUAT || {};
    if (tv.length) {
      o += U.sec('Năm tư vấn · mỗi người một tầng', (tvL.moiTang1TuVan || '') +
        (tvL.duyetTen === false ? ' — tên đang ĐỀ XUẤT, chờ chủ hệ duyệt.' : ''));
      o += '<div class="card mb">' + tv.map(function (x) {
        var t = (G.TIERS || []).filter(function (r) { return r.id === x.tang; })[0];
        var mau = t ? t.c : 'var(--gita)';
        return '<div style="padding:10px 0;border-bottom:1px solid var(--gita-vien-2)">' +
          '<b style="color:' + mau + '">' + h(x.ten) + ' · ' + h(x.vai) + '</b>' +
          ' <span class="tiny dim">(Tầng ' + x.tang + ' · ' + h(x.tenTang) + ' · 10 cấp)</span>' +
          '<p class="sm mt" style="line-height:1.7">' + h(x.gioiThieu) + '</p>' +
          '<p class="tiny dim mt" style="line-height:1.7"><b>Nâng cấp qua 10 cấp:</b> ' +
            h(x.nangCap) + '</p></div>';
      }).join('') + '</div>';
    }

    /* Ba lăng kính chuyên gia — tư duy đứng sau giọng */
    if ((GI.tuDuy || []).length) {
      o += U.sec('Ba lăng kính chuyên gia · tư duy đứng sau mỗi câu',
        'Kiến trúc giọng đồng bộ cho toàn ứng dụng — không học thuật, mà là tâm lý, chăm sóc, tư vấn.');
      o += '<div class="card mb">' + GI.tuDuy.map(function (t) {
        return '<div style="padding:8px 0;border-bottom:1px solid var(--gita-vien-2)">' +
          '<b>' + h(t.ma) + ' · ' + h(t.lang) + '</b>' +
          '<p class="sm mt" style="line-height:1.75">' + h(t.vi) + '</p></div>';
      }).join('') + '</div>';
    }

    /* Chuẩn giọng */
    o += U.sec('Chuẩn giọng GITA365', GI.cot || '');
    o += '<div class="card mb">' + (GI.luat || []).map(function (l) {
      return '<div style="padding:8px 0;border-bottom:1px solid var(--gita-vien-2)">' +
        '<b>' + h(l.ma) + ' · ' + h(l.ten) + '</b>' +
        '<p class="sm mt" style="line-height:1.7">' + h(l.vi) + '</p></div>';
    }).join('') + '</div>';

    /* Sáu nhịp */
    o += U.tbl(['Nhịp', 'Là gì'],
      (GI.nhip6 || []).map(function (n) { return [h(n.ma + ' · ' + n.ten), h(n.vi)]; }));

    /* Ranh giới AI */
    o += U.sec('Ranh giới của trợ lý AI', 'Bốn điều AI KHÔNG làm, dù làm được.');
    o += '<div class="card mb">' + U.list(GI.ranhAI || [], 'var(--gita-do)') + '</div>';

    /* Bỏ ngôn ngữ máy móc */
    o += U.sec('Bỏ ngôn ngữ máy móc, khô khan', 'Cột trái là câu kiểu máy trả bài; cột phải là câu GITA nói.');
    o += U.tbl(['Đừng nói (khô, máy móc)', 'Nói thế này (ấm, người thật)'],
      (GI.tranh || []).map(function (t) { return [h(t.may), h(t.nguoi)]; }));

    /* Kho tình huống đã soạn — MỞ DẦN THEO LÔ, không đổ cả khối.
       Kho có tới hàng nghìn tình huống; dựng hết một lượt thì màn này
       phình quá 5.000 nút DOM và đứng hình vài giây trên máy điện thoại
       phổ thông (đúng lớp lỗi tai-lieu-goc 9.27 · TG-05). Máy làm việc
       nhanh nên chỗ này không lộ — nó chỉ lộ khi đo trên máy yếu, nên
       ra-soat-day-du canh ngưỡng 5.000 nút. Mở dần theo lô 60, bấm ra
       tiếp, tới hết — cùng khuôn với đoạn/bảng của tai-lieu-goc. */
    var ds = G.KBS || [];
    var soHien = G.S.kbsHien || 60;
    var het = soHien >= ds.length;
    o += U.sec('Tình huống đã soạn · ' + daSoan.toLocaleString('vi-VN') + ' ô',
      'Khớp câu khách → hỏi/nói MỘT câu, không đổ cả khối. Năm tầng × mười cấp, mỗi ô nhiều tình huống.');
    o += '<div class="card">' + ds.slice(0, soHien).map(function (s) {
      return '<div style="padding:10px 0;border-bottom:1px solid var(--gita-vien-2)">' +
        '<b class="sm">' + h(s.ma) + ' · ' + h(s.tinhHuong) + '</b>' +
        '<p class="sm mt" style="line-height:1.7"><b>Hỏi để hiểu:</b> ' +
          h(Array.isArray(s.chanDoan) ? (s.chanDoan[0] || '') : (s.chanDoan || '')) + '</p>' +
        '<p class="sm mt" style="line-height:1.7"><b>GITA nói:</b> ' +
          h(Array.isArray(s.traLoi) ? (s.traLoi[0] || '') : (s.traLoi || '')) + '</p>' +
        '<p class="tiny dim mt" style="line-height:1.6"><b>Tránh:</b> ' + h(s.tranh || '') + '</p>' +
        '</div>';
    }).join('') + '</div>';
    o += '<div class="center mt2">' +
      (het
        ? '<p class="tiny muted">Đã hết ' + ds.length.toLocaleString('vi-VN') + ' tình huống.</p>'
        : '<button class="btn" data-kbshien="1">Xem tiếp 60 tình huống</button>' +
          '<p class="tiny muted mt">Đang xem ' + soHien.toLocaleString('vi-VN') + ' / ' +
          ds.length.toLocaleString('vi-VN') + ' tình huống</p>') +
      '</div>';
    return o;
  };

  /* Nút mở dần — tăng lô 60 rồi vẽ lại, cùng khuôn tai-lieu-goc. */
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-kbshien]');
    if (b) { G.S.kbsHien = (G.S.kbsHien || 60) + 60; G.render(); }
  });
})();
