/* ═══════════════════════════════════════════════════════════════
   GITA 365 — SỔ ĐĂNG KÝ MỌI MÁY CHỦ NGOÀI MÀ WORKER GỌI TỚI

   Học từ kho public-apis (github.com/public-apis/public-apis): sức của kho
   ấy không nằm ở số lượng API, mà ở chỗ MỖI dòng khai đúng năm cột — việc
   gì, xác thực bằng gì, có HTTPS không, có CORS không, đường dẫn — và một
   bộ kiểm tự động từ chối dòng nào khai thiếu. Một danh sách không ai kiểm
   thì sáu tháng sau nó nói sai mà vẫn trông đầy đủ.

   GITA mượn đúng cái khung ấy, nhưng hỏi thêm câu mà public-apis không
   hỏi: GỬI RA NGOÀI THỨ GÌ VỀ NGƯỜI. Đó là câu của Điều 13 (bất khả sửa)
   và Luật 91/2025 — dữ liệu gia đình không rời hệ ở dạng nhận dạng được.

   Bộ kiểm tools/thu-nguon-ngoai.mjs đo HAI ĐẦU ĐỘC LẬP:
   · đầu một — sổ này (lời khai);
   · đầu hai — mã thật trong may-chu/*.js (mọi chuỗi https://… đọc từ đĩa).
   Mã gọi một máy chủ chưa khai → đỏ. Sổ khai một máy chủ mà mã không còn
   gọi → đỏ (dòng cũ nằm lại là dòng nói dối). Dòng khai một cổng an toàn
   (`cong`) mà tệp của nó không gọi cổng ấy → đỏ. Một chuỗi http:// trần →
   đỏ.

   Năm luật của cột `guiRa` — chọn ĐÚNG MỘT:
   · 'khong'   — không gửi gì về người (mẫu cố định, tên mô hình, tệp tĩnh)
   · 'anDanh'  — chỉ gửi sau khi qua cổng ẩn danh của hệ (ghi tên ở `cong`)
   · 'bam'     — chỉ gửi một mẩu băm không đảo ngược được, không gắn với ai
   · 'caNhan'  — CÓ gửi dữ liệu người (ví dụ địa chỉ thư của người nhận);
                 bắt buộc khai `vi` nói vì sao không tránh được
   · 'lienKet' — không gọi ra; chỉ là địa chỉ đưa cho người dùng bấm
   ═══════════════════════════════════════════════════════════════ */

export const GUI_RA = ['khong', 'anDanh', 'bam', 'caNhan', 'lienKet'];

/* KHI HỎNG (9/10/2026, theo yêu cầu "giảm phụ thuộc bên ngoài"): mỗi nguồn
   ngoài khai nó sập thì hệ còn chạy được gì. Một phụ thuộc không biết mình
   sập ra sao là phụ thuộc nguy nhất — vì người ta chỉ phát hiện vào đúng
   ngày nó sập.
   · 'moCua'        — bỏ qua, việc chính vẫn đi (và luật tại chỗ vẫn chạy)
   · 'duongLui'     — có đường thay; ô `lui` gọi TÊN đường ấy trong mã
   · 'daLuuTrongHe' — chỉ cần một lần, đã chép về kho của hệ (R2)
   · 'dungTinhNang' — tính năng ấy dừng; `vi` phải nói tính năng nào
   · 'khongGoi'     — không gọi ra, chỉ là đường dẫn đưa người dùng */
export const KHI_HONG = ['moCua', 'duongLui', 'daLuuTrongHe', 'dungTinhNang', 'khongGoi'];
export const XAC_THUC = ['khong', 'apiKey', 'token'];

