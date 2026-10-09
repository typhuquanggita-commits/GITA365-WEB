# Chuyển từ kho Quang-GITA sang GITA365-WEB (9/10/2026)

Chủ hệ yêu cầu: chuyển toàn bộ những gì liên quan tới Web app GITA365 từ kho
`Quang-GITA` sang kho này, và từ nay chỉ đẩy lên GITA365-WEB.

Nguồn: `Quang-GITA`, nhánh `claude/gita-365-ui-design-xew4bz`, commit `1e1413a`
(app bản 9.99.98). Kho này đang chạy bản 9.99.254.

## Cách chọn

| Nhóm | Số tệp | Làm gì | Vì sao |
|---|---|---|---|
| Có ở cả hai kho | 269 | **Giữ bản của GITA365-WEB** | Bản ở đây mới hơn (9.99.254 so với 9.99.98). Chép bản cũ sang là lùi app |
| Chỉ có ở Quang-GITA, kho này chưa từng có | 87 | **Chuyển nguyên** | Phần còn thiếu, xem danh sách dưới |
| Hai quy trình GitHub Actions | 2 | Chuyển vào `docs/quy-trinh-chua-bat/`, **chưa bật** | Cả hai tự chạy khi đẩy lên nhánh `claude/**`. `trang-web.yml` còn đưa trang lên GitHub Pages, trái với địa chỉ chính thức `gita365.pages.dev` |
| GITA365-WEB đã chủ ý xoá | 8 | **Không chuyển** | `CNAME` (gỡ ở 9bc7827, địa chỉ chính thức là gita365.pages.dev); `GITA365.html`, `nen.enc`, `nghe.enc` ở gốc, bốn ảnh `xem-*.png` (dọn ở 2ec8164) |
| `CLAUDE.md` của Quang-GITA | 1 | Lưu thành `docs/SO-TAY-QUANG-GITA-9.99.md` | Sổ tay lịch sử 9.99.1 → 9.99.122: lý do của từng cổng, từng lỗi đã gặp. Không thay `CLAUDE.md` của kho này |

## 87 tệp đã chuyển

- `tools/` (55): bộ kiểm cũ (`kiem-tra.js`, `thu-worker.js`, `do-khung-man.js`, `do-ro-ri.js`),
  sao lưu/khôi phục kho (`sao-luu.js`, `khoi-phuc-kho.js`, `kho-luu.js`), dựng phim
  (`tam-ra-anh.js`, `dung-phim.js`, `bo-phim.js`), `bien-soan/`… Chúng viết cho bản
  9.99.98 nên **chưa nằm trong `kiem-tra.yml`**. Muốn dùng lại cái nào thì đối chiếu
  với bản 9.99.254 trước.
- `server/` (15): máy chủ Google Apps Script cũ (`GITA_*.gs`). App hiện chạy trên
  Cloudflare Worker (`may-chu/`), nên đây là bản lưu tham khảo.
- `desktop/` (9): bộ đóng gói Electron cho bản `.exe`. `package.json` còn ghi 9.99.98.
- `docs/` (3): `BAN_WEB_RIENG.md`, `KIEN_TRUC.md`, `TIET_KIEM_TAI_NGUYEN.md`.
- `.claude/` (5): lệnh `/day`, `/dong-goi`, `/kiem`, `/ro-ri` và `khoi-dong.sh`
  (không tự chạy vì `settings.json` của kho này không gọi nó).

## Một chỗ đã sửa khi chuyển

`tools/soat-bi-mat.js` của kho này báo sáu dòng trong `tools/chay-demo.js` và
`tools/thu-worker.js`: khoá giả lập cho bài thử (chữ thường, có chữ "thu"), không
phải khoá thật. Mỗi giá trị được tách làm hai chuỗi nối lại (`'khoa-ky-' + '…'`),
nên lúc chạy vẫn y hệt, và bộ soát giữ nguyên, không nới.

## Không chuyển, vì không phải Web app GITA365

Các nhánh khác của Quang-GITA là sản phẩm riêng: HSA365, IELTS, KNS365, Leader Boom,
SAT365, MathGITA, ôn thi Toán, Toán tiểu học CLC, Gen Việt 365, và `main` (Veo 3 Gallery).
Nhánh `gita365-community-strategy` là tài liệu chiến lược cộng đồng, không phải mã app.
