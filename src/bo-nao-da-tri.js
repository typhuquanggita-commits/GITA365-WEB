/* ═══════════════════════════════════════════════════════════════
   GITA 365 — BỘ NÃO ĐA TRÍ · KHO TRÍ TUỆ · TẢNG BĂNG GIÁ TRỊ

   Chủ hệ: "GITA365 tự vận hành, tự tối ưu từng token, tư duy cấp hệ
   thống; tổng hợp trí tuệ 500.000 cuốn sách hay nhất; tích hợp Claude ·
   DeepSeek · ChatGPT · Grok · Gemini; khách chạm được chỉ 10% giá trị."

   ══ BA PHẦN, MỖI PHẦN NÓI THẬT ══
   1. BỘ NÃO ĐA TRÍ — màn điều khiển của may-chu/bo-nao-da-tri.js. Mọi
      lượt qua cổng Điều 13 (soatRaNhaCungCap). Định tuyến rẻ trước, đệm
      0 token, ngân sách ngày. Tự tối ưu = ĐỀ XUẤT hạ bậc từ điểm chấm
      thật; chủ hệ quyết (AT5).
   2. KHO TRÍ TUỆ — "500.000 cuốn" là HƯỚNG, không phải con số đã có.
      Chép toàn văn sách còn bản quyền là vi phạm, nên kho chứa NGUYÊN LÝ
      viết lại bằng lời GITA + NGUỒN + GIỚI HẠN — cùng khuôn với G.BAIHOC
      (màn tu-duy). Số nguyên lý hiển thị là số ĐẾM THẬT. Mở rộng qua
      đường duyệt tài liệu đã có (duyet-tai-lieu), không qua cửa sau.
      Tìm kiếm chạy trên máy (bỏ dấu tiếng Việt) — hợp với dữ liệu E2EE.
   3. TẢNG BĂNG GIÁ TRỊ — 10% khách chạm, 90% chìm. Mỗi lớp chìm TRỎ vào
      cơ chế đang chạy (v:/g:), đo sống bằng G.h16DoTro và ở CI
      (tools/do-16-he.js). "Thèm khát · trung thành" đạt bằng TIẾN BỘ
      THẤY ĐƯỢC + hé lộ phía trước, KHÔNG bằng chiêu thúc ép — trỏ luật
      đạo đức tiếp thị đã có (CWOW_LUAT · pcnSoatDaoDuc).
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;
G.VIEWS = G.VIEWS || {};

(function () {
var U = G.U, h = U.h, ic = U.ic;

/* ═══════════════ KHO TRÍ TUỆ ═══════════════ */
G.TT_MIEN = [
  { ma: 'CON', ten: 'Nuôi dạy con', ap: 'v:so-tay-gia-dinh' },
  { ma: 'HOC', ten: 'Khoa học học tập', ap: 'v:lo-trinh' },
  { ma: 'TQ',  ten: 'Thói quen · tự quản', ap: 'v:thoi-quen' },
  { ma: 'GT',  ten: 'Giao tiếp', ap: 'v:ngon-tu' },
  { ma: 'LD',  ten: 'Lãnh đạo · quản trị', ap: 'v:kpi-100' },
  { ma: 'CL',  ten: 'Chiến lược', ap: 'v:ban-do-chien-luoc' },
  { ma: 'KH',  ten: 'Khách hàng · tiếp thị', ap: 'v:chuoi-wow' },
  { ma: 'VH',  ten: 'Vận hành · hệ thống', ap: 'v:cai-tien' },
  { ma: 'TC',  ten: 'Tài chính', ap: 'v:tai-chinh-ceo' },
  { ma: 'DD',  ten: 'Ý nghĩa · đạo đức', ap: 'v:tam-nhin' }
];

/* Nguyên lý viết lại bằng lời GITA — KHÔNG trích nguyên văn. `ranhGioi`
   bắt buộc: một nguyên lý không có giới hạn sẽ bị dùng ở chỗ nó sai. */
