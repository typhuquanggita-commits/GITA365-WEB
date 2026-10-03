/* ═══════════════════════════════════════════════════════════════
   PHIM AI TỰ ĐỘNG — cửa máy chủ cho "Xưởng phim ngắn AI · làm từ A-Z"
   (9.99.251)

   Chủ hệ yêu cầu: chỉ gửi KỊCH BẢN, hệ thống làm phần còn lại. Nên đây
   là ngoại lệ CÓ CHỦ Ý của luật C20 (xưởng cũ không sinh hình/giọng),
   chỉ mở cho SUPER ADMIN (R01), và chỉ chạy khi chủ hệ đã nạp khoá
   fal.ai của CHÍNH MÌNH (secret GITA_KHOA_FAL) — tiền do tài khoản fal
   của chủ hệ trả, có hạn mức chi tiêu đặt ở fal.ai.

   Một nhà cung cấp (fal.ai), năm loại việc, mỗi loại MỘT model cố định:
     llm    — fal-ai/any-llm              kịch bản → danh sách cảnh (JSON)
     anh    — fal-ai/nano-banana           ảnh chân dung nhân vật 9:16
     anhSua — fal-ai/nano-banana/edit      khung mở đầu, giữ mặt nhân vật
     video  — Kling 2.1 standard i2v       ảnh → clip 5/10 giây
     giong  — fal-ai/minimax/speech-02-hd  lời thoại tiếng Việt

   Ba cửa (đều cần phiên, đều chỉ R01):
     phimTrangThai — có khoá chưa, hôm nay đã dùng bao nhiêu
     phimGuiViec   — gửi một việc vào hàng đợi fal, trả địa chỉ xem/lấy
     phimXemViec   — hỏi tối đa 12 việc một lượt; xong thì trả URL kết quả

   An toàn:
   · Model theo DANH SÁCH TRẮNG; dữ liệu vào được dựng lại từng trường
     (không chuyển nguyên đối tượng của máy khách đi).
   · Mọi chuỗi đi ra qua soatRaNhaCungCap (provider 'fal') — tên người
     thật/số điện thoại bị chặn, trả lại danh sách chỗ ngờ để người dùng
     tự sửa (máy không tự xoá hộ).
   · Địa chỉ ảnh tham chiếu chỉ nhận tệp trên *.fal.media (hoặc kho
     storage.googleapis.com/falserverless của fal); địa chỉ xem/lấy chỉ
     nhận https://queue.fal.run/…/requests/<id> — không mở SSRF.
   · Hạn mức theo ngày cho từng loại, đếm trong D1 (Kho.demNhip).
   ═══════════════════════════════════════════════════════════════ */
'use strict';

import { Kho } from './nen.js';
import { laR01, tenNguoiDung as ten } from './vai-tro.js';
import { soatRaNhaCungCap } from './an-toan-ai.js';

const HANG_DOI = 'https://queue.fal.run/';

export const MAU_PHIM = {
  llm:    { id: 'fal-ai/any-llm', han: 40 },
  anh:    { id: 'fal-ai/nano-banana', han: 300 },
  anhSua: { id: 'fal-ai/nano-banana/edit', han: 400 },
  video:  { id: 'fal-ai/kling-video/v2.1/standard/image-to-video', han: 200 },
  giong:  { id: 'fal-ai/minimax/speech-02-hd', han: 800 }
};

export const GIONG_NAM = ['Deep_Voice_Man', 'Elegant_Man', 'Patient_Man', 'Determined_Man',
  'Casual_Guy', 'Young_Knight', 'Decent_Boy', 'Imposing_Manner'];
export const GIONG_NU = ['Wise_Woman', 'Calm_Woman', 'Lively_Girl', 'Lovely_Girl', 'Sweet_Girl_2',
  'Inspirational_girl', 'Exuberant_Girl', 'Abbess', 'Friendly_Person'];
const GIONG = GIONG_NAM.concat(GIONG_NU);
const CAM_XUC = ['happy', 'sad', 'angry', 'fearful', 'disgusted', 'surprised', 'neutral'];
const KHUNG = ['9:16', '16:9', '1:1', '3:4', '4:3'];

const RE_TEP = /^https:\/\/(?:(?:[a-z0-9-]+\.)*fal\.media|storage\.googleapis\.com\/falserverless)\/[A-Za-z0-9._~\/%-]{1,300}$/;
const RE_VIEC = /^https:\/\/queue\.fal\.run\/[a-z0-9-]+\/[a-z0-9._-]+(?:\/[a-z0-9._-]+){0,6}\/requests\/([A-Za-z0-9-]{8,80})(\/status)?$/;

