/* ═══════════════════════════════════════════════════════════════
   GITA 365 · 9.99.125 — Ô CHAT TRỢ LÝ NỔI Ở GÓC

   Chủ hệ: "Phần AI hiển thị như một ô chat ở góc bên phải, rộng ~5cm ×
   cao ~8cm trên máy tính, điện thoại cân đối tỷ lệ; bấm ký hiệu phóng to
   thì mở FULL. Giảm phần dư thừa để đỡ rối mắt khách hàng."

   Ô nổi này KHÔNG dựng lại bộ chat — nó TRỎ vào bộ đã có ở tro-ly-chat.js:
   cùng G.chatHoi, cùng transcript (G.chatCuon), cùng lời chào và lịch sử
   (G.CHAT). Dựng bản thứ hai của cuộc trò chuyện là một chỗ để hai bên
   lệch nhau. `ve()` bên kia cập nhật MỌI .ch-khung, nên gửi ở ô nổi thì
   khung tự đầy.

   Ba trạng thái (9.99.225, theo chủ hệ): ô thanh tiêu đề nhỏ ≈1,5cm (thu
   gọn) · ô chat ở góc (phóng to để chat) · phủ KÍN cả màn hình (phóng
   full). Thêm một đường "ẩn hẳn" về mép phải. Ẩn khi chưa đăng nhập và khi
   đang ở chính màn "tro-ly" đầy đủ — để không có hai #ch-khung cùng lúc.
   Kích thước ba trạng thái đặt ở CSS (--tln-thu · --tln-rong · .tln-to),
   phù hợp máy tính · điện thoại · iPad bằng các @media riêng.

   Vì sao ~5cm không đặt cứng thành 189px: một dòng tiếng Việt cần bề
   ngang để không gãy chữ, nên ô nhỏ đặt 300px (đủ đọc một câu) — nhỏ hơn
   thì mỗi câu tụt bốn dòng, rối hơn chứ không gọn hơn. Muốn đúng 5cm thì
   đổi --tln-rong; nút phóng to là chỗ để đọc dài. */
'use strict';
var G = window.G || {}; window.G = G;

