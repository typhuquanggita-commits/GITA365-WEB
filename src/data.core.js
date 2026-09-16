/* ═══════════════════════════════════════════════════════════════
   GITA 365 · v7.0 — LÕI DỮ LIỆU
   Kế thừa nguyên vẹn chuẩn phân quyền, năm tầng và mô thức G–I–T–A
   của hệ thống v6.9 (00_Config.gs), mở rộng cho giao diện Bản Đồ
   Gia Đình Thịnh Vượng.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {};
window.G = G;

/* Số bản KHÔNG chỉ để trưng. Nó là thứ duy nhất phân biệt hai tệp cùng
   nằm trong thư mục Tải về, và là thứ người dùng đọc để biết mình đang
   xem bản nào. Nên mỗi lần phát hành phải nhích số này — tên tệp bản
   giới thiệu cũng sinh ra từ đây (xem tools/dong-goi.py).

   v7.5 → v7.8 giữ nguyên qua ba lần phát hành có nội dung mới, nên anh
   Quang mở nhầm tệp cũ và tưởng phần sửa chưa chạy. Số bản đứng yên
   trong khi nội dung đổi là một cách nói dối không cố ý. */
G.META = {
  name: 'GITA 365',
  version: '9.99.123',
  tagline: 'Hệ Sinh Thái Gia Đình Thịnh Vượng',
  hotline: '08.5555.4688',
  site: 'truongnhatquang.com',
  soKichBan: 1000, soPhacDo: 220, soMoThuc: 42,
  builtOn: 'Nối tiếp hệ thống GITA 365 v6.9 — 1.000 kịch bản · 220 phác đồ · 25 mô thức · 5 tầng'
};

/* ══════════ 1. VAI TRÒ — lv càng nhỏ càng nhiều quyền ══════════ */
G.ROLES = [
  {id:'R01',lv:1, n:'Super Admin',         short:'Super Admin',portal:'admin', c:'#185AB4',
   ln:'Người giữ chìa khoá gốc của hệ sinh thái.'},
  {id:'R02',lv:2, n:'Admin hệ thống',      short:'Admin',      portal:'admin', c:'#185AB4',
   ln:'Kiến trúc sư vận hành — dựng chuẩn, mở đường, giữ lửa.'},
  {id:'R03',lv:3, n:'Giám đốc',            short:'Giám đốc',   portal:'admin', c:'#F61824',
   ln:'Người cầm tầm nhìn và chịu trách nhiệm tăng trưởng.'},
  {id:'R04',lv:4, n:'Quản lý chuyên môn',  short:'QLCM',       portal:'admin', c:'#F61824',
   ln:'Người giữ chuẩn nghề của toàn bộ đội ngũ dẫn dắt.'},
  {id:'R05',lv:5, n:'Trưởng nhóm Coach',   short:'TN Coach',   portal:'coach', c:'#5140B4',
   ln:'Người tạo ra Coach giỏi, không chỉ làm Coach giỏi.'},
  {id:'R06',lv:6, n:'Senior Coach',        short:'S.Coach',    portal:'coach', c:'#5140B4',
   ln:'Người gỡ được những nút thắt mà người khác chưa gỡ nổi.'},
  {id:'R07',lv:7, n:'Coach',               short:'Coach',      portal:'coach', c:'#5140B4',
   ln:'Người thắp lửa chuyển hoá cho từng gia đình.'},
  {id:'R08',lv:8, n:'Giáo viên',           short:'Giáo viên',  portal:'coach', c:'#0B6675',
   ln:'Người dạy đúng thứ học viên đang cần để đi tiếp.'},
  {id:'R09',lv:9, n:'Mentor',              short:'Mentor',     portal:'coach', c:'#0B6675',
   ln:'Người chạy tám việc băng nền dưới cả năm khoang.'},
  {id:'R10',lv:10,n:'Chuyên gia đánh giá', short:'Assessor',   portal:'coach', c:'#0B6675',
   ln:'Người trả lại sự thật bằng dữ liệu, không bằng cảm giác.'},
  {id:'R11',lv:11,n:'Chuyên gia tư vấn',   short:'Tư vấn',     portal:'tuvan', c:'#BE0E16',
   ln:'Người mở cánh cửa cho gia đình đang tìm đường.'},
  {id:'R12',lv:12,n:'Phân tích dữ liệu',   short:'Phân tích',  portal:'admin', c:'#185AB4',
   ln:'Người đọc ra mô thức trước khi nó thành vấn đề.'},
  {id:'R13',lv:13,n:'Phụ huynh',           short:'Phụ huynh',  portal:'ph',    c:'#0B7350',
   ln:'Chủ nhân thật sự của bản đồ gia đình thịnh vượng.'},
  {id:'R14',lv:14,n:'Học viên',            short:'Học viên',   portal:'hs',    c:'#185AB4',
   ln:'Người đang viết chương hay nhất của đời mình.'},
  {id:'R15',lv:15,n:'CTV giới thiệu',      short:'Đại sứ',     portal:'ctv',   c:'#BE0E16',
   ln:'Người mang ánh sáng này tới nhà tiếp theo.'}
];

/* Quyền → cấp bậc TỐI ĐA được dùng (nguồn sự thật từ v6.9) */
G.PERM = {
  sys_config:1, sys_delete_user:1, sys_restore:1, sys_manage_user:2, sys_audit:2, sys_fraud:3,
  /* TÀI CHÍNH — chỉ R01, R02, R03. Trước đây fin_create_order mở tới bậc 11
     nên Tư vấn tạo được đơn thu; nay đóng lại theo đúng luật anh Quang đặt:
     chỉ ba vị trí đầu nhìn thấy tiền, để đo lường và giám sát. */
  /* Xem tài chính mở tới Quản lý chuyên môn (R04) ở mức CHỈ ĐỌC — để
     đo lường và giám sát hiệu quả hoạt động. Việc động vào tiền (duyệt
     chi, bảng lương, tạo đơn thu) vẫn dừng ở R03. */
  fin_view:4, fin_payout:3, fin_payroll:3, fin_create_order:3,
  pro_approve:4, pro_report:4, pro_override:4, pro_assign:5, pro_coach:8, pro_assess:10,
  pro_view_all:4, pro_consult:11,
  /* Dòng T5-PRO dừng ở Senior Coach. Sổ tay nâng cao ghi người đọc:
     Coach cấp cao, Tư vấn Gia nghiệp, Giám đốc hệ. Coach thường cầm
     nhà tầng 2-3 không cần đọc kịch bản từ chối một gia đình của dòng
     ấy, và Giáo viên thì càng không — đọc một kịch bản nghề mà không
     có case để dùng chỉ tạo ra cảm giác biết. */
  pro_gia_nghiep:6,
  usr_self_data:15, usr_do_test:15, usr_referral:15,

  /* Ba vai cuối cùng bậc nhưng KHÁC việc. Nếu chỉ so bậc thì phụ huynh,
     học viên và cộng tác viên nhìn thấy y hệt nhau — đó là lỗi của v7.5.
     Bậc tách được phụ huynh khỏi học viên; phần còn lại do bảng phân
     quyền theo vai bên dưới quyết định. */
  kh_gia_dinh:13,     /* hồ sơ nhà, bảng số, nhịp sống — phụ huynh trở lên */
  kh_hanh_trinh:14,   /* hành trình của con, nhiệm vụ, bài test — học viên trở lên */
  kh_qua_tang:14,     /* kho quà mở theo tầng đã học */
  ctv_lien_ket:15,    /* mã liên kết và danh sách nhà mình giới thiệu */
  ctv_hoa_hong:15,    /* hoa hồng và số tài khoản nhận tiền */

  /* ══ BA TẦNG QUẢN TRỊ — nguồn của tỉ lệ hiển thị ══
     qt_trang   R01–R02  thư mục Quản trị trang: cấp quyền, mở, khoá, xoá tài khoản
     dh_toan_he R01–R04  điều hành toàn hệ và nhật ký
     nghe_chung R01–R12  toàn bộ kho nghề và công cụ dẫn dắt
     Ba mức này cộng với tài chính (R01–R03) tạo ra đúng bậc thang:
     100% · 95% · 91% · 90% — xem G.TAM_NHIN bên dưới. */
  qt_trang:2, dh_toan_he:4, nghe_chung:12,

  /* ══ THƯ VIỆN TÀI LIỆU ══
     Mọi vị trí đều được gửi tài liệu lên làm giàu kho chung — đó là
     cách kho lớn lên. Nhưng chỉ Super Admin và Admin hệ thống được
     kiểm duyệt, và chỉ tài liệu đã duyệt mới vào kho thật. */
  tl_gui:15,       /* gửi tài liệu lên — tất cả các vị trí */
  tl_xem_het:4,    /* xem toàn bộ tài liệu của mọi người */
  tl_duyet:2,      /* duyệt · yêu cầu chỉnh sửa · từ chối */

  /* ══ MINH CHỨNG NHIỆM VỤ ══
     Phụ huynh và học viên nộp ảnh, báo cáo hoặc tệp để xác nhận đã
     làm nhiệm vụ. Coach và giáo viên xác nhận. Khác thư viện: đây là
     bằng chứng của một nhà, không vào kho chung. */
  /* ══ GỬI TƯ LIỆU CHO GIA ĐÌNH ══
     Gia đình mở sẵn 30% kho. Phần còn lại KHÔNG tự mở ra: nó đi qua
     một người thật. Tư vấn và Coach đọc lời xin, nhìn KPI của nhà, rồi
     mới gửi — để tài liệu tới đúng nhà, đúng lúc, có người giải thích. */
  tl_gui_khach:11,

  /* ══ QUY TRÌNH XỬ LÝ CA ══
     Mở và đẩy ca: từ Tư vấn trở lên — chính họ ngồi với gia đình.
     Bảng đo lường toàn hệ: R01–R04, để soi chỗ nào đang tắc. */
  ca_xu_ly:11, ca_do_luong:4,

  /* Theo dõi mức dùng tài nguyên của đội ngũ — chỉ R01–R02.
     Một tài khoản chạm quá 20% kho thì Admin hệ thống nhận cảnh báo. */
  qt_tai_nguyen:2,
  mc_gui:15,       /* nộp minh chứng — tất cả, gồm phụ huynh và học viên */
  mc_duyet:8,      /* xác nhận minh chứng — giáo viên, Coach trở lên */
  /* Sửa chữ hiển thị trên toàn hệ thống — mặc định CHỈ Super Admin.
     Chữ trên màn hình là thứ hàng nghìn gia đình đọc, nên chỉ một
     người được đổi, và mọi lần đổi đều vào nhật ký. */
  sua_noi_dung:2,

  /* Xuất tài sản ra ngoài — chỉ người của GITA 365 từ cấp quản lý.
     Khách hàng (R13 phụ huynh, R14 học viên) và CTV (R15) KHÔNG có hai quyền này,
     nên không in được PDF và không đẩy được bảng tính lên Drive. */
  xuat_pdf:5, xuat_sheet:4
};

/* Tên tiếng Việt của từng quyền — bảng điều khiển phân quyền đọc từ đây. */
G.PERM_TEN = {
  sys_config:'Cấu hình hệ thống',        sys_delete_user:'Xoá tài khoản',
  sys_restore:'Khôi phục dữ liệu',       sys_manage_user:'Quản trị người dùng',
  sys_audit:'Nhật ký hệ thống',          sys_fraud:'Cảnh báo gian lận',
  fin_view:'Xem tài chính (chỉ đọc)',    fin_payout:'Duyệt chi',
  fin_payroll:'Bảng lương',              fin_create_order:'Tạo đơn thu',
  pro_approve:'Nghiệm thu chuyên môn',   pro_report:'Báo cáo toàn hệ',
  pro_override:'Vượt quyết định chuyên môn', pro_assign:'Phân công đội ngũ',
  pro_coach:'Công cụ Coach',             pro_assess:'Chấm đánh giá',
  pro_view_all:'Xem toàn bộ hồ sơ nhà',  pro_consult:'Công cụ tư vấn',
  pro_gia_nghiep:'Dòng gia nghiệp T5-PRO',
  usr_self_data:'Dữ liệu của chính mình',usr_do_test:'Làm bài test',
  usr_referral:'Giới thiệu người quen',
  kh_gia_dinh:'Hồ sơ và nhịp sống nhà mình', kh_hanh_trinh:'Hành trình của con',
  kh_qua_tang:'Kho quà theo tầng',
  ctv_lien_ket:'Mã liên kết cộng tác viên', ctv_hoa_hong:'Hoa hồng và tài khoản nhận tiền',
  qt_trang:'Quản trị trang — tài khoản và phân quyền',
  tl_gui:'Gửi tài liệu lên thư viện',
  tl_xem_het:'Xem toàn bộ tài liệu đã gửi',
  tl_duyet:'Kiểm duyệt tài liệu',
  tl_gui_khach:'Gửi tư liệu thêm cho gia đình',
  ca_xu_ly:'Mở và xử lý ca theo quy trình',
  ca_do_luong:'Bảng đo lường ca toàn hệ',
  qt_tai_nguyen:'Theo dõi tài nguyên của đội ngũ',
  mc_gui:'Nộp minh chứng nhiệm vụ',
  mc_duyet:'Xác nhận minh chứng',
  sua_noi_dung:'Sửa nội dung hiển thị',
  dh_toan_he:'Điều hành toàn hệ và nhật ký',
  nghe_chung:'Kho nghề và công cụ dẫn dắt',
  xuat_pdf:'Xuất bản in PDF',            xuat_sheet:'Đẩy Google Sheet về Drive'
};

/* Nhóm quyền — để bảng điều khiển xếp cột cho dễ đọc. */
G.PERM_NHOM = [
  {id:'sys', t:'HỆ THỐNG',   c:'#185AB4', ds:['sys_config','sys_delete_user','sys_restore','sys_manage_user','sys_audit','sys_fraud','qt_trang','sua_noi_dung','tl_duyet','tl_xem_het']},
  {id:'fin', t:'TÀI CHÍNH',  c:'#0B7350', ds:['fin_view','fin_payout','fin_payroll','fin_create_order']},
  {id:'pro', t:'CHUYÊN MÔN', c:'#5140B4', ds:['pro_approve','pro_report','pro_override','pro_assign','pro_coach','pro_assess','pro_view_all','pro_consult','pro_gia_nghiep','dh_toan_he','nghe_chung','mc_duyet']},
  {id:'kh',  t:'KHÁCH HÀNG', c:'#0B6675', ds:['usr_self_data','usr_do_test','usr_referral','kh_gia_dinh','kh_hanh_trinh','kh_qua_tang','tl_gui','mc_gui']},
  {id:'ctv', t:'CỘNG TÁC',   c:'#BE0E16', ds:['ctv_lien_ket','ctv_hoa_hong']},
  {id:'out', t:'XUẤT RA NGOÀI', c:'#F61824', ds:['xuat_pdf','xuat_sheet']}
];

/* ══════════ BẢNG PHÂN QUYỀN THEO VAI ══════════
   Bậc quyết định phần lớn. Bảng này ghi đè cho những chỗ bậc không nói được:
   cho  = cấp thêm quyền mà bậc chưa cho
   cam  = thu lại quyền mà bậc đã cho
   Super Admin và Admin hệ thống sửa bảng này ở màn hình "Bảng phân quyền".
   Mặc định dưới đây là điểm khởi đầu, không phải thứ bất biến. */
G.PHANQUYEN_GOC = {
  R13:{cho:[], cam:['ctv_lien_ket','ctv_hoa_hong']},
  R14:{cho:[], cam:['ctv_lien_ket','ctv_hoa_hong']},
  R15:{cho:['ctv_lien_ket','ctv_hoa_hong'], cam:['kh_gia_dinh','kh_hanh_trinh','kh_qua_tang','usr_self_data']}
};

/* ══════════ TẦNG HIỂN THỊ — nguồn sự thật của "ai thấy gì" ══════════
   Trước v7.6 mỗi màn hình tự mang một quyền, gắn rời rạc, nên không ai
   trả lời được câu "vị trí này thấy bao nhiêu phần trăm hệ thống".
   Nay mọi màn hình thuộc đúng MỘT tầng hiển thị, và tầng quyết định quyền.
   Muốn đổi phạm vi một màn thì đổi tầng của nó ở đây, không sửa rải rác. */
