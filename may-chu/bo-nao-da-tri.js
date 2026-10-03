/* ═══════════════════════════════════════════════════════════════
   GITA 365 — BỘ NÃO ĐA TRÍ · ĐỊNH TUYẾN ĐA MÔ HÌNH, TỐI ƯU TỪNG TOKEN

   Chủ hệ (đã quyết, mở vùng đỏ AT5): tích hợp Claude · DeepSeek ·
   ChatGPT · Grok · Gemini để điều hành GITA365. Tệp này là cửa DUY NHẤT
   làm việc đó, và nó đứng SAU trần an toàn đã dựng trước:

     MỌI lời gọi → soatRaNhaCungCap (an-toan-ai.js) → Điều 13
     Không cổng thứ hai, không bộ dò ẩn danh thứ hai (9.99.83).

   ══ VÌ SAO ĐỊNH TUYẾN THEO BẬC, KHÔNG GỌI THẲNG MÔ HÌNH MẠNH NHẤT ══
   Chi phí đi theo token × đơn giá; đơn giá mô hình mạnh nhất gấp vài
   chục lần mô hình rẻ. Phần lớn việc (phân loại, tóm tắt, soạn nháp)
   mô hình rẻ làm đủ. Nên:

     bậc 0  bộ nhớ đệm D1        — 0 token (câu đã hỏi, đã sạch)
     bậc 1  Workers AI           — trong vùng Cloudflare, hạn mức miễn phí
     bậc 2  DeepSeek             — rẻ nhất trong nhóm ngoài
     bậc 3  Gemini Flash · GPT   — nhanh, rẻ
     bậc 4  Claude · Grok        — chỉ việc chiến lược, R01, có ngân sách

   Mỗi loại việc có [bậc thấp nhất, bậc cao nhất]. Máy thử RẺ trước, hỏng
   hoặc hết ngân sách thì leo bậc. Người dùng thấy chưa đủ tốt thì bấm
   "lên bậc" — leo có chủ ý thay vì mặc định đắt.

   ══ TỰ TỐI ƯU NHƯNG KHÔNG TỰ ĐỔI LUẬT ══
   Mỗi câu trả lời được chấm tốt/chưa tốt → bảng danhGiaDaTri. Màn
   bo-nao-da-tri đọc bảng ấy và ĐỀ XUẤT hạ trần bậc cho loại việc nào
   mà bậc rẻ đã đạt chất lượng. Máy đề xuất, chủ hệ quyết (AT5) — máy
   không tự sửa bảng LOAI.

   ══ MẶC ĐỊNH TẮT ══
   Không có GITA_DA_TRI_BAT = "1" → cửa đóng. Nhà cung cấp nào chưa có
   khoá (secret) → coi như không tồn tại. Chế độ tiết kiệm
   (GITA_CHE_DO_TIET_KIEM = "1") → chỉ còn bộ nhớ đệm + Workers AI.
   ═══════════════════════════════════════════════════════════════ */
'use strict';

import { Kho } from './nen.js';
import { laNguoiNha, laR01, tenNguoiDung as ten } from './vai-tro.js';
import { soatRaNhaCungCap } from './an-toan-ai.js';

/* Nhà cung cấp. `kieu` quyết cách gọi: oa = giao thức OpenAI chat
   completions (DeepSeek · Gemini · OpenAI · xAI đều nói được), an =
   Anthropic messages, cf = binding Workers AI. Cổng cố định — không nhận
   URL tuỳ ý (chống SSRF, cùng luật wrangler.toml dòng 199).
   `mau` mặc định chỉ đặt cho mô hình đã ổn định lâu; Claude và Grok đổi
   tên mô hình thường xuyên nên BẮT BUỘC khai GITA_MAU_* — không đoán. */
