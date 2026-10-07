# GITA365 — chỉ dẫn cho trợ lý lập trình

Chủ hệ: anh Trương Nhật Quang (không phải dân kỹ thuật, viết tiếng Việt). **Đẩy lên `main` = triển khai production.**

## Bản đồ
- App: `src/*.js` (ES5) → gộp bằng `node tools/gop-src.js` thành `gita-app.js` · `gita-nghe.js` (**phải giữ nguyên từng byte**). Danh sách gộp: `tools/danh-sach-src.json`.
- Máy chủ: Cloudflare Worker `may-chu/worker.js` (cửa đăng ký ở `CAN_PHIEN` + nhánh `if (fn === …)`), D1 lược đồ `may-chu/csdl.sql`.
- Kiểm thử: mọi `run:` trong `.github/workflows/kiem-tra.yml`; luật cơ học ở `tools/thu-ky-luat.mjs`.
- Từ ngữ chủ hệ ↔ tên trong mã: `docs/TU_DIEN.md`. Tài liệu vận hành: `docs/`.

## Luật màn hình V50 (`src/data-v50.js`)
- Màn mới phải là **công cụ** (người dùng làm được việc, có dữ liệu thật hoặc nhãn "Ví dụ minh hoạ", đo được) — hoặc là học thuyết thì **vào một cụm** trong `G.V50.CUM`, không thêm mục rời vào cột trái nhân sự.
- Màn trùng / số mẫu: thêm vào `G.V50.GOP` (chuyển sang công cụ sống), không xoá đăng ký `G.VIEWS` (do-16-he canh khoá màn).
- Không gian vai `src/khong-gian.js` chỉ trỏ vào công cụ sống; `tools/thu-ap-dung.mjs` canh.

## Quy trình (skill trong `.claude/skills/`)
- Trước mọi commit/push: `gita-kiem-truoc-khi-day`.
- Thêm/sửa cửa máy chủ: `gita-them-cua-may-chu`. Sửa lỗi: `gita-sua-loi`.
- Yêu cầu mơ hồ / cần quyết định kinh doanh: `gita-hoi-chu-he`. Báo cáo cuối việc: `gita-bao-cao-chu-he`.

## Không chạm (trừ khi chủ hệ yêu cầu rõ)
`crm.js` · `kho/*.enc` · giấy phép · `studio.js` · `kho-goc/` · `kho/khoa.json`. Khoá thật chỉ ở Cloudflare/GitHub Secrets.