function n(ma, mien, ten, nguyenLy, nguonGoc, ranhGioi, tu) {
  return { ma: 'TT-' + mien + '-' + ma, mien: mien, ten: ten, nguyenLy: nguyenLy, nguonGoc: nguonGoc, ranhGioi: ranhGioi, tu: tu || '' };
}
G.TT_KHO = [
  n('01', 'CON', 'Kết nối trước, chuyển hướng sau', 'Khi con đang xúc động, làm dịu và kết nối cảm xúc trước; chỉ khi con bình tĩnh mới dạy điều đúng sai.',
    'Daniel J. Siegel & Tina Payne Bryson — The Whole-Brain Child', 'Không áp dụng khi con đang gặp nguy hiểm — an toàn trước, kết nối sau.', 'cam xuc khoc gian an ui'),
  n('02', 'CON', 'Gọi tên cảm xúc để làm dịu', 'Giúp con đặt tên cho cảm xúc ("con đang thất vọng") — gọi được tên thì cảm xúc bớt chi phối.',
    'Daniel J. Siegel & Tina Payne Bryson — The Whole-Brain Child', 'Không gán cảm xúc thay con; hỏi và để con xác nhận.', 'cam xuc ten goi'),
  n('03', 'CON', 'Thừa nhận cảm xúc, mô tả thay vì phán xét', 'Lắng nghe và thừa nhận cảm xúc của con; mô tả điều nhìn thấy thay vì dán nhãn tính cách.',
    'Adele Faber & Elaine Mazlish — How to Talk So Kids Will Listen & Listen So Kids Will Talk', 'Thừa nhận cảm xúc không có nghĩa chấp nhận mọi hành vi.', 'lang nghe noi chuyen'),
  n('04', 'CON', 'Khen nỗ lực và chiến lược', 'Khen cách con làm và nỗ lực, không khen "con thông minh" — để con tin năng lực lớn lên được.',
    'Carol S. Dweck — Mindset', 'Không phải "cứ cố là được"; chính tác giả cảnh báo tư duy phát triển giả — cần kèm chiến lược và hỗ trợ.', 'khen tu duy phat trien'),
  n('01', 'HOC', 'Tự kiểm tra bền hơn đọc lại', 'Bắt não nhớ lại (tự hỏi, làm thẻ, làm bài) giữ kiến thức lâu hơn đọc đi đọc lại.',
    'Peter C. Brown, Henry L. Roediger III, Mark A. McDaniel — Make It Stick', 'Cần phản hồi đúng/sai sau khi tự kiểm, nếu không dễ nhớ sai.', 'on tap ghi nho kiem tra'),
  n('02', 'HOC', 'Ôn giãn cách và xen kẽ', 'Ôn rải ra nhiều ngày và xen nhiều dạng bài tốt hơn dồn một lúc một dạng.',
    'Peter C. Brown, Henry L. Roediger III, Mark A. McDaniel — Make It Stick', 'Cảm giác "khó hơn" khi xen kẽ là bình thường, không phải dấu hiệu học kém.', 'on tap lich hoc'),
  n('03', 'HOC', 'Luyện tập có chủ đích', 'Mục tiêu hẹp, ngay ngoài vùng thoải mái, có phản hồi tức thì và người hướng dẫn.',
    'Anders Ericsson & Robert Pool — Peak', 'Không phải quy tắc "10.000 giờ" máy móc; chất lượng luyện tập quyết định.', 'luyen tap ky nang'),
  n('04', 'HOC', 'Dòng chảy khi thử thách vừa sức', 'Người học tập trung sâu nhất khi độ khó vừa nhỉnh hơn kỹ năng hiện có.',
    'Mihaly Csikszentmihalyi — Flow', 'Quá dễ thì chán, quá khó thì lo — cần điều chỉnh liên tục theo từng trẻ.', 'tap trung hung thu'),
  n('01', 'TQ', 'Hệ thống hơn mục tiêu', 'Kết quả đến từ hệ thống hằng ngày; cải thiện nhỏ đều đặn cộng dồn thành thay đổi lớn.',
    'James Clear — Atomic Habits', 'Mục tiêu vẫn cần để chọn hướng; hệ thống là cách đi.', 'thoi quen moi ngay'),
  n('02', 'TQ', 'Bốn luật thói quen', 'Làm cho thói quen tốt rõ ràng, hấp dẫn, dễ làm và thoả mãn; đảo ngược cả bốn cho thói quen xấu.',
    'James Clear — Atomic Habits', 'Không thay thế hỗ trợ chuyên môn khi có vấn đề sức khoẻ tâm thần.', 'thoi quen'),
  n('03', 'TQ', 'Làm việc sâu', 'Dành khối thời gian không phân tâm cho việc khó nhất — giá trị cao nhất sinh ra ở đó.',
    'Cal Newport — Deep Work', 'Không phù hợp mọi vai trò mọi lúc; việc phối hợp vẫn cần phản hồi nhanh.', 'tap trung thoi gian'),
  n('04', 'TQ', 'Đưa mọi việc ra khỏi đầu', 'Ghi mọi việc vào một nơi tin cậy và luôn xác định bước hành động tiếp theo.',
    'David Allen — Getting Things Done', 'Hệ thống chỉ có giá trị khi được rà soát định kỳ.', 'viec can lam ke hoach'),
  n('05', 'TQ', 'Bắt đầu từ hình dung kết thúc', 'Xác định điều mình muốn trở thành rồi ưu tiên việc quan trọng mà chưa khẩn cấp.',
    'Stephen R. Covey — The 7 Habits of Highly Effective People', 'Kế hoạch dài hạn cần cập nhật khi hoàn cảnh đổi.', 'muc tieu uu tien'),
  n('01', 'GT', 'Quan sát · cảm nhận · nhu cầu · đề nghị', 'Nói điều quan sát được, cảm xúc của mình, nhu cầu đứng sau và một đề nghị cụ thể.',
    'Marshall B. Rosenberg — Nonviolent Communication', 'Là khung, không phải kịch bản; nói máy móc thì người nghe thấy giả.', 'giao tiep xung dot'),
  n('02', 'GT', 'Quan tâm thật đến người khác', 'Lắng nghe, nhớ tên và quan tâm thật đến điều người kia coi trọng.',
    'Dale Carnegie — How to Win Friends and Influence People', 'Quan tâm giả để bán hàng là thao túng — GITA cấm.', 'quan he lang nghe'),
  n('03', 'GT', 'Khách hàng là nhân vật chính', 'Trong câu chuyện thương hiệu, gia đình là người hùng; GITA là người dẫn đường có kế hoạch.',
    'Donald Miller — Building a StoryBrand', 'Không hứa kết quả mà hệ không đo được.', 'thuong hieu cau chuyen'),
  n('01', 'LD', 'Đòn bẩy của người quản lý', 'Đầu ra của người quản lý là đầu ra của cả đội — ưu tiên việc có đòn bẩy cao.',
    'Andrew S. Grove — High Output Management', 'Đòn bẩy không phải ôm thêm việc; là chọn việc nhân lên người khác.', 'quan ly doi ngu'),
  n('02', 'LD', 'Mục tiêu và kết quả then chốt', 'Một mục tiêu định tính đi kèm vài kết quả then chốt đo được, rà soát đều.',
    'John Doerr — Measure What Matters', 'OKR không gắn thẳng vào lương thưởng, kẻo người ta đặt mục tiêu thấp.', 'okr kpi muc tieu'),
  n('03', 'LD', 'Đúng người trước, việc sau · bánh đà', 'Chọn đúng người trước khi chọn hướng; tiến bộ đến từ nhiều cú đẩy nhất quán như bánh đà.',
    'Jim Collins — Good to Great', 'Nghiên cứu hồi cứu; vài công ty được chọn sau đó đã sa sút.', 'tuyen dung tang truong'),
  n('04', 'LD', 'Tự chủ · làm chủ · mục đích', 'Với việc sáng tạo, động lực bền đến từ tự chủ, tiến bộ thật và mục đích hơn là thưởng phạt.',
    'Daniel H. Pink — Drive', 'Việc lặp đơn giản thì thưởng theo kết quả vẫn có tác dụng.', 'dong luc nhan su'),
  n('05', 'LD', 'Tập trung vào đóng góp', 'Người điều hành hiệu quả quản thời gian trước tiên và hỏi "mình đóng góp được gì".',
    'Peter F. Drucker — The Effective Executive', '—', 'hieu qua thoi gian'),
  n('06', 'LD', 'Tổ chức học tập', 'Tổ chức bền khi mọi người cùng học, chia sẻ mô hình tư duy và nhìn hệ thống thay vì đổ lỗi.',
    'Peter M. Senge — The Fifth Discipline', 'Cần thời gian và lãnh đạo làm gương; không có lối tắt.', 'hoc tap to chuc he thong'),
  n('01', 'CL', 'Tạo đại dương xanh', 'Mở không gian thị trường mới bằng bốn thao tác: loại bỏ · giảm · tăng · tạo mới.',
    'W. Chan Kim & Renée Mauborgne — Blue Ocean Strategy', 'Đại dương xanh rồi cũng có người theo; cần năng lực khó sao chép.', 'chien luoc thi truong'),
  n('02', 'CL', 'Việc khách cần hoàn thành', 'Khách "thuê" sản phẩm để hoàn thành một việc trong đời họ — hiểu việc ấy hơn hiểu nhân khẩu học.',
    'Clayton M. Christensen — Competing Against Luck', 'Một khách có nhiều việc; phỏng vấn sâu mới thấy.', 'khach hang nhu cau jtbd'),
  n('03', 'CL', 'Đổi mới đột phá', 'Đột phá thường bắt đầu ở phân khúc bị đối thủ lớn coi thường, đủ tốt và rẻ hơn.',
    'Clayton M. Christensen — The Innovator\'s Dilemma', 'Không phải mọi cái mới đều là đột phá.', 'doi moi canh tranh'),
  n('04', 'CL', 'Vượt vực thẳm', 'Chinh phục trọn một phân khúc đầu cầu trước khi mở rộng ra thị trường đại chúng.',
    'Geoffrey A. Moore — Crossing the Chasm', 'Viết cho sản phẩm công nghệ; cần chuyển ngữ cho giáo dục gia đình.', 'mo rong thi truong toan cau'),
  n('05', 'CL', 'Biết người biết ta', 'Hiểu rõ mình và đối thủ; thắng giỏi nhất là thắng mà không phải giao tranh.',
    'Tôn Tử — Binh pháp (sách công cộng)', 'Ngôn ngữ chiến tranh không dùng với khách hàng.', 'doi thu canh tranh'),
  n('06', 'CL', 'Định vị trong tâm trí', 'Thương hiệu thắng khi chiếm được một vị trí rõ ràng, đơn giản trong tâm trí khách.',
    'Al Ries & Jack Trout — Positioning', 'Định vị phải đúng với trải nghiệm thật, không chỉ là khẩu hiệu.', 'dinh vi thuong hieu'),
  n('07', 'CL', 'Từ 0 đến 1', 'Giá trị lớn nhất đến từ tạo ra điều mới khác biệt, không phải sao chép tốt hơn.',
    'Peter Thiel & Blake Masters — Zero to One', 'Bối cảnh khởi nghiệp công nghệ Mỹ; quan điểm độc quyền gây tranh luận.', 'khac biet sang tao'),
  n('01', 'KH', 'Sáu nguyên tắc ảnh hưởng', 'Có đi có lại · cam kết nhất quán · bằng chứng xã hội · thiện cảm · uy tín · khan hiếm.',
    'Robert B. Cialdini — Influence', 'GITA CẤM khan hiếm giả và thúc ép ("chỉ còn", "kẻo lỡ") — trỏ CWOW_LUAT.', 'thuyet phuc ban hang'),
  n('02', 'KH', 'Vòng gắn bó sản phẩm', 'Kích hoạt → hành động dễ → phần thưởng → người dùng đầu tư thêm, tạo lý do quay lại.',
    'Nir Eyal — Hooked', 'Chỉ dùng khi sản phẩm thật sự giúp người dùng; không thiết kế gây nghiện cho trẻ em.', 'gan bo quay lai trung thanh'),
  n('01', 'VH', 'Xây · đo · học', 'Làm phiên bản nhỏ nhất để học, đo phản hồi thật rồi quyết giữ hướng hay đổi hướng.',
    'Eric Ries — The Lean Startup', 'Không phải cái cớ để phát hành sản phẩm kém chạm tới trẻ em.', 'thu nghiem mvp'),
  n('02', 'VH', 'Hệ chỉ nhanh bằng khâu thắt cổ chai', 'Tìm ràng buộc lớn nhất, khai thác tối đa nó; tối ưu chỗ khác là phí công.',
    'Eliyahu M. Goldratt — The Goal', 'Thắt cổ chai di chuyển sau khi gỡ — phải đo lại.', 'nut that van hanh toi uu'),
  n('03', 'VH', 'Điểm đòn bẩy và vòng phản hồi', 'Hành vi của hệ sinh ra từ cấu trúc vòng phản hồi; đổi cấu trúc mạnh hơn đổi thông số.',
    'Donella H. Meadows — Thinking in Systems', 'Hệ phức tạp phản ứng chậm và bất ngờ; thay đổi từng bước.', 'he thong tu duy'),
  n('04', 'VH', 'Phản mong manh', 'Thử nhỏ, nhiều lần, giới hạn thiệt hại để hệ mạnh lên nhờ biến động.',
    'Nassim Nicholas Taleb — Antifragile', 'Không đem dữ liệu trẻ em ra "thử để học".', 'rui ro bien dong'),
  n('05', 'VH', 'Tư duy nhanh và chậm', 'Trực giác nhanh nhưng thiên lệch; quyết định quan trọng cần chậm lại, có số liệu và người thứ hai.',
    'Daniel Kahneman — Thinking, Fast and Slow', 'Một số nghiên cứu mồi trong sách đã không lặp lại được.', 'quyet dinh thien kien'),
  n('06', 'VH', 'Nguyên tắc thành văn', 'Viết nguyên tắc ra giấy, minh bạch, rà lại sau mỗi sai lầm để hệ học.',
    'Ray Dalio — Principles', 'Minh bạch triệt để cần văn hoá an toàn tâm lý đi kèm.', 'nguyen tac van hoa'),
  n('01', 'TC', 'Hành vi hơn kiến thức', 'Thành công tài chính phụ thuộc vào hành vi kiên nhẫn hơn là công thức.',
    'Morgan Housel — The Psychology of Money', 'Không phải lời khuyên đầu tư.', 'tai chinh tiet kiem'),
  n('02', 'TC', 'Trả cho mình trước', 'Để dành một phần thu nhập trước khi chi; để lãi kép làm việc theo thời gian.',
    'George S. Clason — The Richest Man in Babylon', 'Ngụ ngôn cổ; bối cảnh lãi suất hiện nay khác.', 'tiet kiem lai kep'),
  n('01', 'DD', 'Chọn thái độ, tìm ý nghĩa', 'Dù hoàn cảnh nào, con người vẫn giữ tự do chọn thái độ và tìm ý nghĩa.',
    'Viktor E. Frankl — Man\'s Search for Meaning', 'Không dùng để bảo người đang đau "hãy tích cực lên".', 'y nghia vuot kho'),
  n('02', 'DD', 'Trong và ngoài tầm tay', 'Phân biệt điều mình kiểm soát được với điều không, dồn sức vào phần trong tay.',
    'Epictetus — Enchiridion · Marcus Aurelius — Meditations (sách công cộng)', 'Chấp nhận không có nghĩa thờ ơ trước bất công.', 'kiem soat binh tam'),
  n('03', 'DD', 'Học và nghĩ đi cùng nhau', 'Học mà không nghĩ thì mờ mịt, nghĩ mà không học thì nguy.',
    'Khổng Tử — Luận ngữ (sách công cộng)', '—', 'hoc tu duy')
];

G.ttBoDau = function (s) {
  return String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[đĐ]/g, 'd').toLowerCase();
};
/* Gộp MỌI nguồn tri thức đang nạp trên máy — kho mới + G.BAIHOC (tu-duy)
   + G.SACH (sách gốc, chỉ có khi vai được cấp gói nghề). Không chép. */
