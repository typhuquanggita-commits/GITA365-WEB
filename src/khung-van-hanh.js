/* ═══════════════════════════════════════════════════════════════
   GITA 365 — KHUNG VẬN HÀNH · HARNESS ENGINEERING (năng lực V20)

   Chủ hệ: bổ sung "Harness Engineering" — tầng chuẩn hoá cách Bộ não
   GITA365 điều phối 100 trợ lý: quản lý ngữ cảnh, gọi đúng cổng công cụ,
   gác Hiến pháp, chống hai trợ lý cùng ra tay, và tự kiểm chất lượng mỗi
   lượt. "V20" là tên năng lực này — bậc vận hành cao nhất của khung.

   ══ TRỎ, KHÔNG CHÉP — nguy nhất vẫn là bản thứ hai của HIẾN PHÁP ══

   Điều phối 100 trợ lý (dieu-phoi 9.99.107), Hiến pháp 13 điều, hàng rào
   10 điểm, chín điều bất khả sửa, cổng ẩn danh Điều 13, vòng tự nâng cấp
   có cổng — TẤT CẢ đã có. Khung vận hành KHÔNG dựng lại một cái nào. Mỗi
   trụ TRỎ vào một cơ chế THẬT đã chạy; chép hiến pháp/hàng rào/roster vào
   đây là bản thứ hai của một bảng cấm — bản nguy nhất trong mọi bản thứ
   hai (9.99.83). Mục kiểm canh rằng HE_* KHÔNG mọc một bảng hiến pháp/
   hàng rào/roster thứ hai.

   ══ NĂM TRỤ — MỖI TRỤ MỘT CƠ CHẾ CÓ RĂNG ĐÃ CÓ ══

   Một "khung vận hành" viết bằng lời dặn thì sáu tháng sau không ai nhớ.
   Nên mỗi trụ trỏ vào một cửa/kho THẬT, và bộ chấm mỗi lượt (chamMotLuot
   ở máy chủ) đo được từng trụ — phá-thử-đỏ-được. Đây là chỗ khác một tấm
   áp phích: điều phối 9.99.107 bản đầu là echo không đo gì (mục 88: bảng
   thì không chặn được gì), tổ soi đối kháng bắt. Khung vận hành học bài
   ấy ngay từ đầu: có phép đo HÀNH VI ở thu-worker.

   ══ V20 LÀ ĐO ĐƯỢC, KHÔNG PHẢI CON SỐ TỰ KHAI ══

   "Đạt V20" nghĩa là CẢ NĂM TRỤ đều có răng (một câu thử sai làm bộ chấm
   đỏ). Không dựng một ô `diem: 20` hay `bac: 20` — đó là dựng lại đúng bẫy
   SUP-01 (9.99.86): một con số để rồi có người chạy cho đủ. Bậc trưởng
   thành tính LÚC ĐỌC từ số trụ có răng, không cột lưu (cùng luật cột
   conHan 9.99.63 · cột den 9.99.66).

   ══ BỘ CHẤM MỖI LƯỢT KHÔNG TỰ RA TAY ══

   `chamMotLuot` chỉ trả về một VERDICT (đạt/không + trụ nào hỏng) rồi
   dừng — nó KHÔNG ghi việc, KHÔNG gọi một cửa ghi, KHÔNG bỏ qua cổng.
   Một bộ chấm tự ra tay là một cửa hậu cho cả trăm trợ lý (cùng lý do
   dieuPhoiTroLy không tự ra tay). Cổng thật vẫn nằm ở TỪNG cửa.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;
G.VIEWS = G.VIEWS || {};

/* Tên năng lực. Dùng chữ, không dùng một con số để chạy cho đủ. */
G.HE_MA = 'V20';

/* ══ NĂM TRỤ. Mỗi trụ: TRỎ vào cơ chế thật · CANH bằng gì · đo bằng máy.
   `troVao` là hai đầu độc lập để lần về; `canh` là điều bộ chấm mỗi lượt
   kiểm; `lot` là mã hỏng bộ chấm trả về khi trụ ấy không đạt. ══ */
