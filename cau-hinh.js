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
   index.html cũng phải cho phép origin ấy (đã mở sẵn https://*.typhuquanggita.workers.dev — chỉ Worker thuộc tài khoản của Học viện).
   Thiếu một chỗ là trình duyệt chặn im lặng — chạy node tools/soat-san-sang.js
   để máy đối chiếu hai chỗ.

   CHỖ THỨ BA, Ở PHÍA MÁY CHỦ: địa chỉ chạy bản web (https://gita365.pages.dev)
   phải nằm trong danh sách GITA_DIA_CHI_WEB ở may-chu/wrangler.toml — Worker
   chỉ mở CORS cho các origin trong danh sách ấy. Thêm địa chỉ mới thì
   sửa danh sách rồi deploy lại Worker. Xem docs/MAY_CHU.md. */
G.API_CAP_PHEP = G.API_CAP_PHEP || 'https://gita365.typhuquanggita.workers.dev';

/* Không phải ai cũng sửa được tệp này — bản cài trên máy Windows nằm trong
   thư mục chương trình. Nên Super Admin còn một đường thứ hai: vào màn
   "Nối máy chủ" trong ứng dụng, dán địa chỉ, bấm thử. Địa chỉ dán ở đó
   được ghi vào máy này và thắng giá trị đặt trong tệp. */
/* An toàn: địa chỉ dán ở đó CHỈ được nhận nếu là Worker thuộc đúng tài khoản
   Cloudflare của Học viện (*.typhuquanggita.workers.dev) hoặc một tên miền
   ghi rõ trong G.MAY_CHU_THEM. Trước đây mọi https đều được nhận — một lần
   XSS hay một phút ai đó cầm máy là đủ để mọi lần đăng nhập sau gửi mật
   khẩu và phiên về máy của kẻ khác. Địa chỉ lạ đã lưu sẵn bị bỏ ngay. */
G.MAY_CHU_THEM = G.MAY_CHU_THEM || [];
G.laMayChuHopLe = function (u) {
  u = String(u || '').trim().replace(/\/+$/, '');
  if (/^https:\/\/[a-z0-9-]+\.typhuquanggita\.workers\.dev$/i.test(u)) return true;
  return G.MAY_CHU_THEM.some(function (x) { return String(x).replace(/\/+$/, '') === u; });
};
try {
  var _dat = localStorage.getItem('gita365_may_chu');
  if (_dat && G.laMayChuHopLe(_dat)) G.API_CAP_PHEP = _dat;
  else if (_dat) localStorage.removeItem('gita365_may_chu');
  localStorage.removeItem('gita_api');
} catch (e) {}
