/* ═══════════════════════════════════════════════════════════════
   GITA 365 · v7.2 — BỘ TEST NHẬN DIỆN 5 TẦNG · KPI 10 ĐIỂM VỀ ĐÍCH
   25 bộ · 750 câu · mỗi câu 4 lựa chọn quy ước điểm cho 4 nhóm
   khách hàng. Chấm xong là ra nhóm, ra cảnh báo, ra lộ trình và
   ra đúng bộ tài liệu cần gửi.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;
G.VIEWS = G.VIEWS || {};
(function(){
var U = G.U, h = U.h, ic = U.ic;

/* ─────────── Tiện ích chấm bài ─────────── */
function boTest(ma){ return (G.TEST750||[]).filter(function(b){return b.ma===ma;})[0]; }

/* Điểm miền = trung bình mức đã chọn của các câu thuộc miền, quy về thang 100
   theo (trung bình − 1) ÷ 3 × 100. Điểm bài = trung bình điểm các miền. */
G.chamTest = function(b, dap){
  var mien = {}, tong = 0, dem = 0;
  b.mien.forEach(function(m){
    var cs = b.cau.filter(function(c){ return c.mien===m && dap[c.id]; });
    if(!cs.length){ mien[m] = null; return; }
    var tb = cs.reduce(function(a,c){ return a + U.num(dap[c.id]); },0) / cs.length;
    var d = Math.round((tb - 1) / 3 * 100);
    mien[m] = U.clamp(d,0,100); tong += mien[m]; dem++;
  });
  var diem = dem ? Math.round(tong/dem) : 0;
  var nhom = b.nhom.filter(function(n){ return diem >= n.min && diem <= n.max; })[0] || b.nhom[0];
  return { mien:mien, diem:diem, nhom:nhom, canhBao: canhBao(b, mien) };
};

/* Cảnh báo viết dưới dạng domain('tên miền') < 33 [AND domain('...') >= 58].
   Chỉ đọc đúng dạng đó, không eval bất cứ thứ gì. */
function canhBao(b, mien){
  var ra = [];
  (b.canhBao||[]).forEach(function(cb){
    var ve = String(cb['if']||'').split(/\s+(?:AND|and)\s+/);
    var dung = ve.length > 0;
    ve.forEach(function(v){
      var m = v.match(/domain\('([^']+)'\)\s*(<|>=|<=|>)\s*(\d+)/);
      if(!m){ dung = false; return; }
      var d = mien[m[1]];
      if(d === null || d === undefined){ dung = false; return; }
      var n = U.num(m[3]), op = m[2];
      var ok = op==='<' ? d<n : op==='<=' ? d<=n : op==='>' ? d>n : d>=n;
      if(!ok) dung = false;
    });
    if(dung) ra.push(cb);
  });
  return ra;
}

/* Miền yếu nhất trước — đó là nơi cần chạm đầu tiên. */
function mienYeu(kq){
  return Object.keys(kq.mien)
    .filter(function(m){ return kq.mien[m] !== null && kq.mien[m] < 58; })
    .sort(function(a,b){ return kq.mien[a] - kq.mien[b]; });
}

/* Gợi ý tài liệu: chọn theo độ trùng từ khoá giữa tên miền yếu và tên tài liệu.
   Không đoán bừa — không trùng từ nào thì không gợi ý. */
var BO_TU = ['và','của','trong','khi','cho','với','các','những','một','có','là','ra','về',
  'mức','độ','khả','năng','cách','sự','thì','đã','được','theo','từ','đến','sau','trước','hơn'];
function tu(s){
  return String(s||'').toLowerCase().replace(/[^a-zà-ỹ\s]/gi,' ').split(/\s+/)
    .filter(function(t){ return t.length>2 && BO_TU.indexOf(t)<0; });
}
function hop(a, b){
  var A = tu(a), B = tu(b), n = 0;
  A.forEach(function(t){ if(B.indexOf(t)>=0) n++; });
  return n;
}
function goiTaiLieu(b, yeu){
  var kho = (G.QUA1000||[]).filter(function(q){ return q.tang===b.tang; });
  if(!kho.length || !yeu.length) return [];
  var ds = kho.map(function(q){
    var d = 0;
    yeu.forEach(function(m,i){ d += hop(m, q.ten+' '+q.nhom+' '+q.nv) * (yeu.length-i); });
    return { q:q, d:d };
  }).filter(function(x){ return x.d > 0; });
  ds.sort(function(x,y){ return y.d - x.d; });
  return G.dsHet(ds,8).map(function(x){ return x.q; });
}
function goiPhacDo(yeu){
  var kho = G.PHACDO || [];
  if(!kho.length || !yeu.length) return [];
  var ds = kho.map(function(p){
    var d = 0;
    yeu.forEach(function(m,i){ d += hop(m, p.ten+' '+(p.nhomTen||'')) * (yeu.length-i); });
    return { p:p, d:d };
  }).filter(function(x){ return x.d > 0; });
  ds.sort(function(x,y){ return y.d - x.d; });
  return G.dsHet(ds,5).map(function(x){ return x.p; });
}

