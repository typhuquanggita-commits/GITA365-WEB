/* ═══════════════════════════════════════════════════════════════
   GITA 365 — ĐỒNG HÀNH TỪNG CẤP (trọn gói mỗi cấp) · 9.99.222

   Chủ hệ: cần chiều sâu, chi tiết — bài coach chuyên sâu + kịch bản + câu
   chuyện minh chứng + chuỗi nhiệm vụ + đo lường, chuẩn chuyên gia, full 5
   tầng, để dịch vụ đồng hành đạt chất lượng tốt nhất.

   MÀN NÀY TRỎ, KHÔNG CHÉP. Nội dung sâu ĐÃ có, rải ở nhiều kho; màn này gom
   TRỌN GÓI về MỘT cấp: chọn một cấp (1.1–5.10) là thấy đủ mọi lớp cho cấp
   ấy — coach/tư vấn mở một chỗ là đồng hành được ngay:
     · Chân dung + mốc      → G.KTL_CAP50
     · Vai vòng trung thành → G.CWOW_ARC (THỬ→TIN→GẮN BÓ→FAN→LAN TOẢ)
     · Giáo trình 4 cột     → G.KTL_TL50 (chuỗi·wow·cơ chế·tín hiệu)
     · Bản hợp nhất         → G.KTL_TL50[].hn (tâm hồn·≤60s·kịch bản — tầng 2)
     · Bài coach chuyên sâu → G.KTL_SAU (6 chiếc mũ cảm xúc)
     · Câu chuyện minh chứng→ G.KTL_CHUYEN (mẫu — chỉ nơi nguồn có thật)
     · Đo lường             → tín hiệu lên cấp + số điểm chạm WOW

   Cấp nào nguồn CHƯA có một lớp thì màn NÓI "chưa có trong nguồn", không
   bịa (luật kho: không độn, minh chứng phải thật).
   GÓI NGHỀ (pro_consult): giáo trình đồng hành là tài sản nghề.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;
G.VIEWS = G.VIEWS || {};

G.dhCap = G.dhCap || '1.1';
G.dhChon = function (ma) { G.dhCap = ma; G.render && G.render(); };

(function () {
  var U = G.U, h = U.h, ic = U.ic;

  function cot(nhan, val, mau) {
    if (!val) return '';
    return '<div class="ktl-tl-cot"><span class="ktl-tl-nhan" style="color:' + mau + '">' + h(nhan) + '</span>' +
      '<p class="ktl-tl-val">' + h(val) + '</p></div>';
  }

  G.VIEWS['dong-hanh-cap'] = function () {
    if (!G.can || !G.can('pro_consult')) return U.lockCard ? U.lockCard() : U.empty('Cần gói nghề', 'Màn này khoá ở quyền nghề.');
    var CAP = G.KTL_CAP50 || [], TL = G.KTL_TL50 || {}, SAU = G.KTL_SAU || [],
        CHUYEN = G.KTL_CHUYEN || [], ARC = G.CWOW_ARC || [], TANG = G.KTL_TANG || [];

    var o = U.ph({ eyebrow: 'DỊCH VỤ ĐỒNG HÀNH · TRỌN GÓI MỖI CẤP', ic: 'compass', grad: 1,
      t: 'Đồng hành từng cấp',
      lead: 'Chọn một cấp là thấy đủ mọi lớp cho cấp ấy — chân dung, vai trò vòng trung thành, giáo trình bốn cột, bài coach chuyên sâu, câu chuyện minh chứng, và đo lường. Một chỗ mở ra, đồng hành được ngay.' });

    /* Bộ chọn tầng → cấp */
    var cur = CAP.filter(function (c) { return c.ma === G.dhCap; })[0] || CAP[0] || {};
    var curTang = cur.tang || 'T1';
    o += '<div class="dh-chon">';
    TANG.forEach(function (t) {
      var caps = CAP.filter(function (c) { return c.tang === t.ma; });
      o += '<div class="dh-tang-hang"><span class="dh-tang-nhan" style="color:' + (t.mau || 'var(--gita)') + '">' +
        h(t.ma) + ' ' + h(t.biet || '') + '</span><div class="dh-caps">' +
        caps.map(function (c) {
          var on = c.ma === G.dhCap;
          return '<button class="dh-cap' + (on ? ' on' : '') + '" onclick="G.dhChon(\'' + c.ma + '\')"' +
            (on ? ' style="background:' + (t.mau || 'var(--gita)') + ';border-color:' + (t.mau || 'var(--gita)') + '"' : '') +
            '>' + h(c.ma) + '</button>';
        }).join('') + '</div></div>';
    });
    o += '</div>';

    /* Panel trọn gói cho cấp đang chọn */
    var tObj = TANG.filter(function (t) { return t.ma === curTang; })[0] || {};
    var mau = tObj.mau || 'var(--gita)';
    var d = TL[G.dhCap] || null;
    var arc = ARC.filter(function (a) { return a.tang === curTang; })[0] || null;
    var sau = SAU.filter(function (s) { return s.ma === G.dhCap; })[0] || null;

    o += '<div class="dh-panel" style="border-top:4px solid ' + mau + '">';
    o += '<div class="dh-dau"><span class="mono dh-ma" style="background:' + mau + '">' + h(cur.ma) + '</span>' +
      '<div><b class="dh-ten">' + h(cur.ten || '') + '</b>' +
      '<div class="tiny muted">' + h(tObj.ten || curTang) + ' · ' + h(tObj.biet || '') +
      (cur.khi ? (' · ' + h(cur.khi)) : '') + (arc ? (' · vòng trung thành: ' + h(arc.pha)) : '') + '</div></div></div>';

    if (arc) o += '<p class="tiny" style="line-height:1.7;margin:8px 0;color:var(--ink-2)">' + ic('spark', 'w-3 h-3') + ' ' + h(arc.y) + '</p>';

    /* Giáo trình 4 cột */
    o += U.sec('GIÁO TRÌNH', 'Bốn cột cốt lõi của cấp.');
    if (d) {
      o += '<div class="card"><div class="ktl-tl-than">' +
        cot('Chuỗi hành động', d.chuoi, mau) +
        cot('Điểm chạm WOW', d.wow, mau) +
        cot('Cơ chế phía sau', d.coche, mau) +
        cot('Tín hiệu lên cấp (đo lường)', d.tinHieu, mau) +
        '</div></div>';
      if (d.hn) {
        o += '<div class="card mt"><div class="ktl-tl-than">' +
          '<span class="ktl-tl-nhan" style="color:' + mau + '">Bản hợp nhất · ' + h(d.hn.tenGoc || '') + (d.hn.ngay ? (' · ' + h(d.hn.ngay)) : '') + '</span>' +
          cot('Mục tiêu tâm hồn', d.hn.mucTamHon, mau) +
          cot('Nhiệm vụ cốt lõi (≤60s)', d.hn.nhiemVu, mau) +
          cot('Điểm chạm WOW chủ đạo', d.hn.wowCD, mau) +
          cot('Kịch bản hệ thống', d.hn.kichBan, mau) +
          '</div></div>';
      }
    } else {
      o += U.empty('Chưa nạp giáo trình cấp này', 'Đăng nhập vai nghề để nạp gói tài liệu, rồi mở lại.');
    }

    /* Bài coach chuyên sâu */
    o += U.sec('BÀI COACH CHUYÊN SÂU', sau ? 'Bài đầy đủ theo 6 chiếc mũ cảm xúc — bấm để mở.' : 'Cấp này chưa có bài sâu trong nguồn.');
    if (sau) {
      o += '<details class="ktl-nhom-o ktl-tl" style="border-left:3px solid ' + mau + '">' +
        '<summary><b>' + h(sau.ten || ('Bài sâu ' + sau.ma)) + '</b></summary>' +
        '<div class="ktl-sau-bai">' + h(sau.bai) + '</div></details>';
    } else {
      o += '<p class="tiny dim">— Bài biên soạn sâu cho cấp ' + h(cur.ma) + ' chưa có trong tài liệu nguồn (không bịa; chờ chủ hệ gửi).</p>';
    }

    /* Câu chuyện minh chứng — chỉ nơi nguồn có */
    o += U.sec('CÂU CHUYỆN MINH CHỨNG', CHUYEN.length ? 'Câu chuyện thực hành mẫu (chuẩn 10 điểm chạm) — tạo niềm tin bằng minh chứng thật của nguồn.' : 'Chưa có câu chuyện trong nguồn.');
    if (CHUYEN.length && curTang === 'T2') {
      o += CHUYEN.map(function (s) {
        return '<details class="ktl-nhom-o ktl-tl" style="border-left:3px solid var(--gold-2)">' +
          '<summary><span class="ktl-nhom-ma mono">#' + h(s.so) + '</span><b>' + h(s.ten) + '</b></summary>' +
          '<div class="ktl-sau-bai">' + h(s.bai) + '</div></details>';
      }).join('');
    } else {
      o += '<p class="tiny dim">— Câu chuyện minh chứng hiện có ở bối cảnh tầng 2 (3 câu mẫu từ nguồn). Tầng khác chờ chủ hệ gửi câu chuyện thật — không bịa chứng thực.</p>';
    }

    o += '</div>'; /* dh-panel */
    return o;
  };
})();
