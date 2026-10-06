/* ═══════════════════════════════════════════════════════════════
   GITA 365 · Xưởng phim AI — Cloudflare Worker (trạm trung tâm)

   Nhận cấu hình từ web app → lưu R2 → kích hoạt GitHub Action (dựng phim
   trên Kaggle) → web app hỏi lại trạng thái & lấy phim. Worker KHÔNG giữ
   GPU; nó chỉ điều phối và phục vụ file từ R2.

   Binding cần (wrangler.toml):  R2 bucket = PHIM
   Secret cần (wrangler secret put):
     SUBMIT_TOKEN  — mật khẩu để web app được phép gửi (chống người lạ)
     MODAL_URL     — địa chỉ máy GPU song song (đường "Làm phim nhanh", xem nhanh/README-nhanh.md)
     GPU_TOKEN     — mật khẩu riêng giữa trạm ↔ máy GPU (đặt giống secret GITA_GPU_TOKEN bên Modal)
     GH_PAT        — GitHub token (repo scope) để kích hoạt Action
     GH_OWNER      — chủ repo, vd: typhuquanggita-commits
     GH_REPO       — tên repo, vd: GITA365-WEB
   ═══════════════════════════════════════════════════════════════ */

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,OPTIONS',
  'Access-Control-Allow-Headers': 'content-type,x-gita-token,x-gpu-token',
  'Access-Control-Max-Age': '86400',
};
const json = (o, s = 200) =>
  new Response(JSON.stringify(o), { status: s, headers: { 'content-type': 'application/json; charset=utf-8', ...CORS } });

