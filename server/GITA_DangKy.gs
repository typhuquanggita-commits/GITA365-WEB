/**
 * ═══════════════════════════════════════════════════════════════
 * GITA 365 — ĐĂNG KÝ · OTP · KÍCH HOẠT
 *
 * Đúng luồng anh Quang đặt:
 *   Đăng ký → điền đủ thông tin → nhận mã OTP qua email → kích link
 *   đăng nhập lại → đặt mật khẩu → đăng ký thành công → có mã số khách hàng.
 *
 * Ba chỗ chặt trong luồng này:
 *   · Mã OTP không lưu dạng đọc được. Chỉ lưu bản băm, sống 15 phút,
 *     sai năm lần là huỷ.
 *   · Không bao giờ nói cho người gửi biết email đã đăng ký hay chưa —
 *     nếu không, bất kỳ ai cũng dò được danh sách khách hàng của GITA.
 *   · Tài khoản chỉ sinh ra ở bước cuối, sau khi đặt mật khẩu. Trước đó
 *     bản ghi nằm trong bảng chờ, không phải bảng người dùng.
 * ═══════════════════════════════════════════════════════════════
 */

var GITA_OTP_PHUT     = 15;   /* mã sống bao lâu */
var GITA_OTP_SAI_TOI  = 5;    /* sai bao nhiêu lần thì huỷ */
var GITA_KICHHOAT_GIO = 24;   /* link kích hoạt sống bao lâu */
var GITA_TRAN_DK_EMAIL_GIO = 3;    /* mỗi địa chỉ email: 3 lượt đăng ký mỗi giờ */
var GITA_TRAN_DK_TONG_GIO  = 60;   /* cả hệ thống: 60 lượt mỗi giờ */

function gitaOtpMoi_() {
  var n = '';
  for (var i = 0; i < 6; i++) n += Math.floor(Math.random() * 10);
  return n;
}

function gitaChoTheoEmail_(email) {
  var e = String(email || '').trim().toLowerCase();
  return Store.all('dangKyCho').filter(function (x) {
    return String(x.email || '').toLowerCase() === e && x.trangThai !== 'xong';
  })[0] || null;
}

function gitaEmailDaCo_(email) {
  var e = String(email || '').trim().toLowerCase();
  return !!Store.all('users').filter(function (x) {
    return String(x.email || '').toLowerCase() === e && !x.deletedAt;
  })[0];
}

