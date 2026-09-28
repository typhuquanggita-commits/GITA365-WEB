# GITA 365 — HƯỚNG DẪN TRIỂN KHAI (Cloudflare + GitHub)

> Bản full 9.99.241 · sửa phiên/cấp khoá, bảo vệ khởi tạo quản trị và tương thích PBKDF2 với Cloudflare Workers.
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
        ├──►  GitHub Pages       →  phần tĩnh: index.html · gita-app.js · assets · kho/*.enc
        │                            (lấy trực tiếp từ repo — CÔNG KHAI, KHÔNG khoá)
        │
        └──►  Cloudflare Worker  →  máy chủ: đăng nhập · cấp khoá · CRM · nhật ký · tài chính
                                     (mã ở may-chu/ — khoá nằm trong SECRET, không ở repo)
```

Cùng một tên miền (ví dụ `gita.edu.vn`): Pages phục vụ phần tĩnh, Worker giữ route `/api/*`.
Cùng tên miền thì không có CORS, không có lượt gọi thăm dò trước mỗi yêu cầu.

---

## PHẦN 1 — GITHUB PAGES (phần tĩnh, công khai)

1. Đẩy thay đổi vào nhánh `main` của repo `GITA365-WEB`.
2. GitHub Actions tự gom các tệp tĩnh cần thiết và phát hành; không cần `web-app.zip`
   hay nối lại repo với Cloudflare Pages.
3. Mở **Actions → Publish GITA365 Web App** và đợi trạng thái xanh.
4. Kiểm tra `https://typhuquanggita-commits.github.io/GITA365-WEB/`. Máy chủ cấp phép
   Cloudflare đã được khai mặc định trong `cau-hinh.js`; không cần dán địa chỉ bằng tay.

## PHẦN 2 — CLOUDFLARE WORKER (máy chủ, có khoá)

Mở terminal trong thư mục `may-chu/` rồi làm 5 việc (đã ghi sẵn trong `wrangler.toml`):

```bash
cd may-chu

# 1) Tạo cơ sở dữ liệu, dán database_id vào wrangler.toml
npx wrangler d1 create gita365

# 2) Dựng bảng
npx wrangler d1 execute gita365 --file=csdl.sql --remote

# 3) NẠP CÁC SECRET — tuyệt đối không đưa giá trị vào Git:
bash nap-bi-mat.sh /duong/dan/toi/khoa.json
#   (hoặc: cat khoa.json | npx wrangler secret put GITA_KHOA_KHO)
#   Nạp GITA_TIEU bằng giá trị ngẫu nhiên, lưu lại an toàn và KHÔNG đổi
#   sau khi đã có tài khoản; mất secret này thì không thể xác thực mật khẩu.
#   Trước khi tạo Super Admin đầu tiên, nạp thêm GITA_TAO_ADMIN bằng một
#   secret ngẫu nhiên dùng một lần; xoá secret này ngay sau khi tạo xong.

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
| `GITA_TAO_ADMIN` | Mã khởi tạo Super Admin đầu tiên | Chỉ cần khi khởi tạo; xoá ngay sau khi tạo tài khoản. |
| `GITA_KHOA_KY` | Khoá ký chứng cứ (HMAC) | Chuỗi ngẫu nhiên bất kỳ. |
| `GITA_KHOA_THU` | Khoá gửi thư (Resend) | Chỉ cần nếu gửi email xác nhận. |

Tuỳ chọn (mặc định TẮT): `GITA_KHOA_NGANHANG`, `GITA_KHOA_VE`/`GITA_CONG_VE` (bộ tạo ảnh ngoài).

---

*Gói do phiên khôi phục + nâng cấp thiết kế dựng ra. Bộ gộp: `node tools/gop-src.js`.*
