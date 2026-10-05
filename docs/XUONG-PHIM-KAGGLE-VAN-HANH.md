# Xưởng phim Kaggle — Vận hành sản xuất liên tục (05/10/2026)

Hướng dẫn vận hành chuẩn cho **xưởng Kaggle full-film**: đặt đề bài → máy
Kaggle quay trọn bộ phim (kịch bản → cảnh LTX-Video → thoại → khớp môi →
ghép + phụ đề + logo) → nộp MP4 về máy chủ → anh Quang **tải về máy** →
**dọn kho** → **quay việc tiếp theo**. Vòng đời có **2 cổng xác nhận** để
không bao giờ tràn dung lượng và không mất phim.

Màn điều khiển: **Xưởng phim ngắn AI → “🎥 Xưởng Kaggle — sản xuất phim
liên tục (0 đồng)”**. Chỉ Super Admin (R01) thấy và dùng được.

---

## 1. Ba cỗ máy nối với nhau

| Nơi | Vai trò | Xác thực |
|---|---|---|
| **Trình duyệt** (web app) | Đặt đề bài, theo dõi, tải về, dọn kho | Phiên đăng nhập máy chủ (token 12 giờ) |
| **Cloudflare Worker** (`may-chu/`) | Control plane: hàng chờ D1 (`quay_viec`), kho R2, cấp phát việc | — |
| **Kaggle T4** (`may-quay-kaggle/xuong-phim-studio.py`) | GPU sản xuất phim | Khoá xưởng `X-Khoa-Quay` (KHÔNG dùng phiên web) |

> **Điểm then chốt:** máy Kaggle xác thực bằng *khoá xưởng*, không phải
> phiên web. Nên **phim đã đặt vẫn quay tiếp dù phiên web của anh Quang
> hết hạn.** Phiên web chỉ cần thiết lúc *đặt / theo dõi / dọn* từ trang.

---

## 2. Bật máy Kaggle (làm một lần mỗi phiên, ~10 phút)

> ⚠️ **ĐỪNG copy nội dung tệp `.ipynb` rồi dán vào ô code.** Tệp `.ipynb`
> là JSON; dán vào ô code rồi Run sẽ báo
> `NameError: name 'null' is not defined` (vì `null` là từ của JSON, không
> phải Python). Có hai cách ĐÚNG dưới đây — **cách A (tải tệp) là chắc
> nhất.**

**Cách A — Tải tệp notebook lên (khuyên dùng, không copy-paste):**
1. Tải `may-quay-kaggle/xuong-phim-studio.ipynb` từ kho này về máy.
2. Vào **kaggle.com → Create → New Notebook → File → Import Notebook →
   Upload** (hoặc kéo-thả tệp `.ipynb`).
3. Phải: **Settings → Accelerator → GPU T4 x2**, **Internet → On**.
4. Phải: **Add-ons → Secrets → Add** → tên `GITA_KHOA_QUAY` = khoá xưởng
   quay (GitHub secret `GITA_KHOA_XUONG_QUAY`).
5. **Run All**.

**Cách B — Dán mã Python (nếu không tải tệp):**
1. New Notebook → đặt GPU T4 + Internet On + Secret `GITA_KHOA_QUAY` như trên.
2. Mở `may-quay-kaggle/xuong-phim-studio.py` (tệp **`.py`**, KHÔNG phải
   `.ipynb`) → **chọn tất cả → copy → dán vào MỘT ô code** → **Run All**.

In `🏭 Xưởng phim sẵn sàng…` là máy đã nhận việc. Để yên — máy tự quay,
tự nộp.

> Notebook cũ `quay-kaggle.ipynb`/`.py` chỉ quay **clip đơn lẻ** (việc
> `vd`), KHÔNG quay phim nguyên bộ. Muốn phim trọn bộ phải chạy
> `xuong-phim-studio` (máy báo tên `kaggle-studio-…`).
>
> Ba tệp `.ipynb` được dựng tự động từ `.py` bằng
> `node tools/py-sang-ipynb.mjs` — hai bản luôn khớp.

## 2b. Khoá xưởng quay — một giá trị, hai nơi phải TRÙNG nhau

Máy Kaggle xác thực với máy chủ bằng **một khoá chung**. Khoá đó phải
giống hệt ở hai nơi:

