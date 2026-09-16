/* ═══════════════════════════════════════════════════════════════
   GITA 365 — CẤU HÌNH TRIỂN KHAI
   Tệp duy nhất cần sửa khi đưa bản web lên mạng. Không có gì bí mật
   ở đây: chỉ là địa chỉ máy chủ cấp phép. Khoá vẫn nằm trên máy chủ.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;

/* Dán URL triển khai của Apps Script (…/exec) vào đây.
   Để trống thì ứng dụng chạy ở CHẾ ĐỘ MẪU — xem được giao diện và phần
   giới thiệu, kho chuyên môn vẫn khoá. Xem docs/TRIEN_KHAI_WEB.md. */
/* Giữ giá trị đã có sẵn. Bản do Apps Script phục vụ tiêm địa chỉ máy chủ vào
   trước khi tệp này chạy — gán đè bằng chuỗi rỗng là xoá mất nó. */
G.API_CAP_PHEP = G.API_CAP_PHEP || '';

/* Không phải ai cũng sửa được tệp này — bản cài trên máy Windows nằm trong
   thư mục chương trình. Nên Super Admin còn một đường thứ hai: vào màn
   "Nối máy chủ" trong ứng dụng, dán địa chỉ, bấm thử. Địa chỉ dán ở đó
   được ghi vào máy này và thắng giá trị đặt trong tệp. */
try {
  var _dat = localStorage.getItem('gita365_may_chu');
  if (_dat && /^https:\/\//.test(_dat)) G.API_CAP_PHEP = _dat;
} catch (e) {}
