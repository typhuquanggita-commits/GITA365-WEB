/* ═══════════════════════════════════════════════════════════════
   GITA 365 — NGÔI NHÀ THỊNH VƯỢNG  (9.99.101)

   Chủ hệ: "Nhiều chữ và rối mắt quá. Thiết kế như cấu trúc của một
   ngôi nhà — kích vào phần nào ra nội dung phần đó, để xây gia đình
   thịnh vượng."

   ══ MÀN NÀY KHÔNG CHỨA NỘI DUNG — NÓ TRỎ ══

   Mỗi phần ngôi nhà là một CÁI CỬA sang một màn ĐÃ CÓ, không phải một
   bản chép nội dung màn ấy. Dựng nội dung ở đây là bản thứ hai của một
   sự thật (luật kho) — và một hub điều hướng thì việc của nó là DẪN
   ĐƯỜNG, không phải kể lại. `G.NHA_PHAN` chỉ giữ ánh xạ phần → view,
   và mục 107 đối chiếu mọi view ấy với G.NAV thật: trỏ vào một màn
   không tồn tại thì đỏ, không phải một cái cửa dẫn vào tường.

   ══ VÌ SAO LÀ NÚT HTML, KHÔNG PHẢI VÙNG SVG ══

   Vẽ ngôi nhà bằng một tấm SVG rồi bắt click lên từng vùng thì đẹp,
   nhưng phép đo vùng chạm (32px), nhãn đọc được cho người mù, và phím
   Tab đều không nhìn thấy một vùng SVG. Nên từng phần là một <button>
   thật mang data-v — cùng đường điều hướng với cột trái (app.js dòng
   [data-v]) — xếp thành hình ngôi nhà bằng lưới. Đẹp mà không mất một
   lớp nào của bộ kiểm.

   ══ PHẦN KHOÁ KHÔNG PHẢI CLICK CHẾT ══

   Vai không mở được một phần (con của phụ huynh, hồ sơ nhà…) thì phần
   ấy hiện MỜ kèm ổ khoá và KHÔNG bấm được — không dẫn sang màn xin cấp
   phép. Một mục dẫn tới màn xin cấp phép là một "mục chết" (luật kho,
   diem-cham 9.x). Ngôi nhà vẫn đủ hình, và người xem đọc ngay được
   "phòng này là của phụ huynh", không phải "chỗ này chưa làm xong".
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;
G.VIEWS = G.VIEWS || {};

/* Ánh xạ PHẦN NGÔI NHÀ → MÀN ĐÃ CÓ. Một nguồn duy nhất; mục 107 đọc nó
   và đối chiếu `v` với G.NAV, `ic` với U.P, `perm` với bảng quyền —
   nên đổi một dòng ở đây là bộ kiểm tự canh lại. Thứ tự XÂY TỪ NỀN LÊN
   MÁI: nhìn cho đúng (nền) → đi theo thứ tự (cột) → sống mỗi ngày
   (cửa, lò sưởi) → từng người (các phòng) → nuôi lớn (vườn, kho) →
   thành gì (mái). */
/* Ô `mau` là SẮC MÀU riêng của từng phần — lấy từ bảng màu thương hiệu
   (--t1..t5 · --gita · --gita-do), không gõ mã màu tay. Mỗi phòng một
   màu để nhận ra ngay bằng mắt, và để cả màn có sắc chứ không đơn sắc
   xanh. CSS đọc qua biến `--ac`; thiếu `mau` thì rơi về --gita. */
/* Cấu trúc ngôi nhà theo bản đồ chủ hệ chốt (9.99.104):
   MÁI = Tầm Nhìn · NỀN = Văn hoá·Quy tắc·Thói quen·Kỷ luật ·
   TÁM NGĂN trong nhà · CỬA = Hành động · vòng GITA365 bao quanh.
   Mỗi ngăn TRỎ một màn đã có (không dựng nội dung mới); mục 107 đối
   chiếu mọi `v` với NAV thật. */
