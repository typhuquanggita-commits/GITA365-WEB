# GITA 365 — HƯỚNG DẪN TRIỂN KHAI (Cloudflare + GitHub)

> Bản full 9.99.252 · T5-PRO/R5, 20 mẫu nghi thức, QR thanh toán và Studio MC nội bộ, Xưởng phim ngắn AI (phim dọc 9:16, làm tự động A-Z từ kịch bản, bộ phim 10 tập × 5 phút theo vấn đề khảo sát của khách).
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
        ├──►  Cloudflare Pages   →  https://gita365.pages.dev
        │                            phần tĩnh: index.html · gita-app.js · assets · kho/*.enc
        │                            (lấy từ artifact được GitHub Actions dựng — CÔNG KHAI, KHÔNG khoá)
        │
        └──►  Cloudflare Worker  →  máy chủ: đăng nhập · cấp khoá · CRM · nhật ký · tài chính
                                     (mã ở may-chu/ — khoá nằm trong SECRET, không ở repo)
```

Hiện phần tĩnh chạy tại `gita365.pages.dev` và API tại
`gita365.typhuquanggita.workers.dev`. Ứng dụng đã đặt sẵn đúng địa chỉ API
trong `cau-hinh.js`. Đây là địa chỉ chính thức duy nhất — dự án không dùng
tên miền riêng. Hai đầu khác origin nên `GITA_DIA_CHI_WEB` trong
`may-chu/wrangler.toml` phải chứa `https://gita365.pages.dev` (xem `docs/MAY_CHU.md`).

---

## PHẦN 1 — CLOUDFLARE PAGES (phần tĩnh, công khai)

**Thứ tự phát hành an toàn:** hoàn thành migration D1, đồng bộ secret khóa và triển khai
Worker ở Phần 2 trước; chỉ phát hành Pages sau khi Worker đã sẵn sàng. Không phát hành
riêng Pages mới vì màn T5-PRO mới cần API quyền và bảng `quyenT5Pro`.

1. Trong Cloudflare, tạo Pages project tên **`gita365`** (production branch:
   `main`). URL production phải là `https://gita365.pages.dev`.
2. Trong **GitHub → Settings → Secrets and variables → Actions**, tạo hai
   repository secrets: `CLOUDFLARE_API_TOKEN` (quyền **Cloudflare Pages: Edit**
   và **Workers Scripts: Edit**) và `CLOUDFLARE_ACCOUNT_ID` (đúng 32 ký tự hex).
   Dán token nguyên văn, không thêm dấu nháy, khoảng trắng hay xuống dòng cuối.
   Workflow xác minh token trước khi gọi Wrangler và không in giá trị bí mật.
3. Đẩy thay đổi vào nhánh `main` của repo `GITA365-WEB`. Workflow
   **Deploy GITA365 to Cloudflare** tự dựng lại `gita-app.js` và `gita-nghe.js`
   từ `src/`, chỉ đóng gói tệp public, rồi phát hành lên Pages. Không phát hành
   `may-chu/`, `tools/`, `kho-goc/` hoặc bất kỳ khóa nào.
4. Mở **Actions → Deploy GITA365 to Cloudflare** và đợi job **Deploy static
   application** thành công. Kiểm tra `https://gita365.pages.dev/`.

> Mỗi thay đổi frontend trong `src/` được đưa vào bundle trong chính pipeline;
> không cần chạy hoặc commit thủ công `node tools/gop-src.js`. Thay đổi dưới
> `may-chu/` kích hoạt Worker trước; health check phải xác nhận Worker phản hồi
> và đã nạp keyset thì workflow mới phát hành Pages.

### Xử lý lỗi xác thực Cloudflare

Nếu Actions báo `Headers.append: ... is an invalid header value`, GitHub đã che
giá trị thực vì đây thường là secret. Kiểm tra lại hai secret trên mà không đưa
chúng vào log; nếu token có xuống dòng/khoảng trắng, hãy tạo secret mới. Nếu token
hợp lệ nhưng không đủ quyền, tạo API Token mới có `Cloudflare Pages: Edit` và
`Workers Scripts: Edit`, rồi cập nhật `CLOUDFLARE_API_TOKEN`. Đảm bảo
`CLOUDFLARE_ACCOUNT_ID` lấy từ đúng tài khoản Cloudflare của dự án. Không đưa
token vào tệp, lệnh shell có echo, issue hoặc tin nhắn.

Nếu job **Deploy API worker** báo `CLOUDFLARE_ACCOUNT_ID must be the 32-character hexadecimal Cloudflare account ID`,
workflow đã dừng trước khi gọi Cloudflare. Lấy **Account ID** của tài khoản
Cloudflare chứa dự án, không phải `database_id` của D1 hay ID của Worker, rồi
cập nhật secret `CLOUDFLARE_ACCOUNT_ID` trong GitHub Actions. Sau đó chạy lại
workflow; không cần thay đổi mã nguồn.

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

# 4) (Gửi thư) Chưa có tên miền riêng → dựng CẦU NỐI GMAIL theo
#    docs/MAY_CHU.md ("Dựng cầu nối Gmail"), rồi:
#      npx wrangler secret put GITA_CAU_NOI_GMAIL
#      npx wrangler secret put GITA_KHOA_CAU_NOI
#    Thư đi từ typhuquanggita@gmail.com (~100 người nhận/ngày).
#    Khi có tên miền: điền GITA_THU_GUI_TU + GITA_KHOA_THU (Resend) và
#    xác thực SPF/DKIM — Resend thành đường dự phòng/mở rộng.

# 5) Đưa Worker lên lần đầu. Những thay đổi may-chu/ tiếp theo
#    được GitHub Actions triển khai tự động sau khi đã có hai secrets ở Phần 1.
npx wrangler deploy
```

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
| `GITA_KHOA_THU` | Khoá gửi thư (Resend) | Chỉ cần nếu gửi qua Resend (cần tên miền đã xác minh). |
| `GITA_CAU_NOI_GMAIL` / `GITA_KHOA_CAU_NOI` | URL + khoá cầu nối Gmail (Apps Script) | Đường gửi thư chính hiện nay, từ typhuquanggita@gmail.com. |

Tuỳ chọn (mặc định TẮT): `GITA_KHOA_NGANHANG`, `GITA_KHOA_VE`/`GITA_CONG_VE` (bộ tạo ảnh ngoài).

---

*Gói do phiên khôi phục + nâng cấp thiết kế dựng ra. Bộ gộp: `node tools/gop-src.js`.*
