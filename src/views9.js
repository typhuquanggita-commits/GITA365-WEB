/* ═══════════════════════════════════════════════════════════════
   GITA 365 · v7.3 — MA TRẬN 5 TẦNG · CHÂN DUNG KHÁCH HÀNG ·
   PHIẾU REFERRAL · HỆ ĐO LƯỜNG · PHÂN HẠNG VIP & VVIP ·
   CÂY TIỀN · TỆP NHÂN SỰ TRUNG THÀNH
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;
G.VIEWS = G.VIEWS || {};
(function(){
var U = G.U, h = U.h, ic = U.ic;

function tc(t){ var x=(G.TIERS||[]).filter(function(y){return y.code===t;})[0]; return x ? x.c : 'var(--gita)'; }
function coTang(t){ return !!(G['MATRAN_'+t] && G['MATRAN_'+t].length); }
function lay(t, ma){ var a=G['MATRAN_'+t]||[]; for(var i=0;i<a.length;i++) if(a[i].ma===ma) return a[i]; return null; }

/* ═══════════════ MA TRẬN 220 VẤN ĐỀ × 5 TẦNG ═══════════════ */
G.VIEWS['ma-tran'] = function(){
  var M = G.MATRAN;
  if(!M) return U.empty('Chưa mở được ma trận', 'Ma trận nằm trong gói nền. Đăng nhập lại để nạp.');
  var co = ['T1','T2','T3','T4','T5'].filter(coTang);

  var o = U.ph({eyebrow:'NHÓM 03 · KHO BÁU VẬT', ic:'map', grad:1, t:'Ma trận 220 vấn đề × 5 tầng',
    lead:'Mười một nhóm, hai mươi vấn đề mỗi nhóm. Mỗi vấn đề có nguyên nhân cốt lõi, key giải pháp, và lộ trình riêng cho từng tầng — kèm việc của học viên, phụ huynh, tư vấn và Coach, mục tiêu phải đạt và hồ sơ phải nộp.'});

  o += '<div class="grid g4 mb">'+
    U.stat({k:'Nhóm vấn đề', v:String(M.nhom.length), d:'13.1 đến 13.11', c:'#0B6675'})+
    U.stat({k:'Vấn đề',      v:String(M.vande.length), d:'20 vấn đề mỗi nhóm', c:'#185AB4'})+
    U.stat({k:'Tầng đã mở',  v:co.length+'/5', d:co.length<5?'gói tầng còn lại đang mở ở nền':'đủ năm tầng', c:'#0B7350'})+
    U.stat({k:'Ô nội dung',  v:String(M.vande.length*co.length*8), d:'8 cột sâu mỗi tầng', c:'#5140B4'})+
    '</div>';

  o += '<div class="row wrap mb" style="gap:8px">'+
    '<button class="btn ghost sm on" data-mtn="ALL">Tất cả nhóm</button>'+
    M.nhom.map(function(n){
      return '<button class="btn ghost sm" data-mtn="'+h(n.ma)+'">'+h(n.ten)+'</button>';
    }).join('')+'</div>';

  o += '<div class="grid g2" id="mtList">' + M.vande.map(function(v){
    return '<button class="card lift" data-mtv="'+h(v.ma)+'" data-f="'+h(v.nhom)+'" style="text-align:left">'+
      '<div class="row wrap mb" style="gap:7px">'+U.chip(v.ma,'#0B6675')+
      '<span class="tiny muted">'+h(v.nhomTen)+'</span></div>'+
      '<b class="sm" style="display:block;line-height:1.45;margin-bottom:6px">'+h(v.ten)+'</b>'+
      '<p class="tiny muted" style="line-height:1.55">'+h(v.nguyen)+'</p></button>';
  }).join('') + '</div>';
  return o;
};

