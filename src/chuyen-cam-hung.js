/* ═══════════════════════════════════════════════════════════════
   GITA 365 · v8.8 — MÀN HÌNH CHUYỆN TRUYỀN CẢM HỨNG

   Sáu trăm chuyện, mỗi cấp tài khoản một trăm. Ba việc màn này làm:

     1. CHUYỆN HÔM NAY — mở ứng dụng là có một chuyện, đúng cấp của mình,
        không phải đi tìm. Chọn theo ngày và theo tài khoản, nên cả nhà
        không đọc trùng nhau, và mỗi ngày một chuyện khác.
     2. MỖI NHIỆM VỤ MỘT CHUYỆN — anh Quang yêu cầu rõ. Chuyện gắn vào
        nhiệm vụ theo mã, nên nhiệm vụ nào cũng có đúng một chuyện của
        nó, không đổi từ hôm nay sang hôm khác.
     3. ĐỌC RỒI THÌ LÀM GÌ — mỗi chuyện kết bằng một việc làm được ngay
        hôm nay. Đọc mà không làm thì chuyện chỉ là chuyện.

   Ai đọc kho nào: mỗi vai chỉ mở kho của cấp mình. Super Admin và Admin
   mở được cả sáu, vì phải soát nội dung.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;

(function(){
var U = G.U, h = U.h, ic = U.ic;
G.VIEWS = G.VIEWS || {};

var KHO_DOC = 'gita365_chuyen_da_doc';

/* ─── Lời trích: tra theo mã, luôn kèm tên tác giả thật ─── */
G.chLoi = function(ma){
  if(!ma) return null;
  return (G.ROHN || []).filter(function(q){ return q.ma === ma; })[0] || null;
};

/* ─── Cấp tài khoản của người đang xem ─── */
G.chCapCuaToi = function(){
  var r = G.S && G.S.roleObj;
  if(!r) return 'PH';
  if(r.id === 'R14') return 'HS';
  if(r.id === 'R13') return 'PH';
  if(r.id === 'R15') return 'CTV';
  if(r.id === 'R11' || r.id === 'R10') return 'TUVAN';
  if(r.lv >= 5 && r.lv <= 9) return 'COACH';
  return 'ADMIN';
};
/* Super Admin và Admin hệ thống soát được cả sáu kho */
function xemDuocHet(){
  var r = G.S && G.S.roleObj;
  return !!(r && r.lv <= 2);
}
G.chKhoMoDuoc = function(){
  return xemDuocHet() ? (G.CH_CAP || []).map(function(x){ return x.ma; }) : [G.chCapCuaToi()];
};

function kho(cap){
  return (G.CHUYEN || []).filter(function(x){ return x.cap === cap; });
}
G.chKho = kho;

/* ─── Đã đọc ─── */
var DA_DOC = {};
try{ DA_DOC = JSON.parse(localStorage.getItem(KHO_DOC) || '{}') || {}; }catch(e){ DA_DOC = {}; }
/* Phơi ra để đường đồng bộ đọc và ghi được — xem NGUON trong src/dong-bo.js */
G.CHUYEN_DOC = DA_DOC;
function docLai(){
  if(G.CHUYEN_DOC && G.CHUYEN_DOC !== DA_DOC) DA_DOC = G.CHUYEN_DOC;
  return DA_DOC;
}
function ghiDoc(){
  try{ localStorage.setItem(KHO_DOC, JSON.stringify(DA_DOC)); }catch(e){}
  if(G.danhDau) G.danhDau('chuyen', 'doc');
}
G.chDaDoc = function(ma){ return !!docLai()[ma]; };
G.chDanhDauDoc = function(ma){
  docLai();
  if(DA_DOC[ma]) return false;
  DA_DOC[ma] = Date.now(); ghiDoc();
  if(G.secLog) G.secLog('Chuyện truyền cảm hứng', 'Đã đọc ' + ma, 'Ghi nhận');
  return true;
};
G.chSoDaDoc = function(cap){
  var d = docLai();
  return kho(cap).filter(function(x){ return d[x.ma]; }).length;
};

/* ─── Chọn ổn định: cùng một hạt thì luôn ra cùng một chuyện ─── */
function bam(s){
  var n = 0;
  s = String(s);
  for(var i = 0; i < s.length; i++) n = (n * 31 + s.charCodeAt(i)) % 1000000007;
  return n;
}
function ngayHomNay(){
  var d = new Date();
  return d.getFullYear() + '-' + (d.getMonth()+1) + '-' + d.getDate();
}

/* Chuyện của hôm nay: theo ngày và theo tài khoản.
   Ưu tiên chuyện chưa đọc; đọc hết rồi thì quay vòng. */
