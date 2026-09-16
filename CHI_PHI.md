# GITA 365 · VẬN HÀNH DƯỚI 500.000Đ MỖI THÁNG

Bản đọc trong app: **Nhóm 05 → Kiến trúc chi phí**. Tài liệu này là phần triển khai.

## Nguyên tắc một câu
> Việc nào chạy được trong máy người dùng thì không đưa lên máy chủ.

Nhờ đó chi phí **không tăng theo lượt mở app** — chỉ tăng theo số gia đình mới
và số lượt hỏi trợ lý.

## Số đo thật của bản này

| | |
|---|---|
| Lần mở đầu (đã nén) | **178 KB** |
| Toàn bộ app gồm 1.000 kịch bản, 220 phác đồ, 750 câu test | **348 KB** |
| Lần mở thứ hai trở đi | **0 KB** — chạy từ máy, kể cả mất mạng |
| Máy chủ xử lý mỗi lần mở màn hình | **0 ms** — giao diện dựng trong máy |

Kho chuyên môn 2,3 MB (đã mã hoá, bảy gói) không tải ở lần mở đầu; nó được nạp lúc máy rảnh hoặc
đúng lúc người dùng mở một kệ cần tới.

## Bảng chi phí — gói khuyến nghị

| Khoản | Nhà cung cấp | Tháng |
|---|---|---|
| Hosting tĩnh + CDN toàn cầu | Cloudflare Pages (băng thông không giới hạn) | **0đ** |
| Máy chủ dữ liệu, xác thực, kiểm duyệt, tài chính | Google Apps Script + Sheets (đã có) | **0đ** |
| Lưu trữ tệp gia đình gửi lên | Google Drive (đã có) / Cloudflare R2 10 GB free | **0đ** |
| Thư giao dịch | Resend 3.000 thư/tháng gói free | **0đ** |
| Sao lưu | Google Drive | **0đ** |
| Trợ lý tra cứu (tìm trong kho, trích nguồn) | chạy trong máy người dùng | **0đ** |
| Tên miền .com riêng | ~300.000đ/năm | **25.000đ** |
| Trợ lý đối thoại — có trần cứng | API mô hình ngôn ngữ | **150.000đ** |
| Giám sát, tên miền phụ, dự phòng | | **100.000đ** |
| **TỔNG** | | **275.000đ** |

Còn dư **225.000đ** so với trần 500.000đ.

## Chi phí theo quy mô

| Quy mô | Băng thông | Hosting | Trợ lý AI | Tổng |
|---|---|---|---|---|
| 1.000 gia đình | ≈ 0,4 GB | 0đ | ≈ 60.000đ | ≈ 185.000đ |
| 5.000 gia đình | ≈ 1,8 GB | 0đ | ≈ 150.000đ | ≈ 275.000đ |
| 10.000 gia đình | ≈ 3,5 GB | 0đ | ≈ 300.000đ | ≈ 425.000đ |
| 50.000 gia đình | ≈ 17 GB | 0đ | cần trần riêng | tách ngân sách AI |

Các bước triển khai đầy đủ — kể cả máy chủ cấp phép — nằm ở
`docs/TRIEN_KHAI_WEB.md`. Phần dưới là bản rút gọn.

## Triển khai — 20 phút, 0đ hosting

**Cloudflare Pages (khuyến nghị)**
```
1. Đưa mã lên GitHub (đã xong).
2. dash.cloudflare.com → Workers & Pages → Create → Pages → Connect to Git.
3. Chọn kho, nhánh phát hành.
   Build command: (để trống — không có bước dựng)
   Build output directory: /
4. Deploy. Có ngay https://<tên>.pages.dev — miễn phí, băng thông không giới hạn.
5. Custom domains → thêm tên miền riêng, Cloudflare cấp SSL miễn phí.
```

**GitHub Pages (đơn giản hơn)**
```
Settings → Pages → Source: nhánh phát hành, thư mục / (root) → Save.
Giới hạn mềm 100 GB/tháng — đủ cho hơn 250.000 lượt cài đặt mới.
```

Cả hai đều tự nén gzip/brotli, tự chạy HTTPS — bắt buộc phải có HTTPS thì
service worker mới hoạt động và app mới cài được.

## Sáu chốt chặn không cho vượt chi

1. **Trần cứng theo tháng trong tài khoản AI.** Chạm trần thì API dừng, trợ lý
   tự rơi về chế độ tra cứu trong máy. Hệ thống vẫn chạy trọn vẹn, không có hoá
   đơn bất ngờ.
2. **Tra cứu trong máy trước, gọi ra ngoài sau.** Câu tra được trong kho trả lời
   ngay tại máy — 0đ.
3. **Định tuyến hai tầng mô hình.** Câu đơn giản dùng mô hình rẻ; câu chuyên môn
   mới dùng mô hình mạnh. Giảm khoảng hai phần ba chi phí mỗi lượt.
4. **Hạn mức mỗi gia đình mỗi ngày.** Chặn cả lỗi vòng lặp lẫn bot quét kho.
5. **Cảnh báo ở 80% ngân sách**, gửi về quản trị.
6. **Không dịch vụ nào tự động gia hạn ở gói trả tiền.**

## Điều kiện để giữ được mức này

Kho tri thức phải giữ dạng **tệp tĩnh**, không chuyển sang cơ sở dữ liệu chỉ để
đọc. Mọi tính năng mới hỏi trước một câu: *việc này chạy được trong máy người
dùng không?* Chạy được thì không đưa lên máy chủ.

Ngày nào bỏ nguyên tắc đó, chi phí sẽ tăng theo **lượt mở app** thay vì theo
**số gia đình** — và trần 500.000đ sẽ vỡ.
