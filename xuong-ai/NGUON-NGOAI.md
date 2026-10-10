# Nguồn bên ngoài đã soát

Mỗi kho bên ngoài được đọc, soát, và quyết định nhận hay loại trước khi chạm vào hệ thống.
Cách soát: lệnh `/soat-ky-nang` (`.claude/commands/soat-ky-nang.md`).

## alirezarezvani/claude-skills · commit 19392f7 (26/8/2026) · MIT

Kho khoảng 380 kỹ năng cho Claude Code và các công cụ lập trình AI khác. Phần lớn là hướng dẫn
dạng văn bản, một số kèm script Python chỉ dùng thư viện chuẩn.

| Kỹ năng | Kết quả soát | Quyết định | Lý do |
|---|---|---|---|
| skill-security-auditor | PASS | **Nhận** → `.claude/skills/` | Cổng soát cho mọi kỹ năng ngoài về sau |
| human-gate | WARN (2 mục HIGH, đã đọc: chỉ xoá tệp của chính nó) | **Nhận** → `.claude/skills/`, nối vào cổng 1 của xưởng | Đúng tinh thần ba cổng: chỉ đóng khi có người duyệt có tên và hết BLOCKER |
| ship-gate | PASS | Chưa nhận | Viết cho Next.js, Supabase…; GITA365 đã có bộ kiểm riêng (`/kiem`, `/day`). Kỹ năng còn tự chặn mọi câu "deploy", dễ đá nhau với `/day` |
| zero-hallucination-coder | PASS | Chưa nhận | Chỉ là quy trình văn bản, bắt hỏi nhiều vòng trước khi làm; không thêm gì cho cách làm hiện tại |
| runbook-generator | PASS | Chưa nhận | Ích lợi thấp lúc này |
| security-guidance | FAIL (báo nhầm: chuỗi cảnh báo có chữ `exec(`) | Chưa nhận | Là hook chạy trước mỗi lần sửa tệp; muốn dùng phải sửa `.claude/settings.json`. Để chủ sở hữu quyết |
| skillopt-sleep, self-improving-agent | PASS | **Loại** | Tự sửa kỹ năng, tự tiến hoá. Trái luật "không tự sửa mã" |
| loop-library | — | **Loại** | Đọc danh mục từ mạng lúc chạy |
| Cài bằng `bash <(curl ...)`, `install.sh --force` | — | **Loại** | Chạy script từ xa, bỏ bước xác nhận |

## waooAI/waoowaoo · commit dfec20e (21/9/2026) · Elastic License 2.0

Không gian làm phim, ảnh, video bằng AI: trợ lý bên phải, canvas, tạo ảnh và video theo
khung hình đầu và cuối, giữ bản gốc khi làm lại. Next.js 16, MySQL, Redis, Temporal, MinIO,
chạy bằng Docker Compose.

**Quyết định: không nhập mã vào hệ thống.** Năm lý do:

1. **Giấy phép.** Elastic License 2.0 cấm cung cấp phần mềm cho bên thứ ba dưới dạng dịch vụ
   lưu trữ hay quản lý. Đưa nó vào sản phẩm GITA365 cho khách là vi phạm, trừ khi xin phép riêng.
   Dùng nội bộ thì được.
2. **Chi phí.** Mọi việc tạo ảnh, video đều qua OpenRouter và tính tiền vào tài khoản của mình.
   Mã nguồn không có đường nào dùng mô hình chạy trên máy. Trái lệnh cấm chi tiêu AI trả phí.
3. **Dữ liệu.** Lời nhắc và ảnh tham chiếu được gửi sang nhà cung cấp mô hình.
4. **Độ chín.** Bản xem trước, "còn lỗi và chỗ thô"; không nhận đóng góp mã từ ngoài.
5. **Hạ tầng.** Thêm năm dịch vụ chạy nền, trong khi đường làm phim hiện có của GITA365 đã chạy
   miễn phí trên máy (FastWan, MuseTalk, Kaggle).

**Ý tưởng đáng học cho đường làm phim hiện có** (học cách làm, không chép mã):
- làm lại một kết quả thành bản mới mà vẫn giữ bản gốc;
- thông số theo từng mô hình: tỉ lệ khung, thời lượng, độ phân giải, vai trò ảnh tham chiếu;
- ba chế độ: khung đầu, khung đầu và cuối, ảnh tham chiếu;
- một trợ lý giữ bản tóm tắt dự án suốt quá trình làm.

Nếu sau này anh muốn dùng waoowaoo nội bộ: chạy trên một máy riêng, kho riêng, tài khoản
OpenRouter có trần chi tiêu, không đưa dữ liệu khách hàng vào. Đó là quyết định của chủ sở hữu.

## pbakaus/impeccable · commit d631a88 (8/10/2026) · Apache-2.0

Bộ hướng dẫn thiết kế cho trợ lý lập trình AI: một kỹ năng, 24 lệnh (soát, phê, đánh bóng…),
và 59 luật dò lỗi giao diện tất định chạy không cần mô hình AI. Viết bằng Rust, phát hành như một
chương trình chạy sẵn.

