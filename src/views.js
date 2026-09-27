/* ═══════════════════════════════════════════════════════════════
   GITA 365 · v7.0 — MÀN HÌNH · NHÓM 01 & 02
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;
G.VIEWS = G.VIEWS || {};
(function(){
var U = G.U, h = U.h, ic = U.ic;

/* ══════════════════ 01 · BẢN ĐỒ GIA ĐÌNH THỊNH VƯỢNG ══════════════════ */
G.VIEWS['ban-do'] = function(){
  var V = G.VANHANH, C = ['#2A72C6','#5140B4','#0B6675','#0B7350','#BE0E16'];
  var o = U.ph({eyebrow:'NHÓM 01 · KHỞI NGUỒN', ic:'map', grad:1,
    t:'Bản Đồ Gia Đình Thịnh Vượng',
    lead:V.summary});

  /* ── VIỆC HÔM NAY, ĐẶT TRÊN CÙNG ──
     Đây là màn nhà mình mở ra đầu tiên. Trước bản này nó mở bằng ba ô
     đầu vào rồi năm khoang rồi chín vai — đúng cả, nhưng không câu nào
     trả lời được câu duy nhất người mở đang hỏi: hôm nay tôi làm gì.

     Cái thang ở màn hành trình trả lời đúng câu ấy. Đưa nó lên đây, và
     chỉ lấy phần cần: bậc đang đứng, một việc. Bốn bậc kia vẫn nằm ở
     màn hành trình cho ai muốn nhìn cả đường. */
  if (G.btThangNha && G.veBacThang) {
    var th = G.btThangNha((G.S && G.S.soToiDaGhi != null) ? G.S.soToiDaGhi : null);
    if (th && th.bac.length) {
      var dangO = th.bac.filter(function (x) { return x.trangThai === 'dangO'; });
      o += U.sec('VIỆC CỦA NHÀ MÌNH HÔM NAY',
        'Một việc. Xong việc này mới tới việc sau.');
      o += G.veBacThang(dangO, { y: th.chuaDo ? th.y : '' });
    }
  }
  /* Ngay dưới việc hôm nay: còn bao nhiêu nữa, và qua rồi thì thấy gì.
     Hai thẻ này trả lời hai câu khác nhau — một câu "làm gì", một câu
     "để làm gì" — nên chúng đứng cạnh nhau chứ không thay nhau. */
  if (G.bdTiaHyVong) o += G.bdTiaHyVong();

  /* Đầu vào */
  o += U.sec('ĐẦU VÀO — ba thứ phải có trước khi khởi động năm', V.dauVao.ten);
  o += '<div class="grid g3">' + V.dauVao.muc.map(function(m,i){
    return '<div class="card lift"><div class="row" style="margin-bottom:9px">'+
      '<span class="pill" style="background:var(--gita-mo-2);color:var(--gold-ink)">VÀO '+(i+1)+'</span></div>'+
      '<b style="font-size:14.5px;display:block;margin-bottom:7px">'+h(m.ten)+'</b>'+
      '<p class="sm muted" style="line-height:1.6">'+h(m.lam)+'</p>'+
      (m.raGi?'<div class="mt" style="padding-top:10px;border-top:1px dashed var(--phu-4)">'+
        '<div class="tiny up" style="color:var(--ink-4);margin-bottom:4px">RA ĐƯỢC GÌ</div>'+
        '<p class="sm dim">'+h(m.raGi)+'</p></div>':'')+'</div>';
  }).join('') + '</div>';

  /* Năm khoang */
  o += U.sec('DÒNG CHẢY NĂM KHOANG', 'Bấm vào một khoang để mở toàn bộ nội dung, việc cụ thể, KPI và cảnh báo');
  o += '<div class="flow">' + V.khoang.map(function(k,i){
    var c = C[i];
    return '<button class="kh" data-kh="'+h(k.id)+'" style="color:'+c+'">'+
      '<i class="beam"></i>'+
      '<div class="no">KHOANG '+k.no+'</div>'+
      '<h4 style="color:'+c+'">'+h(k.ten)+'</h4>'+
      '<div class="q">'+h(k.cauHoi)+'</div>'+
      '<div class="mt-tags">'+(k.noiDung||[]).slice(0,4).map(function(x){
        return '<span>'+h(x)+'</span>';}).join('')+'</div>'+
      '<div class="tiny mt" style="color:var(--ink-4);display:flex;align-items:center;gap:5px">'+
        ic('calendar','w-3 h-3')+h(k.nhip)+'</div></button>';
  }).join('') + '</div>';

  /* Băng nền */
  o += U.sec('BĂNG NỀN — tám việc chạy dưới cả năm khoang', V.bangNen.nguyenTac);
  o += '<div class="grid g4">' + V.bangNen.viec.map(function(v){
    return '<div class="card pad-sm lift"><div class="row" style="gap:8px;margin-bottom:6px">'+
      '<span class="mono b" style="color:var(--gold-ink);font-size:12.5px">0'+v.no+'</span>'+
      '<b style="font-size:14.5px">'+h(v.ten)+'</b></div>'+
      '<p class="tiny muted" style="line-height:1.55">'+h(v.lam)+'</p>'+
      '<div class="tiny mt" style="color:var(--ink-4)">Nhịp: '+h(v.khi)+'</div>'+
      (v.dauHieuThieu?'<div class="tiny" style="margin-top:6px;color:var(--alert);line-height:1.5">⚠ Thiếu khi: '+h(v.dauHieuThieu)+'</div>':'')+
      '</div>';
  }).join('') + '</div>';

  /* Đầu ra */
  o += U.sec('ĐẦU RA — gia đình thành công, hạnh phúc', V.dauRa.nguyenTac);
  o += '<div class="card glow"><div class="grid g2" style="gap:10px">' + V.dauRa.chiSo.map(function(c){
    return '<div style="display:flex;gap:10px;padding:11px;border-radius:12px;background:var(--phu-2)">'+
      '<span style="color:var(--ok);flex:none">'+ic('check','w-4 h-4')+'</span>'+
      '<div><b style="font-size:14.5px;display:block">'+h(c.ten)+'</b>'+
      '<span class="tiny muted">'+h(c.chuan)+'</span></div></div>';
  }).join('') + '</div>'+
  (V.dauRa.hoSo?'<p class="sm dim mt" style="padding-top:14px;border-top:1px solid var(--line)">'+
    '<b class="grad-text">Hồ sơ đầu ra:</b> '+h(V.dauRa.hoSo)+'</p>':'')+'</div>';

  o += '<div class="mt2">'+U.quote('Đích của mô hình không phải thành tích của một đứa trẻ. Đích là một hệ gia đình vận hành được mà không cần ai canh, và mỗi người trong đó đều đang lớn lên.','Mô hình Gia đình vận hành 365')+'</div>';
  return o;
};

