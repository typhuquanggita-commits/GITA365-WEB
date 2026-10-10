---
name: gita-thiet-ke
description: Soát và nâng giao diện GITA365 theo luật thiết kế đo được — tương phản, thang chữ, bậc tiêu đề, khổ điện thoại, chuyển động. Use when the task is UI/visual work on GITA365 screens: "soát giao diện", "đánh bóng màn", "chữ khó đọc", "giao diện chưa chuyên nghiệp", "audit/polish/critique a screen", or before shipping a screen change.
---

# Thiết kế GITA365 — soát bằng phép đo, sửa bằng token

Phỏng theo bộ lệnh của pbakaus/impeccable (Apache-2.0): cùng một bộ từ chung giữa người và máy cho việc thiết kế. Ở đây mỗi lệnh gắn vào **luật của kho này** và **phép đo chạy được**, không gắn vào cảm giác. Lý do nhận/loại từng phần của impeccable: `xuong-ai/NGUON-NGOAI.md`.

Người dùng chính là **phụ huynh cầm điện thoại**, đọc tiếng Việt có dấu, thường lúc mệt hoặc ngoài nắng. Mọi quyết định thiết kế hỏi câu ấy trước.

## Năm lệnh

| Lệnh | Khi nào | Làm gì |
|---|---|---|
| **soát** `<màn>` | trước mọi lần sửa giao diện | Chạy máy đo (dưới), chấm 5 trục 0–4, KHÔNG sửa |
| **phê** `<màn>` | "trông chưa ổn", "rối" | Đọc màn bằng mắt người dùng: một màn một việc chính? việc ấy thấy ngay ở khổ 390px? |
| **đánh bóng** `<màn>` | trước khi đẩy | Sửa chỗ soát ra, chỉ bằng token sẵn có |
| **gọt** `<màn>` | màn nhiều chữ, nhiều hộp | Bỏ thẻ lồng thẻ, bỏ nhãn trùng, gom ý — giữ đúng một việc chính |
| **cứng** `<màn>` | trước khi khách dùng | Trạng thái trống, lỗi mạng, tên tiếng Việt dài, số lớn, chưa nạp kho |

`rõ chữ` (sửa lời) theo luật ngôn từ ở `CLAUDE.md` và trợ lý chat: tiếng Việt, câu ngắn, hỏi để hiểu, không biệt ngữ.

## Máy đo — chạy, đừng đoán

```bash
node tools/thu-thiet-ke-tinh.mjs                       # CI: chuyển động nảy · chữ chạy · chữ chuyển sắc · màu cấm
npx http-server -p 8099 -s . &                          # máy chủ tĩnh cho hai lệnh dưới
xvfb-run -a node tools/soat-thiet-ke.js --im           # 14 luật trên trình duyệt thật, 2 khổ × 2 vai
xvfb-run -a node tools/soat-thiet-ke.js --im --chi-tiet TK01   # gom theo lớp CSS gây ra
xvfb-run -a node tools/do-khung-man.js --im            # tràn ngang · nút 32px · ô nhập 16px
```

Sổ luật: `tools/luat-thiet-ke.json` (TK01–TK19). Bộ đo trình duyệt chỉ đo nền Sáng và bỏ qua chữ trên nền chuyển sắc — hai chỗ ấy cần mắt người. Luật `chan` phải bằng 0; luật `tran` không được thêm màn phạm mới so với `tools/soat-thiet-ke.nen.json`. Sửa bớt được thì `--ghi-nen` để hạ trần. Nâng trần phải có `--nhan-tang "lý do"`, và lý do ở lại trong tệp.

## Chấm 5 trục (lệnh soát)

| Trục | 4 điểm nghĩa là |
|---|---|
| Đọc được | TK01–TK07 sạch ở màn ấy; chữ tối thiểu 12,5px |
| Khổ điện thoại | do-khung-man sạch; TK17 sạch |
| Token | không mã màu gõ tay làm màu chữ; dùng `--ink*`, `--*-ink`, `--ok/--warn/--bad` |
| Cấu trúc | bậc tiêu đề liền (TK05), không thẻ lồng thẻ (TK14), một việc chính |
| Chuyển động | không nảy (TK15), tắt hẳn ở `prefers-reduced-motion` |

Báo cáo: bảng điểm + ba chỗ nặng nhất kèm `tệp:dòng`. Tách rõ **máy đo ra** với **mắt nhìn ra**.

## Luật sửa — học từ lần soát đầu (10/2026)

1. **Chữ màu phải dùng token `-ink`.** `--gold-2`/`--gita-sang` là xanh NHẠT để chuyển sắc, chỉ 2,91:1 trên nền sáng. Từng có 17 chỗ dùng nó làm màu chữ. Chữ xanh dùng `--gold-ink`; chữ cảnh báo dùng `--warn`, đừng gõ thêm `#B4720F` (3,92:1).
2. **Token đổi theo nền Sáng/Tối, mã gõ tay thì không.** Làm sẫm một mã hex cho đạt chuẩn trên nền sáng thì lại hỏng ở nền tối. Đổi sang token là sửa được cả hai.
3. **Sửa bậc tiêu đề bằng tên thẻ đúng, kèm đổi bộ chọn CSS.** Đổi `h4`→`h2` thì phải đổi luôn `.kh h4` → `.kh h2`, nếu không cỡ chữ mặc định của trình duyệt nhảy theo. Không dùng `aria-level` đè lên thẻ `h1`–`h6`: chuẩn ARIA-in-HTML khuyên tránh.
4. **Bảng màu biểu đồ không được có hai tên cho cùng một màu.** Chữ đặt lên màu dùng `--chu-tren-mau` (trắng ở nền Sáng, sẫm ở nền Tối), không gõ `#fff` (`U.bdMau`).
5. **Màu dữ liệu (`c:'#10B981'`…) làm chữ thì phải trộn với mực**: `color-mix(in srgb, <màu> 60%, var(--ink))`. Cách này đổi được theo nền và vẫn giữ sắc. Đây là việc còn treo, xem trần TK01.

## Không được

- Sửa tệp thuộc gói nghề (`tools/danh-sach-src.json → nghe`). `gita-nghe.js` phải giữ nguyên từng byte. Chỗ phạm nằm trong gói nghề thì ghi lại, không sửa.
- Thêm cỡ chữ ngoài thang 10,5 · 12,5 · 14,5 · 16 · 18 · 21 · 26 · 33 (ra-soat canh tối đa 9 bậc).
- Thêm khối `@media` khổ chạm ở giữa `style.css`. Khối ấy phải nằm cuối tệp (CLAUDE.md).
- Dùng cú pháp ES6 trong `src/*.js` (K2 của thu-ky-luat).
- Thêm màu chữ mới bằng mã hex; ba mã vàng cũ bị cấm hẳn (TK18).
- Đặt `opacity:0` lúc nghỉ chờ hiệu ứng mới hiện (TK10). Màn chụp lại, in, hoặc tắt chuyển động sẽ thấy trống.
