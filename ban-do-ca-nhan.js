/* ═══════════════════════════════════════════════════════════════
   GITA 365 · v8.7 — MÀN HÌNH BẢN ĐỒ CÁ NHÂN

   Mười một ô, đi theo đúng thứ tự anh Quang đặt ra, từ TẠI SAO cho tới
   TÀI NĂNG — rồi vòng lại sửa ô 4.

   Ba quyết định về cách làm màn này, nói rõ ra để sau này ai sửa cũng biết:

   1. KHÔNG KHOÁ CỨNG Ô SAU. Thứ tự là thật và có lý do, nhưng khoá cứng
      thì lại đẻ ra đúng cái màn hình "phần này chưa mở" mà anh Quang đã
      bảo dẹp. Nên ô nào cũng bấm vào được; ô chưa tới lượt thì nói rõ nó
      dựa vào ô nào và vì sao nên viết ô kia trước. Người dùng tự quyết.

   2. LƯU NGAY KHI RỜI Ô NHẬP. Không bắt nhớ bấm nút. Nút Lưu vẫn còn cho
      ai muốn chắc, nhưng rời ô là đã lưu rồi. Mất chữ vì quên bấm nút là
      lỗi của phần mềm, không phải lỗi của người viết.

   3. RIÊNG TỪNG NGƯỜI. Bản đồ này nằm trong G.S — hồ sơ của chính tài
      khoản đang đăng nhập — và đi lên máy chủ theo đường đồng bộ TỪNG
      TRƯỜNG, khoá theo uid. Không đi qua đường cụm cài đặt chung, vì cụm
      chung là đường dùng chung: đặt bản đồ riêng vào đó là mở hồ sơ của
      nhà này cho nhà khác đọc.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;

(function(){
var U = G.U, h = U.h, ic = U.ic;
G.VIEWS = G.VIEWS || {};

var DAI_TOI_THIEU = 12;      /* dưới ngần này ký tự thì coi như chưa viết */
var moDang = null;           /* ô đang mở, giữ qua các lần vẽ lại */
var moSau = {};              /* ô nào đang mở phần năm cấp độ */

/* ─── Kho riêng của tài khoản ─── */
function kho(){
  if(!G.S) return {};
  if(!G.S.bando || typeof G.S.bando !== 'object') G.S.bando = {};
  return G.S.bando;
}
function doc(k){ var v = kho()[k]; return v == null ? '' : v; }
function ghi(k, v){
  kho()[k] = v;
  if(G.danhDau) G.danhDau('bando', k);
  if(G.save) G.save();
}
G.bdcnDoc = doc;
G.bdcnGhi = ghi;

/* ─── Ba hệ ngôn từ ─── */
function nhom(){
  var n = G.NHOM_NGONNGU ? G.NHOM_NGONNGU() : 'nghe';
  return n === 'hocvien' ? 'hv' : (n === 'phuhuynh' ? 'ph' : 'ng');
}
function loi(o){
  if(!o) return '';
  if(typeof o === 'string') return o;
  var n = nhom();
  return o[n] || o.ng || o.ph || o.hv || '';
}
G.bdcnLoi = loi;

/* ─── Xong hay chưa ─── */
function daViet(k){ return String(doc(k) || '').trim().length >= DAI_TOI_THIEU; }

function demViec(){
  var n = 0;
  for(var i = 1; i <= 10; i++){
    var v = doc('viec' + i);
    if(v && String(v.t || '').trim()) n++;
  }
  return n;
}
function demQuyTac(){
  var n = 0;
  for(var i = 1; i <= 7; i++){
    var v = doc('qt' + i);
    if(v && String(v.t || '').trim()) n++;
  }
  return n;
}

function xongO(b){
  if(b.muoiViec) return demViec() >= 10;
  if(b.quyTac)   return demQuyTac() >= 7;
  return (b.batBuoc || []).every(daViet);
}
function dangDo(b){
  if(b.muoiViec) return demViec() > 0;
  if(b.quyTac)   return demQuyTac() > 0;
  return (b.o || []).some(function(x){ return String(doc(x.k) || '').trim().length > 0; });
}

