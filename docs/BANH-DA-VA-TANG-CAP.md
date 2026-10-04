# GITA 365 — Bản tổng hợp để lập trình: Mười bánh đà × Năm tầng

> **Mục đích tệp này.** Gom về một chỗ hai cấu trúc để đưa thẳng vào lập trình:
>
> 1. **10 bánh đà lớn × 10 bánh đà nhỏ** = 100 việc nhỏ (bộ máy ở `src/banh-da.js`).
> 2. **5 tầng × 10 cấp mỗi tầng** = 50 cấp (lưới thăng tiến trải trọn hành trình).
>
> Kèm đúng tên trường mà bộ máy đọc, bảng tra cho người, và khối JS dán được.
>
> **Một điều phải nói thẳng.** Nội dung chi tiết dưới đây là **bản dựng mạch lạc
> theo chuẩn đã có của GITA 365** (năm tầng T1–T5, mô thức G–I–T–A, triết lý
> "đo chứ không hỏi, mở bằng bằng chứng chứ không bằng nút bấm"). Kho chuẩn thật
> nằm ở `kho-goc/data.banh-da.js` — **đã bị `.gitignore` chặn** (dòng 27), vì
> nội dung chuyên môn của Học viện không bao giờ để dạng chữ thường trong kho mã.
> Hãy dùng bản này làm **khung chuẩn và bản nháp để tinh chỉnh**, rồi chép khối
> JS vào `kho-goc/` (chỗ riêng, không lên git).

---

## 0 · Bộ máy đọc gì — chuẩn trường (schema)

Lấy đúng từ `src/banh-da.js`. Giữ nguyên tên trường thì dán vào là chạy, không
phải sửa mã hiển thị.

### `BD_LON` — mười bánh đà lớn

| Trường | Kiểu | Nghĩa | Ràng buộc bộ kiểm (`bdSoiCauTruc`) |
|---|---|---|---|
| `so` | số | Thứ tự 1–10, cũng là **cấp mở** bánh đà | — |
| `ma` | chuỗi | Mã duy nhất của bánh đà lớn | dùng ở `htTangCua('BD', ma)` |
| `tang` | `T1`–`T5` | Bánh đà này thuộc tầng nào | bắt buộc có |
| `ten` | chuỗi | Tên bánh đà | — |
| `c` | màu | Màu hiển thị (thường theo màu tầng) | — |
| `vong` | chuỗi | Vòng tự quay, **tối thiểu 3 mũi tên** `A→B→C→A` | `(số '→') ≥ 3` |
| `y` | chuỗi | Vì sao là bánh đà, không phải danh sách việc | — |
| `dau` | chuỗi | Dấu hiệu bánh đà **đang đứng** (đứng = stall) | bắt buộc có |
| `nho` | mảng | **Đúng 10** bánh đà nhỏ | `length === 10` |
| `nho[].ma` | chuỗi | Mã việc nhỏ, **duy nhất toàn cục** | không trùng |
| `nho[].ten` | chuỗi | Tên việc nhỏ | — |
| `nho[].viec` | chuỗi | Việc phải làm | — |
| `nho[].thay` | chuỗi | Làm xong thì **sẽ thấy** gì | — |

### `BD_CAP` — mười cấp mở bánh đà (thang mở khoá bằng bằng chứng)

| Trường | Kiểu | Nghĩa |
|---|---|---|
| `cap` | số | Cấp **liên tục** 1…N (bộ kiểm đòi `cap === i+1`) |
| `ten` | chuỗi | Tên cấp |
| `c` | màu | Màu cấp |
| `dk` | đối tượng | Điều kiện **máy đọc**: `{toi, chuoi, bai}` |
| `dk.toi` | số | Số tối có ghi nhật ký |
| `dk.chuoi` | số | Chuỗi ngày liền dài nhất |
| `dk.bai` | số | Số bài đánh giá đã xong |
| `mocThat` | chuỗi | Cùng điều kiện ấy viết bằng lời; **phải chứa đủ các số trong `dk`** (bộ kiểm `bdSoiLoiHua` dò) |
| `mo` | chuỗi | Qua mốc thì **mở ra** gì |
| `wow` | chuỗi | Nhà mình sẽ **thấy** gì (điểm chạm cụ thể, lấy từ dữ liệu nhà tự ghi) |

### `BD_CHON` — ngã ba (học như chơi Cashflow)

| Trường | Nghĩa |
|---|---|
| `cap` | Ngã ba này gặp ở cấp nào |
| `khi` | Khi nào gặp |
| `deChon` | Nhánh dễ (nhìn hấp dẫn) |
| `nenChon` | Nhánh nên chọn |
| `ai` | Ai gợi ý (vd `Coach`) |
| `giaNgay` | Giá của nhánh dễ, tính bằng **số ngày chậm hơn** |
| `viSao` | Vì sao nhánh dễ lại đắt |

### `BD_LUAT` — sáu luật của lớp

`{ no: số, t: tên luật, y: giải thích }`

### `BD_DAN` — lời dẫn đầu màn

`{ tieuDe: chuỗi, dan: [chuỗi,…] }` — vài câu khung, không bắt buộc với bộ kiểm.

---

## PHẦN A · MƯỜI BÁNH ĐÀ LỚN × MƯỜI BÁNH ĐÀ NHỎ

Mười bánh đà chia đều cho năm tầng (mỗi tầng 2), mở dần theo cấp `so`. Mỗi bánh
đà lớn có đúng mười việc nhỏ. Mã việc nhỏ là `BD{lớn}-{nhỏ}`, duy nhất toàn cục.

| Bánh đà | Tầng | Tên | Màu | Mở ở cấp |
|---|---|---|---|---|
| 1 | T1 · Nền | Sổ tối ba dòng | `#185AB4` | 1 |
| 2 | T1 · Nền | Bảng số chung của nhà | `#185AB4` | 2 |
| 3 | T2 · Nhịp | Nhịp tuần giữ được | `#5140B4` | 3 |
| 4 | T2 · Nhịp | Gọi tên mô thức lặp | `#5140B4` | 4 |
| 5 | T3 · Hệ thống | Chín vai có người giữ | `#0B6675` | 5 |
| 6 | T3 · Hệ thống | Nghi lễ & nếp bền | `#0B6675` | 6 |
| 7 | T4 · Chiều sâu | Động lực bên trong | `#0B7350` | 7 |
| 8 | T4 · Chiều sâu | Người lớn đổi trước | `#0B7350` | 8 |
| 9 | T5 · Trao quyền | Kể lại bằng bằng chứng | `#BE0E16` | 9 |
| 10 | T5 · Trao quyền | Kèm một nhà mới | `#BE0E16` | 10 |

---

### Bánh đà 1 · T1 · Sổ tối ba dòng
- **Vòng:** Ghi ba dòng → Thấy số thật → Bớt cãi chuyện đã qua → Tối sau dễ ngồi ghi → Ghi
- **Ý:** Việc nhỏ nhất của cả hệ. Ghi được thì mọi con số về sau có gốc; không ghi thì mọi giải pháp dựng trên phỏng đoán có thiện chí.
- **Dấu hiệu đang đứng:** Ba tối liền sổ trống, hoặc chỉ người lớn ghi còn con đứng ngoài.

| Mã | Việc nhỏ | Làm | Sẽ thấy |
|---|---|---|---|
| BD1-1 | Giờ ngồi vào bàn | Ghi giờ con ngồi vào bàn học tối nay | Giờ bắt đầu dao động bao nhiêu giữa các tối |
| BD1-2 | Giờ rời bàn | Ghi giờ rời bàn | Buổi học thật sự dài bao lâu, không phải cảm giác |
| BD1-3 | Số lần phải nhắc | Đếm số lần người lớn phải nhắc tối nay | Một con số, thay cho câu "tối nay căng quá" |
| BD1-4 | Một dòng không khí | Ghi một từ cho không khí tối nay | Tuần có mấy tối "được" |
| BD1-5 | Đọc lại cuối tuần | Cả nhà đọc lại sổ bảy tối một lần | Tuần mình thật sự ra sao, không ai nhớ hộ |
| BD1-6 | Ghi trước khi ngủ | Chốt sổ trong 10 phút trước giờ ngủ | Việc ghi thành phản xạ, không phải bài tập |
| BD1-7 | Không bỏ tối nào | Tối mệt vẫn ghi một dòng | Chuỗi dài lên, đà bắt đầu tự quay |
| BD1-8 | Ghi cả tối tốt | Ghi cả tối trôi chảy, không chỉ tối hỏng | Cái gì làm nên tối tốt để lặp lại |
| BD1-9 | Con tự ghi một dòng | Để con tự viết một dòng của con | Con bắt đầu có tiếng nói trong sổ |
| BD1-10 | Sổ thành thói quen | Ghi đủ 21 tối không ai nhắc | Sổ chạy mà không cần người giữ nhịp |

### Bánh đà 2 · T1 · Bảng số chung của nhà
- **Vòng:** Gom số từ sổ → Cả nhà nhìn một bảng → Hết mỗi người một phiên bản → Tin bảng hơn trí nhớ → Gom tiếp
- **Ý:** Một bảng thay cho năm trí nhớ. Nhà thôi tranh "tuần rồi thế nào".
- **Dấu hiệu đang đứng:** Bảng để một người giữ, cả nhà không mở; hoặc số nhập tay không khớp sổ.

| Mã | Việc nhỏ | Làm | Sẽ thấy |
|---|---|---|---|
| BD2-1 | Dựng bảng 30 ô | Kẻ bảng 30 ngày, mỗi tối một ô | Cả tháng mình gọn trong một trang |
| BD2-2 | Đổ số từ sổ | Mỗi tối tô ô theo sổ, không nhớ lại | Bảng khớp sổ, không khớp cảm giác |
| BD2-3 | Ô trống để trống | Không tô bù ô đã bỏ | Tháng thật, cả chỗ hỏng |
| BD2-4 | Dán chỗ cả nhà thấy | Treo bảng chỗ ai cũng đi qua | Bảng thành nền, không phải tài liệu |
| BD2-5 | Nhìn bảng cuối tuần | Cả nhà đứng trước bảng 5 phút mỗi Chủ nhật | Xu hướng tuần, không phải một tối lẻ |
| BD2-6 | Một câu có số | Nói một câu về tháng bằng con số trên bảng | Mình mô tả nhà bằng số, không bằng cảm xúc |
| BD2-7 | Đạt 22/30 | Giữ bảng đủ 22 tối có ghi trong 30 ngày | Mốc "đủ" đạt được mà không cần hoàn hảo |
| BD2-8 | Con tô ô của con | Giao con tô phần ô của con | Con đọc được bảng của chính mình |
| BD2-9 | So hai tháng | Đặt bảng tháng này cạnh tháng trước | Nhà đi lên hay đứng, bằng mắt |
| BD2-10 | Bảng tự chạy | Một tháng bảng đầy mà không ai nhắc | Bảng tự sống |

### Bánh đà 3 · T2 · Nhịp tuần giữ được
- **Vòng:** Đặt nhịp tuần → Chạy qua tuần thường → Chạy qua tuần có biến cố → Tin nhịp giữ được → Đặt nhịp sâu hơn
- **Ý:** Nhịp chỉ thật khi sống qua tuần hỏng. Đây là chỗ phân biệt nếp thật và nếp lúc rảnh.
- **Dấu hiệu đang đứng:** Nhịp đổ ngay tuần đầu có việc đột xuất; hoặc nhịp chỉ chạy khi có người kèm.

