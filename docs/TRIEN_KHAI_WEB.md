# GITA 365 — ĐƯA BẢN WEB LÊN MẠNG

Bản web và bản máy tính dùng chung một mã nguồn. Khác nhau đúng một chỗ:
bản máy tính lấy khoá từ **tệp giấy phép** trong máy, bản web lấy khoá từ
**máy chủ cấp phép** sau khi đăng nhập.

Chưa nối máy chủ cấp phép thì bản web vẫn chạy — nhưng ở **chế độ mẫu**:
xem được khung, hành trình, la bàn văn hoá, một bài test rút gọn; kho
chuyên môn vẫn khoá. Đó là trạng thái đúng, không phải lỗi.

---

## Bốn bước, khoảng 40 phút, 0đ hosting

### Bước 0 — Chuyển kho mã sang riêng tư (làm trước tiên)

`Settings → Danger Zone → Change repository visibility → Make private`

Kho mã đang công khai thì bất cứ ai cũng tải được `kho/*.enc`. Tệp đó đã
mã hoá nên không đọc được, nhưng không có lý do gì để đưa tài sản ra chỗ
mở. Làm bước này trước, các bước sau vẫn chạy bình thường.

### Bước 1 — Đưa mã lên Cloudflare Pages

```
dash.cloudflare.com → Workers & Pages → Create → Pages → Connect to Git
  Kho             : typhuquanggita-commits/Quang-GITA
  Nhánh           : claude/gita-365-ui-design-xew4bz
  Build command   : (để trống — hệ này không có bước dựng)
  Output directory: /
→ Deploy
```

Xong là có `https://<tên>.pages.dev`. Băng thông không giới hạn, HTTPS sẵn,
gzip và brotli tự bật. **0đ.**

Thêm tên miền riêng ở `Custom domains` — Cloudflare cấp SSL miễn phí.

> Phải là HTTPS thì service worker mới chạy, và app mới cài được vào máy
> như một ứng dụng thật.

### Bước 2 — Dựng máy chủ cấp phép trên Apps Script

Máy chủ này chỉ làm một việc: sau khi tài khoản đăng nhập hợp lệ, trả về
**đúng** những khoá mà vai và tầng của tài khoản đó được cấp — không hơn
một khoá nào.

**Hai hàm nối vào hệ thống cũ đã được viết thật, không còn là chỗ trống.**
`kiemTraPhien_` gọi `readSession_` trong `02_Security.gs`, đối chiếu
`Store.find('users', …)` để biết tài khoản còn hoạt động, và
`Store.find('students', …)` để biết con đang học tầng nào.
`ghiNhatKy_` gọi thẳng `audit_`. Không phải sửa gì thêm.

```
1. Mở dự án Apps Script của GITA 365 (cùng chỗ 00_Config.gs).
2. Thêm tệp mới, dán toàn bộ server/GITA_CapPhep.gs vào. Lưu.
3. Nạp bộ khoá MỘT LẦN:
     - chạy: node tools/tao-nap-khoa.js
     - dán giay-phep/GITA_NapKhoa.gs vào dự án Apps Script
     - chọn hàm napBoKhoaMotLan, bấm Run, cấp quyền khi Google hỏi
     - log phải báo "Đã nạp 7 khoá"
     - XOÁ TỆP GITA_NapKhoa.gs khỏi dự án ngay
   Khoá nay nằm trong Script Properties, không nằm trong mã nguồn.
4. Deploy → New deployment → Web app
     Execute as     : Me
     Who has access : Anyone
   Chép URL kết thúc bằng /exec.
5. Mở URL đó bằng trình duyệt. Phải thấy:
     {"ok":true,"ten":"GITA 365 — máy chủ cấp phép","daNapKhoa":7,...}
   Thấy daNapKhoa:0 là chưa chạy bước 3.
```

**Thử trước khi dán, không cần mạng:**

```bash
node tools/thu-may-chu-cap-phep.js <đường/dẫn/src-v69>
```

Chạy chính `server/GITA_CapPhep.gs` với `ROLES` thật của v6.9 và kiểm:
token bịa không cấp khoá, không mượn được token người khác, tài khoản đã
nghỉ hoặc hồ sơ bị khoá thì không cấp, mỗi vai chỉ nhận đúng gói của mình,
phụ huynh không lấy được tầng con chưa học, quá 12 lượt xin trong một giờ
thì bị chặn, và `doGet` không lộ khoá nào.

