/* ═══════════════════════════════════════════════════════════════
   GITA 365 · v7.0 — KIẾN TRÚC 100 NĂM · WOW · CHUẨN NHẬT ·
   AI ĐIỀU PHỐI · LÁ CHẮN DỮ LIỆU
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;
G.VIEWS = G.VIEWS || {};
(function(){
var U = G.U, h = U.h, ic = U.ic;

/* ═══════════════ KIẾN TRÚC 100 NĂM ═══════════════ */
G.VIEWS['kien-truc-100'] = function(){
  /* Kho này về gói NGHỀ từ 9.8. Vai không có gói ấy vẫn có thể gọi thẳng
     hàm dựng màn — cột trái đã ẩn mục, nhưng ẩn không phải là canh cửa. */
  if (!G.TAMNHIN100) return U.empty('Chưa mở được kiến trúc một trăm năm',
    'Phần này nằm trong gói nghề. Đăng nhập bằng tài khoản có phạm vi ấy để mở.');

  var T = G.TAMNHIN100;
  var o = U.ph({eyebrow:'NHÓM 02 · HÀNH TRÌNH', ic:'sun', grad:1, t:'Kiến trúc một trăm năm',
    lead:T.cau});

  o += '<div class="card glow mb"><div class="row"><span style="color:var(--gold-ink)">'+ic('pulse','w-4 h-4')+'</span>'+
    '<b>Quy luật tăng trưởng của hệ thống</b></div>'+
    '<p class="sm dim mt" style="line-height:1.75">'+h(T.quyLuat)+'</p></div>';

  o += U.sec('NĂM THỜI KỲ','Mỗi thời kỳ mở một dải tầng giá trị mới, không phá dải trước');
  o += '<div class="tl">' + T.thoiKy.map(function(k){
    return '<div class="tl-i" style="color:'+k.c+'"><div class="card" style="border-color:'+k.c+'2e">'+
      '<div class="row wrap" style="gap:8px;margin-bottom:8px">'+U.chip(k.ky,k.c)+U.chip(k.tang)+'</div>'+
      '<b style="font-size:18px;color:'+k.c+';display:block;margin-bottom:8px">'+h(k.ten)+'</b>'+
      '<p class="sm dim" style="line-height:1.65;margin-bottom:10px">'+h(k.dich)+'</p>'+
      '<div style="padding:11px 13px;border-radius:12px;background:'+k.c+'0d;border-left:2px solid '+k.c+'">'+
      '<span class="tiny up" style="color:'+k.c+'">DẤU HIỆU THỜI KỲ NÀY ĐÃ XONG</span>'+
      '<p class="sm mt">'+h(k.dau)+'</p></div></div></div>';
  }).join('') + '</div>';

  o += U.sec('MỘT TRĂM TẦNG GIÁ TRỊ','Mười nhóm, mỗi nhóm mười tầng. Tầng sau chỉ mở khi tầng trước đã chạy được ở nhà thật.');
  o += '<div class="grid g2">' + G.TANG100.map(function(n){
    return '<div class="card" style="border-color:'+n.c+'26">'+
      '<div class="row" style="gap:9px;margin-bottom:10px">'+
      '<span class="pill" style="background:'+n.c+'22;color:'+n.c+'">TẦNG '+n.tu+'–'+(n.tu+9)+'</span>'+
      '<b style="font-size:14.5px;color:'+n.c+'">'+h(n.nhom)+'</b></div>'+
      n.muc.map(function(m,i){
        return '<div style="display:flex;gap:9px;padding:5px 0;font-size:12.5px;line-height:1.5">'+
          '<span class="mono tiny" style="color:'+n.c+';opacity:.7;flex:none;min-width:22px">'+(n.tu+i)+'</span>'+
          '<span style="color:var(--ink-2)">'+h(m)+'</span></div>';
      }).join('') + '</div>';
  }).join('') + '</div>';

  o += U.sec('LỘ TRÌNH PHIÊN BẢN','Mỗi năm thêm 3–5% giá trị mới — không nhảy vọt, không đứng yên');
  o += U.tbl(['Bản','Nội dung','Giá trị thêm'], T.phienBan.map(function(v){
    var cur = v.v==='v7.0';
    return ['<b class="mono" style="color:'+(cur?'var(--gold)':'var(--ink-2)')+'">'+h(v.v)+'</b>',
      '<span class="sm">'+h(v.n)+'</span>',
      cur?'<span class="chip on">'+h(v.d)+'</span>':'<span class="chip">'+h(v.d)+'</span>'];
  }));
  return o;
};

