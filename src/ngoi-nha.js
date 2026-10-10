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
  {k:'mai',  o:'mai',  v:'tam-nhin',        ic:'sun',     ten:'Tầm nhìn',            goi:'Tầm Nhìn Gia Đình Thịnh Vượng — 5 đến 20 năm', mau:'var(--gita-sang)', perm:'kh_gia_dinh', anh:'MAI', triet:'Một mái nhà không che mưa bằng ngói, mà bằng một hướng đi cả nhà cùng nhìn thấy.', hoi:'Năm năm nữa, buổi tối của nhà mình sẽ trông thế nào?'},
  {k:'n1',   o:'ngan', v:'cu-hich',         ic:'target',  ten:'Mục tiêu',            goi:'Cú hích lớn của nhà mình', mau:'var(--t1)', perm:'kh_gia_dinh', chang:'T1', anh:'P1', triet:'Mong muốn có ngày, có người làm, có bước đầu tiên — lúc ấy nó mới thành mục tiêu.', hoi:'Mong muốn nào của nhà mình đã nằm im lâu nhất?'},
  {k:'n2',   o:'ngan', v:'buc-tranh',       ic:'sun',     ten:'Hành Trình Hạnh Phúc',goi:'Bức tranh hành trình — nhánh nào đang cần tưới', mau:'var(--t2)', chang:'T3', anh:'P2', triet:'Niềm vui được nhìn thấy thì ở lại; niềm vui không ai nhìn thấy thì trôi đi cùng cái mệt.', hoi:'Tuần này, lúc nào mình thấy nhà mình vui nhất?'},
  {k:'n3',   o:'ngan', v:'ban-do-ca-nhan',  ic:'seed',    ten:'Phát triển Bản Thân', goi:'Bản đồ cá nhân — tại sao → tài năng → lộ trình', mau:'var(--t4)', chang:'T2', anh:'P3', triet:'Con học theo người lớn đang học, không học theo lời người lớn dặn.', hoi:'Điều gì trong giấc mơ hồi nhỏ của bố mẹ vẫn còn đến hôm nay?'},
  {k:'n4',   o:'ngan', v:'chan-dung-nha',   ic:'star',    ten:'Tài năng Thành viên', goi:'Chân dung từng thành viên thật sự là ai', mau:'var(--t3)', perm:'kh_gia_dinh', chang:'T2', anh:'P4', triet:'Mỗi người mang một tài năng chờ được gọi tên — muốn gọi được thì phải gỡ cái nhãn cũ xuống.', hoi:'Việc gì làm mình quên cả giờ ăn mà xong vẫn thấy vui?'},
  {k:'n5',   o:'ngan', v:'chuyen-hoa',      ic:'heart',   ten:'Giá trị Sống',        goi:'Bảy chuyển dịch làm nên một gia đình khác', mau:'var(--gita-do)', chang:'T4', anh:'P5', triet:'Giá trị của một nhà không nằm trên tường, mà nằm trong một tối thứ tư bình thường.', hoi:'Người lạ ở nhà mình một tuần sẽ nói nhà mình coi trọng điều gì?'},
  {k:'n6',   o:'ngan', v:'chin-vai',        ic:'shield',  ten:'Phẩm Chất Thành Viên',goi:'Chín vai mỗi người giữ trong nhà', mau:'var(--gita)', perm:'kh_gia_dinh', chang:'T4', anh:'P6', triet:'Một ngôi nhà vững khi việc nào cũng có ít nhất hai người biết làm.', hoi:'Việc nào mà một người vắng ba ngày thì không ai biết làm?'},
  {k:'n7',   o:'ngan', v:'vinh-danh',       ic:'crown',   ten:'Vinh Danh Ghi Nhận',  goi:'Vinh danh & kỳ tích của năm', mau:'var(--t5)', chang:'T5', anh:'P7', triet:'Điều được ghi nhận thì lớn lên; điều chỉ bị nhắc lỗi thì co lại.', hoi:'Việc nhỏ nào tuần này mình thấy mà chưa kịp nói ra?'},
  {k:'n8',   o:'ngan', v:'bang-so',         ic:'chart',   ten:'Tiêu Chuẩn Sống',     goi:'Bảng số gia đình — chuẩn sống đo được', mau:'var(--gita-sau)', perm:'kh_gia_dinh', chang:'T5', anh:'P8', triet:'Chuẩn sống nói thành lời thì cả nhà cùng giữ; nằm trong đầu thì mỗi người một bản.', hoi:'Một ngày bình thường, nhà mình muốn trông và nghe như thế nào?'},
  {k:'cua',  o:'cua',  v:'hom-nay',         ic:'home',    ten:'Hành động',           goi:'Việc của tối nay — một việc thôi', mau:'var(--gita-sau)', anh:'CUA', triet:'Tầm nhìn lớn tới đâu cũng chỉ thành thật qua một việc nhỏ tối nay.', hoi:'Việc nào nhà mình hay nói “mai làm” nhất?'},
  {k:'nen',  o:'nen',  v:'thoi-quen',       ic:'ritual',  ten:'Nền móng',            goi:'Văn hoá · quy tắc · thói quen · kỷ luật', mau:'var(--gita-sau)', perm:'kh_gia_dinh', anh:'NEN', triet:'Nếp nhà là thứ làm mỗi ngày mà không cần ai nhắc — móng của mọi điều lớn.', hoi:'Câu nào nhà mình nói đi nói lại mà chẳng ai nghe nữa?'}
];

