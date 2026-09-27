/* ═══════════════════════════════════════════════════════════════
   GITA 365 · v7.0 — MÀN HÌNH · NHÓM 03 KHO BÁU VẬT
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;
G.VIEWS = G.VIEWS || {};
(function(){
var U = G.U, h = U.h, ic = U.ic;

/* ══════════════════ 03 · KHO BÁU VẬT ══════════════════ */
G.VIEWS['kho'] = function(){
  /* Dữ liệu của màn này nằm trong gói NGHỀ. Vai không được cấp gói đó thì
     biến MOTHUC là undefined và màn văng lỗi — trắng màn, không câu nào giải
     thích. Hôm nay G.allowed() chặn trước nên chưa ai gặp; nhưng một lần
     nới quyền trong bảng NAV là gặp ngay. Chặn tại chỗ thì không phụ
     thuộc vào bảng quyền còn đúng hay không. */
  if(!G.MOTHUC) return U.empty('Chưa mở được kho báu vật','Phần này nằm trong kho nghề.');
  var ke = [
    {v:'phac-do', ic:'book', c:'#185AB4', n:(G.PHACDO||[]).length||G.META.soPhacDo, dv:'phác đồ vấn đề',
     t:'Phác đồ vấn đề', d:'Mỗi vấn đề có nguyên nhân, giải pháp, việc của học viên, của người lớn, của tư vấn và của coach — trải đủ năm tầng.'},
    {v:'kich-ban', ic:'ritual', c:'#5140B4', n:(G.KICHBAN||[]).length||G.META.soKichBan, dv:'kịch bản chuyên môn',
     t:'Kịch bản tư vấn & coaching', d:'Từng buổi có câu mở, dòng chảy, câu chốt, bài về nhà và điều tuyệt đối không làm.'},
    {v:'mo-thuc', ic:'brain', c:'#185AB4', n:G.MOTHUC.length, dv:'mô thức huấn luyện',
     t:'Mô thức gốc của người sáng lập', d:'Bộ công cụ chép lại từ sổ tay viết tay — công cụ chuyên môn nặng nhất của Tầng 5.'},
    {v:'tu-duy', ic:'lightning', c:'#0B7350', n:G.BAIHOC.length, dv:'bài học tinh gọn',
     t:'Hệ tư duy mới', d:'Nguyên lý ngoài hệ thống, chuyển sang ngôn ngữ GITA, có ghi rõ nguồn gốc.'},
    {v:'sach', ic:'vault', c:'#0B6675', n:G.SACH.length+G.BANDO_A3.length+G.POSTER.length+G.SODO.length, dv:'tư liệu gốc Học viện',
     t:'Sách gốc & tư liệu', d:'Sáu quyển sách, bảy bản đồ A3, bốn mươi poster và sơ đồ tổng — tra cứu được tới từng đoạn.'},
    {v:'ngon-tu', ic:'flame', c:'#F61824', n:G.NGONTU.length, dv:'nhịp ngôn từ',
     t:'Ngôn từ dẫn dắt', d:'Sáu nhịp, mẫu câu dùng được ngay, ranh giới đạo đức đi kèm mọi kỹ thuật mạnh.'}
  ];
  var o = U.ph({eyebrow:'NHÓM 03 · KHO BÁU VẬT', ic:'vault', grad:1, t:'Kho báu vật',
    lead:'Đây là phần chiều sâu của hệ thống. Không ai đọc hết trong một tuần — và cũng không cần. Mỗi lúc chỉ mở đúng thứ đang cần cho đúng tầng đang đứng.'});

  o += '<div class="grid g4 mb">'+
    U.stat({k:'PHÁC ĐỒ', v:(G.PHACDO||[]).length||G.META.soPhacDo, d:'× 5 tầng = 1.100 bản ghi', c:'#185AB4'})+
    U.stat({k:'KỊCH BẢN', v:((G.KICHBAN||[]).length||G.META.soKichBan).toLocaleString('vi-VN'), d:'500 tư vấn + 500 coaching', c:'#5140B4'})+
    U.stat({k:'MÔ THỨC', v:G.MOTHUC.length, d:'nối vào đúng buổi làm việc', c:'#185AB4'})+
    U.stat({k:'TƯ LIỆU GỐC', v:'96', d:'sách · bản đồ · poster · sơ đồ', c:'#0B6675'})+
  '</div>';

  o += '<div class="grid g3">' + ke.map(function(k){
    return '<button class="card lift" data-go="'+k.v+'" style="text-align:left;border-color:'+k.c+'2a">'+
      '<div class="row" style="gap:11px;margin-bottom:10px">'+
        '<span style="width:42px;height:42px;border-radius:13px;display:grid;place-items:center;background:'+k.c+'1f;color:'+k.c+'">'+ic(k.ic,'w-5 h-5')+'</span>'+
        '<div><b style="font-size:14.5px;display:block">'+h(k.t)+'</b>'+
        '<span class="tiny mono" style="color:'+k.c+'">'+h(k.n.toLocaleString('vi-VN'))+' '+h(k.dv)+'</span></div></div>'+
      '<p class="sm muted" style="line-height:1.6">'+h(k.d)+'</p>'+
      '<div class="row mt2" style="color:'+k.c+';font-size:12.5px;font-weight:600;gap:6px">Mở kệ này '+ic('arrow','w-4 h-4')+'</div>'+
    '</button>';
  }).join('') + '</div>';

  o += U.sec('MỞ KHOÁ THEO TIẾN TRÌNH', 'Không phải giấu bớt. Là đưa đúng thứ dùng được ở đúng chặng — đọc trước một tầng thì rối, không lợi.');
  o += '<div class="grid g5">' + G.TIERS.map(function(t){
    var open = G.myFamily().tier >= t.id;
    return '<div class="card '+(open?'':'locked')+'" style="border-color:'+t.c+'2a">'+
      '<div class="row" style="gap:7px;margin-bottom:7px">'+U.chip(t.code,t.c)+
      (open?'<span style="color:var(--ok)">'+ic('check','w-4 h-4')+'</span>':'<span class="muted">'+ic('lock','w-4 h-4')+'</span>')+'</div>'+
      '<b class="sm" style="display:block;color:'+t.c+'">'+h(t.name)+'</b>'+
      '<p class="tiny muted mt">'+(open?'Đã mở toàn bộ kho của tầng này':'Mở khi nhà mình bước vào tầng '+t.id)+'</p></div>';
  }).join('') + '</div>';
  return o;
};

