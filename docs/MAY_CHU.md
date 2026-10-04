# MÁY CHỦ — GITA 365

Máy chủ của GITA 365 là một Cloudflare Worker, mã nằm trong thư mục `may-chu/`.

## Địa chỉ

Mặc định trong `cau-hinh.js`:

```js
G.API_CAP_PHEP = 'https://gita365.typhuquanggita.workers.dev';
```

Có thể ghi đè trên từng máy qua màn **Quản trị trang → Nối máy chủ**.

## CORS — `GITA_DIA_CHI_WEB`

Biến `[vars] GITA_DIA_CHI_WEB` trong `may-chu/wrangler.toml` là **danh sách origin, phân tách bằng dấu phẩy**:

```toml
GITA_DIA_CHI_WEB = "https://gita365.pages.dev,https://typhuquanggita-commits.github.io"
```

- Danh sách **phải gồm mọi địa chỉ đang chạy bản web**: `https://gita365.pages.dev` (chính thức, đứng đầu) và bản sao GitHub Pages `https://typhuquanggita-commits.github.io` (workflow deploy tự đồng bộ). Thêm địa chỉ khác thì nối bằng dấu phẩy. Thiếu một địa chỉ thì trình duyệt chặn CORS và app báo *không kết nối được máy chủ* dù Worker vẫn chạy bình thường.
- Worker đọc header `Origin`: khớp danh sách thì trả lại đúng origin đó (kèm `Vary: Origin`); không khớp thì trả origin đầu tiên (trình duyệt sẽ chặn).
- Không bao giờ thêm `null` (trang mở bằng `file://`); app khi đó sẽ báo người dùng mở https://gita365.pages.dev. Để trống biến thì Worker trả `*`.
- Origin **đầu tiên** được dùng để dựng đường dẫn kích hoạt trong thư.
- Đổi biến xong phải **deploy lại Worker** (`npx wrangler deploy` trong `may-chu/`, hoặc workflow deploy).
- Kiểm: `node tools/thu-cors.mjs` và `node tools/soat-san-sang.js`.

## Gửi thư

Mọi thư (mã OTP đăng ký, lấy lại mật khẩu, thông báo tài khoản, báo doanh thu) đi qua `guiThu()` trong `may-chu/thu.js`. Máy chủ thử các đường đã cấu hình theo thứ tự; đường đầu hỏng thì tự thử đường sau:

0. **Hộp thư GitHub (chỉ thư gửi chủ hệ — chỉ dùng GitHub + Cloudflare).** Khi người nhận là hòm chủ hệ (`GITA_THU_TRA_LOI`, `GITA_THU_DOANH_THU`, `GITA_MAIL_CUU`), Worker gửi `repository_dispatch` loại `thu` vào kho **riêng tư** `GITA_GH_HOP_THU` (`typhuquanggita-commits/gita365-hop-thu`). Workflow `thu.yml` trong kho đó mở một issue bằng `github-actions[bot]` → GitHub gửi email thông báo tới `typhuquanggita@gmail.com`. Không giới hạn số thư/ngày đáng kể, không cần tên miền. **Không bao giờ** dùng cho thư gửi khách.
1. **Cầu nối Gmail (tuỳ chọn, cho thư gửi khách khi chưa có tên miền).** Một Google Apps Script chạy dưới tài khoản `typhuquanggita@gmail.com` gửi thư bằng chính hòm Gmail đó. Thư có chữ ký DKIM của Google nên vào hộp thư đến. Hạn mức khoảng **100 người nhận/ngày** (Gmail thường). Đây là dịch vụ Google — chỉ dựng nếu chủ hệ chấp nhận ngoài GitHub + Cloudflare.
2. **Resend (dự phòng / khi có tên miền).** Cần secret `GITA_KHOA_THU` và `GITA_THU_GUI_TU` là một địa chỉ thuộc tên miền **đã xác minh** ở Resend. Resend không cho gửi từ `@gmail.com`.

### Bật hộp thư GitHub (khoảng 3 phút, một lần)

Kho `typhuquanggita-commits/gita365-hop-thu` (riêng tư) và workflow đã được tạo sẵn; tài khoản đã bật *Watch*.

