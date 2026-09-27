/* ═══════════════════════════════════════════════════════════════
   GITA 365 · 9.99.203 — KHO TÀI LIỆU · 5 TẦNG × 10 CẤP + BỘ SINH

   Chủ hệ: biên soạn tài liệu cho toàn bộ 10 cấp × 5 tầng, kèm cẩm nang
   hướng dẫn dùng kho và chương trình đào tạo nhân sự thực hành kho.

   Dữ liệu ở đây LÀ THẬT — chép từ "00_GITA_365_MUC_LUC_TONG" của chủ hệ
   (26 tài liệu · 2.697 trang) trên Drive "GITA VIP 365 CHUẨN". KHÔNG bịa,
   KHÔNG độn tệp rỗng cho đủ "500.000": con số thật là ~2.700 trang + hai
   ma trận 1.000 ô. "Bộ sinh" dựng KHUNG (outline chuẩn) cho một toạ độ
   tầng×nhóm để người biên soạn viết tiếp TỪ nguồn — một cái khung bám
   nguồn, không phải một tệp độn.

   Màn này TRỎ về tài liệu nguồn (link Drive), không chép nội dung 2.700
   trang vào kho mã — chép là dựng bản thứ hai của một sự thật, và bản
   thứ hai sẽ lệch khi chủ hệ sửa bản gốc.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;

/* Thư mục nguồn trên Drive (nội bộ — mở cần đăng nhập Google của Học viện). */
G.KTL_DRIVE = 'https://drive.google.com/drive/folders/1z48yZhsupElk6lJCiHi0tplZD7EP9_cS';

G.KTL_META = { taiLieu: 26, trang: 2697, tapXong: 12, tapTong: 20,
  maChuan: 'GITA-MASTER-INDEX-V1.0',
  cauMo: 'Mở tài liệu này ra là biết mình đang có gì và thiếu gì.' };

/* 5 TẦNG × 10 CẤP = 50 CẤP TRÍ TUỆ — tài liệu 07 "Hệ phân tầng trí tuệ".
   Mã cấp theo lối "tầng.cấp" (1.1 … 5.10), đúng cách chủ hệ đánh (vd 3.4). */
/* Tên tầng THẬT — mục lục master 5 tầng của chủ hệ (NHẬN DIỆN → BỨT PHÁ),
   kèm thời lượng lộ trình. Giá gói để riêng ở KTL_GOI (nguồn tham chiếu),
   không đặt trong khung để tránh bản thứ hai của giá đang chạy. */
/* Hai tên tầng đi cùng một tầng, đều THẬT, từ hai tài liệu nguồn:
   `ten` = tên gói (mục lục master · bảng giá); `biet`+`hoa` = ẩn dụ và chuyển
   hoá của hành trình (BẢN THIẾT KẾ QUY TRÌNH 5 TẦNG · GITA-TẦNG-V1.0). Ghép
   trên MỘT bản ghi để không dựng bản thứ hai của trục tầng. */
G.KTL_TANG = [
  { ma:'T1', ten:'Tầng 1 · NHẬN DIỆN', biet:'HẠT',  hoa:'Tò mò → Nứt vỏ',            mau:'var(--gita)',      y:'7 ngày · gói trải nghiệm miễn phí', ngay:'7 ngày' },
  { ma:'T2', ten:'Tầng 2 · GIẢI MÃ',   biet:'RỄ',   hoa:'Nghi ngờ → Điểm tựa',       mau:'var(--gita-sang)', y:'21 ngày · gói đánh giá nền tảng', ngay:'21 ngày' },
  { ma:'T3', ten:'Tầng 3 · KIẾN TẠO',  biet:'THÂN', hoa:'Làm theo → Tự làm chủ',     mau:'var(--gita-sau)',  y:'90 ngày · tư vấn & xây lộ trình', ngay:'90 ngày' },
  { ma:'T4', ten:'Tầng 4 · CHUYỂN HÓA',biet:'TÁN',  hoa:'Fan → Đồng hành / Cố vấn',  mau:'var(--ok)',        y:'365 ngày · huấn luyện đồng hành', ngay:'365 ngày' },
  { ma:'T5', ten:'Tầng 5 · BỨT PHÁ',   biet:'RỪNG', hoa:'Cây Mẹ → Kiến tạo kỷ nguyên',mau:'var(--gold-2)',   y:'365 ngày chuyên sâu · phát triển toàn diện', ngay:'365 ngày' }
];
/* Cấu trúc gói theo tài liệu nguồn (tham chiếu) — giá đang chạy ở màn Bảng giá. */
G.KTL_GOI = [
  {t:'Tầng 1 · NHẬN DIỆN',goi:'Trải nghiệm miễn phí',gia:'0đ'},
  {t:'Tầng 2 · GIẢI MÃ',goi:'Đánh giá nền tảng',gia:'500.000đ'},
  {t:'Tầng 3 · KIẾN TẠO',goi:'Tư vấn & xây lộ trình',gia:'10 triệu'},
  {t:'Tầng 4 · CHUYỂN HÓA',goi:'Huấn luyện đồng hành',gia:'30 triệu'},
  {t:'Tầng 5 · BỨT PHÁ',goi:'Phát triển toàn diện',gia:'100 triệu'}
];
G.KTL_SO_CAP = 10;

/* 50 CẤP HÀNH TRÌNH — chép THẬT từ "BẢN THIẾT KẾ QUY TRÌNH 5 TẦNG HOÀN CHỈNH"
   (GITA-TẦNG-V1.0) của chủ hệ, Phụ lục A · ma trận 50 cấp độ. Mỗi cấp: tên
   thật + mốc (khi) nếu tài liệu ghi; cấp nào tài liệu không ghi mốc cố định
   (theo sự kiện/mùa) thì BỎ khoá `khi`, không để rỗng (luật trường trống).
   Đây là trục HÀNH TRÌNH (HẠT→RỪNG); tên gói ở KTL_TANG.ten. */
