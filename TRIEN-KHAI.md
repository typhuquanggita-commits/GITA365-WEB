# GITA 365 — HƯỚNG DẪN TRIỂN KHAI (Cloudflare + GitHub)

> Bản full 9.99.238 · giao diện đã nâng cấp (bảng khung rõ · khối 3D · sơ đồ quy trình).
> Đọc phần ⚠ BẢO MẬT trước tiên.

---

## ⚠ BẢO MẬT — ĐỌC TRƯỚC KHI LÀM BẤT KỲ VIỆC GÌ

**KHOÁ GIẢI MÃ (giấy phép / `khoa.json`) KHÔNG BAO GIỜ ĐƯỢC ĐƯA LÊN GITHUB.**

- Repo GitHub là **công khai**. Kho nội dung `kho/*.enc` đã mã hoá — vô hại nếu để công khai
  vì **không có khoá thì không mở được**.
- Nhưng nếu đưa **khoá** (7 khoá AES trong giấy phép) lên GitHub, bất kỳ ai cũng giải mã được
  **toàn bộ nội dung chuyên môn** của Học viện. Đó là mất tài sản, và không lấy lại được.
- Khoá chỉ nằm **một chỗ duy nhất**: trong **secret của Cloudflare Worker** (`GITA_KHOA_KHO`).
  Máy khách xin khoá từ Worker sau khi đăng nhập, giải mã trong bộ nhớ, không lưu lại.
- Gói này **không** chứa khoá. File `.gitignore` cũng chặn sẵn `kho/khoa.json` và `giay-phep/`.

---

## Kiến trúc (đồng nhất một tên miền)

```
   Trình duyệt khách
        │
        ├──►  Cloudflare Pages   →  phần tĩnh: index.html · gita-app.js · assets · kho/*.enc
        │                            (lấy từ repo GitHub — CÔNG KHAI, KHÔNG khoá)
        │
        └──►  Cloudflare Worker  →  máy chủ: đăng nhập · cấp khoá · CRM · nhật ký · tài chính
                                     (mã ở may-chu/ — khoá nằm trong SECRET, không ở repo)
```

Cùng một tên miền (ví dụ `gita.edu.vn`): Pages phục vụ phần tĩnh, Worker giữ route `/api/*`.
Cùng tên miền thì không có CORS, không có lượt gọi thăm dò trước mỗi yêu cầu.

---

## PHẦN 1 — GITHUB + CLOUDFLARE PAGES (phần tĩnh, công khai)

1. Đưa **toàn bộ gói này** lên repo `GITA365-WEB` (kéo-thả trên GitHub, hoặc `git push`).
2. Cloudflare → **Workers & Pages** → **Create** → **Pages** → **Connect to Git** → chọn repo `GITA365-WEB`.
3. Build settings: **không có bước build** — để trống lệnh build, thư mục xuất là gốc (`/`).
4. Deploy. Pages cho một địa chỉ `*.pages.dev`.

## PHẦN 2 — CLOUDFLARE WORKER (máy chủ, có khoá)

Mở terminal trong thư mục `may-chu/` rồi làm 5 việc (đã ghi sẵn trong `wrangler.toml`):

```bash
cd may-chu

# 1) Tạo cơ sở dữ liệu, dán database_id vào wrangler.toml
npx wrangler d1 create gita365

# 2) Dựng bảng
npx wrangler d1 execute gita365 --file=csdl.sql --remote

# 3) NẠP KHOÁ (giấy phép) — đây là bước dùng file khoá riêng của anh:
bash nap-bi-mat.sh /duong/dan/toi/khoa.json
#   (hoặc: cat khoa.json | npx wrangler secret put GITA_KHOA_KHO)
#   Rồi nạp 3 bí mật còn lại theo hướng dẫn script IN RA (GITA_TIEU sinh MỘT LẦN, giữ mãi).

# 4) (Tên miền) xác thực gita.edu.vn ở nhà gửi thư — SPF/DKIM (xem wrangler.toml)

# 5) Đưa Worker lên
npx wrangler deploy
```

## PHẦN 3 — NỐI HAI ĐẦU

Mở app → đăng nhập **Super Admin** → **Quản trị trang → Nối máy chủ** → dán địa chỉ Worker → **Lưu** → **Gọi thử**.
Thấy **số khoá > 0** là xong. Đổi địa chỉ máy chủ đảo ngược được trong một phút.

---

## Bốn bí mật của Worker (nạp bằng lệnh, KHÔNG viết vào file)

| Secret | Là gì | Lưu ý |
|---|---|---|
| `GITA_KHOA_KHO` | Nội dung `khoa.json` (7 khoá giải mã kho) | Chìa mở toàn bộ nội dung. Chỉ ở đây. |
| `GITA_TIEU` | Tiêu băm mật khẩu | Sinh **một lần**, giữ mãi. Đổi = mọi mật khẩu hỏng. |
| `GITA_KHOA_KY` | Khoá ký chứng cứ (HMAC) | Chuỗi ngẫu nhiên bất kỳ. |
| `GITA_KHOA_THU` | Khoá gửi thư (Resend) | Chỉ cần nếu gửi email xác nhận. |

Tuỳ chọn (mặc định TẮT): `GITA_KHOA_NGANHANG`, `GITA_KHOA_VE`/`GITA_CONG_VE` (bộ tạo ảnh ngoài).

---

*Gói do phiên khôi phục + nâng cấp thiết kế dựng ra. Bộ gộp: `node tools/gop-src.js`.*
