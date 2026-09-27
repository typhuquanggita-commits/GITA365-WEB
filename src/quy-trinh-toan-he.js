/* ═══════════════════════════════════════════════════════════════
   GITA 365 · v8.1 — MÀN BẢNG QUY TRÌNH TOÀN WEB APP

   Trả lời câu chủ hệ thống hỏi: nhìn từ A đến Z thì Web App này vận
   hành thế nào, và trong phạm vi quyền của mình thì mình cầm những gì.

   Ba phần:
     A · Tám luồng vận hành — chuỗi bước có thật, mỗi bước một màn
     B · Toàn bộ màn hình — ĐẾM TỪ G.NAV, không khai tay
     C · Quyền chỉ cấp quản trị có

   Phần B tự đếm có chủ ý. Một bảng quy trình khai tay sẽ lệch khỏi ứng
   dụng ngay lần thêm màn sau, và bảng lệch còn tệ hơn không có bảng —
   người đọc tin nó rồi ra quyết định sai.

   Mọi tên màn trong luồng cũng được đối chiếu với G.NAV lúc dựng: khai
   một màn không có thật thì hiện đỏ ngay tại dòng ấy.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;

(function(){
var U = G.U, h = U.h, ic = U.ic;
G.VIEWS = G.VIEWS || {};

/* Bản đồ tên màn → mục điều hướng, dựng lại mỗi lần vẽ */
function banDoMan(){
  var m = {};
  (G.NAV || []).forEach(function(g){
    (g.items || []).forEach(function(i){ m[i.v] = { it:i, nhom:g }; });
  });
  return m;
}

/* Vai thấp nhất mở được một màn — đọc từ bảng quyền thật */
function vaiThapNhat(perm){
  if(!perm) return 'mọi vai';
  var ds = (G.ROLES || []).filter(function(v){ return G.vaiCo && G.vaiCo(v.id, perm); });
  if(!ds.length) return '—';
  var thap = ds[0];
  ds.forEach(function(v){ if(v.lv > thap.lv) thap = v; });
  return thap.short + ' (LV' + thap.lv + ')';
}

G.qtSoat = function(){
  var bd = banDoMan(), hong = [], man = 0;
  (G.QT_LUONG || []).forEach(function(l){
    (l.buoc || []).forEach(function(b, i){
      man++;
      if(!bd[b.man]) hong.push(l.ma + '.' + (i + 1) + ' → ' + b.man);
    });
  });
  return { hong:hong, man:man, luong:(G.QT_LUONG || []).length };
};