G.maTranModal = function(ma){
  var M = G.MATRAN; if(!M) return;
  var v = M.vande.filter(function(x){return x.ma===ma;})[0]; if(!v) return;
  var co = ['T1','T2','T3','T4','T5'].filter(coTang);

  var html = '<div class="row wrap" style="gap:7px;margin-bottom:9px">'+U.chip(v.ma,'#0B6675')+U.chip(v.nhomTen)+'</div>'+
    '<h2 style="font-size:21px;font-weight:800;margin-bottom:12px">'+h(v.ten)+'</h2>'+
    '<div class="grid g2" style="gap:10px;margin-bottom:14px">'+
      '<div class="card pad-sm"><div class="tiny up muted mb">NGUYÊN NHÂN CỐT LÕI</div><p class="sm">'+h(v.nguyen)+'</p></div>'+
      '<div class="card pad-sm"><div class="tiny up muted mb">KEY GIẢI PHÁP THÁO GỠ</div><p class="sm">'+h(v.key)+'</p></div>'+
    '</div>'+
    '<div class="card pad-sm mb"><div class="tiny up muted mb">ĐIỂM ĐÁNH GIÁ</div><p class="tiny dim" style="line-height:1.6">'+h(v.cham)+'</p></div>';

  if(!co.length){
    html += U.empty('Chưa mở gói tầng nào','Phần sâu của từng tầng nằm trong gói theo tầng, đang được mở ở nền.');
  } else {
    html += '<div class="row wrap mb" style="gap:7px">'+ co.map(function(t,i){
      return '<button class="btn ghost sm'+(i===0?' on':'')+'" data-mtt="'+h(t)+'" style="border-color:'+tc(t)+'55;color:'+tc(t)+'">'+h(t)+'</button>';
    }).join('') +'</div>';
    html += co.map(function(t,i){
      var d = lay(t, ma) || {};
      var K = [['Lộ trình '+t, d.lo],['Hoạt động của học sinh', d.hs],['Hoạt động của phụ huynh', d.ph],
               ['Hoạt động của tư vấn', d.tv],['Hoạt động của Coach', d.coach],
               ['Mục tiêu đạt được', d.dich],['Hồ sơ đầu ra', d.hoSo],['Quy trình tạo động lực', d.quyTrinh]];
      return '<div data-mtp="'+h(t)+'" style="display:'+(i===0?'block':'none')+'">'+
        K.filter(function(k){return k[1];}).map(function(k){
          return '<div class="card mb" style="border-color:'+tc(t)+'22">'+
            '<div class="tiny up mb" style="color:'+tc(t)+'">'+h(k[0])+'</div>'+
            '<p class="sm dim" style="line-height:1.75;white-space:pre-wrap">'+h(k[1])+'</p></div>';
        }).join('') + '</div>';
    }).join('');
  }
  html += '<button class="btn ghost sm mt" data-mtin="1">'+ic('out')+'In hoặc lưu PDF phác đồ này</button>';
  U.modal(html);
};