| Nơi | Tên khoá | Dùng để |
|---|---|---|
| **Kaggle** (Add-ons → Secrets) | `GITA_KHOA_QUAY` | Máy Kaggle gửi kèm mỗi lời gọi (`X-Khoa-Quay`) |
| **Cloudflare Worker** | `GITA_KHOA_XUONG_QUAY` | Máy chủ đối chiếu để chấp nhận máy Kaggle |

Nguồn khoá cho Worker: **GitHub secret `GITA_KHOA_XUONG_QUAY`** của kho
GITA365-WEB — khi deploy (`deploy.yml`) nó được nạp vào Worker tự động.

**Lấy/đặt giá trị:**

- *Đã có khoá cũ (lưu đâu đó)* → dán đúng giá trị đó vào Kaggle secret
  `GITA_KHOA_QUAY`. Xong.
- *Không nhớ khoá* (GitHub/Cloudflare secret **không đọc lại được**) →
  sinh khoá mới rồi đặt vào **cả hai** nơi:
  1. Sinh khoá (chạy ở máy anh chị, **không gửi qua chat**):
     ```bash
     openssl rand -hex 32        # hoặc:
     python3 -c "import secrets; print(secrets.token_hex(32))"
     ```
  2. Dán vào **Kaggle** → Add-ons → Secrets → `GITA_KHOA_QUAY` (bật
     Attach to notebook).
  3. Đặt cùng giá trị cho **Worker**:
     - Cách tự động: GitHub → kho GITA365-WEB → Settings → Secrets and
       variables → Actions → `GITA_KHOA_XUONG_QUAY` (New/Update) → rồi
       deploy lại (merge vào `main`, hoặc chạy lại workflow Deploy).
     - Cách tay: `cd may-chu && npx wrangler secret put GITA_KHOA_XUONG_QUAY`
       (dán cùng giá trị) → `npx wrangler deploy`.

> Hai nơi lệch nhau → máy Kaggle bị `401 Sai khoá`. Thiếu hẳn ở Kaggle →
> `AssertionError: Thiếu khoá GITA_KHOA_QUAY`.

---

## 3. Vòng đời sản xuất — 2 cổng xác nhận

```
Đặt đề bài  ──►  Kaggle quay  ──►  ✅ xong: hiện trên web + nút Tải về
                                         │
                            [CỔNG 1] ⬇ Tải phim về máy anh Quang
                                         │
                            [CỔNG 2] ✅ Đã tải — Dọn kho (giải phóng R2 ngay)
                                         │
                                   ▶ Quay việc tiếp theo (thả việc kế trong hàng đợi)
```

### Cách làm trên màn hình

1. **Đặt phim**
   - Điền *Tiêu đề · Loại phim · Nhân vật chính · Số cảnh · Phạm vi* và
     **đề bài** (ít nhất 8 ký tự).
   - **🎬 Đặt & quay ngay** — gửi lên Kaggle luôn (một phim).
   - **➕ Thêm vào hàng đợi** — xếp nhiều đề bài, quay dần từng cái.

2. **Theo dõi** — mục *“Việc đã đặt”* tự cập nhật 20 giây/lần:
   `⏳ chờ` → `🎬 đang quay` → `✅ xong lúc …`.

3. **CỔNG 1 — ⬇ Tải về máy**: tải thẳng tệp MP4 xuống máy anh Quang (bản
   gốc để lưu/đăng). Phim đồng thời xem được ngay trên web qua nút **Mở**.

4. **CỔNG 2 — ✅ Đã tải — Dọn kho**: xác nhận đã tải xong → máy chủ xoá
   tệp trong R2 **ngay** (không đợi lịch dọn 7 ngày), giải phóng dung
   lượng. Sau khi dọn, phim không mở lại trên web được — chỉ còn bản trên
   máy anh Quang.

5. **▶ Quay việc tiếp theo**: thả đề bài kế trong hàng đợi lên Kaggle.
   Nút này **khoá** khi còn phim đang chờ/đang quay — mỗi lúc chỉ một
   việc, để không tràn dung lượng và dễ kiểm soát.

> Phim nào quên dọn vẫn **tự xoá sau 7 ngày** (lịch `donQuay`). Cổng 2 chỉ
> để giải phóng **ngay** khi anh Quang đã tải về.

### Nếu phiên web hết hạn giữa chừng

