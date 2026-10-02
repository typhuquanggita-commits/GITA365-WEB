# TRIỂN KHAI WEB — GITA 365

Tài liệu rút gọn. Chi tiết đầy đủ xem `TRIEN-KHAI.md` ở thư mục gốc.

## Thứ tự an toàn

1. Kết nối Cloudflare Pages trực tiếp với GitHub.
2. Triển khai Pages từ nhánh `main`.
3. Chuẩn bị và triển khai Worker độc lập khi API sẵn sàng.
4. Nối hai đầu trong app.

## Triển khai Pages

Cloudflare Pages Git Integration tự triển khai mỗi lần đẩy lên `main` tới
`https://gita365-web.pages.dev/`. Đây là Pages project `gita365-web`; nó không
dùng hoặc cấu hình tên miền `gita.edu.vn`.

Trong Cloudflare Pages → **Settings → Builds & deployments**, kiểm tra:

1. Production branch: `main`.
2. Build command: `node tools/gop-src.js && node tools/build-pages.js`.
3. Build output directory: `_site`.

GitHub Actions **Validate GITA365 Pages release** chỉ dựng và kiểm tra artifact
công khai cho push/PR; không giữ Cloudflare credential. Cloudflare nhận commit
trực tiếp từ GitHub và triển khai artifact của chính nó.

Lệnh build chỉ đưa các tệp public vào `_site`: HTML, bundles, cấu hình client,
assets và kho `.enc`. Nó từ chối nếu `may-chu`, `tools`, `kho-goc` hoặc
`kho/khoa.json` lọt vào output.

GitHub Actions dựng lại bundles, kiểm tra artifact rồi triển khai đúng artifact
đó. Chỉ dữ liệu public được đưa lên Pages; `may-chu`, `tools`, `kho-goc` và
`kho/khoa.json` vẫn bị loại trừ.

## Chuỗi phát hành và giám sát

Luồng frontend là: Pull Request → build bundle → kiểm tra `_site`/private path
→ review → merge `main` → Cloudflare Pages Git Integration phát hành. Không đặt
Cloudflare API token cho luồng Pages.

Workflow **Monitor Cloudflare production** kiểm tra Pages và Worker mỗi giờ,
hoặc có thể chạy thủ công. Nó thất bại khi Pages không trả trang HTML hoặc khi
Worker/D1/keyset không sẵn sàng, để GitHub Actions gửi cảnh báo cho người quản
lý workflow.

Trước khi phát hành Worker, workflow **Deploy GITA365 API Worker** yêu cầu xác
nhận migration D1 đã áp dụng và backup/rollback đã kiểm tra. Bảo vệ environment
`cloudflare-worker-production` bằng required reviewers trong GitHub Settings →
Environments; đây là cổng phê duyệt bắt buộc trước khi workflow có thể dùng
secret và deploy.

### Cloudflare Workers Builds

Hai service `gita365` và `gita365-web` không dùng Cloudflare Workers Builds.
Trong Cloudflare Dashboard, mở từng service → **Settings → Builds** và ngắt
Git integration/tắt automatic builds. Giữ Pages project `gita365-web` kết nối
GitHub; Worker chỉ phát hành bởi workflow thủ công ở trên. Việc này loại bỏ các
check Workers Builds thất bại mà không trộn frontend với API.

### Cache và rollback

HTML, service worker, bundle và cấu hình client dùng `no-cache`; chỉ font tĩnh
trong `assets/fonts/` dùng cache immutable. Với asset mới, chỉ dùng cache dài
hạn khi tên tệp đổi theo nội dung. Để rollback Pages, chọn deployment production
trước trong Cloudflare Pages và rollback; với Worker, phục hồi schema/backup đã
xác nhận rồi redeploy commit/tag đã biết tốt.

## SOP cho người vận hành không chuyên

Màn **Quản trị trang → Trạng thái hệ thống** là điểm bắt đầu duy nhất cho R01/R02.
Màn chỉ dùng ba trạng thái:

| Trạng thái | Việc cần làm |
|---|---|
| Bình thường | Ghi nhận lượt kiểm tra; tiếp tục công việc. |
| Cần xử lý | Bấm nút hướng dẫn ngay trên thẻ, xử lý một việc rồi kiểm tra lại. |
| Dừng an toàn | Không phát hành Worker, không chạy migration và không sửa dữ liệu cho đến khi khôi phục xong. |

Đây là màn hỗ trợ quyết định, không thay thế nhật ký Worker, bản sao lưu hoặc
người duyệt. Lịch sử hiển thị chỉ nằm ở trình duyệt hiện tại để nhắc việc; sự cố
và quyết định rollback cần ghi trong issue/nội bộ do R01/R02 quản lý.

### Phát hành web

1. Tạo PR, chờ build và review xanh.
2. Merge vào `main`; Cloudflare Pages Git Integration tự phát hành.
3. Mở **Trạng thái hệ thống** và bấm **Kiểm tra ngay**.
4. Nếu web lỗi, rollback deployment production trước trong Cloudflare Pages; không
   cần triển khai Worker để rollback giao diện.

### Phát hành Worker, dữ liệu và khôi phục

1. Sao lưu/kiểm tra phương án khôi phục D1/R2, ghi người xác nhận.
2. Áp dụng migration D1 và kiểm tra kết quả.
3. Chạy workflow **Deploy GITA365 API Worker**, xác nhận hai điều kiện và chờ
   required reviewer của environment.
4. Health check phải xanh cho Worker, D1 và keyset. Nếu không xanh, dừng an toàn,
   phục hồi schema/backup đã xác nhận và deploy lại commit/tag tốt gần nhất.

### Video và dữ liệu riêng tư

Renderer Docker chạy tại máy nội bộ, network tắt và dữ liệu media không đi qua
Cloudflare Worker hoặc dịch vụ render ngoài. Chỉ render manifest đã được duyệt,
có quyền sử dụng/đồng ý cần thiết; xem `renderer/README.md`. Không dùng SaaS hằng
ngày không đồng nghĩa hệ không có phụ thuộc: Pages/Worker, DNS, thiết bị nội bộ,
backup và người duyệt vẫn là các thành phần phải theo dõi.

## Triển khai Worker

Worker được triển khai riêng bằng workflow GitHub **Deploy GITA365 API Worker**
chỉ khi D1/R2/secret đã sẵn sàng. Lỗi Worker không chặn Cloudflare Pages.
Workflow này dùng `CLOUDFLARE_API_TOKEN` có quyền Workers Scripts Edit và
`CLOUDFLARE_ACCOUNT_ID`; các secret đó không được dùng cho frontend.

```bash
cd may-chu
npx wrangler d1 create gita365
npx wrangler d1 execute gita365 --file=csdl.sql --remote
bash nap-bi-mat.sh /đường/dẫn/khoa.json
npx wrangler deploy
```

## Kiểm tra sau triển khai

```bash
curl -X POST "https://gita365.typhuquanggita.workers.dev/?fn=status" \
  -H "Content-Type: application/json" -d '{}'
```

Trong app: đăng nhập Super Admin → **Nối máy chủ** → Gọi thử. Thấy số khoá > 0 là xong.
