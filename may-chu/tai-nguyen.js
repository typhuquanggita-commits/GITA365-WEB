/* ═══════════════════════════════════════════════════════════════
   GITA 365 · KHO TÀI NGUYÊN TĨNH TRÊN CLOUDFLARE R2 (9.99.254)

   Chủ hệ chốt: hệ thống chỉ chạy trên GitHub + Cloudflare. Giọng đọc
   tiếng Việt của xưởng phim 0 đồng (Piper, mã nguồn mở) trước đây tải
   thẳng từ jsDelivr và HuggingFace — nay trình duyệt chỉ tải từ chính
   Worker này: GET /tn/<tên tệp> → R2 (bucket gita365-hoso, tiền tố tn/).

   Nạp lần đầu: tệp nào chưa có trong R2 thì Worker tự chép MỘT LẦN từ
   nguồn gốc đã ghim phiên bản, đối chiếu đúng độ dài + SHA-256 rồi mới
   giữ lại (sai thì xoá, không phục vụ). Từ đó mọi lượt tải đều đi từ
   Cloudflare. Danh sách cố định — không nhận tên tệp tuỳ ý, nên đây
   không thành cửa proxy mở ra Internet.

   R2 miễn phí 10 GB lưu + không tính phí băng thông ra; bộ giọng ~110 MB.
   ═══════════════════════════════════════════════════════════════ */
'use strict';

const JSD = 'https://cdn.jsdelivr.net/npm/@diffusionstudio/';
const HF = 'https://huggingface.co/rhasspy/piper-voices/resolve/main/vi/vi_VN/';
const KHOA = 'tn/';

export const TAI_NGUYEN = {
  'piper-glue.js': { nguon: JSD + 'vits-web@1.0.3/dist/piper-DeOu3H9E.js', dai: 130569,
    sha: 'e2701cb8c73580ab395a67ad036ea1a4a9e50500c33c8b8499d159c3638451f3', kieu: 'text/javascript; charset=utf-8' },
  'piper_phonemize.wasm': { nguon: JSD + 'piper-wasm@1.0.0/build/piper_phonemize.wasm', dai: 635212,
    sha: 'b777cd107a91d2bcc6a1ea46f2c26a662a7407394fe84589198aeaa83dd7a9d6', kieu: 'application/wasm' },
  'piper_phonemize.data': { nguon: JSD + 'piper-wasm@1.0.0/build/piper_phonemize.data', dai: 18077249,
    sha: '29f1025eb23a5b5c192cd14a6efbce4509402ff265405072ee6f7d1a09b78f8c', kieu: 'application/octet-stream' },
  'vi_VN-vais1000-medium.onnx': { nguon: HF + 'vais1000/medium/vi_VN-vais1000-medium.onnx', dai: 63201294,
    sha: 'ec7c89e2c85f4d1edc24b6120c18aaf1bda614f06b511567eb9c7c0de15e2dab', kieu: 'application/octet-stream' },
  'vi_VN-vais1000-medium.onnx.json': { nguon: HF + 'vais1000/medium/vi_VN-vais1000-medium.onnx.json', dai: 4860,
    sha: 'fafb9da1354ed4b77c31af228ed41fb41cd825c14cffa105454b25e6ae751ee0', kieu: 'application/json; charset=utf-8' },
  'vi_VN-vivos-x_low.onnx': { nguon: HF + 'vivos/x_low/vi_VN-vivos-x_low.onnx', dai: 27789413,
    sha: '6ab13374eb0862021a545befe7727aef59e16117f1c075aa9e0362237ecc98ae', kieu: 'application/octet-stream' },
  'vi_VN-vivos-x_low.onnx.json': { nguon: HF + 'vivos/x_low/vi_VN-vivos-x_low.onnx.json', dai: 5592,
    sha: '9dc373d69b0e4f39d864cb8ac9fe42cee49817a0f02d831e57a9ce6e944e234a', kieu: 'application/json; charset=utf-8' }
};

const RE_DUONG = /^\/tn\/([A-Za-z0-9._-]{1,80})$/;
export function tenTaiNguyen(pathname) {
  const m = RE_DUONG.exec(String(pathname || ''));
  return m && Object.prototype.hasOwnProperty.call(TAI_NGUYEN, m[1]) ? m[1] : '';
}

function dauTaiNguyen(m) {
  return {
    'Content-Type': m.kieu,
    'Access-Control-Allow-Origin': '*',
    'Cross-Origin-Resource-Policy': 'cross-origin',
    'Cache-Control': 'public, max-age=31536000, immutable',
    'X-Content-Type-Options': 'nosniff'
  };
}

function hex(buf) {
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
}

/* Chép một tệp từ nguồn gốc vào R2, kiểm độ dài + SHA-256 trên đường đi. */
export async function napVaoR2(env, ten, layVe) {
  const m = TAI_NGUYEN[ten];
  const r = await (layVe || fetch)(m.nguon, { redirect: 'follow' });
  if (!r.ok || !r.body) throw new Error('Nguồn trả ' + r.status);
  const [mot, hai] = r.body.tee();
  const bam = new crypto.DigestStream('SHA-256');
  const bamXong = hai.pipeTo(bam).then(() => bam.digest);
  const codinh = new FixedLengthStream(m.dai);
  const chep = mot.pipeTo(codinh.writable);
  const ghi = env.HOSO.put(KHOA + ten, codinh.readable, { httpMetadata: { contentType: m.kieu } });
  await Promise.all([chep, ghi]);
  const sha = hex(await bamXong);
  if (sha !== m.sha) {
    await env.HOSO.delete(KHOA + ten);
    throw new Error('SHA-256 không khớp');
  }
}

export async function phucVuTaiNguyen(req, env) {
  const ten = tenTaiNguyen(new URL(req.url).pathname);
  if (!ten) return new Response('Không có tệp này.', { status: 404, headers: { 'Access-Control-Allow-Origin': '*' } });
  if (!env.HOSO) return new Response('Máy chủ chưa gắn R2.', { status: 503, headers: { 'Access-Control-Allow-Origin': '*' } });
  const m = TAI_NGUYEN[ten];
  let o = await env.HOSO.get(KHOA + ten);
  if (!o) {
    try { await napVaoR2(env, ten); }
    catch (e) {
      console.error('TN_NAP_HONG', ten, String(e && e.message || e));
      return new Response('Chưa nạp được tài nguyên, thử lại sau.', { status: 502, headers: { 'Access-Control-Allow-Origin': '*' } });
    }
    o = await env.HOSO.get(KHOA + ten);
    if (!o) return new Response('Chưa nạp được tài nguyên.', { status: 502, headers: { 'Access-Control-Allow-Origin': '*' } });
  }
  const dau = dauTaiNguyen(m);
  dau['Content-Length'] = String(o.size);
  if (o.httpEtag) dau.ETag = o.httpEtag;
  return new Response(req.method === 'HEAD' ? null : o.body, { status: 200, headers: dau });
}
