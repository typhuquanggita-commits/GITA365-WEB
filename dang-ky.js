/* ═══════════════════════════════════════════════════════════════
   GITA 365 · v7.6 — KHÁCH HÀNG TỰ ĐĂNG KÝ
   Năm bước theo G.QUYTRINH.dangKy:
     đăng ký → điền đủ → OTP qua email → kích link đặt mật khẩu →
     thành công, nhận mã số khách hàng.
   Việc sinh mã, gửi thư và cấp mã số nằm ở máy chủ. Phía này chỉ
   dựng ô nhập, kiểm sơ bộ và hiển thị.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;

(function(){
var KHOA_GT = 'gita_ma_gioi_thieu';

function U(){ return G.U; }
function h(x){ return G.U.h(x); }

/* ─── Mã giới thiệu của cộng tác viên đi trong đường dẫn ?gt=CTV-xxxxxx ─── */
G.batMaGioiThieu = function(){
  var m = null;
  try{
    m = new URLSearchParams(location.search).get('gt');
    if(m){ m = String(m).trim().toUpperCase(); }
    if(m && !/^CTV-[A-Z0-9]{6}$/.test(m)) m = null;
    if(m) sessionStorage.setItem(KHOA_GT, m);
    else m = sessionStorage.getItem(KHOA_GT);
  }catch(e){ m = null; }
  return m || null;
};

function goi(than){
  if(!G.API_CAP_PHEP) return Promise.reject(new Error('CHUA_NOI'));
  return fetch(G.API_CAP_PHEP, {
    method:'POST', headers:{'Content-Type':'text/plain;charset=utf-8'},
    body: JSON.stringify(than)
  }).then(function(r){ return r.json(); })
    .then(function(d){ if(!d || !d.ok) throw new Error(d && d.error || 'Máy chủ từ chối'); return d; });
}

/* Bản mẫu không có máy chủ: nói thẳng, không giả vờ đã gửi thư. */
function bangMau(){
  return '<div class="card pad-sm mb" style="border-color:rgba(245,158,11,.4);background:rgba(245,158,11,.07)">'+
    '<p class="tiny" style="line-height:1.6;color:var(--ink-2)"><b>Bản mẫu — chưa nối máy chủ.</b> '+
    'Biểu mẫu này dựng đủ để xem và kiểm, nhưng chưa gửi được thư xác nhận và chưa cấp được mã số khách hàng. '+
    'Nối máy chủ cấp phép rồi mới đăng ký thật được.</p></div>';
}

/* ═════════ BƯỚC 1–2 · BIỂU MẪU ĐĂNG KÝ ═════════ */
var TRUONG = [
  {k:'hoTen',  nhan:'HỌ TÊN PHỤ HUYNH',   ph:'Nguyễn Văn A',        bat:1, tu:'text'},
  {k:'email',  nhan:'EMAIL',              ph:'ten@email.com',       bat:1, tu:'email'},
  {k:'dienThoai',nhan:'SỐ ĐIỆN THOẠI',    ph:'09xxxxxxxx',          bat:1, tu:'tel'},
  {k:'tenCon', nhan:'TÊN CON',            ph:'Nguyễn Minh An',      bat:1, tu:'text'},
  {k:'lop',    nhan:'LỚP',                ph:'Lớp 9',               bat:1, tu:'text'},
  {k:'tinh',   nhan:'TỈNH / THÀNH PHỐ',   ph:'Hà Nội',              bat:1, tu:'text'}
];

/* ═══ BA Ô ĐỒNG Ý — Luật số 91/2025/QH15, việc số 2 ═══

   Luật đòi ô đồng ý RIÊNG, tách bạch, không gộp vào điều khoản chung.
   Tới 9.99.69 chỗ này còn đúng MỘT ô, và câu báo lỗi của nó tự khai
   ra chỗ sai: "đồng ý điều khoản sử dụng VÀ cách GITA giữ dữ liệu".
   Một ô gộp là một câu hỏi mà người trả lời không tách được phần họ
   muốn nhận khỏi phần họ không muốn.

   Bản chép của G.PLR_DONGY. Màn đăng ký chạy TRƯỚC khi đăng nhập nên
   kho chưa nạp — đây là một trong số rất ít chỗ phải khai tay, và mục
   87 đối chiếu ba ô này với kho mỗi lần chạy. */
var O_DONGY = [
  {k:'dyDieuKhoan', bat:1,
   chu:'Tôi đồng ý với điều khoản sử dụng của Học viện GITA.'},
  {k:'dyDuLieuGiaDinh', bat:1,
   chu:'Tôi đồng ý để Học viện GITA lưu và dùng thông tin trên cho việc học của gia '+
       'đình tôi. GITA không thu thập tôn giáo, tình trạng sức khoẻ, thu nhập hay '+
       'chuyện riêng của vợ chồng.'},
  {k:'dyDuLieuCon', bat:0,
   chu:'Tôi là cha/mẹ hoặc người giám hộ, và tôi đồng ý để GITA ghi lại quan sát về '+
       'con tôi cho việc đồng hành. Tôi rút lại được bất cứ lúc nào.'}
];

