# GITA 365 · BẢO VỆ TÀI SẢN TRÍ TUỆ

Kho tri thức GITA 365 — 1.000 kịch bản, 220 phác đồ, 42 mô thức chép từ sổ tay
người sáng lập, mô hình Gia đình vận hành 365, bộ ngôn từ dẫn dắt — là tài sản
độc quyền của Học viện GITA. Tài liệu này mô tả cách hệ thống bảo vệ nó, và
nói thẳng cả những gì nó **không** bảo vệ được.

---

## 1 · Nguyên tắc

> **Nội dung chuyên môn không nằm trong ứng dụng dưới dạng đọc được.**

Mọi thứ trong `src/` là khung ứng dụng: giao diện, điều hướng, la bàn văn hoá.
Toàn bộ kho tri thức nằm trong `kho/*.enc` — đã mã hoá **AES-256-GCM** với khoá
ngẫu nhiên 256 bit. Không có khoá thì đó chỉ là dữ liệu ngẫu nhiên.

**Khoá không bao giờ nằm trong mã nguồn.**

---

## 2 · Bảy gói và phạm vi cấp phép

| Gói | Nội dung | Ai được mở |
|---|---|---|
| `nen` | Mô hình 5 khoang – 9 vai, chân dung, lộ trình, nghi lễ, ghi nhận, cấp độ, hoa hồng, kiến trúc 100 năm | Mọi tài khoản đã đăng nhập |
| `nghe` | 42 mô thức, 220 phác đồ, ngôn từ dẫn dắt, điểm chạm, AI điều phối, hệ quản trị | Vai nghề — cấp ≤ 11 |
| `tang1` … `tang5` | 1.000 kịch bản chia theo năm tầng | Gia đình: tầng đang học và các tầng đã qua. Vai nghề: cả năm tầng |

**Client không tự phong quyền.** Ứng dụng gửi danh sách *xin*; **máy chủ đọc hồ
sơ tài khoản, biết vai và tầng thật, rồi chỉ trả khoá của phần được cấp phép.**

---

## 3 · Ba lớp bảo vệ đang chạy

**① Mã hoá tại chỗ.** `tools/ma-hoa-kho.js` đọc `kho-goc/`, chia gói, mã hoá và
xuất `kho/*.enc` + `kho/khoa.json`. Cả `kho-goc/` lẫn `kho/khoa.json` đều nằm
trong `.gitignore` — **không bao giờ đưa lên kho mã**.

**② Cấp khoá theo phiên.** Sau khi đăng nhập, ứng dụng gọi máy chủ cấp phép
(`server/GITA_CapPhep.gs`). Máy chủ kiểm phiên, tính phạm vi, trả đúng khoá được
cấp kèm hạn dùng, và ghi nhật ký: ai, lúc nào, mở gói nào, trên máy nào.

**③ Giải mã trong bộ nhớ.** Ứng dụng dùng WebCrypto giải mã ngay trong RAM.
Nội dung **không ghi ra đĩa, không vào localStorage**. Đổi vai là xoá sạch rồi
nạp lại theo phạm vi vai mới — không để sót nội dung của vai trước.

---

## 4 · Mật mã kín trên mọi tài liệu

Năm lớp, chi tiết ở **Nhóm 05 → Mật mã kín trên tài liệu**:

| Lớp | Cơ chế | Sống sót qua |
|---|---|---|
| Mã hiện | `GITA·7A3F·R07·260828·K2` in mờ chân trang | chép nguyên văn |
| Mã ẩn | ký tự rộng bằng không rải trong thân văn bản | dán sang Word, Zalo, nhận dạng chữ |
| Vân chữ | sơ đồ ngắt dòng riêng cho từng bản | xoá hai lớp trên |
| Đóng dấu chìm | tên tài khoản phủ mờ trên màn hình | ảnh chụp màn hình |
| Nhật ký cấp phát | ai · lúc nào · mã bản nào | mọi trường hợp |

Ô **quét mật mã kín** trong app dò cả ba lớp văn bản và trả về tài khoản đã nhận
bản đó.

---

## 5 · Vòng đời tài khoản