function tierColor(t){
  var x = (G.TIERS||[]).filter(function(y){return y.code===t;})[0];
  /* Cột màu trong G.TIERS tên là c, không phải color. Đọc sai tên thì
     hàm trả undefined và mọi màu tầng biến mất — nhánh dự phòng bên
     dưới không bao giờ chạy vì x vẫn tồn tại. */
  return x ? x.c : 'var(--gita)';
}

/* ═══════════════════ BỘ TEST NHẬN DIỆN ═══════════════════ */
G.VIEWS['bo-test'] = function(){
  var T = G.TEST750 || [];
  if(!T.length) return U.empty('Chưa mở được bộ test',
    'Bộ test nằm trong gói nội dung theo tầng. Đăng nhập bằng tài khoản đã được cấp phép tầng để làm bài.');
  var dang = G.S.testDang && boTest(G.S.testDang);
  if(dang){
    var kq = G.S.test[dang.ma];
    return (kq && kq.xong) ? manKetQua(dang, kq) : manLamBai(dang);
  }
  return manThuVien(T);
};

/* ─────────── Thư viện 25 bộ ─────────── */
function manThuVien(T){
  var tangs = [];
  T.forEach(function(b){ if(tangs.indexOf(b.tang)<0) tangs.push(b.tang); });
  tangs.sort();
  var soCau = T.reduce(function(a,b){ return a + b.cau.length; },0);
  var xong = Object.keys(G.S.test||{}).filter(function(k){ return G.S.test[k] && G.S.test[k].xong; }).length;
  /* Bản xem thử mở cả năm bài của tầng một nhưng mỗi bài rút còn sáu
     câu. Nói thẳng con số ấy ngay đầu màn: người xem thử phải biết mình
     đang cầm bản rút, và người đã đăng nhập phải biết mình cầm bản đủ. */
  var rut = T.filter(function(b){ return b.mau && b.soCauThat > b.cau.length; });
  var soCauThat = T.reduce(function(a,b){ return a + (b.soCauThat || b.cau.length); },0);

  var o = U.ph({eyebrow:'NHÓM 02 · NHẬN DIỆN', ic:'target', grad:1, t:'Bộ test nhận diện năm tầng',
    lead:'Năm nhóm bài cho mỗi tầng. Mỗi câu có bốn lựa chọn, mỗi lựa chọn ứng với một mức và một nhóm khách hàng. '+
    'Bài này không xếp loại ai — nó chỉ nói cho cả nhà biết mình đang đứng ở đâu, để gửi đúng lộ trình và đúng tài liệu.'});

  if(rut.length)
    o += '<div class="card mb" style="border-color:var(--alert);background:rgba(251,146,60,.06)">'+
      '<div class="row" style="gap:10px;align-items:flex-start">'+
      '<span style="color:var(--alert);flex:none">'+ic('shield','w-4 h-4')+'</span>'+
      '<div style="flex:1"><b class="sm">Bản xem thử — '+rut.length+' bài, mỗi bài rút còn '+
      rut[0].cau.length+' trong '+rut[0].soCauThat+' câu</b>'+
      '<p class="tiny mt" style="line-height:1.7;color:var(--ink-2)">'+
      'Sáu câu này trải đủ '+rut[0].mien.length+' miền đo nên chấm thử vẫn ra nhóm và ra cảnh báo, '+
      'nhưng điểm đo trên sáu câu KHÔNG dùng để kết luận về một gia đình thật. '+
      'Đăng nhập bằng tài khoản đã được cấp phép tầng là mở đủ '+soCauThat+' câu của '+T.length+' bài, '+
      'và kết quả mới được ghi vào hồ sơ nhà mình.</p></div></div></div>';

  o += '<div class="grid g4 mb">'+
    U.stat({k:'Bộ bài',   v:String(T.length),   d:'năm nhóm mỗi tầng', c:'#185AB4'})+
    U.stat({k:'Câu hỏi',  v:String(soCau),      d:rut.length ? 'bản rút · đủ là '+soCauThat+' câu' : 'mỗi câu bốn lựa chọn', c:'#5140B4'})+
    U.stat({k:'Lựa chọn', v:String(soCau*4),    d:'đã quy ước mức điểm', c:'#0B6675'})+
    U.stat({k:'Đã làm',   v:String(xong),       d:'bài trong máy này', c:'#0B7350'})+
    '</div>';

  /* Quy ước bốn nhóm — lấy đúng từ bộ dữ liệu, không viết lại. */
  var mau = T[0];
  o += U.sec('BỐN NHÓM KHÁCH HÀNG', 'Mỗi lựa chọn là một mức từ 1 đến 4. Điểm bài quy về thang 100 rồi rơi vào một trong bốn nhóm.');
  o += '<div class="grid g4">' + mau.nhom.map(function(n){
    return '<div class="card pad-sm" style="border-color:'+n.color+'33">'+
      '<div class="row mb" style="gap:8px">'+U.dot(n.color)+'<b class="sm" style="color:'+n.color+'">'+h(n.label)+'</b></div>'+
      '<div class="tiny muted mb">'+n.min+'–'+n.max+' điểm · mức '+n.level+'</div>'+
      '<p class="tiny dim" style="line-height:1.6">'+h(n.meaning)+'</p></div>';
  }).join('') + '</div>';

  o += '<div class="card mt2" style="border-color:var(--gita-vien-1)">'+
    '<div class="row mb"><span style="color:var(--gold-ink)">'+ic('shield','w-4 h-4')+'</span><b>Ranh giới của bộ test</b></div>'+
    '<p class="sm dim" style="line-height:1.75">'+h(mau.gioiHan)+'</p></div>';

  o += U.sec('CHỌN BÀI', 'Bấm vào một bài để làm. Kết quả lưu trong máy này và gửi được cho người đồng hành.');
  o += '<div class="row wrap mb" style="gap:8px">'+
    '<button class="btn ghost sm on" data-tf="ALL">Tất cả</button>'+
    tangs.map(function(t){
      return '<button class="btn ghost sm" data-tf="'+h(t)+'" style="border-color:'+tierColor(t)+'55;color:'+tierColor(t)+'">'+h(t)+'</button>';
    }).join('') + '</div>';

  o += '<div class="grid g2" id="tsList">' + T.map(function(b){
    var c = tierColor(b.tang), r = G.S.test[b.ma];
    return '<button class="card lift" data-test="'+h(b.ma)+'" data-f="'+h(b.tang)+'" style="text-align:left;border-color:'+c+'22">'+
      '<div class="row wrap" style="gap:7px;margin-bottom:8px">'+U.chip(b.tang,c)+U.chip('Bài '+b.bo)+
      '<span class="tiny muted">'+b.cau.length+(b.mau && b.soCauThat > b.cau.length ? '/'+b.soCauThat : '')+
        ' câu · '+b.phut+' phút · '+h(b.ai)+'</span>'+
      (b.mau && b.soCauThat > b.cau.length ? U.chip('bản rút','#FB923C') : '')+
      (r && r.xong ? '<span class="chip" style="color:'+r.nhom.color+';border-color:'+r.nhom.color+'40;background:'+r.nhom.color+'1a">'+h(r.nhom.code)+' · '+r.diem+'</span>' : '')+
      '</div>'+
      '<b class="sm" style="display:block;line-height:1.4;margin-bottom:6px;color:'+c+'">'+h(b.ten)+'</b>'+
      '<p class="tiny muted" style="line-height:1.6">'+h(b.muc)+'</p>'+
      '<div class="tiny mt" style="color:var(--ink-4)">'+ic('map','w-3 h-3')+' '+b.mien.length+' miền · '+h(b.tuoi)+'</div></button>';
  }).join('') + '</div>';

  o += '<p class="tiny muted center mt2">Mỗi bản in ra đều mang mật mã kín theo người nhận · '+
    h(G.META && G.META.name || 'GITA 365')+'</p>';
  return o;
}