// So khớp mật khẩu không lộ độ dài/thời gian (chống dò từng ký tự)
async function dung(a, b) {
  if (!a || !b) return false;
  const e = new TextEncoder();
  const [x, y] = await Promise.all([crypto.subtle.digest('SHA-256', e.encode(a)), crypto.subtle.digest('SHA-256', e.encode(b))]);
  const u = new Uint8Array(x), v = new Uint8Array(y);
  let d = 0;
  for (let i = 0; i < u.length; i++) d |= u[i] ^ v[i];
  return d === 0;
}
const laMa = (s) => /^[a-z0-9-]{1,40}$/i.test(s || '');
const TEP_KQ = new Set(['trang-thai.json', 'phim-cuoi.mp4', 'phim-cuoi-phude.mp4']);
const LOAI = { json: 'application/json; charset=utf-8', mp4: 'video/mp4', jpg: 'image/jpeg', wav: 'audio/wav' };

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const p = url.pathname.replace(/\/+$/, '');
    if (request.method === 'OPTIONS') return new Response(null, { headers: CORS });

    try {
      // ════ LÀM PHIM NHANH ════
      // ① Web app gửi ảnh mẫu (đã thu nhỏ trên máy, JPEG base64) → R2 cast/<id>-<ngẫu nhiên>.jpg
      if (request.method === 'POST' && p === '/api/anh') {
        if (!(await dung(request.headers.get('x-gita-token') || '', env.SUBMIT_TOKEN))) return json({ loi: 'Sai mật khẩu gửi.' }, 401);
        const b = await request.json().catch(() => null);
        const m = b && typeof b.data === 'string' && b.data.match(/^data:image\/jpeg;base64,([A-Za-z0-9+/=]+)$/);
        if (!m || !laMa(b.id)) return json({ loi: 'Ảnh không hợp lệ (cần JPEG).' }, 400);
        const bytes = Uint8Array.from(atob(m[1]), (c) => c.charCodeAt(0));
        if (bytes.length > 4 * 1024 * 1024) return json({ loi: 'Ảnh quá lớn (tối đa 4MB).' }, 413);
        const key = `cast/${b.id}-${crypto.randomUUID().slice(0, 8)}.jpg`;
        await env.PHIM.put(key, bytes, { httpMetadata: { contentType: 'image/jpeg' } });
        return json({ key });
      }
      // ② Web app gửi kế hoạch cảnh → tạo job → gọi máy GPU song song (Modal)
      if (request.method === 'POST' && p === '/api/nhanh') {
        if (!(await dung(request.headers.get('x-gita-token') || '', env.SUBMIT_TOKEN))) return json({ loi: 'Sai mật khẩu gửi.' }, 401);
        if (!env.MODAL_URL || !env.GPU_TOKEN) return json({ loi: 'Trạm chưa nối máy GPU (MODAL_URL, GPU_TOKEN). Xem nhanh/README-nhanh.md.' }, 503);
        const b = await request.json().catch(() => null);
        if (!b || !Array.isArray(b.canh) || !b.canh.length || b.canh.length > 20 || !Array.isArray(b.nhan_vat))
          return json({ loi: 'Kế hoạch phim không hợp lệ (1–20 cảnh).' }, 400);
        for (const n of b.nhan_vat) if (!laMa(n.id) || (n.anh && !/^cast\/[a-z0-9-]+\.jpg$/i.test(n.anh))) return json({ loi: 'Nhân vật không hợp lệ.' }, 400);
        const jobid = crypto.randomUUID().replace(/-/g, '').slice(0, 16);
        const now = new Date().toISOString();
        await env.PHIM.put(`jobs/${jobid}/ke-hoach.json`, JSON.stringify(b));
        await env.PHIM.put(`jobs/${jobid}/trang-thai.json`,
          JSON.stringify({ jobid, trangThai: 'queued', buoc: 'Đã nhận kịch bản, đang bật máy GPU…', phanTram: 2, tao: now, capNhat: now }));
        const r = await fetch(env.MODAL_URL, {
          method: 'POST',
          headers: { 'content-type': 'application/json', 'x-gpu-token': env.GPU_TOKEN },
          body: JSON.stringify({ jobid, tram: url.origin }),
        });
        if (!r.ok) {
          const t = (await r.text()).slice(0, 300);
          await env.PHIM.put(`jobs/${jobid}/trang-thai.json`, JSON.stringify({ jobid, trangThai: 'error', buoc: 'Máy GPU không nhận việc', chiTiet: t, capNhat: now }));
          return json({ loi: 'Máy GPU không nhận việc. Kiểm tra MODAL_URL / GPU_TOKEN.', chiTiet: t }, 502);
        }
        return json({ jobid, trangThai: 'queued' });
      }
      // ③ Máy GPU đọc kế hoạch / ảnh mẫu (chỉ máy GPU có GPU_TOKEN)
      let g = p.match(/^\/api\/gpu\/doc\/(jobs\/[a-z0-9-]+\/ke-hoach\.json|cast\/[a-z0-9-]+\.jpg)$/i);
      if (request.method === 'GET' && g) {
        if (!(await dung(request.headers.get('x-gpu-token') || '', env.GPU_TOKEN))) return json({ loi: 'Sai GPU_TOKEN.' }, 401);
        const o = await env.PHIM.get(g[1]);
        if (!o) return json({ loi: 'Không thấy tệp.' }, 404);
        return new Response(o.body, { headers: { 'content-type': LOAI[g[1].split('.').pop()] || 'application/octet-stream' } });
      }
      // ④ Máy GPU ghi trạng thái / phim (chỉ 3 tên tệp được phép)
      g = p.match(/^\/api\/gpu\/ghi\/([a-z0-9-]+)\/([a-z0-9.-]+)$/i);
      if (request.method === 'PUT' && g) {
        if (!(await dung(request.headers.get('x-gpu-token') || '', env.GPU_TOKEN))) return json({ loi: 'Sai GPU_TOKEN.' }, 401);
        if (!laMa(g[1]) || !TEP_KQ.has(g[2])) return json({ loi: 'Tên tệp không được phép.' }, 400);
        await env.PHIM.put(`jobs/${g[1]}/${g[2]}`, request.body, { httpMetadata: { contentType: LOAI[g[2].split('.').pop()] } });
        return json({ ok: true });
      }

      // ── Gửi một tập đi sản xuất ──
      if (request.method === 'POST' && p === '/api/phim') {
        if (!(await dung(request.headers.get('x-gita-token') || '', env.SUBMIT_TOKEN)))
          return json({ loi: 'Sai mật khẩu gửi (SUBMIT_TOKEN).' }, 401);
        const body = await request.json().catch(() => null);
        if (!body || !body.config || !body.config.canh)
          return json({ loi: 'Thiếu cấu hình phim hợp lệ.' }, 400);

        const jobid = crypto.randomUUID().slice(0, 12);
        const now = new Date().toISOString();
        await env.PHIM.put(`jobs/${jobid}/cau-hinh.json`, JSON.stringify(body.config));
        await env.PHIM.put(
          `jobs/${jobid}/trang-thai.json`,
          JSON.stringify({ jobid, trangThai: 'queued', buoc: 'Đã nhận, đang xếp hàng', tao: now, capNhat: now, phim: '' })
        );

        // Kích hoạt GitHub Action qua repository_dispatch
        const gh = await fetch(`https://api.github.com/repos/${env.GH_OWNER}/${env.GH_REPO}/dispatches`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${env.GH_PAT}`,
            Accept: 'application/vnd.github+json',
            'User-Agent': 'gita-xuong-phim',
            'content-type': 'application/json',
          },
          body: JSON.stringify({ event_type: 'dung-phim', client_payload: { jobid, config: body.config } }),
        });
        if (!gh.ok) {
          const t = await gh.text();
          await env.PHIM.put(
            `jobs/${jobid}/trang-thai.json`,
            JSON.stringify({ jobid, trangThai: 'error', buoc: 'Không kích hoạt được GitHub Action', chiTiet: t.slice(0, 300), capNhat: now })
          );
          return json({ loi: 'Không kích hoạt được dây chuyền. Kiểm tra GH_PAT/GH_OWNER/GH_REPO.', chiTiet: t.slice(0, 300) }, 502);
        }
        return json({ jobid, trangThai: 'queued' });
      }

      // ── Hỏi trạng thái một tập ──
      let m = p.match(/^\/api\/phim\/([a-z0-9-]+)$/i);
      if (request.method === 'GET' && m) {
        const o = await env.PHIM.get(`jobs/${m[1]}/trang-thai.json`);
        if (!o) return json({ loi: 'Không thấy job.' }, 404);
        return new Response(o.body, { headers: { 'content-type': 'application/json; charset=utf-8', ...CORS } });
      }

      // ── Lấy phim đã dựng ──
      m = p.match(/^\/api\/phim\/([a-z0-9-]+)\/video$/i);
      if (request.method === 'GET' && m) {
        const ban = url.searchParams.get('ban') === 'phude' ? 'phim-cuoi-phude.mp4' : 'phim-cuoi.mp4';
        const range = request.headers.get('range');
        const mr = range && range.match(/bytes=(\d+)-(\d*)/);
        const o = await env.PHIM.get(`jobs/${m[1]}/${ban}`, mr ? { range: { offset: +mr[1], length: mr[2] ? +mr[2] - +mr[1] + 1 : undefined } } : {});
        if (!o) return json({ loi: 'Phim chưa sẵn.' }, 404);
        const tai = url.searchParams.get('tai') ? 'attachment' : 'inline';
        const hd = { 'content-type': 'video/mp4', 'accept-ranges': 'bytes', 'content-disposition': `${tai}; filename="gita-${m[1]}${ban.includes('phude') ? '-phude' : ''}.mp4"`, ...CORS };
        if (mr && o.range) {
          const dau = o.range.offset, dai = o.range.length ?? (o.size - dau);
          return new Response(o.body, { status: 206, headers: { ...hd, 'content-range': `bytes ${dau}-${dau + dai - 1}/${o.size}`, 'content-length': String(dai) } });
        }
        return new Response(o.body, { headers: { ...hd, 'content-length': String(o.size) } });
      }

      if (p === '' || p === '/' ) return json({ ok: true, ten: 'GITA xưởng phim AI · Worker', gio: new Date().toISOString() });
      return json({ loi: 'Không có đường này.' }, 404);
    } catch (e) {
      return json({ loi: 'Lỗi Worker: ' + (e && e.message) }, 500);
    }
  },
};
