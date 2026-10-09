/* ═══════════════════════════════════════════════════════════════
   GITA 365 — KHỐI "VIỆC KẸT" (đầu màn Trung tâm đo lường, R01–R03)

   Đọc cửa docViecKet (may-chu/viec-ket.js): mỗi hàng đợi việc có bao nhiêu
   việc đang chạy, bao nhiêu việc chờ CÓ CHỦ, bao nhiêu việc KẸT (không ai
   cầm, quá hạn, nằm im quá ngưỡng). Hàng nào máy không đọc được thì nói
   "không biết" — không ghi 0. Mỗi việc kẹt có nút đi thẳng tới màn xử lý.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;
(function(){
  var U = G.U, h = U.h;
  var st = { ai:'', d:null, dang:false, loi:'', mo:'' };
  function coMayChu(){ return !!(G.API_CAP_PHEP && G.PHIEN_TOKEN); }
  function veLai(){ if(G.S && G.S.view === 'trung-tam-do' && G.render) G.render(); }
  function nap(){
    var ai = String((G.S && G.S.acc && G.S.acc.u) || '');
    if(st.ai !== ai) st = { ai:ai, d:null, dang:false, loi:'', mo:'' };
    if(st.d || st.dang || st.loi) return;
    st.dang = true;
    G.goiMayChu('docViecKet', {}).then(function(r){
      st.dang = false;
      if(r && r.ok) st.d = r; else st.loi = (r && r.error) || 'Chưa đọc được mạch việc kẹt.';
      veLai();
    });
  }
  document.addEventListener('click', function(e){
    var b = e.target.closest && e.target.closest('[data-vk]'); if(!b) return;
    var m = b.getAttribute('data-vk');
    if(m === 'tai'){ st.d = null; st.loi = ''; veLai(); return; }
    st.mo = st.mo === m ? '' : m; veLai();
  });
  var TT = { ket:['kẹt','var(--gita-do)'], ok:['thông','var(--ok)'], chuaDung:['chưa dùng','var(--ink-4)'], khongBiet:['không biết','var(--warn)'] };

  G.vkKhoi = function(){
    if(!coMayChu()) return '';
    nap();
    var o = '<section class="card pad mb vk"><div class="row" style="gap:8px;flex-wrap:wrap;align-items:center">' +
      '<b>Việc kẹt · không để việc nào rơi giữa chừng</b><span class="grow"></span>' +
      '<button class="btn sm" data-vk="tai">Soát lại</button></div>';
    if(st.loi) return o + '<p class="tiny" style="color:var(--gita-do);margin:8px 0 0">' + h(st.loi) + '</p></section>';
    if(!st.d) return o + '<p class="tiny muted" style="margin:8px 0 0">Đang soát…</p></section>';
    var d = st.d, t = d.tong || {};
    o += '<div class="vk-so">' +
      '<div><span class="tiny muted">Đang chạy</span><b>' + h(String(t.dang || 0)) + '</b></div>' +
      '<div><span class="tiny muted">Chờ có chủ</span><b>' + h(String(t.cho || 0)) + '</b></div>' +
      '<div class="' + (t.ket ? 'vk-do' : '') + '"><span class="tiny muted">Kẹt</span><b>' + h(String(t.ket || 0)) + '</b></div>' +
      (t.khongBiet ? '<div><span class="tiny muted">Hàng không đọc được</span><b>' + h(String(t.khongBiet)) + '</b></div>' : '') +
      '</div>';
    o += '<p class="tiny muted" style="margin:0 0 8px">Kẹt = không ai cầm, quá hạn, hoặc nằm im quá ngưỡng. Chờ có chủ = có người cầm và hạn còn sống — đó là chờ đúng, không phải kẹt.</p>';
    var hang = (d.hang || []).slice().sort(function(a, b){ return (b.so.ket - a.so.ket) || (a.trangThai === 'chuaDung') - (b.trangThai === 'chuaDung'); });
    o += '<div class="vk-ds">' + hang.map(function(x){
      var tt = TT[x.trangThai] || TT.khongBiet;
      var r = '<div class="vk-hang"><button class="vk-dau" data-vk="' + h(x.ma) + '" aria-expanded="' + (st.mo === x.ma ? 'true' : 'false') + '">' +
        '<span class="vk-ten">' + h(x.ten) + '</span>' +
        '<span class="tiny mono">' + h(String(x.so.ket)) + (x.itNhat ? '+' : '') + ' kẹt · ' + h(String(x.so.cho)) + ' chờ · ' + h(String(x.so.dang)) + ' chạy</span>' +
        '<span class="pill" style="color:' + tt[1] + '">' + h(tt[0]) + '</span></button>';
      if(st.mo === x.ma){
        r += '<div class="vk-mo"><p class="tiny muted">' + h(x.vi || '') + '</p>';
        if(x.loi) r += '<p class="tiny" style="color:var(--warn)">Máy không đọc được hàng này: ' + h(x.loi) + '</p>';
        if((x.mau || []).length) r += '<ul class="tiny vk-mau">' + x.mau.map(function(m){
          return '<li><b class="mono">' + h(m.id) + '</b>' + (m.tomTat ? ' · ' + h(m.tomTat) : '') + ' — ' + h(m.viSao) + '</li>';
        }).join('') + '</ul>';
        r += '<button class="btn sm" data-v="' + h(x.cua) + '">Mở màn xử lý</button></div>';
      }
      return r + '</div>';
    }).join('') + '</div>';
    return o + '</section>';
  };
})();
