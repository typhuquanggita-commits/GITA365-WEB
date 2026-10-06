/* ═══════════════════════════════════════════════════════════════
   GITA 365 — TRUNG TÂM TƯ VẤN & CHĂM SÓC KHÁCH HÀNG

   Một chỗ cho Tư vấn/CSKH thao tác trọn ngày: việc hôm nay chia nhỏ theo
   giai đoạn, khách chia bốn loại (mới · cũ · tái · chăm lại), phễu bám
   chuyển đổi tới mục tiêu chốt 95%, và năm hệ hỗ trợ nối thẳng tới các
   màn sâu đã có. Super Admin/Admin thêm tab "Dòng chảy" xem báo cáo cả đội.

   DỮ LIỆU: khách thật lấy từ máy chủ CRM (như màn crm). Chưa nối thì hiện
   DANH SÁCH MINH HOẠ có nhãn rõ — đúng cách màn crm làm, không số giả
   không nhãn. Thuật toán (ưu tiên việc, chia loại, dự báo chốt) chạy trên
   bất kỳ nguồn nào đổ vào G.ttKhach().

   QUYỀN: mở cho Tư vấn trở lên (pro_consult). Tab Dòng chảy chỉ hiện với
   cấp quản trị CRM (crm_view). Không đụng máy chủ, giấy phép, mã hoá.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;
G.VIEWS = G.VIEWS || {};

(function () {
  var U = G.U, h = U.h, ic = U.ic;

  /* Giai đoạn chuyển đổi — nối tiếp tới chốt. xs = xác suất chốt tại chặng. */
  var GD = [
    { ma: 'moi', ten: 'Mới tiếp nhận', xs: 10, c: '#185AB4' },
    { ma: 'tuvan', ten: 'Đang tư vấn', xs: 30, c: '#2A72C6' },
    { ma: 'baogia', ten: 'Đã báo giá / lộ trình', xs: 50, c: '#0B6675' },
    { ma: 'damphan', ten: 'Khách cân nhắc', xs: 72, c: '#B4720F' },
    { ma: 'chotky', ten: 'Chuẩn bị ký', xs: 90, c: '#0B7350' }
  ];
  function gd(ma) { for (var i = 0; i < GD.length; i++) if (GD[i].ma === ma) return GD[i]; return GD[0]; }

  /* Bốn loại khách — trục CHĂM SÓC, khác trục giai đoạn phễu. */
  var SEG = [
    { ma: 'moi', ten: 'Khách mới', c: '#185AB4', mo: 'Mới vào phễu — tốc độ phản hồi quyết định tỷ lệ chốt.', viec: 'Gọi chào trong 24h, tư vấn lộ trình phù hợp.' },
    { ma: 'cu', ten: 'Khách đang dùng', c: '#0B7350', mo: 'Đang đồng hành — giữ hài lòng, mở rộng giá trị.', viec: 'Chạm đúng nhịp, nâng tầng khi đủ điều kiện.' },
    { ma: 'tai', ten: 'Khách tái ký', c: '#B4720F', mo: 'Hết chu kỳ — mời quay lại, ưu đãi trung thành.', viec: 'Gọi mời tái ký kèm ưu đãi, nhắc giá trị đã nhận.' },
    { ma: 'cham', ten: 'Chăm sóc lại', c: '#BE0E16', mo: 'Nguội / có dấu hiệu rời — tái chạm trước khi mất.', viec: 'Tái chạm ngay, hỏi vướng mắc, kéo lại hành trình.' }
  ];
  function seg(ma) { for (var i = 0; i < SEG.length; i++) if (SEG[i].ma === ma) return SEG[i]; return SEG[0]; }

  /* Danh sách khách MINH HOẠ (nhãn rõ) — thay bằng G.ttKhach() khi có máy chủ. */
  var MAU = [
    { ten: 'Nhà Trung Nguyên', ma: 'GITA-0152', loai: 'moi', gd: 'moi', band: 'VANG', gt: 15000000, cham: 0, chot: 3 },
    { ten: 'Nhà Phương Thảo', ma: 'GITA-0153', loai: 'moi', gd: 'tuvan', band: 'XANH', gt: 18000000, cham: 1, chot: 5 },
    { ten: 'Nhà Văn Nghĩa', ma: 'GITA-0154', loai: 'moi', gd: 'moi', band: 'DO', gt: 12000000, cham: 3, chot: 2 },
    { ten: 'Nhà Núi Nguyên', ma: 'GITA-0140', loai: 'cu', gd: 'baogia', band: 'XANH', gt: 30000000, cham: 2, chot: 6 },
    { ten: 'Nhà Nguyễn Thị Hoa', ma: 'GITA-0141', loai: 'cu', gd: 'damphan', band: 'VANG', gt: 22000000, cham: 4, chot: 1 },
    { ten: 'Nhà Trần Thị Lan', ma: 'GITA-0142', loai: 'tai', gd: 'tuvan', band: 'VANG', gt: 50000000, cham: 7, chot: 4 },
    { ten: 'Nhà Vinachay', ma: 'GITA-0130', loai: 'tai', gd: 'baogia', band: 'DO', gt: 15000000, cham: 9, chot: 0 },
    { ten: 'Nhà Khánh Vy', ma: 'GITA-0160', loai: 'cham', gd: 'damphan', band: 'DO', gt: 28000000, cham: 12, chot: 2 },
    { ten: 'Nhà Bảo Châu', ma: 'GITA-0151', loai: 'cham', gd: 'chotky', band: 'VANG', gt: 40000000, cham: 5, chot: 1 },
    { ten: 'Nhà Thảo Nguyên', ma: 'GITA-0167', loai: 'cu', gd: 'tuvan', band: 'XANH', gt: 20000000, cham: 1, chot: 8 },
    { ten: 'Nhà Quốc Bảo', ma: 'GITA-0170', loai: 'moi', gd: 'moi', band: 'VANG', gt: 16000000, cham: 0, chot: 7 },
    { ten: 'Nhà An Nhiên', ma: 'GITA-0145', loai: 'cham', gd: 'baogia', band: 'DO', gt: 25000000, cham: 15, chot: 3 }
  ];
  G.ttKhach = G.ttKhach || function () { return null; };
  function dsKhach() { var real = G.ttKhach(); return (real && real.length) ? { ds: real, that: true } : { ds: MAU, that: false }; }

  var BAND = { DO: { ten: 'Đỏ', c: '#BE0E16' }, VANG: { ten: 'Vàng', c: '#B4720F' }, XANH: { ten: 'Xanh', c: '#0B7350' } };
  function tien(n) { return (n >= 1e6 ? (n / 1e6).toFixed(n % 1e6 ? 1 : 0) + ' tr' : n.toLocaleString('vi-VN')); }

  /* ── Thuật toán việc hôm nay: ưu tiên + hành động theo đèn/giai đoạn/loại ── */
  function viecHomNay(k) {
    if (k.band === 'DO') return { v: 'Gọi NGAY — ' + (k.loai === 'cham' ? 'nhà lâu chưa chạm, nguy cơ rời' : 'nhà đang nóng, đừng để nguội'), ut: 100, cua: 'crm' };
    if (k.chot <= 2) return { v: 'Đẩy quyết định — chốt hợp đồng ' + gd(k.gd).ten.toLowerCase(), ut: 90, cua: 'pheu-chot' };
    if (k.loai === 'moi') return { v: 'Gọi chào & tư vấn lộ trình phù hợp', ut: 72, cua: 'ban-tu-van' };
    if (k.loai === 'tai') return { v: 'Mời tái ký — nhắc giá trị đã nhận, kèm ưu đãi', ut: 64, cua: 'crm' };
    if (k.loai === 'cham') return { v: 'Chăm sóc lại — hỏi vướng mắc, kéo lại hành trình', ut: 58, cua: 'van-hanh-cham-soc' };
    return { v: 'Theo dõi & cập nhật trạng thái', ut: 40, cua: 'crm' };
  }

  function bandChip(b) { var x = BAND[b] || BAND.XANH; return '<span class="tvc-band" style="--bc:' + x.c + '">' + h(x.ten) + '</span>'; }
  function segChip(ma) { var s = seg(ma); return '<span class="tvc-seg-chip" style="--sc:' + s.c + '">' + h(s.ten) + '</span>'; }

  /* ── Tab 1 · HÔM NAY: danh sách đầu việc trong ngày, xếp ưu tiên ── */
  function tabHomNay(kq) {
    var rows = kq.ds.map(function (k) { var w = viecHomNay(k); return { k: k, w: w }; })
      .sort(function (a, b) { return b.w.ut - a.w.ut; });
    var khan = rows.filter(function (r) { return r.w.ut >= 90; }).length;
    var o = '<div class="tvc-note">' + ic('target', 'w-4 h-4') + ' <b>' + rows.length + ' đầu việc hôm nay</b> · ' +
      khan + ' việc khẩn cần làm trước. Làm từ trên xuống để không bỏ sót.</div>';
    o += '<div class="tvc-wrap"><table class="tvc-table"><thead><tr>' +
      ['#', 'Khách', 'Loại', 'Giai đoạn', 'Đèn', 'Giá trị', 'Việc cần làm hôm nay', 'Ưu tiên', 'Hành động'].map(function (c) { return '<th>' + h(c) + '</th>'; }).join('') +
      '</tr></thead><tbody>';
    rows.forEach(function (r, i) {
      var k = r.k, w = r.w, g = gd(k.gd);
      var utc = w.ut >= 90 ? '#BE0E16' : w.ut >= 65 ? '#B4720F' : '#185AB4';
      var utt = w.ut >= 90 ? 'KHẨN' : w.ut >= 65 ? 'CAO' : 'THƯỜNG';
      o += '<tr>' +
        '<td class="tvc-stt">' + (i + 1) + '</td>' +
        '<td><b>' + h(k.ten) + '</b><div class="tiny muted">' + h(k.ma) + '</div></td>' +
        '<td>' + segChip(k.loai) + '</td>' +
        '<td><span class="tvc-gd" style="--gc:' + g.c + '">' + h(g.ten) + '</span></td>' +
        '<td>' + bandChip(k.band) + '</td>' +
        '<td class="tvc-tien">' + tien(k.gt) + '</td>' +
        '<td>' + h(w.v) + (k.chot <= 2 ? '<div class="tiny cvt-tre" style="margin-top:2px">dự kiến chốt trong ' + k.chot + ' ngày</div>' : '') + '</td>' +
        '<td><span class="tvc-ut" style="--uc:' + utc + '">' + utt + '</span></td>' +
        '<td><button class="btn pri sm tvc-act" data-v="' + h(w.cua) + '">Xử lý</button></td>' +
      '</tr>';
    });
    o += '</tbody></table></div>';
    return o;
  }

  /* ── Tab 2 · KHÁCH: bốn loại, đếm + chia việc ── */
  function tabKhach(kq) {
    var o = '<div class="tvc-segs">';
    SEG.forEach(function (s) {
      var ds = kq.ds.filter(function (k) { return k.loai === s.ma; });
      var do_ = ds.filter(function (k) { return k.band === 'DO'; }).length;
      o += '<div class="tvc-seg" style="--sc:' + s.c + '">' +
        '<div class="tvc-seg-top"><b>' + h(s.ten) + '</b><span class="tvc-seg-n">' + ds.length + '</span></div>' +
        '<p class="tiny">' + h(s.mo) + '</p>' +
        '<div class="tvc-seg-viec">' + ic('arrow', 'w-3 h-3') + ' ' + h(s.viec) + '</div>' +
        (do_ ? '<div class="tiny" style="color:#BE0E16;font-weight:700;margin-top:6px">⚠ ' + do_ + ' nhà đèn đỏ — xử lý trước</div>' : '<div class="tiny" style="color:#0B7350;margin-top:6px">✓ không có nhà đèn đỏ</div>') +
        '</div>';
    });
    o += '</div>';
    o += '<div class="tvc-wrap" style="margin-top:14px"><table class="tvc-table"><thead><tr>' +
      ['Khách', 'Loại', 'Giai đoạn', 'Đèn', 'Giá trị', 'Lần chạm gần nhất', 'Phân công'].map(function (c) { return '<th>' + h(c) + '</th>'; }).join('') + '</tr></thead><tbody>';
    kq.ds.slice().sort(function (a, b) { return (b.band === 'DO') - (a.band === 'DO'); }).forEach(function (k) {
      var g = gd(k.gd);
      o += '<tr>' +
        '<td><b>' + h(k.ten) + '</b><div class="tiny muted">' + h(k.ma) + '</div></td>' +
        '<td>' + segChip(k.loai) + '</td>' +
        '<td><span class="tvc-gd" style="--gc:' + g.c + '">' + h(g.ten) + '</span></td>' +
        '<td>' + bandChip(k.band) + '</td>' +
        '<td class="tvc-tien">' + tien(k.gt) + '</td>' +
        '<td class="' + (k.cham >= 10 ? 'cvt-tre' : 'muted') + ' tiny">' + (k.cham === 0 ? 'hôm nay' : k.cham + ' ngày trước') + '</td>' +
        '<td><button class="btn ghost sm tvc-act" data-v="crm">Giao việc</button></td>' +
      '</tr>';
    });
    o += '</tbody></table></div>';
    return o;
  }

  /* ── Tab 3 · PHỄU → 95%: bám chuyển đổi, chỉ điểm rơi để đẩy chốt ── */
  function tabPheu(kq) {
    var byGd = GD.map(function (g) {
      var ds = kq.ds.filter(function (k) { return k.gd === g.ma; });
      var gt = ds.reduce(function (s, k) { return s + k.gt; }, 0);
      return { g: g, so: ds.length, gt: gt };
    });
    var tongSo = byGd.reduce(function (s, x) { return s + x.so; }, 0);
    var tongGt = byGd.reduce(function (s, x) { return s + x.gt; }, 0);
    var duBao = byGd.reduce(function (s, x) { return s + x.gt * x.g.xs / 100; }, 0);
    /* Tỷ lệ chốt dự kiến = dự báo trọng số / tổng giá trị mở. */
    var tyLe = tongGt ? Math.round(duBao / tongGt * 100) : 0;
    /* Điểm rơi lớn nhất = chặng có nhiều cơ hội mà xác suất còn thấp. */
    var roi = byGd.filter(function (x) { return x.so; }).sort(function (a, b) { return (b.so * (100 - b.g.xs)) - (a.so * (100 - a.g.xs)); })[0];

    var o = '<div class="grid g4 mb">' +
      U.stat({ k: 'Cơ hội đang mở', v: String(tongSo), d: 'khách trong phễu', c: 'var(--gita)' }) +
      U.stat({ k: 'Tổng giá trị mở', v: tien(tongGt), d: 'đồng', c: 'var(--gita-sau)' }) +
      U.stat({ k: 'Tỷ lệ chốt dự kiến', v: tyLe + '%', d: 'mục tiêu 95%', c: tyLe >= 95 ? '#0B7350' : '#B4720F' }) +
      U.stat({ k: 'Cần kéo thêm', v: (Math.max(0, 95 - tyLe)) + '%', d: 'để đạt mục tiêu', c: '#BE0E16' }) +
      '</div>';

    o += '<div class="tvc-gauge"><div class="tvc-gauge-bar"><i style="width:' + Math.min(100, tyLe) + '%"></i>' +
      '<span class="tvc-gauge-tar" style="left:95%"></span></div>' +
      '<div class="tiny muted">Tỷ lệ chốt dự kiến <b>' + tyLe + '%</b> · vạch mục tiêu <b>95%</b></div></div>';

    o += '<div class="tvc-pheu">';
    byGd.forEach(function (x, i) {
      var w = Math.max(28, 100 - i * 15);
      o += '<div class="tvc-pheu-row"><div class="tvc-pheu-ten"><b>' + h(x.g.ten) + '</b><span class="tiny muted">chốt ~' + x.g.xs + '%</span></div>' +
        '<div class="tvc-pheu-bar" style="width:' + w + '%;background:' + x.g.c + '"><span>' + x.so + ' khách · ' + tien(x.gt) + '</span></div></div>';
    });
    o += '</div>';

    if (roi) o += '<div class="tvc-note tvc-note-do">' + ic('alert', 'w-4 h-4') + ' <b>Điểm rơi lớn nhất: "' + h(roi.g.ten) + '"</b> — ' +
      roi.so + ' khách đang kẹt ở chặng chốt ~' + roi.g.xs + '%. Dồn lực đẩy chặng này sẽ kéo tỷ lệ chốt lên nhanh nhất. ' +
      '<button class="btn ghost sm tvc-act" style="margin-left:6px" data-v="pheu-chot">Mở phễu chốt</button></div>';
    return o;
  }

  /* ── Tab 4 · HỖ TRỢ: năm hệ, nối tới màn sâu đã có ── */
  function tabHoTro() {
    var HT = [
      { ic: 'bell', ten: 'Hệ thống nhắc', mo: 'Nhắc gọi/chạm đúng nhịp; đèn đỏ ưu tiên; không để nhà nào rơi khỏi tầm mắt.', cua: 'van-hanh-cham-soc', nut: 'Nhịp chạm & nhắc' },
      { ic: 'share', ten: 'Hệ thống gửi việc', mo: 'Giao & nhận đầu việc theo vai, có hạn, có bằng chứng — nối thẳng bảng công việc.', cua: 'bang-viec', nut: 'Bảng công việc' },
      { ic: 'pulse', ten: 'Hệ thống đo lường', mo: '7 chỉ số khách · 6 nhịp · vòng cải tiến — biết đang mạnh/yếu ở đâu.', cua: 'do-luong-kh', nut: 'Hệ đo lường KH' },
      { ic: 'spark', ten: 'Hệ giải pháp hỗ trợ', mo: 'Kịch bản · phác đồ · Trợ lý GITA gợi ý câu nói đúng cho từng tình huống.', cua: 'tro-ly-ai', nut: 'Trợ lý GITA' },
      { ic: 'chart', ten: 'Hệ tổng hợp', mo: 'Buồng lái CRM: phễu · doanh thu · đọc trọn một nhà ở một chỗ.', cua: 'crm', nut: 'Mở CRM' }
    ];
    var o = '<div class="tvc-ht">';
    HT.forEach(function (x) {
      o += '<div class="tvc-ht-card"><div class="tvc-ht-ic">' + ic(x.ic) + '</div>' +
        '<b>' + h(x.ten) + '</b><p class="tiny">' + h(x.mo) + '</p>' +
        '<button class="btn ghost sm tvc-act" data-v="' + h(x.cua) + '">' + h(x.nut) + ' →</button></div>';
    });
    o += '</div>';
    return o;
  }

  /* ── Tab 5 · DÒNG CHẢY (chỉ cấp quản trị CRM) ── */
  function tabDongChay(kq) {
    if (!(typeof G.can === 'function' && G.can('crm_view')))
      return U.lockCard('Báo cáo dòng chảy công việc & kết quả cả đội chỉ mở cho cấp quản trị CRM (Super Admin · Admin · Giám đốc).');
    var byGd = GD.map(function (g) { var ds = kq.ds.filter(function (k) { return k.gd === g.ma; }); return { g: g, so: ds.length, gt: ds.reduce(function (s, k) { return s + k.gt; }, 0) }; });
    var doDo = kq.ds.filter(function (k) { return k.band === 'DO'; }).length;
    var o = '<div class="grid g4 mb">' +
      U.stat({ k: 'Tổng khách', v: String(kq.ds.length), d: 'đang theo', c: 'var(--gita)' }) +
      U.stat({ k: 'Đèn đỏ', v: String(doDo), d: 'cần can thiệp', c: '#BE0E16' }) +
      U.stat({ k: 'Chuẩn bị ký', v: String(byGd[4].so), d: 'sắp chốt', c: '#0B7350' }) +
      U.stat({ k: 'Giá trị mở', v: tien(kq.ds.reduce(function (s, k) { return s + k.gt; }, 0)), d: 'đồng', c: 'var(--gita-sau)' }) +
      '</div>';
    o += U.sec('DÒNG CHẢY THEO GIAI ĐOẠN', 'Khách đang nằm ở đâu — chỗ nào nghẽn thì dồn người');
    o += '<div class="tvc-wrap"><table class="tvc-table"><thead><tr>' +
      ['Giai đoạn', 'Số khách', 'Giá trị', 'Xác suất chốt', 'Dự báo'].map(function (c) { return '<th>' + h(c) + '</th>'; }).join('') + '</tr></thead><tbody>' +
      byGd.map(function (x) {
        return '<tr><td><span class="tvc-gd" style="--gc:' + x.g.c + '">' + h(x.g.ten) + '</span></td>' +
          '<td class="tvc-stt">' + x.so + '</td><td class="tvc-tien">' + tien(x.gt) + '</td>' +
          '<td>' + x.g.xs + '%</td><td class="tvc-tien" style="color:#0B7350">' + tien(Math.round(x.gt * x.g.xs / 100)) + '</td></tr>';
      }).join('') + '</tbody></table></div>';
    o += '<p class="note mt">' + ic('shield', 'w-3 h-3') + ' Báo cáo kết quả chi tiết (doanh thu thật, theo từng Sale) đọc ở màn CRM khi đã nối máy chủ. ' +
      'Màn này tổng hợp dòng chảy để quản trị nhìn nhanh chỗ nghẽn.</p>';
    return o;
  }

  G.VIEWS['tt-cskh'] = function () {
    var kq = dsKhach();
    var admin = typeof G.can === 'function' && G.can('crm_view');
    var o = U.ph({ eyebrow: 'TRUNG TÂM TƯ VẤN & CHĂM SÓC KHÁCH HÀNG', ic: 'users', grad: 1,
      t: 'Làm trọn một ngày — không bỏ sót khách nào',
      lead: 'Việc hôm nay chia nhỏ theo giai đoạn · khách chia bốn loại (mới · cũ · tái · chăm lại) · phễu bám chuyển đổi tới mục tiêu chốt 95% · năm hệ hỗ trợ nối thẳng tới màn chuyên sâu.' });

    if (!kq.that) o += '<div class="tvc-note" style="background:var(--gita-mo-1);border-color:var(--gita-vien-1)">' + ic('alert', 'w-4 h-4') +
      ' Đang hiện <b>danh sách minh hoạ</b> để xem cấu trúc. Nối máy chủ CRM thì mọi bảng chạy trên khách thật.</div>';

    /* Tab bar (CSS radio) */
    var tabs = [['homnay', 'Hôm nay'], ['khach', 'Khách (4 loại)'], ['pheu', 'Phễu → 95%'], ['hotro', 'Hỗ trợ']];
    if (admin) tabs.push(['dongchay', 'Dòng chảy']);
    o += tabs.map(function (t, i) { return '<input type="radio" name="tvcTab" id="tvc-' + t[0] + '" class="tvc-radio"' + (i === 0 ? ' checked' : '') + '>'; }).join('');
    o += '<div class="tvc-tabbar">' + tabs.map(function (t) { return '<label for="tvc-' + t[0] + '">' + h(t[1]) + '</label>'; }).join('') + '</div>';
    o += '<div class="tvc-panel" id="tvc-p-homnay">' + tabHomNay(kq) + '</div>';
    o += '<div class="tvc-panel" id="tvc-p-khach">' + tabKhach(kq) + '</div>';
    o += '<div class="tvc-panel" id="tvc-p-pheu">' + tabPheu(kq) + '</div>';
    o += '<div class="tvc-panel" id="tvc-p-hotro">' + tabHoTro() + '</div>';
    if (admin) o += '<div class="tvc-panel" id="tvc-p-dongchay">' + tabDongChay(kq) + '</div>';
    return o;
  };
})();