1. Tạo khoá: mở <https://github.com/settings/personal-access-tokens/new?name=GITA365-hop-thu&description=May+chu+GITA+365+gui+thu&target_name=typhuquanggita-commits&expires_in=none&contents=write> → *Repository access* = **Only select repositories** → chọn `gita365-hop-thu` → **Generate token** → chép chuỗi `github_pat_…`.
2. Mở <https://github.com/typhuquanggita-commits/GITA365-WEB/settings/secrets/actions/new>: *Name* = `GITA_GH_KHOA_THU`, *Secret* = chuỗi vừa chép → **Add secret**.
3. Chạy lại workflow **Deploy GITA365 to Cloudflare** (*Actions → Run workflow*). Bước "Nạp khoá hộp thư GitHub" sẽ đưa khoá vào Worker.
4. Kiểm: Super Admin gọi `thuGuiThu` (xem dưới) → Gmail nhận thư "[typhuquanggita-commits/gita365-hop-thu] GITA 365 — thư thử từ máy chủ". Nếu không thấy: GitHub → *Settings → Notifications* → bật **Email** cho *Watching*.

Thư cho **khách hàng** (OTP đăng ký khách) cần tên miền riêng: mua ở Cloudflare Registrar (~10 USD/năm), bật Cloudflare Email Service (gửi tới địa chỉ bất kỳ cần gói Workers Paid 5 USD/tháng) — hoặc dùng cầu nối Gmail ở trên.

### Dựng cầu nối Gmail (khoảng 10 phút)

1. Đăng nhập Google bằng `typhuquanggita@gmail.com`, mở <https://script.google.com> → **Dự án mới**. Dán toàn bộ `may-chu/cau-noi-gmail/Code.gs` vào `Code.gs`, rồi lưu.
2. Tạo khoá ngẫu nhiên: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`. Vào **Cài đặt dự án → Thuộc tính tập lệnh**, thêm `KHOA` = chuỗi vừa tạo. Nếu nhận được bản dán sẵn (biến `KHOA_DAN` đã có khoá), bỏ qua bước này.
3. Chọn hàm `thuGui` → **Chạy** → cấp quyền "Gửi email thay bạn". Hòm thư sẽ nhận một lá "thử cầu nối Gmail".
4. **Triển khai → Tùy chọn triển khai mới → Ứng dụng web**: *Thực thi với tư cách* = **Tôi**, *Người có quyền truy cập* = **Bất kỳ ai**. Chép URL `https://script.google.com/macros/s/…/exec`.
5. Nạp vào Worker — chọn một cách:
   - **Không cần máy có wrangler:** đặt hai secret `GITA_CAU_NOI_GMAIL` (URL) và `GITA_KHOA_CAU_NOI` (khoá) ở GitHub → *Settings → Secrets and variables → Actions*. Sau đó chạy workflow **Deploy GITA365 to Cloudflare** (*Run workflow*); workflow sẽ nạp cả hai vào Worker.
   - Hoặc chạy trong `may-chu/`:
   ```bash
   npx wrangler secret put GITA_CAU_NOI_GMAIL   # dán URL ở bước 4
   npx wrangler secret put GITA_KHOA_CAU_NOI    # dán đúng KHOA ở bước 2
   ```
   Secret có hiệu lực ngay, không cần deploy lại. Đổi mã `thu.js` thì cần deploy lại Worker.
6. Kiểm: đăng nhập tài khoản Super Admin (R01) rồi gọi `fn: "thuGuiThu"`. Máy chủ gửi một thư thử tới `GITA_THU_TRA_LOI` và trả về các đường gửi đã cấu hình. Ví dụ bằng `curl`, dùng `token`/`u` của phiên đăng nhập:
   ```bash
   curl -s https://gita365.typhuquanggita.workers.dev/ -H "Content-Type: application/json" \
     -d '{"fn":"thuGuiThu","token":"<token>","u":"<tên đăng nhập>"}'
   ```

Quyền truy cập "Bất kỳ ai" là bắt buộc để Worker gọi được cầu nối, nên `KHOA` là thứ duy nhất giữ cửa. Lộ khoá thì đổi `KHOA` ở Apps Script và nạp lại `GITA_KHOA_CAU_NOI`. Sửa `Code.gs` thì phải **Quản lý triển khai → Chỉnh sửa → Phiên bản mới** để URL cũ chạy mã mới.

