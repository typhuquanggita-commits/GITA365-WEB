/* ═══════════════════════════════════════════════════════════════
   GITA 365 · v7.4 — XƯƠNG SỐNG PHƯƠNG PHÁP · CHUẨN HỒ SƠ VIP ·
   CHIẾN LƯỢC CHUYỂN ĐỔI · TRỢ LÝ CHĂM SÓC · SINH TRẮC VÂN TAY
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;
G.VIEWS = G.VIEWS || {};
(function(){
var U = G.U, h = U.h, ic = U.ic;
function tc(t){ var x=(G.TIERS||[]).filter(function(y){return y.code===t;})[0]; return x ? x.c : 'var(--gita)'; }

/* ═══════════════ XƯƠNG SỐNG PHƯƠNG PHÁP ═══════════════ */
G.VIEWS['phuong-phap'] = function(){
  /* Kho nghề, không phải công cụ Coach: Tư vấn phải đọc được xương sống
     phương pháp thì mới nói đúng với gia đình ở buổi mở cửa. Trước đây khoá
     ở pro_coach nên Tư vấn thấy mục này trong trình đơn mà bấm vào chỉ ra
     một thẻ khoá — một mục chết. */
  if(!G.can('nghe_chung')) return U.lockCard();
  var X = G.XUONG_SONG, P = G.PHUONGPHAP, S = G.SACH_THAMKHAO, V = G.NGUON_VAITRO;
  if(!X) return U.empty('Chưa mở được phần phương pháp','Phần này nằm trong kho nghề.');

  var o = U.ph({eyebrow:'NHÓM 03 · KHO BÁU VẬT', ic:'brain', grad:1, t:'Xương sống phương pháp',
    lead:X.tuyenBo});

  o += '<div class="grid g2 mb">'+X.tru.map(function(t){
    return '<div class="card" style="border-color:'+t.c+'44;background:'+t.c+'0a">'+
      '<div class="row wrap mb" style="gap:8px">'+U.chip(t.ma,t.c)+
      '<b style="color:'+t.c+';font-size:16px">'+h(t.ten)+'</b></div>'+
      '<div class="tiny up mb" style="color:'+t.c+'">GỐC</div>'+
      '<p class="sm" style="margin-bottom:9px"><b>'+h(t.goc)+'</b></p>'+
      '<p class="sm dim" style="line-height:1.7;margin-bottom:10px">'+h(t.mo)+'</p>'+
      '<div class="row wrap" style="gap:5px">'+t.quan.map(function(m){
        return '<span class="chip" style="font-size:10.5px;color:'+t.c+';border-color:'+t.c+'33">'+h(m)+'</span>';
      }).join('')+'</div></div>';
  }).join('')+'</div>';

  if(V){
    o += U.sec('PHÂN VAI CÁC NGUỒN','Ba loại nguồn, ba vai khác nhau. Lẫn vai là hỏng hệ thống.');
    o += V.map(function(x){
      return '<div class="card mb" style="border-color:'+x.c+'33">'+
        '<div class="row wrap mb" style="gap:8px">'+U.chip(x.ma,x.c)+
        '<b style="color:'+x.c+'">'+h(x.ten)+'</b></div>'+
        '<p class="tiny muted mb">'+h(x.gom)+'</p>'+
        '<p class="sm" style="line-height:1.7;margin-bottom:8px"><b>'+h(x.vai)+'</b></p>'+
        '<div class="grid g2" style="gap:10px">'+
        '<div class="card pad-sm"><div class="tiny up muted mb">DÙNG ĐỂ</div><p class="tiny">'+h(x.dung)+'</p></div>'+
        '<div class="card pad-sm" style="border-color:rgba(248,113,113,.28)"><div class="tiny up mb" style="color:#BE0E16">KHÔNG DÙNG</div><p class="tiny">'+h(x.khong)+'</p></div>'+
        '</div></div>';
    }).join('');
  }

  o += U.sec('SÁU NHỊP LẬP TRÌNH NGÔN NGỮ','Khung ngôn từ đi xuyên mọi cuộc trò chuyện của GITA. Đảo thứ tự là mất người.');
  o += '<div class="grid g3">'+X.sauNhip.map(function(n,i){
    return '<div class="card pad-sm" style="border-color:rgba(139,92,246,.28)">'+
      '<div class="row wrap mb" style="gap:7px">'+U.chip(n.ma,'#5140B4')+
      '<span class="tiny muted">'+h(n.tam)+'</span></div>'+
      '<b class="sm" style="display:block;margin-bottom:6px">'+h(n.ten)+'</b>'+
      '<p class="tiny dim" style="line-height:1.6">'+h(n.ky)+'</p></div>';
  }).join('')+'</div>';

  o += U.sec('LUẬT NGÔN NGỮ','Áp cho cả người và cho trợ lý.');
  o += '<div class="card">'+U.list(X.luatNgonNgu,'#5140B4')+'</div>';

  if(P){
    o += U.sec('GÁN PHƯƠNG PHÁP THEO NHÓM × TẦNG', P.cot);
    o += '<div class="card mb" style="border-color:var(--gita-vien-1)"><p class="sm dim" style="line-height:1.7">'+h(P.xuongSong||'')+'</p></div>';
    o += P.nhom.map(function(n){
      return '<div class="card mb" style="border-color:'+n.c+'2a">'+
        '<div class="row wrap mb" style="gap:8px">'+U.chip(n.ma,n.c)+
        '<b style="color:'+n.c+';font-size:16px">'+h(n.ten)+'</b></div>'+
        '<p class="tiny muted mb">'+h(n.doc)+'</p>'+
        '<div class="card pad-sm mb" style="border-color:'+n.c+'33"><div class="tiny up mb" style="color:'+n.c+'">NGUYÊN TẮC</div>'+
        '<p class="sm">'+h(n.nguyenTac)+'</p></div>'+
        U.tbl(['Tầng','Mô thức GITA','Nhịp','Việc','Đo bằng'], n.tang.map(function(t){
          return ['<b class="sm" style="color:'+tc(t.t)+'">'+h(t.t)+'</b>',
                  '<span class="tiny" style="color:var(--gold-ink)"><b>'+h(t.mt||'')+'</b></span>',
                  '<span class="tiny" style="color:#5140B4">'+h(t.nhip||'')+'</span>',
                  '<span class="tiny">'+h(t.viec)+'</span>',
                  '<span class="tiny muted">'+h(t.do)+'</span>'];
        }))+'</div>';
    }).join('');
    o += '<div class="card mt" style="border-color:rgba(251,146,60,.3)">'+
      '<div class="tiny up mb" style="color:var(--alert)">LUẬT GÁN</div>'+U.list(P.luat,'var(--alert)')+'</div>';
  }

  if(S){
    o += U.sec('SÁCH THAM KHẢO BỔ TRỢ','Không phải phương pháp của GITA. Là tài nguyên để Tư vấn và Coach biên soạn tài liệu mới cho khách hàng.');
    o += S.map(function(b){
      return '<div class="card mb" style="border-color:'+b.c+'22">'+
        '<div class="row wrap mb" style="gap:8px">'+U.chip(b.vaiTro||'THAM KHẢO', b.c)+
        '<b style="color:'+b.c+'">'+h(b.ten)+'</b>'+
        '<span class="tiny muted">'+h(b.tacGia)+'</span></div>'+
        (b.boTroCho ? '<p class="tiny mb" style="color:var(--gold-ink)">Bổ trợ cho: '+h(b.boTroCho)+'</p>' : '')+
        '<p class="sm dim" style="line-height:1.7;margin-bottom:9px">'+h(b.khung)+'</p>'+
        '<div class="grid g2" style="gap:10px">'+
        '<div><div class="tiny up mb" style="color:'+b.c+'">NỘI DUNG LẤY ĐƯỢC</div>'+
        U.list(b.muc.map(function(m){return m.no+'. '+m.t+' — '+m.y;}), b.c)+'</div>'+
        '<div><div class="tiny up mb" style="color:#0B7350">BIÊN SOẠN RA ĐƯỢC</div>'+
        U.list(b.bienSoan||[], '#0B7350')+'</div></div>'+
        (b.themVao ? '<p class="tiny muted mt" style="line-height:1.6">'+h(b.themVao)+'</p>' : '')+
        '<div class="card pad-sm mt" style="border-color:var(--gita-mo-3)">'+
        '<div class="tiny up mb" style="color:var(--gold-ink)">GITA DÙNG THẾ NÀO</div>'+
        '<p class="tiny">'+h(b.gitaDung)+'</p></div></div>';
    }).join('');
    o += '<div class="card mt2" style="border-color:rgba(248,113,113,.3)">'+
      '<div class="tiny up mb" style="color:#BE0E16">LUẬT DÙNG SÁCH THAM KHẢO</div>'+
      U.list(X.luatThamKhao,'#BE0E16')+'</div>';
  }
  return o;
};

