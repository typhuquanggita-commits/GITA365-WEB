/* ═══════════════════════════════════════════════════════════════
   GITA 365 · CỬA VÀO MỚI — KIẾN TRÚC SƯ THỊ GIÁC

   Chốt của chủ hệ thống bản 9.99.10:
   "Hiểu hệ thống trước — hiểu nội dung — hiểu người dùng — rồi mới
    thiết kế."

   ══ CÁI NÀY KHÔNG PHẢI MỘT BỘ TẠO ẢNH ══

   Nó là một CỔNG. Việc của nó là chặn một tấm hình sai Tầng lại TRƯỚC
   khi có ai bỏ công vẽ nó, và bắt mỗi tấm đi qua đủ sáu bậc: nháp → đề
   xuất → mô phỏng → duyệt → bản cuối → phát hành.

   Vì sao cổng đáng giá hơn bộ vẽ: một tấm hình đẹp mà sai Tầng thì tệ
   hơn một tấm xấu mà đúng — tấm đẹp được tin, và cái sai đi theo nó xa
   hơn. Bộ vẽ làm ra tấm đẹp. Cổng là thứ giữ cho nó đúng.

   ══ RANH GIỚI TẦNG ĐỌC TỪ BẢNG GIÁ, KHÔNG KHAI LẠI ══

   G.HP_TANG[].gom và .khong là ranh giới đã được duyệt và đang dùng để
   bán hàng. Khai một bản thứ hai ở đây là dựng hai sự thật, và bản thứ
   hai không ai sửa khi bảng giá đổi.

   Máy chủ không đọc được kho đã mã hoá, nên nó giữ đúng cái TỐI THIỂU
   để chặn: mã Tầng, thứ tự Tầng, và danh sách khái niệm cấm theo Tầng —
   và mục 71 của bộ kiểm đối chiếu danh sách ấy với HP_TANG[].khong mỗi
   lần chạy. Lệch là đỏ.

   ══ MÁY ĐỀ XUẤT. CHỦ HỆ QUYẾT. ══

   Không có đường nào đi tắt qua một bậc duyệt. Và không bậc nào ghi đè
   bậc trước: sửa một bản đã duyệt là ghi một BẢN MỚI trỏ về bản cũ.
   Một tấm đã phát hành thì đã ở trong tay khách; ghi đè bản trong kho
   là làm kho nói khác thứ khách đang cầm.
   ═══════════════════════════════════════════════════════════════ */

import * as BoNao from './bo-nao.js';
import * as LuatGD from './luat-giao-dien.js';
import { Kho, tokenMoi } from './nen.js';

const BAC = {R01:1,R02:2,R03:3,R04:4,R05:5,R06:6,R07:7,R08:8,
             R09:9,R10:10,R11:11,R12:12,R13:13,R14:14,R15:15};

/* ══ BẢN CHÉP TỐI THIỂU CỦA RANH GIỚI TẦNG ══

   Mỗi Tầng: những KHÁI NIỆM tầng ấy chưa có. Rút từ HP_TANG[].khong.
   Đây là bản chép, và nó được đối chiếu — xem chú giải ở đầu tệp. */
/* MỌI KHOÁ Ở ĐÂY PHẢI TÌM THẤY ĐƯỢC TRONG HP_TANG[].khong CỦA CHÍNH
   TẦNG ẤY. Bản đầu tôi tự nghĩ ra mười khoá cho T2, T3, T4 — "365
   ngày", "dashboard", "cả năm", "coach cho cả gia đình" — nghe rất hợp
   lý và không có khoá nào trong số đó được ai duyệt.

   Đó đúng là thứ luật "không tự suy diễn" sinh ra để cấm, và mục 75 của
   bộ kiểm bắt được ngay lần chạy đầu. Nếu không có phép đo ấy thì cổng
   Tầng đã chặn thiết kế theo một ranh giới do tôi bịa, im lặng, và
   người bị chặn sẽ đi tìm trong bảng chặng xem mình sai ở đâu — mà
   không có gì ở đó cả. */
const CAM_THEO_TANG = {
  T1: ['coach đồng hành', 'kho nghề', 'phác đồ', 'kịch bản', 'ma trận',
       'dạy môn', 'tiết học'],
  T2: ['định hướng nghề', 'dự án', 'buổi làm việc riêng'],
  T3: ['lộ trình gia đình', 'huấn luyện riêng'],
  T4: ['vai dẫn dắt'],
  T5: ['đứng lớp thay']
};
const THU_TU_TANG = ['T1', 'T2', 'T3', 'T4', 'T5'];

const LOAI_HINH = ['BANDO_HANHTRINH', 'KHUNG', 'BANG_DIEU_KHIEN', 'DANH_SACH_VIEC',
  'TRUOC_SAU', 'NHIP', 'CONG', 'SO_SANH_TANG', 'VAI_TRO', 'MOT_SO', 'QUY_TRINH', 'BIA',
  'AP_PHICH', 'CHAN_DUNG'];

/* Hai loại hình CẦN NGƯỜI. Chúng là ảnh ghép hai lớp: lớp người do bộ
   tạo ảnh ngoài sinh, lớp chữ do bộ vẽ trong máy đặt lên (luật C14).
   Khai ở đây để cổng biết phải đòi một lượt đi ra, và để bộ kiểm biết
   đúng chỗ nào được phép có <image>. */
const CAN_NGUOI = ['AP_PHICH', 'CHAN_DUNG'];
/* DOITAC thêm ở 9.99.112: bảng QUYET (POSTER_THUONG_HIEU) và ngân hàng
   ẩn dụ AN_DU đã có dòng cho DOITAC, nhưng roster người xem lại thiếu nó
   → ý định POSTER_THUONG_HIEU (1 trong 7 ý định lõi) KHÔNG chọn được cho
   bất kỳ người xem nào, ngăn Ý tưởng trả "chưa có đề nghị" như thể chưa
   làm xong. Quyết định nội dung (poster hướng đối tác) đã có sẵn trong
   kho; roster chỉ quên khai. Tổ thanh tra sản phẩm. */
const NGUOI_XEM = ['PHUHUYNH', 'HOCVIEN', 'GIADINH', 'COACH', 'CHUHE', 'DOITAC'];

/* Sáu bậc, và bậc nào đi tiếp được sang bậc nào. */
const BAC_TIEP = {
  nhap: ['deXuat'], deXuat: ['mophong', 'tuChoi'], mophong: ['duyet', 'tuChoi'],
  duyet: ['hoanThien'], hoanThien: ['phatHanh'], phatHanh: [], tuChoi: []
};

const TRONG_DIEM = {D1: 25, D2: 20, D3: 15, D4: 15, D5: 10, D6: 10, D7: 5};
const BAC_DIEM = [{tu: 95, ten: 'Xuất sắc'}, {tu: 90, ten: 'Đạt'},
                  {tu: 80, ten: 'Sửa lại'}, {tu: 0, ten: 'Không đạt'}];

const boDau = s => String(s || '').toLowerCase()
  .normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd');

/** Ai được dùng cổng này. Thiết kế là việc của người làm nghề và quản
    lý, không phải của khách. */
function duocVao(hoSo) { return (BAC[hoSo.role] || 99) <= 5; }
function laChuHe(hoSo) { return hoSo.role === 'R01'; }

/* ═══════════════ TIER GUARDIAN ═══════════════

   Việc DUY NHẤT của nó: nội dung này có nói tới một khái niệm mà Tầng
   ấy chưa có không.

   Nó không đoán Tầng hộ người đăng. Đoán Tầng là chỗ dễ sai nhất và
   sai im lặng nhất — một nội dung nói "90 ngày" có thể là T3, mà cũng
   có thể là một trang so sánh các chặng. Người đăng khai Tầng, máy
   kiểm khai ấy có mâu thuẫn với chính nội dung không. */
/* Đã có tên trong danh sách xuất ở cuối tệp — cổng NỘI DUNG dùng
   chung hàm này chứ không chép. Chép thì CAM_THEO_TANG có hai bản,
   và mục 75 của bộ kiểm chỉ đối chiếu một bản; bản kia lệch đi mà
   không đỏ. */
function soatTang(tang, chu) {
  if (THU_TU_TANG.indexOf(tang) < 0)
    return {qua: false, ma: 'TANGLA', vi: 'Tầng phải là một trong ' +
      THU_TU_TANG.join(', ') + '.'};

  const t = boDau(chu);
  const pham = (CAM_THEO_TANG[tang] || []).filter(k => t.indexOf(boDau(k)) >= 0);
  if (pham.length)
    return {qua: false, ma: 'VUOTTANG', phamPhai: pham,
      vi: 'Nội dung khai là ' + tang + ' nhưng nhắc tới ' +
        pham.map(x => '"' + x + '"').join(', ') + ' — những thứ chặng này ' +
        'KHÔNG có. Một tấm hình đưa tính năng tầng cao xuống tầng thấp là ' +
        'một lời hứa hệ thống không giữ được, và nhà đọc nó sẽ thấy mình bị ' +
        'hụt đúng ở chỗ họ đã tin.'};

  return {qua: true, tang, vi: 'Không nhắc tới khái niệm nào ngoài phạm vi ' + tang + '.'};
}

/* ═══════════════ ĐỌC NỘI DUNG — TRONG MÁY ═══════════════

   Bản đề xuất kiến trúc mới có một module đúng và đáng lấy: đọc nội
   dung TRƯỚC, rút ra các ý bắt buộc, rồi mới quyết định vẽ kiểu gì.
   Trước bản này, người đăng phải TỰ chọn loại hình trong mười bốn cái
   — chỗ nghẽn lớn nhất của cả cổng, và cũng là chỗ chọn sai nhiều nhất.

   ══ NHƯNG NÓ PHẢI CHẠY TRONG MÁY, KHÔNG GỬI RA NGOÀI ══

   Bản đề xuất ấy gửi thẳng nội dung sách cho một mô hình bên ngoài để
   phân tích. Đó là chỗ nó đụng luật C11 — "không đưa NỘI DUNG kho ra
   ngoài, chỉ đưa ĐỀ BÀI" — và đụng ở mức nặng nhất: không phải một
   tấm hình, mà CẢ CHƯƠNG SÁCH đi ra mỗi lượt chạy.

   Việc này không cần một mô hình nào. Cấu trúc lô-gích của một đoạn
   văn nằm ngay trong dấu hiệu bề mặt của nó: đánh số thì là các BƯỚC,
   có "trước" và "sau" thì là SO SÁNH, có "mỗi tuần" thì là NHỊP. Đọc
   dấu hiệu thì đo được, lặp lại được, và không rời khỏi Học viện.

   Máy ĐỀ NGHỊ, người chọn. Không tự áp — vì một đoạn nói "90 ngày" có
   thể là lộ trình mà cũng có thể là bảng so sánh, và máy không biết
   người viết định nói cái nào. */

/* Rút các Ý BẮT BUỘC: mỗi ý một dòng hoặc một câu mang một mệnh đề
   riêng. Đây là danh sách sau này dùng để ĐO tấm vẽ ra có nói đủ
   không — nên nó phải rút một lần rồi GIỮ, không tính lại mỗi lượt:
   sửa cách rút thì mọi tấm cũ đổi nghĩa mà không ai biết. */
export function rutYBatBuoc(chu) {
  const dong = String(chu || '').split('\n')
    .map(d => d.replace(/^\s*[·•\-–—*\d.)\]]+\s*/, '').trim())
    .filter(d => d.length >= 12 && !/^[A-ZÀ-Ỹ\s]{2,20}:/.test(d));
  /* Dòng dài thì tách tiếp theo câu — một dòng ba câu là ba ý, và
     gộp ba ý thành một thì phép đo sau này không chỉ ra được thiếu
     ý nào. */
  const y = [];
  dong.forEach(d => {
    (d.length > 120 ? d.split(/(?<=[.;])\s+/) : [d]).forEach(c => {
      const t = c.trim();
      if (t.length >= 12) y.push(t.slice(0, 160));
    });
  });
  return y.slice(0, 12);
}

/* Dấu hiệu bề mặt → loại hình. Mỗi dòng: [loại hình, biểu thức dò,
   điểm, vì sao]. Điểm cộng dồn; loại nào cao nhất thì đề nghị trước.
   `vi` đi kèm để người đọc BIẾT máy đề nghị theo dấu hiệu nào — một
   đề nghị không nói lý do thì người ta hoặc tin mù hoặc bỏ qua. */
const DAU_CAU_TRUC = [
  ['QUY_TRINH',       /(bước\s*\d|→|thứ tự|lần lượt|sau đó|tiếp theo)/gi, 3,
   'có các BƯỚC nối tiếp'],
  ['TRUOC_SAU',       /(trước[^.]{0,40}sau|khác gì|đổi từ)/gi, 3,
   'có cặp TRƯỚC và SAU'],
  ['NHIP',            /(mỗi (tuần|ngày|tháng)|chu kỳ|vòng|hằng ngày|lặp lại)/gi, 3,
   'có NHỊP lặp lại'],
  ['CONG',            /(điều kiện|nghiệm thu|qua chặng|đạt (thì|mới)|cổng)/gi, 3,
   'nói ĐIỀU KIỆN để đi tiếp'],
  ['SO_SANH_TANG',    /(chặng \d|tầng \d|gói|so với|khác nhau)/gi, 2,
   'so sánh nhiều CHẶNG'],
  ['VAI_TRO',         /(ai làm|vai trò|phần việc của|phụ huynh.*coach|coach.*phụ huynh)/gi, 3,
   'chia PHẦN VIỆC theo người'],
  ['BANG_DIEU_KHIEN', /(\d+\s*%|điểm số|theo dõi|chỉ số|đo bằng)/gi, 2,
   'có SỐ để theo dõi'],
  ['DANH_SACH_VIEC',  /(làm ngay|hôm nay|việc cần|danh sách|đánh dấu)/gi, 2,
   'là DANH SÁCH việc'],
  ['BANDO_HANHTRINH', /(hành trình|lộ trình|đường dài|chặng đường|mốc)/gi, 3,
   'là một ĐƯỜNG DÀI có mốc'],
  ['KHUNG',           /(gồm|bao gồm|các phần|cấu trúc|khung)/gi, 2,
   'liệt kê các PHẦN của một khung'],
  ['AP_PHICH',        /(chào|giới thiệu|đồng hành cùng|bắt đầu cùng)/gi, 2,
   'là lời MỜI, cần có người']
];

export function deNghiLoaiHinh(chu) {
  const t = String(chu || '');
  const diem = {}, viDo = {};
  DAU_CAU_TRUC.forEach(([ma, re, n, vi]) => {
    const m = t.match(re);
    if (m && m.length) {
      diem[ma] = (diem[ma] || 0) + n * Math.min(m.length, 3);
      viDo[ma] = vi + ' (' + m.length + ' dấu hiệu)';
    }
  });
  /* MỘT CON SỐ: chỉ đề nghị khi nội dung NGẮN và có đúng một con số
     nổi. Đoạn dài đầy số thì đó là bảng, không phải một con số. */
  const so = t.match(/\b\d[\d.,]*\b/g) || [];
  if (t.length < 260 && so.length === 1) {
    diem.MOT_SO = 6; viDo.MOT_SO = 'ngắn và có ĐÚNG MỘT con số';
  }
  if (t.length < 180) { diem.BIA = (diem.BIA || 0) + 4; viDo.BIA = 'rất ngắn — một câu'; }

  const xep = Object.keys(diem).sort((a, b) => diem[b] - diem[a])
    .slice(0, 3).map(ma => ({loaiHinh: ma, diem: diem[ma], vi: viDo[ma]}));
  return xep;
}

/* ═══════════════ CỔNG ĐIỀU NHỎ ═══════════════

   Ba câu, và câu thứ hai là câu cổng cũ không hỏi.

   Cổng cũ hỏi "tấm này cho ai xem" và "tấm này làm MỘT nhiệm vụ gì".
   Cả hai là câu hỏi về TẤM HÌNH. Thiếu hẳn câu hỏi về NGƯỜI: xem xong
   thì họ làm được điều nhỏ gì.

   Một tấm đẹp, đúng thương hiệu, nói đủ ý, mà người xem đóng lại rồi
   không làm gì — vẫn hỏng. Và hỏng ở chỗ không phép chấm nào nhìn tới,
   vì mọi phép chấm đều chấm tấm hình.

   ══ VÌ SAO CHẶN ĐỘNG TỪ "HIỂU" ══

   Bản đặc tả của chủ hệ nhận điều nhỏ bằng một bảng động từ có "hiểu",
   "nhớ", "tin". Ba từ ấy không quan sát được, và chính kho này đã có
   luật ngược lại: chuẩn nghề CN1 ghi "mục tiêu phải viết bằng ĐỘNG TỪ
   QUAN SÁT ĐƯỢC, không viết bằng 'hiểu' — vì không ai đo được một cái
   hiểu".

   Nhận "hiểu" ở cổng hình ảnh mà cấm "hiểu" ở cổng nội dung là hai cửa
   của cùng một Học viện nói hai điều khác nhau. Nên ở đây chặn, và nói
   thẳng là không theo bản đặc tả.

   Bản chép của G.TG_DIEUNHO; bộ kiểm đối chiếu hai bản. */
export const DN_CAM = ['hiểu', 'nhớ', 'tin', 'nắm được', 'thấy được', 'nhận ra',
                'cảm nhận', 'biết được', 'ý thức'];

const DN_HOI = {
  DN1: 'Ảnh này dành cho ai xem ạ? — ví dụ: phụ huynh có con thi cuối kỳ, ' +
       'hay đội ngũ Tư vấn mới vào.',
  DN2: 'Sau khi xem ảnh, anh chị mong người xem LÀM ĐƯỢC điều nhỏ gì ạ? ' +
       '— một câu thôi.',
  DN3: 'Họ thường gặp ảnh này vào lúc nào trong đời ạ? — ví dụ: tối sau giờ ' +
       'học, mùa khai giảng, lúc vừa cãi nhau với con.'
};

/* ── BẪY THỨ BA CỦA PHÉP DÒ CHỮ TIẾNG VIỆT ──

   Hai bẫy đầu kho này đã gặp: \b không khớp chữ có dấu vì "à" nằm
   ngoài lớp \w của JavaScript; và dò chuỗi con thì "hư" khớp trong
   "chưa", "chuẩn", "thứ".

   Bẫy thứ ba tìm ra ở bản 9.99.54, và nó NGƯỢC với bẫy thứ hai: dò
   theo biên từ bằng khoảng trắng cũng sai, vì TIẾNG VIỆT KHÔNG PHÂN
   TỪ BẰNG KHOẢNG TRẮNG. Khoảng trắng ngăn ÂM TIẾT, không ngăn TỪ.

   Nên "tin" đứng riêng một âm tiết trong "thông tin", "tin nhắn",
   "tin cậy" — và phép dò biên từ bắt cả ba. Bộ thử bắt ngay: câu
   "gửi thông tin liên hệ cho Tư vấn" bị chặn vì có chữ "tin", trong
   khi "gửi" là một việc nhìn thấy được rõ ràng.

   Không có cách nào đúng hoàn toàn mà không cần một bộ tách từ. Cách
   dùng ở đây: dò biên âm tiết, rồi TRỪ những cụm ghép đã biết. Danh
   sách trừ ngắn và chỉ dài thêm khi bắt oan THẬT — thêm cho đủ là mở
   đường cho chữ lọt.

   Bản chép của G.TG_DIEUNHO; bộ kiểm đối chiếu hai bản. */
export const DN_TRU = ['thông tin', 'tin nhắn', 'tin cậy', 'tin học', 'bản tin',
                'tin tức', 'ghi nhớ', 'lưu ý'];

/* Một phép dò dùng chung, nhận DANH SÁCH TRỪ riêng của từng chỗ gọi.
   Viết hai bản thì hai bản rồi sẽ dò theo hai luật khác nhau, và chỗ
   lệch không báo gì cả — nó chỉ bắt oan ở một cổng mà không bắt ở cổng
   kia. Mỗi cổng có danh sách trừ RIÊNG vì cụm ghép hay bắt oan ở cổng
   này lại là dấu hiệu thật ở cổng kia: "dấu thương hiệu" phải trừ khi
   dò lỗi chính tả, nhưng nó chính là chuyện cần nói ở cổng nhận diện. */
