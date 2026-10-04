/* Chuyển tiếp /phim/* từ gita365.pages.dev sang Worker.
   Pages _redirects không proxy được tên miền ngoài (chỉ đường dẫn nội
   bộ), nên dùng Pages Function. Chỉ đọc (GET/HEAD); Worker tự xử lý
   404/redirect. Trang xem phim dùng đường dẫn tương đối nên ảnh và
   công thức cũng tự đi qua đây. */
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
  /* Worker trả redirect tuyệt đối về workers.dev — cắt phần origin để
     khách ở lại tên miền chính. */
  const viTri = dau.get('Location');
  if (viTri && viTri.indexOf(MAY_CHU) === 0) dau.set('Location', viTri.slice(MAY_CHU.length));
  return new Response(r.body, { status: r.status, headers: dau });
}