/* ═══════════════ BƯỚC 1 · GỬI THÔNG TIN ĐĂNG KÝ ═══════════════ */
function gitaDangKy_(y) {
  var d = y.hoSo || {};
  var email = String(d.email || '').trim().toLowerCase();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email))
    return {ok: false, error: 'Email chưa đúng định dạng.'};
  if (!String(d.hoTen || '').trim() || !String(d.tenCon || '').trim())
    return {ok: false, error: 'Chưa điền đủ họ tên phụ huynh và tên con.'};
  var dt = String(d.dienThoai || '').replace(/[\s.\-]/g, '');
  if (!/^(0|\+84)[0-9]{9,10}$/.test(dt))
    return {ok: false, error: 'Số điện thoại chưa đúng định dạng Việt Nam.'};

  var thongBao = 'Nếu email này chưa có tài khoản, mã sáu số vừa được gửi tới ' + email +
                 '. Mã sống ' + GITA_OTP_PHUT + ' phút.';

  /* ── Trần gửi thư ──
     Đây là cửa duy nhất không cần phiên mà lại gửi email tới địa chỉ do
     người gọi tự đặt, với tên do người gọi tự viết. Không có trần thì một
     máy gửi được hàng trăm thư mang nội dung tuỳ ý, và hạn 100 thư/ngày của
     tài khoản Google cạn sạch — kéo theo OTP và mã lấy lại mật khẩu của
     khách hàng thật ngừng gửi cả ngày.

     Đếm hai lớp: theo địa chỉ nhận, và theo tổng số lượt của cả hệ thống. */
  var cache = CacheService.getScriptCache();
  var kEmail = 'DK_DEM_' + email;
  var nEmail = Number(cache.get(kEmail) || 0) + 1;
  cache.put(kEmail, String(nEmail), 3600);
  if (nEmail > GITA_TRAN_DK_EMAIL_GIO) {
    audit_(null, 'DANG_KY_CHAN', email, 'Vượt ' + GITA_TRAN_DK_EMAIL_GIO + ' lượt/giờ cho một email');
    return {ok: true, thongBao: thongBao};
  }
  var kChung = 'DK_DEM_TONG';
  var nChung = Number(cache.get(kChung) || 0) + 1;
  cache.put(kChung, String(nChung), 3600);
  if (nChung > GITA_TRAN_DK_TONG_GIO) {
    audit_(null, 'DANG_KY_CHAN_TONG', email,
      'Cả hệ thống vượt ' + GITA_TRAN_DK_TONG_GIO + ' lượt đăng ký/giờ');
    return {ok: true, thongBao: thongBao};
  }

  /* Email đã có tài khoản: dừng ở đây nhưng trả lời y hệt trường hợp thường,
     và gửi một thư nhắc rằng tài khoản đã tồn tại. Người thật vẫn biết
     phải làm gì; người dò danh sách thì không biết thêm điều gì. */
  if (gitaEmailDaCo_(email)) {
    try {
      MailApp.sendEmail(email, 'GITA 365 — email này đã có tài khoản',
        'Chào anh chị,\n\nCó một lượt đăng ký vừa dùng địa chỉ email này, nhưng email này đã ' +
        'có tài khoản GITA 365 rồi.\n\nNếu là anh chị: xin mời đăng nhập như bình thường, ' +
        'hoặc dùng mục "Quên mật khẩu" nếu không nhớ.\nNếu không phải anh chị: bỏ qua thư này, ' +
        'tài khoản vẫn an toàn.\n\nCần người thật: 08.5555.4688\nHọc viện GITA');
    } catch (e) {}
    audit_(null, 'DANG_KY_TRUNG_EMAIL', email, '');
    return {ok: true, thongBao: thongBao};
  }

  var cu = gitaChoTheoEmail_(email);
  var ma = gitaOtpMoi_();
  var muoi = Utilities.getUuid();
  var ban = {
    email: email,
    /* Cắt ngắn và bỏ ký tự xuống dòng: tên này đi vào thân thư gửi ra ngoài,
       để nguyên thì thành chỗ nhét nội dung tuỳ ý vào thư mang tên GITA. */
    hoTen: String(d.hoTen || '').replace(/[\r\n]+/g, ' ').trim().slice(0, 60),
    dienThoai: dt,
    tenCon: String(d.tenCon || '').trim(),
    lop: String(d.lop || '').trim(),
    tinh: String(d.tinh || '').trim(),
    maGioiThieu: String(d.maGioiThieu || '').trim(),
    otpSalt: muoi, otpHash: hashPw_(ma, muoi),
    otpHan: Date.now() + GITA_OTP_PHUT * 60000, otpSai: 0,
    tokenKichHoat: '', tokenHan: 0, trangThai: 'choOtp'
  };

  if (cu) Store.update('dangKyCho', cu.id, ban);
  else { ban.id = gitaMaMoi_('D'); ban.createdAt = new Date().toISOString(); Store.insert('dangKyCho', ban); }

  try {
    MailApp.sendEmail(email, 'GITA 365 — mã xác nhận đăng ký',
      'Chào ' + ban.hoTen + ',\n\nMã xác nhận của anh chị là: ' + ma + '\n\n' +
      'Mã sống ' + GITA_OTP_PHUT + ' phút. Nhập mã vào màn hình đang mở để đi tiếp.\n\n' +
      'Nếu anh chị không đăng ký, bỏ qua thư này.\n\n' +
      'Cần người thật: 08.5555.4688\nHọc viện GITA');
  } catch (e) {
    return {ok: false, error: 'Máy chủ chưa gửi được thư. Kiểm lại quyền gửi email của dự án.'};
  }

  audit_(null, 'DANG_KY_GUI_OTP', email, 'Chờ xác nhận');
  return {ok: true, thongBao: thongBao};
}