/* ══════════════════ 03 · 220 PHÁC ĐỒ ══════════════════ */
G.VIEWS['phac-do'] = function(){
  /* Kho tra cứu của nghề, không phải công cụ thao tác với gia đình.
     Bảng PERM đã nói rõ: nghe_chung mở cho R01–R12 — "toàn bộ kho nghề".
     Khoá ở pro_coach hoặc pro_consult thì Chuyên gia đánh giá, Chuyên gia
     tư vấn và Phân tích dữ liệu thấy mục này trong trình đơn mà bấm vào
     chỉ nhận được một thẻ khoá — đúng loại mục chết anh Quang đã bảo dẹp.
     Quyền THAO TÁC (buồng lái Coach, cổng nghiệm thu, xuất dữ liệu) vẫn
     giữ nguyên ở pro_coach và pro_approve. */
  if(!G.can('nghe_chung')) return U.lockCard();
  var nhom = {};
  G.PHACDO.forEach(function(p){ (nhom[p.nhomTen||'Khác'] = nhom[p.nhomTen||'Khác'] || []).push(p); });
  var keys = Object.keys(nhom).sort();
  var o = U.ph({eyebrow:'NHÓM 03 · KHO BÁU VẬT', ic:'book', t:'Hai trăm hai mươi phác đồ vấn đề',
    lead:'Mỗi vấn đề có đường đi riêng qua năm tầng. Đây là chỉ mục vấn đề — mở một mục để thấy nguyên nhân, giải pháp và việc của từng vai.'});
  o += G.searchBox('Tìm theo tên vấn đề hoặc nhóm…','pd');
  o += '<div id="pdList">' + keys.map(function(k){
    return '<div class="mt2"><div class="up mb" style="color:var(--gold-ink)">'+h(k)+
      ' <span class="muted">· '+nhom[k].length+' mục</span></div>'+
      '<div class="grid g-auto">' + nhom[k].map(function(p){
        return '<button class="card pad-sm lift" data-pd="'+h(p.ma)+'" data-s="'+h((p.ten+' '+k).toLowerCase())+'" style="text-align:left">'+
          '<div class="row" style="gap:7px;margin-bottom:5px"><span class="mono tiny" style="color:var(--ink-4)">'+h(p.ma)+'</span></div>'+
          '<b class="sm" style="display:block;line-height:1.4">'+h(p.ten)+'</b>'+
          (p.nguyenNhan?'<p class="tiny muted mt" style="line-height:1.5">'+h(G.chuHet(p.nguyenNhan,88))+'</p>':'')+
          '</button>';
      }).join('') + '</div></div>';
  }).join('') + '</div>';
  return o;
};
G.phacDoModal = function(ma){
  var p = G.PHACDO.filter(function(x){return x.ma===ma;})[0]; if(!p) return;
  var b = [['NGUYÊN NHÂN CỐT LÕI',p.nguyenNhan,'#BE0E16'],['GIẢI PHÁP THÁO GỠ',p.giaiPhap,'#0B7350'],
    ['VIỆC CỦA NGƯỜI LỚN',p.ph,'var(--gita)'],['VIỆC CỦA COACH',p.coach,'#5140B4'],['ĐÍCH ĐẾN',p.dich,'#0B6675']];
  U.modal('<div class="row wrap" style="gap:7px;margin-bottom:9px">'+U.chip(p.ma)+U.chip(p.nhomTen,'var(--gita)')+'</div>'+
    '<h2 style="font-size:21px;font-weight:800;margin-bottom:14px">'+h(p.ten)+'</h2>'+
    b.map(function(x){ return x[1] ? '<div class="card pad-sm mb" style="border-color:'+x[2]+'2a">'+
      '<div class="tiny up mb" style="color:'+x[2]+'">'+x[0]+'</div><p class="sm" style="line-height:1.65">'+h(x[1])+'</p></div>' : ''; }).join('')+
    '<p class="tiny muted mt">Nội dung đủ năm tầng của phác đồ này nằm trong kho máy chủ GITA 365 — mở bằng vai có quyền pro_coach.</p>');
};

/* ══════════════════ 03 · 1.000 KỊCH BẢN ══════════════════ */
G.VIEWS['kich-ban'] = function(){
  /* Kho tra cứu của nghề, không phải công cụ thao tác với gia đình.
     Bảng PERM đã nói rõ: nghe_chung mở cho R01–R12 — "toàn bộ kho nghề".
     Khoá ở pro_coach hoặc pro_consult thì Chuyên gia đánh giá, Chuyên gia
     tư vấn và Phân tích dữ liệu thấy mục này trong trình đơn mà bấm vào
     chỉ nhận được một thẻ khoá — đúng loại mục chết anh Quang đã bảo dẹp.
     Quyền THAO TÁC (buồng lái Coach, cổng nghiệm thu, xuất dữ liệu) vẫn
     giữ nguyên ở pro_coach và pro_approve. */
  if(!G.can('nghe_chung')) return U.lockCard();
  var o = U.ph({eyebrow:'NHÓM 03 · KHO BÁU VẬT', ic:'ritual', t:'Một nghìn kịch bản chuyên môn',
    lead:'Năm trăm kịch bản tư vấn và năm trăm kịch bản coaching, phủ đủ năm tầng. Mỗi buổi có câu mở đúng nhịp, câu chốt và điều tuyệt đối không được làm.'});
  o += '<div class="row wrap mb" style="gap:6px">'+
    '<button class="chip on" data-kbf="ALL">Tất cả</button>'+
    G.TIERS.map(function(t){return '<button class="chip" data-kbf="'+t.code+'">'+t.code+'</button>';}).join('')+
    '<button class="chip" data-kbf="COACH">Coaching</button>'+
    '<button class="chip" data-kbf="TƯ VẤN">Tư vấn</button>'+
    '<button class="chip" data-kbf="HS">Học viên</button>'+
    '<button class="chip" data-kbf="PH">Phụ huynh</button></div>';
  o += G.searchBox('Tìm theo tên buổi, nhóm, mục tiêu…','kb');
  o += '<div class="grid g-auto-lg mt" id="kbList">' + G.dsHet(G.KICHBAN,60).map(G.kbCard).join('') + '</div>'+
    '<div class="center mt2"><button class="btn" data-act="kb-more">Hiện thêm 60 kịch bản</button>'+
    '<p class="tiny muted mt">Đang hiện <b id="kbCount">60</b> / '+G.KICHBAN.length.toLocaleString('vi-VN')+'</p></div>';
  return o;
};
G.kbCard = function(k){
  var t = G.TIERS.filter(function(x){return x.code===k.tang;})[0] || G.TIERS[0];
  return '<button class="card pad-sm lift" data-kb="'+h(k.ma)+'" data-s="'+h(((k.ten||'')+' '+(k.nhom||'')+' '+(k.muc||'')).toLowerCase())+'" '+
    'data-f="'+h(k.tang+' '+k.loai+' '+k.ai)+'" style="text-align:left;border-color:'+t.c+'22">'+
    '<div class="row wrap" style="gap:5px;margin-bottom:7px">'+U.chip(k.tang,t.c)+U.chip(k.loai)+
    (k.ai?U.chip(k.ai==='HS'?'Học viên':(k.ai==='PH'?'Phụ huynh':k.ai)):'')+
    (k.phut?'<span class="tiny muted mono">'+h(k.phut)+"'</span>":'')+'</div>'+
    '<b class="sm" style="display:block;line-height:1.4;margin-bottom:5px">'+h(k.ten)+'</b>'+
    '<span class="tiny muted">'+h(k.nhom)+'</span></button>';
};
G.kichBanModal = function(ma){
  var k = G.KICHBAN.filter(function(x){return x.ma===ma;})[0]; if(!k) return;
  var t = G.TIERS.filter(function(x){return x.code===k.tang;})[0] || G.TIERS[0];
  var o = '<div class="row wrap" style="gap:6px;margin-bottom:9px">'+U.chip(k.ma)+U.chip(k.tang+' · '+t.name,t.c)+
    U.chip(k.loai)+(k.phut?U.chip(k.phut+' phút'):'')+'</div>'+
    '<h2 style="font-size:21px;font-weight:800;line-height:1.3;margin-bottom:6px">'+h(k.ten)+'</h2>'+
    '<p class="tiny muted mb">'+h(k.nhom)+(k.ngay?' · Ngày '+h(k.ngay):'')+'</p>';
  if(k.muc) o += '<div class="card pad-sm mb"><div class="tiny up muted mb">MỤC TIÊU BUỔI</div><p class="sm">'+h(k.muc)+'</p></div>';
  if(k.mo) o += '<div class="card pad-sm mb" style="border-color:'+t.c+'40;background:'+t.c+'0d">'+
    '<div class="tiny up mb" style="color:'+t.c+'">CÂU MỞ ĐẦU — đọc đúng nhịp</div>'+
    '<p class="serif" style="font-size:16px;font-style:italic;line-height:1.65">"'+h(k.mo)+'"</p></div>';
  if(k.chot) o += '<div class="card pad-sm mb" style="border-color:rgba(52,211,153,.3)">'+
    '<div class="tiny up mb" style="color:var(--ok)">CÂU CHỐT</div>'+
    '<p class="sm" style="line-height:1.65">'+h(k.chot)+'</p></div>';
  if(k.khong) o += '<div class="card pad-sm" style="border-color:rgba(248,113,113,.3);background:rgba(248,113,113,.05)">'+
    '<div class="tiny up mb" style="color:var(--bad)">TUYỆT ĐỐI KHÔNG LÀM</div>'+
    '<p class="sm" style="line-height:1.65">'+h(k.khong)+'</p></div>';
  U.modal(o);
};