G.kiemDangKy = function(d){
  for(var i=0;i<TRUONG.length;i++){
    var t = TRUONG[i];
    if(t.bat && !String(d[t.k]||'').trim()) return 'Chưa điền ' + t.nhan.toLowerCase() + '.';
  }
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(d.email||''))) return 'Email chưa đúng định dạng.';
  var dt = String(d.dienThoai||'').replace(/[\s.\-]/g,'');
  if(!/^(0|\+84)[0-9]{9,10}$/.test(dt)) return 'Số điện thoại chưa đúng định dạng Việt Nam.';
  if(String(d.hoTen).trim().length < 3) return 'Họ tên quá ngắn.';
  /* LUẬT 91/2025 · VIỆC SỐ 2 — ô đồng ý RIÊNG, tách bạch, không gộp
     vào điều khoản chung. Hai ô đầu bắt buộc vì không có chúng thì
     không có hợp đồng nào để bắt đầu; ô thứ ba thì KHÔNG — bắt cả ba
     mới đăng ký được thì ba ô lại thành một ô, người ta tích hết một
     lượt, và cái "riêng, tách bạch" chỉ còn ở hình thức. Ô thứ ba hỏi
     lúc cần mở hồ sơ về con, và hai cửa ấy chặn nếu chưa có. */
  if(!d.dyDieuKhoan) return 'Cần đồng ý điều khoản sử dụng.';
  if(!d.dyDuLieuGiaDinh) return 'Cần đồng ý để GITA lưu và dùng thông tin của gia đình.';
  return true;
};

G.moDangKy = function(){
  var gt = G.batMaGioiThieu();
  var o = '<h2 style="font-size:21px;font-weight:800;margin-bottom:4px">Đăng ký GITA 365</h2>'+
    '<p class="sm muted" style="margin-bottom:14px">Điền đủ sáu ô dưới đây. Ngay sau khi gửi, một mã sáu số '+
    'sẽ được gửi tới email anh chị vừa nhập.</p>';
  if(!G.API_CAP_PHEP) o += bangMau();
  if(gt) o += '<div class="card pad-sm mb" style="border-color:rgba(16,185,129,.4);background:rgba(16,185,129,.07)">'+
    '<div class="tiny up muted">NGƯỜI BẢO TRỢ</div>'+
    '<div class="sm mt" style="color:var(--ink-1)">Mã liên kết <b class="mono" style="color:#0B7350">'+h(gt)+'</b> — '+
    'gia đình mình vào GITA qua lời giới thiệu của cộng tác viên này. Mã đi theo hồ sơ và không sửa được sau khi đăng ký.</div>'+
    '</div>';
  o += TRUONG.map(function(t){
    return '<label class="tiny up muted">'+h(t.nhan)+'</label>'+
      '<input id="dk_'+t.k+'" type="'+t.tu+'" placeholder="'+h(t.ph)+'" class="inp blk mb" '+
      'autocomplete="'+(t.k==='email'?'email':t.k==='hoTen'?'name':t.k==='dienThoai'?'tel':'off')+'">';
  }).join('');
  /* BA Ô, KHÔNG PHẢI MỘT. Ô cuối ghi rõ là không bắt buộc — không ghi
     thì người ta tích cho xong, và một cái tích cho xong không phải
     một sự đồng ý. */
  o += O_DONGY.map(function(dy){
    return '<label class="dk-dy"><input id="dk_'+dy.k+'" type="checkbox"> '+
      '<span class="tiny" style="line-height:1.6;color:var(--ink-2)">'+h(dy.chu)+
      (dy.bat ? '' : ' <b>(không bắt buộc — anh chị tích sau cũng được)</b>')+
      '</span></label>';
  }).join('')+
    '<div id="dk_loi" class="tiny mb" style="color:#BE0E16;min-height:16px"></div>'+
    '<button class="btn pri blk" data-act="gui-dang-ky">Gửi và nhận mã xác nhận</button>'+
    '<p class="tiny muted mt center">Đã có tài khoản? Đóng cửa sổ này và đăng nhập ở ô bên dưới.</p>';
  U().modal(o);
};

