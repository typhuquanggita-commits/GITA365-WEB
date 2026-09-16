/* ═══════════════════════════════════════════════════════════════
   GITA 365 — HAI MÀN HÌNH CÒN THIẾU

   1. tham-gia  — đường vào sáu bước, từ nghe giới thiệu tới vào
                  thử thách bảy ngày. Mở cho mọi vai kể cả người mới.
   2. hoc-phi   — năm tầng học phí, bảy luật nói chuyện tiền, mười
                  tám kịch bản, và quy trình thu. Chỉ đội ngũ thấy.

   Vì sao hai màn này ở chung một tệp: chúng là hai nửa của cùng một
   việc. Đường vào dẫn gia đình tới chỗ phải quyết định, màn học phí
   dạy người tư vấn nói chuyện tiền ở đúng chỗ đó. Sửa một bên mà
   không nhìn bên kia là sinh lệch.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;
G.VIEWS = G.VIEWS || {};
(function(){
var U = G.U, h = U.h, ic = U.ic;

/* Bảng giá chỉ hiện khi chủ Học viện đã điền. Chưa điền thì màn nói
   thẳng là chưa điền, chứ không hiện một bảng có ô trống — người tư
   vấn nhìn bảng trống rất dễ tự nghĩ ra một con số. */
/* Còn bao nhiêu kịch bản TƯ VẤN chưa có ruột. Phải về 0 trước khi coi
   kho 1.000 kịch bản là đủ. Hàm ở src vì kho đóng gói bằng JSON. */
G.tvConNo = function(){
  return (G.KICHBAN || []).filter(function(k){
    return k.loai === 'TƯ VẤN' &&
      (k.mo == null || k.chot == null || k.muc == null || k.phut == null);
  }).length;
};

G.hpDaCoGia = function(){
  var a = G.HP_TANG || [];
  for(var i=0;i<a.length;i++) if(a[i].gia === null || a[i].gia === undefined) return false;
  return a.length > 0;
};

function the(nhan, noiDung, mau){
  return '<div class="card pad-sm"'+(mau?' style="border-color:'+mau+'33"':'')+'>'+
    '<div class="tiny up muted mb">'+h(nhan)+'</div><p class="tiny" style="line-height:1.6">'+h(noiDung)+'</p></div>';
}

