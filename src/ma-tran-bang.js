/* ═══════════════════════════════════════════════════════════════
   GITA 365 — MÀN HÌNH MA TRẬN 220 × 5 TẦNG × 4 NHÓM KHÁCH HÀNG

   Màn hình này KHÔNG đọc 4.400 bản ghi có sẵn. Nó ghép bốn lớp dữ
   liệu lại thành một phiếu ngay lúc hiển thị:
     G.MATRAN.vande      → tên vấn đề, nguyên nhân, key giải pháp
     G.MATRAN_Tn         → kế hoạch của tầng: lộ trình, việc bốn vai, đích, hồ sơ
     G.MT_BANG_TANG      → băng này ở tầng này giao gì, giữ gì, cổng đòi gì
     G.MT_BANG_NHOM      → băng này ở nhóm vấn đề này trông thế nào, làm gì trước, khi nào dừng
     G.MT_DO             → chỉ số riêng của vấn đề + bốn ngưỡng băng
   220 × 5 × 4 = 4.400 phiếu, phiếu nào cũng có ngưỡng riêng của
   chính vấn đề đó. Xem lời giải thích đầy đủ ở đầu tệp
   kho-goc/data.matran.bang.js.

   Vì sao hàm ghép nằm ở src chứ không ở kho-goc: tools/ma-hoa-kho.js
   đóng gói kho bằng JSON.stringify, mà JSON thì bỏ hàm. Hàm định
   nghĩa trong kho-goc sẽ biến mất sau khi mã hoá. Dữ liệu ở kho-goc,
   hàm ở src — đây là quy tắc chung của dự án.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;
G.VIEWS = G.VIEWS || {};
(function(){
var U = G.U, h = U.h, ic = U.ic;

function coTang(t){ return !!(G['MATRAN_'+t] && G['MATRAN_'+t].length); }

/* ─── Tra cứu bốn lớp dữ liệu ───
   Bốn hàm này phải ở đây, không được ở kho-goc: kho đóng gói bằng
   JSON.stringify nên hàm định nghĩa trong kho-goc sẽ bị bỏ mất. */
G.mtBang = function(ma){
  var a = G.MT_BANG || [];
  for(var i=0;i<a.length;i++) if(a[i].ma===ma) return a[i];
  return null;
};
/* Tầng nhận cả hai dạng: số 1 và chuỗi 'T1'.

   Đây là mắt xích đã gãy suốt từ lúc dựng lớp băng mà không ai thấy:
   G.MT_BANG_TANG lưu tang là 'T1', còn người gọi — kể cả G.mtPhieu —
   truyền số. So sánh === giữa 1 và 'T1' luôn sai, nên mtBangTang trả
   null, kéo theo mtPhieu trả null cho CẢ 4.400 phiếu.

   Không màn nào văng lỗi vì mtPhieu trả null gọn gàng, và không bài kiểm
   nào bắt được vì không bài nào gọi thẳng mtPhieu. Một lớp dữ liệu đầy
   đủ nằm im vì một phép so sánh kiểu. */
function chuanTang(t){
  if(typeof t === 'number') return 'T' + t;
  var s = String(t == null ? '' : t).trim().toUpperCase();
  return /^[1-5]$/.test(s) ? 'T' + s : s;
}
G.mtChuanTang = chuanTang;

G.mtBangTang = function(tang, bang){
  var a = G.MT_BANG_TANG || [], t = chuanTang(tang);
  for(var i=0;i<a.length;i++) if(chuanTang(a[i].tang)===t && a[i].bang===bang) return a[i];
  return null;
};
G.mtBangNhom = function(nhom, bang){
  var a = G.MT_BANG_NHOM || [];
  for(var i=0;i<a.length;i++) if(a[i].nhom===nhom && a[i].bang===bang) return a[i];
  return null;
};
G.mtDo = function(ma){
  var a = G.MT_DO || [];
  for(var i=0;i<a.length;i++) if(a[i].ma===ma) return a[i];
  return null;
};
/* Cùng một bệnh với mtBangTang: kho tên là MATRAN_T1 nhưng người gọi
   truyền số 1, thành ra đọc MATRAN_1 — một kho không tồn tại. */
