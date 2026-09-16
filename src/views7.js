/* ═══════════════════════════════════════════════════════════════
   GITA 365 · v7.1 — VĂN BẢN · TÀI CHÍNH · THANH TRA · RÀ SOÁT ·
   TÌNH HUỐNG · BẢN ĐỒ TƯ VẤN · BẢN ĐỒ COACHING · KHO QUÀ ·
   KẾT NỐI · XUẤT DỮ LIỆU
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;
G.VIEWS = G.VIEWS || {};
(function(){
var U = G.U, h = U.h, ic = U.ic;

/* ═══════════════ BỘ VĂN BẢN CHUẨN ═══════════════ */
G.VIEWS['van-ban'] = function(){
  if(!G.can('pro_consult')) return U.lockCard();
  var tong = G.VANBAN.reduce(function(a,n){return a+n.ban.length;},0);
  var o = U.ph({eyebrow:'NHÓM 05 · QUẢN TRỊ', ic:'book', grad:1, t:'Bộ văn bản chuẩn',
    lead:'Hai mươi hai mẫu văn bản cho năm nhóm việc. Mỗi mẫu ghi rõ ai ký, lưu ở đâu, giữ bao lâu, các trường bắt buộc, và điều dễ làm sai nhất.'});

  o += '<div class="grid g5 mb">' + G.VANBAN.map(function(n){
    return '<button class="card pad-sm lift" data-vbn="'+h(n.nhom)+'" style="text-align:left;border-color:'+n.c+'2a">'+
      '<div style="color:'+n.c+';margin-bottom:7px">'+ic(n.ic,'w-5 h-5')+'</div>'+
      '<b class="sm" style="display:block;color:'+n.c+'">'+h(n.nhom)+'</b>'+
      '<span class="tiny muted">'+n.ban.length+' mẫu</span></button>';
  }).join('') + '</div>';

  o += G.VANBAN.map(function(n){
    return '<div class="mt2"><div class="up mb" style="color:'+n.c+'">'+h(n.nhom)+'</div>'+
      '<div class="grid g2">' + n.ban.map(function(b){
        return '<button class="card lift" data-vb="'+h(b.ma)+'" style="text-align:left;border-color:'+n.c+'22">'+
          '<div class="row wrap" style="gap:7px;margin-bottom:7px">'+U.chip(b.ma,n.c)+
          '<span class="tiny muted">'+h(b.ky)+'</span></div>'+
          '<b class="sm" style="display:block;line-height:1.4;margin-bottom:6px">'+h(b.ten)+'</b>'+
          '<p class="tiny muted" style="line-height:1.55">'+h(b.khi)+'</p>'+
          '<div class="tiny mt" style="color:var(--ink-4)">'+ic('lock','w-3 h-3')+' '+h(b.luu)+'</div></button>';
      }).join('') + '</div></div>';
  }).join('');

  o += '<p class="tiny muted center mt2">Tổng '+tong+' mẫu · mọi bản in ra đều mang mật mã kín theo người nhận</p>';
  return o;
};
G.vanBanModal = function(ma){
  var nb = null, b = null;
  G.VANBAN.forEach(function(n){ n.ban.forEach(function(x){ if(x.ma===ma){ nb=n; b=x; } }); });
  if(!b) return;
  U.modal('<div class="row wrap" style="gap:7px;margin-bottom:9px">'+U.chip(b.ma,nb.c)+U.chip(nb.nhom)+'</div>'+
    '<h2 style="font-size:21px;font-weight:800;margin-bottom:12px">'+h(b.ten)+'</h2>'+
    '<div class="grid g3" style="gap:10px;margin-bottom:14px">'+
      '<div class="card pad-sm"><div class="tiny up muted mb">AI KÝ</div><p class="sm">'+h(b.ky)+'</p></div>'+
      '<div class="card pad-sm"><div class="tiny up muted mb">LƯU Ở ĐÂU</div><p class="sm">'+h(b.luu)+'</p></div>'+
      '<div class="card pad-sm"><div class="tiny up muted mb">KHI NÀO DÙNG</div><p class="sm">'+h(b.khi)+'</p></div>'+
    '</div>'+
    '<div class="up mb" style="color:'+nb.c+'">CÁC TRƯỜNG BẮT BUỘC</div>'+U.list(b.truong, nb.c)+
    '<div class="up mt2 mb" style="color:'+nb.c+'">MẪU</div>'+
    '<pre id="vbMau" style="white-space:pre-wrap;font-family:var(--font);font-size:14.5px;line-height:1.75;'+
    'padding:16px;border-radius:14px;background:var(--phu-2);border:1px solid var(--line)">'+h(b.mau)+'</pre>'+
    '<div class="card pad-sm mt2" style="border-color:rgba(251,146,60,.35);background:rgba(251,146,60,.06)">'+
    '<div class="tiny up mb" style="color:var(--alert)">DỄ LÀM SAI NHẤT</div><p class="sm">'+h(b.luuY)+'</p></div>'+
    '<div class="row mt2" style="gap:8px"><button class="btn pri sm" data-act="in-vanban">'+ic('arrow')+'In hoặc lưu PDF</button>'+
    '<button class="btn ghost sm" data-act="chep-vanban">Sao chép mẫu</button></div>');
};

