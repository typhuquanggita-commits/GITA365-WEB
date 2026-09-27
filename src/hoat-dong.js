/* ═══════════════════════════════════════════════════════════════
   GITA 365 — MÁY CHẠY BẢNG ĐĂNG KÝ HOẠT ĐỘNG

   Kho ở kho-goc/data.hoat-dong.js. Toàn bộ ở gói NGHỀ.

   ═══ CÂU CHỈ MÀN NÀY TRẢ LỜI ĐƯỢC ═══

       Có việc nào trong hệ đang không ai nhận không.

   Mọi màn khác trả lời "việc của tôi hôm nay là gì". Màn này trả lời
   câu ngược lại, và đó là câu không ai hỏi cho tới lúc một việc đã rơi
   mất ba tháng.

   ═══ "MỘT TRĂM PHẦN TRĂM" NGHĨA LÀ GÌ Ở ĐÂY ═══

   Chủ hệ giao xử lý tự động một trăm phần trăm. Kho đã cấm bốn lần
   việc máy làm thay người ở chỗ ký tên, chẩn đoán, nâng tầng, gửi
   thẳng cho gia đình. Nên con số một trăm ở đây đo thứ khác:

       một trăm phần trăm hoạt động khai đủ NĂM Ô
       ai · kích hoạt · máy làm sẵn gì · hạn · rơi về đâu

   hdDo() trả về đúng con số ấy, và nó hiện lên đầu màn. Nếu có ngày ai
   thêm một hoạt động mà quên một ô, con số tụt xuống dưới một trăm và
   người đọc thấy ngay — chứ không phải đọc một chữ "đã tự động hoá".

   ═══ BỐN CÁI KHOÁ ═══

   hdSoiChuTroi()  không hoạt động nào thiếu một trong năm ô.
   hdSoiCamMay()   không hoạt động mức MAY nào chạm bốn việc cấm.
   hdSoiManNoi()   màn khai ở mỗi hoạt động phải có thật trong G.VIEWS.
   hdSoiDuongRoi() đường rơi phải trỏ sang chỗ KHÁC, không quay về
                   chính người đang giữ việc.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;
G.VIEWS = G.VIEWS || {};

(function () {
  var U = G.U, h = U.h;
  var NAM_O = ['ai', 'kich', 'may', 'han', 'roi'];

  /* ═══════════ ĐO ═══════════ */
  G.hdDo = function () {
    var ds = G.DKH_VIEC || [];
    if (!ds.length) return { chuaDo: true, thieu: 'DKH_VIEC' };
    var du = ds.filter(function (v) {
      return NAM_O.every(function (o) { return v[o] && String(v[o]).trim(); });
    });
    var theoMuc = {};
    (G.DKH_MUC || []).forEach(function (m) { theoMuc[m.ma] = 0; });
    ds.forEach(function (v) { if (theoMuc[v.muc] !== undefined) theoMuc[v.muc]++; });
    var theoNhom = {};
    ds.forEach(function (v) { theoNhom[v.nhom] = (theoNhom[v.nhom] || 0) + 1; });

    return {
      tong: ds.length, duNamO: du.length,
      phanTram: ds.length ? Math.round(du.length / ds.length * 100) : 0,
      thieuO: ds.filter(function (v) {
        return !NAM_O.every(function (o) { return v[o] && String(v[o]).trim(); });
      }).map(function (v) {
        return { ma: v.ma, ten: v.ten,
          thieu: NAM_O.filter(function (o) { return !(v[o] && String(v[o]).trim()); }) };
      }),
      theoMuc: theoMuc, theoNhom: theoNhom,
      /* Con số này KHÔNG phải "máy làm bao nhiêu phần trăm". Trộn hai
         con số ấy là chỗ mọi báo cáo tự động hoá nói dối. */
      mayChayHet: theoMuc.MAY || 0,
      mayDonSan: theoMuc.MAY_SAN || 0,
      chiNguoi: theoMuc.NGUOI || 0,
      luat: (G.DKH_LUAT || {}).motTramPhanTramLaGi || ''
    };
  };

  /* Hoạt động của một vai — dùng để trả lời "việc của vai này gồm gì". */
  G.hdTheoNhom = function (nhom) {
    return (G.DKH_VIEC || []).filter(function (v) { return !nhom || v.nhom === nhom; });
  };

  /* Một hoạt động, kèm kho tài liệu đã nối và kho nào chưa có thật. */
  G.hdViec = function (ma) {
    var v = (G.DKH_VIEC || []).filter(function (x) { return x.ma === ma; })[0];
    if (!v) return { khongCo: true, ma: ma };
    var kho = String(v.tuKho || '').split('·').map(function (s) { return s.trim(); })
      .filter(Boolean);
    var noi = kho.map(function (k) {
      /* Tên kho có thể kèm chú thích: "BV_DO #17", "BV_CONG_LUAT luật 6",
         "BLV_DUYET_DIEU số 3". Lấy phần đầu làm tên kho thật. */
      var ten = (k.match(/^[A-Z][A-Z0-9_]*/) || [])[0];
      var ham = /\(\)$/.test(k) ? k.replace(/\(\)$/, '') : null;
      var coThat = ham ? typeof G[ham] === 'function' : (ten ? G[ten] !== undefined : false);
      return { khai: k, ten: ten || ham, coThat: coThat, laHam: !!ham };
    });
    var m = (G.DKH_MUC || []).filter(function (x) { return x.ma === v.muc; })[0] || {};
    return {
      viec: v, muc: m, kho: noi,
      khoThieu: noi.filter(function (x) { return !x.coThat; }).map(function (x) { return x.khai; }),
      manCoThat: !!(v.manNoi && G.VIEWS && G.VIEWS[v.manNoi])
    };
  };

  /* ═══════════ KHOÁ 1: KHÔNG VIỆC NÀO CHỦ TRÔI ═══════════ */
  G.hdSoiChuTroi = function () {
    var ds = G.DKH_VIEC || [], loi = [], thay = {};
    if (!ds.length) return { chuaDo: true, thieu: 'DKH_VIEC', loi: [] };
    ds.forEach(function (v) {
      if (thay[v.ma]) loi.push(v.ma + ' trùng mã');
      thay[v.ma] = 1;
      NAM_O.forEach(function (o) {
        if (!(v[o] && String(v[o]).trim())) loi.push(v.ma + ' thiếu ô ' + o);
      });
      if (!v.muc) loi.push(v.ma + ' chưa khai mức tự động');
      else if (!(G.DKH_MUC || []).filter(function (m) { return m.ma === v.muc; })[0])
        loi.push(v.ma + ' mang mức "' + v.muc + '" không có trong DKH_MUC');
      /* "Ai đó" và "bộ phận liên quan" là cách một bảng phân công nói
         rằng nó chưa phân công. */
      if (/ai đó|bộ phận liên quan|các bên/i.test(String(v.ai)))
        loi.push(v.ma + ' ghi người chịu trách nhiệm chung chung: "' + v.ai + '"');
    });
    if (!(G.DKH_LUAT || {}).khongCoAiDo) loi.push('chưa khai luật không có "ai đó"');
    return { chuaDo: false, loi: loi, so: ds.length };
  };

  /* ═══════════ KHOÁ 2: BỐN VIỆC MÁY KHÔNG ĐƯỢC NHẬN ═══════════

     Đây là khoá quan trọng nhất của màn này. Chủ hệ giao "tự động 100%",
     và cách dễ nhất để đạt con số ấy là để máy nhận nốt bốn việc cuối.
     Bốn việc ấy đúng là bốn việc cả hệ dựng lên để bảo vệ. */
  G.hdSoiCamMay = function () {
    var ds = G.DKH_VIEC || [], cam = G.DKH_CAM_MAY || [], loi = [];
    if (!ds.length || !cam.length)
      return { chuaDo: true, thieu: !ds.length ? 'DKH_VIEC' : 'DKH_CAM_MAY', loi: [] };
    var tu = /ký tên|ký duyệt|phê duyệt|chẩn đoán|nâng tầng|gửi cho gia đình|gửi thẳng/i;
    ds.forEach(function (v) {
      if (v.muc !== 'MAY') return;
      var chuoi = [v.ten, v.may, v.nguoi].join(' ');
      if (tu.test(chuoi))
        loi.push(v.ma + ' mang mức MAY mà chạm việc cấm: "' + v.ten + '"');
    });
    cam.forEach(function (c) {
      if (!c.tuLuat) loi.push(c.ma + ' chưa dẫn luật gốc');
      if (!c.nguyenVan) loi.push(c.ma + ' chưa dẫn nguyên văn luật');
    });
    /* Việc ký phải tồn tại và phải mang mức NGUOI. Không có việc ký nào
       trong bảng nghĩa là bảng đang giấu chỗ người phải quyết. */
    var ky = ds.filter(function (v) { return /phê duyệt|ký/i.test(v.ten); });
    if (!ky.length) loi.push('bảng không có hoạt động ký nào — chỗ người quyết đang bị giấu');
    ky.forEach(function (v) {
      if (v.muc === 'MAY') loi.push(v.ma + ' là việc ký mà mang mức MAY');
    });
    return { chuaDo: false, loi: loi, soCam: cam.length };
  };

  /* ═══════════ KHOÁ 3: MÀN KHAI PHẢI CÓ THẬT ═══════════ */
  G.hdSoiManNoi = function () {
    var ds = G.DKH_VIEC || [], loi = [];
    if (!ds.length) return { chuaDo: true, thieu: 'DKH_VIEC', loi: [] };
    ds.forEach(function (v) {
      if (!v.manNoi) { loi.push(v.ma + ' chưa khai màn nào chạy nó'); return; }
      if (!(G.VIEWS && G.VIEWS[v.manNoi]))
        loi.push(v.ma + ' khai màn "' + v.manNoi + '" mà màn ấy không có trong G.VIEWS');
      if (!v.tuKho) loi.push(v.ma + ' chưa khai lấy tài liệu từ kho nào');
    });
    return { chuaDo: false, loi: loi, so: ds.length };
  };

  /* ═══════════ KHOÁ 4: ĐƯỜNG RƠI PHẢI TRỎ SANG CHỖ KHÁC ═══════════

     Một đường rơi quay về chính người đang giữ việc không phải đường
     rơi — đó là một vòng lặp, và nó trông giống một quy trình đầy đủ
     hơn bất cứ chỗ hụt nào khác trong bảng. */
  G.hdSoiDuongRoi = function () {
    var ds = G.DKH_VIEC || [], loi = [];
    if (!ds.length) return { chuaDo: true, thieu: 'DKH_VIEC', loi: [] };
    ds.forEach(function (v) {
      var roi = String(v.roi || '');
      if (!/→|:|→/.test(roi) && roi.length < 20)
        loi.push(v.ma + ' đường rơi quá ngắn để nói được nó rơi đi đâu');
      /* Xét chặng CUỐI, không xét chặng đầu. Một đường rơi được phép leo
         một nấc trong chính vai ấy trước — "quá ba ngày → ngăn KHẨN của
         mình, quá bảy ngày → Admin" là đúng. Cái sai là ĐIỂM CUỐI vẫn
         nằm ở người đang giữ việc: lúc ấy việc quay về đúng chỗ nó đã
         không được làm. */
      var chang = roi.split('→');
      var sau = chang[chang.length - 1] || '';
      var vai = String(v.ai || '').split(/·|\s+và\s+/)[0].trim();
      if (vai && sau && sau.indexOf(vai) >= 0 && v.muc !== 'MAY')
        loi.push(v.ma + ' rơi về chính vai đang giữ việc (' + vai + ') — đó là vòng lặp');
    });
    if (!(G.DKH_LUAT || {}).duongRoiPhaiKhac) loi.push('chưa khai luật đường rơi phải khác');
    return { chuaDo: false, loi: loi, so: ds.length };
  };

  /* ═══════════════════════════════════════════════════════════
     MÀN HÌNH
     ═══════════════════════════════════════════════════════════ */
  G.VIEWS['hoat-dong'] = function () {
    if (!G.DKH_VIEC)
      return U.empty('Chưa mở được phần này',
        'Bảng đăng ký hoạt động nằm trong gói nghề. Đăng nhập bằng tài khoản có quyền nghề.');

    var loi = G.DKH_LOI || {}, d = G.hdDo();
    var lech = [].concat(G.hdSoiChuTroi().loi || [], G.hdSoiCamMay().loi || [],
      G.hdSoiManNoi().loi || [], G.hdSoiDuongRoi().loi || []);

    var o = U.ph({ eyebrow: 'ĐĂNG KÝ HOẠT ĐỘNG', ic: 'grid', grad: 1,
      t: 'Có việc nào trong hệ đang không ai nhận không',
      lead: loi.la || '' });

    /* ── Con số một trăm, và nói rõ nó đo cái gì ── */
    o += '<div class="card mb" style="border-color:' +
      (d.phanTram === 100 && !lech.length ? '#0B667556' : '#BE0E16') + '">' +
      '<div style="display:flex;flex-wrap:wrap;gap:18px;align-items:baseline">' +
      '<div style="min-width:170px"><span class="tiny up dim">CÓ ĐỦ NĂM Ô</span><br>' +
      '<b style="font-size:1.9em;color:' + (d.phanTram === 100 ? '#0B6675' : '#BE0E16') + '">' +
      d.phanTram + '%</b> <span class="tiny dim">' + d.duNamO + '/' + d.tong + ' hoạt động</span></div>' +
      (G.DKH_MUC || []).map(function (m) {
        var so = d.theoMuc[m.ma] || 0;
        return '<div style="min-width:150px;border-left:1px solid var(--gita-vien-2);padding-left:14px">' +
          '<span class="tiny up" style="color:' + m.c + '">' + h(m.ten) + '</span><br>' +
          '<b style="font-size:1.5em;color:' + m.c + '">' + so + '</b></div>';
      }).join('') + '</div>' +
      '<p class="tiny mt" style="line-height:1.75;color:#B4720F"><b>' + h(loi.motTramPhanTram || '') +
      '</b></p>' +
      '<p class="tiny mt" style="line-height:1.75">' + h(d.luat) + '</p>' +
      (lech.length ? '<p class="tiny mt" style="line-height:1.7;color:#BE0E16"><b>LỆCH: ' +
        h(lech.join(' · ')) + '</b></p>' : '') + '</div>';

    o += '<div class="card mb" style="border-color:#B4720F56">' +
      '<b class="sm" style="color:#B4720F">Ô đắt nhất là ô "rơi về đâu"</b>' +
      '<p class="tiny mt" style="line-height:1.75">' + h(loi.oDatNhat || '') + '</p></div>';

    o += G.kaKhung ? G.kaKhung('hoat-dong', 'dau') : '';

    /* ── Bốn việc máy không được nhận ── */
    o += U.sec('Bốn việc máy KHÔNG được nhận', 'Kể cả khi dựng được, và kể cả khi đang thiếu người.');
    o += '<div class="card mb" style="border-color:#BE0E1656">' + (G.DKH_CAM_MAY || []).map(function (c) {
      return '<div style="padding:9px 0;border-bottom:1px solid var(--gita-vien-2)">' +
        '<b class="sm" style="color:#BE0E16">' + h(c.viec) + '</b> ' +
        '<span class="tiny dim">' + h(c.tuLuat) + '</span>' +
        '<p class="tiny mt" style="line-height:1.75">' + h(c.nguyenVan) + '</p></div>';
    }).join('') + '</div>';

    /* ── Ba mức tự động ── */
    o += U.sec('Ba mức tự động', 'Không có mức thứ tư, và không có mức "máy tự quyết".');
    o += '<div class="card mb">' + (G.DKH_MUC || []).map(function (m) {
      return '<div style="padding:9px 0;border-bottom:1px solid var(--gita-vien-2)">' +
        '<b class="sm" style="color:' + m.c + '">' + h(m.ten) + '</b> ' +
        '<span class="tiny dim">' + (d.theoMuc[m.ma] || 0) + ' hoạt động</span>' +
        '<p class="tiny mt" style="line-height:1.75">' + h(m.la) + '</p>' +
        '<p class="tiny dim" style="line-height:1.75">Được phép: ' + h(m.duocPhep) + '</p>' +
        (m.viDayLaMucQuanTrongNhat ? '<p class="tiny mt" style="line-height:1.75;color:#5140B4">' +
          h(m.viDayLaMucQuanTrongNhat) + '</p>' : '') +
        (m.theoLuat ? '<p class="tiny dim" style="line-height:1.75">' + h(m.theoLuat) + '</p>' : '') +
        '</div>';
    }).join('') + '</div>';

    /* ── Từng nhóm vai ── */
    Object.keys(d.theoNhom).forEach(function (nhom) {
      var ds = G.hdTheoNhom(nhom);
      o += U.sec(nhom + ' — ' + ds.length + ' hoạt động', '');
      o += '<div class="card mb">' + ds.map(function (v) {
        var x = G.hdViec(v.ma);
        var m = x.muc || {};
        return '<div style="padding:11px 0;border-bottom:1px solid var(--gita-vien-2)">' +
          '<b class="sm">' + h(v.ma) + ' · ' + h(v.ten) + '</b> ' +
          '<span class="tiny up" style="color:' + (m.c || '#655F7E') + '">' + h(m.ten || v.muc) +
          '</span>' +
          '<p class="tiny mt" style="line-height:1.75"><b>Ai:</b> ' + h(v.ai) +
          ' · <b>Hạn:</b> ' + h(v.han) + '</p>' +
          '<p class="tiny" style="line-height:1.75"><b>Kích hoạt:</b> ' + h(v.kich) + '</p>' +
          '<p class="tiny" style="line-height:1.75;color:#0B6675"><b>Máy làm sẵn:</b> ' +
          h(v.may) + '</p>' +
          '<p class="tiny" style="line-height:1.75"><b>Người làm:</b> ' + h(v.nguoi) + '</p>' +
          '<p class="tiny" style="line-height:1.75;color:#B4720F"><b>Không ai làm thì:</b> ' +
          h(v.roi) + '</p>' +
          '<p class="tiny dim mt" style="line-height:1.7">Tài liệu tự nối: ' + h(v.tuKho) +
          ' · màn <b>' + h(v.manNoi) + '</b>' +
          (x.manCoThat ? '' : ' <span style="color:#BE0E16">(MÀN KHÔNG CÓ THẬT)</span>') +
          (x.khoThieu.length ? ' <span style="color:#BE0E16">· kho chưa có: ' +
            h(x.khoThieu.join(', ')) + '</span>' : '') + '</p></div>';
      }).join('') + '</div>';
    });

    o += U.sec('Luật của bảng này', '');
    var hl = G.DKH_LUAT || {};
    o += '<div class="card mb">' + Object.keys(hl).map(function (k) {
      return '<p class="tiny" style="line-height:1.75;padding:4px 0">• ' + h(hl[k]) + '</p>';
    }).join('') + '</div>';

    o += G.kaKhung ? G.kaKhung('hoat-dong', 'cuoi') : '';
    return o;
  };
})();