function layTang(t, ma){ var a=G['MATRAN_'+chuanTang(t)]||[]; for(var i=0;i<a.length;i++) if(a[i].ma===ma) return a[i]; return null; }
function layVan(ma){ var a=(G.MATRAN&&G.MATRAN.vande)||[]; for(var i=0;i<a.length;i++) if(a[i].ma===ma) return a[i]; return null; }

/* ─── Ghép một phiếu (vấn đề × tầng × băng) ───
   Trả về null khi thiếu bất kỳ lớp nào, để màn hình nói thật là
   chưa mở được chứ không dựng một phiếu rỗng nhìn như đã có. */
G.mtPhieu = function(maVan, tang, maBang){
  var v  = layVan(maVan);            if(!v)  return null;
  var kh = layTang(tang, maVan);     if(!kh) return null;
  var b  = G.mtBang && G.mtBang(maBang);            if(!b)  return null;
  var bt = G.mtBangTang && G.mtBangTang(tang, maBang);
  var bn = G.mtBangNhom && G.mtBangNhom(v.nhom, maBang);
  var d  = G.mtDo && G.mtDo(maVan);
  return { van:v, keHoach:kh, bang:b, oTang:bt, oNhom:bn, do:d,
           nguong: d ? ({XANH:d.x, VANG:d.v, CAM:d.c, DO:d.d})[maBang] : '' };
};

/* Trần việc giao thật sự: trần của tầng đè lên trần chung của băng.
   Ví dụ băng VÀNG trần chung 4 việc, nhưng ở T1 vẫn là 4 — còn băng
   ĐỎ thì mọi tầng đều là 0, vì việc duy nhất là gặp mặt. */
G.mtTran = function(tang, maBang){
  var bt = G.mtBangTang && G.mtBangTang(tang, maBang);
  if(bt && typeof bt.tran === 'number') return bt.tran;
  var b = G.mtBang && G.mtBang(maBang);
  return b ? b.tran : '';
};

/* Xếp băng từ ba số của hệ đo lường khách hàng. Không nhận điểm do
   người đồng hành tự cho — chỉ nhận số thô. Luật số 1, mục E. */
G.mtXepBang = function(m1, m2, mocTruot){
  if(m1 == null || m2 == null) return null;
  if(m1 < 40 || m2 <= 2 || mocTruot >= 2) return 'DO';
  if(m1 < 65 || m2 <= 6 || mocTruot >= 1) return 'CAM';
  if(m1 < 85 || m2 < 14)                  return 'VANG';
  return 'XANH';
};

