# Sơ đồ vận hành tổng thể GITA365

> Bản đồ đầy đủ của hệ: từ ngón tay khách hàng tới cơ sở dữ liệu, vòng đời một yêu cầu, vòng đêm tự vận hành, và vòng CI mỗi lần đổi mã. Mọi khối trong sơ đồ là mã THẬT — tên trong ngoặc là tệp/cửa/bảng tra được trong repo. Màn sống: `bo-may-tap-doan` (16 ban) · `he-16` (16 hệ) · `la-chan-30` (lá chắn) · `bo-nao-da-tri` (bộ não V20).

## 1. Toàn cảnh sáu tầng

```mermaid
flowchart TB
  subgraph KH["TẦNG KHÁCH HÀNG — 5 cổng vai (data.core.js: PH · HS · Coach · Tư vấn · CTV)"]
    K1["Gia đình / học viên<br/>ngoi-nha · hom-nay · nhiem-vu"]
    K2["Coach · Tư vấn<br/>ban-coach · ban-tu-van"]
    K3["Quản trị R01–R12<br/>dieu-hanh · bo-may-tap-doan"]
  end

  subgraph APP["TẦNG ỨNG DỤNG — PWA tĩnh (gita-app.js = 150 mô-đun src/)"]
    A1["238 màn G.VIEWS"]
    A2["Mã hoá đầu cuối AES-GCM (kho-khoa.js)"]
    A3["Đồng bộ khi có mạng (gói ≤ 512 KB)"]
  end

  subgraph EDGE["TẦNG BIÊN — Cloudflare Worker (may-chu/worker.js · 310+ cửa)"]
    E1["Cổng: CORS trắng → phiên (kiemPhien)<br/>→ chặn nhịp/phút (ve-chi-phi.js)<br/>→ trần thân 10 MB → nosniff/no-store"]
    E2["Cổng Điều 13: soatRaNhaCungCap<br/>— dữ liệu trẻ em KHÔNG ra nhà cung cấp"]
    E3["Ngăn khoang · cầu dao (khoang.js)"]
  end

  subgraph NAO["TẦNG TRÍ TUỆ — Bộ não đa trí V20 (bo-nao-da-tri.js)"]
    N1["Lọc trước token có đếm:<br/>quyền → hạn ngày → Điều 13 → kho 0 token → đệm 0 token"]
    N2["Định tuyến bậc 0–4 rẻ trước:<br/>đệm → Workers AI → DeepSeek → Gemini/GPT → Claude/Grok"]
    N3["Độ chắc sharp/split (doChacDinhTuyen)<br/>· Cố vấn 3 điểm chạm (coVanDaTri)<br/>· Tuyến chốt chặn (taoTuyen/chayChangDaTri)"]
    N4["Hội đồng 3 trí tuệ (hoiDongDaTri) · R01"]
  end

  subgraph DL["TẦNG DỮ LIỆU — D1 (90+ bảng, csdl.sql) + R2 (tệp)"]
    D1["Bảng lõi: users · students · hoSoKhach · phieuThu · lichSuTang"]
    D2["Bảng não: khoGiaiPhapDaTri · danhGiaDaTri · soLocDaTri · tuyenDaTri"]
    D3["Nhật ký audit · hộp đen soDen · sao lưu hosoAppSaoLuu"]
  end

  subgraph QT["TẦNG QUẢN TRỊ — luật gác bằng mã"]
    Q1["Hiến pháp 13 điều · 9 điều bất khả sửa (bo-nao.js · hanh-lang.js)"]
    Q2["Lá chắn 30 tầng + 12 tầng hậu cần (la-chan-30.js)"]
    Q3["Thanh tra (thanh-tra · thanhTraSo) · khung V20 (khung-van-hanh.js)"]
    Q4["CI: kiem-tra.yml — 8 bước, 750+ phép đo mỗi PR (do-16-he.js)"]
  end

  KH --> APP --> EDGE --> NAO
  EDGE --> DL
  NAO --> DL
  QT -. gác mọi tầng .-> EDGE
  QT -. đo mọi con trỏ .-> NAO
```

## 2. Bộ máy 16 ban ↔ 16 hệ thống

Mỗi ban là một cửa sổ trỏ vào hệ thật; mỗi hệ có SOP, trần tự chủ và KPI đọc từ sổ audit.

| Ban (bo-may-tap-doan) | Hệ tương ứng (he-16) | Trỏ vào |
|---|---|---|
| B01 Thanh tra | H01 Quản trị | `thanh-tra` · `giam-sat` · `thanhTraSo` |
| B02 Sản xuất nội dung | H06 Marketing | `xuong-phim` · `baiNoiDung` · `kyNoiDung` |
| B03 Kho tài liệu | H02 Dữ liệu | `kho-tai-lieu` · `duyet-tai-lieu` · `tailieu` |
| B04 Giải pháp khách hàng | H12 Giải pháp | `ban-tu-van` · kho giải pháp đa trí |
| B05 Chuyên gia Coach | H04 Khách hàng | `ban-coach` · `diem-cham-1000` · `chuoi-wow` |
| B06 Chuyên gia Giáo dục | H04 Khách hàng | `lo-trinh` · `kpi-100` |
| B07 Luật sư — Pháp lý | H07 Pháp lý | `ra-soat-phap-ly` · `bang-chung` · `ky-ket` |
| B08 Dự án | H03 Vận hành | `bang-viec` · tuyến chốt chặn V20 |
| B09 Bộ não V20 | H09 Bộ não | `bo-nao-da-tri` |
| B10 Lá chắn & hậu cần | H15 Mã nguồn | `la-chan-30` · `do-16-he.js` |
| B11 Tài chính — Kế toán | H05 Tài chính | `phong-tai-chinh` · `ke-toan-thue` · `ghiPhieuThu` |
| B12 Marketing — Truyền thông | H06 Marketing | `noi-dung-tiep-thi` · `bien-soan-noi-dung` |
| B13 Nhân sự | H03 Vận hành | `bangLuong` · roster 100 trợ lý |
| B14 Chăm sóc khách hàng | H04 Khách hàng | `crm` · `crmKhach` · `soCham` |
| B15 Nghiên cứu & X10 | H13 R&D | `cai-tien` · `ban-do-chien-luoc` |
| B16 Đối tác & Thuê ngoài | H11 Thuê ngoài | `ket-noi` · `phimGuiViec` |

