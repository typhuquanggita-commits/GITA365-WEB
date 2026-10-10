/* ═══════════════════════════════════════════════════════════════
   GITA 365 — BẢN TIN GITA · TRUYỀN THÔNG NỘI BỘ (màn hình)

   Chủ hệ 10/10/2026: "Phần nội dung và truyền thông trong khu vực nhân sự
   đang thiết kế quá hời hợt … nghiêm cấm tạo ra cho có, tạo ra để làm màu."

   Trang bảng tin nội bộ cũ (tin-noi-bo.js) chỉ GIẢI THÍCH LUẬT của một bảng
   tin — năm ngăn, trần thông báo, bảng tự soi — mà không có một bài nào để
   đọc. Màn này là bản tin THẬT: bài có người viết, có người duyệt, có lịch
   phát hành, có người đọc, có câu kiểm tra, và có chỉ số vào KPI.

   Năm ngăn:
   · Bản tin       — bài đã tới lịch, mới nhất trước; bài bắt buộc có hạn.
   · Nền tảng GITA — tầm nhìn · sứ mệnh · giá trị · triết lý · văn hoá ·
                     tiêu chuẩn · hiến pháp · định vị. Đọc THẲNG G.CULTURE —
                     không chép (sửa ở data.core.js là mọi nơi đổi theo).
   · Soạn bài      — khung theo chuyên mục, máy chủ soát lại đúng khung ấy.
   · Biên tập · lịch — hàng chờ duyệt, lịch bốn tuần, ô trống cần giao.
   · Chỉ số        — của tôi; quản lý thấy cả đội (xếp theo tên, không hạng).

   Luật máy chủ ở may-chu/truyen-thong.js; đây chỉ là cách trình bày.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;
G.VIEWS = G.VIEWS || {};

/* Mười một chuyên mục — bản chép của CHUYEN_MUC ở máy chủ (bộ thử đối
   chiếu). `vi` là câu nói cho người viết biết bài loại này để làm gì. */
G.BTG_CHUYEN_MUC = [
  { ma: 'NEN', ten: 'Tầm nhìn · sứ mệnh · giá trị cốt lõi', ic: 'sun', vi: 'Nói lại vì sao Học viện tồn tại, bằng một câu chuyện có thật của tuần này.' },
  { ma: 'VANHOA', ten: 'Triết lý kinh doanh · văn hoá GITA', ic: 'heart', vi: 'Một nguyên tắc làm việc, và nó trông thế nào trong một buổi làm việc thật.' },
  { ma: 'CHUAN', ten: 'Tiêu chuẩn con người · chất lượng dịch vụ', ic: 'shield', vi: 'Một chuẩn đo được: làm đúng trông thế nào, làm sai trông thế nào.' },
  { ma: 'HIENPHAP', ten: 'Hiến pháp · phong cách · định vị khác biệt', ic: 'crown', vi: 'Một điều của hiến pháp, vì sao nó không đổi, và chỗ GITA khác thị trường.' },
  { ma: 'CONGHIEN', ten: 'Vinh danh người cống hiến', ic: 'star', vi: 'Ghi nhận một VIỆC cụ thể kèm bằng chứng — không khen chung, không xếp hạng.' },
  { ma: 'DAISU', ten: 'Đại sứ · thành viên tiến bộ vượt trội', ic: 'users', vi: 'Một hành trình tiến bộ có số đo trước–sau. Đại sứ là khách: phải có đồng ý công khai.' },
  { ma: 'TRACHNHIEM', ten: 'Tinh thần trách nhiệm', ic: 'target', vi: 'Một việc mà nếu ai cũng nghĩ "người khác sẽ làm" thì gia đình chịu thiệt.' },
  { ma: 'CHIENDICH', ten: 'Chiến dịch', ic: 'flame', vi: 'Mục tiêu đo được, thời gian, ai làm gì. Chiến dịch không có số đo là một khẩu hiệu.' },
  { ma: 'VANHANH', ten: 'Hướng dẫn vận hành', ic: 'tools', vi: 'Các bước làm được, theo đúng thứ tự, kèm chỗ hay sai.' },
  { ma: 'SUKIEN', ten: 'Sự kiện · thông báo', ic: 'calendar', vi: 'Thời điểm, nơi diễn ra, ai cần có mặt, cần chuẩn bị gì.' },
  { ma: 'HOCTAP', ten: 'Yêu cầu học tập', ic: 'book', vi: 'Bắt buộc đọc, có hạn xác nhận và câu kiểm tra hiểu — tính vào KPI.' }
];
/* Nhịp phát hành chuẩn — bản chép của NHIP ở máy chủ. */
G.BTG_NHIP = [
  'Thứ Hai 08:00 · nền tảng GITA (tầm nhìn · văn hoá · hiến pháp · trách nhiệm, luân phiên)',
  'Thứ Ba 08:00 · hướng dẫn vận hành',
  'Thứ Tư 08:00 · tiêu chuẩn con người · chất lượng dịch vụ',
  'Thứ Năm 08:00 · yêu cầu học tập (bắt buộc đọc, có câu kiểm tra)',
  'Thứ Sáu 16:00 · vinh danh người cống hiến · đại sứ · thành viên tiến bộ',
  'Ngày 1 hằng tháng 08:00 · chiến dịch tháng',
  'Sự kiện · thông báo: phát khi cần, không quá 3 tin đẩy một người một ngày'
];
/* Thư viện ảnh 3D cho bản tin: mã → mô tả. Chỉ khai mã ĐÃ có tệp trong
   assets/anh-tt/ — một bài trỏ vào ảnh chưa có là một ô vỡ. */
G.BTG_ANH = G.BTG_ANH || {};

