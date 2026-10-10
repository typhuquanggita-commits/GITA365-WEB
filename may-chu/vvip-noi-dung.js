/* ═══════════════════════════════════════════════════════════════
   GITA 365 VVIP — MASTER BLUEPRINT 1.0 (nội dung)
   Bộ hồ sơ khách hàng cao cấp và hệ thống 10.000 điểm chạm WOW

   NGUỒN: bản Master Blueprint chủ hệ gửi ngày 10/10/2026, áp vào khu
   Khách hàng & CRM cho nhóm VIP/VVIP. Câu chữ của bản ấy giữ gần nguyên
   văn; phần thêm ở đây chỉ là ô `trongHe` — mỗi ý trỏ vào cửa máy chủ hay
   màn đã có trong hệ, để một nguyên tắc không đứng một mình trên giấy.

   VÌ SAO NẰM Ở MÁY CHỦ, không ở src/: src/ gộp thành gita-app.js và tệp ấy
   tải TRƯỚC đăng nhập — ai mở trang cũng đọc được. Cách Học viện chăm sóc
   và khai thác nhóm khách cao cấp là bí quyết kinh doanh; nó chỉ đi xuống
   cho nhân sự R01–R12 qua cửa noiDungVvip.

   VÌ SAO KHÔNG CHÉP SÁCH CÂY TIỀN: phần sách đã tiêu hoá (bốn việc, tám chuẩn
   có số trang, thẻ bạc–vàng–bạch kim, 12 nhịp, bốn nấc quan hệ, CLV) nằm ở
   kho mã hoá G.CAYTIEN · G.PHANHANG · G.CHUAN_VIP · G.HOSO_VIP. Chép lại là
   bản thứ hai của một sự thật. Ở đây chỉ có phần CHỦ HỆ phân tích và áp dụng.

   Ranh giới không đổi theo hạng khách (luật bất khả sửa của kho):
     · Điều 1 — phân nhóm là công cụ NỘI BỘ điều phối dịch vụ; không gia đình
       nào đọc thấy mình hay nhà khác ở nhóm nào.
     · Điều 3 — nhóm phục vụ KHÁC tầng học. Nhóm đổi theo dữ liệu; tầng học
       không tụt (L02).
     · Điều 4 — không hứa kết quả. Điều 5 — không dùng nỗi sợ của cha mẹ.
     · Điều 6 — giới thiệu là quan hệ, không có chuỗi hoa hồng tầng dưới.
     · Điều 13 — hồ sơ không mang dữ liệu nhận dạng ra khỏi hệ.
     · Giá là Vùng Đỏ — bản này không đặt giá, không hứa giảm giá.
   ═══════════════════════════════════════════════════════════════ */

export const BP_META = Object.freeze({
  ten: 'GITA 365 VVIP — MASTER BLUEPRINT',
  phu: 'Bộ hồ sơ khách hàng cao cấp và hệ thống 10.000 điểm chạm WOW tạo tăng trưởng doanh thu bền vững',
  phienBan: '1.0 · kiến trúc chiến lược',
  doiTuong: 'Ban điều hành · Super Admin · Marketing · Tư vấn tuyển sinh · Chăm sóc phụ huynh · đội ngũ Coach',
  luanDiem: 'Một hệ thống tăng trưởng dựa trên giá trị khách hàng trọn đời, thay vì chỉ là hệ thống quảng cáo, tuyển sinh và chăm sóc khách hàng thông thường.',
  sauNangLuc: [
    { ten: 'Hiểu khách hàng', y: 'Nhu cầu học tập, kỳ vọng của phụ huynh, mục tiêu phát triển của học sinh, trở ngại thực tế.', trongHe: 'Hồ sơ 12 tài liệu (hoSoVvip) · chân dung khách (chan-dung-kh)' },
    { ten: 'Thiết kế sản phẩm cao cấp', y: 'Chương trình có giá trị rõ ràng, lộ trình phù hợp, trải nghiệm khác biệt.', trongHe: 'Sáu sản phẩm trỏ vào chương trình đang chạy (SAN_PHAM_6)' },
    { ten: 'Thu hút đúng đối tượng', y: 'Chiến dịch marketing, nội dung chuyên môn, nhận diện thương hiệu, kênh giới thiệu.', trongHe: 'Sáu động cơ · mười chiến dịch (chienDichVvip)' },
    { ten: 'Chăm sóc xuyên suốt', y: 'Đồng hành trước, trong và sau khi khách dùng dịch vụ.', trongHe: 'Thư viện điểm chạm (diemChamWow) → sổ chạm (ghiCham)' },
    { ten: 'Phát triển quan hệ dài hạn', y: 'Khách thấy tiến bộ, tiếp tục chương trình phù hợp, tự nguyện giới thiệu.', trongHe: 'Chín cổng chuyển đổi · nhà giới thiệu (hoSoKhach.boTro)' },
    { ten: 'Đo lường và tối ưu', y: 'Nối dữ liệu, doanh thu, chất lượng dịch vụ và hiệu quả từng điểm chạm.', trongHe: 'Bảng điều khiển 80% và mười KPI (bangVvip)' }
  ],
  muc80: 'Mục tiêu nhóm khách trọng điểm đóng góp 80% doanh thu là MỤC TIÊU CHIẾN LƯỢC CẦN KIỂM CHỨNG BẰNG DỮ LIỆU, không phải kết quả chắc chắn — đạt bằng giá trị thực, chất lượng phục vụ và sự phù hợp của sản phẩm, không bằng áp lực mua hàng hay khai thác quá mức thông tin của phụ huynh.'
});

/* ═══ PHẦN I · TƯ TƯỞNG CỐT LÕI CỦA CÂY TIỀN → MÔ HÌNH GITA 365 ═══ */
export const BP_CAY_TIEN = Object.freeze({
  nguon: 'Cây Tiền — Lý Tiễn. Trọng tâm theo thông tin sách của Thái Hà Books: chiến lược phát triển khách hàng lớn, hiểu khách hàng, phân tích đối thủ, dự báo khả năng sinh lợi, kế hoạch phục vụ, quản lý giá trị khách hàng, quan hệ đối tác lâu dài. Phần sách đã tiêu hoá chi tiết nằm ở màn Cây tiền (kho mã hoá).',
  chuyenHoa: [
    { ten: 'Chọn đúng khách hàng trọng điểm', y: 'Không chỉ nhìn mức chi tiêu: nhu cầu giáo dục, mức phù hợp với chương trình, khả năng đồng hành cùng con, nhu cầu dài hạn, khả năng giới thiệu tự nguyện.', trongHe: 'Bảy dấu hiệu của cửa nhanDienVvip — doanh thu chỉ là MỘT trong bảy' },
    { ten: 'Hiểu sâu trước khi tư vấn', y: 'Hồ sơ phụ huynh, hồ sơ học sinh, mục tiêu, mong đợi, rào cản, lịch sử tương tác. Chỉ thu thông tin thực sự cần, có mục đích rõ.', trongHe: 'Hồ sơ 12 tài liệu — mỗi trường khai mục đích; tài liệu 04 cần đồng ý dữ liệu con' },
    { ten: 'Tạo giá trị vượt khỏi khoá học', y: 'Hệ sinh thái: chương trình, cố vấn phù hợp, báo cáo tiến bộ, tài liệu gia đình, cộng đồng phụ huynh, cột mốc phát triển.', trongHe: 'Sáu sản phẩm · tài liệu gia đình · cộng đồng' },
    { ten: 'Phát triển giá trị trọn đời', y: 'Lộ trình tiếp nối dựa trên kết quả thực tế, nhu cầu mới và sự đồng thuận. Khách ở lại vì thấy giá trị, không vì bị thúc ép.', trongHe: 'Quy tắc chuyển tiếp sản phẩm — chỉ đề xuất khi có nhu cầu + bằng chứng giá trị + năng lực phục vụ' },
    { ten: 'Xây dựng quan hệ đối tác chiến lược', y: 'Mạng lưới phụ huynh đồng hành, chuyên gia, trường học, đối tác phù hợp; minh bạch, quyền lợi đôi bên, tự nguyện.', trongHe: 'Tài liệu 11 · chiến dịch Đối tác giáo dục' }
  ],
  nguyenTac: [
    { ten: 'Nguyên tắc 80/20', y: 'Xem nhóm khách tạo phần lớn doanh thu hoặc lợi nhuận để phân bổ nguồn lực. Là GIẢ THUYẾT quản trị cần kiểm chứng bằng dữ liệu GITA, không phải quy luật đúng mọi lúc.', trongHe: 'Đường cong tập trung doanh thu tính từ phieuThu mỗi lần mở bảng' },
    { ten: 'Nguyên tắc giá trị hai chiều', y: 'Khách nhận kết quả giáo dục và dịch vụ tương xứng; GITA nhận doanh thu và lợi nhuận đủ để phát triển.', trongHe: 'Tài liệu 09 Kinh tế khách hàng cạnh tài liệu 06 Lộ trình — đặt hai chiều cạnh nhau' },
    { ten: 'Nguyên tắc phục vụ có hệ thống', y: 'Mỗi khách có hành trình, người phụ trách, lịch chăm sóc, tiêu chuẩn chất lượng, phương án tiếp nối rõ ràng.', trongHe: 'Đồng hồ nhịp chạm + người phụ trách + ngày hẹn tiếp (soatPhucVuVvip)' }
  ]
});

/* ═══ PHẦN II · BỘ HỒ SƠ VVIP — 12 TÀI LIỆU ═══
   nguon: 'nhap' = người phụ trách viết · 'may' = máy ghép từ sổ thật, không
   ai gõ · 'ghep' = phần viết + phần máy. Một con số máy tính được mà để người
   gõ thì nó là một lời khai mang dấu của phép đo (luật kho).
   Mỗi trường khai `vi` — mục đích. Trường không có mục đích thì không thu. */