G.KTL_CAP50 = [
  {ma:'1.1',tang:'T1',cap:1,ten:'Người tò mò',khi:'ngày 0 · khoảnh khắc mời gọi'},
  {ma:'1.2',tang:'T1',cap:2,ten:'Người chạm lần đầu',khi:'ngày 0–1 · 60 giây đầu tiên'},
  {ma:'1.3',tang:'T1',cap:3,ten:'Người thử 3 ngày',khi:'ngày 1–3 · hạt biết tên tôi'},
  {ma:'1.4',tang:'T1',cap:4,ten:'Người bắt đầu nhịp',khi:'ngày 4–7 · chuỗi 7'},
  {ma:'1.5',tang:'T1',cap:5,ten:'Hạt nứt vỏ chính thức',khi:'ngày 7–14'},
  {ma:'1.6',tang:'T1',cap:6,ten:'Người có đồng hành',khi:'ngày 14–17'},
  {ma:'1.7',tang:'T1',cap:7,ten:'Người vượt tuần 3',khi:'ngày 15–21 · cửa tử thống kê'},
  {ma:'1.8',tang:'T1',cap:8,ten:'Người có khoảnh khắc thứ nhất',khi:'ngày 14 · Bữa Cơm Ký Ức'},
  {ma:'1.9',tang:'T1',cap:9,ten:'Người thấy con đường',khi:'ngày 22–29'},
  {ma:'1.10',tang:'T1',cap:10,ten:'Người sẵn sàng gốc',khi:'ngày 30 · cửa tầng 2'},
  {ma:'2.1',tang:'T2',cap:1,ten:'Người câu hỏi tiền',khi:'tháng 2 · tuần 1–2'},
  {ma:'2.2',tang:'T2',cap:2,ten:'Người gửi giọt tiền đầu',khi:'tháng 2–3'},
  {ma:'2.3',tang:'T2',cap:3,ten:'Người gặp gió đầu',khi:'theo sự kiện · mùa đời lần 1'},
  {ma:'2.4',tang:'T2',cap:4,ten:'Người có vết sẹo tự hào',khi:'sau mùa gió đầu'},
  {ma:'2.5',tang:'T2',cap:5,ten:'Người có bản độ đo',khi:'tháng 4–5'},
  {ma:'2.6',tang:'T2',cap:6,ten:'Người cả nhà thành đội',khi:'tháng 5–7'},
  {ma:'2.7',tang:'T2',cap:7,ten:'Người có 1 tháng an toàn',khi:'tháng 6–8'},
  {ma:'2.8',tang:'T2',cap:8,ten:'Người bắt đầu đo được',khi:'tháng 7–8'},
  {ma:'2.9',tang:'T2',cap:9,ten:'Người tự truyền động lực',khi:'tháng 8–9'},
  {ma:'2.10',tang:'T2',cap:10,ten:'Người có điểm tựa',khi:'tháng 9 · cửa tầng 3'},
  {ma:'3.1',tang:'T3',cap:1,ten:'Người có giấy phép mạo hiểm',khi:'quỹ đủ 3 tháng'},
  {ma:'3.2',tang:'T3',cap:2,ten:'Người thử lựa',khi:'kỳ thử 30 ngày đầu'},
  {ma:'3.3',tang:'T3',cap:3,ten:'Người đọc dữ kiện của chính mình'},
  {ma:'3.4',tang:'T3',cap:4,ten:'Người chọn một gốc'},
  {ma:'3.5',tang:'T3',cap:5,ten:'Người có nhịp'},
  {ma:'3.6',tang:'T3',cap:6,ten:'Người đối mặt mùa khô'},
  {ma:'3.7',tang:'T3',cap:7,ten:'Người tự vận hành'},
  {ma:'3.8',tang:'T3',cap:8,ten:'Người có dòng thu nhập thứ hai'},
  {ma:'3.9',tang:'T3',cap:9,ten:'Người biết mình muốn đi đâu'},
  {ma:'3.10',tang:'T3',cap:10,ten:'Người sẵn sàng lễ Thân Cây'},
  {ma:'4.1',tang:'T4',cap:1,ten:'Người phát tín hiệu'},
  {ma:'4.2',tang:'T4',cap:2,ten:'Người có người lắng nghe'},
  {ma:'4.3',tang:'T4',cap:3,ten:'Người trả lời'},
  {ma:'4.4',tang:'T4',cap:4,ten:'Người kè đầu tiên'},
  {ma:'4.5',tang:'T4',cap:5,ten:'Người biết giới hạn'},
  {ma:'4.6',tang:'T4',cap:6,ten:'Người tạo không gian'},
  {ma:'4.7',tang:'T4',cap:7,ten:'Người có học trò',khi:'khủng hoảng giữa tầng'},
  {ma:'4.8',tang:'T4',cap:8,ten:'Người nhường chỗ'},
  {ma:'4.9',tang:'T4',cap:9,ten:'Người có mạch'},
  {ma:'4.10',tang:'T4',cap:10,ten:'Người đồng hành thật'},
  {ma:'5.1',tang:'T5',cap:1,ten:'Cây Mẹ đầu tiên'},
  {ma:'5.2',tang:'T5',cap:2,ten:'Người gieo hạt có chọn'},
  {ma:'5.3',tang:'T5',cap:3,ten:'Người viết ra'},
  {ma:'5.4',tang:'T5',cap:4,ten:'Người dạy người dạy'},
  {ma:'5.5',tang:'T5',cap:5,ten:'Người có hệ nhỏ'},
  {ma:'5.6',tang:'T5',cap:6,ten:'Người nhường lái'},
  {ma:'5.7',tang:'T5',cap:7,ten:'Người giữ tín'},
  {ma:'5.8',tang:'T5',cap:8,ten:'Người kết rừng'},
  {ma:'5.9',tang:'T5',cap:9,ten:'Người mở đường'},
  {ma:'5.10',tang:'T5',cap:10,ten:'Kiến tạo kỷ nguyên'}
];
G.KTL_CAP50_NGUON = 'BẢN THIẾT KẾ QUY TRÌNH 5 TẦNG HOÀN CHỈNH (GITA-TẦNG-V1.0) · Phụ lục A';

/* 20 NHÓM VẤN ĐỀ N01–N20 — mỗi tập phân tích chuyên sâu là một nhóm.
   `tap` = số tập đã viết (0 = chưa); `tang` = tầng đại diện; `xong` = đã có tệp. */
G.KTL_NHOM = [
  {ma:'N01',ten:'Khởi đầu & cam kết',tap:11,tang:'T1',xong:true},
  {ma:'N02',ten:'Giữ nhịp & tái khởi động',tap:5,tang:'T1',xong:true},
  {ma:'N03',ten:'Cảm xúc nặng',tap:2,tang:'T1',xong:true},
  {ma:'N04',ten:'Niềm tin & tự đánh giá',tap:6,tang:'T2',xong:true},
  {ma:'N05',ten:'Quan hệ vợ chồng',tap:7,tang:'T3',xong:true},
  {ma:'N06',ten:'Nuôi dạy con',tap:12,tang:'T3',xong:true},
  {ma:'N07',ten:'Nhóm N07',tap:0,tang:'T2',xong:false},
  {ma:'N08',ten:'Nhóm nền tảng N08',tap:0,tang:'T1',xong:false},
  {ma:'N09',ten:'Nhóm N09',tap:0,tang:'T2',xong:false},
  {ma:'N10',ten:'Nhóm nền tảng N10',tap:0,tang:'T1',xong:false},
  {ma:'N11',ten:'Tiền bạc & nợ',tap:8,tang:'T4',xong:true},
  {ma:'N12',ten:'Nghề nghiệp & việc làm',tap:9,tang:'T4',xong:true},
  {ma:'N13',ten:'Nhóm N13',tap:0,tang:'T4',xong:false},
  {ma:'N14',ten:'Khởi nghiệp & kinh doanh nhỏ',tap:3,tang:'T4',xong:true},
  {ma:'N15',ten:'Biến cố & mất mát',tap:1,tang:'T3',xong:true},
  {ma:'N16',ten:'Thói quen khó bỏ',tap:10,tang:'T2',xong:true},
  {ma:'N17',ten:'Nhóm N17',tap:0,tang:'T3',xong:false},
  {ma:'N18',ten:'Nhóm nền tảng N18',tap:0,tang:'T1',xong:false},
  {ma:'N19',ten:'Nhóm N19',tap:0,tang:'T5',xong:false},
  {ma:'N20',ten:'Trao đi & dẫn dắt',tap:4,tang:'T5',xong:true}
];

/* 26 TÀI LIỆU — danh mục thật, chia 4 lớp. */
G.KTL_LOP = [
  {ma:'L1',ten:'Lớp 1 · Nền',    y:'Hệ thống này là gì và người ta đi qua nó thế nào', docs:[1,2,3,7]},
  {ma:'L2',ten:'Lớp 2 · Dựng',   y:'Dựng và vận hành nó bằng cách nào', docs:[4,8,10]},
  {ma:'L3',ten:'Lớp 3 · Hành nghề',y:'Làm việc với một con người cụ thể thế nào', docs:[6,12,13,26]},
  {ma:'L4',ten:'Lớp 4 · Tự soi', y:'Chỗ nào trong thiết kế đang sai', docs:[5,9]}
];
G.KTL_DOC = [
  {so:1,ten:'GITA VIP 365 — bản trình bày',trang:614,y:'Tài liệu gốc, đánh máy lại toàn bộ'},
  {so:2,ten:'Hành trình trải nghiệm khách hàng',trang:158,y:'15 chặng · 50 cấp · 1000 điểm chạm wow'},
  {so:3,ten:'Hành lang thành công',trang:32,y:'12 luật · 18 virus & vắc-xin · 9 khoá · 7 đòn bẩy'},
  {so:4,ten:'Kiến trúc vận hành',trang:94,y:'7 lớp · 1000 khoá · 10.000 tình huống · 100 bánh đà · 12 SOP'},
  {so:5,ten:'Sổ rà soát lỗi hệ thống',trang:24,y:'66 điểm gãy · 13 lỗi chặn phát hành'},
  {so:6,ten:'Ma trận hoá giải rào cản',trang:112,y:'10 nhóm × 20 tình huống × 5 mức = 1000 ô'},
  {so:7,ten:'Hệ phân tầng trí tuệ',trang:38,y:'5 tầng × 10 cấp = 50 cấp trí tuệ · 5 cửa duyệt'},
  {so:8,ten:'Bộ hồ sơ hợp đồng & vận hành',trang:34,y:'16 hợp đồng · 25 điều khoản · 41 biểu mẫu'},
  {so:9,ten:'Rà soát pháp lý',trang:27,y:'64 phát hiện · 20 nghiêm trọng · 12 văn bản cần bổ sung'},
  {so:10,ten:'Sổ tay Super Admin — đầy đủ',trang:188,y:'20 tab · 83 mục · 122 câu hỏi · 40 kịch bản · 100 câu tự kiểm'},
  {so:11,ten:'Sổ tay Super Admin — rút gọn',trang:31,y:'Bản đầu, tra nhanh'},
  {so:12,ten:'Kho 509 kịch bản coach',trang:73,y:'9 khung buổi + 500 kịch bản tình huống, 20 nhóm'},
  {so:13,ten:'Tài liệu phụ trợ buổi coach',trang:89,y:'20 bộ công cụ · 500 phiếu khách · 3 biểu mẫu'},
  {so:14,ten:'Phân tích chuyên sâu — Tập 1',trang:62,y:'Chuẩn 12 mục · bản đồ 30 cấp T3–T5'},
  {so:15,ten:'Phân tích chuyên sâu — Tập 2',trang:62,y:'N03 Cảm xúc nặng · ranh giới chuyển tuyến'},
  {so:16,ten:'Phân tích chuyên sâu — Tập 3',trang:62,y:'N14 Khởi nghiệp · đại diện Tầng 4'},
  {so:17,ten:'Phân tích chuyên sâu — Tập 4',trang:62,y:'N20 Trao đi & dẫn dắt · đại diện Tầng 5'},
  {so:18,ten:'Phân tích chuyên sâu — Tập 5',trang:62,y:'N02 Giữ nhịp · nhóm gặp nhiều nhất'},
  {so:19,ten:'Phân tích chuyên sâu — Tập 6',trang:62,y:'N04 Niềm tin & tự đánh giá'},
  {so:20,ten:'Phân tích chuyên sâu — Tập 7',trang:84,y:'N05 Quan hệ vợ chồng · chuẩn 18 mục'},
  {so:21,ten:'Phân tích chuyên sâu — Tập 8',trang:109,y:'N11 Tiền bạc & nợ · 7 công thức số'},
  {so:22,ten:'Phân tích chuyên sâu — Tập 9',trang:112,y:'N12 Nghề nghiệp · chuẩn 26 mục'},
  {so:23,ten:'Phân tích chuyên sâu — Tập 10',trang:134,y:'N16 Thói quen khó bỏ · chuẩn 27 mục'},
  {so:24,ten:'Phân tích chuyên sâu — Tập 11',trang:131,y:'N01 Khởi đầu · bốn mốc rơi 30 ngày đầu'},
  {so:25,ten:'Phân tích chuyên sâu — Tập 12',trang:134,y:'N06 Nuôi dạy con · bốn điều con học được'},
  {so:26,ten:'Bộ hỗ trợ tư vấn 1000 ô',trang:107,y:'20 nhóm × 10 vấn đề × 5 tầng · 28 mẫu câu · 12 từ cấm'}
];

