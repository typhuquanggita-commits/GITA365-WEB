# Soát toàn diện GITA365-WEB — 9/10/2026

Chủ hệ yêu cầu: hệ chạy mượt mọi phần; thiếu thì bổ sung; dư thừa thì loại;
độc hại thì cắt và dựng lớp chặn cho các lượt sau; tăng cường bảo mật.

Cách soát: ba tổ soát độc lập chỉ đọc (máy chủ Worker · giao diện + mã độc ·
CI + chuỗi cung ứng + vệ sinh kho), mỗi lỗi phải **chạy thật** mới báo; cộng
một lượt chạy trình duyệt thật qua 8 vai.

## Kết quả đo

| Phép đo | Kết quả |
|---|---|
| Trình duyệt thật, 8 vai (R01·R03·R05·R07·R10·R13·R14·R15) | 1.958 lượt mở màn · **0 lỗi dựng màn · 0 màn trống** |
| 14 trang công khai, khổ 390px và 1280px | không cuộn ngang; **5 trang lỗi 404** (đã sửa, xem dưới) |
| Mã độc (đào coin, gửi dữ liệu lén, mã làm rối, `curl \| bash`) | **không có** |
| Khoá rò trong toàn bộ lịch sử git (gitleaks + dò tay) | **không có** — không khoá nào cần xoay |
| `kho/khoa.json`, `kho-goc/`, `.env`, `.pem` từng bị commit | **chưa bao giờ** |
| Lỗ máy chủ mức NGHIÊM TRỌNG / CAO | **không có** |

## Đã sửa

| Mức | Chỗ | Sửa |
|---|---|---|
| CAO | `main` triển khai thẳng, không chờ bộ kiểm | `deploy.yml` gọi `kiem-tra.yml` làm cổng; trang chỉ lên khi Worker lên thành công |
| CAO (có điều kiện) | `dung-phim-drive.yml` ghi `du_an` do người dùng soạn vào `GITHUB_ENV` | soát `^[A-Za-z0-9_-]{0,80}$` trước khi ghi |
| VỪA | `dongBo` — một nhà gửi "xin thêm" là ghi đè lời xin của **mọi** nhà khác | gộp theo nhà; bộ thử `tools/thu-xin-them.mjs` |
| VỪA | 5 trang giới thiệu nạp `src/i18n-marketing.js` mà triển khai không chép → 404, nút tiếng Anh chết | `tools/dung-site.sh` chép; bộ thử `tools/thu-trang-cong-khai.mjs` |
| VỪA | CSP mở trọn `cdn.jsdelivr.net` (phục vụ mã của bất kỳ ai) | chỉ mở đúng thư mục `onnxruntime-web@1.18.0`; luật K7 canh tái phạm |
| VỪA | `npx wrangler@4` chạy bản mới nhất lúc chạy, cầm khoá Cloudflare | ghim `4.149.0` |
| VỪA | `download-artifact` v4.1.3 dính CVE-2024-42471 | v4.3.0 |
| THẤP | Người lạ mở `/phim/*` kích dịch vụ vẽ ảnh **trả phí** | đường công khai không gọi dịch vụ trả phí; bộ thử trong `thu-phim-phan-tu.mjs` |
| THẤP | Xuất bảng: ô bắt đầu bằng `=` chạy thành công thức trong Excel/Sheets | thêm `'` trước ô ấy |
| THẤP | Bản phụ GitHub Pages không có chống nhúng khung | `src/guard.js` tự thoát khung |
| THẤP | `jobid` của `dung-phim.yml` chưa soát; `lay-bao-cao-soat.yml` in thẳng chữ từ máy chủ ra lệnh runner | soát mã việc; làm sạch chữ; quyền ghi chỉ ở job |
| THẤP | `trang-thai.html` trỏ `assets/favicon.ico` không có | trỏ biểu tượng có thật |
| THẤP | `.gitignore` hở `.env` `.dev.vars` `.wrangler/` `*.pem` `*.key` `.venv/` | đã chặn; luật K4 canh |
| THẤP | Máy chủ thử `khoi-dong.sh` nghe mọi địa chỉ | chỉ `127.0.0.1`, ghim phiên bản |
| — | Mọi `actions/checkout` giữ token sau bước lấy mã | `persist-credentials: false` |

## Bổ sung từ nguồn mở nhiều sao

| Công cụ | Việc | Ghim |
|---|---|---|
| gitleaks | dò khoá rò trên toàn bộ lịch sử | v8.30.1 + SHA-256 tệp chạy |
| actionlint | soát quy trình GitHub Actions | v1.7.12 + SHA-256 |
| zizmor | soát lỗ an ninh của quy trình | 1.16.0 |
| step-security/harden-runner | ghi mọi kết nối ra ngoài của job cầm khoá | mã commit v2.22.1 |
| OpenSSF Scorecard | chấm điểm an ninh kho (đã có) | nâng lên v2.4.4 |
| Dependabot | thêm `npm` (desktop, worker phim) và `pip` (xưởng phim) | — |

## Lớp chặn cho các lượt sau

- **Móc pre-commit** `tools/chan-commit.mjs`: chặn tệp mật, khoá, tệp nén, tệp > 8 MB,
  dáng khoá. Trợ lý tự bật nó mỗi phiên (`.claude/settings.json`).
