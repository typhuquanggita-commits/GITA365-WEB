# TRIỂN KHAI WEB — GITA 365

Tài liệu rút gọn. Chi tiết đầy đủ xem `TRIEN-KHAI.md` ở thư mục gốc.

## Thứ tự an toàn

1. Kết nối Cloudflare Pages trực tiếp với GitHub.
2. Triển khai Pages từ nhánh `main`.
3. Chuẩn bị và triển khai Worker độc lập khi API sẵn sàng.
4. Nối hai đầu trong app.

## Triển khai Pages

Cloudflare Pages Git Integration theo dõi `main` và tự triển khai tới
`https://gita365.pages.dev/`. GitHub Actions chỉ kiểm tra build và tạo artifact
tham khảo; Pages không dùng GitHub secret Cloudflare.

Trong Cloudflare Dashboard:

1. **Workers & Pages → Create application → Pages → Connect to Git**.
2. Chọn repository `typhuquanggita-commits/GITA365-WEB`, project `gita365`,
   production branch `main`.
3. Đặt build command `node tools/gop-src.js && node tools/build-pages.js`.
4. Đặt build output directory `_site`.

Lệnh build chỉ đưa các tệp public vào `_site`: HTML, bundles, cấu hình client,
assets và kho `.enc`. Nó từ chối nếu `may-chu`, `tools`, `kho-goc` hoặc
`kho/khoa.json` lọt vào output.

GitHub Actions sẽ dựng lại bundles và kiểm tra đúng public artifact, nhưng
không gọi Cloudflare Pages và không cần `CLOUDFLARE_API_TOKEN`.

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
