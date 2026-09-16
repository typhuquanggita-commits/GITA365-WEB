/* ═══════════════════════════════════════════════════════════════
   GITA 365 · CỬA VÀO MỚI — SỔ CHI VÀ KÉT TIỀN MẶT

   ══ NỬA CÒN LẠI CỦA CUỐN SỔ ══

   Tới bản 9.90 hệ này chỉ có tiền VÀO. Bản kê kế toán phải ghi thẳng ra
   rằng nó không cộng được một dòng lợi nhuận nào, vì chi phí vận hành
   không nằm ở đâu cả — và đó là lời thú nhận đúng, nhưng không phải
   một cái đích để dừng lại.

   Ba câu hỏi quyết định chiến lược, không câu nào trả lời được bằng
   doanh thu:

     tháng này lãi hay lỗ
     tầng nào nuôi được chính nó
     thêm một Coach thì hoà vốn ở bao nhiêu nhà

   ══ HAI LUẬT CỦA MỘT KHOẢN CHI ══

   1. NGƯỜI ĐỀ XUẤT KHÔNG TỰ DUYỆT. Cùng luật với phiếu thu, và ở đây
      còn thẳng hơn: tiền đi RA. Một người vừa quyết chi vừa duyệt chi
      là một người có thể lấy tiền ra khỏi Học viện mà không ai đứng
      giữa.

   2. QUÁ MỘT NGƯỠNG THÌ CHỈ GIÁM ĐỐC DUYỆT. Không có ngưỡng thì cấp
      duyệt của một khoản một triệu bằng cấp duyệt của một khoản năm
      trăm triệu, và cái sai đắt nhất đi qua đúng cái cửa dễ nhất.
   ═══════════════════════════════════════════════════════════════ */

import { Kho, tokenMoi } from './nen.js';
import { GIA_KHOI_DAU } from './bang-gia.js';
import { ghiDieuChinh, dungKy } from './bao-cao.js';
import { baoLenCapCao } from './ngan-hang.js';

const BAC = {R01:1,R02:2,R03:3,R04:4,R05:5,R06:6,R07:7,R08:8,
             R09:9,R10:10,R11:11,R12:12,R13:13,R14:14,R15:15};

const dinhDang = n => Number(n).toLocaleString('vi-VN') + 'đ';

/* ══ KHOẢN MỤC LÀ DANH SÁCH TRẮNG ══

   Không phải danh sách cấm. Cho gõ tự do thì sáu tháng sau sổ có
   "thuê mặt bằng", "Thuê mặt bằng", "thue mat bang" và "MB" — bốn
   khoản mục cho một thứ, và không bản tổng hợp nào cộng đúng.

   Thêm khoản mục mới là sửa đúng dòng này, và đó là chỗ nên phải sửa:
   một khoản mục mới là một quyết định về cách Học viện nhìn tiền của
   mình, không phải một ô nhập liệu. */
const KHOAN_MUC = {
  luong:       'Lương và bảo hiểm',
  thuLao:      'Thù lao ngoài lương (không gồm hoa hồng đại sứ)',
  matBang:     'Thuê mặt bằng, điện nước',
  haTang:      'Hạ tầng, phần mềm, tên miền',
  tiepThi:     'Tiếp thị và truyền thông',
  daoTao:      'Đào tạo và tài liệu',
  vanPhong:    'Văn phòng phẩm và thiết bị',
  khauHao:     'Khấu hao',
  thue:        'Thuế và lệ phí đã nộp',
  khac:        'Khác'
};

const HINH_THUC = ['chuyenKhoan', 'tienMat', 'the'];

/* ═══════════════════════════════════════════════════════════════
   NĂM NẤC THANG DUYỆT CHI

   ══ MỖI NẤC NEO VÀO MỘT CON SỐ CÓ THẬT CỦA HỌC VIỆN ══

   Một thang duyệt chi bịa ra bằng những con số tròn — 10 triệu, 50
   triệu — thì sáu tháng sau không ai nhớ vì sao lại là 10 chứ không
   phải 15, và lúc cần đổi thì đổi bừa.

   Nên mỗi nấc ở đây neo vào GIÁ MỘT GÓI HỌC PHÍ, và câu hỏi của từng
   nấc trở thành câu Học viện thật sự quan tâm:

     KHOẢN CHI NÀY ĂN HẾT HỌC PHÍ CỦA BAO NHIÊU NHÀ.

     N1  dưới 1,5 triệu    ≈ ba gói T2        — tiền lặt vặt
     N2  1,5 → dưới 10tr   dưới một gói T3    — chi thường
     N3  10 → dưới 30tr    một gói T3         — bằng cả năm học của một nhà
     N4  30 → dưới 50tr    một gói T4         — bằng trọn hành trình một nhà
     N5  từ 50 triệu       một gói T5         — bằng gói cao nhất Học viện bán

   Neo như thế thì thang tự có nghĩa, và ngày Học viện đổi giá gói thì
   phép soi neo ở soatNeoThang() báo đỏ — người quyết định lại là chủ hệ
   thống, không phải cái thang tự trôi theo.

   ══ NẤC TRÊN CÙNG ĐÒI HAI CHỮ KÝ, KHÔNG PHẢI MỘT CHỮ KÝ CAO HƠN ══

   Đây là chỗ bản 9.92 làm chưa đúng và tôi sửa ở đây.

   Tầng tài chính của Học viện chỉ có BA vai: R01 Super Admin, R02 Admin
   hệ thống, R03 Giám đốc. Bắt khoản lớn phải "lên cấp cao hơn" bên
   trong ba vai ấy nghe thì chặt mà thật ra không thêm được lớp nào —
   và nó còn sai về tổ chức, vì nó đặt người quản trị kỹ thuật lên trên
   Giám đốc ở chuyện tiền.

   Thang thật leo bằng SỐ NGƯỜI và bằng BẰNG CHỨNG:

     N1  không ai duyệt          — một người ghi thẳng
     N2  một người duyệt         — khác người ghi
     N3  một người duyệt         + hoá đơn
     N4  một người duyệt         + hoá đơn + 2 báo giá
     N5  HAI người duyệt         + hoá đơn + 3 báo giá + hợp đồng

   ══ CẤP DUYỆT THEO GỘP, BẰNG CHỨNG THEO TỪNG KHOẢN ══

   Phép soi chia nhỏ ở 9.92 chỉ đẩy khoản chi qua một cái ngưỡng duy
   nhất. Nay nó chạy trên cả thang: cộng dồn bảy ngày tới nấc nào thì
   khoản ấy phải duyệt theo nấc ấy. Chia một hợp đồng 60 triệu thành
   bốn khoản 14 triệu thì cả bốn rơi vào N5, không phải N3.

   Nhưng BẰNG CHỨNG thì theo số tiền của TỪNG KHOẢN, không theo gộp:
   không ai lấy được ba báo giá cho "cả tuần". Đòi thế là đòi một thứ
   không tồn tại, và một luật không làm nổi thì người ta học cách đi
   vòng qua nó.

   ══ THANG CHU KỲ — CỘT NGANG, VÀ AI XÁC NHẬN ══

   Chốt của chủ hệ thống bản 9.95 và 9.97:

     "Tổng các khoản chi cần tổng hợp lại. Tổng chi theo chu kỳ là 10
      triệu đồng là phải báo cáo xác minh, duyệt chi đầy đủ, để ngăn
      chặn thất thoát tự do các khoản chi nhỏ."

     "Khi tổng chi phí đạt 10 triệu theo chu kỳ cần có xác nhận của
      giám đốc. Tạo các mốc phê duyệt để có thể cấp quyền hạn phê duyệt
      (10 – 15 – 20 – 50 – 80 – 100 triệu là tổng tiền mỗi chu kỳ)."

   Chủ hệ chỉ đúng một lỗ thủng trong phép soi chia nhỏ tôi dựng ở
   9.92: NÓ CHỈ CỘNG TRONG MỘT KHOẢN MỤC. Rải 1,4 triệu qua bốn khoản
   mục thì mỗi cột đều sạch. Đó đúng là "thất thoát tự do các khoản chi
   nhỏ", và phép soi ấy mù vì nó nhìn theo cột DỌC.

   Thang chu kỳ nhìn theo cột NGANG: tổng MỌI khoản chi của MỘT người
   trong MỘT chu kỳ, cộng qua tất cả khoản mục. Tổng ấy leo tới mốc nào
   thì khoản chi phải được VAI CỦA MỐC ẤY xác nhận.

     C0  dưới 10tr   — Kế toán
     C1  từ 10tr     — Giám đốc
     C2  từ 15tr     — Giám đốc, và thêm một chữ ký nữa ở tầng tài chính
     C3  từ 20tr     — Admin hệ thống
     C4  từ 50tr     — Admin hệ thống, và thêm một chữ ký nữa
     C5  từ 80tr     — Super Admin
     C6  từ 100tr    — Super Admin, và thêm một chữ ký nữa

   Thang leo hai chiều cùng lúc — CẤP lên R03 → R02 → R01, và SỐ CHỮ KÝ
   thêm một ở mỗi mốc chẵn. Leo một chiều thì tới mốc thứ tư đã hết
   cấp để leo, và ba mốc cuối thành ba cái tên cho cùng một luật.

   ══ CHU KỲ LÀ TUẦN ══

   Chốt của chủ hệ. Khớp nhịp chốt sổ ở 9.90 — tuần chốt xong là con số
   đứng yên, nên trần tính trên một khoảng đã đóng chứ không trên một
   khoảng còn động.

   ══ HAI PHÉP SOI, HAI KIỂU LỌT KHÁC NHAU ══

     gộp 7 ngày theo khoản mục — bắt CHIA NHỎ,   một cột, ngưỡng thấp
     thang chu kỳ theo người   — bắt KHỐI LƯỢNG, cả bảng, sáu mốc

   Không cái nào thay được cái kia.

   ══ BẰNG CHỨNG THEO TỪNG KHOẢN, CẤP DUYỆT THEO GỘP ══

   Không ai lấy được ba báo giá cho "cả tuần". Đòi thế là đòi một thứ
   không tồn tại, và một luật không làm nổi thì người ta học cách đi
   vòng qua nó — rồi đi vòng luôn cả những luật làm được.
   ═══════════════════════════════════════════════════════════════ */

const NGAY_GOP = 7;

/* Chu kỳ cộng tổng chi. Chốt của chủ hệ thống bản 9.97: TUẦN. Khớp
   nhịp chốt sổ ở 9.90 — tuần chốt xong là con số đứng yên, nên trần
   tính trên một khoảng đã đóng chứ không trên một khoảng còn động. */
const CHU_KY = 'tuan';

