/* ═══════════════════════════════════════════════════════════════
   GITA 365 · PHIM PHÂN TỬ

   Không lưu file video. Một phim là một công thức ngắn trong D1:
   thứ tự cảnh, câu thoại, mã động tác, mã máy quay. Ảnh dùng chung
   nằm một lần trong R2. Bấm link thì trình duyệt ghép lại.

   Động tác là công thức (thở, giơ tay, quay đầu, một bước), không phải
   video. Chạy, đánh, nhảy không có trong thư viện — không có mô hình
   video trên Cloudflare.

   NGƯỜI QUE BỊ CẤM TUYỆT ĐỐI: trình xem KHÔNG vẽ người bằng nét, không
   hình tượng trưng. Mọi cảnh dùng ảnh điện ảnh do AI vẽ (Workers AI
   FLUX, 0đ; hoặc dịch vụ ngoài khi chủ hệ tự cấu hình khoá). Cảnh chưa
   có ảnh thì báo "đang vẽ" và tự tải lại — không bao giờ vẽ hình tạm.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
import { laR01 } from './vai-tro.js';
import { giuNeuron, chinhNeuron, neuronAnh, NEURON, MAU_ANH, MAU_ANH_DU, veFlux2 } from './phim-0d.js';
import { quayVideoDong, taoBangQuay } from './xuong-quay.js';
import { nhanVatHopLe, loaiHatNV } from './nhan-vat-chuan.js';

export const MAY = {
  dung: { x: 0.5, y: 0.55, z: 1, x2: 0.5, y2: 0.54, z2: 1.06 },
  day: { x: 0.5, y: 0.52, z: 1, x2: 0.5, y2: 0.4, z2: 1.22 },
  lia: { x: 0.38, y: 0.5, z: 1.08, x2: 0.62, y2: 0.5, z2: 1.08 },
  cat: { x: 0.5, y: 0.48, z: 1.12, x2: 0.5, y2: 0.48, z2: 1.12 }
};
export const NHIP = ['tho', 'gio-tay', 'quay-dau', 'buoc'];
const NEN = ['troi-sang', 'troi-chieu', 'phong', 'dem'];
const MA_MAU = 'mau-gita-365';
const daTaoCho = new WeakSet();

function chu(v, n) { return String(v == null ? '' : v).replace(/[\u0000-\u001F]/g, ' ').trim().slice(0, n); }
function maMoi() {
  const b = new Uint8Array(16); crypto.getRandomValues(b);
  return [...b].map(x => x.toString(16).padStart(2, '0')).join('');
}
function loi(code, error) { return { ok: false, code, error }; }

export async function taoBangPhanTu(db) {
  if (daTaoCho.has(db)) return;
  await db.prepare(`CREATE TABLE IF NOT EXISTS phim_pt_cong_thuc (
    ma TEXT PRIMARY KEY, uid TEXT NOT NULL, ten TEXT NOT NULL, noiDung TEXT NOT NULL, taoLuc INTEGER NOT NULL)`).run();
  await db.prepare(`CREATE TABLE IF NOT EXISTS phim_pt_hat (
    ma TEXT PRIMARY KEY, bam TEXT NOT NULL UNIQUE, loai TEXT NOT NULL, mime TEXT NOT NULL, byte INTEGER NOT NULL, soLan INTEGER NOT NULL DEFAULT 1)`).run();
  daTaoCho.add(db);
}

export function mayTheoMa(ma) { return MAY[ma] || MAY.dung; }

function mauCongThuc() {
  return {
    ten: 'Hành trình GITA 365 — phim phân tử',
    canh: [
      { giay: 5, may: 'lia', nen: 'troi-sang', nhip: 'tho', nhan: 'Chặng 1 · Bình an', loi: 'Hành trình vạn dặm bắt đầu từ một hơi thở thật chậm.' },
      { giay: 5, may: 'day', nen: 'phong', nhip: 'gio-tay', nhan: 'Chặng 2 · Kết nối', loi: 'Có những điều chưa nói ra, nhưng gia đình luôn nghe thấy nhau.' },
      { giay: 5, may: 'cat', nen: 'troi-chieu', nhip: 'quay-dau', nhan: 'Chặng 3 · Nhìn lại', loi: 'Dừng lại một nhịp, để thấy mình đã đi được xa thế nào.' },
      { giay: 5, may: 'dung', nen: 'dem', nhip: 'buoc', nhan: 'Chặng 4 · Bước tiếp', loi: 'Rồi ta bước tiếp — chậm mà chắc. GITA 365 đồng hành cùng bạn.' }
    ]
  };
}

/* ── ẢNH CẢNH DO AI VẼ ──
   Nhân vật phải TRẺ ĐẸP chuẩn diễn viên điện ảnh/người mẫu và NHƯ
   CHỤP TỪ MÁY ẢNH THẬT: prompt nói ngôn ngữ nhiếp ảnh (máy full-frame,
   lens 85mm f/1.4, ảnh RAW chưa retouch, da có kết cấu thật, hạt film
   Kodak Portra) và CẤM các từ gây bóng "ảnh AI" (digital smoothing/
   CGI/3D render). Máy vẽ MỘT chân dung gốc (PROMPT_NHAN_VAT) rồi đưa
   làm ảnh tham chiếu cho mọi cảnh → cùng một gương mặt tuyệt đối.
   Ưu tiên: dịch vụ ngoài do chủ hệ gắn khoá → FLUX.2 klein 4B
   (multipart, 9:16 thật 576×1024, seed cố định + ảnh tham chiếu) →
   FLUX.1-schnell 8 bước (không nhận tham chiếu, trình xem tự cắt).
   PHIEN_BAN_ANH: đổi số này để máy tự VẼ LẠI chân dung gốc và toàn bộ
   cảnh mẫu khi nâng cấp mô hình/prompt. */
