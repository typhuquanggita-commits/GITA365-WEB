# GITA 365 · BẢN CÀI ĐẶT TRÊN MÁY TÍNH

Ứng dụng thật cho Windows, macOS và Linux: có biểu tượng riêng, cửa sổ riêng,
trình đơn tiếng Việt, **chạy hoàn toàn ngoại tuyến**. Không cần mạng, không cần
trình duyệt, không gửi dữ liệu đi đâu.

---

## 1 · Lấy bộ cài

### Cách nhanh nhất — tải bản đã đóng gói sẵn
Vào tab **Releases** của kho mã, tải đúng tệp cho máy của anh chị:

| Máy | Tệp | Ghi chú |
|---|---|---|
| Windows | `GITA365-7.0.0-win-x64.exe` | Bộ cài — chọn được thư mục, tạo lối tắt |
| Windows, không muốn cài | `GITA365-7.0.0-ban-chay-ngay.exe` | Chép vào USB, bấm là chạy |
| macOS · Apple Silicon | `GITA365-7.0.0-mac-arm64.dmg` | Máy Mac từ 2020 trở đi |
| macOS · Intel | `GITA365-7.0.0-mac-x64.dmg` | Máy Mac đời cũ hơn |
| Linux | `GITA365-7.0.0-linux-x86_64.AppImage` | Cấp quyền chạy rồi bấm |
| Ubuntu · Debian | `GITA365-7.0.0-linux-amd64.deb` | `sudo dpkg -i` hoặc bấm đúp |

Bộ cài được máy chủ GitHub tự dựng mỗi khi đẩy một thẻ phiên bản
(`git tag v7.0.0 && git push --tags`) — xem `.github/workflows/dong-goi-may-tinh.yml`.
Cũng bấm chạy tay được ở tab **Actions → Đóng gói bản máy tính → Run workflow**.

### Tự dựng trên máy mình
```bash
cd desktop
npm ci
npm run dist:win      # bộ cài Windows  (chạy trên máy Windows)
npm run dist:mac      # bộ cài macOS    (chạy trên máy Mac)
npm run dist:linux    # AppImage + deb  (chạy trên máy Linux)
npm start             # chạy thử không đóng gói
```
Bộ cài nằm ở `desktop/dist/`.

> Mỗi hệ điều hành phải được dựng trên chính hệ đó. Máy Linux không dựng được
> bộ cài Windows nếu thiếu Wine — đó là lý do có sẵn quy trình dựng tự động
> trên GitHub, nơi cả ba hệ đều có máy thật.

---

## 2 · Lần mở đầu tiên

Bộ cài **chưa ký số**, nên hệ điều hành sẽ hỏi một lần:

**Windows** — hiện bảng xanh *"Windows protected your PC"*:
bấm **More info** → **Run anyway**. Chỉ hỏi một lần.

**macOS** — hiện *"không mở được vì không xác định được nhà phát triển"*:
bấm chuột phải vào biểu tượng → **Open** → **Open**. Hoặc vào
**System Settings → Privacy & Security**, kéo xuống bấm **Open Anyway**.

**Linux** — cấp quyền chạy cho AppImage:
```bash
chmod +x GITA365-7.0.0-linux-x86_64.AppImage
./GITA365-7.0.0-linux-x86_64.AppImage
```

Muốn bỏ hẳn bước này thì cần chứng thư ký số:
- Windows — chứng thư Code Signing (khoảng 5–10 triệu/năm), đặt vào
  `CSC_LINK` và `CSC_KEY_PASSWORD` trong Secrets của kho mã.
- macOS — tài khoản Apple Developer (99 USD/năm), đặt `APPLE_ID`,
  `APPLE_APP_SPECIFIC_PASSWORD`, `APPLE_TEAM_ID`.

Quy trình dựng tự động đã chừa sẵn chỗ cho hai bộ khoá này.

---

## 3 · Trình đơn — làm được gì

