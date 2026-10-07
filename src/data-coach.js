/* ═══════════════════════════════════════════════════════════════
   GITA 365 — DỮ LIỆU CHUẨN CỦA HỆ ĐIỀU HÀNH COACH

   Một chỗ cho mọi chuẩn mà bảy hệ thống Coach cùng đọc — không màn nào
   tự viết một bản khác:

     G.CO_CT      10 chương trình coach (giai đoạn · buổi · cổng · KPI)
     G.CO_NHIP    6 nhịp một buổi coach (khung mặc định; khi kho đã mở
                  và có G.BANDO_COACH thì màn thiết kế dùng bản chuẩn ấy)
     G.CO_TC      10 tiêu chí chấm chất lượng buổi (0–4) + 5 lằn ranh đỏ
     G.CO_HD      các loại hoạt động đo được của gia đình và của Coach
     G.CO_VD      20 vấn đề theo bốn trụ G–I–T–A (G.GITA)
     G.CO_NC      12 nhu cầu · G.CO_TN 8 chiều tiềm năng · G.CO_SS 5 mức sẵn sàng
     G.CO_GP      24 giải pháp chuẩn, gắn với vấn đề (vd) để máy gợi ý

   Mọi ngưỡng ở đây là ngưỡng VẬN HÀNH ban đầu — Quản lý chuyên môn chỉnh
   theo dữ liệu thật. Không đụng máy chủ · giấy phép · mã hoá.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;

/* ══════════ 1 · CHƯƠNG TRÌNH COACH ══════════
   gd: giai đoạn {ten, tu, den (ngày thứ), buoi, muc, cong (cổng nghiệm thu)}
   kpi: [tên, chỉ tiêu] · vao/ra: điều kiện vào / ra · capCoach: vai thấp nhất được dẫn */
