---
description: Đóng gói lại kho, gộp mã, dựng bản một tệp
---

Chạy theo đúng thứ tự này, dừng lại ngay nếu bước nào báo lỗi:

1. `node tools/ma-hoa-kho.js`
2. `node tools/soi-doi-kho.js` — nhìn kỹ phần "CHỖ CẦN NHÌN KỸ".
   **Có bản ghi nào ít đi là DỪNG**, đừng đi tiếp; nội dung ít đi hầu như
   luôn là hỏng chứ không phải sửa.
3. `node tools/gop-src.js`
4. `python3 tools/dong-goi.py`

Báo lại: kho nào đổi, bao nhiêu bản ghi, cỡ tệp dựng ra. Ngắn gọn.