/* ═══════════════ CHUỖI WOW ═══════════════ */
G.VIEWS['wow'] = function(){
  var o = U.ph({eyebrow:'NHÓM 01 · KHỞI NGUỒN', ic:'spark', grad:1, t:'Chuỗi WOW',
    lead:'Bảy khoảnh khắc khiến một gia đình thốt lên "thật tuyệt vời" — và mỗi khoảnh khắc đều là một thứ họ nhận được, không phải một thứ được hứa.'});

  o += '<div class="card glow mb"><div class="row wrap" style="gap:24px;align-items:center">'+
    U.ring(7,'var(--gita)','WOW') +
    '<div class="grow" style="min-width:250px"><b style="font-size:18px;display:block;margin-bottom:6px">Giá trị nhận được lớn hơn nhiều lần số tiền bỏ ra</b>'+
    '<p class="sm dim" style="line-height:1.7">Ba trong bảy khoảnh khắc WOW xảy ra trước khi gia đình trả bất cứ khoản nào. '+
    'Bốn khoảnh khắc còn lại nằm trong lộ trình và không tính thêm phí. Một nhà đi hết năm tầng nhận về nhiều hơn hẳn phần họ đầu tư — '+
    'đó là lý do 78% khách mới đến từ giới thiệu chứ không từ quảng cáo.</p></div></div></div>';

  o += G.WOW.map(function(w,i){
    return '<div class="card lift mb" style="border-color:'+w.c+'2e">'+
      '<div class="row wrap" style="gap:11px;margin-bottom:11px">'+
        '<span style="width:38px;height:38px;border-radius:12px;display:grid;place-items:center;font-weight:900;'+
        'background:'+w.c+'22;color:'+w.c+'">'+(i+1)+'</span>'+
        '<div class="grow" style="min-width:190px"><b style="font-size:16px;display:block">'+h(w.t)+'</b>'+
        '<span class="tiny muted">'+h(w.khi)+'</span></div>'+
        U.chip(w.gia, w.gia==='Miễn phí'?'#0B7350':'#665E88')+'</div>'+
      '<div style="padding:15px 18px;border-radius:15px;background:'+w.c+'0f;border-left:2px solid '+w.c+'">'+
      '<p class="serif" style="font-size:16px;font-style:italic;line-height:1.6;color:var(--ink)">'+h(w.w)+'</p></div>'+
      '<div class="row mt2" style="gap:9px;align-items:flex-start"><span style="color:'+w.c+';flex:none;margin-top:3px">'+ic('spark','w-4 h-4')+'</span>'+
      '<span class="sm dim">'+h(w.ly)+'</span></div></div>';
  }).join('');
  return o;
};

/* ═══════════════ CHUẨN VẬN HÀNH KIỂU NHẬT ═══════════════ */
G.VIEWS['chuan-nhat'] = function(){
  /* Kho này về gói NGHỀ từ 9.8 — xem lý do ở tools/ma-hoa-kho.js. */
  if (!G.NHATBAN) return U.empty('Chưa mở được chuẩn Nhật',
    'Phần này nằm trong gói nghề. Đăng nhập bằng tài khoản có phạm vi ấy để mở.');

  var N = G.NHATBAN;
  var o = U.ph({eyebrow:'NHÓM 04 · CÚ HÍCH & NHỊP SỐNG', ic:'shield', grad:1, t:'Chuẩn vận hành',
    lead:N.cau});
  o += '<div class="grid g2">' + N.tru.map(function(t){
    return '<div class="card lift" style="border-color:'+t.c+'2e">'+
      '<div class="row wrap" style="gap:9px;margin-bottom:9px">'+
      '<b style="font-size:16px;color:'+t.c+'">'+h(t.k)+'</b></div>'+
      '<b class="sm" style="display:block;margin-bottom:8px">'+h(t.t)+'</b>'+
      '<p class="sm dim" style="line-height:1.65;margin-bottom:11px">'+h(t.d)+'</p>'+
      '<div style="padding:11px 13px;border-radius:12px;background:'+t.c+'0d;border-left:2px solid '+t.c+'">'+
      '<span class="tiny up" style="color:'+t.c+'">Ở GITA 365 NGHĨA LÀ</span>'+
      '<p class="sm mt">'+h(t.o)+'</p></div></div>';
  }).join('') + '</div>';

  o += U.sec('BỐN CAM KẾT KHÔNG ĐÁNH ĐỔI','Đây là chỗ phân biệt một hệ thống làm chắc với một hệ thống làm nhanh');
  o += '<div class="grid g2">' + N.camKet.map(function(c,i){
    return '<div class="card pad-sm"><div class="row" style="gap:9px;margin-bottom:6px">'+
      '<span class="pill" style="background:var(--gita-mo-2);color:var(--gold-ink)">0'+(i+1)+'</span>'+
      '<b class="sm">'+h(c.t)+'</b></div>'+
      '<p class="tiny muted" style="line-height:1.6;padding-left:34px">'+h(c.d)+'</p></div>';
  }).join('') + '</div>';
  return o;
};

