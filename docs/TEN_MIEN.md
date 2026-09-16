# GITA 365 — ĐƯA LÊN GITHUB PAGES VÀ GẮN gita.edu.vn

---

## Trước hết: một điều phải quyết

GitHub Pages **miễn phí chỉ chạy được với kho mã công khai**. Kho riêng tư
cần gói GitHub Pro trở lên.

Nghĩa là anh phải chọn một trong ba:

| Cách | Kho mã | Tiền | Đặt được tiêu đề bảo mật |
|---|---|---|---|
| **A · GitHub Pages, kho công khai** | Ai cũng đọc được mã | 0đ | Không |
| **B · GitHub Pages + GitHub Pro** | Riêng tư | ~4 đô/tháng | Không |
| **C · Cloudflare Pages** | Riêng tư | 0đ | Có, bằng `_headers` |

**Kho báu vật vẫn an toàn ở cả ba cách** — nội dung chuyên môn nằm trong
`kho/*.enc`, mã hoá AES-256-GCM, và khoá không bao giờ nằm trong kho mã.
Người lạ tải hết `.enc` về cũng không mở được gì.

Thứ bị lộ khi kho công khai là **phần vỏ**: mã giao diện, mô hình phân quyền,
cách dựng hệ thống. Không phải kho tri thức, nhưng là công sức dựng sản phẩm —
đủ để một đối thủ nhân bản cái vỏ.

**Đề xuất của tôi: cách C.** Cloudflare Pages giữ kho riêng tư, miễn phí, gắn
`gita.edu.vn` được, và là nơi duy nhất trong ba cách đặt được tiêu đề bảo mật
(`_headers` đã viết sẵn trong kho mã).

**Nếu anh vẫn muốn GitHub Pages** — phần dưới là đầy đủ, và có cách lấy lại
tiêu đề bảo mật bằng Cloudflare đứng trước.

---

## Cách A/B — GitHub Pages

### 1. Bật Pages

`Settings → Pages`
- **Source**: chọn **GitHub Actions** (không phải Deploy from a branch)

Luồng `.github/workflows/trang-web.yml` đã có sẵn. Nó chỉ đẩy đúng phần ứng
dụng cần — `index.html`, `cau-hinh.js`, `manifest.webmanifest`, `sw.js`,
`robots.txt`, `src/`, `assets/`, `kho/` — và **dừng hẳn** nếu phát hiện
`kho-goc/`, `tools/`, `server/`, `docs/`, `giay-phep/` hay bộ khoá sắp lọt ra.

Bật xong là xong — trang chạy ngay ở đường mặc định:

```
https://typhuquanggita-commits.github.io/Quang-GITA/
```

Không phải sửa mã, không phải chờ DNS. Cứ mở đường ấy là kiểm được toàn bộ
ứng dụng. Bước 2 chỉ để đổi sang tên miền riêng.

### 2. Trỏ tên miền

`gita.edu.vn` là tên miền gốc (không có `www`) nên phải dùng **bản ghi A**,
không dùng CNAME. Vào trang quản trị tên miền, thêm:

**Bốn bản ghi A** — tên `@`, TTL để mặc định:

```
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```

### 3. Khai tên miền cho luồng chạy

Chỉ khai **sau khi bốn bản ghi A ở trên đã trỏ xong**, không khai trước.

`Settings → Secrets and variables → Actions → Variables → New repository
variable`

| Tên | Giá trị |
|---|---|
| `TEN_MIEN` | `gita.edu.vn` |

Vì sao phải theo thứ tự này: khai `TEN_MIEN` là luồng chạy ghi tệp `CNAME`
vào trang. Có `CNAME` thì GitHub Pages phục vụ ở tên miền ấy và **chuyển
hướng cả đường github.io về đó**. DNS chưa trỏ mà đã có `CNAME` thì hỏng cả
hai đường một lúc, và trang chỉ báo lỗi chung chung chứ không nói vì sao.

Chưa khai `TEN_MIEN` thì luồng chạy bỏ qua `CNAME` và trang ở lại đường
github.io — luôn mở được.

**Bốn bản ghi AAAA** (nên có, cho IPv6):

```
2606:50c0:8000::153
2606:50c0:8001::153
2606:50c0:8002::153
2606:50c0:8003::153
```

**Một bản ghi CNAME** cho `www` (tuỳ, nếu muốn `www.gita.edu.vn` cũng chạy):

