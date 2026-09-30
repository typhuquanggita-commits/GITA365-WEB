# CÀI ĐẶT TRÊN MÁY TÍNH — GITA 365

## PWA (khuyên dùng)

Cách đơn giản nhất là cài PWA từ trình duyệt:

- **Chrome/Edge:** biểu tượng cài đặt trên thanh địa chỉ → *Cài đặt GITA 365*.
- **Safari (macOS):** Trình đơn → File → Add to Dock.

Sau khi cài, app chạy độc lập, có icon, và hoạt động ngoại tuyến nhờ service worker.

## Bộ cài desktop (nâng cao)

Nếu cần bộ cài `.exe` / `.dmg` / `.AppImage`:

1. Dùng Electron hoặc Tauri để đóng gói PWA.
2. Hoặc dùng `tools/dong-goi.py` để tạo bản HTML một tệp, rồi nhúng vào wrapper.

```bash
python3 tools/dong-goi.py
# Sinh GITA365-9.99.247-gioi-thieu.html
```

Lưu ý: bản một tệp là bản **giới thiệu**, không kèm kho tri thức đầy đủ.

## Giấy phép desktop/offline

Dùng `tools/tao-giay-phep.js` để tạo giấy phép cho một máy cụ thể:

```bash
node tools/tao-giay-phep.js --khoa /đường/dẫn/khoa.json --may may-abc --goi full
```

Giấy phép được ghi vào thư mục `giay-phep/` (đã có trong `.gitignore`).

## Sao lưu và xuất

- Hồ sơ gia đình được đồng bộ lên máy chủ khi có mạng.
- Có thể xuất PDF từ các màn báo cáo trong app.
