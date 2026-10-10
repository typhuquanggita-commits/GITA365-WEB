# GITA365 — chỉ dẫn cho trợ lý lập trình

Chủ hệ: anh Trương Nhật Quang (không phải dân kỹ thuật, viết tiếng Việt). **Đẩy lên `main` = triển khai production.**

## Bản đồ
- App: `src/*.js` (ES5) → gộp bằng `node tools/gop-src.js` thành `gita-app.js` · `gita-nghe.js` (**phải giữ nguyên từng byte**). Danh sách gộp: `tools/danh-sach-src.json`.
- Máy chủ: Cloudflare Worker `may-chu/worker.js` (cửa đăng ký ở `CAN_PHIEN` + nhánh `if (fn === …)`), D1 lược đồ `may-chu/csdl.sql`.
- Kiểm thử: mọi `run:` trong `.github/workflows/kiem-tra.yml`; luật cơ học ở `tools/thu-ky-luat.mjs`.
- Từ ngữ chủ hệ ↔ tên trong mã: `docs/TU_DIEN.md`. Tài liệu vận hành: `docs/`.

## Luật màn hình V50 (`src/data-v50.js`)
- Màn mới phải là **công cụ** (người dùng làm được việc, có dữ liệu thật hoặc nhãn "Ví dụ minh hoạ", đo được) — hoặc là học thuyết thì **vào một cụm** trong `G.V50.CUM`, không thêm mục rời vào cột trái nhân sự.
- Màn trùng / số mẫu: thêm vào `G.V50.GOP` (chuyển sang công cụ sống), không xoá đăng ký `G.VIEWS` (do-16-he canh khoá màn).
- Không gian vai `src/khong-gian.js` chỉ trỏ vào công cụ sống; `tools/thu-ap-dung.mjs` canh.
- V50·168 (`src/v50-man.js`): cột trái = MÀN CHÍNH, tách HAI KHU. Khách (R13–R15, khách lạ) chỉ thấy 3 màn khu khách, không một dấu vết nghiệp vụ nhân sự. Nhân sự: Khu vực nhân sự (R06–R12 tối đa 5 · R03–R05 tối đa 10) + Khu vực khách hàng xem theo quyền. R01–R02 hiển thị 100% (10 + 5). Màn mới phải là PHẦN của một màn chính (danh mục ≤ 168) hoặc chương trong một kho nghề `kn-*`; `tools/thu-v50-168.mjs` canh mọi màn đều khớp một màn chính.
- Cấp quyền (mở tài khoản, đổi vai, quyền CRM / T5-PRO / ký nội dung / vị trí tài chính, phòng ban, ba cửa, bảng phân quyền) CHỈ R01, gác ở máy chủ; Admin hệ thống thấy màn cấp quyền ở chế độ xem. Khung bảng CRM · Tài chính: `tools/dung-khung-du-lieu.js` (CI kiểm khớp `csdl.sql`).

## Trợ lý chat (`src/tro-ly-hoi-thoai.js` đứng trước bộ tra kho)
- Sáu bước mỗi lượt: hồ sơ vai (cấp · tầng · phạm vi) → suy luận loại câu → phương án theo NHÓM VAI → kiểm giới hạn (màn mở được, phần nền, cổng phí) → trả lời → dẫn đúng MỘT màn tiếp theo mà vai mở được.
- Khách: mỗi lượt một câu đón · một ý chính · MỘT câu hỏi; không đổ danh sách tư liệu, không lộ chữ nội bộ (kho, mã, trần %). Phụ huynh đi chuỗi chẩn đoán; học viên và đại sứ thì không. Câu xã giao không tra kho, không ghi nhớ. Đường khẩn luôn đi trước.
- Thêm một bộ phận mới vào câu trả lời thì đi qua lớp này, đừng nối thẳng vào `theDap`. `tools/thu-tro-ly-hoi-thoai.mjs` canh.