/* ═══════════════ ĐƯỜNG VÀO SÁU BƯỚC ═══════════════ */
G.VIEWS['tham-gia'] = function(){
  var B = G.DV_BUOC;
  if(!B) return U.empty('Chưa mở được đường vào','Phần này nằm trong gói nền. Đăng nhập lại để nạp.');

  var o = U.ph({eyebrow:'NHÓM 01 · KHỞI NGUỒN', ic:'compass', grad:1,
    t:'Đường vào — từ nghe giới thiệu tới bảy ngày đầu tiên',
    lead:'Sáu bước, đi theo thứ tự, không nhảy cóc. Mỗi bước có điều kiện đi tiếp riêng — không phải để làm khó, mà vì bỏ qua một bước thì bước sau chạy trên nền sai.'});

  /* Dải sáu bước, bấm được sang màn thật.
     Bước 2 không phải một màn hình mà là hộp thoại đăng ký, mở bằng
     G.moDangKy(). Đánh dấu bằng tiền tố @ để nút gọi đúng hàm chứ
     không đi tìm một màn không tồn tại. */
  o += '<div class="grid g3 mb">' + B.map(function(b){
    var hopThoai = b.man.charAt(0) === '@';
    var moDuoc = hopThoai
      ? !!G.moDangKy
      : (G.VIEWS[b.man] && (!G.allowed || G.allowed(b.man)));
    return '<div class="card" style="border-color:'+b.c+'33">'+
      '<div class="row wrap mb" style="gap:8px">'+
      '<span style="width:34px;height:34px;border-radius:11px;display:grid;place-items:center;'+
      'font-weight:900;background:'+b.c+'22;color:'+b.c+'">'+b.so+'</span>'+
      '<div class="grow" style="min-width:150px"><b class="sm" style="display:block;line-height:1.4">'+h(b.ten)+'</b>'+
      '<span class="tiny muted">'+h(b.lau)+'</span></div></div>'+
      '<p class="tiny dim mb" style="line-height:1.6">'+h(b.duoc)+'</p>'+
      (moDuoc
        ? '<button class="btn ghost sm" '+(hopThoai
             ? 'data-act="mo-dang-ky"'
             : 'data-v="'+h(b.man)+'"')+'>'+h(b.nut)+'</button>'
        : '<span class="tiny muted">'+ic('lock','w-3 h-3')+' Mở khi tới bước này</span>')+
      '</div>';
  }).join('') + '</div>';

  /* Chi tiết từng bước */
  o += U.sec('TỪNG BƯỚC LÀM GÌ','Ai làm, mất bao lâu, xong thì có gì trong tay, và chưa xong thì bị chặn ở đâu.');
  o += B.map(function(b){
    return '<div class="card mb" style="border-color:'+b.c+'2e">'+
      '<div class="row wrap mb" style="gap:8px">'+U.chip(b.ma,b.c)+
      '<span style="color:'+b.c+'">'+ic(b.ic,'w-4 h-4')+'</span>'+
      '<b style="color:'+b.c+';font-size:16px">'+h(b.ten)+'</b>'+
      '<span class="tiny muted mono">'+h(b.lau)+'</span></div>'+
      '<div class="grid g2" style="gap:10px;margin-bottom:10px">'+
        the('AI LÀM', b.ai)+ the('LÀM GÌ', b.lam)+
        the('XONG BƯỚC NÀY KHI', b.xong, '#0B7350')+
        '<div class="card pad-sm" style="border-color:rgba(248,113,113,.3)">'+
        '<div class="tiny up mb" style="color:var(--bad)">CHẶN Ở ĐÂU</div><p class="tiny">'+h(b.chan)+'</p></div>'+
      '</div>'+
      '<div class="card pad-sm" style="border-color:'+b.c+'33;background:'+b.c+'0a">'+
      '<div class="tiny up mb" style="color:'+b.c+'">CÂU NGƯỜI TƯ VẤN NÓI ĐỂ DẪN SANG BƯỚC SAU</div>'+
      '<p class="sm" style="font-style:italic;line-height:1.7">'+h('“'+b.noi+'”')+'</p></div>'+
      '</div>';
  }).join('');

  o += U.sec('ĐIỀU KIỆN ĐI TIẾP','Không có chặn thì đường đi chỉ là một danh sách gợi ý.');
  o += U.tbl(['Từ → đến','Phải có gì','Vì sao chặn'], (G.DV_CHAN||[]).map(function(c){
    return ['<b class="sm mono">'+h(c.tu)+' → '+h(c.den)+'</b>',
      '<span class="tiny">'+h(c.dk)+'</span>',
      '<span class="tiny muted">'+h(c.vi)+'</span>'];
  }));

  o += U.sec('NGƯỜI MỚI HAY HỎI GÌ','Tám câu gặp nhiều nhất trên đường này.');
  o += '<div class="grid g2">' + (G.DV_HOI||[]).map(function(q){
    return '<div class="card pad-sm">'+
      '<b class="sm" style="display:block;margin-bottom:7px">'+h('“'+q.h+'”')+'</b>'+
      '<p class="tiny" style="line-height:1.65;font-style:italic;color:var(--ink-2)">'+h('→ '+q.d)+'</p></div>';
  }).join('') + '</div>';
  return o;
};

