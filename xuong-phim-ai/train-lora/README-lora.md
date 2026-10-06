# GITA 365 · Train LoRA khuôn mặt nhân vật (ra đúng mặt nhất)

LoRA = "khoá khuôn mặt" một người từ vài tấm ảnh. Train một lần cho mỗi nhân
vật → mọi cảnh phim sau ra **đúng mặt người đó**, nhất quán qua mọi tập.

## Chuẩn bị ảnh (quan trọng nhất)

Mỗi nhân vật cần **10–20 ảnh** của **đúng một người**:
- Nhiều góc mặt (chính diện, nghiêng nhẹ), vài biểu cảm, vài bối cảnh/ánh sáng.
- Mặt rõ, nét, không che; nền đa dạng càng tốt.
- Dùng chính bộ ảnh mẫu anh/chị đã có; thiếu thì sinh thêm từ 1 ảnh gốc bằng
  InstantID rồi lọc tay những tấm giống nhất.

Đặt vào thư mục theo **id nhân vật** (lấy trong app):
```
anh-train/nv-trainer/*.png     anh-train/nv-mc/*.png
anh-train/nv-bo/*.png          anh-train/nv-me/*.png
anh-train/nv-congai/*.png      anh-train/nv-contrai/*.png
```

## Train trên Kaggle (GPU)

```bash
# kiểm ảnh trước (không cần GPU)
python train_lora.py --nhan-vat nv-trainer --plan

# train thật (bật GPU T4/P100)
python train_lora.py --nhan-vat nv-trainer
python train_lora.py --nhan-vat nv-mc
# … lần lượt từng nhân vật
```

Ra file `lora/<id>.safetensors`. Mỗi LoRA ~20–60 phút trên T4 (tuỳ số bước).

## Gắn vào dây chuyền

1. Tải các file `lora/<id>.safetensors` lên **Kaggle dataset cast** (cùng chỗ
   với `nhan-vat/` và `giong/`), trong thư mục `lora/`.
2. Trong app → **Sản xuất phim AI → Kho nhân vật → Sửa** nhân vật → điền ô
   **LoRA** = chính **id** đó (vd `nv-trainer`). Lưu.
3. Từ đó app tự thêm **trigger** (`gitanvtrainer`…) vào prompt, và động cơ
   Kaggle tự nạp LoRA đúng người khi sinh ảnh. Mặt sẽ ra đúng và nhất quán.

## Mẹo & giới hạn (thật)

- **Hết VRAM (OOM) trên T4:** chạy lại với `--res 640` hoặc `--dim 8`.
- Ảnh train **xấu/ít góc** → LoRA ra mặt kém; chất lượng LoRA phụ thuộc gần
  như hoàn toàn vào bộ ảnh đầu vào.
- LoRA khoá **mặt + nét nhận dạng**; trang phục/bối cảnh vẫn do prompt điều
  khiển, nên đổi cảnh thoải mái mà vẫn đúng người.
- Chưa chạy thử ở đây (không có GPU) — lần đầu có thể cần chỉnh phiên bản thư
  viện; gửi em log, em sửa cùng.
