/* ═══════════════════════════════════════════════════════════════
   GITA 365 · CỬA VÀO MỚI — KIẾN TRÚC SƯ NỘI DUNG

   Bản đặc tả "GITA 365 MASTER AI v2.0" của chủ hệ, bản 9.99.41.

   ══ CÁI NÀY KHÔNG PHẢI MỘT BỘ VIẾT BÀI ══

   Nó là một CỔNG, cùng loại với cổng thị giác và vì cùng một lý do:
   một bài học viết rất hay mà thiếu chỗ đo thì sáu tháng sau không ai
   biết nó có tác dụng không — kể cả người viết. Bài hay được tin, và
   chỗ thiếu đi theo nó xa hơn.

   Máy KHÔNG viết hộ nội dung chuyên môn. Nó ĐO: bài này có đủ hai
   mươi bốn khối không, khối nào đòi khối nào mà không có, câu nào
   rỗng, câu nào phán xét, và chấm được sáu trong mười chiều.

   ══ VÌ SAO ĐO ĐƯỢC MÀ KHÔNG CẦN MỘT MÔ HÌNH NÀO ══

   Bản đặc tả gốc để một mô hình bên ngoài đọc bài rồi chấm. Hai chỗ
   hỏng, và chỗ thứ hai nặng hơn:

     1. Luật C11 — không đưa NỘI DUNG kho ra ngoài. Gửi cả bài đi chấm
        là đúng thứ luật ấy cấm.
     2. Một mô hình chấm "chiều sâu 8/10" thì không ai truy được vì
        sao 8 chứ không phải 6, và lần chấm sau cùng bài ấy có thể ra
        7. Một thang điểm không lặp lại được thì nó không phải thang.

   Thứ đo được ở đây đo bằng CẤU TRÚC: khối có mặt hay không, khối này
   có kéo theo khối kia không, một dòng có nằm trong bảng câu rỗng
   không. Đo cấu trúc thì lặp lại được, chỉ ra được đúng dòng, và
   không rời khỏi Học viện.

   ══ VÀ MÁY NÓI THẲNG PHẦN NÓ KHÔNG LÀM ĐƯỢC ══

   Bốn chiều — chiều sâu, cá nhân hoá, dùng lại được, và phần có giá
   trị của chìa khoá kim cương — máy không có dữ liệu nào để đo. Nó
   BỎ TRỐNG chứ không đoán, và nó KHÔNG cộng tổng khi còn ô trống.

   Cộng ra một con số trong lúc bốn ô còn trống là dựng một con số
   trông như đã xong. Cùng luật với L-02 của bảng lương.
   ═══════════════════════════════════════════════════════════════ */

import { Kho } from './nen.js';
import { soatTang } from './kien-truc-thi-giac.js';

const BAC = {R01:1,R02:2,R03:3,R04:4,R05:5,R06:6,R07:7,R08:8,
             R09:9,R10:10,R11:11,R12:12,R13:13,R14:14,R15:15};

/** Ai được dùng cổng này. Viết nội dung là việc của người làm nghề,
    không phải của khách — cùng ngưỡng với cổng thị giác. */
function duocVao(hoSo) { return (BAC[hoSo.role] || 99) <= 5; }
function laChuHe(hoSo) { return hoSo.role === 'R01'; }

/* ══ BẢN CHÉP TỐI THIỂU CỦA HIẾN PHÁP NỘI DUNG ══

   Máy chủ không đọc được kho đã mã hoá, nên nó giữ đúng cái TỐI THIỂU
   để CHẶN. Mục 76 của bộ kiểm đối chiếu từng bảng dưới đây với
   G.ND_* trong kho mỗi lần chạy. Lệch là đỏ.

   Chỗ này đã hỏng một lần ở cổng thị giác: tôi tự nghĩ ra mười khoá
   cho CAM_THEO_TANG, nghe rất hợp lý, và không khoá nào được ai
   duyệt. Nên bản chép ở đây KHÔNG có một dòng nào không có trong kho. */

/* Hai mươi bốn khối: mã, tên ngắn, và khối nào ĐÒI khối nào. */
const KHOI = [
  ['K01', 'Tên bài'],
  ['K02', 'Chìa khoá kim cương', ['K12', 'K20']],
  ['K03', 'Mục tiêu'],
  ['K04', 'Vì sao quan trọng'],
  ['K05', 'Vấn đề thật'],
  ['K06', 'Insight'],
  ['K07', 'Bản chất'],
  ['K08', 'Khung tư duy'],
  ['K09', 'Ví dụ'],
  ['K10', 'Ca thật'],
  ['K11', 'Sai lầm thường gặp'],
  ['K12', 'Công cụ', ['K13']],
  ['K13', 'Hướng dẫn dùng'],
  ['K14', 'Bài tập', ['K15']],
  ['K15', 'Sản phẩm đầu ra', ['K22']],
  ['K16', 'KPI', ['K18']],
  ['K17', 'Bảng theo dõi'],
  ['K18', 'Phản tư'],
  ['K19', 'Câu hỏi coach', ['K20']],
  ['K20', 'Việc 24 giờ'],
  ['K21', 'Việc 7 ngày'],
  ['K22', 'Tiêu chí đạt chuẩn'],
  ['K23', 'Điều đọng lại'],
  ['K24', 'Thử thách']
];
const MA_KHOI = KHOI.map(k => k[0]);

/* ══ BỐN KHUÔN — bản 9.99.45 ══

   Tới 9.99.44 hệ có ĐÚNG MỘT khuôn. Một quy trình vận hành nhét vào
   khuôn bài học thì phải điền "Chìa khoá kim cương" cho một cái quy
   trình, và người viết điền cho có. Khuôn sai loại tệ hơn không khuôn:
   nó bắt người ta gõ chữ vào chỗ không có gì để nói, rồi cả bảng kiểm
   mất tin.

   Mỗi khuôn một tiền tố mã riêng, để một tệp tự nói ra nó theo khuôn
   nào. Cả bốn cùng dùng K01 thì một bản dán nhầm khuôn vẫn đọc trôi,
   và máy chấm nó theo bảng sai. */
const KHUON = {
  BAIHOC: {ten: 'Bài học', tienTo: 'K', khoi: KHOI},
  QUYTRINH: {ten: 'Quy trình', tienTo: 'P', khoi: [
    ['P01', 'Mục đích'], ['P02', 'Phạm vi'], ['P03', 'Điều kiện vào'],
    ['P04', 'Các bước', ['P05', 'P06']], ['P05', 'Điểm kiểm'],
    ['P06', 'Xử lý lệch'], ['P07', 'Đo lường'], ['P08', 'Phiên bản']]},
  CAMNANG: {ten: 'Cẩm nang', tienTo: 'C', khoi: [
    ['C01', 'Triết lý một đoạn'], ['C02', 'Nguyên tắc nền', ['C03']],
    ['C03', 'Bộ công cụ'], ['C04', 'Tình huống điển hình'],
    ['C05', 'Lỗi thường gặp'], ['C06', 'Bảng tra nhanh'], ['C07', 'Nguồn']]},
  CHUYENSAU: {ten: 'Tài liệu chuyên sâu', tienTo: 'S', khoi: [
    ['S01', 'Câu hỏi trung tâm'], ['S02', 'Chỗ người ta hiểu nhầm'],
    ['S03', 'Bản chất'], ['S04', 'Bằng chứng', ['S08']],
    ['S05', 'Khung tư duy'], ['S06', 'Áp vào thực hành'],
    ['S07', 'Câu hỏi tự vấn'], ['S08', 'Ranh giới hiểu biết']]}
};
const khuonCua = ma => KHUON[String(ma || 'BAIHOC').toUpperCase()] || KHUON.BAIHOC;

/* Mười chiều. `ai`: máy chấm · cả hai · người chấm. `tran` là trần
   máy được phép cho ở chiều "cả hai". */
const DIEM = [
  {ma: 'Q01', ten: 'Đúng hệ GITA',          trong: 10, ai: 'may'},
  {ma: 'Q02', ten: 'Chiều sâu',             trong: 10, ai: 'nguoi'},
  {ma: 'Q03', ten: 'Dùng được ngay',        trong: 10, ai: 'ca', tran: 6},
  {ma: 'Q04', ten: 'Rõ ràng',               trong: 10, ai: 'may'},
  {ma: 'Q05', ten: 'Làm được',              trong: 10, ai: 'may'},
  {ma: 'Q06', ten: 'Đo được',               trong: 10, ai: 'may'},
  {ma: 'Q07', ten: 'Ngôn từ coach',         trong: 10, ai: 'may'},
  {ma: 'Q08', ten: 'Cá nhân hoá',           trong: 10, ai: 'nguoi'},
  {ma: 'Q09', ten: 'Chìa khoá kim cương',   trong: 10, ai: 'ca', tran: 4},
  {ma: 'Q10', ten: 'Dùng lại được',         trong: 10, ai: 'nguoi'}
];

const BAC_DIEM = [{tu: 95, ten: 'Chuẩn mực'}, {tu: 90, ten: 'Đạt chuẩn cao'},
                  {tu: 80, ten: 'Cần nâng cấp'}, {tu: 0, ten: 'Chưa hoàn thiện'}];

/* Bảng câu rỗng. Mỗi dòng: câu bắt được, và thứ ĐÁNG LẼ nằm ở đó. */
const RONG = [
  ['hãy cố gắng',           'Cố gắng vào việc gì, mấy lần một tuần?'],
  ['nỗ lực hết mình',       'Hết mình là tới đâu? Đo bằng gì?'],
  ['thành công sẽ đến',     'Đến khi nào, và dấu hiệu đầu tiên là gì?'],
  ['chìa khoá thành công',  'Chìa khoá mở cái gì? Cửa nào?'],
  ['bí quyết',              'Nếu là bí quyết thì bước một là gì?'],
  ['thay đổi cuộc đời',     'Đổi cái gì, trong bao lâu?'],
  ['vươn tới ước mơ',       'Ước mơ ấy tuần này gồm việc gì?'],
  ['không gì là không thể', 'Việc này cần điều kiện gì để làm được?'],
  ['tư duy tích cực',       'Nghĩ khác đi ở điểm nào, so với đang nghĩ gì?'],
  ['bứt phá giới hạn',      'Giới hạn hiện tại là con số nào?'],
  ['khai phóng tiềm năng',  'Tiềm năng ấy hiện ra thành việc gì làm được?'],
  ['truyền cảm hứng',       'Sau khi nghe thì người ta làm gì khác đi?']
];

/* Bảng thay lời. Mỗi dòng: câu ĐỪNG NÓI, câu NÓI THAY, vì sao. */
const LOI_THAY = [
  ['phải cố gắng hơn', 'Điều gì đang khiến kết quả chưa được như em muốn?',
   'Câu cũ đặt lỗi vào ý chí, mà ý chí là thứ không sửa được bằng lời nhắc.'],
  ['sao em không làm', 'Điều gì đã khiến kế hoạch chưa chạy được?',
   'Câu cũ hỏi để trách. Câu mới hỏi để tìm chỗ nghẽn.'],
  ['thiếu kỷ luật', 'Hệ thống hiện tại đang thiếu điều kiện nào để giữ được nhịp?',
   'Kỷ luật là kết quả của điều kiện, không phải nguyên nhân.'],
  ['lười', 'Việc này đang bị chặn ở bước nào?',
   'Một cái nhãn. Dán xong thì hết đường tìm nguyên nhân.'],
  ['hư', 'Hành vi nào đang lặp lại, vào lúc nào?',
   'Dán nhãn cho một đứa trẻ. Sáu ranh giới của mô hình cấm.'],
  ['không nghe lời', 'Con đang không đồng ý ở điểm nào?',
   'Câu cũ coi vâng lời là đích. Đích của GITA là tự quản trị.'],
  ['đáng lẽ phải', 'Lần sau làm khác đi ở chỗ nào?',
   'Nói về một việc đã xong thì không đổi được nó, chỉ tạo áy náy.'],
  ['nếu con thương bố mẹ', 'Bố mẹ đang lo điều gì, và con thấy thế nào?',
   'Đổi tình cảm lấy hành vi. Đây là chỗ nặng nhất của cả bảng.'],
  ['con nhà người ta', 'So với chính con tháng trước thì tuần này khác ở đâu?',
   'So ngang giữa các con. Sáu ranh giới của mô hình cấm.'],
  ['thế mà cũng không làm được', 'Chỗ khó nhất của việc này với con là chỗ nào?',
   'Làm nhục. Không có phiên bản nhẹ của câu này.']
];

const NHAN_NGUON = ['[KHO GITA]', '[MÁY PHÂN TÍCH]', '[MÁY ĐỀ NGHỊ]',
                    '[CHƯA KIỂM CHỨNG]'];

/* ══ TỪ ĐIỂN KL08 — bản 9.99.48 ══

   Bảng cấm→thay của bản đặc tả 3/20 viết cho LỜI NÓI VỚI KHÁCH. Đem áp
   thẳng lên văn nội bộ thì "sai", "vấn đề", "áp lực" bắt hàng nghìn
   dòng — đúng lỗi 314-dòng của bản 9.99.44.

   Nên mỗi cặp mang PHẠM VI, và bộ dò nhận `doiTuong` của bài:

     moi    dò ở mọi bài
     khach  chỉ dò khi bài viết CHO KHÁCH
     nhac   KHÔNG dò — từ quá thường, dò thì báo sai nhiều hơn báo đúng.
            Chúng vẫn ở trong kho để người đọc từ điển thấy.

   Bảng ở đây chỉ giữ hai cột máy cần; cả từ điển đầy đủ nằm ở kho. */
const KL_THAY = [
  ['bạn phải', 'việc hôm nay là', 'moi'],
  ['tại sao bạn không', 'điều gì đang cản đường?', 'moi'],
  ['sao con bạn', 'con đang ở mùa nào của riêng mình?', 'moi'],
  ['lười biếng', 'chưa đủ năng lượng', 'moi'],
  ['yếu kém', 'hạt đang nảy mầm', 'moi'],
  ['phải giỏi hơn', 'trở nên giỏi hơn chính mình', 'moi'],
  ['cam kết 100%', 'cùng nhau đi từng nhịp', 'moi'],
  ['hứa chắc chắn', 'tin vào từng bước nhỏ', 'moi'],
  ['thất bại', 'mùa gió', 'khach'],
  ['tụt hạng', 'về gốc', 'khach'],
  ['bị phạt', 'lấy lại nhịp', 'khach'],
  ['cố lên', 'vững tâm', 'khach'],
  ['tuyệt vời', 'đã hoàn thành', 'khach'],
  ['xuất sắc quá', 'kiên trì thật', 'khach'],
  ['đổi đời', 'bình an vững chãi', 'khach'],
  ['bạn đã bỏ lỡ', 'hôm nay để trống', 'khach'],
  ['chậm tiến độ', 'đang ở nhịp riêng', 'khach'],
  ['áp lực', 'cản gió', 'khach'],
  ['sai', 'một lần thử khác', 'nhac'],
  ['vấn đề', 'điều đang cần nhìn lại', 'nhac']
];

