/* ═══════════════════════════════════════════════════════════════
   GITA 365 · v7.6 — QUY TRÌNH ĐĂNG KÝ · NÂNG TẦNG · CẤP TÀI KHOẢN
   Đây là NGUỒN SỰ THẬT DUY NHẤT của quy trình. Giao diện đọc từ đây,
   máy chủ đọc bản sao đúng y hệt trong GITA_QuyTrinh.gs. Sửa quy
   trình thì sửa ở hai chỗ đó, không sửa rải rác trong màn hình.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;

G.QUYTRINH = {

  /* ─────────── 1. KHÁCH HÀNG TỰ ĐĂNG KÝ ─────────── */
  dangKy: {
    ten: 'Khách hàng tự đăng ký',
    ai:  'Phụ huynh hoặc học viên tự vào, không cần ai mở tài khoản hộ.',
    buoc: [
      {no:1, t:'Vào mục Đăng ký',
       lam:'Bấm Đăng ký ở Cổng vào. Nếu vào bằng đường liên kết của một cộng tác viên thì mã bảo trợ tự điền sẵn, không phải gõ.',
       may:'Ghi lại mã giới thiệu trong đường dẫn (?gt=…) trước khi mở biểu mẫu.'},
      {no:2, t:'Điền đầy đủ thông tin',
       lam:'Họ tên phụ huynh, email, số điện thoại, tên con, lớp, tỉnh thành. Thiếu một trường bắt buộc là không gửi được.',
       may:'Kiểm định dạng ngay tại máy, rồi máy chủ kiểm lại lần nữa. Email trùng thì báo đã có tài khoản, không tạo bản thứ hai.'},
      {no:3, t:'Gửi xác nhận OTP qua email đăng ký',
       lam:'Nhập mã sáu số vừa nhận trong hộp thư. Mã sống mười lăm phút.',
       may:'Mã sinh ngẫu nhiên, chỉ lưu bản băm, sai năm lần là huỷ, xin lại tối đa năm lần mỗi giờ.'},
      {no:4, t:'Kích link đăng nhập lại',
       lam:'Bấm đường liên kết kích hoạt trong cùng lá thư, đặt mật khẩu của mình rồi đăng nhập lại.',
       may:'Liên kết mang một mã dùng một lần, sống hai mươi tư giờ, dùng xong là hết hiệu lực.'},
      {no:5, t:'Đăng ký thành công — khách hàng có mã số',
       lam:'Nhận mã số khách hàng dạng KH-YYMM-xxxx. Mã này đi theo gia đình suốt hành trình.',
       may:'Tạo hồ sơ ở tầng 0, chưa mở tầng nào; ghi mã bảo trợ nếu có; gửi thư chào mừng.'}
    ],
    sauKhiXong: 'Tài khoản mới ở tầng 0: mở được phần nền và bài test nhận diện, chưa mở nội dung nghề của bất kỳ tầng nào.'
  },

  /* ─────────── 2. NÂNG TẦNG ─────────── */
  nangTang: {
    ten: 'Nâng tầng cho khách hàng',
    ai:  'Khách hàng xin, hệ thống kiểm, người có quyền duyệt.',
    buoc: [
      {no:1, t:'Hoàn thành KPI tầng đang học',
       lam:'Đủ số điểm mốc KPI mà tầng đó yêu cầu.',
       may:'Đếm từ chính dữ liệu KPI đã đồng bộ, không nhận số do người dùng tự khai.'},
      {no:2, t:'Xác nhận thanh toán thành công',
       lam:'Chuyển khoản theo mã QR rồi gửi mã giao dịch. Kế toán đối chiếu sao kê.',
       may:'Trạng thái thanh toán chỉ do vai có quyền tài chính đặt, khách hàng không tự đặt được.'},
      {no:3, t:'Hệ thống kiểm KPI và thanh toán',
       lam:'Không có gì để làm — máy tự kiểm.',
       may:'Thiếu MỘT trong hai điều kiện là từ chối, nêu rõ thiếu điều nào.'},
      {no:4, t:'Nâng tầng tương ứng',
       lam:'Nhận thông báo đã lên tầng mới.',
       may:'Ghi tầng mới vào hồ sơ, ghi nhật ký ai duyệt lúc nào, nhảy đúng một tầng mỗi lần.'},
      {no:5, t:'Được truy cập đúng quyền hạn của tầng',
       lam:'Đăng nhập lại là thấy nội dung tầng mới.',
       may:'Lần xin khoá kế tiếp, máy chủ cấp thêm gói tang{n}. Tầng cũ vẫn mở, tầng chưa tới vẫn khoá.'}
    ],
    luat: [
      'Mỗi lần chỉ lên đúng một tầng. Không nhảy cóc dù đã trả tiền cả gói.',
      'Đủ KPI mà chưa thanh toán: giữ nguyên tầng, hiện rõ đang chờ thanh toán.',
      'Đã thanh toán mà chưa đủ KPI: giữ nguyên tầng, tiền được ghi nhận và dùng cho lần duyệt sau.',
      'Người duyệt không được duyệt cho chính hồ sơ nhà mình.'
    ]
  },

  /* ─────────── 3. CẤP TÀI KHOẢN CHO ĐỘI NGŨ ─────────── */
  capTaiKhoan: {
    ten: 'Cấp tên đăng nhập và mật khẩu cho đội ngũ',
    ai:  'Chỉ Super Admin và Admin hệ thống. Cấp được cho các vị trí từ Tư vấn trở lên.',
    buoc: [
      {no:1, t:'Mở mục Cấp tài khoản trong phần quản trị',
       lam:'Chỉ hiện với vai có quyền quản trị người dùng.',
       may:'Vai không đủ quyền thì màn hình không dựng, gọi thẳng vào máy chủ cũng bị từ chối.'},
      {no:2, t:'Điền họ tên, email, vị trí, khu vực phụ trách',
       lam:'Chọn vị trí trong danh sách được phép.',
       may:'Danh sách chỉ gồm vai có cấp bằng hoặc thấp hơn người đang cấp, và không thấp hơn Tư vấn.'},
      {no:3, t:'Hệ thống sinh mật khẩu ban đầu',
       lam:'Mật khẩu hiện đúng MỘT lần trên màn hình. Chép và gửi riêng cho người nhận.',
       may:'Sinh ngẫu nhiên mười sáu ký tự, băm ngay, bản thô không vào sổ và không vào nhật ký.'},
      {no:4, t:'Người nhận đăng nhập lần đầu và buộc đổi mật khẩu',
       lam:'Không đổi thì không đi tiếp được màn nào.',
       may:'Cờ mustChangePw bật sẵn; mọi yêu cầu khác bị chặn tới khi đổi xong.'}
    ],
    luat: [
      'Không ai cấp được tài khoản có cấp cao hơn chính mình.',
      'Không cấp tài khoản đội ngũ cho vị trí thấp hơn Tư vấn — khách hàng tự đăng ký, cộng tác viên nhận mã liên kết.',
      'Mật khẩu ban đầu không bao giờ được gửi qua cùng kênh với tên đăng nhập.',
      'Mọi lần cấp đều vào nhật ký: ai cấp, cấp cho ai, vị trí gì, lúc nào.'
    ]
  },

  /* ─────────── 4. CỘNG TÁC VIÊN GIỚI THIỆU ─────────── */
  ctv: {
    ten: 'Cộng tác viên giới thiệu khách hàng',
    ai:  'Thành viên đã được duyệt làm cộng tác viên.',
    buoc: [
      {no:1, t:'Nhận mã liên kết riêng',
       lam:'Mỗi cộng tác viên có một mã dạng CTV-xxxxxx và một đường liên kết mang sẵn mã đó.',
       may:'Mã gắn cứng với tài khoản, không đổi, không cấp lại cho người khác.'},
      {no:2, t:'Khách đăng ký qua liên kết — xác nhận bảo trợ',
       lam:'Mã bảo trợ tự điền vào biểu mẫu đăng ký. Khách nhìn thấy tên người bảo trợ trước khi gửi.',
       may:'Ghi mã bảo trợ vào hồ sơ khách ngay lúc tạo. Sau khi tạo thì KHÔNG sửa được người bảo trợ.'},
      {no:3, t:'Khách hoàn thành tầng và thanh toán',
       lam:'Cộng tác viên không cần làm gì thêm.',
       may:'Hoa hồng chỉ ghi nhận khi khoản thanh toán đã được đối chiếu sao kê.'},
      {no:4, t:'Hoa hồng và quà gửi về số tài khoản đã đăng ký',
       lam:'Cộng tác viên khai số tài khoản, ngân hàng, tên chủ tài khoản một lần; đổi thì phải xác thực lại qua email.',
       may:'Kỳ chi trả cố định. Chi xong ghi mã giao dịch vào sổ, không chi tiền mặt, không chi qua trung gian.'}
    ],
    luat: [
      'Trần hoa hồng 10%. Không ngoại lệ, không mức riêng cho bất kỳ ai.',
      'Chỉ một tầng bảo trợ. Không có tuyến dưới, không ăn theo người mà người mình giới thiệu giới thiệu.',
      'Không trả hoa hồng theo lượt chốt. Chỉ trả khi khách thật sự đi vào tầng và đã thanh toán.',
      'Đại sứ KHÁC cộng tác viên: đại sứ kể chuyện thật của nhà mình và không nhận hoa hồng theo số người giới thiệu.',
      'Đổi số tài khoản nhận tiền phải xác thực lại qua email đăng ký, và kỳ chi kế tiếp mới áp dụng.'
    ]
  }
};

/* Cấp hoa hồng theo bậc cộng tác viên — trần 10%, chốt cứng. */
G.TRAN_HOA_HONG = 10;
G.BAC_CTV = [
  {bac:1, ten:'Cộng tác viên mới',     tuKhach:0,  pt:3,  dk:'Vừa được duyệt'},
  {bac:2, ten:'Cộng tác viên',         tuKhach:3,  pt:5,  dk:'3 gia đình đã vào tầng và thanh toán'},
  {bac:3, ten:'Cộng tác viên chính',   tuKhach:10, pt:8,  dk:'10 gia đình, không nhà nào bỏ giữa tầng'},
  {bac:4, ten:'Cộng tác viên nòng cốt',tuKhach:25, pt:10, dk:'25 gia đình, và có ít nhất 3 nhà lên tầng 4'}
];