### Biến liên quan

- `GITA_THU_TRA_LOI` (reply-to, nơi nhận thư thử) và `GITA_THU_DOANH_THU` (nhận báo doanh thu): `typhuquanggita@gmail.com`, email chính thức.
- `GITA_THU_GUI_TU`: chỉ dùng cho Resend; để trống khi chưa có tên miền.
- Secret `GITA_GH_KHOA_THU` + biến `GITA_GH_HOP_THU`: hộp thư GitHub (chỉ thư gửi chủ hệ).
- Secret `GITA_CAU_NOI_GMAIL`, `GITA_KHOA_CAU_NOI`: cầu nối Gmail. Secret `GITA_KHOA_THU`: khoá API Resend.
- Khi không có đường gửi nào, các thư bắt buộc (OTP, kích hoạt) báo lỗi rõ ràng thay vì im lặng.

## Xưởng phim chế độ 0 đồng (mặc định)

Mặc định xưởng phim chạy **0 đồng** và **chỉ dùng GitHub + Cloudflare**: không gọi bất kỳ dịch vụ trả phí hay CDN bên ngoài nào.

| Phần việc | Làm bằng | Chi phí |
|---|---|---|
| Phân cảnh, viết bộ phim, viết tập | Workers AI `@cf/google/gemma-4-26b-a4b-it` (hạng Bom tấn thêm chỉ dẫn đạo diễn `DAO_DIEN_BOM_TAN`) | miễn phí (trong 10.000 neuron/ngày) |
| Chân dung, khung cảnh, giữ mặt | Workers AI `@cf/black-forest-labs/flux-2-klein-4b` (tối đa 4 ảnh tham chiếu ≤ 512 px); hỏng thì lùi về `flux-1-schnell` | miễn phí |
| Giọng đọc tiếng Việt | Piper (vais1000, vivos) chạy **trong trình duyệt**; tệp giọng + piper-phonemize do Worker phục vụ từ **R2** (`GET /tn/<tệp>`, `may-chu/tai-nguyen.js`); onnxruntime-web từ cdnjs.cloudflare.com; lưu ở Cache API `gita-piper-v1` | miễn phí |
| Chuyển động | Hiệu ứng máy quay Ken Burns trên ảnh tĩnh khi xuất (`G.xpKenBurns`) | miễn phí |
| Hoàn thiện điện ảnh (Bom tấn) | Pha màu teal–cam, tối viền, hạt phim, dải đen — vẽ trên canvas khi xuất | miễn phí |
| Lưu ảnh/giọng | IndexedDB `gita-xuong-phim-0d` trong máy | miễn phí |

