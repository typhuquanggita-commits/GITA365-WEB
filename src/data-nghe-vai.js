/* ═══════════════════════════════════════════════════════════════
   GITA 365 — DỮ LIỆU NGHỀ THEO VAI (cho khung nghe-vai.js)

   G.NGHE_SPEC keyed theo tên view:
     nghe-qlcm     · R04 Quản lý chuyên môn   · perm pro_approve
     nghe-mentor   · R09 Mentor                · perm pro_assess
     nghe-danhgia  · R10 Chuyên gia đánh giá   · perm pro_assess
     nghe-phantich · R12 Phân tích dữ liệu      · perm nghe_chung

   Mỗi vai: khung nghề (9 thẻ) · 5 cấp chứng nhận · 30 đầu việc (tổng
   trọng số 100) · lộ trình đối tượng 5 giai đoạn · 5 trụ đào tạo.
   Cẩm nang nối màn thật vai đó mở được.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;
G.NGHE_SPEC = G.NGHE_SPEC || {};

/* ══════════ R04 · QUẢN LÝ CHUYÊN MÔN ══════════ */
G.NGHE_SPEC['nghe-qlcm'] = {
  perm: 'pro_approve', vaiTen: 'Quản lý chuyên môn', capTen: 'QLCM', capTenL: 'nghề Quản lý chuyên môn',
  eyebrow: 'NGHỀ QUẢN LÝ CHUYÊN MÔN · CHUYÊN MÔN HOÁ SÂU',
  pageT: 'Chuẩn nghề Quản lý chuyên môn — giữ chuẩn nghề toàn đội dẫn dắt',
  pageLead: 'Bốn module: khung nghề · 30 đầu việc tính KPI/lương · lộ trình giám sát chất lượng · lộ trình đào tạo. Người giữ chuẩn nghề của toàn bộ đội dẫn dắt — nghiệm thu, đo lường, gỡ ca vượt cấp, chuẩn hoá.',
  khung: [
    { ic: 'crown', ten: 'Vai trò & Sứ mệnh', mo: '<b>Quản lý chuyên môn (R04)</b> — người giữ chuẩn nghề của toàn bộ đội dẫn dắt. Không làm thay Coach/Tư vấn, mà bảo chứng chuẩn và gỡ nút khi đội tắc.', lk: ['con-nguoi', 'Con người · Ba cửa'] },
    { ic: 'lock', ten: 'Quyền hạn', mo: 'Nghiệm thu chuyên môn (<code>pro_approve</code>) · báo cáo toàn hệ (<code>pro_report</code>) · vượt quyết định chuyên môn (<code>pro_override</code>) · phân công đội (<code>pro_assign</code>) · xem toàn bộ hồ sơ nhà (<code>pro_view_all</code>).', lk: ['pham-vi', 'Phạm vi của tôi'] },
    { ic: 'target', ten: 'Nghiệp vụ cốt lõi', mo: 'Soát chuẩn đầu vào → giám sát quá trình → nghiệm thu chuyên môn bằng bằng chứng → gỡ ca vượt cấp → chuẩn hoá & nhân rộng cái tốt.', lk: ['ra-soat-kh', 'Rà soát mười hai mặt'] },
    { ic: 'shield', ten: 'Hiến pháp nghề', mo: 'Năm điều không ai được sửa · Bảy quyền của gia đình · nghiệm thu bằng bằng chứng, không bằng cảm tình. Vượt quyết định phải có lý do ghi sổ.', lk: ['bien-nien', 'Năm điều không ai được sửa'], lk2: ['phap-ly', 'Bảy quyền của nhà'] },
    { ic: 'tools', ten: 'Công cụ', mo: 'Trung tâm CSKH · Hệ đo lường khách · Rà soát 12 mặt · Hệ thống Phòng ban · Năng lực & Thăng hạng.', lk: ['do-luong-kh', 'Đo lường KH'], lk2: ['phong-ban', 'Phòng ban'] },
    { ic: 'pulse', ten: 'KPI nghề', mo: 'Tỷ lệ nghiệm thu đạt chuẩn · đèn đội xanh · số ca gỡ thành công · chuẩn nghề được nhân rộng · KPI toàn đội.', lk: ['kpi-toi', 'KPI của tôi'], lk2: ['nang-luc-ns', 'Năng lực & Thăng hạng'] },
    { ic: 'quote', ten: 'Tiêu chuẩn nhân sự', mo: 'Công tâm khi nghiệm thu · chuẩn nghề rõ ràng · phản hồi dựng người · bằng chứng mọi quyết định · không thiên vị.', lk: ['chuan-ngon-ngu', 'Chuẩn ngôn ngữ'] },
    { ic: 'spark', ten: 'Thưởng / Phạt', mo: 'THƯỞNG: đội đạt chuẩn, ca khó gỡ được, chuẩn hoá được nhân rộng, KPI đội cao. PHẠT: nghiệm thu dễ dãi để lọt lỗi, thiên vị, không bằng chứng khi vượt quyết định.', lk: ['luat-lam-viec', 'Luật làm việc'] },
    { ic: 'crown', ten: 'Chứng nhận 5 cấp', mo: 'Tập sự → QLCM → QLCM Cao cấp → Trưởng khối chuyên môn → Giám đốc chuyên môn. Lên cấp bằng kết quả đội, không bằng thâm niên.', lk: ['coach-5-tang', 'Năm tầng người đi cùng'] }
  ],
  cap: [
    { n: 1, ten: 'QLCM Tập sự', c: '#73849F', dk: 'Qua đào tạo nghiệm thu + thi chuẩn nghề', ql: 'Nghiệm thu có người kèm' },
    { n: 2, ten: 'Quản lý chuyên môn', c: '#185AB4', dk: 'Nghiệm thu chuẩn ≥30 hồ sơ · 0 lọt lỗi nặng', ql: 'Tự nghiệm thu · phân công đội nhỏ' },
    { n: 3, ten: 'QLCM Cao cấp', c: '#0B6675', dk: 'Đèn đội TB ≥80 ba tháng · gỡ ca vượt cấp', ql: 'Quyết định chuyên môn · chuẩn hoá quy trình' },
    { n: 4, ten: 'Trưởng khối chuyên môn', c: '#B4720F', dk: 'Nhiều đội đạt chuẩn · đào tạo QLCM mới', ql: 'Dẫn nhiều khối · thiết kế chuẩn nghề' },
    { n: 5, ten: 'Giám đốc chuyên môn', c: '#0B7350', dk: 'Chuẩn nghề toàn hệ · kết quả bền', ql: 'Quyền chuẩn hoá toàn hệ · thu nhập bậc cao' }
  ],
  nhom: [
    { ten: 'Chuẩn bị & soát đầu vào', c: '#185AB4' }, { ten: 'Giám sát quá trình', c: '#2A72C6' },
    { ten: 'Nghiệm thu chuyên môn', c: '#0B6675' }, { ten: 'Gỡ ca & quyết định', c: '#0B7350' },
    { ten: 'Chuẩn hoá & nhân rộng', c: '#B4720F' }, { ten: 'Đo lường & cải tiến', c: '#5140B4' }
  ],
  viec: [
    [0, 'Xem bảng đo lường đội đầu ngày', 4, 'Đọc đúng đèn đội, không sót đội đỏ', 'Mở hệ đo lường khách → theo đội', 'do-luong-kh', 'Đã nắm đèn từng đội'],
    [0, 'Soát chuẩn đầu vào hồ sơ mới', 4, 'Hồ sơ đủ trường, đúng chuẩn', 'Rà soát 12 mặt hồ sơ', 'ra-soat-kh', 'Hồ sơ đạt chuẩn mới nhận'],
    [0, 'Lập danh sách hồ sơ cần nghiệm thu', 3, 'Không sót hồ sơ tới hạn', 'Lọc theo hạn nghiệm thu', 'bang-viec', 'Danh sách rõ, có thứ tự'],
    [1, 'Giám sát buổi của Coach/Tư vấn', 3, 'Dự/soi buổi theo mẫu chuẩn', 'Theo khung giám sát', 'giam-sat', 'Có ghi nhận buổi được soi'],
    [1, 'Soi chuẩn ngôn ngữ của đội', 4, 'Không câu cấm, đúng chuẩn 6 vai', 'Đối chiếu chuẩn ngôn ngữ', 'chuan-ngon-ngu', 'Lệch chuẩn được nhắc & sửa'],
    [1, 'Theo dõi dòng chảy công việc đội', 2, 'Việc không tắc, không trễ dồn', 'Mở bảng công việc toàn đội', 'bang-viec', 'Điểm tắc được gọi tên'],
    [1, 'Đọc nhận diện lỗi ngôn từ', 3, 'Bắt lỗi trước khi tới khách', 'Bộ nhận diện ngôn từ', 'nhan-dien-loi', 'Lỗi được chặn sớm'],
    [2, 'Nghiệm thu chuyên môn bằng bằng chứng', 6, 'Không bằng chứng = chưa đạt', 'Nghiệm thu theo chuẩn', 'ra-soat-kh', 'Hồ sơ nghiệm thu có bằng chứng'],
    [2, 'Chấm chất lượng buổi/ca', 4, 'Điểm phản ánh đúng thực tế', 'Chấm theo khung đo lường', 'do-luong-kh', 'Điểm có căn cứ'],
    [2, 'Trả phản hồi dựng người', 4, 'Phản hồi cụ thể, có hướng sửa', 'Theo mẫu phản hồi', 'chuan-ngon-ngu', 'Người nhận biết phải sửa gì'],
    [2, 'Duyệt tài liệu gửi khách', 3, 'Đúng chuẩn, đúng tầng', 'Kiểm duyệt trước khi gửi', 'ra-soat-kh', 'Tài liệu đạt chuẩn mới gửi'],
    [3, 'Gỡ ca vượt cấp của đội', 6, 'Ca khó được gỡ, có hướng', 'Xử lý ca theo quy trình', 'xu-ly-ca', 'Ca được gỡ, ghi bài học'],
    [3, 'Quyết định chuyên môn có lý do', 4, 'Mọi override ghi sổ lý do', 'Ghi quyết định + căn cứ', 'quy-trinh-toan-he', 'Quyết định có lý do ghi lại'],
    [3, 'Phân công lại khi đội quá tải', 3, 'Cân tải, không ai gãy', 'Phân công theo năng lực', 'phong-ban', 'Tải được cân, có thông báo'],
    [3, 'Hỗ trợ cứu đội có đèn đỏ', 4, 'Vào cuộc trong ngày', 'Bật playbook cứu đội', 'van-hanh-cham-soc', 'Đèn đội cải thiện'],
    [4, 'Chuẩn hoá cái tốt thành quy trình', 5, 'Cái hay được viết thành chuẩn', 'Ghi vào quy trình toàn hệ', 'quy-trinh-toan-he', 'Có quy trình mới được duyệt'],
    [4, 'Nhân rộng chuẩn cho đội khác', 4, 'Đội khác áp được chuẩn mới', 'Hướng dẫn & theo dõi áp dụng', 'con-nguoi', 'Đội khác áp dụng được'],
    [4, 'Cập nhật cẩm nang nghề', 3, 'Cẩm nang theo kịp thực tế', 'Bổ sung vào kho tài liệu', 'kho-tai-lieu', 'Cẩm nang được cập nhật'],
    [4, 'Vinh danh đội/cá nhân đạt chuẩn', 2, 'Ghi nhận đúng người đúng việc', 'Đề xuất ở màn Năng lực', 'nang-luc-ns', 'Có đề xuất vinh danh'],
    [5, 'Cập nhật đánh giá năng lực đội', 4, 'Điểm phản ánh đúng thực tế', 'Chấm ở màn Năng lực', 'nang-luc-ns', 'Điểm đội được cập nhật'],
    [5, 'Đo lường kết quả toàn đội', 4, 'Số liệu khớp thực tế', 'Mở hệ đo lường', 'do-luong-kh', 'Báo cáo đội chính xác'],
    [5, 'Báo cáo chuyên môn lên điều hành', 3, 'Báo cáo đúng, có đề xuất', 'Tổng hợp & gửi điều hành', 'dieu-hanh', 'Báo cáo được ghi nhận'],
    [5, 'Chốt ngày vào KPI', 2, 'Chốt cuối ngày', 'Bấm chốt ngày', 'kpi-toi', 'Ngày đã chốt vào KPI'],
    [5, 'Ghi sáng kiến cải tiến nghề', 2, 'Tối thiểu 1 ý/tuần', 'Ghi ở cột sáng kiến', 'bang-viec', 'Có sáng kiến được lưu'],
    [5, 'Tự soi quyết định khó qua Hành lang', 2, 'Quyết định khó được soi lại', 'Mở Hành lang thành công', 'hanh-lang', 'Có bài học rút ra'],
    [0, 'Chuẩn bị tiêu chí nghiệm thu hôm nay', 3, 'Tiêu chí rõ trước khi chấm', 'Dựng checklist nghiệm thu', 'ra-soat-kh', 'Có tiêu chí trước khi nghiệm thu'],
    [1, 'Nhắc đội việc tới hạn', 2, 'Không để việc trễ âm thầm', 'Nhắc qua bảng việc', 'bang-viec', 'Đội nhận nhắc đúng hạn'],
    [2, 'Soát bằng chứng khách xác nhận', 3, 'Có xác nhận hai bên', 'Kiểm bằng chứng điện tử', 'ra-soat-kh', 'Bằng chứng hợp lệ'],
    [3, 'Họp gỡ vướng với đội', 2, 'Vướng được nói ra & có hướng', 'Họp ngắn theo điểm tắc', 'con-nguoi', 'Vướng có hướng xử lý'],
    [4, 'Học 1 mô thức/phương pháp mới', 2, 'Mỗi tuần nâng chuẩn bản thân', 'Đọc xương sống phương pháp', 'phuong-phap', 'Áp được vào nghiệm thu']
  ],
  cTab: 'C · Lộ trình giám sát', cObj: 'Hồ sơ / đội', cDv: 'hồ sơ', cDang: 'Đang giám sát', cTL: 'Tài liệu chuẩn', cTLkey: 'quy-trinh-toan-he', cLoTrinh: 'ra-soat-kh',
  cNote: 'Mỗi hồ sơ đi qua <b>5 giai đoạn nghiệm thu chất lượng</b>. Bảng theo dõi: đang ở đâu, bước kế, tài liệu chuẩn, dữ liệu, đánh giá, bằng chứng và tiềm năng nâng.',
  gdj: [
    { n: 1, ten: 'Soát chuẩn đầu vào', c: '#185AB4' }, { n: 2, ten: 'Giám sát quá trình', c: '#2A72C6' },
    { n: 3, ten: 'Nghiệm thu chuyên môn', c: '#0B6675' }, { n: 4, ten: 'Gỡ ca vượt cấp', c: '#0B7350' },
    { n: 5, ten: 'Chuẩn hoá & nhân rộng', c: '#B4720F' }
  ],
  dang: ['Soát hồ sơ đạt chuẩn đầu vào', 'Giám sát buổi & dòng việc', 'Nghiệm thu bằng bằng chứng', 'Gỡ nút vượt cấp của đội', 'Viết chuẩn & nhân rộng'],
  ke: ['Chuyển sang giám sát quá trình', 'Nghiệm thu chặng tới', 'Trả phản hồi, đóng hồ sơ', 'Chuẩn hoá cách gỡ', 'Theo dõi đội áp dụng'],
  tru: [
    { ic: 'seed', ten: 'Tổng quan GITA', mo: 'Sứ mệnh · năm tầng · văn hoá · chuẩn nghề toàn hệ.', cua: 'gioi-thieu' },
    { ic: 'target', ten: 'Nghiệp vụ QLCM', mo: 'Nghiệm thu · giám sát · gỡ ca · chuẩn hoá.', cua: 'ra-soat-kh' },
    { ic: 'orbit', ten: 'Hệ thống quy trình', mo: 'Quy trình toàn hệ · chuẩn ngôn ngữ · hiến pháp.', cua: 'quy-trinh-toan-he' },
    { ic: 'spark', ten: 'Làm việc cùng AI', mo: 'Dùng Trợ lý GITA tổng hợp, soi lỗi, nhắc việc.', cua: 'tro-ly' },
    { ic: 'heart', ten: 'Chăm sóc khách hàng', mo: 'Nhịp chạm 365 · playbook · đèn đội & khách.', cua: 'van-hanh-cham-soc' }
  ],
  nsMau: [
    { ten: 'Lê Quốc Duy', cap: 3, hl: [100, 95, 90, 80, 85], wow: 5200 },
    { ten: 'Phạm Thu Hằng', cap: 2, hl: [100, 80, 65, 55, 70], wow: 2600 },
    { ten: 'Vũ Đình Khôi', cap: 4, hl: [100, 100, 95, 90, 92], wow: 7800 }
  ]
};

