/* ═══════════════════════════════════════════════════════════════
   GITA 365 — MÃ HOÁ KHO TÀI SẢN
   Đọc nội dung gốc trong kho-goc/, chia thành các gói theo phạm vi
   cấp phép, mã hoá AES-256-GCM và xuất ra kho/*.enc

       node tools/ma-hoa-kho.js

   Ra hai thứ:
     kho/*.enc        — gói đã mã hoá, phát hành kèm ứng dụng được
     kho/khoa.json    — BỘ KHOÁ, nạp vào máy chủ cấp phép.
                        TUYỆT ĐỐI KHÔNG đưa tệp này lên kho mã.

   Khoá KHÔNG nằm trong ứng dụng. Máy chủ chỉ trả khoá của những gói
   mà vai và tầng của người đăng nhập được cấp phép.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const GOC = path.join(__dirname, '..');
const NGUON = path.join(GOC, 'kho-goc');
const RA = path.join(GOC, 'kho');

/* ─── Nạp nội dung gốc ───

   Mọi tệp kho-goc nạp vào CÙNG MỘT window.G. Hai tệp đặt trùng tên kho
   thì tệp sau đè tệp trước, im lặng — kho cũ biến mất mà mọi phép đếm
   vẫn xanh, vì tên kho vẫn còn đó và vẫn có nội dung.

   Bản 9.61 mắc đúng lỗi ấy: bảng đăng ký hoạt động dùng tiền tố HD_,
   mà HD_LUAT đã là luật hợp đồng tuyển dụng ở data.hop-dong-tuyen.js.
   Màn tuyển dụng mất luật của nó và không có gì báo. Bắt được là nhờ
   một phép đo tay, không nhờ phép kiểm nào — nên nay có phép kiểm. */
global.window = {};
const CHU_KHO = {};
for (const t of fs.readdirSync(NGUON).filter(f => f.endsWith('.js')).sort()) {
  const truoc = Object.assign({}, global.window.G || {});
  require(path.join(NGUON, t));
  const sau = global.window.G || {};
  for (const k of Object.keys(sau)) {
    if (!/^[A-Z]/.test(k)) continue;          /* hàm và biến thường bỏ qua */
    if (k in truoc && truoc[k] !== sau[k]) {
      console.error('  ✗ TRÙNG TÊN KHO: ' + k + ' — ' + (CHU_KHO[k] || '?') +
        ' đã đặt, rồi ' + t + ' đè lên.');
      console.error('     Kho bị đè biến mất mà mọi phép đếm vẫn xanh. Đổi tên một trong hai.');
      process.exit(1);
    }
    if (!(k in truoc)) CHU_KHO[k] = t;
  }
}
const G = global.window.G;

/* ─── Chia gói theo phạm vi cấp phép ─── */
const NEN = ['VANHANH', 'CHUYENDICH', 'LOTRINH', 'TEAM', 'CUHICH',
  'NGHILE', 'SUKIEN', 'AUDIT', 'TODAY', 'LEVELS', 'DIEM', 'HUYHIEU', 'KPI100', 'QUA', 'HOAHONG', 'WOW',
  'NGONTU_RANH', 'DAISU', 'BAIHOC', 'QUA_DANG', 'KETNOI', 'LIENKET', 'KICHBAN_AI',
  /* Hành trình 12 chặng mở cho MỌI vai — gia đình cũng phải thấy mình đang
     ở đâu trên đường. Nên nó nằm ở gói nền, không nằm sau kho nghề. */
  /* ── THANG ĐỘ KHÓ Ở GÓI NỀN, CÓ CHỦ Ý ──
     Khi trợ lý nói "việc này em không tự làm được", gia đình phải
     đọc được VÌ SAO. Một cái máy từ chối mà không nói được lý do thì
     người ta nghĩ nó hỏng, chứ không nghĩ nó đang cẩn thận.
     Phần ĐỊNH TUYẾN — ai giữ chìa khoá nào — ở gói NGHỀ. */
  'DOKHO_CAP', 'DOKHO_DAU', 'DOKHO_KHONGBIET', 'DOKHO_LOI_NHA',
  'DOKHO_DANG_LAM',
  'TRU_GITA', 'HANHTRINH12', 'LOI_HUA_GITA',
  /* Kênh cộng đồng chính thức: phụ huynh chưa là khách hàng cũng phải
     thấy được nhóm. Đây là cửa trước, cùng lý do với GT_* và DV_*. */
  'KENH_DS', 'KENH_CHANG', 'KENH_LUAT',
  /* Bản đồ cá nhân 11 ô: mọi vai đều có một bản của riêng mình — học viên,
     phụ huynh, cộng tác viên, đội ngũ — nên nó thuộc gói nền. */
  'BDCN_MA', 'BDCN', 'BDCN_MUOI_VIEC', 'BDCN_QUY_TAC', 'BDCN_NHIP',
  /* Sáu trăm chuyện truyền cảm hứng, mỗi cấp tài khoản một trăm. Ở gói nền
     vì vai nào cũng phải có kho của cấp mình; màn hình lọc theo vai. */
  'CH_MACH', 'CH_CAP', 'ROHN', 'CHUYEN',
  /* Đánh giá của gia đình: luật, câu hỏi, mức hiển thị tên — và mảng
     đánh giá THẬT (rỗng cho tới khi có người thật gửi và Học viện duyệt).
     Ở gói nền vì phụ huynh và học viên đều phải gửi được. */
  'DANHGIA_THAT', 'DG_LUAT', 'DG_HOI', 'DG_MOC', 'DG_TEN',
  /* Sổ khai kho rỗng có chủ ý — bộ rà soát đọc nó thay cho danh sách tha lặng */
  'RONG_CO_Y',
  /* Sổ nhật ký từng vị trí và bốn mốc thi viết: mọi vai đều dùng. */
  /* Nghi lễ gia đình: bốn nghi lễ nhịp đều đã có ở NGHILE, nay thêm mười
     nghi lễ TÌNH HUỐNG cho lúc nhà mình lệch nhịp — đứt chuỗi, cãi nhau,
     kết quả xấu, người lớn kiệt sức. Ở gói NỀN vì đây là việc của chính
     gia đình, không phải công cụ nghề. */
  'NGHILE_TH', 'NGHILE_THEM', 'NGHILE_LUAT',
  /* Sổ khai dữ liệu mẫu — để không ai tưởng số dựng là số đo */
  'DL_MAU', 'DL_MAU_LUAT',
  /* Bảng công việc, luật chấm KPI và hạng tháng. Ở gói NỀN vì MỌI vai
     đều phải mở được bảng việc của mình — kể cả cộng tác viên, và kể cả
     gia đình (phần CV_KH_*).

     CV_MUC thì KHÔNG ở đây, và đó là điểm sửa của bản này. Nó từng nằm ở
     gói nền với lý do "màn hình tự lọc theo vai" — nhưng lọc trên màn
     hình không phải bảo vệ dữ liệu. Ba mươi đầu việc đội ngũ, kèm bằng
     chứng đóng việc và điều khoản liên đới, đã xuống máy mọi tài khoản
     phụ huynh; gõ G.CV_MUC trong công cụ nhà phát triển là đọc hết. Nay
     CV_MUC đi gói NGHỀ, còn ba đầu việc của cộng tác viên ở CV_MUC_DS
     giữ lại đây vì R15 không được cấp gói nghề. */
  /* Mười bánh đà: đây là HÀNH TRÌNH CỦA CHÍNH GIA ĐÌNH, nên nó ở gói
     nền. Giấu nó đi là giấu đúng con đường mình đang mời người ta đi.
     Riêng BD_DAN — cách Tư vấn và Coach dẫn ở từng ngã ba — đi gói
     NGHỀ: gia đình đọc được cách dẫn thì buổi nói chuyện mất tác dụng,
     họ biết trước câu tiếp theo và trả lời theo kịch bản. */
  'BD_LON', 'BD_CAP', 'BD_CHON', 'BD_LUAT',
  /* Lớp cảm xúc, phần của gia đình: mùa đời, chìa khoá nhỏ, bằng chứng
     ẩn danh, sổ vết. Đây là thứ họ SỐNG trong đó — giấu đi thì mùa khó
     lại bị chấm bằng thước của người đang khoẻ. */
  'TT_CAMXUC', 'TT_MUA', 'TT_MUA_LUAT', 'TT_CHIAKHOA', 'TT_BANGCHUNG', 'TT_VET', 'TT_LUAT', 'TT_CONGTHUC',
  /* Bức tranh hành trình: hạt, bảy vùng đất, ba câu mỗi tối, lều trú gió
     và bảng nhánh héo. Đây là thứ gia đình NHÌN THẤY mỗi ngày, nên nó ở
     gói nền cùng chỗ với mùa đời.

     Năm cửa tử cũng ở đây, nhưng màn của gia đình chỉ dựng ra phần "nhà
     mình đang được đỡ bằng gì". Phần "vì sao chỗ này mất người" là chữ
     của người trong nghề, và nó chỉ hiện khi máy CÓ kho HM_SAU. */
  'HM_NGAY1', 'HM_HOI3', 'HM_NGONTU', 'HM_VUNG', 'HM_VUNG_LUAT',
  'HM_NGUY', 'HM_LEU', 'HM_HEO', 'HM_LUAT',
  /* Hai thứ của lớp đội ngũ mà GIA ĐÌNH phải đọc được, và chỉ hai thứ:

     DD_HUA — năm điều người đi cùng hứa với nhà họ. Lời hứa không kiểm
     được thì không phải lời hứa; giấu nó đi là giữ lại quyền phá nó.

     GL_XONG — năm điều kiện tới ngày hệ này xong việc. Đây là câu hứa
     mạnh nhất của cả hệ: nó được dựng để một ngày nhà mình không cần nó
     nữa. Giấu câu ấy thì hệ trông như một thứ muốn giữ người mãi. */
  'DD_HUA', 'GL_XONG', 'GL_XONG_LUAT',
  /* Sáu điều rừng KHÔNG BAO GIỜ BÁN. Đây là lời hứa về dữ liệu và về
     túi tiền của chính các nhà — cùng lý do với DD_HUA: lời hứa không
     kiểm được thì không phải lời hứa, và giấu nó đi là giữ lại quyền
     phá nó. Phần kinh tế còn lại đi gói nghề. */
  'TR_DEN', 'TR_DEN_LUAT',
  /* TRỤC NGŨ — năm điều không thế hệ nào được sửa. Đây là bản hiến pháp
     một trang của cả trăm năm, và một hiến pháp mà người bị nó bảo vệ
     không đọc được thì không phải hiến pháp. Phần biên niên còn lại —
     lịch thập kỷ, cửa mở rừng, cách chuyển giao — đi gói NGHỀ. */
  'BN_TRUC5', 'BN_TRUC5_LUAT',
  /* BẢY QUYỀN của gia đình. Bản gốc nói rõ: in ở chỗ họ NHÌN THẤY
     được, không giấu trong điều khoản. Quyền giấu trong điều khoản là
     quyền không ai dùng, và quyền không ai dùng là quyền trang trí. */
  'PL_QUYEN', 'PL_QUYEN_LUAT', 'PL_CO', 'PL_CO_LUAT',
  /* NĂM LẰN RANH lúc chốt. Cùng lý do với DD_HUA và PL_QUYEN: đây là
     năm điều người tư vấn không được làm VỚI NHÀ MÌNH, và lời hứa mà
     người được hứa không đọc được thì không phải lời hứa. Phần còn
     lại của sổ tay — cách hỏi, cách chốt, ba mươi lời từ chối — đi
     gói NGHỀ: gia đình đọc được nguyên văn câu sẽ nghe thì buổi tư
     vấn mất tác dụng, họ biết trước câu tiếp theo. */
  'TV_LANRANH', 'TV_LANRANH_LUAT',
  /* SỔ TAY CỦA GIA ĐÌNH — hai mươi bốn trang in giấy. Cả cuốn ở gói
     NỀN, và đây là kho hiếm hoi mà phần gia đình DÀY HƠN phần nghề:
     nó viết cho người sống trong rừng, không viết cho người xây rừng.
     Phụ lục soạn thảo — cổng in, thước đo, sổ in lại — đi gói NGHỀ. */
  'SG_DONGDAU', 'SG_TRANG24', 'SG_MUCLUC', 'SG_LUAT', 'SG_KHAN', 'SG_KHAN_LUAT',
  'SG_CAM5', 'SG_CAM5_LUAT', 'SG_KHONGVAY', 'SG_QUYEN7', 'SG_QUYEN7_LUAT',
  'SG_HOI', 'SG_TRONGSACH',
  /* NĂM CÂU HỆ CHƯA TRẢ LỜI ĐƯỢC. Bản gốc chốt: in ở ĐẦU sách, không
     phải phụ lục — để người đọc từ trang đầu biết bộ sách đang nợ gì.
     Giấu chúng sau gói nghề là đúng cách một câu để ngỏ trở thành một
     câu chìm, và câu chìm thì năm sau không ai nhắc lại. */
  'HN_NGO', 'HN_NGO_LUAT',
  /* MỘT HÀNH TRÌNH NĂM TẦNG. Cả lớp này ở gói NỀN — đây là con đường
     hệ MỜI gia đình đi, và giấu con đường đi là giấu đúng thứ mình
     đang mời. Kể cả bảng chỗ nối và sáu chỗ chưa khớp: một nhà có
     quyền biết cái thang đo mình được ghép lại từ đâu. */
  /* SÁU VÙNG — lớp sâu tâm lý của năm tầng, và bốn chỗ rơi có tên.
     Ở gói NỀN: đây là bức tranh nhà mình tự soi mình, và bốn chỗ rơi
     là thứ người đang nằm trong đó cần đọc nhất. Giấu bảng chỗ rơi
     khỏi người có thể đang rơi là giấu đúng chỗ nó có việc. */
  'VZ_LOI', 'VZ_VUNG', 'VZ_VUNG_LUAT', 'VZ_ROI', 'VZ_ROI_LUAT', 'VZ_LUAT',
  /* NĂM TẦNG COACH — mặt thứ ba của cùng cái thang: ở bậc nhà mình
     đang đứng, người đi cùng phải làm được gì. Ở gói NỀN vì đây là một
     CÁI THƯỚC, y như TV_LANRANH và DD_HUA: nhà mình đọc được thì hỏi
     thẳng được. Giấu bảng năng lực khỏi người được kèm là giữ lại
     quyền không đạt — một chuẩn chỉ người chấm đọc được thì nó là
     chuẩn của người chấm.
     Vòng vận hành, bảng dữ liệu và phép chia quy mô đi gói NGHỀ. */
  /* KHUNG ẢNH VÀ HÌNH DỰNG TỪ KHO. Ở gói NỀN vì bảng chỗ đặt quyết
     định màn của GIA ĐÌNH trông ra sao — giấu nó sau gói nghề thì màn
     của nhà mình mất hết chỗ có ảnh, mà đó đúng là những màn cần ảnh
     nhất. Bảng này không chứa nội dung nào, chỉ chứa chỗ và lời dặn. */
  'KA_LOAI', 'KA_TY', 'KA_CHO', 'KA_LUAT', 'KA_ANTOAN',
  /* BÀN CỜ HÀNH TRÌNH. Gói NỀN: đây là luật chơi của chính nhà mình —
     một ngày một việc, mười gợi ý, ba mức trọng số, và sáu điều hệ tự
     cấm mình. Giấu luật chơi khỏi người chơi là giữ quyền đổi luật. */
  'BC_LOI', 'BC_TRONGSO', 'BC_TRONGSO_LUAT', 'BC_MUNG', 'BC_MUNG_LUAT',
  'BC_VAI', 'BC_VAI_LUAT', 'BC_VONG_LUAT', 'BC_NHIP_LUAT', 'BC_NEP_LUAT', 'BC_KEM_LUAT', 'BC_CHOCHU', 'BC_LUAT',
  /* BẢNG TIN CỘNG ĐỒNG. Gói NỀN: sáu tiêu chí chọn chuyện và năm điều
     bảng tin tự cấm là thứ NHÀ GỬI CHUYỆN phải đọc được trước khi gửi.
     Giấu tiêu chí khỏi người dự thi là giữ quyền đổi tiêu chí sau. */
  'TIN_LOAI', 'TIN_LOAI_LUAT', 'TIN_MAU', 'TIN_TANG_LUAT', 'TIN_KEM_THUONG', 'BK_LUAT', 'BK_DANHMUC', 'BK_DANHMUC_LUAT',
  'TIN_NGUON', 'TIN_NGUON_LUAT', 'TIN_SO_LUAT', 'TIN_TIEUCHI', 'TIN_TIEUCHI_LUAT',
  'TIN_THUONG', 'TIN_CAM', 'TIN_LUAT',
  'CS_LOI', 'CS_TANG', 'CS_TANG_LUAT', 'CS_NEN', 'CS_LUAT',
  'HT_DICH', 'HT_TANG', 'HT_TANG_LUAT', 'HT_SAUT5', 'HT_KC',
  'HT_NOI', 'HT_NOI_LUAT', 'HT_LECH', 'HT_LUAT',
  'CV_TRANG', 'CV_MUC_DS', 'CV_LUAT', 'CV_HANG', 'CV_KH_NGAY', 'CV_KH_TANG',
  'CV_KPI_CAP', 'CV_KPI_CAP_LUAT',
  'DEHIEU_LUAT', 'DEHIEU_THAY', 'DEHIEU_TRANG', 'DEHIEU_NGUONG',
  'NK_NHIP', 'NK_O', 'THI_VIET', 'THI_LUAT',
  /* Chuẩn thời gian, chuẩn hoàn thành, thang thưởng và phạt: mọi vai đều
     phải đọc được, vì luật mà không ai đọc được thì không phải luật. */
  /* Luật trợ lý: lọc theo tầng và dẫn việc. Ở gói NỀN, và phải ở gói NỀN:
     chính KHÁCH HÀNG là người cần nó. TL_TANG_TRUONG là bảng nói kho nào
     khai tầng ở trường nào — thiếu nó thì aiLocTangDuoc() trả về false
     cho mọi kho, và trần tầng tắt ngóm đúng trên máy của người nó sinh ra
     để bảo vệ. Đặt nhầm sang gói NGHỀ thì đội ngũ có luật còn khách hàng
     thì không, mà đội ngũ lại là bên KHÔNG bị lọc. */
  /* Chuỗi kịch bản trả lời phụ huynh. Gói NỀN cùng lý do với TL_*:
     chính khách hàng là người đi qua năm vòng này. */
  'KBTV_CHUONG', 'KBTV_KB', 'KBTV_CONG_PHI', 'KBTV_VANPHONG', 'KBTV_DAODUC', 'KBTV_BA_KHONG', 'KBTV_BA_LUON', 'KBTV_LECH', 'KBTV_LUAT',
  'KB_MU', 'KB_MU_LUAT', 'KB_GIONG', 'KB_PHATSINH', 'KB_PHATSINH_LUAT',
  'KB_DA_CHOT', 'KB_TRAN_NHA', 'KB_VONG', 'KB_KEY_NGUON', 'KB_LUAT', 'KB_MOI_TANG', 'KB_CHOCHU', 'KB_NGHIEPVU', 'KB_NGHIEPVU_LUAT',
  'TL_TANG_TRUONG', 'TL_TANG_LUAT', 'TL_VIEC_NHIP', 'TL_VIEC_LUAT', 'TL_VIEC_DAU',
  'HH_KEM', 'HH_BAC', 'HH_BAC_LUAT', 'HH_KHONG_TIEN', 'HH_CHUNGCU', 'HH_LOAI_CC', 'HH_CC_LUAT', 'HH_CHOCHU', 'HH_DA_CHOT',
  'TG_NGUNG_GIAY', 'TG_LOAI', 'TG_XEP', 'TG_MUC', 'TG_VIEC',
  'TG_NHIEMVU', 'TG_THUONG', 'TG_PHAT', 'TG_QUYDOI',
  /* Bản giới thiệu Học viện và hồ sơ giọng đọc: mọi vai đều đọc được. */
  'GT_MOT_CAU', 'GT_VISAO', 'GT_HUA', 'GT_KHONG', 'GT_CHANG', 'GT_TANG', 'GT_VAI',
  'GT_HOI', 'GT_SO', 'GT_BUOC', 'GT_MUCTIEU', 'GT_MUCTIEU_RANH', 'GT_DONGHANH',
  'AD_THUMUC', 'AD_DUOI', 'AD_TRANGTHAI', 'AD_GIONG', 'AD_DIEUKHOAN', 'AD_KYTHUAT', 'AD_KHUNG',
  /* Bộ sát hạch và khoá đào tạo tự động. Ở gói NỀN vì cả sáu vai đều thi,
     kể cả học viên và phụ huynh — bài của ai thì màn hình lọc theo vai. */
  'SH_TRUC', 'SH_TRONGSO', 'SH_VAI', 'SH_TANG', 'SH_TOTNGHIEP', 'SH_LUAT', 'SH_HOI',
  'KH_LOTRINH', 'KH_BAI', 'KH_LUAT',
  /* Kho chuyện người thật — người có thật, việc có thật, ghi chép công khai.
     Ở gói nền vì mọi vai đều đọc được. */
  'TG_LINH', 'CHUYEN_TG',
  /* Lớp băng của ma trận: bốn nhóm khách hàng trong mỗi tầng. Ở gói nền
     vì bảng định nghĩa băng và luật xếp băng thì vai nào cũng phải đọc
     được; phần kế hoạch chi tiết vẫn nằm trong gói tầng như cũ. */
  /* Đường vào sáu bước: người mới chưa có tầng nào cũng phải đọc được,
     nên nó thuộc gói nền. */
  'DV_BUOC', 'DV_CHAN', 'DV_HOI',
  /* Chuẩn soát đủ ruột. Ở gói NỀN chứ không phải gói nghề: màn tự soát
     phải chạy được ngay cả khi gói nghề chưa nạp — chính lúc đó nó mới
     báo được kho nào chưa nạp. */
  'SOAT_BAT_BUOC', 'SOAT_THA', 'SOAT_MOC', 'SOAT_CHATLUONG'];