G.ttTatCa = function () {
  var ds = G.TT_KHO.map(function (x) { return { ma: x.ma, ten: x.ten, nguyenLy: x.nguyenLy, nguonGoc: x.nguonGoc, ranhGioi: x.ranhGioi, tu: x.tu, kho: 'Kho trí tuệ' }; });
  (G.BAIHOC || []).forEach(function (b) {
    ds.push({ ma: b.id, ten: b.ten, nguyenLy: b.nguyenLy, nguonGoc: b.nguonGoc || '', ranhGioi: Array.isArray(b.ranhGioi) ? b.ranhGioi.join(' · ') : (b.ranhGioi || ''), tu: '', kho: 'Hệ tư duy mới' });
  });
  (G.SACH || []).forEach(function (s, i) {
    ds.push({ ma: 'SACH-' + (i + 1), ten: s.title, nguyenLy: s.summary || '', nguonGoc: 'Sách gốc Học viện GITA', ranhGioi: '', tu: '', kho: 'Sách gốc' });
  });
  return ds;
};
G.ttTim = function (q, k) {
  var tu = G.ttBoDau(q).split(/[^a-z0-9]+/).filter(function (w) { return w.length >= 2; });
  var ds = G.ttTatCa();
  if (!tu.length) return ds.slice(0, k || ds.length);
  return ds.map(function (x) {
    var t = G.ttBoDau([x.ten, x.nguyenLy, x.tu, x.nguonGoc].join(' ')), d = 0;
    tu.forEach(function (w) { if (t.indexOf(w) >= 0) d += (G.ttBoDau(x.ten).indexOf(w) >= 0 ? 3 : 1); });
    return { x: x, d: d };
  }).filter(function (o) { return o.d > 0; }).sort(function (a, b) { return b.d - a.d; })
    .slice(0, k || 50).map(function (o) { return o.x; });
};
/* Dạng NÉN gửi kèm câu hỏi — ~40 token/nguyên lý, trần 800 ký tự ở máy chủ. */
G.ttGon = function (ds) {
  return ds.map(function (x) { return '- ' + x.ten + ': ' + x.nguyenLy + ' (' + String(x.nguonGoc).split(' — ')[0] + ')'; }).join('\n').slice(0, 800);
};

/* ═══════════════ TẢNG BĂNG GIÁ TRỊ ═══════════════ */
G.TB_TANG = {
  noi: [
    { ten: 'Việc hôm nay cho cả nhà', tro: 'v:hom-nay' },
    { ten: 'Lộ trình học của con', tro: 'v:lo-trinh' },
    { ten: 'Thẻ vùng mạnh', tro: 'v:vung-manh' },
    { ten: 'Coach đồng hành', tro: 'v:coach-kh' },
    { ten: 'Hành trình 5 tầng', tro: 'v:hanh-trinh-5-tang' }
  ],
  chim: [
    { ten: 'Hiến pháp bảo vệ trẻ em và dữ liệu gia đình', vi: 'Không một ghi chép nhận dạng được nào rời hệ — kể cả tới AI.', tro: ['v:phap-ly', 'v:an-toan-du-lieu'] },
    { ten: '100 trợ lý AI có cổng', vi: 'Mỗi cửa có trợ lý sở hữu; tiền và trẻ em luôn có người ký.', tro: ['g:DP_TRO_LY', 'v:dieu-phoi'] },
    { ten: 'Bộ não đa trí', vi: 'Năm họ mô hình, định tuyến rẻ trước, đệm 0 token, hội đồng cho việc lớn.', tro: ['v:bo-nao-da-tri'] },
    { ten: 'Kho trí tuệ có nguồn và giới hạn', vi: 'Nguyên lý từ sách kinh điển, viết lại bằng lời GITA, kèm chỗ không được dùng.', tro: ['g:TT_KHO', 'v:tu-duy', 'v:sach'] },
    { ten: 'Đội đồng hành và chuẩn nghề', vi: 'Người thật được huấn luyện theo chuẩn, đo bằng điểm chạm.', tro: ['v:doi-dong-hanh', 'v:diem-cham-1000'] },
    { ten: 'Đo tiến bộ thật', vi: 'Tiến bộ so với chính mình hôm qua, không xếp hạng con nhà người ta.', tro: ['v:tien-bo', 'v:do-luong-kh'] },
    { ten: 'Tự lành và sao lưu', vi: 'Dữ liệu tự chữa, ngăn khoang cô lập sự cố, sao lưu không mồ côi.', tro: ['v:soat-day-du', 'v:tu-nang-cap'] },
    { ten: 'Kỷ luật chi phí giữ giá thấp', vi: '0đ hạ tầng tới hàng trăm nghìn tài khoản — tiết kiệm trả lại cho gia đình.', tro: ['v:chi-phi', 'v:suc-chua-toc-do'] },
    { ten: 'Tiếp thị có đạo đức', vi: 'Không khan hiếm giả, không thúc ép; hé lộ phía trước thay vì đe doạ bỏ lỡ.', tro: ['v:chuoi-wow', 'v:phim-cau-noi'] },
    { ten: '16 hệ đo được', vi: 'Mỗi hệ trỏ vào thứ đang chạy; CI chặn khi một con trỏ chết.', tro: ['v:he-16'] }
  ]
};

/* Hành trình gắn bó — mỗi chặng mở thêm phần chìm khi gia đình SẴN SÀNG.
   Gắn bó bằng tiến bộ thấy được; mỗi chặng có điều CẤM để không trượt
   sang thao túng. `nl` trỏ nguyên lý trong TT_KHO (CI kiểm mã tồn tại). */
G.TB_HANH_TRINH = [
  { ma: 'HT1', ten: 'Chạm', thay: 'Một việc nhỏ thắng ngay trong ngày đầu', mo: 'Việc hôm nay · hồ sơ nhà',
    do: 'Hoàn thành việc đầu tiên trong 24 giờ', ganBo: 'Thắng nhỏ đầu tiên', cam: 'Ép mua gói ngay buổi đầu', nl: ['TT-TQ-01', 'TT-KH-02'] },
  { ma: 'HT2', ten: 'Hiểu', thay: 'Bản đồ vùng mạnh của chính con mình', mo: 'Thẻ vùng mạnh · coach đọc cùng',
    do: 'Đã đọc thẻ và có một câu hỏi cho coach', ganBo: 'Cảm giác được thấu hiểu', cam: 'Dán nhãn con là "yếu"', nl: ['TT-CON-01', 'TT-CL-02'] },
  { ma: 'HT3', ten: 'Làm', thay: 'Thói quen gia đình đều đặn', mo: 'Thói quen · lộ trình học',
    do: 'Chuỗi ngày giữ thói quen', ganBo: 'Tiến bộ thấy được mỗi tuần', cam: 'Phạt mất chuỗi, đếm ngược gây lo', nl: ['TT-TQ-02', 'TT-HOC-01'] },
  { ma: 'HT4', ten: 'Thành', thay: 'Minh chứng con lớn lên so với chính con', mo: 'Đo tiến bộ · vinh danh',
    do: 'Chỉ số tiến bộ vượt mốc nền của chính gia đình', ganBo: 'Tự hào có bằng chứng', cam: 'Xếp hạng so sánh giữa các gia đình', nl: ['TT-CON-04', 'TT-HOC-03'] },
  { ma: 'HT5', ten: 'Lan toả', thay: 'Câu chuyện nhà mình giúp nhà khác', mo: 'Đồng hành · giới thiệu tự nguyện',
    do: 'Giới thiệu tự nguyện, không kèm thưởng ép', ganBo: 'Ý nghĩa và cộng đồng', cam: 'Thưởng giới thiệu ép chia sẻ', nl: ['TT-DD-01', 'TT-GT-03'] }
];

/* ═══════════════ ĐIỀU KHIỂN ═══════════════ */
var NGAN = [
  { ma: 'nao', ten: 'Bộ não đa trí', ic: 'orbit' },
  { ma: 'kho', ten: 'Kho giải pháp', ic: 'vault' },
  { ma: 'tinhtuy', ten: 'Tinh túy 5 bộ não', ic: 'shield' },
  { ma: 'khoahoc', ten: 'Vòng nhà khoa học', ic: 'book' },
  { ma: 'tuyen', ten: 'Tuyến chốt chặn', ic: 'list' },
  { ma: 'tri', ten: 'Kho trí tuệ', ic: 'book' },
  { ma: 'bang', ten: 'Tảng băng giá trị', ic: 'grid' },
  { ma: 'toiuu', ten: 'Tối ưu token', ic: 'lightning' }
];
G.dtNgan = G.dtNgan || 'nao';
G.dtSo = G.dtSo || null;
G.dtKq = G.dtKq || null;
G.dtTim = G.dtTim || '';
function veLai() { if (G.S && G.S.view === 'bo-nao-da-tri' && G.render) G.render(); }
G.dtMoNgan = function (m) { G.dtNgan = m; veLai(); };
G.dtTaiSo = function () {
  /* Cờ đang tải: màn vẽ lại trong lúc chờ không được bắn thêm lượt gọi. */
  if (!G.goiMayChu || G.dtDangTai) return;
  G.dtDangTai = true;
  G.goiMayChu('soDaTri', {}).then(function (x) { G.dtDangTai = false; G.dtSo = x || { ok: false, error: 'Không có phản hồi.' }; veLai(); });
};
function giaTri(id) { var e = document.getElementById(id); return e ? e.value : ''; }
G.dtHoi = function (tuBac, hoiDong, boQuaKho) {
  if (!G.goiMayChu) { U.toast('Chưa nối máy chủ.', 'err'); return; }
  var cau = giaTri('dt-cau').trim(), loai = giaTri('dt-loai') || 'soan';
  if (cau.length < 4) { U.toast('Nhập câu hỏi.', 'err'); return; }
  var kem = document.getElementById('dt-kem'), tri = kem && kem.checked ? G.ttGon(G.ttTim(cau, 3)) : '';
  G.dtCau = cau; G.dtLoai = loai;
  G.dtKq = { cho: true };
  veLai();
  G.goiMayChu(hoiDong ? 'hoiDongDaTri' : 'hoiDaTri', { cau: cau, loai: loai, triThuc: tri, tuBac: tuBac || 0, boQuaKho: !!boQuaKho }).then(function (x) {
    G.dtKq = Object.assign({ loai: loai, tri: tri, cau: cau }, x || { ok: false, error: 'Không có phản hồi.' });
    G.dtSo = null; veLai();
  });
};
G.dtLenBac = function () { var k = G.dtKq || {}; G.dtHoi((k.bac || 0) + 1); };
G.dtCham = function (tot) {
  var k = G.dtKq || {};
  if (!k.ok || !k.ncc) return;
  G.goiMayChu('chamDaTri', { loai: k.loai, ncc: k.ncc, tot: !!tot, khoa: k.khoa }).then(function (x) {
    U.toast(x && x.ok ? 'Đã ghi — bộ não học từ điểm chấm này.' : 'Không ghi được.', x && x.ok ? 'ok' : 'err');
    k.daCham = true; k.chamTot = !!tot; veLai();
  });
};
G.dtDatTim = function (v) { G.dtTim = v; veLai(); };