const NAC_THANG = [
  {ma: 'N1', ten: 'Tiền lặt vặt',      tu: 0,        den: 1500000,
   neo: 'ba gói T2',            soDuyet: 0,
   canHoaDon: false, soBaoGia: 0, canHopDong: false,
   viec: 'Một người ghi thẳng vào sổ. Không phải chờ ai.'},

  {ma: 'N2', ten: 'Chi thường',        tu: 1500000,  den: 10000000,
   neo: 'dưới một gói T3',      soDuyet: 1,
   canHoaDon: false, soBaoGia: 0, canHopDong: false,
   viec: 'Một người duyệt, khác người ghi.'},

  {ma: 'N3', ten: 'Bằng học phí một nhà cả năm', tu: 10000000, den: 30000000,
   neo: 'một gói T3',           soDuyet: 1,
   canHoaDon: true,  soBaoGia: 0, canHopDong: false,
   viec: 'Một người duyệt, và phải có hoá đơn.'},

  {ma: 'N4', ten: 'Bằng trọn hành trình một nhà', tu: 30000000, den: 50000000,
   neo: 'một gói T4',           soDuyet: 1,
   canHoaDon: true,  soBaoGia: 2, canHopDong: false,
   viec: 'Một người duyệt, hoá đơn, và ít nhất hai báo giá để so.'},

  {ma: 'N5', ten: 'Bằng gói cao nhất Học viện bán', tu: 50000000, den: Infinity,
   neo: 'một gói T5',           soDuyet: 2,
   canHoaDon: true,  soBaoGia: 3, canHopDong: true,
   viec: 'HAI người duyệt, cả hai khác người ghi, hoá đơn, ba báo giá và hợp đồng.'}
];

/* Chốt của chủ hệ thống bản 9.92: "các khoản chi trên 1,5 triệu đồng
   đều phải khai báo xin cấp duyệt chi." Đọc là TỪ 1,5 triệu trở lên —
   đọc là "lớn hơn" thì có đúng một khoản lọt qua ở mép ngưỡng, và mép
   ngưỡng là chỗ người ta nhắm vào. */
const TRAN_PHAI_DUYET = NAC_THANG[1].tu;

/* ══ SÁU MỐC CHU KỲ ══
   Con số của chủ hệ thống, bản 9.97. Mốc đầu neo vào giá gói T3 — cùng
   cái neo với nấc N3 — nên soatNeoThang() soi được nó. */
const MOC_CHU_KY = [
  {ma: 'C0', tu: 0,         vai: 'keToan', tenVai: 'Kế toán',        themChuKy: 0,
   viec: 'Kế toán nhận báo cáo và phê duyệt.'},
  {ma: 'C1', tu: 10000000,  vai: 'R03',    tenVai: 'Giám đốc',       themChuKy: 0,
   viec: 'Giám đốc xác nhận.'},
  {ma: 'C2', tu: 15000000,  vai: 'R03',    tenVai: 'Giám đốc',       themChuKy: 1,
   viec: 'Giám đốc xác nhận, và thêm một chữ ký nữa ở tầng tài chính.'},
  {ma: 'C3', tu: 20000000,  vai: 'R02',    tenVai: 'Admin hệ thống', themChuKy: 0,
   viec: 'Admin hệ thống xác nhận.'},
  {ma: 'C4', tu: 50000000,  vai: 'R02',    tenVai: 'Admin hệ thống', themChuKy: 1,
   viec: 'Admin hệ thống xác nhận, và thêm một chữ ký nữa.'},
  {ma: 'C5', tu: 80000000,  vai: 'R01',    tenVai: 'Super Admin',    themChuKy: 0,
   viec: 'Super Admin xác nhận.'},
  {ma: 'C6', tu: 100000000, vai: 'R01',    tenVai: 'Super Admin',    themChuKy: 1,
   viec: 'Super Admin xác nhận, và thêm một chữ ký nữa.'}
];

const TRAN_CHU_KY = MOC_CHU_KY[1].tu;

/** Mốc của một tổng chu kỳ. */
function mocCua(tong) {
  for (let i = MOC_CHU_KY.length - 1; i >= 0; i--)
    if (tong >= MOC_CHU_KY[i].tu) return MOC_CHU_KY[i];
  return MOC_CHU_KY[0];
}

/* ══ CẤP NGƯỜI DUYỆT TỐI THIỂU CHO MỘT KHOẢN RÚT TIỀN (9.99.117) ══
   Hoàn tiền · hoa hồng · lương là TIỀN RA khỏi Học viện, y như chi trực
   tiếp. Nhưng tới 9.99.116 ba cửa ấy chỉ đòi R01–R03 duyệt BẤT KỂ số tiền:
   một Giám đốc R03 duyệt một khoản hoàn 90 triệu bằng ĐÚNG MỘT chữ ký,
   trong khi chi trực tiếp 90 triệu đòi Super Admin (mốc C5). Đợt thanh tra
   $500M nêu đây là đường rút tiền lớn không ai đủ thẩm quyền nhìn.

   Đóng lỗ bằng cách DÙNG LẠI đúng thang MOC_CHU_KY đã chốt — KHÔNG đặt
   ngưỡng mới: cấp người duyệt một khoản rút tính theo chính số tiền của nó,
   như thể nó là một mốc chu kỳ. Dưới 10tr (C0 'keToan') giữ nguyên R01–R03;
   từ 10tr → R03, 20tr → R02, 80tr → R01. Trả về vai bắt buộc và BẬC của nó
   để cửa so BAC[hoSo.role] <= bac. */
export function capDuyetTheoTien(soTien) {
  const m = mocCua(Number(soTien) || 0);
  const vai = m.vai === 'keToan' ? 'R03' : m.vai;  // C0: mọi người duyệt tài chính là đủ
  return { vai, tenVai: m.tenVai, moc: m.ma, bac: BAC[vai] || 3 };
}

/* ═══════════════════════════════════════════════════════════════
   PHÒNG KẾ TOÁN – TÀI CHÍNH

   Chủ hệ thống chốt bản 9.97: "Hiện tại chưa có phòng kế toán – tài
   chính trên hệ thống. Lập trình tạo vị trí này, và toàn bộ các phần
   liên quan tài chính được chuyển tới vị trí này làm việc."

   ══ VÌ SAO KHÔNG THÊM HAI VAI VÀO G.ROLES ══

   Bảng vai R01–R15 là MỘT TRỤC THẲNG: lv càng nhỏ càng nhiều quyền,
   chạy từ Super Admin xuống Học viên. Mọi cổng trong hệ neo vào lv —
   trần xem hồ sơ khách, bậc mở kho nghề, quyền điều hành.

   Kế toán trưởng KHÔNG nằm được trên trục ấy:

     đặt cao (lv 3) → có luôn quyền xem hồ sơ khách tầng 4-5 và toàn bộ
                      kho nghề, những thứ không liên quan gì tới việc
                      của họ
     đặt thấp (lv 16) → không ký nổi một khoản chi nào

   Chèn vào giữa thì phải đánh số lại cả thang, và mỗi chỗ chặn neo vào
   lv là một chỗ có thể quên. Chỗ quên không báo lỗi — nó im lặng mở ra.

   Nên PHÒNG TÀI CHÍNH LÀ MỘT TRỤC RIÊNG, vuông góc với trục vai. Một
   người có một vai (chức vụ trong Học viện) và có thể có thêm một VỊ
   TRÍ trong phòng tài chính. Hai thứ cộng lại, không thay nhau.

   ══ VÀ ĐÂY CŨNG LÀ CHỖ CHẶT NHẤT VỀ BẢO MẬT ══

   Vị trí trong phòng tài chính mở đúng những cửa TIỀN, và KHÔNG mở
   thêm một cửa dữ liệu khách nào. Một kế toán viên vốn là Giáo viên
   (R08) thì sau khi được cấp vẫn không xem được hồ sơ khách hàng —
   phép đo ở bộ thử giữ đúng chỗ ấy.

   Đó là điểm khác căn bản với cách thêm vai: thêm vai thì quyền đi
   theo cả gói, còn cấp vị trí thì quyền đi theo đúng việc.
   ═══════════════════════════════════════════════════════════════ */

/* ══ BA VỊ TRÍ, VÀ VÌ SAO TÁCH THU KHỎI CHI ══

   Chủ hệ chốt bản 9.97: kế toán trưởng, kế toán THU, kế toán CHI.

   Tách hai đầu tiền không phải để có thêm chức danh. Đó là lớp kiểm
   soát cổ nhất và còn hiệu lực nhất của nghề kế toán: NGƯỜI GHI NHẬN
   TIỀN VÀO KHÔNG ĐƯỢC LÀ NGƯỜI DUYỆT TIỀN RA.

   Gộp hai đầu vào một người thì người ấy dựng được một vòng khép kín
   mà không ai đứng ngoài: ghi một phiếu thu không có thật để tổng thu
   trông đủ, rồi duyệt một khoản chi mang tiền ấy đi. Mỗi bước đều đúng
   luật, sổ vẫn cân, và không phép soi nào trong hệ này bắt được — vì
   cả hai bước đều có chữ ký hợp lệ của cùng một người.

   Tách ra thì cái vòng ấy cần HAI người đồng ý, và đó là cả sự khác
   biệt.

   Kế toán trưởng giữ cả hai đầu — nhưng đó là một người, một chức danh
   có tên, và mọi lượt ký của họ đều nằm trong nhật ký. Tập trung có
   kiểm soát khác hẳn với gộp vì tiện tay.

   Danh sách trắng: tên nào không có ở đây là không cấp được, kể cả một
   vị trí nghe rất hợp lý mà chưa ai chốt. */
const VI_TRI_TC = {
  keToanThu: {
    ten: 'Kế toán thu',
    dau: 'thu',
    viec: 'Duyệt phiếu thu, theo dõi công nợ, nhắc thu, đối chiếu sao kê. ' +
          'KHÔNG duyệt được khoản chi nào.'
  },
  keToanChi: {
    ten: 'Kế toán chi',
    dau: 'chi',
    viec: 'Duyệt khoản chi dưới mốc, giữ sổ chi, đếm và chốt két. ' +
          'KHÔNG duyệt được phiếu thu nào.'
  },
  keToanTruong: {
    ten: 'Kế toán trưởng',
    dau: 'ca-hai',
    viec: 'Cả hai đầu tiền, cộng quyền xác nhận tổng chi chu kỳ tới MỐC ĐƯỢC ' +
          'CẤP. Đây là chỗ chủ hệ chuyển quyền khi dòng tiền lớn.'
  },
  quanLyPhong: {
    ten: 'Quản lý phòng tài chính',
    dau: 'quan-ly',
    viec: 'Cấp và thu hồi vị trí trong phòng tài chính. KHÔNG tự nó cho quyền ' +
          'ký một khoản tiền nào — quản người, không quản tiền.'
  }
};

