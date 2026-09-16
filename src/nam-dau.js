/* ═══════════════════════════════════════════════════════════════
   GITA 365 — MÁY CHẠY SỔ TAY NĂM ĐẦU

   Kho chuẩn ở kho-goc/data.nam-dau.js. Hàm quan trọng nhất ở đây là
   ndSoiTyLe() — và nó tồn tại vì một chỗ vênh số.

   CHỖ VÊNH, VÀ CÁCH TÔI XỬ

   Bản gốc Phần VII viết "một Đồng Hành : tối đa mười gia đình". Trần
   đã ép trong hệ từ bản 9.14 là NĂM, và trần ấy có hàm từ chối thật.
   Hai con số không thể cùng đúng.

   Tôi giữ trần và sửa kế hoạch: một trăm nhà cần HAI MƯƠI người kèm,
   không phải mười. Sửa trần cho vừa kế hoạch thì dễ hơn, và đó chính
   là cách mọi cái trần trên đời chết — không ai xoá nó, người ta chỉ
   nới nó một lần vì có lý do chính đáng.

   ndSoiTyLe() đọc trần từ DD_CAP chứ không đọc con số viết tay, nên
   hôm nào ai đó đổi trần mà quên đổi kế hoạch thì bộ kiểm đỏ ngay.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;
G.VIEWS = G.VIEWS || {};

(function () {
  var U = G.U, h = U.h;

  /* ─── Kế hoạch năm đầu có khớp trần đã ép không ───
     Đọc trần từ kho ép, KHÔNG đọc con số viết tay trong kế hoạch. */
  G.ndSoiTyLe = function () {
    var q = G.ND_QUYMO;
    if (!q || !G.ddTranCua) return [];
    var tran = G.ddTranCua('DH');
    if (!tran) return [];                    /* chưa nạp kho ép thì không kết luận */
    var can = Math.ceil(q.nhaToiDa / tran);
    var loi = [];
    if (q.donghanhCan !== can)
      loi.push('kế hoạch ' + q.donghanhCan + ' người, trần ' + tran + ' nhà đòi ' + can);
    /* Tổng số nhà nhận qua 12 tháng phải bằng đúng quy mô đã chốt */
    var tong = (G.ND_THANG || []).reduce(function (a, t) { return a + (t.nhan || 0); }, 0);
    if (tong !== q.nhaToiDa) loi.push('12 tháng nhận ' + tong + ', quy mô chốt ' + q.nhaToiDa);
    return loi;
  };

  G.ndCanBaoNhieuNguoi = function (soNha) {
    var tran = G.ddTranCua ? G.ddTranCua('DH') : 0;
    if (!tran) return null;
    return Math.ceil((Number(soNha) || 0) / tran);
  };

  /* ─── Mốc kiểm của ngày thứ N ───
     Trả về mốc gần nhất đã tới. Ngày chưa tới mốc nào thì trả null —
     không được trả mốc đầu tiên cho lấy lệ. */
  G.ndMocCua = function (ngay) {
    var n = Number(ngay) || 0, ra = null;
    (G.ND_MOC || []).forEach(function (m) { if (n >= m.ngay) ra = m; });
    return ra;
  };

  G.ndThangCua = function (thang) {
    var ds = G.ND_THANG || [];
    for (var i = 0; i < ds.length; i++) if (ds[i].thang === thang) return ds[i];
    return null;
  };

  /* ─── Tuần quá tải thì bỏ hoạt động nào ───
     Trả về danh sách theo ĐÚNG thứ tự được phép bỏ. `bo: 0` không bao
     giờ vào danh sách. Thứ tự viết sẵn để lúc bận không phải quyết —
     lúc bận mà còn phải quyết bỏ gì thì bao giờ cũng bỏ nhầm. */
  G.ndThuTuBo = function () {
    return (G.ND_TUAN || []).filter(function (x) { return x.bo > 0; })
      .slice().sort(function (a, b) { return a.bo - b.bo; });
  };

  G.ndKhongDuocBo = function () {
    return (G.ND_TUAN || []).filter(function (x) { return !x.bo; });
  };

  /* ─── Kịch bản sự cố nào cũng đủ ba cột chưa ───
     Thiếu `cam` là kịch bản chỉ dạy làm gì mà không dạy KHÔNG làm gì —
     và trong khủng hoảng, cột "không làm gì" mới là cột cứu người. */
  G.ndSoiSuCo = function () {
    return (G.ND_SUCO || []).filter(function (s) {
      return !s.biet || !(s.lam || []).length || !s.cam || !s.hoc;
    }).map(function (s) { return s.ma; });
  };

  /* ═══════════ MÀN: SỔ TAY NĂM ĐẦU ═══════════ */
  G.VIEWS['nam-dau'] = function () {
    if (!G.ND_THANG)
      return U.empty('Chưa mở được sổ tay năm đầu',
        'Đây là sổ vận hành nội bộ, nằm trong gói nghề.');

    var q = G.ND_QUYMO, lech = G.ndSoiTyLe();
    var o = U.ph({ eyebrow: 'SỔ TAY NĂM ĐẦU', ic: 'compass', grad: 1,
      t: 'Ba trăm sáu mươi lăm ngày có ngày tháng',
      lead: 'Sẽ có một sáng thứ Hai ai đó đứng lên hỏi: vậy tuần sau mình làm gì đầu tiên? ' +
        'Câu ấy không có câu trả lời thì cả đề án thành thứ nguy hiểm nhất — một điều hay ho được nói rồi cất vào ngăn kéo.' });

    /* ── Quy mô: chỗ con số phải khớp trần ── */
    o += '<div class="card mb" style="border-color:' + (lech.length ? '#BE0E16' : '#0B7350') + '3e">' +
      '<div class="row wrap" style="gap:16px;align-items:baseline">' +
      '<b>' + q.nhaToiDa + ' nhà</b><b>' + q.donghanhCan + ' người đi cùng</b>' +
      '<span class="tiny muted">trần ' + (G.ddTranCua ? G.ddTranCua('DH') : '?') + ' nhà mỗi người</span>' +
      '<span class="tiny" style="margin-left:auto;color:' + (lech.length ? '#BE0E16' : '#0B7350') + '">' +
      (lech.length ? 'LỆCH: ' + h(lech.join(' · ')) : 'khớp trần') + '</span></div>' +
      '<p class="sm mt" style="line-height:1.8">' + h(q.vi) + '</p>' +
      '<p class="tiny dim mt" style="line-height:1.7">' + h(q.luat) + '</p></div>';

    o += U.sec('Ba nguyên tắc năm đầu', '');
    o += '<div class="card mb">' + (G.ND_LUAT || []).map(function (l) {
      return '<div style="padding:8px 0;border-bottom:1px solid var(--gita-vien-2)">' +
        '<b class="sm">' + l.no + '. ' + h(l.t) + '</b>' +
        '<p class="tiny dim mt" style="line-height:1.7">' + h(l.y) + '</p></div>';
    }).join('') + '</div>';

    o += U.sec('Ngày 0 — tám điều kiện mở cửa',
      'Thiếu một điều thì mở cửa muộn một tháng còn hơn mở sớm một ngày.');
    o += U.tbl(['#', 'Điều kiện', 'Vì sao'],
      (G.ND_NGAY0 || []).map(function (x) { return [String(x.so), h(x.t), h(x.y)]; }));

    o += U.sec('Mười hai tháng', 'Cột "cấm" là cột hay bị bỏ qua nhất, và là cột giữ tháng ấy đúng nhịp.');
    o += (G.ND_THANG || []).map(function (t) {
      return '<div class="card mb" style="border-color:' + t.c + '2e">' +
        '<div class="row wrap" style="gap:10px;align-items:baseline">' +
        '<span class="tiny up" style="color:' + t.c + '">THÁNG ' + t.thang + ' · ' + h(t.ten) + '</span>' +
        (t.nhan ? '<span class="tiny muted">nhận ' + t.nhan + ' nhà</span>' : '') +
        (t.le ? '<span class="tiny" style="color:#B4720F">' + h(t.le) + '</span>' : '') +
        (t.moc && t.moc.length ? '<span class="tiny muted" style="margin-left:auto">mốc ngày ' + t.moc.join(', ') + '</span>' : '') +
        '</div>' +
        (t.bat && t.bat.length ? '<p class="tiny mt" style="line-height:1.7"><b>Bật:</b> ' + h(t.bat.join(' · ')) + '</p>' : '') +
        '<p class="sm mt" style="line-height:1.8">' + h(t.cot) + '</p>' +
        '<p class="tiny mt" style="line-height:1.7;color:#BE0E16"><b>Cấm:</b> ' + h(t.cam) + '</p></div>';
    }).join('');

    o += U.sec('Nhịp tuần của đội vận hành', ((G.ND_TUAN_LUAT || {}).luat || ''));
    o += U.tbl(['Thứ', 'Việc', 'Phút', 'Bỏ được không', 'Vì sao'],
      (G.ND_TUAN || []).map(function (x) {
        return [x.thu === 8 ? 'CN' : 'Thứ ' + x.thu, h(x.ten), x.phut ? String(x.phut) : '—',
          x.bo ? 'thứ ' + x.bo : 'KHÔNG BAO GIỜ', h(x.vi)];
      }));
    o += '<p class="tiny dim mb" style="line-height:1.7">' + h((G.ND_TUAN_LUAT || {}).vi || '') + '</p>';

    o += U.sec('Sáu mốc kiểm', ((G.ND_MOC_LUAT || {}).vi || ''));
    o += (G.ND_MOC || []).map(function (m) {
      return '<div class="card mb" style="border-color:' + m.c + '2e">' +
        '<span class="tiny up" style="color:' + m.c + '">NGÀY ' + m.ngay + ' · ' + h(m.ten) + '</span>' +
        '<div class="mt">' + (m.hoi || []).map(function (c) {
          return '<div class="sm" style="padding:4px 0;line-height:1.7">· ' + h(c) + '</div>';
        }).join('') + '</div>' +
        '<p class="tiny dim mt" style="line-height:1.7">' + h(m.y) + '</p></div>';
    }).join('');

    o += U.sec('Tám kịch bản lần đầu',
      'Viết TRƯỚC khi xảy ra. Lần đầu xử thế nào thì rừng sẽ xử thế đó mãi — người ta không nhớ luật đã học, người ta nhớ hình ảnh đã thấy.');
    o += (G.ND_SUCO || []).map(function (s) {
      return '<div class="card mb" style="border-color:' + s.c + '2e">' +
        '<div class="row wrap" style="gap:10px;align-items:baseline">' +
        '<span class="tiny up" style="color:' + s.c + '">' + h(s.ma) + '</span><b>' + h(s.ten) + '</b></div>' +
        '<p class="sm mt" style="line-height:1.8"><b>Nhận biết:</b> ' + h(s.biet) + '</p>' +
        '<div class="mt">' + (s.lam || []).map(function (b, i) {
          return '<div class="sm" style="padding:4px 0;line-height:1.7">' + (i + 1) + '. ' + h(b) + '</div>';
        }).join('') + '</div>' +
        '<p class="sm mt" style="line-height:1.8;color:#BE0E16"><b>Cấm:</b> ' + h(s.cam) + '</p>' +
        '<p class="tiny dim mt" style="line-height:1.7"><b>Bài học ghi sẵn:</b> ' + h(s.hoc) + '</p></div>';
    }).join('');

    o += U.sec('Sáu điều cấm tuyệt đối năm đầu', 'Vì năm đầu định hình chín mươi chín năm còn lại.');
    o += '<div class="card">' + (G.ND_CAM || []).map(function (c) {
      return '<div style="padding:8px 0;border-bottom:1px solid var(--gita-vien-2)">' +
        '<b class="sm">' + c.no + '. ' + h(c.t) + '</b>' +
        '<p class="tiny dim mt" style="line-height:1.7">' + h(c.y) + '</p></div>';
    }).join('') + '</div>';
    return o;
  };
})();