/* ═══════════════ AI ĐIỀU PHỐI ═══════════════ */
G.VIEWS['ai-dieu-phoi'] = function(){
  /* Chính sách điều phối trợ lý, không phải hồ sơ của nhà nào. Tư vấn dùng
     trợ lý với gia đình từ buổi đầu; Phân tích dữ liệu cần đọc để đánh giá
     trợ lý đang trả lời ra sao. Cả hai đều nằm trong nghe_chung. */
  if(!G.can('nghe_chung')) return U.lockCard();
  var P = G.AIPOLICY;
  var o = U.ph({eyebrow:'NHÓM 05 · VẬN HÀNH', ic:'brain', grad:1, t:'AI điều phối',
    lead:'Trợ lý không thay người dẫn dắt. Nó làm ba việc: trả lời trong đúng phạm vi tầng, chuyển đúng câu hỏi tới đúng người, và nói cho người dẫn dắt biết họ cần nâng cấp gì để theo kịp lộ trình của gia đình mình.'});

  o += '<div class="card mb" style="border-color:var(--gita-vien-1)">'+
    '<div class="row"><span style="color:var(--gold-ink)">'+ic('shield','w-4 h-4')+'</span><b>Giới hạn cốt lõi</b></div>'+
    '<p class="sm dim mt" style="line-height:1.7">'+h(P.cot)+'</p></div>';

  o += U.sec('GIỚI HẠN THEO TỪNG TẦNG','Trợ lý biết mình được nói gì và không được nói gì ở mỗi tầng');
  o += '<div class="grid g5">' + P.theoTang.map(function(t){
    return '<div class="card pad-sm" style="border-color:'+t.c+'2a">'+
      '<div class="up mb" style="color:'+t.c+'">'+h(t.t)+'</div>'+
      '<div class="tiny" style="color:var(--ok);line-height:1.5;margin-bottom:7px">✓ '+h(t.duoc)+'</div>'+
      '<div class="tiny" style="color:var(--bad);line-height:1.5">✕ '+h(t.khong)+'</div></div>';
  }).join('') + '</div>';

  o += U.sec('ĐỊNH TUYẾN THEO KPI','Câu hỏi của gia đình được đọc theo miền G–I–T–A và tầng, rồi chuyển tới người phù hợp nhất — không phải người rảnh nhất');
  o += G.DINHTUYEN.map(function(d){
    var k = G.KPI.filter(function(x){return x.id===d.ai;})[0] || G.KPI[0];
    var m = G.GITA.filter(function(x){return x.k===d.mien;})[0] || G.GITA[0];
    return '<div class="card mb" style="border-color:'+k.c+'26">'+
      '<p class="serif" style="font-size:16px;font-style:italic;color:var(--ink);margin-bottom:11px">"'+h(d.hoi)+'"</p>'+
      '<div class="row wrap" style="gap:7px;margin-bottom:11px">'+
        U.chip('Miền '+d.mien+' · '+m.short, m.c)+U.chip('Tầng '+d.tang)+
        U.chip('Độ gấp: '+d.gap, d.gap==='Cao'?'#BE0E16':(d.gap==='Vừa'?'#BE0E16':'#665E88'))+'</div>'+
      '<div class="row wrap" style="gap:14px;padding:12px 14px;border-radius:13px;background:'+k.c+'0f">'+
        '<span style="width:34px;height:34px;border-radius:11px;display:grid;place-items:center;background:'+k.c+'26;color:'+k.c+';flex:none">'+ic('users','w-4 h-4')+'</span>'+
        '<div class="grow" style="min-width:170px"><b class="sm" style="display:block">'+h(k.ten)+'</b>'+
        '<span class="tiny muted">'+h(k.vai)+' · miền '+h(k.manh.join(', '))+' · '+h(k.tang.join(' '))+'</span></div>'+
        '<div style="display:flex;gap:16px">'+
        '<div class="center"><b class="mono" style="color:'+k.c+'">'+k.phanHoi+"'</b><div class=\"tiny muted\">PHẢN HỒI</div></div>"+
        '<div class="center"><b class="mono" style="color:'+k.c+'">'+k.hailong+'</b><div class="tiny muted">HÀI LÒNG</div></div>'+
        '<div class="center"><b class="mono" style="color:'+k.c+'">'+k.tai+'/'+k.tran+'</b><div class="tiny muted">TẢI</div></div>'+
        '</div></div>'+
      '<div class="row mt2" style="gap:9px;align-items:flex-start"><span style="color:'+k.c+';flex:none;margin-top:3px">'+ic('spark','w-4 h-4')+'</span>'+
      '<span class="sm dim" style="line-height:1.6">'+h(d.vi)+'</span></div></div>';
  }).join('');

  o += U.sec('AI RÀ SOÁT NĂNG LỰC NGƯỜI DẪN DẮT','Không phải để chấm điểm ai. Để người dẫn dắt không bị gia đình mình vượt qua trên lộ trình.');
  o += G.AINANGCAP.map(function(n){
    var dat = n.muc.indexOf('Đạt')===0;
    return '<div class="card mb" style="border-color:'+n.c+'26">'+
      '<div class="row wrap" style="gap:9px;margin-bottom:9px">'+
      '<b style="font-size:16px">'+h(n.ai)+'</b>'+U.chip(n.vai,n.c)+
      '<span class="chip" style="color:'+(dat?'var(--ok)':'var(--warn)')+';border-color:'+(dat?'rgba(52,211,153,.4)':'rgba(251,191,36,.4)')+'">'+h(n.muc)+'</span></div>'+
      '<p class="sm dim" style="line-height:1.65;margin-bottom:10px">'+h(n.phat)+'</p>'+
      '<div class="up mb" style="color:'+n.c+'">YÊU CẦU NÂNG CẤP</div>'+U.list(n.yeu, n.c)+'</div>';
  }).join('');

  o += U.sec('TUÂN THỦ','Năm nhóm ràng buộc mà trợ lý bị chặn không được vượt qua');
  o += '<div class="card">' + P.tuanThu.map(function(t,i){
    return '<div class="rule"><span class="n">'+(i+1)+'</span><div class="tx"><b>'+h(t.k)+'</b><p>'+h(t.d)+'</p></div></div>';
  }).join('') + '</div>';

  o += U.sec('NĂM ĐIỀU TRỢ LÝ KHÔNG BAO GIỜ LÀM','');
  o += '<div class="grid g2">' + P.khongBaoGio.map(function(k){
    return '<div class="card pad-sm" style="border-color:rgba(248,113,113,.22)">'+
      '<div style="display:flex;gap:9px"><span style="color:var(--bad);flex:none;margin-top:2px">'+ic('x','w-3 h-3')+'</span>'+
      '<span class="sm" style="line-height:1.55">'+h(k)+'</span></div></div>';
  }).join('') + '</div>';
  return o;
};

