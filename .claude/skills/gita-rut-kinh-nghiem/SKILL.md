---
name: gita-rut-kinh-nghiem
description: Rút kinh nghiệm sau một phiên làm việc dài trên GITA365 và đề xuất cải tiến môi trường (phép kiểm tự động, chỉ dẫn, skill). Chỉ đề xuất, không tự sửa.
disable-model-invocation: true
---

# Rút kinh nghiệm

Đọc lại phiên làm việc. Liệt kê chỗ tốn công vô ích, chỗ suýt làm hỏng, chỗ phải hỏi lại — nặng nhất trước. Với mỗi chỗ, đề xuất MỘT cải tiến theo thứ tự ưu tiên:

1. **Phép kiểm máy chạy được** (thêm vào `tools/thu-ky-luat.mjs` hoặc một `tools/thu-*.mjs`) — luật cơ học thì để máy canh, không viết thành lời dặn.
2. **Chỉ dẫn điều hướng** ngắn trong `CLAUDE.md` (chỉ chỗ tìm, không chép nội dung).
3. **Sửa / thêm skill** trong `.claude/skills/` khi đó là phán đoán cần ngữ cảnh.
4. **Từ mới** vào `docs/TU_DIEN.md`.

Trình bày danh sách cho chủ hệ chọn; chỉ làm mục được chọn.
