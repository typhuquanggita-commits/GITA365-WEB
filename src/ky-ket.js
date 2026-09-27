/* ═══════════════════════════════════════════════════════════════
   GITA 365 · v9.67 — MÀN HƯỚNG DẪN KÝ KẾT

   Kho chuẩn ở kho-goc/data.ky-ket.js. Ba phép kiểm làm việc thật:

   1. kkSoiLuong()  — mỗi bước trỏ vào mã hợp đồng, mã cấp chữ ký và
      mã bằng chứng CÓ THẬT ở kho khác. Đây là chỗ đắt nhất: một
      hướng dẫn trỏ vào hợp đồng không tồn tại thì người làm theo nó
      sẽ đứng trước thư viện và không tìm ra gì.

   2. kkSoiKhongVuotCap() — không bước nào dùng chữ ký cấp C1 cho
      loại văn bản mà HSH_KY nói phải dùng C3. Tài liệu gốc gọi đây
      là "điểm dễ sai nhất", và nó là một trong hai điều máy canh
      được thay người trong cả bộ hồ sơ.

   3. kkSoiChon() — cây chọn phải phủ hết mười sáu hợp đồng và không
      hợp đồng nào bị hai nhánh cùng chọn.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;
G.VIEWS = G.VIEWS || {};

(function () {
  var U = G.U, h = U.h;

  function baLuong() {
    return [G.KK_A, G.KK_B, G.KK_C].filter(Boolean);
  }

  G.kkBuoc = function () {
    var ra = [];
    baLuong().forEach(function (L) {
      (L.buoc || []).forEach(function (b) { ra.push({ luong: L.ma, b: b }); });
    });
    return ra;
  };

  /* ═══════════ KHOÁ 1: MỌI MỐI NỐI PHẢI TRỎ VÀO CHỖ CÓ THẬT ═══════════ */
  G.kkSoiLuong = function () {
    var L = baLuong(), loi = [];
    if (L.length !== 3) return { chuaDo: true, thieu: 'KK_A / KK_B / KK_C', loi: [] };

    var coHD = {}, coKy = {}, coBC = {};
    (G.HSH_HD || []).forEach(function (x) { coHD[x.ma] = 1; });
    (G.HSH_KY || []).forEach(function (x) { coKy[x.ma] = 1; });
    (G.BCD_THAOTAC || []).forEach(function (x) { coBC[x.ma] = 1; });
    var coVB = {};
    (G.RSP_VB || []).forEach(function (x) { coVB[x.ma] = 1; });
    if (!Object.keys(coHD).length) return { chuaDo: true, thieu: 'HSH_HD', loi: [] };

    L.forEach(function (x) {
      ['ten', 'khiNao', 'nguy', 'buoc'].forEach(function (k) {
        if (!x[k]) loi.push('luồng ' + x.ma + ' thiếu ô ' + k);
      });
      var thay = {};
      (x.buoc || []).forEach(function (b) {
        if (thay[b.ma]) loi.push(b.ma + ' trùng mã');
        thay[b.ma] = 1;
        ['viec', 'ai'].forEach(function (k) {
          if (!b[k]) loi.push(b.ma + ' thiếu ô ' + k);
        });
        /* Bước không có bẫy là bước chưa ai làm hỏng bao giờ — và
           bước như thế thì không cần viết ra. */
        if (!b.bay) loi.push(b.ma + ' không khai cạm bẫy');

        /* Mọi mã trỏ đi đều phải có thật. Ô hd có thể kể nhiều mã
           trong một câu, nên bóc từng mã HĐ-xx ra mà kiểm. */
        (String(b.hd || '').match(/(HĐ|VB)-\d\d/g) || []).forEach(function (m) {
          if (coHD[m]) return;
          /* Được phép trỏ vào văn bản CHƯA SOẠN — nhưng phải khai, và
             phải nói chỗ chặn. Giấu đi thì người làm theo hướng dẫn
             đi tìm một hợp đồng không tồn tại và tưởng mình tra sót. */
          if (coVB[m] && b.chuaSoan) {
            if (!b.chan) loi.push(b.ma + ' trỏ vào ' + m + ' chưa soạn mà không nói chỗ chặn');
            return;
          }
          if (coVB[m])
            loi.push(b.ma + ' trỏ vào ' + m + ' — văn bản ấy mới ở danh mục cần bổ sung, ' +
              'bước phải khai chuaSoan');
          else loi.push(b.ma + ' trỏ vào ' + m + ' — hợp đồng ấy không có thật');
        });
        (String(b.ky || '').match(/\bC[123]\b/g) || []).forEach(function (m) {
          if (!coKy[m]) loi.push(b.ma + ' trỏ vào cấp chữ ký ' + m + ' — không có trong HSH_KY');
        });
        (String(b.bang || '').match(/BC\d\d/g) || []).forEach(function (m) {
          if (!coBC[m]) loi.push(b.ma + ' trỏ vào bằng chứng ' + m + ' — không có trong BCD_THAOTAC');
        });
      });
    });

    if ((G.KK_CUA || []).length !== 7)
      loi.push('phải có bảy cửa trước khi ký, đang có ' + (G.KK_CUA || []).length);
    (G.KK_CUA || []).forEach(function (c) {
      ['cua', 'hoi', 'khongQua'].forEach(function (k) {
        if (!c[k]) loi.push('cửa ' + c.so + ' thiếu ô ' + k);
      });
    });
    /* Bước ký cấp C2 hoặc C3 thì phải khai được nó ký VĂN BẢN NÀO —
       nếu không, hạ cấp chữ ký sẽ không ai thấy, vì xoá ô ký là xoá
       luôn dấu vết bước ấy ký gì.

       Chỉ soi C2 và C3. C1 là xác nhận một THAO TÁC trong hệ — cấp
       quyền, gắn mốc nhắc hạn, ghi một lượt đồng ý — nó không ký văn
       bản nào, và bắt nó khai là bắt oan. */
    G.kkBuoc().forEach(function (z) {
      var b = z.b;
      if (!/\bC[23]\b/.test(String(b.ky || ''))) return;
      if (!/(HĐ|VB)-\d\d|BM-/.test(String(b.hd || '') + String(b.bm || '')))
        loi.push(b.ma + ' ký cấp C2 hoặc C3 mà không khai ký văn bản nào ở ô hd hoặc ô bm');
    });
    if (!(G.KK_LUONG_LUAT || {}).maKhaiOHopDong)
      loi.push('chưa khai luật mã hợp đồng khai ở ô hd');
    if (!(G.KK_LUONG_LUAT || {}).troVaoVanBanChuaSoan)
      loi.push('chưa khai luật trỏ vào văn bản chưa soạn');
    if (!(G.KK_LUONG_LUAT || {}).moiBuocTroDuoc) loi.push('chưa khai luật mọi bước phải trỏ được');
    if (!(G.KK_LUAT || {}).huongDanKhongPhaiYKien)
      loi.push('chưa khai câu hướng dẫn không phải ý kiến pháp lý');
    return { chuaDo: false, loi: loi, soLuong: L.length, soBuoc: G.kkBuoc().length };
  };

  /* ═══════════ KHOÁ 2: KHÔNG DÙNG C1 CHO VIỆC ĐÒI C3 ═══════════

     Tài liệu gọi đây là điểm dễ sai nhất: tài khoản đăng nhập (C1)
     là bằng chứng tốt cho phê duyệt nội bộ, nhưng KHÔNG thay được
     chữ ký số ở giao dịch mà pháp luật đòi hỏi.

     Phép này không đọc lời khai. Nó lấy danh sách "dùng cho" của
     chính cấp C3 trong HSH_KY, rút ra các loại văn bản đòi C3, rồi
     soi từng bước xem bước nào nói tới loại ấy mà lại khai cấp thấp
     hơn. Ngày ai sửa HSH_KY thì phép này đổi theo, không phải sửa
     hai chỗ. */
  var LOAI_C3 = [
    { ten: 'đầu tư',   re: /đầu tư/i },
    { ten: 'cổ đông',  re: /cổ đông/i },
    { ten: 'lao động', re: /lao động/i },
    { ten: 'hoá đơn',  re: /ho[áa] đơn/i }
  ];

  G.kkSoiKhongVuotCap = function () {
    var ky = G.HSH_KY || [], hd = G.HSH_HD || [], loi = [];
    if (!ky.length) return { chuaDo: true, thieu: 'HSH_KY', loi: [] };
    if (!hd.length) return { chuaDo: true, thieu: 'HSH_HD', loi: [] };
    var c3 = ky.filter(function (x) { return x.ma === 'C3'; })[0];
    if (!c3) return { chuaDo: true, thieu: 'HSH_KY cấp C3', loi: [] };

    /* Mẫu tự kiểm — bốn loại rút ra phải thật sự nằm trong ô dùng-cho
       của C3. Không nằm thì phép này đang canh một luật mà bảng chữ
       ký không nói. */
    LOAI_C3.forEach(function (t) {
      if (!t.re.test(String(c3.dung)))
        loi.push('MẪU HỎNG · "' + t.ten + '" không có trong ô dùng-cho của cấp C3');
    });

    /* Mã hợp đồng nào thuộc loại đòi C3 — đọc từ TÊN hợp đồng trong
       HSH_HD, không đọc từ danh sách chép tay.

       Bản đầu của phép này chỉ tìm chữ "lao động" trong câu của bước,
       và nó CÂM: bước A6 nói "KÝ — chọn đúng cấp chữ ký" rồi trỏ vào
       HĐ-16, mà trong cả bước không có chữ "lao động" nào. Hạ A6
       xuống C1 thì không ai thấy. Nối theo MÃ mới bắt được. */
    var maC3 = {};
    hd.forEach(function (x) {
      LOAI_C3.forEach(function (t) {
        if (t.re.test(String(x.ten))) maC3[x.ma] = t.ten;
      });
    });
    if (!Object.keys(maC3).length)
      loi.push('MẪU HỎNG · không mã hợp đồng nào rơi vào bốn loại đòi C3 — phép đang canh rỗng');

    function capTrongManh(manh) {
      if (/\bC3\b/.test(manh)) return 'C3';
      var m = manh.match(/\bC[12]\b/);
      return m ? m[0] : '';
    }

    G.kkBuoc().forEach(function (x) {
      var b = x.b, oKy = String(b.ky || '');
      if (!oKy) return;
      var manh = oKy.split('·');

      /* Đường 1 — theo MÃ hợp đồng. Mã nào thuộc loại đòi C3 thì
         mảnh ô ký nhắc tới mã ấy phải là C3; ô ký không nhắc mã nào
         thì cả ô áp cho mọi mã của bước. */
      var maTrongBuoc = (String(b.hd || '') + ' ' + oKy).match(/HĐ-\d\d/g) || [];
      maTrongBuoc.forEach(function (m) {
        if (!maC3[m]) return;
        var chua = manh.filter(function (z) { return z.indexOf(m) >= 0; });
        var soi = chua.length ? chua : (/HĐ-\d\d/.test(oKy) ? [] : manh);
        soi.forEach(function (z) {
          var cap = capTrongManh(z);
          if (cap && cap !== 'C3')
            loi.push(b.ma + ' — ' + m + ' là ' + maC3[m] + ', khai cấp chữ ký ' + cap +
              ' trong khi HSH_KY xếp loại này ở C3');
        });
      });

      /* Đường 2 — theo CHỮ trong câu, cho việc không gắn mã hợp đồng
         nào, ví dụ xuất hoá đơn. */
      LOAI_C3.forEach(function (t) {
        if (!t.re.test(String(b.viec) + ' ' + oKy)) return;
        manh.forEach(function (z) {
          if (manh.length > 1 && !t.re.test(z)) return;
          var cap = capTrongManh(z);
          if (cap && cap !== 'C3')
            loi.push(b.ma + ' — việc "' + t.ten + '" mà khai cấp chữ ký ' + cap +
              ', trong khi HSH_KY xếp loại này ở C3');
        });
      });
    });

    if (!(G.HSH_KY_LUAT || {}).diemDeSaiNhat) loi.push('HSH_KY chưa khai điểm dễ sai nhất');
    if (!(G.KK_CAM || []).length) loi.push('KK_CAM trống — không có danh sách việc cấm khi ký');
    return { chuaDo: false, loi: loi, soLoai: LOAI_C3.length,
      soMaC3: Object.keys(maC3).length };
  };

  /* ═══════════ KHOÁ 3: CÂY CHỌN PHỦ HẾT VÀ KHÔNG TRÙNG ═══════════ */
  G.kkSoiChon = function () {
    var ds = G.KK_CHON || [], hd = G.HSH_HD || [], loi = [];
    if (!ds.length) return { chuaDo: true, thieu: 'KK_CHON', loi: [] };
    if (!hd.length) return { chuaDo: true, thieu: 'HSH_HD', loi: [] };

    var dem = {}, coHD = {};
    hd.forEach(function (x) { coHD[x.ma] = 1; });
    ds.forEach(function (x) {
      if (!x.hoi || !x.thi || !x.luong) { loi.push('một nhánh thiếu ô hỏi, thì hoặc luồng'); return; }
      if (!coHD[x.thi]) loi.push('nhánh dẫn tới ' + x.thi + ' — hợp đồng ấy không có thật');
      dem[x.thi] = (dem[x.thi] || 0) + 1;
      if (['A', 'B', 'C'].indexOf(x.luong) < 0)
        loi.push(x.thi + ' xếp vào luồng "' + x.luong + '" không hợp lệ');
      /* Câu hỏi phải hỏi về BẢN CHẤT. Câu chỉ nhắc lại tên hợp đồng
         thì không giúp ai chọn. */
      if (/HĐ-\d\d/.test(String(x.hoi)))
        loi.push(x.thi + ' — câu hỏi nhắc lại mã hợp đồng thay vì hỏi về bản chất');
    });

    Object.keys(dem).forEach(function (m) {
      if (dem[m] > 1) loi.push(m + ' bị ' + dem[m] + ' nhánh cùng chọn — câu hỏi chưa đủ sắc');
    });
    hd.forEach(function (x) {
      if (!dem[x.ma]) loi.push(x.ma + ' không có nhánh nào dẫn tới — ngày cần nó không ai tìm ra');
    });

    if (!(G.KK_CHON_LUAT || {}).phuHetMuoiSau) loi.push('chưa khai luật phủ hết mười sáu');
    return { chuaDo: false, loi: loi, so: ds.length, soHD: hd.length };
  };

  /* ═══════════════════════════════════════════════════════════
     MÀN HÌNH
     ═══════════════════════════════════════════════════════════ */
  var MAU_L = { A: '#BE0E16', B: '#0B6675', C: '#B4720F' };

  function veBuoc(b, mau) {
    var o = '<div style="padding:12px 0;border-bottom:1px solid var(--gita-vien-2)">' +
      '<b class="sm" style="color:' + mau + '">' + h(b.ma) + ' · ' + h(b.viec) + '</b>' +
      '<p class="tiny dim mt">Ai làm: ' + h(b.ai) + (b.han ? ' · Hạn: ' + h(b.han) : '') + '</p>';
    if (b.hd) o += '<p class="tiny mt" style="line-height:1.75"><b>Hợp đồng:</b> ' + h(b.hd) + '</p>';
    if (b.bm) o += '<p class="tiny" style="line-height:1.75"><b>Biểu mẫu:</b> ' + h(b.bm) + '</p>';
    if (b.ky) o += '<p class="tiny" style="line-height:1.75"><b>Cấp chữ ký:</b> ' + h(b.ky) + '</p>';
    if (b.bang) o += '<p class="tiny" style="line-height:1.75"><b>Bằng chứng phải sinh:</b> ' +
      h(b.bang) + '</p>';
    if (b.hoi) o += '<p class="tiny mt" style="line-height:1.75">' + h(b.hoi) + '</p>';
    if (b.mayCanh) o += '<p class="tiny mt" style="line-height:1.75;color:#0B6675">' +
      '<b>Máy canh:</b> ' + h(b.mayCanh) + '</p>';
    if (b.chan) o += '<p class="tiny mt" style="line-height:1.75;color:#BE0E16">' +
      '<b>ĐANG CHẶN:</b> ' + h(b.chan) + '</p>';
    o += '<p class="tiny mt" style="line-height:1.75;color:#BE0E16"><b>Cạm bẫy:</b> ' +
      h(b.bay) + '</p></div>';
    return o;
  }

  G.VIEWS['ky-ket'] = function () {
    if (!G.KK_A)
      return U.empty('Chưa mở được phần này',
        'Hướng dẫn ký kết nằm trong gói nghề. Đăng nhập bằng tài khoản có quyền nghề để nạp.');

    var loi = G.KK_LOI || {};
    var lech = [].concat(G.kkSoiLuong().loi || [], G.kkSoiKhongVuotCap().loi || [],
      G.kkSoiChon().loi || []);
    var soBuoc = G.kkBuoc().length;

    var o = U.ph({ eyebrow: 'HƯỚNG DẪN KÝ KẾT', ic: 'check', grad: 1,
      t: 'Ba luồng phát sinh · ' + soBuoc + ' bước · bảy cửa trước khi đặt bút',
      lead: loi.baLuong || '' });

    o += '<div class="card mb" style="border-color:' + (lech.length ? '#BE0E16' : '#B4720F') + '56">' +
      '<b class="sm" style="color:#B4720F">' + h(loi.cauDatNhat || '') + '</b>' +
      '<p class="tiny mt" style="line-height:1.75">' + h(loi.truocKhiKy || '') + '</p>' +
      '<p class="tiny mt" style="line-height:1.75">' + h(loi.troChuKhongChep || '') + '</p>' +
      '<p class="tiny mt" style="line-height:1.75;color:#BE0E16">' +
      h((G.KK_LUAT || {}).huongDanKhongPhaiYKien || '') + '</p>' +
      '<p class="tiny dim mt" style="line-height:1.7">' + h(loi.nguon || '') + '</p>' +
      (lech.length ? '<p class="tiny mt" style="line-height:1.7;color:#BE0E16"><b>LỆCH: ' +
        h(lech.slice(0, 4).join(' · ')) + '</b></p>' : '') + '</div>';

    /* Bảy cửa */
    o += U.sec('Bảy cửa phải qua trước khi đặt bút',
      (G.KK_CUA_LUAT || {}).thuTuChan || '');
    o += '<div class="card mb">' + (G.KK_CUA || []).map(function (c) {
      return '<div style="padding:11px 0;border-bottom:1px solid var(--gita-vien-2)">' +
        '<b class="sm"><span style="color:#B4720F">CỬA ' + c.so + '</span> · ' + h(c.cua) + '</b>' +
        '<p class="tiny mt" style="line-height:1.75">' + h(c.hoi) + '</p>' +
        '<p class="tiny mt" style="line-height:1.75;color:#BE0E16"><b>Không qua thì:</b> ' +
        h(c.khongQua) + '</p></div>';
    }).join('') +
      '<p class="tiny mt" style="line-height:1.75">' +
      h((G.KK_CUA_LUAT || {}).dungReHonGo || '') + '</p></div>';

    /* Cây chọn */
    o += U.sec('Phát sinh loại này thì ký hợp đồng nào',
      (G.KK_CHON_LUAT || {}).hoiTheoBanChat || '');
    o += '<div class="card mb">' + U.tbl(['Luồng', 'Câu hỏi về bản chất quan hệ', 'Thì ký'],
      (G.KK_CHON || []).map(function (x) {
        return ['<b style="color:' + (MAU_L[x.luong] || '') + '">' + h(x.luong) + '</b>',
          h(x.hoi), '<b>' + h(x.thi) + '</b>'];
      })) + '</div>';

    o += G.kaKhung ? G.kaKhung('ky-ket', 'dau') : '';

    /* Ba luồng */
    baLuong().forEach(function (L) {
      var mau = MAU_L[L.ma] || '#B4720F';
      o += U.sec('LUỒNG ' + L.ma + ' · ' + L.ten, L.khiNao || '');
      o += '<div class="card mb" style="border-color:' + mau + '56">' +
        '<p class="tiny" style="line-height:1.75;color:#BE0E16"><b>Chỗ nguy nhất của luồng:</b> ' +
        h(L.nguy) + '</p></div>';
      o += '<div class="card mb">' + (L.buoc || []).map(function (b) {
        return veBuoc(b, mau);
      }).join('') + '</div>';
    });

    /* Việc cấm */
    o += U.sec('Tám việc tuyệt đối không làm khi ký', '');
    o += '<div class="card mb">' + (G.KK_CAM || []).map(function (x) {
      return '<div style="padding:9px 0;border-bottom:1px solid var(--gita-vien-2)">' +
        '<b class="sm" style="color:#BE0E16">' + h(x.cam) + '</b>' +
        '<p class="tiny mt" style="line-height:1.75">' + h(x.vi) + '</p></div>';
    }).join('') + '</div>';

    /* Máy canh được gì */
    o += U.sec('Máy canh được đúng hai chỗ trong cả hướng dẫn này',
      (G.KK_LUAT || {}).mayCanhDuocMotDieu || '');
    var kqC = G.kkSoiKhongVuotCap(), kqN = G.kkSoiLuong(), kqCh = G.kkSoiChon();
    o += '<div class="card mb">' + U.tbl(['Phép kiểm', 'Canh gì', 'Kết quả'], [
      ['kkSoiLuong()', 'Mọi mã hợp đồng, cấp chữ ký và bằng chứng mà ' + soBuoc +
        ' bước trỏ tới đều có thật',
       (kqN.loi || []).length ? '<b style="color:#BE0E16">' + (kqN.loi || []).join(' · ') + '</b>'
         : '<b style="color:#0B6675">' + (kqN.soBuoc || 0) + ' bước · mọi mối nối trỏ đúng chỗ</b>'],
      ['kkSoiKhongVuotCap()', 'Không bước nào dùng chữ ký C1 hoặc C2 cho loại văn bản mà ' +
        'HSH_KY xếp ở C3',
       (kqC.loi || []).length ? '<b style="color:#BE0E16">' + (kqC.loi || []).join(' · ') + '</b>'
         : '<b style="color:#0B6675">' + (kqC.soLoai || 0) + ' loại đòi C3 · không bước nào hạ cấp</b>'],
      ['kkSoiChon()', 'Cây chọn phủ hết mười sáu hợp đồng, không hợp đồng nào bị hai nhánh cùng chọn',
       (kqCh.loi || []).length ? '<b style="color:#BE0E16">' + (kqCh.loi || []).join(' · ') + '</b>'
         : '<b style="color:#0B6675">' + (kqCh.so || 0) + ' nhánh · phủ đủ ' + (kqCh.soHD || 0) +
           ' hợp đồng</b>']
    ]) + '</div>';

    return o;
  };
})();