const PHIEN_BAN_ANH = 4;
const SEED_MAU = 20260365;
const KICH_MAU = [576, 1024];
/* Prompt phải qua được cổng an toàn 8007 của Workers AI: luôn kèm
   "wholesome, fully clothed, modest, family-friendly, safe for all
   ages", tránh mọi từ ngữ mờ ám dù vô tình. */
const NHAN_VAT_MAU = 'A breathtakingly beautiful young Vietnamese woman in her early twenties, the face of a leading cinema actress and beauty pageant winner: perfectly harmonious oval face with soft high cheekbones, large luminous double-eyelid dark brown eyes with long natural lashes, straight delicate nose, naturally full soft lips, flawless luminous honey-toned skin with realistic fine texture and subtle visible pores, long glossy jet-black hair in an elegant low bun with soft face-framing strands, gentle warm confident smile, graceful slender posture, wearing an elegant flowing traditional white silk ao dai with delicate embroidery, fully clothed modest attire';
const PROMPT_NHAN_VAT = 'Professional studio beauty portrait photograph of ' + NHAN_VAT_MAU + ', head and shoulders framing, looking softly into the camera, gentle confident smile, professional soft key light with subtle golden rim light, clean warm seamless studio backdrop, tack-sharp focus on the eyes, magazine cover quality, photorealistic';
const PHONG_CACH_MAU = ', candid photograph taken on a full-frame mirrorless camera with an 85mm f/1.4 prime lens, RAW unretouched photo, Kodak Portra 400 film color palette, soft natural directional light, shallow depth of field with optical lens bokeh, subtle authentic film grain, realistic skin with pores, no digital smoothing, no CGI, no illustration, no 3D render, documentary photography style, wholesome, family-friendly, safe for all ages';
const PROMPT_MAU = [
  NHAN_VAT_MAU + ', standing peacefully in a lush green public garden in bright morning sunlight, eyes gently closed, breathing calmly, serene expression' + PHONG_CACH_MAU,
  NHAN_VAT_MAU + ', standing in a bright cozy family living room in daytime, raising one open hand in a warm welcoming gesture, cheerful mood' + PHONG_CACH_MAU,
  NHAN_VAT_MAU + ', standing on an open balcony at bright golden sunset, gracefully turning her head to look at the view, calm hopeful mood' + PHONG_CACH_MAU,
  NHAN_VAT_MAU + ', walking on a clean quiet city street in early evening under bright warm street lights, taking one confident hopeful step forward, gentle smile' + PHONG_CACH_MAU
];

function anhHopLe(u, toiDa) {
  if (!u || u.length < 32 || u.length > (toiDa || 350000)) return null;
  const jpg = u[0] === 0xFF && u[1] === 0xD8 && u[2] === 0xFF;
  const png = u[0] === 0x89 && u[1] === 0x50 && u[2] === 0x4E && u[3] === 0x47;
  if (!jpg && !png) return null;
  return { u, mime: png ? 'image/png' : 'image/jpeg' };
}
function anhTuB64(b64, toiDa) {
  const t = String(b64 || '').replace(/\s/g, '');
  if (!/^[A-Za-z0-9+/=]+$/.test(t) || t.length < 44) return null;
  let u;
  try { u = Uint8Array.from(atob(t), c => c.charCodeAt(0)); } catch (e) { return null; }
  return anhHopLe(u, toiDa);
}

/* Dịch vụ ngoài tương thích OpenAI Images API — CHỈ chạy khi chủ hệ tự
   cấu hình (mặc định tắt để giữ 0đ). Khoá đặt bằng wrangler secret,
   không bao giờ ghi trong kho mã. */
async function veCanhNgoai(env, prompt) {
  const url = chu(env && env.GITA_VE_ANH_URL, 300);
  const khoa = chu(env && env.GITA_VE_ANH_KHOA, 300);
  if (!url || !khoa) return null;
  const mau = chu(env.GITA_VE_ANH_MAU, 80) || 'gpt-image-1';
  const co = chu(env.GITA_VE_ANH_CO, 20) || '1024x1536';
  try {
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: 'Bearer ' + khoa },
      body: JSON.stringify({ model: mau, prompt: prompt.slice(0, 3000), size: co, n: 1 })
    });
    if (!r.ok) return null;
    const j = await r.json();
    const d = j && j.data && j.data[0];
    if (d && d.b64_json) return anhTuB64(String(d.b64_json), 1500000);
    if (d && d.url) {
      const a = await fetch(String(d.url));
      if (!a.ok) return null;
      return anhHopLe(new Uint8Array(await a.arrayBuffer()), 1500000);
    }
  } catch (e) { /* rớt mạng hoặc dịch vụ lỗi thì về Workers AI */ }
  return null;
}

