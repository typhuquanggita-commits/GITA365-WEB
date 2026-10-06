/* ═══════════════════════════════════════════════════════════════
   GITA 365 — KHÔNG GIAN LÀM VIỆC THEO VAI  (Giai đoạn 1 · tách vai)

   VẤN ĐỀ. Cột trái xếp theo CHỦ ĐỀ: sáu nhóm, 235+ màn. Khách, nhân sự,
   quản trị nằm lẫn trong cùng một nhóm. Super Admin phải lội ~110 màn mới
   làm được một việc. Chủ hệ: "các màn trộn lẫn nên thao tác nghiệp vụ rất
   khó" — đúng.

   GIẢI PHÁP. KHÔNG xoá, KHÔNG gộp, KHÔNG đổi màn nào. Chỉ thêm một LỚP
   TRÌNH BÀY ở đỉnh cột trái, lọc sẵn đúng vai:

       ◆ KHÁCH HÀNG       — các màn về hoạt động/hành trình của khách
       ◆ NGHIỆP VỤ CỦA TÔI — khối việc cô đọng: 10 (quản trị) · 8 (giám
                             đốc) · 5 (các vai còn lại)
       ▸ TOÀN HỆ THỐNG    — sáu nhóm cũ, giữ nguyên, gấp lại bên dưới

   BẢO MẬT LÀ LÕI. Mỗi khoá màn ở đây KHÔNG tự mở quyền. Lúc dựng, cột trái
   lọc từng mục qua visible() — đúng hàm cổng mà hệ đang dùng (quyền perm +
   điều kiện dữ liệu hienKhi + gói nội dung + màn có thật). Màn nào vai
   không đủ quyền thì KHÔNG hiện. Vì thế danh sách dưới đây là ỨNG VIÊN —
   cột trái chỉ lấy những màn vai THẬT SỰ mở được, tối đa bằng cap.

   QUYỀN THEO CẤP — TẦNG — VAI. Mỗi vai R01…R15 có một cấp (lv 1 cao nhất).
   Danh sách ứng viên dưới đây đã được chọn khớp với quyền thật của từng
   vai (ví dụ: Tư vấn lv11 mở được pro_consult; Phân tích lv12 KHÔNG mở
   pro_consult nên dùng bộ màn nghe_chung phân tích). Số cap phản ánh đúng
   yêu cầu chủ hệ: quản trị 10 · giám đốc 8 · còn lại 5.

   MÀU QUY ƯỚC (đồng bộ toàn hệ):
       Khách hàng   → T4 xanh lá  (--t4 #0B7350)
       Nghiệp vụ    → GITA xanh   (--gita #2A72C6)
       Toàn hệ thống→ trung tính
       Tầng 1..5    → --t1 #185AB4 · --t2 #5140B4 · --t3 #0B6675
                      · --t4 #0B7350 · --t5 #BE0E16
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;
(function(){

  /* ── KHỐI KHÁCH HÀNG ───────────────────────────────────────────
     Hai góc nhìn khác hẳn nhau:
       · KHÁCH (lv ≥ 13: Phụ huynh, Học viên, CTV) — thấy HÀNH TRÌNH của
         chính nhà mình.
       · NHÂN SỰ (lv < 13) — thấy các màn ĐỂ HIỂU KHÁCH: CRM, đo lường,
         rà soát, trải nghiệm, và bản đồ hành trình để biết khách đang ở
         đâu. Xem theo quyền; giữ bí mật khách; theo Hiến pháp. */
  G.KG_KHACH_KH = ['ban-do','hanh-trinh-con','chu-ky','lo-trinh','tien-bo',
                   'kpi-100','phan-thuong','chan-dung-nha'];
  G.KG_KHACH_NS = ['crm','do-luong-kh','ra-soat-kh','trai-nghiem-kh',
                   'hanh-trinh-con','lo-trinh','ban-do','chan-dung-nha'];

  /* ── KHỐI NGHIỆP VỤ — ứng viên theo vai, renderer cắt theo cap ──
     Ứng viên luôn nhiều hơn cap một chút, để sau khi lọc quyền vẫn đủ. */
  var AZ10 = ['phan-quyen','phong-ban','tai-chinh-qt','nang-luc-ns','studio',
              'crm','noi-dung-tiep-thi','bang-gia','la-chan-30','khoa-dao-tao',
              'bang-viec','dieu-hanh','truy-van-da-chieu','tang-truong'];
  G.KG_VIEC = {
    /* R01 Super Admin · R02 Admin — 10 màn quản trị A→Z */
    R01:{cap:10, ds:AZ10},
    R02:{cap:10, ds:AZ10},
    /* R03 Giám đốc — 8 màn điều hành (đều là màn lv3 mở được) */
    R03:{cap:8, ds:['phong-ban','nang-luc-ns','dieu-hanh','crm','tai-chinh-ceo','con-nguoi',
                    'khoa-dao-tao','bang-viec','do-luong-kh','giam-sat','tang-truong']},
    /* R04 Quản lý chuyên môn — giữ chuẩn nghề toàn đội */
    R04:{cap:5, ds:['nghe-qlcm','nang-luc-ns','tt-cskh','ra-soat-kh',
                    'phong-ban','do-luong-kh','bang-viec','assessment','trai-nghiem-kh']},
    /* R05 Trưởng nhóm Coach */
    R05:{cap:5, ds:['nghe-coach','ban-coach','doi-ngu','bando-coach','bang-viec','xu-ly-ca','coach-deck']},
    /* R06 Senior Coach · R07 Coach */
    R06:{cap:5, ds:['nghe-coach','ban-coach','coach-deck','bando-coach','xu-ly-ca','bang-viec','doi-ngu']},
    R07:{cap:5, ds:['nghe-coach','ban-coach','coach-deck','bando-coach','xu-ly-ca','bang-viec','doi-ngu']},
    /* R08 Giáo viên */
    R08:{cap:5, ds:['nghe-coach','khoa-dao-tao','ban-coach','xu-ly-ca','bang-viec','sat-hach','coach-deck']},
    /* R09 Mentor (lv9 — không mở pro_coach, dùng consult/ca) */
    R09:{cap:5, ds:['nghe-mentor','xu-ly-ca','do-luong-kh','ra-soat-kh','bang-viec','assessment','tt-cskh']},
    /* R10 Chuyên gia đánh giá */
    R10:{cap:5, ds:['nghe-danhgia','assessment','do-luong-kh','ra-soat-kh','bang-viec','sat-hach','trai-nghiem-kh']},
    /* R11 Chuyên gia tư vấn — CRM là CÔNG CỤ CHĂM SÓC KHÁCH của Tư vấn,
       đặt trong Nghiệp vụ; chỉ hiện khi tài khoản được cấp CRM (G.S.crmMuc
       qua màn Phân quyền CRM) — cấp từng người, không mở đại trà. */
    R11:{cap:5, ds:['nghe-tu-van','tt-cskh','crm','ban-tu-van','pheu-chot','bang-viec','do-luong-kh']},
    /* R12 Phân tích dữ liệu (lv12 — bộ màn phân tích nghe_chung) */
    R12:{cap:5, ds:['nghe-phantich','chieu-sau','ma-tran','giam-sat','tu-dong','phuong-phap','bo-nao','ra-soat']}
  };

  /* Bộ mô tả cho cột trái. KHÔNG tự lọc quyền ở đây — chỉ trả danh sách
     ứng viên; cột trái (app.js) lọc qua visible() rồi cắt theo cap, để
     cổng quyền vẫn là một nguồn sự thật duy nhất. */
  G.khongGian = function(){
    var r = (G.S && G.S.roleObj) ? G.S.roleObj : {};
    var id = r.id || '', lv = r.lv || 99;
    var laKhach = lv >= 13;              /* Phụ huynh / Học viên / CTV */
    var v = G.KG_VIEC[id] || null;
    return {
      laKhach: laKhach,
      khach:   laKhach ? G.KG_KHACH_KH : G.KG_KHACH_NS,
      khachCap: laKhach ? 8 : 6,
      khachNote: laKhach
        ? 'Hành trình của chính nhà mình.'
        : 'Xem để hiểu khách — theo đúng quyền của vai. Giữ bí mật thông tin khách · tuân thủ Hiến pháp.',
      viec:    v ? v.ds  : [],
      viecCap: v ? v.cap : 0,
      vaiNhan: r.n  || '',
      vaiMau:  r.c  || 'var(--gita)'
    };
  };

})();
