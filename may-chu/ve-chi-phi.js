/* ═══════════════════════════════════════════════════════════════
   GITA 365 · VỆ CHI PHÍ — CHẶN "BILL SHOCK" Ở CỬA WORKER

   Đây là lớp RẺ NHẤT, đứng TRƯỚC mọi lần đọc/ghi D1: một vòng lặp lỗi
   ở máy khách, một tab treo gọi liên hồi, hay một kẻ dò mật khẩu — đều
   bị cắt ở đây mà KHÔNG tốn thêm lượt D1/R2 nào.

   HAI TẦNG, CẢ HAI ĐỀU KHÔNG GHI D1:

     1. Bộ đếm trong bộ nhớ của isolate (cửa sổ trượt 60 giây). Miễn phí,
        không mạng. Mỗi isolate đếm riêng nên KHÔNG phải hàng rào an ninh
        — kẻ tấn công rải qua nhiều isolate vẫn lọt; hàng rào an ninh vẫn
        là Kho.demNhip (đếm trong D1) ở từng việc nhạy cảm. Tầng này chỉ
        chặn vòng lặp và cú dồn dập từ MỘT máy — đúng thứ gây bill shock.
     2. Rate Limiting binding của Cloudflare (env.GIOI_HAN) NẾU có khai ở
        wrangler.toml. Đếm theo vị trí Cloudflare, không tốn lượt D1. Không
        khai thì bỏ qua — bản miễn phí vẫn chạy đủ.

   CHẾ ĐỘ TIẾT KIỆM: đặt biến GITA_CHE_DO_TIET_KIEM = "1" khi sắp chạm hạn
   mức miễn phí → các việc gọi AI trả phí theo lượt tạm đóng, các việc
   thường giữ nguyên (xem VIEC_TRA_PHI). Đổi biến là có hiệu lực, không cần sửa mã.
   ═══════════════════════════════════════════════════════════════ */

/* Việc gọi dịch vụ AI TRẢ PHÍ bên ngoài (fal.ai, OpenAI…) — hạn chặt hơn. */
export const VIEC_AI = new Set([
  'phimGuiViec', 'hoiChatbot', 'hoiTroLyTaiChinh', 'crmTroLy', 'crmDieuPhoiAI',
  'aiPhanLoai', 'aiSoanNhap', 'aiTongHopGiamSat', 'soanDeBaiNgoai',
  'sinhNoiDungKenh', 'traLoiCoach', 'dieuPhoiTroLy', 'chayBuocAgent',
  'hoiDaTri', 'hoiDongDaTri', 'boSungGiaiPhap', 'thuMauDaTri', 'canhMauDaTri'
]);

/* Trong số đó, việc CHẮC CHẮN gọi ra nhà cung cấp tính tiền theo lượt
   (fal.ai ở phim-ai.js, OpenAI ở quyen-nang-ai.js) — chế độ tiết kiệm
   chỉ đóng nhóm này, các trợ lý chạy luật nội bộ vẫn mở. */
export const VIEC_TRA_PHI = new Set([
  'phimGuiViec', 'aiPhanLoai', 'aiSoanNhap', 'aiTongHopGiamSat', 'soanDeBaiNgoai', 'thuMauDaTri'
]);

/* Việc KHÔNG cần phiên, dễ bị dò — đếm theo IP. */
export const VIEC_CUA = new Set([
  'dangNhap', 'dangNhapMatBatDau', 'dangNhapMatXong', 'dangKy', 'guiLaiOtp',
  'xacThucOtp', 'kichHoat', 'quenMatKhau', 'datLaiMatKhau', 'taoAdminDau', 'guiLienHe'
]);

/* Hạn mỗi 60 giây cho MỘT người/IP trong MỘT isolate. Người dùng thật
   không bao giờ chạm: app gọi vài lượt mỗi phút là nhiều. */
export const HAN_PHUT = {cua: 20, ai: 12, thuong: 120};

const CUA_SO_MS = 60e3;
const TOI_DA_KHOA = 5000;           // trần bộ nhớ: quá thì dọn khoá cũ nhất
const bang = new Map();             // khoa → {dau, n}

