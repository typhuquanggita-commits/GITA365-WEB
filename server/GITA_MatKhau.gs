/**
 * ═══════════════════════════════════════════════════════════════
 * GITA 365 — ĐỔI MẬT KHẨU VÀ LẤY LẠI MẬT KHẨU QUA EMAIL
 * Dán vào cùng dự án Apps Script với GITA_CapPhep.gs.
 *
 * Dùng đúng lớp băm sẵn có của v6.9: hashPw_, newSalt_, safeEqual_,
 * checkPwStrength_ trong 02_Security.gs. Không tự nghĩ ra cách băm mới.
 * ═══════════════════════════════════════════════════════════════
 */

var GITA_HAN_MA_PHUT   = 15;   // mã lấy lại mật khẩu sống bao lâu
var GITA_TRAN_QUEN_GIO = 5;    // số lần xin mã tối đa mỗi giờ cho một tài khoản

function gitaMaSauSo_() {
  var b = '';
  for (var i = 0; i < 6; i++) b += Math.floor(Math.random() * 10);
  return b;
}
function gitaKhoaMa_(u) { return 'PWRESET_' + String(u).toLowerCase(); }

/* ═══════════ 1. ĐỔI MẬT KHẨU — khi đã đăng nhập ═══════════ */
function gitaDoiMatKhau_(y, hoSo) {
  var cu = String(y.cu || ''), moi = String(y.moi || '');
  if (!cu || !moi) return { ok: false, error: 'Thiếu mật khẩu cũ hoặc mật khẩu mới.' };

  var nd = Store.find('users', hoSo.phien.uid);
  if (!nd) return { ok: false, code: 'AUTH', error: 'Không tìm thấy tài khoản.' };

  // Mật khẩu cũ phải đúng
  if (!safeEqual_(hashPw_(cu, nd.pwSalt), nd.pwHash)) {
    ghiNhatKy_({ viec: 'DOI_MK_SAI', u: hoSo.u, role: hoSo.role, phien: hoSo.phien,
      chiTiet: 'Nhập sai mật khẩu cũ' });
    return { ok: false, code: 'WRONG', error: 'Mật khẩu hiện tại không đúng.' };
  }
  if (cu === moi) return { ok: false, error: 'Mật khẩu mới phải khác mật khẩu cũ.' };

  var manh = checkPwStrength_(moi);
  if (manh !== true && manh) return { ok: false, code: 'WEAK', error: String(manh) };

  var muoi = newSalt_();
  Store.update('users', nd.id, {
    pwSalt: muoi, pwHash: hashPw_(moi, muoi),
    mustChangePw: false, pwDoiLuc: new Date().toISOString()
  });

  // Đổi mật khẩu là đóng mọi phiên khác — người lạ đang dùng token cũ bị đá ra
  /* Đá MỌI phiên, không chỉ phiên đang gọi. Đổi mật khẩu mà thiết bị khác
     vẫn vào được thì việc đổi gần như vô nghĩa. */
  try { xoaMoiPhien_(nd.id); } catch (e) { try { closeSession_(y.token); } catch (e2) {} }

  ghiNhatKy_({ viec: 'DOI_MK', u: hoSo.u, role: hoSo.role, phien: hoSo.phien,
    chiTiet: 'Đổi mật khẩu thành công, đã đóng phiên' });
  try {
    MailApp.sendEmail(nd.email || nd.username, 'GITA 365 — mật khẩu đã được đổi',
      'Chào ' + (nd.hoTen || 'anh chị') + ',\n\n' +
      'Mật khẩu tài khoản ' + nd.username + ' vừa được đổi lúc ' +
      Utilities.formatDate(new Date(), 'GMT+7', 'HH:mm dd/MM/yyyy') + '.\n\n' +
      'Nếu không phải anh chị đổi, báo ngay cho Học viện GITA theo số 08.5555.4688.\n\n' +
      'Học viện GITA');
  } catch (e) { /* không gửi được thư thì việc đổi vẫn xong */ }

  return { ok: true, thongBao: 'Đã đổi mật khẩu. Hãy đăng nhập lại bằng mật khẩu mới.' };
}

