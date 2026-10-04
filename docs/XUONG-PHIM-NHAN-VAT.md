# Nhân vật chuẩn được khóa — xưởng phim AI GITA365

Phim hay cần nhân vật **giữ nguyên danh tính** qua mọi cảnh, mọi tập.
Tài liệu này mô tả cơ chế KHÓA nhân vật: trainer, MC, giảng viên và
gia đình mẫu.

## Nguồn chuẩn duy nhất

`may-chu/nhan-vat-chuan.js` — mỗi nhân vật gồm:

| Trường | Ý nghĩa |
|---|---|
| `ten`, `vai` | tên vai diễn dùng trong kịch bản |
| `giong` | giọng đọc edge-tts gắn cố định (`vi-VN-NamMinhNeural` nam, `vi-VN-HoaiMyNeural` nữ — 0đ) |
| `moTaVe` | mô tả ngoại hình tiếng Việt để đối chiếu khi duyệt |
| `promptEn` | mô tả ngoại hình/trang phục/thần thái **đã khóa** bằng tiếng Anh — ghép vào mọi prompt quay/vẽ |

## Ảnh khóa (tham chiếu danh tính)

Ảnh chuẩn KHÔNG commit vào kho mã. Chúng là hạt R2/D1 loại
`nvchuan-<id>`, đặt bằng:

```powershell
# Khóa bộ ảnh mới cho một nhân vật (tối đa 4 ảnh, JPEG/PNG ≤ 3 MB)
node tools/dat-nhan-vat-chuan.mjs trainer anh-1.png anh-2.png

# Xem nhân vật nào đang khóa, bao nhiêu ảnh
node tools/dat-nhan-vat-chuan.mjs --ke

# Gỡ khóa (nhân vật quay về chân dung máy tự vẽ)
node tools/dat-nhan-vat-chuan.mjs --xoa trainer
```

Yêu cầu `npx wrangler login`. Mỗi lần khóa ghi nhật ký
`xuong-phim/nhan-vat-chuan/<id>.json` (mã hạt + sha256) — commit file
này để truy vết.

## Ai dùng bộ khóa này

1. **Máy vẽ Workers AI (klein 4B)**: cảnh có trường `nv: "<id>"` trong
   công thức phim phân tử sẽ dùng tối đa 4 ảnh khóa làm `input_image_*`
   (`layRefNhanVat` trong `may-chu/phim-phan-tu.js`). Đổi bộ khóa → mã
   `nvRef` đổi → cảnh của nhân vật đó tự vẽ lại.
2. **Máy quay Kaggle** (`may-quay-kaggle/xuong-phim-studio.py`): tải bộ
   khóa qua `GET /quay/nvchuan` (kèm `X-Khoa-Quay`), dùng ảnh đầu làm
   ảnh khởi tạo image-to-video và ghép `promptEn` vào prompt từng cảnh.
3. **Đọc thoại**: giọng `giong` của nhân vật được dùng khi việc
   `film`/`tts` gắn nhân vật đó.

Nhân vật **chưa khóa ảnh**: cảnh quay bằng text-to-video thuần và nhật
ký in cảnh báo — danh tính không bảo đảm cho tới khi khóa.

## Quy tắc

- Ảnh khóa phải do AI tạo hoặc có quyền dùng rõ ràng; không dùng hình
  người thật/khách hàng làm mẫu public mặc định.
- Chủ hệ duyệt bằng mắt từng ảnh trước khi khóa (nên chọn 2–4 góc:
  chân dung chính diện, nghiêng, toàn thân).
- Phim khách vẫn qua `soatLoiNhac` — từ khoáy nội bộ bị chặn.
