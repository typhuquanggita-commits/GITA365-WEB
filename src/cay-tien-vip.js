/* ═══════════════════════════════════════════════════════════════
   GITA 365 — CÂY TIỀN VIP · 4 TRỤ · 5 CỤM · 28 NĂNG LỰC  (9.99.213)

   Chủ hệ chốt: "Cây tiền VIP gắn 4 trụ · 5 cụm · 28 năng lực, triển khai
   để CHĂM SÓC hệ thống hồ sơ VIP của khách hàng."

   NGUỒN THẬT: MYVIP.doc (Quyển I — 14 nền tảng → ma trận 28 sức mạnh),
   chủ hệ nạp trên Drive. Màn TRỎ về bản gốc, chép CẤU TRÚC (4 trụ · 5 cụm ·
   28 năng lực), KHÔNG chép toàn văn — bản thứ hai của một bảng sẽ lệch.

   RANH GIỚI (gói NGHỀ · pro_consult): đây là công cụ QUẢN TRỊ chăm sóc VIP,
   khách KHÔNG xem — cùng ranh giới Cây tiền / Cây giá trị (9.99.162). Cây giá
   trị của GIA ĐÌNH ở màn `cay-vip` (mặt khách); màn này là cây NĂNG LỰC của
   KÊNH để chăm sóc hồ sơ VIP.

   ĐỤNG LUẬT KHÔNG BẬT KHỐNG: vài năng lực (Escrow · GITA Moment · Arena · An
   toàn trẻ "từng giây" · Streak · Uplift Pay · Thị Trường Thịnh Vượng) chạm
   luật bất khả sửa / cổng đã chốt. Mỗi cái mang ô `va` TRỎ vào mã luật thật
   (SUP-05 · Điều 13 · L07 · L08 · VIP_CAM · LR1) — trình để BIẾT, không mở.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;
G.VIEWS = G.VIEWS || {};

/* GỐC — 4 trụ (14 nền tảng đỉnh). Hợp nhất bằng phép NHÂN: thiếu một trụ là sụp. */
G.CTV_TRU4 = [
  { ma:'I',   ten:'Kết nối & Hạ tầng liên',      nen:'Facebook · WhatsApp · Telegram · Zalo' },
  { ma:'II',  ten:'Tri thức & Nội dung giá trị',  nen:'YouTube · Pinterest · Reddit' },
  { ma:'III', ten:'Đồng hành thời gian thực',     nen:'Discord · Twitch' },
  { ma:'IV',  ten:'Chân thật & Bản sắc cá nhân',  nen:'BeReal · LinkedIn · Instagram' }
];

/* THÂN — 5 cụm (cỗ máy). Nhóm 28 năng lực theo cỗ máy, không theo số thứ tự. */
G.CTV_CUM5 = [
  { ma:'C1', ten:'Cỗ máy Tri thức & Phân phối',   so:7,  mau:'var(--gita)' },
  { ma:'C2', ten:'Cỗ máy Cộng đồng & Đồng hành',  so:10, mau:'var(--gita-sang)' },
  { ma:'C3', ten:'Cỗ máy Chân thật & Niềm tin',   so:4,  mau:'var(--gita-sau)' },
  { ma:'C4', ten:'Cỗ máy Kinh tế',                so:6,  mau:'var(--ok)' },
  { ma:'C5', ten:'Lớp neo giữ bền',               so:1,  mau:'var(--gold-2)' }
];

/* LÁ — 28 năng lực. `cum` = mã cụm; `va` (nếu có) = mã luật kho mà năng lực
   này chạm — trỏ để BIẾT, không phải để bật. Tổng: 7+10+4+6+1 = 28. */
