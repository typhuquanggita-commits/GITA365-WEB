/* ═══════════════════════════════════════════════════════════════
   GITA 365 — MÁY CHẠY LỚP CẢM XÚC

   Kho chuẩn ở kho-goc/data.trai-tim.js. Tệp này là phần CHẠY, và phần
   chạy quan trọng nhất là MÙA ĐỜI — nó không phải một nhãn hiển thị, nó
   thật sự đổi cách hệ thống chấm và cách chuỗi được tính.

   BA VIỆC MÙA ĐỜI LÀM THẬT

   1. HẠ CHUẨN — ttNhipCanGiu() trả về những nhịp còn phải giữ, và
      khKpiNgay() chấm trên đúng những nhịp ấy. Mùa đông thì mẫu số chỉ
      còn một nhịp, nên ghi được một dòng là đạt một trăm phần trăm.
      Không phải an ủi — là mẫu số đổi thật.

   2. GIỮ CHUỖI — ngày trống nằm trong mùa đông hoặc mùa mưa KHÔNG làm
      đứt chuỗi. Đà đã có không bị xoá vì một chuyện nhà mình không chọn.
      Nhưng ngày ấy cũng KHÔNG được tính là ngày có ghi: bảo vệ thì bảo
      vệ, không phát không.

   3. CÓ HẠN — hết hạn thì hệ thống hỏi lại, không tự gia hạn. Mùa khó
      kéo dài vô hạn thì thành cái cớ, và cái cớ ăn mất chính thứ nó định
      bảo vệ.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;
G.VIEWS = G.VIEWS || {};

(function () {
  var U = G.U, h = U.h, ic = U.ic;
  var NGAY = 86400000;

  G.TT_LYDO_TOITHIEU = 20;

  function muaCua(ma) {
    var ds = G.TT_MUA || [];
    for (var i = 0; i < ds.length; i++) if (ds[i].ma === ma) return ds[i];
    return null;
  }
  function ngayCua(ts) {
    var d = new Date(ts);
    return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
  }

  /* ─── Mùa hiện tại ───
     Mùa phải được KHAI, không đoán từ dữ liệu. Đoán sai thì hệ thống hạ
     chuẩn cho một nhà đang lười, còn nhà đang khó thật thì không được hạ.
     Hết hạn thì trả về mùa thường kèm cờ `hetHan` để màn hình hỏi lại —
     không tự gia hạn, cũng không lặng lẽ bỏ. */
  G.ttMuaCua = function (luc) {
    var t = luc || Date.now();
    var m = G.S.mua;
    var thuong = muaCua('THUONG');
    if (!m || !m.ma) return { mua: thuong, khai: false, hetHan: false, conNgay: 0 };
    var d = muaCua(m.ma);
    if (!d) return { mua: thuong, khai: false, hetHan: false, conNgay: 0 };
    var daQua = Math.floor((t - (m.tu || t)) / NGAY);
    var het = d.hanNgay > 0 && daQua >= d.hanNgay;
    return { mua: het ? thuong : d, khai: !het, hetHan: het, daQua: daQua,
      conNgay: d.hanNgay ? Math.max(0, d.hanNgay - daQua) : 0, vi: m.vi || '', khaiMa: m.ma };
  };

  /* ─── Khai mùa ─── */
  G.ttKhaiMua = function (ma, viSao) {
    var d = muaCua(ma);
    if (!d) return { ok: false, loi: 'Không có mùa nào mang mã ấy.' };
    var v = String(viSao || '').trim();
    if (d.ma !== 'THUONG' && v.length < G.TT_LYDO_TOITHIEU)
      return { ok: false, loi: 'Cần một dòng nói rõ nhà mình đang gặp chuyện gì, ít nhất ' +
        G.TT_LYDO_TOITHIEU + ' ký tự. Khai mùa là một việc của chính nhà mình, không phải một cái nút.' };
    if (d.ma === 'THUONG') {
      /* Ra khỏi mùa khó thì ghi lại thành một VẾT — bằng chứng đã từng vượt qua */
      var cu = G.S.mua;
      if (cu && cu.ma && cu.ma !== 'THUONG') {
        G.S.vet = G.S.vet || [];
        G.S.vet.push({ mua: cu.ma, tu: cu.tu, den: Date.now(),
          ngay: Math.floor((Date.now() - (cu.tu || Date.now())) / NGAY), vi: cu.vi || '' });
      }
      G.S.mua = null;
    } else {
      G.S.mua = { ma: d.ma, tu: Date.now(), vi: v };
    }
    if (G.save) G.save();
    return { ok: true, mua: d };
  };

  /* ─── Những nhịp còn phải giữ hôm nay ───
     khKpiNgay() chấm trên đúng danh sách này. Mùa đông thì mẫu số chỉ còn
     một nhịp — ghi được một dòng là đạt đủ, và con số ấy nói thật chứ
     không phải nói cho vui. */
  G.ttNhipCanGiu = function () {
    var t = G.ttMuaCua();
    return (t.mua && t.mua.giuMa) || ['KH-1', 'KH-2', 'KH-3', 'KH-4', 'KH-5'];
  };

  /* ─── Ngày này có được bảo vệ chuỗi không ───
     Chỉ những ngày NẰM TRONG một mùa đã khai và mùa ấy có `chuoi:false`.
     Đọc từ sổ mùa đang khai và sổ vết đã đóng, nên nó đúng cả với quá khứ. */
  G.ttNgayDuocGiuChuoi = function (ngay) {
    var ds = [];
    var m = G.S.mua;
    if (m && m.ma) { var d = muaCua(m.ma); if (d && !d.chuoi) ds.push({ tu: m.tu, den: Date.now() }); }
    (G.S.vet || []).forEach(function (v) {
      var d2 = muaCua(v.mua); if (d2 && !d2.chuoi) ds.push({ tu: v.tu, den: v.den });
    });
    if (!ds.length) return false;
    var t = new Date(ngay + 'T12:00:00').getTime();
    return ds.some(function (k) { return t >= (k.tu || 0) && t <= (k.den || 0); });
  };

  /* ─── Bậc cảm xúc hiện tại ───
     Nối vào cấp độ bánh đà, không dựng thang riêng. Hai thang song song
     thì sẽ có ngày lệch nhau, và lúc ấy không ai biết tin cái nào. */
  G.ttBacCamXuc = function () {
    var cap = G.bdCap ? G.bdCap().cap : 0;
    var b = cap === 0 ? 1 : cap <= 2 ? 2 : cap <= 4 ? 3 : cap <= 6 ? 4 : cap <= 8 ? 5 : cap <= 9 ? 6 : 7;
    return (G.TT_CAMXUC || []).filter(function (x) { return x.b === b; })[0] || null;
  };

  /* ─── Soi lớp này: mỗi bậc cảm xúc có cơ chế CÓ THẬT không ───
     `bom` liệt kê tên hàm hoặc tên kho, cách nhau bằng dấu chấm giữa.
     Bậc nào trỏ vào thứ không tồn tại thì đó là văn chương, không phải
     cơ chế — và bộ kiểm phát hành bắt nó. */
  G.ttSoiCoChe = function () {
    var thieu = [];
    (G.TT_CAMXUC || []).forEach(function (x) {
      var ten = String(x.bom || '').split('·')[0].split(' ')[0].trim();
      if (!ten) { thieu.push(x.ma + ':trống'); return; }
      if (G[ten] === undefined) thieu.push(x.ma + '→' + ten);
    });
    return thieu;
  };

  /* ═══════════ MÀN: MÙA CỦA NHÀ MÌNH ═══════════ */
  G.VIEWS['mua-doi'] = function () {
    if (!G.TT_MUA)
      return U.empty('Chưa mở được phần mùa', 'Phần này nằm trong gói nền. Đăng nhập lại để nạp.');

    var t = G.ttMuaCua();
    var giu = G.ttNhipCanGiu();
    var bac = G.ttBacCamXuc();
    var vet = G.S.vet || [];

    var o = U.ph({ eyebrow: 'MÙA CỦA NHÀ MÌNH', ic: 'shield', grad: 1,
      t: 'Cây vẫn lớn trong mùa gió — rễ đang làm việc',
      lead: 'Nhà nào cũng có mùa khó. Ở đây mùa khó không bị chấm bằng thước của người đang khoẻ: ' +
        'chuẩn hạ xuống thật, và ngày trống trong mùa đông không xoá mất đà nhà mình đã có.' });

    /* Hết hạn thì hỏi lại, không tự gia hạn và cũng không lặng lẽ bỏ */
    if (t.hetHan) {
      o += '<div class="card mb" style="border-color:#B4720F2e">' +
        '<b>Mùa ' + h((muaCua(t.khaiMa) || {}).ten || '') + ' đã hết hạn</b>' +
        '<p class="sm dim mt" style="line-height:1.8">Nhà mình đã khai mùa này ' + t.daQua + ' ngày trước. ' +
        'Hệ thống không tự gia hạn — mùa khó kéo dài vô hạn thì thành cái cớ, và cái cớ ăn mất chính thứ nó định bảo vệ.</p>' +
        '<p class="sm mt" style="line-height:1.8">Nhà mình còn đang trong mùa ấy thì khai lại. Đã qua rồi thì chọn Mùa thường — ' +
        'và hệ thống ghi lại thành một VẾT, để mùa khó lần sau có bằng chứng rằng nhà mình từng vượt qua.</p></div>';
    }

    o += '<div class="card mb" style="border-color:' + t.mua.c + '2e">' +
      '<div class="row wrap" style="gap:10px;align-items:baseline">' +
      '<span style="color:' + t.mua.c + '">' + ic(t.mua.ic, 'w-5 h-5') + '</span>' +
      '<b>' + h(t.mua.ten) + '</b>' +
      (t.khai && t.conNgay ? '<span class="tiny muted" style="margin-left:auto">còn ' + t.conNgay + ' ngày rồi hệ thống hỏi lại</span>' : '') +
      '</div>' +
      '<p class="sm mt" style="line-height:1.8">' + h(t.mua.y) + '</p>' +
      (t.vi ? '<p class="tiny dim mt">Nhà mình đã ghi: ' + h(t.vi) + '</p>' : '') +
      '<p class="sm mt" style="line-height:1.8"><b>Hôm nay cần giữ ' + giu.length + ' trên 5 nhịp:</b> ' +
      h((G.CV_KH_NGAY || []).filter(function (x) { return giu.indexOf(x.ma) >= 0; })
        .map(function (x) { return x.ten; }).join(' · ')) + '</p>' +
      (t.mua.chuoi === false
        ? '<p class="sm mt" style="line-height:1.8;color:#0B7350"><b>Chuỗi của nhà mình được giữ:</b> ' +
          'ngày trống trong mùa này không làm đứt chuỗi. Đà đã có không bị xoá vì một chuyện nhà mình không chọn.</p>'
        : '') + '</div>';

    /* Khai mùa — năm lựa chọn, nói thẳng mỗi mùa hạ xuống mấy nhịp */
    o += U.sec('Nhà mình đang mùa nào', 'Khai mùa là việc của chính nhà mình. Hệ thống không tự đoán — đoán sai thì hạ chuẩn nhầm người.');
    o += '<div class="grid g2 mb">' + (G.TT_MUA || []).map(function (m) {
      var dang = m.ma === t.mua.ma;
      return '<div class="card" style="border-color:' + m.c + (dang ? '3e' : '18') + '">' +
        '<div class="row wrap" style="gap:8px;align-items:baseline">' +
        '<b class="sm" style="color:' + m.c + '">' + h(m.ten) + '</b>' +
        (dang ? '<span class="tiny up" style="margin-left:auto;color:' + m.c + '">ĐANG Ở ĐÂY</span>' : '') + '</div>' +
        '<p class="tiny dim mt" style="line-height:1.7"><b>Khi nào:</b> ' + h(m.khi) + '</p>' +
        '<p class="tiny mt" style="line-height:1.7">Giữ ' + m.nhip + '/5 nhịp' +
        (m.chuoi === false ? ' · chuỗi được bảo vệ' : '') +
        (m.hanNgay ? ' · tối đa ' + m.hanNgay + ' ngày' : '') + '</p></div>';
    }).join('') + '</div>';

    if (bac) {
      o += '<div class="card mb" style="border-color:' + bac.c + '2e">' +
        '<span class="tiny up" style="color:' + bac.c + '">CHẶNG CẢM XÚC ' + bac.b + '/7 · ' + h(bac.ten) + '</span>' +
        '<p class="sm mt" style="line-height:1.8">' + h(bac.y) + '</p></div>';
    }

    if (vet.length) {
      o += U.sec('Sổ vết — những mùa nhà mình đã đi qua',
        ((G.TT_VET || {}).luat || ''));
      o += '<div class="card mb">' + vet.slice().reverse().map(function (v) {
        var m = muaCua(v.mua) || {};
        return '<div style="padding:7px 0;border-bottom:1px solid var(--gita-vien-2)">' +
          '<b class="sm" style="color:' + (m.c || '') + '">' + h(m.ten || v.mua) + '</b>' +
          '<span class="tiny muted"> · ' + v.ngay + ' ngày · ' + h(ngayCua(v.tu)) + '</span>' +
          (v.vi ? '<div class="tiny dim">' + h(v.vi) + '</div>' : '') + '</div>';
      }).join('') + '</div>';
    }

    o += U.sec('Chìa khoá nhỏ — vai chính thức đầu tiên của con',
      'Không phải việc vặt được giao. Là một vai CÓ TÊN, và người lớn không được làm thay — làm thay một lần thì con hiểu ngay vai ấy giả.');
    o += U.tbl(['Vai', 'Tuổi', 'Con làm gì', 'Người lớn KHÔNG được'],
      (G.TT_CHIAKHOA || []).map(function (k) {
        return [h(k.ten), h(k.tuoi), h(k.lam), h(k.camNguoiLon)];
      }));

    o += U.sec('Sáu luật của mùa', '');
    o += '<div class="card">' + (G.TT_MUA_LUAT || []).map(function (l) {
      return '<div style="padding:8px 0;border-bottom:1px solid var(--gita-vien-2)">' +
        '<b class="sm">' + l.no + '. ' + h(l.t) + '</b>' +
        '<p class="tiny dim mt" style="line-height:1.7">' + h(l.y) + '</p></div>';
    }).join('') + '</div>';
    return o;
  };

  /* ═══════════ MÀN: BÀN ĐIỀU KHIỂN NĂM MÀN ═══════════ */
  G.VIEWS['nam-man'] = function () {
    if (!G.TT_MAN)
      return U.empty('Chưa mở được bàn điều khiển',
        'Đây là công cụ điều hành nội bộ, nằm trong gói nghề.');

    var o = U.ph({ eyebrow: 'BÀN ĐIỀU KHIỂN NĂM MÀN', ic: 'orbit', grad: 1,
      t: 'Điều hành rừng bắt đầu bằng tưới cây, làm sổ sau',
      lead: 'Mở đúng thứ tự này mỗi sáng, tổng ba mươi phút. Thứ tự không phải cho gọn — ' +
        'nó là thứ tự ƯU TIÊN: màn một hỏng thì mọi kế hoạch trong ngày dừng lại.' });

    o += (G.TT_MAN || []).map(function (m) {
      return '<div class="card mb" style="border-color:' + m.c + '2e">' +
        '<div class="row wrap" style="gap:10px;align-items:baseline">' +
        '<span class="tiny up" style="color:' + m.c + '">MÀN ' + m.so + ' · ' + m.phut + ' PHÚT</span>' +
        '<b>' + h(m.ten) + '</b></div>' +
        '<p class="sm mt" style="line-height:1.8"><b>Hỏi:</b> ' + h(m.hoi) + '</p>' +
        '<p class="sm mt" style="line-height:1.8"><b>Ngưỡng:</b> ' + h(m.nguong) + '</p>' +
        '<p class="tiny dim mt" style="line-height:1.7">' + h(m.y) + '</p>' +
        '<p class="tiny muted mt">Đọc từ: ' + h(m.nguon) + '</p></div>';
    }).join('');

    o += U.sec('Ba cấp người đồng hành', 'Tuyển chính từ cây đã lớn.');
    o += U.tbl(['Cấp', 'Việc', 'Đào tạo', 'Chuẩn đo', 'Sai lầm cấm'],
      (G.TT_DONGHANH || []).map(function (d) {
        return [h(d.ten), h(d.viec), h(d.daoTao), h(d.chuan), h(d.camSai)];
      }));
    o += '<div class="card mb mt">' + (G.TT_DONGHANH_LUAT || []).map(function (l) {
      return '<div style="padding:8px 0;border-bottom:1px solid var(--gita-vien-2)">' +
        '<b class="sm">' + l.no + '. ' + h(l.t) + '</b>' +
        '<p class="tiny dim mt" style="line-height:1.7">' + h(l.y) + '</p></div>';
    }).join('') + '</div>';

    o += U.sec('Năm nhiệm kỳ, một trăm năm',
      'Nhiệm kỳ cuối làm đúng một việc: khiến hệ thống KHÔNG CẦN mình nữa.');
    o += (G.TT_NHIEMKY || []).map(function (n) {
      return '<div class="card mb" style="border-color:' + n.c + '2e">' +
        '<div class="row wrap" style="gap:10px;align-items:baseline">' +
        '<span class="tiny up" style="color:' + n.c + '">CHU KỲ ' + n.ck + ' · ' + h(n.nam) + '</span>' +
        '<b>' + h(n.ten) + '</b></div>' +
        '<p class="sm mt" style="line-height:1.8">' + h(n.lam) + '</p>' +
        '<p class="tiny mt" style="line-height:1.7;color:#0B7350"><b>Xong chu kỳ khi:</b> ' + h(n.xong) + '</p></div>';
    }).join('');

    var ct = G.TT_CONGTHUC || {};
    o += U.sec('Công thức bốn nhân tử', (ct.vi || ''));
    o += '<div class="card mb"><b>' + h(ct.cau || '') + '</b>' +
      '<div class="mt">' + (ct.yeuTo || []).map(function (y) {
        return '<div style="padding:7px 0;border-top:1px solid var(--gita-vien-2)">' +
          '<b class="sm">' + h(y.ten) + '</b> — ' + h(y.la) +
          '<div class="tiny muted">' + h(y.bang) + '</div></div>';
      }).join('') + '</div></div>';
    return o;
  };
})();