G.TANG_HIENTHI = [
  {id:'chung',    perm:null,           t:'Chung cho mọi tài khoản',
   mo:'Ai đăng nhập cũng thấy — bản đồ, lộ trình, ranh giới, hệ sinh thái.'},
  {id:'nha',      perm:'kh_gia_dinh',  t:'Hồ sơ và nhịp sống nhà mình',
   mo:'Phụ huynh trở lên. Học viên và cộng tác viên không thấy hồ sơ nhà.'},
  {id:'con',      perm:'kh_hanh_trinh',t:'Hành trình của con',
   mo:'Học viên trở lên. Cộng tác viên không thấy.'},
  {id:'qua',      perm:'kh_qua_tang',  t:'Kho quà theo tầng',
   mo:'Mở dần theo tầng gia đình đã học.'},
  {id:'ctv',      perm:'ctv_hoa_hong', t:'Phần cộng tác viên',
   mo:'Cộng tác viên và đội ngũ GITA. Phụ huynh, học viên không thấy.'},
  {id:'nghe',     perm:'nghe_chung',   t:'Kho nghề và công cụ dẫn dắt',
   mo:'R01–R12. Toàn bộ khách hàng và cộng tác viên đều không thấy.'},
  {id:'dieuhanh', perm:'dh_toan_he',   t:'Điều hành toàn hệ',
   mo:'R01–R04. Trung tâm điều hành và nhật ký hệ thống.'},
  {id:'taichinh', perm:'fin_view',     t:'Tài chính',
   mo:'CHỈ R01–R03, để đo lường, giám sát và thúc đẩy hiệu quả hoạt động.'},
  {id:'quantri',  perm:'qt_trang',     t:'Quản trị trang',
   mo:'CHỈ R01–R02. Cấp quyền, mở, khoá và xoá tài khoản.'}
];

/* Tỉ lệ hiển thị mong muốn theo vị trí — bộ kiểm phát hành đối chiếu
   với số đếm thật, lệch quá biên là dừng phát hành. */
/* ══════════ CÔNG TẮC "MỞ HẾT" — CHỈ CẤP QUẢN TRỊ ══════════

   Giao diện cắt bớt để dễ đọc: danh sách hiện mười mục đầu, tóm tắt cắt
   ở một trăm hai mươi ký tự. Với người dùng thường thì đúng — màn hình
   dài quá thì không ai đọc.

   Nhưng chủ hệ thống cần nhìn A đến Z: không phải để dùng hằng ngày, mà
   để RÀ. Không thấy hết thì không rà được, và một chỗ hỏng nằm ở mục
   thứ mười một sẽ không bao giờ bị phát hiện.

   Nên cắt bớt thành một công tắc thay vì một luật cứng. Tắt là giao diện
   như cũ; bật là mọi danh sách và mọi đoạn chữ hiện đủ. Chỉ vai có quyền
   qt_trang bật được — Super Admin và Admin hệ thống.

   Trạng thái ghi vào máy đang dùng, không đi theo tài khoản: đây là thói
   quen đọc của một người trên một máy, không phải quyền của một vai. */
G.MO_HET = false;

G.moHetDuoc = function(){ return !!(G.can && G.can('qt_trang')); };

G.moHetBat = function(){ return !!(G.MO_HET && G.moHetDuoc()); };

/* Danh sách: trả đủ khi đang mở hết, ngược lại cắt như cũ. */
G.dsHet = function(ds, n){
  var a = ds || [];
  return G.moHetBat() ? a : a.slice(0, n);
};

/* Đoạn chữ: trả đủ khi đang mở hết; ngược lại cắt và tự thêm dấu ba
   chấm — nên chỗ gọi KHÔNG nối thêm '…' nữa, nếu không bản đầy đủ cũng
   bị treo một dấu ba chấm vô nghĩa ở cuối. */
G.chuHet = function(s, n){
  var t = String(s == null ? '' : s);
  if(G.moHetBat() || t.length <= n) return t;
  return t.slice(0, n) + '…';
};

G.moHetDoi = function(){
  if(!G.moHetDuoc()) return;
  G.MO_HET = !G.MO_HET;
  try { localStorage.setItem('gita_mo_het', G.MO_HET ? '1' : '0'); } catch(e){}
  if(G.U && G.U.toast)
    G.U.toast(G.MO_HET
      ? 'Đã mở hết — mọi danh sách và mọi đoạn chữ hiện đủ, không cắt bớt.'
      : 'Đã tắt mở hết — giao diện trở lại bản gọn.', 'ok');
  if(G.render) G.render();
};

try { G.MO_HET = localStorage.getItem('gita_mo_het') === '1'; } catch(e){}

G.TAM_NHIN = [
  {vai:['R01','R02'], pt:100,
   ghi:'Toàn bộ, không khoá gì. Super Admin và Admin hệ thống thấy mọi thứ.'},
  /* 80 chứ không phải 82. Ba màn mới ở đợt v8.x — Bốn tuyến chuyên môn,
     Quy trình toàn Web App, Kiểm thử theo vai — đều CHỈ mở cho R01–R02.
     Tử số của R03 đứng yên mà mẫu số tăng ba, nên tỉ lệ tụt.

     Đây là lúc phải sửa SỐ CÔNG BỐ, không sửa cách đếm: phần khoá của
     R03 không hề bị nới thêm một màn nào, chỉ có phần quản trị dày lên.
     Giữ 82 cho đẹp thì bài kiểm hoặc đỏ oan, hoặc phải nới dung sai —
     mà nới dung sai là mất tác dụng canh.

     Điều KHÔNG đổi và mới là thứ đáng canh: bậc thang không được đảo
     ngược, và R01–R02 phải thấy 100%. Hai phép ấy không phụ thuộc mẫu
     số nên không trôi theo mỗi lần thêm màn — xem mục ma trận màn × vai
     trong bộ kiểm. */
  /* 82 chứ không còn 80. Bốn màn mới ở 9.19–9.22 đều mở cho MỌI vai,
     nên tử số của R03–R04 tăng bốn trong khi mẫu số cũng tăng bốn —
     tử số tăng nhanh hơn nên tỉ lệ nhích. Sửa số công bố, không nới
     dung sai: phần quản trị khoá của hai vị trí này không mở thêm gì. */
  /* ── ĐỢT SỬA SỐ CÔNG BỐ THỨ BẢY, Ở BẢN 9.67 ──
     Sáu vị trí lệch CÙNG LÚC, và đó là dấu hiệu khác hẳn sáu lần
     trước: không phải một màn mới đẩy một con số ra khỏi dung sai,
     mà là drift TÍCH LẠI qua bốn bản 9.64–9.67 rồi cả sáu cùng
     vượt ±2 trong một lần thêm màn.

     R03·R04 82→84 và R07·R08 78→80 nhích LÊN: màn ký kết khoá ở
     pro_coach nên bốn vị trí này thấy nó, tử số tăng nhanh hơn mẫu.
     R13 39→37 và R14 35→33 tụt XUỐNG: phụ huynh và học viên không
     thấy màn ấy, tử số đứng yên mà mẫu số tăng.

     Phép thử vẫn không đổi qua cả bảy lần: phần KHOÁ của bốn vị trí
     kia có mở thêm màn quản trị nào không. Không — thứ dày lên là
     phần nghề và phần pháp lý nội bộ, mà nhà mình vốn không vào.

     Ghi lại một điều đáng canh về sau: khi SÁU con số cùng lệch một
     lượt thì phải hỏi lại xem có phải cách đếm hỏng không, chứ đừng
     sửa sáu số cho xong. Lần này đã kiểm: mẫu số tăng đúng một màn,
     bốn vị trí có quyền thì tử số cũng tăng một, hai vị trí không có
     quyền thì tử số đứng yên. Cách đếm còn đúng. */
/* ═══ 9.99.64 · ĐO LẠI CẢ BẢNG ĐÍCH MỘT LƯỢT ═══

   Mười con số cùng lệch ở bản này. Chú giải của chính bảng này đã dặn:
   khi nhiều số cùng lệch một lượt thì HỎI LẠI XEM CÁCH ĐẾM CÓ HỎNG
   KHÔNG, đừng sửa từng số cho xong. Đã hỏi, và đã đo:

     · mẫu số 183 → 186, đúng ba màn mới (Bộ não · Vùng Mạnh · Coach)
     · vai CÓ nghe_chung: tử số tăng đúng 3 — R03 151→154, R09 127→130
     · vai KHÔNG có: tử số đứng yên — R13 65, R14 58, R15 53

   Cách đếm còn đúng. Và phép đo nói thêm một điều: bảng đích đã lệch
   TỪ TRƯỚC ba màn ấy — R03 đo được 82,5 khi đích ghi 84, R13 đo được
   35,5 khi đích ghi 37. Ba màn mới chỉ đẩy đúng R13 vượt khỏi dung sai
   ±2; chín số kia lệch sẵn 1,2 và nằm im trong dung sai.

   Nên sửa CẢ MƯỜI về số đo được, không sửa mỗi số vừa kêu. Sửa mỗi số
   vừa kêu là để chín số kia nằm sát mép, và lần thêm màn sau chúng
   cùng vỡ một lượt — đúng cái đã xảy ra ở 9.64–9.67 và được ghi ngay
   phía trên. Dung sai ±2 giữ nguyên: nới dung sai là bỏ hẳn phép canh.

   Phép thử vẫn không đổi qua tám lần: phần KHOÁ của khách hàng có mở
   thêm màn nghề nào không. Không — cả ba màn mới đều khoá ở nghe_chung,
   và R13 · R14 · R15 không thấy màn nào trong ba. */
  /* ═══ 9.99.96 · ĐO LẠI CẢ BẢNG MỘT LƯỢT (lần thứ hai, sau 9.99.64) ═══
     Màn "Vòng tự hoàn thiện" (nghe_chung) đẩy mẫu số 200→201. Chỉ R13
     vượt dung sai (35→32,8), nhưng chú giải bảng này đã dặn: sửa mỗi số
     vừa kêu là để những số kia nằm sát mép rồi cùng vỡ một lượt về sau.
     Nên đo lại cả bảng và đặt mỗi số về ĐÚNG GIỮA dung sai:
       R03/R04 83,6 · R05/R06 78,6 · R07/R08 78,1 · R09–R11 70,1 ·
       R12 61,7 · R13 32,8 · R14 29,4 · R15 26,9.
     Đã kiểm cách đếm: vai CÓ nghe_chung tử số tăng đúng 1; R13·R14·R15
     không có nên tử số đứng yên. Cách đếm còn đúng; dung sai ±2 giữ nguyên. */
  {vai:['R03','R04'], pt:84,
   ghi:'Khoá đúng phần quản trị của R01–R02: quản trị tài khoản, phân quyền, bảo mật, nhật ký, kiểm duyệt.'},
  /* Tách làm hai dòng: bảy vị trí này trước nay gộp một con số, nhưng
     chúng KHÔNG thấy như nhau — R09–R11 kém hơn ba màn. Gộp lại thì phải
     nới dung sai để cả bảy cùng lọt, mà nới dung sai là mất tác dụng canh.
     Ghi hai con số thật thì canh được chặt hơn. */
  /* 77 và 75 chứ không còn 75 và 73. Bốn màn mới ở bản 9.15 — hai màn
     lời hứa mở cho mọi vai, hai màn nghề mở tới nghe_chung — nên cả
     bảy vị trí này thấy thêm bốn màn trong khi mẫu số cũng tăng bốn.
     Tử số tăng nhanh hơn mẫu số nên tỉ lệ nhích lên.

     Lại là lúc sửa SỐ CÔNG BỐ chứ không nới dung sai: phần khoá của
     bảy vị trí này không hề mở thêm một màn quản trị nào. Giữ số cũ
     thì bài kiểm đỏ ở chỗ không có lỗi, và bộ kiểm đỏ oan vài lần là
     bộ kiểm bị tắt. */
  /* Tách R05–R06 khỏi R07–R08 ở bản 9.55, và làm đúng việc ba lần trước
     đã làm: sửa SỐ CÔNG BỐ, không nới dung sai.

     Màn dòng T5-PRO khoá ở pro_gia_nghiep, dừng đúng Senior Coach — nên
     R05 và R06 thấy nó, R07 và R08 thì không. Bốn vị trí này không còn
     thấy như nhau, và gộp một con số thì phải nới dung sai để cả bốn
     cùng lọt. Ghi hai con số thật thì canh được chặt hơn.

     Phép thử vẫn là phép thử cũ: phần KHOÁ của bốn vị trí này có mở
     thêm màn quản trị nào không. Không — không một màn tài chính, quản
     trị hay điều hành nào mở thêm. Phần dày lên là phần NGHỀ, và nghề
     thì họ vốn được thấy. Nên tỉ lệ nhích lên là con số thật đổi, không
     phải hàng rào bị nới. */
  {vai:['R05','R06'], pt:79,
   ghi:'Khoá phần quản trị hệ thống, thêm tài chính và điều hành toàn hệ.'},
  {vai:['R07','R08'], pt:78,
   ghi:'Như R05–R06, và không mở màn của dòng gia nghiệp T5-PRO.'},
  /* 73 chứ không còn 75. Hai màn mới ở 9.65 — Hành lang thành công và
     Rà soát lỗi hệ thống — khoá ở pro_coach, tức dừng đúng R08. Tử số
     của ba vị trí này đứng yên mà mẫu số tăng hai, nên tỉ lệ tụt.

     Lần thứ năm làm đúng một việc: sửa SỐ CÔNG BỐ, không nới dung sai.
     Phép thử vẫn thế — phần KHOÁ của ba vị trí này có mở thêm màn quản
     trị nào không. Không. Hai màn ấy nêu tên hàm, tên kho và chỗ hệ còn
     hở; đó là bản đồ chỗ yếu, nên nó ở lại trong tay người điều phối. */
  /* 73 → 71 ở bản 9.68. Sổ tay Super Admin khoá qt_trang, dừng ở R02,
     nên ba vị trí này không thấy nó: mẫu số tăng một, tử số đứng yên.

     Con số cũ vốn đã sát mép — 125/176 là 71,0%, chỉ trong dung sai
     ±2 đúng 0,02 điểm. Thêm một màn là rơi ra. Ghi lại để lần sau
     nhìn thấy: một con số sát mép thì lần đổi kế tiếp chắc chắn phải
     sửa, và sửa sớm rẻ hơn để bộ kiểm đỏ rồi mới sửa. */
  {vai:['R09','R10','R11'], pt:70,
   ghi:'Như trên, và không mở ba màn thuộc phạm vi quản lý chuyên môn.'},
  /* R12 tách ra một dòng riêng, và con số thấp hơn là ĐÚNG chứ không phải
     thiệt thòi. Phân tích dữ liệu đọc được toàn bộ kho nghề và mọi màn số
     liệu tổng hợp, nhưng KHÔNG mở những màn chứa hồ sơ của một nhà cụ thể
     và những buồng lái thao tác với gia đình: hồ sơ VIP, tài liệu gia đình
     gửi lên, khoang mở cửa của Tư vấn, rà soát từng nhà.
     Trước đây trình đơn của R12 vẫn hiện những mục ấy rồi bấm vào chỉ ra
     một thẻ khoá — mười bốn mục chết. Nay ẩn đi, và con số tụt từ 75%
     xuống đúng mức thật. Ít mục hơn nhưng không mục nào chết. */
  /* 66 → 64 ở bản 9.63, và lại là đúng phép thử cũ: sửa SỐ CÔNG BỐ,
     không nới dung sai.

     Hai màn mới — chuẩn ngôn ngữ và phễu chốt — khoá ở pro_coach và
     pro_consult, tức R12 KHÔNG được thêm gì. Mẫu số tăng hai, tử số
     đứng yên, nên tỉ lệ tụt. Phần KHOÁ của R12 không mở thêm một màn
     nào; nó chỉ thêm hai màn mà R12 vốn không được vào.

     Đây là lần thứ tư làm phép này, và phép thử vẫn không đổi: phần
     khoá có mở thêm không. Không thì sửa số công bố. Có thì đỏ, và đỏ
     ấy là đỏ thật. */
  /* 64 → 62 ở bản 9.66, cùng phép thử ấy lần thứ sáu. Ba màn pháp lý
     mới đều khoá pro_coach, dừng ở R08 — R12 không được thêm gì mà
     mẫu số tăng ba. Phần KHOÁ của R12 không mở thêm một màn nào.

     Chỗ đáng nói: ba màn ấy nêu tên hàm và chỗ hệ còn hở TRƯỚC PHÁP
     LUẬT. Người phân tích dữ liệu đọc được bản đồ ấy thì đọc luôn
     danh sách chỗ tấn công — nên khoá ở pro_coach là cố ý, không
     phải sót. */
  {vai:['R12'], pt:62,
   ghi:'Toàn bộ kho nghề và màn số liệu tổng hợp · không mở hồ sơ từng nhà và buồng lái thao tác'},
  /* ═══ Ba tỉ lệ dưới: nói cho rõ kẻo lẫn với trần 30% ═══
     Đây là tỉ lệ SỐ MÀN HÌNH mở được, không phải tỉ lệ NỘI DUNG. Hai thứ
     khác hẳn nhau, và trần 30% anh Quang đặt là trần nội dung:

       · Trần nội dung  G.TRAN_KHACH = 0,30 trong src/kho-khach.js — mỗi kho
         tư liệu chỉ mở sẵn 30% cho gia đình, phần còn lại do Tư vấn và Coach
         gửi thêm khi đạt KPI 80%. Trần này KHÔNG đổi.
       · Tỉ lệ dưới đây chỉ đếm xem vai ấy bấm vào được bao nhiêu mục trong
         trình đơn.

     Con số nhích lên qua các đợt vì những màn mới đều là thứ gia đình,
     học viên và cộng tác viên PHẢI thấy mới đi được: vòng nhắc Đúng–Đủ–Sâu,
     hành trình 12 chặng, kho tổng, bản đồ cá nhân 11 ô, kho chuyện của
     chính cấp mình, sổ nhật ký và cuộc thi viết. Thêm một màn như thế
     không mở thêm một dòng tư liệu nghề nào. Ghi con số thật ở đây, và
     giữ nguyên trần nội dung ở chỗ của nó. */
  /* 39 chứ không còn 37. Ba màn mới ở 9.19–9.21 — sổ tay của gia đình,
     năm câu hệ chưa trả lời được, con đường năm tầng — đều mở cho mọi
     vai. Sửa SỐ CÔNG BỐ, không nới dung sai: phần khoá của phụ huynh
     không mở thêm một màn nghề nào. */
  {vai:['R13'], pt:33, ghi:'Nhà mình, hành trình của con, gửi tài liệu và minh chứng, vòng nhắc, bản đồ cá nhân, sổ nhật ký, chuyện và thi viết, giới thiệu Học viện, đọc hoặc nghe'},
  /* 35 chứ không còn 33 — cùng lý do với R03–R04 và R13. */
  {vai:['R14'], pt:29, ghi:'Chặng đường của em, nhiệm vụ, minh chứng, vòng nhắc, bản đồ cá nhân, sổ nhật ký, chuyện và thi viết, và màn xem em đã đổi gì so với tuần trước'},
  /* 31 chứ không còn 29. Hai màn mới ở 9.19 và 9.20 — sổ tay của gia
     đình, và năm câu hệ chưa trả lời được — đều mở cho MỌI vai, nên
     R15 thấy thêm hai màn trong khi mẫu số cũng tăng hai. Tử số tăng
     nhanh hơn mẫu số nên tỉ lệ nhích lên.

     Lại là lúc sửa SỐ CÔNG BỐ chứ không nới dung sai: phần khoá của
     cộng tác viên không mở thêm một màn nghề nào. Cả hai màn mới đều
     là thứ hệ TỰ KHAI về chính mình — lời hứa với gia đình, và chỗ
     hệ còn đang nợ. Giấu hai thứ ấy khỏi ai thì mới là chuyện lạ. */
  /* 33 chứ không còn 31. Bàn cờ hành trình và bảng tin cộng đồng ở 9.32–9.33
     mở cho MỌI vai, nên tử số của R15 tăng hai trong khi mẫu số cũng tăng
     hai — với một mẫu số nhỏ như của Đại sứ thì tỉ lệ nhích rõ hơn hẳn các
     vị trí khác. Sửa số công bố, không nới dung sai: phần khoá của R15
     không mở thêm một màn nghề nào.

     Và nói lại cho khỏi lẫn: 33% ở đây là tỉ lệ SỐ MÀN, không phải tỉ lệ
     NỘI DUNG. Trần 30% anh Quang đặt là trần nội dung, canh ở
     G.TRAN_KHACH trong src/kho-khach.js — hai thứ khác hẳn nhau, và hai
     màn vừa thêm không mang theo bản ghi nghề nào. */
  /* 31 chứ không còn 33 — cùng một lý do với R09–R11 ở 9.65: mẫu số
     tăng hai màn nghề mà cộng tác viên vốn không thấy. */
  /* ── ĐỢT SỬA SỐ CÔNG BỐ Ở BẢN 9.99.43 · 29 chứ không còn 31 ──
     Màn Biên soạn nội dung khoá ở qt_trang, nên phần KHOÁ của cộng tác
     viên không mở thêm một màn nào; chỉ mẫu số tăng một. Với mẫu số nhỏ
     như của Đại sứ thì một màn đủ đẩy tỉ lệ ra ngoài dung sai hai điểm.

     Đây đúng là phép thử mà sổ tay vận hành đã ghi sẵn: câu hỏi không
     phải "tỉ lệ có tụt không" mà là "phần KHOÁ có mở thêm màn nào
     không". Không mở, nên sửa SỐ CÔNG BỐ — và KHÔNG nới dung sai. Nới
     dung sai để bộ kiểm xanh là tắt đúng cái đèn vừa báo đúng. */
  {vai:['R15'], pt:27, ghi:'Phần giới thiệu, hoa hồng, gửi tài liệu, vòng nhắc, bản đồ cá nhân, sổ nhật ký, chuyện và thi viết, bàn cờ hành trình, bảng tin cộng đồng, và màn xem mình đã đổi gì so với tuần trước'}
];