/* Kết quả AI.run của mẫu vẽ ảnh có thể là { image: base64 } HOẶC một
   luồng byte ảnh (ReadableStream) tuỳ phiên bản binding — nhận cả hai. */
async function anhTuKetQuaAI(o, toiDa) {
  if (!o) return null;
  if (typeof o.image === 'string' && o.image) return anhTuB64(o.image, toiDa);
  if (o.image && typeof o.image === 'object') return await anhTuKetQuaAI(o.image, toiDa);
  if (o instanceof Uint8Array) return anhHopLe(o, toiDa);
  if (o instanceof ArrayBuffer) return anhHopLe(new Uint8Array(o), toiDa);
  if (typeof o.getReader === 'function') {
    const rd = o.getReader(), cac = [];
    let n = 0;
    for (;;) {
      const d = await rd.read();
      if (d.done) break;
      if (d.value && d.value.length) { cac.push(d.value); n += d.value.length; }
      if (n > (toiDa || 350000)) return null;
    }
    const u = new Uint8Array(n);
    let p = 0;
    for (const c of cac) { u.set(c, p); p += c.length; }
    return anhHopLe(u, toiDa);
  }
  return null;
}

/* Vẽ một cảnh: ưu tiên FLUX.2 klein 4B qua multipart (khung 9:16 thật,
   seed cố định + ảnh chân dung gốc tham chiếu giữ đúng một gương mặt,
   chất ảnh như máy chụp); klein lỗi thì về FLUX.1-schnell 8 bước.
   Neuron giữ một lần theo giá klein; nếu phải dùng schnell (rẻ hơn)
   hoặc thất bại thì hoàn lại. */
async function veCanhAI(env, db, prompt, loiRa, refs) {
  if (!env || !env.AI || typeof env.AI.run !== 'function') return null;
  refs = Array.isArray(refs) ? refs.slice(0, 4) : [];
  const [w, h] = KICH_MAU;
  const canKlein = neuronAnh(w, h, refs.length);
  let giu = null;
  try { giu = await giuNeuron(db, env, canKlein); } catch (e) { giu = null; }
  if (giu && giu.duoc === false) { if (loiRa) loiRa.loi = 'het neuron mien phi hom nay'; return null; }
  try {
    const b64 = await veFlux2(env, MAU_ANH, prompt.slice(0, 2048), w, h, SEED_MAU, refs);
    const anh = await anhTuB64(b64, 1500000);
    if (anh) return anh;
    console.warn('[phim-mau] klein tra ket qua rong');
  } catch (e1) {
    console.warn('[phim-mau] klein loi:', chu(e1 && e1.message || e1, 300));
    if (loiRa) loiRa.loi = chu(e1 && e1.message || e1, 200);
  }
  const buoc = 8;
  const canSchnell = Math.ceil(NEURON.schnellO * Math.ceil(w / 512) * Math.ceil(h / 512) + NEURON.schnellBuoc * buoc);
  if (giu && giu.duoc) { try { await chinhNeuron(db, giu.khoa, canSchnell - canKlein); } catch (e0) { /* bảng chặn chưa có */ } }
  let o = null;
  try { o = await env.AI.run(MAU_ANH_DU, { prompt: prompt.slice(0, 2048), steps: buoc }); }
  catch (e2) {
    console.warn('[phim-mau] schnell loi:', chu(e2 && e2.message || e2, 300));
    if (loiRa) loiRa.loi = chu(e2 && e2.message || e2, 200); o = null;
  }
  /* Ảnh FLUX thường 150-600 KB — trần 350 KB chỉ áp cho ảnh khách
     TẢI LÊN ở docAnh, ảnh do AI vẽ được nới riêng. */
  const anh = await anhTuKetQuaAI(o, 1500000);
  if (!anh) {
    if (giu && giu.duoc) { try { await chinhNeuron(db, giu.khoa, -canSchnell); } catch (e3) { /* bảng chặn chưa có */ } }
    if (o && loiRa && !loiRa.loi) {
      const khoa = typeof o === 'object' ? Object.keys(o).join(',') : typeof o;
      console.warn('[phim-mau] ket qua khong phai anh:', khoa);
      loiRa.loi = 'ket qua AI khong phai anh: ' + chu(khoa, 120);
    }
  }
  return anh;
}

/* Lời nhắc động tác gửi máy quay LTX-Video (GPU Kaggle 0đ) theo nhịp
   cảnh — chuyển động THẬT của người trong phim, không phải ảnh tĩnh
   bị kéo pan/zoom (kiểu ghép ảnh bị cấm tuyệt đối). */
const NHAC_CLIP = {
  tho: 'She stands gracefully and breathes calmly, subtle natural chest movement, eyes slowly opening, peaceful serene expression, soft breeze moving a few strands of hair',
  'gio-tay': 'She slowly raises one open hand in a warm welcoming gesture, smooth natural arm motion, warm cheerful smile',
  'quay-dau': 'She gracefully turns her head to look into the distance, hair moving softly, calm hopeful expression',
  buoc: 'She takes one slow confident step forward, natural gentle walking motion, hopeful gentle smile'
};
const R01_HE_THONG = { uid: 'he-thong', role: 'R01' };

