# GITA 365 · KIẾN TRÚC & CÁCH MỞ RỘNG

## Nguyên tắc
**Dữ liệu tách hoàn toàn khỏi giao diện.** Đổi nội dung chỉ sửa `src/data.*.js`.
Không thư viện ngoài, không bước dựng — mở `index.html` là chạy.

```
index.html          → nạp dữ liệu → lớp giao diện → màn hình → lõi ứng dụng
                      (thứ tự thẻ script quan trọng: data.* trước ui.js trước views* trước app.js)
```

## Bản đồ tệp

| Tệp | Giữ gì |
|---|---|
| `src/data.core.js` | 15 vai · bảng PERM · 5 tầng · mô thức G–I–T–A · **5 nhóm điều hướng** · la bàn văn hoá |
| `src/i18n.js` | chuỗi giao diện VI/EN · tên 5 nhóm và 55 mục · la bàn bản tiếng Anh |
| `src/data.map.js` | mô hình *Gia đình vận hành 365*: 5 khoang · 9 vai · băng nền 8 việc · đầu vào/ra · 6 ranh giới |
| `src/data.vault.js` | 42 mô thức · 6 sách · 7 bản đồ A3 · 40 poster · 14 bài học |
| `src/data.scripts.js` | 220 phác đồ · 1.000 kịch bản (mã, tầng, câu mở, câu chốt, điều không làm) |
| `src/data.journey.js` | 10 chân dung thành công · lộ trình 5 chặng |
| `src/data.daisu.js` | 4 cấp đại sứ · 20 nhiệm vụ · 13 quy tắc an toàn |
| `src/data.eco.js` | gia đình · đội ngũ · cú hích · nghi lễ · sự kiện · bảng số · nhiệm vụ theo vai |
| `src/data.language.js` | 9 điểm chạm · 6 nhịp ngôn từ · bảng thay-vì · 3 đoạn thoại mẫu |
| `src/data.reward.js` | 10 cấp độ · cách tích điểm · huy hiệu · quà · **hoa hồng trần 10%** · hành trình người dẫn dắt |
| `src/data.qa.js` | 4 chuyên gia phản biện · chuẩn 1000 điểm · chỉ số hài lòng · tài liệu khách gửi |
| `src/data.brand.js` | nhận diện thương hiệu · biên bản rà soát 6 nhóm |
| `src/data.arch.js` | tầm nhìn 100 năm · **100 tầng giá trị** · chuỗi WOW · chuẩn vận hành |
| `src/data.ai.js` | giới hạn AI theo tầng · KPI định tuyến · rà soát năng lực · lá chắn dữ liệu |
| `src/data.bench.js` | 10 hệ thống lớn · 6 hệ AI châu Á · 12 việc rút ra · 5 điều không lấy |
| `src/data.accounts.js` | ⚠ tài khoản DEMO — **xoá khi nối máy chủ thật** |
| `src/ui.js` | `U.h()` thoát ký tự · biểu tượng · thẻ · ô số · vòng tiến trình · bảng · hộp thoại |
| `src/guard.js` | đóng dấu chìm · chặn sao chép khối lớn · nhận diện quét kho |
| `src/views*.js` | 56 màn hình, mỗi màn là một hàm trả về chuỗi HTML |
| `src/app.js` | trạng thái · phân quyền · cổng vào · khung · định tuyến · trợ lý · PWA |

## Thêm một màn hình

```js
// 1. src/data.core.js — thêm mục vào đúng một trong 5 nhóm
{v:'ma-man', t:'Tên hiển thị', h:'Câu mô tả ngắn', ic:'star', perm:'pro_coach'}

// 2. src/i18n.js — thêm bản tiếng Anh
'ma-man': ['English name', 'English hint'],

// 3. src/views5.js — viết hàm màn hình
G.VIEWS['ma-man'] = function(){
  if(!G.can('pro_coach')) return U.lockCard();   // chốt quyền lớp hai
  return U.ph({eyebrow:'…', ic:'star', t:'…', lead:'…'}) + '…';
};

// 4. sw.js — thêm tệp mới vào danh sách FILES nếu tạo tệp mới
// 5. node tools/kiem-tra.js
```

## Phân quyền — hai lớp

1. **Thanh điều hướng** ẩn mục mà vai không có quyền (`visible()`).
2. **Lớp render** chặn thật: `G.allowed(view)` chạy trước mọi lần dựng màn hình,
   nên vào thẳng bằng liên kết `#ma-man` hay bằng trạng thái đã lưu đều bị chặn.
3. Mỗi màn hình nhạy cảm còn có **chốt riêng** ở dòng đầu của hàm.

> Khi nối máy chủ: client chỉ ẩn/hiện nút — **máy chủ luôn kiểm lại trước khi ghi.**

## Thêm một ngôn ngữ

```js
// src/i18n.js
G.LANGS.push({k:'ja', n:'日本語', flag:'JA', done:100});
G.UI.ja = { …chép khối en rồi dịch… };
G.NAV_EN / G.ITEM_EN / G.TIER_EN / G.CULTURE_EN  → tạo bản _ja tương ứng
```
Hàm `G.tx(o,'t')` tự lấy `o.t_<mã ngôn ngữ>` khi có, không có thì rơi về tiếng Việt.

## Trạng thái người dùng

Lưu trong `localStorage['gita365.v7']`: vai đang dùng, màn hình, nhóm đang mở,
tab la bàn, các ô đã tick, bảng tầm nhìn, nhật ký, tâm trạng.
Ngôn ngữ lưu riêng ở `gita365.lang`.

> Khi nối máy chủ, chuyển toàn bộ khối này sang hồ sơ gia đình — kèm quyền
> **xoá dữ liệu theo yêu cầu của gia đình**.

## Nối với hệ thống v6.9

| Việc | Tệp bên v6.9 |
|---|---|
| Đăng nhập, phiên, băm mật khẩu | `02_Security.gs` |
| Đọc/ghi hồ sơ, nhật ký, check-in | `08_Api.gs`, `01_Store.gs` |
| Kho kịch bản, phác đồ, mô thức | `data/*.json` trên Drive |
| Trợ lý AI | `06_AI.gs` |
| Cổng nghiệm thu, chuyển tầng | `04_Journey.gs`, `12_Cycle.gs` |
| Tài chính, hoa hồng | `05_Finance.gs` |
| Nhật ký hệ thống, việc chạy nền | `09_Jobs.gs` |

Bảng `G.PERM` trong `data.core.js` **giữ nguyên** bảng `PERM` của `00_Config.gs`
— một nguồn sự thật duy nhất cho cả hai bên.

## Bộ kiểm phát hành