G.CO_CT = [
  { ma:'NHAN-DIEN-7', ten:'Nhận diện 7 ngày', tang:[1], ngay:7, loai:'tang', c:'#185AB4',
    doiTuong:'Gia đình mới vào, chưa có baseline', mien:['G','I','T','A'],
    muc:'Lập baseline trung thực, nhìn ra mô thức, hình thành 1–3 giả thuyết G–I–T–A. Không chữa gì cả.',
    gd:[ {ten:'Mở baseline', tu:1, den:2, buoi:1, muc:'Cả nhà mô tả một ngày thật bằng hành vi quan sát được', cong:'Chọn được 1–3 chỉ số baseline'},
         {ten:'Quan sát & ghi', tu:3, den:6, buoi:1, muc:'Ghi đều, không sửa', cong:'Có ghi ≥ 5/7 ngày'},
         {ten:'Chốt giả thuyết', tu:7, den:7, buoi:1, muc:'Đọc dữ liệu cùng nhau, gọi tên mô thức', cong:'1–3 giả thuyết có bằng chứng'} ],
    kpi:[['Ngày có ghi baseline','≥ 5/7'],['Cả nhà xác nhận bản mô tả','100%'],['Giả thuyết G–I–T–A có bằng chứng','1–3']],
    vao:'Đã ký đồng hành · có phiếu tiếp nhận', ra:'Có giả thuyết → chuyển Giải mã 21 ngày', capCoach:'R07' },

  { ma:'GIAI-MA-21', ten:'Giải mã 21 ngày', tang:[2], ngay:21, loai:'tang', c:'#5140B4',
    doiTuong:'Đã có baseline và giả thuyết', mien:['G','I','T','A'],
    muc:'Kiểm chứng giả thuyết qua 3 vòng 7 ngày, mỗi vòng đổi ít biến, chốt một cơ chế ưu tiên.',
    gd:[ {ten:'Vòng 1 · thử biến thứ nhất', tu:1, den:7, buoi:2, muc:'Đổi một biến, ghi ủng hộ và phản bác', cong:'Có bằng chứng hai chiều'},
         {ten:'Vòng 2 · giữ nhịp qua ngày 8–12', tu:8, den:14, buoi:2, muc:'Giữ nhịp qua vùng dễ bỏ cuộc nhất', cong:'Không đứt quá 2 ngày liền'},
         {ten:'Vòng 3 · chốt cơ chế', tu:15, den:21, buoi:2, muc:'Chọn cơ chế có bằng chứng mạnh nhất', cong:'Một cơ chế ưu tiên được cả nhà đồng ý'} ],
    kpi:[['Vòng có bằng chứng ủng hộ & phản bác','3/3'],['Nhiệm vụ hoàn thành','≥ 70%'],['Cơ chế ưu tiên được chốt','1']],
    vao:'Hoàn thành Nhận diện 7 ngày', ra:'Có cơ chế → Kiến tạo 90 ngày', capCoach:'R07' },

  { ma:'KIEN-TAO-90', ten:'Kiến tạo 90 ngày', tang:[3], ngay:90, loai:'tang', c:'#0B6675',
    doiTuong:'Đã chốt cơ chế ưu tiên', mien:['T','A'],
    muc:'Bốn chuỗi 21 ngày: có cấu trúc → tự điều hành → thích ứng → chuyển giao. Mỗi chuỗi có PDCA và cổng nghiệm thu.',
    gd:[ {ten:'Chuỗi 1 · có cấu trúc', tu:1, den:21, buoi:3, muc:'Dựng khung việc cố định cho nhà', cong:'Khung chạy ≥ 15/21 ngày'},
         {ten:'Chuỗi 2 · tự điều hành', tu:22, den:42, buoi:3, muc:'Con tự lên kế hoạch, cha mẹ lùi một bước', cong:'Con tự lập kế hoạch ≥ 4/7 ngày'},
         {ten:'Chuỗi 3 · thích ứng', tu:43, den:63, buoi:3, muc:'Giữ hệ thống khi có biến (thi, ốm, đi xa)', cong:'Qua một tuần biến động không đứt'},
         {ten:'Chuỗi 4 · chuyển giao', tu:64, den:90, buoi:3, muc:'Nhà tự chạy, Coach chỉ soi', cong:'Nhà tự vận hành 14 ngày liền'} ],
    kpi:[['Cổng nghiệm thu đạt','4/4'],['Tỷ lệ tự chủ của con','≥ 60%'],['PDCA mỗi chuỗi','có biên bản']],
    vao:'Hoàn thành Giải mã 21 ngày', ra:'Đạt 4 cổng → Chuyển hoá 365', capCoach:'R07' },

  { ma:'CHUYEN-HOA-365', ten:'Chuyển hoá 365 ngày', tang:[4], ngay:365, loai:'tang', c:'#0B7350',
    doiTuong:'Nhà đã có hệ thống chạy được', mien:['I','T','A'],
    muc:'Bốn chu kỳ 90 ngày: năng lực nền → ổn định → thích ứng → chuyển giao. Tăng độ khó, giảm hỗ trợ Coach.',
    gd:[ {ten:'Chu kỳ 1 · năng lực nền', tu:1, den:90, buoi:6, muc:'Kỹ năng tự học cốt lõi', cong:'Bài kiểm năng lực nền đạt'},
         {ten:'Chu kỳ 2 · ổn định', tu:91, den:180, buoi:6, muc:'Giữ phong độ qua một học kỳ', cong:'Đèn xanh ≥ 80% số tuần'},
         {ten:'Chu kỳ 3 · thích ứng', tu:181, den:270, buoi:6, muc:'Tự xử lý khó khăn mới', cong:'Tự gỡ ≥ 2 nút thắt mới'},
         {ten:'Chu kỳ 4 · chuyển giao', tu:271, den:365, buoi:6, muc:'Quyền điều hành việc học về tay con', cong:'Con tự điều hành 30 ngày liền'} ],
    kpi:[['Hỗ trợ của Coach giảm theo quý','≥ 25%/quý'],['Tuần đèn xanh','≥ 80%'],['Năng lực tự học','đạt cổng 4/4']],
    vao:'Hoàn thành Kiến tạo 90 ngày', ra:'Đạt 4 cổng → Bứt phá', capCoach:'R06' },

  { ma:'BUT-PHA-365', ten:'Bứt phá gia đình 365 ngày', tang:[5], ngay:365, loai:'tang', c:'#BE0E16',
    doiTuong:'Nhà đã chuyển hoá, muốn đi xa hơn', mien:['G','A'],
    muc:'Đồng bộ học viên – phụ huynh – gia đình. Từ tự quản sang tạo giá trị; đích là hệ thống tự vận hành.',
    gd:[ {ten:'Đồng bộ ba vai', tu:1, den:90, buoi:6, muc:'Con, cha mẹ, cả nhà chung một bản đồ', cong:'Họp nhà hằng tuần tự chạy'},
         {ten:'Tự quản', tu:91, den:180, buoi:6, muc:'Mỗi người tự quản phần mình', cong:'Không cần nhắc 30 ngày'},
         {ten:'Tạo giá trị', tu:181, den:270, buoi:6, muc:'Một dự án tạo giá trị cho người khác', cong:'Dự án có kết quả đo được'},
         {ten:'Tự vận hành', tu:271, den:365, buoi:6, muc:'Gia đình chạy không cần ai canh', cong:'30 ngày không cần Coach'} ],
    kpi:[['Họp nhà tự chạy','≥ 45/52 tuần'],['Dự án tạo giá trị','≥ 1'],['Tự vận hành không Coach','30 ngày']],
    vao:'Hoàn thành Chuyển hoá 365', ra:'Tốt nghiệp · mời làm Đại sứ', capCoach:'R06' },

  { ma:'THOI-QUEN-21', ten:'Thói quen học tập 21 ngày', tang:[2,3], ngay:21, loai:'chuyen-de', c:'#2A72C6',
    doiTuong:'Con có nút thắt thói quen (trì hoãn, thiết bị, giờ giấc)', mien:['A'],
    muc:'Đổi khúc giữa của vòng thói quen: giữ tín hiệu, giữ phần thưởng, thay hành vi.',
    gd:[ {ten:'Tìm tín hiệu thật', tu:1, den:5, buoi:1, muc:'Gọi tên tín hiệu – hành vi – phần thưởng', cong:'Vòng thói quen được vẽ ra'},
         {ten:'Đổi khúc giữa', tu:6, den:12, buoi:1, muc:'Một hành vi thay thế vừa sức', cong:'Làm hành vi mới ≥ 5/7 ngày'},
         {ten:'Giữ chuỗi', tu:13, den:18, buoi:1, muc:'Qua ngày khó không đứt chuỗi', cong:'Không đứt quá 1 ngày'},
         {ten:'Tự duy trì', tu:19, den:21, buoi:1, muc:'Con tự đặt nhắc và tự thưởng', cong:'Chuỗi ≥ 15/21 ngày'} ],
    kpi:[['Ngày giữ chuỗi','≥ 15/21'],['Nhiệm vụ đúng hạn','≥ 70%']],
    vao:'Có giả thuyết thói quen từ Nhận diện', ra:'Chuỗi ≥ 15/21 → về chương trình chính', capCoach:'R07' },

  { ma:'KET-NOI-30', ten:'Kết nối cha mẹ – con 30 ngày', tang:[1,2,3], ngay:30, loai:'chuyen-de', c:'#B4720F',
    doiTuong:'Nhà có xung đột, con ngại nói chuyện với cha mẹ', mien:['I','A'],
    muc:'Dựng lại đường nói chuyện trong nhà: nghe không phán xét, ngôn ngữ mới, họp nhà 15 phút.',
    gd:[ {ten:'Nghe không phán xét', tu:1, den:6, buoi:1, muc:'Cha mẹ tập nghe hết câu', cong:'Ba lần nghe trọn không ngắt lời'},
         {ten:'Ngôn ngữ mới trong nhà', tu:7, den:12, buoi:1, muc:'Thay câu ra lệnh bằng câu mời', cong:'Danh sách câu thay được dùng'},
         {ten:'Họp nhà 15 phút', tu:13, den:19, buoi:1, muc:'Một cuộc họp ngắn, đều, có biên bản', cong:'Họp nhà ≥ 2 lần'},
         {ten:'Thoả thuận chung', tu:20, den:25, buoi:1, muc:'Thoả thuận thiết bị, không gian, giờ giấc', cong:'Thoả thuận cả nhà ký'},
         {ten:'Nghi thức kết nối', tu:26, den:30, buoi:1, muc:'Một nghi thức riêng của nhà', cong:'Nghi thức chạy ≥ 4 lần'} ],
    kpi:[['Họp nhà','≥ 4 lần'],['Xung đột tự báo giảm','≥ 30%'],['Cảm xúc trung bình','≥ 3,5/5']],
    vao:'Phân tích có vấn đề kết nối từ mức 2', ra:'Đạt KPI → về chương trình chính', capCoach:'R07' },

  { ma:'MUC-TIEU-45', ten:'Định hướng & mục tiêu 45 ngày', tang:[2,3,4], ngay:45, loai:'chuyen-de', c:'#0B6675',
    doiTuong:'Con chưa có mục tiêu của chính mình', mien:['G','I','T'],
    muc:'Đi đủ bốn trụ để con có một mục tiêu là của con, và một lộ trình 90 ngày để đi tới nó.',
    gd:[ {ten:'Điều con muốn (G)', tu:1, den:7, buoi:1, muc:'Tách mong muốn của con khỏi mong muốn của người lớn', cong:'Con tự nói mục tiêu bằng lời của mình'},
         {ten:'Nội lực (I)', tu:8, den:14, buoi:1, muc:'Vì sao điều đó quan trọng với con', cong:'Ba lý do của chính con'},
         {ten:'Bản đồ điểm mạnh (T)', tu:15, den:21, buoi:1, muc:'Con mạnh ở đâu, cách nào hợp với con', cong:'Ba điểm mạnh có ví dụ thật'},
         {ten:'Lộ trình hành động (A)', tu:22, den:28, buoi:1, muc:'Kế hoạch 90 ngày theo 20/80', cong:'Kế hoạch có mốc tuần'},
         {ten:'Thử 14 ngày', tu:29, den:42, buoi:1, muc:'Chạy thử, đo, chỉnh', cong:'Chạy ≥ 10/14 ngày'},
         {ten:'Chốt & cam kết', tu:43, den:45, buoi:1, muc:'Cam kết cả nhà', cong:'Bản cam kết ký'} ],
    kpi:[['Mục tiêu do chính con nói','có'],['Kế hoạch 90 ngày','có mốc tuần'],['Ngày chạy thử','≥ 10/14']],
    vao:'Phân tích trụ G từ mức 2', ra:'Có lộ trình → Kiến tạo / Chuyển hoá', capCoach:'R07' },

  { ma:'CAN-THIEP-14', ten:'Can thiệp nhanh 14 ngày (đèn đỏ)', tang:[1,2,3,4,5], ngay:14, loai:'can-thiep', c:'#BE0E16',
    doiTuong:'Nhà đèn đỏ, im lặng ≥ 7 ngày, hoặc có sự cố', mien:['I','A'],
    muc:'Gọi trong 24 giờ, ổn định trước, tìm nút thắt cấp, kế hoạch 7 ngày nhỏ, đưa nhà về đèn vàng/xanh.',
    gd:[ {ten:'Gọi & ổn định', tu:1, den:2, buoi:1, muc:'Gọi trong 24 giờ, nghe trước, không nhắc bài', cong:'Đã gọi, có biên bản'},
         {ten:'Nút thắt cấp', tu:3, den:5, buoi:1, muc:'Tìm điều đang chặn ngay lúc này', cong:'Nút thắt được gọi tên'},
         {ten:'Kế hoạch 7 ngày nhỏ', tu:6, den:12, buoi:1, muc:'Một việc nhỏ mỗi ngày, chắc làm được', cong:'≥ 5/7 ngày có việc xong'},
         {ten:'Đánh giá & trả về', tu:13, den:14, buoi:1, muc:'Đèn đã về chưa, trả về chương trình chính', cong:'Đèn vàng/xanh'} ],
    kpi:[['Gọi trong 24 giờ','100%'],['Đèn về vàng/xanh trong 14 ngày','≥ 80% số nhà']],
    vao:'Đèn đỏ hoặc sự cố mở', ra:'Đèn vàng/xanh → chương trình chính', capCoach:'R06' },

  { ma:'PHU-HUYNH-8T', ten:'Phụ huynh đồng hành 8 tuần', tang:[1,2,3,4], ngay:56, loai:'chuyen-de', c:'#5140B4',
    doiTuong:'Cha mẹ muốn đồng hành đúng cách', mien:['I','A'],
    muc:'Tám buổi hằng tuần cho cha mẹ: vai trò, ngôn ngữ, kỷ luật tích cực, đồng hành học, cảm xúc, thói quen, đo tại nhà, tự vận hành.',
    gd:[ {ten:'Vai trò & ngôn ngữ', tu:1, den:14, buoi:2, muc:'Cha mẹ là người đi cùng, không phải người làm thay', cong:'Nhật ký tuần 1–2'},
         {ten:'Kỷ luật tích cực & đồng hành học', tu:15, den:28, buoi:2, muc:'Giới hạn rõ, không la mắng', cong:'Một thoả thuận được giữ 7 ngày'},
         {ten:'Cảm xúc & thói quen gia đình', tu:29, den:42, buoi:2, muc:'Gọi tên cảm xúc, dựng nếp nhà', cong:'Nếp nhà chạy ≥ 10/14 ngày'},
         {ten:'Đo tại nhà & tự vận hành', tu:43, den:56, buoi:2, muc:'Cha mẹ tự đo và tự chỉnh', cong:'Bảng đo tại nhà 14 ngày'} ],
    kpi:[['Buổi cha mẹ tham gia','≥ 6/8'],['Nhật ký tuần','≥ 6/8']],
    vao:'Cha mẹ đăng ký', ra:'Đạt KPI · cấp chứng nhận phụ huynh đồng hành', capCoach:'R08' }
];

