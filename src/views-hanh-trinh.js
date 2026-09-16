/* ═══════════════════════════════════════════════════════════════
   GITA 365 · v8.5 — BA MÀN HÀNH TRÌNH
   · hanh-trinh-12 : hành trình trải nghiệm học viên, 12 chặng
   · ref-gita      : hệ thống một nhà giới thiệu một nhà
   · khach-lon     : chăm sóc khách hàng lớn, tầng 2 → 5
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;

(function(){
var U = G.U, h = U.h, ic = U.ic;
G.VIEWS = G.VIEWS || {};

function chuaCo(ten){
  return '<div class="card"><p class="sm dim">Phần '+h(ten)+' nằm trong kho nghề. '+
    'Đăng nhập bằng vai được cấp phép để mở.</p></div>';
}

/* ═══════════ HÀNH TRÌNH 12 CHẶNG ═══════════ */
G.VIEWS['hanh-trinh-12'] = function(){
  var DS = G.HANHTRINH12, TRU = G.TRU_GITA;
  var o = U.ph({eyebrow:'HỌC VIỆN GITA', ic:'map', grad:1,
    t:'Hành trình trải nghiệm của học viên',
    lead:'Mười hai chặng, bốn trụ. Sơ đồ treo tường chỉ nói mỗi chặng LÀM GÌ. '+
         'Ở đây mỗi chặng còn có: ai chịu trách nhiệm, dấu hiệu đã xong, việc phải làm khi chưa xong, '+
         'và điểm chạm WOW đặt đúng lúc.'});
  if(!DS || !TRU) return o + chuaCo('hành trình 12 chặng');

  o += '<div class="row wrap mt2" style="gap:12px">'+ TRU.map(function(t){
    return '<div class="card" style="flex:1;min-width:200px;border-left:3px solid '+t.c+'">'+
      '<div class="row" style="gap:8px;align-items:center">'+ic(t.ic,'w-4 h-4')+
        '<b style="color:'+t.c+'">'+h(t.ten)+'</b></div>'+
      '<p class="sm dim mt" style="line-height:1.6">'+h(t.y)+'</p>'+
      '<p class="tiny muted mt">Chặng '+t.chang.join(' · ')+'</p></div>';
  }).join('') +'</div>';

  TRU.forEach(function(t){
    o += U.sec(t.ten, t.y);
    DS.filter(function(d){ return d.tru === t.ma; }).forEach(function(d){
      o += '<div class="card mt2" style="border-left:3px solid '+t.c+'">'+
        '<div class="row" style="gap:10px;align-items:baseline;flex-wrap:wrap">'+
          '<span style="width:34px;height:34px;border-radius:11px;display:grid;place-items:center;'+
            'font-weight:900;background:'+t.c+'22;color:'+t.c+'">'+
            String(d.no).padStart(2,'0')+'</span>'+
          '<b style="font-size:16px;flex:1;min-width:200px">'+h(d.ten)+'</b>'+
          '<span class="chip">'+h(d.ai)+'</span>'+
          '<span class="chip">'+h(d.ngay)+'</span></div>'+
        '<div class="mt">'+U.list(d.viec, t.c)+'</div>'+
        '<div class="row wrap mt2" style="gap:12px;align-items:stretch">'+
          '<div style="flex:1;min-width:240px;border-left:2px solid var(--ok);padding-left:11px">'+
            '<div class="tiny up mb" style="color:var(--ok)">XONG KHI</div>'+
            '<p class="sm" style="line-height:1.6">'+h(d.xongKhi)+'</p></div>'+
          '<div style="flex:1;min-width:240px;border-left:2px solid var(--gita-do);padding-left:11px">'+
            '<div class="tiny up mb" style="color:var(--gita-do-ink)">CHƯA XONG THÌ</div>'+
            '<p class="sm" style="line-height:1.6">'+h(d.chuaXong)+'</p>'+
            '<p class="tiny mt" style="line-height:1.55;color:var(--ink-3)">→ '+h(d.lamGi)+'</p></div>'+
        '</div>'+
        '<div class="mt2" style="padding:11px 14px;border-radius:12px;background:var(--gita-mo-1);'+
          'border:1px solid var(--gita-vien-1)">'+
          '<div class="tiny up mb" style="color:var(--gita-ink)">'+ic('star','w-3 h-3')+' ĐIỂM CHẠM WOW</div>'+
          '<p class="sm" style="line-height:1.65">'+h(d.wow)+'</p></div>'+
        '<p class="tiny muted mt">Đo bằng: '+h(d.doBang)+'</p>'+
      '</div>';
    });
  });

  var L = G.LOI_HUA_GITA;
  if(L) o += '<div class="card mt2" style="border-color:var(--gita)">'+
    '<b style="font-size:16px;color:var(--gita-ink)">'+h(L.cau)+'</b>'+
    '<p class="sm mt" style="line-height:1.7">'+h(L.y)+'</p>'+
    '<p class="sm mt" style="font-style:italic;color:var(--gita-do-ink)">'+h(L.moi)+'</p>'+
    '<p class="tiny muted mt">'+h(L.hotline)+' · '+h(L.web)+' · '+h(L.noi)+'</p></div>';
  return o;
};

