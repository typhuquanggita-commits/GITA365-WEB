/* ═══════════════════════════════════════════════════════════════
   GITA 365 — KHOÁ CÔNG KHAI CỦA BÁO CÁO SOÁT TOÀN MÀN

   Đây là khoá CÔNG KHAI (RSA-OAEP 3072, SHA-256) — chỉ dùng để MÃ HOÁ.
   Công cụ Soát toàn bộ màn (src/soat-toan-man.js) mã hoá báo cáo ngay
   trong trình duyệt của Super Admin bằng khoá này, nên máy chủ, GitHub
   và đường truyền chỉ thấy bản mã. Khoá RIÊNG để giải không nằm trong kho
   mã, không nằm ở Cloudflare hay GitHub — chỉ ở máy của người được giao
   phân tích. Lộ khoá này không lộ gì: nó không giải được bản nào.
   Đổi khoá: thay pub + dauVan (8 byte đầu SHA-256 của DER, dạng hex).
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;
G.KHOA_SOAT = {
  dauVan: 'e465da4f04ff3283',
  pub: 'MIIBojANBgkqhkiG9w0BAQEFAAOCAY8AMIIBigKCAYEA2UmqElSFBqHTRyuo1P6PyMxP9ntSOQx05LrjXDgoLS+fCLhTgORvx6lFFISP0TkT0GVyBQ02k1Ive9HnvRbOrhTs3oNyxB7tG553kUjULDZAD5SCVj8ctuz4SfRLWDkKGGvZ3A6w6M8zrk9MoEwBHZXdwUUOKhw2Kc6c3vlvUkFlnNVRkxkhxPwVUkZTZa916Ybb/Du0xkcIYyGe0EQZM7mg+3mG4Ra80pU3oBfyFkVy/eRIq/Y03wbLiQnpd4L1vZeQ7FBTRAj51KZpaANW/VaNTTkcWkTzRiKtId1klVyTFODp7ijdZVWvpMiJRxyGabkuCXNt4d734MVWkbDN0rXhgDc4QajGu6x7gzSX8Ga7VoCtVuIPZjdhy5QRdcMUp2C4Rp/q0jzJ4k8dX6EV6J/B7NNM4NgsNS3FOTXIWDz5mN4e9uUYVXESjDAU30cZQ+kiBA1aS2Y629xdSjhT7bXGcg70bK8XU9/GGD4GE1a7+Tkj0E30Cjdx9Mtl+LS5AgMBAAE='
};
