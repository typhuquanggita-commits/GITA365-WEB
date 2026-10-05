# GPU MIỄN PHÍ CHO VIDEO CHUYỂN ĐỘNG — GITA 365

Xưởng phim dùng **nhân vật AI**, không dùng ảnh khách hàng, nên được phép
dùng GPU miễn phí bên ngoài để quay video có chuyển động thật. Cách đã chọn:
**Kaggle** — máy GPU T4 của Google, miễn phí khoảng 30 giờ/tuần, tài khoản
chính chủ, không phải máy lạ của người lạ.

> **Sản xuất phim nguyên bộ liên tục (vòng đời 2 cổng xác nhận):** xem
> `docs/XUONG-PHIM-KAGGLE-VAN-HANH.md` — đặt đề bài → Kaggle quay trọn bộ
> → tải về máy → dọn kho → quay việc tiếp theo, cùng cách quay dựng chuẩn
> và luật phiên/quota Kaggle. Trang này mô tả clip đơn lẻ và vẽ nhân vật.

## Luật nội dung (bảo mật)

- **Phim cho khách hàng**: nội dung theo thị hiếu và nhu cầu thị trường;
  lõi GITA tối đa khoảng 30%. Không mang cơ chế Coach ra ngoài — phần sâu
  nằm ở trợ lý GITA và đội tư vấn, coach, trainer, giáo viên. Máy chủ
  **chặn cứng** các từ khoá nội bộ (hoa hồng, tỷ lệ chia, sơ đồ tuyến…,
  danh sách ở `TU_KHOA_NOI_BO` trong `may-chu/xuong-quay.js`) khi phạm vi
  là `khach`.
- **Phim đào tạo nội bộ**: chọn phạm vi `noi-bo`, được nói đủ hơn, vẫn
  không chứa dữ liệu cá nhân của khách.
- Mọi nhân vật đều do AI tạo. Không bao giờ đưa ảnh, giọng, tên thật của
  khách vào máy bên ngoài.

## Bật máy quay Kaggle (một lần, khoảng 10 phút)

1. Vào **kaggle.com** → đăng ký bằng Gmail → vào phần tài khoản xác minh
   **số điện thoại** (bắt buộc để mở GPU miễn phí).
2. Bấm **New Notebook**.
3. Bên phải: **Add-ons → Secrets → Add**:
   - Tên: `GITA_KHOA_QUAY`
   - Giá trị: khoá xưởng quay (chính là GitHub secret
     `GITA_KHOA_XUONG_QUAY` của kho GITA365-WEB; ai giữ kho GitHub lấy ở
     Settings → Secrets and variables → Actions).
4. Bên phải: **Settings → Accelerator → GPU T4 x2**, **Internet → On**.
5. Mở tệp `may-quay-kaggle/quay-kaggle.py` trong kho này, **dán toàn bộ**
   vào ô code đầu tiên → bấm **Run** (hoặc Run All).
6. Màn hình in "Mô hình sẵn sàng" là xong. Máy tự nhận việc, quay, nộp
   về máy chủ. Mỗi phiên chạy tối đa khoảng 9 giờ; hết phiên bấm Run lại.

## Gửi một việc quay video

Cửa `quayVideoDong` (đã qua đăng nhập, chỉ R01):

```json
{
  "fn": "quayVideoDong",
  "anh": "<ảnh nhân vật AI, base64 JPEG/PNG>",
  "loiNhac": "nhân vật bước đi chậm rãi trong công viên, ánh nắng chiều",
  "phamVi": "khach"
}
```

Nhận về `{ ma }`; hỏi trạng thái bằng `quayXem` như cũ; xong thì phim ở
`/quay/phim/<ma>.mp4`. Mỗi clip khoảng 2,7 giây ở 24 khung/giây; một clip
mất vài phút trên T4.

## Giới hạn cần nhớ

- Clip ngắn (vài giây). Phim dài = nhiều clip ghép lại.
- LTX-Video giữ nét nhân vật ở mức tốt khi ảnh đầu vào rõ mặt; động tác
  lớn (đánh nhau, nhảy) vẫn dễ méo — kịch bản nên ưu tiên bước đi, quay
  người, cử chỉ tay, biểu cảm mặt.
- Hết 30 giờ/tuần thì chờ tuần sau hoặc thêm tài khoản Kaggle khác
  (mỗi tài khoản một khoá riêng, cùng nối vào một máy chủ).
- Không có GPU → không có clip; hệ thống phim phân tử (ảnh cảnh do AI
  vẽ + công thức) vẫn chạy bình thường. Hình người que bị cấm tuyệt
  đối: cảnh chưa có ảnh chỉ báo "đang vẽ", không vẽ hình tạm.

Kiểm cổng máy chủ: `node tools/thu-quay-video.mjs`.

## Máy vẽ nhân vật AI (việc loại `nv`)

Nhân vật và bối cảnh vẽ bằng **FLUX.1-schnell** (giấy phép Apache-2.0,
được dùng thương mại miễn phí) trên cùng máy Kaggle T4. Phong cách đã
chỉnh theo chuẩn phim ngắn dọc đang hút khách: diễn viên đẹp như thần
tượng nhưng da/tóc có chi tiết thật, ánh sáng điện ảnh ấm, nền mờ nghệ
thuật, khung dọc 9:16 (720×1280), cận cảnh cảm xúc. Bối cảnh (phòng
khách, vườn, lớp học, quán cà phê…) nằm ở lời mô tả từng cảnh.

Cách bật: làm **y hệt** mục "Bật máy quay Kaggle" ở trên, chỉ khác bước
5: dán tệp `may-quay-kaggle/tao-nhan-vat.py`. Có thể mở 2 notebook song
song: một cái vẽ nhân vật, một cái quay video.

Gửi việc vẽ (cửa `taoNhanVatAI`, chỉ R01):

```json
{
  "fn": "taoNhanVatAI",
  "moTa": "người phụ nữ 35 tuổi, tóc dài đen, áo dài trắng, mỉm cười ấm áp trong phòng khách",
  "phamVi": "khach"
}
```

**Giữ cùng một gương mặt xuyên suốt phim**: vẽ nhân vật lần đầu → lấy
ảnh kết quả ở `/quay/phim/<ma>.png` → gửi việc cảnh mới kèm ảnh đó trong
ô `anhGoc` (base64). Máy sẽ vẽ lại từ ảnh gốc: cùng gương mặt, bối cảnh
và dáng đứng mới theo `moTa`.

```json
{
  "fn": "taoNhanVatAI",
  "moTa": "cùng nhân vật, ngồi trong xe hơi, ánh nắng chiều hắt qua kính",
  "anhGoc": "<ảnh nhân vật đã vẽ trước, base64 JPEG/PNG>",
  "phamVi": "khach"
}
```

Ảnh xong ở `/quay/phim/<ma>.png`. Luật bí mật (từ khoá nội bộ) chặn y
như việc video.

Kiểm cổng máy chủ: `node tools/thu-nhan-vat.mjs`.
