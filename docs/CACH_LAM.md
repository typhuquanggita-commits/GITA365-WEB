# CÁCH LÀM — GITA 365

Tài liệu một trang cho người vận hành hằng ngày.

## Một lệnh duy nhất

```bash
node tools/phat-hanh.js
```

Lệnh này chạy:

1. `tools/soat-san-sang.js` — kiểm phiên bản, bundle, CSP, headers, git.
2. `tools/gop-src.js` — dựng lại `gita-app.js` và `gita-nghe.js`.
3. `tools/gop-src.js --kiem` — đối chiếu bundle với `src/`.
4. In hướng dẫn đẩy lên GitHub / Cloudflare.

Thêm `--tag` để tạo git tag theo phiên bản:

```bash
node tools/phat-hanh.js --tag
```

## Sau khi chạy xong

```bash
git add -A
git commit -m "Phát hành GITA 365 9.99.247"
git push origin <nhánh-của-bạn>
```

Rồi tạo Pull Request vào `main`. GitHub Actions sẽ tự triển khai Pages + Worker.

## Các lệnh kiểm riêng lẻ

| Lệnh | Tác dụng |
|---|---|
| `node tools/soat-san-sang.js` | Kiểm sẵn sàng triển khai |
| `node tools/ra-soat-day-du.js` | Kiểm màn, quyền, kho, API, cấu hình |
| `node tools/gop-src.js --kiem` | Đối chiếu bundle với `src/` |
| `python3 tools/dong-goi.py` | Tạo bản giới thiệu một tệp HTML |

## Lưu ý bảo mật

- **Không** commit `kho/khoa.json` hay thư mục `giay-phep/`.
- Khoá giải mã chỉ nằm trong secret Cloudflare Worker (`GITA_KHOA_KHO`).
- Xem `docs/BAO_MAT.md` và `TRIEN-KHAI.md` để biết thêm.