G.guiDangKy = function(){
  var loi = document.getElementById('dk_loi');
  function bao(t){ if(loi) loi.textContent = t; }
  var d = {};
  TRUONG.forEach(function(t){ d[t.k] = ((document.getElementById('dk_'+t.k)||{}).value || '').trim(); });
  O_DONGY.forEach(function(dy){
    d[dy.k] = !!(document.getElementById('dk_'+dy.k)||{}).checked;
  });
  d.maGioiThieu = G.batMaGioiThieu() || '';

  var r = G.kiemDangKy(d);
  if(r !== true){ bao(r); return; }
  bao('Đang gửi…');
  goi({ fn:'dangKy', hoSo:d })
    .then(function(x){ G.moNhapOTP(d.email, x.thongBao); })
    .catch(function(e){
      if(e.message === 'CHUA_NOI'){
        bao('Bản mẫu chưa nối máy chủ nên không gửi được thư. Thông tin vừa điền hợp lệ.');
        return;
      }
      bao(e.message);
    });
};

/* ═════════ BƯỚC 3 · NHẬP MÃ OTP ═════════ */
G.moNhapOTP = function(email, thongBao){
  U().modal(
    '<h2 style="font-size:21px;font-weight:800;margin-bottom:4px">Nhập mã xác nhận</h2>'+
    '<p class="sm muted" style="margin-bottom:14px">'+h(thongBao ||
      ('Mã sáu số đã được gửi tới ' + email + '. Mã sống mười lăm phút.'))+'</p>'+
    '<input type="hidden" id="otp_email" value="'+h(email)+'">'+
    '<label class="tiny up muted">MÃ SÁU SỐ</label>'+
    '<input id="otp_ma" inputmode="numeric" maxlength="6" placeholder="------" '+
      'class="inp blk mb mono" style="letter-spacing:.5em;text-align:center;font-size:21px">'+
    '<div id="otp_loi" class="tiny mb" style="color:#BE0E16;min-height:16px"></div>'+
    '<button class="btn pri blk" data-act="gui-otp">Xác nhận</button>'+
    '<button class="btn ghost blk mt" data-act="xin-lai-otp" style="font-size:12.5px">Chưa nhận được thư — gửi lại mã</button>'+
    '<p class="tiny muted mt center">Sai năm lần thì mã bị huỷ và phải xin mã mới.</p>'
  );
};

G.guiOTP = function(){
  var loi = document.getElementById('otp_loi');
  function bao(t){ if(loi) loi.textContent = t; }
  var email = (document.getElementById('otp_email')||{}).value || '';
  var ma = ((document.getElementById('otp_ma')||{}).value || '').replace(/\D/g,'');
  if(ma.length !== 6){ bao('Mã gồm đúng sáu chữ số.'); return; }
  bao('Đang kiểm…');
  goi({ fn:'xacThucOtp', email:email, ma:ma })
    .then(function(x){ G.moDaGuiLink(email, x.thongBao); })
    .catch(function(e){ bao(e.message === 'CHUA_NOI' ? 'Bản mẫu chưa nối máy chủ.' : e.message); });
};

G.xinLaiOTP = function(){
  var loi = document.getElementById('otp_loi');
  var email = (document.getElementById('otp_email')||{}).value || '';
  goi({ fn:'guiLaiOtp', email:email })
    .then(function(x){ if(loi){ loi.style.color = '#0B7350'; loi.textContent = x.thongBao || 'Đã gửi lại mã.'; } })
    .catch(function(e){ if(loi){ loi.style.color = '#BE0E16'; loi.textContent = e.message === 'CHUA_NOI' ? 'Bản mẫu chưa nối máy chủ.' : e.message; } });
};

/* ═════════ BƯỚC 4 · ĐÃ GỬI LIÊN KẾT KÍCH HOẠT ═════════ */
G.moDaGuiLink = function(email, thongBao){
  U().modal(
    '<div class="center" style="padding:6px 0 2px">'+G.U.ic('check','w-9 h-9')+'</div>'+
    '<h2 style="font-size:21px;font-weight:800;margin:8px 0 4px;text-align:center">Đúng mã rồi</h2>'+
    '<p class="sm muted center" style="margin-bottom:16px">'+h(thongBao ||
      ('Trong hộp thư ' + email + ' có một đường liên kết kích hoạt. Bấm vào đó để đặt mật khẩu và đăng nhập lại. Liên kết sống hai mươi tư giờ.'))+'</p>'+
    '<div class="card pad-sm"><div class="tiny up muted mb">CÒN MỘT BƯỚC NỮA</div>'+
    '<p class="tiny" style="line-height:1.65;color:var(--ink-2)">Đặt mật khẩu xong là đăng ký thành công và gia đình mình nhận mã số khách hàng riêng. '+
    'Mã đó đi theo cả hành trình năm tầng.</p></div>'+
    '<button class="btn ghost blk mt" data-act="dong-modal">Đã hiểu</button>'
  );
};