export const NCC = [
  { ma: 'cf-workers-ai', ten: 'Workers AI (Cloudflare)', bac: 1, kieu: 'cf',
    khoa: null, bienMau: 'GITA_MAU_CF', mau: '@cf/meta/llama-3.1-8b-instruct', ngan: 0 },
  { ma: 'deepseek', ten: 'DeepSeek', bac: 2, kieu: 'oa', cong: 'https://api.deepseek.com/chat/completions',
    khoa: 'GITA_KHOA_DEEPSEEK', bienMau: 'GITA_MAU_DEEPSEEK', mau: 'deepseek-chat', ngan: 400000 },
  { ma: 'gemini', ten: 'Gemini (Google)', bac: 3, kieu: 'oa',
    cong: 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
    khoa: 'GITA_KHOA_GEMINI', bienMau: 'GITA_MAU_GEMINI', mau: 'gemini-2.5-flash', ngan: 300000 },
  { ma: 'openai', ten: 'ChatGPT (OpenAI)', bac: 3, kieu: 'oa', cong: 'https://api.openai.com/v1/chat/completions',
    khoa: 'GITA_KHOA_OPENAI', bienMau: 'GITA_MAU_OPENAI', mau: 'gpt-4o-mini', ngan: 300000 },
  { ma: 'anthropic', ten: 'Claude (Anthropic)', bac: 4, kieu: 'an', cong: 'https://api.anthropic.com/v1/messages',
    khoa: 'GITA_KHOA_ANTHROPIC', bienMau: 'GITA_MAU_ANTHROPIC', mau: '', ngan: 100000 },
  { ma: 'xai', ten: 'Grok (xAI)', bac: 4, kieu: 'oa', cong: 'https://api.x.ai/v1/chat/completions',
    khoa: 'GITA_KHOA_XAI', bienMau: 'GITA_MAU_XAI', mau: '', ngan: 100000 }
];

/* Loại việc → khung bậc, trần token ra, trần ký tự vào, thời hạn nhớ đệm.
   Trần token ra là đòn tiết kiệm lớn nhất: mô hình viết dài khi được
   phép viết dài. */
export const LOAI = {
  phanLoai:  { ten: 'Phân loại / gắn nhãn', tu: 1, den: 2, ra: 200,  vao: 2000, nho: 30, r01: false },
  tomTat:    { ten: 'Tóm tắt',              tu: 1, den: 3, ra: 400,  vao: 6000, nho: 7,  r01: false },
  soan:      { ten: 'Soạn nháp',            tu: 1, den: 3, ra: 1000, vao: 4000, nho: 1,  r01: false },
  phanTich:  { ten: 'Phân tích sâu',        tu: 2, den: 4, ra: 1500, vao: 6000, nho: 1,  r01: false },
  chienLuoc: { ten: 'Chiến lược cấp hệ',    tu: 3, den: 4, ra: 2000, vao: 6000, nho: 1,  r01: true }
};

/* Lời hệ thống NGẮN — gửi mỗi lượt nên mỗi chữ là token nhân với số lượt. */
const LOI_HE = 'Bạn là trợ lý GITA365 (giáo dục gia đình). Trả lời tiếng Việt, ngắn, có cấu trúc. ' +
  'Không bịa dữ kiện, nguồn hay con số; chưa chắc thì nói chưa chắc. Không chẩn đoán y tế/pháp lý. ' +
  'Đây là bản nháp để người duyệt.';

const HAN_NGAY = { r01: 200, nha: 60 };
const TRAN_TRI_THUC = 800;

let daDung = false;
async function dungBang(db) {
  if (daDung) return;
  await db.batch([
    db.prepare('CREATE TABLE IF NOT EXISTS triNhoDaTri (khoa TEXT PRIMARY KEY, loai TEXT, ncc TEXT, ' +
      'traLoi TEXT, luc INTEGER, hetHan INTEGER, dung INTEGER DEFAULT 0)'),
    db.prepare('CREATE TABLE IF NOT EXISTS soTokenDaTri (ngay TEXT, ncc TEXT, luot INTEGER DEFAULT 0, ' +
      'vao INTEGER DEFAULT 0, ra INTEGER DEFAULT 0, PRIMARY KEY (ngay, ncc))'),
    db.prepare('CREATE TABLE IF NOT EXISTS danhGiaDaTri (loai TEXT, ncc TEXT, tot INTEGER DEFAULT 0, ' +
      'xau INTEGER DEFAULT 0, PRIMARY KEY (loai, ncc))')
  ]);
  daDung = true;
}