/** Dò từ điển KL08 theo phạm vi. `doiTuong`: 'noiBo' (mặc định) | 'khach'. */
export function soatKL(chu, doiTuong) {
  const choKhach = String(doiTuong || 'noiBo') === 'khach';
  const bang = KL_THAY
    .filter(([, , pham]) => pham === 'moi' || (pham === 'khach' && choKhach))
    .map(([cam, thay, pham]) => [cam, thay, pham]);
  return doBang(chu, bang, true)
    .map(x => ({dong: x.dong, bat: x.bat, thay: x.thay, pham: x.vi}));
}

/* ══ MƯỜI SÁU CÂU CHUYÊN GIA KHÔNG NÓI — bản 9.99.44 ══

   Khác LOI_THAY ở MỨC XỬ, không chỉ ở nội dung: bảng kia bắt câu PHÁN
   XÉT và CHẶN ở cổng 1, vì một câu dán nhãn đi vào một nhà thật thì ở
   đó không sửa lại được. Bảng này bắt câu NGHIỆP DƯ và chỉ CẢNH BÁO.

   Vì sao không chặn: phần lớn những câu này có chỗ dùng đúng. "phải"
   trong "phải nộp trước ngày 5" là một mốc hạn, không phải mệnh lệnh
   áp lên người học. Chặn cả chỗ dùng đúng thì người viết học cách lách
   bộ dò, và một bộ dò bị lách thì tệ hơn không có.

   Và mỗi khoá mang theo NGƯỜI NHẬN — "con không bao giờ", không phải
   "không bao giờ". Bản đầu ghi khoá rộng, và lượt quét toàn hệ đầu
   tiên bắt 314 dòng trên 183 màn mà gần hết là đúng: "KHÔNG BAO GIỜ
   ghi đè" là một luật về máy. Ba trăm dòng báo đúng thì lần thứ tư
   không ai đọc cả báo cáo, và mấy dòng sai thật chìm theo. */
const CAM_CHUYENGIA = [
  ['em phải', 'ra lệnh'], ['con phải', 'ra lệnh'],
  ['bắt buộc phải làm', 'ra lệnh'],
  ['em sai rồi', 'phủ định trống'], ['con sai rồi', 'phủ định trống'],
  ['con luôn luôn', 'tuyệt đối hoá'], ['em luôn luôn', 'tuyệt đối hoá'],
  ['con không bao giờ', 'tuyệt đối hoá'], ['em không bao giờ', 'tuyệt đối hoá'],
  ['tất cả trẻ', 'tuyệt đối hoá'], ['ai cũng biết', 'giả định chung'],
  ['chỉ cần cố gắng', 'giảm nhẹ giả'], ['chỉ cần chăm chỉ', 'giảm nhẹ giả'],
  ['theo tôi thì', 'ý kiến thay dữ liệu'],
  ['chắc chắn sẽ đạt', 'hứa kết quả'], ['chắc chắn sẽ giỏi', 'hứa kết quả']
];

/* Câu dài bao nhiêu thì đáng nhắc. 28 từ là ngưỡng CẢNH BÁO, không
   phải ngưỡng chặn — luật N10 nói rõ nó là phép đo yếu nhất trong
   mười cái, và ghi ra để sau không ai nâng nó thành cửa chặn. */
const CAU_DAI = 28;

const boDau = s => String(s || '').toLowerCase()
  .normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd');

/* ═══════════════ ĐỌC MỘT BÀI THÀNH CÁC KHỐI ═══════════════

   Dấu mở khối: một dòng bắt đầu bằng `K01 |`. Dạng có gạch đứng, KHÔNG
   phải dạng `K01:` — cùng quy ước với bộ vẽ thị giác, nơi `TÊN:` là
   một GIÁ TRỊ một dòng còn `TÊN |` là một KHỐI nhiều dòng.

   Trộn hai dạng ấy đã là một lớp lỗi thật ở bộ vẽ: tôi viết `TÂM |`
   cho một giá trị, và hàm đọc giá trị không bao giờ tìm thấy nó. Nên
   ở đây chỉ có MỘT dạng, và nó là dạng khối.

   Chữ sau dấu gạch đứng là tên khối do người viết gõ — máy KHÔNG bắt
   phải trùng tên trong hiến pháp. Bắt trùng tên là bắt người viết gõ
   lại đúng dấu tiếng Việt của hai mươi bốn cái tên, và họ sẽ chép
   dán, và bản chép dán sẽ lệch khi tên đổi. */
/* Bốn tiền tố, một biểu thức. Nhận cả mã của khuôn KHÁC để còn báo
   được "bản này dán nhầm khuôn" thay vì lặng lẽ bỏ qua. */
const RE_MO = /^[ \t]*([KPCS]\d{2})[ \t]*\|(.*)$/;

export function docKhoi(chu, maKhuon) {
  const kh = khuonCua(maKhuon);
  const MA_KHOI = kh.khoi.map(k => k[0]);
  const dong = String(chu || '').split('\n');
  const khoi = {}, la = [], trung = [];
  let dang = null, gom = [];

  const chot = () => {
    if (!dang) return;
    khoi[dang] = gom.join('\n').trim();
    dang = null; gom = [];
  };

  dong.forEach(d => {
    const m = d.match(RE_MO);
    if (!m) { if (dang) gom.push(d); return; }
    chot();
    const ma = m[1];
    if (MA_KHOI.indexOf(ma) < 0) { la.push(ma); dang = null; gom = []; return; }

    if (Object.prototype.hasOwnProperty.call(khoi, ma)) trung.push(ma);
    dang = ma; gom = [];
  });
  chot();

  /* Khối mở ra rồi để trống thì KHÔNG tính là có. Đây là chỗ dễ lách
     nhất của cả cổng: gõ đủ hai mươi bốn dấu mở là qua hết phép đếm,
     mà bài vẫn trống. Nên phép đo là CÓ CHỮ, không phải có dấu mở. */
  const co = {}, tronG = [];
  MA_KHOI.forEach(ma => {
    if (!Object.prototype.hasOwnProperty.call(khoi, ma)) return;
    if (khoi[ma].length >= 8) co[ma] = khoi[ma];
    else tronG.push(ma);
  });

  const kq = {khoi: co, thieu: MA_KHOI.filter(ma => !co[ma])};
  /* Trường không áp dụng thì BỎ HẲN KHOÁ, không để mảng rỗng — vắng
     mặt nghĩa là không có chuyện ấy, còn rỗng nghĩa là đáng lẽ phải
     có giá trị. Bộ soát trường trống bắt đúng chỗ này. */
  if (tronG.length) kq.trong = tronG;
  if (la.length)    kq.la = la;
  if (trung.length) kq.trung = trung;
  return kq;
}

/* ═══════════════ KHỐI NÀO ĐÒI KHỐI NÀO ═══════════════

   Đây là chỗ chín trong mười luật chống nội dung rỗng thành PHÉP ĐO.
   "Bài tập không có sản phẩm" là một câu ai cũng gật; K14 đòi K15 là
   một thứ máy chỉ ra được ở đúng dòng nào. */
export function soatDoi(coKhoi, maKhuon) {
  const pham = [];
  const dsKhoi = khuonCua(maKhuon).khoi;
  dsKhoi.forEach(([ma, ten, doi]) => {
    if (!doi || !coKhoi[ma]) return;
    doi.forEach(can => {
      if (coKhoi[can]) return;
      const tenCan = (dsKhoi.find(k => k[0] === can) || [])[1] || can;
      pham.push({khoi: ma, ten, can, tenCan});
    });
  });
  return pham;
}

/* ═══════════════ DÒ CHỮ ═══════════════

   Cả ba phép dò dưới đây trả về SỐ DÒNG. Một lời nhắc chung thì người
   viết gật rồi không sửa chỗ nào; chỉ đúng dòng thì họ sửa. */
/* ══ DÒ THEO TỪ, KHÔNG DÒ THEO CHUỖI CON ══

   Bản đầu tôi viết `t.indexOf(boDau(hang[0])) >= 0`. Nó chạy, và bộ
   thử bắt ngay: một bài sạch bị báo mười ba câu dán nhãn, vì bỏ dấu
   xong thì "hư" thành "hu", và "hu" nằm trong "chua" (chưa), "chuan"
   (chuẩn), "thu" (thứ)… Máy chỉ vào những dòng không có gì sai.

   Đó là lớp hỏng tệ nhất một bộ dò có thể mắc: nó không im, nó BÁO
   SAI — và người viết bị chỉ nhầm ba lần thì lần thứ tư họ thôi đọc
   cả danh sách, kể cả dòng đúng.

   Nay chặn hai đầu bằng ranh giới chữ. Vẫn dò trên bản BỎ DẤU, để
   "lười" và "luoi" cùng bắt được — người ta gõ thiếu dấu rất thường. */
function reTu(cum) {
  const goc = boDau(cum).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    .replace(/\s+/g, '\\s+');
  return new RegExp('(?<![\\p{L}\\p{N}])' + goc + '(?![\\p{L}\\p{N}])', 'u');
}

function doBang(chu, bang, dungCot) {
  const dong = String(chu || '').split('\n');
  const re = bang.map(h => reTu(h[0]));
  const bat = [];
  dong.forEach((d, i) => {
    const t = boDau(d);
    bang.forEach((hang, j) => {
      if (!re[j].test(t)) return;
      const b = {dong: i + 1, bat: hang[0], thay: hang[1]};
      if (dungCot && hang[2]) b.vi = hang[2];
      bat.push(b);
    });
  });
  return bat;
}

export function soatRong(chu)    { return doBang(chu, RONG, false); }
export function soatLoiNoi(chu)  { return doBang(chu, LOI_THAY, true); }
/* Trả về cùng hình dạng, nhưng cột thứ hai là LOẠI LỖI chứ không phải
   câu nói thay — nên đọc ra là `thay` mang tên loại. Đặt tên cột theo
   thứ nó CHỨA chứ không theo thứ nó giống, nên hàm này gói lại. */
export function soatChuyenGia(chu) {
  return doBang(chu, CAM_CHUYENGIA, false)
    .map(function (x) { return {dong: x.dong, bat: x.bat, loi: x.thay}; });
}

/* Câu dài. Đếm theo TỪ chứ không theo ký tự: tiếng Việt nhiều dấu nên
   đếm ký tự thì một câu ngắn đầy dấu cũng vượt ngưỡng. */
export function soatCauDai(chu) {
  const cau = String(chu || '')
    .replace(/^[ \t]*K\d{2}[ \t]*\|.*$/gm, '')   /* bỏ dòng dấu mở khối */
    .split(/(?<=[.!?;])\s+|\n+/)
    .map(c => c.trim()).filter(c => c.length > 0);
  if (!cau.length) return {soCau: 0, trungBinh: 0, dai: []};
  const dem = c => c.split(/\s+/).filter(Boolean).length;
  const tong = cau.reduce((s, c) => s + dem(c), 0);
  const dai = cau.filter(c => dem(c) > CAU_DAI)
    .map(c => ({tu: dem(c), cau: c.slice(0, 90)})).slice(0, 10);
  const kq = {soCau: cau.length, trungBinh: Math.round(tong / cau.length * 10) / 10};
  if (dai.length) kq.dai = dai;
  return kq;
}

/* Nhãn nguồn. Phép đo YẾU: nó đếm bài có nhãn nào không, chứ không
   biết câu nào đáng lẽ phải có nhãn. Ghi thẳng ra đây để sau không ai
   đọc con số này như một phép đo mạnh. */
export function soatNguon(chu) {
  const t = String(chu || '');
  const co = NHAN_NGUON.filter(n => t.indexOf(n) >= 0);
  const kq = {soNhan: co.length, dat: co.length > 0};
  if (co.length) kq.daDung = co;
  return kq;
}

/* Có số hay không. Dùng cho hai chiều: việc phải có con số (mấy lần,
   mấy phút), và KPI phải có mốc nền. */
const coSo = s => /\d/.test(String(s || ''));

/* ═══════════════ CHẤM — SÁU CHIỀU MÁY, BỐN CHIỀU NGƯỜI ═══════════════

   Mỗi chiều trả về `duoc`, `tran`, và `vi` nói ra máy đếm cái gì. Ô
   `vi` không phải trang trí: một điểm số không nói vì sao thì người
   viết hoặc tin mù hoặc bỏ qua, và cả hai đều làm thang điểm vô dụng. */
