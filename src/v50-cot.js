/* ═══════════════════════════════════════════════════════════════
   GITA 365 — V50·168 · CỘT TRÁI THEO MÀN CHÍNH + THANH PHẦN

   Cột trái của MỌI vai chỉ còn các màn chính của vai (3 · 5 · 10 · 12 —
   src/v50-man.js), thay cho khối không gian làm việc và sáu nhóm "Toàn hệ
   thống". Bấm một màn chính là mở phần đầu tiên vai được dùng.
   Đầu mỗi trang có THANH PHẦN: tên màn chính, các phần của nó (phần chưa
   mở hiện khoá kèm lý do theo cấp · tầng · gói), và lối vào kho nghề của
   màn. Trang nằm ngoài các phần (chương học thuyết, mục chi tiết của bảng
   điều khiển) hiện đường dẫn về màn chính đang chứa nó.
   Quyền không đổi ở đây: mỗi nút đi qua cùng cổng visible()/allowed() với
   app.js; máy chủ vẫn gác mọi thao tác.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;
(function(){
  var U = G.U, h = U.h, ic = U.ic;

  function bat(){ return !!(G.V50M && G.V50 && !G.V50.tat()); }
  G.v50Bat168 = bat;
  function moDuoc(v){ var it = G.navItem ? G.navItem(v) : null; return !!it && (!G.mucHien || G.mucHien(it)) && (!G.allowed || G.allowed(v)); }
  /* Phần đầu tiên vai mở được của một màn chính */
  function phanDau(hb){ for(var i = 0; i < hb.phan.length; i++) if(moDuoc(hb.phan[i])) return hb.phan[i]; return null; }
  function hubsVai(){ return G.V50M.hubVai().map(G.V50M.hub).filter(function(hb){ return hb && phanDau(hb); }); }
  G.v50HubsVai = hubsVai;
  /* Trang mở đầu sau đăng nhập: phần đầu tiên vai được dùng (theo quyền,
     chưa cần kho — kho mở sau). */
  G.v50ManDau = function(){
    if(!bat()) return null;
    var ds = G.V50M.hubVai();
    for(var i = 0; i < ds.length; i++){
      var hb = G.V50M.hub(ds[i]); if(!hb) continue;
      for(var j = 0; j < hb.phan.length; j++){ var p = hb.phan[j]; if(G.VIEWS[p] && (!G.allowed || G.allowed(p))) return p; }
    }
    return null;
  };
  function hubHienTai(){ return G.V50M.hubCua(G.S.view, G.V50M.hubVai()); }

  /* ── Cột trái ── */
  G.v50CotTrai = function(){
    var ds = hubsVai(), cur = hubHienTai();
    var r = G.S.roleObj || {};
    return '<div class="kg v50-cot">' +
      '<div class="nav-eyebrow kg-lbl">' + h(G.LANG === 'en' ? 'My screens' : 'Màn làm việc') + ' · ' + ds.length + '</div>' +
      ds.map(function(hb){
        var on = hb.id === cur;
        return '<button class="nav-i' + (on ? ' on' : '') + '" data-v="' + h(phanDau(hb)) + '" title="' + h(hb.viec) + '">' + ic(hb.ic) +
          '<span class="lb">' + h(hb.ten) + '</span></button>';
      }).join('') +
      '<p class="kg-note" style="margin-top:8px">' + h(r.n || '') + ' · mở theo cấp bậc, tầng và gói của tài khoản.</p></div>';
  };
  /* Thanh ngang (desktop) cũng là màn chính */
  G.v50Hnav = function(){
    var cur = hubHienTai();
    return hubsVai().map(function(hb){
      return '<button class="hnav-i' + (hb.id === cur ? ' on' : '') + '" data-v="' + h(phanDau(hb)) + '" title="' + h(hb.viec) + '">' + ic(hb.ic) + '<span>' + h(hb.ten) + '</span></button>';
    }).join('');
  };

  /* ── Thanh phần ở đầu trang ── */
  G.v50PhanBar = function(v){
    if(!bat() || !G.S || !G.S.acc) return '';
    var id = G.V50M.hubCua(v, G.V50M.hubVai()), hb = id && G.V50M.hub(id);
    if(!hb) return '';
    var trongVai = G.V50M.hubVai().indexOf(hb.id) >= 0;
    var laPhan = hb.phan.indexOf(v) >= 0;
    var o = '<nav class="v50-phan" aria-label="Các phần của màn ' + h(hb.ten) + '"><div class="v50-phan-dau">' + ic(hb.ic, 'w-4 h-4') + '<b>' + h(hb.ten) + '</b>';
    if(!laPhan){ var it = G.navItem ? G.navItem(v) : null; o += '<span class="tiny muted">› ' + h(it ? G.iname(it) : v) + '</span>'; }
    if(!trongVai) o += '<span class="tiny muted">· ngoài các màn của vai này</span>';
    o += '</div><div class="v50-phan-ds">';
    hb.phan.forEach(function(p){
      var it = G.navItem ? G.navItem(p) : null; if(!it) return;
      var ly = G.V50M.khoa(p);
      if(ly === 'Chưa có trên bản này') return;
      if(ly) o += '<button class="v50-pc v50-pc-khoa" data-v50m="khoa" data-v2="' + h(ly) + '" title="' + h(ly) + '">' + ic('lock','w-3 h-3') + h(G.iname(it)) + '</button>';
      else o += '<button class="v50-pc' + (p === v ? ' on' : '') + '" data-v="' + h(p) + '"' + (p === v ? ' aria-current="page"' : '') + '>' + h(G.iname(it)) + '</button>';
    });
    hb.kho.forEach(function(ma){
      var c = G.V50.cum(ma); if(!c) return;
      var k = 'kn-' + ma.toLowerCase();
      if(moDuoc(k)) o += '<button class="v50-pc v50-pc-kho' + (k === v ? ' on' : '') + '" data-v="' + k + '">' + ic('vault','w-3 h-3') + 'Kho · ' + h(c.ten) + '</button>';
    });
    return o + '</div></nav>';
  };

  document.addEventListener('click', function(e){
    var el = e.target.closest && e.target.closest('[data-v50m]'); if(!el) return;
    if(el.getAttribute('data-v50m') === 'khoa') U.toast(el.getAttribute('data-v2') || 'Phần này chưa mở với tài khoản này.', 'err');
  });
})();
