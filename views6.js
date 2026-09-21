/* ═══════════════════════════════════════════════════════════════
   GITA 365 · v7.1 — HỆ QUẢN TRỊ
   Tầng quyền · vòng đời tài khoản · xếp hạng tài liệu ·
   mật mã kín · dòng chảy thông tin
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;
G.VIEWS = G.VIEWS || {};
(function(){
var U = G.U, h = U.h, ic = U.ic;

/* ═══════════════ TẦNG QUYỀN TRUY CẬP ═══════════════ */
G.VIEWS['tang-quyen'] = function(){
  if(!G.can('sys_manage_user')) return U.lockCard();
  var perms = Object.keys(G.PERM);
  var o = U.ph({eyebrow:'NHÓM 05 · QUẢN TRỊ', ic:'lock', grad:1, t:'Tầng quyền truy cập',
    lead:'Mười lăm vai, hai mươi mốt quyền, một nguồn sự thật duy nhất. Cấp bậc càng nhỏ càng nhiều quyền — và không ai mở được quyền cho chính mình.'});

  var toi = G.S.roleObj;
  o += '<div class="card glow mb"><div class="row wrap" style="gap:16px;align-items:center">'+
    '<span style="width:46px;height:46px;border-radius:14px;display:grid;place-items:center;font-weight:900;'+
    'background:'+toi.c+'22;color:'+toi.c+';flex:none">'+h(toi.id)+'</span>'+
    '<div class="grow" style="min-width:230px"><b style="font-size:16px;display:block">'+h(toi.n)+' · cấp '+toi.lv+'</b>'+
    '<p class="sm muted mt">Anh chị mở hoặc đóng được chức năng của <b style="color:var(--ink)">'+
    G.ROLES.filter(function(r){return r.lv>toi.lv;}).length+' vai cấp thấp hơn</b>. '+
    'Không mở được cho vai ngang cấp hay cao hơn — đây là luật L4, chốt chặn chống lạm quyền từ bên trong.</p></div></div></div>';

  o += U.sec('MA TRẬN QUYỀN · 15 VAI × 21 QUYỀN','Ô sáng là được dùng. Máy chủ luôn kiểm lại trước khi ghi, client chỉ ẩn hiện nút.');
  o += '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Quyền</th><th>Cấp tối đa</th>'+
    G.ROLES.map(function(r){ return '<th style="text-align:center;font-size:10.5px;color:'+r.c+'">'+h(r.id)+'</th>'; }).join('')+
    '</tr></thead><tbody>' + perms.map(function(p){
      var lv = G.PERM[p];
      return '<tr><td><span class="mono sm">'+h(p)+'</span></td>'+
        '<td><span class="mono">'+lv+'</span></td>'+
        G.ROLES.map(function(r){
          var ok = r.lv <= lv;
          return '<td style="text-align:center;padding:6px">'+
            (ok ? '<span style="display:inline-block;width:9px;height:9px;border-radius:3px;background:'+r.c+';box-shadow:0 0 8px '+r.c+'99"></span>'
                : '<span style="display:inline-block;width:9px;height:9px;border-radius:3px;background:var(--phu-3)"></span>')+'</td>';
        }).join('') + '</tr>';
    }).join('') + '</tbody></table></div>';

  o += U.sec('MỞ VÀ ĐÓNG CHỨC NĂNG THEO TÀI KHOẢN','Chỉ hiện những vai thấp hơn cấp của anh chị');
  o += '<div class="grid g3">' + G.ROLES.filter(function(r){return r.lv > toi.lv;}).map(function(r){
    var so = Object.keys(G.PERM).filter(function(p){ return r.lv <= G.PERM[p]; }).length;
    return '<div class="card pad-sm" style="border-color:'+r.c+'26">'+
      '<div class="row" style="gap:9px;margin-bottom:7px">'+
      '<span style="width:30px;height:30px;border-radius:9px;display:grid;place-items:center;font-weight:900;font-size:10.5px;background:'+r.c+'22;color:'+r.c+'">'+h(r.id)+'</span>'+
      '<div class="grow" style="min-width:0"><b class="sm" style="display:block">'+h(r.n)+'</b>'+
      '<span class="tiny muted">cấp '+r.lv+' · '+so+' quyền</span></div></div>'+
      '<div class="row" style="gap:6px"><button class="btn ghost sm grow" data-act="mo-chuc-nang" data-vai="'+h(r.id)+'">Mở</button>'+
      '<button class="btn ghost sm grow" data-act="dong-chuc-nang" data-vai="'+h(r.id)+'">Đóng</button></div></div>';
  }).join('') + '</div>';

  o += '<div class="card mt2" style="border-color:rgba(248,113,113,.3)">'+
    '<div class="row mb"><span style="color:var(--bad)">'+ic('shield','w-4 h-4')+'</span><b>Luật L4 — quyền chỉ mở xuống</b></div>'+
    '<p class="sm muted">'+h(G.LUAT_TK[3].luat)+' '+h(G.LUAT_TK[3].canhBao)+'</p></div>';
  return o;
};

