/* ═══════════════════════════════════════════════════════════════
   GITA 365 — BỘ NÃO, PHẦN CHẠY Ở MÁY CHỦ

   Bản chép của G.BN_* — máy chủ không đọc được kho đã mã hoá. Bộ kiểm
   mục 78 đối chiếu từng ô với bản gốc.

   ══ TỆP NÀY LÀM ĐÚNG BA VIỆC ══

     soatRao10()    chạy hàng rào mười điểm trên một đoạn chữ
     soatRaNgoai()  dò dữ liệu NHẬN DẠNG ĐƯỢC trước khi thứ gì rời hệ
     vungCuaViec()  một việc rơi vào vùng uỷ quyền nào

   Không có việc thứ tư. Bảy phân hệ của bản đặc tả sẽ gọi ba hàm này
   chứ không viết lại chúng — viết lại là dựng bản thứ hai của một luật,
   và bản thứ hai thì sau vài bản nói khác bản gốc.
   ═══════════════════════════════════════════════════════════════ */

/* ── DÒ THEO BIÊN ÂM TIẾT, TRỪ CỤM GHÉP ──
   Bẫy thứ ba của phép dò chữ tiếng Việt: khoảng trắng ngăn ÂM TIẾT chứ
   không ngăn TỪ. "bé" đứng riêng trong "bé tập bò", "em bé", "bé nhỏ" —
   mà "bé tập bò" chính là tên Điều 4, nên không trừ thì hàng rào bắt oan
   ngay chính hiến pháp của nó. */
const TRU_CHUNG = ['bé tập bò', 'em bé', 'bé nhỏ', 'bé xíu', 'nhỏ bé',
  'cháu bé', 'trẻ nhỏ'];

function coTuBN(chu, cum, tru) {
  let t = ' ' + String(chu || '').toLowerCase().replace(/\s+/g, ' ') + ' ';
  (tru || []).forEach(x => { t = t.split(x).join(' '); });
  return t.indexOf(' ' + cum + ' ') >= 0 ||
         t.indexOf(' ' + cum + ',') >= 0 ||
         t.indexOf(' ' + cum + '.') >= 0 ||
         t.indexOf(' ' + cum + '!') >= 0 ||
         t.indexOf(' ' + cum + '?') >= 0;
}

/* ═══════════════ BẢN CHÉP CỦA KHO ═══════════════ */

export const HIENPHAP = [
  [1, 'HP01', 'SỰ THẬT', 'may'], [2, 'HP02', 'ĐỨA TRẺ', 'nguoi'],
  [3, 'HP03', 'XƯNG HÔ', 'may'], [4, 'HP04', 'BÉ TẬP BÒ', 'may'],
  [5, 'HP05', 'TRI KỶ', 'may'], [6, 'HP06', 'KHÔNG PHÁN XÉT', 'may'],
  [7, 'HP07', 'LẰN RANH', 'may'], [8, 'HP08', 'MỘT NGUỒN SỰ THẬT', 'may'],
  [9, 'HP09', 'DẤU VẾT', 'may'], [10, 'HP10', 'CHỐNG THỔI PHỒNG', 'may'],
  [11, 'HP11', 'QUYỀN TỰ CHỦ', 'nguoi'], [12, 'HP12', 'CÔNG BẰNG', 'nguoi'],
  [13, 'HP13', 'THƯỢNG TÔN PHÁP LUẬT', 'may']
];

export const RAO10 = [
  ['R1', 1, true, 1], ['R2', 2, true, 1], ['R3', 3, true, 7], ['R4', 4, true, 6],
  ['R5', 5, true, 3], ['R6', 6, true, 4], ['R7', 7, true, 5], ['R8', 8, true, 10],
  ['R9', 9, false, 8], ['R10', 10, true, 13]
];

export const VUNG = [['XANH', 60], ['VANG', 25], ['DO', 15]];

export const GHE = [
  ['G1', 'Tham mưu trưởng', false], ['G2', 'Người giữ tiền', false],
  ['G3', 'Người kéo khách', false], ['G4', 'Người giữ khách', false],
  ['G5', 'Người giữ chất lượng', true], ['G6', 'Người giữ đội ngũ', false],
  ['G7', 'Người giữ luật', true]
];

export const ANDANH = ['AD-TEN', 'AD-SDT', 'AD-MAIL', 'AD-DIACHI', 'AD-CCCD',
  'AD-TRUONG'];

/* ── BẢNG DÒ CỦA TỪNG ĐIỂM HÀNG RÀO ── */
const CAM_KET = ['cam kết', 'đảm bảo', 'chắc chắn đạt', 'bảo đảm kết quả',
  'hoàn tiền nếu không', 'chắc chắn thành'];
const LAN_RANH = ['chẩn đoán', 'kê đơn', 'liều dùng', 'phác đồ điều trị',
  'tự kỷ', 'tăng động', 'trầm cảm', 'lãi suất', 'lợi nhuận đầu tư',
  'khởi kiện', 'truy tố'];
const PHAN_XET = ['cha mẹ sai', 'bố mẹ sai', 'anh chị sai', 'nuôi con sai cách',
  'thua người khác', 'kém hơn', 'không biết dạy'];
