/* ═══════════════════════════════════════════════════════════════
   GITA 365 — BA MÀN HÌNH ĐƯỢC LÀM ĐẦY

   Không thêm mục mới vào trình đơn. Ba màn hình đã có được nối dài
   thêm phần còn thiếu, để người dùng không phải đi tìm ở chỗ khác:

     referral      + 30 giây · GAINS · buổi 1–1 · thang chấm 100 điểm
                     · 7 trạng thái Ref · bàn giao · cảm ơn · 10 điều
                     cấm · 12 câu khó · 4 chỉ số · 10 lỗi hay gặp
     chan-dung-kh  + bộ làm việc đầy đủ cho từng chân dung: ba buổi
                     đầu, năm câu chối, tài liệu gửi theo mốc, nhóm
                     vấn đề hay gặp nối vào ma trận, băng thường vào,
                     KPI 30 và 90 ngày, ba lý do rơi, đường lên tầng,
                     điều cấm, ai cầm, và khung nói chuyện tiền
     sach          + sáu kệ tư liệu · sáu lộ trình đọc theo vai
                     · bảy luật giữ kho · trích dẫn · phiên bản

   Cách nối: bọc hàm cũ lại. Hàm cũ trả về thẻ khoá thì giữ nguyên
   thẻ khoá, không nối gì thêm — nếu không thì phần nối sẽ lọt qua
   cổng phân quyền.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;
G.VIEWS = G.VIEWS || {};
(function(){
var U = G.U, h = U.h, ic = U.ic;

/* Thẻ khoá dựng bởi U.lockCard bắt đầu bằng đúng mẫu này. Dùng để
   biết hàm cũ đã chặn rồi thì thôi không nối. Cùng cách nhận biết
   với tools/di-bo-lien-ket.js. */
function biKhoa(html){
  return typeof html !== 'string' ||
    html.trim().indexOf('<div class="card center" style="padding:40px">') === 0;
}

/* ─── BỌC LẠI KHI MÃ VỀ MUỘN ───
   Từ bản 9.23, mã dựng màn của nghề nằm ở gói riêng và về SAU tệp này.
   Lớp bọc chạy một lần lúc tải trang thì màn nghề không bao giờ được
   bọc — và hụt kiểu ấy không ném lỗi nào, chỉ là màn ấy thiếu một dải
   hoặc một thẻ mà không ai để ý.

   Nên noi() nhớ lại việc nó CHƯA làm được, và người nạp mã nghề gọi
   lại. Nhớ việc chưa làm rẻ hơn nhiều so với bắt mọi lớp bọc phải biết
   thứ tự nạp của cả ứng dụng. */
var CHO_BOC = [];
function noi(ten, them){
  var cu = G.VIEWS[ten];
  if(typeof cu !== 'function'){ CHO_BOC.push([ten, them]); return; }
  G.VIEWS[ten] = function(){
    var o = cu.apply(this, arguments);
    if(biKhoa(o)) return o;
    try { return o + them(); } catch(e){ return o; }
  };
}
function the(nhan, noiDung, mau){
  return '<div class="card pad-sm"'+(mau?' style="border-color:'+mau+'33"':'')+'>'+
    '<div class="tiny up muted mb">'+h(nhan)+'</div><p class="tiny" style="line-height:1.6">'+h(noiDung)+'</p></div>';
}