/* ── Kho giải pháp: hỏi một lần, dùng mãi; khi cần chỉ kiểm lại & bổ sung ── */
G.dtKho = G.dtKho || null;
G.dtKhoTai = function () {
  if (!G.goiMayChu || G.dtKhoDangTai) return;
  G.dtKhoDangTai = true;
  G.goiMayChu('dsGiaiPhap', {}).then(function (x) { G.dtKhoDangTai = false; G.dtKho = x || { ok: false, error: 'Không có phản hồi.' }; veLai(); });
};
function sauViec(x, okMsg) {
  U.toast(x && x.ok ? okMsg : ((x && x.error) || 'Không làm được.'), x && x.ok ? 'ok' : 'err');
  if (x && x.ok && x.coVan && x.coVan.length) U.toast('Cố vấn: ' + x.coVan.join(' · '), 'err');
  G.dtKho = null; G.dtSo = null; veLai();
}
G.dtLuuKho = function () {
  var k = G.dtKq || {};
  if (!k.ok || !k.traLoi) return;
  G.goiMayChu('luuGiaiPhap', { loai: k.loai, cau: k.cau || G.dtCau, traLoi: k.traLoi, ncc: k.ncc }).then(function (x) {
    if (x && x.ok) k.daLuu = true;
    sauViec(x, x && x.trangThai === 'duyet' ? 'Đã lưu vào kho (đã duyệt).' : 'Đã gửi vào kho — chờ Super Admin duyệt.');
  });
};
G.dtDuyet = function (ma, dongY) { G.goiMayChu('duyetGiaiPhap', { ma: ma, dongY: !!dongY }).then(function (x) { sauViec(x, dongY ? 'Đã duyệt.' : 'Đã bỏ bản nháp.'); }); };
G.dtBoSung = function (ma) {
  U.toast('Đang kiểm lại…', 'ok');
  G.goiMayChu('boSungGiaiPhap', { ma: ma, ghiChu: giaTri('dt-gc') }).then(function (x) {
    sauViec(x, x && x.du ? 'Giải pháp vẫn đủ — đã đóng dấu soát lại.' : 'Có phần bổ sung — bản nháp phiên bản mới chờ duyệt.');
  });
};
/* ── Tự cập nhật theo 5 hãng: canh mô hình mới, thử trên đề của GITA ── */
G.dtCanhMau = function () {
  G.dtCanh = { cho: true }; veLai();
  G.goiMayChu('canhMauDaTri', {}).then(function (x) { G.dtCanh = x || { ok: false, error: 'Không có phản hồi.' }; veLai(); });
};
G.dtThuMau = function () {
  var ncc = giaTri('dt-tm-ncc'), model = giaTri('dt-tm-mau').trim();
  if (!model) { U.toast('Nhập tên mô hình cần thử.', 'err'); return; }
  G.dtThu = { cho: true }; veLai();
  G.goiMayChu('thuMauDaTri', { ncc: ncc, model: model }).then(function (x) { G.dtThu = x || { ok: false, error: 'Không có phản hồi.' }; veLai(); });
};

/* Tự tối ưu: loại việc nào mà một bậc RẺ HƠN trần đã đạt ≥80% "tốt" qua
   ≥5 lượt chấm → đề xuất hạ trần. Máy chỉ đề xuất (AT5). */
G.dtDeXuat = function (so) {
  if (!so || !so.ok) return [];
  var bacNcc = {}; (so.ncc || []).forEach(function (n) { bacNcc[n.ma] = n.bac; });
  var ra = [];
  (so.loai || []).forEach(function (l) {
    var tot = (so.danhGia || []).filter(function (d) { return d.loai === l.ma && (d.tot + d.xau) >= 5 && d.tot / (d.tot + d.xau) >= 0.8; })
      .sort(function (a, b) { return bacNcc[a.ncc] - bacNcc[b.ncc]; })[0];
    if (tot && bacNcc[tot.ncc] < l.den)
      ra.push('«' + l.ten + '»: ' + tot.ncc + ' (bậc ' + bacNcc[tot.ncc] + ') đạt ' + Math.round(100 * tot.tot / (tot.tot + tot.xau)) +
        '% tốt qua ' + (tot.tot + tot.xau) + ' lượt → đề xuất hạ trần từ bậc ' + l.den + ' xuống ' + bacNcc[tot.ncc] + '.');
    var xau = (so.danhGia || []).filter(function (d) { return d.loai === l.ma && (d.tot + d.xau) >= 5 && d.xau / (d.tot + d.xau) > 0.5; });
    xau.forEach(function (d) { ra.push('«' + l.ten + '»: ' + d.ncc + ' bị chê ' + Math.round(100 * d.xau / (d.tot + d.xau)) + '% → đề xuất nâng bậc khởi đầu.'); });
  });
  return ra;
};

function nut(on, nd, k) { return '<button class="btn ' + (k || 'ghost') + ' sm" onclick="' + on + '">' + nd + '</button>'; }
function chuaNoi() { return '<div class="card mt tiny muted">Chưa nối máy chủ hoặc chưa tải sổ. ' + nut('G.dtTaiSo()', 'Tải lại') + '</div>'; }

function veNao() {
  var so = G.dtSo, o = '';
  if (!so) { if (G.goiMayChu) G.dtTaiSo(); o += chuaNoi(); }
  else if (!so.ok) o += '<div class="card mt" style="color:var(--gita-do)">' + h(so.error || 'Không đọc được sổ.') + '</div>';
  else {
    o += '<div class="card mt"><b>Trạng thái</b> ' + (so.bat ? '<span class="chip" style="color:var(--ok)">Đang bật</span>' :
      '<span class="chip" style="color:var(--gita-do)">Đang tắt — đặt GITA_DA_TRI_BAT = 1</span>') +
      (so.tietKiem ? ' <span class="chip">Chế độ tiết kiệm</span>' : '') +
      ' <span class="chip">Trần tải ' + (so.tranTai || 50) + '% ngân sách</span>' +
      (so.loc && so.loc.length ? ' <span class="chip" title="' + h(so.loc.map(function (x) { return x.cua + ': ' + x.luot; }).join(' · ')) + '">Lọc trước token hôm nay: ' +
        so.loc.reduce(function (s2, x) { return s2 + x.luot; }, 0) + ' lượt (0 token)</span>' : '') +
      (so.kho ? ' <span class="chip">Kho: ' + so.kho.duyet + ' giải pháp · ' + so.kho.nhap + ' chờ duyệt' + (so.kho.canSoat ? ' · ' + so.kho.canSoat + ' quá hạn soát' : '') + '</span>' : '') +
      '<table class="tbl sm mt"><tr><th>Bậc</th><th>Nhà cung cấp</th><th>Mô hình</th><th>Sẵn sàng</th><th>Ngân sách token/ngày (hiệu lực / gốc)</th><th>Cấu hình</th></tr>' +
      '<tr><td>0</td><td>Kho giải pháp + bộ nhớ đệm D1</td><td>—</td><td style="color:var(--ok)">luôn</td><td>0 token</td><td>—</td></tr>' +
      so.ncc.map(function (n) {
        return '<tr><td>' + n.bac + '</td><td>' + h(n.ten) + '</td><td class="mono">' + h(n.model || 'chưa khai') + '</td><td>' +
          (n.sanSang ? '<span style="color:var(--ok)">có</span>' : '<span class="muted">chưa</span>') + '</td><td>' +
          (n.nganNgay ? Number(n.nganNgay).toLocaleString('vi-VN') + (n.nganGoc ? ' / ' + Number(n.nganGoc).toLocaleString('vi-VN') : '') : 'hạn mức Cloudflare') +
          '</td><td class="mono tiny">' + h(n.bien) + '</td></tr>';
      }).join('') + '</table></div>';
  }
  var loai = (so && so.loai) || [{ ma: 'soan', ten: 'Soạn nháp' }];
  o += '<div class="card mt"><b>Hỏi bộ não</b><div class="row mt" style="gap:8px;flex-wrap:wrap"><select id="dt-loai">' +
    loai.map(function (l) { return '<option value="' + h(l.ma) + '"' + (G.dtLoai === l.ma ? ' selected' : '') + '>' + h(l.ten) + (l.tu ? ' · bậc ' + l.tu + '–' + l.den : '') + '</option>'; }).join('') +
    '</select><label class="tiny"><input type="checkbox" id="dt-kem" checked> Kèm 3 nguyên lý từ Kho trí tuệ</label></div>' +
    '<textarea id="dt-cau" rows="4" style="width:100%;margin-top:8px" placeholder="Không ghi tên, số điện thoại, địa chỉ của trẻ hay gia đình — cổng Điều 13 sẽ chặn.">' + h(G.dtCau || '') + '</textarea>' +
    '<div class="row mt" style="gap:8px">' + nut('G.dtHoi(0)', ic('orbit', 'w-4 h-4') + 'Hỏi (rẻ trước)', 'pri') +
    nut('G.dtHoi(0,true)', 'Hội đồng 3 trí tuệ (Super Admin)') + '</div></div>';
  var k = G.dtKq;
  if (k && k.cho) o += '<div class="card mt tiny muted">Đang hỏi…</div>';
  else if (k && !k.ok) o += '<div class="card mt" style="border-color:var(--gita-do)"><b>Không trả lời</b><div class="sm mt">' + h(k.error || k.code) + '</div>' +
    (k.ngo ? '<div class="tiny mt">Dấu hiệu: ' + h(k.ngo.map(function (x) { return x.ma; }).join(', ')) + '</div>' : '') +
    (k.daThu && k.daThu.length ? '<div class="tiny mt muted">Đã thử: ' + h(k.daThu.join(' · ')) + '</div>' : '') + '</div>';
  else if (k && k.hoiDong) o += '<div class="card mt"><b>Hội đồng</b> <span class="tiny muted">' + h(k.nhac) + '</span></div>' +
    k.hoiDong.map(function (x) {
      return '<div class="card mt"><b>' + h(x.tenNcc || x.ncc) + '</b> <span class="chip mono">' + h(x.model || '') + '</span> <span class="tiny muted">' + (x.token || 0) + ' token</span>' +
        '<div class="sm mt" style="white-space:pre-wrap">' + h(x.traLoi || x.loi || '') + '</div></div>';
    }).join('');
  else if (k && k.ok && k.tuKho) o += '<div class="card mt" style="border-color:var(--ok)"><div class="row" style="gap:6px;flex-wrap:wrap"><b>Kho giải pháp</b>' +
    '<span class="chip" style="color:var(--ok)">0 token</span><span class="chip mono">' + h(k.maGP) + ' · phiên bản ' + k.phienBan + '</span>' +
    '<span class="chip">khớp ' + k.khop + '%</span>' + (k.canSoat ? '<span class="chip" style="color:var(--gita-do)">quá hạn soát — nên kiểm lại</span>' : '') + '</div>' +
    '<div class="tiny muted mt">Câu gốc: ' + h(k.cauGoc) + '</div>' +
    '<div class="sm mt" style="white-space:pre-wrap">' + h(k.traLoi) + '</div>' +
    '<div class="row mt" style="gap:8px">' + nut('G.dtBoSung(\'' + h(k.maGP) + '\')', 'Kiểm lại & bổ sung') +
    nut('G.dtHoi(0,false,true)', 'Hỏi mới (bỏ qua kho)') + '</div></div>';
  else if (k && k.ok) o += '<div class="card mt"><div class="row" style="gap:6px;flex-wrap:wrap"><b>' + h(k.tenNcc || k.ncc) + '</b>' +
    '<span class="chip">bậc ' + k.bac + '</span>' + (k.tuDem ? '<span class="chip" style="color:var(--ok)">từ bộ đệm · 0 token</span>' : '<span class="chip">' + k.token + ' token</span>') +
    (k.model ? '<span class="chip mono">' + h(k.model) + '</span>' : '') +
    (k.dinhTuyen && k.dinhTuyen.doChac !== null && k.dinhTuyen.doChac !== undefined ?
      '<span class="chip"' + (k.dinhTuyen.chac ? '' : ' style="color:var(--gita-sau)"') + '>định tuyến ' +
      (k.dinhTuyen.chac ? 'chắc · chênh ' + k.dinhTuyen.doChac : 'chưa chắc — nên hỏi hội đồng') + '</span>' : '') + '</div>' +
    '<div class="sm mt" style="white-space:pre-wrap">' + h(k.traLoi) + '</div><div class="tiny muted mt">' + h(k.nhac || 'Bản nháp — người phụ trách kiểm chứng.') + '</div>' +
    '<div class="row mt" style="gap:8px">' + (k.daCham ? '<span class="tiny muted">Đã chấm.</span>' : nut('G.dtCham(true)', 'Tốt') + nut('G.dtCham(false)', 'Chưa tốt')) +
    (k.chamTot && !k.daLuu ? nut('G.dtLuuKho()', ic('vault', 'w-4 h-4') + 'Lưu vào kho giải pháp', 'pri') : '') +
    (k.coTheLenBac || k.tuDem ? nut('G.dtLenBac()', 'Lên bậc — hỏi trí tuệ mạnh hơn') : '') + '</div></div>';
  return o;
}