/* ═══════════════ QUẢN TRỊ TÀI CHÍNH ═══════════════ */
G.VIEWS['tai-chinh-qt'] = function(){
  if(!G.can('fin_view')) return U.lockCard();
  var T = G.TAICHINH_QT;
  var o = U.ph({eyebrow:'NHÓM 05 · QUẢN TRỊ', ic:'chart', grad:1, t:'Hệ quản trị tài chính', lead:T.cot});

  o += '<div class="grid g3 mb">' + T.chiSo.map(function(c){
    return '<div class="card pad-sm" style="border-color:'+c.c+'26">'+
      '<div class="row" style="align-items:baseline;gap:9px;margin-bottom:5px">'+
      '<b class="mono" style="font-size:21px;color:'+c.c+'">'+h(c.v)+'</b>'+
      '<span class="tiny muted">chuẩn: '+h(c.chuan)+'</span></div>'+
      '<div class="up" style="color:var(--ink-4);margin-bottom:6px">'+h(c.k)+'</div>'+
      '<p class="tiny muted" style="line-height:1.55">'+h(c.y)+'</p></div>';
  }).join('') + '</div>';

  o += U.sec('SÁU NGUYÊN TẮC','Không có ngoại lệ vì thân quen, vì gấp, hay vì số nhỏ');
  o += '<div class="grid g2">' + T.nguyenTac.map(function(n,i){
    return '<div class="card pad-sm"><div class="row" style="gap:9px;margin-bottom:6px">'+
      '<span class="pill" style="background:var(--gita-mo-2);color:var(--gold-ink)">0'+(i+1)+'</span>'+
      '<b class="sm">'+h(n.t)+'</b></div>'+
      '<p class="tiny muted" style="line-height:1.6;padding-left:34px">'+h(n.d)+'</p></div>';
  }).join('') + '</div>';

  o += U.sec('NĂM SỔ','Mỗi sổ một người giữ, một nhịp, một bộ chứng từ');
  o += U.tbl(['Sổ','Gồm chứng từ','Người giữ','Nhịp'], T.so.map(function(s){
    return ['<b class="sm">'+h(s.ten)+'</b>','<span class="sm muted">'+h(s.gom)+'</span>',
      '<span class="chip">'+h(s.ai)+'</span>','<span class="sm">'+h(s.nhip)+'</span>'];
  }));

  o += U.sec('SÁU CHỐT KIỂM SOÁT','');
  o += '<div class="card">' + T.kiemSoat.map(function(k,i){
    return '<div class="rule"><span class="n">'+(i+1)+'</span><div class="tx"><b>'+h(k)+'</b></div></div>';
  }).join('') + '</div>';

  o += '<div class="row mt2" style="gap:8px"><button class="btn ghost" data-go="van-ban">'+ic('book')+'Mở năm mẫu văn bản tài chính</button>'+
    '<button class="btn ghost" data-go="hoa-hong">'+ic('share')+'Cơ chế hoa hồng đại sứ</button></div>';
  return o;
};

/* ═══════════════ THANH TRA & CẢNH BÁO ═══════════════ */
G.VIEWS['thanh-tra'] = function(){
  if(!G.can('pro_report')) return U.lockCard();
  var T = G.THANHTRA;
  var o = U.ph({eyebrow:'NHÓM 05 · QUẢN TRỊ', ic:'pulse', grad:1, t:'Thanh tra & cảnh báo', lead:T.cot});

  o += U.sec('SÁU CHU KỲ THANH TRA','Mỗi chu kỳ một người chịu trách nhiệm và một đầu ra cụ thể');
  o += '<div class="grid g3">' + T.chuKy.map(function(c){
    return '<div class="card lift" style="border-color:'+c.c+'2a">'+
      '<div class="row wrap" style="gap:7px;margin-bottom:8px">'+U.chip(c.ky,c.c)+U.chip(c['giờ'])+'</div>'+
      '<div class="tiny up muted mb">NGƯỜI CHỊU TRÁCH NHIỆM</div>'+
      '<b class="sm" style="display:block;margin-bottom:9px;color:'+c.c+'">'+h(c.ai)+'</b>'+
      '<div class="tiny up muted mb">RÀ NHỮNG GÌ</div>'+U.list(c.soat, c.c)+
      '<div class="mt2" style="padding:10px 12px;border-radius:11px;background:'+c.c+'0d;border-left:2px solid '+c.c+'">'+
      '<span class="tiny up" style="color:'+c.c+'">ĐẦU RA</span><p class="sm mt">'+h(c.ra)+'</p></div></div>';
  }).join('') + '</div>';

  o += U.sec('MƯỜI CẢNH BÁO','Mỗi cảnh báo có mức, người nhận, thời hạn xử lý và việc phải làm');
  var mm = {'ĐỎ':'#BE0E16','CAM':'var(--gita-do)','VÀNG':'#BE0E16','XANH':'#0B7350'};
  o += U.tbl(['Mã','Mức','Điều kiện bật','Ai nhận','Trong','Việc phải làm'], T.canhBao.map(function(c){
    return ['<span class="mono sm">'+h(c.ma)+'</span>',
      '<span class="chip" style="color:'+mm[c.muc]+';border-color:'+mm[c.muc]+'66;background:'+mm[c.muc]+'14">'+h(c.muc)+'</span>',
      '<span class="sm">'+h(c.dieu)+'</span>','<span class="tiny">'+h(c.ai)+'</span>',
      '<b class="tiny mono">'+h(c.trong)+'</b>','<span class="tiny muted">'+h(c.viec)+'</span>'];
  }));
  return o;
};

