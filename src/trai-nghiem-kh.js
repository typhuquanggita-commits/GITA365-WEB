/* ═══════════════════════════════════════════════════════════════
   GITA 365 — HỆ TRẢI NGHIỆM KHÁCH HÀNG (GITA CX SYSTEM)  (9.99.168)

   Nguồn tư tưởng: "Dịch Vụ Thượng Hạng, Lợi Nhuận Bền Vững" (Exceptional
   Service, Exceptional Profit) — Leonardo Inghilleri & Micah Solomon.
   Chủ hệ đã tóm lược và diễn giải ứng dụng (12 bảng); phần này KHÔNG chép
   sách — nó CHUYỂN THỂ tư tưởng "dịch vụ là một HỆ THỐNG quản trị, không
   phải thái độ niềm nở" vào GITA365.

   ══ MÀN NÀY TRỎ, KHÔNG DỰNG BẢN THỨ HAI ══

   Điểm mạnh: phần lớn "cỗ máy dịch vụ" GITA ĐÃ CÓ, nằm rải ở nhiều màn.
   Việc của màn này là NỐI chúng thành một hệ đọc được một lượt, chỉ ra
   mỗi tầng của cỗ máy đang sống ở đâu — không chép nội dung các màn ấy
   sang. Cùng luật với Bản đồ điều hành: bản đồ, không phải nguồn.

   ══ RANH GIỚI ══
   Đây là công cụ QUẢN TRỊ trải nghiệm — gói NGHỀ, khoá pro_consult.
   Khách KHÔNG xem: khách sống trải nghiệm, không đọc cách hệ vận hành nó.
   Cùng ranh giới Cây tiền / Cây giá trị (9.99.162).
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;
G.VIEWS = G.VIEWS || {};

/* Luận điểm GITA: phụ huynh KHÔNG mua "khoá học" — họ mua HÀNH TRÌNH
   PHÁT TRIỂN CỦA CON. Nên "dịch vụ thượng hạng" ở GITA = hiểu đúng con +
   hiểu đúng phụ huynh + cá nhân hoá lộ trình + chủ động đồng hành + xử lý
   nhanh + đo tiến bộ THẬT + làm phụ huynh thấy "con mình được HIỂU". */
G.CX_THESIS = {
  cot: 'Phụ huynh không mua một khoá học — họ mua hành trình phát triển của con. ' +
       'Dịch vụ thượng hạng ở GITA không phải thái độ niềm nở, mà là một HỆ THỐNG: ' +
       'hiểu đúng · cá nhân hoá · chủ động · phục hồi nhanh · đo thật · để một gia đình ' +
       'đi trọn năm tầng và mở cửa cho gia đình khác.',
  congThuc: 'Tuyển đúng người → đào tạo đúng năng lực → trao quyền → hiểu khách → ' +
       'cá nhân hoá → xử lý sự cố xuất sắc → đo lường → cải tiến → tăng trung thành → ' +
       'tăng giá trị trọn đời → lợi nhuận bền.'
};

/* CỖ MÁY DỊCH VỤ 10 TẦNG (Bảng 11) — ánh vào ĐÚNG chỗ GITA đã dựng.
   Cột `tro` là view THẬT (kiểm ở mục 114). "coHay" nói phần ấy đã sống
   hay còn là khung. */
