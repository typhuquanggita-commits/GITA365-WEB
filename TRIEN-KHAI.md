# GITA 365 — HƯỚNG DẪN TRIỂN KHAI (Cloudflare + GitHub)

> Bản full 9.99.249 · T5-PRO/R5, 20 mẫu nghi thức, QR thanh toán và Studio MC nội bộ.
> Đọc phần ⚠ BẢO MẬT trước tiên.

---

## ⚠ BẢO MẬT — ĐỌC TRƯỚC KHI LÀM BẤT KỲ VIỆC GÌ

**KHOÁ GIẢI MÃ (giấy phép / `khoa.json`) KHÔNG BAO GIỜ ĐƯỢC ĐƯA LÊN GITHUB.**

- Repo GitHub là **công khai**. Kho nội dung `kho/*.enc` đã mã hoá — vô hại nếu để công khai
  vì **không có khoá thì không mở được**.
- Nhưng nếu đưa **khoá** (8 khoá AES trong giấy phép) lên GitHub, bất kỳ ai cũng giải mã được
  **toàn bộ nội dung chuyên môn** của Học viện. Đó là mất tài sản, và không lấy lại được.
- Khoá chỉ nằm **một chỗ duy nhất**: trong **secret của Cloudflare Worker** (`GITA_KHOA_KHO`).
  Máy khách xin khoá từ Worker sau khi đăng nhập, giải mã trong bộ nhớ, không lưu lại.
- Worker chỉ cấp các gói có khóa tương ứng. Nếu thiếu khóa một gói, các gói còn khóa vẫn mở
  và ứng dụng nêu rõ gói chưa thể mở; không thể suy ra khóa thay thế từ tệp `.enc`.
- T5-PRO nằm trong `nghe-cao`: R01–R02 nhận theo vai; nhân sự R03–R12 chỉ nhận khóa
  khi quyền cá nhân còn hạn trong D1. Việc cấp/thu hồi ghi lý do và nhật ký máy chủ.
  Thu hồi chặn các lượt xin khóa sau đó; không xóa được nội dung đã giải mã trong phiên đang mở.
- QR và thông tin nhận tiền không được thêm dạng rõ vào Pages/bundle. R01–R02 cấu hình
  trong màn **Quy trình tài chính**; D1 lưu cấu hình hiện hành và Worker chỉ trả cho phiên
  R01–R04 hoặc R13–R14 qua API màn thanh toán. Phải áp dụng schema D1 trước khi
  triển khai Worker/Pages; sau khi phát hành, Admin tải QR lên và lưu cấu hình.
- Studio MC hiện xử lý ảnh tham chiếu/âm thanh cục bộ, tạo xem trước chuyển động 2.5D
  và phối âm. Chưa có renderer 3D nội bộ hoặc xuất tệp phim; không gửi media tới dịch vụ ngoài.
- Gói này **không** chứa khoá. File `.gitignore` cũng chặn sẵn `kho/khoa.json` và `giay-phep/`.

---

## Kiến trúc triển khai

```
   Trình duyệt khách
        │
        ├──►  Cloudflare Pages   →  https://gita365-web.pages.dev
        │                            phần tĩnh: index.html · gita-app.js · assets · kho/*.enc
        │                            (lấy từ artifact được GitHub Actions dựng — CÔNG KHAI, KHÔNG khoá)
        │
        └──►  Cloudflare Worker  →  máy chủ: đăng nhập · cấp khoá · CRM · nhật ký · tài chính
                                     (mã ở may-chu/ — khoá nằm trong SECRET, không ở repo)
```

Hiện phần tĩnh chạy tại `gita365-web.pages.dev` và API tại
`gita365.typhuquanggita.workers.dev`. Ứng dụng đã đặt sẵn đúng địa chỉ API
trong `cau-hinh.js`. Khi đưa `gita.edu.vn` vào Cloudflare, có thể cấu hình
Pages cho tên miền này và Worker cho route `/api/*` để hai đầu cùng một origin.

---

## PHẦN 1 — CLOUDFLARE PAGES (phần tĩnh, công khai)

**Thứ tự phát hành an toàn:** hoàn thành migration D1, đồng bộ secret khóa và triển khai
Worker ở Phần 2 trước; chỉ phát hành Pages sau khi Worker đã sẵn sàng. Không phát hành
riêng Pages mới vì màn T5-PRO mới cần API quyền và bảng `quyenT5Pro`.

1. Trong Cloudflare, tạo Pages project tên **`gita365-web`** (production branch:
   `main`). URL production phải là `https://gita365-web.pages.dev`.
2. Trong Cloudflare Pages → **Settings → Builds & deployments**, đặt production
   branch `main`, build command `node tools/gop-src.js && node tools/build-pages.js`
   và output `_site`.
3. Cloudflare Pages Git Integration tự phát hành project `gita365-web` sau mỗi
   thay đổi trên `main`. GitHub Actions **Validate GITA365 Pages release** chỉ
   dựng/kiểm tra artifact công khai, nên không cần Pages token hoặc Account ID.
   Lệnh build không phát hành `may-chu/`, `tools/`, `kho-goc/` hoặc bất kỳ khóa nào.
4. Kiểm tra `https://gita365-web.pages.dev/` sau khi Cloudflare Pages báo deploy
   thành công. Pages này không liên kết với `gita.edu.vn`.