function coTu(chu, cum, tru) {
  let t = ' ' + String(chu || '').toLowerCase().replace(/\s+/g, ' ') + ' ';
  /* Xoá cụm ghép TRƯỚC khi dò, để âm tiết nằm trong chúng thôi đứng riêng. */
  (tru || []).forEach(x => { t = t.split(x).join(' '); });
  /* BIÊN UNICODE thay cho ' cum '/' cum,'/' cum.' — bản cũ chỉ nhận ba
     dấu ngăn (cách·phẩy·chấm), nên một câu mệnh lệnh kết bằng "!"·"?"·
     ")"·đóng-ngoặc-kép LỌT qua cổng ADN: "Bỏ logo!" không bị chặn và bản
     mới xé bảng nhận diện vẫn sinh ra, im lặng ok:true. Đây đúng bẫy biên
     mà module anh em kien-truc-noi-dung.js đã tránh bằng reTu. Lỗ 9.99.112
     (tổ thanh tra sản phẩm). Dùng đúng biên ấy: trước/sau cụm không phải
     chữ/số thì khớp — dấu câu, ngoặc, cuối chuỗi đều là biên. */
  const goc = String(cum).replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+');
  return new RegExp('(?<![\\p{L}\\p{N}])' + goc + '(?![\\p{L}\\p{N}])', 'u').test(t);
}

function coCum(chu, cum) { return coTu(chu, cum, DN_TRU); }

export function soatDieuNho(d) {
  const dd = d || {};
  const nx = Array.isArray(dd.nguoiXem) ? dd.nguoiXem : [];
  const dieuNho = String(dd.dieuNho || '').trim();
  const thoiDiem = String(dd.thoiDiem || '').trim();

  const thieu = [];
  if (!nx.length) thieu.push('DN1');
  /* Mười ký tự: đủ cho "ghi một dòng" và không đủ cho "ok". */
  if (dieuNho.length < 10) thieu.push('DN2');
  if (thoiDiem.length < 6) thieu.push('DN3');

  /* Động từ trong đầu — chặn RIÊNG, không gộp vào "thiếu", vì người
     viết ĐÃ trả lời câu hỏi; họ chỉ trả lời bằng một thứ không đo được.
     Gộp hai chuyện làm một thì câu báo nói "thiếu điều nhỏ" trong khi
     họ vừa viết ra một câu — và họ sẽ viết lại y hệt. */
  const camThay = DN_CAM.filter(c => coCum(dieuNho, c));

  return {
    du: thieu.length === 0 && camThay.length === 0,
    thieu, camThay,
    hoi: thieu.map(m => DN_HOI[m]),
    /* Khuôn bốn câu: lắng → nói điều đã hiểu → hỏi rõ → nói bước tiếp. */
    khuon4: thieu.length || camThay.length ? {
      lang: 'Em đọc rồi ạ.',
      daHieu: nx.length
        ? 'Em nắm được tấm này cho ' + nx.join(', ') + ' xem.'
        : 'Em nắm được phần nội dung anh chị mô tả.',
      hoiRo: thieu.map(m => DN_HOI[m]).concat(
        camThay.length
          ? ['Câu điều nhỏ đang dùng chữ "' + camThay.join('", "') + '" — ' +
             'mấy chữ ấy nói về chuyện xảy ra trong đầu người xem, đứng ngoài ' +
             'không ai đo được. Anh chị đổi sang một việc NHÌN THẤY được giúp ' +
             'em ạ: ví dụ "tối nay ghi một dòng vào sổ", "bấm mở chặng 1", ' +
             '"nhắn cho Tư vấn một câu hỏi".']
          : []),
      buocTiep: 'Anh chị cho em mấy dòng ấy là em dựng đề bài và đưa lên bậc duyệt ngay ạ.'
    } : null
  };
}

/* ═══════════════ BẢY Ý ĐỊNH ═══════════════

   Ý ĐỊNH khác LOẠI HÌNH. Loại hình nói tấm ấy DỰNG thế nào; ý định nói
   tấm ấy SINH RA ĐỂ LÀM GÌ. Cùng một loại hình hai cột có thể mang ý
   định so sánh hoặc ý định kể chuyện, và hai cái ấy cần hai giọng khác
   hẳn nhau.

   Bản chép của G.TG_YDINH — máy chủ không đọc được kho đã mã hoá. Bộ
   kiểm đối chiếu hai bản từng ô. */
export const Y_DINH = [
  ['THU_MUA', ['chúc', 'chúc mừng', 'năm mới', 'tết', 'giáng sinh', 'khai giảng',
               'lễ', '20/11', '8/3']],
  ['THE_KIEN_THUC', ['kiến thức', 'cách', 'hướng dẫn', '3 điều', '5 điều', 'mẹo',
                     'checklist']],
  ['SO_SANH_2COT', ['so sánh', 'khác nhau', 'thay vì', 'trước và sau', 'còn nếu']],
  ['CHUYEN_THAT', ['câu chuyện', 'chia sẻ từ', 'lời kể', 'nhà mình đã']],
  ['POSTER_THUONG_HIEU', ['poster', 'tầm nhìn', 'slogan', 'triết lý', 'giá trị cốt lõi']],
  ['BANNER_DIEU_NHO', ['banner', 'băng', 'đăng ký', 'liên hệ', 'mời', 'bắt đầu']],
  ['SO_DO_DICH_VU', ['dịch vụ', 'gói', 'quy trình', 'các bước', 'sơ đồ']]
];

/* Đọc ý định theo dấu hiệu bề mặt, cùng cách deNghiLoaiHinh đã làm.
   Trả về CẢ BẢNG ĐIỂM chứ không trả một cái tên: một câu có thể mang
   hai ý định gần bằng nhau, và giấu chuyện ấy đi là đưa ra một đề nghị
   chắc chắn hơn sự thật. */
export function docYDinh(chu) {
  const t = ' ' + String(chu || '').toLowerCase().replace(/\s+/g, ' ') + ' ';
  const diem = [];
  Y_DINH.forEach(([ma, dau]) => {
    let n = 0, thay = [];
    dau.forEach(d => {
      if (t.indexOf(' ' + d + ' ') >= 0 || t.indexOf(' ' + d + ',') >= 0 ||
          t.indexOf(' ' + d + '.') >= 0) { n++; thay.push(d); }
    });
    if (n) diem.push({ yDinh: ma, diem: n, thay });
  });
  diem.sort((a, b) => b.diem - a.diem);
  /* Không có dấu hiệu nào thì NÓI LÀ KHÔNG BIẾT. Rơi về một ý định mặc
     định là đoán, và một cái đoán trình ra như một đề nghị thì người ta
     tin nó đã được cân nhắc. */
  if (!diem.length) return { yDinh: null, xep: [],
    vi: 'Không thấy dấu hiệu của ý định nào. Máy không đoán — người chọn.' };
  /* Hai ý định bằng điểm nhau thì cũng nói ra. */
  const nganh = diem.filter(x => x.diem === diem[0].diem);
  return { yDinh: diem[0].yDinh, xep: diem.slice(0, 3),
    ngang: nganh.length > 1 ? nganh.map(x => x.yDinh) : undefined,
    vi: 'Theo dấu hiệu: ' + diem[0].thay.join(', ') + '.' };
}

/* ═══════════════ BẢNG QUYẾT ĐỊNH KHỔ VÀ SẮC KHÍ ═══════════════
   Bản chép của G.TG_QUYET. Cặp nào không có trong bảng thì máy NÓI
   THẲNG là chưa có đề nghị — đoán bừa một khổ rồi trình ra như một đề
   nghị là tệ hơn im lặng. */
export const QUYET = [
  ['THU_MUA', 'PHUHUYNH', 'DOC', 'DONG_CAM'],
  ['THE_KIEN_THUC', 'PHUHUYNH', 'DOC', 'TIN_CAY'],
  ['THE_KIEN_THUC', 'HOCVIEN', 'DUNG', 'HUONG_SANG'],
  ['SO_SANH_2COT', 'PHUHUYNH', 'DOC', 'DONG_CAM'],
  ['CHUYEN_THAT', 'PHUHUYNH', 'DOC', 'DONG_CAM'],
  ['POSTER_THUONG_HIEU', 'DOITAC', 'NGANG', 'TIN_CAY'],
  ['BANNER_DIEU_NHO', 'PHUHUYNH', 'NGANG', 'HUONG_SANG'],
  ['SO_DO_DICH_VU', 'PHUHUYNH', 'DOC', 'TIN_CAY']
];

export function quyetKhung(yDinh, nguoiXem) {
  const nx = Array.isArray(nguoiXem) ? nguoiXem : [nguoiXem];
  const hop = QUYET.filter(q => q[0] === yDinh && nx.indexOf(q[1]) >= 0);
  if (!hop.length) return { co: false,
    vi: 'Chưa có đề nghị cho cặp này trong bảng quyết định. Người chọn khổ và ' +
        'sắc khí. Máy không đoán: một cái đoán trình ra như một đề nghị thì ' +
        'người ta tin nó đã được cân nhắc.' };
  /* Nhiều người xem mà bảng cho ra hai khổ khác nhau: KHÔNG chọn giùm.
     Hai nhóm người cần hai khổ khác nhau nghĩa là cần HAI TẤM. */
  const kho = Array.from(new Set(hop.map(q => q[2])));
  if (kho.length > 1) return { co: false, lechKho: kho,
    vi: 'Bảng cho ra ' + kho.join(' và ') + ' cho các nhóm người xem đang chọn. ' +
        'Hai nhóm cần hai khổ khác nhau nghĩa là cần HAI TẤM, không phải một ' +
        'tấm chọn đại một khổ.' };
  return { co: true, kho: kho[0],
    sacKhi: Array.from(new Set(hop.map(q => q[3]))).join(' · ') };
}

/* ═══════════════ TRẦN CHỮ TRÊN ẢNH ═══════════════
   Bản chép của G.TG_CHU_TRAN. Vì sao là TRẦN chứ không phải gợi ý: chữ
   tràn khung thì bộ vẽ tự thu nhỏ cỡ chữ, và cỡ nhỏ đi thì tấm ấy phạm
   luật C22 — chữ nhỏ nhất phải đạt 2,1mm khi in. Một trần ở đây chặn
   được một lỗi chỉ lộ ra ở tận khâu in. */
export const CHU_TRAN = { tieuDe: 40, than: 80, gach: 60, gachToiDa: 6, moi: 25 };

export function soatChuTran(chu) {
  const c = chu || {};
  const qua = [];
  const do1 = (o, v, tran) => {
    const t = String(v || '').trim();
    if (t.length > tran) qua.push({ o, dai: t.length, tran });
  };
  do1('tieuDe', c.tieuDe, CHU_TRAN.tieuDe);
  do1('than', c.than, CHU_TRAN.than);
  do1('moi', c.moi, CHU_TRAN.moi);
  const g = Array.isArray(c.gach) ? c.gach : [];
  if (g.length > CHU_TRAN.gachToiDa)
    qua.push({ o: 'gach', dai: g.length, tran: CHU_TRAN.gachToiDa, laSoDong: true });
  g.forEach((x, i) => do1('gach[' + (i + 1) + ']', x, CHU_TRAN.gach));
  return { dat: qua.length === 0, qua };
}

/* ═══════════════ BA GÓC NHÌN — PHÁC BA Ý ═══════════════

   Máy KHÔNG vẽ và KHÔNG nghĩ hộ ý tưởng. Nó dựng ba KHUNG Ý theo ba
   góc nhìn đã khai trước, rồi người viết điền phần sáng tạo vào.

   Vì sao ba góc cố định: ba ý sinh tự do thường ra ba biến thể của
   cùng một ý, và người chọn tưởng mình đang chọn giữa ba đường trong
   khi chỉ có một. Ba góc khai trước ép ba ý khác nhau ở GỐC.

   Bản chép rút gọn của G.TG_ANDU — máy chủ chỉ cần đủ để CHỌN, phần
   mô tả dài để ở kho cho người đọc. */
export const AN_DU = [
  ['HAI_CUA_HANG', ['PHUHUYNH', 'DOITAC'], ['SO_SANH_2COT', 'THE_KIEN_THUC']],
  ['DEN_BAN_HOC', ['PHUHUYNH', 'HOCVIEN'], ['CHUYEN_THAT', 'THE_KIEN_THUC']],
  ['DUONG_VE_NHA', ['PHUHUYNH', 'HOCVIEN'], ['THU_MUA', 'POSTER_THUONG_HIEU']],
  ['TRAO_DIEU_NHO', ['PHUHUYNH', 'DOITAC'], ['BANNER_DIEU_NHO', 'SO_DO_DICH_VU']],
  ['SANG_MO_CUA', ['PHUHUYNH', 'HOCVIEN', 'DOITAC'], ['THU_MUA', 'POSTER_THUONG_HIEU']]
];

export function phacBaY(yDinh, nguoiXem) {
  const nx = Array.isArray(nguoiXem) ? nguoiXem : [nguoiXem];
  const hop = AN_DU.filter(a => a[2].indexOf(yDinh) >= 0 &&
    a[1].some(n => nx.indexOf(n) >= 0));
  return [
    { gocNhin: 'AN_TOAN', anDu: null,
      lam: 'Đi đúng khuôn nhận diện, không thử gì mới.' },
    { gocNhin: 'AN_DU', anDu: hop.length ? hop[0][0] : null,
      /* Không có ẩn dụ nào hợp thì NÓI RA, không rơi lặng lẽ về khuôn
         an toàn — nếu không thì người chọn thấy hai ý giống nhau và
         không hiểu vì sao. */
      lam: hop.length
        ? 'Mượn ẩn dụ ' + hop[0][0] + ' — xem mô tả đầy đủ ở kho.'
        : 'CHƯA CÓ ẨN DỤ NÀO HỢP với cặp ý định × người xem này. Ngân hàng ẩn ' +
          'dụ mới có năm cái (mục TG-04 của sổ chờ). Góc này tạm để trống chứ ' +
          'không lặng lẽ thành một khuôn an toàn thứ hai.',
      trong: hop.length ? undefined : true },
    { gocNhin: 'CAN_CANH', anDu: null,
      lam: 'Thu vào một cử chỉ nhỏ: một bàn tay, một ánh nhìn, một vật trên bàn.' }
  ];
}

/* ═══════════════ ĐỀ BÀI NĂM LỚP ═══════════════
   Thứ tự năm lớp CHÍNH LÀ trọng số — bộ tạo ảnh nghe phần đầu rõ hơn
   phần cuối. Đảo lớp 5 lên đầu thì tấm về đúng kỹ thuật mà sai chuyện.

   Máy dựng KHUNG năm lớp và điền những phần nó BIẾT chắc: khổ, bảng
   màu, cảnh báo kỹ thuật. Phần nội dung và cảm xúc để trống cho người
   viết — máy không nghĩ hộ ý tưởng. */
export function dungLop5(o) {
  const d = o || {};
  const kho = String(d.kho || '');
  const tiLe = { DOC: '1080×1350 (dọc 4:5)', DUNG: '1080×1920 (đứng 9:16)',
                 NGANG: '1200×628 (ngang 1.91:1)' }[kho] || '(chưa chốt khổ)';
  return [
    { ma: 'L1', ten: 'Kiến trúc',
      chu: 'Khổ ' + tiLe + '. ' + (d.boCuc ? String(d.boCuc) : '(bố cục: người viết điền)') },
    { ma: 'L2', ten: 'Nội dung',
      chu: (d.noiDung ? String(d.noiDung).slice(0, 400) : '(người viết điền)') +
        (d.dieuNho ? ' ĐIỀU NHỎ phải NHÌN THẤY trên ảnh: ' + d.dieuNho : '') },
    { ma: 'L3', ten: 'Lối vẽ',
      chu: 'Chỉ dùng bảng màu thương hiệu đã gửi kèm. ' +
        (d.loiVe ? String(d.loiVe) : '(chất liệu nét: người viết điền)') },
    { ma: 'L4', ten: 'Cảm xúc',
      chu: 'Ấm · tươi sáng · tin cậy.' +
        (d.sacKhi ? ' Sắc khí: ' + d.sacKhi + '.' : '') +
        (d.thoiDiem ? ' Người xem gặp tấm này lúc: ' + d.thoiDiem + '.' : '') },
    { ma: 'L5', ten: 'Cảnh báo kỹ thuật',
      chu: 'Chữ phải đọc được và đúng dấu tiếng Việt. Bàn tay đủ năm ngón, ' +
        'tỉ lệ người tự nhiên. Chừa góc dưới bên phải trống cho dấu thương hiệu. ' +
        'Không đặt chữ đè lên mặt người.' }
  ];
}

/* ═══════════════ GÓP Ý VÁ VÀO ĐÂU — PHẦN 5 ═══════════════

   Bản chép của G.TG_SUA_DAU · G.TG_ADN. Bộ kiểm mục 71
   đối chiếu từng ô với kho.

   Vì sao phép này đáng có, nói bằng tiền: mỗi lượt vẽ lại tốn một lượt
   gọi bộ tạo ảnh ngoài. Góp ý "nhìn lạnh quá" là chuyện lớp CẢM XÚC;
   đem nó đi sửa BỐ CỤC thì tấm mới vẫn lạnh y hệt, và Học viện mất một
   lượt vẽ để đổi lấy không gì cả. Sai lớp không lộ ra ở khâu nào — nó
   chỉ lộ ra ở tấm sau, lúc ấy không ai truy được vì sao. */
export const SUA_DAU = [
  ['L1', ['bố cục', 'lệch', 'chật', 'trống quá', 'tràn', 'rối', 'chen chúc',
          'tiêu điểm', 'cân đối', 'sai khổ', 'lệch khung']],
  /* 'nhân vật' TRẦN không dùng được: chính L4 cũng nói "ánh nhìn của nhân
     vật", nên câu góp ý về cảm xúc nào cũng bị kéo thêm về L2. Nên L2 dò
     HÌNH CỦA LỜI XIN — thiếu, thêm, sai, đổi — chứ không dò danh từ. */
  ['L2', ['sai ý', 'thiếu người', 'thừa', 'thiếu nhân vật', 'thêm nhân vật',
          'sai nhân vật', 'đổi nhân vật', 'đạo cụ', 'bối cảnh',
          'sai chuyện', 'không đúng chuyện', 'thiếu điều nhỏ']],
  ['L3', ['sáng quá', 'tối quá', 'nét vẽ', 'chất liệu', 'ánh sáng', 'nền',
          'gắt', 'nhợt', 'chói']],
  ['L4', ['lạnh', 'xa cách', 'giả', 'gượng', 'buồn', 'nghiêm quá', 'không ấm',
          'vô hồn', 'ánh nhìn', 'khô khan']],
  ['L5', ['sai dấu', 'mờ', 'ngón tay', 'méo', 'chữ nhỏ', 'biến dạng',
          'sai chính tả', 'chữ đè', 'sáu ngón']]
];

/* ── VÌ SAO BẢNG NÀY KHÔNG CÓ DANH SÁCH TRỪ, DÙ CỔNG ĐIỀU NHỎ THÌ CÓ ──

   Bản đầu tôi có dựng một danh sách trừ ở đây, y như DN_TRU. Phá thử
   mới thấy nó KHÔNG chặn gì cả: bỏ hẳn nó đi thì mọi phép đo vẫn xanh.

   Lý do là hai bảng bị ép khác nhau. DN_CAM BUỘC phải chứa âm tiết trần
   "tin", vì "tin" là một động từ người ta viết thật — và "tin" đứng
   riêng trong "thông tin", "tin nhắn". Chỗ ấy không tránh được, nên
   phải trừ.

   SUA_DAU thì không bị ép: mọi dấu hiệu dễ bắt oan đều viết được thành
   cụm hai âm tiết — "sai dấu" chứ không phải "dấu", "sáng quá" chứ
   không phải "sáng", "ngón tay" chứ không phải "ngón". Chặn ở chỗ CHỌN
   DẤU HIỆU rẻ hơn và chắc hơn chặn bằng một danh sách trừ, vì danh
   sách trừ phải dài thêm mãi còn cụm hai âm tiết thì đúng một lần.

   Giữ một danh sách không chặn gì là tệ hơn không có: nó làm người đọc
   sau tưởng cái bẫy đã được lo, và thôi không nghĩ tới nữa. */

export const ADN = [
  ['ADN1', ['đổi màu', 'màu khác', 'ngoài bảng màu', 'thêm màu', 'bỏ bảng màu',
            'đổi bảng màu']],
  ['ADN2', ['bỏ dấu', 'bỏ logo', 'xoá logo', 'giấu logo', 'che dấu',
            'bỏ chỗ trống']],
  ['ADN3', ['đổi phông', 'phông khác', 'đổi font', 'font khác', 'phông đẹp hơn']],
  ['ADN4', ['chữ đè lên mặt', 'đặt chữ lên mặt', 'chữ lên mặt']],
  ['ADN5', ['bỏ dấu tiếng việt', 'viết không dấu', 'không dấu cho đẹp',
            'bỏ dấu cho gọn']]
];

/* Cắt góp ý thành từng câu. Cắt ở dấu chấm, chấm phẩy, xuống dòng và
   gạch đầu dòng — người góp ý hay gõ mỗi ý một gạch. Không cắt ở dấu
   phẩy: "chữ nhỏ, bố cục chật" là MỘT ý nói hai chỗ, và cắt đôi thì
   hai nửa mất chủ ngữ. */