/* HAI MA TRẬN 1000 Ô — thật, khác nhau (mục 2.3 của mục lục tổng). */
G.KTL_MATRAN = [
  {ma:'M1',ten:'1000 ô HOÁ GIẢI RÀO CẢN',cong:'10 nhóm × 20 tình huống × 5 mức',doc:6,ai:'Coach · AI'},
  {ma:'M2',ten:'1000 ô HỖ TRỢ TƯ VẤN',cong:'20 nhóm × 10 vấn đề × 5 tầng',doc:26,ai:'CSKH · AI'}
];

/* CẨM NANG DÙNG KHO — "dùng tài liệu nào cho việc gì" (thật). */
G.KTL_DUNG = [
  {khi:'Hiểu toàn bộ hệ phân tầng gốc',mo:'01'},
  {khi:'Thiết kế con đường khách hàng đi',mo:'02'},
  {khi:'Biết cái gì bảo vệ khách, cái gì soi đường',mo:'03'},
  {khi:'Giao đội kỹ thuật dựng sản phẩm',mo:'04 · 10'},
  {khi:'Kiểm thiết kế còn lỗ hổng nào',mo:'05'},
  {khi:'Xử lý khách đang bị chặn không tiến được',mo:'06'},
  {khi:'Quyết định nội dung nào mở cho ai',mo:'07'},
  {khi:'Soạn hợp đồng và quy trình nội bộ',mo:'08 · 09'},
  {khi:'Đào tạo người vận hành web app',mo:'10'},
  {khi:'Đào tạo Coach',mo:'12 · 13 · 14–25'},
  {khi:'Nạp dữ liệu cho trợ lý AI',mo:'14–25 · 26'},
  {khi:'Đào tạo tuyến đầu chăm sóc khách hàng',mo:'26'}
];
/* Ba con số 1000 khác nhau — chống nhầm khi giao việc. */
G.KTL_BA_NGHIN = [
  {ten:'1000 điểm chạm wow',la:'Thứ hệ chủ động làm cho khách',doc:'02',ai:'Đội sản phẩm'},
  {ten:'1000 khoá phân luồng',la:'Thứ hệ chặn hoặc mở',doc:'04',ai:'Đội kỹ thuật'},
  {ten:'1000 ô hoá giải rào cản',la:'Coach dùng khi khách bị chặn',doc:'06',ai:'Coach · AI'},
  {ten:'1000 ô hỗ trợ tư vấn',la:'Tuyến đầu dùng khi khách hỏi',doc:'26',ai:'CSKH · AI'}
];

/* BỘ SINH — khung chuẩn 27 mục cho một tài liệu phân tích chuyên sâu.
   Sinh KHUNG cho một toạ độ (nhóm × tầng), người biên soạn viết tiếp TỪ
   nguồn. Không sinh nội dung giả. */
G.KTL_KHUNG27 = [
  'Chân dung nhóm','Vì sao nhóm này khó','Bốn mốc rơi thường gặp','Dấu hiệu quan sát được',
  'Ranh giới chuyển tuyến','Câu hỏi mở đầu buổi','Khung lắng nghe','Điều nhỏ người ta làm được',
  'Vòng lặp hành vi','Đòn bẩy đổi nhịp','Kịch bản buổi 1','Kịch bản buổi 2–4',
  'Bài tập giữa buổi','Đo tiến bộ','Số liệu & công thức','Cạm bẫy của Coach',
  'Câu nên nói','Câu tránh nói','Phối hợp vợ chồng','Khi nào mời chuyên gia',
  'Tài liệu phát cho nhà','Mẫu tin nhắn nhắc nhịp','Chỉ số giữ nhịp','Ca khó & cách gỡ',
  'Tự kiểm của Coach','Nối vào tầng trên','Nguồn tham chiếu'
];
G.ktlSinh = function(nhomMa, tangMa){
  var n = G.KTL_NHOM.filter(function(x){return x.ma===nhomMa;})[0] || {ma:nhomMa,ten:nhomMa};
  var t = G.KTL_TANG.filter(function(x){return x.ma===tangMa;})[0] || {ma:tangMa,ten:tangMa};
  return { ma: nhomMa+'·'+tangMa, tieuDe:'Phân tích chuyên sâu — '+n.ten+' ('+t.ten+')',
    daCo: !!n.xong, tapNguon: n.tap,
    muc: G.KTL_KHUNG27.map(function(m,i){ return {so:i+1, ten:m}; }) };
};

/* CHƯƠNG TRÌNH ĐÀO TẠO NHÂN SỰ THỰC HÀNH KHO — 5 chặng, mỗi chặng trỏ
   tài liệu nguồn và một bài thực hành ĐO ĐƯỢC (không phải học chay). */
G.KTL_DAOTAO = [
  {b:'1',ten:'Đọc bản đồ kho',doc:'00 · 01 · 07',lam:'Vẽ lại bộ khung 5 tầng × 10 cấp bằng lời mình',do:'Nói đúng 5 tầng và ý mỗi tầng'},
  {b:'2',ten:'Tra đúng tài liệu cho một tình huống',doc:'bảng "dùng tài liệu nào"',lam:'Cho 10 tình huống, chỉ đúng số tài liệu',do:'≥9/10 đúng'},
  {b:'3',ten:'Dùng ma trận hoá giải & hỗ trợ',doc:'06 · 26',lam:'Một khách bị chặn: tìm đúng ô R và ô H',do:'Tìm ra ô, đọc ra bước'},
  {b:'4',ten:'Chạy một buổi coach theo kịch bản',doc:'12 · 13 · tập nhóm',lam:'Đóng vai một buổi theo khung 27 mục',do:'Qua bảng tự kiểm của Coach'},
  {b:'5',ten:'Nạp & hỏi trợ lý AI đúng cách',doc:'14–25 · 26',lam:'Hỏi trợ lý 5 câu nghề, đối chiếu nguồn',do:'Câu trả lời khớp tài liệu gốc'}
];

