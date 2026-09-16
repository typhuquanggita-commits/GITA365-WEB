/* ═══════════════════════════════════════════════════════════════
   GITA 365 · v7.0 — LỚP GIAO DIỆN DÙNG CHUNG
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;
var U = {};
G.U = U;

/* ─────────── Thoát ký tự — mọi chuỗi hiển thị đều đi qua đây ─────────── */
U.h = function(s){
  return String(s === null || s === undefined ? '' : s)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
};
U.nl = function(s){ return U.h(s).replace(/\n/g,'<br>'); };
U.num = function(v,d){ var n = Number(v); return isNaN(n) ? (d||0) : n; };
U.clamp = function(v,a,b){ return Math.max(a, Math.min(b, U.num(v))); };
U.slug = function(s){ return String(s||'').toLowerCase()
  .normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/đ/g,'d').replace(/[^a-z0-9]+/g,'-'); };

/* ─────────── Biểu tượng ─────────── */
U.P = {
  map:'M9 4 3 6.5v13L9 17l6 2.5 6-2.5v-13L15 6.5 9 4Zm0 0v13m6-10.5v13',
  compass:'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm3.6-12.6-2.2 5-5 2.2 2.2-5 5-2.2Z',
  vault:'M4 5h16v14H4V5Zm8 3.2a3.8 3.8 0 1 0 0 7.6 3.8 3.8 0 0 0 0-7.6ZM12 4v2m0 12v2',
  spark:'m12 3 2.2 5.6L20 10.8l-5.8 2.2L12 19l-2.2-6L4 10.8l5.8-2.2L12 3Z',
  orbit:'M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm7.5-9.5c2 2 1 6-2.4 9.4s-7.4 4.4-9.4 2.4-1-6 2.4-9.4 7.4-4.4 9.4-2.4Z',
  heart:'M12 20s-7.5-4.4-7.5-9.4A4.1 4.1 0 0 1 12 7.6a4.1 4.1 0 0 1 7.5 3C19.5 15.6 12 20 12 20Z',
  flame:'M12 21c3.3 0 6-2.4 6-5.6 0-4-4-5.6-3.4-10.4C11.4 6.4 9.6 8.6 9.6 11c0 1.4-.8 2-1.6 2S6 12 6 15.4C6 18.6 8.7 21 12 21Z',
  seed:'M12 21V11m0 0c0-3.9 3.1-7 7-7 0 3.9-3.1 7-7 7Zm0 3c0-2.8-2.2-5-5-5 0 2.8 2.2 5 5 5Z',
  target:'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-4.5a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9Zm0-3.3a1.2 1.2 0 1 0 0-2.4 1.2 1.2 0 0 0 0 2.4Z',
  book:'M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5v-15Zm2.5 12.5H20v3H6.5A2.5 2.5 0 0 1 4 18.5',
  brain:'M9.5 4a2.5 2.5 0 0 0-2.4 3.2A2.8 2.8 0 0 0 5 9.8c0 1 .5 1.9 1.3 2.4A2.8 2.8 0 0 0 8 17.4 2.6 2.6 0 0 0 12 19V5.6A2.6 2.6 0 0 0 9.5 4Zm5 0a2.5 2.5 0 0 1 2.4 3.2A2.8 2.8 0 0 1 19 9.8c0 1-.5 1.9-1.3 2.4A2.8 2.8 0 0 1 16 17.4 2.6 2.6 0 0 1 12 19',
  tools:'M14.5 6.5a3.5 3.5 0 0 0 4.7 4.7L21 13l-8 8-2-2 8-8-1.8-1.8a3.5 3.5 0 0 0-4.7-4.7L14.5 6.5ZM8 3l3 3-2 2-3-3 2-2Zm-1 5 9 9-2 2-9-9 2-2Z',
  calendar:'M4 7h16v13H4V7Zm4-3v5m8-5v5M4 11h16',
  ritual:'M12 3v4m0 0c-3 0-5 2-5 5v7h10v-7c0-3-2-5-5-5Zm-5 8h10M4 20h16',
  chart:'M4 20V4m0 16h16M8 17V11m4 6V7m4 10v-4',
  users:'M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm0 0c-3.3 0-6 2.2-6 5v3h12v-3c0-2.8-2.7-5-6-5Zm7.5-6.6a3.5 3.5 0 0 1 0 6.8M17 12.3c2.4.6 4 2.5 4 4.7V20h-3',
  crown:'M4 18h16M4 18 3 7l5 3.5L12 4l4 6.5L21 7l-1 11H4Z',
  share:'M18 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Zm0 13a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM6 14.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Zm2.2-3.3 7.6-3.9m0 8.4-7.6-3.9',
  shield:'M12 3 5 6v6c0 4.2 3 7.4 7 9 4-1.6 7-4.8 7-9V6l-7-3Zm-2.6 8.8 2 2 3.4-3.6',
  check:'m5 12.5 4.5 4.5L19 7',
  dot:'M12 12m-8 0a8 8 0 1 0 16 0a8 8 0 1 0-16 0',
  star:'m12 3.5 2.7 5.6 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3.5Z',
  lock:'M6 11h12v9H6v-9Zm2.5 0V7.5a3.5 3.5 0 1 1 7 0V11',
  arrow:'M4 12h15m-6-6 6 6-6 6',
  moon:'M20.5 14.8A8.6 8.6 0 1 1 9.2 3.5a7.1 7.1 0 0 0 11.3 11.3Z',
  sun:'M12 16.5a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9ZM12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8m10.6 10.6 1.8 1.8M19.1 4.9l-1.8 1.8M6.7 17.3l-1.8 1.8',
  home:'M4 11 12 4l8 7v9h-5v-6H9v6H4v-9Z',
  pulse:'M3 12h4l2.5-7 4 14L16 12h5',
  lightning:'M13 3 5 13.5h6L10 21l8-10.5h-6L13 3Z',
  search:'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14Zm5-2 5 5',
  menu:'M4 7h16M4 12h16M4 17h16',
  x:'M6 6l12 12M18 6 6 18',
  chev:'m9 5 7 7-7 7',
  bell:'M12 3a6 6 0 0 0-6 6v4l-2 3h16l-2-3V9a6 6 0 0 0-6-6Zm-2.5 16a2.5 2.5 0 0 0 5 0',
  quote:'M9 7c-2.8 0-5 2.2-5 5s2 4.5 4.5 4.5c.4 0 .8 0 1.2-.2-.6 1.8-2.2 3.2-4.2 3.7M19 7c-2.8 0-5 2.2-5 5s2 4.5 4.5 4.5c.4 0 .8 0 1.2-.2-.6 1.8-2.2 3.2-4.2 3.7',
  plus:'M12 5v14M5 12h14',
  clock:'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-14v5.2l3.4 2',
  zoom:'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14Zm5-2 5 5M8 11h6',
  out:'M15 4h4v16h-4M11 8l-4 4 4 4M7 12h10'
};
U.ic = function(n,cls){
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" ' +
         'stroke-linecap="round" stroke-linejoin="round" class="' + (cls||'') + '" aria-hidden="true">' +
         '<path d="' + (U.P[n] || U.P.spark) + '"/></svg>';
};