/* Phần trăm hoàn thành cả bản đồ — dùng cả ở màn Tôi và ở bảng KPI */
G.bdcnPhanTram = function(){
  var ds = G.BDCN || [];
  if(!ds.length) return 0;
  var n = 0;
  ds.forEach(function(b){ if(xongO(b)) n++; });
  return Math.round(n / ds.length * 100);
};
G.bdcnXongMay = function(){
  var n = 0;
  (G.BDCN || []).forEach(function(b){ if(xongO(b)) n++; });
  return n;
};
/* Ô đầu tiên chưa xong — chỗ nên đi tiếp */
G.bdcnOTiep = function(){
  var ds = G.BDCN || [];
  for(var i = 0; i < ds.length; i++) if(!xongO(ds[i])) return ds[i];
  return null;
};

/* ═══════════════ VẼ MỘT Ô ═══════════════ */
function veO(b, i, oTruoc){
  var xong = xongO(b), do_ = dangDo(b);
  var mo = (moDang === b.ma);
  var mau = xong ? 'var(--ok)' : (do_ ? b.c : 'var(--line)');
  var trangThai = xong ? 'Đã xong' : (do_ ? 'Đang viết dở' : 'Chưa viết');

  var o = '<div class="card mt2" id="bd-'+h(b.ma)+'" style="border-color:'+mau+';'+
    (mo ? 'box-shadow:0 2px 18px rgba(0,0,0,.07)' : '')+'">';

  /* ── Đầu ô: bấm vào là mở ── */
  o += '<div class="row" data-bd-mo="'+h(b.ma)+'" style="gap:12px;align-items:center;cursor:pointer;flex-wrap:wrap">'+
    '<span style="width:34px;height:34px;border-radius:11px;flex:none;display:flex;'+
      'align-items:center;justify-content:center;background:'+b.c+'18;color:'+b.c+';font-weight:700">'+
      b.so+'</span>'+
    '<div style="flex:1;min-width:200px">'+
      '<b style="font-size:16px">'+h(loi(b.ten))+'</b>'+
      '<div class="tiny muted mt" style="line-height:1.5">'+h(loi(b.hoi))+'</div>'+
    '</div>'+
    '<span class="chip" style="'+(xong ? 'color:var(--ok);border-color:var(--ok)' :
        do_ ? 'color:'+b.c : 'color:var(--ink-4)')+'">'+
      (xong ? '✓ ' : '')+h(trangThai)+'</span>'+
    ic('chev', 'w-4 h-4')+
  '</div>';

  if(!mo){
    /* Đóng lại vẫn phải nói được nó chứa gì — không để một dòng tiêu đề trống trơn */
    o += '<p class="tiny dim mt" style="line-height:1.6">'+
      h(String(b.y || '').split('\n')[0].slice(0, 150))+'…</p>'+
      '<button class="btn ghost sm mt" data-bd-mo="'+h(b.ma)+'">Mở ô này để viết</button>';
    return o + '</div>';
  }

  /* ── Vì sao có ô này ── */
  o += '<div class="mt2" style="padding:13px 15px;border-radius:12px;background:var(--phu-1)">'+
    '<span class="tiny up muted">VÌ SAO CÓ Ô NÀY</span>'+
    '<div class="sm mt" style="line-height:1.75">'+U.nl(b.y)+'</div></div>';

  /* ── Nếu ô trước chưa xong thì nói thẳng, nhưng không chặn ── */
  if(oTruoc && !xongO(oTruoc)){
    o += '<div class="mt2" style="padding:11px 14px;border-radius:11px;'+
      'background:#B4720F14;border:1px solid #B4720F44">'+
      '<b class="sm">'+ic('bell','w-3 h-3')+' Ô này dựa vào ô '+oTruoc.so+'</b>'+
      '<p class="tiny mt" style="line-height:1.6">Ô '+oTruoc.so+' — '+h(loi(oTruoc.ten))+' — chưa xong. '+
      'Viết ô này trước vẫn được, không ai chặn. Chỉ là viết xong ô '+oTruoc.so+' rồi quay lại đây '+
      'thì đỡ phải sửa hai lần.</p>'+
      '<button class="btn ghost sm mt" data-bd-mo="'+h(oTruoc.ma)+'">Sang ô '+oTruoc.so+' trước</button></div>';
  }

  /* ── Làm thế nào ── */
  o += '<div class="mt2"><span class="tiny up muted">LÀM THẾ NÀO</span>';
  o += '<ol class="sm mt" style="line-height:1.75;padding-left:20px;margin:0">'+
    (b.lam || []).map(function(x){ return '<li style="margin-bottom:5px">'+h(x)+'</li>'; }).join('')+
  '</ol></div>';

  /* ── Ví dụ, ghi rõ là ví dụ ── */
  o += '<div class="mt2" style="padding:12px 15px;border-radius:12px;background:'+b.c+'0E;'+
    'border-left:3px solid '+b.c+'">'+
    '<span class="tiny up" style="color:'+b.c+'">VÍ DỤ — CHỈ ĐỂ THAM KHẢO, ĐỪNG CHÉP</span>'+
    '<p class="sm mt" style="line-height:1.7">'+h(loi(b.viDu))+'</p></div>';

  /* ── Phần viết ── */
  o += '<div class="mt2">';
  if(b.muoiViec)      o += veMuoiViec();
  else if(b.quyTac)   o += veQuyTac();
  else o += (b.o || []).map(function(x){
    return '<div class="mt2">'+
      '<label class="tiny up muted" for="bd_'+h(x.k)+'">'+h(x.nhan)+
        ((b.batBuoc || []).indexOf(x.k) >= 0 ? ' <span style="color:var(--gita-do-ink)">· bắt buộc</span>' : '')+
      '</label>'+
      '<textarea id="bd_'+h(x.k)+'" class="inp mt" data-bdo="'+h(x.k)+'" rows="'+(x.dong || 3)+'" '+
        'placeholder="'+h(x.goi || '')+'" style="width:100%;line-height:1.65;resize:vertical">'+
        h(doc(x.k))+'</textarea></div>';
  }).join('');
  o += '</div>';

  /* ── Ranh giới đạt và chưa đạt ── */
  o += '<div class="row wrap mt2" style="gap:11px">'+
    '<div class="card" style="flex:1;min-width:220px;border-left:3px solid var(--ok);padding:12px 14px">'+
      '<span class="tiny up" style="color:var(--ok)">ĐẠT KHI</span>'+
      '<p class="tiny mt" style="line-height:1.6">'+h(b.xong)+'</p></div>'+
    '<div class="card" style="flex:1;min-width:220px;border-left:3px solid var(--gita-do);padding:12px 14px">'+
      '<span class="tiny up" style="color:var(--gita-do-ink)">CHƯA ĐẠT KHI</span>'+
      '<p class="tiny mt" style="line-height:1.6">'+h(b.chua)+'</p></div></div>';

  /* ── Năm cấp độ ── */
  var moC = !!moSau[b.ma];
  o += '<div class="mt2"><button class="btn ghost sm" data-bd-sau="'+h(b.ma)+'">'+
    ic('chart','w-3 h-3')+' '+(moC ? 'Đóng' : 'Mở')+' năm cấp độ đọc ô này (C1 → C5)</button>';
  if(moC){
    o += '<div class="mt2" style="padding:12px 15px;border-radius:12px;background:var(--phu-1)">'+
      (b.sau || []).map(function(s, j){
        return '<div style="'+(j ? 'border-top:1px solid var(--line);padding-top:9px;margin-top:9px' : '')+
          ';line-height:1.65" class="tiny">'+h(s)+'</div>';
      }).join('')+'</div>';
  }
  o += '</div>';

  /* ── Câu mang theo ── */
  if(b.mang) o += '<p class="sm mt2" style="line-height:1.7;font-style:italic;color:var(--ink-3)">'+
    ic('quote','w-3 h-3')+' '+h(b.mang)+'</p>';

  /* ── Nút ── */
  o += '<div class="row mt2" style="gap:9px;flex-wrap:wrap">'+
    '<button class="btn pri sm" data-bd-luu="'+h(b.ma)+'">'+ic('check','w-3 h-3')+' Lưu ô '+b.so+'</button>'+
    (b.noi ? '<button class="btn ghost sm" data-v="'+h(b.noi.v)+'">'+h(b.noi.t)+'</button>' : '')+
    (i < (G.BDCN.length - 1)
      ? '<button class="btn ghost sm" data-bd-mo="'+h(G.BDCN[i+1].ma)+'">Sang ô '+(b.so+1)+' →</button>'
      : '<button class="btn ghost sm" data-bd-mo="B04">Quay lại ô 4 để sửa lộ trình</button>')+
  '</div>';

  return o + '</div>';
}

