/* ═══════════════════════════════════════════════════════════════
   GITA 365 · CẦU NỐI GMAIL (Google Apps Script)

   Chạy DƯỚI tài khoản typhuquanggita@gmail.com. Worker POST một lá thư
   kèm khoá chung; script gửi bằng chính hòm Gmail ấy (MailApp). Không
   cần tên miền riêng, thư có chữ ký DKIM của Google.

   CÀI ĐẶT — xem docs/MAY_CHU.md, mục "Gửi thư":
     1. script.google.com → Dự án mới → dán tệp này vào Code.gs.
     2. Cài đặt dự án → Thuộc tính tập lệnh → thêm KHOA = <chuỗi ngẫu
        nhiên dài, ví dụ 64 ký tự hex>. KHÔNG dán khoá vào mã.
     3. Chọn hàm thuGui → Chạy → cấp quyền gửi thư. Hòm thư sẽ nhận
        một lá "thử cầu nối".
     4. Triển khai → Tùy chọn triển khai mới → Ứng dụng web:
          Thực thi với tư cách: Tôi
          Người có quyền truy cập: Bất kỳ ai
        Chép URL dạng https://script.google.com/macros/s/.../exec
     5. Nạp vào Worker (trong may-chu/):
          npx wrangler secret put GITA_CAU_NOI_GMAIL   # dán URL
          npx wrangler secret put GITA_KHOA_CAU_NOI    # dán đúng KHOA

   "Bất kỳ ai" là bắt buộc để Worker gọi được, nên KHOA là thứ duy nhất
   giữ cửa: lộ khoá thì đổi KHOA ở đây và nạp lại secret ở Worker.
   ═══════════════════════════════════════════════════════════════ */

var DAI_TIEU_DE = 200;
var DAI_THAN = 20000;
var MAU_EMAIL = /^[^\s@,;<>"]+@[^\s@,;<>"]+\.[^\s@,;<>"]+$/;

function doPost(e) {
  try {
    var khoa = PropertiesService.getScriptProperties().getProperty('KHOA');
    if (!khoa || khoa.length < 32) return tra_({ok: false, error: 'Cầu nối chưa đặt KHOA (≥ 32 ký tự).'});

    var y = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    if (!bangNhau_(String(y.khoa || ''), khoa)) return tra_({ok: false, error: 'Sai khoá.'});

    var den = String(y.den || '').trim();
    if (!MAU_EMAIL.test(den)) return tra_({ok: false, error: 'Địa chỉ nhận không hợp lệ.'});
    var tieuDe = String(y.tieuDe || '').replace(/[\r\n]+/g, ' ').slice(0, DAI_TIEU_DE);
    var than = String(y.than || '').slice(0, DAI_THAN);
    if (!tieuDe || !than) return tra_({ok: false, error: 'Thiếu tiêu đề hoặc nội dung.'});

    if (MailApp.getRemainingDailyQuota() < 1)
      return tra_({ok: false, error: 'Hết hạn mức gửi thư trong ngày của Gmail.'});

    var thu = {to: den, subject: tieuDe, body: than, name: 'GITA 365'};
    var traLoi = String(y.traLoi || '').trim();
    if (MAU_EMAIL.test(traLoi)) thu.replyTo = traLoi;
    MailApp.sendEmail(thu);

    return tra_({ok: true, conLai: MailApp.getRemainingDailyQuota()});
  } catch (err) {
    return tra_({ok: false, error: String(err && err.message || err).slice(0, 200)});
  }
}

function doGet() {
  return tra_({ok: true, ten: 'GITA 365 — cầu nối Gmail'});
}

/* Chạy tay một lần trong trình soạn thảo để cấp quyền và thử gửi. */
function thuGui() {
  var toi = Session.getEffectiveUser().getEmail();
  MailApp.sendEmail(toi, 'GITA 365 — thử cầu nối Gmail',
    'Cầu nối đã gửi được thư. Hạn mức còn lại hôm nay: ' + MailApp.getRemainingDailyQuota());
}

/* So sánh không dừng sớm, để thời gian trả lời không lộ khoá đúng tới đâu. */
function bangNhau_(a, b) {
  if (a.length !== b.length) return false;
  var d = 0;
  for (var i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

function tra_(o) {
  return ContentService.createTextOutput(JSON.stringify(o))
    .setMimeType(ContentService.MimeType.JSON);
}