const NGHE = [
  /* Quy chế phòng tài chính — 9.99. Cấp duyệt, hạn mức, chỗ thủng đã
     biết. KHÔNG được rời hệ tới khách hàng, nên gói NGHỀ. */
  'TC_MA_VB', 'TC_DIEULE', 'TC_QUYCHE', 'TC_QUYTRINH', 'TC_BIEUMAU', 'TC_RUIRO',
  'TC_KPI', 'TC_LUONG',
  'TG_MA_VB', 'TG_TANG', 'TG_NGUOI', 'TG_LOAIHINH', 'TG_CAM', 'TG_DIEM',
  'TG_BAC', 'TG_TRANGTHAI', 'TG_LENH', 'TG_CHOCHU', 'TG_LUAT_GOC',
  /* Hiến pháp Nội dung — 9.99.41. Gói NGHỀ, cùng lý do với Hiến pháp
     Thị giác: đây là bảng chấm và bảng chặn của người LÀM nội dung.
     Khách hàng đọc nội dung, không đọc thang chấm nội dung — và bảng
     câu rỗng nằm trong tay khách là bảng chỉ ra chỗ yếu của chính
     những bài họ đang trả tiền để đọc. */
  'KN_MA_VB', 'KN_KHOI', 'KN_XONG', 'KN_DIEM', 'KN_BAC', 'KN_CAM',
  'KN_SAU', 'KN_NGUON', 'KN_LOI_THAY', 'KN_RONG', 'KN_CHE', 'KN_NGUOIDOC',
  'KN_CONGTHUC', 'KN_VONG', 'KN_LUAT_GOC', 'KN_CHOCHU',
  /* 9.99.42 — thang năm cổng phát hành */
  'KN_CONG', 'KN_LUAT_THANG', 'KN_SLA', 'KN_QUYEN', 'KN_TRANGTHAI',
  /* 9.99.44 — tiêu chuẩn nghề và bộ dò chuyên gia */
  'KN_CHUAN_NGHE', 'KN_CAM_CHUYENGIA', 'KN_KHUNG_CAU',
  /* 9.99.45 — bốn khuôn, sáu nhịp, ba luật một buổi */
  'KN_KHUON', 'KN_NHIP', 'KN_HOITHOAI_LUAT',
  /* 9.99.46 — thang điểm riêng cho ba khuôn */
  'KN_DIEM_KHUON',
  /* 9.99.47 — bộ miễn dịch theo đặc tả phần 3 */
  'MD_MA_VB', 'MD_NHOM', 'MD_CHAN', 'MD_VIRUS', 'MD_CHOCHU',
  /* 9.99.48 — từ điển ngôn ngữ KL08 */
  'KL_MA_VB', 'KL_LOP', 'KL_THAY', 'KL_NGANKHO', 'KL_NHOM', 'KL_CHOCHU',
  /* 9.99.49 — khung cho những mục còn chờ chủ hệ */
  'KL_BIEUTUONG', 'MD_MAU_MA', 'MD_THUHANHVI', 'TG_IN_CHOT',
  /* 9.99.54 — cổng Điều Nhỏ của trợ lý hình ảnh */
  'TG_DIEUNHO', 'TG_KHUON4', 'TG_KHUON4_LUAT',
  /* 9.99.55 — hiểu yêu cầu · phác ý · dựng đề bài năm lớp */
  'TG_YDINH', 'TG_QUYET_KHO', 'TG_SACKHI', 'TG_QUYET', 'TG_QUYET_LUAT',
  'TG_CHU_TRAN', 'TG_GOCNHIN', 'TG_ANDU', 'TG_BATINHTU', 'TG_BATINHTU_LUAT',
  'TG_LOP5', 'TG_LOP5_LUAT',
  /* 9.99.56 — góp ý vá vào đúng lớp, và năm thứ không được động tới */
  'TG_SUA_DAU', 'TG_SUA_LUAT', 'TG_ADN',
  /* 9.99.57 — dòng truy nguồn trên tấm */
  'TG_TRUY',
  /* 9.99.58 — kênh phát · giờ vàng · gỡ bài */
  'TG_KENH', 'TG_GIO_VANG', 'TG_GIO_LUAT', 'TG_GO_LY_DO', 'TG_GO_LUAT',
  /* 9.99.61 — khung điền cho sổ chờ, và sổ đã chốt gỡ ra từ sổ chờ */
  'BC_BIKIP', 'CS_MOC_NAM', 'CS_MOC_KHUON', 'PL_TEN_BAOHO', 'PL_TEN_KHUON',
  'SG_BIA_CHOT', 'SG_BIA_KHUON',
  'BLV_DACHOT', 'BV_DACHOT', 'TV_DACHOT',
  /* 9.99.59 — đo phễu · sổ truy vết · mười quy trình ứng phó */
  'TG_UNGPHO', 'TG_UNGPHO_LUAT', 'TG_PHEU', 'TG_PHEU_LUAT',
  /* 9.99.62 — BỘ NÃO phần 1: hiến pháp · ba vùng · hàng rào 10 điểm */
  'BN_HIENPHAP', 'BN_HIENPHAP_LUAT', 'BN_VUNG', 'BN_DO10', 'BN_VUNG_LUAT',
  'BN_RAO10', 'BN_ANDANH', 'BN_ANDANH_LUAT', 'BN_GHE', 'BN_GHE_LUAT',
  'BN_CHOCHU',
  /* 9.99.63 — Phân hệ 1: đánh thức vùng mạnh */
  'VM_BA', 'VM_BA_LUAT', 'VM_TRUONG', 'VM_TUAN', 'VM_THE', 'VM_DOI', 'VM_MUA',
  'VM_BAC', 'VM_BAC_LUAT', 'VM_LANRANH', 'VM_CAM_NOI', 'VM_CAM_LUAT', 'VM_CHOCHU',
  'CK_VONG9', 'CK_VONG9_LUAT', 'CK_LUONG12', 'CK_LUONG_LUAT', 'CK_GHE5',
  'CK_GHE_LUAT', 'CK_BTB', 'CK_BTB_TRAN', 'CK_MUC5', 'CK_TRU4', 'CK_CUA3',
  'CK_SO3', 'CK_NOI_LUAT', 'CK_CHOCHU',
  'NT_TANG7', 'NT_NHOM4', 'NT_TANG_LUAT', 'NT_NHANH7', 'NT_NHANH_LUAT', 'NT_LOC7', 'NT_LOC_LUAT', 'NT_CHOCHU',
  'VH_TRUONG23', 'VH_TRUONG_LUAT', 'VH_DEN3', 'VH_DEN_LUAT', 'VH_NHIP', 'VH_NHIP_LUAT', 'VH_SO5', 'VH_SO_LUAT', 'VH_CHOCHU',
  'TC_BAY7', 'TC_BAY_LUAT', 'TC_LUAT4', 'TC_KICHBAN', 'TC_KICHBAN_LUAT', 'TC_CHOCHU',
  'TU_MUCTIEU', 'TU_MUCTIEU_LUAT', 'TU_QUYDOI', 'TU_RANGBUOC', 'TU_CHIPHI_KHUNG', 'TU_CHIPHI_O', 'TU_DA_VA', 'TU_KIEUGIA', 'TU_CHOCHU',
  'CN_CUA', 'CN_CUA_LUAT', 'CN_NGUON', 'CN_DONGCHUAN', 'CN_C1_TH', 'CN_C2_KHUNG',
  'CN_TUAN', 'CN_TUAN_LUAT', 'CN_CHAN', 'CN_CHOCHU',
  'PLR_CANHBAO', 'PLR_LUAT', 'PLR_HAUKIEM', 'PLR_VIEC7', 'PLR_VIEC_LUAT',
  'PLR_DONGY', 'PLR_DONGY_LUAT', 'PLR_XOA', 'PLR_XOA_LUAT', 'PLR_VUNG4',
  'PLR_VUNG_LUAT', 'PLR_CHOCHU',
  'HDH_NHIP', 'HDH_NHIP_LUAT', 'HDH_CHISO12', 'HDH_CHISO_LUAT', 'HDH_QUYET5',
  'HDH_QUYET_LUAT', 'HDH_CHANG', 'HDH_CHANG_LUAT', 'HDH_LENH4', 'HDH_LENH_LUAT',
  'HDH_THUOC_TUAN', 'HDH_THUOC_LUAT', 'HDH_HATANG', 'HDH_CHOCHU',
  'BP_VAI4', 'BP_VAI_LUAT', 'BP_KHOI', 'BP_KHOI_LUAT', 'BP_VONG', 'BP_VONG_LUAT',
  'BP_NOI', 'BP_NOI_LUAT', 'BP_OFFLINE', 'BP_CHOCHU',
  'BG_CAT', 'BG_CAT_LUAT', 'BG_RANG', 'BG_SO_LUAT', 'BG_BAC_MOI', 'BG_CHOCHU',
  'SUP_THANG', 'SUP_THANG_LUAT', 'SUP_VA', 'SUP_VA_CU', 'SUP_MAUTHUAN', 'SUP_OAN', 'SUP_OAN_LUAT', 'SUP_CUM', 'SUP_LOP', 'SUP_KHOI', 'SUP_KHONGKHOI', 'SUP_DEM', 'SUP_TUOI', 'SUP_WOW', 'SUP_WOW_LUAT', 'SUP_BACHIEU', 'SUP_BACHIEU_LUAT', 'SUP_FAN', 'SUP_FAN_LUAT', 'TAILIEU_SPEC', 'TAILIEU_SPEC_LUAT', 'HC_TANG', 'HC_MA_TRUNG', 'HC_LUAT', 'HC_CHOCHU', 'CUU_YEUTO', 'CUU_LUAT', 'CUU_BUOC', 'CUU_KHONG_LAM', 'CUU_CHOCHU', 'XU_DEM', 'XU_LOI', 'XU_HOP', 'XU_NGANKHO', 'XU_KHUON', 'XU_KHO_HINH', 'XU_DEN', 'XU_LUAT', 'XU_CHOCHU', 'LT_THANG', 'LT_THANG_LUAT', 'LT_GIAIDOAN', 'LT_GATE', 'LT_RM', 'LT_MOC', 'LT_NO', 'LT_NO_LUAT', 'LT_AM', 'LT_PL', 'LT_VA', 'LT_HOP', 'LT_MOI', 'LT_LUAT', 'LT_CHOCHU', 'ST_DEM', 'ST_VA', 'ST_OAN', 'ST_OAN_LUAT', 'ST_PHAN', 'ST_LUAT', 'ST_CHOCHU', 'HP9_BATKHASUA', 'HP9_LUAT', 'HP9_CHOCHU', 'HP9_DACHOT', 'SUP_CHO', 'SUP_CHOCHU', 'SUP_DACHOT',
  'THT_CAP', 'THT_CAMNANG', 'THT_UNGPHO', 'THT_RB', 'THT_GIAMSAT', 'THT_GIAMSAT_LUAT', 'THT_PHATSINH_LOAI', 'THT_LUAT', 'THT_KHONG_LAM', 'THT_CHOCHU',
  'AI_QUYEN', 'AI_QUYEN_LUAT', 'AI_QUYEN_CHOCHU',
  'VIP_CAM', 'VIP_CAM_LUAT', 'VIP_NGAN', 'VIP_LENH', 'VIP_SA_KHONG', 'VIP_60',
  'VIP_SUA_CHU', 'VIP_CHOCHU',
  'TNC_KHONG_CHAM', 'TNC_KHONG_CHAM_LUAT', 'TNC_CAP8', 'TNC_XEP_CAP',
  'TNC_CUA5', 'TNC_CUA_LUAT', 'TNC_NHAY10', 'TNC_NHAY_LUAT', 'TNC_CHOCHU',
  'NM_MOT_VIEC', 'NM_BAO', 'NM_BO_VIEC', 'NM_GHIM', 'NM_ANH_CON', 'NM_NANG_NE',
  'NM_TRONG', 'NM_CHOCHU', 'NM_DACHOT',
  'LGD_LUAT', 'LGD_VONG_DO', 'LGD_VONG_DO_LUAT', 'LGD_NGUOI_GIU', 'LGD_NGUOI_GIU_LUAT',
  'LGD_GIU_CHAN', 'LGD_NGUYEN_TAC', 'LGD_TRONG', 'LGD_HAI_TRUC', 'LGD_CHOCHU',
  /* Luật xem hồ sơ khách hàng. Ở gói NGHỀ vì chỉ người của Học viện mới
     đọc nó: không màn nào của khách hàng hiện bảng trần vai, và chính
     G.dsNha() cũng trả hồ sơ nhà mình TRƯỚC khi chạm tới cổng ấy. */
  /* ── ĐỘ KHÓ CỦA CA: BỐN KHO ĐỊNH TUYẾN Ở GÓI NGHỀ ──
     Thang mười cấp (DOKHO_CAP) và bảng dấu hiệu (DOKHO_DAU) ở gói
     NỀN, vì gia đình phải đọc được vì sao trợ lý dừng lại. Nhưng
     ĐƯỜNG ĐI NỘI BỘ thì không: biết ai giữ chìa khoá nào là biết gõ
     cửa ai để được mở nhanh. Bốn kho dưới đây ở gói NGHỀ. */
  'DOKHO_TUYEN', 'DOKHO_THEM', 'DOKHO_KHOA', 'DOKHO_CAM', 'DOKHO_LUAT',
  'XK_TRAN', 'XK_MUC', 'XK_VAI_MUC', 'XK_VAI_MUC_LUAT', 'XK_DA_CHOT', 'XK_CAM', 'XK_LUAT', 'XK_GIAYPHEP', 'XK_CHOCHU',
  /* ── FAMILIES VỀ GÓI NGHỀ TỪ BẢN 9.41 ──
     Kho này mang hồ sơ MƯỜI nhà: tên nhà, tên học viên, lớp, TÊN BỐ MẸ,
     tên Coach, điểm tự chủ, band màu, kỳ tích. Nó nằm ở gói NỀN từ đầu,
     nghĩa là mọi vai đăng nhập — kể cả phụ huynh — nhận đủ hồ sơ của
     CHÍN NHÀ KHÁC về máy mình.

     Không màn nào của phụ huynh HIỆN mấy hồ sơ ấy. Nhưng lọc trên màn
     hình không phải bảo vệ dữ liệu: gửi xuống rồi thì mở công cụ nhà
     phát triển là đọc được hết. Đây là lần thứ TƯ đúng lớp lỗi ấy trong
     kho này — KICHBAN 8.9, CV_MUC 9.7, mười bảy kho nghề 9.8.

     Chỗ khó: phụ huynh vẫn cần hồ sơ CỦA CHÍNH NHÀ MÌNH. Nên gói nền
     nhận một bản rút NHA_TOI, sinh ra từ chính FAMILIES lúc đóng gói —
     một nguồn, hai hình, đúng cách HP_NGAY đã làm với HP_TANG. */
  'FAMILIES',
  /* Chiều sâu năm lớp: nói rõ ở cấp nghề nào thì làm được gì và CHƯA làm
     được gì. Đây là bản đồ năng lực nội bộ của Học viện — mở ra công khai
     là chỉ cho đối thủ đúng cách dựng đội ngũ. Ở gói NGHỀ. */
  'MT_SAU', 'SAU_BOICANH', 'SAU_TRUONG_CAP', 'SAU_TRUONG_CHUNG', 'SAU_LUAT',
  /* Chiều sâu cho 11 nhóm phác đồ và 10 chủ đề tình huống, lớp nối giữa
     phác đồ/tình huống với kịch bản và chuyện, quy trình riêng từng nhóm,
     và bộ tài liệu phát cho gia đình. Tất cả là tài sản nghề — ở gói NGHỀ. */
  'PD_SAU', 'TH_SAU', 'NOI_KET', 'QT_NHOM', 'TL_GIADINH',
  /* Ranh giới sử dụng của 42 mô thức — khi nào KHÔNG dùng */
  'MT_RANH', 'MT_RANH_LUAT',
  /* Biên nhận áp ruột: bộ áp chạy lúc đóng gói, ghi lại đã áp được bao
     nhiêu phác đồ / tình huống và còn mã nào chưa có ruột. Không có nó thì
     màn soát trên trình duyệt không phân biệt được "chưa áp" với "áp hụt".
     Đi cùng PHACDO và TINHHUONG nên ở gói NGHỀ. */
  'PD_RUOT_SOAT', 'TH_RUOT_SOAT',
  /* Kịch bản chuyên môn — xem lý do ở chỗ dựng gói tầng bên dưới */
  'KICHBAN',
  /* ── MƯỜI BẢY KHO CHUYỂN TỪ GÓI NỀN SANG ĐÂY Ở BẢN 9.8 ──
     Cách tìm ra chúng, ghi lại để sau còn dùng: đăng nhập thật bằng từng
     vai, thay mỗi kho bằng một getter có đánh dấu, rồi dựng LẦN LƯỢT mọi
     màn vai ấy mở được. Kho nào không màn nào chạm tới là kho vai ấy
     nhận mà không dùng. Rồi đọc tay từng chỗ gọi để loại những kho chỉ
     được dùng trong cửa sổ bật lên hoặc hàm phụ (BAIHOC lọt lưới kiểu
     ấy — kho của khách hàng có dùng, nên nó ở lại gói nền).

     Còn lại mười bảy kho dưới đây: MỌI màn đọc chúng đều khoá ở quyền
     nghề hoặc quyền quản trị. Ý định của sản phẩm đã ghi sẵn trong quyền
     của màn hình; trước bản này kho không đi theo ý định ấy.

     Nặng nhất là MATRAN 106 KB — bản ma trận đủ năm tầng. Khách hàng vẫn
     có ma trận tầng mình qua MATRAN_T{n} trong gói tầng, nên chuyển sang
     đây không lấy đi của họ thứ gì.

     Đáng ngại nhất là RASOAT: đó là biên bản rà soát nội bộ, kể tên các
     lỗ hổng đã tìm thấy. Nó nằm ở gói nền suốt từ 7.0. */
  /* ── THÁP CHIẾN LƯỢC VÀ BẢN ĐỒ BỐN TẦNG (9.8) ──
     Đây là bản đồ điều hành của Học viện: chuỗi nhân quả từ việc hôm nay
     lên tới bốn kết quả ở đỉnh, kèm thước và ngưỡng của từng mắt xích.
     Mở nó ra công khai là đưa cho người khác đúng bản thiết kế cách Học
     viện tự lái mình. Hai màn đọc nó đều khoá ở quyền nghề. */
  'CL_THAP', 'CL_TANG', 'CL_MUC', 'CL_KETQUA', 'CL_NHIP', 'CL_NHAT', 'CL_LUAT',
  /* Quy trình tinh gọn, năm giai đoạn, bốn tầng bảo vệ. Ở gói NGHỀ vì
     bảng bốn tầng bảo vệ kể ra CHÍNH XÁC những gì đang giữ kho và những
     chỗ chưa giữ được — đưa ra ngoài là đưa cho người khác bản đồ chỗ hở. */
  'TG_LANG', 'TG_GON', 'TG_GIAIDOAN', 'TG_LOP', 'TG_GON_LUAT',
  /* Luồng cải tiến. Ở gói NGHỀ vì nó chỉ có nghĩa với người CÓ đầu việc
     trong hệ, và vì bảng loại đề xuất nói rõ vai nào quyết chuyện gì —
     tức là một phần sơ đồ quyền quyết định bên trong Học viện. */
  'CT_TRANG', 'CT_LOAI', 'CT_DIEM', 'CT_LUAT',
  'BD_DAN',
  /* Bàn điều khiển, ba cấp đồng hành, năm nhiệm kỳ: đây là cách Học viện
     tự lái mình và cách nó tuyển, đào tạo, thay người. Ở gói NGHỀ. */
  'TT_MAN', 'TT_DONGHANH', 'TT_DONGHANH_LUAT', 'TT_NHIEMKY',
  /* Bản ghi sau màn hình. Đây là "điều Minh KHÔNG cần biết": điểm nền,
     cờ cảm xúc, lộ trình mười năm. Họ không cần, và cũng KHÔNG ĐƯỢC nhận
     — biết mình đang bị chấm bao nhiêu điểm thì cái nhìn đổi ngay, và cả
     thiết kế "em bé tập đi không cần hiểu giải phẫu chân" sụp. */
  'HM_SAU', 'HM_NGUY_SAU',
  /* Sổ tay nói đúng và lớp ép của đội đồng hành. Ở gói NGHỀ cùng lý do
     với BD_DAN: gia đình đọc được NGUYÊN VĂN câu người kèm sẽ nói thì
     buổi nói chuyện mất tác dụng — họ biết trước câu tiếp theo và trả
     lời theo kịch bản. Phần họ được đọc là lời hứa, ở DD_HUA. */
  'DD_CAP', 'DD_TRAN_LUAT', 'DD_9010', 'DD_HOI', 'DD_HATLAI',
  'DD_TINHHUONG', 'DD_THAY', 'DD_KPI', 'DD_LUAT',
  /* Việc trong bếp của hệ Coach: vòng vận hành mười bước, bảng bảy năng
     lực dữ liệu (bốn có ba chưa), phép chia con số đích cho trần, bốn
     chỗ bản gốc lệch, hai câu chờ chủ hệ.
     Bảng "bốn có ba chưa" đặc biệt KHÔNG được ra ngoài: nó nói chính
     xác ba chỗ hệ này chưa có sổ đo. Với người trong nghề đó là danh
     sách việc phải làm; với người ngoài đó là danh sách chỗ hở. */
  'CS_VONG', 'CS_VONG_LUAT', 'CS_DULIEU', 'CS_DULIEU_LUAT',
  'CS_QUYMO', 'CS_LECH', 'CS_CHOCHU',
  /* Lớp ép của người giữ lửa: trần bàn điều khiển, chuông ba tầng, bảng
     chấm chính mình, sáu kịch bản sự cố, sổ đo di sản, hộp đen. Đây là
     cách Học viện tự lái và tự thay mình — và bảng kịch bản sự cố kể ra
     chính xác chỗ hệ gãy trước. Đưa ra ngoài là đưa bản đồ chỗ hở. */
  'GL_BAN', 'GL_BAN_CAM', 'GL_MUC1', 'GL_MUC1_LUAT', 'GL_ANDON', 'GL_ANDON_LUAT',
  'GL_KPI', 'GL_KPI_LUAT', 'GL_SUCO', 'GL_SUCO_LUAT', 'GL_LS', 'GL_LS_LUAT',
  'GL_HOPDEN', 'GL_LUAT',
  /* Sổ tay năm đầu: lịch mười hai tháng, nhịp tuần, sáu mốc kiểm, tám
     kịch bản lần-đầu. Đây là cách Học viện vận hành từ bên trong ở năm
     dễ tổn thương nhất — và bảng kịch bản lần-đầu kể ra chính xác chỗ
     hệ sẽ lúng túng. Ở gói NGHỀ. */
  'ND_LUAT', 'ND_QUYMO', 'ND_NGAY0', 'ND_THANG', 'ND_TUAN', 'ND_TUAN_LUAT',
  'ND_MOC', 'ND_MOC_LUAT', 'ND_SUCO', 'ND_CAM',
  /* Kinh tế học: nguồn tiền, thứ tự cắt chi, đường tự chủ, lương người
     lắng nghe, kiểm toán. Mở ra là mở đúng chỗ mềm nhất của một tổ
     chức — ai trả tiền và cắt gì trước khi túng. */
  'TR_LUAT', 'TR_NGUON', 'TR_CHI', 'TR_CAT_LUAT', 'TR_TUCHU', 'TR_QUY',
  'TR_QUY_LUAT', 'TR_LUONG', 'TR_BAO', 'TR_KIEMTOAN', 'TR_CHUA', 'TR_CHUA_LUAT',
  /* Giáo trình bốn mươi giờ và hai mươi ca thi vai. Cùng lý do với
     DD_TINHHUONG: gia đình đọc được nguyên văn câu sẽ nói thì buổi nói
     chuyện mất tác dụng. */
  'DT_LUAT', 'DT_VAO', 'DT_BUOI', 'DT_VAI', 'DT_VAI_LUAT', 'DT_THUCTAP',
  'DT_RUBRIC', 'DT_TUYETDOI', 'DT_THI', 'DT_PHAO', 'DT_TAICHUNGCHI', 'DT_RUTLUI',
  /* Chuẩn mô phỏng — gồm cả bảng khai những gì CHƯA dựng. */
  'MP_BAY', 'MP_LUAT', 'MP_QUAI', 'MP_BAO', 'MP_CHONG', 'MP_CHONG_LUAT',
  'MP_DO', 'MP_GAY', 'MP_LICH', 'MP_CHUA', 'MP_CHUA_LUAT',
  /* Biên niên một trăm năm: mười thập kỷ, ba công việc đốt đồng, cửa mở
     rừng hai, năm năm trước ngày rời, tự vấn thể chế, di chúc, năm cách
     chết. Đây là bản đồ cách Học viện tự thay máu qua các thế hệ — mở
     ra là mở đúng chỗ một tổ chức yếu nhất: lúc đổi người. */
  'BN_THAPKY', 'BN_THAPKY_LUAT', 'BN_DOTDONG', 'BN_MORUNG', 'BN_MORUNG_LUAT',
  'BN_GIEOLAI', 'BN_CHUYENGIAO', 'BN_BONG', 'BN_HANSEI_TC', 'BN_HANSEI_TC_LUAT',
  'BN_LE50', 'BN_CHAMTHU', 'BN_NENTANG', 'BN_LIENMINH', 'BN_NAM100',
  'BN_DICHUC', 'BN_CHET', 'BN_LUAT',
  /* Lớp pháp lý: mười hai điều hiến pháp, ba tầng kho, bảy loại hợp
     đồng, sổ xung đột lợi ích, bốn bậc khi luật va nguyên tắc, ba bậc
     tranh chấp. Mở ra là mở đúng bộ khung phòng thủ của tổ chức — kể cả
     cột CẤM của từng hợp đồng, tức bản đồ những chỗ hệ tự biết mình
     yếu. Ở gói NGHỀ. */
  'PL_CHUYENNGU', 'PL_KHO', 'PL_KHO_LUAT', 'PL_CAMKET', 'PL_DIEU',
  'PL_PHAPNHAN', 'PL_HOPDONG', 'PL_XUNGDOT', 'PL_BAC4', 'PL_BAC4_LUAT',
  'PL_TRANHCHAP', 'PL_KIEM90', 'PL_DINHKY', 'PL_CHOCHU', 'PL_CHOCHU_LUAT', 'PL_LUAT',
  /* Sổ tay tư vấn: sáu phân khúc, bảy câu sàng lọc, ba tầng câu hỏi,
     ba mươi lời từ chối kèm nguyên văn câu đáp, tám cách chốt. Cùng
     lý do với DD_TINHHUONG và BD_DAN. Thêm một lý do riêng: bảng
     sàng lọc kể ra chính xác những nhà Học viện TỪ CHỐI, và bảng ấy
     đọc ngược lại là bản hướng dẫn cách qua cửa. */
  'TV_LUAT', 'TV_TRAN', 'TV_PHANKHUC', 'TV_SANGLOC', 'TV_HOI', 'TV_NGHE',
  'TV_OHOSO', 'TV_KYLUAT', 'TV_NHIP5', 'TV_TUCHOI', 'TV_TUCHOI_LUAT',
  'TV_TINHIEU', 'TV_TINHIEU_LUAT', 'TV_CHOT', 'TV_SUP', 'TV_HOAN',
  'TV_306090', 'TV_VO', 'TV_GIOITHIEU', 'TV_SO15', 'TV_SO15_LUAT',
  'TV_NGAY', 'TV_12THANG', 'TV_TOTNGHIEP', 'TV_CHOCHU', 'TV_CHOCHU_LUAT',
  /* Phụ lục soạn thảo của cuốn sổ tay — bản gốc tự ghi "không in vào
     cuốn". Cổng in, thước đo chữ, sổ in lại, và ba câu chờ chủ hệ. */
  'SG_CHUONG', 'SG_CHUONG_LUAT', 'SG_DAOTAO', 'SG_SO', 'SG_SO_LUAT',
  'SG_INAN', 'SG_INLAI', 'SG_KIEM3', 'SG_PHULUC', 'SG_DOCHU',
  'SG_CHOCHU', 'SG_CHOCHU_LUAT',
  /* Lớp tự soi: ba loại quyết định tự động, luật im-lặng-là-tiếp-tục,
     hình dạng cuốn sổ giờ chuông chưa ra đời, chín mâu thuẫn và năm
     chỗ bộ sách tự phạm. Đây là bản đồ chỗ hệ tự biết mình yếu — cùng
     lý do với GL_SUCO và MP_CHUA, đi gói NGHỀ. */
  'HN_QUYET', 'HN_QUYET_LUAT', 'HN_DONGY', 'HN_SLA', 'HN_MAUTHUAN',
  'HN_CAY', 'HN_TUPHAT', 'HN_YEU', 'HN_LUAT', 'HN_TUCAM_THEM',
  'HN_CHOCHU', 'HN_CHOCHU_LUAT',
  'CHANDUNG',                                    /* chan-dung-tc · nghe_chung */
  'MATRAN',                                      /* ma-tran, ma-tran-bang · nghe_chung */
  'MT_BANG', 'MT_BANG_MA', 'MT_BANG_TANG',       /* ma-tran-bang · nghe_chung */
  'MT_BANG_NHOM', 'MT_BANG_LUAT', 'MT_DO',
  'BRAND',                                       /* thuong-hieu · nghe_chung */
  'TAMNHIN100', 'TANG100',                       /* kien-truc-100 · nghe_chung */
  'NHATBAN',                                     /* chuan-nhat · nghe_chung */
  'DANDAT',                                      /* nguoi-dan-dat · pro_consult */
  'CHIPHI',                                      /* chi-phi · fin_view */
  'HEALTH',                                      /* dieu-hanh · dh_toan_he */
  'DUYET',                                       /* kiem-duyet · qt_trang */
  'RASOAT',                                      /* ra-soat · qt_trang */
  /* Danh mục đầu việc của đội ngũ R01–R12. Cùng một lý do với KICHBAN:
     đây là cách Học viện vận hành từ bên trong — đối soát dòng tiền, soát
     quyền truy cập, kiểm hành vi lưu trữ, cổng nghiệm thu — kèm bằng
     chứng phải có để đóng mỗi việc. Chỉ vai được cấp gói nghề mới cần nó,
     và chỉ vai ấy mới nhận được. */
  'CV_MUC',
  /* Chuẩn hợp đồng theo tuyến: nó liệt kê mọi điều khoản Học viện tự
     buộc mình phải có, kèm rủi ro khi thiếu. Đưa ra công khai là đưa cho
     đối thủ bản đồ pháp lý và cho bên tranh chấp danh sách chỗ yếu. */
  'HD_CHUAN', 'HD_RIENG', 'HD_LUAT',
  /* Bảng quy trình toàn hệ: nó vẽ ra cách Học viện vận hành, gồm cả
     luồng giữ tài sản và luồng thanh tra. Đây là bản đồ nội bộ. */
  'QT_LUONG', 'QT_RIENG', 'QT_LUAT',
  /* Tự vận hành: danh mục canh, ngưỡng, và những việc máy tự làm. Đây là
     bản đồ phòng thủ của hệ — mở ra công khai là chỉ cho người muốn dò
     biết đúng ngưỡng nào chưa bị canh. */
  'TD_MUC', 'TD_CANH', 'TD_TRITHUC', 'TD_MAYCHU', 'TD_KHONG', 'TD_THAT',
  /* Gốc NLP và trạng thái bằng chứng: đây là chuẩn nghề — nó nói rõ chỗ
     nào Học viện đang nói chắc hơn bằng chứng cho phép. Ở kho nghề. */
  'NLP_GOC', 'NLP_MUC', 'NLP_CAITIEN', 'NLP_LUAT',
  /* Phạm vi học phí: nói rõ bảng giá này chỉ của GITA365. */
  'HP_PHAM_VI','MOTHUC', 'SACH', 'BANDO_A3', 'POSTER', 'SODO', 'PHACDO',
  'DIEMCHAM', 'NGONTU', 'NGONTU_TANG', 'THAYVI', 'MAUTHOAI', 'PERSONA',
  'CHUAN1000', 'QA_CHOCHU', 'QA_DACHOT', 'HAILONG', 'TAILIEU', 'AIPOLICY', 'KPI', 'DINHTUYEN', 'AINANGCAP',
  'LACHAN', 'BENCH', 'BENCH_AI',
  'LUAT_TK', 'TAIKHOAN_KPI', 'YEUCAU_MO', 'HANG_TL', 'DAU_MAT', 'QUYTRINH',
  'VANBAN', 'TAICHINH_QT', 'THANHTRA', 'RASOAT_KH', 'BANDO_TUVAN', 'BANDO_COACH',
  'XUAT', 'TINHHUONG', 'KHUNG_T5', 'THANHTOAN',
  'REFERRAL', 'CHANDUNG_KH', 'DOLUONG_KH', 'PHANHANG', 'CHUAN_VIP', 'NHANSU_TT', 'CAYTIEN',
  'HOSO_VIP', 'CHUYENDOI', 'XUONG_SONG', 'NGUON_VAITRO', 'SACH_THAMKHAO', 'PHUONGPHAP', 'VANTAY', 'AICHAM', 'TAILIEU_GOC', 'TAILIEU_DRIVE', 'SOTAY_NHANDIEN', 'CAPDO_VANDUNG', 'VANDUNG', 'QUYTRINH_XL', 'RANG_BUOC',
  'TN7', 'LOI5', 'REF_CHUAN', 'TRUYENTHONG3', 'BANG_GAINS', 'BANG_REF', 'REF16', 'REF_GIAIDOAN',
  'REF_LOI5', 'CHUOI10', 'BANDAP',
  /* Phiếu chỉ dẫn referral bản đầy đủ, bộ làm việc sáu chân dung, và lớp
     tra cứu kho tư liệu. Ở gói NGHỀ vì đây là tài sản chuyên môn: người
     giới thiệu và đội ngũ dùng, khách hàng không thấy. */
  /* Học phí và kịch bản nói chuyện tiền: kho NGHỀ. Gia đình đọc bản mô tả
     chặng, không đọc nhịp thu và không đọc kịch bản xử lý phản đối. */
  'HP_TANG', 'HP_LUAT', 'HP_KICHBAN', 'HP_SOAT',
  'REF_30S', 'REF_GAINS_GITA', 'REF_121', 'REF_CHAM', 'REF_CHAM_MUC', 'REF_TRANGTHAI',
  'REF_BANGIAO', 'REF_CAMON', 'REF_KHONG', 'REF_HOI', 'REF_KPI', 'REF_LOI',
  'CD_BO', 'CD_LUAT',
  'TL_KE', 'TL_DUONG', 'TL_LUAT', 'TL_TRICH', 'TL_BAOQUAN',
  'KHACHLON_NGUON', 'KHACH_TANG', 'NAM_TANG_PHUCVU', 'TAM_NAM_TANG', 'NAC_QUANHE',
  'NAC_TRUNGTHANH', 'TAM_MATXICH', 'HOSO68', 'MUOIHAI_NGUYENTAC', 'NHANTANG',
  'NAM_BUOC_KHIEUNAI', 'GIU124', 'VISAO_ROIDI', 'KHACHLON_CAU', 'LUAT_LAMVIEC',
  /* Sổ tay vận hành phần kết (SV_*) và hai tầng 3-4 (T34_*). Sách nghề
     của người đi cùng: mức trần vận hành, chỗ hệ có thể gãy, lời phải
     nói khi hệ sập, ranh giới vai Trợ lý với Coach, mười bốn dạng khó
     và câu nói nguyên văn của từng dạng. Ở gói NGHỀ vì nhà mình đọc thì
     thấy trước kịch bản của chính buổi gặp mình sắp dự. */
  'SV_LOI','SV_THUTU','SV_THUTU_LUAT','SV_DIEULE','SV_DIEULE_LUAT',
  'SV_CAM_QUYMO','SV_RUIRO','SV_NGANSACH_COACH','SV_NGOAI','SV_LECH',
  'SV_CHOCHU','SV_HAI_NGUOI','SV_LUAT',
  'T34_LOI','T34_VAI','T34_VAI_LUAT','T34_GITSA','T34_GITSA_LUAT',
  'T34_BATRU','T34_BATRU_LUAT','T34_T3_CHANG','T34_NHANH','T34_NHANH_LUAT',
  'T34_BUONG','T34_BUONG_LUAT','T34_BUONG_BAY','T34_T4_MUA','T34_T4_NHIP',
  'T34_CHUQUYEN_CON','T34_THATBAI','T34_DENNHAY','T34_KHO','T34_HOSO',
  'T34_DOI_HAUTHUAN','T34_CUARA','T34_CUARA_LUAT','T34_KPI','T34_KPI_LUAT',
  'T34_AUDIT','T34_LECH','T34_LUAT',
  /* Dòng T5-PRO (T5P_*): sách nghề của một dòng có khách riêng —
     cửa vào, kịch bản từ chối, bốn loại phiên, bảy nghi thức, mười
     hai điều đạo đức. Ở gói NGHỀ, và màn của nó còn khoá chặt hơn
     mọi màn nghề khác: dừng ở Senior Coach. */
  'T5P_LOI','T5P_BATRU','T5P_KHAC_T5','T5P_KHAC_LUAT','T5P_KHONGLA',
  'T5P_GIAIDOAN','T5P_TRINHTU','T5P_DOI','T5P_PHOI_DOI','T5P_DAODUC',
  'T5P_DAODUC_LUAT','T5P_NANGLUC','T5P_CUM','T5P_MUC','T5P_NANGLUC_LUAT',
  'T5P_SANGLOC','T5P_SANGLOC_LUAT','T5P_TUCHOI_LUAT','T5P_TUCHOI','T5P_SAUTUCHOI',
  'T5P_PHIEN','T5P_NGHITHUC','T5P_NGHITHUC_LUAT','T5P_KHUNGHOANG','T5P_KHUNGHOANG_LUAT',
  'T5P_DICH','T5P_GIA','T5P_LECH','T5P_CHOCHU','T5P_LUAT',
  /* Bộ bản vẽ 13 tờ (BV_*): đặc tả vận hành — ma trận 50 ô có tag,
     bốn cổng, mười nhịp, hai mươi tín hiệu đỏ, trần công suất từng
     vai, và bản đồ nâng cấp Web App. Ở gói NGHỀ: nhà mình đọc bảng
     điều phối thì thấy mình là một dòng trong đó. */
  'BV_LOI','BV_NGUYENTAC','BV_TANG','BV_CAPDO','BV_CAPDO_LUAT',
  'BV_CONG','BV_CONG_LUAT','BV_TUTCAP','BV_NHIP','BV_NHIP_LUAT',
  'BV_DO','BV_LOC','BV_LOC_LUAT','BV_RAO','BV_TRIGGER',
  'BV_MODULE','BV_MODULE_NOI','BV_MODULE_LUAT','BV_BANG','BV_VAI',
  'BV_VAI_LUAT','BV_BANGIAO','BV_LECH','BV_CHOCHU','BV_LUAT',
  'BV_DO_NOI','BV_DO_NOI_LUAT',
  /* Bàn làm việc của Coach (BLV_*): năm ngăn vét cạn, gói tài nguyên
     tám ô, bảy loại nhắc việc có hạn giờ, bốn lượt rà soát. Ở gói
     NGHỀ — nhà mình đọc hàng đợi thì thấy mình là một dòng trong đó. */
  'BLV_LOI','BLV_NGAN','BLV_NGAN_LUAT','BLV_GOI','BLV_GOI_LUAT',
  'BLV_NHAC','BLV_NHAC_LUAT','BLV_RASOAT','BLV_LUAT',
  'BLV_DUYET','BLV_DUYET_DIEU','BLV_DUYET_LUAT','BLV_CHOCHU',
  'BLV_MOC','BLV_MOC_LUAT',
  /* Bàn làm việc của Tư vấn (TVB_*) và bảng đăng ký hoạt động (HD_*).
     Ở gói NGHỀ: bàn Tư vấn cho thấy nhà nào đang bị treo và vì sao chưa
     chốt, còn bảng hoạt động cho thấy toàn bộ quy trình nội bộ. */
  'TVB_LOI','TVB_NGAN','TVB_NGAN_LUAT','TVB_GOI','TVB_GOI_LUAT','TVB_LUAT',
  'DKH_LOI','DKH_MUC','DKH_CAM_MAY','DKH_VIEC','DKH_LUAT',
  /* Diễn thử hai buổi khó nhất — ở gói NGHỀ vì mỗi lượt phơi ra
     đúng câu người tư vấn ĐÁNG LẼ đã nói, tức là bộ đề của chính
     kỳ sát hạch đội ngũ. */
  'DTH_LOI','DTH_BAI','DTH_LUAT',
  /* Chuẩn ngôn ngữ sáu vai và phễu chốt — ở gói NGHỀ vì bảng cấm
     phơi ra đúng câu người bán DỄ nói nhất, và phễu phơi ra ai bị
     loại ở tầng nào. */
  'NN_LOI','NN_VAI','NN_VAI_LUAT','NN_CAM','NN_CAM_LUAT',
  'PH_LOI','PH_TANG','PH_CHOT',
  /* 1000 điểm chạm WOW + 1000 điểm khoá (máy sinh) và mười hai điều
     tay nghề (viết tay). Ở gói NGHỀ: bảng này phơi ra đúng chỗ hệ
     định chạm vào cảm xúc nào, lúc nào. */
  'DC1K_WOW','DC1K_KHOA',
  'TN_LOI','TN_DIEU','TN_LUAT','TN_GHIDE','TN_GHIDE_LUAT',
  /* Hành lang thành công và bản rà soát lỗi hệ thống. Hai kho này soi
     chính hệ đang chạy — chúng nêu tên hàm, tên kho và chỗ còn hở, nên
     ai đọc được là đọc luôn bản đồ chỗ yếu. Khoá ở gói NGHỀ. */
  'HL_LOI','HL_LUAT12','HL_LUAT12_LUAT','HL_VIRUS','HL_VIRUS_LUAT',
  'HL_QUYTRINH','HL_KHOA9','HL_KHOA9_LUAT','HL_SAUNHIP','HL_SAUNHIP_LUAT',
  'HL_CHISO','HL_LECH',
  'RS_LOI','RS_NHOM','RS_CHAN','RS_GOC','RS_HOI','RS_DOT','RS_LUAT',
  /* Rà soát pháp lý, chuẩn bằng chứng và bộ hồ sơ hợp đồng. Ba kho
     này nêu tên hàm, chỗ hệ còn hở trước pháp luật, và cả khung hợp
     đồng nội bộ — đọc được là đọc luôn chỗ yếu và điều khoản của Học
     viện. Khoá ở gói NGHỀ.

     Tiền tố RSP_ chứ không phải PL_: PL_ đã thuộc về kho pháp lý nội
     bộ (bảy quyền của gia đình). Hai kho khác nhau, hai tiền tố. */
  'RSP_LOI','RSP_LUATMOI','RSP_LUATMOI_LUAT','RSP_NHOM','RSP_CHAN','RSP_CHAN_LUAT',
  'RSP_GOC','RSP_VB','RSP_DKMOI','RSP_DOT','RSP_LUATSU','RSP_LECH','RSP_LECH_LUAT','RSP_LUAT',
  'BCD_LOI','BCD_TINHCHAT','BCD_TINHCHAT_LUAT','BCD_THAOTAC','BCD_THAOTAC_LUAT',
  'BCD_MATGIA','BCD_MATGIA_LUAT','BCD_VIECGAN','BCD_LUAT',
  'HSH_LOI','HSH_DK6','HSH_DK6_LUAT','HSH_DK','HSH_HD','HSH_BAC','HSH_LUONG_LUAT',
  'HSH_PHONG','HSH_VO','HSH_HOP','HSH_HOP_LUAT','HSH_KY','HSH_KY_LUAT',
  'HSH_LOTRINH','HSH_LOTRINH_LUAT','HSH_BAOMAT','HSH_LUAT',
  /* Hướng dẫn ký kết theo ba luồng phát sinh. Kho này nêu ai ký, ký
     cấp mấy và chỗ dễ sai — đọc được là đọc luôn quy trình nội bộ
     của Học viện. Khoá ở gói NGHỀ. */
  'KK_LOI','KK_CUA','KK_CUA_LUAT','KK_A','KK_B','KK_C','KK_LUONG_LUAT',
  'KK_CHON','KK_CHON_LUAT','KK_CAM','KK_LUAT',
  /* Sổ tay Super Admin — phần NGƯỜI VIẾT. Phần danh sách màn thì máy
     sinh từ G.NAV lúc chạy, không nằm trong kho. Kho này nêu nút nào
     nguy và cái sai đã từng xảy ra, nên khoá ở gói NGHỀ. */
  'STA_LOI','STA_NHOM','STA_NHIP','STA_NHIP_LUAT','STA_XUONGSONG','STA_XUONGSONG_LUAT',
  'STA_BAYNGAY','STA_BAYNGAY_LUAT','STA_CAM','STA_LUAT',
  /* Bảng tin NỘI BỘ của đội ngũ — khác hẳn TIN_ là bảng tin cộng đồng
     cho gia đình. Kho này mang việc nội bộ, hồ sơ ca và số toàn hệ, nên
     khách hàng và cộng tác viên KHÔNG được nhận. Ở gói NGHỀ. */
  'BTN_LOI','BTN_NGAN','BTN_NGAN_LUAT','BTN_VINHDANH','BTN_VINHDANH_LUAT',
  'BTN_TRAN','BTN_CAM','BTN_LUAT',
  /* Tự động hoá ở tầng hệ thống — nối vào DKH_ của bản 9.61. Kho nêu
     tên công cụ, tên hàm và năm chỗ máy không được nhận; đó là bản đồ
     ruột của hệ, nên khoá ở gói NGHỀ. */
  'TDH_LOI','TDH_HE','TDH_HE_LUAT','TDH_CHAN','TDH_CHAN_LUAT',
  'TDH_DUONG','TDH_DUONG_LUAT','TDH_LUAT',
];