function catCau(chu) {
  return String(chu || '')
    .split(/[.;\n\r]+|(?:^|\s)[-–•]\s+/)
    .map(s => s.trim()).filter(s => s.length >= 3);
}

/* ADN dò TRƯỚC, và câu nào chạm ADN thì KHÔNG đi tiếp vào phép chia
   lớp. Để nó đi tiếp thì một câu xin đổi bảng màu vừa bị từ chối vừa
   được chỉ đường đi sửa ở lớp Lối vẽ — và người ta làm theo vế thứ
   hai, vì vế thứ hai là vế nói cách làm. */
export function vaGopY(chu) {
  const cau = catCau(chu);
  const tuChoi = [], conLai = [];

  cau.forEach(c => {
    const cham = ADN.filter(([, dau]) => dau.some(d => coTu(c, d, [])))
      .map(([ma]) => ma);
    if (cham.length) tuChoi.push({ cau: c, adn: cham });
    else conLai.push(c);
  });

  /* Một câu chạm nhiều lớp thì nêu CẢ HAI. Chọn cái nặng hơn giùm người
     ta thì nửa còn lại rơi mất mà không ai biết nó đã từng được nói. */
  const theoLop = {};
  const khongDoc = [];
  conLai.forEach(c => {
    const cham = SUA_DAU.filter(([, dau]) => dau.some(d => coTu(c, d, [])))
      .map(([lop]) => lop);
    /* Không đọc ra dấu hiệu nào thì TRẢ LẠI NGUYÊN CÂU. Đoán một lớp rồi
       trình ra như một đề nghị thì người ta tin nó đã được cân nhắc, và
       họ đi sửa nhầm lớp — tốn đúng một lượt vẽ. */
    if (!cham.length) { khongDoc.push(c); return; }
    cham.forEach(l => { (theoLop[l] = theoLop[l] || []).push(c); });
  });

  /* Giữ đúng thứ tự L1→L5: thứ tự năm lớp là trọng số, nên danh sách vá
     cũng phải đọc theo thứ tự ấy. */
  const lop = SUA_DAU.filter(([l]) => theoLop[l])
    .map(([l]) => ({ lop: l, cau: theoLop[l] }));

  return { soCau: cau.length, lop, tuChoi, khongDoc };
}

/* Cửa cho màn hình: đọc góp ý, nói vá vào lớp nào. Không ghi gì vào sổ
   và KHÔNG viết câu vá — máy nói vá vào LỚP NÀO, câu vá là của người
   viết. Máy viết hộ thì tấm sau mang giọng của máy. */
export async function docGopY(y, env, db, hoSo) {
  if (!duocVao(hoSo)) return {ok: false, code: 'NOPERM',
    error: 'Cổng thiết kế mở cho R01–R05.'};
  const chu = String((y || {}).gopY || '').trim();
  if (chu.length < 15) return {ok: false,
    error: 'Dưới mười lăm chữ thì chưa đủ để đọc ra góp ý nói về chỗ nào.'};

  const r = vaGopY(chu);
  return {ok: true, ...r,
    vi: r.lop.length
      ? 'Máy nói vá vào lớp nào; câu vá là của người viết.'
      : 'Máy chưa đọc ra lớp nào. Không đoán — đoán sai lớp thì tấm sau vẫn ' +
        'hỏng đúng chỗ cũ, và mất thêm một lượt vẽ.'};
}

/* ═══════════════ KÊNH PHÁT · GIỜ VÀNG · GỠ BÀI — PHẦN 9 ═══════════════

   Bản chép của G.TG_KENH · G.TG_GIO_VANG · G.TG_GO_LY_DO. Bộ kiểm mục
   71 đối chiếu từng ô với kho. */
export const KENH = [
  ['TRANG_NHA', ['NGANG', 'DOC']],
  ['TIN_NHANH', ['DUNG']],
  ['DONG_TIN', ['DOC', 'NGANG']],
  ['NHOM_KIN', ['DOC', 'NGANG']],
  ['THU_DIEN', ['NGANG']],
  ['IN_GIAY', ['DOC']]
];

export const GIO_VANG = [
  ['SANG', '05:30', '06:30'],
  ['TRUA', '11:30', '12:30'],
  ['TOI', '20:30', '22:00']
];

export const GO_LY_DO = [
  ['SAI_NOI_DUNG', true], ['SAI_NHAN_DIEN', false], ['HET_HAN', false],
  ['NGUOI_TRONG_ANH', true], ['PHAP_LY', true]
];

/* ── GIỜ VIỆT NAM, KHÔNG PHẢI GIỜ MÁY CHỦ ──
   Máy chủ chạy ở đâu là chuyện của máy chủ; người xem thì luôn ở đây.
   Cloudflare Workers chạy UTC, nên đọc giờ máy là lệch bảy tiếng — và
   lệch bảy tiếng thì khung "tối" rơi vào giữa trưa, im lặng. */
const LECH_VN = 7 * 60;
function phutVN(luc) {
  const d = luc ? new Date(luc) : new Date();
  return ((d.getUTCHours() * 60 + d.getUTCMinutes()) + LECH_VN) % 1440;
}
function raPhut(hhmm) {
  const [h, m] = String(hhmm).split(':').map(Number);
  return h * 60 + m;
}

/* Trả về mã khung giờ, hoặc null nếu đang ngoài cả ba khung. Không
   "gần đúng": 06:31 là ngoài khung, và nói ra như thế. Nới cho gần
   đúng thì ranh giới trôi dần, và sau vài bản thì không còn khung nào. */
export function trongGioVang(luc) {
  const p = phutVN(luc);
  const hop = GIO_VANG.find(([, tu, den]) => p >= raPhut(tu) && p <= raPhut(den));
  return hop ? hop[0] : null;
}

/* Khổ có hợp kênh không. Sai khổ thì nền tảng TỰ CẮT, và nó cắt ở
   giữa — thứ bị cắt thường là dòng mời ở đáy hoặc dấu thương hiệu ở
   góc, đúng hai thứ quan trọng nhất, và không báo gì cả. */
export function hopKenh(kenh, kho) {
  const k = KENH.find(([ma]) => ma === kenh);
  if (!k) return {hop: false, laKenhLa: true};
  return {hop: k[1].indexOf(kho) >= 0, nhan: k[1]};
}

/* ═══════════ ĐĂNG MỘT TẤM LÊN MỘT KÊNH ═══════════ */
export async function dangTamThiGiac(y, env, db, hoSo) {
  if (!duocVao(hoSo)) return {ok: false, code: 'NOPERM',
    error: 'Cổng thiết kế mở cho R01–R05.'};

  const x = await db.prepare('SELECT id,trangThai,ban FROM deXuatThiGiac WHERE id = ?')
    .bind(String(y.id || '')).first();
  if (!x) return {ok: false, error: 'Không tìm thấy đề xuất này.'};

  /* ── CHỈ ĐĂNG THỨ ĐÃ PHÁT HÀNH ──
     Bậc `duyet` nghĩa là người duyệt đã gật; `phatHanh` nghĩa là bản
     cuối đã chốt. Cho đăng ở bậc duyệt thì một bản còn đang sửa chữ đi
     ra ngoài, và tấm ngoài kia không sửa lại được nữa. */
  if (x.trangThai !== 'phatHanh') return {ok: false, code: 'CHUAPHATHANH',
    error: 'Tấm đang ở bậc "' + x.trangThai + '". Chỉ đăng thứ đã PHÁT HÀNH — ' +
      'bậc duyệt nghĩa là người duyệt đã gật, còn phát hành nghĩa là bản cuối đã ' +
      'chốt. Đăng ở bậc duyệt thì một bản còn đang sửa chữ đi ra ngoài, và tấm ' +
      'ngoài kia không sửa lại được nữa.'};

  const kenh = String(y.kenh || '').trim();
  const kho = String(y.kho || '').trim();
  const hk = hopKenh(kenh, kho);
  if (hk.laKenhLa) return {ok: false, code: 'KENHLA',
    error: 'Không có kênh "' + kenh + '". Đang có: ' +
      KENH.map(k => k[0]).join(' · ') + '.'};
  if (!hk.hop) return {ok: false, code: 'LECHKHO', nhan: hk.nhan,
    error: 'Kênh ' + kenh + ' nhận khổ ' + hk.nhan.join(' hoặc ') + ', không nhận ' +
      kho + '. Đăng sai khổ thì nền tảng TỰ CẮT, và nó cắt ở giữa — thứ bị cắt ' +
      'thường là dòng mời ở đáy hoặc dấu thương hiệu ở góc, đúng hai thứ quan ' +
      'trọng nhất, và không báo gì cả.'};

  /* ── GIỜ VÀNG: NÓI RA, KHÔNG CHẶN ──
     Một tấm chúc Tết phải đi đúng giao thừa; một tấm xin lỗi phải đi
     NGAY. Chặn theo giờ là bắt cả Học viện đứng lại vì một con số trung
     bình, mà con số trung bình không biết hôm nay có chuyện gì.

     Nhưng đăng ngoài khung phải VIẾT MỘT CÂU. Không bắt viết thì mọi
     lượt đều đăng ngoài khung, và bảng giờ vàng thành một lời chú giải. */
  const khung = trongGioVang(y.luc);
  const lyDoNgoai = String(y.lyDoNgoaiGio || '').trim();
  if (!khung && lyDoNgoai.length < 10) return {ok: false, code: 'NGOAIGIO',
    gioVang: GIO_VANG.map(g => g[1] + '–' + g[2]),
    error: 'Đang ngoài cả ba khung giờ vàng (' +
      GIO_VANG.map(g => g[1] + '–' + g[2]).join(' · ') + ' giờ Việt Nam). ' +
      'Máy KHÔNG chặn — một tấm chúc Tết phải đi đúng giao thừa, một tấm xin lỗi ' +
      'phải đi ngay. Chỉ cần viết một câu vì sao đăng lúc này, và câu ấy ở lại ' +
      'trong sổ.'};

  const id = 'DT-' + Date.now().toString(36) + '-' +
    Math.random().toString(36).slice(2, 7);
  const luc = new Date().toISOString();
  await db.prepare(
    'INSERT INTO dangTamThiGiac (id,idDeXuat,kenh,kho,duongDan,trongGioVang,' +
    'lyDoNgoaiGio,boiAi,luc) VALUES (?,?,?,?,?,?,?,?,?)'
  ).bind(id, x.id, kenh, kho, String(y.duongDan || '').slice(0, 500) || null,
    khung || '', lyDoNgoai.slice(0, 400) || null, hoSo.u, luc).run();

  await Kho.ghiNhatKy(db, {uid: hoSo.uid, username: hoSo.u, viec: 'TG_DANG',
    doiTuong: x.id, chiTiet: kenh + ' · ' + kho + ' · ' +
      (khung ? 'khung ' + khung : 'NGOÀI khung giờ')});

  return {ok: true, id, idDeXuat: x.id, kenh, kho,
    trongGioVang: khung,
    vi: khung
      ? 'Đăng trong khung ' + khung + '.'
      : 'Đăng ngoài khung giờ vàng, và lý do đã vào sổ.'};
}

/* ═══════════ GỠ — VÀ CÂU THẬT VỀ VIỆC GỠ ═══════════

   Đây là chỗ dễ dựng sai nhất của cả phần 9, và dựng sai thì tệ hơn
   không có: một nút "Gỡ" làm người bấm tin rằng chuyện đã xong.

   Gỡ trong sổ KHÔNG gỡ được ở ngoài. Tấm đã đăng thì nằm ở máy chủ của
   nền tảng ấy; ai đã lưu về máy thì vẫn giữ; ai đã chụp màn hình thì
   vẫn giữ. Sổ của Học viện chỉ ghi được rằng Học viện ĐÃ QUYẾT gỡ. */
export async function goTamThiGiac(y, env, db, hoSo) {
  if (!duocVao(hoSo)) return {ok: false, code: 'NOPERM',
    error: 'Cổng thiết kế mở cho R01–R05.'};

  const d = await db.prepare('SELECT * FROM dangTamThiGiac WHERE id = ?')
    .bind(String(y.id || '')).first();
  if (!d) return {ok: false, error: 'Không tìm thấy lượt đăng này.'};

  /* ── NGƯỜI BÁO ĐÃ GỠ Ở KÊNH NGOÀI ──
     Ô này là LỜI KHAI CỦA NGƯỜI, không phải phép đo. Máy không nhìn
     thấy kênh ngoài nên không tự đánh dấu được — và một ô máy tự đánh
     dấu mà không đo được là một lời nói dối mang dấu của hệ thống. */
  if (y.baoDaGoNgoai) {
    if (!d.goTrongSo) return {ok: false, code: 'CHUAQUYETGO',
      error: 'Lượt đăng này Học viện chưa quyết gỡ. Báo đã gỡ ở ngoài trước khi ' +
        'quyết gỡ trong sổ là ghi ngược thứ tự — sổ sẽ đọc ra như thể có người ' +
        'tự ý gỡ.'};
    await db.prepare('UPDATE dangTamThiGiac SET daGoNgoai = ?, goNgoaiBoiAi = ? ' +
      'WHERE id = ? AND daGoNgoai IS NULL')
      .bind(new Date().toISOString(), hoSo.u, d.id).run();
    await Kho.ghiNhatKy(db, {uid: hoSo.uid, username: hoSo.u, viec: 'TG_GO_NGOAI',
      doiTuong: d.idDeXuat, chiTiet: d.kenh});
    return {ok: true, id: d.id, daGoNgoai: true,
      vi: 'Đã ghi LỜI KHAI rằng tấm đã gỡ xuống ở ' + d.kenh + '. Đây là lời ' +
        'khai của người, không phải phép đo — máy không nhìn thấy kênh ngoài.'};
  }

  if (d.goTrongSo) return {ok: false, code: 'DAGO',
    error: 'Lượt đăng này đã được quyết gỡ lúc ' + d.goTrongSo + '.'};

  const ma = String(y.lyDo || '').trim();
  if (!GO_LY_DO.some(([m]) => m === ma)) return {ok: false, code: 'LYDOLA',
    error: 'Phải chọn một lý do gỡ. Đang có: ' +
      GO_LY_DO.map(g => g[0]).join(' · ') + '.'};

  /* Một câu, bắt buộc. Gỡ không lý do thì lần sau người khác dựng lại
     đúng tấm ấy, vì không có gì nói cho họ biết vì sao. */
  const cau = String(y.cau || '').trim();
  if (cau.length < 15) return {ok: false, code: 'THIEUCAU',
    error: 'Viết một câu vì sao gỡ. Gỡ không câu nào thì lần sau người khác dựng ' +
      'lại đúng tấm ấy — không có gì nói cho họ biết vì sao nó đã bị gỡ.'};

  const luc = new Date().toISOString();
  const r = await db.prepare(
    'UPDATE dangTamThiGiac SET goTrongSo = ?, goLyDo = ?, goCau = ?, goBoiAi = ? ' +
    'WHERE id = ? AND goTrongSo IS NULL'
  ).bind(luc, ma, cau.slice(0, 600), hoSo.u, d.id).run();
  if (!((r && r.meta && r.meta.changes) || 0))
    return {ok: false, error: 'Lượt đăng vừa được gỡ ở chỗ khác. Mở lại rồi xem.'};

  await Kho.ghiNhatKy(db, {uid: hoSo.uid, username: hoSo.u, viec: 'TG_GO',
    doiTuong: d.idDeXuat, chiTiet: d.kenh + ' · ' + ma + ' · ' + cau.slice(0, 150)});

  const gap = (GO_LY_DO.find(([m]) => m === ma) || [])[1];
  return {ok: true, id: d.id, goTrongSo: luc, lyDo: ma, gapNgay: !!gap,
    conPhaiLam: 'Vào ' + d.kenh + ' gỡ tấm xuống bằng tay, rồi quay lại bấm ' +
      '"đã gỡ ở ngoài".',
    vi: 'Học viện đã QUYẾT gỡ, và sổ đã ghi. Nhưng gỡ trong sổ KHÔNG gỡ được ở ' +
      'ngoài: tấm đã đăng thì nằm ở máy chủ của ' + d.kenh + ', ai đã lưu về hoặc ' +
      'chụp màn hình thì vẫn giữ.' + (gap ? ' Lý do này thuộc nhóm GẤP — làm ngay.' : '')};
}

/* Sổ đăng. Nêu riêng hai phía, cùng luật với đối chiếu ngân hàng: đã
   quyết gỡ mà chưa ai báo gỡ ngoài là việc còn đang hở. */
export async function soDangBai(y, env, db, hoSo) {
  if (!duocVao(hoSo)) return {ok: false, code: 'NOPERM',
    error: 'Cổng thiết kế mở cho R01–R05.'};
  const ds = await db.prepare('SELECT * FROM dangTamThiGiac ORDER BY luc DESC LIMIT 300')
    .all();
  const r = ((ds && ds.results) || []);
  /* HAI phía riêng, không gộp thành một con số "còn tồn". Gộp lại thì
     một tấm đã quyết gỡ ba tuần mà chưa ai vào kênh gỡ nằm chung rổ với
     một tấm vừa quyết gỡ năm phút trước. */
  const hoGo = r.filter(x => x.goTrongSo && !x.daGoNgoai);
  const ngoaiGio = r.filter(x => !x.trongGioVang);
  return {ok: true, so: r.length, ds: r,
    hoGo: hoGo.map(x => ({id: x.id, kenh: x.kenh, quyetLuc: x.goTrongSo,
      lyDo: x.goLyDo, gapNgay: !!(GO_LY_DO.find(g => g[0] === x.goLyDo) || [])[1]})),
    soNgoaiGio: ngoaiGio.length,
    vi: hoGo.length
      ? hoGo.length + ' lượt đã QUYẾT gỡ mà chưa ai báo đã gỡ ở kênh ngoài. ' +
        'Tấm vẫn đang ở ngoài kia.'
      : 'Không lượt nào còn hở giữa quyết gỡ và gỡ thật.'};
}

/* ═══════════════ ĐO PHỄU — PHẦN 10 ═══════════════

   Bản chép của G.TG_PHEU. Sáu bậc ĐO ĐƯỢC; ba bậc cuối là LỜI KHAI và
   máy chủ này KHÔNG trả về chúng — nó trả về đúng thứ nó đếm được,
   cộng một câu nói thẳng phần nó không đếm được.

   Vì sao không trả về cả ba bậc khai với giá trị 0: một số 0 trong
   cùng một bảng với sáu số đo được thì đọc ra như "chưa ai xem", chứ
   không đọc ra "máy không biết". Hai câu ấy khác hẳn nhau. */
export const PHEU_DO = ['DE_XUAT', 'DUYET', 'PHAT_HANH', 'DANG', 'GO'];
export const PHEU_KHAI = ['XEM', 'BAM', 'NHAN_VE'];

/* Nửa lời khai, đọc từ sổ khaiSoNgoai. Cộng theo LẦN ĐỌC BẢNG MỚI NHẤT
   của từng lượt đăng, không cộng mọi dòng: mỗi dòng là một lượt đọc
   bảng của cùng một bài, nên cộng hết là cộng cùng một lượt xem nhiều
   lần — con số phồng lên theo số lần ai đó ngồi gõ. */
async function docLoiKhai(db) {
  const r = await db.prepare(
    'SELECT k.idDang, k.ngayDoc, k.xem, k.bam, k.nhanVe, k.boiAi, k.luc ' +
    'FROM khaiSoNgoai k JOIN (SELECT idDang, MAX(ngayDoc) AS m FROM khaiSoNgoai ' +
    'GROUP BY idDang) t ON k.idDang = t.idDang AND k.ngayDoc = t.m').all();
  const ds = ((r && r.results) || []);
  if (!ds.length) return {soLuotDaKhai: 0,
    vi: 'Chưa ai gõ con số nào từ bảng của nền tảng.'};
  /* Cộng bỏ qua ô TRỐNG, và ĐẾM RIÊNG số lượt có ô ấy. Trống nghĩa là
     không đọc được ô ấy, khác hẳn số 0 nghĩa là đọc được và bằng không.
     Cộng trống thành 0 rồi trình ra một tổng là nói dối về cỡ mẫu. */
  const gom = (k) => {
    const co = ds.filter(x => x[k] !== null && x[k] !== undefined);
    return co.length ? {tong: co.reduce((a, b) => a + Number(b[k]), 0),
      tren: co.length} : undefined;
  };
  const moiNhat = ds.map(x => x.luc).sort().slice(-1)[0];
  return {soLuotDaKhai: ds.length, khaiGanNhat: moiNhat,
    XEM: gom('xem'), BAM: gom('bam'), NHAN_VE: gom('nhanVe'),
    vi: 'Cộng theo lần đọc bảng MỚI NHẤT của từng lượt đăng, trên ' + ds.length +
      ' lượt. Mỗi ô kèm "trên bao nhiêu lượt" vì ô để TRỐNG nghĩa là không đọc ' +
      'được, khác hẳn số 0 nghĩa là đọc được và bằng không.'};
}

