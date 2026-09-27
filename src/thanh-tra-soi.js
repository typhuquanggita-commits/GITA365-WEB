/* ═══════════════════════════════════════════════════════════════
   GITA 365 — MƯỜI THANH TRA CẤP CAO · SOI CHÉO · SUPER ADMIN  (9.99.124)

   Chủ hệ: "10 thanh tra cao cấp kiểm tra 100 trợ lý AI với tiêu chuẩn cao
   nhất của Google · FBI · Claude · ChatGPT. Chắt lọc bộ tiêu chuẩn cao
   nhất — không đơn thuần là máy đo để bịt khách. 10 thanh tra cũng phải
   thanh tra LẪN NHAU, và tôi là Super Admin có quyền lực cao nhất trong
   đánh giá xoá trợ lý, xoá thanh tra nếu vi phạm. Tạo một thư mục báo cáo
   thanh tra trên web app để chuyên cập nhật và xử lý vấn đề."

   ══ CHỐNG ÁP-PHÍCH LÀ LUẬT NỀN CỦA MÀN NÀY ══

   Một bảng mười thanh tra nghe rất oai mà không thanh tra nào cắm vào một
   phép soi THẬT thì nó là một tấm áp phích — đúng cái bẫy `dieuPhoiTroLy`
   đã mắc ở 9.99.107 (báo "đã định tuyến" cho cửa không tồn tại). Nên mỗi
   thanh tra NEO vào một phép soi CÓ THẬT trong mã nguồn (`neoVao` = tên
   hàm/cổng, `neoTep` = tệp chứa nó), và mục 114 của bộ kiểm đọc tệp thật
   rồi đối chiếu — trỏ vào một cái tên bịa thì ĐỎ. Một thanh tra không soi
   được gì thì không phải thanh tra.

   ══ BỘ TIÊU CHUẨN CAO NHẤT LÀ CHẮT LỌC, KHÔNG PHẢI CHÉP ══

   Chủ hệ đòi "chuẩn cao nhất của Google · FBI · Claude · ChatGPT". Chép
   một bộ checklist của bên ngoài vào là dựng bản thứ hai của một sự thật —
   và một checklist ngoài không biết gì về Điều 13 hay Luật 91. Nên
   `TTS_CHUAN` là MƯỜI luật NỀN mà chính kho này đã rút ra qua hàng chục
   bản, mỗi luật trỏ về nơi nó đã cứu được một lỗ thật. Đó mới là "chắt lọc
   bộ tiêu chuẩn cao nhất": luật đã có RĂNG, không phải khẩu hiệu.

   ══ SOI CHÉO · ĐỘC LẬP · KHÔNG TỰ SOI ══

   Mười thanh tra không chỉ soi 100 trợ lý — họ soi LẪN NHAU. `TTS_CHEO`
   là một VÒNG hoán vị: TT01 soi TT02, … TT10 soi TT01. Không ai tự soi
   mình (không có điểm bất động), nên không thanh tra nào tự cấp cho mình
   một điểm sạch. Mục 114 canh vòng ấy là một song ánh không điểm cố định.

   ══ SUPER ADMIN ĐỨNG TRÊN CẢ THANH TRA ══

   `TTS_QUYEN` là quyền xoá của Super Admin — trên cả trợ lý LẪN thanh tra.
   Cái RĂNG không nằm ở màn này: nó nằm ở bốn cửa máy chủ `may-chu/
   thanh-tra.js` (xoaTroLy · xoaThanhTra · ghiBaoCaoThanhTra ·
   docBaoCaoThanhTra), mỗi cửa khoá R01, đòi lý do, cổng đứng TRƯỚC câu
   INSERT. Màn chỉ TRÌNH quyền và mở thư mục báo cáo. */
