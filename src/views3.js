/* ═══════════════════════════════════════════════════════════════
   GITA 365 · v7.0 — MÀN HÌNH · NHÓM 05 HỆ SINH THÁI & VẬN HÀNH
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;
G.VIEWS = G.VIEWS || {};
(function(){
var U = G.U, h = U.h, ic = U.ic;

/* ═══════════════ 05 · VỆ TINH CỦA TÔI ═══════════════ */
G.VIEWS['ve-tinh'] = function(){
  var o = U.ph({eyebrow:'NHÓM 05 · HỆ SINH THÁI', ic:'orbit', grad:1, t:'Vệ tinh của tôi',
    lead:'Quanh một gia đình đang lớn lên phải có những gia đình khác cũng đang lớn lên. Đây là bản đồ những người tuyệt vời quanh nhà mình.'});

  o += '<div class="grid g4 mb">'+
    U.stat({k:'NHÀ TRONG VỆ TINH', v:'9', d:'nhà biết tới GITA từ chuyện của mình', c:'#0B7350'})+
    U.stat({k:'ĐÃ BƯỚC VÀO HÀNH TRÌNH', v:'6', d:'4 nhà đang ở Tầng 2 trở lên', c:'#185AB4'})+
    U.stat({k:'BUỔI NGỒI CÙNG', v:'23', d:'trong 90 ngày gần nhất', c:'#5140B4'})+
    U.stat({k:'CÂU CHUYỆN ĐÃ KỂ', v:'14', d:'kể cả chỗ mình vấp', c:'#BE0E16'})+
  '</div>';

  /* Vòng quỹ đạo */
  o += '<div class="card" style="padding:34px 22px"><div style="position:relative;height:420px;max-width:640px;margin:0 auto">'+
    '<div style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:150px;height:150px;'+
    'border-radius:50%;display:grid;place-items:center;text-align:center;'+
    'background:radial-gradient(circle,var(--gita-mo-3),var(--gita-mo-1));'+
    'border:1px solid var(--gita-vien-2);box-shadow:0 0 70px -14px var(--gita-day)">'+
    '<div><div class="tiny up" style="color:var(--gold-ink)">TRUNG TÂM</div>'+
    '<b style="font-size:16px;display:block;margin-top:3px">'+h(G.myFamily().nha)+'</b>'+
    '<span class="tiny muted">'+h(G.S.acc.ten)+'</span></div></div>'+
    [1,2].map(function(r){
      var size = r===1?270:400;
      return '<div style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:'+size+'px;height:'+size+'px;'+
        'border-radius:50%;border:1px dashed var(--phu-5)"></div>';
    }).join('') +
    G.dsHet(G.dsNha(),9).map(function(f,i){
      var inner = i<4, R = inner?135:200, n = inner?4:5, k = inner?i:i-4;
      var ang = (k/n)*Math.PI*2 - Math.PI/2;
      var t = G.tierOf(f.tier);
      return '<button data-sat="'+h(f.id)+'" style="position:absolute;left:calc(50% + '+(Math.cos(ang)*R).toFixed(0)+'px);'+
        'top:calc(50% + '+(Math.sin(ang)*R).toFixed(0)+'px);transform:translate(-50%,-50%);'+
        'width:66px;height:66px;border-radius:50%;display:grid;place-items:center;text-align:center;'+
        'background:'+t.c+'1f;border:1px solid '+t.c+'55;color:'+t.c+';transition:.25s;cursor:pointer">'+
        '<div><b style="font-size:10.5px;display:block;line-height:1.15">'+h(f.nha.replace('Nhà ',''))+'</b>'+
        '<span style="font-size:10.5px;opacity:.8">'+h(t.code)+'</span></div></button>';
    }).join('') + '</div>'+
    '<p class="tiny muted center mt2">Bấm vào một vệ tinh để xem nhà đó đang ở đâu trên hành trình</p></div>';

  o += U.sec('KHÔNG THƯỞNG CHO LƯỢT CHỐT','Ghi nhận việc đã làm, không xếp hạng con của ai');
  o += '<div class="card"><p class="sm dim" style="line-height:1.7">'+
    h((G.DAISU.gioiThieu && G.DAISU.gioiThieu.trietLy) || '')+'</p></div>';
  return o;
};

/* ═══════════════ 05 · ĐẠI SỨ GITA 365 ═══════════════ */
G.VIEWS['dai-su'] = function(){
  var D = G.DAISU;
  var o = U.ph({eyebrow:'NHÓM 05 · HỆ SINH THÁI', ic:'share', grad:1, t:'Đại sứ GITA 365',
    lead:(D.gioiThieu && D.gioiThieu.trietLy) || 'Đại sứ GITA không phải người quảng cáo. Đại sứ là người đã đi qua một chặng thật của nhà mình và kể lại chặng đó bằng lời của chính mình.'});

  o += U.sec('BỐN CẤP ĐẠI SỨ','Lên cấp bằng việc đã làm, không bằng số người đã mời');
  o += '<div class="grid g4">' + D.capDo.map(function(c,i){
    var col = ['#2A72C6','#5140B4','var(--gita)','#0B7350'][i];
    return '<div class="card lift" style="border-color:'+col+'2e">'+
      '<div class="row" style="gap:8px;margin-bottom:8px">'+
      '<span style="width:32px;height:32px;border-radius:10px;display:grid;place-items:center;font-weight:900;background:'+col+'22;color:'+col+'">'+c.cap+'</span>'+
      '</div><b class="sm" style="display:block;line-height:1.35;margin-bottom:8px;color:'+col+'">'+h(c.ten)+'</b>'+
      '<div class="tiny up muted mb">ĐIỀU KIỆN</div>'+
      '<p class="tiny muted" style="line-height:1.55">'+h(G.chuHet(c.dieuKien||'',190))+'</p>'+
      (c.quyenLoi?'<button class="btn ghost sm mt" data-dscap="'+i+'" style="width:100%">Xem quyền lợi</button>':'')+
      '</div>';
  }).join('') + '</div>';

  o += U.sec('HAI MƯƠI NHIỆM VỤ','Mỗi nhiệm vụ là một câu chuyện thật, không phải một bài quảng cáo');
  o += '<div class="grid g-auto">' + D.nhiemVu.map(function(n){
    var col = ['#2A72C6','#5140B4','var(--gita)','#0B7350'][(n.capDo||1)-1];
    return '<div class="card pad-sm lift" style="border-color:'+col+'22">'+
      '<div class="row wrap" style="gap:5px;margin-bottom:7px">'+U.chip(n.ma,col)+U.chip('Cấp '+n.capDo)+
      (n.audience?U.chip(n.audience==='HS'?'Học viên':'Phụ huynh'):'')+'</div>'+
      '<b class="sm" style="display:block;line-height:1.4;margin-bottom:6px">'+h(n.ten)+'</b>'+
      '<p class="tiny muted" style="line-height:1.55">'+h(G.chuHet(n.mucTieu||'',120))+'</p></div>';
  }).join('') + '</div>';

  if(D.quyTac && D.quyTac.muc){
    o += U.sec('MƯỜI BA QUY TẮC AN TOÀN', D.quyTac.ten);
    o += '<div class="card">' + D.quyTac.muc.map(function(q,i){
      return '<div class="rule"><span class="n">'+(i+1)+'</span><div class="tx"><b>'+h(q.quyTac)+'</b>'+
        '<p>'+h(G.chuHet(q.vi||'',200))+'</p></div></div>';
    }).join('') + '</div>';
  }
  return o;
};