/* ═══════════════ VÒNG ĐỜI TÀI KHOẢN THEO KPI ═══════════════ */
G.VIEWS['vong-doi-tk'] = function(){
  if(!G.can('sys_manage_user')) return U.lockCard();
  var ds = G.TAIKHOAN_KPI;
  var khoa = ds.filter(function(x){return x.trang.indexOf('Đã khoá')===0;}).length;
  var sap  = ds.filter(function(x){return x.trang.indexOf('Sắp khoá')===0;}).length;
  var reset= ds.filter(function(x){return x.trang.indexOf('Chờ đặt lại')===0;}).length;
  var o = U.ph({eyebrow:'NHÓM 05 · QUẢN TRỊ', ic:'pulse', grad:1, t:'Vòng đời tài khoản',
    lead:'Tài khoản mở ra là một cánh cửa vào kho tri thức. Cửa không ai đi qua thì phải đóng — không phải để phạt, mà để hỏi xem chuyện gì đang xảy ra.'});

  o += '<div class="grid g4 mb">'+
    U.stat({k:'ĐANG HOẠT ĐỘNG', v:ds.filter(function(x){return x.trang==='Hoạt động';}).length, d:'KPI đạt chuẩn', c:'#0B7350'})+
    U.stat({k:'SẮP KHOÁ', v:sap, d:'KPI dưới 30% · gần mốc 90 ngày', c:'#BE0E16'})+
    U.stat({k:'ĐÃ KHOÁ', v:khoa, d:'theo luật L1', c:'#BE0E16'})+
    U.stat({k:'CHỜ ĐẶT LẠI', v:reset, d:'không hoạt động trên 180 ngày · L3', c:'#5140B4'})+
  '</div>';

  o += U.sec('NĂM LUẬT VÒNG ĐỜI','Ba luật chạy tự động, hai luật cần người xem xét');
  o += '<div class="grid g2">' + G.LUAT_TK.map(function(l){
    return '<div class="card" style="border-color:'+l.c+'2a">'+
      '<div class="row wrap" style="gap:8px;margin-bottom:8px">'+U.chip(l.ma,l.c)+
      U.chip(l.tuDong?'Tự động':'Cần người xem xét', l.tuDong?'#0B7350':'#BE0E16')+'</div>'+
      '<b style="font-size:14.5px;display:block;margin-bottom:8px;color:'+l.c+'">'+h(l.ten)+'</b>'+
      '<p class="sm dim" style="line-height:1.6;margin-bottom:10px">'+h(l.luat)+'</p>'+
      '<div style="padding:11px 13px;border-radius:12px;background:'+l.c+'0d;border-left:2px solid '+l.c+'">'+
      '<span class="tiny up" style="color:'+l.c+'">VÌ SAO</span><p class="sm mt">'+h(l.viSao)+'</p></div>'+
      '<div class="sm mt" style="color:var(--warn);display:flex;gap:8px"><span style="flex:none;margin-top:3px">⚠</span>'+
      '<span>'+h(l.canhBao)+'</span></div></div>';
  }).join('') + '</div>';

  o += U.sec('BẢNG TÀI KHOẢN','KPI hoạt động · ngày mở · số ngày chưa đăng nhập');
  o += U.tbl(['Tài khoản','Vai','KPI','Ngày mở','Chưa vào','Trạng thái','Việc'],
    ds.slice().sort(function(a,b){return a.kpi-b.kpi;}).map(function(x){
      var r = G.roleById(x.vai);
      var c = x.kpi>=70?'#0B7350':(x.kpi>=30?'#BE0E16':'#BE0E16');
      var kh = x.trang.indexOf('Đã khoá')===0, rs = x.trang.indexOf('Chờ')===0, sp = x.trang.indexOf('Sắp')===0;
      return ['<b class="sm">'+h(x.ten)+'</b><div class="tiny muted mono">'+h(x.u)+'</div>',
        U.chip(r.short, r.c),
        '<div style="min-width:92px">'+U.bar(x.kpi,c)+'<span class="tiny mono" style="color:'+c+'">'+x.kpi+'%</span></div>',
        '<span class="mono sm">'+x.ngay+'</span>',
        '<span class="mono sm"'+(x.hd>150?' style="color:var(--bad)"':(x.hd>30?' style="color:var(--warn)"':''))+'>'+x.hd+'</span>',
        '<span class="chip" style="color:'+(kh?'var(--bad)':(rs?'#A78BFA':(sp?'var(--warn)':'var(--ok)')))+
          ';border-color:currentColor">'+h(x.trang)+'</span>',
        kh ? '<button class="btn ghost sm" data-act="xet-mo" data-u="'+h(x.u)+'">Xét mở</button>'
           : (rs ? '<button class="btn ghost sm" data-act="dat-lai" data-u="'+h(x.u)+'">Đặt lại</button>'
                 : '<span class="tiny muted">—</span>')];
    }));

  o += U.sec('YÊU CẦU MỞ LẠI','Xem xét trong ba ngày làm việc · lần thứ ba trong năm phải do Giám đốc duyệt');
  o += G.YEUCAU_MO.map(function(y){
    var ba = y.lan >= 3;
    return '<div class="card mb" style="border-color:'+(ba?'rgba(248,113,113,.3)':'var(--gita-mo-3)')+'">'+
      '<div class="row wrap" style="gap:9px;margin-bottom:9px">'+
      '<b>'+h(y.ten)+'</b><span class="mono tiny muted">'+h(y.u)+'</span>'+
      U.chip('Lần '+y.lan, ba?'#BE0E16':'var(--gita)')+
      '<span class="tiny muted mono">'+h(y.ngay)+'</span></div>'+
      '<p class="serif" style="font-size:16px;font-style:italic;line-height:1.6;color:var(--ink)">"'+h(y.ly)+'"</p>'+
      '<div class="mt2" style="padding:11px 13px;border-radius:12px;background:var(--phu-2)">'+
      '<span class="tiny up muted">ĐỀ XUẤT CỦA HỆ THỐNG</span><p class="sm mt">'+h(y.dx)+'</p></div>'+
      '<div class="row mt2" style="gap:8px">'+
      '<button class="btn pri sm" data-act="duyet-mo" data-u="'+h(y.u)+'">Đồng ý mở</button>'+
      '<button class="btn ghost sm" data-act="hoan-mo" data-u="'+h(y.u)+'">Hoãn · xin thêm dữ liệu</button>'+
      (ba?'<span class="chip" style="color:var(--bad);border-color:rgba(248,113,113,.4)">Cần Giám đốc duyệt</span>':'')+
      '</div></div>';
  }).join('');
  return o;
};

