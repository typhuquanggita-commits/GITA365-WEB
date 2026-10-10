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

## Thi chứng chỉ (`may-chu/thi-cap.js` · `may-chu/thi-cap-du-lieu.js` · màn `thi-chung-chi`)
- Tư vấn 50 cấp (R11) · Coach 100 cấp (R05–R08). Phần số của mỗi cấp (số ca, biến cố, hạng ca, ngưỡng, số người chấm, phút, % kho) là CÔNG THỨC theo cấp; phần chữ viết riêng từng cấp. `thi-cap-du-lieu.js` do `scratchpad/thi-cap/dung.mjs` sinh — đừng sửa tay. Màn đọc khung từ `khungThi`, không giữ bản chép.
- Đề KHÔNG nằm trong kho mã: ghép lúc bắt đầu từ kho cấp cao × 14 dạng × 36 biến cố, hạt giống theo người·hệ·cấp·tháng·lượt, ưu tiên ca chưa mở và chưa gặp trong 12 tháng. Đề gửi xuống không kèm lời giải.
- Cấp tính LÚC ĐỌC bằng phát lại sự kiện (`capCua`): đạt ở cấp ≥ đang giữ thì giữ/lên; bỏ một tháng thì tụt một cấp; vi phạm hạ cấp ngay, Super Admin huỷ thì cấp trở lại. Không bảng nào có cột cấp hiện tại.
- Người chấm khác người thi (định danh chính tắc), chấm mù; không phải quản lý thì phải giữ cấp cao hơn cấp bài. Bộ dò chép báo khi tỉ lệ cụm 8 chữ trùng > 25% HOẶC trùng ≥ 12 cụm — chỉ đo tỉ lệ thì chép một đoạn rồi pha loãng là lọt.
- Soát đối kháng (10/2026) bắt 18 lỗ, mỗi lỗ một phép đo ở `thu-thi-cap.mjs` (kịch bản `doiKhang`) và phá thử cho bốn bản sửa chính:
  - quyền xin ý kiến chỉ theo QUYẾT ĐỊNH MỚI NHẤT của lượt xin (rút lại thì hết);
  - chỉ ca được CHUYỂN mới cho đề xuất ở nhà mình không phụ trách;
  - người chuyển ca không được tự nhận ca, và người nhận phải có năng lực cao hơn người xin;
  - mỗi người chấm một lần (chỉ mục duy nhất), đủ người thì chốt kết quả;
  - mỗi ca có sàn `SAN_CA`;
  - kiểm-rồi-ghi một câu khi bắt đầu bài, để gọi dồn không mở được nhiều bài;
  - bài bắt đầu trước lần bị hạ không dựng lại cấp đã mất;
  - khoá vi phạm mức 3 áp cả khi cổng tắt, cả với quản lý; người bị khoá không duyệt, không chấm;
  - đang thi thì kho từ chối đọc và đề xuất ca của bài ấy (`DANGTHI`);
  - đề chỉ lấy ca NGOÀI phần kho người thi đã mở khi kho đủ ca.
- Mọi cấp khó hơn cấp trước ở ít nhất độ dài bài tối thiểu (`chuToiThieu`). Thi giữ cấp khó hơn lần đạt cấp ấy: thêm một biến cố, ngưỡng cộng 3, bài dài hơn 40 ký tự (`defThi`).
- Xin ý kiến LUÔN BẬT (chủ hệ chốt 10/2026): vấn đề vượt cấp thi thật (`maDuocMo(..., boQuaCong=true)`) hoặc hạng VVIP/Diamond thì phải có ý kiến đã duyệt, cổng kho tắt cũng vậy. Cổng R01 chỉ còn quyết việc ĐỌC kho theo cấp. Luật tầng của nhà xét TRƯỚC (không hợp tầng thì từ chối thẳng). Hệ quả: lúc chưa ai có cấp, mọi đề xuất kho cấp cao của Coach/Tư vấn viên đều phải xin ý kiến.
- Thi CHỈ ngày 28 hằng tháng giờ VN (`NGAY_THI`, `moCuaThi`); bộ thử bật bằng `env.THI_MO_MOI_NGAY='1'` (biến Worker, người dùng không gửi được).
- Cổng (R01 bật) khoá kho cấp cao theo % cấp; hạng VVIP · DIAMOND và vấn đề vượt cấp phải xin ý kiến; người duyệt có thể chuyển ca. Đình chỉ và bồi thường là quyết định của người — máy chỉ gửi đề nghị (`baoLenCapCao`). Mức hệ quả `HE_QUA` và công thức % kho là mặc định chờ chủ hệ chốt.

