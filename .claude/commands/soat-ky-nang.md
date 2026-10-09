---
description: Soát một kỹ năng hay plugin từ bên ngoài trước khi đưa vào kho
---

Mọi kỹ năng, plugin, hook lấy từ bên ngoài phải qua lệnh này trước khi chép vào `.claude/`
hay `xuong-ai/`. Đối số là đường dẫn thư mục kỹ năng đã tải về máy (không dán địa chỉ git:
tự tải về một thư mục riêng trước, để đọc được tận mắt).

1. Chạy `python3 -I .claude/skills/skill-security-auditor/scripts/skill_security_auditor.py <thư mục> --strict`.
2. Đọc tay SKILL.md và mọi tệp mã, kể cả khi kết quả là PASS. Máy soát bắt mẫu, không hiểu ý.
3. Loại ngay, bất kể kết quả soát, nếu kỹ năng:
   - tự sửa mã hay tự sửa kỹ năng (ví dụ skillopt-sleep, self-improving-agent);
   - tự đẩy mã, ghép mã, phát hành, hay tự cấp quyền;
   - gọi dịch vụ AI trả phí, hoặc gửi dữ liệu ra mạng lúc chạy;
   - cài bằng `curl ... | bash` hay đòi bỏ qua bước xác nhận;
   - đụng tới `kho-goc/`, `kho/`, khoá, `crm.js`, giấy phép, `studio.js`, `gita-nghe.js`.
4. Qua được thì chép vào, kèm `LICENSE` gốc và một tệp `NGUON.md` ghi: kho nguồn, commit,
   giấy phép, kết quả soát, và mọi chỗ đã sửa so với bản gốc.

Báo lại cho tôi: tên kỹ năng, kết quả soát, lý do nhận hay loại. Không tự cài khi tôi chưa đồng ý.
