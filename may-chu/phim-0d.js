/* ═══════════════════════════════════════════════════════════════
   XƯỞNG PHIM 0 ĐỒNG (9.99.253) — sản xuất phim KHÔNG phát sinh chi phí

   Chủ hệ chốt: chuỗi video của GITA không được tốn một đồng nào. Nên
   xưởng phim tự động chạy MẶC ĐỊNH ở chế độ 0 đồng, chỉ dùng những gì
   có sẵn miễn phí:

     · Kịch bản/kinh bộ phim/phân cảnh — Workers AI, model
       @cf/google/gemma-4-26b-a4b-it (binding AI của chính Worker này).
     · Ảnh nhân vật, bối cảnh, khung hình — Workers AI,
       @cf/black-forest-labs/flux-2-klein-4b (giữ mặt nhân vật bằng tối
       đa 4 ảnh tham chiếu). Hỏng thì lùi về flux-1-schnell.
     · Giọng đọc tiếng Việt — chạy NGAY TRONG TRÌNH DUYỆT (Piper, mã
       nguồn mở). Tệp mô hình giọng nằm trong R2 của chính Cloudflare
       (tai-nguyen.js, đường /tn/…), không phụ thuộc CDN bên ngoài.
     · Chuyển động — máy dựng tự đẩy/lia máy trên ảnh tĩnh (Ken Burns)
       khi xuất phim; không gọi model video trả phí.
     · Hạng "Bom tấn Cloudflare" (loai anhCao/anhSuaCao hoặc y.cao):
       khung lớn hơn + chỉ dẫn điện ảnh, vẫn klein 4B miễn phí. Chỉ khi
       chủ hệ tự đặt GITA_PHIM_TRAN_TRA_PHI > 0 (gói Workers Paid) mới
       dùng klein 9B, đếm riêng trong quỹ trả phí có trần mỗi ngày.

   HÀNG RÀO CHI PHÍ (vì sao chắc chắn 0 đồng):
     1. Workers AI cho 10.000 neuron MIỄN PHÍ mỗi ngày (đặt lại 00:00
       UTC = 07:00 giờ Việt Nam). Tài khoản gói Free: vượt là bị từ
       chối, không tính tiền. Tài khoản gói Paid: vượt mới tính tiền —
       nên máy chủ tự đặt TRẦN (mặc định 9.000, tối đa 9.500 neuron/
       ngày) và đếm trong D1: GIỮ CHỖ trước mỗi lượt gọi, chỉnh lại theo
       số thật sau lượt gọi, vượt trần thì trả HET_MIEN_PHI kèm giờ đặt
       lại để máy khách tự chờ rồi làm tiếp.
     2. GITA_PHIM_CHI_0D (mặc định BẬT, kể cả khi thiếu biến) khoá cứng
       cửa fal.ai trả phí: phimGuiViec/phimXemViec trả CHE_DO_0_DONG.
     3. Ảnh phim không lưu vào kho: trả thẳng về trình duyệt (base64)
       và nằm trong IndexedDB của máy chủ hệ (R2 chỉ giữ tệp giọng đọc).

   Cổng Điều 13 vẫn soát mọi chuỗi trước khi gọi model (provider
   'cf-workers-ai' — chạy trong hạ tầng Cloudflare của chính hệ).
   ═══════════════════════════════════════════════════════════════ */
'use strict';

import { Kho } from './nen.js';
import { laR01, tenNguoiDung as ten } from './vai-tro.js';
import { soatRaNhaCungCap } from './an-toan-ai.js';
import { dungDauVao, HUONG_TAP_0D, chi0d, phimTrangThai } from './phim-ai.js';

export { chi0d };

export const MAU_LLM = '@cf/google/gemma-4-26b-a4b-it';
export const MAU_ANH = '@cf/black-forest-labs/flux-2-klein-4b';
export const MAU_ANH_DU = '@cf/black-forest-labs/flux-1-schnell';
/* Hạng Bom tấn (9.99.254): FLUX.2 klein 9B — chỉ khi chủ hệ mở ngân sách
   trả phí Cloudflare (GITA_PHIM_TRAN_TRA_PHI > 0, cần gói Workers Paid).
   Không mở thì Bom tấn vẫn chạy 0 đồng bằng klein 4B ở khung lớn hơn. */