| Trình đơn | Việc |
|---|---|
| **Tệp** | Sao lưu dữ liệu nhà mình `Ctrl+S` · Phục hồi từ tệp sao lưu · Xuất màn hình ra PDF `Ctrl+E` · In `Ctrl+P` |
| **Đi tới** | Nhảy thẳng tới 12 màn hình hay dùng — `Ctrl+1` Bắt đầu, `Ctrl+2` Bản đồ, `Ctrl+3` Nhiệm vụ hôm nay, `Ctrl+4` Kho báu vật, `Ctrl+5` Chín vai, `Ctrl+6` Ngôn từ |
| **Xem** | Phóng to · thu nhỏ · toàn màn hình · tải lại |
| **Trợ giúp** | Tài khoản trải nghiệm 15 vai · Hướng dẫn · Về GITA 365 |

**Sao lưu và mang dữ liệu đi.** *Tệp → Sao lưu dữ liệu nhà mình* ghi toàn bộ
tiến trình ra một tệp `.json`: bảng tầm nhìn, nhật ký, các bước đã xong, ngôn
ngữ. Mang tệp đó sang máy khác rồi *Phục hồi* là có lại nguyên vẹn. Đây cũng
chính là cách một gia đình **mang dữ liệu của mình rời khỏi hệ thống** bất cứ
lúc nào — một trong sáu ranh giới của mô hình.

---

## 4 · Ứng dụng này an toàn tới đâu

| | |
|---|---|
| Giao diện **không chạm được vào máy** | `contextIsolation` bật, `nodeIntegration` tắt, `sandbox` bật. Kiểm chứng: `window.require` và `window.process` đều không tồn tại trong giao diện. |
| Chỉ mở đúng nội dung của ứng dụng | Nội dung phục vụ qua giao thức riêng `gita://`, chặn mọi đường đi ra ngoài thư mục ứng dụng. |
| Liên kết ngoài mở bằng trình duyệt hệ thống | Không có cửa sổ phụ nào mở được bên trong ứng dụng. |
| Chỉ xin đúng một quyền | Micro, dành cho trợ lý nghe giọng nói. Mọi quyền khác đều bị từ chối thẳng. |
| Không gọi ra mạng ngoài | Đã đo: **0 yêu cầu** rời khỏi máy. Bộ chữ, biểu tượng, 1.000 kịch bản đều nằm trong ứng dụng. |
| Dữ liệu nằm ở đâu | Windows `%APPDATA%\GITA 365` · macOS `~/Library/Application Support/GITA 365` · Linux `~/.config/GITA 365` |

---

## 5 · Ba bản — chọn bản nào

| Bản | Hợp với | Cài đặt |
|---|---|---|
| **Bản máy tính** (tài liệu này) | Coach, tư vấn, quản trị — người dùng hằng ngày | Bộ cài `.exe` / `.dmg` |
| **Bản web / điện thoại** (PWA) | Phụ huynh, học viên, người mới | Mở web rồi bấm *Cài đặt* trong trình duyệt |
| **Bản một tệp** `GITA365_v70_MOT_TEP.html` | Gửi email, chép USB, dán vào Apps Script | Không cần cài gì |

Cả ba bản dùng **cùng một mã nguồn** ở gốc kho. Sửa nội dung một lần, cả ba bản
đều có. Dựng lại: `node desktop/chuan-bi.js` (bản máy tính) và
`python3 tools/dong-goi.py` (bản một tệp).

---

## 6 · Điều còn thiếu, nói thẳng

- **Nhận giọng nói** dựa trên dịch vụ của Chromium và **có thể không chạy trong
  bản máy tính**. Ứng dụng đã xử lý sẵn: nút micro báo rõ và anh chị gõ như bình
  thường. Bản web trên Chrome vẫn nghe tốt.
- **Tự động cập nhật** đã cấu hình sẵn trỏ về Releases nhưng chưa bật —
  bật khi có bản phát hành đầu tiên và có chứng thư ký số.
- **Chưa ký số** — xem mục 2.
