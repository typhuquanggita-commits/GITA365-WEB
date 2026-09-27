/* ═══════════════════════════════════════════════════════════════
   GITA 365 · v8.2 — LOGO CHUẨN CỦA HỌC VIỆN
   Dùng ĐÚNG tệp logo gốc anh Quang cấp (LOGO GITA.png trên Drive),
   đã cắt sát nét và nén lại: 640px · 115 KB.

   Bản v7.7–v8.1 dùng hình vector tôi vẽ lại theo ảnh — giống nhưng
   không trùng khít. Nay bỏ hẳn bản vẽ lại: nhận diện chỉ có một
   nguồn duy nhất là tệp gốc, không ai được vẽ lại lần nữa.

   Ảnh nằm trong chính ứng dụng (assets/brand/) nên không gọi ra
   mạng, chạy được ngoại tuyến, và bản máy tính dùng chung một tệp.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;

(function(){
var LOGO = 'assets/brand/logo-gita.png';
var DAU  = 'assets/brand/dau-gita.png';

/* Logo đầy đủ — trang bìa tài liệu, cổng vào, chứng nhận */
G.logoGita = function(cao){
  return '<img src="' + LOGO + '" alt="GITA" class="logo-gita"' +
    (cao ? ' style="height:' + cao + 'px;width:auto"' : '') +
    ' width="640" height="371" loading="eager" decoding="async">';
};

/* Dấu vuông — thanh trên, biểu tượng ứng dụng, ảnh đại diện */
G.dauGita = function(){
  return '<img src="' + DAU + '" alt="GITA" class="dau-gita" ' +
    'width="256" height="256" loading="eager" decoding="async">';
};
})();