(function () {
  var U = G.U, h = U.h, ic = U.ic;

  function khDN() { return !!(G.S && G.S.acc); }          /* đã đăng nhập */
  function oManTroLy() { return (G.S && G.S.view) === 'tro-ly'; }

  /* ── Dựng ô nổi một lần, treo vào body để sống qua mọi lần vẽ lại #main
        và mọi lần dựng lại vỏ (#app). Idempotent: gọi lại thì thôi. ── */
  G.tlnMount = function () {
    if (typeof document === 'undefined') return;
    if (document.getElementById('tln')) return;
    var el = document.createElement('div');
    el.id = 'tln';
    el.setAttribute('aria-live', 'polite');
    el.innerHTML =
      '<button class="tln-fab" data-tln="mo" aria-label="Mở trợ lý GITA" title="Hỏi trợ lý GITA">' +
        ic('spark') + '<span class="tln-fab-cham"></span></button>' +
      '<section class="tln-panel" id="tlnPanel" role="dialog" aria-label="Trợ lý GITA" hidden>' +
        '<header class="tln-dau">' +
          '<span class="tln-anh">' + ic('spark') + '</span>' +
          '<span class="tln-ten"><b>Trợ lý GITA</b>' +
            '<span class="tln-duoi"><span class="tln-cham"></span>đang nghe</span></span>' +
          '<button class="tln-nut" data-tln="to" id="tlnToBtn" aria-label="Phóng full màn hình" ' +
            'title="Phóng full màn hình">' + ic('zoom') + '</button>' +
          '<button class="tln-nut" data-tln="dong" aria-label="Thu gọn" ' +
            'title="Thu gọn về ô thanh tiêu đề nhỏ">' + ic('minus') + '</button>' +
          '<button class="tln-nut" data-tln="an" aria-label="Ẩn trợ lý" ' +
            'title="Ẩn hẳn — hiện lại ở mép phải màn">' + ic('x') + '</button>' +
        '</header>' +
        '<div id="chKhungNoi" class="ch-khung tln-cuon"></div>' +
        '<div class="tln-goiy" id="tlnGoiy"></div>' +
        '<div class="tln-go">' +
          '<textarea id="aiQNoi" rows="1" autocomplete="off" ' +
            'placeholder="Nhà mình đang mắc chuyện gì?"></textarea>' +
          '<button class="tln-gui" data-tln="gui" aria-label="Gửi">' + ic('arrow') + '</button>' +
        '</div>' +
      '</section>' +
      /* Mép hiện lại: khi đã ẩn hẳn, một vạch nhỏ nép mép phải để gọi trợ
         lý về — ẩn không phải là mất, chỉ là dẹp sang bên khi đang cần chỗ. */
      '<button class="tln-he" data-tln="hien" aria-label="Hiện trợ lý GITA" ' +
        'title="Hiện trợ lý GITA">' + ic('spark') + '<span>Trợ lý</span></button>';
    document.body.appendChild(el);
  };

  /* Nhớ ý muốn ẩn theo máy (tiện cho từng người xem), bọc try/catch vì chế
     độ riêng tư có thể chặn localStorage. Ẩn là lựa chọn của người dùng nên
     giữ qua các lần vẽ lại; không đồng bộ lên máy chủ. */
  function daAn() { try { return localStorage.getItem('tlnAn') === '1'; } catch (e) { return false; } }
  function ghiAn(v) { try { v ? localStorage.setItem('tlnAn', '1') : localStorage.removeItem('tlnAn'); } catch (e) {} }
  function an() {
    var el = document.getElementById('tln'); if (!el) return;
    dongPanel(); el.classList.add('tln-an'); ghiAn(true);
  }
  function hien() {
    var el = document.getElementById('tln'); if (!el) return;
    el.classList.remove('tln-an'); ghiAn(false);
  }

  /* ── Ẩn/hiện theo phiên và theo màn ── */
  G.tlnCap = function () {
    var el = document.getElementById('tln');
    if (!el) return;
    /* Chưa đăng nhập, hoặc đang ở chính màn trợ lý đầy đủ → giấu hẳn ô
       nổi (tránh hai khung chat cùng id-lớp). */
    if (!khDN() || oManTroLy()) { el.style.display = 'none'; dongPanel(); return; }
    el.style.display = '';
    /* Áp lại ý muốn ẩn đã nhớ — nếu người dùng đã ẩn thì chỉ còn vạch mép. */
    el.classList.toggle('tln-an', daAn());
  };

  function moPanel() {
    G.tlnMount();
    var p = document.getElementById('tlnPanel');
    if (!p) return;
    p.hidden = false;
    document.getElementById('tln').classList.add('tln-open');
    /* Chủ động xưng theo tên tài khoản: dòng dưới tiêu đề đổi thành tên
       người đang chat, để trợ lý nói với ĐÚNG người (chủ hệ yêu cầu). */
    var duoi = document.querySelector('#tlnPanel .tln-duoi');
    var ten = (G.S && G.S.acc && G.S.acc.ten) || '';
    if (duoi) duoi.innerHTML = '<span class="tln-cham"></span>đang nghe' +
      (ten ? ' · cùng ' + h(ten) : '');
    napGoiy();
    if (G.veChat) G.veChat(); else napKhung();
    setTimeout(function () {
      var i = document.getElementById('aiQNoi'); if (i) i.focus();
      var k = document.getElementById('chKhungNoi'); if (k) k.scrollTop = k.scrollHeight;
    }, 0);
  }
  function dongPanel() {
    var el = document.getElementById('tln'); if (!el) return;
    el.classList.remove('tln-open', 'tln-to');
    var p = document.getElementById('tlnPanel'); if (p) p.hidden = true;
    document.body.classList.remove('tln-khoa');
  }
  function phong() {
    var el = document.getElementById('tln'); if (!el) return;
    var to = el.classList.toggle('tln-to');
    document.body.classList.toggle('tln-khoa', to);   /* khoá cuộn nền khi phủ kín */
    var b = document.getElementById('tlnToBtn');
    if (b) { b.setAttribute('title', to ? 'Thu về ô chat' : 'Phóng full màn hình');
             b.setAttribute('aria-label', to ? 'Thu về ô chat' : 'Phóng full màn hình'); }
    var k = document.getElementById('chKhungNoi'); if (k) k.scrollTop = k.scrollHeight;
  }

  function napKhung() {
    var k = document.getElementById('chKhungNoi');
    if (k && G.chatCuon) { k.innerHTML = G.chatCuon(); k.scrollTop = k.scrollHeight; }
  }
  function napGoiy() {
    var g = document.getElementById('tlnGoiy');
    if (!g || !G.chatGoiY) return;
    /* Chỉ hiện gợi ý khi chưa có lượt nào — đỡ rối, đúng tinh thần "giảm
       phần dư thừa". Có chuyện rồi thì ô gõ là chính. */
    if (G.CHAT && G.CHAT.length) { g.innerHTML = ''; return; }
    g.innerHTML = G.chatGoiY().slice(0, 3).map(function (q) {
      return '<button class="tln-chip" data-aiq="' + h(q) + '">' + h(q) + '</button>';
    }).join('');
  }

  function guiNoi() {
    var i = document.getElementById('aiQNoi'); if (!i) return;
    var v = String(i.value || '').trim(); if (!v) return;
    if (G.chatHoi) G.chatHoi(v);      /* G.chatHoi → ve() cập nhật #chKhungNoi */
    i.value = ''; caoNoi(i); napGoiy();
  }
  function caoNoi(el) {
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 96) + 'px';
  }

  /* ── Bấm: uỷ nhiệm trên #tln. Chip gợi ý (data-aiq) đã có bộ bắt chung
        ở tro-ly-chat.js — nó gọi G.chatHoi, nên ở đây chỉ lo mở/đóng/phóng/gửi.
        Sau một chip, dọn lại gợi ý cho gọn. ── */
  document.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('[data-tln]');
    if (t) {
      var act = t.getAttribute('data-tln');
      if (act === 'mo') { hien(); moPanel(); }
      else if (act === 'dong') dongPanel();
      else if (act === 'to') phong();
      else if (act === 'an') an();
      else if (act === 'hien') { hien(); moPanel(); }
      else if (act === 'gui') guiNoi();
      return;
    }
    /* Chip trong ô nổi: bộ bắt chung đã gửi câu; ở đây chỉ dọn gợi ý. */
    if (e.target.closest && e.target.closest('#tlnGoiy [data-aiq]')) {
      setTimeout(napGoiy, 0);
      return;
    }
    /* Chạm RA NGOÀI ô nổi khi đang mở → thu gọn. Để khách bấm nhầm ra nền
       là đóng được ngay, không phải đi tìm nút X. Chỉ khi panel đang mở. */
    var el = document.getElementById('tln');
    if (el && el.classList.contains('tln-open') &&
        !(e.target.closest && e.target.closest('#tln'))) {
      dongPanel();
    }
  });

  document.addEventListener('keydown', function (e) {
    /* Esc → thu gọn ô nổi (đường đóng thứ ba, cạnh nút X và chạm ngoài). */
    if (e.key === 'Escape') {
      var el = document.getElementById('tln');
      if (el && el.classList.contains('tln-open')) { e.preventDefault(); dongPanel(); }
      return;
    }
    if (e.key !== 'Enter' || e.shiftKey) return;
    var i = document.getElementById('aiQNoi');
    if (!i || document.activeElement !== i) return;
    e.preventDefault(); guiNoi();
  });
  document.addEventListener('input', function (e) {
    if (e.target && e.target.id === 'aiQNoi') caoNoi(e.target);
  });
})();