/* ══ PHÒNG TÀI CHÍNH TRỰC THUỘC AI ══

   Chủ hệ chốt bản 9.98: "Phòng tài chính này trực thuộc quản lý của
   Super Admin, Giám đốc, Admin hệ thống (quyền cho Giám đốc, Admin hệ
   thống do Super Admin cấp)."

   Nên ba bậc, không phải một:

     R01 Super Admin  — quản lý phòng ĐƯƠNG NHIÊN, không ai cấp cho
     R02, R03         — quản lý được KHI Super Admin cấp quyền quanLyPhong
     mọi vai khác     — không

   Bản 9.97 tôi cho R01 và R02 quyền đương nhiên và chặn hẳn R03. Sai
   hai đầu: R02 không nên có sẵn quyền ấy mà không ai cấp, còn Giám đốc
   thì chính là người chịu trách nhiệm tăng trưởng và phải quản được
   phòng tiền của mình.

   ══ VÀ MỘT LUẬT KHÔNG ĐỔI: KHÔNG AI TỰ CẤP CHO MÌNH ══

   Người quản lý phòng cấp được vị trí cho người khác, nhưng KHÔNG cấp
   được cho chính mình. Tự cấp là tự nới cổng của chính mình, và cái
   cổng ấy sinh ra để đứng giữa mình với tiền. */
function quanLyDuocPhong(role, quyen) {
  if (role === 'R01') return true;
  if ((role === 'R02' || role === 'R03') && quyen.quanLyPhong) return true;
  return false;
}

/** Người này có đứng ở đầu tiền ấy không — 'thu' hay 'chi'. */
export function oDauTien(quyen, dau) {
  if (quyen.keToanTruong) return true;
  return dau === 'thu' ? !!quyen.keToanThu : !!quyen.keToanChi;
}

export async function quyenCua(db, username) {
  const r = await db.prepare(
    'SELECT chucNang, mocToiDa, hetHan FROM quyenTaiChinh ' +
    'WHERE username = ? AND thuHoiLuc IS NULL'
  ).bind(username).all();
  const bay = new Date().toISOString();
  const q = {keToanThu: false, keToanChi: false, keToanTruong: false,
             quanLyPhong: false, mocToiDa: null};
  for (const x of (r.results || [])) {
    /* Quyền hết hạn thì TỰ TẮT. Một quyền chỉ mất khi có người chủ
       động gỡ là một quyền sẽ ở lại mãi — cùng luật với giấy phép xem
       hồ sơ khách. */
    if (x.hetHan && x.hetHan <= bay) continue;
    q[x.chucNang] = true;
    if (x.chucNang === 'keToanTruong' && x.mocToiDa) q.mocToiDa = x.mocToiDa;
  }
  return q;
}

/** Người này đủ tư cách xác nhận ở mốc ấy chưa.

    Hai đường: đúng vai cố định của mốc, HOẶC là kế toán trưởng được cấp
    hạn mức tới mốc ấy trở lên. Đường thứ hai là chỗ chủ hệ chuyển quyền
    khi dòng tiền lớn. */
function duTuCachMoc(moc, role, quyen) {
  if (moc.vai === 'keToan') return oDauTien(quyen, 'chi') || (BAC[role] || 99) <= 3;
  if (role === moc.vai) return true;
  /* Vai CAO HƠN vai của mốc thì đương nhiên xác nhận được: R01 ký thay
     R03 là chuyện bình thường, chặn nó lại là chặn nhầm hướng. */
  if ((BAC[role] || 99) < (BAC[moc.vai] || 99)) return true;
  if (quyen.keToanTruong && quyen.mocToiDa) {
    const i = MOC_CHU_KY.findIndex(x => x.ma === moc.ma);
    const j = MOC_CHU_KY.findIndex(x => x.ma === quyen.mocToiDa);
    return j >= i;
  }
  return false;
}

/** Nấc của một số tiền. Biên DƯỚI tính vào nấc trên: 10 triệu chẵn là
    N3, không phải N2. */
function nacCua(tien) {
  for (let i = NAC_THANG.length - 1; i >= 0; i--)
    if (tien >= NAC_THANG[i].tu) return NAC_THANG[i];
  return NAC_THANG[0];
}

/* ══ PHÉP SOI NEO ══

   Thang neo vào giá gói. Giá gói đổi mà thang đứng yên thì cái neo
   thành lời nói suông — và tệ hơn, chú giải ở trên thành lời nói sai.

   Phép này KHÔNG tự dời thang theo giá: dời thang là quyết định của chủ
   hệ thống. Nó chỉ nêu ra rằng neo đã lệch, để người quyết biết mà
   quyết. Bộ thử gọi nó và đỏ khi có lệch. */
export function soatNeoThang(giaDangChay) {
  /* Nhận giá ĐANG CHẠY nếu người gọi đọc được; không có thì lùi về giá
     khởi đầu. Từ 9.99.73 giá sửa được ở màn hình, nên phép soi này phải
     so thang với con số THẬT — so với hằng số thì nó báo khớp mãi mãi
     trong khi cái neo đã trôi, và đó đúng là chỗ nguy hiểm nhất: một
     phép kiểm hỏng mà vẫn báo xanh. */
  const g = (giaDangChay && typeof giaDangChay === 'object')
    ? giaDangChay : GIA_KHOI_DAU;
  const neo = {N3: g[3], N4: g[4], N5: g[5]};
  const lech = [];
  for (const n of NAC_THANG) {
    if (neo[n.ma] === undefined) continue;
    if (Number(n.tu) !== Number(neo[n.ma]))
      lech.push({nac: n.ma, thangDangDe: n.tu, giaGoiBayGio: neo[n.ma], neo: n.neo});
  }
  if (Number(MOC_CHU_KY[1].tu) !== Number(g[3]))
    lech.push({nac: 'C1', thangDangDe: MOC_CHU_KY[1].tu,
      giaGoiBayGio: g[3], neo: 'một gói T3'});
  return {khop: lech.length === 0, lech,
    vi: 'Mỗi nấc neo vào giá một gói học phí, và trần chu kỳ neo vào gói T3. ' +
        'Giá gói đổi thì thang phải được CHỦ HỆ THỐNG chốt lại — phép này nêu ra ' +
        'chỗ lệch, không tự dời thang.'};
}

/* ═══════════════ GHI MỘT KHOẢN CHI ═══════════════

   Một cửa, hai lối. Dưới ngưỡng thì khoản chi vào thẳng sổ; từ ngưỡng
   trở lên nó nằm chờ duyệt. Người ghi không phải chọn lối — máy chọn
   theo số tiền, vì để người ghi tự chọn là để họ chọn lối dễ. */