function veKho() {
  var kh = G.dtKho;
  if (!kh) { if (G.goiMayChu) G.dtKhoTai(); return chuaNoi(); }
  if (!kh.ok) return '<div class="card mt" style="color:var(--gita-do)">' + h(kh.error || '') + '</div>';
  var duyet = kh.ds.filter(function (r) { return r.trangThai === 'duyet'; }), nhap = kh.ds.filter(function (r) { return r.trangThai === 'nhap'; });
  var o = '<div class="card mt"><b>Kho giải pháp — hỏi một lần, dùng mãi</b><div class="tiny muted mt">Câu hỏi tương tự (khớp ≥ 60% từ khoá) được trả thẳng từ kho, 0 token. ' +
    'Người nhà gửi vào → Super Admin duyệt. Mỗi giải pháp quá ' + kh.hanSoat + ' ngày chưa soát được đánh dấu; "Kiểm lại & bổ sung" chỉ hỏi AI phần THIẾU/CŨ (≤ 400 token), ' +
    'phần thêm thành phiên bản mới chờ duyệt.</div>' +
    '<input id="dt-gc" class="mt" style="width:100%" placeholder="Ghi chú khi kiểm lại (tuỳ chọn): điều gì đã thay đổi?"></div>';
  if (nhap.length) o += '<div class="card mt" style="border-color:var(--gita-sau)"><b>Chờ duyệt · ' + nhap.length + '</b>' + nhap.map(function (r) {
    return '<div class="mt"><span class="chip mono">' + h(r.ma) + '</span> ' + (r.goc ? '<span class="chip">bổ sung cho ' + h(r.goc) + '</span> ' : '') +
      '<b>' + h(r.cauHoi) + '</b> <span class="tiny muted">đề bởi ' + h(r.nguoiDe || '') + '</span>' +
      '<div class="sm" style="white-space:pre-wrap">' + h(r.giaiPhap) + '</div><div class="row" style="gap:8px">' +
      nut('G.dtDuyet(\'' + h(r.ma) + '\',true)', 'Duyệt', 'pri') + nut('G.dtDuyet(\'' + h(r.ma) + '\',false)', 'Bỏ') + '</div></div>';
  }).join('') + '</div>';
  o += duyet.map(function (r) {
    return '<div class="card mt"><div class="row" style="gap:6px;flex-wrap:wrap"><span class="chip mono">' + h(r.ma) + '</span><span class="chip">' + h(r.loai) + '</span>' +
      '<span class="chip">phiên bản ' + r.phienBan + '</span><span class="chip">dùng ' + (r.dung || 0) + ' lần</span>' +
      (r.canSoat ? '<span class="chip" style="color:var(--gita-do)">quá hạn soát</span>' : '') + '</div><b class="mt">' + h(r.cauHoi) + '</b>' +
      '<div class="sm mt" style="white-space:pre-wrap">' + h(r.giaiPhap) + '</div><div class="row mt">' + nut('G.dtBoSung(\'' + h(r.ma) + '\')', 'Kiểm lại & bổ sung') + '</div></div>';
  }).join('');
  if (!duyet.length && !nhap.length) o += '<div class="card mt tiny muted">Kho trống. Hỏi ở ngăn "Bộ não đa trí", chấm "Tốt" rồi bấm "Lưu vào kho giải pháp".</div>';
  return o;
}

function veTinhTuy() {
  var so = G.dtSo;
  if (!so) { if (G.goiMayChu) G.dtTaiSo(); return chuaNoi(); }
  if (!so.ok) return '<div class="card mt">' + h(so.error || '') + '</div>';
  var o = '<div class="card mt"><b>Tinh túy 5 bộ não → kỹ thuật GITA đang chạy</b><div class="tiny muted mt">Điểm mạnh dưới đây là điều chính các hãng công bố; GITA chưa tự kiểm chứng. ' +
    'GITA không vượt được bản thân các mô hình hàng đầu — GITA hơn từng mô hình đơn lẻ trên VIỆC CỦA GITA nhờ định tuyến, kho giải pháp đã duyệt và tri thức miền, đo bằng điểm chấm.</div>' +
    '<table class="tbl sm mt"><tr><th>Hãng</th><th>Điểm mạnh (theo hãng)</th><th>GITA dùng thế nào</th><th>Ở đâu</th></tr>' +
    (so.tinhTuy || []).map(function (t) { return '<tr><td><b>' + h(t.hang) + '</b></td><td>' + h(t.manh) + '</td><td>' + h(t.gita) + '</td><td class="mono tiny">' + h(t.o) + '</td></tr>'; }).join('') +
    '</table></div>';
  o += '<div class="card mt"><b>Khuôn tư duy theo loại việc</b><table class="tbl sm mt"><tr><th>Loại việc</th><th>Bậc</th><th>Khuôn</th></tr>' +
    (so.loai || []).map(function (l) { return '<tr><td>' + h(l.ten) + '</td><td>' + l.tu + '–' + l.den + '</td><td class="tiny">' + h(l.khuon || '') + '</td></tr>'; }).join('') + '</table></div>';
  var c = G.dtCanh;
  o += '<div class="card mt"><b>Tự cập nhật theo 5 hãng</b><div class="tiny muted mt">Lịch chạy tự canh danh sách mô hình mỗi 7 ngày (lần cuối: ' +
    (so.lucCanhMau ? new Date(so.lucCanhMau).toLocaleString('vi-VN') : 'chưa') + '). Máy chỉ BÁO; Super Admin thử mô hình mới trên chính đề trong kho giải pháp, ' +
    'thấy tốt hơn mới đổi biến GITA_MAU_*.</div><div class="row mt" style="gap:8px">' + nut('G.dtCanhMau()', 'Canh mô hình mới ngay') + '</div>';
  if (c && c.cho) o += '<div class="tiny muted mt">Đang canh…</div>';
  else if (c && !c.ok) o += '<div class="tiny mt" style="color:var(--gita-do)">' + h(c.error || '') + '</div>';
  else if (c) o += '<table class="tbl sm mt"><tr><th>Hãng</th><th>Đang dùng</th><th>Số mô hình</th><th>Mới</th></tr>' + c.kq.map(function (x) {
    return '<tr><td>' + h(x.ten) + '</td><td class="mono">' + h(x.dangDung || '—') + (x.dangDungConTrongDs === false ? ' <span style="color:var(--gita-do)">(đã biến khỏi danh sách)</span>' : '') +
      '</td><td>' + (x.loi ? '<span style="color:var(--gita-do)">' + h(x.loi) + '</span>' : x.tong) + '</td><td class="mono tiny">' +
      (x.mocNen ? 'ghi mốc nền' : h((x.moi || []).join(', ') || '—')) + '</td></tr>';
  }).join('') + '</table>';
  var t = G.dtThu;
  o += '<div class="row mt" style="gap:8px;flex-wrap:wrap"><select id="dt-tm-ncc">' + (so.ncc || []).map(function (n) { return '<option value="' + h(n.ma) + '">' + h(n.ten) + '</option>'; }).join('') +
    '</select><input id="dt-tm-mau" placeholder="Tên mô hình cần thử"> ' + nut('G.dtThuMau()', 'Thử trên đề của GITA', 'pri') + '</div>';
  if (t && t.cho) o += '<div class="tiny muted mt">Đang thử…</div>';
  else if (t && !t.ok) o += '<div class="tiny mt" style="color:var(--gita-do)">' + h(t.error || '') + '</div>';
  else if (t) o += '<div class="tiny muted mt">' + h(t.nhac) + '</div>' + t.ket.map(function (x) {
    return '<div class="card mt"><b>' + h(x.cauHoi) + '</b><div class="row mt" style="gap:12px;align-items:flex-start"><div style="flex:1"><div class="tiny muted">Bản đã duyệt</div>' +
      '<div class="sm" style="white-space:pre-wrap">' + h(x.daDuyet) + '</div></div><div style="flex:1"><div class="tiny muted">' + h(t.model) + ' · ' + x.token + ' token</div>' +
      '<div class="sm" style="white-space:pre-wrap">' + h(x.moi) + '</div></div></div></div>';
  }).join('');
  return o + '</div>';
}