const XUNG_HO_SAI = ['bé', 'cháu'];
const THOI_PHONG = ['tốt nhất', 'số một', 'duy nhất', 'thần kỳ', 'đột phá',
  'vượt trội', 'gấp 10 lần', 'gấp mười lần', 'thiên tài hoá', 'kỳ diệu',
  'bí quyết vàng', 'cam kết 100%'];
const TRI_KY = [
  ['nghe', ['em nghe', 'em đọc', 'em hiểu', 'anh chị kể']],
  ['goiTen', ['mệt', 'lo', 'sốt ruột', 'buồn', 'bất lực', 'nản']],
  ['hyVong', ['nhiều nhà', 'thường gặp', 'có cách', 'đã có nhà']],
  ['buocNho', ['tối nay', 'ngày mai', 'thử', 'ghi một dòng', 'làm một việc']],
  ['hen', ['hẹn', 'mấy hôm nữa', 'tuần sau', 'em nhắn lại', 'báo em']]
];

/* Con số KHÔNG CÓ NGUỒN. Bắt số phần trăm và số lớn đứng trần — chúng
   là hình của một lời khoe, còn "3 bước" hay "21 ngày" thì không.
   Bỏ qua số có nguồn đi kèm trong cùng câu. */
const DAU_NGUON = ['theo', 'nguồn', 'khảo sát', 'nghiên cứu', 'luật', 'nghị định',
  'điều', 'thông tư', 'báo cáo'];

function soKhongNguon(chu) {
  const cau = String(chu || '').split(/[.!?\n]+/);
  const ra = [];
  cau.forEach(c => {
    const t = c.toLowerCase();
    const coNguon = DAU_NGUON.some(d => t.indexOf(d) >= 0);
    if (coNguon) return;
    /* Phần trăm, hoặc số từ bốn chữ số trở lên — hai hình của một con
       số đi khoe. Số nhỏ trần ("3 bước", "21 ngày") là số CHỈ DẪN, và
       bắt chúng thì hàng rào đỏ ở mọi bài tử tế. */
    const m = c.match(/\b\d+([.,]\d+)?\s*%|\b\d{4,}\b/g);
    if (m) ra.push(...m.map(x => x.trim()));
  });
  return ra;
}

/* ═══════════════ HÀNG RÀO MƯỜI ĐIỂM ═══════════════

   Trả về TỪNG ĐIỂM một, không trả một con số tổng. Một con số tổng thì
   chín điểm sạch và một điểm phạm nặng ra cùng kết quả với mười điểm
   hơi phạm — mà hai chuyện ấy cần hai cách xử lý khác hẳn nhau.

   Điểm R9 luôn trả về `nguoiDoc: true`: máy không biết GITA đang có
   năng lực gì. Trình nó ra như đã kiểm là chỗ tệ nhất của cả hàng rào. */
export function soatRao10(chu, y) {
  const t = String(chu || '');
  const o = y || {};
  const pham = [];
  const ghi = (ma, thay) => pham.push({ ma, thay });

  const so = soKhongNguon(t);
  if (so.length) ghi('R1', so.slice(0, 6));

  const ck = CAM_KET.filter(c => t.toLowerCase().indexOf(c) >= 0);
  if (ck.length) ghi('R2', ck);

  const lr = LAN_RANH.filter(c => t.toLowerCase().indexOf(c) >= 0);
  if (lr.length) ghi('R3', lr);

  const px = PHAN_XET.filter(c => t.toLowerCase().indexOf(c) >= 0);
  if (px.length) ghi('R4', px);

  const xh = XUNG_HO_SAI.filter(c => coTuBN(t, c, TRU_CHUNG));
  if (xh.length) ghi('R5', xh);

  /* R6 — ba phép đếm, nêu riêng từng phép: cắt một câu dài khác hẳn
     cắt một con số thừa. */
  const r6 = [];
  const cauDai = t.split(/[.!?\n]+/).map(c => c.trim()).filter(Boolean)
    .filter(c => c.split(/\s+/).length > 20);
  if (cauDai.length) r6.push(cauDai.length + ' câu quá 20 chữ');
  const doanDai = t.split(/\n\s*\n/).filter(d => d.split(/\n/).length > 4);
  if (doanDai.length) r6.push(doanDai.length + ' đoạn quá 4 dòng');
  const demSo = (t.match(/\b\d+([.,]\d+)?\b/g) || []).length;
  if (demSo > 2) r6.push(demSo + ' con số, quá 2');
  if (r6.length) ghi('R6', r6);

  /* R7 — đo CÓ MẶT năm phần của vòng Tri kỷ, không đo chất lượng. Chỉ
     chạy khi bài tự khai là một câu TRẢ LỜI KHÁCH: một bài giới thiệu
     sản phẩm không có lý do phải mang đủ năm bước, và bắt nó là làm
     hàng rào đỏ ở chỗ không có lỗi. */
  if (o.laTraLoiKhach) {
    const thieu = TRI_KY.filter(([, dau]) =>
      !dau.some(d => t.toLowerCase().indexOf(d) >= 0)).map(([b]) => b);
    if (thieu.length) ghi('R7', thieu);
  }

  const tp = THOI_PHONG.filter(c => t.toLowerCase().indexOf(c) >= 0);
  if (tp.length) ghi('R8', tp);

  const ra = soatRaNgoai(t);
  if (!ra.sach) ghi('R10', ra.ngo.map(n => n.ma + ': ' + n.thay));

  return {
    dat: pham.length === 0,
    pham,
    /* R9 KHÔNG bao giờ nằm trong `pham` và cũng không bao giờ nằm trong
       phần sạch — nó luôn là việc của người, và nói ra ở một ô riêng. */
    nguoiPhaiDoc: ['R9'],
    viR9: 'Máy không biết GITA đang có năng lực gì — danh sách ấy đổi mỗi bản, ' +
      'và một bản chép của nó trong bộ dò sẽ cũ đi lặng lẽ. Người duyệt đọc.',
    soDiemMayDo: RAO10.filter(r => r[2]).length
  };
}

