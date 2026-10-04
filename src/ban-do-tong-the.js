/* ═══════════════════════════════════════════════════════════════
   GITA 365 — BẢN ĐỒ TỔNG THỂ 12 KHỐI A–L

   Chủ hệ gửi bản đồ kiến trúc tổng: A Quản trị & bảo mật · B Website
   3D & kênh kết nối · C Lõi vận hành GITA · D Con người, phòng ban &
   agent · E Quy trình & 100 bánh đà · F Hướng dẫn, chăm sóc & giá
   trị · G Xưởng phim & nội dung · H VIP & dòng tiền · I Hệ thống kho
   · J GitHub & phát triển · K Cloudflare, máy nội bộ & dịch vụ ngoài
   · L Đo lường & cải tiến.

   Màn này ánh xạ MỖI KHỐI vào mã THẬT đang chạy — CI đo mọi con trỏ
   mỗi PR (tools/do-16-he.js). Nút chưa có ghi vào `thieu`. Một bản
   đồ chỉ có giá trị khi mọi nút lần về được tới mã.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;
G.VIEWS = G.VIEWS || {};

function n(ma, ten, tro, thieu) { return { ma: ma, ten: ten, tro: tro || [], thieu: thieu || '' }; }

G.BD_KHOI = [
  { ma: 'A', ten: 'Quản trị & bảo mật', ic: 'shield', muc: [
    n('A1', 'Bảo vệ hệ thống: bí mật · chống can thiệp · cách ly · ứng phó sự cố · dừng khẩn cấp',
      ['v:la-chan-30', 't:may-chu/khoang.js', 't:may-chu/cuu-he.js']),
    n('A2', 'Danh tính & phân quyền: khách · nhân sự · CTV · quản trị · agent · phiên · thu hồi',
      ['v:phan-quyen', 't:may-chu/vai-tro.js', 't:may-chu/sinh-trac.js']),
    n('A3', 'Hiến pháp GITA: 12 luật · phạm vi · tự động / chờ duyệt / từ chối',
      ['v:bo-nao', 'v:hanh-lang']),
    n('A4', 'Cổng cấp phép hành động: kiểm quyền · đối tác · ngân sách · phạm vi · thời hạn',
      ['m:may-chu/bo-nao-da-tri.js#soatRaNhaCungCap', 't:may-chu/ve-chi-phi.js', 'm:may-chu/csdl.sql#audit'])
  ]},
  { ma: 'B', ten: 'Website & kênh kết nối', ic: 'grid', muc: [
    n('B1', 'Kênh kết nối: mạng xã hội · đối tác · sự kiện · giới thiệu',
      ['v:crm', 'm:may-chu/csdl.sql#hoaHongTra'],
      'Chưa quy kết kênh đem khách thật mà không theo dõi cá nhân — đếm theo trang (mẫu Plausible) là hướng đi.'),
    n('B2', 'Website công khai (landing · bảng giá · dịch vụ · hành trình)',
      ['t:landing.html', 't:bang-gia.html', 't:hanh-trinh-12-chang.html'],
      'Không gian 3D thời gian thực chưa có — trang tĩnh + PWA đang đủ dùng; 3D khi có đội làm riêng.'),
    n('B3', 'Không gian quản trị: phòng ban · agent · nội dung · tài chính · quyền · dashboard',
      ['v:bo-may-tap-doan', 'v:truy-van-da-chieu']),
    n('B4', 'Không gian đội ngũ: khách được giao · công việc · hạn mức · phản hồi',
      ['v:bang-viec', 'v:ban-coach', 'v:ban-tu-van']),
    n('B5', 'Không gian khách hàng: sảnh · bản đồ cấp · phòng học · thư viện · vinh danh',
      ['v:ngoi-nha', 'v:kpi-100', 'v:kho-tai-lieu', 'm:may-chu/csdl.sql#soCham'])
  ]},
  { ma: 'C', ten: 'Lõi vận hành GITA', ic: 'pulse', muc: [
    n('C1', 'Điều phối thực thi: lệnh · sự kiện · công việc · lịch · retry có hạn',
      ['f:lapKeHoachAgent', 'f:chayBuocAgent', 'm:may-chu/wrangler.toml#crons']),
    n('C2', 'Hồ sơ thống nhất: nguồn tham chiếu · quyền kế thừa · mục tiêu · tiến độ',
      ['m:may-chu/csdl.sql#hoSoKhach', 'm:may-chu/csdl.sql#theVungManh']),
    n('C3', '5 tầng × 10 cấp: điều kiện hoàn thành · minh chứng · đánh giá · chuyển cấp',
      ['v:kpi-100', 'm:may-chu/csdl.sql#nguoiHocTang', 'm:may-chu/csdl.sql#lichSuTang']),
    n('C4', 'GITA CORE: hiểu mục tiêu · lập kế hoạch · chọn nguồn lực · kiểm chứng · phục hồi',
      ['v:bo-nao-da-tri', 'f:hoiDaTri', 'f:vongKhoaHocTuDong']),
    n('C5', 'Ma trận đa tầng: người · mục tiêu · cấp · việc · agent · quyền · KPI',
      ['g:h16MaTranAgent', 'v:dieu-phoi', 'v:he-16'])
  ]},
  { ma: 'D', ten: 'Con người, phòng ban & agent', ic: 'users', muc: [
    n('D1', 'Sáu agent trưởng: CSKH · tài chính · marketing · pháp lý · R&D · bảo vệ',
      ['v:kien-truc-hop-nhat', 't:may-chu/crm-ai.js', 't:may-chu/tro-ly-tai-chinh.js']),
    n('D2', 'Kho agent & kỹ năng: 100 trợ lý · 8 miền · khoá sở hữu đôi một',
      ['g:DP_TRO_LY', 'g:DP_MIEN']),
    n('D3', 'Đội ngũ GITA: lãnh đạo · quản lý · coach · giáo viên · CTV (vai R01–R20)',
      ['t:may-chu/vai-tro.js', 'v:coach-5-tang']),
    n('D4', 'Phòng ban: kinh doanh · marketing · CSKH · đào tạo · tài chính · nhân sự · pháp lý · công nghệ · dữ liệu · R&D',
      ['t:may-chu/phong-ban.js', 'f:dsPhongBan', 'v:bo-may-tap-doan']),
    n('D5', 'Phân công & chuyển tiếp: một chủ đề · SLA · nâng lực · lịch sử chuyển',
      ['g:H16_SOP', 'v:bang-viec'],
      'Chuyển tiếp có SOP và bàn giao chéo; SLA đo giờ phản hồi từng phòng ban chưa có bảng đo riêng.')
  ]},
  { ma: 'E', ten: 'Quy trình & bánh đà', ic: 'orbit', muc: [
    n('E1', 'Ban quản trị GITA365: chính sách · mục tiêu · ngân sách · phê duyệt · giám sát',
      ['v:hanh-lang', 'v:giam-sat', 'f:docDongChay']),
    n('E2', 'Quy trình chuẩn: chủ sở hữu · phạm vi · đầu vào · các bước · đầu ra · ngoại lệ',
      ['v:quy-trinh-toan-he', 'v:so-tay-van-hanh', 'g:H16_SOP']),
    n('E3', 'Bánh đà vận hành: 4 vòng chính quay liên tục, kiểm soát xuyên vòng',
      ['v:vong-lap-van-hanh'],
      'Bản đồ mục tiêu nói 100 bánh đà — hệ đang có 4 vòng chính + SOP từng miền; chia 100 bánh đà nhỏ là việc mở rộng khi mỗi vòng đã đo được riêng.'),
    n('E4', '1000 chiến lược có mã, chấm ICE', ['g:H16_CL', 'v:ban-do-chien-luoc'])
  ]},
  { ma: 'F', ten: 'Hướng dẫn, chăm sóc & giá trị', ic: 'spark', muc: [
    n('F1', 'Hệ thống điểm chạm WOW: khai mạc · tiến thưởng · quà · quyền lợi · kênh · tần suất',
      ['v:chuoi-wow', 'v:diem-cham-1000', 'm:may-chu/csdl.sql#soCham']),
    n('F2', 'Tầng 1–2: video & hoạt động chung theo nhóm', ['v:lo-trinh', 'm:may-chu/csdl.sql#baiNoiDung']),
    n('F3', 'Tầng 3–5: lộ trình · hướng dẫn · coaching cá nhân hoá', ['v:ban-coach', 't:may-chu/lo-trinh-ca-nhan-hoa.js']),
    n('F4', 'Khách thực hành: xem · đồng ý · làm theo · nộp minh chứng', ['v:nhiem-vu', 'm:may-chu/csdl.sql#chungCu']),
    n('F5', 'Cấp giá trị: kết quả · thành tựu · tư duy · thay đổi · tiến độ', ['v:tien-bo', 'm:may-chu/csdl.sql#baiHocHoanThanh'])
  ]},
  { ma: 'G', ten: 'Xưởng phim & nội dung', ic: 'spark', muc: [
    n('G1', 'Đề xuất sản xuất: nhu cầu · đối tượng · kịch bản · dự toán', ['v:xuong-phim', 'v:studio']),
    n('G2', 'Quản trị duyệt: ngân sách · chi phí · lịch · quyền tài nguyên · lượt sửa',
      ['f:phimGuiViec', 'm:may-chu/csdl.sql#kyNoiDung']),
    n('G3', 'Xem trước · dựng · kiểm định: khớp kịch bản · trái hiến pháp · duyệt xuất bản',
      ['t:may-chu/phim-ai.js', 'f:soatTiepThi']),
    n('G4', 'Thiết kế cảnh: nhân vật · bối cảnh · hành động · biểu cảm · camera · lời thoại',
      ['t:may-chu/kien-truc-noi-dung.js', 't:may-chu/nhan-vat.js']),
    n('G5', 'Sản xuất nội bộ vs thuê ngoài: mặc định qua fal.ai có khoá R01; render nội bộ là tuỳ chọn tương lai',
      ['t:may-chu/phim-ai.js'],
      'Máy GPU render nội bộ chưa có — hiện thuê fal.ai theo lượt qua cổng có khoá; khi sản lượng phim đủ lớn, cân nhắc máy nội bộ.')
  ]},
  { ma: 'H', ten: 'VIP & dòng tiền', ic: 'chart', muc: [
    n('H1', 'Sản phẩm & quyền lợi: khoá học · coaching · gói theo tầng', ['v:bang-gia', 't:may-chu/bang-gia.js']),
    n('H2', 'Đơn hàng & hợp đồng: thanh toán · cam kết · hoàn tiền', ['f:ghiPhieuThu', 'm:may-chu/csdl.sql#hoanTien', 'v:ky-ket']),
    n('H3', 'Đối soát & tái chính: doanh thu · công nợ · chi phí · nghĩa vụ', ['f:doiChieuNganHang', 't:may-chu/ke-toan.js']),
    n('H4', 'Cây tiền VIP: giá trị phù hợp · duy trì · giới thiệu · doanh thu · tái đầu tư',
      ['f:docKpiCayTien', 'm:may-chu/csdl.sql#hoaHongTra']),
    n('H5', 'Ngân sách & nguồn lực: vận hành · nhân sự · sản xuất · dự phòng',
      ['f:docDongChay', 'v:tai-chinh-ceo'],
      'Chưa có cửa duyệt ngân sách tái đầu tư riêng — hiện quyết tay qua quyền tài chính.')
  ]},
  { ma: 'I', ten: 'Hệ thống kho', ic: 'vault', muc: [
    n('I1', 'Danh mục thống nhất: mã · chủ đề · nguồn · phân loại · phiên bản · quyền',
      ['v:kho-tong', 'v:kho-tai-lieu']),
    n('I2', 'Kho tài nguyên sản xuất: nhân vật · giọng · dựng · bối cảnh · bản gốc', ['v:studio', 'm:may-chu/csdl.sql#tailieu']),
    n('I3', 'Kho tri thức & hướng dẫn: tư liệu · SOP · bài học · video theo bước',
      ['v:kho-tai-lieu', 'm:may-chu/csdl.sql#khoGiaiPhapDaTri']),
    n('I4', 'Kho nhật ký & phục hồi: sự kiện · quyết định · chi phí · cảnh báo · sao lưu',
      ['m:may-chu/csdl.sql#audit', 'm:may-chu/csdl.sql#hosoAppSaoLuu', 'f:quetSaoLuuMoCoi']),
    n('I5', 'Kho nghiệp vụ: hồ sơ · hành trình · công việc · nhân sự · giao dịch · quyền lợi',
      ['m:may-chu/csdl.sql#hoSoKhach', 'm:may-chu/csdl.sql#bangLuong', 'm:may-chu/csdl.sql#phieuThu'])
  ]},
  { ma: 'J', ten: 'GitHub & phát triển', ic: 'lock', muc: [
    n('J1', 'Repository GITA365: ứng dụng web · API worker · agent · workflow', ['t:.github/CODEOWNERS', 't:README.md']),
    n('J2', 'Kiểm thử & kiểm tra bảo mật: quyền · ngân sách · tích hợp · bí mật · dữ liệu',
      ['t:.github/workflows/kiem-tra.yml', 't:tools/soat-bi-mat.js', 't:.github/workflows/codeql.yml']),
    n('J3', 'Phát hành có kiểm soát: gate cú pháp → deploy → gọi thử sức khoẻ → mirror',
      ['t:.github/workflows/deploy.yml'],
      'Chưa có môi trường staging riêng — hiện PR + CI 9 bước là cổng; staging khi đội phát triển > 3 người.')
  ]},
  { ma: 'K', ten: 'Cloudflare, máy nội bộ & dịch vụ ngoài', ic: 'grid', muc: [
    n('K1', 'Bảo tồn tác vụ an toàn: kiểm tra phục hồi · dữ liệu dự phòng · quy trình sự cố',
      ['f:quetSaoLuuMoCoi', 't:may-chu/cuu-he.js', 't:tools/thu-dong-bo.mjs']),
    n('K2', 'Máy nội bộ GITA (GPU · render · model · kho làm việc · sao lưu)', [],
      'Chưa có máy nội bộ — mọi phần chạy trên Cloudflare + bản sao offline trên Windows 11 Pro của chủ hệ (docs/KIEN_TRUC_NOI_LUC.md).'),
    n('K3', 'Dịch vụ ngoài theo ngoại lệ: adapter · cấp quyền · hạn mức · theo dõi giá · sẵn sàng thay thế',
      ['t:may-chu/an-toan-ai.js', 'm:may-chu/bo-nao-da-tri.js#soatRaNhaCungCap', 'f:canhMauDaTri']),
    n('K4', 'Cloudflare: web · Worker API · D1 · R2 · điều phối theo nhu cầu',
      ['m:may-chu/wrangler.toml#name = "gita365"', 'd:docs/KIEN_TRUC_TONG_THE.md'])
  ]},
  { ma: 'L', ten: 'Đo lường & cải tiến', ic: 'chart', muc: [
    n('L1', 'Logs · metrics: kết quả · chất lượng · chi phí · tải · năng lực phục vụ',
      ['m:may-chu/csdl.sql#audit', 'm:may-chu/csdl.sql#soTokenDaTri', 'f:soatSoDen']),
    n('L2', 'Vòng cải tiến: phát hiện → soát → thử nghiệm → đánh giá → duyệt → chuẩn hoá',
      ['f:docVongKhoaHoc', 'v:cai-tien', 'v:tu-nang-cap']),
    n('L3', 'Dashboard quản trị: phòng ban · cấp · bánh đà · giá trị · dòng tiền · sản xuất · rủi ro',
      ['v:truy-van-da-chieu', 'v:bo-may-tap-doan'])
  ]}
];

(function () {
  var U = G.U, h = U.h, ic = U.ic;
  function veTro(ds) {
    return (ds || []).map(function (x) {
      var k = (G.h16DoTro || function () { return {}; })(x);
      return '<code>' + h(x) + '</code>' + (k.noi === 'may' ? (k.song ? ' ✓' : ' ✗') : '');
    }).join(' ');
  }

  G.VIEWS['ban-do-tong-the'] = function () {
    var khoi = G.BD_KHOI || [];
    var tongNut = 0, coThieu = 0;
    khoi.forEach(function (k) { k.muc.forEach(function (m) { tongNut++; if (m.thieu) coThieu++; }); });
    var o = '<div class="hd"><h2>' + ic('map') + ' Bản đồ tổng thể — 12 khối A–L</h2>' +
      '<p class="sub">Ánh xạ bản đồ kiến trúc tổng vào mã THẬT: ' + tongNut + ' nút, mọi con trỏ được CI đo mỗi PR. ' +
      '<b style="color:var(--gita-sau)">' + coThieu + ' nút ghi thật điều còn thiếu</b> — một bản đồ chỉ có giá trị ' +
      'khi mọi nút lần về được tới mã. Các luồng liên kết: B → C (khách vào lõi) · C → D (lõi giao cho người/agent) · ' +
      'D → E (SOP & bánh đà) · E → F (quy trình sinh giá trị) · F → H (giá trị thành tiền) · H → E (tái đầu tư) · ' +
      'G cho F nội dung · I giữ mọi tài sản · J·K là nền · L đo và cải tiến tất cả · A gác mọi khối.</p></div>';
    o += '<div class="row mt" style="gap:6px;flex-wrap:wrap">' + khoi.map(function (k) {
      return '<span class="chip"><b>' + h(k.ma) + '</b> ' + h(k.ten) + '</span>';
    }).join('') + '</div>';
    khoi.forEach(function (k) {
      o += '<div class="card mt"><b>' + ic(k.ic || 'grid') + ' ' + h(k.ma) + ' — ' + h(k.ten) + '</b>' +
        '<table class="tbl sm mt"><tr><th>Mã</th><th>Nút</th><th>Trỏ vào mã thật</th></tr>' +
        k.muc.map(function (m) {
          return '<tr><td class="mono">' + h(m.ma) + '</td><td class="tiny"><b>' + h(m.ten) + '</b>' +
            (m.thieu ? ' <div class="tiny" style="color:var(--gita-sau)">Thiếu: ' + h(m.thieu) + '</div>' : '') +
            '</td><td class="mono tiny">' + (m.tro.length ? veTro(m.tro) : '<span class="muted">— chưa có, ghi thật</span>') + '</td></tr>';
        }).join('') + '</table></div>';
    });
    o += '<p class="note hvh-note">Sơ đồ vận hành chi tiết (vòng đời yêu cầu · vòng đêm · CI/CD): docs/SO_DO_VAN_HANH_TONG_THE.md · ' +
      'kiến trúc as-built: docs/KIEN_TRUC_TONG_THE.md.</p>';
    return o;
  };
})();