/* ══════════ 2 · SÁU NHỊP MỘT BUỔI (khung mặc định) ══════════ */
G.CO_NHIP = [
  { no:1, ten:'Kết nối & soi cảm xúc', phut:5,  c:'#185AB4', lam:'Hỏi thăm, đo cảm xúc 1–5 của từng người, nhắc mục tiêu buổi.', hoi:'Hôm nay mỗi người đang ở mức mấy trên năm?', tranh:'Vào bài ngay khi nhà còn căng.' },
  { no:2, ten:'Soi nhiệm vụ & bằng chứng', phut:10, c:'#2A72C6', lam:'Xem nhiệm vụ buổi trước bằng minh chứng, ghi đạt / chưa đạt.', hoi:'Mình xem bằng chứng của việc tuần trước nhé — điều gì đã chạy?', tranh:'Khen hay chê khi chưa nhìn bằng chứng.' },
  { no:3, ten:'Chẩn đoán nút thắt', phut:15, c:'#0B6675', lam:'Soi theo bốn trụ G–I–T–A, gọi tên nút thắt thật, có căn cứ.', hoi:'Lúc việc ấy không chạy, chuyện gì xảy ra ngay trước đó?', tranh:'Kết luận nguyên nhân thay cho gia đình.' },
  { no:4, ten:'Dẫn dắt & cùng tìm giải pháp', phut:15, c:'#0B7350', lam:'Để gia đình tự đưa ra phương án; Coach chỉ hỏi và soi.', hoi:'Nếu chỉ đổi một điều nhỏ tuần này, nhà mình chọn điều gì?', tranh:'Làm thay, đưa đáp án sẵn.' },
  { no:5, ten:'Giao nhiệm vụ vừa sức', phut:10, c:'#B4720F', lam:'Tối đa ba nhiệm vụ, mỗi việc có tiêu chí xong, hạn và loại minh chứng.', hoi:'Làm sao mình biết việc này đã xong?', tranh:'Giao nhiều việc, việc mơ hồ, không hạn.' },
  { no:6, ten:'Chốt cam kết & đo', phut:5,  c:'#5140B4', lam:'Mỗi người nói lại cam kết, chấm buổi 1–5, hẹn buổi sau.', hoi:'Một điều mỗi người mang về từ buổi hôm nay là gì?', tranh:'Kết thúc mà không ai nói lại việc của mình.' }
];