/* ═══════════════ LUẬT VẬN HÀNH SỐ 1 — ẨN DANH TRƯỚC KHI RA NGOÀI ═══════════════

   Cửa đi ra của kho (guiDeBaiRaNgoai) kiểm quyền, kiểm bậc, kiểm cổng —
   và tới 9.99.61 KHÔNG kiểm một chữ nào về dữ liệu người. Nghĩa là một
   cái tên trẻ con lọt vào đề bài thì nó đi thẳng ra bộ tạo ảnh đặt ở
   nước ngoài, và Luật số 91/2025/QH15 gọi đó là xử lý dữ liệu xuyên
   biên giới.

   NGỜ LÀ ĐỦ ĐỂ CHẶN. Một cái tên bị bắt oan thì tốn của người gửi ba
   mươi giây sửa lại; một cái tên lọt thì nó đã ra khỏi hệ và không gọi
   về được. Phép cân ấy lệch hẳn về một phía, nên bộ dò được phép thà
   bắt oan.

   VÀ MÁY KHÔNG TỰ XOÁ HỘ. Tự xoá thì người gửi không biết mình vừa
   suýt gửi cái gì, và lần sau viết y hệt; tệ hơn nữa, một phép xoá tự
   động sót một chỗ thì người gửi đã yên tâm rồi. */

/* Họ người Việt — đứng trước một chữ viết hoa thì gần như chắc là tên
   người. MỞ RỘNG ở 9.99.113: tổ thanh tra đợt 3 chạy thật và chứng minh
   danh sách ~25 họ cũ để lọt "Trịnh Minh Anh", "Đào Gia Bảo", "Vương
   Gia Bảo", "Tống Minh Khôi" (họ ngoài danh sách, không dấu hiệu trẻ).
   Nay phủ gần trọn họ người Việt.

   GIỚI HẠN VẪN CÒN, nói thẳng (một lớp bảo vệ không nói giới hạn thì
   người đọc tin nó chống được nhiều hơn thật): một họ CỰC hiếm ngoài
   danh sách, viết KHÔNG kèm dấu hiệu trẻ (con/cháu/bé), vẫn lọt AD-TEN —
   khi ấy AD-TRECON/AD-TENLON (dò theo CẤU TRÚC) mới là lưới thứ hai.
   Danh sách CỐ Ý bỏ vài họ trùng từ thông dụng/địa danh (hà·la·tô·kim·
   ô·giang·âu·bạch·đường·lương·tôn·tăng·thân·đồng·lại) để không chặn oan
   "Hà Nội", "Bảng Lương"… — cân theo luật "ngờ là đủ để chặn" NHƯNG một
   feature chặn mọi brief nhắc Hà Nội thì tự nó hỏng. */
const HO_VIET = ['nguyễn', 'trần', 'lê', 'phạm', 'hoàng', 'huỳnh', 'phan', 'vũ',
  'võ', 'đặng', 'bùi', 'đỗ', 'hồ', 'ngô', 'dương', 'lý', 'trương', 'đinh',
  'lâm', 'mai', 'tạ', 'chu', 'đoàn', 'cao', 'thái',
  'trịnh', 'đào', 'vương', 'tống', 'mạc', 'đàm', 'quách', 'hứa', 'khương',
  'doãn', 'chử', 'kiều', 'phùng', 'cù', 'uông', 'ưng', 'giáp', 'sái',
  'đái', 'quản'];

/* HỌ DỄ TRÙNG TỪ THÔNG DỤNG/ĐỊA DANH (9.99.114) — tổ thanh tra $500M chứng
   minh bằng CHẠY THẬT rằng mười họ này lọt cổng: "Lương Gia Bảo hay khóc",
   "Hà Bảo Anh sợ", "Kim Ngọc Diệp"… Bỏ hẳn thì lọt tên trẻ; thêm trần vào
   HO_VIET thì "Hà Nội"·"Tô Màu"·"triệu Đồng" bắt oan (lanhR3). Cách gỡ:
   chỉ chặn khi CÓ ĐỆM VIỆT giữa họ và tên — "Hà Bảo Anh" (Bảo là đệm) chặn,
   "Hà Nội mùa" (Nội không phải đệm) qua. Chọn dấu hiệu, không dựng danh sách
   trừ (9.99.56). */
const HO_HIEM = ['hà', 'la', 'tô', 'kim', 'giang', 'đồng', 'lại', 'tôn', 'tăng',
  'âu', 'bạch', 'đường', 'thân', 'ô', 'lương'];
/* ĐỆM/TÊN VIỆT — dấu hiệu một cụm Titlecase LÀ tên người thật, không phải
   một cụm danh từ Title-Case ("Tô Màu Nước", "Đồng Hồ Cát"). Bounded, dài
   thêm chỉ khi bắt oan/lọt thật. */