const homNay = () => new Date().toISOString().slice(0, 10);
const moBat = env => String((env && env.GITA_DA_TRI_BAT) || '') === '1';
const tietKiem = env => String((env && env.GITA_CHE_DO_TIET_KIEM) || '') === '1';

function mauCua(n, env) {
  const m = String((env && env[n.bienMau]) || n.mau || '').trim();
  return /^[@A-Za-z0-9._:/-]{1,100}$/.test(m) ? m : '';
}
function nganCua(n, env) {
  const v = Number(env && env['GITA_NGAN_TOKEN_' + n.ma.replace(/-/g, '_').toUpperCase()]);
  return v > 0 ? v : n.ngan;
}
/* Có dùng được không — chỉ dựa trên cấu hình, KHÔNG lộ khoá. */
function sanSang(n, env) {
  if (!mauCua(n, env)) return false;
  if (n.kieu === 'cf') return !!(env && env.AI && typeof env.AI.run === 'function');
  return !!String((env && env[n.khoa]) || '');
}

/* Chuẩn hoá để câu hỏi giống nhau trúng cùng một ô đệm: hạ chữ, gộp
   khoảng trắng. KHÔNG bỏ dấu — "ba" và "bà" là hai câu khác nhau. */
async function bam(s) {
  const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return Array.from(new Uint8Array(b), x => x.toString(16).padStart(2, '0')).join('');
}
const chuan = s => String(s || '').toLowerCase().replace(/\s+/g, ' ').trim();

async function goiMot(n, env, loai, cau, triThuc) {
  const l = LOAI[loai], model = mauCua(n, env);
  const he = LOI_HE + (triThuc ? '\nNguyên lý tham chiếu (dùng nếu hợp):\n' + triThuc : '');
  const messages = [{ role: 'system', content: he }, { role: 'user', content: cau }];
  if (n.kieu === 'cf') {
    const r = await env.AI.run(model, { messages, max_tokens: l.ra });
    const u = (r && r.usage) || {};
    return { text: String((r && r.response) || ''), vao: u.prompt_tokens || 0, ra: u.completion_tokens || 0, model };
  }
  const khoa = String(env[n.khoa]);
  let body, headers;
  if (n.kieu === 'an') {
    body = { model, system: he, messages: [{ role: 'user', content: cau }], max_tokens: l.ra, temperature: 0.3 };
    headers = { 'x-api-key': khoa, 'anthropic-version': '2023-06-01', 'Content-Type': 'application/json' };
  } else {
    body = { model, messages, max_tokens: l.ra, temperature: 0.3 };
    headers = { Authorization: 'Bearer ' + khoa, 'Content-Type': 'application/json' };
  }
  const p = await fetch(n.cong, { method: 'POST', redirect: 'error', headers,
    body: JSON.stringify(body), signal: AbortSignal.timeout(25000) });
  if (!p.ok) throw new Error('HTTP ' + p.status);
  const j = await p.json();
  if (n.kieu === 'an') {
    const t = (j.content || []).filter(c => c.type === 'text').map(c => c.text).join('\n');
    const u = j.usage || {};
    return { text: t, vao: u.input_tokens || 0, ra: u.output_tokens || 0, model };
  }
  const u = j.usage || {};
  return { text: String((j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content) || ''),
    vao: u.prompt_tokens || 0, ra: u.completion_tokens || 0, model };
}

async function daDungToken(db, ncc) {
  const r = await db.prepare('SELECT vao + ra AS t FROM soTokenDaTri WHERE ngay = ? AND ncc = ?')
    .bind(homNay(), ncc).first();
  return (r && r.t) || 0;
}
async function ghiToken(db, ncc, vao, ra) {
  await db.prepare('INSERT INTO soTokenDaTri (ngay, ncc, luot, vao, ra) VALUES (?, ?, 1, ?, ?) ' +
    'ON CONFLICT(ngay, ncc) DO UPDATE SET luot = luot + 1, vao = vao + excluded.vao, ra = ra + excluded.ra')
    .bind(homNay(), ncc, vao, ra).run();
}

/* Chọn ứng viên: đủ cấu hình · trong khung bậc · còn ngân sách · rẻ trước.
   `tuBac` cho phép người dùng chủ động leo bậc. */