/* ══════════════════ 03 · 42 MÔ THỨC ══════════════════ */
G.VIEWS['mo-thuc'] = function(){
  /* Kho tra cứu của nghề, không phải công cụ thao tác với gia đình.
     Bảng PERM đã nói rõ: nghe_chung mở cho R01–R12 — "toàn bộ kho nghề".
     Khoá ở pro_coach hoặc pro_consult thì Chuyên gia đánh giá, Chuyên gia
     tư vấn và Phân tích dữ liệu thấy mục này trong trình đơn mà bấm vào
     chỉ nhận được một thẻ khoá — đúng loại mục chết anh Quang đã bảo dẹp.
     Quyền THAO TÁC (buồng lái Coach, cổng nghiệm thu, xuất dữ liệu) vẫn
     giữ nguyên ở pro_coach và pro_approve. */
  if(!G.can('nghe_chung')) return U.lockCard();
  var o = U.ph({eyebrow:'NHÓM 03 · KHO BÁU VẬT', ic:'brain', grad:1, t:'Mô thức huấn luyện gốc',
    lead:'Chép lại từ sổ tay viết tay của người sáng lập Học viện GITA. Đây là bộ công cụ chẩn đoán và can thiệp của Tầng 5 — mạnh, và vì mạnh nên đi kèm ranh giới nghề nghiệp.'});
  o += '<div class="card mb" style="border-color:rgba(251,146,60,.32)">'+
    '<div class="row"><span style="color:var(--alert)">'+ic('shield','w-4 h-4')+'</span><b>Ranh giới không thương lượng</b></div>'+
    '<p class="sm muted mt">Quan sát để hiểu và hỗ trợ, không để thao túng. Không dùng để đẩy khách hàng vào quyết định mua. Không dùng dữ liệu đọc được về phụ huynh để chứng minh họ sai.</p></div>';
  o += G.searchBox('Tìm mô thức theo tên hoặc từ khoá…','mt');
  o += '<div class="grid g-auto mt" id="mtList">' + G.MOTHUC.map(function(m){
    return '<button class="card lift" data-mt="'+h(m.id)+'" data-s="'+h(((m.title||'')+' '+(m.keywords||[]).join(' ')).toLowerCase())+'" style="text-align:left">'+
      '<div class="row" style="gap:7px;margin-bottom:7px"><span class="pill" style="background:var(--gita-mo-2);color:var(--gold-ink)">'+h(m.id)+'</span>'+
      (m.tiers?U.chip((m.tiers||[]).join(' · ')):'')+'</div>'+
      '<b class="sm" style="display:block;line-height:1.4;margin-bottom:6px">'+h(m.title)+'</b>'+
      '<p class="tiny muted" style="line-height:1.55">'+h(G.chuHet(m.summary||'',120))+'</p></button>';
  }).join('') + '</div>';
  return o;
};
G.moThucModal = function(id){
  var m = G.MOTHUC.filter(function(x){return x.id===id;})[0]; if(!m) return;
  var o = '<div class="row wrap" style="gap:6px;margin-bottom:9px">'+U.chip(m.id,'var(--gita)')+
    ((m.tiers||[]).map(function(t){return U.chip(t);}).join(''))+'</div>'+
    '<h2 style="font-size:21px;font-weight:800;line-height:1.3;margin-bottom:12px">'+h(m.title)+'</h2>'+
    '<p class="sm dim" style="line-height:1.75">'+U.nl(m.summary)+'</p>';
  if(m.useFor) o += '<div class="card pad-sm mt2"><div class="tiny up muted mb">DÙNG KHI NÀO</div>'+
    '<p class="sm">'+h(Array.isArray(m.useFor)?m.useFor.join(' · '):m.useFor)+'</p></div>';
  if(m.keywords && m.keywords.length) o += '<div class="mt2"><div class="tiny up muted mb">TỪ KHOÁ</div>'+
    '<div class="row wrap" style="gap:5px">'+m.keywords.map(function(k){return U.chip(k);}).join('')+'</div></div>';
  if(m.source) o += '<p class="tiny muted mt2">Nguồn: '+h(m.source)+'</p>';

  /* ══ RANH GIỚI SỬ DỤNG ══
     42 mô thức là bộ công cụ nghề nặng nhất của Học viện, và trước bản
     này không cái nào ghi khi nào KHÔNG được dùng.

     Đó là chỗ hở thật, không phải chuyện hình thức. MT-05 là kỹ thuật
     "từ bảng tính năng sang bảng lợi ích" — dùng với một phụ huynh đang
     quyết chuyện học của con mình. Không có ranh giới thì nó thành công
     cụ dẫn dắt, đúng thứ luật Học viện cấm.

     Khối này đặt NGAY DƯỚI phần "dùng khi nào", không giấu xuống cuối:
     ai đọc cách dùng thì phải đọc luôn ranh giới. */
  var r = (G.MT_RANH || {})[m.id];
  if(r){
    o += '<div class="card pad-sm mt2" style="border-color:var(--gita-do)">'+
      '<div class="tiny up mb" style="color:var(--gita-do-ink)">KHI NÀO KHÔNG DÙNG</div>'+
      '<p class="sm" style="line-height:1.7">'+h(r.khiKhong)+'</p></div>';
    if((r.khong||[]).length)
      o += '<div class="card pad-sm mt2" style="border-color:var(--gita-do)">'+
        '<div class="tiny up mb" style="color:var(--gita-do-ink)">TUYỆT ĐỐI KHÔNG LÀM</div>'+
        U.list(r.khong, 'var(--gita-do)')+'</div>';
    if(r.hong)
      o += '<div class="card pad-sm mt2" style="border-color:var(--alert)">'+
        '<div class="tiny up mb" style="color:var(--alert)">DẤU HIỆU ĐANG DÙNG SAI</div>'+
        '<p class="sm" style="line-height:1.7">'+h(r.hong)+'</p></div>';
    if(r.ai)
      o += '<div class="card pad-sm mt2"><div class="tiny up mb muted">AI KHÔNG ĐƯỢC DÙNG</div>'+
        '<p class="sm" style="line-height:1.7">'+h(r.ai)+'</p></div>';
  }
  U.modal(o);
};

