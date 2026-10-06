/* ═══════════════════════════════════════════════════════════════
   GITA 365 — DỮ LIỆU NGHỀ THEO VAI · PHẦN 2 (cho khung nghe-vai.js)

   Bổ sung G.NGHE_SPEC cho các vai còn lại:
     nghe-tncoach  · R05 Trưởng nhóm Coach  · perm pro_assign · 40 việc
     nghe-giamdoc  · R03 Giám đốc            · perm dh_toan_he · 30 việc
     nghe-giaovien · R08 Giáo viên           · perm mc_duyet   · 30 việc
     nghe-daisu    · R15 CTV / Đại sứ        · perm ctv_hoa_hong · 30 việc
     nghe-quantri  · R01/R02 Super Admin/Admin · perm qt_trang · 30 việc

   Trưởng nhóm Coach = nền Coach + 10 nghiệp vụ lãnh đạo (phân công, kèm
   cặp, chuẩn hoá đội, báo cáo). Mỗi vai: 9 thẻ khung · 5 cấp · đầu việc
   (tổng trọng số 100) · lộ trình 5 giai đoạn · 5 trụ đào tạo. Cẩm nang
   nối màn vai đó mở được.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;
G.NGHE_SPEC = G.NGHE_SPEC || {};

/* ══════════ R05 · TRƯỞNG NHÓM COACH (40 việc · +10 lãnh đạo) ══════════ */
G.NGHE_SPEC['nghe-tncoach'] = {
  perm: 'pro_assign', vaiTen: 'Trưởng nhóm Coach', capTen: 'TRƯỞNG NHÓM COACH', capTenL: 'nghề Trưởng nhóm Coach',
  eyebrow: 'NGHỀ TRƯỞNG NHÓM COACH · CHUYÊN MÔN HOÁ SÂU',
  pageT: 'Chuẩn nghề Trưởng nhóm Coach — tạo ra Coach giỏi, không chỉ làm Coach giỏi',
  pageLead: 'Nền nghề Coach cộng 10 nghiệp vụ lãnh đạo: phân công, kèm cặp, chuẩn hoá đội, nghiệm thu, báo cáo. Bốn module với 40 đầu việc hằng ngày tính KPI/lương.',
  khung: [
    { ic: 'crown', ten: 'Vai trò & Sứ mệnh', mo: '<b>Trưởng nhóm Coach (R05)</b> — người tạo ra Coach giỏi, không chỉ làm Coach giỏi. Dẫn đội, phân công, kèm cặp, giữ chuẩn nghề và giữ lửa.', lk: ['doi-ngu', 'Đội ngũ dẫn dắt'] },
    { ic: 'lock', ten: 'Quyền hạn', mo: 'Phân công đội (<code>pro_assign</code>) · công cụ Coach (<code>pro_coach</code>) · chấm đánh giá (<code>pro_assess</code>) · xử lý ca (<code>ca_xu_ly</code>). KHÔNG động tiền/duyệt chi.', lk: ['pham-vi', 'Phạm vi của tôi'] },
    { ic: 'target', ten: 'Nghiệp vụ cốt lõi', mo: 'Nắm đội → phân công đúng người đúng nhà → kèm cặp nâng Coach → nghiệm thu chuẩn đội → chăm đội giữ lửa → báo cáo & cải tiến.', lk: ['ban-coach', 'Bàn làm việc Coach'] },
    { ic: 'shield', ten: 'Hiến pháp nghề', mo: 'Năm điều không ai được sửa · Bảy quyền của gia đình · dựng người chứ không thay người · công tâm khi phân công & nghiệm thu.', lk: ['bien-nien', 'Năm điều không ai được sửa'], lk2: ['phap-ly', 'Bảy quyền của nhà'] },
    { ic: 'tools', ten: 'Công cụ', mo: 'Đội ngũ dẫn dắt · Bản đồ coaching · Bàn Coach · Hệ đo lường · Rà soát 12 mặt.', lk: ['doi-ngu', 'Đội ngũ'], lk2: ['bando-coach', 'Bản đồ coaching'] },
    { ic: 'pulse', ten: 'KPI nghề', mo: 'Coach trong đội lên cấp · đèn đội xanh · gia đình đội phụ trách lên tầng · chuỗi đóng việc đúng hạn · KPI tổng đội.', lk: ['kpi-toi', 'KPI của tôi'], lk2: ['do-luong-kh', 'Đo lường KH'] },
    { ic: 'quote', ten: 'Tiêu chuẩn nhân sự', mo: 'Dựng người không dìm người · phân công công tâm · bằng chứng mọi nghiệm thu · gương mẫu chuẩn nghề · giữ lửa đội.', lk: ['chuan-ngon-ngu', 'Chuẩn ngôn ngữ'] },
    { ic: 'spark', ten: 'Thưởng / Phạt', mo: 'THƯỞNG: Coach đội lên cấp, đội đạt KPI, gia đình lên tầng, kèm được người mới. PHẠT: phân công thiên vị, nghiệm thu dễ dãi, để Coach giỏi rời đội, làm thay thay vì dựng người.', lk: ['luat-lam-viec', 'Luật làm việc'] },
    { ic: 'crown', ten: 'Chứng nhận 5 cấp', mo: 'Trưởng nhóm Tập sự → Trưởng nhóm → Trưởng nhóm Cao cấp → Trưởng khối Coach → Giám đốc huấn luyện. Lên cấp bằng đội mạnh, không bằng thâm niên.', lk: ['coach-5-tang', 'Năm tầng người đi cùng'] }
  ],
  cap: [
    { n: 1, ten: 'Trưởng nhóm Tập sự', c: '#73849F', dk: 'Coach Cao cấp + qua đào tạo lãnh đạo', ql: 'Dẫn nhóm nhỏ có người kèm' },
    { n: 2, ten: 'Trưởng nhóm Coach', c: '#185AB4', dk: '≥3 Coach đội lên cấp có bằng chứng', ql: 'Tự dẫn nhóm · phân công đội' },
    { n: 3, ten: 'Trưởng nhóm Cao cấp', c: '#0B6675', dk: 'Đèn đội TB ≥80 · KPI đội ≥85% ba tháng', ql: 'Dẫn nhiều nhóm · chuẩn hoá cách kèm' },
    { n: 4, ten: 'Trưởng khối Coach', c: '#B4720F', dk: 'Nhiều đội mạnh · đào tạo Trưởng nhóm', ql: 'Dẫn khối · thiết kế lộ trình huấn luyện' },
    { n: 5, ten: 'Giám đốc huấn luyện', c: '#0B7350', dk: 'Hệ huấn luyện Coach bền toàn hệ', ql: 'Quyền thiết kế hệ huấn luyện · bậc cao' }
  ],
  nhom: [
    { ten: 'Nắm đội đầu ngày', c: '#185AB4' }, { ten: 'Dẫn dắt & kèm cặp', c: '#2A72C6' },
    { ten: 'Phân công & điều phối', c: '#0B6675' }, { ten: 'Nghiệm thu & chuẩn đội', c: '#0B7350' },
    { ten: 'Chăm đội & giữ lửa', c: '#B4720F' }, { ten: 'Đo lường & báo cáo', c: '#5140B4' },
    { ten: 'Lãnh đạo nâng cao (+10)', c: '#BE0E16' }
  ],
  viec: [
    [0, 'Xem bảng đo lường toàn đội', 3, 'Nắm đèn từng Coach & gia đình', 'Mở hệ đo lường theo đội', 'do-luong-kh', 'Đã nắm đèn toàn đội'],
    [0, 'Điểm danh & nắm lịch buổi của đội', 2, 'Biết đội có buổi nào hôm nay', 'Xem lịch buổi đội', 'doi-ngu', 'Nắm đủ lịch đội'],
    [0, 'Xác định Coach/nhà cần hỗ trợ', 3, 'Coach đuối & nhà đỏ lên đầu', 'Lọc theo đèn', 'do-luong-kh', 'Danh sách hỗ trợ đã xếp'],
    [1, 'Dự giờ & soi buổi của Coach', 4, 'Soi theo mẫu chuẩn, có ghi nhận', 'Dự giờ theo lịch', 'ban-coach', 'Có ghi nhận buổi được soi'],
    [1, 'Kèm cặp Coach sau buổi', 4, 'Phản hồi cụ thể, dựng người', 'Kèm theo mẫu phản hồi', 'chuan-ngon-ngu', 'Coach biết điểm cần sửa'],
    [1, 'Gỡ vướng chuyên môn cho Coach', 3, 'Vướng có hướng trong ngày', 'Xử lý ca cùng Coach', 'xu-ly-ca', 'Vướng được gỡ'],
    [1, 'Làm mẫu buổi khó', 2, 'Coach học được qua làm mẫu', 'Dẫn mẫu một buổi khó', 'bando-coach', 'Coach áp được cách làm'],
    [2, 'Phân công nhà cho Coach đúng sức', 5, 'Đúng người đúng nhà, cân tải', 'Phân công trên đội ngũ', 'doi-ngu', 'Phân công cân, có thông báo'],
    [2, 'Điều phối khi đội quá tải', 3, 'Không ai gãy, không nhà bị bỏ', 'Cân tải lại theo năng lực', 'doi-ngu', 'Tải được cân lại'],
    [2, 'Chuyển ca vượt cấp lên QLCM/Mentor', 3, 'Ca khó chuyển đúng lúc', 'Đánh dấu & chuyển ca', 'xu-ly-ca', 'Ca khó được chuyển'],
    [2, 'Giao mục tiêu tuần cho từng Coach', 3, 'Mục tiêu rõ, đo được', 'Giao trên bảng việc', 'bang-viec', 'Coach có mục tiêu tuần'],
    [3, 'Nghiệm thu kết quả Coach bằng bằng chứng', 5, 'Không bằng chứng = chưa đạt', 'Nghiệm thu theo chuẩn', 'ra-soat-kh', 'Kết quả có bằng chứng'],
    [3, 'Chấm chất lượng buổi đội', 3, 'Điểm phản ánh đúng thực tế', 'Chấm theo khung đo', 'do-luong-kh', 'Điểm có căn cứ'],
    [3, 'Soi chuẩn ngôn ngữ của đội', 3, 'Không câu cấm, đúng chuẩn', 'Đối chiếu chuẩn ngôn ngữ', 'chuan-ngon-ngu', 'Lệch chuẩn được sửa'],
    [3, 'Duyệt bằng chứng khách xác nhận', 2, 'Có xác nhận hai bên', 'Kiểm bằng chứng', 'ra-soat-kh', 'Bằng chứng hợp lệ'],
    [4, 'Chăm Coach có dấu hiệu đuối', 4, 'Vào cuộc sớm, giữ người', 'Gặp riêng, tìm nguyên nhân', 'doi-ngu', 'Coach được tiếp sức'],
    [4, 'Cứu gia đình đèn đỏ cùng Coach', 3, 'Vào cuộc trong ngày', 'Bật playbook cứu nhà', 'van-hanh-cham-soc', 'Đèn nhà cải thiện'],
    [4, 'Giữ lửa đội, ghi nhận kịp thời', 2, 'Ghi nhận đúng người đúng việc', 'Vinh danh ở màn Năng lực', 'kpi-toi', 'Đội được tiếp lửa'],
    [4, 'Tổ chức sinh hoạt đội', 2, 'Đội gắn kết, học lẫn nhau', 'Họp đội theo nhịp', 'doi-ngu', 'Đội có sinh hoạt định kỳ'],
    [5, 'Tổng hợp KPI đội trong ngày', 3, 'Số khớp thực tế', 'Mở hệ đo lường', 'do-luong-kh', 'KPI đội chính xác'],
    [5, 'Chốt ngày vào KPI', 2, 'Chốt cuối ngày', 'Bấm chốt ngày', 'kpi-toi', 'Ngày đã chốt'],
    [5, 'Báo cáo đội lên QLCM', 2, 'Báo đúng, có đề xuất', 'Tổng hợp & gửi', 'ra-soat-kh', 'Báo cáo được ghi nhận'],
    [5, 'Ghi sáng kiến cải tiến cách kèm', 2, 'Tối thiểu 1 ý/tuần', 'Ghi ở cột sáng kiến', 'bang-viec', 'Có sáng kiến được lưu'],
    [5, 'Tự soi quyết định khó qua Hành lang', 2, 'Quyết định khó được soi lại', 'Mở Hành lang', 'hanh-lang', 'Có bài học rút ra'],
    /* ── 10 NGHIỆP VỤ LÃNH ĐẠO NÂNG CAO ── */
    [6, 'Lập lộ trình phát triển từng Coach', 3, 'Mỗi Coach một lộ trình lên cấp', 'Dựng theo năm tầng người đi cùng', 'coach-5-tang', 'Coach có lộ trình rõ'],
    [6, 'Kèm Coach tập sự thành Coach', 3, 'Tập sự đủ chuẩn lên chính thức', 'Kèm theo chương trình', 'khoa-dao-tao', 'Tập sự lên được cấp'],
    [6, 'Chuẩn hoá cách làm tốt của đội', 2, 'Cái hay thành chuẩn chung', 'Ghi vào kho tài liệu', 'kho-tai-lieu', 'Có chuẩn mới được dùng'],
    [6, 'Đánh giá năng lực định kỳ đội', 2, 'Điểm phản ánh đúng, công tâm', 'Chấm ở màn đo lường', 'do-luong-kh', 'Đội được đánh giá đúng'],
    [6, 'Đề xuất thăng hạng / khen thưởng', 2, 'Đúng người, có bằng chứng', 'Đề xuất lên QLCM', 'ra-soat-kh', 'Có đề xuất có căn cứ'],
    [6, 'Xử lý Coach dưới chuẩn kéo dài', 2, 'Có hướng cải thiện rõ ràng', 'Lập kế hoạch kèm sát', 'doi-ngu', 'Coach có kế hoạch cải thiện'],
    [6, 'Cân bằng tải & chống quá sức đội', 2, 'Không ai gãy vì quá tải', 'Soát tải định kỳ', 'doi-ngu', 'Tải đội cân bằng'],
    [6, 'Dựng văn hoá đội', 2, 'Đội có giá trị & nghi lễ chung', 'Dẫn theo văn hoá GITA', 'bien-nien', 'Đội có văn hoá rõ'],
    [6, 'Phối hợp liên nhóm & bàn giao', 2, 'Bàn giao sạch giữa các nhóm', 'Đồng bộ với trưởng nhóm khác', 'doi-ngu', 'Bàn giao liên nhóm sạch'],
    [6, 'Báo cáo chiến lược đội lên điều hành', 2, 'Báo đúng, có đề xuất chiến lược', 'Tổng hợp & trình', 'kpi-toi', 'Báo cáo chiến lược được ghi nhận'],
    [0, 'Soát tồn đọng của đội từ hôm trước', 2, 'Việc treo được theo tiếp', 'Xem việc tồn của đội', 'bang-viec', 'Việc treo được xử lý'],
    [1, 'Chia sẻ kinh nghiệm cho đội', 2, 'Đội học được điều mới', 'Chia sẻ theo buổi sinh hoạt', 'doi-ngu', 'Đội tiếp thu được'],
    [3, 'Soát chuẩn bằng chứng của đội', 1, 'Bằng chứng đúng chuẩn điện tử', 'Kiểm theo chuẩn bằng chứng', 'ra-soat-kh', 'Bằng chứng đạt chuẩn'],
    [4, 'Nhận diện Coach sắp rời, giữ chân', 1, 'Giữ người giỏi trước khi mất', 'Gặp sớm, tìm nguyên nhân', 'doi-ngu', 'Coach giỏi được giữ'],
    [5, 'Soát KPI tuần của đội', 1, 'KPI tuần phản ánh đúng', 'Tổng hợp KPI tuần', 'kpi-toi', 'KPI tuần rõ'],
    [6, 'Đào tạo lại đội theo chuẩn mới', 1, 'Đội cập nhật chuẩn mới', 'Tổ chức buổi đào tạo', 'khoa-dao-tao', 'Đội nắm chuẩn mới']
  ],
  cTab: 'C · Lộ trình đội', cObj: 'Gia đình (đội phụ trách)', cDv: 'nhà', cDang: 'Đội đang đồng hành', cTL: 'Tài liệu Coach', cTLkey: 'kho-tai-lieu', cLoTrinh: 'doi-ngu',
  cNote: 'Theo dõi các gia đình đội phụ trách qua <b>5 giai đoạn đồng hành</b>, kèm Coach nào đang phụ trách và đèn từng nhà.',
  gdj: [
    { n: 1, ten: 'Chẩn đoán & định vị', c: '#185AB4' }, { n: 2, ten: 'Dựng lộ trình 5 tầng', c: '#2A72C6' },
    { n: 3, ten: 'Đồng hành nhiệm vụ', c: '#0B6675' }, { n: 4, ten: 'Nghiệm thu kết quả', c: '#0B7350' },
    { n: 5, ten: 'Nâng tầng & lan toả', c: '#B4720F' }
  ],
  dang: ['Coach soi nút thắt, định vị', 'Coach dựng lộ trình 5 tầng', 'Coach đồng hành nhiệm vụ', 'Nghiệm thu bằng chứng', 'Mời nâng gói / lan toả'],
  ke: ['Dựng lộ trình 5 tầng', 'Giao nhiệm vụ đầu tiên', 'Nghiệm thu chặng, giữ đèn', 'Nâng tầng kế tiếp', 'Chốt nâng gói / giới thiệu'],
  tru: [
    { ic: 'seed', ten: 'Tổng quan GITA', mo: 'Sứ mệnh · năm tầng · văn hoá · cách đồng hành.', cua: 'gioi-thieu' },
    { ic: 'target', ten: 'Nghiệp vụ dẫn đội', mo: 'Phân công · kèm cặp · nghiệm thu · chuẩn hoá.', cua: 'doi-ngu' },
    { ic: 'orbit', ten: 'Hệ thống quy trình', mo: 'Quy trình toàn hệ · chuẩn ngôn ngữ · hiến pháp.', cua: 'quy-trinh-toan-he' },
    { ic: 'spark', ten: 'Làm việc cùng AI', mo: 'Dùng Trợ lý GITA tổng hợp, soi, nhắc việc.', cua: 'tro-ly' },
    { ic: 'heart', ten: 'Chăm sóc khách hàng', mo: 'Nhịp chạm 365 · playbook · đèn đội & nhà.', cua: 'van-hanh-cham-soc' }
  ],
  nsMau: [
    { ten: 'Hoàng Mỹ Duyên', cap: 3, hl: [100, 95, 90, 85, 88], wow: 6800 },
    { ten: 'Phan Thị Hồng', cap: 2, hl: [100, 85, 70, 60, 70], wow: 3200 },
    { ten: 'Dương Quốc Việt', cap: 4, hl: [100, 100, 95, 90, 92], wow: 8200 }
  ]
};

