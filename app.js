/* ═══════════════════════════════════════════════════════════════
   GITA 365 · v7.0 — LÕI ỨNG DỤNG
   Trạng thái · phân quyền · cổng vào · khung · định tuyến
   ═══════════════════════════════════════════════════════════════ */
'use strict';
(function(){
var G = window.G, U = G.U, h = U.h, ic = U.ic;
var KEY = 'gita365.v7';

/* ─────────── Trạng thái ─────────── */
G.S = {
  role:null, acc:null, roleObj:null,
  view:'ban-do', open:['g1'], rtab:'labon', rightOpen:false, leftOpen:false, thuCot:false,
  checks:{}, vision:{}, journal:{}, test:{}, bando:{}, nhatky:{}, baithi:{}, thoigian:{}, sathach:{}, khoahoc:{}, mtb:{}, famId:'F-001', kbShown:60,
  /* Danh sách mục đã từng thấy trong cột trái. Dùng để nhận ra lúc thăng
     hạng: tầng mở thêm thì tập mục mở rộng ra, và chênh lệch chính là
     phần vừa được cấp. Không có sổ này thì mục mới lặng lẽ xuất hiện
     giữa bốn mươi mục cũ và không ai biết mình vừa được cấp thêm gì. */
  daThay:null
};
function save(){
  try{ localStorage.setItem(KEY, JSON.stringify({
    role:G.S.role, u:G.S.acc && G.S.acc.u, view:G.S.view, open:G.S.open, rtab:G.S.rtab,
    checks:G.S.checks, vision:G.S.vision, journal:G.S.journal, test:G.S.test, bando:G.S.bando, nhatky:G.S.nhatky, baithi:G.S.baithi, thoigian:G.S.thoigian, sathach:G.S.sathach, khoahoc:G.S.khoahoc,
    rightOpen:G.S.rightOpen, thuCot:G.S.thuCot, mood:G.S.mood, daThay:G.S.daThay,
    /* Sổ việc và sổ chốt ngày. Thiếu hai dòng này thì mọi thứ người ta
       làm trên bảng công việc bay hết khi tải lại trang: sáng nhận việc,
       trưa đóng việc, chiều bấm F5 là KPI về không. KPI tháng cộng từ
       KPI ngày, nên KPI tháng cũng luôn bằng không — cả phần xét lương
       thưởng chạy trên một sổ trống mà không báo gì.

       viecCua là TÊN ĐĂNG NHẬP của người sở hữu hai sổ này. Máy chung ở
       văn phòng thì Coach đăng xuất, phụ huynh đăng nhập vào cùng trình
       duyệt — không ghi tên chủ sổ thì bằng chứng đóng việc của Coach,
       viết về nhà nào có chuyện gì, nằm lại trong máy cho người sau. */
    viec:G.S.viec, chotNgay:G.S.chotNgay, chotKhNgay:G.S.chotKhNgay, caiTien:G.S.caiTien, mua:G.S.mua, vet:G.S.vet, viecCua:G.S.viecCua,
    /* Bàn cờ hành trình. Thiếu dòng này thì mọi quân nhà mình đặt bay
       hết khi tải lại trang — và một bàn cờ xoá được mỗi lần F5 thì
       nhìn nó không còn nghĩa gì. */
    banCo:G.S.banCo, bcTang:G.S.bcTang, bcVai:G.S.bcVai, bcBien:G.S.bcBien,
    /* BẢY DÒNG DƯỚI ĐÂY TỪNG BỊ BỎ QUÊN, và bỏ quên theo kiểu tệ nhất:
       chỗ ghi vẫn gọi G.save() đàng hoàng, save() vẫn chạy không lỗi, mà
       không dòng nào của chúng được ghi xuống. Bấm nút xong, F5, mất sạch,
       không một lời báo.

       Nặng nhất là ccSo — SỔ CHỨNG CỨ HOA HỒNG. Hồ sơ dựng để đối chất
       kiện tụng mà bay mỗi lần tải lại trang thì nó không phải hồ sơ.
       Rồi bcKem: nhà mình đang kèm nhà nào, bắt đầu hôm nào.

       Bộ kiểm nay đi VÒNG TRÒN THẬT — ghi vào G.S, gọi save(), đọc lại từ
       localStorage — nên thêm một khoá mà quên khai ở đây là đỏ ngay, chứ
       không đợi tới lúc có người mất dữ liệu mới biết. */
    bcNep:G.S.bcNep, bcKem:G.S.bcKem,
    ccSo:G.S.ccSo,
    tinNhat:G.S.tinNhat, tinTang:G.S.tinTang, tinChiaSe:G.S.tinChiaSe,
    mtb:G.S.mtb, ssVai:G.S.ssVai
  })); }catch(e){}
}
function load(){
  try{
    var d = JSON.parse(localStorage.getItem(KEY) || 'null'); if(!d) return null;
    G.S.view = d.view || G.S.view; G.S.open = d.open || G.S.open; G.S.rtab = d.rtab || G.S.rtab;
    G.S.checks = d.checks || {}; G.S.vision = d.vision || {}; G.S.journal = d.journal || {};
    G.S.banCo = d.banCo || {}; G.S.bcTang = d.bcTang || 'T1';
    G.S.bcVai = d.bcVai || null;
    G.S.bcBien = d.bcBien || {};
    G.S.test = d.test || {};
    G.S.bando = d.bando || {};
    G.S.daThay = d.daThay || null;
    G.S.nhatky = d.nhatky || {};
    G.S.baithi = d.baithi || {};
    G.S.thoigian = d.thoigian || {};
    G.S.sathach = d.sathach || {};
    G.S.khoahoc = d.khoahoc || {};
    G.S.mood = d.mood || null;
    G.S.viec = d.viec || {};
    G.S.chotNgay = d.chotNgay || {};
    G.S.chotKhNgay = d.chotKhNgay || {};
    G.S.caiTien = d.caiTien || {};
    G.S.mua = d.mua || null;
    G.S.vet = d.vet || [];
    G.S.viecCua = d.viecCua || null;
    G.S.bcNep = d.bcNep || {};
    G.S.bcKem = d.bcKem || null;
    G.S.ccSo = d.ccSo || [];
    G.S.tinNhat = d.tinNhat || [];
    G.S.tinTang = d.tinTang || null;
    /* Công tắc chia sẻ: chỉ đúng true mới là bật. Thiếu khoá, hỏng khoá,
       hay bất cứ giá trị nào khác đều về TẮT — mặc định của một lời đồng ý
       không bao giờ được là "có". */
    G.S.tinChiaSe = (d.tinChiaSe === true);
    G.S.mtb = d.mtb || {};
    G.S.ssVai = d.ssVai || null;
    if(d.rightOpen !== undefined) G.S.rightOpen = d.rightOpen;
    if(d.thuCot !== undefined) G.S.thuCot = d.thuCot;
    return d;
  }catch(e){ return null; }
}

/* ─────────── Tiện ích hệ thống ─────────── */
/* ══════════ NỀN SÁNG / NỀN TỐI ══════════
   Mặc định nền sáng — hợp môi trường giáo dục và đọc lâu không mỏi.
   Ai quen nền tối thì bấm một nút; lựa chọn nhớ theo máy. */
var KEY_NEN = 'gita365_nen';
G.datNen = function(n){
  G.NEN = (n === 'toi') ? 'toi' : 'sang';
  if(G.NEN === 'toi') document.documentElement.setAttribute('data-nen','toi');
  else document.documentElement.removeAttribute('data-nen');
  /* Màu thanh trình duyệt phải ĐỌC từ nền thật, không gõ lại bằng tay.
     Hai mã gõ tay ở đây là #1E1842 và #F6F3FC, trong khi nền thật là
     #182942 và #F3F7FC — lệch đủ để trên điện thoại thấy một vệt khác
     màu giữa thanh trạng thái và đầu trang. Và lệch kiểu này không bao
     giờ tự lộ: đổi bảng màu thì con số gõ tay ở lại. */
  var m = document.querySelector('meta[name="theme-color"]');
  if(m){
    var nen = '';
    try{ nen = getComputedStyle(document.documentElement)
      .getPropertyValue('--bg-0').trim(); }catch(e){}
    m.setAttribute('content', nen || (G.NEN === 'toi' ? '#182942' : '#F3F7FC'));
  }
  try{ localStorage.setItem(KEY_NEN, G.NEN); }catch(e){}
};
G.doiNen = function(){
  G.datNen(G.NEN === 'toi' ? 'sang' : 'toi');
  if(G.S.acc){ var t = document.getElementById('top'); if(t) t.innerHTML = topBar(); }
  else gate();
};
(function(){
  var n = null;
  try{ n = localStorage.getItem(KEY_NEN); }catch(e){}
  G.datNen(n || 'sang');
})();

G.roleById = function(id){
  var r = G.ROLES.filter(function(x){return x.id===id;})[0];
  return r || G.ROLES[12];
};
/* Mọi chữ hiển thị đi qua G.nd để Super Admin sửa được ngay trong ứng dụng.
   Chưa nạp mô-đun sửa nội dung thì nd trả về bản gốc — không hỏng gì. */
function nd(k, goc){ return G.nd ? G.nd(k, goc) : goc; }
G.gname = function(g){ var e=G.NAV_EN[g.id]; return nd('nhom.'+g.id+'.t', (G.LANG==='en'&&e)?e.t:g.t); };
G.gsub  = function(g){ var e=G.NAV_EN[g.id]; return nd('nhom.'+g.id+'.s', (G.LANG==='en'&&e)?e.s:g.s); };
G.gess  = function(g){ var e=G.NAV_EN[g.id]; return nd('nhom.'+g.id+'.e', (G.LANG==='en'&&e)?e.e:g.essence); };
G.iname = function(it){ var e=G.ITEM_EN[it.v]; return nd('nav.'+it.v+'.t', (G.LANG==='en'&&e)?e[0]:it.t); };
G.ihint = function(it){ var e=G.ITEM_EN[it.v]; return nd('nav.'+it.v+'.h', (G.LANG==='en'&&e)?e[1]:it.h); };
G.tname = function(t){ var e=G.TIER_EN[t.code]; return (G.LANG==='en'&&e)?e.name:t.name; };
G.tq    = function(t){ var e=G.TIER_EN[t.code]; return (G.LANG==='en'&&e)?e.q:t.q; };
G.tfeel = function(t){ var e=G.TIER_EN[t.code]; return (G.LANG==='en'&&e)?e.feel:t.feel; };
G.setLang = function(k){
  G.LANG = k;
  try{ localStorage.setItem('gita365.lang', k); }catch(e){}
  if(G.S.acc) shell(); else gate();
  U.toast(k==='en'?'Interface switched to English.':'Đã chuyển về tiếng Việt.','ok');
};

G.tierOf = function(id){
  return G.TIERS.filter(function(t){return t.id===Number(id);})[0] || G.TIERS[0];
};
G.bandColor = function(b){
  return ({XANH:'#0B7350', VANG:'#BE0E16', CAM:'var(--gita-do)', DO:'#BE0E16'})[b] || '#665E88';
};
/* ══════════ PHÂN QUYỀN ══════════
   Hai lớp, theo đúng thứ tự:
     1. Bảng phân quyền theo vai — thứ Super Admin và Admin sửa được
     2. Bậc của vai — nền mặc định khi bảng không nói gì
   Lớp 1 đi trước nên "cấm" luôn thắng, kể cả với vai bậc cao. */
var KEY_PQ = 'gita365_phanquyen';

G.PHANQUYEN = (function(){
  var g = {};
  Object.keys(G.PHANQUYEN_GOC || {}).forEach(function(k){
    g[k] = {cho:(G.PHANQUYEN_GOC[k].cho||[]).slice(), cam:(G.PHANQUYEN_GOC[k].cam||[]).slice()};
  });
  try{
    var d = JSON.parse(localStorage.getItem(KEY_PQ) || 'null');
    if(d && typeof d === 'object'){
      Object.keys(d).forEach(function(k){
        if(!G.roleById(k)) return;                       /* vai lạ thì bỏ */
        var cho = (d[k].cho||[]).filter(function(x){ return G.PERM[x] !== undefined; });
        var cam = (d[k].cam||[]).filter(function(x){ return G.PERM[x] !== undefined; });
        g[k] = {cho:cho, cam:cam};
      });
    }
  }catch(e){}
  return g;
})();

G.luuPhanQuyen = function(){
  try{ localStorage.setItem(KEY_PQ, JSON.stringify(G.PHANQUYEN)); }catch(e){}
  if(G.danhDauCaiDat) G.danhDauCaiDat('phanquyen');
};

/* Vai này có quyền kia không — dùng được cho cả vai đang đăng nhập lẫn vai khác. */
G.vaiCo = function(vai, perm){
  if(!vai) return false;
  var r = (typeof vai === 'string') ? G.roleById(vai) : vai;
  if(!r) return false;
  var ov = G.PHANQUYEN[r.id];
  if(ov){
    if(ov.cam.indexOf(perm) >= 0) return false;
    if(ov.cho.indexOf(perm) >= 0) return true;
  }
  var need = G.PERM[perm];
  return need !== undefined && r.lv <= need;
};

G.can = function(perm){ return G.vaiCo(G.S.roleObj, perm); };

/* Đếm để so hai vai với nhau — bảng điều khiển và màn "Tôi" dùng. */
G.demQuyen = function(vai){
  var n = 0, r = (typeof vai === 'string') ? G.roleById(vai) : vai;
  Object.keys(G.PERM).forEach(function(k){ if(G.vaiCo(r,k)) n++; });
  return n;
};
G.myPortal = function(){ return G.S.roleObj ? G.S.roleObj.portal : 'ph'; };
var NHA_TRONG = {id:'—',nha:'Chưa mở hồ sơ',hv:'—',lop:'—',ph:'—',tier:1,ngay:0,
  coach:'—',nhac:0,tuchu:0,vai:0,band:'VANG',kyTich:'Cần cấp phép để mở hồ sơ gia đình'};
/* ═══ MỘT CỬA DUY NHẤT ĐỌC HỒ SƠ NHÀ ═══
   Máy nghề có FAMILIES (mười nhà). Máy gia đình chỉ có NHA_TOI — đúng
   một bản ghi, hồ sơ của chính nhà mình, rút từ FAMILIES lúc đóng gói.

   Đọc thẳng G.FAMILIES ở bảy chỗ như trước thì mỗi chỗ là một lần phải
   NHỚ tự hỏi "máy này có kho ấy không". Có một cửa thì chỉ phải canh
   một chỗ — và bốn trong bảy chỗ ấy còn đang gọi .map() thẳng, tức là
   ném lỗi ngay khi kho vắng. */
G.dsNha = function(){
  /* NHÀ CỦA CHÍNH MÌNH KHÔNG ĐI QUA CỔNG XEM KHÁCH. Cổng ấy trả lời câu
     "vai này có được xem hồ sơ NHÀ KHÁC không"; hồ sơ nhà mình là chuyện
     khác hẳn, và nó đã có quyền riêng là kh_gia_dinh. Lọc nhầm chỗ này
     thì phụ huynh mất luôn hồ sơ của chính nhà họ — vai R13 không có tên
     trong bất kỳ trần nào, vì cổng ấy chưa từng nói về họ. */
  if (!(G.FAMILIES && G.FAMILIES.length)) return G.NHA_TOI || [];

  /* Cổng xem hồ sơ khách (bản 9.47). Từ bản này gói NGHỀ chỉ còn mang
     tầng một tới ba, nên lớp lọc ở đây KHÔNG phải chỗ giữ dữ liệu — chỗ
     ấy là gói kho và máy chủ. Nó ở đây để một vai bị gạch tên khỏi mọi
     tầng, như Giáo viên, không nhìn thấy cả danh sách; và để ngày mai có
     ai lỡ nhét lại tầng 4-5 vào gói thì màn vẫn không vẽ ra. */
  /* XẾP LẠI THEO MÃ. Từ 9.47 FAMILIES nối từ HAI gói — nghề (tầng 1-3)
     và nghề cao (tầng 4-5) — mà hai gói ấy tải song song, nên thứ tự nối
     phụ thuộc gói nào về trước. Mã đang có chỗ chọn nhà theo VỊ TRÍ
     (myFamily lấy ds[2] cho cổng Coach), nên không xếp lại thì cùng một
     tài khoản mở hai lần ra hai nhà khác nhau — một lỗi chỉ hiện lúc mạng
     chậm, và loại lỗi ấy không ai lần ra được từ báo cáo của người dùng. */
  var ds = (typeof G.xkLocNha === 'function') ? G.xkLocNha(G.FAMILIES) : G.FAMILIES;
  return ds.slice().sort(function (a, b) {
    return String(a.id) < String(b.id) ? -1 : (String(a.id) > String(b.id) ? 1 : 0);
  });
};
G.myFamily = function(){
  var ds = G.dsNha();
  if(!ds || !ds.length) return NHA_TRONG;
  var p = G.myPortal();
  if(p==='ph' || p==='hs') return ds[0];
  if(p==='coach') return ds[2] || ds[0];
  return ds.filter(function(f){return f.id===G.S.famId;})[0] || ds[0];
};
G.searchBox = function(ph, key){
  return '<div class="row" style="gap:10px"><div style="flex:1;position:relative">'+
    '<span style="position:absolute;left:16px;top:50%;transform:translateY(-50%);color:var(--ink-4)">'+ic('search','w-4 h-4')+'</span>'+
    '<input data-search="'+h(key)+'" placeholder="'+h(ph)+'" '+
    'style="width:100%;background:var(--phu-2);border:1px solid var(--line);border-radius:99px;'+
    'padding:12px 20px 12px 44px;font-size:14.5px;outline:none"></div></div>';
};
G.famTable = function(list){
  return U.tbl(['Gia đình','Tầng','Ngày','Nhắc/tuần','Tự chủ','Vai','Băng','Coach'],
    list.map(function(f){
      var t = G.tierOf(f.tier);
      return ['<b>'+h(f.nha)+'</b><div class="tiny muted">'+h(f.hv)+' · '+h(f.lop)+'</div>',
        U.chip(t.code, t.c), '<span class="mono">'+f.ngay+'</span>',
        '<span class="mono">'+f.nhac+'</span>',
        '<div style="min-width:88px">'+U.bar(f.tuchu,'#0B7350')+'<span class="tiny mono muted">'+f.tuchu+'%</span></div>',
        '<span class="mono">'+f.vai+'/9</span>',
        '<span class="chip" style="color:'+G.bandColor(f.band)+';border-color:'+G.bandColor(f.band)+'55">'+h(f.band)+'</span>',
        '<span class="sm">'+h(f.coach)+'</span>'];
    }));
};

/* ═══════════════ CỔNG VÀO ═══════════════ */
/* ═══════════════ TẦM NHÌN VÀ BẢN ĐỒ Ở CỔNG VÀO ═══════════════
   Người lạ mở app lần đầu cần thấy GITA 365 đi về đâu và con đường
   trông thế nào — trước cả khi nghĩ tới chuyện đăng nhập. */
function banDoSVG(){
  var T = G.TIERS, n = T.length;
  var W = 560, H = 330, L = 46, R = 24;
  var yDau = 238, yCuoi = 92;                 /* T1 thấp, T5 cao */
  var b = (W - L - R) / (n - 1);
  var x = function(i){ return L + i * b; };
  var y = function(i){ return yDau - (yDau - yCuoi) * i / (n - 1); };

  var o = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" '+
    'aria-label="Bản đồ gia đình thịnh vượng — năm chặng từ nhận diện tới bứt phá">'+
    '<defs><linearGradient id="gDuong" x1="0" y1="1" x2="1" y2="0">'+
    T.map(function(t, i){ return '<stop offset="' + Math.round(i / (n - 1) * 100) + '%" stop-color="' + t.c + '"/>'; }).join('')+
    '</linearGradient></defs>';

  /* Đích, đặt trên cùng bên phải — cách hẳn chặng T5 */
  o += '<text x="' + (W - R) + '" y="24" text-anchor="end" font-size="12" font-weight="800" fill="var(--gita)">Nhà mình tự chạy</text>'+
       '<text x="' + (W - R) + '" y="41" text-anchor="end" font-size="10" fill="#8B85A6">không cần ai canh</text>';

  /* Đường đi lên */
  var d = T.map(function(t, i){ return (i ? 'L' : 'M') + x(i).toFixed(1) + ' ' + y(i).toFixed(1); }).join(' ');
  o += '<path d="' + d + '" fill="none" stroke="url(#gDuong)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" opacity=".8"/>';

  /* Năm chặng */
  T.forEach(function(t, i){
    var cx = x(i), cy = y(i);
    o += '<circle cx="' + cx.toFixed(1) + '" cy="' + cy.toFixed(1) + '" r="16" fill="' + t.c + '" opacity=".18"/>'+
      '<circle cx="' + cx.toFixed(1) + '" cy="' + cy.toFixed(1) + '" r="10" fill="' + t.c + '"/>'+
      '<text x="' + cx.toFixed(1) + '" y="' + (cy + 3.6).toFixed(1) + '" text-anchor="middle" '+
      'font-size="10" font-weight="800" fill="#FFFFFF">' + h(t.code) + '</text>'+
      '<text x="' + cx.toFixed(1) + '" y="' + (cy - 23).toFixed(1) + '" text-anchor="middle" '+
      'font-size="11" font-weight="800" letter-spacing=".03em" fill="' + t.c + '">' + h(t.name) + '</text>'+
      '<text x="' + cx.toFixed(1) + '" y="' + (cy + 27).toFixed(1) + '" text-anchor="middle" '+
      'font-size="9.5" fill="#8B85A6">' + h(t.days + ' ngày') + '</text>';
  });

  /* Bốn miền G–I–T–A: lăng kính nằm dưới cả năm chặng */
  o += '<text x="' + L + '" y="286" font-size="9" letter-spacing=".1em" fill="#655F7E">ĐỌC QUA BỐN MIỀN</text>';
  /* Nhãn rút gọn cho ô hẹp. Tên đầy đủ nằm ở màn hình Bản đồ G–I–T–A. */
  var NHAN = { G:'MỤC TIÊU', I:'NỘI LỰC', T:'NĂNG LỰC', A:'HÀNH ĐỘNG' };
  var G4 = G.GITA, bg = (W - L - R) / 4, wo = bg - 6;
  G4.forEach(function(g, i){
    var gx = L + i * bg;
    var nh = (g.k + ' · ' + (NHAN[g.k] || g.short.toUpperCase()));
    /* Ước lượng bề rộng rồi co chữ nếu vẫn tràn — nhãn dài về sau cũng không vỡ ô */
    var co = 9.5;
    while (co > 6.5 && nh.length * co * 0.58 > wo - 8) co -= 0.5;
    o += '<rect x="' + gx.toFixed(1) + '" y="296" width="' + wo.toFixed(1) + '" height="20" rx="6" fill="' + g.c + '" opacity=".16"/>'+
      '<text x="' + (gx + wo / 2).toFixed(1) + '" y="310" text-anchor="middle" '+
      'font-size="' + co + '" font-weight="700" letter-spacing=".04em" fill="' + g.c + '">' + h(nh) + '</text>';
  });
  return o + '</svg>';
}

function tamNhinBanDo(){
  var C = G.CULTURE || {}, SM = C.suMenh || {};
  return '<div class="tn-khoi">'+
    '<div class="tn-nhan">'+ic('compass','w-4 h-4')+'<span>'+h(G.L('gateVisionEyebrow'))+'</span></div>'+
    '<p class="tn-tam-nhin">'+h(G.L('gateVisionTitle'))+'</p>'+

    '<div class="tn-bando">'+
      '<div class="tn-bd-nhan">'+h(G.L('gateMapTitle'))+'</div>'+
      banDoSVG()+
    '</div>'+

    '<div class="tn-sm">'+
      '<div class="tiny up" style="color:var(--gita-ink);margin-bottom:5px">'+h(SM.t || 'SỨ MỆNH')+'</div>'+
      '<p class="sm" style="line-height:1.7;color:var(--ink-2)">'+h(G.L('gateMission'))+'</p>'+
    '</div></div>';
}

G.veCong = function(){ gate(); };
function gate(){
  var o = '<div id="gate">'+
   '<div class="gate-top"><div class="brand"><span class="mark">'+G.dauGita()+'</span>'+
   '<div><div class="nm">GITA 365</div><div class="sub">'+h(G.L('brandSub'))+'</div></div></div>'+
   '<span class="grow"></span>'+
   G.LANGS.map(function(l){
     return '<button class="chip'+(l.k===G.LANG?' on':'')+'" data-lang="'+h(l.k)+'">'+h(l.flag)+'</button>';
   }).join('')+
   '<span class="chip">v'+h(G.META.version)+'</span>'+
   '<span class="chip deskonly">Hotline '+h(G.META.hotline)+'</span></div>'+

   '<div class="gate-body"><div class="hero">'+
    '<div class="kicker">'+ic('spark','w-4 h-4')+h(G.L('heroKicker'))+'</div>'+
    '<h1>'+h(G.L('heroH1a'))+' <em>'+h(G.L('heroH1b'))+'</em><br>'+h(G.L('heroH1c'))+
      ' <span class="grad-text">'+h(G.L('heroH1d'))+'</span></h1>'+
    '<p class="lead">'+U.nl(G.L('heroLead'))+'</p>'+
    '<div class="row wrap" style="gap:10px">'+
      '<button class="btn pri" data-act="scroll-login">'+ic('arrow')+h(G.L('heroBtn1'))+'</button>'+
      /* Cửa cho người CHƯA có tài khoản. Hai nút cũ đều dẫn vào ô mật
         khẩu — không nút nào trả lời câu hỏi đầu tiên của một người
         lạ: chỗ này làm gì, tôi có đúng chỗ không. Đặt trước nút tài
         khoản thử vì thứ tự nút là thứ tự người ta đọc, và người lạ
         đông hơn người đến để xem bảng tài khoản nội bộ. */
      '<button class="btn ghost" data-act="xem-truoc">'+ic('compass')+h(G.L('heroBtn3'))+'</button>'+
      '<button class="btn ghost" data-act="show-accounts">'+ic('users')+h(G.L('heroBtn2'))+'</button></div>'+
    '</div>'+

    '<div class="gate-card" id="loginCard">'+
     tamNhinBanDo()+
     '<div class="mt2" style="padding-top:16px;border-top:1px solid var(--line)">'+
       '<div class="tiny up muted mb">'+h(G.L('orLogin'))+'</div>'+
       '<div class="card pad-sm mb" style="border-color:var(--gita-vien-1);background:var(--gita-mo-1)">'+
         '<p class="tiny" style="line-height:1.65;color:var(--ink-2)">'+h(G.L('loginHint'))+'</p>'+
         '<button class="btn ghost sm mt" data-act="show-accounts" style="width:100%">'+ic('users')+h(G.L('seePw'))+'</button>'+
       '</div>'+
       '<input id="inU" placeholder="name@gita365.vn" autocomplete="username" '+
       'style="width:100%;background:var(--phu-2);border:1px solid var(--line);border-radius:13px;padding:11px 15px;font-size:14.5px;outline:none;margin-bottom:8px">'+
       '<input id="inP" type="password" placeholder="'+h(G.L('pw'))+'" autocomplete="current-password" '+
       'style="width:100%;background:var(--phu-2);border:1px solid var(--line);border-radius:13px;padding:11px 15px;font-size:14.5px;outline:none">'+
       '<button class="btn pri blk mt" data-act="do-login">'+ic('arrow')+h(G.L('login'))+'</button>'+
       /* Đăng nhập bằng KHUÔN MẶT — ẩn sẵn, chỉ hiện khi thiết bị có Face
          ID/Windows Hello/vân tay (isUVPAA). Nhập email rồi bấm. */
       '<button class="btn ghost blk mt" id="btnMat" data-act="dang-nhap-mat" style="display:none">'+
         ic('lock')+h(G.L('loginFace'))+'</button>'+
       '<button class="btn ghost blk mt" data-act="mo-dang-ky">'+ic('plus')+h(G.L('signUp'))+'</button>'+
       '<button class="btn ghost blk mt" data-act="xem-truoc" style="font-size:12.5px">'+h(G.L('heroBtn3'))+'</button>'+
       '<button class="btn ghost blk mt" data-act="quen-mk" style="font-size:12.5px">'+h(G.L('forgot'))+'</button>'+
       '<p class="tiny muted mt center">'+h(G.L('auditorsNote'))+'</p>'+
     '</div></div></div></div>';
  document.getElementById('app').innerHTML = o;
  /* Hiện nút khuôn mặt chỉ khi thiết bị thật sự có bộ xác thực nền tảng. */
  if (G.stCoNenTang) G.stCoNenTang().then(function (co) {
    var b = document.getElementById('btnMat'); if (b && co) b.style.display = '';
  });
}

G.accountsModal = function(){
  /* Bảng tài khoản xếp theo BA TẦNG QUYỀN, không đổ một danh sách phẳng.
     Mỗi dòng nói thẳng vai này vào thấy bao nhiêu phần trăm hệ thống —
     để anh chị kiểm được phân quyền ngay từ màn đăng nhập. */
  var tong = 0; G.NAV.forEach(function(g){ tong += g.items.length; });
  function pt(vai){
    var n = 0;
    G.NAV.forEach(function(g){ g.items.forEach(function(it){
      if(!it.perm || G.vaiCo(vai, it.perm)) n++; }); });
    return {n:n, p:Math.round(n*100/tong)};
  }
  var KHOI = [
    {t:'BAN ĐIỀU HÀNH', c:'#2A72C6', lv:[1,4],
     mo:'Thấy gần như toàn bộ hệ thống. Chỉ R01 và R02 có thư mục Quản trị trang; tài chính dừng ở R03.'},
    {t:'ĐỘI NGŨ DẪN DẮT', c:'#5140B4', lv:[5,12],
     mo:'Toàn bộ kho nghề và công cụ dẫn dắt. Không thấy tài chính, điều hành toàn hệ và quản trị trang.'},
    {t:'KHÁCH HÀNG & CỘNG TÁC', c:'#0B7350', lv:[13,15],
     mo:'Chỉ thấy phần thuộc về mình. Ba vai này khác nhau rõ rệt, không dùng chung một danh sách.'}
  ];

  var o = '<h2 style="font-size:21px;font-weight:800;margin-bottom:4px">Tài khoản trải nghiệm</h2>'+
    '<p class="sm muted" style="margin-bottom:6px">Mười lăm vị trí, xếp theo ba tầng quyền. '+
    'Cột <b>Thấy được</b> là số màn hình vai đó mở được trên tổng '+tong+' màn — bấm <b>Vào</b> để kiểm ngay.</p>'+
    '<p class="tiny muted" style="margin-bottom:16px">Đây là lớp đăng nhập demo chạy trong trình duyệt để kiểm giao diện và phạm vi từng vai — không phải hệ thống xác thực thật.</p>';

  KHOI.forEach(function(k){
    var ds = G.ACCOUNTS.filter(function(a){
      var r = G.roleById(a.role); return r && r.lv >= k.lv[0] && r.lv <= k.lv[1];
    });
    if(!ds.length) return;
    o += '<div class="tk-khoi" style="--kc:'+k.c+'">'+
      '<div class="tk-h"><b>'+h(k.t)+'</b><span>'+ds.length+' vị trí</span></div>'+
      '<p class="tk-mo">'+h(k.mo)+'</p></div>';
    o += U.tbl(['Vị trí','Tài khoản','Mật khẩu','Thấy được',''], ds.map(function(a){
      var r = G.roleById(a.role), d = pt(a.role);
      return [U.chip(r.n, r.c)+'<div class="tiny muted mt">'+h(a.ten)+'</div>',
        '<span class="mono sm">'+h(a.u)+'</span>',
        '<span class="mono sm" style="color:var(--gold-ink)">'+h(a.p)+'</span>',
        '<b>'+d.p+'%</b><span class="muted sm"> · '+d.n+' màn</span>',
        '<button class="btn sm" data-login="'+h(a.u)+'">Vào</button>'];
    }));
  });

  o += U.sec('BỐN CHUYÊN GIA PHẢN BIỆN','Đăng nhập để chấm hệ thống từ góc nhìn của họ');
  o += U.tbl(['Vai kiểm thử','Tài khoản','Mật khẩu',''], G.AUDITORS.map(function(a){
    return [U.chip(a.ten,'#BE0E16'), '<span class="mono sm">'+h(a.u)+'</span>',
      '<span class="mono sm" style="color:var(--gold-ink)">'+h(a.p)+'</span>',
      '<button class="btn sm" data-login="'+h(a.u)+'">Vào</button>'];
  }));
  U.modal(o);
};

function doLogin(u, p){
  var all = G.ACCOUNTS.concat(G.AUDITORS);
  var a = all.filter(function(x){return x.u.toLowerCase()===String(u||'').trim().toLowerCase();})[0];
  if(!a){ U.toast('Không tìm thấy tài khoản này.','err'); return; }
  if(p !== undefined && p !== null && String(p).length && a.p !== p){
    U.toast('Mật khẩu chưa đúng.','err'); return;
  }
  vaoPhien(a);
}
G.doLogin = doLogin;

/* Vào phiên từ một payload MÁY CHỦ (đăng nhập bằng khuôn mặt, và sau này
   cả mật khẩu thật). Dựng một object tài khoản từ payload rồi đi qua đúng
   vaoPhien — MỘT nguồn cho phần dựng phiên, không chép lại. Token phiên
   lưu vào G.PHIEN_TOKEN để mọi cửa goiMayChu sau đó mang theo. */
function vaoBangPhienMayChu(payload){
  if(!payload || !payload.token){ U.toast('Máy chủ không trả về phiên.','err'); return; }
  G.PHIEN_TOKEN = payload.token;
  var a = { u: payload.u, role: payload.role, ten: payload.hoTen || payload.u,
            maKhachHang: payload.maKhachHang || '', tuMayChu: true };
  vaoPhien(a);
}
G.vaoBangPhienMayChu = vaoBangPhienMayChu;

/* Phần dựng phiên dùng chung cho đăng nhập mẫu VÀ đăng nhập máy chủ. */
function vaoPhien(a){
  /* Đổi người là dọn sổ việc. Sổ việc mang bằng chứng đóng việc — tên
     nhà, chuyện của nhà, chỗ đang vướng — nên nó không được ở lại máy
     khi người khác đăng nhập. Cùng luật với donKho() bên kho khoá. */
  if (G.S.viecCua && G.S.viecCua !== a.u) { G.S.viec = {}; G.S.chotNgay = {}; G.S.chotKhNgay = {}; G.S.caiTien = {}; G.S.mua = null; G.S.vet = []; }
  G.S.viecCua = a.u;
  /* Chỉ mục của trợ lý dựng theo ĐÚNG kho mà vai trước được cấp. Giữ
     lại qua lượt đăng nhập sau là để vai mới tra được kho của vai cũ —
     đúng lớp lỗi mà mục 40 của bộ kiểm canh với dữ liệu nghề. Khoá
     cache trong tro-ly-chi-muc.js cũng tự bắt được, đây là đường chắc
     hơn vì nó không phụ thuộc số kho tình cờ bằng nhau. */
  if (G.tlQuenChiMuc) G.tlQuenChiMuc();
  /* Ngữ cảnh hội thoại giữ MÃ BẢN GHI của kho vai trước được cấp. Để
     lại qua lượt đăng nhập sau là vai mới gõ "còn nữa" mở tiếp kho
     của vai cũ. */
  if (G.tlQuenNgu) G.tlQuenNgu();

  G.S.acc = a; G.S.role = a.role; G.S.roleObj = G.roleById(a.role);
  var portal = G.PORTALS[G.S.roleObj.portal];
  G.S.view = (portal && portal.home) || 'ban-do';
  G.S.open = [groupOf(G.S.view) || 'g1'];
  save();
  manCho('Đang mở kho theo phạm vi được cấp phép…');
  G.napKho().then(function(){
    shell();
    U.toast(G.LOI_CHAO ? G.LOI_CHAO(a.ten)
      : ('Chào ' + a.ten + ' · ' + G.S.roleObj.n), 'ok');
    if(G.batDongBo) G.batDongBo();
    if(G.kiemBanMoi) G.kiemBanMoi();
  });
}

function manCho(loi){
  document.getElementById('app').innerHTML =
    '<div style="min-height:100vh;display:grid;place-items:center;text-align:center;padding:30px">'+
    '<div><div style="width:64px;height:64px;border-radius:20px;margin:0 auto 18px;display:grid;place-items:center;'+
    'overflow:hidden;border:1px solid var(--gita-vien-1);background:#fff">'+G.dauGita()+'</div>'+
    '<b style="font-size:16px;display:block;margin-bottom:6px">'+h(loi)+'</b>'+
    '<p class="sm muted">Nội dung chuyên môn được mã hoá — chỉ mở đúng phần vai này được cấp.</p>'+
    '<div style="width:220px;margin:16px auto 0">'+U.bar(100,'var(--gita)')+'</div></div></div>';
}

/* ═══════════════ KHUNG ỨNG DỤNG ═══════════════ */
function groupOf(v){
  for(var i=0;i<G.NAV.length;i++)
    for(var j=0;j<G.NAV[i].items.length;j++)
      if(G.NAV[i].items[j].v===v) return G.NAV[i].id;
  return null;
}
/* ── Mục nào ĐƯỢC HIỆN trong cột trái ──
   Hai điều kiện, phải đủ cả hai.

   1. Quyền của VAI. Đây là điều kiện cũ, giữ nguyên.
   2. GÓI NỘI DUNG của mục đó đã được cấp cho tài khoản này.

   Điều kiện 2 là phần thêm ở v9.3, và nó là phần anh Quang hỏi: thư mục
   nào giới hạn theo tầng thì đừng hiện ra ở cột trái. Trước đây cột trái
   chỉ lọc theo vai, nên một nhà đang ở tầng một vẫn nhìn thấy tên mọi
   mục của tầng năm, bấm vào thì gặp tường "phần này chưa mở". Thấy tên
   rồi bị chặn thì tệ hơn không thấy: nó biến mỗi lần bấm thành một lần
   bị từ chối.

   Gói đang trên đường nạp vẫn tính là hiện — nếu không thì lúc đăng nhập
   xong, cột trái sẽ rụng gần hết mục rồi mọc lại sau một hai giây.

   Lên tầng thì tự hiện: G.KHO.daNap đổi sau khi máy chủ cấp khoá mới,
   leftNav() dựng lại mỗi lần vẽ, nên không cần làm gì thêm. */
function visible(it){
  if(it.perm && !G.can(it.perm)) return false;
  /* Điều kiện thứ ba, tuỳ chọn: một số mục chỉ có nghĩa khi DỮ LIỆU của
     vai ấy tồn tại. Ví dụ "Danh mục đầu việc" — danh mục chỉ có đầu việc
     cho mười ba vị trí trong hệ, không có cho phụ huynh và học viên. Khoá
     bằng perm thì không diễn tả được (perm là ngưỡng bậc, mà tập cần khoá
     là "mọi vai TRỪ hai vai cuối"), còn để nguyên thì phụ huynh bấm vào
     và nhận một thẻ rỗng.
     Dựng theo dữ liệu thì tự đúng: ngày nào danh mục có đầu việc cho gia
     đình, mục tự hiện, không phải sửa bảng quyền. */
  if(it.hienKhi && typeof G[it.hienKhi] === 'function' && !G[it.hienKhi]()) return false;
  var goi = G.goiCanCho ? G.goiCanCho(it.v) : null;
  if(goi){
    if(G.KHO && G.KHO.dangNap && G.KHO.dangNap.indexOf(goi) >= 0) return true;
    if(G.coGoi && !G.coGoi(goi)) return false;
  }
  /* ── ĐIỀU KIỆN CUỐI: MÀN PHẢI CÓ THẬT ──
     Bộ lọc này kiểm quyền, kiểm dữ liệu, kiểm gói — mà không kiểm thứ
     đơn giản nhất: có hàm dựng màn không.

     Đo được ở 9.78 bằng cách lái thử như người dùng: cột trái của phụ
     huynh có 64 nút, hai nút trong đó — bo-test và kpi-100 — trỏ vào
     màn KHÔNG có trong gói mã của gia đình. Bấm vào thì G.go() lặng
     lẽ trả về, không đổi màn, không báo gì. Người dùng bấm ba lần rồi
     nghĩ máy hỏng.

     Không chỗ nào đỏ vì mọi phép kiểm cũ đứng ở phía LUẬT: chúng hỏi
     "mục này có được phép hiện không", và câu trả lời là có. Không ai
     hỏi "bấm vào thì có gì xảy ra không".

     Nhưng G.manCoThat() tính CẢ MAN_NGHE, và đó là chỗ phải tách:
     màn của gói nghề đang tải dở thì phải hiện — chúng có thật, chỉ
     chưa về tới. Còn với vai KHÁCH HÀNG thì gói nghề không bao giờ
     về, nên cùng cái tên ấy là một nút chết vĩnh viễn.

     Ba mức, đi từ chắc nhất:
       · có hàm dựng màn ngay tại chỗ   → hiện
       · chỉ nằm trong MAN_NGHE         → hiện KHI vai này có gói nghề
                                          hoặc gói nghề đang trên đường về
       · không ở đâu cả                 → không hiện */
  if (G.VIEWS && G.VIEWS[it.v]) return true;
  if ((G.MAN_NGHE || []).indexOf(it.v) >= 0) {
    if (G.KHO && G.KHO.dangNap && G.KHO.dangNap.indexOf('nghe') >= 0) return true;
    return !!(G.coGoi && G.coGoi('nghe'));
  }
  return false;
}
G.hienTrongCot = visible;

/* ── Mục vừa được cấp thêm sau khi thăng hạng ──
   So tập mục đang mở với tập đã ghi lần trước. Chênh lệch dương là phần
   vừa được cấp — lên tầng, đổi vai, hoặc máy chủ mở thêm phạm vi.

   Vì sao cần: từ v9.3 mục ngoài phạm vi KHÔNG hiện trong cột trái nữa.
   Được cái là khách hàng không còn nhìn thấy danh mục của nghề; mất cái
   là lúc thăng hạng, mục mới lặng lẽ chen vào giữa bốn mươi mục cũ và
   không ai nhận ra mình vừa được cấp thêm gì. Dải này trả lại đúng phần
   đã mất, và chỉ trả lại phần của CHÍNH họ.

   Lần đầu tiên chạy thì ghi sổ rồi im — không có gì để so, và báo "vừa
   mở 45 mục" cho một người mới đăng nhập là báo sai. */
G.mucVuaMo = function(){
  var NAV = G.navDung ? G.navDung() : G.NAV, nay = [];
  NAV.forEach(function(g){ g.items.forEach(function(it){ if(visible(it)) nay.push(it.v); }); });
  var cu = G.S.daThay;
  G.S.daThay = nay;
  if(!cu || !cu.length) return [];
  var moi = nay.filter(function(v){ return cu.indexOf(v) < 0; });
  return moi;
};

function leftNav(){
  var r = G.S.roleObj || {};
  var NAV = G.navDung ? G.navDung() : G.NAV;
  /* Ba con số, không phải hai. Mục chưa hiện chia làm hai loại khác hẳn
     nhau, và gộp chúng lại là nói sai với khách hàng:

       · CHỜ TẦNG — quyền vai đã đủ, chỉ thiếu gói nội dung của tầng.
         Lên tầng là mở. Nói "chưa tới lượt" với loại này là đúng.
       · NGOÀI VAI — kho nghề, tài chính, quản trị. Một phụ huynh sẽ
         KHÔNG BAO GIỜ tới lượt, vì đó không phải việc của họ.

     Dải cũ gộp cả hai thành "86 mục chưa tới lượt" cho phụ huynh — hứa
     một thứ không bao giờ tới. Nay khách hàng chỉ thấy số CHỜ TẦNG; đội
     ngũ vẫn thấy số ngoài phạm vi vì với họ đó là thông tin vận hành. */
  var tongMo = 0, tongKhoa = 0, choTang = 0;
  NAV.forEach(function(g){ g.items.forEach(function(it){
    if(visible(it)){ tongMo++; return; }
    tongKhoa++;
    if(!it.perm || G.can(it.perm)) choTang++;   /* hụt gói, không hụt quyền */
  }); });

  /* Chỉ so khi kho đã nạp xong. Đang nạp mà so thì tập mục còn dao động,
     và dải sẽ báo "vừa mở" rồi "vừa mở" lần nữa trong cùng một lần vào. */
  var vuaMo = (G.KHO && G.KHO.dangNap && G.KHO.dangNap.length) ? [] : G.mucVuaMo();
  var daiMoi = vuaMo.length
    ? '<div class="pv-moi">'+ic('star','w-4 h-4')+
      '<div><b>'+vuaMo.length+' mục vừa mở cho anh chị</b>'+
      '<span>Phạm vi của tài khoản vừa được cấp rộng thêm. Bấm để xem đúng phần nào.</span></div>'+
      '<button class="btn ghost sm" data-v="pham-vi">Xem</button></div>'
    : '';

  /* Dải phạm vi — nhìn một cái là biết đang đăng nhập bằng vai nào và
     vai đó mở được bao nhiêu màn. Trước đây mọi vai trông như nhau. */
  var L = G.LOI_PHAM_VI ? G.LOI_PHAM_VI(tongMo, tongKhoa, choTang)
        : {nhan:r.n||'—', phu:'bậc '+(r.lv||'—'), so:'<b>'+tongMo+'</b> màn hình mở'};
  var dai = '<div class="pv-dai" style="--pv:'+(r.c||'var(--gita)')+'">'+
    '<div class="pv-vai">'+ic('shield','w-4 h-4')+'<b>'+h(L.nhan)+'</b>'+
      (L.phu ? '<span class="pv-bac">'+h(L.phu)+'</span>' : '')+'</div>'+
    '<div class="pv-so">'+L.so+'</div></div>';

  return '<div class="scroll">'+ dai + daiMoi +
    '<div class="nav-eyebrow">'+h(G.L('fiveGroups'))+'</div>' +
    NAV.map(function(g){
      var mo = g.items.filter(visible);
      if(!mo.length) return '';                 /* nhóm không mở được mục nào thì không hiện */
      var open = G.S.open.indexOf(g.id)>=0;
      function nut(it){
        var on = it.v===G.S.view;
        return '<button class="nav-i'+(on?' on':'')+'" data-v="'+h(it.v)+'">'+
          ic(it.ic)+'<span class="lb">'+h(G.iname(it))+'</span>'+
          (it.star?'<span style="color:var(--gold-ink)">'+ic('star','w-3 h-3')+'</span>':'')+'</button>';
      }
      return '<div class="grp'+(open?' open':'')+'">'+
        '<button class="grp-h" data-grp="'+h(g.id)+'">'+
          '<span class="ic" style="background:'+g.c+'1f;color:'+g.c+';border-color:'+g.c+'3a">'+ic(g.ic)+'</span>'+
          '<span class="tx"><b>'+h(G.gname(g))+'</b><span>'+h(G.gsub(g))+'</span></span>'+
          '<span class="no">'+mo.length+'</span>'+ic('chev','cv')+'</button>'+
        '<div class="grp-b">'+
          '<p class="tiny muted" style="padding:2px 10px 9px;line-height:1.5">'+h(G.gess(g))+'</p>'+
          mo.map(nut).join('')+
        '</div></div>';
    }).join('') + '</div>'+
    '<div class="foot"><button class="nav-i" data-v="toi">'+ic('home')+'<span class="lb">'+h(G.L('myAccount'))+'</span></button>'+
    (G.can('sua_noi_dung') ? '<button class="nav-i" data-v="sap-xep">'+ic('orbit')+
      '<span class="lb">Sắp xếp thư mục</span></button>' : '')+
    '<button class="nav-i" data-act="doi-mk-mo">'+ic('lock')+'<span class="lb">'+h(G.L('changePw'))+'</span></button>'+
    (G.API_CAP_PHEP ? '<button class="nav-i" data-act="dong-bo">'+ic('orbit')+'<span class="lb">'+h(G.L('sync'))+
      (G.DONGBO && G.DONGBO.choBaoNhieu ? ' ('+G.DONGBO.choBaoNhieu+')' : '')+'</span></button>' : '')+
    '<button class="nav-i" data-act="logout">'+ic('out')+'<span class="lb">'+h(G.L('logout'))+'</span></button></div>';
}

/* THANH NGANG CÁC PHẦN CHÍNH (9.99.152) — chủ hệ: "thanh đầu mục ngang
   hiển thị các phần chính để tra cứu dễ dàng". Mỗi nhóm G.NAV mở được là
   một tab; bấm thì THẢ panel trái xuống, mở đúng nhóm ấy để chọn tiếp.
   Chỉ hiện khổ ≥861px (điện thoại đã có ☰ + thanh dưới). */
function hnav(){
  var NAV = G.navDung ? G.navDung() : G.NAV;
  return NAV.map(function(g){
    var mo = g.items.filter(visible);
    if(!mo.length) return '';
    var on = G.S.open.indexOf(g.id) >= 0;
    return '<button class="hnav-i'+(on?' on':'')+'" data-sec="'+h(g.id)+'" '+
      'style="--sc:'+g.c+'" title="'+h(G.gsub(g))+'">'+
      ic(g.ic)+'<span>'+h(G.gname(g))+'</span></button>';
  }).join('');
}
G.hnav = hnav;

G.leftNav = leftNav;

var RTABS = [
  {k:'labon',  l:'tabLaban'}, {k:'giatri', l:'tabGiatri'}, {k:'vanhoa', l:'tabVanhoa'},
  {k:'nhip',   l:'tabNhip'},  {k:'congdong',l:'tabCongdong'}
];
function rightPanel(){
  var C = G.cul(), o = '';
  o += '<div class="rt">' + RTABS.map(function(t){
    return '<button data-rt="'+t.k+'" class="'+(G.S.rtab===t.k?'on':'')+'">'+h(G.L(t.l))+'</button>';
  }).join('') + '</div><div class="scroll">';
  if(G.LANG!=='vi' && G.L('langNote'))
    o += '<div class="card pad-sm mb" style="border-color:rgba(56,189,248,.3)">'+
      '<p class="tiny" style="line-height:1.6;color:var(--ink-2)">'+h(G.L('langNote'))+'</p></div>';

  if(G.S.rtab==='labon'){
    o += '<div class="rblock"><h4>'+h(G.L('vision'))+'</h4>'+
      /* Câu tầm nhìn chính thức — cùng một nguồn với Cổng vào, sửa một chỗ là đổi cả hai */
      '<p class="serif" style="font-size:16px;line-height:1.62;color:var(--gita-ink)">'+h(G.L('gateVisionTitle'))+'</p></div>'+
      '<div class="rblock"><h4>'+h(G.L('mission'))+'</h4>'+
      '<p class="sm" style="line-height:1.65;color:var(--ink-2)">'+h(C.suMenh.big)+'</p>'+
      '<p class="tiny muted mt">'+h(C.suMenh.sub)+'</p></div>'+
      '<div class="rblock"><h4>'+h(G.L('compassAct'))+'</h4>'+
      C.kimChiNam.map(function(k){
        return '<div class="rule"><span class="n">'+h(k.n)+'</span><div class="tx"><b>'+h(k.t)+'</b><p>'+h(k.d)+'</p></div></div>';
      }).join('') + '</div>';
  }
  else if(G.S.rtab==='giatri'){
    o += '<div class="rblock"><h4>'+h(G.L('coreValues'))+'</h4>'+
      C.giaTri.map(function(v){
        return '<div class="val"><div class="hd"><span class="k" style="background:'+v.c+'26;color:'+v.c+'">'+h(v.k)+'</span>'+
          '<b>'+h(v.t)+'</b></div><p>'+h(v.d)+'</p>'+
          '<div class="do">'+ic('check','w-3 h-3')+'<span>'+h(v.nen)+'</span></div>'+
          '<div class="dont">'+ic('x','w-3 h-3')+'<span>'+h(v.khong)+'</span></div></div>';
      }).join('') + '</div>';
  }
  else if(G.S.rtab==='vanhoa'){
    o += '<div class="rblock"><h4>'+h(G.L('houseRules'))+'</h4>'+
      C.noiQuy.map(function(r,i){
        return '<div class="rule"><span class="n">'+(i+1)+'</span><div class="tx"><b>'+h(r.t)+'</b><p>'+h(r.d)+'</p></div></div>';
      }).join('') + '</div>'+
      '<div class="rblock"><h4>'+h(G.L('fourBeats'))+'</h4>'+
      C.bonNhip.map(function(b,i){
        return '<div class="rule"><span class="n">'+(i+1)+'</span><div class="tx"><b>'+h(b.t)+'</b><p>'+h(b.d)+'</p></div></div>';
      }).join('') + '</div>'+
      (G.VANHANH ? '<div class="rblock"><h4>'+h(G.L('sixLines'))+'</h4>'+
      (G.VANHANH.ranhGioi.muc||[]).map(function(m,i){
        return '<div class="rule"><span class="n" style="background:rgba(248,113,113,.16);color:var(--bad)">✕</span>'+
          '<div class="tx"><b>'+h(m.khong)+'</b></div></div>';
      }).join('') +
      '<button class="btn ghost sm blk mt" data-v="ranh-gioi">'+h(G.L('openFull'))+' '+ic('arrow')+'</button></div>' : '');
  }
  else if(G.S.rtab==='nhip'){
    o += '<div class="creed"><p>'+h(C.slogan)+'</p><cite>'+h(C.sloganSub)+'</cite></div>'+
      '<div class="rblock"><h4>'+h(G.L('rhythm'))+'</h4>'+
      C.nhip.map(function(n){
        return '<div class="val" style="border-color:'+n.c+'2e"><div class="hd">'+
          '<span class="k" style="background:'+n.c+'26;color:'+n.c+'">'+h(n.k)+'</span></div>'+
          '<p style="color:var(--ink-2)">'+h(n.t)+'</p></div>';
      }).join('') + '</div>'+
      '<div class="rblock"><h4>'+h(G.L('creeds'))+'</h4>'+
      C.camNiem.map(function(c){
        return '<div class="creed"><p style="font-size:14.5px">'+h(c.t)+'</p><cite>'+h(c.by)+'</cite></div>';
      }).join('') + '</div>';
  }
  else {
    o += '<div class="rblock"><h4>'+h(G.L('forCommunity'))+'</h4>'+
      C.choCongDong.map(function(x,i){
        return '<div class="rule"><span class="n">'+(i+1)+'</span><div class="tx"><b>'+h(x.n)+'</b><p>'+h(x.d)+'</p></div></div>';
      }).join('') + '</div>'+
      '<div class="rblock"><h4>'+h(G.L('fiveTiers'))+'</h4>'+
      G.TIERS.map(function(t){
        return '<div class="val" style="border-color:'+t.c+'2e"><div class="hd">'+
          '<span class="k" style="background:'+t.c+'26;color:'+t.c+'">'+t.code+'</span><b>'+h(G.tname(t))+'</b></div>'+
          '<p>'+h(G.tq(t))+'</p></div>';
      }).join('') + '</div>';
  }
  return o + '</div>';
}

function topBar(){
  var r = G.S.roleObj, a = G.S.acc;
  return '<div class="brand"><button class="tbtn" data-act="toggle-left" aria-label="Menu" title="Danh mục">'+ic('menu')+'</button>'+
    '<button class="brand" data-v="'+h((G.PORTALS[r.portal]||{}).home||'ban-do')+'" style="gap:11px">'+
    '<span class="mark">'+G.dauGita()+'</span><div class="deskonly" style="text-align:left">'+
    '<div class="nm">GITA 365</div><div class="sub">'+h(G.L('brandSub'))+'</div></div></button></div>'+
    '<button id="search" data-act="cmd">'+ic('search')+'<span>'+h(G.L('search'))+'</span><kbd>Ctrl K</kbd></button>'+
    '<span class="grow"></span>'+
    '<span class="chip deskonly" style="color:'+r.c+';border-color:'+r.c+'55">'+ic('shield','w-3 h-3')+h(r.short)+' · LV'+r.lv+'</span>'+
    /* Công tắc MỞ HẾT — chỉ cấp quản trị thấy. Đặt ngay cạnh chip vai vì
       nó đổi cách MỌI màn hình hiện ra; giấu nó vào một màn cài đặt thì
       người bật xong sang màn khác sẽ quên là mình đang bật. */
    (G.moHetDuoc && G.moHetDuoc()
      ? '<button class="tbtn deskonly" data-act="mo-het" aria-label="Mở hết — không cắt bớt" '+
        'title="'+(G.MO_HET ? 'Đang MỞ HẾT: mọi danh sách và đoạn chữ hiện đủ. Bấm để về bản gọn.'
                            : 'Mở hết: bỏ cắt bớt trên mọi màn, để rà từ A đến Z.')+'" '+
        'style="'+(G.MO_HET
          ? 'color:var(--ok);border-color:var(--ok);background:rgba(16,185,129,.12)'
          : 'color:var(--ink-4)')+'">'+ic('orbit')+'</button>'
      : '')+
    '<button class="tbtn" data-v="tro-ly" aria-label="Trợ lý GITA" title="Trợ lý GITA" '+
      'style="color:var(--gita-ink);border-color:var(--gita-vien-1)">'+ic('spark')+'</button>'+
    /* Thu phóng đứng NGAY CẠNH nút đổi nền, không giấu vào một màn cài
       đặt: nó là thứ người ta với tay tới giữa lúc đang đọc dở một bảng,
       chứ không phải thứ người ta đi tìm trước khi bắt đầu đọc. */
    (G.phongNut ? G.phongNut() : '')+
    '<button class="tbtn" data-act="doi-nen" aria-label="Đổi nền sáng tối" title="Đổi nền sáng / tối">'+
      ic(G.NEN==='toi'?'sun':'moon')+'</button>'+
    '<button class="tbtn" data-act="lang" aria-label="Language" style="font-size:12.5px;font-weight:800;letter-spacing:.04em">'+
      h(G.LANG.toUpperCase())+'</button>'+
    (G.INSTALL ? '<button class="tbtn" data-act="install" aria-label="Cài đặt ứng dụng" style="color:var(--gold-ink);border-color:var(--gita-vien-2)">'+ic('plus')+'</button>' : '')+
    /* THU GỌN HAI CỘT — mở rộng màn chính full. Bấm lần nữa (thanh tổng)
       để hai cột hiện lại. Chỉ desktop: trên điện thoại hai cột vốn là
       ngăn kéo đóng sẵn, thu gọn không thêm gì. */
    '<button class="tbtn deskonly'+(G.S.thuCot?' on':'')+'" data-act="thu-cot" '+
      'aria-label="Thu gọn hai cột, mở rộng màn chính" aria-pressed="'+(G.S.thuCot?'true':'false')+'" '+
      'title="'+(G.S.thuCot?'Đang mở rộng full màn. Bấm để hiện lại hai cột.'
                          :'Thu gọn hai cột để mở rộng màn chính. Bấm lần nữa để hiện lại.')+'" '+
      'style="'+(G.S.thuCot?'color:var(--gita-ink);border-color:var(--gita-vien-2);background:var(--gita-mo-1)':'')+'">'+
      ic('zoom')+'</button>'+
    '<button class="tbtn" data-act="toggle-right" aria-label="'+h(G.L('compass'))+'">'+ic('compass')+'</button>'+
    /* Đăng xuất phải nằm ngay trên thanh, không chỉ dưới đáy thanh trái —
       trên điện thoại thanh trái là ngăn kéo đóng sẵn, người dùng có thể
       không tìm ra và tưởng phần đăng nhập biến mất. */
    '<button class="tbtn" data-act="logout" aria-label="'+h(G.L('logout'))+'" title="'+h(G.L('logout'))+'">'+
      ic('out')+'</button>'+
    '<button class="who" data-v="toi">'+
      '<div class="tx deskonly"><b>'+h(a.ten)+'</b><span>'+h(a.nha)+'</span></div>'+
      '<span class="av" style="background:linear-gradient(135deg,'+r.c+',var(--gita-do))">'+
      h(a.ten.split(' ').slice(-1)[0].slice(0,2).toUpperCase())+'</span></button>';
}

function shell(){
  document.getElementById('app').innerHTML =
    '<div id="top">'+topBar()+'</div>'+
    '<nav id="hnav" aria-label="Các phần chính">'+hnav()+'</nav>'+
    '<div id="scrim"></div>'+
    '<aside id="left">'+leftNav()+'</aside>'+
    '<div class="shell'+(G.S.rightOpen?'':' no-right')+'" id="shell">'+
      '<main id="main"></main>'+
    '</div>'+
    '<aside id="right" class="'+(G.S.rightOpen?'open':'')+'">'+rightPanel()+'</aside>'+
    /* Thanh dưới đáy — chỉ hiện trên khổ điện thoại, luật ở style.css.
       Dựng luôn ở đây chứ không dựng lúc cần: một thẻ chèn vào DOM sau
       này sẽ biến mất ở lần dựng vỏ kế tiếp. */
    '<nav id="duoi" aria-label="Điều hướng nhanh">'+(G.thanhDuoi?G.thanhDuoi():'')+'</nav>';
  /* Trạng thái thu cột nhớ qua phiên — áp lại lúc dựng vỏ. */
  document.body.classList.toggle('thu-cot', !!G.S.thuCot);
  render();
}

/* Chốt quyền tập trung — mọi màn hình đều đi qua đây, kể cả khi vào thẳng
   bằng trạng thái đã lưu hoặc bằng liên kết. Nav chỉ ẩn nút; đây mới là cổng. */
G.navItem = function(v){
  var it = null;
  G.NAV.forEach(function(g){ g.items.forEach(function(x){ if(x.v===v) it = x; }); });
  return it;
};
/* Cửa của ĐƯỜNG ĐI, phải khớp với cửa của CỘT TRÁI.
   Cột trái ẩn mục bằng visible(); nếu allowed() không hỏi cùng những
   điều kiện ấy thì một màn đã ẩn khỏi cột vẫn mở được bằng cách gõ
   thẳng địa chỉ — ẩn mà vẫn vào được thì không phải ẩn. */
G.allowed = function(v){
  var it = G.navItem(v);
  if(!it) return true;
  if(it.perm && !G.can(it.perm)) return false;
  if(it.hienKhi && typeof G[it.hienKhi] === 'function' && !G[it.hienKhi]()) return false;
  return true;
};

function dangMoKho(goi){
  return U.ph({eyebrow:'ĐANG MỞ KHO', ic:'vault', t:'Đang mở gói nội dung của tầng',
    lead:'Gói này nặng hơn phần nền nên được mở ở nền sau khi đăng nhập. Xong là màn hình tự hiện ra, không phải bấm gì thêm.'}) +
    '<div class="card center" style="padding:36px">' + U.bar(60,'var(--gold)') +
    '<p class="sm muted mt">Đang mở <b class="mono">' + U.h(goi) + '</b> · ' +
    U.h(String((G.KHO.daNap||[]).length)) + ' gói đã mở xong</p></div>';
}

/* Một cái tên màn CÓ THẬT hay không — khác với dựng được ngay hay chưa.

   Từ bản 9.23 mã dựng màn của nghề nằm ở gói riêng, chỉ tải khi giấy
   phép có gói nghề. Nên G.VIEWS[v] trả lời được câu "dựng được chưa"
   nhưng KHÔNG trả lời được câu "tên này có thật không" — và các bảng
   tra chéo trong kho hỏi đúng câu thứ hai.

   Để chung một hàm vì ba chỗ đã hỏi câu ấy theo ba cách khác nhau, và
   ba cách rồi sẽ có ngày lệch. */
G.manCoThat = function(v){
  return !!(v && (G.VIEWS[v] || (G.MAN_NGHE||[]).indexOf(v) >= 0));
};

/* ── Bù TÊN ĐỌC ĐƯỢC cho ô nhập (a11y — 9.99.121) ──
   Kho không có hàm dựng ô chung, nên 150+ ô nhập rải khắp src/ thiếu tên cho
   trình đọc màn hình: người khiếm thị nghe "ô nhập, không tên". Vá từng ô là
   150 chỗ dễ sót và dễ trôi lại; vá Ở ĐÂY — một chỗ, chạy sau mỗi render —
   phủ mọi ô hiện có LẪN ô viết sau. Chuỗi dự phòng: đã có tên (aria/label/
   title/bọc label) → giữ nguyên; placeholder (mô tả sẵn) → nhãn đứng ngay
   trước ô → generic theo loại. KHÔNG xoá placeholder: chỉ THÊM aria-label, vì
   trình đọc màn cần TÊN ổn định còn placeholder biến mất khi gõ.
   do-khung-man mục a11y canh đúng lớp này; phá thử: tắt hàm → đỏ ~20 màn. */
G.a11yNhan = function (root) {
  try {
    var os = (root || document).querySelectorAll('input,textarea,select');
    for (var i = 0; i < os.length; i++) {
      var el = os[i];
      if (el.type === 'hidden') continue;
      if ((el.getAttribute('aria-label') || '').trim() || el.getAttribute('aria-labelledby') ||
          (el.getAttribute('title') || '').trim() ||
          (el.id && document.querySelector('label[for="' + el.id.replace(/["\\]/g, '') + '"]')) ||
          (el.closest && el.closest('label'))) continue;
      var t = (el.getAttribute('placeholder') || '').trim();
      if (!t) {
        var p = el.previousElementSibling;
        while (p && !(p.textContent || '').trim()) p = p.previousElementSibling;
        if (p) t = (p.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 60);
      }
      if (!t) t = el.tagName === 'SELECT' ? 'Ô chọn' :
        (el.type === 'search' ? 'Ô tìm kiếm' : 'Ô nhập');
      el.setAttribute('aria-label', t);
    }
  } catch (e) {}
};

function render(){
  var main = document.getElementById('main');
  /* Màn của gói nghề mà mã chưa về: NÓI ĐANG MỞ, đừng nhảy về bản đồ.

     Trước bản 9.23 dòng này chỉ có một vế — thiếu màn thì đổi sang
     'ban-do'. Lúc mọi màn nằm chung một gói thì vế ấy chỉ chạy khi có
     lỗi thật. Từ khi mã nghề tách ra, nó thành đường đi bình thường của
     mỗi lần đăng nhập — và một cú nhảy im lặng về bản đồ là đúng lớp
     hỏng ngầm mà bộ gộp đã cảnh báo ngay đầu tệp của nó. */
  if(!G.VIEWS[G.S.view] && (G.MAN_NGHE||[]).indexOf(G.S.view) >= 0 &&
     G.KHO && G.KHO.dangNap && G.KHO.dangNap.indexOf('ma-nghe') >= 0){
    main.innerHTML = '<div class="view">' + dangMoKho('mã của gói nghề') + '</div>';
    var lM = document.getElementById('left'); if(lM) lM.innerHTML = leftNav();
    return;
  }
  if(!G.VIEWS[G.S.view]) G.S.view = 'ban-do';
  if(!G.allowed(G.S.view)){
    var it = G.navItem(G.S.view);
    main.innerHTML = '<div class="view">' + U.ph({eyebrow:'NGOÀI PHẠM VI CỦA VAI', ic:'lock',
      t:(it?it.t:'Mục này'), lead:'Vai đang dùng không có quyền mở mục này.'}) +
      U.lockCard('Mục này cần quyền ' + U.h(it && it.perm) + '. Đăng nhập bằng vai có cấp đủ để mở — danh sách tài khoản thử nằm ở màn hình Cổng vào và ở mục Quản trị con người.') + '</div>';
    var l0 = document.getElementById('left'); if(l0) l0.innerHTML = leftNav();
    save(); return;
  }
  var goiCan = G.goiCanCho(G.S.view);
  if(!G.coGoi(goiCan)){
    /* Gói đang mở ở nền: nói thật là đang mở, không nói là chưa được cấp phép. */
    var dang = G.KHO.dangNap && G.KHO.dangNap.indexOf(goiCan) >= 0;
    main.innerHTML = '<div class="view">' + (dang ? dangMoKho(goiCan) : G.canCapPhep(goiCan)) + '</div>';
    var lK = document.getElementById('left'); if(lK) lK.innerHTML = leftNav();
    save(); return;
  }
  /* Màn hình nào cũng phải dựng được. Thiếu nội dung đã cấp phép thì hiện
     màn xin cấp phép, không bao giờ để trắng trang hoặc vỡ ứng dụng. */
  var fn = G.VIEWS[G.S.view], noiDung;
  try {
    noiDung = fn();
    if(!noiDung || String(noiDung).length < 40) throw new Error('Màn hình chưa có nội dung');
  } catch(e) {
    console.warn('[GITA] ' + G.S.view + ': ' + e.message);
    noiDung = G.canCapPhep(goiCan || 'nen');
  }
  /* Thanh nhắc đứng trước nội dung: có việc trễ nhịp thì thấy ngay, không
     phải đi tìm. Không có việc trễ thì không chiếm chỗ. */
  var nhac = (G.thanhNhac && G.S.view !== 'vong-nhac') ? G.thanhNhac() : '';
  main.innerHTML = '<div class="view">' + nhac + noiDung + '</div>';
  if(G.a11yNhan) G.a11yNhan(main);   /* bù tên đọc được cho mọi ô nhập (a11y) */
  /* Màn trợ lý là một CỬA SỔ chiếm trọn chiều cao, nên nó cần lề dưới
     của vùng nội dung nhỏ lại. Lớp này là chỗ duy nhất khai chuyện ấy —
     tự tính chiều cao trong CSS mà không gỡ lề thì cửa sổ luôn thừa ra
     90px và cả trang sinh thanh cuộn thứ hai. */
  document.body.classList.toggle('man-chat', G.S.view === 'tro-ly');
  if(G.watermark) G.watermark();
  /* Khoá sao chép cho tài khoản khách hàng: bật lớp thân trang và gỡ mọi
     đường tải xuống vừa được dựng ra. Phải chạy SAU khi màn hình đã vào
     DOM, nên đặt cạnh đóng dấu chìm. */
  if(G.batKhoaChep) G.batKhoaChep();
  /* Trình phát audio: gỡ nút tải của trình duyệt sau mỗi lần vẽ lại.
     Phải chạy SAU khoá sao chép, vì lớp ấy quét lại toàn bộ màn. */
  if(G.adDonTrinhPhat) G.adDonTrinhPhat();
  if(G.dem) G.dem();
  /* Đồng hồ đo thời gian thật: báo cho nó biết đang ở màn nào. Nó tự lo
     phần dừng khi tab chạy nền hoặc khi người dùng đứng yên. */
  if(G.tgVaoMan) G.tgVaoMan(G.S.view);
  try{ if(history.replaceState) history.replaceState(null,'','#'+G.S.view); }catch(e){}
  window.scrollTo(0,0);
  var left = document.getElementById('left');
  if(left) left.innerHTML = leftNav();
  /* Thanh ngang phần chính: đồng bộ tab đang sáng theo nhóm của màn */
  var hn = document.getElementById('hnav'); if(hn) hn.innerHTML = hnav();
  /* Thanh dưới phải vẽ lại mỗi lần đổi màn, không thì ô đang đứng sáng
     ở chỗ cũ và nó chỉ sai đường cho người dùng. */
  if(G.duoiVe) G.duoiVe();
  /* Ô chat trợ lý nổi ở góc (9.99.125): dựng một lần, treo vào body nên
     sống qua mọi lần vẽ lại; ẩn/hiện theo phiên và theo màn mỗi lần vẽ. */
  if(G.tlnMount){ G.tlnMount(); if(G.tlnCap) G.tlnCap(); }
  save();
}
G.render = render;
/* ── Dựng lại cột trái, không đụng tới màn đang mở ──
   Cần từ bản 9.9, khi gói nghề chuyển sang mở ở nền. Vài mục trong cột
   chỉ hiện khi CÓ dữ liệu trong kho — "Bảng công việc" và "Danh mục đầu
   việc" hỏi G.cvVaiCoDauViec(), mà hàm ấy đọc danh mục nằm trong gói
   nghề. Lúc cột được dựng lần đầu thì gói chưa về, nên hai mục ấy bị ẩn;
   và trước khi có hàm này thì chúng ẩn LUÔN cho tới lần chuyển màn kế
   tiếp, vì chỉ render() mới dựng lại cột.

   Bộ kiểm bắt được đúng chỗ ấy: Super Admin thiếu hai nút trong cột. */
G.veLaiCot = function(){
  var l = document.getElementById('left');
  if(l) l.innerHTML = leftNav();
};
G.save   = save;
/* load ra ngoài để bộ kiểm đi được TRỌN vòng ghi–đọc. Chỉ kiểm save() thì
   một khoá khai ở save mà quên ở load vẫn xanh — mà đó đúng là nửa còn lại
   của cùng một lớp lỗi im lặng. */
G.load   = load;
G.dangXuat = function(){ var b=document.querySelector('[data-act="logout"]'); if(b) b.click(); };

G.go = function(v){
  if(!G.manCoThat(v)) return;
  if(!G.allowed(v)){ U.toast(G.L('lock'),'err'); return; }
  if(G.isCanh && G.isCanh(v) && G.throttled && G.throttled()) return;
  G.S.view = v;
  /* Con đường: mở bằng đường thường (menu) thì xoá trạng thái "vào từ
     phòng" còn sót; mở từ một phòng (cdMoTheoChang) thì giữ. Đặt ở G.go
     — lúc VÀO màn — chứ không ở render (bước đi vẫn phải giữ trạng thái). */
  if(v==='con-duong' && typeof G.cdMoThuong==='function') G.cdMoThuong();
  var g = groupOf(v);
  if(g && G.S.open.indexOf(g)<0) G.S.open = [g];
  U.closeModal();
  closeMobile();
  render();
};
function closeMobile(){
  var l = document.getElementById('left'), s = document.getElementById('scrim'),
      r = document.getElementById('right');
  if(l) l.classList.remove('open');
  /* Đóng cả cột phải: từ 9.99.151 hai cột là panel THẢ TỪ TRÊN trên
     desktop, nên điều hướng (hay bấm nền mờ) phải đóng cả hai để màn
     chính hiện trọn. */
  if(r){ r.classList.remove('open'); G.S.rightOpen = false; }
  if(s) s.classList.remove('on');
}

/* ═══════════════ TRỢ LÝ GITA ═══════════════ */
/* Trợ lý cũ chỉ so khớp TỪ ĐẦU TIÊN của câu hỏi nên gần như không tìm
   được gì. Đã thay bằng src/tro-ly-ai.js — tách từ, bỏ dấu, chấm điểm. */
G.ask = function(q){ if(G.aiHoi) G.aiHoi(q); };

G.coTheIn = function(){ return G.can('xuat_pdf'); };
G.inTrang = function(nhan){
  if(!G.coTheIn()){
    U.toast('Chỉ người của GITA 365 từ cấp quản lý mới xuất được bản in. Tài khoản này không có quyền đó.','err');
    if(G.secLog) G.secLog('Chặn in', (nhan||G.S.view) + ' — vai ' + (G.S.role||'?') + ' không có quyền xuat_pdf', 'Đã chặn');
    return false;
  }
  if(G.secLog) G.secLog('In trang', (nhan||G.S.view) + ' · mã bản ' + dauBan(), 'Ghi nhận');
  U.toast('Đang mở hộp in. Bản in mang mã ' + dauBan() + ' và đã ghi vào nhật ký.','ok');
  setTimeout(function(){ window.print(); }, 400);
  return true;
};

/* ═══════════════ XUẤT DỮ LIỆU ═══════════════
   Không còn tải tệp về máy. Hai đường duy nhất:
     · PDF  — in ra, chỉ vai có quyền xuat_pdf
     · SHEET— đẩy thẳng lên Google Sheet trong thư mục Drive của Admin,
              chỉ vai có quyền xuat_sheet. Không đi qua máy người dùng
              nên không có tệp nào nằm lại trong thư mục Tải về. */
function dauBan(){
  var d = new Date(), p = function(x){ return String(x).padStart(2,'0'); };
  return 'GITA-' + (G.S.role||'--') + '-' + d.getFullYear() + p(d.getMonth()+1) + p(d.getDate()) +
         '-' + p(d.getHours()) + p(d.getMinutes());
}
G.dauBan = dauBan;

/* Gom dữ liệu của một loại xuất thành {cot, dong} */
function bangXuat(ma){
  if(ma==='X2'){
    var fs = G.dsNha();
    return { ten:'Danh sách khách hàng',
      cot:['Mã nhà','Học viên','Lớp','Người lớn','Tầng','Ngày','Coach','Nhắc/tuần','Tự chủ %','Vai giữ','Băng','Kỳ tích'],
      dong: fs.map(function(f){ return [f.id,f.hv,f.lop,f.ph,'T'+f.tier,f.ngay,f.coach,f.nhac,f.tuchu,f.vai+'/9',f.band,f.kyTich]; }) };
  }
  if(ma==='X3'){
    var f2 = G.myFamily();
    return { ten:'Bảng số ' + f2.nha,
      cot:['Chỉ số','Giá trị','Chuẩn'],
      dong:[['Mức tự chủ', f2.tuchu + '%', 'trên 80% cuối chặng 4'],
            ['Số lần nhắc mỗi tuần', f2.nhac, 'giảm rõ so với mốc đầu năm'],
            ['Vai có người giữ', f2.vai + '/9', 'đủ chín vai'],
            ['Ngày đồng hành', f2.ngay, 'theo tầng ' + f2.tier],
            ['Băng sức khoẻ', f2.band, 'XANH'],
            ['Kỳ tích năm', f2.kyTich, 'có bằng chứng']] };
  }
  if(ma==='X4'){
    return { ten:'Đội ngũ và KPI',
      cot:['Tài khoản','Họ tên','Vai','KPI %','Ngày mở','Chưa đăng nhập','Trạng thái'],
      dong:(G.TAIKHOAN_KPI||[]).map(function(x){ return [x.u,x.ten,x.vai,x.kpi,x.ngay,x.hd,x.trang]; }) };
  }
  if(ma==='X5'){
    return { ten:'Nhật ký cấp phát',
      cot:['Mã bản','Tài liệu','Người nhận','Lúc cấp'],
      dong:((G.DAU_MAT&&G.DAU_MAT.mau)||[]).map(function(m){ return [m.ma,m.tl,m.ai,m.luc]; }) };
  }
  return null;
}

G.xuat = function(ma){
  var l = (G.XUAT.loai||[]).filter(function(x){return x.ma===ma;})[0];
  if(!l) return;
  if(!G.can(l.quyen)){ U.toast('Vai này chưa được Admin cấp quyền xuất loại dữ liệu đó.','err'); return; }

  /* PDF — qua cổng in duy nhất */
  if(l.dang === 'PDF'){ G.inTrang(l.ten); return; }

  /* SHEET — đẩy lên Drive của Admin, không tải về máy */
  if(!G.can('xuat_sheet')){
    U.toast('Chỉ Ban điều hành mới đẩy được bảng tính lên Drive. Tài khoản này chưa được cấp.','err');
    if(G.secLog) G.secLog('Chặn xuất bảng tính', l.ten + ' — vai ' + G.S.role + ' thiếu quyền xuat_sheet', 'Đã chặn');
    return;
  }
  var b = bangXuat(ma);
  if(!b || !b.dong.length){ U.toast('Chưa có dữ liệu để xuất.','err'); return; }
  if(!G.API_CAP_PHEP){
    U.toast('Chưa nối máy chủ nên chưa đẩy được lên Drive. Xem docs/TRIEN_KHAI_WEB.md.','err');
    return;
  }
  var maBan = dauBan();
  /* Xuất là đưa dữ liệu ra khỏi hệ thống — mỗi dòng xuất tính một lần chạm,
     nặng hơn một lần đọc. Đây là chỗ dấu hiệu gom kho lộ ra rõ nhất. */
  if(G.chamTaiNguyen) b.dong.forEach(function(d, i){
    G.chamTaiNguyen('Xuất Sheet', ma + '·' + i);
  });
  U.toast('Đang tạo bảng tính trên Drive…','ok');
  fetch(G.API_CAP_PHEP, {
    method:'POST', headers:{'Content-Type':'text/plain;charset=utf-8'},
    body: JSON.stringify({ fn:'xuatSheet', u:G.S.acc && G.S.acc.u, token:G.PHIEN_TOKEN||'',
      /* Gửi cả tên máy — đường dongBo và capKhoa đều gửi, riêng đường này
         trước đây bỏ trống nên cột "máy" trong nhật ký xuất luôn rỗng. */
      may: navigator.userAgent.slice(0, 120),
      loai:ma, ten:b.ten, maBan:maBan, cot:b.cot, dong:b.dong })
  }).then(function(r){ return r.json(); })
    .then(function(d){
      if(!d || !d.ok) throw new Error(d && d.error || 'Máy chủ từ chối');
      G.SHEET_MOI = { ten:b.ten, url:d.url, luc:new Date().toLocaleString('vi-VN'), ma:maBan };
      U.modal('<h2 style="font-size:21px;font-weight:800;margin-bottom:10px">Đã tạo bảng tính trên Drive</h2>'+
        '<p class="sm dim" style="line-height:1.75;margin-bottom:12px">Bảng <b>'+U.h(b.ten)+'</b> · '+b.dong.length+
        ' dòng đã nằm trong thư mục Drive của Admin. Không có tệp nào tải về máy này.</p>'+
        '<div class="card pad-sm mb"><div class="tiny up muted mb">MÃ BẢN</div><p class="sm mono">'+U.h(maBan)+'</p></div>'+
        '<a class="btn pri sm" href="'+U.h(d.url)+'" target="_blank" rel="noopener">Mở bảng tính</a>');
      if(G.secLog) G.secLog('Xuất bảng tính', l.ten + ' · ' + b.dong.length + ' dòng · mã bản ' + maBan, 'Ghi nhận');
    })
    .catch(function(e){
      U.toast('Không đẩy được lên Drive: ' + e.message, 'err');
      if(G.secLog) G.secLog('Xuất bảng tính hỏng', l.ten + ' · ' + e.message, 'Cảnh báo');
    });
};

/* ═══════════════ NÓI VÀO MICRO ═══════════════ */
G.mic = function(){
  var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  var btn = document.getElementById('micBtn'), inp = document.getElementById('aiQ');
  if(!SR){
    U.toast('Trình duyệt này chưa hỗ trợ nhận giọng nói. Anh chị gõ câu hỏi giúp em ạ.','err');
    if(inp) inp.focus();
    return;
  }
  if(G.REC){ try{ G.REC.stop(); }catch(e){} G.REC = null; return; }
  var r = new SR();
  r.lang = (G.LANG==='en') ? 'en-US' : 'vi-VN';
  r.interimResults = true;
  r.continuous = false;
  G.REC = r;
  if(btn){ btn.style.color = '#BE0E16'; btn.style.borderColor = 'rgba(248,113,113,.6)'; }
  U.toast(G.LANG==='en' ? 'Listening… speak now.' : 'Đang nghe… anh chị nói ạ.','ok');
  r.onresult = function(e){
    var txt = '';
    for(var i=0;i<e.results.length;i++) txt += e.results[i][0].transcript;
    if(inp) inp.value = txt;
    if(e.results[e.results.length-1].isFinal){ G.ask(txt); }
  };
  r.onerror = function(ev){
    U.toast(ev && ev.error==='not-allowed'
      ? 'Trình duyệt chưa cho phép dùng micro. Bật quyền micro rồi thử lại.'
      : 'Chưa nghe rõ. Anh chị thử lại hoặc gõ câu hỏi ạ.','err');
  };
  r.onend = function(){
    G.REC = null;
    var b = document.getElementById('micBtn');
    if(b){ b.style.color = ''; b.style.borderColor = ''; }
  };
  try{ r.start(); }catch(e){ U.toast('Không mở được micro trên trình duyệt này.','err'); }
};

/* ═══════════════ HỘP LỆNH ═══════════════ */
function cmdItems(){
  var out = [];
  G.NAV.forEach(function(g){
    g.items.filter(visible).forEach(function(it){
      out.push({t:G.iname(it), s:G.gname(g)+' · '+G.ihint(it), ic:it.ic, go:it.v});
    });
  });
  return out;
}
function openCmd(){
  var c = document.getElementById('cmd');
  c.classList.add('on');
  var i = c.querySelector('input'); i.value=''; i.focus();
  cmdRender('');
}
function cmdRender(q){
  q = String(q||'').toLowerCase().trim();
  var res = document.getElementById('cmdRes');
  var items = cmdItems().filter(function(x){ return !q || (x.t+' '+x.s).toLowerCase().indexOf(q)>=0; });
  var extra = [];
  if(q.length>1){
    (G.MOTHUC||[]).forEach(function(m){ if(extra.length<5 && m.title.toLowerCase().indexOf(q)>=0)
      extra.push({t:m.title, s:'Mô thức '+m.id, ic:'brain', mt:m.id}); });
    (G.KICHBAN||[]).forEach(function(k){ if(extra.length<10 && String(k.ten||'').toLowerCase().indexOf(q)>=0)
      extra.push({t:k.ten, s:'Kịch bản '+k.ma+' · '+k.tang, ic:'ritual', kb:k.ma}); });
  }
  res.innerHTML = (items.length?'<div class="gh">MÀN HÌNH</div>':'') +
    G.dsHet(items,8).map(function(x,i){
      return '<button data-go="'+h(x.go)+'" class="'+(i===0?'sel':'')+'">'+ic(x.ic)+
        '<span class="tx"><b>'+h(x.t)+'</b><span>'+h(x.s)+'</span></span></button>';
    }).join('') +
    (extra.length?'<div class="gh">TRONG KHO BÁU VẬT</div>':'') +
    extra.map(function(x){
      return '<button '+(x.mt?'data-mt="'+h(x.mt)+'"':'data-kb="'+h(x.kb)+'"')+'>'+ic(x.ic)+
        '<span class="tx"><b>'+h(x.t)+'</b><span>'+h(x.s)+'</span></span></button>';
    }).join('') +
    (!items.length && !extra.length ? '<div class="gh">Không tìm thấy</div>' : '');
}

/* ═══════════════ SỰ KIỆN ═══════════════ */
function on(sel, fn){
  document.addEventListener('click', function(e){
    var el = e.target.closest && e.target.closest(sel);
    if(el) { e.preventDefault(); fn(el, e); }
  });
}
on('[data-login]', function(el){ doLogin(el.getAttribute('data-login')); });
on('[data-pq]', function(el){
  var p = el.getAttribute('data-pq').split('|');
  G.doiO(p[0], p[1]);
});
on('[data-lang]', function(el){ G.setLang(el.getAttribute('data-lang')); });
on('[data-ct]', function(el){ G.doiPhanCuaTruoc(el.getAttribute('data-ct')); });
/* ── Bảng công việc ── */
on('[data-cvnhan]',   function(el){ G.cvNhanHoiDap(el.getAttribute('data-cvnhan')); });
on('[data-cvbatdau]', function(el){ G.cvBatDauHoiDap(el.getAttribute('data-cvbatdau')); });
on('[data-cvxong]',   function(el){ G.cvMoDongViec(el.getAttribute('data-cvxong')); });
on('[data-cvchuyen]', function(el){ G.cvMoChuyen(el.getAttribute('data-cvchuyen')); });
on('[data-cvduong]',  function(el){ G.cvMoDuongDi(el.getAttribute('data-cvduong')); });
on('[data-cvdong]',   function(el){ G.cvDongThat(el.getAttribute('data-cvdong')); });
on('[data-cvchuyenthat]', function(el){ G.cvChuyenThat(el.getAttribute('data-cvchuyenthat')); });
on('[data-cvchot]',   function(){ G.cvChotHoiDap(); });
on('[data-khchot]',   function(){ G.khChotHoiDap(); });
on('[data-v]', function(el){ G.go(el.getAttribute('data-v')); });
on('[data-go]', function(el){ document.getElementById('cmd').classList.remove('on'); G.go(el.getAttribute('data-go')); });
/* Con đường: mốc + chọn chặng qua data-* (không onclick dựng từ dữ liệu).
   Mốc là <g> SVG role=button tabindex=0 — click + Enter/Space (polyfill
   bàn phím ở keydown dưới). Lỗ H-3 tổ thanh tra đợt 3: SVG role=button
   focus được, đọc ra "button", mà Enter KHÔNG kích — chết bàn phím trên
   đúng màn 3D chủ hệ tự hào nhất. */
on('[data-moc]', function(el){ if(G.cdChon) G.cdChon(+el.getAttribute('data-moc')); });
on('[data-cdloc]', function(el){ if(G.cdLoc) G.cdLoc(el.getAttribute('data-cdloc')); });
on('[data-grp]', function(el){
  var id = el.getAttribute('data-grp'), i = G.S.open.indexOf(id);
  if(i>=0) G.S.open.splice(i,1); else G.S.open.push(id);
  document.getElementById('left').innerHTML = leftNav(); save();
});
/* Tab trên thanh ngang: mở đúng nhóm ấy rồi THẢ panel trái xuống để chọn
   tiếp (9.99.152). Đóng cột phải + bật nền mờ như mọi lần mở panel. */
on('[data-sec]', function(el){
  var id = el.getAttribute('data-sec');
  G.S.open = [id];
  var l = document.getElementById('left');
  if(l){ l.classList.add('open'); l.innerHTML = leftNav(); }
  var r = document.getElementById('right'); if(r){ r.classList.remove('open'); G.S.rightOpen = false; }
  var s = document.getElementById('scrim'); if(s) s.classList.add('on');
  var hn = document.getElementById('hnav'); if(hn) hn.innerHTML = hnav();
  save();
});
on('[data-rt]', function(el){
  G.S.rtab = el.getAttribute('data-rt');
  document.getElementById('right').innerHTML = rightPanel(); save();
});
on('[data-switch]', function(el){
  var id = el.getAttribute('data-switch');
  var a = G.ACCOUNTS.filter(function(x){return x.role===id;})[0];
  if(a) doLogin(a.u); else U.toast('Vai này chưa có tài khoản mẫu.','err');
});
on('[data-check]', function(el){
  var k = el.getAttribute('data-check');
  G.S.checks[k] = !G.S.checks[k]; save(); if(G.danhDau) G.danhDau('checks', k); render();
  if(G.S.checks[k]) U.toast('Ghi nhận. Một việc nhỏ làm được hôm nay hơn mười việc định làm.','ok');
});
on('[data-vb]', function(el){ G.vanBanModal(el.getAttribute('data-vb')); });
on('[data-vbn]', function(el){
  var n = el.getAttribute('data-vbn');
  var d = document.querySelectorAll('#main .view .up');
  for(var i=0;i<d.length;i++) if(d[i].textContent.indexOf(n)===0){ d[i].scrollIntoView({behavior:'smooth',block:'start'}); break; }
});
on('[data-th]', function(el){ G.tinhHuongModal(el.getAttribute('data-th')); });
on('[data-thf]', function(el){
  var f = el.getAttribute('data-thf');
  document.querySelectorAll('[data-thf]').forEach(function(b){ b.classList.toggle('on', b===el); });
  document.querySelectorAll('#thList [data-f]').forEach(function(c){
    c.style.display = (f==='ALL' || c.getAttribute('data-f').indexOf(f)>=0) ? '' : 'none'; });
});
on('[data-qf]', function(el){
  var f = el.getAttribute('data-qf');
  document.querySelectorAll('[data-qf]').forEach(function(b){ b.classList.toggle('on', b===el); });
  document.querySelectorAll('#qtList [data-f]').forEach(function(c){
    c.style.display = (f==='ALL' || c.getAttribute('data-f').indexOf(f)>=0) ? '' : 'none'; });
});
on('[data-mood]', function(el){ G.S.mood = el.getAttribute('data-mood'); save(); if(G.danhDau) G.danhDau('mood','mood'); render(); });
on('[data-kh]', function(el){ G.khoangModal(el.getAttribute('data-kh')); });
on('[data-vai]', function(el){ G.vaiModal(el.getAttribute('data-vai')); });
on('[data-pd]', function(el){ G.phacDoModal(el.getAttribute('data-pd')); });
on('[data-kb]', function(el){ document.getElementById('cmd').classList.remove('on'); G.kichBanModal(el.getAttribute('data-kb')); });
on('[data-mt]', function(el){ document.getElementById('cmd').classList.remove('on'); G.moThucModal(el.getAttribute('data-mt')); });
on('[data-bh]', function(el){ G.baiHocModal(el.getAttribute('data-bh')); });
on('[data-cdopen]', function(el){ G.chanDungModal(el.getAttribute('data-cdopen')); });
/* [data-aiq] KHÔNG bắt ở đây. Bộ nghe duy nhất nằm trong src/tro-ly-chat.js.
   Có lúc ba tệp cùng bắt selector này ở cấp document, nên một cú bấm chip
   gợi ý hỏi trợ lý ba lần. */
on('[data-sat]', function(el){
  var f = G.dsNha().filter(function(x){return x.id===el.getAttribute('data-sat');})[0]; if(!f) return;
  var t = G.tierOf(f.tier);
  U.modal('<div class="row wrap" style="gap:7px;margin-bottom:9px">'+U.chip(t.code+' · '+t.name,t.c)+
    U.chip('Ngày '+f.ngay)+U.chip('Băng '+f.band, G.bandColor(f.band))+'</div>'+
    '<h2 style="font-size:21px;font-weight:800;margin-bottom:6px">'+h(f.nha)+'</h2>'+
    '<p class="sm muted mb">'+h(f.hv)+' · '+h(f.lop)+' · Coach '+h(f.coach)+'</p>'+
    '<div class="grid g2" style="gap:10px">'+
    U.stat({k:'MỨC TỰ CHỦ',v:f.tuchu+'%',d:'',c:'#0B7350'})+
    U.stat({k:'VAI CÓ NGƯỜI GIỮ',v:f.vai+'/9',d:'',c:'#5140B4'})+'</div>'+
    '<div class="card pad-sm mt"><div class="tiny up muted mb">KỲ TÍCH ĐANG CHẠY</div>'+
    '<p class="sm">'+h(f.kyTich)+'</p></div>');
});
on('[data-dscap]', function(el){
  var c = ((G.DAISU && G.DAISU.capDo)||[])[Number(el.getAttribute('data-dscap'))]; if(!c) return;
  U.modal('<h2 style="font-size:21px;font-weight:800;margin-bottom:12px">'+h(c.ten)+'</h2>'+
    '<div class="card pad-sm mb"><div class="tiny up muted mb">ĐIỀU KIỆN</div><p class="sm" style="line-height:1.7">'+h(c.dieuKien)+'</p></div>'+
    (c.quyenLoi?'<div class="up mb" style="color:var(--gold-ink)">QUYỀN LỢI</div>'+U.list(c.quyenLoi):''));
});
on('[data-cd]', function(el){
  var f = el.getAttribute('data-cd');
  document.querySelectorAll('[data-cd]').forEach(function(b){ b.classList.toggle('on', b===el); });
  document.querySelectorAll('#cdGrid [data-cdi]').forEach(function(c){
    c.style.display = (f==='ALL' || c.getAttribute('data-cdi').indexOf(f)>=0) ? '' : 'none';
  });
});
on('[data-kbf]', function(el){
  var f = el.getAttribute('data-kbf');
  document.querySelectorAll('[data-kbf]').forEach(function(b){ b.classList.toggle('on', b===el); });
  document.querySelectorAll('#kbList [data-f]').forEach(function(c){
    c.style.display = (f==='ALL' || c.getAttribute('data-f').indexOf(f)>=0) ? '' : 'none';
  });
});
/* ── Hiện thêm bản ghi ──
   Hai lỗi cũ, cùng một gốc: đếm từ G.S.*Shown thay vì đếm từ chính danh sách.
     1. Quay lại màn hình thì màn vẽ lại 48 thẻ đầu, nhưng biến đếm vẫn giữ
        con số của lần trước — bấm thêm là nhảy cóc, bỏ mất cả một khối bản ghi
        mà không cách nào xem lại được.
     2. Bấm thêm khi đang bật một bộ lọc thì thẻ mới chèn vào không mang bộ
        lọc ấy, nên hiện ra cả những thẻ vừa bị lọc bỏ.
   Đếm từ DOM thì con số luôn đúng với thứ đang thấy; áp lại bộ lọc sau khi
   chèn thì thẻ mới theo đúng luật thẻ cũ. */
function hienThem(idList, idDem, kho, veThe, buoc, locSel){
  var ds = kho || [], l = document.getElementById(idList);
  if(!l) return;
  var dangCo = l.querySelectorAll('[data-f]').length || l.children.length;
  var toi = Math.min(ds.length, dangCo + buoc);
  if(toi <= dangCo) return;
  l.insertAdjacentHTML('beforeend', ds.slice(dangCo, toi).map(veThe).join(''));

  /* Áp lại bộ lọc và ô tìm đang bật cho phần vừa chèn */
  var nutLoc = document.querySelector('[' + locSel + '].on');
  var f = nutLoc ? nutLoc.getAttribute(locSel) : 'ALL';
  var o = document.querySelector('[data-search]');
  var q = o ? (o.value || '').trim().toLowerCase() : '';
  l.querySelectorAll('[data-f]').forEach(function(c){
    var hopLoc = (f === 'ALL' || (c.getAttribute('data-f') || '').indexOf(f) >= 0);
    var hopTim = !q || (c.getAttribute('data-s') || c.textContent || '').toLowerCase().indexOf(q) >= 0;
    c.style.display = (hopLoc && hopTim) ? '' : 'none';
  });

  var d = document.getElementById(idDem);
  if(d) d.textContent = toi;
}

on('[data-act]', function(el){
  var a = el.getAttribute('data-act');
  if(a==='doi-nen') return G.doiNen();
  if(a==='mo-het')  return G.moHetDoi();
  if(a==='pq-dat-lai') return G.datLaiPhanQuyen();
  if(a==='sx-them') return G.themNhom();
  if(a==='sx-tra') return G.traBoCuc();
  if(a==='gp-mo') return G.moNapGiayPhep();
  if(a==='gp-nap') return G.napGiayPhep();
  if(a==='ct-cap') return G.capTaiKhoan();
  if(a==='tl-gui') return G.guiTaiLieu();
  if(a==='mc-gui') return G.guiMinhChung();
  if(a==='kt-lam') return G.lamViecTaiKhoan();
  if(a==='kt-xoa-that') return G.xoaTaiKhoanThat(el);
  if(a==='xem-truoc') return G.moCuaTruoc();
  if(a==='cv-chot') return G.cvChotHoiDap();
  if(a==='kh-chot') return G.khChotHoiDap();
  if(a==='ct-dong') return G.dongCuaTruoc();
  if(a==='mo-dang-ky') return G.moDangKy();
  if(a==='gui-dang-ky') return G.guiDangKy();
  if(a==='gui-otp') return G.guiOTP();
  if(a==='xin-lai-otp') return G.xinLaiOTP();
  if(a==='kich-hoat') return G.kichHoat();
  if(a==='dong-modal') return U.closeModal();
  if(a==='do-login') doLogin(document.getElementById('inU').value, document.getElementById('inP').value);
  else if(a==='dang-nhap-mat'){ var _im=document.getElementById('inU'); G.stDangNhapMat(_im?_im.value:''); }
  else if(a==='show-accounts') G.accountsModal();
  else if(a==='scroll-login'){ var c=document.getElementById('loginCard'); if(c) c.scrollIntoView({behavior:'smooth',block:'center'}); }
  else if(a==='logout'){ G.raNgoai(); }
  else if(a==='toggle-right'){
    /* Hai cột là panel thả từ trên (9.99.151) — mở một cột đóng cột kia,
       và bật nền mờ để bấm ra ngoài là đóng. Màn chính luôn full. */
    G.S.rightOpen = !G.S.rightOpen;
    var _l1 = document.getElementById('left'); if(_l1) _l1.classList.remove('open');
    document.getElementById('right').classList.toggle('open', G.S.rightOpen);
    document.getElementById('scrim').classList.toggle('on', G.S.rightOpen); save();
  }
  else if(a==='toggle-left'){
    var _lo = document.getElementById('left'), _mo = !_lo.classList.contains('open');
    var _r1 = document.getElementById('right');
    if(_r1){ _r1.classList.remove('open'); G.S.rightOpen = false; }
    _lo.classList.toggle('open', _mo);
    document.getElementById('scrim').classList.toggle('on', _mo);
  }
  else if(a==='thu-cot'){
    /* Thu gọn / mở lại hai cột. Đổi CLASS THÂN TRANG chứ không dựng lại
       vỏ: dựng lại vỏ thì mất trạng thái cuộn và nhấp nháy. Vẽ lại thanh
       trên để nút đổi nhãn + trạng thái nhấn. */
    G.S.thuCot = !G.S.thuCot;
    document.body.classList.toggle('thu-cot', G.S.thuCot);
    var tThu = document.getElementById('top'); if(tThu) tThu.innerHTML = topBar();
    save();
  }
  else if(a==='cmd') openCmd();
  else if(a==='consent'){ if(G.xinDongY) G.xinDongY(); }
  else if(a==='install') G.install();
  else if(a==='lang'){
    var i = 0; G.LANGS.forEach(function(x,n){ if(x.k===G.LANG) i=n; });
    G.setLang(G.LANGS[(i+1)%G.LANGS.length].k);
  }
  /* Phải gọi G.danhDau, nếu không thì bấm lưu xong dữ liệu nằm lại đúng máy
     này: gomThayDoi chỉ gom những khoá ĐÃ ĐƯỢC ĐÁNH DẤU. Trước đây hai
     nhánh này và cả luồng làm bài test đều quên, nên bảng tầm nhìn và nhật
     ký 365 ngày không bao giờ sang được máy khác. */
  else if(a==='save-vision'){
    document.querySelectorAll('[data-vision]').forEach(function(t){
      var k = t.getAttribute('data-vision');
      G.S.vision[k] = t.value;
      if(G.danhDau) G.danhDau('vision', k);
    });
    save(); U.toast('Đã lưu bảng tầm nhìn của nhà mình.','ok'); render();
  }
  else if(a==='save-journal'){
    document.querySelectorAll('[data-journal]').forEach(function(t){
      var k = t.getAttribute('data-journal');
      G.S.journal[k] = t.value;
      if(G.danhDau) G.danhDau('journal', k);
    });
    save(); U.toast('Đã ghi nhật ký tối nay. Bảy tối là có một mô thức.','ok');
  }
  else if(a==='chat-xoa'){ G.chatXoa && G.chatXoa(); }
  else if(a==='ai-ask'){ var oq=document.getElementById('aiQ'); if(oq){ G.aiHoi(oq.value); oq.value=''; if(G.aiOCao) G.aiOCao(oq); } }
  else if(a==='mic') G.mic();
  else if(a==='phong') G.phongMoDong();
  else if(a==='phong-vua') G.phongDatKho('vua');
  else if(a==='phong-toan') G.phongDatKho('toan');
  else if(a==='phong-to') G.phongBuoc(1);
  else if(a==='phong-nho') G.phongBuoc(-1);
  else if(a==='phong-moc') G.phongVeMoc();
  else if(a==='kb-more') hienThem('kbList','kbCount', G.KICHBAN, G.kbCard, 60, 'data-kbf');
  else if(a==='quet-dau'){
    var van = (document.getElementById('quetVan')||{}).value || '';
    var kq = document.getElementById('quetKQ'); if(!kq) return;
    /* Lớp 1: mã hiện · Lớp 2: ký tự rộng bằng không · Lớp 3: vân ngắt dòng */
    var hien = van.match(/GITA[·\u00b7\.\-\s]*[0-9A-F]{4}[·\u00b7\.\-\s]*R\d{2}[·\u00b7\.\-\s]*\d{6}(?:[·\u00b7\.\-\s]*[A-Z0-9]{2})?/i);
    var an = (van.match(/[\u200B\u200C\u200D\uFEFF]/g)||[]).length;
    var van3 = van.split('\n').filter(function(x){return x.trim();}).length;
    var tim = hien ? G.DAU_MAT.mau.filter(function(m){
      return m.ma.replace(/[^0-9A-Za-z]/g,'').toLowerCase()
        .indexOf(hien[0].replace(/[^0-9A-Za-z]/g,'').toLowerCase().slice(4,8)) >= 0; })[0] : null;
    if(!van.trim()){ kq.innerHTML = ''; return; }
    kq.innerHTML = '<div class="card pad-sm" style="border-color:'+(hien||an?'var(--gita-vien-2)':'rgba(148,163,184,.3)')+'">'+
      '<div class="up mb" style="color:'+(hien||an?'var(--gold)':'var(--ink-4)')+'">KẾT QUẢ QUÉT</div>'+
      '<div class="stack">'+
      '<div class="sm">Lớp 1 · mã hiện: '+(hien?'<b style="color:var(--gold-ink)">'+U.h(hien[0])+'</b>':'<span class="muted">không thấy</span>')+'</div>'+
      '<div class="sm">Lớp 2 · ký tự ẩn: '+(an?'<b style="color:var(--gold-ink)">'+an+' dấu</b>':'<span class="muted">không thấy</span>')+'</div>'+
      '<div class="sm">Lớp 3 · vân ngắt dòng: <b>'+van3+' dòng</b> — đối chiếu với sơ đồ đã cấp</div>'+
      '</div>'+
      (tim ? '<div class="mt2" style="padding:12px 14px;border-radius:12px;background:rgba(248,113,113,.08);border-left:2px solid var(--bad)">'+
        '<span class="tiny up" style="color:var(--bad)">TRUY ĐƯỢC NGUỒN</span>'+
        '<p class="sm mt"><b>'+U.h(tim.ai)+'</b> · '+U.h(tim.tl)+' · cấp lúc '+U.h(tim.luc)+'</p></div>'
        : (hien||an ? '<p class="sm muted mt">Có dấu nhưng chưa khớp bản nào trong danh sách mẫu. Tra tiếp trong nhật ký cấp phát của máy chủ.</p>'
                    : '<p class="sm muted mt">Đoạn này không mang dấu của GITA 365 — có thể do gõ lại tay, hoặc không phải tài liệu của hệ thống.</p>'))+
      '</div>';
    if(G.secLog) G.secLog('Quét mật mã kín', (hien?'Thấy mã '+hien[0]:'Không thấy mã hiện')+' · '+an+' ký tự ẩn', 'Ghi nhận');
  }
  else if(a==='mo-chuc-nang' || a==='dong-chuc-nang'){
    var vai = el.getAttribute('data-vai'), r = G.roleById(vai);
    if(r.lv <= G.S.roleObj.lv){ U.toast('Luật L4: chỉ mở hoặc đóng được chức năng của vai cấp thấp hơn.','err'); return; }
    U.toast((a==='mo-chuc-nang'?'Đã mở':'Đã đóng')+' chức năng cho '+r.n+'. Thao tác đã ghi vào nhật ký không xoá được.','ok');
    if(G.secLog) G.secLog('Cấp quyền', (a==='mo-chuc-nang'?'Mở':'Đóng')+' chức năng cho vai '+vai, 'Ghi nhận');
  }
  else if(a==='xet-mo') U.toast('Đã chuyển vào hàng chờ xem xét. Trả lời trong ba ngày làm việc theo luật L2.','ok');
  else if(a==='duyet-mo') U.toast('Đã mở lại tài khoản. Hệ thống sẽ rà lại KPI sau 30 ngày.','ok');
  else if(a==='hoan-mo') U.toast('Đã hoãn và gửi yêu cầu bổ sung dữ liệu cho người xin mở.','ok');
  else if(a==='dat-lai') U.toast('Đã thu hồi khoá giải mã và gỡ vai. Dữ liệu gia đình giữ nguyên, không xoá.','ok');
  else if(a==='th-more') hienThem('thList','thCount', G.TINHHUONG, G.thCard, 48, 'data-thf');
  else if(a==='qt-more') hienThem('qtList','qtCount', G.QUA1000, G.qtCard, 60, 'data-qf');
  else if(a==='xuat') G.xuat(el.getAttribute('data-ma'));
  else if(a==='in-vanban'){ G.inTrang('Văn bản mẫu'); }
  else if(a==='quen-mk'){ G.moQuenMatKhau && G.moQuenMatKhau(); }
  else if(a==='xin-ma'){ G.xinMa && G.xinMa(); }
  else if(a==='dat-lai-mk'){ G.datLaiMatKhau && G.datLaiMatKhau(); }
  else if(a==='doi-mk-mo'){ G.moDoiMatKhau && G.moDoiMatKhau(); }
  else if(a==='doi-mk'){ G.doiMatKhau && G.doiMatKhau(); }
  else if(a==='dong-bo'){ G.dongBo && G.dongBo(true); }
  else if(a==='chep-vanban'){
    var m = document.getElementById('vbMau');
    if(m && navigator.clipboard) navigator.clipboard.writeText(m.textContent)
      .then(function(){ U.toast('Đã sao chép mẫu. Bản dán ra ngoài vẫn mang mật mã kín theo người xuất.','ok'); })
      .catch(function(){ U.toast('Trình duyệt chưa cho phép sao chép.','err'); });
  }
  else if(a==='mo-fb'){
    var fb = (G.LIENKET&&G.LIENKET.facebook)||'';
    if(!fb){ U.toast('Chưa đặt đường dẫn group. Sửa ở G.LIENKET.facebook.','err'); return; }
    if(G.secLog) G.secLog('Mở group Facebook', 'Kèm mã giới thiệu của tài khoản đang đăng nhập', 'Ghi nhận');
    window.open(fb, '_blank', 'noopener');
  }
  else if(a==='mo-tg'){
    var tg = (G.LIENKET&&G.LIENKET.telegram)||'';
    if(!tg){ U.toast('Chưa đặt đường dẫn Telegram.','err'); return; }
    window.open(tg, '_blank', 'noopener');
  }
  else if(a==='kiem-ban-moi'){
    U.toast('Đang kiểm bản mới…','ok');
    fetch('manifest.webmanifest', {cache:'no-store'})
      .then(function(){ U.toast('Đang dùng bản mới nhất · v'+G.META.version+'. Kho đã cấp phép nằm sẵn trong máy.','ok'); })
      .catch(function(){ U.toast('Chưa có mạng. Ứng dụng vẫn chạy đủ bằng dữ liệu trong máy.','err'); });
  }
  else if(a==='doi-qua') U.toast('Đã ghi nhận. Quà sẽ được gửi sau khi coach xác nhận bằng chứng của mốc này.','ok');
  else if(a==='join-cuhich') U.toast('Đã ghi nhận. Coach sẽ mở cú hích này cùng nhà mình ở buổi gần nhất.','ok');
  else if(a==='join-event') U.toast('Đã giữ chỗ. Thư xác nhận sẽ tới hộp thư của anh chị.','ok');
  else if(a==='upload') U.toast('Nối với kho Drive của hệ thống GITA 365 để bật tính năng gửi tệp.','err');
});
document.addEventListener('input', function(e){
  var s = e.target.getAttribute && e.target.getAttribute('data-search');
  if(s){
    var q = e.target.value.toLowerCase().trim();
    document.querySelectorAll('[data-s]').forEach(function(c){
      c.style.display = (!q || c.getAttribute('data-s').indexOf(q)>=0) ? '' : 'none';
    });
  }
  if(e.target.id==='cmdIn') cmdRender(e.target.value);
});
document.addEventListener('keydown', function(e){
  if((e.ctrlKey||e.metaKey) && e.key && e.key.toLowerCase()==='k'){ e.preventDefault(); if(G.S.acc) openCmd(); }
  if(e.key==='Escape'){ U.closeModal(); document.getElementById('cmd').classList.remove('on'); closeMobile(); }
  if(e.key==='Enter' && e.target.id==='inP') doLogin(document.getElementById('inU').value, e.target.value);
  /* Enter trên #aiQ do src/tro-ly-chat.js xử lý — một chỗ, không ba. */
  if(e.key==='Enter' && e.target.id==='cmdIn'){
    var b = document.querySelector('#cmdRes button'); if(b) b.click();
  }
  /* POLYFILL BÀN PHÍM cho role=button KHÔNG phải thẻ gốc (SVG <g>, <div>…):
     Enter/Space kích bằng cách phát một click NỔI BỌT — bộ uỷ nhiệm on()
     bắt được, nên mốc con-đường (và mọi role=button phi-gốc sau này) chạy
     đúng bằng bàn phím. WCAG 2.1.1. Lỗ H-3 tổ thanh tra đợt 3. */
  var tg = e.target;
  if((e.key==='Enter' || e.key===' ' || e.key==='Spacebar') && tg && tg.getAttribute &&
     tg.getAttribute('role')==='button' &&
     tg.tagName!=='BUTTON' && tg.tagName!=='A' && tg.tagName!=='INPUT' && tg.tagName!=='TEXTAREA'){
    e.preventDefault();
    tg.dispatchEvent(new MouseEvent('click', {bubbles:true, cancelable:true}));
  }
});
document.addEventListener('click', function(e){
  if(e.target.id==='scrim') closeMobile();
  if(e.target.classList && e.target.classList.contains('bd')){
    U.closeModal(); document.getElementById('cmd').classList.remove('on');
  }
});

/* ═══════════════ HẠT SÁNG ═══════════════ */
function sparks(){
  if(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  for(var i=0;i<14;i++){
    var s = document.createElement('i');
    s.className = 'spark';
    s.style.left = (Math.random()*100)+'vw';
    s.style.top = (100+Math.random()*20)+'vh';
    s.style.animationDuration = (12+Math.random()*16)+'s';
    s.style.animationDelay = (Math.random()*18)+'s';
    s.style.opacity = 0;
    if(i%3===0) s.style.background = '#5140B4', s.style.boxShadow = '0 0 12px 2px rgba(139,92,246,.8)';
    if(i%4===0) s.style.background = '#0B7350', s.style.boxShadow = '0 0 12px 2px rgba(16,185,129,.8)';
    document.body.appendChild(s);
  }
}

/* ═══════════════ PHẠM VI CẤP PHÉP THEO MÀN HÌNH ═══════════════
   Màn hình nào cần gói nội dung nào. Không có gói thì hiện màn hình
   xin cấp phép, không hiện nội dung. */
/* 'tro-ly' KHÔNG nằm ở đây: trợ lý mở cho mọi vai, còn thứ nó trả về thì
   đã lọc theo gói được cấp — chặn nội dung chứ không chặn cái cửa. */
var GOI_NGHE = ['kho','phac-do','kich-ban','mo-thuc','sach','ngon-tu','diem-cham',
  'tuvan-deck','hai-long','tai-lieu-khach','kiem-thu','chuan-1000','ai-dieu-phoi',
  'an-toan-du-lieu','hoc-tu-lon','tang-quyen','vong-doi-tk','hang-tai-lieu','dau-mat','dong-chay',
  'tinh-huong','bando-tuvan','bando-coach','van-ban','tai-chinh-qt','thanh-tra',
  'ra-soat-kh','xuat-du-lieu','quy-trinh-tc',
  'referral','chan-dung-kh','do-luong-kh','hang-vip','cay-tien','nhan-su-tt',
  'phuong-phap','van-tay','chuyen-doi','hoso-vip','ai-cham'];
var GOI_MO = ['toi','bat-dau'];
/* Bộ test nhận diện nằm trong gói theo tầng: khách hàng đã được cấp phép
   tầng nào thì làm được bài của tầng đó, không cần quyền nghề. */
var GOI_RIENG = { 'bo-test':'tang1' };
G.goiCanCho = function(v){
  if(GOI_MO.indexOf(v) >= 0) return null;
  if(GOI_RIENG[v]) return GOI_RIENG[v];
  return GOI_NGHE.indexOf(v) >= 0 ? 'nghe' : 'nen';
};
/* Gói mẫu công khai đã có sẵn nội dung cho phần nền và phần T1 rút gọn.
   Chặn ở cửa theo tên gói làm mọi màn hình đều báo "cần cấp phép" dù dữ
   liệu đã nằm trong máy — đó là lỗi của v7.5, khiến bản dùng thử gần như
   trống. Nay chế độ mẫu để từng màn hình tự dựng: màn nào có nội dung thì
   hiện, màn nào thật sự thiếu sẽ tự hiện thẻ giải thích rõ vì sao.
   Gói NGHỀ và các gói tầng 2–5 vẫn chặn ngay ở cửa, không nới. */
var MAU_MO = ['nen', 'tang1'];
G.coGoi = function(g){
  if(!g) return true;
  if(G.KHO.daNap.indexOf(g) >= 0) return true;
  if(G.KHO.cheDoMau && MAU_MO.indexOf(g) >= 0) return true;
  return false;
};

/* ═══════════════ CÀI ĐẶT ỨNG DỤNG (PWA) ═══════════════ */
window.addEventListener('beforeinstallprompt', function(e){
  e.preventDefault(); G.INSTALL = e;
  if(G.S.acc){ var t = document.getElementById('top'); if(t) t.innerHTML = topBar(); }
});
window.addEventListener('appinstalled', function(){
  G.INSTALL = null;
  U.toast('Đã cài GITA 365 vào máy. Mở được cả khi không có mạng.','ok');
});
G.install = function(){
  if(!G.INSTALL){
    U.modal('<h2 style="font-size:21px;font-weight:800;margin-bottom:10px">Cài GITA 365 vào máy</h2>'+
      '<p class="sm dim mb" style="line-height:1.7">Cài xong, GITA 365 chạy như một ứng dụng thật: có biểu tượng riêng, mở toàn màn hình, '+
      'và dùng được cả khi không có mạng vì toàn bộ kho tri thức đã nằm trong máy.</p>'+
      '<div class="grid g3" style="gap:12px">'+
      [['Android · Chrome','Mở trình đơn ⋮ → <b>Thêm vào màn hình chính</b> → Cài đặt.'],
       ['iPhone · iPad · Safari','Bấm nút Chia sẻ → <b>Thêm vào MH chính</b> → Thêm.'],
       ['Máy tính · Chrome, Edge','Bấm biểu tượng cài đặt ở thanh địa chỉ, hoặc trình đơn → <b>Cài đặt GITA 365</b>.']
      ].map(function(x){ return '<div class="card pad-sm"><b class="sm" style="display:block;margin-bottom:6px">'+U.h(x[0])+'</b>'+
        '<p class="tiny muted" style="line-height:1.6">'+x[1]+'</p></div>'; }).join('')+'</div>'+
      '<p class="tiny muted mt2">Bản web luôn dùng được ngay mà không cần cài — cùng một tài khoản, cùng một dữ liệu.</p>');
    return;
  }
  G.INSTALL.prompt();
  G.INSTALL.userChoice.then(function(r){
    if(r && r.outcome==='accepted') U.toast('Đang cài GITA 365 vào máy…','ok');
    G.INSTALL = null;
  });
};

/* Sáu cách viết đều đưa về màn đăng nhập. Đặt ở đây vì cả bộ bắt hashchange
   bên dưới lẫn G.boot đều cần. */
var CUA_DANG_NHAP = ['dangnhap', 'dang-nhap', 'login', 'dangxuat', 'dang-xuat', 'logout'];

window.addEventListener('hashchange', function(){
  var v = location.hash.replace('#','');
  /* Gõ #dangnhap vào cuối địa chỉ của trang ĐANG MỞ không nạp lại trang, nên
     G.boot không chạy lại. Phải bắt ở đây, nếu không người dùng gõ xong thấy
     màn hình không nhúc nhích. */
  if(CUA_DANG_NHAP.indexOf(v.toLowerCase()) >= 0){ G.raNgoai(); return; }
  if(v && G.manCoThat(v) && G.S.acc && v!==G.S.view) G.go(v);
});

/* ═══════════════ KHỞI ĐỘNG ═══════════════ */
/* ── Về màn đăng nhập ──
   Gọi được từ nút Đăng xuất, và từ địa chỉ .../#dangnhap.

   Vì sao cần đường thứ hai: sau khi đăng nhập một lần, phiên nằm trong bộ
   nhớ trình duyệt, nên mở lại trang là vào thẳng ứng dụng — màn đăng nhập
   không hiện ra nữa. Nút Đăng xuất nằm dưới cùng thanh trái, mà trên điện
   thoại thanh trái là ngăn kéo đóng sẵn. Người dùng có thể không tìm ra và
   tưởng phần đăng nhập biến mất.

   Gõ thêm #dangnhap vào cuối địa chỉ là về được, dù đang kẹt ở đâu. */
G.raNgoai = function(){
  G.S.acc = null; G.S.role = null; G.S.roleObj = null;
  if(G.donKho) G.donKho();          /* nội dung đã giải mã không ở lại trong bộ nhớ */
  save();
  try{ history.replaceState(null, '', location.pathname + location.search); }catch(e){}
  gate();
};

G.boot = function(){
  if(G.batMaGioiThieu) G.batMaGioiThieu();
  if(G.batLinkKichHoat) G.batLinkKichHoat();
  sparks();
  try{ var lg = localStorage.getItem('gita365.lang'); if(lg && G.UI[lg]) G.LANG = lg; }catch(e){}
  /* Trên màn hình hẹp, thanh phải mở dạng ngăn kéo — đóng sẵn để không che nội dung */
  if(window.innerWidth < 1180) G.S.rightOpen = false;
  /* Đọc trước khi khôi phục phiên: có dấu hiệu xin về màn đăng nhập thì bỏ
     phiên cũ đi, không vào thẳng ứng dụng. */
  var dau = (location.hash || '').replace('#', '').toLowerCase();
  /* window.GITA_RA_NGOAI do máy chủ Apps Script tiêm vào khi mở
     .../exec?dangnhap=1 — bản đó chạy trong khung sandbox nên không dùng
     được dấu # trên thanh địa chỉ. */
  if(window.GITA_RA_NGOAI || CUA_DANG_NHAP.indexOf(dau) >= 0){
    G.S.acc = null; G.S.role = null; G.S.roleObj = null;
    save();
    try{ history.replaceState(null, '', location.pathname + location.search); }catch(e){}
    gate();
    return;
  }

  var d = load();
  if(d && d.u){
    var a = G.ACCOUNTS.concat(G.AUDITORS).filter(function(x){return x.u===d.u;})[0];
    if(a){
      G.S.acc=a; G.S.role=a.role; G.S.roleObj=G.roleById(a.role);
      var hv = location.hash.replace('#','');
      if(hv && G.manCoThat(hv)) G.S.view = hv;
      manCho('Đang mở kho theo phạm vi được cấp phép…');
      G.napKho().then(function(){ shell(); if(G.batDongBo) G.batDongBo(); if(G.kiemBanMoi) G.kiemBanMoi(); });
      return;
    }
  }
  gate();
};
})();