/* ═══════════════ Ô 6 · MƯỜI VIỆC ═══════════════ */
function veMuoiViec(){
  var nh = nhom();
  var o = '<div class="row" style="gap:9px;flex-wrap:wrap;align-items:center">'+
    '<button class="btn ghost sm" data-bd-mau="viec">'+ic('arrow','w-3 h-3')+
      ' Lấy mười việc mẫu cho vai của tôi</button>'+
    '<span class="tiny muted">Lấy về rồi sửa ít nhất ba dòng — mười việc đi mượn nguyên khối thì không giữ được lâu.</span>'+
  '</div>';

  o += '<div class="mt2">';
  for(var i = 1; i <= 10; i++){
    var v = doc('viec' + i) || {};
    var nhip = v.n || 'ngay';
    o += '<div class="row" style="gap:8px;align-items:center;flex-wrap:wrap;'+
      (i > 1 ? 'border-top:1px solid var(--line);padding-top:9px;' : '')+'margin-top:9px">'+
      '<span class="mono tiny" style="width:22px;color:var(--ink-4)">'+i+'</span>'+
      '<input class="inp" data-bdviec="'+i+'" value="'+h(v.t || '')+'" '+
        'placeholder="Việc thứ '+i+'" style="flex:1;min-width:190px">'+
      '<select class="inp" data-bdnhip="'+i+'" style="width:130px;flex:none">'+
        (G.BDCN_NHIP || []).map(function(n){
          return '<option value="'+n.ma+'"'+(nhip === n.ma ? ' selected' : '')+'>'+h(n.ten)+'</option>';
        }).join('')+
      '</select>'+
      '<button class="btn ghost sm" data-bdsao="'+i+'" title="Đánh dấu là một trong ba việc quan trọng nhất" '+
        'style="flex:none;'+(v.sao ? 'color:#B4720F;border-color:#B4720F' : '')+'">'+
        (v.sao ? '★' : '☆')+'</button>'+
      (v.v ? '<button class="btn ghost sm" data-v="'+h(v.v)+'" style="flex:none">Mở màn</button>' : '')+
    '</div>';
  }
  o += '</div>';

  var n = demViec(), sao = 0;
  for(var j = 1; j <= 10; j++){ var x = doc('viec' + j); if(x && x.sao) sao++; }
  o += '<p class="tiny mt2" style="color:'+(n >= 10 ? 'var(--ok)' : 'var(--ink-4)')+'">'+
    'Đã điền '+n+'/10 việc · đánh dấu '+sao+' việc quan trọng nhất'+
    (sao > 3 ? ' — đánh dấu quá ba việc thì không còn là ba việc quan trọng nhất nữa.' : '')+'</p>';
  if(nh === 'ng') o += '<p class="tiny muted">Vai của anh chị đọc bản mẫu của đội ngũ. '+
    'Học viên và phụ huynh có bản mẫu riêng.</p>';
  return o;
}

