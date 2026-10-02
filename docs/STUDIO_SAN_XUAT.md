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