/* ══════════ R03 · GIÁM ĐỐC ══════════ */
G.NGHE_SPEC['nghe-giamdoc'] = {
  perm: 'dh_toan_he', vaiTen: 'Giám đốc', capTen: 'GIÁM ĐỐC', capTenL: 'nghề Giám đốc',
  eyebrow: 'NGHỀ GIÁM ĐỐC · CHUYÊN MÔN HOÁ SÂU',
  pageT: 'Chuẩn nghề Giám đốc — cầm tầm nhìn và chịu trách nhiệm tăng trưởng',
  pageLead: 'Bốn module: khung nghề · 30 đầu việc điều hành tính KPI · lộ trình kết quả kinh doanh · lộ trình đào tạo. Người cầm tầm nhìn, điều phối nguồn lực, giữ bảy con số và chịu trách nhiệm tăng trưởng.',
  khung: [
    { ic: 'crown', ten: 'Vai trò & Sứ mệnh', mo: '<b>Giám đốc (R03)</b> — người cầm tầm nhìn và chịu trách nhiệm tăng trưởng. Điều phối nguồn lực, giữ chuẩn và kết quả toàn hệ.', lk: ['dieu-hanh', 'Trung tâm điều hành'] },
    { ic: 'lock', ten: 'Quyền hạn', mo: 'Điều hành toàn hệ (<code>dh_toan_he</code>) · xem tài chính (<code>fin_view</code>) · xem CRM (<code>crm_view</code>) · báo cáo & nghiệm thu chuyên môn. Chốt chiến lược, chịu trách nhiệm kết quả.', lk: ['pham-vi', 'Phạm vi của tôi'] },
    { ic: 'target', ten: 'Nghiệp vụ cốt lõi', mo: 'Đọc toàn cảnh → đặt mục tiêu & phân bổ nguồn lực → điều phối phòng ban → giữ bảy con số → báo cáo & quyết định tăng trưởng.', lk: ['tai-chinh-ceo', 'Bảy con số CEO'] },
    { ic: 'shield', ten: 'Hiến pháp nghề', mo: 'Năm điều không ai được sửa · Bảy quyền của gia đình · quyết định có lý do ghi sổ · tăng trưởng không đánh đổi chuẩn nghề và bản quyền GITA365.', lk: ['bien-nien', 'Năm điều không ai được sửa'], lk2: ['phap-ly', 'Bảy quyền của nhà'] },
    { ic: 'tools', ten: 'Công cụ', mo: 'Trung tâm điều hành · Bảy con số CEO · Hệ thống Phòng ban · CRM · Năng lực & Thăng hạng.', lk: ['phong-ban', 'Phòng ban'], lk2: ['crm', 'CRM'] },
    { ic: 'pulse', ten: 'KPI nghề', mo: 'Tăng trưởng doanh thu · dòng tiền ròng · đèn phòng ban xanh · KPI toàn hệ · tỷ lệ giữ chân khách & nhân sự.', lk: ['kpi-toi', 'KPI của tôi'], lk2: ['tai-chinh-ceo', 'Bảy con số CEO'] },
    { ic: 'quote', ten: 'Tiêu chuẩn nhân sự', mo: 'Quyết định dựa dữ liệu · công tâm với đội · giữ chuẩn khi tăng trưởng · gương mẫu hiến pháp · chịu trách nhiệm cuối.', lk: ['chuan-ngon-ngu', 'Chuẩn ngôn ngữ'] },
    { ic: 'spark', ten: 'Thưởng / Phạt', mo: 'THƯỞNG: đạt mục tiêu tăng trưởng, phòng ban mạnh, giữ chân tốt. PHẠT: tăng trưởng đánh đổi chuẩn nghề, quyết định không bằng chứng, để phòng ban rệu rã.', lk: ['luat-lam-viec', 'Luật làm việc'] },
    { ic: 'crown', ten: 'Chứng nhận 5 cấp', mo: 'Giám đốc Tập sự → Giám đốc → Giám đốc Cao cấp → Phó Tổng → Tổng Giám đốc. Lên cấp bằng kết quả bền, không bằng thâm niên.', lk: ['coach-5-tang', 'Năm tầng người đi cùng'] }
  ],
  cap: [
    { n: 1, ten: 'Giám đốc Tập sự', c: '#73849F', dk: 'Qua đào tạo điều hành + thi', ql: 'Điều hành có cố vấn kèm' },
    { n: 2, ten: 'Giám đốc', c: '#185AB4', dk: 'Đạt mục tiêu tăng trưởng 2 quý', ql: 'Toàn quyền điều hành mảng' },
    { n: 3, ten: 'Giám đốc Cao cấp', c: '#0B6675', dk: 'Tăng trưởng bền · đèn phòng ban xanh', ql: 'Điều hành nhiều mảng · chốt chiến lược' },
    { n: 4, ten: 'Phó Tổng', c: '#B4720F', dk: 'Nhiều khối mạnh · đào tạo Giám đốc', ql: 'Điều hành khối · thiết kế mô hình' },
    { n: 5, ten: 'Tổng Giám đốc', c: '#0B7350', dk: 'Hệ tăng trưởng bền toàn tập đoàn', ql: 'Quyền chiến lược toàn hệ · bậc cao' }
  ],
  nhom: [
    { ten: 'Đọc toàn cảnh đầu ngày', c: '#185AB4' }, { ten: 'Mục tiêu & nguồn lực', c: '#2A72C6' },
    { ten: 'Điều phối phòng ban', c: '#0B6675' }, { ten: 'Tài chính & tăng trưởng', c: '#0B7350' },
    { ten: 'Nhân sự & giữ chân', c: '#B4720F' }, { ten: 'Báo cáo & quyết định', c: '#5140B4' }
  ],
  viec: [
    [0, 'Đọc bản tin sáng & bảng điều khiển', 5, 'Nắm toàn cảnh bốn dòng chảy', 'Mở trung tâm điều hành', 'dieu-hanh', 'Đã nắm toàn cảnh'],
    [0, 'Xem bảng điểm 16 ban', 5, 'Biết ban nào đỏ/xanh', 'Mở truy vấn đa chiều', 'truy-van-da-chieu', 'Nắm đèn từng ban'],
    [0, 'Rà việc tồn & quyết định tới hạn', 4, 'Không để quyết định trễ', 'Lọc việc tới hạn', 'bang-viec', 'Danh sách quyết định rõ'],
    [1, 'Đặt / soát mục tiêu mảng', 6, 'Mục tiêu đo được, có hạn', 'Dựng mục tiêu theo chiến lược', 'kpi-toi', 'Mục tiêu rõ cho từng mảng'],
    [1, 'Phân bổ nguồn lực', 5, 'Nguồn lực đúng ưu tiên', 'Phân bổ theo phòng ban', 'phong-ban', 'Nguồn lực được phân bổ'],
    [1, 'Soát rủi ro chiến lược', 4, 'Rủi ro lớn được nhận diện', 'Soi theo trần giám sát', 'giam-sat', 'Rủi ro được gọi tên'],
    [2, 'Họp điều phối phòng ban', 5, 'Vướng liên phòng được gỡ', 'Họp theo điểm tắc', 'phong-ban', 'Vướng có hướng xử lý'],
    [2, 'Nghiệm thu kết quả phòng ban', 5, 'Kết quả có bằng chứng', 'Soát báo cáo phòng ban', 'phong-ban', 'Kết quả được nghiệm thu'],
    [2, 'Gỡ quyết định vượt cấp của phòng', 4, 'Quyết định có lý do ghi sổ', 'Quyết định theo quy trình', 'quy-trinh-toan-he', 'Quyết định có căn cứ'],
    [2, 'Theo dõi dòng chảy công việc toàn hệ', 3, 'Việc không tắc toàn hệ', 'Mở bảng công việc', 'bang-viec', 'Điểm tắc được gọi tên'],
    [3, 'Soát bảy con số CEO', 5, 'Bảy con số cập nhật, đúng', 'Mở bảy con số CEO', 'tai-chinh-ceo', 'Bảy con số được soát'],
    [3, 'Xem báo cáo tài chính', 4, 'Dòng tiền & chi phí trong tầm', 'Mở tài chính & tăng trưởng', 'tang-truong', 'Nắm tình hình tài chính'],
    [3, 'Quyết định đầu tư / cắt giảm', 3, 'Có bằng chứng, có ROI', 'Quyết định theo dữ liệu', 'chi-phi', 'Quyết định có căn cứ'],
    [3, 'Theo dõi CRM kết quả kinh doanh', 3, 'Phễu & doanh thu trong tầm', 'Mở CRM', 'crm', 'Nắm kết quả kinh doanh'],
    [4, 'Soát năng lực & thăng hạng nhân sự', 4, 'Điểm công tâm, có đề xuất', 'Mở màn Năng lực', 'nang-luc-ns', 'Có quyết định nhân sự'],
    [4, 'Giữ chân nhân sự chủ chốt', 3, 'Người giỏi được giữ', 'Gặp & tiếp sức người chủ chốt', 'con-nguoi', 'Người chủ chốt được giữ'],
    [4, 'Duyệt chương trình đào tạo', 3, 'Đào tạo đúng nhu cầu', 'Soát khoá đào tạo', 'khoa-dao-tao', 'Chương trình được duyệt'],
    [4, 'Vinh danh phòng ban / cá nhân', 2, 'Ghi nhận đúng người đúng việc', 'Đề xuất ở màn Năng lực', 'nang-luc-ns', 'Có vinh danh'],
    [5, 'Ra quyết định có ghi lý do', 4, 'Mọi quyết định có lý do & hạn soi', 'Ghi quyết định + căn cứ', 'dieu-hanh', 'Quyết định có lý do ghi lại'],
    [5, 'Chốt ngày vào KPI', 2, 'Chốt cuối ngày', 'Bấm chốt ngày', 'kpi-toi', 'Ngày đã chốt'],
    [5, 'Báo cáo tăng trưởng định kỳ', 3, 'Báo đúng, có đề xuất hành động', 'Tổng hợp & trình', 'tai-chinh-ceo', 'Báo cáo được ghi nhận'],
    [5, 'Ghi sáng kiến chiến lược', 2, 'Tối thiểu 1 ý/tuần', 'Ghi ở cột sáng kiến', 'bang-viec', 'Có sáng kiến được lưu'],
    [5, 'Soi quyết định lớn qua Hành lang', 2, 'Quyết định lớn được soi lại', 'Mở Hành lang', 'hanh-lang', 'Có bài học rút ra'],
    [0, 'Chuẩn bị nghị trình ngày', 2, 'Ưu tiên rõ trước khi vào việc', 'Dựng nghị trình', 'bang-viec', 'Có nghị trình ngày'],
    [1, 'Soát tiến độ mục tiêu quý', 2, 'Biết đang đạt bao nhiêu %', 'Đối chiếu KPI quý', 'kpi-toi', 'Nắm tiến độ quý'],
    [2, 'Phê duyệt phân công quan trọng', 2, 'Phân công công tâm', 'Duyệt trên phòng ban', 'phong-ban', 'Phân công được duyệt'],
    [3, 'Soát chi vượt trần', 2, 'Chi vượt trần = 0', 'Soát kế toán – thuế', 'ke-toan-thue', 'Không chi vượt trần'],
    [4, 'Nghe phản hồi từ đội', 2, 'Phản hồi được lắng nghe', 'Kênh phản hồi nội bộ', 'con-nguoi', 'Phản hồi được ghi nhận'],
    [5, 'Tổng hợp quyết định tuần', 2, 'Quyết định tuần có hồ sơ', 'Tổng hợp cuối tuần', 'dieu-hanh', 'Có hồ sơ quyết định tuần'],
    [1, 'Học 1 mô hình tăng trưởng mới', 2, 'Mỗi tuần nâng tầm điều hành', 'Đọc học từ hệ thống lớn', 'hoc-tu-lon', 'Nắm thêm mô hình']
  ],
  cTab: 'C · Lộ trình kết quả', cObj: 'Mảng / nhà trọng điểm', cDv: 'hồ sơ', cDang: 'Đang điều phối', cTL: 'Tài liệu điều hành', cTLkey: 'dieu-hanh', cLoTrinh: 'crm',
  cNote: 'Theo dõi kết quả kinh doanh qua <b>5 giai đoạn</b> của các nhà/mảng trọng điểm: đang ở đâu, bước kế, dữ liệu, kết quả và tiềm năng tăng trưởng.',
  gdj: [
    { n: 1, ten: 'Tiếp cận & định vị', c: '#185AB4' }, { n: 2, ten: 'Tư vấn & đề xuất', c: '#2A72C6' },
    { n: 3, ten: 'Triển khai', c: '#0B6675' }, { n: 4, ten: 'Đo kết quả', c: '#0B7350' },
    { n: 5, ten: 'Nâng cấp & tăng trưởng', c: '#B4720F' }
  ],
  dang: ['Định vị cơ hội', 'Đề xuất giải pháp', 'Triển khai & theo dõi', 'Đo kết quả thực', 'Mời nâng cấp / mở rộng'],
  ke: ['Đề xuất giải pháp', 'Triển khai', 'Đo kết quả', 'Nâng cấp', 'Giữ & mở rộng'],
  tru: [
    { ic: 'seed', ten: 'Tổng quan GITA', mo: 'Sứ mệnh · năm tầng · văn hoá · mô hình tăng trưởng.', cua: 'gioi-thieu' },
    { ic: 'target', ten: 'Nghiệp vụ điều hành', mo: 'Mục tiêu · nguồn lực · điều phối · tài chính.', cua: 'dieu-hanh' },
    { ic: 'orbit', ten: 'Hệ thống quy trình', mo: 'Quy trình toàn hệ · hiến pháp · bản quyền.', cua: 'quy-trinh-toan-he' },
    { ic: 'spark', ten: 'Làm việc cùng AI', mo: 'Dùng Trợ lý GITA tổng hợp, dự báo, soi rủi ro.', cua: 'tro-ly' },
    { ic: 'heart', ten: 'Chăm sóc khách hàng', mo: 'Đọc hành trình khách qua số · giữ chân.', cua: 'van-hanh-cham-soc' }
  ],
  nsMau: [
    { ten: 'Phạm Anh Thư', cap: 4, hl: [100, 100, 95, 90, 92], wow: 8600 },
    { ten: 'Lê Hoàng Sơn', cap: 3, hl: [100, 90, 85, 80, 82], wow: 5400 },
    { ten: 'Nguyễn Thị Cẩm', cap: 2, hl: [100, 80, 70, 60, 68], wow: 3000 }
  ]
};