/* ═══════════════ Ô 9 · BẢY QUY TẮC ═══════════════ */
function veQuyTac(){
  var o = '<div class="row" style="gap:9px;flex-wrap:wrap;align-items:center">'+
    '<button class="btn ghost sm" data-bd-mau="quytac">'+ic('arrow','w-3 h-3')+
      ' Lấy bộ quy tắc mẫu cho vai của tôi</button>'+
    '<span class="tiny muted">Quy tắc không có cái giá khi vi phạm thì chỉ là lời khuyên.</span></div>';

  o += '<div class="mt2">';
  for(var i = 1; i <= 7; i++){
    var v = doc('qt' + i) || {};
    var khoa = !!v.khoa;
    o += '<div style="'+(i > 1 ? 'border-top:1px solid var(--line);padding-top:10px;' : '')+'margin-top:10px">'+
      '<div class="row" style="gap:8px;align-items:center;flex-wrap:wrap">'+
        '<span class="mono tiny" style="width:22px;color:var(--ink-4)">'+i+'</span>'+
        '<input class="inp" data-bdqt="'+i+'" value="'+h(v.t || '')+'" '+
          (khoa ? 'readonly ' : '')+'placeholder="Quy tắc thứ '+i+' — viết ở dạng hành vi nhìn thấy được" '+
          'style="flex:1;min-width:210px'+(khoa ? ';background:var(--phu-1)' : '')+'">'+
        (khoa ? '<span class="chip" style="flex:none;color:var(--gita-do-ink)">'+
          ic('lock','w-3 h-3')+' Luật, không sửa</span>' : '')+
      '</div>'+
      '<div class="row mt" style="gap:8px;align-items:center">'+
        '<span style="width:22px;flex:none"></span>'+
        '<input class="inp" data-bdgia="'+i+'" value="'+h(v.g || '')+'" '+
          (khoa ? 'readonly ' : '')+'placeholder="Vi phạm thì sao — tự đặt, và đặt thật" '+
          'style="flex:1;min-width:210px;font-size:14.5px'+(khoa ? ';background:var(--phu-1)' : '')+'">'+
      '</div></div>';
  }
  o += '</div>';
  o += '<p class="tiny mt2" style="color:'+(demQuyTac() >= 7 ? 'var(--ok)' : 'var(--ink-4)')+'">'+
    'Đã có '+demQuyTac()+'/7 quy tắc.</p>';
  if(nhom() === 'ng') o += '<p class="tiny muted">Bốn quy tắc đầu lấy nguyên từ Luật làm việc với '+
    'gia đình (LV-01) và không sửa được: vi phạm hạ 50% KPI trong ba tháng.</p>';
  return o;
}