const goi = {};
goi.nen  = Object.fromEntries(NEN.map(k => [k, G[k]]).filter(([, v]) => v !== undefined));
goi.nghe = Object.fromEntries(NGHE.map(k => [k, G[k]]).filter(([, v]) => v !== undefined));

/* ══════════ BỐN KHO CHIA THEO BẢN GHI, KHÔNG THEO TÊN KHO ══════════
   Ba kho trên chia được vì cả kho thuộc về một phạm vi. Bốn kho dưới đây
   thì không: mỗi kho phục vụ NHIỀU phạm vi cùng lúc, nên phải cắt theo
   từng bản ghi.

     CHUYEN   600 chuyện, mỗi cấp tài khoản 100. Một phụ huynh đang nhận
              cả 100 chuyện của cấp ADMIN và 100 của cấp TƯ VẤN — chuyện
              nội bộ về cách Học viện được dựng lên.
     SH_HOI   348 câu sát hạch kèm đáp án, chia sáu vai. Một phụ huynh
              đang giữ nguyên ngân hàng câu hỏi sát hạch của Coach, Giáo
              viên và Tư vấn — tức là bộ đề của kỳ thi mà chính họ không
              thi, và người khác thì phải thi thật.
     KH_BAI   30 bài khoá đào tạo nghề. Cộng tác viên có phần của mình
              (15 bài), phần còn lại là của đội ngũ.
     QUA1000  1000 cẩm nang một trang, chia năm tầng. Một nhà Tầng 1 đang
              nhận cả tư liệu Tầng 5 — trái đúng luật anh Quang đặt ra:
              khách hàng chỉ dùng trong giới hạn tầng được cấp phép.

   Chia rồi thì hai nửa mang CÙNG MỘT TÊN KHO ở hai gói khác nhau, và
   G.KHO_TRAI_RA bên src/kho-khoa.js nối chúng lại khi mở gói. Nhờ vậy
   không màn hình nào phải sửa: đội ngũ mở đủ hai gói vẫn thấy đủ 600
   chuyện, gia đình chỉ thấy 300 của mình. */
