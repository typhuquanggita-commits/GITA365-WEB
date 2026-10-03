/* ═══════════════════════════════════════════════════════════════
   GITA 365 · v8.2 — NỐI MÁY CHỦ
   Câu hỏi anh Quang đặt ra: "máy chủ được nhắc tới trong web app là gì,
   và làm cách nào để tôi kết nối được?" Màn này trả lời bằng thao tác,
   không bằng tài liệu.

   Máy chủ của GITA 365 là một dự án Google Apps Script chạy trên tài
   khoản Google của Học viện. Nó không phải máy chủ thuê, không có phí
   hàng tháng, và dữ liệu nằm trong Drive của chính Học viện. Việc của
   nó gồm bốn phần: cấp khoá mở kho theo vai, giữ sổ tài khoản và mật
   khẩu, nhận tài liệu gửi lên, và đồng bộ cài đặt giữa web với bản cài
   trên máy tính.

   Trước khi nối, ứng dụng chạy ở CHẾ ĐỘ MẪU: xem được toàn bộ giao diện
   và phần giới thiệu, kho chuyên môn vẫn khoá. Nối xong là mở theo đúng
   vai và tầng của từng tài khoản.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;

(function(){
var U = G.U, h = U.h, ic = U.ic;
G.VIEWS = G.VIEWS || {};

var KHO = 'gita365_may_chu';

G.diaChiMayChu = function(){
  try{ return localStorage.getItem(KHO) || ''; }catch(e){ return ''; }
};

G.datMayChu = function(url){
  url = String(url || '').trim();
  if(!url){
    try{ localStorage.removeItem(KHO); }catch(e){}
    if(G.dangXuatMayChu) G.dangXuatMayChu();
    G.API_CAP_PHEP = '';
    return {ok:true, xoa:true};
  }
  if(!/^https:\/\/[^\s]+$/i.test(url))
    return {ok:false, ly:'Địa chỉ máy chủ phải là một đường dẫn https — dạng '+
      'https://gita365.<tên-tài-khoản>.workers.dev (Cloudflare Worker của Học viện).'};
  try{ localStorage.setItem(KHO, url); }catch(e){ return {ok:false, ly:'Trình duyệt không cho ghi.'}; }
  if(G.API_CAP_PHEP !== url && G.dangXuatMayChu) G.dangXuatMayChu();
  G.API_CAP_PHEP = url;
  return {ok:true};
};

/* Máy chủ từ chối cấp khoá vì SÁU lý do khác nhau, và mỗi lý do một cách
   sửa khác hẳn. Nói đúng cách sửa theo mã, thay vì để người dùng đoán —
   cùng luật "nêu đúng chỗ thứ hai phải khai" của doanViSao. */
G.tuChoiCachSua = function(ma){
  switch(String(ma || '')){
    case 'NOKEY':
      return 'Máy chủ chưa được nạp bộ khoá. Trên máy anh chị, trong thư mục may-chu/ chạy: '+
        'npx wrangler secret put GITA_KHOA_KHO — dán toàn bộ nội dung tệp kho/khoa.json — rồi '+
        'npx wrangler deploy. Bấm "Gọi thử" ở trên, thấy số khoá > 0 là xong.';
    case 'MISSINGKEY':
      return 'Bộ khoá máy chủ thiếu một hoặc nhiều gói mà tài khoản được cấp. Nạp lại đầy đủ tệp '+
        'kho/khoa.json bằng lệnh npx wrangler secret put GITA_KHOA_KHO trong thư mục may-chu/, '+
        'sau đó chạy npx wrangler deploy.';
    case 'BADKEY':
      return 'Một hoặc nhiều khoá máy chủ không phải khoá AES-256 hợp lệ. Nạp lại đúng tệp '+
        'kho/khoa.json của cùng bản phát hành bằng lệnh npx wrangler secret put GITA_KHOA_KHO, '+
        'sau đó chạy npx wrangler deploy.';
    case 'MUSTCHANGE':
      return 'Tài khoản đang dùng mật khẩu tạm do máy sinh. Bấm "Đổi mật khẩu ngay" bên dưới, '+
        'đặt mật khẩu riêng, rồi đăng nhập lại — kho sẽ mở.';
    case 'AUTH':
      return 'Phiên máy chủ không hợp lệ hoặc đã hết hạn. Ở phần Đăng nhập máy chủ bên dưới, '+
        'đăng nhập lại bằng tài khoản thật của Học viện rồi mở lại kho.';
    case 'NETWORK':
      if (location.protocol === 'file:')
        return 'Ứng dụng đang được mở từ một tệp trên máy (file://), nên máy chủ không nhận. '+
          'Hãy mở bằng trình duyệt tại https://gita365.pages.dev rồi đăng nhập lại.';
      return 'Không liên lạc được máy chủ cấp phép. Kiểm tra kết nối mạng, địa chỉ Worker và '+
        'mục connect-src trong index.html, rồi bấm Gọi thử.';
    case 'SERVER':
      return 'Máy chủ trả về dữ liệu cấp phép sai định dạng. Kiểm tra phiên bản Worker và triển khai lại.';
    case 'RATE':
      return 'Đã xin khoá quá nhiều lần trong một giờ (trần chống dò khoá). Chờ khoảng một giờ '+
        'rồi thử lại — không cần sửa gì.';
    case 'LOCKED':
      return 'Tài khoản đang bị khoá. Cần Super Admin mở lại trong Quản trị trang → tài khoản.';
    case 'DANGBANG':
      return 'Hệ đang trong chế độ đóng băng cứu hệ. Chỉ mở lại được qua quy trình truy hồi '+
        '(cần khoá cứu hệ offline).';
    default:
      return 'Đọc câu máy chủ trả về ở trên, hoặc bấm "Gọi thử" để xem máy chủ đã nạp khoá chưa.';
  }
};