/* ─────────── Làm bài ─────────── */
function manLamBai(b){
  var c = tierColor(b.tang);
  var st = G.S.test[b.ma] || (G.S.test[b.ma] = { dap:{}, xong:false });
  var da = Object.keys(st.dap).length, tong = b.cau.length;

  var o = '<div class="row wrap mb" style="gap:8px">'+
    '<button class="btn ghost sm" data-tthoat="1">'+ic('arrow')+'Quay lại danh sách bài</button>'+
    U.chip(b.tang,c)+U.chip('Bài '+b.bo)+'</div>';

  o += U.ph({eyebrow:'ĐANG LÀM BÀI', ic:'target', t:b.tieuDe, lead:b.muc});

  o += '<div class="card" style="border-color:'+c+'33">'+
    '<div class="row" style="justify-content:space-between;margin-bottom:8px">'+
    '<b class="sm">Đã trả lời '+da+' / '+tong+' câu</b>'+
    '<span class="tiny muted">'+b.phut+' phút · trả lời theo bảy ngày gần nhất</span></div>'+
    U.bar(Math.round(da/tong*100), c)+'</div>';

  o += '<div class="card mt" style="border-color:var(--gita-mo-3)">'+
    '<p class="sm dim" style="line-height:1.75">Chọn câu <b>đúng với thực tế</b>, không chọn câu nghe hay hơn. '+
    'Bài này không chấm điểm người — nó chỉ định vị điểm xuất phát. Chọn sai thì lộ trình gửi về cũng sai.</p></div>';

  b.mien.forEach(function(m, mi){
    var cs = b.cau.filter(function(x){ return x.mien===m; });
    o += U.sec('MIỀN '+(mi+1)+' · '+m, cs.length+' câu');
    o += cs.map(function(q){
      var chon = st.dap[q.id];
      return '<div class="card mb" style="border-color:'+(chon?c+'44':'var(--line)')+'">'+
        '<p class="sm" style="line-height:1.7;margin-bottom:11px"><b>'+h(q.hoi)+'</b></p>'+
        '<div style="display:flex;flex-direction:column;gap:7px">'+
        q.chon.map(function(x){
          var on = chon === x.muc;
          return '<button class="card pad-sm lift" data-tq="'+h(b.ma)+'|'+h(q.id)+'|'+x.muc+'" '+
            'style="text-align:left;border-color:'+(on?c:'var(--line)')+';background:'+(on?c+'14':'transparent')+'">'+
            '<div class="row" style="gap:9px;align-items:flex-start">'+
            '<span class="chip" style="flex:none;color:'+(on?c:'var(--ink-4)')+';border-color:'+(on?c+'55':'var(--line)')+'">'+x.muc+'</span>'+
            '<span class="tiny" style="line-height:1.6;color:var(--ink-2)">'+h(x.t)+'</span></div></button>';
        }).join('')+'</div></div>';
    }).join('');
  });

  o += '<div class="card mt2 center" style="border-color:'+c+'44">'+
    (da<tong ? '<p class="sm muted mb">Còn '+(tong-da)+' câu chưa trả lời. Trả lời đủ mới ra được nhóm đúng.</p>' : '')+
    '<button class="btn pri'+(da<tong?' off':'')+'" data-txong="'+h(b.ma)+'">'+ic('check')+'Xem kết quả và lộ trình</button>'+
    '<button class="btn ghost sm mt" data-txoa="'+h(b.ma)+'">Xoá hết câu trả lời của bài này</button></div>';
  return o;
}

