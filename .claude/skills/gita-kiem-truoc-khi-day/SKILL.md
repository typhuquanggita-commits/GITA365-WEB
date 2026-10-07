---
name: gita-kiem-truoc-khi-day
description: Cổng soát bắt buộc TRƯỚC KHI commit / push / đẩy lên main / triển khai GITA365 (push main = triển khai production). Use when about to commit, push, deploy, "đẩy lên", "triển khai", or when the user asks to review a change.
---

# Kiểm trước khi đẩy

Đẩy lên `main` là **triển khai thật** cho khách đang dùng. Cổng này chạy trước MỌI lần đẩy.

## Bước 1 — Máy kiểm (bắt buộc, không bỏ bước nào)

Chạy đúng các lệnh CI đang chạy (`.github/workflows/kiem-tra.yml` là nguồn sự thật — đọc nó, đừng chép lại danh sách ở đây):

1. `node tools/gop-src.js` rồi `cmp gita-nghe.js <(git show HEAD:gita-nghe.js)` — **gita-nghe.js phải giữ nguyên từng byte**.
2. `node tools/gop-src.js --kiem` · `for f in may-chu/*.js; do node --check "$f"; done` · `node -e "import('./may-chu/worker.js')"`.
3. Mọi `run:` trong kiem-tra.yml (các `tools/thu-*.mjs`, `tools/thu-ky-luat.mjs`, `tools/soat-bi-mat.js`, `tools/do-16-he.js`, `tools/ra-soat-day-du.js`).
4. Màn có đổi giao diện: mở bằng trình duyệt headless (Chromium tại `/opt/pw-browsers`) ở **390px** và 1280px, cho từng vai liên quan — không tràn ngang, không lỗi JS, vai không quyền thấy thẻ khoá.

**Done when:** mọi lệnh xanh, có kết quả thật in ra (không đoán).

## Bước 2 — Soát hai trục, mỗi trục một tác tử phụ (song song, mỗi trục ≤ 400 chữ, KHÔNG gọi lại skill này)

**Trục chuẩn** — đọc diff `origin/main...HEAD`, trích dẫn dòng cho mỗi phát hiện:
- Cửa máy chủ mới: có trong `CAN_PHIEN` + nhánh `if (fn === '…')`, kiểm vai/chủ sở hữu TRƯỚC khi chạm D1, SQL dùng `?` ràng buộc, cửa chỉ-đọc không ghi audit.
- Công thức có hai bản (máy chủ `may-chu/*.js` ↔ app `src/data-*.js`): đổi một bên thì đổi cả hai và có phép thử khớp.
- Không đổi tên / xoá khoá màn mà `src/he-16.js` và các bản đồ trỏ tới (tools/do-16-he.js canh).
- Không dựng màn thứ hai trùng việc màn đã có — tìm theo khái niệm trước khi dựng.
- Chữ hiện cho người dùng: tiếng Việt, hỏi-để-hiểu, không biệt ngữ.
- Không chạm: crm.js, các tệp .enc, giấy phép, studio.js — trừ khi chủ hệ yêu cầu rõ.

**Trục yêu cầu** — so diff với đúng lời chủ hệ (trích nguyên văn tiếng Việt): thiếu gì · thừa gì · làm sai gì.

Hai trục báo riêng, không gộp, không xếp lại. Tóm tắt cuối: lỗi nặng nhất của mỗi trục.

## Bước 3 — Đẩy

Commit message tiếng Việt, nói được "vì sao". Đẩy `main` và nhánh phát triển được giao. Theo dõi workflow "Deploy GITA365 to Cloudflare" + "Kiem tra GITA365" tới khi xong; đỏ thì sửa và đẩy lại trước khi báo chủ hệ.

Không bao giờ: `--force`, `reset --hard` trên nhánh chung, sửa tay `gita-app.js`/`gita-nghe.js`.