/* Gọi thử: doGet của máy chủ trả về tên và số khoá đã nạp, không trả khoá nào. */
G.thuMayChu = function(){
  var url = G.API_CAP_PHEP;
  if(!url) return Promise.resolve({ok:false, ly:'Chưa có địa chỉ máy chủ.'});
  return fetch(url, {method:'GET'})
    .then(function(r){ return r.json(); })
    .then(function(d){
      if(!d || !d.ok) return {ok:false, ly:'Máy chủ trả về nội dung không đọc được.'};
      return {ok:true, ten:d.ten || '', soKhoa:Number(d.daNapKhoa) || 0, luc:d.luc || ''};
    })
    .catch(function(e){
      return {ok:false, ly:'Không gọi được máy chủ: ' + (e && e.message || e) +
        '. Kiểm lại phần "Ai có quyền truy cập" đã đặt là Anyone chưa.'};
    });
};

/* Xác nhận quyền vào Drive. Máy chủ thử thật: mở từng thư mục, tạo một tệp
   dấu, xoá đi. Bấm Allow trên màn xin quyền của Google chỉ là bước đầu —
   nó không nói được máy chủ có ghi đúng thư mục của Học viện hay không. */
/* ═══════════════ MỘT CỬA GỌI MÁY CHỦ ═══════════════

   Tới bản 9.99 mỗi màn tự viết fetch của mình: app.js, bang-tin.js,
   dong-bo.js, mat-khau.js — bốn chỗ, bốn cách bắt lỗi, bốn câu báo
   khác nhau cho cùng một sự cố.

   Bốn bản của một việc thì sẽ có ngày lệch: một chỗ gắn token, chỗ kia
   quên; một chỗ đọc d.error, chỗ kia đọc d.ly. Người dùng gặp cùng một
   lỗi mạng ở hai màn và nhận hai câu khác nhau.

   Cửa này gom lại một chỗ. Nó KHÔNG ném ra bao giờ — trả về
   {ok:false, error} — vì màn hình gọi nó trong lúc vẽ, và một lượt ném
   ở đó là trắng cả màn.

   Bốn chỗ cũ chưa chuyển sang: chúng đang chạy đúng, và đổi cả bốn
   trong một lượt là bốn chỗ có thể hỏng cùng lúc mà không phép đo nào
   phủ hết. Chuyển dần khi có việc chạm vào từng chỗ.

   ── BỐN LỚP CHỐNG "BILL SHOCK" & TĂNG ĐỘ BỀN (docs/TOI_UU_CHI_PHI_CHAT_LUONG.md) ──
   1. GỘP lượt đọc giống hệt đang bay: mười ô cùng hỏi một thứ → một lượt.
   2. ĐỆM NGẮN (15 giây) cho việc CHỈ ĐỌC; bất kỳ lượt ghi nào xoá sạch
      đệm, nên không bao giờ thấy dữ liệu cũ sau khi chính mình vừa sửa.
      Cần số tươi thì gọi G.goiMayChu(fn, than, {moi:true}).
   3. Máy chủ báo RATE/BUSY → TỰ NGHỈ đúng thuLaiSau, không gọi lại vô ích.
   4. CẦU DAO: 3 lượt hỏng mạng/5xx liền nhau → ngắt 30 giây. Một vòng lặp
      lỗi ở màn hình không biến thành hàng nghìn lượt Worker. */