/* ═══════════════ 1 · PHIẾU CHỈ DẪN REFERRAL, PHẦN CÒN LẠI ═══════════════ */
noi('referral', function(){
  if(!G.REF_30S) return '';
  var o = '';

  o += U.sec('BA MƯƠI GIÂY — BA BẢN','Một bản không dùng được cho ba hoàn cảnh. Học thuộc bản hợp với chỗ mình hay đứng.');
  o += G.REF_30S.map(function(x){
    return '<div class="card mb">'+
      '<div class="row wrap mb" style="gap:8px">'+U.chip(x.ma,'#185AB4')+'<b>'+h(x.ten)+'</b>'+
      (x.giay?'<span class="tiny muted">'+x.giay+' giây</span>':'<span class="tiny muted">gửi bằng chữ</span>')+'</div>'+
      '<p class="tiny muted mb">'+h(x.khi)+'</p>'+
      '<div style="padding:12px 14px;border-radius:12px;background:rgba(24,90,180,.06);border-left:2px solid rgba(24,90,180,.4)">'+
      '<p class="serif" style="font-size:14.5px;font-style:italic;line-height:1.7">'+h('“'+x.loi+'”')+'</p></div>'+
      '<div class="grid g2 mt" style="gap:10px">'+
      the('CÂU CHỐT', x.chot)+
      '<div class="card pad-sm" style="border-color:rgba(248,113,113,.3)"><div class="tiny up mb" style="color:var(--bad)">LÀM HỎNG BẰNG CÁCH</div><p class="tiny">'+h(x.hong)+'</p></div>'+
      '</div></div>';
  }).join('');

  o += U.sec('BẢNG GAINS CỦA GITA','Điền sẵn. Người giới thiệu đọc là dùng được, không phải tự nghĩ.');
  o += U.tbl(['Ô','Nội dung'], G.REF_GAINS_GITA.map(function(g){
    return ['<b class="sm">'+h(g.o)+'</b>', '<span class="tiny">'+h(g.v)+'</span>'];
  }));

  o += U.sec('BUỔI 1–1 · TÁM MƯƠI PHÚT, SÁU CHẶNG','Đi theo thứ tự. Chặng sáu là chặng hay bị bỏ nhất và là chặng quyết định có lần sau hay không.');
  o += G.REF_121.map(function(b){
    return '<div class="card mb">'+
      '<div class="row wrap mb" style="gap:9px">'+
      '<span style="width:32px;height:32px;border-radius:10px;display:grid;place-items:center;font-weight:900;background:rgba(11,102,117,.14);color:#0B6675">'+b.no+'</span>'+
      '<b>'+h(b.ten)+'</b><span class="tiny muted mono">phút '+h(b.phut)+'</span></div>'+
      '<div class="grid g3" style="gap:10px">'+
      the('LÀM GÌ', b.lam)+ the('ĐẦU RA', b.ra)+
      '<div class="card pad-sm" style="border-color:rgba(248,113,113,.3)"><div class="tiny up mb" style="color:var(--bad)">HỎNG Ở ĐÂU</div><p class="tiny">'+h(b.hong)+'</p></div>'+
      '</div></div>';
  }).join('');

  o += U.sec('CHẤM MỘT LỜI GIỚI THIỆU — THANG 100','Từ 70 điểm trở lên mới là Ref chất lượng. Dưới 45 thì không nhận vào hệ thống.');
  o += U.tbl(['Mã','Tiêu chí','Điểm','Cách chấm','Vì sao'], G.REF_CHAM.map(function(c){
    return [U.chip(c.ma,'#0B6675'), '<b class="sm">'+h(c.ten)+'</b>',
      '<b class="mono">'+c.diem+'</b>', '<span class="tiny">'+h(c.cach)+'</span>',
      '<span class="tiny muted">'+h(c.y)+'</span>'];
  }));
  o += '<div class="grid g4 mt">'+ G.REF_CHAM_MUC.map(function(m){
    return '<div class="card pad-sm" style="border-color:'+m.c+'44">'+
      '<div class="row mb" style="gap:7px">'+U.chip('≥ '+m.tu, m.c)+'<b class="sm" style="color:'+m.c+'">'+h(m.ten)+'</b></div>'+
      '<p class="tiny">'+h(m.lam)+'</p></div>';
  }).join('') +'</div>';

  o += U.sec('BẢY TRẠNG THÁI CỦA MỘT REF','Ref chết vì để lâu, không vì bị từ chối. Quá hạn là hệ thống báo, không chờ ai nhớ.');
  o += G.REF_TRANGTHAI.map(function(t){
    return '<div class="card mb" style="border-color:'+t.c+'33">'+
      '<div class="row wrap mb" style="gap:8px">'+U.chip(t.ma,t.c)+'<b style="color:'+t.c+'">'+h(t.ten)+'</b>'+
      '<span class="tiny muted mono">hạn tối đa: '+h(t.han)+'</span></div>'+
      '<div class="grid g2" style="gap:10px">'+ the('VIỆC PHẢI LÀM', t.viec)+
      '<div class="card pad-sm" style="border-color:rgba(251,146,60,.32)"><div class="tiny up mb" style="color:var(--alert)">QUÁ HẠN THÌ SAO</div><p class="tiny">'+h(t.qua)+'</p></div>'+
      '</div></div>';
  }).join('');

  o += U.sec('BÀN GIAO GIỮA NGƯỜI GIỚI THIỆU VÀ GITA','Bảy bước. Bước sáu là bước làm mất người giới thiệu nhiều nhất.');
  o += '<div class="card mb">' + G.REF_BANGIAO.map(function(b){
    return '<div style="display:flex;gap:10px;padding:9px 0;border-top:1px solid var(--line)">'+
      '<span style="flex:none;width:24px;height:24px;border-radius:8px;display:grid;place-items:center;font-weight:900;font-size:12.5px;background:rgba(11,115,80,.14);color:#0B7350">'+b.no+'</span>'+
      '<div><b class="sm" style="display:block;margin-bottom:3px">'+h(b.ten)+'</b>'+
      '<span class="tiny muted" style="line-height:1.6">'+h(b.y)+'</span></div></div>';
  }).join('') + '</div>';

  o += U.sec('CẢM ƠN VÀ GHI NHẬN','Trần hoa hồng 10%, không có ngoại lệ. Phần dưới đây là phần không phải tiền — và là phần người ta nhớ.');
  o += U.tbl(['Khi nào','Làm gì','Mức'], G.REF_CAMON.map(function(c){
    return ['<b class="sm">'+h(c.khi)+'</b>','<span class="tiny">'+h(c.lam)+'</span>',
      U.chip(c.muc, c.muc==='Bắt buộc' ? '#BE0E16' : '#0B7350')];
  }));

  o += U.sec('MƯỜI ĐIỀU NGƯỜI GIỚI THIỆU KHÔNG ĐƯỢC LÀM','Khi họ nói nhân danh GITA thì lời họ nói là lời của GITA.');
  o += '<div class="card mb" style="border-color:rgba(248,113,113,.3);background:rgba(248,113,113,.04)">'+
    G.REF_KHONG.map(function(k){
      return '<div style="display:flex;gap:9px;padding:7px 0"><span style="color:var(--bad);flex:none;margin-top:3px">'+ic('x','w-3 h-3')+'</span>'+
        '<span class="sm" style="line-height:1.6">'+h(k)+'</span></div>';
    }).join('') + '</div>';

  o += U.sec('MƯỜI HAI CÂU KHÓ','Trả lời ngắn, thật, và luôn kết bằng việc chuyển sang GITA.');
  o += '<div class="grid g2">' + G.REF_HOI.map(function(q){
    return '<div class="card pad-sm">'+
      '<b class="sm" style="display:block;margin-bottom:7px">'+h('“'+q.h+'”')+'</b>'+
      '<p class="tiny" style="line-height:1.65;font-style:italic;color:var(--ink-2)">'+h('→ '+q.d)+'</p></div>';
  }).join('') + '</div>';

  o += U.sec('ĐO NGƯỜI GIỚI THIỆU','Bốn chỉ số, chấm theo quý. Hai trong bốn chỉ số là chấm GITA chứ không chấm họ.');
  o += U.tbl(['Mã','Chỉ số','Đơn vị','Mức đạt','Vì sao đo'], G.REF_KPI.map(function(k){
    return [U.chip(k.ma,'#5140B4'),'<b class="sm">'+h(k.ten)+'</b>','<span class="tiny mono">'+h(k.dv)+'</span>',
      '<span class="tiny">'+h(k.dat)+'</span>','<span class="tiny muted">'+h(k.y)+'</span>'];
  }));

  o += U.sec('MƯỜI LỖI HAY GẶP NHẤT','Cột bên phải là cách sửa, không phải lời trách.');
  o += U.tbl(['Lỗi','Sửa thế nào'], G.REF_LOI.map(function(l){
    return ['<span class="tiny" style="color:var(--bad)">'+h(l.loi)+'</span>','<span class="tiny">'+h(l.sua)+'</span>'];
  }));
  return o;
});

