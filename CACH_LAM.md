# GITA 365 — CÁCH LÀM

Một trang. Mọi việc thường ngày đều nằm ở đây.

---

## Một lệnh cho mọi lần cập nhật

```bash
node tools/phat-hanh.js          # đóng gói và kiểm, chưa đẩy
node tools/phat-hanh.js --day    # kiểm xong thì commit và đẩy luôn
```

Nó tự làm đủ sáu việc, dừng ngay khi có việc nào hỏng:

| | Việc | Ý nghĩa |
|---|---|---|
| 1 | Mã hoá lại kho | Giữ nguyên khoá — giấy phép đã cấp vẫn dùng được |
| 2 | Sinh tệp nạp khoá | Cho máy chủ cấp phép |
| 3 | Thử máy chủ cấp phép | 18 phép kiểm với `ROLES` thật của v6.9, không cần mạng |
| 4 | Dựng bản một tệp | Để gửi khách xem thử |
| 5 | Bộ kiểm phát hành | 80+ màn hình × 19 vai, chống tiêm mã, phạm vi cấp phép |
| 6 | Thử bản máy tính | Mở đúng ứng dụng Electron sẽ thành .exe, kiểm cổng in theo vai |
| 7 | Soát tài sản | Không để lọt kho gốc, bộ khoá hay giấy phép lên kho mã |

Thêm `--day` thì commit và đẩy, CI dựng bộ cài Windows mới trong khoảng
90 giây. Đặt lời commit bằng `GITA_LOI="…"` nếu muốn.

> Muốn kiểm cả bước 3 thì trỏ tới mã nguồn v6.9 một lần:
> `export GITA_V69=/đường/dẫn/GITA365_v69/src`

---

## Mở ứng dụng ra xem — ba đường

Ba đường dưới đây cho cùng một ứng dụng, khác nhau ở chỗ mở được bao nhiêu.

### Đường 1 · Máy chủ thử ngay trong máy — đủ 100%

```bash
node tools/thu-may-chu.js        # rồi mở http://127.0.0.1:8099
```

Có `kho/khoa.json` trong máy nên **mở đủ cả bảy gói**: 1.000 kịch bản, 220
phác đồ, 250 tình huống. Đây là đường duy nhất thấy hết ruột.

### Đường 2 · Một tệp HTML gửi đi được — mở phần vỏ

```bash
python3 tools/dong-goi.py        # ra GITA365-v7.8-gioi-thieu.html
```

Mở thẳng bằng trình duyệt, gửi qua email, chép vào USB. Không cần mạng,
không cần cài gì. Chạy **chế độ mẫu**: đi được cả 124 màn, trong đó **98
màn có ruột đầy** — gồm toàn bộ phần giới thiệu Học viện, bản đồ, đường
vào sáu bước và nhịp sống hằng ngày. **26 màn** còn lại lấy dữ liệu từ kho
nghề nên hiện thẻ xin cấp phép, vì tệp này **không kèm kho tri thức và
không kèm khoá**. Đó là chủ ý: tệp này để gửi ra ngoài.

Con số 98/124 được bộ kiểm phát hành canh ở mục 35 — nó mở đúng tệp này
và đếm chữ thật, nên không màn nào mở cho tất cả mà lại rỗng ruột.

Muốn mở đủ ngay trên tệp ấy thì bấm **Nạp tệp giấy phép** và chọn tệp
`.json` do Học viện cấp — xem mục *Cấp giấy phép cho đội ngũ* bên dưới.

Cần bản đã bóc vỏ `<html>`/`<head>` để dán vào chỗ khác:

```bash
python3 tools/ban-xem-thu.py     # ra ban-xem-thu.html
```

### Đường 3 · Đường web thật, ai cũng bấm được

`Settings → Pages → Source → GitHub Actions → Save`

Đúng một lần bấm, không phải sửa mã. Luồng `.github/workflows/trang-web.yml`
đã sẵn sàng và đang chờ ở đó; bật xong nó tự dựng và trang chạy ở:

```
https://typhuquanggita-commits.github.io/Quang-GITA/
```

Chưa bật thì luồng ấy dừng và báo đúng câu này trong nhật ký chạy. Muốn
gắn `gita.edu.vn` thì làm tiếp theo `docs/TEN_MIEN.md` — **và chỉ khai biến
`TEN_MIEN` sau khi DNS đã trỏ xong**, nếu không cả hai đường đều tắt.