/* ═══════════════ BƯỚC 2 · GỬI LẠI MÃ ═══════════════ */
function gitaGuiLaiOtp_(y) {
  var email = String(y.email || '').trim().toLowerCase();
  var c = gitaChoTheoEmail_(email);
  var thongBao = 'Nếu email này đang chờ xác nhận, mã mới vừa được gửi.';
  if (!c) return {ok: true, thongBao: thongBao};

  var ma = gitaOtpMoi_(), muoi = Utilities.getUuid();
  Store.update('dangKyCho', c.id, {
    otpSalt: muoi, otpHash: hashPw_(ma, muoi),
    otpHan: Date.now() + GITA_OTP_PHUT * 60000, otpSai: 0
  });
  try {
    MailApp.sendEmail(email, 'GITA 365 — mã xác nhận mới',
      'Mã mới của anh chị: ' + ma + '\n\nMã cũ đã hết hiệu lực. Mã này sống ' +
      GITA_OTP_PHUT + ' phút.\n\nHọc viện GITA · 08.5555.4688');
  } catch (e) {}
  audit_(null, 'DANG_KY_GUI_LAI_OTP', email, '');
  return {ok: true, thongBao: thongBao};
}

/* ═══════════════ BƯỚC 3 · XÁC THỰC MÃ ═══════════════ */
function gitaXacThucOtp_(y) {
  var email = String(y.email || '').trim().toLowerCase();
  var ma = String(y.ma || '').replace(/\D/g, '');
  var c = gitaChoTheoEmail_(email);
  var sai = {ok: false, error: 'Mã chưa đúng hoặc đã hết hạn.'};
  if (!c || c.trangThai !== 'choOtp') return sai;

  if (Number(c.otpHan || 0) < Date.now()) return {ok: false, error: 'Mã đã hết hạn. Bấm gửi lại mã.'};
  if (Number(c.otpSai || 0) >= GITA_OTP_SAI_TOI)
    return {ok: false, error: 'Mã đã bị huỷ vì nhập sai quá nhiều lần. Bấm gửi lại mã.'};

  if (!safeEqual_(hashPw_(ma, c.otpSalt), c.otpHash)) {
    Store.update('dangKyCho', c.id, {otpSai: Number(c.otpSai || 0) + 1});
    var con = GITA_OTP_SAI_TOI - (Number(c.otpSai || 0) + 1);
    return {ok: false, error: 'Mã chưa đúng.' + (con > 0 ? ' Còn ' + con + ' lần nhập.' : ' Mã đã bị huỷ.')};
  }

  /* Đúng mã — sinh link kích hoạt, gửi qua chính email đó. Người dùng phải
     quay lại từ hòm thư, đúng như luồng anh Quang đặt: "kích link đăng nhập lại". */
  var token = gitaMaMoi_('K') + gitaMaMoi_('');
  Store.update('dangKyCho', c.id, {
    trangThai: 'choKichHoat', tokenKichHoat: token,
    tokenHan: Date.now() + GITA_KICHHOAT_GIO * 3600e3,
    otpHash: '', otpSalt: ''
  });

  var lien = gitaDiaChiUngDung_() + '#kichhoat=' + token;
  try {
    MailApp.sendEmail(email, 'GITA 365 — bước cuối để mở tài khoản',
      'Chào ' + c.hoTen + ',\n\nMã xác nhận đã đúng. Còn một bước: bấm vào đường dẫn dưới đây ' +
      'để đặt mật khẩu và mở tài khoản.\n\n' + lien + '\n\n' +
      'Đường dẫn sống ' + GITA_KICHHOAT_GIO + ' giờ.\n\nHọc viện GITA · 08.5555.4688');
  } catch (e) {
    return {ok: false, error: 'Máy chủ chưa gửi được thư kích hoạt.'};
  }

  audit_(null, 'DANG_KY_XAC_THUC_OTP', email, 'Đã gửi link kích hoạt');
  return {ok: true, thongBao: 'Mã đúng. Thư có đường dẫn đặt mật khẩu vừa được gửi tới ' + email + '.'};
}