| Mã | Việc nhỏ | Làm | Sẽ thấy |
|---|---|---|---|
| BD3-1 | Chọn ba nếp tuần | Chọn đúng ba nếp cho tuần, không hơn | Tuần có xương sống, không ôm đồm |
| BD3-2 | Giờ cố định | Gắn mỗi nếp vào một giờ cố định | Nếp bớt phụ thuộc hứng |
| BD3-3 | Mức tối thiểu ngày mệt | Định nghĩa bản tối thiểu cho ngày mệt | Nếp không gãy vào ngày xấu |
| BD3-4 | Buổi nhìn lại tuần | 15 phút cuối tuần nhìn lại nhịp | Nhà tự chỉnh, không đợi Coach |
| BD3-5 | Giữ qua tuần ốm | Chạy nhịp tối thiểu qua một tuần có người ốm | Nếp đứng cả khi trời xấu |
| BD3-6 | Giữ qua tuần thi | Chạy nhịp qua tuần thi cử | Học không nuốt mất nếp nhà |
| BD3-7 | Giữ qua tuần đi xa | Mang bản tối thiểu theo chuyến đi | Nếp không cần ở nhà mới chạy được |
| BD3-8 | Ba trên bốn nếp | Giữ ≥3/4 nếp trong một tuần biến cố | Mốc nhịp đạt bằng số |
| BD3-9 | Con giữ một nếp | Giao con làm chủ một nếp tuần | Con gánh một mảnh nhịp |
| BD3-10 | Nhịp tự chạy | Bốn tuần nhịp giữ mà không ai nhắc | Nhịp thành nền |

### Bánh đà 4 · T2 · Gọi tên mô thức lặp
- **Vòng:** Nhìn bảng → Thấy chỗ lặp → Gọi tên mô thức → Chạm đúng gốc → Bảng đổi, nhìn lại
- **Ý:** Biết "tối thứ Tư luôn căng" bằng một cái tên thì mới chạm được gốc, thay vì chữa triệu chứng.
- **Dấu hiệu đang đứng:** Nhà chữa triệu chứng mãi — nhắc nhiều hơn, phạt nặng hơn — mà mô thức vẫn lặp.

| Mã | Việc nhỏ | Làm | Sẽ thấy |
|---|---|---|---|
| BD4-1 | Khoanh tối hay hỏng | Khoanh trên bảng những tối lặp kiểu hỏng | Hỏng có quy luật, không ngẫu nhiên |
| BD4-2 | Đặt tên mô thức | Đặt một cái tên nhà mình hiểu | Gọi được thì bàn được |
| BD4-3 | Tìm mồi châm | Tìm cái châm ngòi trước mỗi lần lặp | Gốc nằm trước lúc bùng |
| BD4-4 | Một câu có số | Nói mô thức bằng một câu có số, bằng lời người trong nhà | Mình hiểu nhà mình bằng dữ liệu |
| BD4-5 | Thử một can thiệp | Đổi đúng một thứ ở mồi châm | Đổi gốc rẻ hơn chữa ngọn |
| BD4-6 | Đo lại sau hai tuần | Nhìn bảng xem mô thức có thưa đi | Can thiệp có tác dụng hay không, bằng số |
| BD4-7 | Bỏ can thiệp vô ích | Dẹp thứ không làm bảng đổi | Nhà thôi tốn sức vào việc không đổi gì |
| BD4-8 | Gọi tên mô thức tốt | Đặt tên cả mô thức chạy tốt để giữ | Nhà biết cái gì nên lặp |
| BD4-9 | Con gọi tên mô thức của con | Giúp con tự gọi tên một kiểu lặp của mình | Con có ngôn ngữ về chính mình |
| BD4-10 | Sổ mô thức của nhà | Gom các mô thức đã gọi tên thành một trang | Nhà có bản đồ chính mình |

### Bánh đà 5 · T3 · Chín vai có người giữ
- **Vòng:** Liệt kê chín vai → Nhận vai → Không ai quá bốn vai → Nhà tự chạy → Soát lại vai
- **Ý:** Nhà tự vận hành phần lớn khi vai có người giữ; Coach chỉ còn vào ở điểm nghẽn.
- **Dấu hiệu đang đứng:** Một người gánh quá bốn vai; hoặc vai bỏ trống mà không ai nhận.

| Mã | Việc nhỏ | Làm | Sẽ thấy |
|---|---|---|---|
| BD5-1 | Dựng bảng chín vai | Viết ra chín vai giữ nhà | Nhà cần gì để chạy |
| BD5-2 | Gắn tên vào vai | Mỗi vai một cái tên thật | Chỗ trống và chỗ chồng |
| BD5-3 | Không ai quá bốn | Chia lại để không ai giữ quá bốn vai | Chỗ vỡ sớm được chặn |
| BD5-4 | Đạt 6/9 vai | Giữ ít nhất 6 trên 9 vai có người | Mốc vai đạt bằng số |
| BD5-5 | Vai có bàn giao | Mỗi vai biết khi vắng thì ai đỡ | Nhà không gãy khi một người vắng |
| BD5-6 | Con nhận một vai thật | Giao con một vai có trọng lượng | Con là người giữ, không phải người được nhắc |
| BD5-7 | Coach lùi khỏi vai | Coach trả lại vai đang giữ hộ | Nhà chạy không cần người ngoài |
| BD5-8 | Soát vai mỗi tháng | Nhìn lại bảng vai mỗi tháng | Vai theo kịp nhà đang đổi |
| BD5-9 | Vai xoay được | Thử xoay một vai giữa các thành viên | Nhà không lệ thuộc một người |
| BD5-10 | Chín vai tự đứng | Một tháng chín vai chạy mà Coach không vào | Nhà tự vận hành phần lớn |

### Bánh đà 6 · T3 · Nghi lễ & nếp bền
- **Vòng:** Dựng nghi lễ → Lặp đủ lâu → Nếp thành mặc định → Giữ qua ngày mệt → Dựng nghi lễ sâu hơn
- **Ý:** Nghi lễ biến việc phải nhắc thành việc mặc định. Nếp đứng cả ngày mệt mới là nếp.
- **Dấu hiệu đang đứng:** Nghi lễ thành hình thức, không ai thấy nghĩa; hoặc đổ ngay ngày đầu mệt.

| Mã | Việc nhỏ | Làm | Sẽ thấy |
|---|---|---|---|
| BD6-1 | Nghi lễ mở ngày | Dựng một nghi lễ ngắn đầu ngày | Ngày có điểm khởi |
| BD6-2 | Nghi lễ đóng ngày | Dựng một nghi lễ ngắn cuối ngày | Ngày có điểm chốt |
| BD6-3 | Ngắn và thật | Giữ nghi lễ dưới năm phút | Nếp bền vì nhẹ |
| BD6-4 | Gắn nghĩa | Nói rõ nghi lễ này để làm gì | Nhà làm vì hiểu, không vì lệ |
| BD6-5 | Nếp qua ngày mệt | Giữ bản tối thiểu của nghi lễ ngày mệt | Nếp không cần ngày đẹp |
| BD6-6 | Nghi lễ tuần | Dựng một nghi lễ cho cả tuần | Tuần có nhịp lớn |
| BD6-7 | Con dẫn một nghi lễ | Giao con dẫn một nghi lễ | Con giữ nhịp cho nhà |
| BD6-8 | Bỏ nghi lễ chết | Dẹp nghi lễ không còn nghĩa | Nhà không giữ lệ rỗng |
| BD6-9 | Nghi lễ mốc | Dựng nghi lễ cho mốc hoàn thành | Nhà biết ăn mừng đúng chỗ |
| BD6-10 | Nếp tự giữ | Một tuần biến cố mà nếp vẫn đứng ở mức tối thiểu | Nếp thật, không phải nếp lúc rảnh |

### Bánh đà 7 · T4 · Động lực bên trong
- **Vòng:** Giảm thưởng–phạt → Mở chỗ con tự chọn → Con làm vì muốn → Kết quả bền hơn → Mở chỗ chọn lớn hơn
- **Ý:** Phần không mua được bằng kỷ luật. Con chuyển từ làm-vì-được-yêu-cầu sang làm-vì-muốn.
- **Dấu hiệu đang đứng:** Con chỉ chạy khi có thưởng–phạt; bỏ thưởng là bỏ việc.

| Mã | Việc nhỏ | Làm | Sẽ thấy |
|---|---|---|---|
| BD7-1 | Một việc con tự chọn | Để con chọn một việc không gắn thưởng | Con có vùng tự quyết |
| BD7-2 | Hỏi "vì sao con muốn" | Hỏi lý do của con, không áp lý do của mình | Động lực của con, không phải của mình |
| BD7-3 | Bớt một phần thưởng | Gỡ một phần thưởng nhỏ, giữ việc | Việc còn hay rụng khi bỏ thưởng |
| BD7-4 | Khen quá trình | Khen cách làm thay vì kết quả | Con bám quá trình, không bám điểm |
| BD7-5 | Để con vấp an toàn | Cho con chịu hệ quả nhỏ của lựa chọn | Con học từ hệ quả, không từ lời |
| BD7-6 | Mục tiêu của con | Con tự đặt một mục tiêu của mình | Mục tiêu có chủ |
| BD7-7 | Con bảo vệ mục tiêu | Con nói trước cả nhà vì sao chọn mục tiêu đó | Con đứng được sau lựa chọn |
| BD7-8 | Giữ 30 ngày tự nguyện | Một việc con tự chọn giữ đủ 30 ngày | Động lực bên trong có độ bền |
| BD7-9 | Con tự chỉnh khi lệch | Con tự sửa khi mục tiêu chệch | Con lái, không đợi lái hộ |
| BD7-10 | Làm-vì-muốn thành mặc định | Phần lớn việc chạy không cần thưởng–phạt | Nhà qua được chỗ kỷ luật không mua được |

### Bánh đà 8 · T4 · Người lớn đổi trước
- **Vòng:** Người lớn chọn một thói quen → Ghi như con ghi → Con thấy người lớn đổi thật → Nhà đổi cùng → Chọn thói quen sâu hơn
- **Ý:** Chặng của con không giữ nổi nếu người lớn không đổi gì. Đây là mục tiêu của cha mẹ, không phải của con.
- **Dấu hiệu đang đứng:** Nhà đòi con đổi mà người lớn không có mục nào của mình; con thấy và dừng lại.

| Mã | Việc nhỏ | Làm | Sẽ thấy |
|---|---|---|---|
| BD8-1 | Người lớn chọn một thói quen | Cha/mẹ chọn một thói quen của mình | Đổi bắt đầu từ người lớn |
| BD8-2 | Ghi như con ghi | Người lớn ghi sổ đúng cách con vẫn ghi | Cùng một thước cho cả nhà |
| BD8-3 | Công khai với nhà | Nói mục của mình trước cả nhà | Người lớn cũng chịu soi |
| BD8-4 | Chịu nhắc như con | Người lớn nhận nhắc khi lỡ | Luật áp cho mọi người |
| BD8-5 | Giữ 30 ngày có sổ | Giữ thói quen đủ 30 ngày, có sổ | Người lớn làm được điều đòi ở con |
| BD8-6 | Kể cả lần hỏng | Ghi cả hôm trượt, không giấu | Thành thật là một phần của nếp |
| BD8-7 | Con soi người lớn | Để con nhắc người lớn khi lỡ | Quyền soi hai chiều |
| BD8-8 | Trình bày ở buổi nhìn lại | Người lớn trình bày thói quen ở buổi nhìn lại | Người lớn chịu trách nhiệm công khai |
| BD8-9 | Thói quen thứ hai | Giữ thêm một thói quen thứ hai | Đổi lan ra |
| BD8-10 | Người lớn là bằng chứng sống | Con làm vì thấy người lớn làm | Nhà đổi cùng, không chỉ con đổi |

