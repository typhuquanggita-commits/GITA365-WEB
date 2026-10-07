/* ═══════════════════════════════════════════════════════════════
   GITA 365 — V50·168 · CỘT TRÁI HAI KHU VỰC + THANH PHẦN

   Chủ hệ (07/10/2026): tách riêng màn khách hàng và màn nhân sự.
     · KHÁCH (phụ huynh · học sinh · CTV · khách lạ): chỉ thấy màn của mình,
       mở theo quyền lợi của tài khoản. KHÔNG một dấu vết nghiệp vụ nhân sự:
       phần khoá vì "ngoài vai" bị ẩn hẳn; chỉ hiện khoá tầng / gói / kích
       hoạt — tức quyền lợi sẽ được mở.
     · NHÂN SỰ: hai khu tách bạch ở cột trái —
         KHU VỰC NHÂN SỰ   màn nghiệp vụ đúng vai / cấp (+ quyền Super Admin
                           cấp thêm: CRM, ban tài chính, T5-PRO…)
         KHU VỰC KHÁCH HÀNG màn của khách, xem trong phạm vi quyền
       Nhân sự chỉ thấy phần mình dùng được — không phần khoá nào.
     · ADMIN HỆ THỐNG · SUPER ADMIN: hiển thị 100% cả hai khu.
   Quyền thật không đổi ở đây: nút nào cũng qua visible()/allowed() của
   app.js, và máy chủ gác mọi thao tác.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;
(function(){
  var U = G.U, h = U.h, ic = U.ic;

  function bat(){ return !!(G.V50M && G.V50 && !G.V50.tat()); }
  G.v50Bat168 = bat;
  function M(){ return G.V50M; }
  function moDuoc(v){ var it = G.navItem ? G.navItem(v) : null; return !!it && (!G.mucHien || G.mucHien(it)) && (!G.allowed || G.allowed(v)); }
  function phanDau(hb){ for(var i = 0; i < hb.phan.length; i++) if(moDuoc(hb.phan[i])) return hb.phan[i]; return null; }
  function coPhan(hb){ return hb && phanDau(hb); }
  function hubsVai(){ return M().hubVai().map(M().hub).filter(coPhan); }
  function hubsKhach(){ return M().hubKhach().map(M().hub).filter(coPhan); }
  G.v50HubsVai = hubsVai;
  function hubHienTai(){ return M().hubCua(G.S.view, M().hubTatCa()); }

  /* Trang mở đầu sau đăng nhập: phần đầu tiên của màn nghiệp vụ đầu tiên. */
  G.v50ManDau = function(){
    if(!bat()) return null;
    var ds = M().hubVai();
    for(var i = 0; i < ds.length; i++){
      var hb = M().hub(ds[i]); if(!hb) continue;
      for(var j = 0; j < hb.phan.length; j++){ var p = hb.phan[j]; if(G.VIEWS[p] && (!G.allowed || G.allowed(p))) return p; }
    }
    return null;
  };

  /* Số trên dải phạm vi đếm theo màn của vai, không theo 270 mục cũ. */
  G.v50DemPhamVi = function(){
    var mo = 0, choTang = 0, khoa = 0, thay = {};
    M().hubTatCa().forEach(function(id){
      var hb = M().hub(id); if(!hb) return;
      hb.phan.forEach(function(p){
        if(thay[p]) return; thay[p] = 1;
        var l = M().khoaLoai(p);
        if(!l) mo++; else if(l === 'tang' || l === 'goi' || l === 'kichHoat') choTang++; else if(l === 'vai') khoa++;
      });
    });
    return { mo:mo, khoa:khoa, choTang:choTang };
  };

  function nutHub(hb, cur){
    return '<button class="nav-i' + (hb.id === cur ? ' on' : '') + '" data-v="' + h(phanDau(hb)) + '" title="' + h(hb.viec) + '">' + ic(hb.ic) +
      '<span class="lb">' + h(hb.ten) + '</span></button>';
  }

  /* ── Cột trái ── */
  G.v50CotTrai = function(){
    var cur = hubHienTai(), r = G.S.roleObj || {};
    if(M().laKhach()){
      var dk = hubsVai();
      return '<div class="kg v50-cot"><div class="nav-eyebrow kg-lbl">' + h(G.LANG === 'en' ? 'My family' : 'Nhà mình') + '</div>' +
        dk.map(function(hb){ return nutHub(hb, cur); }).join('') +
        '<p class="kg-note" style="margin-top:8px">Mở theo tầng và gói dịch vụ của tài khoản.</p></div>';
    }
    var ns = hubsVai(), kh = hubsKhach();
    var o = '<div class="kg v50-cot">' +
      '<div class="kg-sec kg-viec"><div class="kg-h">' + ic('target') + '<b>' + h(G.LANG === 'en' ? 'Staff area' : 'Khu vực nhân sự') + '</b><span class="kg-n">' + ns.length + '</span></div>' +
      ns.map(function(hb){ return nutHub(hb, cur); }).join('') + '</div>';
    if(kh.length)
      o += '<div class="kg-sec kg-khach"><div class="kg-h">' + ic('heart') + '<b>' + h(G.LANG === 'en' ? 'Customer area' : 'Khu vực khách hàng') + '</b><span class="kg-n">' + kh.length + '</span></div>' +
        '<p class="kg-note">Màn của khách, xem trong phạm vi quyền của ' + h(r.n || 'vai') + '.</p>' +
        kh.map(function(hb){ return nutHub(hb, cur); }).join('') + '</div>';
    return o + '</div>';
  };
  /* Thanh ngang (desktop): khu nhân sự, rồi khu khách hàng */
  G.v50Hnav = function(){
    var cur = hubHienTai();
    var nut = function(hb){ return '<button class="hnav-i' + (hb.id === cur ? ' on' : '') + '" data-v="' + h(phanDau(hb)) + '" title="' + h(hb.viec) + '">' + ic(hb.ic) + '<span>' + h(hb.ten) + '</span></button>'; };
    var o = hubsVai().map(nut).join('');
    if(!M().laKhach()){ var kh = hubsKhach(); if(kh.length) o += '<span class="v50-hnav-ngan" aria-hidden="true"></span>' + kh.map(nut).join(''); }
    return o;
  };

  /* ── Thanh phần ở đầu trang ── */
  var CAP_QUYEN = { 'phan-quyen':1, 'phan-quyen-crm':1, 'cap-tai-khoan':1 };
  G.v50PhanBar = function(v){
    if(!bat() || !G.S || !G.S.acc) return '';
    var tat = M().hubTatCa(), id = M().hubCua(v, tat), hb = id && M().hub(id);
    if(!hb) return '';
    var khach = M().laKhach();
    if(khach && hb.khu !== 'khach') return '';           /* khách không bao giờ thấy khung màn nghiệp vụ */
    var laPhan = hb.phan.indexOf(v) >= 0;
    var nhan = khach ? '' : (hb.khu === 'khach' ? 'Khu vực khách hàng · ' : 'Khu vực nhân sự · ');
    var o = '<nav class="v50-phan' + (hb.khu === 'khach' ? ' v50-phan-kh' : '') + '" aria-label="Các phần của màn ' + h(hb.ten) + '"><div class="v50-phan-dau">' +
      ic(hb.ic, 'w-4 h-4') + (nhan ? '<span class="tiny muted">' + h(nhan) + '</span>' : '') + '<b>' + h(hb.ten) + '</b>';
    if(!laPhan){ var it = G.navItem ? G.navItem(v) : null; o += '<span class="tiny muted">› ' + h(it ? G.iname(it) : v) + '</span>'; }
    if(tat.indexOf(hb.id) < 0) o += '<span class="tiny muted">· ngoài các màn của vai này</span>';
    o += '</div><div class="v50-phan-ds">';
    hb.phan.forEach(function(p){
      var it = G.navItem ? G.navItem(p) : null; if(!it) return;
      var loai = M().khoaLoai(p);
      if(!loai){
        o += '<button class="v50-pc' + (p === v ? ' on' : '') + '" data-v="' + h(p) + '"' + (p === v ? ' aria-current="page"' : '') + '>' + h(G.iname(it)) + '</button>';
        return;
      }
      /* Chỉ KHÁCH thấy phần còn khoá, và chỉ khoá quyền lợi (tầng · gói · kích hoạt). */
      if(khach && (loai === 'tang' || loai === 'goi' || loai === 'kichHoat')){
        var ly = M().khoa(p);
        o += '<button class="v50-pc v50-pc-khoa" data-v50m="khoa" data-v2="' + h(ly) + '" title="' + h(ly) + '">' + ic('lock','w-3 h-3') + h(G.iname(it)) + '</button>';
      }
    });
    hb.kho.forEach(function(ma){
      var c = G.V50.cum(ma); if(!c) return;
      var k = 'kn-' + ma.toLowerCase();
      if(moDuoc(k)) o += '<button class="v50-pc v50-pc-kho' + (k === v ? ' on' : '') + '" data-v="' + k + '">' + ic('vault','w-3 h-3') + (khach ? 'Bài đọc · ' : 'Kho · ') + h(c.ten) + '</button>';
    });
    o += '</div>';
    if(CAP_QUYEN[v] && G.S.roleObj && G.S.roleObj.id !== 'R01')
      o += '<p class="tiny" style="margin:6px 2px 0;color:var(--alert)">Chế độ xem: cấp quyền 100% do Super Admin — máy chủ từ chối thao tác cấp quyền từ tài khoản này.</p>';
    return o + '</nav>';
  };

  document.addEventListener('click', function(e){
    var el = e.target.closest && e.target.closest('[data-v50m]'); if(!el) return;
    if(el.getAttribute('data-v50m') === 'khoa') U.toast(el.getAttribute('data-v2') || 'Phần này chưa mở với tài khoản này.', 'err');
  });
})();