G.CTV_SM28 = [
  { so:1,  ten:'Uplift Index',              cum:'C1', y:'Đảo hàm mục tiêu: đo tiến bộ thật, không watch-time' },
  { so:2,  ten:'Studio 1 chạm',             cum:'C1', y:'Chi phí sản xuất nội dung giá trị về gần 0' },
  { so:3,  ten:'Cửa hàng tri thức Escrow',  cum:'C1', y:'Đảo cấu trúc rủi ro thương mại', va:'SUP-05' },
  { so:7,  ten:'GITA Cinema',               cum:'C1', y:'Kinh tế "thư viện vĩnh cửu"' },
  { so:8,  ten:'Tìm kiếm ngữ nghĩa',        cum:'C1', y:'Tìm theo ý, không theo từ khoá' },
  { so:15, ten:'Bản tin kiểm chứng',        cum:'C1', y:'Hạ tầng sự thật — tin có nguồn' },
  { so:16, ten:'Kiểm chứng kép',            cum:'C1', y:'Hai lớp xác minh trước khi lên' },
  { so:4,  ten:'Vòng Đồng Hành + GPI nhóm', cum:'C2', y:'Nâng đơn vị đo từ cá nhân lên nhóm' },
  { so:5,  ten:'Gia Đình Space',            cum:'C2', y:'Đơn vị nền tảng — cả nhà một không gian' },
  { so:6,  ten:'Sự kiện 10.000 điểm chạm',  cum:'C2', y:'Cầu nối số ↔ thật' },
  { so:13, ten:'Broadcast 1-triệu-nhiều',   cum:'C2', y:'Một người chạm rất nhiều, vẫn riêng' },
  { so:14, ten:'Bot 24/7 gắn DNA cá nhân',  cum:'C2', y:'Trợ lý theo đúng chất người ấy' },
  { so:18, ten:'Thread chuẩn + Quy tắc 3 câu + Vô Danh có xác thực', cum:'C2', y:'Nói gọn, thật, an toàn' },
  { so:19, ten:'Voice nhịp 6h/21h',         cum:'C2', y:'Nhịp giọng sáng–tối giữ kết nối' },
  { so:20, ten:'6 tầng vai trò + Chứng Chỉ Dẫn Lối', cum:'C2', y:'Kỷ luật thành bằng cấp xã hội' },
  { so:21, ten:'Livestream lớp',            cum:'C2', y:'Lớp học trực tiếp theo nhịp' },
  { so:28, ten:'Arena',                     cum:'C2', y:'Đồng hành có "đấu trường"', va:'VIP_CAM C1 · LR1' },
  { so:9,  ten:'Nhãn ✅ bắt buộc',           cum:'C3', y:'Dàn dựng/chỉnh sửa phải khai — trị "áp lực đẹp"' },
  { so:10, ten:'GITA Moment',               cum:'C3', y:'Khoảnh khắc thật, camera kép, giờ ngẫu nhiên', va:'L07 · Điều 13' },
  { so:23, ten:'Xác thực dữ liệu thật',     cum:'C3', y:'Bằng chứng kiểm chứng = điều kiện GITA-VIP' },
  { so:26, ten:'An toàn trẻ em "từng giây"',cum:'C3', y:'Bảo vệ trẻ theo thời gian thực', va:'VIP_CAM (TRE) · Điều 13' },
  { so:11, ten:'Siêu App 5 động từ',        cum:'C4', y:'Học · Rèn · Kết nối · Kiếm · Cho đi' },
  { so:12, ten:'Mã hoá đầu-cuối mặc định',  cum:'C4', y:'Tuyên ngôn kiến trúc niềm tin' },
  { so:17, ten:'Thị Trường Thịnh Vượng',    cum:'C4', y:'"LinkedIn bằng bằng chứng, không bằng lời khoe"', va:'SUP-05' },
  { so:22, ten:'Thư viện Cảm Hứng',         cum:'C4', y:'Nút "bắt đầu 5 phút"' },
  { so:24, ten:'Cập nhật 1 dòng "Hôm nay tôi đã…"', cum:'C4', y:'Cam kết công khai vi mô' },
  { so:25, ten:'Uplift Pay',                cum:'C4', y:'Trả theo tác động thật, không theo lượt xem', va:'SUP-05' },
  { so:27, ten:'Streak + hồ sơ không bỏ + gia đình níu chân', cum:'C5', y:'Ba lớp neo gắn bó', va:'L08 · VIP_CAM C4–C5' }
];