/* ═══════════════ 05 · SỰ KIỆN & LỬA TRẠI ═══════════════ */
G.VIEWS['su-kien'] = function(){
  var o = U.ph({eyebrow:'NHÓM 05 · HỆ SINH THÁI', ic:'calendar', t:'Sự kiện & Lửa trại',
    lead:'Nơi cả hệ sinh thái gặp nhau. Một gia đình đi một mình thì đi nhanh; đi giữa những gia đình cùng đường thì đi được hết năm.'});
  o += '<div class="grid g2">' + G.SUKIEN.map(function(e){
    var pct = Math.round(e.dat/e.ghe*100);
    return '<div class="card lift" style="border-color:'+e.c+'2e">'+
      '<div class="row wrap" style="gap:7px;margin-bottom:9px">'+U.chip(e.ngay,e.c)+U.chip(e.loai)+'</div>'+
      '<b style="font-size:16px;display:block;margin-bottom:8px;color:'+e.c+'">'+h(e.ten)+'</b>'+
      '<p class="sm dim" style="line-height:1.65;margin-bottom:12px">'+h(e.hua)+'</p>'+
      '<div class="row" style="gap:9px;margin-bottom:7px"><span class="tiny muted">Chủ trì</span>'+
        '<b class="sm">'+h(e.chu)+'</b><span class="grow"></span>'+
        '<span class="mono tiny" style="color:'+e.c+'">'+e.dat+'/'+e.ghe+' ghế</span></div>'+
      U.bar(pct,e.c)+
      '<button class="btn pri blk mt2" data-act="join-event" data-ma="'+h(e.ten)+'">Giữ chỗ cho nhà mình</button></div>';
  }).join('') + '</div>';
  return o;
};

/* ═══════════════ 05 · BUỒNG LÁI COACH ═══════════════ */
G.VIEWS['coach-deck'] = function(){
  if(!G.can('pro_coach')) return U.lockCard();
  var alert = G.dsNha().filter(function(f){return f.band==='DO'||f.band==='CAM';});
  var o = U.ph({eyebrow:'NHÓM 05 · VẬN HÀNH', ic:'flame', grad:1, t:'Buồng lái Coach',
    lead:'Mỗi buổi anh chị bước vào là một gia đình đổi hướng. Đây là nơi thấy rõ nên chạm vào đâu trước — và chạm bằng gì.'});

  o += '<div class="grid g4 mb">'+
    U.stat({k:'GIA ĐÌNH PHỤ TRÁCH', v:G.dsNha().length, d:'trải năm tầng', c:'#5140B4'})+
    U.stat({k:'CẦN CHẠM TRONG 48 GIỜ', v:alert.length, d:'băng CAM và ĐỎ', c:'#BE0E16'})+
    U.stat({k:'CỔNG SẮP MỞ', v:'3', d:'chuẩn bị bằng chứng trước', c:'#0B7350'})+
    U.stat({k:'GIỜ ĐỒNG HÀNH THÁNG', v:'186', d:'tỉ lệ nghe 7 khuyên 3', c:'#185AB4'})+
  '</div>';

  o += U.sec('CẦN CHẠM TRƯỚC','Xếp theo băng, không theo thứ tự bảng chữ cái');
  o += G.famTable(G.dsNha().slice().sort(function(a,b){
    var r = {DO:0,CAM:1,VANG:2,XANH:3}; return r[a.band]-r[b.band];
  }));

  o += U.sec('VIỆC CỦA HÔM NAY','Bốn việc, không nhiều hơn');
  o += '<div class="grid g2">' + G.TODAY.coach.map(function(t,i){
    return '<div class="card pad-sm"><div class="row" style="gap:9px;margin-bottom:5px">'+
      '<span class="pill" style="background:rgba(139,92,246,.18);color:var(--i)">'+(i+1)+'</span>'+
      '<b class="sm">'+h(t.t)+'</b></div><p class="tiny muted">'+h(t.s)+'</p></div>';
  }).join('') + '</div>';

  o += U.sec('TÁM VIỆC BĂNG NỀN','Chạy dưới cả năm khoang, từ ngày đầu tới ngày cuối');
  o += '<div class="grid g4">' + G.VANHANH.bangNen.viec.map(function(v){
    return '<div class="card pad-sm"><div class="row" style="gap:7px;margin-bottom:5px">'+
      '<span class="mono b tiny" style="color:var(--gold-ink)">0'+v.no+'</span><b class="sm">'+h(v.ten)+'</b></div>'+
      '<p class="tiny muted" style="line-height:1.5">'+h(v.khi)+'</p></div>';
  }).join('') + '</div>';
  return o;
};

/* ═══════════════ 05 · KHOANG MỞ CỬA (TƯ VẤN) ═══════════════ */
G.VIEWS['tuvan-deck'] = function(){
  if(!G.can('pro_consult')) return U.lockCard();
  var o = U.ph({eyebrow:'NHÓM 05 · VẬN HÀNH', ic:'compass', grad:1, t:'Khoang mở cửa',
    lead:'Người đối diện chưa cần nghe mình giỏi thế nào. Họ cần thấy nhà mình trong tấm bản đồ này — rồi tự quyết định.'});

  o += '<div class="grid g4 mb">'+
    U.stat({k:'ĐANG CHỜ PHIÊN MỞ CỬA', v:'3', d:'nhà mới trong tuần', c:'#BE0E16'})+
    U.stat({k:'ĐÃ MỞ CỬA QUÝ NÀY', v:'14', d:'gia đình bước vào Tầng 1', c:'#0B7350'})+
    U.stat({k:'TỪ GIỚI THIỆU', v:'78%', d:'không từ quảng cáo', c:'#BE0E16'})+
    U.stat({k:'MỨC HÀI LÒNG PHIÊN ĐẦU', v:'95', d:'điểm chạm DC-03 được lắng nghe', c:'#5140B4'})+
  '</div>';

  o += U.sec('SÁU NHỊP CHO PHIÊN MỞ CỬA','Đi đúng thứ tự — nhảy sang nhịp năm khi chưa qua nhịp ba là mất người');
  o += '<div class="grid g3">' + G.NGONTU.map(function(n,i){
    return '<button class="card lift" data-go="ngon-tu" style="text-align:left;border-color:'+n.c+'2a">'+
      '<div class="row" style="gap:8px;margin-bottom:7px">'+
      '<span style="width:28px;height:28px;border-radius:9px;display:grid;place-items:center;font-weight:900;font-size:12.5px;background:'+n.c+'22;color:'+n.c+'">'+(i+1)+'</span>'+
      '<b class="sm">'+h(n.ten)+'</b></div>'+
      '<p class="tiny muted" style="line-height:1.55">'+h(n.muc)+'</p>'+
      '<p class="tiny mt" style="color:'+n.c+'">'+h(n.ky)+'</p></button>';
  }).join('') + '</div>';

  o += U.sec('BA ĐOẠN THOẠI CẦN THUỘC','Mở để đọc từng câu kèm chú thích kỹ thuật');
  o += '<div class="grid g3">' + G.MAUTHOAI.map(function(m){
    return '<button class="card lift" data-go="ngon-tu" style="text-align:left;border-color:'+m.c+'2a">'+
      U.chip(m.ma,m.c)+'<b class="sm" style="display:block;margin:8px 0 6px;line-height:1.4">'+h(m.ten)+'</b>'+
      '<p class="tiny muted" style="line-height:1.55">'+h(m.boi)+'</p></button>';
  }).join('') + '</div>';

  o += U.sec('VIỆC CỦA HÔM NAY','');
  o += '<div class="grid g3">' + G.TODAY.tuvan.map(function(t,i){
    return '<div class="card pad-sm"><b class="sm" style="display:block;margin-bottom:4px">'+h(t.t)+'</b>'+
      '<p class="tiny muted">'+h(t.s)+'</p></div>';
  }).join('') + '</div>';
  return o;
};