const NAME_SYL = ['văn', 'thị', 'gia', 'minh', 'ngọc', 'bảo', 'anh', 'tuấn',
  'kiệt', 'quân', 'hân', 'long', 'tú', 'khang', 'diệp', 'hương', 'đức', 'hoàng',
  'quang', 'thanh', 'hữu', 'xuân', 'thu', 'mai', 'phương', 'hồng', 'nam', 'khôi',
  'khoa', 'lan', 'linh', 'hùng', 'dũng', 'trang', 'nhi', 'vy', 'duy', 'bình',
  'nhật', 'quỳnh', 'thảo', 'châu', 'my', 'vân', 'hà', 'như', 'yến', 'trâm',
  'hạnh', 'loan', 'tâm', 'phúc', 'thắng', 'sơn', 'tùng', 'việt', 'ánh', 'ngân',
  'uyên', 'trí', 'thành', 'tiến', 'đạt', 'huy'];
/* DẤU HIỆU TRẺ QUAN SÁT ĐƯỢC — cụm nhiều âm tiết. Một cụm hai chữ hoa (tên
   cho, không kèm họ: "Minh Anh sợ") đứng ngay trước một dấu hiệu này là tên
   trẻ. Không dò "sợ" trần trong câu không tên. */
const VE_TRE = ['sợ', 'khóc', 'nhút nhát', 'biếng ăn', 'chậm nói', 'không chịu',
  'tự kỷ', 'tăng động', 'bám mẹ', 'ăn vạ', 'hay quên', 'rụt rè', 'bướng',
  'lì lợm', 'cắn', 'đánh bạn', 'tè dầm', 'giật mình'];
/* CHỮ NHÌN GIỐNG LATIN từ Cyrillic/Greek — "Нguyễn" (Cyrillic Н) NFKC KHÔNG
   gộp về Latin, nên lọt cổng cũ. Gộp về Latin để lưới tên bắt, VÀ cờ riêng
   AD-TRON cho token TRỘN chữ (không tên Việt thật nào trộn hai bảng chữ). */
const CHU_TRON = {
  'А': 'A', 'В': 'B', 'Е': 'E', 'К': 'K', 'М': 'M', 'Н': 'H', 'О': 'O', 'Р': 'P',
  'С': 'C', 'Т': 'T', 'У': 'Y', 'Х': 'X', 'а': 'a', 'е': 'e', 'о': 'o', 'р': 'p',
  'с': 'c', 'у': 'y', 'х': 'x', 'к': 'k', 'м': 'm', 'н': 'h', 'т': 't', 'в': 'b',
  'Α': 'A', 'Β': 'B', 'Ε': 'E', 'Ζ': 'Z', 'Η': 'H', 'Ι': 'I', 'Κ': 'K', 'Μ': 'M',
  'Ν': 'N', 'Ο': 'O', 'Ρ': 'P', 'Τ': 'T', 'Υ': 'Y', 'Χ': 'X', 'α': 'a', 'ο': 'o',
  'ρ': 'p', 'ν': 'v', 'κ': 'k', 'μ': 'm', 'τ': 't', 'ι': 'i'
};
const NT_TEN = '\\p{Lu}[\\p{L}\\p{M}]*';   /* một token tên: Titlecase · TOÀN HOA · dấu chèn */
const capHo = (arr) => Array.from(new Set(arr.flatMap((h) => {
  const tc = h.charAt(0).toLocaleUpperCase('vi-VN') + h.slice(1);
  const uc = h.toLocaleUpperCase('vi-VN');
  return uc === tc ? [tc] : [uc, tc];
}))).sort((x, y) => y.length - x.length);
const boDauMark = (s) => s.normalize('NFD').replace(/\p{M}/gu, '');