/* ── Vòng nhà khoa học: quan sát → giả thuyết → phép thử → đề xuất, 0 token ── */
var KH_NGAN = { boSungGiaiPhap: 'kho', duyetGiaiPhap: 'kho', dsGiaiPhap: 'kho', thuMauDaTri: 'tinhtuy', canhMauDaTri: 'tinhtuy', soDaTri: 'toiuu' };
var KH_MAU = { cao: 'var(--gita-do)', vua: 'var(--gita-sau)', thap: '#9aa0a6' };
G.dtKhTai = function (chay) {
  if (!G.goiMayChu || G.dtKhDangTai) return;
  G.dtKhDangTai = true;
  G.goiMayChu('docVongKhoaHoc', { chay: !!chay }).then(function (x) { G.dtKhDangTai = false; G.dtKh = x || { ok: false, error: 'Không có phản hồi.' }; veLai(); });
};
function veKhoaHoc() {
  var kh = G.dtKh;
  if (!kh) { if (G.goiMayChu) G.dtKhTai(false); return '<div class="card mt tiny muted">Đang tải báo cáo… ' + nut('G.dtKh=null;G.dtKhDangTai=false;G.dtKhTai(false)', 'Tải lại') + '</div>'; }
  if (!kh.ok) return '<div class="card mt" style="color:var(--gita-do)">' + h(kh.error || '') + '</div>';
  var bc = kh.moiNhat;
  var o = '<div class="card mt"><b>Vòng nhà khoa học — mỗi đêm, 0 token</b><div class="tiny muted mt">Bộ não tự đọc số đo thật của chính nó (kho giải pháp, điểm chấm, ngân sách, đệm, mô hình mới) ' +
    'và viết từng phát hiện theo phương pháp khoa học. Mỗi phát hiện trỏ đúng một cửa để kiểm chứng. Máy đề xuất — Super Admin quyết (AT5). ' +
    'Tự điều chỉnh duy nhất máy được làm: xếp cuối hàng nhà cung cấp bị chấm "chưa tốt" > 70% trên ≥ 10 lượt (đảo: GITA_TU_DIEU_CHINH="0").</div>' +
    '<div class="row mt" style="gap:8px">' + nut('G.dtKhTai(true)', 'Chạy vòng ngay', 'pri') +
    (bc ? '<span class="tiny muted">Lần cuối: ' + new Date(bc.luc).toLocaleString('vi-VN') + '</span>' : '') + '</div>' +
    (kh.xuHuong && kh.xuHuong.length > 1 ? '<div class="tiny muted mt">Số phát hiện 7 lần gần nhất: ' + kh.xuHuong.map(function (x) { return x.n; }).reverse().join(' → ') + '</div>' : '') + '</div>';
  if (!bc) return o + '<div class="card mt tiny muted">Chưa có báo cáo — lịch chạy đêm nay sẽ tạo, hoặc bấm "Chạy vòng ngay".</div>';
  if (!bc.phatHien.length) return o + '<div class="card mt">Không phát hiện bất thường nào trên số đo hiện có. Không có nghĩa là không có lỗi — chỉ là các chỉ số đang đo đều trong ngưỡng.</div>';
  return o + bc.phatHien.map(function (p) {
    var ngan = KH_NGAN[p.cua];
    return '<div class="card mt" style="border-left:3px solid ' + (KH_MAU[p.mucDo] || '') + '"><span class="chip">' + h(p.mucDo) + '</span>' +
      (p.cua ? ' <span class="chip mono">' + h(p.cua) + '</span>' : '') +
      '<div class="sm mt"><b>Quan sát:</b> ' + h(p.quanSat) + '<br><b>Giả thuyết:</b> ' + h(p.giaThuyet) + '<br><b>Phép thử:</b> ' + h(p.phepThu) +
      '<br><b>Đề xuất:</b> ' + h(p.deXuat) + '</div>' + (ngan ? '<div class="row mt">' + nut('G.dtMoNgan(\'' + ngan + '\')', 'Mở nơi kiểm chứng') + '</div>' : '') + '</div>';
  }).join('');
}

