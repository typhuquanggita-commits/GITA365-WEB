/* ═══════════════════════════════════════════════════════════════
   GITA 365 — NGHỀ TƯ VẤN · CHUYÊN MÔN HOÁ SÂU

   Bốn module dựng nghề Tư vấn thành một chuẩn chuyên môn hoàn chỉnh:
     A. Khung nghề  — vai trò · quyền hạn · nghiệp vụ · hiến pháp · công
        cụ · KPI · tiêu chuẩn nhân sự · thưởng/phạt · 5 cấp chứng nhận.
     B. 30 đầu việc hằng ngày để tính KPI/Lương — trọng số · tiêu chuẩn ·
        quy trình · cẩm nang · video · nhận diện đạt/không đạt.
     C. Lộ trình tư vấn khách — 5 giai đoạn chăm sóc, hồ sơ, đèn, tiến
        trình đang/kế, tài liệu, dữ liệu buổi, đánh giá, bằng chứng,
        tiềm năng nâng gói.
     D. Lộ trình đào tạo nâng cấp — cấp đang đạt · 5 trụ huấn luyện ·
        hệ 10.000 điểm chạm WOW.

   Mọi phần nặng NỐI THẲNG tới màn sâu đã có (không chép lại nội dung).
   Mở cho Tư vấn trở lên (pro_consult). Dữ liệu khách lấy từ Trung tâm
   Tư vấn & CSKH (G.ttKhach) — khách thật khi đã nối máy chủ, chưa thì
   minh hoạ có nhãn. Không đụng máy chủ, giấy phép, mã hoá.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;
G.VIEWS = G.VIEWS || {};

(function () {
  var U = G.U, h = U.h, ic = U.ic;

  function lk(cua, nhan) { return '<button class="btn ghost sm ntv-lk" data-v="' + h(cua) + '">' + h(nhan) + ' →</button>'; }

  /* ══ A · KHUNG NGHỀ ══ */
  var KHUNG = [
    { ic: 'crown', ten: 'Vai trò & Sứ mệnh', mo: '<b>Chuyên gia Tư vấn (R11)</b> — người mở cánh cửa cho gia đình đang tìm đường. Đưa đúng lộ trình cho đúng nhà, đúng lúc; không bán, mà dẫn.', lk: ['gioi-thieu', 'GITA 365 là gì'] },
    { ic: 'lock', ten: 'Quyền hạn', mo: 'Mở & xử lý ca (<code>ca_xu_ly</code>) · gửi tư liệu cho gia đình theo cửa KPI (<code>tl_gui_khach</code>) · công cụ tư vấn (<code>pro_consult</code>). KHÔNG động tiền/duyệt chi.', lk: ['pham-vi', 'Phạm vi của tôi'] },
    { ic: 'target', ten: 'Nghiệp vụ cốt lõi', mo: 'Sàng lọc nhu cầu → tư vấn lộ trình cá nhân hoá → xử lý băn khoăn → chốt đúng chuẩn → bàn giao sạch → chăm sóc tái chạm.', lk: ['ban-tu-van', 'Bàn làm việc Tư vấn'] },
    { ic: 'shield', ten: 'Hiến pháp nghề', mo: 'Năm điều tư vấn KHÔNG được làm · Bảy quyền của gia đình · Năm điều không ai được sửa. Vi phạm hiến pháp là lằn ranh đỏ.', lk: ['so-tay-tu-van', 'Năm điều không được làm'], lk2: ['phap-ly', 'Bảy quyền của nhà'] },
    { ic: 'tools', ten: 'Công cụ', mo: 'Trung tâm Tư vấn & CSKH · Phễu chốt · Bàn tư vấn · Trợ lý GITA · Chuẩn ngôn ngữ sáu vai.', lk: ['tt-cskh', 'Trung tâm CSKH'], lk2: ['pheu-chot', 'Phễu chốt'] },
    { ic: 'pulse', ten: 'KPI nghề', mo: 'Tỷ lệ chốt (mục tiêu 95%) · số buổi đạt chuẩn · điểm sức khoẻ khách · doanh thu trọng số · chuỗi đóng việc đúng hạn.', lk: ['kpi-toi', 'KPI của tôi'], lk2: ['do-luong-kh', 'Đo lường KH'] },
    { ic: 'quote', ten: 'Tiêu chuẩn nhân sự', mo: 'Thái độ đồng hành không bán ép · kỷ luật nhịp chạm · chuẩn ngôn ngữ (9 câu cấm) · bằng chứng mọi buổi · trung thực số liệu.', lk: ['chuan-ngon-ngu', 'Chuẩn ngôn ngữ'] },
    { ic: 'spark', ten: 'Thưởng / Phạt', mo: 'THƯỞNG: KPI tháng ≥ ngưỡng, chuỗi đúng hạn, chốt vượt mục tiêu, khách giới thiệu. PHẠT: trễ hạn trừ điểm ngày, vi phạm hiến pháp hạ 50% KPI 3 tháng.', lk: ['luat-lam-viec', 'Luật làm việc'] },
    { ic: 'crown', ten: 'Chứng nhận 5 cấp', mo: 'Tập sự → Sơ cấp → Chính thức → Cao cấp → Chuyên gia. Lên cấp bằng bằng chứng, không bằng thâm niên.', lk: ['coach-5-tang', 'Năm tầng người đi cùng'] }
  ];
  var CAP = [
    { n: 1, ten: 'Tư vấn Tập sự', c: '#73849F', dk: 'Qua 40h đào tạo nền + thi đầu vào', ql: 'Nhận khách mới có người kèm' },
    { n: 2, ten: 'Tư vấn Sơ cấp', c: '#185AB4', dk: '≥20 buổi đạt chuẩn · chốt ≥10 nhà', ql: 'Tự nhận khách · hoa hồng cơ bản' },
    { n: 3, ten: 'Tư vấn Chính thức', c: '#0B6675', dk: 'KPI ≥85% ba tháng · 0 vi phạm hiến pháp', ql: 'Khách giá trị cao · thưởng tăng' },
    { n: 4, ten: 'Tư vấn Cao cấp', c: '#B4720F', dk: 'Tỷ lệ chốt ≥80% · điểm sức khoẻ KH TB ≥75', ql: 'Kèm tập sự · chia đội nhỏ' },
    { n: 5, ten: 'Chuyên gia Tư vấn', c: '#0B7350', dk: 'Dẫn dắt đội · chuẩn hoá kịch bản đạt chuẩn', ql: 'Quyền thiết kế quy trình · thu nhập bậc cao' }
  ];
  function tabKhung() {
    var o = '<div class="ntv-grid">';
    KHUNG.forEach(function (k) {
      o += '<div class="ntv-card"><div class="ntv-card-h"><span class="ntv-ic">' + ic(k.ic) + '</span><b>' + h(k.ten) + '</b></div>' +
        '<p>' + k.mo + '</p><div class="ntv-lks">' + lk(k.lk[0], k.lk[1]) + (k.lk2 ? lk(k.lk2[0], k.lk2[1]) : '') + '</div></div>';
    });
    o += '</div>';
    o += U.sec('NĂM CẤP CHỨNG NHẬN TƯ VẤN', 'Lên cấp bằng bằng chứng đo được — mỗi cấp một điều kiện và quyền lợi');
    o += '<div class="ntv-caps">';
    CAP.forEach(function (c) {
      o += '<div class="ntv-cap" style="--cc:' + c.c + '"><div class="ntv-cap-n">' + c.n + '</div><b>' + h(c.ten) + '</b>' +
        '<div class="ntv-cap-row"><span class="ntv-cap-l">Điều kiện</span>' + h(c.dk) + '</div>' +
        '<div class="ntv-cap-row"><span class="ntv-cap-l">Quyền lợi</span>' + h(c.ql) + '</div></div>';
    });
    o += '</div>';
    return o;
  }

  /* ══ B · 30 ĐẦU VIỆC HẰNG NGÀY (tính KPI/Lương) ══
     {t:tên, w:trọng số, tc:tiêu chuẩn, qt:quy trình, cn:cẩm nang(màn), nd:nhận diện đạt} */
  var NHOM = [
    { ten: 'Chuẩn bị đầu ngày', c: '#185AB4' },
    { ten: 'Tiếp cận & sàng lọc', c: '#2A72C6' },
    { ten: 'Tư vấn & báo giá', c: '#0B6675' },
    { ten: 'Chốt & bàn giao', c: '#0B7350' },
    { ten: 'Chăm sóc & tái chạm', c: '#B4720F' },
    { ten: 'Ghi nhận & cải tiến', c: '#5140B4' }
  ];
  var VIEC = [
    [0, 'Rà soát danh sách khách hôm nay', 3, 'Mở đúng danh sách, không sót nhà đèn đỏ', 'Mở Trung tâm CSKH → tab Hôm nay', 'tt-cskh', 'Đã xem hết, đánh dấu ưu tiên'],
    [0, 'Lên kịch bản cho từng buổi', 3, 'Mỗi buổi có mục tiêu + câu mở', 'Chọn kịch bản theo tình huống', 'tro-ly', 'Có kịch bản trước khi gọi'],
    [0, 'Kiểm đèn đỏ / rủi ro, ưu tiên', 4, 'Nhà rủi ro cao lên đầu', 'Xem điểm rủi ro, xếp thứ tự', 'tt-cskh', 'Danh sách đã xếp theo rủi ro'],
    [1, 'Gọi/nhắn khách mới trong 24h', 6, 'Phản hồi ≤24h kể từ khi vào phễu', 'Gọi chào, xác nhận nhu cầu', 'ban-tu-van', 'Có log liên hệ trong 24h'],
    [1, 'Sàng lọc nhu cầu & ngân sách', 4, '7 câu sàng lọc, có 4 câu chặn', 'Hỏi theo bộ câu sàng lọc', 'ban-tu-van', 'Ghi đủ nhu cầu + mức chi'],
    [1, 'Xác định tầng phù hợp', 3, 'Đúng tầng theo hiện trạng nhà', 'Đối chiếu năm tầng', 'tang34', 'Tầng đề xuất có căn cứ'],
    [1, 'Hẹn buổi tư vấn', 3, 'Có lịch cụ thể, khách xác nhận', 'Chốt ngày giờ, gửi nhắc', 'tt-cskh', 'Lịch hẹn đã xác nhận'],
    [1, 'Ghi hồ sơ khách', 3, 'Đủ trường bắt buộc', 'Nhập hồ sơ vào CRM', 'crm', 'Hồ sơ không thiếu trường'],
    [2, 'Tư vấn lộ trình cá nhân hoá', 6, 'Lộ trình bám đúng nhu cầu nhà', 'Dựng lộ trình theo mô thức', 'tang34', 'Khách thấy đúng vấn đề của mình'],
    [2, 'Trình bày giá trị theo nhu cầu', 4, 'Nói giá trị, không nói tính năng', 'Theo khung giá trị', 'chuan-ngon-ngu', 'Không câu cấm, đúng chuẩn'],
    [2, 'Gửi lộ trình & bảng giá', 4, 'Gửi trong buổi/ngay sau buổi', 'Gửi tài liệu phù hợp tầng', 'tt-cskh', 'Có bằng chứng đã gửi'],
    [2, 'Xử lý băn khoăn / từ chối', 4, 'Phân biệt từ chối thật/giả', '30 lời từ chối — câu đáp', 'so-tay-tu-van', 'Băn khoăn được gỡ, ghi lại'],
    [2, 'Điểm chạm WOW cho khách', 3, 'Tối thiểu 1 điểm chạm/buổi', 'Chọn điểm chạm đúng nhịp', 'diem-cham-1000', 'Khách phản hồi tích cực'],
    [2, 'Cập nhật giai đoạn phễu', 2, 'Giai đoạn phản ánh đúng thực tế', 'Đẩy giai đoạn sau mỗi buổi', 'pheu-chot', 'Phễu khớp thực tế'],
    [3, 'Chốt hợp đồng đúng chuẩn', 6, 'Không ép, đúng lằn ranh hiến pháp', 'Theo cây chọn hợp đồng', 'ho-so-hop-dong', 'Hợp đồng hợp lệ, khách đồng thuận'],
    [3, 'Thu bằng chứng cam kết khách', 3, 'Có xác nhận của khách', 'Lưu xác nhận vào hồ sơ', 'crm', 'Có bằng chứng khách xác nhận'],
    [3, 'Bàn giao Coach / vận hành', 3, 'Hồ sơ bàn giao đủ, không mất thông tin', 'Chuyển kèm ghi chú', 'bang-viec', 'Coach nhận đủ, không hỏi lại'],
    [3, 'Hoàn tất hồ sơ ký', 2, 'Đủ chữ ký, đúng mẫu', 'Theo bộ hồ sơ hợp đồng', 'ho-so-hop-dong', 'Hồ sơ đầy đủ pháp lý'],
    [3, 'Xác nhận thanh toán', 2, 'Khớp số, có biên nhận', 'Đối chiếu với tài chính', 'crm', 'Thanh toán được xác nhận'],
    [4, 'Chạm đúng nhịp theo chuỗi chạm', 5, 'Đúng bước, đúng ngày của cadence', 'Làm bước kế của chuỗi', 'tt-cskh', 'Bước chạm đã thực hiện đúng hạn'],
    [4, 'Chăm khách đèn đỏ / rủi ro cao', 4, 'Gọi trong ngày, có giải pháp', 'Bật playbook cứu khách', 'van-hanh-cham-soc', 'Khách được cứu, đèn cải thiện'],
    [4, 'Mời tái ký khách hết chu kỳ', 3, 'Nhắc giá trị + ưu đãi', 'Playbook tái ký', 'tt-cskh', 'Có phản hồi về tái ký'],
    [4, 'Hỏi thăm tiến bộ khách đang dùng', 3, 'Chạm giữ đèn xanh', 'Theo nhịp chăm sóc', 'van-hanh-cham-soc', 'Khách giữ hài lòng'],
    [4, 'Xin giới thiệu khách mới', 2, 'Khi khách hài lòng rõ', 'Hệ một nhà giới thiệu một nhà', 'tt-cskh', 'Có lời giới thiệu mới'],
    [5, 'Ghi dữ liệu buổi tư vấn', 3, 'Mỗi buổi một bản ghi', 'Ghi ngay sau buổi', 'crm', 'Buổi nào cũng có dữ liệu'],
    [5, 'Cập nhật đánh giá / sức khoẻ KH', 3, 'Điểm phản ánh đúng thực tế', 'Chấm theo khung đo lường', 'do-luong-kh', 'Điểm có căn cứ, cập nhật'],
    [5, 'Đóng việc kèm bằng chứng', 3, 'Không có bằng chứng = chưa xong', 'Đóng trên bảng công việc', 'bang-viec', 'Việc đóng có bằng chứng ≥20 ký tự'],
    [5, 'Chốt ngày vào KPI', 2, 'Chốt cuối ngày', 'Bấm chốt ngày', 'kpi-toi', 'Ngày đã chốt vào KPI tháng'],
    [5, 'Ghi sáng kiến cải tiến', 2, 'Tối thiểu 1 ý/tuần', 'Ghi ở cột sáng kiến', 'bang-viec', 'Có sáng kiến được lưu'],
    [5, 'Học 1 kịch bản / điểm chạm mới', 2, 'Mỗi ngày học thêm', 'Đọc kho kịch bản/điểm chạm', 'diem-cham-1000', 'Áp được vào buổi thật']
  ];
  function tabViec() {
    var tong = VIEC.reduce(function (s, v) { return s + v[2]; }, 0);
    var o = '<div class="ntv-note">' + ic('pulse', 'w-4 h-4') + ' <b>30 đầu việc chuẩn</b> · tổng trọng số <b>' + tong + ' điểm</b>. ' +
      'Điểm việc đạt chuẩn trong ngày cộng vào KPI/lương. Mỗi việc nêu rõ tiêu chuẩn, quy trình, cẩm nang và dấu hiệu đạt — không ai mơ hồ.</div>';
    o += '<div class="ntv-wrap"><table class="ntv-table"><thead><tr>' +
      ['STT', 'Đầu việc', 'Trọng số', 'Nhóm', 'Tiêu chuẩn', 'Quy trình', 'Cẩm nang', 'Video', 'Nhận diện ĐẠT'].map(function (c) { return '<th>' + h(c) + '</th>'; }).join('') + '</tr></thead><tbody>';
    VIEC.forEach(function (v, i) {
      var n = NHOM[v[0]];
      o += '<tr>' +
        '<td class="ntv-stt">' + (i + 1) + '</td>' +
        '<td><b>' + h(v[1]) + '</b></td>' +
        '<td class="ntv-w"><span class="ntv-wpill">' + v[2] + '</span></td>' +
        '<td><span class="ntv-nhom" style="--nc:' + n.c + '">' + h(n.ten) + '</span></td>' +
        '<td class="tiny">' + h(v[3]) + '</td>' +
        '<td class="tiny">' + h(v[4]) + '</td>' +
        '<td>' + lk(v[5], 'Mở') + '</td>' +
        '<td class="ntv-vid"><span title="Video minh hoạ (gắn sau)">▶</span></td>' +
        '<td class="tiny"><span class="ntv-dat">✓ ' + h(v[6]) + '</span></td>' +
      '</tr>';
    });
    o += '</tbody></table></div>';
    o += '<p class="tiny muted" style="margin-top:8px">' + ic('shield', 'w-3 h-3') + ' Video/hình minh hoạ gắn dần theo từng đầu việc. "Nhận diện ĐẠT" là điều kiện tối thiểu để việc được tính điểm — thiếu bằng chứng thì chưa đạt.</p>';
    return o;
  }

  /* ══ C · LỘ TRÌNH TƯ VẤN KHÁCH — 5 giai đoạn chăm sóc ══ */
  var GDJ = [
    { n: 1, ten: 'Tiếp nhận & thấu hiểu', c: '#185AB4' },
    { n: 2, ten: 'Tư vấn lộ trình', c: '#2A72C6' },
    { n: 3, ten: 'Trải nghiệm & cam kết', c: '#0B6675' },
    { n: 4, ten: 'Đồng hành & kết quả', c: '#0B7350' },
    { n: 5, ten: 'Nâng cấp & giới thiệu', c: '#B4720F' }
  ];
  var KH_MAU = [
    { ten: 'Nhà Minh Khang', ma: 'GITA-2201', gdj: 2, band: 'DO', buoi: 2, danhGia: 3.5, bangChung: 'Chưa', nangGoi: 'Trung bình' },
    { ten: 'Nhà Hồng Phúc', ma: 'GITA-2202', gdj: 4, band: 'XANH', buoi: 6, danhGia: 4.6, bangChung: 'Có', nangGoi: 'Cao' },
    { ten: 'Nhà Quỳnh Anh', ma: 'GITA-2203', gdj: 1, band: 'VANG', buoi: 1, danhGia: 3.0, bangChung: 'Chưa', nangGoi: 'Thấp' },
    { ten: 'Nhà Đức Thịnh', ma: 'GITA-2204', gdj: 3, band: 'VANG', buoi: 4, danhGia: 4.0, bangChung: 'Có', nangGoi: 'Cao' },
    { ten: 'Nhà Bảo Ngọc', ma: 'GITA-2205', gdj: 2, band: 'DO', buoi: 3, danhGia: 2.8, bangChung: 'Chưa', nangGoi: 'Trung bình' }
  ];
  var BANDC = { DO: '#BE0E16', VANG: '#B4720F', XANH: '#0B7350' };
  function khDs() {
    var real = (typeof G.ttKhach === 'function') ? G.ttKhach() : null;
    if (real && real.length) return real.map(function (k, i) {
      return { ten: k.ten, ma: k.ma, gdj: Math.min(5, (['moi', 'tuvan', 'baogia', 'damphan', 'chotky'].indexOf(k.gd) + 1) || 1), band: k.band, buoi: (i % 5) + 1, danhGia: null, bangChung: k.band === 'XANH' ? 'Có' : 'Chưa', nangGoi: k.gt >= 30000000 ? 'Cao' : k.gt >= 18000000 ? 'Trung bình' : 'Thấp', that: true };
    });
    return KH_MAU;
  }
  function tabKhach() {
    var ds = khDs(), that = ds[0] && ds[0].that;
    var o = '<div class="ntv-note">' + ic('map', 'w-4 h-4') + ' Mỗi khách đi qua <b>5 giai đoạn chăm sóc</b>. Bảng theo dõi trọn hồ sơ: đang ở đâu, bước kế, tài liệu, dữ liệu buổi, đánh giá, bằng chứng và tiềm năng nâng gói.' +
      (that ? ' <b style="color:#0B7350">Đang chạy trên khách thật.</b>' : ' <span style="color:#B4720F">(minh hoạ)</span>') + '</div>';
    o += '<div class="ntv-gdj">';
    GDJ.forEach(function (g) {
      var so = ds.filter(function (k) { return k.gdj === g.n; }).length;
      o += '<div class="ntv-gdj-pill" style="--gc:' + g.c + '"><b>' + g.n + '. ' + h(g.ten) + '</b><span>' + so + ' khách</span></div>';
    });
    o += '</div>';
    o += '<div class="ntv-wrap"><table class="ntv-table"><thead><tr>' +
      ['STT', 'Khách', 'Hồ sơ', 'Giai đoạn (1-5)', 'Đèn', 'Đang chăm', 'Bước tiếp theo', 'Tài liệu', 'Dữ liệu buổi', 'Đánh giá', 'Bằng chứng', 'Tiềm năng nâng', 'Hồ sơ lộ trình'].map(function (c) { return '<th>' + h(c) + '</th>'; }).join('') + '</tr></thead><tbody>';
    ds.forEach(function (k, i) {
      var g = GDJ[(k.gdj || 1) - 1] || GDJ[0];
      var gke = GDJ[Math.min(4, (k.gdj || 1))] || GDJ[4];
      var dang = ['Thu thập nhu cầu & hồ sơ', 'Dựng & trình lộ trình', 'Demo WOW, xử lý băn khoăn', 'Theo dõi kết quả, chăm sóc', 'Mời nâng gói / giới thiệu'][(k.gdj || 1) - 1];
      var ke = ['Chốt tầng & hẹn tư vấn', 'Gửi lộ trình, hẹn chốt', 'Chốt hợp đồng, thu cam kết', 'Đo kết quả, giữ đèn xanh', 'Chốt nâng gói'][(k.gdj || 1) - 1];
      var tn = k.nangGoi, tnc = tn === 'Cao' ? '#0B7350' : tn === 'Trung bình' ? '#B4720F' : '#73849F';
      o += '<tr>' +
        '<td class="ntv-stt">' + (i + 1) + '</td>' +
        '<td><b>' + h(k.ten) + '</b><div class="tiny muted">' + h(k.ma) + '</div></td>' +
        '<td>' + lk('crm', 'Hồ sơ') + '</td>' +
        '<td><span class="ntv-nhom" style="--nc:' + g.c + '">' + g.n + '. ' + h(g.ten) + '</span></td>' +
        '<td><span class="ntv-band" style="--bc:' + (BANDC[k.band] || '#73849F') + '"></span></td>' +
        '<td class="tiny">' + h(dang) + '</td>' +
        '<td class="tiny"><b style="color:' + gke.c + '">→ ' + h(ke) + '</b></td>' +
        '<td>' + lk('tang34', 'Tài liệu') + '</td>' +
        '<td class="tiny ntv-center">' + k.buoi + ' buổi</td>' +
        '<td class="tiny ntv-center">' + (k.danhGia != null ? ('<b>' + k.danhGia.toFixed(1) + '</b>/5') : '—') + '</td>' +
        '<td class="tiny ntv-center">' + (k.bangChung === 'Có' ? '<span style="color:#0B7350;font-weight:700">✓ Có</span>' : '<span style="color:#B4720F">Chưa</span>') + '</td>' +
        '<td><span class="ntv-nhom" style="--nc:' + tnc + '">' + h(tn) + '</span></td>' +
        '<td>' + lk('tt-cskh', 'Mở lộ trình') + '</td>' +
      '</tr>';
    });
    o += '</tbody></table></div>';
    return o;
  }

  /* ══ D · LỘ TRÌNH ĐÀO TẠO NÂNG CẤP ══ */
  var TRU = [
    { ic: 'seed', ten: 'Tổng quan GITA', mo: 'Sứ mệnh · năm tầng · văn hoá · cách đồng hành.', cua: 'gioi-thieu' },
    { ic: 'target', ten: 'Nghiệp vụ tư vấn', mo: 'Sàng lọc · lộ trình · xử lý từ chối · chốt đúng chuẩn.', cua: 'ban-tu-van' },
    { ic: 'orbit', ten: 'Hệ thống quy trình', mo: 'Quy trình toàn hệ · chuẩn ngôn ngữ · hiến pháp nghề.', cua: 'quy-trinh-toan-he' },
    { ic: 'spark', ten: 'Làm việc cùng AI', mo: 'Dùng Trợ lý GITA gợi ý câu nói, tổng hợp, nhắc việc.', cua: 'tro-ly' },
    { ic: 'heart', ten: 'Chăm sóc khách hàng', mo: 'Nhịp chạm 365 · playbook · điểm sức khoẻ khách.', cua: 'van-hanh-cham-soc' }
  ];
  var NS_MAU = [
    { ten: 'Nguyễn Minh', cap: 3, hl: [100, 90, 80, 60, 70], wow: 3200 },
    { ten: 'Trần Lan', cap: 2, hl: [100, 70, 50, 40, 55], wow: 1800 },
    { ten: 'Lê Hà', cap: 4, hl: [100, 100, 95, 85, 90], wow: 6400 },
    { ten: 'Phạm Bảo', cap: 1, hl: [80, 40, 30, 20, 25], wow: 600 }
  ];
  function tabDaoTao() {
    var o = U.sec('NĂM TRỤ HUẤN LUYỆN', 'Mỗi trụ nối thẳng tới màn học sâu — học tới đâu, điểm lên tới đó');
    o += '<div class="ntv-grid ntv-grid-5">';
    TRU.forEach(function (t, i) {
      o += '<div class="ntv-card ntv-tru"><div class="ntv-ic ntv-ic-lg">' + ic(t.ic) + '</div><b>' + (i + 1) + '. ' + h(t.ten) + '</b><p class="tiny">' + h(t.mo) + '</p>' + lk(t.cua, 'Vào học') + '</div>';
    });
    o += '</div>';

    o += '<div class="ntv-wow">' + ic('sparkle', 'w-4 h-4') + ' <div><b>Hệ 10.000 điểm chạm WOW</b> — ngân hàng khoảnh khắc chạm cảm xúc khách, học & áp dần qua từng cấp. ' +
      '(Nền có 1.000 điểm chạm × 10 nhịp — mở rộng tới 10.000.) ' + lk('diem-cham-1000', 'Mở kho điểm chạm') + '</div></div>';

    o += U.sec('BẢNG TIẾN ĐỘ ĐÀO TẠO NHÂN SỰ', 'Cấp đang đạt · tiến độ 5 trụ · điểm chạm WOW đã tích');
    o += '<div class="ntv-wrap"><table class="ntv-table"><thead><tr>' +
      ['Họ và tên', 'Hồ sơ', 'Cấp đạt'].concat(TRU.map(function (t) { return t.ten; })).concat(['Điểm chạm WOW', 'Tổng tiến độ']).map(function (c) { return '<th>' + h(c) + '</th>'; }).join('') + '</tr></thead><tbody>';
    NS_MAU.forEach(function (n) {
      var cap = CAP[n.cap - 1] || CAP[0];
      var tb = Math.round(n.hl.reduce(function (a, b) { return a + b; }, 0) / n.hl.length);
      var cells = n.hl.map(function (p) {
        var c = p >= 80 ? '#0B7350' : p >= 50 ? '#B4720F' : '#BE0E16';
        return '<td class="ntv-prog"><div class="ntv-prog-bar"><i style="width:' + p + '%;background:' + c + '"></i></div><span>' + p + '%</span></td>';
      }).join('');
      o += '<tr><td><b>' + h(n.ten) + '</b></td><td>' + lk('kpi-toi', 'Hồ sơ') + '</td>' +
        '<td><span class="ntv-nhom" style="--nc:' + cap.c + '">C' + n.cap + ' · ' + h(cap.ten) + '</span></td>' +
        cells +
        '<td class="ntv-center"><b>' + n.wow.toLocaleString('vi-VN') + '</b><div class="tiny muted">/10.000</div></td>' +
        '<td class="ntv-center"><b style="color:' + (tb >= 80 ? '#0B7350' : tb >= 50 ? '#B4720F' : '#BE0E16') + '">' + tb + '%</b></td></tr>';
    });
    o += '</tbody></table></div>';
    o += '<p class="tiny muted" style="margin-top:8px">' + ic('shield', 'w-3 h-3') + ' Danh sách minh hoạ. Khi nối máy chủ, bảng chạy trên hồ sơ đào tạo thật của đội.</p>';
    return o;
  }

  /* Chuẩn nghề dùng chung cho Bảng điều khiển theo vai (dk-vai.js) — chỉ đọc. */
  G.NGHE_DATA = G.NGHE_DATA || {};
  G.NGHE_DATA['nghe-tu-van'] = { vaiTen: 'Tư vấn', khung: KHUNG, cap: CAP, nhom: NHOM, viec: VIEC };

  G.VIEWS['nghe-tu-van'] = function () {
    if (!(typeof G.can === 'function' && G.can('pro_consult')))
      return U.lockCard('Trang chuyên môn hoá nghề Tư vấn mở cho Chuyên gia tư vấn trở lên. Đăng nhập đúng vai để xem.');
    var o = U.ph({ eyebrow: 'NGHỀ TƯ VẤN · CHUYÊN MÔN HOÁ SÂU', ic: 'crown', grad: 1,
      t: 'Chuẩn nghề Tư vấn — từ khung nghề tới việc hằng ngày, lộ trình khách và đào tạo',
      lead: 'Bốn module: khung nghề (vai trò · quyền · hiến pháp · KPI · chứng nhận) · 30 đầu việc tính KPI/lương · lộ trình tư vấn khách 5 giai đoạn · lộ trình đào tạo nâng cấp. Phần nặng nối thẳng màn chuyên sâu.' });
    var tabs = [['khung', 'A · Khung nghề'], ['viec', 'B · 30 đầu việc / KPI'], ['khach', 'C · Lộ trình khách'], ['daotao', 'D · Lộ trình đào tạo']];
    o += tabs.map(function (t, i) { return '<input type="radio" name="ntvTab" id="ntv-' + t[0] + '" class="ntv-radio"' + (i === 0 ? ' checked' : '') + '>'; }).join('');
    o += '<div class="ntv-tabbar">' + tabs.map(function (t) { return '<label for="ntv-' + t[0] + '">' + h(t[1]) + '</label>'; }).join('') + '</div>';
    o += '<div class="ntv-panel" id="ntv-p-khung">' + tabKhung() + '</div>';
    o += '<div class="ntv-panel" id="ntv-p-viec">' + tabViec() + '</div>';
    o += '<div class="ntv-panel" id="ntv-p-khach">' + tabKhach() + '</div>';
    o += '<div class="ntv-panel" id="ntv-p-daotao">' + tabDaoTao() + '</div>';
    return o;
  };
})();
