/* ═══════════════════════════════════════════════════════════════
   GITA 365 — DỮ LIỆU V20: CHUẨN COACH QUỐC TẾ × NLP × MÔ THỨC GITA

     G.CO_ICF     8 năng lực cốt lõi theo khung ICF (cập nhật 2019), mỗi
                  năng lực có dấu hiệu quan sát được trong buổi coach.
                  GITA bám khung này để dạy và chấm — KHÔNG phải chứng nhận
                  ICF; chứng nhận là việc của từng Coach với ICF.
     G.CO_TC_ICF  tiêu chí chấm chất lượng (G.CO_TC) ↔ năng lực ICF
     G.CO_KT      18 kỹ thuật: NLP (công cụ thực hành phổ biến, bằng chứng
                  khoa học HẠN CHẾ — ghi rõ ở từng thẻ) và khoa học hành vi
                  (bằng chứng tốt). Mỗi thẻ: khi dùng · khi KHÔNG dùng · các
                  bước · câu mẫu · ví dụ · hình minh hoạ.
     G.CO_CHUOI   chuỗi hành động GITA 8 bước của khách hàng
     G.CO_PHA     5 pha của lộ trình thay đổi bền vững
     G.CO_TUKHOA  bộ từ khoá đọc lời kể tiếng Việt → vấn đề · nhu cầu ·
                  sẵn sàng · tiềm năng (chạy trên máy, không gửi đi đâu)
     G.CO_KQ      mẫu mục tiêu chuẩn (kết quả định dạng tốt) theo nhu cầu

   Không đụng máy chủ · giấy phép · mã hoá.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;

/* ══════════ 1 · TÁM NĂNG LỰC CỐT LÕI (khung ICF) ══════════ */
G.CO_ICF = [
  { ma:'C1', mien:'Nền tảng', ten:'Thực hành đạo đức', goc:'Demonstrates Ethical Practice',
    mo:'Giữ bảo mật, minh bạch vai trò, không hứa điều không đo được, biết khi nào chuyển chuyên gia.',
    dau:['Nói rõ phạm vi coaching và bảo mật ngay buổi đầu','Không hứa kết quả, chỉ cam kết quy trình','Chuyển chuyên gia khi có dấu hiệu vượt phạm vi'] },
  { ma:'C2', mien:'Nền tảng', ten:'Tư duy coaching', goc:'Embodies a Coaching Mindset',
    mo:'Tin rằng gia đình tự tìm ra lời giải; Coach liên tục học và tự soi mình.',
    dau:['Hỏi trước, gợi ý sau','Tự ghi điều học được sau mỗi buổi','Nhận phản hồi không phòng thủ'] },
  { ma:'C3', mien:'Đồng kiến tạo quan hệ', ten:'Thiết lập & giữ thoả thuận', goc:'Establishes and Maintains Agreements',
    mo:'Thoả thuận rõ mục tiêu chương trình, mục tiêu từng buổi và cách đo thành công.',
    dau:['Mỗi buổi có mục tiêu do gia đình nói ra','Thống nhất cách đo thành công','Kiểm lại thoả thuận cuối buổi'] },
  { ma:'C4', mien:'Đồng kiến tạo quan hệ', ten:'Nuôi dưỡng tin cậy & an toàn', goc:'Cultivates Trust and Safety',
    mo:'Tạo không gian để con và cha mẹ nói thật mà không sợ bị phán xét.',
    dau:['Ghi nhận cảm xúc trước khi bàn việc','Tôn trọng nhịp và ranh giới của con','Không so sánh, không gán nhãn'] },
  { ma:'C5', mien:'Đồng kiến tạo quan hệ', ten:'Hiện diện trọn vẹn', goc:'Maintains Presence',
    mo:'Tập trung hoàn toàn vào người trước mặt, linh hoạt theo điều đang diễn ra.',
    dau:['Không làm việc khác trong buổi','Dám dừng lại khi có cảm xúc','Đi theo điều gia đình đang cần'] },
  { ma:'C6', mien:'Giao tiếp hiệu quả', ten:'Lắng nghe chủ động', goc:'Listens Actively',
    mo:'Nghe cả điều được nói và điều chưa nói; nhắc lại để gia đình nghe thấy chính mình.',
    dau:['Nhắc lại bằng lời của gia đình','Để ý cảm xúc và từ ngữ lặp lại','Không ngắt lời'] },
  { ma:'C7', mien:'Giao tiếp hiệu quả', ten:'Khơi gợi nhận thức', goc:'Evokes Awareness',
    mo:'Câu hỏi mở, im lặng đúng lúc, giúp gia đình tự thấy mô thức và lựa chọn mới.',
    dau:['Câu hỏi mở, ngắn','Soi niềm tin đằng sau hành vi','Để gia đình tự gọi tên nhận ra'] },
  { ma:'C8', mien:'Nuôi dưỡng học hỏi & phát triển', ten:'Thúc đẩy phát triển', goc:'Facilitates Client Growth',
    mo:'Biến nhận ra thành hành động, đo tiến bộ, ăn mừng và chuyển giao quyền tự chủ.',
    dau:['Hành động có tiêu chí xong và hạn','Nghiệm thu bằng bằng chứng','Giảm dần hỗ trợ'] }
];
G.CO_TC_ICF = { 'chuan-bi':['C2','C5'], 'muc-tieu':['C3'], 'du-nhip':['C3','C5'], 'ngon-ngu':['C4','C6'], 'chan-doan':['C7'],
  'tu-tim':['C2','C7'], 'nhiem-vu':['C8'], 'nghiem-thu':['C8'], 'ghi-so':['C1'], 'dung-nhip':['C1','C3'] };

