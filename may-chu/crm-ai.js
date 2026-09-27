/* ═══════════════════════════════════════════════════════════════
   GITA 365 — MƯỜI TRỢ LÝ AI CRM + MỘT AI TÀI CHÍNH  (9.99.172)

   Chủ hệ: "10 trợ lý AI chuyên xử lý cùng AI tài chính để hệ thống CRM
   hoàn hảo nhất." Đây là TẦNG ĐIỀU PHỐI cho CRM — dựng theo đúng lối
   dieu-phoi.js (9.99.107·110) đã qua soi đối kháng, vì lối ấy là lối
   DUY NHẤT một tầng trợ lý AI không biến thành tấm áp phích:

   1. Mỗi trợ lý TRỎ vào MỘT CỬA CÓ THẬT (đã có cổng riêng), KHÔNG dựng
      cửa mới, KHÔNG thêm quyền nào. Trợ lý "sàng khách mới" chạy đúng
      crmDanhSach — và crmDanhSach vẫn đòi quyền CRM như thường. AI giúp
      VẬN HÀNH, cổng KHÔNG đổi.
   2. Điều phối CHỈ trả BẢN KẾ HOẠCH (trợ lý nào · cửa nào · cổng nào)
      rồi DỪNG. Nó KHÔNG tự ghi gì (không INSERT/UPDATE, không gọi một
      cửa ghi). Nếu nó chạy việc thay thì nó đi vòng qua mọi cổng — thành
      cửa hậu. Việc thật vẫn gọi đúng cửa ấy, cửa ấy tự kiểm cổng.
   3. Cửa trong kế hoạch được đối chiếu với DANH SÁCH CỬA THẬT của worker
      (CAN_PHIEN) TRƯỚC khi trả — cửa lạ → KHONGCUA. Không có danh sách
      → đóng, không đoán. Đây là phép đo HÀNH VI đỏ được (bài học 9.99.110:
      một tính năng chỉ THẬT khi một phép đo đỏ được trên sự rỗng).
   4. KHÔNG chép hiến pháp/hàng rào vào CRM_AI — bản thứ hai của một BẢNG
      CẤM là bản nguy nhất (9.99.83). Mỗi trợ lý đi qua cửa thật, cửa
      thật đã cắm mọi cổng (Điều 13, ba chữ ký, quyền CRM…).
   5. "Mạnh hơn ×N" là LỜI KHAI, không phải chỉ tiêu (9.99.86): CRM_AI
      KHÔNG mang một ô SỐ nào tự xưng năng lực/hệ số. Sức mạnh thật là
      mười một việc chi tiết chạy dưới điều phối, không phải một con số.
   ═══════════════════════════════════════════════════════════════ */
'use strict';

import { Kho } from './nen.js';

const BAC = {R01:1,R02:2,R03:3,R04:4,R05:5,R06:6,R07:7,R08:8,
  R09:9,R10:10,R11:11,R12:12,R13:13,R14:14,R15:15};

/* MƯỜI trợ lý CRM + MỘT AI tài chính. Mỗi trợ lý: một CỬA THẬT (khoá sở
   hữu) + cổng cửa ấy tự kiểm. `nhom:'taichinh'` đánh dấu AI tài chính —
   đúng MỘT cái. Cột `cong` chỉ MÔ TẢ cổng cửa ấy đã có (để hiện cho
   người đọc), KHÔNG phải một cổng thứ hai dựng ở đây. */