/* Sáu chân dung người dùng — lời mời bước vào, hiển thị ở Cổng vào */
/* Cộng tác viên đổ vào "Bắt đầu ở đây" như phụ huynh và học viên, thay
   vì vào màn Đại sứ. Lý do: G.VIEWS['bat-dau'] trước v9.2 chỉ có nhánh
   cho ph · hs · coach · tuvan · admin — không có nhánh ctv, nên cộng
   tác viên rơi vào nhánh dự phòng và nhận NĂM BƯỚC CỦA PHỤ HUYNH: viết
   bảng tầm nhìn của nhà mình, chốt bảng chín vai trong nhà. Nay có
   nhánh riêng, nên cổng này trỏ vào đó. */
G.PORTALS = {
  admin:{n:'Trung Tâm Điều Hành', ic:'shield', c:'#185AB4', home:'dieu-hanh',
    say:'Anh nhìn thấy toàn bộ trường năng lượng: từng gia đình đang ở đâu, đội ngũ đang giữ lửa thế nào, kho báu vật đang được dùng ra sao.'},
  coach:{n:'Buồng Lái Của Coach', ic:'flame', c:'#5140B4', home:'coach-deck',
    say:'Mỗi buổi anh chị bước vào là một gia đình đổi hướng. Đây là nơi anh chị thấy rõ nên chạm vào đâu trước.'},
  tuvan:{n:'Khoang Mở Cửa', ic:'compass', c:'#BE0E16', home:'tuvan-deck',
    say:'Người đối diện chưa cần nghe anh chị giỏi thế nào. Họ cần thấy nhà mình trong tấm bản đồ này.'},
  /* home GIỮ 'bat-dau' — mục 42 chốt: người mới đăng nhập đổ thẳng vào
     chuỗi năm bước onboarding, KHÔNG vào một màn tổng quan. Ngôi nhà là
     hub điều hướng sau onboarding: đứng đầu NAV và ô đầu thanh dưới, một
     chạm là tới, nhưng không cướp màn đăng nhập đầu tiên. */
  ph:{n:'Bản Đồ Nhà Mình', ic:'home', c:'#0B7350', home:'bat-dau',
    say:'Đây là bản đồ của chính gia đình anh chị. Không ai viết hộ. Hệ thống chỉ giữ chuẩn và soi đường.'},
  hs:{n:'Hành Trình Của Con', ic:'star', c:'#185AB4', home:'bat-dau',
    say:'Đây là hành trình của em. Mỗi ngày em đi thêm một bước, bản đồ này sáng thêm một chỗ.'},
  ctv:{n:'Vệ Tinh Lan Toả', ic:'share', c:'#BE0E16', home:'bat-dau',
    say:'Câu chuyện thật của anh chị là thứ mở được cánh cửa mà không quảng cáo nào mở nổi.'}
};

/* ══════════ 1b. BỐN CHỖ HAY TỚI NHẤT — THANH DƯỚI TRÊN ĐIỆN THOẠI ══════════

   Chỉ có nghĩa trên điện thoại: cả menu nằm sau nút ba gạch ở góc trên
   bên trái, mà đó là góc xa ngón cái nhất khi cầm máy một tay.

   Vì sao phải khai tay chỗ này, trong khi cả kho theo luật "đừng dựng
   bản thứ hai của một danh sách": bản đầu tôi lấy bốn mục ĐẦU TIÊN mà
   vai mở được trong G.NAV, đúng theo thứ tự cột trái. Chạy thì đúng,
   nhưng đo ra thì cả sáu vai đều có chung ba ô — "Đã đổi gì · KPI ·
   GITA là gì" — vì nhóm đầu của G.NAV là nhóm GIỚI THIỆU.

   Tức là thứ tự trong G.NAV là thứ tự ĐỌC, không phải thứ tự HAY DÙNG.
   Hai thứ ấy khác nhau, và không có sẵn chỗ nào trong kho nói cái thứ
   hai. Nên nó phải được khai, và khai ở đây.

   Khai SAI cũng không vỡ: `them()` bỏ qua màn nào vai không mở được,
   rồi thứ tự G.NAV lấp nốt chỗ trống. Nên đây là lời gợi ý, không phải
   một lời hứa mã phải giữ. */
G.DUOI = {
  ph:    ['ngoi-nha', 'hom-nay', 'tien-bo', 'tro-ly'],
  hs:    ['ngoi-nha', 'nhiem-vu', 'tien-bo', 'tro-ly'],
  coach: ['coach-deck', 'bang-viec', 'tien-bo', 'tro-ly'],
  tuvan: ['tuvan-deck', 'bang-viec', 'tien-bo', 'tro-ly'],
  admin: ['dieu-hanh', 'bang-viec', 'kpi-toi', 'tro-ly'],
  ctv:   ['bat-dau', 'bang-viec', 'tien-rung', 'tro-ly']
};

/* ══════════ 2. NĂM TẦNG ══════════ */
G.TIERS = [
  {id:1,code:'T1',name:'NHẬN DIỆN',q:'Đang có vấn đề gì?',days:7,c:'#185AB4',
   goal:'Lập baseline trung thực, phát hiện mô thức, hình thành 1–3 giả thuyết G–I–T–A.',
   note:'Tầng 1 KHÔNG chữa vấn đề. Chỉ quan sát, ghi dữ liệu, tìm mô thức.',
   feel:'Lần đầu cả nhà nhìn thấy sự thật mà không cãi nhau.'},
  {id:2,code:'T2',name:'GIẢI MÃ',q:'Vì sao vấn đề xảy ra?',days:21,c:'#5140B4',
   goal:'Kiểm chứng giả thuyết qua 3 vòng 7 ngày, chốt cơ chế ưu tiên.',
   note:'Mỗi vòng chỉ thay ít biến, ghi bằng chứng ủng hộ và phản bác.',
   feel:'Hết đổ lỗi. Bắt đầu hiểu cơ chế.'},
  {id:3,code:'T3',name:'KIẾN TẠO',q:'Cần làm gì và làm thế nào?',days:90,c:'#0B6675',
   goal:'4 chuỗi 21 ngày: có cấu trúc → tự điều hành → thích ứng → chuyển giao.',
   note:'Mỗi cấp có PDCA và cổng nghiệm thu.',
   feel:'Nhà mình có một hệ thống chạy được, do chính mình dựng.'},
  {id:4,code:'T4',name:'CHUYỂN HÓA',q:'Làm sao duy trì thay đổi thành năng lực?',days:365,c:'#0B7350',
   goal:'4 chu kỳ 90 ngày: năng lực nền → ổn định → thích ứng → chuyển giao.',
   note:'Tăng dần độ khó, giảm dần hỗ trợ Coach.',
   feel:'Quyền điều hành việc học đã nằm trong tay con.'},
  {id:5,code:'T5',name:'BỨT PHÁ',q:'Gia đình có thể phát triển tới đâu?',days:365,c:'#BE0E16',
   goal:'Đồng bộ học viên – phụ huynh – gia đình. Từ tự quản sang tạo giá trị.',
   note:'Coach đồng hành cả gia đình. Đích: hệ thống tự vận hành sau 365 ngày.',
   feel:'Một gia đình vận hành được mà không cần ai canh.'}
];

/* ══════════ 3. MÔ THỨC G–I–T–A ══════════ */
/* ══════════ MÔ THỨC HUẤN LUYỆN GITA — BỐN TRỤ ══════════

   BẢN CHUẨN, chép từ định nghĩa của chủ Học viện. Đây là tài sản trí tuệ
   gốc của GITA; mọi màn hình đọc bốn trụ đều đọc từ đây, không nơi nào
   được viết lại một bản khác.

   `inc` là danh sách thành tố của trụ — nó dài có chủ ý. Rút gọn cho gọn
   giao diện là làm mất chính thứ phân biệt mô thức này với bốn chữ cái
   viết tắt của nơi khác. Màn hình nào chật thì cắt ở màn hình, không cắt
   ở kho.                                                                */
G.GITA = [
  {k:'G',name:'Goal — Hệ thống mục tiêu',short:'Mục tiêu',c:'#185AB4',
   desc:'Học viên có hệ thống mục tiêu rõ, hướng tới kết quả xuất sắc, và đó có phải đích đến của chính quá trình học tập rèn luyện của em không?',
   probe:'Con muốn điều gì? Điều đó là của con hay của người lớn? Đạt được thì khác đi thế nào?',
   inc:['Hệ thống mục tiêu','Kết quả xuất sắc','Đích đến của quá trình học tập rèn luyện',
        'Kỳ tích','Nguyện vọng','Thành quả']},

  {k:'I',name:'Inspirits — Nội lực',short:'Nội lực',c:'#5140B4',
   desc:'Động lực, khát khao và niềm tin bên trong có đủ để em theo đuổi mục tiêu tới cùng, kể cả khi khó?',
   probe:'Điều gì khiến con muốn làm? Con tin mình làm được tới đâu? Khi thất bại con nghĩ gì?',
   inc:['Động lực','Khát khao','Đam mê','Mong muốn','Nội lực','Sự khác biệt',
        'Niềm tin','Bản lĩnh theo đuổi mục tiêu']},

  {k:'T',name:'Talent — Hệ thống tài năng',short:'Năng lực',c:'#0B7350',
   desc:'Em có tài năng, điểm mạnh và tư duy xuất sắc để làm được không — và em có nhanh, có tập trung, có hướng đi rõ không?',
   probe:'Con biết cách làm chưa? Con mạnh nhất ở đâu? Cách làm nào đã hiệu quả với con?',
   inc:['Tài năng','Điểm mạnh','Sở trường','Tư duy xuất sắc','Sự khác biệt',
        'Tốc độ','Tập trung','Khả năng vượt trội','Định hướng xuất sắc']},

  {k:'A',name:'Action & Academy — Hành động và hệ sinh thái',short:'Hành động & Môi trường',c:'#BE0E16',
   desc:'Em có hành động quyết đoán, kiên trì và tối ưu không — và môi trường quanh em có nâng đỡ hành động ấy không?',
   probe:'Ai quanh con? Không gian và nhịp sống thế nào? Con đang dùng hệ thống nào để vận hành?',
   inc:['Hành động quyết đoán','Kiên trì','Sáng tạo','Chăm chỉ','Cẩn thận','Tối ưu',
        'Lộ trình rèn luyện theo thói quen thành công','Cấp độ hành động theo quy tắc 20/80',
        'Môi trường thi đua rèn luyện','Thiết kế khác biệt',
        'Nhóm bạn xuất sắc theo team work','Học tập gắn phát triển bản thân']}
];