(function () {
  var U = G.U, h = U.h, ic = U.ic;
  var CM = {};
  G.BTG_CHUYEN_MUC.forEach(function (c) { CM[c.ma] = c; });
  G.BTG = G.BTG || { tab: 'tin', ds: null, lich: null, cs: null, bai: null, nhap: null, loi: '' };

  function goi(fn, y) {
    if (!G.goiMayChu) return Promise.resolve({ ok: false, error: 'Bản tin chạy trên máy chủ GITA — chưa nối máy chủ.' });
    return G.goiMayChu(fn, y || {}).catch(function (e) { return { ok: false, error: (e && e.message) || 'Không gọi được máy chủ.' }; });
  }
  function ve() { if (G.S && G.S.view === 'ban-tin-gita' && G.render) G.render(); }
  G.btgTai = function () {
    goi('dsBaiTT', { chuyenMuc: G.BTG.loc || '' }).then(function (x) { G.BTG.ds = x; ve(); });
  };
  G.btgTab = function (t) { G.BTG.tab = t; G.BTG.bai = null; ve(); window.scrollTo && window.scrollTo(0, 0); };
  G.btgLoc = function (el) { G.BTG.loc = el.value || ''; G.BTG.ds = null; G.btgTai(); };
  G.btgMo = function (el) {
    var id = el.getAttribute('data-id');
    goi('docBaiTT', { id: id }).then(function (x) { G.BTG.bai = x; ve(); window.scrollTo && window.scrollTo(0, 0); });
  };
  G.btgDong = function () { G.BTG.bai = null; G.BTG.ds = null; G.btgTai(); };

  function anh(ma, lop) {
    var alt = G.BTG_ANH[ma] || (G.NHA_ANH || {})[ma];
    if (!alt) return '';
    var duong = /^TT/.test(ma) ? 'assets/anh-tt/' : 'assets/anh-nha/';
    return '<div class="' + (lop || 'tt-anh') + '"><img src="' + duong + h(ma) + '.webp" alt="' + h(alt) +
      '" loading="lazy" decoding="async" width="1152" height="768"></div>';
  }
  function ngay(iso) {
    if (!iso) return '';
    var d = new Date(Date.parse(iso) + 7 * 3600000).toISOString();
    return d.slice(8, 10) + '/' + d.slice(5, 7) + '/' + d.slice(0, 4) + ' · ' + d.slice(11, 16);
  }
  function doanVan(s) {
    return String(s || '').split(/\n{2,}/).map(function (p) { return '<p>' + h(p).replace(/\n/g, '<br>') + '</p>'; }).join('');
  }

  /* ══ NGĂN 1 · BẢN TIN ══ */
  function nganTin() {
    if (G.BTG.bai) return veBai(G.BTG.bai);
    var x = G.BTG.ds;
    if (!x) { G.btgTai(); return '<p class="note">Đang tải bản tin…</p>'; }
    if (!x.ok) return U.empty('Bản tin chưa mở được', h(x.error || 'Cần nối máy chủ.') +
      ' Trong lúc chờ, ngăn "Nền tảng GITA" vẫn đọc được đầy đủ.');
    var o = '<div class="tt-loc"><label for="tt-loc">Chuyên mục</label><select id="tt-loc" class="inp" onchange="G.btgLoc(this)">' +
      '<option value="">Tất cả chuyên mục</option>' + G.BTG_CHUYEN_MUC.map(function (c) {
        return '<option value="' + c.ma + '"' + (G.BTG.loc === c.ma ? ' selected' : '') + '>' + h(c.ten) + '</option>'; }).join('') + '</select></div>';
    var batBuoc = (x.banTin || []).filter(function (b) { return b.batBuocDoc && !b.daXacNhan; });
    if (batBuoc.length) o += '<div class="tt-canlam"><b>' + ic('alert') + ' ' + batBuoc.length + ' bài bắt buộc bạn chưa xác nhận</b>' +
      '<span>Đọc và trả lời câu kiểm tra trước hạn — phần này tính vào KPI nghiệp vụ.</span></div>';
    if (!(x.banTin || []).length) return o + U.empty('Chưa có bài nào tới lịch',
      'Bài đã duyệt sẽ tự hiện khi tới giờ phát hành. Ban biên tập xem lịch ở ngăn "Biên tập · lịch".');
    o += '<div class="tt-luoi">' + x.banTin.map(function (b) {
      var c = CM[b.chuyenMuc] || {};
      return '<article class="tt-the">' + anh(b.anh) +
        '<div class="tt-than"><span class="tt-cm">' + ic(c.ic || 'spark') + ' ' + h(c.ten || b.chuyenMuc) + '</span>' +
        '<h3>' + h(b.tieuDe) + '</h3><p class="tt-tom">' + h(b.tomTat) + '</p>' +
        '<div class="tt-chan"><span>' + h(b.tacGia) + ' · ' + ngay(b.lich) + '</span>' +
        (b.batBuocDoc ? (b.daXacNhan ? '<span class="tt-nhan ok">' + ic('check') + ' đã xác nhận · ' + b.diem + ' điểm</span>'
          : '<span class="tt-nhan gap">Bắt buộc · hạn ' + ngay(b.hanXacNhan) + '</span>') : (b.daDoc ? '<span class="tt-nhan">đã đọc</span>' : '')) +
        '</div><button class="btn tt-mo" data-id="' + h(b.id) + '" onclick="G.btgMo(this)">Đọc bài ' + ic('arrow') + '</button></div></article>';
    }).join('') + '</div>';
    return o;
  }

  function veBai(x) {
    if (!x.ok) return '<button class="btn" onclick="G.btgDong()">' + ic('arrowL') + ' Về bản tin</button>' + U.empty('Không mở được bài', h(x.error || ''));
    var b = x.bai, c = CM[b.chuyenMuc] || {};
    var o = '<button class="btn" onclick="G.btgDong()">' + ic('arrowL') + ' Về bản tin</button>';
    o += '<article class="tt-bai">' + anh(b.anh, 'tt-anh tt-anh-lon') +
      '<span class="tt-cm">' + ic(c.ic || 'spark') + ' ' + h(c.ten || '') + '</span>' +
      '<h2>' + h(b.tieuDe) + '</h2><p class="tt-sapo">' + h(b.tomTat) + '</p>' +
      '<p class="tt-meta">' + h(b.tacGia) + ' · ' + ngay(b.lich) + (b.nguoiDuyet ? ' · duyệt: ' + h(b.nguoiDuyet) : '') +
      ' · ' + (b.soNguoiDoc || 0) + ' người đã đọc</p>';
    if (b.nguoiDuocGhiNhan) o += '<div class="tt-ghinhan"><b>Ghi nhận: ' + h(b.nguoiDuocGhiNhan) + '</b><p><b>Việc đã làm.</b> ' + h(b.viecCuThe) +
      '</p><p><b>Bằng chứng.</b> ' + h(b.bangChung) + '</p></div>';
    if (b.mucTieu) o += '<div class="tt-ghinhan"><b>Chiến dịch ' + h(b.tuNgay) + ' → ' + h(b.denNgay) + '</b><p>' + h(b.mucTieu) + '</p></div>';
    if (b.thoiDiem) o += '<div class="tt-ghinhan"><b>' + ic('calendar') + ' ' + h(b.thoiDiem) + (b.diaDiem ? ' · ' + h(b.diaDiem) : '') + '</b></div>';
    o += '<div class="tt-van">' + doanVan(b.noiDung) + '</div>';
    if (b.buocLam && b.buocLam.length) o += '<ol class="tt-buoc">' + b.buocLam.map(function (s) { return '<li>' + h(s) + '</li>'; }).join('') + '</ol>';
    o += '<div class="tt-hanhdong"><b>Sau khi đọc, bạn làm được</b><p>' + h(b.hanhDong) + '</p></div>';
    if (b.nguon) o += '<p class="tt-nguon">Nguồn số liệu: ' + h(b.nguon) + '</p>';
    if (b.batBuocDoc && b.cauHoi) {
      if (b.daXacNhan) o += '<div class="tt-kiemtra ok">' + ic('check') + ' Bạn đã xác nhận bài này · ' + b.diem + ' điểm.</div>';
      else {
        o += '<form class="tt-kiemtra" onsubmit="return G.btgXacNhan(event,\'' + h(b.id).replace(/'/g, '') + '\')"><b>Câu kiểm tra — trả lời một lần</b>';
        b.cauHoi.forEach(function (q, i) {
          o += '<fieldset><legend>' + (i + 1) + '. ' + h(q.cau) + '</legend>' + q.chon.map(function (t, j) {
            return '<label class="tt-chon"><input type="radio" name="q' + i + '" value="' + j + '" required> ' + h(t) + '</label>'; }).join('') + '</fieldset>';
        });
        o += '<button class="btn pri" type="submit">Nộp và xác nhận đã đọc</button></form>';
      }
    }
    return o + '</article>';
  }
  G.btgXacNhan = function (ev, id) {
    ev.preventDefault();
    var f = ev.target, tl = [];
    for (var i = 0; i < 3; i++) { var c = f.querySelector('input[name="q' + i + '"]:checked'); if (f.querySelector('input[name="q' + i + '"]')) tl.push(c ? Number(c.value) : -1); }
    goi('xacNhanBaiTT', { id: id, traLoi: tl }).then(function (x) {
      if (x && x.ok) { U.toast('Đã xác nhận · ' + x.diem + ' điểm' + (x.dungHan ? '' : ' (quá hạn)'), 'ok'); G.btgMo({ getAttribute: function () { return id; } }); }
      else U.toast((x && x.error) || 'Không xác nhận được.', 'err');
    });
    return false;
  };

  /* ══ NGĂN 2 · NỀN TẢNG GITA — đọc thẳng G.CULTURE ══ */
  /* Triết lý kinh doanh: năm nguyên tắc rút từ những gì Học viện đã chốt
     (sứ mệnh 365 ngày, điều 4 không hứa kết quả, khung giá là lời hứa, giá
     trị THỊNH). Câu "1 đồng → 1 triệu" là THƯỚC ĐO NỘI BỘ của chủ hệ —
     nói rõ nó không phải lời hứa với khách (luật không hứa kết quả). */
  G.BTG_TRIET_LY = [
    { t: 'Bán năng lực tự vận hành, không bán sự phụ thuộc', d: 'Sứ mệnh nói "sau 365 ngày, nhà ấy tự chạy được mà không cần ai canh". Một dịch vụ khiến gia đình phải quay lại mãi là dịch vụ chưa làm xong việc của mình. Chúng ta thành công khi gia đình cần chúng ta ít dần.' },
    { t: 'Hứa quy trình và bằng chứng — không hứa kết quả', d: 'Không ai hứa được đứa trẻ sẽ thay đổi thế nào. Thứ Học viện hứa được là một bản đồ, một nhịp, một người đồng hành, và mọi bước đều có bằng chứng ghi lại. Điều 4 bất khả sửa giữ chỗ này.' },
    { t: 'Khung là lời hứa, giá là con số', d: 'Thứ gia đình được nhận ở mỗi chặng là lời hứa, viết rõ và không âm thầm đổi. Con số tiền có thể đổi theo thị trường, nhưng một gia đình đã ký luôn chỉ ra được bản mô tả nào đang áp cho họ.' },
    { t: 'Thịnh vượng là cả nhà cùng lớn', d: 'Đích không phải thành tích của một đứa trẻ. Ta đo cả phần thay đổi của người lớn, vì chặng của con không giữ nổi nếu người lớn đứng yên.' },
    { t: 'Tư duy giá trị: một đồng phải đổi thành một hệ giá trị bền vững', d: 'Thước đo chủ hệ đặt cho đội ngũ: mỗi đồng gia đình đầu tư phải đổi được thành năng lực còn ở lại sau khi hợp đồng kết thúc — thói quen, ngôn ngữ chung, cách giải quyết vấn đề — lớn gấp nhiều lần số tiền bỏ ra. Đây là chuẩn ta tự đặt cho mình mỗi ngày, KHÔNG phải câu để hứa với khách.' }
  ];
  /* Tiêu chuẩn con người GITA — sáu trụ chủ hệ đặt cho mọi thành viên. */
  G.BTG_SAU_TRU = [
    { t: 'Phẩm chất', d: 'Trung thực với dữ liệu, tôn trọng vô điều kiện, giữ chuẩn nghề — bảy giá trị cốt lõi trông thấy được trong việc làm, không chỉ trong lời nói.' },
    { t: 'Thói quen tốt', d: 'Đúng hẹn, ghi sổ trong ngày, nghe trước khi khuyên. Người đồng hành không giữ được nhịp của chính mình thì không giữ nhịp cho gia đình được.' },
    { t: 'Tư duy tầng cao', d: 'Nhìn đúng trước khi sửa, can thiệp đúng tầng, đổi lăng kính thay vì tăng âm lượng — cách nghĩ của nhóm 20% tạo ra 80% kết quả.' },
    { t: 'Kỹ năng làm chủ', d: 'Làm chủ cảm xúc trong cuộc trò chuyện khó, làm chủ thời gian của mình, làm chủ một buổi làm việc bằng kịch bản và phác đồ.' },
    { t: 'Phương pháp giải phóng trí tuệ', d: 'Mô thức huấn luyện GITA kết hợp NLP và coach chuyên sâu: câu hỏi khai mở, đọc trạng thái để hiểu chứ không để ép, giúp người kia tự thấy lời giải.' },
    { t: 'Hệ giải quyết vấn đề nhiều cấp', d: 'Một vấn đề được nhìn ở đủ tầng — hành vi, thói quen, niềm tin, bản sắc — và mỗi khó khăn được đọc như một cơ hội để gia đình lớn lên.' }
  ];
  G.BTG_CHAT_LUONG = [
    'Mọi buổi làm việc có kịch bản, có phác đồ, có cổng nghiệm thu — ngẫu hứng là rủi ro của gia đình khác.',
    'Đèn đỏ là việc của người thật: gọi trong 24 giờ, không bán gì, không đóng bằng tin nhắn.',
    'Nghe bảy, khuyên ba; mỗi ghi nhận bắt đầu từ một việc đã xảy ra.',
    'Dữ liệu gia đình và đứa trẻ không rời hệ ở dạng nhận ra được (Điều 13).',
    'Nói trước cả điều bất lợi: quyền, chi phí, giới hạn của dịch vụ.',
    'Không chào mời sản phẩm trong không gian đồng hành; không dùng kỹ thuật để ép quyết định mua.'
  ];
  G.BTG_HP9 = ['Không xếp hạng gia đình', 'Chấm nhà, không chấm người', 'Không tụt cấp đã đạt', 'Không hứa kết quả',
    'Không dùng nỗi sợ của cha mẹ', 'Không lấy tuyến dưới làm nguồn thu', 'Trẻ có quyền phủ quyết ảnh của mình',
    'Vòng đỏ không rời thiết bị', 'Không giữ chân bằng thủ thuật'];
  G.BTG_DINH_VI = [
    ['Bán khoá học, bán buổi tư vấn', 'Trao một hệ vận hành 365 ngày, đo bằng việc nhà tự chạy được'],
    ['Xếp hạng, so sánh con nhà người ta', 'Mỗi nhà chỉ so với chính nhà mình ở chặng trước'],
    ['Hứa kết quả để chốt đơn', 'Hứa quy trình, đưa bằng chứng ở mỗi cổng'],
    ['Dọa "muộn mất rồi" để thúc', 'Không dùng nỗi sợ — điều bất khả sửa'],
    ['Lời khuyên rời rạc từ trăm nguồn', 'Một bản đồ, một ngôn ngữ chung cho cả nhà'],
    ['Thu thập dữ liệu để bán thêm', 'Dữ liệu gia đình ở lại trong hệ; con có quyền phủ quyết ảnh']
  ];

  function nganNen() {
    var C = G.CULTURE || {};
    var o = '<div class="tt-nen">';
    function khoi(eb, tieu, than) { return '<section class="tt-khoi"><span class="tt-eb">' + h(eb) + '</span><h3>' + h(tieu) + '</h3>' + than + '</section>'; }
    if (C.tamNhin) o += khoi('Tầm nhìn', C.tamNhin.big, '<p class="tt-phu">' + h(C.tamNhin.sub) + '</p>' +
      (C.moc2035 ? '<div class="tt-moc"><b>' + h(C.moc2035.t) + '</b><p>' + h(C.moc2035.big) + '</p><p class="tt-phu">' + h(C.moc2035.sub) + '</p></div>' : ''));
    if (C.suMenh) o += khoi('Sứ mệnh', C.suMenh.big, '<p class="tt-phu">' + h(C.suMenh.sub) + '</p>');
    if (C.giaTri) o += khoi('Bảy giá trị cốt lõi', 'Bảy chữ, mỗi chữ có một việc nên làm và một việc không làm',
      '<div class="tt-gt">' + C.giaTri.map(function (g) {
        return '<div class="tt-gt-o"><b>' + h(g.k) + '</b><span>' + h(g.t) + '</span><p>' + h(g.d) + '</p>' +
          '<p class="tt-nen-ok">Nên: ' + h(g.nen) + '</p><p class="tt-nen-khong">Không: ' + h(g.khong) + '</p></div>'; }).join('') + '</div>');
    o += khoi('Triết lý kinh doanh', 'Năm nguyên tắc quyết định cách Học viện kiếm tiền',
      '<ol class="tt-ds">' + G.BTG_TRIET_LY.map(function (x) { return '<li><b>' + h(x.t) + '.</b> ' + h(x.d) + '</li>'; }).join('') + '</ol>');
    if (C.kimChiNam) o += khoi('Văn hoá GITA', 'Sáu kim chỉ nam hành động',
      '<ol class="tt-ds">' + C.kimChiNam.map(function (x) { return '<li><b>' + h(x.t) + '.</b> ' + h(x.d) + '</li>'; }).join('') + '</ol>' +
      (C.bonNhip ? '<p class="tt-phu"><b>Bốn nhịp trong mọi cuộc trò chuyện khó:</b> ' + C.bonNhip.map(function (x) { return h(x.t) + ' — ' + h(x.d); }).join(' · ') + '</p>' : ''));
    o += khoi('Tiêu chuẩn con người GITA', 'Sáu trụ mọi thành viên cùng rèn',
      '<div class="tt-gt">' + G.BTG_SAU_TRU.map(function (x, i) { return '<div class="tt-gt-o"><b>' + (i + 1) + '</b><span>' + h(x.t) + '</span><p>' + h(x.d) + '</p></div>'; }).join('') + '</div>');
    o += khoi('Chất lượng dịch vụ cao cấp', 'Sáu chuẩn gia đình cảm nhận được',
      '<ul class="tt-ds">' + G.BTG_CHAT_LUONG.map(function (x) { return '<li>' + h(x) + '</li>'; }).join('') + '</ul>');
    o += khoi('Hiến pháp', 'Chín điều bất khả sửa',
      '<p class="tt-phu">Sửa một trong chín điều này là lập ra một tổ chức khác — không phải GITA.</p>' +
      '<ol class="tt-ds tt-hp">' + G.BTG_HP9.map(function (x) { return '<li>' + h(x) + '</li>'; }).join('') + '</ol>');
    o += khoi('Định vị khác biệt', 'Thị trường thường làm — GITA làm',
      '<div class="tt-bang">' + U.tbl(['Thị trường thường làm', 'GITA làm'], G.BTG_DINH_VI.map(function (r) { return [h(r[0]), '<b>' + h(r[1]) + '</b>']; })) + '</div>');
    if (C.noiQuy) o += khoi('Nội quy hệ sinh thái', 'Mười điều giữ cho cộng đồng an toàn để kể thật',
      '<ol class="tt-ds">' + C.noiQuy.map(function (x) { return '<li><b>' + h(x.t) + '.</b> ' + h(x.d) + '</li>'; }).join('') + '</ol>');
    return o + '</div>';
  }

  /* ══ NGĂN 3 · SOẠN BÀI ══ */
  G.btgNhap = function () { return G.BTG.nhap || (G.BTG.nhap = { chuyenMuc: 'VANHOA' }); };
  G.btgGan = function (el) { var n = G.btgNhap(), k = el.getAttribute('data-k'); n[k] = el.type === 'checkbox' ? el.checked : el.value; };
  G.btgDoiCm = function (el) { G.btgNhap().chuyenMuc = el.value; ve(); };
  function o_(k, nhan, goiY, dai) {
    var n = G.btgNhap(), v = n[k] || '';
    return '<label class="tt-o" for="tt-' + k + '"><b>' + h(nhan) + '</b>' + (goiY ? '<span>' + h(goiY) + '</span>' : '') +
      (dai ? '<textarea id="tt-' + k + '" class="inp" rows="' + dai + '" data-k="' + k + '" oninput="G.btgGan(this)">' + h(v) + '</textarea>'
        : '<input id="tt-' + k + '" class="inp" data-k="' + k + '" value="' + h(v) + '" oninput="G.btgGan(this)">') + '</label>';
  }
  function nganSoan() {
    var n = G.btgNhap(), c = CM[n.chuyenMuc] || G.BTG_CHUYEN_MUC[0];
    var o = '<div class="tt-soan"><p class="tt-phu">Mỗi bài đi qua ban biên tập trước khi phát hành. Máy chủ soát đúng khung dưới đây — ' +
      'thiếu ô nào máy nói ô ấy. Bài đã phát hành của bạn tính vào chỉ số truyền thông (KPI nghiệp vụ).</p>';
    o += '<label class="tt-o" for="tt-cm"><b>Chuyên mục</b><span>' + h(c.vi) + '</span><select id="tt-cm" class="inp" onchange="G.btgDoiCm(this)">' +
      G.BTG_CHUYEN_MUC.map(function (x) { return '<option value="' + x.ma + '"' + (x.ma === n.chuyenMuc ? ' selected' : '') + '>' + h(x.ten) + '</option>'; }).join('') + '</select></label>';
    o += o_('tieuDe', 'Tiêu đề', '10–110 ký tự. Nói đúng điều bài mang lại, không giật tít.');
    o += o_('tomTat', 'Tóm tắt', '60–260 ký tự — người lướt bản tin đọc đoạn này là hiểu bài nói gì.', 3);
    o += o_('noiDung', 'Nội dung', 'Cách đoạn bằng một dòng trống. Có con số thì khai nguồn ở ô dưới.', 12);
    o += o_('hanhDong', 'Sau khi đọc, người đọc làm được gì', 'Một việc cụ thể, làm được trong tuần này.', 2);
    o += o_('nguon', 'Nguồn số liệu (nếu bài có con số)', 'Ví dụ: sổ chăm sóc tháng 10 · bảng đo lường 41 chỉ số.');
    var ma = Object.keys(G.BTG_ANH).concat(Object.keys(G.NHA_ANH || {}));
    o += '<label class="tt-o" for="tt-anh"><b>Ảnh 3D</b><span>' + (ma.length ? 'Chọn trong thư viện ảnh của Học viện.' : 'Thư viện ảnh đang được dựng — máy chủ vẫn đòi mã ảnh hợp lệ (TT01–TT24).') + '</span>' +
      '<input id="tt-anh" class="inp" data-k="anh" list="tt-anh-ds" value="' + h(n.anh || '') + '" oninput="G.btgGan(this)" placeholder="TT01">' +
      '<datalist id="tt-anh-ds">' + ma.map(function (m) { return '<option value="' + h(m) + '">' + h((G.BTG_ANH[m] || G.NHA_ANH[m] || '').slice(0, 60)) + '</option>'; }).join('') + '</datalist></label>';
    if (n.chuyenMuc === 'CONGHIEN' || n.chuyenMuc === 'DAISU') {
      o += o_('nguoiDuocGhiNhan', 'Người được ghi nhận', 'Tên đăng nhập nhân sự, hoặc mã đại sứ.');
      o += o_('viecCuThe', 'Việc cụ thể đã làm', '≥ 80 ký tự. Việc gì, khi nào, cho ai — ghi nhận việc, không khen chung.', 3);
      o += o_('bangChung', 'Bằng chứng', '≥ 40 ký tự. Số đo, ngày, sổ nào đối chiếu được.', 2);
      if (n.chuyenMuc === 'DAISU') o += '<label class="tt-chk"><input type="checkbox" data-k="dongYCongKhai" onchange="G.btgGan(this)"' + (n.dongYCongKhai ? ' checked' : '') +
        '> Đại sứ đã đồng ý cho kể câu chuyện này trong nội bộ</label>';
    }
    if (n.chuyenMuc === 'CHIENDICH') { o += o_('mucTieu', 'Mục tiêu đo được', '≥ 30 ký tự.', 2) + o_('tuNgay', 'Từ ngày (YYYY-MM-DD)', '') + o_('denNgay', 'Đến ngày (YYYY-MM-DD)', ''); }
    if (n.chuyenMuc === 'SUKIEN') { o += o_('thoiDiem', 'Thời điểm (YYYY-MM-DD HH:MM)', '') + o_('diaDiem', 'Nơi diễn ra / kênh', ''); }
    if (n.chuyenMuc === 'VANHANH') o += o_('buocText', 'Các bước (mỗi dòng một bước, ít nhất 3)', '', 5);
    if (n.chuyenMuc === 'HOCTAP') o += '<p class="tt-phu">Yêu cầu học tập bắt buộc đọc: hạn xác nhận và câu kiểm tra soạn ở dạng: một dòng câu hỏi, các dòng lựa chọn, đánh dấu * trước đáp án đúng; cách câu bằng dòng trống.</p>' +
      o_('hanNgay', 'Hạn xác nhận (số ngày sau phát hành, 1–14)', '') + o_('cauText', 'Câu kiểm tra (1–3 câu)', 'Ví dụ:\nNhịp nào đến sau NGHE?\nDẪN ĐƯỜNG\n*CÔNG NHẬN\nLÀM RÕ', 7);
    o += '<div class="row tt-nut"><button class="btn" onclick="G.btgLuu(false)">Lưu nháp</button><button class="btn pri" onclick="G.btgLuu(true)">Lưu và nộp duyệt</button></div>';
    if (G.BTG.loi) o += '<div class="tt-loi">' + h(G.BTG.loi) + '</div>';
    var cua = (G.BTG.ds && G.BTG.ds.cuaToi) || [];
    if (cua.length) o += U.sec('Bài của tôi', '') + U.tbl(['Tiêu đề', 'Trạng thái', 'Ghi chú biên tập'], cua.map(function (b) {
      return [h(b.tieuDe || '(chưa có tiêu đề)'), h({ nhap: 'Nháp', choDuyet: 'Chờ duyệt', traVe: 'Trả về — cần sửa', daDuyet: 'Đã duyệt · ' + ngay(b.lich), daGo: 'Đã gỡ' }[b.trangThai] || b.trangThai),
        h(b.ghiChuDuyet || '')]; }));
    return o + '</div>';
  }
  function phanCau(t) {
    return String(t || '').split(/\n\s*\n/).map(function (k) {
      var d = k.split('\n').map(function (x) { return x.trim(); }).filter(Boolean);
      if (d.length < 3) return null;
      var dung = -1, chon = d.slice(1).map(function (x, i) { if (x.charAt(0) === '*') { dung = i; return x.slice(1).trim(); } return x; });
      return { cau: d[0], chon: chon, dung: dung };
    }).filter(Boolean);
  }
  G.btgLuu = function (nop) {
    var n = G.btgNhap(), b = {};
    Object.keys(n).forEach(function (k) { if (k !== 'id' && k !== 'buocText' && k !== 'cauText') b[k] = n[k]; });
    if (n.buocText) b.buocLam = String(n.buocText).split('\n').map(function (x) { return x.trim(); }).filter(Boolean);
    if (n.cauText) b.cauHoi = phanCau(n.cauText);
    if (n.hanNgay) b.hanNgay = Number(n.hanNgay);
    goi('soanBaiTT', { id: n.id, bai: b }).then(function (x) {
      if (!x || !x.ok) { G.BTG.loi = (x && x.error) || 'Không lưu được.'; ve(); return; }
      n.id = x.id;
      if (!nop) { G.BTG.loi = x.loi && x.loi.length ? 'Đã lưu nháp. Còn thiếu để nộp: ' + x.loi.join('; ') : ''; U.toast('Đã lưu nháp.', 'ok'); G.BTG.ds = null; G.btgTai(); return; }
      goi('nopBaiTT', { id: x.id }).then(function (z) {
        if (z && z.ok) { G.BTG.loi = ''; G.BTG.nhap = null; U.toast('Đã nộp ban biên tập.', 'ok'); G.BTG.ds = null; G.btgTai(); }
        else { G.BTG.loi = (z && z.error) || 'Chưa nộp được.'; ve(); }
      });
    });
  };

  /* ══ NGĂN 4 · BIÊN TẬP · LỊCH ══ */
  G.btgDuyet = function (el, quyet) {
    var id = el.getAttribute('data-id'), lich = document.getElementById('tt-lich-' + id), gc = document.getElementById('tt-gc-' + id);
    var y = { id: id, quyet: quyet, ghiChu: gc ? gc.value : '' };
    if (quyet !== 'traVe') y.lich = lich && lich.value ? new Date(lich.value + ':00+07:00').toISOString() : '';
    goi('duyetBaiTT', y).then(function (x) {
      if (x && x.ok) { U.toast(quyet === 'traVe' ? 'Đã trả về tác giả.' : 'Đã duyệt · lên lịch.', 'ok'); G.BTG.ds = null; G.BTG.lich = null; G.btgTai(); }
      else U.toast((x && x.error) || 'Không duyệt được.', 'err');
    });
  };
  function nganBienTap() {
    var x = G.BTG.ds;
    if (!x) { G.btgTai(); return '<p class="note">Đang tải…</p>'; }
    var o = '';
    if (!G.BTG.lich) { goi('lichTT', {}).then(function (z) { G.BTG.lich = z; ve(); }); }
    var l = G.BTG.lich;
    o += U.sec('Lịch phát hành bốn tuần tới', G.BTG_NHIP.join(' · '));
    if (l && l.ok) {
      o += '<p class="tt-phu">' + (l.soTrong ? '<b>' + l.soTrong + ' ô chưa có bài</b> — ban biên tập giao người viết trước ngày phát hành.' : 'Mọi ô trong bốn tuần đã có bài.') + '</p>';
      o += '<div class="tt-lich">' + l.o.map(function (s) {
        return '<div class="tt-lich-o' + (s.trong ? ' trong' : '') + '"><b>' + h(s.ngay.slice(8, 10) + '/' + s.ngay.slice(5, 7)) + ' · ' + h(s.gio) + '</b><span>' + h(s.ten) + '</span>' +
          (s.trong ? '<em>Chưa có bài</em>' : s.bai.map(function (b) { return '<em>' + h(b.tieuDe) + ' — ' + h(b.tacGia) + '</em>'; }).join('')) + '</div>';
      }).join('') + '</div>';
    } else if (l) o += '<p class="note">' + h(l.error || '') + '</p>';
    if (!x.laBienTap) return o + '<p class="tt-phu">Duyệt bài là việc của ban biên tập (R01–R04).</p>';
    var hang = x.choDuyet || [];
    o += U.sec('Hàng chờ duyệt (' + hang.length + ')', 'Không duyệt bài của chính mình. Trả về thì viết rõ cần sửa gì.');
    if (!hang.length) o += '<p class="note">Không có bài nào chờ duyệt.</p>';
    o += hang.map(function (b) {
      var c = CM[b.chuyenMuc] || {}, id = h(b.id);
      return '<div class="card mb tt-duyet"><span class="tt-cm">' + h(c.ten || '') + '</span><h4>' + h(b.tieuDe) + '</h4><p class="tt-tom">' + h(b.tomTat) + '</p>' +
        '<details><summary>Đọc toàn bài</summary><div class="tt-van">' + doanVan(b.noiDung) + '</div><p><b>Làm được:</b> ' + h(b.hanhDong) + '</p></details>' +
        '<p class="tt-phu">Tác giả: ' + h(b.tacGia) + '</p>' +
        '<label class="tt-o" for="tt-lich-' + id + '"><b>Lịch phát hành (giờ Việt Nam)</b><input id="tt-lich-' + id + '" class="inp" type="datetime-local"></label>' +
        '<label class="tt-o" for="tt-gc-' + id + '"><b>Ghi chú biên tập</b><textarea id="tt-gc-' + id + '" class="inp" rows="2"></textarea></label>' +
        '<div class="row tt-nut"><button class="btn pri" data-id="' + id + '" onclick="G.btgDuyet(this,\'duyet\')">Duyệt và lên lịch</button>' +
        '<button class="btn" data-id="' + id + '" onclick="G.btgDuyet(this,\'traVe\')">Trả về để sửa</button></div></div>';
    }).join('');
    if ((G.S && G.S.role) === 'R01') o += U.sec('Bộ bài nền của Học viện', 'Tám bài mở đầu bản tin, viết từ chính văn bản nền đã chốt. Super Admin ban hành — mỗi bài tự rơi vào đúng ô lịch của nó trong hai tuần tới.') +
      '<p class="row"><button class="btn pri" onclick="G.btgBanHanhNen()">Ban hành bộ bài nền</button></p>';
    return o;
  }

  /* ══ NGĂN 5 · CHỈ SỐ ══ */
  function nganChiSo() {
    if (!G.BTG.cs) { goi('chiSoTT', {}).then(function (z) { G.BTG.cs = z; ve(); }); return '<p class="note">Đang tải…</p>'; }
    var z = G.BTG.cs;
    if (!z.ok) return U.empty('Chưa đọc được chỉ số', h(z.error || ''));
    var t = z.toi;
    var o = '<div class="tt-cs"><div class="tt-cs-so"><b>' + t.diem + '</b><span>chỉ số truyền thông kỳ ' + h(z.ky) + '</span></div>' +
      U.tbl(['Phần', 'Điểm', 'Trọng số', 'Đếm từ đâu'], t.phan.map(function (p) {
        return [h({ xacNhan: 'Xác nhận bài bắt buộc đúng hạn', hieu: 'Hiểu bài (câu kiểm tra)', dongGop: 'Bài đóng góp đã phát hành' }[p.ma] || p.ma), p.giaTri, p.trong, h(p.ghiChu)]; })) +
      '<p class="tt-phu">Chỉ số này là 30% của phần thi nghiệp vụ trong KPI (70% còn lại là sát hạch có người chấm). Kỳ không có bài bắt buộc thì chỉ tính phần đóng góp — ' +
      'mỗi tháng ' + z.luat.dongGopThang + ' bài đã phát hành là đủ phần ấy.</p></div>';
    if (z.doi) o += U.sec('Cả đội — xếp theo tên', 'Để biết ai đang tụt nhịp mà hỗ trợ, không để xếp hạng.') +
      U.tbl(['Nhân sự', 'Vai', 'Chỉ số', 'Chi tiết'], z.doi.map(function (d) {
        return [h(d.u), h(d.role), d.diem, h(d.phan.map(function (p) { return p.ghiChu; }).join(' · '))]; }));
    return o;
  }

  /* ══ BỘ BÀI NỀN ══ — ban hành bằng đúng hai cửa có sẵn (soạn → duyệt có
     cờ ban hành). Lịch rơi vào ô nhịp chuẩn của hai tuần tới. */
  G.btgBanHanhNen = function () {
    var ds = G.BTG_BAI_NEN || [], i = 0, ok = 0, loi = [];
    function tiepTheo() {
      if (i >= ds.length) { U.toast('Đã ban hành ' + ok + '/' + ds.length + ' bài nền' + (loi.length ? ' · lỗi: ' + loi[0] : ''), loi.length ? 'err' : 'ok'); G.BTG.ds = null; G.BTG.lich = null; G.btgTai(); return; }
      var b = ds[i++], lich = G.btgLichSapToi(b.thu, b.gio, b.tuan);
      var bai = {}; Object.keys(b).forEach(function (k) { if (['thu', 'gio', 'tuan'].indexOf(k) < 0) bai[k] = b[k]; });
      /* Kỳ thi ngày 28: tính ngày 28 sắp tới lúc ban hành, không gõ cứng một tháng. */
      if (bai.thoiDiem === 'NGAY28') bai.thoiDiem = G.btgNgay28();
      goi('soanBaiTT', { bai: bai }).then(function (x) {
        if (!x || !x.ok) { loi.push((x && x.error) || 'soạn hỏng'); return tiepTheo(); }
        goi('duyetBaiTT', { id: x.id, banHanh: true, lich: lich }).then(function (z) { if (z && z.ok) ok++; else loi.push(b.tieuDe.slice(0, 30) + ': ' + ((z && z.error) || '')); tiepTheo(); });
      });
    }
    tiepTheo();
  };
  G.btgNgay28 = function () {
    var d = new Date(Date.now() + 7 * 3600000), y = d.getUTCFullYear(), m = d.getUTCMonth();
    if (d.getUTCDate() > 28) { m++; if (m > 11) { m = 0; y++; } }
    return y + '-' + String(m + 1).padStart(2, '0') + '-28 08:00';
  };
  /* Ngày gần nhất (giờ VN) có thứ `thu` (0=CN…6=T7) từ hôm nay, cộng `tuan` tuần. */
  G.btgLichSapToi = function (thu, gio, tuan) {
    var bay = Date.now() + 7 * 3600000, d = new Date(bay);
    var them = ((thu - d.getUTCDay()) + 7) % 7 + 7 * (tuan || 0);
    var ngay = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + them)).toISOString().slice(0, 10);
    var t = Date.parse(ngay + 'T' + gio + ':00+07:00');
    if (t < Date.now()) t += 7 * 86400000;
    return new Date(t).toISOString();
  };

  /* ══ MÀN ══ */
  G.VIEWS['ban-tin-gita'] = function () {
    var la = (G.S && G.S.roleObj && G.S.roleObj.lv) || 99;
    if (la > 12) return U.empty('Bản tin nội bộ dành cho đội ngũ', 'Đây là kênh truyền thông của nhân sự Học viện GITA.');
    var TABS = [['tin', 'Bản tin', 'bell'], ['nen', 'Nền tảng GITA', 'sun'], ['soan', 'Soạn bài', 'edit'], ['bientap', 'Biên tập · lịch', 'calendar'], ['chiso', 'Chỉ số', 'chart']];
    var o = '<div class="tt-dau"><span class="tt-eb">Truyền thông nội bộ</span><h2>' + ic('bell') + ' Bản tin GITA</h2>' +
      '<p>Nơi mỗi thành viên đọc lại vì sao Học viện tồn tại, học chuẩn làm việc mới, và ghi nhận những người đã làm nên kết quả. ' +
      'Bài có người viết, có ban biên tập duyệt, phát hành theo lịch — và việc đọc, xác nhận, đóng góp đều tính vào KPI nghiệp vụ.</p></div>';
    o += '<div class="tt-tabs" role="tablist">' + TABS.map(function (t) {
      return '<button class="tt-tab' + (G.BTG.tab === t[0] ? ' on' : '') + '" role="tab" aria-selected="' + (G.BTG.tab === t[0]) + '" onclick="G.btgTab(\'' + t[0] + '\')">' + ic(t[2]) + ' ' + t[1] + '</button>';
    }).join('') + '</div>';
    var t = G.BTG.tab;
    o += t === 'nen' ? nganNen() : t === 'soan' ? nganSoan() : t === 'bientap' ? nganBienTap() : t === 'chiso' ? nganChiSo() : nganTin();
    return o;
  };
})();