```bash
npx http-server -p 8099 -s .
node tools/kiem-tra.js
```
Kiểm toàn vẹn liên kết · phân quyền 19 vai × 56 màn hình · chống tiêm mã ·
khả năng cài đặt. Chạy trước mỗi lần phát hành.

## Ma trận 220 × 5 tầng × 4 nhóm khách hàng — ghép chứ không lưu

Ba trục nhân với nhau ra **4.400 phiếu làm việc**. Không lưu 4.400 bản ghi:
lưu bốn lớp rồi ghép lúc hiển thị. Sửa một chuẩn là 4.400 phiếu cùng đúng;
viết tay 4.400 bản thì sửa một chuẩn phải sửa 4.400 chỗ.

| Lớp | Ở đâu | Bao nhiêu | Giữ gì |
|---|---|---|---|
| Kế hoạch theo (vấn đề × tầng) | `kho-goc/data.matran.t1..t5.js` | 1.100 | lộ trình · việc của bốn vai · đích · hồ sơ |
| Băng làm gì ở tầng nào | `G.MT_BANG_TANG` | 5 × 4 = 20 | giao gì · giữ lại gì · cổng đòi gì · rủi ro |
| Băng trông thế nào ở nhóm nào | `G.MT_BANG_NHOM` | 11 × 4 = 44 | trông thế nào · làm trước tiên · **khi nào dừng và chuyển tuyến** |
| Chỉ số riêng từng vấn đề | `G.MT_DO` | 220 × 4 ngưỡng | đơn vị · cách lấy số · ngưỡng XANH/VÀNG/CAM/ĐỎ |

Bốn băng **XANH · VÀNG · CAM · ĐỎ** không phải nhãn mới: hệ thống đã phân
loại gia đình bằng chúng từ đầu (trường `band` trong `G.FAMILIES`, buồng lái
Coach, chuẩn NV-CHAM "băng ĐỎ chạm trong 48 giờ"). Băng độc lập với tầng —
nhà tầng 5 vẫn có thể ở ĐỎ, nhà tầng 1 vẫn có thể ở XANH.
Không dùng `G.KHACH_TANG` (Bạch kim – Vàng – Thép – Chì) làm trục này vì
bảng đó ánh xạ thẳng sang tầng: lấy nó làm trục thứ ba là đếm tầng hai lần.

Hàm ghép: `G.mtPhieu(maVấnĐề, tầng, băng)` trong `src/ma-tran-bang.js`.
Xếp băng bằng số, không bằng cảm nhận: `G.mtXepBang(m1, m2, sốCổngTrượt)`.

## Hàm phải nằm ở `src/`, không nằm ở `kho-goc/`

`tools/ma-hoa-kho.js` đóng gói kho bằng `JSON.stringify` — **JSON bỏ hàm**.
Hàm định nghĩa trong `kho-goc/*.js` sẽ biến mất sau khi mã hoá và màn hình
vỡ ngay khi chạy bản có cấp phép, dù bản chưa mã hoá chạy tốt.
Quy tắc: **dữ liệu ở `kho-goc/`, hàm ở `src/`.**

## Nối dài một màn hình đã có

Muốn làm đầy một màn hình mà không thêm mục vào trình đơn thì bọc hàm cũ
(xem `src/tu-lieu-day-du.js`). Bắt buộc kiểm thẻ khoá trước khi nối:

```js
function biKhoa(html){
  return typeof html !== 'string' ||
    html.trim().indexOf('<div class="card center" style="padding:40px">') === 0;
}
```

Hàm cũ trả về thẻ khoá thì giữ nguyên thẻ khoá — không thì phần nối lọt qua
cổng phân quyền và mở cửa cho vai không được phép.

## Bộ rà soát chỗ trống — `tools/ra-soat-day-du.js`

Bộ kiểm phát hành hỏi **"màn hình có chạy không"**. Bộ này hỏi câu khác:
**"màn hình có RỖNG chỗ nào không"**. Hai câu hỏi khác nhau, và câu thứ
hai là câu bắt được thứ mà mắt người bỏ sót: một kho có nhan đề mà không
có nội dung vẫn chạy tốt, vẫn xanh hết mọi bài kiểm cũ.

```bash
npx http-server -p 8099 -s .
node tools/ra-soat-day-du.js
```

Chạy hết mọi màn hình của mọi vai rồi soi tám loại chỗ trống:

| # | Bắt gì | Vì sao đáng bắt |
|---|---|---|
| 1 | Màn dựng ra quá ngắn | Có khung mà không có ruột |
| 2 | Chữ tạm — TODO, "đang cập nhật", "sắp có" | Chỗ trống được viết bằng chữ |
| 3 | Ô rỗng trên màn | Nhãn có, nội dung không |
| 4 | Bản ghi thiếu trường bắt buộc | Kho có ô để trống |
| 5 | Mảng khai báo mà rỗng | Biến có tên, không có gì bên trong |
| 6 | Chuỗi chưa dịch | Giao diện EN hiện mã màn hình thay cho tên |
| 7 | Nút bấm không có bộ nhận | Bấm vào không tới đâu |
| 8 | Hàm được canh trước khi gọi mà không tồn tại | Màn vĩnh viễn rơi xuống nhánh dự phòng |

**Loại 8 là loại khó thấy nhất, nên nói riêng.** Lối viết phòng hờ quen
thuộc là:

```js
if(!S) return G.manChuaCapPhep ? G.manChuaCapPhep('so-tay-nhan-dien') :
  '<div class="card"><p class="sm dim">Phần này mở khi kho nghề được cấp phép.</p></div>';
```

`G.manChuaCapPhep` **chưa từng được định nghĩa ở đâu trong dự án**. Câu
điều kiện vì thế luôn sai, luôn rơi xuống nhánh dự phòng, và màn *Sổ tay
nhận diện* dựng ra đúng 136 ký tự thay vì màn xin cấp phép đầy đủ có nút
nạp giấy phép. Không lỗi, không cảnh báo, không màn trắng — chỉ là ruột
rỗng đội lốt phòng hờ, và bộ kiểm phát hành không bắt được vì màn ấy *có*
dựng ra chuỗi. Nay đã sửa thành `G.canCapPhep('nghe')`.

Phép soi: đọc tĩnh `src/*.js` tìm mọi dạng `G.foo ? G.foo(` và
`G.foo && G.foo(`, rồi hỏi ứng dụng đang chạy xem `G.foo` có thật là hàm
không. Hiện soi 42 hàm.