/* ══════════ 2 · KỸ THUẬT: NLP × KHOA HỌC HÀNH VI ══════════
   nhom: 'NLP' | 'KH'. bc: mức bằng chứng nói thẳng. minh: kiểu hình minh hoạ.
   pha: những pha lộ trình hợp dùng (1–5). */
var BC_NLP = 'NLP — công cụ thực hành phổ biến trong coaching; bằng chứng khoa học còn hạn chế. Dùng như cách đặt câu hỏi và tổ chức trải nghiệm, không dùng để "chẩn đoán" hay hứa kết quả.';
G.CO_KT = [
  { ma:'NLP-KQ', nhom:'NLP', ten:'Kết quả định dạng tốt', goc:'Well-formed outcome', tru:['G'], icf:['C3','C7'], pha:[2], minh:'bac',
    bc:BC_NLP,
    muc:'Biến mong muốn mơ hồ thành một kết quả nói ở thể khẳng định, trong tầm tay con, thấy – nghe – cảm được khi đạt.',
    khiNao:'Khi mục tiêu đang là "bớt lười", "đừng chơi game" — nói điều không muốn.', khongDung:'Khi gia đình đang khủng hoảng cảm xúc — ổn định trước.',
    buoc:['Hỏi điều con MUỐN, thay cho điều con muốn tránh','Hỏi: phần nào nằm trong tay con?','Hỏi: khi đạt, con thấy gì, nghe gì, cảm thấy gì?','Hỏi: ở đâu, khi nào, với ai?','Soi sinh thái: đạt điều này có làm mất gì không?','Chốt bước đầu tiên làm được trong 48 giờ'],
    cau:['Thay vì điều con không muốn, con muốn mình đang làm gì?','Lúc đạt rồi, ai trong nhà sẽ nhận ra đầu tiên, nhờ điều gì?','Đạt được điều này, có điều gì con sợ mất không?'],
    vd:'"Con muốn bớt chơi game" → "Từ thứ Hai, con học xong bài Toán trước 21 giờ, rồi mới mở máy 30 phút."' },
  { ma:'NLP-MM', nhom:'NLP', ten:'Câu hỏi làm rõ (Mô hình Meta)', goc:'Meta-model', tru:['I','T'], icf:['C6','C7'], pha:[1,2], minh:'pheu',
    bc:BC_NLP,
    muc:'Làm rõ những câu bị khái quát ("con luôn…"), bị lược bỏ ("học không vào") hay bị bóp méo ("thầy ghét con").',
    khiNao:'Khi nghe "luôn luôn", "không bao giờ", "ai cũng", "phải", "không thể".', khongDung:'Không hỏi dồn như thẩm vấn — tối đa 2 câu làm rõ liền nhau.',
    buoc:['Nghe từ khái quát / tuyệt đối','Nhắc lại đúng từ ấy','Hỏi một câu làm rõ nhẹ nhàng','Ghi lại ví dụ cụ thể vừa nhận được'],
    cau:['"Luôn luôn" — có lần nào không như vậy không?','"Không vào" — cụ thể là phần nào, lúc nào?','Điều gì khiến con nghĩ thầy ghét con?','"Phải" — nếu không làm thì chuyện gì xảy ra?'],
    vd:'Mẹ: "Nó không bao giờ tự học." → Coach: "Không bao giờ — tuần rồi có buổi nào con tự ngồi vào bàn không?" → "À, tối thứ Năm có."' },
  { ma:'NLP-CL', nhom:'NLP', ten:'Sáu cấp độ thay đổi (Dilts)', goc:'Logical levels', tru:['G','I','T','A'], icf:['C7'], pha:[1,2,4], minh:'bac',
    bc:BC_NLP,
    muc:'Tìm đúng cấp độ của nút thắt: môi trường → hành vi → năng lực → niềm tin & giá trị → bản sắc → sứ mệnh. Khớp thẳng với bốn trụ GITA.',
    khiNao:'Khi sửa hành vi mãi không đổi — có thể nút thắt nằm ở niềm tin hoặc bản sắc.', khongDung:'Không dùng để gán nhãn con ("con là đứa…").',
    buoc:['Môi trường (A): ở đâu, khi nào, với ai?','Hành vi (A): con đang làm gì cụ thể?','Năng lực (T): con biết cách chưa?','Niềm tin & giá trị (I): con tin gì về việc này?','Bản sắc (I): con thấy mình là người thế nào?','Sứ mệnh (G): điều này vì điều gì lớn hơn?'],
    cau:['Con thấy mình là kiểu học sinh nào?','Điều gì quan trọng với con hơn cả điểm số?','Nếu con là người con muốn trở thành, con sẽ học thế nào?'],
    vd:'Con "không học" (hành vi) vì tin "mình dốt Toán" (niềm tin) → sửa giờ giấc không ăn thua; phải gỡ niềm tin bằng bằng chứng nhỏ trước.' },
  { ma:'NLP-VT', nhom:'NLP', ten:'Ba vị trí nhận thức', goc:'Perceptual positions', tru:['A','I'], icf:['C4','C7'], pha:[2,3,4], minh:'ghe',
    bc:BC_NLP,
    muc:'Giúp cha mẹ và con nhìn một tình huống từ ba chỗ: của mình, của người kia, của người quan sát.',
    khiNao:'Khi cha mẹ – con xung đột, mỗi người chỉ thấy phía mình.', khongDung:'Khi có bạo lực hoặc tổn thương sâu — chuyển chuyên gia.',
    buoc:['Vị trí 1: kể từ mắt mình, mình cảm thấy gì','Vị trí 2: đổi chỗ, kể lại như người kia','Vị trí 3: đứng ngoài, như người quan sát công bằng','Hỏi: từ vị trí 3, hai người cần gì?','Chọn một việc nhỏ mỗi bên làm khác đi'],
    cau:['Nếu con là mẹ lúc 10 giờ tối thấy con còn cầm máy, mẹ đang lo điều gì?','Người ngoài nhìn vào sẽ thấy hai người cùng muốn điều gì?'],
    vd:'Mẹ ngồi "ghế con" kể lại: "Con mệt sau 8 tiết, chỉ muốn 15 phút xả hơi." — lần đầu mẹ nghe lý do thật.' },
  { ma:'NLP-DK', nhom:'NLP', ten:'Đóng khung lại', goc:'Reframing', tru:['I'], icf:['C7'], pha:[2,3], minh:'khung',
    bc:BC_NLP,
    muc:'Đổi khung nhìn một sự việc để mở ra ý nghĩa và lựa chọn mới — không phủ nhận cảm xúc.',
    khiNao:'Khi gia đình mắc kẹt trong một cách hiểu ("thất bại", "vô dụng").', khongDung:'Không đóng khung lại khi người ta chưa được lắng nghe — sẽ thành gạt đi.',
    buoc:['Lắng nghe và gọi tên cảm xúc trước','Hỏi: điều này còn có thể có nghĩa gì khác?','Tìm ngữ cảnh mà hành vi ấy lại là điểm mạnh','Để gia đình tự chọn khung mới'],
    cau:['Sự "bướng" này, trong tình huống nào lại là điểm mạnh?','Bài kiểm này cho mình dữ liệu gì để tuần sau làm khác đi?'],
    vd:'"Con hay cãi" → "Con biết bảo vệ ý kiến; mình dạy con cách nói ý kiến mà vẫn tôn trọng."' },
  { ma:'NLP-NN', nhom:'NLP', ten:'Hoà nhịp rồi dẫn dắt', goc:'Pacing & leading', tru:['I','A'], icf:['C4','C5','C6'], pha:[1], minh:'song',
    bc:BC_NLP,
    muc:'Theo nhịp, giọng, từ ngữ của gia đình trước để tạo tin cậy, rồi mới dẫn sang hướng mới.',
    khiNao:'Buổi đầu, hoặc khi gia đình đang phòng thủ.', khongDung:'Không bắt chước lộ liễu — người ta sẽ thấy bị diễn.',
    buoc:['Nghe và dùng lại từ ngữ chính của gia đình','Theo tốc độ nói, mức năng lượng','Ghi nhận điều đúng trong lời họ','Khi thấy dịu lại, mới hỏi câu dẫn sang hướng mới'],
    cau:['Mình nghe chị nói là "mệt lắm rồi" — mệt nhất là lúc nào?','Đúng là việc này khó thật. Nếu chỉ thử một điều nhỏ, chị muốn thử điều gì?'],
    vd:'Bố nói nhanh, gắt → Coach nói chắc, ngắn, ghi nhận "anh lo cho tương lai của con" → bố dịu lại rồi mới bàn kế hoạch.' },
  { ma:'NLP-NE', nhom:'NLP', ten:'Neo trạng thái tự tin', goc:'Resource anchoring', tru:['I'], icf:['C8'], pha:[3,4], minh:'neo',
    bc:BC_NLP + ' Ở GITA dùng như một nghi thức tự nhắc trước khi học / thi.',
    muc:'Gắn một cử chỉ nhỏ với ký ức lúc con tự tin, để gọi lại trạng thái ấy trước việc khó.',
    khiNao:'Trước kỳ thi, buổi thuyết trình, việc con sợ.', khongDung:'Không dùng thay cho chuẩn bị thật; không dùng với ký ức đau buồn.',
    buoc:['Con nhớ lại một lần thấy mình làm tốt','Sống lại chi tiết: thấy gì, nghe gì, cảm thấy gì','Khi cảm giác mạnh nhất, làm một cử chỉ nhỏ (nắm tay, chạm ngón)','Lặp lại 3 lần','Dùng cử chỉ ấy trước việc khó, rồi ghi lại cảm nhận'],
    cau:['Lần gần nhất con thấy "mình làm được" là lúc nào?','Khi ấy con đứng thế nào, thở thế nào?'],
    vd:'Trước giờ kiểm tra, con nắm tay trái, nhớ lại lần giải được bài khó nhất lớp — ghi cảm giác lo từ 8 xuống 5.' },
  { ma:'NLP-TL', nhom:'NLP', ten:'Đi trước tới tương lai', goc:'Future pacing', tru:['G'], icf:['C7','C8'], pha:[2,5], minh:'muiten',
    bc:BC_NLP,
    muc:'Cho con "sống thử" ngày đã đạt mục tiêu để thấy rõ đích và các bước ngược về hôm nay.',
    khiNao:'Khi đặt mục tiêu dài, hoặc trước khi kết thúc chương trình (kiểm tra duy trì).', khongDung:'Không vẽ tương lai màu hồng mà bỏ qua trở ngại — đi kèm WOOP.',
    buoc:['Chọn một ngày cụ thể trong tương lai','Con mô tả ngày ấy như đang ở đó','Hỏi: từ đó nhìn lại, con đã làm gì để tới được?','Viết các mốc ngược về hôm nay','Chọn việc của tuần này'],
    cau:['Hôm nay là ngày nhận kết quả thi vào 10. Con đang ở đâu, cảm thấy gì?','Nhìn lại, tháng đầu tiên con đã làm khác điều gì?'],
    vd:'Con "đứng" ở tháng 6 năm sau, kể lại 3 thói quen đã giữ — đó thành ba nhiệm vụ của tháng này.' },
  { ma:'NLP-GQ', nhom:'NLP', ten:'Nghe từ ngữ giác quan', goc:'Sensory language', tru:['A'], icf:['C6'], pha:[1], minh:'song',
    bc:BC_NLP + ' KHÔNG dùng để xếp con vào "kiểu học nhìn / nghe / vận động" — thuyết "phong cách học" đã bị nghiên cứu bác bỏ.',
    muc:'Để ý gia đình hay nói bằng từ "thấy", "nghe", hay "cảm thấy" để đáp lại bằng ngôn ngữ gần với họ.',
    khiNao:'Khi muốn tăng hoà hợp trong vài buổi đầu.', khongDung:'Không gán nhãn kiểu học, không thiết kế bài học theo "phong cách".',
    buoc:['Nghe các động từ giác quan lặp lại','Đáp lại bằng cùng loại từ','Quan sát gia đình có mở lòng hơn không'],
    cau:['Chị "thấy" con thế nào tuần này? → Mình cùng "nhìn" lại bảng tick nhé.'], vd:'Bố hay nói "nghe không ổn" → Coach: "Mình nghe thử con kể cách con học nhé."' },

  { ma:'KH-GROW', nhom:'KH', ten:'Mô hình GROW', goc:'Goal – Reality – Options – Will', tru:['G','T','A'], icf:['C3','C7','C8'], pha:[2,3], minh:'bac',
    bc:'Khung buổi coach được dùng rộng rãi nhất; nghiên cứu ủng hộ coaching có cấu trúc mục tiêu.',
    muc:'Một buổi đi bốn bước: Mục tiêu → Thực trạng → Phương án → Cam kết.',
    khiNao:'Mọi buổi giải quyết một vấn đề cụ thể.', khongDung:'Không chạy máy móc khi gia đình cần được nghe trước.',
    buoc:['Goal: hôm nay muốn ra về với điều gì?','Reality: chuyện đang thực sự thế nào, có số liệu gì?','Options: có những cách nào? Thêm một cách nữa?','Will: chọn cách nào, khi nào, đo thế nào, tự tin mấy phần 10?'],
    cau:['Cuối buổi, điều gì khiến buổi này đáng giá?','Nếu có thêm một cách nữa, đó là gì?','Từ 0 đến 10, con tự tin làm được mấy điểm?'], vd:'Mục tiêu: học đều Toán. Thực trạng: 2/7 ngày. Phương án: 3 cách. Cam kết: 25 phút sau bữa tối, tick bảng.' },
  { ma:'KH-MI', nhom:'KH', ten:'Phỏng vấn tạo động lực', goc:'Motivational Interviewing (OARS)', tru:['I'], icf:['C4','C6','C7'], pha:[1,2], minh:'vong',
    bc:'Khoa học hành vi — nhiều thử nghiệm ủng hộ, đặc biệt khi người được coach còn do dự.',
    muc:'Khơi "lời nói thay đổi" của chính con thay vì thuyết phục: câu hỏi mở, khẳng định, phản hồi, tóm tắt.',
    khiNao:'Khi con còn do dự, nói "cũng muốn nhưng…".', khongDung:'Không tranh luận, không "bẻ" lý do của con.',
    buoc:['Hỏi mở về điều con muốn','Khẳng định nỗ lực / giá trị của con','Phản hồi lại lời con, nhấn vào lời muốn thay đổi','Tóm tắt cả hai phía: muốn và ngại','Hỏi: bước tiếp theo con muốn là gì?'],
    cau:['Điều gì khiến con muốn thử thay đổi chuyện này?','Con nói "cũng muốn" — phần "muốn" ấy là gì?','Nếu mọi thứ giữ nguyên, một năm nữa sẽ thế nào?'], vd:'Con: "Học cũng được nhưng chán." Coach: "Con thấy chán, và con cũng muốn học được — phần muốn ấy đến từ đâu?"' },
  { ma:'KH-NT', nhom:'KH', ten:'Kế hoạch "Nếu – Thì"', goc:'Implementation intentions', tru:['A'], icf:['C8'], pha:[3,4], minh:'muiten',
    bc:'Khoa học hành vi — bằng chứng mạnh: kế hoạch "nếu gặp X thì làm Y" tăng rõ tỷ lệ làm thật.',
    muc:'Gắn hành động với một tình huống cụ thể để không phải nhớ, không phải quyết lại.',
    khiNao:'Khi đã biết làm gì nhưng hay quên, hay trì hoãn.', khongDung:'Không đặt quá 3 kế hoạch một lúc.',
    buoc:['Chọn hành vi mục tiêu','Chọn tình huống kích hoạt cụ thể (giờ, chỗ, việc trước đó)','Viết: "Nếu … thì con sẽ …"','Viết thêm kế hoạch cho trở ngại hay gặp','Dán ở chỗ dễ thấy, tick mỗi lần làm'],
    cau:['Ngay trước lúc học, thường con đang làm gì?','Nếu bạn rủ chơi game lúc 20 giờ, con sẽ nói gì?'], vd:'"Nếu ăn tối xong, thì con mang cặp vào bàn và mở vở Toán ngay." · "Nếu bạn nhắn rủ chơi, thì con trả lời: 21 giờ nhé."' },
  { ma:'KH-VTQ', nhom:'KH', ten:'Vòng thói quen', goc:'Cue – Routine – Reward', tru:['A'], icf:['C7','C8'], pha:[3,4], minh:'vong',
    bc:'Khoa học hành vi — mô hình được dùng rộng rãi; đổi "khúc giữa" thực tế hơn xoá thói quen.',
    muc:'Giữ tín hiệu, giữ phần thưởng, chỉ thay hành vi ở giữa.',
    khiNao:'Thói quen xấu lặp lại theo giờ / chỗ cố định.', khongDung:'Khi hành vi do cảm xúc nặng — xử lý cảm xúc trước.',
    buoc:['Ghi 5 lần thói quen xảy ra: giờ, chỗ, cảm xúc, người, việc trước đó','Tìm tín hiệu chung','Đoán phần thưởng thật (xả hơi? kết nối bạn?)','Chọn hành vi thay thế cho cùng phần thưởng','Thử 7 ngày, ghi lại'],
    cau:['Ngay trước khi cầm máy, con cảm thấy gì?','Sau 15 phút chơi, con được điều gì?'], vd:'Tín hiệu: mệt sau giờ học. Thưởng: xả hơi. Thay "lướt TikTok 1 giờ" bằng "đi bộ 15 phút + nghe nhạc".' },
  { ma:'KH-WOOP', nhom:'KH', ten:'WOOP: Ước – Kết quả – Trở ngại – Kế hoạch', goc:'Mental contrasting (WOOP)', tru:['G','A'], icf:['C3','C8'], pha:[2,3], minh:'bac',
    bc:'Khoa học hành vi — nhiều nghiên cứu ủng hộ "tương phản tâm trí" hơn chỉ nghĩ tích cực.',
    muc:'Nhìn thẳng trở ngại bên trong rồi lập kế hoạch vượt nó.',
    khiNao:'Khi con đặt mục tiêu nhưng hay bỏ giữa chừng.', khongDung:'Không dùng khi con đang rất tự ti — xây niềm tin trước.',
    buoc:['Ước: điều con muốn trong 4 tuần','Kết quả: điều tốt nhất khi đạt','Trở ngại: điều BÊN TRONG con dễ cản','Kế hoạch: "Nếu trở ngại xuất hiện, thì con…"'],
    cau:['Điều gì bên trong con dễ làm con bỏ dở nhất?','Lúc ấy con sẽ làm gì?'], vd:'Ước: thuộc 300 từ. Kết quả: tự tin nói. Trở ngại: lười ôn buổi tối. Kế hoạch: nếu thấy lười, thì ôn 5 từ trên giường.' },
  { ma:'KH-TDM', nhom:'KH', ten:'Khen quá trình, tư duy phát triển', goc:'Process praise / growth mindset', tru:['I'], icf:['C4','C8'], pha:[3,4], minh:'bac',
    bc:'Khoa học hành vi — bằng chứng có nhưng hiệu quả không đồng đều; tác dụng rõ nhất khi đi cùng cách làm cụ thể.',
    muc:'Khen nỗ lực, chiến lược, sự kiên trì thay vì khen "thông minh"; coi lỗi là dữ liệu.',
    khiNao:'Con sợ sai, né việc khó; cha mẹ hay khen / chê kết quả.', khongDung:'Không khen chung chung "con cố lên" — phải chỉ rõ việc.',
    buoc:['Cha mẹ ghi 3 câu khen hay dùng','Đổi sang khen việc làm cụ thể','Thêm chữ "chưa": "con chưa làm được"','Cuối tuần đếm số lần khen quá trình'],
    cau:['Con đã thử cách nào khi bài khó?','Lần sau con sẽ đổi chiến lược nào?'], vd:'"Con giỏi quá" → "Con làm lại bài đó ba lần, lần ba đúng — cách con kiểm từng bước rất hay."' },
  { ma:'KH-PDCA', nhom:'KH', ten:'Thử nghiệm nhỏ PDCA', goc:'Plan – Do – Check – Act', tru:['T','A'], icf:['C8'], pha:[3,4], minh:'vong',
    bc:'Phương pháp cải tiến liên tục — nền của mỗi chuỗi 21 ngày GITA.',
    muc:'Mỗi thay đổi là một thí nghiệm 7 ngày: lập kế hoạch – làm – đo – chỉnh.',
    khiNao:'Mỗi chuỗi 7/21 ngày.', khongDung:'Không đổi nhiều biến một lúc.',
    buoc:['Plan: đổi một biến, đoán kết quả','Do: làm 7 ngày, ghi số','Check: đối chiếu với baseline','Act: giữ, chỉnh hay bỏ'],
    cau:['Tuần này mình chỉ đổi một điều — điều gì?','Đặt cạnh tuần trước, số liệu tuần này nói gì?'], vd:'Đổi giờ học từ 21 giờ sang 19 giờ 30 → số ngày hoàn thành từ 3/7 lên 5/7 → giữ.' },
  { ma:'KH-PTP', nhom:'KH', ten:'Kế hoạch phòng tái phát', goc:'Relapse prevention', tru:['A','I'], icf:['C8','C1'], pha:[5], minh:'khung',
    bc:'Khoa học hành vi — chuẩn trong duy trì thay đổi: chuẩn bị trước cho lúc trượt.',
    muc:'Biết trước tình huống dễ trượt, dấu hiệu sớm, và cách quay lại trong 48 giờ.',
    khiNao:'Pha duy trì, trước khi giảm hỗ trợ.', khongDung:'—',
    buoc:['Liệt kê 3 tình huống dễ trượt (thi, ốm, nghỉ lễ)','Dấu hiệu sớm của mỗi tình huống','Kế hoạch "Nếu – Thì" cho từng cái','Quy tắc 48 giờ: trượt một ngày thì quay lại ngay hôm sau','Ai là người nhắc trong nhà'],
    cau:['Lúc nào con dễ bỏ nhịp nhất?','Nếu lỡ trượt 2 ngày, con quay lại bằng việc nhỏ nhất nào?'], vd:'Nghỉ Tết: giữ 15 phút đọc sáng; bố là người nhắc; trượt thì ngày mùng 4 quay lại.' },
  { ma:'KH-SC', nhom:'KH', ten:'Câu hỏi thang 0–10', goc:'Scaling questions', tru:['G','I','T','A'], icf:['C7','C8'], pha:[1,2,3,4,5], minh:'thang',
    bc:'Coaching tập trung giải pháp — dễ dùng, đo được tiến bộ chủ quan theo thời gian.',
    muc:'Đo nhanh mức hiện tại, tìm điều đã làm được và bước +1.',
    khiNao:'Đầu và cuối mỗi buổi; khi muốn đo điều khó đếm (tự tin, động lực).', khongDung:'Không so điểm giữa hai đứa trẻ.',
    buoc:['Hỏi: từ 0 đến 10, giờ con ở đâu?','Hỏi: vì sao không thấp hơn? (điều đã làm được)','Hỏi: lên 1 điểm sẽ khác gì?','Biến điều đó thành nhiệm vụ'],
    cau:['Vì sao là 4 mà không thấp hơn?','Lên 5 thì ai sẽ nhận ra đầu tiên?'], vd:'Tự tin môn Anh: 4 → "vì con nói được 3 câu chào" → lên 5: "nói 1 phút về bản thân".' }
];

