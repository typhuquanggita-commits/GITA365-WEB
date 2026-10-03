# Bộ máy tập đoàn tinh gọn · Cây giá trị · Cây tiền

> Màn `bo-may-tap-doan` (quyền quản trị). Mọi con trỏ được CI đo trong `tools/do-16-he.js`; KPI cây tiền tính lúc đọc từ D1 qua cửa `docKpiCayTien` (`may-chu/cay-tien.js`), phép thử ở `tools/thu-cay-tien.mjs`.

## Nói thật trước

- **"Tập đoàn tinh gọn" là cách tổ chức, không phải con số nhân sự hay định giá.** Mỗi ban là một cửa sổ trỏ vào hệ thống thật đang chạy — không dựng lại bộ máy thứ hai bằng lời.
- **Ba đích 90% · 90% · 20% do chủ hệ đặt; máy chỉ đo và báo thật, kể cả khi xấu.** Không có ô nhập tay nào cho KPI — một con số tự khai chỉ để có người chạy cho đủ (bẫy SUP-01).
- **"Hài lòng" hiện là proxy** (khách không hoàn tiền, không bị CRM ghi "rời", hồ sơ không "nghỉ"). Khách im lặng bỏ đi chưa chắc bị ghi — chỗ trống này được ghi ngay trong kết quả cửa, và việc cần làm là thêm khảo sát CSAT sau mỗi mốc lên tầng.

## Mười ban / hệ thống

| Mã | Ban | Trỏ vào |
|---|---|---|
| B01 | Thanh tra | màn `thanh-tra`, `giam-sat`, bảng `thanhTraSo` |
| B02 | Sản xuất nội dung | `xuong-phim`, bảng `baiNoiDung`, `kyNoiDung` |
| B03 | Kho tài liệu | `kho-tai-lieu`, `duyet-tai-lieu`, bảng `tailieu` |
| B04 | Giải pháp khách hàng | `ban-tu-van`, kho giải pháp của bộ não |
| B05 | Chuyên gia Coach | `ban-coach`, `diem-cham-1000`, `chuoi-wow` |
| B06 | Chuyên gia Giáo dục | `lo-trinh`, `kpi-100` |
| B07 | Luật sư — Pháp lý | `ra-soat-phap-ly`, `bang-chung`, `ky-ket` |
| B08 | Dự án | `bang-viec` + tuyến chốt chặn của bộ não V20 |
| B09 | Bộ não V20 | `bo-nao-da-tri` (định tuyến, cố vấn, kho 0 token) |
| B10 | Lá chắn & hậu cần | `la-chan-30` (30 tầng + 12 tầng bếp) |

Chỗ còn thiếu được ghi thật ngay trên màn: lịch sản xuất nội dung chưa tự xếp theo kỳ (B02); chưa có luật sư thật ký kết luận tuân thủ (B07); chưa có Gantt/nguồn lực cho dự án (B08).

## Cây giá trị (5 tầng)

Gốc: Hiến pháp 13 điều → Thân: 16 hệ có SOP → Cành: 10 ban → Lá: trải nghiệm khách (chuỗi WOW · 1000 điểm chạm) → Quả: cây tiền.

## Cây tiền (đo từ D1 lúc đọc)

| Chỉ số | Đích | Công thức | Nguồn |
|---|---|---|---|
| Khách hài lòng | 90% | (tổng − khách có dấu hiệu xấu) / tổng | `hoanTien` · `crmKhach` · `hoSoKhach` |
| Tái dùng + nâng cấp | 90% | khách ≥2 phiếu thu đã duyệt **hoặc** đã lên tầng (hợp hai tập, không đếm hai lần) / tổng | `phieuThu` · `lichSuTang` |
| Khách đạt tầng 5 | 20% | khách ở tầng ≥ 5 / tổng | `hoSoKhach.tang` |

Kho trống thì cửa báo thật "chưa có dữ liệu" thay vì bịa số.