| Luật | Nội dung | Tự động |
|---|---|---|
| **L1** | KPI dưới 30% sau 90 ngày → khoá. Báo trước ngày 60 và 80 | có |
| **L2** | Mở lại theo yêu cầu, quản trị cấp 2 xem xét trong 3 ngày. Lần thứ ba trong năm phải do Giám đốc duyệt | không |
| **L3** | Không đăng nhập 180 ngày → thu hồi khoá, gỡ vai, hồ sơ chuyển lưu trữ. Dữ liệu gia đình giữ nguyên | có |
| **L4** | Chỉ mở/đóng được chức năng của **cấp thấp hơn** mình. Không ai tự nâng quyền cho chính mình | có |
| **L5** | Tài liệu hạng cao chỉ mở khi đủ **cấp bậc** và đủ **mốc KPI** | có |

Rủi ro lớn nhất và âm thầm nhất: **tài khoản nghỉ việc mà không thu hồi khoá.**
L3 tồn tại chính vì điều đó.

---

## 6 · Xếp hạng tài liệu 1 – 100

| Điểm | Bậc | KPI cần | Cấp cần |
|---|---|---|---|
| 1–20 | MỞ | 0% | 15 |
| 21–40 | NỀN | 30% | 14 |
| 41–60 | NGHỀ | 50% | 11 |
| 61–80 | CHUYÊN SÂU | 70% | 8 |
| 81–95 | BÍ KÍP | 85% | 6 |
| 96–100 | LÕI HỌC VIỆN | 92% | 4 |

Cùng một vai tư vấn, người đạt cấp cao hơn nhận tài liệu hay hơn. Thăng cấp mới
mở tài liệu tương ứng; tụt KPI thì khoá lại ở kỳ rà soát gần nhất.

---

## 7 · Triển khai — sáu bước

```bash
# 1. Sửa nội dung trong kho-goc/ (thư mục này KHÔNG lên kho mã)
# 2. Mã hoá lại
node tools/ma-hoa-kho.js

# 3. Nạp bộ khoá vào máy chủ
#    Mở kho/khoa.json → dán vào napBoKhoaMotLan() trong server/GITA_CapPhep.gs
#    Chạy hàm một lần → khoá vào Script Properties → XOÁ nội dung khoá khỏi hàm

# 4. Nối hai hàm cầu nối trong GITA_CapPhep.gs
#    kiemTraPhien_  → 02_Security.gs
#    ghiNhatKy_     → 09_Jobs.gs

# 5. Triển khai Web App, lấy URL, đặt vào G.API_CAP_PHEP
# 6. Kiểm lại
node tools/kiem-tra.js
```

Bản máy tính chạy ngoại tuyến dùng **tệp giấy phép** đặt trong thư mục dữ liệu
người dùng (*Tệp → Kích hoạt giấy phép…*). Giấy phép cấp riêng cho từng máy, có
hạn, và **không nằm trong bộ cài**.

---

## 8 · Nói thẳng — ba điều hệ thống này KHÔNG làm được

**① Không chặn được người đã được cấp phép cố tình chép lại phần họ đang xem.**
Không hệ thống nào trên đời làm được. Phần đó thuộc về hợp đồng, mật mã kín và
nhật ký truy cập — để khi có rò rỉ thì **truy được về đúng người**.

**② Khoá chuột phải, chặn phím tắt chỉ ngăn được người dùng bình thường.**
Chúng làm phiền khách thật nhiều hơn là cản được người biết việc. Hệ thống này
không dựa vào chúng.

**③ Nội dung đã từng công khai thì không rút lại được hoàn toàn.**
Kho mã này từng ở chế độ công khai. Lịch sử git đã được viết lại để gỡ nội dung
ra, nhưng **cần chuyển kho mã sang riêng tư** — đó là việc phải làm bằng tay:
`Settings → Danger Zone → Change repository visibility → Make private`.

---

## 9 · Giá trị lớn nhất không sao chép được

Tệp tài liệu chỉ là phần nhìn thấy được. Thứ làm nên GITA 365 là **hội đồng
chuyên môn giữ chuẩn nghề**, **người dẫn dắt có nghề thật**, và **cộng đồng gia
đình dám kể thật**. Ba thứ đó không có trong bất kỳ tệp nào, và không ai chép
được.
