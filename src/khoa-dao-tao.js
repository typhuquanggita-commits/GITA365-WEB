/* ═══════════════════════════════════════════════════════════════
   GITA 365 · v9.1 — MÀN KHOÁ ĐÀO TẠO TỰ ĐỘNG

   Tự động ở đây nghĩa là bốn việc, không phải nghĩa là tự phát video:
     · Bài thi chỉ ra trục yếu → mở đúng bài của trục đó, không phải đi tìm
     · Nộp xong bài này thì bài kế tiếp tự mở, đúng thứ tự
     · Đủ bài của một tầng thì mở lại quyền thi lại tầng đó
     · Còn bài dở thì nhắc đúng bài ấy, không nhắc chung chung
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;

(function(){
var U = G.U, h = U.h, ic = U.ic;
G.VIEWS = G.VIEWS || {};

function kh(){
  if(!G.S) return {};
  if(!G.S.khoahoc || typeof G.S.khoahoc !== 'object') G.S.khoahoc = {};
  return G.S.khoahoc;
}
function ghi(k, v){
  if(!G.S || !G.S.acc) return;
  kh()[k] = v;
  if(G.danhDau) G.danhDau('khoahoc', k);
  if(G.save) G.save();
}
function trucObj(ma){
  return (G.SH_TRUC || []).filter(function(x){ return x.ma === ma; })[0] ||
         {ma:ma, ten:ma, c:'var(--gita)', ic:'target'};
}

/* Bài của vai đang đăng nhập, theo đúng thứ tự tầng rồi tới trục */
G.khBaiCuaToi = function(){
  var vai = G.shVaiCuaToi ? G.shVaiCuaToi() : 'COACH';
  var thu = (G.SH_TANG || []).map(function(x){ return x.ma; });
  return (G.KH_BAI || []).filter(function(x){ return (x.vai || []).indexOf(vai) >= 0; })
    .sort(function(a, b){
      var d = thu.indexOf(a.tang) - thu.indexOf(b.tang);
      return d !== 0 ? d : a.ma.localeCompare(b.ma);
    });
};
G.khLoTrinh = function(){
  var vai = G.shVaiCuaToi ? G.shVaiCuaToi() : 'COACH';
  return (G.KH_LOTRINH || []).filter(function(x){ return x.vai === vai; })[0] || null;
};

G.khTrangThai = function(ma){
  var d = kh()['bai|' + ma];
  if(!d) return 'chua';
  if(d.nop) return 'xong';
  if(d.hoc) return 'dangLam';
  return 'chua';
};
/* Bài mở khi: là bài đầu, hoặc bài liền trước đã nộp, hoặc trục của nó
   đang bị bài thi chỉ ra là yếu — trục yếu thì mở ngay, không phải xếp hàng */
G.khTrucYeu = function(){
  var ra = {};
  var s = (G.S && G.S.sathach) || {};
  Object.keys(s).forEach(function(k){
    if(k.indexOf('bai|') !== 0) return;
    (s[k].trucYeu || []).forEach(function(t){ ra[t] = 1; });
  });
  return ra;
};
G.khMoDuoc = function(ma){
  var ds = G.khBaiCuaToi();
  var i = ds.map(function(x){ return x.ma; }).indexOf(ma);
  if(i <= 0) return true;
  if(G.khTrangThai(ds[i-1].ma) === 'xong') return true;
  var b = ds[i];
  return !!G.khTrucYeu()[b.truc];
};
G.khXongMay = function(){
  return G.khBaiCuaToi().filter(function(x){ return G.khTrangThai(x.ma) === 'xong'; }).length;
};
/* Bài đang dở — dùng để nhắc đúng bài, không nhắc chung chung */
G.khBaiDangDo = function(){
  var ds = G.khBaiCuaToi();
  for(var i = 0; i < ds.length; i++){
    if(G.khTrangThai(ds[i].ma) === 'dangLam') return ds[i];
  }
  for(var j = 0; j < ds.length; j++){
    if(G.khTrangThai(ds[j].ma) === 'chua' && G.khMoDuoc(ds[j].ma)) return ds[j];
  }
  return null;
};
/* Đủ bài của một tầng thì mở lại quyền thi lại tầng đó */
G.khDuBaiTang = function(tang){
  var ds = G.khBaiCuaToi().filter(function(x){ return x.tang === tang; });
  if(!ds.length) return true;
  return ds.every(function(x){ return G.khTrangThai(x.ma) === 'xong'; });
};

