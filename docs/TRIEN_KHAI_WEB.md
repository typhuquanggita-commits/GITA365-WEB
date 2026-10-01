# TRIỂN KHAI WEB — GITA 365

Tài liệu rút gọn. Chi tiết đầy đủ xem `TRIEN-KHAI.md` ở thư mục gốc.

## Thứ tự an toàn

1. Kết nối Cloudflare Pages trực tiếp với GitHub.
2. Triển khai Pages từ nhánh `main`.
3. Chuẩn bị và triển khai Worker độc lập khi API sẵn sàng.
4. Nối hai đầu trong app.

## Triển khai Pages

Workflow GitHub **Validate GITA365 Pages release** tự triển khai mọi lần đẩy lên
`main` tới `https://gita365-web.pages.dev/`. Đây là Pages project `gita365-web`;
nó không dùng hoặc cấu hình tên miền `gita.edu.vn`.

Trong GitHub → **Settings → Secrets and variables → Actions**, tạo:

1. `CLOUDFLARE_API_TOKEN`: token của đúng tài khoản Cloudflare, có quyền
   **Cloudflare Pages: Edit**.
2. `CLOUDFLARE_ACCOUNT_ID`: Account ID 32 ký tự hexadecimal của tài khoản chứa
   project `gita365-web`.

Không ghi các giá trị này vào mã nguồn. Sau khi đã có hai secret, mỗi lần push
lên `main` sẽ build và triển khai tự động; pull request chỉ kiểm tra artifact.

Lệnh build chỉ đưa các tệp public vào `_site`: HTML, bundles, cấu hình client,
assets và kho `.enc`. Nó từ chối nếu `may-chu`, `tools`, `kho-goc` hoặc
`kho/khoa.json` lọt vào output.

GitHub Actions dựng lại bundles, kiểm tra artifact rồi triển khai đúng artifact
đó. Chỉ dữ liệu public được đưa lên Pages; `may-chu`, `tools`, `kho-goc` và
`kho/khoa.json` vẫn bị loại trừ.

## Triển khai Worker

Worker được triển khai riêng bằng workflow GitHub **Deploy GITA365 API Worker**
chỉ khi D1/R2/secret đã sẵn sàng. Lỗi Worker không chặn Cloudflare Pages.
Workflow này vẫn dùng `CLOUDFLARE_API_TOKEN` có quyền Workers Scripts Edit và
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