## 3. Vòng đời một yêu cầu (request lifecycle)

```mermaid
flowchart LR
  R1["Người dùng<br/>mở màn / hỏi"] --> R2{"CORS đúng<br/>danh sách trắng?"}
  R2 -- không --> X1["403"]
  R2 -- đúng --> R3{"Phiên còn hạn?<br/>kiemPhien"}
  R3 -- không --> X2["401"]
  R3 -- đúng --> R4{"Trong nhịp/phút<br/>và hạn ngày?"}
  R4 -- vượt --> X3["429 · ghi soLocDaTri"]
  R4 -- đúng --> R5{"Cửa có trong<br/>CAN_PHIEN?"}
  R5 -- không --> X4["404"]
  R5 -- đúng --> R6{"Câu hỏi sạch?<br/>cổng Điều 13"}
  R6 -- bẩn --> X5["chặn · audit ATAI_DIEU13"]
  R6 -- sạch --> R7{"Kho giải pháp<br/>đã duyệt khớp?"}
  R7 -- có --> OK1["trả 0 token"]
  R7 -- không --> R8{"Đệm còn hạn?"}
  R8 -- có --> OK2["trả 0 token"]
  R8 -- không --> R9["Định tuyến rẻ trước<br/>+ độ chắc sharp/split"]
  R9 --> R10["gọi nhà cung cấp<br/>trong ngân sách + trần tải 50%"]
  R10 --> R11["ghi token · audit · đệm"]
  R11 --> OK3["trả kèm dinhTuyen<br/>người chấm tốt/chưa tốt"]
```

## 4. Vòng đêm tự vận hành (cron scheduled)

```mermaid
flowchart TB
  C0["Cron đêm (worker scheduled)"] --> C1["tuSoatVaChua:<br/>tự soát + tự chữa"]
  C0 --> C2["vongKhoaHocTuDong: quan sát → giả thuyết<br/>→ phép thử → đề xuất (0 token, 30 báo cáo)"]
  C0 --> C3["canhMauTuDong: canh mô hình mới<br/>của 5 hãng mỗi 7 ngày"]
  C0 --> C4["quetSaoLuuMoCoi: D1 ↔ R2"]
  C1 --> C5["sucKhoeHe: báo cáo sức khoẻ"]
  C2 --> C5
  C3 --> C5
  C4 --> C5
  C5 --> C6["Phát hiện mức cao → audit;<br/>sáng ra R01 đọc, quyết ở chốt chặn"]
```

## 5. Vòng đổi mã (CI/CD)

```mermaid
flowchart LR
  P1["PR / push"] --> P2["kiem-tra.yml: gop-src --kiem · cú pháp<br/>ra-soat · CORS · đồng bộ · bộ não<br/>cây tiền · do-16-he · soát bí mật"]
  P2 -- đỏ --> PX["chặn merge"]
  P2 -- xanh --> P3["deploy.yml → Cloudflare (main)"]
  P3 --> P4["do-16-he đo lại trên bản sống"]
```

## 6. Cây tiền — ba đích đo lúc đọc

| Chỉ số | Đích | Nguồn bảng | Cửa |
|---|---|---|---|
| Hài lòng (proxy không-xấu) | 90% | hoanTien · crmKhach · hoSoKhach | `docKpiCayTien` |
| Tái dùng + nâng cấp | 90% | phieuThu · lichSuTang | `docKpiCayTien` |
| Đạt tầng 5 | 20% | hoSoKhach.tang | `docKpiCayTien` |

## Chỗ còn thiếu (ghi thật)

1. Khảo sát hài lòng trực tiếp (CSAT) — "hài lòng" đang là proxy.
2. Lịch sản xuất nội dung tự xếp theo kỳ (B02) — hiện xếp tay.
3. Luật sư thật ký kết luận tuân thủ (B07).
4. Gantt/nguồn lực cho dự án (B08) — hiện qua bảng công việc + tuyến chốt chặn.
5. Màn tuyển dụng/hồ sơ nhân sự riêng (B13) — hiện qua bảng lương + roster.
6. Quy kết kênh marketing đem khách thật (B12) mà không theo dõi cá nhân.
7. Pentest độc lập · WAF/Bot Fight (bật trên Cloudflare) · diễn tập khôi phục định kỳ (xem LA_CHAN_30_TANG.md).