var DEM_DOC = {}, DANG_BAY = {}, NGHI_DEN = 0, HONG_LIEN = 0, NGAT_DEN = 0;
var DEM_GIAY = 15;
/* Việc chỉ đọc: tên bắt đầu bằng các tiền tố này. Việc theo dõi tiến độ
   (phimXemViec, phimTrangThai) cố ý KHÔNG đệm — chúng phải luôn tươi. */
var LA_DOC = /^(doc|ds|xem|soi|lichSu|bangTin|baoCao|crmDanhSach|crmChiTiet|crmBangDieuKhien|tongHop)/;
var KHONG_DEM = {phimXemViec:1, phimTrangThai:1, docHomNay:1, hopThongBao:1};
G.laViecDoc = function(fn){ return LA_DOC.test(fn) && !KHONG_DEM[fn]; };
G.xoaDemMayChu = function(){ DEM_DOC = {}; };

G.goiMayChu = function(fn, than, tuyChon){
  if(!G.API_CAP_PHEP)
    return Promise.resolve({ok:false, error:'Chưa nối máy chủ. Vào Quản trị trang → Nối máy chủ.'});
  tuyChon = tuyChon || {};
  var bayGio = Date.now();
  if(bayGio < NGHI_DEN)
    return Promise.resolve({ok:false, code:'RATE', thuLaiSau:Math.ceil((NGHI_DEN - bayGio)/1000),
      error:'Đang tạm nghỉ để giữ hạn mức. Thử lại sau ' + Math.ceil((NGHI_DEN - bayGio)/1000) + ' giây.'});
  if(bayGio < NGAT_DEN)
    return Promise.resolve({ok:false, code:'NGAT',
      error:'Máy chủ vừa không trả lời mấy lượt liền. Ứng dụng tạm chờ ' +
        Math.ceil((NGAT_DEN - bayGio)/1000) + ' giây rồi tự thử lại — dữ liệu trong máy vẫn nguyên.'});

  var body = Object.assign({}, than || {}, {
    fn: fn,
    u: (G.S && G.S.acc && G.S.acc.u) || '',
    token: G.PHIEN_TOKEN || ''
  });
  var doc = G.laViecDoc(fn);
  var khoa = doc ? JSON.stringify(body) : '';
  if(!doc) DEM_DOC = {};
  if(doc && !tuyChon.moi){
    var o = DEM_DOC[khoa];
    if(o && bayGio - o.luc < DEM_GIAY * 1000) return Promise.resolve(o.d);
    if(DANG_BAY[khoa]) return DANG_BAY[khoa];
  }
  var ma = '';
  var p = fetch(G.API_CAP_PHEP, {
    method:'POST', headers:{'Content-Type':'text/plain;charset=utf-8'},
    body: JSON.stringify(body)
  }).then(function(r){
      try { ma = r.headers.get('x-gita-ma') || ''; } catch(_e){}
      if(r.status >= 500) HONG_LIEN++; else HONG_LIEN = 0;
      return r.json();
    })
    .then(function(d){
      if(!d) return {ok:false, error:'Máy chủ trả về nội dung không đọc được.'};
      if(G.nhanPhanHoiMayChu) G.nhanPhanHoiMayChu(d, body.token);
      if(!d.ok){
        if(ma && !d.maYeuCau) d.maYeuCau = ma;
        if((d.code === 'RATE' || d.code === 'BUSY') && d.thuLaiSau)
          NGHI_DEN = Date.now() + Math.min(Number(d.thuLaiSau) || 5, 300) * 1000;
        if(G.ghiLoi) G.ghiLoi('may-chu', fn + ': ' + (d.code || '') + ' ' + (d.error || ''), d.maYeuCau);
      }
      /* Phiên hết hạn nói RÕ là hết hạn, không lẫn vào "không có quyền":
         hai câu ấy dẫn tới hai việc khác nhau — đăng nhập lại, hay đi
         xin quyền. */
      if(!d.ok && d.code === 'AUTH'){
        return {ok:false, code:'AUTH', error:'Phiên đã hết hạn. Đăng nhập lại rồi thử lại.'};
      }
      if(doc && d.ok) DEM_DOC[khoa] = {luc: Date.now(), d: d};
      return d;
    })
    .catch(function(e){
      HONG_LIEN++;
      if(G.ghiLoi) G.ghiLoi('mang', fn + ': ' + ((e && e.message) || e), ma);
      return {ok:false, error:'Không gọi được máy chủ: ' + doanViSao(e)};
    })
    .then(function(d){
      if(HONG_LIEN >= 3){ NGAT_DEN = Date.now() + 30000; HONG_LIEN = 0; }
      if(khoa) delete DANG_BAY[khoa];
      return d;
    });
  if(doc) DANG_BAY[khoa] = p;
  return p;
};