export const MAU_ANH_CAO = '@cf/black-forest-labs/flux-2-klein-9b';
export const ANH_BOM_TAN = ' Cinematic film still from a Hollywood blockbuster action-drama: anamorphic widescreen composition, ' +
  'dramatic high-contrast lighting with volumetric light and rim light, teal-and-orange color grade, shallow depth of field, ' +
  'fine 35mm film grain, photorealistic, razor-sharp detail, expressive faces, consistent characters.';

/* Bảng neuron (trang giá Workers AI): Gemma 4 26B — 9.091 neuron / 1 triệu
   token vào, 27.273 / 1 triệu token ra. Klein 4B — 26,05 neuron mỗi ô
   512×512 ảnh ra, 5,37 mỗi ô ảnh vào. Schnell — 4,8 mỗi ô + 9,6 mỗi bước. */
export const NEURON = { llmVao: 9.091 / 1000, llmRa: 27.273 / 1000, oRa: 26.05, oVao: 5.37, schnellO: 4.8, schnellBuoc: 9.6,
  mpDau9b: 1363.64, mpSau9b: 181.82, mpVao9b: 181.82 };
export const MIEN_PHI_NGAY = 10000;
const TRAN_MAC_DINH = 9000, TRAN_TOI_DA = 9500;

const KHUNG_ANH = { '9:16': [576, 1024], '16:9': [1024, 576], '1:1': [768, 768], '4:5': [640, 800] };
const KHUNG_ANH_CAO = { '9:16': [768, 1344], '16:9': [1344, 768], '1:1': [1024, 1024], '4:5': [896, 1120] };
const KHUNG_ANH_9B = { '9:16': [896, 1600], '16:9': [1600, 896], '1:1': [1216, 1216], '4:5': [1088, 1360] };
const TRAN_TRA_PHI_TOI_DA = 2000000;

/* Ngân sách neuron TRẢ PHÍ mỗi ngày cho Bom tấn (mặc định 0 = tắt). */
export function tranTraPhi(env) {
  const n = Math.floor(+((env && env.GITA_PHIM_TRAN_TRA_PHI) || 0));
  return n > 0 ? Math.min(n, TRAN_TRA_PHI_TOI_DA) : 0;
}

export function tranNgay(env) {
  const n = Math.floor(+((env && env.GITA_PHIM_TRAN_NEURON) || TRAN_MAC_DINH));
  return n > 0 ? Math.min(n, TRAN_TOI_DA) : TRAN_MAC_DINH;
}
function ngayUTC(t) { return new Date(t || Date.now()).toISOString().slice(0, 10); }
export function lucDatLai(t) {
  const d = new Date(t || Date.now());
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + 1);
}
function khoaNgay(t, quy) { return (quy === 'traPhi' ? 'phim-cf·tra-phi·' : 'phim-0d·neuron·') + ngayUTC(t); }

export async function neuronDaDung(db, t, quy) {
  try {
    const r = await db.prepare('SELECT dem FROM chanNhip WHERE khoa = ?').bind(khoaNgay(t, quy)).first();
    return (r && +r.dem) || 0;
  } catch (e) { return 0; }
}

/* Giữ chỗ n neuron bằng MỘT câu ghi có điều kiện — chỉ cộng khi tổng mới
   còn trong trần. D1 tuần tự hoá từng câu nên lượt song song không lọt trần
   và cũng không bị từ chối oan. */
export async function giuNeuron(db, env, n, quy) {
  n = Math.max(1, Math.ceil(n));
  const khoa = khoaNgay(undefined, quy), han = lucDatLai() + 86400000;
  const tran = quy === 'traPhi' ? tranTraPhi(env) : tranNgay(env);
  let doi = 0;
  if (n <= tran) {
    const kq = await db.prepare('INSERT INTO chanNhip (khoa, dem, hetHan) VALUES (?, ?, ?) ' +
      'ON CONFLICT(khoa) DO UPDATE SET dem = chanNhip.dem + excluded.dem WHERE chanNhip.dem + excluded.dem <= ?')
      .bind(khoa, n, han, tran).run();
    doi = +((kq && kq.meta && kq.meta.changes) || 0);
  }
  if (doi > 0) return { duoc: true, khoa, n };
  return { duoc: false, daDung: await neuronDaDung(db, undefined, quy), tran };
}
export async function chinhNeuron(db, khoa, d) {
  d = Math.round(d);
  if (!d) return;
  await db.prepare('UPDATE chanNhip SET dem = MAX(0, dem + ?) WHERE khoa = ?').bind(d, khoa).run();
}

