/* ═══════════════════════════════════════════════════════════════
   GITA 365 · v9.71 — ĐO TỰ ĐỘNG HOÁ

   Kho chuẩn ở kho-goc/data.tu-dong-he.js (TDH_), nối vào DKH_ của
   bản 9.61.

   Ý CHÍNH: ĐO CHỨ KHÔNG TIN LỜI KHAI

   Cả hai kho đều khai mức tự động bằng tay. Khai xong thì không ai
   kiểm lại, và sáu tháng sau một việc khai "máy chạy hết" có thể đã
   hỏng mà bảng vẫn xanh.

   tdSoatThat() lấy tên hàm, tên kho và tên màn mà mỗi việc dẫn ra,
   rồi kiểm chúng CÓ THẬT trong hệ đang chạy. Việc nào khai máy làm
   mà không dẫn được chỗ máy làm thì tụt về CHƯA CHỨNG MINH và KHÔNG
   được tính vào tỉ lệ.

   ═══ BỐN CÁI KHOÁ ═══

   tdSoatThat()      mỗi việc phải dẫn được chỗ máy làm, và chỗ ấy
                     phải tồn tại thật
   tdSoiChan()       gọi thật năm chỗ chặn, không đọc lời khai
   tdSoiKhong100()   ĐỎ nếu tỉ lệ khai là 100% — luật viết vào mã để
                     nó sống lâu hơn người viết nó
   tdSoiDuong()      mỗi việc còn làm được phải nói rõ chỗ chặn nó
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;
G.VIEWS = G.VIEWS || {};

(function () {
  var U = G.U, h = U.h;

  /* Công cụ trong tools/ không chạy trong trình duyệt, nên không gọi
     được để kiểm. Nhưng chúng ĐƯỢC KHAI ở đây một lần, và bộ dò tĩnh
     tools/do-sau.js kiểm tệp có trên đĩa không. Chỗ này chỉ kiểm tên
     có đúng dạng đường dẫn công cụ. */
  function laCongCu(s) {
    return /^(tools|desktop|\.github)\//.test(String(s || ''));
  }

  function coHam(ten) { return typeof G[String(ten).trim()] === 'function'; }
  function coKho(ten) { return G[String(ten).trim()] !== undefined; }
  function coMan(v) { return typeof (G.VIEWS || {})[v] === 'function'; }

  /* Một việc "dẫn được chỗ máy làm" khi ít nhất một trong bốn ô
     congCu / ham / tuKho / manNoi trỏ vào chỗ có thật. */
  function danDuoc(x) {
    var dan = [];
    if (x.congCu && laCongCu(x.congCu)) dan.push('công cụ ' + x.congCu);
    String(x.ham || '').split('·').forEach(function (t) {
      if (t.trim() && coHam(t)) dan.push('G.' + t.trim() + '()');
    });
    String(x.tuKho || '').split('·').forEach(function (t) {
      var k = t.trim().split('.')[0];
      if (k && coKho(k)) dan.push('kho ' + k);
    });
    if (x.manNoi && coMan(x.manNoi)) dan.push('màn ' + x.manNoi);
    return dan;
  }

  /* ═══════════ ĐO TRÊN HỆ ĐANG CHẠY ═══════════ */
  G.tdSoatThat = function () {
    var he = G.TDH_HE || [], ban = G.DKH_VIEC || [];
    if (!he.length) return { chuaDo: true, thieu: 'TDH_HE', ds: [] };
    if (!ban.length) return { chuaDo: true, thieu: 'DKH_VIEC', ds: [] };

    var hopMuc = {};
    (G.DKH_MUC || []).forEach(function (m) { hopMuc[m.ma] = m; });

    var ds = [].concat(
      ban.map(function (x) { return { tu: 'BÀN LÀM VIỆC', x: x }; }),
      he.map(function (x) { return { tu: 'HỆ THỐNG', x: x }; }));

    var dem = { MAY: 0, MAY_SAN: 0, NGUOI: 0, CHUA_CHUNG_MINH: 0 };
    var ra = ds.map(function (o) {
      var x = o.x, dan = danDuoc(x);
      /* Việc khai máy làm mà không dẫn được thì tụt hạng. Việc khai
         CHỈ NGƯỜI LÀM thì không cần dẫn — không có chỗ máy nào để dẫn. */
      var muc = x.muc;
      var tut = false;
      if (muc !== 'NGUOI' && !dan.length) { muc = 'CHUA_CHUNG_MINH'; tut = true; }
      dem[muc] = (dem[muc] || 0) + 1;
      return { tu: o.tu, ma: x.ma, ten: x.ten, mucKhai: x.mucKhai || x.muc,
        muc: muc, tut: tut, dan: dan, nguoi: x.nguoi || '', neuHong: x.neuHong || '' };
    });

    var tong = ra.length;
    /* Tỉ lệ tính theo TRỌNG SỐ, không đếm đầu việc: máy chạy hết tính
       một, máy dọn sẵn tính nửa, còn lại tính không. Đếm đầu việc thì
       một việc máy dọn sẵn cũng nhìn như một việc máy làm trọn. */
    var diem = dem.MAY + dem.MAY_SAN * 0.5;
    return { chuaDo: false, ds: ra, tong: tong, dem: dem,
      phanTram: Math.round(diem / tong * 100),
      soBan: ban.length, soHe: he.length,
      soMucHop: Object.keys(hopMuc).length };
  };

  /* ═══════════ KHOÁ 1: MỌI VIỆC PHẢI DẪN ĐƯỢC ═══════════ */
  G.tdSoiThat = function () {
    var s = G.tdSoatThat(), loi = [];
    if (s.chuaDo) return { chuaDo: true, thieu: s.thieu, loi: [] };

    var hopMuc = {};
    (G.DKH_MUC || []).forEach(function (m) { hopMuc[m.ma] = 1; });
    if (!Object.keys(hopMuc).length)
      return { chuaDo: true, thieu: 'DKH_MUC', loi: [] };

    (G.TDH_HE || []).forEach(function (x) {
      ['ten', 'kich', 'may', 'nguoi', 'neuHong'].forEach(function (k) {
        if (!x[k]) loi.push(x.ma + ' thiếu ô ' + k);
      });
      /* Dùng đúng thang của DKH_MUC, không đặt thang mới — hai kho
         phải đọc được cùng một thước. */
      if (!hopMuc[x.muc]) loi.push(x.ma + ' khai mức "' + x.muc + '" không có trong DKH_MUC');
      if (!x.congCu && !x.ham)
        loi.push(x.ma + ' không dẫn được chỗ nó chạy — thiếu cả ô congCu lẫn ô ham');
      if (x.congCu && !laCongCu(x.congCu))
        loi.push(x.ma + ' khai công cụ "' + x.congCu + '" không đúng dạng đường dẫn');
      String(x.ham || '').split('·').forEach(function (t) {
        if (t.trim() && !coHam(t))
          loi.push(x.ma + ' dẫn G.' + t.trim() + '() — hàm ấy không có trong hệ đang chạy');
      });
    });

    s.ds.forEach(function (x) {
      if (x.tut) loi.push(x.ma + ' khai "' + x.mucKhai + '" mà không dẫn được chỗ máy làm');
    });

    if (!(G.TDH_HE_LUAT || {}).moiViecPhaiDanDuoc)
      loi.push('chưa khai luật mỗi việc phải dẫn được');
    if (!(G.TDH_LUAT || {}).doChuKhongTin) loi.push('chưa khai luật đo chứ không tin');
    return { chuaDo: false, loi: loi, tong: s.tong, phanTram: s.phanTram };
  };

  /* ═══════════ KHOÁ 2: NĂM CHỖ CHẶN — GỌI THẬT ═══════════ */
  G.tdSoiChan = function () {
    var ds = G.TDH_CHAN || [], loi = [], con = [];
    if (!ds.length) return { chuaDo: true, thieu: 'TDH_CHAN', loi: [] };

    ds.forEach(function (x) {
      ['viec', 'guard', 'kieu', 'vi', 'tuLuat'].forEach(function (k) {
        if (!x[k]) loi.push(x.ma + ' thiếu ô ' + k);
      });
      var song;
      if (x.kieu === 'ham') song = coHam(x.guard);
      else if (x.kieu === 'kho') song = coKho(x.guard);
      else { loi.push(x.ma + ' khai kiểu "' + x.kieu + '" không hợp lệ'); return; }
      if (!song) loi.push(x.ma + ' — chỗ chặn ' + x.guard + ' (' + x.kieu +
        ') KHÔNG còn trong hệ. Việc "' + x.viec + '" đang không ai chặn.');
      else con.push(x.ma);
    });

    /* Bốn mã đầu phải khớp với DKH_CAM_MAY của 9.61 — hai kho nói về
       cùng một luật thì phải nói cùng một mã, nếu không thì sáu tháng
       sau chúng trôi khỏi nhau. */
    var maCu = {};
    (G.DKH_CAM_MAY || []).forEach(function (x) { maCu[x.ma] = 1; });
    if (Object.keys(maCu).length) {
      Object.keys(maCu).forEach(function (m) {
        if (!ds.filter(function (x) { return x.ma === m; }).length)
          loi.push('DKH_CAM_MAY có ' + m + ' mà TDH_CHAN không có — hai kho đang trôi khỏi nhau');
      });
    }

    if (!(G.TDH_CHAN_LUAT || {}).goiThatKhongDocKhai)
      loi.push('chưa khai luật gọi thật chứ không đọc khai');
    return { chuaDo: false, loi: loi, so: ds.length, conChan: con.length };
  };

  /* ═══════════ KHOÁ 3: KHÔNG ĐƯỢC KHAI 100% ═══════════

     Luật này viết vào mã chứ không viết vào tài liệu, để nó sống lâu
     hơn người viết nó. Năm việc ở TDH_CHAN là phần CỐ Ý không làm —
     gộp chúng vào để lấy con số tròn là tự lừa mình.

     Trần đặt ở 95: còn năm việc máy không nhận thì tỉ lệ không thể
     chạm trần, và nếu nó chạm thì hoặc phép đo hỏng, hoặc có ai vừa
     gỡ một chỗ chặn. */
  G.tdSoiKhong100 = function () {
    var s = G.tdSoatThat(), loi = [];
    if (s.chuaDo) return { chuaDo: true, thieu: s.thieu, loi: [] };
    if (s.phanTram >= 100)
      loi.push('tỉ lệ tự động khai ' + s.phanTram + '% — không thể đúng khi hệ còn năm ' +
        'việc cấm máy nhận. Hoặc phép đo hỏng, hoặc vừa có người gỡ một chỗ chặn.');
    if (s.phanTram > 95)
      loi.push('tỉ lệ ' + s.phanTram + '% vượt trần 95 — kiểm lại TDH_CHAN xem còn đủ ' +
        'năm chỗ chặn không');
    if (!s.dem.NGUOI)
      loi.push('không việc nào khai CHỈ NGƯỜI LÀM — bảng đã hạ chuẩn, vì hệ này có ít ' +
        'nhất năm việc như thế');
    if (s.phanTram < 20)
      loi.push('tỉ lệ ' + s.phanTram + '% quá thấp — nhiều khả năng phép đo không đọc ' +
        'được kho, chứ không phải hệ không tự động');
    if (!(G.TDH_LUAT || {}).khong100) loi.push('chưa khai luật không khai 100%');
    if (!(G.TDH_LOI || {}).veCon100) loi.push('chưa khai vì sao không đạt 100%');
    return { chuaDo: false, loi: loi, phanTram: s.phanTram };
  };

  /* ═══════════ KHOÁ 4: ĐƯỜNG ĐI TIẾP PHẢI NÓI CHỖ CHẶN ═══════════ */
  G.tdSoiDuong = function () {
    var ds = G.TDH_DUONG || [], loi = [];
    if (!ds.length) return { chuaDo: true, thieu: 'TDH_DUONG', loi: [] };
    var uu = {};
    ds.forEach(function (x) {
      ['viec', 'nay', 'duoc', 'chan', 'goDuoc'].forEach(function (k) {
        if (!x[k]) loi.push('việc ưu tiên ' + x.uu + ' thiếu ô ' + k);
      });
      if (uu[x.uu]) loi.push('hai việc cùng mức ưu tiên ' + x.uu + ' — thứ tự phải rõ');
      uu[x.uu] = 1;
    });
    /* Bảng đường đi mà không việc nào làm được ngay thì nó là bảng
       than thở, không phải bảng việc. */
    var lamNgay = ds.filter(function (x) { return /không có gì chặn/i.test(String(x.chan)); });
    if (!lamNgay.length)
      loi.push('không việc nào khai "không có gì chặn" — bảng đường đi thành bảng than thở');
    if (!(G.TDH_DUONG_LUAT || {}).xepTheoGoDuoc) loi.push('chưa khai luật xếp theo gỡ được');
    return { chuaDo: false, loi: loi, so: ds.length, lamNgay: lamNgay.length };
  };

  /* ═══════════════════════════════════════════════════════════
     MÀN HÌNH
     ═══════════════════════════════════════════════════════════ */
  var MAU = { MAY: '#0B6675', MAY_SAN: '#5140B4', NGUOI: '#B4720F',
              CHUA_CHUNG_MINH: '#BE0E16' };
  var NHAN = { MAY: 'MÁY CHẠY HẾT', MAY_SAN: 'MÁY DỌN SẴN · NGƯỜI QUYẾT',
               NGUOI: 'CHỈ NGƯỜI LÀM ĐƯỢC', CHUA_CHUNG_MINH: 'CHƯA CHỨNG MINH ĐƯỢC' };

  G.VIEWS['tu-dong'] = function () {
    if (!G.TDH_HE)
      return U.empty('Chưa mở được phần này',
        'Bảng tự động hoá nằm trong gói nghề. Đăng nhập bằng tài khoản có quyền nghề để nạp.');

    var loi = G.TDH_LOI || {}, s = G.tdSoatThat();
    var kqT = G.tdSoiThat(), kqC = G.tdSoiChan(), kqK = G.tdSoiKhong100(), kqD = G.tdSoiDuong();
    var lech = [].concat(kqT.loi || [], kqC.loi || [], kqK.loi || [], kqD.loi || []);

    var o = U.ph({ eyebrow: 'TỰ ĐỘNG HOÁ — ĐO TRÊN HỆ ĐANG CHẠY', ic: 'lightning', grad: 1,
      t: s.phanTram + '% · ' + s.tong + ' việc · ' + (kqC.so || 0) + ' chỗ máy không được nhận',
      lead: loi.doChuKhongKhai || '' });

    o += '<div class="card mb" style="border-color:' + (lech.length ? '#BE0E16' : '#B4720F') + '56">' +
      '<b class="sm" style="color:#B4720F">' + h(loi.cauDatNhat || '') + '</b>' +
      '<p class="tiny mt" style="line-height:1.75">' + h(loi.hopHaiKho || '') + '</p>' +
      '<p class="tiny mt" style="line-height:1.75;color:#BE0E16">' + h(loi.veCon100 || '') + '</p>' +
      '<p class="tiny mt" style="line-height:1.75">' + h(loi.tuDongDeLamGi || '') + '</p>' +
      '<p class="tiny dim mt" style="line-height:1.7">' + h(loi.nguon || '') + '</p>' +
      (lech.length ? '<p class="tiny mt" style="line-height:1.7;color:#BE0E16"><b>LỆCH: ' +
        h(lech.slice(0, 4).join(' · ')) + '</b></p>' : '') + '</div>';

    /* Số đo */
    o += U.sec('Đo được bao nhiêu — tính theo trọng số, không đếm đầu việc',
      'Máy chạy hết tính một · máy dọn sẵn tính nửa · còn lại tính không. Đếm đầu việc thì ' +
      'một việc máy dọn sẵn cũng nhìn như một việc máy làm trọn.');
    o += '<div class="card mb" style="border-color:#B4720F56">' +
      '<div style="display:flex;flex-wrap:wrap;gap:20px;align-items:baseline">' +
      ['MAY', 'MAY_SAN', 'NGUOI', 'CHUA_CHUNG_MINH'].map(function (m) {
        return '<div style="min-width:190px"><span class="tiny up" style="color:' + MAU[m] +
          '">' + h(NHAN[m]) + '</span><br><b style="font-size:1.7em;color:' + MAU[m] + '">' +
          (s.dem[m] || 0) + '</b></div>';
      }).join('') +
      '<div style="min-width:190px"><span class="tiny up" style="color:#B4720F">TỈ LỆ ĐO ĐƯỢC</span>' +
      '<br><b style="font-size:1.9em;color:#B4720F">' + s.phanTram + '%</b>' +
      '<span class="tiny dim"> / trần 95</span></div></div>' +
      '<p class="tiny mt" style="line-height:1.75">' +
      h((G.TDH_LUAT || {}).khong100 || '') + '</p></div>';

    /* Năm chỗ chặn */
    o += U.sec('Năm việc máy không được nhận — gọi thật chỗ chặn, không đọc lời khai',
      (G.TDH_CHAN_LUAT || {}).khongPhaiChuaLamXong || '');
    o += '<div class="card mb" style="border-color:' +
      ((kqC.loi || []).length ? '#BE0E16' : '#0B6675') + '56">' +
      (G.TDH_CHAN || []).map(function (x) {
        var song = x.kieu === 'ham' ? coHam(x.guard) : coKho(x.guard);
        return '<div style="padding:11px 0;border-bottom:1px solid var(--gita-vien-2)">' +
          '<b class="sm">' + h(x.ma) + ' · ' + h(x.viec) + '</b> ' +
          (song ? '<span class="tiny up" style="color:#0B6675">CÒN CHẶN</span>'
                : '<span class="tiny up" style="color:#BE0E16">CHỖ CHẶN ĐÃ MẤT</span>') +
          (x.moiTu ? ' <span class="tiny dim">mới từ ' + h(x.moiTu) + '</span>' : '') +
          '<p class="tiny mt" style="line-height:1.75">' + h(x.vi) + '</p>' +
          '<p class="tiny dim" style="line-height:1.7">Chặn bằng ' + h(x.kieu) + ' ' +
          h(x.guard) + ' · theo ' + h(x.tuLuat) + '</p></div>';
      }).join('') + '</div>';

    o += G.kaKhung ? G.kaKhung('tu-dong', 'dau') : '';

    /* Bảng việc */
    o += U.sec('Từng việc — dẫn được chỗ máy làm hay không',
      (G.TDH_HE_LUAT || {}).moiViecPhaiDanDuoc || '');
    ['BÀN LÀM VIỆC', 'HỆ THỐNG'].forEach(function (tu) {
      var nhom = (s.ds || []).filter(function (x) { return x.tu === tu; });
      o += '<div class="card mb"><b class="sm" style="color:#B4720F">' + h(tu) + '</b> ' +
        '<span class="tiny dim">' + nhom.length + ' việc</span>' +
        U.tbl(['Mã', 'Việc', 'Mức đo được', 'Dẫn vào đâu'],
          nhom.map(function (x) {
            return [h(x.ma), h(x.ten),
              '<b style="color:' + MAU[x.muc] + '">' + h(NHAN[x.muc]) + '</b>' +
                (x.tut ? '<br><span class="tiny dim">khai ' + h(x.mucKhai) + '</span>' : ''),
              x.dan.length ? '<span class="tiny">' + h(x.dan.join(' · ')) + '</span>'
                : (x.muc === 'NGUOI' ? '<span class="tiny dim">không có chỗ máy nào để dẫn</span>'
                                     : '<b style="color:#BE0E16">không dẫn được</b>')];
          })) + '</div>';
    });

    /* Đường đi tiếp */
    o += U.sec('Còn tự động thêm được gì — xếp theo thứ tự gỡ được nhiều nhất',
      (G.TDH_DUONG_LUAT || {}).xepTheoGoDuoc || '');
    o += '<div class="card mb">' + (G.TDH_DUONG || []).map(function (x) {
      var ngay = /không có gì chặn/i.test(String(x.chan));
      return '<div style="padding:12px 0;border-bottom:1px solid var(--gita-vien-2)">' +
        '<b class="sm"><span style="color:#BE0E16">' + x.uu + '</span> · ' + h(x.viec) + '</b>' +
        (ngay ? ' <span class="tiny up" style="color:#0B6675">LÀM ĐƯỢC NGAY</span>' : '') +
        '<p class="tiny mt" style="line-height:1.75"><b>Nay:</b> ' + h(x.nay) + '</p>' +
        '<p class="tiny" style="line-height:1.75;color:#0B6675"><b>Được gì:</b> ' + h(x.duoc) + '</p>' +
        '<p class="tiny" style="line-height:1.75;color:#B4720F"><b>Chặn ở:</b> ' + h(x.chan) + '</p>' +
        '<p class="tiny mt" style="line-height:1.75">' + h(x.goDuoc) + '</p></div>';
    }).join('') + '</div>';

    /* Bảng tự soi */
    o += U.sec('Bảng tự soi mình', (G.TDH_LUAT || {}).doChuKhongTin || '');
    o += '<div class="card mb">' + U.tbl(['Phép kiểm', 'Canh gì', 'Kết quả'], [
      ['tdSoiThat()', 'Mỗi việc dẫn được chỗ máy làm, và chỗ ấy tồn tại thật',
        (kqT.loi || []).length ? '<b style="color:#BE0E16">' + h((kqT.loi || []).join(' · ')) + '</b>'
          : '<b style="color:#0B6675">' + kqT.tong + ' việc · mọi việc dẫn được</b>'],
      ['tdSoiChan()', 'Gọi thật năm chỗ chặn, và khớp mã với DKH_CAM_MAY',
        (kqC.loi || []).length ? '<b style="color:#BE0E16">' + h((kqC.loi || []).join(' · ')) + '</b>'
          : '<b style="color:#0B6675">' + kqC.conChan + '/' + kqC.so + ' chỗ chặn còn sống</b>'],
      ['tdSoiKhong100()', 'Không được khai 100%, và phải còn việc chỉ người làm được',
        (kqK.loi || []).length ? '<b style="color:#BE0E16">' + h((kqK.loi || []).join(' · ')) + '</b>'
          : '<b style="color:#0B6675">' + kqK.phanTram + '% · dưới trần 95 · còn ' +
            (s.dem.NGUOI || 0) + ' việc chỉ người làm được</b>'],
      ['tdSoiDuong()', 'Mỗi việc còn làm được phải nói chỗ chặn nó',
        (kqD.loi || []).length ? '<b style="color:#BE0E16">' + h((kqD.loi || []).join(' · ')) + '</b>'
          : '<b style="color:#0B6675">' + kqD.so + ' việc · ' + kqD.lamNgay +
            ' việc làm được ngay</b>']
    ]) + '</div>';

    return o;
  };
})();
