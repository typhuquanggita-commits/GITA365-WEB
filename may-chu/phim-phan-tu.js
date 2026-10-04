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
   Nhân vật phải NHƯ CHỤP TỪ MÁY ẢNH THẬT: prompt nói ngôn ngữ nhiếp
   ảnh (máy full-frame, lens 85mm f/1.4, ảnh RAW chưa retouch, da có lỗ
   chân lông, hạt film Kodak Portra) và CẤM các từ gây bóng "ảnh AI"
   (masterpiece/beauty/digital art). Ưu tiên: dịch vụ ngoài do chủ hệ
   gắn khoá → FLUX.2 klein 4B (multipart, 9:16 thật 576×1024, có seed
   giữ mặt) → FLUX.1-schnell 8 bước (khung vuông, trình xem tự cắt).
   PHIEN_BAN_ANH: đổi số này để máy tự VẼ LẠI toàn bộ cảnh mẫu khi
   nâng cấp mô hình/prompt. */
const PHIEN_BAN_ANH = 2;
const SEED_MAU = 20260365;
const KICH_MAU = [576, 1024];
/* Prompt phải qua được cổng an toàn 8007 của Workers AI: luôn kèm
   "wholesome, fully clothed, modest, family-friendly, safe for all
   ages", tránh mọi từ ngữ mờ ám dù vô tình. */
const NHAN_VAT_MAU = 'A Vietnamese woman in her mid-30s, long black hair neatly tied back, warm gentle face, realistic natural skin with visible pores and fine texture, kind expressive eyes, elegant traditional white ao dai, fully clothed modest attire';
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
   seed cố định giữ mặt nhân vật xuyên suốt, chất ảnh như máy chụp);
   klein lỗi thì về FLUX.1-schnell 8 bước. Neuron giữ một lần theo giá
   klein; nếu phải dùng schnell (rẻ hơn) hoặc thất bại thì hoàn lại. */