function chamMay(x, doc, doi, rong, loi, dai, nguon) {
  const k = doc.khoi, cham = {};

  /* Q01 — đúng hệ. Dùng CHUNG hàm soatTang của cổng thị giác, không
     chép: chép là dựng bản thứ hai của ranh giới Tầng, và mục 75 chỉ
     đối chiếu một bản. */
  const st = soatTang(x.tang, String(x.chu || ''));
  cham.Q01 = st.qua
    ? {duoc: 10, tran: 10, vi: st.vi}
    : {duoc: 0, tran: 10, vi: st.vi, ma: st.ma};

  /* Q03 — dùng được ngay. Trần máy 6: máy đo được CÓ công cụ và CÓ
     hướng dẫn, không đo được công cụ ấy có dùng được thật không. */
  const cQ3 = (k.K12 ? 3 : 0) + (k.K13 ? 3 : 0);
  cham.Q03 = {duoc: cQ3, tran: 6, conNguoi: 4,
    vi: 'Máy đếm khối K12 Công cụ và K13 Hướng dẫn dùng. ' +
        (cQ3 === 6 ? 'Có cả hai.' : 'Thiếu: ' +
          [!k.K12 && 'K12', !k.K13 && 'K13'].filter(Boolean).join(', ') + '.')};

  /* Q04 — rõ ràng. Trừ theo hai thứ đếm được: câu rỗng và câu dài. */
  const truRong = Math.min(5, rong.length);
  const truDai  = dai.dai ? Math.min(5, dai.dai.length) : 0;
  cham.Q04 = {duoc: Math.max(0, 10 - truRong - truDai), tran: 10,
    vi: rong.length + ' câu rỗng, ' + (dai.dai ? dai.dai.length : 0) +
        ' câu trên ' + CAU_DAI + ' từ. Câu trung bình ' + dai.trungBinh + ' từ.'};

  /* Q05 — làm được. Việc 24 giờ và việc 7 ngày, mỗi việc phải có SỐ.
     Một việc không có số thì không ai biết làm bao nhiêu là đủ. */
  const q5 = [];
  if (k.K20) q5.push(coSo(k.K20) ? 5 : 3); else q5.push(0);
  if (k.K21) q5.push(coSo(k.K21) ? 5 : 3); else q5.push(0);
  cham.Q05 = {duoc: q5[0] + q5[1], tran: 10,
    vi: 'K20 Việc 24 giờ: ' + (k.K20 ? (coSo(k.K20) ? 'có, có số' : 'có, KHÔNG có số') : 'thiếu') +
        '. K21 Việc 7 ngày: ' + (k.K21 ? (coSo(k.K21) ? 'có, có số' : 'có, KHÔNG có số') : 'thiếu') + '.'};

  /* Q06 — đo được. KPI có số, và có chỗ phản tư để con số ấy dẫn tới
     một quyết định (luật N05). */
  const q6 = (k.K16 ? (coSo(k.K16) ? 5 : 2) : 0) + (k.K18 ? 3 : 0) + (k.K17 ? 2 : 0);
  cham.Q06 = {duoc: q6, tran: 10,
    vi: 'K16 KPI: ' + (k.K16 ? (coSo(k.K16) ? 'có, có mốc số' : 'có, KHÔNG có số nào') : 'thiếu') +
        '. K18 Phản tư: ' + (k.K18 ? 'có' : 'thiếu') +
        '. K17 Bảng theo dõi: ' + (k.K17 ? 'có' : 'thiếu') + '.'};

  /* Q07 — ngôn từ coach. Mỗi câu phán xét trừ hai điểm. Trừ nặng vì
     một câu dán nhãn trong bài của Học viện thì đi thẳng vào một nhà
     thật, và ở đó nó không sửa lại được. */
  cham.Q07 = {duoc: Math.max(0, 10 - loi.length * 2), tran: 10,
    vi: loi.length ? loi.length + ' câu phán xét hoặc dán nhãn — xem danh sách.'
                   : 'Không câu nào rơi vào bảng thay lời.'};

  /* Q09 — chìa khoá kim cương. Trần máy 4, thấp nhất trong ba chiều
     máy chạm tới: máy chỉ biết khối K02 có mặt và không phải một câu
     trong bảng rỗng. Câu ấy có đổi được cách nhìn ai không thì chỉ
     người đọc mới biết. */
  const k2Rong = k.K02 ? RONG.some(r => reTu(r[0]).test(boDau(k.K02))) : false;
  cham.Q09 = {duoc: k.K02 ? (k2Rong ? 1 : 4) : 0, tran: 4, conNguoi: 6,
    vi: !k.K02 ? 'Thiếu khối K02.'
      : k2Rong ? 'Có K02, nhưng câu ấy nằm trong bảng câu rỗng.'
               : 'Có K02 và không rơi vào bảng câu rỗng. Phần còn lại người chấm.'};

  return cham;
}

/* ═══════════════ THANG ĐIỂM RIÊNG CHO BA KHUÔN ═══════════════

   Bản 9.99.45 dựng ba khuôn mới mà không cho chúng thang điểm. Nay có.

   ══ BẢNG ĐIỂM Ở KHO, BỘ ĐO Ở ĐÂY ══

   Kho khai TỪNG CHIỀU cho điểm bao nhiêu và đo bằng PHÉP nào; máy chủ
   hiện đúng bảy phép đo ấy. Tách như thế thì đổi trọng số là sửa kho,
   không phải sửa mã — và mục 77 đối chiếu hai bên.

   Bảy phép, không hơn. Thêm một mã ở kho mà đây chưa hiện thì phép đo
   trả về 0 VÀ ghi vào ô `phepLa` — không im lặng cho 0 điểm, vì một
   chiều bị 0 vì phép đo chưa có trông y hệt một chiều bị 0 vì bài kém. */
const DIEM_KHUON = {
  QUYTRINH: [
    {ma: 'P-1', ten: 'Chặn được chuyện gì', trong: 20, ai: 'nguoi'},
    {ma: 'P-2', ten: 'Bước có người và có tiêu chí', trong: 20, ai: 'may',
     phep: [['khoiCo:P04:ai làm|người làm|phụ trách', 10],
            ['khoiCo:P04:xong khi|đạt khi|hoàn thành khi|tiêu chí', 10]]},
    {ma: 'P-3', ten: 'Điểm kiểm đúng chỗ', trong: 15, ai: 'ca', tran: 8,
     phep: [['coKhoi:P05', 8]]},
    {ma: 'P-4', ten: 'Xử lý lệch đủ hai nhánh', trong: 15, ai: 'may',
     phep: [['sopDu', 15]]},
    {ma: 'P-5', ten: 'Đo được', trong: 10, ai: 'may',
     phep: [['khoiCo:P07:\\d', 6], ['khoiCo:P07:tuần|tháng|quý|ngày', 4]]},
    {ma: 'P-6', ten: 'Phạm vi có ô KHÔNG ÁP', trong: 10, ai: 'may',
     phep: [['khoiCo:P02:không áp|không dùng|trừ ', 10]]},
    {ma: 'P-7', ten: 'Chạy được thật', trong: 10, ai: 'nguoi'}
  ],
  CAMNANG: [
    {ma: 'C-1', ten: 'Tra được nhanh', trong: 20, ai: 'ca', tran: 10,
     phep: [['coKhoi:C06', 10]]},
    {ma: 'C-2', ten: 'Nguyên tắc kèm ví dụ', trong: 15, ai: 'may',
     phep: [['demGach:C02:3', 10], ['coKhoi:C03', 5]]},
    {ma: 'C-3', ten: 'Công cụ dùng được', trong: 20, ai: 'nguoi'},
    {ma: 'C-4', ten: 'Đủ ba tình huống thật', trong: 15, ai: 'may',
     phep: [['demGach:C04:3', 15]]},
    {ma: 'C-5', ten: 'Lỗi có dấu hiệu nhận sớm', trong: 8, ai: 'may',
     phep: [['khoiCo:C05:dấu hiệu|nhận ra|sớm', 8]]},
    {ma: 'C-6', ten: 'Có nguồn', trong: 7, ai: 'may', phep: [['coNguon', 7]]},
    {ma: 'C-7', ten: 'Đúng hệ GITA', trong: 15, ai: 'may', phep: [['dungTang', 15]]}
  ],
  CHUYENSAU: [
    {ma: 'S-1', ten: 'Đúng MỘT câu hỏi trung tâm', trong: 15, ai: 'ca', tran: 10,
     phep: [['coKhoi:S01', 10]]},
    {ma: 'S-2', ten: 'Chỗ hiểu nhầm có ô VÌ SAO HỢP LÝ', trong: 15, ai: 'may',
     phep: [['khoiCo:S02:vì sao|hợp lý|dễ hiểu nhầm|có lý', 15]]},
    {ma: 'S-3', ten: 'Bản chất là QUY LUẬT', trong: 20, ai: 'nguoi'},
    {ma: 'S-4', ten: 'Bằng chứng có nguồn', trong: 15, ai: 'may',
     phep: [['coNguon', 8], ['coKhoi:S08', 7]]},
    {ma: 'S-5', ten: 'Khung áp được cho ca khác', trong: 15, ai: 'nguoi'},
    {ma: 'S-6', ten: 'Có ranh giới hiểu biết', trong: 10, ai: 'may',
     phep: [['khoiCo:S08:không|chưa|ngoài phạm vi', 10]]},
    {ma: 'S-7', ten: 'Rõ ràng', trong: 10, ai: 'may', phep: [['itRong', 10]]}
  ]
};

/* Bảy phép đo. Mỗi phép trả về true/false — điểm là chuyện của bảng. */
function chayPhep(ma, boi) {
  const [ten, khoi, mau] = String(ma).split(':');
  const k = boi.khoi;
  if (ten === 'coKhoi')  return !!k[khoi];
  if (ten === 'khoiCo')  return !!k[khoi] && new RegExp(mau, 'i').test(k[khoi]);
  if (ten === 'demGach')
    return !!k[khoi] &&
      (k[khoi].match(/^\s*(?:\d+[.).]|[-·•*])/gm) || []).length >= Number(mau || 1);
  if (ten === 'dungTang') return boi.dungTang;
  if (ten === 'itRong')   return boi.soRong === 0;
  if (ten === 'coNguon')  return boi.coNguon;
  if (ten === 'sopDu')    return boi.sopDu;
  return null;    /* phép LẠ — không phải false, để phân biệt với "không đạt" */
}

function chamTheoKhuon(maKhuon, boi) {
  const bang = DIEM_KHUON[maKhuon];
  if (!bang) return null;
  const cham = {}, phepLa = [];
  bang.forEach(d => {
    if (d.ai === 'nguoi') return;   /* máy không chấm, không bỏ 0 */
    let duoc = 0;
    const tran = d.ai === 'ca' ? (d.tran || 0) : d.trong;
    const noi = [];
    (d.phep || []).forEach(([ma, diem]) => {
      const r = chayPhep(ma, boi);
      if (r === null) { phepLa.push(d.ma + ' · ' + ma); noi.push('PHÉP LẠ: ' + ma); return; }
      if (r) duoc += diem; else noi.push('chưa đạt: ' + ma);
    });
    cham[d.ma] = {duoc: Math.min(duoc, tran), tran, ten: d.ten,
      vi: noi.length ? noi.join(' · ') : 'đạt đủ',
      conNguoi: d.ai === 'ca' ? d.trong - tran : 0};
  });
  return {cham, phepLa, bang};
}

/* ═══════════════ MƯỜI ĐIỀU KIỆN HOÀN THÀNH ═══════════════

   Đây là thang đo NGƯỜI HỌC, không phải thang đo bài viết — nên nó
   tính riêng, không cộng vào điểm. Một bài 92 điểm vẫn có thể để
   người học không biết bước tiếp theo. */
const XONG_KHOI = {
  H1: ['K01', 'K05'], H2: ['K03'], H3: ['K02', 'K04', 'K06', 'K07', 'K08', 'K09', 'K10'],
  H4: ['K20', 'K21'], H5: ['K12', 'K13'], H6: ['K14', 'K15'],
  H7: ['K16', 'K17', 'K22'], H8: ['K18', 'K19'], H9: ['K11'], H10: ['K23', 'K24']
};
const XONG_TEN = {
  H1: 'Người học rõ mình đang ở đâu', H2: 'Người học rõ mình muốn đi đâu',
  H3: 'Người học hiểu vì sao', H4: 'Người học biết làm gì',
  H5: 'Người học có công cụ trong tay', H6: 'Người học tạo ra một sản phẩm',
  H7: 'Người học biết đo', H8: 'Người học biết phản tư',
  H9: 'Người học biết điều chỉnh', H10: 'Người học biết bước tiếp theo'
};

export function soatXong(coKhoi) {
  const dat = [], chua = [];
  Object.keys(XONG_KHOI).forEach(h => {
    const thieu = XONG_KHOI[h].filter(ma => !coKhoi[ma]);
    if (thieu.length) chua.push({ma: h, dieu: XONG_TEN[h], thieu});
    else dat.push({ma: h, dieu: XONG_TEN[h]});
  });
  return {dat, chua};
}

/* ═══════════════ CỬA ═══════════════

   Một lượt soát KHÔNG ghi gì vào cơ sở dữ liệu ngoài dòng nhật ký.
   Bài học chưa có sổ riêng ở bản này — thang duyệt sáu bậc cho nội
   dung là phần sau. Ghi ra đây để không ai tưởng cổng này đã CHẶN
   được đường phát hành: tới bản 9.99.41 nó ĐO và NÓI, chưa chặn. */