(function () {
  'use strict';
  var G = window.G || {}; window.G = G;
  var U = G.U, h = U.h;

  /* ── Mười thanh tra — mỗi thanh tra NEO vào một phép soi CÓ THẬT ──
     cap 1..10 (mỗi cấp một lần); bac = 100·cap là bậc CAO NHẤT của cấp.
     chuan = mã luật nền (TTS_CHUAN) mà thanh tra ấy dựa vào rõ nhất. */
  G.TTS_TO = [
    { ma: 'TT10', cap: 10, ten: 'Ẩn danh & dữ liệu người', chuan: 'C10',
      mien: 'Không một cái tên/số/ngày sinh của trẻ hay gia đình nào rời hệ ở dạng nhận dạng được (Điều 13 · Luật 91).',
      san: 'Tên gõ thường, chữ trộn homoglyph, ký tự vô hình, số điện thoại nguỵ trang — mọi cách né cổng ra ngoài.',
      neoVao: 'soatRaNgoai', neoTep: 'may-chu/bo-nao.js' },
    { ma: 'TT09', cap: 9, ten: 'Giao dịch nguyên tử', chuan: 'C06',
      mien: 'Cứu hệ, xoá dữ liệu con, chốt lương — nhiều ghi phải all-or-nothing, không để lại nửa chừng.',
      san: 'Một cú sập giữa chừng: mật khẩu đặt lại mà phiên hacker còn sống; PII con còn mà đã báo đã xoá.',
      neoVao: 'truyHoiHe', neoTep: 'may-chu/cuu-he.js' },
    { ma: 'TT08', cap: 8, ten: 'Thang chữ ký theo số tiền', chuan: 'C08',
      mien: 'Hoàn tiền · hoa hồng · lương — tiền RA phải đủ cấp người duyệt theo số tiền, như chi trực tiếp.',
      san: 'Một Giám đốc rút 90 triệu bằng MỘT chữ ký trong khi chi thẳng cùng cỡ đòi Super Admin.',
      neoVao: 'capDuyetTheoTien', neoTep: 'may-chu/chi-tieu.js' },
    { ma: 'TT07', cap: 7, ten: 'Cổng nhà & IDOR', chuan: 'C05',
      mien: 'Mỗi nhà chỉ đọc/sửa dữ liệu của CHÍNH mình; định danh so canonical, không tin ô người gọi truyền.',
      san: 'Một phụ huynh gõ mã nhà khác để đọc/xoá/forge đồng ý cho con người lạ.',
      neoVao: 'nhaCuaMinh', neoTep: 'may-chu/phap-ly-rui-ro.js' },
    { ma: 'TT06', cap: 6, ten: 'Quyền truy cập (Luật 91)', chuan: 'C07',
      mien: 'Gia đình đọc được toàn bộ dữ liệu hệ giữ về mình; mật khẩu không nằm trong bản xuất; mỗi lượt vào nhật ký.',
      san: 'Quyền "đọc" chỉ là một dòng chữ; hoặc bản xuất kèm băm mật khẩu; hoặc đọc mà không ai biết.',
      neoVao: 'xuatDuLieuNha', neoTep: 'may-chu/phap-ly-rui-ro.js' },
    { ma: 'TT05', cap: 5, ten: 'Quyền xoá (Luật 91)', chuan: 'C03',
      mien: 'Xoá là XOÁ THẬT dữ liệu con (thẻ vùng mạnh · song sinh · sổ chăm · tên ở students), rồi ĐẾM còn lại.',
      san: 'Đóng dấu "đã xoá" mà bản ghi con vẫn đọc được — một lời nói dối mang dấu hệ thống.',
      neoVao: 'danhDauXoa', neoTep: 'may-chu/phap-ly-rui-ro.js' },
    { ma: 'TT04', cap: 4, ten: '100 trợ lý — điều phối', chuan: 'C01',
      mien: 'Mỗi trợ lý một khoá sở hữu là một CỬA THẬT; điều phối chỉ trả kế hoạch, không tự ra tay (không cửa hậu).',
      san: 'Một coordinator nhận bừa mọi chuỗi, khai "đã định tuyến" cho cửa không tồn tại — áp phích.',
      neoVao: 'dieuPhoiTroLy', neoTep: 'may-chu/dieu-phoi.js' },
    { ma: 'TT03', cap: 3, ten: 'Giao diện & tiếp cận', chuan: 'C04',
      mien: 'Mọi ô nhập có tên đọc được cho trình đọc màn; không màn nào cuộn ngang; vùng chạm ≥32px trên điện thoại.',
      san: 'Một ô "không tên" người khiếm thị gặp phải; một trang trượt ngang khi vuốt dọc.',
      neoVao: 'a11yNhan', neoTep: 'src/app.js' },
    { ma: 'TT02', cap: 2, ten: 'Bộ não — dữ liệu con', chuan: 'C02',
      mien: 'Tạo Thẻ Vùng Mạnh phải qua đồng ý cha mẹ + ẩn danh trước khi ra ngoài; gate đứng TRƯỚC câu INSERT.',
      san: 'Một cổng dựng SAU khi ghi thì nó chỉ là lời nhắc; một thẻ dựng khi chưa có đồng ý.',
      neoVao: 'lapTheVungManh', neoTep: 'may-chu/vung-manh.js' },
    { ma: 'TT01', cap: 1, ten: 'Nền phiên & vai', chuan: 'C09',
      mien: 'Mọi cửa ghi kiểm phiên và vai; hoSo mang đúng u · uid · role · maKhachHang từ máy chủ, không tự khai.',
      san: 'Một cửa ghi bỏ kiểm vai; một trường phiên gõ sai tên trả undefined và cổng câm.',
      neoVao: 'kiemPhien', neoTep: 'may-chu/nen.js' }
  ];

  /* ── Mười luật nền — bộ tiêu chuẩn CAO NHẤT, chắt lọc từ chính kho ──
     Mỗi luật trỏ về NƠI nó đã cứu một lỗ thật (tu = bản/mục). Đây là thứ
     "chuẩn cao nhất của Google · FBI · Claude · ChatGPT" được rút gọn về
     luật đã có RĂNG trong hệ này, không phải một checklist ngoài. */
  G.TTS_CHUAN = [
    { ma: 'C01', ten: 'Phép đo phải ĐỎ ĐƯỢC',
      noi: 'Một phép đo không thể đỏ trên đúng lỗ nó canh là một phép đo giả. Viết xong phải PHÁ THỬ: cố ý làm hỏng để xem nó đỏ đúng chỗ, rồi mới trả về.', tu: '9.99.107 · 9.99.110' },
    { ma: 'C02', ten: 'Cổng đứng TRƯỚC khi ghi',
      noi: 'Cổng dựng SAU câu INSERT/UPDATE thì nó chỉ là một lời nhắc — người ta đọc, thấy hợp lý, rồi vẫn ghi. Răng phải nằm ở chỗ GHI.', tu: '86 · 87 · 91 · 93 · 103' },
    { ma: 'C03', ten: 'Làm THẬT việc mình khai',
      noi: 'Một ô/cửa khai "đã xoá / đã gỡ / đã đủ" mà không làm việc ấy là một lời nói dối mang dấu hệ thống. Xoá là DELETE thật rồi ĐẾM còn lại.', tu: 'daGoNgoai · 9.99.112' },
    { ma: 'C04', ten: 'Đo HÀNH VI, không đo lời khai',
      noi: 'Một cái cờ do người gọi truyền vào là một lời khai — bật được mà không làm gì. Đo kết quả THẬT: cùng câu hỏi phải ra hai câu trả lời khác nhau.', tu: '9.99.64 · 81' },
    { ma: 'C05', ten: 'So canonical, không tin ô người gọi',
      noi: 'So định danh bằng một chuỗi thô một vế thì email/mã của chính mình lọt. Quy mọi hình (id · username · email) về một khoá rồi so; không tra được thì ĐÓNG.', tu: '9.99.114 · 76' },
    { ma: 'C06', ten: 'Nhiều ghi phải NGUYÊN TỬ',
      noi: 'Worker sập giữa chừng thì ghi nửa vời. Cứu hệ · xoá · lương gom các câu vào một db.batch — hoặc cả, hoặc không gì.', tu: '9.99.116 · 119' },
    { ma: 'C07', ten: 'Trống KHÁC số 0',
      noi: 'Trống là "không đo được"; 0 là "đo được và bằng không". Gộp hai là mất đúng chỗ có nghĩa — một hàng trống hoá thành một kết quả kém.', tu: 'phễu 9.99.59' },
    { ma: 'C08', ten: 'Một nguồn sự thật, không bản chép',
      noi: 'Bản thứ hai của một sự thật thì một hôm hai bản lệch nhau, và không màn nào hiện ra chỗ sai. Trỏ, đừng chép — nhất là bảng CẤM và HIẾN PHÁP.', tu: '9.99.83 · 89' },
    { ma: 'C09', ten: 'Đo HAI ĐẦU ĐỘC LẬP',
      noi: 'Một phép so hai ô do cùng một người gõ trong cùng một lượt là một cái gương, không phải phép kiểm chéo. Ít nhất một đầu phải đến từ chỗ khác.', tu: '9.99.84 · 85' },
    { ma: 'C10', ten: 'Ngờ là đủ để CHẶN',
      noi: 'Với dữ liệu một đứa trẻ rời hệ: bắt oan tốn ba mươi giây sửa; lọt một cái tên thì nó đã ra ngoài và không gọi về được. Chặn dư hơn lọt.', tu: 'Điều 13 · 9.99.62' }
  ];

  /* ── Vòng soi chéo — hoán vị vòng, KHÔNG ai tự soi mình ──
     TT(n) soi TT(n+1), TT cuối soi TT đầu. Không điểm bất động: không
     thanh tra nào tự cấp cho mình một điểm sạch. */
  G.TTS_CHEO = (function () {
    var ma = (G.TTS_TO || []).map(function (t) { return t.ma; })
      .sort();                       /* TT01..TT10, thứ tự ổn định */
    var v = [];
    for (var i = 0; i < ma.length; i++) {
      v.push({ soi: ma[i], biSoi: ma[(i + 1) % ma.length] });
    }
    return v;
  })();

  /* ── Quyền Super Admin — trên cả trợ lý LẪN thanh tra ──
     Răng nằm ở may-chu/thanh-tra.js, không ở màn. */
  G.TTS_QUYEN = [
    { cua: 'xoaTroLy', ten: 'Xoá một TRỢ LÝ vi phạm', ai: 'R01',
      rang: 'Chỉ Super Admin. Phải viết lý do (≥10 ký tự). Ghi vào sổ thanh tra + nhật ký. Có lịch sử — khôi phục được.' },
    { cua: 'xoaThanhTra', ten: 'Xoá một THANH TRA vi phạm', ai: 'R01',
      rang: 'Không ai đứng trên Super Admin: kể cả thanh tra cũng bị loại nếu vi phạm. Cùng luật lý-do-bắt-buộc.' },
    { cua: 'ghiBaoCaoThanhTra', ten: 'Ghi một dòng báo cáo / xử lý', ai: 'R01–R02',
      rang: 'Thư mục báo cáo cập nhật liên tục. Mỗi dòng khai đối tượng, mức độ, nội dung.' },
    { cua: 'docBaoCaoThanhTra', ten: 'Đọc thư mục báo cáo', ai: 'R01–R02',
      rang: 'Nêu RIÊNG ba loại (báo cáo · xoá trợ lý · xoá thanh tra) — một quyết định xoá không lẫn vào ghi chú thường.' }
  ];

  /* Mười cấp — cấp N phủ bậc (N-1)·100+1 … N·100. Liền mạch 1→1000. */
  G.TTS_CAP = [];
  for (var c = 1; c <= 10; c++) {
    G.TTS_CAP.push({ cap: c, bacTu: (c - 1) * 100 + 1, bacDen: c * 100 });
  }

  G.TTS_LUAT = {
    chongApPhich: 'Mỗi thanh tra NEO vào một phép soi CÓ THẬT trong mã nguồn (neoVao · neoTep); mục 114 đối chiếu tên ấy tồn tại trong tệp — trỏ vào cái tên bịa thì ĐỎ. Một thanh tra không soi được gì thì không phải thanh tra.',
    chuanChatLoc: 'Mười luật nền là chắt lọc bộ tiêu chuẩn cao nhất — mỗi luật đã có RĂNG và đã cứu một lỗ thật trong chính kho này, không phải một checklist ngoài chép vào.',
    soiCheo: 'Mười thanh tra soi LẪN NHAU theo một vòng: TT01 soi TT02, … TT10 soi TT01. Không ai tự soi mình, nên không ai tự cấp cho mình một điểm sạch.',
    superAdmin: 'Super Admin đứng trên cả thanh tra: quyền xoá trợ lý VÀ xoá thanh tra vi phạm. Răng ở may-chu/thanh-tra.js — chỉ R01, phải viết lý do, cổng trước INSERT.',
    docLap: 'Mười thanh tra mười miền, mỗi thanh tra một khoá neo riêng, không ai dựa vào kết luận của người khác.',
    khongChayTaiCho: 'Màn này là BẢN ĐỒ, không chạy thanh tra lúc bấm. Các phép soi thật chạy trong bộ kiểm phát hành: node tools/phat-hanh.js.',
    thang: 'Mười cấp × 100 bậc = 1000 bậc tiêu chuẩn liền mạch. Cấp cao = hậu quả nặng hơn khi hỏng.'
  };

  /* ── Thư mục báo cáo — đọc từ máy chủ khi bấm ── */
  function veLai() {
    if (!G.S || G.S.view !== 'thanh-tra-soi') return;
    if (typeof document === 'undefined' || !document.getElementById('main')) return;
    G.render && G.render();
  }
  G.ttsTaiBaoCao = function () {
    if (!G.goiMayChu) { G.ttsBaoCao = { ok: false, demo: true }; veLai(); return; }
    G.ttsBaoCao = { dangTai: true }; veLai();
    G.goiMayChu('docBaoCaoThanhTra', {}).then(function (x) {
      G.ttsBaoCao = x; veLai();
    }).catch(function (e) {
      G.ttsBaoCao = { ok: false, error: (e && e.message) || 'Lỗi.' }; veLai();
    });
  };
  G.ttsGhiBaoCao = function () {
    var nd = (document.getElementById('tts_bc_nd') || {}).value || '';
    var dt = (document.getElementById('tts_bc_dt') || {}).value || '';
    var o = document.getElementById('tts_bc_bao');
    function bao(t) { if (o) o.textContent = t; }
    if (!G.goiMayChu) { bao('Bản mẫu chưa nối máy chủ — chưa ghi được.'); return; }
    if (String(nd).trim().length < 5) { bao('Báo cáo phải có nội dung (≥5 ký tự).'); return; }
    bao('Đang gửi…');
    G.goiMayChu('ghiBaoCaoThanhTra', { noiDung: nd, doiTuong: dt })
      .then(function (x) {
        if (!x.ok) { bao(x.error || 'Không ghi được.'); return; }
        bao('Đã ghi vào thư mục báo cáo.');
        G.ttsTaiBaoCao();
      })
      .catch(function (e) { bao((e && e.message) || 'Lỗi.'); });
  };

  function laR01() {
    return String(((G.S || {}).hoSo || {}).role || '') === 'R01';
  }
  function laR01R02() {
    var r = String(((G.S || {}).hoSo || {}).role || '');
    return r === 'R01' || r === 'R02';
  }

  G.VIEWS = G.VIEWS || {};
  G.VIEWS['thanh-tra-soi'] = function () {
    var L = G.TTS_LUAT || {};
    var to = (G.TTS_TO || []).slice().sort(function (a, b) { return b.cap - a.cap; });
    var o = U.ph({ eyebrow: 'MƯỜI THANH TRA CẤP CAO', ic: 'shield', grad: 1,
      t: 'Mười thanh tra độc lập · soi chéo · Super Admin đứng trên tất cả',
      lead: 'Kiểm 100 trợ lý và bộ não bằng bộ tiêu chuẩn cao nhất — không đơn thuần là máy đo để ' +
        'bịt khách. Mỗi thanh tra neo vào một phép soi CÓ THẬT, mười thanh tra soi lẫn nhau, và ' +
        'Super Admin có quyền xoá bất kỳ ai vi phạm — kể cả một thanh tra.' });

    /* 1 · Mười luật nền — bộ tiêu chuẩn cao nhất */
    o += U.sec('Bộ tiêu chuẩn cao nhất · mười luật nền', L.chuanChatLoc || '');
    o += '<div class="card mb">' + (G.TTS_CHUAN || []).map(function (k) {
      return '<div style="padding:9px 0;border-bottom:1px solid var(--gita-vien-2)">' +
        '<b>' + h(k.ma) + ' · ' + h(k.ten) + '</b>' +
        ' <span class="tiny dim">(' + h(k.tu) + ')</span>' +
        '<p class="sm mt" style="line-height:1.75">' + h(k.noi) + '</p></div>';
    }).join('') + '</div>';

    /* 2 · Mười thanh tra · xếp theo cấp */
    o += U.sec('Mười thanh tra · xếp theo cấp (hậu quả nặng nhất trước)', L.chongApPhich || '');
    o += '<div class="card mb">' + to.map(function (t) {
      var ch = (G.TTS_CHUAN || []).filter(function (x) { return x.ma === t.chuan; })[0];
      return '<div style="padding:10px 0;border-bottom:1px solid var(--gita-vien-2)">' +
        '<b>Cấp ' + t.cap + ' · ' + h(t.ten) + '</b>' +
        ' <span class="tiny dim">(bậc ' + ((t.cap - 1) * 100 + 1) + '–' + (t.cap * 100) + ')</span>' +
        '<p class="sm mt" style="line-height:1.8"><b>Canh:</b> ' + h(t.mien) + '</p>' +
        '<p class="tiny mt" style="line-height:1.7"><b>Săn lỗi:</b> ' + h(t.san) + '</p>' +
        '<div class="tiny dim mt" style="line-height:1.7"><b>Neo vào phép soi thật:</b> ' +
        '<code>' + h(t.neoVao) + '</code> · ' + h(t.neoTep) +
        (ch ? ' · <b>Luật nền:</b> ' + h(t.chuan) + ' ' + h(ch.ten) : '') +
        '</div></div>';
    }).join('') + '</div>';

    /* 3 · Vòng soi chéo */
    o += U.sec('Mười thanh tra soi LẪN NHAU', L.soiCheo || '');
    o += U.tbl(['Thanh tra', 'Soi ai'],
      (G.TTS_CHEO || []).map(function (v) {
        var a = (G.TTS_TO || []).filter(function (x) { return x.ma === v.soi; })[0];
        var b = (G.TTS_TO || []).filter(function (x) { return x.ma === v.biSoi; })[0];
        return [h(v.soi + (a ? ' · ' + a.ten : '')), h(v.biSoi + (b ? ' · ' + b.ten : ''))];
      }));

    /* 4 · Quyền Super Admin */
    o += U.sec('Super Admin đứng trên tất cả', L.superAdmin || '');
    o += U.tbl(['Cửa', 'Quyền', 'Ai được làm', 'Cái răng'],
      (G.TTS_QUYEN || []).map(function (q) {
        return ['<code>' + h(q.cua) + '</code>', h(q.ten), h(q.ai), h(q.rang)];
      }));

    /* 5 · Thư mục báo cáo thanh tra */
    o += U.sec('Thư mục báo cáo thanh tra', 'Cập nhật liên tục — nơi ghi và xử lý vấn đề của trợ lý/thanh tra.');
    if (laR01R02()) {
      o += '<div class="card mb">' +
        '<label class="sm" for="tts_bc_dt">Đối tượng (mã trợ lý/thanh tra — có thể để trống)</label>' +
        '<input id="tts_bc_dt" class="mt" placeholder="ví dụ: TT10 hoặc traLoiCoach">' +
        '<label class="sm mt" for="tts_bc_nd">Nội dung báo cáo / xử lý</label>' +
        '<textarea id="tts_bc_nd" class="mt" rows="3" placeholder="Vấn đề phát hiện và cách xử lý…"></textarea>' +
        '<div class="row mt" style="gap:8px;flex-wrap:wrap">' +
        '<button class="btn primary" onclick="G.ttsGhiBaoCao()">Ghi báo cáo</button>' +
        '<button class="btn" onclick="G.ttsTaiBaoCao()">Tải thư mục</button></div>' +
        '<p id="tts_bc_bao" class="tiny dim mt"></p></div>';
    } else {
      o += '<div class="card mb" style="border-left:3px solid var(--warn)">' +
        '<p class="sm">Thư mục báo cáo thanh tra mở cho Super Admin và Giám đốc (R01–R02). ' +
        'Vai này xem được bản đồ thanh tra, không ghi/đọc được thư mục báo cáo.</p></div>';
    }

    var d = G.ttsBaoCao;
    if (laR01R02() && d) {
      if (d.dangTai) {
        o += '<div class="card"><p class="sm">Đang tải…</p></div>';
      } else if (d.demo) {
        o += '<div class="card" style="border-left:3px solid var(--warn)">' +
          '<p class="sm">Bản mẫu chưa nối máy chủ — thư mục báo cáo nằm ở máy chủ, ' +
          'chưa đọc được. Nối máy chủ ở màn <b>Nối máy chủ</b> rồi tải lại.</p></div>';
      } else if (!d.ok) {
        o += '<div class="card" style="border-left:3px solid var(--bad)">' +
          '<p class="sm">' + h(d.error || 'Không đọc được thư mục báo cáo.') + '</p></div>';
      } else {
        o += nhomBaoCao('Quyết định xoá TRỢ LÝ', d.xoaTroLy, 'bad');
        o += nhomBaoCao('Quyết định xoá THANH TRA', d.xoaThanhTra, 'bad');
        o += nhomBaoCao('Báo cáo · xử lý vấn đề', d.baoCao, 'line');
      }
    }

    /* 6 · Nền tảng */
    o += '<p class="tiny dim mb mt" style="line-height:1.7"><b>Độc lập:</b> ' +
      h(L.docLap || '') + '</p>';
    o += '<p class="tiny dim mb" style="line-height:1.7"><b>Chạy thật ở đâu:</b> ' +
      h(L.khongChayTaiCho || '') + '</p>';
    return o;
  };

  function nhomBaoCao(tieu, ds, mau) {
    ds = ds || [];
    var o = '<div class="card mt" style="border-left:3px solid var(--' + mau + ')">' +
      '<b class="sm">' + h(tieu) + ' <span class="tiny dim">(' + ds.length + ')</span></b>';
    if (!ds.length) {
      o += '<p class="tiny dim mt">Chưa có dòng nào.</p>';
    } else {
      o += ds.map(function (r) {
        return '<div class="tiny mt" style="line-height:1.7;border-top:1px solid var(--gita-vien-2);padding-top:6px">' +
          '<b>' + h(String(r.luc || '').slice(0, 16)) + '</b>' +
          (r.doiTuong ? ' · ' + h(r.doiTuong) : '') +
          (r.mucDo ? ' · <span class="dim">' + h(r.mucDo) + '</span>' : '') +
          '<br>' + h(r.noiDung || '') +
          '<span class="dim"> — ' + h(r.boiAi || '') + '</span></div>';
      }).join('');
    }
    return o + '</div>';
  }
})();