/* ══════════ R08 · GIÁO VIÊN ══════════ */
G.NGHE_SPEC['nghe-giaovien'] = {
  perm: 'mc_duyet', vaiTen: 'Giáo viên', capTen: 'GIÁO VIÊN', capTenL: 'nghề Giáo viên',
  eyebrow: 'NGHỀ GIÁO VIÊN · CHUYÊN MÔN HOÁ SÂU',
  pageT: 'Chuẩn nghề Giáo viên — dạy đúng thứ học viên đang cần để đi tiếp',
  pageLead: 'Bốn module: khung nghề · 30 đầu việc tính KPI/lương · lộ trình học viên · lộ trình đào tạo. Người dạy đúng thứ học viên đang cần để đi tiếp — soạn bài, dẫn lớp, nghiệm thu bằng chứng, chăm học viên.',
  khung: [
    { ic: 'crown', ten: 'Vai trò & Sứ mệnh', mo: '<b>Giáo viên (R08)</b> — người dạy đúng thứ học viên đang cần để đi tiếp. Không dạy cho đủ bài, mà dạy cho học viên đi được.', lk: ['khoa-dao-tao', 'Khoá đào tạo của tôi'] },
    { ic: 'lock', ten: 'Quyền hạn', mo: 'Xác nhận minh chứng (<code>mc_duyet</code>) · công cụ Coach (<code>pro_coach</code>) · xử lý ca (<code>ca_xu_ly</code>) · kho nghề (<code>nghe_chung</code>). KHÔNG động tiền.', lk: ['pham-vi', 'Phạm vi của tôi'] },
    { ic: 'target', ten: 'Nghiệp vụ cốt lõi', mo: 'Nắm trình độ lớp → soạn bài đúng nhu cầu → dẫn lớp sinh động → giao & nghiệm thu bài tập → chăm học viên đuối → đo tiến bộ.', lk: ['khoa-dao-tao', 'Khoá đào tạo'] },
    { ic: 'shield', ten: 'Hiến pháp nghề', mo: 'Năm điều không ai được sửa · Bảy quyền của gia đình · dạy cho học viên đi được, không để ai bị bỏ lại · nghiệm thu bằng bằng chứng.', lk: ['bien-nien', 'Năm điều không ai được sửa'], lk2: ['phap-ly', 'Bảy quyền của nhà'] },
    { ic: 'tools', ten: 'Công cụ', mo: 'Khoá đào tạo · Sát hạch năng lực · Kho tài liệu · Thư viện · 1000 điểm chạm.', lk: ['khoa-dao-tao', 'Khoá đào tạo'], lk2: ['thu-vien', 'Thư viện tài liệu'] },
    { ic: 'pulse', ten: 'KPI nghề', mo: 'Tỷ lệ học viên qua bài · tiến bộ đo được · bài tập nghiệm thu đạt · học viên đuối được kéo lên · hài lòng lớp.', lk: ['kpi-toi', 'KPI của tôi'], lk2: ['sat-hach', 'Sát hạch năng lực'] },
    { ic: 'quote', ten: 'Tiêu chuẩn nhân sự', mo: 'Dạy đúng nhu cầu không chạy bài · không bỏ ai lại · bằng chứng mọi buổi · chuẩn ngôn ngữ dẫn dắt · trung thực điểm.', lk: ['chuan-ngon-ngu', 'Chuẩn ngôn ngữ'] },
    { ic: 'spark', ten: 'Thưởng / Phạt', mo: 'THƯỞNG: học viên tiến bộ rõ, qua bài cao, kéo được học viên đuối. PHẠT: chạy bài cho xong, bỏ học viên đuối, nghiệm thu dễ dãi, chấm điểm không thực.', lk: ['luat-lam-viec', 'Luật làm việc'] },
    { ic: 'crown', ten: 'Chứng nhận 5 cấp', mo: 'Giáo viên Tập sự → Giáo viên → Giáo viên Giỏi → Giáo viên Chủ nhiệm → Chuyên gia đào tạo. Lên cấp bằng tiến bộ học viên, không bằng thâm niên.', lk: ['coach-5-tang', 'Năm tầng người đi cùng'] }
  ],
  cap: [
    { n: 1, ten: 'Giáo viên Tập sự', c: '#73849F', dk: 'Qua đào tạo sư phạm + thi', ql: 'Dạy có người kèm' },
    { n: 2, ten: 'Giáo viên', c: '#185AB4', dk: '≥1 lớp qua bài đạt chuẩn', ql: 'Tự dẫn lớp · chấm bài' },
    { n: 3, ten: 'Giáo viên Giỏi', c: '#0B6675', dk: 'Tỷ lệ tiến bộ cao · 0 học viên bị bỏ', ql: 'Dạy lớp nâng cao · soạn giáo trình' },
    { n: 4, ten: 'Giáo viên Chủ nhiệm', c: '#B4720F', dk: 'Nhiều lớp mạnh · kèm Giáo viên mới', ql: 'Chủ nhiệm khối · chuẩn hoá bài' },
    { n: 5, ten: 'Chuyên gia đào tạo', c: '#0B7350', dk: 'Hệ đào tạo bền · giáo trình chuẩn', ql: 'Thiết kế chương trình · bậc cao' }
  ],
  nhom: [
    { ten: 'Chuẩn bị & nắm lớp', c: '#185AB4' }, { ten: 'Soạn bài', c: '#2A72C6' },
    { ten: 'Dẫn lớp', c: '#0B6675' }, { ten: 'Nghiệm thu bài tập', c: '#0B7350' },
    { ten: 'Chăm học viên', c: '#B4720F' }, { ten: 'Đo tiến bộ & cải tiến', c: '#5140B4' }
  ],
  viec: [
    [0, 'Nắm trình độ & tiến độ lớp', 5, 'Biết ai đang đuối, ai vượt', 'Xem tiến độ lớp', 'khoa-dao-tao', 'Nắm trình độ cả lớp'],
    [0, 'Xem học viên cần kèm riêng', 4, 'Học viên đuối được đánh dấu', 'Lọc theo tiến độ', 'khoa-dao-tao', 'Danh sách kèm riêng rõ'],
    [0, 'Chuẩn bị giáo cụ / tài liệu', 4, 'Có đủ công cụ trước buổi', 'Lấy từ kho tài liệu', 'kho-tai-lieu', 'Giáo cụ sẵn sàng'],
    [1, 'Soạn bài đúng nhu cầu lớp', 6, 'Bài bám đúng chỗ lớp cần', 'Soạn theo trình độ lớp', 'thu-vien', 'Bài đúng nhu cầu'],
    [1, 'Chuẩn hoá mục tiêu buổi học', 4, 'Mỗi buổi một mục tiêu đo được', 'Ghi mục tiêu buổi', 'bang-viec', 'Có mục tiêu rõ'],
    [1, 'Chọn ví dụ / điểm chạm phù hợp', 4, 'Ví dụ gần với học viên', 'Chọn từ kho điểm chạm', 'diem-cham-1000', 'Ví dụ sát học viên'],
    [2, 'Dẫn lớp sinh động, đúng chuẩn', 6, 'Lớp cuốn, đúng chuẩn ngôn ngữ', 'Dẫn theo giáo án', 'chuan-ngon-ngu', 'Lớp tham gia tích cực'],
    [2, 'Kiểm tra hiểu bài tại lớp', 4, 'Biết lớp hiểu tới đâu', 'Hỏi & kiểm nhanh', 'sat-hach', 'Nắm mức hiểu của lớp'],
    [2, 'Giao bài tập vừa sức', 4, 'Bài tập đo được, có hạn', 'Giao trên bảng việc', 'bang-viec', 'Bài tập rõ, học viên nhận'],
    [2, 'Điểm chạm khích lệ học viên', 3, 'Tối thiểu 1 điểm chạm/buổi', 'Chọn điểm chạm đúng nhịp', 'diem-cham-1000', 'Học viên được khích lệ'],
    [3, 'Nghiệm thu bài tập bằng bằng chứng', 6, 'Không bằng chứng = chưa đạt', 'Xác nhận minh chứng', 'minh-chung', 'Bài tập có minh chứng'],
    [3, 'Chấm điểm công tâm, có nhận xét', 4, 'Điểm thực, nhận xét dựng người', 'Chấm theo chuẩn', 'sat-hach', 'Điểm & nhận xét rõ'],
    [3, 'Ghi dữ liệu buổi học', 4, 'Mỗi buổi một bản ghi', 'Ghi ngay sau buổi', 'bang-viec', 'Buổi nào cũng có dữ liệu'],
    [3, 'Trả bài & phản hồi học viên', 3, 'Học viên biết điểm cần sửa', 'Trả bài theo mẫu', 'chuan-ngon-ngu', 'Học viên biết phải sửa gì'],
    [4, 'Kèm riêng học viên đuối', 5, 'Vào cuộc sớm, không bỏ ai', 'Kèm sát theo kế hoạch', 'xu-ly-ca', 'Học viên đuối tiến bộ'],
    [4, 'Động viên học viên mất động lực', 3, 'Giữ lửa học tập', 'Theo nhịp chăm sóc', 'van-hanh-cham-soc', 'Học viên lấy lại động lực'],
    [4, 'Liên hệ phụ huynh khi cần', 2, 'Phụ huynh nắm tình hình con', 'Trao đổi đúng chuẩn', 'chuan-ngon-ngu', 'Phụ huynh được cập nhật'],
    [4, 'Hỏi thăm tiến bộ học viên giỏi', 2, 'Giữ lửa & giao thử thách', 'Theo nhịp chăm sóc', 'van-hanh-cham-soc', 'Học viên giỏi được giữ lửa'],
    [5, 'Cập nhật tiến độ từng học viên', 4, 'Tiến độ phản ánh đúng', 'Ghi vào khoá đào tạo', 'khoa-dao-tao', 'Tiến độ cập nhật'],
    [5, 'Chốt ngày vào KPI', 2, 'Chốt cuối ngày', 'Bấm chốt ngày', 'kpi-toi', 'Ngày đã chốt'],
    [5, 'Báo cáo lớp lên chủ nhiệm', 2, 'Báo đúng, có đề xuất', 'Tổng hợp & gửi', 'bang-viec', 'Báo cáo được ghi nhận'],
    [5, 'Ghi sáng kiến cải tiến bài giảng', 2, 'Tối thiểu 1 ý/tuần', 'Ghi ở cột sáng kiến', 'bang-viec', 'Có sáng kiến được lưu'],
    [5, 'Tự soi buổi dạy khó qua Hành lang', 2, 'Buổi khó được soi lại', 'Mở Hành lang', 'hanh-lang', 'Có bài học rút ra'],
    [0, 'Đọc lại học viên còn nợ bài', 3, 'Không bỏ sót học viên nợ bài', 'Xem danh sách nợ bài', 'khoa-dao-tao', 'Học viên nợ bài được theo'],
    [1, 'Chuẩn bị bài kiểm tra / sát hạch', 2, 'Đề đúng chuẩn, đo đúng', 'Dựng đề theo chuẩn', 'sat-hach', 'Có đề sát hạch chuẩn'],
    [2, 'Dùng tài liệu gốc Học viện', 2, 'Dạy đúng nguồn chuẩn', 'Mở tài liệu gốc', 'tai-lieu-goc', 'Dạy theo nguồn chuẩn'],
    [3, 'Soát minh chứng học viên gửi', 2, 'Minh chứng hợp lệ mới duyệt', 'Kiểm minh chứng', 'minh-chung', 'Minh chứng hợp lệ'],
    [4, 'Nuôi dưỡng học viên tiềm năng', 2, 'Phát hiện & bồi dưỡng sớm', 'Theo nôi nuôi dưỡng nhân tài', 'noi-nhan-tai', 'Học viên tiềm năng được bồi dưỡng'],
    [5, 'Học 1 phương pháp dạy mới', 2, 'Mỗi tuần nâng nghề', 'Đọc xương sống phương pháp', 'phuong-phap', 'Nắm thêm phương pháp'],
    [0, 'Nắm sĩ số & chuyên cần lớp', 2, 'Biết ai vắng, ai đi trễ', 'Xem chuyên cần lớp', 'khoa-dao-tao', 'Nắm sĩ số lớp']
  ],
  cTab: 'C · Lộ trình học viên', cObj: 'Học viên / lớp', cDv: 'học viên', cDang: 'Đang dạy', cTL: 'Tài liệu dạy', cTLkey: 'kho-tai-lieu', cLoTrinh: 'khoa-dao-tao',
  cNote: 'Theo dõi học viên qua <b>5 giai đoạn học tập</b>: đang ở đâu, bước kế, tài liệu, dữ liệu buổi, điểm, minh chứng và tiềm năng.',
  gdj: [
    { n: 1, ten: 'Nhập học & định trình', c: '#185AB4' }, { n: 2, ten: 'Học nền', c: '#2A72C6' },
    { n: 3, ten: 'Luyện & thực hành', c: '#0B6675' }, { n: 4, ten: 'Sát hạch', c: '#0B7350' },
    { n: 5, ten: 'Nâng cao & lan toả', c: '#B4720F' }
  ],
  dang: ['Định trình độ học viên', 'Dạy phần nền', 'Luyện tập & nghiệm thu', 'Sát hạch có bằng chứng', 'Giao thử thách nâng cao'],
  ke: ['Dạy phần nền', 'Luyện & thực hành', 'Sát hạch', 'Nâng cao', 'Lan toả / kèm bạn'],
  tru: [
    { ic: 'seed', ten: 'Tổng quan GITA', mo: 'Sứ mệnh · năm tầng · văn hoá · cách dạy.', cua: 'gioi-thieu' },
    { ic: 'target', ten: 'Nghiệp vụ sư phạm', mo: 'Soạn bài · dẫn lớp · nghiệm thu · chăm học viên.', cua: 'khoa-dao-tao' },
    { ic: 'orbit', ten: 'Hệ thống quy trình', mo: 'Quy trình toàn hệ · chuẩn ngôn ngữ · hiến pháp.', cua: 'quy-trinh-toan-he' },
    { ic: 'spark', ten: 'Làm việc cùng AI', mo: 'Dùng Trợ lý GITA soạn bài, chấm, gợi ví dụ.', cua: 'tro-ly' },
    { ic: 'heart', ten: 'Chăm sóc khách hàng', mo: 'Nhịp chạm 365 · giữ lửa học tập.', cua: 'van-hanh-cham-soc' }
  ],
  nsMau: [
    { ten: 'Trịnh Bảo Ngân', cap: 3, hl: [100, 90, 85, 75, 80], wow: 4400 },
    { ten: 'Mai Thị Lan', cap: 2, hl: [100, 80, 65, 55, 60], wow: 2100 },
    { ten: 'Phùng Gia Hân', cap: 4, hl: [100, 100, 90, 85, 88], wow: 7000 }
  ]
};