/* ══════════ 3 · CHUỖI HÀNH ĐỘNG GITA (8 bước) ══════════ */
G.CO_CHUOI = [
  { so:1, tru:'G', ten:'Nhận diện hiện trạng', mo:'Thấy sự thật bằng số liệu, không phán xét.', kt:['KH-SC','NLP-MM'], icf:['C6'] },
  { so:2, tru:'G', ten:'Khát vọng của chính con', mo:'Một mục tiêu là của con, nói ở thể khẳng định.', kt:['NLP-KQ','NLP-TL'], icf:['C3'] },
  { so:3, tru:'I', ten:'Khơi động lực bên trong', mo:'Lý do của chính con, không phải của người lớn.', kt:['KH-MI','KH-SC'], icf:['C7'] },
  { so:4, tru:'I', ten:'Niềm tin mới', mo:'Gỡ niềm tin giới hạn bằng bằng chứng nhỏ.', kt:['NLP-CL','NLP-DK','KH-TDM'], icf:['C7'] },
  { so:5, tru:'T', ten:'Năng lực & cách làm', mo:'Điểm mạnh và phương pháp hợp với con.', kt:['KH-GROW','KH-PDCA'], icf:['C8'] },
  { so:6, tru:'A', ten:'Hành động nhỏ, đều', mo:'Việc nhỏ có tiêu chí xong, gắn tình huống cụ thể.', kt:['KH-NT','KH-VTQ','KH-WOOP'], icf:['C8'] },
  { so:7, tru:'A', ten:'Môi trường nâng đỡ', mo:'Nhà, góc học, bạn bè, thiết bị cùng đỡ thói quen.', kt:['NLP-VT','KH-VTQ'], icf:['C4'] },
  { so:8, tru:'A', ten:'Đo & củng cố', mo:'Nghiệm thu bằng chứng, ăn mừng, phòng tái phát.', kt:['KH-PDCA','KH-PTP','NLP-NE'], icf:['C8','C1'] }
];