/* CD-03b · đọc data-* rồi gọi con đường theo chặng. Đọc dataset là ngữ
   cảnh THUỘC TÍNH (h() đúng ở đây), không phải chuỗi JS — không có chỗ
   cho một dấu nháy phá literal. */
G.nhaMoChang = function (el) {
  if (!el || typeof G.cdMoTheoChang !== 'function') return;
  G.cdMoTheoChang(el.getAttribute('data-chang'), el.getAttribute('data-vp'),
    el.getAttribute('data-vpten') || '');
};

/* ══ VÒNG BÁNH ĐÀ: QUAY HAY DỪNG ══ (chủ hệ 10/10/2026: "vòng tròn bên
   trong đang dừng không chuyển động")
   Đo trên máy thật: vòng VẪN quay — nó chỉ dừng khi máy bật "giảm chuyển
   động" (Windows: Settings → Accessibility → Visual effects → Animation
   effects TẮT; nhiều laptop tắt sẵn để tiết kiệm pin). CSS tôn trọng lời
   xin ấy, nên người xem thấy một vòng đứng yên mà không biết vì sao.
   Nay: máy xin giảm chuyển động → vòng QUAY CHẬM (240 giây/vòng) thay vì
   dừng hẳn; rê chuột/Tab vào bánh là đứng lại; nút "Dừng" luôn có. Người
   dùng tự chọn trong app thì lựa chọn ấy thắng — "Cho quay" là đủ nhịp 60
   giây dù máy xin giảm, "Dừng" là đứng yên. Không nhớ được (trình duyệt
   chặn lưu) thì theo mặc định, không vỡ màn. */