/* ═══════════════ LÁ CHẮN DỮ LIỆU ═══════════════ */
G.VIEWS['an-toan-du-lieu'] = function(){
  if(!G.can('pro_report')) return U.lockCard();
  var L = G.LACHAN;
  var o = U.ph({eyebrow:'NHÓM 05 · VẬN HÀNH', ic:'lock', grad:1, t:'Lá chắn dữ liệu',
    lead:L.cot});

  o += '<div class="card glow mb"><div class="row wrap" style="gap:16px;align-items:center">'+
    '<span style="width:44px;height:44px;border-radius:14px;display:grid;place-items:center;'+
    'background:'+(G.CONSENT?'rgba(251,146,60,.2);color:var(--alert)':'rgba(16,185,129,.18);color:var(--ok)')+';flex:none">'+
    ic(G.CONSENT?'out':'lock','w-5 h-5')+'</span>'+
    '<div class="grow" style="min-width:230px"><b style="font-size:16px;display:block">'+
    (G.CONSENT?'Quyền xuất dữ liệu đang MỞ cho phiên này':'Quyền xuất dữ liệu đang ĐÓNG')+'</b>'+
    '<p class="sm muted mt">'+(G.CONSENT
      ? 'Sao chép khối lớn, lưu và in đang được phép. Mọi thao tác đều ghi vào nhật ký kèm tên tài khoản.'
      : 'Sao chép khối lớn, lưu trang và in màn hình chuyên môn đang bị chặn. Đóng dấu chìm theo người xem vẫn luôn bật.')+'</p></div>'+
    '<button class="btn '+(G.CONSENT?'':'pri')+'" data-act="consent">'+ic('shield')+
    (G.CONSENT?'Đóng lại':'Xin đồng ý xuất dữ liệu')+'</button></div></div>';

  o += U.sec('SÁU LỚP LÁ CHẮN','Ba lớp đang chạy thật trong bản này. Ba lớp còn lại cần máy chủ.');
  o += '<div class="grid g2">' + L.lop.map(function(x){
    var on = x.trang==='ĐANG BẬT';
    return '<div class="card" style="border-color:'+x.c+'26">'+
      '<div class="row wrap" style="gap:9px;margin-bottom:8px">'+
      '<span style="width:32px;height:32px;border-radius:10px;display:grid;place-items:center;background:'+x.c+'22;color:'+x.c+';flex:none">'+
      ic(on?'shield':'lock','w-4 h-4')+'</span>'+
      '<b class="grow sm" style="min-width:150px">'+h(x.t)+'</b>'+
      '<span class="chip" style="color:'+(on?'var(--ok)':'var(--warn)')+';border-color:'+(on?'rgba(52,211,153,.4)':'rgba(251,191,36,.4)')+'">'+h(x.trang)+'</span></div>'+
      '<p class="sm muted" style="line-height:1.6">'+h(x.d)+'</p></div>';
  }).join('') + '</div>';

  o += U.sec('NHẬT KÝ NGUY CƠ CỦA PHIÊN NÀY','Ghi trực tiếp từ hành vi thật trong phiên đang chạy');
  var log = (G.SECLOG||[]).slice(0,14);
  o += log.length ? U.tbl(['Giờ','Tài khoản','Vai','Sự việc','Chi tiết','Kết quả'], log.map(function(l){
    var bad = l.mucdo==='Đã chặn' || l.mucdo==='Cảnh báo';
    return ['<span class="mono sm">'+h(l.gio)+'</span>','<span class="mono tiny">'+h(l.ai)+'</span>',
      '<span class="tiny">'+h(l.vai)+'</span>','<span class="sm">'+h(l.loai)+'</span>',
      '<span class="tiny muted">'+h(l.chiTiet)+'</span>',
      bad?'<span class="chip" style="color:var(--bad);border-color:rgba(248,113,113,.4)">'+h(l.mucdo)+'</span>'
         :'<span class="chip">'+h(l.mucdo)+'</span>'];
  })) : U.empty('Chưa có sự việc nào trong phiên này');

  o += U.sec('BA ĐIỀU CẦN NÓI THẲNG','Bảo vệ thật khác với bảo vệ trông có vẻ chặt');
  o += '<div class="card">' + L.thatBai.map(function(t,i){
    return '<div class="rule"><span class="n">'+(i+1)+'</span><div class="tx"><b>'+h(t)+'</b></div></div>';
  }).join('') + '</div>';
  return o;
};
})();