function u8B64(u) {
  let s = '';
  for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000));
  return btoa(s);
}
async function layHatB64(env, db, ma) {
  const h = await db.prepare('SELECT bam FROM phim_pt_hat WHERE ma = ?').bind(ma).first();
  if (!h) return '';
  const o = await env.HOSO.get('pt/' + h.bam);
  if (!o) return '';
  const u = o.body instanceof Uint8Array ? o.body : new Uint8Array(await o.arrayBuffer());
  return u8B64(u);
}

/* Bộ ảnh tham chiếu ĐÃ KHÓA của một nhân vật chuẩn (hạt loai
   'nvchuan-<id>', đặt bằng tools/dat-nhan-vat-chuan.mjs từ ảnh chủ hệ
   duyệt). Trả tối đa 4 ảnh base64 — klein nhận input_image_0..3, nhiều
   góc nhìn giúp khóa danh tính chặt hơn một ảnh đơn. Nhân vật chưa
   khóa ảnh (hoặc id lạ) trả mảng rỗng: lời gọi rơi về chuỗi tham
   chiếu mặc định (nvmau-chu → nvmau<phiên bản>). */
export async function layRefNhanVat(env, db, idNhanVat) {
  const refs = [];
  if (!env || !env.HOSO || !nhanVatHopLe(idNhanVat)) return refs;
  const ds = await db.prepare('SELECT ma FROM phim_pt_hat WHERE loai = ? ORDER BY rowid LIMIT 4')
    .bind(loaiHatNV(idNhanVat)).all().catch(() => null);
  for (const r of ((ds && ds.results) || [])) {
    const b64 = await layHatB64(env, db, r.ma);
    if (b64) refs.push(b64);
  }
  return refs;
}

/* Mã hạt đầu tiên của bộ khóa nhân vật (làm dấu nvRef: đổi bộ khóa →
   mã đổi → cảnh theo nhân vật đó được vẽ lại). '' nếu chưa khóa. */
export async function maRefNhanVat(env, db, idNhanVat) {
  if (!env || !env.HOSO || !nhanVatHopLe(idNhanVat)) return '';
  const r = await db.prepare('SELECT ma FROM phim_pt_hat WHERE loai = ? ORDER BY rowid LIMIT 1')
    .bind(loaiHatNV(idNhanVat)).first().catch(() => null);
  return r ? chu(r.ma, 32) : '';
}

function chuanCanh(raw) {
  const ds = (Array.isArray(raw) ? raw : []).slice(0, 12);
  if (ds.length < 1) return loi('THIEU_CANH', 'Cần ít nhất một cảnh.');
  const ra = [];
  for (const c of ds) {
    const may = MAY[c.may] ? c.may : 'dung';
    const nhip = NHIP.indexOf(c.nhip) >= 0 ? c.nhip : 'tho';
    const nen = NEN.indexOf(c.nen) >= 0 ? c.nen : 'phong';
    const giay = Math.min(8, Math.max(2, Math.round(Number(c.giay) || 4)));
    const mot = { giay, may, nen, nhip, nhan: chu(c.nhan, 40), loi: chu(c.loi, 180) };
    /* Cảnh có thể gán một nhân vật chuẩn đã khóa (trainer, mc, ...) —
       máy vẽ dùng bộ ảnh khóa của nhân vật đó để giữ danh tính. */
    if (nhanVatHopLe(c.nv)) mot.nv = chu(c.nv, 40);
    const nenH = chu(c.hatNen, 32);
    const nguoiH = chu(c.hatNguoi, 32);
    if (nenH) mot.hatNen = nenH;
    if (nguoiH) mot.hatNguoi = nguoiH;
    ra.push(mot);
  }
  return { ok: true, canh: ra };
}

async function bamByte(u8) {
  const d = await crypto.subtle.digest('SHA-256', u8);
  return [...new Uint8Array(d)].map(x => x.toString(16).padStart(2, '0')).join('');
}

function docAnh(s) {
  const t = String(s || '');
  const m = t.match(/^data:image\/(jpeg|png);base64,([A-Za-z0-9+/=\s]+)$/);
  const b64 = m ? m[2] : t;
  const mime = m ? (m[1] === 'png' ? 'image/png' : 'image/jpeg') : '';
  if (!/^[A-Za-z0-9+/=\s]+$/.test(b64) || b64.length < 32 || b64.length > 500000) return null;
  let u;
  try { u = Uint8Array.from(atob(b64.replace(/\s/g, '')), c => c.charCodeAt(0)); } catch (e) { return null; }
  if (u.length < 32 || u.length > 350000) return null;
  const jpg = u[0] === 0xFF && u[1] === 0xD8 && u[2] === 0xFF;
  const png = u[0] === 0x89 && u[1] === 0x50 && u[2] === 0x4E && u[3] === 0x47;
  if (!jpg && !png) return null;
  return { u, mime: mime || (png ? 'image/png' : 'image/jpeg') };
}