G.chHomNay = function(cap){
  cap = cap || G.chCapCuaToi();
  var ds = kho(cap);
  if(!ds.length) return null;
  var u = (G.S && G.S.acc && G.S.acc.u) || 'khach';
  var hat = bam(ngayHomNay() + '|' + u);
  var d = docLai();
  var chua = ds.filter(function(x){ return !d[x.ma]; });
  var nguon = chua.length ? chua : ds;
  return nguon[hat % nguon.length];
};

/* Mỗi nhiệm vụ một chuyện — gắn theo mã nhiệm vụ, không đổi theo ngày. */
G.chChoNhiemVu = function(cong, i, tenViec){
  var capTheoCong = {hs:'HS', ph:'PH', ctv:'CTV', coach:'COACH', tuvan:'TUVAN', admin:'ADMIN'};
  var cap = capTheoCong[cong] || G.chCapCuaToi();
  var ds = kho(cap);
  if(!ds.length) return null;
  return ds[bam(cong + '#' + i + '#' + (tenViec || '')) % ds.length];
};

/* ═══════════════ VẼ MỘT CHUYỆN ═══════════════ */
function macCua(ma){
  return (G.CH_MACH || []).filter(function(x){ return x.ma === ma; })[0] ||
         {ma:ma, ten:ma, c:'var(--gita)', ic:'spark', y:''};
}

G.veChuyen = function(c, gon){
  if(!c) return '';
  var m = macCua(c.mach);
  var l = G.chLoi(c.loi);
  var daDoc = G.chDaDoc(c.ma);

  var o = '<div class="card" style="border-left:3px solid '+m.c+'">'+
    '<div class="row" style="gap:9px;align-items:baseline;flex-wrap:wrap">'+
      '<span class="mono tiny" style="color:'+m.c+'">'+h(c.ma)+'</span>'+
      '<b style="flex:1;min-width:180px;font-size:16px">'+h(c.ten)+'</b>'+
      '<span class="chip" style="color:'+m.c+'">'+h(m.ten)+'</span>'+
      (daDoc ? '<span class="chip" style="color:var(--ok)">✓ Đã đọc</span>' : '')+
    '</div>'+

    '<p class="sm mt2" style="line-height:1.8">'+h(c.ke)+'</p>'+

    '<div class="mt2" style="padding:12px 15px;border-radius:12px;background:'+m.c+'0E">'+
      '<span class="tiny up" style="color:'+m.c+'">CHỖ MỌI THỨ ĐỔI</span>'+
      '<p class="sm mt" style="line-height:1.8">'+h(c.xoay)+'</p></div>'+

    '<div class="mt2" style="padding:12px 15px;border-radius:12px;background:var(--phu-1)">'+
      '<span class="tiny up muted">ĐIỀU RÚT RA</span>'+
      '<p class="sm mt" style="line-height:1.75;font-weight:600">'+h(c.hoc)+'</p></div>'+

    (l ? '<p class="sm mt2" style="line-height:1.75;font-style:italic;color:var(--ink-3)">'+
        ic('quote','w-3 h-3')+' '+h(l.c)+' <span class="tiny">— '+h(l.ai)+'</span></p>' : '')+

    '<div class="mt2" style="padding:12px 15px;border-radius:12px;border:1px dashed var(--gita-vien-1)">'+
      '<span class="tiny up" style="color:var(--gita)">LÀM ĐƯỢC NGAY HÔM NAY</span>'+
      '<p class="sm mt" style="line-height:1.7">'+h(c.lam)+'</p></div>';

  if(!gon){
    o += '<div class="row mt2" style="gap:9px;flex-wrap:wrap">'+
      (daDoc ? '' : '<button class="btn pri sm" data-chdoc="'+h(c.ma)+'">'+
        ic('check','w-3 h-3')+' Đã đọc và sẽ làm</button>')+
      '<button class="btn ghost sm" data-chkhac="'+h(c.mach)+'">Chuyện khác cùng mạch</button>'+
    '</div>';
  }
  return o + '</div>';
};

/* ═══════════════ MÀN HÌNH ═══════════════ */
var machDang = '';    /* mạch đang lọc */
var capDang = '';     /* kho đang xem, chỉ Super Admin và Admin đổi được */
var moThem = 0;