/* ══════════ 4 · NĂM PHA CỦA LỘ TRÌNH BỀN VỮNG ══════════
   ty: tỷ trọng thời lượng · ss: mức sẵn sàng mà pha này phục vụ · chuoi: các bước GITA */
G.CO_PHA = [
  { so:1, ten:'Kết nối & nhận diện', ty:0.15, ss:[0,1], chuoi:[1], kt:['NLP-NN','KH-MI','NLP-MM','KH-SC'],
    muc:'Tin cậy, baseline trung thực, gọi tên nút thắt thật.', cong:'Baseline ≥ 5/7 ngày và nút thắt được gia đình xác nhận',
    kpi:[['Ngày có ghi baseline','≥ 5/7'],['Cảm xúc trung bình','≥ 3/5']] },
  { so:2, ten:'Khát vọng & động lực', ty:0.15, ss:[1,2], chuoi:[2,3,4], kt:['NLP-KQ','KH-MI','NLP-CL','NLP-TL','KH-WOOP'],
    muc:'Mục tiêu của chính con, định dạng tốt; lý do bên trong; niềm tin được soi.', cong:'Kết quả định dạng tốt được con tự nói và cả nhà ký',
    kpi:[['Mục tiêu do chính con nói','có'],['Thang động lực tự chấm','tăng ≥ 1 điểm']] },
  { so:3, ten:'Thử nghiệm hành động nhỏ', ty:0.25, ss:[2,3], chuoi:[5,6], kt:['KH-GROW','KH-NT','KH-VTQ','KH-PDCA','NLP-DK'],
    muc:'Một – hai hành vi then chốt chạy được, đo bằng tick và minh chứng.', cong:'Hành vi then chốt đạt ≥ 70% số ngày trong 14 ngày',
    kpi:[['Nhiệm vụ hoàn thành','≥ 70%'],['Nhiệm vụ đúng hạn','≥ 70%'],['Minh chứng / nhiệm vụ xong','≥ 80%']] },
  { so:4, ten:'Củng cố thói quen & môi trường', ty:0.25, ss:[3], chuoi:[6,7], kt:['KH-VTQ','NLP-VT','KH-TDM','NLP-NE','KH-PDCA'],
    muc:'Thói quen giữ được khi có biến; nhà và môi trường cùng đỡ.', cong:'Qua một tuần biến động không đứt quá 2 ngày',
    kpi:[['Nhịp đều 14 ngày','≥ 75%'],['Gắn kết','≥ 70/100']] },
  { so:5, ten:'Duy trì, chuyển giao & phòng tái phát', ty:0.20, ss:[4], chuoi:[8], kt:['KH-PTP','NLP-TL','KH-SC'],
    muc:'Con tự vận hành; Coach lùi dần; có kế hoạch phòng tái phát.', cong:'Tự vận hành 14 ngày liền, có kế hoạch phòng tái phát',
    kpi:[['Tự vận hành không cần nhắc','14 ngày'],['Kế hoạch phòng tái phát','có']] }
];