## Bộ não vận hành (`may-chu/bo-nao-van-hanh.js`)
- Làm 30 phút · nghỉ 30 phút (cron `0,5,10,15,20,25 * * * *`, rẽ nhánh theo `su.cron` TRƯỚC phép phân theo giờ; lượt đầu ca làm việc nặng; `GITA_BO_NAO_NGHI=1` là công tắc nghỉ). Đội Agent: tuyến bật "tự chạy" đi tiếp một chặng mỗi lượt + chạy ngay khi khách kích hoạt tài khoản. Làm việc VẬN HÀNH: giao Tư vấn, đưa nhà đèn đỏ lên đầu, đếm, báo động, chụp số đo — mọi lượt ghi đảo ngược được, không đè người đã giao tay.
- Không tự nhập nội dung phục vụ khách (ba chữ ký), không tự sửa mã, không tự cấp quyền. Bước mới thêm vào `nhipVanHanh` phải có chế độ chạy thử chỉ đọc. `tools/thu-bo-nao-van-hanh.mjs` canh.

## Ngôi nhà thịnh vượng (`src/ngoi-nha.js` · CSS `.nha-*`)
Kiến trúc đã bị viết lại 4 lần, lần nào cũng hỏng một kiểu. Sửa màn này thì chạy cả hai bộ canh:
`node tools/thu-ngoi-nha.mjs` (CI, tĩnh) và `node tools/thu-ngoi-nha-trinh-duyet.mjs` (trình duyệt thật, quét trọn một vòng quay — cần `python3 -m http.server 8123`).
- Lớp vòng `.nha-ring-nodes` phủ cả con dấu và nằm TRÊN nhà → phải `pointer-events:none` (thiếu là 0/11 phần nhà bấm được).
- `nhaQuay` (vòng) và `nhaGiu` (bánh) cùng thời lượng, ngược chiều — lệch là chữ nghiêng dần.
- Máy "giảm chuyển động" là mặc định; lựa chọn trong app (`gita.nhaQuay`) thắng cả hai chiều.

## Quy trình (skill trong `.claude/skills/`)
- Trước mọi commit/push: `gita-kiem-truoc-khi-day`.
- Thêm/sửa cửa máy chủ: `gita-them-cua-may-chu`. Sửa lỗi: `gita-sua-loi`.
- Yêu cầu mơ hồ / cần quyết định kinh doanh: `gita-hoi-chu-he`. Báo cáo cuối việc: `gita-bao-cao-chu-he`.

## Gỡ hẳn — CHỈ KHI CHỦ HỆ RA LỆNH
Không xoá mã màn, cửa máy chủ, bảng dữ liệu hay tệp nào đã gộp / đã rút (V50 GOP · CUM · AN) khi chủ hệ chưa ra lệnh gỡ bằng lời rõ ràng trong phiên làm việc. Gộp, ẩn, chuyển hướng thì được (đảo ngược được); gỡ hẳn thì không.

## An ninh (9/10/2026 · `SECURITY.md` · `docs/SOAT-AN-NINH-2026-10-09.md`)
- Trang công khai = danh sách trắng `tools/dung-site.sh` (CHUNG cho `deploy.yml` và `tools/thu-trang-cong-khai.mjs`). Trang HTML nạp tệp mới thì thêm vào đó, không sửa riêng `deploy.yml`.
- `deploy.yml` gọi `kiem-tra.yml` làm cổng: bộ kiểm đỏ là không triển khai. Thêm phép kiểm thì thêm vào `kiem-tra.yml`.
- Móc pre-commit `tools/chan-commit.mjs` (tự bật mỗi phiên): chặn tệp mật, khoá, tệp nén, tệp > 8 MB, dáng khoá. CI chạy `--tat-ca`. Không dùng `--no-verify`.
- Ví dụ khoá cố ý: ghi `gita-bi-mat:bo-qua` trên dòng ấy (soat-bi-mat); báo nhầm của gitleaks: `.gitleaks.toml`, phải soát tay và ghi lý do.
- Công cụ tải về trong CI: ghim phiên bản + đối chiếu SHA-256; action ghim mã commit; `npx` ghim phiên bản đúng.

