# GITA 365 · Kho phim trên Google Drive (gói 2TB)

Mọi phim của GITA365 lưu trong Drive của chủ hệ, thư mục **GITA365 · Kho phim**:

```
GITA365 · Kho phim/
├─ Phim/2026-10/…      ← phim thành phẩm (tự xếp theo tháng)
├─ Cast/               ← ảnh mẫu nhân vật gửi từ app
├─ Viec/               ← kịch bản đã gửi + tiến độ từng việc
└─ Mo-hinh/            ← (tuỳ chọn) chỗ để mô hình nếu dựng bằng Colab
```

App GITA → **Xưởng phim AI → 🗄 Kho phim**: xem dung lượng, xem phim ngay trên trang, bật/tắt chia sẻ link,
chép link, bỏ vào Thùng rác. Phim làm ở đâu cũng được — kéo vào thư mục **Phim** trên Drive là app thấy.

## Cài một lần (~10 phút, không tốn tiền)

1. Mở **script.google.com** bằng đúng tài khoản Google có gói 2TB → **Dự án mới** → đặt tên "Kho phim GITA365".
2. Xoá mã mẫu, dán toàn bộ tệp `GITA_KhoPhim.gs`.
   Bấm ⚙ **Project Settings** → tick **Show "appsscript.json"** → mở tệp đó, dán nội dung `appsscript.json`.
3. Chọn hàm **caiDat** → bấm **Run** → cho phép quyền Drive. Xem **Execution log**: chép lại **KHOA_APP** và **KHOA_MAY**.
4. **Deploy → New deployment → Web app** · Execute as: **Me** · Who has access: **Anyone** → Deploy →
   chép địa chỉ dạng `https://script.google.com/macros/s/…/exec`.
5. Trong app GITA → tab **🗄 Kho phim** → **Cài đặt kho Drive**: dán địa chỉ + **KHOA_APP** → Lưu.

Xong bước 5 là kho đã chạy: xem phim, chia sẻ, và màn **Làm phim nhanh** gửi ảnh mẫu + kịch bản vào Drive.

## Nối máy dựng phim MIỄN PHÍ (tuỳ chọn, thêm ~10 phút)

Để bấm "Làm phim" là tự dựng (Kaggle GPU miễn phí) rồi phim tự về Drive:

1. **GitHub → Settings → Secrets → Actions**, thêm: `KAGGLE_USERNAME`, `KAGGLE_KEY` (kaggle.com → Settings → API),
   `KHO_DRIVE_URL` (địa chỉ bước 4), `KHO_DRIVE_KHOA` (**KHOA_MAY**).
2. Tạo GitHub token chỉ cho repo này (Fine-grained, quyền **Contents: Read and write**) →
   trong Apps Script ⚙ **Project Settings → Script properties** thêm `GH_TOKEN` = token, `GH_REPO` = `typhuquanggita-commits/GITA365-WEB`.

Chưa làm phần này thì việc vẫn được lưu vào Drive; muốn dựng thì vào GitHub → Actions →
**Dựng phim từ kho Drive** → Run workflow → nhập mã việc.

## Dự án phim 4–8 phút cao cấp, miễn phí (tab 🎬 Dự án phim)

AI chỉ làm phần không quay được — vừa đẹp nhất vừa không tốn tiền, làm được nhiều phim/tháng:

| Loại cảnh | Làm bằng | Ghi chú |
|---|---|---|
| Trainer/MC nói, nhiều người chạm nhau | **Quay thật bằng điện thoại** | đúng mặt, đúng giọng, khớp môi tuyệt đối, không hình mờ |
| Cảnh nền không có nhân vật | **Video miễn phí Pexels/Pixabay** | app gợi ý từ khoá + link tìm |
| Một nhân vật hành động không quay được | **AI trên Kaggle** (miễn phí) | ~0,4 giờ GPU cho phim có ~10% cảnh AI |

