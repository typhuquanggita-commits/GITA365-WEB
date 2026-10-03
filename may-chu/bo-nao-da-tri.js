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
/* `ngan` là hạn mức token/ngày GỐC; máy chỉ dùng tới TRẦN TẢI (mặc định
   50%) của nó — xem tranTai. Workers AI miễn phí 10.000 neuron/ngày;
   quy đổi neuron↔token tuỳ mô hình nên 100.000 token là mức bảo thủ
   CHƯA ĐO — chủ hệ đặt lại GITA_NGAN_TOKEN_CF_WORKERS_AI sau khi xem
   bảng Cloudflare. `congMau` = cổng liệt kê mô hình (canh mô hình mới). */
export const NCC = [
  { ma: 'cf-workers-ai', ten: 'Workers AI (Cloudflare)', bac: 1, kieu: 'cf',
    khoa: null, bienMau: 'GITA_MAU_CF', mau: '@cf/meta/llama-3.1-8b-instruct', ngan: 100000 },
  { ma: 'deepseek', ten: 'DeepSeek', bac: 2, kieu: 'oa', cong: 'https://api.deepseek.com/chat/completions',
    congMau: 'https://api.deepseek.com/models',
    khoa: 'GITA_KHOA_DEEPSEEK', bienMau: 'GITA_MAU_DEEPSEEK', mau: 'deepseek-chat', ngan: 400000 },
  { ma: 'gemini', ten: 'Gemini (Google)', bac: 3, kieu: 'oa',
    cong: 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
    congMau: 'https://generativelanguage.googleapis.com/v1beta/openai/models', loc: /^gemini/,
    khoa: 'GITA_KHOA_GEMINI', bienMau: 'GITA_MAU_GEMINI', mau: 'gemini-2.5-flash', ngan: 300000 },
  { ma: 'openai', ten: 'ChatGPT (OpenAI)', bac: 3, kieu: 'oa', cong: 'https://api.openai.com/v1/chat/completions',
    congMau: 'https://api.openai.com/v1/models', loc: /^(gpt-|o\d)/,
    khoa: 'GITA_KHOA_OPENAI', bienMau: 'GITA_MAU_OPENAI', mau: 'gpt-4o-mini', ngan: 300000 },
  { ma: 'anthropic', ten: 'Claude (Anthropic)', bac: 4, kieu: 'an', cong: 'https://api.anthropic.com/v1/messages',
    congMau: 'https://api.anthropic.com/v1/models',
    khoa: 'GITA_KHOA_ANTHROPIC', bienMau: 'GITA_MAU_ANTHROPIC', mau: '', ngan: 100000 },
  { ma: 'xai', ten: 'Grok (xAI)', bac: 4, kieu: 'oa', cong: 'https://api.x.ai/v1/chat/completions',
    congMau: 'https://api.x.ai/v1/models',
    khoa: 'GITA_KHOA_XAI', bienMau: 'GITA_MAU_XAI', mau: '', ngan: 100000 }
];

/* ══ TINH TÚY 5 BỘ NÃO → KỸ THUẬT GITA ĐANG CHẠY ══
   Không "chép bộ não" của hãng nào (không thể, và vi phạm điều khoản).
   Lấy THẾ MẠNH mỗi hãng tự công bố công khai, biến thành một KỸ THUẬT
   chạy trong tệp này. `o` trỏ chỗ kỹ thuật sống — để soát được. GITA
   không tự kiểm chứng tuyên bố của hãng; chất lượng thật đo bằng
   danhGiaDaTri và thuMauDaTri. */
export const TINH_TUY = [
  { ncc: 'anthropic', hang: 'Claude', manh: 'Huấn luyện theo bộ nguyên tắc thành văn (Constitutional AI), tự phê bình theo nguyên tắc',
    gita: 'Hiến pháp GITA + cổng Điều 13 trước MỌI lượt; khuôn phân tích kết thúc bằng bước tự soát theo hiến pháp', o: 'soatRaNhaCungCap · KHUON.phanTich' },
  { ncc: 'deepseek', hang: 'DeepSeek', manh: 'Kiến trúc chuyên gia hỗn hợp (MoE): mỗi lượt chỉ kích hoạt một phần mô hình — rẻ mà mạnh',
    gita: 'Chỉ "bật" phần bộ não việc cần: bậc theo loại việc, rẻ trước, leo khi cần', o: 'LOAI · ungVien' },
  { ncc: 'openai', hang: 'ChatGPT', manh: 'Đầu ra có cấu trúc, gọi công cụ',
    gita: 'Khuôn đầu ra cố định theo loại việc → câu trả lời lưu kho, so sánh, bổ sung được', o: 'KHUON · khoGiaiPhapDaTri' },
  { ncc: 'xai', hang: 'Grok', manh: 'Nhấn mạnh thông tin mới, gần thời gian thực',
    gita: 'Giải pháp trong kho mang ngày soát + phiên bản; quá 90 ngày thì đòi soát lại; câu trả lời phải nói khi dữ kiện có thể đã cũ', o: 'HAN_SOAT_NGAY · boSungGiaiPhap' },
  { ncc: 'gemini', hang: 'Gemini', manh: 'Cửa sổ ngữ cảnh rất dài, đa phương thức',
    gita: 'Tóm tắt tài liệu dài ưu tiên Gemini trong cùng bậc', o: 'LOAI.tomTat.uuTien' }
];

/* Loại việc → khung bậc, trần token ra, trần ký tự vào, thời hạn nhớ đệm.
   Trần token ra là đòn tiết kiệm lớn nhất: mô hình viết dài khi được
   phép viết dài. */
export const LOAI = {
  phanLoai:  { ten: 'Phân loại / gắn nhãn', tu: 1, den: 2, ra: 200,  vao: 2000, nho: 30, r01: false },
  tomTat:    { ten: 'Tóm tắt',              tu: 1, den: 3, ra: 400,  vao: 6000, nho: 7,  r01: false, uuTien: ['gemini'] },
  soan:      { ten: 'Soạn nháp',            tu: 1, den: 3, ra: 1000, vao: 4000, nho: 1,  r01: false },
  phanTich:  { ten: 'Phân tích sâu',        tu: 2, den: 4, ra: 1500, vao: 6000, nho: 1,  r01: false },
  chienLuoc: { ten: 'Chiến lược cấp hệ',    tu: 3, den: 4, ra: 2000, vao: 6000, nho: 1,  r01: true }
};

/* Lời hệ thống NGẮN — gửi mỗi lượt nên mỗi chữ là token nhân với số lượt. */
const LOI_HE = 'Bạn là trợ lý GITA365 (giáo dục gia đình). Trả lời tiếng Việt, ngắn, có cấu trúc. ' +
  'Không bịa dữ kiện, nguồn hay con số; chưa chắc thì nói chưa chắc. Không chẩn đoán y tế/pháp lý. ' +
  'Đây là bản nháp để người duyệt.';

/* Khuôn đầu ra theo loại việc. Phân tích và chiến lược đi theo PHƯƠNG
   PHÁP KHOA HỌC: giả thuyết → bằng chứng hai phía → độ chắc chắn → thử
   nghiệm nhỏ nhất. Đặt trong lời hệ thống thay vì gọi thêm một lượt "tự
   phê bình" — cùng tác dụng, không tốn gấp đôi token. */
export const KHUON = {
  phanLoai: 'Chỉ trả nhãn và một dòng lý do.',
  tomTat: 'Dạng: Ý chính (tối đa 5 gạch) · Điều còn chưa rõ.',
  soan: 'Dạng: Bản nháp · Điều người duyệt cần kiểm.',
  phanTich: 'Tư duy như nhà khoa học. Dạng: 1) Câu hỏi thật 2) Giả thuyết 3) Bằng chứng ủng hộ / phản bác ' +
    '4) Độ chắc chắn thấp/vừa/cao và vì sao 5) Thử nghiệm nhỏ nhất để kiểm 6) Tự soát: có chạm an toàn trẻ em, có số liệu tự bịa, có dữ kiện có thể đã cũ không.',
  chienLuoc: 'Tư duy như nhà khoa học. Dạng: 1) Câu hỏi thật 2) Giả thuyết 3) Bằng chứng ủng hộ / phản bác ' +
    '4) Độ chắc chắn và vì sao 5) Thử nghiệm nhỏ nhất 6) Phương án thay thế và cái giá bỏ lỡ 7) Tự soát theo hiến pháp GITA.'
};

