/* ═══════════════════════════════════════════════════════════════
   GITA 365 — MÀN TỰ SOÁT: CHỦ HỆ THỐNG TỰ KIỂM 100%

   Trước tệp này, muốn biết kho có chỗ nào rỗng thì phải chạy
   tools/ra-soat-day-du.js ở dòng lệnh — nghĩa là chủ Học viện phải
   TIN LỜI người viết mã. Màn này bỏ chỗ phải tin đó đi: Super Admin
   và Admin hệ thống bấm một nút, hệ thống tự đếm lại từ dữ liệu đang
   nạp trong máy, và hiện ra từng con số.

   Năm phép soát, chạy ngay trong trình duyệt:
     1. Con số công bố — kho nói có bao nhiêu thì phải đếm ra đúng
     2. Bản ghi thiếu trường — theo hợp đồng ở G.SOAT_BAT_BUOC
     3. Chất lượng nội dung — câu cụt, câu chép lại, chữ tạm
     4. Màn hình — dựng thử mọi màn, bắt màn lỗi và màn rỗng ruột
     5. Ngoại lệ có chủ đích — liệt kê đủ, kèm lý do từng cái

   Vì sao phần 5 quan trọng ngang bốn phần trên: một chỗ trống có lý
   do và một chỗ trống bị bỏ quên nhìn giống hệt nhau trong dữ liệu.
   Liệt kê ra thì chủ hệ thống tự phán được cái nào chấp nhận được.

   Màn này KHÔNG sửa gì. Nó chỉ đếm và trình bày.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;
G.VIEWS = G.VIEWS || {};
(function(){
var U = G.U, h = U.h, ic = U.ic;

/* ─── Trường coi là trống ─── */
function trong(x){
  if(x === undefined || x === null) return true;
  if(typeof x === 'string' && !x.trim()) return true;
  if(Array.isArray(x) && !x.length) return true;
  return false;
}
function daTha(kho, truong){
  var o = kho + '.' + truong;
  for(var i=0;i<(G.SOAT_THA||[]).length;i++) if(G.SOAT_THA[i].o === o) return G.SOAT_THA[i];
  return null;
}

/* ═══════════ PHÉP SOÁT 1 · CON SỐ CÔNG BỐ ═══════════ */
G.soatConSo = function(){
  return (G.SOAT_MOC || []).map(function(m){
    var v = G[m.k];
    var co = Array.isArray(v) ? v.length : (v && typeof v === 'object' ? Object.keys(v).length : 0);
    return { k:m.k, ten:m.ten, can:m.so, co:co, dat:co === m.so, nap:v !== undefined };
  });
};

/* ═══════════ PHÉP SOÁT 2 · BẢN GHI THIẾU TRƯỜNG ═══════════ */
G.soatTruong = function(){
  var ra = [];
  Object.keys(G.SOAT_BAT_BUOC || {}).forEach(function(k){
    var hd = G.SOAT_BAT_BUOC[k], v = G[k];
    if(!Array.isArray(v)) { ra.push({kho:k, y:hd.y, chuaNap:true}); return; }
    var thieu = [];
    hd.truong.forEach(function(f){
      if(daTha(k, f)) return;
      var so = v.filter(function(r){ return !r || typeof r !== 'object' || trong(r[f]); }).length;
      if(so) thieu.push({ truong:f, so:so, tong:v.length });
    });
    ra.push({ kho:k, y:hd.y, tong:v.length, thieu:thieu, dat:!thieu.length });
  });
  /* Kho ngoài hợp đồng vẫn soát bằng luật chung: trường có ở ≥90% bản ghi */
  var them = [];
  Object.keys(G).forEach(function(k){
    if(!/^[A-Z][A-Z0-9_]*$/.test(k)) return;
    if(G.SOAT_BAT_BUOC && G.SOAT_BAT_BUOC[k]) return;
    var v = G[k];
    if(!Array.isArray(v) || v.length < 3 || typeof v[0] !== 'object' || v[0] === null) return;
    var dem = {};
    v.forEach(function(r){ r && typeof r === 'object' &&
      Object.keys(r).forEach(function(f){ dem[f] = (dem[f]||0) + 1; }); });
    var thieu = [];
    Object.keys(dem).filter(function(f){ return dem[f] >= v.length * 0.9; }).forEach(function(f){
      if(daTha(k, f)) return;
      var so = v.filter(function(r){ return !r || trong(r[f]); }).length;
      if(so) thieu.push({ truong:f, so:so, tong:v.length });
    });
    if(thieu.length) them.push({ kho:k, tong:v.length, thieu:thieu, dat:false, chung:true });
  });
  return { hopDong:ra, luatChung:them };
};