**Hệ quả cho màn tự soát.** Màn `soat-day-du` là màn duy nhất nói *về* chữ
tạm, nên nếu nó in nguyên văn mấy chữ ấy ra thì loại 2 bắt chính nó. Cách
chữa dễ dãi là tha cho nó một ngoại lệ — nhưng tha một lần là mở đường tha
lần sau. Nên chữa bằng cách đổi câu chữ trên giao diện (cả trong
`src/soat-day-du.js` lẫn `SOAT_CHATLUONG.CL3` ở `kho-goc/`), giữ nguyên
luật. Chữ tạm cụ thể vẫn nằm trong biểu thức `TAM` và vẫn hiện đủ khi thật
sự bắt được.

**Mỗi ngoại lệ phải có lý do viết ra.** Bảng `THA` trong tệp ghi từng
trường được phép để trống kèm lý do — ví dụ `AD_GIONG.ten` để trống vì
chưa ký hợp đồng thu âm thì không được điền tên ai, `HP_TANG.gia` để
trống vì mức học phí là quyết định của chủ Học viện. Ngoại lệ không có
lý do thì nó chỉ là một chỗ trống được tha.

**Phép LỌC phải kèm điều kiện kho đã nạp.** Kho rỗng thì lọc ra cũng
rỗng và bài kiểm trông như đã đạt. Mọi phép lọc trong bộ kiểm đều kèm
một phép đếm — đó là cách chặn "đạt rỗng".

## Cửa trước không được rỗng ruột — mục 35 của bộ kiểm

Ba mươi bốn mục đầu của bộ kiểm phát hành đều chạy **với kho đã cấp
phép**. Nên chúng không nhìn thấy thứ mà **người lạ** nhìn thấy.

Một mục điều hướng khai `capMo:'chung'` là màn mở cho tất cả. Nhưng nếu
nội dung của nó nằm trong gói NỀN thì trên bản giới thiệu một tệp và
trên trang web công khai, màn ấy chỉ dựng ra tiêu đề mục — không có chữ
nào bên trong, không lỗi, không cảnh báo.

Đó là chuyện đã xảy ra với chính **cửa trước** của Học viện. Màn
`gioi-thieu` khai `capMo:'chung'`, nhưng kho `GT_*` chỉ nằm ở gói NỀN.
Kết quả: người đầu tiên mở GITA365 ra nhìn thấy một cái khung 1.658 ký
tự gồm mười hai tiêu đề rỗng — trong khi bộ kiểm 34 mục vẫn xanh hết, vì
nó có khoá trong tay.

**Hai việc đã làm:**

1. `GT_*` được đưa vào `MO_RA` — gói mẫu công khai. Đây vốn là thứ Học
   viện nói ra ngoài: sứ mệnh, tầm nhìn, mục tiêu có mốc, năm tầng, văn
   hoá, cách đồng hành, và cả sáu điều Học viện *không* làm. Khoá nó lại
   là khoá đúng cái cửa mình đang mời người ta bước qua. Phần nghề vẫn
   khoá nguyên, `HP_*` học phí cũng vậy.

2. Mục 35 của bộ kiểm mở **đúng cái tệp khách nhận được**
   (`GITA365-v<số bản>-gioi-thieu.html`, qua `file://`), đăng nhập, dựng các
   màn cửa trước và đếm chữ thật. Dưới 700 ký tự là dừng phát hành.
   Ngưỡng 700 dùng chung với `tools/ra-soat-day-du.js`.

**Danh sách cửa trước được đặt tên, không lọc theo `capMo`.** Bản đầu
tiên của mục 35 lọc mọi màn khai `capMo:'chung'` — và sai. `capMo` là
**tầng hiển thị theo vai** (`G.TANG_HIENTHI`), nghĩa của `'chung'` là
*"ai đăng nhập cũng thấy"*, không phải *"ai trên mạng cũng thấy"*. Lọc
như thế thì bài kiểm đòi cả màn *Khoá đào tạo* của đội ngũ phải mở công
khai — tức là bắt hệ thống mở kho nghề ra để cho bài kiểm xanh. Một bài
kiểm ép sản phẩm hỏng đi để mình đạt là bài kiểm phải sửa, không phải
sản phẩm phải sửa.

Nên cửa trước là một danh sách viết thẳng trong mục 35:

```js
const CUA_TRUOC = ['gioi-thieu','bat-dau','tham-gia','pham-vi','ban-do','hanh-trinh-12'];
```

Đây là quyết định kinh doanh — mời người lạ nhìn thấy tới đâu — nên nó
được viết ra thành tên, và thêm bớt một tên là một lần cân nhắc có ý
thức. Kèm theo là một cái sàn: bản giới thiệu phải có ít nhất **95/124**
màn đủ ruột, để bản dùng thử không âm thầm rỗng dần qua từng bản phát
hành.

**Quy tắc rút ra:** đưa thêm một màn vào `CUA_TRUOC` thì phải đưa kho
của nó vào `MO_RA` trong cùng một lần sửa. Ngược lại, một màn cần kho
nghề thì cứ để nó hiện thẻ xin cấp phép — thẻ ấy còn nói được là khoá ở
đâu và mở bằng cách nào, hơn hẳn một cái khung rỗng.

## Super Admin không còn giới hạn nào — và công tắc "Mở hết"

Đo lại từ ứng dụng đang chạy: Super Admin **không màn nào bị khoá, không
thiếu quyền nào trong 41 quyền, mở đủ bảy gói kho**. Hai loại giới hạn
quen thuộc đã hết từ lâu.

Nhưng còn loại thứ ba, và nó là loại khó thấy nhất: **cắt bớt trên giao
diện**. Danh sách hiện mười mục đầu, tóm tắt cắt ở một trăm hai mươi ký
tự. Với người dùng thường thì đúng — màn dài quá thì không ai đọc. Với
người đi **rà** thì sai: một chỗ hỏng nằm ở mục thứ mười một sẽ không
bao giờ bị phát hiện.

Nên cắt bớt thành một **công tắc**, không phải một luật cứng:

```js
G.dsHet(ds, n)    // danh sách: đủ khi đang mở hết, ngược lại cắt như cũ
G.chuHet(s, n)    // đoạn chữ: đủ khi đang mở hết, ngược lại cắt + '…'
```

26 chỗ cắt trong `src/` đi qua hai hàm này. Nút bật nằm **trên thanh
trên, cạnh chip vai** — giấu vào một màn cài đặt thì người bật xong sang
màn khác sẽ quên là mình đang bật. Trạng thái ghi vào máy đang dùng, vì
đây là thói quen đọc của một người trên một máy, không phải quyền của
một vai.

**Công tắc là quyền, không phải biến.** `G.moHetBat()` hỏi lại
`G.can('qt_trang')` mỗi lần, nên đặt `G.MO_HET = true` từ bảng điều
khiển trình duyệt cũng không mở thêm gì cho phụ huynh. Bộ kiểm có một
mục chạy đúng phép thử ấy.