- **CI quét lại mọi tệp** (`--tat-ca`) — bắt cả tệp tải lên qua trang web GitHub.
- **Trợ lý phải hỏi** trước khi đẩy lên `main`; bị cấm `--no-verify`, `add -f`,
  đọc `.dev.vars` / `.env` / khoá riêng, sửa móc.

## Đã gỡ — và cách lấy lại

Còn nguyên trong lịch sử git, lấy lại được bất cứ lúc nào:

| Tệp | Vì sao gỡ | Lấy lại |
|---|---|---|
| `GITA365-V30-FULL.zip` (9,5 MB) | bản sao cũ 9.99.237 của chính mã đang có | `git show ec2eaba:GITA365-V30-FULL.zip > x.zip` |
| `GITA365_KAGGLE_V27_FULL.zip` | đường quay Kaggle V27, đã thay bằng `may-quay-kaggle/` | `git show 3fa3d81:GITA365_KAGGLE_V27_FULL.zip > x.zip` |
| `DOC-TRUOC-KHI-TAI-LEN.txt` | hướng dẫn tải lên một lần cho gói zip trên | `git show 2ec8164:DOC-TRUOC-KHI-TAI-LEN.txt` |

Cố ý **không** gỡ: `xuong-phim-studio.ipynb` (sổ Kaggle bấm Run được, khác tệp
`.py` ở ô hướng dẫn), `phim-phan-tu.html` (trang công khai có thể đã được chia
sẻ), `gitavideo` (chủ hệ tạo 5/10, chưa rõ dụng ý).

## Còn chờ chủ hệ — máy không làm hộ được

1. **Bảo vệ nhánh `main`** (Settings → Branches): bắt buộc qua bộ kiểm, cấm đẩy
   ép. Đổi cách làm việc (tải tệp lên trang web sẽ phải qua Pull Request), nên
   chủ hệ quyết.
2. ~~**Bản .exe**: máy chủ khoá nội bộ cấp khoá theo tên tài khoản không hỏi mật khẩu~~
   → **đã vá**: dấu máy là mã ngẫu nhiên 144 bit trong cookie HttpOnly (không còn IP +
   trình duyệt, thứ chép được); duyệt một máy là duyệt cho ĐÚNG MỘT tài khoản — máy đã
   duyệt cho Coach xin khoá Super Admin bị chặn `SAITAIKHOAN`. Bộ thử
   `tools/thu-may-chu-may-tinh.mjs`. Hệ quả: các máy đã duyệt trước bản này phải được
   duyệt lại một lần. Mạng nội bộ vẫn là HTTP thường — chỉ bật trong mạng tin cậy.
3. ~~Khoá riêng của báo cáo soát toàn màn~~ → **đã chốt**, xem mục dưới.
4. ~~**Biểu mẫu liên hệ** gửi sang `formspree.io`~~ → **đã chuyển** về Worker của Học
   viện (cửa `guiLienHe`, `may-chu/lien-he.js`): ghi **thông báo trong hệ** cho Super Admin
   + Giám đốc (đọc ở khối Hộp thông báo, đầu màn Trung tâm đo lường) VÀ thử gửi thư tới
   hòm chủ hệ — một trong hai thành là đã nhận, nên máy chủ chưa có đường thư cũng không
   rơi lời nhắn (lỗi chủ hệ gặp ngày 9/10). Đã xem quá 90 ngày thì lịch dọn xoá. Ô mồi chặn
   máy quét, trần 3 lượt/giờ/IP trên D1. Bộ thử `tools/thu-lien-he.mjs`.
7. **Dấu đỏ "Workers Builds"** trên mỗi commit: lối nối Git cũ của Cloudflare tự triển
   khai KHÔNG qua bộ kiểm. Gỡ bằng Actions → **Tắt Workers Builds** (chọn `tat`), hoặc
   bấm tay: Workers & Pages → gita365 / gita365-web → Settings → Build → Disconnect.
5. **Mô hình tải về không có dấu vân tay**: `wav2lip_gan.pth` (máy quay Kaggle)
   và điểm kiểm OpenVoice — tệp mô hình PyTorch chạy được mã khi nạp; nên ghim
   SHA-256 khi có bản tải chuẩn.
6. **CSP còn `'unsafe-inline'`** vì app dùng hàng trăm `onclick=` viết thẳng. Gỡ
   được là việc lớn: chuyển dần sang `data-*` + một bộ nghe chung.

## Đã chốt

- **Khoá riêng của báo cáo soát toàn màn** (`src/khoa-soat.js`, dấu vân tay
  `e465da4f04ff3283`) — **Super Admin đảm nhận** (chủ hệ chốt 9/10/2026).
  Chỉ Super Admin giữ khoá riêng, nên chỉ Super Admin đọc được nội dung kho trong
  báo cáo. Kéo theo: khoá riêng không được nằm trong kho mã (móc
  `tools/chan-commit.mjs` chặn `*.pem` / `*.key`), không gửi qua chat hay email;
  mất máy giữ khoá thì dựng cặp khoá mới, thay khoá công khai ở `src/khoa-soat.js`
  và coi mọi báo cáo cũ là đã lộ.