async function luuHat(env, db, anh, loai) {
  if (!env.HOSO) return loi('CHUA_CO_R2', 'Máy chủ chưa gắn kho tệp.');
  const bam = await bamByte(anh.u);
  const co = await db.prepare('SELECT ma FROM phim_pt_hat WHERE bam = ?').bind(bam).first();
  if (co) {
    await db.prepare('UPDATE phim_pt_hat SET soLan = soLan + 1 WHERE ma = ?').bind(co.ma).run();
    return { ok: true, ma: co.ma, trung: true, byte: anh.u.length };
  }
  const ma = maMoi();
  await env.HOSO.put('pt/' + bam, anh.u, { httpMetadata: { contentType: anh.mime } });
  await db.prepare('INSERT INTO phim_pt_hat (ma, bam, loai, mime, byte, soLan) VALUES (?, ?, ?, ?, ?, 1)')
    .bind(ma, bam, loai, anh.mime, anh.u.length).run();
  return { ok: true, ma, trung: false, byte: anh.u.length };
}

async function ghiCongThuc(db, uid, ten, canh, maCo) {
  const ma = maCo || maMoi();
  const noi = JSON.stringify({ ten, canh });
  if (maCo) {
    await db.prepare('INSERT INTO phim_pt_cong_thuc (ma, uid, ten, noiDung, taoLuc) VALUES (?, ?, ?, ?, ?) ON CONFLICT(ma) DO UPDATE SET noiDung = excluded.noiDung, ten = excluded.ten')
      .bind(ma, uid, ten, noi, Date.now()).run();
  } else {
    await db.prepare('INSERT INTO phim_pt_cong_thuc (ma, uid, ten, noiDung, taoLuc) VALUES (?, ?, ?, ?, ?)')
      .bind(ma, uid, ten, noi, Date.now()).run();
  }
  return { ma, byteCongThuc: noi.length };
}

