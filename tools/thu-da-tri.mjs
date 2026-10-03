/* Thử Bộ não đa trí — D1 giả = node:sqlite trong RAM, nhà cung cấp giả.
   Chứng minh: cửa tắt mặc định · Điều 13 chặn TRƯỚC đệm · rẻ trước ·
   đệm 0 token · hết ngân sách thì leo bậc · lỗi thì leo bậc · tiết kiệm
   chỉ còn Workers AI · Claude/Grok chỉ R01 · hội đồng · chấm chê xoá đệm.
   Dùng: node tools/thu-da-tri.mjs   (Node >= 22.5) */
import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import { pathToFileURL, fileURLToPath } from 'node:url';
const ROOT = process.argv[2] || fileURLToPath(new URL('..', import.meta.url)).replace(/[\\/]$/, '');
const { hoiDaTri, hoiDongDaTri, chamDaTri, soDaTri } = await import(pathToFileURL(ROOT + '/may-chu/bo-nao-da-tri.js').href);

const sq = new DatabaseSync(':memory:');
sq.exec(fs.readFileSync(ROOT + '/may-chu/csdl.sql', 'utf8'));
const db = {
  prepare(sql) { let a = []; const st = {
    bind(...x) { a = x; return st; },
    first() { return Promise.resolve(sq.prepare(sql).get(...a) || null); },
    all() { return Promise.resolve({ results: sq.prepare(sql).all(...a) }); },
    run() { const r = sq.prepare(sql).run(...a); return Promise.resolve({ meta: { changes: Number(r.changes) } }); } }; return st; },
  async batch(ds) { for (const s of ds) await s.run(); }
};

const goi = [];
let hong = new Set();
globalThis.fetch = async (url, op) => {
  const host = new URL(url).host; goi.push(host);
  if (hong.has(host)) return { ok: false, status: 503 };
  const b = JSON.parse(op.body);
  if (host === 'api.anthropic.com') return { ok: true, json: async () => ({ content: [{ type: 'text', text: 'claude: ' + b.model }], usage: { input_tokens: 50, output_tokens: 20 } }) };
  return { ok: true, json: async () => ({ choices: [{ message: { content: host + ' trả lời' } }], usage: { prompt_tokens: 40, completion_tokens: 30 } }) };
};
let cfGoi = 0;
const env = {
  GITA_DA_TRI_BAT: '1',
  AI: { async run(m, x) { cfGoi++; return { response: 'workers-ai trả lời', usage: { prompt_tokens: 30, completion_tokens: 10 } }; } },
  GITA_KHOA_DEEPSEEK: 'k1', GITA_KHOA_GEMINI: 'k2', GITA_KHOA_OPENAI: 'k3',
  GITA_KHOA_ANTHROPIC: 'k4', GITA_MAU_ANTHROPIC: 'claude-test', GITA_KHOA_XAI: 'k5', GITA_MAU_XAI: 'grok-test'
};
const r01 = { uid: 'U1', u: 'chu', role: 'R01' }, r05 = { uid: 'U5', u: 'nv', role: 'R05' }, khach = { uid: 'K', u: 'k', role: 'R20' };

let dat = 0, truot = 0;
const kiem = (ten, dk) => { if (dk) { dat++; console.log('OK  ' + ten); } else { truot++; console.log('SAI ' + ten); } };

kiem('khách hàng không gọi được', (await hoiDaTri({ cau: 'xin chào bạn' }, env, db, khach)).code === 'NOPERM');
kiem('cửa tắt khi thiếu GITA_DA_TRI_BAT', (await hoiDaTri({ cau: 'xin chào bạn' }, {}, db, r05)).code === 'CUADONG');

let n0 = goi.length + cfGoi;
const ban = await hoiDaTri({ loai: 'tomTat', cau: 'Tóm tắt hồ sơ bé Nguyễn Thị Lan, số 0912345678' }, env, db, r05);
kiem('Điều 13: dữ liệu nhận dạng bị chặn, KHÔNG gọi ai', ban.ok === false && goi.length + cfGoi === n0);
kiem('chuỗi bẩn không thành ô đệm', sq.prepare('SELECT COUNT(*) n FROM triNhoDaTri').get().n === 0);