/* ═══════════════ RÀ SOÁT KHÔNG BỎ SÓT ═══════════════ */
G.VIEWS['ra-soat-kh'] = function(){
  /* Rà soát mười hai mặt là việc chung của người làm với gia đình, gồm cả
     Tư vấn. Khoá ở pro_coach thì Tư vấn thấy mục mà không mở được. */
  if(!G.can('pro_consult')) return U.lockCard();
  var R = G.RASOAT_KH;
  var xong = R.mat.filter(function(m,i){ return G.S.checks['m'+i]; }).length;
  var o = U.ph({eyebrow:'NHÓM 05 · QUẢN TRỊ', ic:'target', grad:1, t:'Rà soát mười hai mặt', lead:R.cot});

  o += '<div class="card glow mb"><div class="row wrap" style="gap:24px;align-items:center">'+
    U.ring(Math.round(xong/R.mat.length*100),'#0B7350','ĐÃ CHẠM')+
    '<div class="grow" style="min-width:250px"><b style="font-size:16px;display:block;margin-bottom:6px">'+
    xong+' / '+R.mat.length+' mặt đã chạm</b>'+
    '<p class="sm dim">'+h(R.nhip)+'</p>'+
    '<p class="sm mt" style="color:var(--bad)">'+h(R.luat)+'</p></div></div></div>';

  o += '<div class="grid g2">' + R.mat.map(function(m,i){
    var d = !!G.S.checks['m'+i];
    return '<button class="ck '+(d?'done':'')+'" data-check="m'+i+'" style="align-items:flex-start">'+
      '<span class="bx">'+ic('check','w-3 h-3')+'</span>'+
      '<span class="tx"><b>'+h(m.ma)+' · '+h(m.ten)+'</b>'+
      '<span style="display:block;margin-top:4px;font-style:italic;color:var(--gold-2)">"'+h(m.hoi)+'"</span>'+
      '<span style="display:block;margin-top:5px;color:var(--bad)">⚠ '+h(m.dau)+'</span></span></button>';
  }).join('') + '</div>';
  return o;
};

/* ═══════════════ 250 TÌNH HUỐNG THỰC CHIẾN ═══════════════ */
G.VIEWS['tinh-huong'] = function(){
  /* Kho tra cứu của nghề, không phải công cụ thao tác với gia đình.
     Bảng PERM đã nói rõ: nghe_chung mở cho R01–R12 — "toàn bộ kho nghề".
     Khoá ở pro_coach hoặc pro_consult thì Chuyên gia đánh giá, Chuyên gia
     tư vấn và Phân tích dữ liệu thấy mục này trong trình đơn mà bấm vào
     chỉ nhận được một thẻ khoá — đúng loại mục chết anh Quang đã bảo dẹp.
     Quyền THAO TÁC (buồng lái Coach, cổng nghiệm thu, xuất dữ liệu) vẫn
     giữ nguyên ở pro_coach và pro_approve. */
  if(!G.can('nghe_chung')) return U.lockCard();
  var ds = G.TINHHUONG || [];
  var o = U.ph({eyebrow:'NHÓM 03 · KHO BÁU VẬT', ic:'ritual', grad:1, t:'Tình huống thực chiến',
    lead:'Hai trăm năm mươi tình huống có thật, chia đều năm tầng và năm mươi nhóm. Mỗi tình huống có mã Key, phân tích, điểm mấu chốt, giải pháp, thử thách bảy ngày và KPI hoàn thành.'});

  o += '<div class="grid g5 mb">' + ['T1','T2','T3','T4','T5'].map(function(t,i){
    var tt = G.TIERS[i], n = ds.filter(function(x){return x.tang===t;}).length;
    return U.stat({k:tt.code+' · '+G.tname(tt), v:n, d:'tình huống', c:tt.c});
  }).join('') + '</div>';

  o += '<div class="row wrap mb" style="gap:6px">'+
    '<button class="chip on" data-thf="ALL">Tất cả</button>'+
    G.TIERS.map(function(t){return '<button class="chip" data-thf="'+t.code+'">'+t.code+'</button>';}).join('')+'</div>';
  o += G.searchBox('Tìm theo tình huống, mã Key, nhóm…','th');

  o += '<div class="grid g-auto-lg mt" id="thList">' + G.dsHet(ds,48).map(G.thCard).join('') + '</div>'+
    '<div class="center mt2"><button class="btn" data-act="th-more">Hiện thêm 48 tình huống</button>'+
    '<p class="tiny muted mt">Đang hiện <b id="thCount">48</b> / '+ds.length+'</p></div>';
  return o;
};
G.thCard = function(x){
  var t = G.TIERS.filter(function(v){return v.code===x.tang;})[0] || G.TIERS[0];
  return '<button class="card pad-sm lift" data-th="'+h(x.tang+'-'+x.stt)+'" '+
    'data-s="'+h(((x.th||'')+' '+(x.key||'')+' '+(x.nhom||'')).toLowerCase())+'" data-f="'+h(x.tang)+'" style="text-align:left;border-color:'+t.c+'22">'+
    '<div class="row wrap" style="gap:5px;margin-bottom:7px">'+U.chip(x.tang,t.c)+
    (x.key?U.chip(String(x.key).split('–')[0].trim()):'')+'</div>'+
    '<b class="sm" style="display:block;line-height:1.4;margin-bottom:5px">'+h(x.th)+'</b>'+
    '<span class="tiny muted">'+h(x.nhom)+'</span></button>';
};
G.tinhHuongModal = function(id){
  var p = id.split('-'), x = (G.TINHHUONG||[]).filter(function(v){return v.tang===p[0] && String(v.stt)===p[1];})[0];
  if(!x) return;
  var t = G.TIERS.filter(function(v){return v.code===x.tang;})[0] || G.TIERS[0];
  var b = [['MÔ TẢ TÌNH HUỐNG',x.mo,'#665E88'],['PHÂN TÍCH',x.pt,'#5140B4'],
    ['ĐIỂM MẤU CHỐT',x.chot,'var(--gita)'],['GIẢI PHÁP THEO TẦNG',x.gp,'#0B7350'],
    ['THỬ THÁCH 7 NGÀY',x.tt,'#0B6675'],['KPI HOÀN THÀNH',x.kpi,'var(--gita-do)'],['MỤC TIÊU CẦN ĐẠT',x.dich,'#BE0E16']];
  U.modal('<div class="row wrap" style="gap:6px;margin-bottom:9px">'+U.chip(x.tang+' · '+G.tname(t),t.c)+
    (x.key?U.chip(x.key,'var(--gita)'):'')+U.chip(x.nhom)+'</div>'+
    '<h2 style="font-size:21px;font-weight:800;line-height:1.3;margin-bottom:14px">'+h(x.th)+'</h2>'+
    b.map(function(y){ return y[1] ? '<div class="card pad-sm mb" style="border-color:'+y[2]+'2a">'+
      '<div class="tiny up mb" style="color:'+y[2]+'">'+y[0]+'</div>'+
      '<p class="sm" style="line-height:1.7">'+h(y[1])+'</p></div>' : ''; }).join(''));
};

