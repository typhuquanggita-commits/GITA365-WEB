# Lá chắn 30 tầng · Vòng nhà khoa học

> Đo, không khai. Bảng sống ở `src/la-chan-30.js` (màn `la-chan-30`), CI đo mọi con trỏ ở `tools/do-16-he.js`.

## Nói thật trước

- **Không hệ thống nào chứng minh được "không lỗi, không lỗ hổng".** Điều GITA làm được là: mỗi tầng trỏ vào mã đang chạy, CI đo lại trên mỗi PR, và chỗ còn trống được ghi ra (`G.LC_KHOANG_TRONG`) thay vì giấu đi.
- **Giá trị định giá (1 tỷ hay 10 tỷ USD) không viết được bằng mã.** Nó phụ thuộc vào doanh thu, người dùng và đội ngũ. Mã chỉ làm được phần của mã: đúng, rẻ, đo được.
- **GITA không vượt được bản thân các mô hình hàng đầu.** GITA hơn từng mô hình đơn lẻ *trên việc của GITA* nhờ định tuyến, kho giải pháp đã duyệt và tri thức riêng của GITA, và điều đó được đo bằng điểm chấm.

## 15 tầng bảo mật (ngăn trước)

| Mã | Tầng | Trỏ vào |
|---|---|---|
| BM01 | HTTPS bắt buộc · chống nhúng khung | `_headers` (HSTS, X-Frame-Options) |
| BM02 | CSP · nosniff · no-store | `index.html`, `traJson` trong `worker.js` |
| BM03 | CORS danh sách trắng | `dsOriginWeb`, `tools/thu-cors.mjs` |
| BM04 | PBKDF2 · so sánh hằng thời gian · chặn mật khẩu yếu | `nen.js` |
| BM05 | Phiên có hạn · token ngẫu nhiên | `kiemPhien`, `tokenMoi` |
| BM06 | OTP đăng ký / đặt lại mật khẩu | `xacThucOtp`, `datLaiMatKhau` |
| BM07 | Passkey WebAuthn | `sinh-trac.js` |
| BM08 | Vai trò R01–R20 · cửa cần phiên | `vai-tro.js`, `CAN_PHIEN` |
| BM09 | Quyền xem · quyền năng AI | `quyen-xem.js`, `aiCoQuyen` |
| BM10 | Mã hoá đầu cuối AES-GCM | `src/kho-khoa.js` |
| BM11 | Chữ ký HMAC | `chung-cu.js`, `ngan-hang.js` |
| BM12 | Chống SSRF | `redirect: 'error'` + cổng cố định |
| BM13 | **Soát bí mật (mới)** | `tools/soat-bi-mat.js` trong `kiem-tra.yml` |
| BM14 | Cổng Điều 13 (trẻ em, dữ liệu cá nhân) | `soatRaNhaCungCap`, `soatAnDanh` |
| BM15 | Chuỗi cung ứng mã | CodeQL · Dependabot · Scorecard · CODEOWNERS |

## 15 tầng phòng vệ (chặn · khoanh · ghi · phục hồi)

