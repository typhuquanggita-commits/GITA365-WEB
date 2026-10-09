# Xưởng tài liệu gia đình

Ngày 9/10/2026. Theo yêu cầu chủ hệ: tích hợp năng lực của
[ainovel-cli](https://github.com/kentjuno/ainovel-cli) (Apache-2.0) để tạo kho
tài liệu cho các gia đình.

## Vì sao không chép mã của ainovel-cli

ainovel-cli là chương trình Go chạy trong cửa sổ dòng lệnh, cần Docker hoặc Go,
và tự gọi các nhà cung cấp AI bằng khoá đặt trong tệp cấu hình. Nó không chạy
được trong Cloudflare Worker, chủ hệ không dùng dòng lệnh, và nó không đi qua
cổng Điều 13 của GITA. Nên GITA dựng lại **tinh tuý** của nó bằng JS, trên đúng
đường AI có sẵn. Không một dòng mã của ainovel-cli được chép vào kho này.

| ainovel-cli | GITA (`may-chu/xuong-tai-lieu.js`) |
|---|---|
| Architect — tiền đề, dàn ý, nhân vật, luật thế giới | Kiến trúc sư — dàn ý từng chương + **sổ nhất quán** |
| Writer — viết từng chương | Người viết — một chương mỗi lượt, đọc dàn ý + sổ nhất quán + tóm tắt chương trước |
| Nén ngữ cảnh 4 cấp | Chương trước chỉ đi tiếp bằng tiêu đề + câu mở |
| Editor — AI chấm 7 chiều | Biên tập bằng **máy đo**: tên riêng, độ dài, câu rỗng, giọng máy, lời phán, tự xưng chuyên gia, câu dài |
| Arbiter — viết lại hay đi tiếp | Cổng cứng không qua thì viết lại kèm lời góp ý, tối đa 2 lần, rồi dừng chờ người |
| Checkpoint từng bước | Mỗi lượt đúng một bước, trạng thái ghi D1 |
| Chiều "móc câu giữ chân" | Đổi thành "việc nhà mình làm được" — GITA không giữ chân (L08) |
| Xuất EPUB | Đóng gói thành bản nháp chờ **ba chữ ký** |

## Dùng thế nào

Màn **Vòng tự hoàn thiện → ngăn Xưởng tài liệu** (R01–R04): gõ chủ đề, chọn người
đọc, tầng, số chương, để nguyên ô "Tự chạy" rồi bấm **Đặt đề án**. Bộ não vận
hành đi tiếp một bước mỗi lượt làm việc. Xong thì bản nháp hiện ở ngăn **Bản
nháp chờ duyệt**: Bộ phận sản phẩm → Giám đốc → Super Admin ký, Super Admin nhập
kho. Người soạn được ghi là chính xưởng (`xuong-tai-lieu`), nên người bấm nút vẫn
ký được cấp của mình.

## Giới hạn, nói thẳng

- Chế độ tiết kiệm đang bật nên chỉ có Workers AI miễn phí (mô hình 8B). Văn bản
  đọc được nhưng chưa sâu; ba người ký là lớp chất lượng thật.
- Trần tải mặc định 50% hạn mức token mỗi ngày → khoảng 2–3 tài liệu 5 chương
  mỗi ngày. Mỗi đề án có trần `3 + số chương × 3` lượt AI.
- Máy đo không biết nội dung có đúng chuyên môn không — đó là việc của người ký.
- Tài liệu đã nhập kho đọc được qua cửa `traBoSung`; hiện chưa có màn nào của
  gia đình hiển thị nó. Chọn cách đưa tới gia đình (mở theo tầng, hay Tư vấn gửi
  từng nhà theo luật KPI 80%) là quyết định sư phạm của chủ hệ.