/* ═══════════════ 05 · ĐỘI NGŨ DẪN DẮT ═══════════════ */
G.VIEWS['doi-ngu'] = function(){
  if(!G.can('pro_consult')) return U.lockCard();
  var o = U.ph({eyebrow:'NHÓM 05 · VẬN HÀNH', ic:'users', t:'Đội ngũ dẫn dắt',
    lead:'Ai đang giữ lửa cho những nhà nào. Chỉ số của đội ngũ là chuẩn nghề và mức giữ nhịp — không phải doanh số.'});
  o += U.tbl(['Người','Vai','Nhà phụ trách','Giờ đồng hành / tháng','Chuẩn nghề','Ghi chú'],
    G.TEAM.map(function(t){
      var r = G.roleById(t.role);
      return ['<b>'+h(t.ten)+'</b>',
        U.chip(r.short, r.c),
        t.nha ? '<span class="mono">'+t.nha+'</span>' : '<span class="muted">—</span>',
        t.gio ? '<span class="mono">'+t.gio+'h</span>' : '<span class="muted">—</span>',
        '<div style="min-width:96px">'+U.bar(t.diem,'#0B7350')+'<span class="tiny mono muted">'+t.diem+'/100</span></div>',
        '<span class="tiny muted">'+h(t.note)+'</span>'];
    }));
  return o;
};

/* ═══════════════ 05 · TRUNG TÂM ĐIỀU HÀNH ═══════════════ */
G.VIEWS['dieu-hanh'] = function(){
  if(!G.can('pro_report')) return U.lockCard();
  var H = G.HEALTH;
  var o = U.ph({eyebrow:'NHÓM 05 · VẬN HÀNH', ic:'shield', grad:1, t:'Trung tâm điều hành',
    lead:'Toàn cảnh sức khoẻ hệ sinh thái. Số ở đây để ra quyết định phân bổ nguồn lực — không bao giờ để xếp hạng gia đình.'});

  o += '<div class="grid g4 mb">'+
    U.stat({k:'GIA ĐÌNH ĐỒNG HÀNH', v:H.giaDinh.v.toLocaleString('vi-VN'), d:H.giaDinh.d, c:'#185AB4'})+
    U.stat({k:'ĐANG GIỮ NHỊP', v:H.dangHoatDong.v.toLocaleString('vi-VN'), d:H.dangHoatDong.d, c:'#0B7350'})+
    U.stat({k:'CẦN CHẠM 48 GIỜ', v:H.canhBao.v, d:H.canhBao.d, c:'#BE0E16'})+
    U.stat({k:'CỔNG ĐÃ QUA / QUÝ', v:H.cuaNghiemThu.v, d:H.cuaNghiemThu.d, c:'#5140B4'})+
  '</div>';
  o += '<div class="grid g4 mb">'+
    U.stat({k:'COACH ĐANG HOẠT ĐỘNG', v:H.coach.v, d:H.coach.d, c:'#0B6675'})+
    U.stat({k:'ĐẠI SỨ', v:H.daiSu.v, d:H.daiSu.d, c:'#F61824'})+
    U.stat({k:'LƯỢT MỞ KỊCH BẢN', v:H.kichBanDung.v.toLocaleString('vi-VN'), d:H.kichBanDung.d, c:'#185AB4'})+
    U.stat({k:'DOANH THU QUÝ', v:H.doanhThu.v, d:H.doanhThu.d, c:'#BE0E16'})+
  '</div>';

  o += '<div class="grid g2">'+
    '<div class="card"><div class="up mb" style="color:var(--ink-4)">PHÂN BỐ THEO TẦNG</div>'+
    H.theoTang.map(function(t){
      var tt = G.TIERS.filter(function(x){return x.code===t.t;})[0];
      return '<div style="margin-bottom:11px"><div class="row" style="margin-bottom:4px">'+
        '<span class="sm b" style="color:'+tt.c+'">'+t.t+' · '+h(tt.name)+'</span>'+
        '<span class="grow"></span><span class="mono sm">'+t.n+'</span></div>'+
        U.bar(t.n/400*100, tt.c)+'</div>';
    }).join('') + '</div>'+
    '<div class="card"><div class="up mb" style="color:var(--ink-4)">BĂNG SỨC KHOẺ GIA ĐÌNH</div>'+
    H.band.map(function(b){
      return '<div style="margin-bottom:11px"><div class="row" style="margin-bottom:4px">'+
        U.dot(b.c)+'<span class="sm b" style="color:'+b.c+'">'+h(b.k)+'</span>'+
        '<span class="grow"></span><span class="mono sm">'+b.n+' nhà</span></div>'+
        U.bar(b.n/800*100, b.c)+'</div>';
    }).join('') +
    '<p class="tiny muted mt2">Băng là công cụ phân bổ chạm, không phải nhãn dán lên gia đình.</p></div>'+
  '</div>';

  o += U.sec('SÁU THÁNG GẦN NHẤT','Số nhà đồng hành và tỉ lệ giữ nhịp tuần');
  o += '<div class="card"><div style="display:flex;align-items:flex-end;gap:16px;height:200px">'+
    H.thang.map(function(m){
      return '<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:7px;height:100%;justify-content:flex-end">'+
        '<b class="mono tiny" style="color:var(--gold-ink)">'+m.nha+'</b>'+
        '<div style="width:100%;max-width:56px;height:'+Math.round(m.nha/1300*100)+'%;border-radius:9px 9px 3px 3px;'+
        'background:linear-gradient(180deg,var(--gita),var(--gita-do))"></div>'+
        '<span class="tiny muted">'+h(m.m)+'</span>'+
        '<span class="tiny mono" style="color:var(--ok)">'+m.giu+'%</span></div>';
    }).join('') + '</div></div>';

  o += U.sec('VIỆC CỦA QUẢN TRỊ HÔM NAY','');
  o += '<div class="grid g2">' + G.TODAY.admin.map(function(t){
    return '<div class="card pad-sm"><b class="sm" style="display:block;margin-bottom:4px">'+h(t.t)+'</b>'+
      '<p class="tiny muted">'+h(t.s)+'</p></div>';
  }).join('') + '</div>';
  return o;
};

