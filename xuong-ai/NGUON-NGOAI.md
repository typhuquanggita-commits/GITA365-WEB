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
