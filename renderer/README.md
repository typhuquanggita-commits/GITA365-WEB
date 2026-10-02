# GITA Studio Renderer

Đây là container render **riêng tư**, không được triển khai lên Cloudflare
Pages hoặc Worker. Nó nhận manifest V20 đã qua `rightsApproved` trong volume
`/jobs`, tạo MP4 vào `/output`, và chỉ trả metadata/checksum về sổ Studio qua
orchestrator nội bộ.

## Chạy một job

1. Mount thư mục job riêng, không mount kho mã hoặc home của máy chủ.
2. Chép manifest đã duyệt vào `/jobs/<job-id>/manifest.json`.
3. Chạy:

```sh
docker build -t gita-studio-renderer renderer
docker volume create gita-render-output
docker run --rm --read-only --tmpfs /tmp --network none \
  -v "$PWD/jobs:/jobs:ro" -v gita-render-output:/output \
  gita-studio-renderer --manifest /jobs/<job-id>/manifest.json
```

Production phải đặt `RENDERER_PRODUCTION=true` và nạp
`REMOTION_LICENSE_KEY` bằng secret manager sau khi xác nhận giấy phép Remotion.
Không ghi khoá, URL GPU, asset, transcript hoặc video khách vào manifest, log
hay repository.

Composition hiện tạo MP4 V20 từ kịch bản đã duyệt. Adapter asset/GLB chỉ được
thêm khi kho asset riêng có kiểm soát quyền cung cấp file read-only; Pages,
Worker và manifest không được mang blob. Orchestrator phải tính checksum MP4
và thumbnail, ghi `jobId`, sau đó mới gọi cổng `rendered`. FFmpeg có trong
container cho hậu kỳ private; Video2X, VideoLingo và LongCat không được cài vào
image này.

Container chạy bằng UID `10001`, không chạy root. Orchestrator phải cấp quyền
ghi cho UID này trên volume output (Kubernetes: `fsGroup: 10001`; Docker bind
mount: tạo thư mục output với owner UID `10001`) hoặc dùng named volume như ví
dụ. Không nới quyền `777` để chữa lỗi mount.