export async function damBaoMau(env, db) {
  await taoBangPhanTu(db);
  const co = await db.prepare('SELECT noiDung FROM phim_pt_cong_thuc WHERE ma = ?').bind(MA_MAU).first();
  const mau = mauCongThuc();
  const canh = mau.canh;
  let cu = null;
  if (co) { try { cu = JSON.parse(co.noiDung); } catch (e) { cu = null; } }
  /* Xác định CHÂN DUNG THAM CHIẾU trước khi quyết định giữ ảnh cũ.
     Chủ hệ có thể đặt ảnh gương mặt mẫu riêng (hạt loai 'nvmau-chu',
     đặt bằng tools/dat-anh-nhan-vat.mjs) — ảnh đó được ưu tiên tuyệt
     đối và mọi cảnh sẽ tự VẼ LẠI theo đúng gương mặt chủ hệ chọn. */
  let nvHat = null, nvChu = false;
  if (env && env.HOSO) {
    nvHat = await db.prepare("SELECT ma FROM phim_pt_hat WHERE loai = 'nvmau-chu' LIMIT 1").first();
    if (nvHat) nvChu = true;
    else nvHat = await db.prepare('SELECT ma FROM phim_pt_hat WHERE loai = ? LIMIT 1').bind('nvmau' + PHIEN_BAN_ANH).first();
  }
  const nvMa = nvHat ? chu(nvHat.ma, 32) : '';
  if (cu && Array.isArray(cu.canh))
    for (let i = 0; i < canh.length; i++) {
      const h = cu.canh[i] && chu(cu.canh[i].hatNen, 32);
      /* Chỉ giữ ảnh vẽ bằng đúng phiên bản hiện tại VÀ đúng chân dung
         tham chiếu hiện tại; ảnh bản cũ (không dấu pbAnh/nvRef hoặc
         số khác) sẽ được vẽ lại bằng máy ảnh mới. */
      const refCu = cu.canh[i] ? chu(cu.canh[i].nvRef, 32) : '';
      /* Cảnh gắn nhân vật chuẩn (canh.nv) so với bộ khóa CỦA NHÂN VẬT
         ĐÓ; cảnh thường so với chuỗi chân dung mặc định như cũ. */
      let khopRef;
      if (canh[i].nv && nhanVatHopLe(canh[i].nv)) {
        const maNV = await maRefNhanVat(env, db, canh[i].nv);
        khopRef = maNV ? refCu === maNV : (!refCu || refCu === nvMa);
      } else {
        khopRef = nvChu ? refCu === nvMa : (!refCu || refCu === nvMa);
      }
      if (/^[0-9a-f]{32}$/.test(h || '') && cu.canh[i].pbAnh === PHIEN_BAN_ANH && khopRef) {
        canh[i].hatNen = h;
        canh[i].pbAnh = PHIEN_BAN_ANH;   // giữ nguyên dấu, kẻo mất dấu rồi vẽ lại mãi
        if (refCu) canh[i].nvRef = refCu;
      }
      const clip = cu.canh[i] && chu(cu.canh[i].clip, 32);
      if (/^[0-9a-f]{32}$/.test(clip || '')) {
        canh[i].clip = clip;
        if (cu.canh[i].clipXong === true) canh[i].clipXong = true;
      }
    }
  if (!co) await ghiCongThuc(db, 'he-thong', mau.ten, canh, MA_MAU);
  /* Cảnh chưa có ảnh → vẽ bằng AI rồi gắn hạt. Không vẽ được thì để
     trống: trình xem báo "đang vẽ" chứ KHÔNG vẽ người que. Chân dung
     tham chiếu (ưu tiên ảnh của chủ hệ 'nvmau-chu', nếu chưa có thì
     máy tự vẽ một chân dung gốc theo phiên bản) được đưa làm ảnh tham
     chiếu cho mọi cảnh để mặt nhân vật giống nhau tuyệt đối. */
  let veThem = 0;
  const loiAI = { loi: '' };
  if (env && env.HOSO && canh.some(c => !c.hatNen)) {
    const loaiNV = 'nvmau' + PHIEN_BAN_ANH;
    if (!nvHat && env.AI) {
      const anhNV = (await veCanhNgoai(env, PROMPT_NHAN_VAT)) || (await veCanhAI(env, db, PROMPT_NHAN_VAT, loiAI, []));
      if (anhNV) {
        const luuNV = await luuHat(env, db, anhNV, loaiNV);
        if (luuNV.ok) nvHat = { ma: luuNV.ma };
      }
    }
    const nvB64 = nvHat ? (await layHatB64(env, db, nvHat.ma)) : '';
    const refsMacDinh = nvB64 ? [nvB64] : [];
    for (let i = 0; i < canh.length && i < PROMPT_MAU.length; i++) {
      if (canh[i].hatNen) continue;
      /* Cảnh thuộc một nhân vật chuẩn đã khóa ảnh → dùng đúng bộ ảnh
         khóa của nhân vật đó (tối đa 4 góc) thay chân dung mặc định. */
      let refsCanh = refsMacDinh, maNV = '';
      if (canh[i].nv && nhanVatHopLe(canh[i].nv)) {
        const r2 = await layRefNhanVat(env, db, canh[i].nv);
        if (r2.length) { refsCanh = r2; maNV = await maRefNhanVat(env, db, canh[i].nv); }
      }
      const anh = (await veCanhNgoai(env, PROMPT_MAU[i])) || (await veCanhAI(env, db, PROMPT_MAU[i], loiAI, refsCanh));
      if (anh) {
        const luu = await luuHat(env, db, anh, 'nen');
        if (luu.ok) {
          canh[i].hatNen = luu.ma; canh[i].pbAnh = PHIEN_BAN_ANH; veThem++;
          if (maNV) canh[i].nvRef = maNV;
          else if (nvHat) canh[i].nvRef = chu(nvHat.ma, 32);
          /* Ghi ngay sau mỗi cảnh: lỡ hết giờ giữa chừng thì lượt tải
             lại sau (trang xem tự tải lại) vẽ tiếp từ đúng cảnh dở. */
          await ghiCongThuc(db, 'he-thong', mau.ten, canh, MA_MAU);
        }
      }
    }
  }
  /* ── CHUYỂN ĐỘNG THẬT: cảnh đã có ảnh được gửi tới xưởng quay
     LTX-Video (GPU Kaggle miễn phí) quay thành clip người chuyển động
     như quay phim thật. NGHIÊM CẤM ghép ảnh tĩnh giả chuyển động.
     Máy Kaggle chỉ quay khi chủ hệ bấm Run notebook; trang xem tự
     tải lại cho tới khi clip về đủ. */
  let clipMoi = 0;
  if (env && env.HOSO && env.GITA_KHOA_XUONG_QUAY) {
    await taoBangQuay(db);
    for (let i = 0; i < canh.length; i++) {
      if (!canh[i].hatNen) continue;
      if (canh[i].clip) {
        const v = await db.prepare('SELECT trangThai FROM quay_viec WHERE ma = ?').bind(canh[i].clip).first();
        if (v && v.trangThai === 'xong') {
          if (canh[i].clipXong !== true) {
            canh[i].clipXong = true;
            await ghiCongThuc(db, 'he-thong', mau.ten, canh, MA_MAU);
          }
          continue;
        }
        if (v && (v.trangThai === 'cho' || v.trangThai === 'dang')) continue;
        delete canh[i].clip; delete canh[i].clipXong;   // lỗi/mất → xếp lại
      }
      const b64 = await layHatB64(env, db, canh[i].hatNen);
      if (!b64) continue;
      const v2 = await quayVideoDong(
        { anh: b64, loiNhac: NHAC_CLIP[canh[i].nhip] || NHAC_CLIP.tho, phamVi: 'khach' },
        env, db, R01_HE_THONG);
      if (v2.ok) {
        canh[i].clip = v2.ma; clipMoi++;
        await ghiCongThuc(db, 'he-thong', mau.ten, canh, MA_MAU);
      }
    }
  }
  if (cu && (cu.ten !== mau.ten || JSON.stringify(cu.canh) !== JSON.stringify(canh)))
    await ghiCongThuc(db, 'he-thong', mau.ten, canh, MA_MAU);
  return { ok: true, ma: MA_MAU, link: '/phim/xem/' + MA_MAU, daCo: !!co, anhVuaVe: veThem, clipMoi,
    duAnh: canh.every(c => !!c.hatNen), duClip: canh.every(c => !!c.clipXong), loiAI: loiAI.loi || undefined };
}

