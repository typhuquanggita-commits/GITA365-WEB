/* ═══════════════════════════════════════════════════════════════
   GITA 365 — MÀN PHÁP LÝ & RỦI RO  (Phân hệ 7 của Bộ não)

   ══ NGĂN ĐẦU LÀ CÂU CẢNH BÁO, KHÔNG PHẢI MỘT BẢNG ══

   Bản đặc tả mở Phần IX bằng một cảnh báo bắt buộc: đây là bản đồ để
   biết chỗ nào cần HỎI, không phải tư vấn pháp lý. Đặt câu ấy ở cuối
   như một dòng chân trang thì nó đứng đúng chỗ người ta không đọc —
   mà một màn hình mang chữ "pháp lý" trong một hệ nội bộ thì người
   đọc dùng nó như một câu TRẢ LỜI, và họ dùng đúng vào lúc đang vội.

   ══ NĂM NGĂN ══

     cảnh báo — câu phải đọc trước mọi bảng
     hai luật — 91/2025 và 75/2025, và hậu kiểm nghĩa là gì
     bảy việc — của Luật 91, chia theo AI LÀM chứ không xếp theo số
     đồng ý  — ba ô, và hai phía của một lượt xoá
     luật sư — bốn câu hỏi mang đi hỏi, KHÔNG có câu trả lời
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;
G.VIEWS = G.VIEWS || {};

(function () {
  var U = G.U, h = U.h, ic = U.ic;

  var NGAN = [
    {ma: 'canh', ten: 'Cảnh báo',  ic: 'shield'},
    {ma: 'luat', ten: 'Hai luật',  ic: 'book'},
    {ma: 'viec', ten: 'Bảy việc',  ic: 'search'},
    {ma: 'dy',   ten: 'Đồng ý · Xoá', ic: 'quote'},
    {ma: 'ls',   ten: 'Luật sư',   ic: 'users'}
  ];

  G.plrNgan = G.plrNgan || 'canh';

  function veLai() {
    if (!G.S || G.S.view !== 'phap-ly-rui-ro') return;
    if (typeof document === 'undefined' || !document.getElementById('main')) return;
    G.render && G.render();
  }
  G.plrMoNgan = function (ma) { G.plrNgan = ma; veLai(); };

  function thanhNgan() {
    return '<div class="row" style="gap:8px;flex-wrap:wrap;margin-bottom:18px">' +
      NGAN.map(function (n) {
        var on = G.plrNgan === n.ma;
        return '<button class="btn' + (on ? ' primary' : '') + '" ' +
          'onclick="G.plrMoNgan(\'' + n.ma + '\')" style="gap:7px">' +
          ic(n.ic) + h(n.ten) + '</button>';
      }).join('') + '</div>';
  }

  /* ═══════════ NGĂN 1 · CẢNH BÁO ═══════════ */
  function nganCanh() {
    var c = G.PLR_CANHBAO || {};
    return '<div class="card" style="border-left:3px solid var(--bad)">' +
      '<b>' + h(c.cot || '') + '</b>' +
      '<p class="sm mt">' + h(c.truocKhiChay || '') + '</p></div>' +
      '<div class="card mt"><b class="sm">Vì sao câu này đứng ở ngăn đầu</b>' +
      '<p class="sm mt">' + h(c.viDatDau || '') + '</p></div>' +
      '<div class="card mt"><b class="sm">Máy không kết luận</b>' +
      '<p class="sm mt">' + h(c.mayKhongKetLuan || '') + '</p></div>';
  }

  /* ═══════════ NGĂN 2 · HAI LUẬT ═══════════ */
  function nganLuat() {
    var o = (G.PLR_LUAT || []).map(function (l) {
      var r = '<div class="card mt" style="border-left:3px solid ' + h(l.c) + '">' +
        '<b>' + h(l.so) + ' — ' + h(l.ten) + '</b>' +
        '<p class="sm mt"><b>Hiệu lực:</b> ' + h(l.hieuLuc) + '</p>' +
        '<p class="sm mt">' + h(l.chamVao) + '</p>';
      ['quyen', 'xuyenBienGioi', 'conHuongDan', 'soSanh', 'hauKiem', 'nguoiAnhHuong']
        .forEach(function (k) {
          if (l[k]) r += '<p class="sm mt">' + h(l[k]) + '</p>';
        });
      if (l.troVao) r += '<p class="sm muted mt">Đã có bộ lọc ở kho <code>' +
        h(l.troVao) + '</code> — phần này trỏ vào đấy, không dựng lại.</p>';
      return r + '</div>';
    }).join('');

    var hk = G.PLR_HAUKIEM || {};
    o += '<div class="card mt2" style="border-left:3px solid var(--warn)">' +
      '<b>' + h(hk.cot || '') + '</b>' +
      '<p class="sm mt">' + h(hk.vi || '') + '</p>' +
      '<p class="sm mt">' + h(hk.keoTheo || '') + '</p>' +
      '<p class="sm mt">' + h(hk.dieu10 || '') + '</p></div>';
    return o;
  }

  /* ═══════════ NGĂN 3 · BẢY VIỆC ═══════════ */
  function nganViec() {
    var l = G.PLR_VIEC_LUAT || {};
    var o = '<div class="card" style="border-left:3px solid var(--gita)">' +
      '<b>' + h(l.motDuong || '') + '</b>' +
      '<p class="sm mt">' + h(l.viBayDauTick || '') + '</p>' +
      '<p class="sm mt">' + h(l.doBangHanhVi || '') + '</p>' +
      '<p class="sm muted mt">' + h(l.khongChepRao10 || '') + '</p></div>';

    /* Chia theo AI LÀM, không xếp theo số thứ tự của bản đặc tả. Xếp
       theo số thì một việc máy canh nằm cạnh một việc chờ người, cùng
       kiểu chữ — và đó đúng là chỗ người đọc tin cả bảy như nhau. */
    [['mayDo', 'Máy canh — đo bằng cách gọi thật vào cửa', 'ok'],
     ['nguoiLam', 'Việc của NGƯỜI — máy không đo được', 'bad']]
      .forEach(function (nh) {
        var ds = (G.PLR_VIEC7 || []).filter(function (v) { return v[nh[0]]; });
        if (!ds.length) return;
        o += U.sec(nh[1], ds.length + ' việc');
        o += ds.map(function (v) {
          return '<div class="card mt" style="border-left:3px solid var(--' + nh[2] + ')">' +
            '<b class="sm">' + h(v.ma) + ' · ' + h(v.viec) + '</b>' +
            '<p class="sm mt"><b>Vì sao:</b> ' + h(v.viSao) + '</p>' +
            '<p class="sm mt">' + h(v[nh[0]]) + '</p>' +
            (v.troVao ? '<p class="sm muted mt">Trỏ vào kho <code>' +
              h(v.troVao) + '</code></p>' : '') +
            (v.choChu ? '<p class="sm mt" style="color:var(--warn)"><b>Chờ chủ hệ:</b> ' +
              h(v.choChu) + '</p>' : '') + '</div>';
        }).join('');
      });
    return o;
  }

  /* ═══════════ NGĂN 4 · ĐỒNG Ý VÀ XOÁ ═══════════ */
  function nganDY() {
    var l = G.PLR_DONGY_LUAT || {};
    var o = '<div class="card" style="border-left:3px solid var(--bad)">' +
      '<b>' + h(l.khongGop || '') + '</b>' +
      '<p class="sm mt">' + h(l.oThuBaKhongBatBuoc || '') + '</p>' +
      '<p class="sm mt">' + h(l.choMeMoiKyDuocOCon || '') + '</p>' +
      '<p class="sm muted mt">' + h(l.rutLaDongMOI || '') + '</p></div>';

    o += U.tbl(['Ô', 'Bắt buộc', 'Câu người ta đọc', 'Vì sao'],
      (G.PLR_DONGY || []).map(function (d) {
        return ['<b class="sm">' + h(d.ten) + '</b>',
          '<span class="sm">' + (d.batBuoc ? 'Có' : '<b>KHÔNG</b>') + '</span>',
          '<span class="sm">' + h(d.chu) + '</span>',
          '<span class="sm">' + h(d.y) + '</span>'];
      }));

    var xl = G.PLR_XOA_LUAT || {};
    o += U.sec('Năm bước của một lượt xoá', 'hai phía, và chúng không gộp được');
    o += U.tbl(['Bước', 'Ai làm', 'Trong bao lâu', 'Vì sao'],
      (G.PLR_XOA || []).map(function (x) {
        return ['<b class="sm">' + h(x.buoc) + '</b>',
          '<span class="sm">' + h(x.ai) + '</span>',
          '<span class="sm">' + (x.mocNgay ? x.mocNgay + ' ngày' : 'ngay') + '</span>',
          '<span class="sm">' + h(x.y) + '</span>'];
      }));

    o += '<div class="card mt2" style="border-left:3px solid var(--warn)">' +
      '<b class="sm">' + h(xl.haiPhia || '') + '</b>' +
      '<p class="sm mt">' + h(xl.mayKhongTuDanhDau || '') + '</p>' +
      '<p class="sm muted mt">' + h(xl.neuRiengQuaHan || '') + '</p></div>';
    return o;
  }

  /* ═══════════ NGĂN 5 · LUẬT SƯ ═══════════ */
  function nganLS() {
    var l = G.PLR_VUNG_LUAT || {};
    var o = '<div class="card" style="border-left:3px solid var(--bad)">' +
      '<b>' + h(l.khongKetLuan || '') + '</b>' +
      '<p class="sm mt">' + h(l.vi || '') + '</p>' +
      '<p class="sm mt">' + h(l.giaTriThatONauHoiGi || '') + '</p></div>';

    o += (G.PLR_VUNG4 || []).map(function (v) {
      return '<div class="card mt">' +
        '<b class="sm">' + h(v.ma) + ' · ' + h(v.vung) + '</b>' +
        '<p class="sm mt"><b>Câu mang đi hỏi:</b> ' + h(v.hoiGi) + '</p>' +
        '<p class="sm muted mt">' + h(v.viMayKhongTraLoi) + '</p></div>';
    }).join('');
    return o;
  }

  G.VIEWS['phap-ly-rui-ro'] = function () {
    var o = '<div class="card" style="border-left:3px solid var(--gita)">' +
      '<b>PHÂN HỆ 7 — PHÁP LÝ &amp; RỦI RO</b>' +
      '<p class="sm muted mt">Hai luật có hiệu lực từ 01/01/2026 chạm thẳng vào cách ' +
      'GITA giữ dữ liệu và cách GITA viết bài. Phần này <b>trỏ</b> vào hàng rào 10 ' +
      'điểm và bộ lọc quảng cáo đã có, và chỉ dựng thứ chưa có: ba ô đồng ý tách bạch, ' +
      'cổng dữ liệu trẻ em, và một nút xoá chạy thật.</p></div>';

    if (!(G.PLR_VIEC7 || []).length)
      return o + U.empty('Pháp lý & rủi ro chưa mở',
        'Kho nghề chưa nạp. Đăng nhập bằng vai có quyền nghề.', true);

    o += thanhNgan();
    if (G.plrNgan === 'luat') o += nganLuat();
    else if (G.plrNgan === 'viec') o += nganViec();
    else if (G.plrNgan === 'dy') o += nganDY();
    else if (G.plrNgan === 'ls') o += nganLS();
    else o += nganCanh();
    return o;
  };
})();
