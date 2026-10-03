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
       qua một đường chuyên dụng có SPF/DKIM cho tên miền gửi thư
       (đặt ở GITA_THU_GUI_TU trong wrangler.toml).

   ── CHỖ ĐỔI NHÀ CUNG CẤP CHỈ CÓ MỘT ──

   HIỆN NAY (chưa có tên miền riêng): thư tới HÒM CHỦ HỆ đi qua HỘP THƯ
   GITHUB (guiQuaGithub_ — GitHub gửi email thông báo, không giới hạn
   ngày, chỉ dùng GitHub + Cloudflare); thư tới khách đi CẦU NỐI GMAIL
   (guiQuaGmail_) nếu đã cài, ~100 người nhận/ngày; Resend là dự
   phòng/mở rộng khi có tên miền. Thứ tự thử nằm ở duongGuiThu.

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
      from: env.GITA_THU_GUI_TU,
      ...(env.GITA_THU_TRA_LOI ? {reply_to: env.GITA_THU_TRA_LOI} : {}),
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

/* ── CẦU NỐI GMAIL (Google Apps Script) ──
   Dự án không có tên miền riêng, mà Resend chỉ cho gửi từ tên miền đã
   xác minh. Cầu nối là một Apps Script chạy DƯỚI tài khoản Gmail của
   chủ hệ (mã ở may-chu/cau-noi-gmail/Code.gs): Worker POST lá thư kèm
   khoá chung, Google gửi bằng chính hòm Gmail ấy — có chữ ký DKIM của
   Google, nên vào hộp thư đến chứ không vào spam. Hạn mức: khoảng 100
   người nhận/ngày với Gmail thường. */
async function guiQuaGmail_(env, tepThu) {
  const r = await fetch(env.GITA_CAU_NOI_GMAIL, {
    method: 'POST',
    redirect: 'follow',
    headers: {'Content-Type': 'text/plain; charset=utf-8'},
    body: JSON.stringify({
      khoa: env.GITA_KHOA_CAU_NOI,
      den: tepThu.den,
      tieuDe: tepThu.tieuDe,
      than: tepThu.than,
      traLoi: env.GITA_THU_TRA_LOI || ''
    })
  });
  const t = await r.text().catch(() => '');
  let j = null;
  try { j = JSON.parse(t); } catch (e) {}
  if (!r.ok || !j || j.ok !== true)
    throw new Error('Cầu nối Gmail từ chối (' + r.status + '): ' +
      String((j && j.error) || t).slice(0, 200));
  return true;
}

/* ── HỘP THƯ GITHUB (chỉ thư gửi CHỦ HỆ) ──
   Chủ hệ chỉ dùng GitHub + Cloudflare, chưa có tên miền riêng nên
   Cloudflare chưa gửi thư được. Đường này nhờ GitHub gửi thay: Worker
   bắn sự kiện repository_dispatch vào kho RIÊNG TƯ GITA_GH_HOP_THU
   (vd "typhuquanggita-commits/gita365-hop-thu"); workflow trong kho ấy
   mở một issue bằng github-actions[bot] → GitHub gửi email thông báo
   tới hòm thư của tài khoản chủ hệ (typhuquanggita@gmail.com).
   Khoá GITA_GH_KHOA_THU là fine-grained token CHỈ cho kho đó, quyền
   Contents: Read and write. Chỉ dùng khi người nhận là hòm chủ hệ
   (GITA_THU_TRA_LOI / GITA_THU_DOANH_THU / GITA_MAIL_CUU) — không bao giờ gửi tới khách qua đường này. */
export function laHomChuHe(env, den) {
  const d = String(den || '').trim().toLowerCase();
  if (!d) return false;
  return [env.GITA_THU_TRA_LOI, env.GITA_THU_DOANH_THU, env.GITA_MAIL_CUU].join(',').split(',')
    .map(s => s.trim().toLowerCase()).filter(Boolean).includes(d);
}