/* ═══════════════ MÀN HÌNH ═══════════════ */
var moBai = '';

G.VIEWS['khoa-dao-tao'] = function(){
  var LT = G.khLoTrinh();
  var ds = G.khBaiCuaToi();
  var xong = G.khXongMay();
  var yeu = G.khTrucYeu();
  var tiep = G.khBaiDangDo();

  var o = U.ph({eyebrow:'HỌC · LÀM · NỘP — THIẾU MỘT PHẦN THÌ BÀI CHƯA XONG', ic:'book', grad:1,
    t: LT ? LT.ten : 'Khoá đào tạo của tôi',
    lead: (LT ? LT.y + ' ' : '') +
      'Mỗi bài có ba phần bắt buộc: đọc phần cốt lõi, làm một việc thật trong công việc của chính mình, '+
      'và nộp một bằng chứng người khác đọc được. Bài không có phần LÀM thì đó là thông tin, không phải đào tạo.'});

  o += '<div class="row wrap mt2" style="gap:12px">'+
    [[xong + ' / ' + ds.length, 'BÀI ĐÃ XONG', xong === ds.length ? 'var(--ok)' : 'var(--gita)'],
     [String(Object.keys(yeu).length), 'TRỤC ĐANG YẾU', Object.keys(yeu).length ? 'var(--gita-do-ink)' : 'var(--ok)'],
     [(LT ? LT.gio : '—'), 'KHỐI LƯỢNG', 'var(--gita)'],
     [(G.shCapCuaToi ? (G.shCapCuaToi() === 'C0' ? 'Chưa có' : G.shCapCuaToi()) : '—'), 'CẤP HÀNH NGHỀ', 'var(--gita)']]
    .map(function(x){
      return '<div class="card" style="flex:1;min-width:150px;text-align:center">'+
        '<b style="font-size:18px;color:'+x[2]+'">'+h(x[0])+'</b>'+
        '<div class="tiny up muted mt">'+h(x[1])+'</div></div>';
    }).join('')+'</div>';

  /* Nhắc đúng bài đang dở */
  if(tiep){
    o += '<div class="card mt2" style="border-color:var(--gita)">'+
      '<span class="tiny up muted">HỌC TIẾP Ở ĐÂY</span>'+
      '<b class="mt" style="display:block;font-size:16px">'+h(tiep.ten)+'</b>'+
      '<p class="tiny muted mt">'+h(trucObj(tiep.truc).ten)+' · tầng '+h(tiep.tang)+' · '+tiep.phut+' phút</p>'+
      '<button class="btn pri sm mt2" data-khmo="'+h(tiep.ma)+'">Mở bài này</button></div>';
  } else if(ds.length) {
    o += '<div class="card mt2" style="border-color:var(--ok)">'+
      '<b>'+ic('check','w-4 h-4')+' Đã học hết bài của lộ trình này.</b>'+
      '<p class="sm dim mt" style="line-height:1.7">Học hết không phải là xong nghề. Kỳ sát hạch định kỳ tới '+
      'vẫn phải thi, và trục nào yếu thì bài của trục đó sẽ mở lại.</p>'+
      '<button class="btn ghost sm mt2" data-v="sat-hach">Sang màn sát hạch</button></div>';
  }

  /* Trục yếu do bài thi chỉ ra */
  if(Object.keys(yeu).length){
    o += U.sec('TRỤC BÀI THI CHỈ RA CÒN YẾU','Bài của những trục này mở ngay, không phải xếp hàng theo thứ tự');
    o += '<div class="row wrap" style="gap:10px">'+ Object.keys(yeu).map(function(k){
      var T = trucObj(k);
      var n = ds.filter(function(x){ return x.truc === k; }).length;
      return '<div class="card" style="flex:1;min-width:200px;border-left:3px solid '+T.c+'">'+
        '<div class="row" style="gap:8px;align-items:center">'+ic(T.ic,'w-4 h-4')+
          '<b class="sm" style="color:'+T.c+'">'+h(T.ten)+'</b></div>'+
        '<p class="tiny mt">'+n+' bài của trục này đã mở</p></div>';
    }).join('') +'</div>';
  }

  /* Danh sách bài theo tầng */
  (G.SH_TANG || []).forEach(function(t){
    var b = ds.filter(function(x){ return x.tang === t.ma; });
    if(!b.length) return;
    var duBai = G.khDuBaiTang(t.ma);
    o += U.sec('TẦNG ' + t.ma + ' · ' + t.ten.toUpperCase(),
      b.length + ' bài' + (duBai ? ' · đã đủ bài, mở lại quyền thi lại tầng này' : ''));

    b.forEach(function(x){
      var tt = G.khTrangThai(x.ma);
      var mo = G.khMoDuoc(x.ma);
      var T = trucObj(x.truc);
      var d = kh()['bai|' + x.ma] || {};
      var mang = (moBai === x.ma);

      o += '<div class="card mt2" style="border-left:3px solid '+
        (tt === 'xong' ? 'var(--ok)' : (mo ? T.c : 'var(--line)'))+'">'+
        '<div class="row" style="gap:9px;align-items:baseline;flex-wrap:wrap">'+
          '<span class="mono tiny" style="color:'+T.c+'">'+h(x.ma)+'</span>'+
          '<b style="flex:1;min-width:200px">'+h(x.ten)+'</b>'+
          '<span class="chip" style="color:'+T.c+'">'+h(T.ten)+'</span>'+
          '<span class="chip">'+x.phut+' phút</span>'+
          (tt === 'xong' ? '<span class="chip" style="color:var(--ok)">✓ Đã nộp</span>'
           : tt === 'dangLam' ? '<span class="chip" style="color:var(--gita)">Đang dở</span>' : '')+
        '</div>';

      if(!mo){
        o += '<p class="tiny mt muted">'+ic('lock','w-3 h-3')+' Mở sau khi nộp bài liền trước — '+
          'hoặc mở ngay nếu bài thi chỉ ra trục này còn yếu.</p></div>';
        return;
      }

      if(!mang){
        o += '<button class="btn '+(tt === 'xong' ? 'ghost' : 'pri')+' sm mt2" data-khmo="'+h(x.ma)+'">'+
          (tt === 'xong' ? 'Xem lại bài' : (tt === 'dangLam' ? 'Học tiếp' : 'Mở bài'))+'</button></div>';
        return;
      }

      /* Ba phần */
      o += '<div class="mt2" style="padding:13px 15px;border-radius:12px;background:var(--phu-1)">'+
        '<span class="tiny up muted">1 · HỌC</span>'+
        '<div class="sm mt" style="line-height:1.8">'+U.nl(x.hoc)+'</div></div>';

      o += '<div class="mt2" style="padding:13px 15px;border-radius:12px;border-left:3px solid '+T.c+';background:'+T.c+'0E">'+
        '<span class="tiny up" style="color:'+T.c+'">2 · LÀM — việc thật trong công việc của chính mình</span>'+
        '<p class="sm mt" style="line-height:1.75">'+h(x.lam)+'</p></div>';

      o += '<div class="mt2">'+
        '<label class="tiny up muted" for="kh_'+h(x.ma)+'">3 · NỘP — '+h(x.nop)+'</label>'+
        '<textarea id="kh_'+h(x.ma)+'" class="inp mt" data-khnop="'+h(x.ma)+'" rows="5" '+
          (tt === 'xong' ? 'readonly ' : '')+'placeholder="Bằng chứng phải là việc thật. Bài tập tình huống '+
          'giả định không được nhận." style="width:100%;line-height:1.7;resize:vertical">'+h(d.bang || '')+'</textarea>'+
        '<div class="row mt" style="gap:9px;flex-wrap:wrap;align-items:center">'+
          (tt === 'xong'
            ? '<span class="chip" style="color:var(--ok)">Đã nộp '+h(d.luc || '')+'</span>'
            : '<button class="btn ghost sm" data-khluu="'+h(x.ma)+'">Lưu nháp</button>'+
              '<button class="btn pri sm" data-khxong="'+h(x.ma)+'">Nộp và hoàn thành bài</button>')+
          '<button class="btn ghost sm" data-khmo="">Đóng bài</button>'+
        '</div></div></div>';
    });
  });

  /* Luật */
  o += U.sec('LUẬT HỌC','Sáu điều — đọc trước thì không ai mắc oan');
  o += '<div class="card">'+ (G.KH_LUAT || []).map(function(x, i){
    return '<div style="'+(i ? 'border-top:1px solid var(--line);padding-top:12px;margin-top:12px' : '')+'">'+
      '<b class="sm">'+(i+1)+'. '+h(x.t)+'</b>'+
      '<p class="tiny mt" style="line-height:1.7">'+h(x.y)+'</p></div>';
  }).join('') +'</div>';

  o += '<div class="card mt2" style="background:var(--phu-1)">'+
    '<p class="sm" style="line-height:1.75">Bốn lộ trình: Cộng tác viên, Tư vấn, Coach, Giáo viên. '+
    'Màn này hiện lộ trình của vai đang đăng nhập. Một người giữ hai vai thì đăng nhập vai nào học lộ trình vai đó.</p>'+
    '<button class="btn ghost sm mt" data-v="sat-hach">Sang màn sát hạch</button></div>';

  return o;
};