/* ══════════ R15 · CTV / ĐẠI SỨ GIỚI THIỆU ══════════ */
G.NGHE_SPEC['nghe-daisu'] = {
  perm: 'ctv_hoa_hong', vaiTen: 'Đại sứ GITA', capTen: 'ĐẠI SỨ', capTenL: 'nghề Đại sứ giới thiệu',
  eyebrow: 'NGHỀ ĐẠI SỨ · CHUYÊN MÔN HOÁ SÂU',
  pageT: 'Chuẩn nghề Đại sứ — mang ánh sáng này tới nhà tiếp theo',
  pageLead: 'Bốn module: khung nghề · 30 đầu việc tính hoa hồng · lộ trình giới thiệu · lộ trình đào tạo. Người mang GITA tới nhà tiếp theo — giới thiệu đúng, kết nối tư vấn, theo tới khi nhà vào.',
  khung: [
    { ic: 'crown', ten: 'Vai trò & Sứ mệnh', mo: '<b>Đại sứ GITA (R15)</b> — người mang ánh sáng này tới nhà tiếp theo. Giới thiệu bằng câu chuyện thật, không bán ép.', lk: ['dai-su', 'Đại sứ GITA 365'] },
    { ic: 'lock', ten: 'Quyền hạn', mo: 'Mã liên kết cộng tác viên (<code>ctv_lien_ket</code>) · hoa hồng & tài khoản nhận tiền (<code>ctv_hoa_hong</code>) · giới thiệu người quen (<code>usr_referral</code>). KHÔNG xem hồ sơ khách của hệ.', lk: ['pham-vi', 'Phạm vi của tôi'] },
    { ic: 'target', ten: 'Nghiệp vụ cốt lõi', mo: 'Tiếp cận người quen → kể câu chuyện GITA → kết nối với Tư vấn → theo dõi tới khi nhà vào → chăm sau & xin giới thiệu tiếp.', lk: ['dai-su', 'Đại sứ GITA'] },
    { ic: 'shield', ten: 'Hiến pháp nghề', mo: 'Năm điều không ai được sửa · Bảy quyền của gia đình · giới thiệu trung thực, không hứa thay hệ · tôn trọng quyền từ chối.', lk: ['bien-nien', 'Năm điều không ai được sửa'], lk2: ['phap-ly', 'Bảy quyền của nhà'] },
    { ic: 'tools', ten: 'Công cụ', mo: 'Đại sứ GITA · Cơ chế hoa hồng · Vệ tinh của tôi · Sự kiện & Lửa trại · Chuyện truyền cảm hứng.', lk: ['dai-su', 'Đại sứ'], lk2: ['hoa-hong', 'Cơ chế hoa hồng'] },
    { ic: 'pulse', ten: 'KPI nghề', mo: 'Số người được giới thiệu · tỷ lệ kết nối tư vấn · số nhà vào thật · hoa hồng ghi sổ · nhà giới thiệu tiếp.', lk: ['kpi-toi', 'KPI của tôi'], lk2: ['hoa-hong', 'Hoa hồng'] },
    { ic: 'quote', ten: 'Tiêu chuẩn nhân sự', mo: 'Giới thiệu bằng trải nghiệm thật · không hứa quá · tôn trọng người nghe · giữ uy tín GITA · trung thực số liệu hoa hồng.', lk: ['chuyen-cam-hung', 'Chuyện truyền cảm hứng'] },
    { ic: 'spark', ten: 'Thưởng / Phạt', mo: 'THƯỞNG: nhiều nhà vào thật, nhà giới thiệu tiếp, giữ uy tín. PHẠT: hứa quá gây hiểu lầm, làm phiền người từ chối, khai số liệu sai để nhận hoa hồng.', lk: ['hoa-hong', 'Cơ chế hoa hồng'] },
    { ic: 'crown', ten: 'Chứng nhận 5 cấp', mo: 'Đại sứ Tập sự → Đại sứ → Đại sứ Vàng → Đại sứ Kim Cương → Đại sứ Danh dự. Lên cấp bằng số nhà vào thật, không bằng lời hứa.', lk: ['dai-su', 'Đại sứ GITA 365'] }
  ],
  cap: [
    { n: 1, ten: 'Đại sứ Tập sự', c: '#73849F', dk: 'Nhận mã liên kết + hiểu GITA', ql: 'Giới thiệu người quen · hoa hồng cơ bản' },
    { n: 2, ten: 'Đại sứ', c: '#185AB4', dk: '≥3 nhà vào thật có bằng chứng', ql: 'Hoa hồng tăng · ưu đãi sự kiện' },
    { n: 3, ten: 'Đại sứ Vàng', c: '#0B6675', dk: '≥10 nhà vào · giữ uy tín', ql: 'Hoa hồng bậc cao · quà vinh danh' },
    { n: 4, ten: 'Đại sứ Kim Cương', c: '#B4720F', dk: 'Mạng lưới rộng · nhà giới thiệu nhà', ql: 'Hoa hồng tầng · dẫn đội đại sứ' },
    { n: 5, ten: 'Đại sứ Danh dự', c: '#0B7350', dk: 'Lan toả bền · hình mẫu cộng đồng', ql: 'Đặc quyền danh dự · thu nhập bậc cao' }
  ],
  nhom: [
    { ten: 'Chuẩn bị & học nghề', c: '#185AB4' }, { ten: 'Tiếp cận & kể chuyện', c: '#2A72C6' },
    { ten: 'Kết nối tư vấn', c: '#0B6675' }, { ten: 'Theo dõi nhà vào', c: '#0B7350' },
    { ten: 'Chăm sau & lan toả', c: '#B4720F' }, { ten: 'Ghi nhận & cải tiến', c: '#5140B4' }
  ],
  viec: [
    [0, 'Nắm câu chuyện & giá trị GITA', 5, 'Kể được GITA bằng lời mình', 'Đọc đại sứ & chuyện cảm hứng', 'dai-su', 'Kể được tự tin'],
    [0, 'Cập nhật mã liên kết & ưu đãi', 4, 'Mã đúng, ưu đãi mới nhất', 'Mở màn Đại sứ', 'dai-su', 'Có mã & ưu đãi sẵn'],
    [0, 'Lập danh sách người quen tiềm năng', 4, 'Danh sách có thứ tự ưu tiên', 'Ghi danh sách tiếp cận', 'pham-vi', 'Danh sách đã xếp'],
    [1, 'Tiếp cận đúng người, đúng lúc', 6, 'Tôn trọng, không làm phiền', 'Tiếp cận theo danh sách', 'dai-su', 'Có cuộc trò chuyện mở'],
    [1, 'Kể câu chuyện thật, không hứa quá', 6, 'Trung thực, bằng trải nghiệm', 'Theo khung kể chuyện', 'chuyen-cam-hung', 'Người nghe thấy chân thật'],
    [1, 'Lắng nghe nhu cầu người nghe', 4, 'Hiểu điều họ đang cần', 'Hỏi & lắng nghe', 'pham-vi', 'Nắm nhu cầu người nghe'],
    [1, 'Gửi tư liệu giới thiệu phù hợp', 4, 'Đúng thứ họ quan tâm', 'Chọn tư liệu phù hợp', 'chuyen-cam-hung', 'Đã gửi tư liệu phù hợp'],
    [2, 'Kết nối người quan tâm với Tư vấn', 7, 'Chuyển đúng người, đúng lúc', 'Gửi qua mã liên kết', 'dai-su', 'Đã kết nối tư vấn'],
    [2, 'Giới thiệu đúng kỳ vọng', 4, 'Không vẽ điều hệ không làm', 'Nói đúng phạm vi GITA', 'pham-vi', 'Kỳ vọng đúng thực tế'],
    [2, 'Theo sát buổi tư vấn đầu', 3, 'Người được giới thiệu không lạc', 'Nhắc & đồng hành buổi đầu', 'dai-su', 'Buổi đầu diễn ra'],
    [3, 'Theo dõi tiến trình nhà vào', 5, 'Biết nhà đang ở bước nào', 'Theo dõi trên màn Đại sứ', 'dai-su', 'Nắm tiến trình nhà'],
    [3, 'Hỗ trợ gỡ vướng cho người giới thiệu', 3, 'Vướng được chuyển đúng nơi', 'Chuyển vướng cho Tư vấn', 'dai-su', 'Vướng được xử lý'],
    [3, 'Xác nhận nhà vào thật', 3, 'Có bằng chứng nhà vào', 'Đối chiếu trên màn Đại sứ', 'dai-su', 'Nhà vào được xác nhận'],
    [4, 'Chăm người đã giới thiệu', 4, 'Giữ quan hệ sau khi vào', 'Hỏi thăm theo nhịp', 'dai-su', 'Quan hệ được giữ'],
    [4, 'Xin giới thiệu tiếp khi hài lòng', 4, 'Khi họ hài lòng rõ', 'Hệ một nhà giới thiệu một nhà', 'dai-su', 'Có giới thiệu mới'],
    [4, 'Mời tham gia sự kiện / lửa trại', 2, 'Kết nối cộng đồng', 'Mời qua sự kiện', 'su-kien', 'Có người tham gia sự kiện'],
    [4, 'Giữ kết nối hệ sinh thái', 2, 'Luôn trong vòng kết nối', 'Mở kết nối hệ sinh thái', 'ket-noi', 'Giữ được kết nối'],
    [5, 'Soát hoa hồng ghi sổ', 4, 'Số liệu đúng, minh bạch', 'Mở cơ chế hoa hồng', 'hoa-hong', 'Hoa hồng khớp sổ'],
    [5, 'Chốt ngày vào KPI', 2, 'Chốt cuối ngày', 'Bấm chốt ngày', 'kpi-toi', 'Ngày đã chốt'],
    [5, 'Ghi nhật ký giới thiệu', 3, 'Mỗi lần giới thiệu một bản ghi', 'Ghi nhật ký của tôi', 'nhat-ky-vi-tri', 'Có nhật ký giới thiệu'],
    [5, 'Ghi sáng kiến lan toả', 2, 'Tối thiểu 1 ý/tuần', 'Ghi vào nhật ký', 'nhat-ky-vi-tri', 'Có sáng kiến được lưu'],
    [5, 'Học 1 câu chuyện truyền cảm hứng mới', 2, 'Mỗi tuần làm giàu vốn kể', 'Đọc chuyện cảm hứng', 'chuyen-cam-hung', 'Nắm thêm câu chuyện'],
    [0, 'Xem bảng tin nội bộ cộng đồng', 2, 'Nắm tin & ưu đãi mới', 'Mở bảng tin', 'bang-tin', 'Nắm tin mới'],
    [1, 'Giới thiệu qua mạng xã hội đúng chuẩn', 3, 'Đúng hình ảnh GITA', 'Đăng theo chuẩn thương hiệu', 'chuyen-cam-hung', 'Bài đăng đúng chuẩn'],
    [2, 'Phân loại người quan tâm theo mức', 2, 'Nóng/ấm/nguội rõ ràng', 'Đánh dấu mức quan tâm', 'dai-su', 'Đã phân loại'],
    [3, 'Nhắc nhẹ người đang cân nhắc', 2, 'Nhắc đúng lúc, không ép', 'Nhắc theo nhịp', 'dai-su', 'Người cân nhắc được nhắc'],
    [4, 'Chúc mừng cột mốc của nhà đã vào', 2, 'Chạm đúng khoảnh khắc', 'Gửi lời chúc mừng', 'chuyen-cam-hung', 'Nhà được chúc mừng'],
    [5, 'Xem vệ tinh & mạng lưới của tôi', 2, 'Nắm mạng lưới đang có', 'Mở vệ tinh của tôi', 've-tinh', 'Nắm mạng lưới'],
    [5, 'Tự soi cách giới thiệu chưa hiệu quả', 2, 'Rút kinh nghiệm mỗi tuần', 'Ghi vào nhật ký', 'nhat-ky-vi-tri', 'Có điểm cần cải tiến'],
    [0, 'Ôn lại gói & ưu đãi hiện hành', 2, 'Nói đúng gói & ưu đãi', 'Xem màn Đại sứ', 'dai-su', 'Nắm đúng gói & ưu đãi']
  ],
  cTab: 'C · Lộ trình giới thiệu', cObj: 'Người được giới thiệu', cDv: 'người', cDang: 'Đang theo', cTL: 'Tư liệu giới thiệu', cTLkey: 'chuyen-cam-hung', cLoTrinh: 'dai-su',
  cNote: 'Theo dõi người được giới thiệu qua <b>5 giai đoạn</b>: đang ở đâu, bước kế, tư liệu, số lần chạm, mức quan tâm, bằng chứng vào và tiềm năng giới thiệu tiếp.',
  gdj: [
    { n: 1, ten: 'Tiếp cận', c: '#185AB4' }, { n: 2, ten: 'Kể chuyện GITA', c: '#2A72C6' },
    { n: 3, ten: 'Kết nối tư vấn', c: '#0B6675' }, { n: 4, ten: 'Theo dõi nhà vào', c: '#0B7350' },
    { n: 5, ten: 'Chăm sau & giới thiệu tiếp', c: '#B4720F' }
  ],
  dang: ['Tiếp cận đúng lúc', 'Kể câu chuyện thật', 'Kết nối với Tư vấn', 'Theo tới khi nhà vào', 'Chăm sau & xin giới thiệu'],
  ke: ['Kể câu chuyện GITA', 'Kết nối tư vấn', 'Theo dõi nhà vào', 'Chăm sau khi vào', 'Mời giới thiệu tiếp'],
  tru: [
    { ic: 'seed', ten: 'Tổng quan GITA', mo: 'Sứ mệnh · năm tầng · văn hoá · câu chuyện.', cua: 'gioi-thieu' },
    { ic: 'target', ten: 'Nghiệp vụ Đại sứ', mo: 'Kể chuyện · kết nối · theo dõi · chăm sau.', cua: 'dai-su' },
    { ic: 'orbit', ten: 'Hệ thống quy trình', mo: 'Giới thiệu đúng chuẩn · hiến pháp · hoa hồng.', cua: 'hoa-hong' },
    { ic: 'spark', ten: 'Làm việc cùng AI', mo: 'Dùng Trợ lý GITA gợi câu kể, soạn tin nhắn.', cua: 'tro-ly' },
    { ic: 'heart', ten: 'Chăm sóc khách hàng', mo: 'Giữ quan hệ · chạm đúng khoảnh khắc.', cua: 'chuyen-cam-hung' }
  ],
  nsMau: [
    { ten: 'Trần Diễm Quỳnh', cap: 3, hl: [100, 90, 80, 70, 75], wow: 3800 },
    { ten: 'Võ Thành Đạt', cap: 2, hl: [100, 75, 60, 50, 55], wow: 1900 },
    { ten: 'Lưu Khánh Chi', cap: 4, hl: [100, 95, 90, 80, 85], wow: 6200 }
  ]
};