/* ─────────── Kết quả ─────────── */
function manKetQua(b, kq){
  var c = tierColor(b.tang), n = kq.nhom;
  var yeu = mienYeu(kq);
  var tl  = goiTaiLieu(b, yeu);
  var pd  = goiPhacDo(yeu);

  var o = '<div class="row wrap mb" style="gap:8px">'+
    '<button class="btn ghost sm" data-tthoat="1">'+ic('arrow')+'Quay lại danh sách bài</button>'+
    U.chip(b.tang,c)+U.chip('Bài '+b.bo)+
    '<span class="tiny muted">Làm lúc '+h(kq.luc||'')+'</span></div>';

  o += U.ph({eyebrow:'KẾT QUẢ · '+b.tang+' · BÀI '+b.bo, ic:'crown', grad:1, t:b.ten,
    lead:b.ra});

  /* Điểm chấm trên bản rút phải tự khai là điểm trên bản rút. Một con
     số ba chữ số nằm trong vòng tròn màu trông y hệt nhau dù đằng sau
     là sáu câu hay ba mươi câu — nên chỗ nói ra sự khác biệt ấy phải
     nằm ngay trên con số, không nằm dưới chân trang. */
  if(b.mau && b.soCauThat > b.cau.length)
    o += '<div class="card mb" style="border-color:var(--alert);background:rgba(251,146,60,.06)">'+
      '<p class="tiny" style="line-height:1.7;color:var(--ink-2)"><b>Điểm này chấm trên '+
      b.cau.length+' câu, bài đủ có '+b.soCauThat+' câu.</b> Đủ để thấy cách chấm và cách phân nhóm, '+
      'không đủ để kết luận về một gia đình thật — sáu câu thì mỗi miền chỉ có một câu, '+
      'trả lời lệch một câu là miền đó lệch cả miền. Kết quả này không ghi vào hồ sơ.</p></div>';

  o += '<div class="card" style="border-color:'+n.color+'44;background:'+n.color+'0d">'+
    '<div class="row wrap" style="gap:20px;align-items:center">'+
    U.ring(kq.diem, n.color, 'trên 100')+
    '<div class="grow" style="min-width:240px">'+
    '<div class="row mb" style="gap:8px">'+U.dot(n.color)+'<b style="color:'+n.color+';font-size:18px">'+h(n.label)+'</b></div>'+
    '<p class="sm dim" style="line-height:1.75;margin-bottom:10px">'+h(n.meaning)+'</p>'+
    '<div class="card pad-sm" style="border-color:'+n.color+'33">'+
    '<div class="tiny up mb" style="color:'+n.color+'">VIỆC LÀM NGAY</div>'+
    '<p class="sm">'+h(n.action)+'</p></div></div></div></div>';

  o += U.sec('ĐIỂM TỪNG MIỀN', 'Nhìn miền thấp nhất trước. Đó là nơi chạm đầu tiên, không phải chỗ để trách nhau.');
  o += '<div class="card">' + b.mien.map(function(m){
    var d = kq.mien[m];
    var mc = d===null ? 'var(--ink-4)' : d<33 ? '#dc2626' : d<58 ? '#BE0E16' : d<83 ? '#d97706' : '#0B7350';
    return '<div style="margin-bottom:13px">'+
      '<div class="row" style="justify-content:space-between;margin-bottom:5px">'+
      '<span class="sm">'+h(m)+'</span>'+
      '<b class="sm" style="color:'+mc+'">'+(d===null?'—':d)+'</b></div>'+
      U.bar(d===null?0:d, mc)+'</div>';
  }).join('') + '</div>';

  if(kq.canhBao && kq.canhBao.length){
    o += U.sec('CẢNH BÁO ĐÃ BẬT', 'Những mẫu này chỉ bật khi số liệu thật rơi vào ngưỡng — không bật vu vơ.');
    o += kq.canhBao.map(function(cb){
      var sc = cb.severity==='high' ? '#dc2626' : cb.severity==='medium' ? '#BE0E16' : '#d97706';
      return '<div class="card mb" style="border-color:'+sc+'44;background:'+sc+'0a">'+
        '<div class="row mb" style="gap:8px"><span style="color:'+sc+'">'+ic('pulse','w-4 h-4')+'</span>'+
        U.chip(cb.severity==='high'?'ƯU TIÊN CAO':cb.severity==='medium'?'CẦN THEO DÕI':'GHI NHẬN', sc)+'</div>'+
        '<p class="sm dim" style="line-height:1.75">'+h(cb.then)+'</p></div>';
    }).join('');
  }

  if(yeu.length){
    o += U.sec('THỨ TỰ CHẠM', 'Làm từ trên xuống. Một việc một lúc — đó là cách duy nhất giữ được.');
    o += '<div class="card">'+U.list(yeu.map(function(m,i){
      return (i+1)+'. '+m+' — đang ở '+kq.mien[m]+'/100';
    }), c)+'</div>';
  } else {
    o += '<div class="card mt2" style="border-color:#0B735044">'+
      '<div class="row mb"><span style="color:#0B7350">'+ic('check','w-4 h-4')+'</span><b>Không miền nào dưới ngưỡng</b></div>'+
      '<p class="sm dim">Giữ nguyên nhịp hiện tại làm nền và chuyển trọng tâm sang độ khó của nhiệm vụ.</p></div>';
  }

  if(pd.length){
    o += U.sec('PHÁC ĐỒ NÊN MỞ TRƯỚC', 'Chọn theo miền yếu nhất, không chọn theo cảm tính.');
    o += '<div class="grid g2">'+pd.map(function(p){
      return '<button class="card lift" data-v="phac-do" style="text-align:left;border-color:'+c+'22">'+
        '<div class="row wrap mb" style="gap:7px">'+U.chip(p.ma,c)+'<span class="tiny muted">'+h(p.nhomTen||p.nhom||'')+'</span></div>'+
        '<b class="sm" style="display:block;line-height:1.45">'+h(p.ten)+'</b></button>';
    }).join('')+'</div>';
  }

  if(tl.length){
    o += U.sec('TÀI LIỆU GỬI VỀ CHO GIA ĐÌNH', tl.length+' tài liệu trong kho quà, đúng tầng '+b.tang+' và đúng miền đang yếu.');
    o += '<div class="grid g2">'+tl.map(function(q){
      return '<div class="card pad-sm" style="border-color:'+c+'22">'+
        '<div class="row wrap mb" style="gap:7px">'+U.chip(q.ma,c)+U.chip(q.dang)+
        '<span class="tiny muted">'+q.trang+' trang · '+q.diem+' điểm</span></div>'+
        '<b class="sm" style="display:block;line-height:1.45;margin-bottom:5px">'+h(q.ten)+'</b>'+
        '<p class="tiny muted">'+h(q.nv)+'</p></div>';
    }).join('')+'</div>';
    o += '<p class="tiny muted mt">Mở đầy đủ kho quà ở mục <b>Kho quà tặng</b>. Quyền gửi tài liệu ra ngoài do Admin chỉ định.</p>';
  }

  o += '<div class="card mt2" style="border-color:rgba(251,146,60,.35);background:rgba(251,146,60,.06)">'+
    '<div class="tiny up mb" style="color:var(--alert)">RANH GIỚI</div>'+
    '<p class="sm" style="line-height:1.75">'+h(b.gioiHan)+'</p></div>';

  o += '<div class="row wrap mt2" style="gap:8px">'+
    '<button class="btn pri sm" data-tin="'+h(b.ma)+'">'+ic('out')+'In hoặc lưu PDF kết quả</button>'+
    '<button class="btn ghost sm" data-tlam="'+h(b.ma)+'">Làm lại bài này</button>'+
    '<button class="btn ghost sm" data-v="kpi-100">Xem mười điểm về đích</button></div>';
  return o;
}

