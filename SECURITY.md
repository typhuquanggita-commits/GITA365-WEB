# Chính sách an ninh — GITA 365

## Báo lỗ hổng

Đừng mở issue công khai. Gửi riêng về hộp thư chính thức của Học viện:
**typhuquanggita@gmail.com**, tiêu đề bắt đầu bằng `[AN NINH]`. Ghi: chỗ lỗi,
cách tái hiện, mức ảnh hưởng. Học viện trả lời trong 3 ngày làm việc.

Bản đang được vá là bản chạy ở **https://gita365.pages.dev** (nhánh `main`).

## Các lớp bảo vệ đang chạy

| Lớp | Ở đâu | Chặn gì |
|---|---|---|
| Khoá chỉ ở Cloudflare/GitHub Secrets | `wrangler secret`, Settings → Secrets | Không khoá thật nào nằm trong kho mã |
| Danh sách trắng trang công khai | `tools/dung-site.sh` | Chỉ trang, `assets/`, `kho/*.enc` lên mạng; mã máy chủ, công cụ, tệp nén thì không |
| Cổng kiểm trước khi triển khai | `deploy.yml` → job `kiem` | Bộ kiểm đỏ thì không triển khai |
| Dò khoá rò | `tools/soat-bi-mat.js` (bản hiện tại) · gitleaks (toàn bộ lịch sử) | Khoá API, token, khoá riêng |
| Móc chặn commit | `.githooks/pre-commit` → `tools/chan-commit.mjs` | Tệp mật, tệp nén, tệp > 8 MB, dáng khoá |
| Soát quy trình CI | actionlint · zizmor (`an-ninh.yml`) | Chèn lệnh, quyền thừa, action chưa ghim |
| Ghim chuỗi cung ứng | mọi action ghim theo mã commit; công cụ tải về đối chiếu SHA-256 | Bản phát hành bị tráo |
| CSP + tiêu đề an ninh | `index.html`, `_headers` | Nạp mã lạ, nhúng khung |

## Cài móc chặn commit trên máy (một lần)

```bash
git config core.hooksPath .githooks
```

Móc chỉ chạy trên máy đã cài. Tệp tải lên qua trang web GitHub không đi qua
móc nào — bộ kiểm CI (`chan-commit.mjs --tat-ca`) là lớp bắt đường ấy.

## Lỡ đưa khoá lên GitHub

Xoá tệp **không đủ** — git nhớ mãi và kho là công khai. Làm theo thứ tự:

1. **Xoay khoá ngay** ở nhà cung cấp (Cloudflare, OpenAI, Kaggle…): khoá cũ coi như đã lộ.
2. Nạp khoá mới bằng `wrangler secret put …` hoặc GitHub Secrets.
3. Gỡ tệp khỏi kho, rồi báo về hộp thư trên.
