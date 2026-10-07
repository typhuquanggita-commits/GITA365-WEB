---
name: gita-sua-loi
description: Quy trình sửa lỗi có kỷ luật cho GITA365 — dựng vòng tái hiện đỏ trước, rồi giả thuyết, rồi sửa kèm phép thử chặn tái phát. Use when the user reports a bug, "lỗi", "không chạy", "bị hỏng", "sai số", a CI failure, or a production incident. Not for casual questions.
---

# Sửa lỗi

## 1. Vòng đỏ trước đã — chưa có lệnh tái hiện được lỗi thì chưa đoán nguyên nhân

Chọn một lệnh **nhanh, lặp lại được, máy tự chạy** và in ra đúng triệu chứng chủ hệ tả:
- Lỗi máy chủ: phép thử node:sqlite gọi thẳng hàm cửa (mẫu: `tools/thu-credit.mjs`, `tools/thu-toi-uu.mjs`).
- Lỗi màn hình: Chromium headless đăng nhập tài khoản mẫu đúng vai, mở màn, soi DOM/lỗi JS ở 390px.
- Số lệch giữa app và máy chủ: chạy cả hai bản công thức trên cùng bộ số.
- CI đỏ: chạy đúng lệnh `run:` đang đỏ ở máy.

**Done when:** lệnh đã chạy và ĐỎ đúng triệu chứng.

## 2. Thu nhỏ & giả thuyết
Thu ca tái hiện tới nhỏ nhất. Viết 3–5 giả thuyết, mỗi cái kèm cách bác bỏ; thử cái rẻ nhất trước.

## 3. Đo
Dấu gỡ lỗi tạm gắn nhãn `[DEBUG-xxxx]` (4 ký tự ngẫu nhiên) để một lệnh grep gỡ sạch. `tools/thu-ky-luat.mjs` (K3) chặn đẩy nếu còn sót.

## 4. Sửa + phép thử chặn tái phát
Sửa gốc, không vá ngọn. Thêm phép thử vào `tools/thu-*.mjs` đúng chỗ ranh giới (cửa máy chủ, hàm công thức thuần) và đưa vào `.github/workflows/kiem-tra.yml` nếu là tệp mới. Không tìm được chỗ đặt phép thử = một phát hiện về kiến trúc, ghi lại cho chủ hệ.

## 5. Dọn & báo
Gỡ mọi `[DEBUG-…]`. Dữ liệu cá nhân của khách trong nhật ký/ảnh chụp: che thành `<ĐÃ CHE>`. Báo bằng skill `gita-bao-cao-chu-he`.