Đo được: màn Mô thức dài thêm **5.976 ký tự**, Sách gốc thêm 1.508, Đại
sứ thêm 1.443.

## Ba lỗi im lặng — và ba phép canh mới

Đợt v8.3 bắt được ba lỗi mà **không lỗi nào làm màn hình văng, không lỗi
nào bị bài kiểm cũ chặn**. Ghi lại vì cả ba đều là loại dễ tái diễn.

### 1. Bốn nghìn tư trăm phiếu ma trận nằm im vì một phép so sánh kiểu

`G.MT_BANG_TANG[].tang` lưu là `'T1'`. Người gọi — kể cả chính
`G.mtPhieu` — truyền số `1`. Phép `===` giữa `1` và `'T1'` luôn sai, nên
`mtBangTang` trả `null`, kéo theo `mtPhieu` trả `null` cho **cả 4.400
phiếu**. `layTang` cùng bệnh: nó ghép `'MATRAN_' + 1` thành `MATRAN_1` —
một kho không tồn tại.

Vì sao không ai thấy: `mtPhieu` trả `null` *gọn gàng*, màn hình xử lý
`null` đúng cách và hiện thẻ "chưa mở được". Không lỗi, không cảnh báo.
Và **không bài kiểm nào gọi thẳng `mtPhieu`** — chúng chỉ dựng màn.

Chữa: `chuanTang()` nhận cả `1` lẫn `'T1'`. Canh: bộ kiểm nay **gọi
thẳng** `mtPhieu` cho đủ 220 × 5 × 4 và đòi cả 4.400 phiếu có đủ bốn
lớp. Chạy hết trong 17ms.

**Bài học:** một bài kiểm chỉ dựng màn thì không chạm tới lớp ghép dữ
liệu bên dưới. Lớp nào có hàm ghép thì phải có bài gọi thẳng hàm ấy.

### 2. Hai tệp cùng đặt tên một kho — kho nạp sau ghi đè kho nạp trước

`G.CD_LUAT` là sáu luật về **chân dung khách hàng**. Tệp kênh cộng đồng
mới cũng đặt `G.CD_LUAT` cho sáu luật về **kênh**, và nó nạp sau theo thứ
tự chữ cái nên ghi đè. Màn chân dung sau đó dựng ra sáu thẻ rỗng và sáu
chữ `undefined` — nội dung của kho khác hiện lên chỗ của mình.

Chữa: đổi tiền tố thành `KENH_`. Canh: bộ kiểm quét `kho-goc/` tìm mọi
tên kho bị hai tệp cùng **gán đè**.

### 3. Phép canh ấy suýt sai vì `\s*` lùi lại được

Bản đầu của phép quét viết `\s*=\s*(?!G\.\1\s*\|\|)` để bỏ qua dạng
`G.X = G.X || []` — cách chia một kho ra nhiều tệp có chủ ý, dùng cho
`G.CHUYEN` và `G.SH_HOI`.

Nó báo nhầm cả mười một dòng nối thêm. Lý do: `\s*` đứng **trước** tiên
đoán nên **lùi lại được** — nó nhả khoảng trắng ra, tiên đoán soi vào dấu
cách thay vì soi vào `G.X ||`, thấy không khớp nên phủ định thành công.

Chữa: đưa khoảng trắng vào **trong** tiên đoán —
`\s*=(?!\s*G\.\1\s*\|\|)`. Kết quả: 239 kho, không tên nào bị gán đè.

**Bài học:** một phép canh sai theo hướng báo nhầm cũng nguy hiểm, vì
cách chữa dễ dãi là nới nó ra — và nới xong thì nó không canh gì nữa.

## Gốc NLP và trạng thái bằng chứng — `NLP_GOC`

Nhiều mô thức của GITA có gốc từ NLP và tâm lý học nhận thức. Trước
v8.3, gốc ấy không ghi ở đâu — người dùng mô thức không biết mình đứng
trên nền nào, và Học viện không biết chỗ nào mình đang **nói chắc hơn
bằng chứng cho phép**.

NLP là một tập hợp **không đồng đều**. Gộp cả ba loại vào một chữ "mô
thức" rồi dùng như nhau là chỗ một hệ thống giáo dục dễ mất uy tín nhất.
Nên mỗi gốc mang một mức:

| Mức | Nghĩa | Số mô thức |
|---|---|---|
| `chac` | Nền nghiên cứu vững, dùng được như cơ chế | 3 |
| `motphan` | Cơ chế có bằng chứng, tuyên bố mạnh thì không | 4 |
| `mong` | Dùng rộng nhưng nghiên cứu không ủng hộ | 2 |

**Chỗ phải nói thẳng nhất — N08, ba kiểu suy nghĩ VAK.** Giả thuyết "dạy
theo kiểu học của người học thì học tốt hơn" đã được kiểm nhiều lần và
không tìm thấy hiệu quả. GITA giữ nó ở đúng chỗ dùng được — chọn **từ
ngữ** cho dễ vào trong một cuộc nói chuyện — và **bỏ hẳn** phần xếp học
viên vào một kiểu rồi dạy theo kiểu ấy. Điều cấm được viết thành chữ:
không nói với phụ huynh rằng con học kém vì "dạy sai kiểu của cháu".

**Một cải tiến phương pháp, không chỉ một ghi chú.** `NLP_CAITIEN` ghi
chỗ nghiên cứu nói ngược lại cách làm phổ biến: hình dung kết quả tốt
**một mình** thường *làm giảm* nỗ lực. Cách hiệu quả là đối chiếu — hình
dung kết quả, rồi hình dung trở ngại thật bên trong mình, rồi chốt một
câu *nếu… thì…*. Điều đáng nói: câu nếu–thì ấy **đã có sẵn** trong hệ
GITA dưới tên *"mức tối thiểu của ngày mệt"*. Học viện đã làm đúng ở chỗ
này rồi, chỉ chưa nối nó vào bước hình dung.

`NLP_*` nằm ở gói **nghề**. Bảng này nói rõ chỗ nào Học viện đang nói
chắc hơn bằng chứng — đó là chuẩn nghề nội bộ, và nó ghi rõ chính nó cần
Hội đồng chuyên môn rà trước khi trích ra ngoài.

## Kênh cộng đồng chính thức — `KENH_DS`

Ba kênh: nhóm **Gia Đình Thịnh Vượng** (phụ huynh), nhóm **Đại sứ**, và
**Trang Học viện**. Khai thành dữ liệu, không dán đường dẫn vào giao
diện — vì hai lý do.