/* ══════════════════ 03 · HỆ TƯ DUY MỚI ══════════════════ */
G.VIEWS['tu-duy'] = function(){
  var o = U.ph({eyebrow:'NHÓM 03 · KHO BÁU VẬT', ic:'lightning', grad:1, t:'Hệ tư duy mới',
    lead:'Mười bốn nguyên lý ngoài hệ thống, chuyển sang ngôn ngữ GITA và ví dụ Việt Nam. Mỗi bài đều ghi rõ nguồn gốc và giới hạn của nó.'});
  o += '<div class="grid g2">' + G.BAIHOC.map(function(b){
    var g = (b.gitaFocus||[])[0] || 'A';
    var gm = G.GITA.filter(function(x){return x.k===g;})[0] || G.GITA[3];
    return '<button class="card lift" data-bh="'+h(b.id)+'" style="text-align:left;border-color:'+gm.c+'26">'+
      '<div class="row wrap" style="gap:6px;margin-bottom:8px">'+U.chip(b.id)+
      U.chip('Miền '+g+' · '+gm.short, gm.c)+((b.tiers||[]).length?U.chip((b.tiers||[]).join(' ')):'')+'</div>'+
      '<b style="font-size:14.5px;display:block;line-height:1.35;margin-bottom:8px">'+h(b.ten)+'</b>'+
      '<p class="sm muted" style="line-height:1.6">'+h(G.chuHet(b.nguyenLy||'',160))+'</p></button>';
  }).join('') + '</div>';
  return o;
};
G.baiHocModal = function(id){
  var b = G.BAIHOC.filter(function(x){return x.id===id;})[0]; if(!b) return;
  var o = '<div class="row wrap" style="gap:6px;margin-bottom:9px">'+U.chip(b.id,'#0B7350')+
    ((b.gitaFocus||[]).map(function(g){return U.chip('Miền '+g);}).join(''))+
    ((b.tiers||[]).map(function(t){return U.chip(t);}).join(''))+'</div>'+
    '<h2 style="font-size:21px;font-weight:800;line-height:1.3;margin-bottom:12px">'+h(b.ten)+'</h2>'+
    '<div class="card pad-sm mb"><div class="tiny up muted mb">NGUYÊN LÝ</div><p class="sm" style="line-height:1.7">'+h(b.nguyenLy)+'</p></div>';
  if(b.dungKhiNao) o += '<div class="card pad-sm mb"><div class="tiny up muted mb">DÙNG KHI NÀO</div><p class="sm">'+h(b.dungKhiNao)+'</p></div>';
  if(b.cachDan) o += '<div class="card pad-sm mb" style="border-color:var(--gita-vien-1)"><div class="tiny up mb" style="color:var(--gold-ink)">CÁCH DẪN</div><p class="sm" style="line-height:1.7">'+h(b.cachDan)+'</p></div>';
  if(b.viDuVietNam) o += '<div class="card pad-sm mb"><div class="tiny up muted mb">VÍ DỤ VIỆT NAM</div><p class="sm" style="line-height:1.7">'+h(b.viDuVietNam)+'</p></div>';
  if(b.doNot) o += '<div class="card pad-sm mb" style="border-color:rgba(248,113,113,.3);background:rgba(248,113,113,.05)">'+
    '<div class="tiny up mb" style="color:var(--bad)">KHÔNG LÀM</div><p class="sm">'+h(Array.isArray(b.doNot)?b.doNot.join(' · '):b.doNot)+'</p></div>';
  if(b.ranhGioi) o += '<div class="card pad-sm mb"><div class="tiny up muted mb">GIỚI HẠN CỦA NGUYÊN LÝ</div><p class="sm">'+h(Array.isArray(b.ranhGioi)?b.ranhGioi.join(' · '):b.ranhGioi)+'</p></div>';
  if(b.nguonGoc) o += '<p class="tiny muted">Nguồn gốc: '+h(b.nguonGoc)+'</p>';
  U.modal(o);
};

/* ══════════════════ 03 · SÁCH GỐC & TƯ LIỆU ══════════════════ */
G.VIEWS['sach'] = function(){
  /* Dữ liệu của màn này nằm trong gói NGHỀ. Vai không được cấp gói đó thì
     biến SACH là undefined và màn văng lỗi — trắng màn, không câu nào giải
     thích. Hôm nay G.allowed() chặn trước nên chưa ai gặp; nhưng một lần
     nới quyền trong bảng NAV là gặp ngay. Chặn tại chỗ thì không phụ
     thuộc vào bảng quyền còn đúng hay không. */
  if(!G.SACH) return U.empty('Chưa mở được sách gốc và tư liệu','Phần này nằm trong kho nghề.');
  var o = U.ph({eyebrow:'NHÓM 03 · KHO BÁU VẬT', ic:'vault', t:'Sách gốc & tư liệu Học viện',
    lead:'Chín mươi sáu tư liệu nền của Học viện GITA: sáu quyển sách toàn văn, bảy bản đồ A3, bốn mươi poster và sơ đồ tổng.'});
  o += U.sec('SÁU QUYỂN SÁCH GỐC','Toàn văn đã cắt thành đoạn tra cứu được');
  o += '<div class="grid g3">' + G.SACH.map(function(s){
    return '<div class="card lift"><div class="row" style="gap:9px;margin-bottom:8px">'+
      '<span style="color:var(--gold-ink)">'+ic('book','w-5 h-5')+'</span><b class="sm">'+h(s.title)+'</b></div>'+
      '<p class="tiny muted" style="line-height:1.6">'+h(G.chuHet(s.summary||'',190))+'</p>'+
      '<div class="row mt2 tiny mono" style="gap:12px;color:var(--ink-4)">'+
      (s.sectionCount?'<span>'+s.sectionCount+' đoạn</span>':'')+
      (s.chars?'<span>'+Number(s.chars).toLocaleString('vi-VN')+' ký tự</span>':'')+'</div></div>';
  }).join('') + '</div>';

  o += U.sec('BẢY BẢN ĐỒ A3','Dùng in ra và treo — công cụ làm việc trực tiếp với gia đình');
  o += '<div class="grid g-auto">' + G.BANDO_A3.map(function(m){
    return '<div class="card pad-sm"><b class="sm" style="display:block;margin-bottom:6px">'+h(m.title)+'</b>'+
      '<p class="tiny muted" style="line-height:1.55">'+h(G.chuHet(m.summary||'',130))+'</p></div>';
  }).join('') + '</div>';

  o += U.sec('BỐN MƯƠI POSTER','Câu ngắn dán tường — dùng cho lớp và cho nhà');
  o += '<div class="grid g4">' + G.dsHet(G.POSTER,20).map(function(p){
    return '<div class="card pad-sm" style="min-height:86px"><b class="tiny" style="line-height:1.45;display:block">'+h(p.title)+'</b></div>';
  }).join('') + '</div>'+
  '<p class="tiny muted mt center">Đang hiện 20 / '+G.POSTER.length+' poster · phần còn lại mở trong kho máy chủ</p>';
  return o;
};