/* ══════════ R09 · MENTOR ══════════ */
G.NGHE_SPEC['nghe-mentor'] = {
  perm: 'pro_assess', vaiTen: 'Mentor', capTen: 'MENTOR', capTenL: 'nghề Mentor',
  eyebrow: 'NGHỀ MENTOR · CHUYÊN MÔN HOÁ SÂU',
  pageT: 'Chuẩn nghề Mentor — người chạy việc băng nền, gỡ nút cho cả đội',
  pageLead: 'Bốn module: khung nghề · 30 đầu việc tính KPI/lương · lộ trình gỡ ca · lộ trình đào tạo. Mentor chạy tám việc băng nền dưới cả năm khoang và gỡ những nút thắt người khác chưa gỡ nổi.',
  khung: [
    { ic: 'crown', ten: 'Vai trò & Sứ mệnh', mo: '<b>Mentor (R09)</b> — người chạy tám việc băng nền dưới cả năm khoang. Đứng sau đội, gỡ nút, giữ cho hệ chạy mượt.', lk: ['gioi-thieu', 'GITA 365 là gì'] },
    { ic: 'lock', ten: 'Quyền hạn', mo: 'Chấm đánh giá (<code>pro_assess</code>) · mở & xử lý ca (<code>ca_xu_ly</code>) · công cụ tư vấn (<code>pro_consult</code>) · kho nghề (<code>nghe_chung</code>). KHÔNG động tiền/duyệt chi.', lk: ['pham-vi', 'Phạm vi của tôi'] },
    { ic: 'target', ten: 'Nghiệp vụ cốt lõi', mo: 'Nhận ca khó → chẩn đoán nút thắt → gỡ nút cùng Coach/Tư vấn → chạy việc băng nền → chuẩn hoá cách gỡ cho lần sau.', lk: ['xu-ly-ca', 'Xử lý ca theo quy trình'] },
    { ic: 'shield', ten: 'Hiến pháp nghề', mo: 'Năm điều không ai được sửa · Bảy quyền của gia đình · gỡ nút chứ không giành việc của Coach. Luôn trả lại đội vị trí dẫn.', lk: ['bien-nien', 'Năm điều không ai được sửa'], lk2: ['phap-ly', 'Bảy quyền của nhà'] },
    { ic: 'tools', ten: 'Công cụ', mo: 'Xử lý ca · Hệ đo lường khách · Rà soát 12 mặt · Chiều sâu năm lớp · Ma trận 220 vấn đề.', lk: ['do-luong-kh', 'Đo lường KH'], lk2: ['chieu-sau', 'Chiều sâu năm lớp'] },
    { ic: 'pulse', ten: 'KPI nghề', mo: 'Số ca gỡ thành công · thời gian gỡ · việc băng nền chạy đều · đội được nâng sau khi mentor · bài học chuẩn hoá.', lk: ['kpi-toi', 'KPI của tôi'], lk2: ['ra-soat-kh', 'Rà soát KH'] },
    { ic: 'quote', ten: 'Tiêu chuẩn nhân sự', mo: 'Bình tĩnh trước ca khó · gỡ tận gốc không chữa ngọn · không giành vai · bằng chứng mọi ca · truyền lại cách làm.', lk: ['chuan-ngon-ngu', 'Chuẩn ngôn ngữ'] },
    { ic: 'spark', ten: 'Thưởng / Phạt', mo: 'THƯỞNG: ca khó gỡ được, đội nâng rõ, việc nền chạy đều, cách gỡ được nhân rộng. PHẠT: để ca kéo dài, giành việc đội, gỡ ngọn không gỡ gốc.', lk: ['luat-lam-viec', 'Luật làm việc'] },
    { ic: 'crown', ten: 'Chứng nhận 5 cấp', mo: 'Tập sự → Mentor → Senior Mentor → Mentor dẫn dắt → Chuyên gia gỡ nút. Lên cấp bằng ca gỡ được, không bằng thâm niên.', lk: ['coach-5-tang', 'Năm tầng người đi cùng'] }
  ],
  cap: [
    { n: 1, ten: 'Mentor Tập sự', c: '#73849F', dk: 'Qua đào tạo nền + thi chẩn đoán', ql: 'Nhận ca có người kèm' },
    { n: 2, ten: 'Mentor', c: '#185AB4', dk: '≥15 ca gỡ có bằng chứng', ql: 'Tự nhận ca · chạy việc nền' },
    { n: 3, ten: 'Senior Mentor', c: '#0B6675', dk: 'Gỡ ca vượt cấp · thời gian gỡ ngắn dần', ql: 'Gỡ ca khó nhất · kèm Mentor mới' },
    { n: 4, ten: 'Mentor dẫn dắt', c: '#B4720F', dk: 'Nhiều đội nâng rõ · đào tạo Mentor', ql: 'Dẫn tổ gỡ nút · thiết kế playbook' },
    { n: 5, ten: 'Chuyên gia gỡ nút', c: '#0B7350', dk: 'Chuẩn hoá cách gỡ toàn hệ', ql: 'Quyền thiết kế quy trình gỡ · bậc cao' }
  ],
  nhom: [
    { ten: 'Chuẩn bị & nhận ca', c: '#185AB4' }, { ten: 'Chẩn đoán nút thắt', c: '#2A72C6' },
    { ten: 'Gỡ nút cùng đội', c: '#0B6675' }, { ten: 'Việc băng nền', c: '#0B7350' },
    { ten: 'Chuẩn hoá & truyền lại', c: '#B4720F' }, { ten: 'Đo lường & cải tiến', c: '#5140B4' }
  ],
  viec: [
    [0, 'Nhận danh sách ca cần gỡ hôm nay', 4, 'Không sót ca khẩn', 'Mở xử lý ca → tab hôm nay', 'xu-ly-ca', 'Đã nắm ca khẩn'],
    [0, 'Xếp ưu tiên ca theo mức khó/khẩn', 4, 'Ca khẩn & khó lên đầu', 'Xếp theo mức độ', 'do-luong-kh', 'Danh sách đã xếp'],
    [0, 'Chuẩn bị công cụ chẩn đoán', 3, 'Có công cụ trước khi vào ca', 'Chọn khung chẩn đoán', 'chieu-sau', 'Sẵn công cụ'],
    [1, 'Chẩn đoán nút thắt gốc của ca', 6, 'Gọi đúng gốc, không dừng ở ngọn', 'Soi theo chiều sâu 5 lớp', 'chieu-sau', 'Nút gốc được gọi tên'],
    [1, 'Đối chiếu ma trận vấn đề', 4, 'Xác định dạng ca theo ma trận', 'Tra ma trận 220 vấn đề', 'ma-tran', 'Dạng ca xác định'],
    [1, 'Nghe đội trình bày, không phán xét', 3, 'Để đội nói hết bối cảnh', 'Theo chuẩn ngôn ngữ', 'chuan-ngon-ngu', 'Đội thấy được lắng nghe'],
    [1, 'Ghi hồ sơ ca', 2, 'Đủ bối cảnh, giả thuyết', 'Ghi vào hồ sơ ca', 'bang-viec', 'Hồ sơ ca đầy đủ'],
    [2, 'Dựng hướng gỡ cùng Coach/Tư vấn', 6, 'Hướng rõ, đội làm được', 'Dựng theo xương sống phương pháp', 'phuong-phap', 'Có hướng gỡ đồng thuận'],
    [2, 'Trao lại vai dẫn cho đội', 5, 'Đội tự chạy, mentor đứng sau', 'Giao việc rõ cho đội', 'xu-ly-ca', 'Đội cầm lại vai dẫn'],
    [2, 'Theo sát bước gỡ đầu tiên', 2, 'Bước đầu đi đúng', 'Theo dõi sát bước 1', 'do-luong-kh', 'Bước 1 đi đúng'],
    [2, 'Điểm chạm trấn an đội & nhà', 3, 'Giữ bình tĩnh cho cả hai', 'Chọn điểm chạm phù hợp', 'diem-cham-1000', 'Đội & nhà yên tâm hơn'],
    [3, 'Chạy việc băng nền được giao', 6, 'Việc nền chạy đều, không tắc', 'Theo bảng việc băng nền', 'bang-viec', 'Việc nền chạy đúng hạn'],
    [3, 'Bù chỗ trống khi đội thiếu người', 4, 'Không để khoang nào hở', 'Nhận việc tạm theo điều phối', 'xu-ly-ca', 'Khoang được bù kịp'],
    [3, 'Rà soát 12 mặt hồ sơ khó', 3, 'Không sót mặt nào', 'Rà soát 12 mặt', 'ra-soat-kh', 'Đủ 12 mặt được soi'],
    [3, 'Cập nhật đèn ca sau mỗi can thiệp', 2, 'Đèn phản ánh đúng', 'Chấm lại đèn', 'do-luong-kh', 'Đèn ca cập nhật'],
    [4, 'Chuẩn hoá cách gỡ thành playbook', 5, 'Ca lặp có cách gỡ sẵn', 'Ghi playbook vào kho', 'kho-tai-lieu', 'Có playbook mới'],
    [4, 'Truyền lại cách gỡ cho Coach', 4, 'Coach tự gỡ được lần sau', 'Kèm cặp sau ca', 'chuan-ngon-ngu', 'Coach áp được'],
    [4, 'Ghi bài học từ ca khó', 3, 'Mỗi ca khó một bài học', 'Ghi ở Hành lang', 'hanh-lang', 'Có bài học ghi lại'],
    [4, 'Cập nhật ma trận vấn đề', 2, 'Dạng ca mới được bổ sung', 'Bổ sung vào ma trận', 'ma-tran', 'Ma trận cập nhật'],
    [5, 'Chấm đánh giá sau ca', 4, 'Điểm phản ánh đúng kết quả', 'Chấm theo khung', 'do-luong-kh', 'Điểm có căn cứ'],
    [5, 'Đóng ca kèm bằng chứng', 4, 'Không bằng chứng = chưa xong', 'Đóng ca trên bảng việc', 'bang-viec', 'Ca đóng có bằng chứng'],
    [5, 'Báo cáo ca lên QLCM', 3, 'Báo đúng, có đề xuất', 'Tổng hợp & gửi', 'ra-soat-kh', 'Báo cáo được ghi nhận'],
    [5, 'Chốt ngày vào KPI', 2, 'Chốt cuối ngày', 'Bấm chốt ngày', 'kpi-toi', 'Ngày đã chốt'],
    [5, 'Ghi sáng kiến cải tiến', 2, 'Tối thiểu 1 ý/tuần', 'Ghi ở cột sáng kiến', 'bang-viec', 'Có sáng kiến'],
    [0, 'Đọc lại ca còn mở từ hôm qua', 3, 'Ca treo được theo tiếp', 'Xem ca đang mở', 'xu-ly-ca', 'Ca treo được xử lý'],
    [1, 'Xác định ca cần người khác cùng gỡ', 2, 'Biết khi nào cần phối hợp', 'Đánh dấu ca phối hợp', 'xu-ly-ca', 'Ca phối hợp được gọi tên'],
    [2, 'Thử nghiệm hướng gỡ nhỏ trước', 3, 'Thử nhỏ trước khi áp rộng', 'Chạy thử bước nhỏ', 'phuong-phap', 'Thử nghiệm có kết quả'],
    [3, 'Giữ nhịp việc nền cuối tuần', 2, 'Không để tồn đọng cuối tuần', 'Dọn việc nền cuối tuần', 'bang-viec', 'Việc nền sạch cuối tuần'],
    [4, 'Học 1 dạng ca khó mới', 2, 'Mỗi tuần nâng năng lực gỡ', 'Đọc ma trận & chiều sâu', 'chieu-sau', 'Nắm thêm dạng ca'],
    [5, 'Tự soi ca gỡ chưa gọn', 2, 'Ca chưa gọn được soi lại', 'Mở Hành lang', 'hanh-lang', 'Có điểm cần cải tiến']
  ],
  cTab: 'C · Lộ trình gỡ ca', cObj: 'Gia đình / ca', cDv: 'ca', cDang: 'Đang gỡ', cTL: 'Tài liệu gỡ', cTLkey: 'phuong-phap', cLoTrinh: 'xu-ly-ca',
  cNote: 'Mỗi ca đi qua <b>5 giai đoạn gỡ nút</b>. Bảng theo dõi: đang ở đâu, bước kế, tài liệu gỡ, dữ liệu, đánh giá, bằng chứng và tiềm năng nâng đội.',
  gdj: [
    { n: 1, ten: 'Nhận & chẩn đoán', c: '#185AB4' }, { n: 2, ten: 'Dựng hướng gỡ', c: '#2A72C6' },
    { n: 3, ten: 'Gỡ cùng đội', c: '#0B6675' }, { n: 4, ten: 'Nghiệm thu ca', c: '#0B7350' },
    { n: 5, ten: 'Chuẩn hoá & truyền lại', c: '#B4720F' }
  ],
  dang: ['Soi nút thắt gốc của ca', 'Dựng hướng gỡ với đội', 'Theo sát đội gỡ nút', 'Nghiệm thu kết quả ca', 'Viết playbook, truyền lại'],
  ke: ['Dựng hướng gỡ', 'Trao vai, theo bước 1', 'Nghiệm thu ca', 'Chuẩn hoá cách gỡ', 'Theo dõi Coach áp dụng'],
  tru: [
    { ic: 'seed', ten: 'Tổng quan GITA', mo: 'Sứ mệnh · năm tầng · văn hoá · cách đồng hành.', cua: 'gioi-thieu' },
    { ic: 'target', ten: 'Nghiệp vụ Mentor', mo: 'Chẩn đoán · gỡ nút · việc băng nền · chuẩn hoá.', cua: 'xu-ly-ca' },
    { ic: 'orbit', ten: 'Hệ thống quy trình', mo: 'Quy trình toàn hệ · chuẩn ngôn ngữ · hiến pháp.', cua: 'quy-trinh-toan-he' },
    { ic: 'spark', ten: 'Làm việc cùng AI', mo: 'Dùng Trợ lý GITA chẩn đoán, tổng hợp, nhắc việc.', cua: 'tro-ly' },
    { ic: 'heart', ten: 'Chăm sóc khách hàng', mo: 'Nhịp chạm 365 · playbook · đèn gia đình.', cua: 'van-hanh-cham-soc' }
  ],
  nsMau: [
    { ten: 'Lâm Tuyết Mai', cap: 3, hl: [100, 90, 85, 70, 80], wow: 4800 },
    { ten: 'Hồ Nhật Quang', cap: 2, hl: [100, 75, 60, 50, 65], wow: 2400 },
    { ten: 'Đinh Thu Hương', cap: 4, hl: [100, 100, 90, 85, 88], wow: 7100 }
  ]
};