export const NGUON_NGOAI = [
  { khiHong: { kieu: 'moCua', vi: 'Luật mật khẩu tại chỗ (mkQuaDeDoan) vẫn chạy; chỉ mất lớp soát danh sách đã lộ.' }, ma: 'NN01', mien: 'api.pwnedpasswords.com', viec: 'Soát mật khẩu đã lộ trong các vụ rò rỉ (k-anonymity)',
    xacThuc: 'khong', guiRa: 'bam', batKhi: 'GITA_KIEM_MK_RO', tep: ['nen.js'], cong: 'mkDaLo',
    vi: 'Chỉ gửi 5 ký tự đầu của mã băm SHA-1 — khớp với hàng trăm mật khẩu khác nhau, không ai biết mật khẩu nào. ' +
        'Không gửi tên, thư, hay mật khẩu.' },

  { khiHong: { kieu: 'duongLui', lui: 'guiQuaGmail_', vi: 'Thư đi qua cầu nối Gmail; thư cho hòm chủ hệ còn hộp thư GitHub.' }, ma: 'NN02', mien: 'api.resend.com', viec: 'Gửi thư (mã OTP, kích hoạt, trả lời khách)',
    xacThuc: 'apiKey', guiRa: 'caNhan', batKhi: 'GITA_KHOA_THU', tep: ['thu.js'],
    vi: 'Muốn gửi thư thì phải nói địa chỉ người nhận cho dịch vụ gửi thư. Chỉ chạy khi chủ hệ nạp khoá Resend; ' +
        'thư cho hòm của chủ hệ đi đường GitHub/Gmail trước.' },
  { khiHong: { kieu: 'duongLui', lui: 'guiQuaGmail_', vi: 'Thư cho hòm chủ hệ đi Gmail/Resend; lệnh xưởng quay nằm hàng đợi, lượt 10 phút sau nhận lại.' }, ma: 'NN03', mien: 'api.github.com', viec: 'Gọi hộp thư GitHub Actions và xưởng quay (repository_dispatch)',
    xacThuc: 'token', guiRa: 'caNhan', batKhi: 'GITA_GH_KHOA_THU', tep: ['thu.js', 'xuong-quay.js'],
    vi: 'Lá thư cho hòm của chủ hệ đi qua kho GitHub riêng của chủ hệ; xưởng quay chỉ nhận lệnh "chạy", không mang dữ liệu người.' },

  { khiHong: { kieu: 'duongLui', lui: 'goiLeoBac', vi: 'Leo sang nhà cung cấp kế tiếp; chế độ tiết kiệm chỉ dùng Workers AI.' }, ma: 'NN04', mien: 'api.deepseek.com', viec: 'Bộ não đa trí — nhà cung cấp DeepSeek',
    xacThuc: 'apiKey', guiRa: 'anDanh', batKhi: 'GITA_KHOA_DEEPSEEK', tep: ['bo-nao-da-tri.js'], cong: 'soatRaNhaCungCap' },
  { khiHong: { kieu: 'duongLui', lui: 'goiLeoBac', vi: 'Leo sang nhà cung cấp kế tiếp.' }, ma: 'NN05', mien: 'generativelanguage.googleapis.com', viec: 'Bộ não đa trí — nhà cung cấp Gemini',
    xacThuc: 'apiKey', guiRa: 'anDanh', batKhi: 'GITA_KHOA_GEMINI', tep: ['bo-nao-da-tri.js'], cong: 'soatRaNhaCungCap' },
  { khiHong: { kieu: 'duongLui', lui: 'goiLeoBac', vi: 'Bộ não đa trí leo sang nhà cung cấp kế tiếp; Quyền năng AI báo lỗi và không làm gì.' }, ma: 'NN06', mien: 'api.openai.com', viec: 'Bộ não đa trí và Quyền năng AI — nhà cung cấp OpenAI',
    xacThuc: 'apiKey', guiRa: 'anDanh', batKhi: 'GITA_KHOA_OPENAI GITA_AI_KHOA', tep: ['bo-nao-da-tri.js', 'quyen-nang-ai.js'], cong: 'soatRaNhaCungCap' },
  { khiHong: { kieu: 'duongLui', lui: 'goiLeoBac', vi: 'Leo sang nhà cung cấp kế tiếp.' }, ma: 'NN07', mien: 'api.anthropic.com', viec: 'Bộ não đa trí — nhà cung cấp Anthropic',
    xacThuc: 'apiKey', guiRa: 'anDanh', batKhi: 'GITA_KHOA_ANTHROPIC', tep: ['bo-nao-da-tri.js'], cong: 'soatRaNhaCungCap' },
  { khiHong: { kieu: 'duongLui', lui: 'goiLeoBac', vi: 'Leo sang nhà cung cấp kế tiếp.' }, ma: 'NN08', mien: 'api.x.ai', viec: 'Bộ não đa trí — nhà cung cấp xAI',
    xacThuc: 'apiKey', guiRa: 'anDanh', batKhi: 'GITA_KHOA_XAI', tep: ['bo-nao-da-tri.js'], cong: 'soatRaNhaCungCap' },

  { khiHong: { kieu: 'dungTinhNang', vi: 'Phim trả phí qua fal dừng; đang khoá sẵn (GITA_PHIM_CHI_0D) — phim chạy đường 0 đồng bằng Workers AI.' }, ma: 'NN09', mien: 'queue.fal.run', viec: 'Phim AI — hàng đợi dựng cảnh',
    xacThuc: 'apiKey', guiRa: 'anDanh', batKhi: 'GITA_KHOA_FAL', tep: ['phim-ai.js'], cong: 'soatRaNgoai' },
  { khiHong: { kieu: 'daLuuTrongHe', vi: 'Bộ đọc giọng đã chép về R2 và kiểm SHA-256; nguồn sập chỉ chặn lần chép đầu.' }, ma: 'NN10', mien: 'cdn.jsdelivr.net', viec: 'Tải một lần bộ đọc giọng Piper về R2 (kiểm SHA-256 từng tệp)',
    xacThuc: 'khong', guiRa: 'khong', tep: ['tai-nguyen.js'] },
  { khiHong: { kieu: 'daLuuTrongHe', vi: 'Giọng đọc đã chép về R2 và kiểm SHA-256.' }, ma: 'NN11', mien: 'huggingface.co', viec: 'Tải một lần giọng đọc tiếng Việt về R2 (kiểm SHA-256 từng tệp)',
    xacThuc: 'khong', guiRa: 'khong', tep: ['tai-nguyen.js'] },

  { khiHong: { kieu: 'khongGoi', vi: 'Không gọi ra — chỉ là đường dẫn trong thư kích hoạt.' }, ma: 'NN12', mien: 'gita365.pages.dev', viec: 'Địa chỉ web app — dựng đường dẫn kích hoạt trong thư',
    xacThuc: 'khong', guiRa: 'lienKet', tep: ['dang-ky.js', 'worker.js'] }
];

