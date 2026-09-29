/* Thông tin nhận chuyển khoản chỉ được nạp theo phiên ở đúng màn cần dùng.
   QR không nằm trong bundle, localStorage hay kho Pages công khai. */
'use strict';
var G = window.G || {}; window.G = G;
G.VIEWS = G.VIEWS || {};

(function () {
  var U = G.U, h = U.h;

  G.TT_NHAN = null;
  G.TT_NHAN_LOADED = false;
  G.TT_NHAN_LOADING = null;
  G.TT_NHAN_ERROR = '';
  G.TT_NHAN_QR_MOI = '';
  G.TT_NHAN_QR_LOI = '';
  G.TT_NHAN_EPOCH = 0;

  G.xoaThongTinNhanThanhToan = function () {
    G.TT_NHAN_EPOCH++;
    G.TT_NHAN = null;
    G.TT_NHAN_LOADED = false;
    G.TT_NHAN_LOADING = null;
    G.TT_NHAN_ERROR = '';
    G.TT_NHAN_QR_MOI = '';
    G.TT_NHAN_QR_LOI = '';
  };

  G.napThongTinNhanThanhToan = function (force) {
    if (G.TT_NHAN_LOADING) return G.TT_NHAN_LOADING;
    if (G.TT_NHAN_LOADED && !force) return Promise.resolve(G.TT_NHAN);
    if (!G.goiMayChu) {
      G.TT_NHAN_ERROR = 'Chưa nối được máy chủ cấp phép.';
      return Promise.reject(new Error(G.TT_NHAN_ERROR));
    }

    var view = G.S && G.S.view;
    var epoch = G.TT_NHAN_EPOCH;
    G.TT_NHAN_ERROR = '';
    var request = G.goiMayChu('xemThongTinThanhToan', {});
    G.TT_NHAN_LOADING = request.then(function (d) {
      if (epoch !== G.TT_NHAN_EPOCH) return null;
      G.TT_NHAN = d;
      G.TT_NHAN_LOADED = true;
      G.TT_NHAN_LOADING = null;
      if (G.S && G.S.view === view && G.render) G.render();
      return d;
    }).catch(function (e) {
      if (epoch !== G.TT_NHAN_EPOCH) return null;
      G.TT_NHAN_ERROR = String(e && e.message || 'Không tải được thông tin thanh toán.');
      G.TT_NHAN_LOADING = null;
      console.warn('[GITA] Không tải được thông tin nhận thanh toán:', e);
      if (G.S && G.S.view === view && G.render) G.render();
      throw e;
    });
    return G.TT_NHAN_LOADING;
  };

  function duLieuMacDinh() {
    var t = G.THANHTOAN || {};
    return {
      nganHang: (t.taiKhoan || {}).nganHang || '',
      chuTk: (t.taiKhoan || {}).chuTk || '',
      soTk: (t.taiKhoan || {}).soTk || '',
      noiDungCk: (t.noiDungCk || {}).mau || ''
    };
  }

  function taiKhoan() {
    return G.TT_NHAN && G.TT_NHAN.configured && G.TT_NHAN.taiKhoan || null;
  }

  G.ttNhanThe = function (choPhepQuanTri) {
    if (!G.TT_NHAN_LOADED && !G.TT_NHAN_LOADING)
      G.napThongTinNhanThanhToan().catch(function () {});

    var role = G.S && G.S.roleObj && G.S.roleObj.id || '';
    var admin = !!choPhepQuanTri && (role === 'R01' || role === 'R02');
    var data = taiKhoan();
    var o = '<div class="card glow mb">';
    if (data) {
      o += '<div class="row wrap" style="gap:18px;align-items:center">' +
        '<div style="width:170px;flex:none;background:#fff;border-radius:16px;padding:10px;text-align:center">' +
        '<img src="' + h(data.qrDataUrl) + '" alt="QR nhận chuyển khoản" ' +
        'style="width:100%;border-radius:10px">' +
        '<div class="tiny muted mt">Quét bằng ứng dụng ngân hàng</div></div>' +
        '<div class="grow" style="min-width:230px"><div class="tiny up muted">TÀI KHOẢN NHẬN</div>' +
        '<b style="font-size:18px;display:block;margin:4px 0 2px">' + h(data.chuTk) + '</b>' +
        '<b class="mono" style="font-size:21px;color:var(--gold-ink);display:block">' +
        h(data.soTk) + '</b><p class="sm dim mt">' + h(data.nganHang) + '</p>' +
        (data.noiDungCk ? '<div class="mt2"><span class="tiny up">NỘI DUNG CHUYỂN KHOẢN</span>' +
          '<p class="mono sm mt">' + h(data.noiDungCk) + '</p></div>' : '') +
        '</div></div>';
    } else if (!G.TT_NHAN_LOADED && !G.TT_NHAN_ERROR) {
      o += '<p class="sm">Đang tải thông tin nhận thanh toán…</p>';
    } else if (G.TT_NHAN_ERROR) {
      o += '<b class="sm" style="color:var(--bad)">Chưa tải được thông tin thanh toán</b>' +
        '<p class="tiny mt">' + h(G.TT_NHAN_ERROR) + '</p>' +
        '<button class="btn sm mt" onclick="G.thuLaiThongTinNhanThanhToan()">Thử lại</button>';
    } else if (G.TT_NHAN && G.TT_NHAN.error) {
      o += '<b class="sm" style="color:var(--bad)">Chưa mở được thông tin thanh toán</b>' +
        '<p class="tiny mt">' + h(G.TT_NHAN.error) + '</p>';
    } else {
      o += '<b class="sm">Thông tin QR chưa được cấu hình</b>' +
        '<p class="tiny muted mt">Super Admin hoặc Admin hệ thống cần lưu QR nhận tiền trong khu tài chính trước khi khách thanh toán.</p>';
    }
    o += '</div>';

    if (admin) {
      var d = data || duLieuMacDinh();
      o += '<div class="card mb"><b class="sm">CÀI ĐẶT TÀI KHOẢN NHẬN · CHỈ R01–R02</b>' +
        '<p class="tiny muted mt">Thông tin và ảnh QR được lưu trong D1, không đưa vào Pages hoặc mã nguồn. Tải lên ảnh QR ngân hàng do bạn cung cấp.</p>' +
        '<div class="grid g2 mt">' +
        '<label class="tiny">Ngân hàng<input id="tt-nh" class="input mt" maxlength="100" value="' + h(d.nganHang) + '"></label>' +
        '<label class="tiny">Chủ tài khoản<input id="tt-chu" class="input mt" maxlength="100" value="' + h(d.chuTk) + '"></label>' +
        '<label class="tiny">Số tài khoản<input id="tt-so" class="input mt" inputmode="numeric" maxlength="34" value="' + h(d.soTk) + '"></label>' +
        '<label class="tiny">Nội dung chuyển khoản<input id="tt-noidung" class="input mt" maxlength="200" value="' + h(d.noiDungCk) + '"></label>' +
        '<label class="tiny">Ảnh QR (JPEG/PNG, tối đa 384 KB)<input id="tt-qr" class="input mt" type="file" accept="image/jpeg,image/png" onchange="G.docAnhQRThanhToan(this)"></label>' +
        '</div>' +
        (G.TT_NHAN_QR_MOI ? '<img src="' + h(G.TT_NHAN_QR_MOI) + '" alt="Xem trước QR mới" style="width:180px;margin-top:12px;border-radius:12px">' : '') +
        (G.TT_NHAN_QR_LOI ? '<p class="tiny mt" style="color:var(--bad)">' + h(G.TT_NHAN_QR_LOI) + '</p>' : '') +
        '<div class="row mt" style="gap:8px"><button class="btn primary" onclick="G.luuTaiKhoanNhan()">Lưu an toàn</button>' +
        (data ? '<span class="tiny muted">Đã cấu hình · ' + h(data.capLuc || '') + '</span>' : '') +
        '</div></div>';
    }
    return o;
  };

  G.thuLaiThongTinNhanThanhToan = function () {
    G.napThongTinNhanThanhToan(true).catch(function () {});
  };

  G.docAnhQRThanhToan = function (input) {
    G.TT_NHAN_QR_LOI = '';
    G.TT_NHAN_QR_MOI = '';
    var file = input && input.files && input.files[0];
    if (!file) return;
    if (['image/jpeg', 'image/png'].indexOf(file.type) < 0 || file.size > 384000) {
      G.TT_NHAN_QR_LOI = 'Chỉ nhận ảnh JPEG/PNG tối đa 384 KB.';
      G.render && G.render();
      return;
    }
    var reader = new FileReader();
    reader.onload = function () {
      G.TT_NHAN_QR_MOI = String(reader.result || '');
      G.render && G.render();
    };
    reader.onerror = function () {
      G.TT_NHAN_QR_LOI = 'Không đọc được ảnh QR. Hãy chọn lại tệp.';
      G.render && G.render();
    };
    reader.readAsDataURL(file);
  };

  G.luuTaiKhoanNhan = function () {
    var lay = function (id) {
      var x = document.getElementById(id);
      return x ? String(x.value || '').trim() : '';
    };
    var d = taiKhoan() || {};
    var qrDataUrl = G.TT_NHAN_QR_MOI || d.qrDataUrl || '';
    var payload = {
      nganHang: lay('tt-nh'), chuTk: lay('tt-chu'), soTk: lay('tt-so'),
      noiDungCk: lay('tt-noidung'), qrDataUrl: qrDataUrl
    };
    if (!qrDataUrl) {
      G.TT_NHAN_QR_LOI = 'Cần tải ảnh QR lên trước khi lưu.';
      G.render && G.render();
      return;
    }
    G.goiMayChu('capNhatThongTinThanhToan', payload).then(function (r) {
      if (!r || !r.ok) {
        G.TT_NHAN_QR_LOI = (r && r.error) || 'Máy chủ từ chối lưu thông tin thanh toán.';
        G.render && G.render();
        return;
      }
      G.TT_NHAN = {ok: true, configured: true, taiKhoan: {
        nganHang: payload.nganHang, chuTk: payload.chuTk, soTk: payload.soTk,
        noiDungCk: payload.noiDungCk, qrDataUrl: qrDataUrl, capLuc: r.capLuc
      }};
      G.TT_NHAN_LOADED = true;
      G.TT_NHAN_QR_MOI = '';
      G.TT_NHAN_QR_LOI = '';
      G.U.toast('Đã lưu thông tin nhận thanh toán an toàn trong D1.', 'ok');
      G.render && G.render();
    }).catch(function (e) {
      G.TT_NHAN_QR_LOI = String(e && e.message || 'Không kết nối được máy chủ để lưu.');
      console.warn('[GITA] Không lưu được thông tin nhận thanh toán:', e);
      G.render && G.render();
    });
  };

  G.VIEWS['thanh-toan'] = function () {
    if (!G.can('pay_view')) return U.lockCard();
    var o = U.ph({eyebrow: 'HỒ SƠ GIA ĐÌNH · THANH TOÁN', ic: 'chart', grad: 1,
      t: 'Thanh toán học phí',
      lead: 'Quét QR bằng ứng dụng ngân hàng, kiểm tra tên người nhận và nội dung trước khi xác nhận.'});
    o += G.ttNhanThe(false);
    o += '<div class="card"><b class="sm">LƯU Ý AN TOÀN</b>' +
      '<p class="tiny mt" style="line-height:1.7">Chỉ chuyển tiền tới thông tin đang hiển thị trong màn này. Không gửi mật khẩu, mã OTP hoặc thông tin đăng nhập. Thanh toán chỉ được ghi nhận sau khi kế toán đối chiếu giao dịch trên sao kê; màn này không tự xác nhận đã thu tiền.</p></div>';
    return o;
  };
})();