/* ═════════ BƯỚC 4b · ĐẶT MẬT KHẨU TỪ LIÊN KẾT KÍCH HOẠT ═════════ */
G.batLinkKichHoat = function(){
  var t = null;
  try{ t = new URLSearchParams(location.search).get('kh'); }catch(e){ return; }
  if(!t || !/^[A-Za-z0-9_\-]{16,120}$/.test(t)) return;
  setTimeout(function(){ G.moKichHoat(t); }, 500);
};

G.moKichHoat = function(token){
  U().modal(
    '<h2 style="font-size:21px;font-weight:800;margin-bottom:4px">Đặt mật khẩu</h2>'+
    '<p class="sm muted" style="margin-bottom:14px">Bước cuối. Đặt xong là đăng ký thành công.</p>'+
    '<input type="hidden" id="kh_token" value="'+h(token)+'">'+
    '<label class="tiny up muted">MẬT KHẨU</label>'+
    '<input id="kh_mk" type="password" autocomplete="new-password" class="inp blk">'+
    '<p id="kh_goi" class="tiny muted" style="margin:6px 0 12px">Ít nhất mười ký tự, có chữ hoa, chữ thường, chữ số và ký tự đặc biệt.</p>'+
    '<label class="tiny up muted">NHẬP LẠI MẬT KHẨU</label>'+
    '<input id="kh_lai" type="password" autocomplete="new-password" class="inp blk mb">'+
    '<div id="kh_loi" class="tiny mb" style="color:#BE0E16;min-height:16px"></div>'+
    '<button class="btn pri blk" data-act="kich-hoat">Hoàn tất đăng ký</button>'
  );
  var o = document.getElementById('kh_mk');
  if(o) o.addEventListener('input', function(){
    var r = G.kiemMatKhau(o.value), g = document.getElementById('kh_goi');
    if(!g) return;
    if(r === true){ g.textContent = 'Mật khẩu đạt chuẩn.'; g.style.color = '#0B7350'; }
    else { g.textContent = r; g.style.color = 'var(--ink-3)'; }
  });
};

G.kichHoat = function(){
  var loi = document.getElementById('kh_loi');
  function bao(t){ if(loi) loi.textContent = t; }
  var token = (document.getElementById('kh_token')||{}).value || '';
  var mk = (document.getElementById('kh_mk')||{}).value || '';
  var lai = (document.getElementById('kh_lai')||{}).value || '';
  if(mk !== lai){ bao('Hai lần nhập không khớp.'); return; }
  var r = G.kiemMatKhau(mk);
  if(r !== true){ bao(r); return; }
  bao('Đang hoàn tất…');
  goi({ fn:'kichHoat', token:token, mk:mk })
    .then(function(x){ G.moDangKyXong(x.maKhachHang, x.email); })
    .catch(function(e){ bao(e.message === 'CHUA_NOI' ? 'Bản mẫu chưa nối máy chủ.' : e.message); });
};

/* ═════════ BƯỚC 5 · ĐĂNG KÝ THÀNH CÔNG ═════════ */
G.moDangKyXong = function(ma, email){
  try{ history.replaceState(null,'',location.pathname); }catch(e){}
  U().modal(
    '<div class="center" style="padding:6px 0 2px;color:var(--gold-ink)">'+G.U.ic('crown','w-9 h-9')+'</div>'+
    '<h2 style="font-size:21px;font-weight:800;margin:8px 0 4px;text-align:center">Đăng ký thành công</h2>'+
    '<p class="sm muted center" style="margin-bottom:16px">Gia đình mình đã có mặt trong hệ sinh thái GITA 365.</p>'+
    '<div class="card center" style="padding:20px;border-color:var(--gita-vien-2);background:var(--gita-mo-1)">'+
      '<div class="tiny up muted mb">MÃ SỐ KHÁCH HÀNG</div>'+
      '<div class="mono" style="font-size:21px;font-weight:800;color:var(--gold-ink);letter-spacing:.06em">'+h(ma||'—')+'</div>'+
      '<p class="tiny muted mt">Mã này đi theo gia đình suốt năm tầng. Giữ lại khi cần liên hệ Học viện.</p></div>'+
    '<div class="card pad-sm mt"><div class="tiny up muted mb">BƯỚC TIẾP THEO</div>'+
    '<p class="tiny" style="line-height:1.65;color:var(--ink-2)">Đăng nhập bằng '+h(email||'email vừa đăng ký')+
    ' và mật khẩu vừa đặt. Tài khoản đang ở tầng khởi đầu: làm được bài test nhận diện và xem phần nền. '+
    'Hoàn thành KPI tầng và xác nhận thanh toán là hệ thống mở tầng tiếp theo.</p></div>'+
    '<button class="btn pri blk mt" data-act="dong-modal">Đăng nhập ngay</button>'
  );
};
})();