/* ══════════ 5 · BỘ TỪ KHOÁ ĐỌC LỜI KỂ (tiếng Việt) ══════════
   Mỗi cụm là một chuỗi con viết thường; máy so cả bản có dấu và bỏ dấu. */
G.CO_TUKHOA = {
  vd:{
    'a-thiet-bi':['điện thoại','1 giờ sáng','2 giờ sáng','thức tới','chơi tới khuya','game','tiktok','youtube','ipad','máy tính bảng','mạng xã hội','facebook','chơi điện tử','lướt','thức khuya chơi','cầm máy'],
    'a-tri-hoan':['trì hoãn','để mai','nước đến chân','nước tới chân','lề mề','chần chừ','dây dưa','sát giờ mới'],
    'a-xung-dot':['cãi','la mắng','quát','đóng cửa phòng','không nói chuyện','xung đột','mâu thuẫn','to tiếng','giận dỗi','cự cãi'],
    'a-nep-nha':['giờ giấc','không dậy nổi','dậy không nổi','ngủ dậy muộn','lộn xộn','không có nếp','ngủ muộn','dậy muộn','ăn uống thất thường','thức khuya','không đúng giờ'],
    'a-moi-truong':['ồn ào','bạn xấu','bạn bè rủ','không có chỗ học','nhiều nhiễu','bị bạn kéo','phòng bừa'],
    'i-dong-luc':['lười','không muốn học','chán học','phải nhắc','bị ép','không có động lực','uể oải','học đối phó','nhắc mãi'],
    'i-niem-tin':['không làm được','dốt','kém cỏi','tự ti','không tin vào','mình không giỏi','không bằng ai'],
    'i-so-sai':['sợ sai','sợ bị chê','sợ điểm kém','không dám','né bài khó','sợ bị mắng'],
    'i-cam-xuc':['khóc','cáu','căng thẳng','stress','lo âu','buồn bã','áp lực','mất ngủ','hoảng','bực bội'],
    'i-buong':['bỏ cuộc','nản','bỏ dở','nhanh chán','cả thèm chóng chán','buông'],
    'g-mo-ho':['không biết muốn gì','không có mục tiêu','mục tiêu mơ hồ','không biết học để làm gì','chưa có ước mơ'],
    'g-nguoi-lon':['bố mẹ muốn','mẹ muốn con','ba muốn con','bắt con','ép con','theo ý bố','theo ý mẹ'],
    'g-ngan-han':['chỉ lo điểm','điểm số','điểm kém','học thêm nhiều','chạy điểm'],
    'g-lech':['kỳ vọng','không như mong đợi','không giống ý','bố mẹ mong'],
    'g-dinh-huong':['chọn ngành','hướng nghiệp','chọn trường','định hướng','thi khối nào','sau này làm gì'],
    't-phuong-phap':['học vẹt','không biết cách học','học mãi không vào','học không vào','phương pháp học','học trước quên sau'],
    't-tap-trung':['mất tập trung','xao nhãng','không tập trung','ngồi không yên','lơ đãng','hay quên'],
    't-diem-manh':['không biết mình giỏi gì','không biết điểm mạnh','chưa thấy mình giỏi'],
    't-hong-goc':['mất gốc','toán con yếu','môn yếu','yếu môn','học yếu','con yếu','hổng kiến thức','yếu toán','yếu anh','yếu văn','kiến thức nền','theo không kịp'],
    't-quan-ly':['không quản lý được thời gian','quá tải','không kịp','thời gian biểu','ôm đồm','không sắp xếp']
  },
  nc:{ 'thi-cu':['thi vào 10','thi vào lớp 10','thi đại học','kỳ thi','ôn thi','thi chuyển cấp'], 'nhip-song':['ngủ','mệt mỏi','sức khoẻ','ăn uống'],
       'giao-tiep':['nhút nhát','ngại nói','rụt rè','ít bạn'], 'phu-huynh':['bố mẹ không biết cách','không biết làm sao','bất lực'],
       'ket-qua':['điểm thấp','học lực','kết quả học'], 'tu-hoc':['tự học','tự giác'] },
  ss:{ 0:['không cần','bình thường mà','chưa thấy vấn đề','tự nó sẽ khác'], 1:['cũng muốn nhưng','phân vân','chưa chắc','không biết có nên'],
       2:['muốn thay đổi','sẵn sàng','quyết tâm','cần giúp','muốn bắt đầu'], 3:['đã bắt đầu','đang thử','đang làm','mấy tuần nay đã'], 4:['đã giữ được','duy trì','đều đặn mấy tháng'] },
  tn:{ 'diem-manh':['giỏi','khéo','có năng khiếu','điểm mạnh','nổi bật'], 'to-mo':['tò mò','hay hỏi','thích tìm hiểu','ham đọc','đam mê'],
       'cam-ket-pm':['bố mẹ sẵn sàng','cam kết','quyết tâm đồng hành','sẵn lòng'], 'thoi-gian':['dành thời gian','có thời gian','mỗi tối đều'],
       'thanh-tich':['từng đạt','giải','học sinh giỏi','đã từng'], 'ho-tro':['ông bà','thầy cô quan tâm','bạn thân','anh chị'],
       'moi-truong':['góc học riêng','nhà yên tĩnh','phòng riêng'], 'tai-nguyen':['sách','khoá học','gia sư','máy tính học'] },
  manh:['rất','quá','luôn','suốt','tối nào','nào cũng','mãi','suốt ngày','hằng ngày','hàng ngày','ngày nào cũng','hoàn toàn','cực kỳ','lúc nào cũng','nghiêm trọng'],
  phu:['không còn','đã hết','đỡ hơn','ít khi','thỉnh thoảng']
};
/* Vấn đề → nhu cầu (khi lời kể không nói thẳng nhu cầu) */
G.CO_VD_NC = { 'a-thiet-bi':'thiet-bi', 'a-tri-hoan':'thoi-quen', 'a-xung-dot':'ket-noi', 'a-nep-nha':'nhip-song', 'a-moi-truong':'thoi-quen',
  'i-dong-luc':'dong-luc', 'i-niem-tin':'dong-luc', 'i-so-sai':'cam-xuc', 'i-cam-xuc':'cam-xuc', 'i-buong':'dong-luc',
  'g-mo-ho':'dinh-huong', 'g-nguoi-lon':'ket-noi', 'g-ngan-han':'ket-qua', 'g-lech':'ket-noi', 'g-dinh-huong':'dinh-huong',
  't-phuong-phap':'tu-hoc', 't-tap-trung':'tu-hoc', 't-diem-manh':'dinh-huong', 't-hong-goc':'ket-qua', 't-quan-ly':'thoi-quen' };

