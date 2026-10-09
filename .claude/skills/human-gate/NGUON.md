# Nguồn

Chép từ github.com/alirezarezvani/claude-skills, commit 19392f7 (26/8/2026), giấy phép MIT
(xem LICENSE-MIT). Đã soát bằng skill-security-auditor và đọc tay trước khi đưa vào.

Thay đổi so với bản gốc: đường dẫn `S=` trong SKILL.md trỏ về `.claude/skills/human-gate/scripts`.
Các kỹ năng anh em được nhắc trong SKILL.md (agent-harness, grill-me, md-review) không được đưa vào.

Kết quả soát: WARN, 2 mục HIGH ở `human_gate.py` dòng 500 và 635. Dòng 500 xoá tệp trạng thái của
chính kỹ năng, và tên tệp bị ép đúng dạng 16 ký tự hex + `.json` trước khi xoá. Dòng 635 xoá
thư mục tạm do chính nó tạo, sau khi kiểm lại thư mục ấy vẫn nằm trong thư mục tạm của hệ thống.
Không xoá được tệp nào khác. Chấp nhận.