export const CRM_AI = [
  {ma: 'AIC01', ten: 'Sàng khách mới',        viec: 'Lọc nhà mới quan tâm, xếp theo chặng', cua: 'crmDanhSach',      nhom: 'crm',      cong: 'quyền CRM (xem)'},
  {ma: 'AIC02', ten: 'Buồng lái phễu',        viec: 'Tổng hợp phễu · hẹn quá hạn · doanh thu', cua: 'crmBangDieuKhien', nhom: 'crm',   cong: 'quyền CRM (xem)'},
  {ma: 'AIC03', ten: 'Hồ sơ 360 một nhà',     viec: 'Gom trọn một nhà: liên hệ · chạm · thu', cua: 'crmChiTiet',      nhom: 'crm',      cong: 'quyền CRM + chỉ nhà của mình · ghi nhật ký'},
  {ma: 'AIC04', ten: 'Xếp chặng · cập nhật',  viec: 'Đề xuất đổi chặng, hẹn tiếp cho nhà phụ trách', cua: 'crmGhiKhach', nhom: 'crm',  cong: 'quyền CRM (sửa) · gán phụ trách chỉ quản lý'},
  {ma: 'AIC05', ten: 'Sổ quyền CRM',          viec: 'Ai đang có quyền CRM, mức nào',        cua: 'dsQuyenCRM',      nhom: 'crm',      cong: 'R01–R03 đọc'},
  {ma: 'AIC06', ten: 'Phân loại phản hồi',    viec: 'Xếp loại phản hồi khách vào sổ phát sinh', cua: 'ghiPhatSinh',   nhom: 'crm',      cong: 'quyền vận hành · vào staging'},
  {ma: 'AIC07', ten: 'Soạn nội dung lấp kho', viec: 'Soạn bản nháp khi kho rỗng lúc tư vấn', cua: 'soanBanNhap',     nhom: 'crm',      cong: 'ba chữ ký mới 入库 · dẫn nguồn'},
  {ma: 'AIC08', ten: 'Công nợ khách',         viec: 'Nhà nào còn nợ, thu tới đâu',          cua: 'congNo',          nhom: 'crm',      cong: 'quyền tài chính đọc'},
  {ma: 'AIC09', ten: 'Nhắc thu đến hạn',      viec: 'Kỳ thu tới hạn mà chưa trả',           cua: 'denHenChuaTra',   nhom: 'crm',      cong: 'quyền tài chính đọc'},
  {ma: 'AIC10', ten: 'Nhịp chăm sóc',         viec: 'Sổ chạm theo nhịp, đèn nhà nào cần chạm', cua: 'doSoCham',      nhom: 'crm',      cong: 'quyền vận hành chăm sóc'},
  {ma: 'AIC-TC', ten: 'AI tài chính',         viec: 'Bảy con số CEO gắn vào sức khoẻ CRM',  cua: 'bayConSoCEO',     nhom: 'taichinh', cong: 'R01–R03 tài chính'},
  /* BA NHÀ KHOA HỌC ĐỒNG HÀNH — mỗi người TRỎ vào một hệ chuyên sâu ĐÃ
     CÓ, đi qua cổng của hệ ấy. CRM không dựng lại bộ tạo ảnh, bộ tối ưu,
     hay bộ lọc ngôn từ — nó MỜI ba hệ ấy vào làm việc. */
  {ma: 'AIC-HA', ten: 'Nhà thiết kế hình ảnh CRM', viec: 'Thiết kế hình ảnh marketing cho CRM qua Agent hình ảnh', cua: 'deXuatThiGiac', nhom: 'khoahoc', cong: 'Điều Nhỏ + Điều 13 (không tên trẻ ra ngoài) + bộ lọc QC marketing'},
  {ma: 'AIC-TO', ten: 'Nhà khoa học toán — tối ưu CRM', viec: 'Phương thức tối ưu cấu hình · phân bổ nguồn lực CRM', cua: 'toiUuGoi',    nhom: 'khoahoc', cong: 'ràng buộc cứng · hàm mục tiêu Hiến pháp (9.99.68)'},
  {ma: 'AIC-NN', ten: 'Nhà khoa học ngôn ngữ — chuẩn ngôn từ', viec: 'Định hướng ngôn từ CRM theo chuẩn quy định', cua: 'soatTiepThi',   nhom: 'khoahoc', cong: 'bộ lọc 7 mục · QC từ tuyệt đối · cam kết · số không nguồn'}
];

export const CRM_AI_LUAT = [
  {ma: 'CA1', luat: 'Mỗi trợ lý TRỎ một cửa CÓ THẬT — không dựng cửa mới, không thêm quyền',
    tro: 'dieu-phoi.js 9.99.107'},
  {ma: 'CA2', luat: 'Điều phối chỉ trả KẾ HOẠCH rồi DỪNG — không tự ghi, không gọi cửa ghi',
    tro: 'chống cửa hậu · dieu-phoi 9.99.110'},
  {ma: 'CA3', luat: 'Cửa trong kế hoạch đối chiếu danh sách cửa THẬT; cửa lạ → KHONGCUA; không danh sách → đóng',
    tro: 'phép đo hành vi đỏ được 9.99.110'},
  {ma: 'CA4', luat: 'Mỗi trợ lý đi qua CỔNG của cửa nó trỏ — Điều 13, ba chữ ký, quyền CRM đều ở cửa thật',
    tro: 'không bản thứ hai của bảng cấm 9.99.83'},
  {ma: 'CA5', luat: 'Không con số nào tự xưng năng lực/hệ số — "mạnh hơn ×N" là lời khai, không chỉ tiêu',
    tro: 'SUP-01 9.99.86'},
  {ma: 'CA6', luat: 'Ba nhà khoa học (hình ảnh · toán · ngôn ngữ) MỜI hệ chuyên sâu ĐÃ CÓ vào làm — ' +
    'không dựng lại bộ tạo ảnh, bộ tối ưu hay bộ lọc ngôn từ; hình marketing đi qua Điều 13 + QC',
    tro: 'kien-truc-thi-giac · toi-uu-goi 9.99.68 · noi-dung-tiep-thi 9.99.65'}
];

