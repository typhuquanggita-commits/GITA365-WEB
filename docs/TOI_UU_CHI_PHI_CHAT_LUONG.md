# TỐI ƯU CHI PHÍ & CHẤT LƯỢNG — GITA 365

Mục tiêu (cập nhật — xem thêm [KIEN_TRUC_NOI_LUC.md](KIEN_TRUC_NOI_LUC.md)):

- **Giai đoạn 1 (dưới 300.000 tài khoản): 0 đồng.** Chạy hoàn toàn trên gói miễn phí của Cloudflare + GitHub.
- **Giai đoạn 2 (300.000–500.000 tài khoản): ≤ 20 USD/tháng.** Workers Paid (5 USD) cộng phần vượt nhỏ.
- **Giai đoạn 3 (trên 500.000 tài khoản): ≤ 50 USD/tháng.**

Tài liệu này ghi lại năm điểm yếu của kiến trúc (client nặng, Worker ở edge, E2EE, D1+R2, serverless), cách đã khắc phục trong mã, mô hình chi phí và sổ tay vận hành.

---

## 1. Bảng điểm yếu → biện pháp

| # | Điểm yếu | Biện pháp đã làm | Tệp |
|---|---|---|---|
| 1a | Máy yếu bị lag hoặc treo | Đo năng lực máy (RAM, nhân CPU, WebGPU/WebGL/WASM, MediaRecorder, Save-Data, mạng 2G, di động), rồi xếp vào bậc `manh`, `vua` hoặc `yeu`. Máy bậc `yeu` tắt animation, transition và backdrop-filter. Người dùng có thể ép bậc bằng `G.datBacMay('yeu')`. | `src/nang-luc-may.js`, `assets/style.css` |
| 1b | Xuất video ngốn RAM | Fps và bitrate theo bậc máy: 30/6 Mbps, 30/4 Mbps, 24/2,5 Mbps. Khi trình duyệt có File System Access, từng khúc được **ghi thẳng ra đĩa** nên không gom cả video trong RAM. Nếu không có thì quay về cách Blob cũ. | `src/xuong-phim.js` (`G.xpPhat`, `G.xpXuatVao`) |
| 1c | Trình duyệt cũ không có WASM/WebGPU | Ứng dụng **không cần** WebGPU hay LLM trên máy. AI chạy ở Worker và có hạn mức. Chỉ đo `wasm`/`webgpu` để cân bậc; thiếu chúng thì ứng dụng vẫn chạy. | `src/nang-luc-may.js` |
| 2a | Đóng tab giữa chừng làm mất dữ liệu | Hẹn đồng bộ 2 phút sau lần sửa, mỗi lượt cách nhau ít nhất 10 phút. Gửi `sendBeacon` khi `pagehide` hoặc khi tab bị ẩn (chống gửi trùng). Gọi `navigator.storage.persist()` để trình duyệt không tự xoá kho. | `src/dong-bo.js`, `src/nang-luc-may.js` |
| 2b | Ghi đè chen nhau giữa hai máy | Server gộp theo từng trường. R2 `put` có `onlyIf.etagMatches`; nếu etag lệch thì đọc lại, gộp lại, thử tối đa 3 lần. Hết lượt thử thì trả `BUSY` + `thuLaiSau`, và client tự lùi lại. | `may-chu/dong-bo.js` |
| 2c | Mất khoá hoặc xoá cache làm mất dữ liệu | Xem mục 4. | — |
| 2d | Khó debug edge + client | Mỗi phản hồi có header `x-gita-ma` (cf-ray); lỗi 500 trả kèm mã này. Worker ghi `console.error('LOI', ma, fn, …)`. Client giữ vòng nhật ký 40 lỗi đã lọc bỏ token và mật khẩu; nút **“Chép nhật ký lỗi”** ở màn Nối máy chủ. Từ mã đó, dò `wrangler tail` để tìm đúng lượt lỗi. | `may-chu/worker.js`, `src/noi-may-chu.js`, `src/nang-luc-may.js` |
| 3a | Cold start | Worker là một isolate V8, khởi động dưới 5 ms, nên không cần giữ ấm. Client có cache đọc 15 giây và gộp các lượt gọi trùng nhau, nên ít lượt phải đi tới Worker. Health GET có `Cache-Control: max-age=30`. | `src/noi-may-chu.js`, `may-chu/worker.js` |
| 3b | Giới hạn CPU 10 ms (gói miễn phí) | Việc nặng (dựng video, ghép khung) chạy ở **client**. Worker chỉ ghi, đọc và gọi AI qua `fetch` (thời gian chờ mạng không tính vào CPU). Lượt đồng bộ không có thay đổi thì không ghi gì. Bản sao lưu bị chặn tần suất: tối đa 1 bản mỗi 30 phút cho mỗi người. | `may-chu/dong-bo.js` |
| 4a | E2EE làm server không tìm kiếm được | Kho được giải mã **trên máy**, nên tìm kiếm và đánh chỉ mục đều chạy ở client, trên dữ liệu của chính người đó (vài MB). Server không bao giờ thấy chữ rõ. | `src/*` (tìm trong kho cục bộ) |
| 4b | D1 ↔ R2 lệch nhau, sinh tệp “mồ côi” | (1) Thứ tự ghi: sao lưu R2 trước, ghi sổ D1 sau. (2) **Bù trừ**: nếu D1 lỗi thì xoá tệp R2 vừa ghi. (3) **Quét đêm** `quetSaoLuuMoCoi`: lướt `hoso-sao/` theo con trỏ và xoá tệp hơn 1 ngày tuổi không có dòng D1 trỏ tới. (4) Bản sao lưu nén **gzip** (còn khoảng 10–20%). | `may-chu/dong-bo.js`, `worker.js` (`scheduled`) |
| 5 | Chi phí ẩn (bill shock) | **Lớp 1** (client): cache, gộp lượt trùng, cầu dao (3 lỗi liên tiếp thì ngắt 30 giây), lùi theo `thuLaiSau`, poll Xưởng phim giãn dần 5→30 giây, đồng bộ theo lô. **Lớp 2** (Worker, `ve-chi-phi.js`): mỗi IP được 20 lượt/phút cho đăng nhập, 12 lượt/phút cho AI, 120 lượt/phút cho các việc còn lại; có thể bật binding `GIOI_HAN`. **Lớp 3**: công tắc `GITA_CHE_DO_TIET_KIEM=1` đóng mọi việc tốn tiền (AI, phim). **Lớp 4**: gói Free của Cloudflare tự dừng ở 100k lượt/ngày (lỗi 1027), không bao giờ phát sinh hoá đơn. | `src/noi-may-chu.js`, `may-chu/ve-chi-phi.js`, `wrangler.toml` |