G.CX_MAY10 = [
  { t:'Chiến lược dịch vụ', hoi:'Ta muốn phụ huynh NHỚ điều gì?',
    tro:'tam-nhin', troTen:'Tầm nhìn', ra:'Lời hứa dịch vụ', coHay:true },
  { t:'Khách hàng', hoi:'Ta phục vụ những nhà nào?',
    tro:'hang-vip', troTen:'Phân hạng VIP', ra:'Chân dung & hạng nhà', coHay:true },
  { t:'Hành trình', hoi:'Nhà đi qua những đâu?',
    tro:'con-duong', troTen:'Con đường nhiệm vụ', ra:'Bản đồ điểm chạm 5 tầng', coHay:true },
  { t:'Tiêu chuẩn', hoi:'Thế nào là phục vụ ĐÚNG?',
    tro:'so-tay-van-hanh', troTen:'Sổ tay vận hành', ra:'SOP + 12 luật giao diện', coHay:true },
  { t:'Con người', hoi:'Ai trực tiếp tạo trải nghiệm?',
    tro:'con-nguoi', troTen:'Con người · Ba cửa', ra:'Ba cửa + sát hạch nghề', coHay:true },
  { t:'Năng lực', hoi:'Họ cần biết gì để phục vụ?',
    tro:'khoa-dao-tao', troTen:'Khoá đào tạo', ra:'Đào tạo theo năng lực', coHay:true },
  { t:'Trao quyền', hoi:'Họ được QUYẾT gì cho khách?',
    tro:'luat-giao-dien', troTen:'Luật giao diện', ra:'Ranh quyết định (L11·L12)', coHay:true },
  { t:'Dữ liệu', hoi:'Ta biết gì về nhà — và giữ an toàn thế nào?',
    tro:'hoso-vip', troTen:'Chuẩn hồ sơ VIP', ra:'Hồ sơ 7 phần · bảo mật Điều 13', coHay:true },
  { t:'Đo lường', hoi:'Dịch vụ có tốt lên không?',
    tro:'do-luong-kh', troTen:'Hệ đo lường khách', ra:'7 chỉ số · vòng phản hồi', coHay:true },
  { t:'Cải tiến', hoi:'Làm sao tốt hơn LIÊN TỤC?',
    tro:'tu-hoan-thien', troTen:'Vòng tự hoàn thiện', ra:'PDCA có cấp phép nhập kho', coHay:true }
];

/* CHUỖI WOW — điểm chạm vượt kỳ vọng theo 5 tầng cây giá trị. "10.000
   trải nghiệm" là CÁCH ĐẾM quy mô (5 tầng × 10 cấp × các khoảnh khắc chủ
   động), KHÔNG phải danh sách bịa sẵn — cùng luật SUP-01 (100.000 là cách
   đếm, không phải chỉ tiêu để chạy cho đủ số). Mỗi tầng nêu khoảnh khắc
   WOW CHỦ ĐỘNG thật, dựng trên đúng thứ tầng ấy giao. */
G.CX_WOW = [
  { tang:'T1', giai:'HẠT', khoanhKhac:'Buổi đọc hồ sơ ngày 7 gọi ĐÚNG một điều con làm được mà nhà chưa nhận ra — nhà thấy "con mình được nhìn thấy" ngay trước khi trả tiền tầng sau.', tro:'chan-dung-nha', troTen:'Chân dung nhà' },
  { tang:'T2', giai:'RỄ', khoanhKhac:'Nhịp đứt hai ngày là NHẮC TRƯỚC 8 giờ sáng, không chờ tới kỳ rà soát — nhà cảm nhận có người thật đang trông.', tro:'hom-nay', troTen:'Hôm nay' },
  { tang:'T3', giai:'THÂN', khoanhKhac:'Mỗi cổng nghiệm thu trả lại một trang bằng chứng TRƯỚC–SAU của một hành vi — tiến bộ ĐO ĐƯỢC, không phải lời khen.', tro:'tien-bo', troTen:'Tiến bộ' },
  { tang:'T4', giai:'TÁN', khoanhKhac:'Mỗi quý một việc "vượt kỳ vọng" ghi rõ ai làm — mở trước tài liệu tầng kế cho nhà sắp qua mốc, không đợi nhà xin.', tro:'dong-hanh', troTen:'Người đồng hành' },
  { tang:'T5', giai:'RỪNG', khoanhKhac:'Trao hồ sơ trưởng thành in ra có chữ ký; mời nhà thành Cây Mẹ gieo hạt cho nhà khác — quan hệ vượt mua bán.', tro:'vinh-danh', troTen:'Vinh danh' }
];

/* CHUỖI 15 CHẶNG — tên thật từ GITA_365_HANH_TRINH_TRAI_NGHIEM
   (GITA-CJM-1000WOW-V1.0). DÒNG hành trình khách đi từ lời mời tới lúc thành
   nhà kim cương soi cho nhà khác. */
G.CX_15CHANG = [
  '01 · Chạm lời mời', '02 · Đăng ký tài khoản 60 giây', '03 · Hồ sơ gia đình',
  '04 · Bài test đánh giá GITA 365', '05 · Xác định cấp độ khởi hành',
  '06 · Hành trình cá nhân hoá 5 tầng', '07 · Chuỗi nâng cấp 10 cấp/tầng',
  '08 · Khoảnh khắc vượt tầng', '09 · Ăn mừng và tái khởi hành',
  '10 · Bốn lớp học của hành trình', '11 · Đồng hành Coach · Tư vấn · AI',
  '12 · Gặt hái sáu trụ', '13 · Cả nhà cùng dịch chuyển',
  '14 · Gia đình thịnh vượng', '15 · Kim cương chiếu sáng nhà khác'
];