/* ═══════════════ BẢN ĐỒ VẬN HÀNH CHO TƯ VẤN ═══════════════ */
G.VIEWS['bando-tuvan'] = function(){
  if(!G.can('pro_consult')) return U.lockCard();
  var B = G.BANDO_TUVAN;
  var o = U.ph({eyebrow:'NHÓM 05 · VẬN HÀNH', ic:'compass', grad:1, t:'Bản đồ vận hành khách hàng', lead:B.cot});
  o += B.chang.map(function(c){
    return '<div class="card lift mb" style="border-color:'+c.c+'2e">'+
      '<div class="row wrap" style="gap:11px;margin-bottom:11px">'+
      '<span style="width:36px;height:36px;border-radius:12px;display:grid;place-items:center;font-weight:900;'+
      'background:'+c.c+'22;color:'+c.c+'">'+c.no+'</span>'+
      '<b style="font-size:16px;color:'+c.c+'">'+h(c.ten)+'</b>'+U.chip(c.phut)+'</div>'+
      '<div class="grid g2" style="gap:12px;margin-bottom:11px">'+
        '<div><div class="tiny up muted mb">LÀM GÌ</div>'+U.list(c.lam, c.c)+'</div>'+
        '<div><div class="tiny up muted mb">DẤU HIỆU ĐÃ XONG</div>'+
        '<p class="sm" style="color:var(--ok);line-height:1.6">'+h(c.xong)+'</p>'+
        '<div class="tiny up muted mt2 mb">SAI THƯỜNG GẶP</div>'+
        '<p class="sm" style="color:var(--bad);line-height:1.6">'+h(c.sai)+'</p></div>'+
      '</div>'+
      (c.noi!=='—' ? '<div style="padding:14px 16px;border-radius:14px;background:'+c.c+'0f;border-left:2px solid '+c.c+'">'+
        '<span class="tiny up" style="color:'+c.c+'">CÂU PHẢI NÓI</span>'+
        '<p class="serif mt" style="font-size:16px;font-style:italic;line-height:1.6">'+h(c.noi)+'</p></div>' : '')+
      '</div>';
  }).join('');
  o += '<div class="card mt2" style="border-color:var(--gita-vien-1)">'+
    '<div class="row mb"><span style="color:var(--gold-ink)">'+ic('calendar','w-4 h-4')+'</span><b>Học thuộc trong bốn tuần</b></div>'+
    '<p class="sm dim">'+h(B.hoc)+'</p></div>';
  return o;
};

/* ═══════════════ BẢN ĐỒ COACHING ═══════════════ */
G.VIEWS['bando-coach'] = function(){
  if(!G.can('pro_coach')) return U.lockCard();
  var B = G.BANDO_COACH;
  var o = U.ph({eyebrow:'NHÓM 05 · VẬN HÀNH', ic:'flame', grad:1, t:'Bản đồ coaching', lead:B.cot});
  o += '<div class="tl">' + B.buoi.map(function(b){
    return '<div class="tl-i" style="color:'+b.c+'"><div class="card" style="border-color:'+b.c+'2a">'+
      '<div class="row wrap" style="gap:8px;margin-bottom:9px">'+U.chip('NHỊP '+b.no,b.c)+U.chip(b.phut+' phút')+'</div>'+
      '<b style="font-size:16px;display:block;margin-bottom:9px;color:'+b.c+'">'+h(b.ten)+'</b>'+
      '<p class="sm dim" style="line-height:1.65;margin-bottom:10px">'+h(b.lam)+'</p>'+
      (b.hoi!=='—' ? '<div style="padding:11px 13px;border-radius:12px;background:'+b.c+'0d;border-left:2px solid '+b.c+';margin-bottom:10px">'+
        '<span class="tiny up" style="color:'+b.c+'">CÂU HỎI</span>'+
        '<p class="sm mt" style="font-style:italic">'+h(b.hoi)+'</p></div>' : '')+
      '<div style="padding:11px 13px;border-radius:12px;background:rgba(248,113,113,.06);border:1px solid rgba(248,113,113,.2)">'+
      '<span class="tiny up" style="color:var(--bad)">TRÁNH</span><p class="sm mt">'+h(b.tranh)+'</p></div></div></div>';
  }).join('') + '</div>';
  o += U.sec('SÁU ĐIỀU LÀM MỘT BUỔI HIỆU QUẢ HƠN','Đo được, sửa được, không phải cảm nhận');
  o += '<div class="grid g2">' + B.toiUu.map(function(x,i){
    return '<div class="card pad-sm"><div class="row" style="gap:9px;margin-bottom:6px">'+
      '<span class="pill" style="background:rgba(16,185,129,.18);color:var(--ok)">0'+(i+1)+'</span>'+
      '<b class="sm">'+h(x.t)+'</b></div>'+
      '<p class="tiny muted" style="line-height:1.6;padding-left:34px">'+h(x.d)+'</p></div>';
  }).join('') + '</div>';
  return o;
};