/* ══════════════════ 03 · NGÔN TỪ DẪN DẮT ══════════════════ */
G.VIEWS['ngon-tu'] = function(){
  /* Dữ liệu của màn này nằm trong gói NGHỀ. Vai không được cấp gói đó thì
     biến NGONTU là undefined và màn văng lỗi — trắng màn, không câu nào giải
     thích. Hôm nay G.allowed() chặn trước nên chưa ai gặp; nhưng một lần
     nới quyền trong bảng NAV là gặp ngay. Chặn tại chỗ thì không phụ
     thuộc vào bảng quyền còn đúng hay không. */
  if(!G.NGONTU) return U.empty('Chưa mở được ngôn từ dẫn dắt','Phần này nằm trong kho nghề.');
  var o = U.ph({eyebrow:'NHÓM 03 · KHO BÁU VẬT', ic:'flame', grad:1, t:'Ngôn từ dẫn dắt',
    lead:'Hợp nhất bốn nghề: người bán hàng tử tế, chuyên gia tâm lý, coach chuyên nghiệp và bậc thầy ngôn từ. Sáu nhịp, mẫu câu dùng được ngay tối nay.'});

  o += '<div class="card mb" style="border-color:rgba(248,113,113,.3);background:rgba(248,113,113,.05)">'+
    '<div class="row"><span style="color:var(--bad)">'+ic('shield','w-4 h-4')+'</span>'+
    '<b>Đọc trước khi dùng — sáu ranh giới ngôn từ</b></div>'+
    '<div class="grid g2 mt" style="gap:9px">' + G.NGONTU_RANH.map(function(r){
      return '<div style="display:flex;gap:9px"><span style="color:var(--bad);flex:none;margin-top:3px">'+ic('x','w-3 h-3')+'</span>'+
        '<div><b class="sm" style="display:block">'+h(r.k)+'</b><span class="tiny muted">'+h(r.v)+'</span></div></div>';
    }).join('') + '</div></div>';

  o += U.sec('SÁU NHỊP NGÔN TỪ','Đi đúng thứ tự. Nhảy cóc sang nhịp năm khi chưa qua nhịp ba là mất người.');
  o += G.NGONTU.map(function(n,i){
    return '<div class="card lift mb" style="border-color:'+n.c+'2e">'+
      '<div class="row wrap" style="gap:10px;margin-bottom:10px">'+
        '<span style="width:38px;height:38px;border-radius:12px;display:grid;place-items:center;font-weight:900;background:'+n.c+'22;color:'+n.c+'">'+(i+1)+'</span>'+
        '<div class="grow" style="min-width:190px"><b style="font-size:16px;display:block">'+h(n.ten)+'</b>'+
        '<span class="tiny" style="color:'+n.c+'">'+h(n.ky)+'</span></div></div>'+
      '<p class="sm dim" style="line-height:1.65;margin-bottom:12px">'+h(n.muc)+'</p>'+
      '<div class="up mb" style="color:'+n.c+'">MẪU CÂU DÙNG ĐƯỢC NGAY</div>'+
      '<div style="display:flex;flex-direction:column;gap:8px">' + n.cau.map(function(c){
        return '<div style="padding:11px 14px;border-radius:12px;background:'+n.c+'0d;border-left:2px solid '+n.c+'44">'+
          '<p class="serif" style="font-size:14.5px;font-style:italic;line-height:1.6">"'+h(c)+'"</p></div>';
      }).join('') + '</div>'+
      '<div class="mt2" style="padding:11px 13px;border-radius:12px;background:rgba(248,113,113,.06);border:1px solid rgba(248,113,113,.2)">'+
        '<span class="tiny up" style="color:var(--bad)">LỖI THƯỜNG GẶP</span>'+
        '<p class="sm mt">'+h(n.loi)+'</p></div></div>';
  }).join('');

  o += U.sec('NÓI THẾ NÀY, THAY VÌ THẾ KIA','Cùng một ý, hai kết quả khác hẳn nhau');
  o += '<div class="grid g2">' + G.THAYVI.map(function(t){
    return '<div class="card pad-sm">'+
      '<div style="display:flex;gap:9px;margin-bottom:9px"><span style="color:var(--bad);flex:none;margin-top:2px">'+ic('x','w-3 h-3')+'</span>'+
      '<span class="sm" style="color:var(--ink-3);text-decoration:line-through">'+h(t.x)+'</span></div>'+
      '<div style="display:flex;gap:9px"><span style="color:var(--ok);flex:none;margin-top:2px">'+ic('check','w-3 h-3')+'</span>'+
      '<span class="sm">'+h(t.o)+'</span></div></div>';
  }).join('') + '</div>';

  o += U.sec('NGÔN TỪ TRONG ĐÚNG PHẠM VI TẦNG','Hứa vượt tầng là cách chắc chắn nhất để mất họ ở tuần thứ ba');
  o += '<div class="grid g5">' + G.NGONTU_TANG.map(function(t){
    return '<div class="card pad-sm" style="border-color:'+t.c+'2a">'+
      '<div class="up mb" style="color:'+t.c+'">'+h(t.t)+'</div>'+
      '<div class="tiny" style="color:var(--ok);line-height:1.5;margin-bottom:6px">✓ '+h(t.duoc)+'</div>'+
      '<div class="tiny" style="color:var(--bad);line-height:1.5;margin-bottom:9px">✕ '+h(t.khong)+'</div>'+
      '<p class="tiny serif" style="font-style:italic;color:var(--ink-2);line-height:1.55">"'+h(t.cau)+'"</p></div>';
  }).join('') + '</div>';

  o += U.sec('BA ĐOẠN THOẠI MẪU','Có chú thích kỹ thuật ở từng câu — học nghề, không học khẩu hiệu');
  o += G.MAUTHOAI.map(function(m){
    return '<div class="card mb" style="border-color:'+m.c+'2e">'+
      '<div class="row wrap" style="gap:8px;margin-bottom:8px">'+U.chip(m.ma,m.c)+U.chip('Tầng '+m.tang)+'</div>'+
      '<b style="font-size:16px;display:block;margin-bottom:6px">'+h(m.ten)+'</b>'+
      '<p class="sm muted mb" style="line-height:1.6">'+h(m.boi)+'</p>'+
      '<div style="display:flex;flex-direction:column;gap:10px">' + m.thoai.map(function(d){
        var me = d.ai!=='KH' && d.ai!=='HS' && d.ai!=='PH';
        return '<div style="display:flex;gap:10px;'+(me?'':'')+'">'+
          '<span class="pill" style="flex:none;margin-top:3px;background:'+(me?m.c+'22;color:'+m.c:'var(--phu-3);color:var(--ink-3)')+'">'+
            h(d.ai==='KH'?'KHÁCH':(d.ai==='HS'?'CON':(d.ai==='PH'?'MẸ':'GITA')))+'</span>'+
          '<div style="flex:1"><p class="sm" style="line-height:1.65'+(me?'':';color:var(--ink-2)')+'">'+h(d.t)+'</p>'+
          (d.ky?'<div class="tiny mt" style="color:'+m.c+';opacity:.85;display:flex;gap:6px"><span style="flex:none">⌁</span><span>'+h(d.ky)+'</span></div>':'')+
          '</div></div>';
      }).join('') + '</div></div>';
  }).join('');
  return o;
};