export function soatRaNgoai(chu) {
  /* CHUẨN HOÁ CHỐNG NÉ (9.99.113) — hai lỗ CRITICAL tổ thanh tra đợt 3
     chứng minh bằng cách CHẠY THẬT:
     · Ký tự vô hình (zero-width U+200B–200D, word-joiner U+2060, BOM,
       RTL-override U+202A–202E, soft-hyphen, U+034F) chèn GIỮA một cái
       tên/số thì `\s` và `\d` không thấy — "Ng​uyễn Thị Lan" trả
       sach:true, đi thẳng ra bộ tạo ảnh nước ngoài, người nhận đọc tên
       bình thường. Nên BỎ HẲN mọi ký tự định dạng/vô hình TRƯỚC khi dò.
     · Chữ số toàn-rộng (U+FF10–FF19) không khớp `\d`, và NFC KHÔNG gộp
       chúng — chỉ NFKC mới gộp `０→0`. Nên chuẩn hoá NFKC, không NFC.
     Cả hai là "ngờ là đủ để chặn" đi đúng chiều: chuẩn hoá mạnh hơn thì
     khó né hơn, và một brief lành không mất gì. */
  const gocXoa = String(chu || '').replace(/[\p{Cf}\u034F]/gu, '');
  const t = gocXoa.normalize('NFKC');          /* vô hình BỎ — số/ngày/email dùng bản này */
  /* vô hình → DẤU CÁCH: một zero-width dùng làm dấu cách ("Nguyễn‌Thị"
     · "con‌Đặng") khi bỏ hẳn thì DÍNH liền, lưới tên trượt. Quét tên
     trên CẢ hai bản (bỏ · thay-cách) rồi hợp lại: bản bỏ bắt vô hình GIỮA
     từ ("Ng​uyễn"→"Nguyễn"), bản thay-cách bắt vô hình GIỮA hai từ. */
  const tCach = String(chu || '').replace(/[\p{Cf}\u034F]/gu, ' ').normalize('NFKC');
  /* GỘP CHỮ NHÌN GIỐNG LATIN (9.99.114) — "Нguyễn" (Cyrillic Н) NFKC không
     gộp, nên bản cũ mù. Quét tên trên CẢ bản gốc LẪN bản gộp confusable. */
  const gop = (s) => s.replace(/[А-Яа-яЁёΑ-Ωα-ω]/g, (c) => CHU_TRON[c] || c);
  const bans = [t, tCach, gop(t), gop(tCach)];
  const quetHai = (re) => bans.flatMap((b) => b.match(re) || []);
  /* BẢN BỎ DẤU + GỘP (9.99.114) — dấu tổ hợp chèn ("Nguyễn"+U+0301) phá lưới
     họ chữ-nguyên, và tên La-tinh hoá "TRAN THI B" thì họ mang dấu không
     khớp. Quét thêm bản bỏ dấu, CHỈ khi có ĐỆM (bỏ dấu làm đình↔đinh trùng,
     đệm là chốt chống oan). */
  const banGon = boDauMark(gop(t)) + '\n' + boDauMark(gop(tCach));
  const ngo = [];

  /* AD-TEN — HỌ + TÊN, ba lưới (9.99.114, tổ thanh tra $500M chứng minh
     lọt bằng CHẠY THẬT): (1) họ CHÍNH (HO_VIET) Titlecase HOẶC TOÀN HOA +
     một token — "Nguyễn Thị", "NGUYỄN VĂN AN" (toàn hoa, bản cũ mù);
     (2) họ DỄ TRÙNG (HO_HIEM) + ĐỆM VIỆT + token — "Hà Bảo Anh" chặn,
     "Hà Nội mùa" qua (Nội không phải đệm; chọn dấu hiệu, không danh sách
     trừ — 9.99.56); (3) bản bỏ dấu+gộp: họ + đệm + token — bắt dấu chèn
     "Nguyễń Thị" và "TRAN THI B". KHÔNG cờ i (9.99.113); TOÀN HOA vào
     alternation qua capHo(). */
  const CORE = capHo(HO_VIET);
  const EXT = capHo([...HO_VIET, ...HO_HIEM]);
  const DEM = capHo(NAME_SYL);
  const CORE_GON = capHo(HO_VIET.map(boDauMark));
  const DEM_GON = capHo(NAME_SYL.map(boDauMark));
  const ten = [].concat(
    quetHai(new RegExp('(?<![\\p{L}\\p{M}])(?:' + CORE.join('|') + ')\\s+\\p{Lu}[^\\s,.;:!?]*', 'gu')),
    quetHai(new RegExp('(?<![\\p{L}\\p{M}])(?:' + EXT.join('|') + ')\\s+(?:' + DEM.join('|') + ')\\s+' + NT_TEN, 'gu')),
    (banGon.match(new RegExp('(?<![\\p{L}\\p{M}])(?:' + CORE_GON.join('|') + ')\\s+(?:' + DEM_GON.join('|') + ')\\s+\\p{Lu}[\\p{L}\\p{M}]*', 'gu')) || [])
  );
  if (ten.length) ngo.push({ ma: 'AD-TEN', thay: Array.from(new Set(ten)).slice(0, 5).join(' · ') });

  /* AD-TENTHUONG — TÊN GÕ THƯỜNG / TỰ-VIẾT-HOA-MỘT-CHỮ (9.99.122). Tổ soi
     $500M chứng minh CHẠY THẬT: mọi lưới AD-TEN đòi chữ hoa đầu (NT_TEN,
     capHo Titlecase/HOA), nên tên gõ THƯỜNG hoặc tự-viết-hoa-một-chữ lọt
     SẠCH — "con nguyễn văn an", "Nguyễn văn an, 8 tuổi", "mẹ nguyễn thị
     hoa", "Họ tên con: nguyễn văn an" — mà gõ thường là cách gõ THƯỜNG NHẤT
     trên điện thoại. Cùng bẫy đã gỡ cho HỌ ở 9.99.111, nay tái ở HOA/THƯỜNG.
     Bỏ chữ hoa làm chốt thì bắt oan "trần nhà"·"lê la", nên buộc một NEO
     NGƯỜI: (A) dấu người/trẻ ĐỨNG TRƯỚC họ, hoặc (B) họ+tên rồi một dấu hiệu
     trẻ (tuổi·lớp·trạng thái) ĐỨNG SAU. Danh sách họ so KHÔNG phân biệt
     hoa/thường (cờ i) — an toàn vì lưới này KHÔNG dùng \p{Lu} (bẫy i→\p{Lu}
     ở 9.99.113 không áp). Neo người nên "trần nhà" (không neo) vẫn qua. */
  const HO_CI = Array.from(new Set([...HO_VIET, ...HO_HIEM]
    .map((h) => h.toLocaleLowerCase('vi-VN')))).sort((a, b) => b.length - a.length).join('|');
  const CTX_NG = 'con|bé|cháu|nhóc|học sinh|học viên|họ tên|tên|gọi là|mẹ|bố|ba|cha|chị|anh|cô|chú|dì|cậu|bác|thầy|phụ huynh';
  const DAU_TRE2 = '\\d+[^\\S\\r\\n]*tuổi|lớp[^\\S\\r\\n]*\\d|' + VE_TRE.join('|');
  const SYL = '[\\p{L}\\p{M}]+';
  /* SEP: giữa dấu người và họ — khoảng-ngang rồi tuỳ dấu hai chấm, HOẶC dấu
     hai chấm dính liền ("con: nguyễn") rồi khoảng-ngang. Không dùng \s (kẻo
     vắt qua dòng/ô). */
  const SEP = '(?:[^\\S\\r\\n]+[:：]?[^\\S\\r\\n]*|[:：][^\\S\\r\\n]+)';
  const reCtxThuong = new RegExp('(?<![\\p{L}\\p{M}])(?:' + CTX_NG + ')' + SEP +
    '(?:' + HO_CI + ')(?:[^\\S\\r\\n]+' + SYL + '){1,3}', 'giu');
  const reDauThuong = new RegExp('(?<![\\p{L}\\p{M}])(?:' + HO_CI +
    ')(?:[^\\S\\r\\n]+' + SYL + '){1,3}[\\s,.;:]+(?:' + DAU_TRE2 + ')', 'giu');
  const tenThuong = [].concat(quetHai(reCtxThuong), quetHai(reDauThuong));
  if (tenThuong.length) ngo.push({ ma: 'AD-TENTHUONG',
    thay: Array.from(new Set(tenThuong)).slice(0, 5).join(' · ') });

  /* AD-TRON — token TRỘN hai bảng chữ (9.99.114). "Нguyễn" = Cyrillic Н +
     Latin. Không tên/từ Việt thật nào trộn Cyrillic/Greek với Latin — một
     token trộn LÀ dấu né homoglyph; lưới chung, không cần biết trước chữ
     nào ánh xạ chữ nào. */
  const tron = (t.match(/[\p{L}\p{M}]{2,}/gu) || [])
    .filter((w) => /[Ͱ-ϿЀ-ӿ]/.test(w) && /[A-Za-zÀ-ỹ]/u.test(w));
  if (tron.length) ngo.push({ ma: 'AD-TRON', thay: Array.from(new Set(tron)).slice(0, 5).join(' · ') });

  /* AD-TRECON — DẤU HIỆU NGƯỜI + TÊN CHỮ HOA, không dựa vào danh sách họ.
     "con Trịnh Minh Anh", "cháu Vương Minh", "tên Bống" — chỉ dấu trẻ đi
     liền một cụm Titlecase (\p{Lu}\p{Ll}+) là chặn, dù họ không có trong
     HO_VIET. KHÔNG cờ i (i làm \p{Lu} khớp cả chữ thường — đúng bẫy vừa
     gỡ ở reDc bản nháp): chỉ dấu viết cả hai hoa/thường bằng lớp [Cc]…,
     phần TÊN buộc Titlecase thật. "con 9 tuổi" (số, không hoa) KHÔNG dính,
     nên bản ẩn danh sạch vẫn qua. */
  /* [^\S\r\n]+ (khoảng trắng NGANG, không xuống dòng) giữa dấu hiệu và tên:
     một tên thật nằm gọn trong MỘT ô, không vắt qua ranh ô. Dùng \s+ thì
     "…của con \n Vào…" (con cuối ô này, Vào đầu ô sau) khớp oan — bắt được
     lúc chạy bộ thử, 9.99.112. */
  /* [^\S\r\n]+ (khoảng trắng NGANG). Zero-width nối "con" với tên
     ("con‌Đặng") được bản tCach lo (thành "con Đặng"), nên giữ + gọn
     và quét hai bản thay vì nới thành *. */
  /* Token tên NT_TEN = \p{Lu}[\p{L}\p{M}]* bắt cả Titlecase, TOÀN HOA
     ("con NGUYỄN VĂN AN", bản cũ mù) và dấu chèn. Cho một nối ngắn
     (là·tên·:·gọi là) giữa dấu hiệu và tên — "bé tên là NGUYỄN VĂN AN".
     "con 9 tuổi" (số, không hoa) KHÔNG dính, bản ẩn danh sạch vẫn qua. */
  const reConManh = new RegExp('(?<![\\p{L}\\p{M}])(?:[Cc]on|[Bb]é|[Cc]háu|[Tt]ên|[Nn]hóc|[Hh]ọc sinh)(?:[^\\S\\r\\n]+(?:là|tên|họ tên|gọi là|:))?[^\\S\\r\\n]+' + NT_TEN + '(?:[^\\S\\r\\n]+' + NT_TEN + '){0,3}', 'gu');
  const trecon = quetHai(reConManh);
  if (trecon.length) ngo.push({ ma: 'AD-TRECON', thay: Array.from(new Set(trecon)).slice(0, 5).join(' · ') });

  /* AD-TENLON — xưng hô người lớn + TÊN ĐẦY ĐỦ (≥2 token tên). Đòi hai
     token để không bắt oan "Cô Tấm"·"anh Khoai" cổ tích, mà vẫn bắt "chị
     VƯƠNG THỊ HÀ" (toàn hoa) và "chị Vương Thị Hà" (họ hiếm AD-TEN bỏ lọt). */
  const reNguoiLon = new RegExp('(?<![\\p{L}\\p{M}])(?:[Cc]hị|[Aa]nh|[Cc]ô|[Cc]hú|[Mm]ẹ|[Bb]ố|[Bb]a|[Dd]ì|[Cc]ậu|[Bb]ác|[Tt]hầy)[^\\S\\r\\n]+' + NT_TEN + '[^\\S\\r\\n]+' + NT_TEN + '(?:[^\\S\\r\\n]+' + NT_TEN + '){0,2}', 'gu');
  const tenLon = quetHai(reNguoiLon);
  if (tenLon.length) ngo.push({ ma: 'AD-TENLON', thay: Array.from(new Set(tenLon)).slice(0, 5).join(' · ') });

  /* AD-TREVE — TÊN CHO (≥2 token, không cần họ) + dấu hiệu trẻ quan sát được
     (9.99.114). "Minh Anh sợ bị cười" — tên gọi + "sợ". Bắt tên không họ,
     không xưng hô người lớn, lộ ra vì đứng ngay trước một trạng thái trẻ.
     (?![\p{L}]) sau cụm để "sợ" không dính một từ dài hơn. */
  const reTreVe = new RegExp('(?<![\\p{L}\\p{M}])' + NT_TEN + '[^\\S\\r\\n]+' + NT_TEN + '(?:[^\\S\\r\\n]+' + NT_TEN + ')?[^\\S\\r\\n]+(?:' + VE_TRE.join('|') + ')(?![\\p{L}])', 'gu');
  const treVe = quetHai(reTreVe);
  if (treVe.length) ngo.push({ ma: 'AD-TREVE', thay: Array.from(new Set(treVe)).slice(0, 5).join(' · ') });

  /* AD-SDT — số máy Việt Nam. Nhận cả +84 và số dán liền một chữ
     ("sđt0912…"): dùng lookaround chữ số (?<!\d)…(?!\d) thay cho \b —
     \b không có biên giữa "t" và "0" nên số dán chữ lọt (bẫy \b). */
  const sdt = t.match(/(?<!\d)(?:\+?84[\s.\-]?|0)\d(?:[\d\s.\-()]{6,11})\d(?!\d)/g);
  if (sdt) ngo.push({ ma: 'AD-SDT', thay: sdt.slice(0, 3).join(' · ') });

  /* AD-NGAYSINH — ngày sinh là định danh cá nhân theo Luật 91. Bắt cả
     "sinh ngày 12/03/2016" lẫn dãy ngày trần dd/mm/yyyy. */
  const dob = t.match(/(?:ngày sinh|sinh ngày|năm sinh|sinh nhật)\s*[:\-]?\s*\d|(?<!\d)\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4}(?!\d)/gi);
  if (dob) ngo.push({ ma: 'AD-NGAYSINH', thay: dob.slice(0, 3).join(' · ') });

  const mail = t.match(/\b[\w.+-]+@[\w-]+\.[\w.]{2,}\b/g);
  if (mail) ngo.push({ ma: 'AD-MAIL', thay: mail.slice(0, 3).join(' · ') });

  /* AD-DIACHI — ba hình: (a) số nhà + tên đường có từ khoá; (b) số nhà +
     tên Titlecase KHÔNG cần từ khoá ("123 Kim Mã"); (c) cụm hành chính
     phường/quận/xã/huyện + tên Titlecase. Không cờ i (giữ Titlecase thật,
     nếu không "9 tuổi" dính oan). */
  const dc = t.match(/(?<![\d\p{L}\p{M}])(?:số[^\S\r\n]*)?\d{1,4}(?:[\/-]\d+)*[^\S\r\n]+\p{Lu}\p{Ll}+|(?<![\p{L}\p{M}])(?:phường|quận|xã|huyện|tỉnh|thành phố)[^\S\r\n]+\p{Lu}\p{Ll}+/gu);
  if (dc) ngo.push({ ma: 'AD-DIACHI', thay: dc.slice(0, 3).join(' · ') });

  /* AD-CCCD — dãy liền từ chín số trở lên. Lookaround chữ số thay \b
     (số dán chữ vẫn bắt). */
  const day = t.match(/(?<!\d)\d{9,}(?!\d)/g);
  if (day) ngo.push({ ma: 'AD-CCCD', thay: day.slice(0, 3).join(' · ') });

  /* AD-TRUONG — tên trường cụ thể. \p{Lu}\p{Ll}* thay [A-ZĐ] gõ tay (bắt
     cả tên trường mang dấu). Trường + lớp + tuổi chỉ ra một trẻ dù không tên. */
  const tr = t.match(/(?<![\p{L}\p{M}])(?:[Tt]rường|THCS|THPT|[Tt]iểu học)[^\S\r\n]+\p{Lu}\p{Ll}*(?:[^\S\r\n]+\p{Lu}\p{Ll}*){0,3}/gu);
  if (tr) ngo.push({ ma: 'AD-TRUONG', thay: tr.slice(0, 3).join(' · ') });

  return {
    sach: ngo.length === 0, ngo,
    vi: ngo.length
      ? 'Ngờ có dữ liệu nhận dạng được. Máy CHẶN và nói ra chỗ ngờ, KHÔNG tự xoá ' +
        'hộ — tự xoá thì người gửi không biết mình vừa suýt gửi cái gì, và lần sau ' +
        'viết y hệt. Ẩn danh rồi gửi lại: "phụ huynh A, con 9 tuổi, vào qua cửa ' +
        'làm, sợ bị cười".'
      : 'Không thấy dữ liệu nhận dạng được. Đây là phép DÒ, không phải lời bảo ' +
        'đảm — người gửi vẫn là người chịu trách nhiệm cuối.'
  };
}