/* ═══════════════ MÀN HÌNH ═══════════════ */
G.VIEWS['ban-do-ca-nhan'] = function(){
  var ds = G.BDCN || [];
  var nh = nhom();
  var xong = G.bdcnXongMay(), pt = G.bdcnPhanTram();
  var tiep = G.bdcnOTiep();

  var o = U.ph({eyebrow:'MƯỜI MỘT Ô · TỪ TẠI SAO ĐẾN TÀI NĂNG', ic:'compass', grad:1,
    t: nh === 'hv' ? 'Bản đồ của riêng em'
       : nh === 'ph' ? 'Bản đồ của riêng nhà mình'
       : 'Bản đồ cá nhân của tôi',
    lead: nh === 'hv'
      ? 'Mười một ô, bắt đầu từ câu hỏi vì sao em làm việc này. Không có ô nào chấm điểm em. '+
        'Viết được tới đâu thì lưu tới đó, hôm sau mở lại vẫn còn.'
      : nh === 'ph'
      ? 'Mười một ô, bắt đầu từ vì sao nhà mình bắt đầu — chứ không bắt đầu từ danh sách việc phải làm. '+
        'Đó là lý do bản đồ này sống được qua tuần thứ ba, còn danh sách thì không.'
      : 'Mười một ô, đi từ TẠI SAO tới TÀI NĂNG rồi vòng lại sửa chiến lược. Bản đồ này là của riêng '+
        'anh chị, không ai khác đọc được — kể cả Admin, vì nó nằm trong hồ sơ tài khoản.'});

  /* ── Bảng số ── */
  o += '<div class="row wrap mt2" style="gap:12px">'+
    [[xong + ' / ' + ds.length, 'Ô ĐÃ XONG', xong === ds.length ? 'var(--ok)' : 'var(--gita)'],
     [pt + '%', 'BẢN ĐỒ ĐÃ ĐẦY', pt >= 80 ? 'var(--ok)' : 'var(--gita)'],
     [demViec() + ' / 10', 'MƯỜI VIỆC QUAN TRỌNG', demViec() >= 10 ? 'var(--ok)' : 'var(--ink-4)'],
     [demQuyTac() + ' / 7', 'QUY TẮC ĐÃ CHỐT', demQuyTac() >= 7 ? 'var(--ok)' : 'var(--ink-4)']]
    .map(function(x){
      return '<div class="card" style="flex:1;min-width:150px;text-align:center">'+
        '<b style="font-size:21px;color:'+x[2]+'">'+h(x[0])+'</b>'+
        '<div class="tiny up muted mt">'+h(x[1])+'</div></div>';
    }).join('')+'</div>';

  o += '<div class="mt2">'+U.bar(pt, pt >= 80 ? 'var(--ok)' : 'var(--gita)')+'</div>';

  /* ── Đi tiếp ở đâu ── */
  if(tiep){
    o += '<div class="card mt2" style="border-color:'+tiep.c+'">'+
      '<span class="tiny up muted">ĐI TIẾP Ở ĐÂY</span>'+
      '<b class="mt" style="display:block;font-size:16px">Ô '+tiep.so+' — '+h(loi(tiep.ten))+'</b>'+
      '<p class="sm dim mt" style="line-height:1.7">'+h(loi(tiep.hoi))+'</p>'+
      '<button class="btn pri sm mt2" data-bd-mo="'+h(tiep.ma)+'">Mở ô '+tiep.so+'</button></div>';
  } else {
    o += '<div class="card mt2" style="border-color:var(--ok)">'+
      '<b>'+ic('check','w-4 h-4')+' Mười một ô đã có chữ.</b>'+
      '<p class="sm dim mt" style="line-height:1.7">Bản đồ không phải viết một lần rồi cất. '+
      'Ba mươi ngày nữa mở lại: ô nào còn đúng thì giữ, ô nào đã khác thì sửa. '+
      'Chỗ sửa nhiều nhất thường là ô 4 và ô 6.</p></div>';
  }

  /* ── Cách đọc bản đồ ── */
  o += U.sec('MƯỜI MỘT Ô', 'Bấm vào một ô để mở ra viết · rời ô nhập là đã lưu');
  o += '<div class="card" style="background:var(--phu-1)">'+
    '<p class="sm" style="line-height:1.75">Thứ tự mười một ô không phải đặt cho đẹp. '+
    'Ô 6 — mười việc quan trọng — là chỗ hầu hết bảng kế hoạch trên đời bắt đầu, và cũng là lý do '+
    'hầu hết bảng kế hoạch chết yểu: mười việc không nối vào một lý do thì tới thứ Năm là hoãn. '+
    'Ở đây nó nằm sau năm ô, và đó là chủ ý.</p>'+
    '<p class="sm mt" style="line-height:1.75">Ô 11 nằm cuối nhưng không phải là kết thúc. '+
    'Viết xong ô 11 thì quay lại sửa ô 4 — vì một lộ trình không dựa trên chỗ mạnh thật của mình '+
    'thì là lộ trình của người khác.</p></div>';

  ds.forEach(function(b, i){ o += veO(b, i, i ? ds[i-1] : null); });

  /* ── Phần dành cho đội ngũ ── */
  if(nh === 'ng'){
    o += '<div class="card mt2" style="border-color:var(--gita-vien-1)">'+
      '<b>'+ic('users','w-4 h-4')+' Dùng bản đồ này với một gia đình</b>'+
      '<ul class="sm mt" style="line-height:1.75;padding-left:19px;margin:0">'+
       ['Không đưa cả mười một ô trong buổi đầu. Buổi đầu chỉ ô 1, và chỉ nghe.',
        'Không viết hộ. Chữ do mình viết thì người ta không giữ, và cũng không nhớ.',
        'Nhà mới thì đọc ở C1: hỏi đúng câu hỏi lõi, không giảng phần vì sao.',
        'Nhà đã qua chặng 90 ngày thì đọc ở C3: đưa hai lựa chọn gần giống nhau, để họ tự chọn.',
        'Bản đồ của một nhà là hồ sơ riêng của nhà đó. Không đọc cho nhà khác nghe, kể cả khi đã đổi tên.']
       .map(function(x){ return '<li style="margin-bottom:5px">'+h(x)+'</li>'; }).join('')+
      '</ul></div>';
    if(G.veVanDung) o += G.veVanDung('Bản đồ cá nhân');
  }

  return o;
};

