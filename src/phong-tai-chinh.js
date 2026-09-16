/* ═══════════════════════════════════════════════════════════════
   GITA 365 — MÀN HÌNH PHÒNG KẾ TOÁN – TÀI CHÍNH

   Một màn, chín ngăn. Máy chấm và máy chặn nằm ở may-chu/; tệp này chỉ
   vẽ và gọi.

   ══ THỨ TỰ CHÍN NGĂN LÀ MỘT QUYẾT ĐỊNH ══

     bảng tin      — người biết chuyện viết xuống, phân cấp bằng màu
     trợ lý        — hỏi một câu, nhận câu trả lời có căn cứ
     việc của tôi  — mở ra là thấy ngay hôm nay phải làm gì
     sổ ngày       — tiền vào hôm nay, từng dòng
     đối chiếu     — sổ so với ngân hàng
     chốt sổ       — tuần
     KPI           — điểm của chính mình
     lương         — ba tầng, và chỗ máy dừng lại chờ người quyết
     quy chế       — tra cứu

   Hai ngăn đầu đứng trước vì màn này mở ra mỗi sáng để trả lời câu "hôm
   nay có gì đang chờ", không phải để ngắm số tổng. Đặt bảng tổng lên
   đầu là bắt người dùng cuộn qua một màn đẹp mới thấy chỗ đang chờ.

   Bảng tin đứng TRƯỚC "việc của tôi": "việc của tôi" chỉ nói được
   những thứ máy tự đo được, còn chuyện mà chỉ người mới biết — một nhà
   hẹn trả tuần sau, một hoá đơn sắp hết hạn — thì không máy nào đo ra.

   Ngăn "quy chế" đứng CUỐI, không đứng đầu. Người ta mở quy chế khi có
   một câu hỏi cụ thể, không phải để đọc mỗi ngày.

   ══ MÀN LỌC THEO VỊ TRÍ, KHÔNG LỌC THEO VAI ══

   Kế toán thu mở ra thấy việc đầu thu; kế toán chi thấy đầu chi; kế
   toán trưởng thấy cả hai. Đó chính là điểm của việc phòng tài chính
   là một trục riêng — và nếu màn hình lọc theo vai thì cả cái trục ấy
   biến mất ngay ở chỗ người dùng nhìn thấy.

   ══ VÀ MÀN NÀY KHÔNG BAO GIỜ HIỆN HỒ SƠ KHÁCH ══

   Điều 11 của điều lệ: vị trí tài chính mở đúng những cửa TIỀN. Màn
   này hiện MÃ NHÀ, không hiện tên phụ huynh, tên học viên, số điện
   thoại — kể cả khi người đang xem có vai đọc được chúng ở màn khác.

   Lọc trên màn hình không phải bảo vệ dữ liệu; chỗ chặn thật nằm ở máy
   chủ. Nhưng màn này cũng KHÔNG XIN những trường ấy, nên chúng không
   rời máy chủ ngay từ đầu.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;
G.VIEWS = G.VIEWS || {};

(function () {
  var U = G.U, h = U.h, ic = U.ic;

  var NGAN = [
    {ma: 'tin',     ten: 'Bảng tin',      ic: 'bell'},
    {ma: 'troly',   ten: 'Trợ lý',        ic: 'spark'},
    {ma: 'viec',    ten: 'Việc của tôi',  ic: 'check'},
    {ma: 'so',      ten: 'Sổ ngày',       ic: 'chart'},
    {ma: 'doichieu',ten: 'Đối chiếu',     ic: 'shield'},
    {ma: 'chot',    ten: 'Chốt sổ',       ic: 'lock'},
    {ma: 'kpi',     ten: 'KPI',           ic: 'star'},
    {ma: 'luong',   ten: 'Lương',         ic: 'crown'},
    {ma: 'quyche',  ten: 'Quy chế',       ic: 'book'}
  ];

  /* Trạng thái của màn giữ trên G, không giữ trong biến đóng: người
     dùng đổi ngăn rồi hệ vẽ lại cả màn, và một biến đóng thì mất. */
  G.tcNgan = G.tcNgan || 'tin';
  G.tcDuLieu = G.tcDuLieu || {};

  /* Bốn màu, và mã màu lấy từ biến CSS chứ không gõ tay: hai bảng màu
     song song thì bảng thứ hai không đổi theo nền tối. Máy chủ cũng
     KHÔNG gửi mã màu xuống — nó chỉ gửi tên bậc. */
  var MAU_MUC = {do: 'var(--bad)', cam: 'var(--alert)',
                 vang: 'var(--warn)', xanh: 'var(--ok)'};

  function tien(n) {
    var v = Number(n);
    return (isNaN(v) ? 0 : v).toLocaleString('vi-VN') + 'đ';
  }

  /* Vị trí của người đang xem. Máy chủ trả về khi gọi dsQuyenTaiChinh;
     trước khi có câu trả lời thì coi như CHƯA BIẾT chứ không coi như
     không có — hai chuyện ấy khác nhau, và đoán nhầm thành "không có"
     là hiện một màn trống cho người thật ra có đủ quyền. */
  function viTriToi() {
    var q = G.tcDuLieu.viTri;
    if (!q) return null;

    /* ── SỔ QUYỀN CHỈ R01–R03 MỞ ĐƯỢC ──
       Nên với chính người của phòng — kế toán trưởng R04, kế toán thu /
       chi R08 — dsQuyenTaiChinh trả về NOPERM, và nếu chỉ đọc mỗi nó
       thì màn này bảo họ "bạn chưa có vị trí" trong khi họ đang giữ
       đúng cái vị trí ấy. Bảng tin trả kèm danh sách người của phòng và
       nó mở cho cả phòng, nên đọc bù từ đó. */
    if (q.loi && G.tcDuLieu.bangTin && G.tcDuLieu.bangTin.ok) {
      var toi = (G.tcDuLieu.bangTin.nhanSu || []).filter(function (x) {
        return x.username === ((G.S && G.S.acc && G.S.acc.u) || '');
      });
      if (toi.length) return {
        keToanThu: toi.some(function (x) { return x.viTri === 'keToanThu'; }),
        keToanChi: toi.some(function (x) { return x.viTri === 'keToanChi'; }),
        keToanTruong: toi.some(function (x) { return x.viTri === 'keToanTruong'; }),
        nhanSu: G.tcDuLieu.bangTin.nhanSu || [], mocChuKy: q.mocChuKy || []};
    }
    return q;
  }
  function coDau(dau) {
    var q = viTriToi();
    if (!q) return false;
    if (q.keToanTruong) return true;
    return dau === 'thu' ? !!q.keToanThu : !!q.keToanChi;
  }
  function laQuanLy() {
    var r = (G.S && G.S.acc && G.S.acc.role) || '';
    return r === 'R01' || r === 'R02' || r === 'R03';
  }

  /* ═══════════ THANH NGĂN ═══════════ */
  function thanhNgan() {
    return '<div class="row" style="gap:8px;flex-wrap:wrap;margin-bottom:18px">' +
      NGAN.map(function (n) {
        var on = G.tcNgan === n.ma;
        return '<button class="btn' + (on ? ' primary' : '') + '" ' +
          'onclick="G.tcMoNgan(\'' + n.ma + '\')" style="gap:7px">' +
          ic(n.ic) + h(n.ten) + '</button>';
      }).join('') + '</div>';
  }

  G.tcMoNgan = function (ma) {
    G.tcNgan = ma;
    if (typeof document !== 'undefined' && document.getElementById('main'))
      G.render && G.render();
  };

  /* ═══════════ NẠP DỮ LIỆU ═══════════

     Gọi máy chủ MỘT LẦN mỗi lượt mở màn, không gọi lại ở mỗi lượt đổi
     ngăn: sáu ngăn mà mỗi lượt bấm là một vòng mạng thì người dùng đổi
     ngăn bốn lần là bốn lần chờ.

     Và mỗi lượt gọi bọc riêng: một cửa hỏng không được làm trắng cả
     màn. Ngăn nào không có dữ liệu thì ngăn ấy nói ra, các ngăn khác
     vẫn dùng được. */
  G.tcNap = function () {
    if (!G.goiMayChu) return;
    G.tcDuLieu.dangNap = true;
    var xong = 0, can = 7;

    /* ── VẼ LẠI CHỈ KHI MÀN NÀY CÒN ĐANG MỞ ──

       Lượt gọi mạng trả về SAU khi người dùng đã đi sang màn khác là
       chuyện thường: mạng chậm, người ta không chờ. Gọi render lúc ấy
       là vẽ đè lên màn họ vừa mở.

       Và ở nơi không có DOM — bộ rà soát chạy từng màn của từng vai —
       render() chạm vào #main rồi ném, làm cả lượt rà soát đỏ vì một
       lỗi không phải của màn nào. Bộ rà soát bắt đúng chỗ này ngay lần
       chạy đầu. */
    function veLai() {
      if (!G.S || G.S.view !== 'phong-tai-chinh') return;
      if (typeof document === 'undefined' || !document.getElementById('main')) return;
      G.render && G.render();
    }

    function ghi(ten, d) {
      G.tcDuLieu[ten] = d;
      if (++xong >= can) { G.tcDuLieu.dangNap = false; veLai(); }
    }
    var nay = new Date(Date.now() + 7 * 3600e3).toISOString().slice(0, 10);

    G.goiMayChu('dsQuyenTaiChinh', {}).then(function (d) {
      var toi = (d.dangLamViec || []).filter(function (x) {
        return x.username === ((G.S && G.S.acc && G.S.acc.u) || '');
      });
      ghi('viTri', {
        keToanThu: toi.some(function (x) { return x.viTri === 'keToanThu'; }),
        keToanChi: toi.some(function (x) { return x.viTri === 'keToanChi'; }),
        keToanTruong: toi.some(function (x) { return x.viTri === 'keToanTruong'; }),
        nhanSu: d.dangLamViec || [], mocChuKy: d.mocChuKy || [], loi: d.error
      });
    });
    G.goiMayChu('soNgay', {ngay: nay}).then(function (d) { ghi('soNgay', d); });
    G.goiMayChu('doiChieuNganHang', {loai: 'thang'}).then(function (d) { ghi('doiChieu', d); });
    G.goiMayChu('dsChot', {soKy: 8}).then(function (d) { ghi('chot', d); });
    G.goiMayChu('chamKpiTaiChinh', {loai: 'thang'}).then(function (d) { ghi('kpi', d); });
    G.goiMayChu('bangTinTaiChinh', {}).then(function (d) { ghi('bangTin', d); });
    G.goiMayChu('bangLuong', {ky: G.tcLuongKy || kyMacDinh()})
      .then(function (d) { ghi('luong', d); });
  };

  /* Nạp lại RIÊNG bảng tin sau khi đăng hoặc đóng một tin. Nạp lại cả
     màn là năm vòng mạng nữa cho một thay đổi ở một chỗ. */
  function napLaiTin() {
    if (!G.goiMayChu) return;
    G.goiMayChu('bangTinTaiChinh', {}).then(function (d) {
      G.tcDuLieu.bangTin = d;
      if (!G.S || G.S.view !== 'phong-tai-chinh') return;
      if (typeof document === 'undefined' || !document.getElementById('main')) return;
      G.render && G.render();
    });
  }

  function loi(d, ten) {
    if (!d) return U.empty('Đang nạp ' + ten, 'Chờ máy chủ trả lời.', true);
    if (!d.ok) return U.empty('Chưa mở được ' + ten,
      d.error || 'Máy chủ không trả lời.', true);
    return null;
  }

  /* ═══════════ NGĂN 1 · BẢNG TIN ═══════════

     Chốt 9.99.3. Kế toán trưởng chủ động ghi lên hệ, và tin phân cấp
     bằng MÀU để biết xử lý cái nào trước.

     MÀN NÀY KHÔNG TỰ XẾP LẠI. Máy chủ đã xếp theo màu rồi mới tới thời
     gian, và nó cũng đã tính QUÁ HẠN bằng giờ của nó. Xếp lại ở đây là
     dựng bản thứ hai của cùng một luật, và bản thứ hai sẽ có ngày dùng
     giờ của máy khách — máy khách thì người dùng chỉnh được. */
  function nganTin() {
    var d = G.tcDuLieu.bangTin, e = loi(d, 'bảng tin'); if (e) return e;
    var o = '';

    /* ── TỶ LỆ TIN ĐỎ ──
       Lớp chặn thứ ba của cả hệ phân cấp màu, và là lớp duy nhất nói
       chuyện với chính người đang đặt màu. Chỉ hiện khi đã đủ tin để
       một tỷ lệ có nghĩa — ba tin mà hai đỏ thì "67%" chẳng nói gì. */
    if (d.canhBaoDoNhieu)
      o += '<div class="card" style="border-left:3px solid var(--bad)">' +
        '<b>' + h(String(d.tyLeDo)) + '% số tin đang mở là mức GẤP</b>' +
        '<p class="sm muted mt">Quá nửa bảng là đỏ thì màu thôi mang nghĩa gì: ' +
        'mở ra ai cũng đọc từ trên xuống như một danh sách thường. Xem lại những ' +
        'tin đỏ đã xử lý xong mà chưa đóng, và cân nhắc hạ mức những tin còn chờ ' +
        'được tới tuần sau.</p></div>';

    var dem = d.dem || {}, md = d.mucDo || {};
    o += '<div class="row" style="gap:8px;flex-wrap:wrap;margin:' +
      (d.canhBaoDoNhieu ? '14px' : '0') + ' 0 4px">' +
      ['do', 'cam', 'vang', 'xanh'].map(function (m) {
        return U.chip((md[m] ? md[m].ten : m) + ': ' + (dem[m] || 0),
          MAU_MUC[m], !!dem[m]);
      }).join('') +
      (d.soQuaHan ? U.chip('Quá hạn: ' + d.soQuaHan, 'var(--bad)', true) : '') +
      (d.cuaToi ? U.chip('Giao cho tôi: ' + d.cuaToi, 'var(--teal)', true) : '') +
      '</div>';

    o += '<div class="row" style="gap:8px;flex-wrap:wrap;margin:12px 0 4px">' +
      '<button class="btn primary" onclick="G.tcMoDangTin()" style="gap:7px">' +
      ic('plus') + 'Đăng một tin</button>' +
      '<button class="btn" onclick="G.tcXemHetTin(' + (G.tcHetTin ? 'false' : 'true') +
      ')">' + (G.tcHetTin ? 'Chỉ xem tin còn việc' : 'Xem cả tin đã đóng') + '</button>' +
      '</div>';

    var ds = d.tin || [];
    if (!ds.length)
      return o + U.empty('Bảng tin đang sạch',
        'Không có tin nào đang chờ. Thấy chuyện gì đáng nói thì bấm "Đăng một tin" — ' +
        'ghi lại một lần đỡ cho người sau phải đi hỏi lại.', true);

    o += U.sec('Tin đang mở',
      d.vi || 'Xếp theo màu trước rồi mới theo thời gian.');

    o += ds.map(function (t) {
      var mau = MAU_MUC[t.mucDo] || 'var(--ink-3)';
      var dong = t.trangThai === 'daXuLy' || t.trangThai === 'boQua';
      return '<div class="card" style="border-left:3px solid ' + mau +
        (dong ? ';opacity:.62' : '') + ';margin-bottom:10px">' +
        '<div class="row" style="gap:8px;flex-wrap:wrap;align-items:center">' +
          U.chip(t.tenMuc, mau, true) +
          (t.quaHan ? U.chip('quá hạn', 'var(--bad)', true) : '') +
          (t.tuMay ? U.chip('máy ghi', 'var(--ink-3)') : '') +
          (t.trangThai === 'dangXuLy' ? U.chip('đang xử lý', 'var(--teal)', true) : '') +
          (t.trangThai === 'daXuLy' ? U.chip('đã xử lý', 'var(--ok)') : '') +
          (t.trangThai === 'boQua' ? U.chip('bỏ qua', 'var(--ink-3)') : '') +
        '</div>' +
        '<b style="display:block;margin-top:8px;font-size:15px">' + h(t.tieuDe) + '</b>' +
        '<p class="sm mt" style="white-space:pre-wrap">' + h(t.than) + '</p>' +
        (t.viSaoGap ? '<p class="sm mt" style="color:' + mau + '"><b>Vì sao gấp:</b> ' +
          h(t.viSaoGap) + '</p>' : '') +
        '<p class="tiny muted mt">' +
          h((t.tuMay ? 'Máy ghi' : t.nguoiDang) + ' · ' + String(t.luc).slice(0, 16).replace('T', ' ')) +
          (t.giaoCho ? h(' · giao cho ' + t.giaoCho) : '') +
          (t.hanXuLy ? h(' · hạn ' + String(t.hanXuLy).slice(0, 10)) : '') +
          (t.doiTuong ? h(' · chứng từ ' + t.doiTuong) : '') +
        '</p>' +
        (t.cachXuLy ? '<p class="sm mt"><b>Đã làm:</b> ' + h(t.cachXuLy) +
          h(t.nguoiXuLy ? ' (' + t.nguoiXuLy + ')' : '') + '</p>' : '') +
        (dong ? '' :
          '<div class="row" style="gap:8px;flex-wrap:wrap;margin-top:10px">' +
          (t.trangThai === 'moi'
            ? '<button class="btn" onclick="G.tcNhanTin(\'' + h(t.id) + '\')">Tôi nhận</button>'
            : '') +
          '<button class="btn primary" onclick="G.tcMoDongTin(\'' + h(t.id) +
            '\',\'daXuLy\')">Đã xử lý xong</button>' +
          '<button class="btn" onclick="G.tcMoDongTin(\'' + h(t.id) +
            '\',\'boQua\')">Bỏ qua</button>' +
          '</div>') +
        '</div>';
    }).join('');
    return o;
  }

  G.tcXemHetTin = function (bat) {
    G.tcHetTin = !!bat;
    if (!G.goiMayChu) return;
    G.goiMayChu('bangTinTaiChinh', {tatCa: !!bat}).then(function (d) {
      G.tcDuLieu.bangTin = d;
      if (typeof document !== 'undefined' && document.getElementById('main'))
        G.render && G.render();
    });
  };

  /* ── HỘP ĐĂNG TIN ──
     Ô "vì sao gấp" hiện SẴN chứ không hiện ra sau khi chọn đỏ: người ta
     đọc điều kiện trước khi chọn thì họ chọn có cân nhắc, còn ô nhảy ra
     sau khi chọn thì nó là một cái cửa chắn, và người ta gõ bừa cho qua. */
  G.tcMoDangTin = function () {
    /* Danh sách người nhận lấy từ CHÍNH bảng tin, không lấy từ sổ quyền:
       sổ quyền chỉ R01–R03 mở được, mà người giao việc nhiều nhất trên
       bảng này là kế toán trưởng (R04). */
    var bt = G.tcDuLieu.bangTin || {};
    var ns = (bt.nhanSu || []).map(function (x) {
      return '<option value="' + h(x.username) + '">' + h(x.username) +
        ' — ' + h(x.tenViTri || x.viTri || '') + '</option>';
    }).join('');
    U.modal(
      '<h3>Đăng một tin lên bảng tài chính</h3>' +
      '<p class="sm muted mt">Mức GẤP và CẦN XEM phải có người nhận và hạn xử lý: ' +
      'một tin có màu mà không có chủ thì ai đọc cũng nghĩ người khác lo.</p>' +
      '<div class="mt2"><label class="sm"><b>Mức độ</b></label>' +
      '<select id="tcTinMuc" class="inp">' +
        '<option value="xanh">Tin thường — ghi lại để người sau biết</option>' +
        '<option value="vang">Theo dõi — cần một cặp mắt, không gấp</option>' +
        '<option value="cam">Cần xem — chưa mất tiền nhưng sẽ mất nếu để lâu</option>' +
        '<option value="do">Gấp — tiền đang chảy sai, xử lý trong ngày</option>' +
      '</select></div>' +
      '<div class="mt"><label class="sm"><b>Tiêu đề</b></label>' +
      '<input id="tcTinTieuDe" class="inp" maxlength="200" placeholder="Một câu nói rõ chuyện gì"></div>' +
      '<div class="mt"><label class="sm"><b>Nội dung</b></label>' +
      '<textarea id="tcTinThan" class="inp" rows="4" maxlength="2000" ' +
      'placeholder="Chuyện gì, ở chứng từ nào, cần ai làm gì"></textarea></div>' +
      '<div class="mt"><label class="sm"><b>Vì sao gấp</b> ' +
      '<span class="muted">(bắt buộc khi chọn mức Gấp)</span></label>' +
      '<input id="tcTinViSao" class="inp" maxlength="500" ' +
      'placeholder="Một câu, và câu ấy ở lại cho người sau đọc"></div>' +
      '<div class="mt"><label class="sm"><b>Giao cho</b></label>' +
      '<select id="tcTinGiao" class="inp"><option value="">— chưa giao —</option>' + ns +
      '</select></div>' +
      '<div class="mt"><label class="sm"><b>Hạn xử lý</b></label>' +
      '<input id="tcTinHan" class="inp" type="date"></div>' +
      '<div class="mt"><label class="sm"><b>Chứng từ liên quan</b> ' +
      '<span class="muted">(không bắt buộc)</span></label>' +
      '<input id="tcTinDoiTuong" class="inp" maxlength="60" placeholder="PT-… · CP-… · NH-…"></div>' +
      '<div class="row mt2" style="gap:8px">' +
      '<button class="btn primary" onclick="G.tcGuiTin()">Đăng tin</button>' +
      '<button class="btn" onclick="U.closeModal()">Thôi</button></div>');
  };

  function oGiaTri(id) {
    var el = document.getElementById(id);
    return el ? String(el.value || '').trim() : '';
  }

  G.tcGuiTin = function () {
    var han = oGiaTri('tcTinHan');
    var tin = {
      mucDo: oGiaTri('tcTinMuc'),
      tieuDe: oGiaTri('tcTinTieuDe'),
      than: oGiaTri('tcTinThan'),
      viSaoGap: oGiaTri('tcTinViSao'),
      giaoCho: oGiaTri('tcTinGiao'),
      /* Hạn nhập theo NGÀY nhưng gửi đi là CUỐI ngày ấy: gửi đầu ngày
         thì một tin hạn hôm nay đã quá hạn ngay lúc đăng. */
      hanXuLy: han ? han + 'T23:59:59.000Z' : '',
      doiTuong: oGiaTri('tcTinDoiTuong')
    };
    G.goiMayChu('dangTinTaiChinh', {tin: tin}).then(function (d) {
      if (!d.ok) return U.toast(d.error || 'Chưa đăng được tin.', 'err');
      U.closeModal();
      U.toast('Đã đăng tin mức ' + (d.tenMuc || ''));
      napLaiTin();
    });
  };

  G.tcNhanTin = function (id) {
    G.goiMayChu('xuLyTinTaiChinh', {id: id, trangThai: 'dangXuLy'}).then(function (d) {
      if (!d.ok) return U.toast(d.error || 'Chưa nhận được tin này.', 'err');
      U.toast('Đã nhận · tin này giờ đứng tên bạn');
      napLaiTin();
    });
  };

  G.tcMoDongTin = function (id, den) {
    U.modal('<h3>' + (den === 'boQua' ? 'Bỏ qua tin này' : 'Đóng tin này') + '</h3>' +
      '<p class="sm muted mt">' + h(den === 'boQua'
        ? 'Bỏ qua cũng là một quyết định. Ghi vì sao bỏ qua, để ba tháng sau còn ' +
          'bảo vệ được quyết định ấy.'
        : 'Nói ĐÃ LÀM GÌ. Không có câu ấy thì lần sau cùng chuyện lặp lại và không ' +
          'ai biết lần trước đã xử lý thế nào.') + '</p>' +
      '<div class="mt2"><textarea id="tcTinCach" class="inp" rows="3" maxlength="1000" ' +
      'placeholder="Đã làm gì, hoặc vì sao bỏ qua"></textarea></div>' +
      '<div class="row mt2" style="gap:8px">' +
      '<button class="btn primary" onclick="G.tcGuiDongTin(\'' + h(id) + '\',\'' +
        h(den) + '\')">Xác nhận</button>' +
      '<button class="btn" onclick="U.closeModal()">Thôi</button></div>');
  };

  G.tcGuiDongTin = function (id, den) {
    G.goiMayChu('xuLyTinTaiChinh',
      {id: id, trangThai: den, cachXuLy: oGiaTri('tcTinCach')}).then(function (d) {
      if (!d.ok) return U.toast(d.error || 'Chưa đóng được tin.', 'err');
      U.closeModal();
      U.toast(den === 'boQua' ? 'Đã bỏ qua' : 'Đã đóng tin');
      napLaiTin();
    });
  };

  /* ═══════════ NGĂN 2 · TRỢ LÝ ═══════════

     Trợ lý này KHÔNG gọi ra một mô hình ngôn ngữ nào — không một dòng
     sổ tiền nào rời khỏi máy chủ của Học viện. Nó là một bộ luật biết
     nói: đọc đúng những hằng số mà cổng duyệt đọc, chạy đúng những
     phép mà cổng duyệt chạy, rồi kể lại bằng tiếng Việt.

     MÀN NÀY NÓI THẲNG ĐIỀU ẤY RA, ngay dưới hộp hỏi. Một trợ lý được
     người dùng tưởng là thông minh sẽ được tin ở cả những câu nó không
     có căn cứ — và ở một màn hình về tiền thì cái tin nhầm ấy đắt.

     Năm câu hỏi bày sẵn thành NÚT, không phải một ô gõ tự do. Ô gõ tự
     do hứa rằng hỏi gì cũng được, rồi trả lời "tôi chưa hiểu" cho tám
     câu trên mười — và người dùng bỏ sau ba lần. Năm cái nút thì hứa
     đúng những gì nó làm được. */
  function nganTroLy() {
    var t = G.tcTroLy || (G.tcTroLy = {});
    var o = '';

    o += '<div class="card"><b>Trợ lý đọc SỔ THẬT, không đọc bản mẫu</b>' +
      '<p class="sm muted mt">Nó không gọi ra trí tuệ nhân tạo nào bên ngoài — ' +
      'không một dòng nào của sổ tiền rời khỏi máy chủ Học viện. Nó đọc đúng ' +
      'những luật mà cổng duyệt đọc rồi kể lại, nên câu nó nói và câu cổng nói ' +
      'luôn khớp nhau. Mọi câu trả lời đều kèm CĂN CỨ để bạn tra lại.</p></div>';

    o += '<div class="row" style="gap:8px;flex-wrap:wrap;margin:14px 0 4px">' +
      [['viecCuaToi', 'Việc gì đang chờ tôi'],
       ['chuKyCuaToi', 'Tuần này tôi đã chi bao nhiêu'],
       ['aiKyDuoc', 'Mốc này ai ký được'],
       ['thangBac', 'Thang nấc và mốc đặt ở đâu']].map(function (c) {
        var on = t.hoi === c[0];
        return '<button class="btn' + (on ? ' primary' : '') + '" ' +
          'onclick="G.tcHoiTroLy(\'' + c[0] + '\')">' + h(c[1]) + '</button>';
      }).join('') + '</div>';

    if (t.dangHoi)
      return o + U.empty('Đang hỏi trợ lý', 'Nó đang đọc sổ.', true);
    if (!t.dap)
      return o + U.empty('Chọn một câu để hỏi',
        'Bốn câu ở trên, cộng câu "khoản chi này cần gì" — câu ấy hỏi bằng cách ' +
        'bấm vào một khoản trong danh sách việc.', true);

    var d = t.dap;
    if (!d.ok)
      return o + U.empty('Trợ lý chưa trả lời được câu này',
        d.error || 'Máy chủ không trả lời.', true);

    o += U.sec('Trả lời');
    o += '<div class="card">' +
      (d.tra || []).map(function (c) {
        return '<p class="mt" style="margin-top:0">' + h(c) + '</p>';
      }).join('') + '</div>';

    /* ── CHẶN Ở MỐC THÌ CHỈ NGƯỜI ── */
    if (d.aiKyDuoc) {
      var ai = (d.aiKyDuoc.theoVai || []).concat(d.aiKyDuoc.theoViTri || []);
      o += U.sec('Ai ký được',
        'Hai đường vào, và chúng dẫn tới hai việc khác nhau: đi tìm đúng người có ' +
        'vai, hay xin cấp hạn mức cho kế toán trưởng.');
      o += ai.length
        ? U.tbl(['Người', 'Ký được vì'], ai.map(function (x) {
            return [h(x.username), '<span class="sm muted">' + h(x.vi) + '</span>'];
          }))
        : '<div class="card" style="border-left:3px solid var(--bad)">' +
          '<b>Hôm nay không ai ký được mốc này</b>' +
          '<p class="sm muted mt">Tiền đứng lại vì thiếu người, không vì thiếu luật. ' +
          'Cần một người vai ' + h(d.aiKyDuoc.vaiCan || '') + ', hoặc Super Admin cấp ' +
          'hạn mức cho kế toán trưởng.</p></div>';
    }

    /* ── VÀ NÓI RÕ NÓ KHÔNG CHỈ ĐƯỜNG LÁCH ── */
    if (d.khongGoiY) {
      o += '<div class="card" style="border-left:3px solid var(--warn);margin-top:14px">' +
        '<b>' + h(d.khongGoiY.vi) + '</b><ul class="sm mt">' +
        d.khongGoiY.duong.map(function (x) { return '<li>' + h(x) + '</li>'; }).join('') +
        '</ul><p class="sm mt"><b>' + h(d.khongGoiY.nen) + '</b></p></div>';
    }

    /* ── DANH SÁCH VIỆC: BẤM MỘT KHOẢN LÀ HỎI CÂU THỨ NĂM ── */
    if (d.hoi === 'viecCuaToi' && (d.viec || []).some(function (x) { return x.loai === 'chi'; })) {
      o += U.sec('Khoản chi đang chờ',
        'Bấm một khoản để hỏi trợ lý khoản ấy cần gì và bạn ký được không.');
      o += U.tbl(['Số tiền', 'Diễn giải', 'Nấc · mốc', 'Treo', 'Của ai'],
        d.viec.filter(function (x) { return x.loai === 'chi'; }).map(function (x) {
          return ['<b>' + h(tien(x.soTien)) + '</b>', h(x.dienGiai),
            h(x.nac + ' · ' + x.moc),
            h(x.soNgayTreo + ' ngày'),
            x.kyDuoc
              ? '<button class="btn primary" onclick="G.tcHoiKhoan(\'' + h(x.id) +
                '\')">Bạn ký được</button>'
              : '<button class="btn" onclick="G.tcHoiKhoan(\'' + h(x.id) +
                '\')">' + h(x.cuaAiKhac ? 'Chờ người khác' : 'Xem vì sao') + '</button>'];
        }));
    }

    if ((d.canCu || []).length) {
      o += U.sec('Căn cứ',
        'Một con số không có căn cứ thì người đọc không cãi lại được, và không cãi ' +
        'lại được thì không kiểm được.');
      o += '<div class="row" style="gap:8px;flex-wrap:wrap">' +
        d.canCu.map(function (c) {
          return U.chip(c.ma + ' — ' + c.ten, 'var(--teal)');
        }).join('') + '</div>';
    }
    return o;
  }

  G.tcHoiTroLy = function (hoi, them) {
    var t = G.tcTroLy || (G.tcTroLy = {});
    t.hoi = hoi; t.dangHoi = true; t.dap = null;
    if (typeof document !== 'undefined' && document.getElementById('main'))
      G.render && G.render();
    var than = {hoi: hoi};
    if (them) for (var k in them) than[k] = them[k];
    G.goiMayChu('hoiTroLyTaiChinh', than).then(function (d) {
      t.dangHoi = false; t.dap = d;
      if (typeof document !== 'undefined' && document.getElementById('main'))
        G.render && G.render();
    });
  };
  G.tcHoiKhoan = function (id) { G.tcHoiTroLy('khoanChi', {id: id}); };

  /* ═══════════ NGĂN 3 · VIỆC CỦA TÔI ═══════════ */
  function nganViec() {
    var q = viTriToi();
    if (!q) return U.empty('Đang hỏi vị trí của bạn trong phòng',
      'Màn này lọc việc theo VỊ TRÍ trong phòng tài chính, không theo vai.', true);

    if (!q.keToanThu && !q.keToanChi && !q.keToanTruong && !laQuanLy())
      return U.empty('Bạn chưa có vị trí trong Phòng Kế toán – Tài chính',
        'Vị trí do Super Admin cấp, hoặc do Giám đốc / Admin hệ thống cấp khi đã ' +
        'được Super Admin trao quyền quản lý phòng.', true);

    var o = '';
    var dc = G.tcDuLieu.doiChieu, so = G.tcDuLieu.soNgay;

    /* Bốn ô việc. Ô nào KHÔNG thuộc đầu tiền của người đang xem thì
       không vẽ — không vẽ mờ đi, vì một ô mờ vẫn là một ô người ta cứ
       thử bấm. */
    var o4 = [];
    if (coDau('thu') || laQuanLy()) {
      if (so && so.ok && so.soChoDuyet)
        o4.push({n: so.soChoDuyet, t: 'phiếu thu chờ duyệt', c: 'var(--gold)',
          v: tien(so.choDuyet)});
      if (dc && dc.ok && dc.tienVaoKhongCoPhieu.so)
        o4.push({n: dc.tienVaoKhongCoPhieu.so, t: 'tiền vào chưa có phiếu',
          c: 'var(--rose)', v: tien(dc.tienVaoKhongCoPhieu.tien),
          y: 'Nhà đã trả mà sổ ghi còn nợ — chỗ mất lòng khách.'});
      if (dc && dc.ok && dc.phieuKhongCoTienVao.so)
        o4.push({n: dc.phieuKhongCoTienVao.so, t: 'phiếu chưa thấy tiền vào',
          c: 'var(--rose)', v: tien(dc.phieuKhongCoTienVao.tien),
          y: 'Sổ nói đã thu mà tài khoản không thấy — chỗ mất tiền.'});
    }
    if (coDau('chi') || laQuanLy()) {
      var k = G.tcDuLieu.kpi;
      if (k && k.ok && k.keToanChi && k.keToanChi['KT-C2'])
        o4.push({n: k.keToanChi['KT-C2'], t: 'khoản chi treo quá 3 ngày',
          c: 'var(--gold)',
          y: 'Từ chối thì nói từ chối; để treo là không quyết mà cũng không nói.'});
    }

    if (!o4.length)
      o += '<div class="card center" style="padding:30px">' +
        '<b style="font-size:16px">Không có việc nào đang chờ bạn</b>' +
        '<p class="sm muted mt">Sổ của đầu tiền bạn phụ trách đang sạch.</p></div>';
    else
      o += '<div class="grid-3" style="gap:14px">' + o4.map(function (x) {
        return '<div class="card" style="border-left:3px solid ' + x.c + '">' +
          '<div style="font-size:26px;font-weight:700;color:' + x.c + '">' + h(String(x.n)) + '</div>' +
          '<div style="font-weight:600;margin-top:2px">' + h(x.t) + '</div>' +
          (x.v ? '<div class="sm muted">' + h(x.v) + '</div>' : '') +
          (x.y ? '<p class="sm muted mt">' + h(x.y) + '</p>' : '') +
          '</div>';
      }).join('') + '</div>';

    /* Vị trí của tôi và mốc chu kỳ tôi ký được tới đâu. */
    o += U.sec('Vị trí của bạn trong phòng');
    var ten = [];
    if (q.keToanThu) ten.push('Kế toán thu');
    if (q.keToanChi) ten.push('Kế toán chi');
    if (q.keToanTruong) ten.push('Kế toán trưởng');
    if (!ten.length && laQuanLy()) ten.push('Quản lý (theo vai ' +
      ((G.S && G.S.acc && G.S.acc.role) || '') + ')');
    o += '<div class="card"><div class="row" style="gap:8px;flex-wrap:wrap">' +
      ten.map(function (t) { return U.chip(t, 'var(--teal)', true); }).join('') +
      '</div><p class="sm muted mt">' +
      h(q.keToanTruong
        ? 'Kế toán trưởng giữ cả hai đầu tiền. Mốc chu kỳ ký được tới đâu do người ' +
          'quản lý phòng cấp.'
        : q.keToanThu
          ? 'Đầu THU: duyệt phiếu thu, công nợ, nhắc thu, đối chiếu sao kê. Không ' +
            'duyệt được khoản chi nào.'
          : q.keToanChi
            ? 'Đầu CHI: duyệt khoản chi, sổ chi, chốt két. Không duyệt được phiếu ' +
              'thu nào.'
            : 'Bạn xem được toàn phòng theo vai quản lý.') + '</p></div>';
    return o;
  }

  /* ═══════════ NGĂN 4 · SỔ NGÀY ═══════════ */
  function nganSo() {
    var d = G.tcDuLieu.soNgay, e = loi(d, 'sổ ngày'); if (e) return e;
    var o = '<div class="grid-3" style="gap:14px">' +
      U.stat({t: 'Đã thu hôm nay', v: tien(d.daThu), s: d.soPhieu + ' phiếu'}) +
      U.stat({t: 'Chờ duyệt', v: tien(d.choDuyet), s: d.soChoDuyet + ' phiếu'}) +
      U.stat({t: 'Thuộc tuần', v: h(d.thuocTuan || '')}) + '</div>';

    var ht = d.theoHinhThuc || {};
    if (Object.keys(ht).length) {
      o += U.sec('Theo hình thức',
        'Tiền mặt phải đếm được ở két; chuyển khoản phải khớp sao kê. Gộp chung ' +
        'một số là bỏ mất phép đối chiếu duy nhất mà người thủ quỹ có.');
      o += U.tbl(['Hình thức', 'Số tiền'], Object.keys(ht).map(function (k) {
        return [h(k), '<b>' + h(tien(ht[k])) + '</b>'];
      }));
    }

    /* Bảng phiếu: MÃ NHÀ, không tên người — điều 11. */
    if ((d.phieu || []).length) {
      o += U.sec('Từng phiếu trong ngày',
        'Màn này hiện MÃ NHÀ, không hiện tên phụ huynh hay số điện thoại: vị trí ' +
        'tài chính mở đúng những cửa tiền.');
      o += U.tbl(['Nhà', 'Số tiền', 'Hình thức', 'Mã giao dịch', 'Trạng thái'],
        d.phieu.slice(0, 60).map(function (p) {
          return [h(p.maKhachHang || ''), '<b>' + h(tien(p.soTien)) + '</b>',
            h(p.hinhThuc || ''), h(p.maThamChieu || '—'),
            U.chip(p.trangThai === 'daDuyet' ? 'đã duyệt' :
              p.trangThai === 'huy' ? 'đã huỷ' : 'chờ duyệt',
              p.trangThai === 'daDuyet' ? 'var(--teal)' : 'var(--gold)', true)];
        }));
    }
    return o;
  }

  /* ═══════════ NGĂN 5 · ĐỐI CHIẾU ═══════════ */
  function nganDoiChieu() {
    var d = G.tcDuLieu.doiChieu, e = loi(d, 'bản đối chiếu'); if (e) return e;
    var o = '<div class="card"><p class="sm">' + h(d.vi || '') + '</p></div>';

    o += '<div class="grid-3" style="gap:14px;margin-top:14px">' +
      U.stat({t: 'Tiền vào trong kỳ', v: tien(d.tongTienVao.tien),
        s: d.tongTienVao.so + ' dòng · ' + d.tongTienVao.daKhop + ' đã khớp'}) +
      U.stat({t: 'Chưa có phiếu', v: tien(d.tienVaoKhongCoPhieu.tien),
        s: d.tienVaoKhongCoPhieu.so + ' dòng'}) +
      U.stat({t: 'Chưa thấy tiền vào', v: tien(d.phieuKhongCoTienVao.tien),
        s: d.phieuKhongCoTienVao.so + ' phiếu'}) + '</div>';

    /* HAI PHÍA NÊU RIÊNG, và mỗi phía kèm câu nói nó là chỗ mất gì. */
    [['tienVaoKhongCoPhieu', 'Tiền vào ngân hàng mà không có phiếu',
      ['Mã giao dịch', 'Số tiền', 'Nội dung', 'Lúc'],
      function (x) { return [h(x.maGiaoDich), '<b>' + h(tien(x.soTien)) + '</b>',
        h(x.noiDung || '—'), h(String(x.luc).slice(0, 10))]; }],
     ['phieuKhongCoTienVao', 'Phiếu mà không có tiền vào ngân hàng',
      ['Nhà', 'Số tiền', 'Mã tham chiếu', 'Ghi lúc'],
      function (x) { return [h(x.maKhachHang), '<b>' + h(tien(x.soTien)) + '</b>',
        h(x.maThamChieu || '— thiếu mã'), h(String(x.ghiLuc).slice(0, 10))]; }]
    ].forEach(function (p) {
      var k = d[p[0]];
      o += U.sec(p[1], k.vi);
      if (!k.ds.length)
        o += '<div class="card center" style="padding:22px"><b>Không có dòng nào</b></div>';
      else o += U.tbl(p[2], k.ds.slice(0, 60).map(p[3]));
    });
    return o;
  }

  /* ═══════════ NGĂN 6 · CHỐT SỔ ═══════════ */
  function nganChot() {
    var d = G.tcDuLieu.chot, e = loi(d, 'sổ chốt'); if (e) return e;
    if (!(d.ds || []).length)
      return U.empty('Chưa chốt tuần nào',
        'Tuần chốt được từ ngày đầu tiên sau khi tuần ấy hết hẳn.', true);
    return U.sec('Tám tuần gần nhất',
      'Vân tay là dấu của TẬP DÒNG đã đếm, không phải của con số tổng: huỷ một ' +
      'phiếu rồi ghi thêm một phiếu khác cùng số tiền thì tổng không đổi nhưng ' +
      'vân tay đổi.') +
      U.tbl(['Tuần', 'Thu', 'Ghi nhận', 'Công nợ cuối kỳ', 'Vân tay', 'Chốt bởi'],
        d.ds.map(function (c) {
          return [h(c.ky) + (c.daMoLai ? ' ' + U.chip('đã mở lại', 'var(--rose)', true) : ''),
            '<b>' + h(tien(c.thu)) + '</b>', h(tien(c.ghiNhan)),
            h(tien(c.conNoCuoiKy)),
            '<code class="sm">' + h(String(c.chotLuc).slice(0, 10)) + '</code>',
            h(c.boiAi || '')];
        }));
  }

  /* ═══════════ NGĂN 7 · KPI ═══════════ */
  function nganKpi() {
    var d = G.tcDuLieu.kpi, e = loi(d, 'bảng KPI'); if (e) return e;
    var dn = G.TC_KPI;
    if (!dn) return U.lockCard('Định nghĩa KPI nằm trong kho nghề. Mở kho để xem ' +
      'ngưỡng đạt và trọng số của từng thước.');

    var o = '<div class="card"><p class="sm">' + h(dn.nhip + ' ' + dn.vi_nhip) + '</p></div>';

    [['keToanThu', dn.keToanThu], ['keToanChi', dn.keToanChi],
     ['keToanTruong', dn.keToanTruong]].forEach(function (pr) {
      var so = d[pr[0]] || {}, dinh = pr[1] || {};
      o += U.sec(dinh.ten || pr[0], dinh.vi || '');
      o += U.tbl(['Thước', 'Đo được', 'Đạt', 'Trọng số', 'Lách bằng cách nào'],
        (dinh.thuoc || []).map(function (t) {
          var v = so[t.ma];
          /* null là CHƯA ĐO ĐƯỢC, không phải 0. Vẽ nó khác hẳn: một ô
             trống mà hiện số 0 là nói sai, và người đọc bảng lương
             không có cách nào biết. */
          var chuaDo = (v === null || v === undefined);
          var dat = chuaDo ? null
            : (t.huongTot === 'thap' ? Number(v) <= Number(t.dat) : Number(v) >= Number(t.dat));
          return [
            '<b>' + h(t.ma) + '</b><div class="sm muted">' + h(t.ten) + '</div>',
            chuaDo
              ? '<span class="sm muted">chưa có gì để đo</span>'
              : '<b style="color:' + (dat ? 'var(--teal)' : 'var(--rose)') + '">' +
                h(String(v)) + h(t.don === '%' ? '%' : ' ' + (t.don || '')) + '</b>',
            h((t.huongTot === 'thap' ? '≤ ' : '≥ ') + t.dat +
              (t.don === '%' ? '%' : ' ' + (t.don || ''))),
            h(String(t.trong)),
            '<span class="sm muted">' + h(t.lach || '') + '</span>'
          ];
        }));
    });

    if (d.lechConLai) {
      o += U.sec('Chỗ lệch còn lại',
        'Một điểm KPI không kèm chỗ lệch là một điểm không sửa được gì.');
      var l = d.lechConLai;
      if (!(l.doiSoat || []).length && !(l.kyDaChotBiDong || []).length)
        o += '<div class="card center" style="padding:22px"><b>Sổ sạch</b></div>';
      else {
        if ((l.doiSoat || []).length)
          o += U.tbl(['Mã', 'Việc', 'Số chỗ'], l.doiSoat.map(function (x) {
            return [h(x.ma), h(x.viec), h(String(x.so))]; }));
        if ((l.kyDaChotBiDong || []).length)
          o += U.tbl(['Kỳ đã chốt bị động', 'Chênh', 'Đã giải thích'],
            l.kyDaChotBiDong.map(function (x) {
              return [h(x.ky), h(tien(x.chenh)),
                x.daGiaiThich ? U.chip('rồi', 'var(--teal)', true)
                              : U.chip('chưa', 'var(--rose)', true)]; }));
      }
    }
    return o;
  }

  /* ═══════════ NGĂN 8 · LƯƠNG ═══════════

     Ba tầng: lương cứng, phần theo KPI, và ghi nhận của người quản lý.

     MÀN NÀY PHẢI HIỆN RÕ CHỖ MÁY DỪNG LẠI. TC_LUONG tự khai hai chỗ
     máy không quyết được — L-01 số tiền từng tầng, L-02 điểm dưới 60
     xử lý thế nào. Chưa ai đặt hệ số thì màn KHÔNG in ra số 0: số 0
     đọc ra thành "người này không được trả gì", còn ô trống kèm một
     câu thì đọc ra thành "chưa ai đặt con số". Hai câu ấy dẫn tới hai
     việc khác hẳn nhau.

     VÀ MỘT NGƯỜI LUÔN XEM ĐƯỢC DÒNG CỦA CHÍNH MÌNH, kèm từng thước đã
     chấm. Không cho người ta xem bảng lương của chính họ là buộc họ
     tin một con số không tra lại được. */
  function nganLuong() {
    var d = G.tcDuLieu.luong, e = loi(d, 'bảng lương'); if (e) return e;
    var o = '';

    o += '<div class="row" style="gap:8px;flex-wrap:wrap;margin-bottom:14px">' +
      thangGanDay().map(function (k) {
        var on = (G.tcLuongKy || kyMacDinh()) === k;
        return '<button class="btn' + (on ? ' primary' : '') + '" ' +
          'onclick="G.tcDoiKyLuong(\'' + k + '\')">' + h(k) + '</button>';
      }).join('') + '</div>';

    /* ── CHỖ MÁY DỪNG LẠI, IN TRƯỚC BẢNG ── */
    if (d.choChuHeChot)
      o += '<div class="card" style="border-left:3px solid var(--warn)">' +
        '<b>Chưa quy được điểm ra tiền — L-01 còn chờ chủ hệ</b>' +
        '<p class="sm muted mt">' + h(d.choChuHeChot) + '</p>' +
        (laSuperAdmin()
          ? '<div class="row mt" style="gap:8px"><button class="btn primary" ' +
            'onclick="G.tcMoDatHeSo()">Đặt hệ số lương</button></div>'
          : '<p class="tiny muted mt">Chỉ Super Admin đặt được — đây là quyết định ' +
            'về ngân sách, không phải một tham số kỹ thuật.</p>') +
        '</div>';

    if (!(d.dong || []).length)
      return o + U.empty('Kỳ này chưa có ai trong phòng',
        'Bảng lương dựng theo VỊ TRÍ đang giữ trong phòng tài chính.', true);

    if (d.chiDongCuaToi)
      o += '<div class="card"><p class="sm">Bạn đang xem đúng dòng của chính mình. ' +
        'Bảng đầy đủ mở cho R01–R03, người quản lý phòng và kế toán trưởng — ' +
        'kế toán thu không có việc gì phải biết lương kế toán chi.</p></div>';

    o += U.sec('Kỳ ' + h(d.ky), h(d.vi || ''));
    o += U.tbl(['Người', 'Vị trí', 'Điểm', 'Bậc', 'Cứng', 'Theo KPI', 'Ghi nhận', 'Tổng', ''],
      d.dong.map(function (x) {
        var co = x.luongCung !== null && x.luongCung !== undefined;
        var tong = co ? x.luongCung + (x.phanKpi || 0) + (x.ghiNhan || 0) : null;
        return [
          h(x.username.split('@')[0]),
          '<span class="sm muted">' + h(x.tenViTri) + '</span>',
          /* Điểm null in ra là "—", không in 0: không có gì để đo và đo
             được 0 điểm là hai chuyện khác nhau. */
          x.diem === null ? '<span class="muted">—</span>' :
            '<b style="color:' + mauBac(x.diem) + '">' + h(String(x.diem)) + '</b>' +
            (x.trongBoQua ? '<div class="tiny muted">bỏ ' + h(String(x.trongBoQua)) +
              ' trọng số</div>' : ''),
          '<span class="sm">' + h(x.bac || '—') + '</span>',
          co ? h(tien(x.luongCung)) : '<span class="muted">chưa đặt</span>',
          co ? h(tien(x.phanKpi || 0)) : '<span class="muted">—</span>',
          x.ghiNhan ? h(tien(x.ghiNhan)) : '<span class="muted">—</span>',
          tong === null ? '<span class="muted">—</span>' : '<b>' + h(tien(tong)) + '</b>',
          x.trangThai === 'daChot'
            ? U.chip('đã chốt', 'var(--ok)', true)
            : (laQuanLy() && x.username !== ((G.S && G.S.acc && G.S.acc.u) || '') && co
                ? '<button class="btn" onclick="G.tcMoChotLuong(\'' + h(x.username) +
                  '\',' + (x.canNgoiLai ? 'true' : 'false') + ')">Chốt</button>'
                : '<span class="sm muted">nháp</span>')
        ];
      }));

    /* ── DÒNG CỦA CHÍNH TÔI: TỪNG THƯỚC ĐÃ CHẤM ── */
    var toi = d.dong.filter(function (x) {
      return x.username === ((G.S && G.S.acc && G.S.acc.u) || '');
    })[0];
    if (toi && (toi.tung || []).length) {
      o += U.sec('Điểm của bạn đến từ đâu',
        'Từng thước, số đo thật và điểm ra. Một bảng lương chỉ có một con số điểm ' +
        'là một bản án không có hồ sơ — chỗ này để bạn cãi lại được.');
      o += U.tbl(['Thước', 'Đo được', 'Ngưỡng', 'Điểm', 'Trọng số'],
        toi.tung.map(function (t) {
          return [h(t.ma),
            t.do === null || t.do === undefined ? '<span class="muted">không có gì để đo</span>'
              : h(String(t.do) + (t.don === '%' ? '%' : ' ' + (t.don || ''))),
            t.diem === null ? '<span class="muted">—</span>'
              : h((t.huongTot === 'thap' ? '≤ ' : '≥ ') + t.dat +
                  (t.don === '%' ? '%' : ' ' + (t.don || ''))),
            t.diem === null ? '<span class="muted">bỏ ra</span>'
              : '<b>' + h(String(t.diem)) + '</b>',
            '<span class="sm muted">' + h(String(t.trong)) + '</span>'];
        }));
    }

    if (toi && toi.duoi60)
      o += '<div class="card" style="border-left:3px solid var(--warn);margin-top:14px">' +
        '<b>Quyết định của người chốt cho kỳ này</b>' +
        '<p class="sm mt">' + h(toi.duoi60) + '</p>' +
        '<p class="tiny muted mt">Máy không tự cắt phần KPI khi điểm thấp: nhiều lần ' +
        'điểm thấp là vì một chỗ hỏng của hệ chứ không phải của người.</p></div>';
    return o;
  }

  function mauBac(diem) {
    if (diem >= 90) return 'var(--ok)';
    if (diem >= 75) return 'var(--teal)';
    if (diem >= 60) return 'var(--warn)';
    return 'var(--bad)';
  }
  function laSuperAdmin() {
    return ((G.S && G.S.acc && G.S.acc.role) || '') === 'R01';
  }
  function kyMacDinh() {
    /* Kỳ mặc định là THÁNG TRƯỚC, không phải tháng này: KPI chấm trên
       tháng đã đóng, và một tháng đang chạy thì mọi thước còn dở. */
    var t = new Date(Date.now() + 7 * 3600e3);
    t.setUTCDate(1); t.setUTCMonth(t.getUTCMonth() - 1);
    return t.toISOString().slice(0, 7);
  }
  function thangGanDay() {
    var ra = [], t = new Date(Date.now() + 7 * 3600e3);
    t.setUTCDate(1); t.setUTCMonth(t.getUTCMonth() - 1);
    for (var i = 0; i < 6; i++) {
      ra.push(t.toISOString().slice(0, 7));
      t.setUTCMonth(t.getUTCMonth() - 1);
    }
    return ra;
  }

  G.tcDoiKyLuong = function (ky) {
    G.tcLuongKy = ky;
    G.tcDuLieu.luong = null;
    if (typeof document !== 'undefined' && document.getElementById('main'))
      G.render && G.render();
    napLuong();
  };
  function napLuong() {
    if (!G.goiMayChu) return;
    G.goiMayChu('bangLuong', {ky: G.tcLuongKy || kyMacDinh()}).then(function (d) {
      G.tcDuLieu.luong = d;
      if (typeof document !== 'undefined' && document.getElementById('main'))
        G.render && G.render();
    });
  }

  G.tcMoDatHeSo = function () {
    U.modal('<h3>Đặt hệ số lương — trả lời L-01</h3>' +
      '<p class="sm muted mt">Máy đo được ĐIỂM, không quy được điểm ra tiền. Quy đổi ' +
      'là quyết định về thị trường lao động và về ngân sách. Dòng cũ KHÔNG bị sửa đè: ' +
      'đặt mức mới là ghi một dòng có hiệu lực từ một kỳ, để bảng lương đã chốt còn ' +
      'giải thích được.</p>' +
      '<div class="mt2"><label class="sm"><b>Vị trí</b></label>' +
      '<select id="tcHsViTri" class="inp">' +
      '<option value="keToanThu">Kế toán thu</option>' +
      '<option value="keToanChi">Kế toán chi</option>' +
      '<option value="keToanTruong">Kế toán trưởng</option></select></div>' +
      '<div class="mt"><label class="sm"><b>Có hiệu lực từ kỳ</b> ' +
      '<span class="muted">(YYYY-MM)</span></label>' +
      '<input id="tcHsKy" class="inp" placeholder="2026-01" maxlength="7"></div>' +
      '<div class="mt"><label class="sm"><b>Lương cứng</b> ' +
      '<span class="muted">(tầng 1 — đủ sống, không phụ thuộc KPI)</span></label>' +
      '<input id="tcHsCung" class="inp" type="number" min="0" step="100000"></div>' +
      '<div class="mt"><label class="sm"><b>Trần phần KPI</b> ' +
      '<span class="muted">(tầng 2 — số nhận khi đạt 100 điểm)</span></label>' +
      '<input id="tcHsTran" class="inp" type="number" min="0" step="100000"></div>' +
      '<div class="mt"><label class="sm"><b>Vì sao đặt con số này</b></label>' +
      '<textarea id="tcHsLyDo" class="inp" rows="3" maxlength="500" ' +
      'placeholder="Kỳ sau không ai bảo vệ được một con số không có lý do"></textarea></div>' +
      '<div class="row mt2" style="gap:8px">' +
      '<button class="btn primary" onclick="G.tcGuiHeSo()">Đặt hệ số</button>' +
      '<button class="btn" onclick="U.closeModal()">Thôi</button></div>');
  };

  G.tcGuiHeSo = function () {
    G.goiMayChu('datHeSoLuong', {heSo: {
      viTri: oGiaTri('tcHsViTri'), tuKy: oGiaTri('tcHsKy'),
      luongCung: Number(oGiaTri('tcHsCung') || 0),
      tranKpi: Number(oGiaTri('tcHsTran') || 0),
      lyDo: oGiaTri('tcHsLyDo')
    }}).then(function (d) {
      if (!d.ok) return U.toast(d.error || 'Chưa đặt được hệ số.', 'err');
      U.closeModal();
      U.toast('Đã đặt hệ số ' + (d.viTri || '') + ' từ kỳ ' + (d.tuKy || ''));
      napLuong();
    });
  };

  G.tcMoChotLuong = function (u, canNgoiLai) {
    U.modal('<h3>Chốt dòng lương</h3>' +
      '<p class="sm muted mt">Chốt rồi thì KHÔNG tính lại — cùng luật với sổ. Số đo ' +
      'thô của cả năm thước đông cứng trong dòng này, để người được trả cãi lại được.</p>' +
      (canNgoiLai
        ? '<div class="card mt2" style="border-left:3px solid var(--warn)">' +
          '<b>Điểm kỳ này dưới ngưỡng ngồi lại</b>' +
          '<p class="sm muted mt">Máy KHÔNG tự cắt phần KPI và cũng không tự bỏ qua. ' +
          'Nhiều lần điểm thấp là vì một chỗ hỏng của hệ chứ không phải của người, và ' +
          'cắt lương ở đúng chỗ ấy là dạy người ta thôi báo cáo. Ghi ra bạn quyết thế ' +
          'nào và vì sao.</p>' +
          '<textarea id="tcLuongDuoi60" class="inp mt" rows="3" maxlength="500" ' +
          'placeholder="Quyết thế nào, và vì sao"></textarea></div>'
        : '') +
      '<div class="mt2"><label class="sm"><b>Tầng ghi nhận</b> ' +
      '<span class="muted">(tầng 3 — cho những việc không đếm được)</span></label>' +
      '<input id="tcLuongGhiNhan" class="inp" type="number" min="0" step="100000" value="0"></div>' +
      '<div class="mt"><label class="sm"><b>Ghi nhận vì việc gì</b> ' +
      '<span class="muted">(bắt buộc khi có tiền)</span></label>' +
      '<textarea id="tcLuongGhiNhanVi" class="inp" rows="2" maxlength="500" ' +
      'placeholder="Không kể ra thì nó thành chỗ dễ nhất để trả ơn bằng tiền của Học viện"></textarea></div>' +
      '<div class="row mt2" style="gap:8px">' +
      '<button class="btn primary" onclick="G.tcGuiChotLuong(\'' + h(u) + '\')">Chốt</button>' +
      '<button class="btn" onclick="U.closeModal()">Thôi</button></div>');
  };

  G.tcGuiChotLuong = function (u) {
    G.goiMayChu('chotLuong', {
      ky: G.tcLuongKy || kyMacDinh(), username: u,
      duoi60: oGiaTri('tcLuongDuoi60'),
      ghiNhan: Number(oGiaTri('tcLuongGhiNhan') || 0),
      ghiNhanVi: oGiaTri('tcLuongGhiNhanVi')
    }).then(function (d) {
      if (!d.ok) return U.toast(d.error || 'Chưa chốt được.', 'err');
      U.closeModal();
      U.toast('Đã chốt · ' + tien(d.tong));
      napLuong();
    });
  };

  /* ═══════════ NGĂN 9 · QUY CHẾ ═══════════ */
  function nganQuyChe() {
    var dl = G.TC_DIEULE;
    if (!dl) return U.lockCard('Bộ văn bản của phòng nằm trong kho nghề. Mở kho ' +
      'để đọc điều lệ, quy chế, quy trình, biểu mẫu và sổ rủi ro.');

    var o = '<div class="card"><b>' + h(dl.ma + ' · ' + dl.ten) + '</b>' +
      '<p class="sm muted mt">' + h(dl.banHanh || '') + '</p></div>';

    o += U.sec('Điều lệ',
      'Mỗi điều trỏ vào một chỗ thi hành CÓ THẬT trong mã, hoặc tự khai là chưa ' +
      'có chỗ chặn. Một quy chế mà mã không thi hành là một tờ giấy dán tường.');
    o += (dl.dieu || []).map(function (d) {
      return '<div class="card" style="margin-bottom:10px">' +
        '<b>Điều ' + h(String(d.so)) + ' · ' + h(d.ten) + '</b>' +
        '<p class="sm mt">' + h(d.noi) + '</p>' +
        '<p class="sm muted mt">' + h(d.vi) + '</p>' +
        '<div class="mt">' + (d.thiHanh
          ? U.chip('thi hành: ' + d.thiHanh, 'var(--teal)', true)
          : U.chip('CHƯA có chỗ chặn trong mã', 'var(--gold)', true) +
            '<p class="sm muted mt">' + h(d.vi_chua || '') + '</p>') +
        '</div></div>';
    }).join('');

    if ((G.TC_RUIRO || []).length) {
      o += U.sec('Sổ rủi ro',
        'Cột CÒN LẠI là cột quan trọng nhất: một sổ rủi ro mà mọi dòng đều "đã ' +
        'chặn hoàn toàn" là một sổ chưa ai đọc kỹ.');
      o += U.tbl(['Mã', 'Rủi ro', 'Đang chặn bằng', 'Phần CÒN LẠI', 'Ai nhìn'],
        G.TC_RUIRO.map(function (r) {
          return [h(r.ma) + '<div class="sm muted">' + h(r.mucDo) + '</div>',
            h(r.ten), '<span class="sm">' + h(r.chan) + '</span>',
            '<span class="sm" style="color:var(--gold)">' + h(r.con) + '</span>',
            '<span class="sm muted">' + h(r.ai) + '</span>'];
        }));
    }

    if ((G.TC_QUYTRINH || []).length) {
      o += U.sec('Quy trình',
        'Mỗi bước ghi đủ ba cột: bước, AI làm, và ĐIỀU KIỆN ĐI TIẾP. Thiếu cột ' +
        'thứ ba thì nó là một danh sách việc, không phải một quy trình.');
      o += G.TC_QUYTRINH.map(function (q) {
        return '<div class="card" style="margin-bottom:10px"><b>' +
          h(q.ma + ' · ' + q.ten) + '</b>' +
          U.tbl(['#', 'Ai làm', 'Làm gì', 'Điều kiện đi tiếp'],
            (q.buoc || []).map(function (b) {
              return [h(String(b.b)), h(b.ai), h(b.lam),
                '<span class="sm muted">' + h(b.dieuKien) + '</span>']; })) +
          '</div>';
      }).join('');
    }

    if ((G.TC_BIEUMAU || []).length) {
      o += U.sec('Biểu mẫu',
        'Không phải tờ giấy để in: là danh sách TRƯỜNG BẮT BUỘC của một chứng từ, ' +
        'khớp từng chữ với thứ máy chủ đòi.');
      o += U.tbl(['Mã', 'Chứng từ', 'Bắt buộc', 'Theo điều kiện'],
        G.TC_BIEUMAU.map(function (b) {
          return [h(b.ma), h(b.ten),
            '<span class="sm">' + h((b.batBuoc || []).join(', ')) + '</span>',
            '<span class="sm muted">' + h((b.theoDieuKien || []).map(function (t) {
              return t.truong + ' (khi ' + t.khi + ')'; }).join('; ') || '—') + '</span>'];
        }));
    }
    return o;
  }

  /* ═══════════ MÀN CHÍNH ═══════════ */
  G.VIEWS['phong-tai-chinh'] = function () {
    if (!G.tcDuLieu.daGoi) { G.tcDuLieu.daGoi = true; G.tcNap(); }

    var o = U.ph({
      t: 'Phòng Kế toán – Tài chính',
      s: 'Từng đồng ra vào Học viện, và người chịu trách nhiệm cho từng đồng ấy.'
    });
    o += thanhNgan();

    if (G.tcDuLieu.dangNap && !G.tcDuLieu.viTri)
      return o + U.empty('Đang hỏi máy chủ', 'Màn này đọc sổ thật, không đọc bản mẫu.', true);

    if (G.tcNgan === 'tin')      return o + nganTin();
    if (G.tcNgan === 'troly')    return o + nganTroLy();
    if (G.tcNgan === 'viec')     return o + nganViec();
    if (G.tcNgan === 'so')       return o + nganSo();
    if (G.tcNgan === 'doichieu') return o + nganDoiChieu();
    if (G.tcNgan === 'chot')     return o + nganChot();
    if (G.tcNgan === 'kpi')      return o + nganKpi();
    if (G.tcNgan === 'luong')    return o + nganLuong();
    return o + nganQuyChe();
  };
})();