/* KHUNG 20 ĐIỂM CHẠM MỖI CẤP — 6 nhóm cố định W01–W20 (nguồn CJM-1000WOW).
   Khung KHÔNG đổi qua 50 cấp, chỉ nội dung đổi → đây là CÁCH ĐẾM 1000
   (50 cấp × 20 slot), không phải 1000 dòng bịa. Cùng luật SUP-01. */
G.CX_WOW20 = [
  {ma:'W01',ten:'Chạm mở màn',nhom:'A · Cửa vào',kenh:'App',do:'Tỷ lệ mở trong 12h đầu'},
  {ma:'W02',ten:'Gọi đúng tên, đúng dữ kiện',nhom:'A · Cửa vào',kenh:'App·AI',do:'Nhận diện đúng dữ kiện thật'},
  {ma:'W03',ten:'Nhắc mềm khi vắng',nhom:'A · Cửa vào',kenh:'App·AI',do:'Quay lại sau 1 lần vắng'},
  {ma:'W04',ten:'Nhiệm vụ 60 giây',nhom:'B · Hành động',kenh:'App',do:'Hoàn thành trong 60 giây'},
  {ma:'W05',ten:'Việc không thể thất bại',nhom:'B · Hành động',kenh:'App',do:'Hoàn thành ≥85%'},
  {ma:'W06',ten:'Một bậc vừa sức cộng một',nhom:'B · Hành động',kenh:'App·Coach',do:'Nhận bậc kế trong 7 ngày'},
  {ma:'W07',ten:'Nút "hôm nay khó"',nhom:'B · Hành động',kenh:'App',do:'Dùng nút mà vẫn ở lại'},
  {ma:'W08',ten:'Ghi nhận tức thì',nhom:'C · Ghi nhận',kenh:'App',do:'Độ trễ < 2 giây'},
  {ma:'W09',ten:'Dấu ấn vật lý của cấp',nhom:'C · Ghi nhận',kenh:'App',do:'Mở lại xem dấu ấn'},
  {ma:'W10',ten:'Câu hệ nói về mình',nhom:'C · Ghi nhận',kenh:'AI',do:'Lưu lại câu nói'},
  {ma:'W11',ten:'Bảng ký ức tuần',nhom:'C · Ghi nhận',kenh:'App',do:'Mở bảng ký ức cuối tuần'},
  {ma:'W12',ten:'Coach chạm tay',nhom:'D · Đồng hành',kenh:'Coach',do:'Phản hồi trong 48h'},
  {ma:'W13',ten:'Tư vấn đúng lúc',nhom:'D · Đồng hành',kenh:'Tư vấn',do:'Ca đóng đúng vấn đề'},
  {ma:'W14',ten:'Trợ lý AI 24/7',nhom:'D · Đồng hành',kenh:'AI',do:'Phiên kết bằng một hành động'},
  {ma:'W15',ten:'Khoảnh khắc gia đình',nhom:'E · Gia đình·Cộng đồng',kenh:'Gia đình',do:'Số khoảnh khắc gia đình/tháng'},
  {ma:'W16',ten:'Người cùng tầng',nhom:'E · Gia đình·Cộng đồng',kenh:'Cộng đồng',do:'Có ≥1 kết nối cùng tầng'},
  {ma:'W17',ten:'Lần đầu trao đi',nhom:'E · Gia đình·Cộng đồng',kenh:'Cộng đồng',do:'Có ≥1 lượt trao đi/tháng'},
  {ma:'W18',ten:'Ánh sáng phía trước',nhom:'F · Chuyển cấp',kenh:'App',do:'Mô tả được bậc kế'},
  {ma:'W19',ten:'Nghi thức nhỏ khép cấp',nhom:'F · Chuyển cấp',kenh:'App·Coach',do:'Hoàn thành nghi thức khép cấp'},
  {ma:'W20',ten:'Ăn mừng & mở cấp kế',nhom:'F · Chuyển cấp',kenh:'Coach·Gia đình',do:'Ăn mừng có mặt người nhà'}
];
G.CX_WOW_LUAT = [
  'Không tạo nghiện — cấm thưởng ngẫu nhiên, hook thương mại, thông báo dồn.',
  'Gắn dữ kiện thật — không bịa một khoảnh khắc nào.',
  'Xây trước, đo sau — đủ 20 wow của một cấp mới mở cấp ấy.'
];
/* Chủ hệ CHỐT (9.99.213): 10.000 điểm chạm trải nghiệm wow — mỗi tầng 2.000,
   mỗi cấp 200 (đều). Cách đếm: 200/cấp = 20 khung W01–W20 × 10 biến thể. Đây
   là SỨC CHỨA, không phải chỉ tiêu chạy cho đủ (luật SUP-01). */