/* ═══════════════ LƯU ═══════════════ */
function luuO(ma){
  var c = document.getElementById('bd-' + ma);
  if(!c) return 0;
  var n = 0;
  c.querySelectorAll('[data-bdo]').forEach(function(t){
    var k = t.getAttribute('data-bdo');
    if(String(doc(k)) !== t.value){ ghi(k, t.value); n++; }
  });
  c.querySelectorAll('[data-bdviec]').forEach(function(t){
    luuViec(Number(t.getAttribute('data-bdviec')), {t: t.value}); n++;
  });
  c.querySelectorAll('[data-bdnhip]').forEach(function(t){
    luuViec(Number(t.getAttribute('data-bdnhip')), {n: t.value});
  });
  c.querySelectorAll('[data-bdqt]').forEach(function(t){
    if(t.readOnly) return;
    luuQt(Number(t.getAttribute('data-bdqt')), {t: t.value}); n++;
  });
  c.querySelectorAll('[data-bdgia]').forEach(function(t){
    if(t.readOnly) return;
    luuQt(Number(t.getAttribute('data-bdgia')), {g: t.value});
  });
  return n;
}
function luuViec(i, sua){
  var v = doc('viec' + i) || {};
  var moi = {t: v.t || '', n: v.n || 'ngay', sao: v.sao ? 1 : 0, v: v.v || ''};
  Object.keys(sua).forEach(function(k){ moi[k] = sua[k]; });
  ghi('viec' + i, moi);
}
function luuQt(i, sua){
  var v = doc('qt' + i) || {};
  var moi = {t: v.t || '', g: v.g || '', khoa: v.khoa ? 1 : 0};
  Object.keys(sua).forEach(function(k){ moi[k] = sua[k]; });
  ghi('qt' + i, moi);
}

