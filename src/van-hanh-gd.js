/* ═══════════════════════════════════════════════════════════════
   GITA 365 — BẢNG ĐIỀU KHIỂN GIÁM ĐỐC · 10 MÀN × 10 NGHIỆP VỤ

   Hub điều hành (perm dh_toan_he). Đọc chung G.GD_AREA (10 mảng), mỗi
   thẻ liệt kê 10 nghiệp vụ và mở vào MÀN CHI TIẾT gd-<key> (số liệu ·
   báo cáo · nghiệp vụ bấm-thao-tác-được). Không đụng máy chủ · giấy phép.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G; G.VIEWS = G.VIEWS || {};
(function(){
  var U = G.U, h = U.h, ic = U.ic;

  function the(a){
    var moChiTiet = true; /* màn chi tiết gd-* tự kiểm quyền bên trong */
    var moGoc = G.allowed ? G.allowed(a.man) : true;
    var nv = '<ol class="gdv-nv">'+ a.nv.map(function(x){ return '<li>'+h(x[0])+'</li>'; }).join('') +'</ol>';
    return '<div class="gdv-the'+(moGoc?'':' off')+'" style="--c:var('+a.c+')">'+
      '<div class="gdv-h"><span class="vh-so">'+h(a.so)+'</span><span class="vh-ic">'+ic(a.ic)+'</span>'+
        '<b class="gdv-t">'+h(a.ten)+'</b>'+
        '<button class="btn sm vh-mo" data-v="gd-'+h(a.key)+'">'+ic('arrow','w-3 h-3')+'Mở chi tiết</button></div>'+
      '<div class="gdv-nvwrap"><span class="gdv-lbl">10 nghiệp vụ</span>'+nv+'</div>'+
    '</div>';
  }

  G.VIEWS['van-hanh-gd'] = function(){
    if(!(typeof G.can==='function' && G.can('dh_toan_he')))
      return U.lockCard('Bảng điều khiển Giám đốc mở cho Giám đốc trở lên. Đăng nhập đúng vai để xem.');
    var AREA = G.GD_AREA || [];
    var mo = AREA.filter(function(a){ return G.allowed ? G.allowed(a.man) : true; }).length;
    var tongNV = AREA.reduce(function(s,a){ return s + (a.nv?a.nv.length:0); }, 0);

    var o = U.ph({ eyebrow:'GIÁM ĐỐC · ĐIỀU HÀNH', ic:'crown', grad:1,
      t:'Bảng điều khiển Giám đốc — '+AREA.length+' màn × 10 nghiệp vụ',
      lead:'Mười mảng điều hành, mỗi mảng một màn chi tiết (số liệu · báo cáo · nghiệp vụ bấm-thao-tác-được). Bấm "Mở chi tiết" để vào màn làm việc của từng mảng.' });

    o += '<div class="grid g4 mb">'+
      U.stat({k:'Mảng điều hành', v:String(AREA.length), d:'màn chi tiết'})+
      U.stat({k:'Tổng nghiệp vụ', v:String(tongNV), d:AREA.length+' màn × 10'})+
      U.stat({k:'Màn gốc mở được', v:mo+'/'+AREA.length, d:'theo quyền của anh/chị', c: mo===AREA.length?'#0B7350':'#B4720F'})+
      U.stat({k:'Phòng ban', v:String(G.H16_HE?G.H16_HE.length:16), d:'bộ máy GITA'})+'</div>';

    o += '<div class="gdv-luoi">'+ AREA.map(the).join('') +'</div>';
    o += '<p class="tiny muted" style="margin-top:14px">'+ic('shield','w-3 h-3')+' Mỗi màn chi tiết & mỗi "Mở" vẫn qua cổng quyền của hệ. Đây là bàn điều khiển điều hành, không phải cửa tắt quyền.</p>';
    return o;
  };
})();