---

## Đưa lên mạng — làm một lần

### 1. Chuyển kho mã sang riêng tư

`Settings → Danger Zone → Change repository visibility → Make private`

Việc duy nhất phải bấm tay. GitHub không mở API cho việc này.

### 2. Nạp khoá vào máy chủ cấp phép

```bash
node tools/tao-nap-khoa.js
```

Rồi trên Apps Script: **Project Settings → Script Properties → Add script property**

| | |
|---|---|
| Property | `GITA_KHOA_KHO` |
| Value | dán toàn bộ nội dung `giay-phep/GITA_KHOA_KHO.txt` |

**Save script properties.** Xong — không có mã nào phải dán rồi xoá, nên
không có nguy cơ quên xoá.

### 3. Dán máy chủ cấp phép

Dán **bốn tệp** trong `server/` vào dự án Apps Script (cùng chỗ `00_Config.gs`), lưu:

| Tệp | Làm gì |
|---|---|
| `GITA_CapPhep.gs` | Cấp khoá kho, và điều phối mọi yêu cầu khác |
| `GITA_XuatSheet.gs` | Tạo Google Sheet trong thư mục Drive của Admin |
| `GITA_MatKhau.gs` | Đổi mật khẩu và lấy lại mật khẩu qua email |
| `GITA_DongBo.gs` | Đồng bộ App ↔ Web App |

Các hàm nối vào `02_Security.gs` đã viết sẵn, không phải sửa gì.

**Deploy → New deployment → Web app** · Execute as **Me** · Who has access
**Anyone** → chép URL kết thúc bằng `/exec`.

### 4. Nối hai đầu

Sửa đúng một dòng trong `cau-hinh.js`:

```js
G.API_CAP_PHEP = 'https://script.google.com/macros/s/…/exec';
```

### 5. Đưa bản web lên mạng

Gắn tên miền riêng `gita.edu.vn` — ba cách, có bảng so sánh và đủ bản ghi
DNS ở **[docs/TEN_MIEN.md](TEN_MIEN.md)**. Bản rút gọn:

```
dash.cloudflare.com → Workers & Pages → Create → Pages → Connect to Git
  Nhánh            : claude/gita-365-ui-design-xew4bz
  Build command    : (để trống)
  Output directory : /
```

Tiêu đề bảo mật và các đường dẫn bị chặn đã nằm sẵn trong `_headers` và
`_redirects` — Cloudflare tự đọc.

---

## Diễn tập trước khi đụng vào Google và Cloudflare

```bash
node tools/gia-lap-trien-khai.js
```

Dựng ngay tại máy một máy chủ cấp phép chạy **chính** `server/GITA_CapPhep.gs`
và một bản web phục vụ kèm đúng `_headers` và `_redirects`, rồi tự kiểm cả
ba mặt. Sai chỗ nào sửa tại máy, không phải triển khai đi triển khai lại.

Điểm *"chạy trên HTTPS"* luôn trượt khi diễn tập — bản thật trên Cloudflare
sẽ đạt.

## Kiểm bản thật sau khi triển khai

```bash
node tools/kiem-trien-khai.js \
  https://script.google.com/macros/s/…/exec \
  https://gita365.pages.dev
```

Chạy từ ngoài vào, đúng như một người lạ trên internet nhìn thấy:

- **A · Máy chủ cấp phép** — sống, đã nạp đủ bảy gói, và token bịa **không**
  được cấp khoá
- **B · Bản web** — lên đúng, đủ năm tiêu đề bảo mật, cài được như ứng dụng,
  chạy được khi mất mạng
- **C · Tài sản** — bộ khoá, `kho-goc/`, `giay-phep/`, `tools/`, `server/`
  đều không phục vụ ra ngoài; gói `.enc` tải về được nhưng không đọc nổi

Thay cho bảng bảy dòng phải tự soi bằng mắt.

---

## Đăng nhập — bắt đầu từ đâu

**Muốn vào app ngay:** mở app → cột phải → **bấm thẳng vào một vai**, vào
luôn không cần mật khẩu. Hoặc bấm **Xem tài khoản và mật khẩu** ngay trên
ô đăng nhập.