const CAP_NHA   = ['HS', 'PH', 'CTV'];        /* cấp tài khoản của phía khách hàng */
const VAI_NHA   = ['HS', 'PH', 'CTV'];
goi.nen.CHUYEN  = (G.CHUYEN || []).filter(c => CAP_NHA.includes(c.cap));
goi.nghe.CHUYEN = (G.CHUYEN || []).filter(c => !CAP_NHA.includes(c.cap));
goi.nen.SH_HOI  = (G.SH_HOI || []).filter(h => VAI_NHA.includes(h.vai));
goi.nghe.SH_HOI = (G.SH_HOI || []).filter(h => !VAI_NHA.includes(h.vai));
/* Bài nào có CTV trong danh sách vai thì cộng tác viên phải đọc được, nên
   nó đi gói nền. Đội ngũ mở cả hai gói nên vẫn thấy đủ ba mươi bài. */
goi.nen.KH_BAI  = (G.KH_BAI || []).filter(b => (b.vai || []).includes('CTV'));
goi.nghe.KH_BAI = (G.KH_BAI || []).filter(b => !(b.vai || []).includes('CTV'));
/* ── NĂM CỬA TỬ: MỞ KHUNG, KHOÁ LỜI ──
   Màn của gia đình cần biết mình đang ở chặng nào và ĐANG ĐƯỢC ĐỠ BẰNG
   GÌ — đó là phần làm họ yên tâm. Nhưng hai cột `vi` (vì sao chỗ này
   mất người) và `bom` (bơm cảm xúc nào vào lúc nào) là bản phân tích
   rời bỏ của Học viện. Gửi xuống máy phụ huynh rồi thì gõ G.HM_NGUY
   trong công cụ nhà phát triển là đọc hết — đúng cái lỗi CV_MUC đã mắc.

   Nên hai nửa mang HAI TÊN KHÁC NHAU, không dựa vào thứ tự nạp gói.
   Cùng một tên ở hai gói thì gói tới sau đè gói tới trước, mà nen nạp
   chặn còn nghe nạp nền — hôm nào đổi thứ tự ấy là lộ, và lộ lặng lẽ. */
