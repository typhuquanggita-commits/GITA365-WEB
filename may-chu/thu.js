/* ═══════════════════════════════════════════════════════════════
   GITA 365 · CỬA VÀO MỚI — GỬI THƯ

   ── VÌ SAO PHẢI THAY CÁCH GỬI ──

   Nền cũ gửi bằng MailApp của Apps Script, tức là gửi qua chính hòm
   thư Google của Học viện. Cách ấy không đi cùng mức chủ hệ đặt:

     · Gmail thường cho 100 thư/ngày, Workspace cho 1.500–2.000.
       Ở 100.000 tài khoản, riêng mã xác nhận đăng ký và mã lấy lại mật
       khẩu đã vượt con số ấy trong một ngày bình thường.
     · Hết hạn ngày là hết SẠCH: mã OTP của khách hàng thật ngừng gửi
       cho tới nửa đêm, và không có gì báo trước.
     · Thư gửi từ hòm thư người dùng dễ rơi vào mục spam hơn thư gửi
       qua một đường chuyên dụng có SPF/DKIM cho tên miền gita.edu.vn.

   ── CHỖ ĐỔI NHÀ CUNG CẤP CHỈ CÓ MỘT ──

   Hàm guiQuaResend_ ở dưới là toàn bộ phần dính tới nhà cung cấp. Đổi
   sang Mailgun, SendGrid hay Amazon SES là viết một hàm cùng chữ ký và
   đổi một dòng trong guiThu. Mọi chỗ gọi thư ở nơi khác không biết và
   không cần biết thư đi bằng đường nào.

   Chọn Resend làm mặc định vì nó là một lượt POST, không SDK, chạy
   thẳng trong Worker. Mức miễn phí 3.000 thư/tháng; ở 100.000 tài
   khoản thì cỡ vài trăm nghìn đồng một tháng. CHỦ HỆ QUYẾT — con số
   ấy nên được nhìn trước khi triển khai, không phải sau.

   ── HAI LUẬT KHÔNG ĐƯỢC PHÁ ──

   1. CHỮ CỦA NGƯỜI DÙNG KHÔNG BAO GIỜ ĐI THẲNG VÀO THƯ.
      Họ tên do người đăng ký tự gõ, và nó nằm trong thân thư mang tên
      Học viện GITA. Để nguyên thì đó là chỗ nhét nội dung tuỳ ý vào
      một lá thư người nhận tin tưởng. Cắt ngắn, bỏ ký tự xuống dòng.

   2. GỬI THƯ HỎNG KHÔNG ĐƯỢC LÀM HỎNG VIỆC CHÍNH.
      Trừ đúng những lá thư mà việc chính KHÔNG có nghĩa nếu thiếu —
      mã OTP, đường dẫn kích hoạt. Người gọi tự chọn, xem tham số buoc.
   ═══════════════════════════════════════════════════════════════ */

/** Cắt chữ người dùng gõ trước khi ghép vào thư. Xem luật 1. */
export function sachChoThu(s, dai) {
  return String(s || '').replace(/[\r\n\t]+/g, ' ').trim().slice(0, dai || 60);
}

async function guiQuaResend_(env, tepThu) {
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + env.GITA_KHOA_THU,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: env.GITA_THU_GUI_TU || 'GITA 365 <khonggui@gita.edu.vn>',
      to: [tepThu.den],
      subject: tepThu.tieuDe,
      text: tepThu.than
    })
  });
  if (!r.ok) {
    const t = await r.text().catch(() => '');
    throw new Error('Nhà gửi thư từ chối (' + r.status + '): ' + t.slice(0, 200));
  }
  return true;
}

/**
 * den     — địa chỉ nhận
 * tieuDe  — tiêu đề
 * than    — thân thư, chữ thường, không HTML
 * batBuoc — true thì gửi hỏng là NÉM RA, để việc chính dừng lại và
 *           người dùng biết. Dùng cho mã OTP và đường dẫn kích hoạt:
 *           báo "đã gửi mã" trong khi thư không đi là để người ta ngồi
 *           đợi một thứ không bao giờ tới.
 */
export async function guiThu(env, {den, tieuDe, than, batBuoc}) {
  /* Không có khoá gửi thư thì KHÔNG im lặng coi như đã gửi. Ở máy phát
     triển và trong bộ thử, env.GHI_THU nhận lá thư để soi được nội dung
     mà không gửi đi thật. */
  if (env.GHI_THU) { env.GHI_THU.push({den, tieuDe, than}); return true; }
  if (!env.GITA_KHOA_THU) {
    if (batBuoc) throw new Error('Máy chủ chưa được nạp khoá gửi thư.');
    return false;
  }
  try {
    return await guiQuaResend_(env, {den, tieuDe, than});
  } catch (e) {
    if (batBuoc) throw e;
    /* Thư phụ hỏng thì ghi lại và đi tiếp — không kéo đổ việc chính. */
    console.error('THU_HONG', den, String(e && e.message || e));
    return false;
  }
}

export const CHAN_THU = '\n\nCần người thật: 08.5555.4688\nHọc viện GITA';
