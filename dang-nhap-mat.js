/* ═══════════════════════════════════════════════════════════════
   GITA 365 — ĐĂNG NHẬP BẰNG KHUÔN MẶT (phía máy khách)  (9.99.182)

   Chạy nghi thức WebAuthn trong trình duyệt: máy quét MẶT THẬT trên
   thiết bị (Face ID · Windows Hello · vân tay Android), và chỉ một CHỮ
   KÝ đi lên máy chủ — khuôn mặt KHÔNG rời máy (Điều 13). Máy chủ
   (may-chu/sinh-trac.js) giữ đúng một khoá công khai, không mẫu mặt nào.

   Đây là tính năng CHẠY TRÊN MÁY CHỦ (Workers) — giống CRM, bảng giá:
   chưa nối máy chủ thì nút nói "cần nối máy chủ", không dựng giả. Nút
   chỉ hiện khi trình duyệt CÓ bộ xác thực nền tảng (isUVPAA), vì trên
   máy không có Face ID/Hello thì mời cũng vô ích.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;
G.VIEWS = G.VIEWS || {};

(function () {
  var U = G.U, h = U.h, ic = U.ic;

  /* ── base64url ↔ bytes (ArrayBuffer) ── */
  function b2u(buf) {
    var b = new Uint8Array(buf), s = '';
    for (var i = 0; i < b.length; i++) s += String.fromCharCode(b[i]);
    return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  function u2b(str) {
    var s = String(str || '').replace(/-/g, '+').replace(/_/g, '/');
    s += '==='.slice((s.length + 3) % 4);
    var bin = atob(s), out = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out.buffer;
  }

  /* Trình duyệt có WebAuthn không, và có bộ xác thực NỀN TẢNG (Face ID/
     Hello) không — chỉ mời khi có, để không dựng một nút bấm vào là hỏng. */
  G.stCoWebAuthn = function () {
    return typeof window !== 'undefined' && !!window.PublicKeyCredential &&
      !!(navigator.credentials && navigator.credentials.create);
  };
  G.stCoNenTang = function () {
    if (!G.stCoWebAuthn() || !window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable)
      return Promise.resolve(false);
    return window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
      .then(function (x) { return !!x; }).catch(function () { return false; });
  };

  function loiNguoiDoc(e) {
    var n = (e && e.name) || '';
    if (n === 'NotAllowedError') return 'Đã huỷ hoặc hết giờ — chưa quét được khuôn mặt.';
    if (n === 'InvalidStateError') return 'Thiết bị này đã đăng ký khuôn mặt cho tài khoản rồi.';
    if (n === 'SecurityError') return 'Trang phải chạy trên HTTPS thì khuôn mặt mới bật được.';
    if (n === 'NotSupportedError') return 'Thiết bị này chưa hỗ trợ đăng nhập khuôn mặt.';
    return (e && e.message) || 'Không quét được khuôn mặt.';
  }

  /* ══ ĐĂNG KÝ khoá mặt (đang đăng nhập) ══ */
  G.stDangKyKhoaMat = function (ten) {
    if (!G.stCoWebAuthn()) { U.toast('Thiết bị này chưa hỗ trợ khuôn mặt.', 'err'); return; }
    if (!G.goiMayChu) { U.toast('Cần nối máy chủ trước.', 'err'); return; }
    U.toast('Đang chuẩn bị — làm theo lời nhắc quét khuôn mặt…', 'ok');
    G.goiMayChu('dangKyKhoaMatBatDau', { origin: location.origin, ten: ten || '' })
      .then(function (o) {
        if (!o || !o.ok) throw new Error((o && o.error) || 'Máy chủ từ chối.');
        var pk = o.publicKey;
        pk.challenge = u2b(pk.challenge);
        pk.user.id = u2b(pk.user.id);
        (pk.excludeCredentials || []).forEach(function (c) { c.id = u2b(c.id); });
        return navigator.credentials.create({ publicKey: pk }).then(function (cred) {
          var r = cred.response;
          return G.goiMayChu('dangKyKhoaMatXong', {
            choId: o.choId, ten: ten || '', id: b2u(cred.rawId),
            response: { clientDataJSON: b2u(r.clientDataJSON), attestationObject: b2u(r.attestationObject) }
          });
        });
      })
      .then(function (x) {
        if (x && x.ok) { U.toast('Đã bật đăng nhập bằng khuôn mặt.', 'ok'); G.stDs = null; G.stTaiDs(); }
        else U.toast((x && x.error) || 'Không bật được.', 'err');
      })
      .catch(function (e) { U.toast(loiNguoiDoc(e), 'err'); });
  };

  /* ══ ĐĂNG NHẬP bằng khoá mặt (chưa đăng nhập) ══ */
  G.stDangNhapMat = function (u) {
    u = String(u || '').trim();
    if (!u) { U.toast('Nhập email trước, rồi bấm khuôn mặt.', 'err'); return; }
    if (!G.stCoWebAuthn()) { U.toast('Thiết bị này chưa hỗ trợ khuôn mặt.', 'err'); return; }
    if (!G.goiMayChu) { U.toast('Cần nối máy chủ trước.', 'err'); return; }
    U.toast('Nhìn vào máy để quét khuôn mặt…', 'ok');
    G.goiMayChu('dangNhapMatBatDau', { uMat: u, origin: location.origin })
      .then(function (o) {
        if (!o || !o.ok) throw new Error((o && o.error) || 'Máy chủ từ chối.');
        var pk = o.publicKey;
        pk.challenge = u2b(pk.challenge);
        (pk.allowCredentials || []).forEach(function (c) { c.id = u2b(c.id); });
        if (!(pk.allowCredentials || []).length)
          throw new Error('Tài khoản này chưa bật khuôn mặt trên thiết bị nào. Đăng nhập bằng mật khẩu, rồi bật ở "Khoá khuôn mặt".');
        return navigator.credentials.get({ publicKey: pk }).then(function (cred) {
          var r = cred.response;
          return G.goiMayChu('dangNhapMatXong', {
            choId: o.choId, id: b2u(cred.rawId),
            response: {
              clientDataJSON: b2u(r.clientDataJSON), authenticatorData: b2u(r.authenticatorData),
              signature: b2u(r.signature),
              userHandle: r.userHandle ? b2u(r.userHandle) : null
            }
          });
        });
      })
      .then(function (x) {
        if (x && x.ok && x.token) {
          U.toast('Xin chào — đăng nhập bằng khuôn mặt thành công.', 'ok');
          G.vaoBangPhienMayChu(x);
        } else U.toast((x && x.error) || 'Không đăng nhập được bằng khuôn mặt.', 'err');
      })
      .catch(function (e) { U.toast(loiNguoiDoc(e), 'err'); });
  };

  /* ══ XÁC THỰC LẠI BẰNG MẶT (step-up) — trả Promise<true/false> ══
     Dùng cho việc quan trọng: đổi mật khẩu, gỡ khoá mặt. Quét mặt tươi
     ngay tại chỗ; kẻ chiếm phiên không có khuôn mặt thật thì không qua. */
  G.stXacThucLai = function () {
    if (!G.stCoWebAuthn() || !G.goiMayChu) return Promise.resolve(false);
    return G.goiMayChu('xacThucLaiMatBatDau', { origin: location.origin }).then(function (o) {
      if (!o || !o.ok) { U.toast((o && o.error) || 'Chưa bật khoá mặt.', 'err'); return false; }
      var pk = o.publicKey;
      pk.challenge = u2b(pk.challenge);
      (pk.allowCredentials || []).forEach(function (c) { c.id = u2b(c.id); });
      U.toast('Quét khuôn mặt để xác nhận…', 'ok');
      return navigator.credentials.get({ publicKey: pk }).then(function (cred) {
        var r = cred.response;
        return G.goiMayChu('xacThucLaiMat', {
          choId: o.choId, id: b2u(cred.rawId),
          response: {
            clientDataJSON: b2u(r.clientDataJSON), authenticatorData: b2u(r.authenticatorData),
            signature: b2u(r.signature), userHandle: r.userHandle ? b2u(r.userHandle) : null
          }
        }).then(function (x) {
          if (x && x.ok) return true;
          U.toast((x && x.error) || 'Xác thực khuôn mặt thất bại.', 'err'); return false;
        });
      });
    }).catch(function (e) { U.toast(loiNguoiDoc(e), 'err'); return false; });
  };
  /* Chạy một việc CẦN xác thực mặt: nếu máy chủ trả CANMAT thì quét mặt
     rồi thử lại đúng một lần. `chay` là hàm trả Promise của kết quả. */
  G.stCanMat = function (chay) {
    return chay().then(function (x) {
      if (x && x.code === 'CANMAT')
        return G.stXacThucLai().then(function (ok) { return ok ? chay() : x; });
      return x;
    });
  };

  /* ══ MÀN QUẢN LÝ KHOÁ MẶT ══ */
  G.stDs = G.stDs || null;
  G.stNK = G.stNK || null;
  G.stTaiDs = function () { G.goiMayChu && G.goiMayChu('dsKhoaMat', {}).then(function (x) { G.stDs = x; if (G.render) G.render(); }); };
  G.stXoa = function (id) {
    if (!G.goiMayChu) return;
    /* Gỡ khoá mặt là gỡ lớp bảo vệ → máy chủ đòi xác thực mặt tươi
       (CANMAT). stCanMat tự quét mặt rồi thử lại. */
    G.stCanMat(function () { return G.goiMayChu('xoaKhoaMat', { id: id }); }).then(function (x) {
      if (x && x.ok) { U.toast('Đã gỡ khoá mặt.', 'ok'); G.stDs = null; G.stTaiDs(); }
      else if (x && x.code !== 'CANMAT') U.toast((x && x.error) || 'Không gỡ được.', 'err');
    });
  };
  G.stTaiNK = function () { G.goiMayChu && G.goiMayChu('nhatKyAnToan', {}).then(function (x) { G.stNK = x; if (G.render) G.render(); }); };
  G.stThemHoi = function () {
    var ten = window.prompt('Đặt tên cho thiết bị này (vd: iPhone của mẹ):', 'Thiết bị của tôi');
    if (ten === null) return;
    G.stDangKyKhoaMat(ten || 'Thiết bị');
  };

  /* Nhật ký an toàn — chống lừa đảo bằng cách để người dùng TỰ SOI. */
  function veNhatKy() {
    var o = U.sec('Nhật ký an toàn của tài khoản',
      'Thấy một lượt đăng nhập bạn KHÔNG làm → đổi mật khẩu ngay và gỡ khoá mặt lạ.');
    var nk = G.stNK;
    if (!nk) return o + '<p class="note"><button class="btn" onclick="G.stTaiNK()">Tải nhật ký</button></p>';
    if (!nk.ok) return o + '<p class="note">' + h((nk && nk.error) || 'Cần nối máy chủ.') + '</p>';
    var TEN = { DANG_NHAP: 'Đăng nhập', DOI_MAT_KHAU: 'Đổi mật khẩu', BUOCMAT: 'Xác thực khuôn mặt',
      KHOAMAT_DANGKY: 'Bật khoá mặt', KHOAMAT_XOA: 'Gỡ khoá mặt', DAT_LAI_MK: 'Đặt lại mật khẩu (quên)' };
    var dong = nk.dong || [];
    if (!dong.length) return o + '<p class="note">Chưa có hoạt động nào trong sổ.</p>';
    return o + U.tbl(['Lúc', 'Việc', 'Chi tiết'],
      dong.map(function (r) {
        return [h((r.luc || '').slice(0, 19).replace('T', ' ')),
          h(TEN[r.viec] || r.viec), h(r.chiTiet || '')];
      }));
  }

  G.VIEWS['khoa-mat'] = function () {
    var o = '<div class="hd"><h2>' + ic('lock') + ' An toàn tài khoản · khuôn mặt</h2>' +
      '<p class="sub">Bật đăng nhập bằng khuôn mặt thật (Face ID · Windows Hello · vân tay). ' +
      'Khuôn mặt được quét và Ở LẠI trên thiết bị — máy chủ chỉ giữ một khoá xác minh, ' +
      'KHÔNG giữ ảnh hay mẫu mặt của ai. Mất thiết bị thì gỡ khoá của nó ở đây.</p></div>';

    /* Chống hack · lừa đảo — nói cho người dùng biết vì sao khoá mặt an toàn. */
    o += '<div class="card mb" style="border-color:var(--gita-vien-1);background:var(--gita-mo-1)">' +
      '<div class="row mb" style="gap:8px"><span style="color:var(--gold-ink)">' + ic('shield', 'w-4 h-4') +
      '</span><b class="sm">Vì sao khuôn mặt chống được hack và lừa đảo</b></div>' +
      '<ul class="tiny" style="line-height:1.8;margin:0;padding-left:18px">' +
      '<li><b>Không có mã để bị lừa lấy.</b> Không như mã OTP qua tin nhắn, khuôn mặt không có gì để kẻ gian lừa bạn đọc cho.</li>' +
      '<li><b>Khoá theo đúng trang GITA.</b> Một trang giả mạo KHÔNG dùng được khuôn mặt của bạn — trình duyệt chỉ cho nó chạy ở đúng địa chỉ thật.</li>' +
      '<li><b>Ảnh không mở được.</b> Face ID quét mặt thật có chiều sâu; giơ một tấm ảnh không qua được.</li>' +
      '<li><b>Chặn chiếm tài khoản.</b> Bật khoá mặt thì kẻ trộm mật khẩu vẫn KHÔNG đổi được mật khẩu hay gỡ khoá — phải có khuôn mặt thật của bạn.</li>' +
      '</ul></div>';

    if (!G.stCoWebAuthn())
      return o + U.empty('Thiết bị này chưa hỗ trợ',
        'Trình duyệt hoặc thiết bị chưa có bộ xác thực khuôn mặt/vân tay. Dùng máy có Face ID, ' +
        'Windows Hello, hoặc vân tay Android, và mở trang bằng HTTPS.') + veNhatKy();

    o += '<div class="row mb"><button class="btn pri" onclick="G.stThemHoi()">' +
      ic('lock', 'w-4 h-4') + ' Bật khuôn mặt trên thiết bị này</button></div>';

    var so = G.stDs;
    if (!so) o += '<p class="note"><button class="btn" onclick="G.stTaiDs()">Tải danh sách thiết bị</button></p>';
    else if (!so.ok)
      o += U.empty('Cần nối máy chủ',
        'Đăng nhập khuôn mặt chạy trên máy chủ GITA (Workers). Nối máy chủ rồi mới bật được — ' +
        h((so && so.error) || ''));
    else {
      o += U.sec('Thiết bị đã bật khuôn mặt', h(so.vi || ''));
      var ds = so.khoa || [];
      if (!ds.length) o += '<p class="note">Chưa có thiết bị nào. Bấm nút trên để bật.</p>';
      else o += U.tbl(['Thiết bị', 'Bật lúc', 'Dùng gần nhất', ''],
        ds.map(function (k) {
          return [h(k.ten || '—'), h((k.taoLuc || '').slice(0, 10)),
            h((k.dungLuc || '').slice(0, 10) || '—'),
            '<button class="btn" onclick="G.stXoa(\'' + String(k.id).replace(/'/g, "\\'") + '\')">Gỡ</button>'];
        }));
    }
    return o + veNhatKy();
  };
})();