export async function dongGoiPhanTu(y, env, db, hoSo) {
  if (!laR01(hoSo)) return loi('NOPERM', 'Chỉ chủ hệ đóng gói phim.');
  await taoBangPhanTu(db);
  if (y && y.mau === true) return await damBaoMau(env, db);
  const ten = chu(y && y.ten, 80) || 'Phim ghép';
  const ch = chuanCanh(y && y.canh);
  if (!ch.ok) return ch;
  const anh = Array.isArray(y.anh) ? y.anh.slice(0, 8) : [];
  const hat = {};
  let byteAnh = 0, trung = 0;
  for (const a of anh) {
    const khoa = chu(a.khoa, 20);
    const doc = docAnh(a.duLieu);
    if (!khoa || !doc) return loi('ANH', 'Ảnh phải là JPEG hoặc PNG, mỗi ảnh dưới 350 KB.');
    const luu = await luuHat(env, db, doc, a.loai === 'nguoi' ? 'nguoi' : 'nen');
    if (!luu.ok) return luu;
    hat[khoa] = luu.ma;
    byteAnh += doc.u.length;
    if (luu.trung) trung++;
  }
  for (const c of ch.canh) {
    if (c.hatNen && hat[c.hatNen]) c.hatNen = hat[c.hatNen];
    if (c.hatNguoi && hat[c.hatNguoi]) c.hatNguoi = hat[c.hatNguoi];
    if (c.hatNen && !/^[0-9a-f]{32}$/.test(c.hatNen)) delete c.hatNen;
    if (c.hatNguoi && !/^[0-9a-f]{32}$/.test(c.hatNguoi)) delete c.hatNguoi;
  }
  const g = await ghiCongThuc(db, hoSo.uid || 'r01', ten, ch.canh);
  const giay = ch.canh.reduce((s, c) => s + c.giay, 0);
  return {
    ok: true, ma: g.ma, link: '/phim/xem/' + g.ma,
    byteCongThuc: g.byteCongThuc, byteAnh, anhTrung: trung,
    byteNeuLuuVideo: giay * 250000,
    ghiChu: 'Đã lưu công thức, không lưu file video. Cảnh thiếu ảnh sẽ chờ AI vẽ — hệ thống không bao giờ vẽ hình người que.'
  };
}

export async function xemPhanTu(y, env, db, hoSo) {
  if (!laR01(hoSo)) return loi('NOPERM', 'Chỉ chủ hệ xem kho phim.');
  await taoBangPhanTu(db);
  const ds = await db.prepare('SELECT ma, ten, taoLuc, length(noiDung) AS byte FROM phim_pt_cong_thuc WHERE uid = ? OR ma = ? ORDER BY taoLuc DESC LIMIT 30')
    .bind(hoSo.uid || '', MA_MAU).all();
  const hat = await db.prepare('SELECT COUNT(*) AS so, COALESCE(SUM(byte), 0) AS byte FROM phim_pt_hat').first();
  return { ok: true, ds: (ds && ds.results) || [], hat: hat || { so: 0, byte: 0 } };
}

function jsonCongKhai(noi) {
  let o;
  try { o = JSON.parse(noi); } catch (e) { return null; }
  if (!o || !Array.isArray(o.canh)) return null;
  /* pbAnh/nvRef/clip/clipXong là dấu kỹ thuật nội bộ — không lộ ra
     ngoài; cảnh đã quay xong thì công khai đường phát clip `video`. */
  return {
    ten: chu(o.ten, 80),
    canh: o.canh.map(c => {
      const { pbAnh, nvRef, clip, clipXong, ...con } = c;
      if (clipXong === true && /^[0-9a-f]{32}$/.test(clip || '')) con.video = '/quay/phim/' + clip + '.mp4';
      return con;
    })
  };
}

const DAU = { 'Access-Control-Allow-Origin': '*', 'X-Content-Type-Options': 'nosniff' };

/* Trình xem: cảnh nào đã có clip do AI QUAY THẬT (LTX-Video trên GPU
   miễn phí) thì phát clip bằng thẻ video; cảnh chưa quay xong chỉ hiện
   ảnh poster TĨNH kèm báo "đang quay" — NGHIÊM CẤM kéo pan/zoom ảnh
   tĩnh giả chuyển động (ghép ảnh), cũng không vẽ người que. */
