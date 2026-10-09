/* ═══════════════════════════════════════════════════════════════
   GITA 365 — CỬA LIÊN HỆ CỦA TRANG CÔNG KHAI (lien-he.html)

   Tới 9/10/2026 form "Đăng ký tư vấn" gửi thẳng tên và số điện thoại của
   cha mẹ sang formspree.io — một dịch vụ ngoài, ngoài Cloudflare, ngoài
   tay Học viện. Người đọc trang không thấy điều ấy, và Học viện không
   kiểm được dữ liệu ấy nằm ở đâu, bao lâu.

   Nay form đi vào Worker của chính Học viện. Bốn luật:

   1. KHÔNG CẦN PHIÊN — người hỏi tư vấn chưa có tài khoản. Nên cửa này
      đứng trước cổng phiên, và vì thế nó là cửa dễ bị lạm dụng: mọi chỗ
      chặt nằm ở đây, không trông vào trang.
   2. KHÔNG LƯU vào cơ sở dữ liệu. Lời nhắn đi thẳng tới hòm thư chủ hệ
      (GITA_THU_TRA_LOI) rồi thôi. Không có bảng nào giữ tên + số điện
      thoại của người lạ, nên một bản dump cơ sở dữ liệu không mang theo
      nó. Nhật ký chỉ ghi "có một lượt liên hệ", không ghi nội dung.
   3. NGƯỜI NHẬN CỐ ĐỊNH — cửa không nhận địa chỉ nhận từ trình duyệt,
      nên không thành chỗ để gửi thư tới người lạ (cùng luật thuGuiThu).
   4. GỬI HỎNG THÌ NÓI THẬT. Báo "đã nhận" trong khi thư không đi là để
      một gia đình ngồi chờ một cuộc gọi không bao giờ tới.
   ═══════════════════════════════════════════════════════════════ */
import { Kho } from './nen.js';
import { guiThu, sachChoThu } from './thu.js';

const CHU_DE = { '7ngay': 'Gói 7 ngày trải nghiệm', '90ngay': 'Lộ trình 90 ngày',
  '365ngay': 'Đồng hành 365 ngày', 'khac': 'Câu hỏi khác' };
/* Một IP gửi được 3 lượt mỗi giờ; cả hệ 200 lượt mỗi ngày. Một gia đình
   thật gửi một lần. Trần cả hệ giữ cho hòm thư chủ hệ không bị dội ngập
   nếu ai đó xoay vòng nhiều địa chỉ IP. */
const TRAN_IP_GIO = 3;
const TRAN_HE_NGAY = 200;
const SDT = /^\+?[0-9][0-9 .\-]{7,17}[0-9]$/;
const THU = /^[^\s@<>"]{1,64}@[^\s@<>"]{1,190}\.[A-Za-z]{2,24}$/;

/* Bỏ ký tự điều khiển, giữ xuống dòng cho lời nhắn. */
function sachNhieuDong(s, dai) {
  return String(s || '').replace(/\r\n?/g, '\n').replace(/[\u0000-\u0009\u000B-\u001F\u007F]/g, ' ')
    .replace(/\n{3,}/g, '\n\n').trim().slice(0, dai);
}

export async function guiLienHe(y, env, db, req) {
  /* Ô mồi: người thật không thấy ô "website", máy quét điền tất. Trả "đã
     nhận" để máy quét không biết mình bị chặn ở đâu — và không gửi gì. */
  if (String(y.website || '').trim()) return { ok: true };

  const ten = sachChoThu(y.name, 80);
  const sdt = sachChoThu(y.phone, 24);
  const thu = sachChoThu(y.email, 254);
  const chuDe = Object.prototype.hasOwnProperty.call(CHU_DE, y.topic) ? y.topic : 'khac';
  const loi = sachNhieuDong(y.message, 2000);

  if (!SDT.test(sdt)) return { ok: false, code: 'SDT', error: 'Số điện thoại chưa đúng. Ví dụ: 0912 345 678.' };
  if (thu && !THU.test(thu)) return { ok: false, code: 'THU', error: 'Địa chỉ email chưa đúng — hoặc để trống ô này.' };
  if (loi.length < 2) return { ok: false, code: 'LOI', error: 'Anh/chị viết đôi dòng về điều đang băn khoăn nhé.' };

  const den = String(env.GITA_THU_TRA_LOI || '').split(',')[0].trim();
  if (!den) return { ok: false, code: 'CHUACAUHINH', error: 'Hòm thư chưa sẵn sàng. Anh/chị gọi 08.5555.4688 giúp Học viện nhé.' };

  /* Đếm trên D1 chứ không chỉ trong bộ nhớ: mỗi isolate Worker có bộ đếm
     riêng, nên trần trong bộ nhớ (ve-chi-phi.js) xoay vòng là lách được. */
  const ip = (req && req.headers && req.headers.get('CF-Connecting-IP')) || 'khong-ro';
  const ngay = new Date().toISOString().slice(0, 10);
  if (await Kho.demNhip(db, 'lienHe·ip·' + ip, 3600) > TRAN_IP_GIO)
    return { ok: false, code: 'NHIP', error: 'Anh/chị đã gửi rồi — Học viện sẽ gọi lại. Cần gấp: 08.5555.4688.' };
  if (await Kho.demNhip(db, 'lienHe·he·' + ngay, 86400) > TRAN_HE_NGAY)
    return { ok: false, code: 'NHIP', error: 'Hôm nay hòm thư đang quá tải. Anh/chị gọi 08.5555.4688 giúp Học viện nhé.' };

  const than = 'Có một gia đình vừa gửi yêu cầu tư vấn từ trang Liên hệ.\n\n' +
    'Họ tên: ' + (ten || '(không ghi)') + '\n' +
    'Điện thoại: ' + sdt + '\n' +
    'Email: ' + (thu || '(không ghi)') + '\n' +
    'Quan tâm: ' + CHU_DE[chuDe] + '\n\n' +
    'Lời nhắn:\n' + loi + '\n\n' +
    '— Lời hứa trên trang: phản hồi trong 24 giờ.\n' +
    'Thư này không lưu lại ở máy chủ. Muốn giữ thì giữ ở hòm thư này.';
  try {
    /* bimat: tên + số điện thoại của một gia đình không đi đường hộp thư
       GitHub khi còn đường khác — issue giữ nội dung vĩnh viễn. */
    await guiThu(env, { den, batBuoc: true, bimat: true,
      tieuDe: 'GITA 365 — Yêu cầu tư vấn: ' + CHU_DE[chuDe], than });
  } catch (e) {
    console.error('LIEN_HE_HONG', String(e && e.message || e).slice(0, 200));
    return { ok: false, code: 'GUIHONG', error: 'Chưa gửi được. Anh/chị gọi 08.5555.4688 hoặc viết tới typhuquanggita@gmail.com nhé.' };
  }
  try { await Kho.ghiNhatKy(db, { viec: 'LIEN_HE', doiTuong: 'trang lien-he', chiTiet: 'đã chuyển tới hòm chủ hệ' }); } catch (e) { /* nhật ký hỏng không làm hỏng lượt gửi */ }
  return { ok: true };
}
