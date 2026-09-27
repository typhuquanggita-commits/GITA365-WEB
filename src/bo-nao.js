/* ═══════════════════════════════════════════════════════════════
   GITA 365 — MÀN BỘ NÃO

   Theo bản đặc tả GITA-BRAIN-365-v3.0. Phần 1: Hiến pháp 13 điều ·
   Ba vùng uỷ quyền · Hàng rào 10 điểm · Bảy ghế tham mưu.

   ══ MÀN NÀY KHÔNG TRẢ LỜI THAY CHỦ HỆ, VÀ NÓI RA NGAY DÒNG ĐẦU ══

   Bản đặc tả tự viết: bộ não làm được 75–80%, không phải 100%. Người
   mở màn ra mà tưởng nó điều hành thay mình thì họ giao cho nó đúng
   những việc bản đặc tả nói không bao giờ giao.

   ══ THỨ TỰ NGĂN LÀ MỘT QUYẾT ĐỊNH ══

     hiến pháp  — 13 điều, và điều nào máy đo được
     ba vùng    — việc nào máy chạy, việc nào chỉ chủ hệ
     hàng rào   — soi một đoạn chữ, mười điểm
     ẩn danh    — soi thứ sắp rời khỏi hệ
     bảy ghế    — hội đồng tham mưu

   Hiến pháp đứng đầu vì sơ đồ của bản đặc tả đặt nó ở trên cùng kèm
   một câu: "không phân hệ nào vượt qua".
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;
G.VIEWS = G.VIEWS || {};

(function () {
  var U = G.U, h = U.h, ic = U.ic;

  var NGAN = [
    {ma: 'hienphap', ten: 'Hiến pháp',  ic: 'book'},
    {ma: 'vung',     ten: 'Ba vùng',    ic: 'shield'},
    {ma: 'rao',      ten: 'Hàng rào',   ic: 'check'},
    {ma: 'andanh',   ten: 'Ẩn danh',    ic: 'lock'},
    {ma: 'ghe',      ten: 'Bảy ghế',    ic: 'menu'}
  ];

  G.bnNgan = G.bnNgan || 'hienphap';

  function oGiaTri(id) {
    var el = typeof document !== 'undefined' && document.getElementById(id);
    return el ? String(el.value || '').trim() : '';
  }
  function veLai() {
    if (!G.S || G.S.view !== 'bo-nao') return;
    if (typeof document === 'undefined' || !document.getElementById('main')) return;
    G.render && G.render();
  }
  G.bnMoNgan = function (ma) { G.bnNgan = ma; veLai(); };

  function thanhNgan() {
    return '<div class="row" style="gap:8px;flex-wrap:wrap;margin-bottom:18px">' +
      NGAN.map(function (n) {
        var on = G.bnNgan === n.ma;
        return '<button class="btn' + (on ? ' primary' : '') + '" ' +
          'onclick="G.bnMoNgan(\'' + n.ma + '\')" style="gap:7px">' +
          ic(n.ic) + h(n.ten) + '</button>';
      }).join('') + '</div>';
  }

  /* ═══════════ NGĂN 1 · HIẾN PHÁP 13 ĐIỀU ═══════════

     Cột "ai đo" là cột đáng giá nhất của cả bảng. Bản đặc tả viết mười
     ba điều bằng giọng ngang nhau, nhưng máy chỉ đo được tám — và trình
     cả mười ba như đã kiểm thì người duyệt thấy mười ba dấu tick rồi
     thôi không đọc, mà năm điều nặng nhất về NGƯỜI lại đúng là năm điều
     không ai đọc nữa. */
  function nganHienPhap() {
    var ds = G.BN_HIENPHAP || [];
    var soMay = ds.filter(function (x) { return x.mayDo; }).length;
    var o = '<div class="card"><b>Hiến pháp 13 điều — không phân hệ nào vượt qua</b>' +
      '<p class="sm muted mt">Thứ tự ưu tiên, và thứ tự này <b>không được đảo</b>: ' +
      '① an toàn của gia đình và trẻ em · ② tính trung thực của mọi điều GITA nói ra ' +
      '· ③ hiệu quả kinh doanh. Khi ba điều xung đột, điều đứng trước thắng.</p>' +
      '<p class="sm muted mt">Máy đo được <b>' + soMay + '/' + ds.length + '</b> điều. ' +
      'Năm điều còn lại là việc của người đọc — và màn này nói thẳng chứ không ' +
      'trình chúng như đã kiểm.</p></div>';

    o += U.sec('Mười ba điều', soMay + ' điều máy đo được · ' +
      (ds.length - soMay) + ' điều người đọc');
    o += U.tbl(['#', 'Điều', 'Luật', 'Ai đo'],
      ds.map(function (x) {
        return ['<b>' + h(String(x.so)) + '</b>',
          '<b>' + h(x.ten) + '</b>',
          '<span class="sm">' + h(x.luat) + '</span>',
          x.mayDo
            ? '<span class="sm"><b style="color:var(--ok)">MÁY</b> — ' + h(x.mayDo) + '</span>'
            : '<span class="sm"><b style="color:var(--warn)">NGƯỜI</b> — ' +
              h(x.nguoiDo || '') + '</span>'];
      }));

    var l = G.BN_HIENPHAP_LUAT || {};
    o += '<div class="card mt2" style="border-left:3px solid var(--teal)">' +
      '<b class="sm">Vì sao phải tách máy đo với người đọc</b>' +
      '<p class="sm muted mt">' + h(l.vaSaoPhaiTach || '') + '</p></div>';
    return o;
  }

  /* ═══════════ NGĂN 2 · BA VÙNG UỶ QUYỀN ═══════════ */
  function nganVung() {
    var o = '<div class="card"><b>Ba vùng uỷ quyền</b>' +
      '<p class="sm muted mt"><b>Luật vàng:</b> ' +
      h((G.BN_VUNG_LUAT || {}).luatVang || '') + '</p></div>';

    var mau = {XANH: 'var(--ok)', VANG: 'var(--warn)', DO: 'var(--bad)'};
    o += '<div class="row mt2" style="gap:12px;flex-wrap:wrap">' +
      (G.BN_VUNG || []).map(function (v) {
        return '<div class="card" style="flex:1 1 280px;border-left:3px solid ' +
          (mau[v.ma] || 'var(--ink-3)') + '">' +
          '<div style="font-size:24px;font-weight:800">' + h(String(v.phan)) + '%</div>' +
          '<b class="sm">' + h(v.ten) + '</b>' +
          '<ul class="sm mt" style="padding-left:18px">' +
          (v.viec || []).map(function (x) {
            return '<li style="margin-top:3px">' + h(x) + '</li>'; }).join('') +
          '</ul><p class="tiny muted mt">' + h(v.vi) + '</p></div>';
      }).join('') + '</div>';

    /* Mười quyết định liệt RIÊNG, không nhét vào ô của vùng Đỏ: nhét
       vào thì nó là một gạch đầu dòng trong ba cái thẻ, và người ta
       lướt qua. Đây là danh sách ĐÓNG và nó đáng đứng một mình. */
    o += U.sec('Mười quyết định không bao giờ giao cho máy',
      'danh sách ĐÓNG — bớt một dòng là giao cho máy một việc bản đặc tả nói không bao giờ giao');
    o += U.tbl(['#', 'Quyết định', 'Vì sao'],
      (G.BN_DO10 || []).map(function (x) {
        return ['<b>' + h(String(x.so)) + '</b>', '<b class="sm">' + h(x.viec) + '</b>',
          '<span class="sm muted">' + h(x.vi) + '</span>'];
      }));

    o += '<div class="card mt2" style="border-left:3px solid var(--warn)">' +
      '<b class="sm">Bộ não làm 75–80%, không phải 100%</b>' +
      '<p class="sm muted mt">' + h((G.BN_VUNG_LUAT || {}).bayMuoiLamPhanTram || '') + '</p>' +
      '<p class="sm muted mt">' + h((G.BN_VUNG_LUAT || {}).saiEmRu || '') + '</p></div>';
    return o;
  }

  /* ═══════════ NGĂN 3 · HÀNG RÀO 10 ĐIỂM ═══════════ */
  function nganRao() {
    var o = '<div class="card"><b>Hàng rào mười điểm</b>' +
      '<p class="sm muted mt">Máy dò được chín điểm. Điểm <b>R9</b> — nhắc công nghệ ' +
      'hay năng lực GITA chưa có — luôn là việc của người duyệt, vì máy không biết ' +
      'GITA đang có năng lực gì.</p></div>';

    o += '<div class="card mt2">' +
      '<label class="sm"><b>Dán đoạn chữ cần soi</b></label>' +
      '<textarea id="bnRaoChu" class="inp" rows="6" maxlength="8000"></textarea>' +
      '<label class="sm mt" style="display:flex;gap:8px;align-items:center">' +
      '<input type="checkbox" id="bnRaoTL"> Đây là một câu TRẢ LỜI KHÁCH ' +
      '<span class="muted">(bật thì soi cả vòng Tri kỷ năm bước)</span></label>' +
      '<div class="row mt2" style="gap:8px">' +
      '<button class="btn primary" onclick="G.bnSoatRao()">Soi hàng rào</button>' +
      '</div></div>';

    var d = G.bnRaoRa;
    if (d) {
      if (!d.ok) o += '<div class="card" style="border-left:3px solid var(--bad);' +
        'margin-top:14px"><p class="sm">' + h(d.error || '') + '</p></div>';
      else {
        o += '<div class="card" style="border-left:3px solid var(--' +
          (d.dat ? 'ok' : 'bad') + ');margin-top:14px">' +
          '<b>' + h(d.dat ? 'Qua được chín điểm máy đo' : 'Phạm ' + d.pham.length + ' điểm') +
          '</b><p class="sm muted mt">' + h(d.vi || '') + '</p>' +
          (d.pham || []).map(function (p) {
            var r = (G.BN_RAO10 || []).filter(function (x) { return x.ma === p.ma; })[0] || {};
            return '<p class="sm mt"><b>' + h(p.ma + ' · ' + (r.hoi || '')) + '</b><br>' +
              '<span class="muted">Bắt: ' + h([].concat(p.thay).join(' · ')) +
              ' → <b>' + h(r.lam || '') + '</b>' +
              (r.dieu ? ' · Điều ' + h(String(r.dieu)) : '') + '</span></p>';
          }).join('') + '</div>';
        /* R9 đứng RIÊNG, không nằm chung với chỗ máy chấm. */
        o += '<div class="card mt2" style="border-left:3px solid var(--warn)">' +
          '<b class="sm">R9 — người duyệt phải đọc</b>' +
          '<p class="sm muted mt">' + h(d.viR9 || '') + '</p></div>';
      }
    }

    o += U.sec('Mười điểm', 'mỗi điểm nối về một điều của Hiến pháp');
    o += U.tbl(['#', 'Hỏi', 'Thì làm', 'Điều', 'Ai dò'],
      (G.BN_RAO10 || []).map(function (x) {
        return ['<b>' + h(x.ma) + '</b>', '<span class="sm">' + h(x.hoi) + '</span>',
          '<span class="sm">' + h(x.lam) + '</span>',
          '<span class="sm muted">' + h(String(x.dieu)) + '</span>',
          x.may ? '<span class="sm">máy</span>'
                : '<span class="sm"><b style="color:var(--warn)">người</b></span>'];
      }));
    return o;
  }

  G.bnSoatRao = function () {
    var el = typeof document !== 'undefined' && document.getElementById('bnRaoTL');
    G.goiMayChu('soatBoNao', {chu: oGiaTri('bnRaoChu'), laTraLoiKhach: !!(el && el.checked)})
      .then(function (d) { G.bnRaoRa = d; veLai(); });
  };

  /* ═══════════ NGĂN 4 · ẨN DANH TRƯỚC KHI RA NGOÀI ═══════════

     Luật vận hành số 1, và là luật có RĂNG nhất của cả phần này: nó
     đã cắm vào cửa guiDeBaiRaNgoai, nên một cái tên lọt vào đề bài thì
     lượt gửi BỊ CHẶN, không phải bị cảnh báo. */
  function nganAnDanh() {
    var o = '<div class="card" style="border-left:3px solid var(--bad)">' +
      '<b>Luật vận hành số 1 — ẩn danh trước khi ra ngoài</b>' +
      '<p class="sm mt">Thẻ Vùng Mạnh, hồ sơ song sinh, và <b>mọi ghi chép về con</b> ' +
      'không bao giờ rời khỏi hệ thống của GITA ở dạng có thể nhận dạng.</p>' +
      '<p class="sm muted mt">Gửi lên AI thì chỉ gửi: <i>"phụ huynh A, con 9 tuổi, ' +
      'vào qua cửa làm, sợ bị cười"</i>.</p>' +
      '<p class="sm muted mt">Luật số 91/2025/QH15 điều chỉnh cả việc xử lý dữ liệu ' +
      'xuyên biên giới — tức là việc gửi dữ liệu lên một dịch vụ AI đặt ở nước ngoài ' +
      'cũng thuộc phạm vi.</p></div>';

    o += '<div class="card mt2"><b class="sm">Cửa này đã có răng</b>' +
      '<p class="sm muted mt">Phép soi đã cắm vào cửa gửi đề bài ra ngoài. Một cái ' +
      'tên lọt vào đề bài thì lượt gửi <b>bị chặn</b>, không phải bị cảnh báo — và ' +
      'máy <b>không tự xoá hộ</b>.</p>' +
      '<p class="sm muted mt">' + h((G.BN_ANDANH_LUAT || {}).chanChuKhongSua || '') + '</p>' +
      '<p class="sm muted mt">' + h((G.BN_ANDANH_LUAT || {}).ngoLaDu || '') + '</p></div>';

    o += '<div class="card mt2">' +
      '<label class="sm"><b>Soi thử một đoạn chữ</b></label>' +
      '<textarea id="bnAdChu" class="inp" rows="5" maxlength="8000"></textarea>' +
      '<div class="row mt2" style="gap:8px">' +
      '<button class="btn primary" onclick="G.bnSoatAnDanh()">Soi</button></div></div>';

    var d = G.bnAdRa;
    if (d && d.ok) o += '<div class="card" style="border-left:3px solid var(--' +
      (d.sach ? 'ok' : 'bad') + ');margin-top:14px">' +
      '<b>' + h(d.sach ? 'Không thấy dữ liệu nhận dạng được'
                      : 'Ngờ ' + d.ngo.length + ' chỗ') + '</b>' +
      (d.ngo || []).map(function (n) {
        var a = (G.BN_ANDANH || []).filter(function (x) { return x.ma === n.ma; })[0] || {};
        return '<p class="sm mt"><b>' + h(n.ma + ' · ' + (a.ten || '')) + '</b><br>' +
          '<span class="muted">Bắt: ' + h(n.thay) + '</span><br>' +
          '<span class="muted">' + h(a.thay || '') + '</span></p>';
      }).join('') +
      '<p class="sm muted mt">' + h(d.vi || '') + '</p></div>';
    else if (d && !d.ok) o += '<div class="card" style="border-left:3px solid var(--bad);' +
      'margin-top:14px"><p class="sm">' + h(d.error || '') + '</p></div>';

    o += U.sec('Sáu thứ phải ẩn danh', 'mỗi thứ kèm cách thay');
    o += U.tbl(['Mã', 'Là gì', 'Vì sao', 'Thay bằng'],
      (G.BN_ANDANH || []).map(function (x) {
        return ['<b>' + h(x.ma) + '</b>', '<b class="sm">' + h(x.ten) + '</b>',
          '<span class="sm muted">' + h(x.vi) + '</span>',
          '<span class="sm">' + h(x.thay) + '</span>'];
      }));
    return o;
  }

  G.bnSoatAnDanh = function () {
    G.goiMayChu('soatAnDanh', {chu: oGiaTri('bnAdChu')})
      .then(function (d) { G.bnAdRa = d; veLai(); });
  };

  /* ═══════════ NGĂN 5 · BẢY GHẾ THAM MƯU ═══════════ */
  function nganGhe() {
    var l = G.BN_GHE_LUAT || {};
    var o = '<div class="card"><b>Hội đồng tham mưu bảy ghế</b>' +
      '<p class="sm muted mt">' + h(l.motCauMotGhe || '') + '</p>' +
      '<p class="sm muted mt">' + h(l.khongHuaTheo || '') + '</p></div>';

    o += U.sec('Bảy ghế', 'ghế 5 và ghế 7 có quyền phủ quyết');
    o += (G.BN_GHE || []).map(function (x) {
      return '<div class="card mt" style="border-left:3px solid ' +
        (x.phuQuyet ? 'var(--bad)' : 'var(--teal)') + '">' +
        '<b>' + h(x.ma + ' · ' + x.vai) +
        (x.phuQuyet ? ' <span style="color:var(--bad)">PHỦ QUYẾT</span>' : '') + '</b>' +
        '<p class="sm mt">“' + h(x.hoi) + '”</p>' +
        '<p class="sm muted mt">Xuất ra: ' + h(x.ra) + '</p>' +
        (x.viPhuQuyet ? '<p class="sm muted mt">' + h(x.viPhuQuyet) + '</p>' : '') +
        '</div>';
    }).join('');

    o += '<div class="card mt2" style="border-left:3px solid var(--warn)">' +
      '<b class="sm">Vì sao chỉ hai ghế được phủ quyết</b>' +
      '<p class="sm muted mt">' + h(l.haiGhePhuQuyet || '') + '</p></div>';
    return o;
  }

  G.VIEWS['bo-nao'] = function () {
    var o = '<div class="card" style="border-left:3px solid var(--gita)">' +
      '<b>BỘ NÃO GITA 365 — phần 1: hiến pháp và hàng rào</b>' +
      '<p class="sm muted mt">Màn này <b>không điều hành thay chủ hệ</b>. Bản đặc tả ' +
      'tự viết: bộ não làm được 75–80%, không phải 100% — và hai mươi phần trăm còn ' +
      'lại bắt buộc là người, vì pháp luật không cho, vì AI sai một cách êm ru, và vì ' +
      'đó đúng là thứ không ai thay được.</p></div>';

    /* Cùng cái hố của màn Vùng Mạnh, và nó lọt qua bộ rà soát chỗ trống
       vì ngưỡng ở đó là "hơn HAI thẻ rỗng" còn màn này rỗng đúng hai.
       Một cái hố nằm ngay dưới ngưỡng vẫn là cái hố — chỗ này không sửa
       ngưỡng, chỉ sửa cái hố. */
    if (!(G.BN_HIENPHAP || []).length)
      return o + U.empty('Bộ não chưa mở',
        'Kho nghề chưa nạp. Đăng nhập bằng vai có quyền nghề.', true);

    o += thanhNgan();

    if (G.bnNgan === 'hienphap') return o + nganHienPhap();
    if (G.bnNgan === 'vung')     return o + nganVung();
    if (G.bnNgan === 'rao')      return o + nganRao();
    if (G.bnNgan === 'andanh')   return o + nganAnDanh();
    return o + nganGhe();
  };

})();