## Lương · phản hồi · xếp hạng (`may-chu/xep-hang-luong.js` · ngăn "Xếp hạng tháng" ở `thi-chung-chi`)
- Lương kỳ YYYY-MM trả ngày 05 tháng sau; 05 là ngày nghỉ thì 08; 08 cũng nghỉ thì ngày làm việc đầu tiên SAU 08 (`ngayTraLuong`, chốt 10/10). Ngày nghỉ = **thứ Bảy · Chủ nhật** (`THU_NGHI`) · lễ dương cố định (`LE_CO_DINH`) · ngày R01 khai ở bảng `ngayNghi` (Tết âm lịch, nghỉ bù; nghi=0 là gỡ, dòng mới nhất quyết). Máy không tự đoán âm lịch. `bangLuong` trả kèm `ngayTra`.
- Ngày trả bị dời thì **mỗi nhân sự R01–R12 nhận một thông báo ĐÍCH DANH** (`baoNgayTraLuong`, bảng `thongBao`, `denAi`) — không gửi theo vai, vì `danhDauDaDoc` đánh dấu cả dòng và một người bấm đã xem sẽ giấu khỏi mọi người cùng vai. Không gửi trùng (`doiTuong = traLuong:<kỳ>:<ngày>`); ngày trả đổi thêm lần nữa thì có thông báo mới. Gửi lúc R01 khai ngày nghỉ (`khaiNgayNghi`) và mỗi lượt đêm (`baoLichTraLuongSapToi`: kỳ trước + kỳ này). Hộp thông báo hiện ở `trung-tam-do` · `coach-deck` · `tuvan-deck`.
- Phiếu tháng của gia đình (`guiDanhGiaKH` → `danhGiaKH`) bắt buộc đủ 5 tiêu chí `TIEU_CHI` (bản đối chiếu `G.XH_TIEU_CHI` ở `src/ho-so-thang.js`, bài thử so từng ô) và CHỤP `coach · tuVan` lúc gửi — phiếu thuộc người làm tháng ấy, nhà đổi người phụ trách sau đó cũng không đổi.
- Xếp hạng lương thưởng tháng (`xepHangThang`): **chốt 10/10** thi ngày 28 (30) · cấp chứng chỉ (30) · **tỷ lệ nhà hài lòng (40)** — phần 40 đo bằng tỷ lệ nhà CSAT ≥ 4/5, cùng thước với điều kiện thưởng → hạng A/B/C/D (90/80/65). Không dự thi = 0; dưới `MAU_TOI_THIEU` (3) nhà có phiếu thì phần phản hồi null, trọng số bỏ và ghi ra. Quản lý R01–R05 xem cả đội, nhân sự khác chỉ dòng mình. Trọng số/ngưỡng là MẶC ĐỊNH chờ chủ hệ chỉnh; hạng chưa tự đổi ra tiền (chưa có bảng lương máy chủ cho Coach/Tư vấn viên).
- **Thưởng lương** (chốt 10/10, `NGUONG_THUONG`, `xetThuong`): KPI làm việc (điểm tổng tháng) ≥ 90 **VÀ** tỷ lệ nhà hài lòng ≥ 90%, không bù trừ. Nhà hài lòng = CSAT trung bình tháng ≥ 4/5 (`CSAT_HAI_LONG`), tính trên NHÀ không trên phiếu. Ba trạng thái: `dat` · `khongDat` · `chuaXet` (dưới 3 nhà có phiếu — không đọc ra đạt hay không đạt). Mức thưởng **3–5% lương** theo bậc KPI (`MUC_THUONG`: 90→3% · 94→4% · 97→5%, bậc là mặc định); máy trả phần trăm (`ptLuong`), tiền = phần trăm × lương của người ấy.