G.HE_TRU = [
  { ma: 'HE1', ten: 'Quản lý ngữ cảnh',
    troVao: ['docTheVungManh', 'traLoiCoach'], canh: 'ngữ cảnh có mặt trước lượt', lot: 'NGUCANH', do: 'mayDo',
    vi: 'Trước khi một trợ lý trả lời về một đứa trẻ, Bộ não đọc Thẻ Vùng Mạnh của con đó ' +
      'trước (9.99.64). Ngữ cảnh phải được dựng TRƯỚC lượt — một lượt không ngữ cảnh là một ' +
      'câu trả lời chung chung dán nhãn cá nhân hoá.' },
  { ma: 'HE2', ten: 'Gọi đúng cổng công cụ',
    troVao: ['DP_TRO_LY', 'worker CAN_PHIEN'], canh: 'khoá sở hữu là một cửa THẬT', lot: 'KHONGCUA', do: 'mayDo',
    vi: 'Mỗi việc đi qua ĐÚNG một cửa thật đã đăng ký (khoá sở hữu = cửa), và cửa ấy tự mang ' +
      'cổng của nó. Gọi vào một cửa không có thật thì không cổng nào canh — cùng bài học chống ' +
      'echo của điều phối (9.99.107).' },
  { ma: 'HE3', ten: 'Gác Hiến pháp',
    troVao: ['BN_HIENPHAP', 'HP9_BATKHASUA', 'soatRaNgoai'], canh: 'không chạm vùng cấm', lot: 'VUNGCAM', do: 'mayDo',
    vi: 'Không việc nào của một trợ lý chạm vào vùng bất khả sửa — hiến pháp, hàng rào, khoá ' +
      'sở hữu, đường nâng cấp, giá, quyền. Chạm vào là bộ chấm chặn; đây là hiến pháp GÁC, ' +
      'không phải hiến pháp chép lại.' },
  { ma: 'HE4', ten: 'Chống hai trợ lý cùng ra tay',
    troVao: ['DP_TRO_LY'], canh: 'khoá sở hữu không trùng trong lượt', lot: 'TRUNGKHOA', do: 'mayDo',
    vi: 'Một cửa chỉ một trợ lý sở hữu (bất biến roster 100 cửa, 9.99.107). Trong một lượt điều ' +
      'phối, hai trợ lý không cùng nhận một khoá — cái hỏng của xung đột lộ ra ở thứ thứ ba đọc ' +
      'phải hai kết quả, nên phải chặn ở lượt.' },
  { ma: 'HE5', ten: 'Tự kiểm chất lượng mỗi lượt',
    troVao: ['BN_RAO10', 'chamThiGiac'], canh: 'có bản tự kiểm trước khi ra', lot: 'THIEUTUKIEM', do: 'mayDo',
    vi: 'Mỗi lượt mang một bản tự kiểm (hàng rào 10 điểm) trước khi ra. Phần chấm điểm R9 vẫn ' +
      'là việc của người (9.99.62) — bộ chấm chỉ canh rằng bản tự kiểm CÓ MẶT, không thay người ' +
      'kết luận chất lượng.' }
];

/* ══ BỐN LUẬT CỦA TẦNG KHUNG VẬN HÀNH ══ */
G.HE_TRAN = [
  { ma: 'HE-L1', ten: 'Trỏ, không chép',
    vi: 'Khung vận hành không dựng bản thứ hai của hiến pháp, hàng rào hay roster trợ lý — chỉ ' +
      'trỏ vào bản thật. Bản thứ hai của một bảng cấm là bản nguy nhất: sửa một bên, bên kia ' +
      'vẫn chặn theo luật cũ, cả hai vẫn xanh.' },
  { ma: 'HE-L2', ten: 'Bộ chấm mỗi lượt KHÔNG tự ra tay',
    vi: 'chamMotLuot chỉ trả verdict (đạt/không + trụ nào hỏng) rồi dừng — không ghi việc, không ' +
      'gọi cửa ghi, không bỏ qua cổng. Một bộ chấm tự ra tay là cửa hậu cho cả trăm trợ lý.' },
  { ma: 'HE-L3', ten: 'V20 là ĐO ĐƯỢC, không phải con số tự khai', loiKhai: false,
    vi: 'Đạt V20 = cả năm trụ đều có răng (một câu thử sai làm bộ chấm đỏ). Không có ô điểm/bậc ' +
      'nào tự xưng năng lực — một con số như thế chỉ để có người chạy cho đủ (bẫy SUP-01).' },
  { ma: 'HE-L4', ten: 'Bậc trưởng thành tính LÚC ĐỌC',
    vi: 'Số trụ có răng đếm lúc đọc, không giữ một cột "đang ở V-mấy". Một cột như thế hoặc bị gõ ' +
      'đè, hoặc cũ đi lặng lẽ — cùng luật cột conHan không có trong theVungManh (9.99.63).' }
];