- Cửa duy nhất: `phimMienPhi` (`may-chu/phim-0d.js`), chỉ R01, loại `llm` / `anh` / `anhSua` / `anhCao` / `anhSuaCao` (hoặc `cao: true`). Mọi chuỗi đi ra vẫn qua `soatRaNhaCungCap` (provider `cf-workers-ai`).
- **Hạng "Bom tấn Cloudflare"** (mặc định ở chế độ 0đ; chọn "Tiêu chuẩn" để nhanh hơn): ảnh 768×1344 bằng klein 4B + hậu tố điện ảnh `ANH_BOM_TAN`, ~156 neuron/ảnh, vẫn 0 đồng (khoảng 1 tập/ngày). Nếu chủ hệ **tự** bật gói Workers Paid và đặt `GITA_PHIM_TRAN_TRA_PHI` > 0, ảnh Bom tấn dùng `flux-2-klein-9b` 896×1600 (~1.430 neuron ≈ 0,016 USD/ảnh), đếm riêng trong D1 (khoá `phim-cf·tra-phi·YYYY-MM-DD`) và không vượt trần đó; hỏng/hết quỹ thì tự về klein 4B miễn phí. Mặc định `"0"` = tắt.
- **Tài nguyên R2** (`/tn/`): danh sách cố định 7 tệp, ghim độ dài + SHA-256. Lần đầu có người gọi, Worker chép một lần từ nguồn gốc (jsDelivr/Hugging Face, phía máy chủ) vào bucket `gita365-hoso` tiền tố `tn/`, sai SHA thì xoá. Từ đó trình duyệt chỉ tải từ Cloudflare.
- `[ai] binding = "AI"` trong `wrangler.toml`. Gói Workers Free: vượt 10.000 neuron/ngày thì Cloudflare chỉ báo lỗi, **không tính tiền**.
- `GITA_PHIM_TRAN_NEURON` (mặc định 9000, tối đa 9500): trần tự đặt dưới mức miễn phí, đếm trong D1 `chanNhip` (khoá `phim-0d·neuron·YYYY-MM-DD`) bằng một câu ghi có điều kiện nên lượt song song không vượt trần. Chạm trần → `HET_MIEN_PHI` kèm `mai` (00:00 UTC = 07:00 giờ Việt Nam); trình duyệt tự chờ rồi làm tiếp.
- `GITA_PHIM_CHI_0D` (mặc định `"1"`): khi bật, `phimGuiViec`/`phimXemViec` (fal.ai) trả `CHE_DO_0_DONG` dù có `GITA_KHOA_FAL`. Chỉ đặt `"0"` nếu chủ hệ chủ động muốn dùng fal.ai trả phí.
- Workers AI chưa có mô hình video, nên chuyển động toàn cảnh vẫn là Ken Burns. **Khớp môi** 0 đồng xem mục dưới. Mỗi tập 28–34 cảnh (`HUONG_TAP_0D`), phần miễn phí mỗi ngày đủ khoảng 1 tập Bom tấn hoặc 2 tập Tiêu chuẩn.
- Lần đầu đọc thoại, trình duyệt tải giọng (~63 MB + ~28 MB), các lần sau lấy từ bộ nhớ đệm.
- Kiểm tra: `GET /` của Worker trả `ai: true` khi binding đã có.
- **Chất liệu câu chuyện**: phân cảnh/bộ phim lấy chất liệu từ "Sổ tay gia đình" và thư viện GITA365 (`src/xuong-phim-chat-lieu.js`), gửi lên Worker trong khối SOURCE MATERIAL (đã lọc `soatRaNgoai` từng dòng).

### Khớp môi AI 0 đồng (máy GitHub — `may-chu/xuong-quay.js`)

Cảnh **một người nói**, dài 2–15 giây, được gửi sang kho công khai `typhuquanggita-commits/gita365-xuong-quay` (biến `GITA_GH_XUONG_QUAY`) để SadTalker chạy trên máy GitHub Actions (CPU, miễn phí không giới hạn cho kho công khai). Kết quả: khuôn mặt trong ảnh điện ảnh mấp máy môi khớp lời thoại + cử động đầu nhẹ.

1. Trình duyệt (R01) gọi `quayKhopMoi` với ảnh cảnh + âm thoại WAV 16 kHz → Worker lưu R2 `quay/<mã>/anh|am`, ghi D1 `quay_viec`.
2. Workflow `quay.yml` chạy mỗi 10 phút (hoặc ngay lập tức nếu `GITA_GH_KHOA_THU` có quyền Contents ghi trên **cả** `gita365-hop-thu` và `gita365-xuong-quay`), hỏi `GET /quay/can`, nhận việc `POST /quay/nhan`, nộp `PUT /quay/kq/<mã>` (mp4 H.264, không tiếng) hoặc `POST /quay/loi/<mã>`.
3. Trình duyệt hỏi `quayXem` mỗi 30 giây; xong thì cảnh dùng `GET /quay/phim/<mã>.mp4` (công khai, CORS `*`), giọng vẫn phát riêng như cũ. Hỏng thì lùi về ảnh tĩnh.

