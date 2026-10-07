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
                             đốc) · 6 (các vai còn lại, mở đầu bằng Bảng điều khiển của tôi)
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
  G.KG_KHACH_NS = ['crm','do-luong-he','ra-soat-kh','trai-nghiem-kh','do-luong-kh',
                   'hanh-trinh-con','lo-trinh','ban-do','chan-dung-nha'];

  /* ── KHỐI NGHIỆP VỤ — ứng viên theo vai, renderer cắt theo cap ──
     Ứng viên luôn nhiều hơn cap một chút, để sau khi lọc quyền vẫn đủ. */
  /* V50 (07/10/2026): không gian làm việc chỉ còn CÔNG CỤ SỐNG — nhập liệu,
     giao việc, đo được. Màn mẫu (dieu-hanh, coach-deck, doi-ngu, tai-chinh-qt,
     tang-truong…) đã gộp vào công cụ thật (src/data-v50.js); màn học thuyết
     đọc ở Thư viện vận hành, kèm bảng việc áp dụng. tools/thu-ap-dung.mjs
     canh: không vai nhân sự nào còn trỏ vào màn mẫu đã gộp. */
  var AZ10 = ['trung-tam-do','dk-cua-toi','phong-tai-chinh','crm','coach-dp','do-luong-he','phan-quyen','nang-luc-ns',
              'bang-viec','thu-vien-v50','phong-ban','credit-gita','nguoi-dung','studio','noi-may-chu'];
  G.KG_VIEC = {
    /* R01 Super Admin · R02 Admin — 10 công cụ quản trị */
    R01:{cap:10, ds:AZ10},
    R02:{cap:10, ds:AZ10},
    /* R03 Giám đốc — 8 công cụ điều hành */
    R03:{cap:8, ds:['trung-tam-do','dk-cua-toi','phong-tai-chinh','crm','coach-dp','do-luong-he','nang-luc-ns','bang-viec',
                    'thu-vien-v50','phong-ban','tai-chinh-ceo','con-nguoi']},
    /* R04 Quản lý chuyên môn — giữ chuẩn nghề toàn đội */
    R04:{cap:6, ds:['dk-cua-toi','do-luong-he','coach-cl','nang-luc-ns','tt-cskh','bang-viec','thu-vien-v50','nghe-qlcm','ra-soat-kh','assessment']},
    /* R05 Trưởng nhóm Coach — điều phối, chất lượng, đo lường */
    R05:{cap:7, ds:['dk-cua-toi','coach-he','coach-dp','coach-cl','do-luong-he','bang-viec','thu-vien-v50','xu-ly-ca','nghe-tncoach']},
    /* R06 Senior Coach · R07 Coach — chương trình, thiết kế bài, ca */
    R06:{cap:7, ds:['dk-cua-toi','coach-he','coach-dp','coach-ct','coach-tk','do-luong-he','bang-viec','thu-vien-v50','xu-ly-ca','nghe-coach']},
    R07:{cap:7, ds:['dk-cua-toi','coach-he','coach-dp','coach-ct','coach-tk','do-luong-he','bang-viec','thu-vien-v50','xu-ly-ca','nghe-coach']},
    /* R08 Giáo viên */
    R08:{cap:7, ds:['dk-cua-toi','coach-he','khoa-dao-tao','sat-hach','coach-tk','do-luong-he','bang-viec','thu-vien-v50','xu-ly-ca']},
    /* R09 Mentor (lv9 — không mở pro_coach, dùng consult/ca) */
    R09:{cap:6, ds:['dk-cua-toi','coach-pt','xu-ly-ca','do-luong-he','tt-cskh','bang-viec','thu-vien-v50','ra-soat-kh','assessment']},
    /* R10 Chuyên gia đánh giá */
    R10:{cap:6, ds:['dk-cua-toi','assessment','coach-pt','do-luong-he','bang-viec','thu-vien-v50','sat-hach','ra-soat-kh']},
    /* R11 Chuyên gia tư vấn — CRM là CÔNG CỤ CHĂM SÓC KHÁCH của Tư vấn,
       đặt trong Nghiệp vụ; chỉ hiện khi tài khoản được cấp CRM (G.S.crmMuc
       qua màn Phân quyền CRM) — cấp từng người, không mở đại trà. */
    R11:{cap:6, ds:['dk-cua-toi','tt-cskh','crm','coach-pt','do-luong-he','bang-viec','thu-vien-v50','pheu-chot']},
    /* R12 Phân tích dữ liệu — đo lường, việc tối ưu được giao */
    R12:{cap:6, ds:['dk-cua-toi','do-luong-he','trung-tam-do','bang-viec','thu-vien-v50','nghe-phantich','chieu-sau','ma-tran']},
    /* R13 Phụ huynh · R14 Học viên — bảng điều khiển 10 màn của nhà mình
       (dk-vai.js) đứng đầu, rồi hai màn mở mỗi ngày. */
    R13:{cap:5, ds:['dk-cua-toi','ho-so-thang','vi-credit','hom-nay','nhiem-vu']},
    R14:{cap:5, ds:['dk-cua-toi','ho-so-thang','vi-credit','hom-nay','nhiem-vu']},
    /* R15 CTV / Đại sứ giới thiệu */
    R15:{cap:6, ds:['dk-cua-toi','nghe-daisu','dai-su','hoa-hong','su-kien','ket-noi','ve-tinh']}
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
