# Nghiệm thu xưởng phim AI GITA365 (ACCEPTANCE)

Nguồn: chỉ dẫn triển khai và nghiệm thu 04/10/2026, mục 12 và 17.
Chỉ được tuyên bố "xưởng phim hoạt động" khi **render pilot thực tế đạt
toàn bộ cổng dưới đây**. Không dùng số dòng code, số trang tài liệu hay
phần trăm tự ước lượng để thay kết quả.

## Cổng nghiệm thu phim thử (80 giây · 10 shot)

- [ ] MP4 60–90 giây thật, tải về và phát kiểm tra được (không slideshow).
- [ ] Tất cả 10 shot (`xuong-phim/phim-thu/pilot_s01..s10.json`) đã qua human QA và được duyệt có timestamp.
- [ ] Shot 01: đủ 5 danh tính (Trainer Trương Nhật Quang, bố, mẹ, con gái lớp 9, con trai lớp 6), bố cục được duyệt.
- [ ] Shot 02–04: người nói đúng khẩu hình, đúng giọng stem; người nghe phản ứng; chuyển lượt tự nhiên.
- [ ] Shot 05: bố đứng dậy **đi** đến bảng mục tiêu (chuyển động toàn thân, continuity khung đầu/cuối).
- [ ] Shot 06: giấy cam kết **đổi người giữ** trainer → con trai; tay/che khuất hợp lý; giấy không biến mất.
- [ ] Shot 07: tay/bút/điểm chỉ đúng; chữ trên thẻ dựng hậu kỳ bằng lớp chữ.
- [ ] Shot 08: ít nhất hai người cùng chuyển động trong khung.
- [ ] Shot 09: nhiều người đặt tay, không xuyên tay.
- [ ] Shot 10: cả nhà đứng lên, giữ danh tính/trang phục, âm thanh kết.
- [ ] Machine QA: file decode được; duration sai ≤ 1 frame so với timeline; drift audio/video cuối tập ≤ 2 frame; không thiếu audio track; không black segment ngoài chủ ý.
- [ ] Export manifest kèm: input assets/hash, approved revisions, model versions, độ phân giải + FPS nguồn, lịch sử upscale, audio stems, QA status, tóm tắt sổ chi phí.
- [ ] Không gắn nhãn 4K cho file upscale — ghi rõ nguồn và xử lý.

## Cổng vận hành

- [ ] `node tools/bac-si-xuong.mjs` không còn mục THIEU bắt buộc.
- [ ] `node tools/thu-hop-dong-shot.mjs` đạt 17/17.
- [ ] Tenant/khách A không đọc được media/job của B; upload kiểm magic bytes + checksum.
- [ ] Retry/timeout không submit trùng (idempotency); callback lặp không sinh thêm chi phí.
- [ ] Shot revision đổi làm approval cũ mất hiệu lực; không ghi đè file đã duyệt.

## Trạng thái hiện tại (04/10/2026)

Phim thử chưa render — đang ở **M1 xong, chuẩn bị M2**. Các mục BLOCKED
và cách gỡ: xem `docs/XUONG-PHIM-KIEM-KE.md`. Nếu một cổng không đạt khi
render thật, ghi trạng thái PARTIAL/FAILED với lỗi rõ ràng — không tuyên
bố hoàn thành.