- Khoá máy quay: secret `GITA_KHOA_XUONG_QUAY` (64 hex ngẫu nhiên) phải **giống nhau** ở GitHub secret của GITA365-WEB (workflow deploy nạp vào Worker) và của `gita365-xuong-quay` (header `X-Khoa-Quay`). Thiếu khoá → `/quay/*` trả 401 và trình duyệt bỏ qua khớp môi.
- Tốc độ: khoảng 25 phút cho 10 giây cảnh mỗi máy, tối đa 20 máy song song. Việc giữ 7 ngày rồi tự dọn (`donQuay`). Nhận quá 90 phút không nộp → trả lại hàng, tối đa 3 lần.
- GitHub tắt lịch chạy nếu kho `gita365-xuong-quay` không có hoạt động 60 ngày — khi đó vào tab Actions bấm "Enable workflow".
- Tắt: bỏ chọn "🗣️ Khớp môi AI" trong xưởng phim.

### Người chuyển động 0 đồng (cùng máy GitHub)

Cảnh không phải một người nói: Cloudflare vẽ **một tư thế cuối** của đúng người trong ảnh (giữ mặt, áo, phòng), rồi máy GitHub nối hai khung bằng RIFE thành clip khoảng 2 giây. Người bước nhẹ, quay đầu hoặc giơ tay — không phải cảnh chạy, đánh, nhảy (những cảnh đó chỉ rung nhẹ, vì không có card đồ họa miễn phí để quay phim AI thật). Ô "🚶 Người chuyển động" mặc định bật. Việc loại `cd` đi cùng hàng chờ khớp môi.

## Xưởng phim tự động A-Z (fal.ai — trả phí, mặc định TẮT)

Mô-đun `may-chu/phim-ai.js` cho phép Super Admin (R01) dán kịch bản và để hệ thống tự làm phim dọc 9:16: phân cảnh (LLM), vẽ chân dung nhân vật, vẽ khung mở đầu giữ đúng gương mặt, quay clip (Kling 2.1 image-to-video), đọc thoại tiếng Việt (MiniMax), rồi trình duyệt tự lắp phụ đề, logo, nhạc và xuất MP4.

- Secret `GITA_KHOA_FAL`: khoá API fal.ai của chủ hệ. Đặt ở GitHub secret cùng tên rồi chạy workflow deploy, hoặc `npx wrangler secret put GITA_KHOA_FAL` trong `may-chu/`.
- Cửa: `phimTrangThai`, `phimGuiViec` (gửi một việc vào hàng đợi `queue.fal.run`), `phimXemViec` (hỏi tối đa 12 việc/lượt), `phimTinhHuong` (R01: trả 75 tình huống khảo sát `TH_KHACH` và 10 phần khung kể chuyện GITA365). Model theo danh sách trắng; mọi chuỗi đi ra qua `soatRaNhaCungCap` (provider `fal`).
- Loại việc: `llm` (che `kichBan` / `boPhim` / `tap`), `anh`, `anhSua` (giữ mặt, tối đa 4 ảnh tham chiếu), `video` (Kling 2.1 tiêu chuẩn), `videoDienAnh` (Kling 2.5 Turbo Pro), `lipSync` (Kling lipsync — khớp khẩu hình với giọng), `giong` (MiniMax, có `camXuc`: happy/sad/angry/fearful/surprised/disgusted/neutral). Lip-sync chỉ nhận URL `*.fal.media` do chính fal trả về.
- Với `boPhim`, cổng Điều 13 soát phần do người dùng gõ (`ghiChu`) và khoá tình huống; văn bản `TH_KHACH` là dữ liệu cố định, ẩn danh của máy chủ.
- Hạn mức mỗi ngày: llm 60 · ảnh 400 · ảnh-giữ-mặt 900 · clip 300 · clip điện ảnh 700 · lip-sync 700 · giọng 1500. Đặt thêm hạn mức chi tiêu ở fal.ai/dashboard/billing.
- Chi phí tham khảo (giá fal.ai): ảnh 0,039 USD; clip 5 giây 0,28 USD (điện ảnh 0,35 USD); lip-sync ~0,07 USD/cảnh; giọng 0,1 USD/1.000 ký tự. Một tập 5 phút điện ảnh ~26,6 USD; bộ 10 tập ~265 USD.

### Bộ phim 10 tập (`src/xuong-phim-bo.js`)