export const HO_SO_12 = Object.freeze([
  { ma: '01', ten: 'Hồ sơ điều hành VVIP', en: 'VVIP Executive Profile', nguon: 'ghep',
    muc: 'Tổng quan gia đình, mối quan tâm, mục tiêu, chương trình đang tham gia và người phụ trách.',
    truong: [
      { k: 'tongQuan', t: 'Bức tranh gia đình (một đoạn)', batBuoc: true, vi: 'Người mới nhận ca đọc 30 giây là hiểu nhà' },
      { k: 'moiQuanTam', t: 'Mối quan tâm lớn nhất hiện nay', batBuoc: true, vi: 'Mọi lượt chạm phải nối về điều này' },
      { k: 'mucTieuUuTien', t: 'Mục tiêu giáo dục ưu tiên', batBuoc: true, vi: 'Căn cứ đo giá trị đã tạo' }],
    may: 'Mã hồ sơ · nhóm phục vụ · tầng học · người phụ trách · lần rà soát tiếp theo — đọc từ sổ.' },
  { ma: '02', ten: 'Nhu cầu và mục tiêu gia đình', en: 'Family Needs & Goals', nguon: 'nhap',
    muc: 'Nhu cầu giáo dục, mong muốn của phụ huynh, mục tiêu học tập và phát triển của học sinh.',
    truong: [
      { k: 'nhuCau', t: 'Nhu cầu giáo dục gia đình nói ra', batBuoc: true, vi: 'Ghi bằng lời của gia đình, không bằng lời của người bán' },
      { k: 'mongDoiPhuHuynh', t: 'Mong đợi của phụ huynh', batBuoc: true, vi: 'Đối chiếu với cam kết để không hứa quá' },
      { k: 'mucTieuHocSinh', t: 'Mục tiêu do học sinh cùng xác lập', batBuoc: true, vi: 'Mục tiêu của con phải có tiếng nói của con' },
      { k: 'khoKhan', t: 'Khó khăn gia đình đã chia sẻ', batBuoc: false, vi: 'Chỉ ghi điều gia đình tự nói; KHÔNG dùng để tạo áp lực bán (Điều 5)' },
      { k: 'dieuKienTuNguyen', t: 'Thời gian, hình thức học, ngân sách — do gia đình tự nguyện cung cấp', batBuoc: false, vi: 'Để đề xuất vừa sức; bỏ trống nếu gia đình không muốn nói' }] },
  { ma: '03', ten: 'Bản đồ quan hệ khách hàng', en: 'Customer Relationship Map', nguon: 'ghep',
    muc: 'Người ra quyết định, người dùng dịch vụ, người phối hợp và các kênh liên lạc được đồng thuận.',
    truong: [
      { k: 'nguoiQuyetDinh', t: 'Người ra quyết định (vai trong nhà, không ghi số giấy tờ)', batBuoc: true, vi: 'Gặp đúng người khi cần quyết' },
      { k: 'nguoiSuDung', t: 'Người dùng dịch vụ hằng ngày', batBuoc: true, vi: 'Hướng dẫn đúng người dùng' },
      { k: 'nguoiPhoiHop', t: 'Người phối hợp (ông bà, người giúp việc…)', batBuoc: false, vi: 'Để nhịp ở nhà không đứt khi bố mẹ vắng' }],
    may: 'Kênh liên lạc và tần suất mong muốn đọc từ sổ tuỳ chọn liên hệ (tuyChonLienHe) — gia đình đổi lúc nào cũng được.' },
  { ma: '04', ten: 'Hồ sơ học tập và phát triển', en: 'Learning & Development Profile', nguon: 'nhap', conCan: true,
    muc: 'Năng lực hiện tại, điểm mạnh, khó khăn, thói quen và mục tiêu tiến bộ của học sinh.',
    truong: [
      { k: 'nangLuc', t: 'Năng lực hiện tại (quan sát được)', batBuoc: true, vi: 'Mốc gốc để thấy tiến bộ' },
      { k: 'diemManh', t: 'Điểm mạnh', batBuoc: true, vi: 'Dựng trên điểm mạnh trước' },
      { k: 'thoiQuen', t: 'Thói quen hiện có', batBuoc: false, vi: 'Chọn việc nhỏ đầu tiên' },
      { k: 'mucTieuTienBo', t: 'Mục tiêu tiến bộ — viết thành hành vi quan sát được', batBuoc: true, vi: 'Không viết thành lời hứa kết quả (Điều 4)' }] },
  { ma: '05', ten: 'Bản thiết kế dịch vụ VVIP', en: 'VVIP Service Blueprint', nguon: 'may',
    muc: 'Tiêu chuẩn phục vụ, thời gian phản hồi, đầu mối hỗ trợ, phương án xử lý, mức cá nhân hoá.',
    may: 'Ghép từ nhóm phục vụ (nhịp chạm), người phụ trách đã phân công kèm hạng nhân sự, và chuẩn phục vụ theo hạng (màn Phân hạng VIP & VVIP). Không ai gõ tay để không hứa ngoài chuẩn.' },
  { ma: '06', ten: 'Lộ trình phát triển cá nhân hoá', en: 'Personalized Growth Roadmap', nguon: 'nhap',
    muc: 'Lộ trình 30–90–365 ngày, mốc đánh giá, nguồn lực và các phương án tiếp nối.',
    truong: [
      { k: 'moc30', t: 'Mốc 30 ngày', batBuoc: true, vi: 'Một thay đổi nhỏ thấy được sớm' },
      { k: 'moc90', t: 'Mốc 90 ngày', batBuoc: true, vi: 'Điểm đánh giá đầu tiên có số liệu' },
      { k: 'moc365', t: 'Mốc 365 ngày', batBuoc: true, vi: 'Đích của năm đồng hành' },
      { k: 'nguonLuc', t: 'Nguồn lực cần (người, thời gian, tài liệu)', batBuoc: false, vi: 'Để không cam kết điều không có người làm' }] },
  { ma: '07', ten: 'Nhật ký hành trình và WOW', en: 'Customer Journey & WOW Log', nguon: 'may',
    muc: 'Lịch sử tương tác, trải nghiệm có ý nghĩa, phản hồi và cột mốc đáng ghi nhận.',
    may: 'Đọc thẳng sổ chạm (soCham) — mọi lượt chạm, mã điểm chạm thư viện (DC:…) và khung W01–W20 đã có. Một nhật ký gõ tay song song sẽ lệch sổ.' },
  { ma: '08', ten: 'Sản phẩm phù hợp và đề xuất', en: 'Product Fit & Recommendation', nguon: 'nhap',
    muc: 'Chương trình phù hợp, điều kiện tham gia, kết quả kỳ vọng, chi phí và lựa chọn thay thế.',
    truong: [
      { k: 'sanPham', t: 'Sản phẩm đề xuất (mã SP1–SP6)', batBuoc: true, vi: 'Trỏ về danh mục chuẩn' },
      { k: 'lyDoPhuHop', t: 'Lý do phù hợp — dựa trên tài liệu 02 và 04', batBuoc: true, vi: 'Đề xuất phải có căn cứ' },
      { k: 'luaChonThayThe', t: 'Lựa chọn thay thế (kể cả "chưa cần thêm")', batBuoc: true, vi: 'Không có đường thay thế thì đề xuất thành ép' }],
    may: 'Chi phí đọc từ bảng giá đang chạy — người viết không gõ con số giá (giá là Vùng Đỏ).' },
  { ma: '09', ten: 'Giá trị và kinh tế khách hàng', en: 'Customer Value & Economics', nguon: 'may', taiChinh: true,
    muc: 'Doanh thu, chi phí phục vụ, biên lợi nhuận đóng góp, khả năng duy trì và giá trị vòng đời ước tính.',
    may: 'Doanh thu thực thu và hoàn tiền tính từ phiếu thu đã duyệt. Chi phí trực tiếp phục vụ theo nhà CHƯA có trong sổ, nên biên lợi nhuận đóng góp để trống và nói ra — không ước bừa. Chỉ R01–R03 đọc.' },
  { ma: '10', ten: 'Kế hoạch duy trì và tiếp nối', en: 'Retention & Continuity Plan', nguon: 'ghep',
    muc: 'Dấu hiệu giảm tương tác, rủi ro không hài lòng, kế hoạch khắc phục và lộ trình tiếp tục phù hợp.',
    truong: [
      { k: 'keHoachKhacPhuc', t: 'Kế hoạch khắc phục nếu có dấu hiệu', batBuoc: false, vi: 'Mỗi dấu hiệu một việc' },
      { k: 'loTrinhTiep', t: 'Lộ trình tiếp tục phù hợp', batBuoc: true, vi: 'Tổng kết kết quả trước khi nói chương trình tiếp' }],
    may: 'Dấu hiệu đọc từ sổ: số ngày từ lượt chạm cuối, đèn của nhà, phiếu hài lòng gần nhất, yêu cầu hoàn tiền.' },
  { ma: '11', ten: 'Kế hoạch giới thiệu và đối tác', en: 'Referral & Partnership Plan', nguon: 'ghep',
    muc: 'Cơ hội giới thiệu tự nguyện, hoạt động cộng đồng và hợp tác giáo dục khi có sự đồng ý.',
    truong: [
      { k: 'coHoiTuNguyen', t: 'Cơ hội giới thiệu gia đình đã tự nói ra', batBuoc: false, vi: 'Không giao chỉ tiêu giới thiệu cho gia đình' },
      { k: 'hopTac', t: 'Hoạt động cộng đồng / hợp tác giáo dục gia đình muốn tham gia', batBuoc: false, vi: 'Chỉ khi gia đình đồng ý' }],
    may: 'Số nhà đã giới thiệu trực tiếp đọc từ hoSoKhach.boTro. Không có tầng dưới (Điều 6).' },
  { ma: '12', ten: 'Quyền riêng tư, đồng ý và kiểm toán', en: 'Privacy, Consent & Audit', nguon: 'may',
    muc: 'Mục đích dùng dữ liệu, sự đồng ý, quyền truy cập, thời hạn lưu trữ, chỉnh sửa và xoá dữ liệu.',
    may: 'Đọc thẳng sổ đồng ý (dongYDuLieu), yêu cầu xoá (yeuCauXoa) và nhật ký mọi lượt mở hồ sơ này. Gia đình đọc được bản của chính mình qua quyền đọc dữ liệu (xuatDuLieuNha).' }
]);