/* ═══════════ HỆ THỐNG GIỚI THIỆU ═══════════ */
G.VIEWS['ref-gita'] = function(){
  var o = U.ph({eyebrow:'MỘT NHÀ GIỚI THIỆU MỘT NHÀ', ic:'share', grad:1,
    t:'Hệ thống giới thiệu của GITA',
    lead:'GITA lớn lên bằng lời giới thiệu, không bằng quảng cáo. Mà lời giới thiệu có quy trình của nó — '+
         'đọc lại từ hai hệ thống BNI của anh Quang, dịch sang ngôn ngữ của Học viện.'});
  if(!G.REF_CHUAN) return o + chuaCo('hệ thống giới thiệu');

  var R = G.REF_CHUAN;
  o += U.sec('CHÂN DUNG MỘT LỜI GIỚI THIỆU CHUẨN','Năm vòng, thiếu một vòng là lời giới thiệu rơi');
  o += '<div class="row wrap" style="gap:12px">'+ R.vong.map(function(v, i){
    return '<div class="card" style="flex:1;min-width:220px;border-left:3px solid var(--gita)">'+
      '<span class="mono tiny" style="color:var(--gita)">VÒNG '+(i+1)+'</span>'+
      '<b class="sm" style="display:block;margin:3px 0 5px">'+h(v.t)+'</b>'+
      '<p class="sm dim" style="line-height:1.6">'+h(v.y)+'</p></div>';
  }).join('') +'</div>';

  o += U.sec('BỘ TRUYỀN THÔNG BA CẤP','Ba mươi giây trước, tám phút sau — đảo lại là mất người nghe');
  (G.TRUYENTHONG3||[]).forEach(function(t){
    o += '<div class="card mt2">'+
      '<div class="row" style="gap:10px;align-items:center;flex-wrap:wrap">'+ic(t.ic,'w-4 h-4')+
        '<b style="font-size:16px">'+h(t.ten)+'</b>'+
        t.hoi.map(function(x){ return '<span class="chip">'+h(x)+'</span>'; }).join('')+'</div>'+
      '<p class="sm mt" style="line-height:1.7">'+h(t.gita)+'</p>'+
      '<div class="mt" style="padding:11px 14px;border-radius:12px;background:var(--phu-1);'+
        'border-left:3px solid var(--gita)"><p class="sm" style="line-height:1.65;font-style:italic">"'+
        h(t.mau)+'"</p></div>'+
      '<p class="tiny mt" style="color:var(--gita-do-ink)">'+ic('shield','w-3 h-3')+' '+h(t.luat)+'</p>'+
    '</div>';
  });

  o += U.sec('MƯỜI SÁU BƯỚC BIẾN MỘT LỜI GIỚI THIỆU THÀNH THÀNH QUẢ','Ba giai đoạn');
  (G.REF_GIAIDOAN||[]).forEach(function(g){
    o += '<div class="mt2" style="border-left:3px solid '+g.c+';padding-left:13px">'+
      '<b style="color:'+g.c+'">'+h(g.ten)+'</b></div>';
    o += U.tbl(['Bước','Việc'], (G.REF16||[]).filter(function(x){ return x.gd === g.gd; })
      .map(function(x){
        return ['<b class="mono" style="color:'+g.c+'">'+String(x.no).padStart(2,'0')+'</b> '+
                '<b class="sm">'+h(x.ten)+'</b>', '<span class="sm">'+h(x.y)+'</span>'];
      }));
  });

  o += U.sec('BẢY BƯỚC TRẢI NGHIỆM CỦA MỘT NHÀ','Tạo giá trị → trải nghiệm tích cực → niềm tin → quan hệ bền vững');
  o += U.tbl(['Bước','Ở GITA nghĩa là','Làm','Hỏng khi'], (G.TN7||[]).map(function(x){
    return ['<b class="mono">'+x.no+'</b> <b class="sm">'+h(x.ten)+'</b>'+
              '<div class="tiny muted">'+h(x.y)+'</div>',
      '<span class="sm">'+h(x.gita)+'</span>',
      '<span class="sm">'+h(x.lam)+'</span>',
      '<span class="tiny" style="color:var(--gita-do-ink)">'+h(x.hong)+'</span>'];
  }));

  o += U.sec('NĂM LỐI CHIẾN LƯỢC','Của cả hai hệ thống — trùng nhau ở bốn trên năm');
  o += '<div class="row wrap" style="gap:10px">'+ (G.REF_LOI5||[]).map(function(x){
    return '<div class="card" style="flex:1;min-width:190px">'+
      '<b class="sm" style="color:var(--gita-ink)">'+x.no+'. '+h(x.ten)+'</b>'+
      '<p class="sm dim mt" style="line-height:1.55">'+h(x.y)+'</p></div>';
  }).join('') +'</div>';

  o += '<div class="card mt2" style="border-color:var(--gita-do)">'+
    '<p class="sm" style="line-height:1.8;font-style:italic">"Ref không chỉ là một mối giới thiệu. '+
    'Ref là một hành trình trải nghiệm được thiết kế có chủ đích để tạo niềm tin, giá trị và giới thiệu tầng sâu."</p>'+
    '<p class="sm mt" style="font-weight:700;color:var(--gita-do-ink)">Thiết kế đúng hành trình — Ref sẽ sinh Ref.</p></div>';
  return o;
};