/* ══ MỘT LƯỢT BỊ CSP CHẶN TRÔNG Y HỆT MỘT LƯỢT MẤT MẠNG ══

   Trình duyệt cố ý không nói ra lượt nào bị Content-Security-Policy
   chặn: cả hai đều ném đúng một câu "Failed to fetch". Đó là quyết định
   đúng của trình duyệt — nói ra là để trang dò được chính sách của nó —
   nhưng với người đang triển khai thì nó là một chỗ hỏng IM LẶNG, và
   kho này có một luật riêng về chỗ hỏng im lặng.

   Chỗ này hỏng thật được: `cau-hinh.js` và `connect-src` của
   `index.html` là HAI chỗ phải khớp nhau, và `soat-san-sang.js` đã canh
   phía tĩnh. Nhưng người dán địa chỉ lúc nửa đêm thì không chạy bộ
   soát — họ bấm "Thử nối", thấy "Failed to fetch", rồi đi tìm ở phía
   máy chủ suốt một tiếng trong khi máy chủ vẫn đang chạy đúng.

   Nên KHÔNG kết luận, chỉ NÊU: máy không phân biệt được hai nguyên nhân
   ấy, và nói chắc một cái là dẫn người ta đi sai đường đúng lúc đang
   vội — cùng luật với `khoi-phuc-kho.js` khi AES-GCM báo sai. Nó chỉ
   nói thêm cái mà người kia chưa biết: địa chỉ này KHÁC gốc với trang,
   nên có một chỗ thứ hai phải khai. */
function doanViSao(e){
  var loi = (e && e.message) || String(e);
  var laMang = /failed to fetch|networkerror|load failed/i.test(loi);
  if(!laMang) return loi;

  var gocTrang = '', gocMayChu = '';
  try { gocTrang = location.origin; } catch(_e){}
  try { gocMayChu = new URL(G.API_CAP_PHEP, location.href).origin; } catch(_e){}

  if(gocMayChu && gocTrang && gocMayChu !== gocTrang){
    return loi + '. Địa chỉ máy chủ (' + gocMayChu + ') KHÁC gốc với trang (' +
      gocTrang + '), nên có hai nguyên nhân và trình duyệt không phân biệt được: ' +
      'mất mạng, hoặc CSP chưa khai origin ấy. Kiểm chỗ thứ hai: connect-src ' +
      'trong index.html phải có đúng "' + gocMayChu + '". Chạy ' +
      'node tools/soat-san-sang.js để máy đối chiếu hai chỗ ấy.';
  }
  return loi + '. Máy chủ cùng gốc với trang nên CSP không phải nguyên nhân — ' +
    'nhiều khả năng là mất mạng hoặc máy chủ chưa chạy.';
}