function hetMienPhi(daDung, tran) {
  const mai = lucDatLai();
  return { ok: false, code: 'HET_MIEN_PHI', mai: new Date(mai).toISOString(), daDung, tran,
    error: 'Đã dùng hết phần miễn phí hôm nay (' + daDung + '/' + tran + ' neuron). ' +
      'Máy tự làm tiếp sau 07:00 sáng mai (giờ Việt Nam) — không tốn đồng nào.' };
}

function chiR01(hoSo) {
  return laR01(hoSo) ? null : { ok: false, code: 'NOPERM', error: 'Chỉ Super Admin được dùng xưởng phim tự động.' };
}
function chu(v, toiDa) { return String(v == null ? '' : v).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim().slice(0, toiDa); }
function uocToken(s) { return Math.ceil(String(s || '').length / 3); }

/* Lấy chữ trả về: dạng OpenAI (choices) hoặc dạng cũ của Workers AI (response) */
export function rutChu(o) {
  if (!o) return '';
  if (typeof o === 'string') return o;
  const c = o.choices && o.choices[0];
  const m = c && (c.message || c);
  let s = m && (m.content != null ? m.content : m.text);
  if (Array.isArray(s)) s = s.map(x => (x && (x.text || x.content)) || '').join('');
  if (s == null) s = o.response;
  if (s != null && typeof s === 'object') s = JSON.stringify(s);
  return String(s || '');
}

async function lamLLM(y, env, db, hoSo) {
  const dung = dungDauVao('llm', y);
  if (dung.loi) return { ok: false, code: 'DAU_VAO', error: dung.loi };
  const dv = dung.dauVao;
  const heThong = y.che === 'tap' ? HUONG_TAP_0D : dv.system_prompt;
  const toiDaRa = y.che === 'boPhim' || y.che === 'duyetKinh' ? 16000 : y.che === 'tap' ? 14000 : 12000;

  const anToan = await soatRaNhaCungCap({ provider: 'cf-workers-ai', model: MAU_LLM, dauVao: dung.soat || dv }, env, db, hoSo);
  if (!anToan.cho) return { ok: false, code: anToan.code, ngo: anToan.ngo || [],
    error: anToan.vi || 'Nội dung không được phép gửi đi.' };

  const uoc = (uocToken(heThong) + uocToken(dv.prompt)) * NEURON.llmVao + toiDaRa * NEURON.llmRa;
  const giu = await giuNeuron(db, env, uoc);
  if (!giu.duoc) return hetMienPhi(giu.daDung, giu.tran);

  const tin = [{ role: 'system', content: heThong }, { role: 'user', content: dv.prompt }];
  const coBan = { messages: tin, max_completion_tokens: toiDaRa, temperature: dv.temperature,
    chat_template_kwargs: { enable_thinking: false } };
  let o = null, loi = '';
  for (const them of [{ response_format: { type: 'json_object' } }, {}]) {
    try { o = await env.AI.run(MAU_LLM, Object.assign({}, coBan, them)); if (rutChu(o).trim()) break; }
    catch (e) { loi = chu(e && e.message || e, 300); o = null; }
  }
  const u = (o && o.usage) || {};
  const that = (+u.prompt_tokens || 0) * NEURON.llmVao + (+u.completion_tokens || 0) * NEURON.llmRa;
  if (!o) { await chinhNeuron(db, giu.khoa, -giu.n); return { ok: false, code: 'AI_LOI', error: 'Workers AI không trả lời: ' + loi }; }
  if (that > 0) await chinhNeuron(db, giu.khoa, Math.ceil(that) - giu.n);
  const s = rutChu(o);
  if (!s.trim()) return { ok: false, code: 'AI_LOI', error: 'Model không trả nội dung.' };
  await Kho.ghiNhatKy(db, { uid: hoSo.uid, username: ten(hoSo), viec: 'PHIM_0D_LLM',
    doiTuong: MAU_LLM, chiTiet: (y.che || 'phanCanh') + ' · ' + Math.ceil(that || giu.n) + ' neuron' });
  return { ok: true, kq: { chu: s }, neuron: Math.ceil(that || giu.n) };
}