/* ═══════════════ 05 · QUẢN TRỊ CON NGƯỜI ═══════════════ */
G.VIEWS['nguoi-dung'] = function(){
  if(!G.can('sys_manage_user')) return U.lockCard();
  var o = U.ph({eyebrow:'NHÓM 05 · VẬN HÀNH', ic:'lock', t:'Quản trị con người',
    lead:'Mười lăm vai, một nguồn sự thật duy nhất cho phân quyền. Cấp càng nhỏ càng nhiều quyền — và mọi thao tác ghi đều được máy chủ kiểm lại.'});

  o += U.sec('MƯỜI LĂM VAI TRONG HỆ THỐNG','Bấm một vai để xem đúng những gì vai đó nhìn thấy');
  o += '<div class="grid g3">' + G.ROLES.map(function(r){
    var cur = r.id===G.S.role;
    return '<div class="card '+(cur?'glow':'')+'" style="border-color:'+r.c+(cur?'66':'22')+'">'+
      '<div class="row" style="gap:10px;margin-bottom:7px">'+
      '<span style="width:34px;height:34px;border-radius:10px;display:grid;place-items:center;font-weight:900;font-size:12.5px;background:'+r.c+'22;color:'+r.c+'">'+h(r.id)+'</span>'+
      '<div class="grow"><b class="sm" style="display:block">'+h(r.n)+'</b>'+
      '<span class="tiny muted">Cấp '+r.lv+' · cổng '+h(r.portal)+'</span></div>'+
      (cur?U.chip('ĐANG DÙNG','var(--gita)',1):'')+'</div>'+
      '<p class="tiny muted" style="line-height:1.55;margin-bottom:9px">'+h(r.ln)+'</p>'+
      '<button class="btn ghost sm" data-switch="'+h(r.id)+'" style="width:100%">Xem hệ thống bằng vai này</button></div>';
  }).join('') + '</div>';

  o += U.sec('BẢNG PHÂN QUYỀN','Quyền → cấp bậc tối đa được phép dùng. Client chỉ ẩn/hiện nút; máy chủ luôn kiểm lại trước khi ghi.');
  var perms = Object.keys(G.PERM);
  o += U.tbl(['Quyền','Cấp tối đa','Vai được dùng','Vai hiện tại'],
    perms.map(function(p){
      var lv = G.PERM[p], ok = G.can(p);
      var roles = G.ROLES.filter(function(r){return r.lv<=lv;});
      return ['<span class="mono sm">'+h(p)+'</span>',
        '<span class="mono">'+lv+'</span>',
        '<span class="tiny muted">'+h(roles.map(function(r){return r.short;}).slice(0,4).join(', '))+
          (roles.length>4?' +'+(roles.length-4):'')+'</span>',
        ok?'<span class="chip on">được dùng</span>':'<span class="chip">ngoài phạm vi</span>'];
    }));

  o += U.sec('TÀI KHOẢN TRẢI NGHIỆM','Dùng để kiểm tra mức hiện diện của từng vị trí — không phải hệ thống xác thực thật');
  o += U.tbl(['Vị trí','Tài khoản','Mật khẩu','Người'],
    G.ACCOUNTS.map(function(a){
      var r = G.roleById(a.role);
      return [U.chip(r.n, r.c), '<span class="mono sm">'+h(a.u)+'</span>',
        '<span class="mono sm" style="color:var(--gold-ink)">'+h(a.p)+'</span>',
        '<span class="sm">'+h(a.ten)+'</span><div class="tiny muted">'+h(a.nha)+'</div>'];
    }));
  return o;
};

/* ═══════════════ 05 · KIỂM DUYỆT ═══════════════ */
G.VIEWS['kiem-duyet'] = function(){
  if(!G.can('pro_approve')) return U.lockCard();
  var o = U.ph({eyebrow:'NHÓM 05 · VẬN HÀNH', ic:'check', t:'Kiểm duyệt kho báu vật',
    lead:'Chuẩn nghề trước khi xuất bản. Một bài vi phạm quy tắc an toàn hình ảnh trẻ em bị chặn, không phải bị nhắc nhở.'});
  var mau = {'Chờ duyệt':'#BE0E16','Cần sửa':'#BE0E16','Đã duyệt':'#0B7350','Chờ xác nhận':'#5140B4'};
  o += U.tbl(['Mã','Loại','Người gửi','Ngày','Trạng thái','Ghi chú chuyên môn'],
    G.DUYET.map(function(d){
      return ['<span class="mono sm">'+h(d.ma)+'</span>', '<span class="sm">'+h(d.loai)+'</span>',
        '<span class="sm">'+h(d.nguoi)+'</span>', '<span class="mono sm">'+h(d.ngay)+'</span>',
        U.chip(d.trang, mau[d.trang]||'#665E88'),
        '<span class="tiny muted">'+h(d.note)+'</span>'];
    }));
  o += U.sec('SÁU ĐIỂM CHƯA XÁC NHẬN CỦA KHO MÔ THỨC','Bản chép từ chữ viết tay — trợ lý AI bị chặn không được khẳng định những chỗ này');
  o += '<div class="card">' + [
    'MT-01 — thứ tự bước B5 và B6 có chỗ chồng lấn',
    'MT-04 — quy trình ghi là 8+2 bước, hai bước cộng thêm chưa đọc rõ',
    'MT-07 — tên hai hình mẫu người Việt trên bản vẽ',
    'MT-11 — cụm 4 + 4 = 8 chưa rõ nghĩa đầy đủ',
    'MT-24 — công thức ghi là POSERS nhưng liệt kê bắt đầu bằng S (Size)',
    'SODO-01 — cụm 3 an, viết tắt CC–DC, và số phễu lọc ghi 4 nhưng liệt kê 5 mục'
  ].map(function(x,i){
    return '<div class="rule"><span class="n" style="background:rgba(251,146,60,.16);color:var(--alert)">'+(i+1)+'</span>'+
      '<div class="tx"><b>'+h(x)+'</b></div></div>';
  }).join('') + '<p class="tiny muted mt">Chủ hệ thống xác nhận sáu điểm này thì kho được sửa và gỡ cờ chưa chắc chắn.</p></div>';
  return o;
};

/* ═══════════════ 05 · TÀI CHÍNH & TĂNG TRƯỞNG ═══════════════ */
G.VIEWS['tang-truong'] = function(){
  if(!G.can('fin_view')) return U.lockCard();
  var o = U.ph({eyebrow:'NHÓM 05 · VẬN HÀNH', ic:'chart', t:'Tài chính & tăng trưởng',
    lead:'Dòng tiền tồn tại để nuôi được sứ mệnh, không phải ngược lại. Bảy mươi tám phần trăm doanh thu đến từ giới thiệu — đó là chỉ số chất lượng thật.'});
  o += '<div class="grid g4 mb">'+
    U.stat({k:'DOANH THU QUÝ', v:'6,84 tỷ', d:'+18% so với quý trước', c:'#185AB4'})+
    U.stat({k:'TỪ GIỚI THIỆU', v:'78%', d:'không chi cho quảng cáo tìm khách', c:'#0B7350'})+
    U.stat({k:'CHI PHÍ MỖI GIA ĐÌNH MỚI', v:'1,4 tr', d:'giảm 34% nhờ vệ tinh đại sứ', c:'#5140B4'})+
    U.stat({k:'GIỮ CHÂN 12 THÁNG', v:'89,3%', d:'chỉ số sống còn của mô hình', c:'#0B6675'})+
  '</div>';
  o += U.tbl(['Nguồn','Số gia đình','Tỉ trọng','Ghi chú'], [
    ['Giới thiệu từ gia đình đang học','<span class="mono">742</span>','<div style="min-width:120px">'+U.bar(58,'#0B7350')+'</div>','Chi phí thấp nhất, giữ chân cao nhất'],
    ['Đại sứ GITA','<span class="mono">256</span>','<div style="min-width:120px">'+U.bar(20,'var(--gita)')+'</div>','Ghi nhận theo việc đã làm, không theo lượt chốt'],
    ['Sự kiện & lửa trại','<span class="mono">179</span>','<div style="min-width:120px">'+U.bar(14,'#5140B4')+'</div>','Phiên mở cửa miễn phí hàng tuần'],
    ['Tìm đến trực tiếp','<span class="mono">107</span>','<div style="min-width:120px">'+U.bar(8,'#0B6675')+'</div>','Chủ yếu sau khi đọc chuyện thật trong nhóm']
  ]);
  o += '<div class="card mt2" style="border-color:rgba(248,113,113,.3)">'+
    '<div class="row mb"><span style="color:var(--bad)">'+ic('shield','w-4 h-4')+'</span>'+
    '<b>Không thưởng cho lượt chốt</b></div>'+
    '<p class="sm muted">Ghi nhận đại sứ tính theo nhiệm vụ đã hoàn thành và chất lượng câu chuyện, không theo số hợp đồng. Cơ chế thưởng theo lượt chốt sẽ kéo ngôn từ của cả hệ sinh thái về phía bán hàng — và đó là lúc mô hình mất thứ quý nhất của nó.</p></div>';
  return o;
};

