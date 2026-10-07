/* ═══════════════════════════════════════════════════════════════
   GITA 365 — BẢNG ĐIỀU KHIỂN THEO VAI · 10 MÀN × 10 NGHIỆP VỤ (R04–R15)

   Cùng mẫu với Bảng điều khiển vận hành (R01–R02) và Bảng điều khiển
   Giám đốc (R03), nhưng một bộ máy chung cho mười hai vai còn lại. Dữ liệu
   từng vai nằm ở G.DK_VAI (data-dk-vai-*.js):

     G.DK_VAI[key] = { vai:['R07'], ten, ic, c, spec:'nghe-coach', lead,
       cum:{A:{t,s},B:…,C:…},
       areas:[ {key, so, ic, c, cum, ten, man, mo, nv:[…10 mục]} ×10 ] }

   Mỗi mục nghiệp vụ là MỘT trong hai dạng:
     · số i  → đầu việc thứ i trong chuẩn nghề của vai (G.NGHE_SPEC /
               G.NGHE_DATA) — lấy nguyên trọng số, chuẩn đạt, cách làm,
               màn làm và dấu hiệu xong, không chép lại.
     · [tên, màn, trọngSố, chuẩnĐạt, dấuHiệuXong] — nghiệp vụ riêng của màn.

   View: dk-<key> (bảng điều khiển của vai) · dk-<key>-<area> (màn chi
   tiết) · dk-cua-toi (bảng của vai đang đăng nhập) · dk-cac-vai (giám sát
   15 vai, dh_toan_he). Ai xem được: đúng vai ấy · qt_trang xem mọi vai ·
   dh_toan_he xem để giám sát. Trạng thái dùng chung ô gdNV + G.gdTick (khoá
   riêng dk-<key>-<area>:<i>). Mỗi nút "Mở" vẫn qua G.allowed. Không đụng
   máy chủ · giấy phép · mã hoá.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G; G.VIEWS = G.VIEWS || {};
(function(){
  var U = G.U, h = U.h, ic = U.ic;
  var BANDC = { DO:'#BE0E16', VANG:'#B4720F', XANH:'#0B7350' };
  var TT = { '':{t:'Chưa',c:'--ink-4'}, dang:{t:'Đang làm',c:'--warn'}, xong:{t:'Đã xong',c:'--ok'} };
  var CUM_MAC = { A:{t:'VIỆC HẰNG NGÀY', s:'Nhịp làm việc chuẩn của vai'},
                  B:{t:'CHUYÊN MÔN SÂU', s:'Nghiệp vụ đặc thù và phối hợp'},
                  C:{t:'PHÁT TRIỂN & CHUẨN NGHỀ', s:'Đo lường · thăng cấp · khung nghề'} };

  function dsVai(){ return G.DK_VAI || {}; }
  function spec(P){ return P.spec ? ((G.NGHE_SPEC||{})[P.spec] || (G.NGHE_DATA||{})[P.spec] || null) : null; }

  /* Một mục nghiệp vụ → dạng đầy đủ. Đầu việc chuẩn nghề lấy thẳng từ spec. */
  function mucNV(P, x){
    if(typeof x === 'number'){
      var S = spec(P), v = S && S.viec ? S.viec[x] : null;
      if(!v) return { ten:'(đầu việc '+x+' chưa có trong chuẩn nghề)', v:'', w:1, chuan:'', cach:'', xong:'', goc:false };
      return { ten:v[1], v:v[5], w:v[2], chuan:v[3], cach:v[4], xong:v[6], goc:true, nhom:(S.nhom&&S.nhom[v[0]])?S.nhom[v[0]].ten:'' };
    }
    return { ten:x[0], v:x[1], w:x[2]||2, chuan:x[3]||'', cach:'', xong:x[4]||'', goc:false };
  }
  function idNV(P, a, i){ return 'dk-'+P.key+'-'+a.key+':'+i; }
  function tt(id){ return (G.S.gdNV||{})[id] || ''; }
  /* Màn đích không có, hoặc vai không được vào (đầu việc chuẩn nghề trỏ màn
     của vai trên) → về màn chính của mảng. Không bao giờ nút chết. */
  function dich(m, a){ return (G.manCoThat && G.manCoThat(m.v) && (!G.allowed || G.allowed(m.v))) ? m.v : a.man; }
  function tenMan(v){ var it = G.navItem ? G.navItem(v) : null; return it ? (G.iname ? G.iname(it) : it.t) : v; }
  function den(st, w){ return st==='xong' ? 'XANH' : (st==='' && w>=4) ? 'DO' : 'VANG'; }

  function soLieu(P, a){
    var ds = a.nv.map(function(x){ return mucNV(P,x); });
    var xong=0, dang=0, cao=0, wXong=0, wTong=0;
    ds.forEach(function(m,i){
      var s = tt(idNV(P,a,i)); wTong += m.w;
      if(s==='xong'){ xong++; wXong += m.w; } else { if(s==='dang') dang++; if(m.w>=4) cao++; }
    });
    return { ds:ds, xong:xong, dang:dang, cao:cao, wXong:wXong, wTong:wTong, n:ds.length };
  }

  /* Ai được xem bảng của vai P: đúng vai · quản trị trang · điều hành toàn hệ. */
  function duocXem(P){
    var r = G.S && G.S.roleObj;
    if(r && P.vai.indexOf(r.id) >= 0) return true;
    return typeof G.can==='function' && (G.can('qt_trang') || G.can('dh_toan_he'));
  }
  function laGiamSat(P){ var r = G.S && G.S.roleObj; return !(r && P.vai.indexOf(r.id) >= 0); }
  function khoa(P){ return U.lockCard('Bảng điều khiển này dành cho vai '+P.ten+'. Ban điều hành xem được để giám sát. Đăng nhập đúng vai để xem.'); }
  function nhanSu(P){ return (G.ACCOUNTS||[]).filter(function(a){ return P.vai.indexOf(a.role) >= 0; }).length; }

  function veBang(P, a, L){
    var coSpec = !!P.spec;
    var cols = ['#', coSpec?'Nghiệp vụ':'Việc','Màn làm','Trọng số','Chuẩn đạt','Dấu hiệu xong'].concat(coSpec?['Nguồn']:[], ['Trạng thái','Đèn']);
    var body = L.ds.map(function(m,i){
      var s = tt(idNV(P,a,i)), d = den(s, m.w);
      return '<tr><td>'+(i+1)+'</td><td><b>'+h(m.ten)+'</b></td><td class="tiny">'+h(tenMan(dich(m,a)))+'</td>'+
        '<td class="ta-c">'+m.w+'</td><td class="tiny">'+h(m.chuan||'—')+'</td><td class="tiny">'+h(m.xong||'—')+'</td>'+
        (coSpec ? '<td class="tiny">'+(m.goc ? 'Chuẩn nghề'+(m.nhom?' · '+h(m.nhom):'') : 'Nghiệp vụ màn')+'</td>' : '')+
        '<td class="tiny">'+h(TT[s].t)+'</td>'+
        '<td class="ta-c"><span class="gd-den" style="--m:'+BANDC[d]+'" title="'+h(d)+'"></span></td></tr>';
    }).join('');
    return '<div class="gd-wrap"><table class="gd-tb"><thead><tr>'+cols.map(function(c){ return '<th>'+h(c)+'</th>'; }).join('')+
      '</tr></thead><tbody>'+body+'</tbody></table></div>';
  }

  function veNV(P, a, L){
    return '<div class="gd-nvlist">'+ L.ds.map(function(m,i){
      var id = idNV(P,a,i), s = tt(id), t = TT[s], tgt = dich(m,a);
      var mo = G.allowed ? G.allowed(tgt) : true;
      var nut = mo ? '<button class="btn ghost sm gd-open" data-v="'+h(tgt)+'">Mở '+ic('arrow','w-3 h-3')+'</button>'
                   : '<span class="vh-khoa">'+ic('lock','w-3 h-3')+'khoá</span>';
      return '<div class="gd-nvr'+(s==='xong'?' done':'')+'">'+
        '<button class="gd-tick gd-tick-'+(s||'chua')+'" data-gdtick="'+h(id)+'" style="--m:var('+t.c+')" title="Bấm đổi trạng thái">'+
          (s==='xong'?ic('check','w-3 h-3'):s==='dang'?ic('clock','w-3 h-3'):'')+'</button>'+
        '<span class="gd-nvi">'+(i+1)+'</span>'+
        '<span class="gd-nvt">'+h(m.ten)+(m.w>=4?' <span class="dk-w" title="Trọng số cao">'+m.w+'</span>':'')+'</span>'+
        '<span class="gd-nvs" style="--m:var('+t.c+')">'+h(t.t)+'</span>'+ nut +'</div>';
    }).join('') +'</div>';
  }

  G.dkManView = function(pk, ak){
    var P = dsVai()[pk];
    var a = P ? P.areas.filter(function(x){ return x.key===ak; })[0] : null;
    if(!a) return U.lockCard('Không tìm thấy màn.');
    if(!duocXem(P)) return khoa(P);
    var L = soLieu(P, a);
    var o = U.ph({ eyebrow:P.ten.toUpperCase()+' · MÀN '+a.so+(laGiamSat(P)?' · CHẾ ĐỘ GIÁM SÁT':''), ic:a.ic, grad:1, t:a.ten,
      lead: a.mo || 'Mười việc của màn này: số liệu nhanh, báo cáo có đèn và nút mở thẳng màn làm việc.' });
    o += '<div class="row mb" style="gap:8px;flex-wrap:wrap">'+
      '<button class="btn ghost sm" data-v="dk-'+h(P.key)+'">'+ic('arrow','w-3 h-3')+'Bảng điều khiển '+h(P.ten)+'</button>'+
      (G.allowed && G.allowed(a.man) ? '<button class="btn sm" data-v="'+h(a.man)+'">'+ic('grid','w-3 h-3')+'Mở màn gốc đầy đủ</button>' : '')+
      (P.spec && G.manCoThat && G.manCoThat(P.spec) && G.allowed(P.spec) ? '<button class="btn ghost sm" data-v="'+h(P.spec)+'">'+ic('book','w-3 h-3')+'Chuẩn nghề</button>' : '')+
      '</div>';
    var pt = L.wTong ? Math.round(100*L.wXong/L.wTong) : 0;
    o += '<div class="grid g4 mb">'+
      U.stat({k:'Đã xong', v:L.xong+'/'+L.n, d:L.dang+' việc đang làm', c: L.xong===L.n?'#0B7350':null})+
      U.stat({k:'Điểm việc đạt', v:L.wXong+'/'+L.wTong, d:pt+'% tổng trọng số'})+
      U.stat({k:'Ưu tiên cao còn mở', v:String(L.cao), d:'trọng số ≥ 4 chưa xong', c: L.cao?'#BE0E16':'#0B7350'})+
      (P.spec ? U.stat({k:'Theo chuẩn nghề', v:L.ds.filter(function(m){ return m.goc; }).length+'/'+L.n, d:'đầu việc lấy từ chuẩn nghề'})
              : U.stat({k:'Đang làm', v:String(L.dang), d:'việc đã bắt đầu'}))+'</div>';
    o += U.sec('Báo cáo chi tiết', 'Đèn: xanh = đã xong · vàng = đang làm hoặc việc nhẹ chưa làm · đỏ = việc trọng số cao chưa bắt đầu');
    o += veBang(P, a, L);
    o += U.sec(P.spec ? 'Mười nghiệp vụ' : 'Mười việc', 'Bấm ô trạng thái để theo dõi (chưa · đang · xong) · bấm "Mở" để thao tác · đã xong '+L.xong+'/'+L.n);
    o += veNV(P, a, L);
    o += '<p class="tiny muted" style="margin-top:12px">'+ic('shield','w-3 h-3')+' Trạng thái lưu trên máy của anh/chị, giữ qua phiên. Mỗi "Mở" vẫn qua cổng quyền của hệ.</p>';
    return o;
  };

  function tienDo(P){
    var x=0, n=0, w=0, wt=0;
    P.areas.forEach(function(a){ var L = soLieu(P,a); x+=L.xong; n+=L.n; w+=L.wXong; wt+=L.wTong; });
    return { xong:x, n:n, wXong:w, wTong:wt };
  }

  function the(P, a){
    var L = soLieu(P, a), moGoc = G.allowed ? G.allowed(a.man) : true;
    var nv = '<ol class="gdv-nv">'+ L.ds.map(function(m,i){
      return '<li'+(tt(idNV(P,a,i))==='xong'?' class="dk-xong"':'')+'>'+h(m.ten)+'</li>'; }).join('') +'</ol>';
    return '<div class="gdv-the'+(moGoc?'':' off')+'" style="--c:var('+a.c+')">'+
      '<div class="gdv-h"><span class="vh-so">'+h(a.so)+'</span><span class="vh-ic">'+ic(a.ic)+'</span>'+
        '<b class="gdv-t">'+h(a.ten)+'</b>'+
        '<span class="dk-pt">'+L.xong+'/'+L.n+'</span>'+
        '<button class="btn sm vh-mo" data-v="dk-'+h(P.key)+'-'+h(a.key)+'">'+ic('arrow','w-3 h-3')+'Mở chi tiết</button></div>'+
      '<div class="gdv-nvwrap"><span class="gdv-lbl">10 '+(P.spec?'nghiệp vụ':'việc')+'</span>'+nv+'</div></div>';
  }

  G.dkHubView = function(pk){
    var P = dsVai()[pk];
    if(!P) return U.lockCard('Không tìm thấy bảng điều khiển.');
    if(!duocXem(P)) return khoa(P);
    var T = tienDo(P), cum = P.cum || CUM_MAC;
    var o = U.ph({ eyebrow:P.ten.toUpperCase()+' · BẢNG ĐIỀU KHIỂN'+(laGiamSat(P)?' · CHẾ ĐỘ GIÁM SÁT':''), ic:P.ic, grad:1,
      t:'Bảng điều khiển '+P.ten+' — '+P.areas.length+' màn × 10 '+(P.spec?'nghiệp vụ':'việc'), lead:P.lead });
    var pt = T.wTong ? Math.round(100*T.wXong/T.wTong) : 0;
    o += '<div class="grid g4 mb">'+
      U.stat({k:'Màn chi tiết', v:String(P.areas.length), d:'mỗi màn 10 '+(P.spec?'nghiệp vụ':'việc')})+
      U.stat({k:(P.spec?'Nghiệp vụ':'Việc')+' đã xong', v:T.xong+'/'+T.n, d:'đánh dấu trên máy này', c: T.xong===T.n?'#0B7350':null})+
      U.stat({k:'Điểm việc đạt', v:pt+'%', d:T.wXong+'/'+T.wTong+' trọng số'})+
      U.stat({k:'Cùng vai', v:String(nhanSu(P)), d:'tài khoản đang hoạt động'})+'</div>';
    var nut = [];
    if(laGiamSat(P)) nut.push('<button class="btn ghost sm" data-v="dk-cac-vai">'+ic('arrow','w-3 h-3')+'Bảng điều khiển các vai</button>');
    if(P.spec && G.manCoThat && G.manCoThat(P.spec) && G.allowed(P.spec)) nut.push('<button class="btn ghost sm" data-v="'+h(P.spec)+'">'+ic('book','w-3 h-3')+'Chuẩn nghề '+h(P.ten)+'</button>');
    (P.loiTat||[]).forEach(function(x){ if(G.allowed(x[0]) && G.manCoThat(x[0])) nut.push('<button class="btn ghost sm" data-v="'+h(x[0])+'">'+ic(x[2]||'grid','w-3 h-3')+h(x[1])+'</button>'); });
    if(nut.length) o += '<div class="row mb" style="gap:8px;flex-wrap:wrap">'+nut.join('')+'</div>';
    ['A','B','C'].forEach(function(c){
      var nhom = P.areas.filter(function(a){ return a.cum===c; });
      if(!nhom.length) return;
      o += U.sec(cum[c].t, cum[c].s);
      o += '<div class="gdv-luoi">'+ nhom.map(function(a){ return the(P,a); }).join('') +'</div>';
    });
    o += '<p class="tiny muted" style="margin-top:14px">'+ic('shield','w-3 h-3')+' Mỗi màn chi tiết và mỗi "Mở" vẫn qua cổng quyền của hệ. Đây là bàn làm việc theo vai, không phải cửa tắt quyền.</p>';
    return o;
  };

  /* Vai đang đăng nhập → bảng của vai ấy. R01–R03 đã có bảng riêng. */
  function bangCua(id){
    if(id==='R01' || id==='R02') return 'van-hanh-10';
    if(id==='R03') return 'van-hanh-gd';
    var ks = Object.keys(dsVai()).filter(function(k){ return dsVai()[k].vai.indexOf(id) >= 0; });
    return ks.length ? 'dk-'+ks[0] : '';
  }
  G.dkBangCua = bangCua;

  G.VIEWS['dk-cua-toi'] = function(){
    var r = G.S && G.S.roleObj;
    var v = r ? bangCua(r.id) : '';
    if(!v || !G.VIEWS[v]) return U.lockCard('Vai của anh/chị chưa có bảng điều khiển riêng.');
    return G.VIEWS[v]();
  };

  G.VIEWS['dk-cac-vai'] = function(){
    if(!(typeof G.can==='function' && G.can('dh_toan_he')))
      return U.lockCard('Bảng điều khiển các vai mở cho ban điều hành (Super Admin · Admin · Giám đốc · Quản lý chuyên môn).');
    var o = U.ph({ eyebrow:'ĐIỀU HÀNH · 15 VAI', ic:'users', grad:1, t:'Bảng điều khiển các vai — 15 vai × 10 màn',
      lead:'Mỗi vai một bảng điều khiển riêng: mười màn chi tiết, mỗi màn mười nghiệp vụ lấy từ chuẩn nghề của vai. Bấm để xem ở chế độ giám sát — số tiến độ là đánh dấu trên máy này.' });
    var tongMan = 0, tongNV = 0;
    var the2 = (G.ROLES||[]).map(function(r){
      var v = bangCua(r.id); if(!v) return '';
      var P = v.indexOf('dk-')===0 ? dsVai()[v.slice(3)] : null;
      var nMan = P ? P.areas.length : (v==='van-hanh-10' ? (G.VA_AREA||[]).length : (G.GD_AREA||[]).length);
      tongMan += nMan; tongNV += nMan*10;
      var T = P ? tienDo(P) : null, mo = G.allowed(v);
      return '<div class="gdv-the'+(mo?'':' off')+'" style="--c:'+h(r.c)+'"><div class="gdv-h">'+
        '<span class="vh-so">'+h(r.id)+'</span><b class="gdv-t">'+h(r.n)+'<span class="tiny muted" style="display:block;font-weight:500">'+h(r.ln||'')+'</span></b>'+
        (T ? '<span class="dk-pt">'+T.xong+'/'+T.n+'</span>' : '')+
        (mo ? '<button class="btn sm vh-mo" data-v="'+h(v)+'">'+ic('arrow','w-3 h-3')+'Mở</button>' : '<span class="vh-khoa">'+ic('lock','w-3 h-3')+'khoá</span>')+
        '</div><div class="gdv-nvwrap tiny muted">'+nMan+' màn chi tiết · '+(nMan*10)+' nghiệp vụ</div></div>';
    }).join('');
    o += '<div class="grid g4 mb">'+
      U.stat({k:'Vai có bảng', v:String((G.ROLES||[]).filter(function(r){ return bangCua(r.id); }).length)+'/'+(G.ROLES||[]).length, d:'R01–R15'})+
      U.stat({k:'Màn chi tiết', v:String(tongMan), d:'trên toàn hệ'})+
      U.stat({k:'Nghiệp vụ', v:String(tongNV), d:'mỗi màn 10'})+
      U.stat({k:'Tài khoản', v:String((G.ACCOUNTS||[]).length), d:'đang hoạt động'})+'</div>';
    o += '<div class="gdv-luoi">'+the2+'</div>';
    return o;
  };

  Object.keys(dsVai()).forEach(function(k){
    var P = dsVai()[k]; P.key = k;
    G.VIEWS['dk-'+k] = function(){ return G.dkHubView(k); };
    P.areas.forEach(function(a){ G.VIEWS['dk-'+k+'-'+a.key] = function(){ return G.dkManView(k, a.key); }; });
  });
})();