export const HUONG_PHAN_CANH = [
  'You are a professional director and storyboard artist of vertical (9:16) Vietnamese short-drama series ',
  '(the "phim ngắn dọc" format: many quick shots, emotional close-ups, clear conflict).',
  'Convert the user\'s script (Vietnamese, any format: prose, outline or screenplay) into a shot list.',
  'Output ONLY one valid JSON object, no markdown fences, no comments, with exactly this shape:',
  '{"ten": "Vietnamese title",',
  ' "phongCach": "English visual style shared by all shots (photorealistic cinematic, lighting, color grade)",',
  ' "nhanVat": [{"ten": "name exactly as written in the script", "moTa": "short Vietnamese note (role, age)",',
  '   "prompt": "English FIXED appearance, 25-45 words: ethnicity (Vietnamese unless the script says otherwise), gender, exact age, face, hairstyle, body, outfit",',
  '   "gioi": "nam" or "nu", "giong": "voice id"}],',
  ' "boiCanh": [{"ten": "short Vietnamese location name", "prompt": "English description of the location, time of day, lighting"}],',
  ' "canh": [{"boiCanh": "one boiCanh.ten", "chiDao": "Vietnamese shot size and camera move, e.g. Cận cảnh, đẩy máy vào",',
  '   "hanhDong": "Vietnamese description of what happens", "nhanVat": ["names visible in the shot"],',
  '   "hinh": "English description of the FIRST FRAME: who is where, pose, facial expression, framing; refer to characters by their exact names",',
  '   "chuyenDong": "English description of motion during the shot: action, expression change, camera movement",',
  '   "thoai": [{"ai": "speaker name", "loi": "exact Vietnamese line"}],',
  '   "tinNhan": [{"ai": "sender name", "loi": "Vietnamese text message"}],',
  '   "giay": 5}]}',
  'Rules:',
  '1. Keep EVERY line of dialogue from the script, verbatim, in order. Do not translate dialogue. Only if the script has no dialogue at all, write short natural Vietnamese lines that fit the story.',
  '2. One shot = 5 seconds (giay 5). Use giay 10 only when a shot\'s dialogue is longer than about 22 words. At most 2 dialogue lines per shot; give long speeches their own shots and add reaction close-ups between them.',
  '3. Film like a professional drama: wide establishing shot when entering a new location, medium shots for action, close-ups and extreme close-ups for emotion, over-the-shoulder for conversations, reaction shots.',
  '4. Every character that appears physically must be in nhanVat with a precise, unchanging appearance. Use the same name spelling everywhere.',
  '5. Phone screens / chat messages go in tinNhan of a shot whose hinh shows a smartphone screen close-up.',
  '6. Images must never contain text, captions, subtitles, watermarks or logos.',
  '7. Between 6 and 60 shots. Keep the story complete; do not skip scenes.',
  '8. Voice ids — male: ' + GIONG_NAM.join(', ') + '; female: ' + GIONG_NU.join(', ') +
    '. Pick a different fitting voice for each main character.',
  '9. Content must be suitable for a general audience: no graphic violence, no nudity.'
].join('\n');

function chu(v, toiDa) { return String(v == null ? '' : v).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim().slice(0, toiDa); }

/* Dựng lại dữ liệu gửi đi theo từng loại — trả { dauVao } hoặc { loi } */
export function dungDauVao(loai, y) {
  y = y || {};
  if (loai === 'llm') {
    const kichBan = chu(y.kichBan, 24000);
    if (kichBan.length < 30) return { loi: 'Kịch bản quá ngắn (cần ít nhất 30 ký tự).' };
    return { dauVao: {
      model: 'google/gemini-2.5-flash', system_prompt: HUONG_PHAN_CANH,
      prompt: 'SCRIPT:\n' + kichBan, temperature: 0.4, max_tokens: 16000, priority: 'throughput'
    } };
  }
  if (loai === 'anh' || loai === 'anhSua') {
    const prompt = chu(y.prompt, 3000);
    if (prompt.length < 10) return { loi: 'Thiếu mô tả ảnh.' };
    const khung = KHUNG.indexOf(y.khung) >= 0 ? y.khung : '9:16';
    const dv = { prompt, num_images: 1, aspect_ratio: khung, output_format: 'jpeg' };
    if (loai === 'anhSua') {
      const ds = Array.isArray(y.anhThamChieu) ? y.anhThamChieu.slice(0, 4).map(String) : [];
      if (!ds.length) return { loi: 'Thiếu ảnh tham chiếu.' };
      if (!ds.every(u => RE_TEP.test(u))) return { loi: 'Ảnh tham chiếu phải là tệp do fal.ai tạo.' };
      dv.image_urls = ds;
    }
    return { dauVao: dv };
  }
  if (loai === 'video') {
    const prompt = chu(y.prompt, 2500);
    const anh = String(y.anh || '');
    if (prompt.length < 10) return { loi: 'Thiếu mô tả chuyển động.' };
    if (!RE_TEP.test(anh)) return { loi: 'Ảnh mở đầu phải là tệp do fal.ai tạo.' };
    return { dauVao: {
      prompt, image_url: anh, duration: String(y.giay) === '10' ? '10' : '5',
      negative_prompt: chu(y.am, 600) || 'blur, distort, low quality, text, subtitles, watermark, deformed hands',
      cfg_scale: 0.5
    } };
  }
  if (loai === 'giong') {
    const loi = chu(y.loi, 1200);
    if (!loi) return { loi: 'Thiếu lời thoại.' };
    const giong = GIONG.indexOf(y.giong) >= 0 ? y.giong : 'Wise_Woman';
    const toc = Math.max(0.5, Math.min(2, +y.toc || 1));
    const vs = { voice_id: giong, speed: toc };
    if (CAM_XUC.indexOf(y.camXuc) >= 0) vs.emotion = y.camXuc;
    return { dauVao: { text: loi, voice_setting: vs, language_boost: 'Vietnamese', output_format: 'url' } };
  }
  return { loi: 'Loại việc không hợp lệ.' };
}