/* ═══════════════ 05 · NHẬT KÝ HỆ THỐNG ═══════════════ */
G.VIEWS['nhat-ky-ht'] = function(){
  if(!G.can('sys_audit')) return U.lockCard();
  var o = U.ph({eyebrow:'NHÓM 05 · VẬN HÀNH', ic:'book', t:'Nhật ký hệ thống',
    lead:'Mọi thao tác đều để lại dấu vết. Minh bạch tới tận cùng là một trong bảy giá trị cốt lõi — và nó bắt đầu từ chính hệ thống này.'});
  o += U.tbl(['Giờ','Người thực hiện','Thao tác','IP','Kết quả'],
    G.AUDIT.map(function(a){
      var bad = String(a.kq).indexOf('CHẶN')===0;
      return ['<span class="mono sm">'+h(a.gio)+'</span>','<span class="sm">'+h(a.ai)+'</span>',
        '<span class="sm">'+h(a.viec)+'</span>','<span class="mono tiny muted">'+h(a.ip)+'</span>',
        bad?'<span class="chip" style="color:var(--bad);border-color:rgba(248,113,113,.4)">'+h(a.kq)+'</span>'
           :'<span class="chip on">'+h(a.kq)+'</span>'];
    }));
  return o;
};
/* ═══════════════ 05 · CHỈ SỐ HÀI LÒNG & GÓP Ý ═══════════════ */
G.VIEWS['hai-long'] = function(){
  /* Chính sách và số liệu tổng hợp, không phải hồ sơ của một nhà cụ thể.
     Phân tích dữ liệu (R12) phải đọc được thì mới phân tích được — mà bảng
     PERM vốn đã xếp R12 trong nghe_chung. Khoá ở pro_consult chỉ tạo ra một
     mục chết trong trình đơn của họ. */
  if(!G.can('nghe_chung')) return U.lockCard();
  var H = G.HAILONG;
  var o = U.ph({eyebrow:'NHÓM 05 · VẬN HÀNH', ic:'heart', grad:1, t:'Chỉ số hài lòng & góp ý',
    lead:'Mục tiêu 90% hài lòng. Cách duy nhất tới đó là nghe khách nói thật — kể cả câu khó nghe — rồi đưa thẳng vào hàng chờ cải tiến.'});

  o += '<div class="card glow mb"><div class="row wrap" style="gap:26px;align-items:center">'+
    U.ring(Math.round(H.hienTai), H.hienTai>=H.muc?'#0B7350':'var(--gita)', 'HÀI LÒNG')+
    '<div class="grow" style="min-width:240px">'+
      '<div class="up muted">MỤC TIÊU</div>'+
      '<div class="row" style="gap:10px;align-items:baseline"><b class="mono" style="font-size:33px">'+H.hienTai+'%</b>'+
      '<span class="muted">/ '+H.muc+'%</span>'+
      '<span class="chip" style="color:var(--warn);border-color:rgba(251,191,36,.35)">còn '+(H.muc-H.hienTai).toFixed(1)+' điểm</span></div>'+
      '<div class="mt">'+U.bar(H.hienTai/H.muc*100, 'var(--gita)')+'</div>'+
      '<p class="sm muted mt">Tăng đều bảy tuần liền, từ 81,2% lên '+H.hienTai+'%. Hai điểm chạm đang kéo chỉ số xuống: '+
      '<b style="color:var(--ink-2)">an tâm về ranh giới (83)</b> và <b style="color:var(--ink-2)">muốn lan toả (79)</b>.</p>'+
    '</div>'+
    '<div style="display:flex;gap:22px">'+
      '<div class="center"><b class="mono" style="font-size:26px;color:#5140B4">'+H.nps+'</b><div class="tiny muted">NPS</div></div>'+
      '<div class="center"><b class="mono" style="font-size:26px;color:#0B7350">'+H.giuNhip+'%</b><div class="tiny muted">GIỮ NHỊP</div></div>'+
      '<div class="center"><b class="mono" style="font-size:26px;color:#BE0E16">'+H.gioiThieu+'%</b><div class="tiny muted">GIỚI THIỆU</div></div>'+
    '</div></div></div>';

  o += U.sec('BẢY TUẦN GẦN NHẤT','');
  o += '<div class="card"><div style="display:flex;align-items:flex-end;gap:12px;height:180px">'+
    H.tuan.map(function(w){
      return '<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:7px;height:100%;justify-content:flex-end">'+
        '<b class="mono tiny" style="color:var(--gold-ink)">'+w.v+'</b>'+
        '<div style="width:100%;max-width:48px;height:'+((w.v-75)/20*100)+'%;border-radius:8px 8px 3px 3px;'+
        'background:linear-gradient(180deg,var(--gita),var(--gita-do))"></div>'+
        '<span class="tiny muted">'+h(w.w)+'</span></div>';
    }).join('') +
    '<div style="position:relative;width:0"></div></div>'+
    '<p class="tiny muted center mt">Vạch mục tiêu 90% · thang hiển thị 75–95</p></div>';

  o += U.sec('HÀI LÒNG THEO TỪNG ĐIỂM CHẠM','Chỗ nào dưới 85 là chỗ đang mất người');
  o += '<div class="grid g3">' + H.theoDiemCham.map(function(d){
    var c = d.v>=90?'#0B7350':(d.v>=85?'var(--gita)':'#BE0E16');
    return '<div class="card pad-sm"><div class="row" style="margin-bottom:6px">'+
      '<span class="mono tiny muted">'+h(d.ma)+'</span><span class="grow"></span>'+
      '<b class="mono" style="color:'+c+'">'+d.v+'</b></div>'+
      '<b class="sm" style="display:block;margin-bottom:7px">'+h(d.ten)+'</b>'+U.bar(d.v,c)+'</div>';
  }).join('') + '</div>';

  o += U.sec('KHÁCH NÓI GÌ','Cả câu khen lẫn câu khó nghe — câu khó nghe mới là câu đưa hệ thống đi lên');
  o += G.HAILONG.gopY.map(function(g){
    return '<div class="card mb" style="border-color:'+g.c+'2a">'+
      '<div class="row wrap" style="gap:8px;margin-bottom:9px">'+U.chip(g.loai,g.c)+U.chip(g.nha)+
      '<span class="tiny muted mono">'+h(g.d)+'</span></div>'+
      '<p class="serif" style="font-size:16px;font-style:italic;line-height:1.65;color:var(--ink)">"'+h(g.t)+'"</p>'+
      '<div class="row mt2" style="gap:8px;padding-top:11px;border-top:1px dashed var(--phu-4)">'+
      '<span style="color:'+g.c+';flex:none">'+ic('arrow','w-4 h-4')+'</span>'+
      '<span class="sm dim">'+h(g.trang)+'</span></div></div>';
  }).join('');
  return o;
};

