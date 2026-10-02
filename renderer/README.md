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

## Chế độ 0 đồng

Mặc định container chạy CPU trên máy nội bộ đã có Docker: không có GPU cloud,
hàng đợi SaaS, API render, storage ngoài hoặc máy chủ chạy thường trực. Trong
Studio, sau `rightsApproved`, tải manifest xuống, render tại máy nội bộ, rồi
nạp `result.json` vào cùng dự án để ghi checksum qua phiên đăng nhập hiện có.
Đây là orchestrator thủ công có kiểm soát: không cần service account, webhook
hay secret renderer, và không mở endpoint mới trên Worker.

Chỉ cân nhắc GPU/hạ tầng trả phí khi pilot đo được thời gian CPU không đáp ứng
SLA đã chốt. Khi đó phải đặt trần chi phí/job, số job đồng thời và thời lượng,
vẫn giữ asset/video trong kho riêng và giữ bước QC độc lập.