/* ══════════════════ 03 · TRỢ LÝ GITA ══════════════════ */
/* ═══ MÀN TRỢ LÝ CŨ ĐÃ GỠ Ở BẢN 9.48 ═══
   Ba tệp cùng gán G.VIEWS['tro-ly']: views2.js, tro-ly-ai.js và
   tro-ly-chat.js. Nạp theo thứ tự trong danh-sach-src.json nên tệp cuối
   thắng, và HAI BẢN TRƯỚC là mã chết — chạy không bao giờ tới.

   Không phải chuyện dọn dẹp cho gọn. Bản ở đây in ra câu "trả lời trong
   đúng phạm vi tầng của nhà mình" trong khi không dòng nào lọc theo
   tầng; câu ấy nằm lại nhiều tháng, không ai đọc thấy vì màn không bao
   giờ hiện, và nó là bản mô tả duy nhất người sau đọc được khi đi tìm
   xem hệ có lọc tầng hay không. Một lời hứa nằm trong mã chết vẫn là
   một lời hứa sai.

   Màn thật ở src/tro-ly-chat.js. Lọc tầng ở src/tro-ly-tang.js. */
/* ═══════════════ 04 · CHÍN VAI GIỮ TRONG NHÀ ═══════════════ */
G.VIEWS['chin-vai'] = function(){
  var V = G.VANHANH, f = G.myFamily();
  var o = U.ph({eyebrow:'NHÓM 04 · CÚ HÍCH & NHỊP SỐNG', ic:'users', grad:1, t:'Chín vai giữ trong nhà',
    lead:V.khoang[4].cauHoi + ' — Đủ chín vai có người giữ, và không ai giữ quá bốn vai. Vai luân phiên và chồng lấn được; một đứa trẻ lớn hoàn toàn có thể giữ vai giữ dữ liệu.'});

  o += '<div class="grid g4 mb">'+
    U.stat({k:'VAI ĐÃ CÓ NGƯỜI GIỮ', v:f.vai+'/9', d:'chuẩn: đủ chín vai', c:'#0B7350'})+
    U.stat({k:'VAI CÒN TRỐNG', v:(9-f.vai), d:'chỗ trống là dữ liệu, không phải lỗi', c:'#BE0E16'})+
    U.stat({k:'GIỮ NHIỀU NHẤT', v:'3 vai', d:'trần cho phép: 4 vai/người', c:'#5140B4'})+
    U.stat({k:'ĐÃ CHUYỂN CHO CON', v:(f.tier>=4?'2':'0'), d:'trao quyền kèm trách nhiệm', c:'#185AB4'})+
  '</div>';

  var C = ['#2A72C6','#5140B4','#0B6675','#0B7350','#BE0E16','var(--gita-do)','#BE0E16','#A78BFA','#0B7350'];
  o += '<div class="grid g3">' + V.vaiTro.map(function(v,i){
    var c = C[i%9], co = i < f.vai;
    return '<div class="vai" style="border-color:'+c+(co?'44':'1a')+'">'+
      '<div class="row" style="gap:7px;margin-bottom:2px"><span class="id" style="color:'+c+'">'+h(v.id)+'</span>'+
      (co?'<span style="color:var(--ok);margin-left:auto">'+ic('check','w-4 h-4')+'</span>'
         :'<span class="chip" style="margin-left:auto;color:var(--warn);border-color:rgba(251,191,36,.3)">còn trống</span>')+'</div>'+
      '<h5 style="color:'+c+'">'+h(v.ten)+'</h5>'+
      '<div class="q">'+h(v.cauHoi)+'</div>'+
      '<p>'+h(v.vaiTro)+'</p>'+
      '<div class="own">'+ic('users','w-3 h-3')+'<span>'+h(v.aiGiu)+'</span></div>'+
      '<button class="btn ghost sm mt" data-vai="'+h(v.id)+'" style="width:100%">Xem việc cụ thể & KPI</button>'+
    '</div>';
  }).join('') + '</div>';

  o += '<div class="card mt2" style="border-color:rgba(251,146,60,.3)">'+
    '<div class="row mb"><span style="color:var(--alert)">'+ic('shield','w-4 h-4')+'</span><b>Cảnh báo của khoang năm</b></div>'+
    '<p class="sm dim">'+h(V.khoang[4].canhBao||'Không cứng hoá vai. Vai luân phiên và chồng lấn.')+'</p></div>';
  return o;
};
G.vaiModal = function(id){
  var v = (G.VANHANH.vaiTro||[]).filter(function(x){return x.id===id;})[0]; if(!v) return;
  var o = '<div class="row wrap" style="gap:7px;margin-bottom:9px">'+U.chip(v.id,'var(--gita)')+U.chip('Khoang '+v.khoang)+
    (v.goc?U.chip('Gốc: '+v.goc):'')+'</div>'+
    '<h2 style="font-size:21px;font-weight:800;margin-bottom:8px">'+h(v.ten)+'</h2>'+
    '<p class="serif" style="font-size:16px;font-style:italic;color:var(--gold-2);margin-bottom:14px">'+h(v.cauHoi)+'</p>'+
    '<p class="sm dim mb" style="line-height:1.7">'+h(v.vaiTro)+'</p>'+
    '<div class="up muted mb mt2">VIỆC CỤ THỂ</div>'+U.list(v.viecCuThe,'var(--gita)')+
    '<div class="grid g2 mt2" style="gap:10px">'+
      '<div class="card pad-sm"><div class="tiny up muted mb">AI GIỮ</div><p class="sm">'+h(v.aiGiu)+'</p></div>'+
      '<div class="card pad-sm"><div class="tiny up muted mb">NHỊP</div><p class="sm">'+h(v.nhip)+'</p></div></div>'+
    '<div class="card pad-sm mt" style="border-color:rgba(16,185,129,.3)"><div class="tiny up mb" style="color:var(--ok)">KPI</div>'+
      '<p class="sm">'+h(v.kpi)+'</p></div>'+
    (v.canhBao?'<div class="card pad-sm mt" style="border-color:rgba(251,146,60,.35);background:rgba(251,146,60,.06)">'+
      '<div class="tiny up mb" style="color:var(--alert)">CẢNH BÁO</div><p class="sm">'+h(v.canhBao)+'</p></div>':'');
  U.modal(o);
};

/* ═══════════════ 04 · THÓI QUEN & NGHI LỄ ═══════════════ */
G.VIEWS['thoi-quen'] = function(){
  var o = U.ph({eyebrow:'NHÓM 04 · CÚ HÍCH & NHỊP SỐNG', ic:'ritual', t:'Thói quen & nghi lễ gia đình',
    lead:'Bốn nghi lễ giữ nhịp cả năm. Nhịp quan trọng hơn cường độ — bùng lên một tuần rồi tắt không tạo ra năng lực nào.'});
  o += '<div class="grid g2">' + G.NGHILE.map(function(n){
    return '<div class="card lift" style="border-color:'+n.c+'2e">'+
      '<div class="row wrap" style="gap:8px;margin-bottom:10px">'+U.chip(n.khi,n.c)+U.chip(n.phut)+'</div>'+
      '<b style="font-size:16px;display:block;margin-bottom:12px;color:'+n.c+'">'+h(n.ten)+'</b>'+
      '<div style="display:flex;flex-direction:column;gap:8px">' + n.buoc.map(function(b,i){
        return '<div style="display:flex;gap:9px"><span class="mono tiny" style="color:'+n.c+';flex:none;margin-top:2px;font-weight:800">'+(i+1)+'</span>'+
          '<span class="sm" style="line-height:1.55">'+h(b)+'</span></div>';
      }).join('') + '</div>'+
      '<div class="mt2" style="padding:11px 13px;border-radius:12px;background:'+n.c+'0d;border-left:2px solid '+n.c+'">'+
        '<span class="tiny up" style="color:'+n.c+'">VÌ SAO NGHI LỄ NÀY QUAN TRỌNG</span>'+
        '<p class="sm mt">'+h(n.qua)+'</p></div></div>';
  }).join('') + '</div>';

  o += U.sec('BỐN NHỊP TRONG MỌI CUỘC TRÒ CHUYỆN KHÓ','Áp dụng cho cả buổi ngồi lại lẫn tin nhắn lúc nửa đêm');
  o += '<div class="grid g4">' + G.cul().bonNhip.map(function(b,i){
    var c = ['#2A72C6','#0B7350','#0B6675','var(--gita)'][i];
    return '<div class="card pad-sm" style="border-color:'+c+'2a">'+
      '<div class="row" style="gap:8px;margin-bottom:7px">'+
      '<span style="width:28px;height:28px;border-radius:9px;display:grid;place-items:center;font-weight:900;font-size:12.5px;background:'+c+'22;color:'+c+'">'+(i+1)+'</span>'+
      '<b class="sm" style="color:'+c+'">'+h(b.t)+'</b></div>'+
      '<p class="tiny muted" style="line-height:1.6">'+h(b.d)+'</p></div>';
  }).join('') + '</div>';
  return o;
};

