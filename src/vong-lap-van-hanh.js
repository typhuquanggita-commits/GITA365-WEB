/* ═══════════════════════════════════════════════════════════════
   GITA 365 — VÒNG LẶP VẬN HÀNH (bánh đà 4 vòng + kiểm soát xuyên vòng)

   Chủ hệ gửi sơ đồ bánh đà: Vòng 1 TẠO GIÁ TRỊ → Vòng 2 LAN TOẢ TỪ
   KẾT QUẢ → Vòng 3 CHẤT LƯỢNG TÍCH LUỸ → Vòng 4 NGUỒN LỰC & TÁI ĐẦU
   TƯ — có Kiểm soát xuyên vòng (bảo mật · quyền riêng tư · ngân sách
   · giới hạn tải · nhật ký · dừng & phục hồi) và Bộ phận lường thực
   thi (phòng ban · agent trưởng · công việc · sự kiện · lịch · kỹ
   năng).

   Màn này HỢP NHẤT sơ đồ ấy với GITA: MỖI NÚT trỏ vào mã THẬT đang
   chạy (CI đo mỗi PR trong do-16-he.js). Nút nào chưa có thì ghi vào
   `thieu` — bánh đà chỉ là thật khi mọi nút lần về được tới mã.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;
G.VIEWS = G.VIEWS || {};

function n(ma, ten, tro, thieu) { return { ma: ma, ten: ten, tro: tro || [], thieu: thieu || '' }; }

/* ══ KIỂM SOÁT XUYÊN VÒNG — sáu thứ canh MỌI vòng ══ */
G.VL_KIEM_SOAT = [
  n('KS1', 'Bảo mật', ['v:la-chan-30']),
  n('KS2', 'Quyền riêng tư', ['t:may-chu/phap-ly-rui-ro.js']),
  n('KS3', 'Ngân sách', ['t:may-chu/ve-chi-phi.js']),
  n('KS4', 'Giới hạn tải', ['m:may-chu/wrangler.toml#GITA_TRAN_TAI']),
  n('KS5', 'Nhật ký', ['m:may-chu/csdl.sql#audit']),
  n('KS6', 'Dừng & phục hồi', ['t:may-chu/cuu-he.js', 't:may-chu/khoang.js'])
];

/* ══ BỘ PHẬN LƯỜNG THỰC THI ══ */
G.VL_LUONG = [
  n('LT1', 'Phòng ban — 16 ban có bảng điểm đỏ', ['v:bo-may-tap-doan', 'v:truy-van-da-chieu']),
  n('LT2', '8 Agent trưởng · 100 trợ lý có khoá sở hữu', ['g:DP_MIEN', 'g:DP_TRO_LY']),
  n('LT3', 'Công việc — SOP từng miền', ['g:H16_SOP', 'v:bang-viec']),
  n('LT4', 'Sự kiện — nhật ký audit mọi việc ghi', ['m:may-chu/csdl.sql#audit']),
  n('LT5', 'Lịch — cron 03:00 dọn + tự chữa · 07:00 bản tổng', ['m:may-chu/wrangler.toml#crons']),
  n('LT6', 'Kỹ năng — 7 năng lực bắt buộc từng miền', ['g:H16_NANG_LUC'])
];