/* ─────────── Mảnh giao diện ─────────── */
U.chip = function(t,c,on){
  var st = c ? ' style="color:'+c+';border-color:'+c+'40;background:'+c+'1a"' : '';
  return '<span class="chip'+(on?' on':'')+'"'+st+'>'+U.h(t)+'</span>';
};
U.dot = function(c){ return '<i class="dot" style="color:'+c+'"></i>'; };
U.bar = function(v,c){
  return '<div class="bar"><i style="width:'+U.clamp(v,0,100)+'%'+(c?';background:'+c+';box-shadow:0 0 12px '+c+'99':'')+'"></i></div>';
};
U.stat = function(o){
  return '<div class="stat">'+(o.c?'<i class="fx" style="background:'+o.c+'"></i>':'')+
    '<div class="k">'+U.h(o.k)+'</div>'+
    '<div class="v"'+(o.c?' style="color:'+o.c+'"':'')+'>'+U.h(o.v)+'</div>'+
    '<div class="d">'+U.h(o.d||'')+'</div></div>';
};
U.ring = function(v,c,lb){
  var r=42, C=2*Math.PI*r, off=C*(1-U.clamp(v,0,100)/100);
  return '<div class="ring"><svg viewBox="0 0 96 96">'+
    '<circle cx="48" cy="48" r="'+r+'" fill="none" stroke="var(--phu-4)" stroke-width="7"/>'+
    '<circle cx="48" cy="48" r="'+r+'" fill="none" stroke="'+(c||'var(--gita)')+'" stroke-width="7" '+
    'stroke-linecap="round" stroke-dasharray="'+C.toFixed(1)+'" stroke-dashoffset="'+off.toFixed(1)+'"/></svg>'+
    '<div class="tx"><b>'+U.h(v)+'</b><span>'+U.h(lb||'')+'</span></div></div>';
};
U.ph = function(o){
  /* Tiêu đề, dòng nhãn và câu dẫn của mỗi màn đều sửa được từ màn
     "Sửa nội dung hiển thị". Khoá gắn theo màn đang mở. */
  if(G.nd && G.S && G.S.view){
    var v = G.S.view;
    o = {ic:o.ic, grad:o.grad,
      eyebrow: G.nd('man.'+v+'.eyebrow', o.eyebrow),
      t:       G.nd('man.'+v+'.t',       o.t),
      lead:    G.nd('man.'+v+'.lead',    o.lead)};
  }
  return '<header class="ph"><div class="eyebrow">'+
    (o.ic?U.ic(o.ic,'w-4 h-4'):'')+'<span>'+U.h(o.eyebrow||'')+'</span></div>'+
    '<h1>'+(o.grad?'<span class="grad-text">'+U.h(o.t)+'</span>':U.h(o.t))+'</h1>'+
    (o.lead?'<p class="lead">'+U.h(o.lead)+'</p>':'')+'</header>';
};
U.sec = function(t,s){
  /* Dòng phụ trùng tiêu đề thì bỏ hẳn. Nhiều chỗ gọi U.sec(x, kho.ten)
     mà kho.ten chính là x, nên màn in ra hai dòng y hệt nhau — người
     đọc tưởng máy lỗi. Chặn ở đây một lần, không đi sửa từng chỗ gọi. */
  if(s && String(s).trim().toLowerCase() === String(t).trim().toLowerCase()) s = '';
  return '<div class="row mt2 mb" style="gap:12px"><div><div class="up" style="color:var(--ink-4)">'+U.h(t)+'</div>'+
    (s?'<div class="sm muted" style="margin-top:2px">'+U.h(s)+'</div>':'')+'</div>'+
    '<div class="grow" style="height:1px;background:var(--line)"></div></div>';
};
U.quote = function(t,by){
  return '<div class="quote"><p>'+U.h(t)+'</p>'+(by?'<cite>— '+U.h(by)+'</cite>':'')+'</div>';
};
U.ba = function(from,to,kf,kt){
  return '<div class="ba"><div class="side from"><div class="k">'+U.h(kf||'TỪ — NỖI ĐAU')+'</div><p>'+U.h(from)+'</p></div>'+
    '<div class="ar">'+U.ic('arrow')+'</div>'+
    '<div class="side to"><div class="k">'+U.h(kt||'ĐẾN — KHÁT KHAO')+'</div><p>'+U.h(to)+'</p></div></div>';
};
U.tbl = function(cols, rows){
  return '<div class="tbl-wrap"><table class="tbl"><thead><tr>'+
    cols.map(function(c){return '<th>'+U.h(c)+'</th>';}).join('')+
    '</tr></thead><tbody>'+
    rows.map(function(r){return '<tr>'+r.map(function(c){return '<td>'+c+'</td>';}).join('')+'</tr>';}).join('')+
    '</tbody></table></div>';
};
U.list = function(arr, c){
  /* Nhận cả mảng lẫn một chuỗi. Nhiều bản ghi trong kho khai một trường
     lúc là mảng, lúc là chuỗi — ví dụ nguoiKhacThay trong bộ chân dung.
     Trước đây chuỗi lọt qua kiểm .length rồi nổ ở .map, và cả mười chân
     dung không mở ra được. */
  if (typeof arr === 'string') arr = arr.trim() ? [arr] : [];
  if (!Array.isArray(arr)) arr = [];
  return '<ul style="list-style:none;display:flex;flex-direction:column;gap:7px">'+
    (arr||[]).map(function(x){
      return '<li style="display:flex;gap:9px;font-size:14.5px;line-height:1.55;color:var(--ink-2)">'+
        '<i style="color:'+(c||'var(--gold)')+';flex:none;margin-top:7px;width:5px;height:5px;border-radius:50%;background:currentColor"></i>'+
        '<span>'+U.h(typeof x==='string'?x:(x.ten||x.t||JSON.stringify(x)))+'</span></li>';
    }).join('')+'</ul>';
};
/* Màn chưa mở kho: KHÔNG để một dòng "Phần này nằm trong kho nghề" rồi thôi.
   Người đọc dòng ấy không biết phải làm gì tiếp, và kết luận là hệ thống chưa
   xong. Nên U.empty nay tự dựng luôn hàng nút mở — đúng nút hợp với vai đang
   đăng nhập, không đưa ba lựa chọn để người ta tự đoán. */
