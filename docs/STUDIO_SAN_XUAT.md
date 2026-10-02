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

## Hệ thống video theo vai

Studio lập backlog theo toàn bộ màn trong điều hướng GITA và bắt đầu bằng đợt
10 màn phục vụ trực tiếp onboarding, công việc, Coach, Tư vấn và chăm sóc
khách. Mỗi brief dài 4 phút, có bối cảnh, tình huống, chỉ dẫn, bằng chứng và
bước tiếp theo tự nguyện; brief không phải video đã hoàn thành.

Mỗi video phải khai nguồn đã kiểm và chuyên gia duyệt trước `scriptApproved`.
Các khung chuyện được chọn theo mục đích: cấu trúc giáo dục/coach ưu tiên cho
hướng dẫn, còn PAS, BAB, AIDA, Star–Chain–Hook, 4P và StoryBrand chỉ mở cho
nội dung tiếp thị đã được người thật duyệt. Không dùng khan hiếm, gây áp lực,
so sánh tuyệt đối hoặc lời hứa không có bằng chứng. Luồng tiếp thị vẫn phải
qua các cửa QC hiện có trước khi phát hành.

## Kho giọng hai tầng

`studioVoice` là danh mục metadata-only: không lưu mẫu giọng, MP3/WAV, URL
media hoặc API key. Tầng `licensed` ghi giọng tổng hợp được cấp phép; tầng
`verifiedPrivate` chỉ dùng khi hồ sơ có consent đã xác minh, người xác nhận,
phạm vi dùng và checksum mẫu. R01/R02 quản trị danh mục; chỉ giọng
`approved` mới được gắn vào dự án.

Mỗi giọng được duyệt cần `voiceId`, nhà cung cấp, locale, phong cách, phạm vi
dùng, tham chiếu giấy phép, người đánh giá, chi phí/phút và kết quả nghe mù cho
bốn ngữ cảnh: đào tạo, tư vấn, kể chuyện, gia đình. Bắt đầu danh mục bằng
Azure Speech cho `vi-VN` và English; Google Cloud TTS chỉ được thêm sau cùng
bài thử English. Azure Professional Voice hoặc ElevenLabs Professional Voice
Clone chỉ dùng qua luồng xác minh chính chủ của nhà cung cấp.

Renderer private nhận `voiceAssets` gồm provenance và SHA-256 audio, không
nhận tệp/URL audio. Synthesis (nếu được duyệt) chạy ngoài Pages/Worker, dùng
secret manager của renderer; MP3 và MP4 được QC độc lập trước khi Studio phát
hành.

## Video hành trình khách hàng

Video hành trình dùng để ghi nhận và khích lệ thay đổi của chính khách hàng:
chào hành trình, ghi nhận mốc, điều chỉnh nhịp hoặc tổng kết. Nó chỉ đọc các
tín hiệu tiến bộ do khách hàng tự ghi ở thiết bị, so với chính họ ở kỳ trước;
không xếp hạng, so sánh giữa khách hàng hoặc suy đoán tình trạng cá nhân.

Trước duyệt kịch bản, Studio yêu cầu sự đồng ý rõ ràng, phạm vi chia sẻ
(`private`, Coach phụ trách hoặc gia đình đã đồng ý) và tên người rà nội dung.
Không có đồng ý riêng thì không dùng ảnh, video hoặc giọng khách hàng. Manifest
bị chặn nếu mang các trường nhận dạng/hồ sơ hoặc xếp hạng. Khách hàng có quyền
từ chối, dừng tham gia hoặc yêu cầu gỡ bản video; các lựa chọn đó không làm
giảm quyền được Coach/Tư vấn hỗ trợ.