/* Rút kết quả cần dùng từ phản hồi của model */
export function rutKetQua(loai, o) {
  o = o || {};
  if (loai === 'llm') return { chu: String(o.output || '') };
  if (loai === 'anh' || loai === 'anhSua') {
    const a = Array.isArray(o.images) && o.images[0];
    return { url: a && a.url ? String(a.url) : '' };
  }
  if (loai === 'video') return { url: o.video && o.video.url ? String(o.video.url) : '' };
  if (loai === 'giong') return { url: o.audio && o.audio.url ? String(o.audio.url) : '',
    ms: +o.duration_ms || 0 };
  return {};
}

function khoaCua(env) { return String((env && env.GITA_KHOA_FAL) || '').trim(); }
function chiR01(hoSo) {
  return laR01(hoSo) ? null : { ok: false, code: 'NOPERM',
    error: 'Chỉ Super Admin được dùng xưởng phim tự động (tốn tiền tài khoản fal.ai của chủ hệ).' };
}
function homNay() { return new Date().toISOString().slice(0, 10); }

export async function phimTrangThai(y, env, db, hoSo) {
  const cam = chiR01(hoSo); if (cam) return cam;
  const daDung = {};
  for (const loai of Object.keys(MAU_PHIM)) {
    let r = null;
    try {
      r = await db.prepare('SELECT dem, hetHan FROM chanNhip WHERE khoa = ?')
        .bind('phim-ai·' + loai + '·' + hoSo.uid + '·' + homNay()).first();
    } catch (e) { r = null; }
    daDung[loai] = r && r.hetHan > Date.now() ? (r.dem || 0) : 0;
  }
  const hanMuc = {};
  Object.keys(MAU_PHIM).forEach(k => { hanMuc[k] = MAU_PHIM[k].han; });
  return { ok: true, coKhoa: !!khoaCua(env), nhaCungCap: 'fal.ai', hanMuc, daDung };
}

