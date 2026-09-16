# Bản web của riêng Học viện, phục vụ thẳng từ Apps Script

Không thuê hosting, không mua tên miền, không đưa gì lên kho mã công khai.
Địa chỉ `/exec` vừa là máy chủ vừa là trang web.

---

## Hai cách có bản web — chọn cách nào

| | Apps Script phục vụ | Trang tĩnh (GitHub Pages / gita.edu.vn) |
|---|---|---|
| Dựng mất bao lâu | 10 phút, làm tiếp từ dự án đã có | Phải bật Pages, trỏ tên miền |
| Địa chỉ | `script.google.com/macros/s/…/exec` — dài, khó đọc | `gita.edu.vn` — đẹp, dễ nhớ |
| Ai thấy được | Ai có đường dẫn | Ai cũng thấy, Google tìm ra |
| Tệp nằm ở đâu | Drive của Học viện | Kho mã công khai |
| Tốc độ mở lần đầu | Chậm hơn — kho đi qua máy chủ | Nhanh hơn — tệp tĩnh |
| Cài như ứng dụng điện thoại | Không | Có |

**Chọn Apps Script khi** muốn một bản dùng nội bộ, chưa muốn ai ngoài biết,
và không muốn dựng thêm chỗ nào nữa.

**Chọn trang tĩnh khi** đã sẵn sàng mở cho khách hàng thật và cần địa chỉ đẹp.

Hai cách chạy song song được. Cùng một máy chủ, cùng một bộ khoá.

---

## Cần bốn thứ trong Drive

Trong thư mục **Mã máy chủ GITA365** (hoặc một thư mục riêng anh tự chọn):

| Tệp | Là gì | Nặng |
|---|---|---|
| `GITA365.html` | Vỏ ứng dụng — toàn bộ giao diện gói trong một tệp | 1,2 MB |
| `nen.enc` … `tang5.enc` | Bảy gói kho, đã mã hoá AES-256-GCM | 10 MB |
| `mau.json` | Dữ liệu mẫu cho tài khoản chưa được cấp phép | 0,2 MB |

Bảy gói `.enc` đặt ở đâu cũng được: không có khoá thì chúng là một đống byte
vô nghĩa. Khoá vẫn do `doPost` cấp sau khi đăng nhập, theo đúng vai và tầng.
Đây là lý do bản web đặt trên Drive vẫn an toàn.

---

## Năm bước

### 1. Lấy tệp

Vào kho mã của Học viện → nút xanh **Code** → **Download ZIP** → giải nén.

Cần lấy: `GITA365.html` ở thư mục gốc, và cả thư mục `kho/` (bảy tệp `.enc`
cùng `mau.json`).

> `GITA365.html` được dựng lại mỗi lần phát hành. Muốn dựng tay thì chạy
> `python3 tools/dong-goi.py`.

### 2. Kéo vào Drive

