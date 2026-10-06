/* ═══════════════════════════════════════════════════════════════
   GITA 365 — KHUNG 10 MÀN CHI TIẾT CỦA GIÁM ĐỐC

   Mỗi mảng trong G.GD_AREA render thành một màn làm việc đầy đủ:
     · 4 ô số liệu
     · Báo cáo nhanh (bảng, có đèn màu)
     · 10 nghiệp vụ điều hành — mỗi nghiệp vụ BẤM ĐƯỢC: đổi trạng thái
       (chưa → đang → xong, lưu qua phiên) và nút "Mở" tới màn thao tác.
     · Mở màn gốc đầy đủ · quay về bảng điều khiển.

   View key: gd-<area.key>. Mở cho Giám đốc trở lên (dh_toan_he); mỗi màn
   tự kiểm quyền. Không đụng máy chủ · giấy phép · mã hoá.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G; G.VIEWS = G.VIEWS || {};
(function(){
  var U = G.U, h = U.h, ic = U.ic;
  var BANDC = { DO:'#BE0E16', VANG:'#B4720F', XANH:'#0B7350' };
  var TT = { '':{t:'Chưa',c:'--ink-4'}, dang:{t:'Đang làm',c:'--warn'}, xong:{t:'Đã xong',c:'--ok'} };

  function khu(key){ return (G.GD_AREA||[]).filter(function(a){ return a.key===key; })[0]; }

  /* Bấm đổi trạng thái một nghiệp vụ: chưa → đang → xong → chưa. */
  G.gdTick = function(id){
    if(!G.S.gdNV) G.S.gdNV = {};
    var cur = G.S.gdNV[id] || '';
    G.S.gdNV[id] = cur==='' ? 'dang' : cur==='dang' ? 'xong' : '';
    if(G.save) G.save();
    if(G.render) G.render();
  };

  function veBang(b){
    if(!b || !b.rows || !b.rows.length) return '';
    var den = (b.den==null) ? -1 : b.den;
    var head = '<tr>'+ b.cols.map(function(c){ return '<th>'+h(c)+'</th>'; }).join('') +'</tr>';
    var body = b.rows.map(function(r){
      return '<tr>'+ r.map(function(cell,ci){
        if(ci===den){ var m=BANDC[cell]||'#73849F'; return '<td class="ta-c"><span class="gd-den" style="--m:'+m+'" title="'+h(cell)+'"></span></td>'; }
        return '<td>'+h(String(cell))+'</td>';
      }).join('') +'</tr>';
    }).join('');
    return '<div class="gd-wrap"><table class="gd-tb"><thead>'+head+'</thead><tbody>'+body+'</tbody></table></div>';
  }

  function veNV(a){
    var xong=0;
    var rows = a.nv.map(function(it,i){
      var id = a.key+':'+i;
      var st = (G.S.gdNV||{})[id] || '';
      if(st==='xong') xong++;
      var t = TT[st];
      var mo = G.allowed ? G.allowed(it[1]) : true;
      var nut = mo ? '<button class="btn ghost sm gd-open" data-v="'+h(it[1])+'">Mở '+ic('arrow','w-3 h-3')+'</button>'
                   : '<span class="vh-khoa">'+ic('lock','w-3 h-3')+'khoá</span>';
      return '<div class="gd-nvr'+(st==='xong'?' done':'')+'">'+
        '<button class="gd-tick gd-tick-'+(st||'chua')+'" data-gdtick="'+h(id)+'" style="--m:var('+t.c+')" title="Bấm đổi trạng thái">'+
          (st==='xong'?ic('check','w-3 h-3'):st==='dang'?ic('clock','w-3 h-3'):'')+'</button>'+
        '<span class="gd-nvi">'+(i+1)+'</span>'+
        '<span class="gd-nvt">'+h(it[0])+'</span>'+
        '<span class="gd-nvs" style="--m:var('+t.c+')">'+h(t.t)+'</span>'+
        nut +'</div>';
    }).join('');
    return {html:'<div class="gd-nvlist">'+rows+'</div>', xong:xong};
  }

  G.gdManView = function(key){
    var a = khu(key);
    if(!a) return U.lockCard?U.lockCard('Không tìm thấy mảng.'):'—';
    if(!(typeof G.can==='function' && G.can('dh_toan_he')))
      return U.lockCard('Màn điều hành chi tiết mở cho Giám đốc trở lên. Đăng nhập đúng vai để xem.');

    var nv = veNV(a);
    var o = U.ph({ eyebrow:'GIÁM ĐỐC · MÀN '+a.so, ic:a.ic, grad:1, t:a.ten,
      lead:'Màn điều hành chi tiết: số liệu nhanh, báo cáo và mười nghiệp vụ bấm-thao-tác-được. Mỗi nghiệp vụ đổi trạng thái để theo dõi và mở thẳng màn làm việc.' });

    o += '<div class="row mb" style="gap:8px;flex-wrap:wrap">'+
      '<button class="btn ghost sm" data-v="van-hanh-gd">'+ic('arrow','w-3 h-3')+'Bảng điều khiển</button>'+
      (G.allowed && G.allowed(a.man) ? '<button class="btn sm" data-v="'+h(a.man)+'">'+ic('grid','w-3 h-3')+'Mở màn gốc đầy đủ</button>' : '')+
      '</div>';

    var st = a.stats ? a.stats() : [];
    if(st.length) o += '<div class="grid g4 mb">'+ st.map(function(s){ return U.stat(s); }).join('') +'</div>';

    var b = a.bang ? a.bang() : null;
    var coMau = a.nguon && a.nguon!=='that';
    o += U.sec('Báo cáo nhanh', coMau ? 'Số tổng hợp là mẫu vận hành tới khi nối máy chủ · phần đếm được lấy thật' : 'Dữ liệu thật từ hệ');
    o += veBang(b);

    o += U.sec('Mười nghiệp vụ điều hành', 'Bấm ô trạng thái để theo dõi (chưa · đang · xong) · bấm "Mở" để thao tác · đã xong '+nv.xong+'/10');
    o += nv.html;

    o += '<p class="tiny muted" style="margin-top:12px">'+ic('shield','w-3 h-3')+' Trạng thái nghiệp vụ lưu trên máy của anh/chị, giữ qua phiên. Mỗi "Mở" vẫn qua cổng quyền của hệ.</p>';
    return o;
  };

  (G.GD_AREA||[]).forEach(function(a){
    G.VIEWS['gd-'+a.key] = (function(k){ return function(){ return G.gdManView(k); }; })(a.key);
  });
})();