/* Hộp thoại chi tiết một khoang */
G.khoangModal = function(id){
  var k = (G.VANHANH.khoang||[]).filter(function(x){return x.id===id;})[0];
  if(!k) return;
  var C = {K1:'#2A72C6',K2:'#5140B4',K3:'#0B6675',K4:'#0B7350',K5:'#BE0E16'}, c = C[id]||'var(--gita)';
  var o = '<div class="up" style="color:'+c+'">KHOANG '+k.no+'</div>'+
    '<h2 style="font-size:26px;font-weight:800;margin:6px 0 8px">'+h(k.ten)+'</h2>'+
    '<p class="serif" style="font-size:18px;font-style:italic;color:'+c+';margin-bottom:16px">'+h(k.cauHoi)+'</p>'+
    '<p class="sm dim" style="margin-bottom:16px">'+h(k.vaiTro)+'</p>'+
    '<div class="grid g2" style="gap:10px;margin-bottom:16px">'+
      '<div class="card pad-sm"><div class="tiny up muted mb">AI LÀM</div><p class="sm">'+h(k.aiLam)+'</p></div>'+
      '<div class="card pad-sm"><div class="tiny up muted mb">NHỊP</div><p class="sm">'+h(k.nhip)+'</p></div>'+
    '</div>'+
    '<div class="up muted mb">NỘI DUNG KHOANG</div>'+
    '<div class="row wrap mb" style="gap:6px">'+(k.noiDung||[]).map(function(x){return U.chip(x,c);}).join('')+'</div>'+
    '<div class="up muted mb" style="margin-top:16px">VIỆC CỤ THỂ</div>'+ U.list(k.viecCuThe, c) +
    '<div class="card pad-sm mt2" style="border-color:'+c+'40"><div class="tiny up muted mb">KPI CỦA KHOANG</div>'+
      '<p class="sm">'+h(k.kpi)+'</p></div>';
  if(k.quyMoi && k.quyMoi.length)
    o += '<div class="card pad-sm mt"><div class="tiny up muted mb">QUY MỚI</div>'+U.list(k.quyMoi,c)+'</div>';
  if(k.canhBao)
    o += '<div class="card pad-sm mt" style="border-color:rgba(251,146,60,.35);background:rgba(251,146,60,.06)">'+
      '<div class="tiny up mb" style="color:var(--alert)">CẢNH BÁO</div><p class="sm">'+h(k.canhBao)+'</p></div>';
  if(k.moThuc && k.moThuc.length)
    o += '<div class="mt"><div class="tiny up muted mb">MÔ THỨC ÁP DỤNG</div><div class="row wrap" style="gap:6px">'+
      k.moThuc.map(function(m){return U.chip(typeof m==='string'?m:(m.ma||m.id||m.ten));}).join('')+'</div></div>';
  U.modal(o);
};

/* ══════════════════ 01 · CHÂN DUNG NHÀ MÌNH ══════════════════ */
G.VIEWS['chan-dung-nha'] = function(){
  var f = G.myFamily(), V = G.VANHANH;
  var o = U.ph({eyebrow:'NHÓM 01 · KHỞI NGUỒN', ic:'users', t:'Chân dung nhà mình',
    lead:'Khoang một hỏi: trong nhà này, mỗi người thật sự là ai? Chưa hiểu đúng từng người thì mọi khoang sau đều thiết kế trên giả định.'});

  o += '<div class="card glow"><div class="row wrap" style="gap:22px;align-items:flex-start">'+
    U.ring(f.tuchu, G.tierOf(f.tier).c, 'TỰ CHỦ') +
    '<div class="grow" style="min-width:240px">'+
      '<div class="row" style="gap:8px;margin-bottom:6px">'+U.chip(G.tierOf(f.tier).code+' · '+G.tierOf(f.tier).name, G.tierOf(f.tier).c)+
      U.chip('Ngày thứ '+f.ngay)+U.chip('Băng '+f.band, G.bandColor(f.band))+'</div>'+
      '<h2 style="font-size:26px;font-weight:800;letter-spacing:-.02em">'+h(f.nha)+'</h2>'+
      '<p class="sm dim mt">Học viên <b>'+h(f.hv)+'</b> · '+h(f.lop)+' &nbsp;·&nbsp; Người lớn <b>'+h(f.ph)+'</b></p>'+
      '<p class="sm dim">Coach đồng hành: <b>'+h(f.coach)+'</b></p>'+
      '<div class="mt2 sm"><span class="up muted">KỲ TÍCH NĂM ĐANG CHẠY</span><p class="mt" style="color:var(--gold-2)">'+h(f.kyTich)+'</p></div>'+
    '</div></div></div>';

  o += '<div class="grid g4 mt2">'+
    U.stat({k:'SỐ LẦN NHẮC / TUẦN', v:f.nhac, d:'mốc đầu năm: 6 lần', c:'#BE0E16'})+
    U.stat({k:'MỨC TỰ CHỦ', v:f.tuchu+'%', d:'chuẩn cuối chặng 4: trên 80%', c:'#0B7350'})+
    U.stat({k:'VAI CÓ NGƯỜI GIỮ', v:f.vai+'/9', d:'không ai giữ quá 4 vai', c:'#5140B4'})+
    U.stat({k:'NGÀY ĐỒNG HÀNH', v:f.ngay, d:'tầng '+f.tier+' · '+G.tierOf(f.tier).days+' ngày', c:'#185AB4'})+
  '</div>';

  o += U.sec('BỐN MIỀN G – I – T – A CỦA NHÀ MÌNH', 'Đọc nguyên nhân theo bốn miền thay vì đoán bằng cảm giác');
  var lv = [78, 54, 71, 62];
  o += '<div class="grid g4">' + G.GITA.map(function(g,i){
    return '<div class="card lift" style="border-color:'+g.c+'33">'+
      '<div class="row" style="gap:9px;margin-bottom:8px">'+
        '<span style="width:32px;height:32px;border-radius:10px;display:grid;place-items:center;font-weight:900;background:'+g.c+'22;color:'+g.c+'">'+g.k+'</span>'+
        '<div><b style="font-size:14.5px;display:block">'+h(g.short)+'</b><span class="tiny muted">'+h(g.name.split('—')[0])+'</span></div>'+
      '</div>'+
      '<div class="row" style="gap:8px;margin:10px 0 6px"><b class="mono" style="font-size:18px;color:'+g.c+'">'+lv[i]+'</b><span class="tiny muted">/100</span></div>'+
      U.bar(lv[i], g.c)+
      '<p class="tiny muted mt" style="line-height:1.55">'+h(g.desc)+'</p>'+
      '<div class="tiny mt" style="color:var(--ink-4);font-style:italic;line-height:1.5">"'+h(g.probe)+'"</div>'+
    '</div>';
  }).join('') + '</div>';

  o += U.sec('KHOANG 1 — THẤU HIỂU THÀNH VIÊN', V.khoang[0].kpi);
  o += '<div class="card">'+U.list(V.khoang[0].viecCuThe, '#2A72C6')+
    '<div class="mt2" style="padding-top:14px;border-top:1px dashed var(--phu-4)">'+
    '<span class="tiny up" style="color:var(--alert)">CẢNH BÁO</span>'+
    '<p class="sm dim mt">'+h(V.khoang[0].canhBao)+'</p></div></div>';
  return o;
};