function laNhanSu(hoSo) { return (BAC[hoSo.role] || 99) <= 12; }

/* ── DANH SÁCH TRỢ LÝ + ĐỐI CHIẾU CỬA THẬT ──
   Đọc-thuần. Trả roster kèm cờ cửa-có-thật (đối chiếu danhSachCua =
   CAN_PHIEN của worker). Nhân sự (R01–R12) đọc được; khách thì không —
   không phải vì roster nhạy cảm, mà vì nó là công cụ vận hành nội bộ. */
export async function crmTroLy(y, env, db, hoSo, danhSachCua) {
  if (!laNhanSu(hoSo))
    return {ok: false, code: 'NOPERM', error: 'Trợ lý AI CRM là công cụ vận hành của nhân sự.'};
  const co = Array.isArray(danhSachCua) ? danhSachCua : [];
  const ds = CRM_AI.map(t => ({ma: t.ma, ten: t.ten, viec: t.viec, cua: t.cua,
    nhom: t.nhom, cong: t.cong, coCua: co.indexOf(t.cua) >= 0}));
  const cuaLa = ds.filter(t => !t.coCua).map(t => t.ma + '→' + t.cua);
  return {ok: true, troLy: ds, luat: CRM_AI_LUAT,
    soTroLy: CRM_AI.length,
    soTaiChinh: CRM_AI.filter(t => t.nhom === 'taichinh').length,
    soKhoaHoc: CRM_AI.filter(t => t.nhom === 'khoahoc').length,
    cuaLa,
    vi: 'Mười trợ lý CRM + một AI tài chính. Mỗi trợ lý TRỎ một cửa có thật và đi qua ' +
        'cổng của cửa ấy — AI giúp vận hành, cổng không đổi. Điều phối chỉ lập kế hoạch, ' +
        'không tự ra tay.'};
}

/* ── ĐIỀU PHỐI: LẬP KẾ HOẠCH RỒI DỪNG ──
   Nhận y.tro (mã trợ lý) HOẶC y.viec (mô tả). Trả bản kế hoạch: trợ lý
   nào, cửa nào, cổng nào áp. KHÔNG chạy việc — việc thật gọi đúng cửa ấy
   (client hoặc một lượt gọi sau), cửa ấy tự kiểm cổng.

   Cửa được đối chiếu với danhSachCua (CAN_PHIEN THẬT) TRƯỚC khi trả:
     - không danhSachCua        → đóng (không đoán)
     - trợ lý không có           → KHONGTRO
     - cửa của trợ lý không thật → KHONGCUA (echo cũ sẽ trả 'ok' → phép đo đỏ) */
export async function crmDieuPhoiAI(y, env, db, hoSo, danhSachCua) {
  if (!laNhanSu(hoSo))
    return {ok: false, code: 'NOPERM', error: 'Điều phối trợ lý AI CRM là việc của nhân sự.'};
  if (!Array.isArray(danhSachCua) || !danhSachCua.length)
    return {ok: false, code: 'KHONGDS',
      error: 'Không có danh sách cửa thật để đối chiếu — đóng, không đoán.'};

  const ma = String(y.tro || '').trim();
  const tro = CRM_AI.filter(t => t.ma === ma)[0];
  if (!tro)
    return {ok: false, code: 'KHONGTRO',
      error: 'Không có trợ lý mã "' + ma + '". Xem danh sách ở crmTroLy.'};

  if (danhSachCua.indexOf(tro.cua) < 0)
    return {ok: false, code: 'KHONGCUA', tro: tro.ma, cua: tro.cua,
      error: 'Trợ lý ' + tro.ma + ' trỏ cửa "' + tro.cua + '" KHÔNG có trong danh sách cửa thật.'};

  /* KẾ HOẠCH — không chạy việc. Ghi nhật ký lượt điều phối (đọc-thuần,
     một dòng audit không phải một lượt GHI nghiệp vụ). */
  await Kho.ghiNhatKy(db, {uid: hoSo.uid, username: hoSo.u, viec: 'CRMAI_DIEUPHOI',
    doiTuong: tro.ma, chiTiet: 'trỏ cửa ' + tro.cua});

  return {ok: true, keHoach: {
    tro: tro.ma, ten: tro.ten, viec: tro.viec, cua: tro.cua, nhom: tro.nhom, cong: tro.cong},
    vi: 'Kế hoạch: gọi cửa "' + tro.cua + '" để làm việc "' + tro.viec + '". Cổng của cửa ấy ' +
        '(' + tro.cong + ') vẫn kiểm như thường — điều phối KHÔNG chạy thay, chỉ chỉ đường.'};
}
