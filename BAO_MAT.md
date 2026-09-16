# GITA 365 · BẢO MẬT & TOÀN VẸN DỮ LIỆU

Biên bản rà soát bản **v7.0** — bản đọc được trong app nằm ở
**Nhóm 05 → Rà soát hệ thống**. Tài liệu này là phần dành cho người triển khai.

---

## 1. Đã rà những gì

| Nhóm | Số điểm | Kết quả |
|---|---|---|
| Bảo mật | 5 | 1 lỗi nghiêm trọng **đã vá** · 2 điểm **cần máy chủ** |
| Lập trình | 4 | 2 lỗi **đã vá** · 2 điểm còn hở |
| Liên kết dữ liệu | 4 | khớp 100% · 1 điểm chờ chủ hệ thống |
| Hồ sơ & khách hàng | 3 | 2 điểm còn hở |
| Tài chính | 3 | 1 điểm còn hở |
| Thương hiệu | 3 | 1 điểm còn hở |

## 2. Lỗi thật đã vá trong bản này

**① Truy cập vượt quyền vào bốn màn hình kho báu vật** — *nghiêm trọng*
Bốn màn hình (`phac-do`, `kich-ban`, `mo-thuc`, `cong-nghiem-thu`) chỉ bị ẩn ở
thanh điều hướng nhưng vẫn dựng nội dung khi vào thẳng bằng trạng thái đã lưu
trong `localStorage`.
→ Đã thêm **chốt quyền tập trung** ở lớp `render()` cho mọi màn hình
(`G.allowed()`), **cộng thêm chốt riêng trong từng hàm màn hình**. Phép thử
truy cập trực tiếp bằng vai Học viên (R14) nay trả về màn hình khoá ở cả 13
màn hình nhạy cảm.

**② Biểu tượng hiển thị sai kích thước** — *nhẹ* · đã bổ sung định nghĩa kích
thước vào `assets/style.css`.

**③ Tên trường dữ liệu lệch ở màn Hành trình của con** — *trung bình* · đã đổi
sang đúng bộ trường của `chan_dung.json` và bổ sung phần quyền điều hành,
mức hỗ trợ.

**④ Thanh phải che nội dung trên điện thoại** — *nhẹ* · thanh phải nay đóng sẵn
dưới 1180px và mở dạng ngăn kéo.

## 3. Đã kiểm — an toàn

- **Tiêm mã qua ô nhập**: thử `<img src=x onerror=…>` qua ô Bảng tầm nhìn và
  `<script>` qua ô hỏi Trợ lý — **không chạy được**. Mọi chuỗi hiển thị đều đi
  qua hàm thoát ký tự `U.h()`.
- **Rò rỉ dữ liệu theo vai**: vai Học viên (R14) mở màn Quản trị con người →
  không thấy bất kỳ mật khẩu nào.
- **Toàn vẹn liên kết**: 55 mục điều hướng ↔ 56 màn hình, không mục nào trỏ vào
  khoảng trống; mọi khoá quyền đều tồn tại trong bảng `PERM` gốc.
- **Toàn vẹn kho**: 1.000 kịch bản đủ mã–tên–tầng · 220 phác đồ đủ mã–tên ·
  không mã tầng lạ.

## 4. Ba điểm CHẶN phát hành ra ngoài

> Không mở cho khách bên ngoài khi ba điểm này chưa đóng.

**① Xác thực đang chạy phía trình duyệt.**
`src/data.accounts.js` chứa mật khẩu demo nằm trong mã tải về máy khách.
Đây là lớp để **thử vai**, không phải bảo mật.

Cách nối với v6.9:
```
1. Xoá src/data.accounts.js khỏi index.html.
2. Thay G.doLogin() trong src/app.js bằng lời gọi rpc('login', {u, p})
   tới 02_Security.gs — băm mật khẩu kèm pepper, trả về token có hạn.
3. Mọi thao tác ghi (bảng tầm nhìn, nhật ký, check-in) gọi 08_Api.gs;
   máy chủ LUÔN kiểm lại quyền trước khi ghi — client chỉ ẩn/hiện nút.
4. Chuyển G.S (localStorage) sang hồ sơ gia đình trên máy chủ,
   kèm quyền xoá dữ liệu theo yêu cầu của gia đình.
```

**② Chưa hiện bằng chứng pháp nhân** — tên pháp nhân, mã số thuế, người chịu
trách nhiệm nội dung. Khách khó tính nhất coi việc thiếu phần này là tín hiệu xấu.

**③ Chưa có mốc chuyển tuyến chuyên khoa** — cần hội đồng chuyên môn chốt: dấu
hiệu nào thì một ca vượt phạm vi đồng hành giáo dục và phải chuyển sang chuyên
khoa tâm lý. Đưa vào cả kịch bản lẫn giao diện.

## 5. Lá chắn dữ liệu — đang chạy thật

`src/guard.js` bật ba lớp trên 12 màn hình mang tài sản chuyên môn:

| Lớp | Cơ chế |
|---|---|
| Đóng dấu chìm theo người xem | Tên tài khoản + mốc thời gian phủ mờ trên nền; ảnh chụp màn hình rò ra ngoài truy được về đúng phiên |
| Chặn sao chép khối lớn | Chọn > 600 ký tự trên màn chuyên môn bị chặn khi chưa bật đồng ý xuất; Ctrl+S / Ctrl+P và kéo thả cũng bị chặn |
| Nhận diện quét kho | 14 màn chuyên môn trong 60 giây → cảnh báo; trên 26 → hạ nhịp 20 giây và ghi nhật ký |

Nhật ký nguy cơ của phiên hiện tại: **Nhóm 05 → Lá chắn dữ liệu**.

**Nói thẳng:** ba lớp này ngăn được sao chép tuỳ tiện, **không** ngăn được người
biết việc. Hai lớp còn lại phải đặt ở máy chủ:

- **Chống đối thủ giả làm khách** — đối chiếu hồ sơ đăng ký với hoạt động thật:
  một tài khoản đọc rất nhiều kịch bản chuyên môn nhưng không có dữ liệu gia đình,
  không check-in, không dự buổi nào thì không phải một gia đình.
- **Nhật ký truy cập chỉ thêm, không sửa, không xoá** — ghi ai mở tài liệu nào,
  lúc nào; đặt ở `09_Jobs.gs`.

Và điều quan trọng nhất: giá trị lớn nhất của GITA 365 không phải tệp tài liệu.
Là hội đồng chuyên môn, người dẫn dắt có nghề và cộng đồng gia đình — những thứ
không sao chép được.

## 6. Ranh giới dữ liệu với gia đình

- Bảng số của một nhà **chỉ so với chính nhà đó ở chặng trước** — không xếp hạng.
- Băng sức khoẻ (XANH/VÀNG/CAM/ĐỎ) là **công cụ phân bổ chạm**, không phải nhãn dán.
- Dữ liệu của một gia đình **chỉ dùng cho chính gia đình đó** — không hồ sơ quảng
  cáo, không bán cho bên thứ ba, không dùng để huấn luyện mô hình của nhà cung cấp.
- Ảnh và thông tin của trẻ **từ 7 tuổi cần chính trẻ đồng ý**, bằng văn bản riêng.
- **Còn hở:** nút *“dừng và xoá dữ liệu nhà tôi”* — đưa vào bản 7.1, đặt ngay
  trong Tài khoản của tôi.

## 7. Chạy lại bộ kiểm

```bash
npx http-server -p 8099 -s .
node tools/kiem-tra.js       # 19 vai × 56 màn hình + rà soát toàn vẹn
```
