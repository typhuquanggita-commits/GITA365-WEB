/* ═══════════════════════════════════════════════════════════════
   GITA 365 — MÀN NỘI DUNG & TIẾP THỊ (Phân hệ 3 của Bộ não)

   ══ MÀN NÀY KHÔNG CHÉP LẠI HIẾN PHÁP NỘI DUNG ══

   Kho đã có màn *Biên soạn nội dung* với cả hiến pháp `KN_*` và bộ
   soi chạy thật. Màn này chỉ dựng ba thứ Phần V mang lại — tầng nhận
   thức, bảy nhánh, bộ lọc quảng cáo — và trỏ sang chỗ kia cho phần
   còn lại.

   ══ BỐN NGĂN ══

     tầng   — bảy tầng nhận thức, và lời kêu gọi đúng/sai của từng nhóm
     nhánh  — một gốc ra bảy nhánh, và phép đếm là phép đo chất lượng
     lọc    — bảy mục, tách HAI NGĂN: máy đo và người khai
     soi    — soi một bài thật, chạy cả ba cổng một lượt
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;
G.VIEWS = G.VIEWS || {};

(function () {
  var U = G.U, h = U.h, ic = U.ic;

  var NGAN = [
    {ma: 'tang',  ten: 'Tầng nhận thức', ic: 'arrow'},
    {ma: 'nhanh', ten: '7 nhánh',        ic: 'star'},
    {ma: 'loc',   ten: 'Lọc quảng cáo',  ic: 'search'},
    {ma: 'soi',   ten: 'Soi một bài',    ic: 'quote'}
  ];

  G.ntNgan = G.ntNgan || 'tang';

  function oGiaTri(id) {
    var el = typeof document !== 'undefined' && document.getElementById(id);
    return el ? String(el.value || '').trim() : '';
  }
  function oTich(id) {
    var el = typeof document !== 'undefined' && document.getElementById(id);
    return !!(el && el.checked);
  }
  function veLai() {
    if (!G.S || G.S.view !== 'noi-dung-tiep-thi') return;
    if (typeof document === 'undefined' || !document.getElementById('main')) return;
    G.render && G.render();
  }
  G.ntMoNgan = function (ma) { G.ntNgan = ma; veLai(); };

  function thanhNgan() {
    return '<div class="row" style="gap:8px;flex-wrap:wrap;margin-bottom:18px">' +
      NGAN.map(function (n) {
        var on = G.ntNgan === n.ma;
        return '<button class="btn' + (on ? ' primary' : '') + '" ' +
          'onclick="G.ntMoNgan(\'' + n.ma + '\')" style="gap:7px">' +
          ic(n.ic) + h(n.ten) + '</button>';
      }).join('') + '</div>';
  }

  /* ═══════════ NGĂN 1 · BẢY TẦNG NHẬN THỨC ═══════════ */
  function nganTang() {
    var l = G.NT_TANG_LUAT || {};
    var o = '<div class="card" style="border-left:3px solid var(--bad)">' +
      '<b>' + h(l.cot || '') + '</b>' +
      '<p class="sm mt">' + h(l.viChan || '') + '</p>' +
      '<p class="sm muted mt">' + h(l.khongDoanTang || '') + '</p></div>';

    o += '<div class="card mt2" style="border-left:3px solid var(--warn)">' +
      '<b class="sm">Đây KHÔNG phải tầng sản phẩm T1–T5</b>' +
      '<p class="sm muted mt">' + h(l.viKhongPhaiTangSanPham || '') + '</p></div>';

    o += U.sec('Bảy tầng', 'người đọc đang ở đâu trên đường từ chưa-biết tới đồng-hành');
    o += U.tbl(['Tầng', 'Là gì', 'Nhóm'],
      (G.NT_TANG7 || []).map(function (x) {
        return ['<b class="sm">' + h(String(x.tangNT) + ' · ' + x.ten) + '</b>',
          '<span class="sm">' + h(x.la) + '</span>',
          '<span class="sm muted">' + h(x.nhom) + '</span>'];
      }));

    o += U.sec('Lời kêu gọi theo nhóm',
      'bảng nằm ở NHÓM chứ không ở tầng — chép ra bảy dòng là giữ bảy bản của một luật');
    o += (G.NT_NHOM4 || []).map(function (x) {
      return '<div class="card mt" style="border-left:3px solid var(--teal)">' +
        '<b>' + h(x.ten) + '</b>' +
        '<p class="sm mt"><b>Dạng đúng:</b> ' + h(x.dang) + '</p>' +
        '<p class="sm mt" style="color:var(--ok)"><b>Kêu gọi ĐÚNG:</b> ' +
        h(x.keuGoiDung) + '</p>' +
        (x.keuGoiSai
          ? '<p class="sm mt" style="color:var(--bad)"><b>Kêu gọi SAI:</b> ' +
            h(x.keuGoiSai.join(' · ')) + '</p>'
          : '') +
        '<p class="sm muted mt">' + h(x.vi) + '</p></div>';
    }).join('');
    return o;
  }

  /* ═══════════ NGĂN 2 · MỘT GỐC RA BẢY NHÁNH ═══════════ */
  function nganNhanh() {
    var l = G.NT_NHANH_LUAT || {};
    var o = '<div class="card"><b>' + h(l.cot || '') + '</b>' +
      '<p class="sm mt">' + h(l.viLaPhepDoChatLuong || '') + '</p>' +
      '<p class="sm mt"><b>Thiếu thì sao:</b> ' + h(l.neuThieu || '') + '</p>' +
      '<p class="sm muted mt">' + h(l.khongTuSinh || '') + '</p></div>';

    o += U.tbl(['Nhánh', 'Mức', 'Tầng', 'Vì sao đáng có'],
      (G.NT_NHANH7 || []).map(function (x) {
        return ['<b class="sm">' + h(x.ma + ' · ' + x.ten) + '</b>',
          '<span class="sm muted">' + h(x.muc || '—') + '</span>',
          '<span class="sm muted">' + h(x.nhom || '—') + '</span>',
          '<span class="sm">' + h(x.vi) + '</span>'];
      }));

    o += '<div class="card mt2"><b class="sm">Bài gốc này đã ra nhánh nào?</b>' +
      '<div class="row mt" style="gap:14px;flex-wrap:wrap">' +
      (G.NT_NHANH7 || []).map(function (x) {
        return '<label class="sm" style="display:flex;align-items:center;gap:7px">' +
          '<input type="checkbox" id="nt' + h(x.ma) + '">' + h(x.ma) + '</label>';
      }).join('') + '</div>' +
      '<div class="row mt2" style="gap:8px">' +
      '<button class="btn primary" onclick="G.ntDemNhanh()">Đếm nhánh</button>' +
      '</div></div>';

    var r = G.ntNhanhRa;
    if (r) o += '<div class="card" style="border-left:3px solid var(--' +
      (r.dat ? 'ok' : 'bad') + ');margin-top:14px">' +
      '<b>' + h(r.dat ? 'Đủ bảy nhánh' : 'Mới ' + r.soCo + '/7 nhánh') + '</b>' +
      '<p class="sm muted mt">' + h(r.vi || '') + '</p></div>';
    return o;
  }

  /* ═══════════ NGĂN 3 · BỘ LỌC QUẢNG CÁO ═══════════ */
  function nganLoc() {
    var l = G.NT_LOC_LUAT || {};
    var ds = G.NT_LOC7 || [];
    var o = '<div class="card" style="border-left:3px solid var(--bad)">' +
      '<b>' + h(l.cot || '') + '</b>' +
      '<p class="sm mt">' + h(l.viTachHai || '') + '</p>' +
      '<p class="sm mt"><b>Mục người-khai:</b> ' + h(l.nguoiDoDoiTen || '') + '</p>' +
      '<p class="sm muted mt">' + h(l.ngoLaDuChan || '') + '</p></div>';

    /* Hai ngăn tách hẳn nhau trên màn, không xếp chung một bảng bảy
       dòng: xếp chung thì một lời khai nằm cùng hàng với một phép đo,
       và người đọc tin cả hai như nhau. */
    o += U.sec('Bốn mục MÁY ĐO', 'máy đếm thẳng trong chuỗi đã dựng xong');
    o += ds.filter(function (x) { return x.mayDo; }).map(function (x) {
      return '<div class="card mt" style="border-left:3px solid var(--teal)">' +
        '<b>' + h(x.ma + ' · ' + x.hoi) + '</b>' +
        '<p class="sm mt"><b>Máy đo:</b> ' + h(x.mayDo) + '</p>' +
        (x.chapNhanKhiCo
          ? '<p class="sm mt"><b>Có giấy tờ thì:</b> ' + h(x.chapNhanKhiCo) + '</p>'
          : '') +
        '<p class="sm muted mt">' + h(x.vi) + '</p></div>';
    }).join('');

    o += U.sec('Ba mục NGƯỜI KHAI', 'máy nhìn thấy cái ô tích, không nhìn thấy sự việc');
    o += ds.filter(function (x) { return x.nguoiDo; }).map(function (x) {
      return '<div class="card mt" style="border-left:3px solid var(--warn)">' +
        '<b>' + h(x.ma + ' · ' + x.hoi) + '</b>' +
        '<p class="sm mt"><b>Người khai:</b> ' + h(x.nguoiDo) + '</p>' +
        '<p class="sm muted mt">' + h(x.vi) + '</p></div>';
    }).join('');

    o += '<div class="card mt2" style="border-left:3px solid var(--gita)">' +
      '<p class="sm">' + h(l.noiPhanHe7 || '') + '</p></div>';
    return o;
  }

  /* ═══════════ NGĂN 4 · SOI MỘT BÀI THẬT ═══════════ */
  function nganSoi() {
    var o = '<div class="card"><b class="sm">Soi một bài tiếp thị</b>' +
      '<p class="tiny muted mt">Chạy cả ba cổng một lượt: đúng tầng · bốn mục máy ' +
      'đo · ba mục người khai.</p>' +
      '<div class="row mt" style="gap:10px;flex-wrap:wrap">' +
      '<label class="sm" style="flex:1 1 160px"><b>Tầng nhận thức</b>' +
      '<select id="ntTang" class="inp">' +
      '<option value="">— chưa khai —</option>' +
      (G.NT_TANG7 || []).map(function (x) {
        return '<option value="' + h(String(x.tangNT)) + '">' +
          h(String(x.tangNT) + ' · ' + x.ten) + '</option>';
      }).join('') + '</select></label></div>' +
      '<div class="mt"><label class="sm"><b>Nội dung bài</b></label>' +
      '<textarea id="ntChu" class="inp" rows="5" maxlength="4000"></textarea></div>';

    o += '<p class="sm mt2"><b>Ba mục người khai</b> — tích "không áp dụng" nếu ' +
      'bài không có thứ ấy; bỏ trống KHÁC hẳn không áp dụng.</p>';
    o += (G.NT_LOC7 || []).filter(function (x) { return x.nguoiDo; })
      .map(function (x) {
        return '<div class="card mt" style="border-left:3px solid var(--warn)">' +
          '<b class="sm">' + h(x.ma) + ' · ' + h(x.hoi) + '</b>' +
          '<div class="row mt" style="gap:10px;flex-wrap:wrap">' +
          '<label class="sm" style="flex:1 1 160px"><b>Ai khai</b>' +
          '<input id="nt' + h(x.ma) + 'Ai" class="inp" maxlength="80"></label>' +
          '<label class="sm" style="flex:1 1 160px"><b>Số hiệu giấy tờ</b>' +
          '<input id="nt' + h(x.ma) + 'Gt" class="inp" maxlength="80"></label></div>' +
          '<label class="sm mt" style="display:flex;align-items:center;gap:7px">' +
          '<input type="checkbox" id="nt' + h(x.ma) + 'Kad">Không áp dụng cho bài này' +
          '</label></div>';
      }).join('');

    o += '<div class="row mt2" style="gap:8px">' +
      '<button class="btn primary" onclick="G.ntSoi()">Soi bài</button></div></div>';

    var r = G.ntSoiRa;
    if (r) {
      if (!r.ok) o += '<div class="card" style="border-left:3px solid var(--bad);' +
        'margin-top:14px"><p class="sm">' + h(r.error || '') + '</p></div>';
      else {
        o += '<div class="card" style="border-left:3px solid var(--' +
          (r.dat ? 'ok' : 'bad') + ');margin-top:14px">' +
          '<b>' + h(r.dat ? 'Sạch cả ba cổng' : 'Chưa chạy được') +
          ' · tầng ' + h(String(r.tangNT)) + ' (' + h(r.nhom) + ')</b>' +
          '<p class="sm muted mt">' + h(r.vi || '') + '</p>' +
          (!(r.keuGoi || {}).dat
            ? '<p class="sm mt" style="color:var(--bad)"><b>Lời kêu gọi:</b> ' +
              h(r.keuGoi.vi) + '</p>' : '') +
          ((r.locMay || {}).pham || []).map(function (x) {
            return '<p class="sm mt" style="color:var(--bad)"><b>' + h(x.ma) +
              ':</b> ' + h(x.dinh.join(' · ')) + '</p>';
          }).join('') +
          (!(r.locNguoi || {}).dat
            ? '<p class="sm mt" style="color:var(--warn)"><b>Người khai:</b> ' +
              h(r.locNguoi.vi) + '</p>' : '') +
          '</div>';
      }
    }
    return o;
  }

  G.ntDemNhanh = function () {
    var daCo = (G.NT_NHANH7 || []).filter(function (x) { return oTich('nt' + x.ma); })
      .map(function (x) { return x.ma; });
    G.goiMayChu('soatBayNhanh', {daCo: daCo})
      .then(function (d) { G.ntNhanhRa = d; veLai(); });
  };
  G.ntSoi = function () {
    var khai = {};
    (G.NT_LOC7 || []).filter(function (x) { return x.nguoiDo; }).forEach(function (x) {
      khai[x.ma] = oTich('nt' + x.ma + 'Kad')
        ? {khongApDung: true}
        : {boiAi: oGiaTri('nt' + x.ma + 'Ai'), giayTo: oGiaTri('nt' + x.ma + 'Gt')};
    });
    G.goiMayChu('soatTiepThi', {tangNT: oGiaTri('ntTang'), chu: oGiaTri('ntChu'),
      khai: khai})
      .then(function (d) { G.ntSoiRa = d; veLai(); });
  };

  G.VIEWS['noi-dung-tiep-thi'] = function () {
    var o = '<div class="card" style="border-left:3px solid var(--gita)">' +
      '<b>PHÂN HỆ 3 — NỘI DUNG & TIẾP THỊ</b>' +
      '<p class="sm muted mt">Màn này <b>không chép lại</b> hiến pháp nội dung — ' +
      'nó nằm ở màn <i>Biên soạn nội dung</i> và chạy thật ở đó. Chỗ này dựng ba ' +
      'thứ Phần V mang lại: nội dung phải khai <b>tầng nhận thức</b>, một bài gốc ' +
      'phải ra <b>đủ bảy nhánh</b>, và mọi bài tiếp thị phải qua <b>bộ lọc bảy ' +
      'mục</b> trước khi chạy.</p></div>';

    if (!(G.NT_TANG7 || []).length)
      return o + U.empty('Nội dung & tiếp thị chưa mở',
        'Kho nghề chưa nạp. Đăng nhập bằng vai có quyền nghề.', true);

    o += thanhNgan();

    if (G.ntNgan === 'tang')  return o + nganTang();
    if (G.ntNgan === 'nhanh') return o + nganNhanh();
    if (G.ntNgan === 'loc')   return o + nganLoc();
    return o + nganSoi();
  };

})();
