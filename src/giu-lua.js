/* ═══════════════════════════════════════════════════════════════
   GITA 365 — MÁY CHẠY LỚP ÉP CỦA NGƯỜI GIỮ LỬA

   Kho chuẩn ở kho-goc/data.giu-lua.js. Ba hàm ở đây làm việc thật, phần
   còn lại chỉ dựng màn:

   1. glMucDoc() — đọc Màn Sức Sống theo BỐN mức, không phải hai màu.
      Mức khó nhất là "xanh nhưng hạ ba tuần liền": con số vẫn trên
      ngưỡng nên bảng hai màu không báo gì, mà cây thì đang mất nhiệt.
      Hình dạng quan trọng hơn vị trí.

   2. glLeoTang() — chuông quá hạn thì TỰ leo tầng. Leo tự động vì leo
      thủ công là leo khi có người nhớ, mà lúc bận thì không ai nhớ.

   3. glSoiLS() — bắt chỉ số di sản nào vừa không có nguồn số vừa không
      khai là chưa đo được. Một con số bịa nguy hiểm hơn một ô trống,
      vì ô trống thì còn có người đi tìm.

   VÌ SAO glSoiBan() TỒN TẠI

   Bàn điều khiển có năm màn và đúng ba mươi phút. Không ai định thêm
   màn thứ sáu — nhưng mọi bàn điều khiển trên đời đều có màn thứ sáu
   sau ba năm, và không ai nhớ nó vào lúc nào. Hàm này đếm, và bộ kiểm
   phát hành đỏ khi con số đổi.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;
G.VIEWS = G.VIEWS || {};

(function () {
  var U = G.U, h = U.h;

  /* ─── Đọc Màn Sức Sống ───
     `pt` là tỉ lệ hạt nứt vỏ bảy ngày hôm nay; `haTuan` là số tuần liên
     tiếp con số ấy đi xuống. Trên ngưỡng mà hạ đủ ba tuần thì trả về
     mức HA — đây là mức mọi bảng hai màu bỏ sót. */
  G.glMucDoc = function (pt, haTuan) {
    var ds = G.GL_MUC1 || [];
    var so = Number(pt);
    var ha = Number(haTuan) || 0;
    var xanh = null, hoi = null;
    for (var i = 0; i < ds.length; i++) {
      var m = ds[i];
      if (so < m.tu || so > m.den) continue;
      if (m.haTuan) { if (ha >= m.haTuan) hoi = m; }
      else if (!xanh) xanh = m;
    }
    return hoi || xanh || null;
  };

  /* ─── Chuông: tầng này quá hạn chưa ───
     Trả về tầng phải leo lên, hoặc null khi còn trong hạn. Tầng cuối
     không leo nữa — quyết định cứu đã nằm sẵn trong luật. */
  G.glAndonTang = function (ma) {
    var ds = G.GL_ANDON || [];
    for (var i = 0; i < ds.length; i++) if (ds[i].ma === ma) return ds[i];
    return null;
  };

  G.glLeoTang = function (ma, gioDaQua, daCham) {
    var t = G.glAndonTang(ma);
    if (!t) return null;
    if (daCham) return null;
    if (Number(gioDaQua) < t.gio) return null;
    var ds = G.GL_ANDON || [];
    for (var i = 0; i < ds.length; i++) if (ds[i].tang === t.tang + 1) return ds[i];
    return null;                       /* tầng cuối: không leo nữa */
  };

  /* ─── Bàn điều khiển còn đúng khuôn không ───
     Đếm màn, cộng phút, và soi thứ tự. Ba con số này không được trôi. */
  G.glSoiBan = function () {
    var b = G.GL_BAN, man = G.TT_MAN || [];
    if (!b || !man.length) return [];
    var loi = [];
    if (man.length !== b.soMan) loi.push('số màn=' + man.length);
    var tong = man.reduce(function (a, m) { return a + (m.phut || 0); }, 0);
    if (tong > b.phutChuan) loi.push('tổng phút=' + tong);
    if (!man.every(function (m, i) { return m.so === i + 1; })) loi.push('thứ tự lệch');
    return loi;
  };

  /* ─── Chỉ số di sản: cái nào chưa có nguồn ───
     Mỗi chỉ số hoặc trỏ vào một kho CÓ THẬT, hoặc khai thẳng chưa đo
     được kèm thiếu đúng cái gì. Vừa không có nguồn vừa không khai thì
     đó là một con số sẽ được bịa vào một ngày nào đó. */
  G.glSoiLS = function () {
    return (G.GL_LS || []).filter(function (x) {
      if (x.chuaDo) return !x.thieu;                 /* khai thì phải nói thiếu gì */
      return !x.nguon || G[x.nguon] === undefined;   /* không khai thì nguồn phải có thật */
    }).map(function (x) { return x.ma + (x.chuaDo ? ':khai suông' : '→' + (x.nguon || 'trống')); });
  };

  G.glChuaDo = function () {
    return (G.GL_LS || []).filter(function (x) { return x.chuaDo; });
  };

  /* ─── Chỉ số nào của người giữ lửa làm đẹp bằng tay được ───
     Chỉ số không nói được vì sao không làm đẹp được thì nó làm đẹp
     được, và sớm muộn sẽ bị làm đẹp. */
  G.glSoiKPI = function () {
    return (G.GL_KPI || []).filter(function (k) { return !k.doBang || !k.khongLamDep; })
      .map(function (k) { return k.ma; });
  };

  /* ─── Cơn bão nào ép được vào cơ chế có thật ───
     `ep` trỏ vào tên kho hoặc hàm. Bão nào trỏ vào chỗ trống thì đó là
     một cảnh báo văn chương: nó nghe đáng sợ mà không thử được gì. */
  G.mpSoiBao = function () {
    return (G.MP_BAO || []).filter(function (b) { return !b.ep || G[b.ep] === undefined; })
      .map(function (b) { return b.ma + '→' + (b.ep || 'trống'); });
  };

  /* ─── Phép đo phẩm giá, chạy THẬT từ hôm nay ───
     Ba dấu hiệu đọc từ CỜ máy đọc được trong chính luật hệ đang khai,
     không đọc từ câu văn và không cần một hồ sơ nhân tạo nào.

     Vì sao đọc cờ chứ không dò chữ: dò chữ trong câu văn thì ai đó sửa
     một chữ là phép đo câm mà không ai biết — và một phép đo câm về
     phẩm giá là thứ nguy hiểm nhất trong cả bộ kiểm. */
  G.mpDocCo = function (duong) {
    var phan = String(duong || '').split('.');
    var goc = G[phan[0]];
    if (goc === undefined) return undefined;
    if (Array.isArray(goc)) {
      var ma = phan[1];
      goc = goc.filter(function (x) { return x.ma === ma; })[0];
      if (!goc) return undefined;
      return goc[phan[2]];
    }
    for (var i = 1; i < phan.length; i++) {
      if (goc === undefined || goc === null) return undefined;
      goc = goc[phan[i]];
    }
    return goc;
  };

  G.mpDoD2 = function () {
    var d2 = (G.MP_DO || []).filter(function (x) { return x.ma === 'D2'; })[0];
    if (!d2 || !d2.dauHieu) return null;
    var ra = d2.dauHieu.map(function (d) {
      return { ma: d.ma, t: d.t, co: d.co, chan: G.mpDocCo(d.co) === true };
    });
    return { dau: ra, dat: ra.every(function (x) { return x.chan; }),
      ho: ra.filter(function (x) { return !x.chan; }).map(function (x) { return x.ma; }) };
  };

  /* ─── Phép đo nào chạy được, phép nào chờ bộ chạy ───
     Khai ra để không ai tưởng cả năm phép đều đang đo. */
  G.mpChayDuoc = function () { return (G.MP_DO || []).filter(function (x) { return x.chayDuoc; }); };
  G.mpChuaChay = function () { return (G.MP_DO || []).filter(function (x) { return !x.chayDuoc; }); };

  /* ─── Ngưỡng khủng hoảng nào không bao giờ kêu được ───
     Kịch bản có `nguongTyLe` phải nằm DƯỚI trần đã ép. Ngưỡng trên
     trần là ngưỡng chết: nó không bao giờ chạm tới, nên nó chỉ làm
     người ta yên tâm mà không bảo vệ ai. Chính lỗi này đã có thật ở
     bản 9.14 — ngưỡng ghi mười lăm trên một trong khi trần là năm. */
  G.glSoiNguongChet = function () {
    var tran = G.ddTranCua ? G.ddTranCua('DH') : 0;
    if (!tran) return [];
    return (G.GL_SUCO || []).filter(function (s) {
      return s.nguongTyLe !== undefined && s.nguongTyLe > tran;
    }).map(function (s) { return s.ma + ':' + s.nguongTyLe + '>' + tran; });
  };

  /* ═══════════ MÀN: NGÀY HỆ NÀY XONG VIỆC ═══════════
     Một màn, hai tầng sâu — cùng khuôn với màn người đi cùng. Gia đình
     đọc được NĂM ĐIỀU KIỆN XONG, vì đó là câu hứa mạnh nhất của cả hệ:
     nó được dựng để một ngày nhà mình không cần nó nữa. Giấu câu ấy đi
     thì hệ trông như một thứ muốn giữ người mãi. */
  G.VIEWS['giu-lua'] = function () {
    if (!G.GL_XONG)
      return U.empty('Chưa mở được phần này', 'Phần này nằm trong gói nền. Đăng nhập lại để nạp.');

    var o = U.ph({ eyebrow: 'NGÀY HỆ NÀY XONG VIỆC', ic: 'sun', grad: 1,
      t: 'Thành công cao nhất là ngày nhà mình không cần hệ này nữa',
      lead: 'Giống cha mẹ thành công nhất là khi con tự lập. Giống người thầy giỏi nhất là khi học trò ' +
        'không còn cần thầy — nhưng giữ được cách thầy dạy mình yêu.' });

    o += U.sec('Năm điều kiện xong', ((G.GL_XONG_LUAT || {}).cot || ''));
    o += '<div class="card mb">' + (G.GL_XONG || []).map(function (x) {
      return '<div style="padding:9px 0;border-bottom:1px solid var(--gita-vien-2)">' +
        '<b class="sm">' + x.so + '. ' + h(x.ten) + '</b>' +
        '<p class="sm dim mt" style="line-height:1.8">' + h(x.t) + '</p></div>';
    }).join('') + '</div>';
    o += '<p class="tiny dim mb" style="line-height:1.7">' + h((G.GL_XONG_LUAT || {}).camEp || '') + '</p>';

    /* ── Phần của nghề ── */
    if (!G.GL_BAN) return o;

    var b = G.GL_BAN, ban = G.glSoiBan();
    o += U.sec('Trần của bàn điều khiển', (b.viSaoTran || ''));
    o += '<div class="card mb" style="border-color:' + (ban.length ? '#BE0E16' : '#0B7350') + '2e">' +
      '<div class="row wrap" style="gap:16px">' +
      '<b>' + b.soMan + ' màn</b><b>' + b.phutChuan + ' phút</b>' +
      '<b>quá ' + b.phutDong + ' phút thì hệ tự đóng bàn</b>' +
      '<span class="tiny" style="margin-left:auto;color:' + (ban.length ? '#BE0E16' : '#0B7350') + '">' +
      (ban.length ? 'LỆCH: ' + h(ban.join(' · ')) : 'đúng khuôn') + '</span></div>' +
      '<p class="sm mt" style="line-height:1.8"><b>Giấy đỏ:</b> ' + h(b.giayDo) + '</p>' +
      '<p class="sm mt" style="line-height:1.8"><b>Ngoại lệ duy nhất:</b> ' + h(b.ngoaiLe) + '</p>' +
      '<p class="tiny dim mt" style="line-height:1.7">' + h(b.viSaoCamMan6) + '</p></div>';

    o += U.tbl(['Cấm trên bàn điều khiển', 'Vì sao'],
      (G.GL_BAN_CAM || []).map(function (x) { return [h(x.t), h(x.y)]; }));

    o += U.sec('Màn Sức Sống đọc bốn mức', ((G.GL_MUC1_LUAT || {}).cot || '') + ' ' +
      ((G.GL_MUC1_LUAT || {}).vi || ''));
    o += (G.GL_MUC1 || []).map(function (m) {
      return '<div class="card mb" style="border-color:' + m.c + '2e">' +
        '<div class="row wrap" style="gap:10px;align-items:baseline">' +
        '<b class="sm" style="color:' + m.c + '">' + h(m.ten) + '</b>' +
        '<span class="tiny muted">' + m.tu + '–' + m.den + '%' +
        (m.haTuan ? ' và hạ ' + m.haTuan + ' tuần liền' : '') + '</span></div>' +
        '<p class="sm mt" style="line-height:1.8">' + h(m.lam) + '</p></div>';
    }).join('');
    o += '<p class="tiny dim mb" style="line-height:1.7"><b>Lỗi năm đầu:</b> ' +
      h((G.GL_MUC1_LUAT || {}).loiNamDau || '') + '</p>';

    o += U.sec('Chuông ba tầng', ((G.GL_ANDON_LUAT || {}).luat || ''));
    o += U.tbl(['Tầng', 'Khi nào', 'Hạn người thật chạm', 'Ai nhận', 'Làm gì', 'Leo khi'],
      (G.GL_ANDON || []).map(function (t) {
        return [h(t.ten), h(t.khi), t.gio + ' giờ', h(t.aiNhan), h(t.lam), h(t.leoKhi)];
      }));
    o += '<p class="tiny dim mb" style="line-height:1.7">' + h((G.GL_ANDON_LUAT || {}).vi || '') + ' ' +
      h((G.GL_ANDON_LUAT || {}).camBamThay || '') + '</p>';

    o += U.sec('Năm chỉ số của chính người giữ lửa',
      ((G.GL_KPI_LUAT || {}).cot || '') + ' ' + ((G.GL_KPI_LUAT || {}).luat || ''));
    o += U.tbl(['Chỉ số', 'Mức', 'Đo bằng', 'Vì sao không làm đẹp bằng tay được'],
      (G.GL_KPI || []).map(function (k) { return [h(k.ten), h(k.muc), h(k.doBang), h(k.khongLamDep)]; }));

    o += U.sec('Sáu kịch bản sự cố', ((G.GL_SUCO_LUAT || {}).cot || ''));
    o += U.tbl(['Mã', 'Kịch bản', 'Dấu hiệu sớm', 'Làm gì', 'Vì sao', 'Diễn tập'],
      (G.GL_SUCO || []).map(function (s) {
        return [h(s.ma), h(s.ten), h(s.dauHieu), h(s.lam), h(s.vi), s.tap ? 'mỗi năm' : 'không'];
      }));
    o += '<p class="tiny dim mb" style="line-height:1.7">' + h((G.GL_SUCO_LUAT || {}).luuBaNoi || '') + '</p>';

    /* ── Sổ đo di sản: in cả chỗ CHƯA đo được ──
       Bảng nào chỉ in phần đã đo thì đọc xong tưởng hệ đã đo hết. */
    var chuaDo = G.glChuaDo();
    o += U.sec('Sổ đo di sản', ((G.GL_LS_LUAT || {}).vi || ''));
    o += U.tbl(['Mã', 'Đo gì', 'Ngưỡng đỏ', 'Nguồn số', 'Vì sao đo'],
      (G.GL_LS || []).map(function (x) {
        return [h(x.ma), h(x.do), x.doNgo + (x.ma === 'LS5' ? '' : '%'),
          x.chuaDo ? 'CHƯA ĐO ĐƯỢC — thiếu: ' + h(x.thieu) : h(x.nguon),
          h(x.viDoNam3 || x.viSao || '')];
      }));
    if (chuaDo.length)
      o += '<div class="card mb" style="border-color:#B4720F2e">' +
        '<b class="sm">' + chuaDo.length + ' trên ' + (G.GL_LS || []).length + ' chỉ số di sản CHƯA đo được</b>' +
        '<p class="tiny dim mt" style="line-height:1.7">' + h((G.GL_LS_LUAT || {}).luatKhai || '') + '</p></div>';

    var hd = G.GL_HOPDEN || {};
    o += U.sec('Hộp đen', 'Niêm phong, chỉ mở khi hệ sụp hoàn toàn. Tối đa ' + hd.trangToiDa +
      ' trang — đủ ngắn để bất kỳ ai đọc xong trong một giờ. Viết tay, ' + hd.capNhatNam + ' năm cập nhật một lần.');
    o += '<div class="card mb">' + (hd.giu || []).map(function (t, i) {
      return '<div class="sm" style="padding:6px 0;line-height:1.8">' + (i + 1) + '. ' + h(t) + '</div>';
    }).join('') + '<p class="tiny dim mt" style="line-height:1.7">' + h(hd.viSaoVietTay || '') + '</p></div>';

    /* ── Chuẩn mô phỏng, và chỗ chưa dựng ──
       In cả phần CHƯA dựng. Bảng chỉ in phần đã dựng thì đọc xong
       tưởng hệ đã thử hết. */
    if (G.MP_DO) {
      var d2 = G.mpDoD2(), chuaChay = G.mpChuaChay(), baoLech = G.mpSoiBao();
      o += U.sec('Chuẩn mô phỏng', ((G.MP_BAY || {}).quyen || ''));
      o += '<div class="card mb" style="border-color:' + (d2 && d2.dat ? '#0B7350' : '#BE0E16') + '3e">' +
        '<span class="tiny up" style="color:' + (d2 && d2.dat ? '#0B7350' : '#BE0E16') + '">PHÉP ĐO PHẨM GIÁ · CHẠY THẬT TỪ HÔM NAY</span>' +
        (d2 ? d2.dau.map(function (x) {
          return '<div class="sm mt" style="line-height:1.8">' + (x.chan ? '✓' : '✗') + ' ' + h(x.t) +
            ' <span class="tiny muted">— chặn bởi ' + h(x.co) + '</span></div>';
        }).join('') : '') +
        '<p class="tiny dim mt" style="line-height:1.7">Ba dấu hiệu này đọc từ CỜ máy đọc được trong chính luật hệ đang khai, ' +
        'không cần một hồ sơ nhân tạo nào. Dò chữ trong câu văn thì sửa một chữ là phép đo câm.</p></div>';

      o += U.tbl(['Mã', 'Phép đo', 'Chạy được chưa', 'Đậu', 'Gãy'],
        (G.MP_DO || []).map(function (d) {
          return [h(d.ma), h(d.ten), d.chayDuoc ? 'chạy thật' : 'CHỜ BỘ CHẠY', h(d.dau), h(d.gay)];
        }));

      o += U.tbl(['Mã', 'Cơn bão', 'Mạnh', 'Ép vào cơ chế'],
        (G.MP_BAO || []).map(function (b) { return [h(b.ma), h(b.ten), h(b.manh), h(b.ep)]; }));
      if (baoLech.length)
        o += '<div class="card mb" style="border-color:#BE0E162e"><b class="sm">Bão trỏ vào chỗ trống: ' +
          h(baoLech.join(' · ')) + '</b></div>';
      o += '<p class="tiny dim mb" style="line-height:1.7"><b>Cặp bão nguy hiểm nhất:</b> ' +
        h((G.MP_CHONG || []).map(function (c) { return c.cap; }).join(' · ')) + ' — ' +
        h((G.MP_CHONG_LUAT || {}).cot || '') + '</p>';

      if ((G.MP_CHUA || []).length) {
        o += '<div class="card mb" style="border-color:#B4720F3e">' +
          '<b class="sm">' + (G.MP_CHUA || []).length + ' thứ CHƯA dựng, và ' +
          chuaChay.length + ' trên ' + (G.MP_DO || []).length + ' phép đo chờ bộ chạy</b>' +
          (G.MP_CHUA || []).map(function (c) {
            return '<div class="sm mt" style="line-height:1.8"><b>' + h(c.t) + '</b> — thiếu: ' + h(c.thieu) +
              (c.vi ? '<div class="tiny dim">' + h(c.vi) + '</div>' : '') + '</div>';
          }).join('') +
          '<p class="tiny dim mt" style="line-height:1.7">' + h((G.MP_CHUA_LUAT || {}).cot || '') + ' ' +
          h((G.MP_CHUA_LUAT || {}).vi || '') + '</p></div>';
      }
    }

    o += U.sec('Bảy luật của người giữ lửa', '');
    o += '<div class="card">' + (G.GL_LUAT || []).map(function (l) {
      return '<div style="padding:8px 0;border-bottom:1px solid var(--gita-vien-2)">' +
        '<b class="sm">' + l.no + '. ' + h(l.t) + '</b>' +
        '<p class="tiny dim mt" style="line-height:1.7">' + h(l.y) + '</p></div>';
    }).join('') + '</div>';
    return o;
  };
})();
