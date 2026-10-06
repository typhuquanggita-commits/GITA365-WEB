# GITA 365 · Xưởng phim AI — Chạy TỰ ĐỘNG (web → phim)

Sau khi nhập xong nhân vật & phân cảnh trong app GITA, bấm **"Gửi sản xuất
tự động"** là cả dây chuyền tự chạy ra phim:

```
Web GITA → Cloudflare Worker → GitHub Action → Kaggle (GPU) → phim → R2 → Web GITA
```

> ⚠️ **Thật lòng:** phần code đã viết đầy đủ, nhưng cần anh/chị **tạo khoá
> một lần** ở 3 nơi (Kaggle · GitHub · Cloudflare). Em **chưa chạy thử được**
> (cần tài khoản của anh/chị). Lần chạy đầu gần như chắc có lỗi nhỏ (phiên
> bản thư viện, tên dataset…) — gửi em log, em sửa cùng. Kaggle free có giới
> hạn ~30 giờ GPU/tuần và có hàng đợi, nên mỗi phim mất từ ~30 phút đến vài giờ.

## Cài một lần (≈ 30–45 phút)

### 1) Kaggle (động cơ GPU)
1. Tạo tài khoản, **Settings → Phone verification** để mở GPU.
2. **Account → Create New API Token** → tải `kaggle.json` (có `username`, `key`).
3. Tạo **Dataset cast** chứa ảnh mặt & giọng mẫu: tải lên các file
   `nhan-vat/<id>.png` và `giong/<id>.wav` (id khớp nhân vật trong app, vd
   `nv-nam.png`, `nv-nu.png`, `nv-nam.wav`). Đặt tên dataset, vd `user/gita-cast`.

### 2) Cloudflare (trạm điều phối + kho)
1. **R2 → Create bucket** tên `gita-phim`.
2. **R2 → Manage API Tokens → Create** (quyền Object Read & Write) → lấy
   `Access Key ID`, `Secret Access Key`, và **Account ID** (góc phải dashboard).
3. Cài wrangler và triển khai Worker:
   ```bash
   cd xuong-phim-ai/tu-dong/worker
   npm install
   npx wrangler login
   npx wrangler secret put SUBMIT_TOKEN   # tự đặt 1 mật khẩu dài, bí mật
   npx wrangler secret put GH_PAT         # token GitHub (bước 3)
   npx wrangler secret put GH_OWNER       # vd: typhuquanggita-commits
   npx wrangler secret put GH_REPO        # vd: GITA365-WEB
   npx wrangler deploy
   ```
   Ghi lại **URL Worker** (vd `https://gita-xuong-phim.<ten>.workers.dev`).

### 3) GitHub (bộ chạy)
1. **Settings → Developer settings → Personal access tokens** → tạo token có
   quyền `repo` (hoặc fine-grained: Contents + Metadata, repo này). Dán vào
   `GH_PAT` của Worker ở bước 2.
2. Trong repo → **Settings → Secrets and variables → Actions → New secret**,
   thêm đủ: `KAGGLE_USERNAME`, `KAGGLE_KEY`, `KAGGLE_CAST_DATASET`
   (= `user/gita-cast`), `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`,
   `R2_SECRET_ACCESS_KEY`, `R2_BUCKET` (= `gita-phim`).
3. Workflow `.github/workflows/dung-phim.yml` đã có sẵn trong repo.

### 4) Web app GITA
- Mở màn **Sản xuất phim AI → tab "Tự động"** → dán **URL Worker** và
  **SUBMIT_TOKEN** (lưu trên máy anh/chị, KHÔNG đẩy lên mạng/mã nguồn).

## Dùng hằng ngày
1. Dựng nhân vật & phân cảnh trong app.
2. Tab **Tự động → "Gửi sản xuất tự động"**.
3. App hiện tiến độ (queued → running → done). Xong thì có nút **xem/tải phim**.

## Nâng cấp khi cần
- Nhanh/ổn định hơn Kaggle → đổi bộ chạy sang GPU thuê (Runpod/Modal): giữ
  nguyên Worker + app, chỉ thay phần "đẩy Kaggle" trong Action bằng gọi API
  nhà cung cấp đó.
- Chất lượng cao nhất cho cảnh then chốt → chèn Veo/Kling (có phí) ở một
  bước, phần còn lại vẫn free.

## An toàn
- Mọi khoá bí mật nằm ở **Cloudflare Secret** và **GitHub Secret**, KHÔNG
  trong mã nguồn. App chỉ giữ URL Worker + SUBMIT_TOKEN trên máy người dùng.
- Worker chặn người lạ bằng `SUBMIT_TOKEN`. Nên đặt token dài, đổi định kỳ.