/* ═══════════════ PHIẾU CHỈ DẪN REFERRAL ═══════════════ */
G.VIEWS['referral'] = function(){
  /* Kho tra cứu của nghề, không phải công cụ thao tác với gia đình.
     Bảng PERM đã nói rõ: nghe_chung mở cho R01–R12 — "toàn bộ kho nghề".
     Khoá ở pro_coach hoặc pro_consult thì Chuyên gia đánh giá, Chuyên gia
     tư vấn và Phân tích dữ liệu thấy mục này trong trình đơn mà bấm vào
     chỉ nhận được một thẻ khoá — đúng loại mục chết anh Quang đã bảo dẹp.
     Quyền THAO TÁC (buồng lái Coach, cổng nghiệm thu, xuất dữ liệu) vẫn
     giữ nguyên ở pro_coach và pro_approve. */
  if(!G.can('nghe_chung')) return U.lockCard();
  var R = G.REFERRAL;
  if(!R) return U.empty('Chưa mở được phiếu referral','Phần này nằm trong kho nghề.');

  var o = U.ph({eyebrow:'NHÓM 04 · MỞ CỬA', ic:'share', grad:1, t:'Phiếu chỉ dẫn referral',
    lead:R.cot});

  o += '<div class="card mb" style="border-color:var(--gita-vien-1)">'+
    '<div class="grid g2" style="gap:12px">'+
    '<div><div class="tiny up muted mb">NGƯỜI TRÌNH BÀY</div><p class="sm"><b>'+h(R.nguoi)+'</b> · '+h(R.donVi)+'</p></div>'+
    '<div><div class="tiny up muted mb">ĐỐI TƯỢNG TRỌNG TÂM</div><p class="sm">'+h(R.doiTuong)+'</p></div>'+
    '</div><p class="tiny muted mt">'+h(R.linhVuc)+'</p>'+
    '<div class="center mt2"><b style="font-size:18px;color:var(--gold-ink);letter-spacing:.02em">'+h(R.thongDiep)+'</b></div></div>';

  o += '<div class="grid g4 mb">'+R.bonBuoc.map(function(b,i){
    return '<div class="card pad-sm center"><div class="tiny muted mb">BƯỚC '+(i+1)+'</div><b class="sm">'+h(b)+'</b></div>';
  }).join('')+'</div>';

  o += U.sec('BỐN TRỤ CỘT G – I – T – A','Bốn miền để đọc đúng nguyên nhân, không đọc theo triệu chứng.');
  o += '<div class="grid g4">'+R.truCot.map(function(t){
    return '<div class="card pad-sm" style="border-color:'+t.c+'33">'+
      '<div class="row mb" style="gap:8px">'+U.dot(t.c)+'<b class="sm" style="color:'+t.c+'">'+h(t.ten)+'</b></div>'+
      '<p class="tiny dim" style="line-height:1.6">'+h(t.mo)+'</p></div>';
  }).join('')+'</div>';

  o += U.sec('1 · KHÁCH HÀNG TIỀM NĂNG HÀNG TUẦN','Năm chân dung GITA đặc biệt mong được kết nối.');
  o += R.tiemNang.map(function(x){
    return '<div class="card mb" style="border-color:'+tc(x.tang)+'22">'+
      '<div class="row wrap mb" style="gap:7px">'+U.chip(String(x.no),'var(--gita)')+U.chip(x.tang,tc(x.tang))+U.chip(x.nhom)+
      '<b class="sm">'+h(x.ten)+'</b></div>'+
      '<p class="sm dim" style="line-height:1.7;margin-bottom:8px">'+h(x.mo)+'</p>'+
      '<div class="tiny" style="color:var(--ink-4)">'+ic('arrow','w-3 h-3')+' '+h(x.vao)+'</div></div>';
  }).join('');

  o += U.sec('2 · REFERRAL MƠ ƯỚC','Những kết nối chiến lược mở ra nhiều cơ hội hợp tác.');
  o += '<div class="grid g2">'+R.moUoc.map(function(x){
    return '<div class="card pad-sm"><div class="row wrap mb" style="gap:7px">'+U.chip(String(x.no),'#5140B4')+
      '<b class="sm">'+h(x.ten)+'</b></div>'+
      '<p class="tiny dim" style="line-height:1.6">'+h(x.mo)+'</p></div>';
  }).join('')+'</div>';
  o += '<div class="card mt" style="border-color:var(--gita-vien-2);background:var(--gita-mo-1)">'+
    '<div class="row mb" style="gap:8px"><span style="color:var(--gold-ink)">'+ic('star','w-4 h-4')+'</span>'+
    '<b style="color:var(--gold-ink)">REFERRAL MƠ ƯỚC SỐ 1</b></div>'+
    '<p class="sm dim" style="line-height:1.75">'+h(R.moUocSo1)+'</p></div>';

  o += U.sec('3 · REFERRAL KHÔNG PHÙ HỢP','Nói rõ từ đầu để không làm mất thời gian của ai.');
  o += '<div class="card" style="border-color:rgba(248,113,113,.3)">'+U.list(R.khongPhuHop,'#BE0E16')+'</div>';

  o += U.sec('4 · DẤU HIỆU NHẬN BIẾT','Nghe phụ huynh nói một trong những câu này thì nghĩ ngay đến GITA.');
  o += '<div class="grid g2">'+R.dauHieu.map(function(d,i){
    return '<div class="card pad-sm"><div class="row" style="gap:9px;align-items:flex-start">'+
      '<span class="chip" style="flex:none">'+(i+1)+'</span>'+
      '<span class="sm" style="line-height:1.6;font-style:italic">'+h('“'+d+'”')+'</span></div></div>';
  }).join('')+'</div>';

  o += U.sec('5 · BA CÂU HỎI XÁC ĐỊNH REFERRAL','Đủ PAIN + GOAL + GAP mới là một referral chất lượng.');
  o += R.baCauHoi.map(function(q){
    var c = q.bat==='PAIN'?'#BE0E16':q.bat==='GOAL'?'var(--gita)':'#0B6675';
    return '<div class="card mb" style="border-color:'+c+'33">'+
      '<div class="row wrap mb" style="gap:8px">'+U.chip(q.bat,c)+'</div>'+
      '<p class="sm" style="line-height:1.7;margin-bottom:6px"><b>'+h('“'+q.hoi+'”')+'</b></p>'+
      '<p class="tiny muted">'+h(q.y)+'</p></div>';
  }).join('');
  o += '<div class="card" style="border-color:var(--gita-vien-1)"><p class="sm dim" style="line-height:1.75">'+h(R.quyUoc)+'</p></div>';

  o += U.sec('6 · BA CÁCH MỞ LỜI','Dùng nguyên văn được. Sửa cho hợp giọng mình cũng được.');
  o += R.gioiThieu.map(function(g){
    return '<div class="card mb"><div class="tiny up mb" style="color:var(--gold-ink)">'+h(g.cach)+'</div>'+
      U.quote(g.loi)+'</div>';
  }).join('');

  o += U.sec('7 · HỆ SINH THÁI ĐỒNG HÀNH','Tám chặng, đi theo thứ tự.');
  o += '<div class="grid g4">'+R.heSinhThai.map(function(x,i){
    return '<div class="card pad-sm center"><div class="tiny muted mb">'+(i+1)+'</div><b class="tiny">'+h(x)+'</b></div>';
  }).join('')+'</div>';
  return o;
};