| Mã | Tầng | Trỏ vào |
|---|---|---|
| PV01 | Chặn nhịp theo phút | `ve-chi-phi.js` (`HAN_PHUT`, `GIOI_HAN`) |
| PV02 | Ngân sách token · trần tải 50% | `GITA_TRAN_TAI`, `HAN_NGAY` |
| PV03 | Chế độ tiết kiệm khẩn cấp | `GITA_CHE_DO_TIET_KIEM` |
| PV04 | Ngăn khoang · cầu dao | `khoang.js` |
| PV05 | **Trần thân yêu cầu 10 MB (mới)** · gói đồng bộ 512 KB | `TRAN_THAN_BYTE`, `TRAN_DAY_KB` |
| PV06 | Đóng băng sự cố | `cuu-he.js` |
| PV07 | Sao lưu & khôi phục | `khoiPhucTuSaoLuu` |
| PV08 | Quét mồ côi D1 ↔ R2 | `quetSaoLuuMoCoi` |
| PV09 | Tự soát & tự chữa mỗi đêm | `tuSoatVaChua` |
| PV10 | Nhật ký kiểm toán | `Kho.ghiNhatKy` |
| PV11 | Giám sát · hộp đen | `giam-sat.js`, `soatSoDen` |
| PV12 | Mã yêu cầu · lỗi không lộ cấu trúc | `maYeuCau`, `x-gita-ma` |
| PV13 | Quyền dữ liệu theo luật (đồng ý · xoá · xuất) | `phap-ly-rui-ro.js` |
| PV14 | Công tắc tắt · tự điều chỉnh đảo được | `GITA_DA_TRI_BAT`, `GITA_TU_DIEU_CHINH` |
| PV15 | Cổng CI · vòng nhà khoa học · chủ hệ quyết | `kiem-tra.yml`, `vongKhoaHoc` |

## Chỗ còn trống (ghi thật)

1. **Kiểm thử xâm nhập độc lập.** Chưa có bên thứ ba nào kiểm. Nên làm trước khi vượt 200.000 tài khoản.
2. **WAF và Bot Fight Mode.** Hai thứ này bật ở bảng điều khiển Cloudflare, nên repo không đo được. Chủ hệ cần bật bản miễn phí.
3. **Diễn tập khôi phục.** Đã có phép thử giả lập (`thu-dong-bo.mjs`), nhưng chưa diễn tập trên dữ liệu thật. Nên làm mỗi quý.
4. **Đánh giá pháp lý chính thức.** Mã đã thực thi quy trình đồng ý, xoá và xuất dữ liệu, nhưng kết luận tuân thủ phải do luật sư đưa ra.

## Vòng nhà khoa học (`may-chu/bo-nao-da-tri.js`)

Vòng này chạy mỗi đêm từ `scheduled()`, nhiều nhất một lần mỗi 20 giờ, và **tốn 0 token** vì chỉ đọc D1. R01 có thể bấm chạy ngay ở ngăn "Vòng nhà khoa học" trong màn `bo-nao-da-tri` (cửa `docVongKhoaHoc`).

Mỗi phát hiện gồm bốn phần: **quan sát → giả thuyết → phép thử nhỏ nhất (một cửa có sẵn) → đề xuất**. Vòng đọc các nguồn sau:

- giải pháp đã quá hạn soát, và bản nháp đang chờ duyệt;
- nhà cung cấp bị chấm "chưa tốt" quá 50% (trên ít nhất 5 lượt);
- ngân sách ngày đã dùng từ 80% trần tải;
- đệm có tỉ lệ trúng thấp;
- mô hình mới trong 7 ngày;
- việc canh mô hình đã quá cũ.

Báo cáo được lưu ở `vongKhoaHocDaTri` (giữ 30 bản gần nhất). Phát hiện mức cao được ghi vào nhật ký `DA_TRI_KHOA_HOC`.

**Tự điều chỉnh có biên.** Đây là việc duy nhất máy tự làm: nhà cung cấp bị chấm "chưa tốt" quá 70% trên ít nhất 10 lượt cho một loại việc sẽ bị **xếp cuối hàng** ở loại việc đó. Nhà cung cấp ấy không bị loại, nên vẫn là lưới đỡ khi không còn ai khác. Muốn đảo lại, đặt `GITA_TU_DIEU_CHINH="0"`. Mọi thay đổi luật, bảng `LOAI` hay mô hình vẫn do chủ hệ quyết (AT5).

## Kiểm

```
node tools/do-16-he.js      # 30 tầng · mọi con trỏ sống
node tools/soat-bi-mat.js   # không khoá API nào trong repo
node tools/thu-cors.mjs     # trần 10 MB · nosniff · no-store
node tools/thu-da-tri.mjs   # vòng khoa học 0 token · tự điều chỉnh đảo được
```