/* ══════════ 3 · CHẤT LƯỢNG BUỔI COACH ══════════
   Mỗi tiêu chí 0–4. m4 = chuẩn mẫu · m0 = dấu hiệu không đạt. */
G.CO_TC = [
  { ma:'chuan-bi', ten:'Chuẩn bị trước buổi', m4:'Đọc hồ sơ, nhiệm vụ cũ, đèn nhà; có giáo cụ đúng chủ đề', m0:'Vào buổi không biết nhà đang ở đâu' },
  { ma:'muc-tieu', ten:'Mục tiêu buổi đo được', m4:'Một mục tiêu có hành vi và con số cụ thể, nói rõ đầu buổi', m0:'Không nêu mục tiêu hoặc mục tiêu mơ hồ' },
  { ma:'du-nhip', ten:'Đi đủ sáu nhịp', m4:'Đủ sáu nhịp, đúng thứ tự, thời lượng hợp lý', m0:'Nhảy cóc, bỏ soi bằng chứng hoặc bỏ chốt' },
  { ma:'ngon-ngu', ten:'Lắng nghe & chuẩn ngôn ngữ', m4:'Nghe hết câu, câu hỏi mở, không phán xét, không so sánh', m0:'Ngắt lời, dạy đời, dùng câu cấm' },
  { ma:'chan-doan', ten:'Chẩn đoán đúng nút thắt', m4:'Gọi tên nút thắt theo G–I–T–A, có căn cứ từ dữ liệu', m0:'Đoán nguyên nhân, không căn cứ' },
  { ma:'tu-tim', ten:'Gia đình tự tìm giải pháp', m4:'Phương án đến từ gia đình; Coach chỉ hỏi và soi', m0:'Coach đưa đáp án, làm thay' },
  { ma:'nhiem-vu', ten:'Nhiệm vụ vừa sức, rõ ràng', m4:'≤ 3 việc, mỗi việc có tiêu chí xong, hạn, loại minh chứng', m0:'Việc mơ hồ, quá sức, không hạn' },
  { ma:'nghiem-thu', ten:'Nghiệm thu bằng bằng chứng', m4:'Xét đạt / chưa đạt dựa trên minh chứng, ghi rõ', m0:'Nghiệm thu theo cảm nhận' },
  { ma:'ghi-so', ten:'Ghi sổ trong 24 giờ', m4:'Nhật ký buổi, nhiệm vụ, minh chứng cập nhật trong 24 giờ', m0:'Quá 48 giờ chưa ghi' },
  { ma:'dung-nhip', ten:'Đúng nhịp & đúng giờ', m4:'Buổi đúng lịch cadence, bắt đầu và kết thúc đúng giờ', m0:'Dời buổi không báo, trễ giờ' }
];
G.CO_LANRANH = [
  { ma:'hua', ten:'Hứa kết quả không đo được' },
  { ma:'lam-thay', ten:'Làm thay việc của gia đình / học viên' },
  { ma:'tien', ten:'Nhận hoặc bàn chuyện tiền ngoài quy trình' },
  { ma:'lo-tt', ten:'Để lộ thông tin gia đình ra ngoài hệ' },
  { ma:'phan-xet', ten:'Phán xét, so sánh, làm tổn thương con' }
];
/* Băng điểm chất lượng (CQI 0–100) */
G.CO_BANG = [
  { tu:85, ten:'Xuất sắc', den:'XANH' }, { tu:70, ten:'Đạt chuẩn', den:'XANH' },
  { tu:55, ten:'Cần kèm', den:'VANG' }, { tu:0, ten:'Dưới chuẩn', den:'DO' }
];

/* ══════════ 4 · HOẠT ĐỘNG ĐO ĐƯỢC ══════════
   ai: 'nha' (gia đình làm) · 'coach' (Coach làm). Hoạt động của nhà mới
   tính vào "im lặng", "nhịp đều" và điểm gắn kết. gt: kiểu giá trị. */
G.CO_HD = [
  { ma:'nv_xong',    ten:'Hoàn thành nhiệm vụ',  ai:'nha',   ic:'check',    gt:'nv' },
  { ma:'minh_chung', ten:'Nộp minh chứng',       ai:'nha',   ic:'eye',      gt:'' },
  { ma:'tick_nhip',  ten:'Tick việc hôm nay',    ai:'nha',   ic:'pulse',    gt:'' },
  { ma:'nhat_ky',    ten:'Ghi nhật ký',          ai:'nha',   ic:'edit',     gt:'' },
  { ma:'doc_tl',     ten:'Đọc / xem tài liệu',   ai:'nha',   ic:'book',     gt:'' },
  { ma:'bai_test',   ten:'Làm bài test',         ai:'nha',   ic:'target',   gt:'diem' },
  { ma:'cam_xuc',    ten:'Báo cảm xúc (1–5)',    ai:'nha',   ic:'heart',    gt:'1-5' },
  { ma:'phan_hoi',   ten:'Chấm buổi coach (1–5)', ai:'nha',  ic:'star',     gt:'1-5' },
  { ma:'cam_ket',    ten:'Đưa ra cam kết mới',   ai:'nha',   ic:'seed',     gt:'' },
  { ma:'nha_nhan',   ten:'Nhà chủ động nhắn / gọi', ai:'nha', ic:'chat',    gt:'' },
  { ma:'su_kien',    ten:'Dự sự kiện / lớp',     ai:'nha',   ic:'calendar', gt:'' },
  { ma:'nv_giao',    ten:'Giao nhiệm vụ',        ai:'coach', ic:'list',     gt:'nv' },
  { ma:'lien_he',    ten:'Coach chạm (nhắn · gọi · wow)', ai:'coach', ic:'bell', gt:'kieu' },
  { ma:'cong_dat',   ten:'Đạt cổng nghiệm thu',  ai:'coach', ic:'shield',   gt:'' },
  { ma:'su_co',      ten:'Mở sự cố',             ai:'coach', ic:'alert',    gt:'' },
  { ma:'su_co_dong', ten:'Đóng sự cố',           ai:'coach', ic:'check',    gt:'' },
  { ma:'ghi_chu',    ten:'Ghi chú Coach',        ai:'coach', ic:'quote',    gt:'' }
];
/* Trọng số điểm gắn kết 0–100 (phần thiếu dữ liệu thì chia lại) */
G.CO_TRONGSO = { thamGia:30, nhiemVu:30, minhChung:15, nhipDeu:15, haiLong:10 };

/* ══════════ 5 · PHÂN TÍCH VẤN ĐỀ – NHU CẦU – TIỀM NĂNG ══════════
   Vấn đề neo theo bốn trụ của G.GITA. Mức 0 không có · 1 nhẹ · 2 rõ · 3 nặng. */