## Cửa trước cho khách chưa có tài khoản (`src/cua-truoc.js` · kiem-tra mục 41)

Một trang năm chặng **Nhận ra → Hiểu → Tin → Thử → Quyết** thay ba ngăn cũ (43.495 ký tự → ~7.400; điện thoại 55 → 9 lần vuốt). Chủ hệ chốt 10/10:
- Mỗi chặng có **việc làm được ngay tối nay** (tình huống → việc tối nay; "ba tối thử tại nhà" đánh dấu bằng localStorage, bọc try/catch). Không hứa kết quả, không từ tuyệt đối, **không dùng nỗi sợ** (Hiến pháp điều 5).
- Mỗi chặng nói **ai ở bên nhà mình** (`.ct-ben`) — khách không thấy mình đi một mình.
- **Rút khỏi trang công khai**: câu hỏi thật + bốn mức, ngưỡng cảnh báo, quy mô kho nghề, năm bước vận hành. Dữ liệu cửa trước giữ trong biến của tệp, **không đổ vào G**.
- Rút khỏi MÀN chưa phải bảo vệ: `kho/mau.json` (219 kho, 462 KB) vẫn ai cũng tải được. Cắt gói ấy là việc ở `tools/ma-hoa-kho.js` và cần kho-goc của chủ hệ.
- Bộ bắt cú bấm chung (`on()` ở app.js) gọi `preventDefault` → đừng dùng ô tích ở đây, dùng nút `aria-pressed`. Phần tử có `display` riêng phải kèm `[hidden]{display:none}`, nếu không thuộc tính `hidden` mất tác dụng.
- "100 điểm chạm trước quyết định" là **cách đếm, không phải chỉ tiêu**; trang này chỉ là phần đầu của hành trình.

## Kim chỉ nam ở đầu mọi màn khách (`src/kim-chi-nam.js` · `may-chu/kim-chi-nam.js` · `tools/thu-kim-chi-nam.mjs`)
Chủ hệ 10/10: khách không được thấy mình đi một mình; dải **gắn với nhiệm vụ** — với các phần của khách VÀ công việc của thành viên — **không phải màn riêng**. Một dải ở đầu MỌI màn (khách lẫn nhân sự), chèn ở đúng một chỗ (`render()` của app.js → `G.kcnThanh`), mặc định **một dòng** (`<details>`, mở/đóng nhớ trên máy).
- Khách: tầng của nhà · **việc hôm nay** (đúng một việc, đọc từ `docHomNay`) · người đi cùng.
- Thành viên: cấp chứng chỉ · **việc đang chờ chính người ấy** theo ưu tiên ý kiến chờ duyệt → bài chờ chấm → thông báo chưa đọc → ngày thi (đọc từ `dsYKien` · `dsBaiCham` · `thongBao` · `thiCuaToi`, không bản chép) · ai đỡ khi việc khó (theo đường xin ý kiến: Coach→R05, R05/R11/R12→R04, R04→R03, R02/R03→R01).
- Cửa `kimChiNam`: **chỉ đọc**, **chỉ họ tên** (không tên đăng nhập/email/số điện thoại của nhân sự), **nhà lấy từ phiên** (không nhận mã nhà từ thân yêu cầu — lớp IDOR 9.99.114). Người phụ trách đã nghỉ thì coi như chưa xếp. Chưa xếp thì nói "đang xếp", không bịa tên. Học viên tìm nhà qua `maHocVien`; R15 được chỉ tới Ban vận hành.
- Câu "khi việc khó, người đi cùng xin ý kiến Trưởng nhóm chuyên môn" là điều hệ ĐANG làm (xin ý kiến luôn bật) — đừng thêm lời hứa nào hệ chưa làm.
