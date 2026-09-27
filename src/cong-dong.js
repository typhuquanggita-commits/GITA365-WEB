/* ═══════════════════════════════════════════════════════════════
   GITA 365 · v8.3 — KÊNH CỘNG ĐỒNG TRONG GIAO DIỆN

   Nối nhóm Gia Đình Thịnh Vượng vào ứng dụng ở ba chỗ, không dựng thêm
   một mục điều hướng mới:

     · Màn "GITA 365 là gì" — cuối màn, sau khi đã đọc cả phần không làm
     · Màn "Đường vào sáu bước" — đầu màn, vì nhóm là bước số không
     · Màn "Kết nối hệ sinh thái" — bảng đầy đủ ba kênh kèm ranh giới

   Vì sao không thêm mục điều hướng: một đường dẫn ra ngoài không xứng
   một mục trong trình đơn, và đặt nó cạnh các mục nội dung sẽ làm người
   dùng tưởng bấm vào là mở một màn trong ứng dụng.

   Mọi đường dẫn ra ngoài đều mở tab mới, có rel chặn tham chiếu ngược,
   và có nhãn nói rõ là rời khỏi ứng dụng. Người dùng phải biết mình sắp
   đi đâu trước khi bấm.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;

(function(){
var U = G.U, h = U.h, ic = U.ic;

function nutRaNgoai(k, gon){
  return '<a class="btn'+(gon ? ' ghost sm' : ' pri')+'" href="'+h(k.url)+'" '+
    'target="_blank" rel="noopener noreferrer nofollow">'+
    ic(k.ic,'w-4 h-4')+' '+h(k.ten)+
    '<span class="tiny" style="opacity:.7;margin-left:6px">↗ rời ứng dụng</span></a>';
}

/* Thẻ mời vào nhóm phụ huynh — dùng ở màn giới thiệu và đường vào */
G.cdTheNhom = function(){
  var k = (G.KENH_DS || [])[0];
  if(!k) return '';
  return '<div class="card mt2" style="border-left:3px solid '+k.c+'">'+
    '<div class="row" style="gap:10px;align-items:baseline;flex-wrap:wrap">'+
      '<span style="color:'+k.c+'">'+ic(k.ic,'w-4 h-4')+'</span>'+
      '<b style="flex:1;min-width:200px;font-size:16px">'+h(k.ten)+'</b>'+
      U.chip(k.loai, k.c)+'</div>'+
    '<p class="sm mt" style="line-height:1.75">'+h(k.vaiTro)+'</p>'+
    '<p class="sm muted mt" style="line-height:1.7"><b>Cho ai:</b> '+h(k.ai)+'</p>'+
    '<div class="mt2">'+nutRaNgoai(k)+'</div>'+
    '<p class="tiny muted mt2" style="line-height:1.6">'+h(k.noiTiep)+'</p></div>';
};

