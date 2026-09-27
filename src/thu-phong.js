/* ═══════════════════════════════════════════════════════════════
   GITA 365 — THU PHÓNG VÀ KHỔ HIỂN THỊ

   ══ HAI CHUYỆN KHÁC NHAU, HAY BỊ GỘP LÀM MỘT ══

   Trên điện thoại, trình duyệt vẫn cho chụm hai ngón để phóng to — kho
   này không chặn, và không nên chặn. Nhưng phóng to chỉ đi được MỘT
   chiều: nó không cho nhìn RỘNG hơn, vì trang đã khai
   `width=device-width`, tức là bố cục luôn dựng đúng bằng bề ngang máy.

   Nên người cầm điện thoại không bao giờ thấy được toàn cảnh một bảng
   rộng hay một màn nhiều cột. Họ chỉ thấy bản một cột, cuộn rất dài, và
   muốn tra cứu thì phải nhớ phần đã cuộn qua.

   Hai núm ở đây tách đúng hai chuyện ấy:

     KHỔ  — bố cục dựng theo bề ngang nào.
            "Vừa màn" là bản điện thoại, một cột, chữ to, đọc dễ.
            "Toàn cảnh" dựng bố cục 1280px rồi để trình duyệt thu cả
            trang cho vừa màn — thấy TRỌN bảng, trọn các cột, rồi chụm
            ngón tay phóng vào chỗ cần đọc.

     CỠ   — phóng to hay thu nhỏ mọi thứ, như núm phóng của trình duyệt.
            Chạy trên cả máy tính lẫn điện thoại.

   ══ VÌ SAO ĐỔI THẺ VIEWPORT CHỨ KHÔNG PHÓNG BẰNG CSS ══

   Thu cả trang bằng `transform: scale()` thì chữ mờ, chỗ bấm lệch khỏi
   chỗ nhìn, và các thẻ `position: fixed` chạy loạn. Đổi `width` của thẻ
   viewport là đúng cái nút "xem bản máy tính" của trình duyệt: bố cục
   dựng lại THẬT ở 1280px, câu truy vấn `@media` đọc đúng 1280, và phần
   thu nhỏ do chính trình duyệt làm — nét, và chụm ngón tay vẫn phóng
   vào được.

   ══ LƯU RIÊNG, KHÔNG LƯU CHUNG ══

   Cài đặt này lưu ở khoá localStorage riêng, không đi qua sổ phiên
   chung. Vì nó thuộc về CÁI MÁY chứ không thuộc về người: cùng một tài
   khoản mở trên máy tính và trên điện thoại thì hai nơi phải nhớ hai
   lựa chọn khác nhau.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;

(function () {
var U = G.U, h = U.h, ic = U.ic;
var KHOA = 'gita.thuphong';

/* Năm nấc cỡ. Không cho nấc nhỏ hơn 70%: dưới mức ấy chữ nhỏ nhất của
   kho (10,5px) tụt xuống dưới 7,4px và không còn đọc được — cho một nấc
   không đọc được là mời người ta chọn nó rồi tưởng ứng dụng hỏng. */
G.PHONG_NAC = [70, 85, 100, 115, 130, 150];

G.PHONG = { kho: 'vua', muc: 100 };

try {
  var cu = JSON.parse(localStorage.getItem(KHOA) || 'null');
  if (cu && typeof cu === 'object') {
    if (cu.kho === 'vua' || cu.kho === 'toan') G.PHONG.kho = cu.kho;
    if (G.PHONG_NAC.indexOf(cu.muc) >= 0) G.PHONG.muc = cu.muc;
  }
} catch (e) { /* máy chặn localStorage — chạy với mặc định, không báo lỗi */ }

function ghi() {
  try { localStorage.setItem(KHOA, JSON.stringify(G.PHONG)); } catch (e) {}
}

/* Máy này có phải màn chạm không. Hỏi bằng con trỏ chứ không bằng bề
   ngang: một máy bảng 1024px vẫn là ngón tay, còn một cửa sổ hẹp trên
   máy để bàn vẫn là chuột — và núm KHỔ chỉ có nghĩa với màn chạm, vì
   máy để bàn bỏ qua thẻ viewport. */
function laCham() {
  try { return window.matchMedia('(pointer:coarse)').matches; }
  catch (e) { return false; }
}
G.phongLaCham = laCham;

