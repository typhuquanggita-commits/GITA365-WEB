/* ═══════════════════════════════════════════════════════════════
   GITA 365 — HỆ THỐNG CREDIT · BỘ MÁY + MÀN DUYỆT (credit-gita)

   G.CR tính MỌI con số từ G.CR_THAMSO (data-credit.js):
     G.CR.bang(t)          10 cấp của tầng t: bậc khó 1–50, hệ số độ khó,
                           ngân sách credit, VNĐ, buổi coach, credit/buổi,
                           credit thưởng tối đa, ngưỡng lên cấp
     G.CR.thuong(t)        credit thưởng từng hoạt động của tầng t
     G.CR.gia(t,c,nhom,ma) giá credit một hoạt động
     G.CR.ma(tuyen,nhom,t,c) mã coach, ví dụ GT-PT-3.05·D25
     G.CR.quyDoi(dong)     số tiền → credit và 5 quỹ

   Tên 10 cấp đọc từ hành trình 50 cấp đã có (G.KTL_CAP50). Giá gói đọc
   từ máy chủ (docBangGia) khi đã nối; chưa nối thì dùng tham số.

   Màn mở cho fin_view (R01–R04). DUYỆT chỉ R01. Bản này là BẢN CHỜ DUYỆT:
   chưa trừ / cộng credit của khách nào. Không đụng máy chủ · giấy phép.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G; G.VIEWS = G.VIEWS || {};
(function(){
  var P = function(){ return G.CR_THAMSO; };
  var CR = G.CR = {};
  var giaMayChu = null, daHoi = false;

  function so(n){ return Math.round(Number(n)||0).toLocaleString('vi-VN'); }
  CR.so = so;
  CR.tang = function(t){
    var T = P().tang.filter(function(x){ return x.t===Number(t); })[0];
    if(!T) return null;
    T = Object.assign({}, T);
    if(giaMayChu && giaMayChu[T.t] != null) { T.gia = Number(giaMayChu[T.t]); T.nguonGia = 'máy chủ'; } else T.nguonGia = 'tham số (GIA_KHOI_DAU)';
    T.laTang = !T.gia;
    T.cr = T.gia ? Math.round(T.gia / P().ty) : (T.tangCr || 0);
    return T;
  };
  CR.quy = function(ma){ return P().quy.filter(function(q){ return q.ma===ma; })[0] || { ty:0 }; };
  CR.buoiChuan = function(T){ return T.buoi ? T.cr * CR.quy('coach').ty / T.buoi : 0; };
  function W(){ var a = []; for(var c=1;c<=10;c++) a.push(P().trongSoCap(c)); return a; }
  function chiaBuoi(n){            /* chia n buổi cho 10 cấp theo trọng số, phần dư lớn nhất */
    var w = W(), s = w.reduce(function(a,b){ return a+b; },0), ra = w.map(function(x){ return n*x/s; });
    var nguyen = ra.map(Math.floor), du = n - nguyen.reduce(function(a,b){ return a+b; },0);
    ra.map(function(x,i){ return [x - Math.floor(x), i]; }).sort(function(a,b){ return b[0]-a[0] || b[1]-a[1]; })
      .slice(0, du).forEach(function(x){ nguyen[x[1]]++; });
    return nguyen;
  }
  function tenCap(t, c){
    var x = (G.KTL_CAP50||[]).filter(function(k){ return k.tang==='T'+t && Number(k.cap)===c; })[0];
    return x ? { ten:x.ten, khi:x.khi||'' } : { ten:'Cấp '+c, khi:'' };
  }
  /* Cân quỹ coach: buổi dồn về cấp cao (hệ số > 1) nên Σ buổi × giá buổi phải
     kéo về đúng quỹ coach của tầng — không tiêu quá phần đã chia. */
  CR.heSoCan = function(T){
    var w = W(), tb = w.reduce(function(a,b){ return a+b; },0)/10, n = chiaBuoi(T.buoi), base = CR.buoiChuan(T);
    var tong = n.reduce(function(a, x, i){ return a + x * base * w[i]/tb; }, 0);
    return tong ? (T.cr * CR.quy('coach').ty) / tong : 1;
  };
  CR.bang = function(t){
    var T = CR.tang(t), w = W(), sw = w.reduce(function(a,b){ return a+b; },0), tb = sw/10;
    var base = CR.buoiChuan(T) * CR.heSoCan(T), pool = T.cr * CR.quy('thuong').ty, buoi = chiaBuoi(T.buoi);
    return w.map(function(wc, i){
      var c = i+1, k = wc/tb, nm = tenCap(t, c), ngan = T.cr*wc/sw, th = pool*wc/sw;
      return { ma:t+'.'+(c<10?'0':'')+c, t:t, c:c, ten:nm.ten, khi:nm.khi, L:(t-1)*10+c, k:k,
        ngan:Math.round(ngan), vnd:Math.round(ngan*P().ty), buoi:buoi[i], crBuoi:Math.round(base*k),
        thuongMax:Math.round(th), nguong:Math.round(th*P().nguongLenCap) };
    });
  };
  CR.thuong = function(t){
    var T = CR.tang(t), pool = T.cr * CR.quy('thuong').ty;
    return P().thuong.map(function(a){ var n = a.dem(T); return { ma:a.ma, ten:a.ten, ty:a.ty, dem:n, cr:Math.round(pool*a.ty/Math.max(1,n)) }; });
  };
  CR.nhom = function(ma){ return P().nhom.filter(function(n){ return n.ma===ma; })[0] || P().nhom[1]; };
  CR.gia = function(t, c, nhom, maTieu){
    var T = CR.tang(t), a = P().tieu.filter(function(x){ return x.ma===maTieu; })[0];
    if(!T || !a) return 0;
    var k = P().trongSoCap(c) / (W().reduce(function(x,y){ return x+y; },0)/10);
    return Math.round(a.bs * CR.buoiChuan(T) * CR.heSoCan(T) * k * CR.nhom(nhom).hs);
  };
  CR.ma = function(tuyen, nhom, t, c){ var L = (t-1)*10+c; return tuyen+'-'+nhom+'-'+t+'.'+(c<10?'0':'')+c+'·D'+L; };
  CR.quyDoi = function(dong){ var cr = Math.floor((Number(dong)||0) / P().ty); return { cr:cr, quy:P().quy.map(function(q){ return { ma:q.ma, ten:q.ten, ty:q.ty, cr:Math.round(cr*q.ty) }; }) }; };
  CR.hoiGia = function(){
    if(daHoi || typeof G.goiMayChu!=='function' || !G.API_CAP_PHEP) return; daHoi = true;
    G.goiMayChu('docBangGia', {}).then(function(x){ if(x && x.ok && x.gia){ giaMayChu = x.gia; if(G.S && G.S.view==='credit-gita' && G.render) G.render(); } });
  };
  CR.giaTuMayChu = function(){ return !!giaMayChu; };

  /* ═══════════ MÀN ═══════════ */
  var U = G.U, h = U.h, ic = U.ic, VIEW = 'credit-gita';
  var KHOA_DUYET = 'gita365_credit_duyet';
  var st = { tab:'bang', tang:3, nhom:'CS', tuyen:'GT', cap:5, dong:'' };
  function duyet(){ try{ return JSON.parse(localStorage.getItem(KHOA_DUYET)||'null'); }catch(e){ return null; } }
  var MAU = ['#185AB4','#5140B4','#0B6675','#0B7350','#BE0E16'];

  function tabs(){
    var ds = [['bang','Bảng 5 tầng × 10 cấp','grid'],['goi','Quy đổi gói','vault'],['tieu','Giá hoạt động','list'],['thuong','Credit thưởng','star'],['ma','Mã coach','target'],['luat','Luật & duyệt','shield']];
    return '<div class="co-tabs" role="tablist">'+ds.map(function(x){ return '<button class="co-tab'+(st.tab===x[0]?' on':'')+'" role="tab" data-cr="tab" data-v2="'+x[0]+'">'+ic(x[2],'w-3 h-3')+h(x[1])+'</button>'; }).join('')+'</div>';
  }
  function chonTang(tatCa){
    return '<div class="co-hang mb">'+(tatCa?'<button class="btn sm '+(st.tang===0?'':'ghost')+'" data-cr="tang" data-v2="0">Cả 5 tầng</button>':'')+
      P().tang.map(function(T){ return '<button class="btn sm '+(st.tang===T.t?'':'ghost')+'" data-cr="tang" data-v2="'+T.t+'">T'+T.t+' · '+h(T.ten)+'</button>'; }).join('')+'</div>';
  }
  function bangTang(t){
    var T = CR.tang(t), rows = CR.bang(t);
    var o = '<div class="card pad-sm mb" style="border-left:4px solid '+MAU[t-1]+'"><div class="co-hang"><b style="color:'+MAU[t-1]+'">T'+t+' · '+h(T.ten)+'</b>'+
      '<span class="sm co-grow">'+(T.laTang ? 'Gói 0đ → <b>'+so(T.cr)+'</b> credit TẶNG (Học viện chịu)' : 'Gói '+so(T.gia)+'đ → <b>'+so(T.cr)+'</b> credit')+' · '+T.ngay+' ngày · '+T.buoi+' buổi coach · 1 buổi chuẩn = '+so(CR.buoiChuan(T))+' credit ('+so(CR.buoiChuan(T)*P().ty)+'đ)</span></div></div>';
    o += '<div class="co-tb mb"><table><thead><tr><th>Mã</th><th>Cấp</th><th>Bậc khó</th><th>Hệ số</th><th>Ngân sách credit</th><th>Quy đổi</th><th>Buổi coach</th><th>Credit/buổi</th><th>Thưởng tối đa</th><th>Ngưỡng lên cấp</th></tr></thead><tbody>'+
      rows.map(function(r){ return '<tr><td class="co-so"><b>'+r.ma+'</b></td><td><b>'+h(r.ten)+'</b>'+(r.khi?'<div class="tiny muted">'+h(r.khi)+'</div>':'')+'</td>'+
        '<td class="so">D'+r.L+'</td><td class="so">×'+r.k.toFixed(2)+'</td><td class="so"><b>'+so(r.ngan)+'</b></td><td class="so">'+so(r.vnd)+'đ</td>'+
        '<td class="so">'+r.buoi+'</td><td class="so">'+so(r.crBuoi)+'</td><td class="so">'+so(r.thuongMax)+'</td><td class="so">'+so(r.nguong)+'</td></tr>'; }).join('')+
      '<tr><td></td><td><b>Cộng tầng</b></td><td></td><td></td><td class="so"><b>'+so(rows.reduce(function(a,r){ return a+r.ngan; },0))+'</b></td><td class="so">'+so(rows.reduce(function(a,r){ return a+r.vnd; },0))+'đ</td>'+
      '<td class="so">'+rows.reduce(function(a,r){ return a+r.buoi; },0)+'</td><td></td><td class="so">'+so(rows.reduce(function(a,r){ return a+r.thuongMax; },0))+'</td><td></td></tr>'+
      '</tbody></table></div>';
    return o;
  }
  function vBang(){
    var o = chonTang(true);
    o += '<p class="sm muted" style="margin-top:0">Ngân sách credit của tầng chia cho 10 cấp theo độ khó tăng dần (cấp 1 hệ số ×0,69 → cấp 10 ×1,31). <b>Bậc khó D1–D50</b> là thang độ khó chung của cả hệ. <b>Thưởng tối đa</b> là phần quỹ thưởng 10% thuộc cấp ấy; tích đủ <b>ngưỡng</b> (60%) và đạt mốc cấp thì lên cấp.</p>';
    if(st.tang===0) P().tang.forEach(function(T){ o += bangTang(T.t); }); else o += bangTang(st.tang);
    o += '<div class="co-hang"><button class="btn ghost sm" data-cr="csv">'+ic('out','w-3 h-3')+'Xuất CSV cả 50 cấp</button></div>';
    return o;
  }
  function vGoi(){
    var o = '<div class="card pad-sm mb"><div class="co-form">'+
      '<label class="co-f"><span>Số tiền gói (đồng)</span><input class="inp" id="cr-dong" inputmode="numeric" value="'+h(st.dong)+'" placeholder="VD: 10000000"></label></div>'+
      '<div class="co-hang mt"><button class="btn sm" data-cr="tinh">Quy đổi</button><span class="tiny muted">10 đồng = 1 credit</span></div></div>';
    var dong = Number(String(st.dong).replace(/\D/g,''));
    var ds = dong ? [{ ten:'Gói đã nhập', dong:dong }] : P().tang.map(function(t){ var T = CR.tang(t.t); return { ten:'T'+T.t+' · '+T.ten, dong:T.gia, tang:T.laTang ? T.cr : 0 }; });
    o += '<div class="co-tb"><table><thead><tr><th>Gói</th><th>Số tiền</th><th>Credit</th>'+P().quy.map(function(q){ return '<th>'+h(q.ten)+' ('+Math.round(q.ty*100)+'%)</th>'; }).join('')+'</tr></thead><tbody>'+
      ds.map(function(x){ var q = x.tang ? { cr:x.tang, quy:P().quy.map(function(k){ return { cr:Math.round(x.tang*k.ty) }; }) } : CR.quyDoi(x.dong);
        return '<tr><td><b>'+h(x.ten)+'</b>'+(x.tang?' <span class="co-tag">credit tặng</span>':'')+'</td><td class="so">'+so(x.dong)+'đ</td><td class="so"><b>'+so(q.cr)+'</b></td>'+q.quy.map(function(k){ return '<td class="so">'+so(k.cr)+'</td>'; }).join('')+'</tr>'; }).join('')+
      '</tbody></table></div>';
    o += '<div class="co-luoi mt">'+P().quy.map(function(q){ return '<div class="co-dong"><b class="co-so">'+Math.round(q.ty*100)+'%</b><span class="co-grow sm"><b>'+h(q.ten)+'</b><br><span class="tiny muted">'+h(q.mo)+'</span></span></div>'; }).join('')+'</div>';
    return o;
  }
  function vTieu(){
    var o = chonTang(false) + '<div class="card pad-sm mb"><div class="co-form">'+
      '<label class="co-f"><span>Cấp</span><select class="inp" id="cr-cap" data-cr-ch="cap">'+[1,2,3,4,5,6,7,8,9,10].map(function(c){ return '<option value="'+c+'"'+(st.cap===c?' selected':'')+'>Cấp '+c+' · '+h(tenCap(st.tang||3,c).ten)+'</option>'; }).join('')+'</select></label>'+
      '<label class="co-f"><span>Nhóm khách hàng</span><select class="inp" id="cr-nhom" data-cr-ch="nhom">'+P().nhom.map(function(n){ return '<option value="'+n.ma+'"'+(st.nhom===n.ma?' selected':'')+'>'+n.ma+' · '+h(n.ten)+' (×'+n.hs+')</option>'; }).join('')+'</select></label></div></div>';
    var t = st.tang||3;
    o += '<div class="co-tb"><table><thead><tr><th>Hoạt động khách chọn</th><th>Bội số buổi chuẩn</th><th>Quỹ chi trả</th><th>Credit</th><th>Quy đổi</th></tr></thead><tbody>'+
      P().tieu.map(function(a){ var g = CR.gia(t, st.cap, st.nhom, a.ma); return '<tr><td><b>'+h(a.ten)+'</b></td><td class="so">×'+a.bs+'</td><td class="tiny">'+h(CR.quy(a.quy).ten)+'</td><td class="so"><b>'+so(g)+'</b></td><td class="so">'+so(g*P().ty)+'đ</td></tr>'; }).join('')+
      '</tbody></table></div><p class="tiny muted">Giá = bội số × 1 buổi chuẩn T'+t+' ('+so(CR.buoiChuan(CR.tang(t)))+') × hệ số cấp '+st.cap+' × hệ số nhóm '+st.nhom+'. Mã coach của suất này: <b>'+h(CR.ma(st.tuyen, st.nhom, t, st.cap))+'</b>.</p>';
    return o;
  }
  function vThuong(){
    var o = '<p class="sm muted" style="margin-top:0">Mỗi hoạt động của khách được trả lại credit thưởng từ quỹ thưởng 10% của chính gói — quỹ có sẵn nên tổng thưởng không bao giờ vượt tiền đã thu. Nhà làm đủ mọi hoạt động trong tầng thì nhận đúng 100% quỹ.</p>';
    o += '<div class="co-tb"><table><thead><tr><th>Hoạt động</th><th>Phần quỹ</th>'+P().tang.map(function(T){ return '<th>T'+T.t+'</th>'; }).join('')+'</tr></thead><tbody>'+
      P().thuong.map(function(a, i){ return '<tr><td><b>'+h(a.ten)+'</b></td><td class="so">'+Math.round(a.ty*100)+'%</td>'+P().tang.map(function(T){ var x = CR.thuong(T.t)[i]; return '<td class="so">'+so(x.cr)+'<div class="tiny muted">tối đa '+x.dem+' lần</div></td>'; }).join('')+'</tr>'; }).join('')+
      '<tr><td><b>Quỹ thưởng cả tầng</b></td><td class="so">100%</td>'+P().tang.map(function(T){ return '<td class="so"><b>'+so(CR.tang(T.t).cr*CR.quy('thuong').ty)+'</b></td>'; }).join('')+'</tr>'+
      '</tbody></table></div>';
    return o;
  }
  function vMa(){
    var o = '<div class="card pad-sm mb"><p class="sm" style="margin-top:0"><b>Cấu trúc mã coach:</b> <code>TUYẾN-NHÓM-TẦNG.CẤP·D bậc khó</code> — ví dụ <code>GT-PT-3.05·D25</code> = GITA365 · THPT & thi cử · tầng 3 cấp 5 · bậc khó 25/50.</p><div class="co-form">'+
      '<label class="co-f"><span>Tuyến</span><select class="inp" data-cr-ch="tuyen">'+P().tuyen.map(function(x){ return '<option value="'+x.ma+'"'+(st.tuyen===x.ma?' selected':'')+'>'+x.ma+' · '+h(x.ten)+'</option>'; }).join('')+'</select></label>'+
      '<label class="co-f"><span>Nhóm khách hàng</span><select class="inp" data-cr-ch="nhom">'+P().nhom.map(function(n){ return '<option value="'+n.ma+'"'+(st.nhom===n.ma?' selected':'')+'>'+n.ma+' · '+h(n.ten)+'</option>'; }).join('')+'</select></label></div></div>';
    o += '<div class="co-tb"><table><thead><tr><th>Cấp</th>'+P().tang.map(function(T){ return '<th>T'+T.t+' · '+h(T.ten)+'</th>'; }).join('')+'</tr></thead><tbody>'+
      [1,2,3,4,5,6,7,8,9,10].map(function(c){ return '<tr><td class="so">'+c+'</td>'+P().tang.map(function(T){ return '<td class="co-so tiny"><b>'+h(CR.ma(st.tuyen, st.nhom, T.t, c))+'</b><div class="muted">'+so(CR.gia(T.t, c, st.nhom, 'buoi-11'))+' cr/buổi</div></td>'; }).join('')+'</tr>'; }).join('')+
      '</tbody></table></div>';
    o += '<div class="co-luoi mt">'+P().nhom.map(function(n){ return '<div class="co-dong"><b class="co-so">'+n.ma+'</b><span class="co-grow sm">'+h(n.ten)+'<br><span class="tiny muted">hệ số công sức coach ×'+n.hs+'</span></span></div>'; }).join('')+'</div>';
    return o;
  }
  function vLuat(){
    var d = duyet(), la01 = (G.S && G.S.roleObj && G.S.roleObj.id) === 'R01';
    var o = '<div class="card pad-sm mb"><ol class="sm" style="padding-left:18px;line-height:1.75;margin:0">'+P().luat.map(function(l){ return '<li>'+h(l)+'</li>'; }).join('')+'</ol></div>';
    o += '<div class="card pad-sm"><b class="sm">Duyệt bảng credit · phiên bản '+h(P().phienBan)+'</b>'+
      (d && d.phienBan===P().phienBan ? '<p class="sm mt" style="color:#0B7350">'+ic('check','w-4 h-4')+' Đã duyệt bởi '+h(d.ai)+' lúc '+h(new Date(d.luc).toLocaleString('vi-VN'))+(d.ghi?' · Ghi chú: '+h(d.ghi):'')+'</p>' :
        '<p class="sm mt muted">Chưa duyệt. Bảng chưa áp vào ví khách nào.</p>')+
      (la01 ? '<label class="co-f mt"><span>Ghi chú khi duyệt (điều chỉnh mong muốn)</span><textarea class="inp" id="cr-ghi" rows="2" maxlength="500"></textarea></label>'+
        '<div class="co-hang mt"><button class="btn pri sm" data-cr="duyet">'+ic('check','w-3 h-3')+'Duyệt phiên bản này</button></div>' :
        '<p class="tiny muted mt">Chỉ Super Admin (R01) duyệt được — đặt và đổi giá thuộc Vùng Đỏ của Hiến pháp.</p>')+
      '<p class="tiny muted mt">Duyệt ở đây ghi trên máy này. Khi áp thật, phiên bản được duyệt phải ghi vào sổ máy chủ cùng ví credit của khách.</p></div>';
    return o;
  }

  document.addEventListener('click', function(e){
    var el = e.target.closest && e.target.closest('[data-cr]'); if(!el) return;
    var a = el.getAttribute('data-cr'), v = el.getAttribute('data-v2'); e.preventDefault();
    if(a==='tab'){ st.tab = v; if(v==='tieu' && !st.tang) st.tang = 3; }
    else if(a==='tang') st.tang = Number(v);
    else if(a==='tinh'){ var x = document.getElementById('cr-dong'); st.dong = x ? x.value : ''; }
    else if(a==='csv'){
      var dong = []; P().tang.forEach(function(T){ CR.bang(T.t).forEach(function(r){ dong.push([r.ma, 'T'+T.t+' '+T.ten, r.ten, 'D'+r.L, r.k.toFixed(2), r.ngan, r.vnd, r.buoi, r.crBuoi, r.thuongMax, r.nguong]); }); });
      if(G.CO && G.CO.csv) G.CO.csv('gita365-credit-5x10.csv', ['Mã','Tầng','Cấp','Bậc khó','Hệ số','Ngân sách credit','Quy đổi đồng','Buổi coach','Credit/buổi','Thưởng tối đa','Ngưỡng lên cấp'], dong);
      return;
    }
    else if(a==='duyet'){
      if((G.S.roleObj||{}).id !== 'R01') return U.toast('Chỉ Super Admin duyệt được.','err');
      try{ localStorage.setItem(KHOA_DUYET, JSON.stringify({ phienBan:P().phienBan, luc:Date.now(), ai:(G.S.acc||{}).u||'', ghi:String((document.getElementById('cr-ghi')||{}).value||'').slice(0,500) })); }catch(x){}
      U.toast('Đã duyệt phiên bản '+P().phienBan+'.','ok');
    }
    if(G.render) G.render();
  });
  document.addEventListener('change', function(e){
    var el = e.target.closest && e.target.closest('[data-cr-ch]'); if(!el) return;
    var a = el.getAttribute('data-cr-ch');
    if(a==='cap') st.cap = Number(el.value); else if(a==='nhom') st.nhom = el.value; else if(a==='tuyen') st.tuyen = el.value;
    if(G.render) G.render();
  });

  G.VIEWS[VIEW] = function(){
    if(!(typeof G.can==='function' && G.can('fin_view'))) return U.lockCard('Hệ thống Credit mở cho ban điều hành và tài chính (R01–R04).');
    CR.hoiGia();
    var d = duyet(), daDuyet = d && d.phienBan===P().phienBan;
    var tong = P().tang.reduce(function(a,T){ return a + CR.tang(T.t).cr; }, 0);
    var o = U.ph({ eyebrow:'TÀI CHÍNH · HỆ THỐNG CREDIT', ic:'vault', grad:1, t:'Hệ thống Credit GITA365 — 5 tầng × 10 cấp',
      lead:'Tiền gói của khách đổi thành credit (10 đồng = 1 credit). Credit chia vào 5 quỹ, phân cho 10 cấp mỗi tầng theo thang độ khó; mọi hoạt động của khách đều có giá credit (tiêu) hoặc credit thưởng (tích). Mã coach gắn nhóm khách hàng, tầng, cấp và bậc khó.' });
    o += '<div class="co-mau" style="'+(daDuyet?'border-color:#0B7350;background:color-mix(in srgb,#0B7350 7%,var(--surface))':'')+'">'+ic(daDuyet?'check':'alert','w-4 h-4')+
      '<span>'+(daDuyet ? '<b>Đã duyệt</b> phiên bản '+h(P().phienBan)+'.' : '<b>Bản chờ duyệt</b> — phiên bản '+h(P().phienBan)+'. Chưa áp vào ví khách nào.')+
      ' Giá gói: '+(CR.giaTuMayChu() ? 'đọc từ máy chủ.' : 'theo GIA_KHOI_DAU (chưa đọc được máy chủ).')+'</span></div>';
    o += '<div class="grid g4 mb">'+
      U.stat({ k:'Tỷ lệ quy đổi', v:'10đ = 1', d:'credit, mọi cấp mọi tầng' })+
      U.stat({ k:'Cấp trong hệ', v:'50', d:'5 tầng × 10 cấp · bậc khó D1–D50' })+
      U.stat({ k:'Credit 5 gói cộng lại', v:so(tong), d:'gồm '+so(CR.tang(1).cr)+' credit tặng T1' })+
      U.stat({ k:'Buổi chuẩn T3', v:so(CR.buoiChuan(CR.tang(3))), d:'credit · '+so(CR.buoiChuan(CR.tang(3))*P().ty)+'đ' })+'</div>';
    o += tabs();
    o += st.tab==='bang' ? vBang() : st.tab==='goi' ? vGoi() : st.tab==='tieu' ? vTieu() : st.tab==='thuong' ? vThuong() : st.tab==='ma' ? vMa() : vLuat();
    return o;
  };
})();