/* ═══════════════ BẤM ═══════════════ */
document.addEventListener('click', function(e){
  var t = e.target;
  if(!t || !t.closest) return;

  var mo = t.closest('[data-bd-mo]');
  if(mo){
    var ma = mo.getAttribute('data-bd-mo');
    if(moDang) luuO(moDang);
    moDang = (moDang === ma) ? null : ma;
    if(G.render) G.render();
    if(moDang) setTimeout(function(){
      var el = document.getElementById('bd-' + moDang);
      if(el && el.scrollIntoView) el.scrollIntoView({behavior:'smooth', block:'start'});
    }, 40);
    return;
  }

  var s = t.closest('[data-bd-sau]');
  if(s){
    var m2 = s.getAttribute('data-bd-sau');
    moSau[m2] = !moSau[m2];
    luuO(m2);
    if(G.render) G.render();
    return;
  }

  var l = t.closest('[data-bd-luu]');
  if(l){
    luuO(l.getAttribute('data-bd-luu'));
    U.toast('Đã lưu. Bản đồ này chỉ tài khoản của mình đọc được.','ok');
    if(G.render) G.render();
    return;
  }

  var sao = t.closest('[data-bdsao]');
  if(sao){
    var i = Number(sao.getAttribute('data-bdsao'));
    var v = doc('viec' + i) || {};
    luuViec(i, {sao: v.sao ? 0 : 1});
    if(G.render) G.render();
    return;
  }

  var mau = t.closest('[data-bd-mau]');
  if(mau){
    var loaiMau = mau.getAttribute('data-bd-mau');
    var nh = nhom();
    if(loaiMau === 'viec'){
      var dsv = (G.BDCN_MUOI_VIEC || {})[nh] || [];
      dsv.slice(0, 10).forEach(function(x, j){
        var cu = doc('viec' + (j+1)) || {};
        if(String(cu.t || '').trim()) return;              /* không đè chữ người ta đã viết */
        ghi('viec' + (j+1), {t: x.t, n: x.n, sao: j < 3 ? 1 : 0, v: x.v || ''});
      });
      U.toast('Đã lấy mười việc mẫu vào những dòng còn trống. Giờ sửa ít nhất ba dòng cho đúng của mình.','ok');
    } else {
      var dsq = (G.BDCN_QUY_TAC || {})[nh] || [];
      dsq.slice(0, 7).forEach(function(x, j){
        var cu = doc('qt' + (j+1)) || {};
        if(String(cu.t || '').trim() && !cu.khoa && !x.khoa) return;
        ghi('qt' + (j+1), {t: x.t, g: x.g, khoa: x.khoa ? 1 : 0});
      });
      U.toast('Đã lấy bộ quy tắc mẫu. Phần khoá là Luật LV-01, không sửa được.','ok');
    }
    if(G.render) G.render();
  }
});

