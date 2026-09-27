/* ═══════════════════════════════════════════════════════════════
   GITA 365 — GÓI NGHỀ · BỘ PHẬN CHUYÊN MÔN · 9.99.223

   Chủ hệ: biên tập full hệ thống gói nghề chất lượng cao cho các bộ phận
   chuyên môn của GITA365.

   MÀN NÀY TRỎ, KHÔNG CHÉP. Gói nghề của mỗi bộ phận đã có sẵn, rải nhiều
   kho; màn này gom TRỌN GÓI theo bộ phận: chọn một vai là thấy đủ chuẩn
   nghề của vai ấy — sứ mệnh, chuẩn nghề (trách nhiệm·quyết định·giới
   hạn·KPI·bằng chứng), sát hạch, số màn/công cụ mở được.
     · Danh tính vai      → G.ROLES (tên · bậc · cổng · sứ mệnh)
     · Chuẩn nghề         → G.HDT_BEN (bảng bên liên quan của master doc)
     · Sát hạch nghề      → G.SH_HOI (ngân hàng câu hỏi theo vai)
     · Công cụ & màn      → G.NAV lọc bằng G.vaiCo (quyền thật của vai)

   Ánh xạ vai→chuẩn (GN_CHUAN) và vai→sát hạch (GN_SAT) là ĐỀ XUẤT khớp
   theo TÊN VAI — mã đối chiếu kho thật ở mục 127; khớp sai thì đỏ.
   Bộ phận/vai nào nguồn CHƯA có một lớp thì màn NÓI ra, không bịa.
   GÓI NGHỀ (nghe_chung): mỗi người nghề mở để thấy chuẩn của chính mình.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;
G.VIEWS = G.VIEWS || {};

/* Bốn bộ phận chuyên môn, gom theo cổng làm việc (R13–R15 là khách, không kể). */
G.GN_BOPHAN = [
  { ma:'DH', ten:'Điều hành & Quản trị', vai:['R01','R02','R03','R04','R12'], mau:'var(--gita)' },
  { ma:'HL', ten:'Huấn luyện — đội Coach', vai:['R05','R06','R07','R08','R09','R10'], mau:'var(--gita-sau)' },
  { ma:'TV', ten:'Tư vấn — mở cửa cho gia đình', vai:['R11'], mau:'var(--gita-do)' },
  /* Bộ phận Tài chính là một TRỤC quyền riêng, KHÔNG gom vai R-nào — nên
     bỏ hẳn khoá `vai` (vắng mặt = không áp dụng; luật kho cấm để []). */
  { ma:'TC', ten:'Tài chính – Kế toán (trục quyền riêng)', mau:'var(--gold-2)',
    ghiChu:'Trục quyền tài chính (kế toán thu · chi · trưởng) vuông góc thang vai — cấp bằng quyenTaiChinh, chi tiết ở màn Phòng tài chính.' }
];
/* vai → tên trong HDT_BEN (chuẩn nghề master doc). Khớp theo tên vai. */
G.GN_CHUAN = { R04:'Quản lý chuyên môn', R05:'Coach', R06:'Coach', R07:'Coach',
  R09:'Mentor', R10:'Chuyên gia đánh giá', R11:'Chuyên gia tư vấn' };
/* vai → vai trong SH_HOI (sát hạch nghề). */
G.GN_SAT = { R05:'COACH', R06:'COACH', R07:'COACH', R08:'GV', R11:'TV' };

G.gnVai = G.gnVai || 'R07';
G.gnChon = function (id) { G.gnVai = id; G.render && G.render(); };