export async function soatNoiDung(y, env, db, hoSo) {
  if (!duocVao(hoSo))
    return {ok: false, error: 'KHONGQUYEN',
      vi: 'Cổng nội dung dành cho người của Học viện từ cấp R05 trở lên.'};

  const chu = String(y.chu || '');
  if (chu.trim().length < 40)
    return {ok: false, error: 'QUANGAN',
      vi: 'Bài quá ngắn để soát. Cần ít nhất 40 ký tự.'};

  const tang = String(y.tang || '');
  const maKhuon = String(y.khuon || 'BAIHOC').toUpperCase();
  const kh = khuonCua(maKhuon);
  const doc  = docKhoi(chu, maKhuon);
  const doi  = soatDoi(doc.khoi, maKhuon);
  const rong = soatRong(chu);
  const loi  = soatLoiNoi(chu);
  const dai  = soatCauDai(chu);
  const ngu  = soatNguon(chu);
  const cg   = soatChuyenGia(chu);
  const vr   = soatVirus(chu);
  /* Bài viết CHO AI. Mặc định nội bộ: một bài không khai đối tượng thì
     coi là nội bộ, vì đoán nhầm theo hướng KHÁCH sẽ bắt hàng loạt câu
     kỹ thuật đúng, còn đoán nhầm theo hướng NỘI BỘ chỉ bỏ sót — và bỏ
     sót thì người viết còn thấy, báo nhầm thì họ thôi đọc. */
  const doiTuong = String(y.doiTuong || 'noiBo') === 'khach' ? 'khach' : 'noiBo';
  const kl   = soatKL(chu, doiTuong);
  /* Mười điều kiện hoàn thành là thang đo của NGƯỜI HỌC, nên nó chỉ có
     nghĩa với khuôn BÀI HỌC. Một quy trình vận hành không có "người
     học", và đo nó bằng thang ấy là đo sai loại — cùng lớp sai với
     việc bắt một quy trình điền Chìa khoá kim cương. */
  const xong = maKhuon === 'BAIHOC' ? soatXong(doc.khoi) : null;
  /* Mỗi khuôn một thang riêng. Thang của bài học hỏi "có công cụ không,
     có KPI không" — hai câu ấy vô nghĩa với một cẩm nang, vì cẩm nang
     KHÔNG có KPI, nó là thứ để tra. Dùng chung một thang thì hoặc bỏ
     hết câu hỏi riêng của từng loại, hoặc chấm mọi loại bằng câu hỏi
     của một loại; cả hai đều cho một con số không đọc được. */
  const cham = maKhuon === 'BAIHOC'
    ? chamMay({tang, chu}, doc, doi, rong, loi, dai, ngu) : null;

  /* Điểm máy: cộng đúng phần máy chấm. KHÔNG cộng ra tổng trên trăm —
     bốn chiều còn trống, và một tổng có ô trống trông y hệt một tổng
     đã đủ. Trả về `tranMay` để người đọc biết tối đa máy cho được bao
     nhiêu, và `conCho` liệt kê ai còn phải chấm gì. */

  /* ══ LUẬT RIÊNG CỦA KHUÔN QUY TRÌNH ══
     Ba thứ đếm được, và cả ba là chỗ một quy trình chết khi có sự cố.
     Đây KHÔNG phải khối thiếu — khối P04 có mặt vẫn có thể là tám bước
     không ai chịu trách nhiệm. */
  const soatSop = [];
  if (maKhuon === 'QUYTRINH') {
    const buoc = String(doc.khoi.P04 || '');
    const soBuoc = (buoc.match(/^\s*(?:\d+[.).]|[-·•])/gm) || []).length;
    const coAi = /\b(ai làm|người làm|do\s|phụ trách)\b/i.test(buoc);
    const coXong = /\b(xong khi|đạt khi|hoàn thành khi|tiêu chí)\b/i.test(buoc);
    if (soBuoc && !coAi) soatSop.push(
      'Các bước không nói AI LÀM. Một bước không có người chịu trách nhiệm là ' +
      'một bước treo — lúc có sự cố thì ai cũng tưởng người kia làm.');
    if (soBuoc && !coXong) soatSop.push(
      'Các bước không nói XONG KHI NÀO. Không có tiêu chí thì "xong" do người ' +
      'làm tự quyết, và mỗi người quyết một kiểu.');
    const lech = String(doc.khoi.P06 || '');
    const duHaiNhanh = /sửa/i.test(lech) && /(leo thang|chuyển lên|báo cấp)/i.test(lech);
    if (doc.khoi.P06 && !duHaiNhanh) soatSop.push(
      'Xử lý lệch thiếu một trong hai nhánh (sửa ngay · leo thang). Một nhánh ' +
      'thôi thì hoặc mọi lỗi nhỏ đều leo lên cấp trên, hoặc mọi lỗi lớn đều bị ' +
      'người tại chỗ tự xử.');
  }

  /* Ba khuôn mới: chấm theo bảng riêng của kho. Chạy SAU khối luật SOP
     vì chiều P-4 đọc thẳng kết quả ấy. */
  const chamKh = maKhuon === 'BAIHOC' ? null : chamTheoKhuon(maKhuon, {
    khoi: doc.khoi,
    dungTang: soatTang(tang, chu).qua,
    soRong: rong.length,
    coNguon: ngu.dat,
    sopDu: maKhuon !== 'QUYTRINH' || soatSop.length === 0
  });

  let duoc = 0, tranMay = 0, conCho = [];
  if (cham) {
    Object.keys(cham).forEach(q => { duoc += cham[q].duoc; tranMay += cham[q].tran; });
    conCho = DIEM.filter(d => d.ai !== 'may')
      .map(d => ({ma: d.ma, ten: d.ten,
        con: d.ai === 'nguoi' ? d.trong : d.trong - (d.tran || 0)}));
  } else if (chamKh) {
    Object.keys(chamKh.cham).forEach(q => {
      duoc += chamKh.cham[q].duoc; tranMay += chamKh.cham[q].tran; });
    conCho = chamKh.bang.filter(d => d.ai !== 'may')
      .map(d => ({ma: d.ma, ten: d.ten,
        con: d.ai === 'nguoi' ? d.trong : d.trong - (d.tran || 0)}));
  }

  const camPham = [];
  if (doi.length) doi.forEach(p => camPham.push({
    ma: p.khoi === 'K14' ? 'N06' : p.khoi === 'K15' ? 'N07' :
        p.khoi === 'K16' ? 'N05' : p.khoi === 'K19' ? 'N08' :
        p.khoi === 'K02' ? 'N03' : 'N04',
    vi: 'Khối ' + p.khoi + ' ' + p.ten + ' có, nhưng thiếu ' + p.can + ' ' + p.tenCan + '.'}));
  if (rong.length) camPham.push({ma: 'N01', vi: rong.length + ' dòng có câu rỗng.'});
  if (!ngu.dat)    camPham.push({ma: 'N09',
    vi: 'Không dòng nào mang nhãn nguồn. Bốn nhãn: ' + NHAN_NGUON.join(' · ')});
  if (dai.dai)     camPham.push({ma: 'N10', canhBao: true,
    vi: dai.dai.length + ' câu trên ' + CAU_DAI + ' từ. Đây là CẢNH BÁO, không chặn.'});
  if (kl.length)   camPham.push({ma: 'KL', canhBao: true,
    vi: kl.length + ' cụm lệch từ điển KL08' +
      (doiTuong === 'khach' ? ' (bài viết CHO KHÁCH nên dò cả lớp `khach`)'
                            : ' (bài nội bộ nên chỉ dò lớp `moi`)') + ': ' +
      kl.slice(0, 4).map(x => '"' + x.bat + '" → "' + x.thay + '"').join(', ') +
      (kl.length > 4 ? '…' : '') + '.'});
  if (vr.length)   camPham.push({ma: 'VIRUS', canhBao: true,
    vi: 'Bài này có ' + vr.length + ' chỗ NUÔI chủng virus: ' +
      vr.slice(0, 4).map(x => x.ma + ' "' + x.bat + '"').join(', ') +
      (vr.length > 4 ? '…' : '') + '. Virus không chỉ đến từ ngoài — nội dung ' +
      'của chính Học viện nuôi được chúng. CẢNH BÁO, không chặn: một câu nhắc ' +
      'tới chủng ấy để dạy cách gỡ thì không phải một câu nuôi nó, và máy dò ' +
      'từ vựng không phân biệt được hai thứ.'});
  if (cg.length)   camPham.push({ma: 'CG', canhBao: true,
    vi: cg.length + ' câu nghiệp dư: ' +
      cg.slice(0, 4).map(function (x) { return '"' + x.bat + '" (' + x.loi + ')'; }).join(', ') +
      (cg.length > 4 ? '…' : '') + '. CẢNH BÁO, không chặn — phần lớn những câu ' +
      'này có chỗ dùng đúng, và chặn cả chỗ dùng đúng thì người viết học cách ' +
      'lách bộ dò.'});

  await Kho.ghiNhatKy(db, {uid: hoSo.uid, username: hoSo.u,
    viec: 'soatNoiDung', doiTuong: tang || '(chưa khai Tầng)',
    chiTiet: 'thiếu ' + doc.thieu.length + '/24 khối · máy cho ' +
             duoc + '/' + tranMay});

  if (soatSop.length) soatSop.forEach(v => camPham.push({ma: 'SOP', vi: v}));

  /* Phép đo LẠ phải nổi lên, không chìm thành 0 điểm: một chiều 0 vì
     phép đo chưa hiện trông y hệt một chiều 0 vì bài kém. */
  if (chamKh && chamKh.phepLa.length) camPham.push({ma: 'PHEPLA',
    vi: 'Kho khai phép đo máy chủ chưa hiện: ' + chamKh.phepLa.join(' · ') +
        '. Chiều ấy đang bị 0 vì THIẾU PHÉP ĐO, không phải vì bài kém.'});

  const kq = {ok: true, tang, khuon: maKhuon, tenKhuon: kh.ten,
    khoi: doc, doi, rong, loi, chuyenGia: cg, virus: vr, kl, doiTuong,
    cauDai: dai, nguon: ngu,
    cham: cham || (chamKh ? chamKh.cham : null),
    diemMay: duoc, tranMay, conCho, cam: camPham,
    vi: 'Khuôn ' + kh.ten + ': máy chấm được ' + tranMay + '/100 điểm và cho ' +
      duoc + '. ' +
        (100 - tranMay) + ' điểm còn lại máy KHÔNG chấm và KHÔNG đoán — chúng ' +
        'đo thứ chỉ người đọc mới thấy. Bài chưa có tổng điểm cho tới khi có ' +
        'người chấm chúng: cộng ra một con số trong lúc còn ô trống là dựng ' +
        'một con số trông như đã xong.'};
  if (xong) kq.xong = xong;
  return kq;
}

/* ═══════════════ ĐỌC MỘT BUỔI LÀM VIỆC ═══════════════

   Chốt của chủ hệ bản 9.99.45: "năng lực thấu hiểu hội thoại tương tác
   giữa khách hàng với các bộ phận."

   ══ NEO VÀO SÁU NHỊP ĐÃ CÓ ══

   G.KICHBAN_AI đã khai N1 MỞ → N6 GIỮ và đang được dùng. Bản đặc tả
   bên ngoài đề nghị năm "phóng đoạn" riêng; dựng thêm là dựng hai
   thang nhịp, rồi hai bộ phận nói hai thứ tiếng về cùng một buổi.

   ══ MÁY ĐẾM, MÁY KHÔNG CHẤM NGƯỜI ══

   Nó đếm ba thứ: buổi đi qua nhịp nào · lượt nào của người làm nghề
   rơi vào bảng thay lời · cuối buổi có cam kết đo được không.

   Nó KHÔNG kết luận buổi ấy tốt hay không. Một buổi đủ sáu nhịp vẫn có
   thể hỏng, và một buổi thiếu N3 vẫn có thể đúng — có ca chỉ cần nghe.
   Đưa số cho người đọc là đủ; kết luận hộ là vượt quyền. */

/* Cam kết ĐO ĐƯỢC: phải có một con số, hoặc một từ chỉ cách ghi nhận.
   Không có thì tuần sau không ai biết nó đã xảy ra hay chưa. */
const CO_DO = /\d|\b(ghi lại|đánh dấu|số lần|đếm|chụp lại|tích vào)\b/i;

const NHIP = [
  ['N1', 'MỞ', ['trước khi bắt đầu', 'hôm nay mình', 'anh chị muốn',
                'ra về với', 'buổi này', 'mình bắt đầu', 'mong muốn gì',
                'điều gì khiến anh chị', 'em có ba mươi phút', 'ta cùng',
                'trước hết', 'mình thống nhất']],
  ['N2', 'NGHE', ['kể cho', 'cụ thể', 'hôm nào', 'lần thứ mấy', 'lúc đó',
                  'đã thử', 'ngay trước', 'chuyện gì xảy ra', 'mấy giờ',
                  'ai có mặt', 'tuần này mấy lần', 'lần gần nhất',
                  'anh chị thấy gì', 'rồi sao nữa']],
  ['N3', 'CÔNG NHẬN', ['em thấy anh chị', 'điều đang chạy được', 'giữ được',
                       'không dễ', 'đã cố', 'đáng ghi nhận', 'anh chị đã',
                       'chỗ này anh chị làm được', 'nhiều nhà không làm được',
                       'em hiểu']],
  ['N4', 'LÀM RÕ', ['mình nghe lại', 'nghe sai chỗ nào', 'phần nào là',
                    'chứng kiến', 'suy đoán', 'ý anh chị là', 'nói cách khác',
                    'em tóm lại', 'có đúng là', 'khớp không', 'em hiểu đúng chưa',
                    'tách ra']],
  ['N5', 'DẪN ĐƯỜNG', ['có mấy hướng', 'hướng nào', 'nếu chọn', 'đổi gì',
                       'giữ gì', 'chưa làm gì', 'cách thứ nhất', 'cách thứ hai',
                       'hoặc là', 'anh chị nghiêng về', 'được và mất',
                       'anh chị chọn']],
  ['N6', 'GIỮ', ['24 giờ', 'nhỏ nhất', 'đo bằng', 'ghi lại', 'cuối tuần',
                 'gặp lại', 'nhìn lại', 'tuần tới', 'hẹn', 'chốt lại',
                 'anh chị sẽ', 'bao giờ mình']]
];

/* ══ LỚP THỨ HAI: NHẬN NHỊP THEO HÌNH THỨC CÂU ══

   Bản 9.99.45 nhận nhịp CHỈ bằng dấu hiệu câu chữ, và tôi đã ghi thẳng
   ra chỗ yếu ấy: một người nói cùng ý bằng câu khác thì máy không thấy.
   Bảng trên nay dày hơn, nhưng dày thêm bao nhiêu cũng không phủ hết
   cách nói của một người thật.

   Nên thêm một lớp KHÔNG phụ thuộc câu chữ, đọc HÌNH THỨC của câu:

     N2  câu hỏi + có từ chỉ thời điểm hoặc con số  → đang thu sự việc
     N5  câu hỏi + có "hoặc/hay" nối hai lựa chọn   → đang mở hướng
     N6  có mốc thời gian tương lai + có cách đo    → đang chốt

   Ba cái ấy đo được và không phụ thuộc người nói dùng từ gì.

   ══ VÀ MÁY PHẢI NÓI NÓ NHẬN RA BẰNG LỚP NÀO ══

   Lớp hình thức ĐOÁN nhiều hơn lớp câu chữ: một câu hỏi có số chưa
   chắc đang thu sự việc. Nên mỗi nhịp ghi rõ nhận ra bằng `dauHieu` hay
   bằng `hinhThuc` — người đọc cần biết con số ấy chắc tới đâu. Gộp hai
   lớp vào một con số là làm phần đoán trông như phần đo. */
const RE_HOI = /\?|\bkhông\?|\bgì\b|\bnào\b|\bmấy\b|\bsao\b/i;
const RE_LUC = /\d{1,2}\s*(giờ|h)\b|\btối\b|\bsáng\b|\bchiều\b|\bhôm\b|\bthứ (hai|ba|tư|năm|sáu|bảy)\b|\bchủ nhật\b|\btuần\b|\blần\b/i;
const RE_HOAC = /\bhoặc\b|\bhay là\b|\bhay\s+(?:cứ|để|thử)\b/i;
const RE_TUONGLAI = /\b(24 giờ|hôm nay|tối nay|ngày mai|tuần tới|cuối tuần|tới đây)\b/i;

function nhipTheoHinhThuc(chu) {
  const ra = [];
  const hoi = RE_HOI.test(chu);
  if (hoi && RE_LUC.test(chu)) ra.push('N2');
  if (hoi && RE_HOAC.test(chu)) ra.push('N5');
  if (RE_TUONGLAI.test(chu) && CO_DO.test(chu)) ra.push('N6');
  return ra;
}

/* Ai đang nói. Dạng bản ghi: mỗi dòng "Người: câu". Nhận cả tiếng gọi
   khác nhau vì mỗi bộ phận gọi mình một kiểu, và bắt gõ đúng một từ là
   bắt người ta sửa bản ghi cho vừa cái máy. */