export async function doPheuThiGiac(y, env, db, hoSo) {
  if (!duocVao(hoSo)) return {ok: false, code: 'NOPERM',
    error: 'Cổng thiết kế mở cho R01–R05.'};

  const bac = await db.prepare(
    'SELECT trangThai, COUNT(*) AS n FROM deXuatThiGiac GROUP BY trangThai').all();
  const dem = {};
  ((bac && bac.results) || []).forEach(r => { dem[r.trangThai] = Number(r.n); });

  const dang = await db.prepare(
    'SELECT COUNT(DISTINCT idDeXuat) AS n FROM dangTamThiGiac').first();
  /* Gỡ đếm HAI con số riêng, cùng luật với sổ đăng: đã quyết gỡ, và đã
     gỡ thật ở ngoài. Một con số gộp thì chỗ hở biến mất. */
  const go = await db.prepare(
    'SELECT COUNT(*) AS quyet, SUM(CASE WHEN daGoNgoai IS NOT NULL THEN 1 ELSE 0 END) ' +
    'AS thatSu FROM dangTamThiGiac WHERE goTrongSo IS NOT NULL').first();

  /* "Đã đề xuất" là MỌI bản ghi đã qua cổng — tức là mọi bậc từ deXuat
     trở lên, không phải riêng bậc deXuat. Đếm riêng bậc thì một tấm đã
     phát hành biến mất khỏi bậc đầu, và phễu đọc ra như thể nó hẹp dần
     vì có tấm rơi ra — trong khi chúng chỉ đi tiếp. */
  const tru = (dem.nhap || 0) + (dem.tuCho || 0) + (dem.tuChoi || 0);
  const tong = Object.values(dem).reduce((a, b) => a + b, 0);
  const daDe = tong - tru;
  const daDuyet = (dem.duyet || 0) + (dem.hoanThien || 0) + (dem.phatHanh || 0);

  return {ok: true,
    doDuoc: {
      DE_XUAT: daDe, DUYET: daDuyet, PHAT_HANH: dem.phatHanh || 0,
      DANG: Number((dang && dang.n) || 0),
      GO_TRONG_SO: Number((go && go.quyet) || 0),
      GO_THAT_SU: Number((go && go.thatSu) || 0)
    },
    nhap: dem.nhap || 0, tuChoi: dem.tuChoi || 0,
    /* KHÔNG trả về ba bậc khai với giá trị 0, và không trộn chúng vào
       `doDuoc` kể cả khi ĐÃ có người gõ vào. Một số 0 nằm cùng bảng với
       sáu số đo được thì đọc ra là "chưa ai xem", không đọc ra là "máy
       không biết" — và hai câu ấy khác hẳn nhau.

       Từ 9.99.60 chúng có chỗ ghi, nên trả về ở một ngăn RIÊNG kèm số
       lượt khai và lần khai gần nhất. Có chỗ ghi không làm chúng thành
       phép đo: máy chủ vẫn không nhìn thấy kênh ngoài. */
    khongDoDuoc: PHEU_KHAI,
    loiKhai: await docLoiKhai(db),
    vi: 'Sáu con số trên đều ĐO THẲNG trong sổ của Học viện, không ai gõ vào. ' +
      'Lượt xem · lượt bấm · lượt nhắn về thì máy chủ này KHÔNG nhìn thấy — ' +
      'chúng ở bảng của nền tảng ngoài. Đặt chúng vào cùng bảng này với giá trị ' +
      '0 là để người đọc tin chúng như tin sáu con số kia, nên máy không đặt.'};
}

/* ═══════════════ GHI NỬA LỜI KHAI CỦA PHỄU ═══════════════

   Bản 9.99.59 khai ba bậc XEM · BAM · NHAN_VE là LỜI KHAI, rồi KHÔNG
   dựng chỗ nào để ghi chúng. Theo đúng luật của kho thì mục ấy không
   phải một việc chờ — nó là một lời than. Đây là chỗ ghi.

   Con số vẫn là LỜI KHAI, và nó ở LẠI trong ngăn lời khai mãi mãi.
   Có chỗ ghi không làm nó thành phép đo: máy chủ này vẫn không nhìn
   thấy kênh ngoài. Cái nó có thêm là ai gõ và gõ lúc nào — tức là
   kiểm lại được, chứ không phải đúng hơn. */
export async function khaiSoKenhNgoai(y, env, db, hoSo) {
  if (!duocVao(hoSo)) return {ok: false, code: 'NOPERM',
    error: 'Cổng thiết kế mở cho R01–R05.'};

  const d = await db.prepare('SELECT id, kenh FROM dangTamThiGiac WHERE id = ?')
    .bind(String(y.idDang || '')).first();
  if (!d) return {ok: false, error: 'Không tìm thấy lượt đăng này.'};

  /* Ngày ĐỌC BẢNG, do người khai — không lấy ngày hôm nay. Người ta hay
     đọc bảng của tuần trước rồi mới ngồi gõ vào, và gán ngày hôm nay
     thì con số nằm sai chỗ trên trục thời gian, im lặng. */
  const ngay = String(y.ngayDoc || '').trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(ngay)) return {ok: false, code: 'THIEUNGAY',
    error: 'Phải ghi NGÀY ĐỌC BẢNG theo dạng 2026-09-12. Máy không lấy ngày hôm ' +
      'nay thay: người ta hay đọc bảng của tuần trước rồi mới ngồi gõ, và gán ' +
      'ngày hôm nay thì con số nằm sai chỗ trên trục thời gian mà không ai thấy.'};

  const so = ['xem', 'bam', 'nhanVe'].map(k => {
    const v = y[k];
    if (v === undefined || v === null || v === '') return null;
    const n = Number(v);
    return (isNaN(n) || n < 0) ? NaN : Math.round(n);
  });
  if (so.some(v => Number.isNaN(v))) return {ok: false,
    error: 'Ba ô số chỉ nhận số không âm, hoặc để trống. Để trống nghĩa là ' +
      'KHÔNG ĐỌC ĐƯỢC ô ấy — khác hẳn với số 0, nghĩa là đọc được và bằng không.'};
  if (so.every(v => v === null)) return {ok: false,
    error: 'Cả ba ô đều trống thì không có gì để ghi.'};

  const id = 'KS-' + Date.now().toString(36) + '-' +
    Math.random().toString(36).slice(2, 7);
  await db.prepare(
    'INSERT INTO khaiSoNgoai (id,idDang,ngayDoc,xem,bam,nhanVe,boiAi,luc,ghiChu) ' +
    'VALUES (?,?,?,?,?,?,?,?,?)'
  ).bind(id, d.id, ngay, so[0], so[1], so[2], hoSo.u, new Date().toISOString(),
    String(y.ghiChu || '').slice(0, 300) || null).run();

  await Kho.ghiNhatKy(db, {uid: hoSo.uid, username: hoSo.u, viec: 'TG_KHAISO',
    doiTuong: d.id, chiTiet: d.kenh + ' · ' + ngay + ' · xem ' + (so[0] ?? '—') +
      ' · bấm ' + (so[1] ?? '—') + ' · nhắn ' + (so[2] ?? '—')});

  return {ok: true, id, idDang: d.id, kenh: d.kenh, ngayDoc: ngay,
    vi: 'Đã ghi. Ba con số này vẫn là LỜI KHAI và ở lại trong ngăn lời khai — ' +
      'có chỗ ghi không làm chúng thành phép đo, vì máy chủ vẫn không nhìn thấy ' +
      'kênh ngoài. Cái chúng có thêm là ai gõ và gõ lúc nào.'};
}

/* ═══════════════ ĐỜI MỘT TẤM — SỔ TRUY VẾT ═══════════════

   Nhật ký đã ghi đủ từ lâu: TG_DEXUAT · TG_BAC · TG_XUAT · TG_DIRA ·
   TG_DANG · TG_GO. Nhưng chúng nằm rải trong một sổ chung xếp theo
   THỜI GIAN của cả hệ, nên muốn đọc đời một tấm thì phải lọc bằng mắt
   qua hàng nghìn dòng của mọi việc khác.

   Một sự thật có mà không đọc ra được thì trên thực tế là không có.
   Cửa này gom đúng một tấm, xếp theo thời gian, và nói luôn chỗ nào
   còn hở. */
export async function doiMotTam(y, env, db, hoSo) {
  if (!duocVao(hoSo)) return {ok: false, code: 'NOPERM',
    error: 'Cổng thiết kế mở cho R01–R05.'};

  const id = String((y || {}).id || '').trim();
  const x = await db.prepare('SELECT * FROM deXuatThiGiac WHERE id = ?').bind(id).first();
  if (!x) return {ok: false, error: 'Không tìm thấy đề xuất này.'};

  const nk = await db.prepare(
    'SELECT viec, username, chiTiet, luc FROM audit WHERE doiTuong = ? ' +
    'ORDER BY luc ASC LIMIT 500').bind(id).all();
  const dg = await db.prepare(
    'SELECT * FROM dangTamThiGiac WHERE idDeXuat = ? ORDER BY luc ASC').bind(id).all();
  const dr = await db.prepare(
    'SELECT cong, boiAi, luc, soChu FROM luotDiRa WHERE idDeXuat = ? ' +
    'ORDER BY luc ASC').bind(id).all();

  const dsDang = ((dg && dg.results) || []);
  return {ok: true, id,
    ban: Number(x.ban), banTruoc: x.banTruoc || undefined,
    trangThai: x.trangThai, diem: x.diem, bacDiem: x.bacDiem || undefined,
    nhatKy: ((nk && nk.results) || []),
    dang: dsDang,
    diRa: ((dr && dr.results) || []),
    /* Chỗ hở nêu riêng, không trộn vào dòng thời gian: một dòng trong
       dòng thời gian thì người ta đọc như một việc đã qua. */
    conHo: dsDang.filter(d => d.goTrongSo && !d.daGoNgoai)
      .map(d => ({kenh: d.kenh, quyetLuc: d.goTrongSo, lyDo: d.goLyDo})),
    vi: 'Đời một tấm, xếp theo thời gian. Nhật ký đã ghi đủ từ lâu, nhưng nằm ' +
      'rải trong sổ chung của cả hệ — và một sự thật có mà không đọc ra được thì ' +
      'trên thực tế là không có.'};
}

/* Cửa cho màn hình: đọc ý định, đề nghị khổ, phác ba góc — một lượt.
   Không ghi gì vào sổ. */
export async function docYTuong(y, env, db, hoSo) {
  if (!duocVao(hoSo)) return {ok: false, code: 'NOPERM',
    error: 'Cổng thiết kế mở cho R01–R05.'};
  const d = (y || {}).deXuat || y || {};
  const chu = String(d.noiDung || '').trim();
  if (chu.length < 20) return {ok: false,
    error: 'Dưới hai mươi chữ thì chưa đủ để đọc ra ý định.'};
  const yd = docYDinh(chu + ' ' + String(d.nhiemVu || ''));
  const kh = yd.yDinh ? quyetKhung(yd.yDinh, d.nguoiXem || []) : {co: false,
    vi: 'Chưa đọc ra ý định nên chưa đề nghị được khổ.'};
  return {ok: true, yDinh: yd, khung: kh,
    baY: yd.yDinh ? phacBaY(yd.yDinh, d.nguoiXem || []) : [],
    vi: 'Máy ĐỀ NGHỊ, người chốt. Cả lượt đọc này chạy trong máy chủ Học viện.'};
}

/* Cửa cho màn hình gọi TRƯỚC khi gửi đề xuất — hỏi trước thì người ta
   sửa ngay trên màn, không phải gửi đi rồi bị trả về. */
export async function docDieuNho(y, env, db, hoSo) {
  if (!duocVao(hoSo)) return {ok: false, code: 'NOPERM',
    error: 'Cổng thiết kế mở cho R01–R05.'};
  const r = soatDieuNho((y || {}).deXuat || y || {});
  return {ok: true, ...r};
}

/* Cửa cho màn hình gọi TRƯỚC khi đề xuất. Không ghi gì vào sổ — nó
   chỉ đọc và trả lời. */
export async function docNoiDungThiGiac(y, env, db, hoSo) {
  if (!duocVao(hoSo)) return {ok: false, code: 'NOPERM',
    error: 'Cổng thiết kế mở cho R01–R05.'};
  const chu = String((y || {}).noiDung || '').trim();
  if (chu.length < 20) return {ok: false,
    error: 'Dưới hai mươi chữ thì chưa đủ để đọc ra cấu trúc.'};
  const yBatBuoc = rutYBatBuoc(chu);
  const deNghi = deNghiLoaiHinh(chu);
  return {ok: true, soY: yBatBuoc.length, yBatBuoc, deNghi,
    vi: 'Máy ĐỀ NGHỊ, người chọn. Không tự áp: một đoạn nói "90 ngày" có thể ' +
        'là lộ trình mà cũng có thể là bảng so sánh, và máy không biết người ' +
        'viết định nói cái nào. Cả lượt đọc này chạy TRONG máy chủ Học viện — ' +
        'không một câu nội dung nào đi ra ngoài.'};
}

/* ═══════════════ ĐỀ XUẤT ═══════════════ */
export async function deXuatThiGiac(y, env, db, hoSo) {
  if (!duocVao(hoSo)) return {ok: false, code: 'NOPERM',
    error: 'Cổng thiết kế mở cho R01–R05.'};

  const d = y.deXuat || {};
  const noiDung = String(d.noiDung || '').trim();
  const tang = String(d.tang || '').trim().toUpperCase();
  const loaiHinh = String(d.loaiHinh || '').trim();
  const nhiemVu = String(d.nhiemVu || '').trim();

  if (noiDung.length < 20) return {ok: false,
    error: 'Nói rõ nội dung cần hình. Dưới hai mươi chữ thì chưa đủ để ' +
           'máy soi Tầng, và một đề xuất không soi được Tầng là một đề xuất ' +
           'chưa bắt đầu.'};
  if (LOAI_HINH.indexOf(loaiHinh) < 0) return {ok: false,
    error: 'Loại hình phải là một trong: ' + LOAI_HINH.join(', ') + '.'};

  /* ── MỘT VISUAL — MỘT NHIỆM VỤ ──
     Luật vàng. Nhồi hai nhiệm vụ vào một tấm thì người xem không nhớ
     được cái nào, và tấm hình ấy tốn tiền làm ra để không làm việc gì. */
  if (nhiemVu.length < 10) return {ok: false, code: 'THIEUNHIEMVU',
    error: 'Một hình — một nhiệm vụ. Viết ra nhiệm vụ DUY NHẤT của tấm này. ' +
           'Không viết được thành một câu nghĩa là nó đang mang nhiều hơn một ' +
           'việc, và tấm mang hai việc thì không làm xong việc nào.'};
  /* KHÔNG DÙNG \b VỚI TIẾNG VIỆT CÓ DẤU. Bản đầu viết /\bvà\b/ và nó
     KHÔNG BAO GIỜ khớp: \b đòi một biên giữa ký tự-từ và không-phải-từ,
     mà "à" đứng ngoài lớp \w của JavaScript, nên sau nó không có biên
     nào cả. Phép chặn im lặng suốt — nhận mọi nhiệm vụ gộp. Bộ thử bắt
     ngay lần chạy đầu. Đây là cái bẫy chung cho mọi phép dò chữ tiếng
     Việt trong kho này. */
  const demVa = nhiemVu.split(/(?:^|\s)và(?:\s|$)/).length - 1;
  if (demVa >= 2)
    return {ok: false, code: 'NHIEUNHIEMVU',
      error: 'Nhiệm vụ này có nhiều hơn một chữ "và" — gần như chắc chắn nó ' +
             'đang gộp mấy việc. Tách thành mấy tấm.'};

  /* ── MỘT CHỮ "VÀ": KHÔNG CHẶN, NHƯNG KHÔNG IM ──
     Ngưỡng chặn đặt ở HAI chữ "và" có lý do: "cho phụ huynh và học viên"
     là một việc, chặn nó là chặn oan. Nhưng "nói tầm nhìn và giới thiệu
     năm chặng" cũng chỉ có một chữ "và" mà là hai việc thật — chạy demo
     tấm tầm nhìn thì nó đi lọt, không một dòng cảnh báo nào.
     Máy không phân biệt được hai câu ấy, nên máy KHÔNG quyết. Nó chỉ
     nói ra chỗ đáng ngờ, và câu ấy đi theo đề bài tới tận bậc duyệt để
     người duyệt nhìn thấy. Đó đúng là luật của cổng này: máy đề xuất,
     chủ hệ quyết. */
  const luuY = [];
  if (demVa === 1)
    luuY.push('Nhiệm vụ có một chữ "và". Máy không chặn vì "và" cũng dùng để ' +
      'nối người xem, nhưng người duyệt đọc lại: nếu nó đang nối HAI VIỆC ' +
      'thì tách thành hai tấm, đừng vẽ.');

  const nx = Array.isArray(d.nguoiXem) ? d.nguoiXem : [];
  const nxLa = nx.filter(x => NGUOI_XEM.indexOf(x) < 0);
  if (nxLa.length) return {ok: false,
    error: 'Người xem lạ: ' + nxLa.join(', ') + '. Chỉ nhận ' + NGUOI_XEM.join(', ') + '.'};

  /* ── CỔNG ĐIỀU NHỎ ──
     Đứng ở đây, sau phép kiểm hình dạng và TRƯỚC cổng Tầng. Lý do của
     thứ tự: câu "người xem lạ" nói về một ô SAI, còn cổng này nói về
     một ô THIẾU — sửa một ô sai thì dễ, còn trả lời ba câu hỏi thì mất
     công hơn, và không nên bắt người ta trả lời ba câu rồi mới báo họ
     gõ sai một mã.

     Cổng này nuốt luôn phép kiểm THIEUNGUOIXEM cũ: DN1 hỏi đúng câu ấy,
     và hai chỗ hỏi cùng một câu thì sớm muộn hai chỗ nói khác nhau. */
  const dn = soatDieuNho(d);
  if (!dn.du) return {ok: false, code: 'THIEUDIEUNHO',
    thieu: dn.thieu, camThay: dn.camThay, khuon4: dn.khuon4,
    error: 'Chưa đủ để bắt đầu vẽ. ' +
      (dn.thieu.length ? 'Còn thiếu: ' + dn.hoi.join(' · ') + ' ' : '') +
      (dn.camThay.length
        ? 'Và câu điều nhỏ đang dùng chữ "' + dn.camThay.join('", "') +
          '" — không ai đứng ngoài đo được một cái hiểu, nên cũng không ai ' +
          'kiểm được tấm hình có làm được việc của nó không. '
        : '') +
      'Máy KHÔNG tự điền giúp: điều nhỏ là lời hứa của Học viện với người ' +
      'xem, và một lời hứa máy tự viết thì không ai chịu trách nhiệm được.'};

  /* ── CỔNG TẦNG ĐỨNG TRƯỚC MỌI THỨ KHÁC ── */
  const st = soatTang(tang, noiDung + ' ' + nhiemVu);
  if (!st.qua) return {ok: false, code: st.ma, error: st.vi,
    phamPhai: st.phamPhai, chan: true};

  const id = 'TG-' + tokenMoi().slice(0, 14);
  const luc = new Date().toISOString();

  /* ĐỀ BÀI THIẾT KẾ — thứ máy làm ra thay cho tấm ảnh.
     Đủ chi tiết để một người vẽ hoặc một công cụ bên ngoài làm theo,
     và KHÔNG có một dòng nội dung nào rời khỏi máy chủ Học viện. */
  const deBai = [
    'ĐỀ BÀI THIẾT KẾ · ' + id,
    'Chặng    : ' + tang,
    'Loại hình: ' + loaiHinh,
    'Nhiệm vụ : ' + nhiemVu,
    'Người xem: ' + nx.join(', '),
    'Bố cục   : ' + (String(d.boCuc || '').trim() || '(theo mặc định của loại hình)'),
    'Đặt tại  : ' + (String(d.viTri || '').trim() || '(chưa chọn)'),
    '',
    'NỘI DUNG PHẢI TRUYỀN ĐẠT',
    noiDung,
    '',
    'ĐÃ QUA CỔNG TẦNG: ' + st.vi
  ].concat(luuY.length ? ['', 'LƯU Ý CHO NGƯỜI DUYỆT'].concat(
    luuY.map(x => '· ' + x)) : []).join('\n');

  /* Ý BẮT BUỘC rút MỘT LẦN rồi giữ, không tính lại mỗi lượt vẽ. Cùng
     lý do đã giữ soatTang: sửa cách rút thì mọi tấm cũ đổi nghĩa mà
     không ai biết, và phép đo "tấm có nói đủ ý không" đang neo vào
     chính danh sách này. */
  const yBB = rutYBatBuoc(noiDung);

  await db.prepare(
    'INSERT INTO deXuatThiGiac (id,ban,banTruoc,noiDung,tang,nguoiXem,loaiHinh,' +
    "nhiemVu,dieuNho,thoiDiem,boCuc,viTri,deBai,soatTang,yBatBuoc,trangThai,nguoiDe,deLuc) " +
    "VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,'deXuat',?,?)"
  ).bind(id, Number(d.ban || 1), String(d.banTruoc || '') || null,
    noiDung.slice(0, 4000), tang, JSON.stringify(nx), loaiHinh,
    nhiemVu.slice(0, 300),
    String(d.dieuNho || '').trim().slice(0, 300),
    String(d.thoiDiem || '').trim().slice(0, 200),
    String(d.boCuc || '').slice(0, 200) || null,
    String(d.viTri || '').slice(0, 200) || null, deBai, st.vi,
    JSON.stringify(yBB), hoSo.u, luc).run();

  await Kho.ghiNhatKy(db, {uid: hoSo.uid, username: hoSo.u, viec: 'TG_DEXUAT',
    doiTuong: id, chiTiet: tang + ' · ' + loaiHinh + ' · ' + nhiemVu.slice(0, 80)});

  return {ok: true, id, tang, loaiHinh, nhiemVu, trangThai: 'deXuat', deBai,
    soatTang: st.vi, luuY: luuY.length ? luuY : undefined,
    yBatBuoc: yBB, deNghiLoaiHinh: deNghiLoaiHinh(noiDung),
    vi: 'Đề xuất đã vào sổ ở bậc ĐỀ XUẤT. Máy không đi tiếp một bậc nào ' +
        'nếu chủ hệ chưa bấm.'};
}