/* ══════════ 4. NĂM NHÓM CHÍNH — thanh tab bên trái ══════════ */
G.NAV = [
  {id:'g1',no:'01',ic:'map',c:'#185AB4',
   t:'BẢN ĐỒ THỊNH VƯỢNG', s:'Nhà mình đang ở đâu, và sẽ thành gì?',
   essence:'Nơi mọi thứ bắt đầu: nhìn cho đúng trước khi sửa bất cứ điều gì.',
   items:[
    /* NGÔI NHÀ THỊNH VƯỢNG đứng đầu tiên: đây là màn nhà chính của gia
       đình — một bức tranh ngôi nhà, kích vào từng phần là mở đúng màn
       phần đó. Ít chữ, dẫn đường bằng hình. capMo:'chung' nên mọi vai
       thấy; phần nào vai không mở được thì hiện mờ có khoá, không dẫn
       tới màn xin cấp phép. */
    {v:'ngoi-nha',    t:'Ngôi nhà thịnh vượng',       h:'Kích vào từng phần của ngôi nhà để xây gia đình thịnh vượng', ic:'home', star:1, capMo:'chung'},
    /* Bảng việc và KPI đứng ngay đầu nhóm 01: đây là màn người đi làm mở
       đầu ngày, trước cả bản đồ. Không gắn perm — mọi vị trí đều có việc
       của mình, và danh mục tự lọc theo vai ngay trên màn hình. Khách
       hàng vào "KPI của tôi" thì thấy nhịp ngày và KPI tầng, đội ngũ thì
       thấy KPI công việc: cùng một mục, hai nội dung, theo đúng vai. */
    {v:'bang-viec',   t:'Bảng công việc của tôi',     h:'Trễ hạn · đang làm · mới nhận · đã xong · chốt ngày', ic:'pulse', star:1, capMo:'chung', hienKhi:'cvVaiCoDauViec'},
    {v:'danh-muc-viec',t:'Danh mục đầu việc',         h:'Tích chọn để nhận việc · nói rõ đóng bằng bằng chứng gì', ic:'list', capMo:'chung', hienKhi:'cvVaiCoDauViec'},
    {v:'tien-bo',     t:'Nhà mình đã đổi gì',          h:'Tuần này so với tuần trước, và phần chênh lệch nói bằng lời', ic:'chart', star:1, capMo:'chung'},
    {v:'kpi-toi',     t:'KPI của tôi',                h:'KPI ngày · KPI tháng · liên đới · hạng lương thưởng', ic:'chart', star:1, capMo:'chung'},
    {v:'gioi-thieu',  t:'GITA 365 là gì',              h:'Sứ mệnh · tầm nhìn · mục tiêu · giá trị · năm tầng · văn hoá · cách đồng hành', ic:'seed', star:1, capMo:'chung'},
    {v:'hom-nay',      t:'Hôm nay',                      h:'Một việc duy nhất cho tối nay, tick xong thì cất máy đi — hai việc ngang nhau lúc chín giờ tối, trong bếp, tay bận, là không việc nào được làm · Chế độ Bão bật một chạm, KHÔNG hỏi vì sao · bỏ một việc thì không ai hỏi vặn · việc nặng có nút Để hôm khác ngay cạnh nút tiếp tục, CÙNG KÍCH CỠ', ic:'home', star:1, capMo:'chung'},
    {v:'bat-dau',     t:'Bắt đầu ở đây',               h:'Năm bước đầu tiên, đúng thứ tự',     ic:'seed', star:1, capMo:'chung'},
    {v:'tham-gia',    t:'Đường vào — sáu bước',         h:'Giới thiệu → đăng ký → test → hồ sơ → định hướng → 7 ngày', ic:'compass', star:1, capMo:'chung'},
    {v:'pham-vi',     t:'Phạm vi của tôi',             h:'Mình mở tới đâu · còn gì chưa mở',   ic:'compass', star:1, capMo:'chung'},
    {v:'danh-gia',    t:'Đánh giá GITA 365',           h:'Ba câu · phần chưa tốt cần hơn phần khen', ic:'heart', capMo:'chung'},
    {v:'ban-do',      t:'Bản Đồ Gia Đình Thịnh Vượng', h:'5 khoang · 9 vai · băng nền 8 việc', ic:'map', star:1, capMo:'chung'},
    {v:'chan-dung-nha',t:'Chân dung nhà mình',         h:'Từng thành viên thật sự là ai',      ic:'users', perm:'kh_gia_dinh', capMo:'nha'},
    {v:'dinh-vi',     t:'Định vị hôm nay',             h:'Bảng số trung thực, không cảm giác', ic:'pulse', perm:'kh_gia_dinh', capMo:'nha'},
    {v:'tam-nhin',    t:'Tầm nhìn 5 – 20 năm',         h:'Cả nhà viết, không ai viết hộ ai',   ic:'sun', perm:'kh_gia_dinh', capMo:'nha'},
    /* Bản đồ cá nhân 11 ô. Không gắn perm: mọi vai đều có một bản đồ của
       riêng mình, và nó nằm trong hồ sơ tài khoản chứ không nằm trong gói
       tư liệu nào — nên không có gì để cấp phép. */
    {v:'ban-do-ca-nhan',t:'Bản đồ cá nhân 11 ô',        h:'Tại sao → tài năng · rồi vòng lại sửa lộ trình', ic:'compass', star:1, capMo:'chung'},
    {v:'chuyen-hoa',  t:'Từ nỗi đau đến khát khao',    h:'Bảy chuyển dịch làm nên một gia đình khác', ic:'flame', capMo:'chung'},
    {v:'hanh-trinh-con',t:'Hành trình của con',        h:'Từ nhiều vấn đề đến niềm tự hào',    ic:'star', perm:'kh_hanh_trinh', capMo:'con'},
    /* Màn này viết cho ĐỘI NGŨ — chín khoảnh khắc quyết định một nhà có ở lại
       hay không — và dữ liệu DIEMCHAM nằm trong gói nghề. Trước đây nó gắn
       quyền kh_hanh_trinh nên phụ huynh và học viên thấy mục này trong trình
       đơn mà bấm vào chỉ ra màn xin cấp phép: một mục chết. */
    {v:'diem-cham',   t:'Bản đồ điểm chạm cảm xúc',   h:'Chín khoảnh khắc quyết định họ ở lại', ic:'heart', perm:'nghe_chung', capMo:'nghe'},
    {v:'dong-hanh',   t:'Người đồng hành',             h:'Cố vấn luôn lắng nghe, có mặt mọi lúc',ic:'heart', star:1, capMo:'chung'},
    {v:'wow',         t:'Chuỗi WOW',                   h:'Bảy khoảnh khắc đáng nhớ của hành trình',ic:'spark', capMo:'chung'}
   ]},

  {id:'g2',no:'02',ic:'compass',c:'#5140B4',
   t:'HÀNH TRÌNH 5 TẦNG', s:'Đi theo thứ tự nào để không vỡ trận?',
   essence:'Bảy ngày nhìn đúng · 21 ngày hiểu cơ chế · 90 ngày dựng hệ thống · 365 ngày trao quyền.',
   items:[
    {v:'lo-trinh',    t:'Lộ trình T1 → T5',            h:'Năm chặng, mỗi chặng một câu hỏi',   ic:'compass', star:1, capMo:'chung'},
    /* Con đường nhiệm vụ: đi bằng chân trên mười bánh đà — nhân vật bước,
       trợ lý dẫn, nhiệm vụ hiện ra từng mốc. Đọc thẳng BD_LON, chung. */
    {v:'con-duong',   t:'Con đường nhiệm vụ',           h:'Bước trên mười bánh đà · trợ lý dẫn · nhiệm vụ hiện ra từng mốc', ic:'compass', star:1, capMo:'chung'},
    /* Nhân vật của tôi: khách tự chọn avatar (tại chỗ, ảnh không rời máy
       — Điều 13), dùng làm nhân vật bước trên Con đường. */
    {v:'nhan-vat',    t:'Nhân vật của tôi',             h:'Tự chọn nhân vật đại diện — ảnh không rời máy · đưa ra Con đường', ic:'users', star:1, capMo:'chung'},
    {v:'gita-map',    t:'Bản đồ G – I – T – A',        h:'Bốn miền để đọc đúng nguyên nhân',   ic:'brain', capMo:'chung'},
    {v:'chu-ky',      t:'Chu kỳ 21 / 90 ngày',         h:'PDCA và cổng nghiệm thu từng chặng', ic:'ritual', perm:'kh_hanh_trinh', capMo:'con'},
    {v:'nhiem-vu',    t:'Nhiệm vụ & Nhật ký 365',      h:'Việc của hôm nay, ghi lại được',     ic:'check', perm:'kh_hanh_trinh', capMo:'con'},
    {v:'chan-dung-tc',t:'Mười chân dung thành công',   h:'Người đi trước trông như thế nào',   ic:'crown', perm:'nghe_chung', capMo:'nghe'},
    {v:'cong-nghiem-thu',t:'Cổng nghiệm thu',          h:'Qua chặng bằng bằng chứng, không bằng lời', ic:'shield', perm:'pro_approve', capMo:'nghe'},
    {v:'bo-test',     t:'Bộ test nhận diện 5 tầng',    h:'25 bộ · 750 câu · phân bốn nhóm',    ic:'target', star:1, perm:'kh_hanh_trinh', capMo:'con'},
    {v:'kpi-100',     t:'Mười điểm về đích',           h:'10 điểm mốc · 100 tiêu chí đo được', ic:'crown', star:1, perm:'kh_hanh_trinh', capMo:'con'},
    /* Mười bánh đà đứng TRƯỚC các mục nghề trong nhóm này: đây là màn
       của gia đình, và nó là màn duy nhất trong nhóm không khoá quyền. */
    {v:'banh-da',     t:'Mười bánh đà',                h:'10 vòng × 10 việc · 10 cấp · mốc mở bằng bằng chứng', ic:'orbit', star:1, capMo:'chung'},
    {v:'mua-doi',     t:'Mùa của nhà mình',            h:'Mùa khó thì hạ chuẩn, không phạt · chuỗi được giữ', ic:'shield', capMo:'chung'},
    /* Bức tranh đứng ngay sau mùa: nhà mở app lên thì thấy mình đang ở
       vùng nào và nhánh nào cần tưới, trước khi thấy bất kỳ bảng số nào. */
    {v:'buc-tranh',   t:'Bức tranh hành trình',        h:'7 vùng đất · 3 câu mỗi tối · nhánh nào đang cần tưới', ic:'sun', star:1, capMo:'chung'},
    {v:'kien-truc-100',t:'Kiến trúc một trăm năm',     h:'100 tầng giá trị · 5 thời kỳ · mỗi năm +3–5%',ic:'sun', star:1, perm:'nghe_chung', capMo:'nghe'},
    /* Hai màn của lớp chiến lược. Đặt ngay sau "Kiến trúc một trăm năm"
       vì chúng trả lời đúng câu hỏi màn ấy để ngỏ: một trăm năm thì đẹp,
       nhưng việc sáng nay đẩy vào chỗ nào của một trăm năm ấy.
       Khoá ở nghe_chung — đây là bản thiết kế cách Học viện tự lái mình. */
    {v:'ban-do-chien-luoc',t:'Bản đồ chiến lược',      h:'4 tầng · 18 mục tiêu · chuỗi nhân quả kiểm được', ic:'map', star:1, perm:'nghe_chung', capMo:'nghe'},
    {v:'the-diem-can-bang',t:'Thẻ điểm cân bằng',      h:'Mỗi mục tiêu một thước · 7 nhịp xem lại', ic:'chart', perm:'nghe_chung', capMo:'nghe'},
    {v:'nam-man',     t:'Bàn điều khiển năm màn',      h:'30 phút mỗi sáng · 3 cấp đồng hành · 5 nhiệm kỳ', ic:'orbit', perm:'nghe_chung', capMo:'nghe'},
    /* Hai màn một-màn-hai-tầng: gia đình đọc lời hứa và ngày hệ xong
       việc; vai có gói nghề đọc thêm sổ tay và lớp ép. Nên KHÔNG khoá
       quyền — chặn nằm ở chỗ máy có kho hay không, không nằm ở cột trái. */
    {v:'doi-dong-hanh',t:'Người đi cùng nhà mình',      h:'5 lời hứa · trần 5–10–3 · 20 tình huống nói đúng', ic:'heart', star:1, capMo:'chung'},
    {v:'giu-lua',     t:'Ngày hệ này xong việc',       h:'5 điều kiện xong · chuông 3 tầng · 6 kịch bản sự cố', ic:'shield', capMo:'chung'},
    {v:'tien-rung',   t:'Sáu điều không bao giờ bán',  h:'Lời hứa về dữ liệu và túi tiền · 4 nguồn · thứ tự cắt chi', ic:'shield', capMo:'chung'},
    /* Trục Ngũ mở cho mọi vai: hiến pháp mà người bị nó bảo vệ không đọc
       được thì không phải hiến pháp. Phần biên niên nghề nằm cùng màn,
       chỉ dựng ra khi máy CÓ kho — chặn ở kho, không chặn ở cột trái. */
    {v:'bien-nien',   t:'Năm điều không ai được sửa',  h:'Hiến pháp 1 trang · 10 thập kỷ · 5 cách chết của một đề án 100 năm', ic:'shield', star:1, capMo:'chung'},
    /* Bảy quyền mở cho mọi vai. Bản gốc nói rõ: in ở chỗ gia đình NHÌN
       THẤY, không giấu trong điều khoản — nên nó không được khoá quyền. */
    {v:'phap-ly',     t:'Bảy quyền của nhà mình',      h:'Im lặng · xoá · đi · phủ quyết · đọc · sửa · khiếu nại', ic:'shield', star:1, capMo:'chung'},
    {v:'so-tay-tu-van',t:'Năm điều tư vấn không được làm',h:'Lằn ranh lúc chốt · 30 lời từ chối thật hay giả · 15 con số tháng', ic:'shield', star:1, capMo:'chung'},
    {v:'so-tay-gia-dinh',t:'Sổ tay của gia đình',        h:'24 trang · 30 câu · 7 quyền · trang cuối để trống cho bạn', ic:'sun', star:1, capMo:'chung'},
    {v:'hansei-sach',  t:'Hệ này đang nợ gì',            h:'5 câu chưa trả lời được · 3 loại quyết định · 9 mâu thuẫn tự tìm ra', ic:'shield', star:1, capMo:'chung'},
    {v:'hanh-trinh-5-tang',t:'Con đường năm tầng',        h:'Gia Đình Thịnh Vượng · 5 thử thách · và ngày thang này hết bậc', ic:'compass', star:1, capMo:'chung'},
    {v:'sau-vung',     t:'Vòng luẩn quẩn có tên',       h:'5 vùng · 1 lõi tự nhận thức · 4 chỗ rơi và đường về từng chỗ', ic:'sun', star:1, capMo:'chung'},
    {v:'bang-tin',    t:'Không phải nhà mình đi một mình', h:'Tin cộng đồng · 6 tiêu chí chọn chuyện · mỗi con số khai nó đếm từ đâu', ic:'users', star:1, capMo:'chung'},
    {v:'ban-co',      t:'Bàn cờ hành trình',           h:'1 tầng 1 bàn · 1 ngày 1 ô · 10 gợi ý chọn 1 · điểm theo tầm quan trọng', ic:'target', star:1, capMo:'chung'},
    {v:'coach-5-tang', t:'Người đi cùng phải làm được gì', h:'5 tầng Coach · 4 năng lực mỗi tầng · vòng 10 bước · 1000 chia cho trần', ic:'users', star:1, capMo:'chung'},
    /* Hai màn nghề của lớp vận hành: lịch năm đầu và giáo trình bốn
       mươi giờ. Khoá ở nghe_chung — đây là cách Học viện chạy năm dễ
       tổn thương nhất và cách nó dựng ra người kèm. */
    /* Hai màn nghề rút từ sổ tay vận hành. Cả hai khoá CHẶT HƠN
       nghe_chung, và không phải để bộ kiểm xanh — mà vì đúng người đọc:

         so-tay-van-hanh → pro_coach.  Điều lệ, thứ tự ưu tiên lúc hai
           luật đụng nhau, điều cấm khi hệ lớn lên, kịch bản khủng
           hoảng truyền thông. Đây là việc của lớp điều hành và Coach.
           Mentor, Chuyên gia đánh giá, Phân tích không quyết mấy việc ấy.

         tang34 → pro_consult.  Sách đồng hành tầng 3-4: việc của Trợ lý,
           việc của Coach, câu phải nói. Mọi vai đi cùng gia đình đều cần.
           Riêng Phân tích (R12) thì không — ban dữ liệu không soạn tin.

       Và nhà mình không đọc cái nào trong hai: đọc thì thấy trước kịch
       bản của chính buổi gặp mình sắp dự. */
    {v:'so-tay-van-hanh', t:'Mười điều, và chỗ mỗi điều thật sự chặn', h:'Thứ tự ưu tiên · 10 điều lệ · 4 điều cấm khi lớn lên · 4 chỗ hệ gãy', ic:'compass', star:1, perm:'pro_coach', capMo:'nghe'},
    {v:'tang34',      t:'Tầng 3 và tầng 4 — việc của ai',  h:'Ranh giới Trợ lý với Coach · 5 nhịp G-I-T-S-A · 3 trụ đo · 14 dạng khó', ic:'compass', star:1, perm:'pro_consult', capMo:'nghe'},
    /* Dòng T5-PRO: không phải tầng thứ sáu, nên nó không nằm cạnh năm
       tầng ở nhóm hành trình — nó là một sách nghề, và nó khoá chặt
       nhất trong mọi màn nghề. */
    /* Bộ bản vẽ 13 tờ: đặc tả vận hành của cả hệ — ma trận 50 ô, bốn
       cổng, hai mươi tín hiệu đỏ, trần công suất từng vai. Khoá ở
       pro_coach: đây là bảng điều phối, và nhà mình đọc thì thấy
       mình là một dòng trong đó. */
    /* Bàn làm việc của Coach: năm ngăn vét cạn, gói tài nguyên tám ô,
       trợ lý nhắc việc có hạn giờ. Khoá ở pro_coach — đây là hàng đợi
       công việc, và nhà mình đọc thì thấy mình là một dòng trong đó. */
    /* Bàn của Tư vấn — khoá ở pro_consult, cùng lý do với bàn Coach:
       đây là hàng đợi nội bộ, và nhà mình đọc thì thấy mình là một dòng
       trong đó, kèm cả lý do chưa ai trả lời. */
    {v:'ban-tu-van',  t:'Bàn làm việc của Tư vấn', h:'5 ngăn vét cạn · 7 câu sàng lọc có 4 câu chặn · 9 ô hồ sơ · gói 6 ô đóng sẵn', ic:'compass', star:1, perm:'pro_consult', capMo:'nghe'},
    /* Bảng đăng ký hoạt động — khoá ở pro_coach vì nó phơi toàn bộ quy
       trình nội bộ: ai làm gì, hạn bao lâu, không ai làm thì rơi đi đâu. */
    /* Diễn thử — khoá pro_coach. Cột phải của mỗi lượt là câu người
       tư vấn ĐÁNG LẼ đã nói, nên đây là tài liệu sát hạch, không phải
       tài liệu giới thiệu. */
    /* Chuẩn ngôn ngữ — khoá pro_coach vì bảng cấm phơi ra đúng câu
       người bán dễ nói nhất, và đó là bộ đề sát hạch chứ không phải
       tài liệu giới thiệu. */
    /* 1000 điểm chạm — khoá pro_coach. Bảng này phơi ra hệ định chạm
       vào cảm xúc nào lúc nào, nên nhà mình đọc thì thấy trước cả
       khoảnh khắc mình sắp được chạm. */
    {v:'diem-cham-1000', t:'1000 điểm chạm · 1000 điểm khoá', h:'50 ô × 10 nhịp × 2 người · Coach bắt buộc / tuỳ chọn / không cần · 12 điều tay nghề 30 năm', ic:'sparkle', star:1, perm:'pro_coach', capMo:'nghe'},
    /* Hành lang thành công — 12 luật, 18 virus và bộ vắc-xin, soi thẳng
       vào hệ đang chạy chứ không chép lại tài liệu. Và bản rà soát 66
       điểm gãy: nó nói chỗ nào của chính app này còn hở. Cả hai đều nêu
       tên hàm và tên kho, nên khoá ở quyền nghề. */
    /* Ba màn pháp lý — khoá pro_coach. Chúng nêu chỗ hệ còn hở trước
       pháp luật và cả khung hợp đồng nội bộ của Học viện; đó là bản
       đồ chỗ yếu, nên nó ở lại trong tay người điều phối.

       Tên màn là 'ra-soat-phap-ly', KHÔNG phải 'phap-ly' — màn ấy đã
       có, và nó là bảy quyền của gia đình, mở cho mọi vai. */
    {v:'ra-soat-phap-ly', t:'Rà soát pháp lý — 64 phát hiện', h:'8 nhóm · 20 mục nghiêm trọng đối chiếu với hàm đang chạy · 2 luật mới · 4 chỗ tài liệu và app nói khác nhau', ic:'shield', star:1, perm:'pro_coach', capMo:'nghe'},
    {v:'bang-chung',  t:'Chuẩn bằng chứng điện tử', h:'13 thao tác × 6 tính chất · máy đọc nhật ký thật rồi đếm · 3 lỗi làm bằng chứng mất giá trị · 5 việc gần nhất', ic:'lock', star:1, perm:'pro_coach', capMo:'nghe'},
    /* Sổ tay Super Admin — khoá qt_trang, tức chỉ R01–R02. Nó nêu nút
       nào nguy ở từng màn quản trị, và bảng "cấp một quyền mở ra bao
       nhiêu màn" là bản đồ đường vào hệ. Không mở rộng hơn được. */
    {v:'so-tay-admin', t:'Sổ tay Super Admin — cột tab từ A đến Z', h:'Nhịp ngày/tuần/tháng/quý · 7 ngày đầu · 12 màn nguy nhất · toàn bộ màn do máy sinh · cấp 1 quyền mở ra mấy màn', ic:'crown', star:1, perm:'qt_trang', capMo:'nghe'},
    /* Bảng tin nội bộ — khoá nghe_chung, trần bậc 12. Đó đúng là ranh
       giới chủ hệ đặt: mười hai vị trí nghề đọc được, còn phụ huynh,
       học viên và cộng tác viên thì không. Khoá ở tầng dữ liệu chứ
       không ở tầng màn hình — kho nằm trong gói nghề. */
    {v:'tu-dong',     t:'Tự động hoá — đo trên hệ đang chạy', h:'34 việc · tỉ lệ đo được chứ không khai · 5 việc máy không được nhận · 5 đường đi tiếp xếp theo gỡ được nhiều nhất', ic:'lightning', star:1, perm:'nghe_chung', capMo:'nghe'},
    {v:'tin-noi-bo',  t:'Bảng tin nội bộ của đội ngũ', h:'5 ngăn theo phạm vi vai · vinh danh ghi nhận việc chứ không xếp hạng · trần 3 tin mỗi ngày · khách và CTV không đọc được', ic:'bell', star:1, perm:'nghe_chung', capMo:'nghe'},
    {v:'ky-ket',      t:'Hướng dẫn ký kết — ba luồng phát sinh', h:'Lao động · dịch vụ khách · tài chính · 7 cửa trước khi đặt bút · cây chọn hợp đồng · 8 việc cấm', ic:'check', star:1, perm:'pro_coach', capMo:'nghe'},
    {v:'ho-so-hop-dong', t:'Bộ hồ sơ hợp đồng và vận hành', h:'16 hợp đồng · 25 điều khoản nền · 6 điều khoản đặc thù đối chiếu ngược · công thức lương máy tự đọc · 3 cấp chữ ký', ic:'book', star:1, perm:'pro_coach', capMo:'nghe'},
    {v:'hanh-lang',   t:'Hành lang thành công — máy tự soi mình', h:'12 luật · 18 virus × vắc-xin có người kiểm · 9 khoá · Sáu Nhịp · 7 chỉ số · chỗ lệch với tài liệu', ic:'shield', star:1, perm:'pro_coach', capMo:'nghe'},
    {v:'ra-soat-loi', t:'Rà soát lỗi hệ thống — 66 điểm gãy', h:'8 nhóm · 13 lỗi chặn phát hành, mỗi lỗi đối chiếu với hàm đang chạy · 4 gốc rễ · 5 đợt', ic:'alert', star:1, perm:'pro_coach', capMo:'nghe'},
    {v:'chuan-ngon-ngu', t:'Chuẩn ngôn ngữ sáu vai', h:'6 vai · 9 câu cấm theo cấu trúc · máy soát chạy trên chính kho · câu thay cho từng chỗ', ic:'quote', star:1, perm:'pro_coach', capMo:'nghe'},
    {v:'pheu-chot',   t:'Phễu chốt — 90% đặt ở đúng chỗ', h:'5 tầng · ai bị loại ở đâu · chốt thô và chốt đủ điều kiện · ba số đọc kèm', ic:'filter', star:1, perm:'pro_consult', capMo:'nghe'},
    {v:'dien-thu',    t:'Diễn thử — hai buổi khó nhất', h:'2 bài × 20 lượt · mỗi lượt truy về kho và bộ lọc · câu dễ nói mà luật cấm', ic:'chat', star:1, perm:'pro_coach', capMo:'nghe'},
    {v:'hoat-dong',   t:'Đăng ký hoạt động — việc nào không ai nhận', h:'21 hoạt động · 3 mức tự động · 4 việc máy không được nhận · đường rơi của từng việc', ic:'grid', star:1, perm:'pro_coach', capMo:'nghe'},
    {v:'ban-coach',   t:'Bàn làm việc của Coach', h:'5 ngăn vét cạn · gói 8 ô đóng sẵn · trợ lý nhắc việc có hạn giờ · 4 lượt rà soát', ic:'pulse', star:1, perm:'pro_coach', capMo:'nghe'},
    {v:'ban-ve',      t:'Bộ bản vẽ — 50 ô, mỗi ô một tag', h:'4 nguyên tắc · 50 cấp độ · 4 cổng · 10 nhịp · 20 tín hiệu đỏ · bản đồ nâng cấp', ic:'map', star:1, perm:'pro_coach', capMo:'nghe'},
    {v:'tang5-pro',   t:'Dòng T5-PRO — Gia đình Thịnh vượng', h:'24 tháng · 4 giai đoạn · đội 3 vai · 6 tiêu chí cửa vào · 5 kịch bản từ chối', ic:'vault', star:1, perm:'pro_gia_nghiep', capMo:'nghe'},
    {v:'nam-dau',     t:'Sổ tay năm đầu',              h:'12 tháng · 6 mốc kiểm · 8 kịch bản lần đầu', ic:'compass', star:1, perm:'nghe_chung', capMo:'nghe'},
    {v:'dao-tao-dh',  t:'Bốn mươi giờ đào tạo',        h:'12 buổi · 20 ca thi vai · 1 tiêu chí tuyệt đối', ic:'brain', perm:'nghe_chung', capMo:'nghe'},
    {v:'tinh-gon',    t:'Quy trình tinh gọn',          h:'7 loại lãng phí · 10 nguyên tắc cắt chi phí', ic:'lightning', perm:'nghe_chung', capMo:'nghe'},
    {v:'giai-doan-bao-ve',t:'Giai đoạn và lớp bảo vệ', h:'5 giai đoạn · 4 tầng bảo vệ, kể cả chỗ chưa có', ic:'shield', perm:'nghe_chung', capMo:'nghe'},
    /* Chỉ hiện với vai CÓ đầu việc trong hệ — luồng này để người LÀM nói
       chỗ vướng, nên nó vô nghĩa với tài khoản không được giao việc gì. */
    {v:'cai-tien',    t:'Cải tiến từ người làm',       h:'Nói chỗ vướng · có người trả lời trong 14 ngày', ic:'lightning', perm:'nghe_chung', hienKhi:'cvVaiCoDauViec', capMo:'nghe'}
   ]},

  {id:'g3',no:'03',ic:'vault',c:'#0B6675',
   t:'KHO BÁU VẬT', s:'Cần bí kíp nào cho đúng tình huống này?',
   essence:'1.000 kịch bản · 220 phác đồ · 25 mô thức · toàn văn sách gốc — mở khoá theo tiến trình.',
   items:[
    /* Đặt đầu thư mục: đây là cửa nhìn toàn cảnh, ai vào cũng nên thấy trước.
       Không gắn perm — mọi vai đều thấy TÊN các kho, còn mở được hay không
       thì bảng bên trong nói rõ từng dòng. */
    {v:'vong-nhac',   t:'Vòng nhắc Đúng – Đủ – Sâu',      h:'Xem không phải là làm · ba nấc mỗi việc', ic:'orbit', capMo:'chung', star:1},
    {v:'hanh-trinh-12',t:'Hành trình 12 chặng của học viên', h:'4 trụ · ai chịu trách nhiệm · điểm chạm WOW', ic:'map', capMo:'chung', star:1},
    {v:'luat-lam-viec',t:'Luật làm việc với gia đình',    h:'Đi qua hệ thống · vi phạm hạ 50% KPI 3 tháng', ic:'shield', perm:'nghe_chung', capMo:'nghe', star:1},
    {v:'ref-gita',    t:'Hệ thống một nhà giới thiệu một nhà', h:'Chân dung Ref · 30s-60s-8p · 16 bước', ic:'share', perm:'nghe_chung', capMo:'nghe', star:1},
    {v:'khach-lon',   t:'Chăm sóc khách hàng lớn',        h:'4 tầng · nhịp chạm · hồ sơ 68 điểm', ic:'crown', perm:'nghe_chung', capMo:'nghe', star:1},
    /* Kho tổng liệt kê CHÍN NHÓM KHO và 57 kho tư liệu của Học viện, kèm
       tên từng kho: "220 phác đồ × 5 tầng", "1.000 kịch bản chuyên môn —
       lời để nói ra miệng, đã thử qua nhiều buổi", "250 tình huống thực
       chiến", "Ma trận 220 vấn đề × 5 tầng", và cả nhóm K2 tự giới thiệu
       là "Kho giải pháp cho Tư vấn, Coach — thứ đội ngũ mở ra khi ngồi
       trước một gia đình đang mắc".

       Nó không mở NỘI DUNG của mấy kho ấy — nhưng nó mở KIẾN TRÚC, và
       kiến trúc mới là thứ một đối thủ cần. Trước v9.2 màn này không có
       perm, nên mọi phụ huynh, học viên và cộng tác viên đều cầm được
       bản đồ tài sản nghề của Học viện.

       Khách hàng không mất gì: màn "Phạm vi của tôi" đã trả lời đúng câu
       hỏi của họ — mình mở tới đâu, còn gì chưa mở — bằng ngôn ngữ gia
       đình, không kèm mục lục kho nghề. */
    {v:'kho-tong',    t:'Kho tổng — toàn cảnh',        h:'9 nhóm · hơn 50 kho · số đếm thật', ic:'vault', perm:'nghe_chung', capMo:'chung', star:1},
    {v:'thu-vien',    t:'Thư viện tài liệu',           h:'Gửi tài liệu lên · kho lớn lên từ đây', ic:'book', capMo:'chung', star:1},
    {v:'minh-chung',  t:'Minh chứng nhiệm vụ',         h:'Nộp ảnh, báo cáo xác nhận đã làm',   ic:'check', capMo:'chung', star:1},
    {v:'kho',         t:'Kho báu vật',                 h:'Toàn cảnh những gì anh chị đang có', ic:'vault', star:1, perm:'nghe_chung', capMo:'nghe'},
    {v:'phac-do',     t:'220 phác đồ × 5 tầng',        h:'Vấn đề nào cũng có đường đi',        ic:'book', perm:'nghe_chung', capMo:'nghe'},
    {v:'kich-ban',    t:'1.000 kịch bản chuyên môn',   h:'Tư vấn và coaching, đủ cả năm tầng', ic:'ritual', perm:'nghe_chung', capMo:'nghe'},
    {v:'phuong-phap', t:'Xương sống phương pháp',       h:'42 mô thức GITA · 6 nhịp ngôn ngữ',  ic:'brain', star:1, perm:'nghe_chung', capMo:'nghe'},
    {v:'van-tay',     t:'Sinh trắc học vân tay',        h:'Quan điểm thống nhất của GITA',      ic:'shield', perm:'nghe_chung', capMo:'nghe'},
    {v:'ma-tran',     t:'Ma trận 220 vấn đề × 5 tầng', h:'11 nhóm · 8 cột sâu mỗi tầng',       ic:'map', star:1, perm:'nghe_chung', capMo:'nghe'},
    {v:'ma-tran-bang',t:'Ma trận × 4 nhóm khách hàng',  h:'XANH · VÀNG · CAM · ĐỎ trong mỗi tầng', ic:'orbit', star:1, perm:'nghe_chung', capMo:'nghe'},
    {v:'tinh-huong',  t:'250 tình huống thực chiến',   h:'Mã Key · thử thách 7 ngày · KPI',    ic:'target', perm:'nghe_chung', capMo:'nghe'},
    {v:'mo-thuc',     t:'25 mô thức huấn luyện',       h:'Bộ công cụ gốc của người sáng lập',  ic:'brain', perm:'nghe_chung', capMo:'nghe'},
    {v:'tu-duy',      t:'Hệ tư duy mới',               h:'14 bài học đổi cách nhìn trong nhà', ic:'lightning', perm:'nghe_chung', capMo:'nghe'},
    {v:'tai-lieu-goc',t:'Tài liệu gốc Học viện',        h:'5 bộ · 161 bảng · 1.647 dòng dữ liệu', ic:'vault', perm:'nghe_chung', capMo:'nghe', star:1},
    {v:'sach',        t:'Sách gốc & tư liệu Học viện', h:'11 chương · 515 đoạn · tra cứu được',ic:'book', perm:'nghe_chung', capMo:'nghe'},
    {v:'nhan-dien-loi',t:'Bộ nhận diện ngôn từ',       h:'GITA nói thế nào · 10 dấu hiệu câu máy viết', ic:'book', perm:'nghe_chung', capMo:'nghe', star:1},
    {v:'ngon-tu',     t:'Ngôn từ dẫn dắt',             h:'Sáu nhịp · mẫu câu dùng được ngay',  ic:'lightning', star:1, perm:'nghe_chung', capMo:'nghe'},
    {v:'so-tay-nhan-dien',t:'Sổ tay nhận diện GITA',   h:'7 chương viết rõ · đọc thẳng, không tải xuống', ic:'book', perm:'nghe_chung', capMo:'nghe', star:1},
    {v:'chieu-sau',   t:'Chiều sâu năm lớp',            h:'Mỗi mô thức, năm cấp nghề làm được năm việc khác nhau', ic:'chart', perm:'nghe_chung', capMo:'nghe', star:1},
    {v:'nhan-dien',   t:'Bộ nhận diện GITA',            h:'Logo · ba màu · chữ · luật dùng',    ic:'star', capMo:'chung', star:1},
    {v:'thuong-hieu', t:'Nhận diện thương hiệu',       h:'Màu · chữ · giọng nói · điều cấm kỵ',ic:'star', perm:'nghe_chung', capMo:'nghe'},
    {v:'van-dung',    t:'Năm cấp độ vận dụng',           h:'Chiều sâu nghề · giới hạn tầng · báo cáo', ic:'brain', perm:'nghe_chung', capMo:'nghe', star:1},
    {v:'xu-ly-ca',    t:'Xử lý ca theo quy trình',       h:'7 bước · bằng chứng bắt buộc · 4 ràng buộc', ic:'shield', perm:'ca_xu_ly', capMo:'nghe', star:1},
    {v:'gui-tu-lieu', t:'Gửi tư liệu cho gia đình',      h:'Lời xin đang chờ · cửa KPI 80%',      ic:'share', perm:'tl_gui_khach', capMo:'nghe', star:1},
    {v:'tro-ly',      t:'Trợ lý GITA',                 h:'Hỏi bất cứ điều gì, trích dẫn nguồn',ic:'spark', capMo:'chung', star:1}
   ]},

  {id:'g4',no:'04',ic:'flame',c:'#F61824',
   t:'CÚ HÍCH & NHỊP SỐNG', s:'Làm gì hôm nay để nhà mình khác đi?',
   essence:'Thói quen, nghi lễ, vai giữ và những cú hích đủ lớn để cả nhà bật lên.',
   items:[
    /* Chuyện truyền cảm hứng: mỗi cấp tài khoản một kho trăm chuyện.
       Không gắn perm — vai nào cũng có kho của mình, màn hình tự lọc. */
    {v:'chuyen-cam-hung',t:'Chuyện truyền cảm hứng', h:'100 chuyện cho cấp của mình · 10 mạch · mỗi nhiệm vụ một chuyện', ic:'flame', star:1, capMo:'chung'},
    {v:'chuyen-the-gioi',t:'Chuyện người thật',      h:'Doanh nhân · khoa học · nghệ thuật · thể thao · người Việt', ic:'crown', star:1, capMo:'chung'},
    {v:'giong-doc',   t:'Đọc hoặc nghe · giọng đọc',  h:'Bản quyền giọng · chuẩn phòng thu · kịch bản dẫn', ic:'quote', capMo:'chung'},
    {v:'nhat-ky-vi-tri',t:'Sổ nhật ký của tôi',    h:'Ngày · tuần · tháng · ô ghi riêng cho từng vị trí', ic:'book', star:1, capMo:'chung'},
    {v:'thi-viet',    t:'Cuộc thi viết 7 – 21 – 90 – 365', h:'Bài đạt mốc 90 và 365 nhận học bổng 10%', ic:'crown', star:1, capMo:'chung'},
    {v:'sat-hach',    t:'Sát hạch năng lực',          h:'5 tầng · 4 bài tốt nghiệp · 8 trục đánh giá', ic:'shield', star:1, capMo:'chung'},
    {v:'khoa-dao-tao',t:'Khoá đào tạo của tôi',       h:'Học · Làm · Nộp · bài kế tiếp tự mở', ic:'book', star:1, capMo:'chung'},
    {v:'do-thoi-gian',t:'Thời gian · thưởng · phạt', h:'Đồng hồ thật · ba ngưỡng · chuẩn hoàn thành · quy đổi điểm', ic:'pulse', star:1, capMo:'chung'},
    {v:'chin-vai',    t:'Chín vai giữ trong nhà',      h:'Ai giữ gì, ai đang bị bỏ ra ngoài',  ic:'users', star:1, perm:'kh_gia_dinh', capMo:'nha'},
    {v:'thoi-quen',   t:'Thói quen & nghi lễ',         h:'Bốn nghi lễ giữ nhịp cả năm',        ic:'ritual', perm:'kh_gia_dinh', capMo:'nha'},
    {v:'cu-hich',     t:'Cú hích lớn',                 h:'Chiến dịch tạo bước nhảy, không bước đi', ic:'lightning', perm:'kh_gia_dinh', capMo:'nha'},
    {v:'bang-so',     t:'Bảng số gia đình',            h:'Bảy chỉ số đầu ra của mô hình',      ic:'chart', perm:'kh_gia_dinh', capMo:'nha'},
    {v:'phan-thuong', t:'Ghi nhận · Cấp độ · Quà tặng',h:'10 cấp · huy hiệu · đổi điểm lấy quà',ic:'crown', star:1, perm:'kh_hanh_trinh', capMo:'con'},
    {v:'kho-qua',     t:'Kho 1.000 tài liệu quà tặng', h:'Mắc ở đâu, mở đúng tài liệu ở đó',   ic:'book', perm:'kh_qua_tang', capMo:'qua'},
    {v:'vinh-danh',   t:'Vinh danh & kỳ tích năm',     h:'Chuyện tốt trong nhà phải được kể',  ic:'crown', capMo:'chung'},
    {v:'ranh-gioi',   t:'Sáu ranh giới',               h:'Những điều không bao giờ được làm',  ic:'shield', capMo:'chung'},
    {v:'chuan-nhat',  t:'Chuẩn vận hành',              h:'Kaizen · Monozukuri · Omotenashi · Shokunin',ic:'target', perm:'nghe_chung', capMo:'nghe'}
   ]},

  {id:'g5',no:'05',ic:'orbit',c:'#0B7350',
   t:'HỆ SINH THÁI & VẬN HÀNH', s:'Quanh nhà mình có ai, và hệ thống đang chạy ra sao?',
   essence:'Vệ tinh những người tuyệt vời, đội ngũ dẫn dắt và trung tâm điều hành của cả hệ sinh thái.',
   items:[
    {v:'ve-tinh',     t:'Vệ tinh của tôi',             h:'Những người tuyệt vời quanh mình',   ic:'orbit', star:1, capMo:'chung'},
    {v:'dai-su',      t:'Đại sứ GITA 365',             h:'4 cấp · 20 nhiệm vụ · 13 quy tắc',   ic:'share', perm:'ctv_hoa_hong', capMo:'ctv'},
    {v:'referral',    t:'Phiếu chỉ dẫn referral',      h:'5 chân dung · 12 dấu hiệu · PAIN GOAL GAP', ic:'share', star:1, perm:'nghe_chung', capMo:'nghe'},
    {v:'hoc-phi',     t:'Học phí năm tầng · nói chuyện tiền', h:'18 kịch bản · 7 luật · nhịp thu và hoàn tiền', ic:'crown', star:1, perm:'nghe_chung', capMo:'nghe'},
    {v:'chan-dung-kh',t:'Sáu chân dung khách hàng',    h:'Đọc đúng nhà để gửi đúng lộ trình',  ic:'users', perm:'nghe_chung', capMo:'nghe'},
    {v:'chuyen-doi',  t:'Chín cổng chuyển đổi',         h:'Người lạ → đại sứ → cộng tác → đối tác',ic:'compass', star:1, perm:'nghe_chung', capMo:'nghe'},
    {v:'hoa-hong',    t:'Cơ chế tài chính đại sứ',     h:'4 cấp · trần hoa hồng 10%',          ic:'chart', perm:'ctv_hoa_hong', capMo:'ctv'},
    {v:'su-kien',     t:'Sự kiện & Lửa trại',          h:'Nơi cả hệ sinh thái gặp nhau',       ic:'calendar', capMo:'chung'},
    {v:'ket-noi',     t:'Kết nối hệ sinh thái',        h:'Đồng bộ · Facebook · Telegram',      ic:'orbit', capMo:'chung'},
    {v:'coach-deck',  t:'Buồng lái Coach',             h:'Gia đình nào cần chạm trước hôm nay',ic:'flame', perm:'pro_coach', capMo:'nghe'},
    {v:'tuvan-deck',  t:'Khoang mở cửa',               h:'Người đang tìm đường và bước kế tiếp',ic:'compass', perm:'pro_consult', capMo:'nghe'},
    {v:'bando-tuvan', t:'Bản đồ vận hành khách hàng',  h:'Bảy chặng · học thuộc trong 4 tuần', ic:'map', perm:'pro_consult', capMo:'nghe'},
    {v:'bando-coach', t:'Bản đồ coaching',             h:'Sáu nhịp một buổi · sáu điều tối ưu',ic:'flame', perm:'pro_coach', capMo:'nghe'},
    {v:'nguoi-dan-dat',t:'Hành trình người dẫn dắt',   h:'Lớn lên bằng chính nghề mình làm',   ic:'flame', perm:'pro_consult', capMo:'nghe'},
    {v:'doi-ngu',     t:'Đội ngũ dẫn dắt',             h:'Ai đang giữ lửa cho những nhà nào',  ic:'users', perm:'pro_consult', capMo:'nghe'},
    {v:'dieu-hanh',   t:'Trung tâm điều hành',         h:'Toàn cảnh sức khoẻ hệ sinh thái',    ic:'shield', perm:'dh_toan_he', capMo:'dieuhanh'},
    {v:'van-ban',     t:'Bộ văn bản chuẩn',            h:'22 mẫu · giao việc, bàn giao, quyết định',ic:'book', perm:'pro_consult', capMo:'nghe'},
    {v:'tai-chinh-qt',t:'Hệ quản trị tài chính',       h:'6 nguyên tắc · 5 sổ · 6 chốt kiểm soát',ic:'chart', perm:'fin_view', capMo:'taichinh'},
    {v:'quy-trinh-tc',t:'Quy trình tài chính',         h:'Thanh toán · hoàn trả · lương thưởng',ic:'target', perm:'fin_view', capMo:'taichinh'},
    {v:'thanh-tra',   t:'Thanh tra & cảnh báo',        h:'6 chu kỳ · 10 cảnh báo có thời hạn', ic:'pulse', perm:'qt_trang', capMo:'quantri'},
    {v:'ra-soat-kh',  t:'Rà soát mười hai mặt',        h:'Không bỏ sót nhu cầu của gia đình',  ic:'target', perm:'pro_consult', capMo:'nghe'},
    {v:'xuat-du-lieu',t:'Xuất dữ liệu',                h:'PDF hồ sơ · CSV danh sách · phân quyền',ic:'out', perm:'pro_coach', capMo:'nghe'},
    {v:'do-luong-kh', t:'Hệ đo lường khách hàng',      h:'7 chỉ số · 6 nhịp · vòng cải tiến',  ic:'pulse', perm:'pro_consult', capMo:'nghe'},
    {v:'hang-vip',    t:'Phân hạng VIP & VVIP',        h:'4 hạng · chuẩn phục vụ · AI chăm sóc',ic:'crown', star:1, perm:'pro_consult', capMo:'nghe'},
    {v:'hoso-vip',    t:'Chuẩn hồ sơ VIP & VVIP',      h:'7 phần · 30 trường · ba mươi giây',  ic:'book', star:1, perm:'pro_consult', capMo:'nghe'},
    {v:'cay-tien',    t:'Cây tiền — chăm sóc VIP',     h:'4 việc · điểm cây tiền · 12 nhịp',   ic:'seed', perm:'pro_consult', capMo:'nghe'},
    {v:'ai-cham',     t:'Trợ lý chăm sóc tự động',     h:'16 luật chạy nền · ranh giới rõ',    ic:'spark', perm:'nghe_chung', capMo:'nghe'},
    {v:'nhan-su-tt',  t:'Tệp nhân sự trung thành',     h:'5 bậc · 7 chỉ số · 5 luật',          ic:'users', perm:'pro_consult', capMo:'nghe'},
    {v:'tang-quyen',  t:'Tầng quyền truy cập',         h:'Ma trận 15 vai × 21 quyền',          ic:'shield', perm:'qt_trang', capMo:'quantri'},
    {v:'vong-doi-tk', t:'Vòng đời tài khoản',          h:'KPI · khoá · mở lại · đặt lại',      ic:'pulse', perm:'qt_trang', capMo:'quantri'},
    {v:'hang-tai-lieu',t:'Xếp hạng tài liệu 1–100',    h:'KPI và cấp bậc mới mở tài liệu hay', ic:'crown', perm:'qt_trang', capMo:'quantri'},
    {v:'dau-mat',     t:'Mật mã kín trên tài liệu',    h:'Năm lớp mã · quét truy nguồn rò rỉ', ic:'lock', perm:'qt_trang', capMo:'quantri'},
    {v:'dong-chay',   t:'Dòng chảy thông tin',         h:'Bảy dòng nuôi hệ sinh thái',         ic:'orbit', perm:'qt_trang', capMo:'quantri'},
    {v:'kiem-duyet',  t:'Kiểm duyệt kho báu vật',      h:'Chuẩn nghề trước khi xuất bản',      ic:'check', perm:'qt_trang', capMo:'quantri'},
    {v:'tang-truong', t:'Tài chính & tăng trưởng',     h:'Dòng tiền nuôi được sứ mệnh',        ic:'chart', perm:'fin_view', capMo:'taichinh'},
    {v:'chi-phi',     t:'Kiến trúc chi phí',           h:'Trần 500.000đ/tháng · nặng ở máy',   ic:'target', perm:'fin_view', capMo:'taichinh'},
    {v:'hai-long',    t:'Chỉ số hài lòng & góp ý',     h:'Mục tiêu 90% · nghe khách nói thật', ic:'heart', perm:'nghe_chung', capMo:'nghe'},
    {v:'duyet-danh-gia', t:'Duyệt đánh giá công khai', h:'Bốn cửa trước khi lời của gia đình ra ngoài', ic:'shield', perm:'qt_trang', capMo:'nghe'},
    {v:'tai-lieu-khach',t:'Tài liệu gia đình gửi lên',  h:'Đọc sự sáng tạo để nâng cấp lộ trình',ic:'seed', perm:'pro_consult', capMo:'nghe'},
    {v:'kiem-thu',    t:'Phòng kiểm thử 4 chuyên gia',  h:'Khó tính · Hiểu biết · Kỹ sư · Ngôn từ',ic:'target', perm:'qt_trang', capMo:'quantri'},
    {v:'chuan-1000',  t:'Chuẩn 1000 điểm',             h:'Mười nhóm · từng chi tiết một',      ic:'star', perm:'qt_trang', capMo:'quantri'},
    {v:'ai-dieu-phoi',t:'AI điều phối',               h:'Giới hạn tầng · định tuyến KPI · nâng cấp nghề',ic:'brain', perm:'nghe_chung', capMo:'nghe'},
    {v:'an-toan-du-lieu',t:'Lá chắn dữ liệu',          h:'Chống sao chép · chống giả khách',    ic:'lock', perm:'qt_trang', capMo:'quantri'},
    {v:'hoc-tu-lon',  t:'Học từ những hệ thống lớn',   h:'TikTok · Google · Toyota · Apple…',   ic:'target', perm:'qt_trang', capMo:'quantri'},
    {v:'ra-soat',     t:'Rà soát hệ thống',            h:'Bảo mật · mã · dữ liệu · thương hiệu',ic:'shield', perm:'qt_trang', capMo:'quantri'},
   ]},

  /* ══════════ 06 · QUẢN TRỊ TRANG — CHỈ R01 VÀ R02 ══════════
     Thư mục riêng cho việc quản trị chính trang: phân công cấp quyền,
     mở tài khoản mới, khoá – mở lại – xoá tài khoản, và nhật ký.
     Vai từ R03 trở xuống không thấy thư mục này. */
  {id:'g6',no:'06',ic:'lock',c:'#185AB4',
   t:'QUẢN TRỊ TRANG', s:'Ai được vào, vào tới đâu, và ai đã làm gì.',
   essence:'Nơi cấp quyền, mở và khoá tài khoản. Mọi thao tác ở đây đều vào nhật ký kèm tên người làm.',
   items:[
    {v:'noi-may-chu', t:'Nối máy chủ',                 h:'Dán địa chỉ · gọi thử · sáu bước dựng', ic:'orbit', perm:'qt_trang', capMo:'chung', star:1},
    /* Màn phòng tài chính khoá ở fin_view (R01–R04 đọc; R01–R03 làm).
       Nó KHÔNG khoá ở qt_trang như các màn khác của nhóm này: người
       của phòng tài chính không phải người quản trị trang, và bắt họ
       qua cổng ấy là hoặc mở qt_trang cho họ — tức cho luôn quyền cấp
       tài khoản — hoặc để họ không vào được phòng của chính mình. */
    {v:'phong-tai-chinh', t:'Phòng Kế toán – Tài chính', h:'Bảng tin · trợ lý · việc của tôi · sổ ngày · đối chiếu · chốt sổ · KPI · lương · quy chế', ic:'shield', star:1, perm:'fin_view', capMo:'chung'},
    /* Bộ não đứng TRƯỚC biên soạn: hiến pháp và hàng rào là thứ mọi
       bài viết ra phải đi qua, nên người đọc gặp nó trước.

       Quyền `nghe_chung`, KHÔNG phải `qt_trang`. Bản đầu tôi khoá ở
       quyền quản trị, và phép đo tỉ lệ hiển thị bắt ngay: R07 · R08 ·
       R12 tụt dưới đích. Đỏ ấy đúng, và nó chỉ ra một mâu thuẫn với
       chính bản đặc tả — Phân hệ 6 viết "Trainer, coach, tư vấn viên
       đều phải học và thi cùng một Hiến pháp 13 điều", và gọi đó là
       ĐỒNG CHUẨN: khách gặp ai của GITA cũng nhận cùng một chất lượng
       và cùng một giọng. Khoá hiến pháp ở tầng quản trị là làm cho
       người chạm khách nhiều nhất lại không đọc được luật mình phải
       theo. */
    {v:'bo-nao', t:'Bộ não GITA 365', h:'Hiến pháp 13 điều · ba vùng uỷ quyền · hàng rào 10 điểm · ẩn danh trước khi ra ngoài · bảy ghế tham mưu', ic:'book', star:1, perm:'nghe_chung', capMo:'chung'},
    /* Vùng Mạnh đứng ngay sau Bộ não: bản đặc tả gọi nó là LÕI của
       v3.0, và nó là phân hệ duy nhất chạm thẳng vào một đứa trẻ
       cụ thể. `nghe_chung` cùng lý do với Bộ não — người chạm khách
       nhiều nhất phải đọc được luật mình phải theo. */
    {v:'vung-manh', t:'Vùng mạnh của con', h:'Ba thứ quan sát được · bảy trường · bốn tuần · Thẻ Vùng Mạnh hạn 90 ngày · bậc thang năm tầng giá trị', ic:'star', star:1, perm:'nghe_chung', capMo:'chung'},
    {v:'coach-kh', t:'Coach khách hàng', h:'Vòng chín bước · mười hai luồng, bốn luồng nặng ba lượt hội đồng · năm ghế, ghế giữ hồn phải là người · Bé tập bò ba trần', ic:'quote', star:1, perm:'nghe_chung', capMo:'chung'},
    {v:'noi-dung-tiep-thi', t:'Nội dung & tiếp thị', h:'Bảy tầng nhận thức — không khai tầng thì không xuất bản · một gốc ra bảy nhánh · bộ lọc quảng cáo bảy mục, bốn mục máy đo ba mục người khai', ic:'search', star:1, perm:'nghe_chung', capMo:'chung'},
    {v:'van-hanh-cham-soc', t:'Vận hành & chăm sóc', h:'Hồ sơ song sinh 23 trường · đèn ba màu tính lúc đọc · nhịp chạm 365 ngày, vùng tử thần ngày 8–12 · sổ dấu vết năm cột, đèn Đỏ phải GỌI', ic:'clock', star:1, perm:'nghe_chung', capMo:'chung'},
    {v:'tai-chinh-ceo', t:'Bảy con số CEO', h:'Bảy con số phải thấy mỗi tuần, chia BA ngăn theo nguồn · số tháng sống được tính trên tiền CỦA HỌC VIỆN · bốn luật tài chính · ba kịch bản viết trước', ic:'star', star:1, perm:'fin_view', capMo:'chung'},
    {v:'con-nguoi', t:'Con người · Ba cửa', h:'Ba cửa của một người mới — Hiến pháp 13/13 · giọng qua hàng rào 10 điểm · ba cuộc gọi có người kèm. Chưa đủ ba cửa thì KHÔNG chạm khách một mình, và cổng nằm ở chỗ ghi lượt chạm chứ không ở màn hình', ic:'shield', star:1, perm:'nghe_chung', capMo:'chung'},
    {v:'phap-ly-rui-ro', t:'Pháp lý & rủi ro', h:'Hai luật có hiệu lực 01/01/2026 — bảy việc của Luật 91 chia theo AI LÀM · ba ô đồng ý tách bạch, ô về con do CHA MẸ ký · nút xoá chạy thật, hai phía đo-được và lời-khai · bốn câu hỏi mang tới luật sư, KHÔNG có câu trả lời', ic:'shield', star:1, perm:'nghe_chung', capMo:'chung'},
    {v:'he-dieu-hanh', t:'Hệ điều hành CEO', h:'GITA-CEO-OS v3.0 — bốn nhịp vận hành, mỗi nhịp có THỜI LƯỢNG · bảng 12 chỉ số chia theo nguồn, chín cửa đo được và ba ô người khai · năm bước quyết định với hai mốc thời gian · năm chặng lộ trình, không nhảy cóc · bốn câu lệnh, câu thứ tư là phép thử', ic:'compass', star:1, perm:'fin_view', capMo:'chung'},
    {v:'bo-prompt', t:'Bộ prompt · 4 vai', h:'Bốn bản dán thẳng A · B · C · D — DỰNG LÚC CHẠY từ kho, không chép sẵn một chữ nào · vai C phải ở nhà cung cấp KHÁC vai A, soạn không tự duyệt được · sáu bước của một nội dung công khai, hai bước cuối là NGƯỜI · nối vào bảy cửa đã chạy sẵn', ic:'quote', star:1, perm:'nghe_chung', capMo:'chung'},
    {v:'bang-gia', t:'Bảng giá', h:'Số sửa được ngay, khung ở kho — giá là con số TẠM trong lúc dựng nên phải sửa được, còn bậc ấy hứa giao gì thì đổi qua một lượt phát hành · mỗi lần đổi là MỘT DÒNG MỚI có người ký và lý do · giá đã chốt vào lịch thu KHÔNG đổi theo · đổi giá không tự dời thang duyệt chi', ic:'star', star:1, perm:'fin_view', capMo:'chung'},
    {v:'luat-giao-dien', t:'Luật giao diện', h:'Mười hai luật phủ quyết sinh ra từ ba mươi phần của khoá học — và răng nằm ở MÁY CHỦ chứ không ở màn hình, vì giao diện là thứ bị viết lại nhiều nhất trong mọi kho · bảy luật có cổng chặn thật, năm luật nói về màn chưa dựng nên được canh bằng phép đo về thứ CHƯA ĐƯỢC TỒN TẠI · không xếp hạng gia đình · không tụt cấp · vòng đỏ không rời máy · máy không soạn hộ lời xin lỗi', ic:'shield', star:1, perm:'nghe_chung', capMo:'chung'},
    {v:'tu-nang-cap', t:'Vòng tự nâng cấp', h:'Một hệ tự nâng cấp mà sửa được chính đường nâng cấp của nó là một hệ KHÔNG CÓ GIỚI HẠN NÀO CẢ — nên bảy vùng không chạm được dựng trước vòng năm cửa · chạm bảy vùng ấy KHÔNG phải "cần duyệt cao hơn", vì mọi cái thang đều leo được · MÁY xếp cấp việc, người đề xuất không tự chọn — để họ tự xếp thì mọi thứ đều là Cấp 1 · cửa chạy thử so HAI MỐC THẬT chứ không đọc một ô tích · đường lùi phải được THỬ, không chỉ được viết', ic:'shield', star:1, perm:'nghe_chung', capMo:'chung'},
    {v:'giam-sat', t:'Trần giám sát', h:'GITA-VIP dựng CÁI TRẦN trước, chưa dựng bộ giám sát — một cái cổng dựng sau một cái cửa đã chạy thì nó chỉ là một lời nhắc · sáu điều CẤM TUYỆT ĐỐI không lệnh nào mở được, kể cả lệnh R01 có chữ ký · ba ngăn phạm vi khác nhau ở CĂN CỨ PHÁP LÝ chứ không ở mức độ · lệnh uỷ quyền phải có hạn và tự thu hồi · sổ nối băm, sửa một dòng là vỡ mọi dòng sau', ic:'shield', star:1, perm:'nghe_chung', capMo:'chung'},
    {v:'supreme', t:'GITA Supreme · bản đồ', h:'Bản đồ ba quyển nghiên cứu của chủ hệ và CÁI TRẦN của chúng — ngăn đầu là BẪY TÊN GỌI: ba thang cùng mang chữ điểm chạm (1.000 tiến độ · 9 cảm xúc · 100.000 hệ thống), và một luật bị phạm thì có người cãi còn hai thang cùng tên thì không ai cãi · bốn chỗ va MỚI, không chép lại sáu điều cấm đã có · hai chỗ phép dò của chính tôi BẮT OAN vì tài liệu đang phê phán chính thứ bị dò · ma trận 28 năng lực · mười lớp điểm chạm · 45/100 phần đã có chữ', ic:'shield', star:1, perm:'nghe_chung', capMo:'chung'},
    {v:'bien-soan-noi-dung', t:'Biên soạn nội dung', h:'Khuôn 24 khối · máy đo · thang năm cổng · hiến pháp nội dung', ic:'book', star:1, perm:'qt_trang', capMo:'chung'},
    {v:'studio', t:'GITA Studio · Xưởng dựng video', h:'Kịch bản · canvas 1080p · giọng người thật · đèn kiểm định · hộ chiếu', ic:'spark', star:1, perm:'qt_trang', capMo:'chung'},
    {v:'tu-hoan-thien', t:'Vòng tự hoàn thiện · lấp kho có cấp phép', h:'Kho rỗng lúc tư vấn thì Bộ não SOẠN từ dữ liệu đã có, KHÔNG bịa — nhưng 入库 (đưa vào kho phục vụ khách) phải qua Bộ phận sản phẩm → Giám đốc → Super Admin · máy soạn không nhập, hai cửa tách hẳn · đủ ba chữ ký hay chưa TÍNH LÚC ĐỌC từ sổ, không cột đãDuyệt · ba cấp ba người khác nhau · sự chậm là có thật và được nói thẳng với khách', ic:'shield', star:1, perm:'nghe_chung', capMo:'chung'},
    {v:'quyen-nang-ai', t:'Quyền năng AI · Super Admin cấp', h:'Super Admin bật/thu MƯỜI chức năng cho AI xử lý công việc · mỗi chức năng TẮT mặc định, chỉ R01 bật, AI không tự bật · bật hay chưa tính LÚC ĐỌC từ sổ, không cột đang-bật · chức năng SOẠN đi qua chuỗi cấp phép ba cấp đã có (trỏ, không dựng cổng thứ hai) · chức năng ĐỌC thì nêu không kết luận · năm cửa chạy thật, năm cái khai chuaCoCua', ic:'shield', star:1, perm:'qt_trang', capMo:'chung'},
    {v:'dieu-phoi', t:'Điều phối trợ lý AI · 100 siêu cấp', h:'Bộ não GITA365 cao nhất, điều phối toàn diện · 100 trợ lý siêu cấp đảm nhận từng cửa thật, mỗi trợ lý MỘT khoá sở hữu nên không xung đột · mọi trợ lý qua đúng cổng (Điều 13 · cấp quyền AI · ba chữ ký), TRỎ chứ không chép luật · tự hoàn thiện đi qua vòng nâng cấp có cổng · ×100 là hướng, không phải chỉ tiêu · sẵn sàng nối tuyến web app nhánh không trùng khoá', ic:'orbit', star:1, perm:'qt_trang', capMo:'chung'},
    {v:'thanh-tra-soi', t:'Mười tổ thanh tra soi', h:'Mười thanh tra ĐỘC LẬP chuyên phá các điểm chưa tốt, mười CẤP × 100 bậc = 1000 bậc tiêu chuẩn liền mạch · mỗi tổ NEO vào một phép soi CÓ THẬT trong mã nguồn (soatRaNgoai · truyHoiHe · capDuyetTheoTien · nhaCuaMinh · xuatDuLieuNha · danhDauXoa · dieuPhoiTroLy · a11yNhan · lapTheVungManh · kiemPhien), không phải một dòng khẩu hiệu — mục 114 đối chiếu tên ấy tồn tại trong tệp, trỏ vào cái tên bịa thì đỏ · cấp cao = hậu quả nặng hơn khi hỏng, cấp 10 là rò dữ liệu một đứa trẻ ra ngoài', ic:'shield', star:1, perm:'qt_trang', capMo:'chung'},
    {v:'kien-truc-thi-giac', t:'Kiến trúc sư thị giác', h:'Đọc màn · tài liệu · đề xuất · kho · hiến pháp · luật thương hiệu', ic:'spark', star:1, perm:'qt_trang', capMo:'chung'},
    {v:'phan-quyen',   t:'Phân công & cấp quyền',      h:'15 vị trí × 31 quyền · bấm ô để đổi', ic:'shield', star:1, perm:'qt_trang', capMo:'quantri'},
    {v:'cap-tai-khoan',t:'Mở tài khoản mới',           h:'Cấp cho vị trí từ Tư vấn trở lên',    ic:'plus', star:1, perm:'qt_trang', capMo:'quantri'},
    {v:'khoa-tai-khoan',t:'Khoá · mở lại · xoá',       h:'Vòng đời một tài khoản, có lý do',    ic:'lock', perm:'qt_trang', capMo:'quantri'},
    {v:'nguoi-dung',   t:'Danh bạ người dùng',         h:'Ai đang ở vị trí nào, hoạt động ra sao',ic:'users', perm:'qt_trang', capMo:'quantri'},
    {v:'sap-xep',     t:'Sắp xếp thư mục',              h:'Đổi thứ tự · ẩn bớt · thêm thư mục mới', ic:'orbit', star:1, perm:'qt_trang', capMo:'quantri'},
    {v:'sua-hien-thi', t:'Sửa nội dung hiển thị',      h:'Chữ nào chưa hợp lý thì sửa ngay',   ic:'book', star:1, perm:'qt_trang', capMo:'quantri'},
    {v:'duyet-tai-lieu',t:'Kiểm duyệt tài liệu',        h:'Xem · chấm chuẩn hoá · duyệt hoặc trả lại',ic:'shield', star:1, perm:'qt_trang', capMo:'quantri'},
    {v:'theo-doi-tai-nguyen',t:'Theo dõi tài nguyên',      h:'Cảnh báo khi một tài khoản chạm quá 20% kho', ic:'chart', perm:'qt_tai_nguyen', capMo:'chung', star:1},
    {v:'soat-day-du',t:'Soát đủ ruột — tự kiểm 100%', h:'5 phép soát · đếm lại từ dữ liệu đang nạp', ic:'shield', star:1, perm:'qt_trang', capMo:'quantri'},
    {v:'tuyen',      t:'Bốn tuyến chuyên môn',       h:'Engwin · Math · SAT · HSA · bảy mốc trước khi hợp nhất', ic:'orbit', star:1, perm:'qt_trang', capMo:'quantri'},
    {v:'quy-trinh-toan-he',t:'Quy trình toàn Web App', h:'8 luồng · từng bước một màn · quyền của cấp quản trị', ic:'map', star:1, perm:'qt_trang', capMo:'quantri'},
    /* Màn này có mã từ lâu mà KHÔNG mục NAV nào trỏ tới và không nút
       nào gọi — bộ dò sâu ở 9.70 tìm ra. Một màn chạy đúng mà vô hình
       thì tệ hơn một màn hỏng: màn hỏng có người báo, màn vô hình thì
       không ai biết để báo.

       Nối vào đâu thì phải nghĩ. Tên nó là "Tài khoản của tôi" nên
       thoạt nhìn là màn cá nhân, mở cho mọi vai. Nhưng đọc mã thì nó
       chứa nút ĐỔI SANG BẤT KỲ VAI NÀO, kể cả Super Admin, và nút ấy
       gọi thẳng doLogin() không canh quyền. Đó là công cụ kiểm thử,
       không phải màn cá nhân — nên khoá qt_trang, đúng như màn anh em
       của nó là "Kiểm thử theo vai" dùng chung cùng nút ấy.

       Bộ kiểm mục 42 đã bắt đúng chỗ này khi tôi thử mở cho mọi vai. */
    {v:'toi',           t:'Tài khoản và đổi vai',      h:'Vai đang dùng · bậc · cổng · quyền đang có và ngoài phạm vi · đổi nhanh sang vai khác để kiểm thử', ic:'home', perm:'qt_trang', capMo:'nghe'},
    {v:'kiem-theo-vai',t:'Kiểm thử theo vai',        h:'Ma trận màn × vai · một cú bấm vào vai bất kỳ', ic:'users', star:1, perm:'qt_trang', capMo:'quantri'},
    {v:'tu-van-hanh', t:'Tự vận hành · tự vá · tự học', h:'4 mức tự động · 10 mục canh · quét thật lúc mở màn', ic:'pulse', star:1, perm:'qt_trang', capMo:'quantri'},
    {v:'nhat-ky-ht',  t:'Nhật ký hệ thống',            h:'Mọi thao tác đều để lại dấu vết',    ic:'book', perm:'qt_trang', capMo:'quantri'}
   ]}
];

