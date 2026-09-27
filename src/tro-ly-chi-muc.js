/* ═══════════════════════════════════════════════════════════════
   GITA 365 · v9.73 — CHỈ MỤC TỰ DÒ CHO TRỢ LÝ

   VÌ SAO CÓ TỆP NÀY

   Đo được trước khi viết: đăng nhập vai Coach thì trong bộ nhớ có
   528 kho · 10.485 bản ghi. Trợ lý tra được 30 kho.

   Nghĩa là 94% tri thức của Học viện nằm ngay trong máy, đã giải mã
   xong, mà trợ lý không chạm tới. Và nó KHÔNG im lặng — nó vẫn trả
   lời, bằng thứ gần giống trong 30 kho kia. Đó là kiểu hỏng đắt
   nhất: sai mà tự tin.

   Nguyên nhân gốc là cách khai nguồn. Mỗi kho muốn tra được thì phải
   có người viết tay một mục khai trường nào là mã, trường nào là
   tên, trường nào là thân. 30 mục khai trong ba năm. Với nhịp thêm
   kho như hiện nay thì cách ấy vĩnh viễn không đuổi kịp.

   Nên tệp này ĐẢO CÁCH LÀM: không khai từng kho nữa, mà DÒ. Duyệt
   mọi kho đang có trong bộ nhớ, tự nhận ra trường nào là mã, trường
   nào là tên, rồi dựng chỉ mục ngược. Kho mới thêm vào ngày mai tự
   động tra được, không cần ai nhớ khai.

   CÁI GIÁ CỦA VIỆC DÒ, VÀ CÁCH TRẢ

   Dò tự động thì lấy cả thứ không nên lấy. Ba loại phải chặn cứng:

     · Dữ liệu người thật — FAMILIES, TEAM, ACCOUNTS. Kho hồ sơ gia
       đình mà lọt vào chỉ mục thì một câu hỏi vu vơ cũng lôi ra tên
       học viên và tên bố mẹ nhà khác.
     · Nhật ký và vết chạy — SECLOG, AUDIT. Không phải tri thức.
     · Khung chạy — NAV, ROLES, bảng màu. Tra ra chỉ gây nhiễu.

   Ba loại ấy nằm trong G.TL_CAM, mỗi tên kèm LÝ DO, và tlSoiCam()
   bắt tên nào thiếu lý do. Thêm tlSoiKhongCaNhan() dò ngược: quét
   mọi kho ĐÃ vào chỉ mục xem có trường nào mang hình dữ liệu cá
   nhân không — chặn theo tên kho thì phụ thuộc trí nhớ, dò theo
   hình dữ liệu thì không.

   VỀ KHÁCH HÀNG — KHÁC HẲN NGƯỜI TRONG NGHỀ

   Gói NỀN mà phụ huynh nhận có 180 kho, và trong đó có thứ của
   nghề: KBTV_* là kịch bản tư vấn bán hàng, CV_HANG là bảng hệ số
   lương, HH_* là hoa hồng, TUYEN* là tuyển dụng. Trước nay không
   màn nào của khách hiện chúng, nên không ai thấy vấn đề.

   Nếu tôi cho dò tự do thì trợ lý của phụ huynh mở thẳng mấy kho ấy
   ra. Nên luật ở đây NGƯỢC CHIỀU nhau, cố ý:

     · người trong nghề  → dò hết, TRỪ danh sách cấm
     · khách hàng        → chỉ dò kho ĐÃ ĐƯỢC KHAI CHO PHÉP

   Mặc định của khách là CẤM. Khai thêm cho khách là một hành động
   có chủ ý, không phải một chỗ quên.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;

(function () {

/* ─── Chuẩn hoá tiếng Việt ─── */
function boDau(s) {
  return String(s == null ? '' : s).toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd').replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ').trim();
}
var HU_TU = {};
('la cua va cho voi thi ma nhung o tai den tu khi nao sao gi de duoc co khong ' +
 'toi minh em anh chi con nha mot hai cac rat qua lam nen se da dang bi bo ai nay ' +
 'the nhu hay hon nua chua roi cung ve theo tren duoi trong ngoai boi neu vi ra vao ' +
 'thi phai can nhu that hoac tuc chinh cai nhung nay do kia ay').split(' ')
  .forEach(function (t) { HU_TU[t] = 1; });

function tachTu(s) {
  var t = boDau(s).split(' '), ra = [];
  for (var i = 0; i < t.length; i++)
    if (t[i].length >= 2 && !HU_TU[t[i]]) ra.push(t[i]);
  return ra;
}

/* ═══════════════════════════════════════════════════════════════
   DANH SÁCH CẤM — ba lý do, mỗi tên phải có một
   ═══════════════════════════════════════════════════════════════ */