/* ═══════════════ XẾP HẠNG TÀI LIỆU 1–100 ═══════════════ */
G.VIEWS['hang-tai-lieu'] = function(){
  if(!G.can('pro_consult')) return U.lockCard();
  var H = G.HANG_TL, toi = G.S.roleObj;
  var kpiToi = 88;   /* thay bằng KPI thật của tài khoản khi nối máy chủ */
  var o = U.ph({eyebrow:'NHÓM 05 · QUẢN TRỊ', ic:'crown', grad:1, t:'Xếp hạng tài liệu',
    lead:H.cot});

  o += '<div class="card glow mb"><div class="row wrap" style="gap:24px;align-items:center">'+
    U.ring(kpiToi, 'var(--gita)', 'KPI CỦA TÔI')+
    '<div class="grow" style="min-width:250px">'+
    '<div class="up muted">VAI VÀ CẤP ĐANG GIỮ</div>'+
    '<b style="font-size:18px;display:block;margin:3px 0 6px;color:'+toi.c+'">'+h(toi.n)+' · cấp '+toi.lv+'</b>'+
    '<p class="sm dim">Với cấp '+toi.lv+' và KPI '+kpiToi+'%, anh chị đang mở được <b style="color:var(--gold-ink)">'+
    H.bac.filter(function(b){return toi.lv<=b.lv && kpiToi>=b.kpi;}).length+' / '+H.bac.length+' bậc tài liệu</b>. '+
    'Lên bậc nghề hoặc nâng KPI là mở thêm — không có đường tắt nào khác.</p></div></div></div>';

  o += U.sec('SÁU BẬC TÀI LIỆU','Điểm càng cao, điều kiện nhận càng chặt');
  o += H.bac.map(function(b){
    var mo = toi.lv <= b.lv && kpiToi >= b.kpi;
    return '<div class="card mb '+(mo?'':'')+'" style="border-color:'+b.c+(mo?'55':'1a')+';'+(mo?'':'opacity:.72')+'">'+
      '<div class="row wrap" style="gap:11px;margin-bottom:10px">'+
      '<span class="pill" style="background:'+b.c+'22;color:'+b.c+'">'+b.tu+' – '+b.den+' ĐIỂM</span>'+
      '<b style="font-size:16px;color:'+b.c+'">'+h(b.ten)+'</b>'+
      '<span class="grow"></span>'+
      (mo ? '<span class="chip on">'+ic('check','w-3 h-3')+' đang mở</span>'
          : '<span class="chip">'+ic('lock','w-3 h-3')+' chưa đủ điều kiện</span>')+'</div>'+
      '<p class="sm dim" style="line-height:1.6;margin-bottom:11px">'+h(b.mo)+'</p>'+
      '<div class="grid g2" style="gap:12px;margin-bottom:11px">'+
        '<div style="padding:11px 13px;border-radius:12px;background:var(--phu-2)">'+
        '<span class="tiny up muted">ĐIỀU KIỆN CẤP BẬC</span>'+
        '<p class="sm mt">Cấp '+b.lv+' trở lên'+(toi.lv<=b.lv?' <span style="color:var(--ok)">✓ đạt</span>':' <span style="color:var(--bad)">✕ chưa đạt</span>')+'</p></div>'+
        '<div style="padding:11px 13px;border-radius:12px;background:var(--phu-2)">'+
        '<span class="tiny up muted">ĐIỀU KIỆN KPI</span>'+
        '<p class="sm mt">Từ '+b.kpi+'% trở lên'+(kpiToi>=b.kpi?' <span style="color:var(--ok)">✓ đạt</span>':' <span style="color:var(--bad)">✕ chưa đạt</span>')+'</p></div>'+
      '</div>'+
      '<div class="row wrap" style="gap:5px">'+b.vd.map(function(x){return U.chip(x, mo?b.c:null);}).join('')+'</div></div>';
  }).join('');

  o += U.sec('MƯỜI TÀI LIỆU TIÊU BIỂU','Sắp theo điểm — cùng một vai, người cấp cao hơn nhận tài liệu hay hơn');
  o += U.tbl(['Mã','Tài liệu','Điểm','Bậc','Cấp cần','KPI cần','Với anh chị'],
    H.vd.map(function(t){
      var b = H.bac.filter(function(x){return t.diem>=x.tu && t.diem<=x.den;})[0] || H.bac[0];
      var mo = toi.lv <= t.lv && kpiToi >= t.kpi;
      return ['<span class="mono sm">'+h(t.ma)+'</span>',
        '<span class="sm">'+h(t.ten)+'</span>',
        '<b class="mono" style="color:'+b.c+'">'+t.diem+'</b>',
        U.chip(t.hang, b.c),
        '<span class="mono sm">'+t.lv+'</span>',
        '<span class="mono sm">'+t.kpi+'%</span>',
        mo?'<span class="chip on">đang mở</span>':'<span class="chip">'+ic('lock','w-3 h-3')+'</span>'];
    }));

  o += '<div class="card mt2" style="border-color:var(--gita-vien-1)">'+
    '<div class="row mb"><span style="color:var(--gold-ink)">'+ic('shield','w-4 h-4')+'</span><b>Luật L5 — thăng cấp mới mở tài liệu tương ứng</b></div>'+
    '<p class="sm muted">'+h(G.LUAT_TK[4].viSao)+' '+h(G.LUAT_TK[4].canhBao)+'</p></div>';
  return o;
};