const RE_B64 = /^[A-Za-z0-9+/]+={0,2}$/;
export function laAnhB64(s) {
  s = String(s || '');
  return s.length > 100 && s.length <= 400000 && RE_B64.test(s) && /^(\/9j\/|iVBORw0KGgo|UklGR)/.test(s);
}
function kieuAnh(s) { return /^iVBOR/.test(s) ? 'image/png' : /^UklGR/.test(s) ? 'image/webp' : 'image/jpeg'; }
function b64Blob(s) {
  const nhi = atob(s), m = new Uint8Array(nhi.length);
  for (let i = 0; i < nhi.length; i++) m[i] = nhi.charCodeAt(i);
  return new Blob([m], { type: kieuAnh(s) });
}
export function neuronAnh(w, h, soThamChieu) {
  return Math.ceil(NEURON.oRa * Math.ceil(w / 512) * Math.ceil(h / 512) + NEURON.oVao * (soThamChieu || 0));
}
/* klein 9B tính theo megapixel: MP đầu + MP sau + MP ảnh tham chiếu (ảnh tham chiếu ≤ 512 px ≈ 0,25 MP) */
export function neuronAnh9b(w, h, soThamChieu) {
  const mp = (w * h) / (1024 * 1024);
  return Math.ceil(NEURON.mpDau9b + Math.max(0, mp - 1) * NEURON.mpSau9b + NEURON.mpVao9b * 0.25 * (soThamChieu || 0));
}

async function veFlux2(env, mau, prompt, w, h, seed, refs) {
  const f = new FormData();
  f.append('prompt', prompt); f.append('width', String(w)); f.append('height', String(h));
  if (seed != null && isFinite(+seed)) f.append('seed', String(Math.abs(Math.floor(+seed)) % 2147483647));
  refs.forEach((r, i) => f.append('input_image_' + i, b64Blob(r), 'ref' + i + (kieuAnh(r) === 'image/png' ? '.png' : '.jpg')));
  const goi = new Response(f);
  const o = await env.AI.run(mau, { multipart: { body: goi.body, contentType: goi.headers.get('content-type') } });
  return String((o && o.image) || '');
}