/* ═══════════════ 04 · CÚ HÍCH LỚN ═══════════════ */
G.VIEWS['cu-hich'] = function(){
  var o = U.ph({eyebrow:'NHÓM 04 · CÚ HÍCH & NHỊP SỐNG', ic:'lightning', grad:1, t:'Cú hích lớn',
    lead:'Có những thứ không đi tới bằng bước đi, chỉ tới bằng bước nhảy. Sáu chiến dịch tạo cú hích, mỗi cú hích có lời hứa rõ và một phần thưởng thật.'});
  o += '<div class="grid g2">' + G.CUHICH.map(function(c){
    var pct = Math.min(100, Math.round(c.thamgia/500*100));
    return '<div class="card lift" style="border-color:'+c.c+'2e">'+
      '<div class="row wrap" style="gap:7px;margin-bottom:10px">'+U.chip(c.ma,c.c)+U.chip(c.tier)+
      U.chip(c.muc, c.muc==='Cú hích chấn động'?'#BE0E16':(c.muc==='Cú hích lớn'?'#BE0E16':'#2A72C6'))+
      U.chip(c.ngay+' ngày')+'</div>'+
      '<b style="font-size:16px;display:block;margin-bottom:9px;color:'+c.c+'">'+h(c.ten)+'</b>'+
      '<p class="sm dim" style="line-height:1.65;margin-bottom:12px">'+h(c.hua)+'</p>'+
      '<div style="padding:11px 13px;border-radius:12px;background:var(--phu-2);margin-bottom:12px">'+
        '<span class="tiny up muted">VÌ SAO CÚ HÍCH NÀY MẠNH</span>'+
        '<p class="sm mt" style="line-height:1.6">'+h(c.vi)+'</p></div>'+
      '<div class="row" style="gap:10px;margin-bottom:8px"><span class="tiny muted">Đã tham gia</span>'+
        '<b class="mono" style="color:'+c.c+'">'+c.thamgia+' gia đình</b></div>'+
      U.bar(pct,c.c)+
      '<div class="row mt2" style="gap:9px"><span style="color:var(--gold-ink)">'+ic('crown','w-4 h-4')+'</span>'+
        '<span class="sm">'+h(c.thuong)+'</span></div>'+
      '<button class="btn pri blk mt" data-act="join-cuhich" data-ma="'+h(c.ma)+'">Đưa nhà mình vào cú hích này</button>'+
    '</div>';
  }).join('') + '</div>';
  return o;
};

/* ═══════════════ 04 · BẢNG SỐ GIA ĐÌNH ═══════════════ */
G.VIEWS['bang-so'] = function(){
  var f = G.myFamily(), V = G.VANHANH;
  var o = U.ph({eyebrow:'NHÓM 04 · CÚ HÍCH & NHỊP SỐNG', ic:'chart', t:'Bảng số gia đình',
    lead:'Bảy chỉ số đầu ra của mô hình. Chỉ số của gia đình là năng lực và quan hệ — không bao giờ là tiền hay điểm số của con.'});

  o += '<div class="card mb" style="border-color:rgba(248,113,113,.3)">'+
    '<div class="row"><span style="color:var(--bad)">'+ic('shield','w-4 h-4')+'</span>'+
    '<b>Không gắn chỉ tiêu tiền hay thành tích lên con</b></div>'+
    '<p class="sm muted mt">Gắn doanh số hay điểm số vào bảng này là biến nhà thành nơi làm việc và biến con thành nhân sự. Ranh giới số hai của mô hình.</p></div>';

  o += U.sec('BẢY CHỈ SỐ ĐẦU RA', V.dauRa.nguyenTac);
  var vals = [f.tuchu, 100-f.tuchu, Math.round((6-f.nhac)/6*100), f.tier>=4?78:44, f.tier>=4?85:30, f.tier>=5?70:22, Math.round(f.vai/9*100)];
  o += '<div class="grid g-auto">' + V.dauRa.chiSo.map(function(c,i){
    var cl = ['#0B7350','#5140B4','#BE0E16','#0B6675','var(--gita)','#BE0E16','#2A72C6'][i];
    return '<div class="card lift"><div class="row" style="align-items:flex-start;gap:12px">'+
      U.ring(vals[i], cl, 'ĐIỂM')+
      '<div style="flex:1;min-width:0"><b class="sm" style="display:block;line-height:1.35;margin-bottom:6px">'+h(c.ten)+'</b>'+
      '<p class="tiny muted" style="line-height:1.5">'+h(c.chuan)+'</p></div></div></div>';
  }).join('') + '</div>';

  o += U.sec('SÁU THÁNG GẦN NHẤT','So với chính nhà mình, không so với nhà nào khác');
  o += '<div class="card"><div style="display:flex;align-items:flex-end;gap:14px;height:190px;padding:10px 0">'+
    ['T3','T4','T5','T6','T7','T8'].map(function(m,i){
      var v = [34,42,51,58,66,f.tuchu][i];
      return '<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:8px;height:100%;justify-content:flex-end">'+
        '<b class="mono tiny" style="color:var(--gold-ink)">'+v+'</b>'+
        '<div style="width:100%;max-width:52px;height:'+v+'%;border-radius:9px 9px 3px 3px;'+
        'background:linear-gradient(180deg,var(--gita),var(--gita-do));box-shadow:0 0 22px -6px var(--gita-day)"></div>'+
        '<span class="tiny muted">'+m+'</span></div>';
    }).join('') + '</div>'+
    '<p class="tiny muted center mt">Mức tự chủ của học viên · thang 0–100 · chuẩn cuối chặng 4 là trên 80</p></div>';
  return o;
};

