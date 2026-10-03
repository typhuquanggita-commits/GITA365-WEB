# Truy vấn đa chiều — bốn dòng chảy · bảng điểm 16 ban

> Màn `truy-van-da-chieu` (R01–R12) đọc cửa `docDongChay` (`may-chu/dong-chay.js`). Phép thử: `node tools/thu-dong-chay.mjs` (9 phép). Chạy trong CI (`kiem-tra.yml`).

## Bốn dòng chảy (tính lúc đọc từ D1, không ô nhập tay)

| Dòng | Nguồn | Chỉ số |
|---|---|---|
| Tiền | `phieuThu` · `hoanTien` · `hoaHongTra` | thu đã duyệt · hoàn · hoa hồng · **ròng = thu − hoàn − hoa hồng** · thu theo tháng 6 kỳ |
| Chi phí | `chiPhi` · `bangLuong` · `soTokenDaTri` | tổng chi · 5 khoản lớn nhất · lương kỳ gần nhất · token AI từng nhà (token, không phải tiền) |
| Giá trị khách nhận | `baiHocHoanThanh` · `soCham` · `lichSuTang` · `khoGiaiPhapDaTri` · `tuyenDaTri` | bài học xong · WOW · lên tầng · kho giải pháp đã dùng (0 token/lần) · tuyến hoàn tất |
| Công việc | `audit` | tổng lượt ghi sổ · trung bình/ngày · 10 việc nhiều nhất |

## Bảng điểm 16 ban — "bắt buộc nâng cấp" bằng con số

Máy chủ trả tín hiệu theo mã B01–B16 (tên ban giữ ở `G.TD_BAN`, không chép lại). Mỗi chỉ số có **ngưỡng khai sẵn**; vượt ngưỡng → ban **đỏ — cần nâng cấp**:

- B01 thanh tra: phát hiện mức NẶNG chưa xử lý · B03: tài liệu chờ duyệt · B04: giải pháp nháp/quá 90 ngày chưa soát · B05: lượt chạm lúc đèn ĐỎ · B07: yêu cầu xoá dữ liệu quá hạn · B08: tuyến dự án treo > 7 ngày · B09: > 50% câu AI bị chấm "chưa tốt" · B11: phiếu thu chờ duyệt > 3 ngày · B13: dòng lương có > 30% trọng số không đo được · B14: hẹn chạm khách quá hạn · B15: vòng nhà khoa học không chạy trong 7 ngày.
- B10 (lá chắn) đo ở CI, không đo được từ D1 — **ghi thật** thay vì bịa một chỉ số.

## Giới hạn (ghi thật)

- Ngưỡng xấu là ngưỡng **vận hành** do chủ hệ hiệu chỉnh, không phải chuẩn ngành.
- Đèn đỏ để người nhìn vào — hệ **không tự phạt, không tự đổi quy trình** (AT5).
- "Hệ thống chạy 100% chỉ cần internet": phần chạy (cron đêm, CI/CD, bộ não) đã tự động; các chốt chặn có người quyết là **cố ý**, không phải thiếu tự động — mở toang chúng là bỏ AT5.
