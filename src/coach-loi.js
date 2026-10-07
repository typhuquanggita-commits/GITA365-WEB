/* ═══════════════════════════════════════════════════════════════
   GITA 365 — LÕI HỆ ĐIỀU HÀNH COACH (G.CO)

   Bảy hệ thống Coach dùng chung một lõi này — một sổ, một bộ công thức:

     SỔ        G.S.coach — lưu cùng các sổ khác (app.js), GẮN TÊN CHỦ SỔ:
               máy chung văn phòng đổi người đăng nhập thì sổ của người
               trước bị dọn (cùng luật với sổ công việc viecCua).
                 chuong  chương trình tự thiết kế (bổ sung G.CO_CT)
                 bai     bài coach đã thiết kế
                 cl      phiếu chấm chất lượng buổi
                 pt      phân tích vấn đề – nhu cầu – tiềm năng, theo mã nhà
                 dk      ghép chương trình (nhà × chương trình × Coach × lịch)
                 hd      NHẬT KÝ HOẠT ĐỘNG — mỗi hoạt động một dòng có giờ
                 gp      giải pháp tự soạn · ghim  tài liệu ghim
     CÔNG THỨC G.CO.chiSo(dk) — tham gia · nhiệm vụ · đúng hạn · minh chứng
               · nhịp đều · im lặng · cảm xúc · hài lòng · gắn kết · đèn ·
               cảnh báo. G.CO.cqi(phiếu) — điểm chất lượng buổi.
               G.CO.phanTich(pt) — trụ G–I–T–A, ưu tiên, tiềm năng, đề xuất.
     GIAO DIỆN G.CO.on(tên, fn) — một bộ nghe bấm chung cho [data-co].

   DỮ LIỆU MINH HOẠ: sổ trống thì nạp một bộ minh hoạ GẮN NHÃN mau:1, để màn
   mở ra đã có dáng làm việc thật; một nút "Xoá minh hoạ" dọn sạch.
   Máy chủ: chỉ GỌI cửa đã có (doSoCham, ghiCham) khi đã nối — không sửa
   máy chủ. Không đụng giấy phép · mã hoá.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G; G.VIEWS = G.VIEWS || {};
(function(){
  var U = G.U, h = U.h, ic = U.ic;
  var CO = G.CO = G.CO || {};
  var NGAY = 86400000;

  /* ───────── Ngày giờ ───────── */
  function d2s(d){ var x = new Date(d); return x.getFullYear()+'-'+('0'+(x.getMonth()+1)).slice(-2)+'-'+('0'+x.getDate()).slice(-2); }
  CO.homNay = function(){ return d2s(Date.now()); };
  CO.cong = function(s, n){ var d = new Date(s+'T00:00:00'); d.setDate(d.getDate()+n); return d2s(d); };
  CO.cach = function(a, b){ return Math.round((new Date(b+'T00:00:00') - new Date(a+'T00:00:00'))/NGAY); };
  CO.ngayVN = function(s){ if(!s) return '—'; var p = String(s).slice(0,10).split('-'); return p.length===3 ? p[2]+'/'+p[1] : s; };
  CO.gioVN = function(t){ var d = new Date(t); return CO.ngayVN(d2s(d))+' '+('0'+d.getHours()).slice(-2)+':'+('0'+d.getMinutes()).slice(-2); };

  /* ───────── Sổ ───────── */
  function moi(){ return { v:1, chu:'', chuong:[], bai:[], cl:[], pt:{}, dk:[], hd:[], gp:[], ghim:[], tab:{} }; }
  CO.st = function(){
    var me = (G.S && G.S.acc && G.S.acc.u) || '';
    var s = G.S.coach;
    if(!s || typeof s !== 'object' || s.v !== 1) s = G.S.coach = moi();
    if(me && s.chu && s.chu !== me){ s = G.S.coach = moi(); }   /* sổ của người khác trên máy chung → dọn */
    if(me && !s.chu) s.chu = me;
    ['chuong','bai','cl','dk','hd','gp','ghim'].forEach(function(k){ if(!Array.isArray(s[k])) s[k] = []; });
    if(!s.pt || typeof s.pt !== 'object') s.pt = {};
    if(!s.tab || typeof s.tab !== 'object') s.tab = {};
    return s;
  };
  CO.luu = function(veLai){ if(G.save) G.save(); if(veLai !== false && G.render) G.render(); };
  CO.id = function(p){ return (p||'x')+'-'+Date.now().toString(36)+Math.random().toString(36).slice(2,6); };
  CO.toi = function(){ var a = (G.S && G.S.acc) || {}; return { u:a.u||'', ten:a.ten||a.u||'', role:(G.S.roleObj||{}).id||'' }; };
  CO.laQuanLy = function(){ return typeof G.can==='function' && G.can('pro_assign'); };   /* R01–R05: xem cả đội */
  CO.coMau = function(){ var s = CO.st(); return s.dk.some(function(x){ return x.mau; }) || s.hd.some(function(x){ return x.mau; }); };

  /* ───────── Danh mục ───────── */
  CO.dsCT = function(){ return (G.CO_CT||[]).concat(CO.st().chuong); };
  CO.ct = function(ma){ return CO.dsCT().filter(function(c){ return c.ma===ma; })[0] || null; };
  CO.hd = function(ma){ return (G.CO_HD||[]).filter(function(x){ return x.ma===ma; })[0] || { ma:ma, ten:ma, ai:'coach', ic:'dot' }; };
  CO.gp = function(ma){ return (G.CO_GP||[]).concat(CO.st().gp).filter(function(x){ return x.ma===ma; })[0] || null; };
  CO.dsGP = function(){ return (G.CO_GP||[]).concat(CO.st().gp); };
  CO.nhip = function(){
    var B = G.BANDO_COACH;
    if(B && Array.isArray(B.buoi) && B.buoi.length) return B.buoi.map(function(b,i){
      return { no:b.no||i+1, ten:b.ten, phut:Number(b.phut)||10, c:b.c||'#185AB4', lam:b.lam||'', hoi:b.hoi||'', tranh:b.tranh||'' }; });
    return G.CO_NHIP || [];
  };
  CO.nhipNguon = function(){ return (G.BANDO_COACH && G.BANDO_COACH.buoi) ? 'Bản đồ coaching chuẩn (kho đã mở)' : 'Khung sáu nhịp mặc định'; };
  CO.dsCoach = function(){
    return (G.ACCOUNTS||[]).filter(function(a){ return ['R04','R05','R06','R07','R08'].indexOf(a.role) >= 0; })
      .map(function(a){ var r = G.roleById ? G.roleById(a.role) : {}; return { u:a.u, ten:a.ten||a.u, role:a.role, vai:r.short||a.role }; });
  };
  CO.tenCoach = function(u){ var c = CO.dsCoach().filter(function(x){ return x.u===u; })[0]; return c ? c.ten : (u||'—'); };

  /* Danh sách nhà: nhà đã ghép + khách thật từ máy chủ CRM (nếu đã nối) + nhà có phân tích. */
  CO.dsNha = function(){
    var m = {}, out = [];
    function them(ma, ten, nguon){ if(!ma || m[ma]) return; m[ma] = 1; out.push({ ma:ma, ten:ten||ma, nguon:nguon }); }
    CO.dsDK(true).forEach(function(d){ them(d.nha, d.tenNha, d.mau?'mau':'so'); });
    try{ var k = (typeof G.ttKhach==='function') ? G.ttKhach() : null; (k||[]).forEach(function(x){ if(x.that) them(x.ma, x.ten, 'may-chu'); }); }catch(e){}
    var pt = CO.st().pt; Object.keys(pt).forEach(function(ma){ them(ma, pt[ma].tenNha, pt[ma].mau?'mau':'so'); });
    return out;
  };
  CO.tenNha = function(ma){ var n = CO.dsNha().filter(function(x){ return x.ma===ma; })[0]; return n ? n.ten : ma; };

  /* ───────── Ghép chương trình & lịch ───────── */
  /* Lịch buổi: buổi của mỗi giai đoạn rải đều trong khoảng ngày của giai đoạn. */
  CO.lapLich = function(ct, batDau){
    var L = [], so = 0;
    (ct.gd||[]).forEach(function(g, gi){
      var n = Math.max(1, g.buoi||1), dai = Math.max(0, (g.den||g.tu) - g.tu);
      for(var i=0;i<n;i++){
        so++;
        var off = (g.tu - 1) + (n===1 ? 0 : Math.round(dai * i / (n-1)));
        L.push({ so:so, gd:gi, ngay:CO.cong(batDau, off), tt:'cho' });
      }
    });
    return L;
  };
  CO.dsDK = function(tatCa){
    var s = CO.st(), me = CO.toi().u;
    if(tatCa || CO.laQuanLy()) return s.dk.slice();
    return s.dk.filter(function(d){ return d.coach===me || d.mau; });
  };
  CO.dk = function(id){ return CO.st().dk.filter(function(d){ return d.id===id; })[0] || null; };
  CO.ghep = function(o){
    var ct = CO.ct(o.ct); if(!ct) return null;
    var d = { id:CO.id('dk'), nha:o.nha, tenNha:o.tenNha||o.nha, ct:ct.ma, coach:o.coach||CO.toi().u,
      batDau:o.batDau||CO.homNay(), tt:'dang', lich:CO.lapLich(ct, o.batDau||CO.homNay()), congDat:[], tao:Date.now() };
    CO.st().dk.push(d);
    CO.ghi({ nha:d.nha, dk:d.id, loai:'ghi_chu', ghi:'Ghép chương trình '+ct.ten+' từ '+CO.ngayVN(d.batDau) }, false);
    return d;
  };

  /* ───────── Nhật ký hoạt động ─────────
     e = {nha, dk?, loai, gt?, ghi?, han?, ma?, t?}. Ghi người ghi và giờ thật. */
  CO.ghi = function(e, luu){
    var x = { id:CO.id('hd'), t:e.t||Date.now(), nha:e.nha, dk:e.dk||'', loai:e.loai, gt:(e.gt==null?'':e.gt),
      ghi:String(e.ghi||'').slice(0,500), ai:CO.toi().u, nguon:e.nguon||'so' };
    if(e.han) x.han = e.han; if(e.ma) x.ma = e.ma; if(e.mau) x.mau = 1;
    CO.st().hd.push(x);
    if(luu !== false) CO.luu();
    return x;
  };
  CO.hdCua = function(nha, dkId){
    return CO.st().hd.filter(function(e){ return e.nha===nha && (!dkId || !e.dk || e.dk===dkId); })
      .sort(function(a,b){ return a.t-b.t; });
  };
  CO.danhDauBuoi = function(dkId, so, tt, ghi){
    var d = CO.dk(dkId); if(!d) return;
    var b = d.lich.filter(function(x){ return x.so===so; })[0]; if(!b) return;
    b.tt = tt; b.luc = Date.now(); if(ghi) b.ghi = ghi;
    CO.ghi({ nha:d.nha, dk:d.id, loai:'ghi_chu', ghi:'Buổi '+so+': '+({xong:'có mặt, đã dẫn',vang:'vắng',doi:'dời lịch',cho:'đặt lại'}[tt]||tt)+(ghi?' · '+ghi:'') }, false);
    CO.luu();
  };

  /* ───────── CÔNG THỨC ĐO ─────────
     Mọi con số đọc từ sổ — không con số nào nhập tay. Phần không có dữ
     liệu thì để trống (null) và trọng số chia lại, không đoán. */
  CO.chiSo = function(d, homNay){
    var hn = homNay || CO.homNay(), ct = CO.ct(d.ct) || { ngay:1, gd:[] };
    var ev = CO.hdCua(d.nha, d.id);
    var denHan = d.lich.filter(function(b){ return b.ngay <= hn; });
    var coMat = denHan.filter(function(b){ return b.tt==='xong'; }).length;
    var vang = denHan.filter(function(b){ return b.tt==='vang'; }).length;
    var chuaGhi = denHan.filter(function(b){ return b.tt==='cho' && b.ngay < hn; }).length;
    var giao = ev.filter(function(e){ return e.loai==='nv_giao'; });
    var xongEv = ev.filter(function(e){ return e.loai==='nv_xong'; });
    var xongMa = {}; xongEv.forEach(function(e){ if(e.ma) xongMa[e.ma] = e; });
    var xong = giao.filter(function(g){ return xongMa[g.ma]; });
    var dungHan = xong.filter(function(g){ return !g.han || d2s(xongMa[g.ma].t) <= g.han; }).length;
    var quaHan = giao.filter(function(g){ return !xongMa[g.ma] && g.han && g.han < hn; });
    var mc = ev.filter(function(e){ return e.loai==='minh_chung'; }).length;
    var cuaNha = ev.filter(function(e){ return CO.hd(e.loai).ai==='nha'; });
    var cuoi = cuaNha.length ? cuaNha[cuaNha.length-1].t : null;
    var imLang = Math.max(0, cuoi ? CO.cach(d2s(cuoi), hn) : CO.cach(d.batDau, hn));
    var ngay14 = {}; cuaNha.forEach(function(e){ var s = d2s(e.t); if(CO.cach(s, hn) < 14 && CO.cach(s, hn) >= 0) ngay14[s] = 1; });
    var tuoi = Math.min(14, Math.max(1, CO.cach(d.batDau, hn) + 1));
    function tb(loai, n){ var a = ev.filter(function(e){ return e.loai===loai && e.gt!==''; }).slice(-n).map(function(e){ return Number(e.gt)||0; });
      return a.length ? a.reduce(function(s,x){ return s+x; },0)/a.length : null; }
    var camXuc = tb('cam_xuc', 3), haiLong = tb('phan_hoi', 5);
    var p = {
      thamGia:   (coMat+vang) ? coMat/(coMat+vang) : null,
      nhiemVu:   giao.length ? xong.length/giao.length : null,
      minhChung: xong.length ? Math.min(1, mc/xong.length) : null,
      nhipDeu:   Object.keys(ngay14).length / tuoi,
      haiLong:   haiLong==null ? null : haiLong/5
    };
    var W = G.CO_TRONGSO, tong = 0, w = 0;
    Object.keys(W).forEach(function(k){ if(p[k]!=null){ tong += W[k]*p[k]; w += W[k]; } });
    var ganKet = w ? Math.round(100*tong/w) : null;
    var ngayThu = CO.cach(d.batDau, hn) + 1;
    var suCo = ev.filter(function(e){ return e.loai==='su_co'; }).length - ev.filter(function(e){ return e.loai==='su_co_dong'; }).length;
    var gdNay = 0; (ct.gd||[]).forEach(function(g,i){ if(ngayThu >= g.tu) gdNay = i; });
    var vangLien = 0; denHan.slice().reverse().some(function(b){ if(b.tt==='vang'){ vangLien++; return false; } return b.tt==='xong'; });
    var cb = [];
    if(suCo > 0) cb.push({ m:'do', t:'Có sự cố đang mở' });
    if(imLang >= 7) cb.push({ m:'do', t:'Nhà im lặng '+imLang+' ngày' });
    else if(imLang >= 4) cb.push({ m:'vang', t:'Nhà im lặng '+imLang+' ngày' });
    if(vangLien >= 2) cb.push({ m:'do', t:'Vắng '+vangLien+' buổi liền' });
    if(quaHan.length) cb.push({ m:'vang', t:quaHan.length+' nhiệm vụ quá hạn' });
    if(chuaGhi) cb.push({ m:'vang', t:chuaGhi+' buổi đã qua chưa ghi kết quả' });
    if(camXuc!=null && camXuc <= 2) cb.push({ m:'do', t:'Cảm xúc thấp ('+camXuc.toFixed(1)+'/5)' });
    if(d.tt==='dang' && ngayThu >= 8 && ngayThu <= 12) cb.push({ m:'vang', t:'Đang ở vùng ngày 8–12 — dễ bỏ cuộc nhất' });
    var den = 'XANH';
    if(cb.some(function(x){ return x.m==='do'; }) || (ganKet!=null && ganKet < 45)) den = 'DO';
    else if(cb.length || (ganKet!=null && ganKet < 70)) den = 'VANG';
    if(d.tt!=='dang') den = d.tt==='xong' ? 'XANH' : 'VANG';
    return { ngayThu:ngayThu, tongNgay:ct.ngay, tienDo:Math.min(1, Math.max(0, ngayThu/(ct.ngay||1))), gdNay:gdNay,
      buoiTong:d.lich.length, coMat:coMat, vang:vang, chuaGhi:chuaGhi, giao:giao.length, xong:xong.length, dungHan:dungHan,
      quaHan:quaHan, minhChung:mc, imLang:imLang, ngayHD14:Object.keys(ngay14).length, camXuc:camXuc, haiLong:haiLong,
      p:p, ganKet:ganKet, suCo:Math.max(0,suCo), den:den, canhBao:cb, soHD:ev.length, soHDNha:cuaNha.length };
  };
  CO.pt = function(x){ return x==null ? '—' : Math.round(100*x)+'%'; };
  CO.MAU_DEN = { XANH:'#0B7350', VANG:'#B4720F', DO:'#BE0E16' };
  CO.TEN_DEN = { XANH:'Xanh', VANG:'Vàng', DO:'Đỏ' };
  CO.den = function(d, nhan){ var c = CO.MAU_DEN[d]||'#73849F';
    return '<span class="co-den" style="--m:'+c+'"><i></i>'+(nhan===false?'':h(CO.TEN_DEN[d]||d))+'</span>'; };

  /* ───────── Chất lượng ───────── */
  CO.cqi = function(p){
    var tc = G.CO_TC || [], s = 0, n = 0;
    tc.forEach(function(t){ var v = p.diem && p.diem[t.ma]; if(v!=null && v!==''){ s += Number(v); n++; } });
    var diem = n ? Math.round(100*s/(4*n)) : null;
    var lr = (p.lanRanh||[]).length;
    var band = (G.CO_BANG||[]).filter(function(b){ return (diem||0) >= b.tu; })[0] || { ten:'—', den:'VANG' };
    if(lr) band = { ten:'Chạm lằn ranh đỏ', den:'DO' };
    return { diem:diem, lanRanh:lr, band:band, du:n===tc.length };
  };

  /* ───────── Phân tích vấn đề – nhu cầu – tiềm năng ───────── */
  CO.phanTich = function(r){
    r = r || {}; var vd = r.vd||{}, nc = r.nc||{}, tn = r.tn||{};
    var tru = {}; (G.GITA||[{k:'G'},{k:'I'},{k:'T'},{k:'A'}]).forEach(function(g){
      var ds = (G.CO_VD||[]).filter(function(x){ return x.tru===g.k; });
      var s = ds.reduce(function(a,x){ return a + (Number(vd[x.ma])||0); }, 0);
      tru[g.k] = ds.length ? Math.round(100*s/(3*ds.length)) : 0; });
    var nang = (G.CO_VD||[]).filter(function(x){ return (Number(vd[x.ma])||0) >= 2; })
      .sort(function(a,b){ return (Number(vd[b.ma])||0) - (Number(vd[a.ma])||0); });
    var ncTop = (G.CO_NC||[]).map(function(x){ var o = nc[x.ma]||{}; return { ma:x.ma, ten:x.ten, qt:Number(o.qt)||0, gap:Number(o.gap)||0 }; })
      .filter(function(x){ return x.qt || x.gap; }).sort(function(a,b){ return (b.qt*b.gap + b.qt) - (a.qt*a.gap + a.qt); });
    var tnS = (G.CO_TN||[]).reduce(function(a,x){ return a + (Number(tn[x.ma])||0); }, 0);
    var tiemNang = (G.CO_TN||[]).length ? Math.round(100*tnS/(3*G.CO_TN.length)) : 0;
    var nangNhat = Math.max.apply(null, Object.keys(tru).map(function(k){ return tru[k]; }).concat([0]));
    var ss = Number(r.ss)||0;
    /* Tầng đề xuất: vấn đề nặng + sẵn sàng thấp → bắt đầu từ Nhận diện. */
    var tang = 1;
    if(ss >= 2 && nangNhat < 60) tang = 2;
    if(ss >= 3 && nangNhat < 45 && tiemNang >= 50) tang = 3;
    if(ss >= 4 && nangNhat < 30 && tiemNang >= 65) tang = 4;
    if(r.tangHienTai && Number(r.tangHienTai) > tang) tang = Number(r.tangHienTai);
    var ctDX = [];
    var chinh = (G.CO_CT||[]).filter(function(c){ return c.loai==='tang' && c.tang.indexOf(tang) >= 0; })[0];
    if(chinh) ctDX.push({ ma:chinh.ma, ly:'Chương trình chính của tầng '+tang });
    ncTop.slice(0,3).forEach(function(x){ var ma = (G.CO_NC_CT||{})[x.ma];
      if(ma && !ctDX.some(function(c){ return c.ma===ma; })) ctDX.push({ ma:ma, ly:'Nhu cầu: '+x.ten }); });
    var ruiRo = [];
    if(Number(vd['i-cam-xuc']) >= 3) ruiRo.push('Cảm xúc nặng — theo dõi sát, sẵn sàng chuyển chuyên gia');
    if(nangNhat >= 60 && ss <= 1) { ruiRo.push('Vấn đề nặng nhưng chưa sẵn sàng — không giao việc nặng'); }
    if((Number(tn['cam-ket-pm'])||0) <= 1) ruiRo.push('Cam kết của cha mẹ thấp — cần buổi riêng cho cha mẹ');
    if(nangNhat >= 70 || Number(vd['i-cam-xuc']) >= 3) ctDX.unshift({ ma:'CAN-THIEP-14', ly:'Mức nặng — ổn định trước' });
    var gpDX = CO.dsGP().map(function(g){
      var khop = (g.vd||[]).reduce(function(a,m){ return a + (Number(vd[m])||0); }, 0);
      var hopTang = !g.tang || g.tang.indexOf(tang) >= 0;
      return { g:g, khop:khop + (hopTang?0.5:0) };
    }).filter(function(x){ return x.khop >= 2; }).sort(function(a,b){ return b.khop - a.khop; }).slice(0,6).map(function(x){ return x.g.ma; });
    return { tru:tru, nang:nang, ncTop:ncTop, tiemNang:tiemNang, nangNhat:nangNhat, tang:tang, ss:ss, ctDX:ctDX.slice(0,4), gpDX:gpDX, ruiRo:ruiRo };
  };

  /* ───────── Máy chủ: chỉ gọi cửa đã có ───────── */
  CO.coMayChu = function(){ return typeof G.goiMayChu==='function' && !!G.API_CAP_PHEP; };
  /* Kéo sổ chạm của một nhà từ máy chủ (doSoCham) vào nhật ký, không trùng. */
  CO.keoSoCham = function(nha, dkId){
    if(!CO.coMayChu()) return Promise.resolve({ ok:false, error:'Chưa nối máy chủ.' });
    return G.goiMayChu('doSoCham', { maNha:nha }).then(function(r){
      if(!r || !r.ok) return r || { ok:false };
      var s = CO.st(), da = {}, them = 0;
      s.hd.forEach(function(e){ if(e.nguon==='may-chu') da[e.nha+'|'+e.t+'|'+e.ghi] = 1; });
      (r.ds||[]).forEach(function(x){
        var t = new Date(x.ngay).getTime() || Date.now(), ghi = String(x.noiDung||'').slice(0,500);
        if(da[nha+'|'+t+'|'+ghi]) return;
        s.hd.push({ id:CO.id('hd'), t:t, nha:nha, dk:dkId||'', loai:'lien_he', gt:x.kieu||'', ghi:ghi, ai:x.boiAi||'', nguon:'may-chu' }); them++;
      });
      CO.luu(); return { ok:true, them:them, so:(r.ds||[]).length };
    });
  };
  /* Ghi một lượt chạm lên sổ chạm máy chủ — cửa ghiCham tự gác (đèn, nhắc bài, đỏ phải gọi). */
  CO.dayCham = function(nha, kieu, noiDung, canCu){
    if(!CO.coMayChu()) return Promise.resolve({ ok:false, error:'Chưa nối máy chủ — lượt chạm chỉ lưu trong sổ trên máy này.' });
    return G.goiMayChu('ghiCham', { maNha:nha, kieu:kieu, noiDung:noiDung, canCu:canCu, aiDuyet:CO.toi().u });
  };

  /* ───────── Xuất CSV (mở bằng Excel) ───────── */
  CO.csv = function(ten, cot, dong){
    function o(v){ v = v==null ? '' : String(v); return /[",\n;]/.test(v) ? '"'+v.replace(/"/g,'""')+'"' : v; }
    var s = '\uFEFF' + [cot].concat(dong).map(function(r){ return r.map(o).join(','); }).join('\n');
    var a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([s], { type:'text/csv;charset=utf-8' }));
    a.download = ten; document.body.appendChild(a); a.click(); setTimeout(function(){ URL.revokeObjectURL(a.href); a.remove(); }, 500);
  };

  /* ───────── Giao diện dùng chung ───────── */
  var VIEC = {};
  CO.on = function(ten, fn){ VIEC[ten] = fn; };
  document.addEventListener('click', function(e){
    var el = e.target.closest && e.target.closest('[data-co]'); if(!el) return;
    var fn = VIEC[el.getAttribute('data-co')]; if(!fn) return;
    e.preventDefault(); fn(el, e);
  });
  document.addEventListener('change', function(e){
    var el = e.target.closest && e.target.closest('[data-co-ch]'); if(!el) return;
    var fn = VIEC[el.getAttribute('data-co-ch')]; if(fn) fn(el, e);
  });
  CO.o = function(id){ var el = document.getElementById(id); return el ? (el.type==='checkbox' ? el.checked : String(el.value||'').trim()) : ''; };
  CO.tab = function(view, mac){ var t = CO.st().tab[view]; return t || mac; };
  CO.on('tab', function(el){ CO.st().tab[el.getAttribute('data-view')] = el.getAttribute('data-tab'); CO.luu(); });
  CO.tabs = function(view, ds, cur){
    return '<div class="co-tabs" role="tablist">'+ ds.map(function(t){
      return '<button class="co-tab'+(t[0]===cur?' on':'')+'" role="tab" aria-selected="'+(t[0]===cur)+'" data-co="tab" data-view="'+h(view)+'" data-tab="'+h(t[0])+'">'+
        (t[2]?ic(t[2],'w-3 h-3'):'')+h(t[1])+'</button>'; }).join('') +'</div>';
  };
  CO.chon = function(id, ds, val, them){
    return '<select class="inp" id="'+h(id)+'"'+(them||'')+'>'+ ds.map(function(x){
      var v = Array.isArray(x) ? x[0] : x, t = Array.isArray(x) ? x[1] : x;
      return '<option value="'+h(v)+'"'+(String(v)===String(val)?' selected':'')+'>'+h(t)+'</option>'; }).join('') +'</select>';
  };
  CO.o2 = function(nhan, html){ return '<label class="co-f"><span>'+h(nhan)+'</span>'+html+'</label>'; };
  CO.thanh = function(x, c){ return U.bar(x==null?0:Math.round(100*x), c); };
  CO.banMau = function(){
    if(!CO.coMau()) return '';
    return '<div class="co-mau">'+ic('alert','w-4 h-4')+'<span><b>Đang có dữ liệu minh hoạ</b> (gắn nhãn "minh hoạ") để màn có dáng làm việc thật. '+
      'Sổ thật bắt đầu khi anh/chị ghép chương trình cho một nhà.</span>'+
      '<button class="btn ghost sm" data-co="xoa-mau">Xoá minh hoạ</button></div>';
  };
  CO.nhanMau = function(x){ return x && x.mau ? ' <span class="co-tag">minh hoạ</span>' : ''; };
  CO.on('xoa-mau', function(){
    var s = CO.st();
    s.dk = s.dk.filter(function(x){ return !x.mau; }); s.hd = s.hd.filter(function(x){ return !x.mau; });
    s.cl = s.cl.filter(function(x){ return !x.mau; }); s.bai = s.bai.filter(function(x){ return !x.mau; });
    Object.keys(s.pt).forEach(function(k){ if(s.pt[k].mau) delete s.pt[k]; });
    s.daMau = 1; CO.luu(); U.toast('Đã xoá dữ liệu minh hoạ. Sổ chỉ còn dữ liệu thật.','ok');
  });

  /* ───────── Dữ liệu minh hoạ (một lần, gắn nhãn) ───────── */
  CO.napMau = function(){
    var s = CO.st();
    if(s.daMau || s.dk.length || s.hd.length) return;
    s.daMau = 1;
    var hn = CO.homNay(), me = CO.toi().u || 'coach@gita365.vn';
    var nha = [
      { ma:'MH-01', ten:'Nhà Minh An (minh hoạ)', ct:'GIAI-MA-21', lui:10, kieu:'tot' },
      { ma:'MH-02', ten:'Nhà Bảo Châu (minh hoạ)', ct:'KIEN-TAO-90', lui:30, kieu:'vua' },
      { ma:'MH-03', ten:'Nhà Khánh Vy (minh hoạ)', ct:'NHAN-DIEN-7', lui:5, kieu:'yeu' },
      { ma:'MH-04', ten:'Nhà Thảo Nguyên (minh hoạ)', ct:'KET-NOI-30', lui:18, kieu:'tot' }
    ];
    var hat = 7, bayGio = Date.now();
    function rnd(){ hat = (hat*9301 + 49297) % 233280; return hat/233280; }
    /* Minh hoạ không được có hoạt động ở tương lai — chặn ngay chỗ ghi. */
    var hd = { push:function(e){ if(e.t <= bayGio) s.hd.push(e); } };
    nha.forEach(function(n){
      var ct = CO.ct(n.ct), bd = CO.cong(hn, -n.lui);
      var d = { id:CO.id('dk'), nha:n.ma, tenNha:n.ten, ct:ct.ma, coach:me, batDau:bd, tt:'dang', lich:CO.lapLich(ct, bd), congDat:[], tao:Date.now(), mau:1 };
      var pDi = n.kieu==='tot' ? 0.9 : n.kieu==='vua' ? 0.7 : 0.35;
      d.lich.forEach(function(b){ if(b.ngay < hn) b.tt = rnd() < pDi ? 'xong' : 'vang'; });
      s.dk.push(d);
      var nv = 0;
      for(var k=0; k<n.lui; k++){
        var ngay = CO.cong(bd, k), t = new Date(ngay+'T19:30:00').getTime();
        var imLang = n.kieu==='yeu' && k > n.lui-6;
        if(!imLang && rnd() < pDi) hd.push({ id:CO.id('hd'), t:t, nha:n.ma, dk:d.id, loai:'tick_nhip', gt:'', ghi:'', ai:'', nguon:'so', mau:1 });
        if(!imLang && rnd() < pDi*0.5) hd.push({ id:CO.id('hd'), t:t+600000, nha:n.ma, dk:d.id, loai:'nhat_ky', gt:'', ghi:'', ai:'', nguon:'so', mau:1 });
        if(k % 3 === 0){
          nv++; var ma = 'NV'+nv;
          hd.push({ id:CO.id('hd'), t:t-3600000, nha:n.ma, dk:d.id, loai:'nv_giao', gt:'', ghi:'Nhiệm vụ '+nv, han:CO.cong(ngay,3), ma:ma, ai:me, nguon:'so', mau:1 });
          if(!imLang && rnd() < pDi){
            var tre = rnd() < 0.2 ? 4 : 2;
            hd.push({ id:CO.id('hd'), t:new Date(CO.cong(ngay,tre)+'T20:00:00').getTime(), nha:n.ma, dk:d.id, loai:'nv_xong', gt:'', ghi:'', ma:ma, ai:'', nguon:'so', mau:1 });
            if(rnd() < 0.75) hd.push({ id:CO.id('hd'), t:new Date(CO.cong(ngay,tre)+'T20:10:00').getTime(), nha:n.ma, dk:d.id, loai:'minh_chung', gt:'', ghi:'', ai:'', nguon:'so', mau:1 });
          }
        }
        if(k % 4 === 1) hd.push({ id:CO.id('hd'), t:t+1200000, nha:n.ma, dk:d.id, loai:'cam_xuc', gt:String(n.kieu==='yeu'?2:n.kieu==='vua'?3:4), ghi:'', ai:'', nguon:'so', mau:1 });
        if(k % 5 === 2) hd.push({ id:CO.id('hd'), t:t-7200000, nha:n.ma, dk:d.id, loai:'lien_he', gt:'nhan', ghi:'Nhắn nhắc nhịp', ai:me, nguon:'so', mau:1 });
      }
      d.lich.filter(function(b){ return b.tt==='xong'; }).forEach(function(b){
        hd.push({ id:CO.id('hd'), t:new Date(b.ngay+'T21:00:00').getTime(), nha:n.ma, dk:d.id, loai:'phan_hoi', gt:String(n.kieu==='yeu'?3:5), ghi:'', ai:'', nguon:'so', mau:1 }); });
    });
    s.pt['MH-03'] = { tenNha:'Nhà Khánh Vy (minh hoạ)', mau:1, luc:Date.now(), ss:1, tangHienTai:1,
      vd:{ 'i-dong-luc':3, 'a-thiet-bi':3, 'a-xung-dot':2, 'g-mo-ho':2, 't-tap-trung':2, 'i-cam-xuc':1 },
      nc:{ 'thiet-bi':{qt:3,gap:3}, 'ket-noi':{qt:3,gap:2}, 'dong-luc':{qt:2,gap:2} },
      tn:{ 'diem-manh':2, 'cam-ket-pm':2, 'thoi-gian':1, 'moi-truong':1, 'tai-nguyen':2, 'thanh-tich':1, 'ho-tro':1, 'to-mo':2 },
      nutThat:'Con dùng điện thoại tới 1 giờ sáng, sáng không dậy nổi; mẹ la, con đóng cửa phòng.' };
    s.cl.push({ id:CO.id('cl'), mau:1, t:Date.now()-3*NGAY, coach:me, nha:'MH-01', ngay:CO.cong(hn,-3), nguon:'du-truc-tiep', nguoiCham:'truongcoach@gita365.vn',
      diem:{ 'chuan-bi':4,'muc-tieu':3,'du-nhip':3,'ngon-ngu':4,'chan-doan':3,'tu-tim':2,'nhiem-vu':3,'nghiem-thu':3,'ghi-so':4,'dung-nhip':4 }, lanRanh:[],
      nx:'Buổi chắc, nghe tốt. Nhịp 4 còn gợi ý thay nhà.', sua:'Nhịp 4: hỏi thêm hai câu trước khi gợi ý', hanSua:CO.cong(hn,7) });
    s.cl.push({ id:CO.id('cl'), mau:1, t:Date.now()-10*NGAY, coach:me, nha:'MH-02', ngay:CO.cong(hn,-10), nguon:'tu-cham', nguoiCham:me,
      diem:{ 'chuan-bi':3,'muc-tieu':2,'du-nhip':3,'ngon-ngu':3,'chan-doan':2,'tu-tim':3,'nhiem-vu':2,'nghiem-thu':2,'ghi-so':3,'dung-nhip':3 }, lanRanh:[],
      nx:'Tự chấm: mục tiêu buổi chưa có số.', sua:'Viết mục tiêu buổi có con số', hanSua:CO.cong(hn,-3) });
    CO.luu(false);
  };

  /* Cổng quyền chung của các màn Coach */
  CO.cua = function(perm, ten){
    if(typeof G.can==='function' && G.can(perm)) return '';
    return U.lockCard(ten+' mở cho đội dẫn dắt. Đăng nhập đúng vai để xem.');
  };
})();