G.VIEWS['noi-may-chu'] = function(){
  var url = G.API_CAP_PHEP || '';
  var noi = !!url;

  var o = U.ph({eyebrow:'QUẢN TRỊ TRANG', ic:'orbit', grad:1,
    t:'Nối máy chủ',
    lead:'Máy chủ của GITA 365 là một Cloudflare Worker chạy trên tài khoản Cloudflare '+
         'của Học viện. Gói miễn phí đủ dùng, không phí hàng tháng, dữ liệu nằm trong D1 '+
         'và R2 của chính Học viện — không đi qua Google Apps Script nữa.'});

  o += '<div class="card mt2" style="border-color:'+(noi?'var(--ok)':'var(--gita-do)')+'">'+
    '<div class="row" style="gap:10px;align-items:center">'+
      ic(noi?'check':'lock','w-5 h-5')+
      '<b>'+(noi ? 'Đang nối máy chủ' : 'Đang chạy ở chế độ mẫu — chưa nối máy chủ')+'</b></div>'+
    '<p class="sm dim mt" style="line-height:1.7">'+
      (noi ? 'Kho mở theo đúng vai và tầng của từng tài khoản. Đăng ký, đổi mật khẩu, '+
             'gửi tài liệu và đồng bộ đều đi qua máy chủ này.'
           : 'Xem được toàn bộ giao diện và phần giới thiệu. Kho chuyên môn vẫn khoá, '+
             'đăng ký và đổi mật khẩu chưa chạy thật.')+'</p>'+
    '<div class="row mt2" style="gap:9px;flex-wrap:wrap">'+
      '<input id="mcUrl" value="'+h(url)+'" placeholder="https://gita365.<tên-tài-khoản>.workers.dev" '+
        'style="flex:1;min-width:280px;background:var(--surface);border:1px solid var(--line);'+
        'border-radius:99px;padding:11px 18px;font-size:12.5px;outline:none;color:var(--ink)" '+
        'class="mono" autocomplete="off">'+
      '<button class="btn pri" data-act="mc-luu">'+ic('check','w-4 h-4')+'Lưu địa chỉ</button>'+
      '<button class="btn ghost" data-act="mc-thu">'+ic('pulse','w-4 h-4')+'Gọi thử</button>'+
      (noi ? '<button class="btn ghost" data-act="mc-bo">'+ic('x','w-4 h-4')+'Bỏ nối</button>' : '')+
      (G.chepNhatKyLoi ? '<button class="btn ghost" data-act="mc-nhatky" title="Chép nhật ký lỗi (kèm mã yêu cầu) để gửi hỗ trợ">'+ic('alert','w-4 h-4')+'Chép nhật ký lỗi</button>' : '')+
    '</div>'+
    '<div id="mcKq" class="mt"></div>'+
    (G.KHO && G.KHO.lyDoTuChoi ?
      '<div class="card pad-sm mt" style="border-color:var(--gita-do)">'+
        '<b class="sm" style="color:var(--gita-do-ink)">'+ic('lock','w-3 h-3')+
        ' Máy chủ đang từ chối cấp khoá'+(G.KHO.maTuChoi ? ' · mã '+h(G.KHO.maTuChoi) : '')+'</b>'+
        '<p class="sm mt">'+h(G.KHO.lyDoTuChoi)+'</p>'+
        /* Chỉ đúng CÁCH SỬA theo mã máy chủ trả về — mỗi mã một việc khác
           hẳn, gộp thành một câu chung là dẫn người ta đi sai đường. */
        (G.tuChoiCachSua ? '<p class="sm mt" style="color:var(--gita-ink)">'+ic('spark','w-3 h-3')+
          ' '+G.tuChoiCachSua(G.KHO.maTuChoi)+'</p>' : '')+
        (G.KHO.maTuChoi === 'MUSTCHANGE' ?
          '<button class="btn pri sm mt" data-act="doi-mk-mo">'+ic('lock','w-3 h-3')+
          'Đổi mật khẩu ngay</button>' : '')+
      '</div>' : '')+
    '<p class="tiny muted mt">Địa chỉ này ghi vào máy đang dùng. Máy khác phải dán lại — '+
      'cố tình như vậy, để địa chỉ máy chủ không đi kèm bản phát hành.</p>'+
  '</div>';

  /* ── ĐĂNG NHẬP MÁY CHỦ (mở kho) — chỉ hiện khi đã nối. Đăng nhập bằng vai
        ở Cổng vào chỉ để XEM; muốn MỞ KHO phải có phiên THẬT với máy chủ. ── */
  if(noi){
    var oInp = 'flex:1;min-width:170px;background:var(--surface);border:1px solid var(--line);'+
      'border-radius:12px;padding:11px 14px;font-size:13px;outline:none;color:var(--ink)';
    o += '<div class="card mt2" style="border-color:var(--gita-vien-2)">'+
      '<div class="up mb" style="color:var(--gita-ink)">'+ic('lock','w-4 h-4')+' ĐĂNG NHẬP MÁY CHỦ ĐỂ MỞ KHO</div>'+
      '<p class="sm dim" style="line-height:1.65">Đăng nhập bằng vai (nút ở Cổng vào) chỉ để XEM giao diện — đó là phiên trong trình duyệt, máy chủ không biết. Muốn <b>mở kho nội dung</b>, phải đăng nhập THẬT ở đây để máy chủ cấp khoá.</p>'+
      '<div class="row mt2" style="gap:9px;flex-wrap:wrap">'+
        '<input id="mcDnU" placeholder="Tên đăng nhập" autocomplete="username" style="'+oInp+'">'+
        '<input id="mcDnMk" type="password" placeholder="Mật khẩu" autocomplete="current-password" style="'+oInp+'">'+
        '<button class="btn pri" data-act="mc-dangnhap">'+ic('check','w-4 h-4')+'Đăng nhập máy chủ</button>'+
      '</div>'+
      '<div id="mcDnKq" class="mt"></div>'+
      '<details class="mt2"><summary class="sm" style="cursor:pointer;color:var(--gita-ink)">'+
        ic('spark','w-3 h-3')+' Lần đầu dựng máy chủ? Tạo Super Admin đầu tiên</summary>'+
        '<p class="tiny muted mt">Chỉ chạy được MỘT LẦN — khi hệ chưa có quản trị nào và đã nạp secret <span class="mono">GITA_TAO_ADMIN</span>. Nhập secret khởi tạo cùng mật khẩu quản trị; mật khẩu được máy chủ băm an toàn, không lưu bản rõ. Xoá secret sau khi tạo tài khoản.</p>'+
        '<div class="row mt" style="gap:9px;flex-wrap:wrap">'+
          '<input id="mcAdKey" type="password" autocomplete="off" placeholder="Secret khởi tạo (GITA_TAO_ADMIN)" style="'+oInp+'">'+
          '<input id="mcAdU" placeholder="Tên đăng nhập mới" style="'+oInp+'">'+
          '<input id="mcAdMk" type="password" placeholder="Mật khẩu (≥8 ký tự)" style="'+oInp+'">'+
          '<input id="mcAdTen" placeholder="Họ tên" style="'+oInp+'">'+
          '<button class="btn ghost" data-act="mc-taoadmin">'+ic('users','w-4 h-4')+'Tạo Super Admin</button>'+
        '</div><div id="mcAdKq" class="mt"></div>'+
      '</details>'+
    '</div>';
  }

  o += U.sec('SÁU BƯỚC DỰNG MÁY CHỦ TRÊN CLOUDFLARE','Làm một lần, khoảng hai mươi phút · gói miễn phí');
  o += '<div class="card">'+U.list([
    'Cài Node.js, rồi mở thư mục may-chu/ trong kho mã và đăng nhập Cloudflare bằng tài khoản của Học viện: chạy lệnh  npx wrangler login',
    'Tạo cơ sở dữ liệu D1 và nạp lược đồ: chạy  npx wrangler d1 create gita365  rồi  npx wrangler d1 execute gita365 --file=csdl.sql --remote',
    'Tạo kho tệp lớn R2: chạy  npx wrangler r2 bucket create gita365-hoso',
    'Nạp BỘ KHOÁ mở kho làm bí mật máy chủ: chạy  npx wrangler secret put GITA_KHOA_KHO  rồi dán nội dung tệp kho/khoa.json khi được hỏi. Khoá KHÔNG nằm trong mã, chỉ ở đây.',
    'Đưa Worker lên: chạy  npx wrangler deploy  Chép địa chỉ nó in ra, dạng https://gita365.<tên-tài-khoản>.workers.dev',
    'Dán địa chỉ đó vào ô trên, bấm Lưu, rồi Gọi thử — thấy số khoá đã nạp là xong. Dán luôn địa chỉ ấy vào cau-hinh.js trước khi phát hành để MỌI máy đều dùng được (ô này chỉ ghi cho máy đang dùng).'
  ])+'</div>';

  o += U.sec('MÁY CHỦ NÀY LÀM BỐN VIỆC','Không hơn — mọi thứ khác chạy trong máy người dùng');
  o += '<div class="row wrap" style="gap:12px">'+
    [['Cấp khoá mở kho','Sau khi đăng nhập, trả đúng những gói mà vai và tầng của tài khoản được cấp phép. '+
      'Khoá có hạn 12 giờ và mỗi tài khoản chỉ xin được 12 lần mỗi giờ.'],
     ['Giữ sổ tài khoản','Đăng ký, gửi mã OTP qua email, kích hoạt, đổi và lấy lại mật khẩu — sổ nằm trong D1.'],
     ['Nhận tài liệu gửi lên','Tài liệu và ảnh từ mọi vị trí, cùng minh chứng nhiệm vụ của gia đình, '+
      'lưu vào R2 của Học viện. Không nhận tệp chạy được.'],
     ['Đồng bộ cài đặt','Bố cục thư mục, chữ hiển thị, bảng phân quyền và phần tư liệu đã gửi thêm cho '+
      'từng nhà — để bản web và bản cài trên máy tính nhìn giống nhau.']]
    .map(function(x){
      return '<div class="card" style="flex:1;min-width:250px;border-color:var(--gita-vien-1)">'+
        '<b class="sm" style="color:var(--gita-ink)">'+h(x[0])+'</b>'+
        '<p class="sm dim mt" style="line-height:1.65">'+h(x[1])+'</p></div>';
    }).join('')+'</div>';

  o += U.sec('DỮ LIỆU NẰM Ở ĐÂU','Trên tài khoản Cloudflare của Học viện — không qua Google nữa');
  o += U.tbl(['Nơi giữ','Giữ gì'], [
    ['<b class="sm">D1 · <span class="mono">gita365</span></b>',
     '<span class="sm">Sổ dữ liệu: tài khoản, hồ sơ học viên, phiên đăng nhập, nhật ký, thanh toán, đồng ý dữ liệu.</span>'],
    ['<b class="sm">R2 · <span class="mono">gita365-hoso</span></b>',
     '<span class="sm">Tệp lớn: tài liệu và ảnh đội ngũ gửi lên, minh chứng nhiệm vụ của gia đình.</span>'],
    ['<b class="sm">Secret · <span class="mono">GITA_KHOA_KHO</span></b>',
     '<span class="sm">Bộ khoá mở kho — Cloudflare giữ, mã nguồn không thấy, không đi trong phản hồi nào.</span>']
  ]);

  o += '<div class="card mt2"><div class="up mb" style="color:var(--gita-do-ink)">'+
    ic('shield','w-4 h-4')+' BỘ KHOÁ</div>'+
    '<p class="sm" style="line-height:1.7">Tệp <span class="mono">kho/khoa.json</span> là chìa của toàn '+
    'bộ kho. Nó nằm trong .gitignore và không bao giờ được đưa lên kho mã hay gửi qua tin nhắn. '+
    'Chỗ duy nhất nó được dán vào là bí mật Cloudflare (<span class="mono">wrangler secret put GITA_KHOA_KHO</span>), '+
    'một lần, và Cloudflare giữ nó ngoài mã nguồn.</p></div>';

  return o;
};