/* ═══════════════ KHO 1.000 TÀI LIỆU QUÀ TẶNG ═══════════════ */
G.VIEWS['kho-qua'] = function(){
  var ds = G.QUA1000 || [];
  var o = U.ph({eyebrow:'NHÓM 04 · CÚ HÍCH & NHỊP SỐNG', ic:'crown', grad:1, t:'Kho quà tặng',
    lead:'Một nghìn tài liệu, mỗi tài liệu gắn đúng một vấn đề có thật và một dạng chuẩn thương hiệu. Gia đình mắc ở đâu, mở đúng tài liệu ở đó — không phải đọc cả kho.'});

  o += '<div class="grid g5 mb">' + (G.QUA_DANG||[]).map(function(d){
    var n = ds.filter(function(x){return x.dang===d.ma;}).length;
    return '<div class="card pad-sm"><div class="row" style="gap:7px;margin-bottom:6px">'+
      U.chip(d.ma,'var(--gita)')+'<b class="mono tiny">'+n+'</b></div>'+
      '<b class="sm" style="display:block;margin-bottom:5px">'+h(d.ten)+'</b>'+
      '<p class="tiny muted" style="line-height:1.5">'+h(d.mo)+'</p></div>';
  }).join('') + '</div>';

  o += '<div class="row wrap mb" style="gap:6px">'+
    '<button class="chip on" data-qf="ALL">Tất cả</button>'+
    G.TIERS.map(function(t){return '<button class="chip" data-qf="'+t.code+'">'+t.code+'</button>';}).join('')+
    (G.QUA_DANG||[]).map(function(d){return '<button class="chip" data-qf="'+d.ma+'">'+h(d.ten)+'</button>';}).join('')+'</div>';
  o += G.searchBox('Tìm tài liệu theo tên vấn đề hoặc nhóm…','qt');

  o += '<div class="grid g-auto mt" id="qtList">' + G.dsHet(ds,60).map(G.qtCard).join('') + '</div>'+
    '<div class="center mt2"><button class="btn" data-act="qt-more">Hiện thêm 60 tài liệu</button>'+
    '<p class="tiny muted mt">Đang hiện <b id="qtCount">60</b> / '+ds.length+'</p></div>';
  return o;
};
G.qtCard = function(q){
  var t = G.TIERS.filter(function(v){return v.code===q.tang;})[0] || G.TIERS[0];
  return '<div class="card pad-sm lift" data-s="'+h((q.ten+' '+q.nhom).toLowerCase())+'" '+
    'data-f="'+h(q.tang+' '+q.dang)+'" style="border-color:'+t.c+'1f">'+
    '<div class="row wrap" style="gap:5px;margin-bottom:6px">'+U.chip(q.ma)+U.chip(q.tang,t.c)+
    '<span class="tiny mono" style="color:var(--gold-ink)">'+q.diem+' điểm</span></div>'+
    '<b class="sm" style="display:block;line-height:1.4;margin-bottom:5px">'+h(q.ten)+'</b>'+
    '<span class="tiny muted">'+h(q.nv)+'</span></div>';
};

