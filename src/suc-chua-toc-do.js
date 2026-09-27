/* ═══════════════════════════════════════════════════════════════
   GITA 365 — SỨC CHỨA & TỐC ĐỘ (chạy nhanh & chứa nhiều trên Cloudflare)

   Chủ hệ muốn bộ não "cấp 1TB, xử lý nhanh và ưu việt nhất". Màn này trả
   lời đúng ý ấy bằng thứ ĐO ĐƯỢC, không bằng một con số tự khai.

   ══ "1TB" LÀ DUNG LƯỢNG, KHÔNG PHẢI MỨC CỦA BỘ NÃO ══

   Đặt một ô "cấp 1TB" vào bộ não không làm nó nghĩ giỏi hơn hay trả lời
   nhanh hơn — đó là cái bẫy ×100 (SUP-01), WOW, điểm 1000 mà kho đã gỡ ba
   lần: một con số để rồi có người chạy cho đủ. Nên ở đây KHÔNG có ô số nào
   tự xưng "1TB/dung lượng/tốc độ". Sức chứa THẬT đo bằng cửa doSucChua
   (đếm thẳng trong D1 lúc gọi); "1TB" đạt được bằng R2 (chứa hàng TB thật)
   cộng chia mảnh D1, chứ không bằng một cái nút.

   ══ NĂM TRỤ TỐC ĐỘ — TRỎ VÀO CƠ CHẾ THẬT, KHÔNG CHÉP ══

   Kiến trúc GITA365 đã đi đúng hướng nhanh-ở-quy-mô-lớn: việc nặng ở máy
   khách, chỉ mục đường tra nóng, Workers tự co giãn, R2 cho vật to. Mỗi
   trụ TRỎ vào một cơ chế THẬT (tệp/binding/chỉ mục đã có), và nói thẳng
   trụ nào ĐANG CHẠY, trụ nào là ĐƯỜNG LỚN LÊN chưa dựng — một khung khoe
   "đã tối ưu hết" mà nửa là lời hứa thì tệ hơn nói thật (9.99.62).

   ══ NÓI RA GIỚI HẠN CLOUDFLARE ══

   D1 có trần dung lượng mỗi cơ sở dữ liệu; Workers có trần thời gian mỗi
   lượt. Màn nói ra cả trần LẪN đường vượt trần (chia mảnh · R2) — một lớp
   không nói giới hạn thì người đọc tin nó chứa được nhiều hơn thật (9.99.57).
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;
G.VIEWS = G.VIEWS || {};

/* ══ NĂM TRỤ TỐC ĐỘ & SỨC CHỨA. `co`: dangChay (đã có, đo được) hoặc
   duongLon (đường lớn lên, CHƯA dựng — nói thẳng). `troVao`: cơ chế thật
   để lần về. ══ */
G.SC_TRU = [
  { ma: 'SC1', ten: 'Việc nặng chạy ở máy khách', co: 'dangChay',
    troVao: ['gita-app.js', 'docs/CHI_PHI.md'],
    vi: 'Giao diện dựng trong máy, tra cứu chạy trong máy — máy chủ chỉ xác thực, cấp khoá, ' +
      'ghi nhật ký. Nhờ đó chi phí và độ trễ KHÔNG tăng theo lượt mở app, chỉ tăng theo số ' +
      'gia đình mới. Đây là lý do gốc khiến hệ nhanh ở quy mô lớn.' },
  { ma: 'SC2', ten: 'Chỉ mục đúng đường tra nóng', co: 'dangChay',
    troVao: ['may-chu/csdl.sql (chỉ mục)'],
    vi: 'Tìm một nhà trong hàng trăm nghìn nhà vẫn nhanh vì D1 có chỉ mục trên đúng đường tra ' +
      'chạy mỗi ngày (ngày tham gia, mã khách, phiên). Đo được: cửa doSucChua đếm số chỉ mục thật.' },
  { ma: 'SC3', ten: 'Bộ nhớ đệm ở biên', co: 'duongLon',
    troVao: ['Cloudflare Cache API', 'KV (chưa nối)'],
    vi: 'Câu hỏi lặp (bảng giá, cấu hình, nội dung tĩnh) trả lời tức thì ở biên, không chạm D1. ' +
      'CHƯA dựng — Cache API dùng được không cần binding; KV cần tạo namespace. Đây là đường lớn ' +
      'lên, nói thẳng chứ không khoe đã có.' },
  { ma: 'SC4', ten: 'Workers tự co giãn', co: 'dangChay',
    troVao: ['may-chu/worker.js', 'may-chu/wrangler.toml'],
    vi: 'Cửa vào chạy ở hàng trăm nơi cùng lúc và tự co giãn theo lượt gọi — 100.000 khách giờ ' +
      'cao điểm không nghẽn, không phải nâng cấp một cái máy. Trần Apps Script (~30 lượt đồng ' +
      'thời) là lý do phải sang Workers khi đông (docs/TRIEN_KHAI_WEB.md).' },
  { ma: 'SC5', ten: 'Tệp lớn ở R2 · chia mảnh D1 khi vượt trần', co: 'dangChay',
    troVao: ['wrangler.toml (binding HOSO = R2)'],
    vi: 'Đây MỚI là chỗ "1TB" có nghĩa: video, ảnh, gói kho, sao lưu để ở R2 (chứa hàng TB thật, ' +
      'binding HOSO đã có), D1 chỉ giữ chỉ mục và bản ghi. Vượt trần một D1 thì CHIA MẢNH nhiều ' +
      'D1 — CRM đã lọc/phân trang ở máy chủ nên chia mảnh không đổi bề mặt (đường lớn lên).' }
];