/* ── V20 · Tuyến nhiều chặng có chốt chặn (R01): hệ dừng sau mỗi chặng ── */
G.dtTuyen = G.dtTuyen || null;
G.dtTuyenChi = G.dtTuyenChi || null;
G.dtTuyenTai = function () {
  if (!G.goiMayChu || G.dtTuyenDangTai) return;
  G.dtTuyenDangTai = true;
  G.goiMayChu('docTuyenDaTri', {}).then(function (x) { G.dtTuyenDangTai = false; G.dtTuyen = x || { ok: false, error: 'Không có phản hồi.' }; veLai(); });
};
G.dtTaoTuyen = function () {
  var ten = giaTri('dt-ty-ten').trim();
  var dong = giaTri('dt-ty-chang').split('\n').map(function (s) { return s.trim(); }).filter(Boolean);
  var chang = [], sai = '';
  /* Đầu dòng là MÃ VAI của đội (NGHIEN_CUU · PHAN_TICH · SOAN · SOAT · LEAD)
     hoặc loại việc kiểu cũ (phanTich · chienLuoc… — khi cần bậc mô hình cao). */
  dong.forEach(function (s) {
    var p = s.split('|'); if (p.length < 2 || !p[0].trim() || !p[1].trim()) { sai = s; return; }
    var dau = p[0].trim(), de = p.slice(1).join('|').trim();
    chang.push(/^[A-Z_]+$/.test(dau) ? { vai: dau, de: de } : { loai: dau, de: de });
  });
  if (sai) { U.toast('Dòng sai khuôn "VAI | đề": ' + sai, 'err'); return; }
  var tuChay = !!(document.getElementById('dt-ty-tu') || {}).checked;
  G.goiMayChu('taoTuyenDaTri', { ten: ten, chang: chang, tuChay: tuChay }).then(function (x) {
    U.toast(x && x.ok ? 'Đã tạo tuyến ' + x.ma + ' · ' + x.soChang + ' chặng' + (x.tuChay ? ' · bộ não sẽ tự chạy từng chặng.' : '.') : ((x && x.error) || 'Không tạo được.'), x && x.ok ? 'ok' : 'err');
    G.dtTuyen = null; G.dtTuyenChi = null; G.dtTuyenTai();
  });
};
G.dtChayChang = function (ma) {
  if (G.dtChangDangChay) return;
  G.dtChangDangChay = true; veLai();
  G.goiMayChu('chayChangDaTri', { ma: ma }).then(function (x) {
    G.dtChangDangChay = false;
    if (x && x.ok) { U.toast(x.chotChan, x.dat === false ? 'err' : 'ok'); G.dtTuyen = null; G.dtDoi = null; G.dtXemTuyen(ma); }
    else U.toast((x && x.error) || 'Không chạy được.', 'err');
    veLai();
  });
};
/* V50: bật / tắt "tự chạy" — bộ não vận hành chạy tiếp chặng kế mỗi lượt làm việc. */
G.dtTuChay = function (ma, bat) {
  G.goiMayChu('datTuChayTuyen', { ma: ma, bat: !!bat }).then(function (x) {
    U.toast(x && x.ok ? (bat ? 'Đã bật tự chạy — bộ não chạy tiếp ở lượt làm việc kế.' : 'Đã tắt tự chạy.') : ((x && x.error) || 'Không đổi được.'), x && x.ok ? 'ok' : 'err');
    G.dtTuyen = null; G.dtTuyenTai();
  });
};
/* ── Đội Agent: thẻ vai · bộ nhớ chung · đo lường · chấp nhận chặng chưa đạt ── */
G.dtDoi = G.dtDoi || null;
G.dtDoiTai = function () {
  if (!G.goiMayChu || G.dtDoiDangTai) return;
  G.dtDoiDangTai = true;
  G.goiMayChu('docDoiAgent', {}).then(function (x) { G.dtDoiDangTai = false; G.dtDoi = x || { ok: false, error: 'Không có phản hồi.' }; veLai(); });
};
G.dtGhiNho = function () {
  G.goiMayChu('ghiBoNhoAgent', { loai: giaTri('dt-nho-loai'), noiDung: giaTri('dt-nho-nd').trim() }).then(function (x) {
    U.toast(x && x.ok ? 'Đã ghi vào bộ nhớ đội — mọi chặng sau đều đọc.' : ((x && x.error) || 'Không ghi được.'), x && x.ok ? 'ok' : 'err');
    if (x && x.ok) { G.dtDoi = null; G.dtDoiTai(); }
  });
};
G.dtBatNho = function (id, bat) {
  G.goiMayChu('batBoNhoAgent', { id: id, bat: !!bat }).then(function (x) {
    U.toast(x && x.ok ? (bat ? 'Đã bật — mục này vào bộ nhớ đội.' : 'Đã tắt — mục vẫn được giữ trong sổ.') : ((x && x.error) || 'Không đổi được.'), x && x.ok ? 'ok' : 'err');
    G.dtDoi = null; G.dtDoiTai();
  });
};
G.dtChotChang = function (ma) {
  G.goiMayChu('chotChangDaTri', { ma: ma, lyDo: giaTri('dt-chot-ly').trim() }).then(function (x) {
    U.toast(x && x.ok ? 'Đã chấp nhận chặng — lý do ở lại trong tuyến.' : ((x && x.error) || 'Không chấp nhận được.'), x && x.ok ? 'ok' : 'err');
    if (x && x.ok) { G.dtTuyen = null; G.dtDoi = null; G.dtXemTuyen(ma); }
  });
};
function veDoi() {
  var d = G.dtDoi;
  if (!d) { if (G.goiMayChu) G.dtDoiTai(); return ''; }
  if (!d.ok) return '<div class="card mt tiny" style="color:var(--gita-do)">' + h(d.error || 'Không đọc được đội Agent.') + '</div>';
  var m = d.doLuong || {}, laR01 = G.S && G.S.role === 'R01';
  var o = '<div class="card mt"><b>Đội Agent · 5 vai, một Trưởng nhóm</b>' +
    '<div class="tiny muted mt">' + h(d.luong) + '</div>' +
    '<div class="row mt" style="gap:6px;flex-wrap:wrap">' +
      '<span class="chip">7 ngày: ' + (m.tuyenXong || 0) + '/' + (m.tuyen || 0) + ' tuyến xong</span>' +
      '<span class="chip">' + (m.changDat || 0) + ' chặng đạt</span>' +
      '<span class="chip" style="color:var(--gita-do-ink)">' + (m.loiBat || 0) + ' lỗi Trưởng nhóm bắt</span>' +
      '<span class="chip">' + (m.tuSuaDat || 0) + ' tự sửa đạt</span>' +
      '<span class="chip">' + (m.nguoiChapNhan || 0) + ' người chấp nhận</span>' +
      '<span class="chip">' + (m.token || 0) + ' token</span>' +
      '<span class="chip" title="' + h(m.gioTietKiemVi || '') + '">giờ tiết kiệm: chưa đo</span></div>' +
    (d.the || []).map(function (a) {
      return '<details class="mt"><summary class="sm" style="cursor:pointer"><span class="chip mono">' + h(a.ma) + '</span> <b>' + h(a.ten) + '</b> — ' + h(a.viec) + '</summary>' +
        '<div class="tiny mt" style="line-height:1.7"><b>Vào:</b> ' + h(a.vao) + '<br><b>Ra:</b> ' + h(a.raGi) +
        '<br><b>Không được:</b> ' + h(a.khongDuoc.join(' · ')) + '<br><b>Dừng hỏi người khi:</b> ' + h(a.dungHoi.join(' · ')) +
        '<br><b>Mô hình:</b> ' + h(a.mau) + '<br><b>Thế nào là tốt:</b> ' + h(a.tot) +
        '<br><b>Ba kiểu hỏng:</b> ' + h(a.hong.map(function (x) { return x.khi + ' → ' + x.xuLy; }).join(' · ')) +
        '<br><b>Ví dụ tốt:</b> ' + h(a.viDuTot) + '<br><b>Ví dụ xấu:</b> ' + h(a.viDuXau) + '</div>' +
        '<details class="mt"><summary class="tiny" style="cursor:pointer">Lời hệ thống (' + a.soChu + ' chữ)</summary><div class="tiny" style="white-space:pre-wrap">' + h(a.he) + '</div></details></details>';
    }).join('') + '</div>';
  o += '<div class="card mt"><b>Bộ nhớ chung của đội</b><div class="tiny muted mt">Mọi chặng có vai đều đọc phần này trước khi làm (tối đa 900 ký tự). Chỉ Super Admin ghi; máy chỉ đề xuất lỗi cần tránh — tắt sẵn, người bật mới có hiệu lực.</div>' +
    ((d.boNho || []).length ? (d.boNho || []).map(function (r) {
      return '<div class="row mt" style="gap:6px;flex-wrap:wrap;align-items:center"><span class="chip">' + h((d.loaiNho || {})[r.loai] || r.loai) + '</span><span class="sm">' + h(r.noiDung) + '</span>' +
        (laR01 ? nut('G.dtBatNho(\'' + h(r.id) + '\',false)', 'Tắt') : '') + '</div>';
    }).join('') : '<div class="tiny muted mt">Chưa có mục nào.</div>') +
    ((d.deXuat || []).length ? '<div class="tiny up mt">MÁY ĐỀ XUẤT · CHỜ DUYỆT</div>' + d.deXuat.map(function (r) {
      return '<div class="row mt" style="gap:6px;flex-wrap:wrap;align-items:center"><span class="chip">' + h(r.boiAi || '') + '</span><span class="sm muted">' + h(r.noiDung) + '</span>' +
        nut('G.dtBatNho(\'' + h(r.id) + '\',true)', 'Bật vào bộ nhớ') + '</div>';
    }).join('') : '') +
    (laR01 ? '<div class="row mt" style="gap:6px;flex-wrap:wrap"><select id="dt-nho-loai" aria-label="Loại bộ nhớ">' +
      Object.keys(d.loaiNho || {}).map(function (k) { return '<option value="' + h(k) + '">' + h(d.loaiNho[k]) + '</option>'; }).join('') + '</select>' +
      '<input id="dt-nho-nd" style="flex:1;min-width:200px" maxlength="300" placeholder="Một câu ngắn — không tên, không số điện thoại">' + nut('G.dtGhiNho()', 'Ghi', 'pri') + '</div>' : '') + '</div>';
  return o;
}
G.dtXemTuyen = function (ma) {
  G.goiMayChu('docTuyenDaTri', { ma: ma }).then(function (x) { G.dtTuyenChi = x || { ok: false }; veLai(); });
};
function veTuyen() {
  var t = G.dtTuyen, o = '';
  if (!t) { if (G.goiMayChu) G.dtTuyenTai(); return chuaNoi(); }
  if (!t.ok) return '<div class="card mt" style="color:var(--gita-do)">' + h(t.error || 'Không đọc được.') + '</div>';
  o += veDoi();
  o += '<div class="card mt"><b>Tuyến nhiều chặng có chốt chặn</b><div class="tiny muted mt">Một việc lớn đi qua nhiều chặng; hệ <b>dừng sau mỗi chặng</b> ' +
    'chờ Super Admin đọc và kiểm chứng — không tự chạy trọn một mạch. Kết quả chặng trước làm ngữ cảnh chặng sau (vòng lặp đo lường quay lại). Chỉ Super Admin tạo và chạy.</div>' +
    '<div class="tiny muted mt">Khuôn mỗi dòng: <code>VAI | đề chặng</code> · VAI ∈ LEAD · NGHIEN_CUU · PHAN_TICH · SOAN · SOAT (có thẻ vai, bộ nhớ, bảng kiểm). ' +
      'Việc cần mô hình bậc cao thì dùng kiểu cũ <code>phanTich | đề</code> hoặc <code>chienLuoc | đề</code>. 2–7 chặng. Sau MỖI chặng Trưởng nhóm soát; chưa đạt thì dừng chờ người.</div>' +
    '<input id="dt-ty-ten" class="mt" style="width:100%" placeholder="Tên tuyến (vd: Ra mắt gói học mới)">' +
    '<textarea id="dt-ty-chang" rows="4" class="mt" style="width:100%" placeholder="NGHIEN_CUU | Gom phản hồi tuần này&#10;SOAN | Viết thư trả lời mẫu&#10;SOAT | Soát thư trả lời"></textarea>' +
    '<label class="row mt tiny" style="gap:6px;align-items:center"><input type="checkbox" id="dt-ty-tu"> Tự chạy — bộ não vận hành chạy tiếp chặng kế ở mỗi lượt làm việc (làm 30 phút · nghỉ 30 phút), trong ngân sách ngày. Đọc kết quả ở đây khi xong.</label>' +
    '<div class="row mt">' + nut('G.dtTaoTuyen()', 'Tạo tuyến', 'pri') + '</div></div>';
  (t.ds || []).forEach(function (r) {
    o += '<div class="card mt"><div class="row" style="gap:6px;flex-wrap:wrap"><span class="chip mono">' + h(r.ma) + '</span><b>' + h(r.ten) + '</b>' +
      '<span class="chip">' + r.dangO + '/' + r.soChang + ' chặng</span>' +
      (r.trangThai === 'xong' ? '<span class="chip" style="color:var(--ok)">đã xong</span>' : '<span class="chip">đang chạy</span>') +
      (r.tuChay ? '<span class="chip" style="color:var(--gita)">tự chạy</span>' : '') + '</div>' +
      '<div class="row mt" style="gap:8px">' + nut('G.dtXemTuyen(\'' + h(r.ma) + '\')', 'Xem') +
      (r.trangThai !== 'xong' ? nut('G.dtTuChay(\'' + h(r.ma) + '\',' + (r.tuChay ? 'false' : 'true') + ')', r.tuChay ? 'Tắt tự chạy' : 'Bật tự chạy') : '') +
      (r.trangThai !== 'xong' ? nut('G.dtChayChang(\'' + h(r.ma) + '\')', G.dtChangDangChay ? 'Đang chạy…' : 'Chạy chặng kế', 'pri') : '') + '</div></div>';
  });
  if (t.ds && !t.ds.length) o += '<div class="card mt tiny muted">Chưa có tuyến nào.</div>';
  var c2 = G.dtTuyenChi;
  if (c2 && c2.ok && c2.tuyen) {
    var ty = c2.tuyen;
    o += '<div class="card mt" style="border-color:var(--gita-sau)"><b>' + h(ty.ten) + '</b> <span class="chip mono">' + h(ty.ma) + '</span>';
    ty.cacChang.forEach(function (ch, i) {
      var kq = (ty.ketQua || []).filter(function (x) { return x.chang === i; }).pop();
      var sv = kq && kq.soat, choChot = kq && kq.nhan === false && i === ty.dangO && G.S && G.S.role === 'R01';
      o += '<div class="mt"><span class="chip">' + (i + 1) + '</span> <b>' + h(ch.vai || ch.loai) + '</b> <span class="tiny">' + h(ch.de) + '</span>' +
        (kq ? '<div class="tiny muted">' + h(kq.ncc) + ' · ' + kq.token + ' token · ' + new Date(kq.luc).toLocaleString('vi-VN') + (kq.suaLan ? ' · tự sửa 1 lần' : '') + '</div>' +
          (sv ? '<div class="row" style="gap:6px;flex-wrap:wrap">' + (sv.dat ? '<span class="chip" style="color:var(--ok)">Trưởng nhóm: đạt</span>' :
            '<span class="chip" style="color:var(--gita-do-ink)">Trưởng nhóm: chưa đạt</span>') +
            sv.loi.map(function (l) { return '<span class="tiny" style="color:var(--gita-do-ink)">' + h(l.vi) + '</span>'; }).join(' ') +
            sv.canhBao.map(function (c) { return '<span class="tiny" style="color:var(--gita-sau)">' + h(c.vi) + '</span>'; }).join(' ') + '</div>' : '') +
          (kq.nguoiNhan ? '<div class="tiny">Chấp nhận bởi <b>' + h(kq.nguoiNhan) + '</b>: ' + h(kq.lyDoNhan || '') + '</div>' : '') +
          '<div class="sm" style="white-space:pre-wrap">' + h(kq.traLoi) + '</div>' +
          (choChot ? '<div class="row mt" style="gap:6px;flex-wrap:wrap"><input id="dt-chot-ly" style="flex:1;min-width:200px" placeholder="Lý do chấp nhận dù chưa đạt (≥10 ký tự)">' +
            nut('G.dtChotChang(\'' + h(ty.ma) + '\')', 'Chấp nhận') + nut('G.dtChayChang(\'' + h(ty.ma) + '\')', 'Chạy lại chặng', 'pri') + '</div>' : '') :
          '<div class="tiny muted">— chưa chạy (chốt chặn đang chờ)</div>') + '</div>';
    });
    o += '</div>';
  }
  return o;
}