var KHOA_QUAY = 'gita.nhaQuay';
G.nhaCheDoQuay = function () {
  try { var v = localStorage.getItem(KHOA_QUAY); if (v === 'quay' || v === 'dung') return v; } catch (e) {}
  return '';
};
G.nhaMayGiamDong = function () {
  return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
};
G.nhaDangQuay = function () { return G.nhaCheDoQuay() !== 'dung'; };
G.nhaDoiQuay = function () {
  var moi = G.nhaDangQuay() ? 'dung' : 'quay';
  try { localStorage.setItem(KHOA_QUAY, moi); } catch (e) {}
  /* Đổi lớp tại chỗ — không dựng lại cả màn (dựng lại là vòng nhảy về góc 0). */
  var vong = document.querySelector('.nha-ring');
  if (vong) { vong.classList.toggle('nha-quay', moi === 'quay'); vong.classList.toggle('nha-dung', moi === 'dung'); }
  /* Thay khối nút rồi TRẢ tiêu điểm về nút mới — thay outerHTML mà không trả
     thì người dùng bàn phím / trình đọc màn hình bị đẩy về đầu trang. */
  var nut = document.querySelector('.nha-quay-nut');
  if (nut) { nut.outerHTML = G.nhaNutQuay(); var moi = document.querySelector('.nha-quay-nut button'); if (moi && moi.focus) moi.focus(); }
};
/* Máy xin giảm chuyển động mà người dùng muốn đủ nhịp 60 giây: chọn "quay". */
G.nhaQuayNhanh = function () {
  try { localStorage.setItem(KHOA_QUAY, 'quay'); } catch (e) {}
  var vong = document.querySelector('.nha-ring');
  if (vong) { vong.classList.add('nha-quay'); vong.classList.remove('nha-dung'); }
  var nut = document.querySelector('.nha-quay-nut');
  if (nut) { nut.outerHTML = G.nhaNutQuay(); var moi = document.querySelector('.nha-quay-nut button'); if (moi && moi.focus) moi.focus(); }
};
G.nhaNutQuay = function () {
  var ic = G.U.ic, quay = G.nhaDangQuay();
  /* Nhãn đổi theo trạng thái, KHÔNG kèm aria-pressed: "Dừng…, đã nhấn" đọc
     lên không rõ vòng đang quay hay đã dừng. Trạng thái nói bằng chữ. */
  return '<div class="nha-quay-nut"><button type="button" class="btn sm" onclick="G.nhaDoiQuay()">' +
    ic(quay ? 'x' : 'spark') + (quay ? ' Dừng vòng bánh đà' : ' Cho vòng bánh đà quay') + '</button>' +
    (quay && G.nhaMayGiamDong() && G.nhaCheDoQuay() !== 'quay'
      ? '<button type="button" class="btn sm" onclick="G.nhaQuayNhanh()">Quay đủ nhịp</button>' +
        '<span class="tiny muted">Máy đang bật "giảm chuyển động" nên vòng quay chậm.</span>' : '') + '</div>';
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
      /* 9.99.254 — Mười bánh đà GẮN TRÊN VÒNG TRÒN, quay quanh ngôi nhà.
         Vị trí đặt bằng số lúc render (cos/sin): -90° = đỉnh, mỗi bánh
         +36°. Vòng (.nha-ring-nodes) quay; CSS cho mỗi bánh COUNTER-QUAY
         cùng tốc độ ngược chiều (animation nhaGiu) nên CHỮ LUÔN THẲNG khi
         vòng quay — sửa đúng lỗi lần trước (chỉ xoay tĩnh một lần → lộn
         ngược). Khổ hẹp: CSS cho slot về luồng thường → bánh thành hàng
         huy hiệu phẳng, vẫn đọc & bấm được. */
      var goc = (idx * 36 - 90) * Math.PI / 180;
      var x = (50 + 37 * Math.cos(goc)).toFixed(2);
      var y = (50 + 37 * Math.sin(goc)).toFixed(2);
      return '<span class="nha-bd-slot" style="left:' + x + '%;top:' + y + '%">' +
        '<button class="nha-bd-o" style="--ac:' + mau + '" data-v="banh-da">' +
        '<span class="nha-bd-ic">' + ic(b.ic) + '</span>' +
        '<span class="nha-bd-ten">' + h(ten) + '</span></button></span>';
    }).join('');
  }

  /* ══ MƯỜI MỘT KHÔNG GIAN — mỗi phòng một triết lý (V50, 10/10/2026) ══
     Con dấu ở trên trả lời "nhà mình gồm những gì"; khối này trả lời "vì
     sao phòng ấy quan trọng". Mỗi thẻ: ảnh một gia đình thật đang sống
     trong không gian ấy · một câu triết lý · một câu hỏi để cả nhà nói với
     nhau TỐI NAY. Câu hỏi lấy từ cẩm nang cấp 1 của chính ô ấy (kho Ngôi
     nhà) — thứ khách đọc ở đây và thứ coach dẫn ở buổi gặp là một giọng.
     Ảnh chỉ hiện khi tệp ĐÃ có trong assets (G.NHA_ANH khai mã → mô tả):
     một thẻ trỏ vào ảnh chưa có là một ô vỡ, tệ hơn một thẻ không ảnh. */
  G.NHA_ANH = G.NHA_ANH || {};
  function veKhongGian() {
    var ds = G.NHA_PHAN.filter(function (p) { return p.triet; });
    if (!ds.length) return '';
    var o = '<section class="nha-kg" aria-labelledby="nha-kg-tieu">' +
      '<div class="nha-kg-dau"><span class="nha-kg-eb">Mười một không gian</span>' +
      '<h3 id="nha-kg-tieu">Mỗi phòng một triết lý sống</h3>' +
      '<p>Một ngôi nhà thịnh vượng không dựng trong một ngày. Nó dựng từ những tối bình thường, khi cả nhà ' +
      'ngồi lại và trả lời thật một câu hỏi. Chọn một phòng, đọc câu hỏi, và nói với nhau tối nay.</p></div>' +
      '<div class="nha-kg-luoi">';
    ds.forEach(function (p) {
      var mau = /^var\(--[a-z0-9-]+\)$/.test(String(p.mau || '')) ? p.mau : 'var(--gita)';
      var alt = p.anh && G.NHA_ANH[p.anh];
      var nut;
      if (moDuoc(p)) {
        nut = p.chang
          ? '<button class="btn nha-kg-nut" data-chang="' + h(p.chang) + '" data-vp="' + h(p.v) + '" data-vpten="' + h(p.ten) +
            '" onclick="G.nhaMoChang(this)">Bước vào ' + h(p.ten) + ' ' + ic('arrow') + '</button>'
          : '<button class="btn nha-kg-nut" data-v="' + h(p.v) + '">Bước vào ' + h(p.ten) + ' ' + ic('arrow') + '</button>';
      } else {
        nut = '<span class="nha-kg-khoa">' + ic('lock') + ' Phòng mở theo vai của gia đình</span>';
      }
      o += '<article class="nha-kg-o' + (alt ? '' : ' khong-anh') + '" style="--ac:' + mau + '">' +
        (alt ? '<div class="nha-kg-anh"><img src="assets/anh-nha/' + h(p.anh) + '.webp" alt="' + h(alt) +
          '" loading="lazy" decoding="async" width="1152" height="768"></div>' : '') +
        '<div class="nha-kg-than">' +
        '<span class="nha-kg-cho">' + h(p.o === 'mai' ? 'Mái nhà' : p.o === 'cua' ? 'Cửa chính' : p.o === 'nen' ? 'Nền móng' : 'Phòng' + (p.chang ? ' · chặng ' + p.chang : '')) + '</span>' +
        '<h4>' + h(p.ten) + '</h4>' +
        '<p class="nha-kg-triet">' + h(p.triet) + '</p>' +
        '<p class="nha-kg-hoi"><b>Câu hỏi tối nay</b>' + h(p.hoi) + '</p>' +
        nut + '</div></article>';
    });
    return o + '</div></section>';
  }

  /* ══ MƯỜI BÁNH ĐÀ — mỗi bánh một vòng tự quay ══
     Bánh đà không phải một việc, nó là một VÒNG: làm → thấy → tin → làm
     tiếp dễ hơn. Thẻ nói đúng vòng ấy (ô `vong` của G.BD_LON), không kể
     lại chín bước nhỏ — chi tiết sống ở màn Mười bánh đà. Ảnh theo mã
     B01…B10 = thứ tự trong kho. */
  function veBanhDaKG() {
    var bd = G.BD_LON || [];
    if (!bd.length) return '';
    var o = '<section class="nha-kg nha-kg-bd" aria-labelledby="nha-bd-tieu">' +
      '<div class="nha-kg-dau"><span class="nha-kg-eb">Mười bánh đà</span>' +
      '<h3 id="nha-bd-tieu">Thứ giữ cho ngôi nhà tự vận hành</h3>' +
      '<p>Một thói quen tốt mà phải nhắc mỗi ngày thì chưa phải bánh đà. Bánh đà là vòng tự quay: làm, thấy được ' +
      'kết quả, tin hơn, và lần sau làm dễ hơn. Mười vòng ấy quay quanh ngôi nhà, đẩy cả nhà đi lên từng chặng.</p></div>' +
      '<div class="nha-kg-luoi">';
    bd.forEach(function (b, i) {
      var ma = 'B' + (i < 9 ? '0' : '') + (i + 1), alt = G.NHA_ANH[ma];
      var mau = BD_MAU[i % BD_MAU.length];
      o += '<article class="nha-kg-o' + (alt ? '' : ' khong-anh') + '" style="--ac:' + mau + '">' +
        (alt ? '<div class="nha-kg-anh"><img src="assets/anh-nha/' + ma + '.webp" alt="' + h(alt) +
          '" loading="lazy" decoding="async" width="1152" height="768"></div>' : '') +
        '<div class="nha-kg-than"><span class="nha-kg-cho">Bánh đà ' + (i + 1) + (b.tang ? ' · chặng ' + h(b.tang) : '') + '</span>' +
        '<h4>' + h(b.ten || ('Bánh đà ' + (i + 1))) + '</h4>' +
        (b.vong ? '<p class="nha-kg-triet">' + h(b.vong) + '</p>' : '') +
        '<button class="btn nha-kg-nut" data-v="banh-da">Mở bánh đà ' + ic('arrow') + '</button></div></article>';
    });
    return o + '</div></section>';
  }

  G.VIEWS['ngoi-nha'] = function () {
    var o = '<div class="hd"><h2>' + ic('home') + ' Ngôi nhà thịnh vượng</h2>' +
      '<p class="sub">Kích vào từng phần để mở nội dung.</p></div>';

    /* VÒNG GITA365 bao quanh cả ngôi nhà, và MƯỜI BÁNH ĐÀ quay quanh —
       năm bánh trên, năm bánh dưới, ôm lấy ngôi nhà. */
    var bdHtml = veBanhDa(0, 10);
    o += '<div class="nha-vong"><span class="nha-vong-nhan">' + ic('star') +
      ' GITA 365</span>';
    /* Có bánh đà (kho nền đã mở) thì mới treo nhãn — nhãn mà không có
       bánh nào bên dưới là một lời hứa trống. */
    if (bdHtml) o += '<p class="nha-bd-nhan">Mười bánh đà quay quanh vận hành cả nhà</p>' + G.nhaNutQuay();
    var cd = G.nhaCheDoQuay();
    o += '<div class="nha-ring' + (cd === 'quay' ? ' nha-quay' : cd === 'dung' ? ' nha-dung' : '') + '">';
    /* VÒNG NGOÀI — khẩu hiệu chạy quanh con dấu thịnh vượng. Dùng SVG
       textPath (một vòng tròn, chữ bám theo), ĐỨNG YÊN để đọc được; chỉ
       vòng bánh đà bên trong mới quay.
       LUÔN DỰNG — đây là nhận diện của ngôi nhà, không phụ thuộc kho nội
       dung đã nạp hay chưa; thiếu kho thì chỉ thiếu MƯỜI BÁNH ĐÀ bên
       trong, hai vòng tròn vẫn còn. (CSS @container vẫn ẩn vòng khi cột
       quá hẹp để tránh tràn trên điện thoại.) */
    o += '<svg class="nha-khauhieu" viewBox="0 0 1000 1000" aria-hidden="true" focusable="false">' +
      '<defs><path id="nhaVongChu" fill="none" d="M500,500 m-470,0 a470,470 0 1,1 940,0 a470,470 0 1,1 -940,0"/></defs>' +
      /* textLength = chu vi vòng (2·π·470 ≈ 2953) + lengthAdjust="spacing"
         → chữ GIÃN ĐỀU phủ TRỌN 360°, không còn khoảng khuyết. Bốn cụm
         (thêm HỆ SINH THÁI GITA) ngăn bằng sao, cụm cuối nối về cụm đầu. */
      '<text><textPath href="#nhaVongChu" startOffset="0" textLength="2953" lengthAdjust="spacing">' +
      'KIẾN TẠO GIA ĐÌNH THỊNH VƯỢNG ★ LÀM CHỦ KỶ NGUYÊN VƯƠN MÌNH ★ NÂNG TẦM TRÍ TUỆ VÀNG VIỆT NAM ★ HỆ SINH THÁI GITA ★ ' +
      '</textPath></text></svg>';
    o += '<div class="nha-bd nha-ring-nodes">' + bdHtml + '</div>';

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
    o += '</div>';   /* .nha-ring */
    o += '</div>';   /* .nha-vong */

    o += '<p class="note nha-nhac">' + ic('lock') +
      ' Phần mờ là phòng của vai khác — đăng nhập đúng vai thì mở.</p>';

    o += veKhongGian();
    o += veBanhDaKG();

    /* BÀN CỜ 365 NGÀY — đặt NGAY DƯỚI ngôi nhà. Gia đình mở nhà ra là
       thấy hành trình của mình ngay bên dưới; các vai khác thấy bàn cờ
       điều hướng theo phạm vi của mình. Thân bàn cờ tự lọc theo quyền
       (G.allowed), nên không lộ màn ngoài quyền. */
    if (typeof G.banCoThan === 'function') {
      var lvNha = ((G.S && G.S.roleObj) || {}).lv || 15;
      o += '<div class="hd nha-banco-hd"><h2>' + ic('grid') + ' ' +
        (lvNha >= 13 ? 'Bàn cờ 365 ngày — hành trình của nhà mình' : 'Bàn cờ điều hướng') + '</h2>' +
        '<p class="sub">' + (lvNha >= 13
          ? 'Năm chặng theo 365 ngày — bấm một ô để mở đúng màn.'
          : 'Mở từng tab một, theo đúng phạm vi của bạn.') + '</p></div>';
      o += '<div class="nha-banco">' + G.banCoThan() + '</div>';
    }

    return o;
  };
})();