### Bánh đà 9 · T5 · Kể lại bằng bằng chứng
- **Vòng:** Gom bằng chứng → Dựng câu chuyện thật → Kể cho nhà mới → Thứ đã học đứng vững hơn → Gom tiếp chặng sau
- **Ý:** Dạy lại là chỗ thứ đã học đứng vững nhất. Kể có bằng chứng, không tô hồng.
- **Dấu hiệu đang đứng:** Nhà kể bằng cảm xúc, không có số; hoặc giấu chỗ hỏng khi kể.

| Mã | Việc nhỏ | Làm | Sẽ thấy |
|---|---|---|---|
| BD9-1 | Gom bằng chứng một năm | Gom sổ, bảng, mốc của một năm | Hành trình có vật chứng |
| BD9-2 | Dựng dòng thời gian | Xếp mốc theo thời gian | Nhà đi từ đâu tới đâu |
| BD9-3 | Chọn ba chỗ ngoặt | Chọn ba điểm đổi thật sự | Đâu là chỗ xoay |
| BD9-4 | Kể cả chỗ hỏng | Để lại trong câu chuyện chỗ từng trượt | Câu chuyện tin được vì không tô hồng |
| BD9-5 | Một câu có số mỗi chặng | Mỗi tầng một câu có số | Kể bằng dữ liệu, không bằng tính từ |
| BD9-6 | Con kể phần của con | Con tự kể chặng của mình | Con là người kể, không phải nhân vật |
| BD9-7 | Người lớn kể phần của mình | Người lớn kể thói quen đã đổi | Đổi hai chiều trong câu chuyện |
| BD9-8 | Kể gọn tám phút | Rút câu chuyện còn tám phút | Nhà nói được cốt lõi |
| BD9-9 | Kể cho một nhà lạ | Kể cho một nhà chưa quen | Câu chuyện đứng ngoài nhà mình |
| BD9-10 | Câu chuyện bằng chứng khép | Trình bày đủ cho một nhà mới, có vật chứng | Thứ đã học đứng vững khi dạy lại |

### Bánh đà 10 · T5 · Kèm một nhà mới
- **Vòng:** Nhận một nhà mới → Kèm bằng chính nếp mình → Nhà mới chạy được → Nhà mình vững thêm → Kèm nhà kế
- **Ý:** Nhà trở thành nơi nhà khác học được. Sau tầng 5 là **đổi vai** sang thang người đi kèm, không phải lên bậc (xem Luật 6).
- **Dấu hiệu đang đứng:** Nhà mình làm hộ nhà mới thay vì kèm; hoặc kèm xong nhà mới lại dựa mãi.

| Mã | Việc nhỏ | Làm | Sẽ thấy |
|---|---|---|---|
| BD10-1 | Nhận một nhà | Nhận kèm đúng một nhà mới | Mình bước sang vai dẫn |
| BD10-2 | Bắt đầu từ sổ tối | Dạy nhà mới ghi sổ ba dòng trước tiên | Nền phải dựng lại từ đầu |
| BD10-3 | Không làm hộ | Để nhà mới tự ghi, mình chỉ soi | Kèm khác làm hộ |
| BD10-4 | Chỉ vào điểm nghẽn | Chỉ can thiệp ở chỗ nghẽn của nhà mới | Mình giữ đúng vai Coach |
| BD10-5 | Trao lại bảng số | Giúp nhà mới dựng bảng của họ | Nhà mới có thước riêng |
| BD10-6 | Đặt mốc cho nhà mới | Cùng nhà mới đặt mốc đo được | Kèm có đích, không chung chung |
| BD10-7 | Lùi dần | Giảm số lần mình vào theo tuần | Nhà mới tự đứng dần |
| BD10-8 | Nhà mới giữ nhịp một mình | Nhà mới giữ nhịp một tuần không có mình | Kèm thành công bằng số |
| BD10-9 | Nhà mới kể lại được | Nhà mới trình bày được hành trình của họ | Đà truyền sang nhà kế |
| BD10-10 | Đà truyền tiếp | Nhà mới bắt đầu kèm một nhà khác | Máy không dừng ở nhà mình |

---

## PHẦN B · NĂM TẦNG × MƯỜI CẤP MỖI TẦNG = 50 CẤP

Khác với `BD_CAP` (10 cấp mở khoá bánh đà), đây là **lưới thăng tiến chi tiết**:
mỗi tầng có 10 cấp nội bộ, cộng lại 50 cấp trải trọn hành trình. `capGlobal` 1→50
là thang chung (đơn điệu, luôn tăng); `cap` 1→10 là vị trí trong tầng.

**Tên & câu hỏi năm tầng** (lấy từ `src/data.core.js`):

| Tầng | Mã | Tên | Câu hỏi | Mốc ngày | Màu | Tên đồng hành |
|---|---|---|---|---|---|---|
| 1 | T1 | NHẬN DIỆN | Đang có vấn đề gì? | 7 | `#185AB4` | Nền |
| 2 | T2 | GIẢI MÃ | Vì sao vấn đề xảy ra? | 21 | `#5140B4` | Nhịp |
| 3 | T3 | KIẾN TẠO | Cần làm gì và làm thế nào? | 90 | `#0B6675` | Hệ thống |
| 4 | T4 | CHUYỂN HÓA | Làm sao duy trì thay đổi thành năng lực? | 365 | `#0B7350` | Chiều sâu |
| 5 | T5 | BỨT PHÁ | Gia đình có thể phát triển tới đâu? | 365 | `#BE0E16` | Trao quyền |

> **Lưu ý calib số.** Cột `dk` (toi/chuoi/bai) là **gợi ý chuẩn hoá để tinh
> chỉnh** — thang 848 ngày của cả chương trình nên con số ở tầng cao là mốc trải
> dài. `mocThat` luôn chứa đủ các số trong `dk` (giữ đúng để qua `bdSoiLoiHua`).

### Tầng 1 · NỀN / NHẬN DIỆN — dựng sổ & bảng

| Cấp (chung·tầng) | Tên | dk `{toi,chuoi,bai}` | Mốc thật | Mở ra | Điểm chạm |
|---|---|---|---|---|---|
| 1 · 1 | Tối đầu tiên | `{toi:1}` | Ghi 1 tối đủ ba dòng | Sổ tối | Dòng dữ liệu đầu tiên do chính nhà tạo ra |
| 2 · 2 | Ba tối | `{toi:3}` | 3 tối có ghi | Nếp ghi | Thấy ghi được ba tối là làm được |
| 3 · 3 | Một tuần | `{toi:7}` | 7 tối có ghi | Tuần đầu | Một tuần có vật chứng |
| 4 · 4 | Đọc lại tuần | `{toi:7,chuoi:5}` | 7 tối ghi, chuỗi 5 ngày | Buổi đọc lại | Cả nhà đọc lại một tuần thật |
| 5 · 5 | Bảy tối liền | `{toi:7,chuoi:7}` | Chuỗi 7 ngày liền | Mốc nền đầu | Nhà thôi cãi nhau về chuyện đã xảy ra |
| 6 · 6 | Bảng số dựng | `{toi:10}` | 10 tối có ghi | Bảng số chung | Tháng gọn trong một trang |
| 7 · 7 | Hai tuần có ghi | `{toi:14}` | 14 tối có ghi | Bảng tô đều | Xu hướng bắt đầu hiện |
| 8 · 8 | Cả nhà cùng nhìn | `{toi:16,chuoi:7}` | 16 tối ghi, chuỗi 7 | Bảng dán tường | Cả nhà nhìn một bảng, không năm phiên bản |
| 9 · 9 | Ba tuần có ghi | `{toi:18}` | 18 tối có ghi | Bảng tháng | Nền gần đủ |
| 10 · 10 | Nền đứng | `{toi:22,chuoi:7}` | 22 tối ghi trong 30 ngày, chuỗi 7 | Qua Tầng 1 | Bảy tối liền có nhật ký đủ ba dòng, cả nhà đọc lại một lần |

### Tầng 2 · NHỊP / GIẢI MÃ — nhịp tuần & gọi tên mô thức

| Cấp (chung·tầng) | Tên | dk `{toi,chuoi,bai}` | Mốc thật | Mở ra | Điểm chạm |
|---|---|---|---|---|---|
| 11 · 1 | Ba nếp tuần | `{toi:26}` | 26 tối có ghi | Nhịp tuần | Tuần có xương sống |
| 12 · 2 | Nhịp giờ cố định | `{toi:30}` | 30 tối có ghi | Giờ cố định | Nếp bớt phụ thuộc hứng |
| 13 · 3 | Bản tối thiểu ngày mệt | `{toi:34,bai:1}` | 34 tối ghi, 1 bài đánh giá | Bản ngày mệt | Nếp không gãy vào ngày xấu |
| 14 · 4 | Buổi nhìn lại tuần | `{toi:38}` | 38 tối có ghi | Buổi nhìn lại | Nhà tự chỉnh, không đợi Coach |
| 15 · 5 | Nhịp qua tuần ốm | `{toi:42,chuoi:10}` | 42 tối ghi, chuỗi 10 | Nhịp chịu biến | Nếp đứng cả khi trời xấu |
| 16 · 6 | Khoanh chỗ hay hỏng | `{toi:46,bai:1}` | 46 tối ghi, 1 bài | Soi mô thức | Hỏng có quy luật, không ngẫu nhiên |
| 17 · 7 | Gọi tên mô thức | `{toi:50}` | 50 tối có ghi | Gọi tên lặp | Gọi được thì bàn được |
| 18 · 8 | Tìm mồi châm | `{toi:55,bai:2}` | 55 tối ghi, 2 bài | Chạm gốc | Gốc nằm trước lúc bùng |
| 19 · 9 | Một can thiệp gốc | `{toi:60}` | 60 tối có ghi | Thử can thiệp | Đổi gốc rẻ hơn chữa ngọn |
| 20 · 10 | Nhịp & tên đứng vững | `{toi:67,chuoi:14,bai:2}` | 67 tối ghi, chuỗi 14, 2 bài | Qua Tầng 2 | Nói được một câu có số về chỗ nhà hay hỏng, bằng lời người trong nhà |

### Tầng 3 · HỆ THỐNG / KIẾN TẠO — vai & nghi lễ, nhà tự chạy