/* Bề ngang THẬT của máy, tính bằng điểm ảnh CSS.

   Cần nó để tự tính tỉ lệ thu. Bản đầu tôi chỉ khai `width=1280` và để
   trình duyệt tự thu cho vừa màn — đúng như cái nút "xem bản máy tính"
   vẫn làm. Thử bằng cách bấm nút thì chạy; thử bằng cách MỞ SẴN chế độ
   ấy từ lúc tải trang thì không: trang dựng ở 1280px và nằm nguyên ở
   tỉ lệ 1:1, người dùng chỉ thấy góc trên bên trái.
   Một cách làm chạy lúc này mà không chạy lúc khác thì không dùng
   được. Nên tính lấy tỉ lệ, và khai thẳng vào thẻ. */
var BE_NGANG_MAY = 0;
function beNgangMay() {
  if (!BE_NGANG_MAY) {
    BE_NGANG_MAY = (window.screen && window.screen.width) ||
      document.documentElement.clientWidth || 390;
  }
  return BE_NGANG_MAY;
}

var KHO_TOAN = 1280;

/* ── ÁP VÀO TRANG ── */
G.phongVe = function () {
  var m = document.querySelector('meta[name="viewport"]');
  if (m) {
    if (G.PHONG.kho === 'toan') {
      /* `minimum-scale` bằng đúng tỉ lệ vừa màn, để chụm ngón tay thu
         lại được về TRỌN trang chứ không dừng ở 100%. Thiếu nó thì
         phóng vào rồi không thu ra lại được, và người dùng kẹt. */
      /* LÀM TRÒN XUỐNG, không làm tròn gần nhất. Tỉ lệ thật của màn
         390px là 0,3047; làm tròn gần nhất ra 0,305 — lớn hơn vừa đủ
         để mép phải của cột phải bị cắt mất một vệt. Thiếu một chút
         thì còn viền trắng, thừa một chút thì mất chữ. */
      var ti = Math.floor(Math.min(1, beNgangMay() / KHO_TOAN) * 1000) / 1000;
      m.setAttribute('content', 'width=' + KHO_TOAN +
        ', initial-scale=' + ti +
        ', minimum-scale=' + ti + ', viewport-fit=cover');
    } else {
      m.setAttribute('content', 'width=device-width, initial-scale=1, viewport-fit=cover');
    }
  }
  /* `zoom` trên thẻ gốc là phép phóng của chính trình duyệt: bố cục
     tính lại thật, chữ vẫn nét, chỗ bấm vẫn trùng chỗ nhìn. Đặt ở thẻ
     gốc chứ không ở #app, vì mấy thẻ position:fixed nằm trong #app sẽ
     neo sai nếu phóng ở đó. */
  try { document.documentElement.style.zoom = (G.PHONG.muc / 100); } catch (e) {}
  var n = document.getElementById('phong-muc');
  if (n) n.textContent = G.PHONG.muc + '%';
  var b = document.getElementById('phongBtn');
  if (b) b.style.color = (G.PHONG.muc !== 100 || G.PHONG.kho !== 'vua')
    ? 'var(--gold-ink)' : '';
  veBang();
};

G.phongDatKho = function (k) {
  G.PHONG.kho = (k === 'toan') ? 'toan' : 'vua';
  ghi(); G.phongVe();
  U.toast(G.PHONG.kho === 'toan'
    ? 'Toàn cảnh: bố cục dựng ở 1280px rồi thu cho vừa màn. Chụm hai ngón để phóng vào chỗ cần đọc.'
    : 'Vừa màn: bản một cột, chữ to, đọc dễ.', 'ok');
};

G.phongBuoc = function (huong) {
  var i = G.PHONG_NAC.indexOf(G.PHONG.muc);
  if (i < 0) i = G.PHONG_NAC.indexOf(100);
  i = Math.min(G.PHONG_NAC.length - 1, Math.max(0, i + huong));
  G.PHONG.muc = G.PHONG_NAC[i];
  ghi(); G.phongVe();
};

G.phongVeMoc = function () { G.PHONG.kho = 'vua'; G.PHONG.muc = 100; ghi(); G.phongVe(); };

/* ── BẢNG ĐIỀU KHIỂN ──
   Một tấm nhỏ thả xuống ngay dưới thanh trên. Không dùng cửa sổ giữa
   màn: người ta bấm phóng to rồi muốn NHÌN NGAY kết quả, mà một cửa sổ
   giữa màn thì che mất đúng chỗ họ định nhìn. */
