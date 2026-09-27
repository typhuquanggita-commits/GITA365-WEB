/* ═══════════════════════════════════════════════════════════════
   GITA 365 — CỬA TRƯỚC: NGƯỜI LẠ NHÌN TRƯỚC KHI ĐĂNG KÝ

   Anh Quang kể một hành trình cụ thể: anh Hoàng tình cờ biết tới
   GITA365, tò mò vào xem, rồi mới đăng ký và làm bài test để nói ra
   chuyện nhà mình. Rồi anh hỏi: phần giao diện ấy đâu, phần năm bài
   test đâu.

   Đo lại thì ra hai chỗ hụt, cả hai đều thật:

   1. Màn đăng nhập không có cửa nào cho người CHƯA có tài khoản nhìn
      vào. Ba nút ở đó là "Bước vào bản đồ" (cuộn xuống ô mật khẩu),
      "Xem 15 tài khoản trải nghiệm" (bảng tài khoản nội bộ) và "Đăng
      ký". Không nút nào trả lời câu hỏi đầu tiên của một người lạ:
      chỗ này làm gì, và tôi có đúng chỗ không. Màn giới thiệu và màn
      đường vào sáu bước đều đã dựng xong — nhưng cả hai nằm SAU tường
      đăng nhập. Mời người ta bước qua cửa rồi khoá chính cái cửa ấy.

   2. Bản xem thử chỉ mở MỘT bài test trong khi cả lời hứa lẫn màn
      test đều nói năm bài. (Chỗ ấy sửa ở tools/ma-hoa-kho.js.)

   Tệp này dựng cửa số 1. Nó KHÔNG mở thêm dữ liệu nào: cả ba phần
   dưới đây đọc đúng kho/mau.json — gói công khai mà bất kỳ ai cũng
   tải được sẵn, và packer đã cố ý để mở với lý do ghi ngay trong đó
   ("khoá nó lại là khoá đúng cái cửa mình đang mời người ta bước
   qua"). Kho nghề, 1.000 kịch bản, 220 phác đồ, ma trận, học phí vẫn
   khoá nguyên trong bảy gói .enc.

   Một điều cố ý KHÔNG làm: người chưa đăng ký xem được HÌNH DẠNG năm
   bài test nhưng không làm được bài. Vì bài làm xong phải có chỗ ghi
   — mã gia đình — và mã đó chỉ có sau khi đăng ký. Cho làm bài rồi
   vứt kết quả đi là lấy 75 phút của một gia đình để đổi lấy không gì
   cả.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;

(function () {
  var DA_NAP = false;      /* mau.json chỉ tải một lần cho mỗi phiên */
  var PHAN = 'gita';       /* gita · duong · test */

  function U() { return G.U; }
  function h(x) { return G.U.h(x); }
  function ic(a, b) { return G.U.ic(a, b); }

  /* ─── Tải gói công khai ───
     Cùng đường dẫn mà napMau() dùng, kể cả khi Apps Script phục vụ. */
  function napCongKhai() {
    if (DA_NAP) return Promise.resolve(true);

    /* Bản một tệp (GITA365-…-gioi-thieu.html, và bản xem thử gửi khách)
       không có thư mục kho/ cạnh trang — tools/dong-goi.py nhúng thẳng
       gói mẫu vào G.MAU_NHUNG. Không đọc chỗ ấy trước thì fetch trả 404
       và cửa trước hỏng đúng ở bản mà người lạ hay mở nhất: cái tệp
       được gửi cho họ xem. */
    if (window.G && G.MAU_NHUNG) return Promise.resolve(nhan(G.MAU_NHUNG));

    var duong = window.GITA_NGUON_KHO ? (window.GITA_NGUON_KHO + 'mau') : 'kho/mau.json';
    return fetch(duong)
      .then(function (r) { return r.json(); })
      .then(nhan)
      .catch(function () { return false; });
  }

  /* Chỉ nhận những kho của CỬA TRƯỚC. Gói mẫu có 50 kho; đổ hết vào G
     lúc chưa đăng nhập là để lại dữ liệu của phiên trước trong bộ nhớ
     khi người dùng bấm đăng nhập ngay sau đó, và donKho() lúc đăng nhập
     sẽ không biết chúng từ đâu ra. */
  var LAY = ['DV_BUOC', 'DV_CHAN', 'DV_HOI', 'TEST750', 'HANHTRINH12', 'TRU_GITA'];
  function nhan(m) {
    if (!m) return false;
    Object.keys(m).forEach(function (k) {
      if (k.indexOf('GT_') === 0 || LAY.indexOf(k) >= 0) G[k] = m[k];
    });
    DA_NAP = true;
    return true;
  }

  /* ─── Ba phần ─── */
  var PHANS = [
    { k: 'gita',  t: 'GITA 365 làm gì',
      h: 'Một câu định nghĩa, sáu mục tiêu có mốc ngày và ngưỡng đạt, bảy giá trị mỗi giá trị kèm một việc nên làm và một việc không làm — và sáu điều Học viện KHÔNG nhận làm.' },
    { k: 'duong', t: 'Đường vào sáu bước',
      h: 'Sáu chặng đi theo thứ tự. Mỗi chặng ghi rõ ai làm, mất bao lâu, xong thì cầm được gì trong tay, và chưa xong thì bị chặn ở đâu — chặn để bước sau không chạy trên nền sai.' },
    { k: 'test',  t: 'Năm bài test đánh giá',
      h: 'Cấu trúc thật của phép đo nền: đo miền nào, bốn mức được tả ra sao, cho ra cái gì, cảnh báo nào tự bật ở ngưỡng nào — kèm một câu thật lấy nguyên từ mỗi bài.' }
  ];

  /* Màn năm bài test cho người CHƯA đăng ký: nói đúng hình dạng bài,
     không mở nút làm bài. Không dùng lại G.VIEWS['bo-test'] vì màn ấy
     đọc G.S.test và mở nút làm bài — cả hai đều cần tài khoản. */
  function manTest() {
    var T = (G.TEST750 || []).slice();
    if (!T.length)
      return U().empty('Chưa tải được phần xem trước',
        'Phần này tải từ gói công khai kho/mau.json. Mở lại trang rồi bấm lại.');

    var t1 = T.filter(function (b) { return b.tang === 'T1'; });
    var ds = t1.length ? t1 : T;
    var cauThat = ds.reduce(function (a, b) { return a + (b.soCauThat || b.cau.length); }, 0);
    var mien = ds[0] && ds[0].mien ? ds[0].mien.length : 0;
    var soCB = ds.reduce(function (a, b) { return a + (b.canhBao || []).length; }, 0);
    var moiMien = mien ? Math.round((ds[0].soCauThat || ds[0].cau.length) / mien) : 0;

    var o = U().sec('NĂM BÀI CỦA TẦNG MỘT — ĐO CÁI GÌ, VÀ ĐO NHƯ THẾ NÀO',
      'Đây không phải bài trắc nghiệm tính cách và không phải bài kiểm tra kiến thức. Nó là một phép ĐO NỀN: ' +
      'ghi lại thực trạng bảy ngày gần nhất của một nhà, bằng hành vi quan sát được, để bảy ngày sau đối chiếu ' +
      'xem cái gì đã đổi. Học viên làm ba bài, phụ huynh làm hai bài — cùng một nhà nhìn từ hai chỗ đứng, và ' +
      'chỗ hai phía trả lời lệch nhau là chỗ buổi đọc hồ sơ mở ra trước tiên.');

    o += '<div class="grid g4 mb">' +
      U().stat({ k: 'Bài', v: String(ds.length), d: '3 bài học viên · 2 bài phụ huynh', c: '#185AB4' }) +
      U().stat({ k: 'Câu hỏi', v: String(cauThat), d: mien + ' miền × ' + moiMien + ' câu mỗi bài', c: '#5140B4' }) +
      U().stat({ k: 'Lựa chọn', v: String(cauThat * 4), d: 'bốn mức cho mỗi câu', c: '#0B6675' }) +
      U().stat({ k: 'Cảnh báo tự bật', v: String(soCB), d: 'theo ngưỡng từng miền', c: '#B45309' }) +
      '</div>';

    /* ─ Chỗ khác biệt thật, nói bằng chính dữ liệu đang hiển thị ─ */
    o += '<div class="card mb" style="border-color:var(--gita-vien-2)">' +
      '<div class="row mb" style="gap:8px"><span style="color:var(--gold-ink)">' + ic('target', 'w-4 h-4') + '</span>' +
      '<b>Bốn lựa chọn là bốn MỨC HÀNH VI, không phải bốn mức "tốt – khá – trung bình – kém"</b></div>' +
      '<p class="sm dim" style="line-height:1.8">Đây là chỗ bộ đo này khác một bảng khảo sát. Mỗi lựa chọn ' +
      'không phải một tính từ mà là một TÌNH HUỐNG ĐƯỢC TẢ — trung bình sáu mươi hai ký tự, có mốc thời gian ' +
      'hoặc số lần để người trả lời tự soi vào tuần vừa rồi. Hỏi "em có chăm học không" thì mười nhà trả lời ' +
      'ra mười thang đo khác nhau; tả ra "em lùi lại nhiều lần, có hôm quá một tiếng mới bắt đầu" thì hai nhà ' +
      'cùng cảnh sẽ chọn cùng một mức. Nhờ vậy điểm của nhà mình so được với chính nhà mình chặng sau, ' +
      'và Coach đọc điểm là biết ngay phải hỏi tiếp câu gì.</p></div>';

    /* ─ Năm thẻ bài, mỗi thẻ mở một câu thật ─ */
    o += U().sec('TỪNG BÀI ĐO GÌ VÀ CHO RA GÌ', 'Mỗi thẻ kèm một câu thật lấy nguyên từ bài, đủ bốn mức.');
    o += '<div class="grid g1 mb">' + ds.map(function (b) {
      var laPH = b.ai === 'PH';
      var mauAi = laPH ? '#B45309' : '#185AB4';
      var q = (b.cau || [])[0];
      var x = '<div class="card mb" style="border-color:' + mauAi + '22">' +
        '<div class="row wrap mb" style="gap:7px">' + U().chip('Bài ' + h(b.bo), mauAi) +
        U().chip(laPH ? 'Phụ huynh làm' : 'Học viên làm', mauAi) +
        '<span class="tiny muted">' + (b.soCauThat || b.cau.length) + ' câu · ' +
        h(String(b.phut)) + ' phút · tuổi ' + h(b.tuoi || '') + '</span></div>' +
        '<b style="display:block;font-size:16px;line-height:1.35;margin-bottom:7px;color:' + mauAi + '">' +
        h(b.ten) + '</b>' +
        '<p class="sm dim" style="line-height:1.75;margin-bottom:12px">' + h(b.muc || '') + '</p>';

      x += '<div class="grid g2 mb">' +
        '<div class="card pad-sm"><div class="tiny up muted mb">SÁU MIỀN ĐO</div>' +
        '<p class="tiny" style="line-height:1.7">' +
        (b.mien || []).map(function (m) { return h(m); }).join(' · ') + '</p></div>' +
        '<div class="card pad-sm" style="border-color:' + mauAi + '33">' +
        '<div class="tiny up mb" style="color:' + mauAi + '">LÀM XONG THÌ CẦM ĐƯỢC GÌ</div>' +
        '<p class="tiny" style="line-height:1.7">' + h(b.ra || '') + '</p></div></div>';

      if (q) {
        x += '<div class="card pad-sm" style="border-color:var(--gita-vien-1);background:var(--gita-mo-1)">' +
          '<div class="tiny up muted mb">MỘT CÂU THẬT TRONG BÀI · MIỀN "' + h(q.mien) + '"</div>' +
          '<p class="sm" style="line-height:1.7;margin-bottom:9px"><b>' + h(q.hoi) + '</b></p>' +
          (q.chon || []).map(function (c) {
            var mc = c.muc === 1 ? '#BE0E16' : c.muc === 2 ? '#FB923C' : c.muc === 3 ? '#B45309' : '#0B7350';
            return '<div class="row" style="gap:9px;align-items:flex-start;margin-bottom:6px">' +
              '<span class="chip" style="flex:none;color:' + mc + ';border-color:' + mc +
              '40;background:' + mc + '14">Mức ' + c.muc + '</span>' +
              '<span class="tiny" style="line-height:1.65;flex:1">' + h(c.t) + '</span></div>';
          }).join('') +
          '<p class="tiny muted mt" style="line-height:1.6">Mức 1 tới mức 4 quy về thang 100 theo miền, ' +
          'không cộng dồn thành một điểm tổng duy nhất — vì một nhà mạnh miền này yếu miền kia thì điểm tổng ' +
          'giấu mất đúng chỗ cần chạm.</p></div>';
      }
      return x + '</div>';
    }).join('') + '</div>';

    /* ─ Cảnh báo tự bật ─ */
    var cbs = [];
    ds.forEach(function (b) {
      (b.canhBao || []).forEach(function (c) { cbs.push({ b: b, c: c }); });
    });
    if (cbs.length) {
      o += U().sec(cbs.length + ' CẢNH BÁO TỰ BẬT THEO NGƯỠNG',
        'Bài chấm xong không dừng ở bảng điểm. Miền nào tụt dưới ngưỡng thì một cảnh báo tự bật, và cảnh báo ' +
        'nói VIỆC PHẢI LÀM chứ không kết luận nguyên nhân — kết luận nguyên nhân là việc của buổi đọc hồ sơ ' +
        'có người ngồi cùng, không phải việc của một phép tính.');
      o += '<div class="grid g2 mb">' + cbs.slice(0, 4).map(function (x) {
        var nang = x.c.severity === 'high';
        var mc = nang ? '#BE0E16' : '#B45309';
        var ng = /domain\('([^']+)'\)\s*<\s*(\d+)/.exec(x.c['if'] || '');
        return '<div class="card pad-sm" style="border-color:' + mc + '33">' +
          '<div class="row wrap mb" style="gap:6px">' + U().chip('Bài ' + h(x.b.bo), mc) +
          U().chip(nang ? 'ưu tiên cao' : 'theo dõi', mc) + '</div>' +
          '<p class="tiny mb" style="line-height:1.65;color:var(--ink-3)">Bật khi miền <b>' +
          h(ng ? ng[1] : '—') + '</b> dưới ' + h(ng ? ng[2] : '—') + ' điểm</p>' +
          '<p class="tiny" style="line-height:1.7">' + h(x.c['then']) + '</p></div>';
      }).join('') + '</div>';
      o += '<p class="tiny muted mb">Bốn cảnh báo trên là ví dụ lấy từ bài A và bài B. Đủ ' + cbs.length +
        ' cảnh báo chỉ bật khi có bài làm thật để chấm — mà bài làm thật thì cần mã gia đình.</p>';
    }

    /* ─ Bốn nhóm ─ */
    if (ds[0] && ds[0].nhom) {
      o += U().sec('ĐIỂM MIỀN RƠI VÀO MỘT TRONG BỐN BĂNG',
        'Băng không phải xếp hạng nhà. Nó quyết định NHỊP CHẠM: băng đỏ thì Coach chạm dày, băng xanh thì ' +
        'Học viện lùi ra để nhà mình tự chạy. Không băng nào là trượt, và băng đổi được theo tuần.');
      o += '<div class="grid g4 mb">' + ds[0].nhom.map(function (n) {
        return '<div class="card pad-sm" style="border-color:' + n.color + '33">' +
          '<div class="row mb" style="gap:8px">' + U().dot(n.color) +
          '<b class="sm" style="color:' + n.color + '">' + h(n.label) + '</b></div>' +
          '<div class="tiny muted mb">' + n.min + '–' + n.max + ' điểm</div>' +
          '<p class="tiny dim" style="line-height:1.65">' + h(n.meaning) + '</p>' +
          (n.action ? '<div class="card pad-sm mt" style="border-color:' + n.color + '2e">' +
            '<div class="tiny up mb" style="color:' + n.color + '">VIỆC LÀM NGAY</div>' +
            '<p class="tiny" style="line-height:1.65">' + h(n.action) + '</p></div>' : '') +
          '</div>';
      }).join('') + '</div>';
    }

    if (ds[0] && ds[0].gioiHan)
      o += '<div class="card mb" style="border-color:var(--gita-vien-1)">' +
        '<div class="row mb" style="gap:8px"><span style="color:var(--gold-ink)">' + ic('shield', 'w-4 h-4') + '</span>' +
        '<b>Ba việc bộ đo này KHÔNG làm</b></div>' +
        '<p class="sm dim" style="line-height:1.8">' + h(ds[0].gioiHan) + '</p>' +
        '<p class="tiny muted mt" style="line-height:1.7">Dòng trên nằm nguyên trong dữ liệu của cả năm bài, ' +
        'không phải một câu miễn trừ dán thêm ở chân trang. Một bộ đo không tự khai chỗ nó dừng lại là một ' +
        'bộ đo sẽ bị dùng quá tay.</p></div>';

    o += '<div class="card" style="border-color:var(--alert);background:rgba(251,146,60,.06)">' +
      '<div class="row" style="gap:10px;align-items:flex-start">' +
      '<span style="color:var(--alert);flex:none">' + ic('lock', 'w-4 h-4') + '</span>' +
      '<div style="flex:1"><b class="sm">Xem được cấu trúc bài, làm bài thì cần mã gia đình</b>' +
      '<p class="tiny mt" style="line-height:1.75;color:var(--ink-2)">' +
      'Không phải để giữ bài. Là vì phép đo này chỉ có nghĩa khi có chỗ ghi và có mốc để đối chiếu: ' +
      'điểm hôm nay là baseline, bảy ngày sau đo lại mới ra được cái gì đã đổi. Chỗ ghi ấy là mã gia đình ' +
      'dạng F-xxx, và mã đó sinh ra lúc đăng ký. Cho làm trước rồi vứt kết quả đi là lấy ' +
      (ds.length * 15) + ' phút của cả nhà để đổi lấy một con số không so được với gì.</p></div></div></div>';
    return o;
  }

  function than() {
    if (PHAN === 'duong') return G.VIEWS && G.VIEWS['tham-gia'] ? G.VIEWS['tham-gia']() : '';
    if (PHAN === 'test') return manTest();
    return G.VIEWS && G.VIEWS['gioi-thieu'] ? G.VIEWS['gioi-thieu']() : '';
  }

  function khung() {
    var o = '<div class="gate-top"><div class="brand"><span class="mark">' + G.dauGita() + '</span>' +
      '<div><div class="nm">GITA 365</div><div class="sub">' + h(G.L('brandSub')) + '</div></div></div>' +
      '<span class="grow"></span>' +
      '<button class="btn ghost sm" data-act="ct-dong">' + ic('arrow') + 'Quay lại đăng nhập</button>' +
      '<button class="btn pri sm" data-act="mo-dang-ky">' + ic('plus') + 'Đăng ký</button></div>';

    o += '<div class="view" style="max-width:1080px;margin:0 auto;padding:22px 18px 60px">';

    o += '<div class="card mb" style="border-color:var(--gita-vien-1);background:var(--gita-mo-1)">' +
      '<p class="tiny" style="line-height:1.75;color:var(--ink-2)">' +
      '<b>Phần này mở cho người chưa có tài khoản, và mở đúng ba thứ.</b> Học viện làm gì và không nhận ' +
      'làm gì · đường vào đi qua sáu chặng nào và mỗi chặng chặn ở đâu · phép đo nền đo miền nào và ' +
      'cho ra cái gì. Ba thứ ấy vốn là những gì Học viện phải nói trước khi một gia đình quyết định — ' +
      'giấu chúng đi thì lời mời không có nghĩa.' +
      '<br><br><b>Cái không mở ở đây</b>: 1.000 kịch bản làm việc, 220 phác đồ xử lý, 250 tình huống, ' +
      '42 mô thức và ma trận năm tầng — đó là tài sản nghề, nằm trong bảy gói mã hoá và chỉ mở theo ' +
      'đúng vai, đúng tầng, đúng phiên sau khi đăng nhập. Ngân hàng câu hỏi cũng vậy: ở đây chỉ hiện ' +
      'một câu mẫu mỗi bài để xem cách hỏi, không phải cả bài.</p></div>';

    o += '<div class="row wrap mb" style="gap:8px">' + PHANS.map(function (x) {
      return '<button class="btn ghost sm' + (x.k === PHAN ? ' on' : '') + '" data-ct="' + x.k + '">' +
        h(x.t) + '</button>';
    }).join('') + '</div>';

    o += '<p class="tiny muted mb">' + h((PHANS.filter(function (x) { return x.k === PHAN; })[0] || {}).h || '') + '</p>';

    o += than();

    o += '<div class="card mt2" style="border-color:var(--gita-vien-2);background:var(--gita-mo-1)">' +
      '<div class="row wrap" style="gap:14px;align-items:center">' +
      '<div class="grow" style="min-width:260px">' +
      '<b class="sm" style="display:block;margin-bottom:6px">Đọc xong ba mục trên rồi mới quyết — đó là ' +
      'thứ tự Học viện muốn</b>' +
      '<p class="tiny" style="line-height:1.75;color:var(--ink-2)">' +
      'Đăng ký mất năm phút, không mất phí, và không mở khoá bằng thẻ. Xong thì nhà mình có ba thứ: ' +
      'một mã gia đình dạng F-xxx đi theo suốt năm tầng, một hồ sơ trống chờ số liệu, và năm bài đánh ' +
      'giá của tầng một mở ra để đo nền.' +
      '<br><br>Nếu đọc mục "sáu điều Học viện KHÔNG làm" mà thấy có dòng không hợp với nhà mình, thì ' +
      'dừng ở đây là đúng — bên em thà mất một đăng ký còn hơn nhận một gia đình mình không giúp được.' +
      '</p></div>' +
      '<button class="btn pri" data-act="mo-dang-ky">' + ic('plus') + 'Đăng ký tài khoản</button>' +
      '<button class="btn ghost" data-act="ct-dong">Đã có tài khoản</button></div></div>';

    o += '</div>';
    return o;
  }

  function ve() {
    var app = document.getElementById('app');
    if (!app) return;
    app.innerHTML = '<div id="gate">' + khung() + '</div>';
    try { window.scrollTo(0, 0); } catch (e) {}
  }

  /* ─── Cửa vào ─── */
  G.moCuaTruoc = function (phan) {
    if (phan) PHAN = phan;
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
    PHAN = 'gita';
    if (G.veCong) G.veCong();
  };

  G.doiPhanCuaTruoc = function (k) {
    if (!PHANS.filter(function (x) { return x.k === k; }).length) return;
    PHAN = k; ve();
  };
})();