/* ══════════════════ 01 · ĐỊNH VỊ HÔM NAY ══════════════════ */
G.VIEWS['dinh-vi'] = function(){
  var f = G.myFamily(), V = G.VANHANH;
  var vals = [f.tuchu, 100-f.tuchu, f.nhac, 3.5, f.tier>=4?1:0, f.tier>=5?1:0, f.vai];
  var o = U.ph({eyebrow:'NHÓM 01 · KHỞI NGUỒN', ic:'pulse', t:'Định vị hôm nay',
    lead:'Biết gia đình đang thật sự ở đâu trước khi bàn đi đâu. Đo bằng dữ liệu, không bằng cảm giác — đây là việc băng nền số một.'});

  o += '<div class="card" style="border-color:var(--gita-vien-1)">'+
    '<div class="row" style="gap:10px;margin-bottom:6px">'+ic('shield','w-4 h-4')+
    '<b>Bảng số này chỉ so với chính nhà mình ở chặng trước</b></div>'+
    '<p class="sm muted">Không so với nhà khác, không xếp hạng, không dùng để chứng minh ai sai. Đây là ranh giới số một của mô hình.</p></div>';

  o += U.sec('BẢY CHỈ SỐ ĐẦU RA', V.dauRa.ten);
  o += '<div class="grid g2">' + V.dauRa.chiSo.map(function(c,i){
    var v = [f.tuchu, 100-f.tuchu, Math.round(f.nhac/6*100), 100-Math.min(95,f.ngay/4),
             f.tier>=4?85:35, f.tier>=5?70:20, Math.round(f.vai/9*100)][i];
    var cl = ['#0B7350','#5140B4','#BE0E16','#0B6675','var(--gita)','#BE0E16','#2A72C6'][i];
    return '<div class="card lift"><div class="row"><div class="grow"><b style="font-size:14.5px">'+h(c.ten)+'</b>'+
      '<p class="tiny muted mt" style="line-height:1.5">Chuẩn: '+h(c.chuan)+'</p></div>'+
      '<b class="mono" style="font-size:21px;color:'+cl+'">'+Math.round(v)+'</b></div>'+
      '<div class="mt">'+U.bar(v,cl)+'</div></div>';
  }).join('') + '</div>';

  o += U.sec('SO VỚI CHÍNH NHÀ MÌNH', 'Mốc đầu năm → hôm nay');
  o += U.tbl(['Chỉ số','Đầu năm','Hôm nay','Dịch chuyển'], [
    ['Số lần nhắc mỗi tuần','<span class="mono">6</span>','<span class="mono b" style="color:var(--ok)">'+f.nhac+'</span>','<span style="color:var(--ok)">▼ '+(6-f.nhac)+' lần</span>'],
    ['Mức tự chủ của học viên','<span class="mono">22%</span>','<span class="mono b" style="color:var(--ok)">'+f.tuchu+'%</span>','<span style="color:var(--ok)">▲ '+(f.tuchu-22)+' điểm</span>'],
    ['Vai có người giữ','<span class="mono">3/9</span>','<span class="mono b" style="color:var(--ok)">'+f.vai+'/9</span>','<span style="color:var(--ok)">▲ '+(f.vai-3)+' vai</span>'],
    ['Thời gian phục hồi sau xung đột','<span class="mono">3 ngày</span>','<span class="mono b" style="color:var(--ok)">'+(f.tier>=4?'4 giờ':'1 ngày')+'</span>','<span style="color:var(--ok)">rút ngắn rõ</span>'],
    ['Phần thay đổi của người lớn','<span class="mono muted">chưa có</span>','<span class="mono b">'+(f.tier>=4?'trình bày được':'đang xây')+'</span>', f.tier>=4?'<span style="color:var(--ok)">đạt chuẩn</span>':'<span style="color:var(--warn)">đang đi</span>']
  ]);
  return o;
};

/* ══════════════════ 01 · TẦM NHÌN 5–20 NĂM ══════════════════ */
G.VIEWS['tam-nhin'] = function(){
  var f = G.myFamily();
  var moc = [
    {k:'nam5', t:'5 NĂM NỮA', c:'#185AB4', g:'Nhà mình sẽ là một gia đình thế nào?'},
    {k:'nam10',t:'10 NĂM NỮA',c:'#5140B4', g:'Con sẽ đang làm gì, và nhà mình đang giữ điều gì?'},
    {k:'nam20',t:'20 NĂM NỮA',c:'#185AB4', g:'Điều gì của nhà mình sẽ còn lại và truyền tiếp?'}
  ];
  var o = U.ph({eyebrow:'NHÓM 01 · KHỞI NGUỒN', ic:'sun', t:'Bảng tầm nhìn gia đình',
    lead:'Cả nhà ngồi đủ mặt, viết gia đình mình muốn trở thành gia đình thế nào trong 5, 10 và 20 năm tới. Viết bằng lời của từng người — không ai viết hộ ai.'});

  o += '<div class="card mb" style="border-color:rgba(139,92,246,.3)">'+
    '<div class="row"><span style="color:var(--i)">'+ic('compass','w-4 h-4')+'</span>'+
    '<b>Việc nào trong tuần không nối được về bảng này thì bỏ.</b></div>'+
    '<p class="sm muted mt">Băng nền số 2 — Định hướng · rà lại mỗi 21 ngày.</p></div>';

  o += '<div class="grid g3">' + moc.map(function(m){
    var val = (G.S.vision && G.S.vision[m.k]) || '';
    return '<div class="card" style="border-color:'+m.c+'33">'+
      '<div class="up" style="color:'+m.c+';margin-bottom:6px">'+m.t+'</div>'+
      '<p class="tiny muted" style="margin-bottom:10px;font-style:italic">'+h(m.g)+'</p>'+
      '<textarea data-vision="'+m.k+'" rows="7" placeholder="Viết bằng lời của chính mình…" '+
      'style="width:100%;background:var(--phu-2);border:1px solid var(--line);border-radius:12px;'+
      'padding:12px;font-size:14.5px;line-height:1.6;resize:vertical;outline:none">'+h(val)+'</textarea>'+
      '</div>';
  }).join('') + '</div>';

  o += '<div class="row mt2" style="gap:10px"><button class="btn pri" data-act="save-vision">'+ic('check')+'Lưu bảng tầm nhìn</button>'+
    '<span class="sm muted">Lưu trong trình duyệt của anh chị. Khi nối máy chủ GITA 365, bảng này đi vào hồ sơ gia đình.</span></div>';

  o += U.sec('BA THỨ PHẢI CÓ TRƯỚC KHI KHỞI ĐỘNG NĂM', G.VANHANH.dauVao.ten);
  o += '<div class="grid g3">' + G.VANHANH.dauVao.muc.map(function(m,i){
    var done = i===0 && !!(G.S.vision && G.S.vision.nam5);
    return '<div class="card '+(done?'glow':'')+'"><div class="row" style="gap:9px;margin-bottom:8px">'+
      '<span style="width:26px;height:26px;border-radius:8px;display:grid;place-items:center;'+
      (done?'background:var(--ok);color:#04241A':'background:var(--phu-3);color:var(--ink-3)')+'">'+
      (done?ic('check','w-3 h-3'):(i+1))+'</span><b class="sm">'+h(m.ten)+'</b></div>'+
      '<p class="tiny muted" style="line-height:1.55">'+h(m.raGi||m.lam)+'</p></div>';
  }).join('') + '</div>';

  o += '<div class="mt2">'+U.quote('Nhà mình sống theo ngày thì mãi chỉ giải quyết được việc của ngày. Bảng tầm nhìn là thứ duy nhất cho phép nhà mình từ chối một việc tốt vì nó không nối về đâu cả.','Kim chỉ nam · Định hướng')+'</div>';
  return o;
};

