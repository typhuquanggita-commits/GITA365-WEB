/* ═══════════════════════════════════════════════════════════════
   GITA 365 — MÁY CHẠY BIÊN NIÊN MỘT TRĂM NĂM

   Kho chuẩn ở kho-goc/data.bien-nien.js. Hàm quan trọng nhất là
   bnSoiTrucNgu(), và nó tồn tại vì một câu trong Phần X:

     "Cả năm điều Trục Ngũ phải được viết thành KIỂM THỬ TỰ ĐỘNG. Giá
      trị không sống nổi một trăm năm trong văn bản nếu không được kiểm
      một nghìn lần mỗi năm bằng máy."

   Câu ấy đúng, và nó đúng theo cách đau: mọi hiến pháp trên đời đều
   được viết ra rất hay rồi bị bào mòn từng chút một, không phải bị xé.
   Bào mòn thì không ai thấy, vì mỗi lần bào chỉ một chút và luôn có lý
   do chính đáng.

   Nên năm điều nền ở đây không nằm trong một bảng chữ. Mỗi điều trỏ vào
   một CỜ hoặc một HÀM SOI có thật, và bnSoiTrucNgu() chạy cả năm mỗi
   lần phát hành. Xoá lời hứa không bán dữ liệu là đỏ. Tắt cờ không phạt
   chuông là đỏ. Cho một nguồn tiền vượt nửa là đỏ.

   VÌ SAO bnSoiCuaMoRung() TỒN TẠI

   Bản gốc đặt cửa mở rừng hai ở "tự chủ từ năm mươi phần trăm" tại năm
   mười — trong khi đường tự chủ đã khai nói năm mười là chín mươi. Cửa
   thấp hơn mức mình đã tự hứa thì không chặn được ai.

   Đây là ngưỡng chết THỨ HAI tìm ra trong kho này. Cái thứ nhất là
   ngưỡng mười lăm nhà trên một người kèm, trong khi trần là năm. Cùng
   một hình dáng sai: một con số cứng viết ở chỗ này, một lời hứa viết ở
   chỗ kia, và không ai đặt hai thứ cạnh nhau.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;
G.VIEWS = G.VIEWS || {};

(function () {
  var U = G.U, h = U.h;

  /* ─── Đọc một bản ghi theo đường `KHO.ma` ─── */
  function banGhi(duong) {
    var p = String(duong || '').split('.');
    var kho = G[p[0]];
    if (!Array.isArray(kho)) return undefined;
    return kho.filter(function (x) { return x.ma === p[1]; })[0];
  }

  /* ─── NĂM ĐIỀU NỀN, CHẠY THÀNH PHÉP KIỂM ───
     Mỗi điều trả về `giu: true` khi cái canh nó còn nguyên. Điều nào
     không khai được cả ba kiểu canh thì tính là HỞ — một điều luật
     không có ai canh là một lời thề. */
  G.bnSoiTrucNgu = function () {
    var ds = (G.BN_TRUC5 || []).map(function (d) {
      var giu = null, bang = '';
      if (d.co) {
        giu = (G.mpDocCo ? G.mpDocCo(d.co) : undefined) === true;
        bang = 'cờ ' + d.co;
      } else if (d.ham) {
        var f = G[d.ham];
        giu = typeof f === 'function' && (f() || []).length === 0;
        bang = 'hàm ' + d.ham + '()';
      } else if (d.kho) {
        giu = banGhi(d.kho) !== undefined;
        bang = 'bản ghi ' + d.kho;
      } else {
        giu = false; bang = 'KHÔNG AI CANH';
      }
      return { ma: d.ma, so: d.so, t: d.t, giu: !!giu, bang: bang };
    });
    return { dieu: ds, dat: ds.every(function (x) { return x.giu; }),
      ho: ds.filter(function (x) { return !x.giu; }).map(function (x) { return x.ma; }) };
  };

  /* ─── Thập kỷ của một năm ───
     Năm ngoài khoảng một tới một trăm thì trả null, KHÔNG kẹp về đầu
     hay cuối. Kẹp là tự bịa ra một câu trả lời cho câu hỏi sai. */
  G.bnThapKyCua = function (nam) {
    var n = Number(nam);
    if (!n || n < 1 || n > 100) return null;
    var ds = G.BN_THAPKY || [];
    for (var i = 0; i < ds.length; i++) if (n >= ds[i].tu && n <= ds[i].den) return ds[i];
    return null;
  };

  /* ─── Mười thập kỷ có phủ kín một trăm năm không ───
     Không hở năm nào, không năm nào thuộc hai thập kỷ, và mỗi thập kỷ
     đúng MỘT nhiệm vụ. */
  G.bnSoiThapKy = function () {
    var ds = G.BN_THAPKY || [], loi = [];
    if (ds.length !== 10) loi.push('số thập kỷ=' + ds.length);
    for (var n = 1; n <= 100; n++) {
      var so = ds.filter(function (x) { return n >= x.tu && n <= x.den; }).length;
      if (so !== 1) { loi.push('năm ' + n + ':' + so); break; }
    }
    ds.forEach(function (x) {
      if (!x.viec || !x.sai || !x.moc) loi.push('TK' + x.tk + ':thiếu cột');
      /* Một nhiệm vụ, không hai. Dấu chấm phẩy hoặc chữ "và đồng thời"
         trong cột việc là dấu hiệu thập kỷ ấy đang gánh hai việc. */
      if (/;|đồng thời/.test(String(x.viec))) loi.push('TK' + x.tk + ':hai việc');
    });
    return loi;
  };

  /* ─── Năm rời vai có trùng năm cuối một nhiệm kỳ không ───
     Hai bảng nói về cùng một trăm năm: nhiệm kỳ nói người giữ lửa làm
     gì, thập kỷ nói cả rừng làm gì. Chúng phải khớp ở đúng một điểm —
     ngày trao tay. Lệch điểm ấy thì một trong hai bảng đang tưởng
     tượng ra một lịch sử khác. */
  G.bnSoiNamRoi = function () {
    var nam = (G.BN_THAPKY_LUAT || {}).namRoi;
    var nk = G.TT_NHIEMKY || [];
    if (!nam || !nk.length) return [];
    var khop = nk.some(function (n) {
      var m = String(n.nam || '').match(/(\d+)\s*[–-]\s*(\d+)/);
      return m && Number(m[2]) === nam;
    });
    return khop ? [] : ['năm rời ' + nam + ' không phải năm cuối nhiệm kỳ nào'];
  };

  /* ─── Cửa mở rừng hai có thấp hơn đường đã hứa không ───
     Cửa `theoDuong` KHÔNG ghi con số — nó đọc mức đã khai. Cửa nào ghi
     số cứng thì so với đường, và số cứng dưới đường là NGƯỠNG CHẾT:
     nó không bao giờ chặn được ai, nên nó chỉ làm người ta yên tâm. */
  G.bnMucTuChuNam = function (nam) {
    var ds = (G.TR_TUCHU || []).slice();
    var n = Number(nam) || 0, ra = null;
    ds.forEach(function (g) {
      var m = String(g.nam || '').match(/(\d+)/);
      if (m && n >= Number(m[1])) ra = g;
    });
    return ra ? ra.tuChuPt : null;
  };

  G.bnSoiCuaMoRung = function (nam) {
    var n = Number(nam) || 10;
    var muc = G.bnMucTuChuNam(n);
    if (muc === null) return [];
    return (G.BN_MORUNG || []).filter(function (c) {
      return c.pt !== undefined && c.pt < muc;
    }).map(function (c) { return 'cửa ' + c.so + ':' + c.pt + '<' + muc; });
  };

  G.bnCuaChuaDo = function () {
    return (G.BN_MORUNG || []).filter(function (c) { return c.chuaDo; });
  };

  /* ─── Cách chết nào chưa có thuốc trỏ vào cơ chế có thật ───
     `thuoc` mở đầu bằng tên một kho. Cách chết không trỏ được vào
     thuốc nào thì đó là một nỗi lo, không phải một rủi ro được quản. */
  G.bnSoiChet = function () {
    return (G.BN_CHET || []).filter(function (c) {
      if (!c.chuong || !c.thuoc) return true;
      var ten = String(c.thuoc).split(/[\s—·]/)[0].trim();
      return !ten || G[ten] === undefined;
    }).map(function (c) { return c.ma; });
  };

  /* ═══════════ MÀN: NĂM ĐIỀU KHÔNG AI ĐƯỢC SỬA ═══════════
     Một màn, hai tầng sâu. Gia đình đọc được TRỤC NGŨ — một hiến pháp
     mà người bị nó bảo vệ không đọc được thì không phải hiến pháp. */
  G.VIEWS['bien-nien'] = function () {
    if (!G.BN_TRUC5)
      return U.empty('Chưa mở được phần này', 'Phần này nằm trong gói nền. Đăng nhập lại để nạp.');

    var t5 = G.bnSoiTrucNgu();
    var o = U.ph({ eyebrow: 'NĂM ĐIỀU KHÔNG AI ĐƯỢC SỬA', ic: 'shield', grad: 1,
      t: 'Mỗi thế hệ viết lại mọi thứ — trừ năm điều',
      lead: 'Nhiệm vụ của thế hệ trước là chuyển giao QUYỀN VIẾT, không phải chuyển giao bản viết. ' +
        'Con người chỉ bảo vệ điều mình tham gia làm, không bảo vệ điều mình được trao.' });

    /* Trạng thái sống của hiến pháp — không phải bảng chữ */
    o += '<div class="card mb" style="border-color:' + (t5.dat ? '#0B7350' : '#BE0E16') + '3e">' +
      '<span class="tiny up" style="color:' + (t5.dat ? '#0B7350' : '#BE0E16') + '">' +
      'NĂM PHÉP KIỂM CHẠY THẬT MỖI LẦN PHÁT HÀNH · ' +
      t5.dieu.filter(function (x) { return x.giu; }).length + '/5 CÒN NGUYÊN</span>' +
      t5.dieu.map(function (x) {
        return '<div class="mt" style="line-height:1.9;padding-top:8px;border-top:1px solid var(--gita-vien-2)">' +
          '<b>' + (x.giu ? '✓' : '✗') + ' ' + x.so + '. ' + h(x.t) + '</b>' +
          '<div class="tiny muted">canh bằng ' + h(x.bang) + '</div></div>';
      }).join('') + '</div>';

    o += '<div class="card mb">' + (G.BN_TRUC5 || []).map(function (d) {
      return '<div style="padding:9px 0;border-bottom:1px solid var(--gita-vien-2)">' +
        '<b class="sm">' + d.so + '. ' + h(d.t) + '</b>' +
        '<p class="tiny mt" style="line-height:1.7">' + h(d.them) + '</p>' +
        '<p class="tiny dim mt" style="line-height:1.7">' + h(d.vi) + '</p></div>';
    }).join('') + '</div>';
    o += '<p class="tiny dim mb" style="line-height:1.7">' + h((G.BN_TRUC5_LUAT || {}).kiem || '') + '</p>';

    /* ── Phần của nghề ── */
    if (!G.BN_THAPKY) return o;

    var tkLoi = G.bnSoiThapKy(), cuaLoi = G.bnSoiCuaMoRung(10), chuaDo = G.bnCuaChuaDo();

    o += U.sec('Mười thập kỷ, mỗi thập kỷ đúng một nhiệm vụ',
      ((G.BN_THAPKY_LUAT || {}).luat || '') + (tkLoi.length ? ' LỆCH: ' + (tkLoi.join(' ')) : ''));
    o += U.tbl(['Thập kỷ', 'Năm', 'Thời kỳ', 'Nhiệm vụ sống còn', 'Làm bằng gì', 'Sai lầm chết người', 'Mốc'],
      (G.BN_THAPKY || []).map(function (x) {
        return [String(x.tk), x.tu + '–' + x.den, h(x.ten), h(x.viec), h(x.bang || '—'), h(x.sai), h(x.moc)];
      }));
    o += '<p class="tiny dim mb" style="line-height:1.7">' + h((G.BN_THAPKY_LUAT || {}).noiVoi || '') + '</p>';

    o += U.sec('Ba công việc đốt đồng của thập kỷ đầu',
      'Thập kỷ đầu hệ sống nhờ cá tính người dựng — và chính điều đó là thứ phải bị tiêu huỷ có chủ đích trong mười năm.');
    o += U.tbl(['Việc', 'Từ năm', 'Làm gì', 'Vì sao'],
      (G.BN_DOTDONG || []).map(function (x) {
        return [h(x.ten), String(x.tuNam), h(x.lam) + (x.doiKhi ? ' ' + h(x.doiKhi) : '') + (x.ghi ? ' ' + h(x.ghi) : ''), h(x.vi)];
      }));

    o += U.sec('Cửa mở rừng thứ hai', ((G.BN_MORUNG_LUAT || {}).chotTruoc || ''));
    o += '<div class="card mb" style="border-color:' + (cuaLoi.length ? '#BE0E16' : '#0B7350') + '2e">' +
      (G.BN_MORUNG || []).map(function (c) {
        return '<div style="padding:7px 0;border-bottom:1px solid var(--gita-vien-2)">' +
          '<b class="sm">' + c.so + '. ' + h(c.t) + '</b>' +
          (c.theoDuong ? '<span class="tiny up" style="color:#0B7350"> ĐỌC TỪ ĐƯỜNG TỰ CHỦ</span>' : '') +
          (c.chuaDo ? '<span class="tiny up" style="color:#B4720F"> CHƯA ĐO ĐƯỢC</span>' : '') +
          (c.thieu ? '<div class="tiny muted">thiếu: ' + h(c.thieu) + '</div>' : '') +
          (c.vi ? '<div class="tiny dim">' + h(c.vi) + '</div>' : '') + '</div>';
      }).join('') +
      '<p class="sm mt" style="line-height:1.8"><b>' + h((G.BN_MORUNG_LUAT || {}).cot || '') + '</b> ' +
      h((G.BN_MORUNG_LUAT || {}).vi || '') + '</p>' +
      (chuaDo.length ? '<p class="tiny mt" style="line-height:1.7;color:#B4720F">' + chuaDo.length +
        ' cửa chưa đo được vì còn chờ một ô chủ hệ điền.</p>' : '') + '</div>';

    var gl = G.BN_GIEOLAI || {};
    o += U.sec('Gieo lại, không sao chép', (gl.vi || ''));
    o += '<div class="grid g2 mb">' +
      '<div class="card" style="border-color:#BE0E162e"><b class="sm" style="color:#BE0E16">SAO CHÉP — CẤM</b>' +
      '<p class="tiny mt" style="line-height:1.7">' + h((gl.saoChep || {}).la || '') + '</p>' +
      '<p class="tiny dim mt" style="line-height:1.7">' + h((gl.saoChep || {}).ketQua || '') + '</p></div>' +
      '<div class="card" style="border-color:#0B73502e"><b class="sm" style="color:#0B7350">GIEO LẠI — ĐÚNG</b>' +
      ((gl.gieoLai || {}).chuyen || []).map(function (x) {
        return '<div class="tiny mt" style="line-height:1.7">· ' + h(x) + '</div>';
      }).join('') +
      '<p class="tiny dim mt" style="line-height:1.7">' + h((gl.gieoLai || {}).tuViet || '') + '</p></div></div>';
    o += '<p class="tiny dim mb" style="line-height:1.7"><b>Đất mới:</b> ' + h(gl.datMoi || '') +
      ' <b>Cấm so sánh:</b> ' + h(gl.camSoSanh || '') + ' ' + h(gl.viCamSoSanh || '') + '</p>';

    o += U.sec('Năm năm trước ngày rời', '');
    o += U.tbl(['Năm', 'Làm gì', 'Vì sao'],
      (G.BN_CHUYENGIAO || []).map(function (x) { return [String(x.nam), h(x.lam), h(x.vi)]; }));

    var bo = G.BN_BONG || {};
    o += '<div class="card mb" style="border-color:#BE0E163e">' +
      '<span class="tiny up" style="color:#BE0E16">BÓNG</span>' +
      '<p class="mt" style="line-height:1.9"><b>' + h(bo.cot || '') + '</b></p>' +
      (bo.dauHieu || []).map(function (x) {
        return '<div class="sm mt" style="line-height:1.8">· ' + h(x) + '</div>';
      }).join('') +
      '<p class="sm mt" style="line-height:1.8">' + h(bo.pha || '') + '</p>' +
      '<p class="sm mt" style="line-height:1.8;color:#0B7350"><b>Xong khi:</b> ' + h(bo.xong || '') + '</p>' +
      '<p class="tiny dim mt" style="line-height:1.7">' + h(bo.vi || '') + '</p></div>';

    o += U.sec('Tự vấn thể chế — ba cột', ((G.BN_HANSEI_TC_LUAT || {}).vi || ''));
    o += U.tbl(['Cột', 'Tên', 'Dấu hiệu', 'Làm gì'],
      (G.BN_HANSEI_TC || []).map(function (x) { return [String(x.cot), h(x.ten), h(x.dau), h(x.lam)]; }));
    o += '<p class="tiny dim mb" style="line-height:1.7">' + h((G.BN_HANSEI_TC_LUAT || {}).suGiaToc || '') + '</p>';

    var l50 = G.BN_LE50 || {};
    o += U.sec('Lễ nửa thế kỷ', 'Buổi lễ lớn duy nhất trong một trăm năm. ' + (l50.noi || ''));
    o += '<div class="card mb"><p class="sm" style="line-height:1.8;color:#BE0E16"><b>Không được có:</b> ' +
      h((l50.camCo || []).join(' · ')) + '</p>' +
      (l50.phan || []).map(function (x) {
        return '<div class="mt" style="padding-top:8px;border-top:1px solid var(--gita-vien-2)">' +
          '<b class="sm">Phần ' + x.so + ' — ' + h(x.ten) + (x.daiNhat ? ' (dài nhất)' : '') + '</b>' +
          '<p class="sm mt" style="line-height:1.8">' + h(x.lam) + '</p>' +
          '<p class="tiny dim">' + h(x.vi) + '</p></div>';
      }).join('') + '</div>';

    var ct = G.BN_CHAMTHU || {};
    o += '<div class="card mb" style="border-color:#5140B42e">' +
      '<span class="tiny up" style="color:#5140B4">CHẠM THỬ DI CHÚC · NĂM ' + ct.nam + '</span>' +
      '<p class="sm mt" style="line-height:1.8">' + h(ct.lam || '') + '</p>' +
      '<p class="sm mt" style="line-height:1.8"><b>Quá ' + ct.nguongPt + '%:</b> ' + h(ct.quaNguong || '') + '</p>' +
      '<p class="sm mt" style="line-height:1.8">' + h(ct.chua || '') + '</p>' +
      '<p class="tiny dim mt" style="line-height:1.7">' + h(ct.vi || '') + '</p></div>';

    o += U.sec('Bốn luật chuyển nền tảng', 'Một trăm năm là quá dài cho bất kỳ nền tảng kỹ thuật nào.');
    o += '<div class="card mb">' + (G.BN_NENTANG || []).map(function (l) {
      return '<div style="padding:8px 0;border-bottom:1px solid var(--gita-vien-2)">' +
        '<b class="sm">' + l.no + '. ' + h(l.t) + '</b>' +
        '<p class="tiny dim mt" style="line-height:1.7">' + h(l.y) + '</p></div>';
    }).join('') + '</div>';

    var lm = G.BN_LIENMINH || {};
    o += U.sec('Liên minh rừng — không trụ sở', (lm.camGi || ''));
    o += '<div class="card mb">' + (lm.co || []).map(function (x) {
      return '<div class="sm" style="padding:6px 0;line-height:1.8">· ' + h(x) + '</div>';
    }).join('') +
      '<p class="sm mt" style="line-height:1.8"><b>Quyết:</b> ' + h(lm.quyet || '') + '</p>' +
      '<p class="sm mt" style="line-height:1.8"><b>Phạt:</b> ' + h(lm.phat || '') + '</p>' +
      '<p class="tiny dim mt" style="line-height:1.7">' + h(lm.vi || '') + '</p></div>';

    var n100 = G.BN_NAM100 || {};
    o += U.sec('Năm một trăm — hạt kể lại chính mình', (n100.ghiSan || ''));
    o += '<div class="card mb" style="border-color:#0B73503e">' +
      '<p style="line-height:1.9"><b>' + h(n100.cauHoi || '') + '</b></p>' +
      '<p class="sm mt" style="line-height:1.8"><b>Nếu CÓ:</b> ' + h(n100.neuCo || '') + '</p>' +
      '<p class="sm mt" style="line-height:1.8"><b>Nếu có phần KHÔNG:</b> ' + h(n100.neuKhong || '') + '</p>' +
      '<p class="tiny mt" style="line-height:1.7;color:#0B7350">' + h(n100.viKhongLaDep || '') + '</p></div>';
    o += U.tbl(['Cửa', 'Tên', 'Làm gì'],
      (n100.cua || []).map(function (c) { return [h(c.ma), h(c.ten), h(c.lam)]; }));
    o += '<p class="tiny dim mb" style="line-height:1.7"><b>' + h(n100.luat || '') + '</b> ' +
      h(n100.viCuaC || '') + ' ' + h(n100.hoiDong || '') + '</p>';

    var dc = G.BN_DICHUC || {};
    o += U.sec('Di chúc thể chế', (dc.khacHopDen || ''));
    o += '<div class="card mb">' + (dc.phan || []).map(function (x) {
      return '<div class="sm" style="padding:6px 0;line-height:1.8">' + x.so + '. ' + h(x.t) +
        (x.ketBang ? '<div class="tiny" style="color:#0B7350">Kết bằng: ' + h(x.ketBang) + '</div>' : '') + '</div>';
    }).join('') +
      '<p class="tiny dim mt" style="line-height:1.7"><b>Cất ba nơi:</b> ' + h((dc.batNoi || []).join(' · ')) + '</p>' +
      '<p class="tiny dim mt" style="line-height:1.7">' + h(dc.phan5 || '') + '</p></div>';

    var chetLoi = G.bnSoiChet();
    o += U.sec('Năm cách chết, và chuông báo sớm',
      'Cách chết nào không trỏ được vào thuốc CÓ THẬT thì đó là một nỗi lo, không phải một rủi ro được quản.' +
      (chetLoi.length ? ' LỆCH: ' + (chetLoi.join(' ')) : ''));
    o += U.tbl(['Mã', 'Cách chết', 'Bản chất', 'Chuông báo sớm', 'Thuốc duy nhất'],
      (G.BN_CHET || []).map(function (c) {
        return [h(c.ma), h(c.ten), h(c.la), h(c.chuong), h(c.thuoc)];
      }));

    o += U.sec('Sáu luật của biên niên', '');
    o += '<div class="card">' + (G.BN_LUAT || []).map(function (l) {
      return '<div style="padding:8px 0;border-bottom:1px solid var(--gita-vien-2)">' +
        '<b class="sm">' + l.no + '. ' + h(l.t) + '</b>' +
        '<p class="tiny dim mt" style="line-height:1.7">' + h(l.y) + '</p></div>';
    }).join('') + '</div>';
    return o;
  };
})();