/* ═══════════════ CHUẨN HỒ SƠ VIP & VVIP ═══════════════ */
G.VIEWS['hoso-vip'] = function(){
  if(!G.can('pro_consult')) return U.lockCard();
  var H = G.HOSO_VIP;
  if(!H) return U.empty('Chưa mở được chuẩn hồ sơ','Phần này nằm trong kho nghề.');

  var o = U.ph({eyebrow:'NHÓM 05 · QUẢN TRỊ', ic:'book', grad:1, t:'Chuẩn hồ sơ VIP và VVIP',
    lead:H.cot});

  o += '<div class="card mb" style="border-color:rgba(248,113,113,.35);background:rgba(248,113,113,.05)">'+
    '<div class="row mb" style="gap:8px"><span style="color:#BE0E16">'+ic('shield','w-4 h-4')+'</span>'+
    '<b style="color:#BE0E16">'+h(H.ranhGioi.tieu)+'</b></div>'+
    U.tbl(['KHÔNG ghi vào hồ sơ','Vì sao'], H.ranhGioi.khongGhi.map(function(x){
      return ['<b class="sm">'+h(x.muc)+'</b>','<span class="tiny">'+h(x.vi)+'</span>'];
    }))+
    '<div class="mt">'+U.list(H.ranhGioi.luat,'#BE0E16')+'</div></div>';

  o += U.sec('BẢY PHẦN CỦA HỒ SƠ','Đối chiếu với mẫu hồ sơ khách hàng lớn trong sách Cây Tiền, đã lọc lại cho ngành giáo dục.');
  o += H.phan.map(function(p){
    return '<div class="card mb" style="border-color:'+p.c+'2a">'+
      '<div class="row wrap mb" style="gap:8px">'+U.chip('PHẦN '+p.no,p.c)+
      '<b style="color:'+p.c+';font-size:16px">'+h(p.ten)+'</b>'+
      '<span class="tiny muted">'+h(p.sach)+'</span></div>'+
      U.tbl(['Trường','','Ghi gì'], p.truong.map(function(t){
        return ['<b class="sm">'+h(t.t)+'</b>',
                t.bb ? '<span class="chip" style="color:'+p.c+';border-color:'+p.c+'44">bắt buộc</span>' : '<span class="tiny muted">tuỳ</span>',
                '<span class="tiny">'+h(t.mo)+'</span>'];
      }))+'</div>';
  }).join('');

  o += U.sec('MỨC ĐẦY HỒ SƠ THEO HẠNG','Hạng càng cao thì hồ sơ càng phải đầy — và càng sớm.');
  o += U.tbl(['Hạng','Cần có','Mức đầy','Hạn'], H.mucDay.map(function(m){
    return ['<b class="sm" style="color:'+m.c+'">'+h(m.hang)+'</b>',
            '<span class="tiny">'+h(m.can)+'</span>',
            '<b class="tiny">'+h(m.do)+'</b>',
            '<span class="tiny muted">'+h(m.khi)+'</span>'];
  }));

  o += U.sec('BA MƯƠI GIÂY','Sách nói mọi thông tin của một khách hàng phải tra ra được trong ba mươi giây. Đây là sáu câu phải trả lời được.');
  o += '<div class="card" style="border-color:var(--gita-vien-1)">'+
    U.list(H.baMuoiGiay.map(function(c,i){return (i+1)+'. '+c;}),'var(--gita)')+
    '<p class="sm dim mt" style="line-height:1.7">'+h(H.luatBaMuoiGiay)+'</p></div>';
  return o;
};