function veTri() {
  var tat = G.ttTatCa(), kq = G.dtTim ? G.ttTim(G.dtTim) : tat;
  var o = '<div class="card mt"><b>Kho trí tuệ — đếm thật: ' + tat.length + ' nguyên lý/tư liệu</b>' +
    '<div class="tiny muted mt">Kho mới ' + G.TT_KHO.length + ' · Hệ tư duy mới ' + (G.BAIHOC || []).length + ' · Sách gốc ' + (G.SACH || []).length +
    '. "500.000 cuốn" là HƯỚNG mở rộng, không phải số đã có. Nguyên lý viết lại bằng lời GITA, có nguồn và giới hạn — không chép toàn văn sách còn bản quyền. ' +
    'Thêm nguyên lý qua đường <a href="#" onclick="G.go(\'duyet-tai-lieu\');return false">duyệt tài liệu</a>.</div>' +
    '<input class="mt" style="width:100%" placeholder="Tìm (gõ có dấu hay không dấu đều được)…" value="' + h(G.dtTim) + '" onchange="G.dtDatTim(this.value)"></div>';
  o += '<div class="row mt" style="gap:6px;flex-wrap:wrap">' + G.TT_MIEN.map(function (m) {
    var d = G.TT_KHO.filter(function (x) { return x.mien === m.ma; }).length;
    return '<span class="chip">' + h(m.ten) + ' · ' + d + '</span>';
  }).join('') + '</div>';
  kq.slice(0, 60).forEach(function (x) {
    o += '<div class="card mt"><span class="chip mono">' + h(x.ma) + '</span> <b>' + h(x.ten) + '</b> <span class="tiny muted">' + h(x.kho) + '</span>' +
      '<div class="sm mt">' + h(x.nguyenLy) + '</div><div class="tiny muted mt">Nguồn: ' + h(x.nguonGoc) + '</div>' +
      (x.ranhGioi && x.ranhGioi !== '—' ? '<div class="tiny mt" style="color:var(--gita-do)">Giới hạn: ' + h(x.ranhGioi) + '</div>' : '') + '</div>';
  });
  if (!kq.length) o += '<div class="card mt tiny muted">Không thấy nguyên lý khớp.</div>';
  return o;
}

function lienKet(t) {
  var d = G.h16DoTro ? G.h16DoTro(t) : { song: true };
  var ten = t.slice(2);
  if (t.indexOf('v:') === 0 && d.song) return '<a href="#" onclick="G.go(\'' + ten + '\');return false">' + h(ten) + '</a>';
  return '<span class="mono">' + h(ten) + '</span>' + (d.song ? '' : ' <span style="color:var(--gita-do)">(thiếu)</span>');
}
function veBang() {
  var o = '<div class="card mt"><b>Phần nổi · khoảng 10% khách chạm</b><div class="row mt" style="gap:6px;flex-wrap:wrap">' +
    G.TB_TANG.noi.map(function (x) { return '<span class="chip">' + h(x.ten) + ' · ' + lienKet(x.tro) + '</span>'; }).join('') + '</div></div>';
  var song = 0, tong = 0;
  o += '<div class="card mt" style="border-color:var(--gita-sau)"><b>Phần chìm · 90% gia đình không thấy nhưng được hưởng</b>';
  G.TB_TANG.chim.forEach(function (c, i) {
    c.tro.forEach(function (t) { tong++; if (!G.h16DoTro || G.h16DoTro(t).song) song++; });
    o += '<div class="mt"><b>' + (i + 1) + '. ' + h(c.ten) + '</b><div class="sm">' + h(c.vi) + '</div><div class="tiny muted">Đang chạy ở: ' + c.tro.map(lienKet).join(' · ') + '</div></div>';
  });
  o += '<div class="tiny mt">Đo sống: ' + song + '/' + tong + ' con trỏ.</div></div>';
  o += '<div class="card mt"><b>Hành trình gắn bó — mở dần phần chìm khi gia đình sẵn sàng</b><table class="tbl sm mt"><tr><th>Chặng</th><th>Khách thấy</th><th>Mở thêm</th><th>Đo bằng</th><th>Gắn bó nhờ</th><th>CẤM</th><th>Nguyên lý</th></tr>' +
    G.TB_HANH_TRINH.map(function (s) {
      return '<tr><td><b>' + h(s.ten) + '</b></td><td>' + h(s.thay) + '</td><td>' + h(s.mo) + '</td><td>' + h(s.do) + '</td><td>' + h(s.ganBo) +
        '</td><td style="color:var(--gita-do)">' + h(s.cam) + '</td><td class="mono tiny">' + h(s.nl.join(' ')) + '</td></tr>';
    }).join('') + '</table><div class="tiny muted mt">Khách "thèm" quay lại vì thấy con tiến bộ và tò mò chặng sau — không vì sợ mất. Luật đạo đức tiếp thị: ' +
    lienKet('v:chuoi-wow') + '.</div></div>';
  return o;
}

function veToiUu() {
  var so = G.dtSo;
  if (!so) { if (G.goiMayChu) G.dtTaiSo(); return chuaNoi(); }
  if (!so.ok) return '<div class="card mt">' + h(so.error || '') + '</div>';
  var goi = 0, tk = 0, dem = 0;
  (so.homNay || []).forEach(function (r) { if (r.ncc === 'dem' || r.ncc === 'kho') dem += r.luot; else { goi += r.luot; tk += r.vao + r.ra; } });
  var o = U.bdSoHang ? U.bdSoHang([
    { k: 'Lượt gọi AI hôm nay', v: goi },
    { k: 'Token hôm nay', v: tk.toLocaleString('vi-VN') },
    { k: 'Trúng kho + đệm hôm nay (0 token)', v: dem },
    { k: 'Tỉ lệ 0 token', v: (goi + dem ? Math.round(100 * dem / (goi + dem)) : 0) + '%' }
  ]) : '';
  o += '<div class="card mt"><b>7 ngày theo nhà cung cấp</b><table class="tbl sm mt"><tr><th>Nhà cung cấp</th><th>Lượt</th><th>Token vào</th><th>Token ra</th></tr>' +
    (so.tuan || []).map(function (r) { return '<tr><td>' + h(r.ncc === 'dem' ? 'bộ đệm' : r.ncc === 'kho' ? 'kho giải pháp' : r.ncc) + '</td><td>' + r.luot + '</td><td>' + r.vao + '</td><td>' + r.ra + '</td></tr>'; }).join('') + '</table></div>';
  o += '<div class="card mt"><b>Chín đòn tối ưu token đang chạy</b><div class="sm mt">' +
    '1. Kho giải pháp đã duyệt: câu tương tự trả thẳng, 0 token, không hạn.<br>' +
    '2. Bộ đệm: câu đã hỏi trả lại 0 token (giữ 1–30 ngày theo loại việc).<br>' +
    '3. Rẻ trước: Workers AI → DeepSeek → Gemini/GPT → Claude/Grok.<br>' +
    '4. Trần token ra theo loại việc (200–2.000); kiểm lại kho chỉ 400.<br>' +
    '5. Lời hệ thống ngắn, gửi mỗi lượt nên mỗi chữ đều tính.<br>' +
    '6. Tri thức gửi ở dạng nén (≤ 800 ký tự), chỉ 3 nguyên lý liên quan nhất.<br>' +
    '7. Ngân sách token mỗi ngày cho từng nhà cung cấp; hết thì leo hoặc dừng.<br>' +
    '8. Trần tải ' + (so.tranTai || 50) + '%: chỉ dùng tới mức này của mỗi ngân sách, phần còn lại là dự phòng (GITA_TRAN_TAI).<br>' +
    '9. Chế độ tiết kiệm: chỉ còn kho + đệm + Workers AI.</div></div>';
  var dx = G.dtDeXuat(so);
  o += '<div class="card mt"><b>Đề xuất tự tối ưu (máy đề xuất, chủ hệ quyết)</b><div class="sm mt">' +
    (dx.length ? dx.map(h).join('<br>') : 'Chưa đủ điểm chấm (cần ≥ 5 lượt mỗi loại × nhà cung cấp).') + '</div></div>';
  return o;
}

G.VIEWS['bo-nao-da-tri'] = function () {
  var o = '<div class="hd"><h2>' + ic('orbit') + ' Bộ não đa trí GITA365</h2><p class="sub">Năm họ trí tuệ nhân tạo (Claude · DeepSeek · ChatGPT · Grok · Gemini) cùng Workers AI, ' +
    'định tuyến <b>rẻ trước</b>, tiết kiệm từng token, mọi lượt qua cổng bảo vệ trẻ em (Điều 13). Kho trí tuệ có nguồn và giới hạn. Tảng băng giá trị: khách chạm 10%, hưởng trọn 100%.</p></div>';
  o += '<div class="row" style="gap:6px;flex-wrap:wrap">' + NGAN.map(function (x) {
    return '<button class="btn ' + (G.dtNgan === x.ma ? 'pri' : 'ghost') + '" onclick="G.dtMoNgan(\'' + x.ma + '\')">' + ic(x.ic, 'w-4 h-4') + h(x.ten) + '</button>';
  }).join('') + '</div>';
  var f = { nao: veNao, kho: veKho, tinhtuy: veTinhTuy, khoahoc: veKhoaHoc, tuyen: veTuyen, tri: veTri, bang: veBang, toiuu: veToiUu }[G.dtNgan] || veNao;
  return o + f();
};
})();
