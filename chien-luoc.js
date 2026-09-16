/* ═══════════════════════════════════════════════════════════════
   GITA 365 — BẢN ĐỒ CHIẾN LƯỢC VÀ THẺ ĐIỂM CÂN BẰNG

   Kho chuẩn nằm ở kho-goc/data.chien-luoc.js (CL_THAP · CL_TANG ·
   CL_MUC · CL_KETQUA · CL_NHIP · CL_NHAT · CL_LUAT). Tệp này là phần
   CHẠY: soi chuỗi nhân quả, tính trạng thái từng mắt xích, và dựng hai
   màn hình.

   Vì sao phần chạy phải ở src/ chứ không ở kho: tools/ma-hoa-kho.js
   đóng gói bằng JSON.stringify, và JSON.stringify bỏ hàm.

   MỘT ĐIỀU TỰ ĐẶT VÀ SẼ KHÔNG NỚI: màn này KHÔNG bịa số. Mục tiêu nào
   hệ thống chưa đo được thì hiện thẳng là "chưa có số", kèm tên thứ còn
   thiếu. Một bản đồ tô xanh bằng số ước lượng còn tệ hơn một bản đồ
   trống — bản đồ trống thì người ta biết là mình chưa biết.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;
G.VIEWS = G.VIEWS || {};

(function () {
  var U = G.U, h = U.h, ic = U.ic;

  function tangCua(ma) {
    var ds = G.CL_TANG || [];
    for (var i = 0; i < ds.length; i++) if (ds[i].ma === ma) return ds[i];
    return null;
  }
  function mucCua(ma) {
    var ds = G.CL_MUC || [];
    for (var i = 0; i < ds.length; i++) if (ds[i].ma === ma) return ds[i];
    return null;
  }
  G.clMuc = mucCua;

  /* ─── Mục tiêu theo tầng, tầng gốc ở dưới ───
     Trả về theo thứ tự VẼ: tài chính trên cùng, học tập dưới cùng. Chiều
     đọc nhân quả thì ngược lại — dưới đẩy lên. */
  G.clTheoTang = function () {
    return (G.CL_TANG || []).slice().sort(function (a, b) { return b.thu - a.thu; })
      .map(function (t) {
        return { tang: t, muc: (G.CL_MUC || []).filter(function (m) { return m.tang === t.ma; }) };
      });
  };

  /* ─── Nguồn số của một mục tiêu có thật hay không ───
     `nguon` trỏ vào một kho hoặc một hàm trong hệ thống. Hàm này KHÔNG
     đoán giá trị; nó chỉ trả lời được ba trạng thái:

       co     — nguồn có mặt, đo được
       trong  — nguồn có mặt nhưng chưa có dữ liệu nào để tính
       thieu  — nguồn không tồn tại trong phiên này

     Phân biệt "trống" với "thiếu" là chỗ quan trọng nhất: trống là hệ
     thống chưa chạy đủ lâu, thiếu là mục tiêu đang trỏ vào hư không. */
  G.clNguon = function (m) {
    var v = G[m.nguon];
    if (typeof v === 'function') {
      var ra = null;
      try { ra = v(); } catch (e) { return { trang: 'trong', vi: 'Hàm ' + m.nguon + ' chưa tính được trong phiên này.' }; }
      if (ra === null || ra === undefined) return { trang: 'trong', vi: 'Chưa có dữ liệu để tính.' };
      if (typeof ra === 'object' && ra.pt === null) return { trang: 'trong', vi: 'Chưa đủ ngày để ra số.' };
      return { trang: 'co', vi: 'Đo bằng ' + m.nguon + '().', so: ra };
    }
    if (v === undefined) return { trang: 'thieu', vi: 'Kho ' + m.nguon + ' không có trong phạm vi đang mở.' };
    var n = Array.isArray(v) ? v.length : (v && typeof v === 'object' ? Object.keys(v).length : 1);
    if (!n) return { trang: 'trong', vi: 'Kho ' + m.nguon + ' đang rỗng.' };
    return { trang: 'co', vi: 'Đọc từ kho ' + m.nguon + ' · ' + n + ' bản ghi.' };
  };

  /* ─── Soi chuỗi nhân quả ───
     Bốn câu hỏi, mỗi câu bắt một lớp hỏng khác nhau:
       lacTang  — mục tiêu gắn vào một tầng không có thật
       noiHong  — nối tới một mã không có thật
       cut      — không nối lên đâu, mà lại không ở tầng tài chính
       khongToi — đi ngược mãi vẫn không tới được tầng tài chính

     Cái thứ tư là cái đắt nhất và khó thấy nhất bằng mắt: mắt xích có
     nối, nối đúng mã, nhưng cả nhánh ấy chạy vòng trong hai tầng dưới
     rồi dừng. Nhìn bản đồ thì vẫn thấy có mũi tên. */
  G.clSoiChuoi = function () {
    var ds = G.CL_MUC || [];
    var maCo = {}; ds.forEach(function (m) { maCo[m.ma] = m; });
    var lacTang = [], noiHong = [], cut = [], khongToi = [];

    ds.forEach(function (m) {
      if (!tangCua(m.tang)) lacTang.push(m.ma);
      (m.noi || []).forEach(function (n) { if (!maCo[n]) noiHong.push(m.ma + '→' + n); });
      if (!(m.noi || []).length && m.tang !== 'TC') cut.push(m.ma);
    });

    function toiTaiChinh(ma, daQua) {
      var m = maCo[ma];
      if (!m) return false;
      if (m.tang === 'TC') return true;
      if (daQua[ma]) return false;              /* vòng lặp — coi như không tới */
      daQua[ma] = 1;
      return (m.noi || []).some(function (n) { return toiTaiChinh(n, daQua); });
    }
    ds.forEach(function (m) { if (m.tang !== 'TC' && !toiTaiChinh(m.ma, {})) khongToi.push(m.ma); });

    return { lacTang: lacTang, noiHong: noiHong, cut: cut, khongToi: khongToi,
      lanh: !lacTang.length && !noiHong.length && !cut.length && !khongToi.length };
  };

  /* ─── Mục tiêu nào đang đo được ─── */
  G.clDemNguon = function () {
    var co = 0, trong = 0, thieu = [];
    (G.CL_MUC || []).forEach(function (m) {
      var n = G.clNguon(m);
      if (n.trang === 'co') co++;
      else if (n.trang === 'trong') trong++;
      else thieu.push(m.ma + '→' + m.nguon);
    });
    return { co: co, trong: trong, thieu: thieu, tong: (G.CL_MUC || []).length };
  };

  /* ─── Mục tiêu nào KHÔNG có đầu việc nào đẩy ───
     Bậc bảy của tháp là đầu việc; bậc năm là bản đồ. Nếu một mục tiêu
     trong bản đồ không có đầu việc nào của bất kỳ vị trí nào đẩy nó, thì
     mục tiêu ấy chỉ tồn tại trên giấy. Nối bằng VAI: mục tiêu do vai nào
     chịu trách nhiệm thì vai ấy phải có đầu việc trong danh mục. */
  G.clMucKhongCoViec = function () {
    var dm = G.cvDanhMuc ? G.cvDanhMuc() : [];
    if (!dm.length) return null;
    return (G.CL_MUC || []).filter(function (m) {
      return !(m.vai || []).some(function (v) {
        return dm.some(function (dv) { return (dv.vai || []).indexOf(v) >= 0; });
      });
    }).map(function (m) { return m.ma; });
  };

  /* ═══════════ MÀN: BẢN ĐỒ CHIẾN LƯỢC ═══════════ */
  G.VIEWS['ban-do-chien-luoc'] = function () {
    if (!G.CL_MUC || !G.CL_TANG)
      return U.empty('Chưa mở được bản đồ chiến lược',
        'Bản đồ chiến lược là công cụ điều hành nội bộ, nằm trong gói nghề. Đăng nhập bằng tài khoản có phạm vi ấy để mở.');

    var soi = G.clSoiChuoi();
    var ngu = G.clDemNguon();

    var o = U.ph({ eyebrow: 'BẢN ĐỒ CHIẾN LƯỢC', ic: 'map', grad: 1,
      t: 'Việc hôm nay chạm vào lời hứa trăm năm ở chỗ nào',
      lead: 'Đọc từ DƯỚI LÊN. Tầng dưới đẩy tầng trên: học tập đẩy vận hành, vận hành đẩy gia đình, ' +
        'gia đình đẩy tài chính. Doanh thu nằm trên cùng vì nó là kết quả — chỗ duy nhất không kéo trực tiếp được.' });

    /* Bốn kết quả ở đỉnh */
    o += U.sec('Bốn kết quả ở đỉnh', 'Mọi mắt xích bên dưới phải dẫn tới ít nhất một trong bốn.');
    o += '<div class="grid g2 mb">' + (G.CL_KETQUA || []).map(function (k) {
      return '<div class="card" style="border-color:' + k.c + '2e">' +
        '<b class="sm" style="display:block;color:' + k.c + ';margin-bottom:7px">' + h(k.ten) + '</b>' +
        '<p class="sm dim" style="line-height:1.8">' + h(k.y) + '</p>' +
        '<p class="tiny mt" style="line-height:1.7"><b>Đo bằng:</b> ' + h(k.do) + '</p></div>';
    }).join('') + '</div>';

    /* Bốn tầng, tầng gốc dưới cùng */
    G.clTheoTang().forEach(function (nhom) {
      var t = nhom.tang;
      o += '<div class="card mb" style="border-color:' + t.c + '2e">' +
        '<div class="row wrap mb" style="gap:10px;align-items:baseline">' +
        '<b style="color:' + t.c + '">' + h(t.ten) + '</b>' +
        '<span class="tiny muted">' + h(t.hoi) + '</span></div>' +
        '<p class="tiny dim mb" style="line-height:1.7">' + h(t.y) + '</p>';

      o += '<div class="grid g2">' + nhom.muc.map(function (m) {
        var n = G.clNguon(m);
        var mau = n.trang === 'co' ? '#0B7350' : n.trang === 'trong' ? '#B4720F' : '#BE0E16';
        var nhan = n.trang === 'co' ? 'ĐO ĐƯỢC' : n.trang === 'trong' ? 'CHƯA CÓ SỐ' : 'THIẾU NGUỒN';
        var len = (m.noi || []).map(function (x) {
          var d = mucCua(x); return d ? d.ten : x;
        });
        return '<div class="card" style="border-color:' + mau + '26">' +
          '<div class="row wrap" style="gap:7px;align-items:baseline;margin-bottom:6px">' +
          '<span class="tiny up" style="color:' + mau + '">' + h(m.ma) + ' · ' + nhan + '</span></div>' +
          '<b class="sm" style="display:block;margin-bottom:7px">' + h(m.ten) + '</b>' +
          '<p class="sm dim" style="line-height:1.8">' + h(m.y) + '</p>' +
          '<div class="tiny mt" style="line-height:1.8">' +
          '<div><b>Đo:</b> ' + h(m.do) + '</div>' +
          '<div><b>Đạt khi:</b> ' + h(m.chuan) + ' · <b>Nhịp:</b> ' + h(m.nhip) + '</div>' +
          '<div class="muted">' + h(n.vi) + '</div>' +
          (len.length ? '<div class="mt"><b>Đẩy lên:</b> ' + len.map(h).join(' · ') + '</div>'
                      : '<div class="mt muted">Nằm ở tầng kết quả — không đẩy tiếp lên đâu nữa.</div>') +
          '</div></div>';
      }).join('') + '</div></div>';
    });

    /* Kết quả soi chuỗi — nói thẳng, kể cả khi xấu */
    o += U.sec('Chuỗi nhân quả có lành không',
      'Phần này soi chính bản đồ ở trên, không soi công việc. Bản đồ hỏng thì mọi con số bên dưới đều đo nhầm chỗ.');
    var dong = [
      ['Mục tiêu gắn vào tầng có thật', soi.lacTang, 'Gắn nhầm tầng thì nó nằm sai chỗ trong chuỗi nhân quả.'],
      ['Mọi mối nối trỏ vào mã có thật', soi.noiHong, 'Nối vào một mã không tồn tại là mũi tên vẽ ra chỗ trống.'],
      ['Không mục tiêu nào cụt', soi.cut, 'Cụt nghĩa là làm xong cũng không ai khá hơn.'],
      ['Mọi nhánh đều tới được tầng tài chính', soi.khongToi, 'Có mũi tên nhưng chạy vòng rồi dừng — nhìn bản đồ không thấy được.']
    ];
    o += '<div class="card mb">' + dong.map(function (d) {
      var xau = d[1].length;
      return '<div class="row wrap" style="gap:9px;align-items:baseline;padding:7px 0;border-bottom:1px solid var(--gita-vien-2)">' +
        '<span style="color:' + (xau ? '#BE0E16' : '#0B7350') + '">' + ic(xau ? 'bell' : 'check', 'w-4 h-4') + '</span>' +
        '<div style="flex:1"><b class="sm">' + h(d[0]) + '</b>' +
        '<div class="tiny dim" style="line-height:1.7">' + h(d[2]) + '</div>' +
        (xau ? '<div class="tiny" style="color:#BE0E16">' + h(d[1].join(' ')) + '</div>' : '') + '</div></div>';
    }).join('') + '</div>';

    o += '<div class="card mb"><b class="sm">Đo được bao nhiêu phần của bản đồ</b>' +
      '<p class="sm dim mt" style="line-height:1.8">' + ngu.co + ' trên ' + ngu.tong +
      ' mục tiêu đang có nguồn số thật. ' + ngu.trong + ' mục tiêu có nguồn nhưng chưa đủ dữ liệu — ' +
      'đó là chuyện bình thường của một hệ mới chạy, và nó sẽ tự đầy lên.' +
      (ngu.thieu.length ? ' <b style="color:#BE0E16">' + ngu.thieu.length +
        ' mục tiêu đang trỏ vào nguồn không có thật: ' + h(ngu.thieu.join(' ')) + '</b>' : '') +
      '</p></div>';

    /* Chín bậc tháp */
    o += U.sec('Chín bậc tháp', 'Bậc dưới quyết định bậc trên. Càng lên cao càng đổi nhanh — đó là lý do phải tách bậc.');
    o += '<div class="card">' + (G.CL_THAP || []).slice().reverse().map(function (b) {
      var coKho = G[b.kho] !== undefined;
      return '<div style="padding:9px 0;border-bottom:1px solid var(--gita-vien-2)">' +
        '<div class="row wrap" style="gap:9px;align-items:baseline">' +
        '<span class="tiny up muted">BẬC ' + b.b + '</span>' +
        '<b class="sm">' + h(b.ten) + '</b>' +
        '<span class="tiny dim">' + h(b.hoi) + '</span>' +
        '<span class="tiny" style="margin-left:auto;color:' + (coKho ? '#0B7350' : '#B4720F') + '">' +
        h(b.kho) + (coKho ? '' : ' · ngoài phạm vi đang mở') + '</span></div>' +
        '<p class="tiny dim mt" style="line-height:1.7">' + h(b.y) + '</p>' +
        '<p class="tiny mt" style="line-height:1.7;color:#B4720F">' + h(b.dau) + '</p>' +
        '<div class="tiny muted mt">Ai chốt: ' + h(b.ai) + ' · Xem lại: ' + h(b.nhip) +
        (b.man ? ' · <button class="btn ghost sm" data-v="' + h(b.man) + '">Mở</button>' : '') + '</div></div>';
    }).join('') + '</div>';

    return o;
  };

  /* ═══════════ MÀN: THẺ ĐIỂM CÂN BẰNG ═══════════ */
  G.VIEWS['the-diem-can-bang'] = function () {
    if (!G.CL_MUC)
      return U.empty('Chưa mở được thẻ điểm',
        'Thẻ điểm cân bằng là công cụ điều hành nội bộ, nằm trong gói nghề.');

    var o = U.ph({ eyebrow: 'THẺ ĐIỂM CÂN BẰNG', ic: 'chart', grad: 1,
      t: 'Mỗi mục tiêu một thước, mỗi thước một ngưỡng',
      lead: 'Không có ngưỡng thì con số chỉ là con số. Và một bộ thước không bao giờ đỏ là một bộ thước không đo gì — ' +
        'quý nào cả bốn tầng đều xanh thì việc phải làm là siết chuẩn, không phải ăn mừng.' });

    var hang = [];
    G.clTheoTang().forEach(function (nhom) {
      nhom.muc.forEach(function (m) {
        var n = G.clNguon(m);
        var nhan = n.trang === 'co' ? 'Đo được' : n.trang === 'trong' ? 'Chưa có số' : 'Thiếu nguồn';
        /* U.tbl thoát chữ ở đầu cột nhưng KHÔNG thoát ô, nên thoát tại đây.
           Nội dung này là kho của Học viện chứ không phải người dùng gõ,
           nhưng một ô không thoát hôm nay là một ô không ai nhớ ngày mai. */
        hang.push([h(nhom.tang.ten), h(m.ma + ' · ' + m.ten), h(m.do), h(m.chuan), h(m.nhip),
          h((m.vai || []).join(' ')), h(nhan)]);
      });
    });
    o += U.tbl(['Tầng', 'Mục tiêu', 'Đo bằng số nào', 'Đạt khi', 'Nhịp', 'Ai chịu', 'Trạng thái'], hang);

    /* Nhịp xem lại */
    o += U.sec('Nhịp xem lại — phân tầng theo thời gian',
      'Mỗi tầng thời gian có ĐÚNG MỘT câu hỏi, và tầng dưới không được bàn câu hỏi của tầng trên.');
    o += '<div class="card mb">' + (G.CL_NHIP || []).map(function (n) {
      return '<div style="padding:9px 0;border-bottom:1px solid var(--gita-vien-2)">' +
        '<div class="row wrap" style="gap:9px;align-items:baseline">' +
        '<b class="sm">' + h(n.ten) + '</b>' +
        '<span class="tiny muted">' + h(n.ai) + (n.phut ? ' · ' + n.phut + ' phút' : '') + '</span></div>' +
        '<p class="sm mt" style="line-height:1.8"><b>Hỏi:</b> ' + h(n.hoi) + '</p>' +
        '<p class="tiny dim" style="line-height:1.7"><b>Ra khỏi buổi với:</b> ' + h(n.ra) + '</p>' +
        '<p class="tiny" style="line-height:1.7;color:#B4720F">' + h(n.khong) + '</p></div>';
    }).join('') + '</div>';

    /* Sáu nếp nghề, mỗi nếp phải chỉ ra cơ chế có thật */
    o += U.sec('Sáu nếp nghề và cơ chế đang thi hành chúng',
      'Chép khẩu hiệu thì dễ và vô ích. Mỗi nếp phải chỉ ra được cái cơ chế CÓ THẬT trong hệ thống đang thực thi nó.');
    o += '<div class="grid g2 mb">' + (G.CL_NHAT || []).map(function (x) {
      return '<div class="card">' +
        '<div class="row wrap" style="gap:8px;align-items:baseline;margin-bottom:6px">' +
        '<b class="sm">' + h(x.ten) + '</b><span class="tiny muted">' + h(x.tu) + '</span></div>' +
        '<p class="sm dim" style="line-height:1.8">' + h(x.y) + '</p>' +
        '<p class="tiny mt" style="line-height:1.7;color:#0B7350"><b>Cơ chế đang chạy:</b> ' + h(x.co) + '</p></div>';
    }).join('') + '</div>';

    o += U.sec('Sáu luật của lớp này', 'Viết ra để sau này không ai nới.');
    o += '<div class="card">' + (G.CL_LUAT || []).map(function (l) {
      return '<div style="padding:8px 0;border-bottom:1px solid var(--gita-vien-2)">' +
        '<b class="sm">' + l.no + '. ' + h(l.t) + '</b>' +
        '<p class="tiny dim mt" style="line-height:1.7">' + h(l.y) + '</p></div>';
    }).join('') + '</div>';
    return o;
  };
})();