/* ═══════════ PHÉP SOÁT 3 · CHẤT LƯỢNG NỘI DUNG ═══════════ */
G.soatChatLuong = function(){
  var K = G.KICHBAN || [];
  var cut = K.filter(function(k){
    return String(k.mo||'').length < 40 || String(k.chot||'').length < 60 || String(k.muc||'').length < 40;
  });
  function lap(truong){
    var d = {}; K.forEach(function(k){ if(k[truong]) d[k[truong]] = (d[k[truong]]||0) + 1; });
    return Object.keys(d).filter(function(x){ return d[x] > 1; }).length;
  }
  /* Chữ tạm: soi GIÁ TRỊ TRỌN VẸN của từng trường, không quét chuỗi con
     trong cả kho. Quét chuỗi con báo nhầm rất nặng — "em vẫn đang cập nhật
     nó" là một phương án trả lời thật trong bộ test, "Nhà mình sắp có đợt
     bận dài" là một câu hỏi sát hạch thật, và "F-xxx" là mẫu mã gia đình.
     Cả ba đều là nội dung đúng. Chỗ trống thật là chỗ mà TOÀN BỘ giá trị
     của trường chỉ có mỗi chữ tạm. */
  /* KHÔNG bắt dấu ba chấm, dấu gạch hay dấu hỏi đứng một mình: trong tài
     liệu gốc của Học viện đó là cách đánh dấu ô ĐỂ ĐIỀN TAY — "Họ và tên: …",
     "Điểm đạt được: …" trong phiếu đánh giá in ra. Ô ấy trống là đúng chủ
     đích, người dùng viết vào. Chỉ bắt chữ tạm của người viết mã. */
  var TAM = /^\s*(TODO|FIXME|TBD|XXX|lorem ipsum.*|coming soon|placeholder|đang cập nhật|sắp cập nhật|chưa có nội dung|chưa cập nhật|undefined|null|NaN)\s*[.!]?\s*$/i;
  var coTam = [];
  function soi(k, x, sau){
    if(sau > 6) return false;
    if(typeof x === 'string') return TAM.test(x);
    if(Array.isArray(x)) return x.some(function(y){ return soi(k, y, sau+1); });
    if(x && typeof x === 'object')
      return Object.keys(x).some(function(f){ return soi(k, x[f], sau+1); });
    return false;
  }
  Object.keys(G).forEach(function(k){
    if(!/^[A-Z][A-Z0-9_]*$/.test(k)) return;
    try { if(soi(k, G[k], 0)) coTam.push(k); } catch(e){ /* kho quá sâu — bỏ qua */ }
  });
  var en = G.ITEM_EN || {}, man = [];
  (G.NAV||[]).forEach(function(g){ (g.items||[]).forEach(function(i){ man.push(i.v); }); });
  var thieuEN = man.filter(function(v){ return !en[v]; });
  return {
    tongKichBan: K.length,
    cut: cut.length, viDuCut: G.dsHet(cut,3).map(function(k){ return k.ma; }),
    moLap: lap('mo'), chotLap: lap('chot'),
    coTam: coTam, tongMuc: man.length, thieuEN: thieuEN
  };
};

/* ═══════════ PHÉP SOÁT 4 · DỰNG THỬ MỌI MÀN ═══════════ */
/* Màn nào gọi lại G.soatTatCa() trong lúc dựng thì phải nằm ở đây. */
var TU_GOI = ['soat-day-du', 'tu-van-hanh'];
G.TU_GOI_SOAT = TU_GOI;