const LA_NGHE = /^\s*(coach|tư vấn|tu van|mình|em|giáo viên|cskh|hỗ trợ|đồng hành)\s*:/i;
const LA_KHACH = /^\s*(khách|khach|phụ huynh|ph|học viên|hs|con|mẹ|bố|anh|chị)\s*:/i;

export function docHoiThoai(chu) {
  const dong = String(chu || '').split('\n')
    .map(d => d.trim()).filter(d => d.length > 0);
  const luot = [];
  dong.forEach((d, i) => {
    const nghe = LA_NGHE.test(d), khach = LA_KHACH.test(d);
    const noi = d.replace(/^[^:]{1,14}:\s*/, '');
    luot.push({so: i + 1, ai: nghe ? 'nghe' : (khach ? 'khach' : 'khongRo'),
      chu: noi});
  });

  const nhipCo = {}, viTri = {}, theo = {};
  luot.forEach(l => {
    if (l.ai !== 'nghe') return;
    const t = boDau(l.chu);
    const boiHinhThuc = nhipTheoHinhThuc(l.chu);
    NHIP.forEach(([ma, ten, dau]) => {
      const boiDau = dau.some(k => t.indexOf(boDau(k)) >= 0);
      const boiHt = boiHinhThuc.indexOf(ma) >= 0;
      if (!boiDau && !boiHt) return;
      nhipCo[ma] = (nhipCo[ma] || 0) + 1;
      if (viTri[ma] === undefined) viTri[ma] = l.so;
      /* Lớp CÂU CHỮ chắc hơn lớp HÌNH THỨC, nên nó ghi đè. Một nhịp
         nhận ra bằng cả hai thì ghi là dauHieu — đó là mức chắc hơn. */
      if (boiDau || theo[ma] !== 'dauHieu') theo[ma] = boiDau ? 'dauHieu' : 'hinhThuc';
      l.nhip = l.nhip || ma;
    });
  });

  /* Ngôn từ: CHỈ soi lượt của người làm nghề. Soi cả lượt của khách là
     chấm khách — họ đang kể chuyện nhà mình, và họ có quyền dùng đúng
     những từ mà nghề này học cách không dùng. */
  const loi = [];
  luot.forEach(l => {
    if (l.ai !== 'nghe') return;
    doBang(l.chu, LOI_THAY, true).forEach(x =>
      loi.push({luot: l.so, bat: x.bat, thay: x.thay, vi: x.vi}));
  });
  const cg = [];
  luot.forEach(l => {
    if (l.ai !== 'nghe') return;
    soatChuyenGia(l.chu).forEach(x => cg.push({luot: l.so, bat: x.bat, loi: x.loi}));
  });

  /* Ba luật, cả ba đếm được. */
  const luotNghe = luot.filter(l => l.ai === 'nghe');
  /* ── CAM KẾT LÀ CỦA KHÁCH, KHÔNG PHẢI CỦA NGƯỜI HỎI ──
     Bản đầu tôi dò cách đo trong ba lượt cuối của NGƯỜI LÀM NGHỀ. Câu
     "trong 24 giờ tới, đo bằng gì?" có chữ số nên nó luôn khớp — và
     luật B3 xanh ở mọi buổi, kể cả buổi khách hứa "tôi sẽ cố gắng kiên
     nhẫn hơn". Bộ thử bắt ngay.
     Một câu HỎI về cách đo không phải một cam kết có cách đo. Nên dò
     trong đuôi buổi, ở lượt của KHÁCH. */
  const duoi = luot.slice(-4);
  const cuoiKhach = duoi.filter(l => l.ai === 'khach').map(l => l.chu).join(' ');
  const luat = [
    {ma: 'B1', luat: 'Buổi phải MỞ trước khi hỏi chuyên môn',
     dat: viTri.N1 !== undefined &&
       (viTri.N2 === undefined || viTri.N1 <= viTri.N2),
     vi: viTri.N1 === undefined ? 'Không lượt nào mang dấu hiệu nhịp N1 MỞ.'
       : (viTri.N2 !== undefined && viTri.N1 > viTri.N2
         ? 'Nhịp N2 đến TRƯỚC N1 — hỏi chuyên môn trước khi chốt buổi này làm gì.'
         : 'Mở ở lượt ' + viTri.N1 + '.')},
    {ma: 'B2', luat: 'Phải có ít nhất một SỰ VIỆC cụ thể',
     dat: (nhipCo.N2 || 0) > 0 && luot.some(l => l.ai === 'khach' && CO_DO.test(l.chu)),
     vi: (nhipCo.N2 || 0) === 0 ? 'Không lượt nào của người làm nghề hỏi sự việc cụ thể.'
       : 'Có hỏi sự việc; và khách có trả lời kèm số hoặc mốc thì mới tính là thu được.'},
    {ma: 'B3', luat: 'Phải kết bằng một CAM KẾT ĐO ĐƯỢC',
     dat: (nhipCo.N6 || 0) > 0 && CO_DO.test(cuoiKhach),
     vi: (nhipCo.N6 || 0) === 0 ? 'Người làm nghề không chốt — không lượt nào mang dấu hiệu nhịp N6 GIỮ.'
       : (CO_DO.test(cuoiKhach) ? 'Khách chốt một việc kèm cách đo.'
         : 'Người làm nghề CÓ hỏi chốt, nhưng khách không nói ra cách đo. Một câu ' +
           'hỏi về cách đo không phải một cam kết có cách đo — tuần sau không ai ' +
           'biết nó đã xảy ra hay chưa, kể cả người hứa.')}
  ];

  const thieuNhip = NHIP.filter(([ma]) => !nhipCo[ma])
    .map(([ma, ten]) => ma + ' ' + ten);

  const kq = {ok: true,
    soLuot: luot.length,
    luotNghe: luotNghe.length,
    luotKhach: luot.filter(l => l.ai === 'khach').length,
    khongRo: luot.filter(l => l.ai === 'khongRo').length,
    nhip: NHIP.map(([ma, ten]) => {
      const n = {ma, ten, lan: nhipCo[ma] || 0};
      if (viTri[ma] !== undefined) n.luotDau = viTri[ma];
      if (theo[ma]) n.theo = theo[ma];
      return n;
    }),
    luat, loi, chuyenGia: cg,
    vi: 'Máy ĐẾM: buổi đi qua nhịp nào, lượt nào của người làm nghề rơi vào ' +
        'bảng thay lời, và cuối buổi có cam kết đo được không. Nó KHÔNG kết ' +
        'luận buổi này tốt hay không — một buổi đủ sáu nhịp vẫn có thể hỏng, ' +
        'và một buổi thiếu N3 vẫn có thể đúng.'};
  /* Trường không áp dụng thì bỏ hẳn khoá. */
  if (thieuNhip.length) kq.thieuNhip = thieuNhip;
  return kq;
}

export async function docBuoi(y, env, db, hoSo) {
  if (!duocVao(hoSo))
    return {ok: false, error: 'KHONGQUYEN',
      vi: 'Cổng nội dung dành cho người của Học viện từ cấp R05 trở lên.'};
  const chu = String(y.chu || '');
  if (chu.trim().length < 60)
    return {ok: false, error: 'QUANGAN',
      vi: 'Bản ghi quá ngắn để đọc. Mỗi dòng một lượt, dạng "Coach: …" / "Khách: …".'};
  const kq = docHoiThoai(chu);
  await Kho.ghiNhatKy(db, {uid: hoSo.uid, username: hoSo.u,
    viec: 'docBuoi', doiTuong: String(y.maBuoi || '(không mã)'),
    chiTiet: kq.soLuot + ' lượt · ' + kq.luat.filter(l => l.dat).length + '/3 luật đạt'});
  return kq;
}

export const BAN_CHEP_BUOI = {NHIP, CO_DO: String(CO_DO),
  HINH_THUC: {hoi: String(RE_HOI), luc: String(RE_LUC),
    hoac: String(RE_HOAC), tuongLai: String(RE_TUONGLAI)}};

/* Mẫu một bài đủ hai mươi bốn khối. Có mẫu thì không ai phải nhớ hai
   mươi bốn mã, và dấu mở khối không bị gõ sai — chỗ hỏng im lặng nhất
   của mọi hệ đọc theo dấu. */
export async function mauBaiHoc(y, env, db, hoSo) {
  if (!duocVao(hoSo))
    return {ok: false, error: 'KHONGQUYEN',
      vi: 'Cổng nội dung dành cho người của Học viện từ cấp R05 trở lên.'};
  const kh = khuonCua(y && y.khuon);
  const mau = kh.khoi.map(([ma, ten]) => ma + ' | ' + ten + '\n').join('\n');
  return {ok: true, mau, khuon: kh.ten, soKhoi: kh.khoi.length,
    vi: 'Mỗi khối mở bằng một dòng dạng `K01 |`. Chữ sau dấu gạch đứng ' +
        'là tên khối, gõ thế nào cũng được — máy đọc theo MÃ. Khối để ' +
        'trống dưới 8 ký tự tính là thiếu.'};
}

/* Xuất bản chép ra cho bộ kiểm đối chiếu với kho (mục 76). Không có
   hàm này thì phép đối chiếu phải đọc mã nguồn bằng biểu thức, và một
   phép đo đọc mã nguồn thì hỏng lặng lẽ khi ai đó xuống dòng khác đi. */
/* ═══════════════ BỘ MIỄN DỊCH — ĐỐI CHIẾU MƯỜI BA LỖI CHẶN ═══════════════

   Bản đặc tả phần 3 của chủ hệ khai mười ba lỗi CHẶN PHÁT HÀNH. Chúng
   nằm khắp hệ — đăng ký, ảnh trẻ em, tải Coach, hạ tầng, truyền thông —
   chứ không nằm trong bộ nội dung.

   ══ NÊN CHỖ NÀY KHÔNG HỨA CHẶN, NÓ ĐỐI CHIẾU ══

   Mỗi lỗi có một phép kiểm, và phép kiểm ấy chỉ trả về một trong ba:

     chan     kho ĐANG chặn thật, và phép kiểm chỉ ra chặn ở đâu
     motPhan  có một lớp, còn thiếu lớp khác — nói rõ thiếu lớp nào
     chua     chưa có gì

   Không có mức thứ tư. Một bảng ghi "đã xử lý 100%" mà không ai kiểm
   được thì nó là một lời trấn an, không phải một lớp phòng vệ — và lời
   trấn an là thứ nguy hiểm nhất trong một bảng an toàn.

   ══ VÀ PHÉP KIỂM ĐỌC SỰ THẬT, KHÔNG ĐỌC LỜI KHAI ══

   Mỗi phép gọi thẳng thứ nó nói là đang chặn: gọi cổng Tầng, gọi bộ dò
   ngôn từ, đọc bảng quyền. Đọc một ô "đã làm" trong kho thì ô ấy nói gì
   cũng được. */

/* Ba mức, và tên chúng ngắn để bảng đọc được. */
const MD_MUC = {CHAN: 'chan', MOT_PHAN: 'motPhan', CHUA: 'chua'};

function soatMienDichMay(db) {
  const r = {};

  /* A01 — khoá thương mại ba lớp. Bộ nội dung không giữ cửa bán hàng,
     nên đây là CHƯA, và nói rõ nó thuộc về đâu. */
  r.A01 = {muc: MD_MUC.CHUA,
    vi: 'Cửa bán hàng không nằm trong bộ nội dung. Chưa có phép kiểm nào đọc ' +
        'được ba lớp điều kiện (đủ tầng VÀ đủ ba mươi ngày VÀ đủ nghi lễ).'};

  r.A02 = {muc: MD_MUC.CHUA,
    vi: 'Hai thuật toán xếp cấp nằm ở kho chặng, không ở đây. Chưa có phép ' +
        'kiểm đối chiếu chúng.'};

  /* B01–B03 — hàng đợi cứu hộ. Chưa có bảng nào trong csdl.sql. */
  ['B01', 'B02', 'B03'].forEach(m => { r[m] = {muc: MD_MUC.CHUA,
    vi: 'Chưa có hàng đợi cứu hộ trong nền dữ liệu — không bảng nào giữ ca ' +
        'trực đêm hay mốc bàn giao.'}; });

  /* B04 — chuyển tuyến. Luật CÓ trong kho (AIPOLICY, quy trình nhóm) và
     bộ nội dung KHÔNG kiểm được nó, vì nó là quyết định lâm sàng. */
  r.B04 = {muc: MD_MUC.MOT_PHAN,
    vi: 'Luật cấm chẩn đoán và buộc chuyển tuyến ĐÃ có trong kho, và bộ dò ' +
        'ngôn từ bắt được câu chẩn đoán trong bài. Còn thiếu: không phép kiểm ' +
        'nào đọc được một CA THẬT có được chuyển tuyến đúng lúc hay không — ' +
        'ngưỡng ấy là quyết định lâm sàng, không phải một ô trống chờ điền.'};

  /* C01 — ảnh trẻ em. Luật C13 của Hiến pháp Thị giác cấm, và cổng thị
     giác chặn ở bậc phát hành. Nhưng quét ảnh TRƯỚC lúc tải lên thì
     chưa có — và đó chính là lớp bản đặc tả đòi. */
  r.C01 = {muc: MD_MUC.MOT_PHAN,
    vi: 'Luật C13 cấm sinh và dùng hình trẻ em, và cổng thị giác chặn ở bậc ' +
        'phát hành. Còn thiếu đúng lớp bản đặc tả đòi: quét NGAY TRÊN MÁY ' +
        'NGƯỜI GỬI trước khi tải lên. Quét sau khi tải lên là đã muộn — tệp ' +
        'đã rời khỏi máy họ.'};

  /* C03 — OTP người giám hộ. Cửa đăng ký CÓ mã xác nhận; gửi cho AI hay
     cho người giám hộ thì bộ nội dung không đọc được. */
  r.C03 = {muc: MD_MUC.MOT_PHAN,
    vi: 'Cửa đăng ký CÓ bước mã xác nhận. Còn thiếu phép kiểm đọc được mã ấy ' +
        'gửi tới NGƯỜI GIÁM HỘ chứ không tới chính trẻ — hai chuyện khác nhau, ' +
        'và chỉ chuyện thứ hai mới chặn được lỗi này.'};

  /* C05 — trợ lý rò dữ liệu nhà khác. Luật CÓ; và ở đây có một phép
     kiểm thật: cổng nội dung không bao giờ nhận dữ liệu nhà nào. */
  r.C05 = {muc: MD_MUC.MOT_PHAN,
    vi: 'Luật "không nói về gia đình khác" đã có trong G.AIPOLICY, và cổng nội ' +
        'dung KHÔNG đọc dữ liệu nhà nào — nó chỉ đọc bài. Còn thiếu: trợ lý ' +
        'trò chuyện thì có đọc, và phạm vi ngữ cảnh của nó chưa có phép kiểm.'};

  r.D01 = {muc: MD_MUC.CHUA,
    vi: 'Trần tải Coach khai ở G.DD_TRAN_LUAT trong kho, nhưng chưa phép kiểm ' +
        'nào ĐẾM số ca thật trên một Coach. Đo bằng lời khai thì trần nào cũng đạt.'};

  /* E07 — fail-closed. Đây là chỗ kho làm ĐÚNG và kiểm được. */
  r.E07 = {muc: MD_MUC.CHAN,
    vi: 'Bộ định tuyến dùng DANH SÁCH TRẮNG: vai không có tên là không được, ' +
        'kể cả vai chưa tồn tại hôm nay. Mục 18 của bộ thử cửa vào gọi thẳng ' +
        'hàm phạm vi với một vai lạ và đòi nó chỉ trả phần nền.'};

  /* F04 — cửa duyệt chuyên môn. Thang năm cổng CÓ cổng C3. */
  r.F04 = {muc: MD_MUC.CHAN,
    vi: 'Cổng C3 của thang năm cổng đòi người mang quyền `chuyenMon` ký, và ' +
        'luật L2 cấm người viết tự ký. Không có đường nào đi tắt qua cổng ấy.'};

  /* G01 — hứa hẹn thu nhập. Bộ dò CÓ, nhưng chỉ CẢNH BÁO. */
  const dinh = soatChuyenGia('Theo lộ trình này con chắc chắn sẽ đạt kết quả.');
  r.G01 = {muc: dinh.length ? MD_MUC.MOT_PHAN : MD_MUC.CHUA,
    vi: dinh.length
      ? 'Bộ dò bắt được câu hứa kết quả, nhưng nó chỉ CẢNH BÁO chứ không chặn ' +
        'cổng 1 — phần lớn những câu ấy có chỗ dùng đúng. Bản đặc tả đòi lọc ' +
        'CHẶN ở cửa phát hành. Nâng nó thành cửa chặn là một quyết định của ' +
        'chủ hệ, không phải một dòng mã: nó sẽ chặn cả chỗ dùng đúng.'
      : 'Bộ dò không bắt được câu hứa kết quả — đây là một lỗi, không phải một ' +
        'lựa chọn.'};

  return r;
}