/* ═══════════════════ KPI 10 ĐIỂM · 100 TIÊU CHÍ ═══════════════════ */
G.VIEWS['kpi-100'] = function(){
  var K = G.KPI100;
  if(!K) return U.empty('Chưa mở được bộ KPI', 'Bộ KPI nằm trong gói nền. Đăng nhập lại để nạp.');
  var S = G.S.checks;
  /* Ở bản chưa nối máy chủ cấp phép, gói mẫu chỉ mở tiêu chí của điểm mốc
     đầu; chín mốc còn lại về dưới dạng "[Tiêu chí mở khi được cấp phép]".
     Trước v9.2 màn này vẫn vẽ chín mươi dòng ấy thành nút bấm được — nên
     một phụ huynh mở ra thấy 5.118 ký tự mà 90% là chỗ trống giả làm việc
     phải làm, và tích vào thì tích được một ô rỗng.

     Nay đếm và vẽ chỉ trên tiêu chí THẬT. Mốc chưa mở hiện đúng một dòng
     nói vì sao chưa mở, không giả vờ có mười việc chờ tích. Mẫu số cũng
     đổi theo: "8/10" chỉ đúng khi có mười tiêu chí thật để đạt. */
  function laTrong(t){ return /^\s*\[.*\]\s*$/.test(String(t||'')); }
  var dat = 0, qua = 0, mocMo = 0;
  var soDat = K.diem.map(function(d){
    var that = d.tc.filter(function(t){ return !laTrong(t); });
    var n = d.tc.filter(function(t,i){ return !laTrong(t) && S['kpi-'+d.no+'-'+i]; }).length;
    dat += n;
    if(that.length){ mocMo++; if(n >= Math.ceil(that.length*0.8)) qua++; }
    return n;
  });
  var tongThat = K.diem.reduce(function(a,d){
    return a + d.tc.filter(function(t){ return !laTrong(t); }).length; }, 0);
  var conKhoa = 10 - mocMo;

  var o = U.ph({eyebrow:'NHÓM 02 · VỀ ĐÍCH', ic:'crown', grad:1, t:'Mười điểm về đích · một trăm tiêu chí',
    lead:K.cot});

  o += '<div class="grid g4 mb">'+
    U.stat({k:'Điểm mốc đã mở', v:qua+'/'+mocMo, d:conKhoa?conKhoa+' mốc mở dần theo tầng':'qua khi đạt 8/10 tiêu chí', c:'#185AB4'})+
    U.stat({k:'Tiêu chí đã đạt', v:dat+'/'+tongThat, d:tongThat<100?'trên tổng 100 của cả năm tầng':'về đích tối thiểu 80', c:'#0B7350'})+
    U.stat({k:'Còn lại',         v:String(tongThat-dat), d:'tiêu chí đang mở mà chưa tích', c:'#5140B4'})+
    U.stat({k:'Tình trạng',      v:qua>=10?'VỀ ĐÍCH':'ĐANG ĐI', d:qua>=10?'đủ mười điểm mốc':'còn '+(10-qua)+' điểm mốc', c:qua>=10?'#0B7350':'#0B6675'})+
    '</div>';
  if(conKhoa)
    o += '<div class="card mb" style="border-color:var(--gita-vien-1)">'+
      '<p class="tiny" style="line-height:1.75;color:var(--ink-2)"><b>'+conKhoa+' điểm mốc chưa mở trên bản này.</b> '+
      'Mười điểm mốc trải suốt năm tầng — mốc của tầng sau mở khi nhà mình qua tầng trước, '+
      'nên bảng dưới chỉ bày việc anh chị làm được HÔM NAY. Đây không phải chỗ hỏng: '+
      'bày sẵn chín mươi việc của ba năm tới là cách chắc chắn để một nhà bỏ cuộc trong tuần đầu.</p></div>';

  o += '<div class="card mb"><div class="row" style="justify-content:space-between;margin-bottom:7px">'+
    '<b class="sm">Đường về đích</b><span class="tiny muted">'+dat+'/100 tiêu chí</span></div>'+
    U.bar(dat, qua>=10?'#0B7350':'var(--gita)')+
    '<p class="tiny muted mt">'+h(K.cham)+'</p></div>';

  o += U.sec('MƯỜI ĐIỂM MỐC', 'Bấm vào từng tiêu chí để tích. Trạng thái lưu trong máy này.');
  o += K.diem.map(function(d, di){
    var that = d.tc.filter(function(t){ return !laTrong(t); });
    var n = soDat[di], ok = that.length && n >= Math.ceil(that.length*0.8);
    if(!that.length)
      return '<div class="card mb" style="border-color:var(--line)">'+
        '<div class="row wrap" style="gap:8px;align-items:center">'+
        '<span style="color:var(--ink-4);flex:none">'+ic('lock','w-4 h-4')+'</span>'+
        U.chip('ĐIỂM '+d.no)+U.chip(d.tang)+
        '<b class="sm" style="color:var(--ink-3)">'+h(d.ten)+'</b></div>'+
        '<p class="tiny muted mt" style="line-height:1.7">'+h(d.mo)+' — mười tiêu chí của mốc này mở khi nhà mình vào tầng '+h(d.tang)+'.</p></div>';
    return '<div class="card mb" style="border-color:'+d.c+(ok?'66':'22')+';'+(ok?'background:'+d.c+'0a':'')+'">'+
      '<div class="row wrap" style="gap:10px;justify-content:space-between;margin-bottom:9px">'+
      '<div class="row wrap" style="gap:8px">'+
      U.chip('ĐIỂM '+d.no, d.c)+U.chip(d.tang)+
      '<b style="color:'+d.c+';font-size:16px">'+h(d.ten)+'</b></div>'+
      '<span class="chip" style="color:'+(ok?'#0B7350':'var(--ink-4)')+';border-color:'+(ok?'#0B735055':'var(--line)')+'">'+
      (ok?'ĐÃ QUA':'')+' '+n+'/'+that.length+'</span></div>'+
      '<p class="sm dim" style="line-height:1.7;margin-bottom:10px">'+h(d.mo)+'</p>'+
      U.bar(Math.round(n/that.length*100), ok?'#0B7350':d.c)+
      '<div style="display:flex;flex-direction:column;gap:6px;margin-top:11px">'+
      d.tc.map(function(t,i){
        if(laTrong(t)) return '';
        var k = 'kpi-'+d.no+'-'+i, on = !!S[k];
        return '<button class="card pad-sm lift" data-check="'+h(k)+'" style="text-align:left;'+
          'border-color:'+(on?d.c+'55':'var(--line)')+';background:'+(on?d.c+'12':'transparent')+'">'+
          '<div class="row" style="gap:9px;align-items:flex-start">'+
          '<span style="flex:none;color:'+(on?d.c:'var(--ink-4)')+'">'+ic(on?'check':'dot','w-4 h-4')+'</span>'+
          '<span class="tiny" style="line-height:1.6;color:var(--ink-2)">'+h(t)+'</span></div></button>';
      }).join('')+'</div></div>';
  }).join('');

  o += U.sec('LUẬT CHẤM', 'Năm luật này không thương lượng.');
  o += '<div class="card">'+U.list(K.luat, 'var(--gita)')+'</div>';

  o += '<div class="row wrap mt2" style="gap:8px">'+
    '<button class="btn ghost sm" data-v="bo-test">'+ic('target')+'Làm bộ test nhận diện</button>'+
    '<button class="btn ghost sm" data-kpiin="1">'+ic('out')+'In bảng KPI</button></div>';
  return o;
};

