/* ═══════════════════════════════════════════════════════════════
   GITA 365 — THAM SỐ HỆ THỐNG CREDIT (BẢN CHỜ CHỦ HỆ DUYỆT)

   Một chỗ cho mọi con số của hệ credit. Màn "Hệ thống Credit" và bảng
   duyệt đều TÍNH từ đây — đổi một tham số là cả bảng 5 tầng × 10 cấp,
   bảng quy đổi hoạt động và mã coach đổi theo, không ai sửa tay từng ô.

     ty          10 đồng = 1 credit (chủ hệ chốt)
     tang        giá gói từng tầng: đọc giá đang chạy ở máy chủ (docBangGia)
                 khi đã nối; chưa nối thì dùng đúng GIA_KHOI_DAU của máy chủ.
     quy         gói chia vào 5 quỹ (tổng 100%)
     trongSoCap  độ khó tăng dần trong tầng: cấp c có trọng số 1 + 0,1·(c−1)
     nhom        nhóm khách hàng → mã + hệ số công sức coach
     tuyen       tuyến chuyên môn → tiền tố mã
     tieu        hoạt động TIÊU credit, tính bằng bội số của "1 buổi coach chuẩn"
     thuong      hoạt động TÍCH credit thưởng, chia từ quỹ thưởng của gói
     luat        luật dùng chung cho mọi cấp, mọi tầng

   TRẠNG THÁI: ĐÃ DUYỆT (R01, 07/10/2026). Ví credit thật ở máy chủ
   (may-chu/credit.js) — hai bên phải khớp; tools/thu-credit.mjs so từng số.
   Gói T2 (CR-2026.10-d): hai lựa chọn 500.000đ → 300.000 credit và
   868.000đ → 1.000.000 credit. Vẫn 10đ = 1 credit — phần vượt tiền đã trả
   là credit TẶNG theo gói. Bảng giá hoạt động T2 tính trên ngân sách chuẩn
   crChuan 300.000 credit, không theo giá gói.
   Không đụng máy chủ · giấy phép · mã hoá.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;

G.CR_THAMSO = {
  phienBan:'CR-2026.10-d', trangThai:'da-duyet',
  duyet:{ boi:'R01 · Trương Nhật Quang', ngay:'2026-10-07', ghi:'Tầng 2 hai lựa chọn: 500.000đ → 300.000 credit · 868.000đ → 1.000.000 credit (thay mức 3.000.000đ); giữ 10đ = 1 credit, phần vượt tiền đã trả là credit tặng theo gói. Giữ nguyên: T1 tặng 2.000, đăng ký tặng 3.000/5.000/8.000/12.000, thứ tự trừ tặng → thưởng → trả phí, T1 tính 30 ngày.' },
  ty:10,
  /* gia: đồng · ngay: thời lượng chuẩn · buoi: buổi coach chính của chương trình tầng (G.CO_CT)
     · pha: số cổng nghiệm thu · tangCr: credit TẶNG của tầng 1 (gói 0đ) · dangKy: credit TẶNG khi
     thành viên đăng ký tài khoản ở tầng ấy. Hai mức tặng do chủ hệ chốt 10/2026; Học viện chịu. */
  tang:[
    { t:1, ten:'NHẬN DIỆN', gia:0,        ngay:30,  buoi:3,  pha:3, tangCr:2000, dangKy:0 },
    { t:2, ten:'GIẢI MÃ',   gia:500000,   ngay:21,  buoi:6,  pha:3, dangKy:3000, crChuan:300000,
      goi:[ { ma:'T2-500', ten:'Lựa chọn 1', gia:500000, cr:300000 }, { ma:'T2-868', ten:'Lựa chọn 2', gia:868000, cr:1000000 } ] },
    { t:3, ten:'KIẾN TẠO',  gia:10000000, ngay:90,  buoi:12, pha:4, dangKy:5000 },
    { t:4, ten:'CHUYỂN HÓA',gia:30000000, ngay:365, buoi:24, pha:4, dangKy:8000 },
    { t:5, ten:'BỨT PHÁ',   gia:50000000, ngay:365, buoi:24, pha:4, dangKy:12000 }
  ],
  quy:[
    { ma:'coach',   ten:'Dịch vụ coach',          ty:0.60, mo:'Buổi 1-1, buổi nhóm, buổi riêng cha mẹ, nghiệm thu cổng' },
    { ma:'hoclieu', ten:'Học liệu & đánh giá',    ty:0.15, mo:'Tài liệu mở thêm ngoài trần 30%, bộ test, đánh giá chuyên sâu, chứng nhận' },
    { ma:'sukien',  ten:'Sự kiện & cộng đồng',    ty:0.10, mo:'Lớp nhóm, sự kiện, kết nối gia đình cùng tầng' },
    { ma:'thuong',  ten:'Quỹ thưởng hoạt động',   ty:0.10, mo:'Credit thưởng trả lại cho từng hoạt động của khách — quỹ có sẵn trong gói nên không phát sinh nợ' },
    { ma:'duphong', ten:'Dự phòng & chăm sóc',    ty:0.05, mo:'Hỗ trợ khẩn, gia hạn, ca phát sinh' }
  ],
  trongSoCap:function(c){ return 1 + 0.1*(c-1); },
  nguongLenCap:0.6,     /* lên cấp: tích ≥ 60% credit thưởng của cấp + đạt mốc cấp do Coach xác nhận */
  nhom:[
    { ma:'TH', ten:'Tiểu học (6–10 tuổi, cha mẹ dẫn)',   hs:0.90 },
    { ma:'CS', ten:'THCS (11–14 tuổi)',                  hs:1.00 },
    { ma:'PT', ten:'THPT & thi cử (15–18 tuổi)',         hs:1.15 },
    { ma:'SV', ten:'Sinh viên & người trẻ (18–24)',      hs:1.00 },
    { ma:'PH', ten:'Phụ huynh đồng hành',                hs:0.90 },
    { ma:'GD', ten:'Gia đình toàn diện (≥ 3 người)',     hs:1.30 }
  ],
  tuyen:[ { ma:'GT', ten:'GITA365' }, { ma:'EN', ten:'ENGWIN365' }, { ma:'MA', ten:'MATH365' }, { ma:'SA', ten:'SAT365' }, { ma:'HS', ten:'HSA365' } ],
  /* bs: bội số của 1 buổi coach chuẩn của tầng · quy: quỹ chi trả */
  tieu:[
    { ma:'buoi-11',   ten:'Buổi coach 1-1 (60 phút)',           bs:1.00, quy:'coach' },
    { ma:'buoi-nhom', ten:'Buổi coach nhóm (≤ 6 nhà)',          bs:0.40, quy:'coach' },
    { ma:'buoi-pm',   ten:'Buổi riêng cho cha mẹ',              bs:0.80, quy:'coach' },
    { ma:'cong',      ten:'Nghiệm thu cổng với Quản lý chuyên môn', bs:0.50, quy:'coach' },
    { ma:'danh-gia',  ten:'Đánh giá chuyên sâu (Assessor)',     bs:1.00, quy:'hoclieu' },
    { ma:'test',      ten:'Bộ test nhận diện chuyên sâu',       bs:0.15, quy:'hoclieu' },
    { ma:'tai-lieu',  ten:'Mở thêm 1 tài liệu ngoài trần 30%',  bs:0.03, quy:'hoclieu' },
    { ma:'su-kien',   ten:'Lớp / sự kiện cộng đồng',            bs:0.30, quy:'sukien' },
    { ma:'khan',      ten:'Hỗ trợ khẩn ngoài lịch (30 phút)',   bs:0.50, quy:'duphong' },
    { ma:'gia-han',   ten:'Gia hạn 30 ngày giữ chỗ Coach',      bs:0.60, quy:'duphong' }
  ],
  /* ty: phần của quỹ thưởng · dem(tang): số lần tối đa trong cả tầng */
  thuong:[
    { ma:'tick',    ten:'Tick việc hôm nay',               ty:0.25, dem:function(T){ return T.ngay; } },
    { ma:'nhatky',  ten:'Ghi nhật ký',                     ty:0.10, dem:function(T){ return Math.floor(T.ngay/2); } },
    { ma:'nv',      ten:'Hoàn thành nhiệm vụ đúng hạn',    ty:0.20, dem:function(T){ return T.buoi*3; } },
    { ma:'mc',      ten:'Minh chứng được Coach duyệt',     ty:0.15, dem:function(T){ return T.buoi*3; } },
    { ma:'chuoi',   ten:'Giữ chuỗi đủ 7 ngày',             ty:0.10, dem:function(T){ return Math.max(1, Math.floor(T.ngay/7)); } },
    { ma:'cong',    ten:'Đạt cổng nghiệm thu',             ty:0.15, dem:function(T){ return T.pha; } },
    { ma:'phanhoi', ten:'Chấm buổi coach (1–5)',           ty:0.05, dem:function(T){ return T.buoi; } }
  ],
  luat:[
    '1 credit = 10 đồng, cố định cho mọi cấp, mọi tầng, mọi tuyến.',
    'Credit TRẢ PHÍ nạp từ gói: dùng ở mọi cấp và mọi tầng; còn dư khi lên tầng thì trừ thẳng vào giá tầng sau.',
    'Credit THƯỞNG chia từ quỹ thưởng 10% của gói: chỉ dùng trong hệ (tài liệu, sự kiện, buổi bổ sung, trừ tối đa 10% giá tầng sau); không đổi ra tiền; hạn 12 tháng.',
    'Credit TẶNG tầng 1: 2.000 credit (chủ hệ chốt) — Học viện chịu, không đổi ra tiền, hết hạn khi kết thúc tầng 1.',
    'Gói tầng 2 (chủ hệ chốt): lựa chọn 1 — 500.000đ nhận 300.000 credit (50.000 trả phí + 250.000 tặng theo gói); lựa chọn 2 — 868.000đ nhận 1.000.000 credit (86.800 trả phí + 913.200 tặng theo gói). Credit tặng theo gói ghi khi nạp phiếu thu đúng giá lựa chọn; Học viện chịu, dùng trước, không đổi ra tiền, không hoàn.',
    'Credit TẶNG khi đăng ký tài khoản (chủ hệ chốt): tầng 2 · 3.000 · tầng 3 · 5.000 · tầng 4 · 8.000 · tầng 5 · 12.000 credit — cộng thêm vào ví, ngoài credit của gói; Học viện chịu; không đổi ra tiền, không hoàn; mỗi tài khoản nhận một lần cho mỗi tầng.',
    'Thứ tự trừ (đã duyệt): credit tặng trừ trước, rồi credit thưởng, sau cùng mới tới credit trả phí.',
    'Lên cấp: tích ≥ 60% credit thưởng của cấp và đạt mốc cấp do Coach xác nhận bằng bằng chứng.',
    'Giá credit của một hoạt động = bội số × 1 buổi coach chuẩn của tầng × hệ số độ khó của cấp × hệ số nhóm khách hàng.',
    'Hoàn tiền: chỉ phần credit trả phí chưa dùng, theo điều khoản hoàn của gói (HP_TANG). Credit thưởng và credit tặng (tầng 1, đăng ký, theo gói) không hoàn.',
    'Ví credit thật đặt ở máy chủ (sổ cái ghi từng giao dịch, không ghi đè); trình duyệt chỉ hiển thị.'
  ]
};
