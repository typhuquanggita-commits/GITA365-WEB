/* ═══════════════════════════════════════════════════════════════
   GITA 365 — CHUỖI WOW → TRUNG THÀNH → FAN → LAN TOẢ  (9.99.220)

   Chủ hệ: "biên soạn full 5 tầng × 10 cấp BÁM SÁT hành trình đã coach từ
   đầu, và hệ sống cây tiền bám sát hành trình, để chuỗi 100.000 trải
   nghiệm WOW thúc đẩy khách trung thành → fan cuồng → lan toả."

   MÀN NÀY TRỎ, KHÔNG CHÉP. Nó KHÔNG dựng nội dung mới — nó xâu bốn hệ đã
   có vào ĐÚNG một hành trình:
     · Hành trình 50 cấp   → G.KTL_CAP50 · G.KTL_TL50 (điểm chạm WOW mỗi cấp)
     · Cây tiền 28 năng lực → G.CTV_CUM5 (5 cỗ máy nuôi từng tầng)
     · Nguồn WOW           → G.SUP_WOW (W1–W5)
     · Việc fan làm        → G.SUP_FAN (F1–F10)

   VÌ SAO hành trình LÀ vòng trung thành: bản thiết kế GITA-TẦNG-V1.0 đã
   viết arc ấy — T1 tò mò → T2 tin → T3 tự chủ → T4 FAN → T5 RỪNG (hệ sống
   nhờ họ). Fan và lan toả KHÔNG phải một chiến dịch cắm thêm; chúng là
   KẾT QUẢ của việc đi trọn hành trình. Màn này chỉ nói ra mạch ấy.

   Ánh xạ việc-fan / cụm-cây-tiền theo tầng là ĐỀ XUẤT (máy đề xuất, chủ hệ
   chốt) — suy từ NGHĨA của từng việc + arc của bản thiết kế, không phải
   con số bịa. Mã F/W/C đối chiếu kho thật; trỏ sai một mã là đỏ ở mục 107.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;
G.VIEWS = G.VIEWS || {};

/* Vòng trung thành = 5 tầng của hành trình. `fan`/`cum` là mã trỏ vào
   G.SUP_FAN / G.CTV_CUM5 — đối chiếu kho thật, không chép tên. */
G.CWOW_ARC = [
  { tang:'T1', pha:'THỬ',      chuyen:'tò mò → nứt vỏ',
    y:'WOW đầu tiên rất nhỏ: 60 giây mỗi tối, hạt tự đặt tên, không một bảng số. Người lạ thành người THỬ.',
    fan:['F1'], cum:['C1','C3'] },
  { tang:'T2', pha:'TIN',      chuyen:'nghi ngờ → điểm tựa',
    y:'Qua mùa gió đầu mà không gãy → tin không phải tin hệ, mà tin CHÍNH MÌNH đã đổi. Bắt đầu đánh giá, góp ý, dùng đều.',
    fan:['F1','F2','F6','F7'], cum:['C3','C2'] },
  { tang:'T3', pha:'GẮN BÓ',   chuyen:'làm theo → tự làm chủ',
    y:'Tự vận hành, có dòng thu thứ hai → gắn bó vì TỰ THẤY giá trị, không vì bị nhắc. Cần quyền thành viên, bảo mật cao.',
    fan:['F2','F8','F9'], cum:['C4','C2'] },
  { tang:'T4', pha:'FAN',      chuyen:'fan → đồng hành',
    y:'Kèm được người khác tự lập → thành FAN chủ động: giới thiệu khách, mở cửa hàng giá trị, tự truyền thông trong cộng đồng.',
    fan:['F3','F4','F5'], cum:['C2','C5'] },
  { tang:'T5', pha:'LAN TOẢ',  chuyen:'Cây Mẹ → kiến tạo kỷ nguyên',
    y:'Hệ SỐNG NHỜ HỌ — fan cuồng lan toả tối đa: một người 5.10 trở thành buổi-đầu (BĐ1) của một ai đó. Vòng khép.',
    fan:['F5','F10','F3'], cum:['C4','C5','C1'] }
];

