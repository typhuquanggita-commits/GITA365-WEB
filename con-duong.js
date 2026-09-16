/* ═══════════════════════════════════════════════════════════════
   GITA 365 — CON ĐƯỜNG NHIỆM VỤ  (9.99.105)

   Chủ hệ: một người bước trên con đường, chạm từng nhiệm vụ, nhiệm vụ
   hiện ra để hiểu; có cô trợ lý AI dẫn đường.

   ══ LỚP ĐẦU CỦA HÀNH TRÌNH — DỰNG KHUNG TRƯỚC ══

   Đây là lớp đầu: con đường + nhân vật bước + trợ lý dẫn. Nhân vật tuỳ
   biến (bộ tạo nhân vật) và video hướng dẫn là lớp sau — xem sổ chờ.

   ══ ĐỌC DỮ LIỆU THẬT, KHÔNG BỊA NHIỆM VỤ ══

   Mười mốc trên đường LÀ mười bánh đà (G.BD_LON) — mỗi mốc mang sẵn
   `ten · c · ic · tang · vong · y · nho`. Màn này KHÔNG dựng nhiệm vụ
   mới: nó chỉ cho người ta ĐI trên thứ đã có. Chép mười nhiệm vụ vào
   đây là bản thứ hai của một sự thật; kho đổi một bánh thì con đường
   nói sai. Mục 108 canh rằng màn đọc thẳng BD_LON.

   ══ VÌ SAO 2.5D CHỨ CHƯA WEBGL ══

   Một con đường uốn có chiều sâu, vẽ bằng SVG, chạy mượt trên cả web
   lẫn bản .exe, KHÔNG cần tải thư viện nặng, và đo được bằng do-khung-
   man (nút thật, chữ thật). WebGL và ảnh-đại-diện-thành-nhân-vật-3D là
   lớp sau — và phần ảnh vướng Điều 13 (ảnh trẻ không rời hệ), nên nhân
   vật sẽ do BỘ TẠO TẠI CHỖ dựng, không gửi ảnh ra dịch vụ ngoài.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;
G.VIEWS = G.VIEWS || {};

/* ══ CÔ TRỢ LÝ AI CỦA GITA — vẽ TẠI CHỖ, một nguồn duy nhất ══

   Chủ hệ gửi ảnh cô trợ lý AI (áo blouse trắng, tóc dài) làm gương mặt
   dẫn đường. Vẽ bằng SVG NGAY TRONG MÁY — KHÔNG nhúng ảnh raster ngoài,
   KHÔNG gửi gì ra một dịch vụ dựng ảnh: cùng luật Điều 13 với nhân vật
   khách (nvVe). Một nguồn `G.troLyVe(size)` để mọi màn (Con đường, Điều
   phối trợ lý) cùng vẽ MỘT gương mặt — sửa một chỗ, cả hệ đổi theo.

   Chân dung tròn: tóc đen dài, áo blouse trắng, ve áo xanh GITA, một
   chấm đỏ thương hiệu. Màu lấy token khi có (nền, viền); nét minh hoạ
   dùng mã cố định như một logo — không phải ba mã vàng bị cấm. */
