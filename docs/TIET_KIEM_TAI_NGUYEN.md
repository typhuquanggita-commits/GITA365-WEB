# Làm việc với Claude trên kho này cho đỡ tốn

Anh Quang đặt bài: làm sao để làm việc hết tuần mà vẫn còn tài nguyên.

Tệp này chỉ ghi những thứ **đã đo được**, không ghi mẹo nghe hay. Mỗi mục
có con số trước và sau.

---

## Bốn chỗ tốn nhất, đo thật

| Chỗ tốn | Trước | Sau | Giảm |
|---|---|---|---|
| Bộ kiểm in ra mỗi lần chạy | 80.614 ký tự | 184 ký tự | **438 lần** |
| Dò lại kho mỗi phiên | không có bản đồ | `CLAUDE.md` | — |
| Lỡ đọc `gita-app.js` | ~360.000 token | bị chặn cứng | — |
| Lỡ đọc bản một tệp | ~540.000 token | bị chặn cứng | — |

Hai dòng cuối là chỗ nguy hiểm nhất: **một lần lỡ đọc tệp sinh ra là mất
nửa ngày làm việc**. Nó không kêu, không báo lỗi, chỉ lặng lẽ nuốt mất
phần tài nguyên lẽ ra dành cho việc thật.

---

## 1 · Luôn chạy bộ kiểm ở chế độ im

    xvfb-run -a node tools/kiem-tra.js --im

Chạy y hệt, đo y hệt — **759 phép đo, không bỏ phép nào**. Chỉ khác là nó
không in ra bốn mươi bảy mục màu xanh nữa.

Chỗ đỏ vẫn in đủ, và in kèm **số mục** để biết đường tìm:

    ✗ [mục 47] TẦNG NÀO CŨNG khai chỗ chưa có — 3/4 tầng khai chỗ hở

Đã thử ngược: cố tình làm hỏng một trường trong kho, chế độ im bắt đủ cả
bốn chỗ đỏ. Một chế độ im nuốt mất màu đỏ thì tệ hơn không có.

---

## 2 · Bốn tệp không bao giờ được đọc

`gita-app.js` · `GITA365.html` · `GITA365-v*-gioi-thieu.html` ·
`ban-xem-thu.html`

Chúng do máy sinh ra từ `src/` và `kho-goc/`. Muốn xem nội dung thì đọc
tệp nguồn, rồi dựng lại bằng `node tools/gop-src.js`.

Chặn **hai lớp**:
- `CLAUDE.md` nhắc — lớp này phụ thuộc trí nhớ
- `.claude/settings.json` có luật `deny` — lớp này thì không

Hai lớp vì lớp nhắc-nhở sẽ có ngày quên, còn lớp chặn thì không. Cùng
nguyên tắc với poka-yoke trong bảng tinh gọn: **làm cho cái sai không xảy
ra được, đừng nhắc người ta cẩn thận.**

---

## 3 · Bốn câu lệnh tắt thay cho một đoạn văn

Gõ `/kiem` thay vì tả lại việc cần làm. Câu lệnh nằm ở `.claude/commands/`:

| Gõ | Làm gì |
|---|---|
| `/kiem` | Chạy bộ kiểm ở chế độ im, và đọc kết quả theo đúng luật |
| `/dong-goi` | Mã hoá kho → soi kho đổi gì → gộp mã → dựng bản một tệp |
| `/ro-ri` | Đo mỗi vai NHẬN về máy những kho nào — phép soi rò dữ liệu |
| `/day` | Kiểm đủ ba bộ rồi mới chốt và đẩy |

Cái được không chỉ là gõ ít hơn. Mỗi câu lệnh mang theo **luật đọc kết
quả** — ví dụ `/kiem` nhắc "sửa chỗ hỏng thật, không nới phép kiểm cho vừa
dữ liệu". Không phải nhắc lại điều ấy mỗi lần là bớt được một đoạn dài.

---

## 4 · Nói việc gọn nhưng nói đủ ràng buộc

Chỗ tốn nhất trong một phiên không phải câu lệnh dài, mà là **làm sai rồi
làm lại**. Bảng tinh gọn gọi đó là LP-LAM-LAI: tốn gấp đôi công.

Ba thứ nói ngay từ đầu thì đỡ được vòng làm lại:

- **Kho hay tệp nào** — "sửa `src/cong-viec.js`" đỡ được một vòng đi tìm
- **Đo bằng gì thì gọi là xong** — "cho tới khi mục 40 xanh"
- **Chỗ nào KHÔNG được đụng** — "đừng đổi định dạng gói"

Ngược lại, đừng dán nội dung tệp vào lời nhắn. Bảo tên tệp là đủ; dán vào
là trả tiền hai lần cho cùng một thứ.

---

## 5 · Việc dài thì để chạy nền

Bộ kiểm mất mười hai phút. Chạy nền rồi làm việc khác trong lúc chờ, thay
vì ngồi hỏi đi hỏi lại xem xong chưa — mỗi lần hỏi là một vòng tốn thêm.

---

## 6 · Một phiên, một việc

Kho này có bốn mươi bảy mục kiểm và hai trăm bảy mươi tám kho nội dung.
Trộn ba việc khác nhau vào một phiên thì phần dẫn nhập của cả ba đều phải
nằm trong đầu cùng lúc, và không việc nào được làm tới nơi.

Xong một việc thì chốt lại — commit — rồi mở việc sau. Đó cũng chính là
nguyên tắc số 10 của bảng tinh gọn: **bỏ bớt trước khi thêm vào.**

---

## Chỗ này chưa có

- Chưa có bản dựng tự động chạy bộ kiểm mỗi lần đẩy mã. Hôm nay vẫn phải
  nhớ chạy tay trước khi đẩy.
- Chưa đo được một phiên làm việc thật tốn bao nhiêu, nên bốn con số ở
  đầu tệp này là đo trên **đầu ra của công cụ**, không phải đo trên hoá
  đơn. Cái gì chưa đo được thì ghi là chưa đo được.