/* ═══════════════ ĐI MỘT BẬC ═══════════════ */
export async function chuyenBacThiGiac(y, env, db, hoSo) {
  if (!duocVao(hoSo)) return {ok: false, code: 'NOPERM',
    error: 'Cổng thiết kế mở cho R01–R05.'};

  const x = await db.prepare('SELECT * FROM deXuatThiGiac WHERE id = ?')
    .bind(String(y.id || '')).first();
  if (!x) return {ok: false, error: 'Không tìm thấy đề xuất này.'};

  const den = String(y.den || '').trim();
  const duoc = BAC_TIEP[x.trangThai] || [];
  if (duoc.indexOf(den) < 0)
    return {ok: false, code: 'SAIBAC',
      error: 'Từ bậc "' + x.trangThai + '" chỉ đi được sang: ' +
        (duoc.length ? duoc.join(', ') : '(không đi tiếp được)') +
        '. Không có đường tắt qua một bậc nào.'};

  /* ── DUYỆT VÀ PHÁT HÀNH LÀ QUYỀN CỦA CHỦ HỆ ── */
  if ((den === 'duyet' || den === 'phatHanh') && !laChuHe(hoSo))
    return {ok: false, code: 'CANCHUHE',
      error: 'Chỉ Super Admin duyệt và phát hành. Máy đề xuất, chủ hệ quyết.'};

  /* ── C16: TẤM CÓ NGƯỜI KHÔNG PHÁT HÀNH VỚI Ô CHỜ ──
     Chủ hệ chốt 9.99.27: với loại hình có người, ảnh chụp thật là đường
     DUY NHẤT — không có lối tạm dùng hình vẽ phẳng.
     Chặn ở bậc PHÁT HÀNH chứ không ở bậc duyệt: duyệt là duyệt phần
     chữ, phần bố cục, phần đúng Tầng — những thứ đã xong và đáng duyệt
     trước khi đi đặt ảnh. Chặn sớm hơn thì cả tấm đứng lại chờ một thứ
     chưa ai bắt đầu làm. */
  if (den === 'phatHanh' && CAN_NGUOI.indexOf(x.loaiHinh) >= 0 && !x.anhNguoi)
    return {ok: false, code: 'THIEULOPNGUOI',
      error: 'Tấm "' + x.loaiHinh + '" chưa có LỚP NGƯỜI, nên chưa phát hành ' +
             'được. Luật C16: hình vẽ phẳng không được đứng thay một người, và ' +
             'máy cũng không phát hành một tấm còn ô chờ — một tấm có hình que ' +
             'ở chỗ đáng lẽ là người thì TRÔNG NHƯ ĐÃ XONG, nên không ai đi tìm ' +
             'lớp còn thiếu nữa. Gửi đề bài ra bộ tạo ảnh, hoặc nạp một ảnh đã ' +
             'có văn bản đồng ý vào kho ảnh, rồi phát hành.'};

  /* ── C21: KHÔNG PHÁT HÀNH MỘT TẤM HỆ KHÔNG NÓI ĐƯỢC BẰNG LỜI ──
     Bộ vẽ dựng sẵn câu mô tả từ chính chữ nó đặt lên tấm, và trả về
     trong `moTa`. Chỗ này chỉ đòi câu ấy đã được ghi vào sổ.

     Vì sao chặn ở bậc PHÁT HÀNH chứ không sớm hơn: câu mô tả dựng từ
     bản VẼ RA, mà bản vẽ ra còn đổi tới tận bậc hoàn thiện. Đòi sớm
     là đòi một câu sẽ phải viết lại.

     Vì sao chặn thật chứ không nhắc: một tấm thiếu chữ thay ảnh trông
     y hệt một tấm đủ — với người sáng mắt. Chỗ hỏng chỉ hiện ra với
     đúng người không tự kiểm được, nên nó sẽ không bao giờ được báo
     lại. Máy phải là chỗ bắt. */
  if (den === 'phatHanh' && !String(x.seoAlt || '').trim())
    return {ok: false, code: 'THIEUCHUTHAYANH',
      error: 'Tấm này chưa có CHỮ THAY ẢNH, nên chưa phát hành được (luật ' +
             'C21). Người đọc bằng máy đọc màn hình nghe được đúng một chữ ' +
             '"ảnh", và cả tấm biến mất với họ — mà họ không có cách nào báo ' +
             'lại là mình vừa mất gì. Bộ vẽ đã dựng sẵn câu ấy từ chính chữ ' +
             'nó đặt lên tấm: lấy `moTa` của lượt vẽ và ghi vào bằng cửa ' +
             'ghiChuThayAnh, rồi phát hành.'};

  /* ── TỪ CHỐI PHẢI NÓI VÌ SAO ──
     Một lượt từ chối không lý do thì lần sau máy đề xuất y hệt, và
     người từ chối phải nói lại cùng một câu tới lần thứ mười. */
  const lyDo = String(y.lyDo || '').trim();
  if (den === 'tuChoi' && lyDo.length < 10)
    return {ok: false, code: 'THIEULYDO',
      error: 'Từ chối thì phải nói vì sao. Không nói thì lần sau máy đề xuất ' +
             'y hệt, và câu từ chối ấy phải nói lại mãi.'};

  const luc = new Date().toISOString();
  const r = await db.prepare(
    'UPDATE deXuatThiGiac SET trangThai = ?, nguoiDuyet = ?, duyetLuc = ?, ' +
    'lyDo = COALESCE(?, lyDo) WHERE id = ? AND trangThai = ?'
  ).bind(den, hoSo.u, luc, lyDo || null, x.id, x.trangThai).run();
  if (!((r && r.meta && r.meta.changes) || 0))
    return {ok: false, error: 'Đề xuất vừa đổi bậc ở chỗ khác. Mở lại rồi thử tiếp.'};

  await Kho.ghiNhatKy(db, {uid: hoSo.uid, username: hoSo.u, viec: 'TG_BAC',
    doiTuong: x.id, chiTiet: x.trangThai + ' → ' + den + (lyDo ? ' · ' + lyDo.slice(0, 150) : '')});
  return {ok: true, id: x.id, tu: x.trangThai, den,
    keTiep: BAC_TIEP[den] || [],
    vi: den === 'phatHanh'
      ? 'Đã phát hành. Từ đây sửa là ghi một BẢN MỚI, không ghi đè — tấm này ' +
        'có thể đã ở trong tay khách.'
      : 'Đã sang bậc ' + den + '.'};
}

/* ═══════════════ SỬA MỘT BẢN ĐÃ DUYỆT = GHI BẢN MỚI ═══════════════ */
export async function banMoiThiGiac(y, env, db, hoSo) {
  if (!duocVao(hoSo)) return {ok: false, code: 'NOPERM',
    error: 'Cổng thiết kế mở cho R01–R05.'};

  const cu = await db.prepare('SELECT * FROM deXuatThiGiac WHERE id = ?')
    .bind(String(y.id || '')).first();
  if (!cu) return {ok: false, error: 'Không tìm thấy bản gốc.'};

  /* ══ CỔNG CÓ RĂNG CỦA PHẦN 5 ══
     docGopY chỉ ĐỌC — nó nói ra chỗ xé bảng nhận diện nhưng không chặn
     được gì, vì nó không ghi. Chỗ ghi là ĐÂY: bản mới sinh ra từ góp ý,
     nên góp ý xé bảng nhận diện thì bản mới không được sinh.

     Đặt cổng ở chỗ ĐỌC thôi là cổng cảnh báo, không phải cổng. Người ta
     đọc lời cảnh báo, thấy hợp lý với tấm này, rồi vẫn bấm sửa — và mỗi
     lần nhân nhượng đều hợp lý ở tấm ấy. Mười lần thì bảng nhận diện
     không còn, mà không ai quyết định bỏ nó cả. */
  const gopY = String(y.gopY || '').trim();
  if (gopY) {
    const g = vaGopY(gopY);
    if (g.tuChoi.length) return {ok: false, code: 'XEADN',
      tuChoi: g.tuChoi,
      error: 'Góp ý đang xin đổi thứ không mở: ' +
        g.tuChoi.map(t => t.adn.join('·')).join(' · ') + '. Mấy dòng ấy là ' +
        'thứ duy nhất giữ cho hai trăm tấm trông như của MỘT nhà — một tấm ' +
        'lệch thì không ai để ý, mười tấm lệch thì không còn bộ nhận diện ' +
        'nào cả. Anh chị bỏ phần ấy ra rồi gửi lại giúp em ạ; phần góp ý ' +
        'còn lại em vá được ngay.'};
  }

  const d = y.deXuat || {};
  /* Bản mới thừa hưởng mọi ô bản cũ, người sửa chỉ gửi ô nào đổi. Bắt
     gửi lại tất cả là cách chắc nhất để một ô bị gõ lại sai. */
  const moi = {
    noiDung: d.noiDung !== undefined ? d.noiDung : cu.noiDung,
    tang: d.tang !== undefined ? d.tang : cu.tang,
    loaiHinh: d.loaiHinh !== undefined ? d.loaiHinh : cu.loaiHinh,
    nhiemVu: d.nhiemVu !== undefined ? d.nhiemVu : cu.nhiemVu,
    boCuc: d.boCuc !== undefined ? d.boCuc : cu.boCuc,
    viTri: d.viTri !== undefined ? d.viTri : cu.viTri,
    nguoiXem: d.nguoiXem !== undefined ? d.nguoiXem : JSON.parse(cu.nguoiXem || '[]'),
    /* Hai ô của cổng Điều Nhỏ cũng phải thừa hưởng. Quên chúng thì mọi
       bản SỬA đều bị chính cổng ấy chặn — dù người sửa chỉ đổi bố cục.
       Bộ thử bắt ngay lần chạy đầu sau khi dựng cổng. */
    dieuNho: d.dieuNho !== undefined ? d.dieuNho : cu.dieuNho,
    thoiDiem: d.thoiDiem !== undefined ? d.thoiDiem : cu.thoiDiem,
    ban: Number(cu.ban) + 1, banTruoc: cu.id
  };
  const ra = await deXuatThiGiac({deXuat: moi}, env, db, hoSo);
  /* Trả SỐ BẢN thành một ô riêng, không chỉ nhét vào câu `vi`. Bắt người
     gọi đọc số ra từ một câu văn là bắt họ dò chuỗi, và câu văn thì đổi
     lúc nào cũng được — lúc ấy chỗ dò đứt mà không báo gì. */
  if (ra.ok) {
    ra.ban = moi.ban;
    ra.banTruoc = cu.id;
    ra.vi = 'Bản ' + moi.ban + ', sửa từ ' + cu.id +
      '. Bản cũ Ở LẠI NGUYÊN — không bản nào bị ghi đè.';
  }
  return ra;
}

/* ═══════════════ CHẤM THANG ĐIỂM MỘT TRĂM ═══════════════ */
export async function chamThiGiac(y, env, db, hoSo) {
  if (!duocVao(hoSo)) return {ok: false, code: 'NOPERM',
    error: 'Cổng thiết kế mở cho R01–R05.'};

  const x = await db.prepare('SELECT * FROM deXuatThiGiac WHERE id = ?')
    .bind(String(y.id || '')).first();
  if (!x) return {ok: false, error: 'Không tìm thấy đề xuất này.'};

  const cham = y.cham || {};
  const thieu = Object.keys(TRONG_DIEM).filter(k => {
    const v = Number(cham[k]);
    return isNaN(v) || v < 0 || v > 100;
  });
  if (thieu.length) return {ok: false,
    error: 'Thiếu hoặc sai điểm (0–100) ở: ' + thieu.join(', ') + '. ' +
           'Chấm thiếu một mục rồi cộng lại là ra một con số không nói gì.'};

  /* ══ TRỪ ĐIỂM THÌ PHẢI CHỈ RA CHỖ TRỪ ══
     Bản đặc tả GIDA phần 7: "kẻ chấm phải có lý" — mỗi mục bị trừ phải
     kèm BẰNG CHỨNG nhìn thấy được trên tấm.

     Vì sao bắt buộc: một mục chấm 60 không kèm bằng chứng thì người vẽ
     không biết sửa gì. Họ vẽ lại bằng cảm giác, lượt sau lại 60, và cả
     hai bên cùng mất một vòng. Con số không có chỗ trỏ thì nó là một
     lời chê, không phải một phép chấm. */
  const NGUONG_CHUNG_CU = 80;
  const chungCu = y.chungCu || {};
  const thieuCC = Object.keys(TRONG_DIEM).filter(k =>
    Number(cham[k]) < NGUONG_CHUNG_CU &&
    String(chungCu[k] || '').trim().length < 20);
  if (thieuCC.length) return {ok: false, code: 'THIEUCHUNGCU', thieu: thieuCC,
    error: 'Mục chấm dưới ' + NGUONG_CHUNG_CU + ' phải chỉ ra CHỖ TRỪ trên tấm: ' +
      thieuCC.join(', ') + '. Một con số không có chỗ trỏ thì người vẽ không ' +
      'biết sửa gì — họ vẽ lại bằng cảm giác, lượt sau lại đúng số ấy, và cả ' +
      'hai bên cùng mất một vòng.'};

  let tong = 0;
  const tung = {};
  for (const k of Object.keys(TRONG_DIEM)) {
    const d = Number(cham[k]);
    tung[k] = {diem: d, trong: TRONG_DIEM[k], gop: d * TRONG_DIEM[k] / 100};
    if (String(chungCu[k] || '').trim()) tung[k].chungCu = String(chungCu[k]).trim().slice(0, 400);
    tong += tung[k].gop;
  }
  tong = Math.round(tong * 10) / 10;
  const bac = (BAC_DIEM.find(b => tong >= b.tu) || BAC_DIEM[BAC_DIEM.length - 1]).ten;

  /* ══ CHỐNG TỰ KHEN ══
     Bản đặc tả gọi là Anti-Self-Love Guard: chống trôi về chỗ "ảnh nào
     cũng chín điểm".

     Một thang chấm mà mọi tấm đều qua thì nó không còn là thang chấm —
     nó là một con dấu. Và chuyện ấy trôi rất êm: không ai quyết định
     hạ chuẩn, chỉ là mỗi lần chấm lại dễ hơn lần trước một chút.

     Máy KHÔNG tự kết luận đây là tự khen: mười tấm tốt liên tiếp có thể
     là đội vẽ đang lên tay thật. Nên máy làm đúng phần của máy — ĐẾM,
     rồi CHẶN cho tới khi người chấm viết ra một câu. Câu ấy ở lại trong
     sổ. Cùng luật L-02 của bảng lương: máy không cắt và cũng không tha. */
  const NGUONG_CAO = 90, SOAT_GAN = 10, TRAN_CAO = 8;
  let canhTuKhen = null;
  if (tong >= NGUONG_CAO) {
    const gan = await db.prepare(
      'SELECT diem FROM deXuatThiGiac WHERE diem IS NOT NULL AND id <> ? ' +
      'ORDER BY deLuc DESC LIMIT ?').bind(x.id, SOAT_GAN).all();
    const ds = ((gan && gan.results) || []).map(r => Number(r.diem));
    const soCao = ds.filter(v => v >= NGUONG_CAO).length;
    if (ds.length >= SOAT_GAN && soCao >= TRAN_CAO) {
      const lyDo = String(y.lyDoCao || '').trim();
      if (lyDo.length < 20) return {ok: false, code: 'TUKHEN',
        soCao, tren: ds.length,
        error: soCao + '/' + ds.length + ' lượt chấm gần nhất đều từ ' +
          NGUONG_CAO + ' điểm trở lên, và lượt này cũng vậy. Máy KHÔNG kết luận ' +
          'đây là chấm dễ — đội vẽ lên tay thật thì cũng ra đúng con số ấy. ' +
          'Nhưng một thang chấm mà mọi tấm đều qua thì nó là một con dấu, ' +
          'không phải một thang chấm. Viết một câu: vì sao loạt này cao, và ' +
          'câu ấy ở lại trong sổ.'};
      /* `hoSo.u` chứ không phải `hoSo.username`. Hồ sơ phiên ở kho này
         mang tên ô là `u`; gõ `username` thì JavaScript không báo gì cả,
         nó trả undefined và câu giải thích ở lại trong sổ mà KHÔNG có tên
         người viết — tức là mất đúng nửa có giá trị của phép ghi này.
         Bộ thử bắt được vì nó đòi đúng tên, không đòi "có ô boiAi". */
      canhTuKhen = {soCao, tren: ds.length, lyDo: lyDo.slice(0, 400),
        boiAi: hoSo.u};
    }
  }
  if (canhTuKhen) tung._tuKhen = canhTuKhen;

  await db.prepare(
    'UPDATE deXuatThiGiac SET diem = ?, bacDiem = ?, chamChiTiet = ? WHERE id = ?'
    /* GHI SỐ THẬT, không Math.round. Bậc tính trên số lẻ mà sổ ghi số
       tròn thì sổ tự cãi mình: 89,9 vào bậc "Sửa lại" nhưng ghi xuống là
       90 — đúng bằng ngưỡng của bậc "Đạt". Chạy demo tấm tầm nhìn mới
       lộ, vì mọi bài thử cũ đều chấm ra số chẵn. */
  ).bind(tong, bac, JSON.stringify(tung), x.id).run();

  return {ok: true, id: x.id, diem: tong, bac, tung,
    /* Mục D1 nặng 25 — gấp hai rưỡi mục THẨM MỸ. Nói ra để người chấm
       biết chỗ nào đáng cãi nhau. */
    vi: 'Đúng hệ thống nặng 25 điểm, thẩm mỹ 10. Một tấm rất đẹp mà sai Tầng ' +
        'thì tệ hơn một tấm xấu mà đúng — tấm đẹp được tin, và cái sai đi theo ' +
        'nó xa hơn.'};
}

/* ═══════════════ SỔ LUẬT THƯƠNG HIỆU — BỘ NHỚ DÀI HẠN ═══════════════ */
export async function ghiLuatThuongHieu(y, env, db, hoSo) {
  if (!laChuHe(hoSo)) return {ok: false, code: 'NOPERM',
    error: 'Chỉ Super Admin ghi được luật thương hiệu. Máy đề xuất, chủ hệ quyết.'};

  const l = y.luat || {};
  const nhom = String(l.nhom || '').trim();
  const luat = String(l.luat || '').trim();
  const vi = String(l.vi || '').trim();
  if (['mau', 'chu', 'bocuc', 'giong', 'anh', 'khac'].indexOf(nhom) < 0)
    return {ok: false, error: 'Nhóm phải là: mau, chu, bocuc, giong, anh, khac.'};
  if (luat.length < 10) return {ok: false, error: 'Luật quá ngắn.'};

  /* ── MỘT LUẬT KHÔNG CÓ LÝ DO SẼ BỊ GỠ ──
     Sáu tháng sau không ai nhớ vì sao cấm, và người sau gỡ ra vì nó
     đang cản việc họ. Lý do là thứ giữ luật sống. */
  if (vi.length < 15) return {ok: false, code: 'THIEUVI',
    error: 'Luật phải kèm LÝ DO. Không có lý do thì sáu tháng sau người ta gỡ ' +
           'nó ra, vì không ai biết gỡ thì hỏng gì.'};

  const id = 'LTH-' + tokenMoi().slice(0, 14);
  await db.prepare(
    'INSERT INTO luatThuongHieu (id,nhom,luat,vi,hieuLuc,boiAi,ghiLuc) ' +
    'VALUES (?,?,?,?,?,?,?)'
  ).bind(id, nhom, luat.slice(0, 500), vi.slice(0, 800),
    l.hieuLuc === 'tamThoi' ? 'tamThoi' : 'vinhVien', hoSo.u,
    new Date().toISOString()).run();

  await Kho.ghiNhatKy(db, {uid: hoSo.uid, username: hoSo.u, viec: 'TG_LUAT',
    doiTuong: id, chiTiet: nhom + ' · ' + luat.slice(0, 120)});
  return {ok: true, id, nhom, vi: 'Luật này ở lại, và mọi đề xuất sau đọc nó trước.'};
}