/* ═══════════════ KẾT NỐI HỆ SINH THÁI ═══════════════ */
G.VIEWS['ket-noi'] = function(){
  var K = G.KETNOI, L = G.LIENKET;
  var o = U.ph({eyebrow:'NHÓM 05 · HỆ SINH THÁI', ic:'orbit', grad:1, t:'Kết nối hệ sinh thái', lead:K.cot});

  /* Bảy bước đồng bộ nói bằng ngôn ngữ hệ thống: tên hàm kiemBanMoi, so
     mã băm từng gói, sổ sao lưu hosoAppSaoLuu, giải xung đột theo từng
     trường, sendBeacon lúc rời trang. Đó là tài liệu kiến trúc — hữu ích
     cho người vận hành, vô nghĩa với một phụ huynh, và là bản mô tả cách
     hệ thống giữ dữ liệu cho người muốn tìm chỗ hở.

     Nút "Kiểm tra bản mới" thì mọi vai đều cần, nên nút ở lại; chỉ phần
     mô tả cơ chế đi lên đội ngũ. Khách hàng thấy đúng thứ họ dùng được:
     một dòng nhịp cập nhật và một cái nút. */
  var xemCoChe = G.can && G.can('nghe_chung');
  o += '<div class="card glow mb"><div class="row wrap" style="gap:14px;align-items:center">'+
    '<span style="width:44px;height:44px;border-radius:14px;display:grid;place-items:center;background:var(--gita-mo-2);color:var(--gold-ink);flex:none">'+ic('pulse','w-5 h-5')+'</span>'+
    '<div class="grow" style="min-width:230px"><b style="font-size:16px;display:block">'+h(K.dongBo.ten)+'</b>'+
    '<p class="sm muted mt">Nhịp: '+h(K.dongBo.nhip)+'</p></div>'+
    '<button class="btn pri" data-act="kiem-ban-moi">'+ic('arrow')+'Kiểm tra bản mới</button></div>'+
    (xemCoChe
      ? '<div class="mt2">' + K.dongBo.cach.map(function(c){
          return '<div class="rule"><span class="n">'+c.b+'</span><div class="tx"><b>'+h(c.t)+'</b><p>'+h(c.d)+'</p></div></div>';
        }).join('') + '</div>'
      : '<p class="tiny muted mt2" style="line-height:1.7">Ứng dụng tự kiểm bản mới mỗi lần mở và mỗi sáu giờ, '+
        'chỉ tải phần đã đổi, và giữ được việc anh chị làm khi mất mạng — có mạng lại thì tự gửi đi. '+
        'Anh chị không phải làm gì cả; nút trên chỉ để kiểm ngay khi cần.</p>')+
    '</div>';

  o += '<div class="grid g2">';
  o += '<div class="card lift" style="border-color:'+K.facebook.c+'2e">'+
    '<div class="row" style="gap:10px;margin-bottom:9px">'+
    '<span style="width:36px;height:36px;border-radius:12px;display:grid;place-items:center;background:'+K.facebook.c+'22;color:'+K.facebook.c+'">'+ic('users','w-5 h-5')+'</span>'+
    '<b style="font-size:16px;color:'+K.facebook.c+'">'+h(K.facebook.ten)+'</b></div>'+
    '<p class="sm dim" style="line-height:1.65;margin-bottom:10px">'+h(K.facebook.lam)+'</p>'+
    '<div class="tiny up muted mb">BỐN BƯỚC THAM GIA</div>'+U.list(K.facebook.buoc, K.facebook.c)+
    '<div class="mt2" style="padding:11px 13px;border-radius:12px;background:rgba(248,113,113,.06);border:1px solid rgba(248,113,113,.2)">'+
    '<p class="sm">'+h(K.facebook.luat)+'</p></div>'+
    '<button class="btn pri blk mt2" data-act="mo-fb">'+ic('share')+'Đăng ký tham gia group</button>'+
    '<p class="tiny muted mt center">'+h(L.facebook)+'</p></div>';

  o += '<div class="card lift" style="border-color:'+K.telegram.c+'2e">'+
    '<div class="row" style="gap:10px;margin-bottom:9px">'+
    '<span style="width:36px;height:36px;border-radius:12px;display:grid;place-items:center;background:'+K.telegram.c+'22;color:'+K.telegram.c+'">'+ic('share','w-5 h-5')+'</span>'+
    '<div><b style="font-size:16px;color:'+K.telegram.c+';display:block">'+h(K.telegram.ten)+'</b>'+
    '<span class="mono tiny muted">'+h(K.telegram.sdt)+'</span></div></div>'+
    '<p class="sm dim" style="line-height:1.65;margin-bottom:10px">'+h(K.telegram.lam)+'</p>'+
    '<div class="tiny up muted mb">GHÉP NỐI</div>'+U.list(K.telegram.buoc, K.telegram.c)+
    '<div class="tiny up muted mt2 mb">HỆ THỐNG GỬI GÌ</div>'+U.list(K.telegram.gui, K.telegram.c)+
    '<div class="mt2" style="padding:11px 13px;border-radius:12px;background:rgba(248,113,113,.06);border:1px solid rgba(248,113,113,.2)">'+
    '<p class="sm">'+h(K.telegram.luat)+'</p></div>'+
    '<button class="btn pri blk mt2" data-act="mo-tg">'+ic('share')+'Mở Telegram GITA 365</button></div>';
  o += '</div>';
  return o;
};