/* ═══════════════ MẬT MÃ KÍN ═══════════════ */
G.VIEWS['dau-mat'] = function(){
  if(!G.can('pro_approve')) return U.lockCard();
  var D = G.DAU_MAT;
  var o = U.ph({eyebrow:'NHÓM 05 · QUẢN TRỊ', ic:'shield', grad:1, t:'Mật mã kín trên tài liệu',
    lead:D.cot});

  o += '<div class="card mb" style="border-color:var(--gita-vien-1)">'+
    '<div class="row"><span style="color:var(--gold-ink)">'+ic('lock','w-4 h-4')+'</span><b>Cấu trúc mã</b></div>'+
    '<p class="mono mt" style="font-size:16px;color:var(--gold-2);letter-spacing:.04em">'+h(D.cauTruc)+'</p></div>';

  o += U.sec('NĂM LỚP MÃ','Xoá được lớp này vẫn còn lớp kia — muốn xoá sạch phải gõ lại toàn bộ tài liệu');
  o += '<div class="grid g2">' + D.lop.map(function(l,i){
    return '<div class="card pad-sm" style="border-color:'+l.c+'26">'+
      '<div class="row" style="gap:9px;margin-bottom:6px">'+
      '<span class="pill" style="background:'+l.c+'22;color:'+l.c+'">LỚP '+(i+1)+'</span>'+
      '<b class="sm">'+h(l.t)+'</b></div>'+
      '<p class="tiny muted" style="line-height:1.6">'+h(l.d)+'</p></div>';
  }).join('') + '</div>';

  o += U.sec('QUÉT MỘT ĐOẠN VĂN','Dán đoạn nghi ngờ vào đây — hệ thống dò cả ba lớp mã và trả về tài khoản đã nhận bản đó');
  o += '<div class="card">'+
    '<textarea id="quetVan" rows="5" placeholder="Dán đoạn văn bản nghi ngờ bị rò ra ngoài…" '+
    'style="width:100%;background:var(--phu-2);border:1px solid var(--line);border-radius:12px;'+
    'padding:12px;font-size:14.5px;line-height:1.6;resize:vertical;outline:none"></textarea>'+
    '<button class="btn pri mt" data-act="quet-dau">'+ic('search')+'Quét mật mã kín</button>'+
    '<div id="quetKQ" class="mt2"></div>'+
    '<p class="tiny muted mt">'+h(D.quet)+'</p></div>';

  o += U.sec('BẢN ĐÃ CẤP GẦN ĐÂY','Mỗi bản một mã riêng, truy được về đúng người và đúng giờ');
  o += U.tbl(['Mã bản','Tài liệu','Người nhận','Lúc cấp'], D.mau.map(function(m){
    return ['<span class="mono sm" style="color:var(--gold-ink)">'+h(m.ma)+'</span>',
      '<span class="sm">'+h(m.tl)+'</span>','<span class="sm">'+h(m.ai)+'</span>',
      '<span class="mono tiny muted">'+h(m.luc)+'</span>'];
  }));
  return o;
};

