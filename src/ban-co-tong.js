/* ═══════════════════════════════════════════════════════════════
   GITA 365 — BÀN CỜ TỔNG (màn điều hướng toàn hệ, dạng THANH TAB)

   Một thanh Tab gọn: mỗi tab là một khoang (hoặc một chặng với gia đình).
   MỖI LẦN CHỈ MỞ MỘT TAB — tuyệt đối không đổ hết mọi màn ra một lượt,
   kể cả với Super Admin. Muốn xem khoang khác thì bấm tab khác.

   AN TOÀN LÀ GỐC — GIỚI HẠN THEO VAI · CẤP · TẦNG

   Màn này KHÔNG tự quyết ai thấy gì. Nó hỏi đúng một cửa: G.allowed(v)
   — chính cửa mà thanh trái và G.go dùng. Vai nào không được một màn thì
   ô ấy KHÔNG vẽ ra (không tên, không số); khoang nào không còn ô nào thì
   tab ấy cũng biến mất. Nên nhân sự và khách không đọc được cả kiến trúc
   của những màn ngoài quyền.

     · Super Admin · Admin (bậc <= 2) : đủ các khoang — nhưng vẫn mở từng
                                        tab một, không đổ hết ra màn hình.
     · Đội ngũ nghề (bậc 3-12)        : chỉ các màn trong phạm vi của mình.
     · Gia đình · CTV (bậc >= 13)     : hành trình 365 ngày, mỗi chặng một tab.

   Tab chạy bằng CSS thuần (ô radio ẩn) — không thêm trạng thái, không
   sửa app.js. Bấm một ô vẫn đi qua data-v -> G.go (gác quyền lần nữa).

   KHÔNG đụng giấy phép · mã hoá · CRM · máy chủ. Chỉ ĐỌC G.NAV + G.allowed.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;
G.VIEWS = G.VIEWS || {};

(function () {
  var U = G.U, h = U.h, ic = U.ic;

  var CHANG = [
    { id: 'c1', no: 1, ten: 'Khởi động',      ngay: 'Ngày 1–7',     mau: '#0B7350', w: 0.10,
      y: 'Nhìn cho đúng. Làm quen nhà mình, định vị điểm xuất phát — nhẹ, cơ bản.' },
    { id: 'c2', no: 2, ten: 'Vào hành trình', ngay: 'Ngày 8–30',    mau: '#185AB4', w: 0.16,
      y: 'Vào hành trình chính. Hiểu cơ chế năm tầng, nhận nhiệm vụ đầu tiên.' },
    { id: 'c3', no: 3, ten: 'Dựng hệ thống',  ngay: 'Ngày 31–120',  mau: '#5140B4', w: 0.22,
      y: 'Dựng thói quen và hệ thống gia đình. Nhiều việc hơn, chất lượng nâng dần.' },
    { id: 'c4', no: 4, ten: 'Tăng tốc',       ngay: 'Ngày 121–240', mau: '#0B6675', w: 0.25,
      y: 'Tăng tốc — bí kíp chuyên sâu, cú hích lớn, giá trị cao cấp.' },
    { id: 'c5', no: 5, ten: 'Làm chủ',        ngay: 'Ngày 241–365', mau: '#BE0E16', w: 0.27,
      y: 'Làm chủ và trao quyền. Nội dung cao cấp nhất, dẫn dắt nhà khác.' }
  ];

  /* Gom màn theo nhóm, LỌC đúng theo quyền — chung một cửa G.allowed. */
  function khoangThay() {
    return (G.NAV || []).map(function (g) {
      var vis = (g.items || []).filter(function (it) { return G.allowed(it.v); });
      return { g: g, vis: vis };
    }).filter(function (k) { return k.vis.length > 0; }); /* khoang rỗng → bỏ tab */
  }

  function oCard(it, so, mau) {
    return '<button class="bct-o" style="--kc:' + mau + '" data-v="' + h(it.v) + '" ' +
      'title="' + h(it.h || it.t) + '">' +
      (it.star ? '<span class="bct-star">★</span>' : '') +
      '<span class="bct-no">' + (so < 10 ? '00' : so < 100 ? '0' : '') + so + '</span>' +
      '<span class="bct-ct">' + h(it.t) + '</span></button>';
  }

  /* ── Thanh Tab theo KHOANG (admin + đội ngũ nghề) ── */
  function tabKhoang(ds, isAdmin) {
    var radios = '', bar = '<div class="bct-tabbar" role="tablist">', body = '<div class="bct-panels">';
    var so = 0;
    ds.forEach(function (k, i) {
      var g = k.g, rid = 'bct-' + g.id, on = (i === 0);
      radios += '<input type="radio" name="bctTab" class="bct-radio" id="' + rid + '"' + (on ? ' checked' : '') + '>';
      var dem = isAdmin
        ? (k.vis.length === g.items.length ? k.vis.length : (k.vis.length + '/' + g.items.length))
        : k.vis.length;
      bar += '<label class="bct-tab" for="' + rid + '" style="--kc:' + g.c + '" role="tab">' +
        '<span class="bct-tab-no">' + h(g.no) + '</span>' +
        '<span class="bct-tab-t">' + h(g.t) + '</span>' +
        '<span class="bct-tab-c">' + dem + '</span></label>';
      var cells = '';
      k.vis.forEach(function (it) { so++; cells += oCard(it, so, g.c); });
      body += '<div class="bct-panel" id="p-' + g.id + '">' +
        '<div class="bct-panel-h" style="--kc:' + g.c + '"><b>' + h(g.t) + '</b>' +
          '<small>' + h(g.essence || g.s || '') + '</small></div>' +
        '<div class="bct-os">' + cells + '</div></div>';
    });
    bar += '</div>'; body += '</div>';
    return '<section class="bct-tabwrap">' + radios + bar + body + '</section>';
  }

  /* ── Thanh Tab theo CHẶNG (gia đình · CTV) ── */
  function tabChang(ds) {
    var cells = [];
    ds.forEach(function (k) { k.vis.forEach(function (it) { cells.push(it); }); });
    var N = cells.length;
    var sizes = CHANG.map(function (c) { return Math.max(1, Math.round(c.w * N)); });
    var tong = sizes.reduce(function (a, b) { return a + b; }, 0);
    sizes[4] += (N - tong); if (sizes[4] < 0) sizes[4] = 0;

    var radios = '', bar = '<div class="bct-tabbar" role="tablist">', body = '<div class="bct-panels">';
    var idx = 0, so = 0;
    CHANG.forEach(function (c, i) {
      var phan = cells.slice(idx, idx + sizes[i]); idx += sizes[i];
      var rid = 'bct-' + c.id, on = (i === 0);
      var sao = ''; for (var s = 0; s < 5; s++) sao += (s < c.no ? '★' : '☆');
      radios += '<input type="radio" name="bctTab" class="bct-radio" id="' + rid + '"' + (on ? ' checked' : '') + '>';
      bar += '<label class="bct-tab" for="' + rid + '" style="--kc:' + c.mau + '" role="tab">' +
        '<span class="bct-tab-no">' + c.no + '</span>' +
        '<span class="bct-tab-t">' + h(c.ten) + '</span>' +
        '<span class="bct-tab-c">' + phan.length + '</span></label>';
      var cl = '';
      phan.forEach(function (it) {
        so++;
        cl += '<button class="bct-o" style="--kc:' + c.mau + '" data-v="' + h(it.v) + '" ' +
          'title="' + h(it.h || it.t) + '"><span class="bct-no">' + (so < 10 ? '00' : so < 100 ? '0' : '') + so + '</span>' +
          '<span class="bct-ct">' + h(it.t) + '</span></button>';
      });
      body += '<div class="bct-panel" id="p-' + c.id + '">' +
        '<div class="bct-panel-h" style="--kc:' + c.mau + '"><b>Chặng ' + c.no + ' · ' + h(c.ten) +
          ' <span class="bct-prem">' + sao + '</span></b><small>' + h(c.ngay) + ' — ' + h(c.y) + '</small></div>' +
        '<div class="bct-os">' + cl + '</div></div>';
    });
    bar += '</div>'; body += '</div>';
    return '<section class="bct-tabwrap">' + radios + bar + body + '</section>';
  }

  /* Thân bàn cờ (thanh vai + lời bảo mật + thanh Tab) — KHÔNG kèm tiêu đề
     màn, để nhúng được ngay dưới ngôi nhà mà không đụng U.ph. */
  G.banCoThan = function () {
    var r = (G.S && G.S.roleObj) || { lv: 15, n: 'Khách' };
    var lv = r.lv || 15;
    var isAdmin = lv <= 2;
    var isCust = lv >= 13;
    var ds = khoangThay();
    var thay = ds.reduce(function (a, b) { return a + b.vis.length; }, 0);
    var tong = (G.NAV || []).reduce(function (a, b) { return a + (b.items ? b.items.length : 0); }, 0);
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
        ? 'Màn chỉ mở <b>một tab mỗi lần</b> — không đổ hết mọi màn ra một lượt. Các vai khác chỉ thấy phần của mình; <b>không màn nào ngoài quyền bị lộ tên</b>.'
        : (isCust
          ? 'Bạn thấy đúng hành trình của nhà mình, theo từng chặng. Các màn nghề và quản trị được giữ kín.'
          : 'Bạn thấy đúng phần việc của mình, theo từng khoang. Màn quản trị và bí mật kinh doanh được giữ kín.')) +
      '</p></div>';

    var than = isCust ? tabChang(ds) : tabKhoang(ds, isAdmin);
    return bar + note + than;
  };

  /* Tiêu đề màn theo vai — dùng cho màn đứng riêng và khi nhúng dưới nhà. */
  G.banCoTieuDe = function () {
    var lv = ((G.S && G.S.roleObj) || {}).lv || 15;
    return {
      eyebrow: 'BÀN CỜ 365 NGÀY · HỆ SINH THÁI GITA 365', ic: 'grid', grad: 1,
      t: lv >= 13 ? 'Hành trình của nhà mình' : 'Bàn cờ điều hướng',
      lead: lv <= 2
        ? 'Bấm từng tab để mở một khoang — mỗi lần một phần, không đổ hết ra màn hình. Bấm một ô là mở thẳng màn đó.'
        : (lv >= 13
            ? 'Hành trình chia năm chặng — mỗi chặng một tab, mở dần theo tầng. Bấm một ô để mở màn.'
            : 'Các khoang trong phạm vi vai của bạn — mở từng tab một. Bấm một ô để mở màn.')
    };
  };

  G.VIEWS['ban-co-tong'] = function () {
    return U.ph(G.banCoTieuDe()) + G.banCoThan();
  };
})();