/* ═══════════════ 2 · SÁU CHÂN DUNG, BỘ LÀM VIỆC ĐẦY ĐỦ ═══════════════ */
G.cdModal = function(ma){
  var x = null, i;
  for(i=0;i<(G.CD_BO||[]).length;i++) if(G.CD_BO[i].ma===ma) x = G.CD_BO[i];
  var g = null;
  for(i=0;i<(G.CHANDUNG_KH||[]).length;i++) if(G.CHANDUNG_KH[i].ma===ma) g = G.CHANDUNG_KH[i];
  if(!x) return;
  var c = (g && g.c) || '#0B6675';
  var ten = (g && g.ten) || ma;

  var html = '<div class="row wrap" style="gap:7px;margin-bottom:9px">'+U.chip(ma,c)+
      (g?U.chip(g.tang,'#185AB4'):'')+(g?U.chip(g.tyLe,'#64748B'):'')+'</div>'+
    '<h2 style="font-size:21px;font-weight:800;margin-bottom:12px">'+h(ten)+'</h2>'+
    '<div class="grid g2" style="gap:10px;margin-bottom:13px">'+
      the('AI TRONG ĐỘI NGŨ CẦM NHÀ NÀY', x.nguoi)+
      the('THƯỜNG VÀO Ở BĂNG NÀO', x.bang)+
    '</div>';

  html += '<div class="card mb"><div class="tiny up mb" style="color:'+c+'">BA BUỔI ĐẦU</div>'+
    x.ba.map(function(b){
      return '<div style="padding:11px 0;border-top:1px solid var(--line)">'+
        '<div class="row wrap mb" style="gap:8px">'+U.chip('Buổi '+b.buoi,c)+'<b class="sm">'+h(b.ten)+'</b>'+
        '<span class="tiny muted mono">'+b.phut+' phút</span></div>'+
        '<div class="grid g3" style="gap:9px">'+ the('MỤC ĐÍCH',b.muc)+the('LÀM GÌ',b.lam)+the('ĐẦU RA',b.ra)+'</div></div>';
    }).join('') + '</div>';

  html += '<div class="card mb"><div class="tiny up mb" style="color:'+c+'">NĂM CÂU CHỐI CỦA RIÊNG CHÂN DUNG NÀY</div>'+
    x.hoi.map(function(q){
      return '<div style="padding:9px 0;border-top:1px solid var(--line)">'+
        '<b class="sm" style="display:block;margin-bottom:5px">'+h('“'+q.h+'”')+'</b>'+
        '<p class="tiny" style="line-height:1.65;font-style:italic;color:var(--ink-2)">'+h('→ '+q.d)+'</p></div>';
    }).join('') + '</div>';

  html += '<div class="grid g2" style="gap:10px;margin-bottom:13px">'+
    '<div class="card pad-sm"><div class="tiny up muted mb">GỬI TÀI LIỆU THEO MỐC</div>'+
      x.gui.map(function(t){ return '<div class="tiny" style="padding:5px 0;border-top:1px solid var(--line)"><b>'+h(t.khi)+'</b> — '+h(t.gi)+'</div>'; }).join('')+'</div>'+
    '<div class="card pad-sm"><div class="tiny up muted mb">VẤN ĐỀ HAY GẶP TRONG MA TRẬN</div>'+
      '<div class="row wrap" style="gap:6px;margin-bottom:8px">'+x.vanDe.map(function(m){ return U.chip(m,'#0B6675'); }).join('')+'</div>'+
      '<p class="tiny muted">Nhóm chính: '+h(x.nhom.join(' · '))+'</p></div>'+
    '</div>';

  html += '<div class="grid g2" style="gap:10px;margin-bottom:13px">'+
    the('SAU 30 NGÀY THẾ NÀO LÀ ĐƯỢC', x.kpi30, '#0B7350')+
    the('SAU 90 NGÀY THẾ NÀO LÀ ĐƯỢC', x.kpi90, '#0B7350')+
    '</div>';

  html += '<div class="card mb" style="border-color:rgba(251,146,60,.32)">'+
    '<div class="tiny up mb" style="color:var(--alert)">BA LÝ DO NHÀ NÀY HAY BỎ GIỮA CHỪNG</div>'+
    x.roi.map(function(r){
      return '<div style="padding:9px 0;border-top:1px solid var(--line)">'+
        '<b class="sm" style="display:block;margin-bottom:4px">'+h(r.vi)+'</b>'+
        '<span class="tiny muted">Chặn trước: '+h(r.chan)+'</span></div>';
    }).join('') + '</div>';

  html += '<div class="grid g3" style="gap:10px">'+
    the('ĐƯỜNG LÊN TẦNG', x.len)+
    '<div class="card pad-sm" style="border-color:rgba(248,113,113,.3)"><div class="tiny up mb" style="color:var(--bad)">TUYỆT ĐỐI KHÔNG LÀM</div><p class="tiny">'+h(x.cam)+'</p></div>'+
    the('NÓI CHUYỆN TIỀN THEO KHUNG NÀO', x.tien)+
    '</div>';
  U.modal(html);
};