/** Nội dung này có NUÔI chủng virus nào không — phần máy đo được. */
export function soatVirus(chu) {
  const t = boDau(chu || '');
  const bat = [];
  MD_TUNGU.forEach(([ma, ten, cum]) => {
    cum.forEach(c => {
      if (!reTu(c).test(t)) return;
      bat.push({ma, ten, bat: c});
    });
  });
  return bat;
}

/* Bản chép phần TỪ NGỮ của mười tám chủng — chỉ những chủng máy canh
   được bằng chữ. Chủng không có dòng ở đây là chủng máy CHƯA canh
   được, và mục 77 đối chiếu đúng chỗ ấy với kho. */
const MD_TUNGU = [
  ['V02', 'Tê liệt sau một ngày hỏng',
   ['đứt chuỗi', 'chuỗi đứt', 'mất chuỗi', 'bắt đầu lại từ đầu']],
  ['V07', 'Tư duy được ăn cả', ['hoàn thành 100%', 'phải làm đủ', 'không đạt thì bỏ']],
  ['V08', 'Chờ đủ điều kiện mới bắt đầu', ['khi nào rảnh', 'chuẩn bị đầy đủ rồi hãy', 'đợi đến khi']],
  ['V09', 'Suy diễn một lần hụt thành bản chất kém cỏi', ['bạn đã bỏ lỡ', 'thất bại', 'không hoàn thành']],
  ['V10', 'Đo mình bằng thước người khác', ['trung bình cộng đồng', 'so với các nhà khác', 'con nhà người ta']],
  ['V11', 'Nghĩ đổi đời phải đau đớn', ['khổ luyện', 'phải hy sinh', 'không đau thì không thành']],
  ['V17', '"Người như mình thì không thay đổi được"', ['người như bạn', 'trường hợp của bạn khó', 'không phải ai cũng làm được']],
  ['V18', '"Cố gắng là vô nghĩa"', ['cố gắng là vô nghĩa', 'làm mãi không được', 'chẳng đi đến đâu']]
];

export async function soatMienDich(y, env, db, hoSo) {
  if (!duocVao(hoSo))
    return {ok: false, error: 'KHONGQUYEN',
      vi: 'Cổng nội dung dành cho người của Học viện từ cấp R05 trở lên.'};

  const bang = soatMienDichMay(db);
  const dem = {chan: 0, motPhan: 0, chua: 0};
  Object.keys(bang).forEach(k => { dem[bang[k].muc]++; });

  const kq = {ok: true, bang, dem, soChan: Object.keys(bang).length,
    vi: 'Mười ba lỗi chặn phát hành: ' + dem.chan + ' đã chặn thật · ' +
        dem.motPhan + ' mới có một phần · ' + dem.chua + ' chưa có gì. ' +
        'Bảng này ĐỐI CHIẾU, không hứa. Phần lớn mười ba lỗi ấy nằm ngoài bộ ' +
        'nội dung — đăng ký, ảnh trẻ em, tải Coach, hạ tầng — nên chỗ này nói ' +
        'thẳng cái nó không giữ, thay vì ghi "đã xử lý" cho đủ bảng.'};

  if (y && y.chu) kq.virus = soatVirus(String(y.chu));

  await Kho.ghiNhatKy(db, {uid: hoSo.uid, username: hoSo.u,
    viec: 'soatMienDich', doiTuong: 'MD-13',
    chiTiet: dem.chan + '/' + dem.motPhan + '/' + dem.chua});
  return kq;
}

export const BAN_CHEP_KL = {KL_THAY};

export const BAN_CHEP_MD = {MD_TUNGU, MA_CHAN: Object.keys(soatMienDichMay(null)).sort()};

/* ═══════════════ XUẤT CHUẨN NGHỀ RA NGOÀI ═══════════════

   Mục ND-04 tới bản 9.99.45 là một DÒNG NHẮC trong sổ chờ: "ô ngheDoi
   là nguồn ngoài, đưa vào ấn phẩm thì phải dẫn nguồn thật". Một dòng
   nhắc thì đọc xong ai cũng gật, rồi sáu tháng sau có người chép một
   câu vào một tờ rơi và không ai nhớ ra dòng ấy.

   Nay nó là một CỬA.

   ══ VÀ ĐÂY LÀ CHỖ BẢN 9.99.48 CÒN HỞ, SỬA Ở 9.99.49 ══

   Bản trước cửa này đọc hai ô `trichDuoc` và `nguon` từ CHÍNH LƯỢT GỌI
   của máy khách. Hai chuyện hỏng cùng lúc:

     · Chủ hệ không có chỗ nào để chốt. Chốt nghĩa là sửa kho gốc rồi
       phát hành lại — nên suốt ba bản không mục nào được chốt, và sổ
       chờ vẫn ghi "đang chờ chủ hệ" trong khi thật ra là đang chờ MỘT
       CÁI NÚT chưa ai dựng.
     · Cửa tin lời máy khách. Gửi lên trichDuoc:true là qua. Đúng lớp
       lỗi "lọc trên màn hình không phải bảo vệ dữ liệu".

   Nay quyết định nằm ở sổ chotTrichNghe trong máy chủ: chủ hệ bấm chốt
   ở màn Biên soạn, máy chủ ghi, và cửa này đọc SỔ chứ không đọc lượt
   gọi. Máy khách gửi lên đúng một thứ: danh sách MÃ muốn trích.

   Chỉ R01–R02 mở được — cùng ngưỡng với cấp quyền ký. */
export async function xuatChuanNghe(y, env, db, hoSo) {
  if ((BAC[hoSo.role] || 99) > CAP_QUYEN_KY)
    return {ok: false, error: 'KHONGQUYEN',
      vi: 'Chỉ R01–R02 trích được chuẩn nghề ra ngoài. Đây là lời khai của ' +
          'Học viện về nguồn gốc một câu chữ.'};

  /* Nhận cả hai lối gọi: mảng mã, hoặc mảng bản ghi có ô `ma`. Lối thứ
     hai là lối cũ — nhận nó để bản web cũ không gãy, nhưng chỉ lấy ô
     `ma`, mọi ô khác của lượt gọi bị BỎ. */
  const ds = (Array.isArray(y.muc) ? y.muc : [])
    .map(m => String((m && m.ma) || m || '').trim()).filter(Boolean);
  if (!ds.length)
    return {ok: false, error: 'TRONG', vi: 'Chưa chọn mục nào.'};

  const daChot = await dsChotTrichNghe(db);
  const chan = [], qua = [];
  ds.forEach(ma => {
    const c = daChot[ma];
    if (!c) chan.push({ma, vi: 'chưa có lượt chốt nào trong sổ'});
    else if (!c.trichDuoc) chan.push({ma, vi: 'chủ hệ đã chốt là KHÔNG được trích'});
    else if (String(c.nguon || '').trim().length < 10)
      chan.push({ma, vi: 'đã chốt được trích nhưng CHƯA ghi nguồn thật'});
    else qua.push({ma, nguon: c.nguon, choti: c.chotLuc, boiAi: c.boiAi});
  });

  await Kho.ghiNhatKy(db, {uid: hoSo.uid, username: hoSo.u,
    viec: 'xuatChuanNghe', doiTuong: ds.join(','),
    chiTiet: 'qua ' + qua.length + ' · chặn ' + chan.length});

  if (chan.length)
    return {ok: false, error: 'CHUACHOT', chan, qua,
      vi: 'Chặn ' + chan.length + ' mục (ND-04). Ô `ngheDoi` là chuẩn hành nghề ' +
          'có sẵn NGOÀI Học viện — đối chiếu trong máy thì được, đưa ra ngoài ' +
          'thì phải có hai thứ: chủ hệ chốt mục ấy được trích, và ghi nguồn ' +
          'thật để dẫn. Máy KHÔNG tự điền hai ô ấy: đó là lời khai của Học ' +
          'viện, và một lời khai máy tự viết thì không ai chịu trách nhiệm được.'};

  return {ok: true, qua,
    vi: qua.length + ' mục đã chốt và có nguồn — trích được, kèm nguồn ghi ở trên.'};
}

/* ══ SỔ CHỐT TRÍCH — ND-04 ══

   Chỉ-thêm. Đổi ý thì ghi dòng mới; dòng mới nhất của một mã là dòng
   đang có hiệu lực. Không sửa, không xoá — một lời khai về nguồn gốc
   câu chữ mà sửa được thì nó không còn là lời khai.

   Chỉ R01 chốt được, KHÔNG phải R01–R02 như cửa xuất. Hai ngưỡng khác
   nhau có chủ ý: mở cửa lấy một bản trích là việc vận hành, còn nói
   "câu này của Học viện được phép dẫn ra ngoài, dẫn theo nguồn này" là
   một lời khai chỉ chủ hệ đứng tên được. */
const CAP_CHOT_TRICH = 1;

export async function chotTrichNghe(y, env, db, hoSo) {
  if ((BAC[hoSo.role] || 99) > CAP_CHOT_TRICH)
    return {ok: false, error: 'KHONGQUYEN',
      vi: 'Chỉ Super Admin chốt được mục chuẩn nghề nào được trích ra ngoài. ' +
          'Đây là lời khai của Học viện về nguồn gốc một câu chữ, không phải ' +
          'một thao tác vận hành.'};

  const ma = String(y.ma || '').trim();
  const duoc = y.trichDuoc === true || y.trichDuoc === 1 || y.trichDuoc === '1';
  const nguon = String(y.nguon || '').trim();
  const lyDo = String(y.lyDo || '').trim();

  if (!ma) return {ok: false, error: 'THIEUMA', vi: 'Chưa nói chốt mục nào.'};
  if (lyDo.length < 10)
    return {ok: false, error: 'THIEULYDO',
      vi: 'Lượt chốt phải nói vì sao. Cùng luật với cấp quyền ký: một quyết ' +
          'định không lý do thì sáu tháng sau không ai dám đổi, vì không ai ' +
          'biết vì sao nó có ở đó.'};
  if (duoc && nguon.length < 10)
    return {ok: false, error: 'THIEUNGUON',
      vi: 'Chốt ĐƯỢC TRÍCH thì phải có nguồn thật để dẫn. Chốt được trích mà ' +
          'không dẫn được nguồn là đúng thứ cửa xuất đang chặn — chốt xong ' +
          'vẫn chặn thì lượt chốt ấy không làm được gì.'};

  await db.prepare(
    'INSERT INTO chotTrichNghe (id,ma,trichDuoc,nguon,lyDo,boiAi,vaiLuc,chotLuc) ' +
    'VALUES (?,?,?,?,?,?,?,?)')
    .bind(maMoi(), ma, duoc ? 1 : 0, duoc ? nguon : '', lyDo,
      hoSo.u, hoSo.role, new Date().toISOString()).run();

  await Kho.ghiNhatKy(db, {uid: hoSo.uid, username: hoSo.u,
    viec: 'chotTrichNghe', doiTuong: ma,
    chiTiet: (duoc ? 'ĐƯỢC TRÍCH · ' + nguon : 'KHÔNG được trích') + ' · ' + lyDo});

  return {ok: true, ma, trichDuoc: duoc,
    vi: duoc ? 'Đã chốt: mục ' + ma + ' được trích, dẫn theo nguồn đã ghi.'
             : 'Đã chốt: mục ' + ma + ' KHÔNG được trích ra ngoài.'};
}

/* Trả về bản đồ mã → lượt chốt MỚI NHẤT. Dùng cho cả cửa xuất lẫn màn
   hình, nên nó là hàm thường chứ không phải cửa — cửa gọi nó, màn hình
   gọi qua cửa dsChotTrich. */
export async function dsChotTrichNghe(db) {
  const r = await db.prepare(
    'SELECT ma, trichDuoc, nguon, lyDo, boiAi, vaiLuc, chotLuc FROM chotTrichNghe ' +
    'ORDER BY chotLuc ASC').all();
  const ra = {};
  ((r && r.results) || []).forEach(d => {
    ra[d.ma] = {ma: d.ma, trichDuoc: !!d.trichDuoc, nguon: d.nguon,
      lyDo: d.lyDo, boiAi: d.boiAi, vaiLuc: d.vaiLuc, chotLuc: d.chotLuc};
  });
  return ra;
}