/* ═══════════════ MỘT VIỆC RƠI VÀO VÙNG NÀO ═══════════════

   Không đoán. Việc không có trong bảng thì trả về VÙNG VÀNG — phía an
   toàn: máy soạn, người duyệt. Rơi về Xanh là để máy tự làm một việc
   chưa ai xếp hạng, và đó đúng là cách một hệ lặng lẽ mở rộng quyền
   của chính nó. */
const VIEC_XANH = ['traLoiBangDaDuyet', 'guiWowTheoLich', 'nhanDenVang',
  'capNhatHoSo', 'tinhDenBaMau', 'sinhBayNhanhNhap', 'tongHopBayConSo',
  'sinhDeThiDoiNgu', 'soanLoTrinhNhap'];
/* Mười quyết định không bao giờ giao cho máy. XUẤT RA từ 9.99.71 vì
   câu lệnh "Tôi vắng 3 ngày" của Hệ điều hành phải lấy ngưỡng gọi
   TỪ ĐÂY chứ không chép sang — hai danh sách ngưỡng thì cái nào cũng
   tự tin, và lúc gấp người ta đọc cái nào gần tay hơn. */
export const DO10 = ['kyHopDong', 'tuyenNguoi', 'datGia', 'duyetChiVuotNguong',
  'suaHienPhap', 'xuLyKhungHoang', 'quyetDuLieuCaNhan', 'hoanTien',
  'moSanPham', 'anToanTreEm'];