/* ══════════ 6 · MẪU KẾT QUẢ ĐỊNH DẠNG TỐT (theo nhu cầu) ══════════
   kq: kết quả (thể khẳng định, trong tầm tay) · do: đo bằng gì · cs: chỉ số baseline cần ghi */
G.CO_KQ = {
  'ket-qua':   { kq:'con tự ôn môn yếu nhất 30 phút mỗi ngày học và cải thiện điểm bài kiểm tra kế tiếp', do:'Bảng tick ôn tập + điểm hai bài kiểm gần nhất', cs:'Số buổi ôn môn yếu / tuần' },
  'thoi-quen': { kq:'con tự ngồi vào bàn học đúng giờ đã chọn ít nhất 5/7 ngày, không cần nhắc', do:'Bảng tick tự giác có giờ bắt đầu', cs:'Số ngày tự ngồi vào bàn đúng giờ / tuần' },
  'dong-luc':  { kq:'con tự nói được lý do học của chính mình và tự chọn một việc học mỗi ngày', do:'Thang động lực 0–10 hằng tuần + nhật ký việc tự chọn', cs:'Điểm thang động lực tự chấm' },
  'dinh-huong':{ kq:'con có một mục tiêu 90 ngày do chính con đặt, kèm kế hoạch mốc tuần', do:'Bản mục tiêu + kế hoạch có mốc tuần', cs:'Con nói được mục tiêu của mình (có / chưa)' },
  'ket-noi':   { kq:'cha mẹ và con có ít nhất một cuộc họp nhà 15 phút mỗi tuần, ai cũng được nói hết ý', do:'Biên bản họp nhà 3 dòng + thang cảm xúc', cs:'Số lần to tiếng / tuần' },
  'thiet-bi':  { kq:'con học xong việc chính trước khi dùng máy, và cất máy ngoài phòng ngủ trước 22 giờ', do:'Bảng giờ dùng máy của cả nhà', cs:'Giờ dùng máy giải trí / ngày' },
  'cam-xuc':   { kq:'con gọi tên được cảm xúc và chọn một cách tự điều chỉnh trước khi phản ứng', do:'Báo cảm xúc hằng tối + số lần bùng nổ / tuần', cs:'Số lần bùng nổ cảm xúc / tuần' },
  'tu-hoc':    { kq:'con dùng một phương pháp học chủ động (phiên 25–5, tự giảng lại) trong mỗi buổi học', do:'Bảng phiên học có mục tiêu và tự chấm', cs:'Số phiên học có mục tiêu / tuần' },
  'nhip-song': { kq:'con ngủ trước 23 giờ và dậy đúng giờ ít nhất 5/7 ngày', do:'Nhật ký giờ ngủ – dậy', cs:'Số ngày ngủ trước 23 giờ / tuần' },
  'giao-tiep': { kq:'con chủ động nói ý kiến của mình ít nhất một lần mỗi ngày ở nhà hoặc ở lớp', do:'Nhật ký "một lần lên tiếng"', cs:'Số lần chủ động lên tiếng / tuần' },
  'thi-cu':    { kq:'con đi đúng kế hoạch ôn thi theo tuần và làm đủ đề luyện đã định', do:'Kế hoạch ôn thi + số đề đã làm và điểm', cs:'Số đề luyện / tuần' },
  'phu-huynh': { kq:'cha mẹ dùng câu mời thay câu ra lệnh và giữ một nghi thức đồng hành hằng tuần', do:'Bảng đếm câu mời / câu ra lệnh của cha mẹ', cs:'Số câu ra lệnh / ngày' }
};
