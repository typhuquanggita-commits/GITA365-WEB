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
- V50·168 (`src/v50-man.js`): cột trái = MÀN CHÍNH, tách HAI KHU. Khách (R13–R15, khách lạ) chỉ thấy 3 màn khu khách, không một dấu vết nghiệp vụ nhân sự. Nhân sự: Khu vực nhân sự (R06–R12 tối đa 5 · R03–R05 tối đa 10) + Khu vực khách hàng xem theo quyền. R01–R02 hiển thị 100% (10 + 5). Màn mới phải là PHẦN của một màn chính (danh mục ≤ 168) hoặc chương trong một kho nghề `kn-*`; `tools/thu-v50-168.mjs` canh mọi màn đều khớp một màn chính.
- Cấp quyền (mở tài khoản, đổi vai, quyền CRM / T5-PRO / ký nội dung / vị trí tài chính, phòng ban, ba cửa, bảng phân quyền) CHỈ R01, gác ở máy chủ; Admin hệ thống thấy màn cấp quyền ở chế độ xem. Khung bảng CRM · Tài chính: `tools/dung-khung-du-lieu.js` (CI kiểm khớp `csdl.sql`).

## Trợ lý chat (`src/tro-ly-hoi-thoai.js` đứng trước bộ tra kho)
- Sáu bước mỗi lượt: hồ sơ vai (cấp · tầng · phạm vi) → suy luận loại câu → phương án theo NHÓM VAI → kiểm giới hạn (màn mở được, phần nền, cổng phí) → trả lời → dẫn đúng MỘT màn tiếp theo mà vai mở được.
- Khách: mỗi lượt một câu đón · một ý chính · MỘT câu hỏi; không đổ danh sách tư liệu, không lộ chữ nội bộ (kho, mã, trần %). Phụ huynh đi chuỗi chẩn đoán; học viên và đại sứ thì không. Câu xã giao không tra kho, không ghi nhớ. Đường khẩn luôn đi trước.
- Thêm một bộ phận mới vào câu trả lời thì đi qua lớp này, đừng nối thẳng vào `theDap`. `tools/thu-tro-ly-hoi-thoai.mjs` canh.

## Quy trình (skill trong `.claude/skills/`)
- Trước mọi commit/push: `gita-kiem-truoc-khi-day`.
- Thêm/sửa cửa máy chủ: `gita-them-cua-may-chu`. Sửa lỗi: `gita-sua-loi`.
- Yêu cầu mơ hồ / cần quyết định kinh doanh: `gita-hoi-chu-he`. Báo cáo cuối việc: `gita-bao-cao-chu-he`.

## Gỡ hẳn — CHỈ KHI CHỦ HỆ RA LỆNH
Không xoá mã màn, cửa máy chủ, bảng dữ liệu hay tệp nào đã gộp / đã rút (V50 GOP · CUM · AN) khi chủ hệ chưa ra lệnh gỡ bằng lời rõ ràng trong phiên làm việc. Gộp, ẩn, chuyển hướng thì được (đảo ngược được); gỡ hẳn thì không.

## Không chạm (trừ khi chủ hệ yêu cầu rõ)
`crm.js` · `kho/*.enc` · giấy phép · `studio.js` · `kho-goc/` · `kho/khoa.json`. Khoá thật chỉ ở Cloudflare/GitHub Secrets.