G.soatManHinh = function(){
  var KHOA = '<div class="card center" style="padding:40px">';
  var CHAN = /kho nghề|cấp phép|chưa mở được|chưa có|Đăng nhập lại|chưa thao tác được|dành cho/i;
  var man = [];
  (G.NAV||[]).forEach(function(g){ (g.items||[]).forEach(function(i){
    /* BỎ MỌI MÀN TỰ GỌI LẠI BỘ SOÁT. Không bỏ thì soat-day-du dựng thử
       soat-day-du, mà lần dựng ấy lại dựng thử soat-day-du — đệ quy vô
       tận, trình duyệt treo. Lỗi này đã làm bộ kiểm phát hành đứng im ở
       mục 2, và tái diễn ở v8.4 khi màn tu-van-hanh gọi G.soatTatCa()
       trong lúc dựng.

       Danh sách này phải mở rộng mỗi lần có màn mới gọi bộ soát. Màn tự
       soát không tự soát chính nó được; phần kiểm chúng nằm ở mục 34 của
       tools/kiem-tra.js, chạy từ bên ngoài. */
    if(TU_GOI.indexOf(i.v) < 0) man.push(i.v);
  }); });
  var loi = [], rong = [], khoa = 0, ok = 0;
  man.forEach(function(v){
    var html;
    try { html = G.VIEWS[v] ? G.VIEWS[v]() : null; }
    catch(e){ loi.push(v + ' — ' + e.message); return; }
    if(typeof html !== 'string'){ loi.push(v + ' — không trả về chuỗi'); return; }
    var t = html.trim();
    if(t.indexOf(KHOA) === 0){ khoa++; return; }
    if(t.length < 700 && !CHAN.test(t)){ rong.push(v + ' (' + t.length + ' ký tự)'); return; }
    ok++;
  });
  return { tong:man.length, ok:ok, khoa:khoa, loi:loi, rong:rong };
};

/* ═══════════ CHẠY CẢ NĂM PHÉP ═══════════
   Có bộ nhớ đệm: năm phép soát dựng thử hơn một trăm màn nên tốn thật.
   Dựng lại màn vì lý do khác — đổi ngôn ngữ, bấm một nút, quay lại từ màn
   khác — không được chạy lại cả bộ. Nút "Soát lại ngay" xoá đệm rồi dựng. */
var dem = null;
G.soatXoaDem = function(){ dem = null; };
/* Đã có kết quả trong bộ đệm chưa. Màn khác hỏi trước khi đọc, để không
   vô tình ép bộ soát chạy giữa lúc chính nó đang dựng màn. */
G.soatCoSan = function(){ return dem != null; };
G.soatTatCa = function(batBuocLai){
  if(dem && !batBuocLai) return dem;
  dem = soatThat();
  return dem;
};
function soatThat(){
  var cs = G.soatConSo(), tr = G.soatTruong(), cl = G.soatChatLuong(), mh = G.soatManHinh();
  var hong = 0;
  cs.forEach(function(x){ if(!x.dat) hong++; });
  tr.hopDong.forEach(function(x){ if(!x.dat) hong++; });
  hong += tr.luatChung.length;
  if(cl.cut) hong++;
  if(cl.moLap || cl.chotLap) hong++;
  if(cl.coTam.length) hong++;
  if(cl.thieuEN.length) hong++;
  hong += mh.loi.length + mh.rong.length;
  return { conSo:cs, truong:tr, chatLuong:cl, manHinh:mh, hong:hong, luc:new Date() };
};

