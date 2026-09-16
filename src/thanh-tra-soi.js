/* ═══════════════════════════════════════════════════════════════
   GITA 365 — MƯỜI TỔ THANH TRA SOI  (9.99.123)

   Chủ hệ: "10 tổ thanh tra soi, chuyên phá các điểm chưa tốt để hệ thống
   phải làm tốt nhất; các AI và bộ não thiên tài phải làm việc chuẩn. Các
   thanh tra hoạt động ĐỘC LẬP, ở 10 CẤP ĐỘ khác nhau, mỗi cấp cách 100
   bậc tiêu chuẩn — như 10 thanh tra FBI giỏi nhất."

   ══ CHỐNG ÁP-PHÍCH LÀ LUẬT NỀN CỦA MÀN NÀY ══

   Một bảng mười tổ thanh tra nghe rất oai mà không tổ nào cắm vào một
   phép soi THẬT thì nó là một tấm áp phích — đúng cái bẫy `dieuPhoiTroLy`
   đã mắc ở 9.99.107 (báo "đã định tuyến" cho cửa không tồn tại). Nên mỗi
   tổ KHÔNG mô tả suông: nó NEO vào một phép soi CÓ THẬT trong mã nguồn
   (`neoVao` = tên hàm/cổng, `neoTep` = tệp chứa nó), và mục 114 của bộ
   kiểm đọc tệp thật rồi đối chiếu — trỏ vào một cái tên bịa thì ĐỎ. Một
   tổ thanh tra không soi được gì thì nó không phải thanh tra.

   ══ ĐỘC LẬP · 10 CẤP · 1000 BẬC ══

   Mười tổ, mười MIỀN khác nhau, mỗi tổ một khoá neo riêng — không tổ nào
   dựa vào kết luận của tổ khác (độc lập). Mười CẤP: cấp N phủ bậc
   (N-1)·100+1 … N·100, nên cả thang liền mạch 1→1000, mỗi cấp đúng 100
   bậc. Cấp cao = hậu quả nặng hơn khi hỏng: cấp 10 là rò dữ liệu một đứa
   trẻ ra ngoài (Điều 13 bất khả sửa), cấp 1 là nền phiên & vai.

   Màn này KHÔNG chạy thanh tra lúc bấm — các phép soi thật CHẠY trong bộ
   kiểm phát hành (kiem-tra · thu-worker · do-khung-man · soi-doi-kho ·
   do-ro-ri). Màn là BẢN ĐỒ: tổ nào canh miền nào, ở cấp nào, neo vào
   phép soi thật nào. Chạy chúng là `node tools/phat-hanh.js`. */
