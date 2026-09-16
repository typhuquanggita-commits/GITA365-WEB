/* ═══════════════════════════════════════════════════════════════
   GITA 365 — MÁY CHẠY SỔ TAY CỦA GIA ĐÌNH

   Kho chuẩn ở kho-goc/data.so-tay-gia-dinh.js.

   VIỆC LỚN NHẤT CỦA TỆP NÀY KHÔNG PHẢI DỰNG MÀN HÌNH

   Từ bản 9.x kho có G.DEHIEU_NGUONG với ba ngưỡng đo, và ngay trên nó
   là dòng chú giải: "Con số để bộ kiểm phát hành đối chiếu." Bộ kiểm
   chưa bao giờ đối chiếu. Bốn kho DEHIEU_* chỉ xuất hiện đúng một lần
   trong cả kho mã — ở danh sách quyền của src/kho-khoa.js.

   sgSoiDeHieu() là cái máy ấy, dựng muộn mấy bản. Nó đo ba thứ đã khai
   sẵn: câu dài nhất, số từ trung bình một câu, và số từ khó trên mỗi
   mười nghìn ký tự — từ khó lấy thẳng từ G.DEHIEU_THAY, không dựng
   danh sách thứ hai.

   ĐO CHỖ NÀO — VÀ VÌ SAO KHÔNG ĐO CẢ CUỐN BẰNG MỘT THƯỚC

   Bản gốc tự chia: hai mươi bốn trang IN, và một phụ lục soạn thảo ghi
   rõ "không in vào cuốn". Chuẩn lời dễ hiểu áp cho phần in; phần phụ
   lục là chữ của người làm sách và giữ thuật ngữ nghề — luật ấy nằm
   ngay trong G.DEHIEU_NGUONG.

   Máy quét TỪ CẤM thì hẹp hơn nữa: chỉ quét cột BẢO LÀM GÌ. Quét cả
   cuốn thì "không phải cán bộ" và "không phải thất bại" cũng thành
   phạm — mà đó là hai câu tử tế nhất trong sách. Từ cấm ở HM_NGONTU là
   cấm giọng sai bảo, không phải cấm một mặt chữ. Một cái thước dùng
   sai chỗ thì nó cắt mất đúng phần nó sinh ra để giữ.

   VÌ SAO CÓ sgSanSangIn()

   Trang 2 hứa: bấm chuông đỏ thì mười lăm phút có người tới. Không sổ
   nào trong hệ ghi giờ ấy. GL_ANDON đo giờ BÁO cho người giữ lửa, khác
   hẳn giờ NGƯỜI TỚI.

   Lời hứa ấy đúng, nên giữ. Nhưng in nó vào một trăm cuốn giấy trao
   tận tay, rồi sáu tháng sau không ai biết nó có được giữ hay không —
   kể cả người hứa — thì nó thành một câu trang trí trên một tờ giấy
   người ta đang bám vào lúc gấp nhất.

   Nên hàm này CHẶN việc in, và nói rõ chặn vì cái gì. Bộ kiểm vẫn
   xanh, vì kho khai thật; cổng in thì đỏ, vì việc thật chưa xong. Hai
   điều ấy cùng đúng một lúc.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;
G.VIEWS = G.VIEWS || {};

(function () {
  var U = G.U, h = U.h;

  function banGhi(duong) {
    var p = String(duong || '').split('.');
    var ds = G[p[0]];
    if (Array.isArray(ds)) return ds.filter(function (x) { return x.ma === p[1]; })[0];
    if (ds && typeof ds === 'object' && p.length === 1) return ds;
    return undefined;
  }

  /* ═══════════ CHUẨN LỜI DỄ HIỂU — MÁY ĐO ═══════════ */

  /* Cắt câu ở . ! ? … và xuống dòng. KHÔNG cắt ở dấu hai chấm: câu dẫn
     lời rồi mới tới lời nói là MỘT câu trong đầu người đọc, và cắt nó
     ra là tự cho mình điểm dễ hơn thực tế. */
  G.sgTachCau = function (chu) {
    return String(chu || '').split(/[.!?…]+|\n+/)
      .map(function (c) { return c.trim(); })
      .filter(function (c) { return c.length > 1; });
  };

  G.sgDemTu = function (cau) {
    /* Bỏ dấu câu rồi đếm cụm cách nhau bằng khoảng trắng. Gạch dài là
       dấu ngắt, không phải từ. */
    return String(cau || '').replace(/[—–,;:"“”()]/g, ' ')
      .split(/\s+/).filter(function (t) { return t.length > 0; }).length;
  };

  /* Gom đúng những cột IN VÀO SÁCH. Trả [nhãn, chữ]. */
  G.sgChuSach = function () {
    var ra = [];
    (G.SG_TRONGSACH || []).forEach(function (cap) {
      var kho = G[cap[0]], cot = cap[1];
      if (kho === undefined) return;
      if (Array.isArray(kho)) {
        kho.forEach(function (b, i) {
          var v = b[cot];
          if (typeof v === 'string' && v) ra.push([cap[0] + '.' + (b.ma || b.so || b.no || i) + '.' + cot, v]);
        });
      } else {
        var v = kho[cot];
        if (typeof v === 'string' && v) ra.push([cap[0] + '.' + cot, v]);
      }
    });
    return ra;
  };

  /* ═══ BỘ ĐỆM, VÀ VÌ SAO NÓ PHẢI KHOÁ THEO CHỮ ═══
     Đo trên máy điện thoại phổ thông (CPU chậm sáu lần): hàm này mất
     143 ms, và nó chạy LẠI TỪ ĐẦU mỗi lần dựng màn — trong khi chữ
     trong sách không đổi giữa hai lần dựng.

     Nhưng KHÔNG được đệm mù. Bộ kiểm phát hành cố tình kéo dài một câu,
     nhét một từ khó vào, rồi đòi hàm này đỏ đúng chỗ; đệm mù thì nó trả
     lại kết quả cũ và ba phép kiểm ấy thành phép kiểm câm — đúng loại
     hỏng mà luật "một phép kiểm chưa từng đỏ thì chưa phải phép kiểm"
     viết ra để chặn.

     Nên khoá đệm bằng CHÍNH CHỮ ĐẦU VÀO. Chữ đổi một dấu phẩy là khoá
     đổi, đệm bỏ đi, hàm chạy lại. Ghép chuỗi tốn một lượt quét; sáu
     mươi lượt quét biểu thức tìm kiếm mới là chỗ tốn thật. */
  var demDH = null, khoaDH = null;
  /* Biểu thức tìm kiếm dựng một lần rồi giữ: dựng lại cùng một biểu
     thức sáu mươi lần mỗi lần dựng màn là việc không ai được lợi. */
  var reKho = {};
  function reCua(kho) {
    if (!reKho[kho])
      reKho[kho] = new RegExp('(^|[^\\p{L}])' +
        kho.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '($|[^\\p{L}])', 'giu');
    return reKho[kho];
  }

  G.sgSoiDeHieu = function () {
    var ng = G.DEHIEU_NGUONG;
    if (!ng) return { chuaDo: true, thieu: 'Chưa nạp được G.DEHIEU_NGUONG.' };
    var ds = G.sgChuSach();
    if (!ds.length) return { chuaDo: true, thieu: 'Chưa khai cột nào in vào sách.' };

    var khoa = ds.length + '' + (G.DEHIEU_THAY || []).length +
      '' + ng.cauTB + '' + ng.cauDaiNhat + '' + ng.tuKho10k +
      '' + ds.map(function (c) { return c[1]; }).join('');
    if (khoaDH === khoa && demDH) return demDH;

    var cauDai = [], tongTu = 0, soCau = 0, soKyTu = 0;
    ds.forEach(function (c) {
      soKyTu += c[1].length;
      G.sgTachCau(c[1]).forEach(function (cau) {
        var n = G.sgDemTu(cau);
        soCau++; tongTu += n;
        if (n > ng.cauDaiNhat) cauDai.push(c[0] + ':' + n + ' từ');
      });
    });

    /* Từ khó lấy thẳng từ bảng đã có. Dựng danh sách thứ hai thì rồi sẽ
       có ngày hai bảng lệch nhau, và lúc ấy chuẩn chữ có hai bản. */
    var tuKho = [];
    (G.DEHIEU_THAY || []).forEach(function (t) {
      var re = reCua(t.kho);
      ds.forEach(function (c) {
        var m = c[1].match(re);
        if (m) tuKho.push(c[0] + '→' + t.kho + (m.length > 1 ? '×' + m.length : ''));
      });
    });

    var cauTB = soCau ? tongTu / soCau : 0;
    var mat10k = soKyTu ? (tuKho.length * 10000 / soKyTu) : 0;
    demDH = { chuaDo: false, soCau: soCau, soKyTu: soKyTu,
      cauTB: Math.round(cauTB * 10) / 10, nguongTB: ng.cauTB,
      cauDai: cauDai, nguongDai: ng.cauDaiNhat,
      tuKho: tuKho, tuKho10k: Math.round(mat10k * 100) / 100, nguongTuKho: ng.tuKho10k,
      dat: !cauDai.length && cauTB <= ng.cauTB && mat10k <= ng.tuKho10k };
    khoaDH = khoa;
    return demDH;
  };

  /* Từ cấm — chỉ quét cột BẢO LÀM GÌ. Dùng lại đúng máy quét của bức
     tranh hành trình; hai máy quét rồi sẽ có ngày lệch nhau. */
  G.sgLoiBaoLam = function () {
    return (G.SG_KHAN || []).map(function (k) { return ['SG_KHAN.' + k.ma + '.lam', k.lam]; })
      .concat((G.SG_MUCLUC || []).map(function (m, i) { return ['SG_MUCLUC.' + i + '.den', m.den]; }));
  };

  G.sgSoiNgonTu = function () {
    return G.hmQuetTuCam ? G.hmQuetTuCam(G.sgLoiBaoLam()) : [];
  };

  /* ═══════════ BẢY QUYỀN — BẢN DỊCH, KHÔNG PHẢI BỘ THỨ HAI ═══════════ */
  G.sgSoiQuyen = function () {
    var goc = (G.PL_QUYEN || []).map(function (q) { return q.ma; });
    var ds = G.SG_QUYEN7 || [], loi = [];
    if (ds.length !== goc.length) loi.push('bản dịch ' + ds.length + ' · quyền gốc ' + goc.length);
    var thay = {};
    ds.forEach(function (d) {
      if (!d.quyen || goc.indexOf(d.quyen) < 0) { loi.push(d.so + '→' + (d.quyen || 'trống')); return; }
      if (thay[d.quyen]) loi.push(d.quyen + ':dịch hai lần');
      thay[d.quyen] = true;
      if (!d.chu) loi.push(d.so + ':thiếu lời');
    });
    goc.forEach(function (m) { if (!thay[m]) loi.push(m + ':không có bản dịch'); });
    return loi;
  };

  /* ═══════════ LỜI HỨA CÓ ĐỒNG HỒ ═══════════ */
  G.sgHen = function () {
    return (G.SG_KHAN || []).filter(function (k) { return k.hen; }).map(function (k) {
      return { ma: k.ma, phut: k.hen.phut, la: k.hen.la,
        doBang: k.doBang, chuaDo: !!k.chuaDo, thieu: k.thieu };
    });
  };

  G.sgSoiHen = function () {
    var loi = [];
    (G.SG_KHAN || []).forEach(function (k) {
      if (!k.hen) return;
      if (!k.hen.phut || !k.hen.la) loi.push(k.ma + ':hẹn thiếu cột');
      if (!k.doBang) loi.push(k.ma + ':hẹn không nói đo bằng gì');
      if (k.chuaDo && !k.thieu) loi.push(k.ma + ':khai chưa đo mà không nói thiếu gì');
    });
    return loi;
  };

  /* Cổng in. Bộ kiểm phát hành vẫn xanh vì kho khai thật; cổng này đỏ
     vì việc thật chưa xong. Hai điều cùng đúng một lúc. */
  G.sgSanSangIn = function () {
    var vuong = [];
    G.sgHen().forEach(function (x) {
      if (x.chuaDo) vuong.push('Lời hứa ' + x.phut + ' phút ở ' + x.ma + ' chưa có sổ đo: ' + x.thieu);
    });
    (G.SG_CHOCHU || []).forEach(function (c) { vuong.push('Chờ chủ hệ: ' + c.t); });
    (G.SG_CAM5 || []).forEach(function (c) {
      if (c.chuaDo) vuong.push('Điều cấm ' + c.ma + ' chưa có chỗ canh: ' + c.thieu);
    });
    var dh = G.sgSoiDeHieu();
    if (!dh.chuaDo && !dh.dat) vuong.push('Chữ trong sách chưa qua chuẩn lời dễ hiểu.');
    return { ok: vuong.length === 0, vuong: vuong,
      y: vuong.length
        ? 'Chưa in. Giấy in rồi thì không sửa lại được, nên chỗ nào chưa chắc thì chưa lên giấy.'
        : 'In được.' };
  };

  /* ═══════════ CHUÔNG NHÀ BẤM KHÁC CHUÔNG HỆ RUNG ═══════════ */
  G.sgSoiChuong = function () {
    var tang = (G.GL_ANDON || []).map(function (a) { return a.ma; });
    var nut = (G.SG_KHAN || []).map(function (k) { return k.ma; });
    var ds = G.SG_CHUONG || [], loi = [];
    tang.forEach(function (t) {
      if (!ds.filter(function (x) { return x.tang === t; }).length) loi.push(t + ':chưa nối');
    });
    ds.forEach(function (x) {
      if (tang.indexOf(x.tang) < 0) loi.push(x.tang + ':tầng không có thật');
      if (x.nut && nut.indexOf(x.nut) < 0) loi.push(x.nut + ':nút không có thật');
      if (!x.khac) loi.push((x.tang || '?') + ':không nói chỗ khác nhau');
    });
    return loi;
  };

  /* ═══════════ NĂM ĐIỀU CẤM ═══════════ */
  G.sgSoiCam5 = function () {
    var ds = G.SG_CAM5 || [], loi = [];
    if (ds.length !== 5) loi.push('số điều=' + ds.length);
    ds.forEach(function (c) {
      if (c.moi) {
        /* Điều mới thì chưa có gốc là đúng — nhưng phải nói đo bằng gì,
           và nếu chưa đo được thì thiếu đúng cái gì. */
        if (!c.doBang) loi.push(c.ma + ':điều mới mà không nói đo bằng gì');
        if (c.chuaDo && !c.thieu) loi.push(c.ma + ':khai chưa đo mà không nói thiếu gì');
        return;
      }
      if (!c.noi || banGhi(c.noi) === undefined) loi.push(c.ma + '→' + (c.noi || 'không gốc'));
    });
    return loi;
  };

  /* ═══════════ ĐÀO TẠO — ĐỌC DD_CAP, KHÔNG GHI SỐ ═══════════ */
  G.sgDaoTao = function () {
    var dh = (G.DD_CAP || []).filter(function (c) { return c.ma === 'DH'; })[0];
    if (!dh) return null;
    return { gio: dh.gioDaoTao, thang: dh.thucTapThang, nha: dh.thucTapNha, phutTuan: dh.phutTuan,
      cau: 'Đào tạo ' + dh.gioDaoTao + ' giờ, rồi thực tập ' + dh.thucTapThang +
        ' tháng với ' + dh.thucTapNha + ' nhà, xong mới gặp nhà thật.' };
  };

  /* Không cột nào của cuốn sách được ghi một số tuần thực tập. Sách in
     giấy thì con số sai không sửa lại được. */
  G.sgSoiSoTuan = function () {
    var re = /(mười tuần|10 tuần)/i, pham = [];
    G.sgChuSach().forEach(function (c) { if (re.test(c[1])) pham.push(c[0]); });
    if ((G.SG_DAOTAO || {}).theoDD !== true) pham.push('SG_DAOTAO:chưa khai đọc DD_CAP');
    return pham;
  };

  /* ═══════════ SỔ IN LẠI ═══════════ */
  G.sgSoiInLai = function () {
    var ds = G.SG_INLAI || [], loi = [];
    if (!ds.length) loi.push('chưa có lần in nào');
    ds.forEach(function (x, i) {
      if (x.lan !== i + 1) loi.push('lần in lệch thứ tự ở ' + x.lan);
      if (!x.suaTrang || !x.vi) loi.push('lần ' + x.lan + ':thiếu cột');
      /* In rồi thì phải có ngày. Chưa in thì không có khoá ngày. */
      if (!x.chuaIn && !x.ngay) loi.push('lần ' + x.lan + ':in rồi mà không có ngày');
      if (x.chuaIn && x.ngay) loi.push('lần ' + x.lan + ':chưa in mà đã có ngày');
    });
    if ((G.SG_INAN || {}).camSuaLang !== true) loi.push('chưa khai cấm sửa lặng lẽ');
    return loi;
  };

  /* Mọi kho SG_ đều phải được xếp: in vào sách, hay phụ lục soạn thảo.
     Kho không xếp là kho không ai biết đo bằng thước nào. */
  G.sgSoiPhanLoai = function () {
    var trong = {}, ngoai = {};
    (G.SG_TRONGSACH || []).forEach(function (c) { trong[c[0]] = true; });
    (G.SG_PHULUC || []).forEach(function (k) { ngoai[k] = true; });
    return Object.keys(G).filter(function (k) { return k.indexOf('SG_') === 0; })
      .filter(function (k) {
        if (trong[k] || ngoai[k]) return false;
        /* Ba kho một-bản-ghi đi kèm phần in, khai qua cặp kho–cột */
        return ['SG_DONGDAU', 'SG_TRANG24', 'SG_KHAN_LUAT', 'SG_CAM5_LUAT',
          'SG_QUYEN7_LUAT', 'SG_KHONGVAY'].indexOf(k) < 0;
      });
  };

  G.sgChoChu = function () {
    return (G.SG_CHOCHU || []).filter(function (c) {
      return c.t && c.banGoc && c.lenhDung && c.canGi;
    });
  };

  /* ═══════════════════════════════════════════════════════════
     MÀN HÌNH — CẢ CUỐN SÁCH LÀ CỦA GIA ĐÌNH

     Khác mọi màn hai độ sâu trước: ở đây phần NGHỀ mỏng hơn phần gia
     đình, vì cuốn này viết cho người sống trong rừng. Phần nghề chỉ là
     việc làm sách — thước đo, cổng in, sổ in lại.
     ═══════════════════════════════════════════════════════════ */
  G.VIEWS['so-tay-gia-dinh'] = function () {
    if (!G.SG_HOI)
      return U.empty('Chưa mở được phần này', 'Phần này nằm trong gói nền. Đăng nhập lại để nạp.');

    var dd = G.SG_DONGDAU || {};
    var o = U.ph({ eyebrow: 'SỔ TAY CỦA GIA ĐÌNH · 24 TRANG · 30 CÂU', ic: 'sun', grad: 1,
      t: dd.chu || '', lead: dd.them || '' });

    o += G.kaKhung ? G.kaKhung('so-tay-gia-dinh', 'dau') : '';

    /* ── Trang 2 · bản đồ khẩn, lên trước mọi thứ ── */
    o += U.sec('Trang 2 — cần gấp thì làm gì',
      'Trang này in ngay sau bìa, vì lúc cần nó thì không ai còn sức lật tìm.');
    o += (G.SG_KHAN || []).map(function (k) {
      return '<div class="card mb" style="border-color:' + k.c + '3e">' +
        '<span class="tiny up" style="color:' + k.c + '">' + h(k.ten) + '</span>' +
        '<p class="sm mt" style="line-height:1.8"><b>Khi nào:</b> ' + h(k.khi) + '</p>' +
        '<p class="mt" style="line-height:1.9"><b>' + h(k.lam) + '</b></p>' +
        '<p class="sm mt" style="line-height:1.8">' + h(k.khongCan) + '</p>' +
        (k.hen ? '<p class="sm mt" style="line-height:1.8"><b>Trong ' + k.hen.phut +
          ' phút:</b> ' + h(k.hen.la) + '</p>' : '') +
        (k.khongMotMinh ? '<p class="sm mt" style="line-height:1.8"><b>' + h(k.khongMotMinh) + '</b></p>' : '') +
        (k.y ? '<p class="tiny dim mt" style="line-height:1.7">' + h(k.y) + '</p>' : '') + '</div>';
    }).join('');
    o += '<p class="tiny dim mb" style="line-height:1.7"><b>' +
      h((G.SG_KHAN_LUAT || {}).duCap || '') + '</b> ' + h((G.SG_KHAN_LUAT || {}).bamNham || '') + '</p>';

    /* ── Trang 14–15 · bảy quyền ── */
    var q = G.sgSoiQuyen();
    o += U.sec('Trang 14–15 — bảy quyền của bạn',
      ((G.SG_QUYEN7_LUAT || {}).cot || '') + (q.length ? ' LỆCH: ' + (q.join(' ')) : ''));
    o += '<div class="card mb" style="border-color:#0B73503e">' + (G.SG_QUYEN7 || []).map(function (x) {
      return '<div style="padding:9px 0;border-bottom:1px solid var(--gita-vien-2)">' +
        '<b class="sm">' + x.so + ' · ' + h(x.ten) + '</b>' +
        '<p class="sm mt" style="line-height:1.8">' + h(x.chu) + '</p></div>';
    }).join('') +
      '<p class="sm mt" style="line-height:1.8"><b>' + h((G.SG_QUYEN7_LUAT || {}).giơSach || '') + '</b></p>' +
      '<p class="tiny dim mt" style="line-height:1.7">' + h((G.SG_QUYEN7_LUAT || {}).chuKy || '') +
      ' ' + h((G.SG_QUYEN7_LUAT || {}).viCoChuKy || '') + '</p></div>';

    /* ── Năm điều người đi cùng không được làm ── */
    o += G.kaKhung ? G.kaKhung('so-tay-gia-dinh', 'sau-quyen') : '';

    o += U.sec('Năm điều người đi cùng không được làm', ((G.SG_CAM5_LUAT || {}).saiThiSao || ''));
    o += U.tbl(['Mã', 'Không được làm', 'Vì sao'],
      (G.SG_CAM5 || []).map(function (c) { return [h(c.ma), h(c.t), h(c.y)]; }));
    var dt = G.sgDaoTao();
    if (dt) o += '<p class="tiny dim mb" style="line-height:1.7">' + h(dt.cau) + '</p>';

    /* ── Ba mươi câu ── */
    var nhom = [];
    (G.SG_HOI || []).forEach(function (x) { if (nhom.indexOf(x.nhom) < 0) nhom.push(x.nhom); });
    o += U.sec('Ba mươi câu — những câu người khác đã hỏi trước bạn', '');
    o += nhom.map(function (n) {
      return '<div class="card mb"><span class="tiny up">' + h(n) + '</span>' +
        (G.SG_HOI || []).filter(function (x) { return x.nhom === n; }).map(function (x) {
          return '<div style="padding:9px 0;border-bottom:1px solid var(--gita-vien-2)">' +
            '<b class="sm">' + x.so + '. ' + h(x.hoi) + '</b>' +
            '<p class="sm mt" style="line-height:1.8">' + h(x.dap) + '</p>' +
            (x.them ? '<p class="sm mt" style="line-height:1.8">' + h(x.them) + '</p>' : '') + '</div>';
        }).join('') + '</div>';
    }).join('');

    var kv = G.SG_KHONGVAY || {};
    o += '<div class="card mb" style="border-color:#BE0E163e">' +
      '<span class="tiny up" style="color:#BE0E16">' + h(kv.cot || '') + '</span>' +
      '<p class="sm mt" style="line-height:1.8">' + h(kv.vi || '') + '</p>' +
      '<p class="sm mt" style="line-height:1.8">' + h(kv.thayVao || '') + '</p>' +
      '<p class="mt" style="line-height:1.9"><b>' + h(kv.cauNang || '') + '</b></p></div>';

    /* ── Trang 24 ── */
    var t24 = G.SG_TRANG24 || {};
    o += U.sec('Trang 24 — trang của bạn', '');
    o += '<div class="card mb"><p class="sm" style="line-height:1.8">' + h(t24.la || '') + '</p>' +
      '<p class="mt" style="line-height:1.9"><b>' + h(t24.cua || '') + '</b></p>' +
      '<p class="sm mt" style="line-height:1.8">' + h(t24.chuKy || '') + '</p></div>';

    o += U.sec('Năm luật của cuốn sách', '');
    o += '<div class="card mb">' + (G.SG_LUAT || []).map(function (l) {
      return '<div style="padding:8px 0;border-bottom:1px solid var(--gita-vien-2)">' +
        '<b class="sm">' + l.no + '. ' + h(l.t) + '</b>' +
        '<p class="tiny dim mt" style="line-height:1.7">' + h(l.y) + '</p></div>';
    }).join('') + '</div>';

    /* ── Phần của người làm sách ── */
    if (!G.SG_INAN) return o;

    var san = G.sgSanSangIn();
    o += U.sec('Cổng in — ' + (san.ok ? 'in được' : 'CHƯA IN'), (san.y));
    if (!san.ok)
      o += '<div class="card mb" style="border-color:#BE0E163e">' +
        '<span class="tiny up" style="color:#BE0E16">CÒN ' + san.vuong.length + ' CHỖ VƯỚNG</span>' +
        san.vuong.map(function (v) {
          return '<p class="sm mt" style="line-height:1.8">· ' + h(v) + '</p>';
        }).join('') + '</div>';

    var dh = G.sgSoiDeHieu();
    o += U.sec('Chuẩn lời dễ hiểu — lần đầu chạy thật',
      'Ba ngưỡng này đã nằm trong kho từ lâu kèm dòng chú giải "con số để bộ kiểm phát hành đối chiếu". Đây là văn bản đầu tiên đủ chữ để chạy chúng.');
    if (dh.chuaDo) {
      o += '<div class="card mb">Chưa đo được: ' + h(dh.thieu) + '</div>';
    } else {
      o += U.tbl(['Đo gì', 'Đo được', 'Ngưỡng', 'Đạt'],
        [['Câu dài nhất', dh.cauDai.length ? dh.cauDai.length + ' câu quá dài' : 'không câu nào quá dài',
          String(dh.nguongDai) + ' từ', dh.cauDai.length ? '✗' : '✓'],
         ['Số từ trung bình một câu', String(dh.cauTB), String(dh.nguongTB) + ' từ',
          dh.cauTB <= dh.nguongTB ? '✓' : '✗'],
         ['Từ khó trên 10.000 ký tự', String(dh.tuKho10k), String(dh.nguongTuKho),
          dh.tuKho10k <= dh.nguongTuKho ? '✓' : '✗']]);
      o += '<p class="tiny dim mb" style="line-height:1.7">Đã đo ' + dh.soCau + ' câu · ' +
        dh.soKyTu + ' ký tự phần in vào sách' +
        (dh.tuKho.length ? ' · từ khó: ' + h(dh.tuKho.join(' ')) : '') +
        (dh.cauDai.length ? ' · câu dài: ' + h(dh.cauDai.join(' ')) : '') + '</p>';
    }
    o += '<p class="tiny dim mb" style="line-height:1.7"><b>Thước nào đo chỗ nào:</b> ' +
      h((G.SG_DOCHU || {}).viChiApChoLam || '') + '</p>';

    var k3 = G.SG_KIEM3 || {};
    o += U.sec('Kiểm chuẩn ba người nghe — phần máy không đo được', (k3.mayLamDuocGi || ''));
    o += '<div class="card mb" style="border-color:#B4720F3e">' +
      '<p class="sm" style="line-height:1.8"><b>Cách:</b> ' + h(k3.cach || '') + '</p>' +
      '<p class="sm mt" style="line-height:1.8"><b>Hỏi:</b> ' + (k3.hoi || []).map(function (c) { return h(c); }).join(' · ') + '</p>' +
      '<p class="sm mt" style="line-height:1.8"><b>Đạt:</b> ' + h(k3.dat || '') + '</p>' +
      '<p class="sm mt" style="line-height:1.8;color:#BE0E16"><b>Trượt:</b> ' + h(k3.truot || '') + '</p>' +
      '<p class="tiny dim mt" style="line-height:1.7">' + h(k3.viToanTrang || '') + '</p>' +
      (k3.chuaDo ? '<p class="tiny mt" style="line-height:1.7;color:#B4720F"><b>Chưa đo được:</b> ' +
        h(k3.thieu || '') + '</p>' : '') + '</div>';

    o += U.sec('Chuông nhà bấm khác chuông hệ rung', ((G.SG_CHUONG_LUAT || {}).cot || ''));
    o += U.tbl(['Nút nhà bấm', 'Tầng hệ rung', 'Giống', 'Khác'],
      (G.SG_CHUONG || []).map(function (x) {
        return [h(x.nut || '—'), h(x.tang), h(x.giong), h(x.khac)];
      }));
    o += '<p class="tiny dim mb" style="line-height:1.7">' + h((G.SG_CHUONG_LUAT || {}).vi || '') + '</p>';

    o += U.sec('Con số sách hứa công khai', ((G.SG_SO_LUAT || {}).cot || ''));
    o += U.tbl(['Mã', 'Con số', 'Sách hứa ở đâu', 'Trạng thái', 'Thiếu gì'],
      (G.SG_SO || []).map(function (s) {
        return [h(s.ma), h(s.t), h(s.hua), s.chuaDo ? 'CHƯA ĐO ĐƯỢC' : 'đo được',
          h(s.thieu || '—') + (s.canThan ? ' · ' + h(s.canThan) : '')];
      }));

    var ia = G.SG_INAN || {};
    o += U.sec('In sách', (ia.viGiay || ''));
    o += '<div class="card mb">' +
      '<p class="sm" style="line-height:1.8"><b>Số bản đầu:</b> ' + ia.soBan + ' · ' + h(ia.seri || '') + '</p>' +
      '<p class="sm mt" style="line-height:1.8"><b>Trao:</b> ' + h(ia.trao || '') + '</p>' +
      '<p class="sm mt" style="line-height:1.8"><b>Bìa:</b> ' + h(ia.chuKyBia || '') + '</p>' +
      '<p class="sm mt" style="line-height:1.8"><b>Bản cũ:</b> ' + h(ia.khongThuHoi || '') + '</p></div>';
    o += U.tbl(['Lần in', 'Ngày', 'Sửa trang nào', 'Vì sao'],
      (G.SG_INLAI || []).map(function (x) {
        return [String(x.lan), h(x.ngay || (x.chuaIn ? 'chưa in' : '—')), h(x.suaTrang), h(x.vi)];
      }));

    var cho = G.sgChoChu();
    if (cho.length) {
      o += U.sec('Chờ chủ hệ quyết — ' + cho.length + ' câu',
        ((G.SG_CHOCHU_LUAT || {}).camTuQuyet || ''));
      o += '<div class="card mb" style="border-color:#B4720F3e">' + cho.map(function (c) {
        return '<div style="padding:9px 0;border-bottom:1px solid var(--gita-vien-2)">' +
          '<b class="sm">' + h(c.t) + '</b>' +
          '<p class="tiny mt" style="line-height:1.7"><b>Sổ tay để trống:</b> ' + h(c.banGoc) + '</p>' +
          '<p class="tiny mt" style="line-height:1.7"><b>Đang giữ:</b> ' + h(c.lenhDung) + '</p>' +
          '<p class="tiny dim mt" style="line-height:1.7">' + h(c.vi) + '</p>' +
          '<p class="tiny mt" style="line-height:1.7;color:#B4720F"><b>Cần gì:</b> ' + h(c.canGi) + '</p></div>';
      }).join('') +
        '<p class="tiny dim mt" style="line-height:1.7">' + h((G.SG_CHOCHU_LUAT || {}).vi || '') + '</p></div>';
    }
    return o;
  };
})();