/* ═══════════════ HỌC PHÍ NĂM TẦNG ═══════════════ */
G.VIEWS['hoc-phi'] = function(){
  /* Kho nghề: kịch bản nói chuyện tiền là tài sản chuyên môn, và bảng
     nhịp thu là ngôn ngữ nội bộ. Gia đình xem bản mô tả chặng, không
     xem màn này. */
  if(!G.can('nghe_chung')) return U.lockCard();
  var T = G.HP_TANG;
  if(!T) return U.empty('Chưa mở được phần học phí','Phần này nằm trong kho nghề.');
  var coGia = G.hpDaCoGia();

  var o = U.ph({eyebrow:'NHÓM 05 · QUẢN TRỊ', ic:'crown', grad:1,
    t:'Học phí năm tầng và cách nói chuyện tiền',
    lead:'Năm tầng, mỗi tầng gồm gì và thu theo nhịp nào. Bảy luật nói chuyện tiền. Mười tám kịch bản dùng được ngay: khách hỏi giá quá sớm, khách kêu đắt, khách xin giảm, khách so giá, khách đòi cam kết kết quả, khách chậm đóng, khách xin dừng giữa chặng.'});

  /* Phạm vi đứng TRƯỚC mọi thứ khác: hệ đã có bốn tuyến, và một bảng giá
     không ghi phạm vi thì người tư vấn sẽ mở đúng bảng này ra báo giá cho
     tuyến khác. Đọc sai giá cho khách là chuyện không rút lại được. */
  var PV = G.HP_PHAM_VI;
  if(PV)
    o += '<div class="card mb" style="border-left:3px solid var(--gita)">'+
      '<div class="row" style="gap:9px;align-items:baseline;flex-wrap:wrap">'+
        '<span class="tiny up muted">CHỈ ÁP CHO</span>'+
        U.chip(PV.tuyen, 'var(--gita)')+
        '<b class="sm" style="flex:1;min-width:200px">'+h(PV.ten)+'</b></div>'+
      '<p class="sm mt" style="line-height:1.7">'+h(PV.y)+'</p></div>';

  /* Cảnh báo khi chưa điền giá — hiện ngay đầu màn, không giấu ở cuối */
  if(!coGia){
    o += '<div class="card mb" style="border-color:rgba(251,146,60,.45);background:rgba(251,146,60,.07)">'+
      '<div class="row mb" style="gap:9px"><span style="color:var(--alert)">'+ic('bell','w-4 h-4')+'</span>'+
      '<b style="color:var(--alert)">CHƯA CÓ MỨC HỌC PHÍ TRONG HỆ THỐNG</b></div>'+
      '<p class="sm" style="line-height:1.7">Trường <span class="mono">gia</span> của cả năm tầng đang để trống. Đây là chỗ trống có chủ đích: mức học phí là quyết định của chủ Học viện — phụ thuộc thị trường, chi phí đội ngũ và định vị — không ai điền hộ được.</p>'+
      '<p class="sm mt" style="line-height:1.7">Cho tới khi điền, màn này <b>không hiện bảng giá</b>. Người tư vấn nhìn một bảng có ô trống rất dễ tự nghĩ ra một con số, và con số tự nghĩ thì mỗi người một khác. Điền tại <span class="mono">kho-goc/data.hoc-phi.js</span> · <span class="mono">G.HP_TANG[].gia</span>.</p>'+
      '<p class="tiny muted mt">Mọi phần còn lại của màn này — gồm gì, nhịp thu, hoàn tiền, luật, kịch bản — đã đủ và dùng được ngay từ bây giờ.</p>'+
      '</div>';
  }

  o += U.sec('NĂM TẦNG — GỒM GÌ, KHÔNG GỒM GÌ, THU THẾ NÀO',
    'Cột "không gồm" quan trọng ngang cột "gồm". Khiếu nại về sau gần như luôn sinh ra ở chỗ khách tưởng có mà không có.');
  o += T.map(function(t){
    return '<div class="card mb" style="border-color:'+t.c+'2e">'+
      '<div class="row wrap mb" style="gap:8px">'+U.chip(t.tang,t.c)+
      '<b style="color:'+t.c+';font-size:16px">'+h(t.ten)+'</b>'+
      (coGia
        ? '<span class="mono" style="color:'+t.c+';font-weight:800">'+
            Number(t.gia).toLocaleString('vi-VN')+'</span><span class="tiny muted">'+h(t.donVi)+'</span>'
        : '<span class="tiny" style="color:var(--alert)">mức phí chưa điền · '+h(t.donVi)+'</span>')+
      '</div>'+
      '<div class="grid g2" style="gap:10px;margin-bottom:10px">'+
        '<div class="card pad-sm"><div class="tiny up mb" style="color:'+t.c+'">GỒM</div>'+U.list(t.gom,t.c)+'</div>'+
        '<div class="card pad-sm" style="border-color:rgba(248,113,113,.3)">'+
        '<div class="tiny up mb" style="color:var(--bad)">KHÔNG GỒM</div>'+U.list(t.khong,'#EF4444')+'</div>'+
      '</div>'+
      '<div class="grid g2" style="gap:10px">'+
        the('NHỊP THU', t.nhip)+ the('HOÀN TIỀN', t.hoan)+
      '</div></div>';
  }).join('');

  o += U.sec('BẢY LUẬT NÓI CHUYỆN TIỀN','Đây là luật, không phải khuyến nghị. Vi phạm xử theo quy chế làm việc.');
  o += '<div class="card mb" style="border-color:rgba(190,14,22,.3);background:rgba(190,14,22,.04)">'+
    (G.HP_LUAT||[]).map(function(l){
      return '<div style="display:flex;gap:10px;padding:9px 0;border-top:1px solid var(--line)">'+
        '<span style="flex:none;color:var(--bad);margin-top:2px">'+ic('shield','w-4 h-4')+'</span>'+
        '<div><b class="sm" style="display:block;margin-bottom:3px">'+l.no+'. '+h(l.ten)+'</b>'+
        '<span class="tiny muted" style="line-height:1.6">'+h(l.y)+'</span></div></div>';
    }).join('') + '</div>';

  o += U.sec('MƯỜI TÁM KỊCH BẢN NÓI CHUYỆN TIỀN',
    'Chia theo thời điểm: trước khi báo giá, lúc báo giá, sau khi báo giá, lúc thu. Nói ra được nguyên văn.');
  var khiTruoc = '';
  (G.HP_KICHBAN||[]).forEach(function(k){
    if(k.khi !== khiTruoc){
      khiTruoc = k.khi;
      o += '<div class="tiny up mb mt" style="color:var(--gold-ink);letter-spacing:.08em">'+h(k.khi.toUpperCase())+'</div>';
    }
    o += '<div class="card mb">'+
      '<div class="row wrap mb" style="gap:8px">'+U.chip(k.ma,'#5140B4')+
      '<b class="sm">'+h(k.ten)+'</b><span class="tiny muted mono">'+h(k.tang)+'</span></div>'+
      '<div style="padding:11px 14px;border-radius:12px;background:rgba(81,64,180,.06);border-left:2px solid rgba(81,64,180,.4);margin-bottom:8px">'+
      '<div class="tiny up muted mb">MỞ</div>'+
      '<p class="serif" style="font-size:14.5px;font-style:italic;line-height:1.7">'+h('“'+k.mo+'”')+'</p></div>'+
      '<div style="padding:11px 14px;border-radius:12px;background:rgba(11,115,80,.06);border-left:2px solid rgba(11,115,80,.4);margin-bottom:8px">'+
      '<div class="tiny up muted mb">CHỐT</div>'+
      '<p class="serif" style="font-size:14.5px;font-style:italic;line-height:1.7">'+h('“'+k.chot+'”')+'</p></div>'+
      '<div class="card pad-sm" style="border-color:rgba(248,113,113,.3)">'+
      '<div class="tiny up mb" style="color:var(--bad)">KHÔNG ĐƯỢC LÀM</div>'+U.list(k.khong,'#EF4444')+'</div>'+
      '</div>';
  });

  /* Quy trình thu — lấy thẳng từ G.THANHTOAN đã có sẵn trong kho */
  var TT = G.THANHTOAN;
  if(TT){
    o += U.sec('THU TIỀN VÀO ĐÂU, GHI NỘI DUNG THẾ NÀO',
      'Tiền vào phải khớp được một gia đình, một tầng, một kỳ. Sai mẫu là phải dò tay, và dò tay là chỗ sinh sai sót.');
    o += '<div class="grid g2 mb" style="gap:10px">'+
      '<div class="card pad-sm"><div class="tiny up muted mb">TÀI KHOẢN NHẬN</div>'+
      '<p class="sm"><b>'+h(TT.taiKhoan.chuTk)+'</b></p>'+
      '<p class="sm mono">'+h(TT.taiKhoan.soTk)+'</p>'+
      '<p class="tiny muted">'+h(TT.taiKhoan.nganHang)+'</p></div>'+
      '<div class="card pad-sm"><div class="tiny up muted mb">MẪU NỘI DUNG CHUYỂN KHOẢN</div>'+
      '<p class="sm mono">'+h(TT.noiDungCk.mau)+'</p>'+
      '<p class="tiny" style="color:var(--gold-ink)">Ví dụ: '+h(TT.noiDungCk.vd)+'</p>'+
      '<p class="tiny muted mt">'+h(TT.noiDungCk.vi)+'</p></div>'+
      '</div>';
    if(TT.taiKhoan.canQuetThu)
      o += '<div class="card mb" style="border-color:rgba(251,146,60,.35)">'+
        '<div class="tiny up mb" style="color:var(--alert)">TRƯỚC KHI ĐƯA MÃ QR CHO KHÁCH</div>'+
        '<p class="tiny">'+h(TT.taiKhoan.canQuetThu)+'</p></div>';
  }

  o += U.sec('SOÁT TRƯỚC KHI ĐƯA BẢNG GIÁ RA NGOÀI','Sáu việc. Thiếu một việc thì chưa đưa.');
  o += '<div class="card">'+U.list(G.HP_SOAT||[], coGia ? '#0B7350' : '#FB923C')+'</div>';
  return o;
};
})();