/* Bốn luật giữ chuỗi WOW không biến thành cỗ máy chạy-cho-đủ-số. */
G.CWOW_LUAT = [
  { ten:'100.000 là CÁCH ĐẾM, không phải chỉ tiêu',
    y:'SUP-01 đã chốt: 10 tầng × 10.000 biến thể (câu gốc × trạng thái × thời khắc × ngôn ngữ). Đặt đích cho WOW là mời người chạy cho đủ số — cấm (SUP_WOW_LUAT.camDatChiTieu).' },
  { ten:'Fan sinh từ WOW THẬT — không mua, không farm',
    y:'Mười việc fan làm (F1–F10) là DẤU HIỆU của một fan, không phải mười cái ô để tối ưu. Lấy dấu hiệu làm đích thì được dấu hiệu mà mất cái sinh ra chúng.' },
  { ten:'Lan toả là KẾT QUẢ, không phải chiến dịch',
    y:'Vòng: WOW mỗi cấp → trung thành → fan (T4) → lan toả (T5). Không cắm một bước "kêu gọi chia sẻ" vào giữa hành trình — nó đến khi người ta đã đi trọn.' },
  { ten:'Tần suất dùng (F2) đo để BIẾT, không đặt đích',
    y:'L08 cấm giữ chân: một nhà mở app nhiều hơn KHÔNG phải một nhà khá hơn. Đếm để hiểu, không để thúc.' }
];