/* Năm câu hỏi bộ hồ sơ phải trả lời được — đây là phép thử của hồ sơ. */
export const NAM_CAU_HOI = Object.freeze([
  'Gia đình đang cần giải quyết vấn đề gì?',
  'Kết quả nào thực sự có ý nghĩa với phụ huynh và học sinh?',
  'GITA có chương trình phù hợp để hỗ trợ không?',
  'Chúng ta cần làm gì, vào thời điểm nào và ai chịu trách nhiệm?',
  'Làm thế nào để đo lường giá trị đã tạo ra và cơ hội tiếp nối phù hợp?'
]);

/* ═══ NĂM NHÓM QUẢN TRỊ ═══
   cach: 'quyet' = người đề xuất + người duyệt (bảng hangVvip) · 'may' = máy
   tính lúc đọc. Recovery là TRẠNG THÁI, không phải hạng: một nhà VVIP đang
   vướng mắc vẫn là VVIP, nhưng lúc ấy giải quyết vấn đề đứng trước mọi đề
   xuất sản phẩm. nhip: số ngày tối đa giữa hai lượt chạm chủ động.
   VVIP 4 ngày nối với tầng chăm sóc A "chạm 2 lần/tuần" (do-luong-cham.js). */
export const NHOM_5 = Object.freeze([
  { ma: 'VVIP', ten: 'VVIP — Strategic', cach: 'quyet', nhip: 4, nguoi: ['A'],
    dacDiem: 'Quan hệ dài hạn, nhu cầu đa dạng, phù hợp nhiều chương trình',
    phucVu: 'Quản lý quan hệ riêng, kế hoạch phát triển tổng thể, rà soát định kỳ' },
  { ma: 'VIP', ten: 'VIP — Growth', cach: 'quyet', nhip: 7, nguoi: ['A', 'B'],
    dacDiem: 'Có mục tiêu rõ ràng, tiềm năng phát triển thêm',
    phucVu: 'Lộ trình cá nhân hoá, báo cáo tiến bộ và tư vấn theo mốc' },
  { ma: 'CORE', ten: 'Core — Active', cach: 'may', nhip: 14,
    dacDiem: 'Đang tham gia chương trình cụ thể',
    phucVu: 'Chuẩn hoá onboarding, hướng dẫn, hỗ trợ và đánh giá' },
  { ma: 'NURTURE', ten: 'Nurture — Exploring', cach: 'may',
    dacDiem: 'Đang tìm hiểu, chưa sẵn sàng quyết định',
    phucVu: 'Nội dung hữu ích, tư vấn minh bạch, cho phép tự chọn thời điểm liên hệ' },
  { ma: 'RECOVERY', ten: 'Recovery — Needs Support', cach: 'may', nhip: 2,
    dacDiem: 'Đang có vướng mắc hoặc trải nghiệm chưa tốt',
    phucVu: 'Ưu tiên giải quyết vấn đề trước khi đề xuất sản phẩm mới' }
]);
export const LUAT_NHOM = 'Khách hàng có mức chi tiêu thấp hơn vẫn phải nhận được chất lượng giáo dục đã cam kết. Phân tầng nhằm điều phối dịch vụ phù hợp, không phải để phân biệt giá trị con người.';

/* ═══ PHẦN III · 10K WOW TOUCHPOINT ENGINE ═══ */
export const GIAI_DOAN_5 = Object.freeze([
  { ma: 'G1', ten: 'Nhận diện và thu hút', phanBo: 1500, gom: 'SEO, nội dung chuyên môn, video, cộng đồng, quảng cáo, sự kiện, đối tác' },
  { ma: 'G2', ten: 'Tìm hiểu và xây dựng niềm tin', phanBo: 1500, gom: 'Tài liệu hướng dẫn, đánh giá nhu cầu, tư vấn, giải đáp, trải nghiệm thử' },
  { ma: 'G3', ten: 'Đăng ký và khởi động', phanBo: 1200, gom: 'Tư vấn chương trình, xác nhận kỳ vọng, onboarding, hướng dẫn sử dụng' },
  { ma: 'G4', ten: 'Chăm sóc và tạo trải nghiệm WOW', phanBo: 2500, gom: 'Theo dõi hành trình, hỗ trợ đúng lúc, ghi nhận nỗ lực, xử lý khó khăn' },
  { ma: 'G5', ten: 'Duy trì và phát triển giá trị', phanBo: 1800, gom: 'Đánh giá kết quả, lộ trình tiếp nối, giới thiệu tự nguyện, hợp tác dài hạn' }
]);
/* Năm con số phân bổ lấy NGUYÊN VĂN bản Blueprint, và cộng lại ra 8.500
   chứ không phải 10.000 như dòng tổng của chính bản ấy. Máy không tự san
   1.500 điểm còn lại vào giai đoạn nào — đó là quyết định của chủ hệ (QD6);
   phần chưa phân bổ được nêu riêng thay vì làm tròn cho khớp. */
export const SUC_CHUA_WOW = 10000;
export const CHUA_PHAN_BO = SUC_CHUA_WOW - GIAI_DOAN_5.reduce((s, g) => s + g.phanBo, 0);
export const QUY_MO_WOW = 'Quy mô thiết kế 10.000 là SỨC CHỨA của thư viện, không phải số nội dung đã biên soạn hay kiểm thử, và không phải chỉ tiêu chạy cho đủ (luật SUP-01). Bắt đầu bằng 100 điểm chạm đầu tiên; sau 90 ngày vận hành thử thì điều chỉnh phân bổ theo nhu cầu thật.';
export const LOP_7 = Object.freeze([
  { k: 'doiTuong', ten: 'Đúng người', hoi: 'Ai đang cần hỗ trợ?' },
  { k: 'thoiDiem', ten: 'Đúng thời điểm', hoi: 'Điều gì vừa xảy ra trong hành trình?' },
  { k: 'nhuCau', ten: 'Đúng nhu cầu', hoi: 'Khách đang cần biết, làm hoặc giải quyết điều gì?' },
  { k: 'thongDiep', ten: 'Đúng thông điệp', hoi: 'Nội dung nào hữu ích và phù hợp nhất?' },
  { k: 'hanhDong', ten: 'Đúng hành động', hoi: 'Khách có thể làm bước tiếp theo nào?' },
  { k: 'chiuTrachNhiem', ten: 'Đúng người chịu trách nhiệm', hoi: 'AI làm phần nào, khi nào cần nhân sự?' },
  { k: 'doLuong', ten: 'Đo lường được', hoi: 'Điểm chạm giúp khách tiến bộ hay giúp GITA cải thiện điều gì?' }
]);
export const NHOM_WOW_10 = Object.freeze([
  { ma: 'WOW01', ten: 'Được thấu hiểu', vd: 'Tóm tắt đúng mục tiêu phụ huynh đã chia sẻ' },
  { ma: 'WOW02', ten: 'Được định hướng', vd: 'Bản đồ lộ trình phát triển của học sinh' },
  { ma: 'WOW03', ten: 'Được hướng dẫn', vd: 'Bộ công cụ giúp gia đình bắt đầu dễ dàng' },
  { ma: 'WOW04', ten: 'Được đồng hành', vd: 'Nhắc lịch theo thoả thuận và hỗ trợ khi cần' },
  { ma: 'WOW05', ten: 'Nhìn thấy tiến bộ', vd: 'Báo cáo trước–sau dựa trên dữ liệu phù hợp' },
  { ma: 'WOW06', ten: 'Được ghi nhận', vd: 'Ghi nhận nỗ lực và cột mốc của học sinh' },
  { ma: 'WOW07', ten: 'Được trao quyền', vd: 'Công cụ để phụ huynh và học sinh tự theo dõi' },
  { ma: 'WOW08', ten: 'Được kết nối', vd: 'Hoạt động cộng đồng có giá trị giáo dục' },
  { ma: 'WOW09', ten: 'Được phục vụ chu đáo', vd: 'Xử lý vấn đề rõ người, rõ thời hạn' },
  { ma: 'WOW10', ten: 'Được phát triển dài hạn', vd: 'Đề xuất bước tiếp theo khi đã có căn cứ' }
]);
export const WOW_KHONG_DAT = 'Một điểm chạm tốt không nhất thiết phải đắt tiền. Một báo cáo đúng lúc, một hướng dẫn dễ áp dụng, hay một vấn đề được xử lý đến nơi đến chốn có giá trị hơn quà tặng.';

/* Mười điểm chạm mẫu — triển khai được ngay. R01 nạp vào thư viện ở trạng
   thái CHỜ DUYỆT; một người khác chấm đủ mười tiêu chuẩn mới bật được. */
