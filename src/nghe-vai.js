/* ═══════════════════════════════════════════════════════════════
   GITA 365 — KHUNG NGHỀ CHUNG (chuyên môn hoá sâu theo vai)

   Một khung render chung cho các màn "Nghề …" còn lại, cùng mẫu 4 module
   A/B/C/D như Nghề Tư vấn / Nghề Coach — nhưng dữ liệu theo từng vai nằm
   trong G.NGHE_SPEC, nên thêm vai mới = thêm một mục dữ liệu, không chép
   lại giao diện.

   Phủ: R04 Quản lý chuyên môn · R09 Mentor · R10 Chuyên gia đánh giá ·
   R12 Phân tích dữ liệu. (Coach và Tư vấn đã có file riêng.)

   Tái dùng CSS .ntv-* và dữ liệu khách thật qua G.ttKhach. Không đụng máy
   chủ, giấy phép, mã hoá.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;
G.VIEWS = G.VIEWS || {};

(function () {
  var U = G.U, h = U.h, ic = U.ic;
  function lk(cua, nhan) { return '<button class="btn ghost sm ntv-lk" data-v="' + h(cua) + '">' + h(nhan) + ' →</button>'; }
  var BANDC = { DO: '#BE0E16', VANG: '#B4720F', XANH: '#0B7350' };

  function tabKhung(S) {
    var o = '<div class="ntv-grid">';
    S.khung.forEach(function (k) {
      o += '<div class="ntv-card"><div class="ntv-card-h"><span class="ntv-ic">' + ic(k.ic) + '</span><b>' + h(k.ten) + '</b></div>' +
        '<p>' + k.mo + '</p><div class="ntv-lks">' + lk(k.lk[0], k.lk[1]) + (k.lk2 ? lk(k.lk2[0], k.lk2[1]) : '') + '</div></div>';
    });
    o += '</div>';
    o += U.sec('NĂM CẤP CHỨNG NHẬN ' + S.capTen, 'Lên cấp bằng bằng chứng đo được — mỗi cấp một điều kiện và quyền lợi');
    o += '<div class="ntv-caps">';
    S.cap.forEach(function (c) {
      o += '<div class="ntv-cap" style="--cc:' + c.c + '"><div class="ntv-cap-n">' + c.n + '</div><b>' + h(c.ten) + '</b>' +
        '<div class="ntv-cap-row"><span class="ntv-cap-l">Điều kiện</span>' + h(c.dk) + '</div>' +
        '<div class="ntv-cap-row"><span class="ntv-cap-l">Quyền lợi</span>' + h(c.ql) + '</div></div>';
    });
    o += '</div>';
    return o;
  }

  function tabViec(S) {
    var tong = S.viec.reduce(function (s, v) { return s + v[2]; }, 0);
    var o = '<div class="ntv-note">' + ic('pulse', 'w-4 h-4') + ' <b>' + S.viec.length + ' đầu việc chuẩn</b> · tổng trọng số <b>' + tong + ' điểm</b>. ' +
      'Điểm việc đạt chuẩn trong ngày cộng vào KPI/lương. Mỗi việc nêu rõ tiêu chuẩn, quy trình, cẩm nang và dấu hiệu đạt — không ai mơ hồ.</div>';
    o += '<div class="ntv-wrap"><table class="ntv-table"><thead><tr>' +
      ['STT', 'Đầu việc', 'Trọng số', 'Nhóm', 'Tiêu chuẩn', 'Quy trình', 'Cẩm nang', 'Video', 'Nhận diện ĐẠT'].map(function (c) { return '<th>' + h(c) + '</th>'; }).join('') + '</tr></thead><tbody>';
    S.viec.forEach(function (v, i) {
      var n = S.nhom[v[0]];
      o += '<tr>' +
        '<td class="ntv-stt">' + (i + 1) + '</td>' +
        '<td><b>' + h(v[1]) + '</b></td>' +
        '<td class="ntv-w"><span class="ntv-wpill">' + v[2] + '</span></td>' +
        '<td><span class="ntv-nhom" style="--nc:' + n.c + '">' + h(n.ten) + '</span></td>' +
        '<td class="tiny">' + h(v[3]) + '</td>' +
        '<td class="tiny">' + h(v[4]) + '</td>' +
        '<td>' + lk(v[5], 'Mở') + '</td>' +
        '<td class="ntv-vid"><span title="Video minh hoạ (gắn sau)">▶</span></td>' +
        '<td class="tiny"><span class="ntv-dat">✓ ' + h(v[6]) + '</span></td>' +
      '</tr>';
    });
    o += '</tbody></table></div>';
    o += '<p class="tiny muted" style="margin-top:8px">' + ic('shield', 'w-3 h-3') + ' Video/hình minh hoạ gắn dần theo từng đầu việc. "Nhận diện ĐẠT" là điều kiện tối thiểu để việc được tính điểm — thiếu bằng chứng thì chưa đạt.</p>';
    return o;
  }

  var KH_MAU = [
    { ten: 'Nhà Minh Khang', ma: 'GITA-4401', gdj: 2, band: 'VANG', buoi: 3, danhGia: 3.6, bangChung: 'Chưa', nangGoi: 'Trung bình' },
    { ten: 'Nhà Hồng Phúc', ma: 'GITA-4402', gdj: 4, band: 'XANH', buoi: 7, danhGia: 4.5, bangChung: 'Có', nangGoi: 'Cao' },
    { ten: 'Nhà Quỳnh Anh', ma: 'GITA-4403', gdj: 1, band: 'DO', buoi: 1, danhGia: 2.8, bangChung: 'Chưa', nangGoi: 'Thấp' },
    { ten: 'Nhà Đức Thịnh', ma: 'GITA-4404', gdj: 3, band: 'VANG', buoi: 5, danhGia: 3.9, bangChung: 'Có', nangGoi: 'Cao' },
    { ten: 'Nhà Bảo Ngọc', ma: 'GITA-4405', gdj: 5, band: 'XANH', buoi: 10, danhGia: 4.7, bangChung: 'Có', nangGoi: 'Cao' }
  ];
  function khDs() {
    var real = (typeof G.ttKhach === 'function') ? G.ttKhach() : null;
    if (real && real.length) return real.map(function (k, i) {
      return { ten: k.ten, ma: k.ma, gdj: Math.min(5, (['moi', 'tuvan', 'baogia', 'damphan', 'chotky'].indexOf(k.gd) + 1) || 1), band: k.band, buoi: (i % 6) + 1, danhGia: null, bangChung: k.band === 'XANH' ? 'Có' : 'Chưa', nangGoi: k.gt >= 30000000 ? 'Cao' : k.gt >= 18000000 ? 'Trung bình' : 'Thấp', that: true };
    });
    return KH_MAU;
  }
  function tabKhach(S) {
    var ds = khDs(), that = ds[0] && ds[0].that;
    var o = '<div class="ntv-note">' + ic('map', 'w-4 h-4') + ' ' + S.cNote +
      (that ? ' <b style="color:#0B7350">Đang chạy trên dữ liệu thật.</b>' : ' <span style="color:var(--warn)">(minh hoạ)</span>') + '</div>';
    o += '<div class="ntv-gdj">';
    S.gdj.forEach(function (g) {
      var so = ds.filter(function (k) { return k.gdj === g.n; }).length;
      o += '<div class="ntv-gdj-pill" style="--gc:' + g.c + '"><b>' + g.n + '. ' + h(g.ten) + '</b><span>' + so + ' ' + h(S.cDv) + '</span></div>';
    });
    o += '</div>';
    o += '<div class="ntv-wrap"><table class="ntv-table"><thead><tr>' +
      ['STT', S.cObj, 'Hồ sơ', 'Giai đoạn (1-5)', 'Đèn', S.cDang, 'Bước tiếp theo', S.cTL, 'Dữ liệu buổi', 'Đánh giá', 'Bằng chứng', 'Tiềm năng nâng', 'Hồ sơ lộ trình'].map(function (c) { return '<th>' + h(c) + '</th>'; }).join('') + '</tr></thead><tbody>';
    ds.forEach(function (k, i) {
      var g = S.gdj[(k.gdj || 1) - 1] || S.gdj[0];
      var gke = S.gdj[Math.min(4, (k.gdj || 1))] || S.gdj[4];
      var dang = S.dang[(k.gdj || 1) - 1], ke = S.ke[(k.gdj || 1) - 1];
      var tn = k.nangGoi, tnc = tn === 'Cao' ? '#0B7350' : tn === 'Trung bình' ? '#B4720F' : '#73849F';
      o += '<tr>' +
        '<td class="ntv-stt">' + (i + 1) + '</td>' +
        '<td><b>' + h(k.ten) + '</b><div class="tiny muted">' + h(k.ma) + '</div></td>' +
        '<td>' + lk('crm', 'Hồ sơ') + '</td>' +
        '<td><span class="ntv-nhom" style="--nc:' + g.c + '">' + g.n + '. ' + h(g.ten) + '</span></td>' +
        '<td><span class="ntv-band" style="--bc:' + (BANDC[k.band] || '#73849F') + '"></span></td>' +
        '<td class="tiny">' + h(dang) + '</td>' +
        '<td class="tiny"><b style="color:' + gke.c + '">→ ' + h(ke) + '</b></td>' +
        '<td>' + lk(S.cTLkey, 'Mở') + '</td>' +
        '<td class="tiny ntv-center">' + k.buoi + '</td>' +
        '<td class="tiny ntv-center">' + (k.danhGia != null ? ('<b>' + k.danhGia.toFixed(1) + '</b>/5') : '—') + '</td>' +
        '<td class="tiny ntv-center">' + (k.bangChung === 'Có' ? '<span style="color:#0B7350;font-weight:700">✓ Có</span>' : '<span style="color:var(--warn)">Chưa</span>') + '</td>' +
        '<td><span class="ntv-nhom" style="--nc:' + tnc + '">' + h(tn) + '</span></td>' +
        '<td>' + lk(S.cLoTrinh, 'Mở lộ trình') + '</td>' +
      '</tr>';
    });
    o += '</tbody></table></div>';
    return o;
  }

  function tabDaoTao(S) {
    var o = U.sec('NĂM TRỤ HUẤN LUYỆN', 'Mỗi trụ nối thẳng tới màn học sâu — học tới đâu, điểm lên tới đó');
    o += '<div class="ntv-grid ntv-grid-5">';
    S.tru.forEach(function (t, i) {
      o += '<div class="ntv-card ntv-tru"><div class="ntv-ic ntv-ic-lg">' + ic(t.ic) + '</div><b>' + (i + 1) + '. ' + h(t.ten) + '</b><p class="tiny">' + h(t.mo) + '</p>' + lk(t.cua, 'Vào học') + '</div>';
    });
    o += '</div>';
    o += '<div class="ntv-wow">' + ic('sparkle', 'w-4 h-4') + ' <div><b>Hệ 10.000 điểm chạm WOW</b> — ngân hàng khoảnh khắc chạm cảm xúc khách, học & áp dần qua từng cấp. ' +
      '(Nền có 1.000 điểm chạm × 10 nhịp — mở rộng tới 10.000.) ' + lk('diem-cham-1000', 'Mở kho điểm chạm') + '</div></div>';
    o += U.sec('BẢNG TIẾN ĐỘ ĐÀO TẠO ' + S.capTen, 'Cấp đang đạt · tiến độ 5 trụ · điểm chạm WOW đã tích');
    o += '<div class="ntv-wrap"><table class="ntv-table"><thead><tr>' +
      ['Họ và tên', 'Hồ sơ', 'Cấp đạt'].concat(S.tru.map(function (t) { return t.ten; })).concat(['Điểm chạm WOW', 'Tổng tiến độ']).map(function (c) { return '<th>' + h(c) + '</th>'; }).join('') + '</tr></thead><tbody>';
    S.nsMau.forEach(function (n) {
      var cap = S.cap[n.cap - 1] || S.cap[0];
      var tb = Math.round(n.hl.reduce(function (a, b) { return a + b; }, 0) / n.hl.length);
      var cells = n.hl.map(function (p) {
        var c = p >= 80 ? '#0B7350' : p >= 50 ? '#B4720F' : '#BE0E16';
        return '<td class="ntv-prog"><div class="ntv-prog-bar"><i style="width:' + p + '%;background:' + c + '"></i></div><span>' + p + '%</span></td>';
      }).join('');
      o += '<tr><td><b>' + h(n.ten) + '</b></td><td>' + lk('kpi-toi', 'Hồ sơ') + '</td>' +
        '<td><span class="ntv-nhom" style="--nc:' + cap.c + '">C' + n.cap + ' · ' + h(cap.ten) + '</span></td>' +
        cells +
        '<td class="ntv-center"><b>' + n.wow.toLocaleString('vi-VN') + '</b><div class="tiny muted">/10.000</div></td>' +
        '<td class="ntv-center"><b style="color:' + (tb >= 80 ? '#0B7350' : tb >= 50 ? '#B4720F' : '#BE0E16') + '">' + tb + '%</b></td></tr>';
    });
    o += '</tbody></table></div>';
    o += '<p class="tiny muted" style="margin-top:8px">' + ic('shield', 'w-3 h-3') + ' Danh sách minh hoạ. Khi nối hồ sơ đào tạo thật, bảng chạy trên dữ liệu thật của đội.</p>';
    return o;
  }

  /* Dựng một màn nghề từ spec. Dùng chung id ntv-* (mỗi lúc chỉ một màn). */
  G.ngheVaiView = function (ma) {
    var S = (G.NGHE_SPEC || {})[ma];
    if (!S) return U.lockCard ? U.lockCard('Chưa có cấu hình nghề cho vai này.') : 'Chưa cấu hình.';
    if (!(typeof G.can === 'function' && G.can(S.perm)))
      return U.lockCard('Trang chuyên môn hoá ' + S.capTenL + ' mở cho ' + S.vaiTen + ' trở lên. Đăng nhập đúng vai để xem.');
    var o = U.ph({ eyebrow: S.eyebrow, ic: 'crown', grad: 1, t: S.pageT, lead: S.pageLead });
    var tabs = [['khung', 'A · Khung nghề'], ['viec', 'B · ' + S.viec.length + ' đầu việc / KPI'], ['khach', S.cTab], ['daotao', 'D · Lộ trình đào tạo']];
    o += tabs.map(function (t, i) { return '<input type="radio" name="ntvTab" id="ntv-' + t[0] + '" class="ntv-radio"' + (i === 0 ? ' checked' : '') + '>'; }).join('');
    o += '<div class="ntv-tabbar">' + tabs.map(function (t) { return '<label for="ntv-' + t[0] + '">' + h(t[1]) + '</label>'; }).join('') + '</div>';
    o += '<div class="ntv-panel" id="ntv-p-khung">' + tabKhung(S) + '</div>';
    o += '<div class="ntv-panel" id="ntv-p-viec">' + tabViec(S) + '</div>';
    o += '<div class="ntv-panel" id="ntv-p-khach">' + tabKhach(S) + '</div>';
    o += '<div class="ntv-panel" id="ntv-p-daotao">' + tabDaoTao(S) + '</div>';
    return o;
  };

  /* Đăng ký view cho từng vai (sau khi G.NGHE_SPEC nạp ở data-nghe-vai.js). */
  ['nghe-qlcm', 'nghe-mentor', 'nghe-danhgia', 'nghe-phantich',
   'nghe-tncoach', 'nghe-giamdoc', 'nghe-giaovien', 'nghe-daisu', 'nghe-quantri'].forEach(function (v) {
    G.VIEWS[v] = (function (key) { return function () { return G.ngheVaiView(key); }; })(v);
  });
})();