(function () {
  var U = G.U, h = U.h, ic = U.ic;
  function ten(list, kho, keyMa, keyTen){
    return (list||[]).map(function(ma){
      var r = (kho||[]).filter(function(x){return x[keyMa]===ma;})[0];
      return { ma:ma, ten: r ? (r[keyTen]||'') : '' };
    });
  }
  function chip(items, mau){
    return items.map(function(it){
      return '<span class="chip" style="border:1px solid '+mau+';margin:2px 4px 2px 0">'+
        h(it.ma)+(it.ten?(' · '+h(it.ten)):'')+'</span>';
    }).join('');
  }

  G.VIEWS['chuoi-wow'] = function () {
    if (!G.can || !G.can('pro_consult')) return U.lockCard ? U.lockCard() : U.empty('Cần gói nghề','Màn này khoá ở quyền nghề.');
    var CAP = G.KTL_CAP50 || [], TL = G.KTL_TL50 || {}, FAN = G.SUP_FAN || [], WOW = G.SUP_WOW || [], CUM = G.CTV_CUM5 || [];

    var o = U.ph({ eyebrow:'HÀNH TRÌNH · WOW · FAN · LAN TOẢ', ic:'spark', grad:1,
      t:'Chuỗi WOW bám sát hành trình',
      lead:'Bốn hệ — hành trình 50 cấp, cây tiền 28 năng lực, nguồn WOW, việc fan làm — xâu vào ĐÚNG một mạch: mỗi trải nghiệm WOW đẩy khách một bậc trên vòng trung thành, tới khi họ thành fan cuồng lan toả cả hệ.' });

    /* đếm điểm chạm WOW thật trong kho, theo tầng */
    var wowTang = {}; Object.keys(TL).forEach(function(k){ if(TL[k] && TL[k].wow){ var t='T'+k.split('.')[0]; wowTang[t]=(wowTang[t]||0)+1; } });
    var tongWow = Object.keys(wowTang).reduce(function(s,k){return s+wowTang[k];},0);

    o += U.bdSoHang([
      {k:'Tầng hành trình', v:'5', c:'var(--gita)', d:'THỬ→TIN→GẮN BÓ→FAN→LAN TOẢ'},
      {k:'Cấp có điểm chạm WOW', v:String(tongWow), c:'var(--gita-sau)', d:'trỏ KTL_TL50'},
      {k:'Việc fan làm', v:String(FAN.length), c:'var(--ok)', d:'F1–F10 · dấu hiệu, không phải đích'},
      {k:'Cách đếm WOW', v:'100.000', c:'var(--gold-2)', d:'10 tầng × 10.000 biến thể — SUP-01'}
    ]);

    /* Thang hành trình — RỪNG trên đỉnh xuống HẠT dưới gốc, như cây mọc */
    o += U.sec('VÒNG TRUNG THÀNH = HÀNH TRÌNH', 'Mỗi tầng một bậc. Fan (T4) và lan toả (T5) là KẾT QUẢ của đi trọn, không phải chiến dịch cắm thêm.');
    G.CWOW_ARC.slice().reverse().forEach(function (a) {
      var tt = CAP.filter(function(c){return c.tang===a.tang;});
      var tenTang = (G.KTL_TANG ? (G.KTL_TANG.filter(function(x){return x.ma===a.tang;})[0]||{}) : {});
      var mau = tenTang.mau || 'var(--gita)';
      o += '<div class="cw-tang" style="border-left:4px solid '+mau+'">'+
        '<div class="cw-dau">'+
          '<span class="cw-pha" style="background:'+mau+'">'+h(a.pha)+'</span>'+
          '<b>'+h(a.tang)+' · '+h(tenTang.ten||'')+(tenTang.biet?(' — '+h(tenTang.biet)):'')+'</b>'+
          '<span class="cw-chuyen">'+h(a.chuyen)+'</span>'+
        '</div>'+
        '<p class="tiny" style="line-height:1.7;margin:6px 0">'+h(a.y)+'</p>'+
        '<div class="cw-luoi">'+
          '<div class="cw-o"><span class="ktl-tl-nhan" style="color:'+mau+'">Điểm chạm WOW</span>'+
            '<button class="chip" data-v="kho-tai-lieu" style="cursor:pointer;border:1px solid '+mau+'">'+
              ic('vault','w-3 h-3')+(wowTang[a.tang]||0)+' cấp có WOW · mở kho</button></div>'+
          '<div class="cw-o"><span class="ktl-tl-nhan" style="color:var(--ok)">Việc fan làm</span><div>'+
            chip(ten(a.fan, FAN, 'ma', 'ten'), 'var(--ok)')+'</div></div>'+
          '<div class="cw-o"><span class="ktl-tl-nhan" style="color:var(--gita-sau)">Cây tiền nuôi tầng</span><div>'+
            chip(ten(a.cum, CUM, 'ma', 'ten'), 'var(--gita-sau)')+
            ' <button class="chip" data-v="cay-tien-vip" style="cursor:pointer;border:1px dashed var(--gita-vien-2)">mở cây tiền</button></div></div>'+
        '</div></div>';
    });

    /* Năm nguồn WOW — vì sao người ở lại */
    o += U.sec('NĂM NGUỒN WOW (VÌ SAO Ở LẠI)', 'Đây là thứ sinh ra fan — không phải mười việc fan làm.');
    o += '<div class="grid g2">'+ WOW.map(function(w){
      return '<div class="card pad-sm"><b class="sm">'+h(w.ma)+' · '+h(w.ten||'')+'</b></div>';
    }).join('') +'</div>';

    /* Bốn luật */
    o += U.sec('BỐN LUẬT GIỮ CHUỖI WOW KHÔNG THÀNH CỖ MÁY CHẠY SỐ', 'Vì sao đếm được mà cấm đặt đích.');
    o += '<div class="card">'+ U.tbl(['Luật','Vì sao'],
      G.CWOW_LUAT.map(function(l){ return ['<b class="sm">'+h(l.ten)+'</b>','<span class="tiny">'+h(l.y)+'</span>']; })) +'</div>';

    o += '<div class="card pad-sm mt" style="border-color:var(--gold-2)">'+ic('star','w-4 h-4')+
      ' <b class="sm">Mạch một câu:</b> <span class="tiny">một hạt tò mò được chạm đúng WOW mỗi cấp → tin → tự chủ → thành fan kèm người khác → thành Cây Mẹ gieo cả rừng. Fan cuồng lan toả là <b>đỉnh của hành trình</b>, không phải một nút "chia sẻ".</span></div>';

    return o;
  };
})();