/** Địa chỉ bản web, để dựng link kích hoạt. Đặt trong Script Properties. */
function gitaDiaChiUngDung_() {
  return PropertiesService.getScriptProperties().getProperty('GITA_DIA_CHI_WEB') ||
         'https://gita.edu.vn/';
}

/* ═══════════════ BƯỚC 4 · KÍCH HOẠT VÀ ĐẶT MẬT KHẨU ═══════════════ */
function gitaKichHoat_(y) {
  var token = String(y.token || '');
  var mk = String(y.mk || '');
  /* Dùng đúng luật mạnh yếu như chỗ đổi mật khẩu. Trước đây chỗ này chỉ đòi
     đủ 10 ký tự, nên '1234567890' mở được tài khoản mới trong khi chính mật
     khẩu ấy bị từ chối khi đổi — luật chặt ở cửa sau, hở ở cửa trước. */
  var manh = checkPwStrength_(mk);
  if (manh !== true && manh) return {ok: false, code: 'WEAK', error: String(manh)};

  var c = Store.all('dangKyCho').filter(function (x) {
    return String(x.tokenKichHoat || '') === token && x.trangThai === 'choKichHoat';
  })[0];
  if (!c) return {ok: false, error: 'Đường dẫn không còn hiệu lực. Xin đăng ký lại.'};
  if (Number(c.tokenHan || 0) < Date.now())
    return {ok: false, error: 'Đường dẫn đã hết hạn. Xin đăng ký lại.'};

  /* Mã số khách hàng: đánh số liên tục, không đoán được ai là ai từ mã.
     Phải KHOÁ: hai gia đình bấm link kích hoạt cùng lúc thì hai lần chạy
     song song cùng đọc N và cùng sinh GITA-000(N+1) — hai nhà chung một mã,
     mà việc nâng tầng lại dò phiếu thanh toán theo đúng mã đó. */
  var khoa = null;
  try {
    khoa = LockService.getScriptLock();
    khoa.waitLock(20000);
  } catch (e) {
    return {ok: false, error: 'Máy chủ đang bận. Bấm lại đường dẫn sau ít giây.'};
  }

  var maKH;
  try {
    var soHienCo = Store.all('users').filter(function (x) { return x.maKhachHang; }).length;
    maKH = 'GITA-' + ('0000' + (soHienCo + 1)).slice(-4);

  var muoi = Utilities.getUuid();
  var uid = gitaMaMoi_('U');
  var maHV = gitaMaMoi_('H');

  Store.insert('students', {
    id: maHV, hoTen: c.tenCon, lop: c.lop, tinh: c.tinh,
    tier: 0, status: 'moi', kpi: 0, phuHuynhId: uid, coach: '',
    createdAt: new Date().toISOString()
  });

  Store.insert('users', {
    id: uid, username: c.email, hoTen: c.hoTen, email: c.email, dienThoai: c.dienThoai,
    role: 'R13', portal: 'ph', studentId: maHV,
    pwSalt: muoi, pwHash: hashPw_(mk, muoi),
    active: 'TRUE', createdAt: new Date().toISOString(), updatedAt: '', deletedAt: '',
    maKhachHang: maKH, boTro: c.maGioiThieu || ''
  });

    Store.update('dangKyCho', c.id, {trangThai: 'xong', tokenKichHoat: '', tokenHan: 0});
  } finally {
    try { khoa.releaseLock(); } catch (e) {}
  }

  audit_({uid: uid, username: c.email}, 'DANG_KY_XONG', maKH,
    'Tầng 0 · chờ hoàn thành KPI và xác nhận thanh toán' +
    (c.maGioiThieu ? ' · bảo trợ ' + c.maGioiThieu : ''));

  try {
    MailApp.sendEmail(c.email, 'GITA 365 — tài khoản đã mở',
      'Chào ' + c.hoTen + ',\n\nTài khoản của gia đình đã mở.\n' +
      'Mã số khách hàng: ' + maKH + '\nTên đăng nhập: ' + c.email + '\n\n' +
      'Hiện nhà mình đang ở chặng khởi đầu. Tư vấn của GITA sẽ liên hệ trong 24 giờ tới ' +
      'để cùng nhìn lại và chọn chặng phù hợp.\n\nHọc viện GITA · 08.5555.4688');
  } catch (e) {}

  return {ok: true, maKhachHang: maKH, email: c.email};
}