/* ═══════════════ 04 · VINH DANH ═══════════════ */
G.VIEWS['vinh-danh'] = function(){
  var o = U.ph({eyebrow:'NHÓM 04 · CÚ HÍCH & NHỊP SỐNG', ic:'crown', grad:1, t:'Vinh danh & kỳ tích năm',
    lead:'Chuyện tốt trong nhà phải được kể lại. Ghi nhận đúng việc, có bằng chứng, đúng lúc — và ghi nhận cả phần của người lớn.'});

  o += '<div class="card mb" style="border-color:var(--gita-vien-1)">'+
    '<div class="row mb"><span style="color:var(--gold-ink)">'+ic('star','w-4 h-4')+'</span><b>Công thức ghi nhận ba bước</b></div>'+
    '<div class="grid g3" style="gap:12px">'+
    [['THẤY GÌ','Nêu đúng sự việc quan sát được, có mốc thời gian.'],
     ['HỌ ĐÃ TỰ LÀM GÌ','Phần do chính người đó làm, không phải phần hệ thống làm hộ.'],
     ['ĐIỀU ĐÓ GIÚP AI','Tác động thật lên một người cụ thể trong hoặc ngoài nhà.']].map(function(x,i){
      return '<div style="padding:12px;border-radius:13px;background:var(--gita-mo-1)">'+
        '<div class="tiny up" style="color:var(--gold-ink)">BƯỚC '+(i+1)+' · '+h(x[0])+'</div>'+
        '<p class="sm mt">'+h(x[1])+'</p></div>';
    }).join('') + '</div>'+
    '<p class="tiny muted mt2">Ghi nhận không có bằng chứng chỉ là lời khen cho vui — nó gãy ở lần vấp đầu tiên.</p></div>';

  /* Kỳ tích năm đọc G.FAMILIES — kho hồ sơ gia đình, chỉ nạp được khi có
     khoá. Không có kho thì màn này từng ném lỗi, và ném đúng trên bản
     xem thử: phụ huynh, học viên và cộng tác viên đều mất một màn DẪN
     HÀNH ĐỘNG. Nhưng công thức ghi nhận ba bước ở trên KHÔNG cần hồ sơ
     nhà nào cả — nó dùng được ngay cả khi kho trống. Nên chỗ thiếu dữ
     liệu chỉ nói là chưa có nhà nào tới mốc, rồi chỉ tiếp việc phải làm,
     chứ không kéo cả màn xuống theo. */
  var nhaKT = G.dsNha().filter(function(f){ return f.tier >= 3; });
  o += U.sec('KỲ TÍCH NĂM ĐANG CHẠY','Ít nhất một sản phẩm, thành tựu hoặc tác động có bằng chứng');
  if(!nhaKT.length)
    o += '<div class="card mb" style="border-color:var(--gita-vien-1)">'+
      '<b class="sm" style="display:block;margin-bottom:6px">Chưa có kỳ tích nào được ghi trên máy này</b>'+
      '<p class="sm dim" style="line-height:1.75">Kỳ tích năm chỉ hiện khi nhà mình đã qua tầng ba — '+
      'đó là mốc mà một sản phẩm, một thành tựu hay một tác động đã có bằng chứng để kể lại. '+
      'Chưa tới mốc thì việc của hôm nay không phải là chờ: mở công thức ba bước ở trên, ghi lại '+
      'MỘT việc con đã tự làm trong tuần này, kèm ngày giờ. Bản ghi đó là hạt đầu tiên của kỳ tích năm.</p>'+
      '<div class="row wrap mt" style="gap:8px">'+
      '<button class="btn ghost sm" data-v="nhiem-vu">'+ic('check')+'Việc của hôm nay</button>'+
      '<button class="btn ghost sm" data-v="nhat-ky-vi-tri">'+ic('book')+'Ghi vào sổ nhật ký</button></div></div>';
  o += '<div class="grid g2">' + nhaKT.map(function(f){
    var t = G.tierOf(f.tier);
    return '<div class="card lift" style="border-color:'+t.c+'26">'+
      '<div class="row wrap" style="gap:7px;margin-bottom:8px">'+U.chip(t.code,t.c)+U.chip('Ngày '+f.ngay)+'</div>'+
      '<b class="sm" style="display:block">'+h(f.nha)+'</b>'+
      '<p class="tiny muted mb">'+h(f.hv)+' · '+h(f.lop)+'</p>'+
      '<div style="padding:11px 13px;border-radius:12px;background:'+t.c+'0d;border-left:2px solid '+t.c+'">'+
      '<p class="sm">'+h(f.kyTich)+'</p></div></div>';
  }).join('') + '</div>';

  o += U.sec('GHI NHẬN KHÔNG XẾP HẠNG','Ghi nhận việc đã làm, sắp theo thứ tự chữ cái — không theo thứ hạng');
  o += '<div class="card"><p class="sm dim" style="line-height:1.7">'+
    h((G.DAISU && G.DAISU.vinhDanh && G.DAISU.vinhDanh.cachThuc && G.DAISU.vinhDanh.cachThuc[0]) ||
      'Mỗi quý một lần, tổng hợp việc đã làm và đăng một bài ghi nhận, sắp theo thứ tự chữ cái chứ không theo thứ hạng.')+'</p></div>';
  return o;
};

/* ═══════════════ 04 · SÁU RANH GIỚI ═══════════════ */
G.VIEWS['ranh-gioi'] = function(){
  var R = G.VANHANH.ranhGioi;
  var o = U.ph({eyebrow:'NHÓM 04 · CÚ HÍCH & NHỊP SỐNG', ic:'shield', grad:1, t:'Sáu ranh giới không thương lượng',
    lead:R.vitri||'Đọc bắt buộc trước khi dùng mô hình này với bất kỳ gia đình nào.'});
  o += '<div class="card mb" style="border-color:rgba(248,113,113,.3);background:rgba(248,113,113,.05)">'+
    '<b>'+h(R.ten)+'</b></div>';
  o += '<div class="grid g2">' + R.muc.map(function(m,i){
    return '<div class="card lift" style="border-color:rgba(248,113,113,.22)">'+
      '<div class="row" style="gap:10px;margin-bottom:9px">'+
      '<span style="width:32px;height:32px;border-radius:10px;display:grid;place-items:center;background:rgba(248,113,113,.15);color:var(--bad);flex:none">'+ic('x','w-4 h-4')+'</span>'+
      '<b style="font-size:14.5px;line-height:1.35">'+h(m.khong)+'</b></div>'+
      '<p class="sm muted" style="line-height:1.65">'+h(m.vi)+'</p></div>';
  }).join('') + '</div>';

  o += U.sec('RANH GIỚI NGÔN TỪ','Sáu điều không được làm khi trao đổi với gia đình');
  o += '<div class="grid g2">' + G.NGONTU_RANH.map(function(r){
    return '<div class="card pad-sm"><div class="row" style="gap:9px;margin-bottom:6px">'+
      '<span style="color:var(--bad);flex:none;margin-top:2px">'+ic('x','w-3 h-3')+'</span>'+
      '<b class="sm">'+h(r.k)+'</b></div><p class="tiny muted" style="line-height:1.6;padding-left:22px">'+h(r.v)+'</p></div>';
  }).join('') + '</div>';

  if(G.DAISU.quyTac && G.DAISU.quyTac.muc){
    o += U.sec('QUY TẮC AN TOÀN KHI CHIA SẺ', G.DAISU.quyTac.ten);
    o += '<div class="card">' + G.dsHet(G.DAISU.quyTac.muc,6).map(function(q,i){
      return '<div class="rule"><span class="n">'+(i+1)+'</span><div class="tx"><b>'+h(q.quyTac)+'</b>'+
        '<p>'+h(G.chuHet(q.vi||'',240))+'</p></div></div>';
    }).join('') + '</div>';
  }
  return o;
};

})();
