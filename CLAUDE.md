# GITA 365 — bản đồ kho cho phiên làm việc

Tệp này để một phiên làm việc **không phải dò lại kho từ đầu**. Dò lại mỗi
lần là tốn tài nguyên vào việc đã biết rồi, và đó là khoản tốn lớn nhất
mà không ai nhìn thấy.

---

## LUẬT CỨNG — ĐỌC TRƯỚC MỌI THỨ KHÁC

**KHÔNG BAO GIỜ đọc bốn tệp này. Chúng do máy sinh ra, không sửa tay.**

| Tệp | Cỡ | Đọc một lần tốn |
|---|---|---|
| `gita-app.js` | 1,4 MB | ~360.000 token |
| `GITA365.html` | 1,8 MB | ~460.000 token |
| `GITA365-v*-gioi-thieu.html` | 2,2 MB | ~540.000 token |
| `ban-xem-thu.html` | 2,1 MB | ~520.000 token |

Một lần lỡ đọc là mất nửa ngày làm việc. Muốn xem nội dung thì đọc **tệp
nguồn** trong `src/`, rồi chạy `node tools/gop-src.js` để dựng lại.

Bốn tệp trên cũng đã bị chặn bằng luật `deny` trong `.claude/settings.json`
— chặn hai lớp vì lớp nhắc-nhở thì phụ thuộc trí nhớ, còn lớp chặn thì không.

---

## Kho này là gì

Web App + bản `.exe` cho Windows. Vanilla JS, HTML, CSS. **Không có bước
biên dịch** — thẻ `<script src>` thường, không phải module.

    src/*.js  (74 tệp)  →  node tools/gop-src.js  →  gita-app.js
    kho-goc/*.js (101)  →  node tools/ma-hoa-kho.js  →  kho/*.enc (7 gói)

**`kho-goc/` và `kho/khoa.json` nằm trong `.gitignore`.** Không có git để
lùi. Bảy tệp `kho/*.enc` đã phát hành **là bản lưu duy nhất của nội dung**
— chúng đã cứu được cả kho một lần ở bản 9.6.

---

## Ba luật của kho nội dung

1. **Hàm không sống trong kho.** `tools/ma-hoa-kho.js` đóng gói bằng
   `JSON.stringify`, mà `JSON.stringify` bỏ hàm. Phần chạy phải ở `src/`.
2. **Kho nạp SAU khi đăng nhập.** Không được đọc `G.KHO_NAO_ĐÓ` ở thời
   điểm tệp vừa tải — lúc ấy chưa có gì.
3. **`kho-goc/` nạp theo thứ tự A–Z**, và dấu gạch ngang `-` đứng TRƯỚC
   dấu chấm `.` khi so tên tệp.

---

## Một lệnh làm hết

    node tools/phat-hanh.js

Nó tự chạy theo thứ tự: mã hoá kho → soi kho đổi gì so với bản đã phát
hành → sinh tệp nạp khoá → gộp mã → dựng bản một tệp → chạy bộ kiểm.

### Lệnh lẻ, dùng lúc đang sửa

| Việc | Lệnh | Mất bao lâu |
|---|---|---|
| Đóng gói lại kho | `node tools/ma-hoa-kho.js` | 5 giây |
| Gộp `src/` thành một tệp | `node tools/gop-src.js` | 2 giây |
| Dựng bản một tệp | `python3 tools/dong-goi.py` | 10 giây |
| **Bộ kiểm — chế độ im** | `xvfb-run -a node tools/kiem-tra.js --im` | ~12 phút |
| Bộ rà soát chỗ trống | `xvfb-run -a node tools/ra-soat-day-du.js` | ~3 phút |
| **Đo khung màn — 4 khổ thật** | `xvfb-run -a node tools/do-khung-man.js --im` | ~6 phút |
| Kho vừa đóng đổi gì | `node tools/soi-doi-kho.js` | 3 giây |
| **Sao lưu kho gốc + khoá** | `node tools/sao-luu.js <thư-mục-NGOÀI-kho>` | ~20 giây |
| Khôi phục từ bản sao lưu | `node tools/khoi-phuc-kho.js <tệp.gita> [ra]` | ~15 giây |
| **Kho lưu trữ — liệt kê bản lưu** | `node tools/kho-luu.js` | 2 giây |
| Soi nội dung ĐÃ MẤT qua lịch sử | `node tools/kho-luu.js --mat --sau 40` | ~3 phút |
| Khoá còn mở được bao nhiêu bản lưu | `node tools/kho-luu.js --soi` | ~4 phút |
| Lấy một kho ở một bản cũ ra | `node tools/kho-luu.js --lay <KHO> <bản>` | 3 giây |
| Tự tìm bản đầy nhất của một kho | `node tools/kho-luu.js --sua <KHO>` | ~3 phút |
| **Đo rò dữ liệu theo vai** | `xvfb-run -a node tools/do-ro-ri.js` | ~3 phút |
| Gom câu chờ chủ hệ về một tờ | `node tools/phieu-quyet.js [ra.md]` | 3 giây |
| Đề bài thị giác → tấm PNG | `node tools/tam-ra-anh.js <đề-bài.json> <thư mục> [khổ]` | ~10 giây |
| Tấm in A4/A5 | `node tools/tam-ra-anh.js <đề-bài.json> <thư mục> a4d` | ~10 giây |
| Bộ tấm PNG → phim mp4 | `node tools/dung-phim.js <thư mục> <ra.mp4> [giây/cảnh]` | ~20 giây |
| Đề bài → nhiều khổ → nhiều phim | `node tools/bo-phim.js <đề-bài.json> <thư mục> --kho=vuong,doc,dung` | ~90 giây |
| Thử trọn đường dựng phim | `xvfb-run -a node tools/thu-phim.js` | ~4 phút |

Bốn lệnh phim cần `ffmpeg` và `ffprobe` (`apt-get install -y ffmpeg`). Không
có thì chúng nói ra chứ không lặng lẽ bỏ qua.

- Phim dựng từ tấm ĐÃ phát hành — luật C19, kiểm bằng `nguon.json`
- Lời đọc và nhạc là TỆP CÓ SẴN, máy chỉ trộn chứ không sinh — luật C20
- Đổi khổ là VẼ LẠI, không đệm đen — `bo-phim.js` gọi bộ vẽ một lần cho
  mỗi khổ

**Luôn dùng `--im`.** Bộ kiểm đầy đủ in ra 867 dòng, 80.614 ký tự. Chế độ
im in ra 184 ký tự — **giảm 438 lần** — và vẫn chạy đủ ~1045 phép đo, chỉ
bớt phần khoe. Chỗ đỏ in kèm số mục để biết đường tìm.

Bộ kiểm cần máy chủ tĩnh ở cổng 8099; `.claude/khoi-dong.sh` bật sẵn mỗi
phiên. Cần `xvfb-run -a` vì Playwright chạy trình duyệt thật.

---

## Sửa một chỗ thì phải đụng những đâu

Thêm **một màn hình mới**, đủ sáu chỗ, thiếu chỗ nào bộ kiểm cũng bắt:

1. `src/ten-man.js` — phần chạy và `G.VIEWS['ten-man']`
2. `tools/danh-sach-src.json` — khai tên tệp, không khai thì không được gộp
3. `src/data.core.js` → `G.NAV` — mục trong cột trái, kèm `perm`
4. `src/i18n.js` — bản tiếng Anh của mục ấy
5. `kho-goc/data.*.js` — kho chuẩn, nếu màn cần dữ liệu
6. `tools/ma-hoa-kho.js` — xếp kho vào gói `NEN` hay `NGHE`
   **và** `src/kho-khoa.js` → `G.THUOC_CAP_PHEP`

Thêm **một kho mới** vào gói nghề mà quên khai ở `THUOC_CAP_PHEP` thì:
máy vừa đăng nhập Coach, đăng nhập lại bằng phụ huynh, phụ huynh **giữ
nguyên** dữ liệu nghề trong bộ nhớ. Bộ kiểm mục 40 bắt chỗ này.

---

## Luật phân luồng dữ liệu — chỗ dễ sai nhất

Kho đi theo **quyền của màn hình đọc nó**, không theo cảm giác.

- Mọi màn đọc kho ấy đều khoá ở quyền nghề → kho vào gói **NGHE**
- Có màn của khách hàng đọc → gói **NEN**
- Kho phục vụ nhiều phạm vi cùng lúc → **cắt theo bản ghi**, hai nửa cùng
  tên kho ở hai gói, và khai tên vào `G.KHO_TRAI_RA` để lúc mở thì NỐI
  chứ không GÁN ĐÈ

**Lọc trên màn hình KHÔNG PHẢI bảo vệ dữ liệu.** Gửi xuống rồi thì mở
công cụ nhà phát triển là đọc được hết. Lỗi này đã xảy ra ba lần trong kho
này: KICHBAN (8.9), CV_MUC (9.7), và 17 kho nghề (9.8).

---

## Trước khi đẩy

1. `node tools/soi-doi-kho.js` — có bản ghi nào **ít đi** không? Nội dung
   ít đi hầu như luôn là hỏng, không phải sửa.
2. `xvfb-run -a node tools/kiem-tra.js --im` — đỏ là **không phát hành**,
   không có ngoại lệ.
3. `xvfb-run -a node tools/ra-soat-day-du.js`
4. `xvfb-run -a node tools/do-khung-man.js --im` — 183 màn × 4 khổ màn ×
   2 vai. Hai bộ trên đọc CHUỖI HTML và chạy ở đúng một khổ để bàn, nên
   không bộ nào trả lời được câu của người cầm điện thoại.
5. Bump số bản ở `src/data.core.js`, `desktop/package.json`, `sw.js`
6. `node tools/sao-luu.js <thư-mục-ngoài-kho>` — kho-goc/ và khoa.json
   KHÔNG có trong git; không sao lưu thì một lượt mất máy là mất hẳn.

**Không bao giờ `git add kho-goc/` hay `kho/khoa.json`.**

---

## Hai núm nhìn màn — `src/thu-phong.js`

Người dùng đổi được hai thứ, và hai thứ ấy KHÁC nhau:

- **KHỔ** (chỉ hiện trên màn chạm) — *Vừa màn* là bản điện thoại một
  cột; *Toàn cảnh* dựng bố cục **1280px** rồi thu cho vừa màn, để nhìn
  trọn một bảng rộng rồi chụm ngón tay phóng vào. Làm bằng cách đổi
  `width` của thẻ viewport, KHÔNG bằng `transform: scale()` — scale thì
  chữ mờ, chỗ bấm lệch chỗ nhìn, `position:fixed` chạy loạn.
- **CỠ** — sáu nấc 70→150%, đặt `zoom` ở thẻ gốc. Chạy cả trên máy tính.
  Phím tắt `Ctrl +` · `Ctrl −` · `Ctrl 0`.

Hai chỗ đã sập khi làm, ghi lại để không lặp:

1. Khai `width=1280` rồi **để trình duyệt tự thu** thì chỉ chạy khi BẤM
   nút; mở sẵn chế độ ấy từ lúc tải trang thì trang nằm nguyên tỉ lệ
   1:1 và người dùng chỉ thấy góc trên bên trái. Phải tự tính
   `initial-scale` và `minimum-scale`, và **làm tròn XUỐNG** — làm tròn
   gần nhất thì mép phải bị cắt mất một vệt.
2. Khi bố cục rộng hơn màn, Chromium và Safari **tự thổi cỡ chữ** lên
   không đều: tiêu đề nở gấp đôi còn ô bảng thì không, cả bố cục vỡ.
   Chặn bằng `text-size-adjust:100%` ở `html` — đặt `100%` chứ không
   đặt `none`, vì `none` khoá luôn phép phóng chữ của người mắt kém.

---

## Thanh điều hướng dưới đáy — `src/thanh-duoi.js`

Chỉ hiện ở khổ ≤860px. Bốn ô cộng nút Menu; menu ba gạch ở trên vẫn giữ
nguyên. Lý do: cầm máy một tay thì góc trên bên trái là góc xa ngón cái
nhất, còn đáy màn là chỗ ngón cái nằm sẵn.

Bốn ô lấy từ **ba nguồn, theo thứ tự tin cậy**: `G.DUOI[portal]` (lời
khai của chủ hệ, ở `src/data.core.js`) → `G.PORTALS[vai].home` → thứ tự
`G.NAV` LẤP chỗ còn trống. Khai sai không vỡ: màn nào vai không mở được
thì bị bỏ qua và nguồn ba lấp nốt.

**Vì sao phải khai tay, dù luật kho là đừng dựng bản thứ hai:** bản đầu
tôi lấy bốn mục đầu tiên trong `G.NAV`, và đo ra thì cả sáu vai có chung
ba ô — "Đã đổi gì · KPI · GITA là gì" — vì nhóm đầu của `G.NAV` là nhóm
giới thiệu. Thứ tự `G.NAV` là thứ tự **ĐỌC**, không phải thứ tự **HAY
DÙNG**; thứ chưa có trong kho thì phải khai, không suy ra được. Ô `star`
cũng không dùng được: 101 mục mang star.

**Thanh che mất dòng cuối là lớp lỗi riêng của nó** — `do-khung-man.js`
có phép đo canh, và nó đã đỏ thật hai lần ở màn trợ lý: một lần vì cửa
sổ trò chuyện tự tính chiều cao mà không biết có thanh, một lần vì
`body.man-chat main` nặng hơn luật lề chung nên ăn mất chỗ chừa.

---

## Chuẩn giao diện điện thoại — bốn luật nền, `assets/style.css`

Cả bốn đều do `tools/do-khung-man.js` canh, và cả bốn đều từng sai thật.

1. **Vùng an toàn.** `index.html` khai `viewport-fit=cover` VÀ
   `apple-mobile-web-app-status-bar-style: black-translucent` — tức là
   ĐÃ NHẬN VIỆC tự lo phần dưới tai thỏ và dưới vạch về nhà. Bốn biến
   `--sat --sab --sal --sar` gom một chỗ; mọi thứ neo vào đáy thanh
   trên phải dùng `--top-tong`, **không** dùng `--top-h`.
2. **`100vh` không bao giờ đứng một mình.** Thanh địa chỉ của trình
   duyệt thu vào rồi thò ra, mà `100vh` luôn tính theo lúc nó đã thu.
   Viết `min-height:100vh; min-height:100dvh` — dòng trước là bản lùi.
3. **Ô nhập phải từ 16px trên màn chạm.** Dưới mức ấy Safari trên
   iPhone phóng CẢ TRANG khi người ta chạm vào ô, và không thu lại khi
   gõ xong. Đây là chỗ **đáng dùng `!important`**: 16 là ngưỡng cứng
   của nền tảng, không phải một ý thích, nên nó phải thắng mọi luật
   của thành phần (`.ch-go input`, `.cs-o textarea`…). Không dùng thì
   phải đi nâng độ nặng cho từng thành phần, mãi mãi.
4. **Vùng chạm 32px, và đo VÙNG CHẠM chứ không đo cái ô vuông.** Một ô
   tích 16px nằm trong nhãn cao 44px thì bấm vẫn trúng. Ngưỡng nâng ở
   khối `@media(pointer:coarse)` — hỏi con trỏ, không hỏi bề ngang màn,
   vì máy bảng 1024px vẫn là ngón tay.

Màu thanh trình duyệt (`meta[name=theme-color]`) **đọc từ `--bg-0` lúc
chạy**, không gõ lại bằng tay — hai mã gõ tay cũ lệch với nền thật đủ
để thấy một vệt khác màu ở đầu trang.

---

## Cách viết trong kho này

- Tiếng Việt, câu ngắn, không dùng từ học thuật khi có từ thường thay được
- Lời chú giải nói **VÌ SAO**, không nói *cái gì* — đọc mã là biết cái gì
- Chỗ nào từng hỏng thật thì ghi lại đã hỏng thế nào, để lần sau không lặp
- Màu: lấy từ `G.MT_BANG`. **Cấm** `#F5B942`, `#FFD98A`, `#FF7A45` trong
  `src/`, `assets/style.css`, `index.html`
- Mọi chữ do người dùng nhập phải qua `U.h()` trước khi ghép vào HTML.
  `U.tbl` chỉ thoát phần đầu cột, **không** thoát ô — tự thoát lấy.
- Trường không áp dụng thì **bỏ hẳn khoá**, đừng để `null` hay `[]`. Vắng
  mặt nghĩa là không áp dụng; rỗng nghĩa là đáng lẽ phải có giá trị, và
  bộ soát trường trống sẽ báo đỏ.

---

## Ba lớp lỗi CHỈ hiện ra trên điện thoại

Tìm ra ở 9.99.51 bằng cách đo trên khổ màn thật, không bằng cách đọc mã.
Cả ba đều sống qua rất nhiều bản vì mọi bộ soi đều chạy ở khổ để bàn.

1. **Độ nặng chọn lọc trong `@media`.** `.shell` trong khối
   `max-width:860px` THUA `.shell.no-right` ở ngoài — hai lớp nặng hơn
   một lớp, kể cả trong `@media`. Hậu quả: trên màn 390px vùng nội dung
   rộng 268px thay vì 388px, ở MỌI màn.
2. **Khối `@media` đặt trước lớp nó muốn đè.** Cùng độ nặng thì dòng
   đứng SAU thắng, nên khối ấy không làm gì cả — và không báo gì cả.
   Khối khổ chạm phải nằm CUỐI `assets/style.css`.
3. **`.row` là flex và flex không tự xuống dòng.** Một hàng hai nút nhãn
   dài cần 539px trong cột rộng 358px thì nó không co lại — nó đẩy CẢ
   TRANG cuộn ngang. Đã mở `flex-wrap:wrap` cho `.row` ở khổ ≤600px.

Và một lớp thứ tư, nặng nhất, không phải chuyện khổ màn: bộ sinh SEO
chèn khối vào giữa thẻ `<meta name="rights"` và **cắt đôi thẻ ấy**. Nửa
sau rơi xuống thân trang, hiện ra thành chữ ở đầu mọi trang — và chính
thẻ khai quyền sở hữu trí tuệ thì không còn tồn tại. Trên màn để bàn nó
khuất sau thanh trên, nên không ai thấy. `do-khung-man.js` nay canh
đúng lớp ấy: thân trang không được có chữ nằm trần ngoài mọi thẻ.

---

## Ba cái bẫy của phép dò chữ tiếng Việt

Cả ba đều đã cắn kho này, và cái thứ ba NGƯỢC với cái thứ hai.

1. **`\b` không khớp chữ có dấu.** `/\bvà\b/` không bao giờ khớp, vì "à"
   nằm ngoài lớp `\w` của JavaScript nên sau nó không có biên nào. Phép
   chặn im lặng suốt.
2. **Dò chuỗi con thì bắt oan.** `boDau('hư')` = `hu`, và `hu` nằm trong
   "chưa", "chuẩn", "thứ" — một bài sạch bị báo 13 câu dán nhãn.
3. **Dò theo biên từ bằng khoảng trắng cũng sai** (9.99.54), vì **tiếng
   Việt không phân từ bằng khoảng trắng** — khoảng trắng ngăn ÂM TIẾT,
   không ngăn TỪ. "tin" đứng riêng một âm tiết trong "thông tin", "tin
   nhắn", "tin cậy". Cách dùng: dò biên âm tiết rồi **TRỪ cụm ghép đã
   biết** (`DN_TRU`), danh sách trừ ngắn và chỉ dài thêm khi bắt oan
   THẬT — thêm cho đủ là mở đường cho chữ lọt.

---

## Trợ lý hình ảnh — cổng Điều Nhỏ (9.99.54)

Theo bản đặc tả `GITA365-IMG-AGENT-P1-KNOWLEDGE-CORE` của chủ hệ.

Cổng thiết kế cũ hỏi hai câu, và **cả hai đều là câu hỏi về TẤM HÌNH**:
cho ai xem, và làm MỘT nhiệm vụ gì. Thiếu hẳn câu hỏi về NGƯỜI. Nay ba
câu — `G.TG_DIEUNHO`:

- **DN1 Ai xem** — đã có, đọc từ ô `nguoiXem`
- **DN2 Điều nhỏ** — *mới*: xem xong thì người ta LÀM ĐƯỢC gì
- **DN3 Thời điểm đời** — *mới*: họ gặp tấm này vào lúc nào

Thiếu thì hỏi theo **khuôn bốn câu** `G.TG_KHUON4` (lắng → nói điều đã
hiểu → hỏi rõ → nói bước tiếp), không quăng ra một dòng báo đỏ.

**Chỗ cố ý không theo bản đặc tả:** bản đặc tả nhận điều nhỏ bằng bảng
động từ có "hiểu", "nhớ", "tin". Ba từ ấy không quan sát được, và
`KN_CHUAN_NGHE` CN1 của chính kho này đã cấm đúng chúng. Nhận ở cổng
hình mà cấm ở cổng nội dung là hai cửa của một Học viện nói hai điều
khác nhau — nên ở đây **chặn**.

## Trợ lý hình ảnh — bốn bảng quyết định (9.99.55)

Phần 2–4 của bản đặc tả. Màn *Kiến trúc sư thị giác → ngăn **Ý tưởng***
(`src/kien-truc-thi-giac.js`), cửa máy chủ `docYTuong`.

| Kho | Bản chép ở máy chủ | Việc |
|---|---|---|
| `G.TG_YDINH` (7) | `Y_DINH` | Đọc ra ý định theo dấu hiệu bề mặt |
| `G.TG_QUYET` (8) | `QUYET` | Ý định × người xem → khổ + sắc khí |
| `G.TG_CHU_TRAN` (4) | `CHU_TRAN` | Trần ký tự cho chữ trên ảnh |
| `G.TG_ANDU` (5) | `AN_DU` | Ngân hàng ẩn dụ cho góc nhìn thứ hai |

**Ba chỗ máy CỐ Ý không làm thay** — cả ba đều có phép đo riêng ở mục 71,
và cả ba đều đã được phá thử để xem có đỏ đúng chỗ không:

1. Không có dấu hiệu nào thì **nói là không biết**, không rơi về một ý
   định mặc định. Một cái đoán trình ra như một đề nghị thì người ta tin
   nó đã được cân nhắc.
2. Hai nhóm người xem cho ra hai khổ khác nhau thì **không chọn giùm** —
   đó là dấu hiệu cần HAI TẤM. Chọn đại một khổ thì một nhóm nhận tấm
   sai khổ mà không ai biết, vì tấm vẫn ra đúng quy cách.
3. Không có ẩn dụ nào hợp thì góc ấy **để trống và nói ra**, không rơi
   lặng lẽ về khuôn an toàn — nếu không thì người chọn thấy hai ý giống
   nhau và tưởng cả ba góc đều đã được cân nhắc.

**Thứ tự năm lớp của đề bài CHÍNH LÀ trọng số** (`dungLop5`): bộ tạo ảnh
nghe phần đầu rõ hơn phần cuối. Đảo lớp *Cảnh báo kỹ thuật* lên đầu thì
tấm về đúng kỹ thuật mà sai chuyện, và không phép chấm nào bắt được.

**Chống tự khen** (`chamThiGiac`): tám trong mười lượt gần nhất từ 90
điểm trở lên thì lượt sau **bị chặn** cho tới khi người chấm viết một
câu, và câu ấy ở lại trong sổ kèm tên người viết. Máy không kết luận là
chấm dễ — đội vẽ lên tay thật cũng ra đúng con số ấy. Cùng luật L-02 của
bảng lương: máy không cắt và cũng không tha.

Và một cái bẫy đã cắn thật ở đây: hồ sơ phiên mang tên ô là **`hoSo.u`**,
không phải `hoSo.username`. Gõ nhầm thì JavaScript không báo gì cả — nó
trả `undefined`, câu giải thích ở lại trong sổ mà **không có tên người
viết**, tức là mất đúng nửa có giá trị của phép ghi. Bộ thử bắt được vì
nó đòi **đúng tên**, không đòi "có ô `boiAi`".

## Trợ lý hình ảnh — góp ý vá vào đúng lớp (9.99.56)

Phần 5 của bản đặc tả. Màn *Kiến trúc sư thị giác → ngăn **Góp ý***,
cửa máy chủ `docGopY`; kho `G.TG_SUA_DAU` (5 lớp) và `G.TG_ADN` (5 thứ
không được động tới).

Luật `TG_LOP5_LUAT.vaDungLop` và `.khongXeDNA` đã có từ 9.99.55 **ở dạng
chữ**. Bản này dựng máy canh chúng — một luật không máy nào canh thì nó
là một lời chú giải.

**Nói bằng tiền:** mỗi lượt vẽ lại tốn một lượt gọi bộ tạo ảnh ngoài.
Góp ý "nhìn lạnh quá" là lớp Cảm xúc; đem đi sửa Bố cục thì tấm mới vẫn
lạnh y hệt. Sai lớp không lộ ra ở khâu nào — nó lộ ra ở tấm sau, và lúc
ấy không ai truy được vì sao.

**Cổng ADN có hai chỗ, và chỉ chỗ thứ hai mới là cổng:**

- `docGopY` chỉ **ĐỌC** — nó tách câu xé bảng nhận diện ra và nói ai đổi
  được, nhưng không chặn gì vì nó không ghi.
- `banMoiThiGiac` **GHI**, nên cổng có răng nằm ở đó: `y.gopY` xé ADN
  thì bản mới không được sinh (`code:'XEADN'`).

Đặt cổng ở chỗ đọc thôi là cổng cảnh báo. Người ta đọc, thấy hợp lý với
tấm này, rồi vẫn bấm sửa — và mỗi lần nhân nhượng **đều hợp lý ở tấm
ấy**. Mười lần thì bảng nhận diện không còn, mà không ai quyết định bỏ
nó cả.

**Câu chạm ADN không được đi tiếp vào phép chia lớp.** Vừa bị từ chối
vừa được chỉ đường đi sửa thì người ta làm theo vế thứ hai — vế thứ hai
là vế nói cách làm.

### Hai chỗ phá thử đã dạy lại, ghi để không lặp

1. **Một phép đo chỉ đúng khi cái nó đo CÓ THỂ sai.** Bản đầu của phép
   đo cổng ADN dùng một câu xé ADN **không mang dấu hiệu lớp nào**. Phá
   thử — cho câu xé đi tiếp vào phép chia lớp — mà phép đo vẫn XANH, vì
   câu ấy chẳng rơi vào lớp nào cả. Nay câu thử cố ý mang cả hai: "đổi
   màu" là ADN1, "gắt" là L3.
2. **Danh sách trừ ở đây KHÔNG cần, và giữ nó là tệ hơn bỏ.** Bản đầu có
   `TG_SUA_TRU` chép theo `DN_TRU`; phá thử thì bỏ hẳn nó đi mọi phép đo
   vẫn xanh. Lý do: `DN_CAM` **buộc** phải chứa âm tiết trần "tin" (một
   động từ người ta viết thật), còn `TG_SUA_DAU` không bị ép — mọi dấu
   hiệu dễ bắt oan đều viết được thành cụm hai âm tiết: *sai dấu* chứ
   không phải *dấu*, *sáng quá* chứ không phải *sáng*, *ngón tay* chứ
   không phải *ngón*. **Chặn ở chỗ CHỌN DẤU HIỆU rẻ hơn và chắc hơn
   chặn bằng một danh sách trừ** — danh sách trừ phải dài thêm mãi, cụm
   hai âm tiết thì đúng một lần. Một danh sách không chặn gì làm người
   đọc sau tưởng cái bẫy đã được lo, rồi thôi không nghĩ tới nữa.

Và một dấu hiệu phải loại: **`nhân vật` trần không dùng được cho L2**,
dù nó đúng là chuyện của L2 — chính L4 cũng nói *"ánh nhìn của nhân
vật"*, nên mọi góp ý về cảm xúc đều bị kéo thêm về L2. L2 dò **hình của
lời xin** (thiếu · thêm · sai · đổi), không dò danh từ.

## Trợ lý hình ảnh — dòng truy nguồn trên tấm (9.99.57)

Phần 6 của bản đặc tả. Kho `G.TG_TRUY`; vẽ ở `src/ve-thi-giac.js →
dongTruyNguon()`, chèn **ở đúng một chỗ** — ngay sau `b.ve()` trong
`G.veThiGiac`, nên cả mười sáu bộ vẽ đều có, và bộ vẽ thứ mười bảy viết
sau cũng tự có.

**Dấu ở góc nói tấm này CỦA AI. Dòng truy nguồn nói tấm này LÀ TẤM
NÀO.** Một tấm rời khỏi hệ thì đi một mình; lúc nó hiện lên ở chỗ không
ai ngờ, câu hỏi đầu tiên là "ra khỏi hệ lúc nào, qua cửa nào" — mà kho
có hàng trăm tấm cùng loại hình, cùng bảng màu, nhìn y hệt nhau.

**Chỉ mã, không tên người.** Tấm đi tới tay khách. Đặt tên người xuất
lên tấm là đưa một nhân sự ra trước mặt người lạ, để đổi lấy thứ nhật ký
`TG_XUAT` đã giữ rồi. Mã dẫn về sổ; sổ mới nói tên.

**Cố ý KHÔNG làm dấu chìm giấu trong bit thấp của điểm ảnh**, dù bản đặc
tả đề nghị. Tấm dựng bằng SVG rồi kết thành PNG, mà mọi nền tảng đăng
bài đều nén lại một lần nữa — một lần nén là bit thấp bay sạch, người
chụp màn hình cũng xoá nó. Dựng một lớp bảo vệ không giữ được là **tệ
hơn không dựng**: người ta tin tấm đã được đánh dấu rồi thôi không nghĩ
tới nữa.

### Hai con số phép đo bản in đã bắt ngay

- **Cỡ gốc phải đúng `DAU_CHU_NHO` (10,5), không được nhỏ hơn.**
  `tiDau()` nâng cỡ sao cho một chữ 10,5 điểm ảnh đạt đúng 2,1mm khi
  in. Đặt 8,5 cho "nhạt đi" thì ra `8,5/10,5 × 2,1 = 1,70mm` — dưới
  ngưỡng C22. **Muốn nhạt thì hạ độ đục, đừng hạ cỡ chữ:** độ đục không
  đổi theo khổ in, cỡ chữ thì đổi.
- **Lề dọc không được nhỏ hơn lề ngang, và phải cộng phần đuôi chữ.**
  `y` là đường chân, còn hộp bao chạy quá nó; phép đo bản in đo **hộp
  bao**. Lấy lề dọc bằng 55% lề ngang ra 4,0mm — dưới `LE_XEN_MM = 5`,
  và máy xén giấy có sai số.

## Trợ lý hình ảnh — kênh phát · giờ vàng · gỡ bài (9.99.58)

Phần 9 của bản đặc tả. Màn *Kiến trúc sư thị giác → ngăn **Đăng · Gỡ***;
cửa `dangTamThiGiac` · `goTamThiGiac` · `soDangBai`; bảng
`dangTamThiGiac` trong `may-chu/csdl.sql`; kho `G.TG_KENH` (6) ·
`G.TG_GIO_VANG` (3) · `G.TG_GO_LY_DO` (5).

**Chỉ đăng thứ đã PHÁT HÀNH.** Bậc `duyet` là người duyệt đã gật; bậc
`phatHanh` là bản cuối đã chốt. Cho đăng ở bậc duyệt thì một bản còn
đang sửa chữ đi ra ngoài, và tấm ngoài kia không sửa lại được nữa.

**Sai khổ thì nền tảng TỰ CẮT — và nó cắt ở GIỮA.** Thứ bị cắt thường
là dòng mời ở đáy hoặc dấu thương hiệu ở góc, đúng hai thứ quan trọng
nhất, và không báo gì cả.

**Giờ vàng NÓI RA, không chặn** (05:30–06:30 · 11:30–12:30 ·
20:30–22:00). Một tấm chúc Tết phải đi đúng giao thừa; một tấm xin lỗi
phải đi ngay. Nhưng đăng ngoài khung **phải viết một câu** — không bắt
viết thì mọi lượt đều đăng ngoài khung, và bảng giờ vàng thành một lời
chú giải. Giờ đọc theo **múi giờ Việt Nam** (`LECH_VN`), không theo giờ
máy chủ: Workers chạy UTC, và lệch bảy tiếng thì khung *tối* rơi vào
giữa trưa — im lặng, vì cả ba khung vẫn trả về một cái tên nghe hợp lý.

### Nút GỠ là chỗ dễ dựng sai nhất, và dựng sai thì tệ hơn không có

**Gỡ trong sổ KHÔNG gỡ được ở ngoài.** Tấm đã đăng thì nằm ở máy chủ
của nền tảng ấy; ai đã lưu về hoặc chụp màn hình thì vẫn giữ. Sổ của
Học viện chỉ ghi được rằng Học viện **đã QUYẾT** gỡ.

Nên hai ô tách hẳn nhau, ở cả bảng lẫn màn hình:

| Ô | Ai điền | Là gì |
|---|---|---|
| `goTrongSo` | máy, ngay khi bấm | Học viện đã quyết gỡ |
| `daGoNgoai` | người, sau khi vào kênh gỡ | **lời khai**, không phải phép đo |

Máy **không tự đánh dấu** `daGoNgoai` vì máy không nhìn thấy kênh ngoài
— một ô máy tự đánh dấu mà không đo được là *một lời nói dối mang dấu
của hệ thống*. `soDangBai` nêu riêng chỗ hở giữa hai ô, cùng luật với
đối chiếu ngân hàng; gộp thành một con số "còn tồn" thì một tấm quyết
gỡ ba tuần trước nằm chung rổ với một tấm vừa quyết gỡ năm phút trước.

Gỡ phải chọn lý do **và** viết một câu — gỡ không câu nào thì lần sau
người khác dựng lại đúng tấm ấy, vì không có gì nói cho họ biết vì sao.

## Trợ lý hình ảnh — đo phễu · sổ truy vết · ứng phó (9.99.59)

Phần 10, phần cuối của bản đặc tả. Màn *Kiến trúc sư thị giác* → hai
ngăn **Phễu · Đời tấm** và **Ứng phó**; cửa `doPheuThiGiac` ·
`doiMotTam`; kho `G.TG_PHEU` (8) · `G.TG_UNGPHO` (10).

### Luật của cả phần: KHÔNG BAO GIỜ gộp cột đo được với cột lời khai

Phễu có hai nửa, khác hẳn nhau ở chỗ con số **đến từ đâu**:

| Nửa | Bậc | Con số từ đâu |
|---|---|---|
| Đo được | đề xuất → duyệt → phát hành → đăng → gỡ | máy đếm thẳng trong sổ |
| Lời khai | lượt xem · lượt bấm · lượt nhắn về | người gõ từ bảng nền tảng |

Đặt một con số gõ tay cạnh một con số đo được — cùng hàng, cùng kiểu
chữ — thì người đọc tin cả hai như nhau. Mà con số gõ tay thì gõ nhầm
được, gõ đẹp lên được, hoặc **quên gõ mà hàng vẫn đầy**.

Nên máy chủ **không trả về ba bậc lời khai, kể cả với giá trị 0**. Một
số 0 nằm cùng bảng với sáu số đo được đọc ra là *"chưa ai xem"*, không
đọc ra là *"máy không biết"* — và hai câu ấy khác hẳn nhau. Cùng luật
với ô `daGoNgoai` của phần 9.

Kéo theo: **tỷ lệ chỉ tính được trong MỘT nửa.** Lấy "lượt xem" chia
"đã phát hành" là chia một lời khai cho một phép đo, và kết quả mang
tên của phép đo trong khi nó thừa hưởng mọi sai của lời khai.

### Sổ truy vết — `doiMotTam`

Nhật ký `audit` đã ghi đủ từ lâu (`TG_DEXUAT` · `TG_BAC` · `TG_XUAT` ·
`TG_DIRA` · `TG_DANG` · `TG_GO`), nhưng nằm rải trong sổ chung của cả
hệ xếp theo thời gian — muốn đọc đời một tấm thì phải lọc bằng mắt qua
hàng nghìn dòng. **Một sự thật CÓ mà không đọc ra được thì trên thực tế
là KHÔNG CÓ.** Cửa này gom đúng một tấm, xếp **tăng dần**, và nêu chỗ
hở *trước* dòng thời gian — một dòng nằm trong dòng thời gian thì người
ta đọc như một việc đã qua.

### Mười tờ ứng phó — `G.TG_UNGPHO`

RB-01…RB-10, viết **trước**, vì lúc chuyện xảy ra thì không ai ngồi
nghĩ ra quy trình được. Ba luật, cả ba đều có phép đo ở mục 71:

1. **Mỗi bước phải LÀM ĐƯỢC**, không phải một lời khuyên. *"Xử lý
   nhanh"* không phải một bước; *"gọi cửa `goTamThiGiac` với lý do
   `PHAP_LY`"* thì là. Dưới ba bước thì nó là một câu, không phải một
   quy trình.
2. **Mỗi tờ khai AI LÀM** — không khai thì lúc gấp ai cũng tưởng người
   kia đang làm.
3. **Mỗi tờ khai TRONG BAO LÂU** — không có mốc thì việc gấp và việc
   thường trôi cùng một nhịp, và nhịp ấy là nhịp của việc thường.

Màn xếp tờ **GẤP lên trước**, không xếp theo mã: xếp theo mã thì tờ
*"bộ kiểm đỏ trước giờ phát hành"* nằm cạnh tờ *"người trong ảnh rút
lời đồng ý"* như thể hai việc cùng một nhịp — mà chúng không cùng.

## Trợ lý hình ảnh — khép lại (9.99.60)

Bản đặc tả GIDA **đã xong cả mười phần**. Bản này vá hai chỗ chính lượt
soi lại tìm ra, chứ không thêm phần mới.

**1. Nửa lời khai của phễu chưa có chỗ ghi.** 9.99.59 khai ba bậc XEM ·
BAM · NHAN_VE là *lời khai* rồi không dựng chỗ nào để ghi — theo đúng
luật của chính kho này thì mục ấy không phải việc chờ, nó là **một lời
than**. Nay có bảng `khaiSoNgoai` và cửa `khaiSoKenhNgoai`.

Ba luật của bảng ấy:
- Một dòng là **một lượt đọc bảng**, không phải một con số cộng dồn. Ghi
  đè một ô "tổng" thì mất hẳn phần lịch sử, và không ai biết là đã mất.
- **Ngày đọc bảng do người khai**, máy không lấy ngày hôm nay thay —
  người ta hay đọc bảng tuần trước rồi mới ngồi gõ.
- **Để TRỐNG khác hẳn số 0**: trống là không đọc được, 0 là đọc được và
  bằng không. Phép cộng bỏ qua ô trống và **đếm riêng cỡ mẫu** (`tren`).

Có chỗ ghi **không** làm con số thành phép đo — nó vẫn ở ngăn lời khai,
vì máy chủ vẫn không nhìn thấy kênh ngoài. Cái nó có thêm là *ai gõ và
gõ lúc nào*: kiểm lại được, chứ không đúng hơn.

**2. Mười tờ ứng phó trỏ vào chỗ nào thì phải KHAI, không để phép đo dò
chữ.** Bản đầu của phép kiểm dò tên cửa trong câu văn của từng bước. Phá
thử mới thấy nó **câm đúng ở chỗ nguy hiểm nhất**: đổi `goTamThiGiac`
thành `goTamHinhAnh` thì phép dò không nhận ra cái tên mới nên không bắt
gì cả. **Phép dò chữ chỉ kiểm được những tên nó ĐÃ BIẾT — tức là đúng
những tên không có nguy cơ.** Nay mỗi tờ khai thẳng ô `cua` và `congCu`,
và mỗi ô được đối chiếu với cửa máy chủ thật / tệp thật trên đĩa.

---

## Một phép kiểm chưa từng đỏ thì chưa phải phép kiểm

Viết xong một phép kiểm mới thì **cố tình làm hỏng dữ liệu** để xem nó có
đỏ đúng chỗ không, rồi mới trả dữ liệu về. Luật này đã bắt được ba phép
kiểm câm trong kho này.

### Và phá thử phải xem cả DÒNG CHI TIẾT, không chỉ xem màu

Một mục **đỏ mà in ra câu khoe** thì gần như vô dụng: người đọc mất thêm
một vòng đi tìm, và lần thứ ba nó giấu luôn một phép đo câm.

Nguyên nhân luôn là một: điều kiện của `bao()` và điều kiện của câu chi
tiết là **hai bản chép viết tay của cùng một biểu thức**, và thêm cờ mới
thì người ta chỉ sửa bản thứ nhất. Đúng thứ luật của kho cấm — bản thứ
hai của một sự thật.

Chuyện này đã xảy ra **ba lần** ở mục 71. Nay biểu thức tính **một lần**
vào `const tgDat`, và cả hai chỗ cùng đọc nó; thêm cờ mới thì sửa đúng
một chỗ. Mục nào còn giữ hai bản chép thì đấy là chỗ sắp trôi tiếp.

---

## Sổ chờ: 26 mục câm đã khai xong (9.99.61)

Tới 9.99.60 có **26 mục trong 10 sổ chờ cũ chưa khai cách đo**, dựng
trước 9.99.49. Chưa khai thì bộ soát không tự đóng được mục ấy khi nó
xong, và nó nằm lại mãi. Nay **0 mục chưa khai**: 11 đo được, 23 khai
thẳng là máy không đo được **kèm lý do thật**.

### Kiểu đo thứ năm — `daChot`

Bốn kiểu cũ đo một kho BÊN NGOÀI mục. Kiểu này đo **chính mục**: một
câu hỏi mang sẵn câu trả lời trong ô của nó thì nó đã xong.

Vì sao cần: BLV · BV · CS · SV · T5P đều dựng theo lối *hỏi rồi ghi câu
trả lời ngay cạnh*. Chủ hệ trả lời, người viết ghi vào `daChot`, rồi
**không ai gỡ mục khỏi sổ**. Sau vài bản sổ có cả câu đã trả lời lẫn câu
chưa, và người đọc không phân biệt được — lúc ấy cả sổ thành vô dụng,
đúng như `TR_CHUA` đã từng mục ở 9.99.7.

Nó bắt ngay **bốn mục đã trả lời từ 9.59 mà vẫn nằm trong sổ chờ**. Cả
bốn đã chuyển sang sổ `*_DACHOT` — **gỡ khỏi sổ chờ, không xoá**: câu
trả lời kèm lý do là thứ đáng giữ nhất. Sổ `_DACHOT` không mang đuôi
`_CHOCHU` nên `ccDocSo()` không nhặt.

**`TV_CHOCHU → CC-GOI` là ví dụ rõ nhất của mục tự mô tả sai chính
mình:** ô `lenhDung` còn ghi *"HP_TANG[].gia đang là null và đang chờ
chủ hệ điền"* — đúng lúc viết, và sai từ 9.94 khi giá được chốt. Nay đo
thẳng `HP_TANG[].gia` chứ không đọc lời khai.

### Ba chỗ khai tay phải đụng khi thêm một kho

Thêm một kho mới thì ngoài `ma-hoa-kho.js` và `kho-khoa.js` còn ba chỗ
nữa, và cả ba đều bắt đỏ ngay ở 9.99.61:

| Chỗ | Bắt gì |
|---|---|
| `G.RONG_CO_Y` | kho rỗng phải khai **vì sao** và **lấp khi nào** |
| `G.SG_PHULUC` | kho của cuốn sách phải xếp vào phần IN hay PHỤ LỤC |
| danh sách kiểu đo ở mục 71 | `G.CC_KIEU` đổi hình là đỏ |

**Khung chờ điền là MẢNG RỖNG, không phải một dòng mang ô `null`.** Luật
của kho: vắng mặt nghĩa là không áp dụng, *rỗng* nghĩa là đáng lẽ phải
có giá trị — nên một dòng `{giaTri: null}` là một dòng tự khai rằng nó
đang thiếu, và bộ soát trường trống báo đỏ đúng như thế. Khung chưa điền
thì **chưa có dòng nào**.

### Định danh của một bản ghi không chỉ là ô `ma`

Mục 45 (không mã nào biến mất khỏi bảy gói) chỉ nhận `ma · id · code`.
Mấy sổ chờ không đánh mã — **câu hỏi chính là định danh**, và nó ổn định
vì viết lại câu hỏi là viết lại mục. Chỗ hẹp ấy lộ ra khi bốn mục được
tiễn sang `_DACHOT`: phép soi không lần được nên **báo MẤT trong khi
không mất chữ nào**. Một phép kiểm báo mất nhầm thì lần sau người ta tắt
nó đi. Nay định danh lùi dần: `ma → id → code → câu hỏi đã cắt gọn`.

---

## BỘ NÃO GITA 365 — phần 1: hiến pháp và hàng rào (9.99.62)

Theo bản đặc tả `GITA-BRAIN-365-v3.0` của chủ hệ. Màn **Bộ não GITA
365** (`src/bo-nao.js`, năm ngăn), máy chủ `may-chu/bo-nao.js`, kho
`data.bo-nao.js` (11 kho), bộ kiểm **mục 78**.

Bảy phân hệ của bản đặc tả sẽ dựng sau. Phần này dựng **cái trần**, vì
sơ đồ của chính bản đặc tả đặt Hiến pháp ở trên cùng kèm một câu:
*"không phân hệ nào vượt qua"*. Dựng bảy phân hệ trước rồi mới dựng
hiến pháp là dựng bảy cái cửa rồi mới hỏi cửa mở cho ai — tới lúc ấy
mỗi cửa đã có một luật riêng và gom lại thì không gom được nữa.

### Mỗi điều khai ĐÚNG MỘT đường đo

Bản đặc tả viết mười ba điều bằng giọng ngang nhau. Máy chỉ đo được
**tám**. Trình cả mười ba như đã kiểm thì người duyệt thấy mười ba dấu
tick rồi thôi không đọc — và năm điều nặng nhất về NGƯỜI (Đứa trẻ ·
Quyền tự chủ · Công bằng) lại đúng là năm điều không ai đọc nữa.

Nên mỗi điều có `mayDo` **hoặc** `nguoiDo`, không bao giờ cả hai và
không bao giờ thiếu cả hai — mục 78 canh đúng chỗ ấy. Cùng luật với ô
`daGoNgoai` (9.99.58) và cột lời khai của phễu (9.99.59).

### Điều 13 có RĂNG ở cửa đi ra — và đó là một lỗ đang mở

Luật vận hành số 1: *mọi ghi chép về một gia đình hoặc một đứa trẻ
không bao giờ rời hệ ở dạng nhận dạng được.*

`guiDeBaiRaNgoai` đã chạy từ 9.99.5x và kiểm quyền · kiểm bậc · kiểm
cổng — **không kiểm một chữ nào về dữ liệu người**. Tới hôm qua, một
cái tên trẻ con lọt vào ô nội dung thì nó đi thẳng ra bộ tạo ảnh đặt ở
nước ngoài, và Luật số 91/2025/QH15 gọi đó là **xử lý dữ liệu xuyên
biên giới**.

Phép soi đặt ở **lúc chuỗi rời khỏi hệ**, không ở lúc đề xuất: trong hệ
thì dữ liệu gia đình được phép có mặt. Và soi **chuỗi đã dựng xong**,
không soi từng ô — một cái tên nằm ở ô nội dung, ô bố cục hay ô điều
nhỏ đều như nhau, và soi từng ô là ba phép soi phải cùng nhớ.

Hai luật của cửa ấy:
- **Ngờ là đủ để chặn.** Bắt oan tốn ba mươi giây sửa lại; lọt một cái
  tên thì nó đã ra khỏi hệ và không gọi về được.
- **Máy KHÔNG tự xoá hộ.** Tự xoá thì người gửi không biết mình vừa
  suýt gửi cái gì, và lần sau viết y hệt — tệ hơn, một phép xoá tự động
  sót một chỗ thì người gửi đã yên tâm rồi.

### Ba chỗ máy cố ý không làm thay

1. **R9 (nhắc năng lực GITA chưa có) luôn là việc của người.** Máy
   không biết GITA đang có năng lực gì — danh sách ấy đổi mỗi bản, và
   một bản chép của nó trong bộ dò sẽ cũ đi lặng lẽ. Máy đo **9/10**
   điểm và nói thẳng ra.
2. **Việc chưa ai xếp hạng rơi về VÀNG**, không rơi về Xanh. Rơi về
   Xanh là để máy tự làm một việc chưa ai xếp hạng — đúng cách một hệ
   lặng lẽ mở rộng quyền của chính nó.
3. **Hàng rào nêu TỪNG ĐIỂM**, không gộp thành một con số: chín điểm
   sạch và một điểm phạm nặng cần cách xử lý khác hẳn mười điểm hơi
   phạm.

### Hai chỗ phép đo cũ bắt được ngay

- **`hoSo.role`, không phải `hoSo.vai`** — cùng cái bẫy đã cắn ở
  9.99.55 với `hoSo.username`. Gõ tên ô khác thì JavaScript trả
  `undefined`, phép thử sai, và **cổng đóng với mọi người trong im
  lặng**. Bốn dòng đỏ ở bốn cửa cùng lúc.
- **Khoá màn ở `qt_trang` là mâu thuẫn với chính bản đặc tả.** Phép đo
  tỉ lệ hiển thị (mục 11) bắt R07 · R08 · R12 tụt dưới đích — và Phân
  hệ 6 viết *"Trainer, coach, tư vấn viên đều phải học và thi cùng một
  Hiến pháp 13 điều"*, gọi đó là **đồng chuẩn**. Khoá hiến pháp ở tầng
  quản trị là làm cho người chạm khách nhiều nhất lại không đọc được
  luật mình phải theo. Nay `perm:'nghe_chung'`.

### Hai chỗ cố ý KHÔNG dựng

- **Không chép lại `HP_LUAT` (7 luật tiền) và `KN_CHUAN_NGHE`.** Hiến
  pháp đứng **trên** hai cái ấy; chúng là cách thi hành nó ở hai phạm
  vi hẹp. Khai lại là dựng bản thứ hai của một sự thật.
- **Không dựng lại hệ trên FastAPI + React + vector DB** như một bản
  đặc tả khác đề nghị. Kho này là vanilla JS không có bước biên dịch,
  chạy trên Cloudflare Workers + D1, và đã có 972 kho · 992 phép đo.
  Đổi nền là ném hết đi để bắt đầu lại — xem phần bàn ở cuối tệp này.

---

## BỘ NÃO — Phân hệ 1: Đánh thức Vùng Mạnh (9.99.63)

Bản đặc tả gọi phân hệ này là **lõi của v3.0**. Màn **Vùng Mạnh**
(`src/vung-manh.js`, năm ngăn), máy chủ `may-chu/vung-manh.js`, kho
`data.vung-manh.js` (13 kho), bảng `theVungManh`, bộ kiểm **mục 79**.

### Ba lằn ranh là ba CÁI CỔNG, không phải ba lời dặn

Bản đặc tả viết ba lằn ranh đạo đức ở cuối Phần III bằng giọng của một
lời dặn. Sáu tháng sau không còn ai nhớ một lời dặn, vì nó không chặn
được gì. Nên cả ba đều có răng, và mỗi cái có một phép đo riêng:

| Lằn ranh | Răng nằm ở đâu | Đo thế nào |
|---|---|---|
| LR1 · không xếp hạng trẻ | KHÔNG CÓ cửa ấy | hỏi **danh sách cửa** của máy chủ |
| LR2 · hạn 90 ngày | `doHan()` tính **lúc đọc** | mốc 90/91 ngày là biên |
| LR3 · không bán bằng Thẻ | `soatOLa()` chặn theo TÊN Ô | gửi `diem`·`goi`·`nhan` |

**LR1 là phép đo về thứ KHÔNG TỒN TẠI**, và nó khác hẳn mọi phép đo
khác trong bộ. "Không xếp hạng trẻ với nhau" không gọi được bằng một
hàm — nó nghĩa là không có cái cửa ấy. Nên phép đo hỏi danh sách hàm
xuất ra của mô-đun: một cửa trả nhiều thẻ cùng lúc mà **có mặt** là đỏ,
dù chưa ai gọi nó. Viết cửa ấy rồi mới cấm gọi là muộn.

**LR2 tính lúc đọc, không giữ một cột `conHan` trong bảng.** Một cột
như thế phải có ai đó chạy cập nhật, và ngày không ai chạy thì nó nói
dối theo đúng hướng nguy hiểm nhất. Quá hạn thì `docTheVungManh` **không
trả về năm dòng nữa** (`the: undefined`) — trả về kèm một dòng chữ đỏ
thì người ta vẫn dùng.

**Nỗi sợ (T7) là trường quan trọng nhất**, và đúng MỘT trường được mang
dấu ấy. Hai trường cùng mang thì cái nhấn mất nghĩa. Thẻ bắt buộc mang
dòng ghi chú *"không phải kết luận về con"* — nó chống lại điều nguy
hiểm nhất của cả phân hệ: cha mẹ biến một quan sát tạm thời thành một
cái nhãn dán suốt đời.

**Bộ dò lời hứa về gen cắm ở CHÍNH phân hệ này**, không gửi sang chỗ
chung, vì người viết bài về vùng mạnh là người đứng gần lời hứa ấy nhất
— cái tên "gen thiên tài" bán chạy và nằm ngay cạnh thứ GITA làm thật.
Nó dò **chuỗi con**, không dò biên âm tiết: "gen-thiên-tài" gõ gạch nối
thì biên không khớp mà ý thì y hệt. (Ngược với `DN_TRU` ở 9.99.54 — ở
đó dò chuỗi con bắt oan; ở đây tám cụm đều là cụm nhiều âm tiết nên
không có chỗ để bắt oan.)

### Ba chỗ phá thử bắt được, ghi để không lặp

1. **Dòng đỏ ghi SAI SỐ MỤC.** `mucNay` lấy từ chính **dòng in** tiêu
   đề mục, mà tám mục 72–79 chỉ có KHUNG CHÚ GIẢI, không có dòng in —
   nên mọi dòng đỏ của cả tám mục đều ghi `[mục 71]`. Con trỏ chỉ sai
   chỗ **tệ hơn không có con trỏ**: người đọc tin nó, đi tìm ở mục 71,
   không thấy gì, rồi ngờ chính phép đo. Và nó chỉ lộ ra lúc phá thử,
   vì lúc xanh thì không có dòng đỏ nào để mà sai. Thêm mục mới thì
   phải thêm **dòng in**, không chỉ khung chú giải. (Hai mục còn trùng
   số 72; cái thứ hai nay là 80 — đánh lại chứ không dồn số, vì số mục
   ở tệp ấy là NHÃN ĐỂ TÌM, không phải thứ tự chạy.)
2. **Màn dựng khung rỗng cho vai không có kho nghề.** Kho nạp SAU khi
   đăng nhập, và vai không có gói nghề thì không bao giờ nạp — cả năm
   ngăn vẫn dựng ra bảng có đầu cột mà không có dòng. Một cái khung rỗng
   đọc ra là *"chỗ này chưa làm xong"*, không đọc ra là *"vai của bạn
   không mở được"*. Chặn ở **một chỗ**, trước cả thanh ngăn.
3. **Màn `bo-nao` mắc đúng lỗi ấy nhưng lọt dưới ngưỡng.** Bộ rà soát
   chỗ trống bắt từ **hơn hai** thẻ rỗng, mà màn ấy rỗng đúng hai. Một
   cái hố nằm ngay dưới ngưỡng vẫn là cái hố — sửa cái hố, không sửa
   ngưỡng.

### Và một chỗ phần nhắc việc tự bịt miệng mình

`soat-san-sang.js` in ra `CC-TEN · undefined` cho ba mục và ba dòng
trống cho mấy mục không đánh mã. Nguyên nhân đúng thứ luật của kho cấm:
**hai chỗ đọc tên viết tay**, mỗi chỗ biết một nửa danh sách — mười sổ
chờ dựng ở mười thời điểm nên sổ này gọi câu việc là `viec`, sổ kia gọi
`t`, sổ nữa gọi `hoi`. Nay gom về một hàm `cau()`. Một dòng nhắc không
nói nó nhắc việc gì thì nó không nhắc được ai.

---

## BỘ NÃO — Phân hệ 2: Coach khách hàng (9.99.64)

Phần IV của bản đặc tả. Màn **Coach khách hàng** (`src/coach-kh.js`,
năm ngăn), máy chủ `may-chu/coach-kh.js`, kho `data.coach-kh.js` (14
kho), bộ kiểm **mục 81**, chín phép đo ở `thu-worker.js`.

### Phần này cố ý DỰNG ÍT

Bản đặc tả mở Phần IV bằng *"giữ nguyên toàn bộ từ v2.0, nhắc lại ở
dạng nén"*. Chép lại một bản nén vào kho là dựng bản thứ hai của một
sự thật, và bản thứ hai mục trong im lặng. Nên chỉ dựng thứ CHƯA có ở
đâu trong kho, và mỗi thứ dựng ra đều có một cái răng.

### Thứ THẬT SỰ mới của v3.0 là đúng một câu

*Trước khi trả lời bất kỳ câu hỏi nào về một đứa trẻ cụ thể, bộ não
đọc Thẻ Vùng Mạnh của con đó trước.*

Câu ấy nghe như một lời dặn về thứ tự thao tác. Nó không phải — nó là
**câu nối Phân hệ 2 vào Phân hệ 1**. Không có răng thì bốn tuần quan
sát của một gia đình thật dừng lại ở một tờ giấy đẹp, và không đổi
được một chữ nào trong câu trả lời.

**Dựng bằng một cái cờ `daDocThe` là hỏng ngay từ đầu:** một cái cờ do
người gọi truyền vào là một **lời khai**, và lời khai bật được mà
không đọc gì. Nên máy chủ **tự đọc** thẻ, và mục 81 đọc thẳng thân hàm
`traLoiCoach` để canh hai điều — không ô nào mang nghĩa *"đã đọc rồi"*,
và **có** lời gọi thật sang `docTheVungManh`. Cùng lối đo với LR1 ở mục
79: phép đo về thứ **không được tồn tại**.

Và phép đo mạnh nhất là câu của chính bản đặc tả, đo ở `thu-worker.js`:
cùng một câu hỏi *"con không chịu học"*, nhà có cửa **làm** và nhà có
cửa **nghe** phải ra **hai câu trả lời khác nhau**. Giống hệt nhau là
máy chưa đọc thẻ — dù cờ có bật, dù nhật ký có ghi. Đo **hành vi**,
không đo lời khai.

Bốn cửa đóng, cả bốn đều có phép đo: `CHUATHE` (nhà chưa có thẻ) ·
`THEQUAHAN` (LR2 đi xuyên từ Phân hệ 1 sang) · `THIEUCUA` (thẻ thiếu ô
cửa thì **nói là không biết**, không đoán — đoán thì một phần ba là
trúng) · `LUONGLA` (chưa phân luồng, bước B2 không bỏ được).

### Ba cái cổng còn lại

1. **Bốn luồng nặng — L05 · L06 · L09 · L12 — bắt buộc ba lượt hội
   đồng, và ba lượt CHÉP LẠI không tính là ba lượt.** Con số ba vẫn
   đúng trong khi cái được canh thì không còn, và bảng hội đồng thành
   sân khấu — một sân khấu mang dấu kiểm duyệt thì tệ hơn không có bảng
   nào. Ba luồng đầu chọn vì sai thì hỏng thứ không sửa lại được; luồng
   thứ tư (về chính GITA) vì đó là luồng **duy nhất người trả lời có
   lợi ích trong câu trả lời**.
2. **Ghế G5 Người giữ hồn: máy không ngồi vào được.** Bốn ghế kia hỏi
   câu đo được — đúng chưa, ngược lại thì sao, nguồn đâu, gọn chưa. Ghế
   này hỏi *"đọc xong người mẹ ấy thấy gì"*, và câu trả lời của máy cho
   nó **nghe y hệt** câu trả lời thật — đó đúng là lý do nó phải là
   người. Cùng luật với ô `daGoNgoai` (9.99.58).
3. **Bé tập bò, ba cái trần đếm được** — 20 chữ mỗi câu · 4 dòng mỗi
   đoạn · **2 con số cả bài**. Máy **chặn** và nói vượt ở đâu, không tự
   cắt hộ: cắt hộ thì người viết không biết mình vừa viết dài, và lần
   sau viết y hệt.

**Một chỗ suýt dựng thành phép đo bắt oan:** đếm con số thì mã `T4` ·
`L06` · `M3` · `RB-07` phải bị **gỡ trước khi đếm**. Không gỡ thì mọi
bài nhắc tới một bảng nào đó đều vượt trần — và một phép đo bắt oan thì
lần sau người ta tắt nó đi.

### Bảng đích hiển thị: đo lại CẢ BẢNG, không sửa mỗi số vừa kêu

Mục 11 bắt R13 tụt 34,9% so với đích 37%. Chú giải của chính bảng
`G.TAM_NHIN` đã dặn: nhiều số cùng lệch thì **hỏi lại xem cách đếm có
hỏng không**. Đã hỏi và đã đo — mẫu số 183 → 186 đúng ba màn mới; vai
**có** `nghe_chung` tử số tăng đúng 3; vai **không có** tử số đứng yên.
Cách đếm còn đúng.

Phép đo nói thêm một điều: **bảng đích đã lệch từ TRƯỚC ba màn ấy** —
R03 đo được 82,5 khi đích ghi 84. Ba màn mới chỉ đẩy đúng R13 vượt dung
sai; chín số kia lệch sẵn 1,2 và nằm im. Nên sửa **cả mười** về số đo
được. Sửa mỗi số vừa kêu là để chín số kia nằm sát mép, và lần thêm màn
sau chúng cùng vỡ một lượt — đúng cái đã xảy ra ở 9.64–9.67. Dung sai
±2 giữ nguyên: nới dung sai là bỏ hẳn phép canh.

---

## BỘ NÃO — Phân hệ 3: Nội dung & tiếp thị (9.99.65)

Phần V. Màn **Nội dung & tiếp thị** (`src/noi-dung-tiep-thi.js`, bốn
ngăn), máy chủ `may-chu/noi-dung-tiep-thi.js`, kho
`data.noi-dung-tiep-thi.js` (8 kho), bộ kiểm **mục 82**, chín phép đo ở
`thu-worker.js`.

### Kho đã có sẵn rất nhiều, nên phần này TRỎ chứ không chép

Kho đã có hiến pháp nội dung `KN_*` (28 kho) và một bộ soi chạy thật ở
`kien-truc-noi-dung.js`: dò câu sáo rỗng, dò lời phán, dò câu dài, đòi
nhãn nguồn, dò tự xưng chuyên gia. Phần V **không dựng lại cái nào** —
mục QC4 của bộ lọc quảng cáo **gọi thẳng** `soatNguon`, và mục 82 đọc
mã nguồn để canh đúng chỗ ấy: chép bảng nhãn nguồn sang thì thêm một
nhãn mới ở bản sau là hai bảng lệch nhau, và bộ lọc **bắt oan** một bài
đã ghi nguồn đúng.

### Bảy mục của bộ lọc KHÔNG cùng một loại

| Ngăn | Mục | Ai đo |
|---|---|---|
| Máy đo | QC1 từ tuyệt đối · QC2 so sánh · QC3 cam kết kết quả · QC4 số không nguồn | máy đếm thẳng |
| Người khai | QC5 chứng thực · QC6 ảnh trẻ em · QC7 người ảnh hưởng | **người**, kèm tên và giấy tờ |

Trình cả bảy như đã kiểm thì người duyệt thấy bảy dấu tick rồi thôi
không đọc — và ba mục nặng nhất về **pháp lý** lại đúng là ba mục không
ai đọc nữa. Máy nhìn thấy cái ô tích, **không nhìn thấy sự việc**. Nên
ba mục ấy đòi **một cái tên kèm một chỗ trỏ tới giấy tờ**, không nhận ô
tích. Cùng luật với Điều 13 (9.99.62), `daGoNgoai` (9.99.58), cột lời
khai của phễu (9.99.59).

**Khai `khongApDung` khác hẳn bỏ trống.** Bài không có ảnh trẻ em thì
QC6 không phải một mục phải ký — nhưng phải **nói ra thế**. Bỏ trống là
chưa ai nhìn tới, và một mục bỏ trống trôi qua thì nó trôi mãi.

### Hai cổng của 5.1

1. **Không khai tầng nhận thức thì không xuất bản**, và máy **không
   đoán hộ**. Đoán thì một phần bảy là trúng, và người viết tưởng bài
   đã được xếp tầng nên thôi không nghĩ tới nữa — mà việc xếp tầng
   chính là việc phải nghĩ.
2. **Lời kêu gọi sai tầng bị chặn.** Bài tầng 1–2 kết bằng *"Đăng ký
   ngay"* không bị ai phản đối — nó bị **lướt qua**, và lướt qua thì
   không để lại dấu nào để về sau truy.

**Bẫy tên gọi, ghi trước khi nó cắn:** kho đã có chữ *tầng* mang nghĩa
**tầng sản phẩm T1–T5**. *Tầng nhận thức* là thang khác hẳn — một bài
tầng sản phẩm T4 vẫn viết được cho người ở tầng nhận thức 1. Nên mọi
thứ ở đây mang tiền tố `NT_` và ô gọi là **`tangNT`**, không bao giờ
gọi trần là `tang`: gõ trần thì nó lặng lẽ khớp vào phép soi tầng sản
phẩm, và **cả hai phép soi cùng xanh trên hai thứ khác nhau**.

Bảng lời kêu gọi nằm ở **nhóm**, không ở tầng — chép ra bảy dòng là giữ
bảy bản của một luật. Nhóm N7 **cố ý không có khoá `keuGoiSai`**: người
đã vào rồi thì không còn lời mời nào sai. Một mảng rỗng ở đó là một
dòng tự khai rằng nó đang thiếu, và mục 82 báo đỏ đúng thế.

### 5.2 — phép đếm đội lốt một phép đo chất lượng

Một bài gốc phải ra đủ **bảy nhánh**. Không kể được trong sáu mươi giây
thì bài chưa có **ý trung tâm**; không rút được thành một trang thì bài
chưa có **việc làm được**. Thiếu thì nêu **từng nhánh** thiếu — một con
số thiếu không nói thiếu cái gì thì người viết đoán, và họ đoán nhánh
dễ làm nhất.

### Chọn dấu hiệu, không dựng danh sách trừ

`CUM_TUYET_DOI` dò **cụm nhiều âm tiết** (`tốt nhất`, `hàng đầu`),
không dò âm tiết trần `nhất` — nó nằm trong *nhất định*, *thống nhất*.
`CUM_SO_SANH` dò **hình của lời so sánh**, không dò tên đối thủ: một
danh sách tên đối thủ phải dài thêm mãi và luôn thiếu đúng cái tên mới.
`CUM_CAM_KET` dò **cụm hai vế** — `cam kết` trần không đủ, vì kho này
cam kết rất nhiều thứ đúng đắn.

### Hai chỗ bài thử của tôi sai, không phải mã sai

Phá thử xong thì hai phép đo đỏ, và cả hai là **lỗi ở bài thử**: một
bài thử quên khai ba mục người-đo (bản đặc tả viết *"MỌI nội dung tiếp
thị phải qua bộ lọc"* — bảy mục đều phải có **câu trả lời**, thứ khác
nhau là câu trả lời chứ không phải việc có phải trả lời hay không); một
bài thử viết *"Ba mươi phần"* bằng chữ nên không có chữ số nào để mà
đếm. Ghi lại vì cái bẫy thứ hai sẽ quay lại: **phép đo con số không
thấy số viết bằng chữ.**

---

## BỘ NÃO — Phân hệ 4: Vận hành & chăm sóc (9.99.66)

Phần VI. Màn **Vận hành & chăm sóc** (`src/van-hanh-cham-soc.js`, bốn
ngăn), máy chủ `may-chu/van-hanh-cham-soc.js`, kho
`data.van-hanh-cham-soc.js` (9 kho), bảng `hoSoSongSinh` và `soCham`,
bộ kiểm **mục 83**, chín phép đo ở `thu-worker.js`.

### Cái răng chính: đèn Đỏ phải GỌI

Bảng đèn của bản đặc tả có một cột mà mọi bảng đèn khác thường thiếu:
**ai làm**. Cả phân hệ có giá trị ở đúng dòng cuối — đèn Đỏ, **người
thật, gọi điện, trong 24 giờ, không bán gì**.

Một cái đèn đỏ **đóng lại được bằng tin nhắn thì nó không phải đèn
đỏ**. Nhắn tin rẻ, nhanh, và đóng được việc trong sổ — nên nếu cho
phép thì mọi đèn đỏ đều đóng bằng tin nhắn, và bảng ba màu còn đúng
hai màu. `ghiCham` chặn ba đường: nhắn vào nhà đỏ (`DOPHAIGOI`), máy
gọi (`DOPHAINGUOI`), và nhắc bài trong vùng tử thần (`NHACBAI`).

### Hai phép đo về thứ KHÔNG ĐƯỢC TỒN TẠI

Lối đo thứ ba trong bộ dùng nó, sau LR1 (mục 79) và ô tự khai (mục 81):

1. **Bảng `hoSoSongSinh` không có cột nào** cho bốn trường máy tính
   lẫn năm trường đã sống ở hệ khác. Mục 83 đọc **thẳng `csdl.sql`**,
   không tin lời khai của mô-đun.
2. **Mô-đun không mang một đường nào ra Google Sheets**, và cửa đi ra
   gọi đúng cổng ẩn danh của Bộ não chứ không dựng bộ dò thứ hai.

Vì sao gắt đến thế với một cột `den`: có cột thì **hoặc** bị gõ đè —
và một phép đo biến thành một lời khai, mà nhìn thì vẫn y hệt — **hoặc**
không ai gõ và nó cũ đi lặng lẽ, khai XANH cho một nhà đã im lặng hai
mươi ngày, rồi cả quy trình gọi điện trong 24 giờ đi theo nó. Cùng luật
với cột `conHan` **không có** trong `theVungManh` (9.99.63).

### Ba chỗ cố ý không theo bản đặc tả

1. **6.4 đề nghị lưu sổ dấu vết trên Google Sheets — không làm theo.**
   Mỗi dòng mang tên gia đình, tên con, và nội dung một cuộc trò
   chuyện riêng. Đẩy lên một dịch vụ đặt ngoài lãnh thổ là **xử lý dữ
   liệu xuyên biên giới** theo Luật số 91/2025/QH15, và phạm thẳng Điều
   13 của chính Hiến pháp Bộ não. Sổ nằm ở D1.
2. **Tiêu đề 6.1 ghi "20 trường" rồi liệt 12 + 8 + 3 = 23.** Tiêu đề
   viết trước, ba trường v3.0 thêm sau. Lấy 23 và **nói ra chỗ lệch** —
   im thì người đọc đếm được 23 rồi ngờ chính bản đặc tả.
3. **Tám trường "động" không cùng một loại.** Bốn cái máy tính được,
   ba cái đã sống ở hệ khác, một cái người ghi. Gom cả tám thành cột
   là mời người ta gõ đè lên một phép đo. Mỗi trường khai một ô
   `nguon` — `nguoiKhai` · `mayTinh` · `troSang` — và đó là ô quan
   trọng nhất của cả bảng.

### Một phát hiện của bài thử, đáng giữ thành phép đo riêng

Bài thử đầu cho nhà "xanh" tham gia 40 ngày trước rồi chờ nó xanh — và
nó ra **ĐỎ**, đúng như phải thế: **không có dòng nào trong sổ thì số
ngày im lặng đúng bằng số ngày đã tham gia**. Im lặng đếm từ lúc quen
nhau, không từ lúc chạm lần đầu. Để nó nằm im ở xanh vì *"chưa có dữ
liệu"* thì nhà bị bỏ quên ngay từ đầu là nhà không ai đi tìm. Nay có
phép đo riêng cho chỗ ấy.

### Chỗ bộ soi cơ sở dữ liệu bắt ngay

`hoSoSongSinh` lúc đầu thiếu chỉ mục. Chỉ mục thêm vào là
`ix_ss_thamgia` trên `ngayThamGia` — **đường tra thật**, vì nhịp 365
ngày hỏi *"hôm nay nhà nào đang ở ngày 8–12"* và đó là một phép lọc
khoảng trên ngày tham gia. Không phải một chỉ mục thêm cho bộ thử
xanh: chặng tử thần phải quét mỗi ngày, nên nó là đường nóng nhất của
cả bảng.

Và `soatNhacBai` dò **cụm nhiều âm tiết** — `bài hát`, `bài viết` không
bị bắt. Cùng luật chọn dấu hiệu của `CUM_TUYET_DOI` ở 9.99.65.

---

## BỘ NÃO — Phân hệ 5: Tài chính (9.99.67)

Phần VII. Màn **Bảy con số CEO** (`src/tai-chinh-ceo.js`, ba ngăn),
máy chủ `may-chu/tai-chinh-ceo.js`, kho `data.tai-chinh-ceo.js`
(6 kho), bộ kiểm **mục 84**, tám phép đo ở `thu-worker.js`.

### Bảy con số KHÔNG cùng một loại

| Ngăn | Con số | Là gì |
|---|---|---|
| Đo thẳng | S1 tiền mặt · S2 số tháng sống · S3 doanh thu · S7 tự giới thiệu | máy cộng trong sổ |
| Mẫu đủ tuổi | S4 chi phí một khách · S6 ở lại 90 ngày | **chỉ** tính trên phần đã đủ tuổi |
| Ước tính | S5 giá trị 365 ngày | **phép chiếu**, chưa phải phép đo |

**S5 là phép chiếu cho tới khi có một lớp nhà đủ 365 ngày**, và phép
chiếu **luôn đẹp hơn sự thật** — vì nhà rời đi sớm chưa kịp rời đi.
**S6 loại nhà chưa đủ 90 ngày ra khỏi mẫu và nói ra bao nhiêu bị
loại**: đếm họ vào mẫu là thổi tỷ lệ lên, và thổi đúng lúc đang tuyển
nhiều nhất.

**Mẫu rỗng thì không trả về 0%**, nhưng **mẫu có mà không ai ở lại thì
trả 0 thật** — gộp hai trường hợp ấy là mất đúng chỗ có nghĩa.

### S2 tính trên TIỀN CỦA HỌC VIỆN, không trên tổng tiền mặt

Tiền học 365 ngày là **tiền của khách cho tới khi dịch vụ được giao**.
Tính số tháng sống được trên tổng tiền mặt thì nó nói dối theo đúng
hướng nguy hiểm nhất: **dài ra đúng lúc thu được nhiều tiền trả
trước**, tức là đúng lúc nghĩa vụ giao dịch vụ nặng nhất. Máy trả về
ba con số riêng — tiền mặt · chưa giao · của Học viện — không gộp.

### Bốn luật, ba cổng ở đây và một cái TRỎ

L1 runway < 3 → chặn tăng chi, **máy không chọn cắt cái gì**. L2 ở lại
< 60% → chặn **riêng** khoản `tiepThi`, không chặn cả sổ chi (cổng quá
rộng thì người ta tìm đường vòng, và đường vòng không ai canh). L3
tiền của Học viện âm → báo động. **L4 đã chạy từ 9.92** — mô-đun gọi
thẳng `thangDuyetChi()`, và mục 84 **đọc mã nguồn** để canh rằng nó
không khai một con số ngưỡng nào: hai bản ngưỡng tiền lệch nhau thì
một khoản chi lọt qua mà không ai biết.

Khoản mục quảng cáo lấy **đúng tên** trong danh sách trắng của
`chi-tieu.js`, và mục 84 đối chiếu — cổng trỏ vào một tên không tồn
tại thì nó không chặn gì cả.

### Ba kịch bản phải đủ BA ô

Cắt gì trước · **giữ gì tới cùng** · ngưỡng nào thì hành động. Danh
sách **giữ** là phần khó viết và là phần cứu được sản phẩm — một danh
sách cắt không có danh sách giữ thì nó được áp lên mọi thứ. Máy **nói**
dấu hiệu đang trỏ về kịch bản nào rồi **dừng**: chuyển kịch bản có hệ
quả với người đang làm, nên nó phải có một cái tên ký bên dưới.

### Hai chỗ bộ kiểm bắt ngay, và cả hai là lỗi thật

1. **Dấu nháy trong `Academy's` cắt đôi một chuỗi nháy đơn ở
   `i18n.js`** — cả gói mã không parse, và triệu chứng hiện ra là
   `window.G.doLogin is not a function`, không phải một lỗi cú pháp.
   Cách tìm nhanh: `node --check src/*.js` rồi `node --check
   gita-app.js`.
2. **Mục 67 bắt `G.tcMoNgan` trùng với `src/phong-tai-chinh.js`.**
   Tiền tố `tc` đã thuộc về màn Phòng tài chính từ trước; tệp nạp sau
   thắng và tệp kia im lặng gọi nhầm hàm. Đổi tiền tố của màn mới
   thành `ceo`. **Chọn tiền tố là việc phải làm trước khi viết, không
   phải sau khi trùng.**

### Màn khoá `fin_view`, máy chủ khoá R01–R03 — lệch một bậc, CỐ Ý

`fin_view` là câu trả lời **sẵn có** cho *"ai xem tài chính"*, dùng
lại chứ không dựng câu thứ hai. Cổng máy chủ hẹp hơn một bậc theo luật
*tài chính chỉ R01–R03* đã chốt 9.97. Cái hẹp hơn nằm ở **máy chủ** —
đúng chiều an toàn: màn hình chỉ quyết mục nào hiện trong cột trái,
thứ quyết ai đọc được con số là cổng máy chủ.

---

## BỘ NÃO — Phân hệ 6: Con người (9.99.69)

Phần VIII. Màn **Con người · Ba cửa** (`src/con-nguoi.js`, bốn ngăn),
máy chủ `may-chu/con-nguoi.js`, kho `data.con-nguoi.js` (10 kho), bảng
`baCuaConNguoi`, bộ kiểm **mục 86**, mười lăm phép đo ở `thu-worker.js`.

### Phần này TRỎ, và chỉ dựng đúng một thứ chưa có

Kho đã có hệ sát hạch nghề (`SH_*`, 348 câu, sáu vai), đã có Hiến pháp
13 điều và hàng rào 10 điểm (`BN_*`). Ba cửa không dựng lại cái nào.
Thứ chưa có là **một cái cổng đứng trước lượt chạm khách đầu tiên**.

Bản đặc tả kết Phần VIII bằng một câu: *"Chưa qua đủ ba cửa thì không
được chạm khách một mình. Không ngoại lệ, kể cả khi thiếu người."* Câu
ấy **là** cả phân hệ. Viết ở dạng một lời dặn thì nó thua ngay ngày
đầu, và thua LẶNG LẼ — thiếu người là lý do hay gặp nhất, nên nếu nó
được tính là ngoại lệ thì nó thành lối đi chính.

**Cổng nằm trong `ghiCham`** — chỗ một lượt chạm được GHI — không ở
màn hình. Mục 86 đọc thẳng mã nguồn và đòi lời gọi ấy nằm **trước**
câu `INSERT`. Đặt ở màn hình thì nó là một lời nhắc: người ta đọc,
thấy hợp lý, rồi vẫn gọi. Cùng cái bẫy đã ghi ở cổng ADN (9.99.56).

**Đứng SAU ba cổng cũ của `ghiCham`, không đứng đầu.** Cả bốn đều
chặn, nên thứ tự chỉ quyết câu người ta ĐỌC TRƯỚC; ba cổng trên nói về
chính lượt chạm này và câu của chúng cụ thể hơn. Đặt cổng ba cửa lên
đầu thì một cái máy gọi vào nhà đỏ nhận câu *"chưa qua ba cửa"* —
đúng, nhưng lạc, vì vấn đề của nó là nó không phải một người.

### Ba cửa, ba kiểu kết luận khác nhau

| Cửa | Đạt là | Ai kết luận |
|---|---|---|
| C1 · Hiến pháp | **13/13**, máy gọi TÊN ĐIỀU | máy |
| C2 · Giọng | hàng rào 10 điểm ≥ 90% số bài | **máy và người** |
| C3 · Tri kỷ | khách nói ≥ 80%, **từng cuộc một** | người |

**`mayVaNguoi` không phải chỗ lấp lửng, và đúng MỘT cửa được mang nó.**
Hàng rào có mười điểm mà máy đo được chín — R9 luôn là việc của người.
Chín chia mười ra **đúng 90%**, vừa đủ ngưỡng, nhờ đúng chỗ chưa ai
nhìn. Nên Cửa 2 **TREO** cho tới khi có tên người đọc R9, và tên ấy
không được là chính ứng viên.

**Cửa 1 trả về TÊN ĐIỀU, không trả một phân số.** 12/13 nghe như gần
đạt nhưng không nói điều nào bị bỏ — mà điều bị bỏ có thể là Điều 13,
điều duy nhất có hậu quả pháp lý.

**Cửa 3 đo TỪNG cuộc, không lấy trung bình ba cuộc**: 95% · 95% · 55%
ra trung bình 82%, trên ngưỡng, mà cuộc thứ ba thì hỏng. Thứ cửa này
đo là một THÓI QUEN, và một thói quen phải đúng ở cả ba lần. Và **người
kèm khai HAI CON SỐ PHÚT, không khai một tỷ lệ** — một tỷ lệ gõ thẳng
vào là một lời phán, hai quãng thời gian thì quan sát được, và phép
chia để máy làm.

### Đồng chuẩn đo bằng thứ KHÔNG ĐƯỢC TỒN TẠI

*"Trainer, coach, tư vấn viên đều thi cùng một Hiến pháp 13 điều."*
Chỗ kiểm được của câu ấy: thân hàm `chamCua1` **không có một chữ nào
về vai**, và hàm nhận đúng một tham số. Chia đề theo vai thì ba vai
học ba bản, ba bản trôi xa nhau mỗi bản một ít, và không ai thấy vì
mỗi bên vẫn thi đạt.

`SH_HOI` **chia** theo vai, và chia là đúng: nó đo NGHỀ, mỗi vai một
phần việc. Cửa 1 đo LUẬT, và luật thì cả nhà một bản.

**Mỗi điều đúng MỘT tình huống thử**, đối chiếu thẳng với
`BN_HIENPHAP`. Thiếu một điều thì bài thi vẫn xưng là 13/13 trong khi
nó chỉ thử mười hai — và chỗ thiếu không lộ ra ở đâu cả.

### Bảng không có cột "đã đủ ba cửa"

Lối đo thứ tư trong bộ dùng phép đo về thứ không được tồn tại, sau LR1
(mục 79), ô tự khai (mục 81) và cột đèn (mục 83). Đủ hay chưa thì
**tính lúc đọc** từ ba dòng. Một cột tóm tắt thì hoặc bị gõ đè — và
một phép đo biến thành một lời khai mà nhìn vẫn y hệt — hoặc không ai
gõ và nó cũ đi lặng lẽ.

**Bật cổng là chặn cả người cũ.** Hệ quả cố ý: một cổng chỉ áp cho
người mới là một cổng nói rằng người cũ không cần chuẩn. Đường cho
người cũ là `lapBaCua` (chỉ R01–R02, **phải viết căn cứ**), và dòng ấy
mang `nguon: 'khaiCu'` — `docBaCua` nêu riêng phần khai hộ, không gộp
vào một con số "đã đủ". Chính bộ thử worker đã phải khai hộ cho ba cái
tên mà khối Phân hệ 4 dùng, trước khi mọi phép đo cũ chạy lại được.

### Bài tuần — hai phép đo NGƯỢC CHIỀU trên cùng một bộ dò

Bản mẫu phải **sạch** hàng rào; bản sai phải **ĐỎ**. Một "bản sai" mà
hàng rào chấm sạch thì nó không sai — nó chỉ là một cách nói khác, và
đội ngũ học được rằng cái sai là chuyện cảm tính. Ngược lại, một bản
mẫu phạm hàng rào dạy đúng cái đang bị cấm, và nó dạy mạnh hơn mọi lời
dặn vì nó được gắn nhãn *"mẫu"*. Bộ dò hỏng thì một trong hai phía đỏ
ngay, chứ không im cả hai.

Năm ca thật soi bằng chính `BoNao.soatRaNgoai`, không dựng bộ dò thứ
hai — mục 86 canh rằng mô-đun **không khai một bảng dấu hiệu nào của
riêng nó**. Mã điều ghi kèm bản sai phải có trong `BN_HIENPHAP`: gõ
`HP14` thì bài tuần vẫn trông đầy đủ, và người học đi tìm một điều
không tồn tại. **Máy không tự chọn năm ca** — chọn ca là quyết định về
việc gia đình nào được đem ra dạy.

### Hai mươi câu của Cửa 2 để RỖNG

`CN_C2_KHUNG = []`, khai ở `RONG_CO_Y`, mục chờ **CN-01**. Máy viết ra
được hai mươi câu nghe rất giống câu thật — và đó đúng là vấn đề: một
bộ đề tự nghĩ ra thì đội ngũ luyện giọng cho một người không có thật,
rồi gặp người thật thì hỏng đúng ở chỗ chưa ai luyện.

**CN-02** là ngày bật cổng, vì bật là chặn mọi người chưa có dòng
trong sổ — một quyết định vận hành, không phải một dòng mã.


## BỘ NÃO — Phân hệ 7: Pháp lý & rủi ro (9.99.70)

Phần IX, **phần cuối của bản đặc tả**. Màn **Pháp lý & rủi ro**
(`src/phap-ly-rui-ro.js`, năm ngăn), máy chủ `may-chu/phap-ly-rui-ro.js`,
kho `data.phap-ly-rui-ro.js` (12 kho), bảng `dongYDuLieu` và `yeuCauXoa`,
bộ kiểm **mục 87**, mười hai phép đo ở `thu-worker.js`.

### Câu đầu tiên của phần này là một cái cổng

Bản đặc tả mở Phần IX bằng một cảnh báo bắt buộc: *đây là bản đồ để
biết chỗ nào cần **HỎI**, không phải tư vấn pháp lý*. Nên mô-đun
**không có một cửa nào kết luận** — mục 87 hỏi DANH SÁCH HÀM XUẤT RA
và đỏ nếu thấy `ketLuanPhapLy` · `danhGiaRuiRo` · `coHopPhap`, dù chưa
ai gọi. Viết cửa ấy rồi mới cấm gọi là muộn.

Vì sao gắt đến thế: **một câu trả lời pháp lý do máy sinh ra nghe y
hệt một câu trả lời thật.** Người đọc không có cách nào phân biệt, và
họ đọc nó đúng vào lúc đang vội — tức là đúng lúc sai thì đắt nhất.

Bốn vùng luật sư mang ô `hoiGi` và **không có ô kết luận**. Thứ có giá
trị là câu hỏi viết đủ cụ thể để mang thẳng tới bàn luật sư: một giờ
luật sư trả lời đúng câu hỏi rẻ hơn nhiều so với ba giờ để họ tự tìm
ra câu hỏi là gì.

### Phần này TRỎ nhiều hơn mọi phần trước

Mục **9.3 của bản đặc tả CHÍNH LÀ hàng rào 10 điểm đã có** ở
`BN_RAO10`. Luật Quảng cáo đã có bộ lọc bảy mục ở Phân hệ 3. Điều 13
đã có cửa ẩn danh từ 9.99.62. Mục 87 canh rằng mô-đun **không khai một
bảng dấu hiệu nào của riêng nó** — hai bảng lệch nhau thì cả hai đều
xanh trên hai thứ khác nhau.

### Bảy việc của Luật 91 chia theo AI LÀM, không xếp theo số

| Ngăn | Việc | Ai |
|---|---|---|
| Máy canh | V2 ô đồng ý riêng · V3 đồng ý của cha mẹ · V4 nút xoá · V5 ẩn danh · V6 nhật ký | máy, gọi thật vào cửa |
| Của người | V1 viết chính sách · V7 quy trình xoá khi hết hợp đồng | người, mỗi cái một mục chờ |

Xếp theo số thì một việc máy canh nằm cạnh một việc chờ người, cùng
kiểu chữ — và đó đúng là chỗ người đọc tin cả bảy như nhau. **Máy nhìn
thấy CÁI Ô TÍCH, không nhìn thấy SỰ VIỆC.**

`docTuanThu` **không trả về giá trị nào cho V1 và V7, kể cả `false`** —
một `false` nằm cùng bảng với năm kết quả đo được thì nó đọc ra như
một phép đo. Cùng luật với ba bậc lời khai của phễu (9.99.59).

### Ba lỗ THẬT tìm ra khi dựng phần này

1. **Ô đồng ý đang GỘP.** `src/dang-ky.js` có đúng một checkbox, và
   câu báo lỗi của nó tự khai ra chỗ sai: *"đồng ý điều khoản sử dụng
   VÀ cách GITA giữ dữ liệu"*. Nay ba ô tách hẳn. **Ô thứ ba KHÔNG bắt
   buộc** — bắt cả ba mới đăng ký được thì ba ô lại thành một ô, người
   ta tích hết một lượt, và cái "riêng, tách bạch" chỉ còn ở hình thức.
2. **Không có cổng nào cho dữ liệu trẻ em.** Nay `lapTheVungManh` và
   `lapSongSinh` — hai cửa DUY NHẤT tạo hồ sơ về con — chặn khi nhà ấy
   chưa có dòng `duLieuCon`, và mục 87 canh rằng cổng nằm **trước** câu
   `INSERT`. Ô ấy chỉ **CHA MẸ** ký được (cổng đọc vai của phiên, không
   đọc một ô `laChaMe` do người gọi truyền vào).
3. **Nhật ký chỉ ghi lượt GHI, không ghi lượt ĐỌC.** Luật 91 việc số 6
   đòi *"ai TRUY CẬP dữ liệu gia đình nào"* — và tới 9.99.69 câu ấy
   không trả lời được. Nay `docSongSinh` và `docTheVungManh` ghi nhật
   ký mỗi lượt đọc. Một sự thật CÓ mà không đọc ra được thì trên thực
   tế là KHÔNG CÓ.

### Rút đồng ý là một DÒNG MỚI, và nó chặn được việc ghi tiếp

Bảng `dongYDuLieu` **không có cột trạng thái**: trạng thái = dòng mới
nhất của ô ấy, tính lúc đọc. Có cột thì rút đồng ý sửa đè lên dòng cũ,
và mất hẳn phần lịch sử — mà chính nó trả lời được câu *"hôm ấy nhà
này đã đồng ý chưa"*, đúng câu người ta hỏi lúc có tranh chấp.

`docDongY` nêu **riêng** *chưa hỏi* và *đã rút*. Gộp hai cái thành
"không có" thì một nhà chưa ai hỏi tới nằm chung rổ với một nhà đã nói
KHÔNG — hai chuyện ấy cần hai cách xử lý khác hẳn nhau.

### Nút xoá: hai phía, và chúng không gộp được

| Ô | Là gì |
|---|---|
| `xoaTrongSo` | **phép đo** — máy đếm được dòng còn lại |
| `xoaNgoaiSo` | **lời khai** — bản sao lưu, tệp đã tải về, bản in |

Máy **không tự đánh dấu** phía ngoài, và đánh dấu phía ấy **phải viết
căn cứ**. Một ô máy tự đánh dấu mà không đo được là *một lời nói dối
mang dấu của hệ thống*. Cùng luật với `goTrongSo`/`daGoNgoai`
(9.99.58). Yêu cầu xoá có **hạn 30 ngày**, và sổ nêu riêng phần quá
hạn — không có hạn thì việc này trôi cùng nhịp việc thường, và nhịp
việc thường là nhịp của thứ không ai giục. **Không đòi lý do**: đòi lý
do là dựng một cái cửa nhỏ ở chỗ luật nói là quyền.

### Hậu kiểm nguy hơn tiền kiểm, không phải dễ hơn

Luật 75/2025 bỏ giấy phép, **không bỏ trách nhiệm**. Sai thì sai CÔNG
KHAI, và thứ phải sửa lúc ấy không còn là một bản nháp. Kéo theo: Điều
10 của Hiến pháp từ 01/01/2026 là một **hàng rào pháp lý**, không còn
là chuẩn đạo đức riêng của GITA.

### Một lỗi của chính tôi, bộ rà soát bắt ngay

`U.empty()` **tự gọi `U.h()`** trên tham số, nên viết `&amp;` vào tiêu
đề là thoát lần thứ hai và người đọc thấy `&amp;amp;`. Lỗi không sinh
lỗi trang nên nó sống rất lâu — đúng lớp lỗi bản 9.24 đã gỡ 77 chỗ.


## HỆ ĐIỀU HÀNH CẤP ĐIỀU HÀNH — GITA-CEO-OS v3.0 (9.99.71)

Tài liệu **đi kèm** bản đặc tả Bộ não, nằm trong cùng tệp *Bộ Não
Thiên Tài GITA 365* của chủ hệ. Màn **Hệ điều hành CEO**
(`src/he-dieu-hanh.js`, năm ngăn), máy chủ `may-chu/he-dieu-hanh.js`,
kho `data.he-dieu-hanh.js` (14 kho), bảng `quyetDinhLon`, bộ kiểm
**mục 88**, chín phép đo ở `thu-worker.js`.

Ba vùng uỷ quyền và hội đồng bảy ghế **đã dựng ở 9.99.62** — bản này
không dựng lại, mục 88 canh rằng kho `HDH_*` không mọc `HDH_VUNG` hay
`HDH_GHE`.

### Cả phần này là BẢNG, và bảng thì không chặn được gì

Đó là rủi ro lớn nhất của chính nó. Một màn hình đẹp có nhịp sáng,
mười hai con số và năm bước quyết định mà không cái nào cắm vào một
cửa thật thì nó là **một tấm áp phích** — và một tấm áp phích về kỷ
luật vận hành làm người đọc yên tâm rằng chuyện đã được lo.

Nên phép đo nặng nhất của mục 88: **mỗi tên cửa trong bảng điều khiển
được đối chiếu với danh sách cửa THẬT**, đọc thẳng từ mã nguồn
`worker.js`. Một bảng điều khiển trỏ vào cửa không tồn tại thì ô ấy
trống, mà **một ô trống trong một bảng số đọc ra là số KHÔNG**.

Nó bắt ngay một chỗ thật khi vừa viết xong: câu lệnh *"Soi quyết
định"* trỏ vào `soatQuyetDinh` — một hàm thuần, không phải cửa. Sửa
đúng cách là **tách hai cửa**: `soiQuyetDinh` chỉ ĐỌC, `ghiQuyetDinh`
mới GHI và mới có răng. Cùng lối tách `docGopY` / `banMoiThiGiac`
(9.99.56).

### Bảng 12 chỉ số chia HAI NGĂN theo nguồn

Chín chỉ số **gọi thẳng cửa đã có** (`bayConSoCEO` · `docSongSinh` ·
`soatVungManh` · `chamKpiTaiChinh` · `doPheuThiGiac`); ba chỉ số
**người khai** nằm ngăn riêng, mỗi cái phải nói **vì sao người khai**
và **không được mang ô `cua`** — có ô cửa thì nó tự xưng là đo được.

**Chưa ai nhập thì BỎ HẲN KHOÁ, không ghi 0.** Trống là *"chưa ai
nhập"*, 0 là *"đo được và bằng không"*. Một số 0 cạnh chín số đo được
đọc ra là "chưa làm việc tử tế nào".

Chỉ số thứ mười hai — *số việc tử tế tầng 4–5* — **cố ý không có
ngưỡng báo động**: đặt ngưỡng cho "việc tử tế" là mời người ta chạy
cho đủ số. Bản đặc tả gọi nó là chỉ số ý nghĩa nhất và khó gian lận
nhất, và nó là việc của người vì một việc tử tế đã hoàn thành thì phải
có người nhìn thấy nó xảy ra.

### Năm bước quyết định — cái răng khó làm giả nhất là HAI MỐC

`quyetDinhLon` giữ `hoiNguocLuc` và `quyetLuc` riêng, và máy **so hai
mốc**. Viết câu hỏi ngược *sau* khi quyết thì nó không còn là phép dự
phòng — nó là **một lời biện minh**, và nó luôn nghe rất hợp lý. Một ô
tự khai `daHoiNguoc` bật được mà không viết gì; hai mốc thì không. Mục
88 canh rằng bảng **không mọc** ô tự khai ấy.

Hai răng còn lại: **ba phương án và một phải là "không làm gì"** (hai
phương án là một câu hỏi có/không đội lốt một lựa chọn, và "không làm
gì" thường là phương án đúng mà nó không bao giờ tự xuất hiện); **cờ
ĐỎ của ghế 5 hoặc ghế 7 thì DỪNG**, không ghi được bước 5.

Ô `giaDinh` là cột quan trọng nhất của bảng: giả định sai thì đổi
quyết định, mà muốn biết nó đã sai thì phải có ai đó viết nó ra từ
đầu, trước khi biết kết quả.

### Ba gia đình của nhịp tháng do MÁY BỐC

`chonBaNhaNgauNhien` **không nhận một ô lọc nào** (`O_LOC_CAM`) — phép
đo về thứ không được tồn tại, cùng lối với LR1 (mục 79). Để người chọn
thì họ chọn ba nhà đang vui: **không ai nói dối câu nào mà cả phép
kiểm vẫn mất nghĩa**, và đó là chỗ nguy hiểm nhất — một phép kiểm hỏng
mà vẫn báo xanh. Mỗi lượt bốc vào nhật ký **ngay**, vì cái đáng ngờ
chính là những lượt bốc bị bỏ đi.

### Bản tin sáng: cắt thì phải NÓI RA

Tối đa năm mục, xếp **GẤP lên trước**, và trả về `conLaiChuaTrinh`.
Cắt im lặng ở con số năm **tệ hơn trình ra ba mươi**: người đọc tin
rằng hôm nay chỉ có năm việc, và hai mươi lăm việc kia không ai biết
là có.

### Chuyển chặng: máy NÓI đủ rồi dừng

`soatChuyenChang` đo điều kiện và **không tự chuyển** — mọi quyết định
về quy mô nằm ở Vùng Đỏ. Chặng 3 và chặng 5 máy không đo được bằng một
con số (*"chất lượng không giảm khi chủ hệ vắng hai tuần"*) và nó khai
thẳng `nguoiDo` thay vì đoán.

### "Tôi vắng 3 ngày" — ngưỡng gọi TRỎ, không chép

`chuanBiVang` lấy `BoNao.DO10` — mười việc Vùng Đỏ — làm ngưỡng "bắt
buộc gọi dù đang bận". **Hai danh sách ngưỡng thì cái nào cũng tự tin,
và lúc gấp người ta đọc cái nào gần tay hơn.** Để trỏ được, `VIEC_DO`
của `bo-nao.js` nay **xuất ra** thành `DO10`.

Ô *"ai thay ghế nào"* **bỏ hẳn khoá**, không khai bừa một cái tên —
khai bừa thì lúc gấp người ấy không biết mình đang được trông đợi. Mục
chờ **HDH-02**.

### Năm thước đích 100% không có dung sai

Nới xuống 99% là bỏ hẳn phép canh — **một phần trăm của một nghìn lượt
là mười gia đình**. Cả năm **trỏ** vào một điểm của hàng rào 10 điểm
đã có, và mục 88 đối chiếu từng mã rào với bảng rào thật.


## BỘ PROMPT v3.0 — dựng lúc chạy, không chép (9.99.72)

Phần cuối tệp *Bộ Não Thiên Tài GITA 365*: bốn bản dán thẳng **A**
Coach · **B** Tham mưu trưởng · **C** Phản biện · **D** Soi luật. Màn
**Bộ prompt · 4 vai** (`src/bo-prompt.js`, bốn ngăn), máy chủ
`may-chu/bo-prompt.js`, kho `data.bo-prompt.js` (10 kho), bảng
`luotPrompt`, bộ kiểm **mục 89**, bảy phép đo ở `thu-worker.js`.

### Chỗ dễ dựng sai nhất của cả kho

Bốn prompt dài mười sáu nghìn ký tự, và **gần như mọi bảng trong
chúng kho này đã có rồi**: Hiến pháp ở `BN_HIENPHAP`, hàng rào ở
`BN_RAO10`, mười hai luồng ở `CK_LUONG12`, thang năm mức ở `CK_MUC5`,
ba vùng ở `BN_VUNG`, bảy ghế ở `BN_GHE`, bảy con số ở `TC_BAY7`, năm
bước ở `HDH_QUYET5`, hai luật ở `PLR_LUAT`.

Chép chúng vào kho là dựng **bản thứ hai của mười ba sự thật cùng một
lúc** — và bản thứ hai này **nguy hơn mọi bản thứ hai trước đó trong
kho**, vì prompt CHÍNH LÀ thứ nói chuyện với khách. Sửa Điều 3 ở màn
Bộ não rồi quên sửa prompt thì trợ lý vẫn gọi đứa trẻ là *"bé"* suốt
sáu tháng, trong khi mọi bộ kiểm đều xanh và màn hình vẫn hiện luật
mới.

Nên kho này **không chứa một chữ nào** của bốn prompt. Nó chỉ chứa
**dàn bài**: `BP_KHOI` — khối nào lấy từ kho nào. `G.bpDung(vai)` ghép
prompt **lúc chạy** từ các kho đã mở.

**Kéo theo, và đây là phần dễ quên:** màn ấy **không có nút lưu**. Lưu
ra một bản là tạo đúng cái bản thứ hai vừa nói. Modelfile chạy tại chỗ
cũng dựng lúc chạy — *một tệp Modelfile cũ nằm trên máy ai đó là một
bản Hiến pháp cũ đang chạy mà không ai biết.*

### Mục 89 chạy HAI CHIỀU NGƯỢC NHAU trên cùng một chỗ

- prompt **dựng ra** phải chứa đủ cả 13 điều, cả 10 điểm hàng rào, cả
  12 luồng — đọc thẳng từ kho để so
- **mã nguồn** dựng ra nó **không được chứa một chữ nào** của chúng

Chép sẵn thì chiều hai đỏ; dựng hỏng thì chiều một đỏ. **Không có cách
nào im cả hai.** Phá thử xác nhận: chèn `'1 SỰ THẬT — …'` vào
`src/bo-prompt.js` thì dòng đỏ gọi đúng tên hai cụm bị chép.

Và ô `layTuKho` được đối chiếu với **kho thật** — đổi `BN_RAO10` thành
`BN_HANGRAO10` thì khối ấy lúc dựng **lặng lẽ ra rỗng**, và một prompt
thiếu hàng rào trông y hệt một prompt đủ. Mục 89 bắt cả ba mặt: khối
trỏ sai, prompt A thiếu rào, prompt C thiếu rào.

### Vòng chạy sáu bước, và cái răng ở bước 2

`A soạn → C phản biện → A sửa → D soi luật → người duyệt → đăng.`

**Vai C phải ở nhà cung cấp KHÁC vai A** (`ghiLuotPrompt` → `TUDUYET`).
Cùng một mô hình làm cả hai thì phần duyệt chỉ là phần soạn nói lại
lần nữa, **và nó sẽ đồng ý với chính nó** — mà sổ vẫn đủ sáu dòng nên
không ai đọc ra. Cùng luật **L3** của thang năm cổng (9.99.42).

Ba cổng còn lại: không nhảy bước (`NHAYBUOC`); bước máy phải khai nhà
cung cấp (`THIEUNHA` — không khai thì luật soạn-khác-duyệt không kiểm
được, mà luật ấy là cả lý do vòng chạy tồn tại); bước người phải có
tên người (`THIEUNGUOI`).

`docVongChay` nêu **riêng** `thieuMay` và `thieuNguoi`: gộp thành một
con số "đã qua mấy bước" thì một bài mới chạy xong bốn bước máy trông
gần xong, trong khi thứ còn thiếu là **cả hai bước của người**.

### Nhiệt độ: hai vai soi thấp hơn hai vai soạn

C và D ở 0.2; A và B ở 0.4. **Một người soi ở nhiệt độ cao là một
người soi biết bịa ra lỗi** — và một lỗi bịa ra làm người viết thôi
tin cả bản soi. `soatNhietDo` trả về **vai nào** sai, không trả một
chữ "đạt": một chữ "đạt" không nói vai nào đang sai, và sửa mò thì lần
sau sai y hệt.

### Bốn vai KHÔNG phải bốn phần mềm mới

`BP_NOI` gắn chúng vào **bảy cửa đã chạy sẵn** (`traLoiCoach` ·
`banTinSang` · `soatBoNao` · `soatNoiDung` · `docVungLuatSu` ·
`soatTiepThi`), và mục 89 đối chiếu từng cửa với danh sách cửa thật
của worker, từng màn với `G.NAV`.

### Hai lỗi ở phép đo của tôi, bắt ngay lượt chạy đầu

1. **Dò chuỗi lỏng bắt oan.** `/INSERT INTO .*prompt.*chu/i` khớp vào
   cột `ghiChu` của chính bảng `luotPrompt`. Sửa bằng cách đọc **cột
   thật** của bảng rồi so tên — một phép đo bắt oan thì lần sau người
   ta tắt nó đi.
2. **Đọc sai hình `G.NAV`.** NAV là **nhóm → `items`**, không phải
   danh sách phẳng, nên bảy màn thật đều bị báo là không có trong NAV.

---

## BẢNG GIÁ SỬA ĐƯỢC — khung ở kho, số ở sổ (9.99.73)

Chủ hệ nói thẳng một câu, và câu ấy đổi một giả định nền: *"Giá hiện
tại là tạm thời để xây dựng. Bộ khung là cố định. Tạo thêm chức năng
cập nhật và chỉnh sửa số ở bảng giá."*

Tới 9.99.72 kho làm ngược — giá là **hằng số ở hai chỗ** (`HP_TANG[].gia`
trong kho mã hoá và một hằng trong `tai-chinh.js`), nên đổi một con số
phải qua trọn một lượt phát hành. **Một con số tạm mà cứng như thế thì
trên thực tế nó không tạm** — và cái cứng nhầm chỗ thì người ta đi
đường vòng: gõ tay số khác vào hợp đồng, và từ đó sổ với hợp đồng nói
hai giá.

Màn **Bảng giá** (`src/bang-gia.js`, ba ngăn), máy chủ
`may-chu/bang-gia.js`, kho `data.bang-gia.js` (6 kho), bảng `bangGia`,
bộ kiểm **mục 90**, mười bốn phép đo ở `thu-worker.js`.

### Cắt theo THỨ GÌ ĐỔI NHANH, không theo thứ gì tiện sửa

Không phải mọi thứ trong bảng giá đều tạm:

| Nửa | Ở đâu | Đổi thế nào |
|---|---|---|
| **Khung** — tên · gồm · KHÔNG gồm · nhịp thu · hoàn | kho (`G.HP_TANG`) | sửa kho gốc rồi phát hành lại |
| **Số** — con số tiền từng bậc | sổ (bảng `bangGia` ở D1) | sửa ngay trên màn, chỉ R01, phải viết lý do |

Khung là thứ Học viện **HỨA GIAO**. Lời hứa đổi thì phải để lại một
bản đọc lại được — một gia đình ký hôm nay phải chỉ ra được bản mô tả
nào đang áp cho họ. **Cắt theo thứ tiện sửa thì cuối cùng mọi thứ đều
chui vào chỗ sửa nhanh, kể cả lời hứa.**

Bảng **không có cột "giá hiện tại"**: giá đang chạy là dòng mới nhất
của bậc ấy, tính lúc đọc. Cùng luật với cột `conHan` không có trong
`theVungManh` (9.99.63) và cột `den` không có trong `hoSoSongSinh`
(9.99.66).

### Ba cái răng, và mỗi cái có một phép đo hành vi

1. **R1 · giá đã chốt vào lịch thu thì ĐỨNG YÊN.** `dungLichThu` đọc
   giá một lần rồi **đóng băng** số tiền vào từng kỳ. Đổi theo là đổi
   số tiền một gia đình đã ký — họ không được hỏi, và họ chỉ biết khi
   nhìn hoá đơn. Nửa kia cũng phải đo: **nhà ký sau khi đổi giá thì
   lịch thu mang giá mới** — thiếu nửa ấy thì cả cửa đổi giá là một
   cái nút không nối vào đâu cả.
2. **R2 · đổi giá KHÔNG tự dời thang duyệt chi.** `soatNeoThang(giá)`
   **nêu** chỗ lệch rồi dừng. Thang tự dời theo giá nghĩa là quyền
   tiêu tiền của cả Học viện đổi mà không ai ký.
3. **R3 · giá là VÙNG ĐỎ.** Chỉ R01, lý do tối thiểu mười ký tự, và
   bậc **mới** phải khai đủ năm ô khung. Mã `datGia` được đối chiếu
   với `BoNao.DO10` thật — trỏ vào một cái tên không tồn tại thì cổng
   lặng lẽ không chặn gì, mà nhìn vẫn y hệt một cổng đủ răng.

### Đổi tên `GIA_TANG` → `GIA_KHOI_DAU` là cố ý

Giá nay sửa được trong sổ, nên **một hằng số tên "giá tầng" mà không
phải giá đang chạy là cái bẫy đúng nghĩa**: người đọc sau tin nó, tính
một con số, và con số ấy sai theo đúng hướng không ai kiểm. Tên mới
nói thẳng nó là gì, và nó dời sang `bang-gia.js`.

Mục 90 thêm một vế: **đúng MỘT tệp trong `may-chu/` được khai hằng
giá**, và mọi tệp khác dùng giá đều phải **nhập** từ `bang-gia.js`.
Vế ấy dò **CHỖ KHAI, không dò con số** — dò con số thì thang duyệt chi
bị bắt oan, vì nó neo vào giá gói một cách hợp lệ và đó chính là thứ
`soatNeoThang()` sinh ra để nêu.

### Phép đo giá chuyển từ mục 71 sang mục 90 — và vì sao

Phép đo ấy **nằm lọt trong khối mục 80** từ lâu, nên mọi dòng đỏ của
nó in ra `[mục 80]` trong khi chú giải — và cả tệp này — đều gọi nó là
mục 71. Cùng lớp lỗi đã ghi ở 9.99.63: **con trỏ chỉ sai chỗ tệ hơn
không có con trỏ**, vì người đọc tin nó, đi tìm ở mục 71, không thấy
gì, rồi ngờ chính phép đo. Và nó chỉ lộ ra lúc phá thử — lúc xanh thì
không có dòng đỏ nào để mà sai.

Cùng lượt ấy, `bao()` và câu chi tiết của phép đo giá lại là **hai bản
chép viết tay của cùng một biểu thức**: `bao()` xét cả thang neo, câu
chi tiết chỉ xét hai bản giá. Nay tính một lần vào `const giaDat`.
Đúng chuyện đã xảy ra ba lần và đã ghi ở 9.99.60.

### Hai chỗ phép đo của chính tôi suýt câm

1. **Phép so lịch thu sẽ XANH mãi mãi nếu lịch rỗng** — `0 === 0`.
   Thêm `truocKy.length > 0`. Một phép đo chỉ đúng khi cái nó đo **có
   thể sai**.
2. **Phá thử R2 cho thấy phải tách làm hai.** Bắt thang tự dời theo
   giá thì phép đo `khop === false` **vẫn xanh** — vì cái neo `C1` nằm
   ngoài vòng lặp nên vẫn báo lệch. Chỉ phép đo thứ hai, đọc thẳng con
   số nấc N3 trong chính dòng báo lệch, mới bắt được. Một phép đo nhìn
   vào kết luận chung thì nó không thấy nửa đã trôi.

### Sổ chờ

- **BG-01** — bậc 5.000.000đ và đơn vị tính: tệp Hiến pháp của chủ hệ
  dựng sáu bậc theo NĂM, kho dựng năm bậc theo CHẶNG. Máy không tự
  chọn bản nào đúng, vì **đặt giá là Vùng Đỏ**. Chủ hệ đã chốt ở
  9.99.73: **giữ năm bậc theo chặng**; mục còn lại là bậc 5 triệu.
- **BG-02** — ai chốt lại thang duyệt chi sau mỗi lần đổi giá, và
  trong bao lâu. `soatNeoThang` đã nêu sẵn chỗ lệch.

---

## MƯỜI HAI LUẬT GIAO DIỆN — răng ở máy chủ (9.99.74)

Theo **MỤC C · Frontend GITA 365 — Ứng dụng gia đình** của chủ hệ (tệp
*AI Đào Tạo 365*). Màn **Luật giao diện** (`src/luat-giao-dien.js`, ba
ngăn), máy chủ `may-chu/luat-giao-dien.js`, kho `data.luat-giao-dien.js`
(10 kho), bộ kiểm **mục 91**, tám phép đo ở `thu-worker.js`.

Bản đặc tả tự viết ra lý do của cả phần này: *"Ba mươi phần của khoá
học đặt ra rất nhiều luật phủ quyết và gác an toàn. Nếu frontend không
cưỡng chế chúng, chúng chỉ là chữ trên giấy."*

### Răng nằm ở MÁY CHỦ, không ở màn hình

Giao diện là thứ bị viết lại nhiều nhất trong mọi kho. Một luật giao
diện sống trong mã giao diện thì nó **chết cùng lượt viết lại đầu
tiên** — và chết lặng lẽ, vì bản mới trông vẫn đẹp.

Đặt cổng ở máy chủ thì một bản giao diện mới, một ứng dụng di động viết
sau, hay một người gọi thẳng vào cửa bằng công cụ nhà phát triển đều
gặp cùng một cái cổng.

### Mỗi luật khai ĐÚNG MỘT đường: `rangO` hoặc `chuaCoMat`

Kho có chỗ cắm răng cho **bảy** luật; **năm** luật còn lại nói về màn
hình chưa dựng. Trình cả mười hai như đã cưỡng chế thì người duyệt thấy
mười hai dấu tick rồi thôi không đọc — và năm luật chưa có răng lại
đúng là năm luật **sẽ được viết bởi người không đọc tệp này**. Cùng luật
với `mayDo`/`nguoiDo` của Hiến pháp (9.99.62).

Cửa `docLuatGiaoDien` trả **hai ngăn riêng**, không một phân số "đã
cưỡng chế mấy trên mười hai": một phân số ở đây đọc ra như mức hoàn
thành.

### Phép canh đặt TRƯỚC — phần dễ bỏ nhất, đáng giá nhất

Một luật về màn hình chưa dựng nghe như không đo được. Nó đo được, và
phép đo mạnh hơn phép đo thường: nó canh rằng **cửa ấy chưa tồn tại**.

| Luật | Canh gì |
|---|---|
| L03 Chế độ Bão | cửa tên `cheDoBao*` mà nhận ô `lyDo`/`xacNhan` là đỏ |
| L06 Ghim của con | cửa ghi ghim mà không so `hoSo.uid` với chủ ghim là đỏ |
| L07 Phủ quyết ảnh con | cửa chia sẻ ảnh trẻ mà không kiểm cờ đồng ý là đỏ |
| L11 Không hỏi vặn | cửa ghi lượt bỏ việc mà **ĐÒI** lý do là đỏ |
| L12 Đường thoát | màn khai `nangNe` mà thiếu nút "Để hôm khác" là đỏ |

Lối đo thứ năm dùng phép đo về thứ không được tồn tại, sau LR1 (mục
79), ô tự khai (mục 81), cột đèn (mục 83), cột ba cửa (mục 86) và ô lọc
bốc nhà (mục 88).

### L02 — một lỗ THẬT tìm ra khi dựng phần này

Luật: *không mã nào giảm cấp hiện tại, kể cả sau mười hai tháng không
hoạt động.* Cổng cũ nằm ở `nangTang` và đòi `tangMoi === tier + 1`.
Nhưng **`ghiDoiTang` nhận `denTang` tự do**, và hôm nay nó chỉ có đúng
một người gọi. Người gọi thứ hai viết sau — một lượt nhập liệu hàng
loạt, một lượt sửa nhầm tay — hạ tầng một nhà mà không gì chặn, và lịch
thu dựng lại theo tầng thấp hơn.

Nay cổng nằm ở **chỗ GHI**, trước câu `INSERT`. Cổng ở chỗ gọi thì nó
chỉ bảo vệ đúng người gọi ấy — cùng cái bẫy đã ghi ở cổng ADN (9.99.56)
và cổng ba cửa (9.99.69).

### L04 đứng TRƯỚC cổng ẩn danh, và thứ tự ấy là luật

Cổng ẩn danh nói *"gửi được, nhưng phải ẩn danh trước"*; cổng vòng đỏ
nói *"KHÔNG gửi, ẩn danh cũng không"*. Đặt sau thì người gửi nhận lời
chỉ đường của cổng ẩn danh, làm theo, và lần thứ hai thì lọt — **một
cổng chỉ đường sai là một cổng dạy người ta cách đi vòng qua chính nó.**

Năm ô vòng đỏ chặn theo **TÊN Ô**, và soi **mọi tầng** của vật: gói ô
ấy vào một ô con là lọt, và người gói không cố ý — họ chỉ đang gom dữ
liệu cho gọn.

### L10 chặn vì máy viết HAY, không vì máy viết dở

Bốn thứ máy không soạn hộ: lời khen con · lời xin lỗi · thư tha thứ ·
tin nhắn an ủi. Chặn ĐẦU cửa `traLoiCoach`, trước cả phân luồng — chúng
không phải một luồng khó cần thêm người duyệt.

**Chặn vì nó viết dở thì mai nó viết hay hơn là luật hết hiệu lực.**
Cùng luật với ghế G5 Người giữ hồn (9.99.64). Và cổng trả kèm **dòng
nhắc**, không đuổi người hỏi đi tay không: họ đang cần viết một câu
khó, và đuổi đi thì lần sau họ đi hỏi một cái máy không có cổng nào.

### Ba chỗ phép đo của chính tôi sai, phá thử dạy lại

1. **Dò `12/12` trên cả tệp bắt oan chính câu chú giải** nói vì sao
   không được gộp. Nay đọc **thân hàm**, bỏ chú giải và chuỗi, rồi soi
   tên ô thật sự được trả về. Cùng chỗ đã sập ở mục 89 với cột `ghiChu`.
2. **Phép đo worker nói "chặn rồi thì không ghi gì cả" mà chỉ đo một
   nửa** — nó xem `hoSoKhach.tang` chứ không xem `lichSuTang`. Phá thử
   (dời cổng xuống sau `INSERT`) cho thấy nó **câm**: lịch sử tầng mọc
   một dòng "xuống tầng 1" trong khi tầng thật đứng yên. Một dòng lịch
   sử kể một chuyện chưa từng xảy ra là thứ người đọc sổ sáu tháng sau
   tin.
3. **Bản vá của lỗi 2 lại bắt oan**: đếm `denTang=1` bắt nhầm một dòng
   hợp lệ — chính nhà ấy đã lên tầng 1 thật. Nay đếm **trước–sau**, và
   không còn chỗ nào để bắt oan.

### Lời chặn cho vai không có gói nghề phải NÓI ĐỦ

Bản đầu dài 584 ký tự và bộ rà soát chỗ trống báo đỏ — đúng. Một câu từ
chối cụt đọc ra là *"chỗ này chưa làm xong"*, và người đọc nó là phụ
huynh: họ vừa gặp một màn nói rằng có mười hai luật bảo vệ nhà họ, rồi
không được nói luật nào cả. Nay kể đủ bằng **chữ tĩnh** — mười hai luật
là lời hứa VỚI gia đình, nên gia đình đọc được là đúng; thứ nằm trong
gói nghề là chỗ cắm răng và mã nguồn, không phải lời hứa.

### Hai trục — một chỗ lệch bản đặc tả tự nêu ra

Thứ tự 30 phần (giáo trình) và 5 tầng hành trình (trạng thái một gia
đình) **không khớp**: P14 nằm tầng 3 nhưng thuộc tầng 2 theo nghĩa;
P27 · P28 nằm tầng 5 nhưng thuộc tầng 2. Đã chốt **giữ nguyên và nói
rõ**: cấp là ĐƠN VỊ TIẾN ĐỘ, tầng là TÊN GỌI của một dải tiến độ —
không phải phân loại nội dung. 1 cấp = 20 điểm chạm, tổng đúng 1000.

### Sổ chờ

- **LGD-01** — bốn tab ứng dụng gia đình (Hôm nay · Bản đồ · Chỉ số ·
  Điểm chạm) là một bề mặt RIÊNG hay mấy màn thêm vào cổng phụ huynh đã
  có. Chốt xong thì năm luật canh-đặt-trước mới có chỗ cắm răng thật.
- **LGD-02** — đường khoá thiết bị cho năm ô vòng đỏ. Cửa `soatVongDo`
  đã chặn sẵn đường lên máy chủ nên mục này không chặn lối nào.

---

## MÀN HÔM NAY — LGD-01 đã chốt, năm luật hết treo (9.99.75)

Chủ hệ chốt **LGD-01: thêm màn vào cổng phụ huynh đã có**, không dựng
bề mặt riêng. Chốt ấy gỡ năm luật giao diện khỏi chỗ treo — L03 · L06 ·
L07 · L11 · L12 nay có bề mặt để cắm răng, nên **cả mười hai đều khai
`rangO`**.

Màn **Hôm nay** (`src/hom-nay.js`), máy chủ `may-chu/hom-nay.js`, kho
`data.hom-nay.js` (9 kho), bảng `nhipNha` · `nhipXong` · `cheDoBao` ·
`ghimCon` · `dongYAnhCon`, mục **91** mở rộng, mười ba phép đo ở
`thu-worker.js`.

### Chỉ dựng thứ chưa có

Bốn tab bản đặc tả là *Hôm nay · Bản đồ · Chỉ số · Điểm chạm*. Cổng `ph`
**đã có** `ban-do` và `tien-bo`. Dựng lại chúng là dựng bản thứ hai của
hai màn đang chạy — và hai bản thì sẽ có ngày lệch nhau, lúc ấy một gia
đình đọc hai con số khác nhau về chính nhà mình. Chỉ **Hôm nay** là mới.

**Một màn — một việc.** Máy chủ trả về ĐÚNG MỘT việc (`viecLon`), không
một danh sách. Trả danh sách rồi để màn hình lấy cái đầu thì luật nằm ở
màn hình, và luật ở màn hình chết cùng lượt viết lại đầu tiên.

### Năm cái răng mới

| Luật | Răng |
|---|---|
| L03 Chế độ Bão | `batCheDoBao` **không nhận** ô `lyDo`/`xacNhan`; bảng cũng không có cột ấy |
| L06 Ghim của con | `ghiGhimCon` hỏi tài khoản của phiên, chặn trước `INSERT` |
| L07 Phủ quyết ảnh | `chiaSeCoAnhCon` chặn `CHUAHOI` và `CONTUCHOI` bằng **hai mã** |
| L11 Không hỏi vặn | `boViecHomNay` **nhận** ô lý do và **không bao giờ đòi** |
| L12 Đường thoát | hai nút dùng **chung lớp** `.nm-nut`; cỡ quyết ở đúng một chỗ |

**Không "nhận rồi bỏ qua".** Một ô nhận vào là một ô màn hình hỏi được
— người viết màn sau đọc chữ ký hàm, không đọc chú giải.

**L11 là hai vế ngược nhau trên một hàm:** thiếu ô thì người muốn nói
không có chỗ nói; đòi ô thì nó thành cửa quay. Khác nhau ở chỗ **MỜI
hay ÉP**.

**L12 · hai nút một lớp.** Đặt hai lớp riêng rồi cố cho chúng bằng nhau
là để dành sẵn một chỗ lệch: người sửa CSS sau đổi một lớp mà quên lớp
kia, nút thoát nhỏ đi, và không ai thấy. Mục 91 canh rằng `padding ·
font-size · min-height · flex · border-radius` chỉ xuất hiện ở `.nm-nut`,
còn `.nm-xong`/`.nm-thoat` chỉ được đổi **màu**.

### Phép canh đặt trước KHÔNG bị gỡ

`CANH_TRUOC = []` — rỗng, không xoá. Phép đo ở mục 91 vẫn chạy và vẫn
canh những **cửa chưa viết**: cửa Chế độ Bão THỨ HAI, cửa ghim THỨ HAI.
Gỡ nó vì *"đã có cổng rồi"* là bỏ đúng lớp bảo vệ dành cho người viết
cửa sau — và người viết cửa sau là người không đọc tệp này.

Cách loại trừ là **khai một nhà chính thức** (`NHA_CUA_CONG =
'hom-nay.js'`), không phải thêm tên hàm vào danh sách nhận diện. Lượt
chạy đầu chứng minh lại bài học 9.99.60: đổi thân hàm sang gọi
`laChinhEmAy` thì phép dò không thấy `hoSo.uid` nữa và **báo đỏ một cổng
đang chạy đúng**. Phép dò chữ chỉ kiểm được những tên nó ĐÃ BIẾT.

### Hai lỗ THẬT bộ thử bắt, và cả hai đều mở trong im lặng

**1. `hoSo` KHÔNG CÓ ô `maKhachHang`** — lần thứ TƯ cái bẫy này cắn kho,
sau `hoSo.username` (9.99.55) và `hoSo.vai` (9.99.62). JavaScript trả
`undefined`, phép so luôn sai, và **cả bốn cửa đóng với mọi người mà
không báo gì cả**: màn hiện "chưa đọc được nhịp" mãi mãi, không một dòng
lỗi nào để lần theo. Mã khách hàng nằm ở **hàng `users`**, đọc qua
`Kho.nguoiTheoId`.

**2. `users.studentId` mang HAI NGHĨA.** `dang-ky.js` ghi `studentId =
maHV` vào chính hàng của *phụ huynh*, nên cột ấy nói được hai câu khác
hẳn nhau — *tài khoản NÀY LÀ em ấy* (R14) và *tài khoản NÀY CÓ CON LÀ em
ấy* (R13). Bản đầu của `laChinhEmAy` chỉ so `studentId`, và **cha mẹ
qua được cả L06 lẫn L07** — đúng thứ hai luật ấy sinh ra để chặn. Nay
hỏi cả hai: đúng hồ sơ **và** vai là `R14`, đọc từ hàng users chứ không
từ ô `role` của phiên (vai trong phiên đổi được sau khi mở phiên).

### Ba chỗ phép đo của chính tôi hỏng

1. **Dòng chi tiết dereference thứ đang đo.** `hn1.than.viecLon.ten` khi
   `viecLon` undefined thì phép đo không ĐỎ — nó **SẬP**, và một lượt
   sập giấu luôn mười hai phép đo đứng sau. Một phép đo chỉ dùng được
   khi lúc sai nó còn **in ra** được.
2. **Tôi đọc nhầm một lượt sập thành một lượt xanh** — `grep "^  ✗"`
   không khớp dòng `TypeError`, nên khối mới trông như đã qua. Phá thử
   mới lộ ra là nó chưa bao giờ chạy.
3. **CSS đẻ hai bậc cỡ chữ mới** (24px · 14px) vì "vừa mắt". Bộ rà soát
   bắt ngay: bản 9.25 từng có hai mươi sáu bậc, nghĩa là không có thang
   nào cả. Gấp về thang chín bậc — sửa CSS, không sửa ngưỡng.

### Sổ chờ

- **NM-01** — danh sách nhịp gợi ý: để trống hẳn cho nhà tự viết, hay
  gợi ý đúng BA nhịp. Ba thì còn phải chọn; mười thì thành một thực đơn,
  và chọn trong thực đơn không phải là quyết định của mình.
- **LGD-01 đã chốt** → `G.NM_DACHOT`. Gỡ khỏi sổ chờ, **không xoá**.

---

## GITA-VIP — trần phạm vi giám sát (9.99.76)

Theo bản đặc tả `GITA-VIP v2.0 ELITE` của chủ hệ. Màn **Trần giám sát**
(`src/giam-sat.js`, bốn ngăn), máy chủ `may-chu/giam-sat.js`, kho
`data.giam-sat.js` (8 kho), bảng `lenhGiamSat` và `soDen`, bộ kiểm
**mục 92**, mười bốn phép đo ở `thu-worker.js`.

### Dựng CÁI TRẦN trước, chưa dựng bộ giám sát

Cùng thứ tự đã chọn với Hiến pháp ở 9.99.62. Ở đây còn gắt hơn, vì thứ
đang dựng là một hệ **nhìn vào người**: một cái cổng dựng SAU một cái
cửa đã chạy thì nó chỉ là một lời nhắc.

### Bản đặc tả va vào SÁU luật chủ hệ đã duyệt

| Bản đặc tả đòi | Va vào |
|---|---|
| GPI-2 xếp hạng Kim Cương→Cảnh báo cho TỪNG học sinh | **LR1** (9.99.63) · **L01** · **L05** (9.99.74) |
| Sinh trắc 1Hz (face · voice · keystroke) cho trẻ <18 | **Điều 13** (9.99.62) · Luật 91/2025 |
| *"Chuỗi 21 ngày tạm dừng hôm nay"* | **L08** không giữ chân |
| Conversation Desk hỏi *"điều gì đang xảy ra"* | **L11** không hỏi vặn |
| *"GPI tạm giữ"* · *"đình chỉ quyền lợi"* | **L02** không tụt cấp |
| *"Chính xác 1000%"* | **QC1** từ tuyệt đối (9.99.65) |

Dựng theo bản đặc tả mà không nói ra chỗ va là **đem sáu quyết định cũ
ra huỷ trong im lặng**. Nên sáu điều CẤM nằm ở **ngăn đầu** của màn,
không giấu xuống cuối, và mỗi điều **trỏ vào mã luật có thật**.

### TRẦN khác QUYỀN

`CAM_TUYET_DOI` không cấp được, **kể cả bằng lệnh R01 có chữ ký**. Quyền
thì cấp được, và một quyền cấp được là một quyền **sẽ** được cấp — đúng
vào ngày có người thấy cần.

Cổng trần đứng **trước mọi cổng khác**: báo *"thiếu lý do"* trước là chỉ
người cấp đường viết thêm một câu rồi gửi lại, trong khi lệnh ấy không
được tồn tại.

### Ba ngăn phạm vi khác nhau ở CĂN CỨ PHÁP LÝ

Bản đặc tả xếp chín cấp vào **một** bảng, cùng cột *"bị giám sát full"*
— nên một nhân sự hưởng lương và một đứa trẻ tám tuổi nằm cùng một hàng,
cùng một kiểu chữ.

- **NHANSU** (R01–R12) — quan hệ lao động, giám sát là việc chính đáng,
  và **phải báo trước**: giám sát không báo trước thì nó không phải quản
  lý, nó là rình.
- **KHACH** (R13) — quan hệ dịch vụ. Học viện đo thứ mình **GIAO**,
  không đo người **NHẬN**.
- **TRE** (R14) — không ký hợp đồng nào và không rời đi được. Ngăn này
  chặn cả *"theo giây"* kể cả khi câu chữ không mang dấu hiệu nào.

### Lệnh uỷ quyền: phải có hạn, và tự thu hồi

Không có quyền vĩnh viễn mặc định. **Một quyền không có hạn là một
quyền không ai nhớ đi thu lại** — sáu tháng sau nó vẫn mở, người được
cấp đã chuyển việc, và không ai biết nó còn đó.

Còn hiệu lực **tính lúc đọc**; bảng không có cột `dangHieuLuc`, và
`hanDen` **không cho NULL**. Sổ nêu **ba nhóm riêng** (đang chạy · đã
hết hạn · đã thu tay) — gộp thì một quyền đã hết hạn nằm chung rổ với
một quyền vừa cấp sáng nay.

### Sổ nối băm — và nó NÓI RA giới hạn của chính nó

Sửa một dòng giữa sổ là vỡ mọi dòng sau; `soatSoDen` nói ra **vỡ ở dòng
nào**, không trả một chữ "đạt".

Và nó khai thẳng thứ nó **không** làm được: không chống được người xoá
cả sổ, chỉ chống được người sửa **một** dòng rồi để nguyên phần còn lại
— đó mới là thứ hay xảy ra, vì xoá cả sổ thì ai cũng thấy. Cùng lý do
9.99.57 từ chối làm dấu chìm trong bit thấp: **một lớp bảo vệ không nói
giới hạn thì người đọc tin nó chống được nhiều hơn thật.**

### Sáu mươi phương pháp — phân loại trung thực

14 dựng được · **21 bị luật kho chặn** · 25 chờ chủ hệ. Không phải
"chưa dựng" — là **không dựng**, và mỗi cái trỏ vào điều cấm nào.

### Hai lỗi của chính tôi, phá thử và bộ thử bắt

1. **`\b` không khớp chữ có dấu — cái bẫy ĐẦU TIÊN tệp này ghi, và nó
   vừa cắn lần nữa.** `/\bĐiều 13\b/` không bao giờ khớp vì "Đ" nằm
   ngoài lớp `\w`, nên C2 · C3 báo đỏ oan. Tách hai phép: mã La-tinh dò
   có biên, cụm tiếng Việt dò chuỗi con.
2. **Cổng NGANGCAP MỞ khi không tra được người.** `if (bacNguoi !== null
   && ...)` — không tìm thấy thì bỏ qua. Hai lỗi trong một dòng:
   `nguoiTheoId` tra theo ID còn lệnh khai bằng tên đăng nhập, nên cổng
   **chưa bao giờ chặn gì**; và nặng hơn — **một cổng không xác minh
   được thì phải ĐÓNG**. Mở là chọn cái tiện lúc viết, và cái tiện ấy
   rơi đúng vào chỗ nguy hiểm nhất.
3. **Vá lỗi 2 mà không thêm phép đo canh nó quay lại.** Mọi phép đo lúc
   ấy đều dùng một người CÓ THẬT. Phá thử lộ ra, và nay có phép đo gọi
   lệnh cho một người không tồn tại.

### Sổ chờ

- **VIP-01** — giám sát gia đình: giữ sáu luật cũ, hay sửa luật để theo
  bản đặc tả. Máy không tự chọn: đây là quyết định về quan hệ giữa Học
  viện với gia đình, có hậu quả pháp lý theo Luật 91/2025. Phần trẻ dưới
  18 nên hỏi luật sư trước — `PLR_VUNG4` đã có sẵn câu hỏi để mang đi.
- **VIP-02** — trần 20% tài nguyên của Tư Vấn tính trên mẫu số nào, và
  chạm trần thì **báo** hay **chặn**.

## VÒNG TỰ NÂNG CẤP — cửa thứ nhất không được tự mở (9.99.77)

Theo **Phần 18 · 25 · 13** của bản đặc tả `BẢN CAO CẤP GITA365 ×10`. Màn
**Vòng tự nâng cấp** (`src/tu-nang-cap.js`, bốn ngăn), máy chủ
`may-chu/tu-nang-cap.js`, kho `data.tu-nang-cap.js` (9 kho), bảng
`luotNangCap`, bộ kiểm **mục 93**, mười bảy phép đo ở `thu-worker.js`.

### Câu phải nói trước mọi thứ khác

**Một hệ tự nâng cấp mà sửa được chính đường nâng cấp của nó là một hệ
không có giới hạn nào cả.**

Mười lăm bản trước dựng từng cái cổng một — Hiến pháp mười ba điều, hàng
rào mười điểm, mười hai luật giao diện, trần giám sát sáu điều cấm. Bản
đặc tả đề nghị nâng cấp *+0,5% mỗi tuần · +10% mỗi quý*. Nếu đường nâng
cấp ấy chạm được vào chúng thì **cả mười lăm bị gỡ bằng ĐÚNG MỘT lượt**
— và gỡ hợp lệ, có chữ ký, sổ đầy đủ.

Nên bảy vùng không chạm được dựng **TRƯỚC** vòng năm cửa. Lần thứ ba thứ
tự ấy được chọn, sau Hiến pháp (9.99.62) và trần giám sát (9.99.76).

### Chạm vùng cấm KHÔNG rơi vào một cấp cao — nó rơi RA NGOÀI

Chỗ dễ dựng sai nhất của cả bản. `xepCap` trả `ngoaiDuong` và **không
mang một con số cấp nào**; mục 93 đọc thẳng nhánh ấy và đỏ nếu thấy ô
`cap`.

*"Cần duyệt cao hơn" là một cái thang, và mọi cái thang đều leo được.*
Trả về "Cấp 8" là mời người ta đi tìm một chữ ký Cấp 8 — và một chữ ký
Cấp 8 thì tìm được. Đường đi thật: sửa kho gốc, qua một lượt phát hành,
có người đọc diff, có bộ kiểm chạy. Chậm hơn, và chậm ở đúng chỗ đáng
chậm.

**K5 là vùng dễ quên nhất**, vì nó là vùng duy nhất không bảo vệ một thứ
khác — nó nói về chính đường nâng cấp. Mục 93 có phép đo riêng đòi K5 có
mặt.

### MÁY xếp cấp, và không có đường nào cho người đề xuất tự chọn

Phép đo về thứ **không được tồn tại**, lối đo thứ sáu trong bộ sau LR1
(79) · ô tự khai (81) · cột đèn (83) · cột ba cửa (86) · ô lọc bốc nhà
(88) · cửa chưa dựng (91): mô-đun không đọc ô `x.cap` nào, và bảng không
mọc cột `capNguoiXin`.

Vì sao: *để người đề xuất tự xếp thì mọi thứ đều là Cấp 1 — không ai cố
ý nói dối, họ chỉ thật lòng thấy việc mình đang làm là việc nhỏ.* Máy
xếp sai thì xin **NÂNG** lên được, **KHÔNG hạ** xuống được: nâng nhầm
thì tốn thời gian, hạ nhầm thì lọt.

Phép đo mạnh nhất đo **hành vi**: truyền thẳng `cap: 1` vào cửa mà sổ
vẫn ghi cấp 5.

### Cửa 4 so HAI MỐC THẬT, và đường lùi phải được THỬ

`thuBatDau` và `thuKetThuc` là hai mốc, máy trừ. Bảng **không có** ô
tích `daChayThu` — một ô như thế bật được trong một giây, và con số giờ
vẫn đủ trong sổ. Cùng luật với hai mốc của `quyetDinhLon` (9.99.71).

Ô *"lùi lại thế nào"* viết ở cửa 1 là **một lời khai**; thử ở cửa 4 mới
là **một phép đo**. Một đường lùi chưa ai đi thử là một đường lùi không
tồn tại — và người ta chỉ phát hiện ra điều đó vào đúng lúc cần nó.

Người ký khác người đề xuất, người soi luật cũng thế: cùng một người làm
cả hai thì phần duyệt chỉ là phần đề xuất nói lại lần nữa, **và nó sẽ
đồng ý với chính nó** — mà sổ vẫn đủ năm dòng nên không ai đọc ra. Cùng
luật L3 (9.99.42) và vai C khác vai A (9.99.72).

### Ba phép đo của chính tôi sai, và cả ba là lỗi ở PHÉP ĐO

Không cái nào là lỗi ở mã — và cả ba đều là lớp lỗi tệp này đã ghi rồi:

1. **Phép dò tên kho chỉ biết một trong ba chỗ.** Ô `kho` của K7 trỏ vào
   `NAC_THANG`, có thật nhưng là **hằng ở máy chủ**, không phải kho
   `G.*` — nên phép đo báo đỏ một vùng đang trỏ đúng. Nay tra cả ba
   chỗ: kho `G.*`, hằng trong `may-chu/*.js`, bảng trong `csdl.sql`.
2. **Phép dò `hoSo.username` bắt oan chính câu chú giải** cảnh báo về
   cái bẫy ấy. Cùng chỗ đã sập ở mục 89 với cột `ghiChu` và mục 91 với
   dòng `12/12`. Nay dò trên mã đã **bỏ chú giải**. Một phép đo bắt oan
   lời cảnh báo về một cái bẫy là phép đo **dạy người ta xoá lời cảnh
   báo đi**.
3. **Phép đo đường lùi XANH MÃI MÃI.** Nó dò chuỗi `CHUATHULUI` trên cả
   tệp, mà chuỗi ấy còn nguyên kể cả khi cổng bị vô hiệu bằng
   `if (false && !luiDaThu)`. Phá thử lộ ra: bộ thử worker đỏ, mục 93
   **im**. Một phép kiểm chưa từng đỏ thì chưa phải phép kiểm; một phép
   kiểm **KHÔNG THỂ đỏ** thì tệ hơn — nó khai rằng chỗ ấy đã được canh,
   nên không ai canh nữa. Nay đo **VỊ TRÍ**: cổng phải nằm TRƯỚC câu
   `UPDATE ... SET thuKetThuc`, cùng lối "cổng trước INSERT" của mục
   86 · 87 · 91.

### Một lỗ THẬT, tìm ra bằng cách đọc lại diff của chính mình

`soiLuatNangCap` và `mocChayThu` lúc đầu **không kiểm vai nào cả**. Cửa
worker chỉ đòi **một phiên hợp lệ** — nó **không đòi vai**, và đó đúng
là chỗ dễ tưởng là đã có. Hậu quả: một phụ huynh đăng nhập bình thường
ghi được **kết luận pháp lý** và **mốc chạy thử** cho một lượt nâng cấp
hệ.

Kéo theo hai chỗ nữa cùng lớp:

- **Tên người soi luật là chữ tự do** — gõ *"luật sư A"* là qua, và ô ấy
  thành một lời khai không kiểm lại được, đúng thứ cửa này sinh ra để
  chặn. Nay tra tài khoản thật, và **không tra được thì ĐÓNG** — cùng
  bài học của cổng NGANGCAP (9.99.76), nơi một dòng `!== null && …` làm
  cổng chưa bao giờ chặn gì.
- **Năm bản chép của cùng một biểu thức regex vai.** Gom về `laNguoiNha`.
  Năm bản là năm chỗ để một bản trôi đi, và bản trôi thì không ai thấy
  vì bốn bản kia vẫn đúng.

Mục 93 nay canh: **mọi cửa xuất ra đều phải soi vai**. Phép đo nhận cả
cổng **hẹp hơn** viết thẳng — `batNangCap` khoá ở R01–R02, và hẹp hơn là
đúng chiều an toàn; đòi đúng một tên hàm là **nới ba cửa ra cho vừa một
phép đo**.

### Chọn dấu hiệu: ba cụm phải loại vì bắt oan đúng chỗ đắt nhất

- **`hàng rào` trần** nằm trong *"hàng rào sân trường"*
- **`bảng giá` trần** nằm trong *"bảng giá của nhà cung cấp máy chủ"* —
  mà đó đúng là một đề xuất Cấp 6 hợp lệ, và đẩy nó ra khỏi đường này là
  bắt oan ở chỗ đắt nhất
- **`năm cửa` trần** nằm trong *"năm cửa hàng"*

Cả ba đều viết được thành cụm dài hơn, đúng một lần — cùng lối đã chốt ở
9.99.56: **chặn ở chỗ CHỌN DẤU HIỆU rẻ hơn và chắc hơn chặn bằng một
danh sách trừ.** Bộ thử có một phép đo riêng cho ba câu lành ấy.

### N06 cố ý cho MỘT người tắt hệ ngay

Bắt hai chữ ký lúc đang cháy là bắt người ta chọn giữa cứu hệ và làm
đúng quy trình — và họ sẽ chọn cứu hệ, rồi quy trình mất uy tín. Đổi
lại: phải báo trong 60 phút, và có người soi lại. Mục 93 canh rằng N06
vẫn mang `hai: false` kèm ô `baoSau`.

### Sổ chờ

- **TNC-01** — nhịp *+0,5%/tuần · +10%/quý* đo trên **mẫu số nào**, hay
  chốt rằng nó là khẩu hiệu chứ không phải chỉ tiêu. Để nguyên thì sáu
  tháng sau có người chạy cho đủ số.
- **TNC-02** — bảy vùng không tự nâng cấp: chốt, thêm, hay bớt. Thêm một
  vùng là chủ hệ thu hẹp quyền của chính mình; bớt một vùng là mở một
  cửa, nên **bớt thì phải nói ra vùng ấy được đổi bằng đường nào thay
  thế**.

---

## SAO LƯU · SOI RÒ · PHIẾU QUYẾT (9.99.78)

Bản này **không thêm màn nào**. Nó vá ba chỗ mà mười một tháng dựng
chức năng chưa chạm tới, và chỗ thứ nhất là chỗ mất là mất hẳn.

### 1 · Khoá kho chỉ có MỘT bản, trên MỘT cái máy

```
kho/khoa.json   682 byte · 8 khoá AES-256-GCM · crypto.randomBytes(32)
kho-goc/        173 tệp · 57.496 dòng, trong đó 7.201 dòng chú giải
```

Cả hai nằm trong `.gitignore` một cách **đúng**. Cái giá của quyết định
ấy chưa bao giờ được ghi ra: chúng **chỉ có một bản**, và máy làm việc
thì bị thu hồi.

Tệp này vẫn viết *"bảy tệp .enc đã phát hành là bản lưu duy nhất của
nội dung — chúng đã cứu được cả kho một lần ở bản 9.6"*. Câu ấy đúng, và
nó đúng **chỉ khi còn khoá**. Khoá là số ngẫu nhiên, không suy ra được
từ gì cả. Mất nó thì 8 tệp `.enc` trong git thành chuỗi byte không mở
được, 1.131 kho đi theo, và mọi giấy phép đã cấp ngừng chạy.

Vế thứ hai ấy không được ghi ở đâu — đúng lớp lỗi 9.99.57 đã từ chối làm
dấu chìm trong bit thấp: **một lớp bảo vệ không nói giới hạn thì người
đọc tin nó chống được nhiều hơn thật.**

### Và `.enc` KHÔNG dựng lại được `kho-goc/` — đo chứ không đoán

| Mất gì | `.enc` cứu được không |
|---|---|
| 1.131 kho **dữ liệu** | ✅ nếu còn khoá |
| **7.201 dòng chú giải** (13%) | ❌ `JSON.stringify` không giữ |
| cách chia 173 tệp | ❌ |

Chú giải là phần tệp này gọi là đáng giá nhất. Nên `khoi-phuc-kho.js` có
**hai đường**, và đường đi từ `.enc` **nói thẳng** nó trả về một cái xác
không có lời giải thích, thay vì báo "đã khôi phục xong". Trộn hai đường
vào một câu là chỗ nguy hiểm nhất: người ta đọc thấy xong, đóng máy, rồi
sáu tháng sau kho không còn dòng nào nói vì sao.

| Lệnh | Việc |
|---|---|
| `node tools/sao-luu.js <thư-mục-NGOÀI-kho>` | gói `kho-goc/` + `khoa.json`, AES-256-GCM, scrypt N=32768 |
| `node tools/khoi-phuc-kho.js <tệp.gita> [ra]` | đường **ĐỦ** — 174 tệp, đúng từng byte |
| `node tools/khoi-phuc-kho.js --tu-enc [ra]` | đường **CỤT** — chỉ dữ liệu, mất chú giải |

**Ba luật của bộ sao lưu**, cả ba đều đã phá thử:

1. **KHÔNG ghi vào trong kho mã** — chặn, không cảnh báo. Một tệp mang
   toàn bộ khoá nằm trong thư mục kho là tệp sẽ bị `git add -A` nuốt vào
   đúng ngày người ta vội, và GitHub giữ lịch sử.
2. **Mật khẩu không đi qua tham số dòng lệnh** — `ps aux` đọc được tham
   số của mọi tiến trình, và shell ghi lại vào lịch sử.
3. **Tự kiểm ngay**: ghi xong là đọc lại **từ đĩa** rồi so từng tệp;
   lệch thì XOÁ tệp vừa ghi. Đọc lại từ đĩa mới bắt được ghi dở dang.

**Chỗ bộ này KHÔNG cứu được, nói thẳng:** mất *mật khẩu* thì bản sao lưu
cũng là rác. Nó đổi "giữ 682 byte bí mật" thành "nhớ một câu" — dễ hơn
nhiều, không phải là không thể mất. Nên phải có **hai đường độc lập**,
và đường thứ hai đã nằm sẵn trong danh sách triển khai:
`npx wrangler secret put GITA_KHOA_KHO`.

**Mục 94** canh cả đường ấy, và phép đo đáng tin duy nhất của nó là phép
đo cuối: **chạy thật** vòng mã hoá → giải mã → so, rồi đòi bộ giải mã
phải ĐỎ khi sai mật khẩu và khi một byte bị sửa. Ba phép đo kia đọc mã
nguồn nên chỉ kiểm được *hình*.

### 2 · Đo rò dữ liệu — `tools/do-ro-ri.js`

Luật *lọc trên màn hình KHÔNG phải bảo vệ dữ liệu* đã cắn ba lần
(KICHBAN 8.9 · CV_MUC 9.7 · 17 kho nghề 9.8), và cả ba lần **không bộ
kiểm nào bắt được** — vì mọi bộ soi đều đọc MÃ NGUỒN, mà mã nguồn thì
khai đúng. Chỗ sai nằm ở thứ thật sự có trong bộ nhớ sau khi đăng nhập.

Nay có công cụ, và kết quả hôm nay: **KHÔNG RÒ**.

```
R13 phụ huynh  gói nen,tang1..3      362 kho ·  6.044 bản ghi
coach R07      gói nen,nghe,tang1..5 1.219 kho · 16.141 bản ghi
```

**Hai lần phép đo này bắt oan, ghi để không lặp:**

1. Bản đầu lấy `G.THUOC_CAP_PHEP` làm "danh sách kho nghề" và báo **RÒ
   570 KHO**. Sai hoàn toàn: đó là danh sách kho phải **XOÁ KHI ĐỔI
   VAI**, gồm cả kho gói tầng khách hàng trả tiền để có.
2. Bản hai đo đúng danh sách nhưng đo **sự có mặt của tên**, báo RÒ 2
   kho — `KICHBAN` · `FAMILIES`. Cũng sai: cả hai là **mảng rỗng** ở máy
   khách, khung khai sẵn trong `src/`. Coach có 1.000 và 10 bản ghi;
   phụ huynh có 0.

**Phải đếm BẢN GHI, không đếm TÊN.** Một cái tên có mặt với không bản
ghi nào là một khung rỗng, không phải chỗ rò — và báo nó là rò thì lần
sau người ta tắt phép đo đi, đúng vào lúc có chỗ rò thật.

Phá thử bằng cách trồng một bản ghi thật vào `src/kho-khoa.js`: đỏ đúng
chỗ, gọi đúng tên kho và số bản ghi.

### 3 · Phiếu quyết — `tools/phieu-quyet.js`

`soat-san-sang.js` trả lời đúng câu nó sinh ra để trả lời. Với 53 mục
máy không đo được, nó in **một dòng** nối tên chúng bằng dấu chấm giữa,
dài hơn hai nghìn ký tự. Dòng ấy đúng, và vô dụng với người phải trả
lời — muốn trả lời thì phải biết bốn thứ, và cả bốn **đều có sẵn trong
kho**, chỉ chưa bao giờ được trình ra cùng nhau.

**Một sự thật CÓ mà không đọc ra được thì trên thực tế là KHÔNG CÓ** —
đúng câu đã viết cho sổ truy vết một tấm ở 9.99.59, và nó áp vào đây y
hệt: 53 câu nằm rải trong 33 sổ thì không ai trả lời được câu nào, nên
sổ chờ chỉ dài ra chứ không ngắn đi.

Phiếu chia **hai phần không trộn**: 11 mục **việc viết** (máy đếm được
tiến độ — không ai phải quyết gì, chỉ là chưa ai ngồi viết) và 53 mục
**quyết định**. Trộn thì một việc cần ba trăm giờ viết nằm cạnh một câu
trả lời trong ba mươi giây, cùng kiểu chữ.

**Phiếu KHÔNG có ô "máy đề nghị".** Luật của kho là *máy đề xuất, chủ hệ
quyết*, và một lời đề nghị in sẵn cạnh câu hỏi thì người đọc gật theo —
nhất là lúc mệt, nhất là với câu khó, tức là đúng những câu đáng nghĩ
nhất.

**30 trong 33 sổ chờ nằm ở gói NGHỀ**, nên phiếu là nội dung nghề và
không được lên kho mã — cùng lý do với `kho-goc/`. Chặn hai lớp:
`.gitignore`, và công cụ **hỏi thẳng `git check-ignore`** rồi từ chối
ghi. Hỏi git chứ không tự suy từ tên tệp: tự suy thì đổi tên một chút là
lọt, và người đổi tên không cố ý — họ chỉ muốn hai bản để so.

### 4 · Một lượt bị CSP chặn trông y hệt một lượt mất mạng

`cau-hinh.js` và `connect-src` của `index.html` là **hai chỗ phải khớp**,
và `soat-san-sang.js` đã canh phía tĩnh. Chỗ còn hở là **lúc chạy**:
trình duyệt cố ý không nói lượt nào bị CSP chặn — cả hai đều ném đúng
một câu `Failed to fetch`. Người dán địa chỉ lúc nửa đêm không chạy bộ
soát; họ bấm "Thử nối", thấy câu ấy, rồi đi tìm ở phía máy chủ suốt một
tiếng trong khi máy chủ vẫn chạy đúng.

`doanViSao()` **không kết luận, chỉ NÊU**: máy không phân biệt được hai
nguyên nhân, và nói chắc một cái là dẫn người ta đi sai đường đúng lúc
đang vội — cùng luật với `khoi-phuc-kho.js` khi AES-GCM báo sai. Nó chỉ
nói thêm cái người kia chưa biết: địa chỉ này **khác gốc** với trang,
nên có một chỗ thứ hai phải khai.

### Lần thứ TƯ của cùng một lớp lỗi — nay là LUẬT

Phép đo `mkKhongArgv` của mục 94 **đỏ ngay ở bản nguyên vẹn**:
`khoi-phuc-kho.js` có câu cảnh báo *"ps aux đọc được argv"* nằm trong
một **chuỗi**, không phải chú giải. Phép đo bắt oan đúng lời cảnh báo về
cái bẫy nó canh — và cách sửa dễ nhất, xoá câu cảnh báo đi, là cách sai
nhất.

Lần thứ tư sau mục 89 (cột `ghiChu`) · mục 91 (dòng `12/12`) · mục 93
(`hoSo.username`). Nên từ đây nó là một **luật**, không phải một lần vấp:

> **Phép đo dò một cái tên bị cấm trong mã nguồn phải bỏ CẢ chú giải LẪN
> chuỗi.** Chỗ **khai** một cái tên và chỗ **nói về** cái tên ấy là hai
> chuyện khác nhau.

### Và một bản chép thứ ba suýt ra đời

Ba hàm `cau()` · `ten()` · `nhan()` — biết ba tên ô của một câu hỏi
(`t` 35 mục · `viec` 16 · `hoi` 13) — là biến **cục bộ** trong
`soat-san-sang.js`. 9.99.63 đã gom chúng về một hàm sau khi hai bản chép
viết tay in ra `CC-TEN · undefined`.

Khi `phieu-quyet.js` cần đúng ba hàm ấy, lựa chọn là chép sang hay tách
ra. Nay chúng ở `tools/so-cho.js`, và `soat-san-sang.js` **trỏ** vào đó.
Gom về một hàm nhưng để nó cục bộ thì mới là gom được **một nửa**.

### Chỗ bản này KHÔNG làm được, và vì sao

- **9 bí mật máy chủ · GitHub Pages · DNS** — việc bấm tay của chủ hệ.
  Không lệnh nào làm hộ được.
- **53 câu quyết định** — luật của kho là *máy đề xuất, chủ hệ quyết*,
  và nhiều câu trong số đó là **Vùng Đỏ**. Phiếu quyết làm chúng trả lời
  được; trả lời vẫn là việc của người.

---

## KHO LƯU TRỮ — đọc cái đã có, và soi phần đã mất (9.99.79)

### Kho lưu trữ anh cần ĐÃ TỒN TẠI, chỉ là không ai đọc được nó

`ma-hoa-kho.js` **giữ nguyên khoá cũ** mỗi lượt đóng gói — đúng dòng
*"Giữ nguyên 8 khoá cũ — giấy phép đã cấp vẫn dùng được"*. Hệ quả chưa
ai nói ra: **mọi bản `.enc` từng đẩy đều còn mở được bằng đúng 682 byte
ấy.**

Tức là **git cộng khoá đã là một kho lưu trữ có phiên bản**, 201 bản
lưu, nằm sẵn trên GitHub. Dựng một kho lưu trữ thứ hai ở đây là dựng bản
thứ hai của một sự thật. Nên `tools/kho-luu.js` **không lưu gì cả** —
nó chỉ đọc.

| Cửa | Việc |
|---|---|
| *(không cờ)* | liệt kê 201 bản lưu |
| `--mat` | soi nội dung đã mất qua toàn bộ lịch sử |
| `--soi` | khoá hôm nay còn mở được bao nhiêu bản lưu |
| `--doi <KHO>` | đời một kho: xuất hiện · lớn lên · vơi đi ở bản nào |
| `--lay <KHO> <bản>` · `--sua <KHO>` | **đường sửa** — lấy vật liệu ra |

### Con số thật là 197/201, không phải "tất cả"

Lượt đo đầu của tôi lấy mẫu một danh sách xếp **ngược** thời gian, nên
tưởng bản thứ 150 là bản cũ nhất, và tôi đã nói *"khoá mở được cả 201
bản"*. Quét đủ thì ra **197**.

Bốn bản không mở được đều ngày **28/08/2026**, dựng TRƯỚC lúc bộ khoá
hôm nay được chốt. Đó là **lịch sử, không phải hỏng**. Nhưng phải nói
con số thật: *một con số tròn trịa hơn sự thật thì người đọc tin kho lưu
trữ sâu hơn thật* — cùng lớp lỗi 9.99.57 đã từ chối làm dấu chìm.

**Phép đo phải đo TỶ LỆ, không đo một bản cố định.** Bản đầu của phép đo
ở mục 94 đòi bản *cũ nhất* mở được, và nó **đỏ ngay ở kho lành**. Nay
lấy mẫu 20 bản đều khắp lịch sử và đòi ≥95%. Một lượt `--doi-khoa` kéo
con số ấy xuống gần 0 ngay lập tức.

### `--doi-khoa` khoá lại CẢ KHO LƯU TRỮ, và lời cảnh báo của nó chỉ nói một nửa

Dòng cảnh báo hiện có nói đúng phần trước mắt — *"mọi giấy phép đã cấp
sẽ hết hiệu lực"* — và **không nói phần nặng hơn**: 197 bản lưu trong
lịch sử git cũng khoá lại vĩnh viễn. Bản mới vẫn mở được, mọi bộ kiểm
khác vẫn xanh, nên không ai biết cho tới lúc cần lấy lại một thứ đã mất.
Mục 94 nay canh đúng chỗ ấy.

### Phần MẤT: soi 201 bản lưu, không mất chữ nào

`soi-doi-kho.js` so bản vừa đóng với **lần commit gần nhất**. Nó trả lời
được *"lượt sửa vừa rồi có làm mất gì không"*, và **không** trả lời được
*"có thứ gì mất ở bản 9.40 rồi nằm im tới nay không"* — vì từ lượt sau
nó là hiện trạng. **Một mất mát đi qua được một lượt so sánh thì nó đi
qua được mọi lượt sau.**

Kết quả quét 1.119 kho qua 35 bản lưu: **3 sổ vơi đi, và cả ba đúng
luật.**

```
TV_CHOCHU    2 → 1 + 1 ở TV_DACHOT  = 2  ✓ khớp đỉnh
BV_CHOCHU    3 → 2 + 1 ở BV_DACHOT  = 3  ✓ khớp đỉnh
BLV_CHOCHU   5 → 3 + 2 ở BLV_DACHOT = 5  ✓ khớp đỉnh
```

Mục đã trả lời được **tiễn** sang `_DACHOT` — gỡ khỏi sổ chờ, không xoá
(9.99.61). Bộ soi nay **trừ phần đã tiễn** trước khi báo: một phép đo
nêu ba chỗ đúng luật là một phép đo có ba dòng nhiễu, và ba dòng nhiễu
thì lần sau người ta lướt qua cả bảng — đúng lúc có dòng thật.

**Máy KHÔNG tự vá.** Một kho cắt bớt có chủ ý trông y hệt một kho bị
mất, và máy không phân biệt được. Máy tìm ra chỗ ngờ, đưa vật liệu tận
tay bằng `--lay`, rồi dừng.

### Phần THIẾU: đếm ngược để tìm thứ mất là mất hẳn

Cách tìm: liệt kê **mọi** tệp trong thư mục làm việc, trừ thứ có trong
git, trừ thứ đã có trong danh sách sao lưu. Phần còn lại là thứ chưa ai
bảo vệ.

Ra **977 MB**, và gần hết là thứ **dựng lại được** — `desktop/dist/`,
`ban-xem-thu.html`, 157 bản giới thiệu, 19 ảnh chụp màn. Đúng **hai**
chỗ không dựng lại được, và cả hai đều nhỏ:

| Phần | Cỡ | Vì sao không dựng lại được |
|---|---|---|
| `giay-phep/` | 19 KB | sinh lại được một giấy phép **mới**, không sinh lại được **bản ghi đã cấp** — ngày cấp và dấu truy nguồn của tờ cũ đã đi theo tờ ấy ra ngoài |
| `tools/ban-ve.json` | 48 KB | `.gitignore` nói *"dựng lại bằng `doc-ban-ve.py <PDF>`"* — **tệp PDF ấy không nằm trong kho** |

Cả hai nay vào bản sao lưu: **185 tệp** thay vì 174.

**Hai phần này khai `batBuoc: false`** — một bản sao chép mới của kho thì
chưa có chúng, và chặn ở đó là chặn sai. Nhưng **vắng mặt phải NÓI RA**,
cả trên màn lẫn trong biên nhận: im lặng bỏ qua là dựng đúng cái bẫy bộ
sao lưu sinh ra để chống.

Và `duoi` **vắng mặt nghĩa là lấy hết** — `giay-phep/` có `.json` ·
`.txt` · `.gs` · `.md` lẫn nhau, lọc theo một đuôi thì ba loại kia im
lặng rơi ra khỏi bản sao lưu.

### Một lỗi chỉ nổ trên MÀN HÌNH THẬT

```js
function xoaTienDo() { if (process.stdout.isTTY) xoaTienDo(); }   // đệ quy vô hạn
```

Một lượt thay bằng regex nuốt luôn thân hàm. Nó **chỉ nổ khi đầu ra là
màn hình thật**, nên mọi lượt chạy qua ống của tôi đều xanh — còn chủ hệ
chạy tay là tràn ngăn xếp. Thử lại bằng `script -qec` để giả một màn
hình thật mới thấy.

**Lớp lỗi đáng ghi:** một công cụ có nhánh `isTTY` thì nhánh ấy **chưa
bao giờ được chạy** trong mọi lượt thử qua ống — tức là đúng nhánh người
dùng thật gặp là nhánh chưa ai thử.

---

## ĐI BẰNG CHÂN MỘT VÒNG KHÁCH HÀNG (9.99.80)

Giả lập một người lạ mở link rồi đi hết web app, qua ba vai khách —
**R13 phụ huynh → R14 học viên → R15 đại sứ** — trên khổ điện thoại
390px. Không đọc mã đoán: đo thứ CÓ TRONG DOM sau khi mọi gói đã nạp.

### Chỗ hỏng nặng nhất nằm ở màn ĐẦU TIÊN, và không bộ đo nào thấy

**Cổng vào đẩy CẢ TRANG cuộn ngang ở mọi khổ điện thoại.**
`scrollWidth` cố định **447px** từ 320 tới 414px — người lạ mở link,
vuốt dọc, trang trượt ngang.

Suốt mười một tháng `do-khung-man.js` xanh 1.584 lượt đo mà không thấy,
vì nó **`doLogin` ngay sau khi tải**. Màn mà MỌI người lạ nhìn thấy đầu
tiên là màn duy nhất chưa ai đo.

Ba nguyên nhân chồng lên nhau, và cả ba là lớp lỗi tệp này đã ghi rồi:

| Chỗ | Hỏng thế nào |
|---|---|
| `.gate-top` | `display:flex` mặc định **`nowrap`** — brand 203 + chip 38 + 42 + 84 = 367 + lề 60 = **427px** trong màn 390px |
| `.gate-body` | rãnh lưới khai **`1fr`**, mà ô lưới mặc định `min-width:auto` nên rãnh **không co dưới min-content** — giải ra 417px trong hộp 330px |
| nhãn nút | `.btn` khai `white-space:nowrap`, mà nhãn *"Chưa có tài khoản — xem trước GITA 365 làm gì"* dài 417px |

**`1fr` đọc như "co giãn tự do" mà thực ra là "không nhỏ hơn nội dung".**
Đó là chỗ bẫy, và `minmax(0,1fr)` là câu trả lời.

Nới `.btn` **đúng ở cổng vào**, không nới toàn cục: nới toàn cục thì mọi
nút trong mọi bảng của cả kho có thể vỡ hai dòng — đổi một lỗi nhìn thấy
lấy một trăm chỗ chưa ai nhìn.

Nay `do-khung-man.js` **đo màn chưa đăng nhập TRƯỚC**, ở cả bốn khổ. Phá
thử: trả `.gate-top` về `nowrap` thì nó đỏ đúng chỗ và gọi đúng tên thẻ.

### Hộp báo lỗi ra hình BẦU DỤC — hai lỗi chồng nhau

`#toast` khai `max-width:min(90vw,520px)` và **chưa bao giờ dùng tới**:
một thẻ `position:fixed` khai `left:50%` mà không khai `right` thì bề
rộng khả dụng chỉ còn **nửa màn**, và `transform:translateX(-50%)` chỉ
dời chỗ nhìn thấy chứ không đổi bề rộng bố cục.

Hậu quả: câu báo bốn dòng ra hộp **195×143px**, mà `border-radius:99px`
trên hộp cao 143px kẹp về 71px — tức là một **hình bầu dục**, góc chữ
rơi ra ngoài hình. Đúng lúc khách cần đọc rõ nhất.

Vá đúng một từ — `width:max-content` — thì ra **351×73px**, bán kính tự
kẹp về 36px, đúng hình viên thuốc thiết kế muốn.

**Bo góc GIỮ NGUYÊN 99px.** Hạ xuống 24px cũng hết bầu dục, nhưng hộp
báo một dòng — thứ hay gặp nhất — mất hình viên thuốc. Sửa bề rộng là
sửa NGUYÊN NHÂN; đổi bo góc chỉ là che triệu chứng.

### Bộ chống quét đã bắt đúng lượt quét của tôi

`guard.js` chặn ở **26 màn chuyên môn trong 60 giây** và hạ nhịp. Lượt
đi thử quét 65 màn liên tiếp bị nó tóm — nó chạy đúng, và đó là cách
phát hiện ra hộp báo bầu dục.

### Thang WOW 1000 điểm là LỜI KHAI, không phải phép đo

`G.CHUAN1000` tự khai **929/1000**. Đo thử đúng một mục — C8 *"có nhãn
cho trình đọc màn hình ở mọi nút"*, mục khai **thấp nhất cả bảng
(12/20)**:

```
3.021 nút · liên kết   → 0 thiếu tên đọc được   (0%)
   56 ảnh              → 0 thiếu alt            (0%)
   14 ô nhập           → 2 thiếu nhãn        (14,3%)
```

Mục ấy **đáng 20/20 cho phần nút**, không phải 12. Bảng chấm quá tay ở
đây — và một bảng chấm sai theo chiều nào cũng vô dụng như nhau.

Đây là cùng luật tệp này đã ghi ba lần: **không gộp cột đo được với cột
lời khai**. `CHUAN1000` trình mười con số với độ chính xác của một phép
đo, trong khi cả mười đều là lời khai viết một lần rồi không ai đo lại.
Mục chờ **WOW-01**, và nó có CHỖ GHI thật (`G.QA_CHOCHU`) chứ không chỉ
một dòng trong tệp này — luật của kho: *một mục chờ không có chỗ ghi thì
nó không phải mục chờ, nó là một lời than.*

### Hai ô vừa sửa, và cả hai là lỗ chứ không phải điểm số

**Một ô chọn thiếu nhãn đọc được** — `src/danh-gia.js`, ô *"Tên hiển
thị"*. Dòng chữ ấy viết bằng `<p>`, nên trình đọc màn hình đọc ô chọn là
*"danh sách, không tên"*: người mù nghe thấy một ô chọn mà không biết
nó chọn gì, đúng ở màn quyết định có cho đăng công khai tên nhà mình
hay không. Vá bằng `<label for>` chứ không `aria-label`, vì `<label>`
còn cho chạm vào chữ là nhảy vào ô — thứ người tay run cần nhất.

**Phép đo cổng vào chạy mà không được đếm.** `soDo` chỉ cộng trong vòng
lặp từng màn, nên ba phép đo cổng vào × bốn khổ chạy thật mà con số in
ra vẫn là 1.584. Một con số báo ÍT hơn thật cũng làm người đọc tin
nhầm y như một con số báo nhiều hơn — nay 1.596.

### Ba vai khách, số đo

| Vai | Màn mở được | Chữ mỗi màn | Màn mỏng | Màn lỗi |
|---|---|---|---|---|
| R13 phụ huynh | 65 | 2.174 | 0 | 0 |
| R14 học viên | 58 | 2.669 | 0 | 0 |
| R15 đại sứ | 55 | 3.333 | 0 | 0 |

Cổng vào tải **1,5 giây** · 0 lỗi trang cả hành trình · không màn nào
chậm quá 600ms.


---

## THANG 1000 ĐIỂM — HAI NGĂN, KHÔNG TRỘN LẠI (9.99.81)

Chủ hệ chốt **WOW-01 phương án 1**: *tách hai ngăn — ô nào máy đo được
thì máy đo lại mỗi bản; ô nào người khai thì nói thẳng là người khai,
kèm ngày và tên.*

Kho `data.qa.js` (`G.CHUAN1000` · `G.QA_DACHOT`), bộ đo
`src/chuan-do.js`, màn vẽ lại ở `src/views3.js`, bộ kiểm **mục 95**
(năm phép đo) và mục **1** sửa lại.

### Mỗi ô khai ĐÚNG MỘT đường

| Ngăn | Khoá | Con số từ đâu | Bao nhiêu ô |
|---|---|---|---|
| Máy đo | `mayDo` | `chuan-do.js` đo **lúc mở màn** | 16/50 |
| Người khai | `khai` | người gõ, kèm `ngay` + `ai` | 34/50 |

Cùng luật `mayDo`/`nguoiDo` của Hiến pháp (9.99.62) và
`rangO`/`chuaCoMat` của luật giao diện (9.99.74).

**Ô `mayDo` bỏ hẳn khoá `d`; chương bỏ hẳn khoá `diem`.** Phép đo về
thứ không được tồn tại — lối đo thứ BẢY trong bộ, sau LR1 (79) · ô tự
khai (81) · cột đèn (83) · cột ba cửa (86) · ô lọc bốc nhà (88) · cửa
chưa dựng (91) · cột cấp người xin (93). Một con số gõ tay nằm cạnh
một mã phép đo là hai bản của một sự thật, và bản gõ tay thì không ai
cập nhật.

### Đo LÚC MỞ MÀN, không đo ở bộ kiểm rồi chép số vào kho

Một con số đo ở bộ kiểm rồi ghi vào kho là **một lời khai mang dấu của
phép đo** — nhìn y hệt, và nó cũ đi lặng lẽ. Đo lúc mở màn thì con số
già nhất là vài trăm mili giây.

Kéo theo, và đây là phần dễ làm sai: **kho chưa mở thì BỎ HẲN mã ấy,
không ghi 0, và không tính vào mẫu số.** Trống là *"chưa đo được"*, 0
là *"đo được và bằng không"*. Đếm nó là 0 sẽ dìm cả ngăn xuống vì một
thứ chưa ai đo, và con số ấy trông y hệt một kết quả kém.

### Màn KHÔNG có con số tổng trên 1000

Cộng 320 điểm đo được với 680 điểm lời khai thì con số ra **mang tên
của phép đo** trong khi nó thừa hưởng mọi sai của lời khai. Cùng luật
phễu (9.99.59) và `docTuanThu` (9.99.70).

Màn nói thẳng chỗ ấy, và nói cả đường ra: *muốn một con số duy nhất
thì phải chuyển bớt ô từ ngăn hai sang ngăn một — tức là viết thêm
phép đo, không phải cộng thêm.*

Mỗi lời khai in kèm **tuổi tính lúc đọc**. Một lời khai không ai biết
tuổi thì nó được đọc như thể vừa viết sáng nay.

### Vì sao dừng ở 16/50, và vì sao KHÔNG cố nâng con số ấy

Ba mươi tư ô còn lại nói về thứ máy không quan sát được — *"tám giây
đầu nói đúng nỗi đau bằng lời của khách"*. Viết một hàm trả về một con
số cho chúng là dựng lại đúng cái bẫy vừa gỡ, lần này **mang nhãn "máy
đo" nên còn khó cãi hơn**. Con số 16/50 chính là thông điệp của bảng.

### Phép đo phân bố KHÔNG đều, và chỗ lệch ấy là phát hiện

| Chương | máy đo |
|---|---|
| C8 Khả năng tiếp cận | **5/5** |
| C4 Chiều sâu nội dung | 4/5 |
| C3 Ngôn từ · C5 Cảm giác thuộc về · C9 Đo lường | **0/5** |

**Máy đo được gần hết phần KỸ THUẬT và không đo được gì ở phần quyết
định khách có ở lại hay không.** Và C9 — chương tên là *"Đo lường &
vòng phản hồi"* — là chương **không đo được ô nào**.

### Mục 1 phải THAY, không được GỠ

Phép đo cũ cộng `y[].d` rồi so với `c.diem`; từ bản này cả hai khoá
không còn, nên nó đỏ ngay. Gỡ là bỏ một lớp canh **và không ai biết là
đã bỏ**. Vế mới canh đúng thứ vế cũ canh — mỗi chương đủ năm ô, trần
khớp `max` — trên hình dữ liệu mới. Phá thử: bỏ một ô thì nó đỏ, và cả
chương vẫn trông đầy đủ nếu không có nó.

### Bản chép thứ hai bắt được trên đường đi

`soi-doi-kho.js` báo *"QA_CHOCHU mất mã WOW-01"* trong khi WOW-01 nằm
nguyên trong `QA_DACHOT`. Phép trừ phần đã tiễn dựng ở 9.99.79 nhưng
**sống một mình trong `kho-luu.js`** — mà tệp chạy TRƯỚC MỖI LƯỢT ĐẨY,
tức là bộ báo động chính, lại không biết nó.

Nay phép trừ ở `tools/so-cho.js` và cả hai bộ soi cùng **trỏ** vào.
Phá thử: bỏ ô `ma` khỏi mục đã tiễn rồi tắt phép trừ → đỏ oan đúng hai
dòng. Một phép kiểm báo mất nhầm thì lần sau người ta tắt nó đi, đúng
vào lúc có chỗ mất thật.

### Thêm một kho là ba chỗ khai tay, và lần này quên đúng chỗ đầu

`QA_DACHOT` không khai ở `ma-hoa-kho.js` thì nó **không vào gói nào** —
`soi-doi-kho.js` báo "thêm mới 0" và cả kho biến mất trong im lặng.
Đúng danh sách CLAUDE.md đã dặn ở 9.99.61; đọc rồi vẫn quên, nên ghi
lại đây: `ma-hoa-kho.js` · `kho-khoa.js` · `RONG_CO_Y` nếu rỗng.


---

## BA CHƯƠNG CÂM ĐÃ CÓ PHÉP ĐO — VÀ DỮ LIỆU MẪU CÓ NGƯỜI CANH (9.99.82)

Chủ hệ chốt **phương án (a)**: dựng phép đo cho C3 · C5 · C9 từ hành vi
khách thật. Dựng được NGAY — vì chỗ đo đặt trước thì lúc dữ liệu về nó
tự đúng. Cùng thứ tự đã chọn cho Hiến pháp (9.99.62), trần giám sát
(9.99.76) và vòng tự nâng cấp (9.99.77).

**16/50 → 26/50 ô máy đo.** Mục 95 (5 phép đo) giữ nguyên, thêm **mục
96** (4 phép đo) cho dữ liệu mẫu.

### Ranh giới mới, và nó là chỗ dễ vượt qua nhất

`HAILONG` có đủ chín điểm chạm kèm con số. Một phép đo ngây thơ chấm
**20/20** và gọi đó là *"máy đo"* — trong khi cả chín con số là của các
nhà **HƯ CẤU**. Lúc ấy tôi vừa dựng lại đúng cái bẫy vừa gỡ, lần này
mang nhãn "máy đo" nên **còn khó cãi hơn**.

Nên tách hai loại phép đo theo chỗ **CON SỐ ĐẾN TỪ ĐÂU**:

| Loại | Chạy trên kho mẫu? | Vì sao |
|---|---|---|
| Đo **HÌNH** — kho đủ ô chưa | **có** | hình do MÃ quyết định, không do dữ liệu |
| Đo **SỐ** — con số nói gì về khách | **dừng** | và nói ra khi nào thành đo được |

Danh sách kho mẫu **không chép lại** — hỏi thẳng `G.DL_MAU`, lấy luôn ô
`thatKhi`. **Gỡ `HAILONG` khỏi `DL_MAU` là bốn phép đo của C9 TỰ BẬT.**

### Trạng thái thứ BA của một ô, và nó không gộp được

| Trạng thái | Nghĩa |
|---|---|
| có điểm | đo được |
| `chuaDo` | phép đo **đã dựng xong**, kho còn là mẫu |
| trống | chưa ai viết phép đo, hoặc kho chưa mở với vai này |

Gộp ba thành hai là mất đúng chỗ có nghĩa. Màn nói riêng từng loại, và
với ô `chuaDo` thì in luôn câu *"sẽ tự bật khi…"*.

### Mười ô mới, chia theo thứ chúng hỏi

| Chương | Hỏi về | Đo được ngay |
|---|---|---|
| C3 Ngôn từ (4 ô) | **nội dung Học viện viết ra** | ✅ |
| C5 Cảm giác thuộc về (2 ô) | thứ **không được tồn tại** | ✅ |
| C9 Đo lường (4 ô) | **số của khách** | chờ dữ liệu thật |

C5 dùng lối đo về thứ không được tồn tại lần thứ tám: `KHONG_XEP_HANG`
dò cụm `thuHang` · `xepHang` · `bangXep`, **không dò `hang` trần** — nó
nằm trong `hangTraLoi`, `CV_HANG` (hạng lương), `HANG_TL`.

### Mục 96 — lớp bảo vệ đã có từ lâu mà KHÔNG AI CANH

`src/du-lieu-mau.js` tự viết ra lý do của nó: *"nếu con số ấy đi vào một
bản báo cáo hay một buổi gọi vốn thì cái giá của một dòng chữ thiếu là
rất đắt"*. Lớp ấy dựng từ lâu và **tới 9.99.81 không bộ kiểm nào canh**
— nên nó bảo vệ đúng những kho ai đó nhớ ra mà khai. **Một lớp bảo vệ
dựa vào trí nhớ thì nó là một lời dặn.**

Bốn vế, và **cả ba lỗ thật đều tìm ra ở lượt chạy đầu**:

| Vế | Cách đo | Bắt được gì |
|---|---|---|
| A | **đếm NGƯỢC** — dò tên nhà hư cấu trên mọi kho đã mở, trừ phần đã khai | `TAILIEU` · `TAIKHOAN_KPI` sót |
| B | mỗi mục có `la` + `thatKhi` | — |
| C | kho khai phải CÓ THẬT | **`ECO` — tên chết** |
| D | màn khai phải CÓ THẬT | — |

**Vế A đếm ngược nên nó không cần biết trước kho nào là mẫu** — đó là
khác biệt giữa một phép đo và một danh sách, và nó bắt được cả kho do
người không đọc tệp này viết sau.

### Lỗ nặng nhất lại là lỗ vế A KHÔNG thấy

`ECO` khai trong danh sách nhưng **không tồn tại ở đâu cả**. Lần theo
cái tên chết ấy mới ra kho thật đang giữ số: **`HEALTH`** — 1.284 gia
đình · 42 coach · 89,3% giữ nhịp, đứng ở **màn điều hành**, đúng cái màn
tệp `du-lieu-mau.js` lấy làm ví dụ mở đầu. Kho đổi tên, danh sách giữ
tên cũ, và **dải nhắc lặng lẽ thôi hiện** suốt nhiều bản.

**Vế A không bắt được nó, vì nó dò TÊN NGƯỜI còn `HEALTH` chỉ có CON
SỐ.** Giới hạn ấy **ghi thẳng vào chú giải mục 96**, không giấu — cùng
lý do 9.99.57 từ chối làm dấu chìm và cùng cách `soatSoDen` khai thẳng
thứ nó không làm được (9.99.76). Vế D bịt một phần từ phía MÀN; phần
còn lại là việc của người, **và nó phải được biết là còn hở**.

### Hai phép đo bổ nhau, không thay nhau

Vế A nhìn từ **dữ liệu**, vế C nhìn từ **danh sách**. Chỉ vế A thì
`ECO` sống mãi; chỉ vế C thì `TAILIEU` sống mãi. Phá thử cả bốn: gỡ
`TAILIEU` · bỏ `thatKhi` của `HAILONG` · khai một kho không có · khai
một màn không có → **bốn dòng đỏ, gọi đúng tên từng chỗ**.


---

## GITA SUPREME — BẢN ĐỒ VÀ TRẦN CỦA BA QUYỂN (9.99.83)

Theo hai tệp chủ hệ gửi: **`MYVIP.doc`** (410.000 ký tự — Quyển I
nghiên cứu 14 nền tảng → ma trận 28 sức mạnh · Quyển II chuỗi 100.000
điểm chạm · Quyển III Kênh GITA Supreme 100 phần) và **`Trợ lý giám
sát GITA Vip.doc`** — tệp thứ hai **đã dựng ở 9.99.76**, bản này không
dựng lại.

Màn **GITA Supreme · bản đồ** (`src/supreme.js`, bốn ngăn), kho
`data.supreme.js` (10 kho, tiền tố `SUP_`), bộ kiểm **mục 97** (4 phép
đo).

### Dựng CÁI TRẦN trước — lần thứ tư, và lý do gắt hơn cả ba lần trước

Sau Hiến pháp (9.99.62), trần giám sát (9.99.76), vòng tự nâng cấp
(9.99.77). Ở đây: **bản đặc tả không mô tả một màn hình — nó mô tả một
MẠNG XÃ HỘI.** Dựng mạng trước rồi mới hỏi luật nào áp cho nó thì tới
lúc ấy mỗi tính năng đã có một luật riêng, gom lại không gom được nữa.

### NGĂN ĐẦU LÀ BẪY TÊN GỌI, KHÔNG PHẢI CHỖ VA

Khác 9.99.76 nơi ngăn đầu là sáu điều cấm. Chỗ nguy nhất ở đây không
phải một luật bị phạm — nó là **ba thang cùng mang chữ "điểm chạm"**:

| Thang | Gõ là gì | Tổng | Chốt ở đâu |
|---|---|---|---|
| Tiến độ một gia đình | `diemCham` | 1.000 | 9.99.74, đã chốt |
| Chín khoảnh khắc cảm xúc | `DIEMCHAM` | 9 | kho đang chạy |
| Hệ thống chủ động chạm | **`chamSUP`** | 100.000 | CHƯA chốt · SUP-01 |

**Một luật bị phạm thì có người cãi. Hai thang cùng tên thì không ai
cãi — chúng chỉ dần được đọc như một, và không ai quyết định gộp cả.**

Cùng cái bẫy chữ *tầng* ở 9.99.65, và chữa đúng một cách: **chọn tiền
tố TRƯỚC khi viết** (9.99.67). Mục 97 dò trên mã đã bỏ chú giải và
chuỗi — luật 9.99.78, vì kho và màn của phần này *nói về* `diemCham`
rất nhiều, và đó chính là việc của chúng.

### Bốn chỗ va MỚI — không chép lại sáu điều cấm đã có

`VIP_CAM` (9.99.76) đã phủ bốn chỗ Quyển I–III đụng tới: xếp hạng
người (C1) · sinh trắc trẻ (C2) · hạ cấp và đặt lại chuỗi (C4) · doạ
mất chuỗi (C5). **Bản thứ hai của một BẢNG CẤM là bản nguy nhất trong
mọi bản thứ hai:** sửa một bên thì bên kia vẫn chặn theo luật cũ, mà
cả hai vẫn xanh. Mục 97 canh rằng `SUP_*` không mọc bảng cấm thứ hai.

| Mã | Đòi gì | Đếm | Luật |
|---|---|---|---|
| V1 | GITA Moment — ảnh thật mỗi ngày, camera kép | 8 | **L07** · Điều 13 |
| V2 | Escrow · Thị Trường · động từ "Kiếm" | 2+3 | **chưa có luật** → SUP-02 |
| V3 | "mạnh nhất thế giới" · "vô địch" · "1000%" | 1+2+3 | **QC1** |
| V4 | thang 100.000 đứng cạnh thang 1.000 | 0 | **LGD_HAI_TRUC** |
| V5 | AI soạn hộ lời xin lỗi (thêm 9.99.84) | 1+2+1 | **L10** Ba Ghế Người Giữ |

*(Cột Đếm đã sửa ở 9.99.84 — bốn con số cũ 11 · 18 · 7 · 0 sinh ra từ
một lượt quét không ai ghi lại cụm dò, và chỉ số 0 là đúng. Nay mỗi chỗ
va mang ô `cum` là cụm dò thật.)*

**V1 lọt qua C3:** C3 cấm quay hình *liên tục*; Moment là ảnh *rời* mỗi
ngày nên C3 không phủ tới. Nhưng một cơ chế bắn báo giờ ngẫu nhiên rồi
đòi chụp ngay thì **không có chỗ cho một lời từ chối** — mà L07 nói rõ:
con từ chối thì ẩn nút, không hỏi lại.

**V4 đếm 0 lần, và đó chính là điều đáng lo:** bản đặc tả không hề nhắc
tới thang 1.000 — nó không biết thang kia tồn tại.

### Hai chỗ phép dò của chính tôi BẮT OAN

Lượt quét đầu trên 410.000 ký tự cho tám dấu hiệu; **hai là bắt oan**,
cả hai cùng một kiểu: **tài liệu đang PHÊ PHÁN chính thứ bị dò**.

| Dấu hiệu | Khớp | Nguyên văn |
|---|---|---|
| `bảng xếp hạng` | 15 | *"gương soi riêng, không phải bảng xếp hạng"* |
| `giám sát từng giây` | 3 | *"…mâu thuẫn với mô hình tối đa hóa thời gian"* |

Khai cả hai là **bắt buộc**: nêu chỗ va mà giấu chỗ hợp thì người đọc
tưởng cả bản đặc tả là sai rồi thôi không đọc — và lúc ấy bốn chỗ va
thật cũng không ai đọc. Lớp bắt oan thứ ba của kho, sau `boDau('hư')`
(9.99.54) và lời cảnh báo nằm trong chuỗi (9.99.78).

### Mục 97 bắt HAI lỗi của chính người viết nó, ở lượt chạy đầu

1. **V4 trỏ vào một CHỐT, không vào mã luật.** Sửa dữ liệu (trỏ
   `LGD_HAI_TRUC`) **và** sửa phép đo: tra **kho thật** thay vì một
   danh sách mã gõ tay. Lượt sau nó lại đỏ oan V3 vì danh sách thiếu
   `NT_LOC7` — nên nay gom mã từ **mọi** bảng có ô `ma`. Bài học
   9.99.77: một phép dò chỉ biết một trong ba chỗ thì nó báo đỏ một
   vùng đang trỏ đúng.
2. **`coChu` ghi 45 mà cộng từ `SUP_KHOI` ra 44** — hai bản chép viết
   tay của cùng một con số. Sự thật: khối F mới có **đúng một** phần
   lẻ (45). Nay khối khai ô `le:[45]` và phép đo cộng lại từ bảng.

### Một bản chép thứ hai suýt ra đời — lần thứ tư

`boChu` (bỏ chú giải + chuỗi trước khi dò tên bị cấm, luật 9.99.78)
dựng ở mục 94 nhưng **sống cục bộ trong khối ấy**. Mục 97 cần đúng hàm
đó. Nay nó là `boChuMa` ở đầu `kiem-tra.js`, cả hai mục cùng **trỏ**
vào — giống hệt `daTienSangDaChot` ở 9.99.81 và `cau()` ở 9.99.78.

### Và lỗi `U.sec()` thoát hai lần, mắc lại

`U.sec()` **tự gọi `U.h()`** trên tham số. Truyền `h(...)` vào là thoát
lần thứ hai và người đọc thấy `&quot;` giữa câu tiếng Việt. Bản 9.24 gỡ
77 chỗ, 9.99.70 mắc lại ở `U.empty()`, và bản này mắc lần thứ ba. Bộ rà
soát chỗ trống bắt ngay — **lỗi không sinh lỗi trang nên nó sống rất
lâu nếu không có phép đo.**

### ~~Bản đặc tả mới có 45/100 phần~~ → **59/100** (sửa ở 9.99.84)

Bản này viết *"đếm bằng máy trên chính tệp, không đọc bằng mắt"* — và
câu ấy **không đúng**: lúc ấy không lệnh nào được chạy, con số suy từ
bản đồ khối sau một lượt đọc khoảng 7% tệp. Đọc đủ rồi đếm thật thì ra
**59**: khối F đã trọn tám phần, khối G đã viết bảy.

Giữ nguyên dòng sai ở đây thay vì xoá, vì cái đáng học không phải con
số mà là **một lời khai tự xưng là phép đo**. Trình "100 phần" mà không
nói bao nhiêu phần trống thì người đọc tin là đã đủ — cùng luật
`conLaiChuaTrinh` (9.99.71); nhưng nói ra một con số sai kèm chữ "đếm
bằng máy" thì còn tệ hơn im, vì nó khoá luôn đường ngờ. Xem 9.99.84.

### Sổ chờ

- **SUP-01** — 100.000 điểm chạm là **chỉ tiêu** hay **cách đếm**? Nếu
  là chỉ tiêu thì sáu tháng sau có người chạy cho đủ số, và một điểm
  chạm chạy cho đủ số là một điểm chạm làm phiền. Tên `chamSUP` đã đặt
  sẵn để không đụng thang 1.000.
- **SUP-02** — Cửa hàng tri thức Escrow: mở chiều tiền thứ hai (thành
  viên bán cho thành viên, hệ giữ tiền tạm) là **hoạt động trung gian
  thanh toán**, có hậu quả pháp lý. Hỏi luật sư trước; nếu không mở thì
  nói ra, để năng lực 3 · 17 · 24 · 25 được khai là **không dựng** chứ
  không phải chưa dựng.

---

## ĐỌC HẾT BẢN ĐẶC TẢ — VÀ BỐN CON SỐ CŨ ĐỀU SAI (9.99.84)

Chủ hệ nói một câu: *"Check kỹ và dựng chuẩn không phải sửa lỗi, đi tới
đâu chuẩn tới đó. Đọc kỹ tài liệu của tôi."*

Bản 9.99.83 dựng xong rồi mới sửa ba lỗi, và nó dựng trên **7% tệp**.
Bản này đọc hết 409.993 ký tự trước, dựng sau. Không thêm màn mới — nó
sửa chỗ bản trước khai sai và thêm chỗ chỉ lượt đọc đủ mới thấy.

### Phép đo của tôi KHÔNG THỂ ĐỎ trên đúng thứ nó sinh ra để canh

Đây là bài học nặng nhất của bản này, và nó không phải chuyện đọc thiếu.

Mục 97 vế D so `SUP_DEM.coChu` với tổng cộng từ `SUP_KHOI`. Cả hai cùng
ghi **45**, cả hai cùng sai, và phép đo **XANH**. Vì chúng là **hai bản
chép viết tay của cùng một con số** — phép so ấy canh được sự NHẤT
QUÁN, không canh được sự ĐÚNG.

Kho đã ghi lớp lỗi này ba lần ở mục 71 (9.99.60) và một lần ở mục 90
(9.99.73), nhưng cả bốn lần đều là *hai bản chép của một biểu thức
trong cùng một phép đo*. Lần này nó ở tầng cao hơn: **hai bản chép của
một DỮ KIỆN, và phép đo được dựng để so chính hai bản ấy với nhau**.
Nhìn thì nó là một phép kiểm chéo; thật ra nó là một cái gương.

> **Luật rút ra:** một phép đo so hai ô do cùng một người gõ trong cùng
> một lượt thì nó không phải phép đo chéo. Phải có ít nhất một đầu đến
> từ chỗ khác — một phép đếm chạy được, hoặc một lời khai mang ngày và
> cách đếm để người sau chạy lại.

Tệp bản đặc tả là nội dung của chủ hệ và **không nằm trong kho mã**, nên
bộ kiểm không đếm lại được. Nên `SUP_DEM` nay khai thẳng `nguon:
'nguoiDem'` kèm ngày · tên tệp · **lệnh đếm chạy lại được bằng tay**.
Cùng luật `mayDo`/`nguoiDo` (9.99.62) và `mayDo`/`khai` (9.99.81).

### Con số thật: 59/100, không phải 45/100

Đếm bằng máy trên chính tệp — dò dòng tiêu đề `PHẦN [A-G].n`:

```
A 8 · B 8 · C 12 · D 6 · E 10 · F 8 · G 7  =  59
```

Khối F đã **trọn tám phần** (bản trước khai một). Khối G đã viết bảy,
phần thứ tám bị **cắt giữa câu** — đó là chỗ tệp kết thúc.

### Chỗ nặng nhất: 38 phần KHÔNG THUỘC KHỐI NÀO

Sáu khối A–F khai phạm vi ngay trong tiêu đề. Khối G không khai ở tiêu
đề; một dòng ghi chú biên tập **nằm giữa khối** nói *"khối G gồm 10 phần
đánh số G.53–G.62"*. Cộng lại: bản đồ khối phủ tới phần **62**.

Phần 63–100 chưa có cả một cái tên khối.

**Một phần chưa viết thì còn đọc ra là chưa viết** — nó có tên khối, có
số, có chỗ trong bảng. Một phần chưa có KHỐI thì nó không có chỗ để mà
chưa viết: người dựng sau đếm "100 phần", chia việc theo bảy khối đã có,
và ba mươi tám phần kia **biến mất khỏi kế hoạch mà không ai quyết định
bỏ chúng**. Nặng hơn `conLaiChuaTrinh` (9.99.71) một nấc: ở đó cái bị
cắt còn nằm trong sổ, ở đây nó chưa từng vào sổ.

### Mọi ô `dem` cũ đều sai, vì không ô nào khai cụm dò sinh ra nó

| Chỗ va | Khai | Đếm lại |
|---|---|---|
| V1 `GITA Moment` | 11 | **8** |
| V2 `Escrow` + `Thị Trường Thịnh Vượng` | 18 | **2 + 3** |
| V3 ba cụm từ tuyệt đối | 7 | **1 + 2 + 3** |
| V4 `1.000 điểm chạm` | 0 | **0** ✓ |

Con số duy nhất đúng là số **KHÔNG** — và nó đúng vì một cụm vắng mặt
thì đếm kiểu gì cũng ra vắng mặt. Nay mỗi chỗ va mang ô `cum` là **cụm
dò thật**, và mục 97 đòi nó: *một con số không kèm cụm sinh ra nó thì
không ai chạy lại được, nên không ai biết nó sai.*

### V5 — chỗ va nằm ở 55% tệp, lượt đọc 7% không thể thấy

Phần **E.36** dựng *"Tầng Giúp Viết: người dùng mời → AI giúp diễn đạt
điều vụng về — bạn muốn nói xin lỗi nhưng lời cứ cứng, thử cách này
xem"*, kèm bộ 40 kịch bản có **thư xin lỗi** và **thư cho người đã mất**.

Đó là đúng bốn thứ **L10 Ba Ghế Người Giữ** cấm (9.99.74), và bản đặc tả
không biết là nó đang bị cấm. Cái nguy không nằm ở chất lượng: một lời
xin lỗi máy viết đọc lên **nghe y hệt** một lời xin lỗi thật, nên người
nhận không phân biệt được — và thứ họ nhận được không còn là điều họ
tưởng mình đang nhận. Cùng lý do ghế G5 phải là người (9.99.64).

### Loại chỗ thứ hai: đụng điều cấm ĐÃ CÓ — trỏ, không cấp mã mới

Quét trọn phần **F.45 Arena** (6.252 ký tự): **0 lần** "tuổi", "trẻ",
"18", "học sinh". Sáu hình thức thi đấu không loại trừ ai theo tuổi, và
E.44 đưa giải lên sân khấu tỉnh rồi cúp toàn quốc. Người dưới 18 vào
được — và lúc ấy nó chính là **xếp hạng trẻ với nhau**, đúng thứ LR1 cấm.

`VIP_CAM` **C1 đã cấm đúng việc ấy và đã có răng**. Nên chỗ này **không
được cấp mã va mới** — cấp mã mới là dựng bản thứ hai của một điều cấm ở
dạng lẻ, nguy y hệt dạng bảng mà **khó thấy hơn vì nó không trông giống
một cái bảng**. Nó vào kho riêng `SUP_VA_CU`, trỏ thẳng `C1`.

Nhưng cũng không được im: im thì người dựng Arena đọc C1, thấy nó nói về
GPI-2 của một bản đặc tả *khác*, rồi kết luận Arena không liên quan.

Hai trong sáu hình thức **không đụng C1** và dùng được cho mọi tuổi:
"đấu với mình cũ" và "cả tổ cùng chống một mục tiêu chung". Cả hai không
xếp ai với ai.

### Loại chỗ thứ ba: bản đặc tả TỰ MÂU THUẪN

Khác chỗ va (đụng luật kho) và khác chỗ bắt oan (phép dò của tôi sai).
Hai vế nằm cách nhau hàng chục nghìn ký tự, nên chỉ lượt đọc đủ mới thấy:

| Câu hỏi | Vế A | Vế B |
|---|---|---|
| Máy viết hộ lời với người thân? | E.36 **cho phép** | C.26 và G.57 **cấm** |
| Khối G bao nhiêu phần? | tiêu đề **không khai** | ghi chú giữa khối: **53–62** |
| Số phần | **G.59** = L6 | **G.59** = L7 (trùng số) |

**Phải khai, vì người dựng sau đọc đúng MỘT vế** — và vế nào họ đọc
trước thì vế ấy thắng, mà không ai quyết định điều đó cả. Vế cho phép
lại là vế viết cụ thể nhất: nó có bộ kịch bản, phác đồ ba tầng, chỉ số
đo. Vế cấm chỉ có một câu. Người dựng đi theo **thứ dựng được**.

### Chỗ bắt oan thứ ba, và nó đắt nhất

Phần **F.51 — "BẢNG XẾP HẠNG ĐẠO ĐỨC"**. Dò theo TIÊU ĐỀ thì đây là chỗ
va nặng nhất tệp. Đọc thân bài thì nó là bản **từ chối** xếp hạng đầy đủ
nhất cả tệp: năm TRẠNG THÁI thay thứ tự số, mặc định chỉ mình mình thấy,
và điều khoản bất biến ghi thẳng *"không bao giờ có bảng xếp thứ tự
người mặc định"*.

> **Dò trên TIÊU ĐỀ rẻ hơn dò trên thân bài, nên người ta hay dừng ở
> tiêu đề. Mà một tiêu đề là một cái NHÃN — và nhãn hay mang đúng cụm
> mà thân bài sinh ra để từ chối.**

### Hai lỗi của chính tôi trong lượt dựng này

1. **Hai ngăn cùng mang số 3** trong chú giải `src/supreme.js` — đúng
   cái lỗi tôi vừa ghi vào kho về hai phần cùng số G.59, phạm ngay ở
   dòng bên cạnh.
2. **Danh sách ô của `SUP_DEM` viết tay HAI LẦN** trong mục 97 — một
   bản trong điều kiện, một bản trong câu chi tiết. Đúng luật 9.99.60
   cấm, và đúng chỗ đã trôi ba lần ở mục 71. **Phá thử bắt được**, vì
   nó đòi đọc DÒNG CHI TIẾT chứ không chỉ đọc màu. Nay tính một lần vào
   `demThieu`.

Và một chỗ suýt phạm: ngăn mới định dùng biểu tượng tên `alert`, mà
`U.P` không có tên ấy — `U.ic()` rơi về `spark` **lặng lẽ**. Một biểu
tượng sai trông y hệt một biểu tượng đúng.

### Phá thử — bốn nhánh, đỏ đúng chỗ và gọi đúng tên

| Phá gì | Dòng đỏ in ra |
|---|---|
| Bỏ ô `cum` của V1 | `CHỖ VA KHÔNG KHAI CỤM DÒ: V1` |
| Bỏ ô `cachDem` của `SUP_DEM` | `SUP_DEM THIẾU Ô: cachDem` |
| `SUP_KHONGKHOI.so` 38 → 30 | `khai 30 phần từ 63, mà cộng từ SUP_KHOI ra 38` |
| Cấp mã `V6` cho `SUP_VA_CU` | `MANG MÃ RIÊNG: F.45 … Arena` |
| `camCu` trỏ `C9` (không có thật) | `TRỎ VÀO MÃ VIP_CAM KHÔNG CÓ THẬT` |
| Bỏ vế A của một chỗ mâu thuẫn | `CHỖ MÂU THUẪN KHAI THIẾU VẾ: …` |

`ô n:0` của V4 **không** bị bắt là thiếu — phép đo hỏi `typeof`, không
hỏi đúng/sai. Một con số KHÔNG là một con số hợp lệ, và ở V4 nó là cả ý
nghĩa của mục.

### Sổ chờ

- **SUP-03** *(mới)* — bản đặc tả lấy **13 tuổi** làm ngưỡng riêng tư
  ("trẻ đủ 13 tuổi có quyền phòng riêng tuyệt đối", "trẻ 13–17"). Kho
  **chưa khai một ngưỡng tuổi nào**: mọi cổng dữ liệu con hôm nay hỏi
  VAI (R14) và hỏi CHA MẸ ĐÃ KÝ chưa, không hỏi tuổi. Máy không tự chọn
  một con số tuổi — mang tới bàn luật sư cùng `PLR_VUNG4`. Chốt xong thì
  L06 và L07 mới biết mình canh từ tuổi nào; hôm nay chúng canh theo
  vai, **và vai thì không đổi theo sinh nhật**.
- **SUP-01** có thêm một dữ kiện: chính bản đặc tả đã tự trả lời một nửa
  ở G.53 — *"10 tầng × 10.000 biến thể, biến thể là tổ hợp câu gốc ×
  trạng thái × thời khắc × ngôn ngữ"*. Nhận cách hiểu ấy thì 100.000 là
  **cách đếm**, và mục này đóng được.
- **SUP-02** có thêm một câu hỏi: GITA-Zen (F.50) tự chặn rất kỹ — không
  mua, không bán, trần tồn 300, hạ nhiệt 12 tháng — nhưng GD9 của chính
  phần ấy mở một cửa *"GZ đổi ưu đãi vật chất nhẹ từ đối tác"*.

---

## SUP-03 ĐÃ CHỐT — NGƯỠNG 15, VÀ CHIỀU CẮT MỚI LÀ PHẦN QUAN TRỌNG (9.99.85)

Chủ hệ chốt **15**, và chốt luôn chiều cắt: **15 là tuổi TỐI THIỂU ĐỂ CÓ
tài khoản R14.** Con dưới 15 không mở tài khoản riêng; mọi dữ liệu về
con đi qua cha mẹ đã ký `duLieuCon` (9.99.70).

Kho `G.SUP_TUOI` · `G.SUP_DACHOT`; mục **97 vế G**; SUP-03 tiễn khỏi sổ
chờ.

### Con số không đủ — phải ghi cả CHIỀU CẮT

Hai chiều cho hai kết quả ngược nhau với một đứa trẻ mười hai tuổi:

| Chiều | Hệ quả |
|---|---|
| **Đã chốt** — dưới 15 không có tài khoản | L06 · L07 **giữ nguyên**. Mọi R14 nay đều từ 15, nên không lớp bảo vệ nào bị gỡ. |
| Chiều kia — dưới 15 có tài khoản, chưa có quyền phủ quyết | **GỠ một lớp đang chạy**: hôm nay em bé mười hai tuổi từ chối là ẩn nút, chiều ấy cho cha mẹ đè lên. |

Nên `SUP_DACHOT` ghi **cả câu hỏi lẫn chiều cắt**, không chỉ ghi "15".
Người đọc sau chỉ thấy con số thì họ tự chọn chiều — và một trong hai
chiều lấy mất quyền của đứa trẻ.

**Ngưỡng 15 KHÔNG thay ngưỡng 18 của V1.** Một em mười sáu tuổi có tài
khoản và vẫn dưới 18, nên cờ đồng ý ảnh vẫn phải đọc trước. Hai ngưỡng
đo hai việc khác nhau.

### Không có chỗ nào để cắm răng — và đó là kết quả của phép đo, không phải cảm giác

Đo trên mã trước khi dựng:

- **Đúng MỘT câu `INSERT INTO users` trong cả `may-chu/`**, ở
  `dang-ky.js`, và nó ghi vai **cứng `'R13'`**. Không cửa nào tạo tài
  khoản R14 — cửa ấy **chưa tồn tại**.
- **`users` không có ngày sinh. `students` cũng không.** Cả chuỗi tài
  khoản không mang tuổi ở đâu cả.

Nên khai `rangO` là khai một cái tick người duyệt sẽ tin. Khai
`chuaCoMat`, đúng lối `rangO`/`chuaCoMat` của mười hai luật giao diện
(9.99.74). Lối đo về thứ không được tồn tại, **lần thứ chín**.

### Chỗ dễ dựng sai nhất nằm sẵn trong kho, chờ người vấp phải

`hoSoSongSinh.tuoiCon` là một **`INTEGER` NGƯỜI KHAI** — nó nằm trong
`COT_NGUOI_KHAI`, và một con số tuổi thì **cũ đi mỗi năm** mà không ai
gõ lại. Dựng cổng tuổi trên nó là dựng lại đúng cái bẫy mà chính
`csdl.sql` cấm ở **BỐN DÒNG NGAY PHÍA TRÊN nó** (cột `den`, cột
`conHan`).

Tuổi phải tính **lúc đọc** từ một ngày sinh. Hôm nay chỉ có
`ngaySinhCon`, và nó tự khai *"chỉ dùng để nhắc sinh nhật"* — thuộc hồ
sơ NHÀ, không thuộc tài khoản con, và không bắt buộc. Cửa R14 phải hỏi
ngày sinh của **chính người mở tài khoản**, không đi vòng qua hồ sơ nhà.

**Không nửa vời sửa `tuoiCon` trong bản này.** Nó do người khai qua
`COT_NGUOI_KHAI`, được `vung-manh` đọc và ghi vào `theVungManh` — đổi nó
là một lượt sửa lược đồ cộng hai mô-đun, và nó cần bộ phá thử riêng.
Ghi ra chỗ hỏng kèm đường đi thì người sau sửa được; sửa một nửa thì
người sau tưởng đã xong.

### Phép đo canh HAI ĐẦU ĐỘC LẬP — đúng luật vừa rút ra ở 9.99.84

Vế E của bản trước đã chốt: *một phép đo so hai ô do cùng một người gõ
trong cùng một lượt thì nó không phải phép đo chéo.* Vế G áp ngay luật
ấy vào chính nó:

- **Đầu một** — lời khai của kho: `chuaCoMat` hay `rangO`.
- **Đầu hai** — số cửa ghi `users` và vai chúng ghi, **đọc thẳng từ mã
  `may-chu/`**.

Hai đầu phải khớp. Dựng cửa R14 mà quên ngưỡng thì lệch, và nó đỏ.

Một chi tiết của phép dò: ở đây **chỉ bỏ CHÚ GIẢI, không bỏ chuỗi** —
ngược với luật 9.99.78. Vì luật ấy nói về việc dò một cái *tên bị cấm*,
còn đây dò một *câu lệnh SQL nằm trong chuỗi*: bỏ chuỗi là mất luôn thứ
cần dò.

### Phá thử — ba nhánh, đỏ đúng chỗ và gọi đúng tên

| Phá gì | Dòng đỏ in ra |
|---|---|
| Trồng một câu ghi `users` vai `R14` | `ĐÃ CÓ CỬA GHI users VAI R14 (dang-ky.js×2) mà kho vẫn khai chuaCoMat` |
| Khai `rangO` khi chưa có cửa | `CHƯA CÓ CỬA R14 nào (1 câu ghi users: dang-ky.js×1) mà kho khai rangO — một cái tick cho cổng chưa tồn tại` |
| Để SUP-03 nằm cả hai sổ | `MỤC ĐÃ CHỐT VẪN NẰM TRONG SỔ CHỜ: SUP-03` |

Nhánh thứ nhất là nhánh đáng giá nhất: nó chứng minh phép đo **thật sự
đọc mã `may-chu/`**, chứ không chỉ đọc lời khai của kho.

### Một lỗi của chính tôi, lần thứ TƯ của cùng một lớp

Tôi truyền `h(...)` vào `U.sec()` — mà `U.sec()` **tự gọi `U.h()`**, nên
thoát hai lần. Bản 9.24 gỡ 77 chỗ · 9.99.70 mắc lại ở `U.empty()` ·
9.99.83 ở `U.sec()` · và lần này ở **đúng tệp có dòng cảnh báo cách đó
bảy mươi dòng**.

> **Một lời cảnh báo đặt trong chú giải chỉ chặn được người ĐANG ĐỌC nó.**
> Chỗ này cần một phép đo, không cần thêm một dòng chú giải nữa.

Bắt được vì chạy bộ rà soát chỗ trống, không vì đọc lại mã.

---

## SUP-01 · SUP-02 ĐÃ CHỐT — HAI CHỐT MỞ RA VIỆC (9.99.86)

Kho `G.SUP_WOW` · `G.SUP_WOW_LUAT` · `G.SUP_CHO`; mục **97 vế H**;
SUP-01 · SUP-02 tiễn khỏi sổ chờ, mở SUP-04 · SUP-05.

**Cả hai đều là chốt MỞ RA việc, không phải chốt đóng việc.** Một câu
trả lời đóng một mục rồi mở mục khác là chuyện bình thường — giấu mục
mới đi để sổ trông ngắn lại mới là chỗ hỏng.

### SUP-01 — 100.000 là CÁCH ĐẾM, và cái bẫy DỜI CHỖ chứ không mất

Chủ hệ chốt bằng cách nói 100.000 điểm chạm **là gì**, không nói phải
đạt bao nhiêu: *"trải nghiệm wow của học viên khi sử dụng kênh"*, với
năm nguồn wow. Không con số nào phải chạy cho đủ, nên **câu hỏi mẫu số
tan theo**. Bản đặc tả cũng tự nói y thế ở G.53 — hai đầu khớp nhau.

Bằng chứng nằm ngay trong câu chốt: nguồn wow thứ năm là **ít quảng cáo
gây nhiễu** — nó đo *càng ít càng tốt*, tức là đúng thứ ngược với chạy
cho đủ số.

Nhưng phần đáng giữ nhất là chỗ khác:

> **SUP-01 sinh ra để chặn một chuyện — *sáu tháng sau có người chạy cho
> đủ số*. Chốt xong thì 100.000 hết là chỉ tiêu, nhưng WOW vừa thành thứ
> mới để đặt chỉ tiêu. Và wow nguy hơn con số cũ, vì nó là LỜI KHAI của
> người dùng, đo bằng khảo sát — mà khảo sát thì nâng lên được.**

Nên `SUP_WOW_LUAT.camDatChiTieu` dựng cái trần ấy **ngay bây giờ**,
trước khi có ai dựng một chỉ số wow. Cùng luật với chỉ số thứ mười hai
của bảng điều khiển CEO — *"số việc tử tế tầng 4–5"* cố ý không có
ngưỡng báo động (9.99.71).

Và câu *"càng sử dụng càng thấy wow"* là một **CHIỀU**, không phải một
con số. Dựng nó thành một đường cong phải đi lên là dựng lại chỉ tiêu
bằng đường vòng.

### Năm nguồn wow — mỗi nguồn ĐÚNG MỘT đường đo

Đo trên mã trước khi khai, nên hai nguồn phải khai là **người đo**:

| Mã | Nguồn | Ai đo | Neo vào đâu |
|---|---|---|---|
| W1 | được bảo vệ quyền lợi | máy | `LGD_LUAT` lọc `rangO` — **12/12** có răng thật |
| W2 | được sàng lọc kỹ thành viên | **người** | quét `may-chu/` ra **0 cửa** — chưa có năng lực → SUP-04 |
| W3 | tri thức chất lượng | máy | cửa `soatNoiDung` đã chạy |
| W4 | cộng đồng lành mạnh có giáo dục | **người** | HDI (E.40) chưa dựng, và ba trong tám chiều của nó là khảo sát |
| W5 | ít quảng cáo gây nhiễu | máy | **không hệ quảng cáo nào** — hôm nay con số là KHÔNG, không phải "ít" |

Trình năm nguồn như đã đo cả năm thì người duyệt thấy năm dấu tick rồi
thôi không đọc — và **hai nguồn nặng nhất về NGƯỜI lại đúng là hai nguồn
không ai đọc**. Cùng luật `mayDo`/`nguoiDo` của Hiến pháp (9.99.62).

**W5 là nguồn duy nhất mà cái trần đi ĐÚNG CHIỀU với luật kho.** Mọi
nguồn khác đo *càng nhiều càng tốt*; nguồn này đo *càng ít càng tốt*,
nên nó không bao giờ biến thành một chỉ tiêu để chạy.

### SUP-02 — chốt MỞ, và cổng CÒN LẠI không phải chất lượng

Chủ hệ chốt **mở**, với bốn điều kiện: *dịch vụ chất lượng · qua kiểm
duyệt kỹ · đảm bảo quyền lợi khách hàng · đánh giá 4 sao trở lên.*

Bốn điều kiện ấy đều là điều kiện **CHẤT LƯỢNG**, và chúng không thay
được cổng **PHÁP LÝ**: giữ tiền người mua tới lúc người bán giao xong là
hoạt động trung gian thanh toán, có nghĩa vụ giấy phép riêng. Kho không
kết luận pháp lý (9.99.70), nên câu ấy thành **SUP-05**, hỏi luật sư
**trước khi có đồng tiền đầu tiên đi qua**.

Ghi rõ chỗ ấy vì **một mục đã chốt "mở" rất dễ được đọc là "mở được
rồi"** — trong khi thứ chặn không phải chất lượng mà là giấy phép.

### Chỗ dễ nhầm nhất: hệ ĐÃ trả tiền ra cho thành viên rồi

`traHoaHong` đã chạy — Học viện trả hoa hồng cho đại sứ. Nhìn thì giống:
tiền đi từ Học viện sang một thành viên.

| | Là gì |
|---|---|
| `traHoaHong` | tiền **CỦA HỌC VIỆN** trả một khoản mình nợ |
| Escrow | tiền **CỦA NGƯỜI MUA** mà Học viện giữ hộ |

Hai hình pháp lý khác hẳn nhau. Người dựng sau rất dễ nhìn `traHoaHong`
rồi kết luận *"hệ đã chuyển tiền cho thành viên rồi, escrow chỉ là thêm
một đường nữa"*.

### Hai lỗ nằm sẵn trong chính bốn điều kiện

**Ngưỡng "4 sao trở lên" đóng cửa với người bán MỚI.** Họ chưa có đánh
giá nào → chưa bao giờ đạt 4 sao → không bán được lượt đầu → không bao
giờ có đánh giá. **Cổng ấy không lọc ai cả, nó chỉ khoá cửa.** Phải có
một đường vào cho lượt đầu trước khi bật ngưỡng sao.

**Một ngưỡng sao là thứ bị nuôi đầu tiên trong mọi chợ.** Kho đã có sẵn
lối chống — `chamThiGiac` (9.99.55) chặn khi tám trong mười lượt gần
nhất từ 90 điểm trở lên. Dùng lại lối ấy, đừng dựng bộ chống thứ hai.

### Cái răng thật: không cửa nào giữ tiền hộ chừng nào SUP-05 còn mở

Cả phần này là bảng, và bảng thì không chặn được gì — đúng rủi ro mục 88
đã ghi. Nên vế H canh một thứ đo được: **quét `may-chu/` cho danh sách
hàm xuất ra, và đỏ nếu thấy một cửa giữ tiền hộ** trong khi SUP-05 còn
nằm trong sổ chờ. Phép đo về thứ không được tồn tại, **lần thứ mười**.

Đo trên **danh sách hàm xuất ra**, không dò chữ trong câu văn — bài học
9.99.60: phép dò chữ chỉ kiểm được những tên nó ĐÃ BIẾT. Và cụm dò là
**cụm nhiều âm tiết** (`kyQuy` · `giuTienHo` · `giaiNganMoc`), không dò
`tien` trần: `traHoaHong` · `hoanTien` · `soTien` đều hợp lệ và đã chạy.

Phép canh này **tự nhường chỗ** khi SUP-05 đóng — nó canh một quãng thời
gian, không canh vĩnh viễn, và dòng chi tiết nói ra điều đó.

### Phá thử — hai nhánh, đỏ đúng chỗ và gọi đúng tên

| Phá gì | Dòng đỏ in ra |
|---|---|
| Thêm `export async function kyQuy` vào `tai-chinh.js` | `ĐÃ CÓ CỬA GIỮ TIỀN HỘ TRONG KHI SUP-05 CÒN MỞ: tai-chinh.js → kyQuy` |
| W5 khai cả `mayDo` lẫn `nguoiDo` | `NGUỒN WOW KHAI CẢ HAI ĐƯỜNG HOẶC KHÔNG ĐƯỜNG NÀO: W5` |

Hai nhánh còn lại (`luatDu` · `choDu`) là phép kiểm ô-có-mặt, cùng hình
với `duO` của vế G đã phá thử ở 9.99.85 — **nói ra là chưa phá thử
riêng**, không lặng lẽ tính là đã kiểm.

### Và lần thứ NĂM của lỗi `U.sec()`

Tôi lại bọc `h()` trong tham số `U.sec()` — lần này giá trị là `"MỞ"`,
không có ký tự đặc biệt, nên **thoát hai lần không lộ ra**. Đó chính là
lý do lớp lỗi này sống lâu: nó chỉ hiện khi chuỗi có ký tự đặc biệt, nên
mọi lượt thử với chuỗi lành đều xanh.

### Sổ chờ mới

- **SUP-04** — sàng lọc thành viên: lọc theo căn cứ gì, ai quyết, **và
  người bị loại đi đâu**. Câu thứ ba hay bị bỏ, mà một lời từ chối cụt
  là một người mang cảm giác xấu về Học viện đi kể lại. Nguồn wow W2 dựa
  vào năng lực này, nên tới khi chốt thì W2 vẫn khai `nguoiDo`.
- **SUP-05** — giấy phép trung gian thanh toán và nghĩa vụ thuế của
  người bán. Hỏi **trước** đồng tiền đầu tiên. Hỏi kèm: GITA-Zen (F.50)
  đổi ưu đãi vật chất từ đối tác một chiều — chỗ ấy có bước qua không.

---

## SUP-01 NÓI LẠI RỘNG HƠN — BA CHIỀU, BA VAI KHÁCH (9.99.87)

Chủ hệ nói lại: *"100.000 điểm trải nghiệm toàn bộ các tính năng, giá
trị, mức độ hài lòng của khách hàng khi đồng hành cùng kênh mạng xã hội
của GITA365."*

Kho `G.SUP_BACHIEU` (3) · `G.SUP_BACHIEU_LUAT` (10); mục **97 vế I**.
Câu trả lời của SUP-01 **không đổi** — 100.000 vẫn là CÁCH ĐẾM. Đổi là
thứ được đếm.

### Bản ghi 9.99.86 HẸP HƠN, và không sai dòng nào

Đó là chỗ đáng học. Một bản ghi sai thì có người cãi; một bản ghi
**thiếu** thì không có gì để mà cãi — nó chỉ lặng lẽ hẹp lại.

| Tôi ghi | Chủ hệ nói | Mất gì |
|---|---|---|
| học viên | **khách hàng** | ba vai, và vai bị bỏ là vai **TRẢ TIỀN** |
| wow | **tính năng · giá trị · hài lòng** | chiều DUY NHẤT máy đếm thẳng được |

Chỗ hẹp thứ hai đắt hơn: gộp cả ba vào chữ *wow* là đẩy chiều tính năng
sang ngăn khảo sát, tức là bỏ đúng chiều không cần đi hỏi ai.

### Ba chiều, mỗi chiều đúng một đường

| Mã | Chiều | Ai đo | Hôm nay |
|---|---|---|---|
| B1 | toàn bộ **tính năng** | máy | mẫu số đếm được; **tử số `chuaDo`** — chưa có sổ lượt dùng theo từng khách |
| B2 | **giá trị** | người | máy đếm được thứ ĐÃ GIAO, không đếm được thứ NHẬN |
| B3 | **mức độ hài lòng** | người | `G.HAILONG` còn nằm trong `DL_MAU` — số của nhà hư cấu |

**B2 không phải chiều máy không với tới — nó là chiều máy với tới NỬA
SAI.** Đem con số đã-giao trả lời câu hỏi nhận-được là đổi tên một phép
đo, và bản đổi tên ấy **luôn đẹp hơn sự thật**, đẹp hơn đúng lúc giao
nhiều nhất. Cùng ranh giới ngăn KHACH của trần giám sát (9.99.76): Học
viện đo thứ mình GIAO, không đo người NHẬN.

### Ô `chuaDo` CHỈ đi kèm `mayDo` — vế mới của luật

Trạng thái thứ ba dựng ở 9.99.82. Một hàng **người-đo** mang `chuaDo`
là vô nghĩa: người thì lúc nào cũng hỏi được, chưa hỏi là **chưa ai đi
hỏi**, không phải "chưa đo được". Cho nó đứng chung là mở đường cho một
hàng nằm im mãi dưới một cái nhãn nghe như một giới hạn kỹ thuật.

### Kho KHÔNG được giữ mẫu số

Mẫu số của B1 đếm **lúc đọc** từ `G.NAV` lọc bằng chính `G.vaiCo` mà
cột trái dùng. Gõ nó vào kho là dựng lại đúng cột `conHan` (9.99.63) và
cột `den` (9.99.66) — thêm một màn là nó sai, và **sai theo hướng ĐẸP
LÊN**: tử số tăng, mẫu số đứng yên, tỷ lệ tự nở.

Mục 97 vế I canh ba vế: mỗi chiều `mayDo` XOR `nguoiDo` · `chuaDo` chỉ
đi với `mayDo` · **không hàng nào mang một ô kiểu `number`**, và
`src/supreme.js` phải gọi thật `G.NAV` + `G.vaiCo`.

### Lượt đo ĐẦU TIÊN của tôi sai, và sai theo hướng rộng ra

Tôi chạy `G.vaiCo` với `G.PHANQUYEN` **rỗng** và ra **68** cho R13. Con
số thật là **66**: `G.PHANQUYEN` là lớp **cấm riêng** đè lên thang cấp,
và nó cấm R13 đúng hai quyền `ctv_lien_ket` · `ctv_hoa_hong`.

> **`r.lv <= need` mới là một nửa luật.** Dựng lại phép so cấp bằng tay
> là bỏ mất nửa kia, và phép đếm sai theo hướng **rộng ra** — hệ trông
> như cho khách xem nhiều hơn thật.

Số đo được ngày 14/09/2026, trên 199 mục `G.NAV`:

```
R13 phụ huynh  66   R14 học viên  59   R15 đại sứ  54
hợp ba vai     68   — không phải tổng (179), cũng không bằng R13 (66)
```

Ba vai lồng nhau **gần hết**, nhưng hai màn đại sứ nằm NGOÀI phần R13
thấy. Ai đọc "hợp ba vai" như một phép cộng thì con số gấp gần ba lần
sự thật.

### Không gộp ba chiều thành một con số trên 100.000

Một chiều máy đếm cộng với hai chiều khảo sát thì con số ra **mang tên
của phép đo** trong khi nó thừa hưởng mọi sai của lời khai. Cùng luật
phễu (9.99.59) và thang 1000 (9.99.81).

### Mười việc một người hâm mộ làm — cán cân lật về phía MÁY

Chủ hệ nói tiếp bằng **hành vi**: tỷ lệ ở lại · tần suất dùng hằng ngày ·
giới thiệu khách · đăng ký cửa hàng · tự lan toả · đánh giá sao · phản
hồi góp ý · bảo mật riêng tư cao · quyền thành viên cao nhất · giới tri
thức ưa chuộng nhất.

Kho `G.SUP_FAN` (10) · `G.SUP_FAN_LUAT` (11); mục **97 vế J**.

**Hành vi thì đếm thẳng được — 8/10 việc máy đo**, so với 1/3 của ba
chiều. Đây là chốt làm phần máy đo TO RA, không phải chốt thêm việc cho
người khai. Nhưng bốn chỗ phải nói ra:

| | Việc | Chuyện |
|---|---|---|
| **Đã có bộ đếm** | F1 · F3 · F6 · F8 | S6 · S7 · `chamThiGiac` · W1 đang chạy — **trỏ, đừng đếm lại** |
| **Phạm luật khoá** | F2 tần suất hằng ngày | **L08 cấm giữ chân** |
| **Chặn pháp lý** | F4 đăng ký cửa hàng | **SUP-05**, không phải kỹ thuật |
| **Va bộ lọc của mình** | F10 "ưa chuộng NHẤT" | **QC1** `CUM_TUYET_DOI` |

**Bản thứ hai của một CON SỐ nguy hơn bản thứ hai của một bảng** — hai
con số lệch nhau thì cả hai đều trông đúng, và không ai biết phải tin
cái nào. Nặng nhất ở F1: `S6` loại nhà chưa đủ 90 ngày ra khỏi mẫu và
NÓI RA bao nhiêu bị loại; một bộ đếm "ở lại" viết mới sẽ không có luật
ấy, và nó thổi tỷ lệ lên đúng lúc đang tuyển nhiều nhất.

**F2 là việc DUY NHẤT mà tối đa hoá làm hại chính người dùng.** Chín
việc kia quá tay thì lãng phí; việc này quá tay thì phản lại điều Học
viện bán — một nhà mở ứng dụng nuôi con nhiều hơn không phải một nhà
đang khá hơn. Đếm để BIẾT thì được; đặt đích thì phạm L08.

**Đếm được KHÔNG mở đường đặt đích.** `camDatChiTieu` (9.99.86) vẫn áp
cho cả mười, và nay cần hơn lúc chỉ có năm nguồn wow: mười con số hành
vi là mười cái đích rất sẵn. Khác nhau ở chỗ **con số đi đâu** — lên
bảng để đọc thì được, xuống bảng lương hay KPI thì không.

*"Một fan yêu cuồng nhiệt" là KẾT QUẢ, không phải một ô để tối ưu.* Mười
việc này là DẤU HIỆU của nó. Lấy dấu hiệu làm đích thì được đúng dấu
hiệu mà không được cái sinh ra chúng.

### Phép đo của tôi đỏ ngay ở kho lành — và lỗi ở PHÉP ĐO

Bản đầu của vế J đòi: có ô `daCo` thì phải có `khongDungLai`. Nó bắt
**F7 · F8 · F9** ở bản nguyên vẹn. Nguyên nhân: ô `daCo` mang **hai
nghĩa**.

| Nghĩa | Ví dụ | Có phải "đừng đếm lại" không |
|---|---|---|
| đã có bộ **ĐẾM** đang chạy | F1 → S6 | **có** |
| đã có **VẬT LIỆU** phép đo này đọc | F9 → danh sách quyền từ chối | không |

Cách sửa dễ là viết thêm một câu cho ba dòng kia. Đó là **độn chữ cho
vừa một phép đo** — và một dòng độn thì người sau đọc lướt qua, kể cả ở
ba dòng có thật.

> **Tách TÊN Ô, đừng nới phép đo.** `daCoDem` buộc `khongDungLai`;
> `daCo` không. Nới thì cả bốn dòng loại một cũng thôi bị canh.

Và canh luôn chiều ngược: có `khongDungLai` mà không có `daCoDem` thì
câu ấy nói về một bộ đếm **không ai nêu tên**.

---

## SỔ ĐẶC TẢ — 17 BẢN, 7 ĐÃ DỰNG, 10 CHƯA (9.99.88)

Kho `G.TAILIEU_SPEC` (17) · `G.TAILIEU_SPEC_LUAT` (6); công cụ
`tools/soi-tai-lieu.js`. **Không thêm màn nào.**

### Câu chưa ai trả lời được bằng máy

*Bản đặc tả nào đã dựng, dựng tới đâu, phần nào chưa.* Tới 9.99.87 câu
ấy nằm rải trong chú giải tệp này — ba mươi ngàn chữ — nên **mỗi phiên
phải dò lại từ đầu**. Đúng khoản tốn lớn nhất mà không ai nhìn thấy.

`G.TAILIEU_DRIVE` (DR-01…DR-10) **không cũ, nó trả lời câu khác**: nó
là sổ cho tài liệu NỘI DUNG đã tiêu hoá vào kho, kèm `soChu` /
`soChuKho`. Gộp hai sổ là để một bản đặc tả chưa dựng nằm chung rổ với
một cuốn sách đã vào kho.

Công cụ **không lưu gì cả**, cùng lối `kho-luu.js` (9.99.79) — nó chỉ
đọc, và đối chiếu **hai đầu độc lập**: lời khai của sổ ↔ kho `G.*` ·
màn `G.NAV` · cửa `may-chu/` **có thật trên đĩa**. Luật 9.99.84.

```
node tools/soi-tai-lieu.js          bảng tổng
node tools/soi-tai-lieu.js --thieu  chỉ chỗ chưa dựng
node tools/soi-tai-lieu.js --muc <mã>  đếm lại phần của một bản
```

### Kho Drive lớn hơn nhiều so với thứ phiên làm việc đang có

Bốn thư mục, ~60 tệp. Riêng *TRỢ LÝ AI GITA 365* có **14 tệp đặc tả**,
phiên này mới có 8. **Bảy tệp chưa đọc một chữ**, tổng 4,75 MB — trong
đó `APP NGÔN NGỮ MASTER ARCHITEC1.doc` 1,7 MB và `2. Bản cao cấp GITA
365.doc` 1,5 MB (phiên này mới có tệp SỐ 1).

**Một ứng dụng kho chưa có một dòng nào: App Ngôn Ngữ** — 2,3 MB qua
hai tệp, cộng *App Trí Tuệ* ở thư mục VIP.

**Bản chép ở thư mục tạm của phiên. Mất phiên là mất.** Ô `drive` giữ
đường về bản gốc — cùng lý do 9.99.79 đưa `giay-phep/` vào bản sao lưu.

### Giá của một lượt tải — đo chứ không đoán

Tải tệp Drive qua base64 tốn **~0,34 token mỗi byte**: tệp 23 KB hết
~8.000 token, bảy tệp chưa đọc ≈ **1,6 triệu token**.

> **Đường rẻ là chủ hệ ĐÍNH KÈM tệp vào phiên** — tệp rơi thẳng xuống
> đĩa, không qua ngữ cảnh, **0 token**. Đúng cách tám tệp hiện có đã tới.

### Chỗ nặng nhất: HAI văn bản cùng tên Hiến pháp

`dt4.txt` là **HIẾN PHÁP GITA 365 — văn bản gốc**, tự khai *"Cấp hiệu
lực: cao nhất. Mọi văn bản khác trái Hiến pháp này đều vô hiệu"*. Có
**Chương II — CHÍN ĐIỀU BẤT KHẢ SỬA**, Chương X Bảo hiến, Chương XI Sửa
đổi, hai phụ lục kiểm hiến.

Kho đang thi hành `BN_HIENPHAP` **13 điều** — của *Bộ Não v3.0*, một
văn bản khác. Máy quét kho: **0 lần** "bất khả sửa" · "bảo hiến" ·
"kiểm hiến".

Cùng lớp lỗi `SUP_THANG` đã ghi — *một luật bị phạm thì có người cãi;
hai thang cùng tên thì không ai cãi, chúng chỉ dần được đọc như một*.
Lần này thứ trùng tên là **hiến pháp**, nên mọi cổng của kho có thể
đang canh sai bản. Phần duy nhất đã vào kho là Điều 19 (sáu bậc theo
NĂM), đối chiếu ở BG-01 và chủ hệ chốt 9.99.73 **giữ năm bậc theo
chặng**. Mục chờ **TL-08**, Vùng Đỏ — máy không tự chọn.

### Bốn bản đụng thứ kho ĐÃ CÓ — đối chiếu trước, dựng sau

| Bản | Đụng | Lệch |
|---|---|---|
| TL-08 Hiến pháp gốc | `BN_HIENPHAP` | 13 điều ↔ 9 điều bất khả sửa |
| TL-10 GITA-WOW | `BD_CAP` | kho 10 cấp ↔ đặc tả tới cấp 33 |
| TL-14 10 phân đoàn tầng 2 | hệ năm tầng | thang thứ ba? |
| TL-17 250 câu trắc nghiệm | `SH_HOI` | kho 348 câu ↔ 250 câu |

Dựng trước rồi đối chiếu là dựng bản thứ hai của một sự thật.

### ~~Bánh đà: chỗ NỐI bằng 0~~ → **đã nối sẵn** (sửa ở 9.99.89)

`BD_LON` 10 lớn × 10 nhỏ = **100**. Máy quét *cả kho ấy* ra `BN_ 0 ·
bo-nao 0 · kenh 0 · SUP_ 0 · cua: 0`, và tôi kết luận **"không một bánh
đà nào nối vào bất cứ hệ nào"**. Câu ấy **SAI**.

Phép quét đọc **một phía** — `data.banh-da.js`. Chỗ nối nằm ở phía kia:
`HT_TANG[].bd` và bảng `HT_NOI`. Cùng lớp lỗi `napKho()` quên
`src/data.core.js` ở chính bản này: **một phép quét một phía thì nó báo
thiếu đúng thứ đang có.**

Giữ dòng sai ở đây thay vì xoá — xem 9.99.89.

Hai chỗ còn đúng: Group Facebook có **0 cửa máy chủ**; `BD_LUAT[5]`
*"không nhà nào bị so với nhà khác"* là **bản thứ hai** của `LR1` và
`VIP_CAM C1` (hai cái ấy đã có răng).

### Hai lỗi của tôi, khác loại, cùng bắt ở lượt chạy đầu

1. **Lỗi PHÉP ĐO** — `napKho()` chỉ nạp `kho-goc/`, mà `G.NAV` nằm ở
   `src/data.core.js`. Mọi màn báo thiếu, công cụ **bắt oan 7 bản đang
   khai đúng**. Một phép đo bắt oan thì lần sau người ta tắt nó đi.
2. **Lỗi DỮ LIỆU** — bảy tên kho tôi **gõ theo trí nhớ**
   (`VIP_PHAMVI` · `NAC_VUNG` · `TU_RANG_BUOC`…) không tồn tại. Tên thật
   là `VIP_NGAN` · `TNC_KHONG_CHAM` · `TU_RANGBUOC`. Đúng thứ luật kho
   cấm, phạm ngay ở tệp sinh ra để chống nó.

### Và con số 59 của 9.99.84 sai cả hai chiều

Máy đếm lại: **60 dòng tiêu đề · 58 số riêng**. Khối G có **8 dòng
nhưng chỉ 6 số** — `G.57` và `G.59` mỗi cái lặp. Bản 9.99.84 khai 59 và
ghi *"G 7"*: không phải 60, không phải 58, và khối G không phải 7.

> Chính luật 9.99.84 rút ra đã bắt nó: **một con số không kèm CÁCH ĐẾM
> thì không ai kiểm lại được.** Nay sổ khai cả hai con số kèm lệnh đếm
> chạy lại được.

Bản đã soi lưu ở Drive chủ hệ: *TRỢ LÝ AI GITA 365 → GITA365 — SỔ ĐẶC
TẢ*.

---

## BÁNH ĐÀ × NĂM TẦNG — MỘT NGUỒN, KHÔNG HAI BẢN CHÉP (9.99.89)

Chủ hệ chốt: *"hệ thống bánh đà liên quan hành trình 5 tầng khách hàng
đi qua GITA365"*. Bộ kiểm **mục 98**. Không thêm màn, không thêm kho.

### Chốt này kho đã thi hành từ trước — và lời tôi nói ở 9.99.88 SAI

Đo ra, không đoán:

```
BD_LON[].tang   BD1,2→T1  BD3,4,5→T2  BD6,7→T3  BD8,9→T4  BD10→T5
HT_TANG[].bd    T1[1,2] T2[3,4,5] T3[6,7] T4[8,9] T5[10]     ← KHỚP
HT_NOI          năm thang quy về TANG, cả năm daNoi:true
```

Chú giải đầu `data.hanh-trinh-5-tang.js` đã viết từ v9.21: *"Ba cái đầu
ĐÃ nối vào năm tầng, và nối bằng khoá máy đọc được."*

Tôi ở 9.99.88 quét `data.banh-da.js` ra `BN_ 0 · SUP_ 0 · cua: 0` rồi
kết luận **"không một bánh đà nào nối vào bất cứ hệ nào"**. Sai — phép
quét đọc **một phía**, mà chỗ nối nằm ở phía kia.

> **Một phép quét một phía thì nó báo thiếu đúng thứ đang có.** Cùng
> lớp lỗi `napKho()` quên `src/data.core.js` ở chính bản 9.99.88 — hai
> lần trong một bản, và cả hai đều là **bắt oan**.

### Việc thật của bản này: gỡ bản chép thứ hai

Hai chiều khớp **hôm nay**. Không gì buộc chúng đi cùng ngày mai: thêm
bánh đà thứ mười một, hay dời BD5 từ T2 sang T3, thì người sửa đụng
đúng một bên.

Nặng hơn: **không ai đọc `HT_TANG[].bd`.** Quét cả `src/` lẫn
`may-chu/` ra 0 chỗ.

> **Một bản chép KHÔNG AI ĐỌC là bản chép tệ nhất** — nó chỉ ngồi chờ
> trôi, và lúc trôi thì không màn nào hiện ra chỗ sai.

Nguồn duy nhất nay là `BD_LON[].tang`; chiều ngược **lọc lúc đọc**.
Cùng luật cột `conHan` (9.99.63) · cột `den` (9.99.66) · mẫu số B1
(9.99.87). Và `HT_NOI_LUAT.vi` đã viết sẵn lý do: *"Nối bằng mắt người
thì coi như chưa nối"* — hai bản chép cũng nối bằng mắt, chúng nối bằng
lời hứa rằng ai đó sẽ nhớ sửa cả hai.

### Mục 98 — bốn vế

| Vế | Canh gì |
|---|---|
| A | `HT_TANG` **không mọc lại** ô `bd` — thứ không được tồn tại, **lần thứ 11** |
| B | mọi `BD_LON[].tang` trỏ tầng có thật · mọi tầng có ít nhất một bánh đà |
| C | 100 bánh nhỏ **không khai tầng riêng** — thừa hưởng của cha |
| D | `HT_NOI` đủ năm thang, mọi kho nó trỏ có thật |

**Vế C là chỗ dễ bỏ nhất.** Cho bánh nhỏ khai tầng riêng là mở đường
cho một bánh nhỏ nằm khác tầng cha nó — và lúc ấy luật *"không nhảy cóc
một bậc"* (`HT_LUAT`) hết canh được gì.

Vế B đo **hai đầu độc lập**: `HT_TANG` do tệp hành trình khai, `BD_LON`
do tệp bánh đà khai — hai tệp khác nhau, nên đây là phép kiểm chéo thật,
không phải cái gương của luật 9.99.84.

### Chỗ nối CÒN LẠI, và nó là chỗ khác

Bánh đà ↔ **năm tầng** đã nối. Bánh đà ↔ **Bộ Não · trợ lý · kênh ·
group Facebook** thì chưa, và Group Facebook có **0 cửa máy chủ · 0
kho**. `TL-11` (971 KB, nhắc *bánh đà* 77 lần) là tài liệu trả lời được
câu ấy — chưa đọc.

Và `BD_LUAT[5]` *"không nhà nào bị so với nhà khác"* vẫn là **bản thứ
hai** của `LR1` (9.99.63) và `VIP_CAM C1` (9.99.76) — hai cái ấy đã có
răng, cái này không.

---

## CHÍN ĐIỀU BẤT KHẢ SỬA — GOM VÀ GỌI TÊN (9.99.90)

Theo **HIẾN PHÁP GITA 365 — văn bản gốc**, Chương II Điều 5. Kho
`G.HP9_BATKHASUA` (9) · `G.HP9_LUAT` (8) · `G.HP9_CHOCHU` (2); bộ kiểm
**mục 99**. Không dựng răng nào mới.

### Hai văn bản Hiến pháp KHÔNG mâu thuẫn — chúng ở hai tầng

9.99.88 nêu đây là *"chỗ nặng nhất"* và ngờ kho đang thi hành sai bản.
Đọc đủ Chương II rồi đối chiếu từng điều thì **không phải**:

| | Là gì |
|---|---|
| `BN_HIENPHAP` 13 điều | hiến pháp **VẬN HÀNH AI** — bộ não trả lời thế nào |
| Chín điều này | hiến pháp **TỔ CHỨC** — Học viện được làm gì với gia đình |

Chồng lấn đúng hai chỗ (Điều 13 ẩn danh ↔ điều 8 vòng đỏ; Điều 2 Đứa
trẻ ↔ điều 7 phủ quyết ảnh), và cả hai chỗ nói **cùng một hướng**.

### Bảy điều đã có răng — nhưng không chỗ nào gọi chúng là bất khả sửa

| Điều | Răng đã có |
|---|---|
| 1 không xếp hạng gia đình | `LR1` · `VIP_CAM C1` · `KHONG_XEP_HANG` |
| 2 chấm NHÀ không chấm NGƯỜI | `LR1` · ngăn `TRE` của `VIP_PHAMVI` |
| 3 không tụt cấp | `L02` — cổng ở **chỗ GHI**, trước `INSERT` |
| 4 không hứa kết quả | `QC3 CUM_CAM_KET` · `S5` khai là phép chiếu |
| 7 trẻ phủ quyết ảnh | `L07` — **hai mã** `CHUAHOI` · `CONTUCHOI` |
| 8 vòng đỏ không rời máy | `L04` — nhưng **còn hở**, xem dưới |
| 9 không giữ chân | `L08` · `F2` khai `vaLuat:L08` |

> **Một luật bất khả sửa mà không ai biết nó bất khả sửa thì nó sửa
> được.** Người sửa `L02` sáu tháng nữa đọc chú giải của L02 — *"không
> mã nào giảm cấp hiện tại"* — thấy hợp lý, và **không biết rằng sửa nó
> là lập ra một tổ chức khác**. Chính văn bản gốc viết câu ấy.

Nên bản này **GOM, không chép**. Dựng răng thứ hai cho một điều đã có
răng là bản thứ hai của một **BẢNG CẤM** — bản nguy nhất trong mọi bản
thứ hai (9.99.83). Mục 99 canh rằng `HP9_*` không mọc bảng riêng, và
mọi ô `rangO` trỏ vào **mã có thật**.

### Hai điều chưa có răng — và điều 6 gắt nhất

**Điều 5 · không dùng nỗi sợ của cha mẹ.** Bộ lọc quảng cáo bảy mục
chặn từ tuyệt đối · so sánh · cam kết · số không nguồn — **không mục
nào dò lời doạ**. Khi dựng: thêm `QC8` vào bộ lọc đã có, dấu hiệu là
**cụm nhiều âm tiết** (*"muộn mất rồi"* · *"con nhà người ta"*), không
dò `sợ` trần — nó nằm cả trong chính câu cấm này. Điều này cấm **cả hai
chiều**, và chiều *động viên* dễ lọt hơn: một câu doạ để thúc cha mẹ
giữ nhịp nghe như quan tâm.

**Điều 6 · không lấy tuyến dưới làm nguồn thu.** Kho có `traHoaHong` và
trần 10%, nhưng **không cửa nào canh hình đa cấp**. Cái đo được là **ĐỘ
SÂU**: chỉ trả cho lượt giới thiệu trực tiếp; cửa nào nhận ô `tuyenTren`
/ `capDuoi` là đỏ.

> Điều 6 là điều **DUY NHẤT có động cơ TIỀN đứng sau**. Tám điều kia
> phạm vì vô ý; điều này phạm vì nó **sinh ra tiền** — nên nó cần răng
> chắc nhất, không phải lời dặn.

**Điều 8 còn hở nửa sau.** Răng hôm nay chặn đường **lên máy chủ**;
điều 8 nói **không rời thiết bị**. Đó là `LGD-02`, mở từ 9.99.74 — nay
nó có tên: không phải một việc tồn đọng, mà là **nửa còn thiếu của một
điều bất khả sửa**.

### Sổ chờ

- **HP9-01** — chín điều có vào `TNC_KHONG_CHAM` không. Không vào thì
  một lượt nâng cấp hợp lệ, có chữ ký, sổ đầy đủ, **gỡ được chúng**.
  Thêm một vùng là chủ hệ thu hẹp quyền của chính mình — máy không tự
  làm. Mục **tự đo**: `HP9-02` đóng khi hết `chuaCoMat`.

### Đọc tài liệu Drive: tìm ra đường rẻ

`read_file_content` trả **văn bản thuần** (~0,17 token/byte, nửa giá
base64), và **tệp lớn rơi xuống ĐĨA chứ không vào ngữ cảnh** — 483 KB
`.doc` → 114k ký tự trên đĩa, tốn ~0 token. Máy rút mục lục từ đó.

```
Đọc:  mcp__Google_Drive__read_file_content  →  quá cỡ  →  lưu ra tệp
Rồi:  python3 rút tiêu đề · dò cụm · đối chiếu kho
```

Toàn bộ 4,75 MB ≈ **350k token**, không phải 1,6 triệu. **Đọc được
100%.**

### Bẫy tên gọi thứ TƯ và thứ NĂM, tìm ra ở lượt đọc này

**Thứ tư — hai thang cùng gọi *cấp*:**

| Thang | Đo gì | Tổng |
|---|---|---|
| `BD_CAP` (kho) | **số tối đã ghi** 3→90, đi **xuyên** năm tầng | 10 |
| Đặc tả `1.1→5.10` | **10 cấp trong mỗi tầng**, mỗi cấp 7 ngày | 50 |

`HT_LUAT` đã chốt sẵn cách xử: *"Tài liệu sau đề nghị thang mới thì nó
vào dạng **LỚP SÂU** của năm tầng, không vào dạng thang."*

**Thứ năm — hai bảng luật khác hẳn nghĩa, cùng hình mã.** Nặng nhất:

| mã | Bản đặc tả | Kho |
|---|---|---|
| L1 | Cửa vào thấp tuyệt đối · 0 phí | **L01 Không xếp hạng gia đình** |
| L4 | Không hiển thị bản đồ | **L04 Vòng đỏ không rời máy** |
| L10 | Chạy trên 10 bánh đà cốt lõi | **L10 Ba Ghế Người Giữ** |
| L12 | Đích đến là gia đình | **L12 Đường thoát luôn có** |

Cả hai đều là luật của chủ hệ, **không bên nào sai**. Người dựng sau đọc
*"L4"* trong đặc tả rồi tra kho sẽ hoặc dựng nhầm, hoặc kết luận kho
sai. Phải khai TRƯỚC khi ai dựng.

Ba bộ mã mới chưa có trong kho: **KL01–KL16** (khoá cưỡng chế) ·
**V01–V17** (vắc-xin) · **5 Két K1–K5**. Và ma trận hoá giải rào cản
**R1–R10** — mà kho đã dùng `R01…R15` cho **VAI**, nên đó là bẫy tên
thứ sáu đang chờ.

---

## BẢN ĐỒ HIẾN CHƯƠNG — BỐN TẦNG, KHÔNG GỘP (9.99.91)

Chủ hệ chốt: *"Khớp bảng luật hiến pháp và bản đặc tả sao cho bộ hiến
pháp mạnh nhất."* Kho `G.HC_TANG` (4) · `HC_MA_TRUNG` (4) · `HC_LUAT`
(8) · `HC_CHOCHU` (2); bộ kiểm **mục 100**.

### Kho có BỐN bảng luật nền, không phải hai

| Bậc | Bảng | Áp cho ai |
|---|---|---|
| 1 | `HP9_BATKHASUA` 9 | **Học viện** — được làm gì với gia đình |
| 2 | `BN_HIENPHAP` 13 | **Bộ não** — trả lời thế nào |
| 3 | `LGD_LUAT` L01–L12 | **Sản phẩm** — răng ở máy chủ |
| 4 | `HL_LUAT12` L1–L12 | **Gia đình** — tự áp cho mình |

**KHÔNG GỘP.** Gộp là mất phạm vi — và mất phạm vi thì một luật của
*gia đình* bị đem đi cưỡng chế *lên* gia đình, đúng thứ nó sinh ra để
không làm.

**Tầng 4 cố ý KHÔNG có răng.** Cưỡng chế *"nghĩ tích cực là chọn góc
nhìn"* biến nó thành cái ách, và người ta sẽ **diễn** nó thay vì sống
nó. Mục 100 canh `HL_LUAT12` không mọc ô `rangO`.

### Chỗ khớp thật: ba loại mã trùng, chỉ loại ba máy dò được

| Loại | Ví dụ | Ai phát hiện |
|---|---|---|
| trùng **hình** | `LGD_LUAT.L01` vs `HL_LUAT12.L1` | người khai |
| trùng **mã**, nghĩa khác | `VM_LANRANH.LR1` vs `TV_LANRANH.LR1` | người khai |
| **bản chép** | `HL_VIRUS`/`MD_VIRUS` 18/18 | **máy, mỗi lượt** |

Chữa **không phải đổi mã** — bốn bảng đã chạy, đã in ra màn, đã nằm
trong tài liệu giấy của chủ hệ. Chữa bằng **bắt buộc trỏ `BẢNG.MÃ`**.
Mục 99 nay đòi đúng dạng ấy.

### Phép đo của tôi bắt oan HƠN BỐN TRĂM cặp

Bản đầu dò *"hai bảng chia sẻ ≥3 mã"*. Mã ngắn `C1·T1·N1·L1` là mã
**cục bộ** — `BN_CHET` đánh `C1…C5` và `VIP_CAM` cũng thế, không liên
quan gì nhau.

> Nới ngưỡng lên 5, lên 8 đều **bớt nhiễu chứ không đổi dấu hiệu**. Chỗ
> chữa là **CHỌN LẠI DẤU HIỆU** (9.99.56): cùng mã **VÀ** cùng TÊN.

Với dấu hiệu ấy cả kho ra đúng **hai** cặp — và cặp thứ hai
`HSH_DK6↔HSH_DK` (6 mã, 6 tên khớp) **tôi không biết nó tồn tại**. Đó
là việc phép đo phải làm: tìm thứ người viết không nhớ. Nó chạm thẳng
vào việc vừa làm — `DK16` nằm ở **cả hai bảng**, mà điều 6 trỏ
`HSH_DK6.DK16`.

### Hai điều tôi khai sai ở 9.99.90 — cả hai kho ĐÃ CÓ

| Điều | Tôi khai | Kho gọi nó là |
|---|---|---|
| 5 không dùng nỗi sợ | `chuaCoMat` | `TV_LANRANH.LR1` |
| 6 không lấy tuyến dưới | `chuaCoMat` | `HSH_DK6.DK16` (điều khoản **hợp đồng**) |

Nay **cả chín điều đều có răng**; ba điều khai `conHo` cho nửa còn
thiếu. `HP9-02` tiễn sang `HP9_DACHOT`, mở `HP9-03`.

> **Một mục chờ đóng được bằng cách ĐO LẠI, không chỉ bằng cách làm
> thêm.** Và nếu không có phép đo tự đo thì nó nằm lại mãi trong sổ.

### NĂM lần bắt oan trong ba bản — nay là LUẬT

`9.99.88` chỗ nối bánh đà (quét một phía) · `9.99.88` `napKho()` quên
`data.core.js` · `9.99.90` KL/V/5 Két · `9.99.90` điều 5 · `9.99.90`
điều 6.

> **Quét kho bằng tên của TÀI LIỆU thì chỉ tìm được thứ kho tình cờ đặt
> trùng tên tài liệu.** Kho gọi mọi thứ bằng tên của CHÍNH NÓ — đặc tả
> gọi *"5 Két K1–K5"*, kho gọi `HL_KHOA9`; đặc tả gọi *"V01–V17"*, kho
> gọi `HL_VIRUS`. Phải quét bằng **NGHĨA**, hoặc quét **NGƯỢC** từ kho ra.

---

## GITA STUDIO 365 — TRẦN CỦA HỆ VIDEO (9.99.92)

Theo `🎬 GITA STUDIO 365.doc` — 291.393 ký tự, **19/20 phần** (thiếu
P17). Kho `data.studio.js` (7 kho, tiền tố `ST_`); bộ kiểm **mục 101**.

**Dựng cái trần trước, lần thứ năm.** Lý do riêng ở đây: **video rời
khỏi hệ và không gọi về được.** Một tấm hình sai còn gỡ được ở kênh;
một video đã tải về nằm trên máy người khác.

### Chín phần đã có kho phủ — trỏ, không chép

`P2`→`SCRIPTS` · `P4`→`HT_TANG`+`G.vaiCo` · `P6`→`tam-ra-anh`+`C19` ·
`P10`→`NT_LOC7`+`BN_RAO10` · `P12`→`PLR_*` · `P13`→`SH_*`+`CN_*` ·
`P15`→`TC_BAY7` · `P16`→`TG_UNGPHO` · `P19`→`TAILIEU_SPEC`.

Nặng nhất **P10** và **P16**: dựng bộ dò thứ hai thì hai bảng dấu hiệu
lệch nhau, và **cả hai đều xanh trên hai thứ khác nhau**.

### Hai chỗ va thật

**SV1 · TTS.** Bản đặc tả *fine-tune TTS neural trên Soul Sample Pack*,
hợp đồng ghi quyền rút lại. Va **luật C20** — *"lời đọc và nhạc là tệp
CÓ SẴN, máy chỉ TRỘN chứ không SINH"*.

> C20 dựng ra để một giọng đọc luôn truy được về **một người đã đồng ý
> nói câu ấy**. Giọng tổng hợp nói được câu người ấy chưa từng nói.

Cổng của bản đặc tả nằm ở **giấy**, không ở mã. Mục chờ **ST-01**.

**SV2 · Giọng trẻ 16–18.** Va điều 7. Điều 7 nói *hình ảnh*; giọng nhận
ra người y hệt và đi xa hơn — **một khuôn mặt cắt khỏi video thì hết,
một giọng đã fine-tune thì còn trong mô hình**. Chữ *"vĩnh viễn"* khó
giữ hơn nhiều với giọng. Mục chờ **ST-02**.

### Hai chỗ suýt bắt oan — tài liệu TỰ CẤM

> *"Không xếp hạng cá nhân, không streak, không thông báo dồn dập,
> không tối ưu hoá làm người xem khó rời đi."*

Điều 9 bất khả sửa, viết bằng lời của chính tài liệu. Và *"đường cong
giữ chân theo giây"* là **retention của video** — bẫy tên gọi thứ bảy,
*giữ chân* hai nghĩa trong cùng một tài liệu.

Lớp bắt oan **thứ tư** của kho. Mục 101 **đòi `ST_OAN` có mặt**: nêu
chỗ va mà giấu chỗ hợp thì người đọc tưởng cả bản đặc tả là sai rồi
thôi không đọc — và lúc ấy hai chỗ va thật cũng không ai đọc.

---

## STUDIO P17 — BA THANG CÙNG TÊN, VÀ THANG THỨ BA NẰM TRONG CHÍNH TỆP (9.99.93)

Chủ hệ gửi **PHẦN 17/20 — BẢN ĐỒ PHÁT TRIỂN LỘ TRÌNH STUDIO**
(`GITA-VIDEO-SPEC-PART17-ROADMAP-2026-FULL`, 21.074 ký tự), đúng phần
9.99.92 đếm được là thiếu. Kho `data.lo-trinh-studio.js` (15 kho, tiền
tố `LT_`), bộ kiểm **mục 102**. **Không dựng một cửa máy chủ nào** —
trần trước, xưởng sau, lần thứ sáu.

### Chỗ nguy nhất không phải một luật bị phạm

| Thang | Gõ là gì | Tổng | Chốt ở đâu |
|---|---|---|---|
| Chặng Học viện | `chang` | CH1…CH5 | `HDH_CHANG`, 9.99.71 |
| Giai đoạn Studio | **`giaiDoanST`** | G1…G4 | P17, bản này |
| Tín hiệu tài chính P15 | **chưa đặt** | G1…G4 | chưa · LT-03 |

Thang thứ ba nằm trong **CHÍNH tệp sinh ra thang thứ hai**: bảng Gate B
viết *"ngưỡng G1 tài chính, P15"* và WS-4 viết *"trùng tín hiệu G3 tài
chính"*. Cùng một trang, mã `G3` mang hai nghĩa, và không chỗ nào nói ra.

**Một luật bị phạm thì có người cãi. Hai thang cùng tên thì không ai cãi
— chúng chỉ dần được đọc như một, và không ai quyết định gộp cả.** Bẫy
tên gọi thứ **chín**, sau *tầng* · *tc* · *điểm chạm* · *giữ chân*.

Mục 102 đo **hai đầu độc lập**: `LT_GIAIDOAN` không mang mã `CH*`, và
`HDH_CHANG` không mang mã `G*` — một đầu là lời khai của bản này, đầu
kia là bảng của 9.99.71. Đúng luật 9.99.84.

### Chỗ khớp đẹp nhất chỉ lộ ra khi quét theo NGHĨA

**G4-6 "diễn tập 2 tuần vắng người sáng lập" CHÍNH LÀ `HDH_CHANG.CH3`**
— kho đã viết *"Chất lượng KHÔNG giảm khi chủ hệ vắng hai tuần"* từ
9.99.71. Cùng một phép thử, cùng con số hai tuần, hai tệp không biết
nhau, và **cả hai đều khai `nguoiDo`**.

Quét bằng tên tài liệu thì hai câu ấy không khớp một chữ nào — đúng luật
9.99.91.

Năm trong tám quy tắc cổng đã có răng dưới tên khác, nên phần này **TRỎ
nhiều hơn nó dựng**:

| P17 | Trỏ vào |
|---|---|
| RM-1 cổng cứng, máy không tự chuyển | `HDH_CHANG_LUAT.mayNoiDuChuKhongChuyen` |
| RM-5 hai chữ ký | `HDH_QUYET5.B5` |
| RM-6 trượt gate không phạt ai | `TC_LUONG.L-02` |
| RM-7 không nhảy gate | `HDH_CHANG_LUAT.khongNhayCoc` |
| RM-8 biên bản không sửa được | `TNC_KHONG_CHAM.K6` |
| PL-2 "điều nhỏ nào người xem nhận được" | `TG_DIEUNHO.DN2` |
| PL-3 cấm chuỗi ngày · bảng xếp hạng | `VIP_CAM.C1` · `LGD_LUAT.L08` |

Dựng chuỗi băm thứ hai cho biên bản gate là **hai sổ cùng xưng là không
sửa được, mà chỉ một trong hai được canh** — và người đọc không biết
mình đang đọc sổ nào.

### Ngưỡng khác chỉ tiêu ở chỗ HỎNG THÌ AI CHỊU

Chỗ va `LV2`: WS-2 và bảng Gate B đều đặt *"CTA done ≥ 4%"*. Kho đã chốt
ở 9.99.86 rằng wow **đếm để BIẾT, không đặt đích**
(`SUP_WOW_LUAT.camDatChiTieu` · `SUP_FAN_LUAT.chiTieuVanCam`).

Một dấu hiệu có ngưỡng và một chỉ tiêu **nhìn giống hệt nhau**. Khác
nhau ở hệ quả: dấu hiệu đỏ thì **PHANH** quy mô (PL-5, đúng chiều); chỉ
tiêu không đạt thì có người phải làm cho nó đạt — và cách rẻ nhất để một
tỷ lệ làm điều nhỏ đi lên là **hạ điều nhỏ xuống cho dễ làm**.

P17 tự đặt nó ở ngăn dấu hiệu, không ở ngăn chỉ tiêu. Chỗ phải chốt là
nó có được mang sang bảng Gate không — vì ở đó nó thành một cái đích.
Mục chờ **LT-01**.

Chỗ va còn lại `LV1`: mã tham chiếu viết bằng TypeScript + Postgres
(`import { Pool } from 'pg'` · `BIGSERIAL` · `TIMESTAMPTZ`). Nền đã chốt
ở 9.99.62. Nó nguy **chính vì nó là mã tham chiếu**: người dựng sau thấy
mã chạy được rồi chép sang, mà D1 không có ba thứ ấy.

### Thứ thật sự MỚI, và thứ đáng giá nhất là quyền nói "K"

Bốn thứ kho chưa có: **sổ nợ kỹ thuật** · **thẻ đau** · **quyền nói
"K"** · **bằng chứng = dữ liệu thật + ĐÚNG MỘT câu chuyện thật**.

PL-4 cho mỗi trưởng giữ nhịp quyền dừng một tính năng **dù chỉ số đẹp**,
ba lần dự trữ mỗi quý, không cần giải trình dài. Mọi cổng của kho chặn
thứ **đo ra là sai**. Không cổng nào chặn được thứ **đo ra là đúng mà
người trong nghề thấy sai** — và đó đúng là chỗ một hệ nguội đi.

*"Không cần giải trình dài"* là phần dễ bị gỡ nhất: bắt viết một trang
thì quyền ấy không ai dùng, và **một quyền không ai dùng thì nó không
tồn tại**.

RM-3 không mâu thuẫn với luật *không gộp cột đo được với cột lời khai*
(9.99.59): kho cấm **TRỘN** hai loại vào một con số; RM-3 đòi **hai ngăn
riêng cùng có mặt**. Chữ *"ĐÚNG MỘT"* là cái răng — cho nhiều chuyện thì
người ta gom một tập chuyện đẹp, và một tập chuyện đẹp đọc ra như dữ liệu.

### Phép đo về thứ không được tồn tại — lần thứ MƯỜI HAI

Chừng nào **LT-02** còn trong sổ chờ thì `may-chu/` không được có cửa
xuất ra tên `quaGate` · `chotGate` · `vayNo` · `ghiNoKyThuat` ·
`moTheDau`, và `csdl.sql` không được có bảng `noKyThuat` / `theDau`.
Quét **danh sách hàm xuất ra**, không dò chữ trong câu văn (9.99.60 ·
9.99.86); cụm nhiều âm tiết, không dò `gate` hay `no` trần.

Cổng dựng SAU một cái cửa đã chạy thì nó chỉ là một lời nhắc. Phép canh
này **tự nhường chỗ** khi LT-02 đóng.

### Phép đo bắt lỗi của chính người viết nó, ngay lượt chạy đầu

RM-5 trỏ `'HDH_QUYET5 năm bước quyết định lớn'` — **tên bảng trần, không
kèm mã**. Luật trỏ-kèm-tên-bảng (9.99.91) sinh ra để chặn mã trần; đây
là vế NGƯỢC LẠI, bảng trần, và nó cũng lọt qua mắt người viết y hệt.
`soiTro()` nay đòi đủ cặp `BẢNG.MÃ`.

Bộ dò nhận **hai hình** — `BẢNG.MÃ` (một dòng có ô `ma`) và `BẢNG.ô` (một
ô của vật thường) — vì luật kho sống ở cả hai chỗ: `HDH_CHANG.CH3` là một
dòng, `HDH_CHANG_LUAT.khongNhayCoc` là một ô. **Đòi đúng một hình là nới
ba chỗ đang trỏ đúng ra cho vừa một phép đo.**

### Chỗ P17 va vào chính nó, và chỗ nó đồng ý với kho

Năm chỗ hợp khai cùng năm chỗ va — nêu chỗ va mà giấu chỗ hợp thì người
đọc tưởng cả bản đặc tả là sai rồi thôi không đọc.

### Sổ chờ

- **LT-01** — ngưỡng *"tỷ lệ làm điều nhỏ"* là DẤU HIỆU hay ĐIỀU KIỆN
  QUA CỔNG. Gỡ khỏi bảng Gate là làm yếu một cổng; giữ là mở một chỉ
  tiêu. Cả hai đều có giá.
- **LT-02** — sổ nợ kỹ thuật và thẻ đau dựng cho CẢ HỌC VIỆN hay chỉ
  Studio. Một nghĩa vụ ghi chép không ai làm thì nó làm hỏng cả sổ.
- **LT-03** — tiền tố cho thang tín hiệu tài chính G1–G4 của P15. Nói
  TRƯỚC khi P15 được dựng, vì sau đó mỗi bên đã có một bản chép của cái
  tên.

---

## XƯỞNG DỰNG VIDEO — MỘT DÒNG REGEX MANG HAI BẪY (9.99.94)

Chủ hệ gửi một bản mẫu HTML **chạy được**: kịch bản sinh tại chỗ, canvas
1080p, giọng ghi bằng micro, video xuất bằng `MediaRecorder`. Đây là
**P9 — màn chính của bộ đặc tả Studio**, thứ `ST_PHAN` khai `chuaCo` từ
9.99.92.

Kho `data.studio-xuong.js` (9 kho, tiền tố `XU_`), màn `src/studio.js`,
máy chủ `may-chu/studio.js`, bộ kiểm **mục 103**.

### Bản mẫu ĐÚNG nhiều hơn sai, và chỗ đúng nhất là chỗ không ai để ý

**Giọng lấy từ micro người thật hoặc tệp có sẵn — không một dòng TTS
nào.** Bản mẫu tự giữ nguyên luật C20 mà không cần ai nhắc: nó **trả lời
ST-01 bằng cách không cần hỏi**. Chú thích của chính nó viết *"Giọng
người thật hợp chất ấm GITA hơn máy đọc."*

Bảy chỗ đúng khai ở `XU_HOP`, và khai là **bắt buộc**: nêu chín lỗi mà
giấu bảy chỗ đúng thì người đọc bỏ cả bản mẫu đi làm lại từ đầu, và bảy
chỗ ấy mất theo.

### Lỗi nặng nhất là một dòng, và nó mang HAI bẫy chồng lên nhau

```
/\b(lười|dốt|kém cỏi|hư|bất tài|vô dụng|ngu)\b/i

\bhư\b   → IM LẶNG trên "Con hư quá"        bẫy dò chữ #1 của kho
\bngu\b  → KHỚP "nguồn tri thức KS-04"      bắt oan chính ô Nguồn của form
```

Chạy thật bằng `node` để xác nhận, không đọc mã đoán. `\bhư\b` không bao
giờ khớp vì "ư" nằm ngoài lớp `\w`; `\bngu\b` khớp vào `ngu|ồn` vì "ồ"
cũng không phải `\w` nên giữa hai chữ **CÓ** biên.

> **Một bộ dò vừa CÂM ở chỗ phải bắt vừa BẮT OAN ở chỗ lành.** Chỗ bắt
> oan lộ ra ngay lượt đầu nên người dùng tắt đèn đi — và lúc tắt, chỗ
> câm đi theo mà không ai biết.

Ba lỗi nặng còn lại: bộ dò thứ hai (`ST_PHAN` phần 10 đã dặn từ 9.99.92
*"gọi thẳng chúng, KHÔNG dựng bộ dò thứ hai"*); `fetch` thẳng
`api.anthropic.com` **từ trình duyệt** — không khoá thì luôn hỏng, có
khoá thì lộ khoá, và chuỗi mang chủ đề · người xem · điều nhỏ của một
gia đình đi ra **không qua cổng ẩn danh** của 9.99.62; năm nút tải về
**không một cổng vai nào**.

### Bộ kiểm chứng minh KIẾN TRÚC của tôi sai, không phải một dòng mã

Dựng xong lượt đầu thì mục **8** và mục **18** đỏ: `src/` không được có
`a.download`, không được có đường tạo địa chỉ blob, không được có
`showSaveFilePicker`. Đó là luật của chủ hệ — *khách hàng không tải bất
cứ dữ liệu nào* — và nó canh **cứng, không theo vai**.

Nới nó là bỏ hẳn phép canh. Câu trả lời đúng nằm sẵn trong kho:
**`tools/dung-phim.js` mới là chỗ xuất tệp** — nó chạy ngoài trình
duyệt, có ffmpeg, và có luật **C19** buộc dựng từ tấm ĐÃ PHÁT HÀNH.

Nên xưởng web làm phần nó làm tốt — viết kịch bản, xem thử đúng khổ,
soát đèn — rồi **đề bài đi qua MÁY CHỦ** sang bộ dựng.

> **Đề bài đi qua cửa thì nó vào nhật ký. Một tệp tải về thì không.**

Kéo theo hai chỗ phải làm lại: ảnh vào canvas bằng `createImageBitmap`
chứ không qua một địa chỉ blob; tệp phim **nói thẳng là không nhận**
thay vì lặng lẽ bỏ qua — một tệp bị bỏ qua trong im lặng thì người dùng
tưởng mình đã gắn được.

### Lần thứ NĂM của luật 9.99.78, và lần này nó bắt oan lời cảnh báo

Sau khi gỡ sạch đường tải, mục 8 và 18 **vẫn đỏ** — vì `src/studio.js`
có ba dòng **chú giải cảnh báo** về đúng cái bẫy chúng canh. Hai phép đo
ấy dựng trước luật 9.99.78 nên chưa bao giờ bỏ chú giải.

Cách sửa dễ nhất — xoá lời cảnh báo đi — là cách sai nhất. Nay cả hai
gọi `boChuMa` trước khi dò. Lần thứ năm sau mục 89 · 91 · 93 · 94.

### Mục 103 — sáu vế, và vế B là phép đo về thứ không được tồn tại

Lần thứ **mười ba** trong bộ. `src/studio.js` và `may-chu/studio.js`
không được khai một bảng dấu hiệu nào (`WAF` · `SENSITIVE` · `TU_CAM`…),
**không được có cửa sinh giọng** (`sinhGiong` · `taoGiong` · `ttsGiong`
…, hỏi danh sách hàm xuất ra chứ không dò chữ), và màn không được gọi
thẳng một địa chỉ ngoài.

Vế F đo **hai đầu độc lập** (luật 9.99.84): cửa `ghiHoChieuVideo` phải
có trong danh sách cửa THẬT của `worker.js`, và cổng vai phải nằm
**trước** khi dựng vật hộ chiếu — cùng lối *cổng trước INSERT* của mục
86 · 87 · 91 · 93.

Vế E cũng hai đầu: `ST_PHAN` phần 9 phải thôi khai `chuaCo`, và đầu kia
là sự có mặt thật của `XU_*` trong kho.

### Hai chỗ tự khai là bản thứ hai, thay vì giấu

`laNguoiNha` nay có **hai** bản chép — `tu-nang-cap.js` và `studio.js`.
Chính chú giải bản đầu (9.99.77) đã viết *"năm bản chép là năm chỗ để
một bản trôi đi"*. Gom được thì phải dựng một mô-đun chung cho phép soi
vai, và đó là một lượt sửa đụng mọi tệp máy chủ có cổng — cần bộ phá thử
riêng cho từng cửa, vì nới nhầm một bậc là mở một cổng. Nên nó là **mục
chờ XU-04**, và mục 103 đếm bản chép thật trên đĩa để canh.

Và CSS chèn nhầm **sau** khối `@media` khổ chạm — luật kho nói khối ấy
phải nằm CUỐI. Sửa ngay trong lượt, không để lại.

### Sổ chờ

- **XU-01** — xưởng có theo C19 (chỉ dựng từ tấm ĐÃ PHÁT HÀNH) không.
  Buộc thì xưởng mất công dụng nhanh; không buộc thì có hai đường dựng
  phim, một có cổng một không, và đường không cổng dễ dùng hơn.
- **XU-02** — nhờ máy viết nháp: mở qua cửa máy chủ có cổng ẩn danh, hay
  không mở.
- **XU-03** — ai ký đèn D8 chất ấm, và ký bao lâu một lần. Người ký
  không được là người dựng.
- **XU-04** — gom `laNguoiNha` về một chỗ.

---

## CỨU HỆ — PHÁ KÍNH KHI SUPER ADMIN BỊ CHIẾM (9.99.95)

Theo tình huống 3 của chủ hệ: máy Super Admin dính virus, hacker chiếm
tài khoản R01, **đổi mật khẩu**, phá hệ. Bộ não phát hiện nhưng chỉ gửi
được một thứ ra ngoài — email tới địa chỉ cứu hệ. Module
`may-chu/cuu-he.js`, kho `data.cuu-he.js` (5 kho `CUU_`), bảng `cuuHe`,
bộ kiểm **mục 104**.

### Ba yếu tố hacker không có CÙNG LÚC

Máy dính virus, nên **mật khẩu cũ có thể chính là thứ đã rò** — nó một
mình không chiếm lại được hệ (nếu đủ thì hacker cũng đủ). Nên:

| Yếu tố | Ở đâu | Hacker có |
|---|---|---|
| Khoá cứu hệ | `GITA_KHOA_CUU` — secret Worker, **offline** | KHÔNG — không nằm CSDL |
| Token một lần | qua **email cứu hệ** (khác email tài khoản) | KHÔNG — không đọc được email ấy |
| Mật khẩu cũ | Super Admin còn nhớ | CÓ THỂ — nên chỉ là yếu tố **xác nhận**, được GHI LẠI chứ không CHẶN |

### "Tổng tấn công" là phản công TRONG CHÍNH NHÀ MÌNH

GITA **không** tấn công máy/hệ của hacker — truy cập trái phép bên thứ
ba là phạm pháp, ngoài quyền Học viện. Phản công đúng nghĩa: **đá sạch
mọi phiên** (văng luôn phiên hacker), **đóng băng mọi cửa ghi**, khoá
tài khoản, truy hồi. Token hacker bị huỷ, hệ không cho ghi — nó mất
quyền ngay cả khi giữ mật khẩu mới.

### Bốn chỗ kiến trúc, mỗi chỗ một luật

1. **Cửa cứu hệ đứng TRƯỚC cổng phiên** — hacker giữ mọi phiên; Super
   Admin thật không có phiên nào. Xác thực bằng ba yếu tố offline, không
   bằng token đăng nhập. Cùng lối cửa ngân hàng (`nganHangBao`).
2. **Đóng băng MẶC-ĐỊNH-TỪ-CHỐI** — khi băng, worker chặn MỌI cửa trừ
   `AN_TOAN_KHI_BANG` (đọc + cứu hệ + đổi mật khẩu). Khoá nhiều hơn thì
   an toàn hơn khoá ít.
3. **Khoá cứu hệ KHÔNG nằm CSDL** — bảng `cuuHe` không có cột giữ bí
   mật. Một dump CSDL bị lộ không kéo theo nó (cùng luật `GITA_KHOA_KHO`).
4. **Khôi phục DỮ LIỆU là bước tay** — cửa truy hồi chiếm lại QUYỀN
   (mật khẩu + phiên + mở băng); khôi phục dữ liệu chạy tay
   `node tools/khoi-phuc-kho.js`. Máy KHÔNG giả vờ đã làm.

### Ba lỗi của chính tôi, phá thử và mục 104 bắt

1. **Phép đo dò trên bản BỎ CHUỖI, mà tên cửa là chuỗi.** `boChuMa` bỏ
   cả chuỗi, nên `fn === 'baoDongCuuHe'` biến mất → mục 104 báo "cửa
   đứng sau cổng phiên" oan. Sửa: worker dò trên bản **bỏ chú giải, GIỮ
   chuỗi** — cùng ngoại lệ 9.99.85 (dò câu lệnh trong chuỗi thì chỉ bỏ
   chú giải). Lần thứ sáu của lớp lỗi 9.99.78, lần này NGƯỢC.
2. **Tiền tố `CH_` đã bị chiếm.** `data.chuyen-cam-hung.js` dùng
   `CH_MACH`, `CH_CAP`. Mục 104 `mocBang` bắt ngay — đúng việc nó sinh
   ra: tìm bảng tôi không biết đã tồn tại. Đổi hết sang `CUU_` (9.99.67:
   chọn tiền tố TRƯỚC khi viết).
3. **`sed s/CH_LUAT/CUU_LUAT/g` nuốt chuỗi con.** `RSP_LE`**`CH_LUAT`**
   → `RSP_LECUU_LUAT`, làm một kho không liên quan **biến mất** khỏi
   đăng ký. Mục 45 bắt ngay. Bài học: thay chuỗi hàng loạt phải neo
   biên, không thay chuỗi con trần.

### Sim đầy đủ: 12/12, và một sim-bug đáng giữ

Diễn tập trọn vòng (hacker chiếm → báo động → hacker chống cự thiếu yếu
tố → đóng băng → truy hồi → Super Admin vào lại) đạt 12/12. Sim đầu đỏ
vì mật khẩu thử chứa "Admin/Super" bị `mkQuaDeDoan` từ chối — **một
protection thật**: guard mật khẩu yếu áp cả trong lúc cứu hệ.

### Sổ chờ

- **CH-01** — nạp ba secret: `GITA_KHOA_CUU` · `GITA_MAIL_CUU` (khác
  email tài khoản) · `GITA_KHOA_THU`. Việc bấm tay của chủ hệ.
- **CH-02** — ngưỡng `soatBatThuong` (nay: 1 đổi mật khẩu + ≥2 việc phá
  trong 15 phút). Cân báo-nhầm với bỏ-sót là quyết định vận hành.

### Hai chỗ xưởng video 9.99.94 chưa được đo, phát hiện lúc phát hành

Cả hai đều là lớp lỗi tệp này đã ghi, và cả hai chỉ lộ ra khi chạy đủ
bộ kiểm — không phải khi đọc mã.

1. **`do-khung-man` đo NHÃN, không đo ô.** Nó bắt ba "nút" dưới 32px ở
   màn studio, và tôi đoán ngay đó là thanh kéo tua. Đo thẳng thì ô nhập
   TỰ NÓ đã cao 34px — cái 20px là cái `<label>` BARE bọc quanh nó. Nhãn
   studio `display:inline` nên hộp nhãn chỉ cao bằng dòng chữ, còn ô
   inline-block bên trong không kéo hộp lên. Các màn khác thoát vì nhãn
   mang lớp (`label.row` · `label.dk-dy`) khối `pointer:coarse` đã nâng
   sẵn; nhãn studio không mang lớp nào. Chữa ở NHÃN (`.man-xu label`
   flex + min-height:34), không chỉ ở ô — **nhãn LÀ vùng chạm**, đúng
   bài học 9.99.51 "đo VÙNG CHẠM chứ không đo cái ô vuông". Nới đúng
   trong `.man-xu`, không nới `input`/`label` toàn cục.
   > **Một dòng đỏ của `do-khung-man` nói KÍCH THƯỚC, không nói THẺ NÀO.
   > Đoán thẻ từ kích thước là đoán — phải in ra thẻ thật rồi mới sửa.**
   Lần này tôi đoán "thanh kéo tua" và sửa nhầm hai lượt (min-height rồi
   height cho range) trước khi in ra thẻ và thấy đó là `<label>`.

2. **`G.toast` không tồn tại — hàm thật là `U.toast(msg,kind)`.** Xưởng
   video gọi `G.toast && G.toast(...)` ở chín chỗ; cái `&&` làm nó câm
   lặng không nổ, nhưng người dùng cũng không bao giờ thấy một lời báo
   nào. `ra-soat` mục 5 (hàm được canh phải có thật) bắt đúng chỗ ấy —
   một cửa canh trước khi gọi một hàm KHÔNG CÓ là một cửa không bao giờ
   mở. Nay cả chín chỗ gọi `U.toast(..., 'ok'|'err')`.

---

## VÒNG TỰ HOÀN THIỆN — LẤP KHO CÓ CẤP PHÉP (9.99.96)

Theo tình huống 5 của chủ hệ: một khách coach khó tính dò hệ, nhập dữ
liệu giả, hỏi ngoài kịch bản, đòi vượt cấp không trả phí — và giữa lúc
tư vấn, **một số kho rỗng**. Bộ não phát hiện, soạn chuỗi giải pháp từ
dữ liệu đã có, nhưng 入库 (đưa vào kho phục vụ khách) phải qua Bộ phận
sản phẩm → Giám đốc → Super Admin.

Màn **Vòng tự hoàn thiện** (`src/tu-hoan-thien.js`, bốn ngăn), máy chủ
`may-chu/tu-hoan-thien.js`, kho `data.tu-hoan-thien.js` (5 kho `THT_`),
bảng `phatSinh` · `banNhapKho` · `duyetNhap`, bộ kiểm **mục 105**, mười
ba phép đo ở `thu-worker.js`.

### Máy SOẠN, người DUYỆT — hai cửa tách hẳn

Lần thứ tư thứ tự "dựng cổng trước cửa" được chọn (sau Hiến pháp 9.99.62,
trần giám sát 9.99.76, vòng tự nâng cấp 9.99.77): một hệ tự hoàn thiện
mà tự đưa nội dung ra phục vụ khách không cần ai duyệt là một hệ tự mở
rộng phạm vi của chính nó.

- `soanBanNhap` ghi vào **staging** (`banNhapKho` trạng thái `nhap`),
  KHÔNG một câu INSERT nào vào kho phục vụ khách — mục 105 đọc thân hàm.
- `nhapKho` là **cái răng**: cổng đủ-ba-chữ-ký đứng **TRƯỚC** câu
  `UPDATE ... trangThai='daNhap'`. Đủ hay chưa **tính lúc đọc** từ sổ
  `duyetNhap`, không cột "đãDuyệt" (cùng luật cột `conHan` 9.99.63, cột
  `den` 9.99.66, cột đã-qua-mấy-cửa 9.99.77).

### Ba cấp, ba vai, ba người khác nhau

`sanPham`=R04 · `giamDoc`=R03 · `superAdmin`=R01. Ba vai khác nhau →
ba người khác nhau một cách tự nhiên; cộng luật người-duyệt-khác-người-
soạn thì cả chuỗi duyệt không bao giờ là một người (cùng L3 9.99.42,
vai C khác vai A 9.99.72, người ký khác người đề xuất 9.99.77).

### Bốn chỗ tình huống 5 chạm, và câu trả lời của kho

- **Vượt cấp không phí** → K1: lộ trình là cái được trả phí; chê "chưa
  đáng trả phí" là một phản hồi để ghi (`phanHoiXau`), không phải lý do
  mở cổng.
- **Dữ liệu khách khai giả** → K2: đo HÀNH VI, không biến lời khai
  thành kết luận.
- **Tự 入库 cho khách khỏi chờ** → K3: chính là cả tình huống 5. Sự
  chậm là giá của việc chốt đúng, và được **NÓI RA**, không giấu.
- **Câu ngoài kịch bản** → K4 và luật `khoRongNoiThat`: không có thì
  nói không có, `soanBanNhap` bắt buộc DẪN NGUỒN (không bịa).

### Nháp KHÔNG phục vụ khách — ranh giới ở CÂU TRUY VẤN

`traBoSung` chỉ trả `WHERE trangThai='daNhap'`. Lọc trên màn KHÔNG phải
bảo vệ dữ liệu (luật đã cắn ba lần). Bộ thử worker chứng minh: bản nháp
chưa duyệt KHÔNG lọt vào `traBoSung`, bản đã 入库 thì có.

### Phép đo về thứ không được tồn tại — lần thứ MƯỜI BỐN

`banNhapKho` không cột "đãDuyệt"; `soanBanNhap` không INSERT vào kho
phục vụ khách. Phá thử ba nhánh: dời gate xuống sau UPDATE → đỏ "GATE
入库 KHÔNG ĐỨNG TRƯỚC UPDATE"; thêm cột `daDuyet` → đỏ "CÓ CỘT đãDuyệt";
đổi vai `giamDoc` trong kho → đỏ "THT_CAP LỆCH bản chép máy chủ".

### Mục 11 đo lại cả bảng đích một lượt (lần thứ hai, sau 9.99.64)

Màn mới (`nghe_chung`) đẩy mẫu số 200→201; chỉ R13 vượt dung sai, nhưng
sửa mỗi số vừa kêu là để những số kia nằm sát mép rồi cùng vỡ về sau.
Đã kiểm cách đếm (vai có nghe_chung tử số +1; R13·R14·R15 đứng yên) rồi
đặt cả bảng về đúng giữa dung sai. Dung sai ±2 giữ nguyên.

### Sổ chờ

- **THT-01** — vai R04 có đúng là "Bộ phận sản phẩm" không, hay cần một
  trục riêng (giống trục quyền tài chính vuông góc với thang vai).
- **THT-02** — trợ lý tư vấn gọi `traBoSung` khi gặp kho rỗng khi nào
  (nối nội dung vừa duyệt phục vụ ngay, không chờ lượt phát hành sau).

---

## HỆ QUY TRÌNH TỔNG THỂ — HAI CHUỖI CẤP PHÉP (9.99.97)

Theo tình huống 6 của chủ hệ: một gia đình **không có điểm trùng khớp**
giữa phản hồi phụ huynh và con, con hợp tác vỏ ngoài, phụ huynh bận và
chọn gói tự-thực-hiện mà không hiểu cách làm, đòi coach ngoài gói,
**minh chứng gửi lên đều = 0** (phụ huynh không rành công nghệ), đánh
giá 21/90 ngày là 1 sao. Bộ não chỉ đạo các trợ lý cùng nghiên cứu
**cẩm nang gỡ ca**, trình **Bộ phận Coach cao nhất → Giám đốc → Super
Admin**. Chủ hệ đòi một **hệ quy trình tổng thể** cho mọi ca tương tự.

### Tổng quát hoá, KHÔNG dựng cái răng thứ hai

Tình huống 5 (9.99.96) đã dựng cổng gated 入库. Tình huống 6 là **cùng
kiến trúc, chuỗi khác**. Nên `may-chu/tu-hoan-thien.js` đổi từ MỘT bảng
`CAP` thành **registry `CHUOI`** hai chuỗi:

- `kho` — lấp kho rỗng: Sản phẩm(R04) → Giám đốc(R03) → Super Admin(R01)
- `camNang` — cẩm nang gỡ ca: Coach cao nhất(R05) → Giám đốc(R03) → Super Admin(R01)

Mỗi bản nháp mang `loaiDuyet`; `duyetCap` và `nhapKho` đọc **CHÍNH chuỗi
của bản nháp ấy**. Thêm một chuỗi mới KHÔNG dựng lại cổng — cùng một cái
răng, nhiều chuỗi. Bộ thử worker chạy trọn CẢ HAI chuỗi (mục 19–20).

### Hai kho riêng, không đổi hình kho đã phát hành

`THT_CAP` đã phát hành ở 9.99.96. Đổi nó thành một object là **mục 45
báo "kho biến mất"** — một kho vừa phát hành xong không đổi tên/đổi hình
được. Nên chuỗi cẩm nang là kho **MỚI** `THT_CAMNANG` (thêm mới, mục 45
im). Bài học: registry ở MÁY CHỦ (const `CHUOI`) tự do đổi hình; KHO
(G.THT_*) thì bị mục 45 canh, nên giữ ổn định và thêm mới thay vì đổi.

### Ba luật riêng của ca gia đình kẹt

- **`minhChungKhong`**: minh chứng = 0 KHÔNG đọc ra là thất bại. Phụ
  huynh không rành công nghệ nên không gửi được — trống KHÁC số 0 (luật
  phễu 9.99.59). Không chốt 1-sao thành "khách sai" (K5); mở cẩm nang +
  đường ghi minh chứng dễ hơn.
- **`ngoaiGoiKhongChoKhong`**: đòi coach ngoài gói tự-thực-hiện → giữ
  ranh giới gói (không cho MIỄN PHÍ — cho không thì cả thang gói thành
  hình thức) NHƯNG không bỏ mặc: cẩm nang tự làm rõ hơn + đường nâng gói
  nói thẳng (K6). Từ chối cụt là một người mang cảm giác xấu đi kể lại.

### Phá thử + mục 105

Mục 105 nay canh HAI chuỗi (soChuoi===2), năm loại phát sinh, chín luật.
Phá thử: đổi vai `coachCao` trong kho R05→R06 → đỏ "THT_CHUOI LỆCH bản
chép máy chủ (2 chuỗi)". Gate-trước-UPDATE, không-cột-đãDuyệt, soạn-chỉ-
vào-staging vẫn canh như 9.99.96.

### Sổ chờ

- **THT-03** — vai R05 có đúng là "Bộ phận Coach cao nhất" không, hay
  Học viện có một cấp coach cao hơn / một hội đồng coach riêng.

---

## ỨNG PHÓ VẬN HÀNH · PHÁP LÝ — CHUỖI THỨ BA (9.99.98)

Theo tình huống 7: uy tín GITA lên nhanh, khách đổ bộ; **đối thủ chơi
xấu** (báo spam group, dựng bản sao giả, hạ giá hạ bệ, xâm nhập group
cướp khách), **quá tải/nghẽn**, **gửi nhầm-sai-thiếu** do không theo sát
cá nhân hoá. Chủ hệ nhấn: xử lý triệt để **KHÔNG để lại hậu quả pháp
lý**, lấy lại uy tín cao nhất.

### Chuỗi thứ ba trên cùng một cái răng

Thêm chuỗi `ungPho` vào registry `CHUOI`: **Ban vận hành(R02) → Giám
đốc(R03) → Super Admin(R01)**. Ba loại phát sinh mới (`doiThuChoiXau` ·
`quaTai` · `guiNhamSai`). Kho MỚI `THT_UNGPHO` (chuỗi) + `THT_RB` (năm
cẩm nang ứng phó viết trước) — không đổi hình kho đã phát hành.

### Bốn luật giữ cho ứng phó KHÔNG tạo hậu quả pháp lý

- **`khongPhanCongTraiPhap`**: mọi ứng phó CHỈ qua kênh HỢP PHÁP (kháng
  nghị nền tảng, báo nhãn hiệu). KHÔNG báo spam ngược, KHÔNG hack lại,
  KHÔNG bôi nhọ — cùng luật phản-công-trong-nhà (cứu hệ 9.99.95).
- **`suCoNoiThat`**: quá tải/gửi sai thì NÓI THẬT và SỬA, không giấu —
  giấu một sự cố có thật là chỗ dễ thành hậu quả pháp lý.
- **`khongHaGiaChay`**: đối thủ hạ giá → không đua phá khung; giá là Vùng
  Đỏ, đổi qua bang-gia có cấp phép (9.99.73).
- **`giuUyTinKhongNoiXau`**: không nói xấu đối thủ (cùng QC so sánh
  9.99.65) — lấy lại uy tín bằng việc mình làm đúng.

### Năm cẩm nang viết trước (THT_RB)

RB-01 spam group · RB-02 bản sao giả · RB-03 xâm nhập group · RB-04 quá
tải · RB-05 gửi nhầm. Mỗi tờ khuôn TG_UNGPHO (9.99.59): bước LÀM ĐƯỢC,
ai, trong bao lâu, **và một ô KHÔNG LÀM** (phản ứng trái phép phải tránh).
RB-05 nhắc L10: máy KHÔNG soạn thư xin lỗi cá nhân, xin lỗi dịch vụ ngắn
thì được.

### Mục 105 + phá thử

Mục 105 nay canh BA chuỗi (soChuoi===3), tám loại, mười ba luật, năm cẩm
nang RB đủ ô. Phá thử: bỏ `khongLam` của RB-01 → đỏ "CẨM NANG ỨNG PHÓ
thiếu bước/ai/giờ/khôngLàm: RB-01". Mục 21 thu-worker chạy trọn chuỗi
ungPho (sai vai chặn, đủ ba chữ ký → áp dụng).

---

## BA CA LẠM DỤNG — GIÁM SÁT VÀ GIỮ RANH GIỚI (9.99.99)

Gộp ba tình huống cùng khung (phát sinh + luật + phát hiện), giải pháp
dùng lại chuỗi cấp phép đã có — trỏ, không dựng chuỗi thứ tư thừa:

- **TH8 `nhanSuNgoaiLuong`** — coach/tư vấn liên hệ riêng thu phí ngoài
  luồng, tạo phản hồi xấu, thông đồng khách. Luật `nhanSuTrongLuong`:
  mọi lượt chạm QUA HỆ (ghiCham), liên hệ riêng đã có phạt 50% KPI ba
  tháng; thông đồng cần hai người xác nhận (cổng chung-cu, tình huống 4).
  TRỎ giám sát (9.99.76), không dựng bộ dò thứ hai.
- **TH9 `doiVuotQuyen`** — khách đòi ảnh/nội dung cả năm tầng vượt
  tầng+KPI, doạ huỷ gói. Luật `doaHuyKhongMoQuyen`: doạ huỷ KHÔNG mở
  quyền vượt tầng; nội dung theo tầng+KPI+trần 30% (TRAN_KHACH), ảnh con
  theo Điều 13 — bảo mật KHÔNG đánh đổi lấy một khách. Nói đường hợp lệ,
  tôn trọng quyền huỷ.
- **TH10 `chiaSeTaiKhoan`** — một tài khoản nhiều người. Kho mới
  **`THT_GIAMSAT` (mười cách)** + `THT_GIAMSAT_LUAT`: G01–G08 máy đo
  (phiên đồng thời, thiết bị, nhảy địa lý, dùng 24/7, vân tay, tốc độ,
  chồng lấn, vượt trần), G09–G10 người soi. Ba luật: **tổng hợp nhiều
  dấu hiệu, không một cái tự kết luận** (nhà chung máy là bình thường);
  **không khoá tự động** (bắt oan khách trả tiền đắt hơn bỏ sót — máy
  báo động, người quyết, cùng K2 cứu hệ); **có trần, không rình**
  (9.99.76). Hoá giải: nhắc điều khoản + mở đường mua thêm chỗ.

### Mục 105 + phá thử

Mục 105 canh mười một loại, mười lăm luật, **mười cách giám sát** (soGS≥10,
mỗi cách khai mayDo/nguoiDo), ba luật giám sát. Phá thử: bỏ ô của G10 →
đỏ "CÁCH GIÁM SÁT thiếu cách/đo/loại". Mục 22 thu-worker: ba loại mới
được nhận, loại lạ vẫn chặn (danh sách trắng).

Kết: khung tự-hoàn-thiện nay phủ **mười tình huống chủ hệ** (5–10) trên
một cái răng — ba chuỗi cấp phép, mười một loại phát sinh, năm cẩm nang
ứng phó, mười cách giám sát.

---

## QUYỀN NĂNG AI — SUPER ADMIN CẤP (9.99.100)

Theo yêu cầu chủ hệ: Super Admin là quyền cao nhất, cấp quyền cho vị
trí, cho tài khoản khách theo gói, **và cấp cho AI quyền xử lý công
việc**. Bản này dựng lớp cấp quyền + **mười chức năng AI**.

Màn **Quyền năng AI** (`src/quyen-nang-ai.js`), máy chủ
`may-chu/quyen-nang-ai.js`, kho `data.quyen-nang-ai.js` (3 kho `AI_`),
bảng `quyenAI`, bộ kiểm **mục 106**, tám phép đo ở `thu-worker.js`.

### Cấp quyền là cái răng, mười chức năng là thứ được cấp

- **Tắt mặc định.** `aiCoQuyen` trả false khi chưa có dòng bật — một
  quyền năng bật sẵn là một hệ tự mở rộng quyền của chính nó (VÀNG mặc
  định 9.99.62). Chức năng có cửa mà chưa bật → AI gọi vào nhận `CHUACAP`.
- **Chỉ Super Admin bật.** `capQuyenAI`/`thuHoiQuyenAI` khoá R01; AI
  KHÔNG tự bật, không vai nào khác bật hộ. Mục 106 canh **chỉ hai cửa ấy**
  ghi vào `quyenAI`.
- **Bật hay chưa tính LÚC ĐỌC** từ dòng mới nhất của (quyền, phạm vi) —
  không cột "đang bật". Thu hồi là dòng `bat=0`, giữ lịch sử (dongYDuLieu
  9.99.70).

### Chức năng làm việc đi qua cổng ĐÃ CÓ — một cái răng, nhiều đường vào

Năm chức năng có cửa chạy thật, và mỗi cửa kiểm `aiCoQuyen` **TRƯỚC** khi
làm gì:

- **AI01** phân loại phản hồi → gọi thẳng `ghiPhatSinh` (tu-hoan-thien).
- **AI02·AI03·AI04** soạn nháp (kho · camNang · ungPho) → gọi thẳng
  `soanBanNhap` → **vẫn phải ba chữ ký mới 入库**. AI không nhảy qua cổng.
- **AI05** tổng hợp giám sát → **báo động, KHÔNG tự khoá** (chỉ nêu khung
  mười cách + nói thẳng chưa có sổ lượt dùng để chấm thật).

Năm chức năng còn lại (AI06–AI10) khai `chuaCoCua` kèm lý do — trần
trước, cửa sau (rangO/chuaCoMat 9.99.74): tóm tắt hồ sơ con phải qua
nhật ký đọc + ẩn danh (Điều 13); rủi ro pháp lý phải TRỎ PLR (hỏi không
kết luận); ba cái còn lại chờ chốt đường nối/duyệt.

### Mục 106 + phá thử

Mục 106 canh: cấp/thu khoá R01, chỉ hai cửa ghi `quyenAI`, `aiCoQuyen`
đọc dòng mới nhất (mặc định tắt), ba cửa live kiểm `aiCoQuyen` trước khi
routed-call, kho khớp bản chép máy chủ (10 quyền, 5 cửa + 5 chờ). Phá
thử: bỏ cổng `aiCoQuyen` khỏi `aiPhanLoai` → đỏ "CỬA CHỨC NĂNG KHÔNG
kiểm aiCoQuyen TRƯỚC khi làm"; hạ `capQuyenAI` xuống `laNguoiNha` → đỏ
"CẤP/THU QUYỀN AI KHÔNG KHOÁ R01". Mục 23 thu-worker chạy trọn:
tắt→CHUACAP, R13 không cấp được, R01 bật→chạy, thu hồi→đóng lại, AI02
soạn vào staging.

### Sổ chờ

- **AIQ-01** — cấp quyền năng theo GÓI khách (nay chỉ toàn hệ `pham='he'`).
- **AIQ-02** — dựng cửa cho AI06–AI10 (mỗi cái một đường nối cần chốt).

---

## NGÔI NHÀ THỊNH VƯỢNG — HUB DẪN ĐƯỜNG BẰNG HÌNH (9.99.101)

Chủ hệ: *"Nhiều chữ và rối mắt quá. Thiết kế như cấu trúc của một ngôi
nhà — kích vào phần nào ra nội dung phần đó, để xây gia đình thịnh
vượng."*

Màn **Ngôi nhà thịnh vượng** (`src/ngoi-nha.js`), kho `G.NHA_PHAN`
(10 phần) ở chính tệp ấy, CSS `.nha-*` trong `assets/style.css`, bộ
kiểm **mục 107**. **Không thêm kho dữ liệu, không thêm cửa máy chủ** —
đây là một màn dẫn đường, không giữ nội dung.

### Màn này TRỎ, không chép — mười phần là mười cái cửa

Mỗi phần ngôi nhà mở một màn **ĐÃ CÓ**: mái→`tam-nhin` · ống khói
đã-đổi-gì→`tien-bo` · phòng khách→`chan-dung-nha` · phòng con→
`hanh-trinh-con` · lò sưởi→`dong-hanh` · nhà kho→`kho-qua` · cột trụ→
`lo-trinh` · vườn→`buc-tranh` · cửa chính→`hom-nay` · nền móng→`ban-do`.
Dựng nội dung ở đây là bản thứ hai của một sự thật; một hub thì việc
của nó là **dẫn đường**, không kể lại. Trả lời thẳng "nhiều chữ": thay
danh sách chữ dài bằng một bức tranh, mỗi phần chỉ icon + tên ngắn +
một dòng gợi ý.

### Nút HTML thật, KHÔNG vùng SVG

Vẽ một tấm SVG rồi bắt click từng vùng thì đẹp, nhưng phép đo vùng chạm
32px, nhãn đọc được cho người mù, và phím Tab đều **không thấy** một
vùng SVG. Nên từng phần là một `<button data-v>` thật — cùng đường điều
hướng `[data-v]` với cột trái — xếp thành hình nhà bằng lưới. Lưới
`auto-fit minmax(150px,1fr)` tự xuống một cột trên điện thoại, nên
**không thêm một `@media` nào** — khỏi đụng luật "khối chạm nằm cuối".

### Phần khoá KHÔNG phải click chết

Vai không mở được một phần (hồ sơ nhà là của phụ huynh…) thì phần ấy
hiện **mờ + ổ khoá, không bấm được** — không dẫn tới màn xin cấp phép.
Một mục dẫn tới màn xin cấp phép là "mục chết" (luật kho). Ngôi nhà vẫn
đủ hình, và người xem đọc ngay "phòng này của vai khác", không phải
"chỗ này chưa làm xong".

### home GIỮ `bat-dau` — mục 42 thắng ý thích của tôi

Tôi đặt `ngoi-nha` làm màn nhà chính (`G.PORTALS.ph/hs.home`), và **mục
42 đỏ**: người mới đăng nhập phải đổ thẳng vào chuỗi năm bước onboarding,
KHÔNG vào một màn tổng quan. Đó là một quyết định onboarding đã chốt —
**không nới phép đo cho vừa thay đổi của mình**. Trả `home` về
`bat-dau`; ngôi nhà nổi bật bằng cách đứng **đầu `G.NAV` nhóm g1** và
**ô đầu `G.DUOI` (ph·hs)**, một chạm là tới, nhưng không cướp màn đăng
nhập đầu tiên.

### Mục 107 — đo hai đầu độc lập

Rủi ro thật: một phần trỏ vào view KHÔNG TỒN TẠI — cái cửa dẫn vào
tường — lặng lẽ, vì router rơi về `ban-do`. Mục 107 đối chiếu
`G.NHA_PHAN` (lời khai của màn) với **G.NAV** (view thật) · **U.P**
(icon thật, bài học 9.99.84 icon sai rơi về `spark`) · **G.PERM**
(quyền thật, bài học 9.99.62 gõ sai tên quyền thì khoá mọi người trong
im lặng). Phá thử: trỏ một phần vào `man-khong-co-that` + quyền
`quyen_bia_dat` → đỏ đúng tên cả hai.

### Lỗi của tôi, bộ kiểm bắt

- **Mái dùng `rgba(255,255,255,...)` ba chỗ** → mục 12 đỏ (lớp phủ
  trắng phải ≤5 chỗ). Sửa: mái dùng token `--phu-*` cho nền/viền,
  `#fff` đặc + `opacity` cho chữ nhạt — **0 rgba trắng**. Muốn nhạt thì
  hạ độ đục, đừng thêm một lớp trắng mới.

## HÀNH TRÌNH 3D — LỚP ĐẦU: CON ĐƯỜNG NHIỆM VỤ (9.99.105)

Chủ hệ muốn một web app 3D: kích ô → hiện con đường lộ trình, một người
bước đi chạm từng nhiệm vụ, nhiệm vụ hiện ra, có cô trợ lý AI dẫn; khách
tự tạo nhân vật 3D hợp ảnh đại diện; kèm video hướng dẫn.

Màn **Con đường nhiệm vụ** (`src/con-duong.js`), NAV nhóm g2, bộ kiểm
**mục 108**. Không thêm kho, không thêm cửa máy chủ.

### Dựng KHUNG trước — đây là LỚP ĐẦU

Lớp đầu: con đường + nhân vật bước + trợ lý dẫn + nhiệm vụ hiện ra. Ba
thứ còn lại là **lớp sau** (sổ chờ CD-01/02/03), vì mỗi cái là một phần
lớn và một cái vướng luật.

### Ràng buộc CỨNG: ảnh đại diện → nhân vật 3D là Điều 13

Gửi ảnh khách (nhất là học viên <18) sang một dịch vụ dựng avatar 3D đặt
ngoài lãnh thổ là **xử lý dữ liệu xuyên biên giới** — phạm Điều 13 (bất
khả sửa) và Luật 91/2025. Nên "nhân vật hợp ảnh" phải làm bằng **bộ tạo
nhân vật TẠI CHỖ** (chọn dáng/tóc/trang phục), ảnh không rời máy. Đây là
CD-01, và nó KHÔNG được đi đường ảnh-ra-ngoài.

### 2.5D SVG chứ chưa WebGL — và vì sao

Con đường uốn vẽ bằng SVG: chạy mượt trên web lẫn .exe, không tải thư
viện nặng, và **đo được bằng do-khung-man** (nút thật, chữ thật). WebGL
là lớp sau nếu cần — nhưng phần lớn cảm giác "sinh động" đạt được bằng
2.5D + chuyển động CSS mà không mở một mặt trận testing mới.

### Đọc BD_LON THẲNG — mười mốc LÀ mười bánh đà

Mười mốc trên đường là `G.BD_LON` (mỗi bánh mang sẵn `ten·c·ic·tang·
vong·y·nho`). Màn KHÔNG chép mười nhiệm vụ vào — chép là bản thứ hai của
một sự thật; kho đổi một bánh thì con đường nói sai. Màu mốc lấy `b.c`
thật, icon lấy `b.ic` thật. Mục 108 đọc mã nguồn đòi màn **đọc thẳng
G.BD_LON** (bỏ chú giải + chuỗi trước khi dò — luật 9.99.78). Phá thử:
đổi `G.BD_LON` → tên khác thì đỏ.

### Nhân vật đứng ở mốc, trợ lý nói mốc ấy

`G.cdBuoc` là mốc đang đứng; nút Lùi/Bước tiếp và click mốc đổi nó, vẽ
lại. Mốc ≤ cdBuoc sáng, mốc sau mờ — đọc ra tiến độ. Cô trợ lý (thẻ trên
cùng) nói `vong` của mốc; bảng nhiệm vụ dưới hiện `y` + ba việc `nho` +
nút mở màn Mười bánh đà để làm thật.

### Sổ chờ

- **CD-01** — bộ tạo nhân vật tại chỗ (chọn dáng/tóc/trang phục/tông
  da), gắn vào lúc hoàn thiện hồ sơ. KHÔNG gửi ảnh ra ngoài (Điều 13).
- **CD-02** — video hướng dẫn hành trình: dựng bằng `dung-phim.js` từ
  khung ĐÃ phát hành (C19) + lời đọc là tệp có sẵn (C20), không để máy
  tự sinh.
- **CD-03** — mỗi ô trong Ngôi nhà mở đúng con đường của ô đó (nay con
  đường đi trên mười bánh đà chung); cần chốt mỗi ngăn nối lộ trình nào.

### Hành trình lớp 2 — nhân vật · con đường theo chặng · tự dẫn (9.99.106)

Chủ hệ: "tạo cả 3". Ba lớp cùng một bản, bộ kiểm **mục 108 mở rộng · mục 109**.

**CD-01 · Nhân vật của tôi** (`src/nhan-vat.js`, NAV g2). Khách tự chọn
tông da · kiểu tóc · màu tóc · trang phục · kính từ phần dựng sẵn. Hình
vẽ bằng `G.nvVe(doc)` — **một nguồn duy nhất** dùng cho cả màn này lẫn
nhân vật bước trên Con đường (không hai bản). Lưu localStorage (mấy chỉ
mục, không phải nhận dạng), bọc try/catch.

> **Điều 13 là RĂNG, không phải lời dặn.** Mục 109 đọc mã nguồn và ĐỎ
> nếu thấy đường đọc ảnh (`FileReader`/`readAsDataURL`/`createObjectURL`)
> hay `fetch(` — ảnh khách KHÔNG được rời máy sang một dịch vụ dựng
> avatar ngoài (xử lý dữ liệu xuyên biên giới, phạm điều bất khả sửa).
> Phá thử: thêm `FileReader` → đỏ. Đây là lý do "nhân vật hợp ảnh" làm
> bằng bộ chọn tại chỗ, không bằng upload ảnh.

**CD-02 · Xem hướng dẫn** (tự dẫn). Nút trên Con đường: nhân vật tự bước
qua từng mốc (`setInterval` 2,6s), trợ lý nói từng mốc. Timer **tự kiểm
view** — rời màn thì tự tắt, không rò; người tự bấm/đổi chặng thì dừng
tự dẫn. Đây là "video hướng dẫn" dạng đi-trong-app; mp4 thật (dựng qua
`dung-phim.js` theo C19/C20) là CD-02b khi có khung+lời đọc.

**CD-03 · Con đường theo CHẶNG.** Hàng chọn *Cả hành trình · T1…T5* lọc
mười bánh đà theo `BD_LON[].tang` **lúc đọc** (không giữ danh sách thứ
hai) — mỗi chặng một con đường riêng. Nối mỗi ô Ngôi nhà vào đúng con
đường của ô đó là CD-03b (cần chốt mỗi ngăn nối lộ trình nào).

Ba bộ kiểm xanh: kiem-tra 1038 · do-khung-man 1652 (4 khổ) · rà soát sạch.

### Sổ chờ hành trình

- **CD-02b** — mp4 hướng dẫn thật qua `dung-phim.js` (C19 khung đã phát
  hành · C20 lời đọc tệp có sẵn), không để máy tự sinh.
- **CD-03b** — mỗi ô trong Ngôi nhà mở đúng con đường của ô đó.
- **CD-04** — đồng bộ nhân vật theo tài khoản (nay lưu localStorage một
  máy): cần một cửa máy chủ + một bảng, lưu mấy chỉ mục (không phải ảnh).

### Cấu trúc ngôi nhà theo blueprint chủ hệ + 10 bánh đà (9.99.103 · 9.99.104)

Chủ hệ chốt hình ngôi nhà cụ thể: **mái = Tầm Nhìn Gia Đình Thịnh
Vượng** · **nền = Văn hoá·Quy tắc·Thói quen·Kỷ luật** · **tám ngăn**
(Mục tiêu · Hành Trình Hạnh Phúc · Phát triển Bản Thân · Tài năng ·
Giá trị Sống · Phẩm Chất · Vinh Danh · Tiêu Chuẩn Sống) · **cửa =
Hành động** · **vòng GITA365 bao quanh** · **mười bánh đà quay quanh**.

**9.99.103 — sắc màu:** mỗi phần mang một sắc riêng qua biến CSS `--ac`
(gán ở `ngoi-nha.js` từ token thương hiệu `--t1..t5 · --gita*`), icon
trong huy hiệu tròn màu đặc, thẻ ánh nhẹ sắc phòng. Dùng `color-mix`
với một dòng lùi đứng trước (trình cũ rơi về dòng lùi). 0 rgba trắng.

**9.99.104 — blueprint + 10 bánh đà:**
- `G.NHA_PHAN` viết lại đúng 11 phần theo blueprint; mỗi phần **trỏ màn
  đã có** (tam-nhin · cu-hich · buc-tranh · ban-do-ca-nhan ·
  chan-dung-nha · chuyen-hoa · chin-vai · vinh-danh · bang-so ·
  hom-nay · thoi-quen). Không dựng nội dung mới.
- **Mười bánh đà đọc THẲNG `G.BD_LON`** (tên thật của kho), KHÔNG chép
  mười tên vào màn — chép là bản thứ hai của một sự thật, kho đổi tên
  một bánh thì màn nói sai. Mỗi bánh mở `banh-da`. Năm trên + năm dưới,
  ôm lấy nhà, trong vòng GITA365.
- Mục 107 thêm vế: đích `banh-da` là view thật · `BD_LON` đủ mười.

**Hai lỗi của tôi, rà soát bắt:**
1. Chấm màu bánh đà là `<span>` rỗng → 10 thẻ rỗng. Sửa: vẽ bằng
   `::before`, không tạo thẻ rỗng.
2. Nhãn GITA365 dùng `font-size:13px` → thang chữ thành 10 bậc (luật
   ≤9). Sửa về `12.5px` (bậc có sẵn). Thêm một cỡ chữ là phải hỏi thang
   đã có bậc ấy chưa.

### Nâng chất lượng thị giác + sức hút marketing (9.99.102)

Chủ hệ: *"xử lý tối ưu hơn, chất lượng hơn; giao diện hiệu quả marketing
hơn."* Lượt này **chỉ CSS + chữ tiêu đề** — không đổi kho, không đổi
logic, không đổi ánh xạ phần→view. Nên phá thử mục 107 vẫn nguyên giá
trị; rủi ro dồn vào `do-khung-man` (thẻ cao hơn, icon vòng tròn).

- **Khung cảnh có chiều sâu**: quầng sáng "trời" sau mái (token
  `--gita-mo-1`), mái đổ bóng theo HÌNH đã cắt bằng `filter:drop-shadow`
  (box-shadow theo hộp vuông, không theo trapezoid), thân nhà có bóng nổi.
- **Icon trong vòng tròn mềm** — mỗi phòng dễ nhận, mời gọi hơn danh
  sách chữ.
- **Cửa chính = nút hành động chính**: nền `--gita-sau` ĐẶC (không
  gradient nhạt), chữ trắng tương phản ~7:1, to và nổi nhất — lời mời
  "vào nhà mỗi ngày" phải bật lên.
- **Tiêu đề bán tầm nhìn**: *"Mỗi gia đình là một ngôi nhà đang được
  xây… mỗi ngày một chạm"* — vẫn ít chữ.

**Không thêm một lớp trắng rgba nào** (mục 12 cấm quá 5): vòng icon trên
mái/cửa dùng lớp phủ TỐI `--phu-3`, chữ trắng là `#fff` đặc + `opacity`.
Muốn nhấn thì dùng token bóng/độ đục, đừng thêm lớp trắng. Ba bộ kiểm
xanh: 1036 · rà soát sạch · 1636 lượt (4 khổ).

---

## ĐIỀU PHỐI 100 TRỢ LÝ SIÊU CẤP — TRẦN TRƯỚC, TRỢ LÝ SAU (9.99.107)

Chủ hệ: dựng 100 trợ lý AI siêu cấp đảm nhận chi tiết mọi vai, hỗ trợ Bộ
não thiên tài GITA365 vận hành toàn diện; Bộ não CAO NHẤT và điều phối;
sắp tới nối tuyến với web app nhánh — cần điều phối mạch lạc KHÔNG xung
đột; trợ lý tự hoàn thiện theo chuẩn chuyên gia và TUÂN THỦ HIẾN PHÁP;
nâng năng lực Bộ não ×100.

Màn **Điều phối trợ lý AI** (`src/dieu-phoi.js`, kho `G.DP_*` ở chính tệp
ấy), máy chủ `may-chu/dieu-phoi.js` (ba cửa), bộ kiểm **mục 110** (4 phép
đo) + năm phép đo ở `thu-worker.js`. Và **cô trợ lý AI của GITA**
(`G.troLyVe` ở `con-duong.js`) — gương mặt dẫn đường, vẽ SVG tại chỗ,
không nhúng ảnh ngoài (Điều 13); dùng chung ở Con đường và Điều phối.

### Dựng CÁI TRẦN điều phối TRƯỚC — lần thứ sáu

Sau Hiến pháp (9.99.62), trần giám sát (9.99.76), tự nâng cấp (9.99.77),
Supreme (9.99.83), Studio (9.99.92). Ở đây: một trăm tác nhân cùng chạm
một hệ mà KHÔNG có tầng điều phối thì hai trợ lý cùng sửa một thứ, và cái
hỏng lộ ra ở **thứ thứ ba đọc phải hai kết quả khác nhau**, không ở lượt
sửa. Nên trần (Bộ não cao nhất · khoá sở hữu chống trùng · ràng hiến
pháp) phải có TRƯỚC khi một trợ lý nào ra tay.

### Chống xung đột = MỖI TRỢ LÝ MỘT KHOÁ SỞ HỮU = MỘT CỬA THẬT

Khoá sở hữu của một trợ lý LÀ cửa nó phục vụ. Hai trợ lý không cùng một
cửa → không bao giờ hai trợ lý cùng ra tay trên một thứ. Đây là phép
chống xung đột **đo được**: mục 110 đòi 100 khoá ĐÔI MỘT KHÁC NHAU và mọi
khoá là một cửa CÓ THẬT trong `worker.js` (CAN_PHIEN) — đo hai đầu độc
lập (9.99.84): roster `G.DP_TRO_LY` ↔ danh sách cửa thật. Một trăm trợ lý
neo vào 100 cửa thật trong 29 miền.

### Bốn chỗ TRỎ, không chép — và bản thứ hai của HIẾN PHÁP là nguy nhất

Bộ não (BN_*), Hiến pháp 13 điều, hàng rào 10 điểm, chín điều bất khả sửa
(HP9), lớp cấp quyền AI (9.99.100), vòng tự nâng cấp có cổng (9.99.77),
ba chuỗi cấp phép (9.99.96–99) — TẤT CẢ đã có. Trăm trợ lý KHÔNG dựng lại
cái nào; mỗi trợ lý TRỎ vào một cửa thật và đi qua đúng cổng của cửa ấy.
Chép hiến pháp/hàng rào vào `DP_*` là bản thứ hai của một BẢNG CẤM — bản
nguy nhất (9.99.83). Mục 110 canh `DP_*` không mọc `DP_HIENPHAP/RAO/...`.

### ×100 LÀ LỜI KHAI, không phải chỉ tiêu

"Nâng năng lực Bộ não ×100" là một HƯỚNG. Dựng ô `heSoNangLuc:100` là dựng
lại đúng bẫy SUP-01 (9.99.86): một con số để rồi có người chạy cho đủ.
Năng lực thật tăng bằng một trăm trợ lý làm chi tiết dưới điều phối của Bộ
não — không bằng một hệ số. `DP_TRAN[DP5]` mang `loiKhai:true`; mục 110
canh không `DP_*` nào có ô SỐ tự xưng năng lực/hệ số.

### Điều phối KHÔNG tự ra tay — nếu không nó là CỬA HẬU

Mọi cổng (Điều 13, cấp quyền AI, ba chữ ký) nằm ở TỪNG cửa thật. Nếu
`dieuPhoiTroLy` chạy việc thay thì nó đi vòng qua tất cả. Nên nó chỉ trả
BẢN KẾ HOẠCH (trợ lý nào · cửa nào · cổng nào) rồi DỪNG; việc thật vẫn gọi
đúng cửa ấy, cửa ấy tự kiểm cổng. Mục 110 + thu-worker canh
`may-chu/dieu-phoi.js` KHÔNG có INSERT/UPDATE và KHÔNG gọi một cửa ghi.

### Tự hoàn thiện ĐI QUA vòng đã có cổng

`tuHoanThienTroLy` không tự sửa gì — nó gói yêu cầu rồi TRỎ thẳng
`deXuatNangCap` (vòng năm cửa, bảy vùng K1–K7 không tự chạm). Chạm vùng
cấm (hiến pháp…) thì CHÍNH vòng trả `VUNGCAM`, không phải một luật thứ hai
ở đây. Bộ thử chứng minh: `tuHoanThienTroLy` với vùng "hiến pháp" → VUNGCAM.

### Nối tuyến web app nhánh — không gian khoá sở hữu DÙNG CHUNG

`DP_TUYEN`: app nhánh khai khoá sở hữu vào CÙNG không gian, nên một cửa
vẫn chỉ một trợ lý dù ở app nào; Bộ não GITA365 là đầu điều phối chung,
app nhánh không có Bộ não thứ hai (một bộ não thứ hai là một hiến pháp
thứ hai). Chưa nối — khai để không ai tưởng đã nối.

### Cô trợ lý AI của GITA — G.troLyVe, một nguồn

Vẽ chân dung SVG tại chỗ (tóc đen dài · áo blouse trắng · ve áo xanh GITA
· chấm đỏ thương hiệu), KHÔNG nhúng ảnh raster ngoài, KHÔNG gửi ra dịch vụ
nào — cùng luật Điều 13 với `nvVe`. Dùng ở thẻ dẫn đường Con đường và ngăn
Bộ não của màn Điều phối. Một nguồn: sửa một chỗ, cả hệ đổi theo.

### Sổ chờ

- **DP-01** — 100 trợ lý nay neo 1:1 vào 100 cửa. Khi thêm cửa/miền mới
  thì thêm trợ lý vào `DP_SPEC` (một dòng), mục 110 tự canh khoá không
  trùng và cửa có thật. Chốt: roster có cần vượt 100 khi hệ lớn không.
- **DP-02** — nối tuyến web app nhánh: mỗi app nhánh khai khoá sở hữu vào
  không gian chung; chốt cách một app nhánh đăng ký trợ lý với Bộ não.

## KHÔNG GIAN 5D · CHUYỂN ĐỘNG · CỘT THU GỌN · HỆ CHỮ (9.99.108)

Chủ hệ: phá cách sang hiện đại, chiều sâu ("5D"), cao cấp; người xem
cảm nhận mình đang DỊCH CHUYỂN; bấm/chọn đều có chuyển động và sự KHAI
MỞ; hai cột thu gọn được để mở rộng màn chính; mô thức hoá phần chữ.

**"5D" KHÔNG phải năm chiều thật** — khai thẳng trong `style.css` để
người sau không tưởng có hệ toạ độ năm trục (luật kho: không khai điều
máy không làm được). Nó là CHIỀU SÂU KHÔNG GIAN: lớp bóng chồng
(`--noi-1/2`), phối cảnh (`perspective`), nghiêng nhẹ theo hướng rê
(`rotateX`), và chuyển cảnh "đi vào" mỗi màn.

### Cột thu gọn — `G.S.thuCot`

Nút `data-act="thu-cot"` (deskonly) trên thanh trên gập CẢ HAI cột để
màn chính mở full (căn giữa ≤1180px); bấm lần nữa hiện lại. Nhớ qua
phiên (save/load), áp lại lúc dựng vỏ. Luật đặt trong `@media(min-width:
861px)` để KHÔNG đè `.open` của ngăn kéo điện thoại — cùng độ đặc hiệu
`#left`, dòng sau thắng, nên phải khoá theo khổ. Điện thoại hai cột vốn
là ngăn kéo đóng sẵn nên thu gọn không thêm gì.

### Chuyển động — và chỗ suýt làm do-khung-man đỏ oan

`.view` trượt-dọc + mờ mỗi lần đổi màn; `oMo` hiện lần lượt các ô hub.
**KHÔNG dùng `scale()` trong hai animation ấy**: scale co MỌI kích thước
con ~1,4% trong nửa giây đầu, và `do-khung-man` đo vùng chạm GIỮA lúc ấy
có thể thấy một ô 32px tụt còn 31,5 — đỏ oan một ô đúng chuẩn. Cảm giác
"đi vào" đủ mạnh bằng trượt dọc (transform translateY KHÔNG đổi kích
thước đo được). Nghiêng 3D chỉ ở `@media(hover:hover)` nên con trỏ thô
(khổ chạm) không dính.

Mọi chuyển động TẮT HẲN ở `@media(prefers-reduced-motion:reduce)` cuối
khối.

### Hệ chữ — foundation, ánh xạ ĐÚNG thang chín bậc

Sáu vai `.t-display/title/h/sub/body/cap/label`, mọi cỡ nằm trong thang
10.5·12.5·14.5·16·18·21·26·33 đã có (ra-soat canh ≤9 bậc). Rải ra 180
màn là việc dần — **UI5D-01** trong sổ chờ.

### Sổ chờ

- **UI5D-01** — rải hệ chữ `.t-*` ra toàn bộ màn (nay mới là foundation
  + shell/hub). Làm dần, mỗi màn một lượt, không đổi cỡ ngoài thang.
- **UI5D-02** — điều hướng không gian sâu hơn: kéo-xoay (drag-to-rotate)
  giữa các màn/lộ trình. Lớn; cần một mô hình cảnh riêng và bộ đo mới,
  nên tách khỏi bản này.

## HÀNH TRÌNH LỚP 3 — CD-03b · CD-04 (9.99.109)

Chủ hệ: *"tiếp tục lập trình full các phần đang còn dở."* Hai mục hành
trình làm được TRỌN, không cần chủ hệ quyết: CD-03b và CD-04.

### CD-03b — mỗi ô Ngôi nhà mở CON ĐƯỜNG của chặng nó

Đúng hình dung 3D đầu tiên của chủ hệ: *kích ô → hiện con đường lộ
trình*. Tám ngăn trong nhà nay khai `chang` (T1…T5) và mở `con-duong`
lọc đúng chặng ấy (`G.cdMoTheoChang`), thay vì đi thẳng màn nội dung.
Con đường là lối ĐI; phòng là nơi LÀM — nên con đường có nút **Vào
phòng** (`G.cdVaoPhong`) dẫn vào màn nội dung, một chạm. Mái · cửa ·
nền không có `chang` nên đi thẳng nội dung như cũ.

`chang` giữ ở NHA_PHAN (một nguồn); con đường lọc `BD_LON[].tang` lúc
đọc (không danh sách thứ hai). Mục 107 thêm vế: mọi `chang` phải ∈
`G.TIERS` — trỏ chặng không có thì `cdMoTheoChang` lọc ra rỗng, con
đường trống lặng lẽ. Người TỰ đổi chặng (`cdLoc`) thì xoá `cdVaoPhong`
— nút Vào phòng của phòng cũ hết đúng.

### CD-04 — nhân vật đồng bộ theo tài khoản

`may-chu/nhan-vat.js` (`luuNhanVat` · `docNhanVat`), bảng `nhanVatKH`,
mục **111**, năm phép đo `thu-worker.js`.

**Chỉ lưu NĂM CHỈ MỤC (da·tocMau·toc·ao·kinh), KHÔNG ảnh, KHÔNG tên
(Điều 13).** Một dump CSDL lộ không mang theo khuôn mặt hay tên ai —
nhân vật dựng lại từ năm con số, mà năm số ấy không nhận ra ai. Cùng
luật với `nvVe` vẽ tại chỗ ở máy khách: ảnh KHÔNG rời máy; thứ rời máy
chỉ là chỉ mục. Mục 111 bóc khối `CREATE TABLE nhanVatKH` và ĐỎ nếu
thấy cột tên `anh·hinh·image·ten·hoTen·name·face·avatar…`.

**Ghi ĐÈ (ON CONFLICT), khác luật "dòng mới không ghi đè".** Đồng ý ·
giá · yêu cầu xoá giữ LỊCH SỬ vì có câu *"hôm ấy đã đồng ý chưa"*. Nhân
vật là một LỰA CHỌN HIỂN THỊ hiện tại — như một ô cài đặt — không ai
hỏi *"tháng trước tóc màu gì"*; giữ lịch sử một sở thích cosmetic là
giữ rác.

**Khoá theo `hoSo.uid` của phiên**, không nhận `uid` do người gọi
truyền (một ô như thế cho người này ghi đè nhân vật người kia). Mọi vai
có phiên đều có nhân vật (cosmetic, không khoá theo vai). Bộ thử chứng
minh hai tài khoản không thấy nhân vật của nhau, và chỉ mục rác bị kẹp
(999→50, -5→0).

**Client giữ localStorage làm bản offline** (chạy cả trong .exe); máy
chủ chỉ thêm đường đồng bộ. `G.nvLuu` đẩy lên (bắn-rồi-quên, lỗi mạng
không hỏng lượt chọn); `G.nvDongBoVe` kéo về một lần mỗi phiên khi mở
màn. Đẩy/kéo qua `G.goiMayChu`, KHÔNG `fetch(` — nên mục 109 (cấm
`fetch(` trong nhan-vat.js) vẫn xanh.

### Sổ chờ còn lại của hành trình

- **CD-02b** — mp4 hướng dẫn thật qua `dung-phim.js`: cần **tệp lời
  đọc CÓ SẴN** (luật C20 cấm máy sinh giọng) + bộ khung ĐÃ phát hành
  (C19). Chưa có tệp lời đọc nên chưa dựng — chờ chủ hệ gửi giọng, hoặc
  chốt làm mp4 câm (Ken Burns) không lời.

## SOI ĐỐI KHÁNG — 9.99.107 LÀ TẤM ÁP PHÍCH, VÀ HAI LỖ THẬT KHÁC (9.99.110)

Chủ hệ: *"Tôi cần kết quả test khắt khe nhất, không phải báo nhanh cho
có để nịnh. 100 trợ lý chất vấn nhau, soi chỉ tiêu cao nhất, không dễ
với nhau."* Đúng lúc — vì bản 9.99.107 tôi báo "xanh" là **báo nịnh**.

Tôi tung **ba tổ soi đối kháng** lên 9.99.107 · 108 · 109, mỗi tổ được
lệnh săn lỗi thật, tự phản biện, chỉ báo cái ĐÃ XÁC MINH, và trả lời
câu gắt nhất: *"tính năng THẬT hay chỉ là tấm áp phích?"*

### 9.99.107 bị chấm THẲNG là ÁP PHÍCH — và đúng

`dieuPhoiTroLy` bản đầu là một **cái echo**: nhận bừa mọi chuỗi làm
`khoaSoHuu`, KHÔNG đối chiếu gì, rồi khai *"đã tìm trợ lý sở hữu cửa
X"* kể cả khi X không tồn tại. Đó là **một lời nói dối mang dấu hệ
thống** (cùng luật `daGoNgoai`/`den`/`conHan`), và cả tính năng thành
tấm áp phích (mục 88: *bảng thì không chặn được gì*). Tệ hơn: mục 110
vế D và bộ thử worker cũ là **cái gương** — chúng khẳng định các cờ
`khongTuRaTay===true` (hằng số tự khai) và dò regex tĩnh, nên KHÔNG THỂ
đỏ trên sự rỗng ấy.

**Sửa cho FALSIFIABLE:** `dieuPhoiTroLy(y,env,db,hoSo,danhSachCua)` nay
đối chiếu `khoaSoHuu` với danh sách cửa THẬT (worker truyền `CAN_PHIEN`)
TRƯỚC khi ghi nhật ký; cửa lạ → **`KHONGCUA`**; không có danh sách →
đóng, không đoán; câu `vi` nói THẲNG là nó chỉ *xác nhận cửa có thật +
trỏ*, không "tìm ra" bằng một phép tra không tồn tại. Mục 110 thêm **vế
E** (đòi `.includes(khoaSoHuu)` + `KHONGCUA` + worker truyền CAN_PHIEN),
và bộ thử worker nay có **phép đo HÀNH VI**: cửa lạ → KHONGCUA (echo cũ
sẽ trả `ok` → đỏ). Đó là cái test mà bản cũ thiếu.

> **Bài học nặng nhất:** một tính năng TRÔNG hoàn chỉnh (màn đẹp, 100
> dòng, 7 luật, phép đo xanh) vẫn có thể là áp phích nếu **không cửa nào
> ra tay và không phép đo nào đỏ được trên sự rỗng ấy**. Báo "xanh" cho
> nó là báo nịnh. Cách duy nhất chống: một phép đo HÀNH VI có thể đỏ.

Phần THẬT của 9.99.107 (tổ soi công nhận, không nới): cổng vai R01–R12
thật; `tuHoanThienTroLy` TRỎ thật vào `deXuatNangCap` (chạm hiến pháp →
VUNGCAM); ba vế A/B/C của mục 110 (roster ↔ CAN_PHIEN) là đo hai đầu
thật. Roster vẫn là **bản đồ sở hữu** (một cửa = một trợ lý), nay có
răng ở cửa xác minh; nói thẳng nó không "điều phối chạy thay".

### 9.99.108 — một lỗ a11y THẬT

Danh sách `transition` và danh sách `transition:none` (reduced-motion)
là **hai bản chép viết tay**, và bản đầu bỏ sót `.dp-tl-o · .cd-loc-o`
ở danh sách tắt — người xin giảm chuyển động vẫn nhận transform khi bấm
chip lọc chặng. Sửa: thêm vào danh sách tắt. Và dựng **mục 112** canh
*mọi selector có transition trong khối 5D phải nằm trong danh sách tắt*
— phá thử: bỏ hai selector khỏi danh sách tắt → đỏ đúng tên. Cũng dời
`#left,#right{transition}` vào `@media(min-width:861px)` (bản đầu đặt
toàn cục, đè easing ngăn kéo điện thoại).

### 9.99.109 — một lỗ HIGH: người dùng bị BỎ RƠI

CD-03b đổi tám ngăn từ đi-thẳng-nội-dung sang mở-con-đường. Nhưng
`con-duong` **return màn rỗng TRƯỚC** khi vẽ nút "Vào phòng" — nên khi
`BD_LON` chưa nạp (vai không có gói nền; bốn ngăn n2·n3·n5·n7 không có
`perm` nên ai cũng bấm được), người bấm ô rơi vào màn rỗng **không lối
vào nội dung phòng**. Nội dung trước đây tới được, nay không. Sửa: dựng
nút "Vào phòng" TRƯỚC lối return rỗng — lối vào phòng luôn còn.

Hai lỗ nhỏ hơn: onclick dựng chuỗi JS từ dữ liệu đã `h()` (sai ngữ cảnh
— `h()` là escape THUỘC TÍNH, không phải chuỗi JS; latent vì dữ liệu
tĩnh) → đổi sang `data-*` + `G.nhaMoChang(this)` đọc dataset. Và mục 111
`svUid` là **cái gương** (chỉ dò "có hoSo.uid", không chặn `y.uid` từ
payload) → nay đòi CẢ HAI: có đọc hoSo.uid VÀ không đọc uid từ payload.
Và trạng thái `cdVaoPhong` cũ dính khi mở con-duong bằng menu → `G.go`
gọi `G.cdMoThuong()` xoá (giữ khi đến từ phòng qua cờ `_cdTuPhong`).

### Sự thật về "thang 1000 điểm" — nói vì chủ hệ hỏi "test chuẩn 1000 điểm"

**KHÔNG có điểm 1000 đo được.** Đếm thẳng `data.qa.js`: ~**28/50 ô máy
đo**, ~**22/50 là LỜI KHAI** (người tự chấm). Cộng thành "1000 điểm" là
gộp cột đo với cột khai — thứ luật kho cấm (9.99.80–82). Ai trình
"929/1000" hay "1000/1000" là con số **nịnh**. Còn `do-ro-ri` (rò dữ
liệu theo vai) chạy thật: **KHÔNG RÒ** — đây mới là phép đo khắt khe
đáng tin, và nó xanh thật.

## SOI ĐỐI KHÁNG ĐỢT HAI — HAI LỖ THẬT Ở BỀ MẶT ĐẮT NHẤT (9.99.111)

Chủ hệ: *"làm full toàn bộ"* — chạy trọn vòng khắt khe: tìm lỗ → sửa hết
→ test lại. Đợt một (9.99.110) soi ba màn mới. Đợt hai soi các **bề mặt
hậu quả cao nhất**: cổng ẩn danh Điều 13, cổng tài chính, cứu hệ. Hai lỗ
THẬT, một "lỗ" hoá ra là thiết kế đúng.

### LỖ 1 · ĐIỀU 13 — bộ dò tên MÙ trước họ mang dấu "Đ" (nặng nhất)

`soatRaNgoai` ở `may-chu/bo-nao.js` là bộ dò DUY NHẤT chặn dữ liệu người
rời hệ. Bản cũ dựng regex tên bằng `\b`:

```
'\\b(' + HO_VIET.join('|') + ')\\s+[A-ZĐÀÁ…]…'
```

Đây là **cái bẫy \b ĐẦU TIÊN tệp này ghi** (mục "Ba cái bẫy của phép dò
chữ tiếng Việt"), và nó cắn ở đúng chỗ chết người: `\b` không khớp trước
"Đ" (ngoài lớp `\w`), nên bốn họ trẻ con **Đặng · Đỗ · Đoàn · Đinh** lọt
cổng với `sach:true` — đi thẳng ra `guiDeBaiRaNgoai → nhanAnhVe → fetch`
tới bộ tạo ảnh đặt ngoài lãnh thổ. Đó là **xử lý dữ liệu xuyên biên giới
một cái tên trẻ con**, phạm Điều 13 **bất khả sửa** và Luật 91/2025.

Xác nhận bằng cách CHẠY THẬT regex, không đọc mã đoán: cả bốn họ Đ →
`null` → `sach:true`. Sửa: biên Unicode `(?<![\p{L}\p{M}])` + `\p{Lu}` +
cờ `u` + chuẩn hoá `NFC` — không bao giờ thiếu một dấu, không bao giờ mù
trước một họ. Lớp `[A-ZĐÀÁ…]` gõ tay **luôn thiếu một dấu**; đừng bao giờ
gõ tay lớp chữ có dấu.

> **Phép tự kiểm KHÔNG THỂ đỏ trên đúng lỗ nó canh là phép kiểm giả.**
> V5 của `phap-ly-rui-ro.js` chỉ thử **"Nguyễn Thị Lan"** — mà bản cũ đã
> bắt được Nguyễn. Nên suốt nhiều bản V5 XANH trong khi cổng để lọt bốn
> họ Đ. Nay V5 thử THÊM **"Đặng Văn Minh"**, và bộ thử worker có phép đo
> riêng cho họ Đ. Phá thử (trả regex về `\b`): CẢ HAI đỏ. Lần thứ … của
> luật *một phép kiểm chưa từng đỏ ở chỗ nguy hiểm nhất thì chưa phải
> phép kiểm*.

### LỖ 2 · TÀI CHÍNH — tầng "ghi nhận" là cửa hậu MỘT CHỮ KÝ không trần

Tổ soi tài chính (chất vấn sáu câu, chỉ báo cái đã trace) tìm ra: chỉ
hai cửa ghi `chiPhi.trangThai='daDuyet'` — `duyetChi` (qua trọn thang
nấc + mốc chu kỳ) và **`chotLuong`** (KHÔNG qua). `chotLuong` gọi được
bởi `lv<=3` (Giám đốc R03, không chỉ Super Admin), và `ghiNhan` là số
**người chốt tự gõ**, chỉ chặn `>=0` và lý do ≥10 ký tự — **không trần**.

Đường lách: R03 chốt lương người thông đồng với `ghiNhan = 500 triệu`,
một câu lý do → 500 triệu ra `chiPhi` ở `daDuyet` với **một chữ ký**,
không `nac`, không `mocCua`, không chữ ký thứ hai. Chi thẳng cùng cỡ đòi
**N5** (hai người + hoá đơn + báo giá) VÀ **mốc chu kỳ C5/C6** (Super
Admin). `doiSoatLuong` KHÔNG bắt được vì số chi **khớp đúng** bảng lương
thật — khoản thưởng vô hình với mọi cổng hạ nguồn.

Chú giải cũ tự bào chữa *"ở đây không có số tiền nào được gõ"* — **SAI**
với `ghiNhan`. Đúng thứ luật kho cảnh báo: **một chú giải không khớp mã
là một cái bẫy đã cài** (cùng lớp `V4 câm` của bộ tối ưu, `daGoNgoai`).

Sửa: `ghiNhan` có **trần = `tranKpi`** — ceiling biến-thiên-lương của
chính vị trí, do Super Admin đặt, người chốt không nống được. Một ghi
nhận lớn hơn cả trần KPI một tháng thì không còn là "ghi nhận việc nhỏ"
— nó là khoản chi thật, phải đi qua `duyetChi` + thang nấc. Chọn trần từ
một số Super-Admin-đặt, không phải hằng gõ tay (hai bản ngưỡng lệch nhau
thì một khoản lọt). Bộ thử worker: `ghiNhan:500tr` → `GHINHANVUOTTRAN`;
phá thử (vô hiệu cổng) → đỏ. Chú giải "không qua thang nấc" nay nói rõ:
phần đo được không có số gõ, phần gõ duy nhất (ghi nhận) đã có trần.

### KHÔNG PHẢI LỖ · cứu hệ — đọc kỹ thì thiết kế đúng

Tổ soi đợt một nghi ba chỗ ở `cuu-he.js`. Trace kỹ từng dòng thì cả ba
là **thuộc tính thiết kế, không phải lỗ** — và nói ra điều đó cũng là
một phần của "khắt khe": *không nịnh bằng xanh, cũng không bịa ra đỏ*.

- **`baoDongCuuHe` không dùng phiên** — CỐ Ý (Super Admin thật không có
  phiên khi hacker giữ hết). Hại duy nhất kẻ ẩn danh gây được là spam
  email/log — DoS-cận, ngoài phạm vi; và nó KHÔNG cấp quyền gì (token
  chỉ đi qua email, vẫn cần `GITA_KHOA_CUU` offline). Thêm phiên vào là
  **phá đúng công dụng** cửa ấy.
- **`dongBangHe` không khoá riêng tài khoản R01** — đóng băng chặn MỌI
  cửa ghi toàn hệ (mặc-định-từ-chối), nên hacker đăng nhập lại bằng mật
  khẩu mới cũng không ghi được gì tới khi `truyHoiHe` đặt lại mật khẩu.
  Khoá thêm một dòng tài khoản là thừa.
- **`dongBangHe` không tiêu token** — CỐ Ý: cùng token dùng tiếp cho
  `truyHoiHe` giữa cơn sự cố (không lấy token mới dễ lúc ấy); `truyHoiHe`
  mới đánh dấu `daDung` ở cuối. Cả hai bước đòi `GITA_KHOA_CUU` offline
  mà hacker không có.

### Bài học đợt hai

> **Bề mặt đắt nhất không phải màn mới — nó là cổng cũ ai cũng tin đã
> đúng.** Hai lỗ thật đều ở mã chạy nhiều bản: một bộ dò tên "đã có từ
> 9.99.62", một cửa lương "đã chốt". Soi đối kháng phải chĩa vào **chỗ
> hậu quả cao nhất**, không chĩa vào chỗ mới nhất — và phải CHẠY THẬT
> (regex, cửa worker), không đọc mã đoán.

## SOI ĐỐI KHÁNG ĐỢT BA · BỐN — BỊT LỖ RỒI DỰNG PHÉP ĐO HÀNH VI (9.99.112)

Chủ hệ: *"100 trợ lý chất vấn nhau… soi từng câu từ, từng quy trình…
chỗ nào còn lỗi phải làm lại ngay"* — hai đợt thanh tra ma-trận-vai và
vòng-đời trên **mọi vị trí tài khoản**. Kết: mười hai lỗ, phần lớn là
**cổng cũ ai cũng tin đã đúng** (đúng bài học đợt hai). Bản này bịt hết
và — quan trọng hơn — dựng **phép đo HÀNH VI** cho từng lỗ ở
`thu-worker.js` mục **24**, mỗi cái đã PHÁ THỬ đỏ đúng chỗ.

### Sáu lỗ HIGH, và vì sao cả sáu sống lâu

| Lỗ | Cửa | Sai thế nào |
|---|---|---|
| A | `chung-cu` (ký·xác nhận·soi) | nằm trong CAN_PHIEN nhưng **không kiểm vai** — khách R13 ký được, Coach nắm tài khoản khách TỰ XÁC NHẬN chứng cứ của mình |
| B | `traBoSung` | chỉ chặn ở tầng phiên — khách đọc được nội dung NGHỀ (camNang·ungPho) |
| C1 | `capLenhGiamSat` | cổng "không tự cấp" so chuỗi thô `choAi===hoSo.u`, **bỏ sót khi khai bằng EMAIL** |
| C2 | `capQuyenTaiChinh` | cùng lỗ email — tự cấp được cửa **ký TIỀN** cho mình |
| D | `docTheVungManh` | rút đồng ý chỉ chặn TẠO thẻ; cửa ĐỌC vẫn trả D4 (nỗi sợ nguyên văn của trẻ) sau khi cha mẹ đã rút |
| E | `danhDauXoa` trongSo | chỉ UPDATE một mốc rồi khai "đã xoá trong hệ" — **KHÔNG xoá một bản ghi con nào** |

**C1·C2 là cùng một lớp lỗi `hoSo.username`/`hoSo.vai`/`maKhachHang`**
(9.99.55·62·75): so định danh bằng **chuỗi thô một vế** thì email của
chính mình lọt. Chữa bằng `Kho.layUid()` — quy mọi hình (id·username·
email) về `users.id` rồi so, luật 9.99.84 "so hai đầu, một đầu từ chỗ
khác". Cổng thô GIỮ LẠI làm lớp nhanh; cổng canonical đứng SAU khi tra
được người.

**D·E là cùng luật `daGoNgoai`/`den`/`conHan`**: một ô/cửa khai một
việc mà KHÔNG làm việc ấy là **một lời nói dối mang dấu hệ thống**. E
nặng nhất — cha mẹ được báo "đã xoá" trong khi D4 vẫn đọc được, phạm
quyền xoá Luật 91 với đúng loại dữ liệu bảo vệ đặc biệt. Nay trongSo
`DELETE` thật ba bảng con (theVungManh·hoSoSongSinh·soCham) rồi ĐẾM
dòng còn lại — con số ấy MỚI làm nó thành phép đo.

### Lỗ CRITICAL: latest-row-wins không có mốc đơn điệu

`docCheDoBao`/`docDongYAnhCon` đọc `ORDER BY ghiLuc DESC LIMIT 1`, mà
`ghiLuc` là chuỗi ISO mili-giây. Ký rồi rút trong CÙNG mili-giây thì
thứ tự resolve TÙY Ý — một nhà đã RÚT có thể đọc ra ĐANG CÓ. Thêm
`, rowid DESC` (và `, rowid ASC` cho các state-fold đọc xuôi:
bang-gia·dongYDuLieu·yeuCauXoa·baCuaConNguoi·luotPrompt·ghimCon).
Cùng lớp lỗi flaky-theo-ngày ở `thu-worker` — **đỏ THỈNH THOẢNG là lớp
tệ nhất**, vì chạy lại cho qua tới hôm đỏ vì lý do thật cũng chạy lại
cho qua nốt.

### F-1: điều phối 100 trợ lý là TẤM ÁP PHÍCH (đã sửa 9.99.110, giữ ghi)

`dieuPhoiTroLy` bản đầu nhận bừa mọi chuỗi, khai "đã định tuyến" kể cả
cửa không tồn tại. Đã sửa FALSIFIABLE ở 9.99.110 (đối chiếu `khoaSoHuu`
với CAN_PHIEN thật → `KHONGCUA`); bản này chỉ xoá nốt câu `vi:` còn tự
xưng "do đúng một trợ lý sở hữu" — một lời khai không kiểm được.

### Lỗ MEDIUM cùng đợt

- **`kien-truc-thi-giac` cổng ADN** dò biên bằng space/comma/period —
  gói dấu hiệu vào dấu câu khác là lọt. Nay biên Unicode
  `(?<![\p{L}\p{N}])…(?![\p{L}\p{N}])`. Và roster người xem thiếu
  `DOITAC` (5→6).
- **`tai-chinh-ceo` S1 tiền mặt** không trừ `hoanTien`·`hoaHongTra` đã
  chi ra — thổi số dư. Nay trừ, và cửa sổ 3 tháng gồm cả hai khoản ra.
- **`ngan-hang` đối chiếu** chỉ soi tiền VÀO; thêm nhánh tiền RA
  (raChuaKhop·chiChuaKhop) — chi không chứng từ là chỗ mất tiền.
- **`cuu-he` soatCuuHe** thiếu cổng vai → thêm R01–R02.
- **`coach-kh`** nhận cả R13–R15 (khách) vào cổng coach → siết R01–R12.
- **`noi-dung-tiep-thi` QC1** dò `'số 1'` trần bắt oan "số 1 trong danh
  sách" → đổi sang cụm ngữ cảnh ("số 1 việt nam"·"số 1 thế giới"…).

### Phép đo HÀNH VI — mục 24, cả sáu ĐÃ PHÁ THỬ

Mỗi lỗ HIGH một phép đo gọi THẬT vào cửa qua Worker thật (không đọc mã
đoán), và mỗi cái đã bị phá thử để xem có đỏ đúng chỗ: gỡ cổng A→R13 ký
được; gỡ B→khách thấy camNang; gỡ canonical C1/C2→tự cấp qua email
thành công; gỡ cổng D→D4 vẫn đọc sau khi rút; gỡ DELETE E→conLai=1 và
thẻ vẫn đọc được. **Test tự-cấp CỐ Ý dùng tài khoản email≠username** —
nếu dùng tài khoản thường (email=username) thì phép đo dừng ở cổng thô,
KHÔNG chạm cổng canonical, và bản sửa 9.99.112 sẽ không được canh. Đúng
lỗi "V5 chỉ thử Nguyễn, cổng để lọt họ Đ" ở 9.99.111: **một phép kiểm
phải chạm ĐÚNG chỗ nó canh, không chạm chỗ dễ hơn.**

### Sửa xong stale self-claim

- `data.qa.js` khai "16/50 ô máy đo" từ 9.99.81, mà C3·C5·C9 thêm mười
  hai ô (9.99.82) chưa sync → thật là **28/50** (đếm được:
  `grep -cE "m:[0-9]+,mayDo:'"` = 28; `grep -c 'mayDo:'` trần ra 30 vì
  đếm cả chú giải+chuỗi). Nay prose khai 28/50·22/50 kèm cách đếm ĐÚNG.
- `kiem-tra.js` header ghi "759 phép đo" — thật là **1045** (con số
  cuối mỗi lượt là con số thật).

Ba bộ kiểm xanh sau rebuild: kiem-tra 1045 · ra-soat sạch ·
do-khung-man 1660 (4 khổ) · thu-worker toàn bộ đạt (thêm 14 phép đo
hành vi mục 24). soi-doi-kho: 0 biến mất.

## SOI ĐỐI KHÁNG ĐỢT 3 — SÁU TRỢ LÝ, VỊ TRÍ NHÀ TOÁN HỌC MUA 10 TRIỆU USD (9.99.113)

Chủ hệ: *"thanh tra đợt 3 nghiêm ngặt gấp 100 lần… làm việc ở vị trí
khách hàng khó tính nhất là một nhà toán học quốc tế trước khi mua bản
quyền 10 triệu USD."* Sáu trợ lý thanh tra độc lập soi sáu bề mặt hậu quả
cao nhất, mỗi trợ lý CHẠY THẬT (không đọc mã đoán), chỉ báo lỗi ĐÃ XÁC
MINH. Kết: **flagship (tài chính · điều phối · ba chuỗi duyệt · tự nâng
cấp · cổng tự cấp) đều THẬT, phá-thử-đỏ-được** — nhưng còn hai lỗ
CRITICAL ở đúng cổng ai cũng tin đã đúng, cộng một chuỗi lỗ HIGH/MEDIUM.
Mỗi cái nay có phép đo phá-thử-được.

### Hai CRITICAL — cùng ở soatRaNgoai, cổng DUY NHẤT chặn dữ liệu ra ngoài

Bộ dò ẩn danh (Điều 13 · Luật 91) bị né bằng hai phép biến hình vô hình,
chứng minh bằng chạy regex thật:
- **Ký tự vô hình** (zero-width U+200B–200D · U+2060 · BOM · RTL-override ·
  U+034F) chèn giữa tên/số → `\s`,`\d` không thấy → "Ng⁠uyễn Thị Lan"
  ra `sach:true`, đi thẳng bộ tạo ảnh nước ngoài, người nhận đọc tên bình
  thường. Chữa: **bỏ hẳn `\p{Cf}`+U+034F** trước khi dò.
- **Chữ số toàn-rộng** `０-９` không khớp `\d`, NFC không gộp → số điện
  thoại/CCCD trẻ con lọt. Chữa: chuẩn hoá **NFKC** (không NFC).

Và một lỗ HIGH cùng chỗ: **họ hiếm** (Trịnh · Đào · Vương · Tống…) ngoài
danh sách ~25 họ, không kèm dấu hiệu trẻ, lọt AD-TEN. Mở rộng HO_VIET.

**Cái bẫy khi sửa, ghi lại:** thêm `\s*` cho zero-width-separator +
giữ cờ `i` làm `\p{Lu}` khớp CẢ chữ thường → "hứa điểm", "lên" (họ mới +
từ thường liền sau) bị bắt oan, và bộ thử SẬP. Sửa đúng: khớp HỌ **dạng
viết hoa** (tên thật Titlecase; cụm thường thì không), **bỏ cờ i**, và
quét trên HAI bản — bản-bỏ-vô-hình bắt vô hình GIỮA từ, bản-thay-cách bắt
vô hình GIỮA hai từ. 0 lọt · 0 bắt oan trên "Hà Nội"·"Bảng Lương"·"Con
đường"·tiêu đề Title-Case.

### Bốn HIGH ở cổng cũ

- **`ngan-hang` đối chiếu chiều RA** so `ngayChi` (ISO đầy đủ) với bound
  đã cắt còn ngày → **rớt mọi khoản chi ngày cuối kỳ**, và một khoản bịa
  đề cuối tháng né đúng cửa "tiền ra không chứng từ". Chữa: cắt cả hai vế
  về ngày (`substr(…,1,10)` hai phía).
- **`kien-truc-noi-dung` dùng `hoSo.username`** (16 chỗ) — phiên thật là
  `hoSo.u`, nên **cả hệ duyệt nội dung năm cổng CHẾT trong sản xuất**
  (capQuyenNoiDung 500, kyBai từ chối biên tập có quyền thật, audit ghi
  tên trống), cổng tự-cấp là mã chết, và **bộ thử XANH GIẢ** vì gọi cửa
  bằng `ai={username:…}` — hình phiên khách không bao giờ gửi. Chữa:
  `hoSo.username`→`hoSo.u` + tự-cấp so định danh chính tắc (`layUid`) +
  quyenKy tra không-phân-hoa-thường + **sửa bộ thử dùng `u:` (hình phiên
  thật)** để nó ĐỎ được khi lỗi quay lại (phá thử xác nhận).
- **`con-duong` mốc SVG `role=button` chết bàn phím** — focus được, đọc
  ra "button", mà Enter/Space không kích onclick trên thẻ phi-gốc. Trên
  đúng màn 3D. Chữa: `data-moc` uỷ nhiệm + polyfill Enter/Space cho mọi
  role=button phi-gốc ở app.js (phát click nổi bọt).
- (cùng lớp `hoSo.username`/`.vai`/`maKhachHang` 9.99.55·62·75 — lần thứ năm)

### Ba MEDIUM

- **S7 tự giới thiệu luôn 0%** vì `boTro` không có trong SELECT — một
  phép đo hỏng đọc ra như 0% thật. Chữa: thêm `boTro`.
- **`theVungManh` ×4 đọc "dòng mới nhất" thiếu rowid tiebreak** (đợt
  9.99.112 bỏ sót) → cùng mili-giây phục vụ thẻ CŨ (nỗi sợ trẻ đã thay).
  Chữa: `, rowid DESC`.
- **onclick dựng từ dữ liệu đã `h()`** (sai ngữ cảnh JS-string) ở
  con-duong đã chuyển data-*; bốn màn còn lại (hom-nay·studio·nhan-vat·
  bang-gia) dữ liệu ASCII tĩnh nên chưa khai thác được — mục chờ, không
  phải lỗ.

### Ba RĂNG TĨNH mới — mục 113, phá-thử-đỏ-được

- **113a** mọi đọc `(ghiLuc|lapLuc) DESC LIMIT 1` trong `may-chu/` phải
  kèm `rowid` (bắt được theVungManh + chặn tái phạm). Bẫy khi viết:
  `LIMIT 1` dính `LIMIT 100` → chốt `(?![0-9])`; và một đọc ĐÃ vá có
  ", rowid" chen giữa nên reFold không khớp — đếm thẳng reFold LÀ đếm chỗ
  thiếu, không trừ.
- **113b** `soatRaNgoai` phải có `\p{Cf}` strip + `NFKC`.
- **113c** mốc Con đường qua `data-moc` (không onclick) + app.js có
  polyfill role=button.

### Điều đáng giữ nhất từ đợt 3

> **Bề mặt đắt nhất là cổng cũ ai cũng tin đã đúng.** Cả hai CRITICAL ở
> `soatRaNgoai` "đã có từ 9.99.62"; lỗ hệ-duyệt-nội-dung ở `hoSo.username`
> mà bộ thử XANH GIẢ suốt vì gọi cửa bằng hình phiên giả. Một phép đo chỉ
> thật khi nó đi qua ĐÚNG đường sản xuất (kiemPhien → hoSo.u), không phải
> một hình phiên dựng cho vừa bài thử.

Xanh sau rebuild: kiem-tra (thêm mục 113) · ra-soat sạch · do-khung-man
(4 khổ) · thu-worker toàn bộ đạt (thêm mục 24 evasions + mục 25 tài
chính). soi-doi-kho: 0 biến mất.

## SOI ĐỐI KHÁNG ĐỢT 4 — BẢY TRỢ LÝ $500M, BỊT TÁM LỖ ĐÃ XÁC MINH (9.99.114)

Bảy tổ thanh tra độc lập cấp $500M (bộ não · 100 trợ lý · tài chính ·
dữ liệu-pháp lý · chất lượng sản phẩm · kiến trúc · giao diện) chất vấn
toàn hệ, mỗi lỗ CHẠY THẬT rồi mới báo. Bản này bịt **tám lỗ đã xác
minh**, mỗi cái kèm phép đo hành vi ĐÃ PHÁ THỬ. Ba tổ độc lập chỉ CÙNG
một lỗ nặng nhất — cổng ẩn danh Điều 13.

### 1 · CRITICAL — cổng ẩn danh Điều 13 lọt tên trẻ SÁU cách (ba tổ cùng bắt)

`soatRaNgoai` bản 9.99.113 mới vá `\b`+zero-width+toàn-rộng, nhưng CHẠY
THẬT vẫn lọt: (a) tên **TOÀN HOA** kèm dấu hiệu trẻ ("bé tên NGUYỄN VĂN
AN" — bản cũ chỉ bắt Titlecase); (b) **họ dễ trùng** bỏ khỏi HO_VIET
("Lương Gia Bảo hay khóc"); (c) **homoglyph** Cyrillic/Greek ("Нguyễn",
NFKC không gộp); (d) **dấu tổ hợp chèn** ("Nguyễn"+U+0301); (e) **tên
gọi không họ** + trạng thái trẻ ("Minh Anh sợ"). Mỗi câu là một tên trẻ
đi thẳng ra bộ tạo ảnh nước ngoài — Điều 13 **bất khả sửa** + Luật 91.

Sáu lưới mới: HO_HIEM + **đệm-gate** (chặn "Hà Bảo Anh", qua "Hà Nội
mùa" vì Nội không phải đệm — chọn dấu hiệu, không danh sách trừ);
`capHo()` đưa dạng TOÀN HOA vào alternation; **gộp confusable** +
**AD-TRON** (token trộn hai bảng chữ — lưới chung, không cần biết trước
chữ nào); **bản bỏ dấu + đệm** bắt dấu chèn và tên La-tinh hoá; AD-TREVE
(tên + dấu hiệu trẻ quan sát được).

> **V5 chỉ thử "Nguyễn"+"Đặng" (cả hai trong danh sách) nên XANH suốt
> nhiều bản trên đúng lỗ nó canh.** Nay V5 thử đủ sáu cách; mục 113b đòi
> `CHU_TRON`+`AD-TRON`+`boDauMark`+`NT_TEN`. Phá thử: về Titlecase-only
> → nhiều câu lọt, V5 và mục 24 đỏ.

### 2 · CRITICAL — IDOR: phụ huynh thao tác được dữ liệu con NGƯỜI KHÁC

`ghiDongY`/`docDongY`/`yeuCauXoaDuLieu` nhận `maNha` từ THÂN yêu cầu, không
đối chiếu `hoSo.maKhachHang`. Một phụ huynh gõ mã nhà khác là **forge/rút
đồng ý** hoặc **mở đồng hồ xoá** cho con người lạ. Gốc: phiên KHÔNG mang
`maKhachHang` (chỉ có ở đáp ứng đăng nhập). Nay `kiemPhien` thêm
`maKhachHang`+`portal`; `nhaCuaMinh()` siết phụ huynh về đúng nhà mình,
nhân viên R01–R12 giữ phạm vi rộng. Phá thử: gỡ `nhaCuaMinh` → mục 24 đỏ.

### 3 · HIGH — xoá dữ liệu bỏ sót TÊN THẬT ở `students`

`danhDauXoa` xoá theVungManh/hoSoSongSinh/soCham nhưng **`students.hoTen`
(tên thật con) sống sót**. Nay gỡ PII (hoTen·lop·tinh) + đặt `deletedAt`
theo `phuHuynhId` của nhà ấy, và đếm tên còn sót vào `conLai` (thành phép
đo). Phá thử: bỏ khối UPDATE students → E2 đỏ.

### 4–8 · Tài chính (tổ $500M chạy thật trên node:sqlite)

- **heSoCua** thiếu rowid tiebreak → lương resolve tùy ý cùng mốc. Thêm
  `rowid DESC`; mục 113a canh thêm `datLuc`/`ngay`.
- **soCham** `ORDER BY ngay DESC` (ngày-thô) lái đèn đỏ tùy ý → `+rowid`.
- **toiUuHoa** trả HẠT GIỐNG phạm ràng buộc CỨNG là `ok:true` (kế hoạch
  cần 12 người dạy) → kiểm `tot.phamCung` trước khi trả, nói KHÔNG GIẢI
  ĐƯỢC. Phá thử: bỏ kiểm → đỏ.
- **S3 doanh thu tháng** group UTC, sổ dùng giờ VN → CEO và bao-cao lệch
  bảy tiếng ở mép tháng. `datetime(ghiLuc,'+7 hours')`. Phá thử: về UTC →
  chênh 7tr thành 9tr, đỏ.
- **Đối chiếu ngân hàng chiều RA** chỉ union chiPhi → hoàn/hoa hồng bịa
  vô hình với phép kiểm ngoài duy nhất. Union cả ba kênh (idChiPhi dùng
  chung). Phá thử: bỏ hai nhánh → khoản bịa biến mất.

### Việc lớn còn để lại (mandatory upgrade, chưa dựng trong bản này)

Các tổ nêu, và đây là nợ kiến trúc THẬT, ghi thẳng để không ai tưởng đã
xong: **db.batch (giao dịch nguyên tử)** cho cứu-hệ/xoá/mọi cửa nhiều-ghi
(recovery + erasure half-apply được); **khoá ngoại + bộ dời lược đồ**
(`wrangler d1 migrations`); **xoay khoá `GITA_KHOA_KHO`** (mất là mất
1.131 kho); **tiền số nguyên đồng** (REAL trôi + so bằng nhau rớt khớp);
**thang chữ ký theo SỐ TIỀN cho hoàn/hoa hồng/lương** (nay 1 chữ ký so
với 3 của chi trực tiếp cùng cỡ); **ghi đồng ý lúc đăng ký** (ba ô hiện
bị bỏ); **cửa xuất dữ liệu (Art 15/20)** · **purge theo hạn lưu** ·
**HMAC sổ audit** · **mã hoá cột con nhạy cảm**; và bề mặt khách:
**153 ô nhập thiếu nhãn đọc được** · **đường tiếng Anh mới phủ ~51 chuỗi
vỏ** · **toast thiếu aria-live**. Đây là các mục cấp-tổ-chức, mỗi cái cần
bộ phá thử riêng — không one-shot được mà không rủi ro cổng xanh.

Xanh sau rebuild: kiem-tra 1048 · ra-soat sạch · do-khung-man 1660 (4 khổ)
· thu-worker toàn bộ đạt (mục 24 thêm 6 lớp né ẩn danh + IDOR + E2 xoá
students; mục tài chính thêm toiUuHoa/S3/đối-chiếu-ba-kênh). soi-doi-kho:
0 biến mất.

## DEPLOY WEB — SỬA LỖI THẬT: WORKFLOW QUÊN gita-app.js (9.99.115)

`index.html` nạp thẳng `<script src="gita-app.js">` (bản gộp 1,4MB của
src/), nhưng `trang-web.yml` chỉ copy `src/` mà **không copy gita-app.js**
— nên trang đưa lên GitHub Pages sẽ TRẮNG (gita-app.js 404, `G` không tồn
tại). Lỗi chưa lộ vì kho **chưa từng đẩy lên** nên workflow chưa chạy lần
nào. Nay copy gita-app.js vào `trang/`, và thêm nó vào `paths` kích hoạt.

> **Một workflow chưa chạy lần nào là một workflow chưa được kiểm.** Chỗ
> hỏng chỉ lộ khi có người thật đẩy và mở trang — nên phải đọc `index.html`
> xem nó NẠP gì, không tin danh sách copy là đủ.

## GIAO DỊCH NGUYÊN TỬ — db.batch CHO CỨU HỆ · XOÁ DỮ LIỆU (9.99.116)

Đợt thanh tra $500M (9.99.114) xếp **#1 nợ kiến trúc**: các cửa nhiều-ghi
chạy 4+N câu `.run()` RỜI NHAU, không giao dịch. Worker hết giờ hay sập
GIỮA CHỪNG thì ghi nửa vời — và đúng hai cửa nguy nhất:

- **Xoá dữ liệu con** (`danhDauXoa` · phap-ly-rui-ro.js): xoá 3 bảng con +
  gỡ PII `students` + đóng dấu `yeuCauXoa`. Nửa vời = PII con còn sống mà
  đã đóng dấu "đã xoá" — một *lời nói dối mang dấu hệ thống*, phạm quyền
  xoá Luật 91 với đúng loại dữ liệu bảo vệ đặc biệt.
- **Cứu hệ** (`truyHoiHe` · cuu-he.js): đặt lại mật khẩu R01 + đá mọi phiên
  + đánh dấu token + ghi sổ. Nửa vời = token đánh dấu đã dùng trong khi mật
  khẩu CHƯA đổi → Super Admin thật **mất luôn đường vào**, đúng lúc gay
  nhất. `dongBangHe` và `moBangHe` cùng lớp.

Kho dùng `db.prepare` 394 chỗ, **chưa hề dùng `db.batch`** — mà D1 có
`db.batch([...câu đã .bind()])` chạy nguyên tử (all-or-nothing). Nay bốn
cửa trên gom các câu ghi vào MỘT `db.batch`.

**Băm mật khẩu tính TRƯỚC (async) rồi mới dựng mảng** — batch nhận câu đã
`.bind()` sẵn, không nhận `await` giữa chừng.

### Shim bộ thử phải có batch — và thêm nó làm shim GIỐNG bản thật hơn

`thu-worker.js` bọc node:sqlite bằng `dungD1`. Thêm `batch` (BEGIN → chạy
từng câu → COMMIT; một câu ném thì ROLLBACK) **không** làm bộ thử lệch bản
thật: `batch` là method D1 THẬT, có nó thì bộ thử canh đúng hành vi nguyên
tử. Không có nó thì mọi cửa phải tự viết BEGIN/COMMIT tay — đúng lỗ nửa-
chừng đợt thanh tra nêu.

**Phá thử (mục 26 thu-worker):** batch có câu HỎNG ở giữa → phải ROLLBACK
sạch câu tốt đứng trước (`còn 0 dòng`). Nếu batch không nguyên tử thì câu
tốt đã commit → `còn 1 dòng` → đỏ. Một phép kiểm về giao dịch phải chứng
minh được nó THẬT SỰ lăn ngược.

### Ba nơi chạy, chỉ hai nơi cần batch

Worker thật (`env.CSDL` = D1, có sẵn `.batch`) và bộ thử (đã thêm). Bản
desktop (`may-chu.js`) chỉ phục vụ tệp tĩnh, **không chạy cửa backend**,
nên không đụng. `kiem-tra.js` mục 104 kiểm cứu hệ bằng **soi tĩnh** (đọc
mã + đọc `G.CUU_*`), không chạy cửa — restructure giữ nguyên `ghiSoDenNoiBo`
nên các check tĩnh (ba bước ghi sổ băm) vẫn khớp.

## THANG CHỮ KÝ THEO SỐ TIỀN — RÚT TIỀN (9.99.117)

Đợt thanh tra $500M nêu: **hoàn tiền · hoa hồng · lương** là tiền RA khỏi
Học viện, nhưng ba cửa duyệt chúng (`duyetHoan` · `traHoaHong` · `chotLuong`)
chỉ đòi **R01–R03 BẤT KỂ số tiền**. Một Giám đốc R03 duyệt một khoản hoàn
90 triệu bằng ĐÚNG MỘT chữ ký — trong khi **chi trực tiếp** 90 triệu đòi
Super Admin (mốc C5, hai chữ ký). Đường rút tiền lớn không ai đủ thẩm quyền
nhìn, và `doiSoatLuong`/đối chiếu không bắt được vì số tiền KHỚP sổ.

**Đóng lỗ bằng cách DÙNG LẠI đúng thang `MOC_CHU_KY` đã chốt — KHÔNG đặt
ngưỡng mới.** `chi-tieu.js` xuất `capDuyetTheoTien(soTien)`: cấp người duyệt
một khoản rút tính theo chính số tiền của nó (như một mốc chu kỳ). Dưới
10tr giữ R01–R03; từ 10tr → R03, 20tr → R02, 80tr → R01. Ba cửa so
`BAC[hoSo.role] <= bac`.

Đây là Vùng Đỏ (ngưỡng tiền là quyết định chủ hệ), nhưng **trỏ vào thang
đã chốt** thì không phải đặt ngưỡng mới — cùng lối `fin_view` dùng lại câu
trả lời sẵn có (9.99.67).

**Hai chỗ cố ý KHÔNG chặn cứng:**
- `duyetHoan` chỉ áp gate khi **DUYỆT** — từ chối thì cấp nào cũng được
  (chặn tiền ra là an toàn).
- `chotLuong` cho `quanLyPhong` (kế toán trưởng) chốt dù lv>3 — gate rank
  chỉ áp cho người KHÔNG phải quản lý phòng, để không chặn nhầm đường uỷ
  nhiệm hợp lệ. Phần người chốt gõ tay (`ghiNhan`) đã bị trần `tranKpi`
  riêng (9.99.111), nên phần rủi ro nhất của lương lớn đã được canh.

**Phá thử (mục 25c thu-worker):** R03 duyệt hoàn 90tr → `CANCAPCAOHON`;
R01 duyệt 90tr → được; R03 duyệt 2tr → được (gate KHÔNG bắt oan khoản nhỏ).
Cả ba đỏ được đúng chỗ nếu gỡ gate.

**Còn để lại (chu kỳ sau):** `chotLuong` ghi bảng lương RỒI ghi khoản chi
bằng HAI câu rời — chú giải cũ (dòng ~504) nói *"D1 không gói hai lượt ghi
vào một giao dịch"*, nay SAI vì đã có `db.batch` (9.99.116). Nguyên tử hoá
hai ghi ấy đổi một triết lý thất-bại đã cố ý thiết kế (`doiSoatLuong` đối
chiếu chỗ lệch), nên làm riêng, thận trọng — không nhồi chung.

## GHI ĐỒNG Ý LÚC ĐĂNG KÝ — LUẬT 91 (9.99.118)

Đợt thanh tra nêu: ba ô đồng ý ở màn đăng ký (điều khoản · dữ liệu gia đình
· dữ liệu con) được kiểm CLIENT-SIDE nhưng **máy chủ bỏ qua hoàn toàn** —
`dangKy` không đòi, không lưu. Hai hệ quả: một lượt gọi thẳng `dangKy` (không
qua màn) đăng ký được mà không đồng ý gì; và **không có dòng nào chứng minh
nhà đã đồng ý** lúc tranh chấp — đúng nghĩa vụ Luật 91 việc số 2.

**Hai cổng, không schema mới:**
- `dangKy` đòi hai ô BẮT BUỘC ở máy chủ (`dyDieuKhoan` · `dyDuLieuGiaDinh`)
  — client-side là gợi ý, cổng thật ở máy chủ. Ô con (`dyDuLieuCon`) tuỳ, đã
  có cổng riêng ở điểm tạo dữ liệu con (9.99.70), không đòi lại.
- `kichHoat` GHI hai đồng ý vào `dongYDuLieu` cho maNha=maKH — cùng bảng,
  cùng luật với cổng ký/rút (9.99.70), nên `docDongY` đọc lại được. Ghi bằng
  `db.batch` cùng lúc đóng dấu `dangKyCho='xong'`: nguyên tử (9.99.116).

**Vì sao ghi ở kichHoat, không ở dangKy:** maKhachHang chỉ ra đời lúc
kichHoat. Mang cờ đồng ý từ dangKy sang kichHoat cần cột mới ở `dangKyCho`
→ cần di dời lược đồ (kho chưa có cơ chế). Hai ô bắt buộc đã bị dangKy chặn
ở máy chủ, nên tài khoản tới được kichHoat là tài khoản ĐÃ đồng ý — ghi
thành fact với mốc kích hoạt là faithful. Giá trị `o` chuẩn
(`O_DONGY_BAT_BUOC = ['dieuKhoan','duLieuGiaDinh']`) import từ
`phap-ly-rui-ro.js`, không chép — khoá form mang tiền tố `dy`, `o` chuẩn bỏ
tiền tố.

**Phá thử (thu-worker):** thiếu `dyDuLieuGiaDinh` → `THIEUDONGY` (gỡ cổng thì
đăng ký được mà không đồng ý); sau kichHoat, `dongYDuLieu` có đúng hai dòng
`dieuKhoan` · `duLieuGiaDinh` (trước 9.99.118 KHÔNG ghi gì). HOSO_MOI của bộ
thử thêm hai cờ đồng ý để luồng đăng ký hợp lệ vẫn qua.

## CHỐT LƯƠNG NGUYÊN TỬ — TIỀN ĐỀ CŨ ĐÃ SAI (9.99.119)

`chotLuong` ghi dòng `bangLuong` RỒI ghi khoản `chiPhi` bằng HAI câu rời, và
chú giải (từ trước) tự bào chữa: *"D1 không gói hai lượt ghi vào một giao
dịch, nên phải chọn chỗ hỏng"*. Bản đầu tô-lê-rát lỗi `chiPhi` (bắt
`chiHong`, trả `chuaVaoSoChi`) và dựa `doiSoatLuong` vá sau.

**Tiền đề ấy nay SAI:** `db.batch` (9.99.116) gói được hai ghi. Hai câu đi
CÙNG một giao dịch — hoặc cả dòng lương lẫn khoản chi, hoặc không gì. `chiPhi`
hỏng → cả batch lăn ngược → trả `GHIHONG`, không để lại dòng lương mồ côi.

**`doiSoatLuong` GIỮ NGUYÊN, đổi vai:** từ "vá chỗ non-atomic" thành lớp
phòng thủ cho lệch đến từ nguồn KHÁC (gõ tay, `huyChi`, dời lược đồ). Bộ thử
của nó cắm lệch TRỰC TIẾP (INSERT/DELETE chiPhi tay), không qua `chotLuong`,
nên đổi này không phá test nào; cơ chế atomic đã có phá thử ở mục 26.

Lớp lỗi "chú giải không khớp mã": một tiền đề đúng lúc viết, sai từ khi có
db.batch — một workaround dựng quanh một giới hạn đã biến mất là chỗ nợ nằm im.

## QUYỀN TRUY CẬP — XUẤT DỮ LIỆU GIA ĐÌNH (9.99.120)

Bộ ba Luật 91 nay đủ: **đồng ý** (9.99.118) · **xoá** (9.99.112/116) · và
**truy cập/xuất** (bản này). Màn `phap-ly` ("Bảy quyền của nhà mình") đã ghi
"đọc" là một trong bảy quyền, nhưng tới 9.99.119 nó chỉ là một DÒNG CHỮ —
không cửa nào làm nó thật.

Cửa `xuatDuLieuNha` (phap-ly-rui-ro.js) gom toàn bộ dữ liệu hệ giữ về một
nhà — tài khoản · con · thẻ vùng mạnh · hồ sơ song sinh · sổ chăm · lịch sử
đồng ý · yêu cầu xoá · phiếu thu · hoàn tiền — và trả về JSON.

**Ba luật:**
- **`nhaCuaMinh`** (9.99.114): chỉ CHA MẸ của chính nhà, hoặc R01–R12 xử lý
  yêu cầu. Cha mẹ bỏ trống `maNha` → lấy nhà của PHIÊN; không mở được nhà
  người khác dù truyền mã lạ (phá thử: `GITA-0002` → `NOPERM_NHA`).
- **Không xuất bí mật**: `pwHash`/`pwSalt` bị loại khỏi phần tài khoản
  (SELECT cột cụ thể). Phá thử dò `/pwHash|pwSalt/` trên bản xuất → phải
  SẠCH. Một bản "toàn bộ dữ liệu" gồm băm mật khẩu là một chỗ rò.
- **Ghi nhật ký** mỗi lượt (Luật 91 Điều 6: ai truy cập nhà nào) — phá thử
  đếm `audit` có dòng `PL_XUAT_DULIEU`.

**Giao diện = quyền ĐỌC, không phải lượt TẢI:** màn `phap-ly` thêm nút "Đọc
dữ liệu nhà mình" gọi `G.goiMayChu('xuatDuLieuNha')` (KHÔNG fetch thẳng) và
hiện tóm tắt + lịch sử đồng ý TẠI CHỖ, mọi ô qua `h()`. Không tạo tệp tải về
— một quyền đọc khác một lượt tải, nên không đụng luật cấm khách tải dữ liệu.

## NHÃN A11Y CHO Ô NHẬP — MỘT LỚP BÙ, KHÔNG 150 CHỖ VÁ (9.99.121)

Đợt thanh tra nêu ~153 ô nhập thiếu tên đọc được cho trình đọc màn hình:
người khiếm thị nghe "ô nhập, không tên". Dò ra: kho **không có hàm dựng ô
chung** — 162 `<input>/<textarea>/<select>` gõ thẳng khắp ~20 màn (danh-gia ·
tam-nhin · thu-vien · tro-ly · coach-kh · kien-truc-thi-giac …). Vá từng ô là
150 chỗ dễ sót và dễ trôi lại.

**Đường đúng: một lớp bù chạy sau MỖI render** — `G.a11yNhan(main)` trong
`render()` (app.js). Mỗi ô chưa có tên đọc được được thêm `aria-label` theo
chuỗi dự phòng: đã có tên (aria/label/title/bọc label) → giữ; **placeholder**
→ **nhãn đứng ngay trước ô** → **generic theo loại**. KHÔNG xoá placeholder —
chỉ THÊM aria-label, vì trình đọc màn cần TÊN ổn định còn placeholder biến mất
khi gõ. Một chỗ, phủ mọi ô hiện có LẪN ô viết sau — đúng bài học "không dựng
bản thứ hai": vá ở nguồn render, không rải 150 bản.

**Đo được + chống tái phạm:** `do-khung-man` thêm phép đo a11y — quét mọi ô
trên từng màn × khổ, đỏ nếu thấy ô không tên đọc được (placeholder KHÔNG
tính). Phá thử: tắt `G.a11yNhan` → đỏ ~20 màn; bật → sạch (1660 lượt đo). Một
lỗ a11y giờ là một dòng đỏ, không phải một phát hiện thanh tra sáu tháng/lần.

## SOI ĐỐI KHÁNG BỘ NÃO — HAI LỖ RÒ TÊN TRẺ Ở soatRaNgoai (9.99.122)

Tổ soi $500M vào bộ não + 100 trợ lý: `dieuPhoiTroLy`, `tuHoanThienTroLy`,
cổng vai, thứ tự gate đều LÀNH (điều phối đã hết là áp-phích từ 9.99.110).
Nhưng `soatRaNgoai` — cổng DUY NHẤT chặn dữ liệu người rời hệ (Điều 13 bất
khả sửa) — còn HAI lỗ, xác minh bằng CHẠY THẬT:

**1. CRITICAL — bộ dò tên MÙ CHỮ THƯỜNG.** Mọi lưới AD-TEN đòi chữ hoa đầu
(`NT_TEN=\p{Lu}…`, `capHo` Titlecase/HOA). Tên gõ THƯỜNG hoặc tự-viết-hoa-
một-chữ lọt sạch: "con nguyễn văn an", "Nguyễn văn an, 8 tuổi", "mẹ nguyễn
thị hoa", "Họ tên con: nguyễn văn an" → `sach:true` → tên trẻ ra thẳng bộ
tạo ảnh nước ngoài. Gõ thường là cách gõ THƯỜNG NHẤT trên điện thoại. Cùng
bẫy đã gỡ cho HỌ ở 9.99.111 (V5 chỉ thử "Nguyễn"), nay tái ở HOA/THƯỜNG —
V5 chỉ thử tên viết hoa nên câm.

Vá: lưới **AD-TENTHUONG** — danh sách họ so KHÔNG phân biệt hoa/thường (cờ
i, KHÔNG dùng `\p{Lu}` nên bẫy i→\p{Lu} của 9.99.113 không áp), buộc một
**NEO NGƯỜI**: (A) dấu người/trẻ đứng TRƯỚC họ (`con·bé·mẹ·chị…` + SEP cho
cả "con: nguyễn"), hoặc (B) họ+tên rồi dấu hiệu trẻ đứng SAU (tuổi·lớp·
trạng thái). Neo người giữ "trần nhà"·"lê la"·"Hà Nội" (không neo) vẫn qua
— "ngờ là đủ để chặn" đúng chiều mà không bắt oan brief lành.

**2. MEDIUM — số điện thoại có ngoặc.** Lớp run `[\d\s.\-]` loại `()`, nên
"(090) 123 4567" lọt. Thêm `()` vào lớp.

**Phá thử (thu-worker mục 24):** bốn câu tên-thường + số ngoặc phải CHẶN
(0/4 lọt); brief lành "trần nhà·hồ nước·lê la" phải QUA. Tắt AD-TENTHUONG
→ bốn lọt, đỏ. Bài học lặp: một bộ dò chữ chỉ kiểm được biến thể nó ĐÃ
THỬ — V5 phải thử CẢ chữ thường, không chỉ chữ hoa.

## Bộ tối ưu cấu hình gói (9.99.68)

Theo tệp `gita365-toi-uu-goi.ts` của chủ hệ. Máy chủ
`may-chu/gia-goi.js` (bộ **đánh giá**) và `may-chu/toi-uu-goi.js` (bộ
**tìm**), kho `data.goi-toi-uu.js` (9 kho), bộ kiểm **mục 85**, chín
phép đo ở `thu-worker.js`.

### Hai chỗ phải nói trước

1. Tệp gốc là **TypeScript**, mà kho không có bước biên dịch — và nó
   `import` từ `gita365-gia-goi` **không tồn tại trong kho**. Nên bộ
   đánh giá được dựng lại từ đầu bằng JS thuần.
2. **Mô hình chi phí là con số của chủ hệ.** Kho không có, và máy
   không đoán. `TU_CHIPHI_KHUNG` **rỗng** và khai ở `RONG_CO_Y`;
   `kiemThamSo` chặn và nói thiếu ô nào.

### Hàm mục tiêu là Lời mở đầu Hiến pháp viết thành mã

| Bậc | Điều kiện | Tối đa hoá |
|---|---|---|
| ① | chưa đạt mục tiêu lợi nhuận | **lợi nhuận** |
| ② | đã đạt | **số gia đình**, và **hạ giá** |

Đủ tiền rồi thì phục vụ thêm người, không lấy thêm tiền của cùng số
người. Mục 85 đo bằng **hành vi**, không đọc lời khai: dựng hai cấu
hình cùng đạt mục tiêu và đòi cái **rẻ hơn thắng dù lãi ít hơn**, rồi
nâng mục tiêu để hai bậc đảo chiều và đòi cái **lãi hơn** thắng.

**Hệ quả phải nói ra:** bậc hai **bỏ phần lợi nhuận vượt mục tiêu** ra
khỏi điểm số, nên bộ tối ưu sẽ vui vẻ đánh đổi mười tám tỷ lấy vài
trăm gia đình. Đó đúng là điều được yêu cầu — và nó phải được nói ra
chứ không để người đọc tự phát hiện. Lợi nhuận chỉ còn vai trò **phá
hoà** ở trọng số rất nhỏ, để bộ tối ưu không chốt đúng một cấu hình
nằm sát mép mục tiêu không còn đệm nào.

### Bốn chỗ HỎNG THẬT trong tệp gốc, đã vá

| Mã | Hỏng thế nào |
|---|---|
| V1 | `lamTronGia` **không idempotent** — `f(300.000)=290.000` rồi `f(290.000)=280.000` |
| V2 | `f(999.999)=990.000` nhưng `f(1.000.000)=900.000` |
| V3 | giá "đuôi 9" chỉ áp **dưới mười triệu** |
| V4 | `giaiQuyMo` chia đôi mà **không kiểm điều kiện chia đôi** |

**V1 là chỗ nguy nhất.** `BUOC_GIA` có `1.0` để nghĩa *"không đổi"*, và
cái chặn `giaMoi === giaCu` **không nổ** vì hai số khác nhau. Mỗi vòng
leo đồi hạ **mọi giá một bước mà không phải vì điểm số** — mười hai
vòng là 300.000 xuống 180.000.

**V4 câm đúng ở chỗ nguy hiểm:** phép chia đôi chỉ đúng khi lợi nhuận
tăng theo quy mô. Có gói biên gộp âm thì càng đông càng lỗ, và phép
chia đôi **vẫn trả về một con số trông y hệt một con số đúng**. Nay nó
kiểm ba điểm mẫu trước, và không thoả thì **nói là không giải được**.

**Cách vá V1–V3 là TÁCH HAI VIỆC:** `lamTron` là một phép kỹ thuật và
nó idempotent; `giaDep` (đuôi 9) là một **quyết định giá** và nó chạy
**đúng một lần lúc trình ra**, không chạy trong vòng lặp.

**Và bản vá đầu của tôi sai đúng chỗ V2 vừa vá:** `giaDep(1.000.000)`
ra 900.000, rồi lần gọi sau 900.000 thuộc bậc mười nghìn nên hạ tiếp
còn 890.000. Một giá đứng ngay **đáy bậc** thì không có kiểu "đuôi 9"
nào giữ nó ở lại bậc ấy — để nguyên là câu trả lời đúng.

### Hai thứ khác đã sửa

**Ràng buộc CỨNG tách riêng khỏi ràng buộc mềm.** Vượt trần người dạy
là cấu hình **không tồn tại**, không phải cấu hình kém điểm — trộn hai
loại vào một con số phạt thì một cấu hình không tuyển nổi người vẫn
thắng nhờ điểm đẹp. Mỗi ràng buộc phải khai `cung: true|false`.

**Tỷ giá quy đổi ra khỏi biểu thức.** `MOI_GIA_DINH` và
`MOI_DONG_GIA_TB` quyết định bộ tối ưu chọn hạ giá hay mở rộng — một
gia đình ≡ hạ giá trung bình **20.000đ**. Nằm lẫn trong một biểu thức
thì không ai thấy nó và không ai hỏi ai đặt. Nay có tên riêng và mục
chờ **TU-01**.

Và ngưỡng cải thiện của leo đồi tính **theo tỷ lệ**: `+1` tuyệt đối ở
thang tỷ đồng nằm dưới cả sai số dấu phẩy động, nên cái chặn ấy không
chặn gì.

---

## Việc còn chờ chủ hệ thống, không phải chờ mã

**Đừng đọc danh sách này bằng mắt — chạy `node tools/soat-san-sang.js`.**
Nó đọc thẳng `may-chu/wrangler.toml`, hỏi Cloudflare đang giữ bí mật nào,
soi kho mã, và **từ 9.99.49 đọc luôn mọi sổ `*_CHOCHU` trong kho** rồi đo
từng mục bằng ô `do` mà chính mục ấy khai — nên một mục đã xong sẽ bị bắt
là "ĐÃ XONG mà vẫn nằm trong sổ", và bộ kiểm đỏ cho tới khi gỡ. Sổ chờ chỉ
dài ra chứ không ngắn đi là cách nó mục. Cùng phép đo ấy hiện ở màn *Biên
soạn nội dung → ngăn Chờ chủ hệ* (`src/cho-chu-he.js`, một bản duy nhất).

Danh sách gõ tay thì MỤC: tới 9.99.7 chỗ này còn ghi
"điền hệ số lương ở `CV_HANG[].heSoGhiChu`" — mà `heSoGhiChu` chỉ là một
dòng ghi chú, không phải chỗ điền được, và chỗ điền thật (bảng
`heSoLuong`) tới 9.99.5 mới có.

Còn thật, tính tới 9.99.8:

- Bật GitHub Pages: `Settings → Pages → Source: GitHub Actions` — không
  có lệnh nào làm hộ được
- Trỏ DNS cho `gita.edu.vn` (CNAME trong kho đã có sẵn tên miền)
- Nạp năm bí mật máy chủ — `soat-san-sang.js` in ra đúng năm lệnh
- Chọn đường lấy sao kê ngân hàng: webhook · cổng thanh toán · nhập tay
- SPF/DKIM cho tên miền gửi thư
- **L-01** — hệ số lương ba vị trí phòng tài chính. Màn *Phòng Kế toán –
  Tài chính → Lương → Đặt hệ số*, chỉ Super Admin. Chưa đặt thì bảng
  lương vẫn chấm điểm, phần tiền để trống chứ không phải 0.
- Bốn ô còn lại của `G.TR_CHUA`: X-SHP · X-GOP · X-GP · X-DUTRU. Mục 74
  của bộ kiểm đối chiếu lời khai của sổ ấy với sổ thật mỗi lần chạy.
- Sáu mục của bộ nội dung — **ND-01 · ND-02 · ND-03 · ND-04 · MD-01 ·
  MD-02 · KL-01 · KL-02 · TG-01 · TG-02**. Đừng chép lại chúng ra đây:
  `soat-san-sang.js` in ra cả con số lẫn **chỗ điền** của từng mục, và
  ô `noiDien` nằm trong chính kho. Từ 9.99.49 mỗi mục có KHUNG để ghi
  câu trả lời: `KL_BIEUTUONG` · `KL_NGANKHO.o` (23 ô, mỗi ô một lần
  ngồi) · `MD_MAU_MA` · `MD_THUHANHVI` (10 trường, quyết từng trường
  một) · `TG_IN_CHOT` · và sổ `chotTrichNghe` ở máy chủ cho ND-04.
  Một mục chờ không có chỗ ghi thì nó không phải mục chờ — nó là một
  lời than, và ND-04 đã đứng yên ba bản đúng vì thế.

**Đã xong, đừng làm lại:** pháp nhân trong `LICENSE`/`NOTICE` (không còn
chỗ trống nào), học phí từng tầng (chốt 9.94, mục 90 đối chiếu hai bản),
cửa sổ gộp 7 ngày và số báo giá N4/N5 (đã đặt và có phép đo).

**Không phải việc của chủ hệ:** ngưỡng chuyển tuyến y tế/tâm lý. Kho
`data.quy-trinh-nhom.js` cố ý ghi DẤU HIỆU QUAN SÁT ĐƯỢC để người làm ca
đề nghị, và nói thẳng "ngưỡng do Hội đồng chuyên môn chốt". Đó là một
quyết định lâm sàng, không phải một ô trống chờ điền.

## Đã chốt, không hỏi lại

- **Giá gói theo tầng** (9.94, sửa lại ở 9.99.73) — `G.HP_TANG` giữ
  **KHUNG** (lời hứa), và nó vẫn là bản GỐC của khung. **SỐ** thì nay
  sống ở bảng `bangGia` trong D1: sửa được ngay, chỉ R01, phải viết lý
  do. Máy chủ giữ **giá KHỞI ĐẦU** ở `may-chu/bang-gia.js →
  GIA_KHOI_DAU` — không phải giá đang chạy — và bộ kiểm **mục 90** đối
  chiếu hai bản khởi đầu mỗi lần chạy. Thang duyệt chi neo vào giá gói
  và **KHÔNG tự dời** khi giá đổi: `soatNeoThang(giá)` nêu chỗ lệch,
  chốt lại thang là một quyết định có người ký (**BG-02**).
- **Chi từ 1,5 triệu trở lên** (9.92, 9.94) — phải xin duyệt VÀ phải
  vào báo cáo chi. Một ngưỡng, hai nghĩa vụ, cùng một hằng số
  `TRAN_PHAI_DUYET`.
- **Phòng tài chính trực thuộc ai** (9.98) — Super Admin quản lý đương
  nhiên; Giám đốc và Admin hệ thống quản lý được KHI Super Admin cấp
  `quanLyPhong`. Chỉ R01 cấp được quyền ấy, và không ai tự cấp cho mình.
- **Nối sổ với tài khoản ngân hàng** (9.98) — `giaoDichNganHang`, cửa
  webhook xác thực bằng `GITA_KHOA_NGANHANG` (không dùng phiên). Tự khớp
  CHỈ theo mã tham chiếu, không bao giờ theo số tiền. Đối chiếu nêu HAI
  phía riêng: tiền vào không có phiếu (mất lòng khách) và phiếu không có
  tiền vào (mất tiền).
- **Phòng Kế toán – Tài chính** (9.97) — ba vị trí: kế toán THU, kế toán
  CHI, kế toán TRƯỞNG. Là một TRỤC RIÊNG, vuông góc với thang vai
  R01–R15, cấp bằng `quyenTaiChinh` chứ không thêm vai. Chỉ R01–R02 cấp
  được. Tách thu khỏi chi là lớp kiểm soát chính: người ghi nhận tiền
  vào không được là người duyệt tiền ra.
- **Điểm KPI dưới 60** (9.99.8, L-02) — máy KHÔNG cắt và cũng không
  tha: lượt chốt lương bị chặn, người chốt phải ghi quyết định của mình
  kèm lý do, và câu ấy ở lại trong dòng lương. Không có luật chung, vì
  một luật chung phải chọn sẵn một cách cho mọi trường hợp mà nguyên
  nhân điểm thấp nằm đâu thì chỉ người đọc sổ mới biết.
- **Lương đã chốt vào sổ chi** (9.99.7) — khoản mục `luong`, trạng thái
  đã duyệt, mốc tiền ra là ngày cuối KỲ LƯƠNG chứ không phải ngày chốt.
  Không đi qua thang nấc vì không có số tiền nào được gõ tay; đổi lại
  `doiSoatLuong` soi hai phía như đối chiếu ngân hàng.
- **Sáu mốc chu kỳ** (9.97) — 10·15·20·50·80·100 triệu, TỔNG chi một
  người một TUẦN. Mỗi mốc một vai cố định, leo R03 → R02 → R01, mốc
  chẵn thêm một chữ ký. Kế toán trưởng được cấp hạn mức tới mốc nào thì
  ký thay tới mốc ấy.
- **Không còn lối tự ghi** (9.97) — mọi khoản chi đều chờ duyệt; dưới
  1,5 triệu thì người duyệt là kế toán chi.
- **Trần chu kỳ 10 triệu** (9.95) — tổng MỌI khoản chi của MỘT người
  trong MỘT tháng, cộng qua tất cả khoản mục. Chạm trần thì lối tự ghi
  đóng lại với người ấy tới hết chu kỳ. Đây là phép soi nhìn theo cột
  NGANG; phép gộp 7 ngày nhìn theo cột DỌC, và hai cái không thay được
  nhau. `TRAN_CHU_KY` neo vào giá gói T3.