export const MAU_DIEM_CHAM_10 = Object.freeze([
  { ma: 'DC-M01', giaiDoan: 'G1', nhomWow: 'WOW02', kieuCham: 'nhan', ten: 'Bản đồ 5 câu hỏi về hành trình học tập của con',
    doiTuong: 'Phụ huynh mới biết GITA qua nội dung hoặc người quen', thoiDiem: 'Phụ huynh để lại liên hệ và đồng ý nhận tài liệu',
    nhuCau: 'Gọi tên được mục tiêu, khó khăn và ưu tiên hỗ trợ của con', thongDiep: 'Gửi tài liệu tự đánh giá năm câu hỏi kèm cách đọc kết quả, không kèm lời mời mua',
    hanhDong: 'Tự hoàn thành năm câu hỏi; nếu muốn, đặt một buổi trò chuyện 15 phút', chiuTrachNhiem: 'AI gửi tài liệu đã duyệt; tư vấn viên nhận yêu cầu tư vấn',
    doLuong: 'Lượt tải tài liệu · tỷ lệ hoàn thành tự nguyện · số yêu cầu tư vấn phù hợp' },
  { ma: 'DC-M02', giaiDoan: 'G2', nhomWow: 'WOW01', kieuCham: 'buoi', ten: 'Buổi trò chuyện định hướng 15 phút',
    doiTuong: 'Phụ huynh đã gửi yêu cầu tư vấn', thoiDiem: 'Trong 24 giờ sau khi yêu cầu được giao người',
    nhuCau: 'Được nghe trước khi được tư vấn', thongDiep: 'Lắng nghe trước, tư vấn sau; kết thúc bằng một hoặc hai bước hành động phù hợp',
    hanhDong: 'Gia đình chọn một bước tiếp theo — kể cả "chưa cần thêm"', chiuTrachNhiem: 'Tư vấn viên (người thật)',
    doLuong: 'Tỷ lệ tham dự · mức độ phù hợp · phản hồi sau buổi tư vấn' },
  { ma: 'DC-M03', giaiDoan: 'G2', nhomWow: 'WOW01', kieuCham: 'nhan', ten: 'Bản đồ mục tiêu cá nhân hoá',
    doiTuong: 'Gia đình vừa có buổi định hướng', thoiDiem: 'Trong 48 giờ sau buổi định hướng',
    nhuCau: 'Thấy nhu cầu của mình được ghi lại đúng', thongDiep: 'Tổng hợp mục tiêu, điểm mạnh, khó khăn đã xác định và phương án hỗ trợ có thể cân nhắc',
    hanhDong: 'Phụ huynh xác nhận bản đồ đúng, hoặc sửa chỗ chưa đúng', chiuTrachNhiem: 'AI soạn nháp từ ghi chép; tư vấn viên duyệt và gửi',
    doLuong: 'Tỷ lệ phụ huynh xác nhận bản đồ phản ánh đúng nhu cầu' },
  { ma: 'DC-M04', giaiDoan: 'G2', nhomWow: 'WOW02', kieuCham: 'nhan', ten: 'Bảng so sánh chương trình minh bạch',
    doiTuong: 'Gia đình đang cân nhắc giữa các lựa chọn', thoiDiem: 'Khi gia đình hỏi về chương trình hoặc chi phí',
    nhuCau: 'Hiểu rõ khác biệt để tự quyết', thongDiep: 'Mục tiêu, thời lượng, phương pháp, chi phí theo bảng giá đang chạy và trường hợp phù hợp của từng lựa chọn',
    hanhDong: 'Gia đình tự chọn, hoặc hỏi thêm', chiuTrachNhiem: 'Tư vấn viên; con số giá lấy từ bảng giá, không gõ tay',
    doLuong: 'Mức hiểu rõ chương trình · tỷ lệ chuyển đổi của nhóm phù hợp · tỷ lệ hoàn tiền' },
  { ma: 'DC-M05', giaiDoan: 'G3', nhomWow: 'WOW03', kieuCham: 'nhan', ten: 'Welcome Kit của gia đình GITA',
    doiTuong: 'Gia đình vừa đăng ký', thoiDiem: 'Ngay sau khi tài khoản được kích hoạt',
    nhuCau: 'Biết bắt đầu từ đâu, hỏi ai', thongDiep: 'Lịch trình, hướng dẫn dùng hệ thống, đầu mối hỗ trợ và những việc cần chuẩn bị',
    hanhDong: 'Hoàn thành bước khởi động đầu tiên trong app', chiuTrachNhiem: 'AI gửi bộ đã duyệt; người phụ trách gọi chào trong 24 giờ',
    doLuong: 'Tỷ lệ hoàn thành onboarding · số lỗi sử dụng · thời gian tới hành động đầu tiên' },
  { ma: 'DC-M06', giaiDoan: 'G3', nhomWow: 'WOW06', kieuCham: 'nhan', ten: 'Một chiến thắng nhỏ trong 24 giờ đầu',
    doiTuong: 'Học sinh của gia đình vừa vào', thoiDiem: 'Ngày đầu tiên',
    nhuCau: 'Hiểu cách bắt đầu mà không bị ngợp', thongDiep: 'Một hoạt động vừa sức để làm xong ngay, thay vì nhận quá nhiều tài liệu',
    hanhDong: 'Học sinh hoàn thành hoạt động đầu tiên', chiuTrachNhiem: 'Coach phụ trách chọn hoạt động; app nhắc',
    doLuong: 'Tỷ lệ thực hiện hoạt động đầu tiên · phản hồi của học sinh' },
  { ma: 'DC-M07', giaiDoan: 'G4', nhomWow: 'WOW05', kieuCham: 'nhan', ten: 'Bản tin tiến độ ngắn gọn',
    doiTuong: 'Phụ huynh đã qua tuần đầu', thoiDiem: 'Cuối tuần đầu, rồi theo nhịp đã thống nhất',
    nhuCau: 'Biết con đang ở đâu mà không phải hỏi', thongDiep: 'Những gì đã hoàn thành, việc cần cải thiện và một gợi ý cho tuần kế tiếp',
    hanhDong: 'Phụ huynh làm thử gợi ý tuần sau', chiuTrachNhiem: 'AI soạn nháp từ dữ liệu được phép dùng; coach duyệt',
    doLuong: 'Mức hữu ích của báo cáo · tỷ lệ hoàn thành mục tiêu tuần' },
  { ma: 'DC-M08', giaiDoan: 'G4', nhomWow: 'WOW09', kieuCham: 'goi', ten: 'Cơ chế hỗ trợ không bỏ sót',
    doiTuong: 'Học sinh gặp trở ngại hoặc phụ huynh báo vấn đề', thoiDiem: 'Ngay khi vấn đề được báo',
    nhuCau: 'Có người nhận, có hạn, có kết quả', thongDiep: 'Tạo yêu cầu hỗ trợ, giao người phụ trách, gọi lại và theo dõi đến khi có phản hồi',
    hanhDong: 'Gia đình xác nhận vấn đề đã được xử lý', chiuTrachNhiem: 'Người phụ trách (người thật); quản lý nhận nếu quá hạn',
    doLuong: 'Thời gian phản hồi · tỷ lệ xử lý đúng hạn · hài lòng sau xử lý' },
  { ma: 'DC-M09', giaiDoan: 'G5', nhomWow: 'WOW05', kieuCham: 'buoi', ten: 'Báo cáo tổng kết hành trình',
    doiTuong: 'Gia đình sắp kết thúc một chương trình', thoiDiem: 'Hai tuần trước mốc kết thúc',
    nhuCau: 'Thấy rõ đã đổi được gì so với mục tiêu ban đầu', thongDiep: 'Đối chiếu mục tiêu ban đầu với kết quả thực tế, nêu tiến bộ, hạn chế và đề xuất tiếp theo nếu cần',
    hanhDong: 'Gia đình quyết bước tiếp theo trong thời gian của họ', chiuTrachNhiem: 'Coach hạng A trình bày; AI ghép dữ liệu',
    doLuong: 'Mức độ đạt mục tiêu · tỷ lệ hoàn thành · chất lượng phản hồi' },
  { ma: 'DC-M10', giaiDoan: 'G5', nhomWow: 'WOW08', kieuCham: 'nhan', ten: 'Lời mời chia sẻ trải nghiệm tự nguyện',
    doiTuong: 'Gia đình đã hài lòng (phiếu hài lòng cao)', thoiDiem: 'Sau một cột mốc có bằng chứng tiến bộ',
    nhuCau: 'Được chia sẻ điều mình thấy đáng giá', thongDiep: 'Mời chia sẻ phản hồi hoặc giới thiệu cho người quen nếu thấy phù hợp',
    hanhDong: 'Gia đình chia sẻ hoặc giới thiệu — hoặc không, và không ai hỏi lại', chiuTrachNhiem: 'Người phụ trách quan hệ',
    doLuong: 'Số giới thiệu được đồng ý · tỷ lệ khách mới phù hợp · chất lượng trải nghiệm của cả hai bên' }
]);

/* Năm quy tắc tần suất — có răng ở cửa kichHoatDiemCham. */
export const TAN_SUAT_5 = Object.freeze([
  { ma: 'TS1', y: 'Mỗi khách có giới hạn tần suất liên lạc theo kênh và mong muốn đã thống nhất.', rang: 'Trần mặc định mỗi 7 ngày (nhắn 3 · gọi 2 · buổi 1), gia đình khai thấp hơn thì theo gia đình' },
  { ma: 'TS2', y: 'Một vấn đề không được tạo ra nhiều tin nhắn trùng lặp từ Marketing, Tư vấn và Chăm sóc khách hàng.', rang: 'Cùng một điểm chạm cho cùng một nhà trong 14 ngày bị chặn, bất kể ai gửi' },
  { ma: 'TS3', y: 'Khi phụ huynh đã đăng ký, nội dung chăm sóc học tập được ưu tiên hơn nội dung quảng bá.', rang: 'Điểm chạm giai đoạn G1–G2 không gửi cho nhà đang học' },
  { ma: 'TS4', y: 'Nếu khách từ chối hoặc huỷ nhận tin, hệ thống cập nhật và ngừng các chiến dịch tương ứng.', rang: 'Tuỳ chọn "không nhận quảng bá" chặn mọi điểm chạm quảng bá và mọi chiến dịch marketing' },
  { ma: 'TS5', y: 'Khiếu nại, quyền riêng tư, dữ liệu học sinh hoặc cam kết chuyên môn phải chuyển cho người có trách nhiệm.', rang: 'Nhà ở nhóm Recovery chỉ nhận điểm chạm hỗ trợ (WOW09) do người thật làm' }
]);
export const TRAN_TAN_SUAT = Object.freeze({ nhan: 3, goi: 2, buoi: 1, wow: 3 });