G.CX_WOW_PHANBO = {
  tong: 10000, moiTang: 2000, moiCap: 200,
  cach: '5 tầng × 2.000 = 10.000  ·  50 cấp × 200 = 10.000  ·  200/cấp = 20 khung W01–W20 × 10 biến thể',
  theoTang: [{t:'T1 Hạt',n:2000},{t:'T2 Rễ',n:2000},{t:'T3 Thân',n:2000},{t:'T4 Tán',n:2000},{t:'T5 Rừng',n:2000}]
};

/* THƯ VIỆN TÌNH HUỐNG → GIẢI PHÁP (Bảng 6 phục hồi + các ca hay phát
   sinh). Đa dạng giải pháp; mỗi ca TRỎ hệ đã có, và khai ô KHÔNG-LÀM
   (ranh giới) — một giải pháp không có ranh giới thì nó thành nhân nhượng.
   Bước xử lý phải LÀM ĐƯỢC, không phải lời khuyên (luật TG_UNGPHO). */
G.CX_TINHHUONG = [
  { ca:'Phụ huynh không rành công nghệ, minh chứng gửi lên = 0',
    dau:'Minh chứng trống nhiều kỳ, không phải điểm thấp',
    lam:'Mở cẩm nang tự-làm dễ hơn + đường ghi minh chứng bằng ảnh/giọng; KHÔNG chốt 1-sao thành "khách sai"',
    khong:'Không đọc "minh chứng = 0" là thất bại của nhà — trống KHÁC số 0',
    tro:'tu-hoan-thien', troTen:'Vòng tự hoàn thiện' },
  { ca:'Phản hồi phụ huynh và con KHÔNG khớp, con hợp tác vỏ ngoài',
    dau:'Hai bảng khảo sát lệch nhau, tiến bộ đứng yên',
    lam:'Mở cẩm nang gỡ ca, đọc Thẻ Vùng Mạnh của con TRƯỚC khi trả lời; trình Coach cao nhất → Giám đốc',
    khong:'Không ép con "cố lên" — tìm nỗi sợ (T7 của thẻ), không dán nhãn',
    tro:'vung-manh', troTen:'Vùng Mạnh' },
  { ca:'Nhà sắp rơi — đứt nhịp 7 ngày',
    dau:'Nhịp M2 đứt 7 ngày, mở app thưa dần',
    lam:'Người đồng hành GỌI TRƯỚC khi nhà kịp gọi, có kịch bản theo chân dung; đèn đỏ là NGƯỜI gọi trong 24 giờ, không tin nhắn',
    khong:'Không để nhà là người mở lời đầu; không nhắc bài trong vùng tử thần',
    tro:'van-hanh-cham-soc', troTen:'Vận hành & chăm sóc' },
  { ca:'Khiếu nại / trải nghiệm chưa tốt',
    dau:'Phàn nàn, hài lòng dưới 4,0',
    lam:'Mười bước phục hồi: lắng nghe → xác nhận → đồng cảm → nhận trách nhiệm → xin lỗi → giải pháp → bù đắp → theo dõi → tìm gốc → cập nhật SOP',
    khong:'Không đổ lỗi, không xem khiếu nại là phiền — nó là dữ liệu chỉ chỗ hệ đang hỏng',
    tro:'ra-soat-kh', troTen:'Rà soát 12 mặt' },
  { ca:'Nhà đòi vượt tầng / ngoài gói mà chưa trả phí',
    dau:'Đòi nội dung tầng trên, doạ huỷ gói',
    lam:'Giữ ranh giới gói (không mở MIỄN PHÍ) NHƯNG nói thẳng đường nâng gói hợp lệ + làm cẩm nang tự-làm rõ hơn',
    khong:'Doạ huỷ KHÔNG mở quyền vượt tầng; cho không thì cả thang gói thành hình thức',
    tro:'bang-gia', troTen:'Bảng giá' },
  { ca:'Sự cố hệ: quá tải, gửi nhầm/sai/thiếu',
    dau:'Nghẽn, nội dung gửi sai nhà',
    lam:'NÓI THẬT và SỬA, không giấu; xin lỗi dịch vụ ngắn (máy KHÔNG soạn thư xin lỗi cá nhân — L10); một tờ ứng phó có ai-làm, trong-bao-lâu',
    khong:'Không giấu sự cố có thật — giấu là chỗ dễ thành hậu quả pháp lý',
    tro:'tu-hoan-thien', troTen:'Cẩm nang ứng phó' },
  { ca:'Nghi chia sẻ / lạm dụng tài khoản',
    dau:'Nhiều phiên, nhảy địa lý, dùng 24/7',
    lam:'Tổng hợp NHIỀU dấu hiệu (một cái không tự kết luận); MÁY báo động, NGƯỜI quyết; nhắc điều khoản + mở đường mua thêm chỗ',
    khong:'Không khoá tự động — bắt oan khách trả tiền đắt hơn bỏ sót',
    tro:'giam-sat', troTen:'Trần giám sát' }
];

