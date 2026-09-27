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

  /* ══ HÀNH TRÌNH THEO MỘT TRỤC THẲNG — MỞ KHOÁ TỪNG BƯỚC (9.99.155) ══

     Chủ hệ: "kích vào mục nào ra hành trình theo MỘT TRỤC THẲNG từng
     bước hoàn thành. Trên trục có tên chính; hoàn thành bước trước bước
     tiếp mới nổi chi tiết, KHÔNG cung cấp ngay. Trợ lý AI gửi hướng dẫn
     chat để khách hiểu nhiệm vụ."

     Mốc trên trục LÀ mười bánh đà (G.BD_LON) — vẫn đọc thẳng kho, không
     chép tên vào màn (mục 108). Ba trạng thái mỗi bước:
       · xong   — đã đánh dấu hoàn thành (dấu ✓), xem lại được
       · active — bước đang làm: HIỆN chi tiết + trợ lý hướng dẫn
       · khoá   — bước sau: CHỈ tên chính, chi tiết CHƯA hiện

     "Đã làm xong" là LỜI KHAI của khách để tự đặt nhịp — một checklist
     học tập cá nhân, không phải cổng giữ dữ liệu hay tiền. Nên lưu
     localStorage theo uid (rẻ, chạy cả .exe offline); đồng bộ theo tài
     khoản là lớp sau (sổ chờ CD-05). Mọi đọc/ghi bọc try/catch — khung
     riêng tư / xoá site-data trả về rỗng thì màn vẫn chạy đúng. */
  G.cdTang = 'all';    /* CD-03: lọc theo chặng T1..T5, hoặc 'all' */
  G.cdMoI = null;      /* bước đang MỞ để xem (null = tự mở bước active) */
  G.cdVaoPhong = null; /* CD-03b: {v,ten} phòng Ngôi nhà đã mở con đường này */

  /* Mốc trên trục LÀ bánh đà. Lọc theo chặng lúc đọc — không giữ một
     bản danh sách thứ hai (cùng luật cột-tính-lúc-đọc). */
  function moc() {
    var bd = G.BD_LON || [];
    if (G.cdTang && G.cdTang !== 'all')
      return bd.filter(function (b) { return b.tang === G.cdTang; });
    return bd;
  }

  /* ── Sổ hoàn thành: localStorage theo uid, bọc try/catch ── */
  function uid() { return (G.hoSo && G.hoSo.uid) || 'x'; }
  G.cdTaiXong = function () {
    if (G.cdXong) return G.cdXong;
    var m = {};
    try {
      var s = localStorage.getItem('gita-cd-xong-' + uid());
      if (s) m = JSON.parse(s) || {};
    } catch (e) {}
    G.cdXong = m; return m;
  };
  function luuXong() {
    try { localStorage.setItem('gita-cd-xong-' + uid(), JSON.stringify(G.cdXong || {})); }
    catch (e) {}
  }
  function daXong(ma) { return !!G.cdTaiXong()[ma]; }
  /* Bước đang làm = bước ĐẦU TIÊN chưa xong. Tất cả xong → bd.length. */
  function iActive(bd) {
    var m = G.cdTaiXong();
    for (var i = 0; i < bd.length; i++) { if (!m[bd[i].ma]) return i; }
    return bd.length;
  }

  function veLai() {
    if (!G.S || G.S.view !== 'con-duong') return;
    if (typeof document === 'undefined' || !document.getElementById('main')) return;
    G.render && G.render();
  }

  /* Đánh dấu hoàn thành → mở bước tiếp. Đặt lại cdMoI về null để bước
     active mới tự bung. */
  G.cdXongBuoc = function (ma) {
    if (!ma) return;
    var m = G.cdTaiXong(); m[ma] = true; luuXong();
    G.cdMoI = null; veLai();
  };
  /* Bỏ đánh dấu (làm nhầm) — chỉ cho bỏ ở bước xong gần nhất để không
     "mở khoá ngược" giữa chừng rồi để lộ chi tiết bước sau. */
  G.cdBoXong = function (ma) {
    if (!ma) return;
    var m = G.cdTaiXong(); delete m[ma]; luuXong();
    G.cdMoI = null; veLai();
  };

  /* data-moc → G.cdChon: MỞ một bước để xem. Chỉ cho mở bước ĐÃ XONG
     hoặc bước ĐANG LÀM — bấm bước khoá thì nói rõ, không hé chi tiết.
     (mục 113c: mốc bấm QUA data-moc — KHÔNG gắn thuộc tính onclick gọi
     G.cdChon, vì Enter/Space không kích onclick trên thẻ phi-gốc.) */
  G.cdChon = function (i) {
    var bd = moc(); if (!bd.length) return;
    i = Math.max(0, Math.min(bd.length - 1, i | 0));
    var a = iActive(bd);
    if (i > a) {
      if (G.U && G.U.toast) G.U.toast('Hoàn thành bước trước để mở bước này', 'info');
      return;
    }
    G.cdMoI = i; veLai();
  };

  /* CD-03 · đổi chặng: về đầu, quên bước đang mở và phòng cũ. */
  G.cdLoc = function (tang) {
    G.cdTang = tang; G.cdMoI = null; G.cdVaoPhong = null; veLai();
  };

  /* CD-03b · mở con đường của MỘT PHÒNG Ngôi nhà. */
  G.cdMoTheoChang = function (tang, view, ten) {
    G.cdTang = tang || 'all'; G.cdMoI = null;
    G.cdVaoPhong = view ? { v: view, ten: ten || '' } : null;
    G._cdTuPhong = true;
    if (typeof G.go === 'function') G.go('con-duong'); else veLai();
  };

  /* Mở bằng đường THƯỜNG (menu trái) thì xoá trạng thái phòng cũ. */
  G.cdMoThuong = function () {
    if (G._cdTuPhong) { G._cdTuPhong = false; return; }
    G.cdVaoPhong = null; G.cdTang = 'all'; G.cdMoI = null;
  };

  /* Trợ lý AI soạn HƯỚNG DẪN cho bước đang làm — từ đúng dữ liệu bánh
     đà (ten · tang · vong), không bịa. Đây là "gửi hướng dẫn chat" của
     chủ hệ: một bong bóng chat của cô trợ lý, nói việc cần làm. */
  function loiTroLy(b) {
    var ten = (G.hoSo && (G.hoSo.ten || G.hoSo.hoTen)) || '';
    var s = 'Chào ' + (ten ? h(ten) : 'nhà mình') + '! Bước này của mình là <b>' +
      h(b.ten || '') + '</b>' + (b.tang ? ' (' + h(b.tang) + ')' : '') + '. ';
    if (b.vong) s += h(b.vong) + ' ';
    s += 'Mình làm lần lượt từng việc nhỏ bên dưới; xong hết thì bấm ' +
      '<b>“Đã làm xong bước này”</b> để mở bước tiếp nhé.';
    return s;
  }

  /* Chi tiết một bước: vì sao (y) + các việc nhỏ (nho). CHỈ dựng cho
     bước xong/active — bước khoá không gọi hàm này (không cung cấp ngay). */
  function veChiTiet(b, laActive) {
    var o = '';
    if (laActive) {
      o += '<div class="cd-hd">' +
        '<span class="cd-hd-av">' +
        (typeof G.troLyVe === 'function' ? G.troLyVe(46) : ic('spark')) + '</span>' +
        '<div class="cd-hd-noi"><b>Cô trợ lý AI của GITA</b><p>' + loiTroLy(b) + '</p></div>' +
        '</div>';
    }
    if (b.y) o += '<p class="cd-y">' + h(b.y) + '</p>';
    var nho = b.nho || [];
    if (nho.length) {
      o += '<ol class="cd-nho">';
      nho.forEach(function (v) {
        if (typeof v === 'string') { o += '<li><b>' + h(v) + '</b></li>'; return; }
        o += '<li><b>' + h(v.ten || v.t || '') + '</b>';
        if (v.viec) o += '<span class="cd-nho-viec">' + h(v.viec) + '</span>';
        if (v.thay) o += '<span class="cd-nho-thay">' + ic('spark') + ' ' + h(v.thay) + '</span>';
        o += '</li>';
      });
      o += '</ol>';
    }
    /* Nút hoàn thành / bỏ đánh dấu */
    if (laActive) {
      o += '<button class="btn pri blk cd-xong-nut" onclick="G.cdXongBuoc(\'' +
        h(b.ma || '') + '\')">' + ic('check') + ' Đã làm xong bước này</button>';
    } else {
      o += '<button class="btn ghost sm cd-bo-nut" onclick="G.cdBoXong(\'' +
        h(b.ma || '') + '\')">Bỏ đánh dấu hoàn thành</button>';
    }
    o += '<button class="btn ghost sm blk" data-v="banh-da">' + ic('orbit') +
      ' Mở màn Mười bánh đà để làm</button>';
    return o;
  }

  G.VIEWS['con-duong'] = function () {
    var bd = moc();
    var o = '<div class="hd"><h2>' + ic('compass') + ' Con đường nhiệm vụ</h2>' +
      '<p class="sub">Một trục thẳng, đi từng bước. Xong bước này, bước sau mới mở.</p></div>';

    /* CD-03b · nút VÀO PHÒNG — dựng TRƯỚC khi kiểm rỗng, không bỏ rơi
       người vào từ một phòng khi con đường chưa nạp. */
    var phongBar = '';
    if (G.cdVaoPhong && G.cdVaoPhong.v) {
      phongBar = '<div class="cd-phong"><span>' + ic('home') + ' Lộ trình của phòng <b>' +
        h(G.cdVaoPhong.ten || '') + '</b></span>' +
        '<button class="btn pri sm" data-v="' + h(G.cdVaoPhong.v) + '">' +
        'Vào phòng ' + ic('arrow') + '</button></div>';
    }

    if (!bd.length) {
      return o + phongBar + U.empty('Con đường nằm trong gói nền',
        'Phần này đọc mười bánh đà của nhà mình, nằm trong gói nền. Đăng nhập lại ' +
        'để nạp, rồi mở lại con đường.' +
        (phongBar ? ' Trong lúc đó, bấm "Vào phòng" ở trên để mở thẳng nội dung phòng.' : ''));
    }

    /* CD-03 · chọn con đường theo CHẶNG */
    var tiers = G.TIERS || [];
    o += '<div class="cd-loc">';
    o += '<button class="cd-loc-o' + (G.cdTang === 'all' ? ' on' : '') +
      '" data-cdloc="all">Cả hành trình</button>';
    tiers.forEach(function (t) {
      o += '<button class="cd-loc-o' + (G.cdTang === t.code ? ' on' : '') +
        '" data-cdloc="' + h(t.code) + '">' + h(t.code) + '</button>';
    });
    o += '</div>';

    o += phongBar;

    /* Tiến độ */
    var a = iActive(bd), soXong = 0, ii;
    for (ii = 0; ii < bd.length; ii++) { if (daXong(bd[ii].ma)) soXong++; }
    o += '<div class="cd-tiendo"><div class="cd-tiendo-thanh"><span style="width:' +
      Math.round(soXong / bd.length * 100) + '%"></span></div>' +
      '<b>' + soXong + '/' + bd.length + ' bước</b></div>';

    if (soXong >= bd.length) {
      o += '<div class="cd-het">' + ic('check') +
        ' Nhà mình đã đi hết con đường này. Mở lại bước nào cũng được để xem lại.</div>';
    }

    /* Bước đang MỞ để xem chi tiết: mặc định là bước active; hoặc bước
       khách bấm mở (chỉ khi ≤ active). */
    var exp = Math.min(a, bd.length - 1);
    if (G.cdMoI != null && G.cdMoI >= 0 && G.cdMoI < bd.length && G.cdMoI <= a) exp = G.cdMoI;

    /* ── TRỤC THẲNG ── */
    o += '<div class="cd-truc">';
    for (ii = 0; ii < bd.length; ii++) {
      var b = bd[ii];
      var xong = daXong(b.ma), laActive = (ii === a), khoa = (ii > a);
      var trang = xong ? 'xong' : laActive ? 'active' : 'khoa';
      var mo = (ii === exp) && !khoa;    /* không bao giờ bung bước khoá */
      var mau = /^#|^var\(/.test(String(b.c || '')) ? b.c : 'var(--gita)';

      o += '<div class="cd-nut cd-s-' + trang + (mo ? ' mo' : '') + '" style="--ac:' + mau + '">';
      /* dấu trên trục: ✓ khi xong · số khi đang/khoá. Bấm để mở (khoá thì
         cdChon nói rõ, không hé chi tiết). */
      o += '<button class="cd-cham" data-moc="' + ii + '" aria-label="Bước ' + (ii + 1) +
        ' · ' + h(b.ten || '') + (xong ? ' · đã xong' : khoa ? ' · chưa mở' : ' · đang làm') + '">' +
        (xong ? ic('check') : (khoa ? ic('lock') : '<span class="cd-cham-so">' + (ii + 1) + '</span>')) +
        '</button>';

      o += '<div class="cd-than">';
      /* tên chính LUÔN hiện trên trục */
      o += '<button class="cd-ten" data-moc="' + ii + '"><b>' + h(b.ten || '') + '</b>' +
        (b.tang ? '<span class="cd-tag">' + h(b.tang) + '</span>' : '') +
        (laActive ? '<span class="cd-here">' +
          (typeof G.nvVe === 'function' ? G.nvVe(30) : '') + ' Bạn đang ở đây</span>' : '') +
        '</button>';

      if (mo) {
        o += '<div class="cd-chitiet">' + veChiTiet(b, laActive) + '</div>';
      } else if (khoa) {
        o += '<p class="cd-khoa-nhac">' + ic('lock') +
          ' Hoàn thành bước trước để mở chi tiết bước này.</p>';
      }
      o += '</div></div>';   /* .cd-than .cd-nut */
    }
    o += '</div>';   /* .cd-truc */

    return o;
  };
})();
