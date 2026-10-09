---
description: Kiểm đủ rồi chốt và đẩy lên nhánh
---

Trước khi chốt, chạy đủ ba việc và chỉ đi tiếp khi cả ba sạch:

1. `node tools/soi-doi-kho.js` — không bản ghi nào ít đi
2. `xvfb-run -a node tools/kiem-tra.js --im` — không chỗ đỏ
3. `xvfb-run -a node tools/ra-soat-day-du.js` — không chỗ trống

Rồi bump số bản ở `src/data.core.js`, `desktop/package.json`, `sw.js`,
dựng lại bản một tệp, và commit.

Lời commit viết bằng tiếng Việt, nói VÌ SAO chứ không nói cái gì, và
**phải kể cả lỗi do chính lần sửa này gây ra** nếu có. Đẩy bằng
`git push -u origin claude/gita-365-ui-design-xew4bz`.

Không bao giờ `git add kho-goc/` hay `kho/khoa.json`.