/* ═══════════════ CHÂN DUNG TỆP KHÁCH HÀNG ═══════════════ */
G.VIEWS['chan-dung-kh'] = function(){
  /* Kho tra cứu của nghề, không phải công cụ thao tác với gia đình.
     Bảng PERM đã nói rõ: nghe_chung mở cho R01–R12 — "toàn bộ kho nghề".
     Khoá ở pro_coach hoặc pro_consult thì Chuyên gia đánh giá, Chuyên gia
     tư vấn và Phân tích dữ liệu thấy mục này trong trình đơn mà bấm vào
     chỉ nhận được một thẻ khoá — đúng loại mục chết anh Quang đã bảo dẹp.
     Quyền THAO TÁC (buồng lái Coach, cổng nghiệm thu, xuất dữ liệu) vẫn
     giữ nguyên ở pro_coach và pro_approve. */
  if(!G.can('nghe_chung')) return U.lockCard();
  var C = G.CHANDUNG_KH;
  if(!C) return U.empty('Chưa mở được chân dung khách hàng','Phần này nằm trong kho nghề.');

  var o = U.ph({eyebrow:'NHÓM 04 · MỞ CỬA', ic:'users', grad:1, t:'Sáu chân dung tệp khách hàng',
    lead:'Không phải nhà nào cũng giống nhau. Đọc đúng chân dung là gửi đúng lộ trình, đúng tài liệu và đúng người đồng hành ngay từ buổi đầu.'});

  o += C.map(function(x){
    return '<div class="card mb" style="border-color:'+x.c+'2a">'+
      '<div class="row wrap" style="gap:8px;justify-content:space-between;margin-bottom:10px">'+
      '<div class="row wrap" style="gap:8px">'+U.chip(x.ma,x.c)+U.chip(x.tang,tc(x.tang))+
      '<b style="color:'+x.c+';font-size:16px">'+h(x.ten)+'</b></div>'+
      '<span class="tiny muted">'+h(x.tyLe)+'</span></div>'+
      '<div class="grid g3" style="gap:10px;margin-bottom:11px">'+
      '<div class="card pad-sm"><div class="tiny up muted mb">PAIN — NỖI ĐAU</div><p class="tiny">'+h(x.dau)+'</p></div>'+
      '<div class="card pad-sm"><div class="tiny up muted mb">GOAL — ĐÍCH</div><p class="tiny">'+h(x.dich)+'</p></div>'+
      '<div class="card pad-sm"><div class="tiny up muted mb">GAP — KHOẢNG TRỐNG</div><p class="tiny">'+h(x.trong)+'</p></div>'+
      '</div>'+
      '<div class="tiny up mb" style="color:'+x.c+'">DẤU HIỆU NHẬN RA</div>'+U.list(x.dauHieu,x.c)+
      '<div class="card pad-sm mt" style="border-color:'+x.c+'33"><div class="tiny up mb" style="color:'+x.c+'">CÂU MỞ LỜI</div>'+
      '<p class="sm" style="font-style:italic;line-height:1.7">'+h('“'+x.moLoi+'”')+'</p></div>'+
      '<div class="grid g2 mt" style="gap:10px">'+
      '<div class="card pad-sm"><div class="tiny up muted mb">KHẢ NĂNG LÊN VIP</div><p class="tiny">'+h(x.vip)+'</p></div>'+
      '<div class="card pad-sm" style="border-color:rgba(251,146,60,.35)"><div class="tiny up mb" style="color:var(--alert)">CẢNH BÁO</div><p class="tiny">'+h(x.canhBao)+'</p></div>'+
      '</div></div>';
  }).join('');
  return o;
};

