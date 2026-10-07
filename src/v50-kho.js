/* ═══════════════════════════════════════════════════════════════
   GITA 365 — V50·168 · 14 TRANG KHO NGHỀ (kn-*)

   154 trang học thuyết cũ đứng rời ở cột trái nay là CHƯƠNG trong 14 kho
   nghề, mỗi kho một cụm (src/data-v50.js). Mỗi trang kho:
     · nói kho này phục vụ việc gì và đổi chỉ số nào ở Trung tâm đo lường
     · bảng việc áp dụng của cụm (Tự soát → điểm, src/v50-ap-dung.js)
     · danh sách chương: chương đã mở bấm vào đọc; chương chưa mở hiện khoá
       và lý do theo cấp · tầng · gói · vai (G.V50M.khoa)
     · các màn chính dùng kho này, và lối sang Thư viện tài liệu
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G; G.VIEWS = G.VIEWS || {};
(function(){
  var U = G.U, h = U.h, ic = U.ic;
  function kpiTen(ma){ var T = G.TU; if(!T) return ma; for(var i = 0; i < T.KPI.length; i++) if(T.KPI[i].ma === ma) return T.KPI[i].ten; return ma; }

  function ve(c){
    var V = G.V50, M = G.V50M;
    var nhanSu = V.laNhanSu(), khach = M.laKhach();
    var mo = [], khoa = [];
    c.man.forEach(function(v){
      var it = G.navItem ? G.navItem(v) : null; if(!it) return;
      var loai = M.khoaLoai(v);
      if(!loai) mo.push(it);
      /* Khách chỉ thấy chương khoá theo quyền lợi (tầng · gói · kích hoạt);
         chương nghiệp vụ của đội ngũ ẩn hẳn. Nhân sự chỉ thấy chương khoá do gói. */
      else if(loai !== 'khong' && (khach ? loai !== 'vai' : loai !== 'vai')) khoa.push([it, M.khoa(v)]);
    });
    var dung = M.HUB.filter(function(hb){ return hb.kho.indexOf(c.ma) >= 0; }).map(function(hb){ return hb.ten; });
    var o = U.ph({ eyebrow: khach ? 'BÀI ĐỌC CỦA NHÀ MÌNH' : 'KHO NGHỀ · V50', ic:'vault', grad:1, t:c.ten, lead:c.mo });
    if(khach){
      o += '<div class="card mb"><b>Bài đã mở</b>' + (mo.length ? '<div class="v50-man">' + mo.map(function(it){ return '<button class="v50-mo" data-v="' + h(it.v) + '">' + ic(it.ic || 'book','w-3 h-3') + '<span>' + h(G.iname(it)) + '</span></button>'; }).join('') + '</div>' : '<p class="sm muted mt">Chưa có bài nào mở với tài khoản này.</p>') + '</div>';
      if(khoa.length) o += '<div class="card mb"><b>Mở ở chặng sau</b><p class="tiny muted" style="margin:3px 0 0">Mở khi nhà lên tầng hoặc khi gói dịch vụ được kích hoạt.</p><div class="v50-man">' +
        khoa.map(function(x){ return '<span class="v50-mo v50-khoa" title="' + h(x[1]) + '">' + ic('lock','w-3 h-3') + '<span>' + h(G.iname(x[0])) + ' <small class="muted">· ' + h(x[1]) + '</small></span></span>'; }).join('') + '</div></div>';
      return o;
    }
    o += '<div class="grid g3 mb">' +
      '<div class="card"><div class="up tiny muted">Chương đã mở</div><div class="v50-so">' + mo.length + '<small class="tiny muted"> / ' + (mo.length + khoa.length) + '</small></div><div class="tiny muted">theo vai, tầng và gói của tài khoản này</div></div>' +
      '<div class="card"><div class="up tiny muted">Chỉ số chịu tác động</div><b>' + h(kpiTen(c.kpi)) + '</b><div class="tiny muted">đo ở Trung tâm đo lường</div></div>' +
      '<div class="card"><div class="up tiny muted">Dùng ở màn chính</div><div class="sm">' + h(dung.join(' · ') || 'Kho nghề & tài liệu') + '</div></div></div>';
    if(nhanSu)
      o += '<div class="card mb"><div class="row wrap" style="justify-content:space-between;gap:8px"><div><b>Áp dụng vào việc</b><p class="tiny muted" style="margin:3px 0 0">' + c.viec.length + ' việc đo được của cụm này. Tự soát để biết đội đang làm theo tới đâu.</p></div>' +
        '<button class="btn pri" data-v50="soat" data-v2="' + h(c.ma) + '">' + ic('check','w-3 h-3') + 'Tự soát ' + c.viec.length + ' việc</button></div>' +
        '<ol class="sm" style="margin:10px 0 0;padding-left:20px;line-height:1.7">' + c.viec.map(function(t){ return '<li>' + h(t) + '</li>'; }).join('') + '</ol></div>';
    o += '<div class="card mb"><b>Chương mở được</b>' +
      (mo.length ? '<div class="v50-man">' + mo.map(function(it){ return '<button class="v50-mo" data-v="' + h(it.v) + '">' + ic(it.ic || 'book','w-3 h-3') + '<span>' + h(G.iname(it)) + '</span></button>'; }).join('') + '</div>'
                 : '<p class="sm muted mt">Chưa có chương nào mở với tài khoản này.</p>') + '</div>';
    if(khoa.length)
      o += '<div class="card mb"><b>Chương còn khoá</b><p class="tiny muted" style="margin:3px 0 0">Mở theo cấp bậc, tầng của nhà và gói dịch vụ — đúng quyền lợi của tài khoản.</p>' +
        '<div class="v50-man">' + khoa.map(function(x){ return '<span class="v50-mo v50-khoa" title="' + h(x[1]) + '">' + ic('lock','w-3 h-3') + '<span>' + h(G.iname(x[0])) + ' <small class="muted">· ' + h(x[1]) + '</small></span></span>'; }).join('') + '</div></div>';
    o += '<div class="row wrap" style="gap:8px"><button class="btn ghost" data-v="thu-vien">' + ic('book','w-3 h-3') + 'Thư viện tài liệu</button>' +
      '<button class="btn ghost" data-v="thu-vien-v50">' + ic('vault','w-3 h-3') + 'Tất cả 14 kho</button></div>';
    return o;
  }

  function dangKy(ma){
    G.VIEWS['kn-' + ma.toLowerCase()] = function(){
      var c = G.V50 && G.V50.cum(ma);
      if(!c || !G.V50M) return U.lockCard('Thiếu bản đồ kho nghề.');
      return ve(c);
    };
  }
  ['PP','KHO','NGHE','COACH','TUVAN','VIP','TRAI','MK','GD','NHA','PL','TC','KT','CT'].forEach(dangKy);
})();