G.NHA_PHAN = [
  {k:'mai',  o:'mai',  v:'tam-nhin',        ic:'sun',     ten:'Tầm nhìn',            goi:'Tầm Nhìn Gia Đình Thịnh Vượng — 5 đến 20 năm', mau:'var(--gita-sang)', perm:'kh_gia_dinh'},
  {k:'n1',   o:'ngan', v:'cu-hich',         ic:'target',  ten:'Mục tiêu',            goi:'Cú hích lớn của nhà mình', mau:'var(--t1)', perm:'kh_gia_dinh', chang:'T1'},
  {k:'n2',   o:'ngan', v:'buc-tranh',       ic:'sun',     ten:'Hành Trình Hạnh Phúc',goi:'Bức tranh hành trình — nhánh nào đang cần tưới', mau:'var(--t2)', chang:'T3'},
  {k:'n3',   o:'ngan', v:'ban-do-ca-nhan',  ic:'seed',    ten:'Phát triển Bản Thân', goi:'Bản đồ cá nhân — tại sao → tài năng → lộ trình', mau:'var(--t4)', chang:'T2'},
  {k:'n4',   o:'ngan', v:'chan-dung-nha',   ic:'star',    ten:'Tài năng Thành viên', goi:'Chân dung từng thành viên thật sự là ai', mau:'var(--t3)', perm:'kh_gia_dinh', chang:'T2'},
  {k:'n5',   o:'ngan', v:'chuyen-hoa',      ic:'heart',   ten:'Giá trị Sống',        goi:'Bảy chuyển dịch làm nên một gia đình khác', mau:'var(--gita-do)', chang:'T4'},
  {k:'n6',   o:'ngan', v:'chin-vai',        ic:'shield',  ten:'Phẩm Chất Thành Viên',goi:'Chín vai mỗi người giữ trong nhà', mau:'var(--gita)', perm:'kh_gia_dinh', chang:'T4'},
  {k:'n7',   o:'ngan', v:'vinh-danh',       ic:'crown',   ten:'Vinh Danh Ghi Nhận',  goi:'Vinh danh & kỳ tích của năm', mau:'var(--t5)', chang:'T5'},
  {k:'n8',   o:'ngan', v:'bang-so',         ic:'chart',   ten:'Tiêu Chuẩn Sống',     goi:'Bảng số gia đình — chuẩn sống đo được', mau:'var(--gita-sau)', perm:'kh_gia_dinh', chang:'T5'},
  {k:'cua',  o:'cua',  v:'hom-nay',         ic:'home',    ten:'Hành động',           goi:'Việc của tối nay — một việc thôi', mau:'var(--gita-sau)'},
  {k:'nen',  o:'nen',  v:'thoi-quen',       ic:'ritual',  ten:'Nền móng',            goi:'Văn hoá · quy tắc · thói quen · kỷ luật', mau:'var(--gita-sau)', perm:'kh_gia_dinh'}
];

/* CD-03b · đọc data-* rồi gọi con đường theo chặng. Đọc dataset là ngữ
   cảnh THUỘC TÍNH (h() đúng ở đây), không phải chuỗi JS — không có chỗ
   cho một dấu nháy phá literal. */
G.nhaMoChang = function (el) {
  if (!el || typeof G.cdMoTheoChang !== 'function') return;
  G.cdMoTheoChang(el.getAttribute('data-chang'), el.getAttribute('data-vp'),
    el.getAttribute('data-vpten') || '');
};