**Lý do một: nó va vào một luật đang chạy.** Bộ dò rò rỉ trong
`G.LUAT_LAMVIEC` coi chữ `facebook` là dấu hiệu D3 — Tư vấn kéo khách ra
ngoài hệ thống. Không khai thì Tư vấn mời gia đình vào nhóm **chính
thức** — việc đúng — lại bị máy báo vi phạm; còn Tư vấn đưa nhóm **riêng**
của mình thì lẫn vào đó không ai phân biệt được. Nay ba chuỗi nhận dạng
kênh chính thức nằm trong `ngoaiLe`; kênh riêng vẫn là vi phạm như cũ,
chế tài giữ nguyên.

**Lý do hai: ranh giới dữ liệu phải viết thành chữ.** Nhóm nằm trên nền
tảng của người khác. Mỗi kênh khai rõ `cho` và `khong` — và cột `khong`
là cột quan trọng: không hồ sơ gia đình nào (kể cả ẩn danh), không bảng
số, không kết quả test, không tài liệu đã cấp phép, không tư vấn ca cụ
thể trong bình luận công khai, không chốt học phí.

Nhóm là **bước số không** của đường vào — trước cả bước một. Giao diện
nối vào ba màn đã có (`gioi-thieu`, `tham-gia`, `ket-noi`) chứ **không
thêm mục điều hướng**: một đường dẫn ra ngoài không xứng một mục trong
trình đơn, và đặt cạnh các mục nội dung sẽ làm người dùng tưởng bấm vào
là mở một màn trong ứng dụng. Mọi liên kết ra ngoài đều `target="_blank"`
kèm `rel="noopener noreferrer nofollow"` và nhãn *"↗ rời ứng dụng"*.

`KENH_*` nằm ở gói **nền** và cả gói **mẫu công khai** — phụ huynh chưa là
khách hàng cũng phải thấy được nhóm. Cùng lý do với `GT_*` và `DV_*`.

## Kiểm thử theo vai — `kiem-theo-vai`

Trước màn này, kiểm xem một vai nhìn thấy gì phải làm bằng tay: đăng
xuất, đăng nhập vai khác, đi hết trình đơn, ghi ra giấy, lặp lại mười
chín lần. Không ai làm nổi — nên trên thực tế **không ai kiểm**.

Màn này tính sẵn cả ma trận và cho đổi vai bằng một cú bấm
(`[data-switch]`, đã có sẵn trong `app.js`).

| Phần | Nội dung |
|---|---|
| A | 15 vai · tài khoản mẫu · mật khẩu · số màn thấy được · **số màn khoá** · nút Vào vai này |
| B | 4 chuyên gia phản biện |
| C | **Ma trận màn × vai** — 128 × 15, ô đặc là thấy, ô rỗng là khoá |
| D | **Màn hẹp nhất** — từ hai vai trở xuống, chỗ nới quyền nhầm tốn nhất |
| E | So sánh Super Admin với một vai bất kỳ |

Cột đáng nhìn là **số màn khoá**, không phải số màn thấy được. Đo hiện
tại: R01–R02 128/128 · R03–R04 102 · R05–R08 96 · R09–R11 93 · R12 79 ·
R13 45 · R14 38 · R15 33.

**Bốn điều bộ kiểm canh trên ma trận này:**

1. Super Admin và Admin thấy **toàn bộ** màn — không sót màn nào.
2. Không vai nào thấy nhiều hơn Super Admin.
3. Không vai nào thấy một màn mà Super Admin **không** thấy.
4. **Bậc thang không đảo ngược** — vai bậc thấp không thấy nhiều hơn vai
   bậc cao. Đây là phép bắt được lỗi nới quyền nhầm, thứ mà đọc bảng
   quyền bằng mắt không thấy.

Ma trận tính từ `G.NAV` và `G.vaiCo` lúc chạy, nên thêm một màn hay đổi
một quyền là nó đổi theo ngay. Một bảng phân quyền lệch khỏi ứng dụng là
kiểu hỏng không ai phát hiện cho tới lúc một vai nhìn thấy thứ đáng lẽ
không được nhìn.

## Bảng quy trình toàn Web App — `quy-trinh-toan-he`

Danh sách 127 màn xếp theo nhóm cho biết **có những gì**, nhưng không cho
biết chúng **nối vào nhau thế nào**. Màn này khai tám luồng vận hành, 36
bước, mỗi bước gắn đúng một màn và nói bốn điều: *ai làm · mở màn nào ·
xong khi nào · **không xong thì làm gì***.

Cột cuối là cột hay bị bỏ. Một quy trình chỉ mô tả đường thuận là quy
trình chưa dùng được — đời thật gãy ở chỗ không thuận.

| | |
|---|---|
| L1 | Đưa một nhà mới vào |
| L2 | Chạy một tuần của một nhà |
| L3 | Đóng một chặng 90 ngày |
| L4 | Cấp tài khoản và cấp phép |
| L5 | Đưa một tài liệu vào kho |
| L6 | Giữ tài sản không rò ra ngoài |
| L7 | Phát hành một bản mới |
| L8 | Rà soát toàn hệ |

**Hai thứ màn này KHÔNG khai tay:** số màn và số quyền — chúng được đếm
từ `G.NAV` và `G.PERM` lúc chạy. Và **mọi tên màn trong luồng được đối
chiếu với `G.NAV` lúc dựng**: khai một màn không có thật thì hiện đỏ ngay
tại dòng ấy.

Phép đối chiếu ấy bắt được lỗi ngay lần chạy đầu — bốn bước trỏ tới
`ho-so-nang-luc`, `quan-tri-nguoi`, `sua-noi-dung`, `vong-doi-tk`, đều là
tên tôi tưởng có mà không có. Đó chính là lý do bảng phải tự đối chiếu:
một bảng quy trình lệch khỏi ứng dụng còn tệ hơn không có bảng, vì người
đọc tin nó rồi ra quyết định sai.

## Học phí và hợp đồng — riêng từng tuyến, không mượn của nhau

Chủ Học viện chốt hai điều, và cả hai được khoá vào dữ liệu chứ không
chỉ ghi trong tài liệu:

**1. Tuyến nào có chính sách học phí độc lập tuyến đó.** Kho `HP_*` là
học phí của **riêng GITA365** — chương trình năm tầng đã lập trình từ
đầu. `G.HP_PHAM_VI` khai rõ điều ấy, và màn *Học phí năm tầng* in nó
ngay đầu màn, trước cả bảng giá. Tuyến mới có học phí thì đặt kho riêng
theo tiền tố (`MATH365_HOCPHI`), không sửa vào `HP_*`.

Vì sao phải ghi phạm vi: hệ đã có bốn tuyến chạy song song. Một bảng giá
không ghi phạm vi thì tới lúc bán tuyến khác, người tư vấn mở đúng bảng
này ra đọc — và **đọc sai giá cho khách là chuyện không rút lại được.**