/* ══ GIỚI HẠN CLOUDFLARE — NÓI RA TRẦN LẪN ĐƯỜNG VƯỢT TRẦN. Đây là nguồn
   DUY NHẤT của phần giải thích giới hạn; máy chủ chỉ trả về SỐ ĐO. ══ */
G.SC_TRAN = [
  { ma: 'D1', ten: 'Cơ sở dữ liệu D1',
    gioiHan: 'Mỗi cơ sở dữ liệu D1 có trần dung lượng (hàng GB) và trần số lượt truy vấn mỗi lượt Worker.',
    duong: 'Vượt trần thì CHIA MẢNH: nhiều D1 theo vùng/nhóm khách. Kiến trúc CRM đã lọc và phân ' +
      'trang ở máy chủ nên chia mảnh không đổi bề mặt người dùng.' },
  { ma: 'WK', ten: 'Workers (cửa vào)',
    gioiHan: 'Mỗi lượt Worker có trần thời gian CPU và bộ nhớ; bù lại chạy ở hàng trăm nơi cùng lúc.',
    duong: 'Giữ mỗi lượt NHẸ (việc nặng ở máy khách), truyền dòng với đáp ứng lớn. Workers tự co ' +
      'giãn theo lượt gọi — không phải nâng cấp máy.' },
  { ma: 'R2', ten: 'R2 — nơi "1TB" có nghĩa',
    gioiHan: 'R2 chứa tới hàng TERABYTE thật và không tính phí lượt tải ra (egress).',
    duong: 'Vật to (video, ảnh, kho, sao lưu) để ở R2 (binding HOSO đã có), không nhồi vào D1. ' +
      'Đây là cách đạt "1TB" thật — bằng chỗ chứa đúng loại, không bằng một con số.' }
];