/* ══════════════════ 01 · TỪ NỖI ĐAU ĐẾN KHÁT KHAO ══════════════════ */
G.VIEWS['chuyen-hoa'] = function(){
  var o = U.ph({eyebrow:'NHÓM 01 · KHỞI NGUỒN', ic:'flame', grad:1, t:'Từ nỗi đau đến khát khao',
    lead:'Bảy chuyển dịch làm nên một gia đình khác. Mỗi chuyển dịch có một đòn bẩy cụ thể và một bằng chứng để biết mình đã qua.'});
  o += G.CHUYENDICH.map(function(c,i){
    var m = G.GITA.filter(function(g){return g.k===c.mien;})[0] || G.GITA[0];
    return '<div class="card lift mb" style="border-color:'+c.c+'2e">'+
      '<div class="row wrap" style="gap:9px;margin-bottom:14px">'+
        '<span class="pill" style="background:'+c.c+'22;color:'+c.c+'">CHUYỂN DỊCH '+(i+1)+'</span>'+
        U.chip(c.linh)+U.chip('Miền '+c.mien+' · '+m.short, c.c)+'</div>'+
      U.ba(c.dau, c.khat) +
      '<div class="grid g2 mt2" style="gap:12px">'+
        '<div style="padding:13px;border-radius:14px;background:var(--gita-mo-1);border:1px solid var(--gita-mo-2)">'+
          '<div class="tiny up" style="color:var(--gold-ink)">ĐÒN BẨY</div><p class="sm mt" style="line-height:1.6">'+h(c.don)+'</p></div>'+
        '<div style="padding:13px;border-radius:14px;background:var(--phu-2);border:1px solid var(--line)">'+
          '<div class="tiny up muted">BẰNG CHỨNG ĐÃ QUA</div><p class="sm mt" style="line-height:1.6">'+h(c.bang)+'</p></div>'+
      '</div></div>';
  }).join('');
  return o;
};

/* ══════════════════ 01 · HÀNH TRÌNH CỦA CON ══════════════════ */
G.VIEWS['hanh-trinh-con'] = function(){
  var f = G.myFamily(), L = G.LOTRINH;
  var o = U.ph({eyebrow:'NHÓM 01 · KHỞI NGUỒN', ic:'star', grad:1, t:'Hành trình của con',
    lead:L.tongQuan});

  o += '<div class="card glow mb"><div class="row wrap" style="gap:20px">'+
    U.ring(Math.round(f.ngay/365*100), G.tierOf(f.tier).c, 'NĂM NAY') +
    '<div class="grow" style="min-width:220px"><div class="up muted">ĐANG Ở</div>'+
    '<h2 style="font-size:26px;font-weight:800;margin:4px 0 6px;color:'+G.tierOf(f.tier).c+'">'+
      h(G.tierOf(f.tier).code+' · '+G.tierOf(f.tier).name)+'</h2>'+
    '<p class="sm dim">'+h(G.tierOf(f.tier).feel)+'</p>'+
    '<p class="sm muted mt">Ngày thứ '+f.ngay+' · '+h(f.hv)+' · '+h(f.lop)+'</p></div></div></div>';

  o += U.sec('NĂM CHẶNG THAY ĐỔI', L.ten);
  o += '<div class="tl">' + (L.chang||[]).map(function(c,i){
    var t = G.TIERS[i] || G.TIERS[0], cur = (i+1)===f.tier;
    return '<div class="tl-i" style="color:'+t.c+'">'+
      '<div class="card '+(cur?'glow':'')+'" style="border-color:'+t.c+(cur?'66':'22')+'">'+
      '<div class="row wrap" style="gap:8px;margin-bottom:8px">'+U.chip(t.code, t.c)+
      (cur?U.chip('ĐANG Ở ĐÂY','var(--gita)',1):'')+'</div>'+
      '<b style="font-size:16px;display:block;margin-bottom:8px;color:'+t.c+'">'+h(c.ten)+'</b>'+
      '<div class="mt" style="display:flex;flex-direction:column;gap:9px">'+
        G.fromTo('CON', c.hocVienTuGi, c.hocVienSangGi)+
        G.fromTo('NGƯỜI LỚN', c.phuHuynhTuGi, c.phuHuynhSangGi)+
      '</div>'+
      '<div class="grid g2 mt" style="gap:9px">'+
        '<div class="tiny" style="padding:9px 11px;border-radius:10px;background:var(--phu-2)">'+
          '<span class="up muted">QUYỀN ĐIỀU HÀNH</span><p class="mt" style="color:var(--ink-2);line-height:1.5">'+h(c.quyenDieuHanh)+'</p></div>'+
        '<div class="tiny" style="padding:9px 11px;border-radius:10px;background:var(--phu-2)">'+
          '<span class="up muted">MỨC HỖ TRỢ</span><p class="mt" style="color:var(--ink-2);line-height:1.5">'+h(c.mucHoTro)+'</p></div>'+
      '</div>'+
      (c.dauHieuNhanBiet?'<div class="mt sm" style="color:var(--ok);display:flex;gap:8px"><span style="flex:none;margin-top:3px">'+ic('check','w-3 h-3')+'</span><span>Dấu hiệu nhận biết: '+h(c.dauHieuNhanBiet)+'</span></div>':'')+
      '</div></div>';
  }).join('') + '</div>';

  if(L.chotLai) o += '<div class="mt2">'+U.quote(L.chotLai, 'Lộ trình thay đổi cùng GITA 365')+'</div>';
  return o;
};

/* Mảnh "từ → sang" dùng lại nhiều nơi */
G.fromTo = function(lb, from, to){
  if(!from && !to) return '';
  return '<div style="display:flex;gap:10px;align-items:flex-start;font-size:12.5px;line-height:1.55">'+
    '<span class="pill" style="background:var(--phu-3);color:var(--ink-3);flex:none;margin-top:2px">'+h(lb)+'</span>'+
    '<span style="color:var(--ink-3);text-decoration:line-through;opacity:.75">'+h(from)+'</span>'+
    '<span style="color:var(--gold-ink);flex:none">→</span>'+
    '<span style="color:var(--ink)">'+h(to)+'</span></div>';
};