/* ═══════════════ NÂNG TẦNG ═══════════════
   Luồng anh Quang đặt: hoàn thành KPI tầng → xác nhận thanh toán → check
   cả hai → nâng tầng → mở quyền tương ứng.
   Máy chủ KHÔNG tự nâng. Phải có người bậc ≤ 3 bấm, và cả hai điều kiện
   phải đúng, nếu không thì từ chối kèm lý do rõ ràng. */
function gitaNangTang_(y, hoSo) {
  var lv = (ROLES[hoSo.role] || {lv: 99}).lv;
  if (lv > 3) return {ok: false, error: 'Chỉ R01–R03 nâng tầng được.'};

  var hv = Store.find('students', String(y.maHocVien || ''));
  if (!hv) return {ok: false, error: 'Không tìm thấy hồ sơ học viên.'};

  var tangMoi = Number(y.tang || 0);
  if (!(tangMoi >= 1 && tangMoi <= 5)) return {ok: false, error: 'Tầng phải từ 1 đến 5.'};
  if (tangMoi !== Number(hv.tier || 0) + 1)
    return {ok: false, error: 'Chỉ nâng được một tầng mỗi lần, theo thứ tự.'};

  var kpi = Number(hv.kpi || 0);
  if (kpi < 80)
    return {ok: false, error: 'KPI tầng đang là ' + kpi + '%. Cửa nâng tầng là 80%.'};

  /* Mã khách hàng phải là mã của CHÍNH nhà này.
     Trước đây mã lấy thẳng từ thân yêu cầu và không đối chiếu với hồ sơ học
     viên, nên một phiếu thanh toán của nhà A mở được tầng cho con nhà B —
     chỉ cần gõ nhầm hoặc cố ý gõ mã của nhà A. */
  var ph = null;
  try { ph = Store.find('users', hv.phuHuynhId); } catch (e) { ph = null; }
  var maNha = ph && ph.maKhachHang;
  if (!maNha) return {ok: false, error: 'Hồ sơ học viên chưa gắn với tài khoản phụ huynh nào.'};
  if (String(y.maKhachHang || '') !== String(maNha))
    return {ok: false, error: 'Mã khách hàng không khớp với hồ sơ học viên này.'};

  /* Phiếu thanh toán dùng MỘT LẦN. Không đánh dấu thì cùng một phiếu mở được
     tầng cho bao nhiêu học viên cũng được. */
  var tt = Store.all('thanhToan').filter(function (x) {
    return String(x.maKhachHang) === String(maNha) &&
           Number(x.tier) === tangMoi && String(x.trangThai) === 'daXacNhan' &&
           !isTrue(x.daDung);
  })[0];
  if (!tt) return {ok: false,
    error: 'Chưa có xác nhận thanh toán còn hiệu lực cho tầng ' + tangMoi + '.'};

  Store.update('thanhToan', tt.id, {
    daDung: 'TRUE', dungChoHocVien: hv.id, dungLuc: new Date().toISOString()
  });
  Store.update('students', hv.id, {tier: tangMoi, status: 'dangHoc'});
  audit_(hoSo.phien, 'NANG_TANG', hv.id,
    'Lên tầng ' + tangMoi + ' · KPI ' + kpi + '% · phiếu ' + tt.id + ' · nhà ' + maNha);
  return {ok: true, tang: tangMoi, kpi: kpi};
}
