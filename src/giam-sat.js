/* ═══════════════════════════════════════════════════════════════
   GITA 365 — MÀN TRẦN PHẠM VI GIÁM SÁT  (9.99.76)

   ══ MÀN NÀY TRÌNH CÁI TRẦN, KHÔNG TRÌNH BỘ GIÁM SÁT ══

   Bộ giám sát chưa dựng. Dựng trần trước là có chủ ý — một cái cổng
   dựng SAU một cái cửa đã chạy thì nó chỉ là một lời nhắc.

   ══ NGĂN ĐẦU LÀ NGĂN NẶNG NHẤT ══

   Sáu chỗ bản đặc tả va vào luật kho đã chốt. Đặt nó ở ngăn đầu, không
   giấu xuống cuối: một chỗ va nằm ở ngăn ba thì người duyệt đọc hai
   ngăn đầu rồi gật.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;
G.VIEWS = G.VIEWS || {};

(function () {
  var U = G.U, h = U.h, ic = U.ic;

  var NGAN = [
    {ma: 'tran',  ten: 'Sáu điều cấm', ic: 'shield'},
    {ma: 'pham',  ten: 'Ba ngăn phạm vi', ic: 'users'},
    {ma: 'lenh',  ten: 'Lệnh uỷ quyền', ic: 'lock'},
    {ma: 'sau',   ten: '60 phương pháp', ic: 'list'}
  ];

  G.vipNgan = G.vipNgan || 'tran';
  G.vipSo = G.vipSo || null;

  function veLai() {
    if (!G.S || G.S.view !== 'giam-sat') return;
    if (typeof document === 'undefined' || !document.getElementById('main')) return;
    G.render && G.render();
  }
  G.vipMoNgan = function (ma) { G.vipNgan = ma; veLai(); };

  G.vipTaiSo = function () {
    if (!G.goiMayChu) return;
    G.goiMayChu('docLenhGiamSat', {}).then(function (x) {
      G.vipSo = x; veLai();
    }).catch(function (e) {
      G.vipSo = {ok: false, error: e && e.message}; veLai();
    });
  };

  /* ── NGĂN 1 · SÁU ĐIỀU CẤM ── */
  function veTran() {
    var ds = G.VIP_CAM || [], lu = G.VIP_CAM_LUAT || {};
    var o = U.sec('Sáu điều không lệnh nào mở được',
      h(lu.tranKhacQuyen || ''));
    o += U.tbl(['Mã', 'Cấm gì', 'Luật nào cấm', 'Bản đặc tả đòi gì', 'Vì sao'],
      ds.map(function (c) {
        return [h(c.ma), h(c.cam), '<code>' + h(c.luat) + '</code>',
          h(c.banDacTaDoi), h(c.vi)];
      }));
    if (lu.vaoSauLaMuon) o += '<p class="note">' + h(lu.vaoSauLaMuon) + '</p>';
    if (lu.noiRaChoVa) o += '<p class="note">' + h(lu.noiRaChoVa) + '</p>';

    var sc = G.VIP_SUA_CHU || [];
    if (sc.length) {
      o += U.sec('Ba câu của bản đặc tả phải sửa',
        'Không phải chuyện chữ nghĩa. Một con số không đo được đặt cạnh những con số ' +
        'đo được thì nó kéo cả bảng xuống mức của nó — và người đọc không biết bảng ' +
        'ấy vừa tụt.');
      o += U.tbl(['Câu cũ', 'Đổi thành', 'Vì sao'],
        sc.map(function (x) { return [h(x.cu), h(x.moi), h(x.vi)]; }));
    }
    return o;
  }

  /* ── NGĂN 2 · BA NGĂN PHẠM VI ── */
  function vePham() {
    var ds = G.VIP_NGAN || [];
    var o = U.sec('Ba ngăn khác nhau ở CĂN CỨ PHÁP LÝ, không ở mức độ',
      'Bản đặc tả xếp chín cấp vào MỘT bảng, từ Super Admin xuống học sinh, cùng một ' +
      'cột "bị giám sát full". Xếp như thế thì một nhân sự hưởng lương và một đứa trẻ ' +
      'tám tuổi nằm cùng một hàng, cùng một kiểu chữ — và đó đúng là chỗ người đọc ' +
      'tin cả hai như nhau.');
    ds.forEach(function (n) {
      o += U.sec(n.ten + ' · ' + n.vai, h(n.canCu));
      o += U.tbl(['Giám sát được', 'KHÔNG giám sát'],
        (function () {
          var m = Math.max(n.giamSatDuoc.length, n.khongGiamSat.length), r = [];
          for (var i = 0; i < m; i++) {
            r.push([h(n.giamSatDuoc[i] || '—'), h(n.khongGiamSat[i] || '—')]);
          }
          return r;
        })());
      o += '<p class="note"><b>Báo trước:</b> ' + h(n.baoTruoc) + '</p>';
    });
    return o;
  }

  /* ── NGĂN 3 · LỆNH UỶ QUYỀN ── */
  function veLenh() {
    var L = G.VIP_LENH || {}, sa = G.VIP_SA_KHONG || [];
    var o = U.sec('Lệnh uỷ quyền giám sát', h(L.chiR01 || '') + ' ' + h(L.phaiCoHan || ''));
    o += '<p class="note">' + h(L.viSaoPhaiCoHan || '') + '</p>';
    o += '<p class="note">' + h(L.phaiVietLyDo || '') + '</p>';
    o += '<p class="note">' + h(L.tinhLucDoc || '') + '</p>';

    o += U.sec('Sáu việc Super Admin KHÔNG làm được',
      'Trang 28 của bản đặc tả, nâng từ một bảng thành một cái cổng. Một hệ giám sát ' +
      'mà quyền cao nhất không có trần thì cái trần ấy không tồn tại — và nó không ' +
      'tồn tại đúng vào ngày có người cần nó nhất.');
    o += U.tbl(['Không làm được', 'Vì sao'],
      sa.map(function (x) { return [h(x.viec), h(x.vi)]; }));

    var s = G.vipSo;
    if (!s) {
      o += '<p class="note"><button class="nm-bao-nut" onclick="G.vipTaiSo()">' +
        'Đọc sổ lệnh đang chạy</button></p>';
    } else if (!s.ok) {
      o += '<p class="note">Chưa đọc được sổ lệnh: ' + h(String(s.error || '')) + '</p>';
    } else {
      o += U.sec('Sổ lệnh', h(s.vi || ''));
      o += U.tbl(['Nhóm', 'Số lệnh'], [
        ['Đang chạy', String((s.dangChay || []).length)],
        ['Đã tự hết hạn', String((s.hetHan || []).length)],
        ['Đã thu tay', String((s.daThu || []).length)]
      ]);
      o += '<p class="note">' + h(s.khongGopSo || '') + '</p>';
    }
    return o;
  }

  /* ── NGĂN 4 · SÁU MƯƠI PHƯƠNG PHÁP ── */
  function veSau() {
    var s = G.VIP_60 || {};
    var o = U.sec('Sáu mươi phương pháp, ba ngăn — mỗi cái ở ĐÚNG MỘT ngăn',
      'Bản đặc tả liệt sáu mươi phương pháp bằng giọng ngang nhau. Trình cả sáu mươi ' +
      'như đã dựng thì người duyệt thấy sáu mươi dòng rồi thôi không đọc — và những ' +
      'phương pháp bị luật chặn lại đúng là những cái không ai đọc nữa.');
    var r = [];
    ['dungDuoc', 'chanViLuat', 'choChuHe'].forEach(function (k) {
      var n = s[k]; if (!n) return;
      r.push([h(n.ten), String(n.so), h((n.vd || []).join(' · ')), h(n.vi)]);
    });
    o += U.tbl(['Ngăn', 'Số', 'Ví dụ', 'Vì sao'], r);
    return o;
  }

  G.VIEWS['giam-sat'] = function () {
    if (!(G.VIP_CAM && G.VIP_CAM.length)) {
      return U.empty('Bản trần giám sát chưa mở với vai này',
        'Trần phạm vi giám sát nói rõ Học viện được nhìn vào cái gì của ai, và tuyệt ' +
        'đối không nhìn vào cái gì. Bản đầy đủ đi trong gói nghề và chỉ nạp sau khi ' +
        'đăng nhập bằng vai có gói ấy. Phần thuộc về gia đình nằm ở màn Pháp lý & ' +
        'rủi ro: ô đồng ý tách bạch, quyền rút lại, và nút xoá dữ liệu.');
    }

    var o = '<div class="hd"><h2>' + ic('shield') + ' Trần phạm vi giám sát</h2>' +
      '<p class="sub">Theo bản đặc tả <b>GITA-VIP v2.0</b>. Bản này dựng <b>cái trần</b>, ' +
      'chưa dựng bộ giám sát — cùng thứ tự đã chọn với Hiến pháp ở 9.99.62, vì một cái ' +
      'cổng dựng sau một cái cửa đã chạy thì nó chỉ là một lời nhắc. Ngăn đầu là sáu ' +
      'chỗ bản đặc tả <b>va vào luật kho đã chốt</b>, và nó nằm ở ngăn đầu chứ không ' +
      'giấu xuống cuối.</p></div>';

    o += '<div class="tabs">' + NGAN.map(function (n) {
      return '<button class="tab' + (G.vipNgan === n.ma ? ' on' : '') +
        '" onclick="G.vipMoNgan(\'' + n.ma + '\')">' + ic(n.ic) + ' ' + h(n.ten) +
        '</button>';
    }).join('') + '</div>';

    o += G.vipNgan === 'pham' ? vePham()
       : G.vipNgan === 'lenh' ? veLenh()
       : G.vipNgan === 'sau' ? veSau()
       : veTran();
    return o;
  };
})();