/* ══════════════════ 01 · BẢN ĐỒ ĐIỂM CHẠM CẢM XÚC ══════════════════ */
G.VIEWS['diem-cham'] = function(){
  /* Dữ liệu của màn này nằm trong gói NGHỀ. Vai không được cấp gói đó thì
     biến DIEMCHAM là undefined và màn văng lỗi — trắng màn, không câu nào giải
     thích. Hôm nay G.allowed() chặn trước nên chưa ai gặp; nhưng một lần
     nới quyền trong bảng NAV là gặp ngay. Chặn tại chỗ thì không phụ
     thuộc vào bảng quyền còn đúng hay không. */
  if(!G.DIEMCHAM) return U.empty('Chưa mở được bản đồ điểm chạm','Phần này nằm trong kho nghề.');
  var o = U.ph({eyebrow:'NHÓM 01 · KHỞI NGUỒN', ic:'heart', grad:1, t:'Bản đồ điểm chạm cảm xúc',
    lead:'Chín khoảnh khắc quyết định một gia đình có ở lại hay không. Mỗi điểm chạm có một cảm xúc đang có, một nỗi sợ, một việc hệ thống phải làm và một câu nói đúng nhịp.'});

  var avg = Math.round(G.DIEMCHAM.reduce(function(a,x){return a+x.muc;},0)/G.DIEMCHAM.length);
  o += '<div class="grid g4 mb">'+
    U.stat({k:'ĐIỂM CHẠM', v:'9', d:'trên toàn hành trình', c:'#BE0E16'})+
    U.stat({k:'MỨC CHẠM TRUNG BÌNH', v:avg, d:'thang 0 – 100', c:'#185AB4'})+
    U.stat({k:'MẠNH NHẤT', v:'DC-07', d:'chiến thắng đầu tiên · 99', c:'#185AB4'})+
    U.stat({k:'CẦN NÂNG', v:'DC-09', d:'muốn lan toả · 92', c:'#0B7350'})+
  '</div>';

  o += G.DIEMCHAM.map(function(d){
    return '<div class="card lift mb" style="border-color:'+d.c+'2e">'+
      '<div class="row wrap" style="gap:10px;margin-bottom:12px">'+
        '<span style="width:38px;height:38px;border-radius:12px;display:grid;place-items:center;font-weight:900;'+
        'background:'+d.c+'22;color:'+d.c+'">'+d.no+'</span>'+
        '<div class="grow" style="min-width:180px"><b style="font-size:16px;display:block">'+h(d.ten)+'</b>'+
        '<span class="tiny muted">'+h(d.khi)+'</span></div>'+
        '<div style="text-align:right"><b class="mono" style="font-size:21px;color:'+d.c+'">'+d.muc+'</b>'+
        '<div class="tiny muted">mức chạm</div></div>'+
      '</div>'+
      '<div class="grid g2" style="gap:12px">'+
        '<div style="padding:12px;border-radius:13px;background:rgba(248,113,113,.06);border:1px solid rgba(248,113,113,.2)">'+
          '<div class="tiny up" style="color:var(--bad)">HỌ ĐANG CẢM THẤY</div>'+
          '<p class="sm mt">'+h(d.dangCam)+'</p>'+
          '<div class="tiny mt" style="color:var(--bad);opacity:.85">Nỗi sợ: '+h(d.noiSo)+'</div></div>'+
        '<div style="padding:12px;border-radius:13px;background:rgba(52,211,153,.06);border:1px solid rgba(52,211,153,.22)">'+
          '<div class="tiny up" style="color:var(--ok)">HỆ THỐNG PHẢI LÀM</div>'+
          '<p class="sm mt">'+h(d.heThongLam)+'</p></div>'+
      '</div>'+
      '<div class="mt2" style="padding:14px 16px;border-radius:14px;background:'+d.c+'0f;border-left:2px solid '+d.c+'">'+
        '<div class="tiny up" style="color:'+d.c+';margin-bottom:6px">CÂU NÓI ĐÚNG NHỊP</div>'+
        '<p class="serif" style="font-size:16px;font-style:italic;line-height:1.6;color:var(--ink)">"'+h(d.cauMo)+'"</p></div>'+
      '<div class="sm mt" style="color:var(--ok);display:flex;gap:8px;align-items:flex-start">'+
        '<span style="flex:none;margin-top:3px">'+ic('check','w-3 h-3')+'</span>'+
        '<span>Đạt khi: '+h(d.datKhi)+'</span></div>'+
    '</div>';
  }).join('');
  return o;
};
/* ══════════════════ 02 · LỘ TRÌNH T1 → T5 ══════════════════ */
G.VIEWS['lo-trinh'] = function(){
  var f = G.myFamily();
  var o = U.ph({eyebrow:'NHÓM 02 · HÀNH TRÌNH', ic:'compass', grad:1, t:'Lộ trình năm tầng',
    lead:'Mỗi tầng trả lời đúng một câu hỏi. Đi sai thứ tự là vỡ trận — không phải vì thiếu cố gắng, mà vì hỏi sai câu ở sai lúc.'});

  o += '<div class="grid g5 mb">' + G.TIERS.map(function(t){
    var cur = t.id===f.tier, done = t.id<f.tier;
    return '<div class="card '+(cur?'glow':'')+'" style="border-color:'+t.c+(cur?'66':'22')+';'+(done?'opacity:.8':'')+'">'+
      '<div class="row" style="gap:7px;margin-bottom:8px">'+
        '<span style="width:30px;height:30px;border-radius:9px;display:grid;place-items:center;font-weight:900;font-size:12.5px;background:'+t.c+'22;color:'+t.c+'">'+t.code+'</span>'+
        (done?'<span style="color:var(--ok)">'+ic('check','w-4 h-4')+'</span>':'')+
        (cur?U.chip('ĐANG Ở','var(--gita)',1):'')+'</div>'+
      '<b style="font-size:14.5px;display:block;color:'+t.c+'">'+h(t.name)+'</b>'+
      '<p class="tiny muted mt" style="font-style:italic">'+h(t.q)+'</p>'+
      '<div class="mono tiny mt2" style="color:var(--ink-4)">'+t.days+' ngày</div>'+
    '</div>';
  }).join('') + '</div>';

  o += G.TIERS.map(function(t){
    return '<div class="card lift mb" style="border-color:'+t.c+'2a">'+
      '<div class="row wrap" style="gap:10px;margin-bottom:10px">'+
        U.chip(t.code+' · '+t.name, t.c)+U.chip(t.days+' ngày')+
        '<span class="serif" style="font-style:italic;color:'+t.c+';font-size:16px">'+h(t.q)+'</span></div>'+
      '<div class="grid g2" style="gap:12px">'+
        '<div><div class="tiny up muted mb">MỤC TIÊU CỦA TẦNG</div><p class="sm dim">'+h(t.goal)+'</p></div>'+
        '<div><div class="tiny up muted mb">RANH GIỚI CỦA TẦNG</div><p class="sm dim">'+h(t.note)+'</p></div>'+
      '</div>'+
      '<div class="mt2" style="padding:11px 14px;border-radius:12px;background:'+t.c+'0f;border-left:2px solid '+t.c+'">'+
        '<span class="tiny up" style="color:'+t.c+'">CẢM GIÁC KHI QUA ĐƯỢC</span>'+
        '<p class="sm mt">'+h(t.feel)+'</p></div></div>';
  }).join('');

  if(G.LOTRINH.duongCong)
    o += '<div class="card mt2" style="border-color:rgba(251,146,60,.3)">'+
      '<div class="row mb"><span style="color:var(--alert)">'+ic('pulse','w-4 h-4')+'</span><b>Đường đi này không thẳng — ba chỗ tụt đã biết trước</b></div>'+
      '<p class="sm dim" style="line-height:1.7">'+h(G.LOTRINH.duongCong)+'</p></div>';
  return o;
};