/* ═══════════════ HỌC TỪ NHỮNG HỆ THỐNG LỚN ═══════════════ */
(function(){
var U = G.U, h = U.h, ic = U.ic;
G.VIEWS['hoc-tu-lon'] = function(){
  if(!G.can('pro_report')) return U.lockCard();
  var B = G.BENCH;
  var daLam = B.viec71.filter(function(v){ return v.trang==='ĐÃ LÀM'; }).length;
  var o = U.ph({eyebrow:'NHÓM 05 · VẬN HÀNH', ic:'target', grad:1, t:'Học từ những hệ thống lớn',
    lead:B.cot});

  o += '<div class="grid g4 mb">'+
    U.stat({k:'HỆ THỐNG ĐÃ ĐỌC', v:B.he.length, d:'mạng xã hội · công nghệ · sản xuất', c:'#5140B4'})+
    U.stat({k:'VIỆC RÚT RA', v:B.viec71.length, d:'cho bản 7.0 và 7.1', c:'#185AB4'})+
    U.stat({k:'ĐÃ ĐƯA VÀO BẢN NÀY', v:daLam+'/'+B.viec71.length, d:'chạy được ngay hôm nay', c:'#0B7350'})+
    U.stat({k:'DỨT KHOÁT KHÔNG LẤY', v:B.khongLay.length, d:'phá ranh giới của mô hình', c:'#BE0E16'})+
  '</div>';

  o += U.sec('MƯỜI HỆ THỐNG · CƠ CHẾ LÕI','Lấy phần làm nên sức mạnh, từ chối phần chỉ phục vụ chỉ số');
  o += B.he.map(function(x){
    return '<div class="card lift mb" style="border-color:'+x.c+'2e">'+
      '<div class="row wrap" style="gap:11px;margin-bottom:11px">'+
        '<b style="font-size:18px;color:'+x.c+'">'+h(x.ten)+'</b>'+U.chip(x.linh, x.c)+'</div>'+
      '<div style="padding:12px 14px;border-radius:13px;background:var(--phu-2);margin-bottom:12px">'+
        '<span class="tiny up muted">CƠ CHẾ LÕI</span>'+
        '<p class="sm mt" style="line-height:1.65">'+h(x.coche)+'</p>'+
        '<p class="tiny mt" style="color:'+x.c+'">→ '+h(x.manh)+'</p></div>'+
      '<div class="grid g2" style="gap:12px">'+
        '<div style="padding:12px 14px;border-radius:13px;background:rgba(52,211,153,.06);border:1px solid rgba(52,211,153,.22)">'+
          '<div class="tiny up" style="color:var(--ok)">GITA LẤY</div>'+
          '<p class="sm mt" style="line-height:1.6">'+h(x.lay)+'</p></div>'+
        '<div style="padding:12px 14px;border-radius:13px;background:rgba(248,113,113,.06);border:1px solid rgba(248,113,113,.2)">'+
          '<div class="tiny up" style="color:var(--bad)">GITA TỪ CHỐI</div>'+
          '<p class="sm mt" style="line-height:1.6">'+h(x.bo)+'</p></div></div>'+
      '<div class="row mt2" style="gap:9px;align-items:flex-start;padding-top:11px;border-top:1px dashed var(--phu-4)">'+
        '<span style="color:var(--gold-ink);flex:none;margin-top:3px">'+ic('arrow','w-4 h-4')+'</span>'+
        '<span class="sm dim"><b style="color:var(--ink)">Việc cụ thể:</b> '+h(x.viec)+'</span></div></div>';
  }).join('');

  o += U.sec('MƯỜI HAI VIỆC RÚT RA','Tám việc đã nằm trong bản này, bốn việc còn lại vào bản 7.1');
  o += U.tbl(['Việc','Học từ','Trạng thái'], B.viec71.map(function(v){
    return ['<span class="sm">'+h(v.t)+'</span>','<span class="tiny muted">'+h(v.ng)+'</span>',
      '<span class="chip" style="color:'+v.c+';border-color:'+v.c+'55;background:'+v.c+'14">'+h(v.trang)+'</span>'];
  }));

  var A = G.BENCH_AI;
  o += U.sec('HỌC TỪ CÁC HỆ AI CHÂU Á','Chọn mô hình cho GITA 365 — sáu đường lối và điều rút ra từ mỗi đường lối');
  o += '<div class="card mb" style="border-color:rgba(56,189,248,.3)">'+
    '<div class="row"><span style="color:var(--sky,#38BDF8)">'+ic('brain','w-4 h-4')+'</span><b>Nguyên tắc chọn</b></div>'+
    '<p class="sm dim mt" style="line-height:1.7">'+h(A.cot)+'</p></div>';
  o += A.he.map(function(x){
    return '<div class="card lift mb" style="border-color:'+x.c+'2e">'+
      '<div class="row wrap" style="gap:11px;margin-bottom:10px">'+
      '<b style="font-size:16px;color:'+x.c+'">'+h(x.ten)+'</b>'+U.chip(x.linh,x.c)+'</div>'+
      '<p class="sm dim" style="line-height:1.65;margin-bottom:12px">'+h(x.duong)+'</p>'+
      '<div class="grid g2" style="gap:12px">'+
        '<div style="padding:12px 14px;border-radius:13px;background:rgba(52,211,153,.06);border:1px solid rgba(52,211,153,.22)">'+
          '<div class="tiny up" style="color:var(--ok)">GITA LẤY</div><p class="sm mt" style="line-height:1.6">'+h(x.lay)+'</p></div>'+
        '<div style="padding:12px 14px;border-radius:13px;background:rgba(248,113,113,.06);border:1px solid rgba(248,113,113,.2)">'+
          '<div class="tiny up" style="color:var(--bad)">GITA TỪ CHỐI</div><p class="sm mt" style="line-height:1.6">'+h(x.bo)+'</p></div></div>'+
      '<div class="row mt2" style="gap:9px;align-items:flex-start;padding-top:11px;border-top:1px dashed var(--phu-4)">'+
        '<span style="color:var(--gold-ink);flex:none;margin-top:3px">'+ic('arrow','w-4 h-4')+'</span>'+
        '<span class="sm dim"><b style="color:var(--ink)">Việc cụ thể:</b> '+h(x.viec)+'</span></div></div>';
  }).join('');

  o += U.sec('BẢY ĐIỀU KIỆN CHỌN NHÀ CUNG CẤP AI','Không đạt đủ bảy điều thì không ký, dù mô hình mạnh tới đâu');
  o += '<div class="card">' + A.dieuKien.map(function(d,i){
    return '<div class="rule"><span class="n">'+(i+1)+'</span><div class="tx"><b>'+h(d.t)+'</b><p>'+h(d.d)+'</p></div></div>';
  }).join('') + '</div>';

  o += '<div class="card mt" style="border-color:rgba(251,146,60,.3);background:rgba(251,146,60,.05)">'+
    '<div class="row mb"><span style="color:var(--alert)">'+ic('shield','w-4 h-4')+'</span><b>Lưu ý trung thực</b></div>'+
    '<p class="sm muted" style="line-height:1.7">'+h(A.luuY)+'</p></div>';

  o += U.sec('NĂM ĐIỀU DỨT KHOÁT KHÔNG LẤY','Đây là chỗ GITA 365 chọn đi khác — và chính chỗ khác đó là lý do gia đình ở lại');
  o += '<div class="grid g2">' + B.khongLay.map(function(k){
    return '<div class="card pad-sm" style="border-color:rgba(248,113,113,.22)">'+
      '<div class="row" style="gap:9px;margin-bottom:6px">'+
      '<span style="color:var(--bad);flex:none;margin-top:2px">'+ic('x','w-3 h-3')+'</span>'+
      '<b class="sm">'+h(k.t)+'</b></div>'+
      '<p class="tiny muted" style="line-height:1.6;padding-left:22px">'+h(k.v)+'</p></div>';
  }).join('') + '</div>';
  return o;
};
})();

