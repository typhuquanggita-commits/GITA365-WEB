/* ═══════════════════════════════════════════════════════════════
   GITA STUDIO 365 — CỬA MÁY CHỦ CỦA XƯỞNG  (9.99.94)

   Mô-đun này chỉ có ĐÚNG MỘT cửa: `ghiHoChieuVideo`. Nó nhỏ có chủ ý,
   và ba thứ nó CỐ Ý KHÔNG có là phần đáng đọc nhất.

   ══ MỘT · KHÔNG CÓ MỘT BẢNG DẤU HIỆU NÀO ══

   Xưởng soát ngôn từ bằng cách gọi `soatNoiDung` — cửa đã chạy từ
   9.99.41 với `soatLoiNoi` · `soatCauDai` · `soatNguon` · `soatVirus`
   · `soatKL`. Mô-đun này không khai một cụm từ cấm nào.

   Bản mẫu của chủ hệ tự dựng một bảng, và dòng regex ấy mang hai bẫy
   cùng lúc: `\bhư\b` không bao giờ khớp vì "ư" nằm ngoài lớp `\w`, còn
   `\bngu\b` khớp vào "ngu|ồn" nên nó bắt oan mọi bài có chữ *nguồn* —
   mà "Nguồn tri thức" là tên một ô của chính cái form. Một bộ dò bắt
   oan ở lượt đầu thì người ta tắt nó đi, và lúc tắt thì chỗ CÂM đi
   theo mà không ai biết.

   ══ HAI · KHÔNG CÓ CỬA SINH GIỌNG, VÀ KHÔNG CÓ CỬA GỌI RA NGOÀI ══

   Luật C20: lời đọc là TỆP CÓ SẴN, máy chỉ TRỘN chứ không SINH. Bản
   mẫu tự giữ đúng luật ấy — giọng đến từ micro người thật. Viết một
   cửa `sinhGiong` rồi mới cấm gọi là muộn, nên cửa ấy KHÔNG TỒN TẠI,
   và mục 103 hỏi danh sách hàm xuất ra để canh.

   Tương tự với `nhapDeBaiRaNgoai`: bản mẫu gọi thẳng một bộ tạo chữ
   đặt ngoài lãnh thổ từ trình duyệt, mang theo chủ đề · người xem ·
   điều nhỏ của một gia đình, không qua cổng ẩn danh. Đường ấy đã gỡ,
   và câu hỏi có mở lại qua máy chủ hay không là mục chờ XU-02.

   ══ BA · HỘ CHIẾU KHÔNG DỰNG Ở MÀN HÌNH ══

   Một hộ chiếu dựng trong trình duyệt là một tờ giấy TỰ KÝ: nó nói
   video đã qua đèn nào, mà chính người dựng viết ra nó. Ở đây nó đi
   qua cửa, vào nhật ký, và nhật ký mới trả lời được câu "tấm này ra
   khỏi hệ lúc nào, qua cửa nào" — cùng lối `TG_TRUY` (9.99.57) và sổ
   truy vết một tấm (9.99.59).
   ═══════════════════════════════════════════════════════════════ */

import { Kho } from './nen.js';

/* Hồ sơ phiên mang tên ô là `hoSo.u` và `hoSo.role` — KHÔNG phải
   `username`, KHÔNG phải `vai`. Cái bẫy đã cắn kho năm lần (9.99.55 ·
   9.99.62 · 9.99.75 · 9.99.77). Gõ nhầm thì JavaScript trả `undefined`
   và cổng đóng với mọi người trong im lặng. */
function ten(hoSo) { return String((hoSo || {}).u || ''); }

/* Cùng một phép soi vai với `tu-nang-cap.js`, viết lại ở đây vì hai
   mô-đun không nhập lẫn nhau — và ghi ra rằng nó là BẢN THỨ HAI để
   người sau biết có hai chỗ phải sửa cùng lúc.

   Vì sao không gom: gom được thì phải có một mô-đun chung cho phép soi
   vai, và dựng một mô-đun như thế là một lượt sửa đụng mười ba tệp
   máy chủ. Đó là việc đáng làm, và nó là mục chờ XU-04 chứ không phải
   một dòng vá kèm bản này. */
