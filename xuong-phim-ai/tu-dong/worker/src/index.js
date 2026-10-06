/* ═══════════════════════════════════════════════════════════════
   GITA 365 · Xưởng phim AI — Cloudflare Worker (trạm trung tâm)

   Nhận cấu hình từ web app → lưu R2 → kích hoạt GitHub Action (dựng phim
   trên Kaggle) → web app hỏi lại trạng thái & lấy phim. Worker KHÔNG giữ
   GPU; nó chỉ điều phối và phục vụ file từ R2.

   Binding cần (wrangler.toml):  R2 bucket = PHIM
   Secret cần (wrangler secret put):
     SUBMIT_TOKEN  — mật khẩu để web app được phép gửi (chống người lạ)
     GH_PAT        — GitHub token (repo scope) để kích hoạt Action
     GH_OWNER      — chủ repo, vd: typhuquanggita-commits
     GH_REPO       — tên repo, vd: GITA365-WEB
   ═══════════════════════════════════════════════════════════════ */

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'content-type,x-gita-token',
  'Access-Control-Max-Age': '86400',
};
const json = (o, s = 200) =>
  new Response(JSON.stringify(o), { status: s, headers: { 'content-type': 'application/json; charset=utf-8', ...CORS } });

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const p = url.pathname.replace(/\/+$/, '');
    if (request.method === 'OPTIONS') return new Response(null, { headers: CORS });

    try {
      // ── Gửi một tập đi sản xuất ──
      if (request.method === 'POST' && p === '/api/phim') {
        if ((request.headers.get('x-gita-token') || '') !== env.SUBMIT_TOKEN)
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
        const o = await env.PHIM.get(`jobs/${m[1]}/phim-cuoi.mp4`);
        if (!o) return json({ loi: 'Phim chưa sẵn.' }, 404);
        return new Response(o.body, {
          headers: { 'content-type': 'video/mp4', 'content-disposition': `inline; filename="gita-${m[1]}.mp4"`, ...CORS },
        });
      }

      if (p === '' || p === '/' ) return json({ ok: true, ten: 'GITA xưởng phim AI · Worker', gio: new Date().toISOString() });
      return json({ loi: 'Không có đường này.' }, 404);
    } catch (e) {
      return json({ loi: 'Lỗi Worker: ' + (e && e.message) }, 500);
    }
  },
};