/* Những đích KHÔNG ghi được bằng một chuỗi trong mã, vì chủ hệ nạp địa chỉ
   lúc triển khai. Bộ kiểm đòi tên biến môi trường có thật trong tệp khai,
   và đòi tệp ấy đi qua cổng nó khai — địa chỉ đổi được, cổng thì không. */
export const DICH_CAU_HINH = [
  { khiHong: { kieu: 'duongLui', lui: 'guiQuaGithub_', vi: 'Thư cho hòm chủ hệ đi hộp thư GitHub hoặc Resend.' }, ma: 'CH01', bien: 'GITA_CAU_NOI_GMAIL', viec: 'Cầu nối Gmail (Apps Script của chủ hệ) gửi thư cho hòm chủ hệ',
    guiRa: 'caNhan', tep: ['thu.js'], vi: 'Chỉ thư gửi tới hòm của chính chủ hệ (danhSachNoiBo).' },
  { khiHong: { kieu: 'dungTinhNang', vi: 'Cửa vẽ ảnh ra ngoài của Kiến trúc sư thị giác đóng; đề bài vẫn soạn và duyệt được trong hệ.' }, ma: 'CH02', bien: 'GITA_CONG_VE', viec: 'Kiến trúc sư thị giác — dịch vụ sinh ảnh chủ hệ chọn',
    guiRa: 'anDanh', tep: ['kien-truc-thi-giac.js'], cong: 'soatRaNgoai' },
  { khiHong: { kieu: 'duongLui', lui: 'veFlux2', vi: 'Vẽ cảnh mẫu bằng Workers AI trong hệ.' }, ma: 'CH03', bien: 'GITA_VE_ANH_URL', viec: 'Phim phân tử — vẽ cảnh mẫu (không chạy cho lượt công khai)',
    guiRa: 'khong', tep: ['phim-phan-tu.js'], vi: 'Đề bài là khuôn cảnh cố định của Học viện, không có dữ liệu khách.' }
];