U.empty = function(t, s, khongNut){
  var G = window.G || {};
  var o = '<div class="card center" style="padding:38px 30px">'+
    '<div style="opacity:.4;margin-bottom:12px">'+U.ic('seed','w-9 h-9')+'</div>'+
    '<b style="font-size:16px">'+U.h(t)+'</b>'+
    (s ? '<p class="sm muted mt" style="max-width:56ch;margin-inline:auto">'+U.h(s)+'</p>' : '')+
  '</div>';

  if(khongNut || !G.S || !G.S.acc) return o;

  var mau = G.KHO && G.KHO.cheDoMau;
  if(!mau) return o;

  var napDuoc = !!(G.napDuocGiayPhep && G.napDuocGiayPhep());
  var laChu   = !!(G.can && G.can('qt_trang'));
  var nut = [];
  if(napDuoc) nut.push('<button class="btn pri" data-act="gp-mo">'+U.ic('vault','w-4 h-4')+'Nạp tệp giấy phép</button>');
  if(laChu)   nut.push('<button class="btn '+(napDuoc?'ghost':'pri')+'" data-v="noi-may-chu">'+
                       U.ic('orbit','w-4 h-4')+'Nối máy chủ</button>');
  nut.push('<button class="btn ghost" data-act="logout">'+U.ic('out','w-4 h-4')+'Đăng nhập lại</button>');

  return o + '<div class="card mt2" style="border-color:var(--gita);background:var(--gita-mo-1)">'+
    '<div class="row" style="gap:11px;align-items:center;flex-wrap:wrap">'+
      '<b class="sm" style="color:var(--gita-ink)">'+U.ic('arrow','w-4 h-4')+' Mở ngay:</b>'+
      nut.join('')+
    '</div>'+
    '<p class="tiny muted mt">Ứng dụng đang chạy bản mẫu nên bảy gói kho đều chưa có khoá. '+
    (napDuoc ? 'Nạp tệp giấy phép là đường nhanh nhất — chọn tệp là mở ngay, không cần mạng.'
             : 'Nhắn Admin hệ thống để được cấp quyền hoặc nối máy chủ.')+'</p></div>';
};
U.lockCard = function(msg){
  return '<div class="card center" style="padding:40px"><div style="color:var(--ink-4);margin-bottom:10px">'+
    U.ic('lock','w-8 h-8')+'</div><b>Vai hiện tại chưa mở mục này</b>'+
    '<p class="sm muted mt" style="max-width:52ch;margin-inline:auto">'+U.h(msg||'Đăng nhập bằng vai có quyền cao hơn để xem. Danh sách tài khoản thử nằm ở màn hình Cổng vào.')+'</p></div>';
};

/* ─────────── Thông báo ─────────── */
var _tt;
U.toast = function(msg, kind){
  var t = document.getElementById('toast');
  if(!t) return;
  t.innerHTML = U.ic(kind==='err'?'x':'check','w-4 h-4') + '<span>' + U.h(msg) + '</span>';
  t.className = 'on' + (kind ? ' ' + kind : '');
  clearTimeout(_tt);
  _tt = setTimeout(function(){ t.className = ''; }, 3400);
};

/* ─────────── Hộp thoại ─────────── */
U.modal = function(html){
  var m = document.getElementById('modal');
  m.querySelector('.bx').innerHTML = '<button class="mx" aria-label="Đóng">'+U.ic('x','w-4 h-4')+'</button>' + html;
  m.classList.add('on');
  m.querySelector('.mx').onclick = U.closeModal;
};
U.closeModal = function(){ document.getElementById('modal').classList.remove('on'); };