export async function dsChotTrich(y, env, db, hoSo) {
  if ((BAC[hoSo.role] || 99) > CAP_QUYEN_KY)
    return {ok: false, error: 'KHONGQUYEN', vi: 'Chỉ R01–R02 đọc được sổ chốt trích.'};
  const ds = await dsChotTrichNghe(db);
  return {ok: true, ds, so: Object.keys(ds).length};
}

export const BAN_CHEP = {KHOI, DIEM, BAC_DIEM, RONG, LOI_THAY, NHAN_NGUON,
  CAU_DAI, CAM_CHUYENGIA, KHUON, DIEM_KHUON};

/* ═══════════════════════════════════════════════════════════════
   THANG NĂM CỔNG — bản 9.99.42

   Chốt của chủ hệ: "không gì lên sóng mà không qua 5 cổng kiểm duyệt
   có người ký."

   Bản 9.99.41 chỉ ĐO và NÓI. Phần này CHẶN.

   ══ HAI CHỖ TÔI SỬA BẢN ĐẶC TẢ CỦA CHỦ HỆ ══

   1. Bảng quyền của bản đặc tả cho Super Admin đứng ở CẢ NĂM cổng. Đọc
      thì tiện — chủ hệ gỡ được cổng tắc. Nhưng một mình chủ hệ ký được
      cổng 2, 3, 4, rồi 5: thang năm cổng thành MỘT chữ ký, sổ vẫn đủ
      năm dòng, và chỉ khi đọc cột tên mới thấy năm dòng cùng một tên.
      Luật L3 đóng chỗ ấy: một người ký nhiều nhất MỘT cổng trên một bài.

   2. Bản đặc tả ghi vân tay nội dung vào mỗi chữ ký và nói "ai chỉnh
      content ngầm sau khi duyệt là lộ ngay qua hash". LỘ chứ không
      CHẶN — nghĩa là phải có người đi đọc mới thấy, mà chẳng ai đi đọc.
      Ở đây sửa bài là mọi chữ ký cũ HẾT HIỆU LỰC và bài về bản nháp.
      Máy làm việc ấy, không phải người phát hiện ra.
   ═══════════════════════════════════════════════════════════════ */

/* Năm cổng, và cổng nào đi tiếp sang cổng nào. Bản chép của
   G.KN_TRANGTHAI; mục 77 của bộ kiểm đối chiếu. */
const CONG_TIEP = {
  nhap: ['may'], may: ['bienTap'], bienTap: ['chuyenMon'],
  chuyenMon: ['giuChuan'], giuChuan: ['chuHe'], chuHe: ['phatHanh'],
  phatHanh: [], tuChoi: []
};

/* Bậc nào ứng với cổng nào, và quyền nào ký được. */
const CONG_MA = {may: 'C1', bienTap: 'C2', chuyenMon: 'C3',
                 giuChuan: 'C4', chuHe: 'C5'};
const CONG_QUYEN = {bienTap: 'bienTap', chuyenMon: 'chuyenMon',
                    giuChuan: 'giuChuan'};
const SLA_GIO = {bienTap: 24, chuyenMon: 72, giuChuan: 24, chuHe: 48};

const CAP_QUYEN_KY = 2;   /* chỉ R01–R02 cấp được quyền ký — như quyenTaiChinh */

/* ══ VÂN TAY ══
   SHA-256, rút 16 chữ đầu. Rút ngắn vì cột này để ĐỐI CHIẾU chứ không
   để chống giả mạo có chủ đích: kẻ sửa được thẳng cơ sở dữ liệu thì
   sửa luôn cả cột vân tay. Thứ nó bắt là chỗ sửa bài qua đúng cửa
   ứng dụng rồi quên mất là bài đã có chữ ký — và đó là chỗ hay xảy ra. */
async function vanTay(chu) {
  const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(String(chu || '')));
  return Array.from(new Uint8Array(b)).map(x => x.toString(16).padStart(2, '0'))
    .join('').slice(0, 16);
}

const maMoi = () => (crypto.randomUUID ? crypto.randomUUID() : String(Math.random()))
  .replace(/-/g, '').slice(0, 24);

/** Người này đang giữ quyền ký nào. Đọc bảng quyenNoiDung, bỏ dòng đã thu hồi. */
async function quyenKy(db, username) {
  /* lower() hai vế — quyền lưu theo username chuẩn của tài khoản, phiên
     gửi hoSo.u; khác hoa/thường thì tra trượt và một biên tập có quyền
     thật bị từ chối ký. Lỗ H-4 tổ thanh tra đợt 3 (username≠u). */
  const r = await db.prepare(
    'SELECT chucNang FROM quyenNoiDung WHERE lower(username) = lower(?) AND thuHoiLuc IS NULL')
    .bind(String(username || '')).all();
  return ((r && r.results) || []).map(x => x.chucNang);
}

/* ═══════════════ NẠP MỘT BÀI ═══════════════

   Ghi bài ở bậc NHÁP. Không tự đẩy vào cổng 1: nạp và nộp là hai việc
   khác nhau, và gộp chúng thì không ai sửa được bản nháp của mình. */
export async function napBai(y, env, db, hoSo) {
  if (!duocVao(hoSo))
    return {ok: false, error: 'KHONGQUYEN',
      vi: 'Cổng nội dung dành cho người của Học viện từ cấp R05 trở lên.'};

  const chu = String(y.chu || '');
  const tieuDe = String(y.tieuDe || '').trim();
  if (tieuDe.length < 4)
    return {ok: false, error: 'THIEUTIEUDE', vi: 'Bài phải có tiêu đề.'};
  if (chu.trim().length < 40)
    return {ok: false, error: 'QUANGAN', vi: 'Bài quá ngắn. Cần ít nhất 40 ký tự.'};

  const id = String(y.id || '').trim() || ('BND-' + maMoi());
  const cu = await db.prepare('SELECT * FROM baiNoiDung WHERE id = ?').bind(id).first();
  const vt = await vanTay(chu);
  const luc = new Date().toISOString();

  if (!cu) {
    await db.prepare(
      'INSERT INTO baiNoiDung (id,tieuDe,chu,tang,khuon,doiTuong,vanTay,' +
      'trangThai,nguoiViet,vietLuc) VALUES (?,?,?,?,?,?,?,?,?,?)')
      .bind(id, tieuDe, chu, String(y.tang || 'T1'),
        khuonCua(y.khuon) === KHUON.BAIHOC ? 'BAIHOC' : String(y.khuon).toUpperCase(),
        String(y.doiTuong || 'noiBo') === 'khach' ? 'khach' : 'noiBo',
        vt, 'nhap', hoSo.uid, luc).run();
    await Kho.ghiNhatKy(db, {uid: hoSo.uid, username: hoSo.u,
      viec: 'napBai', doiTuong: id, chiTiet: 'bài mới · ' + tieuDe});
    return {ok: true, id, trangThai: 'nhap', vanTay: vt};
  }

  /* ── SỬA MỘT BÀI ĐÃ CÓ CHỮ KÝ: LUẬT L4 ──
     Không chặn lượt sửa — chặn là bắt người ta dựng một bài thứ hai để
     sửa một chữ, và bài thứ hai thì không ai nối lại được với bài đầu.
     Thay vào đó: mọi chữ ký cũ hết hiệu lực, bài về bản nháp, và sổ ký
     GIỮ NGUYÊN các dòng cũ kèm vân tay cũ — nên sáu tháng sau vẫn đọc
     ra được là bốn người từng ký một bản khác. */
  if (cu.nguoiViet !== hoSo.uid && !laChuHe(hoSo))
    return {ok: false, error: 'KHONGPHAIBAICUA',
      vi: 'Bài này của người khác. Chỉ người viết hoặc chủ hệ sửa được.'};
  if (cu.trangThai === 'phatHanh')
    return {ok: false, error: 'DAPHATHANH',
      vi: 'Bài đã phát hành thì không sửa đè. Bài đã ở trong tay người đọc; ' +
          'ghi đè bản trong sổ là làm sổ nói khác thứ họ đang cầm. Nạp một ' +
          'bài mới.'};

  const doiChu = cu.chu !== chu;
  const soKyCu = await db.prepare(
    'SELECT COUNT(*) n FROM kyNoiDung WHERE baiId = ? AND viec = ?')
    .bind(id, 'ky').first();
  const coKy = ((soKyCu && soKyCu.n) || 0) > 0;

  await db.prepare(
    'UPDATE baiNoiDung SET tieuDe = ?, chu = ?, tang = ?, khuon = ?, ' +
    'doiTuong = ?, vanTay = ?, trangThai = ?, vaoCongLuc = NULL, ' +
    'soatMay = NULL WHERE id = ?')
    .bind(tieuDe, chu, String(y.tang || cu.tang),
      y.khuon ? String(y.khuon).toUpperCase() : (cu.khuon || 'BAIHOC'),
      y.doiTuong ? (String(y.doiTuong) === 'khach' ? 'khach' : 'noiBo')
                 : (cu.doiTuong || 'noiBo'), vt,
      doiChu ? 'nhap' : cu.trangThai, id).run();

  await Kho.ghiNhatKy(db, {uid: hoSo.uid, username: hoSo.u,
    viec: 'suaBai', doiTuong: id,
    chiTiet: doiChu ? ('nội dung đổi · ' + (coKy ? 'chữ ký cũ hết hiệu lực' : 'chưa có chữ ký'))
                    : 'chỉ đổi tiêu đề'});

  const kq = {ok: true, id, trangThai: doiChu ? 'nhap' : cu.trangThai, vanTay: vt};
  if (doiChu && coKy) kq.vi =
    'Nội dung đã đổi, nên MỌI CHỮ KÝ cũ hết hiệu lực và bài về bản nháp ' +
    '(luật L4). Sổ ký giữ nguyên các dòng cũ kèm vân tay cũ — sáu tháng sau ' +
    'vẫn đọc ra được là họ đã ký một bản khác. Đi lại từ cổng 1.';
  return kq;
}

/* ═══════════════ CỔNG 1 — MÁY ═══════════════

   Không có ô "duyệt ngoại lệ" (luật L5). Muốn qua thì sửa bài. */
export async function nopBai(y, env, db, hoSo) {
  const bai = await db.prepare('SELECT * FROM baiNoiDung WHERE id = ?')
    .bind(String(y.id || '')).first();
  if (!bai) return {ok: false, error: 'KHONGCO', vi: 'Không tìm thấy bài này.'};
  if (!duocVao(hoSo))
    return {ok: false, error: 'KHONGQUYEN', vi: 'Cổng nội dung dành cho R05 trở lên.'};
  if (bai.trangThai !== 'nhap')
    return {ok: false, error: 'SAIBAC',
      vi: 'Bài đang ở bậc "' + bai.trangThai + '", không phải bản nháp.'};

  const soat = await soatNoiDung({chu: bai.chu, tang: bai.tang,
    khuon: bai.khuon || 'BAIHOC', doiTuong: bai.doiTuong || 'noiBo'},
    env, db, hoSo);
  if (!soat.ok) return soat;

  /* Máy chặn bằng SỐ. Hai điều kiện, cả hai đếm được:
     thiếu khối bắt buộc, hoặc có câu phán xét. Không chặn bằng điểm
     tổng — máy chỉ chấm được 60/100, và chặn bằng một con số máy không
     chấm đủ là chặn bằng một con số không có nghĩa. */
  const chan = [];
  if (soat.khoi.thieu.length)
    chan.push('thiếu ' + soat.khoi.thieu.length + '/24 khối: ' +
      soat.khoi.thieu.join(', '));
  if (soat.doi.length)
    chan.push(soat.doi.map(p => p.khoi + ' đòi ' + p.can).join(' · '));
  if (soat.loi.length)
    chan.push(soat.loi.length + ' câu phán xét (dòng ' +
      soat.loi.map(l => l.dong).join(', ') + ')');

  const luc = new Date().toISOString();
  const vt = await vanTay(bai.chu);

  await db.prepare(
    'INSERT INTO kyNoiDung (id,baiId,cong,viec,boiAi,vaiLuc,vanTay,ghiChu,kyLuc) ' +
    'VALUES (?,?,?,?,?,?,?,?,?)')
    .bind(maMoi(), bai.id, 'C1', chan.length ? 'tuChoi' : 'ky', 'may', 'may', vt,
      chan.length ? chan.join(' · ') : 'Máy đạt: đủ khối, đủ khối đòi, không câu phán xét.',
      luc).run();

  await db.prepare(
    'UPDATE baiNoiDung SET trangThai = ?, vaoCongLuc = ?, soatMay = ?, lyDo = ? WHERE id = ?')
    .bind(chan.length ? 'nhap' : 'bienTap', chan.length ? null : luc,
      JSON.stringify({diemMay: soat.diemMay, tranMay: soat.tranMay,
        thieuKhoi: soat.khoi.thieu, cam: soat.cam.map(c => c.ma)}),
      chan.length ? chan.join(' · ') : null, bai.id).run();

  await Kho.ghiNhatKy(db, {uid: hoSo.uid, username: hoSo.u,
    viec: 'nopBai', doiTuong: bai.id,
    chiTiet: chan.length ? 'máy chặn: ' + chan.join(' · ') : 'qua cổng 1'});

  if (chan.length)
    return {ok: false, error: 'MAYCHAN', chan, soat,
      vi: 'Cổng 1 chặn. Không có ô duyệt ngoại lệ ở cổng này (luật L5) — ' +
          'bốn người sau không đốt thời gian đọc thứ đếm được là chưa xong. ' +
          'Sửa rồi nộp lại.'};
  return {ok: true, trangThai: 'bienTap', soat,
    vi: 'Qua cổng 1. Còn bốn cổng người, và mỗi cổng một người KHÁC ' +
        'nhau — luật L3.'};
}