| Cấp (chung·tầng) | Tên | dk `{toi,chuoi,bai}` | Mốc thật | Mở ra | Điểm chạm |
|---|---|---|---|---|---|
| 21 · 1 | Bảng chín vai | `{toi:75}` | 75 tối có ghi | Chín vai | Nhà cần gì để chạy |
| 22 · 2 | Gắn tên vào vai | `{toi:82,bai:3}` | 82 tối ghi, 3 bài | Vai có chủ | Chỗ trống và chỗ chồng |
| 23 · 3 | Không ai quá bốn vai | `{toi:90}` | 90 tối có ghi | Chặn quá tải | Chỗ vỡ sớm được chặn |
| 24 · 4 | Sáu trên chín vai | `{toi:100,chuoi:14}` | 100 tối ghi, chuỗi 14 | Mốc vai | Từ 6/9 vai có người, không ai quá 4 |
| 25 · 5 | Nghi lễ mở/đóng ngày | `{toi:110}` | 110 tối có ghi | Nghi lễ ngày | Ngày có điểm khởi và điểm chốt |
| 26 · 6 | Nếp qua ngày mệt | `{toi:120,bai:3}` | 120 tối ghi, 3 bài | Nếp bền | Nếp không cần ngày đẹp |
| 27 · 7 | Vai có bàn giao | `{toi:130}` | 130 tối có ghi | Bàn giao vai | Nhà không gãy khi một người vắng |
| 28 · 8 | Coach lùi khỏi vai | `{toi:140,chuoi:18}` | 140 tối ghi, chuỗi 18 | Coach lùi | Nhà chạy không cần người ngoài giữ nhịp hộ |
| 29 · 9 | Soát vai hàng tháng | `{toi:150,bai:4}` | 150 tối ghi, 4 bài | Soát định kỳ | Vai theo kịp nhà đang đổi |
| 30 · 10 | Hệ thống tự chạy | `{toi:165,chuoi:21,bai:4}` | 165 tối ghi, chuỗi 21, 4 bài | Qua Tầng 3 | Nếp còn giữ được trong một tuần có biến cố, ở mức tối thiểu của ngày mệt |

### Tầng 4 · CHIỀU SÂU / CHUYỂN HÓA — động lực trong & người lớn đổi

| Cấp (chung·tầng) | Tên | dk `{toi,chuoi,bai}` | Mốc thật | Mở ra | Điểm chạm |
|---|---|---|---|---|---|
| 31 · 1 | Việc con tự chọn | `{toi:180}` | 180 tối có ghi | Vùng tự quyết | Con có vùng tự quyết |
| 32 · 2 | Khen quá trình | `{toi:195,bai:5}` | 195 tối ghi, 5 bài | Khen cách làm | Con bám quá trình, không bám điểm |
| 33 · 3 | Bớt một phần thưởng | `{toi:210}` | 210 tối có ghi | Gỡ thưởng | Việc còn hay rụng khi bỏ thưởng |
| 34 · 4 | Mục tiêu của con | `{toi:225,chuoi:21}` | 225 tối ghi, chuỗi 21 | Mục tiêu có chủ | Mục tiêu có chủ |
| 35 · 5 | Con bảo vệ mục tiêu | `{toi:240}` | 240 tối có ghi | Tự bảo vệ | Con tự chọn và tự bảo vệ một mục tiêu trước cả nhà |
| 36 · 6 | Người lớn chọn thói quen | `{toi:255,bai:6}` | 255 tối ghi, 6 bài | Người lớn vào cuộc | Đổi bắt đầu từ người lớn |
| 37 · 7 | Người lớn ghi như con | `{toi:270}` | 270 tối có ghi | Cùng một thước | Cùng một thước cho cả nhà |
| 38 · 8 | Giữ 30 ngày tự nguyện | `{toi:285,chuoi:28}` | 285 tối ghi, chuỗi 28 | Độ bền động lực | Một việc con tự chọn giữ đủ 30 ngày |
| 39 · 9 | Con tự chỉnh khi lệch | `{toi:300,bai:6}` | 300 tối ghi, 6 bài | Con tự lái | Con lái, không đợi lái hộ |
| 40 · 10 | Làm-vì-muốn thành mặc định | `{toi:320,chuoi:28,bai:6}` | 320 tối ghi, chuỗi 28, 6 bài | Qua Tầng 4 | Đứa trẻ chuyển từ làm-vì-được-yêu-cầu sang làm-vì-muốn; người lớn có một thói quen đủ 30 ngày |

### Tầng 5 · TRAO QUYỀN / BỨT PHÁ — kể lại & kèm nhà mới

| Cấp (chung·tầng) | Tên | dk `{toi,chuoi,bai}` | Mốc thật | Mở ra | Điểm chạm |
|---|---|---|---|---|---|
| 41 · 1 | Gom bằng chứng một năm | `{toi:335,bai:7}` | 335 tối ghi, 7 bài | Kho bằng chứng | Hành trình có vật chứng |
| 42 · 2 | Dựng dòng thời gian | `{toi:345}` | 345 tối có ghi | Dòng thời gian | Nhà đi từ đâu tới đâu |
| 43 · 3 | Ba chỗ ngoặt | `{toi:355,bai:8}` | 355 tối ghi, 8 bài | Ba chỗ xoay | Đâu là chỗ xoay |
| 44 · 4 | Kể cả chỗ hỏng | `{toi:360,chuoi:28}` | 360 tối ghi, chuỗi 28 | Kể thật | Câu chuyện tin được vì không tô hồng |
| 45 · 5 | Kể gọn tám phút | `{toi:363,bai:9}` | 363 tối ghi, 9 bài | Bản tám phút | Nhà nói được cốt lõi |
| 46 · 6 | Kể cho một nhà lạ | `{toi:365}` | 365 tối có ghi | Kể ngoài nhà | Câu chuyện đứng ngoài nhà mình |
| 47 · 7 | Nhận một nhà mới | `{toi:365,bai:9}` | 365 tối ghi, 9 bài | Vai dẫn | Mình bước sang vai dẫn |
| 48 · 8 | Kèm không làm hộ | `{toi:365,chuoi:28,bai:9}` | 365 tối ghi, chuỗi 28, 9 bài | Kèm đúng vai | Kèm khác làm hộ |
| 49 · 9 | Nhà mới tự đứng | `{toi:365,bai:10}` | 365 tối ghi, 10 bài | Nhà mới vững | Nhà mới giữ nhịp một tuần không có mình |
| 50 · 10 | Đà truyền tiếp (đổi vai) | `{toi:365,chuoi:30,bai:10}` | 365 tối ghi, chuỗi 30, 10 bài | Đổi vai sang thang người đi kèm | Trình bày được hành trình cho một nhà mới, có bằng chứng, không tô hồng; nhà mới bắt đầu kèm một nhà khác |

---

## PHẦN C · SÁU LUẬT CỦA LỚP (`BD_LUAT`)

| # | Luật | Vì sao |
|---|---|---|
| 1 | Mở bằng bằng chứng, không bằng nút bấm | Mọi cấp mở bằng số nhà tự ghi. Không có mốc nào mở bằng cách bấm. |
| 2 | Không nhảy cóc | Đạt điều kiện cấp trên mà chưa đạt cấp dưới thì vẫn đứng ở cấp dưới — mỗi bánh đà dựa lên bánh đà trước. |
| 3 | Một việc, không phải mười | Mỗi lúc chỉ gợi ý một việc nhỏ. Giao mười việc cho một nhà đang mệt là làm thừa. |
| 4 | Đo chỗ thiếu nhiều nhất | Phần trăm tới mốc đo trên chỉ số còn thiếu nhiều nhất, không lấy trung bình — trung bình là lời hứa sai. |
| 5 | Chưa có sổ thì nói thẳng là chưa | Nhà chưa ghi gì thì nói chưa có gì để đo, chỉ ra đúng một việc để bắt đầu. Không vẽ thanh tiến độ rỗng. |
| 6 | Không có tầng thứ sáu | Sau Tầng 5 là đổi vai sang thang người đi kèm, không phải lên bậc. Có một ngày hệ này xong việc. |

---

## PHẦN D · KHỐI JS DÁN ĐƯỢC

Chép vào `kho-goc/data.banh-da.js` (chỗ riêng, `.gitignore` đã chặn) và một tệp
mới `kho-goc/data.tang-cap.js`. Bộ máy `src/banh-da.js` đọc thẳng các biến `G.*`.