G.VIEWS['chuyen-cam-hung'] = function(){
  var moDuoc = G.chKhoMoDuoc();
  if(capDang && moDuoc.indexOf(capDang) < 0) capDang = '';
  var cap = capDang || G.chCapCuaToi();
  var capObj = (G.CH_CAP || []).filter(function(x){ return x.ma === cap; })[0] || {ten:cap, c:'var(--gita)'};
  var ds = kho(cap);
  var daDoc = G.chSoDaDoc(cap);
  var homNay = G.chHomNay(cap);

  var o = U.ph({eyebrow:'MỘT TRĂM CHUYỆN CHO CẤP CỦA MÌNH · MƯỜI MẠCH', ic:'flame', grad:1,
    t:'Chuyện truyền cảm hứng',
    lead: cap === 'HS'
      ? 'Một trăm chuyện viết cho em: chuyện lớp học, chuyện bài vở, chuyện những hôm chán muốn bỏ. '+
        'Mỗi chuyện kết bằng một việc em làm được ngay hôm nay.'
      : cap === 'PH'
      ? 'Một trăm chuyện của các nhà đi trước: bữa cơm, giờ học của con, những tối rất dài. '+
        'Mỗi chuyện kết bằng một việc nhà mình làm được ngay hôm nay.'
      : 'Một trăm chuyện cho vai của anh chị. Tư tưởng lấy từ các bài huấn luyện của Jim Rohn, '+
        'biên soạn lại theo mô thức GITA. Mỗi chuyện kết bằng một việc làm được ngay.'});

  /* Lời thành thật, để trước mọi thứ */
  o += '<div class="card mt2" style="background:var(--phu-1)">'+
    '<p class="tiny" style="line-height:1.7">'+ic('bell','w-3 h-3')+' '+
    'Đây là chuyện kể để huấn luyện. Nhân vật và tình tiết được dựng ra cho đúng bài học, '+
    'không phải chép lại hồ sơ của nhà nào. Học viện không bao giờ đem chuyện nhà này kể cho nhà khác.'+
    '</p></div>';

  /* Chọn kho — chỉ Super Admin và Admin */
  if(moDuoc.length > 1){
    o += U.sec('SOÁT NỘI DUNG SÁU KHO','Vai khác chỉ mở kho của cấp mình');
    o += '<div class="row wrap" style="gap:8px">'+ (G.CH_CAP || []).map(function(x){
      var n = kho(x.ma).length;
      return '<button class="btn '+(x.ma === cap ? 'pri' : 'ghost')+' sm" data-chcap="'+h(x.ma)+'">'+
        h(x.ten)+' · '+n+'</button>';
    }).join('') +'</div>';
  }

  /* Bảng số */
  o += '<div class="row wrap mt2" style="gap:12px">'+
    [[String(ds.length), 'CHUYỆN TRONG KHO CỦA MÌNH', capObj.c || 'var(--gita)'],
     [daDoc + ' / ' + ds.length, 'ĐÃ ĐỌC', daDoc ? 'var(--ok)' : 'var(--ink-4)'],
     [String((G.CH_MACH || []).length), 'MẠCH CHUYỆN', 'var(--gita)'],
     [(ds.length ? Math.round(daDoc / ds.length * 100) : 0) + '%', 'ĐI ĐƯỢC', 'var(--gita)']]
    .map(function(x){
      return '<div class="card" style="flex:1;min-width:150px;text-align:center">'+
        '<b style="font-size:21px;color:'+x[2]+'">'+h(x[0])+'</b>'+
        '<div class="tiny up muted mt">'+h(x[1])+'</div></div>';
    }).join('')+'</div>';

  /* Chuyện hôm nay */
  if(homNay){
    o += U.sec('CHUYỆN HÔM NAY','Mỗi ngày một chuyện · chọn theo tài khoản nên cả nhà không trùng nhau');
    o += G.veChuyen(homNay);
  }

  /* Mười mạch */
  o += U.sec('MƯỜI MẠCH CHUYỆN','Bấm một mạch để đọc mười chuyện của mạch đó');
  o += '<div class="row wrap" style="gap:10px">'+ (G.CH_MACH || []).map(function(m){
    var n = ds.filter(function(x){ return x.mach === m.ma; });
    var dd = docLai();
    var d = n.filter(function(x){ return dd[x.ma]; }).length;
    var on = machDang === m.ma;
    return '<button class="card" data-chmach="'+h(m.ma)+'" style="flex:1;min-width:210px;text-align:left;'+
      'cursor:pointer;border-color:'+(on ? m.c : 'var(--line)')+';'+(on ? 'background:'+m.c+'0E' : '')+'">'+
      '<div class="row" style="gap:8px;align-items:center">'+ic(m.ic,'w-4 h-4')+
        '<b style="font-size:14.5px;color:'+m.c+'">'+h(m.ten)+'</b></div>'+
      '<p class="tiny mt" style="line-height:1.6">'+h(m.y)+'</p>'+
      '<p class="tiny mt" style="color:'+(d === n.length ? 'var(--ok)' : 'var(--ink-4)')+'">'+
        d+' / '+n.length+' đã đọc</p></button>';
  }).join('') +'</div>';

  /* Danh sách theo mạch đang chọn */
  var loc = machDang ? ds.filter(function(x){ return x.mach === machDang; }) : ds;
  var m = machDang ? macCua(machDang) : null;
  o += U.sec(m ? 'MẠCH ' + m.ma + ' · ' + m.ten.toUpperCase() : 'TOÀN BỘ KHO',
             loc.length + ' chuyện' + (machDang ? '' : ' — chọn một mạch ở trên để đọc theo chủ đề'));

  var hien = loc.slice(0, machDang ? loc.length : (10 + moThem));
  hien.forEach(function(c){ o += '<div class="mt2">' + G.veChuyen(c) + '</div>'; });

  if(!machDang && hien.length < loc.length){
    o += '<button class="btn ghost mt2" data-chthem="1">Xem thêm '+
      Math.min(10, loc.length - hien.length)+' chuyện nữa · còn '+(loc.length - hien.length)+'</button>';
  }
  if(machDang){
    o += '<button class="btn ghost mt2" data-chmach="">← Về toàn bộ kho</button>';
  }

  return o;
};