**Quyết định: lấy Ý TƯỞNG luật và bộ từ chung, viết lại bằng mã của mình. Không cài chương trình,
không cài hook, không chép tệp kỹ năng.**

| Phần | Quyết định | Lý do |
|---|---|---|
| Chương trình `impeccable` (Rust) | **Loại** | Bộ khởi chạy tải một tệp chạy được về `~/.impeccable/bin/` ở lần đầu dùng. Chạy tệp nhị phân tải từ mạng là mở một đường chuỗi cung ứng vào máy làm việc. |
| Hook tự chạy sau mỗi lần sửa tệp | **Loại** | Phải sửa `.claude/settings.json` và chạy mã ngoài mỗi lần sửa. Trái luật "không tự sửa mã", và để chủ sở hữu quyết. |
| 24 tệp lệnh (tiếng Anh) | **Loại** chép nguyên | Viết cho trang SaaS chung chung. Bộ từ chung thì giữ, viết lại thành `.claude/skills/gita-thiet-ke/` bằng tiếng Việt, gắn vào luật và token của kho này. |
| 59 luật dò | **Nhận ý tưởng 19 luật** → `tools/luat-thiet-ke.json` | Mã đo viết lại từ đầu bằng JS, chạy trên Playwright có sẵn: `tools/soat-thiet-ke.js` (trình duyệt) và `tools/thu-thiet-ke-tinh.mjs` (CI). Không chép một dòng mã nào. |
| Luật trùng cái đã có | Không lấy | Tràn ngang, nút nhỏ, chữ dưới 10px, ô nhập dưới 16px: `do-khung-man.js` đã đo. |
| Luật "chữ Inter, chữ Fraunces", "kem be", "tím–xanh" | Không lấy | Kho đã chốt phông Be Vietnam Pro + Playfair và màu thương hiệu lấy từ logo. Đo lại là đo lời khai đã chốt. |
| Luật "dùng gạch dài quá nhiều", "từ sáo quảng cáo" | Không lấy | Văn phong của kho dùng gạch dài đúng cách. Lời quảng cáo đã có bộ lọc QC riêng. |
| Ý `PRODUCT.md` / `DESIGN.md` | Không dựng tệp mới | Sự thật sản phẩm đã ở `CLAUDE.md`, token đã ở `:root` của `style.css`. Tệp thứ hai sẽ là bản chép thứ hai. Bộ đo đọc thẳng `style.css`. |

**Lần chạy đầu đã tìm ra lỗi thật** (đều đã sửa, trừ chỗ nằm trong gói nghề `gita-nghe.js` vốn phải
giữ nguyên từng byte):
- favicon vẫn dùng màu vàng cũ `#F5B942` đã bị cấm, viết dạng `%23F5B942` nên phép kiểm cũ không thấy;
- 17 chỗ dùng `--gold-2` (xanh nhạt, 2,91:1) làm màu chữ — nhãn đang chọn, câu trích, tab đang mở;
- 52 chỗ chữ cảnh báo gõ tay `#B4720F` (3,92:1) → token `--warn`, đổi được theo nền Sáng/Tối;
- bảng màu biểu đồ có hai tên cho cùng một xanh nhạt;
- 8 chỗ tiêu đề nhảy bậc (h1 → h3/h4/h5) → đổi sang `h2` đúng bậc, giữ cỡ chữ bằng cách đổi luôn bộ chọn CSS;
- chữ đặt lên màu biểu đồ: trắng ở nền Sáng, mực sẫm ở nền Tối (token `--chu-tren-mau`) — chữ trắng trên tám màu sáng của nền Tối chỉ còn 1,7–3,3:1.

**Chưa làm, nói thẳng:** 68 màn còn chữ dưới chuẩn tương phản (trần TK01) — phần lớn là màu dữ liệu gõ tay
(`#8B5CF6`, `#10B981`…) và 118 chỗ `#B4720F` nằm trong gói nghề không được sửa; 716 chỗ đặt màu chữ bằng mã hex
(trần TK19); bộ đo trên trình duyệt chỉ đo nền Sáng; luật tương phản bỏ qua chữ nằm trên nền chuyển sắc (nút
`.btn.pri` chữ nâu sẫm trên dải xanh–vàng–đỏ là chỗ cần mắt người xem).

**Các luật khác của impeccable không lấy ở bản này** (có thể thêm sau, mỗi luật kèm tự thử):
`text-overflow` · `clipped-overflow-container` · `text-occlusion` (chữ bị cắt trong một ô — tên tiếng Việt dài),
`cramped-padding`, `heading-rhythm`, `repeated-container-text`. Lệnh `onboard` và `optimize` chưa chuyển thành
lệnh riêng: phần trạng thái trống nằm trong lệnh `cứng`, tốc độ thì `do-tai-may-chu.js` đã đo.

Ghi công: ý tưởng luật dò © Paul Bakaus và cộng sự, giấy phép Apache-2.0
(https://github.com/pbakaus/impeccable). Bản hướng dẫn nền tảng trong kho ấy lại lấy từ
ehmo/platform-design-skills (MIT) — kho này không dùng phần ấy.