export async function ghiChi(y, env, db, hoSo) {
  const lv = BAC[hoSo.role] || 99;
  if (lv > 5) return {ok: false, code: 'NOPERM',
    error: 'Từ R01–R05 mới ghi được khoản chi.'};

  const c = y.chi || {};
  const muc = String(c.khoanMuc || '').trim();
  const tien = Number(c.soTien || 0);
  const dienGiai = String(c.dienGiai || '').trim();
  const hinhThuc = String(c.hinhThuc || '').trim();

  if (!KHOAN_MUC[muc]) return {ok: false,
    error: 'Khoản mục phải là một trong: ' + Object.keys(KHOAN_MUC).join(', ') + '.'};
  if (!(tien > 0)) return {ok: false, error: 'Số tiền chi phải lớn hơn 0.'};
  if (HINH_THUC.indexOf(hinhThuc) < 0) return {ok: false,
    error: 'Hình thức chi phải là một trong: ' + HINH_THUC.join(', ') + '.'};

  /* DIỄN GIẢI LÀ BẮT BUỘC. Một khoản chi không nói rõ chi cho việc gì
     thì sang năm không ai dựng lại được câu chuyện, và lúc bị hỏi thì
     người phải trả lời là người ký duyệt chứ không phải cái sổ. */
  if (dienGiai.length < 5) return {ok: false,
    error: 'Chưa nói rõ chi cho việc gì. Một khoản tiền ra khỏi Học viện mà ' +
           'không có diễn giải thì sang năm không ai dựng lại được câu chuyện.'};

  /* NGÀY CHI LÀ MỐC TIỀN RA, KHÔNG PHẢI MỐC NHẬP LIỆU.

     Nhập bù một khoản chi của tháng trước là chuyện thường; ghi nó vào
     hôm nay là đẩy chi phí sang sai kỳ, và bản kê hai tháng đều sai. */
  const ngayChi = String(c.ngayChi || '').trim() || new Date().toISOString();
  if (isNaN(new Date(ngayChi).getTime()))
    return {ok: false, error: 'Ngày chi không đọc được.'};
  if (new Date(ngayChi).getTime() > Date.now() + 86400000)
    return {ok: false, error: 'Ngày chi nằm ở tương lai. Khoản chi ghi khi tiền đã ra.'};

  /* ══ KHOẢN NÀY Ở NẤC NÀO ══

     Hai nấc, hai vai trò khác nhau:

       nacTien  — nấc của RIÊNG khoản này. Quyết định BẰNG CHỨNG phải
                  có, vì bằng chứng gắn với một lần mua.
       nacGop   — nấc của tổng bảy ngày. Quyết định CẤP DUYỆT, vì đây
                  là chỗ chặn chia nhỏ.

     Nấc THẬT áp cho khoản này là nấc cao hơn trong hai nấc ấy. */
  const gop = await gopBayNgay(db, muc, hoSo.u, ngayChi);
  const nacTien = nacCua(tien);
  const nacGop  = nacCua(gop + tien);
  const nac = NAC_THANG.indexOf(nacGop) > NAC_THANG.indexOf(nacTien) ? nacGop : nacTien;

  /* ── TRẦN CHU KỲ: PHÉP SOI NHÌN THEO CỘT NGANG ──

     Phép gộp ở trên nhìn theo cột DỌC — một khoản mục. Nó không thấy
     người rải tiền ngang qua nhiều khoản mục, mỗi chỗ một ít. Trần này
     cộng MỌI khoản mục của một người trong chu kỳ. */
  const chuKy = await tongChuKy(db, hoSo.u, ngayChi);
  const chamTran = (chuKy.tong + tien) >= TRAN_CHU_KY;

  /* ── BẰNG CHỨNG THEO nacTien, KHÔNG THEO nacGop ──

     Không ai lấy được ba báo giá cho "cả tuần". Đòi thế là đòi một thứ
     không tồn tại, và một luật không làm nổi thì người ta học cách đi
     vòng qua nó — rồi đi vòng luôn cả những luật làm được. */
  const baoGia = Array.isArray(c.baoGia)
    ? c.baoGia.map(x => String(x).slice(0, 300)).filter(Boolean) : [];
  const hopDong = String(c.soHopDong || '').trim();
  const thieu = [];
  if (nacTien.canHoaDon && !c.coHoaDon) thieu.push('hoá đơn');
  if (baoGia.length < nacTien.soBaoGia)
    thieu.push('đủ ' + nacTien.soBaoGia + ' báo giá (đang có ' + baoGia.length + ')');
  if (nacTien.canHopDong && !hopDong) thieu.push('số hợp đồng');
  if (thieu.length)
    return {ok: false, code: 'THIEUCHUNGTU',
      nac: nacTien.ma,
      error: 'Khoản ' + dinhDang(tien) + ' thuộc nấc ' + nacTien.ma + ' — ' +
        nacTien.ten + '. Nấc này còn thiếu: ' + thieu.join(', ') + '.',
      nacNay: {ma: nacTien.ma, ten: nacTien.ten, viec: nacTien.viec}};

  /* ══ KHÔNG CÒN LỐI TỰ GHI ══

     Chốt của chủ hệ thống bản 9.97: "Các khoản chi nhỏ dưới 1,5 triệu
     do bộ phận quản lý kế toán chịu trách nhiệm nhận báo cáo, phê
     duyệt. Từng đồng liên quan chi phí đều có bộ phận, có người chịu
     trách nhiệm quản lý."

     Bản 9.92 cho khoản dưới 1,5 triệu ghi thẳng vào sổ, một người, không
     ai ký. Nay không còn: MỌI khoản chi đều nằm chờ duyệt, và khoản
     dưới 1,5 triệu thì người duyệt là KẾ TOÁN.

     Cái mất là sự nhanh; cái được là câu "từng đồng có người chịu trách
     nhiệm" trở thành đúng theo nghĩa đen, tra được bằng một câu lệnh. */
  const mocGio = mocCua(chuKy.tong + tien);

  const id = 'CP-' + tokenMoi().slice(0, 14);
  const luc = new Date().toISOString();
  const coHoaDon = c.coHoaDon ? 1 : 0;

  await db.prepare(
    'INSERT INTO chiPhi (id,khoanMuc,soTien,ngayChi,hinhThuc,nhaCungCap,coHoaDon,' +
    'maHoaDon,minhChung,dienGiai,nguoiDeXuat,deXuatLuc,trangThai,tuGhi,nguoiDuyet,' +
    'duyetLuc,nac,baoGia,soBaoGia,soHopDong) ' +
    'VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)'
  ).bind(id, muc, tien, ngayChi, hinhThuc,
    String(c.nhaCungCap || '').slice(0, 200) || null, coHoaDon,
    coHoaDon ? (String(c.maHoaDon || '').slice(0, 100) || null) : null,
    String(c.minhChung || '').slice(0, 300) || null,
    dienGiai.slice(0, 1000), hoSo.u, luc,
    'choDuyet', 0, null, null,
    nac.ma, baoGia.length ? JSON.stringify(baoGia) : null, baoGia.length,
    hopDong.slice(0, 100) || null).run();

  await Kho.ghiNhatKy(db, {uid: hoSo.uid, username: hoSo.u, viec: 'CHI_DEXUAT',
    doiTuong: id, chiTiet: KHOAN_MUC[muc] + ' · ' + dinhDang(tien) +
      ' · nấc ' + nac.ma + ' · mốc ' + mocGio.ma +
      (coHoaDon ? ' · có hoá đơn' : ' · KHÔNG hoá đơn') +
      (gop ? ' · gộp 7 ngày ' + dinhDang(gop + tien) : '')});

  return {ok: true, id, khoanMuc: muc, soTien: tien, trangThai: 'choDuyet',
    nac: nac.ma, tenNac: nac.ten,
    /* Số chữ ký = của NẤC KHOẢN, cộng thêm phần MỐC CHU KỲ đòi. Hai
       thang chồng lên nhau chứ không thay nhau: một khoản 60 triệu ở
       tuần đã tiêu 100 triệu cần cả ba chữ ký. */
    canMayNguoiDuyet: Math.max(1, nac.soDuyet) + mocGio.themChuKy,
    gopBayNgay: gop + tien,
    chuKy: {ky: chuKy.ky, daChi: chuKy.tong + tien,
      moc: mocGio.ma, vaiXacNhan: mocGio.tenVai, viec: mocGio.viec},
    vi: nac.viec + (mocGio.ma === 'C0'
      ? ' Khoản dưới ' + dinhDang(TRAN_PHAI_DUYET) + ' thì người duyệt là KẾ TOÁN.'
      : ' Tuần này đã chi ' + dinhDang(chuKy.tong + tien) + ' — mốc ' + mocGio.ma +
        ': ' + mocGio.viec)};
}

/* ── TỔNG CHI CỦA MỘT NGƯỜI TRONG MỘT CHU KỲ ──

   Cộng MỌI khoản mục, khác hẳn phép gộp bảy ngày ở dưới. Chu kỳ là
   TUẦN theo giờ Việt Nam — dùng chung phép dựng kỳ với cả sổ báo cáo,
   nên tuần ở đây và tuần đã chốt ở bản kế toán là cùng một khoảng.

   Chỉ cộng khoản còn hiệu lực: khoản bị từ chối hay bị huỷ không phải
   tiền đã ra, nên không được đẩy người ta chạm trần vì một khoản đã bỏ. */
async function tongChuKy(db, nguoi, ngayChi) {
  const k = dungKy(CHU_KY, new Date(new Date(ngayChi).getTime() + 7 * 3600e3)
    .toISOString().slice(0, 10));
  const r = await db.prepare(
    'SELECT COALESCE(SUM(soTien),0) t, COUNT(*) n FROM chiPhi ' +
    'WHERE nguoiDeXuat = ? AND ngayChi >= ? AND ngayChi <= ? ' +
    "AND trangThai IN ('daDuyet','choDuyet')"
  ).bind(nguoi, k.tuLuc, k.denLuc).first();
  return {ky: k.ky, tong: Number(r.t), so: Number(r.n), tuLuc: k.tuLuc, denLuc: k.denLuc};
}

async function gopBayNgay(db, khoanMuc, nguoi, ngayChi) {
  const moc = new Date(ngayChi).getTime();
  const tu = new Date(moc - NGAY_GOP * 86400000).toISOString();
  const den = new Date(moc + NGAY_GOP * 86400000).toISOString();
  const r = await db.prepare(
    'SELECT COALESCE(SUM(soTien),0) t FROM chiPhi ' +
    'WHERE khoanMuc = ? AND nguoiDeXuat = ? AND ngayChi >= ? AND ngayChi <= ? ' +
    "AND trangThai IN ('daDuyet','choDuyet')"
  ).bind(khoanMuc, nguoi, tu, den).first();
  return Number(r.t);
}

/* ═══════════════ GIẢI PHẪU MỘT KHOẢN CHI ═══════════════

   Cùng một khoản chi trả lời được hai câu khác nhau:

     "khoản này cần gì"        — nấc, mốc, cần mấy chữ ký, đã có mấy
     "TÔI ký được không"       — và nếu không thì vướng đúng cửa nào

   Cả hai đều đọc từ đây, và CỔNG DUYỆT THẬT cũng đọc từ đây. Đó là chỗ
   quan trọng nhất của cả phần trợ lý: một trợ lý tự tính lấy câu trả
   lời là một trợ lý sẽ có ngày nói khác cổng — và người ta tin trợ lý,
   vì nó nói trước.

   Ngày ấy không báo lỗi. Nó chỉ là một người được bảo "anh ký được"
   rồi bấm nút và bị từ chối, hoặc tệ hơn: được bảo "anh không ký được"
   nên đi tìm người khác ký, trong khi chính họ mới là người phải ký. */
async function giaiPhauChi(db, cp) {
  const nac = NAC_THANG.find(x => x.ma === cp.nac) || nacCua(Number(cp.soTien));

  /* ══ MỐC CHU KỲ ĐỌC LẠI Ở LÚC DUYỆT ══

     Không đọc lại mốc đã ghi lúc đề xuất: giữa hai mốc thời gian ấy,
     những khoản khác của cùng người trong cùng tuần có thể đã vào sổ và
     đẩy tổng lên mốc cao hơn. Duyệt theo mốc cũ là để một tuần 100
     triệu đi qua cổng của một tuần 10 triệu. */
  const ck = await tongChuKy(db, cp.nguoiDeXuat, cp.ngayChi);
  const moc = mocCua(ck.tong);
  const canKy = Math.max(1, nac.soDuyet) + moc.themChuKy;
  /* Ô chữ ký kế tiếp còn trống. Đếm chứ không đoán: hai thang chồng
     lên nhau nên số chữ ký cần có thể là 1, 2 hoặc 3, và mỗi lượt ký
     phải rơi đúng vào ô trống kế tiếp. */
  const chuKyThu = (cp.nguoiDuyet ? 1 : 0) + (cp.nguoiDuyet2 ? 1 : 0) + 1;
  return {nac, ck, moc, canKy, chuKyThu};
}

/** Người này bấm duyệt bây giờ thì vướng cửa nào — null là không vướng.

    SÁU CỬA, VÀ THỨ TỰ CỦA CHÚNG LÀ MỘT PHẦN CỦA CÂU TRẢ LỜI. Người tự
    đề xuất khoản chi của chính mình mà lại là kế toán thu thì họ vướng
    HAI cửa; nói ra cửa nào trước quyết định họ đi sửa cái gì. Trả lời
    "anh không có quyền" cho một người thật ra có quyền nhưng đang tự
    duyệt là đẩy họ đi xin cấp quyền, và cấp xong vẫn không ký được. */