goi.nen.HM_NGUY = (G.HM_NGUY || []).map(x => {
  const r = { so: x.so, ma: x.ma, ten: x.ten, c: x.c, khi: x.khi, co: x.co };
  if (x.tuNgay !== undefined) { r.tuNgay = x.tuNgay; r.denNgay = x.denNgay; }
  if (x.khiMua) r.khiMua = true;
  return r;
});
/* ── SỐ NGÀY CỦA NĂM TẦNG, RÚT RA CHO GÓI NỀN ──
   HP_TANG ở gói NGHỀ vì nó chứa GIÁ. Nhưng số ngày thì không phải bí
   mật — nó là lời hứa với nhà mình, và bản đồ công khai đã in nó rồi.
   Giấu nó khỏi gia đình thì bàn cờ hành trình của chính họ không biết
   mình dài bao nhiêu ô, và màn ấy trống.

   SINH RA TỪ HP_TANG lúc đóng gói, không gõ tay: sửa số ngày ở bảng học
   phí thì bản rút này đổi theo trong cùng một lần chạy. Gõ tay là dựng
   bản thứ hai, và hai bản thì sẽ có ngày lệch nhau. Cùng cách đã dùng
   cho CV_MUC ở gói mẫu. */
/* Hồ sơ nhà của CHÍNH người đang xem. Rút từ FAMILIES lúc đóng gói:
   đúng MỘT bản ghi, và là bản ghi mà cổng gia đình vẫn đại diện. Gõ tay
   một bản thứ hai thì sửa hồ sơ ở kho gốc mà bản rút ở lại. */