const a = await hoiDaTri({ loai: 'tomTat', cau: 'Tóm tắt ba nguyên tắc xây thói quen học tập' }, env, db, r05);
kiem('rẻ trước: bậc 1 Workers AI', a.ok && a.ncc === 'cf-workers-ai' && a.bac === 1 && cfGoi === 1);
const b = await hoiDaTri({ loai: 'tomTat', cau: '  tóm tắt BA nguyên tắc   xây thói quen học tập ' }, env, db, r05);
kiem('đệm: câu giống nhau → 0 token, không gọi lại', b.ok && b.tuDem && b.token === 0 && cfGoi === 1);

const c = await hoiDaTri({ loai: 'tomTat', cau: 'Tóm tắt ba nguyên tắc xây thói quen học tập', tuBac: 2 }, env, db, r05);
kiem('lên bậc chủ động: bậc 2 DeepSeek', c.ok && c.ncc === 'deepseek');

const r1 = await hoiDaTri({ loai: 'phanTich', cau: 'Phân tích rủi ro mở rộng sang thị trường mới' }, env, db, r05);
kiem('phân tích bắt đầu bậc 2', r1.ok && r1.bac === 2);
const r2 = await hoiDaTri({ loai: 'phanTich', cau: 'Phân tích khác số hai', tuBac: 4 }, env, db, r05);
kiem('R05 không chạm bậc 4 (Claude/Grok)', !r2.ok && r2.code === 'KHONG_NCC');
const r3 = await hoiDaTri({ loai: 'phanTich', cau: 'Phân tích khác số ba', tuBac: 4 }, env, db, r01);
kiem('R01 chạm bậc 4', r3.ok && r3.bac === 4);
kiem('chiến lược cấp hệ chỉ R01', (await hoiDaTri({ loai: 'chienLuoc', cau: 'Chiến lược toàn cầu' }, env, db, r05)).code === 'NOPERM');

hong = new Set(['api.deepseek.com']);
const d = await hoiDaTri({ loai: 'phanTich', cau: 'Phân tích khi DeepSeek hỏng' }, env, db, r05);
kiem('nhà cung cấp lỗi → tự leo bậc 3', d.ok && d.bac === 3 && d.daThu.length === 1);
hong = new Set();

const envNgan = Object.assign({}, env, { GITA_NGAN_TOKEN_DEEPSEEK: '1' });
const e = await hoiDaTri({ loai: 'phanTich', cau: 'Phân tích khi DeepSeek hết ngân sách' }, envNgan, db, r05);
kiem('hết ngân sách ngày → bỏ qua, leo bậc', e.ok && e.ncc !== 'deepseek');

const tk = await hoiDaTri({ loai: 'phanTich', cau: 'Phân tích trong chế độ tiết kiệm' }, Object.assign({}, env, { GITA_CHE_DO_TIET_KIEM: '1' }), db, r05);
kiem('tiết kiệm: phân tích (bậc 2+) không ra ngoài', !tk.ok && tk.code === 'KHONG_NCC');

kiem('hội đồng: R05 bị chặn', (await hoiDongDaTri({ cau: 'Chiến lược giá năm tới' }, env, db, r05)).code === 'NOPERM');
const hd = await hoiDongDaTri({ cau: 'Chiến lược giá năm tới cho gói gia đình' }, env, db, r01);
kiem('hội đồng: 3 nhà khác nhau', hd.ok && new Set(hd.hoiDong.map(x => x.ncc)).size === 3);

await chamDaTri({ loai: 'tomTat', ncc: 'cf-workers-ai', tot: false, khoa: a.khoa }, env, db, r05);
const f = await hoiDaTri({ loai: 'tomTat', cau: 'Tóm tắt ba nguyên tắc xây thói quen học tập' }, env, db, r05);
kiem('chấm chê → xoá đệm, lần sau hỏi lại', f.ok && !f.tuDem);

const so = await soDaTri({}, env, db, r05);
kiem('sổ: có token hôm nay, đánh giá, không lộ khoá', so.ok && so.homNay.length >= 3 && so.danhGia.length === 1 &&
  !JSON.stringify(so).includes('k1'));
const audit = sq.prepare("SELECT COUNT(*) n FROM audit WHERE viec LIKE 'ATAI_%'").get().n;
kiem('mọi lượt đi qua cổng an toàn (sổ ATAI)', audit >= 10);
kiem('lượt bị chặn Điều 13 có vết trong sổ', sq.prepare("SELECT COUNT(*) n FROM audit WHERE viec = 'ATAI_DIEU13'").get().n === 1);

console.log(`\n${dat} đạt · ${truot} sai`);
process.exit(truot ? 1 : 0);