noi('chan-dung-kh', function(){
  if(!G.CD_BO) return '';
  var o = U.sec('BỘ LÀM VIỆC ĐẦY ĐỦ CỦA TỪNG CHÂN DUNG',
    'Bấm vào một chân dung để mở: ba buổi đầu, năm câu chối, tài liệu gửi theo mốc, vấn đề hay gặp trong ma trận, KPI 30 và 90 ngày, ba lý do rơi, đường lên tầng, điều cấm, và khung nói chuyện tiền.');
  o += '<div class="grid g3">' + G.CD_BO.map(function(x){
    var g = (G.CHANDUNG_KH||[]).filter(function(y){return y.ma===x.ma;})[0] || {};
    var c = g.c || '#0B6675';
    return '<button class="card lift" data-cdb="'+h(x.ma)+'" style="text-align:left;border-color:'+c+'33">'+
      '<div class="row wrap mb" style="gap:7px">'+U.chip(x.ma,c)+(g.tang?U.chip(g.tang,'#185AB4'):'')+'</div>'+
      '<b class="sm" style="display:block;color:'+c+';margin-bottom:6px">'+h(g.ten||x.ma)+'</b>'+
      '<p class="tiny muted" style="line-height:1.55">'+h(x.nguoi)+'</p>'+
      '<div class="row wrap mt2" style="gap:5px">'+G.dsHet(x.vanDe,3).map(function(m){
        return '<span class="tiny mono muted">'+h(m)+'</span>'; }).join('')+'</div></button>';
  }).join('') + '</div>';

  o += U.sec('SÁU LUẬT VỀ CHÂN DUNG','Chân dung không phải nhãn dán vĩnh viễn.');
  o += '<div class="card">' + (G.CD_LUAT||[]).map(function(l){
    return '<div style="display:flex;gap:10px;padding:9px 0;border-top:1px solid var(--line)">'+
      '<span style="flex:none;width:24px;height:24px;border-radius:8px;display:grid;place-items:center;font-weight:900;font-size:12.5px;background:rgba(81,64,180,.14);color:#5140B4">'+l.no+'</span>'+
      '<div><b class="sm" style="display:block;margin-bottom:3px">'+h(l.ten)+'</b>'+
      '<span class="tiny muted" style="line-height:1.6">'+h(l.y)+'</span></div></div>';
  }).join('') + '</div>';
  return o;
});

