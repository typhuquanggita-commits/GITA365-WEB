# Xưởng phim AI có trần ngân sách — 3 đến 10 USD một tập 30 phút

Ngày 9/10/2026. Chủ hệ: *"Tôi có thể trả thêm phí 3–10 USD/video 30 phút."*

Đây là lần đầu chủ hệ mở tiền cho video AI thật, và mở **có trần**. Bản này
giữ cái trần ấy bằng mã chạy ở máy chủ, không bằng lời hứa.

## Ai làm gì

| Phần | Ở đâu | Việc |
|---|---|---|
| Giám đốc (chia tiền) | `may-chu/phim-ngan-sach.js` | chia một tập thành cảnh chuyển động thật · khớp môi · ảnh + máy quay, sao cho không vượt trần |
| Cổng tiền | cùng tệp, `giuChoCanh` | giữ tiền TRƯỚC khi giao cảnh; không đủ trần tập hoặc trần tháng thì từ chối |
| Thợ (máy GPU thuê) | `may-quay-kaggle/may-tra-phi.py` | chỉ nhận việc đã giữ tiền, tự dừng trước hạn giờ GPU, gửi biên nhận |
| Sổ và màn | khối **Ngân sách phim AI thật** ở đầu màn *Xưởng phim* | tiền từng tập, biên nhận từng cảnh, dự báo đi sai hướng, cầu dao |
| Mạch việc kẹt | `may-chu/viec-ket.js` | báo tiền giữ nằm im quá 2 giờ, dự án dừng vì cầu dao |

