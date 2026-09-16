# Dựng máy chủ GITA 365 trên script.google.com

Làm một lần, khoảng hai mươi phút. Sau đó ứng dụng thôi chạy chế độ mẫu.

---

## Máy chủ này là cái gì

Một dự án **Google Apps Script** chạy trên tài khoản Google của Học viện.
Không thuê máy, không phí hàng tháng, dữ liệu nằm trong Drive của chính GITA.

Nó làm đúng bốn việc:

| Việc | Nghĩa là gì |
|---|---|
| Cấp khoá mở kho | Sau khi đăng nhập, trả đúng những gói mà vai và tầng của tài khoản được cấp phép. Khoá sống 12 giờ, mỗi tài khoản xin tối đa 12 lần một giờ. |
| Giữ sổ tài khoản | Đăng ký, gửi OTP qua email, kích hoạt, đổi và lấy lại mật khẩu, nâng tầng. |
| Nhận tài liệu | Tài liệu và ảnh từ mọi vị trí, minh chứng nhiệm vụ của gia đình. Không nhận tệp chạy được. |
| Đồng bộ | Bố cục thư mục, chữ hiển thị, phân quyền, hồ sơ ca xử lý — để bản web và bản cài trên máy tính giống nhau. |

Mọi thứ khác chạy trong máy người dùng. Trợ lý không gọi ra mạng, không tốn phí API.

---

## Bảy tệp mã

Dán vào dự án theo đúng tên này. Thứ tự không quan trọng, Apps Script nạp hết.

| Tệp | Việc |
|---|---|
| `GITA_Nen.gs` | Lớp nền: bảng dữ liệu, phiên, băm mật khẩu, nhật ký, đăng nhập |
| `GITA_CapPhep.gs` | `doPost` — cửa vào duy nhất — và việc cấp khoá |
| `GITA_DangKy.gs` | Đăng ký, OTP, kích hoạt, nâng tầng |
| `GITA_MatKhau.gs` | Đổi mật khẩu, quên mật khẩu, đặt lại bằng mã |
| `GITA_TaiLieu.gs` | Nhận tài liệu và minh chứng, kiểm duyệt |
| `GITA_DongBo.gs` | Đồng bộ hồ sơ và cài đặt |
| `GITA_XuatSheet.gs` | Đẩy Google Sheet về Drive |

Và một tệp thứ tám dùng xong thì xoá: `GITA_NapKhoa.gs` — mang bộ khoá thật.

---

## Bảng hàm chạy tay trong Apps Script

Bảy hàm này chọn ở thanh trên rồi bấm Run. Mọi việc khác đi qua `doPost` —
ứng dụng gọi, không chạy tay ở đây.

| Hàm | Khi nào chạy |
|---|---|
| `caiDatLanDau` | **Một lần**, ngay sau khi dán mã. Dựng sổ dữ liệu, tạo Super Admin, kiểm quyền Drive. |
| `napBoKhoaMotLan` | **Một lần**, sau khi dán tệp bộ khoá. Chạy xong thì xoá tệp ấy đi. |
| `kiemTraQuyenDrive` | Bất cứ lúc nào. Thử thật quyền vào bốn thư mục. Không đụng dữ liệu. |
| `datLaiMatKhauSuperAdmin` | Khi lỡ mất mật khẩu tạm của `Admin@gita365`. |
| `dungSoDuLieu` | Khi nghi thiếu bảng. `caiDatLanDau` đã gọi sẵn. |
| `taoTaiKhoanKhoiDau` | Tạo riêng Super Admin. `caiDatLanDau` đã gọi sẵn. |
| `mucLucHam` | Quên tên hàm nào thì chạy cái này. |

## Bảng việc ứng dụng gọi qua doPost

`doPost` là cửa vào duy nhất. Mọi yêu cầu đều là một `POST` mang `fn`.

**Không cần phiên đăng nhập** — vì chúng xảy ra trước khi có phiên:

| `fn` | Việc | Chốt chặn |
|---|---|---|
| `dangNhap` | Đăng nhập, cấp phiên 12 giờ | Sai tài khoản và sai mật khẩu trả lời y hệt nhau |
| `dangXuat` | Đóng phiên | — |
| `dangKy` | Nhận thông tin đăng ký, gửi OTP | Email đã có tài khoản: trả lời y hệt, không lộ danh sách khách |
| `guiLaiOtp` | Xin mã mới | — |
| `xacThucOtp` | Kiểm mã, gửi link kích hoạt | Mã lưu dạng băm · sống 15 phút · sai 5 lần là huỷ |
| `kichHoat` | Đặt mật khẩu, sinh mã khách hàng | Link sống 24 giờ, dùng một lần |
| `quenMatKhau` | Gửi mã đặt lại | — |
| `datLaiMatKhau` | Đặt lại bằng mã | — |
| `kiemBanMoi` | Bản cài trên máy hỏi có bản mới chưa | — |

**Cần phiên hợp lệ:**

| `fn` | Việc | Ai gọi được |
|---|---|---|
| `capKhoa` | Cấp khoá mở kho | Mọi vai — nhưng chỉ nhận gói đúng phạm vi của mình |
| `doiMatKhau` | Đổi mật khẩu | Chính chủ |
| `dongBo` | Đồng bộ hồ sơ và cài đặt | Mọi vai; ghi cài đặt hệ thống thì R01–R02 |
| `napTaiLieu` | Gửi tài liệu, ảnh, minh chứng | Mọi vai · 30 tệp/ngày · 25 MB/tệp · không nhận tệp chạy được |
| `duyetTaiLieu` | Kiểm duyệt tài liệu | R01–R02 |
| `xuatSheet` | Đẩy Google Sheet về Drive | R01–R04 · 20 lượt/ngày |
| `nangTang` | Nâng tầng gia đình | R01–R03 · cần KPI ≥ 80% **và** xác nhận thanh toán |
| `kiemDrive` | Xác nhận quyền vào Drive | R01–R02 |

## Xác nhận quyền vào Drive

Máy chủ đụng vào **bốn thư mục**, không thư mục nào ngoài bốn cái này:

| Thư mục | Mã | Máy chủ làm gì ở đó |
|---|---|---|
| Dữ Liệu GITA365 | `1pvXH45JvXXPOW9V6ObB5CR87r7gxH0fU` | Sổ dữ liệu: tài khoản, học viên, phiên, nhật ký, thanh toán |
| Nhận tài liệu | *(cùng thư mục trên)* | Tài liệu và ảnh gửi lên, minh chứng nhiệm vụ |
| Xuất bảng tính | *(cùng thư mục trên)* | Google Sheet cấp quản lý xuất ra |
| [Mã máy chủ GITA365](https://drive.google.com/drive/u/0/folders/1jVOnIH7286glI95fC4aqfXApecxEj7Xz) | `1jVOnIH7286glI95fC4aqfXApecxEj7Xz` | Mã nguồn và hướng dẫn dựng máy chủ |

Ba vai đầu hiện cùng trỏ vào một thư mục. Tách ra lúc nào cũng được — sửa
`GITA_THU_MUC_TAILIEU` và `GITA_THU_MUC_XUAT`, không phải triển khai lại.

**Kiểm bằng cách nào.** Bấm Allow trên màn xin quyền của Google mới là bước
đầu; nó không nói được máy chủ có ghi đúng thư mục của Học viện hay không.
Chạy `kiemTraQuyenDrive` — hoặc bấm **Kiểm quyền Drive** trong màn *Nối máy
chủ* — máy chủ sẽ mở từng thư mục, tạo một tệp dấu, đọc lại, rồi xoá đi:

```
XÁC NHẬN QUYỀN VÀO DRIVE
Máy chủ đang chạy dưới tài khoản: typhuquanggita@gmail.com
Đạt 4/4 thư mục.

  ✓ Dữ Liệu GITA365  ·  Dữ Liệu GITA365
      Sổ dữ liệu: tài khoản, học viên, phiên, nhật ký, thanh toán
      mã 1pvXH45...  ·  mở được  ·  ghi được  ·  dọn được
  ...
Cả bốn thư mục đều mở được và ghi được. Tệp dấu đã dọn sạch.
```

Thư mục nào chỉ cho xem, hoặc mã sai, thì nó nói rõ thư mục nào và thiếu
quyền gì — không báo xanh cho qua chuyện.

## Sáu bước

### 1. Tạo dự án

Vào [script.google.com](https://script.google.com) bằng tài khoản Google của Học viện.
`New project` → đổi tên thành **GITA 365**.

### 2. Dán bảy tệp mã

Xoá tệp `Code.gs` mặc định. Với mỗi tệp: bấm dấu `+` cạnh **Files** → `Script` →
đặt đúng tên ở bảng trên (Apps Script tự thêm đuôi `.gs`) → dán toàn bộ nội dung.

### 3. Sửa hai dòng trong `GITA_Nen.gs`

Ngay đầu tệp:

```js
var GITA_THU_MUC_DRIVE  = '1pvXH45JvXXPOW9V6ObB5CR87r7gxH0fU';
var GITA_EMAIL_HE_THONG = 'typhuquanggita@gmail.com';
```

Mã thư mục là phần sau `/folders/` trong địa chỉ Drive. Hai giá trị trên đã điền
sẵn theo thư mục và email anh đang dùng — kiểm lại rồi để nguyên nếu đúng.

### 4. Chạy cài đặt lần đầu

Chọn hàm **`caiDatLanDau`** trong thanh trên → `Run`.
Google sẽ hỏi cấp quyền ở lần đầu: `Review permissions` → chọn tài khoản →
`Advanced` → `Go to GITA 365 (unsafe)` → `Allow`.
Chữ "unsafe" ở đây chỉ có nghĩa là dự án chưa qua kiểm duyệt của Google — nó là
mã của chính Học viện.

Chạy xong, log phải báo:

```
Đã dựng 8 bảng trong "GITA365 — Sổ dữ liệu". Mở Drive để xem.

Đã tạo Admin@gita365.
  Mật khẩu tạm: Binh-Yen-Kien-Tri-Vung-4827
  Chép ngay — dòng này không hiện lại lần thứ hai.
  Một bản đã gửi tới typhuquanggita@gmail.com.
  Máy chủ KHÔNG mở kho cho tài khoản này cho tới khi mật khẩu được đổi.
```

**Chép mật khẩu tạm ngay.** Nó do máy sinh ngẫu nhiên, mỗi lần cài đặt một
khác, và không hiện lại. Lỡ mất thì chạy hàm `datLaiMatKhauSuperAdmin` để
sinh mật khẩu mới.

Không có mật khẩu nào nằm sẵn trong mã. Mã nguồn đi qua kho mã, qua tin nhắn,
qua email, qua màn hình người khác nhìn thấy — một mật khẩu đặt cứng trong mã
là mật khẩu đã lộ kể từ dòng đầu tiên nó được viết ra.

### 5. Nạp bộ khoá

Thêm tệp `GITA_NapKhoa.gs`, dán nội dung → chọn hàm **`napBoKhoaMotLan`** → `Run`.
Log báo `Đã nạp 7 khoá`.

**Xoá tệp `GITA_NapKhoa.gs` khỏi dự án ngay sau đó.** Khoá đã nằm trong Script
Properties, không cần bản nào trong mã nữa.

### 6. Triển khai

`Deploy` → `New deployment` → bánh răng → `Web app`:

| Ô | Chọn |
|---|---|
| Execute as | **Me** (tài khoản Học viện) |
| Who has access | **Anyone** |

`Deploy` → chép địa chỉ kết thúc bằng `/exec`.

> **Anyone** không có nghĩa ai cũng đọc được dữ liệu. Nó chỉ cho phép trình duyệt
> gọi tới địa chỉ này. Mọi việc bên trong vẫn đòi phiên đăng nhập hợp lệ, và khoá
> chỉ cấp theo đúng vai và tầng.

---

## Nối vào ứng dụng

Hai đường, chọn một:

**Trong ứng dụng** — đăng nhập Super Admin → thư mục **Quản trị trang** →
**Nối máy chủ** → dán địa chỉ → `Lưu địa chỉ` → `Gọi thử`.
Thấy `đã nạp 7 khoá` là xong.

**Trong mã nguồn** — mở `cau-hinh.js`, đặt:

```js
G.API_CAP_PHEP = 'https://script.google.com/macros/s/…/exec';
```

Đường trong ứng dụng ghi vào máy đang dùng và thắng giá trị trong tệp.

---

## Một việc nữa: địa chỉ bản web

Link kích hoạt trong thư đăng ký cần biết bản web nằm ở đâu.
Trong Apps Script: `Project Settings` → `Script Properties` → `Add script property`:

| Thuộc tính | Giá trị |
|---|---|
| `GITA_DIA_CHI_WEB` | `https://gita.edu.vn/` |

Chưa đặt thì mặc định dùng chính địa chỉ đó.

---

## Kiểm trước khi tin

Ở máy, trước khi đưa lên Google:

```
node tools/thu-may-chu.js
```

Bộ này dựng một bản giả lập Apps Script rồi chạy toàn bộ mã trong `server/` trên
đó: đăng nhập, đăng ký, OTP, kích hoạt, nâng tầng, cấp khoá, nhật ký, và luật
chặn kho khi còn dùng mật khẩu tạm, và xác nhận quyền vào Drive. Tám mươi mốt
điểm, phải xanh hết — trong đó có cả trường hợp một thư mục chỉ cho xem và một
mã thư mục sai, để chắc rằng phần kiểm quyền không báo xanh cho qua chuyện.

Thử luôn bản gộp một tệp — thứ thật sự được dán lên Apps Script:

```
node tools/thu-may-chu.js --gop
```

Sau khi triển khai, mở thẳng địa chỉ `/exec` trong trình duyệt. Phải thấy:

```json
{"ok":true,"ten":"GITA 365 — máy chủ cấp phép","daNapKhoa":7,"luc":"…"}
```

`daNapKhoa` bằng 0 nghĩa là chưa chạy `napBoKhoaMotLan` — kho sẽ vẫn khoá.

---

## Sau khi nối

1. **Đổi mật khẩu Admin@gita365.** Không phải lời nhắc — máy chủ chặn thật:
   tài khoản đăng nhập được và đổi mật khẩu được, nhưng **không mở được kho**
   cho tới khi đổi xong. Xin khoá lúc ấy trả về mã `MUSTCHANGE`, và lần bị
   chặn vào nhật ký.
2. Mở sổ dữ liệu trong Drive, xem bảng `users` và `audit` — mọi việc đều có dòng.
3. Mỗi lần mã hoá lại kho (`node tools/ma-hoa-kho.js`) mà bộ khoá đổi thì phải
   nạp lại. Bộ hiện tại giữ nguyên bảy khoá cũ nên giấy phép đã cấp vẫn dùng được.

---

## Khi có chuyện

| Hiện tượng | Nguyên nhân thường gặp |
|---|---|
| Gọi thử báo không kết nối được | `Who has access` chưa đặt là **Anyone** |
| `daNapKhoa: 0` | Chưa chạy `napBoKhoaMotLan` |
| Đăng ký báo chưa gửi được thư | Chưa cấp quyền gửi email, chạy lại `caiDatLanDau` và cấp quyền |
| Kho vẫn khoá sau khi nối | Đăng xuất rồi đăng nhập lại — khoá cấp lúc mở phiên |
| Báo `MUSTCHANGE` | Còn đang dùng mật khẩu tạm. Đổi mật khẩu rồi kho mở |
| Mất mật khẩu tạm | Chạy hàm `datLaiMatKhauSuperAdmin` trong Apps Script |
| Sửa mã xong không thấy đổi | Phải `Deploy` → `Manage deployments` → sửa version thành **New version** |

Cần người thật: **08.5555.4688**