/* ═══════════════ XUẤT DỮ LIỆU ═══════════════ */
G.VIEWS['xuat-du-lieu'] = function(){
  if(!G.can('pro_coach')) return U.lockCard();
  var X = G.XUAT;
  var o = U.ph({eyebrow:'NHÓM 05 · VẬN HÀNH', ic:'out', grad:1, t:'Xuất dữ liệu', lead:X.cot});

  /* Hai đường ra, và một đường đã bị gỡ bỏ */
  o += '<div class="grid g2 mb">' + (X.duong||[]).map(function(d){
    var duoc = G.can(d.quyen);
    return '<div class="card" style="border-color:'+d.c+'44;background:'+d.c+'0a">'+
      '<div class="row wrap mb" style="gap:8px">'+U.chip(d.ma,d.c)+
      (duoc?'<span class="chip on">'+ic('check','w-3 h-3')+' vai này được dùng</span>'
           :'<span class="chip">'+ic('lock','w-3 h-3')+' ngoài phạm vi vai này</span>')+'</div>'+
      '<b style="color:'+d.c+';font-size:16px;display:block;margin-bottom:7px">'+h(d.ten)+'</b>'+
      '<p class="tiny dim mb" style="line-height:1.6">'+h(d.cach)+'</p>'+
      '<div class="tiny" style="color:var(--ink-4)">'+ic('users','w-3 h-3')+' '+h(d.ai)+'</div></div>';
  }).join('') + '</div>';

  if(X.daBo){
    o += '<div class="card mb" style="border-color:rgba(248,113,113,.3)">'+
      '<div class="tiny up mb" style="color:#BE0E16">'+h(X.daBo.ten)+'</div>'+
      '<p class="sm dim" style="line-height:1.7">'+h(X.daBo.vi)+'</p></div>';
  }
  if(X.driveAdmin){
    o += '<div class="card mb" style="border-color:rgba(16,185,129,.32)">'+
      '<div class="row mb" style="gap:8px"><span style="color:#0B7350">'+ic('vault','w-4 h-4')+'</span>'+
      '<b>'+h(X.driveAdmin.ten)+'</b></div>'+
      '<p class="sm dim mb" style="line-height:1.7">'+h(X.driveAdmin.y)+'</p>'+
      '<a class="btn ghost sm" href="'+h(X.driveAdmin.url)+'" target="_blank" rel="noopener">'+
      ic('arrow')+'Mở thư mục Drive</a></div>';
  }

  o += U.sec('NĂM LOẠI DỮ LIỆU','Bấm để xuất. Loại nào ngoài phạm vi vai thì nút khoá.');
  o += '<div class="grid g2">' + X.loai.map(function(l){
    var duoc = G.can(l.quyen);
    return '<div class="card '+(duoc?'lift':'')+'" style="border-color:'+l.c+(duoc?'2e':'14')+';'+(duoc?'':'opacity:.6')+'">'+
      '<div class="row wrap" style="gap:8px;margin-bottom:8px">'+U.chip(l.ma,l.c)+
      (duoc?'<span class="chip on">'+ic('check','w-3 h-3')+' được xuất</span>'
           :'<span class="chip">'+ic('lock','w-3 h-3')+' cần quyền '+h(l.quyen)+'</span>')+'</div>'+
      '<b style="font-size:16px;display:block;margin-bottom:8px;color:'+l.c+'">'+h(l.ten)+'</b>'+
      '<div class="tiny up muted mb">GỒM</div><p class="sm dim" style="line-height:1.6;margin-bottom:9px">'+h(l.gom)+'</p>'+
      '<div class="tiny up muted mb">DÙNG KHI NÀO</div><p class="sm muted" style="line-height:1.6">'+h(l.dung)+'</p>'+
      (duoc ? '<button class="btn pri blk mt2" data-act="xuat" data-ma="'+h(l.ma)+'">'+ic('out')+
        (l.dang==='PDF' ? 'In hoặc lưu PDF' : 'Đẩy lên Drive của Admin')+'</button>'
            : '<button class="btn ghost blk mt2" disabled style="opacity:.5">Ngoài phạm vi vai này</button>')+
      '</div>';
  }).join('') + '</div>';

  o += U.sec('SÁU LUẬT XUẤT DỮ LIỆU','Admin chỉ định vai nào được xuất loại nào');
  o += '<div class="card">' + X.luat.map(function(l,i){
    return '<div class="rule"><span class="n">'+(i+1)+'</span><div class="tx"><b>'+h(l)+'</b></div></div>';
  }).join('') + '</div>';

  if(G.can('sys_manage_user')){
    o += U.sec('PHÂN QUYỀN XUẤT THEO VAI','Bật hoặc tắt cho từng vai cấp thấp hơn mình');
    o += U.tbl(['Loại xuất','Quyền cần','Vai được xuất'], X.loai.map(function(l){
      var vai = G.ROLES.filter(function(r){ return r.lv <= G.PERM[l.quyen]; });
      return ['<span class="sm">'+h(l.ten)+'</span>','<span class="mono tiny">'+h(l.quyen)+'</span>',
        '<div class="row wrap" style="gap:4px">'+vai.map(function(r){return U.chip(r.short,r.c);}).join('')+'</div>'];
    }));
  }
  return o;
};
})();