---

## 2. Mô hình chi phí

### Giới hạn Cloudflare (để tính)

| Dịch vụ | Free | Workers Paid (5 USD/tháng) |
|---|---|---|
| Pages (tĩnh) | không giới hạn lượt | như Free |
| Worker | 100k lượt/ngày, 10 ms CPU | 10M lượt/tháng (+0,30 USD/M), 30M CPU-ms (+0,02 USD/M) |
| D1 | 5M đọc/ngày, 100k ghi/ngày, 5 GB | 25 tỷ đọc, 50M ghi/tháng, 5 GB (+0,75 USD/GB) |
| R2 | 10 GB, 1M lớp A, 10M lớp B/tháng | +0,015 USD/GB, +4,50 USD/M lớp A, +0,36 USD/M lớp B |

### Ngân sách trên mỗi người dùng hoạt động/ngày (DAU)

Giả định: 10% tài khoản hoạt động mỗi ngày; khoảng 60% DAU có sửa dữ liệu (một lượt đồng bộ có ghi).

| | GĐ1: 300k TK → 30k DAU (Free) | GĐ2: 500k TK → 50k DAU | GĐ3: 1M TK → 100k DAU |
|---|---|---|---|
| Lượt Worker/DAU/ngày | **≤ 3,3** (100k ÷ 30k) | ≤ 10 | ≤ 10 |
| Ghi D1/ngày | ≤ 100k (cứng) | 50M/tháng gói Paid | 50M/tháng gói Paid |
| R2 lớp A/tháng | ≤ 1M (miễn phí) | ~1,5–2M | ~3–4M |
| R2 dung lượng | ≤ 10 GB (≈ 33 KB/TK) | 15–20 GB | 30–40 GB |