goi.nen.NHA_TOI = (G.FAMILIES || []).slice(0, 1);

/* ── GÓI NGHỀ CHỈ MANG TẦNG MỘT TỚI BA (bản 9.47) ──
   Bản 9.41 chuyển FAMILIES từ gói NỀN sang gói NGHỀ, và chuyện ấy đúng:
   nó chặn phụ huynh nhận hồ sơ chín nhà khác. Nhưng nó chỉ chặn được một
   nửa, vì gói NGHỀ cấp cho MỌI vai tới bậc 12 — nghĩa là Giáo viên,
   Mentor, Chuyên gia đánh giá và Phân tích dữ liệu vẫn nhận đủ tên nhà,
   tên bố mẹ, tên Coach và băng KPI của cả năm tầng về máy mình.

   Chủ hệ chốt: tầng 4-5 chỉ từ Coach lên tới Super Admin, và ai cũng
   phải được Super Admin cấp quyền. Không luật nào trong hai câu ấy thi
   hành được bằng cách lọc trên màn hình — gửi xuống rồi thì mở công cụ
   nhà phát triển là đọc được hết, và một giấy phép thu hồi cũng không
   gọi ngược được bản sao đã nằm trong máy người ta.

   Nên gói NGHỀ cắt còn tầng một tới ba. Tầng bốn và năm KHÔNG nằm trong
   gói nào: chúng đi qua một lượt hỏi máy chủ, máy chủ kiểm giấy phép,
   và ghi sổ từng lượt. Cái giá là mất mạng thì không mở được — đáng,
   vì một lượt hỏi thu hồi được còn một bản sao thì không.

   Cắt ở ĐÂY chứ không ở lớp hiển thị: đây là chỗ duy nhất quyết định
   được cái gì rời khỏi máy chủ. */
goi.nghe.FAMILIES = (G.FAMILIES || []).filter(f => Number(f.tier) <= 3);

/* ── GÓI NGHỀ CAO: TẦNG BỐN VÀ NĂM ──
   Bốn bản ghi tầng cao KHÔNG bị vứt đi — chúng sang một gói riêng, cấp
   tới đúng bậc của Coach.

   Vì sao phải có gói thứ tám thay vì bỏ hẳn bốn bản ghi ấy khỏi kho:
   kho-goc/ nằm trong .gitignore, nên BẢY TỆP .enc ĐÃ PHÁT HÀNH LÀ BẢN
   LƯU DUY NHẤT của nội dung. Cắt bốn bản ghi khỏi mọi gói là xoá luôn
   bản lưu duy nhất của chúng — mất là mất hẳn, và ở bản 9.6 chính bảy
   tệp này đã cứu được cả kho một lần.

   FAMILIES nay trải trên HAI gói nên phải khai tên ở G.KHO_TRAI_RA —
   không khai thì gói mở sau GÁN ĐÈ gói mở trước, và tuỳ thứ tự nạp mà
   Coach mất tầng thấp hoặc mất tầng cao, im lặng, không một lời báo. */
goi['nghe-cao'] = { FAMILIES: (G.FAMILIES || []).filter(f => Number(f.tier) >= 4) };

goi.nen.HP_NGAY = (G.HP_TANG || []).map(t => {
  const so = String(t.ten || '').match(/\d+/);
  /* GIÁ ĐI KÈM TỪ 9.49. Bảng giá năm tầng là thông tin công khai — chính
     nhà đang dùng phải biết tầng sau bao nhiêu tiền mới đăng ký được.
     Trước đây bản rút này bỏ giá, nên lời mời "đăng ký lộ trình tầng
     trên" trên máy khách không nói được con số nào, và một lời mời không
     có giá thì người ta phải đi hỏi mới biết — thêm một bước để bỏ cuộc. */
  return { tang: t.tang, ten: t.ten, ngay: so ? Number(so[0]) : null,
    gia: t.gia === undefined ? null : t.gia, donVi: t.donVi };
});

goi.nghe.HM_NGUY_SAU = G.HM_NGUY;
/* Trần nội dung của khách — ĐỌC TỪ src/kho-khach.js, không gõ lại.
   Tệp ấy là mã trình duyệt nên không require được ở đây; đọc bằng một
   phép khớp chuỗi thì vẫn đúng một nguồn. Gõ lại 0.30 ở đây là dựng bản
   thứ hai của một con số có giá, và tới ngày chủ hệ đổi trần thì gói cắt
   một đằng còn màn hình tính một nẻo. */
const TRAN_KHACH = (() => {
  const t = fs.readFileSync(path.join(GOC, 'src', 'kho-khach.js'), 'utf8');
  const m = /G\.TRAN_KHACH\s*=\s*([0-9.]+)/.exec(t);
  if (!m) { console.error('  ✗ Không đọc được G.TRAN_KHACH từ src/kho-khach.js'); process.exit(1); }
  return Number(m[1]);
})();

/* ── KỊCH BẢN CHUYÊN MÔN KHÔNG ĐI THEO GÓI TẦNG ──
   Kịch bản từng nằm trong gói tầng, mỗi tầng 200 cái. Nghĩa là một
   phụ huynh Tầng 3 nhận về máy mình 200 kịch bản coaching: nguyên văn
   câu mở của Coach, mục tiêu từng buổi, và cả danh sách điều Coach
   tuyệt đối không được làm.

   Màn "Kịch bản" khoá ở quyền nghe_chung (chỉ R01–R12), nên Ý ĐỊNH của
   sản phẩm đã rõ: đây là tài sản nghề, khách hàng không xem. Nhưng
   khoá màn hình mà vẫn gửi dữ liệu là khoá cửa và đưa chìa: mở công cụ
   nhà phát triển gõ G.KICHBAN là đọc được hết.

   Không màn nào của khách hàng hiển thị kịch bản (màn "Kho" chỉ hiện
   con số, và có số dự phòng ở G.META.soKichBan), nên chuyển sang gói
   NGHỀ không mất gì của khách. Gói tầng giữ nguyên phần vốn là của
   khách: ma trận tầng và bộ test của tầng ấy. */
for (let t = 1; t <= 5; t++)
  goi['tang' + t] = {
    TEST750: (G.TEST750 || []).filter(b => b.tang === 'T' + t),
    /* Cẩm nang một trang đi theo tầng, cùng đường với bộ test và ma trận.
       Trước bản 9.8 nó nằm ở gói nền, nên một nhà Tầng 1 nhận đủ 1000 tờ
       của cả năm tầng — 203 KB, và là tư liệu của những tầng họ chưa mua. */
    QUA1000: (G.QUA1000 || []).filter(q => q.tang === 'T' + t),
    ['MATRAN_T' + t]: G['MATRAN_T' + t] || []
  };

/* ─── Gói của bốn tuyến chuyên môn ───
   ENGWIN365 · MATH365 · SAT365 · HSA365 dùng chung năm tầng của GITA365
   nhưng có kho riêng và băng riêng, nên mỗi tuyến có gói cấp phép riêng:
   bán MATH365 mà không mở SAT365.

   Quy ước đặt tên kho của một tuyến: tiền tố là mã tuyến, ví dụ
   MATH365_BANG · MATH365_KICHBAN · MATH365_TANG · MATH365_DO. Đặt tên
   như thế thì chỗ này không phải liệt kê tay từng kho — thêm một tệp
   kho-goc/data.math365.js là gói tự có nội dung.

   CHỈ dựng gói khi tuyến ĐÃ CÓ nội dung. Dựng gói rỗng thì bộ khoá có
   thêm một khoá mở ra một cái hộp không có gì, và người cấp giấy phép
   tưởng tuyến ấy đã sẵn sàng. */
{
  global.window = global.window || {};
  require(path.join(GOC, 'src', 'data.tuyen.js'));
  const T = global.window.G;
  /* data.tuyen.js gán vào cùng một window.G nên G ở trên đã có sẵn các
     hàm tên gói; lấy lại cho rõ ý là đang dùng bảng tuyến. */
  const boQua = [];
  for (const t of T.TUYEN) {
    if (t.goiCu) continue;                       /* GITA365 đã dựng ở trên */
    const tienTo = t.ma + '_';
    const kho = Object.keys(G).filter(k => k.indexOf(tienTo) === 0);
    if (!kho.length) { boQua.push(t.ma); continue; }

    /* Kho chung của tuyến (băng, chuẩn đo, luật) đi vào gói nghề; nội
       dung theo tầng tách ra đúng tầng của nó. */
    goi[T.goiNghe(t.ma)] = Object.fromEntries(
      kho.filter(k => !/_T[1-5]$/.test(k)).map(k => [k, G[k]]));
    for (let n = 1; n <= T.TUYEN_SO_TANG; n++) {
      const rieng = kho.filter(k => k.endsWith('_T' + n));
      if (!rieng.length) continue;
      goi[T.goiTang(t.ma, n)] = Object.fromEntries(rieng.map(k => [k, G[k]]));
    }
    if (t.trangThai !== 'chay')
      console.log('  ⚠ ' + t.ma + ' có nội dung nhưng trangThai vẫn là "chuan" — ' +
        'đổi sang "chay" trong src/data.tuyen.js và server/GITA_CapPhep.gs thì khách mới mở được.');
  }
  if (boQua.length)
    console.log('  Chưa dựng gói cho: ' + boQua.join(' ') + ' — chưa có kho nào mang tiền tố ấy.\n');
}