/* ═══════════════ MÀN HÌNH ═══════════════ */
G.VIEWS['ma-tran-bang'] = function(){
  /* Đây là kho NGHỀ: cột "dừng và chuyển tuyến", trần việc giao, tên băng
     và tỷ lệ tệp đều là ngôn ngữ nội bộ. Trình đơn đã đặt perm nghe_chung
     nên học viên và phụ huynh không thấy mục này — cổng dưới đây chặn cả
     đường gọi thẳng vào màn hình. Hai chỗ khớp nhau thì không sinh mục chết. */
  if(!G.can('nghe_chung')) return U.lockCard();
  var M = G.MATRAN;
  if(!M || !G.MT_BANG) return U.empty('Chưa mở được ma trận bốn băng',
    'Lớp băng nằm trong gói nền. Đăng nhập lại để nạp.');
  var co = ['T1','T2','T3','T4','T5'].filter(coTang);
  if(!co.length) return U.lockCard('Chưa có tầng nào được cấp phép. Ma trận bốn băng cần ít nhất một tầng.');

  var S  = G.S || {};
  var st = S.mtb || (S.mtb = {});
  var tangHien = co.indexOf(st.tang) >= 0 ? st.tang : co[0];
  var bangHien = st.bang || 'VANG';
  var nhomHien = st.nhom || 'ALL';

  var o = U.ph({eyebrow:'NHÓM 03 · KHO BÁU VẬT', ic:'map', grad:1,
    t:'Ma trận 220 vấn đề × 5 tầng × 4 nhóm khách hàng',
    lead:'Cùng một vấn đề, cùng một tầng, nhưng nhà đang tự đi và nhà sắp rời thì phải làm khác nhau. Bốn băng XANH – VÀNG – CAM – ĐỎ là bốn nhóm khách hàng trong mỗi tầng. Chọn tầng, chọn băng, rồi mở vấn đề để lấy phiếu làm việc.'});

  o += '<div class="grid g4 mb">'+
    U.stat({k:'Vấn đề',   v:String(M.vande.length),  d:'11 nhóm · 20 vấn đề mỗi nhóm', c:'#0B6675'})+
    U.stat({k:'Tầng mở',  v:co.length+'/5',          d:co.join(' · '), c:'#185AB4'})+
    U.stat({k:'Nhóm khách', v:'4',                   d:'XANH · VÀNG · CAM · ĐỎ', c:'#0B7350'})+
    U.stat({k:'Phiếu ghép được', v:String(M.vande.length*co.length*4).replace(/\B(?=(\d{3})+(?!\d))/g,'.'),
            d:'vấn đề × tầng × băng', c:'#5140B4'})+
    '</div>';

  /* ── Bốn băng: bảng định nghĩa, đọc trước khi dùng ── */
  o += U.sec('BỐN NHÓM KHÁCH HÀNG TRONG MỖI TẦNG',
    'Băng nói tình trạng đồng hành, không nói năng lực học sinh và không nói tiền. Nhà tầng 5 vẫn có thể ở băng ĐỎ; nhà tầng 1 vẫn có thể ở băng XANH.');
  o += '<div class="grid g2 mb">'+ G.MT_BANG.map(function(b){
    return '<div class="card" style="border-color:'+b.c+'33">'+
      '<div class="row wrap mb" style="gap:8px">'+U.chip(b.ma,b.c)+
      '<b style="color:'+b.c+';font-size:16px">'+h(b.ten)+'</b>'+
      '<span class="tiny muted">'+h(b.tyLe)+'</span></div>'+
      '<p class="sm dim mb" style="line-height:1.65">'+h(b.y)+'</p>'+
      '<div class="grid g2" style="gap:9px">'+
        '<div class="card pad-sm"><div class="tiny up muted mb">VÀO BĂNG KHI</div><p class="tiny">'+h(b.vao)+'</p></div>'+
        '<div class="card pad-sm"><div class="tiny up muted mb">NHỊP CHẠM</div><p class="tiny">'+h(b.nhip)+'</p></div>'+
        '<div class="card pad-sm"><div class="tiny up muted mb">TRẦN VIỆC GIAO</div><p class="tiny">'+h(b.tran)+'</p></div>'+
        '<div class="card pad-sm"><div class="tiny up muted mb">AI KÉO CHÍNH</div><p class="tiny">'+h(b.keo)+'</p></div>'+
        '<div class="card pad-sm"><div class="tiny up muted mb">LÊN BĂNG KHI</div><p class="tiny">'+h(b.len)+'</p></div>'+
        '<div class="card pad-sm"><div class="tiny up muted mb">TỤT BĂNG KHI</div><p class="tiny">'+h(b.xuong)+'</p></div>'+
      '</div>'+
      '<div class="card pad-sm mt" style="border-color:rgba(248,113,113,.32)">'+
      '<div class="tiny up mb" style="color:var(--bad)">ĐIỀU CẤM</div><p class="tiny">'+h(b.cam)+'</p></div>'+
      '</div>';
  }).join('') +'</div>';

  /* ── Bộ chọn: tầng, băng, nhóm ── */
  o += U.sec('CHỌN Ô LÀM VIỆC','Ba nút: tầng nhà mình đang ở, băng nhà mình đang ở, nhóm vấn đề đang xử lý.');
  o += '<div class="card mb">'+
    '<div class="tiny up muted mb">TẦNG</div>'+
    '<div class="row wrap mb" style="gap:7px">'+ co.map(function(t){
      return '<button class="btn ghost sm'+(t===tangHien?' on':'')+'" data-mbt="'+t+'">'+t+' · '+
        h((M.tenLo&&M.tenLo[t])||'').replace(/^Lộ trình /,'')+'</button>';
    }).join('') +'</div>'+
    '<div class="tiny up muted mb">NHÓM KHÁCH HÀNG</div>'+
    '<div class="row wrap mb" style="gap:7px">'+ G.MT_BANG.map(function(b){
      return '<button class="btn ghost sm'+(b.ma===bangHien?' on':'')+'" data-mbb="'+b.ma+'" '+
        'style="'+(b.ma===bangHien?'border-color:'+b.c+';color:'+b.c:'')+'">'+h(b.ma)+'</button>';
    }).join('') +'</div>'+
    '<div class="tiny up muted mb">NHÓM VẤN ĐỀ</div>'+
    '<div class="row wrap" style="gap:7px">'+
      '<button class="btn ghost sm'+(nhomHien==='ALL'?' on':'')+'" data-mbn="ALL">Tất cả</button>'+
      M.nhom.map(function(n){
        return '<button class="btn ghost sm'+(n.ma===nhomHien?' on':'')+'" data-mbn="'+h(n.ma)+'">'+h(n.ten)+'</button>';
      }).join('') +'</div></div>';

  /* ── Ô băng × tầng và ô băng × nhóm đang chọn ── */
  var b  = G.mtBang(bangHien);
  var bt = G.mtBangTang(tangHien, bangHien);
  if(bt){
    o += '<div class="card mb" style="border-color:'+b.c+'44">'+
      '<div class="row wrap mb" style="gap:8px">'+U.chip(tangHien,'#185AB4')+U.chip(b.ma,b.c)+
      '<b style="color:'+b.c+'">Ở tầng này, băng này làm gì</b>'+
      '<span class="tiny muted">trần '+h(String(G.mtTran(tangHien,bangHien)))+' việc/tuần</span></div>'+
      '<div class="grid g2" style="gap:10px">'+
      '<div class="card pad-sm"><div class="tiny up muted mb">GIAO GÌ</div><p class="tiny">'+h(bt.giao)+'</p></div>'+
      '<div class="card pad-sm"><div class="tiny up muted mb">GIỮ LẠI GÌ</div><p class="tiny">'+h(bt.giu)+'</p></div>'+
      '<div class="card pad-sm"><div class="tiny up muted mb">CỔNG NGHIỆM THU ĐÒI GÌ</div><p class="tiny">'+h(bt.cong)+'</p></div>'+
      '<div class="card pad-sm" style="border-color:rgba(251,146,60,.32)"><div class="tiny up mb" style="color:var(--alert)">RỦI RO LỚN NHẤT</div><p class="tiny">'+h(bt.rui)+'</p></div>'+
      '</div></div>';
  }
  if(nhomHien !== 'ALL'){
    var bn = G.mtBangNhom(nhomHien, bangHien);
    if(bn){
      var nTen = (M.nhom.filter(function(n){return n.ma===nhomHien;})[0]||{}).ten || nhomHien;
      o += '<div class="card mb" style="border-color:'+b.c+'44">'+
        '<div class="row wrap mb" style="gap:8px">'+U.chip(nhomHien,'#0B6675')+U.chip(b.ma,b.c)+
        '<b style="color:'+b.c+'">'+h(nTen)+' — băng này trông thế nào</b></div>'+
        '<div class="grid g3" style="gap:10px">'+
        '<div class="card pad-sm"><div class="tiny up muted mb">TRÔNG THẾ NÀO</div><p class="tiny">'+h(bn.mat)+'</p></div>'+
        '<div class="card pad-sm"><div class="tiny up muted mb">LÀM TRƯỚC TIÊN</div><p class="tiny">'+h(bn.truoc)+'</p></div>'+
        '<div class="card pad-sm" style="border-color:rgba(248,113,113,.32)"><div class="tiny up mb" style="color:var(--bad)">DỪNG · CHUYỂN TUYẾN KHI</div><p class="tiny">'+h(bn.dung)+'</p></div>'+
        '</div></div>';
    }
  }

  /* ── Danh sách vấn đề, mỗi thẻ đã mang ngưỡng của băng đang chọn ── */
  o += U.sec('CHỌN VẤN ĐỀ ĐỂ MỞ PHIẾU',
    'Con số dưới mỗi vấn đề là ngưỡng của băng '+bangHien+' cho chính vấn đề đó — không phải ngưỡng chung.');
  o += '<div class="grid g2" id="mbList">' + M.vande.map(function(v){
    var d = G.mtDo(v.ma);
    var ng = d ? ({XANH:d.x,VANG:d.v,CAM:d.c,DO:d.d})[bangHien] : '';
    var an = (nhomHien!=='ALL' && v.nhom!==nhomHien);
    return '<button class="card lift" data-mbv="'+h(v.ma)+'" data-f="'+h(v.nhom)+'"'+
      (an?' style="text-align:left;display:none"':' style="text-align:left"')+'>'+
      '<div class="row wrap mb" style="gap:7px">'+U.chip(v.ma,'#0B6675')+
      '<span class="tiny muted">'+h(v.nhomTen)+'</span></div>'+
      '<b class="sm" style="display:block;line-height:1.45;margin-bottom:6px">'+h(v.ten)+'</b>'+
      (d ? '<div class="row wrap tiny" style="gap:6px">'+
            '<span class="muted">'+h(d.dv)+'</span>'+
            '<span style="color:'+b.c+';font-weight:700">'+h(String(ng))+'</span></div>'
         : '<p class="tiny muted">Chưa có chỉ số riêng</p>')+
      '</button>';
  }).join('') + '</div>';

  /* ── Luật ── */
  o += U.sec('BẢY LUẬT XẾP BĂNG','Băng không do người đồng hành cảm thấy mà ra.');
  o += '<div class="card">' + (G.MT_BANG_LUAT||[]).map(function(l){
    return '<div style="display:flex;gap:10px;padding:9px 0;border-top:1px solid var(--line)">'+
      '<span style="flex:none;width:26px;height:26px;border-radius:9px;display:grid;place-items:center;'+
      'font-weight:900;font-size:12.5px;background:rgba(11,102,117,.14);color:#0B6675">'+l.no+'</span>'+
      '<div><b class="sm" style="display:block;margin-bottom:3px">'+h(l.ten)+'</b>'+
      '<span class="tiny muted" style="line-height:1.6">'+h(l.y)+'</span></div></div>';
  }).join('') + '</div>';
  return o;
};