async function ungVien(env, db, l, tuBac, hoSo) {
  const tu = Math.max(l.tu, Number(tuBac) || 0);
  const den = laR01(hoSo) ? l.den : Math.min(l.den, 3);
  const ds = [];
  for (const n of NCC) {
    if (n.bac < tu || n.bac > den || !sanSang(n, env)) continue;
    if (tietKiem(env) && n.kieu !== 'cf') continue;
    const ngan = nganCua(n, env);
    if (ngan > 0 && (await daDungToken(db, n.ma)) >= ngan) continue;
    ds.push(n);
  }
  return ds.sort((a, b) => a.bac - b.bac);
}

function kiemVao(y, hoSo) {
  const loai = String((y || {}).loai || 'soan');
  const l = LOAI[loai];
  if (!l) return { loi: { ok: false, code: 'LOAILA', error: 'Loại việc không hợp lệ.' } };
  if (l.r01 && !laR01(hoSo)) return { loi: { ok: false, code: 'NOPERM', error: 'Việc chiến lược cấp hệ chỉ mở cho Super Admin.' } };
  const cau = String((y || {}).cau || '').trim();
  if (cau.length < 4 || cau.length > l.vao)
    return { loi: { ok: false, code: 'CAU_KHONG_HOP_LE', error: 'Câu hỏi phải từ 4 đến ' + l.vao + ' ký tự.' } };
  const triThuc = String((y || {}).triThuc || '').slice(0, TRAN_TRI_THUC);
  return { loai, l, cau, triThuc };
}

async function canHan(db, hoSo) {
  const han = laR01(hoSo) ? HAN_NGAY.r01 : HAN_NGAY.nha;
  const dem = await Kho.demNhip(db, 'da-tri·' + hoSo.uid + '·' + homNay(), 86400);
  return dem > han;
}

/* ═══════════════ CỬA: HỎI BỘ NÃO ĐA TRÍ ═══════════════ */
export async function hoiDaTri(y, env, db, hoSo) {
  if (!laNguoiNha(hoSo)) return { ok: false, code: 'NOPERM', error: 'Mở cho R01–R12.' };
  if (!moBat(env)) return { ok: false, code: 'CUADONG',
    error: 'Bộ não đa trí đang tắt. Chủ hệ bật bằng biến GITA_DA_TRI_BAT = 1 trên Cloudflare.' };
  const v = kiemVao(y, hoSo);
  if (v.loi) return v.loi;
  await dungBang(db);
  if (await canHan(db, hoSo)) return { ok: false, code: 'VUOT_HAN', error: 'Đã hết lượt hỏi trong ngày.' };

  /* Sàng TRƯỚC cả bộ nhớ đệm: một chuỗi bẩn không được thành khoá đệm,
     cũng không được đi tới bất kỳ đâu (Điều 13). */
  const sang = await soatRaNhaCungCap({ provider: 'cf-workers-ai', cau: v.cau, triThuc: v.triThuc }, env, db, hoSo);
  if (!sang.cho) return { ok: false, code: sang.code, ngo: sang.ngo, error: sang.vi };

  const khoa = await bam(v.loai + '|' + chuan(v.cau) + '|' + chuan(v.triThuc));
  const tuBac = Number((y || {}).tuBac) || 0;
  if (!tuBac) {
    const d = await db.prepare('SELECT ncc, traLoi FROM triNhoDaTri WHERE khoa = ? AND hetHan > ?')
      .bind(khoa, Date.now()).first();
    if (d) {
      await db.prepare('UPDATE triNhoDaTri SET dung = dung + 1 WHERE khoa = ?').bind(khoa).run();
      await ghiToken(db, 'dem', 0, 0);
      return { ok: true, traLoi: d.traLoi, ncc: d.ncc, bac: 0, tuDem: true, khoa, token: 0, canDuyet: true };
    }
  }

  const ds = await ungVien(env, db, v.l, tuBac, hoSo);
  if (!ds.length) return { ok: false, code: 'KHONG_NCC',
    error: tietKiem(env) ? 'Chế độ tiết kiệm: chỉ còn Workers AI, và nó chưa được nối.' :
      'Chưa có nhà cung cấp nào sẵn sàng ở bậc này (thiếu khoá, hết ngân sách ngày, hoặc vượt quyền).' };

  const thu = [];
  for (const n of ds) {
    const g = await soatRaNhaCungCap({ provider: n.ma, cau: v.cau, triThuc: v.triThuc }, env, db, hoSo);
    if (!g.cho) return { ok: false, code: g.code, ngo: g.ngo, error: g.vi };
    try {
      const r = await goiMot(n, env, v.loai, v.cau, v.triThuc);
      const text = r.text.trim().slice(0, 12000);
      if (!text) { thu.push(n.ma + ': rỗng'); continue; }
      await ghiToken(db, n.ma, r.vao, r.ra);
      await db.prepare('INSERT OR REPLACE INTO triNhoDaTri (khoa, loai, ncc, traLoi, luc, hetHan, dung) VALUES (?,?,?,?,?,?,0)')
        .bind(khoa, v.loai, n.ma, text, Date.now(), Date.now() + v.l.nho * 86400e3).run();
      await Kho.ghiNhatKy(db, { uid: hoSo.uid, username: ten(hoSo), viec: 'DA_TRI',
        doiTuong: n.ma, chiTiet: v.loai + ' · bậc ' + n.bac + ' · token ' + (r.vao + r.ra) });
      return { ok: true, traLoi: text, ncc: n.ma, tenNcc: n.ten, model: r.model, bac: n.bac, khoa,
        token: r.vao + r.ra, daThu: thu, coTheLenBac: n.bac < (laR01(hoSo) ? v.l.den : Math.min(v.l.den, 3)),
        canDuyet: true, nhac: 'Bản nháp AI — người phụ trách kiểm chứng trước khi dùng.' };
    } catch (e) {
      thu.push(n.ma + ': ' + String(e && e.message || e).slice(0, 60));
    }
  }
  return { ok: false, code: 'AI_LOI', daThu: thu, error: 'Mọi nhà cung cấp ở bậc này đều lỗi; thử lại sau.' };
}

