/* ═══════════════════════════════════════════════════════════════
   GITA 365 · v9.2 — MÀN CHUYỆN NGƯỜI THẬT

   Kho này khác kho sáu trăm chuyện kia ở một điểm quan trọng, và màn hình
   phải nói rõ điểm ấy ngay từ đầu: đây là NGƯỜI CÓ THẬT. Nên mỗi chuyện
   chỉ ghi phần được ghi chép rộng rãi, con số nào do chính nhân vật kể
   thì nói rõ là họ kể, và chỗ nào bản kể phổ biến đã bị thổi lên thì có
   một dòng nói thẳng.

   Dòng nói thẳng ấy không phải để bắt bẻ. Truyện truyền cảm hứng mà sai
   sự thật thì lần sau người đọc không tin cả những phần đúng — và phần
   đúng mới là phần có ích.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;

(function(){
var U = G.U, h = U.h, ic = U.ic;
G.VIEWS = G.VIEWS || {};

var KHO_DOC = 'gita365_tg_da_doc';
var DA_DOC = {};
try{ DA_DOC = JSON.parse(localStorage.getItem(KHO_DOC) || '{}') || {}; }catch(e){ DA_DOC = {}; }
G.TG_DOC = DA_DOC;
function docLai(){
  if(G.TG_DOC && G.TG_DOC !== DA_DOC) DA_DOC = G.TG_DOC;
  return DA_DOC;
}
function ghiDoc(){
  try{ localStorage.setItem(KHO_DOC, JSON.stringify(DA_DOC)); }catch(e){}
  if(G.danhDau) G.danhDau('tgdoc', 'doc');
}
G.tgDaDoc = function(ma){ return !!docLai()[ma]; };
G.tgDanhDauDoc = function(ma){
  docLai();
  if(DA_DOC[ma]) return false;
  DA_DOC[ma] = Date.now(); ghiDoc();
  return true;
};

function linhObj(ma){
  return (G.TG_LINH || []).filter(function(x){ return x.ma === ma; })[0] ||
         {ma:ma, ten:ma, c:'var(--gita)', ic:'star'};
}
function machObj(ma){
  return (G.CH_MACH || []).filter(function(x){ return x.ma === ma; })[0] ||
         {ma:ma, ten:ma, c:'var(--gita)'};
}

/* Chọn ổn định theo ngày và tài khoản — cùng cách với kho chuyện kia */
function bam(s){
  var n = 0; s = String(s);
  for(var i = 0; i < s.length; i++) n = (n * 31 + s.charCodeAt(i)) % 1000000007;
  return n;
}
G.tgHomNay = function(){
  var ds = G.CHUYEN_TG || [];
  if(!ds.length) return null;
  var u = (G.S && G.S.acc && G.S.acc.u) || 'khach';
  var d = new Date();
  var hat = bam(d.getFullYear() + '-' + d.getMonth() + '-' + d.getDate() + '|tg|' + u);
  var dd = docLai();
  var chua = ds.filter(function(x){ return !dd[x.ma]; });
  var nguon = chua.length ? chua : ds;
  return nguon[hat % nguon.length];
};

