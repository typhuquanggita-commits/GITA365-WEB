/* ═══════════════════════════════════════════════════════════════
   GITA 365 — NGHỀ COACH · CHUYÊN MÔN HOÁ SÂU

   Cùng khuôn với Nghề Tư vấn, nội dung đúng nghề Coach (người đồng hành
   chuyển hoá gia đình). Bốn module:
     A. Khung nghề — vai trò · quyền · nghiệp vụ · hiến pháp · công cụ ·
        KPI · tiêu chuẩn nhân sự Coach · thưởng/phạt · 5 cấp chứng nhận.
     B. 30 đầu việc hằng ngày tính KPI/Lương — trọng số · tiêu chuẩn ·
        quy trình · cẩm nang · video · nhận diện đạt/không đạt.
     C. Lộ trình Coach khách — 5 giai đoạn, hồ sơ, đèn, tiến trình
        đang/kế, tài liệu, dữ liệu buổi, đánh giá, bằng chứng, nâng gói.
     D. Lộ trình đào tạo nâng cấp Coach — 5 trụ · 10.000 điểm chạm WOW.

   Mở cho Coach trở lên (pro_coach). Tái dùng CSS .ntv-* và dữ liệu khách
   thật qua G.ttKhach. Không đụng máy chủ, giấy phép, mã hoá.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;
G.VIEWS = G.VIEWS || {};

(function () {
  var U = G.U, h = U.h, ic = U.ic;
  function lk(cua, nhan) { return '<button class="btn ghost sm ntv-lk" data-v="' + h(cua) + '">' + h(nhan) + ' →</button>'; }

  /* ══ A · KHUNG NGHỀ ══ */
  var KHUNG = [
    { ic: 'crown', ten: 'Vai trò & Sứ mệnh', mo: '<b>Coach (R07)</b> — người thắp lửa chuyển hoá cho từng gia đình. Đồng hành, không làm thay; dẫn nhà tự đi được trên con đường của mình.', lk: ['coach-5-tang', 'Người đi cùng phải làm được gì'] },
    { ic: 'lock', ten: 'Quyền hạn', mo: 'Công cụ Coach (<code>pro_coach</code>) · mở & xử lý ca (<code>ca_xu_ly</code>) · xác nhận minh chứng (<code>mc_duyet</code>) · gửi tư liệu cho gia đình (<code>tl_gui_khach</code>). KHÔNG động tiền/duyệt chi.', lk: ['pham-vi', 'Phạm vi của tôi'] },
    { ic: 'target', ten: 'Nghiệp vụ cốt lõi', mo: 'Chẩn đoán gia đình → dựng lộ trình 5 tầng → giao nhiệm vụ đúng sức → đồng hành nhịp 21/90 → nghiệm thu bằng chứng → giữ đèn xanh.', lk: ['ban-coach', 'Bàn làm việc Coach'] },
    { ic: 'shield', ten: 'Hiến pháp nghề', mo: 'Năm điều không ai được sửa · Bảy quyền của gia đình · ranh giới Coach: không làm thay, không hứa điều không đo được. Vi phạm là lằn ranh đỏ.', lk: ['bien-nien', 'Năm điều không ai được sửa'], lk2: ['phap-ly', 'Bảy quyền của nhà'] },
    { ic: 'tools', ten: 'Công cụ', mo: 'Bàn làm việc Coach · Buồng lái Coach · Bản đồ coaching · Bộ bản vẽ 50 ô · 1000 điểm chạm.', lk: ['bando-coach', 'Bản đồ coaching'], lk2: ['ban-ve', 'Bộ bản vẽ 50 ô'] },
    { ic: 'pulse', ten: 'KPI nghề', mo: 'Số gia đình lên tầng · điểm nghiệm thu đạt chuẩn · đèn gia đình xanh · chuỗi đóng việc đúng hạn · tỷ lệ giữ chân.', lk: ['kpi-toi', 'KPI của tôi'], lk2: ['do-luong-kh', 'Đo lường KH'] },
    { ic: 'quote', ten: 'Tiêu chuẩn nhân sự Coach', mo: 'Đồng hành không phán xét · kỷ luật nhịp chạm · bằng chứng mọi buổi · chuẩn ngôn ngữ dẫn dắt · trung thực số liệu.', lk: ['chuan-ngon-ngu', 'Chuẩn ngôn ngữ'] },
    { ic: 'spark', ten: 'Thưởng / Phạt', mo: 'THƯỞNG: gia đình lên tầng, chuỗi đúng hạn, KPI tháng ≥ ngưỡng, nhà giới thiệu nhà. PHẠT: trễ nghiệm thu trừ điểm ngày, vi phạm hiến pháp hạ 50% KPI 3 tháng, làm thay thay vì đồng hành.', lk: ['luat-lam-viec', 'Luật làm việc'] },
    { ic: 'crown', ten: 'Chứng nhận 5 cấp', mo: 'Tập sự → Coach → Senior Coach → Trưởng nhóm → Chuyên gia dẫn dắt. Lên cấp bằng bằng chứng (gia đình lên tầng thật), không bằng thâm niên.', lk: ['coach-5-tang', 'Năm tầng người đi cùng'] }
  ];
  var CAP = [
    { n: 1, ten: 'Coach Tập sự', c: '#73849F', dk: 'Qua 40h đào tạo nền + thi đầu vào', ql: 'Nhận gia đình có người kèm' },
    { n: 2, ten: 'Coach', c: '#185AB4', dk: '≥3 gia đình lên tầng có bằng chứng', ql: 'Tự nhận 3 gia đình T2–T3' },
    { n: 3, ten: 'Senior Coach', c: '#0B6675', dk: 'KPI ≥85% ba tháng · 0 vi phạm hiến pháp', ql: 'Gỡ ca khó · 4 gia đình T4–T5' },
    { n: 4, ten: 'Trưởng nhóm Coach', c: '#B4720F', dk: 'Đèn gia đình TB ≥75 · kèm được Coach mới', ql: 'Dẫn nhóm · phân công đội' },
    { n: 5, ten: 'Chuyên gia dẫn dắt', c: '#0B7350', dk: 'Chuẩn hoá phương pháp · đào tạo Coach giỏi', ql: 'Thiết kế quy trình · thu nhập bậc cao' }
  ];
  function tabKhung() {
    var o = '<div class="ntv-grid">';
    KHUNG.forEach(function (k) {
      o += '<div class="ntv-card"><div class="ntv-card-h"><span class="ntv-ic">' + ic(k.ic) + '</span><b>' + h(k.ten) + '</b></div>' +
        '<p>' + k.mo + '</p><div class="ntv-lks">' + lk(k.lk[0], k.lk[1]) + (k.lk2 ? lk(k.lk2[0], k.lk2[1]) : '') + '</div></div>';
    });
    o += '</div>';
    o += U.sec('NĂM CẤP CHỨNG NHẬN COACH', 'Lên cấp bằng bằng chứng đo được — gia đình lên tầng thật, không bằng thâm niên');
    o += '<div class="ntv-caps">';
    CAP.forEach(function (c) {
      o += '<div class="ntv-cap" style="--cc:' + c.c + '"><div class="ntv-cap-n">' + c.n + '</div><b>' + h(c.ten) + '</b>' +
        '<div class="ntv-cap-row"><span class="ntv-cap-l">Điều kiện</span>' + h(c.dk) + '</div>' +
        '<div class="ntv-cap-row"><span class="ntv-cap-l">Quyền lợi</span>' + h(c.ql) + '</div></div>';
    });
    o += '</div>';
    return o;
  }

  /* ══ B · 30 ĐẦU VIỆC HẰNG NGÀY (tính KPI/Lương) ══ */
  var NHOM = [
    { ten: 'Chuẩn bị đầu ngày', c: '#185AB4' },
    { ten: 'Mở buổi & chẩn đoán', c: '#2A72C6' },
    { ten: 'Dẫn dắt & giao nhiệm vụ', c: '#0B6675' },
    { ten: 'Nghiệm thu & bằng chứng', c: '#0B7350' },
    { ten: 'Chăm sóc & giữ đèn', c: '#B4720F' },
    { ten: 'Ghi nhận & cải tiến', c: '#5140B4' },
    { ten: 'Nâng cao & phối hợp', c: '#BE0E16' }
  ];
  var VIEC = [
    [0, 'Rà soát gia đình cần đồng hành hôm nay', 2, 'Mở đúng danh sách, không sót nhà đèn đỏ', 'Mở Trung tâm CSKH → tab Hôm nay', 'tt-cskh', 'Đã xem hết, đánh dấu ưu tiên'],
    [0, 'Xem đèn gia đình, ưu tiên đèn đỏ', 3, 'Nhà đèn đỏ lên đầu danh sách', 'Xem điểm đèn, xếp thứ tự', 'do-luong-kh', 'Danh sách đã xếp theo đèn'],
    [0, 'Chuẩn bị giáo cụ / bản vẽ cho buổi', 2, 'Mỗi buổi có công cụ phù hợp', 'Chọn ô bản vẽ theo chủ đề', 'ban-ve', 'Có giáo cụ trước khi vào buổi'],
    [1, 'Mở buổi đúng nhịp đã hẹn', 3, 'Đúng ngày giờ cadence 21/90', 'Mở buổi trên bàn Coach', 'ban-coach', 'Buổi mở đúng hạn, có log'],
    [1, 'Chẩn đoán hiện trạng gia đình', 5, 'Đọc đúng nút thắt thật của nhà', 'Soi theo bản đồ coaching', 'bando-coach', 'Nút thắt được gọi tên'],
    [1, 'Định vị tầng của nhà', 2, 'Đúng tầng theo hiện trạng', 'Đối chiếu năm tầng', 'coach-5-tang', 'Tầng xác định có căn cứ'],
    [1, 'Ghi mục tiêu buổi', 2, 'Mỗi buổi một mục tiêu đo được', 'Ghi mục tiêu vào bảng việc', 'bang-viec', 'Có mục tiêu rõ trước khi dẫn'],
    [1, 'Lắng nghe không phán xét', 2, 'Để nhà nói, không áp đặt', 'Theo chuẩn ngôn ngữ dẫn dắt', 'chuan-ngon-ngu', 'Nhà cảm thấy được lắng nghe'],
    [2, 'Dựng lộ trình cá nhân hoá 5 tầng', 5, 'Lộ trình bám đúng nhà', 'Dựng theo bản đồ coaching', 'bando-coach', 'Nhà thấy đúng đường của mình'],
    [2, 'Giao nhiệm vụ đúng sức nhà', 4, 'Vừa sức, có hạn, đo được', 'Giao theo con đường nhiệm vụ', 'con-duong', 'Nhiệm vụ rõ, nhà nhận được'],
    [2, 'Hướng dẫn công cụ / tài liệu', 2, 'Nhà biết dùng tài liệu đã giao', 'Mở kho tài liệu phù hợp', 'kho-tai-lieu', 'Nhà dùng được công cụ'],
    [2, 'Điểm chạm WOW trong buổi', 2, 'Tối thiểu 1 điểm chạm/buổi', 'Chọn điểm chạm đúng nhịp', 'diem-cham-1000', 'Nhà phản hồi tích cực'],
    [2, 'Chốt cam kết tuần / chu kỳ', 2, 'Nhà cam kết việc cụ thể', 'Chốt trên bảng việc', 'bang-viec', 'Có cam kết ghi lại'],
    [2, 'Cập nhật giai đoạn coaching', 2, 'Giai đoạn phản ánh đúng thực tế', 'Đẩy giai đoạn sau mỗi buổi', 'bando-coach', 'Giai đoạn khớp thực tế'],
    [3, 'Nghiệm thu nhiệm vụ bằng bằng chứng', 5, 'Không bằng chứng = chưa đạt', 'Nghiệm thu theo chuẩn điện tử', 'bang-chung', 'Nhiệm vụ đóng có bằng chứng'],
    [3, 'Chấm kết quả theo chuẩn', 3, 'Điểm phản ánh đúng thực tế', 'Chấm theo khung đo lường', 'do-luong-kh', 'Điểm có căn cứ'],
    [3, 'Ghi dữ liệu buổi coaching', 2, 'Mỗi buổi một bản ghi', 'Ghi ngay sau buổi', 'bang-viec', 'Buổi nào cũng có dữ liệu'],
    [3, 'Thu bằng chứng khách xác nhận', 2, 'Có xác nhận của gia đình', 'Lưu xác nhận vào hồ sơ', 'bang-chung', 'Có bằng chứng nhà xác nhận'],
    [3, 'Đóng việc kèm bằng chứng', 2, 'Bằng chứng ≥20 ký tự', 'Đóng trên bảng công việc', 'bang-viec', 'Việc đóng có bằng chứng'],
    [3, 'Cập nhật đèn gia đình', 2, 'Đèn phản ánh đúng sức khoẻ nhà', 'Chấm lại đèn sau buổi', 'do-luong-kh', 'Đèn được cập nhật'],
    [4, 'Chăm gia đình đèn đỏ trong ngày', 5, 'Gọi trong ngày, có giải pháp', 'Bật playbook cứu nhà', 'van-hanh-cham-soc', 'Nhà được cứu, đèn cải thiện'],
    [4, 'Chạm đúng nhịp 21/90', 3, 'Đúng bước, đúng ngày của vòng nhắc', 'Làm bước kế của vòng nhắc', 'vong-nhac', 'Bước chạm thực hiện đúng hạn'],
    [4, 'Nhắc nhiệm vụ nhà chưa làm', 2, 'Nhắc nhẹ, giữ động lực', 'Theo bảng việc của nhà', 'bang-viec', 'Nhà quay lại làm nhiệm vụ'],
    [4, 'Hỏi thăm tiến bộ, giữ lửa', 2, 'Chạm giữ đèn xanh', 'Theo nhịp chăm sóc', 'van-hanh-cham-soc', 'Nhà giữ động lực'],
    [4, 'Xin giới thiệu khi nhà hài lòng', 2, 'Khi nhà hài lòng rõ', 'Hệ một nhà giới thiệu một nhà', 'tt-cskh', 'Có lời giới thiệu mới'],
    [5, 'Cập nhật hồ sơ lộ trình nhà', 2, 'Hồ sơ phản ánh đúng chặng', 'Ghi vào bản đồ coaching', 'bando-coach', 'Hồ sơ lộ trình cập nhật'],
    [5, 'Chốt ngày vào KPI', 2, 'Chốt cuối ngày', 'Bấm chốt ngày', 'kpi-toi', 'Ngày đã chốt vào KPI tháng'],
    [5, 'Ghi sáng kiến cải tiến', 2, 'Tối thiểu 1 ý/tuần', 'Ghi ở cột sáng kiến', 'bang-viec', 'Có sáng kiến được lưu'],
    [5, 'Học 1 kịch bản / điểm chạm mới', 2, 'Mỗi ngày học thêm', 'Đọc kho điểm chạm', 'diem-cham-1000', 'Áp được vào buổi thật'],
    [5, 'Tự soi buổi khó qua Hành lang', 2, 'Buổi khó được soi lại', 'Mở Hành lang thành công', 'hanh-lang', 'Có bài học rút ra'],
    [6, 'Phối hợp bàn giao với Tư vấn', 3, 'Bàn giao sạch, không mất thông tin', 'Nhận & đối chiếu hồ sơ từ Tư vấn', 'tt-cskh', 'Hồ sơ bàn giao đủ, không hỏi lại'],
    [6, 'Đồng bộ với Mentor khi ca khó', 2, 'Ca khó chuyển đúng lúc', 'Đánh dấu ca cần Mentor', 'xu-ly-ca', 'Ca khó được phối hợp gỡ'],
    [6, 'Dự giờ chéo, học Coach khác', 2, 'Mỗi tuần dự ≥1 buổi', 'Dự giờ theo lịch', 'ban-coach', 'Có ghi nhận học hỏi'],
    [6, 'Dựng kịch bản riêng cho nhà khó', 3, 'Kịch bản bám đúng nhà', 'Soạn theo xương sống phương pháp', 'phuong-phap', 'Có kịch bản riêng cho nhà khó'],
    [6, 'Đo mức độ gắn bó của nhà', 2, 'Phát hiện nguội sớm', 'Chấm theo khung đo lường', 'do-luong-kh', 'Có điểm gắn bó cập nhật'],
    [6, 'Lập kế hoạch nâng tầng cho nhà', 2, 'Có lộ trình lên tầng rõ', 'Dựng theo năm tầng', 'coach-5-tang', 'Nhà có kế hoạch lên tầng'],
    [6, 'Chuẩn hoá điểm chạm hiệu quả', 2, 'Điểm chạm tốt được lưu lại', 'Ghi vào kho điểm chạm', 'diem-cham-1000', 'Có điểm chạm chuẩn mới'],
    [6, 'Theo dõi nhà sau khi lên tầng', 2, 'Không bỏ rơi sau khi lên tầng', 'Chạm giữ nhịp tầng mới', 'van-hanh-cham-soc', 'Nhà ổn định ở tầng mới'],
    [6, 'Báo cáo tuần cho Trưởng nhóm', 2, 'Báo đúng, có đề xuất', 'Tổng hợp & gửi tuần', 'bang-viec', 'Báo cáo tuần được gửi'],
    [6, 'Tự chấm năng lực theo 6 trụ', 2, 'Trung thực, có kế hoạch cải thiện', 'Mở màn Năng lực', 'nang-luc-ns', 'Có tự đánh giá tuần']
  ];
  function tabViec() {
    var tong = VIEC.reduce(function (s, v) { return s + v[2]; }, 0);
    var o = '<div class="ntv-note">' + ic('pulse', 'w-4 h-4') + ' <b>40 đầu việc chuẩn</b> · tổng trọng số <b>' + tong + ' điểm</b>. ' +
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

  /* ══ C · LỘ TRÌNH COACH KHÁCH — 5 giai đoạn ══ */
  var GDJ = [
    { n: 1, ten: 'Chẩn đoán & định vị', c: '#185AB4' },
    { n: 2, ten: 'Dựng lộ trình 5 tầng', c: '#2A72C6' },
    { n: 3, ten: 'Đồng hành nhiệm vụ', c: '#0B6675' },
    { n: 4, ten: 'Nghiệm thu kết quả', c: '#0B7350' },
    { n: 5, ten: 'Nâng tầng & lan toả', c: '#B4720F' }
  ];
  var KH_MAU = [
    { ten: 'Nhà Minh Khang', ma: 'GITA-3301', gdj: 3, band: 'VANG', buoi: 5, danhGia: 3.8, bangChung: 'Có', nangGoi: 'Trung bình' },
    { ten: 'Nhà Hồng Phúc', ma: 'GITA-3302', gdj: 4, band: 'XANH', buoi: 9, danhGia: 4.6, bangChung: 'Có', nangGoi: 'Cao' },
    { ten: 'Nhà Quỳnh Anh', ma: 'GITA-3303', gdj: 1, band: 'DO', buoi: 2, danhGia: 2.9, bangChung: 'Chưa', nangGoi: 'Thấp' },
    { ten: 'Nhà Đức Thịnh', ma: 'GITA-3304', gdj: 2, band: 'VANG', buoi: 4, danhGia: 3.5, bangChung: 'Chưa', nangGoi: 'Trung bình' },
    { ten: 'Nhà Bảo Ngọc', ma: 'GITA-3305', gdj: 5, band: 'XANH', buoi: 12, danhGia: 4.8, bangChung: 'Có', nangGoi: 'Cao' }
  ];
  var BANDC = { DO: '#BE0E16', VANG: '#B4720F', XANH: '#0B7350' };
  function khDs() {
    var real = (typeof G.ttKhach === 'function') ? G.ttKhach() : null;
    if (real && real.length) return real.map(function (k, i) {
      return { ten: k.ten, ma: k.ma, gdj: Math.min(5, (['moi', 'tuvan', 'baogia', 'damphan', 'chotky'].indexOf(k.gd) + 1) || 1), band: k.band, buoi: (i % 6) + 1, danhGia: null, bangChung: k.band === 'XANH' ? 'Có' : 'Chưa', nangGoi: k.gt >= 30000000 ? 'Cao' : k.gt >= 18000000 ? 'Trung bình' : 'Thấp', that: true };
    });
    return KH_MAU;
  }
  function tabKhach() {
    var ds = khDs(), that = ds[0] && ds[0].that;
    var o = '<div class="ntv-note">' + ic('map', 'w-4 h-4') + ' Mỗi gia đình đi qua <b>5 giai đoạn đồng hành</b>. Bảng theo dõi trọn hồ sơ: đang ở đâu, bước kế, tài liệu Coach, dữ liệu buổi, đánh giá, bằng chứng và tiềm năng nâng gói.' +
      (that ? ' <b style="color:#0B7350">Đang chạy trên gia đình thật.</b>' : ' <span style="color:var(--warn)">(minh hoạ)</span>') + '</div>';
    o += '<div class="ntv-gdj">';
    GDJ.forEach(function (g) {
      var so = ds.filter(function (k) { return k.gdj === g.n; }).length;
      o += '<div class="ntv-gdj-pill" style="--gc:' + g.c + '"><b>' + g.n + '. ' + h(g.ten) + '</b><span>' + so + ' nhà</span></div>';
    });
    o += '</div>';
    o += '<div class="ntv-wrap"><table class="ntv-table"><thead><tr>' +
      ['STT', 'Gia đình', 'Hồ sơ', 'Giai đoạn (1-5)', 'Đèn', 'Đang đồng hành', 'Bước tiếp theo', 'Tài liệu Coach', 'Dữ liệu buổi', 'Đánh giá', 'Bằng chứng', 'Tiềm năng nâng', 'Hồ sơ lộ trình'].map(function (c) { return '<th>' + h(c) + '</th>'; }).join('') + '</tr></thead><tbody>';
    ds.forEach(function (k, i) {
      var g = GDJ[(k.gdj || 1) - 1] || GDJ[0];
      var gke = GDJ[Math.min(4, (k.gdj || 1))] || GDJ[4];
      var dang = ['Soi nút thắt, định vị tầng', 'Dựng & trình lộ trình 5 tầng', 'Giao & đồng hành nhiệm vụ', 'Nghiệm thu bằng chứng, chấm kết quả', 'Mời nâng gói / lan toả'][(k.gdj || 1) - 1];
      var ke = ['Dựng lộ trình 5 tầng', 'Giao nhiệm vụ đầu tiên', 'Nghiệm thu chặng, giữ đèn', 'Nâng tầng kế tiếp', 'Chốt nâng gói / giới thiệu'][(k.gdj || 1) - 1];
      var tn = k.nangGoi, tnc = tn === 'Cao' ? '#0B7350' : tn === 'Trung bình' ? '#B4720F' : '#73849F';
      o += '<tr>' +
        '<td class="ntv-stt">' + (i + 1) + '</td>' +
        '<td><b>' + h(k.ten) + '</b><div class="tiny muted">' + h(k.ma) + '</div></td>' +
        '<td>' + lk('crm', 'Hồ sơ') + '</td>' +
        '<td><span class="ntv-nhom" style="--nc:' + g.c + '">' + g.n + '. ' + h(g.ten) + '</span></td>' +
        '<td><span class="ntv-band" style="--bc:' + (BANDC[k.band] || '#73849F') + '"></span></td>' +
        '<td class="tiny">' + h(dang) + '</td>' +
        '<td class="tiny"><b style="color:' + gke.c + '">→ ' + h(ke) + '</b></td>' +
        '<td>' + lk('kho-tai-lieu', 'Tài liệu') + '</td>' +
        '<td class="tiny ntv-center">' + k.buoi + ' buổi</td>' +
        '<td class="tiny ntv-center">' + (k.danhGia != null ? ('<b>' + k.danhGia.toFixed(1) + '</b>/5') : '—') + '</td>' +
        '<td class="tiny ntv-center">' + (k.bangChung === 'Có' ? '<span style="color:#0B7350;font-weight:700">✓ Có</span>' : '<span style="color:var(--warn)">Chưa</span>') + '</td>' +
        '<td><span class="ntv-nhom" style="--nc:' + tnc + '">' + h(tn) + '</span></td>' +
        '<td>' + lk('bando-coach', 'Mở lộ trình') + '</td>' +
      '</tr>';
    });
    o += '</tbody></table></div>';
    return o;
  }

  /* ══ D · LỘ TRÌNH ĐÀO TẠO NÂNG CẤP COACH ══ */
  var TRU = [
    { ic: 'seed', ten: 'Tổng quan GITA', mo: 'Sứ mệnh · năm tầng · văn hoá · cách đồng hành.', cua: 'gioi-thieu' },
    { ic: 'target', ten: 'Nghiệp vụ Coach', mo: 'Chẩn đoán · lộ trình · giao nhiệm vụ · nghiệm thu bằng chứng.', cua: 'ban-coach' },
    { ic: 'orbit', ten: 'Hệ thống quy trình', mo: 'Quy trình toàn hệ · chuẩn ngôn ngữ · hiến pháp nghề.', cua: 'quy-trinh-toan-he' },
    { ic: 'spark', ten: 'Làm việc cùng AI', mo: 'Dùng Trợ lý GITA gợi ý câu nói, tổng hợp, nhắc việc.', cua: 'tro-ly' },
    { ic: 'heart', ten: 'Chăm sóc khách hàng', mo: 'Nhịp chạm 365 · playbook · đèn gia đình.', cua: 'van-hanh-cham-soc' }
  ];
  var NS_MAU = [
    { ten: 'Hoàng Mỹ Duyên', cap: 4, hl: [100, 95, 90, 80, 90], wow: 7200 },
    { ten: 'Nguyễn Thu Trang', cap: 3, hl: [100, 90, 80, 65, 75], wow: 4100 },
    { ten: 'Đặng Hoàng Nam', cap: 2, hl: [100, 75, 55, 45, 60], wow: 2200 },
    { ten: 'Trịnh Bảo Ngân', cap: 2, hl: [90, 60, 45, 35, 50], wow: 1400 }
  ];
  function tabDaoTao() {
    var o = U.sec('NĂM TRỤ HUẤN LUYỆN', 'Mỗi trụ nối thẳng tới màn học sâu — học tới đâu, điểm lên tới đó');
    o += '<div class="ntv-grid ntv-grid-5">';
    TRU.forEach(function (t, i) {
      o += '<div class="ntv-card ntv-tru"><div class="ntv-ic ntv-ic-lg">' + ic(t.ic) + '</div><b>' + (i + 1) + '. ' + h(t.ten) + '</b><p class="tiny">' + h(t.mo) + '</p>' + lk(t.cua, 'Vào học') + '</div>';
    });
    o += '</div>';
    o += '<div class="ntv-wow">' + ic('sparkle', 'w-4 h-4') + ' <div><b>Hệ 10.000 điểm chạm WOW</b> — ngân hàng khoảnh khắc chạm cảm xúc gia đình, học & áp dần qua từng cấp. ' +
      '(Nền có 1.000 điểm chạm × 10 nhịp — mở rộng tới 10.000.) ' + lk('diem-cham-1000', 'Mở kho điểm chạm') + '</div></div>';
    o += U.sec('BẢNG TIẾN ĐỘ ĐÀO TẠO COACH', 'Cấp đang đạt · tiến độ 5 trụ · điểm chạm WOW đã tích');
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
    o += '<p class="tiny muted" style="margin-top:8px">' + ic('shield', 'w-3 h-3') + ' Danh sách minh hoạ. Khi nối hồ sơ đào tạo thật, bảng chạy trên dữ liệu thật của đội Coach.</p>';
    return o;
  }

  /* Chuẩn nghề dùng chung cho Bảng điều khiển theo vai (dk-vai.js) — chỉ đọc. */
  G.NGHE_DATA = G.NGHE_DATA || {};
  G.NGHE_DATA['nghe-coach'] = { vaiTen: 'Coach', khung: KHUNG, cap: CAP, nhom: NHOM, viec: VIEC };

  G.VIEWS['nghe-coach'] = function () {
    if (!(typeof G.can === 'function' && G.can('pro_coach')))
      return U.lockCard('Trang chuyên môn hoá nghề Coach mở cho Coach trở lên. Đăng nhập đúng vai để xem.');
    var o = U.ph({ eyebrow: 'NGHỀ COACH · CHUYÊN MÔN HOÁ SÂU', ic: 'crown', grad: 1,
      t: 'Chuẩn nghề Coach — từ khung nghề tới việc hằng ngày, lộ trình gia đình và đào tạo',
      lead: 'Bốn module: khung nghề (vai trò · quyền · hiến pháp · KPI · chứng nhận) · 40 đầu việc tính KPI/lương · lộ trình đồng hành gia đình 5 giai đoạn · lộ trình đào tạo nâng cấp. Phần nặng nối thẳng màn chuyên sâu.' });
    var tabs = [['khung', 'A · Khung nghề'], ['viec', 'B · 40 đầu việc / KPI'], ['khach', 'C · Lộ trình gia đình'], ['daotao', 'D · Lộ trình đào tạo']];
    o += tabs.map(function (t, i) { return '<input type="radio" name="ntvTab" id="ntv-' + t[0] + '" class="ntv-radio"' + (i === 0 ? ' checked' : '') + '>'; }).join('');
    o += '<div class="ntv-tabbar">' + tabs.map(function (t) { return '<label for="ntv-' + t[0] + '">' + h(t[1]) + '</label>'; }).join('') + '</div>';
    o += '<div class="ntv-panel" id="ntv-p-khung">' + tabKhung() + '</div>';
    o += '<div class="ntv-panel" id="ntv-p-viec">' + tabViec() + '</div>';
    o += '<div class="ntv-panel" id="ntv-p-khach">' + tabKhach() + '</div>';
    o += '<div class="ntv-panel" id="ntv-p-daotao">' + tabDaoTao() + '</div>';
    return o;
  };
})();