/* ═══════════════ HỆ ĐO LƯỜNG KHÁCH HÀNG ═══════════════ */
G.VIEWS['do-luong-kh'] = function(){
  if(!G.can('pro_consult')) return U.lockCard();
  var D = G.DOLUONG_KH;
  if(!D) return U.empty('Chưa mở được hệ đo lường','Phần này nằm trong kho nghề.');

  var o = U.ph({eyebrow:'NHÓM 05 · QUẢN TRỊ', ic:'pulse', grad:1, t:'Hệ đo lường khách hàng',
    lead:D.cot});

  o += U.sec('BẢY CHỈ SỐ','Mỗi chỉ số có cách tính, ngưỡng cảnh báo và lý do tồn tại.');
  o += D.chiSo.map(function(m){
    return '<div class="card mb" style="border-color:'+m.c+'2a">'+
      '<div class="row wrap mb" style="gap:8px">'+U.chip(m.ma,m.c)+
      '<b style="color:'+m.c+'">'+h(m.ten)+'</b><span class="tiny muted">đơn vị: '+h(m.dv)+'</span></div>'+
      '<div class="grid g3" style="gap:10px">'+
      '<div class="card pad-sm"><div class="tiny up muted mb">CÁCH TÍNH</div><p class="tiny">'+h(m.cach)+'</p></div>'+
      '<div class="card pad-sm" style="border-color:rgba(251,146,60,.3)"><div class="tiny up mb" style="color:var(--alert)">NGƯỠNG</div><p class="tiny">'+h(m.nguong)+'</p></div>'+
      '<div class="card pad-sm"><div class="tiny up muted mb">ĐỂ LÀM GÌ</div><p class="tiny">'+h(m.dung)+'</p></div>'+
      '</div></div>';
  }).join('');

  o += U.sec('CHU KỲ ĐO','Đo lúc nào, ai đọc, làm gì sau khi đọc.');
  o += U.tbl(['Khi nào','Việc phải làm'], D.chuKy.map(function(k){
    return ['<b class="sm">'+h(k.khi)+'</b>', '<span class="tiny">'+h(k.viec)+'</span>'];
  }));

  o += U.sec('VÒNG CẢI TIẾN','Cập nhật để hợp với khách hàng tiềm năng của kỳ sau.');
  o += '<div class="card">'+U.list(D.caiTien,'#0B7350')+'</div>';
  return o;
};