```js
/* ── kho-goc/data.banh-da.js ── 10 bánh đà × 10 việc nhỏ ── */
'use strict';
var G = window.G || {}; window.G = G;

var C1='#185AB4', C2='#5140B4', C3='#0B6675', C4='#0B7350', C5='#BE0E16';

G.BD_LON = [
  { so:1, ma:'BD1', tang:'T1', c:C1, ten:'Sổ tối ba dòng',
    vong:'Ghi ba dòng → Thấy số thật → Bớt cãi chuyện đã qua → Tối sau dễ ghi → Ghi',
    y:'Việc nhỏ nhất của cả hệ. Ghi được thì mọi con số về sau có gốc.',
    dau:'Ba tối liền sổ trống, hoặc chỉ người lớn ghi còn con đứng ngoài.',
    nho:[
      {ma:'BD1-1', ten:'Giờ ngồi vào bàn', viec:'Ghi giờ con ngồi vào bàn học tối nay', thay:'Giờ bắt đầu dao động bao nhiêu giữa các tối'},
      {ma:'BD1-2', ten:'Giờ rời bàn', viec:'Ghi giờ rời bàn', thay:'Buổi học thật sự dài bao lâu, không phải cảm giác'},
      {ma:'BD1-3', ten:'Số lần phải nhắc', viec:'Đếm số lần người lớn phải nhắc tối nay', thay:'Một con số thay cho câu "tối nay căng quá"'},
      {ma:'BD1-4', ten:'Một dòng không khí', viec:'Ghi một từ cho không khí tối nay', thay:'Tuần có mấy tối "được"'},
      {ma:'BD1-5', ten:'Đọc lại cuối tuần', viec:'Cả nhà đọc lại sổ bảy tối một lần', thay:'Tuần mình thật sự ra sao, không ai nhớ hộ'},
      {ma:'BD1-6', ten:'Ghi trước khi ngủ', viec:'Chốt sổ trong 10 phút trước giờ ngủ', thay:'Việc ghi thành phản xạ, không phải bài tập'},
      {ma:'BD1-7', ten:'Không bỏ tối nào', viec:'Tối mệt vẫn ghi một dòng', thay:'Chuỗi dài lên, đà bắt đầu tự quay'},
      {ma:'BD1-8', ten:'Ghi cả tối tốt', viec:'Ghi cả tối trôi chảy, không chỉ tối hỏng', thay:'Cái gì làm nên tối tốt để lặp lại'},
      {ma:'BD1-9', ten:'Con tự ghi một dòng', viec:'Để con tự viết một dòng của con', thay:'Con bắt đầu có tiếng nói trong sổ'},
      {ma:'BD1-10', ten:'Sổ thành thói quen', viec:'Ghi đủ 21 tối không ai nhắc', thay:'Sổ chạy mà không cần người giữ nhịp'}
    ]},
  { so:2, ma:'BD2', tang:'T1', c:C1, ten:'Bảng số chung của nhà',
    vong:'Gom số từ sổ → Cả nhà nhìn một bảng → Hết mỗi người một phiên bản → Tin bảng hơn trí nhớ → Gom tiếp',
    y:'Một bảng thay cho năm trí nhớ. Nhà thôi tranh "tuần rồi thế nào".',
    dau:'Bảng để một người giữ, cả nhà không mở; hoặc số nhập tay không khớp sổ.',
    nho:[
      {ma:'BD2-1', ten:'Dựng bảng 30 ô', viec:'Kẻ bảng 30 ngày, mỗi tối một ô', thay:'Cả tháng gọn trong một trang'},
      {ma:'BD2-2', ten:'Đổ số từ sổ', viec:'Mỗi tối tô ô theo sổ, không nhớ lại', thay:'Bảng khớp sổ, không khớp cảm giác'},
      {ma:'BD2-3', ten:'Ô trống để trống', viec:'Không tô bù ô đã bỏ', thay:'Tháng thật, cả chỗ hỏng'},
      {ma:'BD2-4', ten:'Dán chỗ cả nhà thấy', viec:'Treo bảng chỗ ai cũng đi qua', thay:'Bảng thành nền, không phải tài liệu'},
      {ma:'BD2-5', ten:'Nhìn bảng cuối tuần', viec:'Cả nhà đứng trước bảng 5 phút mỗi Chủ nhật', thay:'Xu hướng tuần, không phải một tối lẻ'},
      {ma:'BD2-6', ten:'Một câu có số', viec:'Nói một câu về tháng bằng con số trên bảng', thay:'Mình mô tả nhà bằng số, không bằng cảm xúc'},
      {ma:'BD2-7', ten:'Đạt 22/30', viec:'Giữ bảng đủ 22 tối có ghi trong 30 ngày', thay:'Mốc "đủ" đạt được mà không cần hoàn hảo'},
      {ma:'BD2-8', ten:'Con tô ô của con', viec:'Giao con tô phần ô của con', thay:'Con đọc được bảng của chính mình'},
      {ma:'BD2-9', ten:'So hai tháng', viec:'Đặt bảng tháng này cạnh tháng trước', thay:'Nhà đi lên hay đứng, bằng mắt'},
      {ma:'BD2-10', ten:'Bảng tự chạy', viec:'Một tháng bảng đầy mà không ai nhắc', thay:'Bảng tự sống'}
    ]},
  { so:3, ma:'BD3', tang:'T2', c:C2, ten:'Nhịp tuần giữ được',
    vong:'Đặt nhịp tuần → Chạy qua tuần thường → Chạy qua tuần có biến cố → Tin nhịp giữ được → Đặt nhịp sâu hơn',
    y:'Nhịp chỉ thật khi sống qua tuần hỏng. Đây là chỗ phân biệt nếp thật và nếp lúc rảnh.',
    dau:'Nhịp đổ ngay tuần đầu có việc đột xuất; hoặc chỉ chạy khi có người kèm.',
    nho:[
      {ma:'BD3-1', ten:'Chọn ba nếp tuần', viec:'Chọn đúng ba nếp cho tuần, không hơn', thay:'Tuần có xương sống, không ôm đồm'},
      {ma:'BD3-2', ten:'Giờ cố định', viec:'Gắn mỗi nếp vào một giờ cố định', thay:'Nếp bớt phụ thuộc hứng'},
      {ma:'BD3-3', ten:'Mức tối thiểu ngày mệt', viec:'Định nghĩa bản tối thiểu cho ngày mệt', thay:'Nếp không gãy vào ngày xấu'},
      {ma:'BD3-4', ten:'Buổi nhìn lại tuần', viec:'15 phút cuối tuần nhìn lại nhịp', thay:'Nhà tự chỉnh, không đợi Coach'},
      {ma:'BD3-5', ten:'Giữ qua tuần ốm', viec:'Chạy nhịp tối thiểu qua một tuần có người ốm', thay:'Nếp đứng cả khi trời xấu'},
      {ma:'BD3-6', ten:'Giữ qua tuần thi', viec:'Chạy nhịp qua tuần thi cử', thay:'Học không nuốt mất nếp nhà'},
      {ma:'BD3-7', ten:'Giữ qua tuần đi xa', viec:'Mang bản tối thiểu theo chuyến đi', thay:'Nếp không cần ở nhà mới chạy được'},
      {ma:'BD3-8', ten:'Ba trên bốn nếp', viec:'Giữ ≥3/4 nếp trong một tuần biến cố', thay:'Mốc nhịp đạt bằng số'},
      {ma:'BD3-9', ten:'Con giữ một nếp', viec:'Giao con làm chủ một nếp tuần', thay:'Con gánh một mảnh nhịp'},
      {ma:'BD3-10', ten:'Nhịp tự chạy', viec:'Bốn tuần nhịp giữ mà không ai nhắc', thay:'Nhịp thành nền'}
    ]},
  { so:4, ma:'BD4', tang:'T2', c:C2, ten:'Gọi tên mô thức lặp',
    vong:'Nhìn bảng → Thấy chỗ lặp → Gọi tên mô thức → Chạm đúng gốc → Bảng đổi, nhìn lại',
    y:'Biết "tối thứ Tư luôn căng" bằng một cái tên thì mới chạm được gốc, thay vì chữa triệu chứng.',
    dau:'Nhà chữa triệu chứng mãi — nhắc nhiều hơn, phạt nặng hơn — mà mô thức vẫn lặp.',
    nho:[
      {ma:'BD4-1', ten:'Khoanh tối hay hỏng', viec:'Khoanh trên bảng những tối lặp kiểu hỏng', thay:'Hỏng có quy luật, không ngẫu nhiên'},
      {ma:'BD4-2', ten:'Đặt tên mô thức', viec:'Đặt một cái tên nhà mình hiểu', thay:'Gọi được thì bàn được'},
      {ma:'BD4-3', ten:'Tìm mồi châm', viec:'Tìm cái châm ngòi trước mỗi lần lặp', thay:'Gốc nằm trước lúc bùng'},
      {ma:'BD4-4', ten:'Một câu có số', viec:'Nói mô thức bằng một câu có số, bằng lời người trong nhà', thay:'Mình hiểu nhà mình bằng dữ liệu'},
      {ma:'BD4-5', ten:'Thử một can thiệp', viec:'Đổi đúng một thứ ở mồi châm', thay:'Đổi gốc rẻ hơn chữa ngọn'},
      {ma:'BD4-6', ten:'Đo lại sau hai tuần', viec:'Nhìn bảng xem mô thức có thưa đi', thay:'Can thiệp có tác dụng hay không, bằng số'},
      {ma:'BD4-7', ten:'Bỏ can thiệp vô ích', viec:'Dẹp thứ không làm bảng đổi', thay:'Nhà thôi tốn sức vào việc không đổi gì'},
      {ma:'BD4-8', ten:'Gọi tên mô thức tốt', viec:'Đặt tên cả mô thức chạy tốt để giữ', thay:'Nhà biết cái gì nên lặp'},
      {ma:'BD4-9', ten:'Con gọi tên mô thức của con', viec:'Giúp con tự gọi tên một kiểu lặp của mình', thay:'Con có ngôn ngữ về chính mình'},
      {ma:'BD4-10', ten:'Sổ mô thức của nhà', viec:'Gom các mô thức đã gọi tên thành một trang', thay:'Nhà có bản đồ chính mình'}
    ]},
  { so:5, ma:'BD5', tang:'T3', c:C3, ten:'Chín vai có người giữ',
    vong:'Liệt kê chín vai → Nhận vai → Không ai quá bốn vai → Nhà tự chạy → Soát lại vai',
    y:'Nhà tự vận hành phần lớn khi vai có người giữ; Coach chỉ còn vào ở điểm nghẽn.',
    dau:'Một người gánh quá bốn vai; hoặc vai bỏ trống mà không ai nhận.',
    nho:[
      {ma:'BD5-1', ten:'Dựng bảng chín vai', viec:'Viết ra chín vai giữ nhà', thay:'Nhà cần gì để chạy'},
      {ma:'BD5-2', ten:'Gắn tên vào vai', viec:'Mỗi vai một cái tên thật', thay:'Chỗ trống và chỗ chồng'},
      {ma:'BD5-3', ten:'Không ai quá bốn', viec:'Chia lại để không ai giữ quá bốn vai', thay:'Chỗ vỡ sớm được chặn'},
      {ma:'BD5-4', ten:'Đạt 6/9 vai', viec:'Giữ ít nhất 6 trên 9 vai có người', thay:'Mốc vai đạt bằng số'},
      {ma:'BD5-5', ten:'Vai có bàn giao', viec:'Mỗi vai biết khi vắng thì ai đỡ', thay:'Nhà không gãy khi một người vắng'},
      {ma:'BD5-6', ten:'Con nhận một vai thật', viec:'Giao con một vai có trọng lượng', thay:'Con là người giữ, không phải người được nhắc'},
      {ma:'BD5-7', ten:'Coach lùi khỏi vai', viec:'Coach trả lại vai đang giữ hộ', thay:'Nhà chạy không cần người ngoài'},
      {ma:'BD5-8', ten:'Soát vai mỗi tháng', viec:'Nhìn lại bảng vai mỗi tháng', thay:'Vai theo kịp nhà đang đổi'},
      {ma:'BD5-9', ten:'Vai xoay được', viec:'Thử xoay một vai giữa các thành viên', thay:'Nhà không lệ thuộc một người'},
      {ma:'BD5-10', ten:'Chín vai tự đứng', viec:'Một tháng chín vai chạy mà Coach không vào', thay:'Nhà tự vận hành phần lớn'}
    ]},
  { so:6, ma:'BD6', tang:'T3', c:C3, ten:'Nghi lễ & nếp bền',
    vong:'Dựng nghi lễ → Lặp đủ lâu → Nếp thành mặc định → Giữ qua ngày mệt → Dựng nghi lễ sâu hơn',
    y:'Nghi lễ biến việc phải nhắc thành việc mặc định. Nếp đứng cả ngày mệt mới là nếp.',
    dau:'Nghi lễ thành hình thức, không ai thấy nghĩa; hoặc đổ ngay ngày đầu mệt.',
    nho:[
      {ma:'BD6-1', ten:'Nghi lễ mở ngày', viec:'Dựng một nghi lễ ngắn đầu ngày', thay:'Ngày có điểm khởi'},
      {ma:'BD6-2', ten:'Nghi lễ đóng ngày', viec:'Dựng một nghi lễ ngắn cuối ngày', thay:'Ngày có điểm chốt'},
      {ma:'BD6-3', ten:'Ngắn và thật', viec:'Giữ nghi lễ dưới năm phút', thay:'Nếp bền vì nhẹ'},
      {ma:'BD6-4', ten:'Gắn nghĩa', viec:'Nói rõ nghi lễ này để làm gì', thay:'Nhà làm vì hiểu, không vì lệ'},
      {ma:'BD6-5', ten:'Nếp qua ngày mệt', viec:'Giữ bản tối thiểu của nghi lễ ngày mệt', thay:'Nếp không cần ngày đẹp'},
      {ma:'BD6-6', ten:'Nghi lễ tuần', viec:'Dựng một nghi lễ cho cả tuần', thay:'Tuần có nhịp lớn'},
      {ma:'BD6-7', ten:'Con dẫn một nghi lễ', viec:'Giao con dẫn một nghi lễ', thay:'Con giữ nhịp cho nhà'},
      {ma:'BD6-8', ten:'Bỏ nghi lễ chết', viec:'Dẹp nghi lễ không còn nghĩa', thay:'Nhà không giữ lệ rỗng'},
      {ma:'BD6-9', ten:'Nghi lễ mốc', viec:'Dựng nghi lễ cho mốc hoàn thành', thay:'Nhà biết ăn mừng đúng chỗ'},
      {ma:'BD6-10', ten:'Nếp tự giữ', viec:'Một tuần biến cố mà nếp vẫn đứng ở mức tối thiểu', thay:'Nếp thật, không phải nếp lúc rảnh'}
    ]},
  { so:7, ma:'BD7', tang:'T4', c:C4, ten:'Động lực bên trong',
    vong:'Giảm thưởng–phạt → Mở chỗ con tự chọn → Con làm vì muốn → Kết quả bền hơn → Mở chỗ chọn lớn hơn',
    y:'Phần không mua được bằng kỷ luật. Con chuyển từ làm-vì-được-yêu-cầu sang làm-vì-muốn.',
    dau:'Con chỉ chạy khi có thưởng–phạt; bỏ thưởng là bỏ việc.',
    nho:[
      {ma:'BD7-1', ten:'Một việc con tự chọn', viec:'Để con chọn một việc không gắn thưởng', thay:'Con có vùng tự quyết'},
      {ma:'BD7-2', ten:'Hỏi "vì sao con muốn"', viec:'Hỏi lý do của con, không áp lý do của mình', thay:'Động lực của con, không phải của mình'},
      {ma:'BD7-3', ten:'Bớt một phần thưởng', viec:'Gỡ một phần thưởng nhỏ, giữ việc', thay:'Việc còn hay rụng khi bỏ thưởng'},
      {ma:'BD7-4', ten:'Khen quá trình', viec:'Khen cách làm thay vì kết quả', thay:'Con bám quá trình, không bám điểm'},
      {ma:'BD7-5', ten:'Để con vấp an toàn', viec:'Cho con chịu hệ quả nhỏ của lựa chọn', thay:'Con học từ hệ quả, không từ lời'},
      {ma:'BD7-6', ten:'Mục tiêu của con', viec:'Con tự đặt một mục tiêu của mình', thay:'Mục tiêu có chủ'},
      {ma:'BD7-7', ten:'Con bảo vệ mục tiêu', viec:'Con nói trước cả nhà vì sao chọn mục tiêu đó', thay:'Con đứng được sau lựa chọn'},
      {ma:'BD7-8', ten:'Giữ 30 ngày tự nguyện', viec:'Một việc con tự chọn giữ đủ 30 ngày', thay:'Động lực bên trong có độ bền'},
      {ma:'BD7-9', ten:'Con tự chỉnh khi lệch', viec:'Con tự sửa khi mục tiêu chệch', thay:'Con lái, không đợi lái hộ'},
      {ma:'BD7-10', ten:'Làm-vì-muốn thành mặc định', viec:'Phần lớn việc chạy không cần thưởng–phạt', thay:'Nhà qua được chỗ kỷ luật không mua được'}
    ]},
  { so:8, ma:'BD8', tang:'T4', c:C4, ten:'Người lớn đổi trước',
    vong:'Người lớn chọn một thói quen → Ghi như con ghi → Con thấy người lớn đổi thật → Nhà đổi cùng → Chọn thói quen sâu hơn',
    y:'Chặng của con không giữ nổi nếu người lớn không đổi gì. Đây là mục tiêu của cha mẹ.',
    dau:'Nhà đòi con đổi mà người lớn không có mục nào của mình; con thấy và dừng lại.',
    nho:[
      {ma:'BD8-1', ten:'Người lớn chọn một thói quen', viec:'Cha/mẹ chọn một thói quen của mình', thay:'Đổi bắt đầu từ người lớn'},
      {ma:'BD8-2', ten:'Ghi như con ghi', viec:'Người lớn ghi sổ đúng cách con vẫn ghi', thay:'Cùng một thước cho cả nhà'},
      {ma:'BD8-3', ten:'Công khai với nhà', viec:'Nói mục của mình trước cả nhà', thay:'Người lớn cũng chịu soi'},
      {ma:'BD8-4', ten:'Chịu nhắc như con', viec:'Người lớn nhận nhắc khi lỡ', thay:'Luật áp cho mọi người'},
      {ma:'BD8-5', ten:'Giữ 30 ngày có sổ', viec:'Giữ thói quen đủ 30 ngày, có sổ', thay:'Người lớn làm được điều đòi ở con'},
      {ma:'BD8-6', ten:'Kể cả lần hỏng', viec:'Ghi cả hôm trượt, không giấu', thay:'Thành thật là một phần của nếp'},
      {ma:'BD8-7', ten:'Con soi người lớn', viec:'Để con nhắc người lớn khi lỡ', thay:'Quyền soi hai chiều'},
      {ma:'BD8-8', ten:'Trình bày ở buổi nhìn lại', viec:'Người lớn trình bày thói quen ở buổi nhìn lại', thay:'Người lớn chịu trách nhiệm công khai'},
      {ma:'BD8-9', ten:'Thói quen thứ hai', viec:'Giữ thêm một thói quen thứ hai', thay:'Đổi lan ra'},
      {ma:'BD8-10', ten:'Người lớn là bằng chứng sống', viec:'Con làm vì thấy người lớn làm', thay:'Nhà đổi cùng, không chỉ con đổi'}
    ]},
  { so:9, ma:'BD9', tang:'T5', c:C5, ten:'Kể lại bằng bằng chứng',
    vong:'Gom bằng chứng → Dựng câu chuyện thật → Kể cho nhà mới → Thứ đã học đứng vững hơn → Gom tiếp chặng sau',
    y:'Dạy lại là chỗ thứ đã học đứng vững nhất. Kể có bằng chứng, không tô hồng.',
    dau:'Nhà kể bằng cảm xúc, không có số; hoặc giấu chỗ hỏng khi kể.',
    nho:[
      {ma:'BD9-1', ten:'Gom bằng chứng một năm', viec:'Gom sổ, bảng, mốc của một năm', thay:'Hành trình có vật chứng'},
      {ma:'BD9-2', ten:'Dựng dòng thời gian', viec:'Xếp mốc theo thời gian', thay:'Nhà đi từ đâu tới đâu'},
      {ma:'BD9-3', ten:'Chọn ba chỗ ngoặt', viec:'Chọn ba điểm đổi thật sự', thay:'Đâu là chỗ xoay'},
      {ma:'BD9-4', ten:'Kể cả chỗ hỏng', viec:'Để lại trong câu chuyện chỗ từng trượt', thay:'Câu chuyện tin được vì không tô hồng'},
      {ma:'BD9-5', ten:'Một câu có số mỗi chặng', viec:'Mỗi tầng một câu có số', thay:'Kể bằng dữ liệu, không bằng tính từ'},
      {ma:'BD9-6', ten:'Con kể phần của con', viec:'Con tự kể chặng của mình', thay:'Con là người kể, không phải nhân vật'},
      {ma:'BD9-7', ten:'Người lớn kể phần của mình', viec:'Người lớn kể thói quen đã đổi', thay:'Đổi hai chiều trong câu chuyện'},
      {ma:'BD9-8', ten:'Kể gọn tám phút', viec:'Rút câu chuyện còn tám phút', thay:'Nhà nói được cốt lõi'},
      {ma:'BD9-9', ten:'Kể cho một nhà lạ', viec:'Kể cho một nhà chưa quen', thay:'Câu chuyện đứng ngoài nhà mình'},
      {ma:'BD9-10', ten:'Câu chuyện bằng chứng khép', viec:'Trình bày đủ cho một nhà mới, có vật chứng', thay:'Thứ đã học đứng vững khi dạy lại'}
    ]},
  { so:10, ma:'BD10', tang:'T5', c:C5, ten:'Kèm một nhà mới',
    vong:'Nhận một nhà mới → Kèm bằng chính nếp mình → Nhà mới chạy được → Nhà mình vững thêm → Kèm nhà kế',
    y:'Nhà trở thành nơi nhà khác học được. Sau Tầng 5 là đổi vai sang thang người đi kèm, không phải lên bậc.',
    dau:'Nhà mình làm hộ nhà mới thay vì kèm; hoặc kèm xong nhà mới lại dựa mãi.',
    nho:[
      {ma:'BD10-1', ten:'Nhận một nhà', viec:'Nhận kèm đúng một nhà mới', thay:'Mình bước sang vai dẫn'},
      {ma:'BD10-2', ten:'Bắt đầu từ sổ tối', viec:'Dạy nhà mới ghi sổ ba dòng trước tiên', thay:'Nền phải dựng lại từ đầu'},
      {ma:'BD10-3', ten:'Không làm hộ', viec:'Để nhà mới tự ghi, mình chỉ soi', thay:'Kèm khác làm hộ'},
      {ma:'BD10-4', ten:'Chỉ vào điểm nghẽn', viec:'Chỉ can thiệp ở chỗ nghẽn của nhà mới', thay:'Mình giữ đúng vai Coach'},
      {ma:'BD10-5', ten:'Trao lại bảng số', viec:'Giúp nhà mới dựng bảng của họ', thay:'Nhà mới có thước riêng'},
      {ma:'BD10-6', ten:'Đặt mốc cho nhà mới', viec:'Cùng nhà mới đặt mốc đo được', thay:'Kèm có đích, không chung chung'},
      {ma:'BD10-7', ten:'Lùi dần', viec:'Giảm số lần mình vào theo tuần', thay:'Nhà mới tự đứng dần'},
      {ma:'BD10-8', ten:'Nhà mới giữ nhịp một mình', viec:'Nhà mới giữ nhịp một tuần không có mình', thay:'Kèm thành công bằng số'},
      {ma:'BD10-9', ten:'Nhà mới kể lại được', viec:'Nhà mới trình bày được hành trình của họ', thay:'Đà truyền sang nhà kế'},
      {ma:'BD10-10', ten:'Đà truyền tiếp', viec:'Nhà mới bắt đầu kèm một nhà khác', thay:'Máy không dừng ở nhà mình'}
    ]}
];

/* 10 cấp mở khoá bánh đà (mỗi cấp mở một bánh đà) */
G.BD_CAP = [
  {cap:1,  ten:'Tối đầu tiên',       c:C1, dk:{toi:1},                mocThat:'Ghi được 1 tối đủ ba dòng.',                               mo:'Mở bánh đà 1 — Sổ tối ba dòng.',       wow:'Nhà mình có dòng dữ liệu đầu tiên do chính mình tạo ra.'},
  {cap:2,  ten:'Bảy tối liền',       c:C1, dk:{toi:7,chuoi:7},        mocThat:'7 tối liền có ghi, chuỗi đủ 7 ngày.',                       mo:'Mở bánh đà 2 — Bảng số chung.',        wow:'Cả nhà đọc lại một tuần thật, không ai nhớ hộ ai.'},
  {cap:3,  ten:'Một bảng tháng',     c:C2, dk:{toi:22},               mocThat:'22 tối có ghi trong khoảng 30 ngày.',                      mo:'Mở bánh đà 3 — Nhịp tuần.',            wow:'Nhà nhìn một bảng thay vì năm phiên bản của tháng.'},
  {cap:4,  ten:'Gọi được tên',       c:C2, dk:{toi:30,bai:1},         mocThat:'30 tối có ghi và 1 bài đánh giá xong.',                    mo:'Mở bánh đà 4 — Gọi tên mô thức lặp.',  wow:'Nhà nói được vì sao tối thứ Tư luôn căng — bằng một cái tên.'},
  {cap:5,  ten:'Nhịp qua tuần hỏng', c:C3, dk:{toi:45,chuoi:14,bai:2},mocThat:'45 tối có ghi, một chuỗi 14 ngày, 2 bài đánh giá.',        mo:'Mở bánh đà 5 — Chín vai.',             wow:'Nếp còn đứng trong một tuần có biến cố.'},
  {cap:6,  ten:'Chín vai có người',  c:C3, dk:{toi:60,bai:3},         mocThat:'60 tối có ghi và 3 bài đánh giá.',                         mo:'Mở bánh đà 6 — Nghi lễ & nếp bền.',    wow:'Nhà tự chạy phần lớn; Coach chỉ vào điểm nghẽn.'},
  {cap:7,  ten:'Nhà tự vận hành',    c:C4, dk:{toi:90,chuoi:21,bai:4},mocThat:'90 tối có ghi, một chuỗi 21 ngày, 4 bài đánh giá.',        mo:'Mở bánh đà 7 — Động lực bên trong.',   wow:'Nếp giữ được cả tuần có việc đột xuất mà Coach không vào.'},
  {cap:8,  ten:'Con làm vì muốn',    c:C4, dk:{toi:150,bai:6},        mocThat:'150 tối có ghi và 6 bài đánh giá.',                        mo:'Mở bánh đà 8 — Người lớn đổi trước.',  wow:'Con tự chọn và tự bảo vệ một mục tiêu của mình.'},
  {cap:9,  ten:'Người lớn đổi thật', c:C5, dk:{toi:250,chuoi:28,bai:8},mocThat:'250 tối có ghi, một chuỗi 28 ngày, 8 bài đánh giá.',      mo:'Mở bánh đà 9 — Kể lại bằng bằng chứng.',wow:'Người lớn có ít nhất một thói quen đủ 30 ngày, trình bày được.'},
  {cap:10, ten:'Trao lại cho nhà sau',c:C5,dk:{toi:365,bai:10},       mocThat:'365 tối có ghi và 10 bài đánh giá.',                       mo:'Mở bánh đà 10 — Kèm một nhà mới.',     wow:'Nhà trình bày được hành trình cho một nhà mới, có bằng chứng, không tô hồng.'}
];

/* Ngã ba — học như chơi Cashflow */
G.BD_CHON = [
  {cap:2, khi:'Bỏ lỡ vài tối, muốn tô bù cho bảng đẹp', deChon:'Tô bù ô trống để chuỗi liền', nenChon:'Để trống ô đã bỏ, ghi tiếp từ hôm nay', ai:'Coach', giaNgay:14, viSao:'Bảng tô bù là bảng dối; nhà mất cái gốc để đo, và mọi quyết định sau dựng trên số giả.'},
  {cap:4, khi:'Mô thức lặp làm nhà mệt, muốn phạt nặng hơn cho xong', deChon:'Tăng hình phạt để chặn hành vi', nenChon:'Tìm mồi châm và đổi một thứ ở gốc', ai:'Coach', giaNgay:30, viSao:'Phạt nặng chặn ngọn vài hôm rồi lặp lại; đổi gốc chậm hơn nhưng mô thức thưa hẳn.'},
  {cap:6, khi:'Nhà chạy tốt khi Coach kèm, muốn giữ Coach vào thường', deChon:'Giữ Coach giữ nhịp hộ cho chắc', nenChon:'Coach lùi, nhà nhận lại vai', ai:'Coach', giaNgay:45, viSao:'Nhịp giữ hộ sập ngay khi người ấy nghỉ; nhà chỉ vững khi tự giữ vai.'},
  {cap:8, khi:'Muốn con đổi nhanh, định thêm thưởng lớn', deChon:'Treo thưởng lớn cho mục tiêu', nenChon:'Mở chỗ con tự chọn, bớt thưởng', ai:'Coach', giaNgay:60, viSao:'Thưởng lớn mua được hành vi ngắn hạn nhưng giết động lực bên trong; bỏ thưởng là bỏ việc.'}
];

/* Sáu luật của lớp */
G.BD_LUAT = [
  {no:1, t:'Mở bằng bằng chứng, không bằng nút bấm', y:'Mọi cấp mở bằng số nhà tự ghi. Không có mốc nào mở bằng cách bấm.'},
  {no:2, t:'Không nhảy cóc', y:'Đạt điều kiện cấp trên mà chưa đạt cấp dưới thì vẫn đứng ở cấp dưới — mỗi bánh đà dựa lên bánh đà trước.'},
  {no:3, t:'Một việc, không phải mười', y:'Mỗi lúc chỉ gợi ý một việc nhỏ. Giao mười việc cho một nhà đang mệt là làm thừa.'},
  {no:4, t:'Đo chỗ thiếu nhiều nhất', y:'Phần trăm tới mốc đo trên chỉ số còn thiếu nhiều nhất, không lấy trung bình — trung bình là lời hứa sai.'},
  {no:5, t:'Chưa có sổ thì nói thẳng là chưa', y:'Nhà chưa ghi gì thì nói chưa có gì để đo, chỉ ra đúng một việc để bắt đầu. Không vẽ thanh tiến độ rỗng.'},
  {no:6, t:'Không có tầng thứ sáu', y:'Sau Tầng 5 là đổi vai sang thang người đi kèm, không phải lên bậc. Có một ngày hệ này xong việc.'}
];

/* Lời dẫn đầu màn */
G.BD_DAN = {
  tieuDe:'Việc trước đẻ ra sức cho việc sau',
  dan:[
    'Một danh sách việc thì làm xong là hết. Một bánh đà thì tới một điểm nó tự quay.',
    'Mọi mốc dưới đây mở bằng chính thứ nhà mình đã ghi — không có mốc nào mở bằng cách bấm nút.'
  ]
};
```

