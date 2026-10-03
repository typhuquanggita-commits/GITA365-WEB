/* ═══════════════════════════════════════════════════════════════
   GITA 365 — BỘ MÁY TẬP ĐOÀN TINH GỌN · CÂY GIÁ TRỊ · CÂY TIỀN

   Chủ hệ: một bộ máy vận hành cấp tập đoàn công nghệ nhưng TINH GỌN —
   mỗi ban là một "cửa sổ" trỏ vào hệ thống THẬT đang chạy, không dựng
   lại. Ba phần:

   1. BỘ MÁY — 16 ban/hệ thống. Mỗi ban có sứ mệnh + con trỏ vào mã
      thật (CI đo trong tools/do-16-he.js) + chỗ còn thiếu ghi thật.
   2. CÂY GIÁ TRỊ — gốc (Hiến pháp) → thân (16 hệ) → cành (16 ban) →
      lá (trải nghiệm khách) → quả (KPI cây tiền). Cây chỉ sống khi
      mỗi tầng trỏ vào cơ chế thật.
   3. CÂY TIỀN — ba đích (90% hài lòng · 90% tái dùng+nâng cấp · 20%
      tầng 5) tính LÚC ĐỌC từ D1 qua cửa docKpiCayTien. Không có ô
      nhập tay: một con số tự khai chỉ để có người chạy cho đủ.

   "Tập đoàn tinh gọn" nghĩa là: một người vẫn điều hành được — vì mỗi
   ban đã có SOP, cổng, khoá sở hữu (dieu-phoi) và bộ não V20 gánh
   phần lặp; người chỉ quyết ở chốt chặn.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;
G.VIEWS = G.VIEWS || {};

/* ══ 16 BAN / HỆ THỐNG — mỗi ban: sứ mệnh · trỏ vào mã thật · thiếu gì ══ */
G.TD_BAN = [
  { ma: 'B01', ten: 'Ban Thanh tra', ic: 'shield',
    menh: 'Soi mọi cửa theo chu kỳ, cảnh báo có thời hạn, sổ thanh tra không xoá được.',
    tro: ['v:thanh-tra', 'v:giam-sat', 'm:may-chu/csdl.sql#thanhTraSo'],
    thieu: '' },
  { ma: 'B02', ten: 'Ban Sản xuất nội dung', ic: 'spark',
    menh: 'Sản xuất nội dung theo dây chuyền có kỳ hạn: bài → duyệt → đăng → đo lại.',
    tro: ['v:xuong-phim', 'm:may-chu/csdl.sql#baiNoiDung', 'm:may-chu/csdl.sql#kyNoiDung'],
    thieu: 'Chưa có lịch sản xuất tự xếp theo kỳ — hiện xếp tay.' },
  { ma: 'B03', ten: 'Ban Kho tài liệu', ic: 'vault',
    menh: 'Tài liệu vào kho qua cửa duyệt, có phiên bản, không đường tắt.',
    tro: ['v:kho-tai-lieu', 'v:duyet-tai-lieu', 'm:may-chu/csdl.sql#tailieu'],
    thieu: '' },
  { ma: 'B04', ten: 'Hệ Giải pháp khách hàng', ic: 'compass',
    menh: 'Mỗi vấn đề của khách có một giải pháp đã duyệt trong kho — hỏi một lần, dùng mãi.',
    tro: ['v:ban-tu-van', 'v:bo-nao-da-tri', 'm:may-chu/csdl.sql#khoGiaiPhapDaTri'],
    thieu: '' },
  { ma: 'B05', ten: 'Hệ Chuyên gia Coach', ic: 'users',
    menh: 'Coach đồng hành theo bàn làm việc 5 ngăn; máy nhắc việc có hạn giờ.',
    tro: ['v:ban-coach', 'v:diem-cham-1000', 'v:chuoi-wow'],
    thieu: '' },
  { ma: 'B06', ten: 'Hệ Chuyên gia Giáo dục', ic: 'book',
    menh: 'Lộ trình học và 10 điểm về đích — 100 tiêu chí đo được, không chấm cảm tính.',
    tro: ['v:lo-trinh', 'v:kpi-100'],
    thieu: '' },
  { ma: 'B07', ten: 'Hệ Luật sư — Pháp lý', ic: 'lock',
    menh: 'Rà soát pháp lý đối chiếu hàm đang chạy; bằng chứng điện tử đọc từ nhật ký thật.',
    tro: ['v:ra-soat-phap-ly', 'v:bang-chung', 'v:ky-ket'],
    thieu: 'Chưa có luật sư thật ký kết luận tuân thủ — mã chỉ thực thi quy trình.' },
  { ma: 'B08', ten: 'Hệ Dự án', ic: 'grid',
    menh: 'Việc lớn chạy theo tuyến nhiều chặng có chốt chặn — hệ dừng chờ người sau mỗi chặng.',
    tro: ['v:bang-viec', 'f:taoTuyenDaTri', 'f:chayChangDaTri'],
    thieu: 'Chưa có biểu đồ Gantt/nguồn lực — hiện quản trị qua bảng công việc + tuyến chốt chặn.' },
  { ma: 'B09', ten: 'Bộ não V20', ic: 'orbit',
    menh: 'Định tuyến 5 bộ não AI, kho giải pháp 0 token, vòng nhà khoa học mỗi đêm.',
    tro: ['v:bo-nao-da-tri', 'm:may-chu/bo-nao-da-tri.js#doChacDinhTuyen', 'm:may-chu/bo-nao-da-tri.js#coVanDaTri'],
    thieu: '' },
  { ma: 'B10', ten: 'Lá chắn & 12 tầng hậu cần', ic: 'shield',
    menh: '30 tầng bảo mật/phòng vệ + 12 tầng bếp — mọi tầng đo bằng CI mỗi PR.',
    tro: ['v:la-chan-30', 't:tools/do-16-he.js'],
    thieu: '' },
  { ma: 'B11', ten: 'Ban Tài chính — Kế toán', ic: 'chart',
    menh: 'Thu chi có phiếu có duyệt, bảng lương máy đọc, bảy con số CEO mỗi tuần.',
    tro: ['v:phong-tai-chinh', 'v:ke-toan-thue', 'f:ghiPhieuThu'],
    thieu: '' },
  { ma: 'B12', ten: 'Ban Marketing — Truyền thông', ic: 'spark',
    menh: 'Nội dung tiếp thị qua cổng soát đạo đức; biên soạn có kỳ, đo lại sau đăng.',
    tro: ['v:noi-dung-tiep-thi', 'v:bien-soan-noi-dung', 'f:soatTiepThi'],
    thieu: 'Chưa quy kết được kênh nào đem khách thật mà không theo dõi cá nhân.' },
  { ma: 'B13', ten: 'Ban Nhân sự', ic: 'users',
    menh: 'Lương tính từ hệ số có sổ, mỗi kỳ một vết; roster 100 trợ lý có vai.',
    tro: ['f:bangLuong', 'm:may-chu/csdl.sql#bangLuong', 'g:DP_TRO_LY'],
    thieu: 'Chưa có màn tuyển dụng/hồ sơ nhân sự riêng — hiện qua bảng lương + roster.' },
  { ma: 'B14', ten: 'Ban Chăm sóc khách hàng', ic: 'chat',
    menh: 'CRM theo giai đoạn, hẹn chạm tiếp; mỗi lần chạm vào sổ có căn cứ, có người duyệt.',
    tro: ['v:crm', 'm:may-chu/csdl.sql#crmKhach', 'm:may-chu/csdl.sql#soCham'],
    thieu: '' },
  { ma: 'B15', ten: 'Ban Nghiên cứu & X10', ic: 'spark',
    menh: 'Cải tiến có mốc nền, sổ thí nghiệm gắn mã chiến lược, so tỉ số mỗi chu kỳ.',
    tro: ['v:cai-tien', 'v:ban-do-chien-luoc', 'g:H16_RD'],
    thieu: '' },
  { ma: 'B16', ten: 'Ban Đối tác & Thuê ngoài', ic: 'orbit',
    menh: 'Mọi việc ra ngoài qua cổng ẩn danh Điều 13; mỗi nhà cung cấp một khoang riêng.',
    tro: ['v:ket-noi', 'f:phimGuiViec', 'f:guiDeBaiRaNgoai'],
    thieu: '' }
];