/* ═══════════ CHĂM SÓC KHÁCH HÀNG LỚN ═══════════ */
G.VIEWS['khach-lon'] = function(){
  var o = U.ph({eyebrow:'TẦNG 2 → 5', ic:'crown', grad:1,
    t:'Chăm sóc khách hàng lớn',
    lead:'Nguyên tắc 20/80: hai tầng trên là 20% số nhà nhưng 80% giá trị. '+
         'Dồn nguồn lực hữu hạn vào đúng chỗ, và nói thẳng khi một nhà không hợp với phương pháp.'});
  if(!G.KHACH_TANG) return o + chuaCo('chăm sóc khách hàng lớn');

  var N = G.KHACHLON_NGUON;
  if(N) o += '<div class="card mt2" style="border-color:var(--gita-vien-1)">'+
    '<div class="tiny up mb">BIÊN SOẠN TỪ</div>'+
    '<b class="sm">'+h(N.ten)+'</b>'+
    '<p class="tiny muted mt">'+h(N.tacGia)+' · '+h(N.bo)+' · '+h(N.chup)+'</p>'+
    '<p class="tiny mt" style="color:var(--gita-do-ink);line-height:1.6">'+ic('shield','w-3 h-3')+' '+
      h(N.luuY)+'</p></div>';

  o += U.sec('BỐN TẦNG VÀ NHỊP CHẠM','Hiệu quả thăm hỏi = số lần thăm hỏi × chất lượng thăm hỏi');
  (G.KHACH_TANG||[]).forEach(function(t){
    o += '<div class="card mt2" style="border-left:3px solid '+t.c+'">'+
      '<div class="row" style="gap:10px;align-items:baseline;flex-wrap:wrap">'+
        '<b style="font-size:18px;color:'+t.c+'">'+h(t.ten)+'</b>'+
        '<span class="chip" style="color:'+t.c+'">'+h(t.gita)+'</span>'+
        '<span class="grow"></span>'+
        '<span class="chip" style="border-color:'+t.c+'55;color:'+t.c+'">'+ic('calendar','w-3 h-3')+' '+h(t.nhip)+'</span>'+
        '<span class="tiny muted">'+h(t.trang)+'</span></div>'+
      '<p class="sm mt" style="line-height:1.65">'+h(t.tieuChi)+'</p>'+
      '<div class="mt">'+U.list(t.phucVu, t.c)+'</div>'+
      '<div class="mt" style="padding:10px 13px;border-radius:11px;background:var(--phu-1)">'+
        '<span class="tiny up muted">Ở GITA LÀ</span>'+
        '<p class="sm mt" style="line-height:1.6">'+h(t.gitaLa)+'</p></div>'+
    '</div>';
  });

  o += U.sec('NĂM TẦNG PHỤC VỤ','Tâm của cả năm tầng: ' + (G.TAM_NAM_TANG||''));
  o += U.tbl(['Tầng','Ở GITA'], (G.NAM_TANG_PHUCVU||[]).map(function(x){
    return ['<b class="sm">'+x.no+'. '+h(x.t)+'</b>', '<span class="sm">'+h(x.gita)+'</span>'];
  }));

  o += U.sec('BỐN NẤC QUAN HỆ','Từ người bán tới đồng minh — đích của tầng 5');
  o += U.tbl(['Nấc','Ở GITA'], (G.NAC_QUANHE||[]).map(function(x){
    return ['<b class="sm">'+x.no+'. '+h(x.t)+'</b>', '<span class="sm">'+h(x.gita)+'</span>'];
  }));

  o += U.sec('HỒ SƠ 68 ĐIỂM','Bảy khối. Không phải để moi tin — để nhớ đúng thứ người ta đã kể');
  o += '<div class="row wrap" style="gap:12px">'+ (G.HOSO68||[]).map(function(k){
    return '<div class="card" style="flex:1;min-width:250px">'+
      '<b class="sm" style="color:var(--gita-ink)">'+k.khoi+'. '+h(k.ten)+'</b>'+
      U.list(k.muc)+'</div>';
  }).join('') +'</div>';
  o += '<p class="tiny muted mt" style="line-height:1.6">'+ic('shield','w-3 h-3')+
    ' Luật kèm theo, trang 97: ghi lại những gì gia đình muốn kể, KHÔNG ghi những gì họ không muốn tiết lộ. '+
    'Và phải cho họ biết vì sao mình nhớ được sở thích của họ.</p>';

  var NT = G.NHANTANG;
  if(NT){
    o += U.sec('NHÂN TẦNG — MỘT NHÀ GIỚI THIỆU MỘT NHÀ', NT.congThuc);
    o += '<div class="card"><p class="sm" style="line-height:1.7">'+h(NT.y)+'</p></div>';
    o += U.tbl(['Con số','Nghĩa là','Nguồn'], NT.so.map(function(x){
      return ['<b class="sm">'+h(x.t)+'</b>', '<span class="sm">'+h(x.n)+'</span>',
              '<span class="tiny muted">'+h(x.trang)+'</span>'];
    }));
    o += '<div class="row wrap mt2" style="gap:10px">'+ NT.cach.map(function(x){
      return '<div class="card" style="flex:1;min-width:230px;border-color:var(--gita-vien-1)">'+
        '<b class="sm" style="color:var(--gita-ink)">'+h(x.t)+'</b>'+
        '<p class="sm dim mt" style="line-height:1.6">'+h(x.y)+'</p></div>';
    }).join('') +'</div>';
  }

  o += U.sec('KHI MỘT NHÀ KHÔNG HÀI LÒNG','Năm bước, không bỏ bước nào');
  o += U.tbl(['Bước','Làm gì'], (G.NAM_BUOC_KHIEUNAI||[]).map(function(x){
    return ['<b class="sm">'+x.no+'. '+h(x.t)+'</b>', '<span class="sm">'+h(x.y)+'</span>'];
  }));

  var V = G.VISAO_ROIDI;
  if(V) o += '<div class="card mt2" style="border-color:var(--gita-do)">'+
    '<div class="up mb" style="color:var(--gita-do-ink)">'+ic('bell','w-4 h-4')+' VÌ SAO MỘT NHÀ RỜI ĐI</div>'+
    '<div class="row wrap" style="gap:14px">'+
      '<div style="flex:1;min-width:230px"><div class="tiny up muted mb">KHÔNG KIỂM SOÁT ĐƯỢC</div>'+
        U.list(V.khongKiemSoat)+'</div>'+
      '<div style="flex:1;min-width:230px"><div class="tiny up mb" style="color:var(--gita-do-ink)">KIỂM SOÁT ĐƯỢC</div>'+
        U.list(V.kiemSoatDuoc, 'var(--gita-do)')+'</div></div>'+
    '<p class="sm mt2" style="line-height:1.7;font-style:italic">"'+h(V.cauChot)+'"</p></div>';

  o += U.sec('MƯỜI HAI NGUYÊN TẮC VÀNG','Cho người trực tiếp ngồi với gia đình');
  o += '<div class="row wrap" style="gap:9px">'+ (G.MUOIHAI_NGUYENTAC||[]).map(function(x){
    return '<div class="card pad-sm" style="flex:1;min-width:210px">'+
      '<b class="sm"><span class="mono" style="color:var(--gita)">'+String(x.no).padStart(2,'0')+'</span> '+
      h(x.t)+'</b></div>';
  }).join('') +'</div>';

  o += U.sec('CÂU CHỮ DÙNG LẠI NGUYÊN VĂN','Trích từ sách, có ghi trang để tra lại');
  o += '<div class="tlg-doan">'+ (G.KHACHLON_CAU||[]).map(function(x){
    return '<p style="font-style:italic">"'+h(x.c)+'" <span class="tiny muted">— '+h(x.t)+'</span></p>';
  }).join('') +'</div>';
  return o;
};

})();