/* ─── Mã hoá ───
   Khoá được GIỮ NGUYÊN giữa các lần mã hoá lại. Đổi khoá là mọi giấy
   phép đã cấp cho khách và cho đội ngũ đều hết dùng được ngay lập tức.
   Muốn đổi khoá thật (khi nghi rò rỉ) thì chạy:  node tools/ma-hoa-kho.js --doi-khoa
   rồi cấp lại giấy phép cho toàn bộ người đang dùng. */
fs.mkdirSync(RA, { recursive: true });
const doiKhoa = process.argv.includes('--doi-khoa');
let khoaCu = {};
if (!doiKhoa) {
  try { khoaCu = JSON.parse(fs.readFileSync(path.join(RA, 'khoa.json'), 'utf8')).khoa || {}; }
  catch { khoaCu = {}; }
}
if (doiKhoa) console.log('  ⚠ ĐỔI KHOÁ: mọi giấy phép đã cấp sẽ hết hiệu lực. Phải cấp lại toàn bộ.\n');
const khoa = {};
let tong = 0;
let giu = 0;

/* ── NÉN TRƯỚC, MÃ HOÁ SAU ──
   Thứ tự này không đảo được. Nén trước thì nén được thật vì JSON lặp rất
   nhiều: đo trên kho thật, 13,6 MB xuống 2,07 MB, riêng các gói tầng giảm
   14 đến 31 lần vì ma trận và bộ test lặp cấu trúc gần như hoàn toàn. Nén
   sau khi mã hoá thì không giảm nổi một phần trăm — bản đã mã hoá là chuỗi
   ngẫu nhiên, mà thứ ngẫu nhiên thì không nén được. Đó là định nghĩa.

   Máy khách nhận ra gói đã nén bằng hai byte đầu (0x1F 0x8B) sau khi giải
   mã, nên KHÔNG phải đổi định dạng phong bì và gói cũ vẫn mở được. */
const zlib = require('zlib');

for (const [ten, du] of Object.entries(goi)) {
  const chu = Buffer.from(JSON.stringify(du), 'utf8');
  const ro = zlib.gzipSync(chu, { level: 9 });
  const k = khoaCu[ten] ? Buffer.from(khoaCu[ten], 'base64') : crypto.randomBytes(32);
  if (khoaCu[ten] && k.length === 32) giu++; else if (khoaCu[ten]) throw new Error('Khoá cũ của gói ' + ten + ' không đúng 32 byte.');
  const iv = crypto.randomBytes(12);
  const c = crypto.createCipheriv('aes-256-gcm', k, iv);
  const ma = Buffer.concat([c.update(ro), c.final()]);
  const tag = c.getAuthTag();
  /* iv (12) + tag (16) + dữ liệu */
  fs.writeFileSync(path.join(RA, ten + '.enc'), Buffer.concat([iv, tag, ma]));
  khoa[ten] = k.toString('base64');
  tong += ma.length;
  console.log('  ' + ten.padEnd(8) + ' ' + String(Math.round(chu.length / 1024)).padStart(5) + ' KB → ' +
    String(Math.round(ma.length / 1024)).padStart(5) + ' KB nén rồi mã hoá  (giảm ' +
    (chu.length / ma.length).toFixed(1) + 'x)');
}

/* 0600: chỉ chủ tệp đọc được. Mặc định 0644 là mọi tài khoản trên máy
   đọc được tệp mang TOÀN BỘ khoá của Học viện — và trên máy dựng bản
   hay máy nhiều người thì "mọi tài khoản" không phải một người. */
fs.writeFileSync(path.join(RA, 'khoa.json'), JSON.stringify({
  chuY: 'BỘ KHOÁ MẬT — nạp vào máy chủ cấp phép, không bao giờ đưa lên kho mã.',
  taoLuc: new Date().toISOString(),
  thuatToan: 'AES-256-GCM',
  khoa
}, null, 2), { mode: 0o600 });

/* ─── Gói mẫu công khai: đủ để xem giao diện, không lộ kho ───
   Chỉ những phần GITA 365 vẫn nói ra ngoài khi giới thiệu: câu chuyện
   chuyển hoá, lộ trình năm tầng, kiến trúc trăm năm, chuỗi trải nghiệm,
   cách ghi nhận và nhận diện thương hiệu. Phần nghề — 1.000 kịch bản,
   220 phác đồ, 42 mô thức, ngôn từ dẫn dắt, tình huống, văn bản, tài
   chính, quản trị — KHÔNG nằm ở đây. */
const MO_RA = [
  /* Phần GITA vẫn nói ra ngoài khi giới thiệu */
  'CHUYENDICH', 'LOTRINH', 'TIERS', 'TAMNHIN100', 'TANG100', 'WOW',
  'NHATBAN', 'LEVELS', 'DIEM', 'HUYHIEU', 'QUA_DANG', 'BRAND', 'BAIHOC',
  /* Mở thêm ở v7.6 — mô hình công khai và nhịp sống nhà mình.
     Lý do: khoá những phần này làm gia đình không dùng được ứng dụng
     hằng ngày, trong khi chúng đã nằm trong tài liệu giới thiệu và
     trang web của Học viện. Phần NGHỀ vẫn khoá nguyên: 1.000 kịch bản
     đầy đủ, 220 phác đồ, 42 mô thức, ngôn từ dẫn dắt, 250 tình huống,
     ma trận, xương sống phương pháp, hệ VIP và Cây Tiền, toàn bộ quản
     trị và tài chính. */
  'VANHANH',      /* 5 khoang · 9 vai — mô hình lõi, đã công bố */
  'CHANDUNG',     /* mười chân dung thành công */
  'CUHICH',       /* cú hích lớn trong nhà */
  'NGHILE',       /* thói quen và nghi lễ gia đình */
  'SUKIEN',       /* sự kiện và lửa trại */
  'KETNOI',       /* kết nối hệ sinh thái */
  'LIENKET',      /* liên kết giữa các phần */
  'DAISU',        /* chương trình đại sứ — điều kiện công khai */
  'HOAHONG',      /* bốn cấp và trần hoa hồng 10% — điều khoản thương mại công khai */
  'NGONTU_RANH',  /* sáu ranh giới — luật an toàn, càng nhiều người biết càng tốt */
  'QUA',          /* cách ghi nhận và trao quà */
  'DANDAT',       /* hành trình người dẫn dắt — phần giới thiệu nghề */
  /* Đường vào sáu bước: đây CHÍNH LÀ phần giới thiệu. Một gia đình
     đang cân nhắc phải xem được con đường trước khi quyết định bước
     vào — khoá nó lại là khoá đúng cái cửa mình đang mời người ta qua.
     Phần học phí (HP_*) thì ngược lại: vẫn khoá trong kho nghề. */
  'DV_BUOC', 'DV_CHAN', 'DV_HOI',
  /* Bản giới thiệu Học viện. Cùng một lý do với DV_* và mạnh hơn: màn
     "GITA 365 là gì" mở cho MỌI người (capMo:'chung') — đó là cửa trước.
     Nhưng kho GT_* lại chỉ nằm ở gói NỀN, nên trên bản giới thiệu một tệp
     và trên trang web công khai, màn ấy dựng ra đúng mười hai cái tiêu đề
     mục và không có chữ nào bên trong. Người đầu tiên nhìn thấy GITA365
     nhìn thấy một cái khung rỗng.

     Nội dung này vốn đã là thứ Học viện nói ra ngoài: sứ mệnh, tầm nhìn,
     mục tiêu có mốc, năm tầng, văn hoá, cách đồng hành, và cả sáu điều
     Học viện KHÔNG làm. Khoá nó lại là khoá đúng cái cửa mình đang mời
     người ta bước qua.

     Phần nghề vẫn khoá nguyên: 1.000 kịch bản, 220 phác đồ, 42 mô thức,
     250 tình huống, ma trận, và toàn bộ HP_* học phí. */
  'GT_MOT_CAU', 'GT_VISAO', 'GT_HUA', 'GT_KHONG', 'GT_CHANG', 'GT_TANG',
  'GT_VAI', 'GT_HOI', 'GT_SO', 'GT_BUOC', 'GT_MUCTIEU', 'GT_MUCTIEU_RANH',
  'GT_DONGHANH',
  /* Hành trình 12 chặng: con số "12 chặng" đã nằm ngay trong bảng số liệu
     giới thiệu, và một gia đình đang cân nhắc cần nhìn thấy con đường
     trước khi quyết bước vào. Giấu chính tấm bản đồ mình đang mời người
     ta đi thì lời mời không có nghĩa gì. */
  'HANHTRINH12', 'TRU_GITA',
  'KENH_DS', 'KENH_CHANG', 'KENH_LUAT',
  /* Việc của hôm nay, theo từng cổng: 4 việc cho phụ huynh, 3 cho học
     viên, 3 cho cộng tác viên, và của cả đội ngũ. Thiếu nó ở gói công
     khai thì màn "Nhiệm vụ hôm nay" — màn dẫn hành động nặng nhất của
     khách hàng — ném lỗi ngay trên bản một tệp gửi cho khách.

     Đây không phải tài sản nghề: nó là danh sách việc mà chính gia đình
     phải làm, viết bằng ngôn ngữ gia đình. Giấu nó đi là giấu đúng phần
     mình đang bảo người ta làm. */
  'TODAY',
  /* Bốn trạng thái việc, luật chấm KPI, bốn hạng tháng, và toàn bộ phần
     KPI của gia đình. Đây là LUẬT CHƠI, không phải bí quyết: một người
     đang cân nhắc vào làm, và một gia đình đang cân nhắc tham gia, đều
     phải đọc được cách mình sẽ bị đo TRƯỚC KHI quyết. Giấu cách đo rồi
     mới đo là cách chắc chắn để không ai tin con số.

     Danh mục đầu việc CV_MUC thì khác — nó xuống dưới ở dạng rút. */
  'CV_TRANG', 'CV_LUAT', 'CV_HANG', 'CV_KH_NGAY', 'CV_KH_TANG', 'CV_KPI_CAP', 'CV_KPI_CAP_LUAT',
  /* Chuẩn thời hạn và thang thưởng phạt. Máy chấm công việc đọc hạn giờ
     từ TG_NHIEMVU; thiếu nó thì nhipCua() trả undefined và MỌI việc rơi
     về hạn mặc định 24 giờ — một việc tháng và một việc ngày cùng đến
     hạn vào mai. Bảng công việc trên bản xem thử khi ấy chạy được nhưng
     chạy sai, và sai lặng lẽ.

     Cùng lý do với CV_LUAT: đây là cách người ta bị đo, phải đọc được
     trước khi bị đo. */
  'TG_NHIEMVU', 'TG_THUONG', 'TG_PHAT',
  /* Chuẩn lời dễ hiểu: ai cũng phải đọc được cách Học viện tự buộc mình viết. */
  'DEHIEU_LUAT', 'DEHIEU_THAY', 'DEHIEU_TRANG', 'DEHIEU_NGUONG'
  /* SOAT_* KHÔNG nằm ở đây. Chuẩn soát liệt kê tên mọi kho nội bộ, trường
     bắt buộc của từng kho và số bản ghi phải có — đưa vào gói mẫu công khai
     là vẽ sẵn bản đồ kho cho người chưa được cấp phép. Nó ở gói NỀN. */
];
/* Sáu câu trải đều các miền, không phải sáu câu đầu: sáu câu đầu của
   một bài ba mươi câu thường rơi hết vào miền thứ nhất, nên bản xem thử
   chấm ra một miền có điểm và bốn miền trống. Lấy mỗi miền một câu
   trước, còn chỗ thì bù thêm theo thứ tự gốc. */
function cauMau(b) {
  const ra = [], da = new Set();
  for (const m of b.mien) {
    const c = b.cau.find(x => x.mien === m);
    if (c) { ra.push(c); da.add(c.id); }
  }
  for (const c of b.cau) {
    if (ra.length >= Math.max(6, b.mien.length)) break;
    if (!da.has(c.id)) { ra.push(c); da.add(c.id); }
  }
  return b.cau.filter(c => da.has(c.id));   /* giữ nguyên thứ tự gốc */
}


/* Rút một đầu việc xuống bản khung cho gói công khai: giữ mã · vị trí ·
   nhịp · điểm · tên · bước luân chuyển, cắt phần dạy nghề. */
function rutDauViec(m) {
  const r = { ma: m.ma, vai: m.vai, nhip: m.nhip, diem: m.diem, ten: m.ten,
    mo: (m.mo || '').slice(0, 80) + '… [cần cấp phép]',
    xong: '[Cách đóng việc mở khi được cấp phép]' };
  if (m.chuyen) r.chuyen = m.chuyen;
  if (m.lienDoi) r.lienDoi = '[Điều khoản liên đới mở khi được cấp phép]';
  return r;
}