G.TL_CAM = {
  /* ── HIẾN PHÁP THỊ GIÁC: SỔ TAY CỦA MỘT PHÒNG, KHÔNG PHẢI TRI THỨC CHUNG ──

     Mười một kho TG_ là luật thiết kế của Kiến trúc sư thị giác, và
     chúng có màn riêng để tra. Để chúng trong chỉ mục hỏi-đáp chung thì
     mỗi câu hỏi coaching phải cạnh tranh chỗ với mười một kho nói về bố
     cục và bảng màu.

     Đo được ngay lúc thêm: bộ đo trợ lý tụt phần CÓ MẶT từ 32 xuống
     31/40 — đúng một kho bị đẩy ra khỏi danh sách mười hai chỗ. Chốt
     CÓ MẶT dựng ở 9.99.7 bắt được, và cách sửa đúng là gỡ chúng khỏi
     chỉ mục chung chứ không phải hạ mốc xuống cho vừa. */
  TG_MA_VB:     'rieng · hiến pháp thị giác, tra ở màn Kiến trúc sư thị giác',
  TG_TANG:      'rieng · lớp thị giác của từng chặng, có màn riêng',
  TG_NGUOI:     'rieng · hồ sơ người xem của phòng thiết kế, có màn riêng',
  TG_LOAIHINH:  'rieng · các loại hình chuẩn, có màn riêng',
  TG_CAM:       'rieng · các điều cấm khi thiết kế, có màn riêng',
  TG_DIEM:      'rieng · thang điểm chấm hình, có màn riêng',
  TG_BAC:       'rieng · bậc điểm của thang chấm hình, có màn riêng',
  TG_TRANGTHAI: 'rieng · sáu bậc duyệt thiết kế, có màn riêng',
  TG_LENH:      'rieng · bảng lệnh của chủ hệ ở màn thiết kế',
  TG_CHOCHU:    'rieng · chỗ máy dừng lại ở phần thiết kế, có màn riêng',
  TG_LUAT_GOC:  'rieng · luật gốc của phòng thiết kế, có màn riêng',

  /* ── Dữ liệu người thật ── */
  FAMILIES:      'ca-nhan · hồ sơ mười nhà: tên học viên, tên bố mẹ, tên Coach',
  NHA_TOI:       'ca-nhan · bản rút hồ sơ nhà mình, vẫn là người thật',
  TEAM:          'ca-nhan · danh sách nhân sự Học viện',
  ACCOUNTS:      'ca-nhan · tài khoản đăng nhập',
  AUDITORS:      'ca-nhan · tên người rà soát',
  CHANDUNG_KH:   'ca-nhan · chân dung khách hàng gắn với ca thật',
  TAIKHOAN_KPI:  'ca-nhan · KPI gắn với tài khoản cụ thể',
  DIEM:          'ca-nhan · điểm của học viên có tên',
  DIEMCHAM:      'ca-nhan · phiếu chấm gắn người',

  /* ── Nhật ký, vết chạy: không phải tri thức ── */
  SECLOG:        'nhat-ky · nhật ký an ninh',
  AUDIT:         'nhat-ky · vết rà soát',
  SUKIEN:        'nhat-ky · dòng sự kiện',
  DUYET:         'nhat-ky · hàng chờ phê duyệt',
  YEUCAU_MO:     'nhat-ky · yêu cầu xin mở tầng',

  /* ── Khung chạy: tra ra chỉ gây nhiễu ── */
  NAV:           'khung · bảng điều hướng cột trái, không phải nội dung',
  ROLES:         'khung · bảng mã vai, tra ra chỉ được một dòng mã',
  PERM_NHOM:     'khung · bảng gom quyền theo nhóm',
  LANGS:         'khung · bảng mã ngôn ngữ',
  LEVELS:        'khung · bảng mã cấp, nội dung cấp nằm ở kho khác',
  TIERS:         'khung · bảng mã tầng, nội dung tầng nằm ở MATRAN_T*',
  TANG_HIENTHI:  'khung · nhãn hiển thị tầng',
  KHO_TONG:      'khung · bảng kê kho',
  DE_LEN:        'khung · bảng khai chỗ đè hàm',
  MT_BANG:       'khung · bảng mã màu giao diện',
  MT_BANG_LUAT:  'khung · luật dùng bảng màu giao diện',
  TL_TRICH:      'khung · bảng trích dẫn kỹ thuật',
  PERM:          'khung · trần quyền của từng vai',
  VIEWS:         'khung · bảng màn hình',
  KICHBAN_AI:    'khung · khung lời của chính trợ lý',
  AI_HOI:        'nhat-ky · lịch sử hỏi của phiên này',
  DE_LEN_LUAT:   'khung · luật bảng khai chỗ đè',
  TL_CAM:        'khung · chính danh sách này',
  TL_NHAN:       'khung · bảng nhãn loại',
  TL_MAN:        'khung · bảng màn mở được',
  TL_KHACH_XEM:  'khung · danh sách kho cho khách tra',
  TL_KHACH_KHONG_VI: 'khung · lý do kho nào không cho khách tra',

  /* ── Hai kho có cấu trúc riêng: KHÔNG cấm nội dung, mà nạp bằng
       đường riêng ở dưới, vì bảng của chúng nằm sâu ba lớp và bộ dò
       chung chỉ đi hai lớp. ── */
  TAILIEU_GOC:   'rieng · bảng sâu ba lớp, nạp bằng moTaiLieu()',
  TAILIEU_DRIVE: 'rieng · bảng sâu ba lớp, nạp bằng moTaiLieu()'
};

/* ═══════════════════════════════════════════════════════════════
   KHO KHÁCH HÀNG ĐƯỢC TRA — mặc định là KHÔNG

   Đây là danh sách CHO PHÉP, không phải danh sách cấm. Kho nào
   không có tên ở đây thì trợ lý của phụ huynh, học viên và cộng tác
   viên không tra tới, kể cả khi kho ấy đang nằm trong bộ nhớ máy họ.

   Trần tầng (G.aiTrongTang) vẫn chạy CHỒNG LÊN danh sách này. Hai
   lớp: lớp này chọn KHO, lớp kia chọn BẢN GHI trong kho.
   ═══════════════════════════════════════════════════════════════ */
G.TL_KHACH_XEM = ('BAIHOC BDCN BDCN_NHIP BD_CAP BD_CHON BD_LON BD_LUAT BK_DANHMUC ' +
  'BC_MUNG CHUYEN CHUYENDICH CHUYEN_TG CH_CAP CH_MACH CS_LUAT CS_NEN CS_TANG CUHICH ' +
  'DD_HUA DEHIEU_LUAT DEHIEU_THAY DEHIEU_TRANG DG_HOI DG_LUAT DG_MOC DG_TEN ' +
  'DL_MAU DL_MAU_LUAT DV_BUOC DV_CHAN DV_HOI GITA GL_XONG GT_BUOC GT_CHANG GT_HOI ' +
  'GT_HUA GT_MUCTIEU GT_SO GT_TANG GT_VAI HANHTRINH12 HM_HOI3 HM_LUAT HM_NGUY HM_VUNG ' +
  'HN_NGO HP_NGAY HT_KC HT_LECH HT_LUAT HT_NOI HT_TANG HUYHIEU KA_CHO KA_LOAI KA_LUAT ' +
  'KA_TY KENH_CHANG KENH_DS KENH_LUAT KH_BAI KH_LOTRINH KH_LUAT MATRAN_T1 MATRAN_T2 ' +
  'MATRAN_T3 NAC NGHILE NGHILE_LUAT NGHILE_TH NGONTU_RANH NK_NHIP PL_CO PL_QUYEN ' +
  'QUA1000 QUA QUA_DANG ROHN RONG_CO_Y SG_CAM5 SG_HOI SG_KHAN SG_LUAT SG_MUCLUC ' +
  'SG_QUYEN7 SG_TRONGSACH SOAT_CHATLUONG SOAT_MOC SOAT_THA TAM_NHIN TG_LINH TG_LOAI ' +
  'TG_NHIEMVU TG_PHAT TG_QUYDOI TG_THUONG TG_VIEC TL_TANG_TRUONG TL_VIEC_DAU ' +
  'TL_VIEC_NHIP TIN_MAU TRU_GITA TR_DEN TT_CAMXUC TT_CHIAKHOA TT_LUAT TT_MUA ' +
  'TT_MUA_LUAT VIEC_NHAC VZ_LUAT VZ_ROI VZ_VUNG WOW').split(' ');

/* Kho ở gói NỀN mà KHÔNG cho khách tra — ghi ra để người sau đọc là
   biết đây là chỗ cố ý bỏ, không phải chỗ quên. */
G.TL_KHACH_KHONG_VI = {
  'KBTV_*':   'kịch bản tư vấn bán hàng — khách đọc trước thì buổi tư vấn thành vở diễn',
  'KB_*':     'kịch bản nghiệp vụ, cùng lý do',
  'CV_*':     'bảng hệ số lương và KPI nội bộ',
  'HH_*':     'bậc hoa hồng và chứng cứ chi trả',
  'BAC_CTV':  'bậc cộng tác viên — thuộc phần thù lao',
  'TUYEN*':   'tuyển dụng nội bộ',
  'THI_*':    'đề và luật thi — lộ đề',
  'TEST750':  'bộ đề 750 câu — lộ đề',
  'SH_*':     'sát hạch nội bộ',
  'TV_*':     'quy trình tư vấn',
  'AD_*':     'bảng quản trị',
  'BC_*':     'bậc và trọng số nội bộ, trừ BC_MUNG là lời chúc mừng cho nhà',
  'CLG_BANG': 'bảng chất lượng nội bộ',
  'HP_TANG':  'giá học phí từng tầng — giá là việc của người tư vấn, không phải của máy'
};

/* ═══════════════════════════════════════════════════════════════
   NHẬN DẠNG TRƯỜNG — tự dò, không khai tay
   ═══════════════════════════════════════════════════════════════ */
