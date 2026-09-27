/* ═══════════════════════════════════════════════════════════════
   GITA 365 — MÀN VẬN HÀNH & CHĂM SÓC (Phân hệ 4 của Bộ não)

   ══ MÀN NÀY XẾP ĐÈN ĐỎ LÊN TRƯỚC ══

   Ngăn đầu là ngăn đèn, và trong ngăn ấy dòng ĐỎ đứng trên. Xếp theo
   thứ tự Xanh → Vàng → Đỏ thì dòng quan trọng nhất nằm dưới cùng, và
   người đọc lướt tới đó lúc đã hết chú ý. Cùng lý do mười tờ ứng phó
   của trợ lý hình ảnh xếp tờ GẤP lên trước.

   ══ BỐN NGĂN ══

     đèn    — ba màu, và ai làm gì trong 24 giờ
     hồ sơ  — 23 trường, chia theo NGUỒN chứ không theo nhóm
     nhịp   — 365 ngày, vùng tử thần nổi lên
     sổ     — năm cột, và hai cột bắt buộc
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;
G.VIEWS = G.VIEWS || {};

(function () {
  var U = G.U, h = U.h, ic = U.ic;

  var NGAN = [
    {ma: 'den',  ten: 'Đèn 3 màu',  ic: 'star'},
    {ma: 'hoso', ten: '23 trường',  ic: 'search'},
    {ma: 'nhip', ten: 'Nhịp 365',   ic: 'clock'},
    {ma: 'so',   ten: 'Sổ dấu vết', ic: 'quote'}
  ];

  var MAU_DEN = {XANH: 'ok', VANG: 'warn', DO: 'bad'};
  var TEN_NGUON = {
    nguoiKhai: 'Người khai',
    mayTinh: 'Máy tính lúc đọc',
    troSang: 'Trỏ sang hệ khác'
  };

  G.vhNgan = G.vhNgan || 'den';

  function oGiaTri(id) {
    var el = typeof document !== 'undefined' && document.getElementById(id);
    return el ? String(el.value || '').trim() : '';
  }
  function veLai() {
    if (!G.S || G.S.view !== 'van-hanh-cham-soc') return;
    if (typeof document === 'undefined' || !document.getElementById('main')) return;
    G.render && G.render();
  }
  G.vhMoNgan = function (ma) { G.vhNgan = ma; veLai(); };

  function thanhNgan() {
    return '<div class="row" style="gap:8px;flex-wrap:wrap;margin-bottom:18px">' +
      NGAN.map(function (n) {
        var on = G.vhNgan === n.ma;
        return '<button class="btn' + (on ? ' primary' : '') + '" ' +
          'onclick="G.vhMoNgan(\'' + n.ma + '\')" style="gap:7px">' +
          ic(n.ic) + h(n.ten) + '</button>';
      }).join('') + '</div>';
  }

  /* ═══════════ NGĂN 1 · ĐÈN BA MÀU ═══════════ */
  function nganDen() {
    var l = G.VH_DEN_LUAT || {};
    var o = '<div class="card" style="border-left:3px solid var(--bad)">' +
      '<b>' + h(l.cot || '') + '</b>' +
      '<p class="sm mt">' + h(l.mayKhongDongDuocDo || '') + '</p>' +
      '<p class="sm mt">' + h(l.khongBanTrongCuocGoi || '') + '</p>' +
      '<p class="sm muted mt">' + h(l.denTinhLucDoc || '') + '</p></div>';

    /* ĐỎ lên trước. Xếp Xanh → Vàng → Đỏ thì dòng quan trọng nhất nằm
       dưới cùng, và người đọc lướt tới đó lúc đã hết chú ý. */
    var ds = (G.VH_DEN3 || []).slice().sort(function (a, b) {
      var w = {DO: 0, VANG: 1, XANH: 2};
      return (w[a.den] === undefined ? 9 : w[a.den]) -
             (w[b.den] === undefined ? 9 : w[b.den]);
    });

    o += ds.map(function (x) {
      return '<div class="card mt" style="border-left:3px solid var(--' +
        (MAU_DEN[x.den] || 'line') + ')">' +
        '<b>' + h(x.ten) + (x.batBuocGoi ? ' — BẮT BUỘC GỌI ĐIỆN' : '') + '</b>' +
        '<p class="sm mt"><b>Dấu hiệu:</b> ' + h(x.dauHieu) + '</p>' +
        '<p class="sm mt"><b>Trong ' + h(String(x.trong)) + ' giờ:</b> ' +
        h(x.lam) + '</p>' +
        (x.cam ? '<p class="sm mt" style="color:var(--bad)"><b>Cấm:</b> ' +
          h(x.cam) + '</p>' : '') +
        '<p class="sm mt"><b>Ai làm:</b> ' + h({
          may: 'Máy', maySoanNguoiDuyet: 'Máy soạn, NGƯỜI duyệt',
          nguoiThat: 'NGƯỜI THẬT'
        }[x.aiLam] || x.aiLam) + '</p>' +
        (x.vi ? '<p class="sm muted mt">' + h(x.vi) + '</p>' : '') + '</div>';
    }).join('');
    return o;
  }

  /* ═══════════ NGĂN 2 · HAI MƯƠI BA TRƯỜNG ═══════════ */
  function nganHoSo() {
    var l = G.VH_TRUONG_LUAT || {};
    var o = '<div class="card" style="border-left:3px solid var(--warn)">' +
      '<b>' + h(l.cot || '') + '</b>' +
      '<p class="sm mt">' + h(l.viLech || '') + '</p></div>';

    o += '<div class="card mt2"><b class="sm">' + h(l.baLoaiNguon || '') + '</b>' +
      '<p class="sm mt">' + h(l.khongTronLoai || '') + '</p>' +
      '<p class="sm muted mt">' + h(l.khongChepTroSang || '') + '</p></div>';

    /* Xếp theo NGUỒN, không theo nhóm cố định/động. Xếp theo nhóm thì
       một trường máy tính nằm cạnh một trường người gõ, cùng kiểu chữ
       — và đó đúng là chỗ người ta gõ đè. */
    ['nguoiKhai', 'mayTinh', 'troSang'].forEach(function (ng) {
      var ds = (G.VH_TRUONG23 || []).filter(function (x) { return x.nguon === ng; });
      if (!ds.length) return;
      o += U.sec(TEN_NGUON[ng] + ' — ' + ds.length + ' trường',
        ng === 'nguoiKhai' ? 'có cột trong bảng, gõ vào được'
          : ng === 'mayTinh' ? 'KHÔNG có cột — tính lúc đọc'
          : 'KHÔNG có cột — đã sống ở hệ khác, chỗ này chỉ trỏ');
      o += U.tbl(['Mã', 'Trường', ng === 'troSang' ? 'Trỏ vào' : 'Vì sao'],
        ds.map(function (x) {
          return ['<b class="sm">' + h(x.ma) + '</b>',
            '<span class="sm">' + h(x.ten) + '</span>',
            '<span class="sm muted">' + h(x.tro || x.tinh || x.vi || '') + '</span>'];
        }));
    });
    return o;
  }

  /* ═══════════ NGĂN 3 · NHỊP 365 NGÀY ═══════════ */
  function nganNhip() {
    var l = G.VH_NHIP_LUAT || {};
    var o = '<div class="card"><b>' + h(l.cot || '') + '</b>' +
      '<p class="sm mt">' + h(l.viTuDong || '') + '</p>' +
      '<p class="sm muted mt">' + h(l.tuThanNangNhat || '') + '</p></div>';

    o += (G.VH_NHIP || []).map(function (x) {
      return '<div class="card mt" style="border-left:3px solid var(--' +
        (x.tuThan ? 'bad' : 'teal') + ')">' +
        '<b>Ngày ' + h(String(x.tu) + (x.tu === x.den ? '' : '–' + x.den)) + ' · ' +
        h(x.ten) + '</b>' +
        '<p class="sm mt">' + h(x.lam) + '</p>' +
        (x.cam ? '<p class="sm mt" style="color:var(--bad)"><b>Cấm:</b> ' +
          h(x.cam) + '</p>' : '') +
        (x.vi ? '<p class="sm muted mt">' + h(x.vi) + '</p>' : '') + '</div>';
    }).join('');
    return o;
  }

  /* ═══════════ NGĂN 4 · SỔ DẤU VẾT ═══════════ */
  function nganSo() {
    var l = G.VH_SO_LUAT || {};
    var o = '<div class="card"><b>' + h(l.cot || '') + '</b>' +
      '<p class="sm mt">' + h(l.viNamCot || '') + '</p>' +
      '<p class="sm muted mt">' + h(l.khongGhiDeDong || '') + '</p></div>';

    o += '<div class="card mt2" style="border-left:3px solid var(--bad)">' +
      '<b class="sm">Cố ý KHÔNG lưu trên Google Sheets</b>' +
      '<p class="sm mt">' + h(l.khongGoogleSheets || '') + '</p></div>';

    o += U.tbl(['Cột', 'Tên', 'Vì sao'],
      (G.VH_SO5 || []).map(function (x) {
        return ['<b class="sm">' + h(x.cot) + (x.batBuoc ? ' ★' : '') + '</b>',
          '<span class="sm">' + h(x.ten) + '</span>',
          '<span class="sm muted">' + h(x.vi || '') + '</span>'];
      }));

    o += '<div class="card mt2"><b class="sm">Đọc sổ của một nhà</b>' +
      '<div class="row mt" style="gap:10px;flex-wrap:wrap">' +
      '<label class="sm" style="flex:1 1 200px"><b>Mã gia đình</b>' +
      '<input id="vhNha" class="inp" maxlength="60"></label></div>' +
      '<div class="row mt2" style="gap:8px">' +
      '<button class="btn primary" onclick="G.vhDocSo()">Đọc sổ</button>' +
      '<button class="btn" onclick="G.vhDocHoSo()">Xem hồ sơ và đèn</button>' +
      '</div></div>';

    var d = G.vhHoSoRa;
    if (d) o += !d.ok
      ? '<div class="card" style="border-left:3px solid var(--bad);margin-top:14px">' +
        '<p class="sm">' + h(d.error || '') + '</p></div>'
      : '<div class="card" style="border-left:3px solid var(--' +
        (MAU_DEN[d.den.den] || 'line') + ');margin-top:14px">' +
        '<b>Đèn ' + h(d.den.den) + ' · ngày thứ ' + h(String(d.ngayThu)) +
        (d.den.tuThan ? ' · VÙNG TỬ THẦN' : '') + '</b>' +
        '<p class="sm mt">' + h(d.den.vi) + '</p>' +
        '<p class="sm mt"><b>Phải làm:</b> ' + h(d.den.lam) + '</p>' +
        '<p class="sm muted mt">Im lặng ' + h(String(d.mayTinh.soNgayImLang)) +
        ' ngày · ' + h(String(d.mayTinh.soWow)) + ' lượt WOW — hai con số này ' +
        'MÁY TÍNH, không ai gõ.</p></div>';

    var r = G.vhSoRa;
    if (r && r.ok) o += U.sec('Sổ dấu vết — ' + r.so + ' dòng',
      'xếp TĂNG DẦN, đọc xuôi được') +
      U.tbl(['Ngày', 'Kiểu', 'Đèn lúc chạm', 'Nội dung', 'Căn cứ', 'Ai duyệt'],
        (r.ds || []).map(function (x) {
          return ['<span class="sm">' + h(x.ngay) + '</span>',
            '<span class="sm">' + h(x.kieu) + '</span>',
            '<b class="sm">' + h(x.denLuc || '') + '</b>',
            '<span class="sm">' + h(x.noiDung) + '</span>',
            '<span class="sm muted">' + h(x.canCu) + '</span>',
            '<span class="sm muted">' + h(x.aiDuyet) + '</span>'];
        }));
    return o;
  }

  G.vhDocSo = function () {
    G.goiMayChu('doSoCham', {maNha: oGiaTri('vhNha')})
      .then(function (d) { G.vhSoRa = d; veLai(); });
  };
  G.vhDocHoSo = function () {
    G.goiMayChu('docSongSinh', {maNha: oGiaTri('vhNha')})
      .then(function (d) { G.vhHoSoRa = d; veLai(); });
  };

  G.VIEWS['van-hanh-cham-soc'] = function () {
    var o = '<div class="card" style="border-left:3px solid var(--gita)">' +
      '<b>PHÂN HỆ 4 — VẬN HÀNH & CHĂM SÓC</b>' +
      '<p class="sm muted mt">Hồ sơ song sinh của từng gia đình, đèn ba màu tính ' +
      '<b>lúc đọc</b>, nhịp chạm 365 ngày sinh tự động từ ngày tham gia, và sổ dấu ' +
      'vết năm cột. Cả phân hệ có giá trị ở đúng một dòng: <b>đèn Đỏ thì gọi điện, ' +
      'người thật, trong hai mươi tư giờ</b>.</p></div>';

    if (!(G.VH_DEN3 || []).length)
      return o + U.empty('Vận hành & chăm sóc chưa mở',
        'Kho nghề chưa nạp. Đăng nhập bằng vai có quyền nghề.', true);

    o += thanhNgan();

    if (G.vhNgan === 'den')  return o + nganDen();
    if (G.vhNgan === 'hoso') return o + nganHoSo();
    if (G.vhNgan === 'nhip') return o + nganNhip();
    return o + nganSo();
  };

})();