**Ràng buộc thật ở GĐ1 không phải lượt Worker mà là ghi D1 (100k/ngày) và R2 lớp A (1M/tháng)**: mỗi lượt đồng bộ có sửa = 1 ghi R2 + 1 ghi D1, cộng một bản sao lưu (1 ghi R2 + 2 ghi D1) nếu đã quá khoảng cách sao lưu. Hai đòn bẩy (biến môi trường, không cần sửa mã):

- GITA_SAO_LUU_PHUT=4320 — sao lưu tối đa 3 ngày/lần/người. 18k lượt sửa/ngày × (1 + 0,33) × 30 ≈ **0,72M lớp A/tháng** và ≈ 40k ghi D1/ngày.
- GITA_GIU_SAO_LUU=5 — giữ 5 bản thay vì 10 → R2 về dưới 10 GB.

Vì sao 3,3 lượt/DAU vẫn đủ dùng:

- Tài nguyên tĩnh (HTML/JS/CSS) đi qua Pages, **không tính** vào lượt Worker.
- Đồng bộ chạy theo lô: 1 lượt khi mở ứng dụng (bỏ qua nếu lượt trước chưa đầy 10 phút), 1 lượt sau mỗi đợt sửa, 1 beacon khi đóng tab.
- Cache đọc 15 giây, gộp lượt trùng, và việc khoang bị khoá được nghỉ ngay ở máy khách (không gọi lại).

### Ước tính GĐ2 (500k TK) và GĐ3 (1M TK)

| Hạng mục (USD/tháng) | GĐ2 · 500k | GĐ3 · 1M |
|---|---|---|
| Workers Paid nền | 5,00 | 5,00 |
| Lượt Worker vượt 10M × 0,30/M | 1,50 (15M) | 6,00 (30M) |
| CPU vượt 30M CPU-ms × 0,02/M | 0,30 | 1,20 |
| R2 dung lượng vượt 10 GB × 0,015 | 0,15 | 0,45 |
| R2 lớp A vượt 1M × 4,50/M | ≈ 4,50 | ≈ 11–13 |
| D1 (trong hạn gói Paid) | 0 | 0 |
| **Tổng** | **≈ 11,5 USD (trần 20)** | **≈ 25 USD (trần 50)** |

R2 lớp A là dòng lớn nhất từ GĐ2 — chính vì vậy sao lưu được nén, thưa và chỉ ghi khi có đổi thật. Trần 50 USD giữ được tới khoảng 1,5–2M tài khoản; quá mức ấy xem mục "Tinh gọn" trong KIEN_TRUC_NOI_LUC.md.

Gọi AI từ bên thứ ba (khoá API riêng) **không** thuộc phí nền tảng. Phần này được kiểm soát bằng hạn mức i (12 lượt/phút mỗi IP), hạn mức trong D1, công tắc tiết kiệm và khoang i (khoá riêng được).

### Khi nào chuyển sang Workers Paid

Chuyển khi có **một** trong các dấu hiệu sau (thường quanh 250–300k tài khoản):

- Có ngày gặp lỗi 1027, hoặc D1 báo hết hạn ghi.
- Số lượt đều đặn vượt 80k/ngày, hoặc ghi D1 vượt 80k/ngày.
- R2 lớp A vượt 0,8M/tháng hoặc dung lượng vượt 8 GB (đã bật hai đòn bẩy trên).

