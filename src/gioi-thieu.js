/* ═══════════════════════════════════════════════════════════════
   GITA 365 · v9.0 — MÀN GIỚI THIỆU VỀ GITA365

   Ba loại người mở màn này, và cả ba phải dùng được:

     · Một nhà vừa nhận tài khoản, chưa biết mình bước vào đâu
     · Một người trong đội ngũ cần bản nói lại cho gọn khi ngồi trước
       gia đình — nên phần này có nút chép nguyên văn cho đội ngũ
     · Anh Quang, khi cần rà lại xem Học viện đang tự giới thiệu ra sao

   Nguyên tắc: phần KHÔNG làm được đặt ngay cạnh phần làm được, không
   giấu xuống cuối. Lời giới thiệu chỉ có phần hay thì người đọc trừ hao,
   và trừ hao thì họ trừ luôn cả phần thật.

   THỨ TỰ MÀN HÌNH — cố ý, không phải xếp cho đủ mục:

     1. Một câu           · nếu người đọc chỉ đọc một dòng thì là dòng này
     2. Sứ mệnh · Tầm nhìn· Học viện tự nhận mình đang làm gì
     3. Mục tiêu          · hai câu trên quy ra số, kèm câu ranh giới ĐỨNG TRƯỚC bảng
     4. Bảy giá trị cốt lõi· mỗi giá trị kèm một việc nên và một việc không
     5. Vì sao có GITA365 · ba chỗ hỏng có thật
     6. Làm được · KHÔNG làm được
     7. Một nhà đi qua những gì · bốn chặng theo thời gian: 7 · 21 · 90 · 365 ngày
     8. Năm tầng          · giá trị Max, cổng, và cái mất nếu nhảy cóc.
                            Đứng SAU bốn chặng có chủ ý: người đọc cần
                            hình dung được trục thời gian trước, rồi mới
                            đọc được trục chiều sâu.
     9. Văn hoá           · nhịp sống → cách nói chuyện → nội quy
    10. Chiến lược đồng hành · vòng chạy, bốn băng, năm chỗ hay rời,
                              và năm cách giữ khách Học viện KHÔNG dùng
    11. Ai làm việc · số liệu · câu hỏi hay gặp · bắt đầu từ đâu

   Sứ mệnh, tầm nhìn, giá trị và văn hoá lấy thẳng từ G.CULTURE ở
   src/data.core.js — không chép lại vào kho giới thiệu. Chép lại là hai
   bản lệch nhau sau lần sửa đầu tiên và không ai biết bản nào mới.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;

(function(){
var U = G.U, h = U.h, ic = U.ic;
G.VIEWS = G.VIEWS || {};

function nhom(){
  var n = G.NHOM_NGONNGU ? G.NHOM_NGONNGU() : 'nghe';
  return n === 'hocvien' ? 'hv' : (n === 'phuhuynh' ? 'ph' : 'ng');
}

G.VIEWS['gioi-thieu'] = function(){
  var nh = nhom();
  var laNghe = (nh === 'ng');

  var o = U.ph({eyebrow:'HỆ SINH THÁI GIA ĐÌNH THỊNH VƯỢNG', ic:'seed', grad:1,
    t:'GITA 365 là gì',
    lead: nh === 'hv'
      ? 'Đây là chỗ nói cho em biết em đang bước vào cái gì, mất bao lâu, và cuối đường thì trông như thế nào. '+
        'Đọc mười phút, không cần chuẩn bị gì.'
      : nh === 'ph'
      ? 'Đây là chỗ nói cho anh chị biết nhà mình đang bước vào cái gì, mất bao lâu, và Học viện làm được gì — '+
        'cũng như không làm được gì. Mười phút đọc.'
      : 'Bản giới thiệu chuẩn của Học viện. Đội ngũ dùng nguyên văn phần này khi ngồi trước gia đình, '+
        'để mười người nói mười kiểu thì gia đình nghe ra mười Học viện khác nhau.'});

  /* Một câu */
  o += '<div class="card mt2" style="border-color:var(--gita-vien-1);background:var(--phu-1)">'+
    '<span class="tiny up muted">NẾU CHỈ ĐƯỢC NÓI MỘT CÂU</span>'+
    '<p class="mt" style="font-size:18px;line-height:1.8;font-weight:600">'+h(G.GT_MOT_CAU || '')+'</p></div>';

  /* ── SỨ MỆNH · TẦM NHÌN ──
     Lấy thẳng từ G.CULTURE ở src/data.core.js chứ không chép lại ở đây.
     Chép lại là hai bản sẽ lệch nhau sau lần sửa đầu tiên, và không ai
     biết bản nào mới. */
  var C = G.CULTURE || {};
  var tn = C.tamNhin || {}, sm = C.suMenh || {};
  o += U.sec('SỨ MỆNH VÀ TẦM NHÌN','Hai câu này quyết định mọi thứ còn lại trong màn hình');
  o += '<div class="row wrap" style="gap:12px">'+
    /* Màu lấy từ biến nhận diện, không gõ mã màu vào đây: bộ kiểm chặn
       mọi mã vàng của bản trước v7.7, và một mã màu gõ tay thì lần đổi
       nhận diện sau sẽ bỏ sót đúng chỗ này. */
    [[sm, 'var(--gita-sau)', 'seed'], [tn, 'var(--gita-do-ink)', 'compass']].map(function(x){
      var d = x[0]; if(!d.t) return '';
      return '<div class="card" style="flex:1;min-width:290px;border-top:3px solid '+x[1]+'">'+
        '<div class="row" style="gap:8px;align-items:center">'+ic(x[2],'w-4 h-4')+
          '<span class="tiny up" style="color:'+x[1]+';letter-spacing:.09em">'+h(d.t)+'</span></div>'+
        '<p class="mt" style="font-size:16px;line-height:1.8;font-weight:600">'+h(d.big)+'</p>'+
        '<p class="sm muted mt" style="line-height:1.7;font-style:italic">'+h(d.sub)+'</p></div>';
    }).join('') +'</div>';

  /* ── MỤC TIÊU ──
     Đặt ngay sau sứ mệnh và tầm nhìn vì đây là chỗ hai câu ấy được quy
     ra số. Câu ranh giới đứng TRƯỚC bảng, không đứng sau: đọc bảng rồi
     mới gặp ranh giới thì bảng đã kịp được hiểu thành lời hứa. */
  /* Mốc 2030 của Học viện đứng trước mục tiêu của một nhà: người đọc cần
     thấy Học viện tự đặt cho mình một con số có hạn trước khi đọc những
     con số Học viện đặt cho nhà mình. */
  var m30 = C.moc2030;
  if(m30 && m30.big)
    o += '<div class="card mt2" style="border-left:3px solid var(--gita-do-ink)">'+
      '<span class="tiny up" style="color:var(--gita-do-ink);letter-spacing:.09em">'+h(m30.t)+'</span>'+
      '<p class="mt" style="font-size:16px;line-height:1.8;font-weight:600">'+h(m30.big)+'</p>'+
      '<p class="sm muted mt" style="line-height:1.7;font-style:italic">'+h(m30.sub)+'</p></div>';

  o += U.sec('MỤC TIÊU CỦA MỘT NHÀ','Sáu mốc, mỗi mốc một con số hệ thống tự đếm được');
  if(G.GT_MUCTIEU_RANH)
    o += '<div class="card" style="border-color:var(--gita-do);background:var(--phu-1)">'+
      '<div class="row" style="gap:9px;align-items:flex-start">'+ic('shield','w-4 h-4')+
      '<p class="sm" style="flex:1;line-height:1.75">'+h(G.GT_MUCTIEU_RANH)+'</p></div></div>';
  o += '<div class="grid g2 mt2">'+ (G.GT_MUCTIEU || []).map(function(x){
    return '<div class="card lift" style="border-left:3px solid '+x.c+'">'+
      '<div class="row" style="gap:8px;align-items:baseline;flex-wrap:wrap">'+
        '<span class="chip" style="color:'+x.c+';border-color:'+x.c+'55">'+h(x.moc)+'</span>'+
        '<b style="flex:1;min-width:150px;font-size:16px">'+h(x.ten)+'</b></div>'+
      '<p class="sm mt" style="line-height:1.75">'+h(x.dich)+'</p>'+
      '<div class="mt2" style="padding-top:11px;border-top:1px dashed var(--phu-4)">'+
        '<div class="tiny up muted">ĐO BẰNG</div>'+
        '<p class="sm mt" style="line-height:1.6">'+h(x.do)+'</p>'+
        '<div class="tiny up muted mt2">ĐẠT KHI</div>'+
        '<p class="sm mt" style="line-height:1.6;color:'+x.c+'">'+h(x.chuan)+'</p>'+
      '</div></div>';
  }).join('') +'</div>';

  /* ── GIÁ TRỊ CỐT LÕI ──
     Bảy giá trị, và mỗi giá trị kèm một việc NÊN và một việc KHÔNG. Giá
     trị không kèm hành vi cụ thể thì chỉ là bảy chữ đẹp treo tường. */
  o += U.sec('BẢY GIÁ TRỊ CỐT LÕI','Mỗi giá trị kèm một việc nên làm và một việc không làm — nếu không thì chỉ là chữ treo tường');
  o += '<div class="row wrap" style="gap:11px">'+ (C.giaTri || []).map(function(x){
    return '<div class="card" style="flex:1;min-width:250px;border-top:3px solid '+x.c+'">'+
      '<div class="row" style="gap:9px;align-items:baseline">'+
        '<b class="mono" style="font-size:18px;color:'+x.c+'">'+h(x.k)+'</b>'+
        '<b style="flex:1;font-size:14.5px">'+h(x.t)+'</b></div>'+
      '<p class="sm mt" style="line-height:1.7">'+h(x.d)+'</p>'+
      '<p class="tiny mt2" style="line-height:1.6;color:var(--ok)">✓ '+h(x.nen)+'</p>'+
      '<p class="tiny mt" style="line-height:1.6;color:var(--gita-do-ink)">✕ '+h(x.khong)+'</p></div>';
  }).join('') +'</div>';

  /* Vì sao có GITA365 */
  var V = G.GT_VISAO || {};
  o += U.sec('VÌ SAO CÓ GITA365','Ba chỗ hỏng có thật, và đây là chỗ chữa');
  o += '<div class="card">'+
    '<p class="sm" style="line-height:1.8">'+h(V.canh || '')+'</p>'+
    (V.hong || []).map(function(x, i){
      return '<div class="row mt2" style="gap:11px;align-items:flex-start">'+
        '<span style="width:26px;height:26px;flex:none;border-radius:9px;display:flex;align-items:center;'+
          'justify-content:center;background:var(--gita-do)18;color:var(--gita-do-ink);font-weight:700;'+
          'font-size:14.5px">'+(i+1)+'</span>'+
        '<p class="sm" style="flex:1;line-height:1.75">'+h(x)+'</p></div>';
    }).join('')+
    '<p class="sm mt2" style="line-height:1.8;font-weight:600;color:var(--gita)">'+h(V.chot || '')+'</p></div>';

  /* Bốn lời hứa */
  o += U.sec('BỐN ĐIỀU HỌC VIỆN LÀM ĐƯỢC','Và ngay dưới là sáu điều không làm — đọc cả hai rồi hãy quyết');
  o += '<div class="row wrap" style="gap:12px">'+ (G.GT_HUA || []).map(function(x){
    return '<div class="card" style="flex:1;min-width:250px;border-left:3px solid '+x.c+'">'+
      '<div class="row" style="gap:8px;align-items:center">'+ic(x.ic,'w-4 h-4')+
        '<b style="font-size:16px;color:'+x.c+'">'+h(x.t)+'</b></div>'+
      '<p class="sm mt" style="line-height:1.75">'+h(x.y)+'</p></div>';
  }).join('') +'</div>';

  /* Sáu điều không làm — đặt ngay cạnh, không giấu xuống cuối */
  o += U.sec('SÁU ĐIỀU HỌC VIỆN KHÔNG LÀM','Nói trước thì phần còn lại được tin');
  o += '<div class="card" style="border-color:var(--gita-do)">'+
    (G.GT_KHONG || []).map(function(x, i){
      return '<div class="row'+(i ? ' mt2' : '')+'" style="gap:10px;align-items:flex-start">'+
        '<span style="color:var(--gita-do-ink);font-weight:700;flex:none">✕</span>'+
        '<p class="sm" style="flex:1;line-height:1.75">'+h(x)+'</p></div>';
    }).join('') +'</div>';

  /* Bốn chặng */
  o += U.sec('MỘT NHÀ ĐI QUA NHỮNG GÌ','Bốn chặng, đi theo thứ tự, không nhảy cóc');
  (G.GT_CHANG || []).forEach(function(x){
    o += '<div class="card mt2" style="border-left:3px solid '+x.c+'">'+
      '<div class="row" style="gap:11px;align-items:baseline;flex-wrap:wrap">'+
        '<span class="chip" style="color:'+x.c+';border-color:'+x.c+'55">'+h(x.ngay)+'</span>'+
        '<b style="flex:1;min-width:170px;font-size:16px">'+h(x.ten)+'</b></div>'+
      '<p class="sm mt" style="line-height:1.75"><b>Làm gì:</b> '+h(x.lam)+'</p>'+
      '<p class="sm mt" style="line-height:1.75;color:var(--ok)"><b>Xong khi:</b> '+h(x.xong)+'</p></div>';
  });

  /* ── HỆ THỐNG NĂM TẦNG — GIÁ TRỊ MAX ──
     Bản cũ chỉ có tên tầng và một dòng mô tả, nên đọc xong vẫn không
     biết đi hết một tầng thì LẤY được gì. Nay mỗi tầng nói ba điều: thứ
     đắt nhất lấy ra được, cổng để sang tầng sau, và cái mất nếu nhảy cóc
     qua nó. */
  o += U.sec('HỆ THỐNG NĂM TẦNG — GIÁ TRỊ MAX CỦA TỪNG TẦNG',
    'Tầng sau chỉ mở khi tầng trước đã chắc. Nhảy cóc thì tầng sau đứng trên nền cát');
  (G.GT_TANG || []).forEach(function(x){
    o += '<div class="card mt2" style="border-left:3px solid '+x.c+'">'+
      '<div class="row" style="gap:11px;align-items:baseline;flex-wrap:wrap">'+
        '<span class="chip" style="color:'+x.c+';border-color:'+x.c+'55">'+h(x.t)+'</span>'+
        '<b style="flex:1;min-width:160px;font-size:16px">'+h(x.ten)+'</b></div>'+
      '<p class="sm mt" style="line-height:1.75">'+h(x.y)+'</p>'+
      (x.max ? '<div class="mt2" style="padding:12px 14px;border-radius:12px;background:'+x.c+'12;'+
        'border:1px solid '+x.c+'33">'+
        '<div class="tiny up" style="color:'+x.c+';letter-spacing:.09em">GIÁ TRỊ MAX</div>'+
        '<p class="sm mt" style="line-height:1.75;font-weight:600">'+h(x.max)+'</p></div>' : '')+
      (x.cong ? '<p class="sm mt2" style="line-height:1.7"><b style="color:var(--ok)">Cổng sang tầng sau:</b> '+h(x.cong)+'</p>' : '')+
      (x.mat ? '<p class="sm mt" style="line-height:1.7;color:var(--gita-do-ink)"><b>Nhảy cóc thì mất:</b> '+h(x.mat)+'</p>' : '')+
    '</div>';
  });

  /* ── VĂN HOÁ GITA365 ──
     Ba lớp, và cố tình xếp theo thứ tự này: nhịp sống (thấy được hằng
     ngày) → bốn nhịp nói chuyện (dùng được ngay tối nay) → nội quy
     (ranh giới). Nội quy đặt sau cùng vì nó chỉ có nghĩa khi đã hình
     dung được đời sống mà nó bảo vệ. */
  o += U.sec('VĂN HOÁ GITA365','Không phải khẩu hiệu — là nhịp sống, cách nói chuyện và ranh giới của cả hệ sinh thái');

  o += '<div class="card"><div class="tiny up muted mb">NHỊP SỐNG CỦA HỆ SINH THÁI</div>'+
    '<div class="row wrap" style="gap:10px">'+ (C.nhip || []).map(function(x){
      return '<div style="flex:1;min-width:170px;padding:12px 14px;border-radius:12px;'+
        'background:var(--phu-1);border-left:3px solid '+x.c+'">'+
        '<b class="tiny up" style="color:'+x.c+';letter-spacing:.08em">'+h(x.k)+'</b>'+
        '<p class="sm mt" style="line-height:1.6">'+h(x.t)+'</p></div>';
    }).join('') +'</div></div>';

  o += '<div class="card mt2"><div class="tiny up muted mb">BỐN NHỊP TRONG MỌI CUỘC NÓI CHUYỆN KHÓ</div>'+
    '<div class="row wrap" style="gap:10px">'+ (C.bonNhip || []).map(function(x, i){
      return '<div style="flex:1;min-width:200px">'+
        '<div class="row" style="gap:8px;align-items:center">'+
          '<span style="width:24px;height:24px;flex:none;border-radius:8px;display:flex;'+
            'align-items:center;justify-content:center;background:var(--gita)18;color:var(--gita);'+
            'font-weight:700;font-size:12.5px">'+(i+1)+'</span>'+
          '<b style="font-size:14.5px">'+h(x.t)+'</b></div>'+
        '<p class="sm mt" style="line-height:1.65">'+h(x.d)+'</p></div>';
    }).join('') +'</div></div>';

  o += '<div class="card mt2"><div class="tiny up muted mb">NỘI QUY — RANH GIỚI CHUNG CỦA MỌI NGƯỜI TRONG HỆ</div>'+
    (C.noiQuy || []).map(function(x, i){
      return '<div class="row'+(i ? ' mt2' : '')+'" style="gap:10px;align-items:flex-start">'+
        '<span style="color:var(--gita);font-weight:700;flex:none">·</span>'+
        '<p class="sm" style="flex:1;line-height:1.7"><b>'+h(x.t)+'.</b> '+h(x.d)+'</p></div>';
    }).join('') +'</div>';

  /* ── CHIẾN LƯỢC ĐỒNG HÀNH TỚI KHI CÓ KẾT QUẢ ──
     Đặt sau văn hoá vì chiến lược này chỉ đọc đúng khi đã biết ranh giới:
     bỏ ranh giới ra thì cùng một cơ chế đọc thành thủ thuật giữ khách.
     Nên khối "không làm" nằm ngay trong phần này, không tách đi đâu. */
  var DH = G.GT_DONGHANH || {};
  o += U.sec('CHIẾN LƯỢC ĐỒNG HÀNH TỚI KHI CÓ KẾT QUẢ',
    'Một nhà bỏ cuộc ở tháng thứ tư thì hệ thống làm gì — trả lời bằng cơ chế, không bằng lời hứa cố gắng');

  if(DH.y)
    o += '<div class="card" style="border-color:var(--gita-vien-1);background:var(--phu-1)">'+
      '<p class="sm" style="line-height:1.8">'+h(DH.y)+'</p></div>';

  o += '<div class="card mt2"><div class="tiny up muted mb">VÒNG CHẠY — LẶP MỖI TUẦN</div>'+
    '<div class="row wrap" style="gap:10px">'+ (DH.vong || []).map(function(x){
      return '<div class="card" style="flex:1;min-width:190px;padding:14px;border-top:3px solid '+x.c+'">'+
        '<div class="row" style="gap:8px;align-items:center">'+
          '<b class="mono" style="color:'+x.c+';font-size:16px">'+h(x.b)+'</b>'+
          '<b class="tiny up" style="letter-spacing:.08em">'+h(x.t)+'</b></div>'+
        '<p class="sm mt" style="line-height:1.65">'+h(x.d)+'</p></div>';
    }).join('') +'</div></div>';

  o += '<div class="tiny up muted mt2 mb">BỐN BĂNG — HỆ THỐNG ĐỔI CÁCH CHẠM THEO TÌNH TRẠNG, KHÔNG ĐỢI AI BÁO</div>';
  o += U.tbl(['Băng','Dấu hiệu','Hệ thống làm gì','Không làm gì'],
    (DH.bang || []).map(function(x){
      return ['<b class="sm" style="color:'+x.c+'">'+h(x.ma)+'</b><div class="tiny muted">'+h(x.ten)+'</div>',
              '<span class="sm">'+h(x.dau)+'</span>',
              '<span class="sm">'+h(x.lam)+'</span>',
              '<span class="sm" style="color:var(--gita-do-ink)">'+h(x.khong)+'</span>'];
    }));

  o += '<div class="card mt2"><div class="tiny up muted mb">NĂM CHỖ NHÀ HAY RỜI — VÀ VIỆC LÀM TRƯỚC KHI TỚI ĐÓ</div>'+
    (DH.roi || []).map(function(x, i){
      return '<div style="'+(i ? 'border-top:1px solid var(--line);padding-top:13px;margin-top:13px' : '')+'">'+
        '<div class="row" style="gap:9px;align-items:baseline;flex-wrap:wrap">'+
          '<span class="chip" style="color:var(--gita-do-ink);border-color:var(--gita-do)">'+h(x.khi)+'</span>'+
          '<b class="sm" style="flex:1;min-width:180px">'+h(x.vi)+'</b></div>'+
        '<p class="sm mt" style="line-height:1.75;color:var(--ok)">→ '+h(x.lam)+'</p></div>';
    }).join('') +'</div>';

  o += '<div class="card mt2" style="border-color:var(--gita-do)">'+
    '<div class="tiny up mb" style="color:var(--gita-do-ink)">GIỮ NHÀ Ở LẠI — NĂM CÁCH HỌC VIỆN KHÔNG DÙNG</div>'+
    (DH.cam || []).map(function(x, i){
      return '<div class="row'+(i ? ' mt2' : '')+'" style="gap:10px;align-items:flex-start">'+
        '<span style="color:var(--gita-do-ink);font-weight:700;flex:none">✕</span>'+
        '<p class="sm" style="flex:1;line-height:1.7">'+h(x)+'</p></div>';
    }).join('') +
    (DH.chot ? '<p class="sm mt2" style="line-height:1.8;font-weight:600;color:var(--gita);'+
      'padding-top:13px;border-top:1px dashed var(--phu-4)">'+h(DH.chot)+'</p>' : '')+
    '</div>';

  /* Ai làm việc với nhà mình */
  o += U.sec('AI LÀM VIỆC VỚI NHÀ MÌNH','Sáu vai, và mỗi vai có ranh giới rõ');
  o += U.tbl(['Vai','Làm gì cho nhà mình'], (G.GT_VAI || []).map(function(x){
    return ['<b class="sm">'+h(x.t)+'</b>', '<span class="sm">'+h(x.y)+'</span>'];
  }));

  /* Số liệu */
  o += U.sec('HỆ THỐNG CÓ GÌ','Chỉ ghi những con số hệ thống tự đếm được');
  o += '<div class="row wrap" style="gap:11px">'+ (G.GT_SO || []).map(function(x){
    return '<div class="card" style="flex:1;min-width:130px;text-align:center">'+
      '<b style="font-size:26px;color:var(--gita)">'+h(x.so)+'</b>'+
      '<div class="tiny muted mt" style="line-height:1.5">'+h(x.n)+'</div></div>';
  }).join('') +'</div>';

  /* Câu hỏi hay gặp */
  o += U.sec('CÂU HỎI HAY GẶP','Tám câu người ta hỏi nhiều nhất, trả lời thẳng');
  o += '<div class="card">'+ (G.GT_HOI || []).map(function(x, i){
    return '<div style="'+(i ? 'border-top:1px solid var(--line);padding-top:14px;margin-top:14px' : '')+'">'+
      '<b class="sm">'+ic('search','w-3 h-3')+' '+h(x.h)+'</b>'+
      '<p class="sm mt" style="line-height:1.8">'+h(x.d)+'</p></div>';
  }).join('') +'</div>';

  /* Bước tiếp theo */
  o += U.sec('BẮT ĐẦU TỪ ĐÂU','Bốn việc, làm được ngay hôm nay, mỗi việc dưới mười lăm phút');
  (G.GT_BUOC || []).forEach(function(x, i){
    var co = !!(G.VIEWS && G.VIEWS[x.v] && G.allowed && G.allowed(x.v));
    o += '<div class="card mt2">'+
      '<div class="row" style="gap:11px;align-items:center;flex-wrap:wrap">'+
        '<span style="width:30px;height:30px;flex:none;border-radius:10px;display:flex;align-items:center;'+
          'justify-content:center;background:var(--gita)18;color:var(--gita);font-weight:700">'+(i+1)+'</span>'+
        '<div style="flex:1;min-width:200px"><b>'+h(x.t)+'</b>'+
          '<div class="tiny muted mt" style="line-height:1.6">'+h(x.y)+'</div></div>'+
        (co ? '<button class="btn pri sm" data-v="'+h(x.v)+'">Mở</button>'
            : '<span class="chip" style="color:var(--ink-4)">Mở ở chặng sau</span>')+
      '</div></div>';
  });

  /* Phần cho đội ngũ: bản nói lại cho gọn */
  if(laNghe){
    o += U.sec('DÙNG BẢN NÀY KHI NGỒI TRƯỚC GIA ĐÌNH','Nói nguyên văn, đừng tự nghĩ thêm lời');
    o += '<div class="card" style="border-color:var(--gita-vien-1)">'+
      '<ul class="sm" style="line-height:1.8;padding-left:19px;margin:0">'+
       ['Buổi đầu chỉ dùng ba phần: một câu ở trên cùng, bốn điều làm được, và SÁU ĐIỀU KHÔNG LÀM. '+
        'Phần không làm được đọc đủ, không rút gọn — đó là phần mua được lòng tin.',
        'Không đọc phần năm tầng ở buổi đầu. Nhà mới nghe năm tầng thì thấy dài và thấy xa.',
        'Sứ mệnh và tầm nhìn đọc khi nhà HỎI về Học viện, không đọc để mở đầu. Mở đầu bằng '+
        'tầm nhìn 2030 là nói chuyện của mình trong lúc người ta đang lo chuyện tối nay.',
        'Bảng mục tiêu chỉ đưa ra khi nhà hỏi "bao lâu thì thấy gì". Đưa ra thì đọc luôn câu '+
        'ranh giới đứng trên bảng — đó là chuẩn quy trình, không phải cam kết kết quả.',
        'Phần chiến lược đồng hành để dành cho buổi thứ hai, và khi đọc thì đọc cả khối NĂM '+
        'CÁCH KHÔNG DÙNG. Bỏ khối ấy đi thì phần còn lại nghe ra như thủ thuật giữ khách.',
        'Câu hỏi về kết quả và thời gian: dùng nguyên văn hai câu trả lời trong phần Câu hỏi hay gặp. '+
        'Đừng hứa nhanh hơn để chốt cho được.',
        'Nhà nào hỏi về chi phí thì nói con số ngay, đừng vòng. Vòng vo về tiền tạo ra nghi ngờ.',
        'Nếu thấy nhà chưa hợp thì nói thẳng và hẹn lại — điều đó nằm ngay trong sáu điều không làm, '+
        'và nói ra thì gia đình tin phần còn lại hơn.']
       .map(function(x){ return '<li style="margin-bottom:7px">'+h(x)+'</li>'; }).join('')+
      '</ul></div>';
  }

  return o;
};

})();
