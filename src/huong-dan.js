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
        return { td: 'Dùng công cụ trên màn', loi: 'Mở màn từ cột menu bên trái (điện thoại: thanh dưới hoặc nút Menu). Máy tính thu gọn hai cột cho rộng, phóng to chữ bằng Ctrl +.',
          buoc: ['Chọn màn ở menu', 'Đọc phần chính ở giữa', 'Bí ở đâu, bấm nút trợ lý ở góc phải'] };
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
    var tua = (nav && nav.t) || 'Màn này';
    var mt = (nav && nav.h) || 'Màn này phục vụ một việc trong hệ GITA 365.';
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
    return { tua: tua, vai: vai, muc: muc, view: view, khach: khach,
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
  var CHAN = '<p class="hdp-chan">Hướng dẫn chạy trong ứng dụng · bản phim tải về đang chuẩn bị (cần lời đọc thu sẵn — luật C20).</p>';

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
            '<div class="hdp-muc-tieu">' + ic('list') + ' Chọn một mục để xem hướng dẫn</div>' +
            '<div class="hdp-muc-ds">' + ds + '</div>' +
          '</div>' + CHAN +
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
        '</div>' + CHAN +
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

  /* Snippet nút "Xem video hướng dẫn" để màn khác nhúng vào. */
  G.hdNut = function (view, mucId, nhan) {
    return '<button class="btn sm hd-nut" data-hd-mo="' + h((view || '') + '|' + (mucId || '')) + '">' +
      ic('compass', 'w-3 h-3') + h(nhan || 'Xem video hướng dẫn') + '</button>' +
      /* Lối mở Studio video bài bản (trang riêng, khung phát 16:9, chương,
         phụ đề, giọng, thu nhỏ/phóng to). Trang tĩnh anh em cạnh index.html
         nên mở bằng <a href>, không qua bộ định tuyến trong app. */
      '<a class="btn sm hd-studio" href="video-huong-dan.html" target="_blank" rel="noopener">' +
      ic('spark', 'w-3 h-3') + 'Studio video (bài bản)</a>';
  };
})();