/* ═══════════════ CỬA: HỘI ĐỒNG ĐA TRÍ (R01) ═══════════════
   Hỏi tối đa ba nhà cung cấp KHÁC NHAU cùng một câu chiến lược, trả cả
   ba câu bên cạnh nhau. Không tự tổng hợp thành "một chân lý": chỗ các
   mô hình bất đồng chính là chỗ người cần nghĩ. Đắt gấp ba — nên R01. */
export async function hoiDongDaTri(y, env, db, hoSo) {
  if (!laR01(hoSo)) return { ok: false, code: 'NOPERM', error: 'Hội đồng đa trí chỉ mở cho Super Admin.' };
  if (!moBat(env)) return { ok: false, code: 'CUADONG', error: 'Bộ não đa trí đang tắt.' };
  if (tietKiem(env)) return { ok: false, code: 'TIETKIEM', error: 'Chế độ tiết kiệm: hội đồng tạm nghỉ.' };
  const v = kiemVao(Object.assign({}, y, { loai: 'phanTich' }), hoSo);
  if (v.loi) return v.loi;
  await dungBang(db);
  if (await canHan(db, hoSo)) return { ok: false, code: 'VUOT_HAN', error: 'Đã hết lượt hỏi trong ngày.' };
  const ds = (await ungVien(env, db, { tu: 2, den: 4 }, 0, hoSo)).reverse().slice(0, 3);
  if (ds.length < 2) return { ok: false, code: 'KHONG_DU', error: 'Cần ít nhất hai nhà cung cấp đã cấu hình khoá.' };
  const kq = await Promise.all(ds.map(async n => {
    const g = await soatRaNhaCungCap({ provider: n.ma, cau: v.cau, triThuc: v.triThuc }, env, db, hoSo);
    if (!g.cho) return { ncc: n.ma, loi: g.vi, chan: true };
    try {
      const r = await goiMot(n, env, 'phanTich', v.cau, v.triThuc);
      await ghiToken(db, n.ma, r.vao, r.ra);
      return { ncc: n.ma, tenNcc: n.ten, model: r.model, bac: n.bac, traLoi: r.text.trim().slice(0, 8000), token: r.vao + r.ra };
    } catch (e) { return { ncc: n.ma, loi: String(e && e.message || e).slice(0, 80) }; }
  }));
  if (kq.some(k => k.chan)) return { ok: false, code: 'DIEU13', error: 'Câu hỏi mang dữ liệu nhận dạng được — không gửi.' };
  await Kho.ghiNhatKy(db, { uid: hoSo.uid, username: ten(hoSo), viec: 'DA_TRI_HOI_DONG',
    doiTuong: ds.map(n => n.ma).join(','), chiTiet: 'token ' + kq.reduce((s, k) => s + (k.token || 0), 0) });
  return { ok: true, hoiDong: kq, canDuyet: true,
    nhac: 'Đọc chỗ các mô hình BẤT ĐỒNG — đó là chỗ cần người quyết.' };
}

