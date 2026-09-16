/* ═══════════════════════════════════════════════════════════════
   GITA 365 — MÁY CHẠY MÀN DIỄN THỬ

   Kho ở kho-goc/data.dien-thu.js. Toàn bộ ở gói NGHỀ.

   ═══ MÀN NÀY LÀ MỘT BÀI KIỂM, KHÔNG PHẢI MỘT BẢN GHI ═══

   Bên trái là hội thoại. Bên phải là đường truy của từng lượt: câu ấy
   lấy từ kho nào, qua bộ lọc nào, và CÂU DỄ NÓI mà luật cấm.

   Cột phải mới là cột đáng đọc. Một câu trả lời hay đọc lên thì không
   biết nó hay ở đâu — đọc câu đáng lẽ đã nói mới thấy chỗ luật chặn.

   ═══ SÁU CÁI KHOÁ ═══

   dtSoiLuot()      mỗi bài đúng hai mươi lượt, mỗi lượt có kho và có lọc.
   dtSoiLoc()       số bộ lọc nêu ở mỗi lượt phải có thật trong BV_LOC.
   dtSoiDo()        số hiệu tín hiệu đỏ phải có thật trong BV_DO.
   dtSoiCamKy()     mỗi bài có ít nhất một lượt chuyển cho người.
   dtSoiKetQua()    không bài nào kết thúc bằng một hợp đồng.
   dtSoiCauCam()    không câu nào của trợ lý hứa kết quả, chẩn đoán,
                    nhận mình là người, hay nêu một con số tiền.

   Khoá cuối đọc CHÍNH LỜI TRỢ LÝ trong kho. Khai luật mà lời vẫn phạm
   thì luật là lời suông — cùng cách blvSoiKhongTuGui() đã làm.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;
G.VIEWS = G.VIEWS || {};

(function () {
  var U = G.U, h = U.h;

  G.dtBai = function (ma) {
    var ds = G.DTH_BAI || [];
    if (!ds.length) return { chuaDo: true, thieu: 'DTH_BAI' };
    if (!ma) return { ds: ds };
    return ds.filter(function (x) { return x.ma === ma; })[0] || { khongCo: true, ma: ma };
  };

  /* Đếm lượt máy làm và lượt chuyển người — con số này phải hiện, vì nó
     là câu trả lời thật cho "tự động bao nhiêu phần trăm". */
  G.dtDo = function (ma) {
    var b = G.dtBai(ma);
    if (!b || b.chuaDo || b.khongCo) return b;
    var l = b.luot || [];
    return {
      ma: b.ma, tong: l.length,
      may: l.filter(function (x) { return !x.nguoi; }).length,
      nguoi: l.filter(function (x) { return x.nguoi; }).length,
      imLang: l.filter(function (x) { return x.imLang; }).length,
      do: l.reduce(function (s, x) { return s.concat(x.do || []); }, [])
           .filter(function (v, i, a) { return a.indexOf(v) === i; }),
      loc: l.reduce(function (s, x) { return s.concat(x.loc || []); }, [])
            .filter(function (v, i, a) { return a.indexOf(v) === i; }).sort(function (a, b2) { return a - b2; })
    };
  };

  /* ═══════════ KHOÁ 1: HAI MƯƠI LƯỢT, MỖI LƯỢT CÓ NGUỒN ═══════════ */
  G.dtSoiLuot = function () {
    var ds = G.DTH_BAI || [], loi = [];
    if (!ds.length) return { chuaDo: true, thieu: 'DTH_BAI', loi: [] };
    ds.forEach(function (b) {
      var l = b.luot || [];
      if (l.length !== 20) loi.push(b.ma + ' có ' + l.length + ' lượt, phải 20');
      l.forEach(function (x) {
        if (!x.khach) loi.push(b.ma + ' lượt ' + x.so + ' thiếu lời khách');
        /* Lượt im lặng KHÔNG có lời máy, và đó là chủ ý. */
        if (!x.imLang && !x.may) loi.push(b.ma + ' lượt ' + x.so + ' thiếu lời trợ lý');
        if (x.imLang && x.may) loi.push(b.ma + ' lượt ' + x.so + ' khai im lặng mà vẫn có lời');
        if (!x.tu) loi.push(b.ma + ' lượt ' + x.so + ' chưa khai lấy từ kho nào');
        if (!(x.loc || []).length) loi.push(b.ma + ' lượt ' + x.so + ' chưa khai qua bộ lọc nào');
        if (!x.khongNoi) loi.push(b.ma + ' lượt ' + x.so + ' chưa khai câu dễ nói mà luật cấm');
      });
      ['khach', 'vanDe', 'viKho', 'ketQua'].forEach(function (k) {
        if (!b[k]) loi.push(b.ma + ' thiếu ô ' + k);
      });
    });
    if (!(G.DTH_LUAT || {}).oKhongNoi) loi.push('chưa khai vì sao ô khongNoi là ô đắt nhất');
    return { chuaDo: false, loi: loi, so: ds.length };
  };

  /* ═══════════ KHOÁ 2 và 3: LỌC VÀ TÍN HIỆU PHẢI CÓ THẬT ═══════════ */
  G.dtSoiLoc = function () {
    var ds = G.DTH_BAI || [], boLoc = G.BV_LOC || [], loi = [];
    if (!ds.length || !boLoc.length)
      return { chuaDo: true, thieu: !ds.length ? 'DTH_BAI' : 'BV_LOC', loi: [] };
    var co = {}; boLoc.forEach(function (x) { co[x.no] = 1; });
    ds.forEach(function (b) {
      (b.luot || []).forEach(function (x) {
        (x.loc || []).forEach(function (n) {
          if (!co[n]) loi.push(b.ma + ' lượt ' + x.so + ' nêu bộ lọc #' + n + ' không có thật');
        });
      });
    });
    /* Bộ lọc số 4 — nói rõ máy hay người — phải xuất hiện ở lượt ĐẦU của
       mỗi bài. Nói ra ở lượt thứ mười thì chín lượt trước đã để khách
       tưởng mình đang nói với người. */
    ds.forEach(function (b) {
      var dau = (b.luot || [])[0] || {};
      if ((dau.loc || []).indexOf(4) < 0)
        loi.push(b.ma + ' lượt đầu không qua bộ lọc #4 — khách chưa biết mình đang nói với máy');
    });
    return { chuaDo: false, loi: loi, so: boLoc.length };
  };

  G.dtSoiDo = function () {
    var ds = G.DTH_BAI || [], bvdo = G.BV_DO || [], loi = [];
    if (!ds.length || !bvdo.length)
      return { chuaDo: true, thieu: !ds.length ? 'DTH_BAI' : 'BV_DO', loi: [] };
    var co = {}; bvdo.forEach(function (x) { co[x.so] = x; });
    ds.forEach(function (b) {
      (b.luot || []).forEach(function (x) {
        (x.do || []).forEach(function (n) {
          if (!co[n]) { loi.push(b.ma + ' lượt ' + x.so + ' nêu tín hiệu #' + n + ' không có thật'); return; }
          /* Hạn giờ nêu trong lượt phải KHỚP hạn của tín hiệu, không tự đặt. */
          if (x.hanGio && String(co[n].hanGio).replace(/\s/g, '') !== String(x.hanGio).replace(/\s/g, ''))
            loi.push(b.ma + ' lượt ' + x.so + ' ghi hạn "' + x.hanGio + '" mà BV_DO #' + n +
              ' ghi "' + co[n].hanGio + '"');
        });
      });
    });
    return { chuaDo: false, loi: loi };
  };

  /* ═══════════ KHOÁ 4: MỖI BÀI PHẢI CÓ LƯỢT CHUYỂN NGƯỜI ═══════════

     Một bài diễn mà máy chạy trọn hai mươi lượt là một bài dạy rằng máy
     làm được hết — trái đúng bốn luật đã chốt, và dạy sai đúng chỗ nguy
     hiểm nhất. */
  G.dtSoiCamKy = function () {
    var ds = G.DTH_BAI || [], loi = [];
    if (!ds.length) return { chuaDo: true, thieu: 'DTH_BAI', loi: [] };
    ds.forEach(function (b) {
      var ng = (b.luot || []).filter(function (x) { return x.nguoi; });
      if (!ng.length) loi.push(b.ma + ' không có lượt nào chuyển cho người');
      ng.forEach(function (x) {
        if (x.chuyenChoNguoi === undefined && !x.hanGio && x.so === (b.luot || []).length)
          loi.push(b.ma + ' lượt cuối chuyển người mà không nói chuyển cho ai');
      });
      /* Lượt cuối phải là lượt có người. Kết ở một lượt máy nghĩa là bài
         diễn kết thúc với máy đang giữ ca. */
      var cuoi = (b.luot || [])[(b.luot || []).length - 1];
      if (cuoi && !cuoi.nguoi) loi.push(b.ma + ' kết ở một lượt máy — ca vẫn nằm trong tay máy');
    });
    if (!(G.DTH_LUAT || {}).phaiCoLuotChuyenNguoi)
      loi.push('chưa khai luật phải có lượt chuyển người');
    return { chuaDo: false, loi: loi };
  };

  /* ═══════════ KHOÁ 5: KHÔNG BÀI NÀO CHỐT ĐƠN ═══════════ */
  G.dtSoiKetQua = function () {
    var ds = G.DTH_BAI || [], loi = [];
    if (!ds.length) return { chuaDo: true, thieu: 'DTH_BAI', loi: [] };
    ds.forEach(function (b) {
      if (/đã ký|chốt hợp đồng|ký hợp đồng|đóng tiền|chuyển khoản xong/i.test(String(b.ketQua)))
        loi.push(b.ma + ' kết thúc bằng một hợp đồng');
      if (!b.ketQua) loi.push(b.ma + ' chưa khai kết quả');
    });
    if (!(G.DTH_LUAT || {}).khongCaNaoChotDon) loi.push('chưa khai luật không ca nào chốt đơn');
    return { chuaDo: false, loi: loi };
  };

  /* ═══════════ KHOÁ 6: ĐỌC CHÍNH LỜI TRỢ LÝ ═══════════

     Bốn điều Trợ lý AI bị cấm tuyệt đối, soi thẳng trong lời đã viết.
     Khai luật mà lời vẫn phạm thì luật là lời suông. */
  G.dtSoiCauCam = function () {
    var ds = G.DTH_BAI || [], loi = [];
    if (!ds.length) return { chuaDo: true, thieu: 'DTH_BAI', loi: [] };
    /* ═══ BA LẦN TÔI VIẾT PHÉP KIỂM NÀY SAI CÙNG MỘT KIỂU ═══

       Bản đầu bắt cả câu PHỦ ĐỊNH: "bên em KHÔNG nhận việc cam kết điểm
       số" bị tính là hứa kết quả, và "em vẫn không hứa được" cũng vậy.
       Tức là nó phạt đúng hai câu làm được việc mà nó dựng ra để bảo vệ.

       Và mẫu tiền có \btr\b để bắt "5tr" — nó bắt luôn "Tầng 1 trở đi",
       vì trong JavaScript chữ "ở" không phải ký tự từ nên "tr" đứng
       trước nó là một biên từ. Bỏ hẳn mẫu viết tắt: bắt hụt vài câu còn
       hơn kêu sai ba câu, vì một phép kiểm kêu sai sẽ bị tắt.

       Nên mỗi mẫu nay có MỘT CẶP: câu phải bắt, và câu KHÔNG được bắt.
       Cặp ấy chạy mỗi lần mở màn. Mẫu nào hỏng một trong hai vế thì
       chính nó đỏ, trước khi nó kịp phán ai. */
    function coPhuDinh(cau, vt) {
      /* Nhìn lui bốn mươi ký tự: có "không · chưa · cấm · né" thì câu ấy
         đang TỪ CHỐI làm điều bị cấm, không phải đang làm nó. */
      return /\b(không|chưa|cấm|đừng)\b/i.test(cau.slice(Math.max(0, vt - 40), vt));
    }
    var cam = [
      { ten: 'hứa kết quả',
        re: /(cam kết|bảo đảm|đảm bảo|chắc chắn sẽ|hứa)\s+\S/i,
        bat: 'Bên em cam kết cháu sẽ lên hai điểm ạ.',
        khongBat: 'Bên em KHÔNG nhận việc cam kết điểm số ạ.' },
      { ten: 'nêu một con số tiền',
        re: /\d[\d.,]*\s*(triệu|nghìn|đồng)\b/i,
        bat: 'Chặng này là 20 triệu ạ.',
        khongBat: 'Từ ngày thứ tư của Tầng 1 trở đi em bị cấm nhắc tới chặng có tiền.' },
      { ten: 'nhận mình là người',
        re: /em là (một )?(người|chuyên viên|chuyên gia|bác sĩ|tư vấn viên)/i,
        bat: 'Em là chuyên viên tư vấn của Học viện ạ.',
        khongBat: 'Em là trợ lý của Học viện, không phải người ạ.' },
      { ten: 'chẩn đoán',
        /* Giữa "cháu đang" và tên trạng thái thường còn một cụm đệm —
           "có dấu hiệu", "gặp vấn đề về". Bản đầu tôi viết liền nhau nên
           mẫu không bắt được chính câu thử của mình, và phép tự kiểm
           đỏ ngay. Đó là lý do phép tự kiểm phải có. */
        re: /(cháu|con|bé)\s+(đang|bị|có)\b[^.?!]{0,28}(trầm cảm|rối loạn|mất động lực|khủng hoảng tâm lý)/i,
        bat: 'Cháu đang có dấu hiệu trầm cảm ạ.',
        khongBat: 'Em chưa gặp cháu, em không kết luận gì về cháu cả.' }
    ];

    /* Mẫu tự kiểm trước khi kiểm người khác. */
    cam.forEach(function (c) {
      var m1 = c.re.exec(c.bat);
      if (!m1 || coPhuDinh(c.bat, m1.index))
        loi.push('mẫu "' + c.ten + '" đã chết — câu phạm rõ ràng vẫn lọt');
      var m2 = c.re.exec(c.khongBat);
      if (m2 && !coPhuDinh(c.khongBat, m2.index))
        loi.push('mẫu "' + c.ten + '" kêu nhầm — câu từ chối làm điều cấm bị tính là phạm');
    });

    ds.forEach(function (b) {
      (b.luot || []).forEach(function (x) {
        var noi = String(x.may || '');
        cam.forEach(function (c) {
          var m = c.re.exec(noi);
          if (m && !coPhuDinh(noi, m.index))
            loi.push(b.ma + ' lượt ' + x.so + ' — lời trợ lý phạm điều cấm: ' + c.ten +
              ' ("' + m[0] + '")');
        });
      });
    });
    return { chuaDo: false, loi: loi, soCam: cam.length };
  };

  /* ═══════════════════════════════════════════════════════════
     MÀN HÌNH
     ═══════════════════════════════════════════════════════════ */
  G.VIEWS['dien-thu'] = function () {
    if (!G.DTH_BAI)
      return U.empty('Chưa mở được phần này',
        'Màn diễn thử nằm trong gói nghề. Đăng nhập bằng tài khoản có quyền nghề để nạp.');

    var loi = G.DTH_LOI || {};
    var lech = [].concat(G.dtSoiLuot().loi || [], G.dtSoiLoc().loi || [], G.dtSoiDo().loi || [],
      G.dtSoiCamKy().loi || [], G.dtSoiKetQua().loi || [], G.dtSoiCauCam().loi || []);

    var o = U.ph({ eyebrow: 'DIỄN THỬ · KIỂM CHỨNG CHẤT LƯỢNG', ic: 'chat', grad: 1,
      t: 'Hai buổi khó nhất, ghi lại từng lượt',
      lead: loi.la || '' });

    o += '<div class="card mb" style="border-color:' + (lech.length ? '#BE0E16' : '#0B667556') + '">' +
      '<b class="sm" style="color:#B4720F">' + h(loi.oDatNhat || '') + '</b>' +
      '<p class="tiny mt" style="line-height:1.75">' + h(loi.khongCaNaoChotDon || '') + '</p>' +
      (lech.length ? '<p class="tiny mt" style="line-height:1.7;color:#BE0E16"><b>LỆCH: ' +
        h(lech.join(' · ')) + '</b></p>'
        : '<p class="tiny mt" style="line-height:1.7;color:#0B6675">Sáu khoá xanh — mỗi lượt có ' +
          'kho, có bộ lọc, có câu bị cấm; tín hiệu đỏ và hạn giờ khớp bảng gốc.</p>') + '</div>';

    o += G.kaKhung ? G.kaKhung('dien-thu', 'dau') : '';

    (G.DTH_BAI || []).forEach(function (b) {
      var d = G.dtDo(b.ma);
      o += U.sec(b.loai + ' — ' + b.ten, b.khach);

      o += '<div class="card mb" style="border-color:#5140B456">' +
        '<div style="display:flex;flex-wrap:wrap;gap:16px;align-items:baseline">' +
        [['LƯỢT', d.tong, '#5140B4'], ['MÁY LÀM', d.may, '#0B6675'],
         ['CHUYỂN NGƯỜI', d.nguoi, '#B4720F'], ['TÍN HIỆU ĐỎ', (d.do || []).join(' ') || '—', '#BE0E16']]
          .map(function (x) {
            return '<div style="min-width:130px"><span class="tiny up dim">' + x[0] + '</span><br>' +
              '<b style="font-size:1.4em;color:' + x[2] + '">' + h(String(x[1])) + '</b></div>';
          }).join('') + '</div>' +
        '<p class="tiny mt" style="line-height:1.75"><b>Giọng khách:</b> ' + h(b.giong) + '</p>' +
        '<p class="tiny" style="line-height:1.75"><b>Vấn đề:</b> ' + h(b.vanDe) + '</p>' +
        '<p class="tiny" style="line-height:1.75;color:#BE0E16"><b>Chạm luật:</b> ' +
        h(b.vaoBoLoc) + '</p>' +
        '<p class="tiny" style="line-height:1.75;color:#B4720F"><b>Vì sao khó:</b> ' +
        h(b.viKho) + '</p>' +
        '<p class="tiny mt" style="line-height:1.75;color:#0B6675"><b>Kết quả:</b> ' +
        h(b.ketQua) + '</p>' +
        '<p class="tiny dim mt" style="line-height:1.75">Bộ lọc đã dùng: #' +
        h((d.loc || []).join(' · #')) + '</p></div>';

      o += '<div class="card mb">' + (b.luot || []).map(function (x) {
        var s = '<div style="padding:14px 0;border-bottom:1px solid var(--gita-vien-2)">' +
          '<span class="tiny up dim">LƯỢT ' + x.so + '</span>' +
          (x.nguoi ? ' <span class="tiny up" style="color:#B4720F">CHUYỂN NGƯỜI</span>' : '') +
          (x.do && x.do.length ? ' <span class="tiny up" style="color:#BE0E16">ĐỎ ' +
            h(x.do.join(' ')) + (x.hanGio ? ' · hạn ' + h(x.hanGio) : '') + '</span>' : '') +

          '<p class="sm mt" style="line-height:1.75;padding-left:12px;border-left:3px solid var(--gita-vien-2)">' +
          '<b>Khách:</b> ' + h(x.khach) + '</p>' +

          (x.imLang
            ? '<p class="sm mt" style="line-height:1.75;padding-left:12px;border-left:3px solid #B4720F;color:#B4720F">' +
              '<b>Trợ lý:</b> <i>— không nói gì —</i></p>'
            : '<p class="sm mt" style="line-height:1.75;padding-left:12px;border-left:3px solid #0B6675">' +
              '<b>Trợ lý:</b> ' + h(x.may) + '</p>') +

          '<div class="mt" style="padding:8px 10px;background:var(--gita-nen-2)">' +
          '<p class="tiny" style="line-height:1.7"><b>Lấy từ:</b> ' + h(x.tu) + '</p>' +
          '<p class="tiny" style="line-height:1.7"><b>Qua bộ lọc:</b> ' +
          (x.loc || []).map(function (n) {
            var f = (G.BV_LOC || []).filter(function (y) { return y.no === n; })[0] || {};
            return '#' + n + ' ' + h(f.hoi || '');
          }).join(' · ') + '</p>' +
          '<p class="tiny" style="line-height:1.7;color:#BE0E16"><b>Câu dễ nói mà luật cấm:</b> ' +
          h(x.khongNoi) + '</p>' +
          (x.chuyenChoNguoi ? '<p class="tiny" style="line-height:1.7;color:#B4720F">' +
            '<b>Chuyển cho:</b> ' + h(x.chuyenChoNguoi) + '</p>' : '') +
          '</div></div>';
        return s;
      }).join('') + '</div>';
    });

    o += U.sec('Luật của màn này', '');
    var dl = G.DTH_LUAT || {};
    o += '<div class="card mb">' + Object.keys(dl).map(function (k) {
      return '<p class="tiny" style="line-height:1.75;padding:4px 0">• ' + h(dl[k]) + '</p>';
    }).join('') + '</div>';

    o += G.kaKhung ? G.kaKhung('dien-thu', 'cuoi') : '';
    return o;
  };
})();