/* ═══════════════ BẤM ═══════════════ */
document.addEventListener('click', function(e){
  var t = e.target;
  if(!t || !t.closest) return;

  var m = t.closest('[data-khmo]');
  if(m){
    var ma = m.getAttribute('data-khmo');
    moBai = (moBai === ma) ? '' : ma;
    if(moBai){
      var cu = kh()['bai|' + moBai] || {};
      if(!cu.hoc) ghi('bai|' + moBai, {hoc:1, bang: cu.bang || '', nop:0});
    }
    if(G.render) G.render();
    return;
  }

  var l = t.closest('[data-khluu]');
  if(l){
    var m2 = l.getAttribute('data-khluu');
    var el = document.getElementById('kh_' + m2);
    var cu2 = kh()['bai|' + m2] || {};
    ghi('bai|' + m2, {hoc:1, bang: el ? el.value : (cu2.bang || ''), nop:0});
    U.toast('Đã lưu nháp. Bài chỉ tính là xong khi đã nộp bằng chứng.','ok');
    if(G.render) G.render();
    return;
  }

  var x = t.closest('[data-khxong]');
  if(x){
    var m3 = x.getAttribute('data-khxong');
    var el3 = document.getElementById('kh_' + m3);
    var v = el3 ? String(el3.value || '').trim() : '';
    if(v.length < 30){
      U.toast('Bằng chứng còn quá ngắn. Phải là việc thật, người khác đọc được — không nhận tình huống giả định.','err');
      return;
    }
    ghi('bai|' + m3, {hoc:1, bang:v, nop:1, luc: new Date().toLocaleDateString('vi-VN')});
    if(G.secLog) G.secLog('Khoá đào tạo', 'Nộp bài ' + m3, 'Ghi nhận');
    moBai = '';
    U.toast('Đã nộp. Bài kế tiếp vừa mở ra.','ok');
    if(G.render) G.render();
  }
});

})();
