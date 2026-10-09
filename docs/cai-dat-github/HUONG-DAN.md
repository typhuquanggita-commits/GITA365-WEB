# Bật bảo vệ nhánh main — 5 cú bấm

Trợ lý AI không được phép đổi cài đặt bảo vệ của kho (rào an toàn của hệ
thống), nên bước này chủ hệ bấm. Mọi luật đã nằm sẵn trong tệp
`bao-ve-main.json` ở thư mục này.

1. Tải tệp về máy: https://raw.githubusercontent.com/typhuquanggita-commits/GITA365-WEB/claude/gita-365-ui-design-xew4bz/docs/cai-dat-github/bao-ve-main.json
   (bấm chuột phải → *Lưu thành…*)
2. Mở https://github.com/typhuquanggita-commits/GITA365-WEB/settings/rules
3. Bấm nút **New ruleset** → chọn **Import a ruleset**.
4. Chọn tệp `bao-ve-main.json` vừa tải.
5. Kéo xuống cuối trang, bấm **Create**.

## Tệp ấy bật những gì

| Luật | Nghĩa |
|---|---|
| Cấm xoá nhánh main | không ai xoá được nhánh đang chạy trang thật |
| Cấm đẩy đè lịch sử | không ai xoá được các lần lưu cũ |
| Phải qua Pull Request | mọi thay đổi vào main đi qua một trang duyệt; không cần ai phê duyệt (0 người) vì kho chỉ có một chủ |
| Bộ kiểm `kiem-tra` phải xanh | mã đỏ không gộp được, nên không lên trang thật |
| Không ai được miễn | luật áp cả cho tài khoản quản trị |

## Sau khi bật

- Tải tệp qua trang web GitHub vẫn được: ở bước *Commit changes*, chọn
  **Create a new branch for this commit and start a pull request**, rồi bấm
  **Merge** khi dấu kiểm chuyển xanh.
- Lúc khẩn cấp cần tắt tạm: cùng trang Rules, mở *Bảo vệ main* → đổi
  *Enforcement status* sang **Disabled**.
