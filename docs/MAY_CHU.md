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

1. **Cầu nối Gmail (đường chính, không cần tên miền riêng).** Một Google Apps Script chạy dưới tài khoản `typhuquanggita@gmail.com` gửi thư bằng chính hòm Gmail đó. Thư có chữ ký DKIM của Google nên vào hộp thư đến. Hạn mức khoảng **100 người nhận/ngày** (Gmail thường).
2. **Resend (dự phòng / khi có tên miền).** Cần secret `GITA_KHOA_THU` và `GITA_THU_GUI_TU` là một địa chỉ thuộc tên miền **đã xác minh** ở Resend. Resend không cho gửi từ `@gmail.com`.

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
- Secret `GITA_CAU_NOI_GMAIL`, `GITA_KHOA_CAU_NOI`: cầu nối Gmail. Secret `GITA_KHOA_THU`: khoá API Resend.
- Khi không có đường gửi nào, các thư bắt buộc (OTP, kích hoạt) báo lỗi rõ ràng thay vì im lặng.

## Xưởng phim tự động A-Z (fal.ai)

Mô-đun `may-chu/phim-ai.js` cho phép Super Admin (R01) dán kịch bản và để hệ thống tự làm phim dọc 9:16: phân cảnh (LLM), vẽ chân dung nhân vật, vẽ khung mở đầu giữ đúng gương mặt, quay clip (Kling 2.1 image-to-video), đọc thoại tiếng Việt (MiniMax), rồi trình duyệt tự lắp phụ đề, logo, nhạc và xuất MP4.

- Secret `GITA_KHOA_FAL`: khoá API fal.ai của chủ hệ. Đặt ở GitHub secret cùng tên rồi chạy workflow deploy, hoặc `npx wrangler secret put GITA_KHOA_FAL` trong `may-chu/`.
- Cửa: `phimTrangThai`, `phimGuiViec` (gửi một việc vào hàng đợi `queue.fal.run`), `phimXemViec` (hỏi tối đa 12 việc/lượt). Model theo danh sách trắng; mọi chuỗi đi ra qua `soatRaNhaCungCap` (provider `fal`).
- Hạn mức mỗi ngày: llm 40 · ảnh 300 · ảnh-giữ-mặt 400 · clip 200 · giọng 800. Đặt thêm hạn mức chi tiêu ở fal.ai/dashboard/billing.
- Chi phí tham khảo (giá fal.ai): ảnh 0,039 USD; clip 5 giây 0,28 USD; giọng 0,1 USD/1.000 ký tự. Một tập 3 phút (~36 cảnh) khoảng 12 USD.
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