G.CO_VD = [
  { ma:'g-mo-ho',    tru:'G', ten:'Không có mục tiêu rõ ràng' },
  { ma:'g-nguoi-lon',tru:'G', ten:'Mục tiêu là của người lớn, không phải của con' },
  { ma:'g-ngan-han', tru:'G', ten:'Chỉ nhìn điểm số trước mắt' },
  { ma:'g-lech',     tru:'G', ten:'Cha mẹ và con kỳ vọng lệch nhau' },
  { ma:'g-dinh-huong',tru:'G', ten:'Mơ hồ về định hướng học tập / nghề' },
  { ma:'i-dong-luc', tru:'I', ten:'Thiếu động lực, học vì bị nhắc' },
  { ma:'i-niem-tin', tru:'I', ten:'Không tin mình làm được' },
  { ma:'i-so-sai',   tru:'I', ten:'Sợ sai, sợ bị chê, né việc khó' },
  { ma:'i-cam-xuc',  tru:'I', ten:'Cảm xúc dễ vỡ, căng thẳng, cáu gắt' },
  { ma:'i-buong',    tru:'I', ten:'Dễ buông khi gặp khó' },
  { ma:'t-phuong-phap',tru:'T', ten:'Không biết cách học hiệu quả' },
  { ma:'t-tap-trung',tru:'T', ten:'Khó tập trung, dễ xao nhãng' },
  { ma:'t-diem-manh',tru:'T', ten:'Chưa biết điểm mạnh của mình' },
  { ma:'t-hong-goc', tru:'T', ten:'Hổng kiến thức nền' },
  { ma:'t-quan-ly',  tru:'T', ten:'Không biết quản lý thời gian' },
  { ma:'a-tri-hoan', tru:'A', ten:'Trì hoãn, nước đến chân mới nhảy' },
  { ma:'a-thiet-bi', tru:'A', ten:'Lệ thuộc điện thoại / thiết bị' },
  { ma:'a-xung-dot', tru:'A', ten:'Xung đột cha mẹ – con, ít nói chuyện' },
  { ma:'a-nep-nha',  tru:'A', ten:'Nhà không có nếp, giờ giấc lộn xộn' },
  { ma:'a-moi-truong',tru:'A', ten:'Môi trường học nhiều nhiễu, bạn bè kéo lùi' }
];
G.CO_NC = [
  { ma:'ket-qua', ten:'Cải thiện kết quả học tập' }, { ma:'thoi-quen', ten:'Thói quen học đều, tự giác' },
  { ma:'dong-luc', ten:'Khơi động lực bên trong' }, { ma:'dinh-huong', ten:'Định hướng mục tiêu / nghề' },
  { ma:'ket-noi', ten:'Kết nối cha mẹ – con' }, { ma:'thiet-bi', ten:'Quản lý thiết bị' },
  { ma:'cam-xuc', ten:'Vững vàng cảm xúc' }, { ma:'tu-hoc', ten:'Kỹ năng tự học' },
  { ma:'nhip-song', ten:'Nhịp sống, sức khoẻ, giấc ngủ' }, { ma:'giao-tiep', ten:'Giao tiếp, tự tin' },
  { ma:'thi-cu', ten:'Vượt kỳ thi quan trọng' }, { ma:'phu-huynh', ten:'Cha mẹ biết cách đồng hành' }
];
G.CO_TN = [
  { ma:'diem-manh', ten:'Điểm mạnh nổi bật của con' }, { ma:'cam-ket-pm', ten:'Cam kết của cha mẹ' },
  { ma:'thoi-gian', ten:'Thời gian dành cho chương trình' }, { ma:'moi-truong', ten:'Môi trường gia đình nâng đỡ' },
  { ma:'tai-nguyen', ten:'Tài nguyên học tập sẵn có' }, { ma:'thanh-tich', ten:'Nền tảng / thành tích đã có' },
  { ma:'ho-tro', ten:'Người hỗ trợ quanh con (thầy, bạn, họ hàng)' }, { ma:'to-mo', ten:'Sự tò mò, ham học của con' }
];
G.CO_SS = [
  { ma:0, ten:'Chưa nghĩ tới', mo:'Chưa thấy vấn đề — bắt đầu bằng Nhận diện, chưa giao việc nặng.' },
  { ma:1, ten:'Đang cân nhắc', mo:'Thấy vấn đề nhưng còn do dự — soi lợi ích, việc thật nhỏ.' },
  { ma:2, ten:'Chuẩn bị', mo:'Muốn đổi, cần kế hoạch — cam kết rõ, mốc gần.' },
  { ma:3, ten:'Đang hành động', mo:'Đang làm — giữ nhịp, nghiệm thu đều, qua ngày 8–12.' },
  { ma:4, ten:'Duy trì', mo:'Đã có nếp — giảm hỗ trợ, chuyển giao.' }
];
/* Nhu cầu → chương trình nên ghép (máy gợi ý, Coach quyết) */
G.CO_NC_CT = { 'thoi-quen':'THOI-QUEN-21', 'thiet-bi':'THOI-QUEN-21', 'ket-noi':'KET-NOI-30', 'giao-tiep':'KET-NOI-30',
  'dinh-huong':'MUC-TIEU-45', 'dong-luc':'MUC-TIEU-45', 'phu-huynh':'PHU-HUYNH-8T', 'cam-xuc':'KET-NOI-30' };

/* ══════════ 6 · GIẢI PHÁP COACH ══════════
   vd: mã vấn đề mà giải pháp gỡ (để máy gợi ý từ phân tích) · cong: [màn, nhãn] */
