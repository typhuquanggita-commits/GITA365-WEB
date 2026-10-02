# Studio sản xuất

Studio trên Pages chỉ là lớp biên tập và xem thử cục bộ. Ảnh, âm thanh và
micro không được đưa lên Cloudflare Worker; Worker chỉ lưu metadata, quyền,
quyết định QC và hộ chiếu phát hành đã ký.

Luồng bắt buộc: `draft` → `scriptApproved` → `rightsApproved` → `rendered`
→ `qcPassed` → `published`. Người tạo dự án không được tự duyệt QC; chỉ R01
được phát hành và ký hộ chiếu.

Render MP4, FFmpeg, Remotion, VideoLingo, Video2X hoặc LongCat-Video chỉ được
đặt trong dịch vụ/container tách biệt sau khi hoàn tất đánh giá license, quyền
sử dụng media, giới hạn chi phí và chính sách dữ liệu. Không đưa API key, GPU
endpoint, video gốc, transcript riêng tư hoặc model weights vào Pages/Worker.

Cognee, nếu dùng, chỉ lập chỉ mục brief, script đã duyệt, metadata asset và
quyết định sản xuất; không ingest mặc định media hoặc hồ sơ khách. Danh sách
`cs-video-courses` chỉ phục vụ nghiên cứu nội bộ, không là nguồn để sao chép,
tải về, đào tạo hay phát hành lại nội dung.

## Manifest V20 và ranh giới renderer

V20 là chuẩn bàn giao Studio, không phải codec hoặc lời hứa rằng Pages có thể
render phim. Mỗi dự án V20 ghi rõ template, tỷ lệ `9:16`/`16:9`/`1:1`, độ
phân giải chuẩn, FPS 24/25/30/60, kênh phát hành, thời lượng tối đa 300 giây
và ngân sách render. Mỗi cảnh mang shot, lens, camera, transition và track
hình/nhân vật/camera/giọng/nhạc/phụ đề/transition.

Renderer container nhận **chỉ** manifest đã qua `rightsApproved`, lấy asset từ
kho riêng đã được cấp quyền, rồi trả `jobId`, checksum MP4, checksum thumbnail,
thời lượng và số cảnh. Không truyền media qua Pages hoặc Worker. Manifest GLB
chỉ chấp nhận mô hình đã cấp phép; renderer phải kiểm rig, animation clip, PBR
material, ánh sáng, shadow và post-processing. Preview WebGL cục bộ vẫn là
fallback kỹ thuật, không được tuyên bố là render 3D cuối.

QC V20 bắt buộc xác nhận quyền asset, âm thanh/loudness, subtitle timing,
safe-area, nháy sáng, thương hiệu và khả năng tiếp cận. Các chỉ số pilot tối
thiểu: thời gian render, chi phí render, số vòng sửa subtitle, lỗi QC và phản
hồi đội biên tập. Chỉ renderer/GPU tách biệt được phép chạy FFmpeg, Video2X,
VideoLingo hoặc LongCat sau khi có quyền sử dụng, đánh giá license và duyệt
người thật.
