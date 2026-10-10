/* ═══════════════════════════════════════════════════════════════
   GITA 365 — BỘ BÀI NỀN CỦA BẢN TIN GITA

   Tám bài mở đầu bản tin nội bộ. Super Admin bấm "Ban hành bộ bài nền"
   ở ngăn Biên tập · lịch: mỗi bài đi qua đúng hai cửa máy chủ (soạn →
   duyệt có cờ ban hành) và rơi vào ô nhịp chuẩn của nó trong bốn tuần tới.

   Viết TỪ văn bản nền đã chốt (G.CULTURE, chín điều bất khả sửa, chuẩn
   buổi làm việc, luật đèn đỏ, kỳ thi ngày 28) — không bịa người, không
   bịa số, không bịa chiến dịch. Vinh danh và chiến dịch CỐ Ý không có bài
   nền: ghi nhận một người không có thật hay một chiến dịch chưa ai quyết
   là đúng thứ "làm màu" chủ hệ cấm. Hai chuyên mục ấy chờ bài thật.

   thu: 0 = Chủ nhật … 6 = Thứ Bảy · tuan: cộng thêm bao nhiêu tuần.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;

G.BTG_BAI_NEN = [
  { chuyenMuc: 'NEN', thu: 1, gio: '08:00', tuan: 0, anh: 'TT01',
    tieuDe: 'Một gia đình vận hành được — vì sao Học viện GITA tồn tại',
    tomTat: 'Tầm nhìn, mốc 2035 và sứ mệnh của Học viện không phải khẩu hiệu treo tường. Chúng quyết định một buổi làm việc của bạn tuần này diễn ra thế nào — và bài này chỉ ra từng chỗ ấy.',
    noiDung: 'Tầm nhìn của Học viện viết rằng chúng ta kiến tạo một hệ sinh thái gia đình phát triển bền vững, nơi mỗi người biết hiểu mình, rèn mình, làm chủ cuộc đời và cùng nhau kiến tạo hạnh phúc, thành công, thịnh vượng qua nhiều thế hệ. Chữ quan trọng nhất trong câu ấy là "nhiều thế hệ". Đích của chúng ta được đo bằng đời người, không đo bằng học kỳ.\n\n' +
      'Mốc 2035 nói con số và hạn: một triệu người Việt lớn lên trong một gia đình vận hành được — nơi đứa trẻ tự cầm lái đời mình và người lớn cũng đang lớn lên mỗi ngày. Không phải một triệu đứa trẻ ngoan hơn. Là một triệu gia đình khác đi. Mỗi gia đình bạn đang đồng hành là một phần của con số ấy, không phải một hợp đồng trong sổ.\n\n' +
      'Sứ mệnh nói cách chúng ta đi tới đó: trao cho mỗi gia đình một bản đồ, một nhịp và một người đồng hành — để sau 365 ngày, nhà ấy tự chạy được mà không cần ai canh. Câu này có một hệ quả mà người mới hay bỏ qua: chúng ta thành công khi gia đình CẦN chúng ta ít dần. Một buổi làm việc mà gia đình rời đi phụ thuộc vào bạn nhiều hơn là một buổi chưa đúng sứ mệnh, dù gia đình rất hài lòng.\n\n' +
      'Vì thế mỗi buổi làm việc đều có ba câu hỏi để tự soát. Bản đồ: gia đình có biết mình đang ở chặng nào, cổng tiếp theo là gì không? Nhịp: việc tuần này có gắn vào nhịp ngày, tuần, 21 ngày của nhà ấy không? Người đồng hành: bạn đã làm thay khâu nào mà lẽ ra gia đình phải tự lắp?\n\n' +
      'Chúng tôi đưa khung và giữ chuẩn. Gia đình lắp phần của mình. Đó là toàn bộ cách Học viện làm việc, gói trong hai câu.',
    hanhDong: 'Trước buổi làm việc tới, viết ra một khâu bạn đang làm thay gia đình và cách trả khâu ấy lại cho họ trong 21 ngày.',
    nguon: 'Văn bản nền của Học viện: tầm nhìn, mốc 2035 và sứ mệnh (G.CULTURE)' },

  { chuyenMuc: 'VANHANH', thu: 2, gio: '08:00', tuan: 0, anh: 'TT13',
    tieuDe: 'Bản tin GITA vận hành thế nào: soạn, duyệt, lịch phát hành và xác nhận',
    tomTat: 'Mỗi nhân sự vừa là người đọc vừa là người viết của bản tin. Bài này hướng dẫn từng bước: soạn một bài đủ khung, nộp ban biên tập, theo dõi lịch, và xác nhận bài bắt buộc trước hạn.',
    noiDung: 'Bản tin GITA là kênh truyền thông chính thức của đội ngũ. Mọi bài đều đi qua ban biên tập trước khi phát hành, và phát hành đúng lịch nhịp chuẩn: thứ Hai nền tảng, thứ Ba vận hành, thứ Tư tiêu chuẩn, thứ Năm học tập, thứ Sáu vinh danh.\n\n' +
      'Việc của bạn có hai phần. Phần đọc: bài bắt buộc có hạn xác nhận và câu kiểm tra; trả lời đúng hạn là phần lớn nhất của chỉ số truyền thông. Phần viết: mỗi tháng một bài đã phát hành là đủ phần đóng góp. Một bài hay thường bắt đầu từ một việc có thật trong tuần của bạn.\n\n' +
      'Máy chủ soát đúng khung của từng chuyên mục, nên thiếu ô nào bạn sẽ thấy ngay ô ấy. Ban biên tập không duyệt bài của chính mình; bài bị trả về luôn kèm ghi chú cần sửa gì.',
    buocLam: ['Mở ngăn "Soạn bài", chọn chuyên mục và đọc dòng gợi ý dưới tên chuyên mục.',
      'Viết tiêu đề, tóm tắt, nội dung và ô "Sau khi đọc, người đọc làm được gì"; chọn một ảnh 3D trong thư viện.',
      'Bấm "Lưu nháp" để máy soát khung; sửa đến khi không còn ô thiếu, rồi bấm "Lưu và nộp duyệt".',
      'Theo dõi trạng thái ở mục "Bài của tôi"; bài bị trả về thì sửa theo ghi chú biên tập và nộp lại.',
      'Mỗi tuần mở ngăn "Bản tin", đọc và trả lời câu kiểm tra của mọi bài bắt buộc trước hạn.'],
    hanhDong: 'Trong tuần này, lưu một bản nháp đầu tiên ở chuyên mục bạn hiểu rõ nhất.',
    nguon: 'Luật vận hành Bản tin GITA (may-chu/truyen-thong.js) và nhịp phát hành chuẩn' },

  { chuyenMuc: 'CHUAN', thu: 3, gio: '08:00', tuan: 0, anh: 'TT04',
    tieuDe: 'Chuẩn một buổi làm việc với gia đình: kịch bản, phác đồ và cổng nghiệm thu',
    tomTat: 'Giá trị CHUẨN nói rằng ngẫu hứng là rủi ro của gia đình khác. Bài này mô tả một buổi làm việc đạt chuẩn trông thế nào, và ba dấu hiệu một buổi đang trượt khỏi chuẩn.',
    noiDung: 'Một buổi làm việc đạt chuẩn có ba thứ chuẩn bị trước khi gặp gia đình. Kịch bản: mở đúng kịch bản cho đúng tầng của nhà ấy. Phác đồ: biết đòn bẩy đang dùng là gì và vì sao chọn nó. Cổng nghiệm thu: biết bằng chứng nào cho thấy nhà đã qua bước này.\n\n' +
      'Trong buổi, giữ nhịp nghe bảy khuyên ba và bốn nhịp của cuộc trò chuyện khó: nghe hết câu, công nhận đúng một điều người kia đã làm được, hỏi để hiểu, rồi dẫn một bước nhỏ làm được ngay hôm nay kèm cách biết mình đã làm được.\n\n' +
      'Ba dấu hiệu buổi đang trượt khỏi chuẩn: bạn nói nhiều hơn gia đình; bạn đưa lời khuyên trước khi có dữ liệu của bảy ngày nhìn; bạn kết thúc buổi mà gia đình không nói lại được việc của họ trong tuần.\n\n' +
      'Sau buổi, ghi sổ trong ngày. Một buổi không có dòng ghi là một buổi gia đình và người thay bạn sau này không nhìn thấy được.',
    hanhDong: 'Ở buổi làm việc tới, ghi lại tỷ lệ thời gian bạn nói và gia đình nói; nếu bạn nói quá ba phần mười, đặt thêm một câu hỏi mở.',
    nguon: 'Bảy giá trị cốt lõi (CHUẨN), bốn nhịp và nội quy hệ sinh thái trong văn bản nền' },

  { chuyenMuc: 'HOCTAP', thu: 4, gio: '08:00', tuan: 0, anh: 'TT14', hanNgay: 5,
    tieuDe: 'Bắt buộc đọc: chín điều bất khả sửa — và vì sao không ai được sửa',
    tomTat: 'Chín điều bất khả sửa là phần cứng nhất của hiến pháp GITA. Mọi nhân sự đọc, hiểu và xác nhận trong năm ngày. Ba câu kiểm tra cuối bài tính vào chỉ số truyền thông.',
    noiDung: 'Hiến pháp tổ chức của GITA có chín điều không được sửa: không xếp hạng gia đình; chấm nhà, không chấm người; không tụt cấp đã đạt; không hứa kết quả; không dùng nỗi sợ của cha mẹ; không lấy tuyến dưới làm nguồn thu; trẻ có quyền phủ quyết ảnh của mình; vòng đỏ không rời thiết bị; không giữ chân bằng thủ thuật.\n\n' +
      'Sửa một trong chín điều này không phải là cải tiến — nó là lập ra một tổ chức khác. Bảy điều đã có răng ở máy chủ: hệ thống từ chối thao tác vi phạm, kể cả khi người bấm có quyền cao.\n\n' +
      'Trong công việc hằng ngày, hai điều hay bị phạm nhất mà không cố ý là điều 4 và điều 5. Một câu như "chắc chắn con sẽ tiến bộ" là hứa kết quả. Một câu như "để lâu sẽ muộn" để thúc gia đình giữ nhịp là dùng nỗi sợ, dù người nói thật lòng quan tâm.',
    cauHoi: [
      { cau: 'Câu nào phạm điều "không hứa kết quả"?', chon: ['Nhà mình sẽ có bản đồ và nhịp 21 ngày rõ ràng', 'Sau ba tháng con chắc chắn sẽ chăm học hơn', 'Mỗi cổng đều có bằng chứng để nhà mình tự xem'], dung: 1 },
      { cau: 'Vì sao chín điều này không được sửa?', chon: ['Vì sửa một điều là lập ra một tổ chức khác', 'Vì máy chủ chưa hỗ trợ sửa', 'Vì luật pháp bắt buộc cả chín điều'], dung: 0 },
      { cau: 'Bảng số của một gia đình được so với ai?', chon: ['Với trung bình của các nhà cùng tầng', 'Với chính nhà ấy ở chặng trước', 'Với nhà đứng đầu bảng tháng'], dung: 1 }],
    hanhDong: 'Đọc lại tin nhắn gần nhất bạn gửi một gia đình; sửa mọi câu có dáng hứa kết quả hoặc thúc bằng nỗi sợ.',
    nguon: 'Chín điều bất khả sửa — hiến pháp tổ chức GITA (HP9)' },

  { chuyenMuc: 'SUKIEN', thu: 3, gio: '10:00', tuan: 0, anh: 'TT16', thoiDiem: 'NGAY28', diaDiem: 'Màn Thi chứng chỉ trên hệ thống',
    tieuDe: 'Kỳ thi chứng chỉ mở vào ngày 28 hằng tháng — chuẩn bị gì từ hôm nay',
    tomTat: 'Kỳ thi chứng chỉ Tư vấn và Coach chỉ mở vào ngày 28 hằng tháng theo giờ Việt Nam. Điểm thi là 30% KPI tháng. Bài này nói những việc cần chuẩn bị trước kỳ thi.',
    noiDung: 'Kỳ thi chứng chỉ mở vào ngày 28 hằng tháng, theo giờ Việt Nam, trên màn Thi chứng chỉ. Đề được ghép riêng cho từng người từ kho cấp cao; người chấm khác người thi và chấm mù.\n\n' +
      'Điểm thi ngày 28 chiếm 30 phần của KPI tháng; không dự thi tính 0. Trước kỳ thi, đọc hết các bài bắt buộc của tháng trên Bản tin — chúng là phần chuẩn nghề mới nhất, và câu kiểm tra của chúng tính vào phần nghiệp vụ.',
    hanhDong: 'Đặt lịch nhắc ngày 28 trên điện thoại và dành một buổi tối trước đó đọc lại các bài bắt buộc của tháng.',
    nguon: 'Luật thi chứng chỉ (thi-cap.js) và trọng số KPI 30 · 30 · 30 · 10 đã chốt' },

  { chuyenMuc: 'VANHOA', thu: 1, gio: '08:00', tuan: 1, anh: 'TT02',
    tieuDe: 'Nghe bảy, khuyên ba — nhịp làm việc phân biệt người đồng hành với người giảng giải',
    tomTat: 'Giá trị THƯƠNG có một câu "nên" rất ngắn: nghe bảy, khuyên ba. Bài này giải thích vì sao tỷ lệ ấy không phải phép lịch sự mà là phương pháp, và cách tự đo nó trong buổi làm việc.',
    noiDung: 'Người mới vào nghề hay nghĩ giá trị của mình nằm ở lời khuyên. Gia đình trả tiền, nên mình phải nói thật nhiều điều hay. Văn hoá GITA đi ngược lại: giá trị của người đồng hành nằm ở chỗ gia đình tự thấy ra điều họ cần làm.\n\n' +
      'Vì sao nghe trước? Vì kim chỉ nam 01 nói nhìn đúng trước khi sửa. Chưa nghe đủ thì mọi lời khuyên đều là phỏng đoán có thiện chí, và một lời khuyên đúng mà đến sớm vẫn bị từ chối — gia đình chưa sẵn sàng nghe nó. Nghe đủ còn cho bạn biết nút thắt nằm ở tầng nào: hành vi, thói quen hay niềm tin. Can thiệp sai tầng thì nói bao nhiêu cũng vô ích.\n\n' +
      'Vì sao khuyên ít? Vì kim chỉ nam 04: không làm thay khâu lắp ráp. Gia đình chỉ gắn bó với lộ trình mà chính họ góp tay dựng. Ba phần khuyên của bạn nên là câu hỏi dẫn và một bước nhỏ — không phải một danh sách mười việc.\n\n' +
      'Nghe bảy cũng không có nghĩa là im lặng bảy phần. Nghe là hỏi mở, chờ đủ ba giây sau câu trả lời, nhắc lại đúng lời người kia, và công nhận một điều họ đã làm được trước khi nói bất kỳ điều gì khác.\n\n' +
      'Cách tự đo đơn giản: sau buổi làm việc, ước lượng phần thời gian bạn nói. Nếu quá ba phần mười, xem lại chỗ bạn đã giảng giải thay vì hỏi.',
    hanhDong: 'Trong buổi làm việc tới, đếm số câu hỏi mở bạn đặt và chờ đủ ba giây sau mỗi câu trả lời.',
    nguon: 'Bảy giá trị cốt lõi (THƯƠNG), sáu kim chỉ nam và bốn nhịp trong văn bản nền' },

  { chuyenMuc: 'TRACHNHIEM', thu: 1, gio: '08:00', tuan: 2, anh: 'TT08',
    tieuDe: 'Đèn đỏ là việc của người — gọi trong 24 giờ, không bán gì',
    tomTat: 'Khi một gia đình chuyển đèn đỏ, hệ thống chỉ cho đóng việc bằng một cuộc gọi của người thật trong 24 giờ. Bài này nói vì sao luật ấy cứng, và trách nhiệm của từng người khi thấy một đèn đỏ.',
    noiDung: 'Bảng đèn của Học viện có một cột mà nhiều bảng đèn khác thiếu: ai làm. Đèn đỏ nghĩa là một gia đình đã im lặng quá lâu hoặc đang gặp khó, và việc của đèn đỏ là một cuộc gọi của người thật, trong 24 giờ, không bán gì.\n\n' +
      'Một đèn đỏ đóng lại được bằng tin nhắn thì không còn là đèn đỏ. Nhắn tin rẻ, nhanh và đóng được việc trong sổ, nên nếu cho phép thì mọi đèn đỏ đều đóng bằng tin nhắn. Vì thế hệ thống chặn ba đường: nhắn vào nhà đỏ, máy gọi thay người, và nhắc bán hàng trong cuộc gọi ấy.\n\n' +
      'Trách nhiệm không dừng ở người phụ trách. Ai nhìn thấy một đèn đỏ quá 12 giờ mà chưa có cuộc gọi thì báo trưởng nhóm ngay — không nghĩ rằng người khác sẽ làm. Gia đình im lặng là lúc họ cần chúng ta nhất.',
    hanhDong: 'Mở danh sách nhà bạn phụ trách, kiểm tra đèn của từng nhà, và gọi ngay nhà nào đang đỏ.',
    nguon: 'Luật đèn đỏ của phân hệ Vận hành & chăm sóc (van-hanh-cham-soc.js)' },

  { chuyenMuc: 'HIENPHAP', thu: 1, gio: '08:00', tuan: 3, anh: 'TT06',
    tieuDe: 'Vì sao GITA không xếp hạng gia đình — và điều đó làm chúng ta khác thị trường ra sao',
    tomTat: 'Điều bất khả sửa đầu tiên là không xếp hạng gia đình. Nhiều chương trình giáo dục dùng bảng xếp hạng để tạo động lực. Bài này giải thích vì sao GITA chọn đường ngược lại, và cách trả lời khi gia đình hỏi "nhà tôi đứng thứ mấy".',
    noiDung: 'Bảng xếp hạng là công cụ tạo động lực rẻ nhất trên thị trường giáo dục. Nó hiệu nghiệm trong vài tuần đầu với nhóm đứng trên, và lặng lẽ làm hỏng nhóm đứng dưới — đúng những gia đình cần đồng hành nhất.\n\n' +
      'GITA chọn đường khác vì ba lý do. Thứ nhất, hoàn cảnh mỗi nhà khác nhau: một nhà giữ được nhịp năm ngày một tuần trong lúc bố mẹ làm ca đêm có thể đang tiến xa hơn một nhà giữ bảy ngày trong điều kiện thuận lợi. Một con số chung xoá mất sự thật ấy. Thứ hai, so với nhà khác làm cha mẹ chuyển sự chú ý từ con mình sang người khác — đúng thứ Học viện muốn gỡ. Thứ ba, giá trị THƯƠNG nói rõ: không dán nhãn, không xếp hạng, mỗi người chỉ so với chính mình chặng trước.\n\n' +
      'Vì vậy bảng số của một gia đình chỉ so với chính gia đình ấy ở chặng trước. Vinh danh trong Học viện ghi nhận một việc đã làm kèm bằng chứng, không xếp người hơn người.\n\n' +
      'Khi gia đình hỏi "nhà tôi đứng thứ mấy", đừng né. Hãy trả lời thật: GITA không xếp các nhà với nhau, rồi mở ngay bảng số của nhà ấy và chỉ ra một điều đã tốt hơn so với chặng trước. Câu hỏi ấy thường mang một nỗi lo phía sau — lo nhà mình đang chậm. Gọi tên được tiến bộ có thật của họ là cách trả lời nỗi lo ấy.\n\n' +
      'Đây là một chỗ GITA khác thị trường. Chúng ta không bán cảm giác thắng người khác; chúng ta trao cho mỗi nhà một tấm gương soi riêng.',
    hanhDong: 'Chuẩn bị sẵn câu trả lời của bạn cho câu hỏi "nhà tôi đứng thứ mấy", kèm một tiến bộ có thật của từng nhà bạn phụ trách.',
    nguon: 'Chín điều bất khả sửa (điều 1) và giá trị THƯƠNG trong văn bản nền' }
];
