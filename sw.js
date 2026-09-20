/* ═══════════════════════════════════════════════════════════════
   GITA 365 · v7.0 — SERVICE WORKER
   Cài một lần, dùng được cả khi mất mạng. Toàn bộ kho tri thức
   nằm trong máy — không cần đường truyền để mở bản đồ nhà mình.
   ═══════════════════════════════════════════════════════════════ */
const CACHE = 'gita365-v9-99-174';
/* Danh sách này phải khớp với thứ tự thẻ <script> trong index.html.
   Thiếu tệp thì lần cài đầu vẫn chạy — trình xử lý fetch bên dưới cache
   lại mọi thứ tải về — nhưng mất mạng ngay sau khi cài thì vỡ. */
const FILES = [
  './',
  './index.html',
  './manifest.webmanifest',
  './assets/style.css',
  /* Chỉ gói MẪU nằm trong danh sách tải sẵn.
     Bảy tệp kho/*.enc từng nằm ở đây — 12 MB tải ngay lúc cài, trước cả
     khi người dùng đăng nhập. Phụ huynh không bao giờ mở gói "nghe"
     (3,1 MB) mà vẫn phải tải; trên 3G là bốn phút và tiền 3G thật.
     Bộ xử lý fetch bên dưới đã tự lưu đệm gói nào được mở, nên tải sẵn
     cả bảy chỉ là tải hộ thứ không ai dùng. */
  './kho/mau.json',
  './assets/fonts.css',
  './assets/fonts/bevietnampro-400-italic-latin.woff2',
  './assets/fonts/bevietnampro-400-italic-vietnamese.woff2',
  './assets/fonts/bevietnampro-400-normal-latin.woff2',
  './assets/fonts/bevietnampro-400-normal-vietnamese.woff2',
  './assets/fonts/bevietnampro-600-normal-latin.woff2',
  './assets/fonts/bevietnampro-600-normal-vietnamese.woff2',
  './assets/fonts/bevietnampro-700-normal-latin.woff2',
  './assets/fonts/bevietnampro-700-normal-vietnamese.woff2',
  './assets/fonts/bevietnampro-800-normal-latin.woff2',
  './assets/fonts/bevietnampro-800-normal-vietnamese.woff2',
  './assets/fonts/playfairdisplay-500-italic-latin.woff2',
  './assets/fonts/playfairdisplay-500-italic-vietnamese.woff2',
  './assets/fonts/playfairdisplay-600-normal-latin.woff2',
  './assets/fonts/playfairdisplay-600-normal-vietnamese.woff2',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  './assets/icons/maskable-512.png',
  './gita-app.js',
  './cau-hinh.js',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(FILES))
      .then(() => self.skipWaiting())
      .catch(err => console.warn('[GITA] cache install:', err))
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* Ưu tiên bản trong máy, đồng thời làm mới ngầm ở nền */
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;   // font ngoài để trình duyệt tự lo

  /* ── Tệp nặng và không đổi: lấy trong máy, KHÔNG hỏi lại mạng ──
     Kho mã hoá, phông chữ và biểu tượng chỉ đổi khi đổi số bản, mà đổi
     số bản là đổi tên CACHE và bản cũ bị xoá sạch ở 'activate'. Nên hỏi
     lại mạng cho chúng là tải lại thứ y hệt cái đang có.

     Trước bản này, mỗi lần một Coach đăng nhập là 11,6 MB kho được tải
     lại ngầm dù máy đã có đủ. Không ai thấy vì nó chạy ở nền — chỉ hoá
     đơn 3G thấy. */
  const nangVaKhongDoi = /\.(enc|woff2|png|jpg|jpeg|webp|ico|svg)$/i.test(url.pathname);

  if (nangVaKhongDoi) {
    e.respondWith(
      caches.match(req).then(hit => hit || fetch(req).then(res => {
        if (res && res.status === 200) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy));
        }
        return res;
      }))
    );
    return;
  }

  /* Trang và mã: vẫn làm mới ngầm, vì đây là đường nhận bản vá */
  e.respondWith(
    caches.match(req).then(hit => {
      const net = fetch(req).then(res => {
        if (res && res.status === 200) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy));
        }
        return res;
      }).catch(() => hit);
      return hit || net;
    })
  );
});