(function () {
  var U = G.U, h = U.h, ic = U.ic;

  function veTro(ds) {
    return (ds || []).map(function (x) { return '<code>' + h(x) + '</code>'; }).join(' · ');
  }

  G.VIEWS['khung-van-hanh'] = function () {
    var tru = G.HE_TRU || [], tran = G.HE_TRAN || [];
    var o = '<div class="hd"><h2>' + ic('shield') + ' Khung vận hành · ' + h(G.HE_MA || 'V20') + '</h2>' +
      '<p class="sub"><b>Harness Engineering</b> — tầng chuẩn hoá cách <b>Bộ não GITA365</b> điều ' +
      'phối 100 trợ lý: quản lý ngữ cảnh, gọi đúng cổng công cụ, gác Hiến pháp, chống hai trợ lý ' +
      'cùng ra tay, và tự kiểm chất lượng mỗi lượt. Mỗi trụ TRỎ vào một cơ chế thật đã có — không ' +
      'chép luật; bộ chấm mỗi lượt đo được từng trụ (phá-thử-đỏ-được).</p></div>';

    /* ── NGĂN 1 · NĂM TRỤ ── */
    o += '<h3 class="hvh-h">' + ic('shield') + ' Năm trụ của khung vận hành</h3>';
    o += '<p class="note hvh-note">Mỗi trụ đo bằng <b>máy</b> ở bộ chấm mỗi lượt (<code>chamMotLuot</code>): ' +
      'thiếu là một mã hỏng cụ thể. Cột <b>Trỏ vào</b> là cơ chế thật đã chạy — lần về được, không chép lại.</p>';
    o += '<div class="hvh-tru">';
    tru.forEach(function (t) {
      o += '<div class="hvh-tru-o">' +
        '<div class="hvh-tru-dau"><b>' + h(t.ma) + ' · ' + h(t.ten) + '</b>' +
        '<span class="hvh-do">' + (t.do === 'mayDo' ? 'máy đo' : 'người đo') + '</span></div>' +
        '<p>' + h(t.vi) + '</p>' +
        '<p class="hvh-meta">Canh: <b>' + h(t.canh) + '</b> · hỏng → <code>' + h(t.lot) + '</code></p>' +
        '<p class="hvh-tro">Trỏ vào: ' + veTro(t.troVao) + '</p>' +
        '</div>';
    });
    o += '</div>';

    /* ── NGĂN 2 · BỐN LUẬT TRẦN ── */
    o += '<h3 class="hvh-h">' + ic('lock') + ' Bốn luật của tầng khung vận hành</h3>';
    o += '<div class="hvh-luat">';
    tran.forEach(function (l) {
      o += '<div class="hvh-luat-o"><b>' + h(l.ma) + ' · ' + h(l.ten) + '</b>' +
        '<p>' + h(l.vi) + '</p></div>';
    });
    o += '</div>';

    /* ── NGĂN 3 · BỘ CHẤM MỖI LƯỢT ── */
    o += '<h3 class="hvh-h">' + ic('check') + ' Bộ chấm mỗi lượt — ' + h(G.HE_MA || 'V20') + ' là gì</h3>';
    o += '<div class="hvh-cham">' +
      '<p>Mỗi lượt một trợ lý định ra tay, <code>chamMotLuot</code> chạy năm trụ và trả về ' +
      '<b>verdict</b>: đạt hay không, và trụ nào hỏng. Nó <b>không tự ra tay</b> — cổng thật vẫn ' +
      'nằm ở từng cửa. <b>Đạt ' + h(G.HE_MA || 'V20') + '</b> nghĩa là cả năm trụ đều có răng: ' +
      'một câu thử sai làm bộ chấm đỏ đúng chỗ (phép đo hành vi ở thu-worker), không phải một ' +
      'điểm số tự khai.</p>' +
      '<div class="hvh-lots">' +
      tru.map(function (t) { return '<span class="hvh-lot"><code>' + h(t.lot) + '</code> ' + h(t.ten) + '</span>'; }).join('') +
      '</div></div>';

    o += '<p class="note hvh-note">Điều phối 100 trợ lý ở <b data-v="dieu-phoi">màn Điều phối trợ lý AI</b>; ' +
      'Bộ não ở <b data-v="bo-nao">màn Bộ não GITA 365</b>; tự hoàn thiện đi qua ' +
      '<b data-v="tu-nang-cap">vòng tự nâng cấp</b> có cổng. Khung vận hành TRỎ vào cả ba, không dựng lại.</p>';

    return o;
  };
})();