function trangXem() {
  return `<!DOCTYPE html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Phim GITA</title><style>
body{margin:0;background:#111;color:#f3efe6;font-family:Segoe UI,sans-serif;display:flex;flex-direction:column;align-items:center}
p{max-width:420px;font-size:14px;line-height:1.45;padding:0 16px}
#khung{position:relative;width:min(92vw,360px);aspect-ratio:9/16;background:#000;border-radius:8px;overflow:hidden}
#vid,#anh{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
#cho{position:absolute;left:0;right:0;top:38%;display:none;text-align:center;background:rgba(0,0,0,.55);padding:10px 8px;font-size:14px;line-height:1.5}
#phu{position:absolute;left:0;right:0;bottom:0;background:rgba(0,0,0,.55);padding:10px 14px;font-size:15px;line-height:1.4}
#nhan{font-weight:600;margin-bottom:2px}
button{margin:12px;padding:8px 16px}
</style></head><body>
<p id="chu">Đang ghép phim từ công thức phân tử.</p>
<div id="khung">
<img id="anh" alt="">
<video id="vid" muted loop playsinline></video>
<div id="cho">Cảnh đang được AI quay chuyển động thật.<br>Trang tự tải lại sau ít phút.</div>
<div id="phu"><div id="nhan"></div><div id="loi"></div></div>
</div>
<button id="lai" type="button">Xem lại</button>
<script>
const ma = location.pathname.split('/').pop();
const vid = document.getElementById('vid'), anh = document.getElementById('anh');
const cho = document.getElementById('cho'), chuE = document.getElementById('chu');
const nhanE = document.getElementById('nhan'), loiE = document.getElementById('loi');
let phim = null, dem = null;
function hien(i){
  if(!phim) return;
  if(i >= phim.canh.length){
    vid.pause(); chuE.textContent = 'Hết phim. Bấm Xem lại để xem từ đầu.';
    return;
  }
  const c = phim.canh[i];
  nhanE.textContent = c.nhan || '';
  loiE.textContent = c.loi || '';
  if(c.video){
    anh.style.display = 'none'; cho.style.display = 'none'; vid.style.display = 'block';
    if(vid.getAttribute('src') !== c.video) vid.src = c.video;
    try { vid.currentTime = 0; } catch(e) {}
    vid.play().catch(function(){});
  } else {
    vid.pause(); vid.style.display = 'none';
    if(c.hatNen){ anh.src = '/phim/hat/' + ma + '/' + c.hatNen; anh.style.display = 'block'; }
    else anh.style.display = 'none';
    cho.style.display = 'block';
  }
  clearTimeout(dem);
  dem = setTimeout(function(){ hien(i + 1); }, (c.giay || 4) * 1000);
}
document.getElementById('lai').onclick = function(){ hien(0); };
fetch('/phim/cong-thuc/' + ma).then(r => r.json()).then(j => {
  phim = j;
  chuE.textContent = j.ten + ' — cảnh chuyển động do AI quay thật, ghép ngay tại máy bạn.';
  if((j.canh || []).some(c => !c.video)) setTimeout(() => location.reload(), 45000);
  hien(0);
}).catch(() => { chuE.textContent = 'Không ghép được phim này.'; });
</script></body></html>`;
}

export async function phucVuPhimPhanTu(req, env, duong) {
  if (req.method !== 'GET' && req.method !== 'HEAD')
    return new Response('Chỉ xem bằng đường dẫn.', { status: 405, headers: DAU });
  const db = env.CSDL;
  if (!db) return new Response('Chưa có cơ sở dữ liệu.', { status: 500, headers: DAU });
  await taoBangPhanTu(db);
  if (duong === '/phim/mau') {
    const m = await damBaoMau(env, db);
    return Response.redirect(new URL(m.link, req.url).toString(), 302);
  }
  let khop = duong.match(/^\/phim\/xem\/([0-9a-z-]{8,40})$/);
  if (khop) {
    /* Trang xem phim mẫu tự soát lại (vẽ ảnh còn thiếu, nhận clip đã
       quay xong) trước khi trả trình xem — mỗi lần tải lại là một lần
       máy tự làm tiếp việc dở. */
    if (khop[1] === MA_MAU) { try { await damBaoMau(env, db); } catch (e) { /* xem vẫn tiếp */ } }
    const co = await db.prepare('SELECT ma FROM phim_pt_cong_thuc WHERE ma = ?').bind(khop[1]).first();
    if (!co) return new Response('Không có phim này.', { status: 404, headers: DAU });
    return new Response(req.method === 'HEAD' ? null : trangXem(), {
      status: 200,
      headers: { ...DAU, 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' }
    });
  }
  khop = duong.match(/^\/phim\/cong-thuc\/([0-9a-z-]{8,40})$/);
  if (khop) {
    if (khop[1] === MA_MAU) { try { await damBaoMau(env, db); } catch (e) { /* vẫn trả công thức hiện có */ } }
    const co = await db.prepare('SELECT ten, noiDung FROM phim_pt_cong_thuc WHERE ma = ?').bind(khop[1]).first();
    const o = co && jsonCongKhai(co.noiDung);
    if (!o) return new Response('{}', { status: 404, headers: DAU });
    return new Response(req.method === 'HEAD' ? null : JSON.stringify(o), {
      status: 200,
      headers: { ...DAU, 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'public, max-age=60' }
    });
  }
  khop = duong.match(/^\/phim\/hat\/([0-9a-z-]{8,40})\/([0-9a-f]{32})$/);
  if (khop) {
    const ct = await db.prepare('SELECT noiDung FROM phim_pt_cong_thuc WHERE ma = ?').bind(khop[1]).first();
    if (!ct || ct.noiDung.indexOf(khop[2]) < 0) return new Response('Không có ảnh.', { status: 404, headers: DAU });
    const hat = await db.prepare('SELECT bam, mime FROM phim_pt_hat WHERE ma = ?').bind(khop[2]).first();
    if (!hat || !env.HOSO) return new Response('Không có ảnh.', { status: 404, headers: DAU });
    const o = await env.HOSO.get('pt/' + hat.bam);
    if (!o) return new Response('Không có ảnh.', { status: 404, headers: DAU });
    return new Response(req.method === 'HEAD' ? null : o.body, {
      status: 200,
      headers: { ...DAU, 'Content-Type': hat.mime, 'Cache-Control': 'public, max-age=86400' }
    });
  }
  return new Response('Không có đường này.', { status: 404, headers: DAU });
}
