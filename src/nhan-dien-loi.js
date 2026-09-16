/* ═══════════════════════════════════════════════════════════════
   GITA 365 · v7.9 — BỘ NHẬN DIỆN NGÔN TỪ
   Song sinh với bộ nhận diện hình ảnh. Logo giữ mắt, ngôn từ giữ tai.

   Dựng trên thứ GITA đã có sẵn — sáu nhịp N1→N6 và sáu ranh giới
   trong kho ngôn từ dẫn dắt — chứ không nghĩ ra một hệ mới.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;

G.NHAN_DIEN_LOI = {
  cot: 'Nói như một người đã ngồi trong phòng khách nhà họ, không như một hệ thống đang thông báo.',

  /* ─── 1 · HAI HỆ NGÔN NGỮ ─── */
  haiHe: [
    {id:'nha',  ten:'LỜI NHÀ MÌNH', ai:'Phụ huynh · học viên · cộng tác viên (bậc 13–15)',
     cot:'Tiếng thường ngày. Nói việc cần làm, không nói cấu trúc hệ thống.',
     dung:['nhà mình','việc hôm nay','chặng đường','mắc ở đâu','ghi lại','thầy cô xác nhận'],
     tranh:['phạm vi','vai','tầng quyền','cấp phép','gói nội dung','đồng bộ','KPI','mô thức',
            'phác đồ','ma trận','nghiệm thu','kiểm duyệt','minh chứng','chuẩn hoá']},
    {id:'nghe', ten:'LỜI NGHỀ', ai:'Tư vấn tới Super Admin (bậc 1–12)',
     cot:'Giữ nguyên thuật ngữ chuyên môn và thuật ngữ hệ thống. Người trong nghề cần gọi đúng tên để làm việc với nhau.',
     dung:['mô thức MT-xx','nhịp N1–N6','tầng T1–T5','phạm vi cấp phép','cổng nghiệm thu','KPI'],
     tranh:['nói vòng cho dễ nghe rồi mất chính xác']}
  ],

  /* ─── 2 · SÁU NHỊP — xương sống mọi cuộc nói chuyện ─── */
  sauNhip: [
    {ma:'N1', ten:'MỞ',        lam:'Hạ nhịp. Cho phép họ từ chối. Bình thường hoá chuyện đang xảy ra.'},
    {ma:'N2', ten:'NGHE',      lam:'Hỏi mở rồi im. Lặp lại nguyên văn từ khoá của họ.'},
    {ma:'N3', ten:'CÔNG NHẬN', lam:'Thấy gì · họ đã tự làm gì · điều đó giúp ai. Không kèm chữ "nhưng".'},
    {ma:'N4', ten:'LÀM RÕ',    lam:'Đổi lăng kính. Chỉ làm sau khi đã công nhận.'},
    {ma:'N5', ten:'DẪN ĐƯỜNG', lam:'Một bước làm được ngay tối nay. Một bước, không phải kế hoạch.'},
    {ma:'N6', ten:'GIỮ',       lam:'Nói rõ điều KHÔNG có. Hẹn mốc kiểm chứng. Để cửa mở.'}
  ],

  /* ─── 3 · MƯỜI DẤU HIỆU CÂU DO MÁY VIẾT ───
     Đây là bộ soi. Câu nào dính từ hai dấu hiệu trở lên thì viết lại. */
  dauHieuMay: [
    {d:'Ba vế cách nhau bằng dấu chấm giữa, lặp đi lặp lại ở mọi mục',
     v:'Người thật không nói đều tăm tắp. Câu dài ngắn khác nhau mới ra hơi người.'},
    {d:'Câu nào cũng đúng một dòng, cân đối như nhau',
     v:'Nhịp đều là dấu hiệu rõ nhất của văn máy.'},
    {d:'Gạch ngang dài dùng ở gần như mọi câu',
     v:'Dùng thưa thì nó mạnh. Dùng khắp nơi thì nó thành tiếng ồn.'},
    {d:'Tính từ to mà rỗng: toàn diện, tối ưu, đột phá, mạnh mẽ',
     v:'Thay bằng một con số hoặc một việc cụ thể.'},
    {d:'Mở đầu bằng "Hãy", "Khám phá", "Trải nghiệm"',
     v:'Đó là giọng quảng cáo, không phải giọng người đồng hành.'},
    {d:'Nói về người dùng ở ngôi thứ ba: "phụ huynh sẽ được…"',
     v:'Nói thẳng với họ: "anh chị sẽ thấy…".'},
    {d:'Liệt kê đủ bốn ý cho cân, dù ý thứ tư không cần',
     v:'Ba ý thật hơn bốn ý cho đủ.'},
    {d:'Hứa kết quả mà không nói điều kiện',
     v:'Ranh giới GITA: không hứa vượt phạm vi tầng.'},
    {d:'Câu nào cũng khép lại gọn ghẽ, không để chỗ trống nào',
     v:'Người thật để lại chỗ cho người kia nói.'},
    {d:'Dùng thuật ngữ hệ thống với gia đình',
     v:'Phạm vi, vai, gói, đồng bộ — nhà mình không cần biết những chữ đó.'}
  ],

  /* ─── 4 · MƯỜI HAI CẶP NÓI THẾ NÀY, KHÔNG NÓI THẾ KIA ─── */
  thayVi: [
    {khong:'Hệ thống ghi nhận bạn đã hoàn thành nhiệm vụ.',
     nen:  'Việc này thầy cô đã xác nhận cho nhà mình rồi ạ.'},
    {khong:'Vui lòng cập nhật dữ liệu để tối ưu trải nghiệm.',
     nen:  'Anh chị ghi giúp em hai dòng tối nay, mai nhìn lại sẽ rõ hơn nhiều.'},
    {khong:'Bạn chưa có quyền truy cập nội dung này.',
     nen:  'Phần này thuộc chặng sau. Nhà mình đi hết chặng này thì nó tự mở.'},
    {khong:'Khám phá ngay lộ trình toàn diện dành cho bạn!',
     nen:  'Nhà mình nhìn thử tấm bản đồ này một lần, rồi tự thấy đang đứng ở đâu.'},
    {khong:'Chúng tôi cam kết mang lại kết quả vượt trội.',
     nen:  'Bảy ngày đầu chưa sửa gì cả. Mình chỉ nhìn cho đúng đã.'},
    {khong:'Phụ huynh cần nâng cao nhận thức về vấn đề này.',
     nen:  'Chuyện này không phải anh chị làm sai. Nó là mô thức lặp.'},
    {khong:'Dữ liệu cho thấy con bạn đang có vấn đề nghiêm trọng.',
     nen:  'Bảy tối vừa rồi con ngồi vào bàn trung bình lúc 21h10. Riêng hai tối con ngồi lúc 19h40.'},
    {khong:'Hoàn thành KPI để mở khoá tầng tiếp theo.',
     nen:  'Còn ba mốc nữa là nhà mình xong chặng này.'},
    {khong:'Tài liệu đang chờ được kiểm duyệt bởi quản trị viên.',
     nen:  'Bản này đã gửi đi. Có người đọc rồi báo lại nhà mình.'},
    {khong:'Nhấn vào đây để bắt đầu hành trình chuyển đổi.',
     nen:  'Bắt đầu từ việc một. Xong việc một rồi hãy mở việc hai.'},
    {khong:'Đây là giải pháp tối ưu cho gia đình bạn.',
     nen:  'Nhà mình không hụt ở năm chỗ đâu. Nhà mình hụt ở khoang hai.'},
    {khong:'Cảm ơn bạn đã tin tưởng lựa chọn GITA 365.',
     nen:  'Cảm ơn anh chị đã kể. Em nghe đủ rồi, giờ mình nói chuyện tiếp nhé.'}
  ],

  /* ─── 5 · CÁCH XƯNG HÔ ─── */
  xungHo: [
    {voi:'Phụ huynh',  he:'anh chị',        minh:'em',  ghi:'Không gọi "quý khách", không gọi "bạn".'},
    {voi:'Học viên',   he:'em / con',       minh:'thầy · cô', ghi:'Theo cách gia đình đó vẫn gọi, hỏi trước khi chọn.'},
    {voi:'Cộng tác viên', he:'anh chị',     minh:'GITA',ghi:'Ngang hàng, không kẻ trên người dưới.'},
    {voi:'Đội ngũ trong nghề', he:'anh chị · bạn', minh:'mình', ghi:'Được dùng thuật ngữ đầy đủ.'}
  ],

  /* ─── 6 · SÁU RANH GIỚI NGÔN TỪ — không thương lượng ─── */
  ranhGioi: [
    'Không dùng khan hiếm giả, hạn chót giả, số liệu không kiểm chứng được.',
    'Không hứa kết quả vượt phạm vi chặng gia đình đang đi.',
    'Không dán nhãn con người. Mô tả hành vi và hoàn cảnh, không mô tả tính cách.',
    'Không dùng dữ liệu đọc được về gia đình để chứng minh họ sai.',
    'Không nói xấu lựa chọn khác của gia đình.',
    'Không dùng kỹ thuật đọc trạng thái để đẩy ai vào quyết định mua.'
  ]
};