Trước khi chuyển, đặt **Budget alert** trong Cloudflare (Billing → Notifications) ở mức 15 USD (GĐ2) và 40 USD (GĐ3).
---

## 3. Sổ tay vận hành

1. **Theo dõi**: vào Cloudflare Dashboard → Workers → Metrics (lượt, lỗi, CPU), D1 → Metrics (đọc/ghi), R2 → dung lượng.
2. **Khi bị tấn công hoặc tăng đột biến**:
   - Bật chế độ tiết kiệm bằng `wrangler secret put GITA_CHE_DO_TIET_KIEM` (giá trị `1`) hoặc biến trong `[vars]`. Các việc AI và phim sẽ trả `TIETKIEM`, còn đồng bộ và đọc vẫn chạy bình thường.
   - Nếu cần, bỏ chú thích khối `[[ratelimits]] GIOI_HAN` trong `may-chu/wrangler.toml` để có hạn mức dùng chung cho toàn mạng edge, rồi `wrangler deploy`.
3. **Debug một lỗi người dùng báo**:
   1. Người dùng bấm “Chép nhật ký lỗi” rồi gửi nội dung đã chép.
   2. Trong nhật ký, lấy mã `x-gita-ma`.
   3. Chạy `wrangler tail --format pretty` rồi lọc `LOI <mã>`, hoặc tìm trong Workers Logs.
4. **Dọn dẹp & tự chữa**: cron `scheduled` gọi `donDep` → `quetSaoLuuMoCoi` (mỗi đêm 500 tệp, con trỏ `he-thong/con-tro-quet-sao-luu.txt`) → `tuSoatVaChua` (nhịp tim D1/R2, soát 200 hồ sơ/đêm, dựng lại tệp mất từ sao lưu, mở khoang hết hạn, báo cáo `he-thong/suc-khoe.json`).
5. **Khoá từng phần**: xem màn Nối máy chủ → *Khoang hệ thống & sức khoẻ* (Super Admin/Admin) hoặc biến `GITA_KHOA_KHOANG`. Chi tiết: [KIEN_TRUC_NOI_LUC.md](KIEN_TRUC_NOI_LUC.md).

---

## 4. Quản lý khoá & khôi phục

- **Khoá nội dung chỉ nằm trong bộ nhớ máy khách** (xem `docs/BAO_MAT.md`); không lưu xuống đĩa và không gửi lên server.
- Hồ sơ đã đồng bộ nằm trên R2 và đi theo **tài khoản**, không theo thiết bị. Khi mất máy hoặc xoá cache, người dùng chỉ cần đăng nhập lại là kéo về được.
- Rủi ro còn lại chỉ là **phần sửa chưa kịp đồng bộ**. Ba biện pháp giảm rủi ro này: hẹn đồng bộ 2 phút, beacon khi đóng hoặc ẩn tab, và `storage.persist()` để trình duyệt không tự dọn kho.
- Mỗi tài khoản có tối đa 10 bản sao lưu (cách nhau ít nhất 30 phút, nén gzip). Quản trị có thể cứu bản cũ bằng cách tải `hoso-sao/<uid>/<mã>.json.gz` rồi giải nén gunzip.

---

## 5. Còn tồn tại (đã biết)

- Hàm `gop` ở server bỏ qua các nhóm có giá trị không phải object, ví dụ `mood` là chuỗi. Các nhóm dạng mảng (`thuvien`, `minhchung`) được gửi `so` theo `day[nhom]['so']`. Hai điểm này cần rà riêng.
- Bộ đếm hạn mức trong bộ nhớ chỉ tính **theo từng isolate**, nên là lớp chống tăng đột biến và chống bill shock chứ không phải lớp bảo mật. Lớp bảo mật vẫn là `Kho.demNhip` (D1). Muốn có hạn mức chính xác toàn cục thì bật binding `GIOI_HAN`.
- Tìm kiếm phía client phù hợp với kho cá nhân cỡ vài MB. Nếu một người có hàng chục nghìn mục thì nên thêm chỉ mục IndexedDB.