G.CO_GP = [
  /* ── G · MỤC TIÊU ── */
  { ma:'GP-G1', tru:'G', ten:'Ba câu hỏi tách mục tiêu của con', vd:['g-nguoi-lon','g-lech'], tang:[1,2], ngay:7,
    muc:'Con nói được một mục tiêu bằng lời của chính mình, cha mẹ nghe mà không sửa.',
    buoc:['Hỏi riêng con: "Nếu không ai chấm điểm, con muốn giỏi điều gì?"','Hỏi riêng cha mẹ cùng câu ấy cho con','Đặt hai câu trả lời cạnh nhau, gọi tên chỗ trùng và chỗ lệch','Con chọn một điểm trùng làm mục tiêu thử 7 ngày'],
    cong:[['lo-trinh','Lộ trình T1 → T5'],['tam-nhin','Tầm nhìn']],
    nv:[{ten:'Con viết một mục tiêu bằng lời của mình', xong:'Có câu viết tay hoặc ghi âm', ngay:2},{ten:'Cha mẹ nghe và chỉ hỏi lại, không sửa', xong:'Nhật ký cha mẹ ghi lại câu con nói', ngay:3}],
    dau:['Con dùng chữ "con muốn" thay cho "bố mẹ bảo"','Mục tiêu có một hành vi cụ thể'], canh:'Con im lặng hoàn toàn sau 2 buổi → chuyển trụ I (niềm tin) trước.' },
  { ma:'GP-G2', tru:'G', ten:'Bậc thang mục tiêu 90 – 21 – 7', vd:['g-mo-ho','g-ngan-han'], tang:[2,3], ngay:21,
    muc:'Một mục tiêu 90 ngày được chẻ thành mốc 21 ngày và việc 7 ngày.',
    buoc:['Viết đích 90 ngày bằng kết quả đo được','Chẻ thành 4 mốc 21 ngày','Chọn mốc đầu, chẻ thành 3 việc tuần này','Gắn mỗi việc một dấu hiệu xong'],
    cong:[['chu-ky','Chu kỳ 21 / 90 ngày'],['nhiem-vu','Nhiệm vụ & Nhật ký']],
    nv:[{ten:'Hoàn thành bậc thang 90–21–7', xong:'Bản bậc thang có đủ 3 tầng', ngay:3}],
    dau:['Việc tuần có hạn và minh chứng','Con tự kể được mốc tiếp theo'], canh:'Mốc 21 ngày trượt 2 lần → soi lại trụ T (cách làm).' },
  { ma:'GP-G3', tru:'G', ten:'Bàn tròn kỳ vọng ba người', vd:['g-lech','g-nguoi-lon'], tang:[1,2,3], ngay:14,
    muc:'Cha, mẹ, con thống nhất một kỳ vọng chung, có số đo.',
    buoc:['Mỗi người viết riêng 3 kỳ vọng','Coach đọc to, không bình luận','Xếp hạng chung, giữ 1–2 kỳ vọng','Ký bản kỳ vọng chung, hẹn xem lại sau 14 ngày'],
    cong:[['ban-do','Bản đồ gia đình']], nv:[{ten:'Ký bản kỳ vọng chung', xong:'Ảnh bản ký của ba người', ngay:5}],
    dau:['Giảm câu "con phải" trong nhật ký cha mẹ'], canh:'Cha mẹ bất đồng gay gắt với nhau → buổi riêng cho cha mẹ trước.' },
  { ma:'GP-G4', tru:'G', ten:'Khám phá nghề qua ba người thật', vd:['g-dinh-huong'], tang:[2,3,4], ngay:30,
    muc:'Con gặp ba người làm nghề con quan tâm, ghi lại điều thật về nghề.',
    buoc:['Con chọn 3 nghề tò mò','Tìm 3 người thật (họ hàng, Đại sứ, cựu học viên)','Chuẩn bị 5 câu hỏi','Phỏng vấn 20 phút, ghi lại','Con tự rút ra điều mình hợp / không hợp'],
    cong:[['ket-noi','Kết nối'],['su-kien','Sự kiện']], nv:[{ten:'Một buổi phỏng vấn người làm nghề', xong:'Bản ghi 5 câu trả lời', ngay:10}],
    dau:['Con nói được một điều mới về nghề mà sách không có'], canh:'Con không muốn gặp ai → hạ xuống xem video phỏng vấn trước.' },
  { ma:'GP-G5', tru:'G', ten:'Đổi "điểm số" thành "năng lực"', vd:['g-ngan-han'], tang:[2,3], ngay:21,
    muc:'Nhà theo dõi một năng lực (đọc hiểu, tự học…) thay vì chỉ điểm thi.',
    buoc:['Chọn một năng lực gắn với môn yếu','Định nghĩa hành vi quan sát được của năng lực ấy','Đo baseline 7 ngày','Đặt mục tiêu tăng 20% trong 21 ngày'],
    cong:[['bo-test','Bộ test nhận diện 5 tầng']], nv:[{ten:'Đo baseline năng lực 7 ngày', xong:'Bảng đo đủ 7 ngày', ngay:7}],
    dau:['Cha mẹ hỏi về năng lực thay vì hỏi điểm'], canh:'Có kỳ thi lớn trong 2 tuần → tạm ưu tiên kế hoạch thi.' },
  { ma:'GP-G6', tru:'G', ten:'Bản tầm nhìn gia đình một trang', vd:['g-mo-ho','g-lech'], tang:[3,4,5], ngay:14,
    muc:'Gia đình có một trang tầm nhìn chung treo trong nhà.',
    buoc:['Mỗi người viết điều mong nhà mình có sau 1 năm','Gộp thành 3 câu chung','Vẽ hoặc in thành một trang','Đọc lại trong họp nhà hằng tuần'],
    cong:[['tam-nhin','Tầm nhìn'],['ngoi-nha','Ngôi nhà thịnh vượng']], nv:[{ten:'Treo bản tầm nhìn trong nhà', xong:'Ảnh bản tầm nhìn đã treo', ngay:7}],
    dau:['Họp nhà nhắc tới tầm nhìn'], canh:'—' },

  /* ── I · NỘI LỰC ── */
  { ma:'GP-I1', tru:'I', ten:'Nhật ký ba điều làm được', vd:['i-niem-tin','i-so-sai'], tang:[1,2,3], ngay:21,
    muc:'Con thấy bằng chứng mình làm được, mỗi ngày.',
    buoc:['Mỗi tối con ghi 3 điều làm được, dù nhỏ','Cha mẹ đọc và chỉ nói "bố/mẹ thấy rồi"','Cuối tuần đọc lại cả tuần','Coach hỏi: điều gì lặp lại?'],
    cong:[['nhiem-vu','Nhiệm vụ & Nhật ký']], nv:[{ten:'Ghi 3 điều làm được mỗi tối', xong:'≥ 5/7 ngày có ghi', ngay:7}],
    dau:['Con tự kể điều làm được không cần hỏi','Câu "con không làm được" giảm'], canh:'Con ghi toàn điều tiêu cực → kiểm tra cảm xúc, cân nhắc chuyên gia.' },
  { ma:'GP-I2', tru:'I', ten:'Thang động lực 1–10 và một bước +1', vd:['i-dong-luc','i-buong'], tang:[1,2,3], ngay:14,
    muc:'Con tự đo động lực và tự chọn một việc nâng thêm 1 điểm.',
    buoc:['Con chấm động lực hiện tại 1–10','Hỏi: vì sao không thấp hơn?','Hỏi: điều gì giúp tăng 1 điểm?','Biến điều đó thành nhiệm vụ 3 ngày'],
    cong:[['kpi-toi','KPI của tôi']], nv:[{ten:'Làm "bước +1" do con chọn', xong:'Con chấm lại thang sau 3 ngày', ngay:3}],
    dau:['Điểm tự chấm tăng hoặc giữ'], canh:'Điểm ≤ 2 hai lần liền → soi cảm xúc, có thể mở Can thiệp nhanh.' },
  { ma:'GP-I3', tru:'I', ten:'Thí nghiệm "sai cho phép"', vd:['i-so-sai'], tang:[2,3], ngay:7,
    muc:'Con thử một việc khó với luật: sai là dữ liệu, không bị chê.',
    buoc:['Cả nhà thống nhất luật: tuần này không chê lỗi','Con chọn một bài khó hơn sức một chút','Ghi lỗi sai và điều học được','Coach khen quá trình, không khen kết quả'],
    cong:[['minh-chung','Minh chứng nhiệm vụ']], nv:[{ten:'Thử 3 bài khó, ghi lỗi và điều học được', xong:'Bảng lỗi – điều học được', ngay:7}],
    dau:['Con dám nộp bài chưa chắc đúng'], canh:'Cha mẹ phá luật "không chê" → buổi riêng cho cha mẹ.' },
  { ma:'GP-I4', tru:'I', ten:'Gọi tên cảm xúc – bánh xe 6 màu', vd:['i-cam-xuc'], tang:[1,2,3,4], ngay:14,
    muc:'Mỗi người trong nhà gọi tên được cảm xúc trước khi phản ứng.',
    buoc:['Giới thiệu 6 cảm xúc gốc','Mỗi tối mỗi người chọn một màu','Khi căng, dừng 10 giây và nói tên cảm xúc','Cuối tuần xem màu nào nhiều nhất'],
    cong:[['thoi-quen','Thói quen']], nv:[{ten:'Báo cảm xúc mỗi tối', xong:'≥ 5/7 ngày có báo', ngay:7}],
    dau:['Giảm số lần to tiếng trong tuần'], canh:'Dấu hiệu tổn thương sâu, tự hại → dừng coaching, chuyển chuyên gia ngay.' },
  { ma:'GP-I5', tru:'I', ten:'Câu chuyện người đi trước', vd:['i-dong-luc','i-niem-tin'], tang:[1,2,3], ngay:7,
    muc:'Con nghe câu chuyện thật của người từng ở đúng chỗ con đang đứng.',
    buoc:['Chọn câu chuyện cựu học viên cùng nút thắt','Con đọc / xem','Hỏi: điểm nào giống con?','Con chọn một việc người ấy từng làm để thử'],
    cong:[['vinh-danh','Vinh danh'],['thu-vien','Thư viện tài liệu']], nv:[{ten:'Đọc một câu chuyện và chọn một việc thử', xong:'Con kể lại bằng lời mình', ngay:4}],
    dau:['Con nhắc lại câu chuyện ở buổi sau'], canh:'—' },
  { ma:'GP-I6', tru:'I', ten:'Phần thưởng đúng nhịp', vd:['i-dong-luc','i-buong'], tang:[2,3], ngay:21,
    muc:'Phần thưởng gắn với nỗ lực đều, không gắn với điểm số.',
    buoc:['Cùng con chọn 3 phần thưởng không phải tiền','Gắn với chuỗi ngày giữ nhịp (5 – 10 – 21)','Trao đúng hẹn, không trao sớm','Sau 21 ngày giảm dần phần thưởng'],
    cong:[['phan-thuong','Phần thưởng']], nv:[{ten:'Giữ chuỗi 5 ngày đầu tiên', xong:'Bảng chuỗi có 5 ô liền', ngay:5}],
    dau:['Chuỗi ngày dài dần'], canh:'Con chỉ làm khi có thưởng sau 21 ngày → chuyển sang GP-G1.' },

  /* ── T · NĂNG LỰC ── */
  { ma:'GP-T1', tru:'T', ten:'Phiên học 25 – 5 có mục tiêu', vd:['t-tap-trung','t-phuong-phap'], tang:[1,2,3], ngay:14,
    muc:'Con học theo phiên ngắn, mỗi phiên một mục tiêu nhỏ.',
    buoc:['Viết mục tiêu phiên trước khi học','Học 25 phút, máy để phòng khác','Nghỉ 5 phút đúng giờ','Cuối phiên tự chấm đạt / chưa'],
    cong:[['thoi-quen','Thói quen'],['nhiem-vu','Nhiệm vụ & Nhật ký']], nv:[{ten:'Hai phiên 25–5 mỗi ngày', xong:'Bảng phiên có mục tiêu và tự chấm', ngay:7}],
    dau:['Số phiên đạt mục tiêu tăng'], canh:'Không ngồi nổi 10 phút → kiểm tra giấc ngủ, sức khoẻ trước.' },
  { ma:'GP-T2', tru:'T', ten:'Bản đồ điểm mạnh từ ba nguồn', vd:['t-diem-manh'], tang:[1,2,3], ngay:14,
    muc:'Con biết ba điểm mạnh có ví dụ thật, từ chính con, cha mẹ và thầy cô.',
    buoc:['Con tự liệt kê 5 điều mình làm tốt','Cha mẹ và một thầy cô liệt kê riêng','Tìm điểm trùng','Gắn mỗi điểm mạnh một ví dụ thật'],
    cong:[['chan-dung-nha','Chân dung nhà']], nv:[{ten:'Thu ý kiến điểm mạnh từ thầy cô', xong:'Có danh sách của thầy cô', ngay:7}],
    dau:['Con dùng điểm mạnh để gỡ môn yếu'], canh:'—' },
  { ma:'GP-T3', tru:'T', ten:'Lấp hổng nền theo 20/80', vd:['t-hong-goc'], tang:[2,3,4], ngay:30,
    muc:'Lấp 20% kiến thức nền gây ra 80% lỗi sai.',
    buoc:['Gom lỗi sai 3 bài kiểm gần nhất','Phân loại theo phần kiến thức','Chọn 2 phần gây nhiều lỗi nhất','Lịch ôn 30 phút/ngày cho 2 phần ấy','Kiểm lại sau 2 tuần'],
    cong:[['khoa-dao-tao','Khoá đào tạo'],['bo-test','Bộ test']], nv:[{ten:'Phân loại lỗi sai 3 bài kiểm', xong:'Bảng phân loại lỗi', ngay:4}],
    dau:['Lỗi lặp lại giảm ở bài kiểm sau'], canh:'Hổng quá rộng → phối hợp Giáo viên lập lớp kèm.' },
  { ma:'GP-T4', tru:'T', ten:'Kế hoạch tuần 3 việc chính', vd:['t-quan-ly','a-tri-hoan'], tang:[2,3,4], ngay:21,
    muc:'Mỗi tuần con chọn 3 việc chính, xếp lịch trước.',
    buoc:['Chủ nhật: con chọn 3 việc chính','Xếp mỗi việc vào khung giờ cụ thể','Giữa tuần soi lại 5 phút','Cuối tuần tự chấm và rút kinh nghiệm'],
    cong:[['lo-trinh','Lộ trình'],['nhiem-vu','Nhiệm vụ']], nv:[{ten:'Lập kế hoạch tuần 3 việc chính', xong:'Ảnh kế hoạch tuần', ngay:2}],
    dau:['Con tự lập kế hoạch không cần nhắc'], canh:'—' },
  { ma:'GP-T5', tru:'T', ten:'Tự giảng lại (Feynman 5 phút)', vd:['t-phuong-phap'], tang:[2,3,4,5], ngay:14,
    muc:'Con hiểu sâu bằng cách giảng lại cho người nhà trong 5 phút.',
    buoc:['Sau mỗi bài, con giảng lại 5 phút','Người nghe chỉ hỏi "vì sao?"','Chỗ vấp là chỗ cần học lại','Ghi chỗ vấp vào sổ'],
    cong:[['nhiem-vu','Nhiệm vụ']], nv:[{ten:'Ba lần giảng lại trong tuần', xong:'Sổ chỗ vấp có 3 mục', ngay:7}],
    dau:['Con giải thích được bằng ví dụ của mình'], canh:'—' },
  { ma:'GP-T6', tru:'T', ten:'Góc học không nhiễu', vd:['t-tap-trung','a-moi-truong'], tang:[1,2,3], ngay:7,
    muc:'Con có một góc học cố định, ít nhiễu, đủ dụng cụ.',
    buoc:['Chọn một chỗ cố định','Bỏ khỏi bàn mọi thứ không dùng','Máy để ngoài phòng khi học','Chụp ảnh trước – sau'],
    cong:[['minh-chung','Minh chứng']], nv:[{ten:'Dựng góc học, chụp trước – sau', xong:'Hai ảnh trước – sau', ngay:3}],
    dau:['Thời gian ngồi học liền mạch tăng'], canh:'—' },

  /* ── A · HÀNH ĐỘNG & MÔI TRƯỜNG ── */
  { ma:'GP-A1', tru:'A', ten:'Quy tắc 2 phút để bắt đầu', vd:['a-tri-hoan'], tang:[1,2,3], ngay:14,
    muc:'Phá trì hoãn bằng cách chỉ cam kết bắt đầu 2 phút.',
    buoc:['Chọn việc hay trì hoãn nhất','Cam kết làm đúng 2 phút','Sau 2 phút được quyền dừng','Ghi lại bao nhiêu lần làm tiếp quá 2 phút'],
    cong:[['hom-nay','Hôm nay']], nv:[{ten:'Áp dụng quy tắc 2 phút mỗi ngày', xong:'Bảng ghi 7 ngày', ngay:7}],
    dau:['Số lần bắt đầu đúng giờ tăng'], canh:'—' },
  { ma:'GP-A2', tru:'A', ten:'Thoả thuận thiết bị cả nhà', vd:['a-thiet-bi'], tang:[1,2,3], ngay:21,
    muc:'Cả nhà (kể cả người lớn) có thoả thuận thiết bị và giữ được.',
    buoc:['Cả nhà ghi giờ dùng máy thật trong 3 ngày','Họp nhà: chọn giờ không máy chung','Viết thoả thuận, người lớn làm gương','Xem lại sau 7 và 21 ngày'],
    cong:[['bang-so','Bảng số nhà mình']], nv:[{ten:'Ghi giờ dùng máy 3 ngày', xong:'Bảng giờ của mọi người', ngay:3},{ten:'Ký thoả thuận thiết bị', xong:'Ảnh bản thoả thuận', ngay:7}],
    dau:['Giờ dùng máy giảm','Cha mẹ cũng giữ thoả thuận'], canh:'Con phản ứng dữ dội → hạ mức, bắt đầu bằng 1 giờ không máy.' },
  { ma:'GP-A3', tru:'A', ten:'Họp nhà 15 phút mỗi tuần', vd:['a-xung-dot','a-nep-nha'], tang:[1,2,3,4,5], ngay:28,
    muc:'Nhà có một cuộc họp ngắn, đều, ai cũng được nói.',
    buoc:['Cố định giờ họp','Ba phần: điều tốt tuần qua – điều vướng – việc tuần tới','Mỗi người nói, không ngắt lời','Ghi biên bản 3 dòng'],
    cong:[['thoi-quen','Thói quen'],['ban-do','Bản đồ gia đình']], nv:[{ten:'Một buổi họp nhà có biên bản', xong:'Ảnh biên bản 3 dòng', ngay:7}],
    dau:['Họp đều 4 tuần','Con chủ động đưa chủ đề'], canh:'Họp biến thành buổi trách móc → Coach dự một buổi.' },
  { ma:'GP-A4', tru:'A', ten:'Nếp nhà buổi tối', vd:['a-nep-nha'], tang:[1,2,3], ngay:21,
    muc:'Buổi tối có trình tự cố định: ăn – học – nghỉ – ngủ.',
    buoc:['Viết trình tự buổi tối hiện tại','Chọn một chỗ hay vỡ','Đặt mốc giờ cho chỗ ấy','Giữ 21 ngày, tick mỗi tối'],
    cong:[['hom-nay','Hôm nay'],['chu-ky','Chu kỳ 21 / 90']], nv:[{ten:'Tick nếp tối 7 ngày', xong:'≥ 5/7 ngày tick', ngay:7}],
    dau:['Giờ ngủ ổn định'], canh:'—' },
  { ma:'GP-A5', tru:'A', ten:'Ngôn ngữ mời thay ngôn ngữ ra lệnh', vd:['a-xung-dot'], tang:[1,2,3], ngay:14,
    muc:'Cha mẹ thay 5 câu ra lệnh hay dùng nhất bằng câu mời.',
    buoc:['Cha mẹ ghi 5 câu hay nói nhất','Coach cùng viết câu thay','Dán câu thay ở chỗ dễ thấy','Đếm số lần dùng câu cũ / câu mới'],
    cong:[['thu-vien','Thư viện tài liệu']], nv:[{ten:'Dùng câu mời thay câu ra lệnh', xong:'Bảng đếm 7 ngày', ngay:7}],
    dau:['Số câu ra lệnh giảm một nửa'], canh:'—' },
  { ma:'GP-A6', tru:'A', ten:'Nhóm bạn cùng tiến', vd:['a-moi-truong','i-dong-luc'], tang:[2,3,4], ngay:30,
    muc:'Con có 2–3 bạn cùng học, cùng giữ nhịp.',
    buoc:['Con chọn 2–3 bạn muốn tiến bộ','Đặt một mục tiêu chung nhỏ','Gặp hoặc gọi học chung 2 buổi/tuần','Cùng chấm tiến bộ cuối tuần'],
    cong:[['ket-noi','Kết nối'],['su-kien','Sự kiện']], nv:[{ten:'Hai buổi học nhóm trong tuần', xong:'Ảnh hoặc ghi chép buổi học', ngay:7}],
    dau:['Con chủ động hẹn bạn học'], canh:'Nhóm thành nơi chơi → về học một mình, thử lại sau.' }
];