**2. Tuyến nào biên soạn hợp đồng theo quy định riêng tuyến đó.** Mốc
**M7** của một tuyến. `G.HD_CHUAN` là **danh sách kiểm**, không phải hợp
đồng: mười bốn điều mà hợp đồng của bất kỳ tuyến nào cũng phải có, mỗi
điều kèm *thiếu thì rủi ro gì*. `G.HD_RIENG` là bảy điều mỗi tuyến **tự
quyết** — học phí, danh mục giao, mốc nghiệm thu, điều kiện hoàn, nhịp
buổi, ai được dẫn, ngưỡng chuyển tuyến. Chép phần B giữa các tuyến là
sai ngay từ gốc.

**Vì sao không viết sẵn điều khoản.** Điều khoản có hiệu lực phải do
người có thẩm quyền pháp lý soạn và gắn với pháp nhân đứng tên — mà pháp
nhân hiện còn để trống trong `LICENSE` và `NOTICE`. Viết sẵn một bản hợp
đồng đọc như thật rồi để đó là tạo ra thứ nguy hiểm nhất: **một văn bản
trông có hiệu lực mà không có.**

### Đạt rỗng — bẫy gặp ngay khi dựng phần này

Bản đầu của `G.hdConThieu()` lọc trên `G.HD_CHUAN || []`. Với tài khoản
chưa được cấp phép kho nghề, `HD_CHUAN` không tồn tại, nên phép lọc chạy
trên mảng rỗng và trả về **"không thiếu điều nào"** — bài kiểm xanh vì
không có gì để kiểm, chứ không phải vì hợp đồng đã đủ.

Nay hàm trả `null` khi bản chuẩn chưa nạp, và bộ kiểm có một mục chỉ để
canh đúng chuyện đó: tạm xoá `HD_CHUAN` rồi hỏi lại, phải nhận `null`.

## Chiều sâu năm lớp — mỗi mô thức, năm cấp nghề làm được năm việc

Hệ thống có sẵn hai trục, và cả hai đã được đặt đúng từ trước:

| Trục | Kho | Nội dung |
|---|---|---|
| Tầng hấp thu của khách | `G.TIERS` | T1 NHẬN DIỆN → T5 BỨT PHÁ |
| Cấp độ chuyên môn | `G.CAPDO_VANDUNG` | C1 Làm theo · C2 Hiểu vì sao · C3 Chọn được · C4 Ghép được · C5 Dạy lại được |

Trục C1–C5 được mô tả rất kỹ — mỗi cấp có `docThayGi`, `nguoiHuongDan`,
`dauHieuDuVao`, `dauHieuChua`, `loiThuongGap`. Nhưng **không tài nguyên
nghề nào gắn vào nó**: đo ra 0 trên 12 kho. Nghĩa là một Tư vấn vừa nhận
việc và một Senior Coach mở cùng một mô thức thì nhìn thấy y hệt nhau.

Đó không phải thiếu chữ. Đó là thiếu **tầng**.

### Hợp đồng

`G.MT_SAU[id]` — mỗi mô thức, sáu trường chung cộng năm lớp × bốn trường:

```
nha · truong · xaHoi      ba bối cảnh GITA hoá
thoiQuen                  thói quen mô thức này dựng nên
di                        nhóm trong tầm nhìn trăm năm (TANG100)
tuLieu                    tài liệu bổ trợ

c.C1…c.C5 × { lam · chua · viec · len }
```

**Vì sao ba bối cảnh là bắt buộc.** Đích đặt ra là GITA hoá vào gia đình,
vào việc học ở trường, và vào ứng dụng xã hội. Một mô thức chỉ dùng được
trong buổi coach thì nó là kỹ thuật nghề, không phải mô thức sống. Bắt
mỗi mô thức nói được cả ba bối cảnh là cách duy nhất để cái đích ấy không
dừng ở một câu khẩu hiệu.

**Vì sao `chua` là bắt buộc.** Thang năng lực nào cũng có phần "cấp này
chưa làm được gì", và phần này hay bị bỏ vì nó không đẹp. Bỏ nó thì người
ở C2 tưởng mình đã C4, nhận ca quá tầm, và gia đình trả giá. Kể cả C5
cũng phải có `chua` — nói ra chỗ mình chưa làm được là điều giữ cho một
hệ thống trung thực.

### Luật đo được, không phải luật treo tường

Luật "năm lớp phải THẬT SỰ khác nhau" chỉ có nghĩa khi đo được, nên
`G.sauLopKhacNhau()` chạy hai phép:

- hai lớp bất kỳ của cùng một mô thức không được có phần `lam` trùng nhau
  — trùng nghĩa là viết dài hơn chứ không sâu hơn;
- không trường nào dưới 40 ký tự — ngưỡng dùng chung với chuẩn câu mở
  trong kho kịch bản.

`G.sauDoPhu()` đếm độ phủ và **màn hình hiện cả phần chưa viết**. Một
bảng chỉ khoe phần đã xong thì không điều hành được.

Hiện trạng: **42/42 mô thức · 210 lớp · 1.092 trường**, không trường nào
trống, không câu nào dưới 40 ký tự, không hai lớp nào của cùng một mô
thức làm được cùng một việc.

### Viết tiếp cho kho khác

Phác đồ (220), tình huống (250) và ma trận (220×5) chưa có chiều sâu.
Khi viết, giữ nguyên hợp đồng: cùng sáu trường chung, cùng năm lớp bốn
trường. Cùng hình dạng thì một phép đo dùng được cho mọi kho, và màn
`chieu-sau` chỉ cần thêm một bảng chứ không phải dựng lại.

### Chiều sâu là kho NGHỀ

`MT_SAU` và `SAU_*` nằm ở gói `nghe`, không vào gói mẫu công khai. Đây là
bản đồ năng lực nội bộ: nó nói rõ ở cấp nào thì Học viện làm được gì và
chưa làm được gì. Mở ra công khai là chỉ cho đối thủ đúng cách dựng đội
ngũ.

## Bốn tuyến chuyên môn — đường ghép, dựng trước khi cần

Học viện chạy thêm bốn tuyến: **ENGWIN365 · MATH365 · SAT365 · HSA365**.
Chuẩn từng tuyến dựng riêng, hợp nhất vào GITA365 sau. `src/data.tuyen.js`
là chỗ khai tuyến; nó **không chứa chuẩn của tuyến nào**.

### Hai quyết định đã chốt