Màn hiện ô đỏ **“🔒 Phiên máy chủ đã hết hạn”** ngay trong xưởng: nhập
mật khẩu máy chủ → **Đăng nhập lại & tiếp tục**. Việc đang làm (đặt/dọn)
tự chạy tiếp, không phải thao tác lại. Máy Kaggle suốt lúc đó vẫn quay
bình thường.

---

## 4. Quay dựng chuẩn — để phim đẹp, nhân vật không đổi mặt

1. **Khoá ảnh nhân vật trước** (quan trọng nhất). Nhân vật đã khoá ảnh
   (trainer / MC / giảng viên) giữ đúng gương mặt suốt phim. Nhân vật chưa
   khoá sẽ quay text-to-video — **danh tính không bảo đảm**. Khoá thêm
   bằng `node tools/dat-nhan-vat-chuan.mjs` (ảnh nằm trong R2, không commit
   vào kho mã).
2. **Chọn đúng loại phim** — khung kịch bản bám theo:
   - *Đào tạo* (7 cảnh) · *Huấn luyện* (6) · *Hỗ trợ khách* (6) ·
     *Hành trình 5 tầng GITA* (5).
3. **Đề bài cụ thể, không chung chung.** Ghi rõ bối cảnh, đối tượng, thông
   điệp. Ví dụ tốt: *“Huấn luyện 100 học viên bứt phá giới hạn tại hội
   trường lớn, kết bằng lời kêu gọi cam kết hành động.”*
4. **Phạm vi = “Cho khách”** mặc định: máy **chặn cứng** từ khoá nội bộ
   (hoa hồng, tỷ lệ chia, sơ đồ tuyến…). Phim đào tạo nội bộ mới chọn
   “Nội bộ”. Không bao giờ đưa ảnh/giọng/tên thật của khách vào máy ngoài.
5. **Động tác nhẹ hợp LTX-Video.** Ưu tiên bước đi, quay người, cử chỉ
   tay, biểu cảm. Động tác mạnh (đánh/nhảy) dễ méo — tránh đưa vào đề bài.
6. **QC tự động** (bật sẵn): máy chấm độ nét + chuyển động từng cảnh, cảnh
   xấu tự quay lại seed khác (tối đa 2 lần) rồi lấy bản tốt nhất.
7. **Giọng & khớp môi** chạy tự động: edge-tts tiếng Việt theo giọng vai,
   khớp môi MuseTalk (dự phòng Wav2Lip). Cảnh nói dài hơn hình thì máy kéo
   hình cho khớp lời.

Công tắc trong `xuong-phim-studio.py` (đầu tệp) nếu cần chỉnh:
`LLM_ON` (Qwen2.5 viết kịch bản) · `LIPSYNC_ENGINE` · `QC_ON` · `CFG`
(độ phân giải/khung) · `GIO_PHIEN_TOI_DA` · `DON_SAU_KHI_NOP`.

---

## 5. Sản xuất LIÊN TỤC theo luật Kaggle

- **Phiên GPU ~12 giờ.** Máy tự **dừng sạch ở mốc `GIO_PHIEN_TOI_DA` (mặc
  định 11 giờ)**: nộp xong việc đang làm rồi in hướng dẫn. Bấm **Run lại**
  (cùng notebook) để quay tiếp — việc dở có **checkpoint từng cảnh** nên
  không làm lại từ đầu.
- **Quota ~30 giờ GPU/tuần.** Hết thì chờ tuần sau, hoặc mở notebook ở
  **tài khoản Kaggle khác** (mỗi tài khoản một secret, cùng khoá xưởng,
  cùng nối một máy chủ) để chạy song song.
- **Đĩa Kaggle ~20 GB.** Máy tự dọn cache HF/torch khi khởi động và **dọn
  tệp tạm của mỗi phim sau khi nộp** (`DON_SAU_KHI_NOP`). Bản MP4 cuối đã
  nằm an toàn ở máy chủ.
- **Giữ nhiều việc trong hàng chờ** để máy Kaggle quay không nghỉ: dùng
  “➕ Thêm vào hàng đợi”. Hàng chờ trống thì máy ngủ 3 phút rồi hỏi lại.

---

## 6. Cập nhật lên GitHub · Cloudflare · Kaggle

Sau khi lập trình xong (hoặc nhận bản cập nhật này):