Ý tưởng học từ [AgentCo](https://github.com/minhvq36/agentco). AgentCo theo giấy
phép FSL nên **không chép một dòng mã nào**, chỉ lấy ba ý: giám đốc lập kế hoạch
và thợ làm đúng một việc; đề bài mang đường dẫn chứ không mang nội dung; biên
nhận ngắn có một câu người đọc được.

## Cái trần có răng ở những chỗ nào

1. **Trần tập không quá 10 USD.** Xin 25 thì máy chủ hạ về 10; xin dưới 1 USD thì
   bị từ chối. Biến môi trường chỉ hạ được trần, và hạ trần hệ thì **dự án đã lập
   cũng hạ theo**. Khai `0` nghĩa là **chặn**, không phải "không khai".
2. **Giữ tiền trước khi giao, trong MỘT câu lệnh.** Đã chi + đang giữ + cảnh này
   phải nằm trong trần tập và trần tháng (mặc định 100 USD/tháng). Phép hỏi trần
   và phép ghi là một câu `INSERT … SELECT … WHERE`, nên giao nhiều cảnh cùng lúc
   cũng không lọt qua trần. Trần tháng tính **mọi khoản đang giữ**, kể cả khoản
   giữ từ tháng trước mà chưa chạy.
3. **Hạn giờ GPU cho từng cảnh.** Máy thợ nhận hạn giờ kèm việc và **tự dừng trước
   bước sẽ làm quá hạn**. Máy chạy quá hạn thì **cả dự án dừng** (cầu dao), xét ở
   mọi biên nhận, kể cả biên nhận báo hỏng. Cầu dao nhảy thì **cảnh đang xếp hàng
   của dự án cũng không máy nào nhận nữa**, cho tới khi Super Admin mở lại kèm lý do.
4. **Tiền do máy chủ tính** từ số giây GPU máy thợ báo về. Máy thợ gửi số tiền nào
   thì máy chủ cũng bỏ qua.
5. **Cảnh lỗi vẫn tính tiền.** Việc trả phí hỏng hoặc máy im lặng quá hạn **không
   được giao lại** trên cùng khoản giữ tiền. Câu nhận việc tự hỏi lại tiền, nên lịch
   dọn trả tiền về giữa chừng thì máy không nhận được việc ấy. Người giao lại cảnh
   bằng một lượt giữ tiền mới.
6. **Tốc độ đo riêng theo mức chất lượng.** Năm biên nhận của mức Tiết kiệm (LTX)
   không làm cảnh Cao nhất (Wan 14B) chỉ được giữ 1/14 số giờ nó cần.
7. **Khoá riêng cho máy trả phí** (tuỳ chọn): khai bí mật `GITA_KHOA_MAY_TRA_PHI`
   trên Worker thì chỉ máy cầm thêm khoá ấy mới nhận việc trả phí, gửi biên nhận và
   nộp kết quả cho việc trả phí. Máy miễn phí giữ chung khoá xưởng quay không còn
   đụng được tới tiền.

**Bộ soát đối kháng (9/10/2026) tìm ra 9 lỗ ở bản đầu.** Ví dụ: sáu lượt giữ tiền
cùng lúc đặt 4,96 USD vào một tập trần 1 USD; khai trần 0 để tắt chi thì trần lặng
lẽ thành 100 USD; cầu dao nhảy mà máy vẫn nhận tiếp hai cảnh đang chờ. Cả 9 lỗ đã vá,
mỗi lỗ có một phép đo ở `tools/thu-phim-ngan-sach.mjs` (51 phép đo). Từng phép đo
đã được chạy trên bản cũ và **đỏ đúng chỗ**, rồi xanh trên bản đã vá.

## Một tập 30 phút được bao nhiêu chuyển động thật

Số dưới đây là **ƯỚC TÍNH**, tính từ thông số công bố của các mô hình mở và giá
H100 3,95 USD/giờ. **Chưa đo trên máy của Học viện**, chưa chạy trên GPU nào ở đây.

| Trần tập | Mức | Chuyển động thật | Khớp môi | Ảnh + máy quay |
|---|---|---|---|---|
| 10 USD | Cân bằng (Wan 2.2 5B) | ~473 giây (26%) | 630 giây | phần còn lại |
| 3 USD | Tiết kiệm (LTX-Video) | ~382 giây | 630 giây | phần còn lại |
| 10 USD | Tiết kiệm (LTX-Video) | 1.080 giây (trần 60%) | 630 giây | phần còn lại |

20% trần tập luôn được giữ lại cho quay lại. Chuyển động thật không bao giờ vượt
60% thời lượng: mắt người cần nhịp nghỉ, và tiền cho cảnh không cần chuyển động là
tiền lấy khỏi cảnh cần.

**Khi đã có 5 biên nhận thật của một loại cảnh**, máy chủ tự dùng số đo được thay
cho số ước tính, và màn hình ghi rõ số nào là số nào.

## Chỗ phải nói thẳng

- **Thời gian máy thuê nằm không KHÔNG nằm trong trần.** Trần chỉ tính giây quay
  từng cảnh. Tải mô hình, khởi động, chờ việc vẫn bị nhà cho thuê tính tiền. Máy
  thợ tự thoát khi hàng chờ trống quá 10 phút; thoát xong phải **tắt máy thuê** ở
  trang nhà cho thuê, hoặc dùng loại serverless chỉ tính giây chạy.
- **Mô hình mặc định là LTX-Video**, mô hình bản Kaggle miễn phí đã chạy. Mức Cân
  bằng và Cao nhất xin Wan 2.2 qua `GITA_WAN_ID`. Chưa khai thì máy quay bằng LTX
  và **nói ra trong biên nhận**, không im lặng đổi.
- **Cảnh khớp môi không đi đường trả phí.** Chưa có máy thợ trả phí nào chạy
  MuseTalk, nên cửa giao cảnh từ chối cảnh khớp môi thay vì giữ tiền cho một việc
  không máy nào nhận. Cảnh nói đi đường khớp môi miễn phí của xưởng quay như cũ.
- **Tiền giữ cho việc không máy nào nhận** được trả về sau 3 giờ, ở lần mở sổ hoặc
  giao cảnh kế tiếp, và ít nhất mỗi ngày một lần theo lịch dọn.
- **Tiền đi ra ngoài là tiền thuê GPU của chủ hệ**, trả cho nhà cho thuê bằng tài
  khoản của chủ hệ. Máy chủ GITA không giữ thẻ, không gọi cổng thanh toán nào.
- **Trần tin số giây GPU máy thợ báo về.** Máy chủ không nhìn thấy hoá đơn của
  nhà cho thuê. Một máy thợ hỏng đồng hồ báo thiếu giây thì sổ báo còn tiền trong
  khi tiền đã đi. Mỗi tháng đối chiếu tổng ở khối *Ngân sách phim* với hoá đơn nhà
  cho thuê; lệch nhiều thì khai lại `GITA_PHIM_GPU_USD_GIO` hoặc kiểm máy thợ.
- **Ảnh gửi sang máy thuê là khung hình nhân vật của phim**, không phải ảnh gia
  đình. Chỉ Super Admin giao được cảnh, và cửa giao cảnh vẫn soát từ bí mật như
  xưởng quay cũ.

## Chủ hệ cần làm gì

1. Thuê một máy GPU (RunPod, Modal, Vast…). Khai giá thật bằng biến môi trường
   `GITA_PHIM_GPU_USD_GIO` để máy chủ tính tiền đúng giá.
2. Trên máy thuê: `export GITA_KHOA_QUAY=…` (khoá xưởng quay, giữ ở GitHub
   Secrets), rồi `python3 may-quay-kaggle/may-tra-phi.py`. Không dán khoá vào tệp.
3. Ở màn *Xưởng phim* → khối *Ngân sách phim AI thật*: lập dự án (ví dụ 10 tập ×
   30 phút, trần 10 USD), xem kế hoạch chia tiền, giao cảnh.
4. Tắt máy thuê khi không quay.