1. Dán kịch bản → app tự chia việc từng cảnh (đổi được), in **danh sách quay**.
2. Bấm **Tạo thư mục dự án** → trên Drive có `Du-an/<tên>/{Quay-that, Stock, AI, Nhac}`.
3. Quay / tải video nền → đổi tên đúng số cảnh `01.mp4, 02.mov…` → kéo vào đúng thư mục. Nhạc nền: 1 tệp mp3 vào `Nhac`.
4. (Nếu có cảnh AI) bấm **Dựng cảnh AI** → Kaggle dựng, cảnh tự vào thư mục AI.
5. Bấm **Kiểm tra tệp** → **Ráp phim** → máy GitHub (miễn phí) ráp 1080p: giọng chuẩn phát sóng, chỉnh màu, chống rung
   (tuỳ chọn), lồng tiếng cảnh AI/nền, phụ đề, thẻ tên, nhạc tự hạ khi có lời, -14 LUFS → phim vào `Phim/<tháng>/`.

Khi ráp, kho mở link "ai có link" **tạm thời** cho đúng các tệp cảnh để máy GitHub tải về, xong **khoá lại ngay**
(tệp anh/chị đã chia sẻ từ trước giữ nguyên). GitHub miễn phí ~2.000 phút/tháng cho repo riêng ≈ 60–100 lần ráp.

## Đường đi của một phim (miễn phí hoàn toàn)

```
App (ảnh + kịch bản) → Apps Script → Drive/Viec ─▶ GitHub Action ─▶ Kaggle GPU (T4, miễn phí)
                                                                     │ giọng · khung từ ảnh mẫu · Wan 2.2 · ráp 1080p
App (xem / chia sẻ) ◀── Drive/Phim/<tháng>/ ◀── tải lên nối tiếp ◀────┘
```

## Bảo mật

- Apps Script chạy bằng tài khoản của chủ hệ, chỉ đụng tệp **bên trong** "GITA365 · Kho phim" (mã kiểm cha–con
  trước mỗi thao tác). Hai khoá tách vai: **KHOA_APP** (app: xem, chia sẻ, gửi việc) và **KHOA_MAY** (máy dựng:
  đọc việc, báo tiến độ, tải phim lên). Khoá máy không xoá hay chia sẻ được phim.
- Máy dựng tải phim lên bằng **phiên tải lên một lần** do Apps Script mở — không cầm token Google nào.
- Phim mặc định **riêng tư**. Bấm "Chia sẻ link" mới có người khác xem được.
- Đổi khoá: xoá `KHOA_APP`/`KHOA_MAY` trong Script properties → chạy lại `caiDat` → cập nhật app/GitHub.

## Giới hạn (nói thẳng)

- **Drive là kho lưu và bản gốc**, không phải nơi phát cho đông người: phim chia sẻ công khai mà quá nhiều người
  xem/tải, Google có thể tạm khoá tải ("vượt hạn mức"). Phát hành → đăng Facebook/YouTube; Drive giữ bản gốc.
- Phim vừa tải lên cần vài phút để Drive xử lý trước khi xem trên trình xem.
- **Đường miễn phí chậm:** Kaggle T4 dựng 60 giây phim mất **vài giờ** (không đạt mốc 15 phút — mốc đó cần máy
  GPU thuê). Kaggle cho ~30 giờ GPU/tuần.
- Trên T4 không chạy nổi mô hình đặt người vào phim trường (20B) và InfiniteTalk (14B): xưởng dùng **chính ảnh
  mẫu làm khung đầu** (đúng mặt người thật — mẹo: chụp ảnh mẫu ngay tại nơi muốn quay), và cảnh nói không khớp
  môi được sẽ chuyển thành **cảnh lồng tiếng** (miệng khép, giọng đọc trên hình) — không bao giờ giả khẩu hình.
- 2TB ≈ 25.000+ phim 60 giây 1080p. Ảnh mẫu và kịch bản chiếm không đáng kể.