/* ═══════════════ 3 · SÁCH GỐC & TƯ LIỆU, LỚP TRA CỨU ═══════════════ */
noi('sach', function(){
  if(!G.TL_KE) return '';
  var o = U.sec('SÁU KỆ TƯ LIỆU','Tư liệu nào nằm ở đâu, dùng vào việc gì, và dùng sai thế nào.');
  o += G.TL_KE.map(function(k){
    return '<div class="card mb" style="border-color:'+k.c+'2e">'+
      '<div class="row wrap mb" style="gap:8px">'+U.chip(k.ma,k.c)+
      '<span style="color:'+k.c+'">'+ic(k.ic,'w-4 h-4')+'</span>'+
      '<b style="color:'+k.c+'">'+h(k.ten)+'</b><span class="tiny muted">'+h(k.co)+'</span></div>'+
      '<p class="sm dim mb" style="line-height:1.65">'+h(k.la)+'</p>'+
      '<div class="grid g2" style="gap:10px">'+ the('DÙNG KHI NÀO', k.dung)+
      '<div class="card pad-sm" style="border-color:rgba(248,113,113,.3)"><div class="tiny up mb" style="color:var(--bad)">DÙNG SAI LÀ</div><p class="tiny">'+h(k.dungSai)+'</p></div>'+
      '</div></div>';
  }).join('');

  o += U.sec('SÁU LỘ TRÌNH ĐỌC','Mỗi vai một lộ trình. Chặng nào không có việc làm sau khi đọc thì không tính là đã đọc.');
  o += G.TL_DUONG.map(function(d){
    return '<div class="card mb" style="border-color:'+d.c+'2e">'+
      '<div class="row wrap mb" style="gap:8px">'+U.chip(d.vai,d.c)+
      '<b style="color:'+d.c+'">'+h(d.ten)+'</b><span class="tiny muted">'+h(d.tong)+'</span></div>'+
      d.chang.map(function(ch){
        return '<div style="padding:10px 0;border-top:1px solid var(--line)">'+
          '<div class="row wrap mb" style="gap:8px">'+
          '<span style="width:24px;height:24px;border-radius:8px;display:grid;place-items:center;font-weight:900;font-size:12.5px;background:'+d.c+'22;color:'+d.c+'">'+ch.no+'</span>'+
          '<b class="sm">'+h(ch.doc)+'</b><span class="tiny muted mono">'+ch.gio+' giờ</span></div>'+
          '<div class="grid g2" style="gap:9px">'+ the('LÀM GÌ SAU KHI ĐỌC', ch.lam)+ the('XONG CHẶNG NÀY KHI', ch.xong)+'</div></div>';
      }).join('') + '</div>';
  }).join('');

  o += U.sec('BẢY LUẬT GIỮ KHO','Đây là phần bảo vệ tài sản. Không phải khuyến nghị.');
  o += '<div class="card mb" style="border-color:rgba(190,14,22,.3);background:rgba(190,14,22,.04)">'+
    G.TL_LUAT.map(function(l){
      return '<div style="display:flex;gap:10px;padding:9px 0;border-top:1px solid var(--line)">'+
        '<span style="flex:none;color:var(--bad);margin-top:2px">'+ic('shield','w-4 h-4')+'</span>'+
        '<div><b class="sm" style="display:block;margin-bottom:3px">'+l.no+'. '+h(l.ten)+'</b>'+
        '<span class="tiny muted" style="line-height:1.6">'+h(l.y)+'</span></div></div>';
    }).join('') + '</div>';

  o += U.sec('TRÍCH DẪN TRONG NỘI BỘ','Tên tài liệu là ngôn ngữ nội bộ. Không đọc tên tài liệu cho gia đình nghe.');
  o += U.tbl(['Khi nào','Trích thế nào'], G.TL_TRICH.map(function(t){
    return ['<b class="sm">'+h(t.khi)+'</b>','<span class="tiny">'+h(t.cach)+'</span>'];
  }));

  o += U.sec('PHIÊN BẢN VÀ SỬA TƯ LIỆU','Đổi luật giữa chặng là làm hỏng chặng.');
  o += '<div class="card">' + G.TL_BAOQUAN.map(function(b){
    return '<div style="display:flex;gap:10px;padding:9px 0;border-top:1px solid var(--line)">'+
      '<span style="flex:none;width:24px;height:24px;border-radius:8px;display:grid;place-items:center;font-weight:900;font-size:12.5px;background:rgba(11,102,117,.14);color:#0B6675">'+b.no+'</span>'+
      '<div><b class="sm" style="display:block;margin-bottom:3px">'+h(b.ten)+'</b>'+
      '<span class="tiny muted" style="line-height:1.6">'+h(b.y)+'</span></div></div>';
  }).join('') + '</div>';
  return o;
});

/* ═══════════════ SỰ KIỆN ═══════════════ */
document.addEventListener('click', function(e){
  var el = e.target.closest && e.target.closest('[data-cdb]');
  if(el){ e.preventDefault(); G.cdModal(el.getAttribute('data-cdb')); }
});
})();

/* Bọc lại phần màn về muộn — xem lý do ở chỗ khai CHO_BOC. */
G.tlddNoiLai = function(){
  var con = CHO_BOC.splice(0, CHO_BOC.length), them = 0;
  for(var i = 0; i < con.length; i++){
    var truoc = CHO_BOC.length;
    noi(con[i][0], con[i][1]);
    if(CHO_BOC.length === truoc) them++;
  }
  return them;
};
(G.BOC_LAI = G.BOC_LAI || []).push('tlddNoiLai');
