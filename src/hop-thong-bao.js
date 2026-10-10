/* ═══════════════════════════════════════════════════════════════
   GITA 365 — HỘP THÔNG BÁO TRONG HỆ (khối đầu màn Trung tâm đo lường)

   Máy chủ đã ghi thông báo trong hệ từ 9.98 (bảng thongBao: khoản chi
   chờ duyệt, tiền vào lạ, và từ 9/10/2026 là yêu cầu tư vấn từ trang
   Liên hệ) — và cửa đọc hopThongBao đã có. Nhưng tới 9/10/2026 KHÔNG MÀN
   NÀO GỌI cửa ấy: hệ ghi thông báo mà không ai đọc được. Một thông báo
   không ai đọc được thì trên thực tế là không có.

   Khối này chỉ ĐỌC và ĐÁNH DẤU ĐÃ XEM — đúng hai cửa đã có, không dựng
   cửa mới. Máy chủ lọc theo VAI của phiên (thông báo gửi R01 và R03 —
   chốt baoLenCapCao), nên lọc ở đây không phải lớp bảo vệ.
   Mọi chữ ở đây đều do người ngoài gõ (tên, lời nhắn) → qua h().
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;
(function(){
  var U = G.U, h = U.h;
  var st = { ai:'', d:null, dang:false, loi:'', mo:{} };
  function coMayChu(){ return !!(G.API_CAP_PHEP && G.PHIEN_TOKEN); }
  /* Khối này nằm ở màn chính của nhiều vai (Điều hành · Buồng lái Coach ·
     Khoang mở cửa) — vẽ lại đúng màn đang mở nó, không cứng một tên màn. */
  var MAN_CO_HOP = { 'trung-tam-do':1, 'coach-deck':1, 'tuvan-deck':1 };
  function veLai(){ if(G.S && MAN_CO_HOP[G.S.view] && G.render) G.render(); }
  function gio(s){ try { var d = new Date(s); return ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2) + ' · ' + d.getDate() + '/' + (d.getMonth() + 1); } catch(e){ return ''; } }
  var LOAI = { lienHe:'Yêu cầu tư vấn', viecKet:'Việc kẹt', traLuong:'Lịch trả lương' };
  var MUC = { gap:['gấp','var(--gita-do)'], canXem:['cần xem','var(--warn)'], tin:['tin','var(--ink-4)'] };

  function nap(){
    var ai = String((G.S && G.S.acc && G.S.acc.u) || '');
    if(st.ai !== ai) st = { ai:ai, d:null, dang:false, loi:'', mo:{} };
    if(!coMayChu() || st.d || st.dang || st.loi) return;
    st.dang = true;
    G.goiMayChu('hopThongBao', { chuaDoc: true }).then(function(r){
      st.dang = false;
      if(r && r.ok) st.d = r; else st.loi = (r && r.error) || 'Chưa đọc được hộp thông báo.';
      veLai();
    });
  }

  document.addEventListener('click', function(e){
    var b = e.target.closest && e.target.closest('[data-htb]'); if(!b || b.disabled) return;
    var id = b.getAttribute('data-id'), viec = b.getAttribute('data-htb');
    if(viec === 'mo'){ st.mo[id] = !st.mo[id]; veLai(); return; }
    if(viec === 'tai'){ st.d = null; st.loi = ''; veLai(); return; }
    if(viec !== 'xem') return;
    b.disabled = true;
    G.goiMayChu('danhDauDaDoc', { id: id }).then(function(r){
      if(r && r.ok){
        if(st.d) st.d.ds = (st.d.ds || []).filter(function(x){ return x.id !== id; });
        U.toast('Đã đánh dấu đã xem.', 'ok');
      } else { b.disabled = false; U.toast((r && r.error) || 'Chưa đánh dấu được.', 'err'); }
      veLai();
    });
  });

  /* Gọi từ G.VIEWS['trung-tam-do'] — màn đích của R01–R03 lúc đăng nhập
     (app.js; 'dieu-hanh' chỉ chuyển hướng sang đây). Không có máy chủ (bản thử) thì không
     vẽ gì — bản thử không có thông báo thật để hiện. */
  G.htbKhoi = function(){
    if(!coMayChu()) return '';
    nap();
    var o = '<section class="card pad mb htb"><div class="row" style="gap:8px;flex-wrap:wrap;align-items:center">' +
      '<b>Hộp thông báo</b><span class="grow"></span>' +
      '<button class="btn sm" data-htb="tai">Tải lại</button></div>';
    if(st.loi) return o + '<p class="tiny" style="color:var(--gita-do);margin:8px 0 0">' + h(st.loi) + '</p></section>';
    if(!st.d) return o + '<p class="tiny muted" style="margin:8px 0 0">Đang đọc…</p></section>';
    var ds = st.d.ds || [];
    if(!ds.length) return o + '<p class="tiny muted" style="margin:8px 0 0">Không có thông báo nào chờ xem. Lịch trả lương bị dời và yêu cầu gửi tới vai của bạn sẽ hiện ở đây.</p></section>';
    o += '<p class="tiny muted" style="margin:6px 0 10px">' + ds.length + ' thông báo chờ xem — gửi tới vai của bạn.</p>';
    o += ds.map(function(x){
      var m = MUC[x.mucDo] || MUC.tin, mo = !!st.mo[x.id];
      return '<div class="htb-dong" style="border-top:1px solid var(--line);padding:10px 0">' +
        '<div class="row" style="gap:8px;flex-wrap:wrap;align-items:center">' +
        '<span class="tiny b" style="color:' + m[1] + '">' + h(m[0]) + '</span>' +
        '<span class="tiny muted">' + h(LOAI[x.loai] || x.loai) + ' · ' + h(gio(x.luc)) + '</span>' +
        '<span class="grow"></span>' +
        '<button class="btn sm" data-htb="mo" data-id="' + h(x.id) + '">' + (mo ? 'Thu gọn' : 'Xem') + '</button>' +
        '<button class="btn sm" data-htb="xem" data-id="' + h(x.id) + '">Đã xem</button></div>' +
        '<b class="sm" style="display:block;margin-top:4px">' + h(x.tieuDe) + '</b>' +
        (mo ? '<pre class="tiny" style="white-space:pre-wrap;margin:6px 0 0;font-family:inherit">' + h(x.than) + '</pre>' : '') +
        '</div>';
    }).join('');
    return o + '</section>';
  };
})();
