/* ═══════════════════════════════════════════════════════════════
   GITA 365 — MÀN CON NGƯỜI · BA CỬA  (Phân hệ 6 của Bộ não)

   ══ MÀN NÀY ĐẶT CÂU CHẶN LÊN TRƯỚC ══

   Ngăn đầu mở bằng đúng một câu: chưa qua đủ ba cửa thì không chạm
   khách một mình. Xếp ba cửa trước rồi mới nói câu ấy ở cuối thì người
   đọc lướt qua bảng, thấy ba việc phải làm, và không thấy cái hậu quả
   — mà cái hậu quả mới là thứ làm cho ba việc kia có nghĩa.

   ══ BỐN NGĂN ══

     cửa      — ba cửa, và năm đường chặn
     đồng chuẩn — vì sao MỘT bộ đề cho mọi vai
     mười ba  — mười ba tình huống thử, mỗi điều đúng một
     bài tuần — bốn phần, và chỗ dễ mục nhất
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;
G.VIEWS = G.VIEWS || {};

(function () {
  var U = G.U, h = U.h, ic = U.ic;

  var NGAN = [
    {ma: 'cua',  ten: 'Ba cửa',      ic: 'shield'},
    {ma: 'dong', ten: 'Đồng chuẩn',  ic: 'users'},
    {ma: 'th',   ten: '13 tình huống', ic: 'book'},
    {ma: 'tuan', ten: 'Bài tuần',    ic: 'clock'}
  ];

  var TEN_CHAM = {
    may: 'Máy chấm xong là xong',
    mayVaNguoi: 'Máy chấm được PHẦN LỚN — nhưng KHÔNG kết luận được',
    nguoi: 'Máy không chấm được chút nào'
  };
  var MAU_CHAM = {may: 'ok', mayVaNguoi: 'warn', nguoi: 'bad'};

  G.cngNgan = G.cngNgan || 'cua';

  function veLai() {
    if (!G.S || G.S.view !== 'con-nguoi') return;
    if (typeof document === 'undefined' || !document.getElementById('main')) return;
    G.render && G.render();
  }
  G.cngMoNgan = function (ma) { G.cngNgan = ma; veLai(); };

  function thanhNgan() {
    return '<div class="row" style="gap:8px;flex-wrap:wrap;margin-bottom:18px">' +
      NGAN.map(function (n) {
        var on = G.cngNgan === n.ma;
        return '<button class="btn' + (on ? ' primary' : '') + '" ' +
          'onclick="G.cngMoNgan(\'' + n.ma + '\')" style="gap:7px">' +
          ic(n.ic) + h(n.ten) + '</button>';
      }).join('') + '</div>';
  }

  /* ═══════════ NGĂN 1 · BA CỬA ═══════════ */
  function nganCua() {
    var l = G.CN_CUA_LUAT || {};
    var o = '<div class="card" style="border-left:3px solid var(--bad)">' +
      '<b>' + h(l.khongMotMinh || '') + '</b>' +
      '<p class="sm mt">' + h(l.viCoRang || '') + '</p>' +
      '<p class="sm mt">' + h(l.thieuNguoiKhongPhaiNgoaiLe || '') + '</p></div>';

    o += (G.CN_CUA || []).map(function (c) {
      return '<div class="card mt" style="border-left:3px solid ' + h(c.c) + '">' +
        '<b>' + h(c.ten) + '</b>' +
        '<p class="sm mt"><b>Nội dung:</b> ' + h(c.noiDung) + '</p>' +
        '<p class="sm mt"><b>Đạt là:</b> ' + h(c.datLa) + '</p>' +
        '<p class="sm mt" style="color:var(--' + (MAU_CHAM[c.aiCham] || 'line') + ')">' +
        '<b>Ai kết luận:</b> ' + h(TEN_CHAM[c.aiCham] || c.aiCham) + '</p>' +
        (c.troVao ? '<p class="sm mt"><b>Trỏ vào kho:</b> <code>' +
          h(c.troVao) + '</code> — không dựng lại</p>' : '') +
        '<p class="sm muted mt">' + h(c.y) + '</p></div>';
    }).join('');

    o += U.sec('Hai nguồn của một dòng ba cửa',
      'Một dòng đo được và một dòng khai ra không được nằm cùng cột, cùng kiểu chữ');
    o += U.tbl(['Nguồn', 'Là gì', 'Vì sao'],
      (G.CN_NGUON || []).map(function (n) {
        return ['<b class="sm">' + h(n.ten) + '</b>',
          '<span class="sm">' + h(n.laGi) + '</span>',
          '<span class="sm">' + h(n.y) + '</span>'];
      }));

    o += '<div class="card mt2" style="border-left:3px solid var(--warn)">' +
      '<b class="sm">Bật cổng là chặn cả người cũ</b>' +
      '<p class="sm mt">' + h(l.batDauLaChanHet || '') + '</p></div>';

    o += U.sec('Năm đường chặn', 'Mỗi mã kèm một câu vì sao — mã không nói lý do ' +
      'thì người bị chặn đi tìm đường vòng chứ không đi sửa');
    o += U.tbl(['Mã', 'Ở cửa', 'Khi nào', 'Vì sao'],
      (G.CN_CHAN || []).map(function (x) {
        return ['<b class="sm">' + h(x.ma) + '</b>',
          '<code class="sm">' + h(x.o) + '</code>',
          '<span class="sm">' + h(x.khi) + '</span>',
          '<span class="sm">' + h(x.vi) + '</span>'];
      }));
    return o;
  }

  /* ═══════════ NGĂN 2 · ĐỒNG CHUẨN ═══════════ */
  function nganDong() {
    var d = G.CN_DONGCHUAN || {};
    return '<div class="card" style="border-left:3px solid var(--gita)">' +
      '<b>' + h(d.cot || '') + '</b>' +
      '<p class="sm mt">' + h(d.viMotBoDe || '') + '</p></div>' +
      '<div class="card mt"><b class="sm">Khác bộ sát hạch nghề thế nào</b>' +
      '<p class="sm mt">' + h(d.khacSatHach || '') + '</p></div>' +
      '<div class="card mt"><b class="sm">Câu này đã quyết một việc rồi</b>' +
      '<p class="sm mt">' + h(d.daQuyetODau || '') + '</p></div>';
  }

  /* ═══════════ NGĂN 3 · MƯỜI BA TÌNH HUỐNG ═══════════ */
  function nganTH() {
    var o = '<div class="card" style="border-left:3px solid var(--gita)">' +
      '<b class="sm">Mỗi điều đúng MỘT tình huống</b>' +
      '<p class="sm mt">Thiếu một điều thì bài thi vẫn xưng là 13/13 trong khi nó ' +
      'chỉ thử mười hai điều — và chỗ thiếu không lộ ra ở đâu cả. Bộ kiểm đối ' +
      'chiếu ô <code>dieu</code> của từng tình huống với Hiến pháp.</p></div>';

    o += (G.CN_C1_TH || []).map(function (t) {
      return '<div class="card mt">' +
        '<b class="sm">' + h(t.ma) + ' · ' + h(t.dieu) + '</b>' +
        '<p class="sm mt">' + h(t.tinhHuong) + '</p>' +
        '<p class="sm mt" style="color:var(--ok)"><b>Đúng:</b> ' + h(t.dungLa) + '</p>' +
        '<p class="sm mt" style="color:var(--bad)"><b>Hay sai thành:</b> ' +
        h(t.saiThuong) + '</p></div>';
    }).join('');
    return o;
  }

  /* ═══════════ NGĂN 4 · BÀI TUẦN ═══════════ */
  function nganTuan() {
    var l = G.CN_TUAN_LUAT || {};
    var o = '<div class="card" style="border-left:3px solid var(--bad)">' +
      '<b>' + h(l.banSaiPhaiThatSuSai || '') + '</b>' +
      '<p class="sm mt">' + h(l.banMauPhaiSach || '') + '</p></div>';

    o += U.tbl(['Phần', 'Bao nhiêu', 'Máy canh gì', 'Vì sao'],
      (G.CN_TUAN || []).map(function (t) {
        return ['<b class="sm">' + h(t.ten) + '</b>',
          '<span class="sm">' + h(String(t.soLuong)) + '</span>',
          '<span class="sm">' + h(t.mayCanhGi) + '</span>',
          '<span class="sm">' + h(t.y) + '</span>'];
      }));

    o += '<div class="card mt2"><b class="sm">Ba chỗ còn lại</b>' +
      '<p class="sm mt">' + h(l.dieuPhaiCoThat || '') + '</p>' +
      '<p class="sm mt">' + h(l.mayKhongChonCa || '') + '</p>' +
      '<p class="sm muted mt">' + h(l.baMuoiPhut || '') + '</p></div>';
    return o;
  }

  G.VIEWS['con-nguoi'] = function () {
    var o = '<div class="card" style="border-left:3px solid var(--gita)">' +
      '<b>PHÂN HỆ 6 — CON NGƯỜI</b>' +
      '<p class="sm muted mt">Bộ não này phục vụ <b>cả máy lẫn người</b>. Phần ' +
      'này không dựng lại bộ sát hạch nghề đã có, cũng không chép lại Hiến pháp — ' +
      'nó dựng đúng một thứ chưa có: <b>một cái cổng đứng trước lượt chạm khách ' +
      'đầu tiên</b>.</p></div>';

    /* Kho nghề nạp SAU khi đăng nhập, và vai không có gói nghề thì
       không bao giờ nạp. Chặn ở ĐÂY, một chỗ, trước cả thanh ngăn —
       một cái khung rỗng đọc ra là "chỗ này chưa làm xong", không đọc
       ra là "vai của bạn không mở được". */
    if (!(G.CN_CUA || []).length)
      return o + U.empty('Ba cửa chưa mở',
        'Kho nghề chưa nạp. Đăng nhập bằng vai có quyền nghề.', true);

    o += thanhNgan();
    if (G.cngNgan === 'dong') o += nganDong();
    else if (G.cngNgan === 'th') o += nganTH();
    else if (G.cngNgan === 'tuan') o += nganTuan();
    else o += nganCua();
    return o;
  };
})();
