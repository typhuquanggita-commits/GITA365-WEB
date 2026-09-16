/* ═══════════════════════════════════════════════════════════════
   GITA 365 — MÀN MƯỜI HAI LUẬT GIAO DIỆN  (9.99.74)

   ══ MÀN NÀY KHÔNG CƯỠNG CHẾ GÌ, VÀ PHẢI NÓI RA ĐIỀU ẤY ══

   Răng nằm ở MÁY CHỦ (`may-chu/luat-giao-dien.js`). Màn này chỉ đọc
   bản luật ra cho người viết giao diện sau đọc được.

   Vì sao tách như thế: giao diện là thứ bị viết lại nhiều nhất trong
   mọi kho. Một luật giao diện sống trong mã giao diện thì nó chết cùng
   lượt viết lại đầu tiên — và chết lặng lẽ, vì bản mới trông vẫn đẹp.

   ══ HAI NGĂN LUẬT KHÔNG GỘP ══

   Bảy luật có cổng chặn thật; năm luật nói về màn hình chưa dựng. Trình
   chung một danh sách thì người đọc thấy mười hai dấu tick rồi thôi —
   và năm luật chưa có răng lại đúng là năm luật sẽ được viết bởi người
   không đọc màn này.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;
G.VIEWS = G.VIEWS || {};

(function () {
  var U = G.U, h = U.h, ic = U.ic;

  var NGAN = [
    {ma: 'luat',  ten: 'Mười hai luật', ic: 'shield'},
    {ma: 'do',    ten: 'Vòng đỏ · Người giữ', ic: 'lock'},
    {ma: 'nen',   ten: 'Nguyên tắc · Màn trống', ic: 'star'}
  ];

  G.lgdNgan = G.lgdNgan || 'luat';

  function veLai() {
    if (!G.S || G.S.view !== 'luat-giao-dien') return;
    if (typeof document === 'undefined' || !document.getElementById('main')) return;
    G.render && G.render();
  }
  G.lgdMoNgan = function (ma) { G.lgdNgan = ma; veLai(); };

  /* ── NGĂN 1 · MƯỜI HAI LUẬT, HAI NHÓM TÁCH HẲN ── */
  function veLuat() {
    var ds = G.LGD_LUAT || [];
    var coRang = ds.filter(function (l) { return l.rangO; });
    var chuaCo = ds.filter(function (l) { return l.chuaCoMat; });
    var o = '';

    o += U.sec(coRang.length + ' luật có cổng chặn thật',
      'Mỗi luật trỏ vào MỘT chỗ cắm răng có thật trong mã máy chủ. Bộ kiểm mục 91 ' +
      'đối chiếu từng chỗ ấy với nguồn — trỏ vào một cái tên không tồn tại thì cổng ' +
      'lặng lẽ không chặn gì, mà nhìn vẫn y hệt một cổng đủ răng.');
    o += U.tbl(['Mã', 'Luật', 'Răng nằm ở đâu', 'Vì sao', 'Nguồn'],
      coRang.map(function (l) {
        return [h(l.ma), h(l.ten), '<code>' + h(l.rangO) + '</code>', h(l.vi), h(l.nguon)];
      }));

    if (chuaCo.length) {
      o += U.sec(chuaCo.length + ' luật chưa có bề mặt — và phép canh đặt TRƯỚC',
        'Mấy luật này nói về màn hình kho CHƯA DỰNG. Chúng KHÔNG được khai là đã ' +
        'cưỡng chế. Thay vào đó máy canh rằng cửa ấy chưa tồn tại: ngày ai đó viết ' +
        'cửa chia sẻ ảnh trẻ mà không gọi cổng phủ quyết, bộ kiểm đỏ ngay — trước ' +
        'khi tấm ảnh đầu tiên đi ra.');
      o += U.tbl(['Mã', 'Luật', 'Phép canh đặt trước', 'Vì sao', 'Nguồn'],
        chuaCo.map(function (l) {
          return [h(l.ma), h(l.ten), h(l.chuaCoMat), h(l.vi), h(l.nguon)];
        }));
    } else {
      /* Ngăn rỗng phải NÓI RA nó rỗng vì sao. Một bảng có đầu cột mà
         không có dòng đọc ra là "chỗ này chưa làm xong" — đúng cái hố
         đã ghi ở 9.99.63. */
      o += U.sec('Không luật nào còn treo',
        'Tới 9.99.74 có năm luật — Chế độ Bão · ghim của con · phủ quyết ảnh con · ' +
        'không hỏi vặn · đường thoát — chỉ có phép canh đặt trước, vì kho chưa có màn ' +
        'hình nào để cắm răng. Chủ hệ chốt LGD-01 ở 9.99.75 (thêm màn vào cổng phụ ' +
        'huynh đã có), và bốn cửa còn thiếu được dựng ở may-chu/hom-nay.js, nên cả ' +
        'mười hai nay chặn thật. Phép canh đặt trước KHÔNG bị gỡ: nó canh những CỬA ' +
        'CHƯA VIẾT — cửa Chế độ Bão thứ hai, cửa ghim thứ hai, cửa chia sẻ ảnh thứ ' +
        'hai. Gỡ nó đi vì "đã có cổng rồi" là bỏ đúng lớp bảo vệ dành cho người viết ' +
        'cửa sau, và người viết cửa sau là người không đọc màn này.');
    }

    return o || U.empty('Kho luật giao diện chưa mở', 'Đăng nhập bằng vai có gói nghề.');
  }

  /* ── NGĂN 2 · VÒNG ĐỎ VÀ NGƯỜI GIỮ ── */
  function veDo() {
    var o = '';
    var vd = G.LGD_VONG_DO || [], lu = G.LGD_VONG_DO_LUAT || {};

    o += U.sec('Năm ô vòng đỏ — không rời máy',
      h(lu.taiThietBi || '') + ' ' + h(lu.khongNutChiaSe || ''));
    o += U.tbl(['Tên ô', 'Là gì', 'Nguồn'],
      vd.map(function (x) { return ['<code>' + h(x.o) + '</code>', h(x.ten), h(x.nguon)]; }));
    if (lu.viSaoChanTenO) o += '<p class="note">' + h(lu.viSaoChanTenO) + '</p>';
    if (lu.ngoLaDuDeChan) o += '<p class="note">' + h(lu.ngoLaDuDeChan) + '</p>';

    var ng = G.LGD_NGUOI_GIU || [], nl = G.LGD_NGUOI_GIU_LUAT || {};
    o += U.sec('Bốn thứ máy không soạn hộ — Ba Ghế Người Giữ',
      h(nl.viSaoChan || ''));
    o += U.tbl(['Việc', 'Tên', 'Thay bằng gì'],
      ng.map(function (x) {
        return ['<code>' + h(x.viec) + '</code>', h(x.ten), h(x.thay)];
      }));
    if (nl.khongPhaiChatLuong) o += '<p class="note">' + h(nl.khongPhaiChatLuong) + '</p>';
    if (nl.cungLuatG5) o += '<p class="note">' + h(nl.cungLuatG5) + '</p>';

    var gc = G.LGD_GIU_CHAN || [];
    o += U.sec('Dấu hiệu giữ chân — chặn ở cửa gửi nhắc',
      'Cụm NHIỀU ÂM TIẾT, cùng luật chọn dấu hiệu của bộ lọc quảng cáo: "chuỗi" ' +
      'trần nằm trong "chuỗi 21 ngày", một câu hoàn toàn lành — và bắt oan một câu ' +
      'lành thì lần sau người ta tắt phép đo đi.');
    o += U.tbl(['Dấu hiệu', 'Là kiểu gì'],
      gc.map(function (x) { return ['<code>' + h(x.dau) + '</code>', h(x.vi)]; }));

    return o;
  }

  /* ── NGĂN 3 · NGUYÊN TẮC, MÀN TRỐNG, HAI TRỤC ── */
  function veNen() {
    var o = '';
    var nt = G.LGD_NGUYEN_TAC || [];
    o += U.sec('Ba nguyên tắc riêng của ứng dụng gia đình', '');
    o += U.tbl(['Mã', 'Nguyên tắc', 'Làm thế nào', 'Vì sao'],
      nt.map(function (x) { return [h(x.ma), h(x.ten), h(x.lam), h(x.vi)]; }));

    var tr = G.LGD_TRONG || [];
    o += U.sec('Màn hình trống là LỜI MỜI, không phải lời xin lỗi',
      'Một màn trống nói "chưa có dữ liệu" là một lời xin lỗi của phần mềm. Người ' +
      'đọc nó không biết phải làm gì tiếp, nên họ đóng app.');
    o += U.tbl(['Khi nào', 'Chữ hiển thị', 'Nút'],
      tr.map(function (x) { return [h(x.khi), h(x.chu), h(x.nut || '—')]; }));

    var ht = G.LGD_HAI_TRUC || {};
    if (ht.lech) {
      o += U.sec('Hai trục — một chỗ lệch được NÓI RA', h(ht.lech));
      o += '<p class="note"><b>Vì sao lệch:</b> ' + h(ht.viSao || '') + '</p>';
      o += '<p class="note"><b>Đã chốt:</b> ' + h(ht.daChot || '') + '</p>';
      o += '<p class="note">' + h(ht.viSaoChonCachAy || '') + '</p>';
      o += '<p class="note"><b>Đơn vị:</b> ' + h(ht.donViCap || '') + '</p>';
    }
    return o;
  }

  G.VIEWS['luat-giao-dien'] = function () {
    /* Vai không có gói nghề thì kho này không bao giờ nạp — chặn ở MỘT
       chỗ, trước cả thanh ngăn. Một cái khung rỗng đọc ra là "chỗ này
       chưa làm xong", không đọc ra là "vai của bạn không mở được".
       Cùng chỗ đã sập ở 9.99.63. */
    if (!(G.LGD_LUAT && G.LGD_LUAT.length)) {
      /* Lời chặn phải NÓI ĐỦ, không chỉ nói "không mở được".

         Bản đầu của lời này dài 584 ký tự và bộ rà soát chỗ trống báo
         đỏ — đúng. Một câu từ chối cụt đọc ra là "chỗ này chưa làm
         xong", và người đọc nó là phụ huynh: họ vừa gặp một màn hình
         nói rằng có mười hai luật bảo vệ nhà họ, rồi không nói luật
         nào cả.

         Nên ở đây kể ĐỦ bằng chữ tĩnh — không đọc kho, vì kho nghề
         không nạp cho vai này. Mười hai luật là lời hứa VỚI gia đình,
         nên gia đình đọc được chúng là đúng; thứ nằm trong gói nghề là
         chỗ cắm răng và mã nguồn, không phải lời hứa. */
      var o = '<div class="hd"><h2>' + ic('shield') + ' Mười hai luật giao diện</h2>' +
        '<p class="sub">Đây là mười hai điều phần mềm của Học viện <b>tự cấm mình</b>. ' +
        'Bản đầy đủ — kèm chỗ cắm răng trong mã nguồn — mở cho người của Học viện. ' +
        'Còn đây là phần thuộc về nhà mình, vì mười hai luật này là lời hứa VỚI gia ' +
        'đình chứ không phải quy trình nội bộ.</p></div>';
      o += U.sec('Bảy điều phần mềm này đã bị chặn không làm được',
        'Không xếp hạng các gia đình với nhau — không có màn nào, không có cửa nào. ' +
        'Không hạ cấp của nhà mình, không xoá chuỗi đã đi, kể cả sau mười hai tháng ' +
        'nhà mình không mở app. Năm thứ riêng tư nhất — thư tha thứ, bản đồ nợ cảm ' +
        'xúc, chỉ số cá nhân, hồ sơ sức khoẻ, tuyên ngôn một đời — nằm ở máy của nhà ' +
        'mình và KHÔNG đi lên máy chủ, kể cả khi ẩn danh. Chỉ số chấm CẢ NHÀ, không ' +
        'chấm từng người, nên không có chỗ nào so các thành viên với nhau. Không có ' +
        'thông báo doạ mất chuỗi, không đếm ngược, không mời mua trong ba mươi ngày ' +
        'sau khi nhà mình học xong. Nội dung bán hàng bị bộ lọc bảy mục chặn nút gửi ' +
        'nếu có câu hứa kết quả hoặc câu dùng nỗi sợ. Và máy KHÔNG soạn hộ lời khen ' +
        'con, lời xin lỗi, thư tha thứ hay tin nhắn an ủi — bốn thứ ấy là ô viết tay, ' +
        'vì một lời xin lỗi do máy viết nghe y hệt một lời xin lỗi thật và người nhận ' +
        'không có cách nào phân biệt.');
      o += U.sec('Năm điều còn lại nói về màn hình chưa dựng',
        'Chế độ Bão bật một chạm không hỏi lý do · ghim trên bản đồ riêng của con chỉ ' +
        'con di được, người lớn xem chứ không sửa · con đã từ chối cho đăng ảnh thì nút ' +
        'chia sẻ biến mất và không hỏi lại · bỏ một việc thì không ai hỏi vặn vì sao · ' +
        'màn nào có nội dung nặng cũng có nút "Để hôm khác" ngay cạnh nút tiếp tục, ' +
        'CÙNG KÍCH CỠ. Năm điều này chưa có màn hình để cắm vào, và Học viện KHÔNG ghi ' +
        'chúng là đã làm xong. Thay vào đó bộ kiểm canh rằng cửa ấy chưa tồn tại — ngày ' +
        'có ai viết nó mà quên cổng, bộ kiểm đỏ trước khi lượt đầu tiên chạm tới nhà nào.');
      return o;
    }

    var o = '<div class="hd"><h2>' + ic('shield') + ' Mười hai luật giao diện</h2>' +
      '<p class="sub">Ba mươi phần của khoá học đặt ra rất nhiều luật phủ quyết. ' +
      'Nếu không có cổng cưỡng chế, chúng chỉ là chữ trên giấy — nên răng nằm ở ' +
      '<b>máy chủ</b>, không ở màn hình: giao diện là thứ bị viết lại nhiều nhất ' +
      'trong mọi kho, và một luật sống trong mã giao diện thì chết cùng lượt viết ' +
      'lại đầu tiên.</p></div>';

    o += '<div class="tabs">' + NGAN.map(function (n) {
      return '<button class="tab' + (G.lgdNgan === n.ma ? ' on' : '') +
        '" onclick="G.lgdMoNgan(\'' + n.ma + '\')">' + ic(n.ic) + ' ' + h(n.ten) +
        '</button>';
    }).join('') + '</div>';

    o += G.lgdNgan === 'do' ? veDo()
       : G.lgdNgan === 'nen' ? veNen()
       : veLuat();
    return o;
  };
})();