async function veCanhAI(env, db, prompt, loiRa) {
  if (!env || !env.AI || typeof env.AI.run !== 'function') return null;
  const [w, h] = KICH_MAU;
  const canKlein = neuronAnh(w, h, 0);
  let giu = null;
  try { giu = await giuNeuron(db, env, canKlein); } catch (e) { giu = null; }
  if (giu && giu.duoc === false) { if (loiRa) loiRa.loi = 'het neuron mien phi hom nay'; return null; }
  try {
    const b64 = await veFlux2(env, MAU_ANH, prompt.slice(0, 2048), w, h, SEED_MAU, []);
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
  if (cu && Array.isArray(cu.canh))
    for (let i = 0; i < canh.length; i++) {
      const h = cu.canh[i] && chu(cu.canh[i].hatNen, 32);
      /* Chỉ giữ ảnh vẽ bằng đúng phiên bản hiện tại; ảnh bản cũ (không
         có dấu pbAnh hoặc số khác) sẽ được vẽ lại bằng máy ảnh mới. */
      if (/^[0-9a-f]{32}$/.test(h || '') && cu.canh[i].pbAnh === PHIEN_BAN_ANH) canh[i].hatNen = h;
    }
  if (!co) await ghiCongThuc(db, 'he-thong', mau.ten, canh, MA_MAU);
  /* Cảnh chưa có ảnh → vẽ bằng AI rồi gắn hạt. Không vẽ được thì để
     trống: trình xem báo "đang vẽ" chứ KHÔNG vẽ người que. */
  let veThem = 0;
  const loiAI = { loi: '' };
  if (env && env.HOSO && canh.some(c => !c.hatNen)) {
    for (let i = 0; i < canh.length && i < PROMPT_MAU.length; i++) {
      if (canh[i].hatNen) continue;
      const anh = (await veCanhNgoai(env, PROMPT_MAU[i])) || (await veCanhAI(env, db, PROMPT_MAU[i], loiAI));
      if (anh) {
        const luu = await luuHat(env, db, anh, 'nen');
        if (luu.ok) {
          canh[i].hatNen = luu.ma; canh[i].pbAnh = PHIEN_BAN_ANH; veThem++;
          /* Ghi ngay sau mỗi cảnh: lỡ hết giờ giữa chừng thì lượt tải
             lại sau (trang xem tự tải lại) vẽ tiếp từ đúng cảnh dở. */
          await ghiCongThuc(db, 'he-thong', mau.ten, canh, MA_MAU);
        }
      }
    }
  }
  if (cu && (cu.ten !== mau.ten || JSON.stringify(cu.canh) !== JSON.stringify(canh)))
    await ghiCongThuc(db, 'he-thong', mau.ten, canh, MA_MAU);
  return { ok: true, ma: MA_MAU, link: '/phim/xem/' + MA_MAU, daCo: !!co, anhVuaVe: veThem, duAnh: canh.every(c => !!c.hatNen), loiAI: loiAI.loi || undefined };
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
  /* pbAnh là dấu kỹ thuật nội bộ (phiên bản máy vẽ) — không lộ ra ngoài */
  return { ten: chu(o.ten, 80), canh: o.canh.map(c => { const { pbAnh, ...con } = c; return con; }) };
}

const DAU = { 'Access-Control-Allow-Origin': '*', 'X-Content-Type-Options': 'nosniff' };

function trangXem() {
  return `<!DOCTYPE html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Phim GITA</title><style>
body{margin:0;background:#111;color:#f3efe6;font-family:Segoe UI,sans-serif;display:flex;flex-direction:column;align-items:center}
p{max-width:420px;font-size:14px;line-height:1.45;padding:0 16px}
canvas{width:min(92vw,360px);height:auto;background:#000;border-radius:8px}
button{margin:12px;padding:8px 16px}
</style></head><body>
<p id="chu">Đang ghép phim từ công thức. Không tải file video.</p>
<canvas id="man" width="360" height="640"></canvas>
<button id="lai" type="button">Xem lại</button>
<script>
const ma = location.pathname.split('/').pop();
const MAY = ${JSON.stringify(MAY)};
const man = document.getElementById('man');
const ctx = man.getContext('2d');
let phim = null, i = 0, t0 = 0, chay = false, anh = {};
function lerp(a,b,t){return a+(b-a)*t}
function cam(c,t){
  const m = MAY[c.may] || MAY.dung;
  const k = t*t*(3-2*t);
  return {x:lerp(m.x,m.x2,k), y:lerp(m.y,m.y2,k), z:lerp(m.z,m.z2,k)};
}
function nen(ten){
  const g = ctx.createLinearGradient(0,0,0,640);
  if(ten==='troi-chieu'){g.addColorStop(0,'#c46a3a');g.addColorStop(1,'#2a211c')}
  else if(ten==='dem'){g.addColorStop(0,'#1b2744');g.addColorStop(1,'#0c0e14')}
  else if(ten==='phong'){g.addColorStop(0,'#d8c7a8');g.addColorStop(1,'#6d5b48')}
  else {g.addColorStop(0,'#8ec6e8');g.addColorStop(1,'#d7c39a')}
  ctx.fillStyle=g; ctx.fillRect(0,0,360,640);
}
function nenCho(ten){
  nen(ten);
  ctx.fillStyle='rgba(0,0,0,.5)'; ctx.fillRect(0,260,360,120);
  ctx.fillStyle='#f3efe6'; ctx.textAlign='center';
  ctx.font='600 16px Segoe UI'; ctx.fillText('Cảnh đang được AI vẽ lại.',180,308);
  ctx.font='14px Segoe UI'; ctx.fillText('Trang tự tải lại sau ít phút.',180,334);
  ctx.textAlign='left';
}
function veAnh(img, x, y, w, h){
  const s = Math.max(w/img.width, h/img.height);
  const dw = img.width*s, dh = img.height*s;
  ctx.drawImage(img, x+(w-dw)/2, y+(h-dh)/2, dw, dh);
}
function ve(c, t){
  const m = cam(c, Math.min(1, t/c.giay));
  ctx.save(); ctx.translate(360*m.x, 640*m.y); ctx.scale(m.z,m.z); ctx.translate(-180,-320);
  if(anh[c.hatNen]) veAnh(anh[c.hatNen], 0, 0, 360, 640); else nenCho(c.nen);
  if(anh[c.hatNguoi]){
    const sx = c.nhip==='buoc' ? (Math.min(1,t/c.giay)*28-14) : Math.sin(t*1.4)*8;
    veAnh(anh[c.hatNguoi], 90+sx, 180, 180, 320);
  }
  ctx.restore();
  ctx.fillStyle='rgba(0,0,0,.55)'; ctx.fillRect(0,540,360,100);
  ctx.fillStyle='#fff'; ctx.font='16px Segoe UI'; ctx.fillText(c.nhan||'', 16, 568);
  ctx.font='15px Segoe UI';
  const loi = c.loi||'';
  ctx.fillText(loi.slice(0,42), 16, 594);
  if(loi.length>42) ctx.fillText(loi.slice(42,84), 16, 616);
}
function vong(now){
  if(!chay||!phim) return;
  const c = phim.canh[i];
  const t = (now-t0)/1000;
  if(t>=c.giay){ i++; if(i>=phim.canh.length){ chay=false; document.getElementById('chu').textContent='Hết phim. Bấm Xem lại để ghép lại. Không có file video.'; return; } t0=now; }
  ve(phim.canh[Math.min(i, phim.canh.length-1)], Math.max(0,(now-t0)/1000));
  requestAnimationFrame(vong);
}
function bat(){ i=0; t0=performance.now(); chay=true; requestAnimationFrame(vong); }
document.getElementById('lai').onclick=bat;
function tai(id){
  return new Promise(ok=>{
    if(!id||anh[id]) return ok();
    const im = new Image();
    im.onload=()=>{ anh[id]=im; ok(); };
    im.onerror=()=>ok();
    im.src='/phim/hat/'+ma+'/'+id;
  });
}
fetch('/phim/cong-thuc/'+ma).then(r=>r.json()).then(async j=>{
  phim=j;
  const ids=[];
  (j.canh||[]).forEach(c=>{ if(c.hatNen) ids.push(c.hatNen); if(c.hatNguoi) ids.push(c.hatNguoi); });
  for(const id of ids) await tai(id);
  document.getElementById('chu').textContent=j.ten+' — ghép tại máy bạn, không tải video.';
  if((j.canh||[]).some(c=>!c.hatNen)) setTimeout(()=>location.reload(), 45000);
  bat();
}).catch(()=>{ document.getElementById('chu').textContent='Không ghép được phim này.'; });
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
    const co = await db.prepare('SELECT ma FROM phim_pt_cong_thuc WHERE ma = ?').bind(khop[1]).first();
    if (!co) return new Response('Không có phim này.', { status: 404, headers: DAU });
    return new Response(req.method === 'HEAD' ? null : trangXem(), {
      status: 200,
      headers: { ...DAU, 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' }
    });
  }
  khop = duong.match(/^\/phim\/cong-thuc\/([0-9a-z-]{8,40})$/);
  if (khop) {
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
