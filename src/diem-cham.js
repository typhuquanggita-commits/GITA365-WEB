/* ═══════════════════════════════════════════════════════════════
   GITA 365 — MÁY CHẠY 1000 ĐIỂM CHẠM VÀ TAY NGHỀ BA MƯƠI NĂM

   Kho: data.diem-cham-1000.js (máy sinh) và data.tay-nghe.js (viết tay).
   Toàn bộ ở gói NGHỀ.

   ═══ HAI CON SỐ MÀN NÀY PHẢI IN RA ═══

   Chủ hệ giao "trợ lý AI làm tốt 100% các khâu" và "chuẩn như coach ba
   mươi năm". Cả hai đều đo được, và cả hai đều KHÔNG ra 100%:

     dcDo()  máy chạy trọn được bao nhiêu trên 1000 điểm chạm.
             200 điểm rơi vào nhịp 03 Chẩn đoán và nhịp 09 Nâng cấp,
             và BV_NHIP_LUAT nói hai nhịp ấy LUÔN có người thật.

     tnDo()  máy làm được mấy trên mười hai điều tay nghề.

   In hai con số ấy ra là cách duy nhất để câu "chuẩn như coach ba mươi
   năm" thành một đặc tả chứ không phải một câu quảng cáo.

   ═══ COACH CAN THIỆP HAY KHÔNG — DẪN TỪ LUẬT ═══

   Ba mức, và không mức nào do tôi gán:

     BAT_BUOC   nhịp 03 và 09 — BV_NHIP_LUAT.nguoiThat
     TUY_CHON   ô có khai cột "nguoi" — có việc người làm được ở ô ấy
     KHONG_CAN  ô không khai cột "nguoi"

   Nên câu trả lời cho "Coach có thể can thiệp hoặc không" là một con số
   đọc được, không phải một lời hứa.

   ═══ NĂM CÁI KHOÁ ═══

   dcSoiDu()      đúng 1000 điểm chạm và 1000 điểm khoá, hai lăng kính
                  cân nhau, không mã trùng.
   dcSoiCoach()   mọi nhịp 03 và 09 đều BẮT BUỘC — không điểm nào lọt.
   dcSoiNguon()   mọi mã trỏ tới một ô có thật trong BV_CAPDO.
   tnSoiDieu()    mười hai điều, mỗi điều khai máy làm được hay không,
                  và điều nào khai KHÔNG thì phải nói vì sao.
   tnSoiGhiDe()   mã ghi đè phải trỏ tới một điểm có thật.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;
G.VIEWS = G.VIEWS || {};

(function () {
  var U = G.U, h = U.h;
  var MUC = {
    BAT_BUOC:  { ten: 'Coach BẮT BUỘC vào', c: '#BE0E16' },
    TUY_CHON:  { ten: 'Coach tuỳ chọn',     c: '#B4720F' },
    KHONG_CAN: { ten: 'Máy chạy trọn',      c: '#0B6675' }
  };

  /* Câu người viết đè lên câu máy ghép. */
  function de(ma) {
    return (G.TN_GHIDE || []).filter(function (x) { return x.ma === ma; })[0] || null;
  }

  G.dcDiem = function (ma) {
    var w = (G.DC1K_WOW || []).filter(function (x) { return x.ma === ma; })[0];
    if (!w) return { khongCo: true, ma: ma };
    var k = (G.DC1K_KHOA || []).filter(function (x) { return x.ma === 'K' + ma.slice(1); })[0];
    var d = de(ma), dk = de('K' + ma.slice(1));
    return {
      wow: d ? Object.assign({}, w, { cham: d.cham, nguoiViet: true, viDe: d.vi }) : w,
      khoa: dk && k ? Object.assign({}, k, { giuChan: dk.giuChan, nguoiViet: true, viDe: dk.vi }) : k
    };
  };

  /* ═══════════ ĐO — HAI CON SỐ PHẢI IN RA ═══════════ */
  G.dcDo = function () {
    var w = G.DC1K_WOW || [], k = G.DC1K_KHOA || [];
    if (!w.length) return { chuaDo: true, thieu: 'DC1K_WOW' };
    var theoMuc = { BAT_BUOC: 0, TUY_CHON: 0, KHONG_CAN: 0 };
    var theoAi = { PH: 0, HS: 0 }, theoTang = {}, theoNhip = {};
    w.forEach(function (x) {
      theoMuc[x.coach] = (theoMuc[x.coach] || 0) + 1;
      theoAi[x.ai] = (theoAi[x.ai] || 0) + 1;
      theoTang[x.tang] = (theoTang[x.tang] || 0) + 1;
      theoNhip[x.nhip] = (theoNhip[x.nhip] || 0) + 1;
    });
    var mayTron = w.filter(function (x) { return x.may; }).length;
    return {
      soWow: w.length, soKhoa: k.length,
      theoMuc: theoMuc, theoAi: theoAi, theoTang: theoTang, theoNhip: theoNhip,
      mayTron: mayTron,
      phanTramMay: w.length ? Math.round(mayTron / w.length * 100) : 0,
      nguoiViet: (G.TN_GHIDE || []).length,
      /* Con số này KHÔNG được làm tròn lên thành 100. Hai trăm điểm rơi
         vào nhịp chẩn đoán và nhịp nâng cấp, và luật nói hai nhịp ấy
         luôn có người thật. */
      viKhongTramPhanTram: 'Hai trăm điểm rơi vào nhịp 03 Chẩn đoán và nhịp 09 Nâng cấp. ' +
        'BV_NHIP_LUAT: hai nhịp ấy LUÔN có người thật.'
    };
  };

  G.tnDo = function () {
    var ds = G.TN_DIEU || [];
    if (!ds.length) return { chuaDo: true, thieu: 'TN_DIEU' };
    var d = { DUOC: 0, MOT_NUA: 0, KHONG: 0 };
    ds.forEach(function (x) { d[x.may] = (d[x.may] || 0) + 1; });
    return {
      tong: ds.length, duoc: d.DUOC, motNua: d.MOT_NUA, khong: d.KHONG,
      /* Nửa điểm cho MỘT NỬA — không làm tròn lên, vì làm tròn lên một
         lần là mở đường cho mọi lần sau. */
      diem: d.DUOC + d.MOT_NUA * 0.5,
      mayHonNguoi: ds.filter(function (x) { return x.mayHonNguoi; }).length,
      chatHonNguoi: ds.filter(function (x) { return /chặt hơn|không mềm lòng|không mệt/i.test(String(x.mayLam)); })
                      .map(function (x) { return x.so; }),
      luat: (G.TN_LUAT || {}).conSoPhaiHien || ''
    };
  };

  /* ═══════════ KHOÁ 1: ĐỦ HAI NGHÌN, HAI LĂNG KÍNH CÂN ═══════════ */
  G.dcSoiDu = function () {
    var w = G.DC1K_WOW || [], k = G.DC1K_KHOA || [], loi = [];
    if (!w.length || !k.length)
      return { chuaDo: true, thieu: !w.length ? 'DC1K_WOW' : 'DC1K_KHOA', loi: [] };
    if (w.length !== 1000) loi.push('điểm chạm có ' + w.length + ', phải 1000');
    if (k.length !== 1000) loi.push('điểm khoá có ' + k.length + ', phải 1000');
    var thay = {}, ph = 0, hs = 0;
    w.forEach(function (x) {
      if (thay[x.ma]) loi.push('trùng mã ' + x.ma);
      thay[x.ma] = 1;
      if (x.ai === 'PH') ph++; else if (x.ai === 'HS') hs++;
      if (!x.cham) loi.push(x.ma + ' thiếu câu chạm');
      if (!x.wow) loi.push(x.ma + ' thiếu cảm giác wow');
    });
    if (ph !== 500 || hs !== 500)
      loi.push('hai lăng kính không cân: phụ huynh ' + ph + ' · học viên ' + hs);
    /* Mỗi điểm chạm phải có một điểm khoá đi kèm. Thiếu thì có khoảnh
       khắc làm khách thích mà không có gì giữ họ ở lại. */
    var mk = {}; k.forEach(function (x) { mk[x.ma] = 1; });
    var hut = w.filter(function (x) { return !mk['K' + x.ma.slice(1)]; });
    if (hut.length) loi.push(hut.length + ' điểm chạm không có điểm khoá đi kèm');
    return { chuaDo: false, loi: loi, so: w.length };
  };

  /* ═══════════ KHOÁ 2: HAI NHỊP NGƯỜI THẬT KHÔNG ĐƯỢC LỌT ═══════════

     Đây là khoá quan trọng nhất của màn này. Chủ hệ giao "máy làm tốt
     100% các khâu", và cách dễ nhất đạt con số ấy là hạ hai nhịp 03 và
     09 xuống mức máy chạy được. Hai nhịp ấy đúng là hai chỗ cả hệ dựng
     lên để bảo vệ. */
  G.dcSoiCoach = function () {
    var w = G.DC1K_WOW || [], loi = [];
    if (!w.length) return { chuaDo: true, thieu: 'DC1K_WOW', loi: [] };
    var lot = w.filter(function (x) {
      return (x.nhip === 3 || x.nhip === 9) && x.coach !== 'BAT_BUOC';
    });
    if (lot.length)
      loi.push(lot.length + ' điểm ở nhịp 03 hoặc 09 KHÔNG bắt buộc Coach — ' +
        'trái BV_NHIP_LUAT, ví dụ ' + lot[0].ma);
    var sai = w.filter(function (x) { return x.coach === 'BAT_BUOC' && x.may; });
    if (sai.length) loi.push(sai.length + ' điểm vừa bắt buộc Coach vừa khai máy chạy trọn');
    w.forEach(function (x) { if (!x.viCoach) loi.push(x.ma + ' chưa nói vì sao Coach ở mức ấy'); });
    var bb = w.filter(function (x) { return x.coach === 'BAT_BUOC'; }).length;
    if (bb !== 200) loi.push('nhịp 03 và 09 phải cho đúng 200 điểm bắt buộc, đang có ' + bb);
    return { chuaDo: false, loi: loi, batBuoc: bb };
  };

  /* ═══════════ KHOÁ 3: MỌI MÃ TRỎ VỀ MỘT Ô CÓ THẬT ═══════════ */
  G.dcSoiNguon = function () {
    var w = G.DC1K_WOW || [], o = G.BV_CAPDO || [], loi = [];
    if (!w.length || !o.length)
      return { chuaDo: true, thieu: !w.length ? 'DC1K_WOW' : 'BV_CAPDO', loi: [] };
    var co = {}; o.forEach(function (x) { co[x.ma] = 1; });
    var hong = 0;
    w.forEach(function (x) {
      var oma = x.ma.slice(2).split('-N')[0];
      if (!co[oma]) hong++;
    });
    if (hong) loi.push(hong + ' điểm trỏ tới một ô cấp độ không có thật');
    if (o.length !== 50) loi.push('BV_CAPDO có ' + o.length + ' ô, phải 50');
    if ((G.BV_NHIP || []).length !== 10) loi.push('BV_NHIP phải có 10 nhịp');
    return { chuaDo: false, loi: loi };
  };

  /* ═══════════ KHOÁ 4 và 5: TAY NGHỀ ═══════════ */
  G.tnSoiDieu = function () {
    var ds = G.TN_DIEU || [], loi = [];
    if (!ds.length) return { chuaDo: true, thieu: 'TN_DIEU', loi: [] };
    if (ds.length !== 12) loi.push('phải có mười hai điều, đang có ' + ds.length);
    ds.forEach(function (x) {
      ['ten', 'moi', 'lauNam', 'dauHieu', 'may', 'mayLam', 'tuKho'].forEach(function (k) {
        if (!x[k]) loi.push('điều ' + x.so + ' thiếu ô ' + k);
      });
      if (['DUOC', 'MOT_NUA', 'KHONG'].indexOf(x.may) < 0)
        loi.push('điều ' + x.so + ' khai mức "' + x.may + '" không hợp lệ');
      if (x.may === 'KHONG' && !x.viKhong)
        loi.push('điều ' + x.so + ' khai KHÔNG mà không nói vì sao');
      if (x.may === 'MOT_NUA' && !x.viMotNua)
        loi.push('điều ' + x.so + ' khai MỘT NỬA mà không nói nửa nào thiếu');
      /* Người mới và người lâu năm phải làm KHÁC nhau. Giống nhau thì
         điều ấy không phải một chỗ rẽ, nó là một câu khẩu hiệu. */
      if (x.moi && x.lauNam && x.moi === x.lauNam)
        loi.push('điều ' + x.so + ' — người mới và người lâu năm làm giống hệt nhau');
    });
    /* Không được cả mười hai đều ĐƯỢC. Một bảng tay nghề mà máy làm
       được hết là một bảng đã hạ chuẩn để đạt điểm. */
    var d = G.tnDo();
    if (d.khong === 0 && d.motNua === 0)
      loi.push('cả mười hai điều đều khai máy làm được — bảng đã hạ chuẩn để đạt điểm');
    if (!(G.TN_LUAT || {}).khongTuNangDiem) loi.push('chưa khai luật không tự nâng điểm');
    return { chuaDo: false, loi: loi, so: ds.length };
  };

  G.tnSoiGhiDe = function () {
    var ds = G.TN_GHIDE || [], w = G.DC1K_WOW || [], k = G.DC1K_KHOA || [], loi = [];
    if (!ds.length) return { chuaDo: false, loi: [], so: 0 };
    var co = {};
    w.forEach(function (x) { co[x.ma] = 1; });
    k.forEach(function (x) { co[x.ma] = 1; });
    ds.forEach(function (x) {
      if (!co[x.ma]) loi.push('ghi đè "' + x.ma + '" trỏ vào chỗ trống — câu người viết sẽ ' +
        'không bao giờ hiện ra');
      if (!x.vi) loi.push('ghi đè ' + x.ma + ' chưa nói vì sao cần người viết');
      if (!x.cham && !x.giuChan) loi.push('ghi đè ' + x.ma + ' không có nội dung');
    });
    return { chuaDo: false, loi: loi, so: ds.length };
  };

  /* ═══════════════════════════════════════════════════════════
     MÀN HÌNH
     ═══════════════════════════════════════════════════════════ */
  G.VIEWS['diem-cham-1000'] = function () {
    if (!G.DC1K_WOW)
      return U.empty('Chưa mở được phần này',
        'Bộ điểm chạm nằm trong gói nghề. Đăng nhập bằng tài khoản có quyền nghề để nạp.');

    var d = G.dcDo(), t = G.tnDo();
    var lech = [].concat(G.dcSoiDu().loi || [], G.dcSoiCoach().loi || [],
      G.dcSoiNguon().loi || [], G.tnSoiDieu().loi || [], G.tnSoiGhiDe().loi || []);

    var o = U.ph({ eyebrow: 'ĐIỂM CHẠM · 1000 WOW · 1000 KHOÁ', ic: 'sparkle', grad: 1,
      t: 'Năm trăm chốt, hai người, hai nghìn khoảnh khắc',
      lead: (G.DC1K_WOW ? '50 ô cấp độ × 10 nhịp × 2 người. Không khoảnh khắc nào bỏ trống.' : '') });

    /* ── Hai con số phải in ra ── */
    o += '<div class="card mb" style="border-color:' + (lech.length ? '#BE0E16' : '#B4720F') + '56">' +
      '<div style="display:flex;flex-wrap:wrap;gap:20px;align-items:baseline">' +
      '<div style="min-width:200px"><span class="tiny up dim">MÁY CHẠY TRỌN</span><br>' +
      '<b style="font-size:1.9em;color:#0B6675">' + d.phanTramMay + '%</b> ' +
      '<span class="tiny dim">' + d.mayTron + '/' + d.soWow + ' điểm</span></div>' +
      '<div style="min-width:220px;border-left:1px solid var(--gita-vien-2);padding-left:16px">' +
      '<span class="tiny up dim">TAY NGHỀ MÁY ĐẠT</span><br>' +
      '<b style="font-size:1.9em;color:#B4720F">' + t.diem + '/' + t.tong + '</b> ' +
      '<span class="tiny dim">' + t.duoc + ' đủ · ' + t.motNua + ' nửa · ' + t.khong + ' không</span></div>' +
      '</div>' +
      '<p class="tiny mt" style="line-height:1.75;color:#BE0E16"><b>Vì sao không phải 100%:</b> ' +
      h(d.viKhongTramPhanTram) + '</p>' +
      '<p class="tiny mt" style="line-height:1.75">' + h((G.TN_LOI || {}).phaiKemConSo || '') + '</p>' +
      (lech.length ? '<p class="tiny mt" style="line-height:1.7;color:#BE0E16"><b>LỆCH: ' +
        h(lech.slice(0, 4).join(' · ')) + '</b></p>' : '') + '</div>';

    /* ── Coach vào hay không ── */
    o += U.sec('Coach can thiệp hay không — ba mức, dẫn từ luật', '');
    o += '<div class="card mb">' + Object.keys(MUC).map(function (m) {
      var so = d.theoMuc[m] || 0;
      return '<div style="padding:10px 0;border-bottom:1px solid var(--gita-vien-2)">' +
        '<b class="sm" style="color:' + MUC[m].c + '">' + h(MUC[m].ten) + '</b> ' +
        '<b style="font-size:1.3em;color:' + MUC[m].c + '">' + so + '</b> ' +
        '<span class="tiny dim">điểm</span>' +
        '<p class="tiny mt" style="line-height:1.75">' +
        h(m === 'BAT_BUOC' ? 'Nhịp 03 Chẩn đoán và nhịp 09 Nâng cấp. BV_NHIP_LUAT: hai nhịp này ' +
            'LUÔN có người thật, không có ngoại lệ.'
          : m === 'TUY_CHON' ? 'Ô cấp độ có khai cột "người làm". Coach vào thì nhanh hơn; không ' +
            'vào thì máy vẫn chạy trọn nhịp.'
          : 'Ô không khai việc người. Máy chạy trọn, Coach chỉ đọc lại nếu muốn.') + '</p></div>';
    }).join('') + '</div>';

    o += G.kaKhung ? G.kaKhung('diem-cham-1000', 'dau') : '';

    /* ── Mười hai điều tay nghề ── */
    var tl = G.TN_LOI || {};
    o += U.sec('Mười hai chỗ người mới và người lâu năm rẽ hai đường', tl.khacODau || '');
    o += '<div class="card mb" style="border-color:#B4720F56">' +
      '<p class="tiny" style="line-height:1.75">' + h(tl.khongPhaiToanBo || '') + '</p>' +
      '<p class="tiny mt" style="line-height:1.75;color:#0B6675"><b>' + h(tl.choMayHonNguoi || '') +
      '</b></p></div>';
    o += '<div class="card mb">' + (G.TN_DIEU || []).map(function (x) {
      var c = x.may === 'DUOC' ? '#0B6675' : (x.may === 'MOT_NUA' ? '#B4720F' : '#BE0E16');
      var n = x.may === 'DUOC' ? 'MÁY LÀM ĐƯỢC' : (x.may === 'MOT_NUA' ? 'MÁY LÀM ĐƯỢC MỘT NỬA' : 'MÁY KHÔNG LÀM ĐƯỢC');
      return '<div style="padding:12px 0;border-bottom:1px solid var(--gita-vien-2)">' +
        '<b class="sm">' + x.so + '. ' + h(x.ten) + '</b> ' +
        '<span class="tiny up" style="color:' + c + '">' + n + '</span>' +
        (x.mayHonNguoi ? ' <span class="tiny up" style="color:#0B6675">MÁY HƠN NGƯỜI</span>' : '') +
        '<p class="tiny mt" style="line-height:1.75;color:#BE0E16"><b>Người mới:</b> ' + h(x.moi) + '</p>' +
        '<p class="tiny" style="line-height:1.75;color:#0B6675"><b>Ba mươi năm:</b> ' + h(x.lauNam) + '</p>' +
        '<p class="tiny mt" style="line-height:1.75"><b>Dấu hiệu tự soi:</b> ' + h(x.dauHieu) + '</p>' +
        (x.viKhong ? '<p class="tiny mt" style="line-height:1.75;color:#BE0E16">' + h(x.viKhong) + '</p>' : '') +
        (x.viMotNua ? '<p class="tiny mt" style="line-height:1.75;color:#B4720F">' + h(x.viMotNua) + '</p>' : '') +
        '<p class="tiny mt" style="line-height:1.75;color:' + c + '"><b>Máy làm:</b> ' + h(x.mayLam) + '</p>' +
        (x.viDangKe ? '<p class="tiny mt" style="line-height:1.75;color:#0B6675">' + h(x.viDangKe) + '</p>' : '') +
        '<p class="tiny dim" style="line-height:1.7">' + h(x.tuKho) + '</p></div>';
    }).join('') + '</div>';

    /* ── Mẫu điểm chạm: một ô, đủ mười nhịp, hai lăng kính ── */
    var mauO = 'T3-C07';
    o += U.sec('Một ô đọc dọc — ' + mauO + ', mười nhịp, hai người',
      'Hai mươi điểm chạm của cùng một khoảnh khắc trong hành trình.');
    o += '<div class="card mb">' + (G.DC1K_WOW || [])
      .filter(function (x) { return x.ma.indexOf('W-' + mauO) === 0; })
      .map(function (x) {
        var full = G.dcDiem(x.ma), w = full.wow, k = full.khoa || {};
        var c = MUC[x.coach] ? MUC[x.coach].c : '#655F7E';
        return '<div style="padding:11px 0;border-bottom:1px solid var(--gita-vien-2)">' +
          '<span class="tiny up dim">' + h(x.ma) + '</span> ' +
          '<span class="tiny up" style="color:' + c + '">' + h(MUC[x.coach].ten) + '</span>' +
          (w.nguoiViet ? ' <span class="tiny up" style="color:#5140B4">NGƯỜI VIẾT</span>' : '') +
          '<p class="tiny mt" style="line-height:1.75"><b>' + h(w.khi) + '</b></p>' +
          '<p class="tiny" style="line-height:1.75;padding-left:12px;border-left:3px solid ' + c +
          '">' + h(w.cham) + '</p>' +
          '<p class="tiny mt" style="line-height:1.75;color:#0B6675"><b>WOW:</b> ' + h(w.wow) + '</p>' +
          (k.giuChan ? '<p class="tiny" style="line-height:1.75;color:#B4720F"><b>Khoá:</b> ' +
            h(k.giuChan) + ' · <b>nhu cầu:</b> ' + h(k.tu) + ' → ' + h(k.sang) + '</p>' : '') +
          '<p class="tiny dim" style="line-height:1.7">' + h(w.viCoach) + '</p></div>';
      }).join('') + '</div>';

    /* ── Người viết đè lên máy ghép ── */
    o += U.sec('Chỗ người viết đè lên câu máy ghép — ' + (G.TN_GHIDE || []).length + ' chỗ',
      (G.TN_GHIDE_LUAT || {}).itLaCoY || '');
    o += '<div class="card mb">' + (G.TN_GHIDE || []).map(function (x) {
      return '<div style="padding:10px 0;border-bottom:1px solid var(--gita-vien-2)">' +
        '<b class="tiny up" style="color:#5140B4">' + h(x.ma) + '</b>' +
        '<p class="tiny mt" style="line-height:1.75;padding-left:12px;border-left:3px solid #5140B4">' +
        h(x.cham || x.giuChan) + '</p>' +
        '<p class="tiny mt" style="line-height:1.75">' + h(x.vi) + '</p></div>';
    }).join('') + '</div>';

    o += U.sec('Luật của bộ này', '');
    var l = G.TN_LUAT || {};
    o += '<div class="card mb">' + Object.keys(l).map(function (k) {
      return '<p class="tiny" style="line-height:1.75;padding:4px 0">• ' + h(l[k]) + '</p>';
    }).join('') + '</div>';

    o += G.kaKhung ? G.kaKhung('diem-cham-1000', 'cuoi') : '';
    return o;
  };
})();