1. Chọn tầng và các tình huống khách (từ `phimTinhHuong`), ghi chú thêm.
2. "Viết kinh bộ phim" → LLM `boPhim` trả tên bộ, nhân vật (mô tả ngoại hình cố định, giọng), bối cảnh và dàn ý 10 tập theo khung kể chuyện.
3. "Dựng tư liệu" → chân dung + ảnh nền bối cảnh, rồi tờ nhân vật nhiều góc (`anhSua`) để giữ gương mặt xuyên suốt.
4. "Làm cả bộ" → chọn thư mục, xác nhận chi phí, rồi lần lượt mỗi tập: LLM `tap` (kèm kinh bộ phim) → ghép nhân vật/bối cảnh của bộ → giọng có cảm xúc → khung đầu dùng ảnh tham chiếu → quay điện ảnh → khớp khẩu hình → lắp → ghi `Tap-01.mp4` … `Tap-10.mp4`. Dừng ở tập lỗi, bấm lại để làm tiếp.
- Trạng thái lưu ở `localStorage` khoá `gita.xuongPhim.bo.v1`.
- Kết quả tải thẳng từ `*.fal.media` về trình duyệt (CSP `connect-src` đã mở các host này).
- Đây là ngoại lệ có chủ ý của luật C20 theo yêu cầu chủ hệ; xưởng cũ (`src/studio.js`) vẫn giữ C20.

## Chức năng chính

- Đăng nhập / đăng xuất / kiểm phiên
- Đăng ký, xác thực OTP, kích hoạt tài khoản
- Cấp khoá giải mã kho (`GITA_KHOA_KHO`)
- Quản lý quyền xem hồ sơ khách và T5-PRO
- Tài chính: phiếu thu, công nợ, hoa hồng, đóng kỳ
- CRM, đồng bộ hồ sơ, cài đặt
- Cộng đồng, tài liệu, tình huống khách

## Triển khai

Xem chi tiết trong `TRIEN-KHAI.md`, Phần 2 — Cloudflare Worker.

## Kiểm tra

```bash
curl -sf "https://gita365.typhuquanggita.workers.dev/?fn=status" -X POST \
  -H "Content-Type: application/json" -d '{}'
```

Hoặc dùng màn **Nối máy chủ** trong app và bấm **Gọi thử**.

## Phim phân tử

Phim không lưu thành file video. `may-chu/phim-phan-tu.js` ghi một công thức ngắn vào D1 (thứ tự cảnh, câu thoại, mã nhịp, mã máy quay). Ảnh dùng chung nằm một lần trong R2, theo mã băm: cùng một ảnh không lưu hai lần.

- Xem mẫu: `GET /phim/mau` chuyển tới `/phim/xem/mau-gita-365`. Trình duyệt ghép cảnh tại máy người xem. Xem lại vẫn là link đó.
- Đóng gói phim riêng (chỉ chủ hệ): `fn: dongGoiPhanTu`.
- Nhịp có sẵn: thở, giơ tay, quay đầu, một bước. Không có chạy, đánh, nhảy.
- Cloudflare Workers AI vẽ được ảnh, không có mô hình quay video. Lúc xem không cần GPU.

Kiểm: `node tools/thu-phim-phan-tu.mjs`. Đổi mã xong phải deploy lại Worker.

### Video chuyển động trên GPU miễn phí (Kaggle)

Nhân vật là AI, không dùng ảnh khách, nên được dùng GPU ngoài. Cửa `quayVideoDong` (R01): ảnh nhân vật + lời nhắc động tác + `phamVi` (`khach` mặc định, `noi-bo` cho phim đào tạo). Phạm vi `khach` bị chặn cứng từ khoá nội bộ ở `TU_KHOA_NOI_BO`; nội dung khách theo thị hiếu, lõi GITA tối đa ~30%. Máy Kaggle (GPU T4 miễn phí ~30 giờ/tuần) chạy `may-quay-kaggle/quay-kaggle.py`, nhận riêng việc loại `vd` qua cùng khoá `GITA_KHOA_XUONG_QUAY`, nộp MP4 về `/quay/phim/<ma>.mp4`. Máy GitHub vẫn lo `moi`/`cd` như cũ. Hướng dẫn từng bước: `docs/GPU-MIEN-PHI.md`. Kiểm: `node tools/thu-quay-video.mjs`.