/* ═══════════════ CHIẾN LƯỢC CHUYỂN ĐỔI ═══════════════ */
G.VIEWS['chuyen-doi'] = function(){
  /* Kho tra cứu của nghề, không phải công cụ thao tác với gia đình.
     Bảng PERM đã nói rõ: nghe_chung mở cho R01–R12 — "toàn bộ kho nghề".
     Khoá ở pro_coach hoặc pro_consult thì Chuyên gia đánh giá, Chuyên gia
     tư vấn và Phân tích dữ liệu thấy mục này trong trình đơn mà bấm vào
     chỉ nhận được một thẻ khoá — đúng loại mục chết anh Quang đã bảo dẹp.
     Quyền THAO TÁC (buồng lái Coach, cổng nghiệm thu, xuất dữ liệu) vẫn
     giữ nguyên ở pro_coach và pro_approve. */
  if(!G.can('nghe_chung')) return U.lockCard();
  var C = G.CHUYENDOI;
  if(!C) return U.empty('Chưa mở được chiến lược chuyển đổi','Phần này nằm trong kho nghề.');

  var o = U.ph({eyebrow:'NHÓM 04 · MỞ CỬA', ic:'compass', grad:1, t:'Chín cổng chuyển đổi',
    lead:C.cot});

  o += '<div class="card mb" style="border-color:var(--gita-vien-1)">'+
    '<div class="tiny up mb" style="color:var(--gold-ink)">LUẬT CHUNG</div>'+U.list(C.luatChung,'var(--gita)')+'</div>';

  o += C.cong.map(function(x){
    return '<div class="card mb" style="border-color:'+x.c+'2a">'+
      '<div class="row wrap" style="gap:8px;justify-content:space-between;margin-bottom:10px">'+
      '<div class="row wrap" style="gap:8px">'+U.chip(x.ma,x.c)+
      '<b style="color:'+x.c+';font-size:16px">'+h(x.ten)+'</b></div>'+
      '<span class="tiny" style="color:'+x.c+'">'+h(x.ty)+'</span></div>'+
      U.ba(x.tu, x.den, 'TỪ', 'ĐẾN')+
      '<div class="grid g2 mt" style="gap:10px">'+
      '<div class="card pad-sm"><div class="tiny up muted mb">TÍN HIỆU MỞ CỔNG</div><p class="tiny">'+h(x.tinHieu)+'</p></div>'+
      '<div class="card pad-sm"><div class="tiny up muted mb">AI LÀM</div><p class="tiny">'+h(x.ai)+'</p></div>'+
      '</div>'+
      '<div class="card pad-sm mt" style="border-color:'+x.c+'33"><div class="tiny up mb" style="color:'+x.c+'">ĐƯA RA CÁI GÌ</div>'+
      '<p class="sm">'+h(x.dua)+'</p></div>'+
      '<div class="tiny up mt mb" style="color:'+x.c+'">VIỆC PHẢI LÀM</div>'+U.list(x.lam,x.c)+
      '<div class="card pad-sm mt" style="border-color:rgba(248,113,113,.3)">'+
      '<div class="tiny up mb" style="color:#BE0E16">CẤM</div><p class="tiny">'+h(x.cam)+'</p></div></div>';
  }).join('');

  o += U.sec('BA VÒNG GIỮ CHÂN','Sách nói sự vô tâm mới đuổi khách đi, không phải chuẩn thấp.');
  o += '<div class="grid g3">'+C.giuChan.map(function(g){
    return '<div class="card pad-sm" style="border-color:'+g.c+'44">'+
      '<div class="row wrap mb" style="gap:7px">'+U.chip(g.muc,g.c)+
      '<span class="tiny muted">trong '+h(g.trong)+'</span></div>'+
      '<div class="tiny up mb" style="color:'+g.c+'">DẤU HIỆU</div>'+
      '<p class="tiny dim mb" style="line-height:1.6">'+h(g.dau)+'</p>'+
      '<div class="tiny up mb" style="color:'+g.c+'">LÀM GÌ</div>'+
      '<p class="tiny dim" style="line-height:1.6;margin-bottom:7px">'+h(g.lam)+'</p>'+
      '<div class="tiny" style="color:var(--ink-4)">'+ic('users','w-3 h-3')+' '+h(g.ai)+'</div></div>';
  }).join('')+'</div>';

  o += U.sec('ĐO CHUYỂN ĐỔI','Cổng nào tụt thì sửa cổng đó, không trách người.');
  o += U.tbl(['Mã','Chỉ số','Cách tính','Dùng để'], C.doChuyenDoi.map(function(d){
    return [U.chip(d.ma,'#0B6675'),'<b class="sm">'+h(d.ten)+'</b>',
            '<span class="tiny">'+h(d.cach)+'</span>','<span class="tiny muted">'+h(d.dung)+'</span>'];
  }));
  return o;
};