/* Cơ chế TẠO & NHẬN giá trị (không qua bảng quyền lợi theo hạng). */
G.CTV_COCHE = [
  { ten:'5 động từ', y:'Học → Rèn → Kết nối → Kiếm → Cho đi — vòng tạo-nhận giá trị khép kín (NL 11).' },
  { ten:'Ripple Index', y:'"Tiền tệ danh dự" — đo bằng TIẾN BỘ của người khác mình giúp; không mua, không farm. Công bố ở Gala Vinh Danh 365.' },
  { ten:'6 tầng vai trò', y:'Giá trị NHẬN được — thăng theo kỷ luật + đóng góp kiểm chứng; khách hàng → người cung cấp (NL 20).' }
];

/* TRIỂN KHAI CHĂM SÓC HỒ SƠ VIP — mỗi cụm là một TRỤC chăm sóc, TRỎ vào màn
   đã có (không dựng lại): cây tiền này là bản đồ NĂNG LỰC, việc chăm sóc thật
   chạy ở các cửa/màn dưới. */
G.CTV_CHAM = [
  { cum:'C1', truc:'Cấp đúng tri thức theo tầng hồ sơ VIP', tro:'kho-tai-lieu', troTen:'Kho tài liệu' },
  { cum:'C2', truc:'Đồng hành & giữ nhịp hồ sơ VIP',        tro:'cay-tien',     troTen:'Cây tiền · chăm sóc VIP' },
  { cum:'C3', truc:'Xác thực & bảo vệ hồ sơ VIP thật',      tro:'hoso-vip',     troTen:'Chuẩn hồ sơ VIP' },
  { cum:'C4', truc:'Giá trị & quyền lợi theo hạng VIP',     tro:'hang-vip',     troTen:'Phân hạng VIP' },
  { cum:'C5', truc:'Neo giữ bền — chống rời bỏ',            tro:'van-hanh-cham-soc', troTen:'Vận hành & chăm sóc' }
];
G.CTV_NGUON = 'MYVIP · Quyển I (14 nền tảng → 28 sức mạnh) — Drive chủ hệ';