/* ══════════ R10 · CHUYÊN GIA ĐÁNH GIÁ ══════════ */
G.NGHE_SPEC['nghe-danhgia'] = {
  perm: 'pro_assess', vaiTen: 'Chuyên gia đánh giá', capTen: 'ĐÁNH GIÁ', capTenL: 'nghề Chuyên gia đánh giá',
  eyebrow: 'NGHỀ CHUYÊN GIA ĐÁNH GIÁ · CHUYÊN MÔN HOÁ SÂU',
  pageT: 'Chuẩn nghề Chuyên gia đánh giá — trả lại sự thật bằng dữ liệu',
  pageLead: 'Bốn module: khung nghề · 30 đầu việc tính KPI/lương · lộ trình đánh giá · lộ trình đào tạo. Người trả lại sự thật bằng dữ liệu, không bằng cảm giác — chẩn đoán đúng, chấm công tâm, có bằng chứng.',
  khung: [
    { ic: 'crown', ten: 'Vai trò & Sứ mệnh', mo: '<b>Chuyên gia đánh giá (R10)</b> — người trả lại sự thật bằng dữ liệu, không bằng cảm giác. Chẩn đoán đúng để cả hệ sửa đúng chỗ.', lk: ['assessment', 'Assessment Tầng 1'] },
    { ic: 'lock', ten: 'Quyền hạn', mo: 'Chấm đánh giá (<code>pro_assess</code>) · công cụ tư vấn (<code>pro_consult</code>) · mở & xử lý ca (<code>ca_xu_ly</code>) · kho nghề (<code>nghe_chung</code>). KHÔNG động tiền.', lk: ['pham-vi', 'Phạm vi của tôi'] },
    { ic: 'target', ten: 'Nghiệp vụ cốt lõi', mo: 'Tiếp nhận yêu cầu → thu thập dữ liệu → chấm & đối chiếu chuẩn → trả kết quả có bằng chứng → theo dõi sau đánh giá.', lk: ['do-luong-kh', 'Hệ đo lường khách'] },
    { ic: 'shield', ten: 'Hiến pháp nghề', mo: 'Năm điều không ai được sửa · Bảy quyền của gia đình · chấm bằng dữ liệu, công tâm, không thiên vị. Kết quả phải có bằng chứng.', lk: ['bien-nien', 'Năm điều không ai được sửa'], lk2: ['phap-ly', 'Bảy quyền của nhà'] },
    { ic: 'tools', ten: 'Công cụ', mo: 'Assessment Tầng 1 · Hệ đo lường khách · Rà soát 12 mặt · Chiều sâu năm lớp · Sát hạch năng lực.', lk: ['assessment', 'Assessment'], lk2: ['ra-soat-kh', 'Rà soát 12 mặt'] },
    { ic: 'pulse', ten: 'KPI nghề', mo: 'Độ chính xác chẩn đoán · tỷ lệ kết quả có bằng chứng · thời gian trả kết quả · độ nhất quán giữa các lần chấm.', lk: ['kpi-toi', 'KPI của tôi'], lk2: ['do-luong-kh', 'Đo lường KH'] },
    { ic: 'quote', ten: 'Tiêu chuẩn nhân sự', mo: 'Công tâm tuyệt đối · chấm theo chuẩn không theo cảm tình · bằng chứng mọi kết luận · nhất quán · trả sự thật dù khó nghe.', lk: ['chuan-ngon-ngu', 'Chuẩn ngôn ngữ'] },
    { ic: 'spark', ten: 'Thưởng / Phạt', mo: 'THƯỞNG: chẩn đoán chính xác, kết quả có bằng chứng, trả đúng hạn, nhất quán. PHẠT: chấm thiên vị, kết luận không bằng chứng, chẩn đoán sai gây sửa sai chỗ.', lk: ['luat-lam-viec', 'Luật làm việc'] },
    { ic: 'crown', ten: 'Chứng nhận 5 cấp', mo: 'Tập sự → Assessor → Senior Assessor → Trưởng nhóm đánh giá → Chuyên gia chuẩn đo. Lên cấp bằng độ chính xác, không bằng thâm niên.', lk: ['coach-5-tang', 'Năm tầng người đi cùng'] }
  ],
  cap: [
    { n: 1, ten: 'Assessor Tập sự', c: '#73849F', dk: 'Qua đào tạo chuẩn đo + thi chẩn đoán', ql: 'Chấm có người đối chiếu' },
    { n: 2, ten: 'Chuyên gia đánh giá', c: '#185AB4', dk: '≥30 ca chấm nhất quán · 0 kết luận thiếu bằng chứng', ql: 'Tự chấm · trả kết quả' },
    { n: 3, ten: 'Senior Assessor', c: '#0B6675', dk: 'Độ chính xác cao · chấm ca khó', ql: 'Chuẩn hoá bộ tiêu chí · kèm Assessor mới' },
    { n: 4, ten: 'Trưởng nhóm đánh giá', c: '#B4720F', dk: 'Nhất quán toàn nhóm · đào tạo Assessor', ql: 'Dẫn nhóm · thiết kế bộ đo' },
    { n: 5, ten: 'Chuyên gia chuẩn đo', c: '#0B7350', dk: 'Chuẩn đo lường toàn hệ', ql: 'Quyền thiết kế chuẩn đo · bậc cao' }
  ],
  nhom: [
    { ten: 'Chuẩn bị & tiếp nhận', c: '#185AB4' }, { ten: 'Thu thập dữ liệu', c: '#2A72C6' },
    { ten: 'Chấm & đối chiếu', c: '#0B6675' }, { ten: 'Trả kết quả', c: '#0B7350' },
    { ten: 'Theo dõi sau đánh giá', c: '#B4720F' }, { ten: 'Chuẩn hoá & cải tiến', c: '#5140B4' }
  ],
  viec: [
    [0, 'Nhận danh sách yêu cầu đánh giá', 4, 'Không sót yêu cầu tới hạn', 'Mở hệ đo lường → hàng chờ', 'do-luong-kh', 'Đã nắm hàng chờ'],
    [0, 'Chuẩn bị bộ tiêu chí chấm', 4, 'Tiêu chí rõ trước khi chấm', 'Dựng checklist chuẩn', 'ra-soat-kh', 'Có tiêu chí sẵn'],
    [0, 'Xếp ưu tiên ca đánh giá', 3, 'Ca khẩn/khó lên đầu', 'Xếp theo mức độ', 'do-luong-kh', 'Danh sách đã xếp'],
    [1, 'Thu thập dữ liệu đầy đủ của ca', 4, 'Đủ dữ liệu, không suy đoán', 'Mở hồ sơ, gom dữ liệu', 'crm', 'Dữ liệu đủ để chấm'],
    [1, 'Rà soát 12 mặt của hồ sơ', 4, 'Không sót mặt nào', 'Rà soát 12 mặt', 'ra-soat-kh', 'Đủ 12 mặt'],
    [1, 'Chạy Assessment Tầng 1', 4, 'Chẩn đoán đúng quy trình', 'Mở Assessment', 'assessment', 'Có kết quả chẩn đoán'],
    [1, 'Soi chiều sâu năm lớp', 3, 'Nhìn đủ 5 lớp, không dừng ở bề mặt', 'Mở chiều sâu 5 lớp', 'chieu-sau', 'Đủ 5 lớp được soi'],
    [2, 'Chấm theo chuẩn, công tâm', 6, 'Chấm theo tiêu chí, không cảm tính', 'Chấm theo bộ tiêu chí', 'do-luong-kh', 'Điểm theo tiêu chí'],
    [2, 'Đối chiếu với lần chấm trước', 4, 'Nhất quán, lệch phải có lý do', 'So với lịch sử chấm', 'do-luong-kh', 'Nhất quán hoặc có lý do'],
    [2, 'Thu thập bằng chứng cho kết luận', 4, 'Mỗi kết luận một bằng chứng', 'Gắn bằng chứng vào ca', 'ra-soat-kh', 'Kết luận có bằng chứng'],
    [2, 'Phân hạng kết quả', 3, 'Hạng phản ánh đúng thực tế', 'Xếp hạng theo chuẩn', 'do-luong-kh', 'Hạng có căn cứ'],
    [3, 'Viết kết quả rõ ràng, trả sự thật', 6, 'Rõ, trung thực dù khó nghe', 'Theo mẫu trả kết quả', 'chuan-ngon-ngu', 'Kết quả rõ & trung thực'],
    [3, 'Giải thích kết quả cho đội/nhà', 4, 'Người nhận hiểu & chấp nhận', 'Giải thích theo chuẩn ngôn ngữ', 'chuan-ngon-ngu', 'Người nhận hiểu kết quả'],
    [3, 'Đề xuất hướng cải thiện', 3, 'Có hướng đi kèm kết quả', 'Gợi ý theo phương pháp', 'phuong-phap', 'Có đề xuất cải thiện'],
    [3, 'Đóng ca đánh giá kèm bằng chứng', 3, 'Không bằng chứng = chưa xong', 'Đóng trên bảng việc', 'bang-viec', 'Ca đóng có bằng chứng'],
    [4, 'Theo dõi sau đánh giá', 3, 'Kiểm nhà/đội có cải thiện', 'Theo dõi theo lịch', 'do-luong-kh', 'Có ghi nhận sau đánh giá'],
    [4, 'Chấm lại khi có thay đổi lớn', 4, 'Đánh giá cập nhật kịp', 'Chấm lại theo chuẩn', 'assessment', 'Kết quả cập nhật'],
    [4, 'Cảnh báo sớm khi phát hiện rủi ro', 3, 'Rủi ro được báo sớm', 'Gửi cảnh báo', 'giam-sat', 'Cảnh báo được gửi'],
    [4, 'Cập nhật đèn sau đánh giá', 2, 'Đèn phản ánh đúng', 'Chấm lại đèn', 'do-luong-kh', 'Đèn cập nhật'],
    [5, 'Chuẩn hoá bộ tiêu chí', 3, 'Tiêu chí tốt được giữ lại', 'Ghi vào chuẩn đo', 'ra-soat-kh', 'Bộ tiêu chí cập nhật'],
    [5, 'Hiệu chỉnh độ lệch giữa người chấm', 4, 'Cả nhóm chấm nhất quán', 'Đối chiếu & hiệu chỉnh', 'do-luong-kh', 'Độ lệch giảm'],
    [5, 'Báo cáo đánh giá lên QLCM', 3, 'Báo đúng, có đề xuất', 'Tổng hợp & gửi', 'ra-soat-kh', 'Báo cáo ghi nhận'],
    [5, 'Chốt ngày vào KPI', 2, 'Chốt cuối ngày', 'Bấm chốt ngày', 'kpi-toi', 'Ngày đã chốt'],
    [5, 'Ghi sáng kiến cải tiến bộ đo', 2, 'Tối thiểu 1 ý/tuần', 'Ghi ở cột sáng kiến', 'bang-viec', 'Có sáng kiến'],
    [0, 'Đọc lại ca đánh giá còn treo', 3, 'Ca treo được theo tiếp', 'Xem hàng chờ', 'do-luong-kh', 'Ca treo được xử lý'],
    [1, 'Xác minh nguồn dữ liệu', 2, 'Dữ liệu đáng tin mới dùng', 'Kiểm nguồn trước khi chấm', 'crm', 'Nguồn được xác minh'],
    [2, 'Ghi dữ liệu buổi đánh giá', 3, 'Mỗi ca một bản ghi', 'Ghi ngay sau chấm', 'bang-viec', 'Buổi nào cũng có dữ liệu'],
    [3, 'Lưu bằng chứng khách xác nhận', 2, 'Có xác nhận hai bên', 'Lưu vào hồ sơ', 'ra-soat-kh', 'Bằng chứng hợp lệ'],
    [4, 'Tổng hợp mô thức rủi ro lặp', 3, 'Rủi ro lặp được gọi tên', 'Đối chiếu ma trận', 'ma-tran', 'Mô thức được ghi nhận'],
    [5, 'Học 1 chuẩn đo/phương pháp mới', 2, 'Mỗi tuần nâng chuẩn', 'Đọc phương pháp', 'phuong-phap', 'Nắm thêm chuẩn đo']
  ],
  cTab: 'C · Lộ trình đánh giá', cObj: 'Gia đình / ca', cDv: 'ca', cDang: 'Đang đánh giá', cTL: 'Tài liệu chuẩn đo', cTLkey: 'ra-soat-kh', cLoTrinh: 'assessment',
  cNote: 'Mỗi ca đi qua <b>5 giai đoạn đánh giá</b>. Bảng theo dõi: đang ở đâu, bước kế, tài liệu chuẩn đo, dữ liệu, kết quả, bằng chứng và tiềm năng nâng.',
  gdj: [
    { n: 1, ten: 'Tiếp nhận yêu cầu', c: '#185AB4' }, { n: 2, ten: 'Thu thập dữ liệu', c: '#2A72C6' },
    { n: 3, ten: 'Chấm & đối chiếu', c: '#0B6675' }, { n: 4, ten: 'Trả kết quả', c: '#0B7350' },
    { n: 5, ten: 'Theo dõi sau đánh giá', c: '#B4720F' }
  ],
  dang: ['Tiếp nhận & chuẩn bị tiêu chí', 'Gom & xác minh dữ liệu', 'Chấm theo chuẩn, đối chiếu', 'Viết & trả kết quả', 'Theo dõi cải thiện'],
  ke: ['Thu thập dữ liệu', 'Chấm & đối chiếu', 'Trả kết quả có bằng chứng', 'Theo dõi sau đánh giá', 'Chấm lại khi có thay đổi'],
  tru: [
    { ic: 'seed', ten: 'Tổng quan GITA', mo: 'Sứ mệnh · năm tầng · văn hoá · chuẩn đo toàn hệ.', cua: 'gioi-thieu' },
    { ic: 'target', ten: 'Nghiệp vụ đánh giá', mo: 'Chẩn đoán · chấm chuẩn · bằng chứng · trả sự thật.', cua: 'assessment' },
    { ic: 'orbit', ten: 'Hệ thống quy trình', mo: 'Quy trình toàn hệ · chuẩn ngôn ngữ · hiến pháp.', cua: 'quy-trinh-toan-he' },
    { ic: 'spark', ten: 'Làm việc cùng AI', mo: 'Dùng Trợ lý GITA đối chiếu, tổng hợp, soi lệch.', cua: 'tro-ly' },
    { ic: 'heart', ten: 'Chăm sóc khách hàng', mo: 'Nhịp chạm 365 · playbook · đèn gia đình.', cua: 'van-hanh-cham-soc' }
  ],
  nsMau: [
    { ten: 'Hồ Bảo Khanh', cap: 3, hl: [100, 90, 85, 75, 80], wow: 4600 },
    { ten: 'Ngô Thanh Vân', cap: 2, hl: [100, 80, 65, 55, 60], wow: 2300 },
    { ten: 'Lý Hải Yến', cap: 4, hl: [100, 100, 92, 88, 90], wow: 7400 }
  ]
};