```js
/* ── kho-goc/data.tang-cap.js ── 5 tầng × 10 cấp = 50 cấp ── */
'use strict';
var G = window.G || {}; window.G = G;

G.TANG = [
  {no:1, ma:'T1', ten:'NHẬN DIỆN', dongHanh:'Nền',        cauHoi:'Đang có vấn đề gì?',                         ngay:7,   c:'#185AB4'},
  {no:2, ma:'T2', ten:'GIẢI MÃ',   dongHanh:'Nhịp',       cauHoi:'Vì sao vấn đề xảy ra?',                      ngay:21,  c:'#5140B4'},
  {no:3, ma:'T3', ten:'KIẾN TẠO',  dongHanh:'Hệ thống',   cauHoi:'Cần làm gì và làm thế nào?',                 ngay:90,  c:'#0B6675'},
  {no:4, ma:'T4', ten:'CHUYỂN HÓA',dongHanh:'Chiều sâu',  cauHoi:'Làm sao duy trì thay đổi thành năng lực?',   ngay:365, c:'#0B7350'},
  {no:5, ma:'T5', ten:'BỨT PHÁ',   dongHanh:'Trao quyền', cauHoi:'Gia đình có thể phát triển tới đâu?',        ngay:365, c:'#BE0E16'}
];

/* 50 cấp: tang (mã tầng) · cap (1..10 trong tầng) · capGlobal (1..50) */
G.TANG_CAP = [
  /* T1 · NỀN */
  {tang:'T1', cap:1,  capGlobal:1,  ten:'Tối đầu tiên',           dk:{toi:1},             mocThat:'Ghi 1 tối đủ ba dòng.',             mo:'Sổ tối',        wow:'Dòng dữ liệu đầu tiên do chính nhà tạo ra.'},
  {tang:'T1', cap:2,  capGlobal:2,  ten:'Ba tối',                 dk:{toi:3},             mocThat:'3 tối có ghi.',                     mo:'Nếp ghi',       wow:'Thấy ghi được ba tối là làm được.'},
  {tang:'T1', cap:3,  capGlobal:3,  ten:'Một tuần',               dk:{toi:7},             mocThat:'7 tối có ghi.',                     mo:'Tuần đầu',      wow:'Một tuần có vật chứng.'},
  {tang:'T1', cap:4,  capGlobal:4,  ten:'Đọc lại tuần',           dk:{toi:7,chuoi:5},     mocThat:'7 tối ghi, chuỗi 5 ngày.',          mo:'Buổi đọc lại',  wow:'Cả nhà đọc lại một tuần thật.'},
  {tang:'T1', cap:5,  capGlobal:5,  ten:'Bảy tối liền',           dk:{toi:7,chuoi:7},     mocThat:'Chuỗi 7 ngày liền, 7 tối có ghi.',  mo:'Mốc nền đầu',   wow:'Nhà thôi cãi nhau về chuyện đã xảy ra.'},
  {tang:'T1', cap:6,  capGlobal:6,  ten:'Bảng số dựng',           dk:{toi:10},            mocThat:'10 tối có ghi.',                    mo:'Bảng số chung', wow:'Tháng gọn trong một trang.'},
  {tang:'T1', cap:7,  capGlobal:7,  ten:'Hai tuần có ghi',        dk:{toi:14},            mocThat:'14 tối có ghi.',                    mo:'Bảng tô đều',   wow:'Xu hướng bắt đầu hiện.'},
  {tang:'T1', cap:8,  capGlobal:8,  ten:'Cả nhà cùng nhìn',       dk:{toi:16,chuoi:7},    mocThat:'16 tối ghi, chuỗi 7.',              mo:'Bảng dán tường',wow:'Cả nhà nhìn một bảng, không năm phiên bản.'},
  {tang:'T1', cap:9,  capGlobal:9,  ten:'Ba tuần có ghi',         dk:{toi:18},            mocThat:'18 tối có ghi.',                    mo:'Bảng tháng',    wow:'Nền gần đủ.'},
  {tang:'T1', cap:10, capGlobal:10, ten:'Nền đứng',               dk:{toi:22,chuoi:7},    mocThat:'22 tối ghi trong 30 ngày, chuỗi 7.',mo:'Qua Tầng 1',    wow:'Bảy tối liền có nhật ký đủ ba dòng, cả nhà đọc lại một lần.'},
  /* T2 · NHỊP */
  {tang:'T2', cap:1,  capGlobal:11, ten:'Ba nếp tuần',            dk:{toi:26},            mocThat:'26 tối có ghi.',                    mo:'Nhịp tuần',     wow:'Tuần có xương sống.'},
  {tang:'T2', cap:2,  capGlobal:12, ten:'Nhịp giờ cố định',       dk:{toi:30},            mocThat:'30 tối có ghi.',                    mo:'Giờ cố định',   wow:'Nếp bớt phụ thuộc hứng.'},
  {tang:'T2', cap:3,  capGlobal:13, ten:'Bản tối thiểu ngày mệt', dk:{toi:34,bai:1},      mocThat:'34 tối ghi, 1 bài đánh giá.',       mo:'Bản ngày mệt',  wow:'Nếp không gãy vào ngày xấu.'},
  {tang:'T2', cap:4,  capGlobal:14, ten:'Buổi nhìn lại tuần',     dk:{toi:38},            mocThat:'38 tối có ghi.',                    mo:'Buổi nhìn lại', wow:'Nhà tự chỉnh, không đợi Coach.'},
  {tang:'T2', cap:5,  capGlobal:15, ten:'Nhịp qua tuần ốm',       dk:{toi:42,chuoi:10},   mocThat:'42 tối ghi, chuỗi 10.',             mo:'Nhịp chịu biến',wow:'Nếp đứng cả khi trời xấu.'},
  {tang:'T2', cap:6,  capGlobal:16, ten:'Khoanh chỗ hay hỏng',    dk:{toi:46,bai:1},      mocThat:'46 tối ghi, 1 bài.',                mo:'Soi mô thức',   wow:'Hỏng có quy luật, không ngẫu nhiên.'},
  {tang:'T2', cap:7,  capGlobal:17, ten:'Gọi tên mô thức',        dk:{toi:50},            mocThat:'50 tối có ghi.',                    mo:'Gọi tên lặp',   wow:'Gọi được thì bàn được.'},
  {tang:'T2', cap:8,  capGlobal:18, ten:'Tìm mồi châm',           dk:{toi:55,bai:2},      mocThat:'55 tối ghi, 2 bài.',                mo:'Chạm gốc',      wow:'Gốc nằm trước lúc bùng.'},
  {tang:'T2', cap:9,  capGlobal:19, ten:'Một can thiệp gốc',      dk:{toi:60},            mocThat:'60 tối có ghi.',                    mo:'Thử can thiệp', wow:'Đổi gốc rẻ hơn chữa ngọn.'},
  {tang:'T2', cap:10, capGlobal:20, ten:'Nhịp & tên đứng vững',   dk:{toi:67,chuoi:14,bai:2}, mocThat:'67 tối ghi, chuỗi 14, 2 bài.',  mo:'Qua Tầng 2',    wow:'Nói được một câu có số về chỗ nhà hay hỏng, bằng lời người trong nhà.'},
  /* T3 · HỆ THỐNG */
  {tang:'T3', cap:1,  capGlobal:21, ten:'Bảng chín vai',          dk:{toi:75},            mocThat:'75 tối có ghi.',                    mo:'Chín vai',      wow:'Nhà cần gì để chạy.'},
  {tang:'T3', cap:2,  capGlobal:22, ten:'Gắn tên vào vai',        dk:{toi:82,bai:3},      mocThat:'82 tối ghi, 3 bài.',                mo:'Vai có chủ',    wow:'Chỗ trống và chỗ chồng.'},
  {tang:'T3', cap:3,  capGlobal:23, ten:'Không ai quá bốn vai',   dk:{toi:90},            mocThat:'90 tối có ghi.',                    mo:'Chặn quá tải',  wow:'Chỗ vỡ sớm được chặn.'},
  {tang:'T3', cap:4,  capGlobal:24, ten:'Sáu trên chín vai',      dk:{toi:100,chuoi:14},  mocThat:'100 tối ghi, chuỗi 14.',            mo:'Mốc vai',       wow:'Từ 6/9 vai có người, không ai quá 4.'},
  {tang:'T3', cap:5,  capGlobal:25, ten:'Nghi lễ mở/đóng ngày',   dk:{toi:110},           mocThat:'110 tối có ghi.',                   mo:'Nghi lễ ngày',  wow:'Ngày có điểm khởi và điểm chốt.'},
  {tang:'T3', cap:6,  capGlobal:26, ten:'Nếp qua ngày mệt',       dk:{toi:120,bai:3},     mocThat:'120 tối ghi, 3 bài.',               mo:'Nếp bền',       wow:'Nếp không cần ngày đẹp.'},
  {tang:'T3', cap:7,  capGlobal:27, ten:'Vai có bàn giao',        dk:{toi:130},           mocThat:'130 tối có ghi.',                   mo:'Bàn giao vai',  wow:'Nhà không gãy khi một người vắng.'},
  {tang:'T3', cap:8,  capGlobal:28, ten:'Coach lùi khỏi vai',     dk:{toi:140,chuoi:18},  mocThat:'140 tối ghi, chuỗi 18.',            mo:'Coach lùi',     wow:'Nhà chạy không cần người ngoài giữ nhịp hộ.'},
  {tang:'T3', cap:9,  capGlobal:29, ten:'Soát vai hàng tháng',    dk:{toi:150,bai:4},     mocThat:'150 tối ghi, 4 bài.',               mo:'Soát định kỳ',  wow:'Vai theo kịp nhà đang đổi.'},
  {tang:'T3', cap:10, capGlobal:30, ten:'Hệ thống tự chạy',       dk:{toi:165,chuoi:21,bai:4}, mocThat:'165 tối ghi, chuỗi 21, 4 bài.', mo:'Qua Tầng 3',    wow:'Nếp còn giữ được trong một tuần có biến cố, ở mức tối thiểu của ngày mệt.'},
  /* T4 · CHIỀU SÂU */
  {tang:'T4', cap:1,  capGlobal:31, ten:'Việc con tự chọn',       dk:{toi:180},           mocThat:'180 tối có ghi.',                   mo:'Vùng tự quyết', wow:'Con có vùng tự quyết.'},
  {tang:'T4', cap:2,  capGlobal:32, ten:'Khen quá trình',         dk:{toi:195,bai:5},     mocThat:'195 tối ghi, 5 bài.',               mo:'Khen cách làm', wow:'Con bám quá trình, không bám điểm.'},
  {tang:'T4', cap:3,  capGlobal:33, ten:'Bớt một phần thưởng',    dk:{toi:210},           mocThat:'210 tối có ghi.',                   mo:'Gỡ thưởng',     wow:'Việc còn hay rụng khi bỏ thưởng.'},
  {tang:'T4', cap:4,  capGlobal:34, ten:'Mục tiêu của con',       dk:{toi:225,chuoi:21},  mocThat:'225 tối ghi, chuỗi 21.',            mo:'Mục tiêu có chủ',wow:'Mục tiêu có chủ.'},
  {tang:'T4', cap:5,  capGlobal:35, ten:'Con bảo vệ mục tiêu',    dk:{toi:240},           mocThat:'240 tối có ghi.',                   mo:'Tự bảo vệ',     wow:'Con tự chọn và tự bảo vệ một mục tiêu trước cả nhà.'},
  {tang:'T4', cap:6,  capGlobal:36, ten:'Người lớn chọn thói quen',dk:{toi:255,bai:6},    mocThat:'255 tối ghi, 6 bài.',               mo:'Người lớn vào cuộc',wow:'Đổi bắt đầu từ người lớn.'},
  {tang:'T4', cap:7,  capGlobal:37, ten:'Người lớn ghi như con',  dk:{toi:270},           mocThat:'270 tối có ghi.',                   mo:'Cùng một thước',wow:'Cùng một thước cho cả nhà.'},
  {tang:'T4', cap:8,  capGlobal:38, ten:'Giữ 30 ngày tự nguyện',  dk:{toi:285,chuoi:28},  mocThat:'285 tối ghi, chuỗi 28.',            mo:'Độ bền động lực',wow:'Một việc con tự chọn giữ đủ 30 ngày.'},
  {tang:'T4', cap:9,  capGlobal:39, ten:'Con tự chỉnh khi lệch',  dk:{toi:300,bai:6},     mocThat:'300 tối ghi, 6 bài.',               mo:'Con tự lái',    wow:'Con lái, không đợi lái hộ.'},
  {tang:'T4', cap:10, capGlobal:40, ten:'Làm-vì-muốn thành mặc định',dk:{toi:320,chuoi:28,bai:6}, mocThat:'320 tối ghi, chuỗi 28, 6 bài.',mo:'Qua Tầng 4', wow:'Đứa trẻ chuyển từ làm-vì-được-yêu-cầu sang làm-vì-muốn; người lớn có một thói quen đủ 30 ngày.'},
  /* T5 · TRAO QUYỀN */
  {tang:'T5', cap:1,  capGlobal:41, ten:'Gom bằng chứng một năm', dk:{toi:335,bai:7},     mocThat:'335 tối ghi, 7 bài.',               mo:'Kho bằng chứng',wow:'Hành trình có vật chứng.'},
  {tang:'T5', cap:2,  capGlobal:42, ten:'Dựng dòng thời gian',    dk:{toi:345},           mocThat:'345 tối có ghi.',                   mo:'Dòng thời gian',wow:'Nhà đi từ đâu tới đâu.'},
  {tang:'T5', cap:3,  capGlobal:43, ten:'Ba chỗ ngoặt',           dk:{toi:355,bai:8},     mocThat:'355 tối ghi, 8 bài.',               mo:'Ba chỗ xoay',   wow:'Đâu là chỗ xoay.'},
  {tang:'T5', cap:4,  capGlobal:44, ten:'Kể cả chỗ hỏng',         dk:{toi:360,chuoi:28},  mocThat:'360 tối ghi, chuỗi 28.',            mo:'Kể thật',       wow:'Câu chuyện tin được vì không tô hồng.'},
  {tang:'T5', cap:5,  capGlobal:45, ten:'Kể gọn tám phút',        dk:{toi:363,bai:9},     mocThat:'363 tối ghi, 9 bài.',               mo:'Bản tám phút',  wow:'Nhà nói được cốt lõi.'},
  {tang:'T5', cap:6,  capGlobal:46, ten:'Kể cho một nhà lạ',      dk:{toi:365},           mocThat:'365 tối có ghi.',                   mo:'Kể ngoài nhà',  wow:'Câu chuyện đứng ngoài nhà mình.'},
  {tang:'T5', cap:7,  capGlobal:47, ten:'Nhận một nhà mới',       dk:{toi:365,bai:9},     mocThat:'365 tối ghi, 9 bài.',               mo:'Vai dẫn',       wow:'Mình bước sang vai dẫn.'},
  {tang:'T5', cap:8,  capGlobal:48, ten:'Kèm không làm hộ',       dk:{toi:365,chuoi:28,bai:9}, mocThat:'365 tối ghi, chuỗi 28, 9 bài.', mo:'Kèm đúng vai',  wow:'Kèm khác làm hộ.'},
  {tang:'T5', cap:9,  capGlobal:49, ten:'Nhà mới tự đứng',        dk:{toi:365,bai:10},    mocThat:'365 tối ghi, 10 bài.',              mo:'Nhà mới vững',  wow:'Nhà mới giữ nhịp một tuần không có mình.'},
  {tang:'T5', cap:10, capGlobal:50, ten:'Đà truyền tiếp (đổi vai)',dk:{toi:365,chuoi:30,bai:10}, mocThat:'365 tối ghi, chuỗi 30, 10 bài.',mo:'Đổi vai sang thang người đi kèm', wow:'Trình bày được hành trình cho một nhà mới, có bằng chứng; nhà mới bắt đầu kèm một nhà khác.'}
];
```