/* ═══════════════ TRỢ LÝ CHĂM SÓC TỰ ĐỘNG ═══════════════ */
G.VIEWS['ai-cham'] = function(){
  /* Chính sách và số liệu tổng hợp, không phải hồ sơ của một nhà cụ thể.
     Phân tích dữ liệu (R12) phải đọc được thì mới phân tích được — mà bảng
     PERM vốn đã xếp R12 trong nghe_chung. Khoá ở pro_consult chỉ tạo ra một
     mục chết trong trình đơn của họ. */
  if(!G.can('nghe_chung')) return U.lockCard();
  var A = G.AICHAM;
  if(!A) return U.empty('Chưa mở được đặc tả trợ lý','Phần này nằm trong kho nghề.');

  var o = U.ph({eyebrow:'NHÓM 05 · QUẢN TRỊ', ic:'spark', grad:1, t:'Trợ lý chăm sóc tự động',
    lead:A.cot});

  o += '<div class="grid g3 mb">'+A.nguyenTac.map(function(n){
    return '<div class="card pad-sm" style="border-color:var(--gita-mo-3)">'+
      '<div class="row mb" style="gap:8px">'+U.chip(String(n.no),'var(--gita)')+
      '<b class="sm">'+h(n.t)+'</b></div>'+
      '<p class="tiny dim" style="line-height:1.6">'+h(n.y)+'</p></div>';
  }).join('')+'</div>';

  o += U.sec('MƯỜI SÁU LUẬT CHẠY NỀN','Mỗi luật đọc được bằng máy: điều kiện → việc làm → cho ai → hạn nào.');
  o += U.tbl(['Mã','Luật','Khi nào bật','Làm gì','Cho ai · hạn','Hạng'], A.luat.map(function(l){
    return [U.chip(l.ma,l.c),'<b class="sm" style="color:'+l.c+'">'+h(l.ten)+'</b>',
            '<span class="tiny mono">'+h(l.khi)+'</span>',
            '<span class="tiny">'+h(l.lam)+'</span>',
            '<span class="tiny muted">'+h(l.cho)+'<br>'+h(l.han)+'</span>',
            '<span class="tiny">'+h(l.hang)+'</span>'];
  }));

  o += '<div class="grid g2 mt2">'+
    '<div class="card" style="border-color:rgba(16,185,129,.3)"><div class="up mb" style="color:#0B7350">TRỢ LÝ ĐƯỢC LÀM</div>'+
    U.list(A.duocLam,'#0B7350')+'</div>'+
    '<div class="card" style="border-color:rgba(248,113,113,.3)"><div class="up mb" style="color:#BE0E16">TUYỆT ĐỐI KHÔNG</div>'+
    U.list(A.khongDuocLam,'#BE0E16')+'</div></div>';

  o += U.sec('VÌ SAO CHẠY ĐƯỢC TRONG 500.000Đ/THÁNG', A.chiPhi.cot);
  o += U.tbl(['Loại việc','Chạy ở đâu','Chi phí'], A.chiPhi.tach.map(function(t){
    return ['<b class="sm">'+h(t.loai)+'</b>','<span class="tiny">'+h(t.chay)+'</span>',
            '<b class="tiny" style="color:#0B7350">'+h(t.gia)+'</b>'];
  }));
  o += '<div class="card mt" style="border-color:var(--gita-vien-1)"><p class="sm dim" style="line-height:1.75">'+h(A.chiPhi.chan)+'</p></div>';
  return o;
};