/* ══════════ R01/R02 · QUẢN TRỊ (SUPER ADMIN / ADMIN) ══════════ */
G.NGHE_SPEC['nghe-quantri'] = {
  perm: 'qt_trang', vaiTen: 'Quản trị hệ thống', capTen: 'QUẢN TRỊ', capTenL: 'nghề Quản trị hệ thống',
  eyebrow: 'NGHỀ QUẢN TRỊ · CHUYÊN MÔN HOÁ SÂU',
  pageT: 'Chuẩn nghề Quản trị — giữ chìa khoá gốc và vận hành cho hệ chạy mượt',
  pageLead: 'Bốn module: khung nghề · 30 đầu việc vận hành tính KPI · lộ trình vận hành hệ · lộ trình đào tạo. Người giữ chìa khoá gốc: phân quyền, bảo mật, toàn vẹn dữ liệu, giữ hệ chạy mượt và giữ bản quyền GITA365.',
  khung: [
    { ic: 'crown', ten: 'Vai trò & Sứ mệnh', mo: '<b>Super Admin / Admin (R01–R02)</b> — người giữ chìa khoá gốc của hệ sinh thái; dựng chuẩn, mở đường, giữ lửa và giữ hệ an toàn.', lk: ['phan-quyen', 'Phân công & cấp quyền'] },
    { ic: 'lock', ten: 'Quyền hạn', mo: 'Quản trị trang & phân quyền (<code>qt_trang</code>) · cấu hình hệ · khôi phục dữ liệu · quản trị người dùng · nhật ký hệ thống. Quyền gốc — dùng có trách nhiệm & ghi sổ.', lk: ['pham-vi', 'Phạm vi của tôi'] },
    { ic: 'target', ten: 'Nghiệp vụ cốt lõi', mo: 'Phân quyền đúng vai → giữ toàn vẹn dữ liệu → canh bảo mật & phục hồi → vận hành hệ mượt → giám sát & chuẩn hoá.', lk: ['phan-quyen', 'Phân công & cấp quyền'] },
    { ic: 'shield', ten: 'Hiến pháp nghề', mo: 'Năm điều không ai được sửa · Lá chắn 30 tầng · mọi cấp quyền có lý do & hạn soi · bí mật không nằm trong mã · giữ bản quyền GITA365.', lk: ['bien-nien', 'Năm điều không ai được sửa'], lk2: ['la-chan-30', 'Lá chắn 30 tầng'] },
    { ic: 'tools', ten: 'Công cụ', mo: 'Phân quyền · Hệ thống Phòng ban · Liên thống & toàn vẹn · Lá chắn dữ liệu · Trần giám sát · Truy vấn đa chiều.', lk: ['phong-ban', 'Phòng ban'], lk2: ['lien-thong', 'Liên thống dữ liệu'] },
    { ic: 'pulse', ten: 'KPI nghề', mo: 'Quyền thừa = 0 · điểm toàn vẹn dữ liệu cao · sự cố phát hiện sớm · uptime hệ · lỗ bảo mật = 0.', lk: ['kpi-toi', 'KPI của tôi'], lk2: ['lien-thong', 'Liên thống'] },
    { ic: 'quote', ten: 'Tiêu chuẩn nhân sự', mo: 'Cẩn trọng với quyền gốc · mọi thay đổi ghi sổ · bảo mật tuyệt đối · trung thực số liệu · giữ bản quyền & hiến pháp.', lk: ['an-toan-du-lieu', 'Lá chắn dữ liệu'] },
    { ic: 'spark', ten: 'Thưởng / Phạt', mo: 'THƯỞNG: hệ an toàn ổn định, quyền sạch, dữ liệu toàn vẹn, phục hồi nhanh. PHẠT: để lọt quyền thừa, lộ bảo mật, mất dữ liệu, thay đổi không ghi sổ.', lk: ['luat-lam-viec', 'Luật làm việc'] },
    { ic: 'crown', ten: 'Chứng nhận 5 cấp', mo: 'Admin Tập sự → Admin → Admin Cao cấp → Trưởng ban hệ thống → Super Admin. Lên cấp bằng hệ an toàn ổn định, không bằng thâm niên.', lk: ['coach-5-tang', 'Năm tầng người đi cùng'] }
  ],
  cap: [
    { n: 1, ten: 'Admin Tập sự', c: '#73849F', dk: 'Qua đào tạo vận hành + thi bảo mật', ql: 'Vận hành có người kèm' },
    { n: 2, ten: 'Admin hệ thống', c: '#185AB4', dk: 'Vận hành ổn định ≥3 tháng · 0 sự cố nặng', ql: 'Tự vận hành · phân quyền' },
    { n: 3, ten: 'Admin Cao cấp', c: '#0B6675', dk: 'Phục hồi nhanh · toàn vẹn dữ liệu cao', ql: 'Chuẩn hoá vận hành · kèm Admin mới' },
    { n: 4, ten: 'Trưởng ban hệ thống', c: '#B4720F', dk: 'Hệ an toàn bền · đào tạo Admin', ql: 'Dẫn ban · thiết kế kiến trúc' },
    { n: 5, ten: 'Super Admin', c: '#0B7350', dk: 'Giữ chìa khoá gốc · hệ an toàn toàn diện', ql: 'Toàn quyền hệ · chốt cấu hình gốc' }
  ],
  nhom: [
    { ten: 'Soát hệ đầu ngày', c: '#185AB4' }, { ten: 'Phân quyền & tài khoản', c: '#2A72C6' },
    { ten: 'Bảo mật & phục hồi', c: '#0B6675' }, { ten: 'Toàn vẹn dữ liệu', c: '#0B7350' },
    { ten: 'Vận hành & giám sát', c: '#B4720F' }, { ten: 'Chuẩn hoá & báo cáo', c: '#5140B4' }
  ],
  viec: [
    [0, 'Soát sức khoẻ hệ đầu ngày', 5, 'Nắm hệ xanh/đỏ, sự cố đêm', 'Mở tự vận hành / tổng quan', 'tu-van-hanh', 'Đã nắm sức khoẻ hệ'],
    [0, 'Đọc nhật ký hệ thống', 4, 'Không sót cảnh báo', 'Mở nhật ký hệ thống', 'nhat-ky-ht', 'Đã đọc nhật ký'],
    [0, 'Rà yêu cầu quyền / tài khoản chờ', 4, 'Không để yêu cầu tồn', 'Lọc hàng chờ', 'phan-quyen', 'Hàng chờ rõ'],
    [1, 'Cấp quyền theo vai, có lý do', 6, 'Đúng vai, có lý do ghi sổ', 'Cấp trên phân quyền', 'phan-quyen', 'Quyền cấp có lý do'],
    [1, 'Soát & thu quyền thừa', 5, 'Quyền thừa = 0', 'Soát tầng quyền truy cập', 'tang-quyen', 'Không còn quyền thừa'],
    [1, 'Mở / khoá / xoá tài khoản đúng quy trình', 4, 'Mọi thao tác có sổ', 'Theo vòng đời tài khoản', 'vong-doi-tk', 'Thao tác có ghi sổ'],
    [1, 'Soát phân quyền CRM', 3, 'CRM cấp đúng người chăm khách', 'Mở phân quyền CRM', 'phan-quyen-crm', 'CRM cấp đúng người'],
    [2, 'Soát lá chắn bảo mật', 6, 'Không lỗ hổng mới', 'Mở lá chắn 30 tầng', 'la-chan-30', 'Lá chắn không lỗ hổng'],
    [2, 'Kiểm ẩn danh dữ liệu ra ngoài', 5, 'Không lộ danh tính khách', 'Soát qua lá chắn dữ liệu', 'an-toan-du-lieu', 'Dữ liệu ra ngoài ẩn danh'],
    [2, 'Soát & chạy sao lưu', 4, 'Sao lưu đủ, phục hồi được', 'Kiểm lịch sao lưu', 'an-toan-du-lieu', 'Sao lưu sẵn sàng'],
    [2, 'Diễn tập phục hồi định kỳ', 3, 'Phục hồi được trong hạn', 'Chạy thử phục hồi', 'an-toan-du-lieu', 'Phục hồi đạt chuẩn'],
    [3, 'Soát toàn vẹn & liên thống dữ liệu', 5, 'Điểm toàn vẹn cao, lệch = 0', 'Mở liên thống & toàn vẹn', 'lien-thong', 'Điểm toàn vẹn đạt'],
    [3, 'Soát đủ ruột các kho', 3, 'Không kho nào hụt dữ liệu', 'Mở soát đủ ruột', 'soat-day-du', 'Các kho đủ ruột'],
    [3, 'Kiểm chéo số với sổ nguồn', 3, 'Số khớp sổ gốc', 'Đối chiếu nguồn', 'lien-thong', 'Số khớp sổ'],
    [4, 'Giám sát vận hành toàn hệ', 4, 'Phát hiện bất thường sớm', 'Mở trần giám sát', 'giam-sat', 'Bất thường được phát hiện'],
    [4, 'Xử lý sự cố & tự vá', 4, 'Sự cố gỡ gọn, có hậu kiểm', 'Theo tự vận hành · tự vá', 'tu-van-hanh', 'Sự cố được xử lý'],
    [4, 'Theo dõi tài nguyên & chi phí hệ', 3, 'Không chạm trần D1/R2', 'Mở theo dõi tài nguyên', 'theo-doi-tai-nguyen', 'Tài nguyên trong tầm'],
    [4, 'Kiểm thử theo vai', 2, 'Mỗi vai mở đúng phần của mình', 'Mở kiểm thử theo vai', 'kiem-theo-vai', 'Các vai hiển thị đúng'],
    [5, 'Chuẩn hoá quy trình vận hành', 4, 'Cái tốt thành chuẩn chung', 'Ghi vào quy trình toàn hệ', 'quy-trinh-toan-he', 'Có quy trình được duyệt'],
    [5, 'Chốt ngày vào KPI', 2, 'Chốt cuối ngày', 'Bấm chốt ngày', 'kpi-toi', 'Ngày đã chốt'],
    [5, 'Báo cáo an toàn hệ lên điều hành', 3, 'Báo đúng rủi ro & hướng xử lý', 'Tổng hợp & trình', 'dieu-hanh', 'Báo cáo được ghi nhận'],
    [5, 'Ghi sáng kiến cải tiến hệ', 2, 'Tối thiểu 1 ý/tuần', 'Ghi ở cột sáng kiến', 'bang-viec', 'Có sáng kiến được lưu'],
    [5, 'Soát bản quyền & giấy phép', 2, 'Bản quyền GITA365 được giữ', 'Kiểm giấy phép & bản quyền', 'la-chan-30', 'Bản quyền được giữ'],
    [0, 'Chuẩn bị việc ưu tiên trong ngày', 2, 'Ưu tiên rõ trước khi vào việc', 'Dựng danh sách ưu tiên', 'bang-viec', 'Có danh sách ưu tiên'],
    [1, 'Soát danh bạ người dùng', 2, 'Danh bạ sạch, đúng vai', 'Mở danh bạ người dùng', 'nguoi-dung', 'Danh bạ sạch'],
    [2, 'Soát mật mã kín trên tài liệu', 2, 'Tài liệu nhạy cảm được khoá', 'Mở mật mã kín tài liệu', 'dau-mat', 'Tài liệu được bảo vệ'],
    [3, 'Theo dõi dòng chảy thông tin', 2, 'Thông tin đi đúng luồng', 'Mở dòng chảy thông tin', 'dong-chay', 'Dòng chảy đúng luồng'],
    [4, 'Soi mười tổ thanh tra', 2, 'Soi điểm yếu toàn hệ', 'Mở mười tổ thanh tra', 'thanh-tra-soi', 'Điểm yếu được soi'],
    [5, 'Học từ hệ thống lớn', 2, 'Mỗi tuần nâng chuẩn vận hành', 'Mở học từ hệ thống lớn', 'hoc-tu-lon', 'Nắm thêm chuẩn vận hành'],
    [0, 'Soát hàng đợi đồng bộ máy chủ', 2, 'Không để đồng bộ nghẽn', 'Kiểm đồng bộ hệ', 'tu-van-hanh', 'Đồng bộ thông suốt']
  ],
  cTab: 'C · Lộ trình vận hành', cObj: 'Phân hệ / tài khoản', cDv: 'phân hệ', cDang: 'Đang vận hành', cTL: 'Tài liệu kiến trúc', cTLkey: 'quy-trinh-toan-he', cLoTrinh: 'lien-thong',
  cNote: 'Theo dõi các phân hệ/mảng vận hành qua <b>5 giai đoạn</b>: đang ở đâu, bước kế, tài liệu, dữ liệu, trạng thái, bằng chứng và tiềm năng tối ưu.',
  gdj: [
    { n: 1, ten: 'Dựng & cấu hình', c: '#185AB4' }, { n: 2, ten: 'Phân quyền & bảo mật', c: '#2A72C6' },
    { n: 3, ten: 'Vận hành ổn định', c: '#0B6675' }, { n: 4, ten: 'Giám sát & phục hồi', c: '#0B7350' },
    { n: 5, ten: 'Chuẩn hoá & tối ưu', c: '#B4720F' }
  ],
  dang: ['Dựng & cấu hình phân hệ', 'Phân quyền & khoá bảo mật', 'Vận hành & theo dõi', 'Giám sát & diễn tập phục hồi', 'Chuẩn hoá & tối ưu'],
  ke: ['Phân quyền & bảo mật', 'Đưa vào vận hành', 'Giám sát liên tục', 'Chuẩn hoá quy trình', 'Tối ưu & nhân rộng'],
  tru: [
    { ic: 'seed', ten: 'Tổng quan GITA', mo: 'Sứ mệnh · năm tầng · văn hoá · kiến trúc hệ.', cua: 'gioi-thieu' },
    { ic: 'target', ten: 'Nghiệp vụ quản trị', mo: 'Phân quyền · bảo mật · toàn vẹn · vận hành.', cua: 'phan-quyen' },
    { ic: 'orbit', ten: 'Hệ thống quy trình', mo: 'Quy trình toàn hệ · hiến pháp · bản quyền.', cua: 'quy-trinh-toan-he' },
    { ic: 'spark', ten: 'Làm việc cùng AI', mo: 'Điều phối trợ lý AI · tự vá · tự học.', cua: 'tro-ly' },
    { ic: 'heart', ten: 'Chăm sóc khách hàng', mo: 'Giữ hệ mượt để đội phục vụ khách tốt.', cua: 'van-hanh-cham-soc' }
  ],
  nsMau: [
    { ten: 'Trương Nhật Quang', cap: 5, hl: [100, 100, 100, 95, 98], wow: 9500 },
    { ten: 'Ngô Hải Sơn', cap: 3, hl: [100, 95, 90, 85, 88], wow: 5600 },
    { ten: 'Đinh Công Thành', cap: 2, hl: [100, 85, 75, 65, 70], wow: 3100 }
  ]
};