Mở thư mục [Mã máy chủ GITA365](https://drive.google.com/drive/u/0/folders/1jVOnIH7286glI95fC4aqfXApecxEj7Xz)
→ kéo thả chín tệp vào. Để phẳng, không tạo thư mục con.

### 3. Thêm tệp mã bản web

Dự án Apps Script đã có sẵn phần này nếu anh dán bản gộp `GITA365_TATCA.gs`
mới nhất. Kiểm bằng cách chọn hàm `mucLucHam` → Run, phải thấy dòng
`kiemTraQuyenDrive`.

Muốn để bản web ở một thư mục khác thư mục mã, sửa dòng này:

```js
var GITA_THU_MUC_WEB = '';        // để trống thì dùng chung thư mục mã
```

### 4. Triển khai lại

Mã đã đổi thì bản đang chạy chưa biết. **Deploy** → **Manage deployments**
→ bút chì → **Version: New version** → **Deploy**.

> Đây là bước hay quên nhất. Sửa mã mà không tạo version mới thì địa chỉ
> `/exec` vẫn phục vụ bản cũ, và anh sẽ ngồi tìm lỗi ở chỗ không có lỗi.

### 5. Mở địa chỉ /exec

Dán địa chỉ `/exec` vào trình duyệt. Ra thẳng bản web GITA 365.

Chưa đủ tệp thì nó **không** để trắng màn hình — nó liệt kê tệp nào đã có,
tệp nào còn thiếu.

---

## Ba đường trên cùng một địa chỉ

| Đường | Trả về |
|---|---|
| `/exec` | Bản web |
| `/exec?viec=trangthai` | JSON tình trạng máy chủ — dùng để kiểm nhanh |
| `/exec?goi=nghe` | Một gói kho, dạng base64 — trang tự gọi, anh không cần gọi tay |

Tham số `goi` chỉ nhận đúng bảy tên gói cộng `mau`. Tên khác bị từ chối, nên
không ai dùng đường này đọc tệp khác trong Drive.

---

## Đăng nhập lần đầu

Trang tự biết địa chỉ máy chủ — không phải vào **Nối máy chủ** dán gì cả.
Địa chỉ được tiêm vào lúc trả trang.

Đăng nhập `Admin@gita365` bằng mật khẩu tạm. Kho chưa mở, và trang nói rõ vì
sao: còn dùng mật khẩu tạm. Đổi mật khẩu → đăng xuất → đăng nhập lại.

---

## Những chỗ bản này khác bản tĩnh

Nói trước để không ai mất buổi chiều đi tìm:

- **Không cài được như ứng dụng điện thoại.** Apps Script phục vụ trang trong
  một khung sandbox, nên không có màn hình "Thêm vào màn hình chính".
  Bản cài trên máy tính Windows vẫn dùng bình thường.
- **Lần mở đầu chậm hơn.** Bảy gói kho đi qua máy chủ chứ không nằm cạnh
  trang. Gói `nghe.enc` nặng 2,8 MB. Vào rồi thì chạy y hệt.
- **Địa chỉ dài và xấu.** Đó là cái giá của việc không mua tên miền.
- **Chia sẻ đường dẫn là chia sẻ trang.** Trang mở ra cho ai có đường dẫn,
  nhưng nội dung vẫn khoá sau đăng nhập. Ai không có tài khoản thì chỉ thấy
  màn đăng nhập.

---

## Khi có trục trặc

| Hiện tượng | Nguyên nhân |
|---|---|
| Ra trang "chưa đặt bản web" | Thiếu tệp — trang liệt kê sẵn tệp nào thiếu |
| Ra JSON thay vì trang web | Đang dùng bản mã cũ, chưa có `GITA_BanWeb`. Dán lại bản gộp mới nhất rồi Deploy New version |
| Trang hiện nhưng kho rỗng | Chưa chạy `napBoKhoaMotLan`, hoặc còn dùng mật khẩu tạm |
| Sửa mã xong không thấy đổi | Chưa Deploy New version |
| Báo "Chưa đặt tang3.enc" | Thiếu đúng tệp đó trong thư mục Drive |
| Trang trắng, không báo gì | Xem Executions trong Apps Script để đọc lỗi thật |

---

## Đã thử trước những gì

Đường phục vụ này khác hẳn bản tĩnh ở ba chỗ — vỏ đọc từ Drive, địa chỉ tiêm
lúc trả trang, kho xin qua máy chủ — nên nó được thử riêng bằng trình duyệt
thật, không suy ra từ bản tĩnh:

```
node tools/thu-ban-web.js
```

Dựng một máy chủ bắt chước đúng cách `GITA_BanWeb.gs` làm, mở bản web bằng
Chromium, đăng nhập, rồi đếm. Lần chạy gần nhất:

- bảy gói kho mở đủ qua đường máy chủ
- 1.000 kịch bản · 220 phác đồ · 42 mô thức · 250 tình huống · 10 tài liệu Drive
- 104 màn hình dựng được, không lỗi trang nào
- tên gói bịa đặt bị từ chối

Cộng với 95 điểm trong `tools/thu-may-chu.js`, trong đó có phần định tuyến
`doGet`: trang hướng dẫn khi thiếu tệp, base64 giải ngược đúng byte gốc, và
bốn tên gói bịa đặt đều bị chặn.

Cần người thật: **08.5555.4688**