/* ═══════════════ SINH TRẮC HỌC VÂN TAY ═══════════════ */
G.VIEWS['van-tay'] = function(){
  /* Kho tra cứu của nghề, không phải công cụ thao tác với gia đình.
     Bảng PERM đã nói rõ: nghe_chung mở cho R01–R12 — "toàn bộ kho nghề".
     Khoá ở pro_coach hoặc pro_consult thì Chuyên gia đánh giá, Chuyên gia
     tư vấn và Phân tích dữ liệu thấy mục này trong trình đơn mà bấm vào
     chỉ nhận được một thẻ khoá — đúng loại mục chết anh Quang đã bảo dẹp.
     Quyền THAO TÁC (buồng lái Coach, cổng nghiệm thu, xuất dữ liệu) vẫn
     giữ nguyên ở pro_coach và pro_approve. */
  if(!G.can('nghe_chung')) return U.lockCard();
  var V = G.VANTAY;
  if(!V) return U.empty('Chưa mở được phần này','Phần này nằm trong kho nghề.');

  var o = U.ph({eyebrow:'NHÓM 03 · KHO BÁU VẬT', ic:'shield', grad:1, t:'Sinh trắc học vân tay',
    lead:'Câu hỏi này đến từ phụ huynh gần như mỗi tuần. Đây là câu trả lời thống nhất của GITA.'});

  o += '<div class="card mb" style="border-color:rgba(248,113,113,.4);background:rgba(248,113,113,.06)">'+
    '<div class="row mb" style="gap:8px"><span style="color:#BE0E16">'+ic('x','w-5 h-5')+'</span>'+
    '<b style="color:#BE0E16;font-size:16px">Kết luận</b></div>'+
    '<p class="sm" style="line-height:1.8"><b>'+h(V.ketLuan)+'</b></p></div>';

  o += U.sec('VÌ SAO','Năm lý do, xếp theo mức quan trọng.');
  o += '<div class="card">'+U.list(V.viSao,'#BE0E16')+'</div>';

  o += U.sec(V.thayVao.tieu, V.thayVao.y);
  o += U.tbl(['Mặt so sánh','Sinh trắc vân tay','Bộ test nhận diện GITA'], V.thayVao.doSanh.map(function(d){
    return ['<b class="sm">'+h(d.mat)+'</b>',
            '<span class="tiny" style="color:#BE0E16">'+h(d.vt)+'</span>',
            '<span class="tiny" style="color:#0B7350">'+h(d.gita)+'</span>'];
  }));

  o += U.sec(V.neuKhachHoi.tieu,'Không tranh luận đúng sai ngay buổi đầu — làm thế là mất gia đình.');
  o += '<div class="card">'+U.list(V.neuKhachHoi.cach,'#0B6675')+'</div>';

  o += '<div class="card mt2" style="border-color:rgba(248,113,113,.35)">'+
    '<div class="tiny up mb" style="color:#BE0E16">LUẬT CỨNG</div>'+U.list(V.luatCung,'#BE0E16')+'</div>';
  return o;
};
})();