---

## PHẦN E · GHI CHÚ KHI LẬP TRÌNH

1. **Hai thang khác nhau, cùng sống được.** `BD_CAP` (10 cấp) là thang **mở khoá
   bánh đà** — bộ máy `src/banh-da.js` đã dùng. `TANG_CAP` (50 cấp) là thang
   **thăng tiến chi tiết** trong từng tầng. Có thể chiếu `TANG_CAP → BD_CAP` bằng
   mốc cuối mỗi tầng (cấp 10 của T1 ≈ nền xong ≈ mở BĐ2), nhưng hai thang không
   bắt buộc trùng số.
2. **Giữ đúng ràng buộc bộ kiểm.** Mỗi `BD_LON[].nho` đúng 10 phần tử; mọi `nho[].ma`
   duy nhất; `vong` có ≥3 mũi tên; `BD_CAP[].cap` liên tục 1…10; mỗi `mocThat`
   chứa đủ con số trong `dk`. `src/banh-da.js` có `bdSoiCauTruc()`, `bdSoiLoiHua()`
   đo đúng các điểm này — chạy phát hành là biết lệch chỗ nào.
3. **Màu theo tầng:** T1 `#185AB4` · T2 `#5140B4` · T3 `#0B6675` · T4 `#0B7350` ·
   T5 `#BE0E16` (lấy từ `src/data.core.js`).
4. **Số trong `dk` là bản calib gợi ý** — chỉnh theo dữ liệu thật của Học viện.
   Giữ tính đơn điệu (cấp sau ≥ cấp trước) để thang không "tụt".
5. **Đặt tệp dữ liệu ở `kho-goc/`** (đã bị `.gitignore` chặn) để nội dung chuyên
   môn không lọt vào kho mã, đúng chuẩn bảo vệ tài sản của dự án. Tệp này
   (`docs/BANH-DA-VA-TANG-CAP.md`) là **bản tổng hợp để tra và lập trình**, không
   phải kho chạy.