(function () {
  var U = G.U, h = U.h, ic = U.ic;
  function cumTen(ma){ var c = G.CTV_CUM5.filter(function(x){return x.ma===ma;})[0]; return c?c.ten:ma; }
  function cumMau(ma){ var c = G.CTV_CUM5.filter(function(x){return x.ma===ma;})[0]; return c?c.mau:'var(--gita)'; }

  G.VIEWS['cay-tien-vip'] = function () {
    if (!G.can('pro_consult')) return U.lockCard();

    var o = U.ph({ eyebrow:'CHĂM SÓC VIP · QUẢN TRỊ', ic:'seed', grad:1,
      t:'Cây tiền VIP — 4 trụ · 5 cụm · 28 năng lực',
      lead:'Cây NĂNG LỰC của kênh để chăm sóc hồ sơ VIP: bốn trụ nền tảng (gốc) → năm cỗ máy ' +
        '(thân) → 28 sức mạnh (lá). Đây là bản đồ năng lực; việc chăm sóc thật chạy ở các cửa được trỏ. ' +
        'Nguồn: ' + h(G.CTV_NGUON) });

    o += U.bdSoHang([
      {k:'Trụ nền tảng', v:'4', c:'var(--gita)', d:'14 nền tảng đỉnh'},
      {k:'Cỗ máy (cụm)', v:'5', c:'var(--gita-sau)'},
      {k:'Năng lực (sức mạnh)', v:'28', c:'var(--ok)', d:'7·10·4·6·1'},
      {k:'Đụng luật — trỏ cổng', v:String(G.CTV_SM28.filter(function(s){return s.va;}).length), c:'var(--warn)', d:'không bật khống'}
    ]);

    /* GỐC — 4 trụ */
    o += U.sec('GỐC — 4 TRỤ NỀN TẢNG', 'Hợp nhất bằng phép NHÂN: thiếu một trụ là cả cây sụp.');
    o += '<div class="grid g2">' + G.CTV_TRU4.map(function (t) {
      return '<div class="card pad-sm"><b class="sm">Trụ ' + h(t.ma) + ' · ' + h(t.ten) + '</b>' +
        '<p class="tiny muted mt">' + h(t.nen) + '</p></div>';
    }).join('') + '</div>';

    /* THÂN — 5 cụm */
    o += U.sec('THÂN — 5 CỖ MÁY (CỤM)', 'Mỗi cụm gom một nhóm năng lực theo chức năng, không theo số.');
    o += '<div class="grid g2">' + G.CTV_CUM5.map(function (c) {
      return '<div class="card pad-sm" style="border-left:3px solid ' + c.mau + '">' +
        '<b class="sm">' + h(c.ma) + ' · ' + h(c.ten) + '</b>' +
        '<span class="chip" style="margin-left:6px">' + c.so + ' năng lực</span></div>';
    }).join('') + '</div>';

    /* LÁ — 28 năng lực theo cụm */
    o += U.sec('LÁ — 28 SỨC MẠNH', 'Nhóm theo cụm. Ô "Đụng luật" trỏ vào mã cổng thật — trình để BIẾT, không mở.');
    G.CTV_CUM5.forEach(function (c) {
      var la = G.CTV_SM28.filter(function (s) { return s.cum === c.ma; });
      o += '<p class="tiny" style="margin:12px 0 4px;color:' + c.mau + ';font-weight:700">' +
        h(c.ma) + ' · ' + h(c.ten) + '</p>';
      o += '<div class="card">' + U.tbl(['#', 'Năng lực', 'Là gì', 'Đụng luật'],
        la.map(function (s) {
          return ['<b class="mono sm">' + s.so + '</b>', '<b class="sm">' + h(s.ten) + '</b>',
            '<span class="tiny muted">' + h(s.y) + '</span>',
            s.va ? '<span class="chip" style="border:1px solid var(--warn);color:var(--warn)">' + h(s.va) + '</span>' : '<span class="tiny dim">—</span>'];
        })) + '</div>';
    });

    /* Cơ chế tạo & nhận giá trị */
    o += U.sec('TẠO & NHẬN GIÁ TRỊ', 'Không qua bảng quyền lợi theo hạng — qua ba cơ chế sống.');
    o += '<div class="card">' + U.tbl(['Cơ chế', 'Là gì'],
      G.CTV_COCHE.map(function (m) { return ['<b class="sm">' + h(m.ten) + '</b>', '<span class="tiny">' + h(m.y) + '</span>']; })) + '</div>';

    /* Triển khai chăm sóc hồ sơ VIP */
    o += U.sec('TRIỂN KHAI — CHĂM SÓC HỒ SƠ VIP', 'Mỗi cụm là một TRỤC chăm sóc, trỏ vào cửa/màn đã có. Bấm để mở.');
    o += '<div class="card">' + U.tbl(['Cụm', 'Trục chăm sóc hồ sơ VIP', 'Mở'],
      G.CTV_CHAM.map(function (m) {
        return ['<span class="chip" style="border:1px solid ' + cumMau(m.cum) + '">' + h(m.cum) + '</span>',
          '<b class="sm">' + h(m.truc) + '</b>',
          '<button class="chip" data-v="' + h(m.tro) + '" style="cursor:pointer;border:1px solid var(--gita-vien-2)">' +
            ic('compass', 'w-3 h-3') + h(m.troTen) + '</button>'];
      })) + '</div>';

    /* Ranh giới luật */
    o += '<div class="card pad-sm mt" style="border-color:var(--warn)">' + ic('shield', 'w-4 h-4') +
      ' <b class="sm">Năng lực đụng luật đi qua cổng đã có, không bật ở đây.</b>' +
      '<p class="tiny muted mt" style="line-height:1.7">Escrow · Thị Trường · Uplift Pay chờ giấy phép trung gian thanh toán ' +
      '(SUP-05, hỏi luật sư trước đồng tiền đầu tiên). GITA Moment · An toàn trẻ "từng giây" · Arena chạm dữ liệu trẻ / ' +
      'xếp hạng trẻ — giữ theo Điều 13 · L07 · VIP_CAM · LR1. Streak giữ chân theo L08. Bản đồ này TRÌNH để biết năng lực ' +
      'nào cần cổng nào, không phải để mở.</p></div>';

    return o;
  };
})();
