/* ═══════════════════════════════════════════════════════════════
   GITA 365 — SOÁT TOÀN BỘ MÀN (Super Admin · V50)

   Bản thử không mở được kho tri thức (khoá chỉ ở Cloudflare), nên mọi
   lần soát từ bên ngoài chỉ thấy ~56 màn gói nghề ở dạng "chưa mở". Công
   cụ này chạy NGAY TRONG phiên thật của Super Admin — kho đã mở bằng khoá
   thật — và tự đi qua từng mục cột trái (kể cả màn đã gộp, màn đã rút vào
   Thư viện vận hành), đo mỗi màn:
     ô nhập · nút · nút làm việc · liên kết màn · thẻ · bảng · độ dài chữ ·
     số minh hoạ · bị khoá · lỗi khi dựng · thời gian dựng · các tiêu đề ·
     1.500 ký tự đầu của nội dung.
   Kết quả hiện ngay cho Super Admin (bảng phân loại), và có thể GỬI CHO
   TRỢ LÝ PHÂN TÍCH dưới dạng MÃ HOÁ: mã hoá trong trình duyệt bằng khoá
   công khai src/khoa-soat.js (AES-256-GCM + RSA-OAEP-3072). Máy chủ chỉ cất
   bản mã (ghiSoatMan); GitHub chỉ chuyển bản mã. Nội dung kho không bao
   giờ đi ra ngoài ở dạng đọc được.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G; G.VIEWS = G.VIEWS || {};
(function(){
  var U = G.U, h = U.h, ic = U.ic;
  var VIEW = 'soat-toan-man';
  var st = { chay:false, i:0, n:0, kq:null, luc:'', gui:'', loiGui:'', maHoa:null };

  function laChu(){ var r = G.S && G.S.roleObj; return !!(r && r.id === 'R01'); }
  G.soatDuocToanMan = laChu;
  G.soatKetQua = function(){ return st.kq; };
  function coMayChu(){ return !!(G.API_CAP_PHEP && G.PHIEN_TOKEN); }
  function so(n){ return Number(n).toLocaleString('vi-VN'); }
  var MAU = /ví dụ minh hoạ|số liệu minh hoạ|dữ liệu mẫu|số mẫu|giả định/i;
  var KHOA = /PHẦN NÀY CHƯA MỞ|Vai hiện tại chưa mở|NGOÀI PHẠM VI CỦA VAI|Chưa mở được|Đang mở kho|chưa tới lượt màn hình này/i;

  /* ── Đo một màn đang hiện ── */
  function cat(s, n){ s = String(s || '').replace(/\s+/g, ' ').trim(); return s.length > n ? s.slice(0, n) : s; }
  function doMan(it, ms, loi){
    var main = document.getElementById('main');
    var goc = main && (main.querySelector('.view') || main);
    var r = { v:it.v, t:it.t, nhom:it.nhom, perm:it.perm || '', view:G.S.view, ms:ms, loi:loi };
    if(!goc) return r;
    var ban = goc.cloneNode(true);
    var bo = ban.querySelectorAll('.nhac-thanh,.hd-thanh,.v50-thanh,.v50-gop');
    for(var i = 0; i < bo.length; i++) if(bo[i].parentNode) bo[i].parentNode.removeChild(bo[i]);
    var chu = cat(ban.textContent, 100000);
    var hanh = 0, dh = 0, tat = ban.querySelectorAll('*');
    for(var j = 0; j < tat.length; j++){
      var at = tat[j].attributes, laHD = false;
      for(var k = 0; k < at.length; k++){
        var ten = at[k].name; if(ten.indexOf('data-') !== 0) continue;
        if(ten === 'data-v') dh++;
        else if(!/^data-(i|v2|id|m|ma|kpi|tip|tt|ten|cum)$/.test(ten)) laHD = true;
      }
      if(laHD) hanh++;
    }
    var dau = [], thay = {};
    var hs = ban.querySelectorAll('h1,h2,h3,h4,summary,th,.card > b:first-child,.card > div:first-child > b');
    for(var m = 0; m < hs.length && dau.length < 30; m++){ var x = cat(hs[m].textContent, 100); if(x && !thay[x]){ thay[x] = 1; dau.push(x); } }
    var ph = ban.querySelector('header.ph');
    r.nhap = ban.querySelectorAll('input,select,textarea').length;
    r.nut = ban.querySelectorAll('button').length;
    r.hanhDong = hanh; r.dieuHuong = dh;
    r.the = ban.querySelectorAll('.card').length;
    r.bang = ban.querySelectorAll('table,[role="table"]').length;
    r.li = ban.querySelectorAll('li').length;
    r.dai = chu.length;
    r.mau = MAU.test(chu);
    r.khoa = KHOA.test(ph ? ph.textContent : chu.slice(0, 400));
    r.tieuDe = cat(ph ? ph.textContent : '', 200);
    r.dau = dau;
    r.chu = chu.slice(0, 1500);
    return r;
  }
  function loai(r){
    if(r.loi && r.loi.length) return 'loi';
    if(r.khoa) return 'khoa';
    if(r.mau) return 'mau';
    if(r.nhap >= 1 || r.hanhDong >= 3) return 'congCu';
    return 'doc';
  }
  var TEN_LOAI = { congCu:'Công cụ', doc:'Chỉ để đọc', mau:'Số minh hoạ', khoa:'Còn khoá', loi:'Lỗi khi dựng' };

  /* ── Đi qua toàn bộ ── */
  function danhSach(){
    var ds = [];
    (G.NAV || []).forEach(function(g){ g.items.forEach(function(it){ ds.push({ v:it.v, t:it.t, nhom:g.id, perm:it.perm || '' }); }); });
    return ds;
  }
  function choKho(xong, han){
    var dang = G.KHO && G.KHO.dangNap && G.KHO.dangNap.length;
    if(!dang || han <= 0) return xong();
    setTimeout(function(){ choKho(xong, han - 200); }, 200);
  }
  function batDau(){
    if(st.chay) return;
    var ds = danhSach();
    st = { chay:true, i:0, n:ds.length, kq:[], luc:new Date().toISOString(), gui:'', loiGui:'', maHoa:null };
    var cu = console.warn, loiMan = [];
    console.warn = function(){ var s = Array.prototype.join.call(arguments, ' '); if(/^\[GITA\]/.test(s)) loiMan.push(s.slice(0, 200)); return cu.apply(console, arguments); };
    var nghe = function(e){ loiMan.push(String((e && e.message) || e).slice(0, 200)); };
    window.addEventListener('error', nghe);
    if(G.V50) ds.forEach(function(it){ G.V50.boQua[it.v] = 1; });   /* xem cả bản gốc của màn đã gộp */
    function tiep(){
      if(st.i >= ds.length) return ket();
      var it = ds[st.i];
      loiMan = [];
      var t0 = Date.now();
      if(G.allowed && !G.allowed(it.v)){ st.kq.push({ v:it.v, t:it.t, nhom:it.nhom, perm:it.perm, khoa:true, ngoaiVai:true, loi:[] }); st.i++; return setTimeout(tiep, 0); }
      G.S.view = it.v;
      try { G.render(); } catch(e){ loiMan.push(String(e && e.message || e).slice(0, 200)); }
      choKho(function(){
        if(G.KHO && G.KHO.dangNap && !G.KHO.dangNap.length && KHOA.test((document.querySelector('#main header.ph') || {}).textContent || '')){
          try { G.render(); } catch(e){ loiMan.push(String(e && e.message || e).slice(0, 200)); }
        }
        st.kq.push(doMan(it, Date.now() - t0, loiMan.slice(0, 3)));
        st.i++;
        var tb = document.getElementById('soat-tien'); if(tb) tb.textContent = st.i + ' / ' + st.n;
        setTimeout(tiep, 40);
      }, 8000);
    }
    function ket(){
      console.warn = cu; window.removeEventListener('error', nghe);
      if(G.V50) G.V50.boQua = {};
      st.chay = false;
      G.S.view = VIEW; G.render();
      U.toast('Đã soát ' + st.kq.length + ' màn.', 'ok');
    }
    /* Lớp phủ tiến độ: màn chạy liên tục, người dùng biết đang ở đâu. */
    var phu = document.createElement('div');
    phu.id = 'soat-phu';
    phu.setAttribute('role', 'status');
    phu.style.cssText = 'position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:9999;background:var(--surface);border:1px solid var(--line-2);border-radius:14px;padding:10px 16px;box-shadow:0 8px 30px rgba(0,0,0,.18);font-size:14px';
    phu.innerHTML = '<b>Đang soát toàn bộ màn…</b> <span id="soat-tien">0 / ' + ds.length + '</span> · đừng đóng trang';
    document.body.appendChild(phu);
    var ketCu = ket;
    ket = function(){ var p = document.getElementById('soat-phu'); if(p && p.parentNode) p.parentNode.removeChild(p); ketCu(); };
    setTimeout(tiep, 60);
  }

  /* ── Mã hoá trong trình duyệt: gzip → AES-256-GCM, khoá AES bọc RSA-OAEP ── */
  function b64(buf){
    var s = '', b = new Uint8Array(buf);
    for(var i = 0; i < b.length; i += 0x8000) s += String.fromCharCode.apply(null, b.subarray(i, i + 0x8000));
    return btoa(s);
  }
  function tuB64(s){ var bin = atob(s), b = new Uint8Array(bin.length); for(var i = 0; i < bin.length; i++) b[i] = bin.charCodeAt(i); return b; }
  function nen(u8){
    if(typeof CompressionStream === 'undefined') return Promise.resolve({ z:0, d:u8 });
    var luong = new Blob([u8]).stream().pipeThrough(new CompressionStream('gzip'));
    return new Response(luong).arrayBuffer().then(function(ab){ return { z:1, d:new Uint8Array(ab) }; });
  }
  G.soatMaHoa = function(obj, khoa){
    khoa = khoa || G.KHOA_SOAT;
    var sub = crypto.subtle, iv = crypto.getRandomValues(new Uint8Array(12)), aes = null, z = 0;
    return nen(new TextEncoder().encode(JSON.stringify(obj)))
      .then(function(n){ z = n.z; return sub.generateKey({ name:'AES-GCM', length:256 }, true, ['encrypt']).then(function(k){ aes = k; return sub.encrypt({ name:'AES-GCM', iv:iv }, k, n.d); }); })
      .then(function(ct){
        return sub.importKey('spki', tuB64(khoa.pub), { name:'RSA-OAEP', hash:'SHA-256' }, false, ['encrypt'])
          .then(function(pk){ return sub.exportKey('raw', aes).then(function(raw){ return sub.encrypt({ name:'RSA-OAEP' }, pk, raw); }); })
          .then(function(wk){ return { v:1, dv:khoa.dauVan, z:z, k:b64(wk), iv:b64(iv), d:b64(ct) }; });
      });
  };
  function goiBaoCao(){
    return { phienBan:'SOAT-2026.10-a', luc:st.luc, vai:(G.S.roleObj || {}).id || '', ban:G.VERSION || G.PHIEN_BAN || '', man:st.kq };
  }
  function guiTroLy(){
    if(!st.kq || !st.kq.length || st.gui === 'dang') return;
    if(!(window.crypto && crypto.subtle)){ st.loiGui = 'Trình duyệt này không có bộ mã hoá an toàn. Mở bằng Chrome, Edge hoặc Safari bản mới.'; G.render(); return; }
    st.gui = 'dang'; st.loiGui = ''; G.render();
    G.soatMaHoa(goiBaoCao()).then(function(goi){
      st.maHoa = goi;
      if(!coMayChu()){ st.gui = ''; st.loiGui = 'Chưa nối máy chủ — dùng nút "Sao chép bản mã hoá" rồi dán cho trợ lý.'; G.render(); return; }
      var than = JSON.stringify(goi);
      return G.goiMayChu('ghiSoatMan', { goi:than, so:st.kq.length }).then(function(r){
        if(r && r.ok){ st.gui = 'xong'; U.toast('Đã gửi bản mã hoá (' + so(Math.round(than.length / 1024)) + ' KB). Báo trợ lý là xong.', 'ok'); }
        else { st.gui = ''; st.loiGui = (r && r.error) || 'Chưa gửi được.'; }
        G.render();
      });
    }).catch(function(e){ st.gui = ''; st.loiGui = 'Mã hoá không thành: ' + String(e && e.message || e); G.render(); });
  }
  function saoChep(){
    function chep(goi){
      var s = JSON.stringify(goi);
      var xong = function(){ U.toast('Đã chép bản mã hoá (' + so(Math.round(s.length / 1024)) + ' KB).', 'ok'); };
      if(navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(s).then(xong, function(){ U.toast('Trình duyệt không cho chép — dùng nút Gửi.', 'err'); });
    }
    if(st.maHoa) return chep(st.maHoa);
    G.soatMaHoa(goiBaoCao()).then(function(g){ st.maHoa = g; chep(g); });
  }

  /* ── Màn ── */
  G.VIEWS[VIEW] = function(){
    if(!laChu()) return U.lockCard('Soát toàn bộ màn chỉ dành cho Super Admin.');
    var o = U.ph({ eyebrow:'SUPER ADMIN · V50', ic:'search', grad:1, t:'Soát toàn bộ màn',
      lead:'Ứng dụng tự mở lần lượt mọi mục của cột trái bằng chính phiên của anh/chị — kho tri thức đã mở bằng khoá thật — và đo từng màn: có làm được việc không, có số minh hoạ không, có bị khoá hay lỗi không. Mất khoảng 1–3 phút. Đừng đóng trang khi đang chạy.' });
    var ds = danhSach();
    o += '<div class="card mb"><div class="row wrap" style="justify-content:space-between;gap:10px"><div><b>' + so(ds.length) + ' mục</b> trong cột trái (gồm cả màn đã gộp và màn trong Thư viện vận hành)' +
      (G.KHO && G.KHO.cheDoMau ? '<p class="sm" style="color:var(--alert);margin:4px 0 0">Kho đang chạy bản mẫu — các màn gói nghề sẽ hiện "chưa mở". Đăng nhập tài khoản thật trên máy chủ để soát nội dung thật.</p>' : '') +
      '</div><button class="btn pri" data-soat="chay"' + (st.chay ? ' disabled' : '') + '>' + ic('search','w-3 h-3') + (st.kq ? 'Soát lại' : 'Soát toàn bộ') + '</button></div></div>';
    if(!st.kq) return o;

    var dem = { congCu:0, doc:0, mau:0, khoa:0, loi:0 };
    st.kq.forEach(function(r){ r.loai = r.ngoaiVai ? 'khoa' : loai(r); dem[r.loai]++; });
    o += '<div class="grid g4 mb">' + ['congCu','doc','mau','khoa','loi'].map(function(k){
      return '<div class="card"><div class="up tiny muted">' + h(TEN_LOAI[k]) + '</div><div class="v50-so">' + so(dem[k]) + '</div></div>'; }).join('') + '</div>';

    o += '<div class="card mb"><b>Gửi cho trợ lý phân tích</b><p class="sm muted" style="margin:4px 0 10px">Báo cáo được mã hoá ngay trên máy này trước khi rời trình duyệt. Máy chủ và GitHub chỉ thấy bản mã; chỉ người giữ khoá riêng (trợ lý phân tích) giải được. Dấu vân tay khoá: <span class="mono">' + h(G.KHOA_SOAT ? G.KHOA_SOAT.dauVan : '—') + '</span>.</p>' +
      '<div class="row wrap" style="gap:8px"><button class="btn pri" data-soat="gui"' + (st.gui === 'dang' ? ' disabled' : '') + '>' + ic('check','w-3 h-3') +
      (st.gui === 'dang' ? 'Đang mã hoá và gửi…' : st.gui === 'xong' ? 'Đã gửi — gửi lại' : 'Gửi bản mã hoá') + '</button>' +
      '<button class="btn ghost" data-soat="chep">Sao chép bản mã hoá</button></div>' +
      (st.loiGui ? '<p class="sm" style="color:var(--bad);margin:8px 0 0">' + h(st.loiGui) + '</p>' : '') +
      (st.gui === 'xong' ? '<p class="sm" style="color:var(--ok);margin:8px 0 0">Đã gửi lúc ' + h(new Date().toLocaleTimeString('vi-VN')) + '. Nhắn trợ lý: "đã gửi báo cáo soát".</p>' : '') + '</div>';

    var thuTu = { loi:0, khoa:1, mau:2, doc:3, congCu:4 };
    var hang = st.kq.slice().sort(function(a, b){ return thuTu[a.loai] - thuTu[b.loai] || (a.nhom < b.nhom ? -1 : 1); });
    o += '<div class="v50-bang" role="table" aria-label="Kết quả soát từng màn">' +
      '<div class="v50-hang v50-hang-dau soat-hang" role="row"><span>Màn</span><span>Loại</span><span>Nhập · việc</span><span>Chữ · ms</span></div>' +
      hang.map(function(r){
        return '<div class="v50-hang soat-hang" role="row"><span><button class="v50-mo" data-v="' + h(r.v) + '"><span>' + h(r.t) + '</span></button>' +
          (r.loi && r.loi.length ? '<div class="tiny" style="color:var(--bad)">' + h(r.loi[0]) + '</div>' : '') + '</span>' +
          '<span class="tiny">' + h(TEN_LOAI[r.loai]) + (r.ngoaiVai ? ' (ngoài vai)' : '') + (r.view && r.view !== r.v ? ' → ' + h(r.view) : '') + '</span>' +
          '<span class="mono tiny">' + (r.nhap == null ? '—' : r.nhap + ' · ' + r.hanhDong) + '</span>' +
          '<span class="mono tiny">' + (r.dai == null ? '—' : so(r.dai) + ' · ' + r.ms) + '</span></div>';
      }).join('') + '</div>';
    return o;
  };

  document.addEventListener('click', function(e){
    var el = e.target.closest && e.target.closest('[data-soat]'); if(!el) return;
    var a = el.getAttribute('data-soat');
    if(a === 'chay') batDau();
    else if(a === 'gui') guiTroLy();
    else if(a === 'chep') saoChep();
  });
})();