/* ═══════════════ QUY TRÌNH TÀI CHÍNH ═══════════════ */
(function(){
var U = G.U, h = U.h, ic = U.ic;
G.VIEWS['quy-trinh-tc'] = function(){
  if(!G.can('fin_view')) return U.lockCard();
  var T = G.THANHTOAN;
  var o = U.ph({eyebrow:'NHÓM 05 · QUẢN TRỊ', ic:'chart', grad:1, t:'Quy trình tài chính',
    lead:'Ba quy trình chạy suốt vòng đời một gia đình và một người dẫn dắt: tiền vào, tiền trả lại, và tiền trả cho người làm nghề. Cả ba đều có công thức công khai và mốc thời gian cam kết.'});

  /* Thanh toán */
  o += U.sec(T.quyTrinhThu.ten, T.quyTrinhThu.cot);
  o += '<div class="card glow mb"><div class="row wrap" style="gap:22px;align-items:center">'+
    '<div style="width:150px;flex:none;background:#fff;border-radius:16px;padding:10px;text-align:center">'+
    '<img src="'+h(T.taiKhoan.qr)+'" alt="Mã QR chuyển khoản '+h(T.taiKhoan.chuTk)+' · '+h(T.taiKhoan.soTk)+'" '+
    'style="width:100%;border-radius:10px" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'block\'">'+
    '<div style="display:none;color:#1B5CB8;font-size:12.5px;padding:24px 6px;line-height:1.5">Chưa thấy ảnh mã QR.<br>Dùng số tài khoản bên cạnh.</div></div>'+
    '<div class="grow" style="min-width:230px">'+
    '<div class="up muted">TÀI KHOẢN NHẬN</div>'+
    '<b style="font-size:18px;display:block;margin:4px 0 2px">'+h(T.taiKhoan.chuTk)+'</b>'+
    '<b class="mono" style="font-size:21px;color:var(--gold-ink);display:block">'+h(T.taiKhoan.soTk)+'</b>'+
    '<p class="sm dim mt">'+h(T.taiKhoan.nganHang)+'</p>'+
    '<div class="mt2" style="padding:11px 13px;border-radius:12px;background:var(--gita-mo-1);border-left:2px solid var(--gold)">'+
    '<span class="tiny up" style="color:var(--gold-ink)">NỘI DUNG CHUYỂN KHOẢN</span>'+
    '<p class="mono sm mt">'+h(T.noiDungCk.mau)+'</p>'+
    '<p class="tiny muted mt">Ví dụ: '+h(T.noiDungCk.vd)+' — '+h(T.noiDungCk.vi)+'</p></div>'+
    (T.taiKhoan.canQuetThu ? '<p class="tiny mt" style="color:var(--alert);line-height:1.6">'+
      ic('shield','w-3 h-3')+' '+h(T.taiKhoan.canQuetThu)+'</p>' : '')+
    '</div></div>'+
    '<p class="tiny muted mt2">'+h(T.taiKhoan.luuY)+'</p></div>';

  o += '<div class="grid g5 mb">' + T.quyTrinhThu.buoc.map(function(b){
    return '<div class="card pad-sm"><div class="row" style="gap:8px;margin-bottom:6px">'+
      '<span class="pill" style="background:rgba(59,130,246,.2);color:#2A72C6">B'+b.b+'</span>'+
      U.chip(b.ai)+'</div>'+
      '<b class="sm" style="display:block;margin-bottom:6px">'+h(b.t)+'</b>'+
      '<p class="tiny muted" style="line-height:1.55;margin-bottom:7px">'+h(b.lam)+'</p>'+
      '<div class="tiny" style="color:var(--ok)">→ '+h(b.ra)+'</div>'+
      '<div class="tiny mt" style="color:var(--ink-4)">'+h(b.trong)+'</div></div>';
  }).join('') + '</div>';
  o += U.tbl(['Tầng','Mốc thanh toán'], T.quyTrinhThu.moc.map(function(m){
    return ['<b class="sm">'+h(m.m)+'</b>','<span class="sm">'+h(m.k)+'</span>']; }));

  /* Hoàn trả */
  o += U.sec(T.quyTrinhHoan.ten, T.quyTrinhHoan.cot);
  o += '<div class="grid g5 mb">' + T.quyTrinhHoan.bac.map(function(b){
    return '<div class="card pad-sm" style="border-color:'+b.c+'2e">'+
      '<b class="mono" style="font-size:26px;color:'+b.c+';display:block">'+h(b.hoan)+'</b>'+
      '<b class="sm" style="display:block;margin:6px 0">'+h(b.khi)+'</b>'+
      '<p class="tiny muted" style="line-height:1.55;margin-bottom:7px">'+h(b.dk)+'</p>'+
      '<p class="tiny" style="color:'+b.c+';line-height:1.55">'+h(b.vi)+'</p></div>';
  }).join('') + '</div>';
  o += '<div class="card mb">' + T.quyTrinhHoan.buoc.map(function(b){
    return '<div class="rule"><span class="n">'+b.b+'</span><div class="tx"><b>'+h(b.t)+'</b>'+
      '<p>'+h(b.ai)+' · '+h(b.trong)+'</p></div></div>';
  }).join('') + '</div>';
  o += '<div class="card mb" style="border-color:rgba(52,211,153,.35)">'+
    '<div class="row"><span style="color:var(--ok)">'+ic('check','w-4 h-4')+'</span><b>Cam kết thời gian</b></div>'+
    '<p class="sm dim mt">'+h(T.quyTrinhHoan.camKet)+'</p></div>';

  /* Lương thưởng */
  var L = T.luongThuong;
  o += U.sec(L.ten, L.cot);
  o += '<div class="card glow mb" style="border-color:var(--gita-vien-2)">'+
    '<div class="up mb" style="color:var(--gold-ink)">CÔNG THỨC</div>'+
    '<p class="mono" style="font-size:14.5px;line-height:1.8;color:var(--gold-2)">'+h(L.congThuc)+'</p></div>';
  o += '<div class="grid g2 mb">' + L.thanhPhan.map(function(p){
    return '<div class="card" style="border-color:'+p.c+'2a">'+
      '<b style="font-size:16px;display:block;margin-bottom:8px;color:'+p.c+'">'+h(p.t)+'</b>'+
      '<p class="sm dim" style="line-height:1.65;margin-bottom:9px">'+h(p.tinh)+'</p>'+
      '<div class="tiny muted">Nguồn dữ liệu: '+h(p.nguon)+'</div>'+
      '<div class="tiny mt" style="color:var(--warn)">⚠ '+h(p.ghi)+'</div></div>';
  }).join('') + '</div>';

  o += U.sec('KPI TÍNH TỰ ĐỘNG','Năm thành phần, lấy thẳng từ dữ liệu hệ thống — không ai tự chấm cho mình');
  o += U.tbl(['Thành phần','Tỉ trọng','Đo bằng gì'], L.kpiTu.map(function(k){
    return ['<b class="sm">'+h(k.t)+'</b>','<b class="mono" style="color:var(--gold-ink)">'+h(k.ty)+'</b>',
      '<span class="sm muted">'+h(k.d)+'</span>']; }));

  o += '<div class="card mt2" style="border-color:rgba(248,113,113,.3)">'+
    '<div class="row mb"><span style="color:var(--bad)">'+ic('shield','w-4 h-4')+'</span><b>Năm chốt chặn</b></div>'+
    L.chotChan.map(function(c,i){
      return '<div class="rule"><span class="n" style="background:rgba(248,113,113,.16);color:var(--bad)">'+(i+1)+'</span>'+
        '<div class="tx"><b>'+h(c)+'</b></div></div>'; }).join('')+
    '<p class="tiny muted mt">'+h(L.chuKy)+'</p></div>';
  return o;
};
})();