Đủ 19 tài khoản, mật khẩu, và mỗi vai thấy được gì: **[docs/DANG_NHAP.md](DANG_NHAP.md)**.

> Có **hai bộ tài khoản**. Bộ trong app chạy ngay, dùng để xem thử. Bộ trên
> máy chủ (sinh bằng `tao-tai-khoan.js`) chỉ chạy sau khi dựng xong máy chủ,
> và mới là bộ vận hành thật. Đừng lẫn hai bộ.

---

## Bộ tài khoản khởi đầu

```bash
node tools/tao-tai-khoan.js
```

Sinh 19 tài khoản — 15 vị trí vận hành và 4 tài khoản phản biện — với mật
khẩu khởi đầu ngẫu nhiên, và hai tệp:

| Tệp | Làm gì |
|---|---|
| `giay-phep/GITA_NapTaiKhoan.gs` | Dán vào Apps Script → chạy `napTaiKhoanMotLan()` → **xoá tệp khỏi dự án** |
| `giay-phep/BAN_GIAO_TAI_KHOAN.md` | Bảng bàn giao, phát mật khẩu cho từng người |

Mật khẩu được băm bằng `hashPw_` + `newSalt_` của `02_Security.gs` **ngay
trên máy chủ** — mật khẩu thô không bao giờ nằm trong sổ `users`. Mọi tài
khoản bật `mustChangePw`, buộc đổi ở lần đăng nhập đầu.

Sau một tuần chạy `kiemTaiKhoanChuaDoi()`: ai còn trong danh sách là chưa
đăng nhập lần nào.

**Quên mật khẩu** — người dùng tự làm, không cần Admin: màn hình đăng nhập →
**Quên mật khẩu?** → nhập email → nhận mã sáu số → đặt mật khẩu mới. Mã sống
15 phút, sai 5 lần thì huỷ, tối đa 5 lần xin mã mỗi giờ. Dùng `MailApp` của
Apps Script, không cần dịch vụ gửi thư nào khác.

**Đổi mật khẩu khi đang dùng** — thanh trái → **Đổi mật khẩu**. Đổi xong hệ
thống đóng phiên hiện tại.

---

## Ai xuất được gì

| Việc | Vai được phép | Vai KHÔNG được |
|---|---|---|
| In PDF (`xuat_pdf`) | R01–R05, từ Trưởng nhóm Coach trở lên | R06–R15, gồm **toàn bộ khách hàng** |
| Đẩy Google Sheet lên Drive (`xuat_sheet`) | R01–R04, Ban điều hành | R05–R15 |

**Không còn Excel và CSV.** Tệp tải về máy là bản sao nằm ngoài tầm kiểm
soát: không đóng dấu được theo người nhận, không thu hồi được. Google Sheet
trong thư mục Drive của Admin thì xem được ai mở, thu hồi được quyền, và luôn
có đúng một bản gốc.