/* ═══════════ 2. QUÊN MẬT KHẨU — gửi mã sáu số qua email ═══════════ */
function gitaQuenMatKhau_(y) {
  var u = String(y.u || '').trim().toLowerCase();
  if (!u) return { ok: false, error: 'Thiếu tên đăng nhập.' };

  // Trả lời GIỐNG NHAU dù tài khoản có thật hay không — không để dò tài khoản
  var traLoi = { ok: true, thongBao: 'Nếu tài khoản có thật, mã lấy lại mật khẩu đã được gửi tới email đăng ký. Mã sống ' + GITA_HAN_MA_PHUT + ' phút.' };

  var kho = CacheService.getScriptCache();
  var kDem = 'PWRESET_DEM_' + u;
  var soLan = Number(kho.get(kDem) || 0) + 1;
  kho.put(kDem, String(soLan), 3600);
  if (soLan > GITA_TRAN_QUEN_GIO) {
    ghiNhatKy_({ viec: 'QUEN_MK_CHAN', u: u, chiTiet: 'Vượt trần ' + GITA_TRAN_QUEN_GIO + ' lần/giờ' });
    return traLoi;
  }

  /* Nhận CẢ tên đăng nhập LẪN địa chỉ email — giống hệt lúc đăng nhập.
     Người quên mật khẩu thường cũng không nhớ chính xác tên đăng nhập; bắt
     họ nhớ đúng một trong hai là dựng thêm một cánh cửa khoá nữa ngay lúc
     họ đang bí. */
  var nd = null;
  try {
    nd = Store.all('users').filter(function (x) {
      return String(x.username || '').toLowerCase() === u ||
             String(x.email || '').toLowerCase() === u;
    })[0];
  } catch (e) { nd = null; }
  if (!nd || !isTrue(nd.active) || nd.deletedAt) return traLoi;

  var email = nd.email || nd.username;
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return traLoi;

  /* Khoá lưu mã đi theo TÊN ĐĂNG NHẬP thật, không theo chuỗi người dùng gõ.
     Nếu không, xin mã bằng email rồi đặt lại bằng tên đăng nhập sẽ không khớp. */
  var uThat = String(nd.username || '').toLowerCase();

  var ma = gitaMaSauSo_();
  var muoi = newSalt_();
  kho.put(gitaKhoaMa_(uThat), JSON.stringify({
    hash: hashPw_(ma, muoi), salt: muoi, uid: nd.id,
    het: Date.now() + GITA_HAN_MA_PHUT * 60000, sai: 0
  }), GITA_HAN_MA_PHUT * 60);

  try {
    MailApp.sendEmail(email, 'GITA 365 — mã lấy lại mật khẩu',
      'Chào ' + (nd.hoTen || 'anh chị') + ',\n\n' +
      'Mã lấy lại mật khẩu của tài khoản ' + nd.username + ' là:\n\n' +
      '        ' + ma + '\n\n' +
      'Mã sống ' + GITA_HAN_MA_PHUT + ' phút và chỉ dùng được một lần.\n\n' +
      'Nếu không phải anh chị yêu cầu, bỏ qua thư này — mật khẩu cũ vẫn nguyên. ' +
      'Nếu nhận nhiều thư như thế này, báo cho Học viện GITA theo số 08.5555.4688.\n\n' +
      'Học viện GITA');
  } catch (e) {
    ghiNhatKy_({ viec: 'QUEN_MK_LOI', u: u, chiTiet: 'Không gửi được thư: ' + e.message });
    return traLoi;
  }

  ghiNhatKy_({ viec: 'QUEN_MK', u: u, chiTiet: 'Đã gửi mã tới ' + email.replace(/^(.{2}).*(@.*)$/, '$1***$2') });
  return traLoi;
}

