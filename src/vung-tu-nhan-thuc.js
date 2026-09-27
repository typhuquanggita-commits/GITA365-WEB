/* ═══════════════════════════════════════════════════════════════
   GITA 365 — MÁY CHẠY SÁU VÙNG

   Kho chuẩn ở kho-goc/data.vung-tu-nhan-thuc.js.

   HAI VIỆC: KHOÁ, VÀ KHAI THÁC.

   ═══ KHOÁ ═══

   Bức tranh sáu vòng là đề nghị thang thứ sáu. Bản 9.21 đã viết sẵn
   luật cho tình huống này, nên không bàn lại — sáu vùng vào dạng LỚP
   SÂU.

   Nhưng luật ấy mới nói bằng chữ. vzSoiNoi() là chỗ nó thành hàm: năm
   vùng khớp MỘT-MỘT với năm tầng, không vùng nào không có tầng, không
   tầng nào có hai vùng. Một lớp sâu không khớp một-một thì nó đang tự
   trở thành thang, và trở thành thang từ từ là cách không ai kịp nhận
   ra.

   vzSoiLoi() canh chỗ thứ hai: vùng nào cũng phải khai CẦN LÕI. Bức
   tranh đặt tự nhận thức ở tâm chứ không ở bậc đầu, và đó là chỗ nó
   sửa lại một điều tôi đã xếp sai. Vùng không cần lõi là vùng leo được
   mà không cần nhìn lại mình.

   ═══ KHAI THÁC ═══

   htDuong() ở bản trước trả về tầng đang đứng và một thử thách kế tiếp.
   Nay nó trả thêm hai thứ mà máy cũ không nói được:

     · nhà mình đang CẢM THẤY ở vùng nào — khác với đang được giao gì
     · chỗ rơi nào rình sẵn ở vùng ấy, kèm dấu hiệu để nhận ra

   Đây là chỗ dữ liệu mới trả công cho máy cũ: không thêm màn nào, chỉ
   làm một hàm đã có nói được câu nó chưa nói được.

   ═══ VÌ SAO CHỖ RƠI PHẢI NHẬN RA BẰNG DẤU HIỆU ═══

   Điểm gãy đã có ở lớp kim cương là khoảnh khắc — báo trước theo lịch
   được. Chỗ rơi là một chỗ Ở, và người đang nằm trong đó tưởng mình vẫn
   đang đi.

   Báo theo lịch thì báo trượt đúng người cần báo nhất: người rơi vào
   "đủ rồi" không thấy mình đang khổ, nên không có ngày nào để đánh dấu
   trên lịch. Chỉ có dấu hiệu bắt được họ — số liệu đẹp lên trong khi
   số việc lần đầu làm bằng không.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;
G.VIEWS = G.VIEWS || {};

(function () {
  var U = G.U, h = U.h;
  var MA_TANG = ['T1', 'T2', 'T3', 'T4', 'T5'];

  /* ═══════════ KHOÁ: LỚP SÂU PHẢI KHỚP MỘT-MỘT ═══════════ */
  G.vzSoiNoi = function () {
    var ds = G.VZ_VUNG || [], loi = [], thay = {};
    if (ds.length !== MA_TANG.length)
      loi.push('số vùng=' + ds.length + ', số tầng=' + MA_TANG.length);
    ds.forEach(function (v) {
      if (!v.tang || MA_TANG.indexOf(v.tang) < 0) { loi.push(v.ma + '→' + (v.tang || 'trống')); return; }
      if (thay[v.tang]) loi.push(v.tang + ':hai vùng cùng một tầng');
      thay[v.tang] = v.ma;
      if (!v.la || !v.dauHieuDangO || !v.viecRaKhoi) loi.push(v.ma + ':thiếu cột');
    });
    /* Tầng nào không có vùng thì lớp sâu này đang phủ hụt — và phủ hụt
       là bước đầu của việc nó tách ra thành thang riêng. */
    MA_TANG.forEach(function (m) { if (!thay[m]) loi.push(m + ':không vùng nào phủ'); });
    /* Và lõi KHÔNG được đếm là một vùng */
    if ((G.VZ_LOI || {}).khongPhaiTang !== true) loi.push('lõi chưa khai không phải tầng');
    if (ds.some(function (v) { return v.ma === 'TUNHANTHUC'; })) loi.push('lõi bị xếp thành một vùng');
    return loi;
  };

  /* Vùng nào cũng cần lõi. Vùng không cần lõi là vùng giả được. */
  G.vzSoiLoi = function () {
    var loi = [];
    if ((G.VZ_LOI || {}).moiVungDeuCan !== true) loi.push('lõi chưa khai mọi vùng đều cần');
    (G.VZ_VUNG || []).forEach(function (v) {
      if (v.canLoi !== true) loi.push(v.ma + ':không cần lõi');
    });
    return loi;
  };

  G.vzVungCua = function (tang) {
    return (G.VZ_VUNG || []).filter(function (v) { return v.tang === tang; })[0] || null;
  };

  /* ═══════════ CHỖ RƠI ═══════════ */
  G.vzSoiRoi = function () {
    var ds = G.VZ_ROI || [], loi = [], thay = {};
    var vung = (G.VZ_VUNG || []).filter(function (v) { return !v.vungCuoi; });
    if (ds.length !== vung.length)
      loi.push('số chỗ rơi=' + ds.length + ', số vùng có lối rơi=' + vung.length);
    ds.forEach(function (r) {
      var v = (G.VZ_VUNG || []).filter(function (x) { return x.ma === r.tuVung; })[0];
      if (!v) { loi.push(r.ma + '→' + (r.tuVung || 'trống') + ':vùng không có thật'); return; }
      /* Vùng cuối không có chỗ rơi — ra khỏi nó là đổi vai, không phải rơi */
      if (v.vungCuoi) loi.push(r.ma + ':gắn vào vùng cuối, mà vùng cuối không có lối rơi');
      if (thay[r.tuVung]) loi.push(r.tuVung + ':hai chỗ rơi cùng một vùng');
      thay[r.tuVung] = r.ma;
      /* Chỗ rơi không có đường về là một lời chẩn đoán, không phải một
         cơ chế — và chẩn đoán không có thuốc thì tệ hơn không chẩn đoán. */
      if (!r.duongVe) loi.push(r.ma + ':không có đường về');
      if (!r.dauHieu || !r.doBang) loi.push(r.ma + ':không nhận ra được bằng gì');
      if (!r.viSaoRoiVao) loi.push(r.ma + ':không nói vì sao rơi vào');
    });
    /* Chữ bản gốc không đọc rõ thì phải khai là không đọc rõ */
    ds.forEach(function (r) {
      if (r.banGocKhongRo && !/KHÔNG đoán/.test(String(r.banGocKhongRo)))
        loi.push(r.ma + ':khai chữ mờ mà không nói rõ là không đoán');
    });
    return loi;
  };

  /* `dau` là sổ dấu hiệu dạng { vietLanDau: 0, dutChuoiSauKhiBatDau: 2, ... }.
     Thiếu sổ thì hàm nói CHƯA ĐO ĐƯỢC — đoán một nhà đang rơi rồi nhắn
     cho họ là chuyện làm hỏng lòng tin nhanh nhất. */
  G.vzRoiVao = function (tang, dau) {
    var v = G.vzVungCua(tang);
    if (!v) return null;
    if (v.vungCuoi)
      return { vungCuoi: true, y: 'Vùng cuối không có lối rơi. Ra khỏi đây là đổi vai, không phải rơi.' };
    var r = (G.VZ_ROI || []).filter(function (x) { return x.tuVung === v.ma; })[0];
    if (!r) return null;
    if (!dau || typeof dau !== 'object')
      return { chuaDo: true, rinhSan: r.ten, dauHieu: r.dauHieu,
        y: 'Chưa có sổ dấu hiệu. Chưa đo thì chỉ nói chỗ rơi nào RÌNH SẴN, không nói nhà mình đã rơi.' };
    var roi = false;
    if (r.ma === 'ROIRAM') roi = Number(dau.vietLanDau) === 0;
    else if (r.ma === 'HOANGMANG') roi = Number(dau.batRoiBuong) >= 2;
    else if (r.ma === 'NGHINGO') roi = Number(dau.hoiLai) > 0;
    else if (r.ma === 'DUROI') roi = Number(dau.vietLanDau) === 0 && dau.soLieuDep === true;
    return { chuaDo: false, roi: roi, ma: r.ma, ten: r.ten, la: r.la,
      viSaoRoiVao: r.viSaoRoiVao, duongVe: r.duongVe, doBang: r.doBang,
      y: roi ? 'Nhà mình đang nằm ở đây. ' + r.duongVe
             : 'Chưa rơi. Chỗ này vẫn rình sẵn ở vùng ' + v.ten + '.' };
  };

  /* ═══════════ KHAI THÁC: LÀM HÀM CŨ NÓI ĐƯỢC CÂU MỚI ═══════════
     Bọc htDuong() của bản trước, thêm vùng và chỗ rơi. Không dựng hàm
     thứ hai trả lời cùng câu hỏi — bọc thì một nguồn, dựng thì hai. */
  G.htDuongDayDu = function (soToi, dau) {
    if (typeof G.htDuong !== 'function') return null;
    var d = G.htDuong(soToi);
    if (!d || d.chuaDo) return d;
    var v = G.vzVungCua(d.tang);
    d.vung = v ? { ma: v.ma, ten: v.ten, la: v.la, dauHieuDangO: v.dauHieuDangO,
      viecRaKhoi: v.viecRaKhoi } : null;
    d.canLoi = (G.VZ_LOI || {}).la || null;
    d.choRoi = G.vzRoiVao(d.tang, dau);
    return d;
  };

  /* ═══════════════════════════════════════════════════════════
     MÀN HÌNH
     ═══════════════════════════════════════════════════════════ */
  G.VIEWS['sau-vung'] = function () {
    if (!G.VZ_VUNG)
      return U.empty('Chưa mở được phần này', 'Phần này nằm trong gói nền. Đăng nhập lại để nạp.');

    var loi = G.VZ_LOI || {};
    var o = U.ph({ eyebrow: 'SÁU VÙNG · MỘT LÕI', ic: 'compass', grad: 1,
      t: 'Vòng luẩn quẩn có tên thì đi ra được',
      lead: 'Năm vùng nhà mình đi qua, và bốn chỗ rơi rình sẵn giữa các vùng. ' +
        'Chỗ có tên là chỗ gọi được; chỗ gọi được là chỗ ra được.' });

    o += G.kaKhung ? G.kaKhung('sau-vung', 'dau') : '';

    /* ── Lõi ── */
    o += '<div class="card mb" style="border-color:#D4703A5e">' +
      '<span class="tiny up" style="color:#D4703A">' + h(loi.ten || '') + ' · ' + h(loi.oDau || '') + '</span>' +
      '<p class="mt" style="line-height:1.9"><b>' + h(loi.la || '') + '</b></p>' +
      '<p class="sm mt" style="line-height:1.8">' + h(loi.vi || '') + '</p>' +
      '<p class="tiny dim mt" style="line-height:1.7">' + h(loi.toiDaXepSai || '') + '</p>' +
      '<p class="tiny mt" style="line-height:1.7;color:#BE0E16"><b>' + h(loi.hauQuaNeuBo || '') + '</b></p></div>';

    /* ── Năm vùng ── */
    var sn = G.vzSoiNoi();
    o += U.sec('Năm vùng' + (sn.length ? ' — LỆCH: ' + (sn.join(' ')) : ''),
      ((G.VZ_VUNG_LUAT || {}).cot || ''));
    o += (G.VZ_VUNG || []).map(function (v) {
      return '<div class="card mb" style="border-color:' + v.c + '5e">' +
        '<span class="tiny up" style="color:' + v.c + '">' + h(v.ten) + ' · TẦNG ' + h(v.tang.slice(1)) + '</span>' +
        '<p class="mt" style="line-height:1.9"><b>' + h(v.la) + '</b></p>' +
        '<p class="tiny dim mt" style="line-height:1.7">' + (v.tuKhoa || []).map(function (t) { return h(t); }).join(' · ') + '</p>' +
        '<p class="sm mt" style="line-height:1.8"><b>Dấu hiệu đang ở đây:</b> ' + h(v.dauHieuDangO) + '</p>' +
        '<p class="sm mt" style="line-height:1.8"><b>Việc ra khỏi:</b> ' + h(v.viecRaKhoi) + '</p>' +
        '<p class="tiny mt" style="line-height:1.7"><b>Thử thách của tầng này:</b> ' + h(v.thuThachTang) + '</p></div>';
    }).join('');
    o += '<p class="tiny dim mb" style="line-height:1.7"><b>' +
      h((G.VZ_VUNG_LUAT || {}).khongPhaiThang || '') + '</b> ' +
      h((G.VZ_VUNG_LUAT || {}).vi || '') + '</p>';

    /* ── Bốn chỗ rơi ── */
    o += G.kaKhung ? G.kaKhung('sau-vung', 'sau-roi') : '';

    var sr = G.vzSoiRoi();
    o += U.sec('Bốn chỗ rơi có tên' + (sr.length ? ' — LỆCH: ' + (sr.join(' ')) : ''),
      ((G.VZ_ROI_LUAT || {}).nguoiTrongDoKhongBiet || ''));
    o += (G.VZ_ROI || []).map(function (r) {
      var v = (G.VZ_VUNG || []).filter(function (x) { return x.ma === r.tuVung; })[0] || {};
      return '<div class="card mb" style="border-color:' + r.c + '3e">' +
        '<span class="tiny up" style="color:' + r.c + '">' + h(r.ten) +
        ' · rơi từ ' + h(v.ten || r.tuVung) + (r.nguyHiemNhat ? ' · NGUY HIỂM NHẤT' : '') + '</span>' +
        '<p class="mt" style="line-height:1.9"><b>' + h(r.la) + '</b></p>' +
        '<p class="sm mt" style="line-height:1.8"><b>Dấu hiệu:</b> ' + h(r.dauHieu) + '</p>' +
        '<p class="sm mt" style="line-height:1.8"><b>Vì sao rơi vào:</b> ' + h(r.viSaoRoiVao) + '</p>' +
        '<p class="sm mt" style="line-height:1.8;color:' + r.c + '"><b>Đường về:</b> ' + h(r.duongVe) + '</p>' +
        '<p class="tiny dim mt" style="line-height:1.7">Đo bằng: ' + h(r.doBang) + '</p>' +
        (r.banGocKhongRo ? '<p class="tiny mt" style="line-height:1.7;color:#B4720F"><b>Chữ bản gốc:</b> ' +
          h(r.banGocKhongRo) + '</p>' : '') + '</div>';
    }).join('');
    o += '<p class="tiny dim mb" style="line-height:1.7"><b>' +
      h((G.VZ_ROI_LUAT || {}).camDungLamDiem || '') + '</b> ' +
      h((G.VZ_ROI_LUAT || {}).vi || '') + '</p>';

    o += U.sec('Sáu luật của sáu vùng', '');
    o += '<div class="card">' + (G.VZ_LUAT || []).map(function (l) {
      return '<div style="padding:8px 0;border-bottom:1px solid var(--gita-vien-2)">' +
        '<b class="sm">' + l.no + '. ' + h(l.t) + '</b>' +
        '<p class="tiny dim mt" style="line-height:1.7">' + h(l.y) + '</p></div>';
    }).join('') + '</div>';
    return o;
  };
})();