async function lamAnh(y, env, db, hoSo) {
  const cao = y.cao === true;
  let prompt = chu(y.prompt, 3000);
  if (prompt.length < 10) return { ok: false, code: 'DAU_VAO', error: 'Thiếu mô tả ảnh.' };
  if (cao) prompt = prompt.slice(0, 3000 - ANH_BOM_TAN.length) + ANH_BOM_TAN;
  const bang = cao ? KHUNG_ANH_CAO : KHUNG_ANH;
  const [w, h] = bang[y.khung] || bang['9:16'];
  const refs = (Array.isArray(y.anhB64) ? y.anhB64 : []).slice(0, 4).map(String);
  if (!refs.every(laAnhB64)) return { ok: false, code: 'DAU_VAO', error: 'Ảnh tham chiếu không hợp lệ (JPEG/PNG ≤ 512 px).' };

  const anToan = await soatRaNhaCungCap({ provider: 'cf-workers-ai', model: MAU_ANH, prompt }, env, db, hoSo);
  if (!anToan.cho) return { ok: false, code: anToan.code, ngo: anToan.ngo || [],
    error: anToan.vi || 'Nội dung không được phép gửi đi.' };

  /* Bom tấn có ngân sách trả phí → klein 9B; hỏng hoặc hết ngân sách thì về 4B miễn phí. */
  if (cao && tranTraPhi(env) > 0) {
    const [w9, h9] = KHUNG_ANH_9B[y.khung] || KHUNG_ANH_9B['9:16'];
    const can9 = neuronAnh9b(w9, h9, refs.length);
    const giu9 = await giuNeuron(db, env, can9, 'traPhi');
    if (giu9.duoc) {
      let anh9 = '';
      try { anh9 = await veFlux2(env, MAU_ANH_CAO, prompt, w9, h9, y.seed, refs); } catch (e) { anh9 = ''; }
      if (anh9) return { ok: true, kq: { anh: anh9, kieu: kieuAnh(anh9), mau: MAU_ANH_CAO }, neuron: can9, traPhi: true };
      await chinhNeuron(db, giu9.khoa, -giu9.n);
    }
  }

  const can = neuronAnh(w, h, refs.length);
  const giu = await giuNeuron(db, env, can);
  if (!giu.duoc) return hetMienPhi(giu.daDung, giu.tran);

  let anh = '', mau = MAU_ANH, loi = '';
  try { anh = await veFlux2(env, MAU_ANH, prompt, w, h, y.seed, refs); }
  catch (e) { loi = chu(e && e.message || e, 300); }

  if (!anh) {
    /* Lùi về schnell (không giữ mặt được, nhưng cảnh vẫn có hình). */
    mau = MAU_ANH_DU;
    const du = Math.ceil(NEURON.schnellO * 4 + NEURON.schnellBuoc * 4);
    await chinhNeuron(db, giu.khoa, du - giu.n);
    try {
      /* Binding của schnell từ chối mọi tham số ngoài prompt/steps (lỗi
         5006) — không truyền seed/width/height. */
      const o = await env.AI.run(MAU_ANH_DU, { prompt: prompt.slice(0, 2048), steps: 4 });
      anh = String((o && o.image) || '');
    } catch (e) { loi = loi || chu(e && e.message || e, 300); }
    if (!anh) { await chinhNeuron(db, giu.khoa, -du); return { ok: false, code: 'AI_LOI', error: 'Workers AI không vẽ được ảnh: ' + loi }; }
  }
  return { ok: true, kq: { anh, kieu: kieuAnh(anh), mau }, neuron: mau === MAU_ANH ? can : Math.ceil(NEURON.schnellO * 4 + NEURON.schnellBuoc * 4) };
}

/* Cửa duy nhất của xưởng 0 đồng. y.loai: 'llm' | 'anh' (anh có/không ảnh tham chiếu) */
export async function phimMienPhi(y, env, db, hoSo) {
  const cam = chiR01(hoSo); if (cam) return cam;
  y = y || {};
  if (!env || !env.AI || typeof env.AI.run !== 'function')
    return { ok: false, code: 'CHUA_CO_AI', error: 'Máy chủ chưa bật Workers AI (binding AI trong wrangler.toml). Triển khai lại Worker.' };
  const loai = String(y.loai || '');
  if (loai === 'llm') return await lamLLM(y, env, db, hoSo);
  if (loai === 'anh' || loai === 'anhSua') return await lamAnh(y, env, db, hoSo);
  if (loai === 'anhCao' || loai === 'anhSuaCao') return await lamAnh(Object.assign({}, y, { cao: true }), env, db, hoSo);
  return { ok: false, code: 'LOAI_LA', error: 'Loại việc không hợp lệ ở chế độ 0 đồng.' };
}

export async function trangThai0d(env, db) {
  const tran = tranNgay(env), daDung = await neuronDaDung(db), tp = tranTraPhi(env);
  return { chi0d: chi0d(env), mienPhi: { coAI: !!(env && env.AI), tran, mienPhiNgay: MIEN_PHI_NGAY,
    daDung, conLai: Math.max(0, tran - daDung), datLai: new Date(lucDatLai()).toISOString() },
    bomTanCF: { mau9b: tp > 0, tranTraPhi: tp, daDung: tp > 0 ? await neuronDaDung(db, undefined, 'traPhi') : 0 } };
}

/* phimTrangThai của worker: phần fal.ai (phim-ai.js) + phần 0 đồng */
export async function phimTrangThaiDu(y, env, db, hoSo) {
  const r = await phimTrangThai(y, env, db, hoSo);
  if (!r || !r.ok) return r;
  return Object.assign(r, await trangThai0d(env, db));
}