1. **GitHub** — đẩy nhánh rồi mở Pull Request vào `main`:
   ```bash
   node tools/gop-src.js          # dựng lại bundle gita-app.js từ src/
   node tools/gop-src.js --kiem   # đối chiếu bundle (CI cũng kiểm bước này)
   git add -A && git commit -m "…"
   git push origin <nhánh-của-bạn>
   ```
2. **Cloudflare** — **tự động**: khi PR merge vào `main`, GitHub Actions
   (`deploy.yml`) triển khai Pages + Worker. Không phải chạy tay. (Thủ
   công khi cần: `cd may-chu && npx wrangler deploy`.)
3. **Kaggle** — **thủ công** (Kaggle không tự kéo từ GitHub): dừng
   notebook cũ, rồi **tải lại `may-quay-kaggle/xuong-phim-studio.ipynb`**
   bản mới (File → Import Notebook) → Run All. Nếu muốn giữ notebook cũ:
   xoá hết ô, dán lại toàn bộ `xuong-phim-studio.py` bản mới → Run All.
   (Tệp `.ipynb` dựng lại bằng `node tools/py-sang-ipynb.mjs`.)

---

## 7. Gỡ sự cố nhanh

| Hiện tượng | Nguyên nhân & cách gỡ |
|---|---|
| **“Phiên đã hết hạn”** khi đặt/dọn | Token 12 giờ hết. Dùng ô “🔒 Phiên máy chủ đã hết hạn” ngay trong xưởng để đăng nhập lại — việc tự chạy tiếp. Máy Kaggle không ảnh hưởng. |
| **“Chưa thấy máy Kaggle nào đang mở”** | Notebook Kaggle chưa Run hoặc phiên đã hết. Phim vẫn vào hàng chờ; mở lại notebook là quay ngay. |
| **`NameError: name 'null' is not defined`** trên Kaggle | Đã dán nội dung JSON của tệp `.ipynb` vào ô code. Làm theo **Cách A** (tải `xuong-phim-studio.ipynb` lên), hoặc **Cách B** (dán tệp `.py`, không phải `.ipynb`). Xem mục 2. |
| **`AssertionError: Thiếu khoá GITA_KHOA_QUAY`** | Kaggle chưa đọc được secret. (1) Panel phải → **Add-ons → Secrets** → thêm secret tên **`GITA_KHOA_QUAY`**; (2) **BẬT công tắc “Attach to notebook”** cho secret đó (chỗ hay quên nhất); (3) Run All lại. Giá trị khoá phải **TRÙNG `GITA_KHOA_XUONG_QUAY`** của Worker. Xem mục 2b. |
| **Kaggle in `Sai khoá` / `401`** khi gọi máy chủ | Khoá Kaggle ≠ khoá Worker. Đặt lại cùng một giá trị cho GitHub secret `GITA_KHOA_XUONG_QUAY` (Worker lấy khi deploy) và Kaggle secret `GITA_KHOA_QUAY`. Xem mục 2b. |
| **Kaggle lỗi 403 (mã 1010)** lúc gọi máy chủ | Cloudflare Bot Fight chặn User-Agent mặc định. Notebook đã mang UA trình duyệt — nếu vẫn lỗi, kiểm `MAY_CHU` đúng địa chỉ Worker. |
| **“No space left on device”** trên Kaggle | Đĩa 20GB đầy. Bản mới đã bật `DON_SAU_KHI_NOP`; nếu vẫn đầy, Factory reset notebook rồi Run lại. |
| **Nhân vật đổi mặt giữa phim** | Nhân vật chưa khoá ảnh → đang quay text-to-video. Khoá ảnh bằng `tools/dat-nhan-vat-chuan.mjs`. |
| **Phim khách bị chặn vì “bí mật”** | Đề bài chứa từ khoá nội bộ. Bỏ từ đó, hoặc chọn phạm vi “Nội bộ”. |
| **Phiên Kaggle dừng mỗi ~11 giờ** | Đúng thiết kế (tránh Kaggle cắt ngang). Bấm Run lại để quay tiếp; việc dở resume. |

Kiểm cổng máy chủ (chạy offline, không cần Cloudflare):
```bash
node tools/thu-quay-video.mjs      # hàng chờ, nhận việc, nộp, xem, DỌN
```
