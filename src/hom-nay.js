/* ═══════════════════════════════════════════════════════════════
   GITA 365 — MÀN HÔM NAY · NHÀ MÌNH  (9.99.75)

   Chủ hệ chốt LGD-01: bốn tab của MỤC C là mấy màn THÊM vào cổng phụ
   huynh đã có, không phải một bề mặt riêng.

   ══ MÀN NÀY CHỈ DỰNG THỨ CHƯA CÓ ══

   Bốn tab bản đặc tả: Hôm nay · Bản đồ · Chỉ số · Điểm chạm. Cổng `ph`
   ĐÃ CÓ `ban-do` và `tien-bo`. Dựng lại chúng là dựng bản thứ hai của
   hai màn đang chạy, và hai bản thì sẽ có ngày lệch nhau — lúc ấy một
   gia đình đọc hai con số khác nhau về chính nhà mình.

   ══ MỘT MÀN — MỘT VIỆC ══

   Người mở app lúc chín giờ tối, trong bếp, TAY BẬN, đôi khi mở ra
   giữa lúc mệt. Hai việc ngang nhau trên một màn hình như thế là KHÔNG
   việc nào được làm: họ đọc cả hai, không chọn được, rồi cất máy.

   Nên máy chủ trả về ĐÚNG MỘT việc (`viecLon`), không trả một danh
   sách rồi để màn này tự lấy cái đầu. Màn tự chọn thì luật nằm ở màn
   hình — và luật ở màn hình chết cùng lượt viết lại đầu tiên.

   ══ L12 · ĐƯỜNG THOÁT CÙNG KÍCH CỠ ══

   Việc mang dấu `nangNe` thì nút "Để hôm khác" nằm NGAY CẠNH nút tiếp
   tục và mang CÙNG MỘT LỚP CSS. Cùng kích cỡ mới là luật, không phải
   "có nút thoát": một nút thoát nhỏ hơn là một lời mời đi tiếp đội lốt
   một lựa chọn.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;
G.VIEWS = G.VIEWS || {};

(function () {
  var U = G.U, h = U.h, ic = U.ic;

  G.nmDoc = G.nmDoc || null;
  G.nmDangTai = false;

  function veLai() {
    if (!G.S || G.S.view !== 'hom-nay') return;
    if (typeof document === 'undefined' || !document.getElementById('main')) return;
    G.render && G.render();
  }

  function maNha() {
    return String(((G.S || {}).hoSo || {}).maKhachHang || '');
  }

  G.nmTai = function () {
    if (!G.goiMayChu || !maNha()) return;
    G.nmDangTai = true;
    G.goiMayChu('docHomNay', {maNha: maNha()}).then(function (x) {
      G.nmDoc = x; G.nmDangTai = false; veLai();
    }).catch(function (e) {
      G.nmDoc = {ok: false, error: e && e.message}; G.nmDangTai = false; veLai();
    });
  };

  /* ── L03 · CHẾ ĐỘ BÃO ──
     Một chạm. KHÔNG confirm(), KHÔNG prompt() hỏi lý do. Hộp thoại xác
     nhận ở đây là đúng cái bản đặc tả cấm — và nó cấm vì người bật đang
     ở giữa một chuyện khó. */
  G.nmBao = function (bat) {
    if (!G.goiMayChu) return;
    G.goiMayChu('batCheDoBao', {maNha: maNha(), bat: !!bat})
      .then(function () { G.nmTai(); })
      .catch(function () { G.nmTai(); });
  };

  G.nmTick = function (maNhip) {
    if (!G.goiMayChu) return;
    G.goiMayChu('tickNhip', {maNha: maNha(), maNhip: maNhip})
      .then(function () { G.nmTai(); })
      .catch(function () { G.nmTai(); });
  };

  /* ── L11 · BỎ MỘT VIỆC ──
     Ô lý do là một ô TRỐNG SẴN, gửi đi được khi còn trống. Không
     `prompt()` bắt gõ, không chặn nút khi ô rỗng. */
  G.nmBo = function (maNhip) {
    if (!G.goiMayChu) return;
    var o = document.getElementById('nm-lydo');
    G.goiMayChu('boViecHomNay', {maNha: maNha(), maNhip: maNhip,
      lyDo: o ? o.value : ''})
      .then(function () { G.nmTai(); })
      .catch(function () { G.nmTai(); });
  };

  function veViec(d) {
    var v = d.viecLon;
    var o = '<div class="giay nm-viec">';
    o += '<p class="nm-nhan">Tối nay</p>';
    o += '<h3 class="nm-lon">' + h(v.ten) + '</h3>';

    /* ── HAI NÚT, CÙNG LỚP, CÙNG KÍCH CỠ ──
       `.nm-nut` là một lớp duy nhất dùng cho cả hai. Đặt hai lớp khác
       nhau rồi cố cho chúng bằng nhau là để dành sẵn một chỗ lệch:
       người sửa CSS sau đổi một lớp mà không đổi lớp kia, và nút thoát
       nhỏ đi mà không ai thấy. */
    o += '<div class="row nm-hang">';
    o += '<button class="nm-nut nm-xong" onclick="G.nmTick(\'' +
      h(v.id) + '\')">Xong rồi</button>';
    if (v.nangNe) {
      o += '<button class="nm-nut nm-thoat" onclick="G.nmBo(\'' +
        h(v.id) + '\')">Để hôm khác</button>';
    } else {
      o += '<button class="nm-nut nm-thoat" onclick="G.nmBo(\'' +
        h(v.id) + '\')">Bỏ hôm nay</button>';
    }
    o += '</div>';

    o += '<textarea id="nm-lydo" class="nm-lydo" rows="2" ' +
      'placeholder="Muốn nói gì thì viết — không bắt buộc"></textarea>';
    o += '<p class="note nm-note">Bỏ việc thì không ai hỏi vì sao. Ô trên để trống ' +
      'vẫn đóng được việc.</p>';
    o += '</div>';

    if (d.conLai > 0) {
      o += '<p class="note">Còn ' + d.conLai + ' nhịp nữa hôm nay. Làm xong việc ' +
        'này thì nó hiện ra — một lúc một việc.</p>';
    }
    return o;
  }

  function veTrong(khi) {
    var t = (G.NM_TRONG || []).filter(function (x) { return x.khi === khi; })[0];
    if (!t) return '';
    var o = '<div class="giay nm-viec"><p class="nm-lon-nho">' + h(t.chu) + '</p>';
    if (khi === 'dangBao') {
      o += '<div class="row nm-hang"><button class="nm-nut nm-xong" ' +
        'onclick="G.nmBao(false)">' + h(t.nut) + '</button></div>';
    } else if (t.nut) {
      o += '<p class="note">' + h(t.nut) + '</p>';
    }
    o += '</div>';
    return o;
  }

  G.VIEWS['hom-nay'] = function () {
    var o = '<div class="hd"><h2>' + ic('home') + ' Hôm nay</h2>' +
      '<p class="sub">Một việc. Làm xong thì tick, rồi cất máy đi. Màn này cố ý ' +
      'chỉ có đúng một việc lớn — hai việc ngang nhau lúc chín giờ tối, trong bếp, ' +
      'tay bận, là không việc nào được làm.</p></div>';

    if (!maNha()) {
      return o + U.empty('Màn này của gia đình',
        'Hôm nay đọc nhịp của một nhà cụ thể, nên nó cần một tài khoản gắn với mã ' +
        'khách hàng. Người của Học viện xem nhịp của nhà mình phụ trách qua màn ' +
        'Vận hành & chăm sóc — ở đó có cả sổ chạm và bảng đèn ba màu, còn màn này ' +
        'cố ý chỉ trả lời đúng một câu: tối nay nhà mình làm gì.');
    }

    if (!G.nmDoc && !G.nmDangTai) { G.nmTai(); }

    var d = G.nmDoc;
    if (!d) return o + '<p class="note">Đang đọc nhịp của nhà mình…</p>';
    if (!d.ok) return o + U.empty('Chưa đọc được nhịp',
      String(d.error || 'Thử lại sau ít phút.'));

    if (d.dangBao) {
      o += veTrong('dangBao');
    } else if (d.chuaCoNhip) {
      o += veTrong('chuaCoNhip');
    } else if (d.xongHet) {
      o += veTrong('xongHet');
    } else if (d.viecLon) {
      o += veViec(d);
    }

    /* ── NÚT CHẾ ĐỘ BÃO ──
       Một chạm, không hỏi lý do, không hộp thoại xác nhận. Nút nhỏ hơn
       hẳn việc lớn về thị giác — nó không phải việc của tối nay, nó là
       một lối ra luôn có mặt. */
    if (!d.dangBao) {
      o += '<div class="nm-bao"><button class="nm-bao-nut" onclick="G.nmBao(true)">' +
        ic('shield') + ' Bật Chế độ Bão</button>' +
        '<p class="note">Một chạm. Không hỏi vì sao, không khảo sát. Nhịp dừng lại, ' +
        'mọi nhắc tắt, và <b>chuỗi giữ nguyên</b> — bão mà vẫn đứt chuỗi thì nó chỉ ' +
        'là một cái nút đổi màu, và người ta sẽ cố tick cho xong thay vì bấm nó.</p></div>';
    }

    return o;
  };
})();