> Mỗi thay đổi frontend trong `src/` được Cloudflare dựng lại từ nguồn theo build
> command trên. Thay đổi dưới `may-chu/` dùng workflow Worker chạy thủ công sau
> khi migration D1, R2 và secret đã sẵn sàng.

GitHub Actions kiểm tra bundle, phiên bản, CSP, header và private path trước khi
merge; workflow **Monitor Cloudflare production** kiểm tra Pages cùng Worker/D1/
keyset mỗi giờ. Bất cứ lỗi nào tạo một workflow failure để người quản lý nhận
cảnh báo. Chỉ font tĩnh trong `assets/fonts/` được cache immutable; HTML, service
worker, bundle và client configuration luôn `no-cache`.

Cloudflare Workers Builds không dùng cho `gita365` hoặc `gita365-web`: ngắt Git
integration/automatic builds tại **Workers → service → Settings → Builds**. Chỉ
Pages project `gita365-web` giữ Git integration. Điều này tránh hai Workers
Build checks sai mà vẫn để Pages phát hành tự động.

## PHẦN 2 — CLOUDFLARE WORKER (máy chủ, có khoá)

Mở terminal trong thư mục `may-chu/` rồi làm 5 việc (đã ghi sẵn trong `wrangler.toml`):

```bash
cd may-chu

# 1) Tạo cơ sở dữ liệu, dán database_id vào wrangler.toml
npx wrangler d1 create gita365

# 2) Dựng/áp dụng bảng (bao gồm quyền T5-PRO và cấu hình QR trước Worker mới)
npx wrangler d1 execute gita365 --file=csdl.sql --remote

# 3) NẠP CÁC SECRET — tuyệt đối không đưa giá trị vào Git:
bash nap-bi-mat.sh /duong/dan/toi/khoa.json
#   Trước khi phát hành các gói .enc mới, cập nhật secret bằng đúng bộ
#   khoa.json 8 khoá tương ứng; Pages và Worker phải được phát hành đồng bộ.
#   Quy trình phát hành: áp dụng schema D1 trước, cập nhật secret khóa,
#   sau đó triển khai Worker và Pages. Không triển khai Worker mới nếu bảng
#   quyenT5Pro chưa được tạo.
#   (hoặc: cat khoa.json | npx wrangler secret put GITA_KHOA_KHO)
#   Nạp GITA_TIEU bằng giá trị ngẫu nhiên, lưu lại an toàn và KHÔNG đổi
#   sau khi đã có tài khoản; mất secret này thì không thể xác thực mật khẩu.
#   Trước khi tạo Super Admin đầu tiên, nạp thêm GITA_TAO_ADMIN bằng một
#   secret ngẫu nhiên dùng một lần; xoá secret này ngay sau khi tạo xong.

# 4) (Tên miền) xác thực gita.edu.vn ở nhà gửi thư — SPF/DKIM (xem wrangler.toml)

# 5) Đưa Worker lên lần đầu. Các thay đổi Worker tiếp theo dùng workflow
#    GitHub **Deploy GITA365 API Worker** và chỉ chạy thủ công sau khi
#    migration/backup đã xác nhận, hạ tầng/secret Worker đã sẵn sàng; nó
#    không chặn Pages.
npx wrangler deploy
```

Thiết lập GitHub Environment `cloudflare-worker-production` với required
reviewers trước khi chạy workflow Worker. Workflow yêu cầu hai xác nhận:
migration D1 cho bản phát hành đã áp dụng và backup/rollback đã kiểm tra; sau đó
mới truy cập secret/deploy và health-check. Rollback Pages dùng deployment trước
trong Cloudflare Pages; rollback Worker phục hồi schema/backup đã xác nhận rồi
deploy lại commit/tag tốt gần nhất.

## PHẦN 3 — NỐI HAI ĐẦU

Mở app → đăng nhập **Super Admin** → **Quản trị trang → Nối máy chủ** → dán địa chỉ Worker → **Lưu** → **Gọi thử**.
Thấy **số khoá > 0** là xong. Đổi địa chỉ máy chủ đảo ngược được trong một phút.

---

## Bốn bí mật của Worker (nạp bằng lệnh, KHÔNG viết vào file)

| Secret | Là gì | Lưu ý |
|---|---|---|
| `GITA_KHOA_KHO` | Nội dung `khoa.json` (8 khoá giải mã kho) | Chìa mở toàn bộ nội dung. Chỉ ở đây; phải khớp các gói `.enc` đang phát hành. |
| `GITA_TIEU` | Tiêu băm mật khẩu | Sinh **một lần**, giữ mãi. Đổi = mọi mật khẩu hỏng. |
| `GITA_TAO_ADMIN` | Mã khởi tạo Super Admin đầu tiên | Chỉ cần khi khởi tạo; xoá ngay sau khi tạo tài khoản. |
| `GITA_KHOA_KY` | Khoá ký chứng cứ (HMAC) | Chuỗi ngẫu nhiên bất kỳ. |
| `GITA_KHOA_THU` | Khoá gửi thư (Resend) | Chỉ cần nếu gửi email xác nhận. |

Tuỳ chọn (mặc định TẮT): `GITA_KHOA_NGANHANG`, `GITA_KHOA_VE`/`GITA_CONG_VE` (bộ tạo ảnh ngoài).

---

*Gói do phiên khôi phục + nâng cấp thiết kế dựng ra. Bộ gộp: `node tools/gop-src.js`.*
