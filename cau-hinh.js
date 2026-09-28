/* ═══════════════════════════════════════════════════════════════
   GITA 365 — CẤU HÌNH TRIỂN KHAI
   Tệp duy nhất cần sửa khi đưa bản web lên mạng. Không có gì bí mật
   ở đây: chỉ là địa chỉ máy chủ cấp phép. Khoá vẫn nằm trên máy chủ.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;

/* ══ MÁY CHỦ NAY LÀ CLOUDFLARE WORKER, KHÔNG CÒN APPS SCRIPT (9.99.197) ══
   Dán địa chỉ Cloudflare Worker của Học viện vào đây, dạng:
       https://gita365.<TÊN-TÀI-KHOẢN>.workers.dev
   (tên Worker là "gita365" — xem may-chu/wrangler.toml; <TÊN-TÀI-KHOẢN>
   là tên miền con Cloudflare cấp cho anh khi triển khai lần đầu).

   Để TRỐNG thì ứng dụng chạy ở CHẾ ĐỘ MẪU — xem được giao diện và phần
   giới thiệu, kho chuyên môn vẫn khoá. Các bước dựng Worker: xem màn
   "Quản trị trang → Nối máy chủ" trong ứng dụng, hoặc docs/MAY_CHU.md.

   HAI CHỖ PHẢI ĐI CÙNG NHAU: đổi địa chỉ ở đây thì connect-src trong
   index.html cũng phải cho phép origin ấy (đã mở sẵn https://*.workers.dev).
   Thiếu một chỗ là trình duyệt chặn im lặng — chạy node tools/soat-san-sang.js
   để máy đối chiếu hai chỗ. */
G.API_CAP_PHEP = G.API_CAP_PHEP || 'https://gita365.typhuquanggita.workers.dev';

/* Không phải ai cũng sửa được tệp này — bản cài trên máy Windows nằm trong
   thư mục chương trình. Nên Super Admin còn một đường thứ hai: vào màn
   "Nối máy chủ" trong ứng dụng, dán địa chỉ, bấm thử. Địa chỉ dán ở đó
   được ghi vào máy này và thắng giá trị đặt trong tệp. */
try {
  var _dat = localStorage.getItem('gita365_may_chu');
  if (_dat && /^https:\/\//.test(_dat)) G.API_CAP_PHEP = _dat;
} catch (e) {}