/* ══════════ 5. LA BÀN VĂN HOÁ — thanh tab bên phải ══════════ */
G.CULTURE = {
  slogan:'Một gia đình vận hành được — không cần ai canh.',
  sloganSub:'GITA 365 · Hệ Sinh Thái Gia Đình Thịnh Vượng',

  /* TẦM NHÌN và SỨ MỆNH là bản gốc DUY NHẤT của hai câu này. Cổng đăng
     nhập và thanh la bàn đều đọc từ đây qua G.UI.vi (xem cuối src/i18n.js),
     nên sửa ở đây là mọi nơi đổi theo. Trước v7.7 có hai bản tầm nhìn khác
     nhau chạy song song — một ở đây, một ở i18n — và người dùng nhìn thấy
     cả hai cùng lúc trên một màn hình. */
  tamNhin:{
    t:'TẦM NHÌN',
    big:'Kiến tạo một hệ sinh thái gia đình phát triển bền vững, nơi mỗi người biết hiểu mình, rèn mình, làm chủ cuộc đời và cùng nhau kiến tạo hạnh phúc, thành công, thịnh vượng qua nhiều thế hệ.',
    sub:'Nhiều thế hệ, không phải một khoá học. Đích đo bằng đời người, không đo bằng học kỳ.'
  },
  /* Mốc 2030 tách khỏi TẦM NHÌN có chủ ý: tầm nhìn nói về loại thế giới
     muốn tạo ra, mốc nói con số và hạn. Gộp hai thứ vào một chỗ rồi gọi
     chung là "tầm nhìn" thì cái nào cũng đọc không rõ. */
  moc2030:{
    t:'MỐC 2030',
    big:'Đến năm 2030, một triệu người Việt lớn lên trong một gia đình vận hành được — nơi đứa trẻ tự cầm lái đời mình và người lớn cũng đang lớn lên mỗi ngày.',
    sub:'Không phải một triệu đứa trẻ ngoan hơn. Là một triệu gia đình khác đi.'
  },
  suMenh:{
    t:'SỨ MỆNH',
    big:'Trao cho mỗi gia đình một bản đồ, một nhịp và một người đồng hành — để sau 365 ngày, nhà ấy tự chạy được mà không cần ai canh.',
    sub:'Chúng tôi đưa khung và giữ chuẩn. Gia đình lắp phần của mình.'
  },

  /* Kim chỉ nam hành động — sáu nguyên tắc rút từ 25 mô thức gốc */
  kimChiNam:[
    {n:'01',t:'Nhìn đúng trước khi sửa',
     d:'Bảy ngày đầu không chữa gì cả. Chưa có dữ liệu thì mọi giải pháp đều là phỏng đoán có thiện chí.'},
    {n:'02',t:'Can thiệp đúng tầng',
     d:'Nhắc con dậy sớm là can thiệp tầng Hành vi. Nếu nút thắt nằm ở tầng Niềm tin thì nhắc bao nhiêu cũng vô ích.'},
    {n:'03',t:'Đổi lăng kính, đừng tăng âm lượng',
     d:'Đưa dữ liệu ba lần mà nhà chưa thấy vấn đề thì lần thứ tư cũng vậy. Phải cho họ đứng ở chỗ khác mà nhìn.'},
    {n:'04',t:'Không làm thay khâu lắp ráp',
     d:'Gia đình chỉ gắn bó với lộ trình mà chính họ góp tay dựng. Làm hộ cho nhanh là lấy mất thứ giữ họ đi hết một năm.'},
    {n:'05',t:'Neo phải có bằng chứng thật',
     d:'Mọi ghi nhận bắt đầu từ việc đã xảy ra, không từ lời động viên. Neo dựng trên chuyện chưa từng có sẽ gãy ở lần vấp đầu tiên.'},
    {n:'06',t:'Người lớn đổi trước',
     d:'Phần thay đổi của cha mẹ phải trình bày được ở hội nghị cuối năm. Không có phần đó thì chặng của con không giữ nổi.'}
  ],

  /* Bảy giá trị cốt lõi */
  giaTri:[
    {k:'THẬT', c:'#185AB4', t:'Trung thực với dữ liệu',
     d:'Nói bằng số có ngày, có giờ, có số lần. Một ngày lệch nhịp là một dữ kiện, không phải một bản án.',
     nen:'Ghi đúng cả hôm tệ nhất.', khong:'Làm đẹp báo cáo để dễ nhìn.'},
    {k:'THƯƠNG', c:'#BE0E16', t:'Tôn trọng vô điều kiện',
     d:'Không dán nhãn, không xếp hạng, không so đứa này với đứa kia. Mỗi người chỉ so với chính mình chặng trước.',
     nen:'Nghe bảy, khuyên ba.', khong:'Dùng dữ liệu để chứng minh ai đó sai.'},
    {k:'CHUẨN', c:'#185AB4', t:'Giữ chuẩn nghề',
     d:'Mọi buổi làm việc đều có kịch bản, có phác đồ, có cổng nghiệm thu. Ngẫu hứng là rủi ro của gia đình khác.',
     nen:'Mở đúng kịch bản cho đúng tầng.', khong:'Ứng biến ngoài chuẩn vì thấy quen tay.'},
    {k:'BỀN', c:'#0B7350', t:'Nhịp hơn cường độ',
     d:'21 ngày một cấp độ, 90 ngày một chặng. Bùng lên một tuần rồi tắt không tạo ra năng lực nào.',
     nen:'Giữ đúng hẹn dù hôm đó ngắn.', khong:'Dồn việc cả tháng vào một buổi.'},
    {k:'TỎ', c:'#5140B4', t:'Minh bạch tới tận cùng',
     d:'Ai giữ vai gì, ai xem được dữ liệu nào, tiền đi đường nào — nói rõ ngay từ đầu và ghi lại.',
     nen:'Nói trước cả điều bất lợi.', khong:'Để gia đình tự đoán về quyền và chi phí.'},
    {k:'TRAO', c:'#0B6675', t:'Trao quyền kèm trách nhiệm',
     d:'Mỗi lần trao một quyền là kèm một trách nhiệm tương ứng. Hỗ trợ giảm dần, nhưng không bao giờ ép về không.',
     nen:'Để con quyết việc con làm được.', khong:'Buông hết rồi gọi đó là tự lập.'},
    {k:'THỊNH', c:'#F61824', t:'Thịnh vượng là cả nhà cùng lớn',
     d:'Đích không phải thành tích của một đứa trẻ. Đích là một hệ gia đình mà mỗi người trong đó đều đang lớn lên.',
     nen:'Đo cả phần thay đổi của người lớn.', khong:'Lấy điểm số của con làm thước đo gia đình.'}
  ],

  /* Nội quy hệ sinh thái */
  noiQuy:[
    {t:'Đúng hẹn là tôn trọng',      d:'Có mặt đúng nhịp đã cam kết. Bận thì báo trước, không im lặng.'},
    {t:'Nghe trước khi khuyên',      d:'Giữ tỉ lệ nghe bảy khuyên ba trong mọi buổi làm việc và mọi bình luận trong nhóm.'},
    {t:'Nói bằng bằng chứng',        d:'Chia sẻ kết quả thì kèm dữ liệu. Không suy diễn nhân quả khi chưa đủ dữ liệu.'},
    {t:'Không dán nhãn ai',          d:'Mô tả hành vi và hoàn cảnh. Không mô tả con người bằng một tính từ.'},
    {t:'Không xếp hạng gia đình',    d:'Bảng số của một nhà chỉ so với chính nhà đó ở chặng trước.'},
    {t:'Giữ kín chuyện của nhà khác',d:'Mọi thứ nghe được trong buổi chung ở lại trong buổi chung.'},
    {t:'Kể cả chỗ mình vấp',         d:'Chia sẻ chỉ toàn thành công làm người mới thấy mình bất thường.'},
    {t:'Không bán trong nhóm học',   d:'Không chào mời sản phẩm, dịch vụ, cơ hội đầu tư trong không gian đồng hành.'},
    {t:'Không dùng kỹ thuật để ép',  d:'Đọc trạng thái người đối diện là để hiểu và hỗ trợ, không để đẩy ai vào quyết định mua.'},
    {t:'Sai thì sửa công khai',      d:'Đăng nhầm, nói nhầm thì đính chính ở đúng chỗ đã nói, không lặng lẽ xoá.'}
  ],

  /* Văn hoá ứng xử — bốn nhịp trong mọi cuộc trò chuyện khó */
  bonNhip:[
    {t:'NGHE',      d:'Nghe hết câu, không cắt ngang, không chuẩn bị câu trả lời trong lúc người kia đang nói.'},
    {t:'CÔNG NHẬN', d:'Gọi tên đúng một điều người kia đã làm được hoặc đã cố gắng, trước khi nói bất cứ điều gì khác.'},
    {t:'LÀM RÕ',    d:'Hỏi để hiểu, không hỏi để bẫy. Một câu hỏi mở, chờ đủ ba giây im lặng.'},
    {t:'DẪN ĐƯỜNG', d:'Đưa một bước nhỏ làm được ngay hôm nay, kèm cách biết mình đã làm được.'}
  ],

  /* Giá trị mang lại cho cộng đồng */
  choCongDong:[
    {n:'Một bản đồ thay cho lời khuyên rời rạc', d:'Gia đình thôi phải tự ghép mảnh từ hàng trăm nguồn mâu thuẫn nhau.'},
    {n:'Một ngôn ngữ chung trong nhà',           d:'Cả nhà nói cùng một hệ khái niệm: khoang, vai, chặng, cổng, bằng chứng.'},
    {n:'Dữ liệu thay cho tranh cãi',             d:'Bữa cơm không còn là phiên toà. Có bảng số thì không cần đoán ý nhau.'},
    {n:'Một thế hệ trẻ biết tự cầm lái',         d:'Quyền điều hành việc học nằm trong tay chính người học vào cuối chặng bốn.'},
    {n:'Người lớn có chỗ để lớn lên',            d:'Cha mẹ không bị coi là người có lỗi, mà là người đang học một nghề khó.'},
    {n:'Một cộng đồng an toàn để kể thật',       d:'Nơi kể chỗ mình vấp không bị đánh giá, và kể chỗ mình thắng không bị ganh.'}
  ],

  /* Nhịp sống của hệ sinh thái */
  nhip:[
    {k:'MỖI NGÀY',   t:'Một lần check-in, ba dòng nhật ký', c:'#185AB4'},
    {k:'MỖI TUẦN',   t:'Một buổi ngồi lại đủ mặt, bốn nhịp NGHE – CÔNG NHẬN – LÀM RÕ – DẪN ĐƯỜNG', c:'#5140B4'},
    {k:'21 NGÀY',    t:'Một cấp độ học tập · rà lại đòn bẩy đang dùng', c:'#0B6675'},
    {k:'90 NGÀY',    t:'Một chặng · một cổng nghiệm thu có bằng chứng', c:'#0B7350'},
    {k:'365 NGÀY',   t:'Hội nghị gia đình · kỳ tích năm · bảng tầm nhìn bản mới', c:'#BE0E16'}
  ],

  /* Khẩu hiệu ngắn — hiện luân phiên */
  camNiem:[
    {t:'Nhà mình không so với nhà ai. Chỉ so với nhà mình hôm qua.', by:'Ranh giới số 1'},
    {t:'Bảy ngày đầu, mình chưa sửa gì cả. Mình chỉ nhìn cho đúng.', by:'Tầng 1 · Nhận diện'},
    {t:'Đứa trẻ không cần thêm một người quản lý. Nó cần một người đồng hành biết đường.', by:'Kim chỉ nam 04'},
    {t:'Việc nào không nối được về tầm nhìn 5–20 năm thì bỏ.', by:'Băng nền · Định hướng'},
    {t:'Cửa đóng hết thì con không lớn được.', by:'Vai 01 · Người giữ cửa'},
    {t:'Ghi nhận mà không có bằng chứng thì chỉ là lời khen cho vui.', by:'Băng nền · Vinh danh'},
    {t:'Gia đình không loại ai. Người chưa làm được vai của mình cần hỗ trợ, không cần thay thế.', by:'Ranh giới số 3'}
  ]
};
