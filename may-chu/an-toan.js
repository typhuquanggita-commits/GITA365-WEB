/* ═══════════════════════════════════════════════════════════════
   GITA 365 · TIỆN ÍCH AN TOÀN CHUNG

   Một chỗ tập trung cho các hàm ngẫu nhiên, kiểm tra đầu vào, và các
   tiện ích bảo vệ dữ liệu dùng chung cho máy chủ.
   ═══════════════════════════════════════════════════════════════ */

/** Sinh chuỗi ngẫu nhiên an toàn dùng làm id, mã ngắn, suffix. */
export function ngauNhienHex(byte) {
  byte = byte || 8;
  return [...crypto.getRandomValues(new Uint8Array(byte))]
    .map(b => b.toString(16).padStart(2, '0')).join('');
}

/** Sinh id ngắn dạng prefix + timestamp36 + random hex.
    Dùng thay cho Math.random() trong các mã định danh. */
export function idNgauNhien(prefix) {
  return String(prefix || 'ID') + '-' +
    Date.now().toString(36) + '-' + ngauNhienHex(6);
}

/** Kiểm tra MIME type từ magic bytes của Uint8Array. */
export function doanMime(bytes) {
  if (!bytes || !bytes.length) return 'application/octet-stream';
  const b = bytes;
  if (b[0] === 0xFF && b[1] === 0xD8 && b[2] === 0xFF) return 'image/jpeg';
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4E && b[3] === 0x47) return 'image/png';
  if (b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46) return 'image/gif';
  if (b[0] === 0x25 && b[1] === 0x50 && b[2] === 0x44 && b[3] === 0x46) return 'application/pdf';
  if (b[0] === 0x50 && b[1] === 0x4B) return 'application/zip';
  if (b[0] === 0x1F && b[1] === 0x8B) return 'application/gzip';
  return 'application/octet-stream';
}

/** Kiểm tra phần mở rộng có khớp MIME không. */
export function hopLeMime(duoi, mime) {
  const bang = {
    jpg: ['image/jpeg'], jpeg: ['image/jpeg'], png: ['image/png'], gif: ['image/gif'],
    pdf: ['application/pdf'],
    zip: ['application/zip'], docx: ['application/zip'], xlsx: ['application/zip'],
    gz: ['application/gzip'], tar: ['application/x-tar']
  };
  const hop = bang[String(duoi || '').toLowerCase()] || [];
  return hop.indexOf(String(mime || '').toLowerCase()) >= 0;
}