/* ══ CÂY GIÁ TRỊ — năm tầng, mỗi tầng trỏ vào cơ chế thật ══ */
G.TD_CAY_GT = [
  { tang: 'Gốc', ten: 'Hiến pháp 13 điều · hàng rào bất khả sửa', tro: ['v:bo-nao', 'v:hanh-lang'] },
  { tang: 'Thân', ten: '16 hệ thống vận hành có SOP và trần tự chủ', tro: ['v:he-16', 'v:dieu-phoi'] },
  { tang: 'Cành', ten: '16 ban/hệ thống của bộ máy tập đoàn', tro: [] },
  { tang: 'Lá', ten: 'Trải nghiệm khách: chuỗi WOW · 1000 điểm chạm', tro: ['v:chuoi-wow', 'v:diem-cham-1000'] },
  { tang: 'Quả', ten: 'Cây tiền: hài lòng · tái dùng · tầng 5 — đo từ D1', tro: ['f:docKpiCayTien'] }
];

(function () {
  var U = G.U, h = U.h, ic = U.ic;
  function nut(on, nd, k) { return '<button class="btn ' + (k || 'ghost') + ' sm" onclick="' + on + '">' + nd + '</button>'; }
  function veTro(ds) {
    return (ds || []).map(function (x) {
      var k = (G.h16DoTro || function () { return {}; })(x);
      return '<code>' + h(x) + '</code>' + (k.noi === 'may' ? (k.song ? ' ✓' : ' ✗') : '');
    }).join(' · ');
  }

  G.tdKpiTai = function () {
    if (!G.goiMayChu || G.tdKpiDangTai) return;
    G.tdKpiDangTai = true;
    G.goiMayChu('docKpiCayTien', {}).then(function (x) {
      G.tdKpiDangTai = false; G.tdKpi = x || { ok: false, error: 'Không có phản hồi.' };
      if (G.S && G.S.view === 'bo-may-tap-doan' && G.render) G.render();
    });
  };

  G.VIEWS['bo-may-tap-doan'] = function () {
    var o = '<div class="hd"><h2>' + ic('grid') + ' Bộ máy tập đoàn tinh gọn</h2>' +
      '<p class="sub">Mười sáu ban/hệ thống — mỗi ban TRỎ vào hệ thống thật đang chạy (CI đo mỗi PR), ' +
      'chỗ còn thiếu ghi thật. Tinh gọn nghĩa là một người điều hành được: mỗi ban đã có SOP, cổng và ' +
      'khoá sở hữu; bộ não V20 gánh phần lặp, người chỉ quyết ở chốt chặn.</p></div>';

    /* ── NGĂN 1 · MƯỜI BAN ── */
    o += '<div class="card mt"><b>Bộ máy — 16 ban / hệ thống</b><table class="tbl sm mt">' +
      '<tr><th>Mã</th><th>Ban</th><th>Sứ mệnh</th><th>Trỏ vào mã thật</th><th>Còn thiếu (ghi thật)</th></tr>' +
      G.TD_BAN.map(function (b) {
        return '<tr><td class="mono">' + h(b.ma) + '</td><td><b>' + h(b.ten) + '</b></td><td class="tiny">' + h(b.menh) + '</td>' +
          '<td class="mono tiny">' + veTro(b.tro) + '</td>' +
          '<td class="tiny muted">' + (b.thieu ? h(b.thieu) : '—') + '</td></tr>';
      }).join('') + '</table></div>';

    /* ── NGĂN 2 · CÂY GIÁ TRỊ ── */
    o += '<div class="card mt"><b>Cây giá trị</b><div class="tiny muted mt">Cây chỉ sống khi mỗi tầng trỏ vào cơ chế thật — ' +
      'tầng nào không trỏ được là tầng chưa có.</div><table class="tbl sm mt"><tr><th>Tầng</th><th>Là gì</th><th>Trỏ vào</th></tr>' +
      G.TD_CAY_GT.map(function (t) {
        return '<tr><td><b>' + h(t.tang) + '</b></td><td class="tiny">' + h(t.ten) + '</td><td class="mono tiny">' +
          (t.tro.length ? veTro(t.tro) : '<span class="muted">chính bảng bên trên</span>') + '</td></tr>';
      }).join('') + '</table></div>';

    /* ── NGĂN 3 · CÂY TIỀN — KPI đo từ D1 lúc đọc ── */
    var k = G.tdKpi;
    if (!k) { if (G.goiMayChu) G.tdKpiTai(); o += '<div class="card mt tiny muted">Đang đọc cây tiền từ máy chủ… ' + nut('G.tdKpiTai()', 'Tải lại') + '</div>'; }
    else if (!k.ok) o += '<div class="card mt" style="color:var(--gita-do)">' + h(k.error || 'Không đọc được KPI.') + '</div>';
    else {
      o += '<div class="card mt"><b>Cây tiền — ba đích, đo từ dữ liệu thật</b>' +
        '<div class="tiny muted mt">Không có ô nhập tay: mọi chỉ số tính lúc đọc từ D1 (' +
        (k.tong ? 'đang có <b>' + k.tong + '</b> khách · ' + k.dangHoc + ' đang học · ' + k.tang5 + ' đạt tầng 5' : h(k.ghiChu || '')) + ').</div>';
      if (k.kpi) o += '<div class="hvh-tru mt">' + k.kpi.map(function (x) {
        return '<div class="hvh-tru-o"><div class="hvh-tru-dau"><b>' + h(x.ten) + '</b>' +
          '<span class="hvh-do" style="color:' + (x.dat ? 'var(--ok)' : 'var(--gita-sau)') + '">' + x.giaTri + '% / đích ' + x.dich + '%' +
          (x.dat ? ' ✓' : ' · thiếu ' + x.conThieu + ' điểm %') + '</span></div>' +
          '<p class="hvh-meta">Công thức: ' + h(x.congThuc) + ' · nguồn: <code>' + h(x.nguon) + '</code>' +
          (x.proxy ? ' · <b>proxy</b> (chưa khảo sát trực tiếp)' : '') + '</p></div>';
      }).join('') + '</div>';
      (k.khoangTrong || []).forEach(function (g) {
        o += '<div class="tiny mt" style="color:var(--gita-sau)"><b>Chỗ trống:</b> ' + h(g) + '</div>';
      });
      o += '</div>';
    }
    o += '<p class="note hvh-note">Đích 90% · 90% · 20% là do chủ hệ đặt; máy chỉ đo và báo thật, kể cả khi xấu.</p>';
    return o;
  };
})();
