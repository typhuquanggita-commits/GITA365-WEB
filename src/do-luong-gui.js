/* ═══════════════════════════════════════════════════════════════
   GITA 365 — GỬI SỐ ĐO CỦA NHÀ LÊN MÁY CHỦ (do-luong-gui.js)

   Gia đình (R13 Phụ huynh · R14 Học viên) đăng nhập thật thì app gửi:
     · thời gian dùng app theo ngày × màn (G.S.thoigian — đồng hồ thật chỉ
       chạy khi cửa sổ hiển thị và có thao tác trong 90 giây)
     · mỗi bài học đã nộp, bài test / sát hạch đã làm (kèm điểm), bài thi
       viết, tối có ghi nhật ký, cảm xúc tự báo trong ngày
   Máy chủ (guiSoDoKH) giữ MAX theo ngày × màn nên gửi lại không cộng dồn,
   và mỗi sự kiện chỉ ghi một lần. App chỉ gửi phần ĐÃ ĐỔI kể từ lần gửi
   trước — nhớ ở localStorage của máy này, mất thì gửi lại cũng không sai.

   Nhịp gửi: 20 giây sau khi vào, mỗi 10 phút, và lúc ẩn cửa sổ.
   Tài khoản mẫu (không có phiên máy chủ) không gửi gì.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;
(function(){
  var DLG = G.DLG = {};
  var dangGui = false, lanCuoi = null, loiCuoi = '';
  var MOOD = { roi:1, met:2, thuong:3, sang:5 };

  function haiSo(n){ return (n < 10 ? '0' : '') + n; }
  function ngayCua(d){ return d.getFullYear() + '-' + haiSo(d.getMonth()+1) + '-' + haiSo(d.getDate()); }
  function homNay(){ return ngayCua(new Date()); }
  function cach(ngay){ return Math.round((Date.parse(homNay()) - Date.parse(ngay)) / 864e5); }
  /* 'd/m/yyyy' (toLocaleDateString vi-VN), có hoặc không kèm giờ → 'yyyy-mm-dd' */
  function ngayVi(s){
    var m = /(\d{1,2})\/(\d{1,2})\/(\d{4})/.exec(String(s || ''));
    if(!m) return '';
    var d = m[3] + '-' + haiSo(+m[2]) + '-' + haiSo(+m[1]);
    return /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(d) && d <= homNay() ? d : '';
  }
  function ngayTrongKhoa(k){
    var m = /(\d{4}-\d{2}-\d{2})/.exec(String(k || ''));
    return m && m[1] <= homNay() ? m[1] : '';
  }

  DLG.coMayChu = function(){
    return typeof G.goiMayChu === 'function' && !!G.API_CAP_PHEP && !!G.PHIEN_TOKEN &&
      typeof G.laKhachCredit === 'function' && G.laKhachCredit();
  };
  function ai(){ return String((G.S && G.S.acc && G.S.acc.u) || ''); }
  var KHOA = 'gita365_dl_da';
  function nho(){
    try{ var x = JSON.parse(localStorage.getItem(KHOA) || 'null'); return x && x.ai === ai() ? x : { ai:ai(), tg:{}, sk:{} }; }
    catch(e){ return { ai:ai(), tg:{}, sk:{} }; }
  }
  function luuNho(x){
    try{
      var k = Object.keys(x.sk); if(k.length > 3000) k.slice(0, k.length - 3000).forEach(function(z){ delete x.sk[z]; });
      Object.keys(x.tg).forEach(function(n){ if(cach(n) > 15) delete x.tg[n]; });
      localStorage.setItem(KHOA, JSON.stringify(x));
    }catch(e){}
  }

  /* Cảm xúc: ghi đúng ngày bấm — G.S.mood chỉ giữ giá trị gần nhất, không biết ngày */
  var KHOA_CX = 'gita365_dl_camxuc';
  function camXuc(){ try{ return JSON.parse(localStorage.getItem(KHOA_CX) || '{}') || {}; }catch(e){ return {}; } }
  document.addEventListener('click', function(e){
    var el = e.target.closest && e.target.closest('[data-mood]'); if(!el) return;
    var v = MOOD[el.getAttribute('data-mood')]; if(!v) return;
    try{ var c = camXuc(); c[homNay()] = v; Object.keys(c).forEach(function(n){ if(cach(n) > 30) delete c[n]; }); localStorage.setItem(KHOA_CX, JSON.stringify(c)); }catch(err){}
  });

  /* ─── Gom số đo của máy này (dùng cả cho màn "Báo cáo tháng của nhà mình") ─── */
  DLG.thoiGian = function(soNgay){
    var tg = (G.S && G.S.thoigian) || {}, ra = {};
    Object.keys(tg).forEach(function(k){
      if(k.indexOf('ng|') !== 0) return;
      var n = k.slice(3); if(!/^\d{4}-\d{2}-\d{2}$/.test(n) || cach(n) < 0 || cach(n) > (soNgay || 14)) return;
      var b = {}, co = false;
      Object.keys(tg[k] || {}).forEach(function(m){
        var g = Math.floor(Number(tg[k][m]));
        if(g > 0 && (m === '__tong' || /^[a-z0-9-]{1,40}$/.test(m))){ b[m] = g; co = true; }
      });
      if(co) ra[n] = b;
    });
    return ra;
  };
  DLG.suKien = function(){
    var S = G.S || {}, ds = [];
    var kh = S.khoahoc || {};
    Object.keys(kh).forEach(function(k){
      var d = kh[k]; if(k.indexOf('bai|') !== 0 || !d || !d.nop) return;
      var n = ngayVi(d.luc); if(n) ds.push({ loai:'bai_hoc', ma:k.slice(4), ngay:n });
    });
    var sh = S.sathach || {};
    Object.keys(sh).forEach(function(k){
      var d = sh[k]; if(k.indexOf('bai|') !== 0 || !d || !d.xong || d.diem == null) return;
      var n = ngayVi(d.luc), g = Math.round(Number(d.diem));
      if(n && g >= 0 && g <= 100) ds.push({ loai:'sat_hach', ma:k.slice(4) + '#' + (d.lan || 1), giaTri:g, ngay:n });
    });
    var ts = S.test || {};
    Object.keys(ts).forEach(function(k){
      var d = ts[k]; if(!d || !d.xong) return;
      var n = ngayVi(d.luc); if(!n) return;
      var b = (G.TEST750 || []).filter(function(x){ return x.ma === k; })[0], g = null;
      try{ if(b && G.chamTest) g = G.chamTest(b, d.dap || {}).diem; }catch(e){ g = null; }
      if(g != null && g >= 0 && g <= 100) ds.push({ loai:'test', ma:k, giaTri:Math.round(g), ngay:n });
    });
    var bt = S.baithi || {};
    Object.keys(bt).forEach(function(k){
      var d = bt[k]; if(!d || !d.nop) return;
      var n = ngayVi(d.nop); if(n) ds.push({ loai:'bai_thi', ma:k, ngay:n });
    });
    var nk = S.nhatky || {};
    Object.keys(nk).forEach(function(k){
      var v = nk[k], n = ngayTrongKhoa(k); if(!n) return;
      var chu = typeof v === 'string' ? v : Object.keys(v || {}).map(function(z){ return String(v[z] || ''); }).join(' ');
      if(chu.trim().length > 10) ds.push({ loai:'nhat_ky', ma:k, ngay:n });
    });
    var cx = camXuc();
    Object.keys(cx).forEach(function(n){ if(/^\d{4}-\d{2}-\d{2}$/.test(n) && n <= homNay()) ds.push({ loai:'cam_xuc', ma:n, giaTri:cx[n], ngay:n }); });
    return ds;
  };

  /* ─── Gửi phần đã đổi ─── */
  DLG.gui = function(epGui){
    if(!DLG.coMayChu() || dangGui) return Promise.resolve({ ok:false, boQua:true });
    var da = nho(), tg = DLG.thoiGian(14), tgGui = {}, skGui = [];
    Object.keys(tg).forEach(function(n){ if(epGui || da.tg[n] !== tg[n].__tong) tgGui[n] = tg[n]; });
    DLG.suKien().forEach(function(s){ var k = s.loai + ':' + s.ma; if(epGui || !da.sk[k]) skGui.push(s); });
    if(!Object.keys(tgGui).length && !skGui.length) return Promise.resolve({ ok:true, khongDoi:true });
    dangGui = true;
    return G.goiMayChu('guiSoDoKH', { thoiGian:tgGui, suKien:skGui.slice(0, 200) }).then(function(r){
      dangGui = false;
      if(r && r.ok){
        Object.keys(tgGui).forEach(function(n){ da.tg[n] = tgGui[n].__tong; });
        skGui.slice(0, 200).forEach(function(s){ da.sk[s.loai + ':' + s.ma] = 1; });
        luuNho(da); lanCuoi = new Date(); loiCuoi = '';
      } else loiCuoi = (r && r.error) || 'Chưa gửi được.';
      return r || { ok:false };
    }, function(){ dangGui = false; loiCuoi = 'Mất kết nối.'; return { ok:false }; });
  };
  DLG.trangThai = function(){ return { lanCuoi:lanCuoi, loi:loiCuoi, dangGui:dangGui }; };

  setTimeout(function(){ DLG.gui(); }, 20000);
  setInterval(function(){ if(!document.hidden) DLG.gui(); }, 600000);
  document.addEventListener('visibilitychange', function(){ if(document.hidden) DLG.gui(); });
})();