var KHOA_MA  = ['ma', 'id', 'key', 'code', 'ms', 'k', 'stt', 'so', 'sohieu'];
var KHOA_TEN = ['ten', 'title', 'th', 'nhan', 'tieuDe', 'tieude', 'name', 'muc',
                'ten_vi', 'tenVi', 'label', 'cau', 'hoi', 'viec', 'dieu', 'nhom',
                'buoc', 'chang', 'loai', 'tenGoi', 'd', 't'];
/* Trường KHÔNG đưa vào thân: màu, đường dẫn, cờ đúng/sai, số thuần.
   Chúng không mang nghĩa để tra, mà lại làm loãng điểm. */
var KHOA_BO = /^(mau|color|colour|icon|bieuTuong|url|href|link|anh|img|src|go|view|man|css|class|w|h|x|y|z)$/;

function laMau(v) { return /^#[0-9a-fA-F]{3,8}$/.test(v); }

/* Gom mọi chuỗi trong một bản ghi, đi sâu tối đa hai lớp.
   Hai lớp là đủ cho hình dữ liệu của kho này và giữ cho lượt dựng
   chỉ mục không nở ra theo cấp số nhân. */
function gomChu(x, sau, ra) {
  if (sau > 2 || x == null) return ra;
  if (typeof x === 'string') { if (x.length > 1 && !laMau(x)) ra.push(x); return ra; }
  if (typeof x === 'number') { ra.push(String(x)); return ra; }
  if (Array.isArray(x)) { for (var i = 0; i < x.length && i < 60; i++) gomChu(x[i], sau + 1, ra); return ra; }
  if (typeof x === 'object') {
    for (var k in x) {
      if (!Object.prototype.hasOwnProperty.call(x, k)) continue;
      if (KHOA_BO.test(k)) continue;
      gomChu(x[k], sau + 1, ra);
    }
  }
  return ra;
}

/* Hộp có hàm bên trong thì không phải kho tri thức mà là phần chạy —
   G.U, G.VIEWS, G.KIEM. Chặn theo HÌNH chứ không theo tên: tên thì
   phải nhớ, hình thì tự nhận ra. */
function coHam(x, sau) {
  if (sau > 2 || x == null || typeof x !== 'object') return false;
  var n = 0;
  for (var k in x) {
    if (!Object.prototype.hasOwnProperty.call(x, k)) continue;
    if (typeof x[k] === 'function') return true;
    if (++n > 40) break;
    if (x[k] && typeof x[k] === 'object' && coHam(x[k], sau + 1)) return true;
  }
  return false;
}

/* Tên khoá của một vật, đi sâu hai lớp. Với kho hình vật thì chính
   tên khoá là chỗ mang nghĩa: HOAHONG.tran là "trần", BTN_TRAN.moiNgay
   là "mỗi ngày". Bỏ tên khoá đi là bỏ mất nửa nội dung của kho ấy. */
function tenKhoaSau(x, sau) {
  sau = sau || 0;
  var ra = [];
  if (sau > 1 || !x || typeof x !== 'object' || Array.isArray(x)) return ra;
  for (var k in x) {
    if (!Object.prototype.hasOwnProperty.call(x, k)) continue;
    ra.push(k.replace(/([a-z0-9])([A-Z])/g, '$1 $2'));
    ra = ra.concat(tenKhoaSau(x[k], sau + 1));
  }
  return ra;
}

function doTruong(kho) {
  /* Soi tối đa 12 bản ghi đầu để chọn trường, chứ không chỉ bản ghi
     đầu: bản ghi đầu của vài kho thiếu trường mà bản sau có. */
  var demMa = {}, demTen = {}, n = Math.min(kho.length, 12);
  for (var i = 0; i < n; i++) {
    var x = kho[i];
    if (!x || typeof x !== 'object') continue;
    KHOA_MA.forEach(function (k) {
      var v = x[k];
      if ((typeof v === 'string' && v && v.length <= 40) || typeof v === 'number')
        demMa[k] = (demMa[k] || 0) + 1;
    });
    KHOA_TEN.forEach(function (k) {
      var v = x[k];
      if (typeof v === 'string' && v.length >= 2 && v.length <= 200)
        demTen[k] = (demTen[k] || 0) + 1;
    });
  }
  function chon(dem, thuTu) {
    var tot = '', cao = 0;
    thuTu.forEach(function (k) { if ((dem[k] || 0) > cao) { cao = dem[k]; tot = k; } });
    return cao >= Math.max(1, Math.floor(n / 2)) ? tot : '';
  }
  var kMa = chon(demMa, KHOA_MA), kTen = chon(demTen, KHOA_TEN);
  /* Không có trường tên thì lấy chuỗi ngắn nhất còn nghĩa làm tên —
     thà một cái tên vụng còn hơn một thẻ kết quả trống trơn. */
  return { ma: kMa, ten: kTen };
}

/* ═══ TÊN CỦA MỘT BẢN GHI — MỘT LUẬT, MỘT CHỖ ═══

   Mỗi kho đặt tên trường tiêu đề một kiểu: HSH_HD dùng ten, KK_CUA
   dùng cua, HL_LUAT12 dùng luat, TINHHUONG dùng th. Kê danh sách ưu
   tiên thì kê mãi không hết — đo được 2.823 chỗ dùng "ten" nhưng còn
   hàng trăm tên khác.

   Có một luật chung thật, đọc ra từ chính cách kho này được viết:
   TRƯỜNG CHUỖI ĐẦU TIÊN SAU MÃ chính là tiêu đề. Người soạn kho viết
   mã trước, rồi viết cái tên, rồi mới tới ruột — thứ tự ấy đúng ở
   mọi kho tôi mở ra xem.

   Luật "chuỗi NGẮN NHẤT" của bản đầu thì sai, và sai thấy được: nó
   lấy câu vi phạm của HL_LUAT12 làm tên luật, vì câu ấy tình cờ ngắn
   hơn câu luật.

   Hàm này để ở đây chứ không ở tro-ly-soan.js vì cả chỉ mục lẫn bộ
   soạn đều cần nó. Hai bản của một luật thì sẽ có ngày lệch nhau. */
var KHOA_MA_TEN = /^(ma|id|key|code|ms|k|stt|so|sohieu|no|num|idx)$/;

G.tlTenBanGhi = function (x, kTen) {
  if (!x || typeof x !== 'object') return '';
  /* Luật "chuỗi đầu tiên sau mã" chạy TRƯỚC trường được bầu.

     doTruong() bầu một trường tiêu đề bằng cách đếm trên mười hai bản
     ghi đầu, và danh sách ứng cử của nó là một danh sách gõ tay. Với
     KK_CUA nó bầu "hoi" — có trong danh sách — thay vì "cua", không
     có trong danh sách nhưng mới là tên cửa. Kết quả: bảy cửa hiện ra
     bằng bảy câu hỏi dài thay vì bảy cái tên.

     Danh sách gõ tay thì kê mãi không hết; luật thứ tự thì không cần
     kê. Nên luật chạy trước, danh sách chỉ đỡ lúc luật không ra gì. */
  var dai = '';
  for (var k in x) {
    if (!Object.prototype.hasOwnProperty.call(x, k) || KHOA_BO.test(k)) continue;
    if (KHOA_MA_TEN.test(k)) continue;
    var v = x[k];
    if (typeof v !== 'string' || v.length < 3 || laMau(v)) continue;
    if (v.length <= 160) return v;          /* chuỗi đầu tiên, đủ ngắn để làm tên */
    if (!dai) dai = v.slice(0, 120) + '…';  /* chỉ có chuỗi dài thì cắt bớt */
  }
  if (kTen && typeof x[kTen] === 'string' && x[kTen]) return x[kTen];
  return dai;
};
function layTen(x, kTen) { return G.tlTenBanGhi(x, kTen); }

/* ═══════════════════════════════════════════════════════════════
   NHÃN LOẠI — đọc được, và luôn kèm tên kho gốc để tra lại
   ═══════════════════════════════════════════════════════════════ */
G.TL_NHAN = [
  ['MOTHUC', 'Mô thức'], ['PHACDO', 'Phác đồ'], ['KICHBAN', 'Kịch bản'],
  ['TINHHUONG', 'Tình huống'], ['BAIHOC', 'Bài học'],
  ['HSH_', 'Hồ sơ hợp đồng'], ['KK_', 'Hướng dẫn ký kết'],
  ['RSP_', 'Rà soát pháp lý'], ['RS_', 'Rà soát lỗi'], ['PL_', 'Pháp lý'],
  ['BCD_', 'Chuẩn bằng chứng'], ['HL_', 'Hành lang thành công'],
  ['STA_', 'Sổ tay quản trị'], ['BTN_', 'Bảng tin nội bộ'],
  ['TDH_', 'Tự động hoá'], ['BV_', 'Bản vẽ vận hành'], ['T34_', 'Tầng 3–4'],
  ['T5P_', 'Tầng 5 Pro'], ['TV_', 'Tư vấn'], ['TVB_', 'Tư vấn'],
  ['CL_', 'Chất lượng'], ['CS_', 'Chăm sóc'], ['GL_', 'Gỡ lỗi vận hành'],
  ['SG_', 'Sổ gia đình'], ['SH_', 'Sát hạch'], ['DT_', 'Đào tạo'],
  ['DKH_', 'Đào tạo khách hàng'], ['TG_', 'Trò chơi hành trình'],
  ['NLP_', 'Ngôn ngữ tư duy'], ['MP_', 'Mảnh ghép'], ['BN_', 'Bền vững'],
  ['HN_', 'Hoà giải'], ['HM_', 'Hoà giải rào cản'], ['TT_', 'Đồng hành'],
  ['TR_', 'Tài chính minh bạch'], ['SV_', 'Sự vụ'], ['ND_', 'Nhịp điều hành'],
  ['REF_', 'Tra nhanh'], ['TL_', 'Tài liệu'], ['GT_', 'Giới thiệu'],
  ['HT_', 'Hành trình'], ['BD_', 'Bản đồ'], ['BDCN', 'Bản đồ cá nhân'],
  ['KA_', 'Khiếu nại'], ['DG_', 'Đánh giá'], ['DD_', 'Đạo đức'],
  ['XK_', 'Xem hồ sơ'], ['VZ_', 'Vùng an toàn'], ['NGONTU', 'Ngôn từ'],
  ['SAU_', 'Chiều sâu'], ['MT_', 'Mô thức'], ['PD_', 'Phác đồ'],
  ['TH_', 'Tình huống'], ['QT_', 'Quy trình'], ['HD_', 'Hợp đồng'],
  ['HP_', 'Học phí'], ['KH_', 'Khoá học'], ['TN_', 'Tài nguyên'],
  ['SOAT_', 'Rà soát'], ['DV_', 'Dịch vụ'], ['KENH_', 'Kênh']
];
function nhanLoai(ten) {
  for (var i = 0; i < G.TL_NHAN.length; i++)
    if (ten.indexOf(G.TL_NHAN[i][0]) === 0) return G.TL_NHAN[i][1];
  return 'Kho ' + ten;
}
/* Màu lấy từ đúng bộ đã dùng trong src/ — không thêm mã màu mới. */
var MAU = ['#2A72C6', '#5140B4', '#0B6675', '#0B7350', '#185AB4', '#BE0E16'];
function mauCua(ten) {
  var s = 0;
  for (var i = 0; i < ten.length; i++) s = (s * 31 + ten.charCodeAt(i)) % 9973;
  return MAU[s % MAU.length];
}
/* Màn hình mở được — chỉ những kho đã biết đường. Kho tự dò thì để
   trống, và thẻ kết quả hiện nội dung tại chỗ thay vì mời bấm vào
   một màn không tồn tại. */
G.TL_MAN = { MOTHUC: 'mo-thuc', PHACDO: 'phac-do', KICHBAN: 'kich-ban',
  TINHHUONG: 'tinh-huong', BAIHOC: 'tu-duy' };

/* ═══════════════════════════════════════════════════════════════
   DỰNG CHỈ MỤC

   Dựng LƯỜI — lần hỏi đầu tiên mới dựng. Kho nạp SAU khi đăng nhập
   (luật 2 trong CLAUDE.md), nên dựng lúc tệp vừa tải thì dựng trên
   một bộ nhớ trống. Lỗi ấy đã xảy ra một lần ở 9.72 với
   G.AI_NGUON_THEM và không dòng nào báo.
   ═══════════════════════════════════════════════════════════════ */
var CACHE = null;

function laKhach() { return !!(G.LA_KHACH && G.LA_KHACH()); }

/* Kho này có được vào chỉ mục của người đang đăng nhập không */
G.tlChoPhep = function (ten) {
  if (G.TL_CAM[ten]) return false;
  if (laKhach()) return G.TL_KHACH_XEM.indexOf(ten) >= 0;
  return true;
};

function khoaCache() {
  var u = (G.S && G.S.acc && G.S.acc.u) || '';
  var n = 0;
  for (var k in G) if (Array.isArray(G[k])) n++;
  return u + '|' + n + '|' + (laKhach() ? 'k' : 'n');
}

G.tlChiMuc = function () {
  var kh = khoaCache();
  if (CACHE && CACHE.khoa === kh) return CACHE;

  var bg = [], post = {}, tongDai = 0, soKho = 0, boQua = [], demKho = {};

  function themBanGhi(e) {
    /* e: {khoNguon, loai, mau, go, ma, ten, tom, goc, tenTu[], thanTu[], khoTu[]} */
    var i = bg.length, dem = {};
    e.tenTu.forEach(function (t) { dem[t] = (dem[t] || 0) + 3; });   /* tên bản ghi nặng gấp ba */
    (e.khoTu || []).forEach(function (t) { dem[t] = (dem[t] || 0) + 2; }); /* tên kho và nhãn */
    e.thanTu.forEach(function (t) { dem[t] = (dem[t] || 0) + 1; });
    var dai = 0;
    for (var t in dem) {
      dai += dem[t];
      (post[t] || (post[t] = [])).push(i, dem[t]);   /* cặp phẳng: nhẹ hơn mảng vật */
    }
    e.dai = dai || 1;
    tongDai += e.dai;
    demKho[e.khoNguon] = (demKho[e.khoNguon] || 0) + 1;
    bg.push(e);
  }

  Object.keys(G).forEach(function (ten) {
    /* Chỉ tên kho: viết hoa, dài từ ba chữ trở lên. Ngưỡng ba loại
       ngay G.S (phiên đang đăng nhập) và G.U (hộp hàm tiện ích) —
       hai thứ lọt vào chỉ mục là lọt hồ sơ người đang dùng máy. */
    if (!/^[A-Z][A-Z0-9_]{2,}$/.test(ten)) return;
    var kho = G[ten];
    if (!kho || typeof kho !== 'object') return;
    if (coHam(kho, 0)) return;                       /* hộp hàm, không phải kho */
    if (!G.tlChoPhep(ten)) { boQua.push(ten); return; }

    var loai = nhanLoai(ten), mau = mauCua(ten), go = G.TL_MAN[ten] || '';
    /* Tên kho tách theo gạch dưới, cộng nhãn loại. Nhờ nó mà câu hỏi
       "sáu nhịp" chạm được HL_SAUNHIP, và "hoa hồng" chạm HOAHONG —
       xem chỗ ghép tiếng đôi ở phần tra. */
    var khoTu = tachTu(ten.replace(/_/g, ' ')).concat(tachTu(loai));

    var ds = null;
    if (Array.isArray(kho)) {
      if (!kho.length || typeof kho[0] !== 'object' || kho[0] == null) return;
      ds = kho.map(function (x, i) { return { k: '', x: x, i: i }; });
    } else {
      /* ── KHO HÌNH VẬT ──
         Đo được ở 9.73: HOAHONG (trần hoa hồng đại sứ) và BTN_TRAN
         (trần nhắc mỗi ngày) là VẬT chứ không phải MẢNG, nên bộ dò
         bản đầu bỏ qua sạch. Hỏi đúng hai con số ấy thì trợ lý trả
         lời bằng thứ khác — và trả lời rất tự tin.

         Hai hình vật, phân biệt bằng chính dữ liệu:
           · vật chứa toàn vật con  → mỗi khoá là một bản ghi
           · vật phẳng (số, chuỗi)  → cả kho là MỘT bản ghi */
      var ks = Object.keys(kho);
      if (!ks.length) return;
      var vatCon = 0;
      ks.forEach(function (k) { if (kho[k] && typeof kho[k] === 'object') vatCon++; });
      if (ks.length >= 3 && vatCon >= ks.length / 2)
        ds = ks.map(function (k) {
          var v = kho[k];
          /* Khoá mang giá trị VÔ HƯỚNG cũng phải thành bản ghi. Bản
             đầu bỏ qua chúng, và hậu quả đo được: HOAHONG.tran = 10
             — chính con số trần hoa hồng 10% — KHÔNG có trong chỉ
             mục, nên hỏi "trần hoa hồng là bao nhiêu" thì trợ lý trả
             lời bằng ba nguyên tắc chung quanh nó. */
          return { k: k, x: (v && typeof v === 'object') ? v : { gia: v }, i: 0 };
        });
      else
        ds = [{ k: '', x: kho, i: 0, ca: true }];
    }

    var tr = doTruong(ds.map(function (e) { return e.x; }));
    soKho++;
    ds.forEach(function (e) {
      var x = e.x;
      if (!x || typeof x !== 'object') return;
      var ma = e.k || (tr.ma ? String(x[tr.ma] == null ? '' : x[tr.ma]) : '');
      var tenBG = e.ca ? ten : (layTen(x, tr.ten) || e.k);
      if (!ma && !tenBG) return;
      /* Với kho hình vật, TÊN KHOÁ cũng mang nghĩa: "tran", "moiNgay".
         Người hỏi "trần hoa hồng" đang gọi đúng tên khoá ấy. */
      var than = gomChu(x, 0, []).concat(e.ca || !Array.isArray(kho) ? tenKhoaSau(x) : []).join(' · ');
      themBanGhi({
        khoNguon: ten, loai: loai, mau: mau, go: go,
        ma: ma || (ten + '#' + (e.i + 1)), ten: tenBG || ma,
        tom: than.slice(0, 260), goc: x,
        tenTu: tachTu(tenBG + ' ' + ma), khoTu: khoTu, thanTu: tachTu(than)
      });
    });
  });

  /* Hai kho tài liệu có bảng sâu ba lớp — nạp riêng, nhưng vào CÙNG
     chỉ mục và CÙNG thang điểm. Bản 9.72 để chúng chấm theo thang
     riêng rồi nối vào danh sách đã chấm theo thang khác, và thứ tự
     cuối cùng thành vô nghĩa. */
  function moTaiLieu(ds, loai, mau) {
    (ds || []).forEach(function (d) {
      (d.doan || []).forEach(function (v, i) {
        themBanGhi({ khoNguon: loai === 'Tài liệu gốc' ? 'TAILIEU_GOC' : 'TAILIEU_DRIVE',
          loai: loai, mau: mau, go: 'tai-lieu-goc',
          ma: d.ma + '·đ' + (i + 1), ten: d.ten, tom: String(v).slice(0, 260), goc: d,
          tenTu: tachTu(d.ten), thanTu: tachTu(v) });
      });
      (d.bang || []).forEach(function (b) {
        (b.hang || []).forEach(function (h) {
          var dong = h.join(' · ');
          themBanGhi({ khoNguon: loai === 'Tài liệu gốc' ? 'TAILIEU_GOC' : 'TAILIEU_DRIVE',
            loai: loai, mau: mau, go: 'tai-lieu-goc',
            ma: d.ma + '·' + (h[0] || ''), ten: h[1] || h[0] || d.ten,
            tom: h.slice(1, 4).join(' — ').slice(0, 260), goc: d,
            tenTu: tachTu(String(h[0] || '') + ' ' + String(h[1] || '')),
            thanTu: tachTu(dong) });
        });
      });
    });
  }
  if (!laKhach() || G.TL_KHACH_XEM.indexOf('TAILIEU_GOC') >= 0)
    moTaiLieu(G.TAILIEU_GOC, 'Tài liệu gốc', '#BE0E16');
  if (!laKhach() || G.TL_KHACH_XEM.indexOf('TAILIEU_DRIVE') >= 0)
    moTaiLieu(G.TAILIEU_DRIVE, 'Tài liệu Học viện', '#185AB4');

  CACHE = { khoa: kh, bg: bg, post: post, soKho: soKho, boQua: boQua, demKho: demKho,
    tbDai: bg.length ? tongDai / bg.length : 1, laKhach: laKhach() };
  return CACHE;
};

/* ═══ BẢN GHI CỦA MỘT KHO — DÙNG CHUNG VỚI BỘ SOẠN ═══

   src/tro-ly-soan.js cần đọc CẢ kho để đếm và liệt kê, chứ không chỉ
   mười hai kết quả đã cắt. Bản đầu nó đọc thẳng G[tenKho] và hỏng
   ngay ở kho hình VẬT: HOAHONG không phải mảng nên Array.isArray trả
   false, và câu "trần hoa hồng là bao nhiêu" không soạn được gì.

   Chỉ mục ĐÃ tách kho hình vật thành bản ghi rồi. Đọc lại từ đây thì
   một luật tách, một chỗ — và bộ soạn tự nhận luôn cả hai lớp lọc:
   kho có được phép không (đã lọc lúc dựng chỉ mục), và bản ghi có
   trong tầng không (lọc ngay đây, vì tầng đổi theo người hỏi). */
G.tlBanGhiKho = function (tenKho, tangNha, trongTang) {
  var ci = G.tlChiMuc(), ra = [];
  /* Tham số trongTang có mặt để phép phá KHÔNG phải tráo G.aiTrongTang.
     Bộ dò sâu bắt đúng chỗ ấy ở 9.75, và nó bắt đúng: tráo một hàm
     toàn cục thì chỉ cần phép phá ném lỗi giữa chừng là TRẦN TẦNG nằm
     tắt suốt phiên còn lại — nguy hơn hẳn lần trước với lưới khẩn,
     vì trần tầng là thứ giữ tư liệu tầng năm khỏi nhà tầng một. */
  var kiem = trongTang || G.aiTrongTang;
  ci.bg.forEach(function (x) {
    if (x.khoNguon !== tenKho) return;
    if (kiem) {
      var t = kiem(tenKho, x.goc, tangNha);
      if (!t || !t.ok) return;
    }
    ra.push({ ma: x.ma, ten: x.ten, goc: x.goc });
  });
  return ra;
};

/* Xoá chỉ mục khi đổi người đăng nhập. Gọi từ chỗ đăng nhập/đăng
   xuất; khoá cache ở trên cũng tự bắt được, đây là đường chắc hơn. */
G.tlQuenChiMuc = function () { CACHE = null; };

/* ═══════════════════════════════════════════════════════════════
   TRA — BM25 trên chỉ mục ngược

   VÌ SAO ĐỔI SANG BM25

   Bản 9.72 chấm bằng log(1 + N/df) rồi chia cho tổng nặng câu hỏi.
   Cách ấy chữa được chỗ "kho to luôn thắng", nhưng còn hai chỗ hở:

     · Một bản ghi dài lê thê gom được nhiều tiếng hơn một bản ghi
       ngắn đúng ý, mà không có gì phạt độ dài.
     · Một tiếng lặp mười lần trong cùng bản ghi được cộng mười lần.

   BM25 chữa cả hai bằng đúng hai tham số: b phạt độ dài so với độ
   dài trung bình, k1 làm bão hoà số lần lặp. Đây là thước đã dùng ba
   mươi năm trong nghề tìm kiếm, không phải thứ tôi tự nghĩ ra.
   ═══════════════════════════════════════════════════════════════ */
var K1 = 1.2, B = 0.72;
/* Mỗi kho được cử tối đa bao nhiêu người vào đầu bảng — xem chú giải
   ở chỗ dùng. Đặt cạnh K1 và B vì nó cũng là một tham số của phép
   xếp hạng, và ba con số ấy phải đọc được cùng một chỗ. */
var TRAN_MOI_KHO = 2;

/* ── SÀN ĐỘ DÀI ──
   BM25 chia điểm cho độ dài bản ghi so với độ dài trung bình, để một
   bản ghi dài lê thê không gom điểm bằng cách chứa nhiều chữ. Nhưng
   phép chia ấy quay ngược lại cắn khi có bản ghi CỰC NGẮN.

   Bản 9.75 thêm bản ghi cho khoá vô hướng của kho hình vật —
   HOAHONG.tran = 10 thành một bản ghi dài đúng hai tiếng. Mẫu số tụt
   xuống gần bằng không, điểm nở ra, và mấy bản ghi hai tiếng ấy đè
   cả kho phác đồ.

   Hậu quả đo được ngay ở mục 18 của bộ kiểm: câu "con ôm điện thoại
   cả ngày" của một phụ huynh thôi ra phác đồ và tình huống, mà ra
   toàn bảng vận hành. Không dòng nào đỏ ở phần trợ lý — chỉ có một
   phép đo về trần 30% đỏ, và nó đỏ vì lý do trông chẳng liên quan.

   Sàn 35% độ dài trung bình là cách chữa chuẩn của nghề tìm kiếm cho
   đúng bệnh này. */
var SAN_DAI = 0.35;

/* ═══════════════════════════════════════════════════════════════
   ĐỌC CON SỐ TRONG CÂU HỎI

   VÌ SAO CÓ PHẦN NÀY — ĐO RA CHỨ KHÔNG ĐOÁN

   Mở bộ đo từ 20 lên 40 câu thì trúng 26. Đọc mười bốn câu trượt
   thì thấy chúng trượt theo ĐÚNG MỘT KIỂU: kết quả rơi vào một kho
   ANH EM CÙNG HỌ. Hỏi "mười hai luật hành lang" thì ra HL_VIRUS;
   hỏi "chín bậc thu nhập" thì ra bảng hợp đồng; hỏi "sổ tay có mấy
   nhóm màn" thì ra nhịp làm việc.

   Cùng họ thì dùng chung gần hết vốn từ, nên BM25 gần như không
   phân biệt được. Nhưng câu hỏi CÓ đưa tín hiệu phân biệt, rất rõ:
   một CON SỐ. Mười hai luật. Chín bậc. Bảy cửa. Mười tám virus.

   Học viện đặt tên mọi thứ theo số, nên con số ấy gần như luôn là
   SỐ BẢN GHI của đúng kho cần tìm. Đếm bản ghi thì máy đếm được.
   Kho nào có đúng chừng ấy bản ghi thì gần như chắc chắn là kho
   người ta đang hỏi.

   Đây không phải mẹo vặt hợp với bộ đo: nó đọc được một quy ước
   đặt tên có thật, chạy khắp kho, và không cần ai khai gì thêm.
   ═══════════════════════════════════════════════════════════════ */
var SO_TIENG = { mot: 1, hai: 2, ba: 3, bon: 4, tu: 4, nam: 5, sau: 6, bay: 7,
  tam: 8, chin: 9, muoi: 10, chuc: 10, lam: 5, rươi: 5 };

function soTrongCau(cauHoi) {
  var t = boDau(cauHoi).split(' '), ra = {}, i;
  for (i = 0; i < t.length; i++) {
    if (/^\d{1,3}$/.test(t[i])) { ra[+t[i]] = 1; continue; }
    var a = SO_TIENG[t[i]];
    if (!a) continue;
    /* "mười hai" = 12 · "hai mươi" = 20 · "hai mươi lăm" = 25 */
    if (a === 10) {
      var b = SO_TIENG[t[i + 1]];
      ra[b && b < 10 ? 10 + b : 10] = 1;
    } else if (SO_TIENG[t[i + 1]] === 10) {
      var c = SO_TIENG[t[i + 2]];
      ra[a * 10 + (c && c < 10 ? c : 0)] = 1;
    } else {
      ra[a] = 1;
    }
  }
  return ra;
}

/* Mã tra thẳng: "DK16", "HĐ-09", "T5P-03". Người hỏi gọi đúng mã thì
   đó là tín hiệu rõ nhất họ đưa ra — rõ hơn mọi tiếng khác trong câu. */
function macTrongCau(cauHoi) {
  var ra = [], m = String(cauHoi || '').toUpperCase()
    .replace(/Đ/g, 'D').match(/\b[A-Z]{2,6}[-_ ]?\d{1,3}\b/g);
  (m || []).forEach(function (t) { ra.push(boDau(t).replace(/\s+/g, '')); });
  return ra;
}

G.tlTra = function (cauHoi) {
  var ci = G.tlChiMuc();
  var tu = tachTu(cauHoi);
  if (!tu.length) return [];

  var N = ci.bg.length || 1, diem = {}, trung = {};
  var goi = G.tlLoaiDuocGoi ? G.tlLoaiDuocGoi(cauHoi) : { kho: {}, nhan: {} };

  /* bỏ tiếng trùng nhau trong câu hỏi, giữ thứ tự */
  var da = {}, tuRieng = [];
  tu.forEach(function (t) { if (!da[t]) { da[t] = 1; tuRieng.push(t); } });

  /* ── TIẾNG ĐÔI GHÉP LIỀN ──
     Tên kho viết liền không dấu: HOAHONG, HL_SAUNHIP, TAM_NHIN. Câu
     hỏi thì viết rời: "hoa hồng", "sáu nhịp". Ghép mọi cặp tiếng liền
     nhau trong câu rồi tra thêm — "hoa"+"hong" thành "hoahong", chạm
     đúng tên kho. Rẻ (n-1 phép tra) và không cần từ điển.

     Ghép được thì gần như chắc chắn đúng, nên cho nặng gấp rưỡi. */
  var tuGhep = [];
  for (var g = 0; g + 1 < tu.length; g++) {
    var gh = tu[g] + tu[g + 1];
    if (!da[gh] && ci.post[gh]) { da[gh] = 1; tuGhep.push(gh); }
  }

  function cong(t, he) {
    var p = ci.post[t];
    if (!p) return;
    var df = p.length / 2;
    var idf = Math.log(1 + (N - df + 0.5) / (df + 0.5));
    for (var i = 0; i < p.length; i += 2) {
      var j = p[i], f = p[i + 1], dai = Math.max(ci.bg[j].dai, SAN_DAI * ci.tbDai);
      var d = he * idf * (f * (K1 + 1)) / (f + K1 * (1 - B + B * dai / ci.tbDai));
      diem[j] = (diem[j] || 0) + d;
      (trung[j] || (trung[j] = [])).push(t);
    }
  }
  tuRieng.forEach(function (t) { cong(t, 1); });
  tuGhep.forEach(function (t) { cong(t, 1.5); });

  var ma = macTrongCau(cauHoi), so = soTrongCau(cauHoi);
  var ra = [], tangNha = G.aiTangNha ? G.aiTangNha() : null;
  var giuLai = 0, khoChuaKhai = [];

  Object.keys(diem).forEach(function (j) {
    var x = ci.bg[j];

    /* ── TRẦN TẦNG ──
       Giữ nguyên chỗ đứng cũ: LỌC TRƯỚC KHI XẾP HẠNG, không phải lọc
       sau khi hiện. Ở 9.72 khối này từng biến mất trong một lượt viết
       lại và không dòng nào báo — trợ lý vẫn trả lời, chỉ là trả lời
       tư liệu tầng trên cho nhà chưa tới tầng ấy. Mục 71 của bộ kiểm
       bắt được nhờ hai phép đo phụ demDuocGiuLai và manInGiuLai. */
    if (G.aiTrongTang) {
      var tt = G.aiTrongTang(x.khoNguon, x.goc, tangNha);
      if (!tt.ok) { giuLai++; return; }
      if (tt.chuaKhaiTang && khoChuaKhai.indexOf(x.khoNguon) < 0) khoChuaKhai.push(x.khoNguon);
    }

    var d = diem[j];
    /* Độ phủ câu hỏi: bản ghi chạm được nhiều phần câu hỏi thì hơn
       bản ghi gom nhiều điểm từ một tiếng. */
    d *= 0.55 + 0.45 * (trung[j].length / tuRieng.length);

    /* ── HAI MỨC GỌI TÊN, KHÔNG PHẢI MỘT ──
       Bản đầu gộp làm một và đo được hỏng ngay: câu "mười tám virus
       của hành lang thành công" chứa cả tên riêng kho ("virus" → HL_
       VIRUS) lẫn tên cả họ ("hành lang thành công" → mọi kho HL_).
       Cùng một hệ số thì cả họ được nâng đều nhau, và lợi thế của
       tên riêng biến mất — kết quả ra HL_CHISO.

       Nên tên riêng nặng gấp bốn, tên họ chỉ gấp rưỡi. */
    if (goi.kho[x.khoNguon]) d *= 4;
    else if (goi.nhan[x.khoNguon]) d *= 1.5;

    /* Con số trong câu khớp SỐ BẢN GHI của kho — xem chú giải ở
       soTrongCau(). Chỉ nâng khi khớp ĐÚNG, nên nhầm thì hiếm. */
    if (so[ci.demKho[x.khoNguon]]) d *= 3;
    /* Gọi thẳng mã */
    var maBG = boDau(x.ma).replace(/\s+/g, '');
    for (var k = 0; k < ma.length; k++)
      if (maBG === ma[k] || maBG.indexOf(ma[k]) >= 0) { d *= 4; break; }

    ra.push({
      khoNguon: x.khoNguon, loai: x.loai, mau: x.mau, go: x.go,
      ma: x.ma, ten: x.ten, tom: x.tom, goc: x.goc,
      diem: d, trungTen: [], trungThan: trung[j],
      boLoai: !!goi.kho[x.khoNguon]
    });
  });

  ra.sort(function (a, b) { return b.diem - a.diem; });

  /* Ngưỡng TƯƠNG ĐỐI, không phải hằng số.
     Ngưỡng tuyệt đối phải chỉnh lại mỗi lần đổi cách chấm, và lần
     nào quên chỉnh thì trợ lý im lặng hoặc nôn ra rác. Ngưỡng theo
     tỉ lệ với kết quả đầu bảng thì tự đi theo. */
  var dinh = ra.length ? ra[0].diem : 0;
  ra = ra.filter(function (x) { return x.diem >= dinh * 0.28; });

  var thay = {}, sach = [];
  ra.forEach(function (x) {
    var k = x.khoNguon + '|' + x.ma;
    if (thay[k]) return;
    thay[k] = 1; sach.push(x);
  });

  /* ══ MỘT KHO KHÔNG ĐƯỢC CHIẾM CẢ ĐẦU BẢNG ══

     Danh sách trả về có MƯỜI HAI chỗ. Trước 9.99.7 chúng chia theo
     điểm thuần, nên một kho ăn ba tới tám chỗ là chuyện thường:

       "Văn bản pháp lý cần soạn"  → RSP_CHAN · RSP_CHAN · RSP_CHAN
       "Cây quyết định chọn hợp đồng" → HSH_HD · HSH_HD · HSH_HD

     Cùng họ thì dùng chung gần hết vốn từ, nên bản ghi thứ hai và thứ
     ba của một kho gần như luôn đứng ngay sau bản ghi thứ nhất — và
     KHO ANH EM giữ đúng câu trả lời thì không còn chỗ mà chen vào.
     Đo trên bốn mươi câu: bảy câu trượt đúng vì lý do này, và kho cần
     tìm KHÔNG có mặt trong cả mười hai kết quả.

     Nên mỗi kho được cử tối đa HAI người vào bảng, phần dôi ra xếp
     xuống cuối chứ không bỏ đi — bỏ đi thì một câu hỏi mà thật sự chỉ
     một kho trả lời được sẽ mất kết quả thứ ba trở đi.

     Hai chứ không phải một: một thì một kho đúng thật cũng chỉ được
     nói một câu, và người hỏi mất luôn phần bổ nghĩa. Ba thì vẫn kín
     cả đầu bảng, đúng chỗ đang hỏng. */
  var demKho = {}, dau = [], sau = [];
  sach.forEach(function (x) {
    var n = (demKho[x.khoNguon] = (demKho[x.khoNguon] || 0) + 1);
    (n <= TRAN_MOI_KHO ? dau : sau).push(x);
  });
  var loc = dau.concat(sau).slice(0, 12);

  if (G.chamTaiNguyen) loc.forEach(function (x) { G.chamTaiNguyen(x.loai, x.ma); });

  loc.giuLaiVuotTang = giuLai;
  loc.khoChuaKhaiTang = khoChuaKhai;
  loc.tangNha = tangNha;
  loc.soKhoDaTra = ci.soKho;
  return loc;
};

/* Câu hỏi có gọi thẳng tên một loại tư liệu không.
   Dựng từ chính bảng nhãn, nên kho mới thêm mà có tiền tố đã khai
   thì tự có luôn — không phải sửa hàm này. */
G.tlLoaiDuocGoi = function (cauHoi) {
  var chu = boDau(cauHoi), nhan = {}, kho = {}, ci = CACHE;
  /* Mức HỌ: nhãn loại trúng thì đánh dấu mọi kho mang nhãn ấy */
  G.TL_NHAN.forEach(function (p) {
    if (chu.indexOf(boDau(p[1])) < 0) return;
    if (!ci) { nhan[p[0]] = 1; return; }
    ci.bg.forEach(function (x) { if (x.loai === p[1]) nhan[x.khoNguon] = 1; });
  });
  /* Mức RIÊNG: tên gọi khai tay trong src/tro-ly-rong.js, trỏ đúng
     một kho. Đây là tín hiệu chắc nhất người hỏi đưa ra. */
  (G.aiNguonThem ? G.aiNguonThem() : []).forEach(function (n) {
    (n.goiTen || []).forEach(function (t) {
      if (t && chu.indexOf(boDau(t)) >= 0) kho[n.ten_kho] = 1;
    });
  });
  return { nhan: nhan, kho: kho };
};

/* ═══════════════════════════════════════════════════════════════
   KHOÁ — ba điều phải chứng minh, không phải khai
   ═══════════════════════════════════════════════════════════════ */

/* 1 · Mọi tên trong danh sách cấm phải có LÝ DO, và lý do phải thuộc
       bốn loại đã định. Cấm mà không nói vì sao thì lần sau người ta
       gỡ ra, vì không ai biết gỡ thì hỏng gì. */
G.tlSoiCam = function () {
  var loi = [], so = 0;
  for (var k in G.TL_CAM) {
    so++;
    var v = String(G.TL_CAM[k] || '');
    if (!/^(ca-nhan|nhat-ky|khung|rieng)\s·\s.{10,}/.test(v))
      loi.push(k + ' cấm mà lý do không đúng hình "loại · vì sao": ' + v.slice(0, 40));
  }
  if (so < 20) loi.push('danh sách cấm chỉ còn ' + so + ' tên — có người vừa gỡ bớt');
  return { chuaDo: false, loi: loi, so: so };
};

/* 2 · KHÔNG kho nào trong chỉ mục mang hình dữ liệu cá nhân.
       Chặn theo TÊN kho thì phụ thuộc trí nhớ người viết. Phép này
       dò theo HÌNH DỮ LIỆU: quét mọi kho ĐÃ vào chỉ mục tìm trường
       email, số điện thoại, căn cước, ngày sinh. Kho mới thêm ngày
       mai mà lỡ mang dữ liệu người thật thì phép này bắt, còn danh
       sách cấm thì không. */
var HINH_CANHAN = [
  { ten: 'thư điện tử', re: /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i },
  { ten: 'số điện thoại', re: /(^|[^0-9])0\d{9,10}([^0-9]|$)/ },
  { ten: 'căn cước', re: /(^|[^0-9])\d{12}([^0-9]|$)/ }
];
var TRUONG_CANHAN = /^(email|mail|sdt|dienThoai|phone|cccd|cmnd|diaChi|address|hoTen|ngaySinh|birthday)$/i;

/* ── BỐN CHỖ ĐÃ XEM TẬN NƠI ──
   Phép dò trên bắt bốn kho ngay lượt chạy đầu. Mở ra xem thì cả bốn
   là dữ liệu CỦA HỌC VIỆN, không phải của người: tổng đài
   08.5555.4688 và các hòm thư vai @gita365.vn.

   Nhưng KHÔNG được sửa phép dò cho nó thôi kêu — đó là cách một phép
   kiểm chết. Thay vào đó là bảng ngoại lệ này: mỗi tên kèm lý do đã
   xem, và phép dò vẫn kêu nguyên vẹn với mọi kho chưa có tên ở đây.
   Ngày mai ai thêm một kho mang số điện thoại người thật thì nó bắt. */
G.TL_CANHAN_DA_XEM = {
  KETNOI:       'số 08.5555.4688 là tổng đài Học viện, không phải số của người',
  LIENKET:      'cùng số tổng đài ấy',
  PERSONA:      'các hòm thư vai @gita365.vn — địa chỉ chức danh, không gắn người',
  LUAT_LAMVIEC: 'tổng đài và số tài khoản của pháp nhân'
};

G.tlSoiKhongCaNhan = function () {
  var ci = G.tlChiMuc(), loi = [], daBao = {}, soDo = 0;
  ci.bg.forEach(function (x) {
    if (daBao[x.khoNguon] || G.TL_CANHAN_DA_XEM[x.khoNguon]) return;
    var g = x.goc;
    if (!g || typeof g !== 'object') return;
    soDo++;
    for (var k in g) {
      if (!Object.prototype.hasOwnProperty.call(g, k)) continue;
      if (TRUONG_CANHAN.test(k) && g[k]) {
        daBao[x.khoNguon] = 1;
        loi.push(x.khoNguon + ' có trường "' + k + '" — hình dữ liệu cá nhân, phải vào TL_CAM');
        return;
      }
    }
    var s = x.tom || '';
    for (var i = 0; i < HINH_CANHAN.length; i++) {
      if (HINH_CANHAN[i].re.test(s)) {
        daBao[x.khoNguon] = 1;
        loi.push(x.khoNguon + ' chứa ' + HINH_CANHAN[i].ten + ' trong nội dung — phải vào TL_CAM');
        return;
      }
    }
  });
  return { chuaDo: false, loi: loi, soBanGhiDo: soDo, soKho: ci.soKho };
};

/* 3 · Khách hàng KHÔNG tra được kho của nghề.
       Đây là phép đo, không phải lời khai: dựng danh sách cấm-với-
       khách từ chính các tiền tố đã ghi lý do, rồi soát xem có tên
       nào lọt vào TL_KHACH_XEM không. */
G.tlSoiKhachKhongVuot = function () {
  var loi = [];
  var cam = Object.keys(G.TL_KHACH_KHONG_VI);
  G.TL_KHACH_XEM.forEach(function (ten) {
    cam.forEach(function (p) {
      var goc = p.replace(/\*$/, '');
      if (p.slice(-1) === '*' ? ten.indexOf(goc) === 0 : ten === goc) {
        /* BC_MUNG là ngoại lệ đã ghi rõ trong lý do của BC_* */
        if (ten === 'BC_MUNG') return;
        loi.push(ten + ' nằm trong danh sách cho khách tra, mà tiền tố ' + p +
          ' đã ghi là không cho: ' + G.TL_KHACH_KHONG_VI[p]);
      }
    });
  });
  /* Kho cho khách mà không tồn tại thì danh sách đang mục ruỗng dần */
  var thieu = G.TL_KHACH_XEM.filter(function (t) { return !Array.isArray(G[t]); });
  return { chuaDo: false, loi: loi, soChoKhach: G.TL_KHACH_XEM.length,
    khongCoTrongBoNho: thieu };
};

})();