(function () {
  var U = G.U, h = U.h, ic = U.ic;

  function benRow(ten) {
    var b = G.HDT_BEN; if (!b || !b.dong) return null;
    var r = b.dong.filter(function (x) { return x[0] === ten; })[0];
    if (!r) return null;
    return { vaiTro:r[1], quyetDinh:r[2], duLieu:r[3], trachNhiem:r[4], gioiHan:r[5], kpi:r[6], bangChung:r[7] };
  }
  function cot(nhan, val, mau) {
    if (!val) return '';
    return '<div class="ktl-tl-cot"><span class="ktl-tl-nhan" style="color:' + mau + '">' + h(nhan) + '</span>' +
      '<p class="ktl-tl-val">' + h(val) + '</p></div>';
  }

  G.VIEWS['goi-nghe'] = function () {
    if (!G.can || !G.can('nghe_chung')) return U.lockCard ? U.lockCard() : U.empty('Cần gói nghề', 'Màn này khoá ở quyền nghề.');
    var ROLES = G.ROLES || [], SH = G.SH_HOI || [], NAV = G.NAV || [];
    var roleById = {}; ROLES.forEach(function (r) { roleById[r.id] = r; });

    var o = U.ph({ eyebrow: 'GÓI NGHỀ · BỘ PHẬN CHUYÊN MÔN', ic: 'crown', grad: 1,
      t: 'Gói nghề — bộ phận chuyên môn',
      lead: 'Mỗi bộ phận chuyên môn của GITA365 có một gói nghề trọn vẹn: sứ mệnh, chuẩn nghề (trách nhiệm · quyết định được phép · giới hạn · KPI · bằng chứng), sát hạch, và bộ công cụ. Chọn một vai để mở gói nghề của vai ấy.' });

    /* Đếm nhanh */
    var soVaiCoChuan = Object.keys(G.GN_CHUAN).length;
    o += U.bdSoHang([
      {k:'Bộ phận chuyên môn', v:String(G.GN_BOPHAN.length), c:'var(--gita)'},
      {k:'Vai nghề', v:String(ROLES.filter(function(r){return r.lv<=12;}).length), c:'var(--gita-sau)', d:'R01–R12'},
      {k:'Vai có chuẩn nghề', v:String(soVaiCoChuan), c:'var(--ok)', d:'HDT_BEN'},
      {k:'Ngân hàng sát hạch', v:String(SH.length), c:'var(--gold-2)', d:'câu hỏi nghề'}
    ]);

    /* Bộ chọn theo bộ phận */
    o += '<div class="dh-chon">';
    G.GN_BOPHAN.forEach(function (bp) {
      if (!bp.vai || !bp.vai.length) return;
      o += '<div class="dh-tang-hang"><span class="dh-tang-nhan" style="color:' + bp.mau + '">' + h(bp.ten) + '</span><div class="dh-caps">' +
        bp.vai.map(function (id) {
          var r = roleById[id]; if (!r) return '';
          var on = id === G.gnVai;
          return '<button class="dh-cap' + (on ? ' on' : '') + '" onclick="G.gnChon(\'' + id + '\')"' +
            (on ? ' style="background:' + bp.mau + ';border-color:' + bp.mau + '"' : '') + '>' + h(r.short || id) + '</button>';
        }).join('') + '</div></div>';
    });
    o += '</div>';

    /* Panel gói nghề của vai đang chọn */
    var r = roleById[G.gnVai] || ROLES[0] || {};
    var bp = G.GN_BOPHAN.filter(function (x) { return (x.vai || []).indexOf(r.id) >= 0; })[0] || {};
    var mau = bp.mau || 'var(--gita)';
    o += '<div class="dh-panel" style="border-top:4px solid ' + mau + '">';
    o += '<div class="dh-dau"><span class="mono dh-ma" style="background:' + mau + '">' + h(r.id || '') + '</span>' +
      '<div><b class="dh-ten">' + h(r.n || '') + '</b>' +
      '<div class="tiny muted">bậc ' + h(String(r.lv || '')) + ' · cổng ' + h(r.portal || '') + ' · ' + h(bp.ten || '') + '</div></div></div>';
    if (r.ln) o += '<p class="tiny" style="line-height:1.7;margin:8px 0;color:var(--ink-2)">' + ic('star', 'w-3 h-3') + ' ' + h(r.ln) + '</p>';

    /* Chuẩn nghề từ HDT_BEN */
    var ten = G.GN_CHUAN[r.id];
    var std = ten ? benRow(ten) : null;
    o += U.sec('CHUẨN NGHỀ', std ? ('Trích chuẩn "bên liên quan" của bản phương pháp coach — ' + h(ten)) : 'Vai này chưa có dòng chuẩn riêng trong HDT_BEN.');
    if (std) {
      o += '<div class="card"><div class="ktl-tl-than">' +
        cot('Vai trò chính', std.vaiTro, mau) +
        cot('Quyết định được phép đưa ra', std.quyetDinh, mau) +
        cot('Trách nhiệm chính', std.trachNhiem, mau) +
        cot('Giới hạn', std.gioiHan, mau) +
        cot('KPI chức năng (đo lường)', std.kpi, mau) +
        cot('Bằng chứng bắt buộc', std.bangChung, mau) +
        '</div></div>';
    } else {
      o += '<p class="tiny dim">— Chuẩn nghề chi tiết cho vai ' + h(r.id) + ' nằm ở các kho chuyên môn khác (quản trị/tài chính); chưa gộp vào bảng HDT_BEN. Không bịa thêm.</p>';
    }

    /* Sát hạch nghề */
    var sv = G.GN_SAT[r.id];
    var soSat = sv ? SH.filter(function (q) { return (q.vai || q.role) === sv; }).length : 0;
    o += U.sec('SÁT HẠCH NGHỀ', soSat ? ('Ngân hàng ' + soSat + ' câu hỏi sát hạch cho vai này — mở ở màn Sát hạch.') : 'Vai này chưa có bộ sát hạch riêng trong nguồn.');
    if (soSat) o += '<div class="card pad-sm">' + ic('target', 'w-4 h-4') + ' <b class="sm">' + soSat + ' câu</b> <span class="tiny muted">· chuẩn hoá theo vai ' + h(sv) + '</span> <button class="chip" data-v="sat-hach" style="cursor:pointer;border:1px solid ' + mau + '">mở màn sát hạch</button></div>';
    else o += '<p class="tiny dim">— Chưa có bộ sát hạch cho vai ' + h(r.id) + ' (nguồn chỉ có COACH · GV · TV · CTV · PH · HS).</p>';

    /* Công cụ & màn mở được — đếm thật bằng quyền của vai */
    var canFn = (typeof G.vaiCo === 'function') ? G.vaiCo : null;
    var moDuoc = [];
    NAV.forEach(function (nhom) {
      (nhom.items || []).forEach(function (it) {
        if (!it.v) return;
        var ok = !it.perm || (canFn ? canFn(r, it.perm) : false);
        if (ok) moDuoc.push(it);
      });
    });
    o += U.sec('CÔNG CỤ & MÀN MỞ ĐƯỢC', canFn ? (moDuoc.length + ' màn vai này mở được (đếm bằng quyền thật).') : 'Không đọc được quyền lúc chạy.');
    if (moDuoc.length) {
      o += '<div class="ktl-nhom">' + moDuoc.slice(0, 40).map(function (it) {
        return '<button class="ktl-nhom-o" data-v="' + h(it.v) + '" style="cursor:pointer;text-align:left;border-left:3px solid ' + mau + '">' +
          '<b class="sm">' + h(it.t || it.v) + '</b>' + (it.h ? '<span class="ktl-nhom-t">' + h(it.h) + '</span>' : '') + '</button>';
      }).join('') + '</div>';
      if (moDuoc.length > 40) o += '<p class="tiny dim mt">… và ' + (moDuoc.length - 40) + ' màn nữa.</p>';
    }

    o += '</div>'; /* panel */

    if (G.GN_BOPHAN.filter(function (x) { return !x.vai || !x.vai.length; }).length) {
      o += '<div class="card pad-sm mt" style="border-color:var(--gold-2)">' + ic('shield', 'w-4 h-4') +
        ' <b class="sm">Bộ phận Tài chính – Kế toán</b> <span class="tiny muted">là một TRỤC quyền riêng (thu · chi · trưởng) vuông góc thang vai R01–R15, cấp bằng quyenTaiChinh — gói nghề chi tiết ở màn Phòng tài chính, không lặp ở đây.</span></div>';
    }
    return o;
  };
})();
