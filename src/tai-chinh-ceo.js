/* ═══════════════════════════════════════════════════════════════
   GITA 365 — MÀN BẢY CON SỐ CEO (Phân hệ 5 của Bộ não)

   ══ MÀN NÀY KHÔNG XẾP BẢY CON SỐ THÀNH MỘT BẢNG BẢY DÒNG ══

   Đó là chủ ý, và là cả lý do màn tồn tại. Bảy con số không cùng một
   loại: ba cái đo thẳng trong sổ, hai cái chỉ tính được trên phần mẫu
   đã đủ tuổi, hai cái là ước tính. Xếp chúng cùng một bảng, cùng kiểu
   chữ, thì người đọc tin cả bảy như nhau — mà hai con số bị tin nhầm
   nhiều nhất lại đúng là hai con số dùng để quyết định tiêu tiền.

   ══ BA NGĂN ══

     bảy số  — ba ngăn riêng, và giả định nói ra
     luật    — bốn luật, ba cổng ở đây và một cái TRỎ sang chi-tieu
     kịch bản— ba bản, mỗi bản đủ ba ô: cắt · giữ · ngưỡng
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;
G.VIEWS = G.VIEWS || {};

(function () {
  var U = G.U, h = U.h, ic = U.ic;

  var NGAN = [
    {ma: 'so',   ten: 'Bảy con số', ic: 'star'},
    {ma: 'luat', ten: 'Bốn luật',   ic: 'search'},
    {ma: 'kb',   ten: 'Ba kịch bản', ic: 'arrow'}
  ];

  var TEN_NGUON = {
    doDuoc: 'Đo thẳng trong sổ',
    duTuoi: 'Chỉ tính trên mẫu ĐÃ ĐỦ TUỔI',
    ucTinh: 'ƯỚC TÍNH — chưa có đủ tuổi mẫu'
  };
  var MAU_NGUON = {doDuoc: 'ok', duTuoi: 'warn', ucTinh: 'bad'};

  G.ceoNgan = G.ceoNgan || 'so';

  function veLai() {
    if (!G.S || G.S.view !== 'tai-chinh-ceo') return;
    if (typeof document === 'undefined' || !document.getElementById('main')) return;
    G.render && G.render();
  }
  G.ceoMoNgan = function (ma) { G.ceoNgan = ma; veLai(); };

  function thanhNgan() {
    return '<div class="row" style="gap:8px;flex-wrap:wrap;margin-bottom:18px">' +
      NGAN.map(function (n) {
        var on = G.ceoNgan === n.ma;
        return '<button class="btn' + (on ? ' primary' : '') + '" ' +
          'onclick="G.ceoMoNgan(\'' + n.ma + '\')" style="gap:7px">' +
          ic(n.ic) + h(n.ten) + '</button>';
      }).join('') + '</div>';
  }

  /* ═══════════ NGĂN 1 · BẢY CON SỐ ═══════════ */
  function nganSo() {
    var l = G.TC_BAY_LUAT || {};
    var o = '<div class="card" style="border-left:3px solid var(--warn)">' +
      '<b>' + h(l.cot || '') + '</b>' +
      '<p class="sm mt">' + h(l.viTachNgan || '') + '</p>' +
      '<p class="sm mt">' + h(l.coMauPhaiNoiRa || '') + '</p>' +
      '<p class="sm muted mt">' + h(l.khongChiaChoKhong || '') + '</p></div>';

    /* Xếp theo NGUỒN, không theo số thứ tự. Xếp theo số thứ tự thì một
       ước tính nằm cạnh một phép đo, cùng kiểu chữ — và đó đúng là chỗ
       người đọc tin nhầm. */
    ['doDuoc', 'duTuoi', 'ucTinh'].forEach(function (ng) {
      var ds = (G.TC_BAY7 || []).filter(function (x) { return x.nguon === ng; });
      if (!ds.length) return;
      o += U.sec(TEN_NGUON[ng] + ' — ' + ds.length + ' con số', '');
      o += ds.map(function (x) {
        return '<div class="card mt" style="border-left:3px solid var(--' +
          (MAU_NGUON[ng] || 'line') + ')">' +
          '<b>' + h(String(x.so) + '. ' + x.ten) +
          (x.quanTrongNhat ? ' — QUAN TRỌNG NHẤT' : '') + '</b>' +
          (x.congThuc ? '<p class="sm mt"><b>Tính:</b> ' + h(x.congThuc) + '</p>' : '') +
          (x.nguongDo !== undefined
            ? '<p class="sm mt" style="color:var(--bad)"><b>Dưới ' +
              h(String(x.nguongDo)) + ' là báo động đỏ.</b></p>' : '') +
          (x.nguongPhanTram !== undefined
            ? '<p class="sm mt" style="color:var(--bad)"><b>Ngưỡng ' +
              h(String(x.nguongPhanTram)) + '%.</b></p>' : '') +
          (x.nguongLan !== undefined
            ? '<p class="sm mt"><b>Phải lớn hơn chi phí có một khách ít nhất ' +
              h(String(x.nguongLan)) + ' lần.</b></p>' : '') +
          '<p class="sm muted mt">' + h(x.vi) + '</p>' +
          (x.tachRa ? '<p class="sm mt" style="color:var(--bad)"><b>Chỗ dễ sai:</b> ' +
            h(x.tachRa) + '</p>' : '') + '</div>';
      }).join('');
    });

    o += '<div class="row mt2" style="gap:8px">' +
      '<button class="btn primary" onclick="G.ceoDoc()">Đo bảy con số bây giờ</button>' +
      '</div>';

    var r = G.ceoSoRa;
    if (r) o += !r.ok
      ? '<div class="card" style="border-left:3px solid var(--bad);margin-top:14px">' +
        '<p class="sm">' + h(r.error || '') + '</p></div>'
      : '<div class="card" style="border-left:3px solid var(--gita);margin-top:14px">' +
        '<b>Tháng ' + h(r.thang) + '</b>' +
        '<p class="sm mt"><b>Tiền mặt:</b> ' + h(String(r.doDuoc.S1_tienMat)) +
        ' · <b>chưa giao:</b> ' + h(String(r.doDuoc.S1_chuaGiao)) +
        ' · <b>của Học viện:</b> ' + h(String(r.doDuoc.S1_tienHocVien)) + '</p>' +
        '<p class="sm mt"><b>Số tháng sống được:</b> ' +
        h(r.doDuoc.S2_thangSong === undefined ? 'chưa đo được'
          : String(r.doDuoc.S2_thangSong)) + '</p>' +
        '<p class="sm mt"><b>Ở lại 90 ngày:</b> ' +
        h(r.duTuoi.S6_oLai90.pt === undefined ? 'chưa đo được'
          : r.duTuoi.S6_oLai90.pt + '% trên ' + r.duTuoi.S6_oLai90.mau + ' nhà') +
        ' · ' + h(String(r.duTuoi.S6_oLai90.chuaDuTuoi)) + ' nhà chưa đủ tuổi</p>' +
        '<p class="sm mt" style="color:var(--bad)"><b>Giá trị 365 ngày:</b> ' +
        h(r.ucTinh.S5_giaTri365.vi) + '</p>' +
        '<p class="tiny muted mt"><b>Giả định:</b> ' + h(r.giaDinh || '') + '</p>' +
        '<p class="sm muted mt">' + h(r.vi || '') + '</p></div>';
    return o;
  }

  /* ═══════════ NGĂN 2 · BỐN LUẬT ═══════════ */
  function nganLuat() {
    var o = (G.TC_LUAT4 || []).map(function (x) {
      return '<div class="card mt" style="border-left:3px solid var(--' +
        (x.troSang ? 'teal' : 'bad') + ')">' +
        '<b>' + h(x.ma + ' · ' + x.luat) + '</b>' +
        (x.may ? '<p class="sm mt"><b>Máy canh thế nào:</b> ' + h(x.may) + '</p>' : '') +
        (x.troSang ? '<p class="sm mt"><b>Đã chạy ở:</b> <code>' + h(x.troSang) +
          '</code> — chỗ này chỉ TRỎ</p>' : '') +
        (x.mayKhongLam ? '<p class="sm mt" style="color:var(--warn)">' +
          '<b>Máy KHÔNG làm:</b> ' + h(x.mayKhongLam) + '</p>' : '') +
        '<p class="sm muted mt">' + h(x.vi) + '</p></div>';
    }).join('');

    o += '<div class="row mt2" style="gap:8px">' +
      '<button class="btn primary" onclick="G.ceoSoatLuat()">Soi bốn luật bây giờ</button>' +
      '</div>';

    var r = G.ceoLuatRa;
    if (r && r.ok) o += '<div class="card" style="border-left:3px solid var(--' +
      (r.dat ? 'ok' : 'bad') + ');margin-top:14px">' +
      '<b>' + h(r.dat ? 'Không phạm luật nào' : 'Chặn ' + r.pham.length + ' chỗ') +
      '</b>' +
      (r.pham || []).map(function (x) {
        return '<p class="sm mt" style="color:var(--bad)"><b>' + h(x.ma) + ':</b> ' +
          h(x.vi) + '</p>' +
          (x.mayKhongLam ? '<p class="sm muted mt">' + h(x.mayKhongLam) + '</p>' : '');
      }).join('') +
      '<p class="sm muted mt">' + h(r.vi || '') + '</p></div>';
    return o;
  }

  /* ═══════════ NGĂN 3 · BA KỊCH BẢN ═══════════ */
  function nganKb() {
    var l = G.TC_KICHBAN_LUAT || {};
    var o = '<div class="card"><b>' + h(l.cot || '') + '</b>' +
      '<p class="sm mt">' + h(l.duBaO || '') + '</p>' +
      '<p class="sm mt">' + h(l.viPhaiCoGiu || '') + '</p>' +
      '<p class="sm mt">' + h(l.viPhaiCoNguong || '') + '</p>' +
      '<p class="sm muted mt">' + h(l.mayKhongChuyen || '') + '</p></div>';

    o += (G.TC_KICHBAN || []).map(function (x) {
      return '<div class="card mt" style="border-left:3px solid var(--' +
        (x.ma === 'KB_XAU' ? 'bad' : x.ma === 'KB_TOT' ? 'ok' : 'teal') + ')">' +
        '<b>' + h(x.ten) + ' · doanh thu ' +
        h((x.doiDoanhThu > 0 ? '+' : '') + x.doiDoanhThu + '%') + '</b>' +
        '<p class="sm mt"><b>Ngưỡng:</b> ' + h(x.nguong) + '</p>' +
        '<p class="sm mt"><b>Cắt trước:</b> ' + h(x.cat.join(' · ')) + '</p>' +
        '<p class="sm mt" style="color:var(--ok)"><b>Giữ tới cùng:</b> ' +
        h(x.giu.join(' · ')) + '</p>' +
        '<p class="sm muted mt">' + h(x.vi) + '</p></div>';
    }).join('');

    o += '<div class="row mt2" style="gap:8px">' +
      '<button class="btn" onclick="G.ceoKichBan()">Dấu hiệu đang trỏ về đâu</button>' +
      '</div>';

    var r = G.ceoKbRa;
    if (r && r.ok) o += '<div class="card" style="border-left:3px solid var(--warn);' +
      'margin-top:14px"><b>Dấu hiệu: ' + h(r.dauHieu) + '</b>' +
      '<p class="sm muted mt">' + h(r.vi || '') + '</p></div>';
    return o;
  }

  G.ceoDoc = function () {
    G.goiMayChu('bayConSoCEO', {}).then(function (d) { G.ceoSoRa = d; veLai(); });
  };
  G.ceoSoatLuat = function () {
    G.goiMayChu('soatLuatTaiChinh', {}).then(function (d) { G.ceoLuatRa = d; veLai(); });
  };
  G.ceoKichBan = function () {
    G.goiMayChu('dangOKichBan', {}).then(function (d) { G.ceoKbRa = d; veLai(); });
  };

  G.VIEWS['tai-chinh-ceo'] = function () {
    var o = '<div class="card" style="border-left:3px solid var(--gita)">' +
      '<b>PHÂN HỆ 5 — TÀI CHÍNH</b>' +
      '<p class="sm muted mt">Kho đã có cả một hệ tài chính chạy thật — phiếu thu, ' +
      'thang duyệt chi sáu mốc, đối chiếu ngân hàng, bảng lương. Màn này ' +
      '<b>không dựng lại cái nào</b>. Nó dựng thứ Phần VII mang lại: bảy con số CEO ' +
      'phải thấy mỗi tuần, và chúng <b>không cùng một loại</b>.</p></div>';

    if (!(G.TC_BAY7 || []).length)
      return o + U.empty('Tài chính CEO chưa mở',
        'Kho nghề chưa nạp. Đăng nhập bằng vai có quyền nghề.', true);

    o += thanhNgan();

    if (G.ceoNgan === 'so')   return o + nganSo();
    if (G.ceoNgan === 'luat') return o + nganLuat();
    return o + nganKb();
  };

})();