## Không chạm (trừ khi chủ hệ yêu cầu rõ)
`crm.js` · `kho/*.enc` · giấy phép · `studio.js` · `kho-goc/` · `kho/khoa.json`. Khoá thật chỉ ở Cloudflare/GitHub Secrets.

## Soát thiết kế (`tools/soat-thiet-ke.js` · `tools/thu-thiet-ke-tinh.mjs` · skill `gita-thiet-ke`)
- 19 luật ở `tools/luat-thiet-ke.json` (ý tưởng từ pbakaus/impeccable, mã viết lại). `chan` = phải 0; `tran` = không thêm màn phạm so với `tools/soat-thiet-ke.nen.json`, nâng trần phải `--nhan-tang "lý do"`.
- Chữ màu dùng token `-ink` (`--gold-ink`, `--gita-ink`) hoặc `--ok/--warn/--bad` — `--gold-2`/`--gita-sang` là xanh nhạt cho chuyển sắc, 2,91:1, không làm màu chữ. Mã hex gõ tay không đổi theo nền Sáng/Tối.
- Sửa bậc tiêu đề bằng tên thẻ đúng và đổi luôn bộ chọn CSS (`.kh h4` → `.kh h2`) để cỡ chữ không nhảy.
- Chữ đặt lên một màu đặc của biểu đồ dùng `--chu-tren-mau`, không gõ `#fff`.
- Bộ đo đếm theo MÀN THẬT (`G.S.view`) — nhiều mục cột trái chuyển hướng về cùng một công cụ sống.

## Xưởng phim AI — một cửa (`src/xuong-ai.js` · `src/cat-nhip.js`)
- Khung ba cột gom mọi công cụ phim; thêm công cụ = thêm một dòng `NHOM`, không dựng màn mới. `tools/thu-xuong-ai.mjs` đối chiếu từng dòng với bộ vẽ thật.
- GITA Studio (`studio`) và Phim ngắn 9:16 (`xuong-phim`) **không** chuyển hướng (GOP): `studio.js`/`xuong-phim.js` chỉ vẽ lại khi `G.S.view` đúng tên chúng, nên hai mã màn ấy tự vẽ khung (`CHU_MAN`), rút khỏi cột trái bằng `V50.AN`. Thứ tự gộp phải để hai tệp ấy TRƯỚC `xuong-ai.js`.
- Màn con không có mục cột trái (`san-xuat-ai`, `ban-dung`, `studio-he`, `lam-phim-10`) vào khung qua `G.XA_CUA` ở `render()`; `G.ax.tab(...)` được chuyển thành đổi ngăn.
- Cắt theo nhịp chạy tại máy; dò nhịp là hàm thuần `G.catNhip.timNhip` thử bằng tín hiệu tự dựng (lệch ≤ 20 ms). Không đụng `studio.js`.