| | |
|---|---|
| **Năm tầng dùng chung** | Cả bốn tuyến đi theo T1 → T5. Ma trận, cổng nghiệm thu, chuẩn thời gian và cách đồng hành dùng lại nguyên — hợp nhất là ghép dữ liệu, không viết lại khung. |
| **Băng riêng từng tuyến** | Bốn băng giữ nguyên tên và nguyên **ý nghĩa hành động**; chỉ **tín hiệu vào** là riêng. SAT365 đo bằng điểm thi thử, GITA365 đo bằng mức tự chủ. |

Ý nghĩa hành động phải giữ chung, nếu không thì một Coach chạy hai tuyến
sẽ hiểu "học viên băng CAM" theo hai kiểu — và ở tuyến này thì giảm tải,
ở tuyến kia lại giao thêm việc.

### Ba chỗ dễ làm hỏng

**1. Tên gói cũ là ràng buộc cứng.** `nen · nghe · tang1…tang5` **không
được đổi tên**: giấy phép đã cấp cho đội ngũ và cho máy khách đang dùng
đúng những tên ấy, đổi là mọi giấy phép đã phát ra thành giấy lộn. Nên
GITA365 mang cờ `goiCu: true` và giữ tên cũ; tuyến mới mang tiền tố —
`math365-nghe`, `math365-t1`. Bộ kiểm mục 36 chốt: đúng một tuyến được
mang `goiCu`, và đó phải là GITA365.

**2. Khai tuyến sai thì KHÔNG rơi về GITA365.** Ô trống nghĩa là GITA365
(nhờ vậy mọi tài khoản có trước v7.8 giữ nguyên phạm vi). Nhưng ô *có
chữ* mà không nhận ra tuyến nào thì trả về rỗng — tài khoản chỉ còn gói
nền và gặp ngay màn xin cấp phép. Gõ sai `MATH36` mà vẫn cấp GITA365 là
phục vụ sai nội dung trong im lặng: người dùng không biết mình xem nhầm
tuyến, người quản trị không biết mình gõ sai. Cùng một luật ở cả hai
phía — `G.tuyenCuaTK` và `gitaTuyenCuaTK_`.

**3. Tuyến chưa có chuẩn băng thì báo trống.** `G.bangCuaTuyen()` trả
`null`, không mượn tạm băng của GITA365. Mượn tạm cho đỡ trống là cách
chắc chắn nhất để một tuyến chạy sai chuẩn suốt nhiều tháng mà không ai
biết.

### Đặt tên kho của một tuyến

Tiền tố là mã tuyến: `MATH365_BANG`, `MATH365_KICHBAN`, `MATH365_TANG`,
`MATH365_DO`, và nội dung theo tầng thì kết thúc bằng `_T1`…`_T5`. Đặt
đúng quy ước thì `tools/ma-hoa-kho.js` **tự dựng gói**, không phải liệt
kê tay từng kho: thêm một tệp `kho-goc/data.math365.js` là gói có nội
dung ngay. Chưa có kho nào mang tiền tố ấy thì packer bỏ qua tuyến và
nói rõ — **không dựng gói rỗng**, vì một khoá mở ra cái hộp không có gì
làm người cấp giấy phép tưởng tuyến đã sẵn sàng.

### Hai bản chép buộc phải có — và bài kiểm giữ chúng khớp

`server/GITA_CapPhep.gs` chạy trên Apps Script, không `require` được tệp
trong kho mã, nên bảng tuyến phải chép sang đó. Lệch nhau thì máy chủ cấp
khoá cho gói mà ứng dụng không biết xin, hoặc ngược lại. **Mục 36 của bộ
kiểm đối chiếu hai bản mỗi lần chạy** và dừng phát hành nếu lệch.

Mục 36 cũng giữ **`index.html` và `sw.js` liệt kê cùng một bộ tệp**. Đây
là lỗi đã xảy ra thật: ba tệp (`duong-vao.js`, `soat-day-du.js`,
`tuyen.js`) có trong `index.html` mà thiếu trong `sw.js`, nên bản đã cài
chạy thiếu tệp khi mất mạng — và chỉ người dùng offline mới gặp.

### Sáu mốc trước khi một tuyến mở cho khách

Màn **Bốn tuyến chuyên môn** (`src/tuyen.js`, chỉ R01–R02) đo sáu mốc
bằng dữ liệu đang có trong máy, không bằng cờ ai đó tự bật: bốn băng có
tín hiệu vào · năm tầng có nội dung · kịch bản dẫn dắt · bộ đo đầu vào ·
gói cấp phép đã mã hoá · học phí đã chốt. Đủ sáu mốc mới đổi `trangThai`
từ `'chuan'` sang `'chay'` — **ở cả hai bản chép**.

## Tầm nhìn và sứ mệnh — một bản gốc, không hai

Trước v7.7 câu **tầm nhìn** có hai bản khác nhau chạy song song:

| Ở đâu | Câu gì |
|---|---|
| `G.CULTURE.tamNhin` (`src/data.core.js`) | "Đến năm 2030, một triệu người Việt…" |
| `G.UI.vi.gateVisionTitle` (`src/i18n.js`) | "Kiến tạo một hệ sinh thái gia đình phát triển bền vững…" |

Cổng đăng nhập và thanh la bàn bên phải đọc bản thứ hai; màn *GITA 365 là
gì* đọc bản thứ nhất. Kết quả: **cả hai cùng hiện trên một màn hình** —
thanh phải nói một đằng, thân màn nói một nẻo, về cùng một Học viện.

Cách chữa:

1. `G.CULTURE.tamNhin` giữ **câu tầm nhìn** (bản "kiến tạo hệ sinh
   thái…"), vì đó là câu đã đứng ở cổng — bề mặt nhiều người nhìn nhất.
2. Con số có hạn tách ra thành `G.CULTURE.moc2030`. Tầm nhìn nói *loại
   thế giới muốn tạo ra*; mốc nói *con số và hạn*. Gộp rồi gọi chung là
   "tầm nhìn" thì cái nào cũng đọc không rõ. Màn giới thiệu hiện cả hai,
   nhưng gọi đúng tên từng cái.
3. `src/i18n.js` **thôi viết tay** hai chuỗi ấy. Cuối tệp có khối gán
   `G.UI.vi.gateVisionTitle = G.CULTURE.tamNhin.big` (i18n nạp sau
   `data.core.js`). Khối `en` vẫn giữ bản dịch riêng — dịch là việc của
   người, không suy ra được từ bản tiếng Việt.
4. Mục 35 của bộ kiểm chốt lại: `G.UI.vi.gateVisionTitle` phải bằng đúng
   `G.CULTURE.tamNhin.big`, và `moc2030` phải khác `tamNhin`. Gõ tay lại
   chuỗi vào i18n là bài kiểm đỏ ngay.

**Quy tắc rút ra:** một câu mà sản phẩm nói ra ngoài thì chỉ được có một
chỗ viết nó. Chép sang chỗ thứ hai "cho tiện" là hai bản sẽ lệch nhau ở
lần sửa đầu tiên, và không ai biết bản nào mới.

## Bài kiểm phải đo đúng thứ nó định đo

Hai bài kiểm trong dự án này từng đo sai thứ, và cả hai đều đỏ khi hệ
thống tốt lên chứ không phải khi hệ thống hỏng đi:

- **"Phần khoá với Giám đốc đúng 20% ± 2"** — tử số là số màn quản trị
  (gần như không đổi), mẫu số là tổng số màn (tăng mỗi đợt thêm nội dung
  cho gia đình). Thêm một màn cho phụ huynh là bài kiểm đỏ. Đã thay bằng
  phép đo đúng: *màn nào khoá với Giám đốc cũng phải vì một quyền quản
  trị hệ thống, và mọi màn đòi quyền ấy đều thật sự khoá.*
- **"Câu mở dài trên 60 ký tự"** — phạt lối viết gọn. Câu mở hay nhất
  trong kho dài 51 ký tự và không thừa chữ nào. Ngưỡng hạ xuống 40: dưới
  40 thì không thể là câu thật, trên 40 thì phải đọc mới biết và bài
  kiểm tự động không đọc thay người được.

Khi một bài kiểm đỏ, hỏi trước: *hệ thống hỏng, hay bài kiểm đo sai?*
Nới dung sai để cho qua là cách chắc chắn nhất để bài kiểm mất tác dụng.

## Vá dữ liệu sinh sẵn — thứ tự nạp theo chữ cái

`tools/ma-hoa-kho.js` nạp `kho-goc/*.js` theo thứ tự chữ cái. Tệp vá
phải nạp SAU tệp gốc, và dấu gạch ngang xếp TRƯỚC dấu chấm:

```
data.tinhhuong-t5-dich.js   ✗ chạy TRƯỚC data.tinhhuong.js — vá vào mảng chưa tồn tại
data.tinhhuong.t5-dich.js   ✓ chạy SAU
```

Mẫu vá dùng trong `data.scripts.tuvan-ruot.js` và
`data.tinhhuong.t5-dich.js`: chỉ điền trường đang trống, không đụng
trường đã có, và để lại một hàm đếm phần còn nợ (`G.tvConNo()` ở
`src/duong-vao.js`) để bộ rà soát báo đỏ tới khi con số về 0.

## Màn tự soát — chủ hệ thống tự kiểm 100%

`src/soat-day-du.js` · màn `soat-day-du` · chỉ `qt_trang` (R01–R02)

Bộ rà soát ở `tools/ra-soat-day-du.js` chạy ở dòng lệnh, nghĩa là chủ
Học viện phải **tin lời người viết mã**. Màn này bỏ chỗ phải tin đó đi:
bấm một nút, hệ thống tự đếm lại từ dữ liệu đang nạp trong máy, và hiện
ra từng con số. Không có con số nào viết sẵn trong giao diện.

Năm phép soát, chạy ngay lúc dựng màn:

| # | Phép soát | Bắt được gì |
|---|---|---|
| 1 | Con số công bố | Kho nói "1.000 kịch bản" mà đếm ra 940 |
| 2 | Bản ghi thiếu trường | Kho có ô để trống, theo hợp đồng `G.SOAT_BAT_BUOC` |
| 3 | Chất lượng nội dung | Câu cụt · câu chép lại giữa các bản · chữ tạm · thiếu bản dịch |
| 4 | Dựng thử mọi màn | Màn văng lỗi · màn chỉ có khung mà không có ruột |
| 5 | Chỗ trống có chủ đích | Liệt kê đủ, **kèm lý do từng cái** |

**Phần 5 quan trọng ngang bốn phần trên.** Một chỗ trống có lý do và một
chỗ trống bị bỏ quên nhìn giống hệt nhau trong dữ liệu. Liệt kê ra thì
chủ hệ thống tự phán được cái nào chấp nhận được. Bài kiểm mục 34 bắt
buộc mọi ngoại lệ trong `G.SOAT_THA` phải có lý do dài trên 30 ký tự —
ngoại lệ không lý do chỉ là một chỗ trống được tha.

### Bốn bẫy gặp khi dựng màn này

- **Màn tự soát dựng thử chính nó — đệ quy vô tận.** `soatManHinh()` đi
  qua mọi mục trong `G.NAV` và gọi `G.VIEWS[v]()`. Trong danh sách ấy có
  chính `soat-day-du`, mà dựng nó lại gọi `soatManHinh()` — treo trình
  duyệt và làm bộ kiểm phát hành đứng im ở mục 2 hơn mười phút. Màn tự
  soát **không tự soát chính nó được**; phần kiểm nó nằm ở mục 34 của
  `tools/kiem-tra.js`, chạy từ bên ngoài. Cùng lúc thêm bộ nhớ đệm: năm
  phép soát dựng thử hơn một trăm màn nên phải chạy một lần rồi giữ lại,
  nút "Soát lại ngay" xoá đệm trước khi dựng.

- **Chuẩn soát suýt lọt ra gói mẫu công khai.** Một phép sửa khớp nhầm
  danh sách `MO_RA` thay vì `NEN` — mà `SOAT_*` liệt kê tên mọi kho nội
  bộ, trường bắt buộc và số bản ghi phải có. Đưa ra ngoài là vẽ sẵn bản
  đồ kho cho người chưa được cấp phép. Mục 34 nay có bài kiểm chặn.
- **Quét chuỗi con để tìm chữ tạm báo nhầm rất nặng.** "em vẫn đang cập
  nhật nó" là một phương án trả lời thật, "Nhà mình sắp có đợt bận dài"
  là một câu hỏi sát hạch thật, "F-xxx" là mẫu mã gia đình. Phải soi
  **giá trị trọn vẹn** của trường, không quét chuỗi con.
- **Dấu ba chấm không phải chữ tạm.** Trong tài liệu gốc, `…` là cách
  đánh dấu ô **để điền tay** — "Họ và tên: …" trong phiếu in ra. Ô ấy
  trống là đúng chủ đích.

### Khác nhau giữa hai bộ soát

| | Màn trong ứng dụng | `tools/ra-soat-day-du.js` |
|---|---|---|
| Ai chạy được | Chủ hệ thống, không cần máy lập trình | Người có mã nguồn |
| Dựng màn cho | Vai đang đăng nhập | **Cả 15 vai** |
| Khi nào dùng | Bất cứ lúc nào, tự kiểm | Trước mỗi lần phát hành |

Màn trong ứng dụng nói rõ giới hạn ấy ở cuối màn, không giấu.