Bảng tính đi thẳng từ máy chủ vào
[thư mục Drive của Admin](https://drive.google.com/drive/folders/1pvXH45JvXXPOW9V6ObB5CR87r7gxH0fU)
— không đi qua máy người dùng. Admin phân phối lại bằng quyền chia sẻ của Drive.

Khách hàng muốn bản giấy thì Coach hoặc quản lý in gửi. Không có đường nào
cho khách tự xuất hồ sơ: chặn ở cổng in trong ứng dụng, chặn Ctrl+P ở mọi màn
hình, và chặn cả trình đơn **Xuất PDF** lẫn **Sao lưu** của bản máy tính.

---

## Nối bộ tạo ảnh — vẽ như ChatGPT

Ảnh **người như ảnh chụp** và **cảnh thật** không phải việc của bộ vẽ trong
máy, cũng không phải việc của mô hình ngôn ngữ đang chạy trợ lý. Mô hình ngôn
ngữ **đọc** được ảnh nhưng **không sinh ra** ảnh. Thứ sinh ra ảnh ấy là mô
hình **khuếch tán** — loại máy khác, mua tài khoản.

ChatGPT vẽ ảnh bằng API ảnh của OpenAI, và đó là một cửa HTTP nối được. Bộ
chuyển đổi đã có sẵn trong mã:

    npx wrangler secret put GITA_KIEU_VE    # openai
    npx wrangler secret put GITA_CONG_VE    # đường dẫn tạo ảnh của OpenAI
    npx wrangler secret put GITA_KHOA_VE    # khoá API tài khoản OpenAI
    npx wrangler secret put GITA_MAU_VE     # tên mô hình ảnh tài khoản được dùng

Không khai `GITA_KIEU_VE` thì mặc định `gita` — dạng riêng của Học viện, dành
cho ai tự dựng một lớp trung gian.

**Vì sao cần bộ chuyển đổi:** cửa của Học viện gửi `{id, deBai, kho, loaiHinh,
tang}`, OpenAI đòi `{model, prompt, size, n}`. Trỏ thẳng vào nhau thì OpenAI
trả 400, và người bấm chỉ thấy "cổng trả về 400" — đúng loại lỗi làm người ta
bỏ cuộc mà không biết mình sai ở đâu. Bộ chuyển đổi **đổi vỏ, không đụng vào
ruột**: đề bài đi ra nguyên văn từng chữ, và bộ kiểm đối chiếu độ dài hai bên
mỗi lần chạy.

Nhận về, cửa đọc được cả bốn dạng: thân là ảnh · `{anh: data URI}` · `{url}` ·
`{data:[{b64_json|url}]}` (dạng OpenAI).

**Đường dùng được ngay khi chưa có tài khoản:** ảnh chụp trong kho ảnh làm lớp
người, chữ do máy đặt lên (luật `lopGhep`). Ảnh chụp phải có văn bản đồng ý —
luật C13.

---

## In ra giấy

Ba khổ in, đo bằng **milimét** ở 300 điểm mỗi tấc Anh (mức nhà in đòi):

| Khổ | Kích thước | Điểm ảnh |
|---|---|---|
| `a4d` | A4 dọc 210×297mm | 2480×3508 |
| `a4n` | A4 ngang 297×210mm | 3508×2480 |
| `a5d` | A5 dọc 148×210mm | 1748×2480 |

    node tools/tam-ra-anh.js de-bai.json /tmp/in a4d

Hai điều kiện cứng của luật C22, và cả hai là **sự thật chứ không phải sở
thích**:

- **Khổ in không nhận nền đêm sâu.** Một tờ A4 phủ kín mực tối tốn gần một
  mililít mực mỗi bản, làm giấy cong vì ướt, và ra đục chứ không ra sâu —
  nền sâu đẹp là nhờ màn hình *tự* phát sáng, còn giấy chỉ hắt lại. Gọi nền
  `sau` ở khổ in thì máy **từ chối**, không tự đổi hộ: đổi nền là đổi tương
  phản của mọi chữ trên tấm, và đó là quyết định của người dựng.
- **Chữ nhỏ nhất phải đạt 2,1mm khi in.** Dưới mức ấy không phải "chữ nhỏ",
  là chữ không ai đọc — mà một tấm có phần không ai đọc thì phần ấy đáng lẽ
  không nên có. Máy không phóng chữ cho lọt ngưỡng.

Bộ kiểm đo lại cả hai từ chuỗi SVG, cộng thêm **lề 5mm**: máy xén giấy có sai
số, nên chữ sát mép là chữ có ngày bị xén mất một phần.

Còn chờ chủ hệ đúng hai thứ vẫn là lựa chọn (`TG-02`): mã mực CMYK cho từng
sắc thương hiệu, và loại giấy. Chưa chốt thì vẫn in được — chỉ là bản in có
thể lệch sắc so với màn hình.

---

## Chữ thay ảnh

Mỗi tấm phát hành mang theo một **nhãn ngắn** và một **câu tả**, ghép từ đúng
những chữ đã đặt lên tấm — không thêm một từ nào máy tự nghĩ. Máy dựng được
câu ấy chứ không phải đoán, vì chính nó đặt từng chữ.

Câu ấy nằm **trong chính SVG** (`<title>` và `<desc>`), nên dán tấm sang chỗ
khác thì chữ đi theo. Ghi vào sổ bằng cửa `ghiChuThayAnh`; **chưa có thì
không phát hành được** (luật C21).

Vì sao chặn thật chứ không nhắc: một tấm thiếu chữ thay ảnh trông y hệt một
tấm đủ — với người sáng mắt. Chỗ hỏng chỉ hiện ra với đúng người không có
cách nào báo lại là mình vừa mất gì.

---

## Dựng một cuốn phim từ bộ tấm

Ba bước, chạy ở máy của Học viện — không gửi gì ra ngoài:

    node tools/tam-ra-anh.js de-bai.json /tmp/tam     # đề bài → tấm PNG
    node tools/dung-phim.js /tmp/tam phim.mp4 5       # tấm → phim, 5 giây/cảnh
    xvfb-run -a node tools/thu-phim.js                # thử trọn đường

Một lệnh ra **cả ba khổ** cùng lúc:

    node tools/bo-phim.js de-bai.json /tmp/ra 6 --kho=vuong,doc,dung

Mỗi khổ được **vẽ lại**, không phải thu nhỏ rồi đệm đen: khổ đứng thì chữ xếp
chồng và dải người xuống đáy, khổ ngang thì hai cột. Đắt hơn mấy giây; một dải
đen thì ở lại trong ấn phẩm mãi mãi (luật `doiKho`).

`de-bai.json` là một **mảng** bản ghi thị giác, mỗi bản ghi đúng dạng bộ vẽ
nhận: `{id, tang, loaiHinh, nhiemVu, noiDung, nguoiXem[]}`. Cả bộ đi qua
`G.veThiGiacBo()` nên khổ và nền chốt một lần theo tấm đầu — mọi cảnh chắc
chắn cùng kích thước.

Chuyển động là Ken Burns — phóng chậm **và trôi ngang**, luân phiên vào/ra.
Nối cảnh 0,8 giây, chọn được năm kiểu:

| Kiểu | Dùng khi |
|---|---|
| `mo` | Mặc định — mờ chồng, không tự nhận là hiệu ứng |
| `quaDen` | Chìm qua đen, tách hẳn hai phần |
| `gatTrai` | Gạt sang trái, nhịp nhanh |
| `truotLen` | Trượt lên, hợp khổ dọc |
| `moTron` | Mở tròn, cho mở đầu hoặc kết |

**Không phụ đề cháy thêm** — chữ đã nằm trong tấm, do máy đặt, đã qua phép đo
tương phản và phép đo chữ-trong-khung; cháy thêm một lớp chữ nữa là chồng chữ
lên chữ (luật C14).

### Lời đọc và nhạc

    node tools/dung-phim.js /tmp/tam phim.mp4 6 --loi=/tmp/loi --nhac=nen.mp3

Lời đọc là **tệp thu sẵn của một người thật**, đặt tên **y hệt tên tấm**, chỉ
khác đuôi (`tam-000-ap-phich.mp3`). Trùng tên là cách duy nhất biết chắc lời
nào của cảnh nào. Máy đặt lời đúng chỗ cảnh ấy bắt đầu **trong bản đã nối** —
không phải chỗ nó bắt đầu nếu nối thẳng; hai chỗ ấy lệch dồn 0,8 giây mỗi
cảnh, và tới cảnh thứ mười thì lời rơi hẳn sang cảnh khác.

Máy **không sinh** giọng và **không sinh** nhạc (luật C20): một câu như "nhà
mình sẽ khác đi" là một lời hứa, và giọng máy đọc lời hứa ấy là lời hứa không
ai đứng sau. Máy cũng **không lặp** nhạc cho đủ dài và **không cắt** lời cho
vừa cảnh — cả hai đều là sửa nội dung mà không ai được báo; nó dừng và nói ra.

Thời lượng: `số cảnh × giây/cảnh − (số cảnh − 1) × 0,8`.

Cần `ffmpeg` và `ffprobe` trên máy (`apt-get install -y ffmpeg`). Thiếu thì
lệnh nói ra chứ không lặng lẽ bỏ qua.

**Phim chỉ dựng từ tấm ĐÃ phát hành** — luật C19 của hiến pháp thị giác. Tấm
còn ô chờ lớp người thì chưa phát hành được (luật C16), nên cũng chưa vào
phim được. Cuốn phim đi ra khỏi hệ theo đúng bảng "Ai xuất được gì" ở trên.

Luật ấy **kiểm được**, không chỉ là một câu trong sổ: `tam-ra-anh.js` ghi kèm
`nguon.json` — mỗi tệp PNG truy về một bản ghi thị giác và bậc duyệt của nó —
còn `dung-phim.js` ĐÒI sổ ấy. Mất sổ, có ảnh ngoài sổ, hay có tấm chưa tới bậc
`phatHanh` thì nó dừng và nói ra tên tấm.

---

## Đồng bộ App ↔ Web App

Chạy tự động, không phải bấm gì:

- App kiểm bản mới khi mở và mỗi 6 giờ
- Mọi thay đổi được đánh dấu mốc thời gian ngay lúc sửa
- Có mạng thì đẩy **chỉ phần đã đổi** lên máy chủ Admin
- Xung đột giải theo **từng trường**, không ghi đè cả khối — hai máy sửa hai
  việc khác nhau thì giữ được cả hai
- Máy chủ luôn sao lưu trước khi ghi đè
- Mất mạng thì xếp hàng; có mạng lại tự đẩy; rời trang thì đẩy nốt bằng `sendBeacon`

Bấm tay được ở thanh trái → **Đồng bộ**, có hiện số thay đổi đang chờ.

Trần 512 KB mỗi lần đẩy. Chỉ năm nhóm được đồng bộ: `checks`, `journal`,
`vision`, `test`, `mood`. Kho chuyên môn **không** đi đường này — nó có đường
cấp phép và khoá riêng.

---

## Kiểm thử theo vai

**Kiểm thử theo vai** (Quản trị trang) — ma trận 128 màn × 15 vai, và một
cú bấm là vào vai bất kỳ, không phải đăng xuất. Mật khẩu của cả mười chín
tài khoản mẫu nằm ngay trên bảng.

Đọc cột **Khoá** trước cột Thấy được: nó nói vai ấy KHÔNG thấy bao nhiêu
màn. Mục *Màn hẹp nhất* liệt riêng những màn chỉ một hai vai thấy — chỗ
nới quyền nhầm sẽ tốn nhất.

---

## Nhìn toàn hệ từ A đến Z

**Bảng quy trình toàn Web App** (Quản trị trang) — tám luồng vận hành, 36
bước, mỗi bước một màn kèm *xong khi nào* và *không xong thì làm gì*.
Cộng bảng toàn bộ màn hình đếm từ chính ứng dụng, và danh sách quyền chỉ
cấp quản trị có.

**Công tắc Mở hết** — nút hình quỹ đạo trên thanh trên, chỉ hiện với
Super Admin và Admin hệ thống. Bật là mọi danh sách và mọi đoạn chữ hiện
đủ, không cắt bớt. Dùng khi đi rà; tắt đi khi làm việc thường cho màn
hình gọn lại.

---

## Chiều sâu năm lớp

Mỗi mô thức có năm lớp C1 → C5: cùng một công cụ, năm cấp nghề **làm
được năm việc khác nhau**. Xem ở màn **Chiều sâu năm lớp** (từ Tư vấn trở
lên).

Mỗi lớp trả lời bốn câu — làm được gì · chưa làm được gì · việc thực hành
· dấu hiệu lên cấp — và mỗi mô thức thêm sáu câu chung: ba bối cảnh GITA
hoá (nhà · trường · xã hội), thói quen nó dựng nên, nhóm trong tầm nhìn
trăm năm, và tài liệu bổ trợ.

Viết tiếp thì giữ nguyên hình dạng ấy. Màn hình tự đếm độ phủ và tự bắt
hai lỗi: hai lớp làm được cùng một việc (là chữ, không phải tầng), và câu
dưới 40 ký tự.

---

## Bốn tuyến chuyên môn

ENGWIN365 · MATH365 · SAT365 · HSA365 dùng chung năm tầng của GITA365,
riêng tín hiệu vào bốn băng. Xem trạng thái sáu mốc của từng tuyến ở màn
**Bốn tuyến chuyên môn** (Super Admin · Admin hệ thống).

### Học phí và hợp đồng của một tuyến

**Học phí riêng.** Kho `HP_*` chỉ của GITA365. Tuyến mới đặt kho riêng
`<MÃ TUYẾN>_HOCPHI`, không sửa vào `HP_*`.

**Hợp đồng riêng.** Đặt kho `<MÃ TUYẾN>_HOPDONG`, mỗi bản ghi mang trường
`ma` khớp mã điều trong `G.HD_CHUAN` (HD-01 … HD-14). Thiếu điều nào thì
màn *Bốn tuyến chuyên môn* liệt kê ra đúng điều ấy, và mốc M7 chưa đạt.

Bảy điều ở `G.HD_RIENG` là phần tuyến tự quyết — **không chép từ tuyến
khác**. Bản chuẩn là danh sách kiểm, không thay luật sư.

### Mang chuẩn một tuyến về

1. Viết vào `kho-goc/data.<tên tuyến>.js`, đặt tên kho theo tiền tố mã
   tuyến: `MATH365_BANG`, `MATH365_KICHBAN`, `MATH365_DO`… Nội dung
   riêng của một tầng thì kết thúc bằng `_T1`…`_T5`.
2. `node tools/ma-hoa-kho.js` — packer tự dựng gói `math365-nghe`,
   `math365-t1`… Chưa có kho nào mang tiền tố thì nó bỏ qua và nói rõ.
3. Đủ sáu mốc thì đổi `trangThai` từ `'chuan'` sang `'chay'` **ở cả hai
   chỗ**: `src/data.tuyen.js` và `server/GITA_CapPhep.gs`. Lệch nhau thì
   bộ kiểm mục 36 dừng phát hành.

### Cấp giấy phép theo tuyến

```bash
node tools/tao-giay-phep.js "Cô Lan" 12 --tuyen MATH365
```

Không ghi tuyến nào thì cấp mặc định: gói nền cộng toàn bộ gói của những
tuyến **đang chạy** — hôm nay là đúng bảy gói cũ, y như trước.

### Gắn tuyến cho một tài khoản

Cột `tuyen` trong bảng tài khoản, các mã cách nhau bằng dấu phẩy:
`GITA365,MATH365`. **Để trống nghĩa là GITA365** — nên mọi tài khoản cũ
giữ nguyên phạm vi, không phải sửa gì. Gõ sai tên tuyến thì tài khoản chỉ
còn gói nền và gặp màn xin cấp phép ngay: sai thấy được là sai sửa được.

---

## Cấp giấy phép cho đội ngũ

Một người:

```bash
node tools/tao-giay-phep.js "Coach Minh" 12 nen nghe tang1 tang2
```

Cả nhóm, từ một tệp CSV:

```csv
# tên,số tháng,gói được cấp
Coach Minh,12,nen nghe tang1 tang2
Tư vấn Lan,12,nen nghe
Phụ huynh Hà,6,nen tang1
Cộng tác viên Nam,6,nen
```

```bash
node tools/tao-giay-phep.js --danh-sach doi-ngu.csv
```

Gõ sai tên gói thì **dừng dòng đó**, không bao giờ im lặng cấp toàn bộ.

Mỗi tệp mang số hiệu và dấu truy nguồn riêng — bản nào rò ra ngoài là biết
của ai. Gửi đúng một tệp cho đúng một người.

**Người nhận:** mở ứng dụng máy tính → **Trợ giúp → Nạp giấy phép** → chọn tệp.

---

## Khi nghi rò rỉ

```bash
node tools/ma-hoa-kho.js --doi-khoa     # đổi toàn bộ khoá
node tools/tao-giay-phep.js --danh-sach doi-ngu.csv   # cấp lại cho mọi người
node tools/phat-hanh.js --day           # đóng gói và phát hành lại
```

Rồi nạp lại `GITA_KHOA_KHO` trên Apps Script. Mọi bản sao cũ chết ngay.

Muốn khoá cửa tức thì mà chưa kịp làm gì: trên Apps Script chạy `xoaBoKhoa()`
— máy chủ trả lỗi `NOKEY` cho tới khi nạp lại.

---

## Ba việc chờ quyết định của chủ hệ thống

Không phải lỗi kỹ thuật — cần người quyết:

1. **Chuyển kho mã sang riêng tư** (mục 1 ở trên).
2. **Điền pháp nhân vào `LICENSE` và `NOTICE`**: tên đầy đủ Học viện GITA,
   mã số thuế, địa chỉ. Bản quyền chỉ đòi được khi có pháp nhân đứng tên.
3. **Chốt ngưỡng chuyển tuyến chuyên môn y tế — tâm lý** bằng số, để hệ
   thống tự nhắc tư vấn dừng lại và chuyển tuyến.