/* ══ BỐN VÒNG ══ */
G.VL_VONG = [
  { ma: 'V1', ten: 'Tạo giá trị', muc: [
    n('V1-1', 'Thực hành và minh chứng: nhiệm vụ · phản hồi · điều chỉnh', ['v:nhiem-vu', 'm:may-chu/csdl.sql#chungCu']),
    n('V1-2', 'Kết quả được xác minh: tiến bộ · năng lực · thói quen', ['v:tien-bo', 'm:may-chu/csdl.sql#baiHocHoanThanh']),
    n('V1-3', 'Hiểu khách hàng: mục tiêu · nhu cầu · năng lực', ['v:crm', 'm:may-chu/csdl.sql#theVungManh']),
    n('V1-4', '5 tầng × 10 cấp: bước tiếp theo phù hợp', ['v:kpi-100', 'm:may-chu/csdl.sql#nguoiHocTang']),
    n('V1-5', 'Hướng dẫn và đồng hành: video · agent · coach · giáo viên · CTV', ['v:xuong-phim', 'v:tro-ly', 'v:ban-coach'])
  ]},
  { ma: 'V2', ten: 'Lan toả từ kết quả', muc: [
    n('V2-1', 'Câu chuyện và minh chứng: cộng đồng · đúng sự thật · bảo vệ dữ liệu', ['m:may-chu/csdl.sql#tinCongDong', 'f:soatAnDanh']),
    n('V2-2', 'Điểm chạm WOW: hỗ trợ đúng lúc · vinh danh phù hợp', ['v:chuoi-wow', 'm:may-chu/csdl.sql#soCham']),
    n('V2-3', 'Niềm tin và cộng đồng: trải nghiệm tốt · quan hệ bền', ['m:may-chu/csdl.sql#chuyenCongDong']),
    n('V2-4', 'Chia sẻ và giới thiệu tự nguyện: khách · BN · đối tác · CTV', ['m:may-chu/csdl.sql#hoaHongTra', 'm:may-chu/csdl.sql#boTro']),
    n('V2-5', 'Khách hàng mới phù hợp', ['v:crm'], 'Chưa quy kết được kênh (Facebook/TikTok/YouTube/Website) mà không theo dõi cá nhân — đếm theo trang là hướng đi.')
  ]},
  { ma: 'V3', ten: 'Chất lượng tích luỹ', muc: [
    n('V3-1', 'Thử cải tiến có giới hạn: đo hiệu quả · kiểm tra tác dụng phụ', ['f:thuMauDaTri', 'v:cai-tien']),
    n('V3-2', 'Chuẩn hoá phần đã chứng minh tốt: SOP · kỹ năng agent · bài học', ['g:H16_SOP', 'm:may-chu/csdl.sql#khoGiaiPhapDaTri']),
    n('V3-3', 'Theo dõi sau thay đổi · kho dùng lại: video theo bước · tư liệu · giải pháp', ['f:docVongKhoaHoc', 'v:kho-tai-lieu']),
    n('V3-4', 'Thu phản hồi và phát hiện điểm nghẽn — bảng điểm 16 ban đỏ', ['v:truy-van-da-chieu', 'f:docDongChay']),
    n('V3-5', 'Phân tích nguyên nhân: nội dung · quy trình · nhân lực · công cụ', ['m:may-chu/bo-nao-da-tri.js#vongKhoaHoc'])
  ]},
  { ma: 'V4', ten: 'Nguồn lực và tái đầu tư', muc: [
    n('V4-1', 'Sản phẩm và cây tiền VIP: quyền lợi rõ · phù hợp nhu cầu', ['f:docKpiCayTien', 'v:bang-gia']),
    n('V4-2', 'Giao dịch và đối soát: doanh thu · hoàn tiền · công nợ', ['f:ghiPhieuThu', 'f:doiChieuNganHang']),
    n('V4-3', 'Hiệu quả tài chính: chi phí phục vụ · dòng tiền · nghĩa vụ', ['f:docDongChay', 'v:tai-chinh-ceo']),
    n('V4-4', 'Tái đầu tư được duyệt: con người · nội dung · công nghệ · dự phòng', ['m:may-chu/csdl.sql#chiPhi', 'm:may-chu/csdl.sql#bangLuong'],
      'Chưa có quy trình duyệt tái đầu tư riêng — hiện quyết tay; khi cần: thêm cửa duyệt ngân sách tái đầu tư qua quyền tài chính.'),
    n('V4-5', 'Năng lực phục vụ tăng: chất lượng ổn định · tài nguyên đúng lại', ['v:suc-chua-toc-do', 'd:docs/SUC_CHUA_TOC_DO.md'])
  ]}
];