(function () {
  var U = G.U, h = U.h, ic = U.ic;

  function moDuoc(p) {
    return !p.perm || (typeof G.can === 'function' && G.can(p.perm));
  }

  /* Một phần: nút thật khi mở được, khối mờ khoá khi không. Nhãn đọc
     được nằm trong chữ, không nhờ aria-label — chữ hiện ra chính là
     tên phần. */
  function oPhan(p, lop) {
    var than = '<span class="nha-ic">' + ic(p.ic) + '</span>' +
      '<b>' + h(p.ten) + '</b>' +
      '<small>' + h(p.goi) + '</small>';
    /* --ac là sắc màu riêng của phần, đọc từ ô `mau` (một biến token).
       Chỉ nhận cụm var(--tên) để không lọt một mã màu tay nào vào style. */
    var mau = /^var\(--[a-z0-9-]+\)$/.test(String(p.mau || '')) ? p.mau : 'var(--gita)';
    var st = ' style="--ac:' + mau + '"';
    if (moDuoc(p)) {
      /* CD-03b · phòng có `chang` (tám ngăn) mở CON ĐƯỜNG của chặng ấy —
         kích ô ra lộ trình, rồi từ con đường có nút Vào phòng. Phần
         không có chặng (mái · cửa · nền) đi thẳng màn nội dung.

         Truyền qua data-* rồi đọc bằng dataset (G.nhaMoChang), KHÔNG dựng
         một chuỗi JS trong thuộc tính onclick: `h()` là escape cho ngữ
         cảnh THUỘC TÍNH, không phải cho một chuỗi JS — nhồi `&#39;` vào
         một literal JS là sai ngữ cảnh và vỡ ở cái tên đầu tiên có dấu
         nháy (tổ soi đối kháng bắt, cùng họ lỗi U.sec double-escape). */
      if (p.chang) {
        return '<button class="nha-o ' + lop + '"' + st +
          ' data-chang="' + h(p.chang) + '" data-vp="' + h(p.v) +
          '" data-vpten="' + h(p.ten) + '" onclick="G.nhaMoChang(this)">' + than + '</button>';
      }
      return '<button class="nha-o ' + lop + '"' + st + ' data-v="' + h(p.v) + '">' + than + '</button>';
    }
    return '<div class="nha-o ' + lop + ' khoa"' + st + ' aria-disabled="true">' +
      '<span class="nha-lock">' + ic('lock') + '</span>' + than + '</div>';
  }

  function nhom(o) {
    return G.NHA_PHAN.filter(function (p) { return p.o === o; });
  }

  function veHang(o, lop) {
    return nhom(o).map(function (p) { return oPhan(p, lop); }).join('');
  }

  /* MƯỜI BÁNH ĐÀ vận hành gia đình — vòng quay quanh ngôi nhà. Đọc THẲNG
     G.BD_LON (tên thật của kho), KHÔNG chép mười tên vào đây: chép là bản
     thứ hai của một sự thật, và ngày kho đổi tên một bánh thì màn này nói
     sai. Mỗi bánh mở màn `banh-da` — màn tổng của mười bánh. */
  var BD_MAU = ['var(--t1)', 'var(--t2)', 'var(--t3)', 'var(--t4)', 'var(--t5)',
    'var(--gita)', 'var(--gita-do)', 'var(--gita-sang)', 'var(--gita-sau)', 'var(--t2)'];

  function veBanhDa(tu, den) {
    var bd = G.BD_LON || [];
    if (!bd.length) return '';
    return bd.slice(tu, den).map(function (b, i) {
      var idx = tu + i;
      var mau = BD_MAU[idx % BD_MAU.length];
      var ten = b.ten || b.t || ('Bánh đà ' + (idx + 1));
      return '<button class="nha-bd-o" style="--ac:' + mau + '" data-v="banh-da">' +
        h(ten) + '</button>';
    }).join('');
  }

  G.VIEWS['ngoi-nha'] = function () {
    var o = '<div class="hd"><h2>' + ic('home') + ' Ngôi nhà thịnh vượng</h2>' +
      '<p class="sub">Mỗi gia đình là một ngôi nhà đang được xây — <b>mái</b> là ' +
      'tầm nhìn, <b>nền</b> là văn hoá và kỷ luật, <b>tám ngăn</b> bên trong, và ' +
      '<b>mười bánh đà</b> quay quanh vận hành cả nhà. Kích vào phần nào để mở đúng ' +
      'nội dung phần đó.</p></div>';

    /* VÒNG GITA365 bao quanh cả ngôi nhà, và MƯỜI BÁNH ĐÀ quay quanh —
       năm bánh trên, năm bánh dưới, ôm lấy ngôi nhà. */
    o += '<div class="nha-vong"><span class="nha-vong-nhan">' + ic('star') +
      ' GITA 365</span>';
    o += '<p class="nha-bd-nhan">Mười bánh đà vận hành gia đình thịnh vượng</p>';
    o += '<div class="nha-bd nha-bd-tren">' + veBanhDa(0, 5) + '</div>';

    o += '<div class="nha">';

    /* MÁI — Tầm Nhìn Gia Đình Thịnh Vượng, ở đỉnh nhà */
    o += '<div class="nha-mai">' + veHang('mai', 'nha-o-mai') + '</div>';

    /* THÂN NHÀ — TÁM NGĂN trong bốn bức tường, cửa Hành động ở giữa đáy */
    o += '<div class="nha-than">';
    o += '<div class="nha-luoi nha-luoi-8">' + veHang('ngan', '') + '</div>';
    o += '<div class="nha-cua-hang">' + veHang('cua', 'nha-o-cua') + '</div>';
    o += '</div>';

    /* NỀN MÓNG — Văn hoá · Quy tắc · Thói quen · Kỷ luật, đỡ cả nhà */
    o += '<div class="nha-nen">' + veHang('nen', 'nha-o-nen') + '</div>';

    o += '</div>';   /* .nha */
    o += '<div class="nha-bd nha-bd-duoi">' + veBanhDa(5, 10) + '</div>';
    o += '</div>';   /* .nha-vong */

    o += '<p class="note nha-nhac">Phần nào mờ và có ổ khoá là phòng của một vai ' +
      'khác trong nhà — ví dụ hồ sơ nhà là của phụ huynh. Đăng nhập đúng vai thì ' +
      'phòng ấy mở ra.</p>';

    return o;
  };
})();
