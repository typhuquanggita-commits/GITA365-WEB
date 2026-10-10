/* ═══════════════════════════════════════════════════════════════
   GITA 365 — CỬA TRƯỚC: NGƯỜI LẠ NHÌN TRƯỚC KHI ĐĂNG KÝ

   Bản đầu (dựng theo câu chuyện anh Hoàng) mở ba ngăn: "GITA làm gì",
   "Đường vào sáu bước", "Năm bài test". Đo trên điện thoại 390px thì ba
   ngăn ấy dài 43.495 ký tự — khoảng năm mươi lăm lần vuốt màn, bốn mươi
   phút đọc — và nút đăng ký nằm ở CUỐI. Chủ hệ chốt (10/10): giảm một
   nửa, dẫn theo hành trình ra quyết định, và bảo mật hơn.

   Nay là MỘT trang, đi đúng thứ tự năm chặng của hành trình 100 điểm
   chạm trước quyết định: Nhận ra → Hiểu → Tin → Thử → Quyết. Người lạ
   gặp phần đầu của hành trình ấy ở đây; phần còn lại diễn ra ngoài
   trang (bài viết, nhóm cộng đồng, buổi nghe giới thiệu, bảy ngày thử).
   100 là CÁCH ĐẾM, không phải chỉ tiêu — cùng câu trả lời của SUP-01.

   Ba thứ CỐ Ý rút khỏi trang công khai, vì chúng không giúp người lạ
   quyết mà chỉ giúp người muốn chép mô hình:
   · quy mô kho nghề (số kịch bản, phác đồ, tình huống, mô thức);
   · bí quyết vận hành (bốn bước ngôn từ, năm bước vận hành);
   · câu hỏi thật của bài đo và ngưỡng điểm cảnh báo — biết trước câu
     và ngưỡng thì phép đo nền mất giá trị với chính nhà làm bài.
   Rút khỏi MÀN chưa phải là bảo vệ: kho/mau.json vẫn tải được. Dữ liệu
   ở đây cũng không còn đổ vào G — giữ trong biến của tệp này, chỉ lấy
   đúng ô cần vẽ — nên đăng nhập ngay sau đó không để lại gì trong bộ
   nhớ. Cắt chính gói mau.json là bước sau, ở tools/ma-hoa-kho.js.

   Luật chữ của trang này: khát khao thay đổi đi từ HÌNH ẢNH TƯƠNG LAI,
   không đi từ nỗi sợ (Hiến pháp chín điều, điều 5); không hứa kết quả,
   không từ tuyệt đối (bộ lọc quảng cáo QC1–QC3).

   Một điều KHÔNG đổi: người chưa đăng ký xem được tên năm bài nhưng
   không làm được bài — bài xong phải có mã gia đình để ghi vào.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;

(function () {
  var D = null;            /* dữ liệu cửa trước — KHÔNG đổ vào G */

  function h(x) { return G.U.h(x); }
  function ic(a, b) { return G.U.ic(a, b); }

  /* ─── Tải gói công khai ───
     Bản một tệp không có thư mục kho/ cạnh trang — dong-goi.py nhúng
     gói mẫu vào G.MAU_NHUNG. Đọc chỗ ấy trước, nếu không thì cửa trước
     hỏng đúng ở bản người lạ hay mở nhất. */
  function napCongKhai() {
    if (D) return Promise.resolve(true);
    if (window.G && G.MAU_NHUNG) return Promise.resolve(nhan(G.MAU_NHUNG));
    var duong = window.GITA_NGUON_KHO ? (window.GITA_NGUON_KHO + 'mau') : 'kho/mau.json';
    return fetch(duong)
      .then(function (r) { return r.json(); })
      .then(nhan)
      .catch(function () { return false; });
  }

  /* Chỉ giữ đúng ô cần vẽ. Bài đo giữ TÊN, người làm, số phút, số miền
     và câu giới hạn — bỏ câu hỏi, nhóm điểm và ngưỡng cảnh báo. */
  function nhan(m) {
    if (!m) return false;
    var bai = (m.TEST750 || []).filter(function (b) { return b.tang === 'T1'; }).map(function (b) {
      return { bo: b.bo, ten: b.ten, ai: b.ai, phut: b.phut, soMien: (b.mien || []).length, gioiHan: b.gioiHan };
    });
    D = {
      motCau: m.GT_MOT_CAU || '', viSao: m.GT_VISAO || {}, hua: m.GT_HUA || [], tang: m.GT_TANG || [],
      vai: m.GT_VAI || [], khong: m.GT_KHONG || [], ranh: m.GT_MUCTIEU_RANH || '',
      buoc: m.DV_BUOC || [], hoi: m.DV_HOI || [], bai: bai
    };
    return true;
  }

  /* ─── Năm chặng ra quyết định ─── */
  /* Mỗi chặng nói AI sẽ ở bên nhà mình ở chặng ấy — chủ hệ (10/10): khách
     không được thấy mình đi một mình. Tên vai khớp G.GT_VAI; câu nói điều
     vai ấy LÀM, không hứa một mức an tâm nào (không từ tuyệt đối, QC1). */
  var CHANG = [
    { k: 1, t: 'Nhận ra', ben: 'Chuyên gia tư vấn — buổi đầu chỉ nghe nhà mình kể.' },
    { k: 2, t: 'Hiểu',    ben: 'Chuyên gia tư vấn và trợ lý ảo — trả lời mọi câu hỏi về bản đồ.' },
    { k: 3, t: 'Tin',     ben: 'Coach và mentor — người thật, đi cùng nhà mình từng chặng.' },
    { k: 4, t: 'Thử',     ben: 'Chuyên gia đánh giá — đọc hồ sơ cùng cả nhà, bằng dữ liệu.' },
    { k: 5, t: 'Quyết',   ben: 'Coach — cùng nhà mình chọn chặng đầu tiên, và ở lại suốt năm tầng.' }
  ];

  /* Năm tình huống để người lạ tự nhận ra nhà mình. Mỗi tình huống có
     HAI phần: GITA bắt đầu từ đâu (dựa trên điều Học viện ĐÃ làm — đo
     bảy ngày, chín vai, mười phút mỗi tối, xếp việc theo khoảng vụn),
     và MỘT việc làm được ngay tối nay, không cần đăng ký. Chủ hệ (10/10):
     "để họ bắt tay hành động thay vì gửi thông điệp lý thuyết". Việc tối
     nay phải nhỏ, quan sát được, không trách ai, và không hứa kết quả. */
  var GUONG = [
    { t: 'Tối nào cũng phải nhắc con nhiều lần mới chịu ngồi vào bàn.',
      d: 'Bảy ngày đầu, bên em chưa sửa gì cả — chỉ cùng nhà mình đếm. Có một con số chung thì cả nhà thôi ' +
         'tranh luận bằng cảm giác, và việc đầu tiên nhắm tới thường chính là giảm số lần phải nhắc.',
      viec: 'Tối nay chỉ đếm, chưa sửa. Mỗi lần nhắc con, gạch một vạch lên tờ giấy dán ở tủ lạnh — không nhắc ' +
         'thêm, không trách. Sáng mai cả nhà cùng nhìn con số ấy.' },
    { t: 'Bố mẹ đều thương con, nhưng mỗi người một cách.',
      d: 'Không ai bị bắt đổi ngay. Bản đồ chia rõ việc nào của ai — chín vai trong nhà, mỗi vai có người giữ — ' +
         'để người lớn đứng cùng một phía trước khi nói với con.',
      viec: 'Tối nay, khi con đã ngủ, mỗi người nói một câu: điều mình mong nhất ở con trong năm nay. Chỉ nghe ' +
         'nhau, chưa bàn cách làm.' },
    { t: 'Kế hoạch nào cũng hăng hái tuần đầu rồi bỏ dở.',
      d: 'Nhịp quan trọng hơn cường độ. Mức tối thiểu là mười phút mỗi tối, đặt sao cho hôm mệt nhất vẫn làm được. ' +
         'Lỡ một nhịp thì có đường quay lại, không phải làm lại từ đầu.',
      viec: 'Chọn một việc nhỏ đến mức hôm mệt nhất vẫn làm được — mười phút đọc sách cùng con chẳng hạn. Tối nay ' +
         'làm đúng việc ấy, rồi đánh một dấu lên lịch treo tường.' },
    { t: 'Con ít kể chuyện, hỏi gì cũng chỉ "bình thường".',
      d: 'Bắt đầu từ cách người lớn hỏi, không bắt đầu từ việc bắt con nói. Người đồng hành gợi cho cha mẹ những ' +
         'câu mở lời cho buổi tối, rồi cùng nhà mình nhìn lại sau mỗi tuần.',
      viec: 'Tối nay đổi câu hỏi. Thay vì "Hôm nay học thế nào?", hỏi "Hôm nay có chuyện gì làm con bật cười?" — ' +
         'rồi nghe hết, không góp ý.' },
    { t: 'Cả nhà bận, buổi tối mỗi người một màn hình.',
      d: 'Người bận không thiếu thời gian — họ có thời gian ở dạng vụn. Người đồng hành xếp việc vào đúng những ' +
         'khoảng vụn ấy, bắt đầu từ một nếp nhỏ cả nhà giữ được.',
      viec: 'Tối nay dành mười lăm phút không màn hình cho cả nhà, kể cả bố mẹ. Đặt điện thoại vào một chỗ chung, ' +
         'rồi ngồi cùng nhau làm bất cứ việc gì.' }
  ];
  var CHON = 0;

  /* Ba tối thử tại nhà, TRƯỚC khi đăng ký. Đánh dấu chỉ lưu trên máy
     này (localStorage, bọc try/catch) — không gửi đi đâu, và trang vẫn
     chạy đủ khi trình duyệt chặn bộ nhớ. Dùng nút bật/tắt chứ không
     dùng ô tích: bộ bắt sự kiện chung của app.js chặn hành vi mặc định
     của cú bấm, nên ô tích sẽ không tự đổi trạng thái. */
  var BA_TOI = [
    { t: 'Tối thứ nhất · Đếm', y: 'Đếm số lần phải nhắc con bắt đầu việc học. Chỉ đếm — không nhắc thêm, không trách.' },
    { t: 'Tối thứ hai · Trao', y: 'Trước giờ học, hỏi con: "Hôm nay con muốn bắt đầu bằng việc gì?" — rồi để con chọn.' },
    { t: 'Tối thứ ba · Nhìn lại', y: 'Cả nhà ngồi mười phút, mỗi người kể một điều mình thấy ổn hơn trong ba tối vừa qua.' }
  ];
  var KHOA_TOI = 'gita365.bataithu';
  function docToi() {
    try { var v = JSON.parse(localStorage.getItem(KHOA_TOI) || '[]'); return Array.isArray(v) ? v : []; }
    catch (e) { return []; }
  }
  function ghiToi(v) { try { localStorage.setItem(KHOA_TOI, JSON.stringify(v)); } catch (e) {} }

  function dau(k, tieu, phu) {
    var c = CHANG[k - 1];
    return '<div id="ct-s' + k + '" class="ct-dau">' +
      '<div class="tiny up" style="color:var(--gold-ink)">Chặng ' + k + ' · ' + h(c.t) + '</div>' +
      '<h2 class="ct-h">' + h(tieu) + '</h2>' +
      '<div class="ct-ben">' + ic('users', 'w-3 h-3') + '<span><b>Ai ở bên nhà mình:</b> ' + h(c.ben) + '</span></div>' +
      (phu ? '<p class="sm dim" style="line-height:1.75;max-width:62ch">' + h(phu) + '</p>' : '') + '</div>';
  }

  function nutDangKy(nhan) {
    return '<button class="btn pri" data-act="mo-dang-ky">' + ic('plus') + h(nhan || 'Đăng ký tài khoản') + '</button>';
  }

  function khung() {
    var o = '<div class="gate-top"><div class="brand"><span class="mark">' + G.dauGita() + '</span>' +
      '<div><div class="nm">GITA 365</div><div class="sub">' + h(G.L('brandSub')) + '</div></div></div>' +
      '<span class="grow"></span>' +
      '<button class="btn ghost sm" data-act="ct-dong">' + ic('arrow') + 'Quay lại đăng nhập</button>' +
      '<button class="btn pri sm" data-act="mo-dang-ky">' + ic('plus') + 'Đăng ký</button></div>';

    o += '<div class="view ct-trang">';

    /* Dải năm chặng — bấm để nhảy tới chặng ấy. */
    o += '<nav class="ct-chang" aria-label="Năm chặng ra quyết định">' + CHANG.map(function (c) {
      return '<button class="chip" data-ctc="s' + c.k + '">' + c.k + ' · ' + h(c.t) + '</button>';
    }).join('') + '</nav>';

    /* ── Mở đầu ── */
    o += '<div class="card ct-mo">' +
      '<div class="tiny up" style="color:var(--gold-ink)">Dành cho cha mẹ muốn buổi tối ở nhà nhẹ hơn</div>' +
      '<h1 class="ct-h1">Mỗi tối một bước nhỏ — để ba trăm sáu mươi lăm ngày sau, nhà mình tự đi trên đôi chân của mình.</h1>' +
      '<p style="line-height:1.8;max-width:62ch">' + h(D.motCau) + '</p>' +
      '<div class="row wrap" style="gap:10px">' +
      '<button class="btn pri" data-ctc="s1">' + ic('arrow') + 'Thử một việc ngay tối nay</button>' +
      '<button class="btn ghost" data-act="mo-dang-ky">Đăng ký · 5 phút, chưa mất phí</button></div></div>';

    /* ── 1 · Nhận ra ── */
    o += dau(1, 'Nhà mình đang ở đâu?', 'Chọn câu giống nhà mình nhất. Mỗi câu có một việc làm được ngay tối nay. Lựa chọn chỉ nằm trên máy này.');
    o += '<div class="ct-guong">' + GUONG.map(function (g, i) {
      return '<button class="ct-o' + (i === CHON ? ' on' : '') + '" data-ctc="g' + i + '" aria-pressed="' + (i === CHON) + '">' + h(g.t) + '</button>';
    }).join('') + '</div>';
    o += GUONG.map(function (g, i) {
      return '<div class="card ct-tra" data-ctg="' + i + '"' + (i === CHON ? '' : ' hidden') + '>' +
        '<div class="tiny up" style="color:var(--gold-ink)">GITA bắt đầu từ đâu với nhà như thế</div>' +
        '<p style="line-height:1.8">' + h(g.d) + '</p>' +
        '<div class="ct-viec-nay"><div class="tiny up">Việc của tối nay</div>' +
        '<p style="line-height:1.75">' + h(g.viec) + '</p></div></div>';
    }).join('');

    /* ── 2 · Hiểu ── */
    o += dau(2, 'Nhà mình không thiếu cố gắng — chỉ thiếu một tấm bản đồ', D.viSao.canh || '');
    if ((D.viSao.hong || []).length)
      o += '<div class="card pad-sm"><b class="sm" style="display:block;margin-bottom:6px">Vì sao cố gắng hay bị trôi</b>' +
        '<ul class="tiny dim" style="line-height:1.75;margin:0;padding-left:18px;display:grid;gap:4px">' +
        D.viSao.hong.map(function (x) { return '<li>' + h(x) + '</li>'; }).join('') + '</ul>' +
        (D.viSao.chot ? '<p class="sm mt" style="line-height:1.7">' + h(D.viSao.chot) + '</p>' : '') + '</div>';
    o += '<div class="ct-luoi">' + D.hua.map(function (x) {
      return '<div class="card pad-sm"><b class="sm" style="display:block;margin-bottom:4px">' + h(x.t) + '</b>' +
        '<p class="tiny dim" style="line-height:1.7">' + h(x.y) + '</p></div>';
    }).join('') + '</div>';
    o += '<b class="sm">Năm tầng — và nhà mình sẽ thấy gì khi qua mỗi tầng</b>';
    o += '<div class="ct-tang">' + D.tang.map(function (x) {
      return '<div class="ct-tg" style="border-top-color:' + h(x.c || 'var(--gita-vien-2)') + '">' +
        '<div class="tiny muted">' + h(x.t) + '</div><b class="sm">' + h(x.ten) + '</b>' +
        '<p class="tiny dim" style="line-height:1.65">' + h(x.max || x.y || '') + '</p></div>';
    }).join('') + '</div>';

    /* ── 3 · Tin ── */
    o += dau(3, 'Có người thật đi cùng — và nói thật khi nhà mình đang trượt', D.ranh);
    o += '<div class="ct-luoi">' + D.vai.map(function (x) {
      return '<div class="card pad-sm"><b class="sm" style="display:block;margin-bottom:4px">' + h(x.t) + '</b>' +
        '<p class="tiny dim" style="line-height:1.65">' + h(x.y) + '</p></div>';
    }).join('') + '</div>';
    if (D.khong.length)
      o += '<details class="card pad-sm ct-mo-rong"><summary class="sm"><b>Sáu điều Học viện KHÔNG nhận làm</b>' +
        ' <span class="tiny muted">— đọc trước khi quyết</span></summary>' +
        '<ol class="tiny dim" style="line-height:1.75;margin:10px 0 0;padding-left:20px">' +
        D.khong.map(function (x) { return '<li>' + h(x) + '</li>'; }).join('') + '</ol></details>';

    /* ── 4 · Thử ── */
    var daLam = docToi();
    o += dau(4, 'Ba tối thử ngay tại nhà — trước cả khi đăng ký',
      'Không cần tài khoản, không mất phí. Làm xong tối nào thì bấm đánh dấu tối ấy.');
    o += '<div class="ct-ba-toi">' + BA_TOI.map(function (x, i) {
      var xong = daLam.indexOf(i) >= 0;
      return '<button class="ct-toi' + (xong ? ' on' : '') + '" data-ctc="v' + i + '" aria-pressed="' + xong + '">' +
        '<span class="ct-dau-tich" aria-hidden="true">' + (xong ? '✓' : (i + 1)) + '</span>' +
        '<span><b class="sm" style="display:block">' + h(x.t) + '</b><span class="tiny dim">' + h(x.y) + '</span></span></button>';
    }).join('') + '</div>';
    o += '<p class="sm" id="ct-ngot" style="line-height:1.75">' + loiNgot(daLam.length) + '</p>';

    o += '<b class="sm" style="margin-top:10px">Khi nhà mình sẵn sàng: đường vào sáu bước, chưa bước nào mất phí</b>';
    o += '<ol class="ct-buoc">' + D.buoc.map(function (x) {
      return '<li><b class="sm">' + h(x.ten) + '</b><span class="tiny muted">' + h(x.lau || '') + '</span></li>';
    }).join('') + '</ol>';
    if (D.bai.length) {
      o += '<div class="card pad-sm ct-bai"><b class="sm" style="display:block;margin-bottom:8px">Năm bài đo nền của tầng một</b>' +
        '<ul class="tiny" style="margin:0;padding:0;list-style:none;display:grid;gap:6px">' +
        D.bai.map(function (b) {
          return '<li><b>Bài ' + h(b.bo) + ' · ' + h(b.ten) + '</b> <span class="muted">— ' +
            (b.ai === 'PH' ? 'phụ huynh' : 'học viên') + ' · ' + h(b.phut) + ' phút · ' + h(b.soMien) + ' miền</span></li>';
        }).join('') + '</ul>' +
        '<p class="tiny dim mt" style="line-height:1.7">' + h(D.bai[0].gioiHan || '') +
        ' Làm bài cần mã gia đình, vì điểm hôm nay là mốc để bảy ngày sau đo lại.</p></div>';
    }

    /* ── 5 · Quyết ── */
    o += dau(5, 'Ba câu cha mẹ hay hỏi trước khi quyết', '');
    o += '<div class="card pad-sm">' + D.hoi.slice(0, 3).map(function (x, i) {
      return '<div' + (i ? ' class="mt"' : '') + '><b class="sm">' + h(x.h) + '</b>' +
        '<p class="tiny dim" style="line-height:1.7">' + h(x.d) + '</p></div>';
    }).join('') + '</div>';
    if (D.hoi.length > 3)
      o += '<details class="card pad-sm ct-mo-rong"><summary class="sm"><b>' + (D.hoi.length - 3) + ' câu hỏi khác</b></summary>' +
        D.hoi.slice(3).map(function (x) {
          return '<div class="mt"><b class="sm">' + h(x.h) + '</b><p class="tiny dim" style="line-height:1.7">' + h(x.d) + '</p></div>';
        }).join('') + '</details>';

    o += '<div class="card ct-cuoi">' +
      '<div style="flex:1;min-width:0"><b style="display:block;margin-bottom:6px">Mang con số của ba tối ấy theo — nhà mình đã bắt đầu rồi</b>' +
      '<p class="tiny" style="line-height:1.75;color:var(--ink-2)">Đăng ký mất năm phút và chưa mất phí. Xong là nhà mình có ' +
      'một mã gia đình đi theo suốt năm tầng, một hồ sơ chờ số liệu, và năm bài đo nền của tầng một — người đồng hành sẽ ' +
      'đo tiếp từ đúng chỗ nhà mình đang đứng. Nếu đọc sáu điều Học viện không nhận làm mà thấy có dòng không hợp, dừng ở ' +
      'đây là đúng — bên em thà mất một đăng ký còn hơn nhận một gia đình mình không giúp được.</p></div>' +
      '<div class="row wrap" style="gap:10px">' + nutDangKy() +
      '<button class="btn ghost" data-act="ct-dong">Đã có tài khoản</button></div></div>';

    o += '</div>';
    return o;
  }

  /* Câu theo số tối đã làm. Không hứa kết quả: vị ngọt là thứ nhà mình
     TỰ nhìn thấy trong con số của mình, không phải thứ bên em cam kết. */
  function loiNgot(n) {
    if (n >= 3) return 'Ba tối, ba việc — nhà mình vừa tự tạo ra con số đầu tiên của riêng mình. Nếu có dù chỉ một lần nhắc ít hơn, một câu chuyện dài hơn, thì đó là thay đổi do chính nhà mình làm ra. Người đồng hành sẽ đo tiếp từ đúng con số ấy.';
    if (n > 0) return 'Đã làm ' + n + '/3 tối. Cứ giữ đúng nhịp ấy — lỡ một tối thì làm tiếp tối sau, không phải làm lại từ đầu.';
    return 'Vị ngọt đầu tiên thường đến từ một con số rất nhỏ. Con số ấy là của nhà mình — bên em chỉ giúp nhà mình nhìn thấy nó.';
  }

  function ve() {
    var app = document.getElementById('app');
    if (!app) return;
    app.innerHTML = '<div id="gate">' + khung() + '</div>';
    try { window.scrollTo(0, 0); } catch (e) {}
  }

  /* ─── Cửa vào ─── */
  G.moCuaTruoc = function () {
    CHON = 0;
    var app = document.getElementById('app');
    if (app) app.innerHTML = '<div id="gate"><div class="gate-body center" style="padding:80px 20px">' +
      '<p class="sm muted">Đang mở phần xem trước…</p></div></div>';
    napCongKhai().then(function (ok) {
      if (!ok) {
        if (G.U && G.U.toast) G.U.toast('Chưa tải được phần xem trước. Kiểm lại đường mạng rồi bấm lại.', 'err');
        return G.dongCuaTruoc();
      }
      ve();
    });
  };

  G.dongCuaTruoc = function () {
    if (G.veCong) G.veCong();
  };

  /* Một cửa cho hai việc: "sN" nhảy tới chặng N, "gN" chọn tình huống N.
     Chọn tình huống chỉ ẩn/hiện tại chỗ — vẽ lại thì trang nhảy về đầu. */
  G.chonCuaTruoc = function (el) {
    var v = String(el.getAttribute('data-ctc') || '');
    if (v.charAt(0) === 's') {
      var dich = document.getElementById('ct-s' + v.slice(1));
      if (!dich) return;
      var it = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      try { dich.scrollIntoView({ behavior: it ? 'auto' : 'smooth', block: 'start' }); } catch (e) { dich.scrollIntoView(); }
      return;
    }
    if (v.charAt(0) === 'v') {
      var k = parseInt(v.slice(1), 10);
      if (!(k >= 0 && k < BA_TOI.length)) return;
      var ds0 = docToi(), vt = ds0.indexOf(k);
      if (vt >= 0) ds0.splice(vt, 1); else ds0.push(k);
      ghiToi(ds0);
      var xong = ds0.indexOf(k) >= 0;
      el.className = 'ct-toi' + (xong ? ' on' : '');
      el.setAttribute('aria-pressed', xong ? 'true' : 'false');
      var tich = el.querySelector('.ct-dau-tich');
      if (tich) tich.textContent = xong ? '\u2713' : String(k + 1);
      var ngot = document.getElementById('ct-ngot');
      if (ngot) ngot.innerHTML = loiNgot(ds0.length);
      return;
    }
    if (v.charAt(0) !== 'g') return;
    var i = parseInt(v.slice(1), 10);
    if (!(i >= 0 && i < GUONG.length)) return;
    CHON = i;
    var ds = document.querySelectorAll('[data-ctc^="g"]');
    for (var a = 0; a < ds.length; a++) {
      var la = ds[a].getAttribute('data-ctc') === v;
      ds[a].className = 'ct-o' + (la ? ' on' : '');
      ds[a].setAttribute('aria-pressed', la ? 'true' : 'false');
    }
    var tra = document.querySelectorAll('[data-ctg]');
    for (var b = 0; b < tra.length; b++) tra[b].hidden = tra[b].getAttribute('data-ctg') !== String(i);
  };
})();