/* ═══════════════ DÒNG CHẢY THÔNG TIN ═══════════════ */
G.VIEWS['dong-chay'] = function(){
  if(!G.can('pro_report')) return U.lockCard();
  var Q = G.QUYTRINH;
  var o = U.ph({eyebrow:'NHÓM 05 · QUẢN TRỊ', ic:'orbit', grad:1, t:'Dòng chảy thông tin',
    lead:Q.cot});

  o += Q.dong.map(function(d){
    return '<div class="card lift mb" style="border-color:'+d.c+'2e">'+
      '<div class="row wrap" style="gap:11px;margin-bottom:12px">'+
      '<span style="width:36px;height:36px;border-radius:12px;display:grid;place-items:center;font-weight:900;'+
      'background:'+d.c+'22;color:'+d.c+'">'+d.no+'</span>'+
      '<b style="font-size:16px;color:'+d.c+'">'+h(d.ten)+'</b></div>'+
      '<div class="row wrap" style="gap:10px;align-items:center;margin-bottom:12px">'+
        '<div style="flex:1;min-width:150px;padding:11px 13px;border-radius:12px;background:var(--phu-2)">'+
        '<span class="tiny up muted">TỪ</span><p class="sm mt">'+h(d.tu)+'</p></div>'+
        '<span style="color:'+d.c+'">'+ic('arrow','w-4 h-4')+'</span>'+
        '<div style="flex:1.4;min-width:180px"><div class="row wrap" style="gap:5px">'+
        d.qua.map(function(x){return U.chip(x,d.c);}).join('')+'</div></div>'+
        '<span style="color:'+d.c+'">'+ic('arrow','w-4 h-4')+'</span>'+
        '<div style="flex:1;min-width:150px;padding:11px 13px;border-radius:12px;background:'+d.c+'12">'+
        '<span class="tiny up" style="color:'+d.c+'">ĐẾN</span><p class="sm mt">'+h(d.den)+'</p></div>'+
      '</div>'+
      '<div class="grid g2" style="gap:12px">'+
        '<div><span class="tiny up muted">ĐO BẰNG GÌ</span><p class="sm mt" style="line-height:1.55">'+h(d.do)+'</p></div>'+
        '<div style="padding:11px 13px;border-radius:12px;background:rgba(248,113,113,.06);border:1px solid rgba(248,113,113,.2)">'+
        '<span class="tiny up" style="color:var(--bad)">TẮC KHI NÀO</span>'+
        '<p class="sm mt" style="line-height:1.55">'+h(d.tac)+'</p></div>'+
      '</div></div>';
  }).join('');

  o += U.sec('VÒNG QUẢN TRỊ','Ai nhìn gì, theo nhịp nào — ban lãnh đạo không phải đọc từng màn hình');
  o += U.tbl(['Nhịp','Việc rà soát','Người chịu trách nhiệm'], Q.vongQuanTri.map(function(v){
    return ['<b class="sm">'+h(v.ky)+'</b>','<span class="sm">'+h(v.viec)+'</span>',
      '<span class="chip">'+h(v.ai)+'</span>'];
  }));
  return o;
};
})();
