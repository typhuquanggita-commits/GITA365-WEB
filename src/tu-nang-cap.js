/* ═══════════════════════════════════════════════════════════════
   GITA 365 — MÀN VÒNG TỰ NÂNG CẤP  (9.99.77)

   ══ NGĂN ĐẦU LÀ BẢY VÙNG KHÔNG ĐI QUA ĐƯỜNG NÀY ══

   Không giấu xuống cuối. Một người mở màn này là một người đang định
   đề xuất một thứ; thứ họ cần đọc TRƯỚC là danh sách những thứ không
   đề xuất được ở đây — đọc sau thì họ đã viết xong đề xuất rồi, và
   lúc ấy họ đọc để tìm cách lách chứ không phải để biết.

   ══ MÀN NÀY KHÔNG CÓ NÚT NÀO NỚI MỘT VÙNG RA ══

   Cùng lý do màn Bộ prompt không có nút lưu (9.99.72): dựng cái nút
   rồi mới cấm bấm là muộn.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;
G.VIEWS = G.VIEWS || {};

(function () {
  var U = G.U, h = U.h, ic = U.ic;

  var NGAN = [
    {ma: 'vung', ten: 'Bảy vùng không chạm', ic: 'shield'},
    {ma: 'cap',  ten: 'Tám cấp việc', ic: 'list'},
    {ma: 'cua',  ten: 'Năm cửa', ic: 'lock'},
    {ma: 'nhay', ten: 'Mười việc nhạy cảm', ic: 'users'}
  ];

  G.tncNgan = G.tncNgan || 'vung';
  G.tncSo = G.tncSo || null;

  function veLai() {
    if (!G.S || G.S.view !== 'tu-nang-cap') return;
    if (typeof document === 'undefined' || !document.getElementById('main')) return;
    G.render && G.render();
  }
  G.tncMoNgan = function (ma) { G.tncNgan = ma; veLai(); };

  G.tncTaiSo = function () {
    if (!G.goiMayChu) return;
    G.goiMayChu('docVongNangCap', {}).then(function (x) {
      G.tncSo = x; veLai();
    }).catch(function (e) {
      G.tncSo = {ok: false, error: e && e.message}; veLai();
    });
  };

  /* ── NGĂN 1 · BẢY VÙNG ── */
  function veVung() {
    var ds = G.TNC_KHONG_CHAM || [], lu = G.TNC_KHONG_CHAM_LUAT || {};
    var o = U.sec('Bảy vùng KHÔNG đi qua đường tự nâng cấp',
      lu.khongPhaiThang || '');
    o += U.tbl(['Mã', 'Vùng', 'Kho nào', 'Vì sao'],
      ds.map(function (v) {
        return [h(v.ma), h(v.vung), '<code>' + h(v.kho) + '</code>', h(v.vi)];
      }));
    if (lu.duongDoiThat) o += '<p class="note"><b>Đường đi thật:</b> ' +
      h(lu.duongDoiThat) + '</p>';
    if (lu.viSaoK5) o += '<p class="note"><b>Vì sao K5:</b> ' + h(lu.viSaoK5) + '</p>';
    return o;
  }

  /* ── NGĂN 2 · TÁM CẤP ── */
  function veCap() {
    var ds = G.TNC_CAP8 || [], x = G.TNC_XEP_CAP || {};
    var o = U.sec('Tám cấp việc — MÁY xếp, người đề xuất không tự chọn',
      x.khongTuChon || '');
    o += '<p class="note">' + h(x.viSao || '') + '</p>';
    o += U.tbl(['Cấp', 'Tên', 'Ví dụ', 'Ai quyết'],
      ds.map(function (c) {
        return [String(c.cap), h(c.ten), h(c.vd), h(c.ai)];
      }));
    if (x.mayXepSai) o += '<p class="note"><b>Máy xếp sai:</b> ' + h(x.mayXepSai) + '</p>';
    if (x.chamVungCam) o += '<p class="note"><b>Chạm vùng cấm:</b> ' +
      h(x.chamVungCam) + '</p>';
    return o;
  }

  /* ── NGĂN 3 · NĂM CỬA ── */
  function veCua() {
    var ds = G.TNC_CUA5 || [], lu = G.TNC_CUA_LUAT || {};
    var o = U.sec('Năm cửa, đi đúng thứ tự', lu.khongNhayCua || '');
    o += U.tbl(['Cửa', 'Tên', 'Ai', 'Phải có', 'Răng'],
      ds.map(function (c) {
        return [h(c.ma), h(c.ten), h(c.ai), h((c.phaiCo || []).join(' · ')), h(c.rang)];
      }));
    ['sanhLaDongHo', 'nguoiKyKhacNguoiDeXuat', 'luiLaiPhaiTHU'].forEach(function (k) {
      if (lu[k]) o += '<p class="note">' + h(lu[k]) + '</p>';
    });

    var s = G.tncSo;
    if (!s) {
      o += '<p class="note"><button class="nm-bao-nut" onclick="G.tncTaiSo()">' +
        'Đọc sổ vòng nâng cấp</button></p>';
    } else if (!s.ok) {
      o += '<p class="note">Chưa đọc được sổ: ' + h(String(s.error || '')) + '</p>';
    } else {
      o += U.sec('Sổ vòng nâng cấp', s.khongGopSo || '');
      if (!(s.dangChay || []).length && !(s.daBat || []).length) {
        o += '<p class="note">Sổ chưa có lượt nào.</p>';
      } else {
        o += U.tbl(['Mã', 'Việc', 'Cấp', 'Máy còn thiếu', 'Người còn thiếu'],
          (s.dangChay || []).map(function (d) {
            return [h(d.id), h(d.viec), String(d.cap),
              h((d.thieuMay || []).join(' · ') || '—'),
              h((d.thieuNguoi || []).join(' · ') || '—')];
          }));
        if ((s.daBat || []).length) {
          o += U.tbl(['Mã', 'Việc', 'Cấp', 'Ai bấm', 'Lúc nào'],
            s.daBat.map(function (d) {
              return [h(d.id), h(d.viec), String(d.cap), h(d.aiBat), h(d.batLuc)];
            }));
        }
      }
    }
    return o;
  }

  /* ── NGĂN 4 · MƯỜI VIỆC NHẠY CẢM ── */
  function veNhay() {
    var ds = G.TNC_NHAY10 || [], lu = G.TNC_NHAY_LUAT || {};
    var o = U.sec('Mười việc nhạy cảm', lu.haiChuKyHaiNguoi || '');
    o += U.tbl(['Mã', 'Việc', 'Ai làm', 'Hai chữ ký'],
      ds.map(function (n) {
        return [h(n.ma), h(n.viec), h(n.ai), n.hai ? 'có' : 'không'];
      }));
    ['khongTuCap', 'quyenTuHetHan', 'motNguoiCuuChay'].forEach(function (k) {
      if (lu[k]) o += '<p class="note">' + h(lu[k]) + '</p>';
    });
    return o;
  }

  G.VIEWS['tu-nang-cap'] = function () {
    if (!(G.TNC_KHONG_CHAM && G.TNC_KHONG_CHAM.length)) {
      return U.empty('Vòng tự nâng cấp chưa mở với vai này',
        'Vòng tự nâng cấp nói rõ Học viện đổi chính mình bằng đường nào, và đổi được ' +
        'cái gì. Điều đáng nói nhất với gia đình nằm ở chỗ ngược lại: mười hai luật ' +
        'giao diện, Hiến pháp mười ba điều và trần giám sát KHÔNG đổi được bằng đường ' +
        'ấy — muốn đổi thì phải sửa kho gốc, qua một lượt phát hành, có người đọc lại ' +
        'từng dòng. Phần thuộc về gia đình nằm ở màn Luật giao diện và màn Pháp lý & ' +
        'rủi ro.');
    }

    var o = '<div class="hd"><h2>' + ic('shield') + ' Vòng tự nâng cấp</h2>' +
      '<p class="sub">Theo <b>Phần 18 · 25 · 13</b> của bản đặc tả cao cấp. Một hệ tự ' +
      'nâng cấp mà sửa được chính đường nâng cấp của nó là một hệ <b>không có giới hạn ' +
      'nào cả</b> — nên bản này dựng <b>vùng không chạm được</b> trước, rồi mới tới vòng ' +
      'năm cửa. Lần thứ ba thứ tự ấy được chọn, sau Hiến pháp và trần giám sát.</p></div>';

    o += '<div class="tabs">' + NGAN.map(function (n) {
      return '<button class="tab' + (G.tncNgan === n.ma ? ' on' : '') +
        '" onclick="G.tncMoNgan(\'' + n.ma + '\')">' + ic(n.ic) + ' ' + h(n.ten) +
        '</button>';
    }).join('') + '</div>';

    o += G.tncNgan === 'cap' ? veCap()
       : G.tncNgan === 'cua' ? veCua()
       : G.tncNgan === 'nhay' ? veNhay()
       : veVung();
    return o;
  };
})();