/* ═══════════════ BẤM ═══════════════ */
document.addEventListener('click', function(e){
  var t = e.target;
  if(!t || !t.closest) return;

  var d = t.closest('[data-chdoc]');
  if(d){
    var moi = G.chDanhDauDoc(d.getAttribute('data-chdoc'));
    U.toast(moi ? 'Đã ghi. Giờ tới phần làm — việc ở khung cuối chuyện.' : 'Đã ghi trước đó rồi.','ok');
    if(G.render) G.render();
    return;
  }
  var mm = t.closest('[data-chmach]');
  if(mm){
    machDang = mm.getAttribute('data-chmach') || '';
    moThem = 0;
    if(G.render) G.render();
    return;
  }
  var kh = t.closest('[data-chkhac]');
  if(kh){
    machDang = kh.getAttribute('data-chkhac');
    if(G.S) G.S.view = 'chuyen-cam-hung';
    if(G.render) G.render();
    return;
  }
  var cc = t.closest('[data-chcap]');
  if(cc){
    var c = cc.getAttribute('data-chcap');
    if(G.chKhoMoDuoc().indexOf(c) >= 0){ capDang = c; machDang = ''; moThem = 0; }
    if(G.render) G.render();
    return;
  }
  var th = t.closest('[data-chthem]');
  if(th){ moThem += 10; if(G.render) G.render(); }
});

/* ═══════════════ GẮN CHUYỆN VÀO TỪNG NHIỆM VỤ ═══════════════
   Anh Quang yêu cầu: mỗi nhiệm vụ có một câu chuyện tương ứng. Gắn bằng
   cách bọc màn Nhiệm vụ, không sửa vào thân màn cũ — để sau này ai đọc
   src/views.js vẫn thấy nguyên bản. */
(function(){
  var goc = G.VIEWS['nhiem-vu'];
  if(typeof goc !== 'function') return;
  G.VIEWS['nhiem-vu'] = function(){
    var o = goc.apply(this, arguments);
    var cong = G.myPortal ? G.myPortal() : 'ph';
    var ds = (G.TODAY && (G.TODAY[cong] || G.TODAY.ph)) || [];
    if(!ds.length) return o;

    o += U.sec('MỖI NHIỆM VỤ MỘT CHUYỆN',
      'Việc hôm nay đi kèm chuyện của nó — đọc trước khi làm thì làm khác hẳn');
    ds.forEach(function(x, i){
      var c = G.chChoNhiemVu(cong, i, x.t);
      if(!c) return;
      o += '<div class="mt2">'+
        '<div class="row" style="gap:8px;align-items:baseline;flex-wrap:wrap;margin-bottom:6px">'+
          '<span class="chip" style="color:var(--gita)">Việc '+(i+1)+'</span>'+
          '<b class="sm" style="flex:1;min-width:180px">'+h(x.t)+'</b></div>'+
        G.veChuyen(c, 1)+'</div>';
    });
    o += '<div class="card mt2" style="background:var(--phu-1)">'+
      '<p class="tiny" style="line-height:1.7">Chuyện gắn với nhiệm vụ theo mã, nên nó không đổi từ hôm nay '+
      'sang hôm khác — cùng một việc thì cùng một chuyện, để nhớ được. Muốn đọc chuyện mới mỗi ngày thì '+
      'mở <b>Chuyện truyền cảm hứng</b>.</p>'+
      '<button class="btn ghost sm mt" data-v="chuyen-cam-hung">Mở kho một trăm chuyện</button></div>';
    return o;
  };
})();

})();