/* ═══════════════ MÀN HÌNH ═══════════════ */
G.VIEWS['soat-day-du'] = function(){
  /* Chỉ Super Admin và Admin hệ thống. Đây là màn soi vào ruột hệ
     thống — nó hiện cả tên biến và số bản ghi của mọi kho. */
  if(!G.can('qt_trang')) return U.lockCard();
  if(!G.SOAT_MOC) return U.empty('Chưa nạp được chuẩn soát','Phần này nằm trong gói nền. Đăng nhập lại để nạp.');

  var r = G.soatTatCa();
  var xanh = r.hong === 0;

  var o = U.ph({eyebrow:'QUẢN TRỊ · TỰ KIỂM', ic:'shield', grad:1,
    t:'Soát đủ ruột — anh tự kiểm, không phải tin ai',
    lead:'Năm phép soát chạy ngay lúc anh mở màn này, đếm lại từ dữ liệu đang nạp trong máy. Không có con số nào viết sẵn. Bấm nút dưới cùng để chạy lại bất cứ lúc nào.'});

  /* Kết luận đặt lên đầu — người bận chỉ đọc dòng này */
  o += '<div class="card mb" style="border-color:'+(xanh?'rgba(16,185,129,.45)':'rgba(239,68,68,.45)')+
    ';background:'+(xanh?'rgba(16,185,129,.07)':'rgba(239,68,68,.07)')+'">'+
    '<div class="row" style="gap:11px;align-items:center">'+
    '<span style="color:'+(xanh?'var(--ok)':'var(--bad)')+'">'+ic(xanh?'check':'bell','w-6 h-6')+'</span>'+
    '<div><b style="font-size:18px;color:'+(xanh?'var(--ok)':'var(--bad)')+'">'+
    (xanh ? 'KHÔNG CÒN CHỖ NÀO ĐỂ TRỐNG' : 'CÒN ' + r.hong + ' CHỖ PHẢI XEM')+'</b>'+
    '<div class="tiny muted mt">Soát lúc '+h(r.luc.toLocaleString('vi-VN'))+
    ' · '+r.conSo.length+' con số công bố · '+r.truong.hopDong.length+' kho theo hợp đồng · '+
    r.manHinh.tong+' màn hình</div></div></div></div>';

  /* ── 1 · Con số công bố ── */
  o += U.sec('1 · CON SỐ CÔNG BỐ CÓ ĐẾM RA ĐÚNG KHÔNG',
    'Kho nào nói mình có bao nhiêu thì phải đếm ra đúng chừng ấy. Đây là chỗ bắt kiểu hỏng nguy hiểm nhất: con số trong lời giới thiệu đi một đằng, dữ liệu thật đi một nẻo.');
  o += U.tbl(['Kho','Phải có','Đếm được','Kết quả'], r.conSo.map(function(x){
    return [
      '<b class="sm">'+h(x.ten)+'</b><div class="tiny muted mono">'+h(x.k)+'</div>',
      '<span class="mono">'+x.can.toLocaleString('vi-VN')+'</span>',
      '<span class="mono" style="color:'+(x.dat?'var(--ok)':'var(--bad)')+';font-weight:700">'+
        (x.nap ? x.co.toLocaleString('vi-VN') : 'chưa nạp')+'</span>',
      x.dat ? '<span style="color:var(--ok)">'+ic('check','w-4 h-4')+'</span>'
            : '<span style="color:var(--bad)">'+ic('x','w-4 h-4')+' lệch '+Math.abs(x.co-x.can)+'</span>'
    ];
  }));

  /* ── 2 · Bản ghi thiếu trường ── */
  o += U.sec('2 · BẢN GHI CÓ ĐỦ TRƯỜNG KHÔNG',
    'Mỗi kho có một bản hợp đồng: nói mình có trường nào thì mọi bản ghi phải có đủ trường đó. Cột cuối ghi vì sao trường ấy không được trống.');
  o += r.truong.hopDong.map(function(x){
    var mau = x.dat ? '#0B7350' : '#EF4444';
    return '<div class="card pad-sm mb" style="border-color:'+mau+'2e">'+
      '<div class="row wrap" style="gap:8px;align-items:center">'+
      '<span style="color:'+mau+'">'+ic(x.dat?'check':'x','w-4 h-4')+'</span>'+
      '<b class="sm mono">'+h(x.kho)+'</b>'+
      (x.chuaNap ? '<span class="tiny" style="color:var(--alert)">chưa nạp — cần cấp phép gói chứa kho này</span>'
        : '<span class="tiny muted">'+x.tong.toLocaleString('vi-VN')+' bản ghi · '+
          (x.dat ? 'đủ trường' : x.thieu.length + ' trường còn trống')+'</span>')+
      '</div>'+
      (x.thieu && x.thieu.length
        ? '<div class="mt tiny" style="color:var(--bad)">'+x.thieu.map(function(t){
            return h(t.truong)+' — '+t.so+'/'+t.tong+' bản ghi trống'; }).join(' · ')+'</div>' : '')+
      '<p class="tiny muted mt" style="line-height:1.6">'+h(x.y||'')+'</p></div>';
  }).join('');

  if(r.truong.luatChung.length){
    o += '<div class="card mb" style="border-color:rgba(251,146,60,.4)">'+
      '<div class="tiny up mb" style="color:var(--alert)">KHO NGOÀI HỢP ĐỒNG CÓ TRƯỜNG TRỐNG</div>'+
      '<p class="tiny muted mb">Những kho này chưa có bản hợp đồng riêng nên soát bằng luật chung: trường nào có mặt ở từ 90% bản ghi trở lên thì coi là bắt buộc. Xem lại — hoặc thêm vào G.SOAT_BAT_BUOC, hoặc thêm lý do vào G.SOAT_THA.</p>'+
      r.truong.luatChung.map(function(x){
        return '<div class="tiny" style="padding:5px 0;border-top:1px solid var(--line)">'+
          '<b class="mono">'+h(x.kho)+'</b> — '+x.thieu.map(function(t){
            return h(t.truong)+' '+t.so+'/'+t.tong; }).join(' · ')+'</div>';
      }).join('')+'</div>';
  } else {
    o += '<div class="card mb" style="border-color:rgba(16,185,129,.35)">'+
      '<p class="tiny">'+ic('check','w-3 h-3')+' Không kho nào ngoài hợp đồng có trường bỏ trống — soát bằng luật chung trên toàn bộ dữ liệu đang nạp.</p></div>';
  }

  /* ── 3 · Chất lượng nội dung ── */
  var c = r.chatLuong;
  o += U.sec('3 · ĐỦ TRƯỜNG RỒI, RUỘT CÓ THẬT KHÔNG',
    'Đủ trường chưa phải là đủ ruột. Bốn phép dưới đây bắt kiểu lấp cho có.');
  o += '<div class="grid g2 mb">'+ [
    ['CL1','Không câu nào cụt', c.cut === 0,
      c.cut ? c.cut + ' bản: ' + c.viDuCut.join(' ') : c.tongKichBan.toLocaleString('vi-VN')+' kịch bản đều đủ dài'],
    ['CL2','Không câu nào bị chép lại', (c.moLap + c.chotLap) === 0,
      (c.moLap + c.chotLap) ? c.moLap+' câu mở · '+c.chotLap+' câu chốt bị lặp'
        : 'nghìn bản là nghìn tình huống thật'],
    ['CL3','Không còn chữ tạm', c.coTam.length === 0,
      /* Không viết thẳng mấy chữ tạm ra màn hình. Đây là màn duy nhất nói
         VỀ chữ tạm, nên nếu in nguyên chữ ra thì bộ rà soát chỗ trống lại
         bắt chính màn này — và cách chữa dễ dãi là tha cho nó một ngoại lệ.
         Tha một lần là mở đường tha lần sau, nên đổi câu chữ thay vì đổi
         luật. Chữ tạm cụ thể vẫn hiện đủ ở nhánh trái khi thật sự bắt được. */
      c.coTam.length ? c.coTam.join(' ') : 'không kho nào lấp chỗ trống bằng chữ đánh dấu để quay lại sau'],
    ['CL4','Đủ bản tiếng Anh', c.thieuEN.length === 0,
      c.thieuEN.length ? c.thieuEN.length+'/'+c.tongMuc+' thiếu: '+c.thieuEN.slice(0,5).join(' ')
        : c.tongMuc+'/'+c.tongMuc+' mục điều hướng']
  ].map(function(x){
    var m = x[2] ? '#0B7350' : '#EF4444';
    var ct = (G.SOAT_CHATLUONG||[]).filter(function(y){ return y.ma === x[0]; })[0];
    return '<div class="card pad-sm" style="border-color:'+m+'2e">'+
      '<div class="row" style="gap:8px;align-items:center;margin-bottom:6px">'+
      '<span style="color:'+m+'">'+ic(x[2]?'check':'x','w-4 h-4')+'</span>'+
      U.chip(x[0], m)+'<b class="sm">'+h(x[1])+'</b></div>'+
      '<p class="tiny" style="color:'+(x[2]?'var(--ink-2)':'var(--bad)')+'">'+h(x[3])+'</p>'+
      (ct ? '<p class="tiny muted mt" style="line-height:1.6">'+h(ct.y)+'</p>' : '')+
      '</div>';
  }).join('') +'</div>';

  /* ── 4 · Dựng thử mọi màn ── */
  var m = r.manHinh;
  o += U.sec('4 · DỰNG THỬ MỌI MÀN HÌNH',
    'Chạy thật từng màn với đúng quyền của tài khoản đang đăng nhập, bắt màn văng lỗi và màn chỉ có khung mà không có ruột.');
  o += '<div class="grid g4 mb">'+
    U.stat({k:'Dựng ra nội dung', v:String(m.ok), d:'trên tổng '+m.tong+' màn', c:'#0B7350'})+
    U.stat({k:'Khoá đúng quyền',  v:String(m.khoa), d:'chặn có chủ đích', c:'#64748B'})+
    U.stat({k:'Văng lỗi',         v:String(m.loi.length), d:m.loi.length?'phải sửa':'không có', c:m.loi.length?'#EF4444':'#0B7350'})+
    U.stat({k:'Rỗng ruột',        v:String(m.rong.length), d:m.rong.length?'phải lấp':'không có', c:m.rong.length?'#EF4444':'#0B7350'})+
    '</div>';
  if(m.loi.length)
    o += '<div class="card mb" style="border-color:rgba(239,68,68,.4)"><div class="tiny up mb" style="color:var(--bad)">MÀN VĂNG LỖI</div>'+
      U.list(m.loi,'#EF4444')+'</div>';
  if(m.rong.length)
    o += '<div class="card mb" style="border-color:rgba(251,146,60,.4)"><div class="tiny up mb" style="color:var(--alert)">MÀN RỖNG RUỘT</div>'+
      U.list(m.rong,'#FB923C')+'</div>';

  /* ── 5 · Ngoại lệ có chủ đích ── */
  o += U.sec('5 · CHỖ TRỐNG CÓ CHỦ ĐÍCH — '+(G.SOAT_THA||[]).length+' Ô',
    'Một chỗ trống có lý do và một chỗ trống bị bỏ quên nhìn giống hệt nhau trong dữ liệu. Liệt kê đủ ra đây để anh tự phán cái nào chấp nhận được. Ngoại lệ không có lý do thì không được nằm trong bảng này.');
  o += U.tbl(['Ô để trống','Vì sao để trống'], (G.SOAT_THA||[]).map(function(x){
    return ['<b class="sm mono">'+h(x.o)+'</b>', '<span class="tiny">'+h(x.y)+'</span>'];
  }));

  /* ── Nút chạy lại ── */
  o += '<div class="card mt2 center" style="border-color:var(--gita-vien-1)">'+
    '<p class="sm dim mb" style="line-height:1.7">Màn này không sửa gì cả — nó chỉ đếm và trình bày. '+
    'Muốn soát sâu hơn nữa, ngoài trình duyệt, chạy <span class="mono">node tools/ra-soat-day-du.js</span> '+
    'trên máy: bộ đó dựng thử mọi màn cho <b>cả mười lăm vai</b>, còn màn này dựng theo quyền của tài khoản đang đăng nhập.</p>'+
    '<button class="btn pri" data-act="soat-lai">'+ic('pulse','w-4 h-4')+' Soát lại ngay</button></div>';
  return o;
};

/* Chạy lại = dựng lại màn, vì mọi con số đều tính lúc dựng */
document.addEventListener('click', function(e){
  var el = e.target.closest && e.target.closest('[data-act="soat-lai"]');
  if(el){
    e.preventDefault();
    if(G.soatXoaDem) G.soatXoaDem();      /* xoá đệm thì lần dựng sau mới đếm lại thật */
    if(G.render) G.render();
    if(G.U) G.U.toast('Đã soát lại toàn bộ kho.','ok');
  }
});
})();