function vuongCuaNao(cp, hoSo, quyen, gp) {
  const lv = BAC[hoSo.role] || 99;

  /* Sàn: tầng tài chính R01–R03, HOẶC người được cấp chức năng kế toán.
     Đây là chỗ chức năng được cấp mở cửa cho một vai vốn không có quyền
     tài chính — đúng ý chủ hệ: bộ phận kế toán chịu trách nhiệm. */
  if (lv > 3 && !oDauTien(quyen, 'chi'))
    return {ok: false, code: 'NOPERM',
      error: 'Duyệt chi cần vai R01–R03, hoặc vị trí Kế toán chi / Kế toán trưởng. ' +
             'Kế toán THU không duyệt được khoản chi nào — người ghi nhận tiền vào ' +
             'không được là người duyệt tiền ra.'};

  if (String(cp.nguoiDeXuat) === String(hoSo.u))
    return {ok: false, code: 'TUDUYET',
      error: 'Người đề xuất chi không tự duyệt được. Tiền đi RA thì phải có ' +
             'người thứ hai đứng giữa.'};

  if (cp.nguoiDuyet && String(cp.nguoiDuyet) === String(hoSo.u))
    return {ok: false, code: 'DAKY', error: 'Bạn đã ký duyệt khoản này rồi.'};

  if (!duTuCachMoc(gp.moc, hoSo.role, quyen))
    return {ok: false, code: 'CHUADUMOC',
      error: 'Tuần ' + gp.ck.ky + ' người này đã chi ' + dinhDang(gp.ck.tong) +
        ' — mốc ' + gp.moc.ma + '. ' + gp.moc.viec +
        (gp.moc.vai === 'keToan' ? '' :
          ' Hoặc kế toán trưởng được cấp hạn mức tới ' + gp.moc.ma + ' trở lên.'),
      moc: gp.moc.ma, vaiCan: gp.moc.tenVai, tongChuKy: gp.ck.tong};

  if (gp.chuKyThu > 3) return {ok: false, error: 'Khoản chi này đã đủ chữ ký.'};
  if (cp.nguoiDuyet2 && String(cp.nguoiDuyet2) === String(hoSo.u))
    return {ok: false, code: 'DAKY', error: 'Bạn đã ký duyệt khoản này rồi.'};
  return null;
}

/* ═══════════════ DUYỆT MỘT KHOẢN CHI ═══════════════ */
export async function duyetChi(y, env, db, hoSo) {
  const cp = await db.prepare('SELECT * FROM chiPhi WHERE id = ?')
    .bind(String(y.id || '')).first();
  if (!cp) return {ok: false, error: 'Không tìm thấy khoản chi này.'};

  const quyen = await quyenCua(db, hoSo.u);
  const gp = await giaiPhauChi(db, cp);
  const {nac, ck, moc, canKy, chuKyThu} = gp;

  /* Từ chối thì dừng ngay ở chữ ký đầu — một người thấy sai là đủ để
     khoản ấy không đi tiếp. */
  const vuong = vuongCuaNao(cp, hoSo, quyen, gp);
  if (vuong) return vuong;

  const duyet = y.duyet !== false;
  const gio = new Date().toISOString();
  const duXong = !duyet || chuKyThu >= canKy;
  const oKy = chuKyThu === 1 ? '' : String(chuKyThu);

  const r = duXong
    ? await db.prepare(
        'UPDATE chiPhi SET trangThai = ?, nguoiDuyet' + oKy + ' = ?, ' +
        'duyetLuc' + oKy + " = ?, lyDo = ? WHERE id = ? AND trangThai = 'choDuyet'"
      ).bind(duyet ? 'daDuyet' : 'tuChoi', hoSo.u, gio,
        String(y.lyDo || '').slice(0, 500) || null, cp.id).run()
    /* Chữ ký chưa đủ: ghi tên nhưng GIỮ NGUYÊN choDuyet. Đổi sang
       daDuyet ở đây là cho tiền ra khi còn thiếu chữ ký. */
    : await db.prepare(
        'UPDATE chiPhi SET nguoiDuyet' + oKy + ' = ?, duyetLuc' + oKy + ' = ? ' +
        "WHERE id = ? AND trangThai = 'choDuyet' AND nguoiDuyet" + oKy + ' IS NULL'
      ).bind(hoSo.u, gio, cp.id).run();

  if (!((r && r.meta && r.meta.changes) || 0))
    return {ok: false, error: 'Khoản chi này đã được xử lý rồi.'};

  if (!duXong) {
    await Kho.ghiNhatKy(db, {uid: hoSo.uid, username: hoSo.u, viec: 'CHI_KY1',
      doiTuong: cp.id, chiTiet: 'nấc ' + nac.ma + ' · mốc ' + moc.ma +
        ' · chữ ký 1/' + canKy});
    return {ok: true, trangThai: 'choDuyet', nac: nac.ma, moc: moc.ma,
      /* Số chữ ký ĐÃ CÓ, không phải hằng số 1: một khoản cần ba chữ ký
         thì lượt ký thứ hai vẫn chưa xong, và báo "1" ở đây là nói sai
         cho người đang chờ. */
      daKy: chuKyThu, canKy, conThieu: canKy - chuKyThu, choNguoiTiepTheo: true,
      vi: 'Cần ' + canKy + ' người duyệt khác nhau — nấc ' + nac.ma +
          ' của khoản, cộng mốc ' + moc.ma + ' của tuần. Đã có ' + chuKyThu +
          ', còn thiếu ' + (canKy - chuKyThu) + '. Khoản chi CHƯA vào sổ.'};
  }

  const dc = duyet ? await ghiDieuChinh(db, {
    lucGoc: cp.ngayChi, loai: 'duyetChi', idChungTu: cp.id,
    soTien: Number(cp.soTien), boi: hoSo.u,
    dienGiai: 'Duyệt khoản chi thuộc kỳ đã chốt · ' + cp.dienGiai.slice(0, 200)}) : null;

  /* ── BÁO LÊN GIÁM ĐỐC VÀ SUPER ADMIN ──

     Chốt 9.98. Báo khi tuần đã chạm mốc từ C1 trở lên — tức từ 10 triệu
     — chứ không báo mọi khoản: báo mọi khoản thì hộp thông báo đầy
     những chuyện thường ngày, và cái đáng xem chìm giữa chúng.

     Báo SAU khi tiền đã ra, không phải trước: đây là thông báo để biết,
     không phải một cổng nữa. Cổng đã đứng ở trên rồi. */
  if (duyet && moc.ma !== 'C0') {
    try {
      await baoLenCapCao(db, {
        loai: 'CHI_MOC_CHU_KY',
        mucDo: MOC_CHU_KY.indexOf(moc) >= 3 ? 'gap' : 'canXem',
        tieuDe: 'Chi ' + dinhDang(cp.soTien) + ' · tuần ' + ck.ky + ' đã chi ' +
          dinhDang(ck.tong) + ' · mốc ' + moc.ma,
        doiTuong: cp.id,
        than: [
          'Khoản chi vừa được duyệt và đã vào sổ.',
          '',
          'Khoản mục : ' + (KHOAN_MUC[cp.khoanMuc] || cp.khoanMuc),
          'Số tiền   : ' + dinhDang(cp.soTien),
          'Diễn giải : ' + String(cp.dienGiai).slice(0, 200),
          'Người ghi : ' + cp.nguoiDeXuat,
          'Người ký  : ' + [cp.nguoiDuyet, cp.nguoiDuyet2, hoSo.u]
            .filter(Boolean).join(', '),
          '',
          'Tuần ' + ck.ky + ': người này đã chi ' + dinhDang(ck.tong) +
            ' — mốc ' + moc.ma + '. ' + moc.viec
        ].join('\n')});
    } catch (e) {
      /* Thông báo hỏng KHÔNG được kéo đổ lượt duyệt: tiền đã ra, sổ đã
         ghi, và một dòng thông báo thiếu là mất một lượt báo chứ không
         mất một đồng. */
      console.error('THONGBAO_HONG', cp.id, String(e && e.message || e));
    }
  }

  await Kho.ghiNhatKy(db, {uid: hoSo.uid, username: hoSo.u,
    viec: duyet ? 'CHI_DUYET' : 'CHI_TUCHOI',
    doiTuong: cp.id, chiTiet: KHOAN_MUC[cp.khoanMuc] + ' · ' + dinhDang(cp.soTien) +
      ' · nấc ' + nac.ma + ' · mốc ' + moc.ma});

  return {ok: true, trangThai: duyet ? 'daDuyet' : 'tuChoi',
    nac: nac.ma, moc: moc.ma, daKy: chuKyThu, canKy,
    dieuChinh: dc ? {id: dc.id, kyBiAnhHuong: dc.kyBiAnhHuong} : undefined};
}

/* ═══════════════ CẤP VÀ THU HỒI QUYỀN TÀI CHÍNH ═══════════════

   Chỉ R01 Super Admin và R02 Admin hệ thống — đúng chữ chủ hệ dùng ở
   bản 9.97. Giám đốc KHÔNG tự cấp được quyền cho người sẽ ký thay
   mình: đó là tự nới cổng của chính mình. */
export async function capQuyenTaiChinh(y, env, db, hoSo) {
  const quyenMinh = await quyenCua(db, hoSo.u);
  if (!quanLyDuocPhong(hoSo.role, quyenMinh))
    return {ok: false, code: 'NOPERM',
      error: 'Phòng tài chính trực thuộc Super Admin, Giám đốc và Admin hệ thống. ' +
             'Super Admin quản lý đương nhiên; Giám đốc và Admin hệ thống cần ' +
             'được Super Admin cấp quyền quanLyPhong.'};

  /* Chỉ SUPER ADMIN cấp được quyền QUẢN LÝ PHÒNG. Cho người được cấp
     quyền ấy đi cấp tiếp cho người khác là dựng một dây chuyền tự nhân
     lên mà đầu dây không ai nắm. */
  if (String(y.chucNang || '') === 'quanLyPhong' && hoSo.role !== 'R01')
    return {ok: false, code: 'CHIR01',
      error: 'Chỉ Super Admin cấp được quyền quản lý phòng tài chính.'};

  const ten = String(y.username || '').trim().toLowerCase();
  const cn = String(y.chucNang || '').trim();
  const lyDo = String(y.lyDo || '').trim();
  if (!ten) return {ok: false, error: 'Thiếu tên đăng nhập.'};
  if (!VI_TRI_TC[cn]) return {ok: false,
    error: 'Vị trí trong phòng tài chính phải là một trong: ' +
      Object.keys(VI_TRI_TC).join(', ') + '.'};
  if (!lyDo) return {ok: false,
    error: 'Chưa nói vì sao cấp. Một quyền ký tiền mà không có lý do thì sang ' +
           'năm không ai dựng lại được vì sao người này được ký.'};

  const nd = await Kho.nguoiTheoTen(db, ten);
  if (!nd) return {ok: false, error: 'Không tìm thấy tài khoản này.'};

  /* KHÔNG AI TỰ CẤP CHO MÌNH. Cổng này sinh ra để đứng giữa một người
     với tiền; tự cấp là tự dỡ nó đi. So bằng ĐỊNH DANH CHÍNH TẮC (uid),
     không so chuỗi: `ten` nhận cả email, mà bản cũ so `ten===hoSo.u` bỏ
     sót email của chính mình (và chỉ hạ chữ thường một vế) → tự cấp quyền
     ký TIỀN cho mình. Cùng lỗ 9.99.112 với capLenhGiamSat. */
  if (String(nd.id) === String(hoSo.uid || ''))
    return {ok: false, code: 'TUCAP',
      error: 'Không tự cấp được vị trí cho chính mình (kể cả khai bằng email).'};

  let moc = null;
  if (cn === 'keToanTruong') {
    moc = String(y.mocToiDa || '').trim();
    if (!MOC_CHU_KY.some(x => x.ma === moc))
      return {ok: false,
        error: 'Hạn mức phải là một mốc có tên: ' +
          MOC_CHU_KY.map(x => x.ma).join(', ') + '. Cấp bằng số tự do thì sáu ' +
          'tháng sau có bảy hạn mức không ai giải thích được.'};
  }

  const id = 'QTC-' + tokenMoi().slice(0, 14);
  const luc = new Date().toISOString();
  try {
    await db.prepare(
      'INSERT INTO quyenTaiChinh (id,username,chucNang,mocToiDa,lyDo,boiAi,capLuc,hetHan) ' +
      'VALUES (?,?,?,?,?,?,?,?)'
    ).bind(id, ten, cn, moc, lyDo.slice(0, 500), hoSo.u, luc,
      String(y.hetHan || '').trim() || null).run();
  } catch (e) {
    return {ok: false, code: 'DACAP',
      error: 'Người này đã có chức năng ' + cn + ' còn hiệu lực. Thu hồi trước khi cấp lại.'};
  }

  await Kho.ghiNhatKy(db, {uid: hoSo.uid, username: hoSo.u, viec: 'QUYENTC_CAP',
    doiTuong: ten, chiTiet: cn + (moc ? ' · hạn mức ' + moc : '') + ' · ' + lyDo});
  return {ok: true, id, username: ten, chucNang: cn, mocToiDa: moc || undefined};
}