export function vungCuaViec(ma) {
  const m = String(ma || '');
  if (DO10.indexOf(m) >= 0) return { vung: 'DO', uyQuyen: false,
    vi: 'Chỉ chủ hệ. Sai thì không sửa lại được, hoặc sai thì có người bị thiệt ' +
      'hại thật — luật vàng của bản đặc tả.' };
  if (VIEC_XANH.indexOf(m) >= 0) return { vung: 'XANH', uyQuyen: true,
    vi: 'Máy chạy, không cần hỏi: việc đã có khuôn duyệt trước, hoặc việc ghi ' +
      'chép, hoặc bản nháp chưa ai thấy.' };
  return { vung: 'VANG', uyQuyen: false, macDinh: true,
    vi: 'Việc chưa ai xếp hạng thì rơi về VÀNG — máy soạn, người duyệt. Rơi về ' +
      'Xanh là để máy tự làm một việc chưa ai xếp hạng, và đó đúng là cách một ' +
      'hệ lặng lẽ mở rộng quyền của chính nó.' };
}

/* ═══════════════ CỬA CHO MÀN HÌNH ═══════════════ */

/* `hoSo.role`, KHÔNG phải `hoSo.vai`. Cùng cái bẫy đã cắn ở 9.99.55 với
   `hoSo.username`: hồ sơ phiên của kho này mang tên ô riêng, và gõ tên
   khác thì JavaScript không báo gì cả — nó trả undefined, phép thử sai,
   và cổng đóng với MỌI người trong im lặng. Bộ thử bắt ngay lần chạy
   đầu, bằng bốn dòng đỏ ở bốn cửa cùng lúc. */