/* ═══ BỘ SÁCH 1000 CUỐN — TÍCH LUỸ TINH TUÝ THEO CÂU CHUYỆN ═══
   Chủ hệ: chuỗi 10 cấp × 5 tầng tích luỹ thành bộ sách kể đời một người
   thành công, hạnh phúc viên mãn — từ trong bào thai tới lúc để lại di
   sản 100 năm — và hành trình một nhân sự thường thành chuyên gia GITA365,
   gắn với MỘT gia đình và MỘT nhân sự để thành câu chuyện cảm hứng.

   CÁCH ĐẾM 1000, KHÔNG PHẢI CHỈ TIÊU: 50 cấp trí tuệ (5 tầng × 10 cấp) ×
   20 nhóm đời sống (N01–N20) = 1.000 cuốn. ~500 trang/cuốn ≈ 500.000 trang
   là SỨC CHỨA, không phải số phải nhồi. Mỗi cuốn viết TỪ nguồn (tập phân
   tích + ma trận 1.000 ô + ebook 1001 tình huống), không sinh trang rỗng. */
G.KTL_SACH_META = { cuon: 1000, cach: '50 cấp × 20 nhóm', trangCuon: 500,
  giaDinhMau: 'nhà An', nhanSuMau: 'bạn Minh' };

/* Cung đời người — 10 chương, bào thai → di sản, gắn 5 tầng. */
G.KTL_DOISONG = [
  {c:'Đ1',ten:'Bào thai & sơ sinh',tuoi:'0',tang:'T1',y:'Nền an toàn, gắn bó đầu đời'},
  {c:'Đ2',ten:'Ấu thơ',tuoi:'1–5',tang:'T1',y:'Cảm xúc, thói quen gốc, tò mò'},
  {c:'Đ3',ten:'Nhi đồng',tuoi:'6–10',tang:'T2',y:'Kỷ luật học, niềm tin vào mình'},
  {c:'Đ4',ten:'Thiếu niên',tuoi:'11–15',tang:'T2',y:'Bản sắc, nội lực, vượt áp lực'},
  {c:'Đ5',ten:'Vị thành niên',tuoi:'16–18',tang:'T3',y:'Định hướng, quan hệ, chọn đường'},
  {c:'Đ6',ten:'Thanh niên lập thân',tuoi:'19–25',tang:'T3',y:'Nghề, tự lập, giá trị sống'},
  {c:'Đ7',ten:'Lập nghiệp & hôn nhân',tuoi:'26–35',tang:'T4',y:'Sự nghiệp, bạn đời, tiền bạc'},
  {c:'Đ8',ten:'Gây dựng & nuôi dạy con',tuoi:'36–50',tang:'T4',y:'Cơ nghiệp, dạy con, cân bằng'},
  {c:'Đ9',ten:'Đỉnh cao & cống hiến',tuoi:'51–65',tang:'T5',y:'Dẫn dắt, trao đi, ý nghĩa'},
  {c:'Đ10',ten:'Trao truyền & di sản 100 năm',tuoi:'66+',tang:'T5',y:'Di sản gia đình · cơ nghiệp · nhân tài'}
];

/* Hành trình nhân sự GITA365 — thường → chuyên gia, 7 bước. */
G.KTL_NHANSU_HT = [
  {b:'1',ten:'Nhập môn',y:'Hiểu triết lý, thuộc bản đồ kho, qua ba cửa'},
  {b:'2',ten:'Thực hành có kèm',y:'Buổi đầu bên khách, có người kèm soi'},
  {b:'3',ten:'Đứng độc lập',y:'Tư vấn/coach một mình, giữ chuẩn nghề'},
  {b:'4',ten:'Chuyên sâu một nhóm',y:'Thành người giỏi nhất một nhóm N'},
  {b:'5',ten:'Kèm người mới',y:'Truyền nghề, nhân bản chuẩn'},
  {b:'6',ten:'Chuyên gia',y:'Dựng nội dung, đặt chuẩn, dẫn đội'},
  {b:'7',ten:'Đối tác & di sản',y:'Sự nghiệp bền cùng GITA365, để lại dấu'}
];

/* Khung một CUỐN sách — kể chuyện, không liệt kê khô. */
G.KTL_KHUNG_SACH = [
  'Mở: chân dung nhà An & bạn Minh ở chặng này',
  'Bối cảnh đời người (chương đời tương ứng)',
  'Vấn đề của nhóm ở tầng này — nhà An gặp gì',
  'Nhân sự Minh đồng hành thế nào (đúng phác đồ)',
  'Điều nhỏ nhà An làm được ngay',
  'Bước ngoặt — chuyện thay đổi ra sao',
  'Số liệu & dấu hiệu đo được',
  'Cạm bẫy & cách gỡ',
  'Kết chặng — một di sản nhỏ để lại',
  'Bài học cảm hứng · nối sang cấp sau'
];
G.ktlSinhSach = function(nhomMa, tangMa){
  var n = G.KTL_NHOM.filter(function(x){return x.ma===nhomMa;})[0] || {ma:nhomMa,ten:nhomMa};
  var t = G.KTL_TANG.filter(function(x){return x.ma===tangMa;})[0] || {ma:tangMa,ten:tangMa};
  var doi = G.KTL_DOISONG.filter(function(x){return x.tang===tangMa;});
  return { ma:'S·'+nhomMa+'·'+tangMa,
    tieuDe:'Cuốn: '+n.ten+' — '+t.ten,
    chuongDoi: doi.map(function(d){return d.c+' '+d.ten;}),
    daCo: !!n.xong, tapNguon: n.tap,
    muc: G.KTL_KHUNG_SACH.map(function(m,i){return {so:i+1,ten:m};}) };
};

/* ═══ KHAI THÁC KHO BẢN CAO CẤP ×10 — thật, từ 5 tài liệu chủ hệ nạp ═══
   Chép cấu trúc (không toàn văn) từ: 1&2. Bản cao cấp GITA365 · 10 Phần
   nền tảng Tầng 2 · MYVIP · Vận hành 7 ngày. Màn TRỎ về bản gốc. */
G.KTL_CUM = [
  {c:'I',ten:'Nền móng tư duy & tầm nhìn',phan:'1–5'},
  {c:'II',ten:'Kiến trúc hệ thống 7 tầng',phan:'6–10'},
  {c:'III',ten:'Bảo mật tuyệt đối',phan:'11–15'},
  {c:'IV',ten:'Pháp lý & tuân thủ',phan:'16–20'},
  {c:'V',ten:'50 trợ lý AI siêu tự động',phan:'21–25'},
  {c:'VI',ten:'Hệ đào tạo & phát triển tài năng',phan:'26–30'},
  {c:'VII',ten:'Gắn kết gia đình & cộng đồng',phan:'31–35'},
  {c:'VIII',ten:'Hệ khởi nghiệp toàn năng',phan:'36–40'},
  {c:'IX',ten:'Trải nghiệm cao cấp & doanh thu',phan:'41–45'},
  {c:'X',ten:'Vận hành, bảo trì & di sản',phan:'46–50'}
];
G.KTL_100NAM = [
  {g:'GĐ1',ten:'Sinh tồn & gốc rễ',nam:'Năm 1–5',mau:'var(--gita)'},
  {g:'GĐ2',ten:'Vững vàng',nam:'Năm 6–20',mau:'var(--gita-sang)'},
  {g:'GĐ3',ten:'Bành trướng',nam:'Năm 21–50',mau:'var(--gita-sau)'},
  {g:'GĐ4',ten:'Di sản trường tồn',nam:'Năm 51–100',mau:'var(--gold-2)'}
];
/* Tầng 1 "Hạt" — 7 ngày onboarding thật (Vận hành 7 ngày). */
G.KTL_TANG1_MOC = [
  {n:'Ngày 1',ten:'Quà "Chạm"'},{n:'Ngày 3',ten:'Quà "Rễ Non"'},
  {n:'Ngày 5',ten:'Quà "Gắn kết"'},{n:'Ngày 7',ten:'Lễ Nứt Vỏ → nâng Tầng 2'}
];
/* Tầng 2 "Rễ" — 10 cấp có tên thật (10 Phần nền tảng Tầng 2), ngày 31–100. */
G.KTL_CAP_T2 = [
  {ma:'2.1',ten:'Người xuống gốc',ngay:'31–37'},
  {ma:'2.2',ten:'Người có rễ đầu',ngay:'38–44'},
  {ma:'2.3',ten:'Người biết mùa của mình',ngay:'45–51'},
  {ma:'2.4',ten:'Người tưới đất khác',ngay:'52–58'},
  {ma:'2.5',ten:'Người có hạt con',ngay:'59–65'},
  {ma:'2.6',ten:'Người có rừng nhỏ',ngay:'66–72'},
  {ma:'2.7',ten:'Người có cây giữ nhịp',ngay:'73–79'},
  {ma:'2.8',ten:'Người tưới hộ cây người khác',ngay:'80–86'},
  {ma:'2.9',ten:'Người dẫn lối nhỏ',ngay:'87–93'},
  {ma:'2.10',ten:'Ánh bình minh toàn cảnh',ngay:'94–100'}
];
/* 5 tài liệu chủ hệ nạp — thêm vào kho, trỏ về bản gốc. */
G.KTL_NGUON_MR = [
  {ten:'Bản cao cấp GITA365 ×10 — Phần 1',y:'10 cụm × 5 phần = 50 phần · lộ trình 100 năm 4 giai đoạn'},
  {ten:'Bản cao cấp GITA365 ×10 — Phần 2',y:'Phần 20–50: pháp lý·vốn · nhân sự kế nhiệm · runbook · học viện nội bộ · nhượng quyền · di sản · AI trung tâm'},
  {ten:'10 Phần nền tảng — Tầng 2 (Rễ)',y:'10 cấp 2.1→2.10 (ngày 31–100) · SOP 3 vai: Tư vấn · Coach · Gia đình'},
  {ten:'MYVIP',y:'Quyển I: 28 sức mạnh · Quyển II: 100.000 điểm chạm (10 lớp) · Quyển III: Kênh Supreme 100 phần'},
  {ten:'Vận hành 7 ngày',y:'Tầng 1 "Hạt": onboarding 7 ngày · quà nhịp · cẩm nang chốt Tầng 2 (500k) · 5 module'}
];