/* ══════════════════ 02 · BẢN ĐỒ G–I–T–A ══════════════════ */
G.VIEWS['gita-map'] = function(){
  var o = U.ph({eyebrow:'NHÓM 02 · HÀNH TRÌNH', ic:'brain', grad:1, t:'Bản đồ G – I – T – A',
    lead:'Bốn miền để đọc đúng nguyên nhân và thiết kế đúng giải pháp. Can thiệp sai miền thì làm bao nhiêu cũng không dịch chuyển.'});
  o += '<div class="grid g2">' + G.GITA.map(function(g){
    return '<div class="card lift" style="border-color:'+g.c+'33">'+
      '<div class="row" style="gap:12px;margin-bottom:12px">'+
        '<span style="width:52px;height:52px;border-radius:16px;display:grid;place-items:center;font-weight:900;'+
        'font-size:26px;background:'+g.c+'22;color:'+g.c+';flex:none">'+g.k+'</span>'+
        '<div><b style="font-size:16px;display:block">'+h(g.name)+'</b>'+
        '<span class="tiny muted">'+h(g.short)+'</span></div></div>'+
      '<p class="sm dim" style="line-height:1.65">'+h(g.desc)+'</p>'+
      '<div class="mt2" style="padding:12px 14px;border-radius:13px;background:'+g.c+'0f;border-left:2px solid '+g.c+'">'+
        '<div class="tiny up" style="color:'+g.c+';margin-bottom:5px">CÂU HỎI THĂM DÒ</div>'+
        '<p class="sm" style="font-style:italic">'+h(g.probe)+'</p></div>'+
      '<div class="mt"><div class="tiny up muted mb">MIỀN NÀY GỒM</div>'+
        '<div class="row wrap" style="gap:5px">'+g.inc.map(function(x){return U.chip(x,g.c);}).join('')+'</div></div>'+
    '</div>';
  }).join('') + '</div>';

  o += U.sec('CAN THIỆP ĐÚNG TẦNG', 'Kim chỉ nam số 02 — rút từ mô thức MT-09');
  o += '<div class="card">'+U.quote('Nhắc con dậy sớm là can thiệp tầng Hành vi. Nếu điểm nghẽn nằm ở tầng Niềm tin thì nhắc bao nhiêu cũng vô ích. Trước khi giao việc, phải biết mình đang đứng ở tầng nào.','Mô thức MT-09 · Sáu cấp độ tư duy')+'</div>';
  return o;
};

/* ══════════════════ 02 · CHU KỲ 21 / 90 NGÀY ══════════════════ */
G.VIEWS['chu-ky'] = function(){
  var f = G.myFamily();
  var pdca = [
    {k:'P',t:'PLAN — Chốt một đòn bẩy',c:'#185AB4',d:'Chọn đúng MỘT điểm chạm nhỏ nhất tạo thay đổi lớn nhất cho 21 ngày tới. Không chọn hai.'},
    {k:'D',t:'DO — Chạy đủ 21 ngày',c:'#5140B4',d:'Mỗi vòng bảy ngày chỉ thay một biến. Ghi lại cả ngày làm được và ngày không.'},
    {k:'C',t:'CHECK — Đọc bằng số',c:'#BE0E16',d:'So với chính nhà mình ba tuần trước. Tìm ngoại lệ tốt: hôm nào khác, và khác vì đâu.'},
    {k:'A',t:'ACT — Giữ, bỏ hoặc nâng',c:'#0B7350',d:'Việc nối được về tầm nhìn thì giữ. Việc không nối được thì bỏ, dù nó tốt.'}
  ];
  var o = U.ph({eyebrow:'NHÓM 02 · HÀNH TRÌNH', ic:'ritual', t:'Chu kỳ 21 / 90 ngày',
    lead:'Hai mươi mốt ngày làm nên một cấp độ học tập. Chín mươi ngày làm nên một chặng. Mỗi chặng kết bằng một cổng nghiệm thu có bằng chứng.'});

  o += '<div class="grid g4">' + pdca.map(function(p){
    return '<div class="card lift" style="border-color:'+p.c+'33">'+
      '<div class="row" style="gap:10px;margin-bottom:8px">'+
        '<span style="width:36px;height:36px;border-radius:11px;display:grid;place-items:center;font-weight:900;background:'+p.c+'22;color:'+p.c+'">'+p.k+'</span>'+
        '<b class="sm">'+h(p.t)+'</b></div>'+
      '<p class="tiny muted" style="line-height:1.6">'+h(p.d)+'</p></div>';
  }).join('') + '</div>';

  o += U.sec('BỐN CHẶNG CHÍN MƯƠI NGÀY', G.VANHANH.khoang[3].kpi);
  var chang = ['Có cấu trúc','Tự điều hành','Thích ứng','Chuyển giao'];
  o += '<div class="grid g4">' + chang.map(function(c,i){
    var done = f.ngay > (i+1)*90, cur = !done && f.ngay > i*90;
    var col = ['#2A72C6','#5140B4','#0B6675','#0B7350'][i];
    return '<div class="card '+(cur?'glow':'')+'" style="border-color:'+col+(cur?'66':'22')+'">'+
      '<div class="row" style="gap:8px;margin-bottom:8px">'+
        '<span class="pill" style="background:'+col+'22;color:'+col+'">CHẶNG '+(i+1)+'</span>'+
        (done?'<span style="color:var(--ok)">'+ic('check','w-4 h-4')+'</span>':'')+'</div>'+
      '<b class="sm" style="display:block;margin-bottom:8px">'+h(c)+'</b>'+
      U.bar(done?100:(cur?Math.round((f.ngay-i*90)/90*100):0), col)+
      '<div class="tiny muted mt">Ngày '+(i*90+1)+' – '+((i+1)*90)+'</div></div>';
  }).join('') + '</div>';

  o += U.sec('ĐÊM RÀ ĐÒN BẨY — mỗi 21 ngày', 'Giữ cho gia đình không rơi vào bẫy làm nhiều mà không dịch chuyển');
  var nl = G.NGHILE[2];
  o += '<div class="card" style="border-color:'+nl.c+'33">'+U.list(nl.buoc, nl.c)+
    '<p class="sm dim mt2" style="padding-top:12px;border-top:1px dashed var(--phu-4)">'+h(nl.qua)+'</p></div>';

  /* ══ MƯỜI NGHI LỄ CHO LÚC LỆCH NHỊP ══
     Bốn nghi lễ nhịp đều chỉ phủ được lúc nhà mình đang chạy êm. Còn
     lúc đứt chuỗi, cãi nhau, con thi trượt, người lớn kiệt sức — đó
     đúng là lúc gia đình cần một khuôn để bám vào nhất, mà trước bản
     này không có nghi lễ nào. Lúc bình thường thì ai cũng xoay xở được.

     Mỗi nghi lễ có MỐC KÍCH HOẠT rõ, để không ai phải tự hỏi "giờ có
     nên làm không". */
  var TH = G.NGHILE_TH || [];
  if(TH.length){
    o += U.sec('MƯỜI NGHI LỄ CHO LÚC NHÀ MÌNH LỆCH NHỊP',
      'Mỗi cái có mốc kích hoạt rõ · bấm để mở các bước');
    o += '<div class="grid g-auto">'+ TH.map(function(x){
      return '<button class="card pad-sm lift" data-nlth="'+h(x.ma)+'" style="text-align:left;'+
        'border-left:3px solid '+x.c+'">'+
        '<div class="row" style="gap:7px;align-items:baseline;flex-wrap:wrap">'+
          '<span class="mono tiny" style="color:'+x.c+'">'+h(x.phut)+'</span>'+
          '<span class="chip" style="color:var(--ink-4)">'+h(x.khi)+'</span></div>'+
        '<b class="sm" style="display:block;line-height:1.4;margin-top:5px">'+h(x.ten)+'</b>'+
        '<p class="tiny muted mt" style="line-height:1.55">'+h(x.kich)+'</p></button>';
    }).join('') +'</div>';
  }

  var LU = G.NGHILE_LUAT || [];
  if(LU.length){
    o += U.sec('SÁU LUẬT CHUNG CHO MỌI NGHI LỄ',
      'Nghi lễ hỏng không phải vì làm thiếu, mà vì làm thừa');
    o += '<div class="card">'+ LU.map(function(x, i){
      return '<div style="'+(i ? 'border-top:1px solid var(--line);padding-top:13px;margin-top:13px' : '')+'">'+
        '<b class="sm">'+h(x.t)+'</b>'+
        '<p class="sm muted mt" style="line-height:1.7">'+h(x.y)+'</p></div>';
    }).join('') +'</div>';
  }
  return o;
};

