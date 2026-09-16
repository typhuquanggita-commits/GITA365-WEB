/* ═══════════════════════════════════════════════════════════════
   GITA 365 — MÁY CHẠY GIÁO TRÌNH BỐN MƯƠI GIỜ

   Kho chuẩn ở kho-goc/data.dao-tao.js. Hai hàm làm việc thật:

   1. dtSoiGio() — mười hai buổi cộng bài thi phải đúng bốn mươi giờ.
      Giáo trình trôi giờ không bao giờ trôi ở buổi đầu; nó trôi ở buổi
      cuối, mà buổi cuối là buổi đạo đức khó. Cắt ngầm buổi ấy là cắt
      đúng thứ không cắt được.

   2. dtSoiNgonTu() — quét cột `dat` bằng CHÍNH máy quét của lời hỏi
      hằng ngày. Cột `truot` chứa cố ý câu sai và không bị quét — cùng
      bẫy với DD_TINHHUONG.sai và HM_NGONTU.thayBang. Ba chỗ, một máy.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;
G.VIEWS = G.VIEWS || {};

(function () {
  var U = G.U, h = U.h;

  G.dtTongGioLop = function () {
    return (G.DT_BUOI || []).reduce(function (a, b) { return a + (b.gio || 0); }, 0);
  };

  /* ─── Bốn mươi giờ có còn là bốn mươi giờ không ───
     Cộng cả giờ lớp và giờ thi. Con số bốn mươi nằm ở DD_CAP — đọc từ
     đó chứ không viết lại, để hai chỗ không rời nhau. */
  G.dtSoiGio = function () {
    var lop = G.dtTongGioLop();
    var thi = (G.DT_THI || {}).gio || 0;
    var can = 0;
    (G.DD_CAP || []).forEach(function (c) { if (c.ma === 'DH') can = c.gioDaoTao; });
    if (!can) return [];                    /* chưa nạp kho ép thì không kết luận */
    var loi = [];
    if (lop + thi !== can) loi.push('lớp ' + lop + ' + thi ' + thi + ' ≠ ' + can);
    if ((G.DT_BUOI || []).length !== 12) loi.push('số buổi=' + (G.DT_BUOI || []).length);
    return loi;
  };

  /* ─── Hai mươi ca thi vai, bốn nhóm năm ca ─── */
  G.dtSoiVai = function () {
    var ds = G.DT_VAI || [], loi = [];
    if (ds.length !== 20) loi.push('số ca=' + ds.length);
    ['A', 'B', 'C', 'D'].forEach(function (n) {
      var so = ds.filter(function (x) { return x.nhom === n; }).length;
      if (so !== 5) loi.push('nhóm ' + n + '=' + so);
    });
    ds.forEach(function (x) {
      if (!x.bay || !x.dat || !x.truot || String(x.dat).trim() === String(x.truot).trim())
        loi.push(x.ma);
    });
    return loi;
  };

  /* ─── Những câu THẬT SỰ nói với gia đình trong giáo trình ───
     Chỉ cột `dat`. Cột `truot` là ví dụ để đối chiếu — quét nó vào thì
     phép kiểm đỏ vĩnh viễn, và rồi ai đó sẽ tắt phép kiểm. */
  G.dtLoiNoiVoiNha = function () {
    return (G.DT_VAI || []).map(function (x) { return ['DT_VAI.' + x.ma, x.dat]; });
  };

  G.dtSoiNgonTu = function () {
    return G.hmQuetTuCam ? G.hmQuetTuCam(G.dtLoiNoiVoiNha()) : [];
  };

  /* ─── Buổi nào thiếu cột nào ───
     Thiếu `tru` là buổi chỉ có giảng mà không có luyện — và bảy phần
     luyện ba phần giảng là luật số hai của giáo trình. */
  G.dtSoiBuoi = function () {
    return (G.DT_BUOI || []).filter(function (b) { return !b.cot || !b.tru || !b.nha; })
      .map(function (b) { return 'buổi ' + b.so; });
  };

  /* ═══════════ MÀN: BỐN MƯƠI GIỜ ═══════════ */
  G.VIEWS['dao-tao-dh'] = function () {
    if (!G.DT_BUOI)
      return U.empty('Chưa mở được giáo trình',
        'Đây là giáo trình nghề, nằm trong gói nghề.');

    var gio = G.dtSoiGio(), lop = G.dtTongGioLop(), thi = (G.DT_THI || {}).gio || 0;
    var o = U.ph({ eyebrow: 'BỐN MƯƠI GIỜ', ic: 'brain', grad: 1,
      t: 'Không ai dạy được ai lắng nghe — mọi người vốn biết',
      lead: 'Bốn mươi giờ chỉ đủ để gỡ bỏ những thứ chặn nó lại: thói quen sửa chữa, nỗi sợ im lặng, ' +
        'ham được cảm ơn, và ảo tưởng mình là người hùng. Nên giáo trình này không phải bản nhạc — là danh sách những cái phải gỡ.' });

    o += '<div class="card mb" style="border-color:' + (gio.length ? '#BE0E16' : '#0B7350') + '3e">' +
      '<div class="row wrap" style="gap:16px;align-items:baseline">' +
      '<b>' + (G.DT_BUOI || []).length + ' buổi</b><b>' + lop + ' giờ lớp</b><b>' + thi + ' giờ thi</b>' +
      '<span class="tiny" style="margin-left:auto;color:' + (gio.length ? '#BE0E16' : '#0B7350') + '">' +
      (gio.length ? 'LỆCH: ' + h(gio.join(' · ')) : 'đúng ' + (lop + thi) + ' giờ') + '</span></div></div>';

    o += U.sec('Bốn nguyên tắc đào tạo', '');
    o += '<div class="card mb">' + (G.DT_LUAT || []).map(function (l) {
      return '<div style="padding:8px 0;border-bottom:1px solid var(--gita-vien-2)">' +
        '<b class="sm">' + l.no + '. ' + h(l.t) + '</b>' +
        '<p class="tiny dim mt" style="line-height:1.7">' + h(l.y) + '</p></div>';
    }).join('') + '</div>';

    var v = G.DT_VAO || {};
    o += U.sec('Tuyển chọn gánh nửa trách nhiệm',
      'Lớp tốt nhất không cứu được tuyển chọn sai.');
    o += '<div class="grid g2 mb">' +
      '<div class="card" style="border-color:#0B73502e"><b class="sm" style="color:#0B7350">ĐƯỢC NHẬN</b>' +
      (v.duoc || []).map(function (x) {
        return '<div class="tiny mt" style="line-height:1.7"><b>' + h(x.t) + '</b><div class="dim">' + h(x.y) + '</div></div>';
      }).join('') + '</div>' +
      '<div class="card" style="border-color:#BE0E162e"><b class="sm" style="color:#BE0E16">KHÔNG NHẬN, BẤT KỂ THIỆN CHÍ</b>' +
      (v.khong || []).map(function (x) {
        return '<div class="tiny mt" style="line-height:1.7"><b>' + h(x.t) + '</b><div class="dim">' + h(x.y) + '</div></div>';
      }).join('') + '</div></div>';
    o += U.tbl(['Vòng', 'Làm gì', 'Chấm bằng gì'],
      (v.vong || []).map(function (x) { return [h(x.ten), h(x.lam), h(x.cham)]; }));
    o += '<p class="tiny dim mb" style="line-height:1.7">' + h(v.khongDat || '') + '</p>';

    o += U.sec('Mười hai buổi', 'Cột "trụ" là bài luyện chính. Buổi nào không có trụ là buổi chỉ có giảng.');
    o += (G.DT_BUOI || []).map(function (b) {
      return '<div class="card mb">' +
        '<div class="row wrap" style="gap:10px;align-items:baseline">' +
        '<span class="tiny up" style="color:#5140B4">BUỔI ' + b.so + ' · ' + b.gio + ' GIỜ</span>' +
        '<b>' + h(b.ten) + '</b></div>' +
        '<p class="sm mt" style="line-height:1.8">' + h(b.cot) + '</p>' +
        '<p class="sm mt" style="line-height:1.8"><b>Trụ:</b> ' + h(b.tru) + '</p>' +
        '<p class="tiny dim mt" style="line-height:1.7"><b>Về nhà:</b> ' + h(b.nha) + '</p></div>';
    }).join('');

    o += U.sec('Hai mươi ca thi vai', ((G.DT_VAI_LUAT || {}).vi || ''));
    o += U.tbl(['Mã', 'Tình huống', 'Cạm bẫy tự nhiên', 'Đạt khi nói', 'Trượt khi nói'],
      (G.DT_VAI || []).map(function (x) {
        return [h(x.ma), h(x.ten), h(x.bay), h(x.dat), h(x.truot)];
      }));

    var tt = G.DT_THUCTAP || {};
    o += U.sec('Mười tuần thực tập', 'Sau bốn mươi giờ, không ai cầm chứng chỉ ngay.');
    o += U.tbl(['Tuần', 'Làm gì', 'Giám sát làm gì'],
      (tt.chang || []).map(function (c) { return [c.tu + '–' + c.den, h(c.lam), h(c.giamSat)]; }));
    o += '<div class="card mb"><b class="sm">Ba ngưỡng hoàn thành</b>' +
      (tt.nguong || []).map(function (n) {
        return '<div class="sm mt" style="line-height:1.8">· ' + h(n.t) +
          (n.y ? '<div class="tiny dim">' + h(n.y) + '</div>' : '') + '</div>';
      }).join('') +
      '<p class="tiny dim mt" style="line-height:1.7">' + h(tt.truot || '') + '</p></div>';

    o += U.sec('Năm tiêu chí chứng chỉ', '');
    o += U.tbl(['#', 'Tiêu chí', 'Bằng chứng lấy từ đâu', 'Chuẩn'],
      (G.DT_RUBRIC || []).map(function (r) { return [String(r.so), h(r.t), h(r.bang), h(r.chuan)]; }));

    var td = G.DT_TUYETDOI || {};
    o += '<div class="card mb" style="border-color:#BE0E163e">' +
      '<span class="tiny up" style="color:#BE0E16">TIÊU CHÍ TUYỆT ĐỐI — ĐỨNG TRÊN CẢ NĂM TIÊU CHÍ KIA</span>' +
      '<p class="mt" style="line-height:1.9"><b>' + h(td.t || '') + '</b></p>' +
      '<p class="sm mt" style="line-height:1.8">' + h(td.vi || '') + '</p>' +
      '<p class="tiny mt" style="line-height:1.7">Lần một: ' + h(td.lan1 || '') + ' Lần hai: ' + h(td.lan2 || '') + '</p>' +
      '<p class="tiny dim mt" style="line-height:1.7">' + h(td.luat || '') + '</p></div>';

    var th = G.DT_THI || {};
    o += U.sec('Bài thi cuối — không có bài viết', (th.lam || ''));
    o += U.tbl(['Giám khảo', 'Chấm gì', 'Quyền'],
      (th.giamKhao || []).map(function (g) { return [h(g.ai), h(g.cham), h(g.quyen || '—')]; }));
    o += '<div class="card mb"><b class="sm">Kết quả chỉ có hai trạng thái: ' +
      h((th.ketQua || []).join(' hoặc ')) + '</b>' +
      '<p class="sm mt" style="line-height:1.8">' + h(th.khongCoTruot || '') + '</p>' +
      '<p class="tiny dim mt" style="line-height:1.7">' + h(th.vi || '') + '</p></div>';

    o += U.sec('Sau chứng chỉ — ba phao cứu sinh', '');
    o += U.tbl(['Phao', 'Nhịp', 'Vì sao'],
      (G.DT_PHAO || []).map(function (p) { return [h(p.ten), h(p.nhip), h(p.y)]; }));

    var tc = G.DT_TAICHUNGCHI || {}, rl = G.DT_RUTLUI || {};
    o += '<div class="card mb"><b class="sm">Tái chứng chỉ — ' + tc.nam + ' năm một lần, ' + tc.gio + ' giờ</b>' +
      (tc.phan || []).map(function (x) { return '<div class="sm mt" style="line-height:1.8">· ' + h(x) + '</div>'; }).join('') +
      '<p class="tiny dim mt" style="line-height:1.7"><b>Trượt khi:</b> ' + h(tc.truotKhi || '') + '</p></div>';
    o += '<div class="card"><b class="sm">' + h(rl.cot || '') + '</b>' +
      (rl.duong || []).map(function (x) { return '<div class="sm mt" style="line-height:1.8">· ' + h(x) + '</div>'; }).join('') +
      '<p class="sm mt" style="line-height:1.8">' + h(rl.nghiThuc || '') + '</p>' +
      '<p class="tiny dim mt" style="line-height:1.7">' + h(rl.vi || '') + '</p></div>';
    return o;
  };
})();