/* ═══════════════ PHÂN HẠNG VIP & VVIP ═══════════════ */
G.VIEWS['hang-vip'] = function(){
  if(!G.can('pro_consult')) return U.lockCard();
  var P = G.PHANHANG, V = G.CHUAN_VIP;
  if(!P) return U.empty('Chưa mở được phân hạng','Phần này nằm trong kho nghề.');

  var o = U.ph({eyebrow:'NHÓM 05 · QUẢN TRỊ', ic:'crown', grad:1, t:'Phân hạng khách hàng · VIP và VVIP',
    lead:P.cot});

  o += '<div class="grid g4 mb">'+P.hang.map(function(x){
    return '<div class="card pad-sm center" style="border-color:'+x.c+'44">'+
      '<div style="color:'+x.c+';margin-bottom:6px">'+ic(x.tt>=3?'crown':'shield','w-5 h-5')+'</div>'+
      '<b style="color:'+x.c+'">'+h(x.ten)+'</b>'+
      '<p class="tiny muted mt">'+h(x.sla)+'</p></div>';
  }).join('')+'</div>';

  o += P.hang.map(function(x){
    return '<div class="card mb" style="border-color:'+x.c+'33'+(x.tt>=3?';background:'+x.c+'0a':'')+'">'+
      '<div class="row wrap mb" style="gap:8px">'+U.chip(x.ma,x.c)+
      '<b style="color:'+x.c+';font-size:18px">'+h(x.ten)+'</b></div>'+
      '<div class="tiny up mb" style="color:'+x.c+'">ĐIỀU KIỆN VÀO</div>'+U.list(x.vao,x.c)+
      '<div class="grid g2 mt" style="gap:10px">'+
      '<div class="card pad-sm"><div class="tiny up muted mb">TÀI LIỆU ĐƯỢC MỞ</div><p class="tiny">'+h(x.taiLieu)+'</p></div>'+
      '<div class="card pad-sm"><div class="tiny up muted mb">AI PHỤC VỤ</div><p class="tiny">'+h(x.nguoi)+'</p></div>'+
      '<div class="card pad-sm"><div class="tiny up muted mb">THỜI HẠN TRẢ LỜI</div><p class="tiny">'+h(x.sla)+'</p></div>'+
      '<div class="card pad-sm"><div class="tiny up muted mb">ĐIỂM CHẠM TỐI THIỂU</div><p class="tiny">'+h(x.cham)+'</p></div>'+
      '<div class="card pad-sm"><div class="tiny up muted mb">TRỢ LÝ AI LÀM GÌ</div><p class="tiny">'+h(x.ai)+'</p></div>'+
      '<div class="card pad-sm"><div class="tiny up muted mb">QUÀ VÀ QUYỀN THÊM</div><p class="tiny">'+h(x.qua)+'</p></div>'+
      '</div></div>';
  }).join('');

  o += U.sec('LUẬT GIỮ HẠNG','Lên bằng dữ liệu, xuống cũng bằng dữ liệu.');
  o += '<div class="card">'+U.list(P.giuHang,'var(--gita)')+'</div>';

  if(V){
    o += U.sec('CHUẨN NGƯỜI PHỤC VỤ VIP', V.cot);
    o += '<div class="grid g2">'+
      '<div class="card"><div class="up mb" style="color:#0B6675">TƯ VẤN VIP</div>'+U.list(V.tuVan,'#0B6675')+'</div>'+
      '<div class="card"><div class="up mb" style="color:var(--gita)">COACH VIP</div>'+U.list(V.coach,'var(--gita)')+'</div>'+
      '</div>';

    o += U.sec('QUY TRÌNH PHÂN CÔNG','Sáu bước, không bỏ bước nào.');
    o += V.phanCong.map(function(b){
      return '<div class="card mb"><div class="row" style="gap:11px;align-items:flex-start">'+
        '<span class="chip" style="flex:none;color:var(--gold-ink);border-color:var(--gita-vien-2)">'+b.buoc+'</span>'+
        '<div><b class="sm" style="display:block;margin-bottom:4px">'+h(b.ten)+'</b>'+
        '<p class="tiny dim" style="line-height:1.65">'+h(b.mo)+'</p></div></div></div>';
    }).join('');

    o += U.sec('TRỢ LÝ AI CHĂM SÓC VIP','Bảy việc trợ lý làm tự động, trong đúng giới hạn được cấp.');
    o += '<div class="grid g2">'+V.aiVip.map(function(a){
      return '<div class="card pad-sm" style="border-color:var(--gita-mo-3)">'+
        '<div class="row mb" style="gap:8px"><span style="color:var(--gold-ink)">'+ic('spark','w-4 h-4')+'</span>'+
        '<b class="sm">'+h(a.ten)+'</b></div>'+
        '<p class="tiny dim" style="line-height:1.65">'+h(a.mo)+'</p></div>';
    }).join('')+'</div>';
  }
  return o;
};