export function loaiViec(fn) {
  if (VIEC_CUA.has(fn)) return 'cua';
  if (VIEC_AI.has(fn)) return 'ai';
  return 'thuong';
}

function ipCua(req) {
  const h = req && req.headers;
  return (h && h.get('CF-Connecting-IP')) || 'khong-ro';
}

/* Khoá đếm: việc cửa theo IP (chưa có tài khoản), việc khác theo tài khoản
   (u) nếu có, không thì theo IP. Không lưu token — chỉ tên đăng nhập. */
export function khoaDem(fn, y, req) {
  const loai = loaiViec(fn);
  const ai = loai === 'cua' || !y || !y.u ? 'ip:' + ipCua(req) : 'u:' + String(y.u).slice(0, 80).toLowerCase();
  return loai + '|' + ai;
}

function demBoNho(khoa, han, bayGio) {
  let o = bang.get(khoa);
  if (!o || bayGio - o.dau >= CUA_SO_MS) {
    if (!o && bang.size >= TOI_DA_KHOA) {
      /* Map giữ thứ tự chèn — xoá 10% khoá cũ nhất. */
      let xoa = Math.ceil(TOI_DA_KHOA / 10);
      for (const k of bang.keys()) { bang.delete(k); if (--xoa <= 0) break; }
    }
    o = {dau: bayGio, n: 0};
    bang.set(khoa, o);
  }
  o.n++;
  return o.n <= han ? 0 : Math.max(1, Math.ceil((o.dau + CUA_SO_MS - bayGio) / 1000));
}

/* Trả null nếu cho qua; trả khối lỗi {ok:false, code, ...} nếu chặn. */
export async function veChiPhi(fn, y, env, req, bayGio) {
  const loai = loaiViec(fn);
  if (VIEC_TRA_PHI.has(fn) && env && String(env.GITA_CHE_DO_TIET_KIEM || '') === '1') {
    return {ok: false, code: 'TIETKIEM', thuLaiSau: 3600,
      error: 'Tính năng AI tạm nghỉ để giữ hệ thống trong hạn mức. Các phần khác vẫn dùng bình thường.'};
  }
  /* Không có CF-Connecting-IP nghĩa là không chạy sau mạng Cloudflare
     (kiểm thử cục bộ gọi thẳng worker.fetch) — không đếm, để bộ thử
     hàng trăm lượt không bị chặn nhầm. Trên Cloudflare header này luôn có. */
  if (!(req && req.headers && req.headers.get('CF-Connecting-IP'))) return null;
  const khoa = khoaDem(fn, y, req);
  const cho = demBoNho(khoa, HAN_PHUT[loai], bayGio || Date.now());
  if (cho) return {ok: false, code: 'RATE', thuLaiSau: cho,
    error: 'Bạn thao tác quá nhanh. Thử lại sau ' + cho + ' giây.'};

  if (env && env.GIOI_HAN && typeof env.GIOI_HAN.limit === 'function') {
    try {
      const r = await env.GIOI_HAN.limit({key: khoa});
      if (r && r.success === false) return {ok: false, code: 'RATE', thuLaiSau: 60,
        error: 'Bạn thao tác quá nhanh. Thử lại sau ít phút.'};
    } catch (e) { /* binding hỏng thì KHÔNG chặn người dùng thật */ }
  }
  return null;
}

/* Mã yêu cầu ngắn — trả ở header x-gita-ma và trong lỗi 500, ghi cùng dòng
   console.error. Người dùng chép mã này gửi hỗ trợ là tìm được đúng dòng
   nhật ký Worker (wrangler tail / Workers Logs), khỏi đoán. */
export function maYeuCau(req) {
  const ray = req && req.headers && req.headers.get('cf-ray');
  if (ray) return ray.split('-')[0];
  const b = new Uint8Array(8);
  crypto.getRandomValues(b);
  return Array.from(b, x => x.toString(16).padStart(2, '0')).join('');
}

/* Chỉ dùng cho kiểm thử. */
export function _xoaBoDem() { bang.clear(); }