const mau = {
  ...Object.fromEntries(MO_RA.map(k => [k, G[k]]).filter(([, v]) => v !== undefined)),
  KICHBAN: (G.KICHBAN || []).filter(k => k.tang === 'T1').slice(0, 8)
    .map(k => ({ ...k, mo: (k.mo || '').slice(0, 90) + '… [cần cấp phép]', chot: undefined, khong: undefined })),
  PHACDO: (G.PHACDO || []).slice(0, 6)
    .map(p => ({ ma: p.ma, nhom: p.nhom, nhomTen: p.nhomTen, ten: p.ten })),
  MOTHUC: (G.MOTHUC || []).slice(0, 4)
    .map(m => ({ id: m.id, title: m.title, summary: (m.summary || '').slice(0, 120) + '… [cần cấp phép]' })),
  /* Mười điểm về đích: mở tên và ý nghĩa, mở đủ tiêu chí của điểm mốc
     đầu tiên. Chín mốc còn lại chỉ đếm số tiêu chí, không mở nội dung. */
  KPI100: G.KPI100 && {
    ...G.KPI100,
    diem: G.KPI100.diem.map((d, i) => ({
      ...d, tc: i === 0 ? d.tc : d.tc.map(() => '[Tiêu chí mở khi được cấp phép]')
    }))
  },
  /* CẢ NĂM bài của tầng một, mỗi bài rút còn sáu câu.
     Trước đây chỗ này chỉ mở MỘT bài. Hậu quả: đường vào sáu bước hứa ở
     bước ba là "làm bài test đánh giá" và màn test tự giới thiệu là "năm
     nhóm bài cho mỗi tầng", nhưng người mở bản xem thử chỉ thấy đúng một
     thẻ. Lời hứa và màn hình nói khác nhau ngay ở bước người lạ gặp đầu
     tiên — và người xem kết luận là phần năm bài không tồn tại.

     Mở tên, miền đo, mức phân nhóm và sáu câu của mỗi bài: đủ để thấy
     hình dạng cả năm bài và chấm thử được. Ba mươi câu trên bảy trăm
     năm mươi là 4% — kho câu hỏi vẫn nằm trong gói tầng đã mã hoá.
     soCauThat đi kèm để màn hình nói đúng đây là bản rút, không để
     người xem tưởng bài thật chỉ có sáu câu. */
  /* Danh mục đầu việc: mở KHUNG, khoá RUỘT.
     Mở mã · vị trí · nhịp · điểm · tên việc · bước luân chuyển, để ba màn
     công việc dựng ra được thật — bảng bốn cột chạy, danh mục tích chọn
     được, KPI chấm được. Khoá phần `mo` (vì sao việc này trước), `xong`
     (đóng bằng bằng chứng gì) và `lienDoi`: đó mới là chỗ Học viện dạy
     người mới CÁCH LÀM VIỆC, và là thứ một đối thủ cần.

     Cùng cách đã dùng cho KICHBAN: khung thì mở, lời thì cắt. Vì sao
     phải mở khung: thiếu CV_MUC thì cả ba màn chỉ dựng ra một thẻ "chưa
     mở được" 1.4 nghìn ký tự, và người mở bản xem thử kết luận đúng như
     anh Quang đã kết luận — không nhìn thấy bảng đầu việc nào cả. */
  /* Mười bánh đà đi cả vào gói công khai: đây là hành trình mình MỜI
     người ta đi, nên người chưa đăng nhập cũng phải xem được. Giấu nó
     đi thì bản xem thử dựng ra một thẻ rỗng, và người mở nó kết luận
     là hệ thống chưa xong — đúng lỗi đã mắc ba lần trước. */
  BD_LON: G.BD_LON, BD_CAP: G.BD_CAP, BD_CHON: G.BD_CHON, BD_LUAT: G.BD_LUAT,
  /* Mùa đời cũng vào gói công khai: người chưa đăng nhập phải thấy được
     rằng ở đây mùa khó không bị chấm bằng thước của người đang khoẻ. Đó
     là một trong những lý do mạnh nhất để họ bước vào. */
  TT_CAMXUC: G.TT_CAMXUC, TT_MUA: G.TT_MUA, TT_MUA_LUAT: G.TT_MUA_LUAT,
  TT_CHIAKHOA: G.TT_CHIAKHOA, TT_BANGCHUNG: G.TT_BANGCHUNG, TT_VET: G.TT_VET,
  TT_LUAT: G.TT_LUAT, TT_CONGTHUC: G.TT_CONGTHUC,
  /* Bức tranh hành trình cũng vào gói công khai. Ba lần trước đã mắc
     đúng lỗi này: kho mới không có trong mau.json thì bản xem thử dựng
     ra một thẻ rỗng, và người mở nó kết luận là hệ thống chưa xong.
     HM_SAU thì KHÔNG vào đây — bản xem thử là bản công khai nhất trong
     tất cả, đưa bản ghi sau màn hình vào đó là mở nó cho cả thiên hạ. */
  HM_NGAY1: G.HM_NGAY1, HM_HOI3: G.HM_HOI3, HM_NGONTU: G.HM_NGONTU,
  HM_VUNG: G.HM_VUNG, HM_VUNG_LUAT: G.HM_VUNG_LUAT,
  HM_NGUY: goi.nen.HM_NGUY, HM_LEU: G.HM_LEU, HM_HEO: G.HM_HEO, HM_LUAT: G.HM_LUAT,
  /* Lời hứa và ngày hệ xong việc vào cả bản xem thử: người CHƯA đăng
     nhập cũng phải đọc được hai điều này, vì chúng là lý do mạnh nhất
     để bước vào — và là thứ để đòi nếu hệ phá lời. */
  DD_HUA: G.DD_HUA, GL_XONG: G.GL_XONG, GL_XONG_LUAT: G.GL_XONG_LUAT,
  TR_DEN: G.TR_DEN, TR_DEN_LUAT: G.TR_DEN_LUAT,
  BN_TRUC5: G.BN_TRUC5, BN_TRUC5_LUAT: G.BN_TRUC5_LUAT,
  PL_QUYEN: G.PL_QUYEN, PL_QUYEN_LUAT: G.PL_QUYEN_LUAT, PL_CO: G.PL_CO,
  /* Năm lằn ranh lúc chốt cũng vào bản xem thử, và đây là chỗ chúng
     CẦN nhất: người mở bản xem thử là người sắp gặp một buổi tư vấn.
     Đọc trước năm điều người tư vấn không được làm thì họ đi vào buổi
     ấy với một cái thước. Giấu tới sau chữ ký là giữ lại quyền phá. */
  TV_LANRANH: G.TV_LANRANH, TV_LANRANH_LUAT: G.TV_LANRANH_LUAT,
  /* Cả cuốn sổ tay của gia đình vào bản xem thử. Người mở bản xem thử
     là người đang cân nhắc bước vào, và ba mươi câu này chính là ba
     mươi câu họ đang hỏi trong đầu. */
  SG_DONGDAU: G.SG_DONGDAU, SG_TRANG24: G.SG_TRANG24, SG_MUCLUC: G.SG_MUCLUC,
  SG_LUAT: G.SG_LUAT, SG_KHAN: G.SG_KHAN, SG_KHAN_LUAT: G.SG_KHAN_LUAT,
  SG_CAM5: G.SG_CAM5, SG_CAM5_LUAT: G.SG_CAM5_LUAT, SG_KHONGVAY: G.SG_KHONGVAY,
  SG_QUYEN7: G.SG_QUYEN7, SG_QUYEN7_LUAT: G.SG_QUYEN7_LUAT,
  SG_HOI: G.SG_HOI, SG_TRONGSACH: G.SG_TRONGSACH,
  /* Năm câu để ngỏ vào cả bản xem thử: người mở bản xem thử là người
     đang cân nhắc có tin hay không, và một hệ dám khai chỗ mình chưa
     trả lời được là bằng chứng mạnh hơn mọi lời giới thiệu. */
  HN_NGO: G.HN_NGO, HN_NGO_LUAT: G.HN_NGO_LUAT,
  /* Con đường năm tầng vào cả bản xem thử: người đang cân nhắc bước
     vào cần thấy trước cả năm bậc và cả ngày thang này hết bậc. */
  /* Năm tầng Coach vào cả bản xem thử. Người mở bản xem thử là người
     sắp giao nhà mình cho một người kèm — bảng năng lực là câu hỏi họ
     cần cầm sẵn, y như năm lằn ranh ở TV_LANRANH. */
  HP_NGAY: (G.HP_TANG || []).map(t => {
    const so = String(t.ten || '').match(/\d+/);
    return { tang: t.tang, ten: t.ten, ngay: so ? Number(so[0]) : null };
  }),
  TIN_LOAI: G.TIN_LOAI, TIN_NGUON: G.TIN_NGUON, TIN_NGUON_LUAT: G.TIN_NGUON_LUAT,
  TIN_TIEUCHI: G.TIN_TIEUCHI, TIN_TIEUCHI_LUAT: G.TIN_TIEUCHI_LUAT,
  TIN_THUONG: G.TIN_THUONG, TIN_CAM: G.TIN_CAM, TIN_LUAT: G.TIN_LUAT,
  TG_MUC: G.TG_MUC, TG_VIEC: G.TG_VIEC,
  KBTV_CHUONG: G.KBTV_CHUONG, KBTV_KB: G.KBTV_KB, KBTV_CONG_PHI: G.KBTV_CONG_PHI,
  KBTV_VANPHONG: G.KBTV_VANPHONG, KBTV_DAODUC: G.KBTV_DAODUC, KBTV_BA_KHONG: G.KBTV_BA_KHONG,
  KBTV_BA_LUON: G.KBTV_BA_LUON, KBTV_LECH: G.KBTV_LECH, KBTV_LUAT: G.KBTV_LUAT, TV_LUAT: G.TV_LUAT,
  KB_MU: G.KB_MU, KB_MU_LUAT: G.KB_MU_LUAT, KB_GIONG: G.KB_GIONG,
  KB_PHATSINH: G.KB_PHATSINH, KB_PHATSINH_LUAT: G.KB_PHATSINH_LUAT,
  KB_VONG: G.KB_VONG, KB_KEY_NGUON: G.KB_KEY_NGUON, KB_LUAT: G.KB_LUAT, KB_MOI_TANG: G.KB_MOI_TANG, KB_CHOCHU: G.KB_CHOCHU, KB_NGHIEPVU: G.KB_NGHIEPVU, KB_NGHIEPVU_LUAT: G.KB_NGHIEPVU_LUAT,
  TL_TANG_TRUONG: G.TL_TANG_TRUONG, TL_TANG_LUAT: G.TL_TANG_LUAT,
  TL_VIEC_NHIP: G.TL_VIEC_NHIP, TL_VIEC_LUAT: G.TL_VIEC_LUAT, TL_VIEC_DAU: G.TL_VIEC_DAU,
  XK_VAI_MUC: G.XK_VAI_MUC, XK_VAI_MUC_LUAT: G.XK_VAI_MUC_LUAT, XK_DA_CHOT: G.XK_DA_CHOT,
  KB_DA_CHOT: G.KB_DA_CHOT, KB_TRAN_NHA: G.KB_TRAN_NHA,
  XK_TRAN: G.XK_TRAN, XK_MUC: G.XK_MUC, XK_CAM: G.XK_CAM, XK_LUAT: G.XK_LUAT,
  XK_GIAYPHEP: G.XK_GIAYPHEP, XK_CHOCHU: G.XK_CHOCHU,
  HH_KEM: G.HH_KEM, HH_BAC: G.HH_BAC, HH_BAC_LUAT: G.HH_BAC_LUAT, HH_KHONG_TIEN: G.HH_KHONG_TIEN,
  HH_CHUNGCU: G.HH_CHUNGCU, HH_LOAI_CC: G.HH_LOAI_CC, HH_CC_LUAT: G.HH_CC_LUAT,
  HH_CHOCHU: G.HH_CHOCHU, HH_DA_CHOT: G.HH_DA_CHOT,
  TIN_LOAI_LUAT: G.TIN_LOAI_LUAT, TIN_SO_LUAT: G.TIN_SO_LUAT, TIN_MAU: G.TIN_MAU, TIN_TANG_LUAT: G.TIN_TANG_LUAT,
  TIN_KEM_THUONG: G.TIN_KEM_THUONG, BK_LUAT: G.BK_LUAT,
  BK_DANHMUC: G.BK_DANHMUC, BK_DANHMUC_LUAT: G.BK_DANHMUC_LUAT,
  BC_LOI: G.BC_LOI, BC_TRONGSO: G.BC_TRONGSO, BC_TRONGSO_LUAT: G.BC_TRONGSO_LUAT,
  BC_MUNG: G.BC_MUNG, BC_MUNG_LUAT: G.BC_MUNG_LUAT, BC_LUAT: G.BC_LUAT,
  BC_VAI: G.BC_VAI, BC_VAI_LUAT: G.BC_VAI_LUAT,
  BC_VONG_LUAT: G.BC_VONG_LUAT, BC_NHIP_LUAT: G.BC_NHIP_LUAT, BC_CHOCHU: G.BC_CHOCHU,
  BC_NEP_LUAT: G.BC_NEP_LUAT, BC_KEM_LUAT: G.BC_KEM_LUAT,
  KA_LOAI: G.KA_LOAI, KA_TY: G.KA_TY, KA_CHO: G.KA_CHO,
  KA_LUAT: G.KA_LUAT, KA_ANTOAN: G.KA_ANTOAN,
  CS_LOI: G.CS_LOI, CS_TANG: G.CS_TANG, CS_TANG_LUAT: G.CS_TANG_LUAT,
  CS_NEN: G.CS_NEN, CS_LUAT: G.CS_LUAT,
  VZ_LOI: G.VZ_LOI, VZ_VUNG: G.VZ_VUNG, VZ_VUNG_LUAT: G.VZ_VUNG_LUAT,
  VZ_ROI: G.VZ_ROI, VZ_ROI_LUAT: G.VZ_ROI_LUAT, VZ_LUAT: G.VZ_LUAT,
  HT_DICH: G.HT_DICH, HT_TANG: G.HT_TANG, HT_TANG_LUAT: G.HT_TANG_LUAT,
  HT_SAUT5: G.HT_SAUT5, HT_KC: G.HT_KC, HT_NOI: G.HT_NOI,
  HT_NOI_LUAT: G.HT_NOI_LUAT, HT_LECH: G.HT_LECH, HT_LUAT: G.HT_LUAT,
  CV_MUC: (G.CV_MUC || []).map(rutDauViec),
  CV_MUC_DS: (G.CV_MUC_DS || []).map(rutDauViec),
  TEST750: (G.TEST750 || []).filter(b => b.tang === 'T1')
    .map(b => ({ ...b, mau: true, soCauThat: b.cau.length, cau: cauMau(b) }))
};
fs.writeFileSync(path.join(RA, 'mau.json'), JSON.stringify(mau));

console.log('\n  Tổng ' + Math.round(tong / 1024) + ' KB đã mã hoá · ' +
  Object.keys(khoa).length + ' gói · khoá ghi vào kho/khoa.json');
console.log('  Giữ nguyên ' + giu + ' khoá cũ' + (giu ? ' — giấy phép đã cấp vẫn dùng được.' : '.'));
console.log('  ⚠ kho/khoa.json và kho-goc/ đều nằm trong .gitignore — kiểm lại trước khi đẩy.');