/* ═══════════════ KHO HÌNH VÀ SỔ LUẬT ═══════════════ */
export async function khoThiGiac(y, env, db, hoSo) {
  if (!duocVao(hoSo)) return {ok: false, code: 'NOPERM',
    error: 'Cổng thiết kế mở cho R01–R05.'};

  const loc = [], dv = [];
  if (y.tang) { loc.push('tang = ?'); dv.push(String(y.tang)); }
  if (y.trangThai) { loc.push('trangThai = ?'); dv.push(String(y.trangThai)); }
  const r = await db.prepare(
    'SELECT * FROM deXuatThiGiac' + (loc.length ? ' WHERE ' + loc.join(' AND ') : '') +
    ' ORDER BY deLuc DESC LIMIT 200').bind(...dv).all();

  const ds = (r.results || []).map(x => ({
    id: x.id, ban: x.ban, banTruoc: x.banTruoc || undefined,
    tang: x.tang, loaiHinh: x.loaiHinh, nhiemVu: x.nhiemVu,
    /* Bộ vẽ trong máy (src/ve-thi-giac.js) đặt chữ từ chính ô này. Trước
       9.99.13 sổ không trả noiDung, và cách duy nhất để lấy lại chữ là
       bóc ngược từ deBai — bóc ngược một chuỗi đã ghép là chỗ hỏng chờ
       sẵn, vì chỉ cần đổi một dòng tiêu đề trong deBai là bóc sai. */
    noiDung: x.noiDung,
    nguoiXem: JSON.parse(x.nguoiXem || '[]'),
    boCuc: x.boCuc || undefined, viTri: x.viTri || undefined,
    deBai: x.deBai, soatTang: x.soatTang || undefined,
    /* Ý BẮT BUỘC phải đi cùng bản ghi tới bộ vẽ, nếu không phép soát ý
       ở bộ vẽ đọc ra danh sách rỗng và báo "ĐỦ" cho mọi tấm — một phép
       đo luôn xanh thì không phải phép đo. Chỗ này đã đúng như thế ở
       lượt chạy thử đầu tiên: cả tấm đủ ý lẫn tấm cố tình thiếu hai
       khối đều xanh. */
    yBatBuoc: x.yBatBuoc || undefined,
    diem: x.diem === null ? null : Number(x.diem), bacDiem: x.bacDiem || undefined,
    trangThai: x.trangThai, nguoiDe: x.nguoiDe, deLuc: x.deLuc,
    nguoiDuyet: x.nguoiDuyet || undefined, lyDo: x.lyDo || undefined,
    keTiep: BAC_TIEP[x.trangThai] || []}));

  const lt = await db.prepare(
    'SELECT * FROM luatThuongHieu WHERE goLuc IS NULL ORDER BY ghiLuc DESC LIMIT 100').all();

  const dem = {};
  for (const x of ds) dem[x.trangThai] = (dem[x.trangThai] || 0) + 1;

  return {ok: true, so: ds.length, dem, ds,
    luatThuongHieu: (lt.results || []).map(x => ({id: x.id, nhom: x.nhom,
      luat: x.luat, vi: x.vi, hieuLuc: x.hieuLuc, boiAi: x.boiAi, ghiLuc: x.ghiLuc})),
    loaiHinh: LOAI_HINH, nguoiXem: NGUOI_XEM, thuTuTang: THU_TU_TANG,
    bacTiep: BAC_TIEP,
    vi: 'Không bản nào bị ghi đè. Sửa một bản đã duyệt là ghi một bản mới trỏ ' +
        'về bản cũ, nên dựng lại được đúng thứ khách đã nhìn thấy.'};
}

export { soatTang, CAM_THEO_TANG, THU_TU_TANG, LOAI_HINH, NGUOI_XEM,
  BAC_TIEP, TRONG_DIEM, BAC_DIEM };

/* ═══════════════════════════════════════════════════════════════
   PHẦN HAI — ĐỌC TÀI LIỆU, VÀ CỬA ĐI RA NGOÀI
   Chốt của chủ hệ thống bản 9.99.11.
   ═══════════════════════════════════════════════════════════════ */

/* ══ ĐỌC MỘT TÀI LIỆU RỒI CHỈ RA CHỖ NÊN THÀNH HÌNH ══

   ══ NÓI THẲNG NÓ ĐỌC ĐƯỢC GÌ ══

   Nó đọc CHỮ. Không đọc PDF, không đọc DOCX, không đọc PPTX — mở được
   ba định dạng ấy cần một thư viện tải từ mạng ngoài, mà chính sách nội
   dung của bản web chặn mọi nguồn ngoài, và nới ra để đọc một tệp là
   nới cho mọi thứ khác đi qua cùng cái lỗ.

   Nên đường dùng là: mở tài liệu bằng phần mềm sẵn có, chọn hết, dán
   chữ vào. Mất mười giây, và không phải nới một lỗ nào.

   ══ VÀ NÓ KHÔNG ĐỘNG VÀO NỘI DUNG ══

   Nó chỉ NÓI chỗ nào nên thành hình gì. Sửa chữ của một tài liệu đã
   được duyệt là việc của người viết, không phải của máy — bản đặc tả
   của chủ hệ nói đúng chỗ này, và nó là chỗ dễ vượt nhất. */

const DAU_HIEU = [
  {loai: 'QUY_TRINH', dau: ['bước 1', 'bước 2', 'bước một', 'đầu tiên', 'sau đó',
    'tiếp theo', 'cuối cùng'], vi: 'đoạn kể một chuỗi bước có thứ tự'},
  {loai: 'BANDO_HANHTRINH', dau: ['ngày 1', 'ngày 7', 'ngày 21', 'ngày 90',
    'tuần 1', 'chặng', 'lộ trình', 'hành trình'], vi: 'đoạn nói về một quãng thời gian có mốc'},
  {loai: 'SO_SANH_TANG', dau: ['so với', 'khác nhau', 'trong khi', 'còn tầng',
    'chặng nào'], vi: 'đoạn đặt hai thứ cạnh nhau'},
  {loai: 'DANH_SACH_VIEC', dau: ['cần làm', 'phải làm', 'danh sách', 'checklist',
    'gồm:', 'bao gồm'], vi: 'đoạn liệt kê việc'},
  {loai: 'CONG', dau: ['điều kiện', 'đạt khi', 'nghiệm thu', 'qua được', 'tiêu chí'],
    vi: 'đoạn nêu điều kiện qua chặng'},
  {loai: 'VAI_TRO', dau: ['phụ huynh', 'học viên', 'coach', 'ai làm', 'trách nhiệm'],
    vi: 'đoạn chia việc cho từng người'},
  {loai: 'MOT_SO', dau: ['%', 'phần trăm', 'trung bình', 'tỷ lệ'],
    vi: 'đoạn xoay quanh một con số'},
  {loai: 'NHIP', dau: ['mỗi ngày', 'mỗi tuần', 'hằng ngày', 'hằng tuần', 'chu kỳ',
    'nhịp'], vi: 'đoạn mô tả một nhịp lặp lại'}
];

export async function docTaiLieuThiGiac(y, env, db, hoSo) {
  if (!duocVao(hoSo)) return {ok: false, code: 'NOPERM',
    error: 'Cổng thiết kế mở cho R01–R05.'};

  const chu = String(y.chu || '');
  if (chu.length < 200) return {ok: false,
    error: 'Dán ít nhất hai trăm chữ. Ngắn hơn thì chưa có gì để chia đoạn, và ' +
           'một bản phân tích trên ba dòng chữ là một bản đoán.'};
  if (chu.length > 200000) return {ok: false,
    error: 'Dài quá hai trăm nghìn chữ. Cắt làm mấy phần rồi dán từng phần.'};

  const tang = String(y.tang || '').trim().toUpperCase();
  if (THU_TU_TANG.indexOf(tang) < 0) return {ok: false,
    error: 'Khai tài liệu này thuộc chặng nào: ' + THU_TU_TANG.join(', ') + '. ' +
           'Máy KHÔNG đoán hộ — đoán Tầng là chỗ sai im lặng nhất, và cả bản phân ' +
           'tích sau đó dựng trên một cái đoán.'};

  /* Cắt theo DÒNG TRỐNG, không cắt theo số ký tự: dòng trống là chỗ
     người viết đã tự chia ý, và cắt theo số ký tự thì cắt ngang câu. */
  const doan = chu.split(/\n\s*\n/).map(x => x.trim()).filter(x => x.length > 40);
  if (!doan.length) return {ok: false,
    error: 'Không tách được đoạn nào. Tài liệu cần có dòng trống giữa các ý — ' +
           'dòng trống là chỗ người viết đã tự chia ý, và máy chia theo đó.'};

  const viTri = [];
  const phamTang = [];
  doan.forEach((d, i) => {
    const t = boDau(d);
    /* CỔNG TẦNG CHẠY TRÊN TỪNG ĐOẠN. Một tài liệu khai T1 mà có một
       đoạn nói về thứ chỉ tầng cao mới có thì chính đoạn ấy là chỗ
       hỏng, và nêu số đoạn thì người sửa tìm được ngay. */
    const pham = (CAM_THEO_TANG[tang] || []).filter(k => t.indexOf(boDau(k)) >= 0);
    if (pham.length) phamTang.push({doan: i + 1, pham,
      trich: d.slice(0, 120)});

    const trung = DAU_HIEU.map(h => ({
      loai: h.loai, vi: h.vi,
      diem: h.dau.filter(k => t.indexOf(boDau(k)) >= 0).length
    })).filter(x => x.diem > 0).sort((a, b) => b.diem - a.diem);

    if (trung.length) viTri.push({doan: i + 1, soChu: d.length,
      trich: d.slice(0, 100),
      /* CHỈ NÊU MỘT loại, không nêu cả danh sách. Nêu ba lựa chọn cho
         mỗi đoạn thì người đọc phải tự chọn ở ba mươi chỗ, và bản phân
         tích thành một danh sách việc thay vì một đề nghị. */
      nen: trung[0].loai, vi: trung[0].vi, chac: trung[0].diem});
  });

  await Kho.ghiNhatKy(db, {uid: hoSo.uid, username: hoSo.u, viec: 'TG_DOCTL',
    doiTuong: tang, chiTiet: doan.length + ' đoạn · ' + viTri.length + ' chỗ nên có hình'});

  return {ok: true, tang, soDoan: doan.length, soChu: chu.length,
    viTri: viTri.slice(0, 60),
    phamTang,
    /* Một tài liệu ba mươi trang mà chỗ nào cũng nên có hình thì đề
       nghị ấy vô dụng. Nói ra tỷ lệ để người đọc tự thấy. */
    tyLe: doan.length ? Math.round(viTri.length / doan.length * 100) : 0,
    canhBao: viTri.length > doan.length * 0.5
      ? 'Hơn nửa số đoạn được đề nghị làm hình. Tỷ lệ ấy gần như luôn có nghĩa là ' +
        'dấu hiệu bắt quá rộng, không phải tài liệu cần nhiều hình đến thế. Chọn ' +
        'lấy năm bảy chỗ đắt nhất.'
      : '',
    vi: 'Máy CHỈ nói chỗ nào nên thành hình gì. Nó không sửa một chữ nào của tài ' +
        'liệu — sửa nội dung đã duyệt là việc của người viết.'};
}

/* ══ BẢN CHÉP BẢNG MÀU — GỐC Ở KHO, KHÔNG PHẢI Ở ĐÂY ══

   Bản gốc là G.BRAND.mau trong kho đã mã hoá. Máy chủ không đọc được
   kho ấy, nên phải giữ một bản chép — cùng lý do đã buộc GIA_TANG có
   bản chép từ 9.94.

   Vì sao bảng màu phải đi ra được, trong khi nội dung thì không: một
   bộ tạo ảnh KHÔNG ĐOÁN ĐƯỢC màu của một thương hiệu nó chưa từng
   thấy. Không nói màu thì nó tự chọn, và thứ về là một tấm hình đẹp
   của một thương hiệu khác. Còn nội dung thì nó không cần để vẽ.

   Bộ kiểm mục 76 đối chiếu TỪNG Ô bảng này với G.BRAND.mau. Lệch một
   ô nghĩa là hình đặt ngoài về sai màu mà không ai nhìn ra, vì hai
   bên vẫn gọi cùng một tên màu. */
export const MAU_RA = [
  {k: 'Vàng GITA',       hex: '#F5B942'},
  {k: 'Cam lửa',         hex: '#FF7A45'},
  {k: 'Đêm sâu',         hex: '#070510'},
  {k: 'T1 · Xanh dương', hex: '#3B82F6'},
  {k: 'T2 · Tím',        hex: '#8B5CF6'},
  {k: 'T3 · Lam',        hex: '#06B6D4'},
  {k: 'T4 · Lục',        hex: '#10B981'},
  {k: 'T5 · Hổ phách',   hex: '#F59E0B'},
  {k: 'Hồng nhắc',       hex: '#FB7185'}
];

/* Bộ vẽ trong máy dựng hình theo luật hình học. Bộ tạo ảnh ngoài làm
   đúng thứ bộ vẽ trong máy KHÔNG làm được: người như ảnh chụp, chất
   liệu, ánh sáng thật. Nên đề bài đi ra phải nói về những thứ ấy —
   nói lại bố cục ô lưới là bảo nó làm hộ việc trong máy đã làm tốt
   hơn. */
const KIEU_RA = {
  BIA:            'Một khuôn hình lớn, một câu duy nhất. Bối cảnh mở, chiều sâu rõ.',
  MOT_SO:         'Một con số là chủ thể. Xung quanh để trống, không thêm đồ vật.',
  BANDO_HANHTRINH:'Đường đi từ gần ra xa, có mốc. Nhìn từ trên chếch xuống.',
  KHUNG:          'Một khung cảnh tĩnh, người ở tư thế nghỉ, không nhìn thẳng ống kính.',
  SO_SANH_TANG:   'Nhiều lớp cao dần, phân biệt bằng sắc độ chứ không bằng đường kẻ.',
  QUY_TRINH:      'Chuyển động một chiều, trái sang phải.',
  TRUOC_SAU:      'Hai nửa cùng một chỗ, cùng góc máy, khác ánh sáng.',
  VAI_TRO:        'Chân dung nửa người, ánh sáng bên, phông đơn sắc.',
  DANH_SACH_VIEC: 'Bàn làm việc nhìn từ trên xuống, đồ vật thật.',
  CONG:           'Một lối đi có cửa, ánh sáng phía bên kia.',
  NHIP:           'Lặp lại một hình theo nhịp đều, đổi dần một thuộc tính.',
  BANG_DIEU_KHIEN:'Màn hình sáng trong phòng tối, người ngồi trước nó.',
  /* Hai loại cần người: đề bài KHÔNG mô tả khối chữ, vì lớp chữ do máy
     đặt lên sau (C14). Nói cả bố cục chữ ở đây là bảo bộ tạo ảnh làm
     hộ việc máy đã làm chính xác hơn — và nó sẽ nướng chữ sai dấu vào
     ảnh, không gỡ ra được. */
  AP_PHICH:       'Người đứng hoặc ngồi lệch MỘT BÊN khung, thân hướng vào ' +
                  'giữa. NỬA KIA ĐỂ TRỐNG — chỉ bối cảnh mờ, không đồ vật ' +
                  'nổi, không chữ. Đó là chỗ máy đặt khối chữ lên sau.',
  CHAN_DUNG:      'Nửa người, chính diện hơi lệch, phông đơn sắc mờ. Chừa ' +
                  'khoảng trống dưới ngực để máy đặt tên vai.'
};

/* ══ ĐỀ BÀI VỀ NGƯỜI ══

   Chỗ này quyết định ảnh về đẹp hay hỏng, nên nó dài, và mỗi dòng có
   lý do đứng sau.

   Luật C13 cho phép người do AI biên soạn và ĐÒI nói rõ điều ấy: không
   nói thì bộ tạo ảnh lấy nét của người nó thấy nhiều nhất, mà người nó
   thấy nhiều nhất là người nổi tiếng. */
/* Đề bài phải nói MẤY NGƯỜI, và điều đó đọc từ NGƯỜI XEM chứ không
   đoán. Bản đầu tả cứng "một người trưởng thành" cho mọi tấm — nên một
   áp phích cho CẢ NHÀ vẫn xin về ảnh một người ngồi một mình, tức là
   tấm nói về gia đình mà trong khung không có gia đình nào.

   Ai trong khung là một quyết định biên tập, không phải một chi tiết:
   người xem thấy mình trong ảnh thì mới đọc tiếp. */
function nguoiRa(nx) {
  const caNha = nx.indexOf('GIADINH') >= 0;
  return [
    'NGƯỜI TRONG ẢNH:',
    '· Do AI biên soạn hoàn toàn. KHÔNG dựng theo bất kỳ người có thật ' +
      'nào, không giống một người nổi tiếng nào. Đây là điều kiện bắt ' +
      'buộc, không phải một lời khuyên.',
    caNha
      ? '· HAI người trưởng thành người Việt, 35–45 tuổi — một bố một mẹ ' +
        'ngồi cạnh nhau, cùng hướng về một chỗ. Vai gần nhau, không ôm, ' +
        'không tạo dáng chụp ảnh gia đình.'
      : '· MỘT người trưởng thành, người Việt, 25–40 tuổi.',
    /* Vì sao một tấm về gia đình lại KHÔNG có đứa trẻ trong khung —
       nói thẳng trong đề bài, để bên nhận không tự thêm vào. */
    '· KHÔNG trẻ em, KHÔNG thiếu niên trong khung — luật C13, không ' +
      'ngoại lệ. Một gia đình trong ảnh của Học viện là BỐ MẸ: đứa trẻ ' +
      'là người tấm hình nói VỀ, không phải người đứng trong khung. ' +
      'Ảnh trẻ em phải có văn bản đồng ý của cha mẹ và của chính trẻ từ ' +
      'bảy tuổi, mà một khuôn mặt sinh ra thì không có ai để xin phép.',
    '· Trang phục lịch sự, chỉnh tề, tay áo dài. Không hở, không bó sát, ' +
      'không đồ hiệu nhận ra được.',
    caNha
      ? '· Nét mặt: bình thản, ấm, hơi lo nhưng đã yên tâm — đây là hai ' +
        'người vừa quyết một việc cho con. Cười khép miệng. Không cười ' +
        'hở lợi, không tạo dáng.'
      : '· Nét mặt: bình thản, ấm, mắt nhìn thẳng người xem hoặc nhìn hơi ' +
        'chếch. Cười khép miệng. Không cười hở lợi, không tạo dáng.',
    caNha
      ? '· Dáng: ngồi ở bàn nhà mình, trước mặt là giấy tờ đã mở. Đang ' +
        'ĐỌC, không đang chụp ảnh. Không khoanh tay, không giơ ngón cái.'
      : '· Dáng: ngồi hoặc đứng làm việc thật — không khoanh tay, không ' +
        'giơ ngón cái, không chỉ vào chỗ trống.',
    '· Ảnh chụp thật: da có kết cấu, tóc có sợi rời, ánh sáng bên mềm, ' +
      'nền xoá phông nhẹ. KHÔNG làm mịn da tới mức nhựa.',
    '· TUYỆT ĐỐI KHÔNG CHỮ trong ảnh, không dấu hiệu thương hiệu nào, ' +
      'không bảng, không biển, không màn hình có chữ. Mọi chữ do hệ đặt ' +
      'lên sau; chữ nướng sẵn trong ảnh thì sai dấu tiếng Việt và không ' +
      'gỡ ra được.'
  ].join('\n');
}

/* ══ BỐI CẢNH (9.99.37) ══

   Đề bài tới 9.99.36 tả người rồi nói "nền xoá phông nhẹ" — tức là
   đặt một người trước một khoảng mờ. Tấm mẫu chủ hệ gửi KHÔNG phải
   thế: nó là cả một cảnh có chiều sâu — bàn làm việc, sách xếp chồng,
   máy tính, chậu cây, kệ phía sau, ánh sáng cửa sổ. Chính mấy thứ ấy
   làm tấm ra "ảnh chụp một nơi có thật" thay vì "một người bị cắt rời
   dán lên nền mờ".

   Nên tả cảnh, và tả bằng thứ đo được: nguồn sáng ở đâu, tiêu cự bao
   nhiêu, vật nào ở lớp nào. Ba con số ấy quyết định tấm ra trông như
   ảnh chụp hay như hình dựng — nói "ánh sáng đẹp" thì mỗi lượt sinh
   ra một kiểu.

   VÀ VẪN KHÔNG MỘT CHỮ NÀO. Cảnh càng nhiều đồ thì bộ tạo ảnh càng
   hay tự viết chữ lên gáy sách, lên màn hình, lên biển hiệu — nên
   điều cấm ấy nhắc lại ở đây, ngay cạnh danh sách đồ vật. */