/* ─── Vẽ một chuyện ─── */
G.veChuyenTG = function(c, gon){
  if(!c) return '';
  var L = linhObj(c.linh), M = machObj(c.mach);
  var daDoc = G.tgDaDoc(c.ma);

  var o = '<div class="card" style="border-left:3px solid '+L.c+'">'+
    '<div class="row" style="gap:9px;align-items:baseline;flex-wrap:wrap">'+
      '<span class="mono tiny" style="color:'+L.c+'">'+h(c.ma)+'</span>'+
      '<b style="flex:1;min-width:190px;font-size:16px">'+h(c.ten)+'</b>'+
      '<span class="chip">'+h(c.nuoc)+' · '+h(c.nam)+'</span>'+
      '<span class="chip" style="color:'+L.c+'">'+h(L.ten)+'</span>'+
      '<span class="chip" style="color:'+M.c+'">'+h(M.ten)+'</span>'+
      (daDoc ? '<span class="chip" style="color:var(--ok)">✓ Đã đọc</span>' : '')+
    '</div>'+

    '<p class="sm mt2" style="line-height:1.75"><b>Đã làm được gì:</b> '+h(c.viec)+'</p>'+

    '<div class="mt2" style="padding:12px 15px;border-radius:12px;background:var(--phu-1)">'+
      '<span class="tiny up muted">CHỖ KHÓ</span>'+
      '<p class="sm mt" style="line-height:1.8">'+h(c.kho)+'</p></div>'+

    '<div class="mt2" style="padding:12px 15px;border-radius:12px;background:'+L.c+'0E">'+
      '<span class="tiny up" style="color:'+L.c+'">ĐÃ LÀM GÌ</span>'+
      '<p class="sm mt" style="line-height:1.8">'+h(c.lam)+'</p></div>'+

    '<div class="mt2" style="padding:12px 15px;border-radius:12px;border:1px solid var(--line)">'+
      '<span class="tiny up muted">ĐIỀU RÚT RA</span>'+
      '<p class="sm mt" style="line-height:1.75;font-weight:600">'+h(c.hoc)+'</p></div>'+

    '<div class="mt2" style="padding:12px 15px;border-radius:12px;border:1px dashed var(--gita-vien-1)">'+
      '<span class="tiny up" style="color:var(--gita)">LÀM ĐƯỢC NGAY HÔM NAY</span>'+
      '<p class="sm mt" style="line-height:1.7">'+h(c.vd)+'</p></div>'+

    (c.luu
      ? '<div class="mt2" style="padding:11px 14px;border-radius:11px;background:#B4720F14;border:1px solid #B4720F44">'+
        '<span class="tiny up" style="color:#B4720F">'+ic('bell','w-3 h-3')+' NÓI CHO ĐÚNG</span>'+
        '<p class="tiny mt" style="line-height:1.7">'+h(c.luu)+'</p></div>'
      : '');

  if(!gon && !daDoc){
    o += '<button class="btn pri sm mt2" data-tgdoc="'+h(c.ma)+'">'+
      ic('check','w-3 h-3')+' Đã đọc và sẽ làm</button>';
  }
  return o + '</div>';
};

/* ═══════════════ MÀN HÌNH ═══════════════ */
var locLinh = '';
var locMach = '';
var them = 0;

