# Phim thử GITA365 — "Trainer Trương Nhật Quang coaching gia đình"

Fixture cho pilot 80 giây (10 shot × 8 giây, 16:9, 24fps) theo chỉ dẫn
04/10/2026 mục 12. **Đây là metadata sản xuất, dùng chung pipeline với
phim dài — không phải demo tách biệt.**

## Cấu trúc

- `nhan-vat.json` — 5 nhân vật (Trainer + bố + mẹ + con gái lớp 9 + con
  trai lớp 6), bối cảnh `living_room_v1`, quy tắc chung.
- `pilot_s01.json` … `pilot_s10.json` — shot spec theo hợp đồng
  `may-chu/hop-dong-shot.js`: camera, actions (chỉ dẫn + tiêu chí QA),
  dialogues (kèm `audioAssetId` của stem WAV tương lai), continuity
  in/out, `requiredCapabilities`, `qaRequirements`, `maxAttempts`.

## Kiểm tra

```powershell
node tools/thu-hop-dong-shot.mjs   # 10/10 fixture phải qua hợp đồng
node tools/bac-si-xuong.mjs        # liệt kê shot đang BLOCKED + cách gỡ
```

## Trạng thái route (tự động theo sổ năng lực thật)

- Shot 02, 03, 04, 08, 10 (nói/lắng nghe): cần `lip_sync` (đã xác minh
  qua SadTalker) + `audio_dialogue` (**BLOCKED**: thiếu TTS tiếng Việt
  nội bộ — gỡ bằng bước edge-tts trên máy Kaggle/GitHub).
- Shot 05 (đi lại): `chuyen_dong_nhe` đã xác minh qua LTX-Video Kaggle.
- Shot 06 (trao giấy), 09 (đặt tay chung): `multi_person_contact`
  **BLOCKED_UNSUPPORTED_CAPABILITY** → route video diễn mẫu người thật
  (`handoff_master_take_01`) hoặc animatic 3D; tuyệt đối không hạ xuống
  ảnh chuyển động.
- Shot 01, 07: chỉ cần `reference_identity` (đã xác minh qua klein 4B +
  ảnh tham chiếu; cảnh 5 người dựng tổ hợp rộng + cận vì tối đa 4
  ảnh tham chiếu/lần vẽ).

## Trước khi render pilot

1. Duyệt bộ tham chiếu (`*_refs_v1`) cho đủ 5 nhân vật — vẽ chân dung
   từng người bằng klein 4B theo `moTaVe` trong `nhan-vat.json`, chủ hệ
   duyệt, đóng băng revision.
2. Gỡ BLOCKED TTS để có stem WAV từng `audioAssetId` (sample rate thống
   nhất, nghe kiểm tên riêng và tiếng Việt).
3. Quay video diễn mẫu cho shot 06/09.
4. Render → QA theo cổng trong `ACCEPTANCE.md`.