function boiCanhRa(x) {
  const t = Number(String(x.tang || '').replace(/[^0-9]/g, '')) || 1;
  return [
    'BỐI CẢNH — cảnh thật có chiều sâu, không phải nền mờ sau một người:',
    '· Nơi chốn: một phòng làm việc sáng, sạch, hiện đại và ẤM — gỗ ' +
      'nhạt, tường sáng, cây xanh thật. Không phòng họp lạnh, không ' +
      'phông studio trơn, không nền gradient.',
    '· LỚP TRƯỚC (rõ nét): mặt bàn gỗ, vài quyển sách xếp chồng, một ' +
      'quyển sổ mở, bút đặt ngang, một chậu cây nhỏ. Đồ vật đặt như ' +
      'người vừa dùng xong, không xếp thẳng hàng như bày mẫu.',
    '· LỚP GIỮA: người, chiếm khoảng một phần ba khung theo chiều ngang.',
    '· LỚP SAU (mờ mềm): kệ sách, cửa sổ lớn lấy sáng, vài chậu cây. ' +
      'Mờ đủ để không ai đọc ra chi tiết, rõ đủ để biết đó là một căn phòng.',
    '· Ánh sáng: nguồn chính từ cửa sổ bên trái, mềm và rộng; một nguồn ' +
      'phụ rất nhẹ bên phải để mép người không chìm vào nền. Không đèn ' +
      'flash thẳng mặt, không hai bóng đổ ngược nhau.',
    '· Ống kính: 50mm, khẩu f/2.8 — xoá phông vừa phải, còn đọc được ' +
      'căn phòng. Không xoá tan thành một vệt màu.',
    t >= 4
      ? '· Sắc chung: mát và trong, thiên xanh nhạt — chặng này nói về ' +
        'hệ thống đã chạy, nên cảnh phải gọn gàng, ngăn nắp.'
      : '· Sắc chung: ấm và sáng, thiên vàng nhạt — chặng đầu nói về ' +
        'chỗ bắt đầu, nên cảnh phải dễ gần, không nghiêm trang quá.',
    '· NHẮC LẠI VÌ CẢNH CÀNG NHIỀU ĐỒ THÌ CÀNG DỄ SAI: không một chữ ' +
      'nào trên gáy sách, trên màn hình, trên biển, trên hộp. Không ' +
      'logo của bất kỳ hãng nào trên máy tính, cốc, sổ.'
  ].join('\n');
}

/* ══ CỬA ĐI RA NGOÀI ══

   Chủ hệ chốt ở 9.99.11: được phép nối một bộ tạo ảnh bên ngoài.

   ══ BA LỚP GIỮ, VÀ LỚP THỨ HAI LÀ LỚP THẬT ══

   1. TẮT SẴN. Không có GITA_KHOA_VE thì cửa đóng, và nó nói rõ là
      đóng — chứ không im lặng trả về như đã gửi.

   2. DANH SÁCH TRẮNG, KHÔNG DANH SÁCH CẤM. Thứ đi ra được lắp từ đúng
      NĂM TRƯỜNG CÓ TÊN: chặng, loại hình, nhiệm vụ, bố cục, người xem.
      NỘI DUNG KHÔNG BAO GIỜ ĐI RA — và đây là chỗ quan trọng nhất của
      cả tệp này.

      Vì sao: nội dung là thứ kho mã hoá sinh ra để giữ. Một tấm hình
      không cần nội dung coaching để vẽ được — nó cần một ĐẶC TẢ. Gửi
      cả nội dung đi là gửi tài sản đi kèm một việc không đòi hỏi nó.

      Lọc bằng danh sách cấm thì mỗi trường mới thêm vào bảng là mặc
      định đi ra, và cái mặc định ấy không ai nhớ đi sửa.

   3. GHI SỔ NGUYÊN VĂN. Mỗi lượt để lại đúng chuỗi đã đi ra, không
      phải một bản tóm — bản tóm thì lúc cần đối chất lại phải tin vào
      chính cái đang bị nghi. */

export async function guiDeBaiRaNgoai(y, env, db, hoSo) {
  /* Chỉ Super Admin. Cho một thứ rời khỏi hệ là quyết định của chủ
     hệ, không phải một thao tác của người làm. */
  if (!laChuHe(hoSo)) return {ok: false, code: 'NOPERM',
    error: 'Chỉ Super Admin gửi được đề bài ra ngoài. Cho một thứ rời khỏi hệ là ' +
           'một quyết định, không phải một thao tác.'};

  const khoa = String(env.GITA_KHOA_VE || '');
  const cong = String(env.GITA_CONG_VE || '');
  /* ── NÓI RÕ HAI BÍ MẬT NÀY LÀ GÌ (9.99.39) ──
     Câu cũ chỉ nói "chưa nạp GITA_KHOA_VE và GITA_CONG_VE". Đọc câu
     ấy thì người ta đi tìm chỗ bật trong kho mã — và không có chỗ nào
     cả, vì hai thứ ấy không phải công tắc: chúng là TÀI KHOẢN ở một
     công ty bên ngoài.

     Chủ hệ đã hỏi đúng câu này: "mở chức năng vẽ người, vẽ cảnh thật
     của Claude". Không có chức năng ấy để mở — mô hình ngôn ngữ ĐỌC
     được ảnh, không SINH ra ảnh; ảnh người như ảnh chụp là việc của
     mô hình khuếch tán, một loại máy khác, do công ty khác bán.

     Một câu lỗi không nói ra thứ phải mua thì nó biến một việc làm
     được thành một ngõ cụt. */
  if (!khoa || !cong) return {ok: false, code: 'CUADONG',
    error: 'Cửa đi ra đang ĐÓNG: máy chủ chưa nạp GITA_KHOA_VE và GITA_CONG_VE. ' +
           'Đây là mặc định — nối một bộ vẽ bên ngoài là một quyết định phải bấm.',
    laGi: 'GITA_CONG_VE là ĐỊA CHỈ một dịch vụ sinh ảnh; GITA_KHOA_VE là khoá ' +
          'API của tài khoản Học viện ở dịch vụ ấy. Chúng KHÔNG phải công tắc ' +
          'trong kho mã — không có chỗ nào trong mã để bật chúng lên.',
    loaiDichVu: 'Cần một dịch vụ sinh ảnh theo mô hình KHUẾCH TÁN (diffusion) ' +
          'có cửa HTTP. Mô hình ngôn ngữ — kể cả loại đang chạy trợ lý này — ' +
          'ĐỌC được ảnh nhưng KHÔNG sinh ra ảnh, nên không có đường nào đi tắt ' +
          'qua chỗ này.',
    napBang: ['npx wrangler secret put GITA_CONG_VE',
              'npx wrangler secret put GITA_KHOA_VE',
              'npx wrangler secret put GITA_KIEU_VE   (openai · gita)',
              'npx wrangler secret put GITA_MAU_VE    (tên mô hình, nếu kiểu openai)'],
    nhuChatGpt: 'Muốn vẽ như ChatGPT: GITA_KIEU_VE = openai, GITA_CONG_VE = ' +
          'đường dẫn tạo ảnh của OpenAI, GITA_KHOA_VE = khoá API tài khoản ' +
          'OpenAI của Học viện, GITA_MAU_VE = tên mô hình ảnh tài khoản ấy ' +
          'được dùng. Bộ chuyển đổi đã có sẵn — không phải sửa một dòng mã nào.',
    duongCoSan: 'Chưa có tài khoản thì vẫn dựng được ấn phẩm: dùng ảnh chụp ' +
          'trong kho ảnh làm lớp người (luật lopGhep), chữ do máy đặt lên. ' +
          'Ảnh chụp phải có văn bản đồng ý — luật C13.',
    canNap: ['GITA_KHOA_VE', 'GITA_CONG_VE']};

  const x = await db.prepare('SELECT * FROM deXuatThiGiac WHERE id = ?')
    .bind(String(y.id || '')).first();
  if (!x) return {ok: false, error: 'Không tìm thấy đề xuất này.'};

  /* Chỉ gửi được thứ ĐÃ DUYỆT. Gửi một bản nháp ra ngoài là để một
     thứ chưa ai đọc kỹ rời khỏi hệ. */
  if (x.trangThai !== 'duyet' && x.trangThai !== 'hoanThien')
    return {ok: false, code: 'CHUADUYET',
      error: 'Chỉ gửi ra ngoài thứ đã DUYỆT. Đề xuất này đang ở bậc "' +
        x.trangThai + '".'};

  /* ── DANH SÁCH TRẮNG: ĐÚNG NĂM TRƯỜNG, KHÔNG HƠN ── */
  let nx = [];
  try { nx = JSON.parse(x.nguoiXem || '[]'); } catch (e) { nx = []; }
  /* Tới 9.99.22 chỗ này gửi đi đúng năm nhãn trường, không hơn. Đó là
     một bản kê, không phải một đề bài — đưa cho bộ tạo ảnh thì nó tự
     nghĩ ra hết phần còn lại, và phần nó tự nghĩ ra là phần mang nhận
     diện của một thương hiệu khác.

     Bản này gửi đi một ĐỀ BÀI THẬT. Vẫn đúng năm trường ấy của bản
     ghi — không một trường thứ sáu nào của kho đi ra. Phần thêm vào
     là thứ VIẾT Ở ĐÂY: bảng màu, chữ, kiểu, và các điều cấm. Chúng
     không nằm trong bản ghi nên không có gì để rò. */
  const tangSo = Number(String(x.tang || '').replace(/[^0-9]/g, ''));
  const mauTang = MAU_RA.filter(m => m.k.indexOf('T' + tangSo + ' ') === 0)[0];
  const canNguoi = CAN_NGUOI.indexOf(x.loaiHinh) >= 0;
  /* ── NĂM LỚP, VÀ THỨ TỰ CHÍNH LÀ TRỌNG SỐ ──
     Bản đặc tả GIDA phần 4 chia đề bài thành năm lớp, và nói thẳng:
     thứ tự các lớp là trọng số, vì bộ tạo ảnh nghe phần đầu rõ hơn
     phần cuối.

     Đề bài dưới đây ĐÃ đi đúng thứ tự ấy từ trước khi có bản đặc tả:
       L1 kiến trúc   — chặng · loại hình · nhiệm vụ · bố cục
       L2 nội dung    — người xem · điều nhỏ · thời điểm · bối cảnh
       L3 lối vẽ      — KIỂU · MÀU · CHỮ
       L4 cảm xúc     — phần người, sắc khí của chặng
       L5 kỹ thuật    — khối CẤM ở cuối
     Nên tôi KHÔNG viết lại nó thành năm khối có nhãn: viết lại một
     đề bài đã chỉnh kỹ để nó trông giống bản đặc tả hơn là đổi một
     thứ đang chạy lấy một thứ đọc cho đẹp. Bộ thử canh ĐÚNG THỨ TỰ
     ấy, nên đảo lớp là bị bắt. */
  const guiDi = [
    '── ĐỀ BÀI THIẾT KẾ · GITA 365 ──',
    '',
    'Chặng: ' + x.tang,
    'Loại hình: ' + x.loaiHinh,
    'Nhiệm vụ: ' + x.nhiemVu,
    'Bố cục: ' + (x.boCuc || 'theo mặc định của loại hình'),
    'Người xem: ' + nx.join(', '),
    /* ── HAI Ô CỔNG ĐIỀU NHỎ ĐÃ THU, VÀ ĐỀ BÀI CHƯA TỪNG MANG ──
       Cổng bắt người đề xuất trả lời "xem xong họ làm được điều nhỏ
       gì" và "họ gặp tấm này lúc nào trong đời". Hai câu ấy vào sổ từ
       bản 9.99.54 nhưng KHÔNG đi ra tới bộ vẽ — nên bộ vẽ vẫn vẽ một
       tấm đẹp mà không biết nó phải mời người xem làm gì.
       Thu một câu trả lời rồi không dùng nó thì câu hỏi ấy chỉ là một
       cái cổng làm phiền. */
    x.dieuNho ? 'ĐIỀU NHỎ — phải NHÌN THẤY được trong khuôn hình: ' + x.dieuNho : null,
    x.thoiDiem ? 'NGƯỜI XEM GẶP TẤM NÀY LÚC: ' + x.thoiDiem +
      ' — ánh sáng và giọng của tấm phải hợp với lúc ấy.' : null,
    '',
    'KIỂU: ' + (KIEU_RA[x.loaiHinh] || 'theo mặc định của loại hình') +
      ' Ảnh biên tập, chất liệu và ánh sáng như chụp thật, chiều sâu rõ. ' +
      'Không phải hình vẽ phẳng — phần hình vẽ phẳng đã có bộ vẽ trong máy lo.',
    '',
    'MÀU: nền Đêm sâu #070510, nhấn chính Vàng GITA #F5B942, ' +
      'một điểm Cam lửa #FF7A45 duy nhất trong khuôn hình' +
      (mauTang ? '. Sắc của chặng này là ' + mauTang.k + ' ' + mauTang.hex +
        ' — cho nó dẫn phần lớn khuôn hình.' : '.') +
      ' Không dùng sắc nào ngoài bảng: ' +
      MAU_RA.map(m => m.hex).join(' · '),
    '',
    /* Với loại cần người thì KHÔNG nói gì về chữ, vì đề bài này đang
       đặt một tấm KHÔNG CÓ CHỮ. Nhắc tới bộ chữ là mời nó viết. */
    canNguoi ? null : 'CHỮ: nếu có chữ trong hình thì đặt bằng Be Vietnam Pro; ' +
      'câu trích dùng Playfair Display nghiêng. Dấu tiếng Việt phải đủ và đúng chỗ.',
    canNguoi ? null : '',
    /* null = bỏ hẳn dòng; '' = một dòng trống ngăn đoạn. Hai thứ khác
       nhau, nên bộ lọc chỉ được bỏ null. */
    canNguoi ? nguoiRa(nx) : null,
    canNguoi ? '' : null,
    canNguoi ? boiCanhRa(x) : null,
    canNguoi ? '' : null,
    'CẤM — mỗi dòng là một lần đã hỏng thật:',
    '· Không chân dung một người có thật, không khuôn mặt giống người ' +
      'nổi tiếng. Học viện không có cách nào xin phép một người mình ' +
      'không biết là ai.',
    '· Không trẻ em, không thiếu niên.',
    '· Không MỘT CHỮ NÀO trong ảnh — kể cả chữ nền, chữ trên màn hình, ' +
      'chữ trên gáy sách. Lớp chữ do hệ đặt lên sau.',
    '· Không đặt dấu GITA vào hình; dấu do hệ tự đặt sau, và nó không ' +
      'nhận bóng đổ, không nghiêng, không đổi màu.',
    '· Không tên đơn vị nào khác, không lời hứa điểm số.',
    '· Không kho ảnh dựng sẵn, không nền gradient tím-xanh mặc định.'
  ].filter(v => v !== null).join('\n');

  /* ══ ĐIỀU 13 CÓ RĂNG Ở ĐÚNG ĐÂY (9.99.62) ══

     Luật vận hành số 1 của Bộ não: "Thẻ Vùng Mạnh, hồ sơ song sinh, và
     mọi ghi chép về con KHÔNG BAO GIỜ rời khỏi hệ thống của GITA ở dạng
     có thể nhận dạng."

     Cửa này đã chạy từ 9.99.5x và kiểm quyền, kiểm bậc, kiểm cổng — rồi
     KHÔNG kiểm một chữ nào về dữ liệu người. Nghĩa là tới hôm qua, một
     cái tên trẻ con lọt vào ô nội dung thì nó đi thẳng ra bộ tạo ảnh
     đặt ở nước ngoài, và Luật số 91/2025/QH15 gọi đó là xử lý dữ liệu
     xuyên biên giới.

     Đặt phép soi ở ĐÂY chứ không ở lúc đề xuất, có chủ ý: đề xuất còn
     nằm trong hệ, và trong hệ thì dữ liệu gia đình được phép có mặt.
     Ranh giới là lúc chuỗi chữ rời khỏi hệ — đúng dòng này.

     Soi chuỗi ĐÃ DỰNG XONG, không soi từng ô rời: một cái tên có thể
     nằm ở ô nội dung, ô bố cục, hay ô điều nhỏ, và soi từng ô là ba
     phép soi phải cùng nhớ. Soi chuỗi cuối là một phép, và nó thấy đúng
     thứ sắp đi. */
  /* ══ L04 · NĂM Ô VÒNG ĐỎ KHÔNG BAO GIỜ RỜI MÁY ══  (9.99.74)

     Đứng TRƯỚC cổng ẩn danh, và đó là thứ tự đúng. Cổng ẩn danh nói
     "gửi được, nhưng phải ẩn danh trước"; cổng này nói "KHÔNG gửi, ẩn
     danh cũng không". Thư tha thứ ẩn danh vẫn là thư tha thứ — nó vẫn
     là thứ người ta viết ra để chưa nói với ai.

     Đặt sau thì người gửi nhận câu "hãy ẩn danh rồi gửi lại", làm theo,
     và lần thứ hai thì lọt. Một cổng chỉ đường sai là một cổng dạy
     người ta cách đi vòng qua chính nó. */
  const vongDo = LuatGD.soatVongDo(x, 'cửa đi ra ngoài');
  if (!vongDo.sach) {
    await LuatGD.ghiChanLuat(db, hoSo, 'L04', 'guiDeBaiRaNgoai · ' + vongDo.thay.join(' · '));
    return {ok: false, code: 'VONGDO', thay: vongDo.thay,
      error: 'CHẶN — thứ sắp gửi mang ô VÒNG ĐỎ: ' + vongDo.thay.join(' · ') + '. ' +
        vongDo.vi + ' Ẩn danh KHÔNG mở được cổng này: một lá thư tha thứ ẩn danh ' +
        'vẫn là một lá thư tha thứ.'};
  }

  const raNgoai = BoNao.soatRaNgoai(guiDi);
  if (!raNgoai.sach) {
    await Kho.ghiNhatKy(db, {uid: hoSo.uid, username: hoSo.u, viec: 'TG_CHAN_ANDANH',
      doiTuong: x.id, chiTiet: raNgoai.ngo.map(n => n.ma).join(' · ')});
    return {ok: false, code: 'CHUAANDANH', ngo: raNgoai.ngo,
      error: 'CHẶN — ngờ có dữ liệu NHẬN DẠNG ĐƯỢC trong thứ sắp gửi ra ngoài: ' +
        raNgoai.ngo.map(n => n.ma + ' (' + n.thay + ')').join(' · ') + '. ' +
        'Luật vận hành số 1 của Bộ não, và Điều 13 của Hiến pháp: mọi ghi chép về ' +
        'một gia đình hoặc một đứa trẻ không bao giờ rời hệ ở dạng nhận dạng ' +
        'được. Máy KHÔNG tự xoá hộ — tự xoá thì anh chị không biết mình vừa suýt ' +
        'gửi cái gì, và lần sau viết y hệt. Ẩn danh rồi gửi lại: "phụ huynh A, ' +
        'con 9 tuổi, vào qua cửa làm, sợ bị cười".'};
  }

  /* ══════════════════════════════════════════════════════════════
     VÒNG ĐI–VỀ (9.99.37)

     Tới 9.99.36 cửa này dựng đề bài, ghi sổ, rồi TRẢ ĐỀ BÀI VỀ cho
     người bấm tự mang đi. Nghĩa là "cửa đi ra" mới có phần ĐI, chưa
     có phần VỀ — và chừng nào chưa có phần về thì lớp người của mọi
     áp phích vẫn là một ô chờ, dù chủ hệ đã nạp khoá.

     Nay gửi thật và nhận ảnh về:

       POST  <GITA_CONG_VE>
       Authorization: Bearer <GITA_KHOA_VE>
       {"id", "deBai", "kho", "loaiHinh", "tang"}

     Nhận về, chấp NHẬN CẢ BA DẠNG — vì chủ hệ chưa chọn nhà cung cấp,
     và ép một dạng là ép luôn cả lựa chọn ấy:
       · thân là ảnh (Content-Type: image/*)
       · JSON {"anh": "data:image/png;base64,..."}
       · JSON {"url": "https://..."} — tải tiếp một nhịp

     Ảnh về KHÔNG tự phát hành. Nó gắn vào bản ghi ở đúng bậc bản ghi
     đang đứng, và đi tiếp bằng chính thang duyệt cũ — luật C12. */
  const NHAN_TOI_DA = 12 * 1024 * 1024;

  /* ══ BỘ CHUYỂN ĐỔI THEO NHÀ CUNG CẤP (9.99.40) ══

     Chủ hệ hỏi "cài đặt khả năng vẽ như của ChatGPT". ChatGPT vẽ ảnh
     bằng API ảnh của OpenAI — một cửa HTTP mua được, nên câu hỏi ấy
     LÀM ĐƯỢC, khác hẳn câu "mở chức năng vẽ của Claude".

     Nhưng cửa này tới 9.99.39 gửi đi theo dạng riêng của Học viện
     ({id, deBai, kho, loaiHinh, tang}), mà OpenAI đòi {model, prompt,
     size, n}. Trỏ thẳng GITA_CONG_VE vào OpenAI thì nó trả về 400,
     và người bấm chỉ thấy "cổng ngoài trả về 400" — đúng loại lỗi
     làm người ta bỏ cuộc mà không biết mình sai ở đâu.

     Nên khai KIỂU CỔNG. Thêm một nhà cung cấp là thêm một dòng ở đây,
     không phải sửa cả cửa.

     GITA_KIEU_VE chưa nạp thì mặc định `gita` — dạng riêng, dành cho
     ai tự dựng một lớp trung gian. Nạp `openai` thì gửi và đọc đúng
     dạng OpenAI. */
  const KIEU_CONG = {
    gita: {
      than: (idRa, deBai2) => ({id: idRa, deBai: deBai2, kho: x.loaiHinh,
                                loaiHinh: x.loaiHinh, tang: x.tang})
    },
    openai: {
      /* Khổ ảnh theo loại hình: hai loại hình có người đều là tấm
         ĐỨNG (người cần chiều cao), còn lại để vuông. Không đoán ba
         khổ khác nhau cho ba loại hình — đoán sai thì ảnh về phải cắt,
         mà cắt ảnh người là cắt vào mặt. */
      than: (idRa, deBai2) => ({
        model: String(env.GITA_MAU_VE || 'gpt-image-1'),
        prompt: deBai2,
        n: 1,
        size: CAN_NGUOI.indexOf(x.loaiHinh) >= 0 ? '1024x1536' : '1024x1024'
      })
    }
  };

  async function nhanAnhVe(idRa, guiDi2) {
    const tenKieu = String(env.GITA_KIEU_VE || 'gita').toLowerCase();
    const kieuCong = KIEU_CONG[tenKieu];
    if (!kieuCong) return {ok: false, code: 'KIEUCONGLA',
      error: 'Không có kiểu cổng "' + tenKieu + '". Đang có: ' +
             Object.keys(KIEU_CONG).join(' · ') + '. Nạp bằng: ' +
             'npx wrangler secret put GITA_KIEU_VE'};
    let r;
    try {
      r = await fetch(cong, {
        method: 'POST',
        headers: {'Authorization': 'Bearer ' + khoa,
                  'Content-Type': 'application/json'},
        body: JSON.stringify(kieuCong.than(idRa, guiDi2))
      });
    } catch (e) {
      return {ok: false, code: 'CONGKHONGTRALOI',
        error: 'Không gọi được cổng ngoài: ' + e.message};
    }
    if (!r.ok) return {ok: false, code: 'CONGTUCHOI',
      error: 'Cổng ngoài trả về ' + r.status + '. Đề bài đã vào sổ đi ra, ' +
             'nên gọi lại được mà không phải dựng lại.'};

    const kieu = String(r.headers.get('content-type') || '');
    let than = null, duoi = 'png';
    if (/^image\//.test(kieu)) {
      than = new Uint8Array(await r.arrayBuffer());
      duoi = kieu.indexOf('jpeg') >= 0 ? 'jpg' : (kieu.indexOf('webp') >= 0 ? 'webp' : 'png');
    } else {
      let j = null;
      try { j = await r.json(); } catch (e) { j = null; }
      if (!j) return {ok: false, code: 'CONGTRALOIRAC',
        error: 'Cổng ngoài trả về thứ không phải ảnh và cũng không phải JSON.'};
      /* Dạng OpenAI: {data:[{b64_json}]} hoặc {data:[{url}]}. Gom về
         cùng hai trường mà phần dưới đã biết đọc, thay vì viết một
         nhánh đọc riêng — một nhánh riêng thì mỗi lần sửa phải nhớ
         sửa cả hai chỗ. */
      if (j.data && j.data.length && !j.anh && !j.url) {
        const d0 = j.data[0] || {};
        if (d0.b64_json) j.anh = 'data:image/png;base64,' + d0.b64_json;
        else if (d0.url) j.url = d0.url;
      }
      if (j.anh && /^data:image\/([a-z]+);base64,/.test(String(j.anh))) {
        const m2 = /^data:image\/([a-z]+);base64,(.*)$/s.exec(String(j.anh));
        duoi = m2[1] === 'jpeg' ? 'jpg' : m2[1];
        const b = atob(m2[2]);
        than = new Uint8Array(b.length);
        for (let i2 = 0; i2 < b.length; i2++) than[i2] = b.charCodeAt(i2);
      } else if (j.url) {
        let r2;
        try { r2 = await fetch(String(j.url)); }
        catch (e) { return {ok: false, code: 'KHONGTAIDUOC',
          error: 'Cổng trả về một đường dẫn mà không tải được: ' + e.message}; }
        if (!r2.ok) return {ok: false, code: 'KHONGTAIDUOC',
          error: 'Tải ảnh từ đường dẫn cổng trả về: ' + r2.status};
        than = new Uint8Array(await r2.arrayBuffer());
        const k2 = String(r2.headers.get('content-type') || '');
        duoi = k2.indexOf('jpeg') >= 0 ? 'jpg' : (k2.indexOf('webp') >= 0 ? 'webp' : 'png');
      } else {
        return {ok: false, code: 'CONGTHIEUANH',
          error: 'Cổng trả JSON nhưng không có trường "anh" (data URI) hay "url".'};
      }
    }
    if (!than || !than.length) return {ok: false, code: 'ANHRONG',
      error: 'Cổng trả về một ảnh rỗng.'};
    /* Chặn cỡ: một ảnh vài trăm megabyte làm nghẽn kho và không tấm
       nào cần tới. Chặn ở đây chứ không ở trình duyệt — trình duyệt
       thì người gọi đổi được. */
    if (than.length > NHAN_TOI_DA) return {ok: false, code: 'ANHQUANANG',
      error: 'Ảnh về nặng ' + Math.round(than.length / 1048576) + ' MB, quá ' +
             Math.round(NHAN_TOI_DA / 1048576) + ' MB.'};

    const khoaTep = 'tg/' + idRa + '.' + duoi;
    if (!env.HOSO) return {ok: false, code: 'CHUACOKHO',
      error: 'Máy chủ chưa gắn kho tệp R2 (binding HOSO).'};
    await env.HOSO.put(khoaTep, than);
    return {ok: true, tep: khoaTep, cỡ: than.length, duoi};
  }

  const id = 'DR-' + tokenMoi().slice(0, 14);
  const luc = new Date().toISOString();
  await db.prepare(
    'INSERT INTO luotDiRa (id,idDeXuat,cong,daGui,soChu,boiAi,luc) ' +
    'VALUES (?,?,?,?,?,?,?)'
  ).bind(id, x.id, cong, guiDi, guiDi.length, hoSo.u, luc).run();

  /* GỌI THẬT. Sổ đã ghi TRƯỚC khi gọi — gọi hỏng thì vẫn còn nguyên
     văn thứ định gửi, và gọi lại được mà không phải dựng lại đề bài. */
  const ve = await nhanAnhVe(id, guiDi);
  await db.prepare('UPDATE luotDiRa SET ketQua = ?, ghiChu = ? WHERE id = ?')
    .bind(ve.ok ? 'ok' : 'loi', ve.ok ? ve.tep : String(ve.error).slice(0, 300), id)
    .run();

  if (ve.ok) {
    /* Ảnh gắn vào bản ghi kèm MÃ LƯỢT ĐI RA (luật C15): sáu tháng sau
       còn tra được đề bài nào đã sinh ra tấm này. Bậc duyệt KHÔNG đổi
       — ảnh về là một nguyên liệu mới, không phải một lượt duyệt. */
    await db.prepare('UPDATE deXuatThiGiac SET anhNguoi = ?, idDiRa = ? WHERE id = ?')
      .bind(ve.tep, id, x.id).run();
  }

  await Kho.ghiNhatKy(db, {uid: hoSo.uid, username: hoSo.u, viec: 'TG_DIRA',
    doiTuong: x.id, chiTiet: cong + ' · ' + guiDi.length + ' ký tự · ' +
      (ve.ok ? 'nhận ảnh ' + ve.tep : 'hỏng: ' + ve.code)});

  if (!ve.ok) return {ok: false, code: ve.code, error: ve.error,
    id, idDeXuat: x.id, cong, daGui: guiDi, soChu: guiDi.length,
    vi: 'Đề bài ĐÃ vào sổ đi ra dù lượt này hỏng — gọi lại được mà không ' +
        'phải dựng lại, và sổ vẫn giữ đúng thứ đã gửi.'};

  return {ok: true, id, idDeXuat: x.id, cong, daGui: guiDi, soChu: guiDi.length,
    anhNguoi: ve.tep, coAnh: true,
    /* TRẢ VỀ NGUYÊN VĂN thứ vừa đi ra, để người bấm nhìn thấy ngay —
       chứ không phải đi tra sổ mới biết mình vừa gửi gì. */
    khongGui: ['nội dung gốc', 'tên nhà', 'tên học viên', 'mọi trường khác'],
    vi: 'Của BẢN GHI đi ra ĐÚNG năm trường có tên. NỘI DUNG không bao giờ đi ra — ' +
        'một tấm hình cần một ĐẶC TẢ, không cần nội dung coaching, nên gửi cả nội ' +
        'dung là gửi tài sản kèm một việc không đòi hỏi nó. Phần còn lại của đề bài ' +
        '— màu, chữ, kiểu, điều cấm — viết thẳng ở may-chu/kien-truc-thi-giac.js, ' +
        'không đọc từ kho, nên không có gì để rò. Lượt này đã vào sổ đi ra.'};
}