/* ═══════════════ KIẾN TRÚC CHI PHÍ ═══════════════ */
(function(){
var U = G.U, h = U.h, ic = U.ic;
var vnd = function(n){ return Number(n).toLocaleString('vi-VN') + 'đ'; };

G.VIEWS['chi-phi'] = function(){
  if(!G.can('fin_view')) return U.lockCard();
  var C = G.CHIPHI, khuyen = C.goi[1];
  var o = U.ph({eyebrow:'NHÓM 05 · VẬN HÀNH', ic:'chart', grad:1, t:'Kiến trúc chi phí',
    lead:C.cot});

  o += '<div class="card glow mb"><div class="row wrap" style="gap:26px;align-items:center">'+
    U.ring(Math.round(khuyen.tong/C.tran*100), '#0B7350', 'CỦA TRẦN')+
    '<div class="grow" style="min-width:250px">'+
    '<div class="up muted">TỔNG CHI PHÍ VẬN HÀNH THÁNG</div>'+
    '<div class="row" style="gap:10px;align-items:baseline;margin:3px 0 6px">'+
    '<b class="mono grad-text" style="font-size:33px">'+vnd(khuyen.tong)+'</b>'+
    '<span class="muted">/ trần '+vnd(C.tran)+'</span></div>'+
    '<p class="sm dim">Còn dư <b style="color:var(--ok)">'+vnd(C.tran-khuyen.tong)+'</b> so với trần. '+
    'Hosting, máy chủ dữ liệu, sao lưu và trợ lý tra cứu đều ở mức <b>0đ</b> — '+
    'phần trả tiền duy nhất là tên miền riêng và trợ lý đối thoại, cả hai đều có trần cứng.</p>'+
    '<div class="mt">'+U.bar(khuyen.tong/C.tran*100,'#0B7350')+'</div></div></div></div>';

  o += '<div class="grid g4 mb">' + C.soDo.map(function(s){
    return U.stat({k:s.k, v:s.v, d:s.d, c:s.c});
  }).join('') + '</div>';

  o += U.sec('VIỆC NÀO CHẠY Ở ĐÂU','Nặng ở máy người dùng, nhẹ ở mây — đây là chỗ toàn bộ chi phí được cắt');
  o += U.tbl(['Việc','Chạy ở đâu','Chi phí'], C.chayODau.map(function(x){
    return ['<span class="sm">'+h(x.viec)+'</span>',
      '<span class="chip" style="color:'+x.c+';border-color:'+x.c+'55;background:'+x.c+'14">'+h(x.noi)+'</span>',
      '<b class="mono sm" style="color:'+x.c+'">'+h(x.gia)+'</b>'];
  }));

  o += U.sec('BA PHƯƠNG ÁN','Cả ba đều giữ trọn vẹn hệ thống — khác nhau ở tên miền và mức trợ lý đối thoại');
  o += '<div class="grid g3">' + C.goi.map(function(g,i){
    return '<div class="card lift '+(i===1?'glow':'')+'" style="border-color:'+g.c+(i===1?'66':'26')+'">'+
      '<div class="row" style="gap:8px;margin-bottom:8px">'+
      (i===1?U.chip('KHUYẾN NGHỊ','var(--gita)',1):'')+'</div>'+
      '<b style="font-size:16px;display:block;color:'+g.c+'">'+h(g.ten)+'</b>'+
      '<div class="row" style="gap:8px;align-items:baseline;margin:6px 0 10px">'+
      '<b class="mono" style="font-size:26px;color:'+g.c+'">'+vnd(g.tong)+'</b>'+
      '<span class="tiny muted">/ tháng</span></div>'+
      '<p class="sm dim" style="line-height:1.6;margin-bottom:11px">'+h(g.mo)+'</p>'+
      U.list(g.gom, g.c)+
      '<div class="mt2" style="padding-top:11px;border-top:1px dashed var(--phu-4)">'+
      '<span class="tiny up muted">HỢP VỚI</span><p class="sm mt">'+h(g.hop)+'</p></div></div>';
  }).join('') + '</div>';

  o += U.sec('CHI PHÍ THEO QUY MÔ','Chi phí không tăng theo lượt mở app — chỉ tăng theo số gia đình mới và số lượt hỏi trợ lý');
  o += U.tbl(['Quy mô','Băng thông','Hosting','Trợ lý AI','Tổng tháng'], C.quyMo.map(function(q){
    var vuot = q.tong.indexOf('vượt')>=0;
    return ['<b class="sm">'+h(q.n)+'</b>','<span class="mono sm muted">'+h(q.bang)+'</span>',
      '<span class="chip on">'+h(q.ha)+'</span>','<span class="mono sm">'+h(q.ai)+'</span>',
      '<b class="mono" style="color:'+(vuot?'var(--warn)':'var(--ok)')+'">'+h(q.tong)+'</b>'];
  }));

  o += U.sec('SÁU CHỐT CHẶN KHÔNG CHO VƯỢT CHI','Không có hoá đơn bất ngờ — đây là điều kiện của trần 500.000đ');
  o += '<div class="grid g2">' + C.chanVuot.map(function(x,i){
    return '<div class="card pad-sm"><div class="row" style="gap:9px;margin-bottom:6px">'+
      '<span class="pill" style="background:rgba(16,185,129,.18);color:var(--ok)">0'+(i+1)+'</span>'+
      '<b class="sm">'+h(x.t)+'</b></div>'+
      '<p class="tiny muted" style="line-height:1.6">'+h(x.d)+'</p></div>';
  }).join('') + '</div>';

  o += U.sec('VÌ SAO RẺ ĐƯỢC MÀ VẪN TRỌN VẸN','');
  o += '<div class="card">' + C.viSao.map(function(v,i){
    return '<div class="rule"><span class="n">'+(i+1)+'</span><div class="tx"><b>'+h(v)+'</b></div></div>';
  }).join('') + '</div>';

  o += '<div class="card mt2" style="border-color:var(--gita-vien-1)">'+
    '<div class="row mb"><span style="color:var(--gold-ink)">'+ic('shield','w-4 h-4')+'</span>'+
    '<b>Điều kiện để giữ được mức này</b></div>'+
    '<p class="sm muted" style="line-height:1.7">Kho tri thức phải giữ dạng tệp tĩnh, không chuyển sang cơ sở dữ liệu chỉ để đọc. '+
    'Mọi tính năng mới hỏi trước một câu: việc này chạy được trong máy người dùng không? Chạy được thì không đưa lên máy chủ. '+
    'Ngày nào bỏ nguyên tắc đó, chi phí sẽ tăng theo số lượt mở app thay vì theo số gia đình — và trần 500.000đ sẽ vỡ.</p></div>';
  return o;
};
})();