function laNguoiNha(hoSo) {
  return /^R(0[1-9]|1[0-2])$/.test(String((hoSo || {}).role || ''));
}

/* ═══════════════ CỬA DUY NHẤT ═══════════════

   Xuất tệp là chỗ dữ liệu RỜI KHỎI HỆ, nên cổng vai nằm ở đây chứ
   không chỉ ở màn hình. Chủ hệ đã chốt: khách hàng — phụ huynh, học
   viên, cộng tác viên — không tải bất cứ dữ liệu nào của hệ về máy.
   Màn hình khoá ở quyền nghề; cửa này khoá lần nữa, và cái hẹp hơn
   nằm ở MÁY CHỦ — đúng chiều an toàn (9.99.67). */
export async function ghiHoChieuVideo(y, env, db, hoSo) {
  if (!laNguoiNha(hoSo))
    return { ok: false, code: 'NOPERM',
      vi: 'Hộ chiếu video chỉ cấp cho người của Học viện. Xưởng dựng video xuất tệp ' +
        'ra máy người dùng, nên nó không mở cho tài khoản khách hàng.' };

  const tenV = String(y.ten || '').trim();
  if (tenV.length < 3)
    return { ok: false, code: 'THIEUTEN', vi: 'Video chưa có tên thì hộ chiếu không dẫn về đâu.' };

  const giay = Number(y.giay || 0);
  if (!(giay >= 30 && giay <= 300))
    return { ok: false, code: 'NGOAIKHUNG',
      vi: 'Thời lượng ' + giay + ' giây nằm ngoài khung 30 giây – 5 phút của FV-2.' };

  /* Đèn gửi lên là LỜI KHAI của màn hình, và hộ chiếu nói thẳng thế.
     Máy chủ không chạy lại tám đèn — nó không có canvas, không có tệp
     hình, không có giọng. Trình một lời khai dưới tên một phép đo là
     đúng thứ luật `daGoNgoai` (9.99.58) và cột lời khai của phễu
     (9.99.59) cấm. */
  const den = Array.isArray(y.den) ? y.den : [];
  if (!den.length)
    return { ok: false, code: 'THIEUDEN',
      vi: 'Hộ chiếu không có kết quả đèn thì nó không nói được video này đã qua gì.' };
  const doNao = den.filter(d => d && d.tt === 'bad').map(d => String(d.t || ''));
  if (doNao.length)
    return { ok: false, code: 'CONDENDO',
      vi: 'Còn đèn đỏ: ' + doNao.join(' · ') + '. Cổng cứng — không cấp hộ chiếu cho một ' +
        'video chưa qua đèn (LT_RM.RM-1).' };

  const luc = new Date().toISOString();
  const hoChieu = {
    ten: tenV,
    kho: String(y.kho || ''),
    tang: String(y.tang || ''),
    nguon: String(y.nguon || ''),
    dieuNho: String(y.dieuNho || ''),
    giay: giay,
    soCanh: Number(y.soCanh || 0),
    capLuc: luc,
    capBoi: ten(hoSo),
    /* Hai ngăn KHÔNG trộn: cửa này đo được ba thứ (vai người cấp, thời
       lượng, mốc thời gian); tám đèn là lời khai của màn hình. Gộp
       chúng thành một dòng "đã kiểm" thì con số ra mang tên của phép
       đo trong khi nó thừa hưởng mọi sai của lời khai. */
    mayDo: { vaiNguoiCap: String((hoSo || {}).role || ''), giayTrongKhung: true, mocThoiGian: luc },
    denKhaiTuManHinh: den,
    vaSaoLaLoiKhai: 'Tám đèn do màn hình khai. Máy chủ không có canvas, không có tệp hình ' +
      'và không có giọng, nên nó KHÔNG chạy lại được chúng — và một lời khai trình ra ' +
      'dưới tên một phép đo thì người đọc tin cả hai như nhau.'
  };

  await Kho.ghiNhatKy(db, { uid: (hoSo || {}).uid, username: ten(hoSo),
    viec: 'XU_HOCHIEU', doiTuong: tenV,
    chiTiet: hoChieu.kho + ' · ' + giay + 's · ' + hoChieu.soCanh + ' cảnh · tầng ' +
      hoChieu.tang + ' · nguồn ' + hoChieu.nguon });

  return { ok: true, hoChieu };
}