/* ══ CỬA XUẤT TẤM RA KHỎI HỆ ══

   Luật C17 (9.99.30): mọi lối mang tấm hình ra khỏi hệ đi qua kiểm vai.

   ══ VÀ PHẢI NÓI THẲNG CỬA NÀY LÀ GÌ ══

   Nó KHÔNG phải một bức tường. Bộ vẽ dựng SVG ngay trong trình duyệt,
   nên người đã mở được màn hình ấy thì đã có tấm trong tay — mở công
   cụ nhà phát triển là lấy được. Viết một hàm chặn ở máy khách rồi gọi
   đó là bảo vệ chính là lỗi "lọc trên màn hình" mà kho này đã dính ba
   lần.

   Cửa này là một CUỐN SỔ. Nó làm được đúng ba việc, và cả ba đều thật:
     · từ chối vai không được xuất, nên không ai vô tình bấm nhầm
     · GHI LẠI ai xuất tấm nào, lúc nào — đối chất được về sau
     · đếm số lượt, để phát hiện người tải bất thường nhiều

   Lớp bảo vệ THẬT nằm ở chỗ khác và đã có sẵn: kho nội dung đóng gói
   theo quyền, nên một vai không được cấp thì màn hình ấy không bao giờ
   có nội dung để mà xuất. */
export async function xuatTamThiGiac(y, env, db, hoSo) {
  /* Chủ hệ chốt từ lâu: khách hàng không xuất được hồ sơ, chỉ người
     của Học viện cấp quản lý mới xuất. R01–R05 là cấp ấy. */
  if (!duocVao(hoSo)) return {ok: false, code: 'NOPERM',
    error: 'Chỉ người của Học viện cấp quản lý (R01–R05) xuất được tấm hình. ' +
           'Đây là chốt của chủ hệ, không phải một thiết đặt.'};

  const id = String((y || {}).id || '').trim();
  const x = await db.prepare('SELECT id,tang,loaiHinh,trangThai FROM deXuatThiGiac ' +
    'WHERE id = ?').bind(id).first();
  if (!x) return {ok: false, error: 'Không tìm thấy đề xuất này.'};

  /* Bản nháp không xuất. Một tấm chưa ai đọc kỹ mà đã rời khỏi hệ thì
     nó đại diện cho Học viện ở một nơi Học viện không kiểm được. */
  if (x.trangThai === 'nhap' || x.trangThai === 'tuChoi')
    return {ok: false, code: 'CHUADUYET',
      error: 'Tấm đang ở bậc "' + x.trangThai + '" — chưa xuất được. Chỉ xuất ' +
             'thứ đã qua ít nhất bậc đề xuất.'};

  await Kho.ghiNhatKy(db, {uid: hoSo.uid, username: hoSo.u, viec: 'TG_XUAT',
    doiTuong: x.id, chiTiet: x.tang + ' · ' + x.loaiHinh + ' · bậc ' + x.trangThai +
      ' · khổ ' + String((y || {}).kho || 'mặc định')});

  return {ok: true, id: x.id, kho: (y || {}).kho || null,
    vi: 'Được xuất, và lượt này đã vào nhật ký. Cửa này là một cuốn SỔ chứ ' +
        'không phải một bức tường: bộ vẽ dựng tấm ngay trong trình duyệt nên ' +
        'người mở được màn hình thì đã có tấm trong tay. Lớp giữ thật nằm ở kho ' +
        'nội dung đóng gói theo quyền — vai không được cấp thì màn hình ấy không ' +
        'bao giờ có nội dung để mà xuất.'};
}

/* ═══════════ GHI CHỮ THAY ẢNH (luật C21, bản 9.99.33) ═══════════

   Câu mô tả dựng ở TRÌNH DUYỆT, vì chỉ chỗ ấy mới biết tấm vẽ ra có
   chữ gì — máy chủ không chạy bộ vẽ. Nên cửa này nhận câu đã dựng và
   cất vào sổ.

   Máy chủ KHÔNG tự nghĩ ra câu mô tả, và cũng không sửa câu nhận về:
   sửa là thêm chữ chưa ai đặt lên tấm, tức đúng thứ luật C10 cấm.

   Nó chỉ soát ba điều mà chỗ nào cũng soát được:
     · có chữ không, và có đủ dài để nói được gì không
     · dài quá mức người nghe chịu được không
     · nhãn ngắn có, để máy đọc màn hình đọc trước tiên */
const MOTA_NGAN_NHAT = 25;
const MOTA_DAI_NHAT = 400;

export async function ghiChuThayAnh(y, env, db, hoSo) {
  if (!duocVao(hoSo)) return {ok: false, code: 'NOPERM',
    error: 'Cổng thiết kế mở cho R01–R05.'};

  const id = String((y || {}).id || '').trim();
  const x = await db.prepare('SELECT id,trangThai FROM deXuatThiGiac WHERE id = ?')
    .bind(id).first();
  if (!x) return {ok: false, error: 'Không tìm thấy đề xuất này.'};

  const alt = String((y || {}).moTa || '').trim();
  const ten = String((y || {}).moTaTen || '').trim();

  if (alt.length < MOTA_NGAN_NHAT)
    return {ok: false, code: 'MOTANGANQUA',
      error: 'Chữ thay ảnh dài ' + alt.length + ' ký tự — dưới ' + MOTA_NGAN_NHAT +
             ' thì nó không nói được tấm này vẽ gì, và một câu không nói được gì ' +
             'thì tệ hơn không có: nó làm phép soát bên dưới tưởng đã xong.'};
  if (alt.length > MOTA_DAI_NHAT)
    return {ok: false, code: 'MOTADAIQUA',
      error: 'Chữ thay ảnh dài ' + alt.length + ' ký tự, quá ' + MOTA_DAI_NHAT +
             '. Máy đọc màn hình đọc liền một mạch không xuống dòng, nên một câu ' +
             'dài hơn thế là người nghe mất dấu giữa chừng. Bộ vẽ đã tự cắt ở ' +
             '300 — câu này dài hơn nghĩa là nó không phải do bộ vẽ dựng.'};
  if (!ten)
    return {ok: false, code: 'THIEUNHAN',
      error: 'Thiếu nhãn ngắn. Máy đọc màn hình đọc nhãn TRƯỚC, và người nghe ' +
             'quyết định có nghe tiếp phần dài hay không dựa vào đúng nhãn ấy.'};

  await db.prepare('UPDATE deXuatThiGiac SET seoAlt = ?, seoTen = ? WHERE id = ?')
    .bind(alt, ten, x.id).run();
  await Kho.ghiNhatKy(db, {uid: hoSo.uid, username: hoSo.u, viec: 'TG_CHUTHAYANH',
    doiTuong: x.id, chiTiet: ten.slice(0, 120)});

  return {ok: true, id: x.id, moTa: alt, moTaTen: ten,
    vi: 'Đã ghi. Câu này do bộ vẽ dựng từ chính chữ nó đặt lên tấm — máy chủ ' +
        'không thêm và không sửa một từ nào, vì thêm là mô tả thứ không có ' +
        'trên tấm.'};
}

/* ══ CỬA ĐỌC ẢNH ĐÃ VỀ (9.99.37) ══

   Ảnh do bộ tạo ảnh sinh nằm trong kho R2, không nằm trong kho mã.
   Bộ vẽ chạy ở trình duyệt nên nó phải XIN được ảnh ấy — và xin thì
   phải qua kiểm vai, cùng luật với mọi thứ khác rời khỏi hệ (C17).

   Trả về data URI chứ không trả đường dẫn ký sẵn: đường dẫn ký sẵn
   là một cái khoá đi ra khỏi hệ và sống tiếp sau khi phiên đã đóng,
   còn data URI thì chết cùng lượt gọi. */
export async function docAnhThiGiac(y, env, db, hoSo) {
  if (!duocVao(hoSo)) return {ok: false, code: 'NOPERM',
    error: 'Cổng thiết kế mở cho R01–R05.'};
  const id = String((y || {}).id || '').trim();
  const x = await db.prepare('SELECT id,anhNguoi FROM deXuatThiGiac WHERE id = ?')
    .bind(id).first();
  if (!x) return {ok: false, error: 'Không tìm thấy đề xuất này.'};
  if (!x.anhNguoi) return {ok: false, code: 'CHUACOANH',
    error: 'Bản ghi này chưa có lớp người. Gửi đề bài ra bộ tạo ảnh trước.'};

  /* Chỉ đọc trong đúng thư mục của phòng thiết kế. Không có dòng này
     thì một mã bản ghi bịa ra đọc được mọi tệp trong kho hồ sơ. */
  const tep = String(x.anhNguoi);
  if (!/^tg\/[A-Za-z0-9._-]+$/.test(tep)) return {ok: false, code: 'DUONGDANLA',
    error: 'Đường dẫn ảnh không nằm trong thư mục thiết kế.'};
  if (!env.HOSO) return {ok: false, code: 'CHUACOKHO',
    error: 'Máy chủ chưa gắn kho tệp R2.'};

  const o = await env.HOSO.get(tep);
  if (!o) return {ok: false, code: 'MATTEP',
    error: 'Sổ ghi có ảnh nhưng kho không còn tệp: ' + tep};
  const b = new Uint8Array(await o.arrayBuffer());
  let nhi = '';
  for (let i = 0; i < b.length; i++) nhi += String.fromCharCode(b[i]);
  const duoi = tep.split('.').pop();
  const kieu = duoi === 'jpg' ? 'jpeg' : duoi;

  await Kho.ghiNhatKy(db, {uid: hoSo.uid, username: hoSo.u, viec: 'TG_DOCANH',
    doiTuong: x.id, chiTiet: tep + ' · ' + b.length + ' byte'});

  return {ok: true, id: x.id, tep: tep, coBao: b.length,
    anh: 'data:image/' + kieu + ';base64,' + btoa(nhi)};
}

export async function soDiRa(y, env, db, hoSo) {
  if (!duocVao(hoSo)) return {ok: false, code: 'NOPERM',
    error: 'Cổng thiết kế mở cho R01–R05.'};
  const r = await db.prepare(
    'SELECT * FROM luotDiRa ORDER BY luc DESC LIMIT 200').all();
  return {ok: true, so: (r.results || []).length,
    ds: (r.results || []).map(v => ({id: v.id, idDeXuat: v.idDeXuat, cong: v.cong,
      daGui: v.daGui, soChu: v.soChu, boiAi: v.boiAi, luc: v.luc})),
    cuaMo: !!(env.GITA_KHOA_VE && env.GITA_CONG_VE),
    vi: 'Mỗi dòng giữ ĐÚNG chuỗi đã đi ra, không phải một bản tóm — bản tóm thì ' +
        'lúc cần đối chất lại phải tin vào chính cái đang bị nghi.'};
}

export { DAU_HIEU };