/* Rời ô nhập là lưu — không bắt ai nhớ bấm nút */
document.addEventListener('change', function(e){
  var t = e.target;
  if(!t || !t.getAttribute) return;
  if(t.hasAttribute('data-bdo')){
    ghi(t.getAttribute('data-bdo'), t.value); return;
  }
  if(t.hasAttribute('data-bdviec')){ luuViec(Number(t.getAttribute('data-bdviec')), {t: t.value}); return; }
  if(t.hasAttribute('data-bdnhip')){ luuViec(Number(t.getAttribute('data-bdnhip')), {n: t.value}); return; }
  if(t.hasAttribute('data-bdqt') && !t.readOnly){ luuQt(Number(t.getAttribute('data-bdqt')), {t: t.value}); return; }
  if(t.hasAttribute('data-bdgia') && !t.readOnly){ luuQt(Number(t.getAttribute('data-bdgia')), {g: t.value}); }
});

/* ═══════════════ NỐI VÀO VÒNG NHẮC ═══════════════
   Bản đồ mà không có ai nhắc thì viết được ô 1 rồi để đó. Đưa nó vào vòng
   Đúng – Đủ – Sâu như mọi việc khác. */
if(Array.isArray(G.VIEC_NHAC)){
  G.VIEC_NHAC.push(
    {ma:'BD-1', cho:'nha', ten:'Viết bản đồ cá nhân — bắt đầu từ ô 1 Tại sao', v:'ban-do-ca-nhan',
     nhip:'Một lần, trong 14 ngày đầu', hanNgay:14,
     bangChung:'Ít nhất năm ô đầu đã có chữ, do chính người trong nhà viết',
     sau:'Mở lại sau 30 ngày và nói được ô nào đã khác'},
    {ma:'BD-2', cho:'nghe', ten:'Viết bản đồ cá nhân của chính mình', v:'ban-do-ca-nhan',
     nhip:'Một lần, trong 30 ngày đầu nhận việc', hanNgay:30,
     bangChung:'Đủ mười một ô, riêng ô 9 có đủ bảy quy tắc kèm cái giá',
     sau:'Mỗi quý mở lại một lần, sửa ô 4 theo điểm mạnh đã lộ ra trong quý'}
  );
}

})();
