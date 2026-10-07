/* ═══════════════════════════════════════════════════════════════
   GITA 365 — HỆ THỐNG PHÒNG BAN DOANH NGHIỆP

   13 phòng ban theo tiêu chuẩn Nhật Bản + Mỹ:
     1. Giám đốc
     2. Phòng Tài chính
     3. Phòng Nghiên cứu & Phát triển
     4. Phòng Marketing
     5. Phòng Hành chính
     6. Phòng Kinh doanh
     7. Phòng Đào tạo
     8. Phòng Kỹ thuật
     9. Phòng Dự án
    10. Phòng Trí tuệ nhân tạo
    11. Phòng Sản xuất video
    12. Phòng Chăm sóc khách hàng
    13. Phòng Thanh tra

   Mỗi phòng ban có: vai trò, nhiệm vụ, quyền hạn, KPI, quy trình,
   hướng dẫn công việc, và liên kết phối hợp.
   ═══════════════════════════════════════════════════════════════ */

import { Kho, kiemMatKhau, bamMoi, muoiMoi } from './nen.js';
import { bacVai, laNguoiNha } from './vai-tro.js';

export const PHONG_BAN = [
  { ma: 'GD', ten: 'Giám đốc', truongPhong: 'R03',
    nhiemVu: 'Cầm tầm nhìn, chịu trách nhiệm tăng trưởng và ra quyết định chiến lược.',
    quyenHan: ['Duyệt ngân sách', 'Phê duyệt chiến lược', 'Bổ nhiệm trưởng phòng'],
    kpi: ['Tăng trưởng doanh thu 20%/năm', 'NPS khách hàng ≥ 50', 'Tỷ lệ giữ chân nhân sự ≥ 85%'],
    quyTrinh: ['Họp chiến lược tuần', 'Duyệt báo cáo tháng', 'Ra quyết định phòng ban'],
    huongDan: 'Báo cáo trực tiếp cho Super Admin; phối hợp chặt với Tài chính và Kinh doanh.' },
  { ma: 'TC', ten: 'Phòng Tài chính', truongPhong: 'R04',
    nhiemVu: 'Quản lý dòng tiền, kế toán, đối soát, lương, và báo cáo tài chính.',
    quyenHan: ['Xem toàn bộ dòng tiền', 'Duyệt chi', 'Lập bảng lương', 'Đối soát ngân hàng'],
    kpi: ['Sai lệch đối soát < 0.1%', 'Báo cáo tài chính đúng hạn 100%', 'Chi phí/vốn < 30%'],
    quyTrinh: ['Thu → ghi nhận → đối soát', 'Chi → đề xuất → duyệt → thanh toán', 'Lương → chốt → duyệt → chuyển khoản'],
    huongDan: 'Làm việc với Kinh doanh (doanh thu), Hành chính (chi phí), Thanh tra (kiểm toán).' },
  { ma: 'RD', ten: 'Phòng Nghiên cứu & Phát triển', truongPhong: 'R04',
    nhiemVu: 'Nghiên cứu mô hình giáo dục, phát triển nội dung mới, và cải tiến sản phẩm.',
    quyenHan: ['Tạo thử nghiệm mới', 'Đề xuất sản phẩm', 'Đánh giá hiệu quả mô hình'],
    kpi: ['2 sản phẩm mới/năm', 'Chỉ số hài lòng sản phẩm ≥ 4.2/5', 'Thời gian thử nghiệm giảm 15%'],
    quyTrinh: ['Nghiên cứu → thử nghiệm → đo lường → triển khai'],
    huongDan: 'Phối hợp với Marketing ( insight khách hàng), Đào tạo (triển khai).' },
  { ma: 'MK', ten: 'Phòng Marketing', truongPhong: 'R05',
    nhiemVu: 'Xây dựng thương hiệu, tạo lead, quản lý kênh vệ tinh, và SEO.',
    quyenHan: ['Quản lý kênh truyền thông', 'Chạy chiến dịch', 'Phân tích dữ liệu marketing'],
    kpi: ['+2,000 lead chất lượng/tháng', 'Chi phí/lead giảm 10%/năm', 'Traffic organic +30%/năm'],
    quyTrinh: ['Lập kế hoạch → sản xuất nội dung → phân phối → đo lường'],
    huongDan: 'Phối hợp với Kinh doanh (chuyển đổi lead), Sản xuất video (nội dung).' },
  { ma: 'HC', ten: 'Phòng Hành chính', truongPhong: 'R04',
    nhiemVu: 'Quản lý hồ sơ, hợp đồng, cơ sở vật chất, và hành chính nội bộ.',
    quyenHan: ['Quản lý hồ sơ nhân sự', 'Ký hợp đồng nội bộ', 'Quản lý tài sản'],
    kpi: ['Hồ sơ đầy đủ 100%', 'Thời gian xử lý hành chính < 24 giờ', 'Sai sót hợp đồng = 0'],
    quyTrinh: ['Tiếp nhận → phân loại → xử lý → lưu trữ'],
    huongDan: 'Phối hợp với Tài chính (hợp đồng), Thanh tra (tuân thủ).' },
  { ma: 'KD', ten: 'Phòng Kinh doanh', truongPhong: 'R05',
    nhiemVu: 'Chuyển đổi lead, tư vấn gói, chốt hợp đồng, và chăm sóc khách tiềm năng.',
    quyenHan: ['Xem CRM', 'Tạo cơ hội bán hàng', 'Đề xuất giảm giá', 'Chốt ký'],
    kpi: ['Tỷ lệ chốt ≥ 25%', 'Doanh thu đạt mục tiêu tháng', 'Thời gian chốt ≤ 14 ngày'],
    quyTrinh: ['Lead → tư vấn → báo giá → đàm phán → chốt → onboarding'],
    huongDan: 'Phối hợp với Marketing (lead), CSKH (chăm sóc sau bán), Tài chính (thanh toán).' },
  { ma: 'DT', ten: 'Phòng Đào tạo', truongPhong: 'R05',
    nhiemVu: 'Đào tạo nhân sự, coach, giáo viên, và xây dựng lộ trình năng lực.',
    quyenHan: ['Thiết kế khóa đào tạo', 'Đánh giá năng lực', 'Cấp chứng nhận'],
    kpi: ['Nhân sự hoàn thành đào tạo ≥ 90%', 'Điểm đánh giá sau đào tạo ≥ 80%', 'Thời gian lên bậc giảm 20%'],
    quyTrinh: ['Đánh giá nhu cầu → thiết kế → đào tạo → sát hạch → cấp chứng chỉ'],
    huongDan: 'Phối hợp với R&D (nội dung), Kinh doanh (kiến thức bán hàng), Kỹ thuật (nền tảng).' },
  { ma: 'KT', ten: 'Phòng Kỹ thuật', truongPhong: 'R04',
    nhiemVu: 'Vận hành hệ thống, bảo mật, triển khai, và hỗ trợ kỹ thuật.',
    quyenHan: ['Quản lý máy chủ', 'Triển khai release', 'Xử lý sự cố', 'Giám sát bảo mật'],
    kpi: ['Uptime ≥ 99.9%', 'Thời gian phản hồi sự cố < 1 giờ', 'Lỗi bảo mật = 0'],
    quyTrinh: ['Giám sát → cảnh báo → xử lý → báo cáo'],
    huongDan: 'Phối hợp với AI (mô hình), Sản xuất video (công cụ), Thanh tra (audit).' },
  { ma: 'DA', ten: 'Phòng Dự án', truongPhong: 'R05',
    nhiemVu: 'Quản lý dự án đặc biệt, triển khai theo mốc, và phối hợp đa phòng ban.',
    quyenHan: ['Lập kế hoạch dự án', 'Phân bổ nguồn lực', 'Theo dõi tiến độ'],
    kpi: ['Dự án đúng hạn ≥ 90%', 'Ngân sách không vượt ±5%', 'Stakeholder hài lòng ≥ 4/5'],
    quyTrinh: ['Khởi động → lập kế hoạch → thực hiện → giám sát → bàn giao'],
    huongDan: 'Phối hợp tất cả các phòng ban theo từng dự án.' },
  { ma: 'AI', ten: 'Phòng Trí tuệ nhân tạo', truongPhong: 'R04',
    nhiemVu: 'Phát triển Agent, chatbot, mô hình AI, và kiểm soát an toàn AI.',
    quyenHan: ['Huấn luyện/triển khai mô hình', 'Cấp quyền năng AI', 'Giám sát đầu ra AI'],
    kpi: ['Độ chính xác chatbot ≥ 85%', 'Thời gian phản hồi < 2 giây', 'Lỗi vi phạm an toàn = 0'],
    quyTrinh: ['Yêu cầu → dữ liệu → huấn luyện → kiểm thử → triển khai → giám sát'],
    huongDan: 'Phối hợp với Kỹ thuật (hạ tầng), R&D (nội dung), Thanh tra (tuân thủ).' },
  { ma: 'VD', ten: 'Phòng Sản xuất video', truongPhong: 'R05',
    nhiemVu: 'Sản xuất video, Seedance prompts, storyboard, voiceover, và thumbnail.',
    quyenHan: ['Sản xuất nội dung video', 'Quản lý kho video', 'Xuất bản video'],
    kpi: ['4 video/tuần', 'Chất lượng đạt chuẩn ≥ 95%', 'Lượt xem trung bình/tăng 20%/năm'],
    quyTrinh: ['Kịch bản → quay/dựng → duyệt → xuất → đăng → đo lường'],
    huongDan: 'Phối hợp với Marketing (nội dung), AI (Seedance prompts).' },
  { ma: 'CS', ten: 'Phòng Chăm sóc khách hàng', truongPhong: 'R05',
    nhiemVu: 'Hỗ trợ khách hàng, xử lý khiếu nại, chăm sóc sau bán, và giữ chân.',
    quyenHan: ['Xem hồ sơ khách', 'Ghi chú chăm sóc', 'Đề xuất hoàn tiền/miễn giảm'],
    kpi: ['Thời gian phản hồi < 2 giờ', 'Tỷ lệ hài lòng ≥ 90%', 'Tỷ lệ churn < 5%/tháng'],
    quyTrinh: ['Tiếp nhận → phân loại → xử lý → theo dõi → đóng ticket'],
    huongDan: 'Phối hợp với Kinh doanh (upsell), Tài chính (hoàn tiền).' },
  { ma: 'TT', ten: 'Phòng Thanh tra', truongPhong: 'R01',
    nhiemVu: 'Giám sát tuân thủ, kiểm toán, xử lý vi phạm, và bảo vệ hiến pháp.',
    quyenHan: ['Kiểm toán mọi phòng ban', 'Yêu cầu báo cáo', 'Đình chỉ quyền khi vi phạm'],
    kpi: ['Số vi phạm giảm 20%/năm', 'Audit định kỳ 100%', 'Thời gian xử lý khiếu nại < 48 giờ'],
    quyTrinh: ['Lập kế hoạch audit → thu thập bằng chứng → đánh giá → báo cáo → khắc phục'],
    huongDan: 'Báo cáo trực tiếp Super Admin; độc lập với các phòng ban khác.' }
];