/* ═══════════════ BỐN CỔNG NGƯỜI ═══════════════ */
export async function kyBai(y, env, db, hoSo) {
  const bai = await db.prepare('SELECT * FROM baiNoiDung WHERE id = ?')
    .bind(String(y.id || '')).first();
  if (!bai) return {ok: false, error: 'KHONGCO', vi: 'Không tìm thấy bài này.'};

  const cong = bai.trangThai;
  const maCong = CONG_MA[cong];
  if (!maCong || cong === 'may')
    return {ok: false, error: 'SAIBAC',
      vi: 'Bài đang ở bậc "' + cong + '" — không phải một cổng người ký.'};

  const tuChoi = String(y.viec || 'ky') === 'tuChoi';
  const lyDo = String(y.lyDo || '').trim();

  /* ── LUẬT L2 ĐỨNG TRƯỚC MỌI PHÉP KIỂM QUYỀN ──
     Bản đầu tôi đặt phép kiểm quyền lên trước, và bộ thử bắt ngay: một
     người viết chưa có quyền ký thì bị báo "thiếu quyền ký" — nên họ đi
     xin đúng cái quyền KHÔNG giúp được gì, vì xin xong vẫn bị L2 chặn.

     Thứ tự các phép kiểm không phải chuyện sắp xếp cho gọn. Nó quyết
     định người bị chặn đi làm việc gì tiếp theo. */
  if (bai.nguoiViet === hoSo.uid)
    return {ok: false, error: 'TUDUYET',
      vi: 'Luật L2: người viết không ký bài của chính mình. Không phải chuyện ' +
          'tin hay không tin — người viết đọc lại thì thấy thứ mình ĐỊNH ' +
          'viết, không thấy thứ đã viết ra. Xin thêm quyền ký cũng không qua ' +
          'được chỗ này; bài này cần một người khác đọc.'};

  /* ── AI KÝ ĐƯỢC CỔNG NÀY ──
     Cổng 5 chỉ R01. Ba cổng kia cần quyền tương ứng — hoặc R01 đứng
     thay, và trả giá ở luật L3 ngay dưới. */
  const dangGiu = await quyenKy(db, hoSo.u);
  const canQuyen = CONG_QUYEN[cong];
  if (cong === 'chuHe') {
    if (!laChuHe(hoSo))
      return {ok: false, error: 'CANCHUHE',
        vi: 'Cổng 5 chỉ Super Admin ký. Máy soát, chủ hệ quyết.'};
  } else if (dangGiu.indexOf(canQuyen) < 0 && !laChuHe(hoSo)) {
    return {ok: false, error: 'THIEUQUYENKY',
      canQuyen,
      vi: 'Cổng ' + maCong + ' cần quyền ký "' + canQuyen + '". Chưa ai cấp ' +
          'quyền ấy cho tài khoản này. Chỉ R01–R02 cấp được, bằng cửa ' +
          'capQuyenNoiDung.'};
  }

  /* ── LUẬT L3: MỘT NGƯỜI KÝ NHIỀU NHẤT MỘT CỔNG ──
     Đọc thẳng sổ ký, không đọc một ô tóm tắt: ô tóm tắt thì sửa được.
     Chỉ đếm chữ ký còn HIỆU LỰC — cùng vân tay với bài hiện tại. */
  const daKy = await db.prepare(
    'SELECT cong FROM kyNoiDung WHERE baiId = ? AND boiAi = ? AND viec = ? ' +
    'AND vanTay = ?').bind(bai.id, hoSo.uid, 'ky', bai.vanTay).first();
  if (daKy)
    return {ok: false, error: 'DAKYCONGKHAC', daKy: daKy.cong,
      vi: 'Luật L3: tài khoản này đã ký cổng ' + daKy.cong + ' của bài này, nên ' +
          'không ký thêm cổng ' + maCong + '. Không có luật này thì một người ' +
          'ký được cả bốn cổng người, thang năm cổng thành một chữ ký — mà sổ ' +
          'vẫn đủ năm dòng, nên không ai đọc ra. ' +
          (laChuHe(hoSo) ? 'Chủ hệ đứng thay được MỘT cổng, và trả giá đúng ở ' +
            'chỗ này: đã ký một cổng thì cổng 5 phải người khác ký.' : '')};

  /* ── TỪ CHỐI PHẢI NÓI VÌ SAO ── */
  if (tuChoi && lyDo.length < 10)
    return {ok: false, error: 'THIEULYDO',
      vi: 'Từ chối thì phải nói vì sao. Không nói thì người viết sửa mò, và ' +
          'lần sau nộp lên y hệt.'};

  const luc = new Date().toISOString();
  const den = tuChoi ? 'nhap' : (CONG_TIEP[cong] || [])[0];
  if (!den)
    return {ok: false, error: 'SAIBAC', vi: 'Từ bậc này không đi tiếp được.'};

  await db.prepare(
    'INSERT INTO kyNoiDung (id,baiId,cong,viec,boiAi,vaiLuc,vanTay,ghiChu,kyLuc) ' +
    'VALUES (?,?,?,?,?,?,?,?,?)')
    .bind(maMoi(), bai.id, maCong, tuChoi ? 'tuChoi' : 'ky', hoSo.uid,
      hoSo.role, bai.vanTay, lyDo || String(y.ghiChu || 'Đạt.'), luc).run();

  await db.prepare(
    'UPDATE baiNoiDung SET trangThai = ?, vaoCongLuc = ?, lyDo = ? WHERE id = ?')
    .bind(den, tuChoi ? null : luc, tuChoi ? lyDo : null, bai.id).run();

  await Kho.ghiNhatKy(db, {uid: hoSo.uid, username: hoSo.u,
    viec: tuChoi ? 'tuChoiBai' : 'kyBai', doiTuong: bai.id,
    chiTiet: maCong + ' → ' + den});

  return {ok: true, cong: maCong, trangThai: den, vanTay: bai.vanTay,
    vi: den === 'phatHanh'
      ? 'Đã phát hành. Năm cổng, năm chữ ký, năm người khác nhau.'
      : (tuChoi ? 'Đã từ chối, bài về bản nháp.'
                : 'Qua cổng ' + maCong + '. Tiếp: ' + den + '.')};
}

/* ═══════════════ SỔ KÝ CỦA MỘT BÀI ═══════════════

   Trả về đủ sổ, kèm cột `conHieuLuc`: chữ ký nào neo vào vân tay hiện
   tại thì còn, chữ ký nào neo vào một bản cũ thì hết. Không xoá dòng
   nào — dòng hết hiệu lực chính là chỗ kể ra bài đã bị sửa sau khi ký. */
export async function soKyBai(y, env, db, hoSo) {
  if (!duocVao(hoSo))
    return {ok: false, error: 'KHONGQUYEN', vi: 'Cổng nội dung dành cho R05 trở lên.'};
  const bai = await db.prepare('SELECT * FROM baiNoiDung WHERE id = ?')
    .bind(String(y.id || '')).first();
  if (!bai) return {ok: false, error: 'KHONGCO', vi: 'Không tìm thấy bài này.'};

  const r = await db.prepare('SELECT * FROM kyNoiDung WHERE baiId = ? ORDER BY kyLuc')
    .bind(bai.id).all();
  const so = ((r && r.results) || []).map(k => ({
    cong: k.cong, viec: k.viec, boiAi: k.boiAi, vaiLuc: k.vaiLuc,
    ghiChu: k.ghiChu, kyLuc: k.kyLuc,
    conHieuLuc: k.vanTay === bai.vanTay}));

  const hetHieuLuc = so.filter(k => !k.conHieuLuc && k.viec === 'ky').length;
  const kq = {ok: true, id: bai.id, tieuDe: bai.tieuDe, trangThai: bai.trangThai,
    vanTay: bai.vanTay, nguoiViet: bai.nguoiViet, so,
    nguoiDaKy: so.filter(k => k.viec === 'ky' && k.conHieuLuc).map(k => k.boiAi)};
  if (hetHieuLuc) kq.canhBao =
    hetHieuLuc + ' chữ ký đã HẾT HIỆU LỰC vì nội dung đổi sau khi ký (luật L4). ' +
    'Chúng ở lại trong sổ chứ không bị xoá — chính chúng là chỗ kể ra chuyện ấy.';
  return kq;
}

/* ═══════════════ ĐỒNG HỒ TREO ═══════════════

   KHÔNG chặn, chỉ nổi lên. Một cổng quá hạn là việc của người quản lý,
   không phải một lỗi của bài — và chặn một bài vì người duyệt bận là
   phạt nhầm người. */
export async function baiTreo(y, env, db, hoSo) {
  if (!duocVao(hoSo))
    return {ok: false, error: 'KHONGQUYEN', vi: 'Cổng nội dung dành cho R05 trở lên.'};
  const r = await db.prepare(
    "SELECT id,tieuDe,trangThai,vaoCongLuc FROM baiNoiDung " +
    "WHERE vaoCongLuc IS NOT NULL AND trangThai NOT IN ('phatHanh','tuChoi','nhap')")
    .all();
  const nay = Date.now();
  const treo = ((r && r.results) || []).map(b => {
    const gio = (nay - Date.parse(b.vaoCongLuc)) / 3600e3;
    const han = SLA_GIO[b.trangThai] || 0;
    return {id: b.id, tieuDe: b.tieuDe, cong: CONG_MA[b.trangThai],
      choGio: Math.round(gio * 10) / 10, hanGio: han, quaHan: gio > han};
  }).filter(x => x.quaHan).sort((a, b) => b.choGio - a.choGio);
  return {ok: true, soTreo: treo.length, treo,
    vi: treo.length ? 'Quá hạn không chặn bài — nó chỉ nổi lên. Chặn một bài vì ' +
          'người duyệt bận là phạt nhầm người.'
      : 'Không cổng nào quá hạn.'};
}

/* ═══════════════ CẤP QUYỀN KÝ ═══════════════
   Chỉ R01–R02, và không ai tự cấp cho mình — y như quyenTaiChinh. */
export async function capQuyenNoiDung(y, env, db, hoSo) {
  if ((BAC[hoSo.role] || 99) > CAP_QUYEN_KY)
    return {ok: false, error: 'KHONGQUYEN',
      vi: 'Chỉ R01–R02 cấp được quyền ký nội dung.'};

  const ten = String(y.username || '').trim();
  const chuc = String(y.chucNang || '').trim();
  const lyDo = String(y.lyDo || '').trim();
  if (Object.keys(CONG_QUYEN).map(k => CONG_QUYEN[k]).indexOf(chuc) < 0)
    return {ok: false, error: 'SAICHUCNANG',
      vi: 'Quyền ký phải là bienTap · chuyenMon · giuChuan.'};
  if (lyDo.length < 10)
    return {ok: false, error: 'THIEULYDO',
      vi: 'Cấp quyền phải nói vì sao. Một quyền không lý do thì sáu tháng sau ' +
          'không ai dám thu hồi, vì không ai biết vì sao nó có ở đó.'};

  /* SO ĐỊNH DANH CHÍNH TẮC (9.99.113) — bản cũ so `ten === hoSo.u` thô:
     khai bằng EMAIL thì email≠username lọt tự cấp (đúng lỗ 9.99.112 ở
     capLenhGiamSat/capQuyenTaiChinh). Nay tra tài khoản: nếu tra được thì
     so bằng uid VÀ lưu username chuẩn (khoá tra khớp lúc ký); nếu chưa tra
     được (tài khoản chưa dựng) thì vẫn chặn tự cấp bằng so chuỗi và lưu
     tên thô — không CHẶN việc cấp, chỉ kém khoá canonical. Lỗ H-4 đợt 3. */
  const nd = await Kho.nguoiTheoTen(db, ten);
  const dinhDanh = nd ? nd.username : ten;
  const laTuCap = nd
    ? String(nd.id) === String(hoSo.uid || '')
    : ten.toLowerCase() === String(hoSo.u || '').toLowerCase();
  if (laTuCap)
    return {ok: false, error: 'TUCAP',
      vi: 'Không ai tự cấp quyền ký cho mình (kể cả khai bằng email). ' +
          'Cùng luật với quyenTaiChinh.'};

  const co = await db.prepare(
    'SELECT id FROM quyenNoiDung WHERE lower(username) = lower(?) AND chucNang = ? AND thuHoiLuc IS NULL')
    .bind(dinhDanh, chuc).first();
  if (co) return {ok: false, error: 'DACAP', vi: 'Tài khoản này đã có quyền ấy.'};

  await db.prepare(
    'INSERT INTO quyenNoiDung (id,username,chucNang,lyDo,boiAi,capLuc) VALUES (?,?,?,?,?,?)')
    .bind(maMoi(), dinhDanh, chuc, lyDo, hoSo.u, new Date().toISOString()).run();
  await Kho.ghiNhatKy(db, {uid: hoSo.uid, username: hoSo.u,
    viec: 'capQuyenNoiDung', doiTuong: dinhDanh, chiTiet: chuc + ' · ' + lyDo});
  return {ok: true, username: dinhDanh, chucNang: chuc};
}

export async function thuHoiQuyenNoiDung(y, env, db, hoSo) {
  if ((BAC[hoSo.role] || 99) > CAP_QUYEN_KY)
    return {ok: false, error: 'KHONGQUYEN', vi: 'Chỉ R01–R02 thu hồi được.'};
  const r = await db.prepare(
    'UPDATE quyenNoiDung SET thuHoiLuc = ?, thuHoiBoi = ? ' +
    'WHERE lower(username) = lower(?) AND chucNang = ? AND thuHoiLuc IS NULL')
    .bind(new Date().toISOString(), hoSo.u,
      String(y.username || ''), String(y.chucNang || '')).run();
  const n = (r && r.meta && r.meta.changes) || 0;
  if (!n) return {ok: false, error: 'KHONGCO', vi: 'Không có quyền nào đang hiệu lực để thu.'};
  await Kho.ghiNhatKy(db, {uid: hoSo.uid, username: hoSo.u,
    viec: 'thuHoiQuyenNoiDung', doiTuong: String(y.username || ''),
    chiTiet: String(y.chucNang || '')});
  return {ok: true};
}

export async function dsQuyenNoiDung(y, env, db, hoSo) {
  if (!duocVao(hoSo))
    return {ok: false, error: 'KHONGQUYEN', vi: 'Cổng nội dung dành cho R05 trở lên.'};
  const r = await db.prepare(
    'SELECT username,chucNang,lyDo,boiAi,capLuc FROM quyenNoiDung ' +
    'WHERE thuHoiLuc IS NULL ORDER BY capLuc DESC').all();
  const ds = (r && r.results) || [];
  /* Cổng nào chưa có ai giữ quyền — bài sẽ đứng ở đó, và máy phải nói
     ra là đứng vì THIẾU NGƯỜI chứ không phải vì bài sai. */
  const thieu = Object.keys(CONG_QUYEN).map(c => CONG_QUYEN[c])
    .filter(q => !ds.some(x => x.chucNang === q));
  const kq = {ok: true, ds};
  if (thieu.length) kq.congThieuNguoi = thieu;
  return kq;
}

export const BAN_CHEP_THANG = {CONG_TIEP, CONG_MA, CONG_QUYEN, SLA_GIO};