### Bước 3 — Nối hai đầu lại

Sửa đúng một dòng trong `cau-hinh.js` ở gốc kho mã:

```js
G.API_CAP_PHEP = 'https://script.google.com/macros/s/…/exec';
```

Đẩy lên. Cloudflare Pages tự dựng lại trong khoảng một phút. Đăng nhập lại
là kho mở đúng phạm vi của vai.

---

## Kiểm lại sau khi triển khai

| Kiểm | Đạt khi |
|---|---|
| Mở trang, chưa đăng nhập | Thấy cổng vào, không thấy nội dung chuyên môn nào |
| Đăng nhập vai phụ huynh | Mở được tầng đang học, **không** mở được kho nghề |
| Đăng nhập vai coach | Mở được kho nghề và cả năm tầng |
| Đăng nhập vai cộng tác viên | Chỉ mở phần nền |
| Đổi vai | Kho của vai cũ biến mất sạch trước khi nạp vai mới |
| Ngắt mạng rồi mở lại | Giao diện vẫn chạy; kho khoá lại cho tới khi có mạng |
| Bấm cài đặt trên trình duyệt | App vào máy như ứng dụng thật |

Chạy bộ kiểm tự động trước mỗi lần đẩy:

```bash
npx http-server -p 8099 -s .
node tools/kiem-tra.js
```

---

## Chi phí thật của cách này

| Khoản | Nhà cung cấp | Tháng |
|---|---|---|
| Hosting + CDN toàn cầu | Cloudflare Pages | 0đ |
| Máy chủ cấp phép, dữ liệu, tài chính | Google Apps Script + Sheets | 0đ |
| Lưu tệp gia đình gửi lên | Google Drive | 0đ |
| Tên miền .com | ~300.000đ/năm | 25.000đ |
| Trợ lý đối thoại (có trần cứng) | API mô hình ngôn ngữ | 150.000đ |
| Giám sát, dự phòng | | 100.000đ |
| **Tổng** | | **275.000đ** |

Còn dư 225.000đ so với trần 500.000đ. Chi tiết và các chốt chặn không cho
vượt chi: `docs/CHI_PHI.md`.

Lý do giữ được mức này: **việc nặng chạy trong máy người dùng.** Giao diện
dựng trong máy, kho nằm trong máy sau lần tải đầu, tra cứu chạy trong máy.
Máy chủ chỉ làm ba việc — xác thực, cấp khoá, ghi nhật ký — và cả ba đều
nhẹ tới mức gói miễn phí thừa sức gánh.

---

## Bản máy tính — không cần mạng, không tốn đồng nào

Bản Windows chạy hoàn toàn ngoại tuyến: kho nằm sẵn trong bộ cài, khoá lấy
từ tệp giấy phép. Đây là bản chính để làm việc hằng ngày; bản web là cửa
ngõ cho khách mới và là nơi đồng bộ.

```
1. Tải GITA365-<phiên bản>-win-x64.exe ở mục Releases.
2. Cài, mở app.
3. Trợ giúp → Nạp giấy phép → chọn tệp giay-phep-*.json được cấp riêng.
4. App mở lại, kho mở đúng phạm vi ghi trong giấy phép.
```

Cấp giấy phép cho một người mới:

```bash
node tools/tao-giay-phep.js "Coach Minh" 12 nen nghe tang1 tang2
```

Mỗi tệp giấy phép mang số hiệu và dấu truy nguồn riêng — bản nào rò rỉ ra
ngoài là biết ngay của ai. `giay-phep/` nằm ngoài kho mã.

---

## Còn ba việc chỉ anh Quang làm được

Ba việc này không phải lỗi lập trình; chúng cần quyết định của chủ hệ thống.

1. **Chuyển kho mã sang riêng tư** (Bước 0 ở trên). Đây là việc duy nhất
   phải bấm tay trên giao diện GitHub — không có API nào làm thay được.
2. **Điền pháp nhân vào `LICENSE` và `NOTICE`**: tên đầy đủ Học viện GITA,
   mã số thuế, địa chỉ. Bản quyền chỉ đòi được khi có pháp nhân đứng tên.
3. **Chốt ngưỡng chuyển tuyến chuyên môn y tế — tâm lý.** Bộ test đã ghi rõ
   nó không thay thế đánh giá chuyên môn; cần một ngưỡng bằng số để hệ
   thống tự nhắc tư vấn dừng lại và chuyển tuyến.