/* Mười tiêu chuẩn để một trải nghiệm được công nhận là WOW — người duyệt
   phải tích đủ cả mười mới bật được điểm chạm. */
export const CHUAN_WOW_10 = Object.freeze([
  'Giải quyết nhu cầu thực tế của khách hàng',
  'Đúng thời điểm và không làm phiền',
  'Có giá trị cụ thể, không chỉ mang tính trang trí',
  'Ngôn ngữ tự nhiên, tôn trọng và phù hợp giáo dục',
  'Không đưa ra lời hứa vượt quá năng lực',
  'Có hành động tiếp theo rõ ràng',
  'Có người hoặc hệ thống chịu trách nhiệm',
  'Đo lường được kết quả',
  'Bảo vệ dữ liệu và quyền riêng tư',
  'Được kiểm thử trước khi triển khai rộng'
]);

/* ═══ PHẦN IV · HỆ SẢN PHẨM VÀ DỊCH VỤ ═══
   Tên là ĐỀ XUẤT KIẾN TRÚC của bản Blueprint — không khẳng định GITA đã
   triển khai. Ô `tro` nói chương trình đang chạy gần nhất trong hệ; giá đọc
   từ bảng giá, không đặt ở đây. */
export const SAN_PHAM_6 = Object.freeze([
  { ma: 'SP1', ten: 'GITA Discovery', vai: 'Khám phá và định hướng', gom: ['Tài liệu tự đánh giá', 'Workshop', 'Buổi tư vấn định hướng'],
    giup: 'Gia đình hiểu vấn đề và chọn bước tiếp theo', tro: ['assessment', 'cua-truoc'] },
  { ma: 'SP2', ten: 'GITA Growth 7/21', vai: 'Bắt đầu hình thành thói quen và mục tiêu', gom: ['Chương trình 7 ngày và 21 ngày', 'Bài tập, hướng dẫn, cơ chế phản hồi'],
    giup: 'Học sinh trải nghiệm phương pháp trước khi chọn lộ trình dài', tro: ['hom-nay', 'thoi-quen'] },
  { ma: 'SP3', ten: 'GITA Transformation 90', vai: 'Lộ trình phát triển 90 ngày', gom: ['Mục tiêu, lịch học, công cụ theo dõi', 'Đánh giá định kỳ theo tiêu chí đã thống nhất'],
    giup: 'Kết hợp tự học, huấn luyện và hỗ trợ gia đình tuỳ gói', tro: ['ban-do', 'tien-bo'] },
  { ma: 'SP4', ten: 'GITA 365 Family Growth', vai: 'Đồng hành phát triển 365 ngày', gom: ['Kế hoạch theo giai đoạn', 'Đánh giá tiến bộ', 'Thư viện tài liệu', 'Tư vấn gia đình theo lịch'],
    giup: 'Gia đình muốn duy trì quá trình phát triển dài hạn', tro: ['hanh-trinh-5-tang', 'ban-do'] },
  { ma: 'SP5', ten: 'GITA VVIP Mentoring', vai: 'Cố vấn cá nhân hoá cao', gom: ['Đầu mối quản lý quan hệ riêng', 'Kế hoạch phát triển cá nhân hoá', 'Báo cáo định kỳ', 'Phản hồi ưu tiên'],
    giup: 'Gia đình VVIP', dieuKien: 'Chỉ cung cấp khi GITA đủ năng lực nhân sự và chất lượng thực thi — máy kiểm còn người hạng A trống', tro: ['phong-vvip'] },
  { ma: 'SP6', ten: 'GITA Community & Partnership', vai: 'Cộng đồng và hợp tác giáo dục', gom: ['Workshop, chuyên đề phụ huynh', 'Hợp tác với tổ chức phù hợp', 'Giới thiệu dựa trên trải nghiệm thật'],
    giup: 'Kết nối và lan toả có đồng thuận', tro: ['cong-dong', 'su-kien'] }
]);
export const LUAT_SAN_PHAM = 'Chỉ đề xuất bước tiếp theo khi có nhu cầu, bằng chứng về giá trị và khả năng phục vụ phù hợp. Không tự động chuyển khách lên gói đắt hơn chỉ vì họ thuộc nhóm VVIP.';
export const CHUYEN_TIEP = Object.freeze([
  { tu: 'Nội dung hữu ích · SEO · cộng đồng', den: 'SP1 Discovery' },
  { tu: 'SP1 — đã hiểu nhu cầu và mức phù hợp?', co: 'SP2 Growth 7/21', chua: 'Tài liệu và hướng dẫn tự tìm hiểu' },
  { tu: 'SP2 — đánh giá kết quả, gia đình có nhu cầu tiếp tục?', co: 'SP3 Transformation 90 / SP4 Family Growth 365', chua: 'Duy trì tài liệu hữu ích theo đồng thuận' },
  { tu: 'SP3/SP4 — có nhu cầu cố vấn chuyên sâu?', co: 'SP5 VVIP Mentoring (khi có và phù hợp)', chua: 'Duy trì lộ trình hiện tại' },
  { tu: 'Mọi nhánh', den: 'Đánh giá giá trị, duy trì và giới thiệu tự nguyện' }
]);

/* ═══ PHẦN V · DEMAND GENERATION & GROWTH ENGINE ═══ */
export const DONG_CO_6 = Object.freeze([
  { ma: 'D1', ten: 'SEO và nội dung chuyên môn', y: 'Trang trả lời câu hỏi phụ huynh thực sự tìm: phương pháp học, quản lý thời gian, động lực, lộ trình phát triển, cách chọn chương trình phù hợp.', chiSo: 'Lượt truy cập đúng đối tượng · đăng ký tư vấn tự nguyện · tỷ lệ chuyển đổi · chi phí thu hút' },
  { ma: 'D2', ten: 'Chuyên gia và thương hiệu cá nhân', y: 'Video ngắn, bài phân tích, webinar, bài giảng mẫu, phương pháp học áp dụng được ngay.', chiSo: 'Lượt xem đủ chất lượng · thời gian theo dõi · lượt lưu tài liệu · yêu cầu tìm hiểu' },
  { ma: 'D3', ten: 'Tài sản số có giá trị', y: 'Thư viện tài liệu, bộ tự đánh giá, công cụ lập kế hoạch, bài học mẫu, trang giới thiệu chương trình.', chiSo: 'Tỷ lệ dùng tài liệu · số khách phù hợp · tỷ lệ sang bước tiếp' },
  { ma: 'D4', ten: 'Cộng đồng phụ huynh', y: 'Chuyên đề hữu ích, giao lưu chuyên môn, câu hỏi thường gặp, chia sẻ kinh nghiệm có đồng ý.', chiSo: 'Thành viên hoạt động · lượt tham gia sự kiện · hài lòng · giới thiệu phù hợp' },
  { ma: 'D5', ten: 'Đối tác chiến lược', y: 'Hợp tác với đơn vị giáo dục, cộng đồng phụ huynh, chuyên gia cùng định hướng; rõ quyền lợi và trách nhiệm.', chiSo: 'Đối tác hoạt động · khách giới thiệu có đồng thuận · doanh thu và lợi nhuận từ kênh' },
  { ma: 'D6', ten: 'Quảng cáo có kiểm soát', y: 'Thử nghiệm theo nhu cầu và nhóm phù hợp; đo chi phí, chất lượng khách và lợi nhuận thay vì chỉ nhìn lượt nhấp.', chiSo: 'CAC · tỷ lệ chuyển đổi · biên lợi nhuận đóng góp · thời gian hoàn vốn chi phí thu hút' }
]);
/* Mười chiến dịch marketing + sáu chiến dịch chăm sóc VIP/VVIP. Chiến dịch
   lập ở cửa lapChienDichVvip mang mã mẫu để kết quả so được giữa các lần. */
