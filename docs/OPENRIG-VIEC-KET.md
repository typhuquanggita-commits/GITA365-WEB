# Học từ OpenRig: mạch tự soát việc kẹt

Ngày 9/10/2026. Theo yêu cầu chủ hệ: soát [OpenRig](https://github.com/mvschwarz/openrig)
(Apache-2.0) để hoàn thiện GITA365, tăng nội lực, giảm phụ thuộc bên ngoài, tự
động hoá tối đa.

## OpenRig là gì, và vì sao không cài nó vào GITA

OpenRig chạy cả một đội AI viết mã (Claude Code, Codex) trên máy tính của lập
trình viên: cần Node.js 22, tmux, một tiến trình chạy nền, và tài khoản của các
hãng AI. Nó là công cụ cho người viết phần mềm, không phải cho một học viện vận
hành gia đình. Cài nó vào GITA là thêm một phụ thuộc bên ngoài — ngược đúng điều
chủ hệ yêu cầu. Nên ở đây không chép mã, chỉ lấy ý tưởng nền.

## Ý tưởng lấy về: kẹt khác chờ, và "không biết" là câu trả lời thật

| OpenRig | GITA (`may-chu/viec-ket.js`) |
|---|---|
| PARKED — gậy tiếp sức bị đánh rơi: việc dừng mà không ai cầm, không ai hẹn | **Kẹt**: không ai cầm, quá hạn, hoặc nằm im quá ngưỡng |
| HELD — dừng có chủ ý: có người cầm và có hẹn đánh thức | **Chờ có chủ**: có người cầm và hạn còn sống — chờ đúng, không phải kẹt |
| `unknown` là giá trị hạng nhất | Hàng không đọc được thì **"không biết"**, không ghi 0; bảng chưa dựng thì **"chưa dùng"** |
| Chẩn đoán tính lúc đọc, không lưu | Không có cột "kẹt" nào; mỗi lần đọc tính lại từ dữ liệu thật |
| Hệ chẩn đoán không tự sửa | Mạch **chỉ đọc**; bộ não vận hành chỉ ghi một dòng vào hộp thông báo mỗi ngày |

Mười sáu hàng đợi được canh: phiếu thu chờ xác nhận · khoản chi · hoàn tiền ·
miễn giảm · tin tài chính · bản nháp chờ ba chữ ký · phát sinh chưa ai soạn · đề
án tài liệu · yêu cầu xoá dữ liệu (hạn luật 30 ngày) · khách mới chưa có Tư vấn ·
hẹn CRM quá hạn · đề xuất nâng cấp chưa ký · thông báo cần xem chưa đọc · việc
quay phim chờ máy · tiền giữ cho cảnh phim trả phí · dự án phim dừng vì cầu dao.

Super Admin, Admin và Giám đốc xem ở **Trung tâm đo lường → khối "Việc kẹt"**:
mỗi hàng có số việc kẹt, chờ, đang chạy; mở ra thấy từng việc, vì sao kẹt, và nút
**Mở màn xử lý**.

## Giảm phụ thuộc bên ngoài: mỗi nguồn ngoài khai "khi hỏng"

`may-chu/nguon-ngoai.js` nay buộc mỗi nguồn ngoài khai nó sập thì hệ còn gì, và
bộ kiểm đòi đường lùi phải **có thật trong mã**:

- 13/15 nguồn ngoài sập không làm dừng tính năng nào: có đường lùi (leo sang nhà
  cung cấp AI khác, gửi thư qua đường khác), hoặc bỏ qua được, hoặc đã chép về kho
  của hệ.
- 2/15 làm dừng một tính năng phụ: phim trả phí qua fal (đang khoá sẵn) và cửa vẽ
  ảnh ra ngoài của Kiến trúc sư thị giác.
- Không nguồn ngoài nào làm sập việc lõi: đăng nhập, sổ tài chính, CRM, hộp thông
  báo, ba chữ ký đều chạy trong Cloudflare của Học viện.

Nói thẳng: đường lùi **có trong mã**, còn có chạy thật hay không thì tuỳ đã nạp
khoá cho đường thứ hai hay chưa (ví dụ thư: GitHub · Gmail · Resend — nạp ít nhất
hai đường thì một đường sập vẫn còn đường kia).

## Về "tự động hoá 95%"

Hệ tự động hoá phần **vận hành**: phát hiện, đếm, giao Tư vấn cho khách mới, đưa
nhà đèn đỏ lên đầu, nhắc, soạn nháp, soát việc kẹt, báo cáo. Phần **quyết định**
giữ ở người theo luật của chủ hệ: tiền ra (thang chữ ký), nội dung tới gia đình
(ba chữ ký), cấp quyền (chỉ Super Admin), pháp lý. Máy không tự quyết những việc
ấy, vì một cỗ máy tự gỡ việc kẹt bằng cách tự duyệt là đúng cái hệ này cấm.

Không có con số "95%" nào được đo; dựng một con số như thế là dựng một lời khai
mang dấu phép đo. Thứ đo được là: hôm nay bao nhiêu việc đang kẹt, ở đâu, vì sao.

## Những ý tưởng khác của OpenRig chưa lấy, và vì sao

- **Lý do đóng việc bắt buộc** (handed_off_to · blocked_on · denied · canceled ·
  escalation…): hay, nhưng phải sửa cửa đóng của từng hàng đợi — làm riêng từng
  hàng, có phép thử riêng.
- **Thang tin cậy của tri thức** (dữ liệu → ghi chép → nhận định → chuẩn mực):
  kho giải pháp đã có hạn soát lại 90 ngày; thêm thang là việc sau.
- **Nút xoay mức kỹ của kế hoạch** (P0–P4): gần với ba vùng Xanh/Vàng/Đỏ đã có.
