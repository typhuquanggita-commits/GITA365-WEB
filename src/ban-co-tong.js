/* ═══════════════════════════════════════════════════════════════
   GITA 365 — BÀN CỜ TỔNG (màn điều hướng toàn hệ)

   Một hình bàn cờ: sáu khoang đúng theo sáu nhóm của thanh trái, mỗi ô
   là một màn thật. Bấm vào ô là đi thẳng tới màn đó (data-v → G.go).

   AN TOÀN LÀ GỐC — KHÔNG LỘ BÍ MẬT KINH DOANH

   Màn này KHÔNG tự quyết ai thấy gì. Nó hỏi đúng một cửa: G.allowed(v)
   — chính cửa mà thanh trái và G.go dùng. Vai nào không được một màn thì
   ô ấy KHÔNG được vẽ ra (không hiện tên, không hiện số) — nên nhân sự và
   khách không đọc được cả kiến trúc của những màn ngoài quyền.

     · Super Admin · Admin (bậc ≤ 2) : thấy đủ toàn hệ — để hiểu và vận hành.
     · Đội ngũ nghề (bậc 3–12)        : chỉ các màn trong phạm vi của mình.
     · Gia đình · CTV (bậc ≥ 13)      : hành trình của nhà mình, chia 5 chặng.

   Số đếm tổng (chỉ Super Admin/Admin thấy mẫu số toàn hệ) — các vai khác
   chỉ thấy số màn CỦA MÌNH, không thấy còn bao nhiêu màn bị giấu.

   KHÔNG đụng giấy phép · mã hoá · CRM · máy chủ. Màn này chỉ ĐỌC G.NAV
   và hỏi G.allowed; không nắm dữ liệu, không mở khoá gì.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;
G.VIEWS = G.VIEWS || {};

(function () {
  var U = G.U, h = U.h, ic = U.ic;

  /* Năm chặng của hành trình gia đình — mốc ngày lấy từ tinh thần
     "7 · 21 · 90 · 365" của nhóm Hành trình 5 tầng. Ô dồn dần về
     chặng sau: chặng 1 khởi động nhẹ, chặng 3–4–5 nhiều và cao cấp hơn. */
  var CHANG = [
    { no: 1, ten: 'Khởi động',       ngay: 'Ngày 1–7',     mau: '#0B7350', w: 0.10,
      y: 'Nhìn cho đúng. Làm quen nhà mình, định vị điểm xuất phát — nhẹ, cơ bản.' },
    { no: 2, ten: 'Vào hành trình',  ngay: 'Ngày 8–30',    mau: '#185AB4', w: 0.16,
      y: 'Vào hành trình chính. Hiểu cơ chế năm tầng, nhận nhiệm vụ đầu tiên.' },
    { no: 3, ten: 'Dựng hệ thống',   ngay: 'Ngày 31–120',  mau: '#5140B4', w: 0.22,
      y: 'Dựng thói quen và hệ thống gia đình. Nhiều việc hơn, chất lượng nâng dần.' },
    { no: 4, ten: 'Tăng tốc',        ngay: 'Ngày 121–240', mau: '#0B6675', w: 0.25,
      y: 'Tăng tốc — bí kíp chuyên sâu, cú hích lớn, giá trị cao cấp.' },
    { no: 5, ten: 'Làm chủ',         ngay: 'Ngày 241–365', mau: '#BE0E16', w: 0.27,
      y: 'Làm chủ và trao quyền. Nội dung cao cấp nhất, dẫn dắt nhà khác.' }
  ];

  /* Gom màn theo nhóm, LỌC đúng theo quyền — dùng chung một cửa G.allowed
     với thanh trái, để không bao giờ lệch nhau. */
  function khoangThay() {
    return (G.NAV || []).map(function (g) {
      var vis = (g.items || []).filter(function (it) { return G.allowed(it.v); });
      return { g: g, vis: vis };
    });
  }

  function oCard(it, so, mau, star) {
    return '<button class="bct-o" style="--kc:' + mau + '" data-v="' + h(it.v) + '" ' +
      'title="' + h(it.h || it.t) + '">' +
      (star && it.star ? '<span class="bct-star">★</span>' : '') +
      '<span class="bct-no">' + (so < 10 ? '00' : so < 100 ? '0' : '') + so + '</span>' +
      '<span class="bct-ct">' + h(it.t) + '</span></button>';
  }

  /* ── Bàn cờ 6 khoang (admin + đội ngũ nghề) ── */
  function banCo(dsKhoang, isAdmin) {
    var so = 0, html = '<div class="bct-board">';
    dsKhoang.forEach(function (k) {
      var g = k.g, vis = k.vis;
      if (!vis.length) return; /* khoang không có màn nào trong quyền → ẩn hẳn */
      var cnt = isAdmin
        ? (vis.length === g.items.length
            ? '<span class="bct-cnt" style="background:' + g.c + '">' + vis.length + '</span>'
            : '<span class="bct-cnt" style="background:' + g.c + '">' + vis.length + '/' + g.items.length + '</span>')
        : '<span class="bct-cnt bct-cnt-mo">' + vis.length + ' màn</span>';
      html += '<section class="bct-kh" style="--kc:' + g.c + '">' +
        '<div class="bct-kh-top">' +
          '<span class="bct-kh-no">' + h(g.no) + '</span>' +
          '<span class="bct-kh-ti"><b>' + h(g.t) + '</b><small>' + h(g.essence || g.s || '') + '</small></span>' +
          cnt +
        '</div><div class="bct-os">';
      vis.forEach(function (it) { so++; html += oCard(it, so, g.c, true); });
      html += '</div></section>';
    });
    html += '</div>';
    return html;
  }

  /* ── Hành trình 365 ngày · 5 chặng (gia đình · CTV) ── */
  function hanhTrinh(dsKhoang) {
    /* Gộp mọi màn trong quyền theo thứ tự nhóm, rồi chia vào 5 chặng
       với số ô tăng dần. */
    var cells = [];
    dsKhoang.forEach(function (k) { k.vis.forEach(function (it) { cells.push(it); }); });
    var N = cells.length;
    var sizes = CHANG.map(function (c) { return Math.max(1, Math.round(c.w * N)); });
    var tong = sizes.reduce(function (a, b) { return a + b; }, 0);
    sizes[4] += (N - tong); if (sizes[4] < 0) sizes[4] = 0;
    var idx = 0, so = 0, html = '<div class="bct-arc">';
    CHANG.forEach(function (c, i) {
      var phan = cells.slice(idx, idx + sizes[i]); idx += sizes[i];
      var sao = '';
      for (var s = 0; s < 5; s++) sao += (s < c.no ? '★' : '☆');
      html += '<div class="bct-chang" style="--cc:' + c.mau + '">' +
        '<div class="bct-ch-top"><div class="bct-ch-day">CHẶNG ' + c.no + ' · ' + c.ngay + '</div>' +
          '<b>' + h(c.ten) + '</b><div class="bct-ch-prem">Cao cấp: ' + sao + '</div></div>' +
        '<div class="bct-ch-y">' + h(c.y) + '</div><div class="bct-ch-os">';
      phan.forEach(function (it) {
        so++;
        html += '<button class="bct-mo" style="--cc:' + c.mau + '" data-v="' + h(it.v) + '" ' +
          'title="' + h(it.h || it.t) + '"><span class="bct-mn">' + so + '</span>' +
          '<span class="bct-mt">' + h(it.t) + '</span></button>';
      });
      html += '</div><div class="bct-ch-foot">' + phan.length + ' màn</div></div>';
    });
    html += '</div>';
    return html;
  }

  G.VIEWS['ban-co-tong'] = function () {
    var r = (G.S && G.S.roleObj) || { lv: 15, n: 'Khách' };
    var lv = r.lv || 15;
    var isAdmin = lv <= 2;
    var isCust = lv >= 13;
    var ds = khoangThay();
    var thay = ds.reduce(function (a, b) { return a + b.vis.length; }, 0);
    var tong = (G.NAV || []).reduce(function (a, b) { return a + (b.items ? b.items.length : 0); }, 0);

    var head = U.ph({
      eyebrow: 'BÀN CỜ TỔNG · HỆ SINH THÁI GITA 365', ic: 'grid', grad: 1,
      t: isAdmin ? ('Bàn cờ ' + tong + ' màn') : (isCust ? 'Hành trình của nhà mình' : 'Bàn cờ phần việc của bạn'),
      lead: isAdmin
        ? ('Toàn bộ ' + tong + ' màn của hệ thống, chia sáu khoang — để Super Admin và Admin hiểu và vận hành cả hệ. Bấm vào một ô để mở màn đó.')
        : (isCust
            ? ('Hành trình của gia đình chia năm chặng theo 365 ngày — ' + thay + ' màn mở dần theo tầng. Bấm một ô để mở màn.')
            : ('Các màn trong phạm vi vai của bạn — ' + thay + ' màn phục vụ khách và việc được giao. Bấm một ô để mở màn.'))
    });

    var pct = tong ? Math.round(thay / tong * 100) : 0;
    var bar = '<div class="bct-rolebar">' +
      '<div class="bct-rb-who"><b>' + h(r.n || 'Khách') + '</b>' +
        '<span>Bậc ' + h(lv) + ' · ' + (isAdmin ? 'toàn quyền hệ thống' : (isCust ? 'gia đình' : 'đội ngũ')) + '</span></div>' +
      '<div class="bct-rb-nums">' +
        '<div class="bct-rb-s"><b>' + thay + '</b><small>MÀN CỦA BẠN</small></div>' +
        (isAdmin
          ? ('<div class="bct-rb-s"><b>' + tong + '</b><small>TỔNG MÀN</small></div>' +
             '<div class="bct-rb-s"><b>' + pct + '%</b><small>TỶ LỆ</small></div>')
          : '') +
      '</div></div>';

    var note = '<div class="bct-note"><span class="bct-note-i">' + ic('shield') + '</span>' +
      '<p>' + (isAdmin
        ? 'Bạn thấy đủ toàn hệ để hiểu và vận hành. Các vai khác chỉ thấy phần của mình — <b>không màn nào ngoài quyền bị lộ tên</b>.'
        : (isCust
          ? 'Bạn thấy đúng hành trình của nhà mình. Các màn nghề và quản trị được giữ kín.'
          : 'Bạn thấy đúng phần việc của mình. Màn quản trị và bí mật kinh doanh được giữ kín — Trợ lý GITA sẽ hướng dẫn phần cần thiết.')) +
      '</p></div>';

    var than = isCust ? hanhTrinh(ds) : banCo(ds, isAdmin);
    return head + bar + note + than;
  };
})();