/* ═══════════════════ SỰ KIỆN ═══════════════════ */
function on(sel, fn){
  document.addEventListener('click', function(e){
    var el = e.target.closest && e.target.closest(sel);
    if(el){ e.preventDefault(); fn(el, e); }
  });
}
function lai(){ if(G.render) G.render(); }

on('[data-tf]', function(el){
  var f = el.getAttribute('data-tf');
  document.querySelectorAll('[data-tf]').forEach(function(b){ b.classList.toggle('on', b===el); });
  document.querySelectorAll('#tsList [data-f]').forEach(function(c){
    c.style.display = (f==='ALL' || c.getAttribute('data-f')===f) ? '' : 'none'; });
});
on('[data-test]', function(el){ G.S.testDang = el.getAttribute('data-test'); lai(); });
on('[data-tthoat]', function(){ G.S.testDang = null; lai(); });
on('[data-tq]', function(el){
  var p = el.getAttribute('data-tq').split('|');
  var st = G.S.test[p[0]] || (G.S.test[p[0]] = { dap:{}, xong:false });
  st.dap[p[1]] = U.num(p[2]);
  if(G.save) G.save();
  /* Đánh dấu để bài làm đi lên máy chủ. Thiếu dòng này thì con làm bài trên
     máy tính, mở điện thoại lại thấy trống. */
  if(G.danhDau) G.danhDau('test', p[0]);
  /* Cập nhật tại chỗ để không cuộn về đầu trang khi đang làm bài */
  var b = boTest(p[0]);
  if(b){
    var c = tierColor(b.tang);
    el.parentNode.parentNode.querySelectorAll('[data-tq]').forEach(function(x){
      var on = x === el;
      x.style.borderColor = on ? c : 'var(--line)';
      x.style.background = on ? c+'14' : 'transparent';
      var ch = x.querySelector('.chip');
      if(ch){ ch.style.color = on ? c : 'var(--ink-4)'; ch.style.borderColor = on ? c+'55' : 'var(--line)'; }
    });
    var da = Object.keys(st.dap).length, tong = b.cau.length;
    var bar = document.querySelector('.view .card .bar i');
    if(bar) bar.style.width = Math.round(da/tong*100)+'%';
    var nut = document.querySelector('[data-txong]');
    if(nut && da>=tong) nut.classList.remove('off');
  }
});
on('[data-txong]', function(el){
  var ma = el.getAttribute('data-txong'), b = boTest(ma);
  var st = G.S.test[ma];
  if(!b || !st) return;
  if(Object.keys(st.dap).length < b.cau.length){
    U.toast('Còn câu chưa trả lời. Trả lời đủ mới ra được nhóm đúng.','err'); return;
  }
  var kq = G.chamTest(b, st.dap);
  st.diem = kq.diem; st.mien = kq.mien; st.nhom = kq.nhom; st.canhBao = kq.canhBao;
  st.xong = true; st.luc = new Date().toLocaleString('vi-VN');
  if(G.save) G.save();
  if(G.danhDau) G.danhDau('test', b.ma);
  if(G.secLog) G.secLog('Chấm bài test', b.ma+' · '+kq.diem+'/100 · nhóm '+kq.nhom.code, 'Ghi nhận');
  lai();
});
on('[data-tlam]', function(el){
  var ma = el.getAttribute('data-tlam');
  G.S.test[ma] = { dap:{}, xong:false };
  if(G.danhDau) G.danhDau('test', ma);
  if(G.save) G.save();
  lai();
});
on('[data-txoa]', function(el){
  var ma = el.getAttribute('data-txoa');
  G.S.test[ma] = { dap:{}, xong:false };
  if(G.save) G.save();
  U.toast('Đã xoá câu trả lời của bài này.','ok');
  lai();
});
on('[data-tin]', function(){ G.inTrang('Kết quả bộ test'); });
on('[data-kpiin]', function(){ G.inTrang('Bảng KPI về đích'); });
})();