/* 10 NỀN (Bảng 1) — chuyển thể một dòng, để đọc nhanh trước khi vào cỗ máy. */
G.CX_NEN = [
  'Dịch vụ là CHIẾN LƯỢC, không phải việc riêng của CSKH — mọi điểm chạm tạo hoặc phá giá trị.',
  'Đích cuối không phải HÀI LÒNG mà là TRUNG THÀNH — đo giữ chân, giới thiệu, quay lại.',
  'Nhà đánh giá TỔNG TRẢI NGHIỆM đầu-cuối, không đánh giá từng bộ phận.',
  'Dịch vụ = khoảng cách giữa KỲ VỌNG và THỰC TẾ — cam kết đúng khả năng.',
  'Nhà muốn được đối xử như một CÁ NHÂN — dữ liệu để HIỂU, không để làm phiền.',
  'Một trải nghiệm tốt không cứu được nhiều trải nghiệm kém — chuẩn hoá nhưng không máy móc.',
  'Người tuyến đầu biến chiến lược thành trải nghiệm — tuyển đúng người quan trọng ngang đào tạo.',
  'Dịch vụ cao cấp là CHỦ ĐỘNG — phát hiện nhu cầu trước khi nhà yêu cầu.',
  'Sai sót không tránh hết — quan trọng là PHÁT HIỆN, XỬ LÝ, PHỤC HỒI nhanh.',
  'Dịch vụ xuất sắc phải tạo GIÁ TRỊ KINH TẾ — đo CLV, giữ chân, giới thiệu.'
];

/* ĐO → TRUNG THÀNH → LỢI NHUẬN (Bảng 10). Trỏ nơi mỗi chỉ số sống.
   Nhắc luật kho: KHÔNG gộp cột đo được với cột lời khai. */
G.CX_DO = [
  { chi:'Hài lòng (CSAT)', y:'Đo phản ứng tức thời', tro:'do-luong-kh', troTen:'Hệ đo lường' },
  { chi:'Giữ chân (retention)', y:'Đo quan hệ — nhà ở lại bao lâu', tro:'do-luong-kh', troTen:'Hệ đo lường' },
  { chi:'Mua lại / lên tầng', y:'Doanh thu lặp lại, tăng CLV', tro:'cay-tien', troTen:'Cây tiền (quản trị)' },
  { chi:'Giới thiệu (referral)', y:'Nhà mang nhà mới — tăng trưởng', tro:'cay-tien', troTen:'Cây tiền (quản trị)' },
  { chi:'Giá trị trọn đời (CLV)', y:'Tổng giá trị một gia đình nhiều năm', tro:'bang-so', troTen:'Bảng số' }
];