function veBang() {
  var o = document.getElementById('phongBang');
  if (!o) return;
  var cham = laCham();
  o.innerHTML =
    (cham
      ? '<div class="ph-nhom"><div class="ph-nhan">KHỔ HIỂN THỊ</div>' +
        '<div class="ph-hang">' +
        '<button class="ph-n' + (G.PHONG.kho === 'vua' ? ' on' : '') + '" ' +
          'data-act="phong-vua">Vừa màn</button>' +
        '<button class="ph-n' + (G.PHONG.kho === 'toan' ? ' on' : '') + '" ' +
          'data-act="phong-toan">Toàn cảnh</button>' +
        '</div>' +
        '<p class="ph-y">' + (G.PHONG.kho === 'toan'
          ? 'Đang dựng bố cục 1280px và thu cho vừa màn — thấy trọn bảng và trọn các cột. Chụm hai ngón để phóng vào chỗ cần đọc.'
          : 'Bản một cột, chữ to. Chuyển sang Toàn cảnh để nhìn trọn một bảng rộng.') +
        '</p></div>'
      : '') +
    '<div class="ph-nhom"><div class="ph-nhan">CỠ HIỂN THỊ</div>' +
      '<div class="ph-hang">' +
      '<button class="ph-n ph-tron" data-act="phong-nho" aria-label="Nhỏ lại">−</button>' +
      '<span id="phong-muc" class="ph-so">' + G.PHONG.muc + '%</span>' +
      '<button class="ph-n ph-tron" data-act="phong-to" aria-label="To lên">+</button>' +
      '<button class="ph-n" data-act="phong-moc">Về 100%</button>' +
      '</div></div>';
}

G.phongMoDong = function () {
  var o = document.getElementById('phongBang');
  if (!o) return;
  var mo = o.classList.toggle('mo');
  if (mo) veBang();
};

/* Bấm ra ngoài thì đóng. Không đóng thì tấm này che mất chỗ vừa phóng
   to, và người dùng phải đi tìm cách đóng nó. */
document.addEventListener('click', function (e) {
  var o = document.getElementById('phongBang');
  if (!o || !o.classList.contains('mo')) return;
  if (o.contains(e.target)) return;
  if (e.target.closest && e.target.closest('#phongBtn')) return;
  o.classList.remove('mo');
});

/* Phím tắt quen tay: Ctrl/Cmd cộng, trừ, số không. Trình duyệt cũng
   bắt mấy phím ấy — nên chỉ chặn khi đang ở trong ứng dụng, và để
   nguyên phép phóng của trình duyệt nếu người ta giữ thêm Shift. */
document.addEventListener('keydown', function (e) {
  if (!(e.ctrlKey || e.metaKey) || e.shiftKey) return;
  if (e.key === '=' || e.key === '+') { e.preventDefault(); G.phongBuoc(1); }
  else if (e.key === '-' || e.key === '_') { e.preventDefault(); G.phongBuoc(-1); }
  else if (e.key === '0') { e.preventDefault(); G.phongVeMoc(); }
});

/* Dựng tấm điều khiển một lần, ngay sau khi trang có thân. */
function dung() {
  if (document.getElementById('phongBang')) return;
  var d = document.createElement('div');
  d.id = 'phongBang';
  d.className = 'ph-bang';
  document.body.appendChild(d);
  veBang();
  G.phongVe();
}
if (document.readyState === 'loading')
  document.addEventListener('DOMContentLoaded', dung);
else dung();

/* Xoay máy thì bề ngang đổi, nên tỉ lệ thu phải tính lại. Không tính
   lại thì xoay ngang xong trang chỉ chiếm hai phần ba màn. */
window.addEventListener('orientationchange', function () {
  BE_NGANG_MAY = 0;
  setTimeout(function () { G.phongVe(); }, 250);
});

/* Nút trên thanh trên. Trả về chuỗi để topBar() ghép vào — không tự
   chèn vào DOM, vì thanh trên vẽ lại mỗi lần đổi màn và thẻ tự chèn sẽ
   biến mất sau lần vẽ đầu tiên. */
G.phongNut = function () {
  return '<button class="tbtn" id="phongBtn" data-act="phong" ' +
    'aria-label="Thu phóng và khổ hiển thị" ' +
    'title="Thu phóng · khổ hiển thị (Ctrl + / Ctrl −)">' + ic('zoom') + '</button>';
};

})();