export async function phimGuiViec(y, env, db, hoSo) {
  const cam = chiR01(hoSo); if (cam) return cam;
  y = y || {};
  const loai = String(y.loai || '');
  const mau = MAU_PHIM[loai];
  if (!mau) return { ok: false, code: 'LOAI_LA', error: 'Loại việc không hợp lệ.' };
  const khoa = khoaCua(env);
  if (!khoa) return { ok: false, code: 'CHUA_CO_KHOA',
    error: 'Máy chủ chưa có khoá fal.ai (GITA_KHOA_FAL). Xem hướng dẫn "Lấy khoá fal.ai".' };
  const dung = dungDauVao(loai, y);
  if (dung.loi) return { ok: false, code: 'DAU_VAO', error: dung.loi };

  const anToan = await soatRaNhaCungCap({ provider: 'fal', model: mau.id,   dauVao: dung.dauVao }, env, db, hoSo);
  if (!anToan.cho) return { ok: false, code: anToan.code, ngo: anToan.ngo || [],
    error: anToan.vi || 'Nội dung không được phép gửi ra ngoài.' };

  const dem = await Kho.demNhip(db, 'phim-ai·' + loai + '·' + hoSo.uid + '·' + homNay(), 86400);
  if (dem > mau.han) return { ok: false, code: 'VUOT_HAN',
    error: 'Đã hết hạn mức "' + loai + '" hôm nay (' + mau.han + ' lượt). Mai làm tiếp.' };

  let r;
  try {
    r = await fetch(HANG_DOI + mau.id, {
      method: 'POST', redirect: 'error',
      headers: { 'Authorization': 'Key ' + khoa, 'Content-Type': 'application/json' },
      body: JSON.stringify(dung.dauVao), signal: AbortSignal.timeout(25000)
    });
  } catch (e) {
    return { ok: false, code: 'FAL_KHONG_KET_NOI', error: 'Không kết nối được fal.ai.' };
  }
  if (!r.ok) {
    let chiTiet = '';
    try { chiTiet = chu(await r.text(), 300); } catch (e) {}
    const goiY = r.status === 401 || r.status === 403 ? ' Khoá fal.ai sai hoặc đã bị thu hồi.'
      : r.status === 402 || /balance|credit|billing|locked/i.test(chiTiet) ? ' Tài khoản fal.ai hết tiền — nạp thêm ở fal.ai/dashboard/billing.' : '';
    return { ok: false, code: 'FAL_TU_CHOI', error: 'fal.ai từ chối (HTTP ' + r.status + ').' + goiY, chiTiet };
  }
  let o;
  try { o = await r.json(); } catch (e) { return { ok: false, code: 'FAL_PHAN_HOI', error: 'Phản hồi fal.ai không đọc được.' }; }
  const xem = String(o.status_url || ''), lay = String(o.response_url || '');
  const m1 = xem.match(RE_VIEC), m2 = lay.match(RE_VIEC);
  if (!m1 || !m2 || !m1[2] || m2[2] || m1[1] !== m2[1])
    return { ok: false, code: 'FAL_PHAN_HOI', error: 'fal.ai trả địa chỉ việc lạ.' };

  await Kho.ghiNhatKy(db, { uid: hoSo.uid, username: ten(hoSo), viec: 'PHIM_AI_GUI',
    doiTuong: mau.id, chiTiet: loai + ' · ' + m1[1] });
  return { ok: true, loai, maViec: m1[1], xem, lay };
}

async function xemMot(v, khoa) {
  const loai = String(v.loai || '');
  const xem = String(v.xem || ''), lay = String(v.lay || '');
  const m1 = xem.match(RE_VIEC), m2 = lay.match(RE_VIEC);
  if (!MAU_PHIM[loai] || !m1 || !m2 || !m1[2] || m2[2] || m1[1] !== m2[1])
    return { trangThai: 'LOI', loi: 'Địa chỉ việc không hợp lệ.' };
  const tieuDe = { 'Authorization': 'Key ' + khoa };
  let s;
  try {
    const r = await fetch(xem, { headers: tieuDe, redirect: 'error', signal: AbortSignal.timeout(15000) });
    if (!r.ok) return { trangThai: r.status >= 500 ? 'CHO' : 'LOI', loi: 'Hỏi trạng thái lỗi HTTP ' + r.status };
    s = await r.json();
  } catch (e) { return { trangThai: 'CHO', loi: 'Mạng chậm, thử lại.' }; }
  const st = String(s.status || '');
  if (st === 'IN_QUEUE') return { trangThai: 'CHO', viTri: +s.queue_position || 0 };
  if (st === 'IN_PROGRESS') return { trangThai: 'DANG_LAM' };
  if (st !== 'COMPLETED') return { trangThai: 'CHO' };
  try {
    const r = await fetch(lay, { headers: tieuDe, redirect: 'error', signal: AbortSignal.timeout(20000) });
    const t = await r.text();
    let o = null; try { o = JSON.parse(t); } catch (e) {}
    if (!r.ok) {
      const ct = o && o.detail ? (typeof o.detail === 'string' ? o.detail : JSON.stringify(o.detail)) : t;
      return { trangThai: 'LOI', loi: 'Model báo lỗi (HTTP ' + r.status + '): ' + chu(ct, 300) };
    }
    const kq = rutKetQua(loai, o);
    if (loai !== 'llm' && !RE_TEP.test(kq.url || ''))
      return { trangThai: 'LOI', loi: 'Model không trả tệp kết quả.' };
    if (loai === 'llm' && !kq.chu) return { trangThai: 'LOI', loi: 'Model không trả nội dung.' };
    return { trangThai: 'XONG', ketQua: kq };
  } catch (e) { return { trangThai: 'CHO', loi: 'Mạng chậm khi lấy kết quả, thử lại.' }; }
}

export async function phimXemViec(y, env, db, hoSo) {
  const cam = chiR01(hoSo); if (cam) return cam;
  const khoa = khoaCua(env);
  if (!khoa) return { ok: false, code: 'CHUA_CO_KHOA', error: 'Máy chủ chưa có khoá fal.ai (GITA_KHOA_FAL).' };
  const ds = Array.isArray((y || {}).ds) ? y.ds.slice(0, 12) : [];
  const ra = await Promise.all(ds.map(v => xemMot(v || {}, khoa)));
  return { ok: true, ds: ra };
}