G.VIEWS['quy-trinh-toan-he'] = function(){
  if(!G.can('qt_trang')) return U.lockCard(
    'Bảng quy trình toàn hệ cho thấy mọi luồng vận hành và mọi quyền của cấp quản trị. '+
    'Màn này chỉ mở cho Super Admin và Admin hệ thống.');

  var L = G.QT_LUONG || [], bd = banDoMan(), soat = G.qtSoat();
  var NAV = G.NAV || [], TH = G.TANG_HIENTHI || [];
  var tongMan = 0; NAV.forEach(function(g){ tongMan += (g.items || []).length; });
  var soQuyen = Object.keys(G.PERM || {}).length;
  var trongLuong = {};
  L.forEach(function(l){ (l.buoc || []).forEach(function(b){
    (trongLuong[b.man] = trongLuong[b.man] || []).push(l.ma); }); });
  var daPhu = Object.keys(trongLuong).filter(function(v){ return bd[v]; }).length;

  var o = U.ph({eyebrow:'QUẢN TRỊ TRANG', ic:'orbit', grad:1,
    t:'Bảng quy trình toàn Web App',
    lead:'Tám luồng vận hành, từng bước một màn, mỗi bước nói rõ ai làm · xong khi nào · '+
         'không xong thì làm gì. Số màn và số quyền ở đây được ĐẾM từ chính ứng dụng đang chạy, '+
         'không khai tay — bảng quy trình lệch còn tệ hơn không có bảng.'});

  o += '<div class="grid g4 mt2">'+
    U.stat({k:'LUỒNG VẬN HÀNH', v:soat.luong, d:'chuỗi bước có thật trong ứng dụng', c:'#2A72C6'})+
    U.stat({k:'TỔNG BƯỚC', v:soat.man, d:'mỗi bước gắn đúng một màn', c:'#5140B4'})+
    U.stat({k:'MÀN HÌNH', v:tongMan, d:daPhu + ' màn nằm trong một luồng', c:'#0B7350'})+
    U.stat({k:'QUYỀN', v:soQuyen, d:'Super Admin có đủ, không thiếu quyền nào',
            c: soat.hong.length ? '#BE0E16' : '#0B7350'})+
  '</div>';

  if(soat.hong.length)
    o += '<div class="card mt2" style="border-color:var(--gita-do)">'+
      '<div class="tiny up mb" style="color:var(--gita-do-ink)">BƯỚC TRỎ TỚI MÀN KHÔNG CÓ THẬT</div>'+
      '<p class="sm" style="line-height:1.7">'+h(soat.hong.join(' · '))+'</p>'+
      '<p class="sm muted mt">Ứng dụng đã đổi mà bảng luồng chưa đổi theo. Sửa ở '+
      '<span class="mono">kho-goc/data.quy-trinh-toan-he.js</span>.</p></div>';
  else
    o += '<div class="card mt2" style="border-color:var(--ok)">'+
      '<div class="row" style="gap:9px"><span style="color:var(--ok)">'+ic('check','w-4 h-4')+'</span>'+
      '<p class="sm" style="flex:1;line-height:1.7">Cả '+soat.man+' bước đều trỏ tới màn có thật. '+
      'Bảng luồng đang khớp với ứng dụng.</p></div></div>';

  /* ══ A · TÁM LUỒNG ══ */
  o += U.sec('TÁM LUỒNG VẬN HÀNH',
    'Cột "không xong thì làm gì" quan trọng ngang cột "xong khi" — quy trình chỉ mô tả đường thuận là quy trình chưa dùng được');

  L.forEach(function(l){
    o += '<div class="card mt2" style="border-left:3px solid '+l.c+'">'+
      '<div class="row" style="gap:11px;align-items:baseline;flex-wrap:wrap">'+
        '<span style="color:'+l.c+'">'+ic(l.ic,'w-4 h-4')+'</span>'+
        '<b class="mono" style="color:'+l.c+'">'+h(l.ma)+'</b>'+
        '<b style="flex:1;min-width:200px;font-size:16px">'+h(l.ten)+'</b>'+
        '<span class="chip">'+h(l.buoc.length)+' bước</span></div>'+
      '<p class="sm mt" style="line-height:1.75">'+h(l.y)+'</p>'+
      '<p class="tiny muted mt"><b>Ai chạy luồng này:</b> '+h(l.ai)+'</p>'+
      '<div class="mt2">'+
      U.tbl(['#','Ai','Mở màn','Làm gì','Xong khi','Không xong thì'],
        l.buoc.map(function(b, i){
          var co = bd[b.man];
          return ['<b class="mono" style="color:'+l.c+'">'+(i+1)+'</b>',
                  '<span class="sm">'+h(b.ai)+'</span>',
                  co ? '<a href="#" data-v="'+h(b.man)+'"><b class="sm">'+h(co.it.t)+'</b></a>'+
                       '<div class="tiny mono muted">'+h(b.man)+'</div>'
                     : '<b class="sm" style="color:var(--gita-do-ink)">'+h(b.man)+' — KHÔNG CÓ MÀN NÀY</b>',
                  '<span class="sm">'+h(b.lam)+'</span>',
                  '<span class="sm" style="color:var(--ok)">'+h(b.xong)+'</span>',
                  '<span class="sm" style="color:var(--gita-do-ink)">'+h(b.neu)+'</span>'];
        }))+'</div></div>';
  });

  /* ══ B · TOÀN BỘ MÀN, ĐẾM TỪ ỨNG DỤNG ══ */
  o += U.sec('TOÀN BỘ MÀN HÌNH — ĐẾM TỪ ỨNG DỤNG ĐANG CHẠY',
    tongMan + ' màn trong ' + NAV.length + ' nhóm. Cột "vai thấp nhất" đọc từ bảng quyền thật, không chép tay.');

  NAV.forEach(function(g){
    o += '<div class="card mt2">'+
      '<div class="row" style="gap:10px;align-items:baseline;flex-wrap:wrap">'+
        '<b style="font-size:16px">'+h(g.t || g.id)+'</b>'+
        '<span class="chip">'+((g.items || []).length)+' màn</span></div>'+
      '<div class="mt">'+
      U.tbl(['Màn','Làm gì','Quyền','Vai thấp nhất mở được','Trong luồng'],
        (g.items || []).map(function(i){
          var l = trongLuong[i.v];
          return ['<a href="#" data-v="'+h(i.v)+'"><b class="sm">'+h(i.t)+'</b></a>'+
                  '<div class="tiny mono muted">'+h(i.v)+'</div>',
                  '<span class="sm">'+h(i.h || '')+'</span>',
                  i.perm ? '<span class="tiny mono">'+h(i.perm)+'</span>'
                         : '<span class="tiny muted">mở cho mọi vai</span>',
                  '<span class="tiny">'+h(vaiThapNhat(i.perm))+'</span>',
                  l ? '<span class="tiny mono" style="color:var(--gita)">'+h(l.join(' '))+'</span>'
                    : '<span class="tiny muted">—</span>'];
        }))+'</div></div>';
  });

  /* ══ C · QUYỀN RIÊNG CỦA CẤP QUẢN TRỊ ══ */
  o += U.sec('QUYỀN CHỈ SUPER ADMIN VÀ ADMIN HỆ THỐNG CÓ',
    'Viết ra để biết mình đang cầm gì — và biết mất tài khoản này thì mất những gì');
  o += '<div class="card">'+ (G.QT_RIENG || []).map(function(x, i){
    return '<div class="row'+(i ? ' mt2' : '')+'" style="gap:11px;align-items:flex-start">'+
      '<span style="color:var(--gita);font-weight:700;flex:none">'+(i+1)+'</span>'+
      '<div style="flex:1"><b class="sm">'+h(x.t)+'</b>'+
      '<p class="sm muted mt" style="line-height:1.7">'+h(x.y)+'</p></div></div>';
  }).join('') +'</div>';

  /* ══ TẦNG HIỂN THỊ ══ */
  o += U.sec('CHÍN TẦNG HIỂN THỊ','Mỗi màn thuộc đúng một tầng — đây là cách phạm vi được chia');
  o += U.tbl(['Tầng','Ai thấy','Điều kiện quyền','Số màn'],
    TH.map(function(t){
      var n = 0;
      NAV.forEach(function(g){ (g.items || []).forEach(function(i){ if(i.capMo === t.id) n++; }); });
      return ['<b class="sm mono">'+h(t.id)+'</b><div class="tiny muted">'+h(t.t)+'</div>',
              '<span class="sm">'+h(t.mo)+'</span>',
              t.perm ? '<span class="tiny mono">'+h(t.perm)+'</span>'
                     : '<span class="tiny muted">không điều kiện</span>',
              '<b class="mono">'+n+'</b>'];
    }));

  /* ══ LUẬT ══ */
  o += U.sec('BỐN LUẬT KHI ĐỌC BẢNG NÀY','');
  o += '<div class="card">'+ (G.QT_LUAT || []).map(function(x, i){
    return '<div style="'+(i ? 'border-top:1px solid var(--line);padding-top:13px;margin-top:13px' : '')+'">'+
      '<b class="sm">'+h(x.t)+'</b>'+
      '<p class="sm muted mt" style="line-height:1.7">'+h(x.y)+'</p></div>';
  }).join('') +'</div>';

  return o;
};

})();
