# Xưởng phim AI GITA365 — Kiểm kê M1 (04/10/2026)

Kiểm kê theo chỉ dẫn triển khai và nghiệm thu ngày 04/10/2026. Phân loại:
**IMPLEMENTED_AND_VERIFIED** (chạy thật, có chứng cứ) · **IMPLEMENTED_NOT_LIVE_VERIFIED** (đã code + test, chưa chứng minh live) · **BLOCKED** (thiếu đầu vào vận hành, kèm cách gỡ) · **NOT_IMPLEMENTED** (chưa làm, không giả vờ có).

Commit gốc trước đợt triển khai: `f91dfa3` (nhánh `phim-tu-dong`). Toàn bộ thay đổi M1 là **thêm mới thuần tuý** — không xoá/sửa chức năng cũ, không migration phá dữ liệu. Rollback: `git revert` các commit của PR này hoặc `git reset --hard f91dfa3` trên nhánh triển khai.

## 1. Bảng chức năng

| Chức năng | Trạng thái | Chứng cứ / cách gỡ |
|---|---|---|
| Vẽ ảnh cảnh giữ đúng danh tính (klein 4B + ảnh tham chiếu) | IMPLEMENTED_AND_VERIFIED | 4 cảnh `mau-gita-365` v4 cùng một gương mặt, đã xem bằng mắt 04/10/2026 |
| Ảnh nhân vật do chủ hệ chọn làm chuẩn | IMPLEMENTED_AND_VERIFIED | `tools/dat-anh-nhan-vat.mjs` + hạt `nvmau-chu`; test 38/38 |
| Clip chuyển động nhẹ (bước/quay đầu/giơ tay ~2 giây) LTX-Video trên Kaggle T4 | IMPLEMENTED_AND_VERIFIED | Chủ hệ xác nhận hoạt động; hàng chờ `quay_viec` loại `vd` |
| Khớp môi cảnh nói (SadTalker trên máy GitHub) | IMPLEMENTED_AND_VERIFIED | Chủ hệ xác nhận "cảnh nói mấp máy môi khớp lời"; việc loại `moi` |
| Hợp đồng shot (schema + validation server-side) | IMPLEMENTED_NOT_LIVE_VERIFIED | `may-chu/hop-dong-shot.js`, test 17/17 — chưa gắn vào endpoint API |
| Sổ năng lực thật + route thay thế/BLOCKED | IMPLEMENTED_NOT_LIVE_VERIFIED | `NANG_LUC` + `chonRoute()`; doctor liệt kê đúng 2 shot bị chặn |
| Doctor (báo thiếu binding/secret/capability) | IMPLEMENTED_AND_VERIFIED | `node tools/bac-si-xuong.mjs` chạy thật trên máy triển khai |
| Fixture phim thử 10 shot × 8 giây (gia đình + Trainer Trương Nhật Quang) | IMPLEMENTED_NOT_LIVE_VERIFIED | `xuong-phim/phim-thu/` qua hợp đồng 10/10, tổng đúng 80 giây |
| TTS tiếng Việt nội bộ (giọng theo nhân vật) | IMPLEMENTED_NOT_LIVE_VERIFIED | Việc `tts` (edge-tts vi-VN trên Kaggle, 0đ): `quayGiongNoi` + nhánh tts trong `xuong-phim-studio.py`; test 78/78. Chưa có job live → giữ mức này tới khi máy Kaggle chạy thật |
| Phim hoàn chỉnh tự động (đề bài → kịch bản → cảnh LTX → thoại → khớp môi → ghép → SRT → branding) | IMPLEMENTED_NOT_LIVE_VERIFIED | Việc `film` (`quayPhimMoi`, 4 mẫu: dao_tao/huan_luyen/hotro_khach/gita_hanh_trinh) + notebook `may-quay-kaggle/xuong-phim-studio.py` theo chuẩn V21 (checkpoint resume, QC tự quay lại, MuseTalk/Wav2Lip tùy chọn). Chờ chạy live đầu tiên |
| Nhân vật chuẩn được khóa (trainer/MC/giảng viên/gia đình) | IMPLEMENTED_NOT_LIVE_VERIFIED | `may-chu/nhan-vat-chuan.js` + `tools/dat-nhan-vat-chuan.mjs` + `GET /quay/nvchuan`; test 47/47. Ảnh khóa nằm R2, không commit kho mã |
| Trao đồ/chạm nhiều người (shot 06, 09) | BLOCKED | `multi_person_contact` chưa có provider xác minh → route video diễn mẫu người thật (`handoff_master_take_01`) hoặc animatic 3D; cấm hạ xuống ảnh chuyển động |
| Đám đông 100 người đúng danh tính | BLOCKED | Không nghiệm thu bằng prompt; route footage/diễn mẫu + cảnh rộng/cận |
| Chạy/đánh/nhảy bằng LTX-Video | BLOCKED | Đo thực tế: máy chỉ rung nhẹ. Gỡ: video diễn mẫu hoặc provider performance transfer trả phí (chưa được cấp ngân sách) |
| Web Studio React (dashboard, character room, shot editor, review room…) | NOT_IMPLEMENTED | UI hiện là trang xem tĩnh + hàng chờ; chưa dựng studio React (M2+) |
| Provider adapter trả phí (Runway/Wan…) + sổ chi phí | NOT_IMPLEMENTED | Chưa có tài khoản/ngân sách được cấp; `packages/providers` tương đương chưa dựng |
| Workflows/Queues/DO điều phối, outbox, DLQ | NOT_IMPLEMENTED | Hàng chờ hiện là D1 + lease thủ công (`quay_viec`), chưa qua Cloudflare Queues/Workflows |
| Timeline compile + render worker FFmpeg + export manifest | NOT_IMPLEMENTED | M4; hiện trình xem ghép cảnh phía trình duyệt, chưa xuất MP4 master |
| QA máy (ffprobe, drift, freeze warning) + phòng duyệt | NOT_IMPLEMENTED | M4; hiện QA bằng mắt qua contact sheet thủ công |

## 2. Nguyên tắc đang được giữ

- Không GPU trong Cloudflare Worker; compute (LTX-Video, SadTalker) chạy máy ngoài, Worker chỉ làm control plane.
- GitHub Actions chỉ build/test/deploy + máy khớp môi CPU; không đóng vai GPU sản xuất.
- Không render giả: thiếu capability → BLOCKED đúng tên; trình xem báo "đang quay" thay vì ghép ảnh tĩnh giả chuyển động.
- Không commit model weights/file media lớn vào GitHub; ảnh/clip nằm trong R2.

## 3. Lộ trình tiếp theo (theo chỉ dẫn §15)

- **M2 — vertical slice**: 1 shot có thoại chạy đầy đủ API → R2 → review → MP4. Phụ thuộc: gỡ BLOCKED TTS.
- **M3 — tương tác**: shot 06 trao giấy bằng video diễn mẫu; giải occlusion trước khi nhân lên 5 người.
- **M4 — pilot**: render MP4 80 giây từ 10 shot fixture đã duyệt + báo cáo chi phí.
- **M5/M6**: serial 5 tập × 10 phút, hardening vận hành.