export const CHIEN_DICH_MKT_10 = Object.freeze([
  { ma: 'MK01', ten: 'Bản đồ học tập', y: 'Giúp phụ huynh nhận diện mục tiêu và trở ngại', buoc: 'Nhận tài liệu', dongCo: 'D3', giaiDoan: 'G1' },
  { ma: 'MK02', ten: '7 ngày học chủ động', y: 'Trải nghiệm những thay đổi nhỏ trong thói quen', buoc: 'Tham gia chương trình thử', dongCo: 'D3', giaiDoan: 'G2' },
  { ma: 'MK03', ten: 'Chuyên đề phụ huynh', y: 'Giải đáp vấn đề giáo dục thường gặp', buoc: 'Đăng ký workshop', dongCo: 'D4', giaiDoan: 'G1' },
  { ma: 'MK04', ten: 'GITA Learning Lab', y: 'Bài học mẫu, công cụ và phương pháp', buoc: 'Khám phá chương trình', dongCo: 'D3', giaiDoan: 'G2' },
  { ma: 'MK05', ten: 'Lộ trình 90 ngày', y: 'Hướng dẫn xây kế hoạch đo lường được', buoc: 'Đặt lịch tư vấn', dongCo: 'D1', giaiDoan: 'G2' },
  { ma: 'MK06', ten: 'Góc nhìn chuyên gia', y: 'Nội dung chuyên sâu, giải thích rõ căn cứ', buoc: 'Theo dõi hoặc đặt câu hỏi', dongCo: 'D2', giaiDoan: 'G1' },
  { ma: 'MK07', ten: 'Hành trình tiến bộ', y: 'Chia sẻ trường hợp thực tế đã được cho phép', buoc: 'Tìm hiểu phương pháp', dongCo: 'D2', giaiDoan: 'G2' },
  { ma: 'MK08', ten: 'GITA Family Community', y: 'Kết nối gia đình có mối quan tâm chung', buoc: 'Tham gia cộng đồng', dongCo: 'D4', giaiDoan: 'G5' },
  { ma: 'MK09', ten: 'Đối tác giáo dục', y: 'Đồng tổ chức hoạt động chuyên môn', buoc: 'Đăng ký chương trình phù hợp', dongCo: 'D5', giaiDoan: 'G1' },
  { ma: 'MK10', ten: 'Khách hàng quay lại', y: 'Đánh giá kết quả và nhu cầu giai đoạn mới', buoc: 'Tư vấn tiếp nối nếu cần', dongCo: 'D4', giaiDoan: 'G5' }
]);
export const CHIEN_DICH_CS_6 = Object.freeze([
  { ma: 'CS01', ten: 'Bảy ngày đầu trong nhóm', doiTuong: ['VIP', 'VVIP'], mucTieu: 'Nhà vào nhóm có đủ tài liệu 01–06 trong 7 ngày và một lượt chạm của người hạng A', khong: 'Không gửi quà thay cho buổi làm việc' },
  { ma: 'CS02', ten: 'Rà soát quý cùng coach hạng A', doiTuong: ['VIP', 'VVIP'], mucTieu: 'Mỗi nhà có biên bản rà soát quý nêu việc đã đổi, chưa đổi và một bước tiếp', khong: 'Không biến buổi rà soát thành buổi chào gói mới' },
  { ma: 'CS03', ten: 'Buổi tối gia đình VVIP', doiTuong: ['VVIP'], mucTieu: 'Mỗi nhà mang về một việc làm được và làm thử trong tuần', khong: 'Không bán tại chỗ; không chụp ảnh trẻ khi chưa có đồng ý ảnh (L07)' },
  { ma: 'CS04', ten: 'Câu chuyện chuyển hoá', doiTuong: ['VVIP'], mucTieu: 'Câu chuyện có bằng chứng trước–sau, gia đình duyệt bản cuối và đồng ý công khai', khong: 'Không sửa lời gia đình cho đẹp, không dùng tên con' },
  { ma: 'CS05', ten: 'Phục hồi nhà đang vướng mắc', doiTuong: ['VIP', 'VVIP'], mucTieu: 'Nhà Recovery được gọi trong 24 giờ và về nhịp trong 14 ngày', khong: 'Không nhắc đóng tiền, không dùng ưu đãi để che vấn đề' },
  { ma: 'CS06', ten: 'Mở bước tiếp theo khi đã có căn cứ', doiTuong: ['VIP', 'VVIP'], mucTieu: 'Nhà đã có bằng chứng tiến bộ được trình bày bước tiếp bằng chính dữ liệu của nhà', khong: 'Không mời nhà Recovery; để nhà quyết trong 7 ngày, không gọi giục' }
]);
export const PHEU_11 = Object.freeze([
  'Nội dung SEO và nhận diện', 'Trang đích theo nhu cầu', 'Tài liệu hữu ích / công cụ tự đánh giá',
  'CRM ghi nhận nguồn và sự đồng thuận', 'Chuỗi hướng dẫn có giá trị', 'Khách hàng chủ động yêu cầu tư vấn',
  'Đánh giá mức độ phù hợp', 'Đề xuất chương trình và chi phí minh bạch', 'Đăng ký và khởi động',
  'Chăm sóc và đo lường kết quả', 'Tiếp tục phù hợp / giới thiệu tự nguyện'
]);
export const KHAI_THAC_DINH_NGHIA = '"Chủ động khai thác" là chủ động phát hiện nhu cầu, đề xuất hỗ trợ và mở ra cơ hội tạo giá trị — không phải liên tục bán hàng cho mọi khách hàng.';
export const KHAI_THAC_7 = Object.freeze([
  { khi: 'Phụ huynh tải tài liệu', lam: 'Gửi hướng dẫn dùng tài liệu và các lựa chọn bước tiếp theo' },
  { khi: 'Phụ huynh yêu cầu tư vấn', lam: 'Giao đúng người, chuẩn bị câu hỏi, ghi nhận mục tiêu' },
  { khi: 'Học sinh tiến bộ', lam: 'Ghi nhận bằng chứng, hỏi phản hồi, đề xuất cách duy trì' },
  { khi: 'Khách sắp kết thúc chương trình', lam: 'Tổng kết kết quả TRƯỚC khi nói về chương trình tiếp nối' },
  { khi: 'Khách ít tương tác', lam: 'Tìm hiểu họ có gặp khó khăn không, đồng thời tôn trọng việc họ có thể không muốn tiếp tục' },
  { khi: 'Khách không hài lòng', lam: 'Ưu tiên giải quyết nguyên nhân, không dùng ưu đãi để che lấp vấn đề' },
  { khi: 'Khách hài lòng', lam: 'Mời chia sẻ trải nghiệm tự nguyện, không ép, không đổi đánh giá lấy quyền lợi' }
]);

/* ═══ PHẦN VI · MỤC TIÊU 80% — BA CHỈ SỐ KHÁC NHAU ═══ */
export const MUC_TIEU_80 = Object.freeze({
  dich: 80,
  baChiSo: [
    { ma: 'DOANHTHU', ten: '80% doanh thu từ nhóm trọng điểm', y: 'Tỷ trọng doanh thu của nhóm được xác định trước.' },
    { ma: 'LOINHUAN', ten: '80% lợi nhuận từ nhóm trọng điểm', y: 'Tỷ trọng lợi nhuận đóng góp sau chi phí trực tiếp và chi phí liên quan.' },
    { ma: 'TANGTRUONG', ten: '80% tăng trưởng doanh thu từ nhóm trọng điểm', y: 'Tỷ trọng phần doanh thu tăng thêm so với kỳ gốc.' }
  ],
  canhBao: 'Ba chỉ số khác nhau. Một nhóm doanh thu cao nhưng chi phí phục vụ cũng cao chưa chắc mang lại lợi nhuận tương ứng.',
  congThuc: [
    'Tỷ trọng doanh thu VVIP = Doanh thu VVIP ÷ Tổng doanh thu × 100%',
    'Lợi nhuận đóng góp = Doanh thu thực thu − Chi phí biến đổi liên quan',
    'CAC = Chi phí thu hút khách hàng ÷ Số khách hàng mới',
    'Giá trị vòng đời = Σ (Lợi nhuận đóng góp kỳ t ÷ (1 + r)^t) − Chi phí thu hút — mô hình ƯỚC TÍNH, cần dữ liệu thật, giả định duy trì và chi phí phục vụ'
  ],
  viDu: {
    ghiChu: 'Kịch bản GIẢ ĐỊNH để minh hoạ, không phải số liệu của GITA.',
    dong: [{ nhom: 'VVIP', so: 20, binhQuan: '200 triệu', tong: '4 tỷ' }, { nhom: 'VIP', so: 40, binhQuan: '75 triệu', tong: '3 tỷ' },
      { nhom: 'Core', so: 150, binhQuan: '10 triệu', tong: '1,5 tỷ' }, { nhom: 'Nhóm khác', so: 300, binhQuan: '5 triệu', tong: '1,5 tỷ' }],
    ketLuan: 'VVIP tạo 40%, VVIP + VIP tạo 70% — chưa đạt 80%. Muốn đạt phải kiểm chứng quy mô nhóm, mức sử dụng dịch vụ phù hợp, khả năng duy trì, giá trị hợp đồng, năng lực cung cấp và biên lợi nhuận. Không đơn giản tăng giá hay đẩy khách sang gói cao hơn.'
  },
  namBuoc: [
    { ten: 'Đo đường cơ sở', y: '12 tháng gần nhất: doanh thu, chi phí phục vụ, số khách, tỷ lệ duy trì, nguồn khách.', trongHe: 'Bảng 80% tự tính từ phieuThu · hoanTien · hoSoKhach' },
    { ten: 'Xác định nhóm trọng điểm', y: 'Phân nhóm theo giá trị kinh tế thực tế, nhu cầu, mức phù hợp; tiêu chí rõ ràng, tránh cảm tính.', trongHe: 'Bảy dấu hiệu + đề xuất/duyệt hai người (hangVvip)' },
    { ten: 'Thiết kế gói giá trị', y: 'Chuẩn hoá sản phẩm, phạm vi, chi phí cung cấp, năng lực đội ngũ, lợi ích khách nhận.', trongHe: 'Sáu sản phẩm · giá ở bảng giá (Vùng Đỏ)' },
    { ten: 'Tự động hoá hành trình', y: 'Nối CRM, marketing, onboarding, chăm sóc, đánh giá kết quả, cơ hội tiếp nối.', trongHe: 'Thư viện điểm chạm → ghiCham · chiến dịch có kết quả đo' },
    { ten: 'Đánh giá hàng tháng', y: 'So tỷ trọng doanh thu, lợi nhuận đóng góp, hài lòng, chất lượng giáo dục; điều chỉnh mục tiêu nếu năng lực hoặc dữ liệu chưa đủ.', trongHe: 'Bảng 80% · mười KPI · bốn mục tiêu thử nghiệm' }
  ]
});