/* ══════════ R12 · PHÂN TÍCH DỮ LIỆU ══════════ */
G.NGHE_SPEC['nghe-phantich'] = {
  perm: 'nghe_chung', vaiTen: 'Phân tích dữ liệu', capTen: 'PHÂN TÍCH', capTenL: 'nghề Phân tích dữ liệu',
  eyebrow: 'NGHỀ PHÂN TÍCH DỮ LIỆU · CHUYÊN MÔN HOÁ SÂU',
  pageT: 'Chuẩn nghề Phân tích dữ liệu — đọc mô thức trước khi nó thành vấn đề',
  pageLead: 'Bốn module: khung nghề · 30 đầu việc tính KPI/lương · lộ trình phân tích · lộ trình đào tạo. Người đọc ra mô thức trước khi nó thành vấn đề — làm sạch dữ liệu, tìm mô thức, cảnh báo sớm, đề xuất cải tiến.',
  khung: [
    { ic: 'crown', ten: 'Vai trò & Sứ mệnh', mo: '<b>Phân tích dữ liệu (R12)</b> — người đọc ra mô thức trước khi nó thành vấn đề. Biến số liệu rời rạc thành quyết định đúng.', lk: ['chieu-sau', 'Chiều sâu năm lớp'] },
    { ic: 'lock', ten: 'Quyền hạn', mo: 'Kho nghề & công cụ dẫn dắt (<code>nghe_chung</code>) · dữ liệu của chính mình (<code>usr_self_data</code>). Đọc & phân tích trên dữ liệu đã giải mã; KHÔNG động tiền, KHÔNG xem hồ sơ ngoài quyền.', lk: ['pham-vi', 'Phạm vi của tôi'] },
    { ic: 'target', ten: 'Nghiệp vụ cốt lõi', mo: 'Thu thập dữ liệu → làm sạch & chuẩn hoá → tìm mô thức → cảnh báo sớm rủi ro → đề xuất cải tiến có bằng chứng.', lk: ['truy-van-da-chieu', 'Truy vấn đa chiều'] },
    { ic: 'shield', ten: 'Hiến pháp nghề', mo: 'Năm điều không ai được sửa · Lá chắn dữ liệu · đọc mô thức không đọc danh tính · dữ liệu khách không rời máy khi chưa giải mã.', lk: ['bien-nien', 'Năm điều không ai được sửa'], lk2: ['an-toan-du-lieu', 'Lá chắn dữ liệu'] },
    { ic: 'tools', ten: 'Công cụ', mo: 'Truy vấn đa chiều · Liên thống & toàn vẹn · Trần giám sát · Ma trận 220 vấn đề · Chiều sâu năm lớp.', lk: ['truy-van-da-chieu', 'Truy vấn đa chiều'], lk2: ['giam-sat', 'Trần giám sát'] },
    { ic: 'pulse', ten: 'KPI nghề', mo: 'Dữ liệu sạch (lệch = 0) · số mô thức phát hiện · cảnh báo sớm đúng · đề xuất được áp dụng · độ chính xác dự báo.', lk: ['kpi-toi', 'KPI của tôi'], lk2: ['lien-thong', 'Liên thống dữ liệu'] },
    { ic: 'quote', ten: 'Tiêu chuẩn nhân sự', mo: 'Trung thực số liệu tuyệt đối · không xào nấu dữ liệu · bảo mật danh tính khách · kết luận có bằng chứng · đọc trước khi vấn đề nổ.', lk: ['chuan-ngon-ngu', 'Chuẩn ngôn ngữ'] },
    { ic: 'spark', ten: 'Thưởng / Phạt', mo: 'THƯỞNG: phát hiện mô thức sớm, cảnh báo đúng, đề xuất được áp dụng, dữ liệu sạch. PHẠT: để dữ liệu lệch, cảnh báo muộn, lộ danh tính khách, kết luận không bằng chứng.', lk: ['luat-lam-viec', 'Luật làm việc'] },
    { ic: 'crown', ten: 'Chứng nhận 5 cấp', mo: 'Tập sự → Phân tích → Phân tích Cao cấp → Trưởng nhóm dữ liệu → Chuyên gia dữ liệu. Lên cấp bằng mô thức đọc đúng, không bằng thâm niên.', lk: ['coach-5-tang', 'Năm tầng người đi cùng'] }
  ],
  cap: [
    { n: 1, ten: 'Phân tích Tập sự', c: '#73849F', dk: 'Qua đào tạo nền dữ liệu + thi', ql: 'Phân tích có người kèm' },
    { n: 2, ten: 'Phân tích dữ liệu', c: '#185AB4', dk: 'Dữ liệu sạch ≥3 tháng · ≥10 mô thức đúng', ql: 'Tự chạy phân tích · dựng báo cáo' },
    { n: 3, ten: 'Phân tích Cao cấp', c: '#0B6675', dk: 'Cảnh báo sớm đúng · dự báo chính xác', ql: 'Thiết kế dashboard · chuẩn hoá chỉ số' },
    { n: 4, ten: 'Trưởng nhóm dữ liệu', c: '#B4720F', dk: 'Nhóm chạy đều · đào tạo Phân tích', ql: 'Dẫn nhóm · thiết kế mô hình đo' },
    { n: 5, ten: 'Chuyên gia dữ liệu', c: '#0B7350', dk: 'Hệ đo lường toàn hệ đáng tin', ql: 'Quyền thiết kế hệ đo · bậc cao' }
  ],
  nhom: [
    { ten: 'Chuẩn bị & thu thập', c: '#185AB4' }, { ten: 'Làm sạch & chuẩn hoá', c: '#2A72C6' },
    { ten: 'Phân tích mô thức', c: '#0B6675' }, { ten: 'Cảnh báo sớm', c: '#0B7350' },
    { ten: 'Đề xuất & báo cáo', c: '#B4720F' }, { ten: 'Toàn vẹn & cải tiến', c: '#5140B4' }
  ],
  viec: [
    [0, 'Xem bảng điểm 16 ban đầu ngày', 4, 'Nắm toàn cảnh bốn dòng chảy', 'Mở truy vấn đa chiều', 'truy-van-da-chieu', 'Đã nắm toàn cảnh'],
    [0, 'Nhận yêu cầu phân tích', 3, 'Không sót yêu cầu tới hạn', 'Lọc hàng chờ phân tích', 'bang-viec', 'Đã nắm hàng chờ'],
    [0, 'Chuẩn bị bộ chỉ số cần theo', 3, 'Chỉ số rõ trước khi chạy', 'Dựng danh sách chỉ số', 'giam-sat', 'Có bộ chỉ số sẵn'],
    [1, 'Thu thập dữ liệu từ các nguồn', 5, 'Đủ nguồn, không suy đoán', 'Gom theo truy vấn đa chiều', 'truy-van-da-chieu', 'Dữ liệu đủ để phân tích'],
    [1, 'Làm sạch dữ liệu lệch/thiếu', 4, 'Lệch = 0, thiếu được bù/đánh dấu', 'Soát qua liên thống', 'lien-thong', 'Dữ liệu sạch'],
    [1, 'Chuẩn hoá về cùng đơn vị', 4, 'Cùng chuẩn mới so được', 'Chuẩn hoá theo chuẩn chung', 'lien-thong', 'Dữ liệu cùng chuẩn'],
    [1, 'Xác minh toàn vẹn mối nối', 3, 'Mối nối giữa kho đúng', 'Soát liên thống', 'lien-thong', 'Mối nối đạt chuẩn'],
    [2, 'Tìm mô thức trong dữ liệu', 4, 'Mô thức có ý nghĩa, không trùng hợp', 'Soi theo chiều sâu 5 lớp', 'chieu-sau', 'Mô thức được gọi tên'],
    [2, 'Đối chiếu ma trận vấn đề', 4, 'Mô thức khớp dạng đã biết', 'Tra ma trận 220 vấn đề', 'ma-tran', 'Dạng vấn đề xác định'],
    [2, 'Phân khúc theo nhóm khách', 3, 'Nhóm phản ánh đúng thực tế', 'Phân khúc theo ma trận nhóm', 'ma-tran-bang', 'Phân khúc có căn cứ'],
    [2, 'Dựng biểu đồ/bảng điểm', 3, 'Biểu đồ đọc được, trung thực', 'Dựng trên truy vấn đa chiều', 'truy-van-da-chieu', 'Biểu đồ rõ & đúng'],
    [3, 'Phát hiện rủi ro sớm', 6, 'Báo trước khi vấn đề nổ', 'Soi ngưỡng ở trần giám sát', 'giam-sat', 'Rủi ro được phát hiện sớm'],
    [3, 'Gửi cảnh báo cho vai liên quan', 4, 'Đúng người, đúng lúc', 'Gửi cảnh báo theo ngưỡng', 'giam-sat', 'Cảnh báo đã gửi'],
    [3, 'Theo dõi chỉ số vượt ngưỡng', 3, 'Không bỏ sót ngưỡng đỏ', 'Theo dõi dashboard', 'truy-van-da-chieu', 'Ngưỡng đỏ được theo'],
    [3, 'Kiểm bảo mật danh tính dữ liệu', 2, 'Không lộ danh tính khi phân tích', 'Soát theo lá chắn dữ liệu', 'an-toan-du-lieu', 'Danh tính được bảo vệ'],
    [4, 'Viết đề xuất cải tiến có bằng chứng', 6, 'Đề xuất bám số liệu', 'Theo mẫu đề xuất', 'phuong-phap', 'Đề xuất có bằng chứng'],
    [4, 'Trình báo cáo lên điều hành', 4, 'Báo đúng, dễ hiểu, có hành động', 'Tổng hợp & trình', 'dieu-hanh', 'Báo cáo được ghi nhận'],
    [4, 'Theo dõi đề xuất được áp dụng', 3, 'Đề xuất đi vào thực tế', 'Theo dõi sau đề xuất', 'giam-sat', 'Có ghi nhận áp dụng'],
    [4, 'Cập nhật dashboard định kỳ', 2, 'Dashboard luôn mới', 'Cập nhật số liệu', 'truy-van-da-chieu', 'Dashboard cập nhật'],
    [5, 'Soát toàn vẹn dữ liệu toàn hệ', 4, 'Điểm toàn vẹn cao, lệch = 0', 'Mở liên thống & toàn vẹn', 'lien-thong', 'Điểm toàn vẹn đạt'],
    [5, 'Kiểm chéo số với sổ nguồn', 4, 'Số khớp sổ gốc', 'Đối chiếu nguồn', 'lien-thong', 'Số khớp sổ'],
    [5, 'Báo cáo chất lượng dữ liệu', 3, 'Báo đúng chỗ lệch & hướng sửa', 'Tổng hợp & gửi', 'lien-thong', 'Báo cáo ghi nhận'],
    [5, 'Chốt ngày vào KPI', 2, 'Chốt cuối ngày', 'Bấm chốt ngày', 'kpi-toi', 'Ngày đã chốt'],
    [5, 'Ghi sáng kiến cải tiến hệ đo', 2, 'Tối thiểu 1 ý/tuần', 'Ghi ở cột sáng kiến', 'bang-viec', 'Có sáng kiến'],
    [0, 'Đọc lại phân tích còn dở', 3, 'Việc dở được theo tiếp', 'Xem hàng chờ', 'bang-viec', 'Việc dở được xử lý'],
    [1, 'Xác minh nguồn dữ liệu mới', 2, 'Nguồn đáng tin mới dùng', 'Kiểm nguồn trước khi gom', 'lien-thong', 'Nguồn được xác minh'],
    [2, 'Ghi giả thuyết & kiểm chứng', 3, 'Giả thuyết được kiểm bằng số', 'Ghi & chạy kiểm chứng', 'chieu-sau', 'Giả thuyết được kiểm'],
    [3, 'Phân loại mức độ rủi ro', 2, 'Rủi ro xếp đúng mức', 'Xếp theo ngưỡng', 'giam-sat', 'Rủi ro được phân mức'],
    [4, 'Tổng hợp mô thức lặp hằng tuần', 3, 'Mô thức lặp được ghi nhận', 'Tổng hợp cuối tuần', 'ma-tran', 'Mô thức lặp ghi nhận'],
    [5, 'Học 1 kỹ thuật phân tích mới', 2, 'Mỗi tuần nâng năng lực', 'Đọc phương pháp', 'phuong-phap', 'Nắm thêm kỹ thuật']
  ],
  cTab: 'C · Lộ trình phân tích', cObj: 'Tập dữ liệu / nhà', cDv: 'tập', cDang: 'Đang phân tích', cTL: 'Tài liệu phương pháp', cTLkey: 'phuong-phap', cLoTrinh: 'truy-van-da-chieu',
  cNote: 'Mỗi tập dữ liệu đi qua <b>5 bước phân tích</b>. Bảng theo dõi: đang ở đâu, bước kế, tài liệu phương pháp, số buổi chạy, chất lượng, bằng chứng và tiềm năng khai thác.',
  gdj: [
    { n: 1, ten: 'Thu thập dữ liệu', c: '#185AB4' }, { n: 2, ten: 'Làm sạch & chuẩn hoá', c: '#2A72C6' },
    { n: 3, ten: 'Phân tích mô thức', c: '#0B6675' }, { n: 4, ten: 'Cảnh báo sớm', c: '#0B7350' },
    { n: 5, ten: 'Đề xuất cải tiến', c: '#B4720F' }
  ],
  dang: ['Gom dữ liệu từ các nguồn', 'Làm sạch & chuẩn hoá', 'Tìm mô thức, kiểm giả thuyết', 'Phát hiện & gửi cảnh báo', 'Viết đề xuất có bằng chứng'],
  ke: ['Làm sạch & chuẩn hoá', 'Phân tích mô thức', 'Cảnh báo sớm rủi ro', 'Đề xuất cải tiến', 'Theo dõi áp dụng'],
  tru: [
    { ic: 'seed', ten: 'Tổng quan GITA', mo: 'Sứ mệnh · năm tầng · văn hoá · hệ đo toàn hệ.', cua: 'gioi-thieu' },
    { ic: 'target', ten: 'Nghiệp vụ phân tích', mo: 'Làm sạch · mô thức · cảnh báo · đề xuất.', cua: 'truy-van-da-chieu' },
    { ic: 'orbit', ten: 'Hệ thống quy trình', mo: 'Liên thống · chuẩn hoá · hiến pháp · lá chắn dữ liệu.', cua: 'lien-thong' },
    { ic: 'spark', ten: 'Làm việc cùng AI', mo: 'Dùng Trợ lý GITA tổng hợp, soi lệch, dựng báo cáo.', cua: 'tro-ly' },
    { ic: 'heart', ten: 'Chăm sóc khách hàng', mo: 'Đọc hành trình khách qua số liệu · cảnh báo sớm.', cua: 'van-hanh-cham-soc' }
  ],
  nsMau: [
    { ten: 'Vũ Nhật Minh', cap: 3, hl: [100, 95, 90, 80, 75], wow: 5000 },
    { ten: 'Trần Khánh Linh', cap: 2, hl: [100, 85, 70, 55, 50], wow: 2500 },
    { ten: 'Bùi Quang Huy', cap: 4, hl: [100, 100, 95, 90, 85], wow: 7600 }
  ]
};