/* ═══════════════ 05 · TÀI LIỆU GIA ĐÌNH GỬI LÊN ═══════════════ */
G.VIEWS['tai-lieu-khach'] = function(){
  /* Tư vấn cũng nhận và soát tài liệu gia đình gửi lên — đó là việc của
     khâu mở cửa, không riêng của Coach. */
  if(!G.can('pro_consult')) return U.lockCard();
  var T = G.TAILIEU;
  var o = U.ph({eyebrow:'NHÓM 05 · VẬN HÀNH', ic:'seed', grad:1, t:'Tài liệu gia đình gửi lên',
    lead:T.nguyenTac});

  o += '<div class="card mb" style="border-color:rgba(52,211,153,.3)">'+
    '<div class="row"><span style="color:var(--ok)">'+ic('shield','w-4 h-4')+'</span>'+
    '<b>Đọc để nâng cấp cho chính họ — không để chấm điểm họ</b></div>'+
    '<p class="sm muted mt">Chỉ số sáng tạo dưới đây chỉ so với chính gia đình đó ở lần gửi trước, và không bao giờ dùng làm căn cứ xếp hạng giữa các nhà.</p></div>';

  o += T.muc.map(function(m){
    return '<div class="card lift mb" style="border-color:'+m.c+'2a">'+
      '<div class="row wrap" style="gap:20px;align-items:flex-start">'+
      U.ring(m.sang, m.c, 'SÁNG TẠO')+
      '<div class="grow" style="min-width:250px">'+
        '<div class="row wrap" style="gap:7px;margin-bottom:7px">'+U.chip(m.nha,m.c)+U.chip(m.loai)+
        '<span class="tiny muted mono">'+h(m.ngay)+'</span></div>'+
        '<b style="font-size:16px;display:block;margin-bottom:9px">'+h(m.ten)+'</b>'+
        '<div style="padding:11px 13px;border-radius:12px;background:var(--phu-2);margin-bottom:10px">'+
          '<span class="tiny up muted">HỆ THỐNG ĐỌC ĐƯỢC GÌ</span>'+
          '<p class="sm mt" style="line-height:1.6">'+h(m.doc)+'</p></div>'+
        '<div style="padding:11px 13px;border-radius:12px;background:'+m.c+'0f;border-left:2px solid '+m.c+'">'+
          '<span class="tiny up" style="color:'+m.c+'">NÂNG CẤP ĐỀ XUẤT</span>'+
          '<p class="sm mt" style="line-height:1.6">'+h(m.nang)+'</p></div>'+
      '</div></div></div>';
  }).join('');

  o += '<div class="card center mt2" style="border-style:dashed">'+
    '<div style="color:var(--ink-4);margin-bottom:10px">'+ic('plus','w-8 h-8')+'</div>'+
    '<b>Gia đình gửi tài liệu lên tại đây</b>'+
    '<p class="sm muted mt" style="max-width:56ch;margin-inline:auto">Sổ tay, ảnh chụp bảng nhịp, thư con viết, bảng tính nhật ký — bất cứ thứ gì nhà mình tự làm. '+
    'Mỗi thứ gửi lên là một mẫu vật về cách nhà đó tư duy, và hệ thống dùng nó để kê đúng bí kíp tiếp theo.</p>'+
    '<button class="btn mt2" data-act="upload">'+ic('arrow')+'Chọn tệp để gửi</button></div>';
  return o;
};

/* ═══════════════ 05 · PHÒNG KIỂM THỬ 4 CHUYÊN GIA ═══════════════ */
G.VIEWS['kiem-thu'] = function(){
  if(!G.can('pro_report')) return U.lockCard();
  var avg = Math.round(G.PERSONA.reduce(function(a,p){return a+p.cham;},0)/G.PERSONA.length);
  var o = U.ph({eyebrow:'NHÓM 05 · VẬN HÀNH', ic:'target', grad:1, t:'Phòng kiểm thử bốn chuyên gia',
    lead:'Bốn người khó nhất được mời vào phá hệ thống: khách khó tính nhất, khách hiểu biết nhất, chuyên gia lập trình giỏi nhất và bậc thầy ngôn từ. Mỗi người chấm mức điểm chạm của riêng họ.'});

  o += '<div class="grid g4 mb">' + G.PERSONA.map(function(p){
    return U.stat({k:p.ten.split(' ').slice(0,2).join(' '), v:p.cham, d:'mức điểm chạm', c:p.c});
  }).join('') + '</div>';

  o += '<div class="card glow mb"><div class="row wrap" style="gap:24px;align-items:center">'+
    U.ring(avg,'var(--gita)','TRUNG BÌNH')+
    '<div class="grow" style="min-width:230px"><b style="font-size:18px;display:block;margin-bottom:6px">Mức điểm chạm tổng hợp: '+avg+'/100</b>'+
    '<p class="sm dim">Bốn góc nhìn khác nhau hoàn toàn, nhưng cùng chỉ vào một chỗ: hệ thống mạnh ở chiều sâu và ở ngôn từ, '+
    'còn yếu ở ba chỗ — bằng chứng pháp lý, xác thực thật ở máy chủ, và mốc chuyển tuyến chuyên khoa.</p></div>'+
    '<button class="btn pri" data-go="chuan-1000">Mở chuẩn 1000 điểm '+ic('arrow')+'</button></div></div>';

  o += G.PERSONA.map(function(p){
    return '<div class="card mb" style="border-color:'+p.c+'2e">'+
      '<div class="row wrap" style="gap:14px;margin-bottom:14px;align-items:flex-start">'+
        '<span style="width:46px;height:46px;border-radius:14px;display:grid;place-items:center;font-weight:900;'+
        'background:'+p.c+'22;color:'+p.c+';flex:none">'+h(p.id)+'</span>'+
        '<div class="grow" style="min-width:200px"><b style="font-size:16px;display:block">'+h(p.ten)+'</b>'+
        '<span class="tiny muted">'+h(p.vai)+'</span></div>'+
        '<div style="text-align:right"><b class="mono" style="font-size:26px;color:'+p.c+'">'+p.cham+'</b>'+
        '<div class="tiny muted">điểm chạm</div></div></div>'+
      '<div style="padding:11px 13px;border-radius:12px;background:var(--phu-2);margin-bottom:14px">'+
        '<span class="tiny up muted">CÁCH NGƯỜI NÀY DÙNG HỆ THỐNG</span>'+
        '<p class="sm mt">'+h(p.cach)+'</p></div>'+
      '<div class="grid g2" style="gap:14px">'+
        '<div><div class="up mb" style="color:var(--ok)">ĐÃ ĐẠT</div>'+
        p.dat.map(function(x){return '<div style="display:flex;gap:8px;margin-bottom:7px">'+
          '<span style="color:var(--ok);flex:none;margin-top:3px">'+ic('check','w-3 h-3')+'</span>'+
          '<span class="sm" style="line-height:1.55">'+h(x)+'</span></div>';}).join('')+'</div>'+
        '<div><div class="up mb" style="color:var(--bad)">CÒN THIẾU</div>'+
        p.thieu.map(function(x){return '<div style="display:flex;gap:8px;margin-bottom:7px">'+
          '<span style="color:var(--bad);flex:none;margin-top:3px">'+ic('x','w-3 h-3')+'</span>'+
          '<span class="sm" style="line-height:1.55">'+h(x)+'</span></div>';}).join('')+'</div>'+
      '</div>'+
      '<div class="mt2" style="padding:14px 16px;border-radius:14px;background:'+p.c+'0f;border-left:2px solid '+p.c+'">'+
        '<span class="tiny up" style="color:'+p.c+'">KẾT LUẬN</span>'+
        '<p class="serif mt" style="font-size:16px;font-style:italic;line-height:1.6">"'+h(p.ket)+'"</p></div>'+
      '<div class="row mt2" style="gap:9px;padding-top:12px;border-top:1px dashed var(--phu-4)">'+
        '<span class="tiny muted">Đăng nhập bằng vai này:</span>'+
        '<span class="mono tiny" style="color:var(--gold-ink)">'+h(p.tk)+'</span>'+
        '<span class="mono tiny" style="color:var(--gold-ink)">'+h(p.mk)+'</span></div></div>';
  }).join('');
  return o;
};

