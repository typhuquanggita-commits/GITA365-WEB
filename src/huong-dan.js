/* ═══════════════════════════════════════════════════════════════
   GITA 365 · 9.99.186 — VIDEO HƯỚNG DẪN TỪNG MÀN, THEO VAI
   Chủ hệ: mỗi màn có một video hướng dẫn bài bản như một tư vấn viên
   dắt tay khách; học sinh · phụ huynh · tư vấn · coach · các bộ phận
   chuyên môn mỗi vai một hướng dẫn phù hợp — nhiệm vụ · vai trò · chức
   năng · quyền hạn · cách dùng công cụ · cập nhật mới · xử lý vấn đề
   khách; để làm tốt việc, đạt 100% KPI.

   CÁCH LÀM — trung thực với luật kho:
     · Đây là "video CHẠY TRONG APP" — cảnh nối cảnh, người dẫn xưng vai,
       tự chạy theo nhịp, có tạm dừng/tới/lui. KHÔNG phải mp4 tải về.
     · mp4 THẬT dựng ở Studio (tools/dung-phim.js) từ KHUNG ĐÃ PHÁT HÀNH
       (luật C19) và LỜI ĐỌC là tệp CÓ SẴN (luật C20 — máy KHÔNG tự sinh
       giọng). Chưa có lời đọc thu sẵn thì chưa xuất mp4 — sổ chờ HD-01.
     · Kịch bản mỗi màn: màn nào có khai riêng thì dùng, còn lại DỰNG NỀN
       tự động từ chính mô tả màn trong G.NAV — nên MỌI màn đều có hướng
       dẫn, kể cả màn viết sau (không cần khai tay từng cái).

   Người dẫn xưng vai qua G.tlVai() (9.99.185) — cùng một nguồn, không
   dựng bản thứ hai. Không mạng, không tải xuống.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;

(function () {
  var U = G.U, h = U.h, ic = U.ic;

  /* ─── HỆ VIDEO CHUẨN: mỗi màn LUÔN có 5 mục (5 video), theo khung đào
     tạo nhân sự. Mỗi cảnh KHAI RIÊNG gắn `slot` vào một trong 5 mục; chỗ
     nào không khai thì DỰNG NỀN tự động — nên MỌI màn đều đủ 5, kể cả màn
     viết sau. Năm mục chuẩn: giới thiệu · nhiệm vụ-quyền · dùng công cụ ·
     bài làm mẫu · xử lý-KPI-vinh danh. ─── */
  /* Phụ huynh & học viên: 10 video/màn (chi tiết). Nhân sự: 5 video/màn. */
  var STD10 = [
    { id: 'gioi-thieu', ten: 'Giới thiệu màn' },
    { id: 'vai-tro', ten: 'Vai trò & quyền của bạn' },
    { id: 'cong-cu', ten: 'Cách dùng công cụ' },
    { id: 'bai-mau', ten: 'Bài làm mẫu' },
    { id: 'cach-hay', ten: 'Cách hay & sáng tạo' },
    { id: 'nhap-vai', ten: 'Nhập vai thực hành' },
    { id: 'vi-du', ten: 'Ví dụ & tình huống thường gặp' },
    { id: 'xu-ly', ten: 'Xử lý khi mắc kẹt' },
    { id: 'kpi', ten: 'Mục tiêu & tiến bộ' },
    { id: 'vinh-danh', ten: 'Ghi nhận & vinh danh' }
  ];
  var STD5 = [
    { id: 'gioi-thieu', ten: 'Giới thiệu màn' },
    { id: 'nhiem-vu', ten: 'Nhiệm vụ · vai trò · quyền hạn' },
    { id: 'cong-cu', ten: 'Cách dùng công cụ' },
    { id: 'bai-mau', ten: 'Bài làm mẫu · cách hay' },
    { id: 'xu-ly', ten: 'Xử lý vấn đề · KPI · vinh danh' }
  ];
  /* Gộp slot của bộ 10 về bộ 5 khi dựng cho nhân sự. */
  var MAP5 = { 'gioi-thieu': 'gioi-thieu', 'vai-tro': 'nhiem-vu', 'cong-cu': 'cong-cu',
    'bai-mau': 'bai-mau', 'cach-hay': 'bai-mau', 'nhap-vai': 'bai-mau',
    'vi-du': 'xu-ly', 'xu-ly': 'xu-ly', 'kpi': 'xu-ly', 'vinh-danh': 'xu-ly' };
  var HD = {
    'ngoi-nha': [
      { slot: 'gioi-thieu', td: 'Ngôi nhà thịnh vượng', ic: 'home', loi: 'Đây là trang chủ dạng ngôi nhà. Mỗi phần — mái, các phòng, cửa, nền — mở một màn thật. Nhìn một lượt là biết mình đang ở đâu.',
        giai: 'Ngôi nhà là bản đồ: mái là tầm nhìn, các phòng là từng phần đời sống gia đình, cửa chính là việc mỗi ngày, nền là thói quen.' },
      { slot: 'cong-cu', td: 'Cách dùng', ic: 'home', loi: 'Bấm vào từng phần để đi tới nội dung. Phần nào mờ và có ổ khoá là phần của vai khác — không phải chỗ chưa làm xong.',
        buoc: ['Bấm "Cửa chính" để vào việc hôm nay', 'Bấm một "phòng" để xem con đường của chặng đó', 'Mười bánh đà quanh nhà là mười mốc hành trình'] },
      { slot: 'nhap-vai', td: 'Buổi đầu cùng con', ic: 'spark',
        loi: 'Buổi tối đầu tiên, ba mẹ mở ngôi nhà cùng con — không giảng, chỉ cùng nhìn và hỏi. Đây là một mẫu hội thoại.',
        hoiThoai: [
          { ai: 'Ba mẹ', ben: 'a', loi: 'Con nhìn ngôi nhà này xem — con thích vào "phòng" nào trước?' },
          { ai: 'Con', ben: 'b', loi: 'Con thích phòng Tài năng, có hình ngôi sao.' },
          { ai: 'Ba mẹ', ben: 'a', loi: 'Hay đó. Mình bấm vào xem trong đó có gì, rồi chọn một việc nhỏ làm tối nay nhé?' },
          { ai: 'Con', ben: 'b', loi: 'Dạ! Con làm được cái này.' }
        ],
        giai: 'Điểm mấu chốt: để con CHỌN trước, ba mẹ đi cùng. Ngôi nhà là của cả nhà, không phải bài tập ba mẹ giao.' },
      { slot: 'cach-hay', td: 'Chốt một việc nhỏ', ic: 'check',
        loi: 'Kết mỗi buổi bằng đúng một việc nhỏ làm được ngay — để con thấy "mình làm được", không phải "còn cả núi".',
        cachHay: ['Cho con tự bấm chọn phần con thích — quyền chọn nuôi hứng thú',
                  'Mỗi tối một phòng thôi, đi chậm mà đều',
                  'Chụp lại "trước — sau" để tuần sau cả nhà cùng xem đã đổi gì'] },
      { slot: 'vinh-danh', td: 'Khen đúng cách', ic: 'check',
        loi: 'Ngôi nhà lớn lên bằng những lần được ghi nhận. Khen việc con LÀM, không khen phẩm chất chung chung.',
        vinhDanh: 'Thay vì "con giỏi quá", hãy nói "ba mẹ thấy con tự mở phòng Tài năng và làm xong việc tối nay — con đang tự bước đi đấy". Ghi nhận cụ thể thì con biết đường mà làm tiếp.',
        kpi: 'Mỗi tuần một lần "vinh danh" trong nhà — một câu ghi nhận cụ thể — là nhịp giữ động lực bền hơn mọi phần thưởng vật chất.' }
    ],
    'hom-nay': [
      { slot: 'gioi-thieu', td: 'Màn Hôm nay', loi: 'Mỗi ngày một việc, đúng một việc — không để nhà mình rối. Làm xong việc hôm nay là đủ cho hôm nay.' },
      { slot: 'cong-cu', td: 'Cách dùng', loi: 'Đọc việc lớn ở giữa, làm theo. Bận thì bấm "Để hôm khác" — không ai hỏi vặn lý do.',
        buoc: ['Xem việc lớn hôm nay', 'Làm xong thì đánh dấu', 'Nặng quá thì để hôm khác, mai nhắc lại'] }
    ],
    'tro-ly': [
      { slot: 'gioi-thieu', td: 'Trợ lý đồng hành', loi: 'Hỏi bằng lời thường — chuyện con, cách nói với con, việc nên làm. Người dẫn đọc hồ sơ nhà mình rồi trả lời, không phải câu mẫu.' },
      { slot: 'cong-cu', td: 'Hỏi được gì', loi: 'Hỏi cách làm, hỏi con số (học phí, thời gian), kể một chuyện đang mắc. Câu có số thì có phần tính rõ từng bước.',
        buoc: ['Gõ câu hỏi hoặc bấm một gợi ý', 'Đọc câu trả lời, hỏi tiếp cho rõ', 'Tư liệu sâu nằm gập ở "Tư liệu tham khảo"'],
        vd: 'Ví dụ: gõ "học phí 12 triệu chia 12 tháng là bao nhiêu" — trợ lý trả lời 1.000.000/tháng, có ghi rõ cách tính.' },
      { slot: 'xu-ly', td: 'Việc cần người thật', loi: 'Chuyện gấp về an toàn thì người dẫn dừng lại và chuyển ngay sang người thật — đó là đường không bao giờ để máy lo.' }
    ],
    'ban-do': [
      { slot: 'gioi-thieu', td: 'Bản đồ hành trình', loi: 'Toàn cảnh chặng đường nhà mình đang đi và sắp tới. Biết mình ở đâu thì biết bước kế tiếp là gì.' },
      { slot: 'cong-cu', td: 'Cách đọc', loi: 'Mốc sáng là đã qua, mốc mờ là phía trước. Bấm một mốc để xem việc của mốc đó.' }
    ],
    'crm': [
      { slot: 'gioi-thieu', td: 'Bảng khách của tôi', loi: 'Đây là chỗ quản lý toàn bộ khách mình phụ trách — ai cần gọi hôm nay, ai sắp tới hẹn, ai đang nguội.',
        giai: 'CRM là "sổ tay khách" của bạn: mỗi nhà một dòng, trạng thái rõ ràng, không phải nhớ trong đầu.' },
      { slot: 'cong-cu', td: 'Tìm và lọc', loi: 'Gõ tên hoặc lọc theo chặng để tìm nhanh. Danh sách chia trang, không đổ hết một lúc.',
        buoc: ['Gõ tên vào ô tìm', 'Chọn chặng để lọc', 'Chuyển trang nếu danh sách dài'] },
      { slot: 'cong-cu', td: 'Ngăn "Việc nên làm"', loi: 'Xếp GẤP lên trước: đèn đỏ phải GỌI (không nhắn), nhà quá hạn theo dõi, nhà chưa ai phụ trách.',
        buoc: ['Mở "Việc nên làm" đầu ca', 'Làm từ trên xuống — gấp trước', 'Ghi lại mỗi lần chạm để không sót'] },
      { slot: 'bai-mau', td: 'Bài làm mẫu một ca', ic: 'check', loi: 'Một ca làm chuẩn của người đạt KPI xuất sắc trông như thế này.',
        baiMau: 'Đầu ca: mở "Việc nên làm", thấy 3 đèn đỏ + 2 hẹn. Gọi 3 đèn đỏ TRƯỚC (mỗi cuộc ghi lại nội dung), rồi nhắn xác nhận 2 hẹn. Giữa ca: chạm các nhà tới nhịp. Cuối ca: soát KPI, ghi đủ mọi lượt — không để sót dòng nào.',
        cachHay: ['Nhóm cuộc gọi lại một khung giờ để tập trung, không gọi rải rác',
                  'Chuẩn bị trước 1 câu mở cho nhà đang nguội — đỡ ngập ngừng',
                  'Sau mỗi cuộc, ghi ngay một dòng — để cuối ca không phải nhớ lại'] },
      { slot: 'xu-ly', td: 'Đèn đỏ & KPI', loi: 'Đèn đỏ là nhà đang nguội — phải GỌI người thật trong 24 giờ, không đóng bằng tin nhắn.',
        vd: 'Ví dụ: nhà A đèn đỏ 2 ngày → gọi ngay hôm nay, ghi lại nội dung cuộc gọi.',
        kpi: 'Mỗi ngày làm hết phần GẤP là giữ được nhịp KPI. Đèn đỏ gọi trong 24 giờ = giữ khách; ghi đủ mỗi lần chạm = không mất điểm liên đới.' }
    ],
    'tien-bo': [
      { slot: 'gioi-thieu', td: 'Nhà mình đã đổi gì', loi: 'Tuần này so với tuần trước, và phần chênh lệch nói bằng lời — để thấy công sức đang thành kết quả.' }
    ],
    'kpi-toi': [
      { slot: 'gioi-thieu', td: 'KPI của tôi', loi: 'KPI ngày, KPI tháng, phần liên đới và hạng lương thưởng — tất cả ở một chỗ, đọc được ngay.' },
      { slot: 'xu-ly', td: 'Đọc để hành động', loi: 'Số nào dưới đích thì đó là chỗ dồn sức tuần này. Không đoán — nhìn số rồi làm.',
        kpi: 'Nhìn số dưới đích trước, dồn sức đúng chỗ đó trong tuần — KPI cải thiện từ việc chọn đúng ưu tiên.' }
    ]
  };

  /* Tìm mục NAV của một view (NAV là nhóm → items). */
  function timNav(view) {
    var ns = G.NAV || [];
    for (var i = 0; i < ns.length; i++) {
      var it = (ns[i] && ns[i].items) || [];
      for (var j = 0; j < it.length; j++) if (it[j].v === view) return it[j];
    }
    return null;
  }

  /* Tên và mô tả màn theo LỜI CỦA NGƯỜI ĐANG XEM. G.iname/G.ihint đi qua
     G.nd: khách đọc lời nhà mình (G.NOI_KHACH), nhân sự đọc lời nghề, Super
     Admin sửa được cả hai. Đọc thẳng nav.t/nav.h là đưa chữ nghề vào đúng
     video dắt tay khách. Bọc try vì iname đọc G.ITEM_EN — thiếu mô-đun
     dịch thì lùi về chữ gốc, không làm vỡ video. */
  function tenMan(nav) {
    if (!nav) return '';
    try { if (typeof G.iname === 'function') { var t = G.iname(nav); if (t) return String(t); } } catch (e) {}
    return nav.t || '';
  }
  function moTaMan(nav) {
    if (!nav) return '';
    try { if (typeof G.ihint === 'function') { var t = G.ihint(nav); if (t) return String(t); } } catch (e) {}
    return nav.h || '';
  }
  /* Nhãn đối tượng trên bìa: người xem biết ngay video này nói với ai —
     khách nghe lời nhà mình, chuyên gia (bậc 1–5) nghe lời điều hành. */
  function doiTuong(khach) {
    if (khach) return 'Dành cho khách hàng';
    var r = G.S && G.S.roleObj, lv = r ? Number(r.lv) : 0;
    return (lv > 0 && lv <= 5) ? 'Dành cho chuyên gia' : 'Dành cho nhân sự';
  }
  /* Nhãn nút chế độ từng bước — khách đọc lời mời, nhân sự đọc lời làm. */
  function nhanBuoc(khach) { return khach ? 'Xem cách làm từng bước' : 'Làm theo từng bước'; }

  /* ─── Dựng kịch bản cho một màn: khai riêng thì dùng, không thì DỰNG
     NỀN từ mô tả NAV — nên màn nào cũng có hướng dẫn. ─── */
  /* Họ tên gắn với tài khoản đăng nhập — cho lời chào mừng. */
  function tenToi() { return (G.S && G.S.acc && G.S.acc.ten) || 'anh chị'; }
  /* Màu thương hiệu xoay vòng cho từng cảnh — hệ hình ảnh có màu. */
  var MAU = ['--gita-sau', '--t2', '--t3', '--t4', '--t1', '--t5'];

  function ganMau(canh) {
    return canh.map(function (c, i) {
      var x = {}; for (var k in c) x[k] = c[k];
      x.mau = c.mau || MAU[i % MAU.length];
      return x;
    });
  }

  /* Một cảnh NỀN cho mỗi mục chuẩn — dựng theo vai + mô tả màn, để mục nào
     chưa soạn riêng vẫn có nội dung thật (không bao giờ là khung rỗng). */
  function nen(slot, khach, tua, mt, vai) {
    switch (slot) {
      case 'gioi-thieu':
        return { td: tua, loi: mt + '.', giai: 'Biết màn này làm gì rồi thì dùng nhanh và đúng — không mò.' };
      case 'vai-tro': case 'nhiem-vu':
        return { td: khach ? 'Phần của bạn ở đây' : 'Nhiệm vụ & quyền của bạn',
          loi: khach
            ? 'Đây là phần dành cho ' + (khach ? 'nhà mình' : 'bạn') + '. Đọc từ trên xuống, phần nào mở được là phần của mình.'
            : 'Màn này thuộc phần việc của vai bạn. Làm đúng chức năng và trong quyền hạn được cấp — phần ngoài quyền hệ sẽ nói rõ.',
          kpi: khach ? '' : 'Hoàn thành đúng phần việc màn này, đúng nhịp, là một phần KPI của vai bạn.' };
      case 'cong-cu':
        /* Lời chung cho mọi màn thì không chỉ được cái ô nào cả — nên mục
           này trỏ sang chế độ từng bước, nơi máy đọc chính màn đang mở. */
        return { td: 'Dùng công cụ trên màn «' + tua + '»',
          loi: 'Cách nhanh nhất là để máy chỉ tận chỗ: bấm «' + nhanBuoc(khach) + '», một vòng sáng sẽ đi qua từng ngăn, từng ô, từng nút trên chính màn này.',
          buoc: ['Bấm «' + nhanBuoc(khach) + '» ở đầu màn', 'Làm theo câu nhắc dưới vòng sáng', 'Bí ở đâu, bấm nút trợ lý ở góc phải'] };
      case 'bai-mau':
        return { td: 'Làm mẫu một lượt', ic: 'check',
          loi: khach ? 'Đây là cách một nhà làm tốt thường làm ở màn này. Xem rồi làm theo — hoặc hay hơn.'
                     : 'Đây là cách một người làm giỏi xử lý phần việc màn này — một chuẩn mực để đạt KPI xuất sắc.',
          baiMau: khach ? 'Mở màn → đọc kỹ → làm đúng MỘT việc cho xong → ghi lại một dòng. Làm đều mỗi ngày hơn làm dồn cuối tuần.'
                        : 'Đầu ca rà việc GẤP → xử lý theo đúng thứ tự ưu tiên → ghi đủ mỗi lượt → cuối ca soát lại KPI.' };
      case 'cach-hay':
        return { td: 'Vài cách hay — và sáng tạo thêm', ic: 'spark',
          loi: 'Không có một khuôn cứng. Đây là vài cách làm tốt; nếu bạn có ý hay hơn, cứ làm theo cách của mình.',
          cachHay: khach
            ? ['Đặt một giờ cố định mỗi ngày để thành nếp', 'Rủ cả nhà cùng làm cho vui và bền', 'Ghi một dòng cảm nhận sau mỗi lần để thấy mình tiến']
            : ['Làm việc khó nhất khi đầu óc tỉnh nhất', 'Gộp việc cùng loại làm một lượt', 'Lưu lại cách hiệu quả để lần sau dùng lại'] };
      case 'nhap-vai':
        return { td: 'Thực hành một lượt', ic: 'spark',
          loi: 'Học bằng cách làm thử. Đây là một mẫu ngắn để bạn thực hành ngay trên màn này.',
          hoiThoai: khach
            ? [{ ai: 'Người dẫn', ben: 'a', loi: 'Bạn thử mở màn này và chọn một việc nhỏ xem?' },
               { ai: 'Bạn', ben: 'b', loi: 'Rồi, mình chọn việc này.' },
               { ai: 'Người dẫn', ben: 'a', loi: 'Tốt lắm — làm xong nhớ ghi lại một dòng nhé.' }]
            : [{ ai: 'Quản lý', ben: 'a', loi: 'Em thử xử lý một trường hợp trên màn này xem.' },
               { ai: 'Nhân sự', ben: 'b', loi: 'Vâng, em làm theo đúng quy trình rồi ghi lại.' }] };
      case 'vi-du':
        return { td: 'Tình huống thường gặp', loi: 'Một ví dụ hay gặp ở màn này, và cách xử lý gọn.',
          vd: khach ? 'Ví dụ: hôm nay bận quá — cứ làm một việc nhỏ nhất, mai làm tiếp. Đều đặn quan trọng hơn nhiều.'
                    : 'Ví dụ: gặp trường hợp ngoài quyền → không tự quyết, ghi lại và chuyển đúng người phụ trách.' };
      case 'xu-ly':
        return { td: 'Khi mắc kẹt', loi: 'Chưa chắc thì hỏi trợ lý — trả lời theo kho đã huấn luyện. Việc gấp hoặc ngoài quyền thì chuyển người phụ trách, không tự quyết.',
          vd: 'Ví dụ: không rõ bước tiếp theo → bấm trợ lý, hỏi bằng lời thường.' };
      case 'kpi':
        return { td: 'Mục tiêu & tiến bộ', loi: 'Làm đều ở màn này giúp bạn tiến bộ thấy được mỗi tuần.',
          kpi: khach ? 'Mỗi tuần nhìn lại "đã đổi gì" — một bước nhỏ đều đặn là tiến bộ thật.'
                     : 'Hoàn thành đúng phần việc màn này, đúng nhịp, là một phần KPI của vai bạn.' };
      case 'vinh-danh':
        return { td: 'Ghi nhận & vinh danh', ic: 'check', loi: 'Mỗi tiến bộ xứng đáng được ghi nhận cụ thể.',
          vinhDanh: khach ? 'Khen việc LÀM, không khen chung chung: "mình đã tự làm xong việc này" — ghi nhận cụ thể thì có động lực đi tiếp.'
                          : 'Ghi nhận đồng đội bằng việc cụ thể họ làm được — cụ thể thì thật, và giữ lửa cả đội.' };
      default:
        return { td: tua, loi: mt + '.' };
    }
  }

  G.hdChoMan = function (view) {
    var nav = timNav(view);
    var vai = (G.tlVai && G.tlVai()) || { ten: 'Người hướng dẫn', moTa: '' };
    var khach = !!(G.LA_KHACH && G.LA_KHACH());
    var tua = tenMan(nav) || 'Màn này';
    var mt = moTaMan(nav) || 'Màn này phục vụ một việc trong hệ GITA 365.';
    /* HỆ VIDEO CHUẨN: khách 10 mục/màn · nhân sự 5 mục/màn. */
    var bo = khach ? STD10 : STD5;
    var soanRieng = Array.isArray(HD[view]) ? HD[view] : [];
    var muc = bo.map(function (s) {
      var canh = soanRieng.filter(function (c) {
        var sid = khach ? (c.slot || 'gioi-thieu') : (MAP5[c.slot] || c.slot || 'gioi-thieu');
        return sid === s.id;
      });
      if (!canh.length) canh = [nen(s.id, khach, tua, mt, vai)];
      return { id: s.id, ten: s.ten, canh: ganMau(canh) };
    });
    return { tua: tua, vai: vai, muc: muc, view: view, khach: khach, doiTuong: doiTuong(khach),
             chao: 'Chào mừng ' + tenToi() + '! ' +
               (khach ? 'Đây là ' + vai.ten.toLowerCase() + ' của nhà mình'
                      : 'Bạn đang ở vai ' + vai.ten.toLowerCase()) +
               '. Có ' + muc.length + ' video hướng dẫn cho màn này — chọn một mục để xem.' };
  };

  /* ══════════════ TRÌNH CHIẾU — "phim" chạy trong app ══════════════
     mucIdx = -1: đang ở MỤC LỤC (bìa chào mừng + danh sách mục).
     mucIdx >= 0: đang chiếu mục ấy, idx = cảnh trong mục. */
  var kb = null, mucIdx = -1, idx = 0, chay = false, hen = null, phien = 0, che = 'thuong';
  var amOn = true;
  try { amOn = localStorage.getItem('gita-hd-am') !== '0'; } catch (e) {}
  var actx = null;

  function mucHienTai() { return kb && mucIdx >= 0 ? kb.muc[mucIdx] : null; }
  function thoiHen() { if (hen) { clearTimeout(hen); hen = null; } }
  function dungLuong(c) {
    if (!c) return 4000;
    var n = (c.loi ? c.loi.length : 0) + (c.buoc ? c.buoc.length * 22 : 0) +
            (c.vd ? c.vd.length : 0) + (c.kpi ? c.kpi.length : 0) +
            (c.baiMau ? c.baiMau.length : 0) + (c.cachHay ? c.cachHay.join('').length : 0) +
            (c.hoiThoai ? c.hoiThoai.reduce(function (s, d) { return s + ((d && d.loi) ? d.loi.length : 0) + 12; }, 0) : 0) +
            (c.vinhDanh ? c.vinhDanh.length : 0);
    return Math.max(3800, Math.min(12000, 2400 + n * 36));
  }
  /* Giai điệu nhẹ — hai nốt mềm, dựng bằng WebAudio (âm hiệu giao diện,
     KHÔNG phải nhạc/lời cho phim mp4: luật C20 nói về xưởng phim). Tắt
     được, nhớ lựa chọn.

     CHẠY TIẾNG TRÊN MỌI TRÌNH DUYỆT: WebAudio hay khởi động ở trạng thái
     'suspended' (Safari/iOS/Chrome mobile chặn autoplay). Phải tạo VÀ
     resume() context TRONG một cử chỉ bấm, rồi giữ cho các nhịp sau (cảnh
     tự chạy nổ bằng setTimeout — ngoài cử chỉ — nên context phải đang
     'running' sẵn từ lúc bấm mở). */
  function moKhoaAm() {
    try {
      var AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
      actx = actx || new AC();
      if (actx.state === 'suspended' && actx.resume) actx.resume();
    } catch (e) {}
  }
  function chuong(hop) {
    if (!amOn) return;
    try {
      var AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
      actx = actx || new AC();
      if (actx.state === 'suspended' && actx.resume) actx.resume();   /* mỗi lần phát đều bảo đảm đang chạy */
      var t = actx.currentTime, notes = hop ? [523.25, 659.25, 783.99] : [523.25, 659.25];
      notes.forEach(function (f, i) {
        var o = actx.createOscillator(), g = actx.createGain();
        o.type = 'sine'; o.frequency.value = f; o.connect(g); g.connect(actx.destination);
        var s = t + i * 0.09;
        g.gain.setValueAtTime(0, s); g.gain.linearRampToValueAtTime(0.05, s + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, s + 0.5);
        o.start(s); o.stop(s + 0.55);
      });
    } catch (e) {}
  }

  /* ─── LỚP GIỌNG THU SẴN (đồng bộ từng cảnh) ───
     Giọng là FILE THU SẴN (.m4a/.mp4 AAC) — đúng luật C20 (máy KHÔNG tự
     sinh giọng; kho còn chặn speechSynthesis ở khoa-sao-chep). Có file thì
     phát bằng <audio> (chạy Chrome·Edge·Cốc Cốc·Safari·điện thoại), cảnh
     đổi theo MỐC thời gian từng cảnh; KHÔNG có file thì về phụ đề + nhịp
     chữ như cũ. Danh mục để trống — đổ file vào rồi khai ở G.HD_GIONG.
     Khoá: 'view:mucId' → { file, moc:[giây mở mỗi cảnh] }. */
  G.HD_GIONG = G.HD_GIONG || {};
  function giongBase() {
    var b = G.HD_GIONG_BASE || (G.API_GIONG) || 'gita-voice/';
    return b.charAt(b.length - 1) === '/' ? b : b + '/';
  }
  function giongCua(view, mucId) {
    var p = G.HD_GIONG[view + ':' + mucId];
    return (p && p.file) ? p : null;
  }
  var audio = null, mocHt = [];
  function dungGiong() {
    if (audio) { try { audio.pause(); audio.src = ''; } catch (e) {} audio = null; }
    mocHt = [];
  }
  /* Bật giọng cho mục hiện tại; trả true nếu khởi động được. */
  function batGiong(pack) {
    try {
      var a = new Audio(giongBase() + pack.file);
      a.muted = !amOn;
      audio = a; mocHt = pack.moc || []; var id = phien, mi = mucIdx, m = mucHienTai(), moc = mocHt;
      a.addEventListener('timeupdate', function () {
        if (id !== phien || mi !== mucIdx || !m) return;
        var t = a.currentTime, k = 0;
        for (var j = 0; j < moc.length; j++) if (t >= moc[j]) k = j;
        if (k !== idx && k < m.canh.length) { idx = k; ve(); }
      });
      a.addEventListener('ended', function () {
        if (id === phien && mi === mucIdx && m) { idx = m.canh.length - 1; chay = false; ve(); }
      });
      var pr = a.play();
      if (pr && pr.catch) pr.catch(function () { dungGiong(); if (id === phien) { chuong(false); dat(); } });
      return true;
    } catch (e) { return false; }
  }
  /* Phát mục hiện tại: có giọng thu sẵn thì theo giọng, không thì phụ đề+nhịp. */
  function phatMuc() {
    thoiHen(); dungGiong();
    var m = mucHienTai(); if (!m) return;
    var pack = giongCua(kb.view, m.id);
    if (pack && batGiong(pack)) return;   /* đường giọng thu sẵn */
    chuong(false); dat();                 /* đường phụ đề + nhịp chữ */
  }

  G.hdMo = function (view, mucId) {
    view = view || (G.S && G.S.view);
    if (den) dongDen(false);          /* hai lớp hướng dẫn cùng lúc thì phím ←/→ không biết nghe ai */
    kb = G.hdChoMan(view); idx = 0; che = 'thuong'; phien++;
    dungGiong();
    mucIdx = -1;
    if (mucId) {                                     /* mở thẳng một mục */
      for (var i = 0; i < kb.muc.length; i++) if (kb.muc[i].id === mucId) { mucIdx = i; break; }
    }
    chay = mucIdx >= 0;
    if (typeof document === 'undefined') return;
    var el = document.getElementById('hdp');
    if (!el) {
      el = document.createElement('div'); el.id = 'hdp';
      el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', 'Video hướng dẫn');
      document.body.appendChild(el);
    }
    moKhoaAm();                 /* mở khoá âm NGAY trong cử chỉ bấm mở guide */
    ve();
    if (mucIdx < 0) chuong(true); else phatMuc();
  };
  function dong() {
    chay = false; thoiHen(); dungGiong(); phien++;
    var el = document.getElementById('hdp'); if (el) el.remove();
    document.body.classList.remove('hdp-khoa');
  }
  G.hdDong = dong;
  /* Về mục lục (bìa) — để chọn mục khác. */
  function veMucLuc() { thoiHen(); dungGiong(); mucIdx = -1; idx = 0; chay = false; ve(); }
  /* Mở một mục theo số thứ tự. */
  function moMuc(i) { if (!kb || !kb.muc[i]) return; mucIdx = i; idx = 0; chay = true; ve(); phatMuc(); }

  function dat() {
    thoiHen();
    var m = mucHienTai(); if (!chay || !m) return;
    if (idx >= m.canh.length - 1) return;            /* cảnh cuối: dừng, chờ người */
    var id = phien;
    hen = setTimeout(function () {
      if (id !== phien || !chay) return;
      if (idx < m.canh.length - 1) { idx++; ve(); chuong(false); dat(); }
    }, dungLuong(m.canh[idx]));
  }

  /* Sơ đồ quy trình — nối các nhiệm vụ thành chuỗi có mũi nối. */
  function soDo(buoc) {
    return '<div class="hdp-so">' + buoc.map(function (b, i) {
      return '<div class="hdp-so-o"><span class="hdp-so-n">' + (i + 1) + '</span>' +
        '<p>' + h(b) + '</p></div>' +
        (i < buoc.length - 1 ? '<div class="hdp-so-noi">' + ic('arrow') + '</div>' : '');
    }).join('') + '</div>';
  }
  function goi(nhan, chu, lop) {
    return '<div class="hdp-goi ' + lop + '"><span class="hdp-goi-nhan">' + h(nhan) +
      '</span><p>' + h(chu) + '</p></div>';
  }
  /* Hội thoại nhập vai — kịch bản như hai người nói chuyện. ben:'a' trái,
     'b' phải. (Giọng nói là bản THU sẵn — C20; đây là lời thoại chữ.) */
  function veHoiThoai(ht) {
    return '<div class="hdp-ht">' + ht.map(function (d) {
      return '<div class="hdp-ht-o hdp-ht-' + (d.ben === 'b' ? 'b' : 'a') + '">' +
        '<span class="hdp-ht-ai">' + h(d.ai) + '</span>' +
        '<p>' + h(d.loi) + '</p></div>';
    }).join('') + '</div>';
  }
  var BUT = '<svg class="hdp-but" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">' +
    '<path d="M3 21l3-1 11-11-2-2L4 18l-1 3z" fill="var(--gita)"/>' +
    '<path d="M15 5l2-2a1.4 1.4 0 012 2l-2 2-2-2z" fill="var(--gita-sau)"/></svg>';

  /* Thanh đầu — logo GITA + vai + nút âm/phóng to/thu nhỏ/đóng. */
  function veDau() {
    return '<div class="hdp-dau">' +
      '<span class="hdp-logo">' + (G.dauGita ? G.dauGita() : ic('spark')) + '</span>' +
      '<span class="hdp-vai"><b>' + h(kb.vai.ten) + '</b>' +
        '<span>hướng dẫn: ' + h(kb.tua) + '</span></span>' +
      '<button class="hdp-nho-nut" data-hd="am" aria-label="Bật tắt âm" title="Âm thanh">' +
        (amOn ? '♪' : '♪̸') + '</button>' +
      '<button class="hdp-nho-nut" data-hd="to" aria-label="Phóng to" title="Phóng to">' + ic('orbit') + '</button>' +
      '<button class="hdp-nho-nut" data-hd="nho" aria-label="Thu nhỏ về khung cố định" title="Thu nhỏ">' + ic('zoom') + '</button>' +
      '<button class="hdp-x" data-hd="dong" aria-label="Đóng">' + ic('x') + '</button>' +
    '</div>';
  }
  /* Dòng chân: khách không cần nghe mã luật nội bộ (C20) — họ chỉ cần biết
     xem ngay được, không phải tải gì. */
  function chan() {
    return '<p class="hdp-chan">' + (kb && kb.khach
      ? 'Hướng dẫn chạy ngay trong ứng dụng — không cần tải gì về máy.'
      : 'Hướng dẫn chạy trong ứng dụng · bản phim tải về đang chuẩn bị (cần lời đọc thu sẵn — luật C20).') + '</p>';
  }
  /* Lối vào chế độ từng bước từ trong trình chiếu. */
  function nutDen() {
    return '<button class="hdp-nut pri" data-hd="den">' + ic('target') +
      '<span>' + h(nhanBuoc(kb && kb.khach) + ' trên màn thật') + '</span></button>';
  }

  function ve() {
    var el = document.getElementById('hdp');
    if (!el || !kb || !kb.muc || !kb.muc.length) return;
    /* Hàng rào: mục/cảnh khuyết thì lùi về mục lục, KHÔNG để vỡ video. */
    if (mucIdx >= kb.muc.length) mucIdx = -1;
    if (mucIdx >= 0) {
      var mm = kb.muc[mucIdx];
      if (!mm || !mm.canh || !mm.canh.length) { mucIdx = -1; }
      else if (idx >= mm.canh.length) idx = mm.canh.length - 1;
      else if (idx < 0) idx = 0;
    }
    el.className = che === 'to' ? 'hdp-to' : (che === 'nho' ? 'hdp-nho' : '');

    /* ── MỤC LỤC (bìa): chào mừng theo tên+vai + danh sách mục ── */
    if (mucIdx < 0) {
      var ds = kb.muc.map(function (m, i) {
        return '<button class="hdp-muc" data-hd="muc" data-i="' + i + '">' +
          '<span class="hdp-muc-n">' + (i + 1) + '</span>' +
          '<span class="hdp-muc-t"><b>' + h(m.ten) + '</b>' +
            '<span>Xem video hướng dẫn · ' + m.canh.length + ' cảnh</span></span>' +
          ic('arrow') + '</button>';
      }).join('');
      el.innerHTML =
        (che === 'nho' ? '' : '<div class="hdp-nen" data-hd="dong"></div>') +
        '<div class="hdp-khung" style="--ac:var(--gita-sau)">' + veDau() +
          '<div class="hdp-canh hdp-bia">' +
            '<div class="hdp-chao">' + (G.dauGita ? G.dauGita() : '') +
              '<div class="hdp-chao-viet"><span class="hdp-viet-chu">' + h(kb.chao) + '</span>' + BUT + '</div></div>' +
            '<div style="display:flex;flex-direction:column;align-items:center;gap:10px;margin:0 0 14px">' +
              '<span class="chip on">' + ic('users', 'w-3 h-3') + h(kb.doiTuong) + '</span>' +
              nutDen() + '</div>' +
            '<div class="hdp-muc-tieu">' + ic('list') + ' Chọn một mục để xem hướng dẫn</div>' +
            '<div class="hdp-muc-ds">' + ds + '</div>' +
          '</div>' + chan() +
        '</div>';
      document.body.classList.toggle('hdp-khoa', che !== 'nho');
      return;
    }

    /* ── CHIẾU MỘT MỤC ── */
    var m = kb.muc[mucIdx], c = m.canh[idx], n = m.canh.length, cuoi = idx >= n - 1;
    var cham = m.canh.map(function (_, i) {
      return '<span class="hdp-cham' + (i === idx ? ' on' : (i < idx ? ' qua' : '')) + '"></span>';
    }).join('');
    var than = '<p class="hdp-loi">' + h(c.loi) + '</p>';
    if (c.hoiThoai && c.hoiThoai.length) than += veHoiThoai(c.hoiThoai);  /* nhập vai */
    if (c.buoc && c.buoc.length) than += soDo(c.buoc);            /* sơ đồ quy trình */
    if (c.giai) than += goi('Giải thích', c.giai, 'hdp-giai');
    if (c.vinhDanh) than += goi('Ghi nhận & vinh danh', c.vinhDanh, 'hdp-vinh');
    if (c.baiMau) than += goi('Bài làm mẫu — bậc thầy chỉ dẫn', c.baiMau, 'hdp-mau');
    if (c.cachHay && c.cachHay.length)
      than += '<div class="hdp-goi hdp-cach"><span class="hdp-goi-nhan">Vài cách hay để chọn — hoặc sáng tạo thêm</span>' +
        '<ol>' + c.cachHay.map(function (x) { return '<li>' + h(x) + '</li>'; }).join('') + '</ol>' +
        '<p class="hdp-cach-mo">Có ý hay hơn? Cứ làm theo cách của bạn — cái đích là kết quả xuất sắc, không phải một khuôn cứng.</p></div>';
    if (c.vd) than += goi('Ví dụ minh hoạ', c.vd, 'hdp-vd');
    if (c.kpi) than += goi('Hướng dẫn theo KPI', c.kpi, 'hdp-kpi');
    /* Mục "Cách dùng công cụ" là chỗ người xem muốn thấy tận tay nhất. */
    if (m.id === 'cong-cu') than += '<div class="hdp-dieu" style="justify-content:flex-start">' + nutDen() + '</div>';

    el.innerHTML =
      (che === 'nho' ? '' : '<div class="hdp-nen" data-hd="dong"></div>') +
      '<div class="hdp-khung" style="--ac:var(' + (c.mau || '--gita-sau') + ')">' + veDau() +
        '<div class="hdp-canh">' +
          '<div class="hdp-canh-so">' + h(m.ten) + ' · cảnh ' + (idx + 1) + '/' + n + '</div>' +
          '<div class="hdp-hinh"><span class="hdp-hinh-ic">' + ic(c.ic || 'spark') + '</span></div>' +
          '<div class="hdp-viet"><h3 class="hdp-td hdp-viet-chu">' + h(c.td) + '</h3>' + BUT + '</div>' +
          than +
        '</div>' +
        '<div class="hdp-cham-hang">' + cham + '</div>' +
        '<div class="hdp-dieu">' +
          '<button class="hdp-nut" data-hd="mucluc" aria-label="Về mục lục" title="Mục lục">' + ic('list') + '</button>' +
          '<button class="hdp-nut" data-hd="lui"' + (idx === 0 ? ' disabled' : '') + ' aria-label="Cảnh trước">' + ic('arrow') + '</button>' +
          '<button class="hdp-nut hdp-chay" data-hd="chay" aria-label="' + (chay ? 'Tạm dừng' : 'Chạy tiếp') + '">' +
            ic(chay ? 'pulse' : 'spark') + '<span>' + (chay ? 'Đang chạy' : 'Chạy tiếp') + '</span></button>' +
          (cuoi
            ? '<button class="hdp-nut pri" data-hd="xong" aria-label="Xong mục">' + ic('check') + '<span>Xong</span></button>'
            : '<button class="hdp-nut" data-hd="toi" aria-label="Cảnh sau">' + ic('arrow') + '</button>') +
        '</div>' + chan() +
      '</div>';
    document.body.classList.toggle('hdp-khoa', che !== 'nho');
  }

  /* Tua giọng thu sẵn theo cảnh khi người bấm tới/lui (nếu đang có giọng). */
  function tuaGiong() { if (audio && mocHt[idx] != null) { try { audio.currentTime = mocHt[idx]; } catch (e) {} } }
  function toi() {
    var m = mucHienTai(); if (m && idx < m.canh.length - 1) {
      idx++; ve();
      if (audio) tuaGiong(); else { chuong(false); if (chay) dat(); }
    }
  }
  function lui() {
    if (mucIdx >= 0 && idx > 0) {
      idx--; ve();
      if (audio) tuaGiong(); else if (chay) dat();
    }
  }
  function chayTiep() {
    if (audio) {                       /* có giọng thu sẵn: dừng/tiếp chính audio */
      if (audio.paused) { audio.play(); chay = true; } else { audio.pause(); chay = false; }
      ve(); return;
    }
    chay = !chay; ve(); if (chay) dat(); else thoiHen();
  }
  function doChe(md) { che = (che === md) ? 'thuong' : md; ve(); }
  function doAm() {
    amOn = !amOn;
    try { localStorage.setItem('gita-hd-am', amOn ? '1' : '0'); } catch (e) {}
    if (audio) audio.muted = !amOn;
    ve(); if (amOn && !audio) chuong(false);
  }

  document.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('[data-hd]');
    if (!t) return;
    var a = t.getAttribute('data-hd');
    if (a === 'dong') dong();
    else if (a === 'xong' || a === 'mucluc') veMucLuc();
    else if (a === 'muc') moMuc(+t.getAttribute('data-i'));
    else if (a === 'toi') toi();
    else if (a === 'lui') lui();
    else if (a === 'chay') chayTiep();
    else if (a === 'to' || a === 'nho') doChe(a);
    else if (a === 'am') doAm();
    else if (a === 'den') { var v = kb && kb.view; dong(); G.hdDen(v, null); }
  });
  /* Nút mở trên thanh trên (app.js dựng, data-act="huong-dan"). */
  document.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('[data-act="huong-dan"]');
    if (t) { e.preventDefault(); G.hdMo(G.S && G.S.view); }
  });
  /* Nút "Xem video hướng dẫn" nhúng trong màn: data-hd-mo="view|mucId". */
  document.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('[data-hd-mo]');
    if (!t) return;
    e.preventDefault();
    var p = String(t.getAttribute('data-hd-mo')).split('|');
    G.hdMo(p[0] || (G.S && G.S.view), p[1] || '');
  });
  document.addEventListener('keydown', function (e) {
    if (!document.getElementById('hdp')) return;
    if (e.key === 'Escape') { e.preventDefault(); (mucIdx >= 0 ? veMucLuc() : dong()); }
    else if (e.key === 'ArrowRight') toi();
    else if (e.key === 'ArrowLeft') lui();
  });

  /* Snippet hai nút ở đầu màn: "Xem video hướng dẫn" và chế độ từng bước.
     Nút thứ hai từng là một liên kết tới trang Studio video riêng — trang ấy
     không có trong kho nên mọi người bấm vào đều gặp lỗi 404. Nay nó mở
     thẳng vòng sáng trên chính màn đang xem, không cần trang nào khác. */
  G.hdNut = function (view, mucId, nhan) {
    var khach = !!(G.LA_KHACH && G.LA_KHACH());
    return '<span class="hd-nut-hang" style="display:inline-flex;flex-wrap:wrap;gap:8px;align-items:center">' +
      '<button class="btn sm hd-nut" data-hd-mo="' + h((view || '') + '|' + (mucId || '')) + '">' +
      ic('compass', 'w-3 h-3') + h(nhan || 'Xem video hướng dẫn') + '</button>' +
      '<button class="btn sm hd-nut hd-buoc" data-hd-buoc="' + h(view || '') + '">' +
      ic('target', 'w-3 h-3') + h(nhanBuoc(khach)) + '</button></span>';
  };

  /* ══════════════ LÀM THEO TỪNG BƯỚC — VÒNG SÁNG TRÊN MÀN THẬT ══════════════
     Video kể bằng lời, nhưng người mới vẫn phải tự đi tìm cái ô, cái nút ấy
     nằm đâu. Chế độ này chỉ TẬN CHỖ: một vòng sáng đi qua từng ngăn, từng
     ô, từng nút trên chính màn đang mở, kèm một câu ngắn.

     Ba lớp tách nhau để đo được từng lớp:
       · G.hdQuetMan()      đọc DOM của #main → mô tả thuần + phần tử
       · G.hdBuocTuMoTa()   mô tả thuần → tối đa 8 câu. KHÔNG đụng DOM, nên
                            bộ thử chạy được trong Node (tools/thu-huong-dan.mjs)
       · trình chiếu        vòng sáng + bóng chữ · Trước/Tiếp/Đóng · ←/→/Esc
     Đọc từ DOM nên màn viết sau cũng tự có bước — không khai tay từng màn,
     cùng lý do kịch bản nền ở trên. Mọi chữ lấy từ màn đều đi qua h()
     trước khi vào innerHTML: nhãn là chữ của người dùng nhập cũng có. */

  var TOI_DA_BUOC = 8;
  /* Chữ cái Latin kể cả dấu tiếng Việt — mảnh chữ không có chữ cái nào
     (01 · 24/26 · 78) là số đếm trang trí, không phải tên. */
  var CHU_CAI = /[A-Za-zÀ-ɏḀ-ỿ]/;
  /* Cùng một nhãn xuất hiện hai lần thì giữ loại LÀM được: tiêu đề "Ghi
     chú" đứng ngay trên ô "Ghi chú" thì bước đáng chỉ là cái ô. */
  var UU_TIEN = { o: 5, ngan: 4, nut: 3, bang: 2, muc: 1 };
  /* Nhãn bù chung của G.a11yNhan ("Ô nhập", "Ô chọn") không nói ô ấy để
     làm gì — chỉ "Điền ô «nhập»" thì thà không chỉ. */
  var NHAN_CHUNG = { 'nhập': 1, 'chọn': 1 };
  var KHONG_BUOC = 'Màn này chưa có thao tác nào để chỉ — đọc phần giới thiệu ở trên';

  function lamSachNhan(s, kieu) {
    s = String(s == null ? '' : s).replace(/[«»]/g, '').replace(/\s+/g, ' ').trim();
    s = s.replace(/^(0\d|\d{1,2}[.)])\s+/, '');                         /* "01 Bản đồ" · "2) Việc" */
    s = s.replace(/\s+\d+\s*\/\s*\d+$/, '').replace(/\s*\(\d+\)$/, '');  /* bộ đếm "24/26" · "(3)" */
    s = s.replace(/^[\s·•›:–—-]+/, '').replace(/[\s·•›:：*–—-]+$/, '');  /* "Họ tên:" · "Email *" */
    if (kieu === 'o') s = s.replace(/^Ô\s+/, '');
    if (!s || NHAN_CHUNG[s.toLowerCase()]) return '';
    if (s.length > 48) s = s.slice(0, 47).replace(/\s+\S*$/, '') + '…';
    return s;
  }
  function cauBuoc(m) {
    var x = '«' + m.nhan + '»';
    if (m.kieu === 'ngan') return 'Chọn ngăn ' + x;
    if (m.kieu === 'o') return m.loai === 'chon' ? 'Chọn ' + x : (m.loai === 'tich' ? 'Đánh dấu ' + x : 'Điền ô ' + x);
    if (m.kieu === 'nut') return 'Bấm ' + x;
    if (m.kieu === 'bang') return 'Đọc bảng ' + x;
    return 'Xem phần ' + x;
  }
  function goiYBuoc(m) {
    if (m.kieu === 'ngan') return 'Bấm vào ngăn để mở phần ấy.';
    if (m.kieu === 'o') return m.loai === 'chon' ? 'Chạm vào ô để mở danh sách rồi chọn một dòng.'
      : (m.loai === 'tich' ? 'Chạm một lần để đánh dấu, chạm lần nữa để bỏ.' : 'Chạm vào ô rồi gõ nội dung.');
    if (m.kieu === 'nut') return m.bat ? 'Đây là nút chính của màn này.' : 'Bấm khi bạn đã sẵn sàng.';
    if (m.kieu === 'bang') return 'Mỗi dòng là một mục — đọc từ trên xuống.';
    return 'Đọc lướt phần này trước khi làm.';
  }

  /* Mô tả thuần → tối đa 8 bước [{i, kieu, cau, nhan, goi}].
       ds  — mảng theo THỨ TỰ TRÊN MÀN: {kieu:'ngan'|'o'|'nut'|'bang'|'muc',
             nhan, bat, loai}. `bat` là "nổi bật trong loại của nó": nút chính
             (.btn.pri) · ô bắt buộc · ngăn đang mở. `loai` của ô: 'chon' (ô
             chọn) · 'tich' (ô đánh dấu) · bỏ trống là ô gõ chữ.
       opt — {toiDa}: trần nhỏ hơn 8 nếu cần; không bao giờ vượt 8.
     i là chỉ số trong ds, để trình chiếu tìm lại đúng phần tử.
     Hàm KHÔNG thoát HTML — nhãn ra nguyên văn; thoát là việc của chỗ ghép
     HTML (G.hdDenHtml), để không thoát hai lần.

     Cách chọn — một bản pha hợp lý, không đổ cả màn ra:
       phần đầu tiên → tới 2 ngăn chưa mở → tới 3 ô (ô bắt buộc trước) →
       1 bảng; còn chỗ thì thêm ô · phần · bảng · ngăn · nút phụ; một chỗ
       luôn dành cho nút chính. Màn bận rộn vẫn đủ mặt các loại, không để
       một thanh tám ngăn chiếm hết tám bước. Ngăn ĐANG mở bị bỏ: "chọn" cái đang mở là
       một câu thừa. Ra theo thứ tự trên màn để vòng sáng đi một chiều từ
       trên xuống — trừ nút chính nằm TRƯỚC các ô thì đứng sau ô cuối, vì
       điền xong mới bấm. */
  G.hdBuocTuMoTa = function (ds, opt) {
    opt = opt || {};
    var toiDa = TOI_DA_BUOC;
    if (opt.toiDa > 0) toiDa = Math.min(TOI_DA_BUOC, Math.floor(opt.toiDa));
    if (!ds || typeof ds.length !== 'number') return [];
    var sach = [], theoNhan = {}, i;
    for (i = 0; i < ds.length; i++) {
      var d = ds[i];
      if (!d || !UU_TIEN[d.kieu]) continue;
      var nhan = lamSachNhan(d.nhan, d.kieu);
      if (!nhan) continue;
      var m = { i: i, kieu: d.kieu, nhan: nhan, bat: !!d.bat,
                loai: (d.loai === 'chon' || d.loai === 'tich') ? d.loai : '' };
      var khoa = nhan.toLowerCase().replace(/…$/, '');
      var cu = theoNhan[khoa];
      if (cu) {
        if (UU_TIEN[m.kieu] > UU_TIEN[cu.kieu] || (m.kieu === cu.kieu && m.bat && !cu.bat)) {
          sach[sach.indexOf(cu)] = m; theoNhan[khoa] = m;
        }
        continue;
      }
      theoNhan[khoa] = m; sach.push(m);
    }
    sach.sort(function (a, b) { return a.i - b.i; });
    var nhom = { muc: [], ngan: [], o: [], bang: [], nut: [] };
    sach.forEach(function (x) { nhom[x.kieu].push(x); });
    var ngan = nhom.ngan.filter(function (x) { return !x.bat; });
    var o = nhom.o.filter(function (x) { return x.bat; }).concat(nhom.o.filter(function (x) { return !x.bat; }));
    var nutChinh = nhom.nut.filter(function (x) { return x.bat; })[0] || null;
    var nutKhac = nhom.nut.filter(function (x) { return x !== nutChinh; });
    var nutCuoi = nutChinh || nutKhac.shift() || null;
    var tran = toiDa - (nutCuoi ? 1 : 0);
    var chon = [];
    function lay(arr, n) {
      for (var k = 0; k < arr.length && n > 0 && chon.length < tran; k++) {
        if (chon.indexOf(arr[k]) < 0) { chon.push(arr[k]); n--; }
      }
    }
    lay(nhom.muc, 1); lay(ngan, 2); lay(o, 3); lay(nhom.bang, 1);
    lay(o, TOI_DA_BUOC); lay(nhom.muc, TOI_DA_BUOC); lay(nhom.bang, TOI_DA_BUOC);
    lay(ngan, 2); lay(nutKhac, 2); lay(ngan, TOI_DA_BUOC);
    chon.sort(function (a, b) { return a.i - b.i; });
    if (nutCuoi && chon.length < toiDa) {
      var oDau = -1, oCuoi = -1, vt = 0;
      for (i = 0; i < chon.length; i++) if (chon[i].kieu === 'o') { if (oDau < 0) oDau = i; oCuoi = i; }
      if (oDau >= 0 && nutCuoi.i < chon[oDau].i) vt = oCuoi + 1;
      else while (vt < chon.length && chon[vt].i < nutCuoi.i) vt++;
      chon.splice(vt, 0, nutCuoi);
    }
    return chon.slice(0, toiDa).map(function (x) {
      return { i: x.i, kieu: x.kieu, cau: cauBuoc(x), nhan: x.nhan, goi: goiYBuoc(x) };
    });
  };

  /* Phần chữ của bóng chữ — tách ra để bộ thử soi được việc thoát HTML. */
  G.hdDenHtml = function (buoc, k) {
    var n = (buoc && buoc.length) || 0;
    if (!n) return '<p class="hd-den-cau">' + h(KHONG_BUOC) + '</p>';
    k = Math.max(0, Math.min(n - 1, k | 0));
    var b = buoc[k] || {};
    return '<p class="hd-den-cau"><b class="hd-den-so">Bước ' + (k + 1) + '/' + n + '</b> · ' + h(b.cau) + '</p>' +
      (b.goi ? '<p class="hd-den-phu">' + h(b.goi) + '</p>' : '');
  };

  /* ── Quét màn thật ── */
  /* Thanh dùng chung ở đầu MỌI màn (nhắc việc · hai nút hướng dẫn · khung
     V50) không phải thao tác của màn này; đưa vào thì màn nào cũng mở đầu
     bằng "Bấm «Mở vòng nhắc»". */
  var BO_QUA = '#hdp,.hd-thanh,.nhac-thanh,.v50-phan,.v50-thanh,.v50-gop,.hd-den-lo,.hd-den-boc,[hidden],[aria-hidden="true"]';
  var CHON_QUET = 'h1,h2,h3,h4,.up,.sec-t,[role=tab],[class*="tab"],[class*="seg"],' +
    'input,select,textarea,button,a.btn,[role=button],table,[role=table]';
  /* Mỗi loại tối đa 30 ứng viên — đủ để chọn 8 bước, không đo hàng nghìn
     nút của một bảng dài. */
  var TRAN_QUET = 30;

  function coLop(el, c) { return !!(el.classList && el.classList.contains(c)); }
  function laNgan(el) {
    if (el.getAttribute('role') === 'tab') return true;
    var cs = String(el.getAttribute('class') || '').split(/\s+/);
    for (var i = 0; i < cs.length; i++) if (/(^|-)(tab|seg)$/.test(cs[i])) return true;
    return false;
  }
  function loaiCua(el) {
    var tg = String(el.tagName || '').toUpperCase();
    if (tg === 'TABLE' || el.getAttribute('role') === 'table') return 'bang';
    if (tg === 'SELECT' || tg === 'TEXTAREA') return 'o';
    if (tg === 'INPUT') {
      var ty = String(el.type || 'text').toLowerCase();
      if (ty === 'hidden') return '';
      return (ty === 'submit' || ty === 'button' || ty === 'reset' || ty === 'image') ? 'nut' : 'o';
    }
    if (laNgan(el)) return 'ngan';
    if (/^H[1-4]$/.test(tg) || coLop(el, 'up') || coLop(el, 'sec-t')) return 'muc';
    if (tg === 'BUTTON' || tg === 'A' || el.getAttribute('role') === 'button') return 'nut';
    return '';
  }
  function hien(el) {
    if (!el || !el.getClientRects || !el.getClientRects().length) return false;
    var r = el.getBoundingClientRect();
    if (r.width < 4 || r.height < 4) return false;
    var cs = window.getComputedStyle ? window.getComputedStyle(el) : null;
    return !(cs && (cs.visibility === 'hidden' || cs.display === 'none' || parseFloat(cs.opacity) === 0));
  }
  /* Chữ của một phần tử, tách theo từng thẻ con rồi bỏ mảnh không có chữ
     cái: ngăn "01 · BẢN ĐỒ · 24/26" đọc ra "BẢN ĐỒ". Bỏ biểu tượng SVG và
     chữ của ô nhập (ô chọn mà đọc cả danh sách thì nhãn dài một trang). */
  function chuCua(el) {
    var manh = [], dang = '';
    function xa() { if (dang) { manh.push(dang); dang = ''; } }
    function di(n) {
      if (n.nodeType === 3) { dang += n.nodeValue; return; }
      if (n.nodeType !== 1) return;
      var tg = String(n.tagName || '').toUpperCase();
      if (tg === 'SVG' || tg === 'SCRIPT' || tg === 'STYLE' || tg === 'SELECT' || tg === 'OPTION' ||
          tg === 'TEXTAREA' || tg === 'INPUT' || tg === 'TEMPLATE') return;
      if (n !== el && n.getAttribute && n.getAttribute('aria-hidden') === 'true') return;
      if (n !== el) xa();
      for (var c = n.firstChild; c; c = c.nextSibling) di(c);
      if (n !== el) xa();
    }
    di(el); xa();
    var giu = [];
    for (var i = 0; i < manh.length; i++) {
      var s = manh[i].replace(/\s+/g, ' ').trim();
      if (s && CHU_CAI.test(s)) giu.push(s);
    }
    return giu.join(' ');
  }
  /* Nhãn của ô nhập: nhãn bọc · nhãn for · aria-labelledby · aria-label ·
     chữ gợi ý · title. Trả null nếu ô là nút radio ẩn của một NGĂN — ngăn
     ấy đã được tính một lần ở loại 'ngan'. */
  function nhanO(el) {
    var t = '', i, lb = null, ls = el.labels;
    if (ls && ls.length) lb = ls[0];
    if (!lb && el.closest) lb = el.closest('label');
    if (!lb && el.id) {
      var tim = document.querySelectorAll('label[for]');
      for (i = 0; i < tim.length; i++) if (tim[i].getAttribute('for') === el.id) { lb = tim[i]; break; }
    }
    if (lb) {
      if (lb.getAttribute('role') === 'tab') return null;
      t = chuCua(lb);
    }
    if (!t && el.getAttribute('aria-labelledby')) {
      var ids = el.getAttribute('aria-labelledby').split(/\s+/), p = [];
      for (i = 0; i < ids.length; i++) { var x = document.getElementById(ids[i]); if (x) p.push(chuCua(x)); }
      t = p.join(' ');
    }
    if (!t) t = el.getAttribute('aria-label') || el.getAttribute('placeholder') || el.getAttribute('title') || '';
    if (!t && el.tagName === 'SELECT' && el.options && el.options.length && el.options[0].value === '') t = el.options[0].text;
    return t;
  }
  function moTaCua(el, kieu) {
    var nhan = '', bat = false, loai = '';
    if (kieu === 'muc') {
      if (el.closest && el.closest('button,a,label,[role=tab],[role=button]')) return null;
      nhan = chuCua(el);
    } else if (kieu === 'ngan') {
      if (el.disabled) return null;
      nhan = chuCua(el) || el.getAttribute('aria-label') || '';
      var r = (el.tagName === 'LABEL' && el.htmlFor) ? document.getElementById(el.htmlFor) : null;
      bat = coLop(el, 'on') || coLop(el, 'active') || el.getAttribute('aria-selected') === 'true' ||
        el.getAttribute('aria-current') === 'page' || !!(r && r.checked);
    } else if (kieu === 'o') {
      if (el.disabled || el.readOnly) return null;
      var n = nhanO(el); if (n === null) return null;
      nhan = n;
      bat = !!el.required || el.getAttribute('aria-required') === 'true';
      var ty = String(el.type || '').toLowerCase();
      loai = el.tagName === 'SELECT' ? 'chon' : ((ty === 'checkbox' || ty === 'radio') ? 'tich' : '');
    } else if (kieu === 'nut') {
      /* Nút trong ô bảng là việc của MỘT dòng; nút trong thanh ngăn đã tính
         là ngăn; nút đăng xuất thì không ai cần được dắt tới. */
      if (el.disabled || (el.closest && el.closest('td,th,[role=tablist],.tabs'))) return null;
      if (el.getAttribute('data-act') === 'logout') return null;
      bat = coLop(el, 'pri');
      nhan = el.tagName === 'INPUT' ? (el.value || '') : chuCua(el);
      if (!nhan && bat) nhan = el.getAttribute('aria-label') || el.getAttribute('title') || '';
    } else if (kieu === 'bang') {
      var cap = el.caption ? chuCua(el.caption) : '';
      var th = el.querySelector ? el.querySelector('th,[role=columnheader]') : null;
      nhan = cap || el.getAttribute('aria-label') || (th ? chuCua(th) : '');
    }
    if (!nhan) return null;
    var mt = { kieu: kieu, nhan: nhan, bat: bat };
    if (loai) mt.loai = loai;
    return mt;
  }
  /* Vòng sáng ôm chỗ người ta NHÌN: bảng thì cả khung cuộn, ô đánh dấu thì
     cả nhãn của nó, tiêu đề mục (U.sec) thì cả hàng. */
  function diemSang(el, kieu) {
    if (kieu === 'bang') return (el.closest && el.closest('.tbl-wrap')) || el;
    if (kieu === 'o' && (el.type === 'checkbox' || el.type === 'radio')) return (el.closest && el.closest('label')) || el;
    if (kieu === 'muc' && coLop(el, 'up')) {
      var hang = el.parentNode && el.parentNode.parentNode;
      if (hang && coLop(hang, 'row') && coLop(hang, 'mt2')) return hang;
    }
    return el;
  }
  /* Tiêu đề màn là phần giới thiệu, không phải một bước. */
  function timTieuDe(goc) {
    var hs = goc.querySelectorAll('h1,h2');
    for (var i = 0; i < hs.length; i++) if (!(hs[i].closest && hs[i].closest(BO_QUA))) return hs[i];
    return null;
  }
  G.hdQuetMan = function () {
    var kq = { ds: [], el: [] };
    if (typeof document === 'undefined' || !document.getElementById) return kq;
    var main = document.getElementById('main');
    if (!main || !main.querySelectorAll) return kq;
    var goc = main.querySelector('.view') || main;
    var tieuDe = timTieuDe(goc), ung = goc.querySelectorAll(CHON_QUET), dem = {};
    for (var k = 0; k < ung.length; k++) {
      var el = ung[k];
      if (el === tieuDe || (el.closest && el.closest(BO_QUA))) continue;
      var kieu = loaiCua(el);
      if (!kieu || (dem[kieu] || 0) >= TRAN_QUET || !hien(el)) continue;
      var mt = moTaCua(el, kieu);
      if (!mt) continue;
      dem[kieu] = (dem[kieu] || 0) + 1;
      kq.ds.push(mt); kq.el.push(diemSang(el, kieu));
    }
    return kq;
  };

  /* ── Trình chiếu vòng sáng ── */
  var den = null;

  /* CSS nạp MỘT lần bằng JS, tên lớp mang tiền tố hd-den-. Màu lấy biến có
     sẵn; nền bóng chữ chồng --surface lên --bg-1 vì ở nền tối --surface
     trong suốt — đặt một mình thì chữ nằm trên lớp tối, không đọc được. */
  function napCssDen() {
    if (document.getElementById('hd-den-css')) return;
    var st = document.createElement('style');
    st.id = 'hd-den-css';
    st.textContent =
      '.hd-den-lo{position:fixed;z-index:190;pointer-events:none;border-radius:10px;' +
        'box-shadow:0 0 0 3px var(--gita),0 0 0 9999px rgba(0,0,0,.55)}' +
      '.hd-den-boc{position:fixed;z-index:195;box-sizing:border-box;width:380px;max-width:calc(100vw - 24px);' +
        'padding:14px 16px;border:1px solid var(--line);border-radius:14px;color:var(--ink);' +
        'background:var(--bg-1);background-image:linear-gradient(var(--surface),var(--surface));box-shadow:var(--noi-2)}' +
      '.hd-den-cau{margin:0;font-size:16px;line-height:1.5;font-weight:700;color:var(--ink)}' +
      '.hd-den-so{color:var(--gita-ink);font-weight:800}' +
      '.hd-den-phu{margin:6px 0 0;font-size:14.5px;line-height:1.55;color:var(--ink-3)}' +
      '.hd-den-hang{display:flex;flex-wrap:wrap;gap:8px;justify-content:flex-end;margin-top:12px}' +
      '.hd-den-nut{min-height:36px;padding:0 14px;border-radius:99px;border:1px solid var(--line);' +
        'background:var(--bg-1);color:var(--ink);font:inherit;font-size:14.5px;font-weight:600;cursor:pointer}' +
      '.hd-den-nut.pri{background:var(--gita-sau);border-color:var(--gita-sau);color:#fff}' +
      '.hd-den-nut:disabled{opacity:.45;cursor:default}' +
      '.hd-den-nut[hidden]{display:none}' +
      '.hd-den-nut:focus-visible{outline:3px solid var(--gita);outline-offset:2px}';
    (document.head || document.body).appendChild(st);
  }
  function giamChuyenDong() {
    try { return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches); }
    catch (e) { return false; }
  }
  function phanTuBuoc() {
    if (!den || !den.buoc.length) return null;
    return den.q.el[den.buoc[den.k].i] || null;
  }
  /* Thẻ gốc có thể đang mang `zoom` (núm CỠ ở thu-phong.js). Toạ độ đo được
     là toạ độ nhìn thấy, còn top/left gán vào lại bị nhân thêm zoom một
     lần nữa — nên tự đo tỉ lệ trên chính bóng chữ rồi chia ra. */
  function tiLe() {
    var w = den.boc.offsetWidth, r = den.boc.getBoundingClientRect();
    var s = w ? r.width / w : 1;
    return (s > 0.2 && s < 5) ? s : 1;
  }
  /* Đặt vòng sáng theo vị trí HIỆN TẠI của phần tử; trả về khung đo được.
     Chỉ ghi lại style khi khung thật sự đổi, để vòng theo dõi mỗi khung
     hình không bắt trình duyệt vẽ lại vô ích. */
  function datLo() {
    var el = phanTuBuoc(), lo = den.lo, s = den.s || 1, dem = 6, r = null;
    if (el && document.body.contains(el)) {
      r = el.getBoundingClientRect();
      if (!r.width && !r.height) r = null;
    }
    if (!r) { den.loKhoa = ''; if (lo.style.display !== 'none') lo.style.display = 'none'; return null; }
    var khoa = Math.round(r.left) + ',' + Math.round(r.top) + ',' + Math.round(r.width) + ',' + Math.round(r.height) + ',' + s;
    if (khoa !== den.loKhoa) {
      den.loKhoa = khoa;
      lo.style.display = '';
      lo.style.top = ((r.top - dem) / s) + 'px'; lo.style.left = ((r.left - dem) / s) + 'px';
      lo.style.width = ((r.width + 2 * dem) / s) + 'px'; lo.style.height = ((r.height + 2 * dem) / s) + 'px';
    }
    return r;
  }
  /* Phần tử có thể tự chạy (mười bánh đà quay quanh Ngôi nhà, khung xổ ra
     từ từ): đặt vòng một lần thì vài giây sau nó chỉ vào khoảng trống. Nên
     vòng sáng bám theo mỗi khung hình — còn bóng chữ thì ĐỨNG YÊN, vì một
     bóng chữ trôi theo nút đang quay thì không đọc được, bấm không trúng. */
  function vongTheo() {
    var raf = window.requestAnimationFrame;
    if (!den || !raf) return;
    var d = den;
    d.vong = raf(function theo() {
      if (den !== d) return;
      var r = datLo(), b = d.bocKhung;
      /* Phần tử TỰ chạy vào dưới bóng chữ thì dời bóng chữ sang nửa màn bên
         kia — và chỉ dời lại khi phần tử sang hẳn nửa ấy, để bóng chữ không
         nhảy theo từng khung hình. Lúc trang đang cuộn thì phần tử nào cũng
         "chạy" — chuyện ấy để lượt đặt lại theo sự kiện cuộn lo. */
      if (r && b && new Date().getTime() - d.cuonLuc > 250 &&
          r.left - 6 < b.right && r.right + 6 > b.left && r.top - 6 < b.bottom && r.bottom + 6 > b.top) {
        var vh = window.innerHeight || document.documentElement.clientHeight;
        var nua = (r.top + r.bottom) / 2 < vh / 2 ? 'duoi' : 'tren';
        if (!d.neoXa || d.nuaBoc !== nua) { d.neoXa = true; datViTri(); }
      }
      d.vong = raf(theo);
    });
  }
  function datViTri() {
    if (!den) return;
    var vw = window.innerWidth || document.documentElement.clientWidth;
    var vh = window.innerHeight || document.documentElement.clientHeight;
    den.s = tiLe();
    var s = den.s, boc = den.boc, r = datLo(), le = 12;
    /* Không có phần tử để chỉ thì neo bóng chữ dưới hai nút hướng dẫn —
       đúng chỗ "phần giới thiệu ở trên" mà câu báo nhắc tới. */
    var neo = r;
    if (!neo && !den.buoc.length) {
      var t = document.querySelector('#main .hd-thanh');
      if (t && hien(t)) neo = t.getBoundingClientRect();
    }
    var bb = boc.getBoundingClientRect(), bw = bb.width, bh = bb.height, top, left;
    if (neo && den.neoXa) {
      var duoi = (neo.top + neo.bottom) / 2 < vh / 2;
      den.nuaBoc = duoi ? 'duoi' : 'tren';
      top = duoi ? vh - bh - le : le;
      left = (vw - bw) / 2;
    } else if (neo) {
      if (neo.bottom + le + bh <= vh - le) top = neo.bottom + le;
      else if (neo.top - le - bh >= le) top = neo.top - le - bh;
      else top = vh - bh - le;
      left = Math.min(Math.max(neo.left, le), vw - bw - le);
    } else {
      top = vh - bh - le; left = (vw - bw) / 2;
    }
    top = Math.max(le, top); left = Math.max(le, left);
    boc.style.top = (top / s) + 'px';
    boc.style.left = (left / s) + 'px';
    den.bocKhung = { top: top, left: left, right: left + bw, bottom: top + bh };
  }
  function henViTri() {
    if (!den) return;
    den.cuonLuc = new Date().getTime(); den.neoXa = false;   /* cuộn xong: bóng chữ về đứng cạnh phần tử */
    if (den.khung) return;
    var raf = window.requestAnimationFrame || function (f) { return setTimeout(f, 16); };
    var d = den;
    d.khung = raf(function () { d.khung = 0; if (den === d) datViTri(); });
  }
  function veDen() {
    var n = den.buoc.length, cuoi = den.k >= n - 1;
    den.noi.innerHTML = G.hdDenHtml(den.buoc, den.k);
    den.nLui.hidden = !n; den.nToi.hidden = !n;
    den.nLui.disabled = den.k === 0;
    den.nToi.textContent = cuoi ? 'Xong' : 'Tiếp';
    den.nDong.className = 'hd-den-nut' + (n ? '' : ' pri');
  }
  /* Tới bước k: vẽ chữ, cuộn phần tử vào giữa màn, đặt vòng sáng. */
  function denDen(k, layFocus) {
    if (!den) return;
    var n = den.buoc.length;
    den.k = n ? Math.max(0, Math.min(n - 1, k)) : 0;
    den.neoXa = false;               /* bước mới: bóng chữ lại đứng cạnh phần tử */
    veDen();
    var el = phanTuBuoc();
    if (el && el.scrollIntoView) {
      den.cuonLuc = new Date().getTime();
      try { el.scrollIntoView({ block: 'center', inline: 'nearest', behavior: giamChuyenDong() ? 'auto' : 'smooth' }); }
      catch (e) { el.scrollIntoView(); }
    }
    datViTri();
    if (layFocus) {
      var f = n ? den.nToi : den.nDong;
      try { f.focus({ preventScroll: true }); } catch (e2) { f.focus(); }
    }
  }
  /* Màn vẽ lại (bấm một ngăn, lọc một danh sách) thì phần tử cũ rời DOM:
     quét lại, giữ đúng câu đang chỉ nếu còn, không thì giữ số bước. Đổi
     sang màn khác thì vòng sáng của màn cũ không còn nghĩa gì — đóng. */
  function quetLai() {
    if (!den) return;
    if (G.S && den.view && G.S.view !== den.view) { dongDen(false); return; }
    var el = phanTuBuoc();
    if (el && document.body.contains(el)) { datViTri(); return; }
    var cauCu = den.buoc.length ? den.buoc[den.k].cau : '';
    den.q = G.hdQuetMan(); den.buoc = G.hdBuocTuMoTa(den.q.ds);
    var k = -1;
    for (var j = 0; j < den.buoc.length; j++) if (den.buoc[j].cau === cauCu) { k = j; break; }
    den.k = k >= 0 ? k : Math.min(den.k, Math.max(0, den.buoc.length - 1));
    veDen(); datViTri();
  }
  function henQuetLai() {
    if (!den) return;
    clearTimeout(den.hen);
    den.hen = setTimeout(quetLai, 150);
  }
  function dongDen(traFocus) {
    if (!den) return;
    var d = den; den = null;
    if (d.ob) { try { d.ob.disconnect(); } catch (e) {} }
    clearTimeout(d.hen);
    if (d.vong && window.cancelAnimationFrame) window.cancelAnimationFrame(d.vong);
    window.removeEventListener('scroll', henViTri, true);
    window.removeEventListener('resize', henViTri);
    if (d.lo.parentNode) d.lo.parentNode.removeChild(d.lo);
    if (d.boc.parentNode) d.boc.parentNode.removeChild(d.boc);
    if (!traFocus) return;
    /* Trả focus về nút đã mở. Mở từ bìa trình chiếu thì nút ấy đã đi cùng
       khung trình chiếu — lùi về nút từng bước ở đầu màn. */
    var t = d.mo;
    if (!t || !document.body.contains(t) || !hien(t))
      t = document.querySelector('#main [data-hd-buoc]') || document.querySelector('[data-act="huong-dan"]');
    if (t && t.focus) { try { t.focus(); } catch (e3) {} }
  }
  G.hdDenDong = function () { dongDen(true); };

  function batDauDen(view, nutMo) {
    if (den) dongDen(false);         /* hai lượt mở sát nhau (lối đổi màn có hẹn giờ) không được chồng hai vòng */
    napCssDen();
    var lo = document.createElement('div');
    lo.className = 'hd-den-lo'; lo.setAttribute('aria-hidden', 'true');
    var boc = document.createElement('div');
    boc.className = 'hd-den-boc';
    boc.setAttribute('role', 'dialog'); boc.setAttribute('aria-label', 'Làm theo từng bước');
    /* Vùng chữ GIỮ NGUYÊN qua các bước, chỉ thay nội dung — trình đọc màn
       hình chỉ đọc lại vùng sống khi chính vùng ấy còn đó. Ba nút cũng giữ
       nguyên nên focus không rơi mất khi đổi bước. */
    boc.innerHTML = '<div class="hd-den-noi" aria-live="polite" aria-atomic="true"></div>' +
      '<div class="hd-den-hang">' +
        '<button type="button" class="hd-den-nut" data-hd-den="lui">Trước</button>' +
        '<button type="button" class="hd-den-nut pri" data-hd-den="toi">Tiếp</button>' +
        '<button type="button" class="hd-den-nut" data-hd-den="dong">Đóng</button>' +
      '</div>';
    document.body.appendChild(lo); document.body.appendChild(boc);
    var q = G.hdQuetMan();
    den = { view: view, q: q, buoc: G.hdBuocTuMoTa(q.ds), k: 0,
      mo: nutMo || null, lo: lo, boc: boc, ob: null, hen: 0, khung: 0, vong: 0, s: 1, loKhoa: '',
      bocKhung: null, neoXa: false, nuaBoc: '', cuonLuc: 0,
      noi: boc.querySelector('.hd-den-noi'),
      nLui: boc.querySelector('[data-hd-den="lui"]'),
      nToi: boc.querySelector('[data-hd-den="toi"]'),
      nDong: boc.querySelector('[data-hd-den="dong"]') };
    window.addEventListener('scroll', henViTri, true);
    window.addEventListener('resize', henViTri);
    var main = document.getElementById('main');
    if (main && window.MutationObserver) {
      den.ob = new MutationObserver(henQuetLai);
      den.ob.observe(main, { childList: true, subtree: true });
    }
    denDen(0, true);
    vongTheo();
  }

  /* Mở chế độ từng bước cho một màn. nutMo: nút đã bấm, để trả focus. */
  G.hdDen = function (view, nutMo) {
    if (typeof document === 'undefined' || !document.body) return;
    view = view || (G.S && G.S.view);
    if (document.getElementById('hdp')) dong();
    if (den) dongDen(false);
    if (view && G.S && G.S.view !== view && typeof G.go === 'function') {
      G.go(view);
      setTimeout(function () { batDauDen(view, nutMo); }, 60);
      return;
    }
    batDauDen(view, nutMo);
  };
  G.hdDenTrangThai = function () {
    return den ? { k: den.k, n: den.buoc.length, cau: den.buoc.length ? den.buoc[den.k].cau : '' } : null;
  };

  document.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('[data-hd-buoc]');
    if (!t) return;
    e.preventDefault();
    G.hdDen(t.getAttribute('data-hd-buoc') || (G.S && G.S.view), t);
  });
  document.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('[data-hd-den]');
    if (!t || !den) return;
    var a = t.getAttribute('data-hd-den');
    if (a === 'dong') dongDen(true);
    else if (a === 'lui') denDen(den.k - 1, true);
    else if (a === 'toi') { if (den.k >= den.buoc.length - 1) dongDen(true); else denDen(den.k + 1, true); }
  });
  /* ←/→/Esc. Đang gõ trong một ô thì mũi tên là của con trỏ chữ — người
     ta đang làm đúng bước được chỉ, đừng giật bước đi. */
  document.addEventListener('keydown', function (e) {
    if (!den) return;
    if (e.key === 'Escape' || e.key === 'Esc') { e.preventDefault(); dongDen(true); return; }
    var t = e.target, tg = t && t.tagName;
    if (tg === 'INPUT' || tg === 'TEXTAREA' || tg === 'SELECT' || (t && t.isContentEditable)) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); if (den.k < den.buoc.length - 1) denDen(den.k + 1, true); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); if (den.k > 0) denDen(den.k - 1, true); }
  });
})();