/* ═══════════════ CÂY TIỀN — CHĂM SÓC VIP & VVIP ═══════════════ */
G.VIEWS['cay-tien'] = function(){
  if(!G.can('pro_consult')) return U.lockCard();
  var C = G.CAYTIEN;
  if(!C) return U.empty('Chưa mở được hệ chăm sóc','Phần này nằm trong kho nghề.');

  var o = U.ph({eyebrow:'NHÓM 05 · QUẢN TRỊ', ic:'seed', grad:1, t:'Cây tiền — hệ chăm sóc VIP và VVIP',
    lead:C.nguon.luan});

  o += '<div class="card mb" style="border-color:var(--gita-vien-1)">'+
    '<div class="row mb" style="gap:8px"><span style="color:var(--gold-ink)">'+ic('book','w-4 h-4')+'</span>'+
    '<b>Nguồn luận điểm</b></div>'+
    '<p class="sm dim" style="line-height:1.75"><b>'+h(C.nguon.ten)+'</b> — '+h(C.nguon.tacGia)+
    ' · '+h(C.nguon.tuSach)+'</p>'+
    '<p class="sm mt"><b>'+h(C.nguon.bonViec)+'</b></p>'+
    '<div class="mt">'+U.list(C.nguon.chuong,'#5140B4')+'</div>'+
    '<p class="tiny muted mt" style="line-height:1.65">'+h(C.nguon.ghiChu)+'</p></div>';

  o += U.sec('BỐN VIỆC, ĐỌC THEO GITA','Sách nói cho doanh nghiệp. GITA đọc lại cho một hệ đồng hành gia đình.');
  o += C.bonViec.map(function(b){
    return '<div class="card mb" style="border-color:'+b.c+'2a">'+
      '<div class="row wrap mb" style="gap:9px">'+U.chip(String(b.no),b.c)+
      '<b style="color:'+b.c+';font-size:16px">'+h(b.ten)+'</b>'+
      '<span class="tiny muted" style="font-style:italic">'+h(b.sach)+'</span></div>'+
      '<p class="sm dim" style="line-height:1.75;margin-bottom:10px">'+h(b.gita)+'</p>'+
      U.list(b.lam,b.c)+'</div>';
  }).join('');

  o += U.sec('ĐIỂM CÂY TIỀN', C.diemCay.cot);
  o += U.tbl(['Mã','Yếu tố','Trọng số','Cách tính'], C.diemCay.yeuTo.map(function(y){
    return [U.chip(y.ma,'var(--gita)'), '<b class="sm">'+h(y.ten)+'</b>',
            '<b class="sm" style="color:var(--gold-ink)">'+y.trong+'%</b>', '<span class="tiny">'+h(y.cach)+'</span>'];
  }));
  o += '<div class="grid g4 mt">'+C.diemCay.doc.map(function(d){
    return '<div class="card pad-sm" style="border-color:'+d.c+'44">'+
      '<div class="row mb" style="gap:8px">'+U.dot(d.c)+'<b class="sm" style="color:'+d.c+'">'+h(d.ten)+'</b></div>'+
      '<div class="tiny muted mb">'+d.tu+'–'+d.den+' điểm</div>'+
      '<p class="tiny dim" style="line-height:1.6">'+h(d.y)+'</p></div>';
  }).join('')+'</div>';
  o += '<div class="card mt" style="border-color:rgba(248,113,113,.28)">'+
    '<div class="tiny up mb" style="color:#BE0E16">RANH GIỚI CỦA ĐIỂM SỐ NÀY</div>'+
    U.list(C.diemCay.luat,'#BE0E16')+'</div>';

  o += U.sec('PHÉP Ô LƯỚI', C.oLuoi.cot);
  o += '<div class="card"><div class="grid g2 mb" style="gap:10px">'+
    '<div class="card pad-sm"><div class="tiny up muted mb">TRỤC DỌC</div><p class="sm">'+h(C.oLuoi.truc1)+'</p></div>'+
    '<div class="card pad-sm"><div class="tiny up muted mb">TRỤC NGANG</div><p class="sm">'+h(C.oLuoi.truc2)+'</p></div>'+
    '</div>'+U.list(C.oLuoi.luat,'#0B6675')+'</div>';

  o += U.sec('THẺ PHỤC VỤ','Sách chia thẻ bạc – vàng – bạch kim. GITA đọc thành bốn hạng.');
  o += '<div class="grid g4">'+C.theDoi.map(function(t){
    return '<div class="card pad-sm" style="border-color:'+t.c+'44">'+
      '<div class="tiny muted mb">'+h(t.sach)+'</div>'+
      '<b class="sm" style="color:'+t.c+'">'+h(t.gita)+'</b></div>';
  }).join('')+'</div>';

  o += U.sec('MƯỜI HAI NHỊP CHĂM SÓC','Cột VIP là chuẩn tối thiểu. Cột VVIP là phần cộng thêm, không thay thế.');
  o += U.tbl(['Nhịp','VIP','VVIP'], C.nhipChamSoc.map(function(n){
    return ['<b class="sm">'+h(n.nhip)+'</b>',
            '<span class="tiny">'+h(n.vip)+'</span>',
            '<span class="tiny" style="color:var(--gita-do)">'+h(n.vvip)+'</span>'];
  }));

  o += U.sec('BỐN NẤC QUAN HỆ','Từ mua bán tới liên minh chiến lược.');
  o += '<div class="grid g4">'+C.bonNac.map(function(n){
    return '<div class="card pad-sm" style="border-color:'+n.c+'44">'+
      '<div class="row mb" style="gap:8px">'+U.chip('NẤC '+n.nac,n.c)+'</div>'+
      '<b class="sm" style="display:block;color:'+n.c+';margin-bottom:6px">'+h(n.ten)+'</b>'+
      '<p class="tiny dim" style="line-height:1.6;margin-bottom:8px">'+h(n.mo)+'</p>'+
      '<div class="tiny muted mb"><b>Dấu hiệu:</b> '+h(n.dau)+'</div>'+
      '<div class="tiny" style="color:'+n.c+'"><b>Lên nấc:</b> '+h(n.len)+'</div></div>';
  }).join('')+'</div>';

  o += U.sec('NHÂN BẢN DỊCH VỤ', C.nhanBan.cot);
  o += '<div class="card">'+U.list(C.nhanBan.viec,'#0B7350')+'</div>';

  o += U.sec('GIÁ TRỊ TRỌN ĐỜI CỦA MỘT GIA ĐÌNH', C.vongDoi.cot);
  o += '<div class="card"><div class="card pad-sm mb" style="border-color:var(--gita-vien-1)">'+
    '<p class="sm" style="line-height:1.75"><b>'+h(C.vongDoi.congThuc)+'</b></p></div>'+
    U.list(C.vongDoi.y,'var(--gita)')+'</div>';
  return o;
};

