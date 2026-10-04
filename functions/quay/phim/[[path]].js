/* Chuyển tiếp /quay/phim/* từ gita365.pages.dev sang Worker (clip MP4
   và ảnh nhân vật PNG của xưởng quay — các đầu ra công khai theo mã).
   Pages _redirects không proxy được tên miền ngoài nên dùng Function.
   Chỉ đọc (GET/HEAD); Worker tự xử lý 404. */
const MAY_CHU = 'https://gita365.typhuquanggita.workers.dev';

export async function onRequest(context) {
  const phuongThuc = context.request.method;
  if (phuongThuc !== 'GET' && phuongThuc !== 'HEAD')
    return new Response('Chỉ đọc.', { status: 405 });
  const u = new URL(context.request.url);
  const r = await fetch(MAY_CHU + u.pathname + u.search, {
    method: phuongThuc,
    headers: { 'User-Agent': context.request.headers.get('User-Agent') || 'GITA365-Pages' },
    redirect: 'manual',
  });
  const dau = new Headers(r.headers);
  dau.set('X-Phuc-Vu-Qua', 'gita365-pages');
  const viTri = dau.get('Location');
  if (viTri && viTri.indexOf(MAY_CHU) === 0) dau.set('Location', viTri.slice(MAY_CHU.length));
  return new Response(r.body, { status: r.status, headers: dau });
}
