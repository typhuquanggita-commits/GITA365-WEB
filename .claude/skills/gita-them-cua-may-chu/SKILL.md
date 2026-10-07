---
name: gita-them-cua-may-chu
description: Danh mục bắt buộc khi thêm hoặc sửa một cửa (endpoint) máy chủ Cloudflare Worker của GITA365 — quyền, D1, đăng ký, phép thử. Use when adding/changing a server function in may-chu/, a new D1 table, or a "cửa" / endpoint.
---

# Thêm cửa máy chủ

1. **Mô-đun** `may-chu/<ten>.js`: `export async function tenCua(y, env, db, hoSo)`.
   - Dòng đầu: kiểm quyền bằng `BAC[hoSo.role]` (vai-tro.js) và quyền với đúng bản ghi (chủ nhà / Coach phụ trách) — TRƯỚC mọi truy vấn.
   - SQL chỉ dùng `?` ràng buộc. Không nhận con số tiền / credit từ máy khách — máy chủ tự tính.
   - Bảng mới: `CREATE TABLE IF NOT EXISTS` trong hàm `taoBang` tự chạy, VÀ khai thêm ở cuối `may-chu/csdl.sql`.
   - Sổ cần chứng cứ: chỉ thêm dòng + `khoaDuy UNIQUE` chặn ghi trùng; việc nhạy cảm ghi `Kho.ghiNhatKy`.
   - Cửa chỉ-đọc không gọi cửa khác có ghi nhật ký (làm bẩn số thao tác).
2. **Đăng ký** trong `may-chu/worker.js`: import · thêm tên vào `CAN_PHIEN` · nhánh `if (fn === 'tenCua') return await tenCua(y, env, db, hoSo);`. `tools/thu-ky-luat.mjs` (K1) canh.
3. **Phép thử** `tools/thu-<ten>.mjs` theo mẫu node:sqlite + `csdl.sql` (xem `tools/thu-toi-uu.mjs`): quyền từng vai, số đúng từ dữ liệu mẫu, chống ghi trùng, đường lỗi. Thêm vào `.github/workflows/kiem-tra.yml`.
4. **Công thức dùng ở cả app**: tách tệp thuần (`may-chu/*-cham.js`) + bản ES5 `src/data-*.js` + phép thử so 400 bộ số ngẫu nhiên.
5. **App**: gọi qua `G.goiMayChu(fn, than)`; tài khoản mẫu (không có `G.PHIEN_TOKEN`) hiện ví dụ minh hoạ ghi rõ là ví dụ — không gọi máy chủ.
6. Chạy skill `gita-kiem-truoc-khi-day` trước khi đẩy.