async function guiQuaGithub_(env, tepThu) {
  const kho = String(env.GITA_GH_HOP_THU || '').trim();
  if (!/^[A-Za-z0-9][\w.-]*\/[A-Za-z0-9][\w.-]*$/.test(kho)) throw new Error('GITA_GH_HOP_THU sai dạng chủ/kho.');
  const r = await fetch('https://api.github.com/repos/' + kho + '/dispatches', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + env.GITA_GH_KHOA_THU,
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'gita365-worker',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      event_type: 'thu',
      client_payload: {
        tieuDe: sachChoThu(tepThu.tieuDe, 200),
        than: String(tepThu.than || '').slice(0, 60000)
      }
    })
  });
  if (r.status !== 204 && !r.ok) {
    const t = await r.text().catch(() => '');
    throw new Error('GitHub từ chối (' + r.status + '): ' + t.slice(0, 200));
  }
  return true;
}

/* Các đường gửi đã cấu hình đủ, theo thứ tự ưu tiên. Có den thì bỏ
   những đường không được phép gửi tới địa chỉ ấy. */
export function duongGuiThu(env, den) {
  const ds = [];
  if (env.GITA_GH_KHOA_THU && env.GITA_GH_HOP_THU && (den === undefined || laHomChuHe(env, den)))
    ds.push({ten: 'github', gui: guiQuaGithub_});
  if (env.GITA_CAU_NOI_GMAIL && env.GITA_KHOA_CAU_NOI) ds.push({ten: 'gmail', gui: guiQuaGmail_});
  if (env.GITA_KHOA_THU && env.GITA_THU_GUI_TU) ds.push({ten: 'resend', gui: guiQuaResend_});
  return ds;
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
  const ds = duongGuiThu(env, den);
  if (!ds.length) {
    if (batBuoc) throw new Error('Máy chủ chưa cấu hình đường gửi thư tới địa chỉ này ' +
      '(hộp thư GitHub GITA_GH_KHOA_THU cho hòm chủ hệ; cầu nối Gmail GITA_CAU_NOI_GMAIL + GITA_KHOA_CAU_NOI, hoặc Resend cho mọi người).');
    return false;
  }
  /* Đường đầu hỏng (hết hạn mức ngày, Google trục trặc…) thì thử đường sau. */
  let loi = null;
  for (const d of ds) {
    try { return await d.gui(env, {den, tieuDe, than}); }
    catch (e) {
      loi = e;
      console.error('THU_HONG', d.ten, den, String(e && e.message || e));
    }
  }
  if (batBuoc) throw loi;
  return false;
}

export const CHAN_THU = '\n\nCần người thật: 08.5555.4688 · typhuquanggita@gmail.com\nHọc viện GITA';

/* Super Admin bấm "gửi thư thử" để biết đường gửi đã thông chưa. Người
   nhận CỐ ĐỊNH là hòm thư chủ hệ (GITA_THU_TRA_LOI) — cửa này không nhận
   địa chỉ từ máy khách, nên không thành chỗ để gửi thư tới người lạ. */
export async function thuGuiThu(y, env, db, hoSo) {
  if (!hoSo || hoSo.role !== 'R01')
    return {ok: false, code: 'CHIR01', error: 'Chỉ Super Admin được gửi thư thử.'};
  const den = String(env.GITA_THU_TRA_LOI || '').split(',')[0].trim();
  if (!den) return {ok: false, error: 'Máy chủ chưa đặt GITA_THU_TRA_LOI (hòm thư chủ hệ).'};
  const duong = duongGuiThu(env, den).map(d => d.ten);
  try {
    await guiThu(env, {den, batBuoc: true,
      tieuDe: 'GITA 365 — thư thử từ máy chủ',
      than: 'Máy chủ GITA 365 đã gửi được thư tới hòm này.\n' +
        'Đường gửi đã cấu hình: ' + (duong.join(', ') || 'không có') + '\n' +
        'Lúc: ' + new Date().toISOString() + CHAN_THU});
  } catch (e) {
    return {ok: false, duong, error: 'Gửi thư thử hỏng: ' + String(e && e.message || e).slice(0, 200)};
  }
  return {ok: true, den, duong};
}