G.troLyVe = function (size) {
  var s = size || 72;
  return '<svg class="tl-svg" viewBox="0 0 72 72" width="' + s + '" height="' + s + '" ' +
    'role="img" aria-label="Cô trợ lý AI của GITA">' +
    '<defs><clipPath id="tlClip"><circle cx="36" cy="36" r="34"/></clipPath></defs>' +
    '<circle cx="36" cy="36" r="35" fill="var(--gita-mo-1,#e8f0fb)"/>' +
    '<g clip-path="url(#tlClip)">' +
    /* tóc sau */
    '<path d="M13 36 Q13 9 36 9 Q59 9 59 36 L59 66 Q59 52 50 49 L50 40 Q50 22 36 22 Q22 22 22 40 L22 49 Q13 52 13 66Z" fill="#241a12"/>' +
    /* vai + áo blouse trắng */
    '<path d="M15 72 Q15 53 30 49 L42 49 Q57 53 57 72Z" fill="#ffffff"/>' +
    /* ve áo xanh GITA */
    '<path d="M30 49 L36 63 L30 67 L23 55Z" fill="var(--gita,#185ab4)"/>' +
    '<path d="M42 49 L36 63 L42 67 L49 55Z" fill="var(--gita,#185ab4)"/>' +
    '<path d="M31 49 L36 61 L41 49Z" fill="#eef3f9"/>' +
    /* chấm đỏ thương hiệu trên ve áo */
    '<circle cx="45.5" cy="59" r="2" fill="var(--gita-do,#f61824)"/>' +
    /* cổ */
    '<rect x="31" y="43" width="10" height="9" rx="4" fill="#f0c6a1"/>' +
    /* mặt */
    '<ellipse cx="36" cy="33" rx="13.5" ry="15" fill="#f6d3b0"/>' +
    /* mái tóc trước */
    '<path d="M22 31 Q22 15 36 15 Q50 15 50 31 Q46 23 40 24 Q42 28 36 28 Q30 28 32 24 Q26 23 22 31Z" fill="#241a12"/>' +
    '<path d="M20 30 Q19 46 24 55 L26.5 53 Q22 43 24 32Z" fill="#241a12"/>' +
    '<path d="M52 30 Q53 46 48 55 L45.5 53 Q50 43 48 32Z" fill="#241a12"/>' +
    /* chân mày */
    '<path d="M28 30.5 Q31 28.8 34 30.5" stroke="#3a2c1e" stroke-width="1.1" fill="none" stroke-linecap="round"/>' +
    '<path d="M38 30.5 Q41 28.8 44 30.5" stroke="#3a2c1e" stroke-width="1.1" fill="none" stroke-linecap="round"/>' +
    /* mắt */
    '<circle cx="31" cy="34" r="1.9" fill="#22303f"/><circle cx="41" cy="34" r="1.9" fill="#22303f"/>' +
    '<circle cx="31.6" cy="33.4" r="0.6" fill="#fff"/><circle cx="41.6" cy="33.4" r="0.6" fill="#fff"/>' +
    /* má hồng */
    '<circle cx="27" cy="38" r="2.3" fill="#f2a79e" opacity="0.5"/>' +
    '<circle cx="45" cy="38" r="2.3" fill="#f2a79e" opacity="0.5"/>' +
    /* nụ cười */
    '<path d="M31 40 Q36 44.5 41 40" stroke="#b65a54" stroke-width="1.5" fill="none" stroke-linecap="round"/>' +
    '</g>' +
    '<circle cx="36" cy="36" r="35" fill="none" stroke="var(--gita,#185ab4)" stroke-width="2"/>' +
    '</svg>';
};