## Chương trình đào tạo (`src/dao-tao-ct.js` · `may-chu/dao-tao-ct.js`)
- Ba chương trình Tư vấn · Nhân sự · Coach, độc lập nhau. Ghi danh theo `vaiChinh`, và mọi bài của chương trình phải mở được với các vai ấy (bộ thử đối chiếu `G.PERM`). Mỗi bước TRỎ vào một màn đã có (`man` phải là mục `G.NAV`); màn này giữ SỔ, không chép nội dung học.
- Chương trình có hai bản: `CT` (máy chủ) ↔ `G.DTC_CT` (màn). Đổi một bên phải đổi bên kia — `tools/thu-dao-tao-ct.mjs` so từng ô.
- Ba loại bước, không gộp: `tuHoc` (lời khai, phải kèm một câu) · `nguoiCham` (người khác chấm 0–100, kèm nhận xét) · `mayCham` (máy đọc thẳng `baCuaConNguoi`, không cửa nào ghi được). Sát hạch là bước NGƯỜI chấm vì điểm sát hạch nằm ở bản đồng bộ của máy khách.
- Ba bảng chỉ thêm dòng, không có cột "đã đủ": đủ điều kiện tính lúc đọc, chứng nhận hoàn thành là hành động có người ký (không tự ký, người ký khác người chấm, thu hồi phải có lý do). Chứng nhận này KHÔNG thay chứng chỉ hành nghề Coach của `dao-tao-dh` và chưa mở quyền gì — nối nó vào quyền là việc chủ hệ quyết. So "cùng người" bằng `Kho.layUid` — gửi email của chính mình không lách được cổng tự chấm.
- Tiến độ chỉ nằm ở máy chủ; tài khoản mẫu xem được chương trình nhưng không ghi được — cố ý.

## Kho cấp cao · hệ Tư vấn (`may-chu/kho-cao.js` · ngăn "Cấp cao" ở `src/tra-cuu-giai-phap.js`)
- 2.000 vấn đề Tư vấn = tầng 1 (200, V1-A/B) · tầng 2 (800, V2-A…H) · tầng 3 (1000, V3-A…J), làm 5 đợt × 400 (đợt 6–10; đợt 1–5 là 2.000 vấn đề Coach C4/C5). Tên đủ 20 nhóm đã đặt sẵn ở `NHOM_CAO` — đợt sau nối vào, không đổi tên.
- Nguồn trần KHÔNG vào kho mã; chỉ `kho-cao/goi.enc` (một gói chung Coach + Tư vấn). Đóng gói lại phải gồm MỌI nhóm đã có — mở gói cũ bằng `--mo`, so với nguồn, rồi mới đóng.
- Tầng 1 không chữa (chỉ quan sát · ghi · đọc mô thức · giả thuyết); tầng 2 là vòng thử 7 ngày đổi ít biến. Chạm dấu hiệu an toàn thì `thamVan` phải có "chuyển ngay" (bộ gộp chặn).
- R11 thao tác với nhà ghi tên mình ở `hoSoKhach.tuVan` qua `vaiKhoCao` — chỉ vấn đề hệ Tư vấn, không mở ví. KHÔNG sửa `vaiVoiNha` của credit.js. Tư vấn viên ghi hoàn thành thì thưởng credit chờ Coach/Trưởng nhóm.

## Một cửa hỏng không được ngắt cả ứng dụng (sửa 10/2026 · `docDongChay` · `src/noi-may-chu.js`)
- Lỗi chủ hệ chụp: màn Truy vấn đa chiều, bấm "365 ngày" → "Máy chủ vừa không trả lời mấy lượt liền". Hai nguyên nhân chồng nhau: cửa chạy ~35 câu nối tiếp, một bảng thiếu trên D1 cũ (vaLuocDo chỉ THÊM CỘT, không dựng bảng) là cả cửa 500; lọc `substr(cot,1,10) >= ?` không đi chỉ mục nên kỳ 365 ngày quét trọn sổ audit.
- Cửa nhiều chỉ số: mỗi chỉ số chạy riêng (`doRieng`), hỏng thì `null` + tên vào `chuaDo` — không kèm lời lỗi CSDL. Màn hiện "chưa đo được", không hiện 0.
- Lọc ngày trên cột ISO viết `cot >= ?` (cùng nghĩa với substr khi mốc dài 10 ký tự, nhưng dùng chỉ mục).
- Cầu dao máy khách: 500 CÓ `x-gita-ma` là máy chủ đã trả lời — chỉ khoá đúng cửa ấy 30 giây (`CUA_HONG`). Cầu dao chung (`NGAT`) chỉ đếm lỗi mạng và 5xx không mã. `tools/thu-dong-chay.mjs` phá thử cả hai.
