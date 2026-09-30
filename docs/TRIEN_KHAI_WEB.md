# TRIỂN KHAI WEB — GITA 365

Tài liệu rút gọn. Chi tiết đầy đủ xem `TRIEN-KHAI.md` ở thư mục gốc.

## Thứ tự an toàn

1. Chuẩn bị D1 schema và secret khoá.
2. Triển khai Cloudflare Worker.
3. Triển khai Cloudflare Pages.
4. Nối hai đầu trong app.

## Triển khai Pages

Mỗi push lên `main` sẽ kích hoạt workflow `Deploy GITA365 to Cloudflare`.

Yêu cầu secrets trong GitHub:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

Workflow sẽ:

1. Dựng `gita-app.js` và `gita-nghe.js` từ `src/`.
2. Đóng gói các tệp public vào `_site/`.
3. Triển khai lên Pages project `gita365`.
4. (Tuỳ) Triển khai Worker nếu có thay đổi trong `may-chu/`.

## Triển khai Worker

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