/* ═══════════════ TỆP NHÂN SỰ TRUNG THÀNH ═══════════════ */
G.VIEWS['nhan-su-tt'] = function(){
  if(!G.can('pro_consult')) return U.lockCard();
  var N = G.NHANSU_TT;
  if(!N) return U.empty('Chưa mở được tệp nhân sự','Phần này nằm trong kho nghề.');

  var o = U.ph({eyebrow:'NHÓM 05 · QUẢN TRỊ', ic:'users', grad:1, t:'Tệp nhân sự trung thành',
    lead:N.cot});

  o += N.bac.map(function(b){
    return '<div class="card mb" style="border-color:'+b.c+'2a">'+
      '<div class="row wrap mb" style="gap:8px">'+U.chip('BẬC '+b.no,b.c)+U.chip(b.thang)+
      '<b style="color:'+b.c+';font-size:16px">'+h(b.ten)+'</b></div>'+
      '<div class="grid g3" style="gap:10px">'+
      '<div class="card pad-sm"><div class="tiny up muted mb">DẤU HIỆU</div><p class="tiny">'+h(b.dau)+'</p></div>'+
      '<div class="card pad-sm" style="border-color:'+b.c+'33"><div class="tiny up mb" style="color:'+b.c+'">GIỮ BẰNG GÌ</div><p class="tiny">'+h(b.giu)+'</p></div>'+
      '<div class="card pad-sm" style="border-color:rgba(248,113,113,.28)"><div class="tiny up mb" style="color:#BE0E16">MẤT VÌ GÌ</div><p class="tiny">'+h(b.roi)+'</p></div>'+
      '</div></div>';
  }).join('');

  o += U.sec('BẢY CHỈ SỐ ĐO ĐỘ TRUNG THÀNH','Không xếp hạng người bằng doanh số đơn thuần.');
  o += U.tbl(['Mã','Chỉ số','Cách tính'], N.doTrungThanh.map(function(x){
    return [U.chip(x.ma,'#0B7350'), '<b class="sm">'+h(x.ten)+'</b>', '<span class="tiny">'+h(x.cach)+'</span>'];
  }));

  o += U.sec('NĂM LUẬT','Không thương lượng.');
  o += '<div class="card">'+U.list(N.luat,'var(--gita)')+'</div>';
  return o;
};

/* ═══════════════ SỰ KIỆN ═══════════════ */
function on(sel, fn){
  document.addEventListener('click', function(e){
    var el = e.target.closest && e.target.closest(sel);
    if(el){ e.preventDefault(); fn(el, e); }
  });
}
on('[data-mtn]', function(el){
  var f = el.getAttribute('data-mtn');
  document.querySelectorAll('[data-mtn]').forEach(function(b){ b.classList.toggle('on', b===el); });
  document.querySelectorAll('#mtList [data-f]').forEach(function(c){
    c.style.display = (f==='ALL' || c.getAttribute('data-f')===f) ? '' : 'none'; });
});
on('[data-mtv]', function(el){ G.maTranModal(el.getAttribute('data-mtv')); });
on('[data-mtt]', function(el){
  var t = el.getAttribute('data-mtt');
  document.querySelectorAll('[data-mtt]').forEach(function(b){ b.classList.toggle('on', b===el); });
  document.querySelectorAll('[data-mtp]').forEach(function(p){
    p.style.display = p.getAttribute('data-mtp')===t ? 'block' : 'none'; });
});
on('[data-mtin]', function(){ G.inTrang('Phác đồ ma trận'); });
})();