/* ═══════════════ CỬA: CHẤM CÂU TRẢ LỜI ═══════════════
   Tín hiệu duy nhất để tự tối ưu. Chấm "chưa tốt" còn xoá ô đệm để lần
   sau không trả lại một câu đã bị chê. */
export async function chamDaTri(y, env, db, hoSo) {
  if (!laNguoiNha(hoSo)) return { ok: false, code: 'NOPERM', error: 'Mở cho R01–R12.' };
  const loai = String((y || {}).loai || ''), ncc = String((y || {}).ncc || ''), tot = !!(y || {}).tot;
  if (!LOAI[loai] || !NCC.some(n => n.ma === ncc)) return { ok: false, code: 'SAI', error: 'Thiếu loại hoặc nhà cung cấp.' };
  await dungBang(db);
  await db.prepare('INSERT INTO danhGiaDaTri (loai, ncc, tot, xau) VALUES (?, ?, ?, ?) ' +
    'ON CONFLICT(loai, ncc) DO UPDATE SET tot = tot + excluded.tot, xau = xau + excluded.xau')
    .bind(loai, ncc, tot ? 1 : 0, tot ? 0 : 1).run();
  const khoa = String((y || {}).khoa || '');
  if (!tot && /^[a-f0-9]{64}$/.test(khoa)) await db.prepare('DELETE FROM triNhoDaTri WHERE khoa = ?').bind(khoa).run();
  return { ok: true };
}

/* ═══════════════ CỬA: SỔ BỘ NÃO ĐA TRÍ ═══════════════
   Trạng thái để đo và tự tối ưu: nhà cung cấp nào sẵn sàng (chỉ đúng/sai,
   không lộ khoá) · token hôm nay so ngân sách · ô đệm · điểm chất lượng. */
export async function soDaTri(y, env, db, hoSo) {
  if (!laNguoiNha(hoSo)) return { ok: false, code: 'NOPERM', error: 'Mở cho R01–R12.' };
  await dungBang(db);
  const ngay = homNay();
  const tk = (await db.prepare('SELECT ncc, luot, vao, ra FROM soTokenDaTri WHERE ngay = ?').bind(ngay).all()).results || [];
  const tuan = (await db.prepare('SELECT ncc, SUM(luot) luot, SUM(vao) vao, SUM(ra) ra FROM soTokenDaTri WHERE ngay >= ? GROUP BY ncc')
    .bind(new Date(Date.now() - 6 * 86400e3).toISOString().slice(0, 10)).all()).results || [];
  const dem = await db.prepare('SELECT COUNT(*) n, COALESCE(SUM(dung),0) dung FROM triNhoDaTri WHERE hetHan > ?').bind(Date.now()).first();
  const dg = (await db.prepare('SELECT loai, ncc, tot, xau FROM danhGiaDaTri').all()).results || [];
  return { ok: true, bat: moBat(env), tietKiem: tietKiem(env),
    ncc: NCC.map(n => ({ ma: n.ma, ten: n.ten, bac: n.bac, sanSang: sanSang(n, env), model: mauCua(n, env) || null,
      nganNgay: nganCua(n, env), bien: n.khoa || 'binding AI', bienMau: n.bienMau })),
    loai: Object.keys(LOAI).map(k => Object.assign({ ma: k }, LOAI[k])),
    homNay: tk, tuan, dem: { o: (dem && dem.n) || 0, trung: (dem && dem.dung) || 0 }, danhGia: dg };
}