/* Cửa sổ một nghi lễ tình huống */
G.nghiLeModal = function(ma){
  var x = (G.NGHILE_TH || []).filter(function(y){ return y.ma === ma; })[0];
  if(!x) return;
  U.modal('<div class="row wrap" style="gap:7px;margin-bottom:9px">'+
    U.chip(x.phut, x.c)+U.chip(x.khi)+'</div>'+
    '<h2 style="font-size:21px;font-weight:800;line-height:1.3;margin-bottom:10px">'+h(x.ten)+'</h2>'+
    '<div class="card pad-sm mb" style="border-color:'+x.c+'44">'+
      '<div class="tiny up mb" style="color:'+x.c+'">LÀM KHI NÀO</div>'+
      '<p class="sm" style="line-height:1.7">'+h(x.kich)+'</p></div>'+
    '<div class="card pad-sm mb"><div class="tiny up mb muted">CÁC BƯỚC</div>'+
      U.list(x.buoc, x.c)+'</div>'+
    '<div class="card pad-sm mb" style="border-color:var(--gita-do)">'+
      '<div class="tiny up mb" style="color:var(--gita-do-ink)">KHÔNG LÀM NHỮNG ĐIỀU NÀY</div>'+
      U.list(x.khong, 'var(--gita-do)')+'</div>'+
    '<div class="card pad-sm mb"><div class="tiny up mb muted">AI CHỦ TRÌ</div>'+
      '<p class="sm" style="line-height:1.7">'+h(x.ai)+'</p></div>'+
    '<div class="card pad-sm mb" style="border-color:var(--alert)">'+
      '<div class="tiny up mb" style="color:var(--alert)">DẤU HIỆU NGHI LỄ ĐANG HỎNG</div>'+
      '<p class="sm" style="line-height:1.7">'+h(x.hong)+'</p></div>'+
    '<div class="card pad-sm"><div class="tiny up mb" style="color:var(--ok)">ĐƯỢC GÌ</div>'+
      '<p class="sm" style="line-height:1.7">'+h(x.qua)+'</p></div>');
};
document.addEventListener('click', function(e){
  var a = e.target && e.target.closest && e.target.closest('[data-nlth]');
  if(a) G.nghiLeModal(a.getAttribute('data-nlth'));
}, false);

/* ══════════════════ 02 · NHIỆM VỤ & NHẬT KÝ 365 ══════════════════ */
G.VIEWS['nhiem-vu'] = function(){
  var p = G.myPortal(), list = G.TODAY[p] || G.TODAY.ph;
  var done = list.filter(function(x,i){ return G.S.checks['t'+i]; }).length;
  var o = U.ph({eyebrow:'NHÓM 02 · HÀNH TRÌNH', ic:'check', t:'Nhiệm vụ hôm nay',
    lead:'Đúng một nhóm việc cho vai của anh chị hôm nay. Không dài hơn. Hào hứng hôm nay không trả nổi hoá đơn của ngày thứ tư.'});

  o += '<div class="card glow mb"><div class="row wrap" style="gap:20px">'+
    U.ring(Math.round(done/list.length*100), '#0B7350', 'HÔM NAY')+
    '<div class="grow" style="min-width:200px"><div class="up muted">VAI ĐANG DÙNG</div>'+
    '<h2 style="font-size:21px;font-weight:800;margin:4px 0">'+h(G.S.roleObj.n)+'</h2>'+
    '<p class="sm dim">'+h(G.S.roleObj.ln)+'</p>'+
    '<p class="sm mt" style="color:var(--gold-ink)">'+done+' / '+list.length+' việc đã xong</p></div></div></div>';

  o += '<div class="grid g2" style="gap:20px"><div>'+
    U.sec('VIỆC CỦA HÔM NAY','Bấm để đánh dấu đã xong');
  o += list.map(function(x,i){
    var d = !!G.S.checks['t'+i];
    return '<button class="ck '+(d?'done':'')+'" data-check="t'+i+'">'+
      '<span class="bx">'+ic('check','w-3 h-3')+'</span>'+
      '<span class="tx"><b>'+h(x.t)+'</b><span>'+h(x.s)+'</span></span></button>';
  }).join('');
  o += '</div><div>';

  o += U.sec('NHẬT KÝ BA DÒNG','Ba dòng, không cần đẹp. Dòng "quên" cũng là dữ liệu thật.');
  var rows = [
    {k:'j1', t:'Giờ ngồi vào bàn', p:'ví dụ: 20h15'},
    {k:'j2', t:'Giờ rời bàn', p:'ví dụ: 21h40'},
    {k:'j3', t:'Số lần phải nhắc', p:'ví dụ: 1'}
  ];
  o += '<div class="card">' + rows.map(function(r){
    return '<div style="margin-bottom:12px"><div class="tiny up muted mb">'+h(r.t)+'</div>'+
      '<input data-journal="'+r.k+'" value="'+h((G.S.journal||{})[r.k]||'')+'" placeholder="'+h(r.p)+'" '+
      'style="width:100%;background:var(--phu-2);border:1px solid var(--line);border-radius:11px;'+
      'padding:10px 13px;font-size:14.5px;outline:none"></div>';
  }).join('') +
  '<button class="btn pri blk mt" data-act="save-journal">'+ic('check')+'Ghi nhật ký tối nay</button>'+
  '<p class="tiny muted mt" style="text-align:center">Ăn cơm xong là mở sổ — bữa cơm chính là tín hiệu.</p></div>';
  o += '</div></div>';
  return o;
};

