# Bộ não V20 · học từ bốn hệ tham chiếu

> V20 không phải con số tự khai — là các cơ chế **đo được** mới thêm vào bộ não đa trí (`may-chu/bo-nao-da-tri.js`), mỗi cơ chế học từ một hệ thật. Kiểm: `node tools/thu-da-tri.mjs` (76 phép thử) và `node tools/do-16-he.js` (cổng CI).

## Nói thật trước

- GITA **không vượt được bản thân các mô hình hàng đầu**; GITA hơn từng mô hình đơn lẻ *trên việc của GITA* nhờ định tuyến, kho giải pháp đã duyệt và tri thức miền — đo bằng điểm chấm.
- Cố vấn và bộ lọc **chỉ khuyên/chỉ đo, không tự ra tay** — cùng luật với bộ chấm V20 của khung vận hành: cổng thật nằm ở từng cửa.

## Bốn cơ chế mới

### 1. Lọc trước token — có đếm (học từ quy trình Zalo Agent)

Bộ lọc vốn có từ trước (quyền → hạn ngày → cổng Điều 13 → kho giải pháp → bộ đệm → ngân sách), nhưng âm thầm. V20 ghi mọi lượt dừng trước khi tốn token vào `soLocDaTri` và hiển thị ở sổ bộ não: hôm nay bao nhiêu lượt được phục vụ **0 token** nhờ kho/đệm, bao nhiêu lượt bị chặn vì Điều 13, hết hạn ngày, không có nhà cung cấp. Cái không đo được thì không ai tin — nay nó đo được.

### 2. Định tuyến có độ chắc — sharp / split (học từ fork layer của cây Agent)

`doChacDinhTuyen` so điểm chấm thật (làm mượt Laplace, ≥3 lượt) của hai ứng viên đầu:

- chênh ≥ 0,15 → **chắc (sharp)** — chạy bình thường;
- chênh < 0,15 → **chưa chắc (split)** — câu trả lời mang `dinhTuyen.goiYHoiDong`, giao diện hiện chip "định tuyến chưa chắc — nên hỏi hội đồng";
- chưa đủ điểm chấm → `doChac: null`, hệ nói thật là chưa đo được.

Cơ chế này **chỉ đo, không đổi thứ tự định tuyến** — thứ tự vẫn do chính sách rẻ-trước và tự điều chỉnh có biên quyết.

### 3. Cố vấn theo điểm chạm (học từ advisor on-call)

`coVanDaTri` im lặng ở mọi lượt thường, chỉ lên tiếng ở ba điểm:

| Điểm chạm | Ở đâu | Cố vấn làm gì |
|---|---|---|
| Trước khi lưu kế hoạch | `luuGiaiPhap` | Nhắc: giải pháp quá ngắn · có con số không nguồn · chiến lược chưa hỏi hội đồng |
| Khi lỗi lặp | `goiLeoBac` | Một nhà cung cấp lỗi ≥ 3 lần/ngày → ghi sổ `DA_TRI_LOI_LAP` + khuyên kiểm tra khoá/mô hình |
| Trước khi chốt | `duyetGiaiPhap` | Bản chiến lược chưa qua hội đồng → nhắc đối chiếu 3 trí tuệ trước khi duyệt |

Cố vấn **không bao giờ tự ra tay**: chủ hệ vẫn là người quyết (AT5).

### 4. Tuyến nhiều chặng có chốt chặn (học từ pipeline 5 khâu)

Ba cửa R01: `taoTuyenDaTri` (2–7 chặng, mỗi chặng một loại việc + đề), `chayChangDaTri` (chạy đúng MỘT chặng rồi dừng), `docTuyenDaTri` (xem). Nguyên tắc giữ từ bản gốc:

- **Chốt chặn từng khâu:** hệ dừng sau mỗi chặng chờ người đọc — không tự chạy trọn một mạch;
- **Vòng lặp quay lại:** kết quả các chặng trước làm ngữ cảnh (≤ 4000 ký tự) cho chặng sau;
- **Mọi chặng qua cổng Điều 13** và ngân sách ngày như mọi lượt hỏi khác;
- Mọi bước có vết trong sổ kiểm toán (`DA_TRI_TUYEN_TAO`, `DA_TRI_TUYEN_CHANG`).

Giao diện: ngăn **Tuyến chốt chặn** trong màn Bộ não đa trí.

## 12 tầng hậu cần (bài học "bếp không chỉ có mặt tiền")

Giao diện chỉ là phần nổi. `G.LC_HERCULES` trong `src/la-chan-30.js` liệt kê 12 tầng bên dưới — mỗi tầng trỏ vào mã/cấu hình thật, CI đo mọi con trỏ trên mỗi PR. Tầng **cân bằng tải & co giãn** do Cloudflare lo ở tầng mạng, repo không đo được — ghi thật thay vì giả vờ đo. Xem ở màn `la-chan-30`.

## Đo ở đâu

```
node tools/thu-da-tri.mjs   # 76 phép thử: sharp/split · 3 điểm chạm cố vấn · tuyến chốt chặn · đếm lọc
node tools/do-16-he.js      # con trỏ V20 + 12 tầng hậu cần sống trên mã thật
```
