/* ═══════════════════════════════════════════════════════════════
   GITA 365 — BẢNG ĐIỀU KHIỂN VẬN HÀNH · 10 MÀN × 10 NGHIỆP VỤ

   Hub quản trị A–Z (perm qt_trang). Đọc chung G.VA_AREA (10 mảng), xếp
   theo ba cụm (Người & tổ chức · Kinh doanh · Sản xuất & an toàn). Mỗi
   thẻ liệt kê 10 nghiệp vụ và mở vào MÀN CHI TIẾT va-<key> (số liệu · báo
   cáo có đèn · nghiệp vụ bấm-thao-tác-được). Không đụng máy chủ · giấy phép.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G; G.VIEWS = G.VIEWS || {};
(function(){
  var U = G.U, h = U.h, ic = U.ic;

  var CUM = { A:{t:'NGƯỜI & TỔ CHỨC', s:'Quyền · phòng ban · năng lực · đào tạo'},
              B:{t:'KINH DOANH', s:'Khách hàng · marketing · sản phẩm · tài chính'},
              C:{t:'SẢN XUẤT & AN TOÀN', s:'Studio · bảo mật & bản quyền'} };

  function the(a){
    var moGoc = G.allowed ? G.allowed(a.man) : true;
    var nv = '<ol class="gdv-nv">'+ a.nv.map(function(x){ return '<li>'+h(x[0])+'</li>'; }).join('') +'</ol>';
    return '<div class="gdv-the'+(moGoc?'':' off')+'" style="--c:var('+a.c+')">'+
      '<div class="gdv-h"><span class="vh-so">'+h(a.so)+'</span><span class="vh-ic">'+ic(a.ic)+'</span>'+
        '<b class="gdv-t">'+h(a.ten)+'</b>'+
        '<button class="btn sm vh-mo" data-v="va-'+h(a.key)+'">'+ic('arrow','w-3 h-3')+'Mở chi tiết</button></div>'+
      '<div class="gdv-nvwrap"><span class="gdv-lbl">10 nghiệp vụ</span>'+nv+'</div>'+
    '</div>';
  }

  G.VIEWS['van-hanh-10'] = function(){
    if(!(typeof G.can==='function' && G.can('qt_trang')))
      return U.lockCard('Bảng điều khiển vận hành mở cho Super Admin / Admin. Đăng nhập đúng vai để xem.');
    var AREA = G.VA_AREA || [];
    var mo = AREA.filter(function(a){ return G.allowed ? G.allowed(a.man) : true; }).length;
    var tongNV = AREA.reduce(function(s,a){ return s + (a.nv?a.nv.length:0); }, 0);

    var o = U.ph({ eyebrow:'SUPER ADMIN · VẬN HÀNH A–Z', ic:'grid', grad:1,
      t:'Bảng điều khiển vận hành — '+AREA.length+' màn × 10 nghiệp vụ',
      lead:'Trọn mười mảng quản trị của hệ, mỗi mảng một màn chi tiết (số liệu · báo cáo · nghiệp vụ bấm-thao-tác-được). Bấm "Mở chi tiết" để vào màn làm việc của từng mảng — vẫn giữ đúng cổng quyền.' });

    o += '<div class="grid g4 mb">'+
      U.stat({k:'Mảng vận hành', v:String(AREA.length), d:'màn chi tiết'})+
      U.stat({k:'Tổng nghiệp vụ', v:String(tongNV), d:AREA.length+' màn × 10'})+
      U.stat({k:'Màn gốc mở được', v:mo+'/'+AREA.length, d:'theo quyền của anh/chị', c: mo===AREA.length?'#0B7350':'#B4720F'})+
      U.stat({k:'Vai × quyền', v:(G.ROLES?G.ROLES.length:15)+'×'+(G.PERM?Object.keys(G.PERM).length:44), d:'ma trận phân quyền'})+'</div>';

    ['A','B','C'].forEach(function(c){
      var nhom = AREA.filter(function(a){ return a.cum===c; });
      if(!nhom.length) return;
      o += U.sec(CUM[c].t, CUM[c].s);
      o += '<div class="gdv-luoi">'+ nhom.map(the).join('') +'</div>';
    });
    o += '<p class="tiny muted" style="margin-top:14px">'+ic('shield','w-3 h-3')+' Mỗi màn chi tiết & mỗi "Mở" vẫn qua cổng quyền của hệ. Đây là bàn điều khiển vận hành, không phải cửa tắt quyền.</p>';
    return o;
  };
})();