/* ═══ PHẦN VII · CUSTOMER INTELLIGENCE & REVENUE OPERATING SYSTEM ═══ */
export const TANG_8 = Object.freeze([
  { ma: 'T1', ten: 'Dữ liệu và sự đồng ý', trongHe: 'dongYDuLieu · tuyChonLienHe · nhật ký đọc' },
  { ma: 'T2', ten: 'Hồ sơ khách hàng CRM', trongHe: 'hoSoKhach · crmKhach · hoSoVvip (12 tài liệu)' },
  { ma: 'T3', ten: 'Phân nhóm và nhận diện nhu cầu', trongHe: 'nhanDienVvip · hangVvip' },
  { ma: 'T4', ten: 'Bộ máy hành trình 10K WOW', trongHe: 'diemChamWow · kichHoatDiemCham → ghiCham' },
  { ma: 'T5', ten: 'Marketing và tư vấn', trongHe: 'chienDichVvip · crmCoHoi · bàn tư vấn' },
  { ma: 'T6', ten: 'Sản phẩm và trải nghiệm học tập', trongHe: 'Năm tầng · nhiệm vụ · tiến bộ' },
  { ma: 'T7', ten: 'Đo lường giá trị và doanh thu', trongHe: 'bangVvip (80% · KPI · thử nghiệm)' },
  { ma: 'T8', ten: 'Học hỏi, QC và tối ưu', trongHe: 'Mười tiêu chuẩn WOW khi duyệt · vòng tự hoàn thiện' }
]);
export const THANH_PHAN_8 = Object.freeze([
  { ten: 'CRM', bat: 'Hồ sơ, nguồn khách, nhu cầu, lịch sử tương tác, người phụ trách', trongHe: 'crm · toan-canh-crm' },
  { ten: 'Content Engine', bat: 'Nội dung đã duyệt, phiên bản, đối tượng, điều kiện dùng', trongHe: 'diemChamWow (trạng thái + mười tiêu chuẩn) · bản tin có biên tập' },
  { ten: 'Journey Engine', bat: 'Kích hoạt hành trình theo sự kiện và trạng thái khách', trongHe: 'kichHoatDiemCham (kiểm nhóm, tần suất, trùng lặp, từ chối)' },
  { ten: 'AI Assistant', bat: 'Phân loại yêu cầu, soạn phản hồi, tóm tắt hồ sơ, đề xuất bước tiếp', trongHe: 'Quyền năng AI do Super Admin cấp — AI soạn, người duyệt' },
  { ten: 'Service Desk', bat: 'Tiếp nhận, giao việc, theo dõi hạn, xử lý khiếu nại', trongHe: 'tt-cskh · năm bước khiếu nại' },
  { ten: 'Product Engine', bat: 'Chương trình, điều kiện tham gia, chi phí, phạm vi cam kết', trongHe: 'Bảng giá (khung ở kho, số ở sổ) · năm tầng' },
  { ten: 'Analytics', bat: 'Phễu chuyển đổi, CAC, doanh thu, lợi nhuận đóng góp, tỷ lệ duy trì', trongHe: 'bangVvip · bảy con số CEO' },
  { ten: 'Governance', bat: 'Quyền truy cập, phê duyệt, nhật ký kiểm toán, chất lượng nội dung', trongHe: 'Phân quyền vai · người đề xuất ≠ người duyệt · audit' }
]);
export const QUY_TAC_TU_DONG = Object.freeze({
  khuon: 'SỰ KIỆN → KIỂM TRA ĐIỀU KIỆN → HÀNH ĐỘNG → GHI NHẬN → ĐO LƯỜNG → ĐIỀU CHỈNH',
  viDu: [
    { buoc: 'Sự kiện', y: 'Phụ huynh đăng ký tư vấn.' },
    { buoc: 'Kiểm tra', y: 'Thông tin tối thiểu đã có, yêu cầu còn hiệu lực, đã có sự đồng ý cần thiết.' },
    { buoc: 'Hành động', y: 'Tạo hồ sơ, giao chuyên viên, gửi xác nhận và lịch hẹn.' },
    { buoc: 'Ghi nhận', y: 'Lưu nguồn khách, thời gian xử lý và trạng thái.' },
    { buoc: 'Đo lường', y: 'Tỷ lệ tham dự, mức phù hợp, kết quả tư vấn.' },
    { buoc: 'Điều chỉnh', y: 'Cải thiện kịch bản hoặc quy trình nếu có điểm nghẽn.' }
  ],
  aiTuLam: ['Gửi xác nhận, nhắc lịch và hướng dẫn onboarding đã được phê duyệt', 'Phân loại câu hỏi thông thường và tìm tài liệu đúng phiên bản',
    'Tạo bản nháp báo cáo tiến độ từ dữ liệu đã được phép dùng', 'Nhắc việc, tổng hợp KPI, phát hiện hồ sơ thiếu thông tin', 'Tạm dừng chiến dịch khi khách từ chối nhận thông tin'],
  canNguoi: ['Khiếu nại nghiêm trọng, tranh chấp, vấn đề nhạy cảm liên quan học sinh', 'Thay đổi cam kết, hoàn tiền ngoại lệ, quyết định ảnh hưởng lớn tới khách',
    'Nội dung mới về kết quả giáo dục, tuyên bố chuyên môn, trường hợp thành công', 'Dùng dữ liệu ngoài mục đích đã được cho phép',
    'Thay đổi phân quyền, chính sách lưu trữ, quy tắc bảo mật trọng yếu'],
  ketLuan: 'Tự động hoá không đồng nghĩa loại bỏ giám sát. Mục tiêu là giảm thao tác lặp lại, đồng thời luôn có người chịu trách nhiệm cho quyết định quan trọng.'
});

/* ═══ PHẦN VIII · KPI ═══ — `do` nói cửa nào đo; vắng `do` = chưa đo được,
   và `vi` nói vì sao. Không bao giờ gộp chỉ số đo được với chỉ số lời khai. */
export const KPI_10 = Object.freeze([
  { ma: 'K01', nhom: 'Nhận diện', chiSo: 'Lượt tiếp cận đúng đối tượng', dung: 'Đánh giá khả năng tiếp cận thị trường', vi: 'Đo ở máy chủ đo lường trang công khai (không PII), chưa nối vào bảng này' },
  { ma: 'K02', nhom: 'Thu hút', chiSo: 'Số khách hàng tiềm năng phù hợp', dung: 'Đo chất lượng nguồn khách', do: 'crmKhach ở giai đoạn mới/tư vấn' },
  { ma: 'K03', nhom: 'Chuyển đổi', chiSo: 'Tỷ lệ từ tư vấn sang đăng ký', dung: 'Phát hiện điểm nghẽn hành trình', do: 'crmCoHoi thắng ÷ (thắng + thua) trong 12 tháng' },
  { ma: 'K04', nhom: 'Tài chính', chiSo: 'CAC và lợi nhuận đóng góp', dung: 'Kiểm soát hiệu quả kinh tế', do: 'CAC = chi khoản mục tiếp thị đã duyệt ÷ nhà mới 12 tháng; lợi nhuận đóng góp chưa đo được' },
  { ma: 'K05', nhom: 'Duy trì', chiSo: 'Tỷ lệ tiếp tục chương trình phù hợp', dung: 'Đánh giá giá trị dịch vụ dài hạn', do: 'Nhà vào trên 90 ngày còn đang học ÷ nhà vào trên 90 ngày' },
  { ma: 'K06', nhom: 'Trải nghiệm', chiSo: 'Mức độ hài lòng và tỷ lệ xử lý vấn đề', dung: 'Đánh giá chất lượng phục vụ', do: 'Phiếu CSAT ≥ 4 ÷ số phiếu trong 3 tháng; xử lý vấn đề chưa nối' },
  { ma: 'K07', nhom: 'Giáo dục', chiSo: 'Mức độ đạt mục tiêu đã thống nhất', dung: 'Đánh giá giá trị cốt lõi', vi: 'Cần đối chiếu mốc tài liệu 06 với kết quả — là lời khai của coach, chưa phải phép đo' },
  { ma: 'K08', nhom: 'Giới thiệu', chiSo: 'Tỷ lệ khách giới thiệu tự nguyện', dung: 'Đánh giá sức khoẻ quan hệ', do: 'Nhà mới 12 tháng có nhà giới thiệu ÷ nhà mới 12 tháng' },
  { ma: 'K09', nhom: 'Vận hành', chiSo: 'Tỷ lệ hoàn thành điểm chạm đúng hạn', dung: 'Kiểm soát chất lượng thực thi', do: 'Nhà VIP/VVIP còn trong nhịp chạm ÷ nhà VIP/VVIP' },
  { ma: 'K10', nhom: 'Quản trị', chiSo: 'Sự cố dữ liệu và vi phạm quy trình', dung: 'Theo dõi rủi ro hệ thống', vi: 'Người khai sự cố; lượt bị cổng chặn đếm ở nhật ký nhưng không phải toàn bộ sự cố' }
]);
export const MUC_TIEU_THU_4 = Object.freeze([
  { ma: 'M1', ten: 'Hoàn thành onboarding đúng hạn', nguong: 90, vi: 'Chưa có mốc "đúng hạn" của bước khởi động trong sổ — chưa đo' },
  { ma: 'M2', ten: 'Điểm chạm tự động đạt chuẩn', nguong: 98, do: 'Điểm chạm đang bật đủ bảy lớp và đủ mười tiêu chuẩn ÷ điểm chạm đang bật' },
  { ma: 'M3', ten: 'Yêu cầu hỗ trợ được phân công đúng hạn', nguong: 95, vi: 'Service Desk chưa ghi hạn phân công — chưa đo' },
  { ma: 'M4', ten: 'Hồ sơ trọng điểm có kế hoạch tiếp theo', nguong: 95, do: 'Nhà VIP/VVIP có người phụ trách + ngày hẹn tiếp chưa quá hạn ÷ nhà VIP/VVIP' }
]);
export const KPI_CANH_BAO = 'Ngưỡng là mục tiêu THỬ NGHIỆM, không phải hiệu suất hiện tại. Không tối ưu bằng cách gửi nhiều tin hơn hay hoàn thành quy trình hình thức — kiểm tra mẫu thực tế, phản hồi khách và tác động tới kết quả giáo dục.';