export async function thuHoiQuyenTaiChinh(y, env, db, hoSo) {
  const quyenMinh = await quyenCua(db, hoSo.u);
  if (!quanLyDuocPhong(hoSo.role, quyenMinh))
    return {ok: false, code: 'NOPERM',
      error: 'Chỉ người quản lý phòng tài chính thu hồi được vị trí.'};
  if (String(y.chucNang || '') === 'quanLyPhong' && hoSo.role !== 'R01')
    return {ok: false, code: 'CHIR01',
      error: 'Chỉ Super Admin thu hồi được quyền quản lý phòng tài chính.'};

  const r = await db.prepare(
    'UPDATE quyenTaiChinh SET thuHoiLuc = ?, thuHoiBoi = ? ' +
    'WHERE username = ? AND chucNang = ? AND thuHoiLuc IS NULL'
  ).bind(new Date().toISOString(), hoSo.u,
    String(y.username || '').trim().toLowerCase(), String(y.chucNang || '')).run();
  const n = (r && r.meta && r.meta.changes) || 0;
  if (!n) return {ok: false, error: 'Người này không có chức năng ấy đang hiệu lực.'};

  await Kho.ghiNhatKy(db, {uid: hoSo.uid, username: hoSo.u, viec: 'QUYENTC_THUHOI',
    doiTuong: String(y.username || ''), chiTiet: String(y.chucNang || '')});
  return {ok: true, daThuHoi: n};
}

/* ── DANH SÁCH NHÂN SỰ PHÒNG TÀI CHÍNH ──
   Câu đầu tiên người kiểm soát hỏi là "ai đang có quyền ký tiền" —
   và câu ấy phải trả lời được bằng một lượt gọi, không phải bằng cách
   đi hỏi từng người. */
export async function dsQuyenTaiChinh(y, env, db, hoSo) {
  const lv = BAC[hoSo.role] || 99;
  if (lv > 3) return {ok: false, code: 'NOPERM', error: 'Vai này không xem được sổ quyền tài chính.'};
  const r = await db.prepare(
    'SELECT * FROM quyenTaiChinh ORDER BY capLuc DESC LIMIT 200').all();
  const bay = new Date().toISOString();
  const ds = (r.results || []).map(x => ({
    username: x.username, viTri: x.chucNang,
    tenViTri: (VI_TRI_TC[x.chucNang] || {}).ten || x.chucNang,
    mocToiDa: x.mocToiDa || undefined,
    lyDo: x.lyDo, boiAi: x.boiAi, capLuc: x.capLuc,
    hetHan: x.hetHan || undefined,
    conHieuLuc: !x.thuHoiLuc && !(x.hetHan && x.hetHan <= bay),
    thuHoiLuc: x.thuHoiLuc || undefined}));
  return {ok: true,
    dangLamViec: ds.filter(x => x.conHieuLuc),
    ds,
    viTriCoThe: VI_TRI_TC,
    mocChuKy: MOC_CHU_KY.map(m => ({moc: m.ma, tu: m.tu, vai: m.tenVai,
      themChuKy: m.themChuKy, viec: m.viec})),
    chuKy: CHU_KY,
    vi: 'Vị trí trong phòng tài chính mở đúng những cửa TIỀN và KHÔNG mở thêm ' +
        'một cửa dữ liệu khách nào. Thêm vai thì quyền đi theo cả gói; cấp vị ' +
        'trí thì quyền đi theo đúng việc.'};
}

/* ═══════════════ HUỶ MỘT KHOẢN CHI ĐÃ DUYỆT ═══════════════

   Cùng luật với phiếu thu: huỷ là ĐÁNH DẤU, không phải xoá. Xoá dòng
   là xoá luôn bằng chứng rằng khoản ấy đã từng được duyệt — mà đó
   chính là thứ phải trưng ra khi có người hỏi. */
export async function huyChi(y, env, db, hoSo) {
  const lv = BAC[hoSo.role] || 99;
  if (lv > 3) return {ok: false, error: 'Chỉ R01–R03 huỷ được khoản chi.'};

  const lyDo = String(y.lyDo || '').trim();
  if (!lyDo) return {ok: false, error: 'Chưa nói vì sao huỷ khoản chi này.'};

  const cp = await db.prepare('SELECT * FROM chiPhi WHERE id = ?')
    .bind(String(y.id || '')).first();
  if (!cp) return {ok: false, error: 'Không tìm thấy khoản chi này.'};

  const gio = new Date().toISOString();
  const r = await db.prepare(
    "UPDATE chiPhi SET trangThai = 'huy', huyLuc = ?, lyDo = ?, nguoiDuyet = ? " +
    "WHERE id = ? AND trangThai IN ('daDuyet','choDuyet')"
  ).bind(gio, lyDo, hoSo.u, cp.id).run();
  if (!((r && r.meta && r.meta.changes) || 0))
    return {ok: false, error: 'Khoản chi này đã huỷ hoặc đã bị từ chối rồi.'};

  const dc = cp.trangThai === 'daDuyet' ? await ghiDieuChinh(db, {
    lucGoc: cp.ngayChi, loai: 'huyChi', idChungTu: cp.id,
    soTien: -Number(cp.soTien), boi: hoSo.u,
    dienGiai: 'Huỷ khoản chi đã duyệt thuộc kỳ đã chốt · ' + lyDo}) : null;

  await Kho.ghiNhatKy(db, {uid: hoSo.uid, username: hoSo.u, viec: 'CHI_HUY',
    doiTuong: cp.id, chiTiet: dinhDang(cp.soTien) + ' · ' + lyDo});
  return {ok: true, trangThai: 'huy',
    dieuChinh: dc ? {id: dc.id, kyBiAnhHuong: dc.kyBiAnhHuong} : undefined};
}

/* ═══════════════ SỔ CHI ═══════════════ */
export async function soChi(y, env, db, hoSo) {
  const lv = BAC[hoSo.role] || 99;
  if (lv > 3) return {ok: false, code: 'NOPERM', error: 'Chỉ R01–R03 xem được sổ chi.'};

  const loc = [], gt = [];
  if (y.tu)  { loc.push('ngayChi >= ?'); gt.push(String(y.tu)); }
  if (y.den) { loc.push('ngayChi <= ?'); gt.push(String(y.den)); }
  if (y.khoanMuc) { loc.push('khoanMuc = ?'); gt.push(String(y.khoanMuc)); }
  if (y.trangThai) { loc.push('trangThai = ?'); gt.push(String(y.trangThai)); }

  const r = await db.prepare(
    'SELECT * FROM chiPhi' + (loc.length ? ' WHERE ' + loc.join(' AND ') : '') +
    ' ORDER BY ngayChi DESC LIMIT 500'
  ).bind(...gt).all();

  const ds = r.results || [];
  const daDuyet = ds.filter(x => x.trangThai === 'daDuyet');

  const theoMuc = {};
  for (const x of daDuyet) {
    const m = theoMuc[x.khoanMuc] || (theoMuc[x.khoanMuc] =
      {khoanMuc: x.khoanMuc, ten: KHOAN_MUC[x.khoanMuc] || x.khoanMuc,
       so: 0, tien: 0, coHoaDon: 0, khongHoaDon: 0, tuGhi: 0});
    m.so++; m.tien += Number(x.soTien);
    if (Number(x.coHoaDon)) m.coHoaDon += Number(x.soTien);
    else m.khongHoaDon += Number(x.soTien);
    if (Number(x.tuGhi)) m.tuGhi += Number(x.soTien);
  }

  /* HAI LỐI NÊU RIÊNG. Câu đầu tiên người đi kiểm tra hỏi là "khoản nào
     có hai người ký, khoản nào chỉ một" — trả lời được bằng phép lọc,
     không phải bằng cách đọc từng dòng. */
  const tuGhi = daDuyet.filter(x => Number(x.tuGhi));

  return {ok: true, so: ds.length,
    tongDaDuyet: daDuyet.reduce((a, x) => a + Number(x.soTien), 0),
    choDuyet: ds.filter(x => x.trangThai === 'choDuyet')
      .reduce((a, x) => a + Number(x.soTien), 0),
    quaCuaDuyet: {
      so: daDuyet.length - tuGhi.length,
      tien: daDuyet.filter(x => !Number(x.tuGhi))
        .reduce((a, x) => a + Number(x.soTien), 0)},
    loiTuGhi: {
      so: tuGhi.length,
      tien: tuGhi.reduce((a, x) => a + Number(x.soTien), 0),
      vi: 'Khoản dưới ' + dinhDang(TRAN_PHAI_DUYET) + ' ghi thẳng, một người. ' +
          'Cộng dồn theo khoản mục × người ghi trong ' + NGAY_GOP + ' ngày; vượt ' +
          'ngưỡng thì phải đi đường xin duyệt.'},
    theoKhoanMuc: Object.values(theoMuc).sort((a, b) => b.tien - a.tien),
    ds,
    theoNac: NAC_THANG.map(n => {
      const cua = daDuyet.filter(x => x.nac === n.ma);
      return {nac: n.ma, ten: n.ten, tu: n.tu,
        den: n.den === Infinity ? null : n.den,
        so: cua.length, tien: cua.reduce((a, x) => a + Number(x.soTien), 0)};
    }),
    thang: thangDuyetChi(),
    khoanMucCoThe: KHOAN_MUC};
}

