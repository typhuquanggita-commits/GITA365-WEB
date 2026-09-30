/* ═══════════════════════════════════════════════════════════════
   GITA 365 · 9.99.126 — KỊCH BẢN SALE · GIỌNG GITA (phần chạy)

   Kho GIỌNG + tình huống nằm ở kho-goc/data.giong-gita.js (chỉ dữ liệu).
   Tệp này là PHẦN CHẠY: khớp câu khách gõ vào đúng tình huống, đếm tiến
   độ thật, và vẽ màn. Tách vậy vì luật kho: hàm không sống trong kho.

   Khớp bằng `khoa` (cụm đã bỏ dấu) — dò cụm NHIỀU ÂM TIẾT trong câu đã bỏ
   dấu, không dò âm tiết trần (cùng bài học DN_TRU: âm tiết trần bắt oan).

   Chat KHÔNG đổ cả tình huống: khớp xong chỉ lấy MỘT câu trả lời + MỘT
   câu hỏi chẩn đoán. Một trọng tâm mỗi lượt (luật G5 của chuẩn giọng). */
'use strict';
var G = window.G || {}; window.G = G;

(function () {
  var U = G.U, h = U.h, ic = U.ic;

  /* Mỗi cấu trúc là một cách DẪN VẤN ĐỀ của khách, không phải bài nói
     thuộc lòng. Người tư vấn chọn theo chỗ khách đang mắc và vẫn phải dùng
     sáu nhịp GITA ở dưới để hỏi đủ trước khi đề xuất. */
  G.CHBH = [
    {ma:'CT01',ten:'3 hồi',dung:'Khách cần thấy hành trình từ hoàn cảnh đến thay đổi.',nhip:'Thiết lập → xung đột → giải quyết',chot:'Vậy nhà mình đang đứng ở hồi nào?'},
    {ma:'CT02',ten:'5 hồi',dung:'Vấn đề có nhiều lớp, cần đi chậm để khách nhìn rõ.',nhip:'Giới thiệu → tăng hành động → cao trào → giảm dần → kết thúc',chot:'Mình cùng chọn việc đầu tiên để hạ áp lực nhé.'},
    {ma:'CT03',ten:'Hành trình anh hùng',dung:'Khách đang lưỡng lự trước một thay đổi lớn.',nhip:'Bình thường → lời gọi → lưỡng lự → hướng dẫn → thử thách → trở về',chot:'Anh chị muốn mang giá trị mới nào về cho gia đình?'},
    {ma:'CT04',ten:'Pixar',dung:'Cần kể nhanh, gần gũi và có nhịp nguyên nhân–kết quả.',nhip:'Ngày xửa ngày xưa → mỗi ngày → một ngày → vì vậy → và rồi → cuối cùng',chot:'Nếu hôm nay là “một ngày”, điều gì cần đổi đầu tiên?'},
    {ma:'CT05',ten:'PAS',dung:'Nỗi đau đã rõ, khách cần thấy cái giá của việc chần chừ.',nhip:'Vấn đề → khuếch đại hệ quả → giải pháp',chot:'Mình xử lý điều này ngay từ tuần này được không?'},
    {ma:'CT06',ten:'BAB',dung:'Khách đã hình dung trạng thái mong muốn.',nhip:'Trước → sau → cây cầu',chot:'Cây cầu ngắn nhất từ hiện tại tới điều anh chị muốn là gì?'},
    {ma:'CT07',ten:'AIDA',dung:'Mở đầu cuộc gặp hoặc nội dung cần dẫn tới hành động rõ.',nhip:'Chú ý → hứng thú → mong muốn → hành động',chot:'Anh chị muốn bắt đầu bằng lịch hẹn hay bài đánh giá?'},
    {ma:'CT08',ten:'Star – Chain – Hook',dung:'Cần thu hút bằng một nhân vật rồi nối về đúng vấn đề.',nhip:'Nhân vật nổi bật → liên kết bài học → lời gọi',chot:'Câu chuyện này có chạm đúng điều nhà mình đang gặp không?'},
    {ma:'CT09',ten:'Câu chuyện lồng ghép',dung:'Cần nhiều góc nhìn để khách tự nhận ra mô thức chung.',nhip:'Các chuyện nhỏ → thông điệp chung → giải quyết',chot:'Trong các mảnh chuyện đó, mảnh nào giống nhà mình nhất?'},
    {ma:'CT10',ten:'Bắt đầu giữa câu chuyện',dung:'Cần gây chú ý khi tình huống đang cấp bách.',nhip:'Cao trào → quay lại nguyên nhân → trở về giải quyết',chot:'Điều gì đã đưa mình tới đúng khoảnh khắc này?'},
    {ma:'CT11',ten:'Kim tự tháp Freytag',dung:'Cần kể một ca đầy đủ, có cao trào và sự hạ nhiệt.',nhip:'Giới thiệu → tăng dần → cao trào → giảm dần → kết',chot:'Sau cao trào, nhà mình cần giữ nếp nào để không lặp lại?'},
    {ma:'CT12',ten:'Kim tự tháp ngược',dung:'Khách bận và cần biết điều quan trọng trước.',nhip:'Kết luận chính → thông tin hỗ trợ → chi tiết',chot:'Thông tin quan trọng nhất để mình quyết hôm nay là gì?'},
    {ma:'CT13',ten:'SOAR',dung:'Cần biến trở ngại thành một ca hành động có kết quả.',nhip:'Hoàn cảnh → trở ngại → hành động → kết quả',chot:'Trở ngại thật sự đang chặn bước nào của nhà mình?'},
    {ma:'CT14',ten:'CAR',dung:'Cần chứng minh giá trị qua một ví dụ ngắn, cụ thể.',nhip:'Bối cảnh → hành động → kết quả',chot:'Trong bối cảnh của mình, hành động nào là phù hợp nhất?'},
    {ma:'CT15',ten:'PAR',dung:'Khách gọi tên được vấn đề và cần một đường xử lý trực diện.',nhip:'Vấn đề → hành động → kết quả',chot:'Mình thống nhất xử lý đúng một vấn đề trước nhé?'},
    {ma:'CT16',ten:'Công thức Dale Carnegie',dung:'Cần kể một sự việc thật để làm rõ lợi ích.',nhip:'Sự việc → hành động → lợi ích',chot:'Lợi ích nào đáng để gia đình mình bắt đầu ngay?'},
    {ma:'CT17',ten:'Golden Circle',dung:'Khách cần tin vào ý nghĩa trước khi nghe giải pháp.',nhip:'Vì sao → cách làm → điều nhận được',chot:'Lý do sâu nhất khiến anh chị muốn thay đổi là gì?'},
    {ma:'CT18',ten:'Monomyth',dung:'Cần một hành trình nhân vật nhất quán, dễ đồng cảm.',nhip:'Khởi đầu → thử thách lớn → chuyển hoá → trở về',chot:'Thử thách lớn nhất mà mình cần đi qua là gì?'},
    {ma:'CT19',ten:'Cấu trúc núi',dung:'Muốn xây dần cảm xúc trước khi đưa ra nút thắt chính.',nhip:'Leo dần → đỉnh điểm → hạ nhiệt → kết',chot:'Đỉnh áp lực hiện nay của gia đình nằm ở đâu?'},
    {ma:'CT20',ten:'Khởi đầu sai lầm',dung:'Khách đang hiểu nhầm nguyên nhân hoặc giải pháp.',nhip:'Hiểu lầm → nhận ra → điều chỉnh → kết quả',chot:'Điều mình từng tin nhưng nay cần nhìn lại là gì?'},
    {ma:'CT21',ten:'Tuần tự thời gian',dung:'Cần làm rõ quá trình, trách nhiệm và các mốc diễn ra.',nhip:'Đầu → giữa → cuối theo thời gian',chot:'Mốc nào là lúc mọi thứ bắt đầu lệch nhịp?'},
    {ma:'CT22',ten:'4P',dung:'Cần mô tả cam kết có bằng chứng và lời mời rõ ràng.',nhip:'Cam kết → hình dung → chứng minh → thúc đẩy',chot:'Anh chị muốn xem bằng chứng hay bắt đầu kế hoạch trước?'},
    {ma:'CT23',ten:'StoryBrand',dung:'Khách là nhân vật chính và cần một người dẫn đường có kế hoạch.',nhip:'Nhân vật → vấn đề → hướng dẫn → kế hoạch → gọi → hành động → thành công',chot:'Mình cùng chốt kế hoạch ba bước cho nhân vật chính là gia đình mình nhé?'},
    {ma:'CT24',ten:'5C',dung:'Cần tạo đồng cảm bằng bối cảnh, nhân vật và hội thoại thật.',nhip:'Hoàn cảnh → tò mò → nhân vật → hội thoại → xung đột',chot:'Nếu nghe lại cuộc trò chuyện gần nhất, xung đột thật nằm ở câu nào?'}
  ];

  function testGanNhatCuaToi() {
    var acc = G.S && G.S.acc;
    if (!acc || String((G.S && G.S.testOwner) || '').toLowerCase() !== String(acc.u || '').toLowerCase()) return null;
    var ds = Object.keys((G.S && G.S.test) || {}).map(function (ma, i) {
      var kq = G.S.test[ma], b = (G.TEST750 || []).filter(function (x) { return x.ma === ma; })[0];
      return kq && kq.xong && kq.mien && b ? { ma:ma, kq:kq, b:b, i:i } : null;
    }).filter(Boolean);
    ds.sort(function (a, b) { return String(b.kq.lucISO || b.i).localeCompare(String(a.kq.lucISO || a.i)); });
    return ds[0] || null;
  }

  G.chbhHoSoCuaToi = testGanNhatCuaToi;
  G.chbhVietTheoHoSo = function () {
    var hs = testGanNhatCuaToi();
    if (!hs) return '';
    var ten = ((G.S.acc && G.S.acc.ten) || 'bạn').trim();
    var mien = Object.keys(hs.kq.mien).filter(function (k) {
      return typeof hs.kq.mien[k] === 'number';
    }).sort(function (a, b) { return hs.kq.mien[a] - hs.kq.mien[b]; });
    if (!mien.length) return '';
    var m1 = mien[0], m2 = mien[1] || mien[0], d1 = hs.kq.mien[m1], d2 = hs.kq.mien[m2];
    return '<div class="card mb" style="border-color:var(--gita-vien-1)">' +
      '<p class="tiny up muted">BẢN NHÁP CÁ NHÂN HOÁ · KHÔNG PHẢI KẾT LUẬN</p>' +
      '<h3 style="margin:7px 0 14px;font-size:20px">Đêm ' + h(ten) + ' quyết định không né tránh nữa</h3>' +
      '<div class="sm" style="line-height:1.85">' +
      '<p>Có những giai đoạn, điều làm người ta mệt nhất không phải là một việc quá lớn. Đó là cảm giác mỗi ngày đều cố gắng, nhưng đến cuối ngày vẫn không biết mình đang đi về đâu. Trong kết quả <b>' + h(hs.b.ten) + '</b>, miền <b>' + h(m1) + '</b> đang ở <b>' + d1 + '/100</b>; miền <b>' + h(m2) + '</b> ở <b>' + d2 + '/100</b>. Những con số này không nói ' + h(ten) + ' kém hay thiếu điều gì. Chúng chỉ gợi ra một nơi đang cần được lắng nghe trước khi bị ép phải thay đổi.</p>' +
      '<p>Hãy hình dung một buổi tối bình thường. Mọi thứ đã yên, nhưng trong đầu nhân vật chính vẫn còn một câu hỏi chưa trả lời: “Mình đã cố rồi, vậy tại sao vẫn thấy mắc kẹt?” Câu hỏi ấy không cần một lời trách. Nó cần một khoảng dừng đủ thật để nhìn lại: có thể mình đang mang quá nhiều việc, đang kỳ vọng phải ổn ngay, hoặc đã lâu không gọi đúng tên điều đang làm mình mỏi.</p>' +
      '<p>Điểm căng nhất của câu chuyện không nằm ở lúc nhân vật bỏ cuộc. Nó nằm ở khoảnh khắc nhân vật nhận ra: cứ tiếp tục chống đỡ một mình thì ngày mai sẽ giống hệt hôm nay. Và thay vì hứa một cuộc lột xác, nhân vật chọn một việc nhỏ nhưng không còn né tránh: nhìn thẳng vào <b>' + h(m1) + '</b>, gọi tên một tình huống cụ thể, rồi dành bảy ngày để quan sát và thử một nhịp mới.</p>' +
      '<p>Sự thay đổi không đến bằng một câu nói hay. Nó đến khi có một việc đủ nhỏ để làm được, đủ rõ để đo lại, và có người đồng hành không vội phán xét. Sau bảy ngày, nhân vật chưa cần trở thành một con người khác. Chỉ cần có thể nói: “Tôi hiểu mình hơn tuần trước. Tôi biết bước tiếp theo là gì.” Đó là lúc câu chuyện bắt đầu có đường ra.</p>' +
      '<p><b>Bước mở đầu đề nghị:</b> trong bảy ngày tới, ghi lại một lần mỗi ngày khi ' + h(m1) + ' trở nên khó nhất; không sửa ngay, chỉ ghi điều đã xảy ra, cảm xúc lúc đó và một việc nhỏ đã thử. Sau bảy ngày mới cùng đọc lại mô thức và chọn bước tiếp theo.</p>' +
      '</div><p class="tiny muted mt" style="line-height:1.65">Câu chuyện này là tác phẩm hư cấu được biên soạn từ kết quả khảo sát trên tài khoản hiện tại; không khẳng định sự kiện, nguyên nhân hoặc chẩn đoán về anh chị.</p></div>';
  };

  function boDau(s) {
    return String(s || '').toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/đ/g, 'd').replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ').trim();
  }

  /* Khớp câu khách gõ vào tình huống hợp nhất. Điểm = số cụm khoá của tình
     huống XUẤT HIỆN trong câu (cụm nhiều âm tiết, khớp chuỗi con trên bản
     bỏ dấu). Trả về tình huống điểm cao nhất, hoặc null nếu không cụm nào
     khớp — không đoán bừa (luật G7).

     KHÔNG chỉ đủ "có khớp" — còn đo KHỚP CÓ RÕ KHÔNG. Một câu như "chưa
     sẵn sàng" trúng cụm khoá của HAI tình huống ở hai tầng khác nhau, điểm
     đầu bằng điểm nhì — lúc ấy chọn đại một tình huống là đưa ra một câu
     trả lời sâu cho một chuyện có thể không phải chuyện của khách. Nên trả
     về `doTin` (đỉnh vượt á quân bao nhiêu, chia cho đỉnh) và `ro` (đỉnh có
     tách hẳn á quân không). Màn chat đọc `ro`: rõ thì trả lời, chưa rõ thì
     HỎI LẠI một câu chứ không khẳng định. Đây là ý dùng được của lối định
     tuyến theo độ chắc (entropy) — nói/hỏi khi chưa chắc — áp vào đúng luật
     G7 sẵn có của kho: không đoán khi chưa đủ căn cứ.

     Trả về BẢN CHÉP NÔNG, không sửa bản ghi gốc trong G.KBS (nó dùng chung,
     gắn `ro`/`doTin` vào là mỗi lượt tìm đè lên lượt trước). */
  G.kbsTim = function (cauHoi) {
    var ds = G.KBS || [];
    if (!ds.length) return null;
    var c = ' ' + boDau(cauHoi) + ' ';
    var tot = null, d1 = 0, d2 = 0;   /* đỉnh, á quân */
    for (var i = 0; i < ds.length; i++) {
      var s = ds[i], d = 0;
      var ks = s.khoa || [];
      for (var j = 0; j < ks.length; j++) {
        var k = boDau(ks[j]);
        if (k && c.indexOf(' ' + k + ' ') >= 0) d += (k.indexOf(' ') >= 0 ? 2 : 1);
        else if (k && c.indexOf(k) >= 0) d += 1;   /* khớp chuỗi con, nhẹ hơn */
      }
      if (d > d1) { d2 = d1; d1 = d; tot = s; }
      else if (d > d2) { d2 = d; }
    }
    if (d1 <= 0) return null;                 /* không khớp gì — không đoán */
    var doTin = (d1 - d2) / d1;               /* 1 = tách hẳn · 0 = hoà đỉnh */
    var kq = {}; for (var p in tot) if (Object.prototype.hasOwnProperty.call(tot, p)) kq[p] = tot[p];
    kq.doTin = doTin;
    kq.ro = doTin >= 0.5;                      /* đỉnh phải vượt á quân rõ rệt */
    return kq;
  };

  /* Đếm THẬT — đọc thẳng số tình huống có trong kho, không gõ tay. */
  G.kbsDaSoan = function () { return (G.KBS || []).length; };
  G.kbsDich = function () {
    var t = G.KBS_TIENDO || {};
    return (t.tong) || ((t.tang || 5) * (t.cap || 10) * (t.moiO || 100));
  };

  /* ═══════════ MÀN ═══════════ */
  G.VIEWS = G.VIEWS || {};
  G.VIEWS['kich-ban-sale'] = function () {
    var GI = G.GIONG_GITA || {};
    var daSoan = G.kbsDaSoan(), dich = G.kbsDich();
    var pt = dich ? Math.round(daSoan / dich * 100) : 0;

    var o = U.ph({ eyebrow: 'KỊCH BẢN SALE · GIỌNG GITA365', ic: 'quote', grad: 1,
      t: 'Trả lời khách có chiều sâu, bằng giọng GITA — không bài sẵn',
      lead: 'Tham khảo kịch bản gốc rồi viết lại bằng lời GITA: ấm, thường ngày, hỏi để hiểu chứ ' +
        'không phán. Một chuẩn giọng giữ cho mọi tình huống nói cùng một kiểu, và một sổ tiến độ ' +
        'đếm thật — soạn tới đâu ghi tới đó, không con số cho đẹp.' });

    /* Sổ tiến độ — đếm thật, nói thẳng còn bao nhiêu. */
    o += U.sec('Sổ tiến độ · đếm thật', (G.KBS_TIENDO || {}).vi || '');
    o += '<div class="card mb"><div class="row" style="gap:18px;align-items:center;flex-wrap:wrap">' +
      (U.ring ? U.ring(pt, 'var(--gita)', 'ĐÃ SOẠN') : '') +
      '<div><b style="font-size:21px">' + daSoan.toLocaleString('vi-VN') + ' / ' +
        dich.toLocaleString('vi-VN') + '</b>' +
      '<p class="sm muted mt" style="line-height:1.6">tình huống — mẻ đầu <b>Tầng 1 · Cấp 1</b> ' +
        '(onboarding). Các nhóm còn lại soạn cùng khuôn ở những lượt sau, mỗi lượt một mẻ thật.</p>' +
      '</div></div></div>';

    /* Năm tư vấn — mỗi người một tầng */
    var tv = G.KBS_TUVAN || [], tvL = G.KBS_TUVAN_LUAT || {};
    if (tv.length) {
      o += U.sec('Năm tư vấn · mỗi người một tầng', (tvL.moiTang1TuVan || '') +
        (tvL.duyetTen === false ? ' — tên đang ĐỀ XUẤT, chờ chủ hệ duyệt.' : ''));
      o += '<div class="card mb">' + tv.map(function (x) {
        var t = (G.TIERS || []).filter(function (r) { return r.id === x.tang; })[0];
        var mau = t ? t.c : 'var(--gita)';
        return '<div style="padding:10px 0;border-bottom:1px solid var(--gita-vien-2)">' +
          '<b style="color:' + mau + '">' + h(x.ten) + ' · ' + h(x.vai) + '</b>' +
          ' <span class="tiny dim">(Tầng ' + x.tang + ' · ' + h(x.tenTang) + ' · 10 cấp)</span>' +
          '<p class="sm mt" style="line-height:1.7">' + h(x.gioiThieu) + '</p>' +
          '<p class="tiny dim mt" style="line-height:1.7"><b>Nâng cấp qua 10 cấp:</b> ' +
            h(x.nangCap) + '</p></div>';
      }).join('') + '</div>';
    }

    /* Ba lăng kính chuyên gia — tư duy đứng sau giọng */
    if ((GI.tuDuy || []).length) {
      o += U.sec('Ba lăng kính chuyên gia · tư duy đứng sau mỗi câu',
        'Kiến trúc giọng đồng bộ cho toàn ứng dụng — không học thuật, mà là tâm lý, chăm sóc, tư vấn.');
      o += '<div class="card mb">' + GI.tuDuy.map(function (t) {
        return '<div style="padding:8px 0;border-bottom:1px solid var(--gita-vien-2)">' +
          '<b>' + h(t.ma) + ' · ' + h(t.lang) + '</b>' +
          '<p class="sm mt" style="line-height:1.75">' + h(t.vi) + '</p></div>';
      }).join('') + '</div>';
    }

    /* Chuẩn giọng */
    o += U.sec('Chuẩn giọng GITA365', GI.cot || '');
    o += '<div class="card mb">' + (GI.luat || []).map(function (l) {
      return '<div style="padding:8px 0;border-bottom:1px solid var(--gita-vien-2)">' +
        '<b>' + h(l.ma) + ' · ' + h(l.ten) + '</b>' +
        '<p class="sm mt" style="line-height:1.7">' + h(l.vi) + '</p></div>';
    }).join('') + '</div>';

    /* Sáu nhịp */
    o += U.tbl(['Nhịp', 'Là gì'],
      (GI.nhip6 || []).map(function (n) { return [h(n.ma + ' · ' + n.ten), h(n.vi)]; }));

    o += U.sec('24 cấu trúc chuyện dẫn dắt vấn đề khách hàng',
      'Chọn cấu trúc theo điều khách đang cần nhìn ra — không dùng chuyện để ép mua. Mỗi cấu trúc kết bằng một câu hỏi để khách tự gọi tên bước tiếp theo.');
    o += '<div class="card mb">' + G.CHBH.map(function (c) {
      return '<details style="padding:10px 0;border-bottom:1px solid var(--gita-vien-2)">' +
        '<summary style="cursor:pointer"><b>' + h(c.ma + ' · ' + c.ten) + '</b>' +
          '<span class="tiny dim"> · ' + h(c.dung) + '</span></summary>' +
        '<div class="sm mt" style="line-height:1.7"><b>Nhịp dẫn:</b> ' + h(c.nhip) + '</div>' +
        '<div class="sm mt" style="line-height:1.7"><b>Câu hỏi chốt:</b> ' + h(c.chot) + '</div>' +
      '</details>';
    }).join('') + '</div>';

    var hs = testGanNhatCuaToi();
    o += U.sec('Chuyện theo hồ sơ khảo sát của chính tôi',
      'Chỉ đọc kết quả test đã hoàn thành trên tài khoản đang đăng nhập. Không tìm hồ sơ người khác, không gửi dữ liệu đi, và không biến kết quả khảo sát thành chẩn đoán.');
    if (!hs) {
      o += '<div class="card mb"><p class="sm">Chưa có kết quả test hoàn thành thuộc tài khoản này. Hoàn thành một bài ở Bộ test nhận diện rồi quay lại để biên soạn bản nháp sát hơn với điểm cần được chạm.</p></div>';
    } else {
      o += '<div class="card mb" style="border-color:var(--gita-vien-1)"><p class="sm" style="line-height:1.75">Sẵn sàng dùng kết quả <b>' +
        h(hs.b.ten) + '</b> đã hoàn thành ' + h(hs.kq.luc || '') +
        '. Bấm đồng ý để tạo một bản nháp trong phiên này; đồng ý không được lưu khi đăng xuất hoặc đổi tài khoản.</p>' +
        '<button class="btn ' + (G.S.chbhTheoHoSo ? 'ghost' : 'pri') + ' sm" data-chbh-theo="1">' +
        (G.S.chbhTheoHoSo ? 'Dừng dùng hồ sơ trong phiên này' : 'Đồng ý dùng kết quả test của tôi để biên soạn') + '</button></div>';
      if (G.S.chbhTheoHoSo) o += G.chbhVietTheoHoSo();
    }

    /* Ranh giới AI */
    o += U.sec('Ranh giới của trợ lý AI', 'Bốn điều AI KHÔNG làm, dù làm được.');
    o += '<div class="card mb">' + U.list(GI.ranhAI || [], 'var(--gita-do)') + '</div>';

    /* Bỏ ngôn ngữ máy móc */
    o += U.sec('Bỏ ngôn ngữ máy móc, khô khan', 'Cột trái là câu kiểu máy trả bài; cột phải là câu GITA nói.');
    o += U.tbl(['Đừng nói (khô, máy móc)', 'Nói thế này (ấm, người thật)'],
      (GI.tranh || []).map(function (t) { return [h(t.may), h(t.nguoi)]; }));

    /* Kho tình huống đã soạn — MỞ DẦN THEO LÔ, không đổ cả khối.
       Kho có tới hàng nghìn tình huống; dựng hết một lượt thì màn này
       phình quá 5.000 nút DOM và đứng hình vài giây trên máy điện thoại
       phổ thông (đúng lớp lỗi tai-lieu-goc 9.27 · TG-05). Máy làm việc
       nhanh nên chỗ này không lộ — nó chỉ lộ khi đo trên máy yếu, nên
       ra-soat-day-du canh ngưỡng 5.000 nút. Mở dần theo lô 60, bấm ra
       tiếp, tới hết — cùng khuôn với đoạn/bảng của tai-lieu-goc. */
    var ds = G.KBS || [];
    var soHien = G.S.kbsHien || 60;
    var het = soHien >= ds.length;
    o += U.sec('Tình huống đã soạn · ' + daSoan.toLocaleString('vi-VN') + ' ô',
      'Khớp câu khách → hỏi/nói MỘT câu, không đổ cả khối. Năm tầng × mười cấp, mỗi ô nhiều tình huống.');
    o += '<div class="card">' + ds.slice(0, soHien).map(function (s) {
      return '<div style="padding:10px 0;border-bottom:1px solid var(--gita-vien-2)">' +
        '<b class="sm">' + h(s.ma) + ' · ' + h(s.tinhHuong) + '</b>' +
        '<p class="sm mt" style="line-height:1.7"><b>Hỏi để hiểu:</b> ' +
          h(Array.isArray(s.chanDoan) ? (s.chanDoan[0] || '') : (s.chanDoan || '')) + '</p>' +
        '<p class="sm mt" style="line-height:1.7"><b>GITA nói:</b> ' +
          h(Array.isArray(s.traLoi) ? (s.traLoi[0] || '') : (s.traLoi || '')) + '</p>' +
        '<p class="tiny dim mt" style="line-height:1.6"><b>Tránh:</b> ' + h(s.tranh || '') + '</p>' +
        '</div>';
    }).join('') + '</div>';
    o += '<div class="center mt2">' +
      (het
        ? '<p class="tiny muted">Đã hết ' + ds.length.toLocaleString('vi-VN') + ' tình huống.</p>'
        : '<button class="btn" data-kbshien="1">Xem tiếp 60 tình huống</button>' +
          '<p class="tiny muted mt">Đang xem ' + soHien.toLocaleString('vi-VN') + ' / ' +
          ds.length.toLocaleString('vi-VN') + ' tình huống</p>') +
      '</div>';
    return o;
  };

  /* Nút mở dần — tăng lô 60 rồi vẽ lại, cùng khuôn tai-lieu-goc. */
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-kbshien]');
    if (b) { G.S.kbsHien = (G.S.kbsHien || 60) + 60; G.render(); }
    var theo = e.target.closest && e.target.closest('[data-chbh-theo]');
    if (theo) {
      G.S.chbhTheoHoSo = !G.S.chbhTheoHoSo;
      if (G.S.chbhTheoHoSo && G.secLog) G.secLog('Dùng kết quả test để biên soạn chuyện', 'Chỉ dùng kết quả của tài khoản hiện tại trong phiên này.', 'Ghi nhận');
      G.render();
    }
  });
})();
