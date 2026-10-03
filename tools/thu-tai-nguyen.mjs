/* Thử kho tài nguyên R2 (may-chu/tai-nguyen.js): danh sách cố định,
   nạp lần đầu có kiểm SHA-256, phục vụ từ R2.
   Chạy: node tools/thu-tai-nguyen.mjs */
import { createHash } from 'node:crypto';
import { TAI_NGUYEN, tenTaiNguyen, napVaoR2, phucVuTaiNguyen } from '../may-chu/tai-nguyen.js';

let hong = 0, dat = 0;
function kiem(ten, dk) { if (dk) dat++; else { hong++; console.error('HỎNG:', ten); } }

/* Giả lập hai lớp riêng của Workers */
class DigestStream extends WritableStream {
  constructor() {
    const h = createHash('sha256'); let xong;
    const p = new Promise(o => { xong = o; });
    super({ write(c) { h.update(c); }, close() { xong(h.digest().buffer); } });
    this.digest = p;
  }
}
globalThis.crypto.DigestStream = DigestStream;
globalThis.FixedLengthStream = class extends TransformStream {
  constructor(n) { let d = 0; super({ transform(c, k) { d += c.byteLength; k.enqueue(c); }, flush() { if (d !== n) throw new Error('độ dài sai'); } }); }
};
function r2() {
  const kho = new Map();
  return { kho,
    async put(k, s) { const b = new Uint8Array(await new Response(s).arrayBuffer()); kho.set(k, b); },
    async get(k) { const b = kho.get(k); return b ? { size: b.byteLength, body: new Response(b).body, httpEtag: '"e"' } : null; },
    async delete(k) { kho.delete(k); } };
}

kiem('tên hợp lệ', tenTaiNguyen('/tn/piper-glue.js') === 'piper-glue.js');
kiem('tên lạ bị từ chối', tenTaiNguyen('/tn/khac.js') === '' && tenTaiNguyen('/tn/../worker.js') === '' &&
  tenTaiNguyen('/tn/__proto__') === '' && tenTaiNguyen('/tn/piper-glue.js/x') === '');
kiem('đủ 7 tệp, đều có sha/độ dài', Object.keys(TAI_NGUYEN).length === 7 &&
  Object.values(TAI_NGUYEN).every(m => /^[0-9a-f]{64}$/.test(m.sha) && m.dai > 0 && /^https:\/\//.test(m.nguon)));

/* Nạp đúng: thay tạm bản ghi để dữ liệu nhỏ */
const that = new TextEncoder().encode('{"audio":{"sample_rate":22050}}');
const goc = TAI_NGUYEN['vi_VN-vivos-x_low.onnx.json'];
const luu = { ...goc };
goc.dai = that.byteLength; goc.sha = createHash('sha256').update(that).digest('hex');
let env = { HOSO: r2() };
await napVaoR2(env, 'vi_VN-vivos-x_low.onnx.json', async () => new Response(that));
kiem('nạp đúng → có trong R2', env.HOSO.kho.has('tn/vi_VN-vivos-x_low.onnx.json'));

/* Sai SHA → xoá, ném lỗi */
env = { HOSO: r2() };
let loi = null;
const gia = new TextEncoder().encode('{"audio":{"sample_rate":99999}}');
try { await napVaoR2(env, 'vi_VN-vivos-x_low.onnx.json', async () => new Response(gia)); } catch (e) { loi = e; }
kiem('sai SHA → lỗi + xoá', loi && /SHA/.test(loi.message) && !env.HOSO.kho.has('tn/vi_VN-vivos-x_low.onnx.json'));

/* Phục vụ: lần đầu tự nạp (fetch giả), lần sau từ R2 không gọi nguồn */
env = { HOSO: r2() };
let soLanNguon = 0;
const fetchCu = globalThis.fetch;
globalThis.fetch = async () => { soLanNguon++; return new Response(that); };
const tatLog = console.error; console.error = () => {};
let res = await phucVuTaiNguyen(new Request('https://w.test/tn/vi_VN-vivos-x_low.onnx.json'), env);
kiem('lần đầu 200 + nội dung', res.status === 200 && (await res.text()) === new TextDecoder().decode(that) && soLanNguon === 1);
kiem('header CORS/CORP/cache', res.headers.get('access-control-allow-origin') === '*' &&
  res.headers.get('cross-origin-resource-policy') === 'cross-origin' && /immutable/.test(res.headers.get('cache-control')));
res = await phucVuTaiNguyen(new Request('https://w.test/tn/vi_VN-vivos-x_low.onnx.json'), env);
kiem('lần sau lấy từ R2', res.status === 200 && soLanNguon === 1);
res = await phucVuTaiNguyen(new Request('https://w.test/tn/vi_VN-vivos-x_low.onnx.json', { method: 'HEAD' }), env);
kiem('HEAD không thân', res.status === 200 && res.body === null);
kiem('tên lạ → 404', (await phucVuTaiNguyen(new Request('https://w.test/tn/x.js'), env)).status === 404);
kiem('thiếu R2 → 503', (await phucVuTaiNguyen(new Request('https://w.test/tn/piper-glue.js'), {})).status === 503);
globalThis.fetch = async () => new Response('hỏng', { status: 500 });
kiem('nguồn hỏng → 502', (await phucVuTaiNguyen(new Request('https://w.test/tn/piper-glue.js'), { HOSO: r2() })).status === 502);
globalThis.fetch = fetchCu; console.error = tatLog;
Object.assign(goc, luu);

console.log(`thu-tai-nguyen: ${dat} đạt, ${hong} hỏng`);
process.exit(hong ? 1 : 0);