const HAN_NGAY = { r01: 200, nha: 60 };
const TRAN_TRI_THUC = 800;
/* Kho giải pháp: độ khớp từ khoá tối thiểu để trả thẳng (0 token), và số
   ngày sau đó một giải pháp đã duyệt bị đòi soát lại. */
const NGUONG_KHOP = 0.6;
export const HAN_SOAT_NGAY = 90;
const MAY = { uid: 'MAY-DA-TRI', u: 'may-tu-dong', role: 'R01' };

let daDung = false;
async function dungBang(db) {
  if (daDung) return;
  await db.batch([
    db.prepare('CREATE TABLE IF NOT EXISTS triNhoDaTri (khoa TEXT PRIMARY KEY, loai TEXT, ncc TEXT, ' +
      'traLoi TEXT, luc INTEGER, hetHan INTEGER, dung INTEGER DEFAULT 0)'),
    db.prepare('CREATE TABLE IF NOT EXISTS soTokenDaTri (ngay TEXT, ncc TEXT, luot INTEGER DEFAULT 0, ' +
      'vao INTEGER DEFAULT 0, ra INTEGER DEFAULT 0, PRIMARY KEY (ngay, ncc))'),
    db.prepare('CREATE TABLE IF NOT EXISTS danhGiaDaTri (loai TEXT, ncc TEXT, tot INTEGER DEFAULT 0, ' +
      'xau INTEGER DEFAULT 0, PRIMARY KEY (loai, ncc))'),
    db.prepare('CREATE TABLE IF NOT EXISTS khoGiaiPhapDaTri (ma TEXT PRIMARY KEY, loai TEXT, cauHoi TEXT, tuKhoa TEXT, ' +
      'giaiPhap TEXT, ncc TEXT, phienBan INTEGER DEFAULT 1, trangThai TEXT DEFAULT \'nhap\', goc TEXT, ' +
      'nguoiDe TEXT, nguoiDuyet TEXT, luc INTEGER, lucSoat INTEGER, dung INTEGER DEFAULT 0)'),
    db.prepare('CREATE TABLE IF NOT EXISTS mauDaTriThay (ncc TEXT, model TEXT, lanDau INTEGER, PRIMARY KEY (ncc, model))'),
    db.prepare('CREATE TABLE IF NOT EXISTS nhipDaTri (viec TEXT PRIMARY KEY, luc INTEGER)'),
    db.prepare('CREATE TABLE IF NOT EXISTS vongKhoaHocDaTri (luc INTEGER PRIMARY KEY, soPhatHien INTEGER, baoCao TEXT)'),
    /* V20: đếm lượt bị lọc TRƯỚC token (đo được, không khai) · lỗi lặp
       từng nhà cung cấp (điểm chạm cố vấn) · tuyến nhiều chặng có chốt. */
    db.prepare('CREATE TABLE IF NOT EXISTS soLocDaTri (ngay TEXT, cua TEXT, luot INTEGER DEFAULT 0, PRIMARY KEY (ngay, cua))'),
    db.prepare('CREATE TABLE IF NOT EXISTS loiNccDaTri (ngay TEXT, ncc TEXT, soLan INTEGER DEFAULT 0, PRIMARY KEY (ngay, ncc))'),
    db.prepare('CREATE TABLE IF NOT EXISTS tuyenDaTri (ma TEXT PRIMARY KEY, ten TEXT, cacChang TEXT, dangO INTEGER DEFAULT 0, ' +
      'ketQua TEXT, trangThai TEXT DEFAULT \'dangChay\', luc INTEGER, lucSua INTEGER)')
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
function nganGoc(n, env) {
  const v = Number(env && env['GITA_NGAN_TOKEN_' + n.ma.replace(/-/g, '_').toUpperCase()]);
  return v > 0 ? v : n.ngan;
}
/* TRẦN TẢI: hệ chỉ được chạm tối đa X% hạn mức mỗi nhà cung cấp (mặc
   định 50%, biến GITA_TRAN_TAI = 1..100). Nửa còn lại là vùng đệm cho
   ngày tăng đột biến và cho việc khẩn — hệ không bao giờ chạy sát trần,
   nên không bao giờ rơi khỏi hạn mức miễn phí hay gây hoá đơn bất ngờ. */
function tranTai(env) {
  const v = Number(env && env.GITA_TRAN_TAI);
  return v >= 1 && v <= 100 ? v / 100 : 0.5;
}
function nganCua(n, env) {
  const g = nganGoc(n, env);
  return g > 0 ? Math.max(1, Math.floor(g * tranTai(env))) : 0;
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

async function goiMot(n, env, loai, cau, triThuc, tuy) {
  const l = LOAI[loai], model = mauCua(n, env), ra = (tuy && tuy.ra) || l.ra;
  const he = LOI_HE + '\n' + ((tuy && tuy.khuon) || KHUON[loai] || '') +
    (triThuc ? '\nNguyên lý tham chiếu (dùng nếu hợp):\n' + triThuc : '');
  const messages = [{ role: 'system', content: he }, { role: 'user', content: cau }];
  if (n.kieu === 'cf') {
    const r = await env.AI.run(model, { messages, max_tokens: ra });
    const u = (r && r.usage) || {};
    return { text: String((r && r.response) || ''), vao: u.prompt_tokens || 0, ra: u.completion_tokens || 0, model };
  }
  const khoa = String(env[n.khoa]);
  let body, headers;
  if (n.kieu === 'an') {
    body = { model, system: he, messages: [{ role: 'user', content: cau }], max_tokens: ra, temperature: 0.3 };
    headers = { 'x-api-key': khoa, 'anthropic-version': '2023-06-01', 'Content-Type': 'application/json' };
  } else {
    body = { model, messages, max_tokens: ra, temperature: 0.3 };
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
  const uu = l.uuTien || [];
  const yeu = await nccYeu(env, db, l);
  const hang = n => (yeu.has(n.ma) ? 1000 : 0) + n.bac * 10 + (uu.indexOf(n.ma) >= 0 ? 0 : 1);
  return ds.sort((a, b) => hang(a) - hang(b));
}

/* TỰ ĐIỀU CHỈNH CÓ BIÊN: nhà cung cấp bị chấm "chưa tốt" > 70% trên ≥ 10
   lượt cho đúng loại việc thì bị XẾP CUỐI hàng (không loại bỏ — vẫn là
   lưới đỡ khi không còn ai). Đảo được ngay: GITA_TU_DIEU_CHINH = "0".
   Đây là điều chỉnh vận hành; đổi bảng LOAI vẫn là việc chủ hệ (AT5). */
const NGUONG_YEU = { luot: 10, tiLe: 0.7 };
async function nccYeu(env, db, l) {
  if (String((env && env.GITA_TU_DIEU_CHINH) || '') === '0') return new Set();
  const loai = Object.keys(LOAI).find(k => LOAI[k] === l);
  const ds = (await db.prepare('SELECT ncc, tot, xau FROM danhGiaDaTri WHERE loai = ?').bind(loai || '').all()).results || [];
  return new Set(ds.filter(r => r.tot + r.xau >= NGUONG_YEU.luot && r.xau / (r.tot + r.xau) > NGUONG_YEU.tiLe).map(r => r.ncc));
}

/* Vòng leo bậc dùng chung: mỗi ứng viên qua cổng Điều 13 RIÊNG (tên nhà
   cung cấp nằm trong sổ ATAI), lỗi/rỗng thì sang ứng viên kế. */
async function goiLeoBac(env, db, hoSo, ds, loai, cau, triThuc, tuy) {
  const thu = [];
  for (const n of ds) {
    const g = await soatRaNhaCungCap({ provider: n.ma, cau, triThuc }, env, db, hoSo);
    if (!g.cho) return { thu, chan: { ok: false, code: g.code, ngo: g.ngo, error: g.vi } };
    try {
      const r = await goiMot(n, env, loai, cau, triThuc, tuy);
      const text = r.text.trim().slice(0, 12000);
      if (!text) { thu.push(n.ma + ': rỗng'); continue; }
      await ghiToken(db, n.ma, r.vao, r.ra);
      return { n, r, text, thu };
    } catch (e) {
      thu.push(n.ma + ': ' + String(e && e.message || e).slice(0, 60));
      const cv = await coVanDaTri(env, db, 'loiLap', { ncc: n.ma });
      if (cv.khuyen.length) thu.push('cố vấn: ' + cv.khuyen[0]);
    }
  }
  return { thu };
}

/* ══ KHO GIẢI PHÁP ══ Hỏi một lần, dùng mãi. Từ khoá bỏ dấu + bỏ hư từ,
   so bằng độ trùng (Jaccard) — đủ cho câu hỏi vận hành lặp lại, chạy
   trong D1 không cần chỉ mục vectơ trả phí. */
const HU_TU = new Set(['va', 'la', 'cua', 'cho', 'cac', 'nhung', 'mot', 'co', 'khong', 'duoc', 'trong', 'voi', 'de',
  'thi', 'nay', 'do', 'the', 'nao', 'gi', 've', 'tu', 'khi', 'neu', 'hay', 'ra', 'vao', 'len', 'bi', 'se', 'da', 'dang']);
export function tuKhoa(s) {
  const w = String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[đĐ]/g, 'd').toLowerCase()
    .split(/[^a-z0-9]+/).filter(x => x.length >= 2 && !HU_TU.has(x));
  return Array.from(new Set(w)).sort().join(' ');
}
function doKhop(a, b) {
  const A = new Set(a.split(' ').filter(Boolean)), B = new Set(b.split(' ').filter(Boolean));
  if (!A.size || !B.size) return 0;
  let chung = 0; A.forEach(x => { if (B.has(x)) chung++; });
  return chung / (A.size + B.size - chung);
}
async function timGiaiPhap(db, loai, cau) {
  const tk = tuKhoa(cau), tu = tk.split(' ').filter(Boolean).sort((a, b) => b.length - a.length).slice(0, 4);
  if (!tu.length) return null;
  const ds = (await db.prepare('SELECT ma, cauHoi, tuKhoa, giaiPhap, phienBan, lucSoat FROM khoGiaiPhapDaTri ' +
    'WHERE trangThai = \'duyet\' AND loai = ? AND (' + tu.map(() => 'tuKhoa LIKE ?').join(' OR ') + ') LIMIT 30')
    .bind(loai, ...tu.map(w => '%' + w + '%')).all()).results || [];
  let tot = null, diem = 0;
  ds.forEach(r => { const d = doKhop(tk, r.tuKhoa); if (d > diem) { diem = d; tot = r; } });
  return diem >= NGUONG_KHOP ? Object.assign({ diem }, tot) : null;
}
const maGiaiPhap = async (loai, cau) => 'GP-' + (await bam(loai + '|' + tuKhoa(cau))).slice(0, 10).toUpperCase();
const canSoat = r => r.trangThai === 'duyet' && Date.now() - (r.lucSoat || r.luc || 0) > HAN_SOAT_NGAY * 86400e3;

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

/* ══ V20 · bốn cơ chế học từ bốn hệ tham chiếu (đo được, 0 token thêm) ══
   1. Lọc trước token CÓ ĐẾM (quy trình Zalo Agent): mọi lượt dừng trước
      khi tốn token được ghi vào soLocDaTri — bộ lọc tồn tại từ trước,
      V20 làm nó ĐO ĐƯỢC thay vì âm thầm.
   2. Định tuyến có độ chắc (fork layer sharp/split): hai ứng viên đầu
      ngang nhau theo điểm chấm thật → hệ nói "chưa chắc", gợi ý hội
      đồng; chỉ đo, KHÔNG đổi thứ tự định tuyến.
   3. Cố vấn theo điểm chạm (advisor on-call): im ở lượt thường, chỉ lên
      tiếng trước khi lưu kế hoạch · khi lỗi lặp · trước khi chốt. Cố
      vấn CHỈ khuyên — cùng luật bộ chấm V20: không tự ra tay.
   4. Tuyến nhiều chặng có chốt chặn (pipeline 5 khâu): việc lớn đi qua
      nhiều chặng, hệ DỪNG sau mỗi chặng chờ người đọc; kết quả chặng
      trước làm ngữ cảnh chặng sau (vòng lặp quay lại). */

async function ghiLoc(db, cua) {
  await db.prepare('INSERT INTO soLocDaTri (ngay, cua, luot) VALUES (?, ?, 1) ' +
    'ON CONFLICT(ngay, cua) DO UPDATE SET luot = luot + 1').bind(homNay(), cua).run();
}

export const NGUONG_CHAC = { luot: 3, chenh: 0.15 };
export async function doChacDinhTuyen(db, loai, ds) {
  if (!ds || ds.length < 2) return { doChac: null, chac: true };
  const dg = (await db.prepare('SELECT ncc, tot, xau FROM danhGiaDaTri WHERE loai = ?').bind(loai).all()).results || [];
  const diem = {};
  dg.forEach(r => { if (r.tot + r.xau >= NGUONG_CHAC.luot) diem[r.ncc] = (r.tot + 1) / (r.tot + r.xau + 2); });
  const coSoLieu = ds.map(n => diem[n.ma]).filter(x => x !== undefined).sort((a, b) => b - a);
  if (coSoLieu.length < 2) return { doChac: null, chac: true, thieu: 'chưa đủ điểm chấm để đo độ chắc' };
  const chenh = Math.round((coSoLieu[0] - coSoLieu[1]) * 100) / 100;
  return { doChac: chenh, chac: chenh >= NGUONG_CHAC.chenh, goiYHoiDong: chenh < NGUONG_CHAC.chenh };
}

const NGUONG_LOI_LAP = 3;
export async function coVanDaTri(env, db, diem, du) {
  const khuyen = [];
  if (diem === 'truocKeHoach' && du) {
    const tl = String(du.traLoi || '');
    if (tl.length < 80) khuyen.push('Giải pháp ngắn dưới 80 ký tự — kho khó dùng lại được.');
    if (/[0-9]+\s?(%|triệu|tỷ|usd|đồng)/i.test(tl) && !/nguồn|theo\s|báo cáo|số liệu/i.test(tl))
      khuyen.push('Có con số mà chưa ghi nguồn — người duyệt nên hỏi lại căn cứ.');
    if (du.loai === 'chienLuoc' && !du.hoiDong)
      khuyen.push('Việc chiến lược cấp hệ: nên hỏi hội đồng 3 trí tuệ trước khi chốt.');
  }
  if (diem === 'truocKhiXong' && du && du.loai === 'chienLuoc' && !/hoi-dong/i.test(String(du.goc || '')))
    khuyen.push('Bản chiến lược này chưa qua hội đồng — cân nhắc đối chiếu 3 trí tuệ trước khi duyệt.');
  if (diem === 'loiLap' && du && du.ncc) {
    await dungBang(db);
    const ngay = homNay();
    await db.prepare('INSERT INTO loiNccDaTri (ngay, ncc, soLan) VALUES (?, ?, 1) ' +
      'ON CONFLICT(ngay, ncc) DO UPDATE SET soLan = soLan + 1').bind(ngay, du.ncc).run();
    const r = await db.prepare('SELECT soLan FROM loiNccDaTri WHERE ngay = ? AND ncc = ?').bind(ngay, du.ncc).first();
    if (r && r.soLan >= NGUONG_LOI_LAP) {
      khuyen.push(du.ncc + ' đã lỗi ' + r.soLan + ' lần hôm nay — nên kiểm tra khoá/mô hình hoặc tạm ưu tiên nhà khác.');
      if (r.soLan === NGUONG_LOI_LAP)
        await Kho.ghiNhatKy(db, { uid: MAY.uid, username: MAY.u, viec: 'DA_TRI_LOI_LAP', doiTuong: du.ncc,
          chiTiet: 'lỗi ' + r.soLan + ' lần trong ngày' });
    }
  }
  return { diem, khuyen };
}

/* ═══════════════ CỬA: HỎI BỘ NÃO ĐA TRÍ ═══════════════ */
export async function hoiDaTri(y, env, db, hoSo) {
  if (!laNguoiNha(hoSo)) return { ok: false, code: 'NOPERM', error: 'Mở cho R01–R12.' };
  if (!moBat(env)) return { ok: false, code: 'CUADONG',
    error: 'Bộ não đa trí đang tắt. Chủ hệ bật bằng biến GITA_DA_TRI_BAT = 1 trên Cloudflare.' };
  const v = kiemVao(y, hoSo);
  if (v.loi) return v.loi;
  await dungBang(db);
  if (await canHan(db, hoSo)) { await ghiLoc(db, 'han-ngay'); return { ok: false, code: 'VUOT_HAN', error: 'Đã hết lượt hỏi trong ngày.' }; }

  /* Sàng TRƯỚC cả bộ nhớ đệm: một chuỗi bẩn không được thành khoá đệm,
     cũng không được đi tới bất kỳ đâu (Điều 13). */
  const sang = await soatRaNhaCungCap({ provider: 'cf-workers-ai', cau: v.cau, triThuc: v.triThuc }, env, db, hoSo);
  if (!sang.cho) { await ghiLoc(db, 'dieu13'); return { ok: false, code: sang.code, ngo: sang.ngo, error: sang.vi }; }

  const khoa = await bam(v.loai + '|' + chuan(v.cau) + '|' + chuan(v.triThuc));
  const tuBac = Number((y || {}).tuBac) || 0;
  /* Kho giải pháp TRƯỚC bộ đệm: giải pháp đã có người duyệt là thứ tốt
     nhất hệ có — 0 token, và đúng hơn mọi câu AI mới sinh. */
  if (!tuBac && !(y || {}).boQuaKho) {
    const gp = await timGiaiPhap(db, v.loai, v.cau);
    if (gp) {
      await db.prepare('UPDATE khoGiaiPhapDaTri SET dung = dung + 1 WHERE ma = ?').bind(gp.ma).run();
      await ghiToken(db, 'kho', 0, 0);
      await ghiLoc(db, 'kho');
      return { ok: true, traLoi: gp.giaiPhap, ncc: 'kho', tenNcc: 'Kho giải pháp', bac: 0, tuKho: true, maGP: gp.ma,
        phienBan: gp.phienBan, khop: Math.round(gp.diem * 100), cauGoc: gp.cauHoi, token: 0,
        canSoat: canSoat(Object.assign({ trangThai: 'duyet' }, gp)), canDuyet: false };
    }
  }
  if (!tuBac) {
    const d = await db.prepare('SELECT ncc, traLoi FROM triNhoDaTri WHERE khoa = ? AND hetHan > ?')
      .bind(khoa, Date.now()).first();
    if (d) {
      await db.prepare('UPDATE triNhoDaTri SET dung = dung + 1 WHERE khoa = ?').bind(khoa).run();
      await ghiToken(db, 'dem', 0, 0);
      await ghiLoc(db, 'dem');
      return { ok: true, traLoi: d.traLoi, ncc: d.ncc, bac: 0, tuDem: true, khoa, token: 0, canDuyet: true };
    }
  }

  const ds = await ungVien(env, db, v.l, tuBac, hoSo);
  if (!ds.length) { await ghiLoc(db, 'khong-ncc'); return { ok: false, code: 'KHONG_NCC',
    error: tietKiem(env) ? 'Chế độ tiết kiệm: chỉ còn Workers AI, và nó chưa được nối.' :
      'Chưa có nhà cung cấp nào sẵn sàng ở bậc này (thiếu khoá, hết ngân sách ngày, hoặc vượt quyền).' }; }

  const dinhTuyen = await doChacDinhTuyen(db, v.loai, ds);
  const k = await goiLeoBac(env, db, hoSo, ds, v.loai, v.cau, v.triThuc);
  if (k.chan) return k.chan;
  if (k.n) {
    const n = k.n, r = k.r, text = k.text;
    await db.prepare('INSERT OR REPLACE INTO triNhoDaTri (khoa, loai, ncc, traLoi, luc, hetHan, dung) VALUES (?,?,?,?,?,?,0)')
      .bind(khoa, v.loai, n.ma, text, Date.now(), Date.now() + v.l.nho * 86400e3).run();
    await Kho.ghiNhatKy(db, { uid: hoSo.uid, username: ten(hoSo), viec: 'DA_TRI',
      doiTuong: n.ma, chiTiet: v.loai + ' · bậc ' + n.bac + ' · token ' + (r.vao + r.ra) });
    return { ok: true, traLoi: text, ncc: n.ma, tenNcc: n.ten, model: r.model, bac: n.bac, khoa, dinhTuyen,
      token: r.vao + r.ra, daThu: k.thu, coTheLenBac: n.bac < (laR01(hoSo) ? v.l.den : Math.min(v.l.den, 3)),
      canDuyet: true, nhac: 'Bản nháp AI — người phụ trách kiểm chứng trước khi dùng.' };
  }
  await ghiLoc(db, 'ai-loi');
  return { ok: false, code: 'AI_LOI', daThu: k.thu, error: 'Mọi nhà cung cấp ở bậc này đều lỗi; thử lại sau.' };
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
  const kho = (await db.prepare('SELECT trangThai, lucSoat, luc, dung FROM khoGiaiPhapDaTri').all()).results || [];
  const nhip = await db.prepare('SELECT luc FROM nhipDaTri WHERE viec = ?').bind('canhMau').first();
  const loc = (await db.prepare('SELECT cua, luot FROM soLocDaTri WHERE ngay = ?').bind(ngay).all()).results || [];
  const loiNcc = (await db.prepare('SELECT ncc, soLan FROM loiNccDaTri WHERE ngay = ?').bind(ngay).all()).results || [];
  return { ok: true, bat: moBat(env), tietKiem: tietKiem(env), tranTai: Math.round(tranTai(env) * 100), loc, loiNcc,
    ncc: NCC.map(n => ({ ma: n.ma, ten: n.ten, bac: n.bac, sanSang: sanSang(n, env), model: mauCua(n, env) || null,
      nganNgay: nganCua(n, env), nganGoc: nganGoc(n, env), bien: n.khoa || 'binding AI', bienMau: n.bienMau })),
    loai: Object.keys(LOAI).map(k => Object.assign({ ma: k }, LOAI[k], { khuon: KHUON[k] })),
    tinhTuy: TINH_TUY, hanSoat: HAN_SOAT_NGAY, lucCanhMau: (nhip && nhip.luc) || 0,
    kho: { duyet: kho.filter(r => r.trangThai === 'duyet').length, nhap: kho.filter(r => r.trangThai === 'nhap').length,
      canSoat: kho.filter(canSoat).length, dung: kho.reduce((s, r) => s + (r.dung || 0), 0) },
    homNay: tk, tuan, dem: { o: (dem && dem.n) || 0, trung: (dem && dem.dung) || 0 }, danhGia: dg };
}

/* ═══════════════ CỬA: LƯU GIẢI PHÁP VÀO KHO ═══════════════
   Người nhà đề xuất (nháp); R01 lưu là duyệt luôn — chủ hệ là người quyết. */
export async function luuGiaiPhap(y, env, db, hoSo) {
  if (!laNguoiNha(hoSo)) return { ok: false, code: 'NOPERM', error: 'Mở cho R01–R12.' };
  const loai = String((y || {}).loai || ''), l = LOAI[loai];
  const cau = String((y || {}).cau || '').trim(), gp = String((y || {}).traLoi || '').trim();
  if (!l || cau.length < 4 || cau.length > l.vao || !gp || gp.length > 12000)
    return { ok: false, code: 'SAI', error: 'Thiếu loại việc, câu hỏi hoặc giải pháp.' };
  if (!tuKhoa(cau)) return { ok: false, code: 'SAI', error: 'Câu hỏi không có từ khoá để tra lại.' };
  await dungBang(db);
  const ma = await maGiaiPhap(loai, cau);
  const cu = await db.prepare('SELECT trangThai FROM khoGiaiPhapDaTri WHERE ma = ?').bind(ma).first();
  if (cu && cu.trangThai === 'duyet') return { ok: false, code: 'DA_CO', ma, error: 'Kho đã có giải pháp này — dùng "Kiểm lại & bổ sung".' };
  const duyet = laR01(hoSo), now = Date.now();
  await db.prepare('INSERT OR REPLACE INTO khoGiaiPhapDaTri (ma, loai, cauHoi, tuKhoa, giaiPhap, ncc, phienBan, trangThai, goc, ' +
    'nguoiDe, nguoiDuyet, luc, lucSoat, dung) VALUES (?,?,?,?,?,?,1,?,NULL,?,?,?,?,0)')
    .bind(ma, loai, cau, tuKhoa(cau), gp, String((y || {}).ncc || '').slice(0, 30), duyet ? 'duyet' : 'nhap',
      ten(hoSo), duyet ? ten(hoSo) : null, now, now).run();
  await Kho.ghiNhatKy(db, { uid: hoSo.uid, username: ten(hoSo), viec: 'DA_TRI_LUU_KHO', doiTuong: ma, chiTiet: loai + (duyet ? ' · duyệt' : ' · nháp') });
  const cv = await coVanDaTri(env, db, 'truocKeHoach', { loai, cau, traLoi: gp, hoiDong: !!(y || {}).hoiDong });
  return { ok: true, ma, trangThai: duyet ? 'duyet' : 'nhap', coVan: cv.khuyen };
}

/* ═══════════════ CỬA: DUYỆT GIẢI PHÁP (R01) ═══════════════ */
export async function duyetGiaiPhap(y, env, db, hoSo) {
  if (!laR01(hoSo)) return { ok: false, code: 'NOPERM', error: 'Chỉ Super Admin duyệt kho giải pháp.' };
  await dungBang(db);
  const ma = String((y || {}).ma || '');
  const r = await db.prepare('SELECT * FROM khoGiaiPhapDaTri WHERE ma = ?').bind(ma).first();
  if (!r || r.trangThai !== 'nhap') return { ok: false, code: 'KHONG_CO', error: 'Không có bản nháp này.' };
  const now = Date.now();
  if (!(y || {}).dongY) {
    await db.prepare('DELETE FROM khoGiaiPhapDaTri WHERE ma = ?').bind(ma).run();
  } else if (r.goc) {
    await db.batch([
      db.prepare('UPDATE khoGiaiPhapDaTri SET giaiPhap = ?, phienBan = phienBan + 1, lucSoat = ?, nguoiDuyet = ? WHERE ma = ?')
        .bind(r.giaiPhap, now, ten(hoSo), r.goc),
      db.prepare('DELETE FROM khoGiaiPhapDaTri WHERE ma = ?').bind(ma)
    ]);
  } else {
    await db.prepare('UPDATE khoGiaiPhapDaTri SET trangThai = \'duyet\', nguoiDuyet = ?, lucSoat = ? WHERE ma = ?')
      .bind(ten(hoSo), now, ma).run();
  }
  await Kho.ghiNhatKy(db, { uid: hoSo.uid, username: ten(hoSo), viec: 'DA_TRI_DUYET_KHO', doiTuong: r.goc || ma,
    chiTiet: (y || {}).dongY ? 'đồng ý' : 'bỏ' });
  const cv = (y || {}).dongY ? await coVanDaTri(env, db, 'truocKhiXong', { loai: r.loai, goc: r.goc }) : { khuyen: [] };
  return { ok: true, coVan: cv.khuyen };
}

/* ═══════════════ CỬA: DANH SÁCH KHO GIẢI PHÁP ═══════════════ */
export async function dsGiaiPhap(y, env, db, hoSo) {
  if (!laNguoiNha(hoSo)) return { ok: false, code: 'NOPERM', error: 'Mở cho R01–R12.' };
  await dungBang(db);
  const ds = (await db.prepare('SELECT ma, loai, cauHoi, giaiPhap, ncc, phienBan, trangThai, goc, nguoiDe, nguoiDuyet, luc, lucSoat, dung ' +
    'FROM khoGiaiPhapDaTri ORDER BY trangThai DESC, dung DESC LIMIT 200').all()).results || [];
  return { ok: true, hanSoat: HAN_SOAT_NGAY, ds: ds.map(r => Object.assign(r, { canSoat: canSoat(r) })) };
}

/* ═══════════════ CỬA: KIỂM LẠI & BỔ SUNG ═══════════════
   Không viết lại cả giải pháp: AI chỉ được hỏi "THIẾU gì / CŨ gì", trần
   400 token ra. Đủ thì trả "ĐỦ" và giải pháp được đóng dấu soát lại;
   thiếu thì phần bổ sung thành bản nháp phiên bản mới chờ R01 duyệt. */
export async function boSungGiaiPhap(y, env, db, hoSo) {
  if (!laNguoiNha(hoSo)) return { ok: false, code: 'NOPERM', error: 'Mở cho R01–R12.' };
  if (!moBat(env)) return { ok: false, code: 'CUADONG', error: 'Bộ não đa trí đang tắt.' };
  await dungBang(db);
  if (await canHan(db, hoSo)) return { ok: false, code: 'VUOT_HAN', error: 'Đã hết lượt hỏi trong ngày.' };
  const ma = String((y || {}).ma || '');
  const r = await db.prepare('SELECT * FROM khoGiaiPhapDaTri WHERE ma = ? AND trangThai = \'duyet\'').bind(ma).first();
  if (!r) return { ok: false, code: 'KHONG_CO', error: 'Không có giải pháp đã duyệt mang mã này.' };
  const l = LOAI[r.loai] || LOAI.soan;
  const ds = await ungVien(env, db, l, 0, hoSo);
  if (!ds.length) return { ok: false, code: 'KHONG_NCC', error: 'Chưa có nhà cung cấp nào sẵn sàng.' };
  const ghiChu = String((y || {}).ghiChu || '').trim().slice(0, 500);
  const cau = 'GIẢI PHÁP ĐÃ DUYỆT (phiên bản ' + r.phienBan + '):\n' + String(r.giaiPhap).slice(0, 4000) +
    '\n\nCÂU HỎI GỐC: ' + r.cauHoi + (ghiChu ? '\nNGƯỜI SOÁT GHI: ' + ghiChu : '');
  const k = await goiLeoBac(env, db, hoSo, ds, r.loai, cau, '', { ra: 400,
    khuon: 'Chỉ liệt kê phần THIẾU, SAI hoặc ĐÃ CŨ cần bổ sung, ngắn gọn. Nếu giải pháp đã đủ, trả đúng một chữ: ĐỦ' });
  if (k.chan) return k.chan;
  if (!k.n) return { ok: false, code: 'AI_LOI', daThu: k.thu, error: 'Không nhà cung cấp nào trả lời.' };
  const token = k.r.vao + k.r.ra, now = Date.now();
  if (/^(đủ|du)\.?$/i.test(k.text.trim())) {
    await db.prepare('UPDATE khoGiaiPhapDaTri SET lucSoat = ? WHERE ma = ?').bind(now, ma).run();
    return { ok: true, du: true, ncc: k.n.ma, token };
  }
  const maNhap = ma + '-V' + (r.phienBan + 1);
  await db.prepare('INSERT OR REPLACE INTO khoGiaiPhapDaTri (ma, loai, cauHoi, tuKhoa, giaiPhap, ncc, phienBan, trangThai, goc, ' +
    'nguoiDe, nguoiDuyet, luc, lucSoat, dung) VALUES (?,?,?,?,?,?,?,\'nhap\',?,?,NULL,?,?,0)')
    .bind(maNhap, r.loai, r.cauHoi, '', r.giaiPhap + '\n\n[Bổ sung phiên bản ' + (r.phienBan + 1) + ' · ' + k.n.ma + ']\n' + k.text,
      k.n.ma, r.phienBan + 1, ma, ten(hoSo), now, now).run();
  await Kho.ghiNhatKy(db, { uid: hoSo.uid, username: ten(hoSo), viec: 'DA_TRI_BO_SUNG', doiTuong: ma, chiTiet: k.n.ma + ' · token ' + token });
  return { ok: true, du: false, maNhap, boSung: k.text, ncc: k.n.ma, token };
}

/* ═══════════════ CANH MÔ HÌNH MỚI — TỰ CẬP NHẬT THEO 5 HÃNG ═══════════════
   Gọi cổng LIỆT KÊ mô hình (không gửi dữ liệu nào, không tốn token) của
   từng hãng đã có khoá; so với lần canh trước → mô hình MỚI. Còn báo khi
   mô hình đang dùng biến khỏi danh sách (hãng sắp gỡ). Máy chỉ báo; đổi
   GITA_MAU_* là việc chủ hệ, sau khi thuMauDaTri chứng minh bản mới tốt hơn. */
async function canhMau(env, db, hoSo) {
  await dungBang(db);
  const kq = [];
  for (const n of NCC) {
    if (!n.congMau || !String((env && env[n.khoa]) || '')) continue;
    const g = await soatRaNhaCungCap({ provider: n.ma, cau: 'liệt kê mô hình' }, env, db, hoSo);
    if (!g.cho) { kq.push({ ncc: n.ma, ten: n.ten, loi: g.vi }); continue; }
    try {
      const khoa = String(env[n.khoa]);
      const headers = n.kieu === 'an' ? { 'x-api-key': khoa, 'anthropic-version': '2023-06-01' } : { Authorization: 'Bearer ' + khoa };
      const p = await fetch(n.congMau, { method: 'GET', redirect: 'error', headers, signal: AbortSignal.timeout(15000) });
      if (!p.ok) throw new Error('HTTP ' + p.status);
      const j = await p.json();
      const ids = Array.from(new Set((j.data || j.models || []).map(m => String((m && (m.id || m.name)) || '').replace(/^models\//, ''))
        .filter(id => /^[A-Za-z0-9._:/-]{1,100}$/.test(id) && (!n.loc || n.loc.test(id))))).slice(0, 300);
      const cu = new Set(((await db.prepare('SELECT model FROM mauDaTriThay WHERE ncc = ?').bind(n.ma).all()).results || []).map(x => x.model));
      const moi = ids.filter(id => !cu.has(id));
      if (moi.length) await db.batch(moi.map(id => db.prepare('INSERT OR IGNORE INTO mauDaTriThay (ncc, model, lanDau) VALUES (?, ?, ?)')
        .bind(n.ma, id, Date.now())));
      const dang = mauCua(n, env);
      kq.push({ ncc: n.ma, ten: n.ten, dangDung: dang || null, tong: ids.length, mocNen: cu.size === 0,
        moi: cu.size === 0 ? [] : moi.slice(0, 20), dangDungConTrongDs: !dang || ids.indexOf(dang) >= 0 });
    } catch (e) { kq.push({ ncc: n.ma, ten: n.ten, loi: String(e && e.message || e).slice(0, 80) }); }
  }
  await db.prepare('INSERT OR REPLACE INTO nhipDaTri (viec, luc) VALUES (?, ?)').bind('canhMau', Date.now()).run();
  const moi = kq.reduce((s, x) => s + ((x.moi || []).length), 0), mat = kq.filter(x => x.dangDungConTrongDs === false).length;
  if (moi || mat) await Kho.ghiNhatKy(db, { uid: hoSo.uid, username: ten(hoSo), viec: 'DA_TRI_MAU_MOI',
    doiTuong: kq.filter(x => (x.moi || []).length || x.dangDungConTrongDs === false).map(x => x.ncc).join(','),
    chiTiet: moi + ' mô hình mới · ' + mat + ' mô hình đang dùng đã biến khỏi danh sách' });
  return kq;
}
export async function canhMauDaTri(y, env, db, hoSo) {
  if (!laR01(hoSo)) return { ok: false, code: 'NOPERM', error: 'Chỉ Super Admin.' };
  if (!moBat(env)) return { ok: false, code: 'CUADONG', error: 'Bộ não đa trí đang tắt.' };
  return { ok: true, kq: await canhMau(env, db, hoSo),
    nhac: 'Máy chỉ báo. Thử mô hình mới bằng "Thử mô hình" trước khi đổi GITA_MAU_*.' };
}
/* Gọi từ lịch chạy (worker.scheduled) — tối đa 1 lần/7 ngày. */
export async function canhMauTuDong(env) {
  const db = env && env.CSDL;
  if (!db || !moBat(env)) return;
  await dungBang(db);
  const r = await db.prepare('SELECT luc FROM nhipDaTri WHERE viec = ?').bind('canhMau').first();
  if (r && Date.now() - r.luc < 7 * 86400e3) return;
  await canhMau(env, db, MAY);
}

/* ═══════════════ THỬ MÔ HÌNH MỚI TRÊN ĐỀ THI CỦA CHÍNH GITA ═══════════════
   "Luôn vượt một cấp" đo được: đề thi là tối đa 3 giải pháp ĐÃ DUYỆT dùng
   nhiều nhất; mô hình ứng viên trả lời cùng câu, đặt cạnh bản đã duyệt.
   Chủ hệ thấy bản mới tốt hơn mới đổi biến — không đổi theo quảng cáo. */
export async function thuMauDaTri(y, env, db, hoSo) {
  if (!laR01(hoSo)) return { ok: false, code: 'NOPERM', error: 'Chỉ Super Admin.' };
  if (!moBat(env)) return { ok: false, code: 'CUADONG', error: 'Bộ não đa trí đang tắt.' };
  const n0 = NCC.find(n => n.ma === String((y || {}).ncc || ''));
  const model = String((y || {}).model || '').trim();
  if (!n0 || !/^[@A-Za-z0-9._:/-]{1,100}$/.test(model)) return { ok: false, code: 'SAI', error: 'Thiếu nhà cung cấp hoặc tên mô hình hợp lệ.' };
  const n = Object.assign({}, n0, { bienMau: '__khong_co__', mau: model });
  if (!sanSang(n, env)) return { ok: false, code: 'KHONG_NCC', error: 'Nhà cung cấp này chưa có khoá.' };
  await dungBang(db);
  if (await canHan(db, hoSo)) return { ok: false, code: 'VUOT_HAN', error: 'Đã hết lượt hỏi trong ngày.' };
  const de = (await db.prepare('SELECT ma, loai, cauHoi, giaiPhap FROM khoGiaiPhapDaTri WHERE trangThai = \'duyet\' ' +
    'ORDER BY dung DESC LIMIT 3').all()).results || [];
  if (!de.length) return { ok: false, code: 'CHUA_DE', error: 'Kho chưa có giải pháp đã duyệt để làm đề thi.' };
  const ket = [];
  for (const d of de) {
    const k = await goiLeoBac(env, db, hoSo, [n], d.loai, d.cauHoi, '');
    if (k.chan) return k.chan;
    ket.push({ ma: d.ma, cauHoi: d.cauHoi, daDuyet: d.giaiPhap, moi: k.text || ('lỗi: ' + k.thu.join(' · ')), token: k.r ? k.r.vao + k.r.ra : 0 });
  }
  await Kho.ghiNhatKy(db, { uid: hoSo.uid, username: ten(hoSo), viec: 'DA_TRI_THU_MAU', doiTuong: n.ma + ':' + model,
    chiTiet: 'token ' + ket.reduce((s, x) => s + x.token, 0) });
  return { ok: true, ncc: n.ma, model, ket, nhac: 'So từng cặp. Chỉ đổi ' + n0.bienMau + ' khi bản mới tốt hơn bản đã duyệt.' };
}

/* ═══════════════ VÒNG NHÀ KHOA HỌC — 0 TOKEN, MỖI ĐÊM ═══════════════
   Bộ não không "nghĩ giỏi" bằng lời khen; nó làm đúng phương pháp khoa
   học trên SỐ ĐO THẬT của chính nó: QUAN SÁT → GIẢ THUYẾT → PHÉP THỬ
   nhỏ nhất (một cửa có sẵn) → ĐỀ XUẤT. Không gọi AI nào — chỉ đọc D1.
   Mỗi phát hiện trỏ đúng cửa để kiểm chứng; R01 bấm chạy hoặc bỏ (AT5).
   Không phát hiện nào được tự sửa luật hay bảng LOAI. */
export const NGUONG_KH = { danhGia: 5, xau: 0.5, ganTran: 0.8, deMin: 20, deTrung: 0.1, mauMoiNgay: 7, canhCuNgay: 14 };
const GIU_BAO_CAO = 30;

export async function vongKhoaHoc(env, db) {
  await dungBang(db);
  const ra = [], bayGio = Date.now(), N = NGUONG_KH;
  const them = (mucDo, quanSat, giaThuyet, phepThu, cua, deXuat) => ra.push({ mucDo, quanSat, giaThuyet, phepThu, cua, deXuat });

  if (!moBat(env)) them('thap', 'Bộ não đa trí đang tắt (GITA_DA_TRI_BAT ≠ "1").', 'Chủ hệ chưa mở hoặc đang khoá khẩn.',
    'Không cần — trạng thái có chủ ý.', null, 'Giữ nguyên nếu có chủ ý; mở bằng wrangler.toml khi sẵn sàng.');
  if (!NCC.some(n => sanSang(n, env))) them('vua', 'Không nhà cung cấp nào sẵn sàng.', 'Thiếu binding AI hoặc chưa nạp khoá.',
    'Mở tab "Sổ" xem cột Sẵn sàng.', 'soDaTri', 'Nạp ít nhất Workers AI (miễn phí) để giữ chi phí 0đ.');

  const kho = (await db.prepare('SELECT ma, trangThai, luc, lucSoat, dung FROM khoGiaiPhapDaTri').all()).results || [];
  const cu = kho.filter(canSoat).sort((a, b) => (b.dung || 0) - (a.dung || 0));
  if (cu.length) them(cu[0].dung > 0 ? 'cao' : 'vua', cu.length + ' giải pháp đã duyệt quá ' + HAN_SOAT_NGAY + ' ngày chưa soát (dùng nhiều nhất: ' + cu[0].ma + ', ' + (cu[0].dung || 0) + ' lượt).',
    'Kiến thức có thể đã cũ — câu trả lời 0 token đang lặp lại một bản có thể sai.',
    'Chạy "Kiểm lại & bổ sung" cho ' + cu[0].ma + ' (trần 400 token).', 'boSungGiaiPhap',
    'Soát từ giải pháp dùng nhiều nhất xuống.');
  const nhap = kho.filter(r => r.trangThai === 'nhap').length;
  if (nhap) them('vua', nhap + ' bản nháp đang chờ duyệt.', 'Tri thức mới chưa vào vận hành vì chưa ai quyết.',
    'Đọc từng bản ở tab "Kho".', 'duyetGiaiPhap', 'R01 duyệt hoặc bỏ — nháp không phục vụ ai.');

  const dg = (await db.prepare('SELECT loai, ncc, tot, xau FROM danhGiaDaTri').all()).results || [];
  dg.filter(r => r.tot + r.xau >= N.danhGia && r.xau / (r.tot + r.xau) > N.xau).forEach(r => {
    const tl = Math.round(r.xau / (r.tot + r.xau) * 100);
    them(tl > NGUONG_YEU.tiLe * 100 ? 'cao' : 'vua', r.ncc + ' bị chấm chưa tốt ' + tl + '% trên ' + (r.tot + r.xau) + ' lượt ở loại "' + r.loai + '".',
      'Mô hình hiện tại của ' + r.ncc + ' không hợp loại việc này (hoặc khuôn lời chưa hợp).',
      'Chạy "Hội đồng" cùng câu cho 2–3 nhà cung cấp, hoặc "Thử mô hình" bản mới của ' + r.ncc + '.', 'thuMauDaTri',
      (r.tot + r.xau >= NGUONG_YEU.luot && tl > NGUONG_YEU.tiLe * 100) ? 'Máy đã tự xếp ' + r.ncc + ' cuối hàng cho loại này (đảo: GITA_TU_DIEU_CHINH="0"). Chủ hệ cân nhắc đổi GITA_MAU_* hoặc bỏ khỏi uuTien.'
        : 'Theo dõi thêm; tới ' + NGUONG_YEU.luot + ' lượt mà còn > ' + NGUONG_YEU.tiLe * 100 + '% máy sẽ tự xếp cuối hàng.');
  });

  const tk = (await db.prepare('SELECT ncc, vao + ra AS t FROM soTokenDaTri WHERE ngay = ?').bind(homNay()).all()).results || [];
  tk.forEach(r => {
    const n = NCC.find(x => x.ma === r.ncc), ngan = n ? nganCua(n, env) : 0;
    if (ngan > 0 && r.t >= ngan * N.ganTran) them(r.t >= ngan ? 'cao' : 'vua',
      r.ncc + ' đã dùng ' + Math.round(r.t / ngan * 100) + '% ngân sách hôm nay (trần tải ' + Math.round(tranTai(env) * 100) + '%).',
      'Nhu cầu tăng hoặc câu hỏi lặp chưa vào kho/đệm.', 'So tỉ lệ trúng đệm và kho ở tab "Tối ưu".', 'soDaTri',
      'Lưu câu lặp vào kho (0 token); chỉ nâng GITA_NGAN_TOKEN_* nếu vẫn trong hạn mức miễn phí.');
  });

  const dem = await db.prepare('SELECT COUNT(*) n, COALESCE(SUM(dung),0) dung FROM triNhoDaTri').first();
  if (dem && dem.n >= N.deMin && dem.dung / dem.n < N.deTrung) them('thap',
    'Đệm có ' + dem.n + ' ô nhưng chỉ ' + dem.dung + ' lượt trúng (' + Math.round(dem.dung / dem.n * 100) + '%).',
    'Câu hỏi đa dạng — trùng nguyên văn hiếm; kho (so khớp từ khoá) hợp hơn đệm.',
    'Đếm lượt "kho" so với "đệm" ở tab "Tối ưu" sau 7 ngày.', 'dsGiaiPhap', 'Chấm "Tốt" rồi "Lưu vào kho" cho câu hỏi vận hành lặp lại.');

  const moi = (await db.prepare('SELECT ncc, COUNT(*) n FROM mauDaTriThay WHERE lanDau > ? GROUP BY ncc')
    .bind(bayGio - N.mauMoiNgay * 86400e3).all()).results || [];
  const nhip = await db.prepare('SELECT luc FROM nhipDaTri WHERE viec = ?').bind('canhMau').first();
  const lanDauCanh = nhip && (await db.prepare('SELECT MIN(lanDau) m FROM mauDaTriThay').first());
  moi.filter(r => !(lanDauCanh && lanDauCanh.m > bayGio - N.mauMoiNgay * 86400e3)).forEach(r => them('vua',
    r.ncc + ' có ' + r.n + ' mô hình mới trong ' + N.mauMoiNgay + ' ngày.', 'Bản mới có thể tốt hơn hoặc rẻ hơn bản đang dùng.',
    '"Thử mô hình" trên đề thi là các giải pháp đã duyệt của chính GITA.', 'thuMauDaTri', 'Chỉ đổi GITA_MAU_* khi bản mới thắng bản đã duyệt.'));
  if (moBat(env) && (!nhip || bayGio - nhip.luc > N.canhCuNgay * 86400e3)) them('thap',
    'Chưa canh mô hình mới quá ' + N.canhCuNgay + ' ngày.', 'Lịch chạy chưa tới, hoặc chưa hãng nào có khoá.',
    'Bấm "Canh mô hình mới".', 'canhMauDaTri', 'Giữ lịch tuần; kiểm khoá nhà cung cấp.');

  const thu = { cao: 0, vua: 1, thap: 2 };
  ra.sort((a, b) => thu[a.mucDo] - thu[b.mucDo]);
  return { luc: bayGio, nguong: N, phatHien: ra,
    phuongPhap: ['Quan sát số đo thật', 'Nêu giả thuyết có thể sai', 'Phép thử nhỏ nhất bằng cửa có sẵn', 'Đề xuất — chủ hệ quyết'] };
}

async function luuVong(db, bc) {
  await db.batch([
    db.prepare('INSERT OR REPLACE INTO vongKhoaHocDaTri (luc, soPhatHien, baoCao) VALUES (?, ?, ?)')
      .bind(bc.luc, bc.phatHien.length, JSON.stringify(bc)),
    db.prepare('DELETE FROM vongKhoaHocDaTri WHERE luc NOT IN (SELECT luc FROM vongKhoaHocDaTri ORDER BY luc DESC LIMIT ' + GIU_BAO_CAO + ')'),
    db.prepare('INSERT OR REPLACE INTO nhipDaTri (viec, luc) VALUES (?, ?)').bind('vongKhoaHoc', bc.luc)
  ]);
  const cao = bc.phatHien.filter(x => x.mucDo === 'cao').length;
  if (cao) await Kho.ghiNhatKy(db, { uid: MAY.uid, username: MAY.u, viec: 'DA_TRI_KHOA_HOC', doiTuong: String(bc.luc),
    chiTiet: bc.phatHien.length + ' phát hiện · ' + cao + ' mức cao' });
}
/* Gọi từ lịch chạy — tối đa 1 lần/20 giờ, 0 token. Chạy cả khi bộ não tắt:
   chỉ đọc D1 nên vẫn báo được "đang tắt / chưa có nhà cung cấp". */
export async function vongKhoaHocTuDong(env) {
  const db = env && env.CSDL;
  if (!db) return;
  await dungBang(db);
  const r = await db.prepare('SELECT luc FROM nhipDaTri WHERE viec = ?').bind('vongKhoaHoc').first();
  if (r && Date.now() - r.luc < 20 * 3600e3) return;
  await luuVong(db, await vongKhoaHoc(env, db));
}
export async function docVongKhoaHoc(y, env, db, hoSo) {
  if (!laR01(hoSo)) return { ok: false, code: 'NOPERM', error: 'Chỉ Super Admin.' };
  await dungBang(db);
  if ((y || {}).chay) {
    const bc = await vongKhoaHoc(env, db);
    await luuVong(db, bc);
  }
  const ds = (await db.prepare('SELECT luc, soPhatHien, baoCao FROM vongKhoaHocDaTri ORDER BY luc DESC LIMIT 7').all()).results || [];
  return { ok: true, moiNhat: ds[0] ? JSON.parse(ds[0].baoCao) : null,
    xuHuong: ds.map(r => ({ luc: r.luc, n: r.soPhatHien })) };
}
/* ═══════════════ V20 · TUYẾN NHIỀU CHẶNG CÓ CHỐT CHẶN (R01) ═══════════
   Một việc lớn (nghiên cứu đối thủ → kế hoạch → soạn → đo lường) đi qua
   nhiều chặng; mỗi chặng có đề · kết quả · chốt chặn. Hệ DỪNG sau mỗi
   chặng chờ người đọc — không tự chạy trọn một mạch. Kết quả chặng
   trước làm ngữ cảnh chặng sau: vòng lặp quay lại, nhưng qua tay người. */
export const HAN_CHANG = 7;
export async function taoTuyenDaTri(y, env, db, hoSo) {
  if (!laR01(hoSo)) return { ok: false, code: 'NOPERM', error: 'Tuyến chốt chặn chỉ mở cho Super Admin.' };
  const tenT = String((y || {}).ten || '').trim();
  const chang = Array.isArray((y || {}).chang) ? (y || {}).chang : [];
  if (tenT.length < 3 || tenT.length > 120) return { ok: false, code: 'SAI', error: 'Tên tuyến phải từ 3 đến 120 ký tự.' };
  if (chang.length < 2 || chang.length > HAN_CHANG) return { ok: false, code: 'SAI', error: 'Tuyến cần từ 2 đến ' + HAN_CHANG + ' chặng.' };
  const sach = [];
  for (const c of chang) {
    const loai = String((c || {}).loai || ''), de = String((c || {}).de || '').trim();
    if (!LOAI[loai]) return { ok: false, code: 'SAI', error: 'Chặng có loại việc không hợp lệ: ' + loai };
    if (de.length < 4 || de.length > 2000) return { ok: false, code: 'SAI', error: 'Đề mỗi chặng phải từ 4 đến 2000 ký tự.' };
    sach.push({ loai, de });
  }
  await dungBang(db);
  const ma = 'TY-' + (await bam(tenT + '|' + Date.now())).slice(0, 8).toUpperCase();
  const now = Date.now();
  await db.prepare('INSERT INTO tuyenDaTri (ma, ten, cacChang, dangO, ketQua, trangThai, luc, lucSua) VALUES (?,?,?,0,?,\'dangChay\',?,?)')
    .bind(ma, tenT, JSON.stringify(sach), '[]', now, now).run();
  await Kho.ghiNhatKy(db, { uid: hoSo.uid, username: ten(hoSo), viec: 'DA_TRI_TUYEN_TAO', doiTuong: ma, chiTiet: sach.length + ' chặng' });
  return { ok: true, ma, soChang: sach.length };
}

export async function chayChangDaTri(y, env, db, hoSo) {
  if (!laR01(hoSo)) return { ok: false, code: 'NOPERM', error: 'Tuyến chốt chặn chỉ mở cho Super Admin.' };
  if (!moBat(env)) return { ok: false, code: 'CUADONG', error: 'Bộ não đa trí đang tắt.' };
  await dungBang(db);
  const ma = String((y || {}).ma || '');
  const r = await db.prepare('SELECT * FROM tuyenDaTri WHERE ma = ?').bind(ma).first();
  if (!r) return { ok: false, code: 'KHONG_CO', error: 'Không có tuyến này.' };
  if (r.trangThai === 'xong') return { ok: false, code: 'DA_XONG', error: 'Tuyến đã chạy xong — đọc lại kết quả.' };
  if (await canHan(db, hoSo)) return { ok: false, code: 'VUOT_HAN', error: 'Đã hết lượt hỏi trong ngày.' };
  const chang = JSON.parse(r.cacChang), ket = JSON.parse(r.ketQua || '[]');
  const i = r.dangO, c = chang[i];
  /* Kết quả chặng trước làm ngữ cảnh — vòng lặp đo lường quay lại. */
  const nguCanh = ket.map(k2 => 'Chặng ' + (k2.chang + 1) + ' (' + k2.loai + '): ' + String(k2.traLoi).slice(0, 1200))
    .join('\n---\n').slice(0, 4000);
  const cau = c.de + (nguCanh ? '\n\nKết quả các chặng trước (chỉ là ngữ cảnh):\n' + nguCanh : '');
  const sang = await soatRaNhaCungCap({ provider: 'cf-workers-ai', cau, triThuc: '' }, env, db, hoSo);
  if (!sang.cho) return { ok: false, code: sang.code, ngo: sang.ngo, error: sang.vi };
  const ds = await ungVien(env, db, LOAI[c.loai], 0, hoSo);
  if (!ds.length) return { ok: false, code: 'KHONG_NCC', error: 'Chưa có nhà cung cấp nào sẵn sàng cho chặng này.' };
  const k = await goiLeoBac(env, db, hoSo, ds, c.loai, cau, '');
  if (k.chan) return k.chan;
  if (!k.n) return { ok: false, code: 'AI_LOI', daThu: k.thu, error: 'Mọi nhà cung cấp đều lỗi ở chặng này; thử lại sau.' };
  ket.push({ chang: i, loai: c.loai, de: c.de, traLoi: k.text, ncc: k.n.ma, model: k.r.model, token: k.r.vao + k.r.ra, luc: Date.now() });
  const xong = i + 1 >= chang.length;
  await db.prepare('UPDATE tuyenDaTri SET dangO = ?, ketQua = ?, trangThai = ?, lucSua = ? WHERE ma = ?')
    .bind(i + 1, JSON.stringify(ket), xong ? 'xong' : 'dangChay', Date.now(), ma).run();
  await Kho.ghiNhatKy(db, { uid: hoSo.uid, username: ten(hoSo), viec: 'DA_TRI_TUYEN_CHANG', doiTuong: ma,
    chiTiet: 'chặng ' + (i + 1) + '/' + chang.length + ' · ' + k.n.ma + ' · token ' + (k.r.vao + k.r.ra) });
  return { ok: true, ma, chang: i, soChang: chang.length, traLoi: k.text, ncc: k.n.ma, tenNcc: k.n.ten,
    token: k.r.vao + k.r.ra, xong,
    chotChan: xong ? 'Tuyến đã xong — đọc lại toàn bộ các chặng trước khi dùng.' :
      'Chốt chặn ' + (i + 1) + ': đọc và kiểm chứng kết quả này TRƯỚC khi chạy chặng ' + (i + 2) + '.' };
}

export async function docTuyenDaTri(y, env, db, hoSo) {
  if (!laR01(hoSo)) return { ok: false, code: 'NOPERM', error: 'Chỉ Super Admin.' };
  await dungBang(db);
  const ma = String((y || {}).ma || '');
  if (ma) {
    const r = await db.prepare('SELECT * FROM tuyenDaTri WHERE ma = ?').bind(ma).first();
    if (!r) return { ok: false, code: 'KHONG_CO', error: 'Không có tuyến này.' };
    return { ok: true, tuyen: { ma: r.ma, ten: r.ten, cacChang: JSON.parse(r.cacChang), dangO: r.dangO,
      ketQua: JSON.parse(r.ketQua || '[]'), trangThai: r.trangThai, luc: r.luc, lucSua: r.lucSua } };
  }
  const ds = (await db.prepare('SELECT ma, ten, cacChang, dangO, trangThai, lucSua FROM tuyenDaTri ORDER BY lucSua DESC LIMIT 30').all()).results || [];
  return { ok: true, ds: ds.map(r => ({ ma: r.ma, ten: r.ten, soChang: JSON.parse(r.cacChang).length,
    dangO: r.dangO, trangThai: r.trangThai, lucSua: r.lucSua })) };
}