/* Bảng đầy đủ ba kênh — dùng ở màn kết nối hệ sinh thái */
G.cdBang = function(){
  var DS = G.KENH_DS || [];
  if(!DS.length) return '';
  var o = U.sec('KÊNH CỘNG ĐỒNG CHÍNH THỨC',
    'Ba kênh này là của Học viện. Kênh riêng của một người vẫn là vi phạm như cũ.');

  DS.forEach(function(k){
    o += '<div class="card mt2" style="border-left:3px solid '+k.c+'">'+
      '<div class="row" style="gap:10px;align-items:baseline;flex-wrap:wrap">'+
        '<span style="color:'+k.c+'">'+ic(k.ic,'w-4 h-4')+'</span>'+
        '<b style="flex:1;min-width:180px;font-size:16px">'+h(k.ten)+'</b>'+
        U.chip(k.nen)+U.chip(k.loai, k.c)+'</div>'+
      '<p class="sm mt" style="line-height:1.75">'+h(k.vaiTro)+'</p>'+
      '<p class="sm muted mt"><b>Cho ai:</b> '+h(k.ai)+'</p>'+
      '<div class="row wrap mt2" style="gap:12px;align-items:flex-start">'+
        '<div style="flex:1;min-width:250px">'+
          '<div class="tiny up" style="color:var(--ok)">ĐƯỢC ĐĂNG</div>'+
          U.list(k.cho, 'var(--ok)')+'</div>'+
        '<div style="flex:1;min-width:250px">'+
          '<div class="tiny up" style="color:var(--gita-do-ink)">KHÔNG ĐĂNG</div>'+
          U.list(k.khong, 'var(--gita-do)')+'</div>'+
      '</div>'+
      '<p class="sm mt2" style="line-height:1.7;padding-top:12px;border-top:1px dashed var(--phu-4)">'+
        '<b>Đi tiếp:</b> '+h(k.noiTiep)+'</p>'+
      '<div class="mt2">'+nutRaNgoai(k, 1)+'</div></div>';
  });

  /* Chặng — nhóm là bước số không */
  o += '<div class="card mt2"><div class="tiny up muted mb">NHÓM NẰM Ở ĐÂU TRONG ĐƯỜNG VÀO</div>'+
    (G.KENH_CHANG || []).map(function(x, i){
      return '<div class="row'+(i ? ' mt2' : '')+'" style="gap:11px;align-items:flex-start">'+
        '<span style="width:26px;height:26px;flex:none;border-radius:9px;display:flex;'+
          'align-items:center;justify-content:center;background:var(--gita)18;color:var(--gita);'+
          'font-weight:700;font-size:14.5px">'+h(x.b)+'</span>'+
        '<div style="flex:1"><b class="sm">'+h(x.ten)+'</b>'+
          '<span class="tiny muted"> · '+h(x.noi)+'</span>'+
          '<p class="sm mt" style="line-height:1.7">'+h(x.lam)+'</p>'+
          '<p class="sm mt" style="line-height:1.7;color:var(--ok)">Xong khi: '+h(x.xong)+'</p></div></div>';
    }).join('') +'</div>';

  /* Luật — phần quan trọng nhất, đặt cuối để đọng lại */
  o += '<div class="card mt2" style="border-color:var(--gita-do)">'+
    '<div class="tiny up mb" style="color:var(--gita-do-ink)">SÁU LUẬT KÊNH CỘNG ĐỒNG</div>'+
    (G.KENH_LUAT || []).map(function(x, i){
      return '<div style="'+(i ? 'border-top:1px solid var(--line);padding-top:12px;margin-top:12px' : '')+'">'+
        '<b class="sm">'+h(x.t)+'</b>'+
        '<p class="sm muted mt" style="line-height:1.7">'+h(x.y)+'</p></div>';
    }).join('') +'</div>';

  return o;
};

/* ── Nối dài ba màn đã có, không thêm mục điều hướng ── */
function biKhoa(html){
  return typeof html !== 'string' ||
    html.trim().indexOf('<div class="card center" style="padding:40px">') === 0;
}
function noi(ten, them, dau){
  var cu = G.VIEWS && G.VIEWS[ten];
  if(typeof cu !== 'function') return;
  G.VIEWS[ten] = function(){
    var o = cu.apply(this, arguments);
    if(biKhoa(o)) return o;
    try { return dau ? (them() + o) : (o + them()); } catch(e){ return o; }
  };
}

noi('gioi-thieu', function(){
  return U.sec('CỘNG ĐỒNG GIA ĐÌNH THỊNH VƯỢNG',
    'Chưa cần là khách hàng vẫn vào được — nghe cách nghĩ của Học viện trước khi quyết') +
    G.cdTheNhom();
});

/* Ở đường vào, nhóm là BƯỚC SỐ KHÔNG nên đặt lên đầu màn */
noi('tham-gia', function(){
  return U.sec('BƯỚC SỐ KHÔNG — TRƯỚC KHI ĐĂNG KÝ',
    'Nhiều nhà cần một thời gian nghe trước khi quyết. Nhóm là chỗ ấy, và không ai bán gì ở đó') +
    G.cdTheNhom();
}, 1);

noi('ket-noi', function(){ return G.cdBang(); });

})();
