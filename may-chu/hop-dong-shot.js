/* ═══════════════════════════════════════════════════════════════
   GITA 365 · HỢP ĐỒNG SHOT (shot contract) — xưởng phim AI
   Kiểm tra chặt một shot spec trước khi ước tính/submit. Thuần ESM,
   không phụ thuộc ngoài, chạy được cả trong Worker lẫn Node (test).

   Nguyên tắc (chỉ dẫn 04/10/2026):
   - actions là CHỈ DẪN + tiêu chí QA, không tuyên bố model điều
     khiển chính xác.
   - Capability "unknown" KHÔNG được coi là "supported".
   - Thiếu năng lực → route thay thế hoặc BLOCKED_UNSUPPORTED_CAPABILITY,
     không âm thầm giảm xuống ảnh chuyển động.
   ═══════════════════════════════════════════════════════════════ */
'use strict';

/* Sổ năng lực THẬT của xưởng GITA365 (cập nhật khi có bằng chứng live).
   trangThai: 'da-xac-minh' (có chứng cứ chạy thật) | 'chua-xac-minh'
   | 'bi-chan' (route thay thế bắt buộc). Không ghi 'da-xac-minh' khi
   chưa có request/job id chứng minh. */
export const NANG_LUC = {
  reference_identity: {
    trangThai: 'da-xac-minh',
    bangChung: 'FLUX.2 klein 4B multipart input_image_0..3; phim mẫu mau-gita-365 v4 giữ 1 gương mặt xuyên 4 cảnh (xác minh mắt 04/10/2026)',
    gioiHan: 'Tối đa 4 ảnh tham chiếu/lần vẽ — cảnh 5 người phải dựng tổ hợp cận + rộng, không nhét đủ 5 ref vào một shot.'
  },
  video_motion_reference: {
    trangThai: 'chua-xac-minh',
    bangChung: '',
    gioiHan: 'Chưa có provider performance-transfer được xác minh; tạm dùng LTX-Video I2V cho chuyển động NHẸ (bước/quay đầu/giơ tay ~2 giây) đã chạy thật trên Kaggle T4.'
  },
  chuyen_dong_nhe: {
    trangThai: 'da-xac-minh',
    bangChung: 'LTX-Video 65 khung 24fps trên Kaggle T4 qua hàng chờ quay_viec loai vd (chủ hệ xác nhận: bước nhẹ/quay đầu/giơ tay chạy được)',
    gioiHan: 'Clip ~2.7 giây; chạy/đánh/nhảy KHÔNG đạt (máy chỉ rung nhẹ).'
  },
  lip_sync: {
    trangThai: 'da-xac-minh',
    bangChung: 'SadTalker trên máy GitHub Actions qua quay_viec loai moi (chủ hệ xác nhận: cảnh nói mấp máy môi khớp lời)',
    gioiHan: 'Cần stem WAV tiếng Việt làm sẵn; máy chủ chưa tự tổng hợp giọng (TTS).'
  },
  multi_person_contact: {
    trangThai: 'bi-chan',
    bangChung: '',
    gioiHan: 'Chưa có provider nào xác minh được chạm/trao đồ nhiều người → BLOCKED_UNSUPPORTED_CAPABILITY; route: video diễn mẫu người thật hoặc animatic 3D.'
  },
  crowd_wide: {
    trangThai: 'bi-chan',
    bangChung: '',
    gioiHan: 'Không nghiệm thu đám đông bằng prompt; route: footage/diễn mẫu/cảnh rộng + cận cảnh.'
  },
  audio_dialogue: {
    trangThai: 'chua-xac-minh',
    bangChung: '',
    gioiHan: 'Thiếu TTS tiếng Việt nội bộ (0đ: edge-tts trên máy Kaggle/GitHub — chưa đấu nối). Thoại hiện là phụ đề.'
  }
};

const KHUNG_HINH = ['16:9', '9:16', '1:1', '4:3'];
const MAY_FRAMING = ['wide', 'full', 'medium', 'medium_two_shot', 'close_up', 'extreme_close_up'];
const MAY_MOTION = ['locked', 'handheld', 'gimbal', 'crane', 'tracking', 'orbit', 'pov'];
const RE_ID = /^[a-z0-9][a-z0-9_-]{1,60}$/;

function loi(ds, ma, noi) { ds.push({ ma, noi }); }

function soNguyenDuong(x) { return Number.isFinite(x) && Math.floor(x) === x && x > 0; }

/* Soát một shot spec. Trả { ok, loi: [{ma, noi}] } — KHÔNG ném lỗi,
   để API trả 400 với danh sách lỗi đầy đủ một lần. */