/* ══ HỘP PHỤ của sơ đồ gốc ══ */
G.VL_PHU = [
  n('PH1', 'Xưởng nội dung và phim — chỉ chạy theo duyệt quản trị · video chung tầng 1–2 · cá nhân hoá tầng 3–5',
    ['v:xuong-phim', 't:may-chu/phim-ai.js']),
  n('PH2', 'Nền tảng và hệ thống kho: GitHub · Cloudflare · máy nội bộ — dữ liệu · tri thức · tài nguyên · sao lưu',
    ['t:.github/workflows/deploy.yml', 'm:may-chu/csdl.sql#hosoAppSaoLuu']),
  n('PH3', 'Dashboard lọc xoáy: kết quả · chất lượng · giới thiệu / chuyển đổi · chi phí · năng lực phục vụ',
    ['v:truy-van-da-chieu']),
  n('PH4', 'Ban quản trị và Hiến pháp GITA: mục tiêu · quyền · chất lượng · ngân sách',
    ['v:bo-nao', 'v:hanh-lang']),
  n('PH5', 'GITA Core và ma trận: người · mục tiêu · cấp · việc · agent / nguồn lực · tiền · rủi ro · kết quả',
    ['v:dieu-phoi', 'v:he-16'])
];

(function () {
  var U = G.U, h = U.h, ic = U.ic;
  function veTro(ds) {
    return (ds || []).map(function (x) {
      var k = (G.h16DoTro || function () { return {}; })(x);
      return '<code>' + h(x) + '</code>' + (k.noi === 'may' ? (k.song ? ' ✓' : ' ✗') : '');
    }).join(' ');
  }
  function veNut(m) {
    return '<tr><td class="mono">' + h(m.ma) + '</td><td class="tiny"><b>' + h(m.ten) + '</b>' +
      (m.thieu ? ' <span class="tiny" style="color:var(--gita-sau)">— thiếu: ' + h(m.thieu) + '</span>' : '') +
      '</td><td class="mono tiny">' + veTro(m.tro) + '</td></tr>';
  }

  G.VIEWS['vong-lap-van-hanh'] = function () {
    var o = '<div class="hd"><h2>' + ic('pulse') + ' Vòng lặp vận hành — bánh đà bốn vòng</h2>' +
      '<p class="sub">Vòng 1 Tạo giá trị → Vòng 2 Lan toả → Vòng 3 Chất lượng tích luỹ → Vòng 4 Nguồn lực & tái đầu tư, ' +
      'quay về Vòng 1. <b>Mỗi nút trỏ vào mã thật</b> (CI đo mỗi PR); nút chưa có ghi thật vào cột thiếu. ' +
      'Kiểm soát xuyên vòng canh cả bốn vòng; bộ phận lường thực thi đo mọi khâu.</p></div>';

    o += '<div class="card mt" style="border-color:var(--gita-sau)"><b>' + ic('shield') + ' Kiểm soát xuyên vòng</b>' +
      '<table class="tbl sm mt">' + G.VL_KIEM_SOAT.map(veNut).join('') + '</table></div>';
    o += '<div class="card mt"><b>' + ic('chart') + ' Bộ phận lường thực thi</b>' +
      '<table class="tbl sm mt">' + G.VL_LUONG.map(veNut).join('') + '</table></div>';

    G.VL_VONG.forEach(function (v) {
      o += '<div class="card mt"><b>Vòng ' + h(v.ma.slice(1)) + ' — ' + h(v.ten) + '</b>' +
        '<table class="tbl sm mt"><tr><th>Mã</th><th>Nút</th><th>Trỏ vào mã thật</th></tr>' +
        v.muc.map(veNut).join('') + '</table></div>';
    });

    o += '<div class="card mt"><b>' + ic('grid') + ' Hệ phụ của sơ đồ</b>' +
      '<table class="tbl sm mt">' + G.VL_PHU.map(veNut).join('') + '</table></div>';
    o += '<p class="note hvh-note">Bánh đà chỉ là thật khi mọi nút lần về được tới mã — màn này được CI đo trong ' +
      'tools/do-16-he.js, con trỏ chết là đỏ. Sơ đồ chi tiết: docs/VONG_LAP_VAN_HANH.md.</p>';
    return o;
  };
})();