document.addEventListener('click', function(e){
  var b = e.target.closest && e.target.closest('[data-act]');
  if(!b) return;
  var a = b.getAttribute('data-act');
  var kq = document.getElementById('mcKq');

  if(a === 'mc-luu'){
    var i = document.getElementById('mcUrl');
    var r = G.datMayChu(i ? i.value : '');
    U.toast(r.ok ? 'Đã lưu địa chỉ máy chủ trên máy này.' : r.ly, r.ok ? 'ok' : 'err');
    if(r.ok) G.render && G.render();
  }
  else if(a === 'mc-nhatky'){
    G.chepNhatKyLoi().then(function(chu){
      var so = G.NHAT_KY_LOI().length;
      U.toast(so ? 'Đã chép ' + so + ' dòng nhật ký lỗi — dán vào thư gửi hỗ trợ.' : 'Chưa có lỗi nào được ghi trong phiên này.', 'ok');
      if(kq){
        var pre = document.createElement('pre');
        pre.className = 'sm'; pre.style.cssText = 'white-space:pre-wrap;max-height:240px;overflow:auto';
        pre.textContent = chu; kq.innerHTML = ''; kq.appendChild(pre);
      }
    }, function(){ U.toast('Trình duyệt không cho chép — mở lại trang bằng https.', 'err'); });
  }
  else if(a === 'mc-bo'){
    G.datMayChu('');
    U.toast('Đã bỏ nối. Ứng dụng quay về chế độ mẫu.','ok');
    G.render && G.render();
  }
  else if(a === 'mc-dangnhap'){
    var du = document.getElementById('mcDnU'), dmk = document.getElementById('mcDnMk');
    var dbox = document.getElementById('mcDnKq');
    var uu = du ? String(du.value||'').trim() : '', mm = dmk ? String(dmk.value||'') : '';
    if(!uu || !mm){ U.toast('Nhập tên đăng nhập và mật khẩu.','err'); return; }
    if(dbox) dbox.innerHTML = '<p class="sm dim">Đang đăng nhập máy chủ…</p>';
    fetch(G.API_CAP_PHEP, {method:'POST', headers:{'Content-Type':'text/plain;charset=utf-8'},
      body: JSON.stringify({fn:'dangNhap', u:uu, mk:mm})})
      .then(function(r){ return r.json(); })
      .then(function(d){
        if(d && d.ok && d.token){
          U.toast('Đăng nhập máy chủ thành công — đang mở kho…','ok');
          G.vaoBangPhienMayChu(d);   /* lưu token thật → capKhoa chạy → kho mở */
        } else if(dbox){
          dbox.innerHTML = '<div class="card pad-sm" style="border-color:var(--gita-do)">'+
            '<p class="sm" style="color:var(--gita-do-ink)">'+ic('x','w-3 h-3')+' '+
            U.h((d && d.error) || 'Đăng nhập không thành công.')+'</p></div>';
        }
      })
      .catch(function(){ if(dbox) dbox.innerHTML = '<p class="sm" style="color:var(--gita-do-ink)">Không gọi được máy chủ.</p>'; });
  }
  else if(a === 'mc-taoadmin'){
    var akey = document.getElementById('mcAdKey'), au = document.getElementById('mcAdU'), amk = document.getElementById('mcAdMk'), aten = document.getElementById('mcAdTen');
    var abox = document.getElementById('mcAdKq');
    var ask = akey ? String(akey.value||'') : '', auu = au ? String(au.value||'').trim() : '', amm = amk ? String(amk.value||'') : '', at = aten ? String(aten.value||'').trim() : '';
    if(!ask || !auu || !amm){ U.toast('Nhập secret khởi tạo, tên đăng nhập và mật khẩu.','err'); return; }
    if(abox) abox.innerHTML = '<p class="sm dim">Đang tạo Super Admin…</p>';
    fetch(G.API_CAP_PHEP, {method:'POST', headers:{'Content-Type':'text/plain;charset=utf-8'},
      body: JSON.stringify({fn:'taoAdminDau', setupKey:ask, tenMoi:auu, mk:amm, hoTen:at})})
      .then(function(r){ return r.json(); })
      .then(function(d){
        if(abox) abox.innerHTML = '<div class="card pad-sm" style="border-color:'+((d&&d.ok)?'var(--ok)':'var(--gita-do)')+'">'+
          '<p class="sm">'+ic((d&&d.ok)?'check':'x','w-3 h-3')+' '+U.h((d&&(d.msg||d.error))||'Không rõ kết quả.')+'</p></div>';
        if(d && d.ok){ if(akey) akey.value = ''; if(amk) amk.value = ''; var dd = document.getElementById('mcDnU'); if(dd) dd.value = auu; U.toast('Đã tạo Super Admin. Xoá secret GITA_TAO_ADMIN ở Cloudflare rồi đăng nhập máy chủ.','ok'); }
      })
      .catch(function(){ if(abox) abox.innerHTML = '<p class="sm" style="color:var(--gita-do-ink)">Không gọi được máy chủ.</p>'; });
  }
  else if(a === 'mc-thu'){
    if(kq) kq.innerHTML = '<p class="sm dim">Đang gọi máy chủ…</p>';
    G.thuMayChu().then(function(r){
      if(!kq) return;
      kq.innerHTML = r.ok
        ? '<div class="card pad-sm" style="border-color:var(--ok)">'+
            '<b class="sm" style="color:var(--ok)">'+ic('check','w-4 h-4')+' Máy chủ trả lời</b>'+
            '<p class="sm mt">'+h(r.ten)+' · đã nạp <b>'+r.soKhoa+'</b> khoá'+
            (r.soKhoa ? '' : ' — <b>máy chủ CHƯA có bộ khoá</b>, nên kho sẽ vẫn khoá và mọi lượt '+
              'xin khoá bị từ chối. Chạy: <span class="mono">npx wrangler secret put GITA_KHOA_KHO</span> '+
              'rồi dán toàn bộ nội dung tệp <span class="mono">kho/khoa.json</span>, sau đó '+
              '<span class="mono">npx wrangler deploy</span>.')+'</p></div>'
        : '<div class="card pad-sm" style="border-color:var(--gita-do)">'+
            '<b class="sm" style="color:var(--gita-do-ink)">'+ic('x','w-4 h-4')+' Chưa gọi được</b>'+
            '<p class="sm mt">'+h(r.ly)+'</p></div>';
    });
  }
});

})();