/* ═══════════════ PHIẾU ĐẦY ĐỦ ═══════════════ */
G.mtBangModal = function(maVan){
  var S = G.S || {}, st = S.mtb || {};
  var co = ['T1','T2','T3','T4','T5'].filter(coTang);
  var tang = co.indexOf(st.tang)>=0 ? st.tang : co[0];
  var bang = st.bang || 'VANG';
  var p = G.mtPhieu(maVan, tang, bang);
  if(!p){ U.modal('<p class="sm">Chưa ghép được phiếu này. Có thể tầng '+h(tang)+' chưa được cấp phép.</p>'); return; }

  var b = p.bang, v = p.van, kh = p.keHoach;
  var html =
    '<div class="row wrap" style="gap:7px;margin-bottom:9px">'+U.chip(v.ma,'#0B6675')+U.chip(tang,'#185AB4')+
      U.chip(b.ma,b.c)+U.chip(v.nhomTen)+'</div>'+
    '<h2 style="font-size:21px;font-weight:800;margin-bottom:4px">'+h(v.ten)+'</h2>'+
    '<p class="tiny muted" style="margin-bottom:13px">'+h(b.ten)+' · trần '+
      h(String(G.mtTran(tang,bang)))+' việc/tuần · '+h(b.nhip)+'</p>'+

    '<div class="grid g2" style="gap:10px;margin-bottom:13px">'+
      '<div class="card pad-sm"><div class="tiny up muted mb">NGUYÊN NHÂN CỐT LÕI</div><p class="sm">'+h(v.nguyen)+'</p></div>'+
      '<div class="card pad-sm"><div class="tiny up muted mb">KEY GIẢI PHÁP</div><p class="sm">'+h(v.key)+'</p></div>'+
    '</div>';

  /* Đo bằng gì — lớp làm phiếu này khác 4.399 phiếu còn lại */
  if(p.do){
    html += '<div class="card mb" style="border-color:'+b.c+'44">'+
      '<div class="tiny up mb" style="color:'+b.c+'">ĐO BẰNG GÌ — VÀ NGƯỠNG CỦA BĂNG '+h(b.ma)+'</div>'+
      '<div class="grid g2" style="gap:10px;margin-bottom:10px">'+
      '<div class="card pad-sm"><div class="tiny up muted mb">ĐƠN VỊ</div><p class="sm">'+h(p.do.dv)+'</p></div>'+
      '<div class="card pad-sm"><div class="tiny up muted mb">CÁCH LẤY SỐ</div><p class="tiny">'+h(p.do.cach)+'</p></div>'+
      '</div>'+
      '<div class="grid g4" style="gap:8px">'+ G.MT_BANG.map(function(x){
        var val = ({XANH:p.do.x,VANG:p.do.v,CAM:p.do.c,DO:p.do.d})[x.ma];
        var day = x.ma===b.ma;
        return '<div class="card pad-sm center" style="border-color:'+x.c+(day?'88':'22')+
          (day?';background:'+x.c+'12':'')+'">'+
          '<div class="tiny up mb" style="color:'+x.c+'">'+h(x.ma)+'</div>'+
          '<b class="sm">'+h(String(val))+'</b></div>';
      }).join('') +'</div></div>';
  }

  /* Băng × nhóm vấn đề */
  if(p.oNhom){
    html += '<div class="card mb">'+
      '<div class="tiny up mb" style="color:'+b.c+'">BĂNG '+h(b.ma)+' TRONG NHÓM '+h(v.nhomTen)+'</div>'+
      '<div class="grid g3" style="gap:10px">'+
      '<div class="card pad-sm"><div class="tiny up muted mb">TRÔNG THẾ NÀO</div><p class="tiny">'+h(p.oNhom.mat)+'</p></div>'+
      '<div class="card pad-sm"><div class="tiny up muted mb">LÀM TRƯỚC TIÊN</div><p class="tiny">'+h(p.oNhom.truoc)+'</p></div>'+
      '<div class="card pad-sm" style="border-color:rgba(248,113,113,.32)"><div class="tiny up mb" style="color:var(--bad)">DỪNG · CHUYỂN TUYẾN KHI</div><p class="tiny">'+h(p.oNhom.dung)+'</p></div>'+
      '</div></div>';
  }

  /* Băng × tầng */
  if(p.oTang){
    html += '<div class="card mb">'+
      '<div class="tiny up mb" style="color:'+b.c+'">BĂNG '+h(b.ma)+' Ở '+h(tang)+'</div>'+
      '<div class="grid g2" style="gap:10px">'+
      '<div class="card pad-sm"><div class="tiny up muted mb">GIAO GÌ</div><p class="tiny">'+h(p.oTang.giao)+'</p></div>'+
      '<div class="card pad-sm"><div class="tiny up muted mb">GIỮ LẠI GÌ</div><p class="tiny">'+h(p.oTang.giu)+'</p></div>'+
      '<div class="card pad-sm"><div class="tiny up muted mb">CỔNG NGHIỆM THU</div><p class="tiny">'+h(p.oTang.cong)+'</p></div>'+
      '<div class="card pad-sm" style="border-color:rgba(251,146,60,.32)"><div class="tiny up mb" style="color:var(--alert)">RỦI RO</div><p class="tiny">'+h(p.oTang.rui)+'</p></div>'+
      '</div></div>';
  }

  /* Kế hoạch gốc của tầng — bốn vai */
  html += '<div class="card mb">'+
    '<div class="tiny up mb" style="color:#185AB4">KẾ HOẠCH '+h(tang)+' — GIỮ NGUYÊN, ĐIỀU CHỈNH THEO BĂNG Ở TRÊN</div>'+
    '<div class="card pad-sm mb"><div class="tiny up muted mb">LỘ TRÌNH</div><p class="tiny">'+h(kh.lo)+'</p></div>'+
    '<div class="grid g2" style="gap:10px">'+
    '<div class="card pad-sm"><div class="tiny up muted mb">HỌC VIÊN</div><p class="tiny">'+h(kh.hs)+'</p></div>'+
    '<div class="card pad-sm"><div class="tiny up muted mb">PHỤ HUYNH</div><p class="tiny">'+h(kh.ph)+'</p></div>'+
    '<div class="card pad-sm"><div class="tiny up muted mb">TƯ VẤN</div><p class="tiny">'+h(kh.tv)+'</p></div>'+
    '<div class="card pad-sm"><div class="tiny up muted mb">COACH</div><p class="tiny">'+h(kh.coach)+'</p></div>'+
    '</div>'+
    '<div class="card pad-sm mt"><div class="tiny up muted mb">ĐÍCH PHẢI ĐẠT</div><p class="tiny">'+h(kh.dich)+'</p></div>'+
    '<div class="card pad-sm mt"><div class="tiny up muted mb">HỒ SƠ PHẢI NỘP</div><p class="tiny">'+h(kh.hoSo)+'</p></div>'+
    '</div>';

  html += '<div class="card" style="border-color:'+b.c+'44;background:'+b.c+'0d">'+
    '<div class="tiny up mb" style="color:'+b.c+'">NÓI VỚI GIA ĐÌNH THẾ NÀO</div>'+
    '<p class="sm" style="line-height:1.7">Không đọc tên băng cho gia đình nghe. Nói bằng việc: tuần này nhà mình làm '+
    h(String(G.mtTran(tang,bang)))+' việc, gặp nhau theo nhịp '+h(b.nhip.toLowerCase())+
    ' — luật số 6, mục xếp băng.</p></div>';

  U.modal(html);
};

/* ═══════════════ SỰ KIỆN ═══════════════ */
function on(sel, fn){
  document.addEventListener('click', function(e){
    var el = e.target.closest && e.target.closest(sel);
    if(el){ e.preventDefault(); fn(el, e); }
  });
}
function datVeLai(khoa, gt){
  G.S.mtb = G.S.mtb || {};
  G.S.mtb[khoa] = gt;
  if(G.save) G.save();
  if(G.render) G.render();
}
on('[data-mbt]', function(el){ datVeLai('tang', el.getAttribute('data-mbt')); });
on('[data-mbb]', function(el){ datVeLai('bang', el.getAttribute('data-mbb')); });
on('[data-mbn]', function(el){ datVeLai('nhom', el.getAttribute('data-mbn')); });
on('[data-mbv]', function(el){ G.mtBangModal(el.getAttribute('data-mbv')); });
})();