```
www  →  typhuquanggita-commits.github.io
```

### 4. Khai báo tên miền với GitHub

`Settings → Pages → Custom domain` → gõ `gita.edu.vn` → **Save**

Đã khai `TEN_MIEN` ở bước 3 thì mỗi lần dựng luồng chạy tự ghi lại tệp
`CNAME`, nên khai báo này không bị mất khi đẩy bản mới.

*(Tệp `CNAME` ở gốc kho mã là bản lưu cho người đọc; nó không được chép vào
thư mục xuất bản — chỉ bước 3 mới quyết định trang có tên miền riêng hay
không.)*

### 5. Bật HTTPS

Đợi GitHub cấp chứng thư — thường vài phút, có khi tới 24 giờ. Xong thì
`Settings → Pages` → tích **Enforce HTTPS**.

Chưa tích được là chứng thư chưa xong, đợi thêm. Đừng đổi DNS trong lúc đợi.

### 6. Kiểm

```bash
dig gita.edu.vn +noall +answer -t A
dig gita.edu.vn +noall +answer -t AAAA
node tools/kiem-trien-khai.js <URL-.../exec> https://gita.edu.vn
```

---

## Lấy lại tiêu đề bảo mật trên GitHub Pages

GitHub Pages **không đặt được tiêu đề HTTP tuỳ ý**. Tệp `_headers` trong kho
mã chỉ có tác dụng trên Cloudflare Pages và Netlify.

Đã bù được một phần **ngay trong trang** bằng thẻ `meta`:
chính sách nội dung (chỉ cho tải từ chính trang và đúng hai tên miền của
Apps Script), chính sách giới thiệu nguồn, và ép HTTPS.

Còn thiếu `X-Frame-Options` và `frame-ancestors` — hai thứ chống nhúng trang
vào khung của kẻ khác, và thẻ `meta` **không** đặt được chúng.

Lấy lại bằng cách cho Cloudflare đứng trước GitHub Pages, miễn phí:

```
1. dash.cloudflare.com → Add a site → gita.edu.vn
2. Đổi nameserver của tên miền sang cặp Cloudflare cấp
3. Thêm đúng bốn bản ghi A và bốn AAAA ở trên, bật đám mây cam (Proxied)
4. Rules → Transform Rules → Modify Response Header → thêm:
     X-Frame-Options: DENY
     X-Content-Type-Options: nosniff
     Referrer-Policy: strict-origin-when-cross-origin
     Permissions-Policy: microphone=(self), camera=(), geolocation=()
     Strict-Transport-Security: max-age=63072000; includeSubDomains
```

Cách này cho anh: GitHub Pages làm nơi ở, Cloudflare làm lớp chắn. Vẫn 0đ.

> Nếu đã dùng Cloudflare tới bước này rồi thì **cách C** gọn hơn: Cloudflare
> Pages làm luôn cả hai việc, và kho mã được ở riêng tư.

---

## Cách C — Cloudflare Pages (đề xuất)

```
dash.cloudflare.com → Workers & Pages → Create → Pages → Connect to Git
  Kho              : typhuquanggita-commits/Quang-GITA   (để riêng tư được)
  Nhánh            : claude/gita-365-ui-design-xew4bz
  Build command    : (để trống)
  Output directory : /
→ Deploy → Custom domains → thêm gita.edu.vn
```

`_headers` và `_redirects` chạy ngay, không phải cấu hình gì thêm.

---

## Sau khi lên, dù chọn cách nào

Bản web mới chỉ là cái vỏ nếu chưa nối máy chủ cấp phép. Còn ba bước ở
`docs/CACH_LAM.md`:

1. Dán bốn tệp `server/*.gs` vào Apps Script, nạp bộ khoá
2. Deploy Web app, chép URL `/exec`
3. Điền URL vào `cau-hinh.js`, đẩy lên

Chưa làm ba bước đó thì trang chạy ở **chế độ giới thiệu**: xem được khung và
phần giới thiệu, kho chuyên môn vẫn khoá.

---

## Về tên miền `.edu.vn`

Tên miền `.edu.vn` ở Việt Nam do VNNIC quản lý và **chỉ cấp cho tổ chức giáo
dục, đào tạo** có giấy tờ chứng minh. Học viện GITA thuộc diện này, nhưng
phải đăng ký được `gita.edu.vn` trước đã — phần trên chỉ dùng khi tên miền
đã về tay anh.