/* ═══════════ 3. ĐẶT LẠI MẬT KHẨU BẰNG MÃ ═══════════ */
function gitaDatLaiMatKhau_(y) {
  var u = String(y.u || '').trim().toLowerCase();
  var ma = String(y.ma || '').trim();
  var moi = String(y.moi || '');
  if (!u || !ma || !moi) return { ok: false, error: 'Thiếu tên đăng nhập, mã hoặc mật khẩu mới.' };

  /* Người dùng có thể xin mã bằng email rồi đặt lại bằng tên đăng nhập, hoặc
     ngược lại. Quy cả hai về đúng một tài khoản trước khi tìm mã. */
  var ndTim = null;
  try {
    ndTim = Store.all('users').filter(function (x) {
      return String(x.username || '').toLowerCase() === u ||
             String(x.email || '').toLowerCase() === u;
    })[0];
  } catch (e) { ndTim = null; }
  if (ndTim) u = String(ndTim.username || '').toLowerCase();

  var kho = CacheService.getScriptCache();
  var raw = kho.get(gitaKhoaMa_(u));
  if (!raw) return { ok: false, code: 'EXPIRED', error: 'Mã đã hết hạn hoặc chưa được cấp. Xin mã mới.' };

  var g = JSON.parse(raw);
  if (g.het < Date.now()) { kho.remove(gitaKhoaMa_(u)); return { ok: false, code: 'EXPIRED', error: 'Mã đã hết hạn. Xin mã mới.' }; }

  if (!safeEqual_(hashPw_(ma, g.salt), g.hash)) {
    g.sai = (g.sai || 0) + 1;
    if (g.sai >= 5) {
      kho.remove(gitaKhoaMa_(u));
      ghiNhatKy_({ viec: 'DAT_LAI_MK_CHAN', u: u, chiTiet: 'Sai mã 5 lần — huỷ mã' });
      return { ok: false, code: 'LOCKED', error: 'Sai mã năm lần. Mã đã bị huỷ, xin mã mới.' };
    }
    kho.put(gitaKhoaMa_(u), JSON.stringify(g), Math.max(60, Math.round((g.het - Date.now()) / 1000)));
    return { ok: false, code: 'WRONG', error: 'Mã không đúng. Còn ' + (5 - g.sai) + ' lần thử.' };
  }

  var manh = checkPwStrength_(moi);
  if (manh !== true && manh) return { ok: false, code: 'WEAK', error: String(manh) };

  var nd = Store.find('users', g.uid);
  if (!nd) return { ok: false, error: 'Không tìm thấy tài khoản.' };

  var muoi = newSalt_();
  Store.update('users', nd.id, {
    pwSalt: muoi, pwHash: hashPw_(moi, muoi),
    mustChangePw: false, pwDoiLuc: new Date().toISOString()
  });
  kho.remove(gitaKhoaMa_(u));
  try { clearFail_(u); } catch (e) {}
  /* Người phải dùng tới "quên mật khẩu" thường là người vừa bị mất quyền
     kiểm soát tài khoản. Đá mọi phiên đang mở là việc bắt buộc ở đây. */
  var soPhien = 0;
  try { soPhien = xoaMoiPhien_(nd.id); } catch (e) {}

  ghiNhatKy_({ viec: 'DAT_LAI_MK', u: u, role: nd.role,
    chiTiet: 'Đặt lại mật khẩu bằng mã email · đóng ' + soPhien + ' phiên đang mở' });
  try {
    MailApp.sendEmail(nd.email || nd.username, 'GITA 365 — mật khẩu đã được đặt lại',
      'Mật khẩu tài khoản ' + nd.username + ' vừa được đặt lại lúc ' +
      Utilities.formatDate(new Date(), 'GMT+7', 'HH:mm dd/MM/yyyy') + '.\n\n' +
      'Nếu không phải anh chị làm, báo ngay cho Học viện GITA theo số 08.5555.4688.\n\nHọc viện GITA');
  } catch (e) {}

  return { ok: true, thongBao: 'Đã đặt lại mật khẩu. Đăng nhập bằng mật khẩu mới.' };
}