/* ═══ PHẦN IX · LỘ TRÌNH 90 NGÀY ═══ — `trongHe` nói phần nào hệ đã dựng. */
export const LO_TRINH_90 = Object.freeze([
  { tu: 1, den: 15, ten: 'Kiến trúc và dữ liệu', viec: ['Kiểm kê sản phẩm, dịch vụ, tài liệu, hành trình hiện có', 'Thiết kế 12 biểu mẫu hồ sơ VVIP', 'Chuẩn hoá tiêu chí phân nhóm và định nghĩa doanh thu', 'Xác định quyền truy cập, sự đồng ý, chính sách dữ liệu'],
    dauRa: 'Bộ tiêu chuẩn vận hành, mô hình dữ liệu, bản đồ hành trình', trongHe: 'Đã dựng: 12 tài liệu có trường bắt buộc · bảy dấu hiệu · doanh thu = phiếu thu đã duyệt trừ hoàn đã duyệt · quyền theo vai' },
  { tu: 16, den: 30, ten: 'Xây nền tảng và nội dung', viec: ['Cấu hình CRM và bảng điều khiển cơ bản', 'Xây thư viện nội dung được phê duyệt', 'Biên soạn 100 điểm chạm đầu tiên, ưu tiên bước giá trị cao', 'Chuẩn hoá kịch bản tư vấn, onboarding, hỗ trợ'],
    dauRa: 'Hệ thống thử nghiệm hoạt động được và thư viện nội dung ban đầu', trongHe: 'Đã dựng: bảng điều khiển · thư viện có duyệt · 10 điểm chạm mẫu. CÒN: 90 điểm chạm do đội ngũ biên soạn và duyệt' },
  { tu: 31, den: 60, ten: 'Chạy thử và đo lường', viec: ['Chạy hành trình nhận diện, tư vấn, onboarding, chăm sóc', 'Kiểm chất lượng dữ liệu, nội dung, tần suất liên hệ', 'Đo chuyển đổi, chi phí phục vụ, phản hồi', 'Sửa lỗi trước khi mở rộng'],
    dauRa: 'Báo cáo thử nghiệm, danh sách lỗi, quy trình đã hiệu chỉnh', trongHe: 'Việc của đội vận hành — máy đo sẵn tần suất, trùng lặp, nhịp chạm' },
  { tu: 61, den: 90, ten: 'Mở rộng có kiểm soát', viec: ['Mở rộng hành trình đã đạt chuẩn', 'Bổ sung điểm chạm theo dữ liệu nhu cầu', 'Kích hoạt SEO, cộng đồng, đối tác phù hợp', 'Đánh giá tính khả thi của mục tiêu doanh thu trọng điểm'],
    dauRa: 'Phiên bản vận hành 1.0 và kế hoạch mở rộng thư viện 10.000 điểm chạm', trongHe: 'Bảng 80% trả lời câu khả thi bằng số thật' }
]);
export const UU_TIEN_DAU_TU = Object.freeze(['Chuẩn hoá sản phẩm và chất lượng phục vụ', 'Chuẩn hoá CRM và dữ liệu khách hàng', 'Xây dựng các hành trình cốt lõi',
  'Tạo nội dung hữu ích và phễu thu hút', 'Đo lường hiệu quả kinh tế', 'Mở rộng điểm chạm, tích hợp AI, tối ưu tự động']);

/* ═══ PHẦN X · NĂM QUYẾT ĐỊNH CẦN CHỐT + NGUYÊN TẮC BẢO VỆ ═══
   Năm câu này là của Ban điều hành — máy không chọn hộ. Mục nào chưa chốt
   thì phần hệ phụ thuộc nó khai rõ là đang chạy theo giả định nào. */
export const QUYET_DINH_5 = Object.freeze([
  { ma: 'QD1', hoi: 'Sản phẩm nào là chủ lực, sản phẩm nào là chương trình tiếp nối và phạm vi phục vụ của từng gói?', giaDinh: 'Hệ đang coi SP4 GITA 365 Family Growth là chủ lực (năm tầng đang chạy).' },
  { ma: 'QD2', hoi: 'Nhóm khách nào được chọn làm nhóm thử nghiệm VVIP, dựa trên dữ liệu và nhu cầu thực tế?', giaDinh: 'Chưa có — danh sách nhận diện nêu nhà đạt ≥5/7 dấu hiệu để Ban điều hành chọn.' },
  { ma: 'QD3', hoi: 'CRM và Web App hiện tại đáp ứng tới đâu; chức năng nào cần phát triển thêm?', giaDinh: 'Đã dựng phần lõi (hồ sơ, nhóm, điểm chạm, chiến dịch, bảng 80%). Còn thiếu: chi phí phục vụ theo nhà, hạn của Service Desk, mốc đúng hạn của onboarding.' },
  { ma: 'QD4', hoi: 'Mục tiêu 80% tính theo doanh thu, lợi nhuận đóng góp hay tăng trưởng doanh thu; kỳ đánh giá là quý hay năm?', giaDinh: 'Bảng hiện cả ba; mặc định đọc doanh thu, kỳ 12 tháng trượt.' },
  { ma: 'QD6', hoi: 'Bản phân bổ năm giai đoạn cộng ra 8.500, không phải 10.000. 1.500 điểm chạm còn lại vào giai đoạn nào (hay giữ làm dự phòng sau 90 ngày thử)?', giaDinh: 'Giữ nguyên năm con số của bản Blueprint; 1.500 nêu riêng là "chưa phân bổ".' },
  { ma: 'QD5', hoi: 'Ai chịu trách nhiệm phê duyệt nội dung, bảo vệ dữ liệu, xử lý ngoại lệ, đánh giá chất lượng giáo dục?', giaDinh: 'Mặc định theo vai: duyệt nhóm/phân công/chiến dịch R01–R03; điểm chạm do người khác người soạn duyệt; dữ liệu theo cổng Luật 91 đã có.' }
]);
export const BAO_VE_6 = Object.freeze([
  { y: 'Chỉ thu thập thông tin cần thiết cho mục đích đã xác định.', rang: 'Mỗi trường của 12 tài liệu khai mục đích; trường lạ bị bỏ khi ghi' },
  { y: 'Phân quyền theo vai trò; nhân sự chỉ xem phần dữ liệu cần cho công việc.', rang: 'Người phụ trách + R01–R05; tài liệu 09 chỉ R01–R03' },
  { y: 'Lưu nhật ký truy cập và chỉnh sửa đối với dữ liệu quan trọng.', rang: 'Mỗi lượt mở và mỗi phiên bản hồ sơ ghi nhật ký' },
  { y: 'Có cơ chế yêu cầu sửa, xoá, giới hạn sử dụng dữ liệu theo quy định.', rang: 'Hồ sơ là phiên bản nối tiếp (sửa = dòng mới); xoá theo cổng yêu cầu xoá đã có' },
  { y: 'Không dùng thông tin nhạy cảm hoặc khó khăn của gia đình để tạo áp lực bán hàng.', rang: 'Điều 5 · nhóm Recovery chặn mọi điểm chạm quảng bá' },
  { y: 'Kiểm thử quyền truy cập, sao lưu, phục hồi, phương án sự cố trước khi mở rộng.', rang: 'tools/thu-vvip.mjs có phép phá thử cho từng cổng' }
]);
export const KET_LUAN = Object.freeze({
  tuTuong: 'Đừng chỉ tìm cách tăng số lượng khách hàng; hãy xây một hệ thống có khả năng hiểu khách hàng, tạo giá trị, duy trì niềm tin và phát triển quan hệ lâu dài.',
  bonTaiSan: ['Bộ hồ sơ VVIP 12 tài liệu', 'CRM và quy trình quản lý quan hệ khách hàng', 'Thư viện 100 điểm chạm WOW đầu tiên để thử nghiệm', 'Bảng điều khiển doanh thu, lợi nhuận đóng góp và kết quả giáo dục'],
  moRong: 'Khi thử nghiệm chạy tốt mới mở rộng lên 1.000 rồi 10.000 điểm chạm theo dữ liệu thực tế.'
});

/* Chuẩn người phục vụ — hạng A/B/C/D đọc từ bảng xếp hạng lương thưởng
   tháng (chamMotNguoi), không phải danh sách ai đó tự gõ. */
export const CHUAN_NGUOI_PHUC_VU = Object.freeze([
  'Nhà VVIP do người HẠNG A tháng gần nhất phục vụ. Không còn người hạng A thì được giao người hạng B, nhưng phải viết lý do và máy đánh dấu "ngoài chuẩn".',
  'Nhà VIP do người hạng A hoặc B phục vụ. Người hạng C, D không nhận nhà VIP/VVIP mới.',
  'Mỗi nhà có một người phục vụ chính (coach) và một tư vấn viên biết hồ sơ.',
  'Người phục vụ đổi thì có một buổi bàn giao ba bên, không đổi qua tin nhắn.',
  'Người phục vụ tụt khỏi hạng chuẩn thì quản lý xem lại phân công — máy không tự rút nhà khỏi người ấy.'
]);
