# Nguồn ngoài — học gì từ public-apis, dùng gì, không dùng gì

Ngày 9/10/2026. Theo yêu cầu chủ hệ: nghiên cứu tinh tuý của
[public-apis](https://github.com/public-apis/public-apis) để nâng GITA365.

## Tinh tuý của public-apis không phải là số lượng API

Kho ấy có hơn một nghìn API miễn phí. Thứ giữ nó dùng được suốt nhiều năm
là **khuôn một dòng**: mỗi API khai đúng năm cột — việc gì · xác thực bằng
gì · có HTTPS không · có CORS không · đường dẫn — và **một bộ kiểm tự động
từ chối mọi dòng khai thiếu hoặc sai**. Danh sách không ai kiểm thì sáu
tháng sau nói sai mà vẫn trông đầy đủ.

GITA365 mượn đúng khuôn ấy, và hỏi thêm câu public-apis không hỏi: **gửi ra
ngoài thứ gì về người** — câu của Điều 13 và Luật 91/2025.

## Ba thứ đã dựng

| Thứ | Ở đâu | Làm gì |
|---|---|---|
| Sổ máy chủ ngoài | `may-chu/nguon-ngoai.js` | 12 máy chủ + 3 đích cấu hình, mỗi dòng khai việc · xác thực · gửi gì về người · cổng an toàn · tệp gọi |
| Bộ kiểm hai đầu | `tools/thu-nguon-ngoai.mjs` (chạy ở CI) | Mã gọi máy chủ chưa khai → đỏ · dòng khai mà mã không còn gọi → đỏ · khai "ẩn danh" mà tệp không qua cổng → đỏ · chuỗi `http://` → đỏ. Bốn phép phá thử chạy ngay trong bộ kiểm |
| Soát mật khẩu đã lộ | `mkDaLo` ở `may-chu/nen.js` | Mọi cửa đặt mật khẩu mới (kích hoạt, đổi, lấy lại, quản trị đặt lại, cứu hệ, Super Admin đầu tiên) từ chối mật khẩu đã nằm trong các vụ rò rỉ |

### Vì sao soát mật khẩu đã lộ là thứ đáng lấy nhất

Đó là API duy nhất trong danh mục vừa **tăng bảo mật thật**, vừa **miễn
phí, không khoá**, vừa **không gửi dữ liệu người ra ngoài**:

- Băm SHA-1, gửi **đúng 5 ký tự đầu**. Năm ký tự ấy khớp hàng trăm mật khẩu
  khác nhau; dịch vụ trả cả danh sách, máy chủ Học viện tự so ở nhà.
- Có xin **đệm** (`Add-Padding`) để độ dài phản hồi không lộ gì.
- Dịch vụ sập hay chậm quá 2,5 giây thì **cửa vẫn mở** — một bên thứ ba
  không được khoá cửa vào của Học viện. Luật mật khẩu tại chỗ vẫn chạy.
- Tắt bằng `GITA_KIEM_MK_RO = "0"` trong `may-chu/wrangler.toml`.

Và đã vá một chỗ hở tìm ra khi rà: cửa **tạo Super Admin đầu tiên** chỉ đòi
8 ký tự, trong khi mọi cửa khác đòi luật đầy đủ. Cửa quyền cao nhất lại có
luật lỏng nhất. Nay cùng một luật. (Cửa này đã đóng vĩnh viễn trên máy chủ
thật vì đã có quản trị — vá để nó đúng nếu dựng lại máy chủ.)

## Đã xem, KHÔNG dùng — và vì sao

| Nhóm API trong danh mục | Kết luận | Lý do |
|---|---|---|
| Đo lường web (Google Analytics, Plausible…) | Không | Đưa hành vi từng phụ huynh cho bên thứ ba. GITA đã tự đo ở Worker riêng (`do-trang.js`), chỉ đếm, không nhận ra ai |
| Tra địa chỉ IP / định vị | Không | Địa chỉ IP là dữ liệu nhận dạng; gửi nó ra ngoài là xử lý dữ liệu xuyên biên giới |
| Xác minh email / số điện thoại | Không | Phải gửi đúng email/số của khách ra ngoài. Hệ đã xác minh bằng mã OTP tự gửi |
| Dịch máy, nhận dạng giọng, ảnh | Không thêm | Nội dung gia đình đi ra ngoài; các đường AI hiện có đều phải qua `soatRaNhaCungCap` |
| Ngày lễ Việt Nam (Nager.Date) | Chưa | Miễn phí, không gửi gì về người — nhưng chưa có màn nào cần. Thêm một nguồn ngoài không ai dùng là thêm một chỗ có thể hỏng |
| Rút gọn đường dẫn, mã QR trực tuyến | Không | Đường dẫn kích hoạt mang mã bí mật; QR đã tự sinh tại chỗ |
| Thời tiết, tỷ giá, tin tức | Không | Không phục vụ việc của Học viện |

## Luật cho lần sau

Thêm một máy chủ ngoài vào mã máy chủ thì **phải thêm một dòng vào
`may-chu/nguon-ngoai.js`**, khai rõ gửi gì về người. Không khai thì CI đỏ và
không triển khai được. Đó chính là luật của public-apis: một dòng không đủ
cột thì không vào danh sách.