(function () {
  'use strict';
  var G = window.G || {}; window.G = G;
  var U = G.U, h = U.h;

  /* Mười tổ — mỗi tổ NEO vào một phép soi CÓ THẬT (identifier · tệp).
     cap 1..10 (mỗi cấp một lần); bac = 100·cap là bậc CAO NHẤT của cấp ấy. */
  G.TTS_TO = [
    { ma: 'TT10', cap: 10, ten: 'Ẩn danh & dữ liệu người',
      mien: 'Không một cái tên/số/ngày sinh của trẻ hay gia đình nào rời hệ ở dạng nhận dạng được (Điều 13 · Luật 91).',
      san: 'Tên gõ thường, chữ trộn homoglyph, ký tự vô hình, số điện thoại nguỵ trang — mọi cách né cổng ra ngoài.',
      neoVao: 'soatRaNgoai', neoTep: 'may-chu/bo-nao.js' },
    { ma: 'TT09', cap: 9, ten: 'Giao dịch nguyên tử',
      mien: 'Cứu hệ, xoá dữ liệu con, chốt lương — nhiều ghi phải all-or-nothing, không để lại nửa chừng.',
      san: 'Một cú sập giữa chừng: mật khẩu đặt lại mà phiên hacker còn sống; PII con còn mà đã báo đã xoá.',
      neoVao: 'truyHoiHe', neoTep: 'may-chu/cuu-he.js' },
    { ma: 'TT08', cap: 8, ten: 'Thang chữ ký theo số tiền',
      mien: 'Hoàn tiền · hoa hồng · lương — tiền RA phải đủ cấp người duyệt theo số tiền, như chi trực tiếp.',
      san: 'Một Giám đốc rút 90 triệu bằng MỘT chữ ký trong khi chi thẳng cùng cỡ đòi Super Admin.',
      neoVao: 'capDuyetTheoTien', neoTep: 'may-chu/chi-tieu.js' },
    { ma: 'TT07', cap: 7, ten: 'Cổng nhà & IDOR',
      mien: 'Mỗi nhà chỉ đọc/sửa dữ liệu của CHÍNH mình; định danh so canonical, không tin ô người gọi truyền.',
      san: 'Một phụ huynh gõ mã nhà khác để đọc/xoá/forge đồng ý cho con người lạ.',
      neoVao: 'nhaCuaMinh', neoTep: 'may-chu/phap-ly-rui-ro.js' },
    { ma: 'TT06', cap: 6, ten: 'Quyền truy cập (Luật 91)',
      mien: 'Gia đình đọc được toàn bộ dữ liệu hệ giữ về mình; mật khẩu không nằm trong bản xuất; mỗi lượt vào nhật ký.',
      san: 'Quyền "đọc" chỉ là một dòng chữ; hoặc bản xuất kèm băm mật khẩu; hoặc đọc mà không ai biết.',
      neoVao: 'xuatDuLieuNha', neoTep: 'may-chu/phap-ly-rui-ro.js' },
    { ma: 'TT05', cap: 5, ten: 'Quyền xoá (Luật 91)',
      mien: 'Xoá là XOÁ THẬT dữ liệu con (thẻ vùng mạnh · song sinh · sổ chăm · tên ở students), rồi ĐẾM còn lại.',
      san: 'Đóng dấu "đã xoá" mà bản ghi con vẫn đọc được — một lời nói dối mang dấu hệ thống.',
      neoVao: 'danhDauXoa', neoTep: 'may-chu/phap-ly-rui-ro.js' },
    { ma: 'TT04', cap: 4, ten: '100 trợ lý — điều phối',
      mien: 'Mỗi trợ lý một khoá sở hữu là một CỬA THẬT; điều phối chỉ trả kế hoạch, không tự ra tay (không cửa hậu).',
      san: 'Một coordinator nhận bừa mọi chuỗi, khai "đã định tuyến" cho cửa không tồn tại — áp phích.',
      neoVao: 'dieuPhoiTroLy', neoTep: 'may-chu/dieu-phoi.js' },
    { ma: 'TT03', cap: 3, ten: 'Giao diện & tiếp cận',
      mien: 'Mọi ô nhập có tên đọc được cho trình đọc màn; không màn nào cuộn ngang; vùng chạm ≥32px trên điện thoại.',
      san: 'Một ô "không tên" người khiếm thị gặp phải; một trang trượt ngang khi vuốt dọc.',
      neoVao: 'a11yNhan', neoTep: 'src/app.js' },
    { ma: 'TT02', cap: 2, ten: 'Bộ não — dữ liệu con',
      mien: 'Tạo Thẻ Vùng Mạnh phải qua đồng ý cha mẹ + ẩn danh trước khi ra ngoài; gate đứng TRƯỚC câu INSERT.',
      san: 'Một cổng dựng SAU khi ghi thì nó chỉ là lời nhắc; một thẻ dựng khi chưa có đồng ý.',
      neoVao: 'lapTheVungManh', neoTep: 'may-chu/vung-manh.js' },
    { ma: 'TT01', cap: 1, ten: 'Nền phiên & vai',
      mien: 'Mọi cửa ghi kiểm phiên và vai; hoSo mang đúng u · uid · role · maKhachHang từ máy chủ, không tự khai.',
      san: 'Một cửa ghi bỏ kiểm vai; một trường phiên gõ sai tên trả undefined và cổng câm.',
      neoVao: 'kiemPhien', neoTep: 'may-chu/nen.js' }
  ];

  /* Mười cấp — cấp N phủ bậc (N-1)·100+1 … N·100. Liền mạch 1→1000. */
  G.TTS_CAP = [];
  for (var c = 1; c <= 10; c++) {
    G.TTS_CAP.push({ cap: c, bacTu: (c - 1) * 100 + 1, bacDen: c * 100 });
  }

  G.TTS_LUAT = {
    chongApPhich: 'Mỗi tổ NEO vào một phép soi CÓ THẬT trong mã nguồn (neoVao · neoTep); mục 114 đối chiếu tên ấy tồn tại trong tệp — trỏ vào cái tên bịa thì ĐỎ. Một tổ không soi được gì thì không phải thanh tra.',
    docLap: 'Mười tổ mười miền, mỗi tổ một khoá neo riêng, không tổ nào dựa vào kết luận tổ khác.',
    khongChayTaiCho: 'Màn này là BẢN ĐỒ, không chạy thanh tra lúc bấm. Các phép soi thật chạy trong bộ kiểm phát hành: node tools/phat-hanh.js.',
    thang: 'Mười cấp × 100 bậc = 1000 bậc tiêu chuẩn liền mạch. Cấp cao = hậu quả nặng hơn khi hỏng.'
  };

  G.VIEWS = G.VIEWS || {};
  G.VIEWS['thanh-tra-soi'] = function () {
    var to = (G.TTS_TO || []).slice().sort(function (a, b) { return b.cap - a.cap; });
    var o = U.ph({ eyebrow: 'MƯỜI TỔ THANH TRA SOI', ic: 'shield', grad: 1,
      t: 'Mười thanh tra độc lập, mười cấp, một nghìn bậc',
      lead: 'Chuyên phá các điểm chưa tốt để hệ phải làm tốt nhất — bộ não và 100 trợ lý phải làm việc CHUẨN. ' +
        'Mỗi tổ neo vào một phép soi CÓ THẬT, không phải một dòng khẩu hiệu: một tấm áp phích về kỷ luật làm ' +
        'người đọc yên tâm rằng chuyện đã được lo.' });

    o += U.sec('Mười tổ · xếp theo cấp (hậu quả nặng nhất trước)', (G.TTS_LUAT || {}).chongApPhich || '');
    o += '<div class="card mb">' + to.map(function (t) {
      return '<div style="padding:10px 0;border-bottom:1px solid var(--gita-vien-2)">' +
        '<b>Cấp ' + t.cap + ' · ' + h(t.ten) + '</b>' +
        ' <span class="tiny dim">(bậc ' + ((t.cap - 1) * 100 + 1) + '–' + (t.cap * 100) + ')</span>' +
        '<p class="sm mt" style="line-height:1.8"><b>Canh:</b> ' + h(t.mien) + '</p>' +
        '<p class="tiny mt" style="line-height:1.7"><b>Săn lỗi:</b> ' + h(t.san) + '</p>' +
        '<div class="tiny dim mt" style="line-height:1.7"><b>Neo vào phép soi thật:</b> ' +
        '<code>' + h(t.neoVao) + '</code> · ' + h(t.neoTep) + '</div></div>';
    }).join('') + '</div>';

    o += U.sec('Thang mười cấp · một nghìn bậc', (G.TTS_LUAT || {}).thang || '');
    o += U.tbl(['Cấp', 'Bậc tiêu chuẩn', 'Tổ canh'],
      (G.TTS_CAP || []).slice().reverse().map(function (l) {
        var tt = (G.TTS_TO || []).filter(function (x) { return x.cap === l.cap; })[0];
        return [String(l.cap), l.bacTu + '–' + l.bacDen, h(tt ? tt.ten : '—')];
      }));

    o += '<p class="tiny dim mb" style="line-height:1.7"><b>Độc lập:</b> ' +
      h((G.TTS_LUAT || {}).docLap || '') + '</p>';
    o += '<p class="tiny dim mb" style="line-height:1.7"><b>Chạy thật ở đâu:</b> ' +
      h((G.TTS_LUAT || {}).khongChayTaiCho || '') + '</p>';
    return o;
  };
})();