/* ═══════════════════════════════════════════════════════════════
   CHỐT KÉT TIỀN MẶT

   Chuyển khoản có sao kê ngân hàng đứng ngoài làm chứng: sổ nói thu
   mười triệu mà ngân hàng nói tám thì lệch lộ ra ngay. Tiền mặt không
   có ai đứng ngoài — sổ nói bao nhiêu thì chỉ có sổ nói.

   Nên phải ĐẾM, và phải ghi cả hai con số: sổ nói bao nhiêu, đếm thật
   được bao nhiêu.

   MỘT KÉT KHÔNG BAO GIỜ LỆCH LÀ MỘT KÉT CHƯA BAO GIỜ ĐƯỢC ĐẾM. Nên
   phép này KHÔNG chặn chuyện lệch — lệch là chuyện thường, đếm nhầm,
   trả lại tiền thừa, quên ghi một phiếu. Nó chỉ đòi một điều: lệch thì
   phải có lý do, và lý do ở lại trong dòng.
   ═══════════════════════════════════════════════════════════════ */

const LECH_VN = 7 * 60 * 60 * 1000;

function dauNgayVN(ngay) {
  return new Date(new Date(ngay + 'T00:00:00.000Z').getTime() - LECH_VN).toISOString();
}
function cuoiNgayVN(ngay) {
  return new Date(new Date(ngay + 'T00:00:00.000Z').getTime() - LECH_VN
    + 86400000 - 1).toISOString();
}

export async function chotKet(y, env, db, hoSo) {
  const lv = BAC[hoSo.role] || 99;
  if (lv > 5) return {ok: false, code: 'NOPERM',
    error: 'Từ R01–R05 mới chốt được két.'};

  const ngay = String(y.ngay || new Date(Date.now() + LECH_VN).toISOString().slice(0, 10));
  if (!/^\d{4}-\d{2}-\d{2}$/.test(ngay))
    return {ok: false, error: 'Ngày phải có dạng YYYY-MM-DD.'};

  const dem = Number(y.demThuc);
  if (!(dem >= 0) || y.demThuc === undefined || y.demThuc === null)
    return {ok: false, error: 'Chưa nhập số tiền ĐẾM THẬT được trong két.'};

  const tu = dauNgayVN(ngay), den = cuoiNgayVN(ngay);

  /* SỐ THEO SỔ CỦA MỘT NGÀY = tiền mặt thu trong ngày − tiền mặt chi
     trong ngày. Không cộng dồn từ đầu: két đếm và nộp ngân hàng theo
     ngày, nên số dư mang sang là chuyện của người giữ két chứ không
     phải của phép này. */
  const thu = await db.prepare(
    "SELECT COALESCE(SUM(soTien),0) t FROM phieuThu " +
    "WHERE trangThai = 'daDuyet' AND hinhThuc = 'tienMat' AND ghiLuc >= ? AND ghiLuc <= ?"
  ).bind(tu, den).first();
  const chi = await db.prepare(
    "SELECT COALESCE(SUM(soTien),0) t FROM chiPhi " +
    "WHERE trangThai = 'daDuyet' AND hinhThuc = 'tienMat' AND ngayChi >= ? AND ngayChi <= ?"
  ).bind(tu, den).first();

  const theoSo = Number(thu.t) - Number(chi.t);
  const chenh = dem - theoSo;
  const lyDo = String(y.lyDo || '').trim();

  /* LỆCH THÌ PHẢI CÓ LÝ DO. Cho chốt một két lệch mà không nói gì là
     dựng ra một chỗ tiền biến mất hợp lệ. */
  if (Math.abs(chenh) >= 1 && !lyDo)
    return {ok: false, code: 'LECHKHONGLYDO',
      error: 'Két lệch ' + dinhDang(chenh) + ' so với sổ (' + dinhDang(theoSo) +
        '). Lệch thì phải ghi lý do.',
      theoSo, demThuc: dem, chenh};

  const luc = new Date().toISOString();
  await db.prepare(
    'INSERT INTO chotKet (ngay,theoSo,demThuc,chenh,lyDo,boi,luc) VALUES (?,?,?,?,?,?,?) ' +
    'ON CONFLICT(ngay) DO UPDATE SET theoSo=excluded.theoSo, demThuc=excluded.demThuc, ' +
    'chenh=excluded.chenh, lyDo=excluded.lyDo, boi=excluded.boi, luc=excluded.luc'
  ).bind(ngay, theoSo, dem, chenh, lyDo || null, hoSo.u, luc).run();

  await Kho.ghiNhatKy(db, {uid: hoSo.uid, username: hoSo.u, viec: 'KET_CHOT',
    doiTuong: ngay, chiTiet: 'sổ ' + dinhDang(theoSo) + ' · đếm ' + dinhDang(dem) +
      ' · lệch ' + dinhDang(chenh) + (lyDo ? ' · ' + lyDo : '')});

  return {ok: true, ngay, theoSo, demThuc: dem, chenh, khop: Math.abs(chenh) < 1,
    vi: 'Một két không bao giờ lệch là một két chưa bao giờ được đếm. ' +
        'Phép này không chặn chuyện lệch — nó chỉ đòi lệch phải có lý do.'};
}

export async function dsChotKet(y, env, db, hoSo) {
  const lv = BAC[hoSo.role] || 99;
  if (lv > 5) return {ok: false, code: 'NOPERM', error: 'Vai này không xem được sổ két.'};

  const r = await db.prepare(
    'SELECT * FROM chotKet ORDER BY ngay DESC LIMIT ?'
  ).bind(Number(y.soNgay) > 0 ? Number(y.soNgay) : 60).all();
  const ds = r.results || [];

  return {ok: true, so: ds.length, ds,
    soNgayLech: ds.filter(x => Math.abs(Number(x.chenh)) >= 1).length,
    tongLech: ds.reduce((a, x) => a + Number(x.chenh), 0)};
}

/* ═══════════════ THANG DUYỆT CHI, TRẢ VỀ NGUYÊN BẢN ═══════════════

   Màn hình phải VẼ được cái thang này, không phải chép lại nó. Chép lại
   là dựng bản thứ hai của một luật, và hai bản thì sẽ có ngày lệch —
   lúc ấy màn hình nói cần hai báo giá còn máy chủ đòi ba. */
export function thangDuyetChi() {
  return NAC_THANG.map(n => ({
    nac: n.ma, ten: n.ten, viec: n.viec, neo: n.neo,
    tu: n.tu, den: n.den === Infinity ? null : n.den,
    soNguoiDuyet: n.soDuyet, capDuyet: 'R01–R03',
    canHoaDon: n.canHoaDon, soBaoGia: n.soBaoGia, canHopDong: n.canHopDong
  }));
}

/* ═══════════════════════════════════════════════════════════════
   BÁO CÁO CHI — CHỐT CỦA CHỦ HỆ THỐNG BẢN 9.94

   "Chi phí từ 1,5 triệu trở lên phải báo cáo."

   ══ DUYỆT VÀ BÁO CÁO LÀ HAI VIỆC KHÁC NHAU ══

   Duyệt là một cái CỔNG: nó đứng trước, và nó chặn. Báo cáo là một tấm
   GƯƠNG: nó đứng sau, và nó cho người ta nhìn thấy tất cả những gì đã
   đi qua cổng.

   Chỉ có cổng mà không có gương thì mỗi khoản đều đúng luật lúc nó đi
   qua, mà không ai nhìn thấy hình dạng của cả dòng tiền. Người duyệt
   khoản thứ mười bảy trong tháng không biết đó là khoản thứ mười bảy.

   ══ BÁO CÁO NÀY KHÔNG PHẢI MỘT CON SỐ TỔNG ══

   Một con số tổng thì bản kế toán đã có. Cái người đọc báo cáo chi cần
   là DẤU VẾT: mỗi khoản ai đề xuất, ai ký, ký mấy chữ, chứng từ đủ
   chưa, có bị đẩy nấc vì chia nhỏ không.

   Nên nó trả về TỪNG KHOẢN, và nêu lên đầu bốn thứ đáng hỏi:

     · khoản đi lối tự ghi mà lẽ ra phải duyệt (không được có cái nào)
     · khoản còn treo chưa ai duyệt
     · khoản thiếu hoá đơn ở nấc đòi hoá đơn
     · khoản bị ĐẨY NẤC vì cộng dồn — dấu hiệu chia nhỏ
   ═══════════════════════════════════════════════════════════════ */