/* ═══════════════ 05 · CHUẨN 1000 ĐIỂM ═══════════════
   HAI NGĂN, KHÔNG MỘT CON SỐ GỘP.

   Bản cũ trình một con số /1000 duy nhất, cộng từ năm mươi ô gõ tay,
   và trình nó với độ chính xác của một phép đo. Chủ hệ chốt WOW-01:
   tách hai ngăn.

   Vì sao KHÔNG có tổng chung, dù nó dễ đọc hơn: cộng một nửa đo được
   với một nửa lời khai thì con số ra mang TÊN của phép đo trong khi
   nó thừa hưởng mọi sai của lời khai. Cùng luật với phễu thị giác
   (9.99.59) và cột lời khai của `docTuanThu` (9.99.70).

   Nửa máy đo chạy LÚC MỞ MÀN — nên con số ở đây già nhất là vài trăm
   mili giây. Nửa người khai mang ngày và tên, và màn NÓI RA lời khai
   cũ bao nhiêu ngày: một lời khai không ai biết tuổi thì nó được đọc
   như thể vừa viết sáng nay.
   ═══════════════════════════════════════════════════════════════ */
G.VIEWS['chuan-1000'] = function(){
  if(!G.can('pro_report')) return U.lockCard();

  var do_ = (typeof G.chuanDo === 'function') ? G.chuanDo() : {};
  var hnay = Date.now();

  /* Cộng RIÊNG hai nửa. Ô máy đo chưa đo được (kho chưa mở) thì KHÔNG
     tính vào mẫu số — đếm nó là 0 điểm sẽ dìm cả ngăn xuống vì một
     thứ chưa ai đo, và con số ấy trông y hệt một kết quả kém. */
  var mD = 0, mT = 0, mCho = 0, mMau = 0, nD = 0, nT = 0, cuNhat = null;
  G.CHUAN1000.forEach(function(c){
    c.y.forEach(function(y){
      if (y.mayDo){
        var r = do_[y.mayDo];
        /* Ba trạng thái, không hai. `chuaDo` là ô CÓ phép đo chạy được
           nhưng cái nó đo còn là dữ liệu mẫu — khác hẳn ô chưa ai viết
           phép đo, và khác hẳn ô đo được điểm thấp. Gộp ba thành hai
           là mất đúng chỗ có nghĩa. */
        if (r && r.chuaDo){ mMau++; return; }
        if (!r || r.loi !== undefined || r.d === undefined){ mCho++; return; }
        mD += r.d; mT += y.m;
      } else if (y.khai){
        nD += y.d; nT += y.m;
        var t = Date.parse(y.khai.ngay);
        if (!isNaN(t) && (cuNhat === null || t < cuNhat)) cuNhat = t;
      }
    });
  });
  var tuoi = cuNhat === null ? null : Math.round((hnay - cuNhat) / 86400000);

  var o = U.ph({eyebrow:'NHÓM 05 · VẬN HÀNH', ic:'star', grad:1, t:'Chuẩn 1000 điểm',
    lead:'Năm mươi tiêu chí, mỗi tiêu chí hai mươi điểm. Chia hai ngăn theo chỗ con số ĐẾN TỪ ĐÂU — không cộng chung, vì cộng một nửa đo được với một nửa lời khai thì con số ra mang tên của phép đo mà thừa hưởng mọi sai của lời khai.'});

  /* ── Hai thẻ số, ĐẶT CẠNH NHAU chứ không chồng lên nhau ── */
  o += '<div class="row wrap mb" style="gap:14px;align-items:stretch">';

  o += '<div class="card grow" style="min-width:260px;border-color:var(--ok)44">'+
    '<div class="row" style="gap:8px;align-items:center">'+
      '<span style="color:var(--ok)">'+ic('check','w-4 h-4')+'</span>'+
      '<b class="tiny up" style="color:var(--ok)">NGĂN 1 · MÁY ĐO</b></div>'+
    '<div class="row mt" style="gap:10px;align-items:baseline">'+
      '<b class="mono" style="font-size:33px;color:var(--ok)">'+mD+'</b>'+
      '<span class="muted" style="font-size:18px">/ '+mT+'</span></div>'+
    '<div class="mt">'+U.bar(mT?mD/mT*100:0,'var(--ok)')+'</div>'+
    '<p class="tiny muted mt">Đo lại mỗi lượt mở màn, trên chính màn hình đang chạy. '+
      'Con số này già nhất là vài trăm mili giây.'+
      (mCho ? ' <b style="color:var(--warn)">'+mCho+' ô chưa đo được</b> — kho của ô ấy chưa mở với vai này, nên nó KHÔNG được tính là 0.' : '')+
      (mMau ? ' <b style="color:var(--warn)">'+mMau+' ô đang chờ dữ liệu thật</b> — phép đo đã dựng xong và sẽ TỰ BẬT khi kho ấy thôi là dữ liệu mẫu. Chấm điểm trên số của những nhà hư cấu là đúng cái bẫy cả màn này sinh ra để gỡ.' : '')+
    '</p></div>';

  o += '<div class="card grow" style="min-width:260px;border-color:var(--warn)44">'+
    '<div class="row" style="gap:8px;align-items:center">'+
      '<span style="color:var(--warn)">'+ic('pulse','w-4 h-4')+'</span>'+
      '<b class="tiny up" style="color:var(--warn)">NGĂN 2 · NGƯỜI KHAI</b></div>'+
    '<div class="row mt" style="gap:10px;align-items:baseline">'+
      '<b class="mono" style="font-size:33px;color:var(--warn)">'+nD+'</b>'+
      '<span class="muted" style="font-size:18px">/ '+nT+'</span></div>'+
    '<div class="mt">'+U.bar(nT?nD/nT*100:0,'var(--warn)')+'</div>'+
    '<p class="tiny muted mt">Người gõ, không máy đo. '+
      (tuoi === null ? 'Không ô nào ghi ngày khai.'
        : 'Lời khai cũ nhất viết cách đây <b style="color:var(--ink-2)">'+tuoi+' ngày</b>.')+
      ' Một lời khai không ai biết tuổi thì nó được đọc như thể vừa viết sáng nay.'+
    '</p></div>';

  o += '</div>';

  o += '<div class="card mb" style="border-style:dashed">'+
    '<p class="sm">'+ic('pulse','w-4 h-4')+' <b>Không có con số tổng trên 1000.</b> '+
    'Cộng '+mT+' điểm đo được với '+nT+' điểm lời khai thì ra một con số mang tên '+
    'của phép đo. Muốn một con số duy nhất thì phải chuyển bớt ô từ ngăn hai sang '+
    'ngăn một — tức là viết thêm phép đo, không phải cộng thêm.</p></div>';

  /* ── Mười chương, mỗi ô nói RÕ nó thuộc ngăn nào ── */
  o += G.CHUAN1000.map(function(c){
    var cD = 0, cT = 0, kD = 0, kT = 0;
    c.y.forEach(function(y){
      if (y.mayDo){ var r = do_[y.mayDo];
        if (r && !r.chuaDo && r.loi === undefined && r.d !== undefined){ cD += r.d; cT += y.m; } }
      else if (y.khai){ kD += y.d; kT += y.m; }
    });

    return '<div class="card mb" style="border-color:'+c.c+'26">'+
      '<div class="row wrap" style="gap:12px;margin-bottom:12px">'+
        '<span class="pill" style="background:'+c.c+'22;color:'+c.c+'">'+h(c.ma)+'</span>'+
        '<b class="grow" style="font-size:16px;min-width:180px">'+h(c.ten)+'</b>'+
        (cT ? '<span class="mono tiny" style="color:var(--ok)">đo '+cD+'/'+cT+'</span>' : '')+
        (kT ? '<span class="mono tiny" style="color:var(--warn)">khai '+kD+'/'+kT+'</span>' : '')+
      '</div>'+
      '<div>' + c.y.map(function(y){
        var r = y.mayDo ? do_[y.mayDo] : null;
        var laMay = !!y.mayDo;
        var choSo = laMay && !!(r && r.chuaDo);
        var chua  = laMay && (choSo || !r || r.loi !== undefined || r.d === undefined);
        var diem  = laMay ? (chua ? null : r.d) : y.d;
        var du    = diem !== null && diem >= y.m;
        var mau   = chua ? 'var(--ink-4)' : (du ? 'var(--ok)' : 'var(--warn)');

        var s = '<div style="padding:9px 0;border-bottom:1px dashed var(--phu-3)">'+
          '<div style="display:flex;gap:10px;align-items:flex-start">'+
            '<span style="flex:none;margin-top:2px;color:'+mau+'">'+
              ic(chua ? 'pulse' : (du ? 'check' : 'pulse'),'w-4 h-4')+'</span>'+
            '<span class="sm grow">'+h(y.t)+'</span>'+
            '<span class="pill tiny" style="flex:none;background:'+
              (laMay?'var(--ok)1A;color:var(--ok)':'var(--warn)1A;color:var(--warn)')+'">'+
              (laMay?(choSo?'máy đo · chờ số thật':'máy đo'):'người khai')+'</span>'+
            '<span class="mono tiny" style="flex:none;color:'+mau+'">'+
              (diem === null ? '—' : diem)+'/'+y.m+'</span></div>';

        /* Máy đo: in CÂU NÓI CÁCH ĐO. Một con số không nói nó đo bằng
           gì thì người đọc không cãi lại được, và thứ không cãi lại
           được thì không kiểm lại được. */
        if (laMay){
          s += '<p class="tiny muted" style="margin:5px 0 0 26px">'+
            (choSo ? 'phép đo ĐÃ DỰNG XONG và sẽ tự bật — '+h(r.cach)
              : chua ? (r && r.loi ? 'chưa đo được — '+h(r.loi)
                                   : 'chưa đo được — kho của ô này chưa mở với vai đang dùng')
                     : h(r.cach))+'</p>';
        } else {
          /* Người khai: NGÀY và TÊN, và tuổi tính lúc đọc. */
          var t = Date.parse(y.khai.ngay);
          var ng = isNaN(t) ? null : Math.round((hnay - t) / 86400000);
          s += '<p class="tiny muted" style="margin:5px 0 0 26px">'+
            h(y.khai.ai)+' khai ngày '+h(y.khai.ngay)+
            (ng === null ? '' : ' · cách đây '+ng+' ngày')+
            ' — chưa ai đo lại</p>';
        }
        return s + '</div>';
      }).join('') + '</div></div>';
  }).join('');

  if (do_._luc) o += '<p class="tiny muted">Ngăn máy đo chạy lúc '+
    h(do_._luc.toLocaleTimeString('vi-VN'))+' ngay trên màn hình này.</p>';
  return o;
};