(function () {
  var U = G.U, h = U.h, ic = U.ic;

  G.cdBuoc = 0;      /* mốc nhân vật đang đứng, chỉ mục trong danh sách ĐANG lọc */
  G.cdTang = 'all';  /* CD-03: lọc con đường theo chặng T1..T5, hoặc 'all' */
  G.cdTour = false;  /* CD-02: đang chạy chế độ tự dẫn */
  G.cdTimer = null;
  G.cdVaoPhong = null; /* CD-03b: {v,ten} phòng Ngôi nhà đã mở con đường này */

  /* Mốc trên đường LÀ bánh đà. Lọc theo chặng lúc đọc — không giữ một
     bản danh sách thứ hai (cùng luật cột-tính-lúc-đọc). */
  function moc() {
    var bd = G.BD_LON || [];
    if (G.cdTang && G.cdTang !== 'all')
      return bd.filter(function (b) { return b.tang === G.cdTang; });
    return bd;
  }

  function veLai() {
    if (!G.S || G.S.view !== 'con-duong') return;
    if (typeof document === 'undefined' || !document.getElementById('main')) return;
    G.render && G.render();
  }

  /* CD-02 · dừng chế độ tự dẫn — gọi khi người tự bấm, khi đổi chặng,
     và khi rời màn (timer tự kiểm view rồi tự tắt). */
  function dungTour() {
    if (G.cdTimer) { clearInterval(G.cdTimer); G.cdTimer = null; }
    G.cdTour = false;
  }

  G.cdDi = function (delta) {
    dungTour();
    var n = moc().length; if (!n) return;
    G.cdBuoc = Math.max(0, Math.min(n - 1, G.cdBuoc + delta));
    veLai();
  };
  G.cdChon = function (i) {
    dungTour();
    var n = moc().length; if (!n) return;
    G.cdBuoc = Math.max(0, Math.min(n - 1, i | 0));
    veLai();
  };

  /* CD-03 · đổi chặng: đặt lại về mốc đầu của chặng ấy. Người TỰ đổi
     chặng thì nút "Vào phòng" của phòng cũ hết đúng — xoá đi. */
  G.cdLoc = function (tang) {
    dungTour();
    G.cdTang = tang; G.cdBuoc = 0; G.cdVaoPhong = null;
    veLai();
  };

  /* CD-03b · mở con đường của MỘT PHÒNG Ngôi nhà: lọc theo chặng của
     phòng ấy, và nhớ đường VÀO PHÒNG (màn nội dung) để hiện nút quay
     vào. Một ô Ngôi nhà mở đúng con đường của ô đó — con đường là lối
     ĐI, phòng là nơi LÀM. */
  G.cdMoTheoChang = function (tang, view, ten) {
    dungTour();
    G.cdTang = tang || 'all'; G.cdBuoc = 0;
    G.cdVaoPhong = view ? { v: view, ten: ten || '' } : null;
    G._cdTuPhong = true;   /* báo cho G.go: lần mở này ĐẾN TỪ một phòng */
    if (typeof G.go === 'function') G.go('con-duong'); else veLai();
  };

  /* Mở con-duong bằng đường THƯỜNG (menu trái) thì xoá trạng thái phòng
     cũ — nếu không, lần sau mở thấy bộ lọc chặng cũ dính + thanh "Vào
     phòng" của phòng chẳng liên quan (tổ soi đối kháng bắt). Gọi từ G.go
     lúc VÀO màn, không phải lúc vẽ lại (bước đi vẫn giữ trạng thái). */
  G.cdMoThuong = function () {
    if (G._cdTuPhong) { G._cdTuPhong = false; return; }  /* đến từ phòng: giữ */
    G.cdVaoPhong = null; G.cdTang = 'all'; G.cdBuoc = 0; dungTour();
  };

  /* CD-02 · tự dẫn: nhân vật tự bước qua các mốc, trợ lý nói từng mốc.
     Timer tự kiểm view — rời màn thì tự tắt, không rò. */
  G.cdChay = function () {
    if (G.cdTour) { dungTour(); veLai(); return; }
    var n = moc().length; if (!n) return;
    G.cdTour = true; G.cdBuoc = 0; veLai();
    G.cdTimer = setInterval(function () {
      if (!G.S || G.S.view !== 'con-duong') { dungTour(); return; }
      if (G.cdBuoc >= moc().length - 1) { dungTour(); veLai(); return; }
      G.cdBuoc++; veLai();
    }, 2600);
  };

  /* Toạ độ mốc: đường ZIGZAG xuống, hai làn trái–phải, nối bằng đường
     cong mượt cho ra dáng một con đường uốn. */
  function toaDo(i) {
    return { x: (i % 2 === 0) ? 84 : 256, y: 66 + i * 82 };
  }

  function veDuong(bd) {
    var W = 340, H = 66 * 2 + (bd.length - 1) * 82;
    var d = '', i, a, b;
    for (i = 0; i < bd.length; i++) {
      a = toaDo(i);
      if (i === 0) { d += 'M' + a.x + ' ' + a.y; continue; }
      b = toaDo(i - 1);
      var my = (a.y + b.y) / 2;
      d += ' C' + b.x + ' ' + my + ',' + a.x + ' ' + my + ',' + a.x + ' ' + a.y;
    }

    var s = '<svg class="cd-svg" viewBox="0 0 ' + W + ' ' + H + '" ' +
      'width="100%" height="' + H + '" role="img" aria-label="Con đường mười bánh đà" ' +
      'preserveAspectRatio="xMidYMin meet">';
    /* mặt đường + vạch giữa */
    s += '<path d="' + d + '" fill="none" stroke="var(--line-2)" stroke-width="30" ' +
      'stroke-linecap="round" stroke-linejoin="round"/>';
    s += '<path d="' + d + '" fill="none" stroke="var(--bg-1)" stroke-width="22" ' +
      'stroke-linecap="round" stroke-linejoin="round"/>';
    s += '<path d="' + d + '" fill="none" stroke="var(--line-2)" stroke-width="2" ' +
      'stroke-dasharray="2 12" stroke-linecap="round"/>';

    /* các mốc */
    for (i = 0; i < bd.length; i++) {
      a = toaDo(i);
      var m = bd[i], mau = /^#|^var\(/.test(String(m.c || '')) ? m.c : 'var(--gita)';
      var dat = i <= G.cdBuoc;
      var lanTrai = (i % 2 === 0);
      var tx = lanTrai ? a.x + 30 : a.x - 30;
      var neo = lanTrai ? 'start' : 'end';
      s += '<g class="cd-moc" role="button" tabindex="0" data-moc="' + i + '" ' +
        'aria-label="Mốc ' + (i + 1) + ' · ' + h(m.ten || '') + '">' +
        '<circle cx="' + a.x + '" cy="' + a.y + '" r="19" fill="' + mau + '" ' +
        (dat ? '' : 'opacity="0.4" ') + '/>' +
        '<text x="' + a.x + '" y="' + (a.y + 5) + '" text-anchor="middle" ' +
        'fill="#fff" font-size="15" font-weight="800">' + (i + 1) + '</text>' +
        '<text x="' + tx + '" y="' + (a.y + 4) + '" text-anchor="' + neo + '" ' +
        'fill="var(--ink-2)" font-size="12.5" font-weight="600">' + h(m.ten || '') + '</text>' +
        '</g>';
    }

    /* nhân vật đứng ở mốc hiện tại — LÀ avatar khách tự chọn (G.nvVe),
       một nguồn duy nhất với màn Nhân vật. Hộp 64×96, co 0.62, chân đặt
       lên mốc. */
    var c = toaDo(G.cdBuoc);
    var hinh = (typeof G.nvVe === 'function') ? G.nvVe()
      : '<circle cx="32" cy="30" r="16" fill="var(--gita)"/>';
    s += '<g class="cd-nv" transform="translate(' + (c.x - 20) + ',' + (c.y - 56) + ') scale(0.62)">' +
      hinh + '</g>';

    s += '</svg>';
    return s;
  }

  G.VIEWS['con-duong'] = function () {
    var bd = moc();
    var o = '<div class="hd"><h2>' + ic('compass') + ' Con đường nhiệm vụ</h2>' +
      '<p class="sub">Bước trên con đường của nhà mình — mỗi mốc là một bánh đà, ' +
      'chạm tới đâu, việc của mốc đó hiện ra tới đó. Có trợ lý GITA dẫn đường.</p></div>';

    /* CD-03b · nút VÀO PHÒNG — dựng TRƯỚC khi kiểm rỗng. Nếu vào từ một
       phòng Ngôi nhà mà con đường rỗng (chưa nạp gói nền), thiếu nút này
       thì người bấm ô "Hành Trình Hạnh Phúc" mắc kẹt ở màn rỗng KHÔNG có
       lối vào nội dung phòng — đúng lỗi tổ soi đối kháng bắt. Con đường
       là lối đi; phòng là nơi làm — lối vào phòng phải luôn còn. */
    var phongBar = '';
    if (G.cdVaoPhong && G.cdVaoPhong.v) {
      phongBar = '<div class="cd-phong"><span>' + ic('home') + ' Lộ trình của phòng <b>' +
        h(G.cdVaoPhong.ten || '') + '</b></span>' +
        '<button class="btn pri sm" data-v="' + h(G.cdVaoPhong.v) + '">' +
        'Vào phòng ' + ic('arrow') + '</button></div>';
    }

    if (!bd.length) {
      /* Vẫn giữ lối VÀO PHÒNG khi con đường rỗng — không bỏ rơi người dùng. */
      return o + phongBar + U.empty('Con đường nằm trong gói nền',
        'Phần này đọc mười bánh đà của nhà mình, nằm trong gói nền. Đăng nhập lại ' +
        'để nạp, rồi mở lại con đường.' +
        (phongBar ? ' Trong lúc đó, bấm "Vào phòng" ở trên để mở thẳng nội dung phòng.' : ''));
    }

    var b = bd[G.cdBuoc] || bd[0];
    var mau = /^#|^var\(/.test(String(b.c || '')) ? b.c : 'var(--gita)';

    /* CD-03 · chọn con đường theo CHẶNG (5 tầng thật của hành trình).
       'all' là cả mười bánh; mỗi tầng là con đường riêng của chặng ấy. */
    var tiers = G.TIERS || [];
    o += '<div class="cd-loc">';
    o += '<button class="cd-loc-o' + (G.cdTang === 'all' ? ' on' : '') +
      '" data-cdloc="all">Cả hành trình</button>';
    tiers.forEach(function (t) {
      o += '<button class="cd-loc-o' + (G.cdTang === t.code ? ' on' : '') +
        '" data-cdloc="' + h(t.code) + '">' + h(t.code) + '</button>';
    });
    o += '</div>';

    /* Nút VÀO PHÒNG (đã dựng ở trên) — hiện sau thanh chọn chặng. */
    o += phongBar;

    /* CD-02 · nút tự dẫn — nhân vật tự bước, trợ lý nói từng mốc */
    o += '<div class="cd-tour-hang">' +
      '<button class="btn ' + (G.cdTour ? 'ghost' : 'pri') + ' sm" onclick="G.cdChay()">' +
      (G.cdTour ? ic('x') + ' Dừng hướng dẫn' : ic('spark') + ' Xem hướng dẫn') +
      '</button>' +
      '<span class="cd-tour-nhac">Nhân vật tự đi hết con đường, trợ lý nói từng mốc.</span>' +
      '</div>';

    /* Cô trợ lý AI dẫn đường — nói mốc đang đứng. Gương mặt vẽ tại chỗ
       bằng G.troLyVe (một nguồn), không nhúng ảnh ngoài (Điều 13). */
    o += '<div class="cd-troly" style="--ac:' + mau + '">' +
      '<span class="cd-troly-av">' +
      (typeof G.troLyVe === 'function' ? G.troLyVe(52) : ic('spark')) + '</span>' +
      '<div class="cd-troly-noi"><b>Cô trợ lý AI của GITA</b>' +
      '<p>Mình đang ở mốc <b>' + (G.cdBuoc + 1) + '/' + bd.length + '</b> — ' +
      '<b>' + h(b.ten || '') + '</b> (' + h(b.tang || '') + '). ' + h(b.vong || '') + '</p></div></div>';

    /* Con đường */
    o += '<div class="cd-duong">' + veDuong(bd) + '</div>';

    /* Bảng điều khiển bước đi */
    o += '<div class="cd-dieu">' +
      '<button class="btn ghost" onclick="G.cdDi(-1)"' + (G.cdBuoc <= 0 ? ' disabled' : '') + '>' +
      ic('arrow') + ' Lùi</button>' +
      '<span class="cd-vitri">Mốc ' + (G.cdBuoc + 1) + ' / ' + bd.length + '</span>' +
      '<button class="btn pri" onclick="G.cdDi(1)"' + (G.cdBuoc >= bd.length - 1 ? ' disabled' : '') + '>' +
      'Bước tiếp ' + ic('arrow') + '</button></div>';

    /* Nhiệm vụ của mốc đang đứng — hiện ra để hiểu */
    o += '<div class="cd-viec" style="--ac:' + mau + '">' +
      '<div class="cd-viec-dau"><span class="cd-viec-ic">' + ic(U.P && U.P[b.ic] ? b.ic : 'orbit') +
      '</span><b>' + h(b.ten || '') + '</b></div>';
    if (b.y) o += '<p class="cd-viec-y">' + h(b.y) + '</p>';
    var nho = (b.nho || []).slice(0, 3);
    if (nho.length) {
      o += '<div class="cd-viec-nho"><b class="sm">Việc làm được ngay:</b><ul>';
      nho.forEach(function (v) {
        o += '<li>' + h(typeof v === 'string' ? v : (v.ten || v.viec || v.t || '')) + '</li>';
      });
      o += '</ul></div>';
    }
    o += '<button class="btn ghost sm blk" data-v="banh-da">' + ic('orbit') +
      ' Mở màn Mười bánh đà để làm</button></div>';

    return o;
  };
})();