(function(){
var U = G.U, h = U.h, ic = U.ic;

function docTen(so){ var d = G.KTL_DOC.filter(function(x){return x.so===so;})[0]; return d?d.ten:('#'+so); }

G.ktlNgan = G.ktlNgan || 'khung';
G.ktlMoNgan = function(m){ G.ktlNgan = m; G.render && G.render(); };
G.ktlOutline = G.ktlOutline || null;
G.ktlSinhRa = function(n, t){ G.ktlOutline = G.ktlSinh(n, t); G.render && G.render(); };

var NGAN = [
  {ma:'khung', ten:'Bộ khung 5×10', ic:'map'},
  {ma:'danhmuc', ten:'26 tài liệu', ic:'book'},
  {ma:'sinh', ten:'Bộ sinh tài liệu', ic:'spark'},
  {ma:'sach', ten:'Bộ sách 1000 cuốn', ic:'seed'},
  {ma:'caocap', ten:'Bản cao cấp ×10', ic:'star'},
  {ma:'camnang', ten:'Cẩm nang dùng kho', ic:'compass'},
  {ma:'daotao', ten:'Đào tạo nhân sự', ic:'crown'},
  {ma:'coach', ten:'Phương pháp coach', ic:'target'},
  {ma:'sau', ten:'Biên soạn sâu (Vip)', ic:'book'}
];
G.ktlSach = G.ktlSach || null;
G.ktlSinhSachRa = function(n, t){ G.ktlSach = G.ktlSinhSach(n, t); G.render && G.render(); };

function veKhung(){
  var M = G.KTL_META, xong = G.KTL_NHOM.filter(function(n){return n.xong;}).length;
  var o = U.bdSoHang([
    {k:'Tài liệu', v:String(M.taiLieu), c:'var(--gita)', d:'Word + PDF cùng tên'},
    {k:'Tổng trang', v:M.trang.toLocaleString('vi-VN'), c:'var(--gita-sau)'},
    {k:'Cấp trí tuệ', v:'50', c:'var(--ok)', d:'5 tầng × 10 cấp'},
    {k:'Nhóm đã biên soạn', v:xong+'/20', c:'var(--gold-2)', d:'tập phân tích chuyên sâu'},
    {k:'Ma trận ô', v:'2 × 1000', c:'var(--gita-sang)', d:'hoá giải + hỗ trợ tư vấn'}
  ]);
  o += '<p class="note" style="margin:6px 0 14px">'+ic('vault','w-4 h-4')+' Nguồn thật: '+
    '<a href="'+h(G.KTL_DRIVE)+'" target="_blank" rel="noopener">thư mục "GITA VIP 365 CHUẨN" trên Drive</a>'+
    ' · '+h(M.maChuan)+'. "'+h(M.cauMo)+'"</p>';

  o += U.sec('BỘ KHUNG 5 TẦNG × 10 CẤP','50 ô cấp trí tuệ — mỗi ô một mức mở nội dung (tài liệu 07)');
  o += '<div class="ktl-luoi">';
  o += '<div class="ktl-luoi-h"><span></span>'+
    Array.apply(null,{length:G.KTL_SO_CAP}).map(function(_,i){
      return '<span class="ktl-cap-h">C'+(i+1)+'</span>'; }).join('')+'</div>';
  G.KTL_TANG.forEach(function(t){
    o += '<div class="ktl-luoi-r"><span class="ktl-tang-h" style="background:'+t.mau+'">'+
      h(t.ma)+'</span>';
    for(var c=1;c<=G.KTL_SO_CAP;c++){
      o += '<span class="ktl-o" style="--oc:'+t.mau+'" title="'+h(t.ten)+' · cấp '+c+'">'+
        t.ma.slice(1)+'.'+c+'</span>';
    }
    o += '</div>';
  });
  o += '</div>';
  o += '<div class="grid g2" style="margin-top:6px">'+ G.KTL_TANG.map(function(t){
    return '<div class="card pad-sm" style="border-left:3px solid '+t.mau+'">'+
      '<b class="sm">'+h(t.ten)+' · '+h(t.biet)+'</b>'+
      '<p class="tiny mt" style="color:var(--ink-3)">'+h(t.hoa)+'</p>'+
      '<p class="tiny muted mt">'+h(t.y)+'</p></div>';
  }).join('') +'</div>';

  var tl50 = G.KTL_TL50 || null;
  o += U.sec('50 CẤP HÀNH TRÌNH', tl50
    ? ('Bấm một cấp để mở giáo trình — bốn cột: chuỗi hành động · điểm chạm wow · cơ chế · tín hiệu lên cấp. Chép thật từ '+h(G.KTL_TL50_NGUON))
    : ('Tên và mốc từng cấp — chép thật từ '+h(G.KTL_CAP50_NGUON)));
  function veCotTL(nhan, val, mau){
    if(!val) return '';
    return '<div class="ktl-tl-cot"><span class="ktl-tl-nhan" style="color:'+mau+'">'+h(nhan)+'</span>'+
      '<p class="ktl-tl-val">'+h(val)+'</p></div>';
  }
  G.KTL_TANG.forEach(function(t){
    var caps = G.KTL_CAP50.filter(function(c){return c.tang===t.ma;});
    o += '<p class="tiny" style="margin:12px 0 4px;color:'+t.mau+';font-weight:700">'+
      h(t.ten)+' · '+h(t.biet)+' — <span style="color:var(--ink-3);font-weight:400">'+h(t.hoa)+'</span></p>';
    o += '<div class="ktl-nhom">'+ caps.map(function(c){
      var d = tl50 && tl50[c.ma];
      var dau = '<span class="ktl-nhom-ma mono">'+h(c.ma)+'</span>'+
        '<b>'+h(c.ten)+'</b>'+
        (c.khi?'<span class="ktl-nhom-t">'+h(c.khi)+'</span>':'');
      if(!d){
        return '<div class="ktl-nhom-o" style="border-left:3px solid '+t.mau+'">'+dau+'</div>';
      }
      var hn = d.hn;
      var thanHN = hn ? (
        '<div class="ktl-hn"><span class="ktl-tl-nhan" style="color:'+t.mau+'">Bản hợp nhất · '+
          h(hn.tenGoc)+(hn.ngay?(' · '+h(hn.ngay)):'')+'</span>'+
          veCotTL('Mục tiêu tâm hồn', hn.mucTamHon, t.mau)+
          veCotTL('Nhiệm vụ cốt lõi (≤60s)', hn.nhiemVu, t.mau)+
          veCotTL('Điểm chạm WOW chủ đạo', hn.wowCD, t.mau)+
          veCotTL('Kịch bản hệ thống', hn.kichBan, t.mau)+
        '</div>') : '';
      return '<details class="ktl-nhom-o ktl-tl" style="border-left:3px solid '+t.mau+'">'+
        '<summary>'+dau+'</summary>'+
        '<div class="ktl-tl-than">'+
          veCotTL('Chuỗi hành động', d.chuoi, t.mau)+
          veCotTL('Điểm chạm wow', d.wow, t.mau)+
          veCotTL('Cơ chế phía sau', d.coche, t.mau)+
          veCotTL('Tín hiệu lên cấp', d.tinHieu, t.mau)+
          thanHN+
        '</div></details>';
    }).join('') +'</div>';
  });

  var kit = G.CKIT || null;
  o += U.sec('20 NHÓM VẤN ĐỀ (N01–N20)', kit
    ? 'Mỗi nhóm bấm mở ra bộ công cụ coach: mục tiêu · 8 câu hỏi dự phòng · lộ trình 7·21·90 ngày · dấu hiệu tiến bộ · cạm bẫy · ranh giới chuyển tuyến.'
    : 'Xanh = đã có tập phân tích chuyên sâu · mờ = chờ biên soạn');
  o += '<div class="ktl-nhom">'+ G.KTL_NHOM.map(function(n){
    var k = kit && kit[n.ma];
    var dau = '<span class="ktl-nhom-ma mono">'+h(n.ma)+'</span>'+
      '<b>'+h(n.ten)+'</b>'+
      '<span class="ktl-nhom-t">'+(k?'bộ công cụ coach':(n.xong?('Tập '+n.tap+' · '+n.tang):'chờ · '+n.tang))+'</span>';
    if(!k){ return '<div class="ktl-nhom-o'+(n.xong?'':' ktl-cho')+'">'+dau+'</div>'; }
    function ds(nhan,arr){ return arr&&arr.length?('<div class="ktl-tl-cot"><span class="ktl-tl-nhan" style="color:var(--gita-ink)">'+h(nhan)+'</span><ul class="ck-ul">'+arr.map(function(x){return '<li>'+h(x)+'</li>';}).join('')+'</ul></div>'):''; }
    var than = '<div class="ktl-tl-than">'+
      (k.muc?'<div class="ktl-tl-cot"><span class="ktl-tl-nhan" style="color:var(--gita-ink)">Mục tiêu mọi buổi</span><p class="ktl-tl-val">'+h(k.muc)+'</p></div>':'')+
      ds('8 câu hỏi dự phòng', k.hoi)+
      (k.lo7&&k.lo7.length?('<div class="ktl-tl-cot"><span class="ktl-tl-nhan" style="color:var(--gita-ink)">Lộ trình 7 ngày</span><ul class="ck-ul">'+k.lo7.map(function(x){return '<li><b>'+h(x.chang)+':</b> '+h(x.viec)+'</li>';}).join('')+'</ul></div>'):'')+
      (k.lo2190&&k.lo2190.length?('<div class="ktl-tl-cot"><span class="ktl-tl-nhan" style="color:var(--gita-ink)">Lộ trình 21 · 90 ngày</span>'+U.tbl(['21 ngày','90 ngày'], k.lo2190.map(function(r){return r.map(function(c){return h(c);});}))+'</div>'):'')+
      ds('5 dấu hiệu tiến bộ', k.dauHieu)+
      ds('5 cạm bẫy của coach', k.bay)+
      (k.ranh?'<div class="ktl-tl-cot"><span class="ktl-tl-nhan" style="color:var(--warn)">Ranh giới chuyển tuyến</span><p class="ktl-tl-val">'+h(k.ranh)+'</p></div>':'')+
    '</div>';
    return '<details class="ktl-nhom-o ktl-tl" style="border-left:3px solid var(--gita)"><summary>'+dau+'</summary>'+than+'</details>';
  }).join('') +'</div>';
  return o;
}

function veDanhMuc(){
  var o = U.sec('DANH MỤC 26 TÀI LIỆU','Chia bốn lớp — mỗi lớp trả lời một câu hỏi khác nhau');
  G.KTL_LOP.forEach(function(l){
    o += '<div class="ktl-lop"><div class="ktl-lop-h"><b>'+h(l.ten)+'</b>'+
      '<span class="tiny muted">'+h(l.y)+'</span></div>';
    o += U.tbl(['#','Tài liệu','Trang','Nội dung chính'], l.docs.map(function(so){
      var d = G.KTL_DOC.filter(function(x){return x.so===so;})[0] || {so:so,ten:'#'+so,trang:'',y:''};
      return ['<span class="mono">'+('0'+d.so).slice(-2)+'</span>','<b class="sm">'+h(d.ten)+'</b>',
        '<span class="mono">'+h(String(d.trang))+'</span>','<span class="sm muted">'+h(d.y)+'</span>'];
    }));
    o += '</div>';
  });
  o += U.sec('HAI MA TRẬN 1000 Ô','Hai bộ 1000 khác nhau — đừng nhầm khi giao việc');
  o += '<div class="grid g2">'+ G.KTL_MATRAN.map(function(m){
    return '<div class="card pad-sm"><b class="sm">'+h(m.ten)+'</b>'+
      '<p class="tiny muted mt">'+h(m.cong)+'</p>'+
      '<p class="tiny mt">Tài liệu '+h(String(m.doc))+' · dùng bởi <b>'+h(m.ai)+'</b></p></div>';
  }).join('') +'</div>';
  return o;
}

function veSinh(){
  var o = U.sec('BỘ SINH TÀI LIỆU','Chọn một nhóm × tầng → sinh KHUNG chuẩn 27 mục để biên soạn tiếp TỪ nguồn. Không sinh nội dung giả.');
  o += '<div class="ktl-sinh-chon"><label class="tiny up">Nhóm</label>'+
    '<select id="ktlNhom" class="cs-o">'+ G.KTL_NHOM.map(function(n){
      return '<option value="'+h(n.ma)+'">'+h(n.ma+' · '+n.ten)+'</option>'; }).join('') +'</select>'+
    '<label class="tiny up">Tầng</label>'+
    '<select id="ktlTang" class="cs-o">'+ G.KTL_TANG.map(function(t){
      return '<option value="'+h(t.ma)+'">'+h(t.ma+' · '+t.ten)+'</option>'; }).join('') +'</select>'+
    '<button class="btn pri" onclick="G.ktlSinhRa(document.getElementById(\'ktlNhom\').value, document.getElementById(\'ktlTang\').value)">'+
      ic('spark','w-4 h-4')+'Sinh khung</button></div>';
  var kh = G.ktlOutline;
  if(kh){
    o += '<div class="card mt"><div class="ktl-kh-dau"><b>'+h(kh.tieuDe)+'</b>'+
      '<span class="ktl-kh-tt '+(kh.daCo?'ok':'cho')+'">'+
      (kh.daCo?('Đã có Tập '+kh.tapNguon+' — dùng làm nguồn'):'Chưa có tập — biên soạn mới')+'</span></div>'+
      '<ol class="ktl-kh-ds">'+ kh.muc.map(function(m){
        return '<li>'+h(m.ten)+'</li>'; }).join('') +'</ol>'+
      '<p class="tiny dim mt">Khung 27 mục theo chuẩn tập phân tích chuyên sâu của chủ hệ. '+
      'Nội dung viết TỪ nguồn (tập tương ứng + ma trận 1.000 ô), không bịa.</p></div>';
  } else {
    o += '<p class="note mt">Chọn nhóm và tầng rồi bấm <b>Sinh khung</b> để xem khung 27 mục.</p>';
  }
  return o;
}

function veCamNang(){
  var o = U.sec('CẨM NANG DÙNG KHO','Khi cần việc gì thì mở tài liệu nào — bảng tra thật của chủ hệ');
  o += U.tbl(['Khi anh chị cần…','Mở tài liệu số'], G.KTL_DUNG.map(function(d){
    return ['<b class="sm">'+h(d.khi)+'</b>','<span class="mono ktl-mo">'+h(d.mo)+'</span>'];
  }));
  o += U.sec('BA CON SỐ 1000 KHÁC NHAU','Cùng là 1000 nhưng là ba (bốn) thứ khác hẳn — đừng nhầm khi giao việc');
  o += U.tbl(['Bộ 1000','Là gì','Tài liệu','Ai dùng'], G.KTL_BA_NGHIN.map(function(b){
    return ['<b class="sm">'+h(b.ten)+'</b>','<span class="sm muted">'+h(b.la)+'</span>',
      '<span class="mono">'+h(b.doc)+'</span>','<span class="chip">'+h(b.ai)+'</span>'];
  }));
  o += '<div class="card pad-sm mt" style="border-left:3px solid var(--warn)">'+
    ic('shield','w-4 h-4')+' <b class="sm">Bộ tài liệu là bản THIẾT KẾ, không phải sản phẩm đã chạy.</b>'+
    '<p class="tiny muted mt" style="line-height:1.6">Luật sư rà hợp đồng trước khi mở dịch vụ · chuyên gia trụ thẩm định '+
    'nội dung sức khoẻ/tài chính/pháp lý · ca trực đêm phải có người thật. '+
    'Giá trị thật đến vào ngày gia đình đầu tiên đi trọn ba mươi ngày.</p></div>';
  return o;
}

function veDaoTao(){
  var o = U.sec('CHƯƠNG TRÌNH ĐÀO TẠO NHÂN SỰ THỰC HÀNH KHO','Năm chặng — mỗi chặng trỏ tài liệu nguồn và một bài thực hành ĐO ĐƯỢC');
  o += U.bdDong(G.KTL_DAOTAO.map(function(d){
    return {ten:d.b+' · '+d.ten, o:[{t:'Nguồn: '+d.doc},{t:d.lam,p:'✓ '+d.do}]};
  }), {chu:'Học đi đôi với thực hành trên chính kho — không học chay. Mỗi chặng có bài đo được mới qua.'});
  o += U.tbl(['Chặng','Nội dung','Tài liệu nguồn','Bài thực hành','Đo đạt'],
    G.KTL_DAOTAO.map(function(d){
      return ['<span class="mono">'+h(d.b)+'</span>','<b class="sm">'+h(d.ten)+'</b>',
        '<span class="mono sm">'+h(d.doc)+'</span>','<span class="sm">'+h(d.lam)+'</span>',
        '<span class="sm" style="color:var(--ok)">'+h(d.do)+'</span>'];
    }));
  return o;
}

function veSach(){
  var M = G.KTL_SACH_META;
  var o = U.bdSoHang([
    {k:'Bộ sách', v:M.cuon.toLocaleString('vi-VN')+' cuốn', c:'var(--gita)', d:M.cach},
    {k:'Sức chứa', v:'~'+(M.cuon*M.trangCuon/1000).toLocaleString('vi-VN')+'k trang', c:'var(--gita-sau)', d:'~'+M.trangCuon+' trang/cuốn'},
    {k:'Nhân vật', v:'Nhà An · Minh', c:'var(--gold-2)', d:'một gia đình · một nhân sự GITA365'},
    {k:'Cung đời', v:'10 chương', c:'var(--ok)', d:'bào thai → di sản 100 năm'}
  ]);
  o += '<p class="note" style="margin:2px 0 12px">'+ic('spark','w-4 h-4')+
    ' 1.000 cuốn là CÁCH ĐẾM (50 cấp × 20 nhóm), không phải chỉ tiêu nhồi. Mỗi cuốn kể '+
    'chuyện nhà An và nhân sự Minh đi qua một nhóm đời sống ở một tầng — viết TỪ nguồn, không trang rỗng.</p>';

  o += U.sec('CUNG ĐỜI MỘT NGƯỜI — BÀO THAI → DI SẢN','Mười chương đời, gắn năm tầng — trục dọc của bộ sách');
  o += U.bdDong(G.KTL_DOISONG.map(function(d){
    return {ten:d.c+' · '+d.ten, o:[{t:d.tuoi+' tuổi',p:d.tang},{t:d.y}]};
  }), {chu:'Một đời người thành công, hạnh phúc viên mãn — kết lại bằng di sản gia đình, cơ nghiệp 100 năm và những nhân tài để lại.'});

  o += U.sec('HÀNH TRÌNH NHÂN SỰ — THƯỜNG → CHUYÊN GIA GITA365','Trục thứ hai: một nhân sự lớn lên cùng Học viện');
  o += U.bdDong(G.KTL_NHANSU_HT.map(function(b){
    return {ten:b.b+' · '+b.ten, o:[{t:b.y}]};
  }), {chu:'Câu chuyện cảm hứng cho chính đội ngũ: từ buổi đầu bỡ ngỡ tới ngày để lại dấu ấn nghề.'});

  o += U.sec('BỘ SINH CUỐN SÁCH','Chọn nhóm × tầng → sinh khung một cuốn (10 mục kể chuyện) để biên soạn từ nguồn');
  o += '<div class="ktl-sinh-chon"><label class="tiny up">Nhóm đời sống</label>'+
    '<select id="ktlSNhom" class="cs-o">'+ G.KTL_NHOM.map(function(n){
      return '<option value="'+h(n.ma)+'">'+h(n.ma+' · '+n.ten)+'</option>'; }).join('') +'</select>'+
    '<label class="tiny up">Tầng</label>'+
    '<select id="ktlSTang" class="cs-o">'+ G.KTL_TANG.map(function(t){
      return '<option value="'+h(t.ma)+'">'+h(t.ma+' · '+t.ten)+'</option>'; }).join('') +'</select>'+
    '<button class="btn pri" onclick="G.ktlSinhSachRa(document.getElementById(\'ktlSNhom\').value, document.getElementById(\'ktlSTang\').value)">'+
      ic('seed','w-4 h-4')+'Sinh khung sách</button></div>';
  var s = G.ktlSach;
  if(s){
    o += '<div class="card mt"><div class="ktl-kh-dau"><b>'+h(s.tieuDe)+'</b>'+
      '<span class="ktl-kh-tt '+(s.daCo?'ok':'cho')+'">'+
      (s.daCo?('Có Tập '+s.tapNguon+' làm nguồn'):'Chưa có tập — soạn mới')+'</span></div>'+
      (s.chuongDoi.length?'<p class="tiny dim">Chương đời của tầng này: '+h(s.chuongDoi.join(' · '))+'</p>':'')+
      '<ol class="ktl-kh-ds">'+ s.muc.map(function(m){ return '<li>'+h(m.ten)+'</li>'; }).join('') +'</ol>'+
      '<p class="tiny dim mt">Mười mục kể chuyện nhà An + nhân sự Minh. Nội dung viết từ tập nhóm tương ứng, '+
      'ma trận 1.000 ô và ebook 1.001 tình huống — không bịa.</p></div>';
  } else {
    o += '<p class="note mt">Chọn nhóm và tầng rồi bấm <b>Sinh khung sách</b> để xem khung một cuốn.</p>';
  }
  return o;
}

function veCaoCap(){
  var o = '<p class="note" style="margin:2px 0 12px">'+ic('star','w-4 h-4')+
    ' Khai thác từ 5 tài liệu chủ hệ nạp: Bản cao cấp ×10 (50 phần), Tầng 2 (10 cấp), '+
    'MYVIP, Vận hành 7 ngày. Chép cấu trúc, trỏ về bản gốc — không chép toàn văn.</p>';

  o += U.sec('LỘ TRÌNH 100 NĂM — 4 GIAI ĐOẠN','Sinh tồn → Vững vàng → Bành trướng → Di sản trường tồn cấp tập đoàn');
  o += U.bdDong(G.KTL_100NAM.map(function(g){
    return {ten:g.g+' · '+g.nam, mau:g.mau, o:[{t:g.ten}]};
  }), {chu:'Di sản 100 năm: cơ nghiệp trường tồn · giáo dục gia đình · tạo ra nhân tài.'});

  o += U.sec('BẢN CAO CẤP ×10 — 50 PHẦN (10 CỤM × 5)','Kiến trúc hệ thống toàn diện');
  o += U.tbl(['Cụm','Tên cụm','Phần'], G.KTL_CUM.map(function(c){
    return ['<span class="mono">'+h(c.c)+'</span>','<b class="sm">'+h(c.ten)+'</b>',
      '<span class="mono">'+h(c.phan)+'</span>'];
  }));

  o += U.sec('NĂM TẦNG · NĂM GÓI','Tên tầng và cấu trúc gói theo tài liệu nguồn — giá đang chạy ở màn Bảng giá');
  o += U.tbl(['Tầng','Gói','Giá (tham chiếu)'], G.KTL_GOI.map(function(g){
    return ['<b class="sm">'+h(g.t)+'</b>','<span class="sm muted">'+h(g.goi)+'</span>',
      '<span class="mono">'+h(g.gia)+'</span>'];
  }));

  o += U.sec('TẦNG 1 "HẠT" — 7 NGÀY ĐẦU','Onboarding · quà theo nhịp · Lễ Nứt Vỏ → nâng Tầng 2');
  o += U.bdDong(G.KTL_TANG1_MOC.map(function(m){ return {ten:m.n, o:[{t:m.ten}]}; }));

  o += U.sec('TẦNG 2 "RỄ" — 10 CẤP (NGÀY 31–100)','Tên cấp thật từ tài liệu nền tảng Tầng 2');
  o += '<div class="ktl-nhom">'+ G.KTL_CAP_T2.map(function(c){
    return '<div class="ktl-nhom-o"><span class="ktl-nhom-ma mono">'+h(c.ma)+'</span>'+
      '<b>'+h(c.ten)+'</b><span class="ktl-nhom-t">ngày '+h(c.ngay)+'</span></div>';
  }).join('') +'</div>';

  o += U.sec('5 TÀI LIỆU VỪA NẠP VÀO KHO','Trỏ về bản gốc của chủ hệ');
  o += U.tbl(['Tài liệu','Nội dung chính'], G.KTL_NGUON_MR.map(function(d){
    return ['<b class="sm">'+h(d.ten)+'</b>','<span class="sm muted">'+h(d.y)+'</span>'];
  }));
  return o;
}

function veCoach(){
  var g=G.HDT_GITA, b=G.HDT_BEN, k=G.HDT_KYVONG, t5=G.HDT_TANG5, lg=G.HDT_LOGIC;
  if(!g){ return U.empty('Phương pháp coach nằm trong gói nghề',
    'Phần này đọc Hệ phát triển học viên (G.HDT_*) — chỉ vai nghề mới nạp sau khi đăng nhập. Mở lại bằng một vai nghề.'); }
  function bang(t){ return U.tbl(t.cot, t.dong.map(function(r){return r.map(function(c){return h(c);});})); }
  var o = U.sec('HỆ PHÁT TRIỂN HỌC VIÊN — PHƯƠNG PHÁP COACH','Chép thật từ '+h(G.HDT_NGUON));
  o += '<div class="card pad-sm" style="border-color:var(--warn)">'+ic('shield','w-4 h-4')+
    ' <b class="sm">Thang "5 tầng" ở đây là thang THẨM ĐỊNH (Nhận diện→Bứt phá) — khác thang hành trình gia đình (Hạt→Rừng) và thang năng lực coach (Thấu hiểu→Di sản). Ba thang, ba việc, đừng trộn.</b></div>';
  o += U.sec('KHUNG PHÂN TÍCH G–I–T–A','Bốn cấu phần + bốn liên kết. Nguyên tắc: đặt giải pháp ở nơi cơ chế DUY TRÌ vấn đề, không ở nơi vấn đề xuất hiện.');
  o += bang(g);
  o += U.sec('5 TẦNG THẨM ĐỊNH','Mỗi tầng một giai đoạn và một điều kiện hoàn thành đo được.');
  o += '<div class="grid g2">'+t5.map(function(t){
    return '<div class="card pad-sm"><b class="sm">'+h(t.ma)+' · '+h(t.ten)+'</b>'+
      '<p class="tiny muted mt">'+h(t.giaiDoan)+'</p>'+
      '<p class="tiny mt"><b>Hoàn thành khi:</b> '+h(t.hoanThanh)+'</p></div>';
  }).join('')+'</div>';
  o += U.sec('LOGIC MỘT CASE','Chuỗi bắt buộc, và ba lỗi chuyên môn phải tránh.');
  o += '<div class="card pad-sm"><p class="sm"><b>Chuỗi:</b> '+h(lg.chuoi)+'</p>'+
    '<p class="tiny muted mt">'+h(lg.nguyenTac)+'</p></div>';
  o += '<div class="card">'+U.tbl(['Ba lỗi chuyên môn phải tránh'], lg.loi.map(function(x){return [h(x)];}))+'</div>';
  o += U.sec('CÁC BÊN LIÊN QUAN','Mỗi chức năng gắn một loại quyết định và một loại bằng chứng.');
  o += bang(b);
  o += U.sec('NHU CẦU & KỲ VỌNG TỪNG BÊN','Phân biệt nhu cầu · kỳ vọng hợp lý · kỳ vọng cần hiệu chỉnh.');
  o += bang(k);
  /* Toàn bộ 65 bảng phương pháp còn lại — gom theo chương, mỗi bảng bấm mở. */
  var bg = G.HDT_BANG;
  if(bg && bg.length){
    var TENCH = {'1':'CHƯƠNG 1 — NỀN TẢNG QUẢN TRỊ','2':'CHƯƠNG 2 — KIẾN TRÚC HÀNH TRÌNH 5 TẦNG',
      '3':'CHƯƠNG 3 — TÁM NHÓM VẤN ĐỀ (A–H): MÃ HOÁ · THANG TRƯỞNG THÀNH · PHÂN BIỆT · ĐẦU RA',
      '4':'CHƯƠNG 4 — TỪ BIỂU HIỆN ĐẾN VẤN ĐỀ CỐT LÕI'};
    ['1','2','3','4'].forEach(function(ch){
      var ds = bg.filter(function(x){return x.ch===ch;});
      if(!ds.length) return;
      o += U.sec(TENCH[ch]||('Chương '+ch), ds.length+' bảng — bấm để mở');
      o += ds.map(function(x){
        return '<details class="ktl-nhom-o ktl-tl" style="border-left:3px solid var(--gita-vien-2);margin-bottom:6px">'+
          '<summary><b>'+h(x.td)+'</b></summary>'+
          '<div class="ktl-tl-than">'+U.tbl(x.cot, x.dong.map(function(r){return r.map(function(c){return h(c);});}))+'</div>'+
          '</details>';
      }).join('');
    });
  }
  return o;
}

function veSau(){
  var S = G.KTL_SAU;
  if(!S || !S.length){ return U.empty('Bài biên soạn sâu nằm trong gói nghề',
    'Phần này đọc bài sâu từng cấp (G.KTL_SAU) — chỉ vai nghề mới nạp sau khi đăng nhập. Mở lại bằng một vai nghề.'); }
  var o = U.sec('BIÊN SOẠN SÂU TỪNG CẤP (BẢN VIP)','Chép thật từ '+h(G.KTL_SAU_NGUON)+' — mỗi cấp một bài đầy đủ theo 6 chiếc mũ cảm xúc. Bấm để mở.');
  var TEN={'T1':'TẦNG 1 — HẠT','T2':'TẦNG 2 — RỄ','T3':'TẦNG 3 — THÂN','T4':'TẦNG 4 — TÁN','T5':'TẦNG 5 — RỪNG'};
  ['T1','T2','T3','T4','T5'].forEach(function(tg){
    var ds = S.filter(function(x){return x.tang===tg;});
    if(!ds.length) return;
    o += U.sec(TEN[tg]||tg, ds.length+' bài');
    o += ds.map(function(x){
      return '<details class="ktl-nhom-o ktl-tl" style="border-left:3px solid var(--gita);margin-bottom:6px">'+
        '<summary><span class="ktl-nhom-ma mono">'+h(x.ma)+'</span><b>'+h(x.ten)+'</b></summary>'+
        '<div class="ktl-sau-bai">'+h(x.bai)+'</div></details>';
    }).join('');
  });
  return o;
}

G.VIEWS['kho-tai-lieu'] = function(){
  if(!G.can('nghe_chung')) return U.lockCard();
  var o = U.ph({eyebrow:'KHO TRI THỨC', ic:'vault', grad:1, t:'Kho tài liệu GITA 365',
    lead:'26 tài liệu · 2.697 trang · 5 tầng × 10 cấp. Bộ khung, bộ sinh, cẩm nang dùng kho và chương trình đào tạo — tất cả bám nguồn thật của chủ hệ.'});
  o += '<div class="tabs">'+ NGAN.map(function(n){
    return '<button class="tab'+(G.ktlNgan===n.ma?' on':'')+'" onclick="G.ktlMoNgan(\''+n.ma+'\')">'+
      ic(n.ic,'w-4 h-4')+h(n.ten)+'</button>'; }).join('') +'</div>';
  if(G.ktlNgan==='khung') o += veKhung();
  else if(G.ktlNgan==='danhmuc') o += veDanhMuc();
  else if(G.ktlNgan==='sinh') o += veSinh();
  else if(G.ktlNgan==='sach') o += veSach();
  else if(G.ktlNgan==='caocap') o += veCaoCap();
  else if(G.ktlNgan==='camnang') o += veCamNang();
  else if(G.ktlNgan==='daotao') o += veDaoTao();
  else if(G.ktlNgan==='coach') o += veCoach();
  else if(G.ktlNgan==='sau') o += veSau();
  return o;
};

})();