export function soatShot(spec) {
  const ds = [];
  const s = (spec && typeof spec === 'object') ? spec : {};
  if (!RE_ID.test(String(s.shotId || ''))) loi(ds, 'SHOT_ID', 'shotId thiếu hoặc sai dạng (a-z0-9_-, tối thiểu 2 ký tự).');
  if (!soNguyenDuong(s.revision)) loi(ds, 'REVISION', 'revision phải là số nguyên dương.');
  if (!soNguyenDuong(s.durationMs) || s.durationMs < 1000 || s.durationMs > 15000)
    loi(ds, 'THOI_LUONG', 'durationMs phải từ 1000 đến 15000 (một shot không kéo dài vô hạn — sai mặt tích lũy).');
  const fps = s.fps || {};
  if (!soNguyenDuong(fps.num) || !soNguyenDuong(fps.den)) loi(ds, 'FPS', 'fps phải là rational {num, den} nguyên dương — cấm float gây trôi nhịp.');
  if (KHUNG_HINH.indexOf(s.aspectRatio) < 0) loi(ds, 'KHUNG', 'aspectRatio phải là một trong ' + KHUNG_HINH.join('/') + '.');
  if (!RE_ID.test(String(s.locationRevisionId || ''))) loi(ds, 'DIA_DIEM', 'locationRevisionId thiếu — bối cảnh phải là một revision được duyệt.');

  const nhanVat = Array.isArray(s.characters) ? s.characters : [];
  if (!nhanVat.length || nhanVat.length > 8) loi(ds, 'NHAN_VAT', 'characters cần 1–8 người.');
  const idNV = new Set();
  nhanVat.forEach((c, i) => {
    const t = 'characters[' + i + ']';
    if (!RE_ID.test(String(c && c.characterId || ''))) loi(ds, 'NHAN_VAT', t + ': characterId thiếu/sai dạng.');
    else idNV.add(c.characterId);
    if (!RE_ID.test(String(c && c.referenceSetId || ''))) loi(ds, 'THAM_CHIEU', t + ': referenceSetId thiếu — seed không phải bảo đảm danh tính, bắt buộc bộ tham chiếu được duyệt.');
    if (!RE_ID.test(String(c && c.outfitId || ''))) loi(ds, 'TRANG_PHUC', t + ': outfitId thiếu.');
  });

  const cam = s.camera || {};
  if (MAY_FRAMING.indexOf(cam.framing) < 0) loi(ds, 'MAY_QUAY', 'camera.framing phải là ' + MAY_FRAMING.join('/') + '.');
  if (MAY_MOTION.indexOf(cam.movement) < 0) loi(ds, 'MAY_QUAY', 'camera.movement phải là ' + MAY_MOTION.join('/') + '.');

  const trong = (ms) => soNguyenDuong(ms) || ms === 0;
  (Array.isArray(s.actions) ? s.actions : []).forEach((a, i) => {
    const t = 'actions[' + i + ']';
    if (!idNV.has(String(a && a.actorId || ''))) loi(ds, 'HANH_DONG', t + ': actorId không thuộc characters của shot.');
    if (!a || !a.verb) loi(ds, 'HANH_DONG', t + ': thiếu verb.');
    if (!trong(a && a.startMs) || !soNguyenDuong(a && a.endMs) || a.endMs <= a.startMs)
      loi(ds, 'HANH_DONG', t + ': startMs/endMs không hợp lệ.');
    else if (soNguyenDuong(s.durationMs) && a.endMs > s.durationMs)
      loi(ds, 'HANH_DONG', t + ': hành động vượt quá durationMs.');
    if (a && a.targetId && !idNV.has(String(a.targetId))) loi(ds, 'HANH_DONG', t + ': targetId không thuộc characters.');
  });

  (Array.isArray(s.dialogues) ? s.dialogues : []).forEach((d, i) => {
    const t = 'dialogues[' + i + ']';
    if (!idNV.has(String(d && d.characterId || ''))) loi(ds, 'THOAI', t + ': characterId không thuộc characters — cấm một khuôn mặt nói thay cả nhóm.');
    if (!d || !String(d.text || '').trim()) loi(ds, 'THOAI', t + ': thiếu text.');
    if (!trong(d && d.startMs) || !soNguyenDuong(d && d.endMs) || d.endMs <= d.startMs)
      loi(ds, 'THOAI', t + ': startMs/endMs không hợp lệ.');
    else if (soNguyenDuong(s.durationMs) && d.endMs > s.durationMs)
      loi(ds, 'THOAI', t + ': lời thoại vượt quá durationMs.');
  });

  (Array.isArray(s.requiredCapabilities) ? s.requiredCapabilities : []).forEach((c) => {
    if (!NANG_LUC[c]) loi(ds, 'NANG_LUC', 'requiredCapabilities có “' + c + '” không nằm trong sổ năng lực — unknown không được coi là supported.');
  });
  (Array.isArray(s.qaRequirements) ? s.qaRequirements : []).forEach((q) => {
    if (['identity', 'prop_transfer', 'lip_sync', 'no_major_anatomy_errors', 'continuity', 'crowd_behavior'].indexOf(q) < 0)
      loi(ds, 'QA', 'qaRequirements có “' + q + '” không hợp lệ.');
  });
  if (!soNguyenDuong(s.maxAttempts) || s.maxAttempts > 5) loi(ds, 'THU_LAI', 'maxAttempts phải từ 1 đến 5.');
  return { ok: ds.length === 0, loi: ds };
}

/* Quyết định route sản xuất theo sổ năng lực THẬT. Không bao giờ âm
   thầm hạ cấp: thiếu năng lực → BLOCKED kèm route thay thế. */
export function chonRoute(spec) {
  const thieu = [];
  for (const c of (spec && spec.requiredCapabilities) || []) {
    const n = NANG_LUC[c];
    if (!n) thieu.push({ cap: c, trangThai: 'khong-biet', route: null });
    else if (n.trangThai === 'bi-chan') thieu.push({ cap: c, trangThai: n.trangThai, route: n.gioiHan });
  }
  if (thieu.length) return { ok: false, code: 'BLOCKED_UNSUPPORTED_CAPABILITY', thieu };
  const chua = (spec.requiredCapabilities || []).filter(c => NANG_LUC[c].trangThai === 'chua-xac-minh');
  if (chua.length) return { ok: true, canhBao: chua.map(c => c + ': chưa xác minh live — submit sẽ ghi SUBMISSION_UNKNOWN nếu provider không tra cứu được') };
  return { ok: true };
}