export async function baoCaoChi(y, env, db, hoSo) {
  const lv = BAC[hoSo.role] || 99;
  if (lv > 3) return {ok: false, code: 'NOPERM',
    error: 'Chỉ R01–R03 xem được báo cáo chi.'};

  const k = dungKy(String(y.loai || 'thang'),
    String(y.moc || new Date(Date.now() + 7 * 3600e3).toISOString().slice(0, 10)));
  if (!k) return {ok: false, error: 'Kỳ báo cáo không hợp lệ.'};

  /* NGƯỠNG BÁO CÁO ĐÚNG BẰNG NGƯỠNG PHẢI DUYỆT. Hai con số ấy là một:
     cái phải xin phép trước khi tiêu là cái phải trưng ra sau khi tiêu.
     Để chúng thành hai hằng số riêng là để chúng có ngày lệch nhau. */
  const r = await db.prepare(
    'SELECT * FROM chiPhi WHERE soTien >= ? AND ngayChi >= ? AND ngayChi <= ? ' +
    'ORDER BY soTien DESC'
  ).bind(TRAN_PHAI_DUYET, k.tuLuc, k.denLuc).all();
  const ds = r.results || [];

  const khoan = ds.map(x => {
    const nac = NAC_THANG.find(n => n.ma === x.nac) || nacCua(Number(x.soTien));
    const kyDu = (x.nguoiDuyet ? 1 : 0) + (x.nguoiDuyet2 ? 1 : 0);
    return {
      id: x.id, ngayChi: x.ngayChi, khoanMuc: x.khoanMuc,
      tenKhoanMuc: KHOAN_MUC[x.khoanMuc] || x.khoanMuc,
      soTien: Number(x.soTien), nac: x.nac, tenNac: nac.ten,
      dienGiai: x.dienGiai, nhaCungCap: x.nhaCungCap || undefined,
      hinhThuc: x.hinhThuc, trangThai: x.trangThai,
      nguoiDeXuat: x.nguoiDeXuat,
      nguoiDuyet: x.nguoiDuyet || undefined,
      nguoiDuyet2: x.nguoiDuyet2 || undefined,
      daKy: kyDu, canKy: nac.soDuyet,
      coHoaDon: !!Number(x.coHoaDon), maHoaDon: x.maHoaDon || undefined,
      soBaoGia: Number(x.soBaoGia), soHopDong: x.soHopDong || undefined,
      /* Khoản có nấc CAO HƠN nấc của riêng số tiền nó = đã bị đẩy lên vì
         cộng dồn bảy ngày. Đây là dấu hiệu chia nhỏ, và nó phải hiện
         lên mặt báo cáo chứ không nằm trong một cột người ta phải tự
         suy ra. */
      biDayNac: NAC_THANG.indexOf(nac) >
                NAC_THANG.indexOf(nacCua(Number(x.soTien))) || undefined
    };
  });

  const daDuyet = khoan.filter(x => x.trangThai === 'daDuyet');
  const theoMuc = {};
  for (const x of daDuyet) {
    const m = theoMuc[x.khoanMuc] || (theoMuc[x.khoanMuc] =
      {khoanMuc: x.khoanMuc, ten: x.tenKhoanMuc, so: 0, tien: 0});
    m.so++; m.tien += x.soTien;
  }

  /* ── BỐN THỨ ĐÁNG HỎI, NÊU LÊN ĐẦU ──
     Chôn chúng trong danh sách là để người đọc tự tìm, mà người đọc
     một báo cáo dài thì không tìm. */
  const canHoi = {
    lotLoiTuGhi: khoan.filter(x => ds.find(d => d.id === x.id && Number(d.tuGhi))),
    conTreoChuaDuyet: khoan.filter(x => x.trangThai === 'choDuyet'),
    thieuHoaDon: daDuyet.filter(x => !x.coHoaDon &&
      (NAC_THANG.find(n => n.ma === x.nac) || {}).canHoaDon),
    biDayNacViGopDon: khoan.filter(x => x.biDayNac)
  };

  await Kho.ghiNhatKy(db, {uid: hoSo.uid, username: hoSo.u, viec: 'BAOCAO_CHI',
    doiTuong: k.ky, chiTiet: khoan.length + ' khoản từ ' + dinhDang(TRAN_PHAI_DUYET)});

  return {ok: true, ky: k.ky, loai: k.loai, tuNgay: k.tuNgay, denNgay: k.denNgay,
    tuNguong: TRAN_PHAI_DUYET,
    so: khoan.length,
    tongDaDuyet: daDuyet.reduce((a, x) => a + x.soTien, 0),
    tongConTreo: canHoi.conTreoChuaDuyet.reduce((a, x) => a + x.soTien, 0),
    theoKhoanMuc: Object.values(theoMuc).sort((a, b) => b.tien - a.tien),
    theoNac: NAC_THANG.filter(n => n.soDuyet > 0).map(n => {
      const cua = daDuyet.filter(x => x.nac === n.ma);
      return {nac: n.ma, ten: n.ten, so: cua.length,
        tien: cua.reduce((a, x) => a + x.soTien, 0)};
    }),
    canHoi: {
      sach: !canHoi.lotLoiTuGhi.length && !canHoi.thieuHoaDon.length,
      lotLoiTuGhi: canHoi.lotLoiTuGhi,
      conTreoChuaDuyet: canHoi.conTreoChuaDuyet,
      thieuHoaDon: canHoi.thieuHoaDon,
      biDayNacViGopDon: canHoi.biDayNacViGopDon
    },
    khoan,
    vi: 'Chốt của chủ hệ thống: chi phí TỪ ' + dinhDang(TRAN_PHAI_DUYET) +
        ' TRỞ LÊN phải báo cáo. Ngưỡng báo cáo đúng bằng ngưỡng phải duyệt — ' +
        'cái phải xin phép trước khi tiêu là cái phải trưng ra sau khi tiêu.'};
}

/* ═══════════════════════════════════════════════════════════════
   TỔNG HỢP CHI THEO NGƯỜI VÀ THEO CHU KỲ

   "Tổng các khoản chi cần tổng hợp lại." Đây là bản tổng hợp ấy, và nó
   nhìn theo CỘT NGANG: mỗi người một dòng, cộng qua mọi khoản mục.

   Báo cáo chi ở trên nhìn theo từng khoản; bản này nhìn theo người.
   Hai câu hỏi khác nhau:

     baoCaoChi   — khoản nào đã đi ra, ai ký, chứng từ đủ chưa
     tongHopChi  — AI đang tiêu bao nhiêu, và ai sắp chạm trần

   Câu thứ hai là câu chặn thất thoát. Một người rải bốn khoản một
   triệu tư qua bốn khoản mục thì mọi bản kê theo khoản mục đều sạch,
   và chỉ bản kê theo NGƯỜI mới thấy.
   ═══════════════════════════════════════════════════════════════ */
export async function tongHopChi(y, env, db, hoSo) {
  const lv = BAC[hoSo.role] || 99;
  if (lv > 3) return {ok: false, code: 'NOPERM',
    error: 'Chỉ R01–R03 xem được bản tổng hợp chi.'};

  const k = dungKy(String(y.loai || 'thang'),
    String(y.moc || new Date(Date.now() + 7 * 3600e3).toISOString().slice(0, 10)));
  if (!k) return {ok: false, error: 'Kỳ tổng hợp không hợp lệ.'};

  const r = await db.prepare(
    'SELECT nguoiDeXuat, ' +
    '  COUNT(*) so, COALESCE(SUM(soTien),0) tong, ' +
    '  COALESCE(SUM(CASE WHEN tuGhi = 1 THEN soTien END),0) tuGhi, ' +
    '  SUM(CASE WHEN tuGhi = 1 THEN 1 ELSE 0 END) soTuGhi, ' +
    "  COALESCE(SUM(CASE WHEN trangThai = 'choDuyet' THEN soTien END),0) treo, " +
    '  MIN(soTien) nhoNhat, MAX(soTien) lonNhat, ' +
    '  COUNT(DISTINCT khoanMuc) soKhoanMuc ' +
    'FROM chiPhi WHERE ngayChi >= ? AND ngayChi <= ? ' +
    "  AND trangThai IN ('daDuyet','choDuyet') " +
    'GROUP BY nguoiDeXuat ORDER BY tong DESC'
  ).bind(k.tuLuc, k.denLuc).all();

  const nguoi = (r.results || []).map(x => {
    const tong = Number(x.tong);
    return {
      nguoi: x.nguoiDeXuat, soKhoan: Number(x.so), tong,
      tuGhi: Number(x.tuGhi), soKhoanTuGhi: Number(x.soTuGhi),
      conTreo: Number(x.treo),
      soKhoanMuc: Number(x.soKhoanMuc),
      nhoNhat: Number(x.nhoNhat), lonNhat: Number(x.lonNhat),
      /* Trung bình một khoản. Số này nhỏ mà tổng lớn là hình dạng của
         chuyện rải tiền vặt — đúng thứ trần chu kỳ sinh ra để chặn. */
      trungBinh: Math.round(tong / Number(x.so)),
      chamTran: tong >= TRAN_CHU_KY,
      conLaiTruocTran: Math.max(0, TRAN_CHU_KY - tong),
      /* Sắp chạm là lúc đáng nói, không phải lúc đã chạm: chạm rồi thì
         cổng đã tự đóng, còn sắp chạm thì người phụ trách còn kịp hỏi. */
      sapChamTran: tong < TRAN_CHU_KY && tong >= TRAN_CHU_KY * 0.8
    };
  });

  const tong = nguoi.reduce((a, x) => a + x.tong, 0);

  await Kho.ghiNhatKy(db, {uid: hoSo.uid, username: hoSo.u, viec: 'TONGHOP_CHI',
    doiTuong: k.ky, chiTiet: nguoi.length + ' người · ' + dinhDang(tong)});

  return {ok: true, ky: k.ky, loai: k.loai, tuNgay: k.tuNgay, denNgay: k.denNgay,
    tranChuKy: TRAN_CHU_KY,
    soNguoi: nguoi.length,
    tongChi: tong,
    tongTuGhi: nguoi.reduce((a, x) => a + x.tuGhi, 0),
    tongConTreo: nguoi.reduce((a, x) => a + x.conTreo, 0),
    theoNguoi: nguoi,
    daChamTran: nguoi.filter(x => x.chamTran),
    sapChamTran: nguoi.filter(x => x.sapChamTran),
    vi: 'Trần chu kỳ ' + dinhDang(TRAN_CHU_KY) + ' cho MỘT NGƯỜI trong MỘT CHU KỲ, ' +
        'cộng qua MỌI khoản mục. Chạm trần thì lối tự ghi đóng lại với người ấy tới ' +
        'hết chu kỳ. Bản này nhìn theo NGƯỜI; một người rải bốn khoản nhỏ qua bốn ' +
        'khoản mục thì mọi bản kê theo khoản mục đều sạch, chỉ bản này thấy.'};
}

export async function xemThangDuyetChi(y, env, db, hoSo) {
  const lv = BAC[hoSo.role] || 99;
  if (lv > 5) return {ok: false, code: 'NOPERM', error: 'Vai này không xem được thang duyệt chi.'};
  const neo = soatNeoThang();
  return {ok: true, thang: thangDuyetChi(), cuaSoGopNgay: NGAY_GOP,
    tranChuKy: TRAN_CHU_KY, chuKy: 'tháng',
    neoConKhop: neo.khop, neoLech: neo.khop ? undefined : neo.lech,
    vi: 'Cấp duyệt tính theo TỔNG GỘP ' + NGAY_GOP + ' ngày (chặn chia nhỏ); ' +
        'bằng chứng tính theo số tiền của TỪNG khoản (không ai lấy được ba báo ' +
        'giá cho cả tuần). Và trần chu kỳ ' + dinhDang(TRAN_CHU_KY) + ' một người ' +
        'một tháng, cộng qua MỌI khoản mục: chạm trần thì lối tự ghi đóng lại.'};
}

/* Mở cho trợ lý tài chính. KHÔNG mở ra cửa máy chủ — đây là hai hàm
   ĐỌC, không ghi gì, và chúng là chỗ duy nhất trợ lý được lấy câu trả
   lời về một khoản chi. Trợ lý tự tính lấy là trợ lý sẽ có ngày nói
   khác cổng, và người ta tin trợ lý vì nó nói trước. */
export { giaiPhauChi, vuongCuaNao, mocCua, nacCua, duTuCachMoc, tongChuKy };

export { KHOAN_MUC, TRAN_PHAI_DUYET, TRAN_CHU_KY, NGAY_GOP, NAC_THANG,
  MOC_CHU_KY, CHU_KY, VI_TRI_TC };