(function () {
  var U = G.U, h = U.h, ic = U.ic;

  function veTro(ds) {
    return (ds || []).map(function (x) { return '<code>' + h(x) + '</code>'; }).join(' · ');
  }
  function nhan(co) {
    return co === 'dangChay'
      ? '<span class="sc-tt sc-chay">đang chạy · đo được</span>'
      : '<span class="sc-tt sc-lon">đường lớn lên · chưa dựng</span>';
  }

  /* Nút đo thật — gọi doSucChua rồi rót kết quả vào #sc_kq. Không tự khai;
     số đến từ D1 lúc gọi. */
  G.scDo = function () {
    var o = document.getElementById('sc_kq');
    if (!o) return;
    if (!G.goiMayChu) { o.innerHTML = '<p class="note">Bản mẫu chưa nối máy chủ — số đo thật cần máy chủ Cloudflare.</p>'; return; }
    o.innerHTML = '<p class="note">Đang đo…</p>';
    G.goiMayChu('doSucChua', {}).then(function (x) {
      if (!x || !x.ok) { o.innerHTML = '<p class="note">' + h((x && x.error) || 'Không đo được.') + '</p>'; return; }
      function so(n) { return (n === null || n === undefined) ? '<i>không đo được</i>' : Number(n).toLocaleString('vi-VN'); }
      var s = '<div class="sc-do">' +
        '<div class="sc-do-hang"><b>' + so(x.soBang) + '</b><span>bảng dữ liệu</span></div>' +
        '<div class="sc-do-hang"><b>' + so(x.soChiMuc) + '</b><span>chỉ mục (đường tra nhanh)</span></div>' +
        '<div class="sc-do-hang"><b>' + so(x.dongTong) + '</b><span>dòng ở ' + so(x.doDuocMayBang) + ' bảng nóng</span></div>' +
        '<div class="sc-do-hang"><b>' + (x.r2CoBinding ? 'CÓ' : 'CHƯA') + '</b><span>R2 cho tệp lớn (hàng TB)</span></div>' +
        '</div>';
      if (x.dongLon && x.dongLon.length) {
        s += '<div class="sc-bang-nong">' + x.dongLon.slice(0, 8).map(function (r) {
          return '<span class="sc-nong-o"><code>' + h(r.bang) + '</code> ' + so(r.so) + '</span>';
        }).join('') + '</div>';
      }
      s += '<p class="note sc-note">' + h(x.vi || '') + '</p>';
      o.innerHTML = s;
    }).catch(function (e) {
      o.innerHTML = '<p class="note">' + h((e && e.message) || 'Lỗi khi đo.') + '</p>';
    });
  };

  G.VIEWS['suc-chua-toc-do'] = function () {
    var tru = G.SC_TRU || [], tran = G.SC_TRAN || [];
    var o = '<div class="hd"><h2>' + ic('vault') + ' Sức chứa & Tốc độ</h2>' +
      '<p class="sub">Bộ não GITA365 chạy <b>nhanh và chứa được nhiều</b> trên Cloudflare bằng ' +
      '<b>năm trụ</b> — không bằng một con số. <b>"1TB" là dung lượng</b>, đạt bằng <b>R2</b> ' +
      '(chứa hàng TB thật) cộng chia mảnh D1, không phải một mức của bộ não. Sức chứa thật <b>đo ' +
      'được</b> ở cửa dưới, không tự khai.</p></div>';

    /* ── NGĂN 1 · ĐO THẬT ── */
    o += '<h3 class="sc-h">' + ic('pulse') + ' Đo sức chứa thật (lúc này)</h3>';
    o += '<p class="note sc-note">Số đến từ D1 lúc bấm — con số già nhất vài trăm mili giây, ' +
      'không phải một ô ghi tay cũ đi lặng lẽ. Ô để trống nghĩa là KHÔNG đo được, khác số 0.</p>';
    o += '<button class="btn primary" onclick="G.scDo()" style="gap:7px">' + ic('pulse') + ' Đo ngay</button>';
    o += '<div id="sc_kq" class="sc-kq"></div>';

    /* ── NGĂN 2 · NĂM TRỤ ── */
    o += '<h3 class="sc-h">' + ic('lightning') + ' Năm trụ tốc độ & sức chứa</h3>';
    o += '<div class="sc-tru">';
    tru.forEach(function (t) {
      o += '<div class="sc-tru-o' + (t.co === 'duongLon' ? ' sc-tru-lon' : '') + '">' +
        '<div class="sc-tru-dau"><b>' + h(t.ma) + ' · ' + h(t.ten) + '</b>' + nhan(t.co) + '</div>' +
        '<p>' + h(t.vi) + '</p>' +
        '<p class="sc-tro">Trỏ vào: ' + veTro(t.troVao) + '</p></div>';
    });
    o += '</div>';

    /* ── NGĂN 3 · GIỚI HẠN & ĐƯỜNG VƯỢT TRẦN ── */
    o += '<h3 class="sc-h">' + ic('shield') + ' Giới hạn Cloudflare — và đường vượt trần</h3>';
    o += '<p class="note sc-note">Nói ra cả trần LẪN đường lớn lên — một lớp không nói giới hạn ' +
      'thì người đọc tin nó chứa được nhiều hơn thật.</p>';
    o += '<div class="sc-tran">';
    tran.forEach(function (l) {
      o += '<div class="sc-tran-o"><b>' + h(l.ma) + ' · ' + h(l.ten) + '</b>' +
        '<p class="sc-gh">Trần: ' + h(l.gioiHan) + '</p>' +
        '<p class="sc-duong">Lớn lên: ' + h(l.duong) + '</p></div>';
    });
    o += '</div>';

    o += '<p class="note sc-note">Cách đưa lên Cloudflare cho nhanh & rẻ ở <b>docs/SUC_CHUA_TOC_DO.md</b> ' +
      'và <b>docs/TRIEN_KHAI_WEB.md</b>. Điều phối trợ lý ở <b data-v="dieu-phoi">màn Điều phối</b>; ' +
      'khung vận hành ở <b data-v="khung-van-hanh">màn Khung vận hành</b>.</p>';

    return o;
  };
})();