function duocVaoBN(hoSo) {
  return /^R(0[1-5])$/.test(String((hoSo || {}).role || ''));
}

export async function soatBoNao(y, env, db, hoSo) {
  if (!duocVaoBN(hoSo)) return { ok: false, code: 'NOPERM',
    error: 'Cổng bộ não mở cho R01–R05.' };
  const chu = String((y || {}).chu || '').trim();
  if (chu.length < 15) return { ok: false,
    error: 'Dưới mười lăm chữ thì chưa đủ để soi hàng rào.' };
  const r = soatRao10(chu, { laTraLoiKhach: !!(y || {}).laTraLoiKhach });
  return { ok: true, ...r,
    vi: r.dat
      ? 'Qua được ' + r.soDiemMayDo + ' điểm máy đo được. Điểm R9 vẫn là việc của ' +
        'người duyệt, và năm điều của Hiến pháp máy không đo được thì máy không chấm.'
      : 'Phạm ' + r.pham.length + ' điểm. Hàng rào nêu TỪNG ĐIỂM một, không gộp ' +
        'thành một con số — chín điểm sạch và một điểm phạm nặng cần cách xử lý ' +
        'khác hẳn mười điểm hơi phạm.' };
}

export async function soatAnDanh(y, env, db, hoSo) {
  if (!duocVaoBN(hoSo)) return { ok: false, code: 'NOPERM',
    error: 'Cổng bộ não mở cho R01–R05.' };
  return { ok: true, ...soatRaNgoai(String((y || {}).chu || '')) };
}