/** Liệt kê phòng ban và KPI. */
export async function dsPhongBan(y, env, db, hoSo) {
  if (!laNguoiNha(hoSo)) return { ok: false, code: 'NOPERM' };
  return { ok: true, ds: PHONG_BAN };
}

/** Chi tiết một phòng ban. */
export async function chiTietPhongBan(y, env, db, hoSo) {
  if (!laNguoiNha(hoSo)) return { ok: false, code: 'NOPERM' };
  const ma = String(y.ma || '').trim().toUpperCase();
  const pb = PHONG_BAN.find(p => p.ma === ma);
  if (!pb) return { ok: false, error: 'Không tìm thấy phòng ban.' };
  return { ok: true, pb };
}

/** Gán nhân sự vào phòng ban (chỉ R01/R02). */
export async function ganPhongBan(y, env, db, hoSo) {
  if (hoSo.role !== 'R01') return { ok: false, code: 'NOPERM',   /* V50·168: cấp quyền 100% do Super Admin */
    error: 'Chỉ Super Admin gán phòng ban.' };
  const username = String(y.username || '').trim().toLowerCase();
  const maPB = String(y.maPB || '').trim().toUpperCase();
  if (!PHONG_BAN.find(p => p.ma === maPB))
    return { ok: false, error: 'Phòng ban không hợp lệ.' };

  /* Bảng users không có cột capNhatLuc — cột đúng là updatedAt (lỗi cũ làm cửa này luôn hỏng). */
  await db.prepare('UPDATE users SET phongBan = ?, updatedAt = ? WHERE username = ?')
    .bind(maPB, new Date().toISOString(), username).run();
  await Kho.ghiNhatKy(db, { uid: hoSo.uid, username: hoSo.u,
    viec: 'GAN_PHONG_BAN', doiTuong: username, chiTiet: maPB });
  return { ok: true, username, maPB };
}

/** Báo cáo KPI tổng hợp; không giả lập số đo khi chưa có nguồn dữ liệu. */
export async function baoCaoKpiPhongBan(y, env, db, hoSo) {
  if (bacVai(hoSo) > 3) return { ok: false, code: 'NOPERM' };
  const ketQua = PHONG_BAN.map(pb => ({
    ma: pb.ma, ten: pb.ten, kpi: pb.kpi,
    tienDo: null, trangThai: 'chua-co-nguon-do'
  }));
  return { ok: true, ds: ketQua,
    ghiChu: 'Các KPI hiện là mục tiêu; chưa có nguồn số liệu xác thực để báo tiến độ.' };
}