/* ══════════════════ 02 · MƯỜI CHÂN DUNG THÀNH CÔNG ══════════════════ */
G.VIEWS['chan-dung-tc'] = function(){
  /* Kho này về gói NGHỀ từ 9.8. Vai không có gói ấy vẫn có thể gọi thẳng
     hàm dựng màn — cột trái đã ẩn mục, nhưng ẩn không phải là canh cửa. */
  if (!G.CHANDUNG) return U.empty('Chưa mở được bộ chân dung',
    'Mười chân dung thành công là công cụ nghề, nằm trong gói nghề. Đăng nhập bằng tài khoản có phạm vi ấy để mở.');

  var o = U.ph({eyebrow:'NHÓM 02 · HÀNH TRÌNH', ic:'crown', grad:1, t:'Mười chân dung thành công',
    lead:'Người đi trước trông như thế nào — cho cả học viên và người lớn, ở cả năm tầng. Mỗi chân dung đều nói rõ điều nó CHƯA phải là.'});
  o += '<div class="row wrap mb" style="gap:6px">'+
    '<button class="chip on" data-cd="ALL">Tất cả</button>'+
    G.TIERS.map(function(t){return '<button class="chip" data-cd="'+t.code+'">'+t.code+'</button>';}).join('')+
    '<button class="chip" data-cd="HS">Học viên</button><button class="chip" data-cd="PH">Người lớn</button></div>';
  o += '<div class="grid g2" id="cdGrid">' + G.CHANDUNG.map(function(c){
    var t = G.TIERS.filter(function(x){return x.code===c.tier;})[0] || G.TIERS[0];
    return '<div class="card lift" data-cdi="'+h(c.tier)+' '+h(c.audience)+'" style="border-color:'+t.c+'2a">'+
      '<div class="row wrap" style="gap:7px;margin-bottom:9px">'+U.chip(c.tier,t.c)+
      U.chip(c.audience==='HS'?'Học viên':'Người lớn')+'</div>'+
      '<b style="font-size:14.5px;display:block;line-height:1.35;margin-bottom:9px">'+h(c.tieuDe)+'</b>'+
      '<p class="serif" style="font-size:14.5px;font-style:italic;color:'+t.c+';line-height:1.55">"'+h(c.cauChotLoi)+'"</p>'+
      (c.tuDuyDoi?'<div class="mt2">'+G.fromTo('TƯ DUY', c.tuDuyDoi.tu, c.tuDuyDoi.sang)+'</div>':'')+
      '<button class="btn ghost sm mt2" data-cdopen="'+h(c.id)+'">Mở chân dung đầy đủ '+ic('arrow')+'</button>'+
    '</div>';
  }).join('') + '</div>';
  return o;
};

G.chanDungModal = function(id){
  var c = G.CHANDUNG.filter(function(x){return x.id===id;})[0]; if(!c) return;
  var t = G.TIERS.filter(function(x){return x.code===c.tier;})[0] || G.TIERS[0];
  var o = '<div class="row wrap" style="gap:7px;margin-bottom:10px">'+U.chip(c.tierName,t.c)+
    U.chip(c.audience==='HS'?'Học viên':'Người lớn')+
    (c.gitaFocus?c.gitaFocus.map(function(g){return U.chip('Miền '+g);}).join(''):'')+'</div>'+
    '<h2 style="font-size:21px;font-weight:800;line-height:1.3;margin-bottom:10px">'+h(c.tieuDe)+'</h2>'+
    '<p class="serif" style="font-size:16px;font-style:italic;color:'+t.c+';margin-bottom:18px">"'+h(c.cauChotLoi)+'"</p>';
  if(c.tuDuyDoi) o += '<div class="card pad-sm mb">'+G.fromTo('TƯ DUY', c.tuDuyDoi.tu, c.tuDuyDoi.sang)+'</div>';
  var blocks = [['TRƯỚC KHI VÀO', c.truocKhiVao, '#BE0E16'],['SAU KHI RA', c.sauKhiRa, '#0B7350'],
    ['TRÍ TUỆ MỚI', c.triTueMoi, '#5140B4'],['HÀNH VI MỚI', c.hanhViMoi, '#0B6675'],
    ['NGƯỜI KHÁC THẤY GÌ', c.nguoiKhacThay, 'var(--gita)'],['BẰNG CHỨNG QUA CHẶNG', c.bangChung, '#0B7350'],
    ['CHƯA PHẢI LÀ', c.chuaPhaiLa, '#FB923C']];
  o += blocks.map(function(b){
    if(!b[1] || !b[1].length) return '';
    return '<div class="mt2"><div class="up mb" style="color:'+b[2]+'">'+b[0]+'</div>'+U.list(b[1], b[2])+'</div>';
  }).join('');
  U.modal(o);
};

/* ══════════════════ 02 · CỔNG NGHIỆM THU ══════════════════ */
G.VIEWS['cong-nghiem-thu'] = function(){
  if(!G.can('pro_approve')) return U.lockCard();
  var o = U.ph({eyebrow:'NHÓM 02 · HÀNH TRÌNH', ic:'shield', t:'Cổng nghiệm thu',
    lead:'Qua chặng bằng bằng chứng, không bằng lời. Mỗi lần nâng chặng là trao một quyền mới kèm một trách nhiệm mới.'});
  var rows = G.dsNha().map(function(f){
    var t = G.tierOf(f.tier), sang = f.ngay % 90, san = sang > 75;
    return [
      '<b>'+h(f.nha)+'</b><div class="tiny muted">'+h(f.hv)+' · '+h(f.lop)+'</div>',
      U.chip(t.code+' · '+t.name, t.c),
      '<span class="mono">'+f.ngay+'</span>',
      '<div style="min-width:110px">'+U.bar(Math.round(sang/90*100), t.c)+'<span class="tiny muted">'+sang+'/90 ngày chặng</span></div>',
      '<span class="mono b" style="color:'+G.bandColor(f.band)+'">'+h(f.band)+'</span>',
      san ? '<span class="chip on">Sẵn sàng mở cổng</span>' : '<span class="chip">Đang chạy chặng</span>'
    ];
  });
  o += U.tbl(['Gia đình','Tầng','Ngày','Tiến trình chặng','Băng','Trạng thái cổng'], rows);

  o += U.sec('BỐN ĐIỀU KIỆN MỞ CỔNG', 'Thiếu một điều là chưa mở — không có ngoại lệ vì thiện chí');
  var dk = [
    {t:'Có bằng chứng năng lực',d:'Sản phẩm, bản ghi hoặc dữ liệu do chính học viên tạo ra, không phải lời kể của người lớn.'},
    {t:'Mức tự chủ tăng so với chặng trước',d:'So với chính nhà đó, không so với nhà khác.'},
    {t:'Mức hỗ trợ giảm nhưng không về không',d:'Rút hỗ trợ về không rồi gọi đó là tự lập là làm hỏng chặng sau.'},
    {t:'Người lớn nêu được phần thay đổi của mình',d:'Không có phần này thì chặng của con đứng trên nền cát.'}
  ];
  o += '<div class="grid g2">' + dk.map(function(x,i){
    return '<div class="card pad-sm"><div class="row" style="gap:9px;margin-bottom:6px">'+
      '<span class="pill" style="background:rgba(16,185,129,.18);color:var(--ok)">ĐK '+(i+1)+'</span>'+
      '<b class="sm">'+h(x.t)+'</b></div><p class="tiny muted" style="line-height:1.55">'+h(x.d)+'</p></div>';
  }).join('') + '</div>';
  return o;
};

})();