(function () {
  var U = G.U, h = U.h, ic = U.ic;

  G.VIEWS['trai-nghiem-kh'] = function () {
    if (!G.can('pro_consult')) return U.lockCard();

    var o = U.ph({ eyebrow:'NHÓM 05 · QUẢN TRỊ', ic:'heart', grad:1,
      t:'Hệ trải nghiệm khách hàng', lead:G.CX_THESIS.cot });

    /* Công thức */
    o += '<div class="card mb" style="border-color:var(--gita-vien-1)">' +
      '<div class="tiny up muted mb">CÔNG THỨC — DỊCH VỤ LÀ ĐỘNG CƠ KINH DOANH</div>' +
      '<p class="sm" style="line-height:1.8"><b>' + h(G.CX_THESIS.congThuc) + '</b></p></div>';

    /* Cỗ máy 10 tầng — ánh vào GITA */
    o += U.sec('CỖ MÁY DỊCH VỤ 10 TẦNG — GITA đã dựng ở đâu',
      'Không dựng lại — mỗi tầng của cỗ máy nối vào một màn đang chạy. Bấm để mở.');
    o += '<div class="card">' + U.tbl(['Tầng', 'Câu hỏi quản trị', 'Đầu ra', 'Mở'],
      G.CX_MAY10.map(function (m, i) {
        return [
          '<b class="sm">' + (i + 1) + '. ' + h(m.t) + '</b>',
          '<span class="tiny">' + h(m.hoi) + '</span>',
          '<span class="tiny muted">' + h(m.ra) + '</span>',
          '<button class="chip" data-v="' + h(m.tro) + '" style="cursor:pointer;border:1px solid var(--gita-vien-2)">' +
            ic('compass', 'w-3 h-3') + h(m.troTen) + '</button>'
        ];
      })) + '</div>';

    /* Chuỗi WOW theo 5 tầng */
    o += U.sec('CHUỖI WOW — điểm chạm vượt kỳ vọng theo 5 tầng',
      'WOW = khoảnh khắc CHỦ ĐỘNG vượt kỳ vọng. "10.000 trải nghiệm" là cách đếm quy mô ' +
      '(5 tầng × 10 cấp × các khoảnh khắc), không phải danh sách chạy cho đủ số.');
    o += G.CX_WOW.map(function (w) {
      return '<div class="card mb" style="border-color:var(--gita-vien-2)">' +
        '<div class="row wrap mb" style="gap:9px">' + U.chip(w.giai + ' · ' + w.tang, 'var(--gita)') +
        '<button class="chip" data-v="' + h(w.tro) + '" style="margin-left:auto;cursor:pointer;border:1px solid var(--gita-vien-2)">' +
        ic('compass', 'w-3 h-3') + h(w.troTen) + '</button></div>' +
        '<p class="sm dim" style="line-height:1.75">' + h(w.khoanhKhac) + '</p></div>';
    }).join('');

    /* 15 chặng trải nghiệm */
    o += U.sec('CHUỖI 15 CHẶNG TRẢI NGHIỆM',
      'Dòng khách đi từ lời mời tới lúc thành nhà kim cương soi cho nhà khác — nguồn ' + h(G.CX_WOW_NGUON || 'CJM-1000WOW'));
    o += '<div class="row wrap" style="gap:6px">' + G.CX_15CHANG.map(function (c) {
      return '<span class="chip" style="border:1px solid var(--gita-vien-2)">' + h(c) + '</span>';
    }).join('') + '</div>';

    /* Khung 20 điểm chạm mỗi cấp */
    o += U.sec('KHUNG 20 ĐIỂM CHẠM MỖI CẤP (W01–W20)',
      '6 nhóm cố định, khung KHÔNG đổi qua 50 cấp — chỉ nội dung đổi. Mỗi cấp 200 điểm chạm = ' +
      '20 khung × 10 biến thể; 50 cấp × 200 = 10.000 (CÁCH ĐẾM, không phải 10.000 dòng bịa sẵn).');
    o += '<div class="card">' + U.tbl(['Mã', 'Điểm chạm', 'Nhóm', 'Kênh', 'Chỉ số đo'],
      G.CX_WOW20.map(function (w) {
        return ['<b class="mono sm">' + h(w.ma) + '</b>', '<b class="sm">' + h(w.ten) + '</b>',
          '<span class="tiny">' + h(w.nhom) + '</span>', '<span class="tiny muted">' + h(w.kenh) + '</span>',
          '<span class="tiny">' + h(w.do) + '</span>'];
      })) + '</div>';

    /* Ba luật wow + phân bổ (chủ hệ đã chốt 10.000) */
    o += '<div class="grid g2" style="gap:12px">' +
      '<div class="card pad-sm"><div class="tiny up muted mb">BA LUẬT WOW</div>' +
      U.list(G.CX_WOW_LUAT, 'var(--gita)') + '</div>' +
      '<div class="card pad-sm" style="border-color:var(--gita-vien-1)">' +
      '<div class="tiny up mb" style="color:var(--gold-ink)">PHÂN BỔ 10.000 ĐIỂM CHẠM (chủ hệ chốt)</div>' +
      '<p class="tiny mb"><b>' + G.CX_WOW_PHANBO.tong.toLocaleString('vi-VN') + '</b> điểm chạm · mỗi tầng <b>' +
      G.CX_WOW_PHANBO.moiTang.toLocaleString('vi-VN') + '</b> · mỗi cấp <b>' + G.CX_WOW_PHANBO.moiCap + '</b>.</p>' +
      '<p class="tiny">' + G.CX_WOW_PHANBO.theoTang.map(function (x) { return h(x.t) + ' ' + x.n.toLocaleString('vi-VN'); }).join(' · ') + '</p>' +
      '<p class="tiny dim mt">' + h(G.CX_WOW_PHANBO.cach) + '. Là SỨC CHỨA, không phải chỉ tiêu chạy cho đủ (luật SUP-01).</p></div>' +
      '</div>';

    /* Thư viện tình huống → giải pháp */
    o += U.sec('THƯ VIỆN TÌNH HUỐNG → GIẢI PHÁP',
      'Đa dạng giải pháp cho các ca hay phát sinh. Mỗi ca có BƯỚC LÀM ĐƯỢC, ' +
      'ô KHÔNG-LÀM (ranh giới), và trỏ hệ xử lý đã có.');
    o += G.CX_TINHHUONG.map(function (t) {
      return '<div class="card mb">' +
        '<div class="row wrap mb" style="gap:8px">' + ic('target', 'w-4 h-4') +
        '<b class="sm">' + h(t.ca) + '</b>' +
        '<button class="chip" data-v="' + h(t.tro) + '" style="margin-left:auto;cursor:pointer;border:1px solid var(--gita-vien-2)">' +
        ic('compass', 'w-3 h-3') + h(t.troTen) + '</button></div>' +
        '<div class="grid g3" style="gap:10px">' +
        '<div class="card pad-sm"><div class="tiny up muted mb">DẤU HIỆU</div><p class="tiny">' + h(t.dau) + '</p></div>' +
        '<div class="card pad-sm" style="border-color:var(--gita-vien-1)"><div class="tiny up mb" style="color:var(--gold-ink)">LÀM ĐƯỢC</div><p class="tiny">' + h(t.lam) + '</p></div>' +
        '<div class="card pad-sm" style="border-color:rgba(248,113,113,.28)"><div class="tiny up mb" style="color:#BE0E16">KHÔNG LÀM</div><p class="tiny">' + h(t.khong) + '</p></div>' +
        '</div></div>';
    }).join('');

    /* Đo → trung thành → lợi nhuận */
    o += U.sec('ĐO → TRUNG THÀNH → LỢI NHUẬN',
      'Dịch vụ phải ĐO ĐƯỢC — "tận tâm" chưa phải KPI. Không gộp cột đo được với cột lời khai.');
    o += '<div class="card">' + U.tbl(['Chỉ số', 'Đọc ra gì', 'Sống ở đâu'],
      G.CX_DO.map(function (d) {
        return [
          '<b class="sm">' + h(d.chi) + '</b>',
          '<span class="tiny">' + h(d.y) + '</span>',
          '<button class="chip" data-v="' + h(d.tro) + '" style="cursor:pointer;border:1px solid var(--gita-vien-2)">' +
            ic('pulse', 'w-3 h-3') + h(d.troTen) + '</button>'
        ];
      })) + '</div>';

    /* 10 nền */
    o += U.sec('MƯỜI NỀN TẢNG', 'Tư duy nền — đọc nhanh, ghim lại.');
    o += '<div class="card">' + U.list(G.CX_NEN, 'var(--gita)') + '</div>';

    return o;
  };
})();
