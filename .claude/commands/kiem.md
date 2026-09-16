---
description: Chạy bộ kiểm phát hành ở chế độ im — chỉ in chỗ đỏ
---

Chạy `xvfb-run -a node tools/kiem-tra.js --im` và báo lại kết quả.

Luật khi đọc kết quả:
- Xanh hết thì nói một dòng, không kể lể.
- Có chỗ đỏ thì đọc số mục in kèm, mở đúng mục ấy trong `tools/kiem-tra.js`
  để hiểu phép đo đang đòi gì, rồi sửa **chỗ hỏng thật** — không nới phép
  kiểm cho vừa dữ liệu.
- KHÔNG chạy bản đầy đủ (không có `--im`) trừ khi tôi bảo. Bản đầy đủ in
  ra 80.614 ký tự; bản im in 184 và vẫn chạy đủ 759 phép đo.