G.VIEWS['chuyen-the-gioi'] = function(){
  var ds = G.CHUYEN_TG || [];
  var dd = docLai();
  var daDoc = ds.filter(function(x){ return dd[x.ma]; }).length;
  var homNay = G.tgHomNay();

  var o = U.ph({eyebrow:'NGƯỜI CÓ THẬT · VIỆC CÓ THẬT · GHI CHÉP CÔNG KHAI', ic:'crown', grad:1,
    t:'Chuyện người thật',
    lead:'Doanh nhân, nhà khoa học, nghệ sĩ, vận động viên và người Việt Nam — những người đã đi qua chỗ khó '+
      'mà ai trong chúng ta cũng đang đứng ở một dạng nào đó. Mỗi chuyện kết bằng một việc làm được ngay hôm nay.'});

  /* Nói rõ kho này khác kho kia ở đâu — đặt trước mọi thứ */
  o += '<div class="card mt2" style="border-color:var(--gita-vien-1)">'+
    '<b>'+ic('shield','w-4 h-4')+' Kho này khác sáu trăm chuyện kia thế nào</b>'+
    '<p class="sm mt" style="line-height:1.75">Sáu trăm chuyện trong kho <b>Chuyện truyền cảm hứng</b> là chuyện '+
    'dựng ra để dạy — nhân vật không có thật, tình tiết đặt cho đúng bài học. Kho này ngược lại: người có thật, '+
    'việc có thật, đều là ghi chép công khai.</p>'+
    '<p class="sm mt" style="line-height:1.75">Vì thế Học viện chỉ ghi phần được ghi chép rộng rãi, không dựng lời '+
    'thoại và không kể đời tư. Con số nào do chính nhân vật kể thì nói rõ là họ kể. Và chỗ nào bản kể phổ biến '+
    'đã bị thổi lên thì có một dòng <b style="color:#B4720F">NÓI CHO ĐÚNG</b> — vì truyện truyền cảm hứng mà sai '+
    'sự thật thì lần sau người đọc không tin cả những phần đúng.</p></div>';

  o += '<div class="row wrap mt2" style="gap:12px">'+
    [[String(ds.length), 'NGƯỜI TRONG KHO', 'var(--gita)'],
     [daDoc + ' / ' + ds.length, 'ĐÃ ĐỌC', daDoc ? 'var(--ok)' : 'var(--ink-4)'],
     [String((G.TG_LINH || []).length), 'LĨNH VỰC', 'var(--gita)'],
     [String(ds.filter(function(x){ return x.luu; }).length), 'CHUYỆN CÓ GHI CHÚ THẬN TRỌNG', '#B4720F']]
    .map(function(x){
      return '<div class="card" style="flex:1;min-width:150px;text-align:center">'+
        '<b style="font-size:21px;color:'+x[2]+'">'+h(x[0])+'</b>'+
        '<div class="tiny up muted mt" style="line-height:1.45">'+h(x[1])+'</div></div>';
    }).join('')+'</div>';

  if(homNay){
    o += U.sec('NGƯỜI CỦA HÔM NAY','Mỗi ngày một người · chọn theo tài khoản nên cả nhà không trùng nhau');
    o += G.veChuyenTG(homNay);
  }

  /* Lọc theo lĩnh vực */
  o += U.sec('SÁU LĨNH VỰC','Bài học không chỉ nằm trong kinh doanh');
  o += '<div class="row wrap" style="gap:9px">'+
    '<button class="btn '+(locLinh ? 'ghost' : 'pri')+' sm" data-tglinh="">Tất cả · '+ds.length+'</button>'+
    (G.TG_LINH || []).map(function(L){
      var n = ds.filter(function(x){ return x.linh === L.ma; }).length;
      return '<button class="btn '+(locLinh === L.ma ? 'pri' : 'ghost')+' sm" data-tglinh="'+h(L.ma)+'">'+
        h(L.ten)+' · '+n+'</button>';
    }).join('') +'</div>';

  /* Lọc theo mạch — dùng chung mười mạch của kho chuyện kia */
  o += '<div class="row wrap mt2" style="gap:8px">'+
    '<button class="btn '+(locMach ? 'ghost' : 'pri')+' sm" data-tgmach="">Mọi mạch</button>'+
    (G.CH_MACH || []).map(function(M){
      var n = ds.filter(function(x){ return x.mach === M.ma; }).length;
      if(!n) return '';
      return '<button class="btn '+(locMach === M.ma ? 'pri' : 'ghost')+' sm" data-tgmach="'+h(M.ma)+'" '+
        'style="'+(locMach === M.ma ? '' : 'color:'+M.c)+'">'+h(M.ten)+' · '+n+'</button>';
    }).join('') +'</div>';

  var loc = ds.filter(function(x){
    return (!locLinh || x.linh === locLinh) && (!locMach || x.mach === locMach);
  });
  o += U.sec(locLinh || locMach ? 'ĐANG LỌC' : 'TOÀN BỘ KHO',
    loc.length + ' người' + (loc.length ? '' : ' — thử bỏ bớt một bộ lọc'));

  if(!loc.length){
    o += U.empty('Không có ai khớp cả hai bộ lọc',
      'Bỏ bớt một trong hai bộ lọc ở trên là thấy ngay. Không phải lỗi — chỉ là kho chưa có người vừa thuộc '+
      'lĩnh vực ấy vừa thuộc mạch ấy.', 1);
  } else {
    var hien = loc.slice(0, 8 + them);
    hien.forEach(function(c){ o += '<div class="mt2">' + G.veChuyenTG(c) + '</div>'; });
    if(hien.length < loc.length){
      o += '<button class="btn ghost mt2" data-tgthem="1">Xem thêm '+
        Math.min(8, loc.length - hien.length)+' người nữa · còn '+(loc.length - hien.length)+'</button>';
    }
  }

  o += '<div class="card mt2" style="background:var(--phu-1)">'+
    '<p class="sm" style="line-height:1.75">Kho này bổ sung cho kho <b>Chuyện truyền cảm hứng</b>, không thay thế. '+
    'Chuyện dựng ra dạy được điều mình muốn dạy, đúng từng vai. Chuyện người thật thì dạy được một điều khác: '+
    'việc này đã có người làm được rồi.</p>'+
    '<button class="btn ghost sm mt" data-v="chuyen-cam-hung">Sang kho 600 chuyện theo vai</button></div>';

  return o;
};

/* ═══════════════ BẤM ═══════════════ */
document.addEventListener('click', function(e){
  var t = e.target;
  if(!t || !t.closest) return;

  var d = t.closest('[data-tgdoc]');
  if(d){
    G.tgDanhDauDoc(d.getAttribute('data-tgdoc'));
    U.toast('Đã ghi. Việc làm ngay nằm ở khung cuối chuyện.','ok');
    if(G.render) G.render();
    return;
  }
  var l = t.closest('[data-tglinh]');
  if(l){ locLinh = l.getAttribute('data-tglinh') || ''; them = 0; if(G.render) G.render(); return; }
  var m = t.closest('[data-tgmach]');
  if(m){ locMach = m.getAttribute('data-tgmach') || ''; them = 0; if(G.render) G.render(); return; }
  if(t.closest('[data-tgthem]')){ them += 8; if(G.render) G.render(); }
});

})();