/* ═══════════════ TÀI KHOẢN CỦA TÔI ═══════════════ */
G.VIEWS['toi'] = function(){
  var a = G.S.acc, r = G.S.roleObj, p = G.PORTALS[r.portal];
  var o = U.ph({eyebrow:'CÁ NHÂN', ic:'home', t:'Tài khoản của tôi',
    lead:'Vai đang dùng quyết định anh chị nhìn thấy gì. Đổi vai bất cứ lúc nào để kiểm tra mức hiện diện của từng vị trí.'});
  o += '<div class="card glow mb"><div class="row wrap" style="gap:18px;align-items:center">'+
    '<span style="width:64px;height:64px;border-radius:20px;display:grid;place-items:center;font-weight:900;font-size:18px;'+
    'background:linear-gradient(135deg,'+r.c+',var(--gita-do));color:#1A1006;flex:none">'+h(a.ten.split(' ').slice(-1)[0].slice(0,2).toUpperCase())+'</span>'+
    '<div class="grow" style="min-width:220px"><b style="font-size:21px;display:block">'+h(a.ten)+'</b>'+
    '<span class="sm muted">'+h(a.u)+'</span>'+
    '<div class="row wrap mt" style="gap:6px">'+U.chip(r.n, r.c)+U.chip('Cấp '+r.lv)+U.chip(h(a.nha))+'</div></div>'+
    '<button class="btn" data-act="logout">'+ic('out')+'Đổi vai / Đăng xuất</button></div></div>';

  o += '<div class="grid g2">'+
    '<div class="card"><div class="up mb" style="color:var(--ink-4)">CỔNG MẶC ĐỊNH CỦA VAI</div>'+
    '<div class="row" style="gap:11px;margin-bottom:9px">'+
    '<span style="width:38px;height:38px;border-radius:12px;display:grid;place-items:center;background:'+p.c+'22;color:'+p.c+'">'+ic(p.ic,'w-5 h-5')+'</span>'+
    '<b>'+h(p.n)+'</b></div><p class="sm dim" style="line-height:1.65">'+h(p.say)+'</p></div>'+
    '<div class="card"><div class="up mb" style="color:var(--ink-4)">QUYỀN ĐANG CÓ</div>'+
    '<div class="row wrap" style="gap:5px">'+Object.keys(G.PERM).map(function(k){
      return G.can(k)?U.chip(k,'#0B7350'):'';
    }).join('')+'</div>'+
    '<div class="up mt2 mb" style="color:var(--ink-4)">NGOÀI PHẠM VI</div>'+
    '<div class="row wrap" style="gap:5px">'+Object.keys(G.PERM).map(function(k){
      return !G.can(k)?'<span class="chip" style="opacity:.5">'+h(k)+'</span>':'';
    }).join('')+'</div></div></div>';

  o += U.sec('ĐỔI NHANH SANG VAI KHÁC','Để kiểm tra mức thao tác và hiện diện của từng vị trí');
  o += '<div class="grid g3">' + G.ROLES.map(function(x){
    var cur = x.id===G.S.role;
    return '<button class="card pad-sm lift '+(cur?'glow':'')+'" data-switch="'+h(x.id)+'" style="text-align:left;border-color:'+x.c+(cur?'66':'22')+'">'+
      '<div class="row" style="gap:9px"><span style="width:30px;height:30px;border-radius:9px;display:grid;place-items:center;'+
      'font-weight:900;font-size:10.5px;background:'+x.c+'22;color:'+x.c+'">'+h(x.id)+'</span>'+
      '<div class="grow" style="min-width:0"><b class="sm" style="display:block">'+h(x.n)+'</b>'+
      '<span class="tiny muted">Cấp '+x.lv+'</span></div>'+(cur?'<span style="color:var(--gold-ink)">'+ic('check','w-4 h-4')+'</span>':'')+'</div></button>';
  }).join('') + '</div>';
  return o;
};

})();
