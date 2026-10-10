/* ═══════════════════════════════════════════════════════════════
   GITA 365 — KIM CHỈ NAM Ở ĐẦU MỌI MÀN CỦA KHÁCH

   Chủ hệ 10/10: khách không được thấy mình đi một mình — mọi phần của
   khách đều có kim chỉ nam chỉ đường, luôn thấy người đồng hành và chuyên
   gia bên cạnh.

   Một dải gọn ở đầu mỗi màn khách (R13–R15), chèn ở ĐÚNG MỘT CHỖ — render()
   của app.js — nên màn viết sau cũng tự có. Ba câu, không hơn:
   · Nhà mình đang ở đâu — tầng mấy, và màn này nằm ở phần nào của bản đồ.
   · Bước tiếp theo — một nút, không phải một danh sách.
   · Ai đang đi cùng — tên người đồng hành, và ai đứng sau họ khi việc khó.

   Mặc định CHỈ MỘT DÒNG, bấm mới mở chi tiết: chủ hệ vừa yêu cầu giảm một
   nửa chữ trên màn (10/10) — một dải to ở đầu 70 màn là đi ngược yêu cầu ấy.
   Trạng thái mở/đóng nhớ trên máy (localStorage, bọc try/catch).

   Tên người đồng hành lấy từ cửa kimChiNam (chỉ đọc, chỉ họ tên, nhà lấy
   từ phiên). Không có máy chủ (bản thử) thì nói chung, không bịa tên.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;
(function () {
  var st = { ai: '', d: null, dang: false };
  var KHOA_MO = 'gita365.kcn.mo';
  var BO_QUA = { 'tro-ly': 1 };          /* màn trợ lý chiếm trọn chiều cao */
  var BUOC_TIEP = ['hom-nay', 'bat-dau', 'ban-do'];

  function h(x) { return G.U.h(x); }
  function ic(a, b) { return G.U.ic(a, b); }
  function coMayChu() { return !!(G.API_CAP_PHEP && G.PHIEN_TOKEN && typeof G.goiMayChu === 'function'); }
  function moSan() { try { return localStorage.getItem(KHOA_MO) === '1'; } catch (e) { return false; } }

  function nap() {
    var ai = String((G.S && G.S.acc && G.S.acc.u) || '');
    if (st.ai !== ai) st = { ai: ai, d: null, dang: false };
    if (!coMayChu() || st.d || st.dang) return;
    st.dang = true;
    G.goiMayChu('kimChiNam', {}).then(function (r) {
      st.dang = false;
      st.d = (r && r.ok) ? r : { loi: true };
      if (G.S && G.S.acc && !BO_QUA[G.S.view] && G.render) G.render();
    });
  }

  function tenMan(v) {
    var k = G.NOI_KHACH && G.NOI_KHACH['nav.' + v + '.t'];
    if (k) return k;
    var it = G.navItem ? G.navItem(v) : null;
    return it ? it.t : '';
  }
  function nhomMan(v) {
    var ten = '';
    (G.NAV || []).forEach(function (g) { (g.items || []).forEach(function (x) { if (x.v === v) ten = g.t; }); });
    return ten;
  }
  function tenTang(n) {
    var t = (G.TIERS || []).filter(function (x) { return x.id === n; })[0];
    return t ? t.n : '';
  }
  function buocTiep(v) {
    for (var i = 0; i < BUOC_TIEP.length; i++) {
      var b = BUOC_TIEP[i];
      if (b !== v && G.VIEWS && G.VIEWS[b] && (!G.allowed || G.allowed(b))) return b;
    }
    return '';
  }

  function manNha() {
    var p = G.myPortal ? G.myPortal() : '';
    var home = G.PORTALS && G.PORTALS[p] && G.PORTALS[p].home;
    return home === 'dieu-hanh' ? 'trung-tam-do' : (home || 'ban-do');
  }

  /* Thành viên hệ thống: việc THẬT đang chờ chính người ấy, cấp chứng chỉ,
     và ai đỡ khi việc khó — tất cả đọc từ cửa kimChiNam. Không có máy chủ
     (bản thử) thì không có việc thật nào để chỉ, nên chỉ nói đường xin ý kiến. */
  function thanhVien(v, d) {
    var viec = d ? (d.viec || []) : [], b = d && d.buocTiep;
    var cap = d ? (d.cap || []) : [];
    var chip = cap.length ? cap.map(function (c) { return c.he + ' cấp ' + c.cap + '/' + c.soCap; }).join(' · ')
      : ((G.S && G.S.roleObj && G.S.roleObj.n) || 'Thành viên GITA365');
    var manViec = function (x) { return x.man || manNha(); };
    var o = '<details class="kcn"' + (moSan() ? ' open' : '') + ' data-kcn>' +
      '<summary class="kcn-dong">' + ic('compass', 'w-4 h-4') + '<b>Kim chỉ nam</b><span class="kcn-chip">' + h(chip) + '</span>' +
      '<span class="kcn-phu">' + (b ? 'Việc tiếp: ' + h(b.nhan) : d ? 'Không có việc nào đang chờ bạn' : 'Việc của bạn ở màn chính') + '</span>' +
      (d && d.nguoiDo ? '<span class="kcn-phu">Đỡ bạn: ' + h(d.nguoiDo.vai + (d.nguoiDo.ten ? ' · ' + d.nguoiDo.ten : '')) + '</span>' : '') + '</summary>';
    o += '<div class="kcn-ben">';
    o += '<div class="kcn-o"><div class="tiny up">Bạn đang ở đây</div>' +
      (cap.length ? cap.map(function (c) { return '<p class="sm">' + h(c.he) + ': cấp <b>' + c.cap + '</b>/' + c.soCap +
        (c.datThangNay ? ' · <span class="muted">đã giữ cấp tháng này</span>' : '') + '</p>'; }).join('') : '') +
      '<p class="tiny dim">' + (nhomMan(v) ? 'Màn này thuộc phần <b>' + h(nhomMan(v)) + '</b>' + (tenMan(v) ? ' · ' + h(tenMan(v)) : '') + '.' : '') + '</p></div>';
    o += '<div class="kcn-o"><div class="tiny up">Việc đang chờ bạn</div>' +
      (viec.length ? viec.map(function (x) {
        return '<button class="btn ' + (x === b ? 'pri' : 'ghost') + ' sm" data-v="' + h(manViec(x)) + '">' + ic('arrow', 'w-3 h-3') + h(x.nhan) + '</button>';
      }).join('') : '<p class="tiny dim">' + (d ? 'Không có việc nào đang chờ. Việc của khách đi theo màn chính của bạn.' : 'Việc của bạn nằm ở màn chính.') + '</p>' +
        (v !== manNha() ? '<button class="btn ghost sm" data-v="' + h(manNha()) + '">Về màn chính</button>' : '')) + '</div>';
    o += '<div class="kcn-o"><div class="tiny up">Khi việc khó</div>' +
      (d && d.nguoiDo ? '<p class="sm">' + ic('users', 'w-3 h-3') + ' ' + h(d.nguoiDo.vai) + (d.nguoiDo.ten ? ': <b>' + h(d.nguoiDo.ten) + '</b>' : '') + '</p>' : '') +
      '<p class="tiny dim">' + h((d && d.chuyenGia) || 'Việc vượt cấp của mình thì xin ý kiến cấp quản lý trước khi trả lời khách.') + '</p></div>';
    return o + '</div></details>';
  }

  G.kcnThanh = function (v) {
    if (!G.S || !G.S.acc || BO_QUA[v]) return '';
    nap();
    var d = st.d && !st.d.loi ? st.d : null;
    if (!G.LA_KHACH || !G.LA_KHACH()) return thanhVien(v, d && d.thanhVien ? d : null);
    var tang = d && d.tang ? d.tang : null;
    var ds = d ? (d.nguoiDongHanh || []) : [];
    var coTen = ds.filter(function (x) { return x.daXep && x.ten; });
    var b = buocTiep(v);
    /* Việc hôm nay của nhà — đúng một việc, từ cửa của màn Hôm nay. */
    var vh = d && d.viecHomNay;
    var nhanViec = vh && vh.ten ? 'Việc hôm nay: ' + vh.ten : vh && vh.xongHet ? 'Xong việc hôm nay' :
      vh && vh.chuaCoNhip ? 'Đặt nhịp đầu tiên cho nhà mình' : vh && vh.dangBao ? 'Nhà mình đang ở Chế độ Bão — nghỉ, chuỗi vẫn giữ' : '';
    /* Đại sứ / cộng tác viên không có "nhà" và không có tầng — nói theo vai của họ. */
    var ctv = G.S && G.S.role === 'R15';

    var chip = ctv ? 'Cộng tác viên' : tang ? 'Tầng ' + tang + ' · ' + tenTang(tang) : (d && d.nha === false ? 'Đang lập hồ sơ' : 'Hành trình 5 tầng');
    var diCung = ctv ? 'Ban vận hành Học viện' : coTen.length ? coTen[0].ten : 'người đồng hành của nhà mình';

    var o = '<details class="kcn"' + (moSan() ? ' open' : '') + ' data-kcn>' +
      '<summary class="kcn-dong">' + ic('compass', 'w-4 h-4') +
      '<b>Kim chỉ nam</b><span class="kcn-chip">' + h(chip) + '</span>' +
      (nhanViec ? '<span class="kcn-phu">' + h(nhanViec) + '</span>' : b ? '<span class="kcn-phu">Bước tiếp: ' + h(tenMan(b)) + '</span>' : '') +
      '<span class="kcn-phu">Đi cùng: ' + h(diCung) + '</span></summary>';

    o += '<div class="kcn-ben">';
    /* A · Nhà mình đang ở đâu */
    o += '<div class="kcn-o"><div class="tiny up">' + (ctv ? 'Bạn đang ở đây' : 'Nhà mình đang ở đây') + '</div>' +
      (ctv ? '' : '<div class="kcn-tang" aria-label="' + h(tang ? 'Tầng ' + tang + ' trên 5' : 'Chưa xếp tầng') + '">' +
      [1, 2, 3, 4, 5].map(function (n) { return '<span class="' + (tang && n <= tang ? 'on' : '') + '"></span>'; }).join('') + '</div>') +
      '<p class="tiny dim">' + (nhomMan(v) ? 'Màn này thuộc phần <b>' + h(nhomMan(v)) + '</b>' + (tenMan(v) ? ' · ' + h(tenMan(v)) : '') + '.' : 'Mỗi màn là một phần của bản đồ năm tầng.') + '</p></div>';
    /* B · Bước tiếp theo — một nút */
    o += '<div class="kcn-o"><div class="tiny up">Bước tiếp theo</div>' +
      (vh && vh.ten && v !== 'hom-nay' ? '<button class="btn pri sm" data-v="hom-nay">' + ic('arrow', 'w-3 h-3') + h(vh.ten) + '</button>' +
        (vh.conLai ? '<p class="tiny dim">Sau việc này còn ' + vh.conLai + ' nhịp nữa trong ngày.</p>' : '')
      : b ? '<button class="btn pri sm" data-v="' + h(b) + '">' + ic('arrow', 'w-3 h-3') + h(tenMan(b)) + '</button>'
        : '<p class="tiny dim">Nhà mình đang ở đúng màn của việc hôm nay.</p>') +
      '<p class="tiny dim">Làm từng việc nhỏ, đúng nhịp — Làm Đúng, Làm Đủ, rồi Làm Đều.</p></div>';
    /* C · Ai đang đi cùng */
    o += '<div class="kcn-o"><div class="tiny up">' + (ctv ? 'Ai hỗ trợ bạn' : 'Người đi cùng nhà mình') + '</div>';
    if (ds.length) {
      o += ds.map(function (x) {
        return '<p class="sm">' + ic('users', 'w-3 h-3') + ' <b>' + h(x.vai) + ':</b> ' +
          (x.daXep ? h(x.ten) : '<span class="muted">Học viện đang xếp người cho nhà mình</span>') + '</p>';
      }).join('');
    } else if (ctv) {
      o += '<p class="sm">' + ic('users', 'w-3 h-3') + ' Ban vận hành của Học viện hỗ trợ cộng tác viên trong từng việc.</p>';
    } else {
      o += '<p class="sm">' + ic('users', 'w-3 h-3') + ' Coach và chuyên gia tư vấn của nhà mình đi cùng suốt năm tầng.</p>';
    }
    o += '<p class="tiny dim">' + h((d && d.chuyenGia) || 'Khi việc khó vượt quá phần của người đi cùng, họ xin ý kiến Trưởng nhóm chuyên môn trước khi trả lời nhà mình.') + '</p>' +
      '<div class="row wrap" style="gap:8px">' +
      (!ctv && G.VIEWS && G.VIEWS['doi-dong-hanh'] && (!G.allowed || G.allowed('doi-dong-hanh')) && v !== 'doi-dong-hanh' ? '<button class="btn ghost sm" data-v="doi-dong-hanh">Người đi cùng nhà mình</button>' : '') +
      (G.VIEWS && G.VIEWS['tro-ly'] && (!G.allowed || G.allowed('tro-ly')) ? '<button class="btn ghost sm" data-v="tro-ly">Hỏi trợ lý GITA ngay</button>' : '') +
      '</div></div>';
    o += '</div></details>';
    return o;
  };

  /* Nhớ mở/đóng. Sự kiện toggle không nổi bọt — bắt ở pha bắt. */
  document.addEventListener('toggle', function (e) {
    var el = e.target;
    if (!el || !el.hasAttribute || !el.hasAttribute('data-kcn')) return;
    try { localStorage.setItem(KHOA_MO, el.open ? '1' : '0'); } catch (x) {}
  }, true);
})();
