/* ═══════════════════════════════════════════════════════════════
   GITA 365 — MÁY CHẠY KHUNG ẢNH VÀ HÌNH DỰNG TỪ KHO

   Kho chuẩn ở kho-goc/data.khung-hinh.js.

   ═══ NỬA MỘT: HÌNH DỰNG TỪ KHO ═══

   Bốn bộ vẽ, không bộ nào biết gì về Coach hay về tầng. Chúng nhận một
   mảng và trả về SVG:

     veThangBac(ds)  n bậc nối nhau, mỗi bậc một màu của chính nó
     veVongTron(ds)  n bước xếp vòng, có mũi tên khép lại
     veCham(ds)      n chấm, đặc là có, rỗng là chưa
     vePheu(ds)      n tầng thu nhỏ dần, mỗi tầng một con số

   Vì sao SVG dựng bằng mã chứ không phải tệp ảnh:
     · không thêm lượt tải nào — bản một tệp chạy ngoại tuyến vẫn có hình
     · phóng to không vỡ, và người lớn tuổi phóng to thật
     · KHÔNG LỆCH ĐƯỢC với chữ, vì nó đọc cùng cái kho chữ đang đọc
     · không có gì để kéo ra màn hình nền

   Điều cuối cùng ấy không phải tiện thể. Một tấm .png trên màn là một
   thứ kéo phát là xong, và cả lớp khoá sao chép ở bản 8.4 coi như hở
   đúng một chỗ.

   ═══ NỬA HAI: KHUNG CHỜ CHỦ HỆ ═══

   Địa chỉ ảnh nằm ở G.nd('khung.<mã>.nguon') — CÙNG lớp với mọi chữ sửa
   được, nên chủ hệ dán vào đúng cái màn đang dùng để sửa chữ, và mọi
   lần dán đều vào nhật ký y như sửa chữ.

   Khung trống chỉ hiện cho người có quyền sửa nội dung. Gia đình không
   thấy. Lý do ở KA_LUAT điều 3.

   ═══ CHỖ DỄ SAI NHẤT: ĐỊA CHỈ ═══

   kaHopLe() từ chối thẳng thay vì cố lọc. javascript: và data: là hai
   đường quen nhất để nhét mã vào một ô tưởng là vô hại, và một bộ lọc
   thì luôn có cách đi vòng — một danh sách CHỈ NHẬN thì không.

   http:// cũng bị từ chối, và đây là chỗ tôi suýt bỏ qua: trang chạy
   trên https mà kéo ảnh http thì trình duyệt chặn TRONG IM LẶNG. Chủ hệ
   dán xong, thấy trống, tưởng mình dán sai. Nói ra ngay lúc dán thì mất
   ba giây; để trình duyệt chặn im thì mất một buổi.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;

(function () {
  var U = G.U, h = U.h;

  /* ═══════════════════════════════════════════════════════
     NỬA MỘT — BỐN BỘ VẼ
     ═══════════════════════════════════════════════════════ */

  /* Cột nội dung rộng khoảng 620px. viewBox rộng 1000 thì mọi thứ bị thu
     0,62 lần — chữ cỡ 14 tụt còn 8,7px, và 8,7px thì người bốn mươi tuổi
     đọc không nổi. Nên vẽ ở khổ 700, gần đúng khổ thật.
     Không đặt max-height: nó đánh nhau với width:100% và làm hình méo. */
  var KHO_RONG = 700;
  function svg(w, hh, ruot, nhan) {
    /* width phải nằm trong KIỂU, không nằm trong thuộc tính. Thuộc tính
       width="100%" cộng với height:auto thì trình duyệt không suy ra
       được khổ, và nó rơi về cỡ mặc định của một thẻ thay thế: 300px.
       Hình vẽ ở khổ 700 co xuống 300 thì chữ 16 còn 6,9px.
       Đặt width trong kiểu thì viewBox làm luôn việc giữ tỉ lệ. */
    return '<svg viewBox="0 0 ' + w + ' ' + hh + '" preserveAspectRatio="xMidYMid meet" ' +
      'style="display:block;width:100%;height:auto" ' +
      'role="img" aria-label="' + h(nhan || '') + '">' + ruot + '</svg>';
  }
  /* Chữ trong SVG vẫn là chữ người nhập được — thoát y như trong HTML. */
  function chu(x, y, t, o) {
    o = o || {};
    return '<text x="' + x + '" y="' + y + '"' +
      ' text-anchor="' + (o.giua ? 'middle' : 'start') + '"' +
      ' font-size="' + (o.co || 11) + '"' +
      ' font-weight="' + (o.dam || 400) + '"' +
      ' fill="' + (o.c || 'currentColor') + '"' +
      (o.mo ? ' opacity="' + o.mo + '"' : '') + '>' + h(t) + '</text>';
  }
  /* Cắt cho vừa bề ngang. SVG không tự xuống dòng — chữ dài tràn ra
     ngoài khung và trên điện thoại thì tràn hẳn khỏi màn. */
  function cat(t, n) {
    t = String(t == null ? '' : t);
    return t.length > n ? t.slice(0, n - 1) + '…' : t;
  }

  /* ── Thang n bậc ── */
  G.veThangBac = function (ds, o) {
    ds = ds || []; o = o || {};
    if (!ds.length) return '';
    var n = ds.length, W = KHO_RONG, cao = 42, day = 26, dem = 11;
    var H = n * (cao + dem) + 22;
    var r = '';
    ds.forEach(function (x, i) {
      var y = H - 22 - (i + 1) * (cao + dem) + dem;
      var rong = 170 + (i * (W - 360) / Math.max(1, n - 1));
      var c = x.c || 'var(--gita)';
      r += '<rect x="60" y="' + y + '" width="' + rong.toFixed(0) + '" height="' + cao +
        '" rx="8" fill="' + c + '" opacity="0.14"/>' +
        '<rect x="60" y="' + y + '" width="4" height="' + cao + '" rx="2" fill="' + c + '"/>' +
        chu(78, y + 26, cat(x.ten, 34), { co: 16, dam: 700, c: c }) +
        chu(46, y + 26, String(i + 1), { co: 15, dam: 700, c: c, giua: true, mo: 0.7 });
      /* Nhãn mức neo PHẢI ở mép khung, không neo theo bề rộng thanh:
         thanh dài nhất cộng nhãn thì vượt khỏi khung và bị cắt mất đuôi —
         chỉ bậc trên cùng bị, nên đọc mã không thấy, phải nhìn màn. */
      if (x.phu) r += '<text x="' + (W - 8) + '" y="' + (y + 26) + '" text-anchor="end" ' +
        'font-size="12.5" fill="currentColor" opacity="0.62">' + h(cat(x.phu, 20)) + '</text>';
      /* Vạch nối bậc dưới lên bậc trên — cái thang phải TRÔNG như nối */
      if (i < n - 1)
        r += '<line x1="62" y1="' + y + '" x2="62" y2="' + (y - dem) +
          '" stroke="' + c + '" stroke-width="2" opacity="0.4"/>';
      void day;
    });
    return svg(W, H, r, o.nhan || 'Thang ' + n + ' bậc');
  };

  /* ── Vòng n bước ──
     Vẽ thành VÒNG chứ không thành hàng, vì đó chính là điều đang phải
     chứng minh: bước cuối quay về bước đầu. Một danh sách xếp hàng
     ngang thì mắt đọc nó là một cái thang, dù chữ có nói gì. */
  G.veVongTron = function (ds, o) {
    ds = ds || []; o = o || {};
    if (!ds.length) return '';
    /* Khung RỘNG hơn cao, không vuông. Vuông thì nhãn của bước bên trái
       và bên phải thò ra ngoài mép và bị cắt mất đuôi — chỗ hỏng chỉ lộ
       ra ở đúng hai bước ấy, nên đọc mã không thấy, phải nhìn màn. */
    var n = ds.length, W = 700, H = 580, tx = W / 2, ty = H / 2, R = 190, r = '';
    ds.forEach(function (x, i) {
      var g = (i / n) * 2 * Math.PI - Math.PI / 2;
      var cx = tx + R * Math.cos(g), cy = ty + R * Math.sin(g);
      var c = x.c || 'var(--gita)';
      var dong = x.dongVong === true, br = dong ? 26 : 22;
      r += '<circle cx="' + cx.toFixed(1) + '" cy="' + cy.toFixed(1) + '" r="' + br +
        '" fill="' + c + '" opacity="' + (dong ? 0.3 : 0.16) + '"/>' +
        '<circle cx="' + cx.toFixed(1) + '" cy="' + cy.toFixed(1) + '" r="' + br +
        '" fill="none" stroke="' + c + '" stroke-width="' + (dong ? 2 : 1.2) + '" opacity="0.8"/>' +
        chu(cx, cy + 5, x.nhan || String(i + 1), { co: 14, dam: 700, c: c, giua: true });
      /* Neo chữ theo góc: bước bên phải thì chữ chạy sang phải, bên trái
         thì chạy sang trái. Neo giữa hết thì hai bên đè lên vòng tròn. */
      var co = Math.cos(g), neo = co > 0.3 ? 'start' : co < -0.3 ? 'end' : 'middle';
      var day = br + (neo === 'middle' ? 22 : 10);
      var lx = cx + (co > 0.3 ? day : co < -0.3 ? -day : 0);
      var ly = cy + (Math.abs(co) <= 0.3 ? (Math.sin(g) < 0 ? -(br + 12) : br + 20) : 4);
      r += '<text x="' + lx.toFixed(1) + '" y="' + ly.toFixed(1) + '" text-anchor="' + neo + '" ' +
        'font-size="12.5" fill="currentColor" opacity="0.8">' + h(cat(x.ten, 17)) + '</text>';
    });
    /* Vòng nền vẽ NÉT ĐỨT: nó không khép bằng thủ tục mà khép bằng một
       người, và nét đứt nói đúng điều ấy. Mũi tên ở đỉnh chỉ chiều chảy. */
    r = '<circle cx="' + tx + '" cy="' + ty + '" r="' + R +
      '" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.18" ' +
      'stroke-dasharray="6 7"/>' + r;
    r += '<path d="M' + (tx - 12) + ' ' + (ty - 30) + ' L' + tx + ' ' + (ty - 44) +
      ' L' + (tx + 12) + ' ' + (ty - 30) + '" fill="none" stroke="currentColor" ' +
      'stroke-width="2" opacity="0.5" stroke-linecap="round" stroke-linejoin="round"/>';
    r += chu(tx, ty - 4, o.giua || '', { co: 16, dam: 700, giua: true, mo: 0.85 });
    r += chu(tx, ty + 18, o.giuaPhu || '', { co: 12, giua: true, mo: 0.58 });
    return svg(W, H, r, o.nhan || 'Vòng ' + n + ' bước');
  };

  /* ── n chấm: đặc là có, rỗng là chưa ── */
  G.veCham = function (ds, o) {
    ds = ds || []; o = o || {};
    if (!ds.length) return '';
    var n = ds.length, W = KHO_RONG, H = 104, b = W / n, r = '';
    ds.forEach(function (x, i) {
      var cx = b * i + b / 2, c = x.co ? (o.cCo || '#0B7350') : (o.cChua || '#B4720F');
      r += x.co
        ? '<circle cx="' + cx.toFixed(1) + '" cy="26" r="15" fill="' + c + '" opacity="0.9"/>' +
          '<path d="M' + (cx - 6).toFixed(1) + ' 26 l4 4.2 l7.2 -8.2" stroke="#fff" stroke-width="2.4" ' +
          'fill="none" stroke-linecap="round" stroke-linejoin="round"/>'
        : '<circle cx="' + cx.toFixed(1) + '" cy="26" r="15" fill="none" stroke="' + c +
          '" stroke-width="2.2" stroke-dasharray="3.5 3.5" opacity="0.95"/>';
      r += '<text x="' + cx.toFixed(1) + '" y="62" text-anchor="middle" font-size="12" ' +
        'font-weight="' + (x.co ? 700 : 400) + '" fill="' + c + '">' + h(cat(x.ten, 13)) + '</text>';
      if (x.phu)
        r += '<text x="' + cx.toFixed(1) + '" y="80" text-anchor="middle" font-size="10.5" ' +
          'fill="currentColor" opacity="0.55">' + h(cat(x.phu, 14)) + '</text>';
    });
    return svg(W, H, r, o.nhan || n + ' mục');
  };

  /* ── Phễu n tầng ── */
  G.vePheu = function (ds, o) {
    ds = ds || []; o = o || {};
    if (!ds.length) return '';
    var n = ds.length, W = KHO_RONG, cao = 72, dem = 13, H = n * (cao + dem) + 8, r = '';
    ds.forEach(function (x, i) {
      var y = i * (cao + dem);
      var rong = W - 90 - i * ((W - 300) / Math.max(1, n - 1));
      var x0 = (W - rong) / 2, c = x.c || 'var(--gita)';
      r += '<rect x="' + x0.toFixed(0) + '" y="' + y + '" width="' + rong.toFixed(0) +
        '" height="' + cao + '" rx="10" fill="' + c + '" opacity="0.13"/>' +
        '<rect x="' + x0.toFixed(0) + '" y="' + y + '" width="' + rong.toFixed(0) +
        '" height="' + cao + '" rx="10" fill="none" stroke="' + c + '" stroke-width="1.2" opacity="0.55"/>' +
        chu(W / 2, y + 32, String(x.so), { co: 26, dam: 800, c: c, giua: true }) +
        chu(W / 2, y + 53, cat(x.ten, 40), { co: 12.5, giua: true, mo: 0.74 });
      if (i < n - 1)
        r += '<path d="M' + (W / 2) + ' ' + (y + cao + 1) + ' l0 ' + (dem - 4) + '" stroke="' + c +
          '" stroke-width="2" opacity="0.45" stroke-linecap="round"/>';
    });
    return svg(W, H, r, o.nhan || 'Phễu ' + n + ' tầng');
  };

  /* ═══════════════════════════════════════════════════════
     BẬC THANG HÀNH ĐỘNG — MỖI BẬC MỘT BIỂU TƯỢNG THÀNH CÔNG
     ═══════════════════════════════════════════════════════

     Đây KHÔNG phải một cái thang nữa. Nó là cái MẶT của một máy đã có
     từ bản 9.21 mà chưa màn nào dùng: htDuong() trả về nhà mình đang ở
     bậc nào và ĐÚNG MỘT việc kế tiếp. Máy chạy được ba bản rồi, chỉ
     thiếu chỗ để nhìn.

     LUẬT ĐƠN GIẢN HOÁ: ĐÚNG MỘT BẬC HIỆN VIỆC PHẢI LÀM

     Bậc đã xong hiện BIỂU TƯỢNG đã lấy được, không hiện lại việc.
     Bậc đang đứng hiện việc — đúng một việc, viết to.
     Bậc chưa mở chỉ hiện tên biểu tượng, mờ đi, KHÔNG hiện việc.

     Vì sao bậc chưa mở phải giấu việc: đó chính là chỗ một màn "từng
     bước" biến thành một danh sách năm việc. Luật này đã có trong kho
     từ bản 9.21 dưới dạng câu — "người mệt đọc một việc thì làm, đọc
     ba việc thì đóng máy" — nay nó thành hàm, và btSoiMotViec() đỏ
     nếu có hai bậc cùng hiện việc.

     Biểu tượng lấy thẳng từ HT_TANG.daQuy, việc lấy từ HT_TANG.thuThach.
     Không kho mới, không bảng thứ hai: cùng một luật ghi hai chỗ là hai
     bản sẽ có ngày lệch nhau. */

  /* Viên đá — vẽ bằng nét, không bằng tệp. Có ba dạng theo trạng thái,
     và ba dạng ấy phân biệt được cả khi in đen trắng lẫn khi người xem
     không phân biệt được màu: đặc có dấu tích · viền đậm · viền đứt. */
  function daQuy(c, tt) {
    var d = 'M12 2 L21 9 L12 22 L3 9 Z M3 9 H21 M12 2 L8 9 L12 22 M12 2 L16 9 L12 22';
    if (tt === 'xong')
      return '<svg viewBox="0 0 24 24" class="bt-da" aria-hidden="true">' +
        '<path d="M12 2 L21 9 L12 22 L3 9 Z" fill="' + c + '" opacity="0.92"/>' +
        '<path d="M7.5 11.5 l3 3 l6 -6.5" fill="none" stroke="#fff" stroke-width="2.2" ' +
        'stroke-linecap="round" stroke-linejoin="round"/></svg>';
    if (tt === 'dangO')
      return '<svg viewBox="0 0 24 24" class="bt-da" aria-hidden="true">' +
        '<path d="M12 2 L21 9 L12 22 L3 9 Z" fill="' + c + '" opacity="0.16"/>' +
        '<path d="' + d + '" fill="none" stroke="' + c + '" stroke-width="1.6" ' +
        'stroke-linejoin="round"/></svg>';
    return '<svg viewBox="0 0 24 24" class="bt-da" aria-hidden="true">' +
      '<path d="M12 2 L21 9 L12 22 L3 9 Z" fill="none" stroke="currentColor" ' +
      'stroke-width="1.4" stroke-dasharray="3 3" opacity="0.55" stroke-linejoin="round"/></svg>';
  }

  var BT_NHAN = { xong: 'ĐÃ LẤY ĐƯỢC', dangO: 'ĐANG Ở ĐÂY', chuaMo: 'CHƯA MỞ' };

  G.veBacThang = function (ds, o) {
    ds = ds || []; o = o || {};
    if (!ds.length) return '';
    return '<ol class="bt">' + ds.map(function (x) {
      var tt = x.trangThai || 'chuaMo', c = x.c || 'var(--gita)';
      var hienViec = tt === 'dangO' && x.viec;
      return '<li class="bt-b bt-' + tt + '"' +
        (tt === 'dangO' ? ' aria-current="step"' : '') +
        ' style="--bt-c:' + c + '">' +
        '<div class="bt-cot">' + daQuy(c, tt) +
          (x.so ? '<span class="bt-so">' + h(String(x.so)) + '</span>' : '') + '</div>' +
        '<div class="bt-ruot">' +
          '<div class="bt-dinh"><b class="bt-ten">' + h(x.bieuTuong || x.ten || '') + '</b>' +
            '<span class="bt-tt">' + h(BT_NHAN[tt] || '') + '</span></div>' +
          (x.ten && x.bieuTuong ? '<p class="bt-phu">' + h(x.ten) + '</p>' : '') +
          /* Chỉ bậc đang đứng mới hiện việc. Bậc chưa mở mà hiện việc là
             chỗ màn "từng bước" biến thành danh sách năm việc. */
          (hienViec ? '<p class="bt-viec">' + h(x.viec) + '</p>' : '') +
          (hienViec && x.kho ? '<p class="bt-kho">Chỗ khó nhất: ' + h(x.kho) + '</p>' : '') +
        '</div></li>';
    }).join('') + '</ol>' +
      (o.y ? '<p class="bt-y">' + h(o.y) + '</p>' : '');
  };

  /* Đúng MỘT bậc được hiện việc. Hai bậc cùng hiện là thang đã thành
     danh sách, và danh sách thì người mệt đóng máy. */
  G.btSoiMotViec = function (ds) {
    var loi = [], dangO = (ds || []).filter(function (x) { return x.trangThai === 'dangO'; });
    if (dangO.length > 1) loi.push(dangO.length + ' bậc cùng đang đứng, phải đúng 1');
    (ds || []).forEach(function (x) {
      if (x.trangThai !== 'dangO' && x.viecHien) loi.push('bậc ' + x.so + ':chưa tới mà đã hiện việc');
      if (x.trangThai === 'dangO' && !x.viec) loi.push('bậc ' + x.so + ':đang đứng mà không có việc');
      if (!x.bieuTuong) loi.push('bậc ' + x.so + ':không có biểu tượng thành công');
    });
    return loi;
  };

  /* Dựng thang của MỘT nhà từ số tối đã ghi. Đọc thẳng HT_TANG và
     htDuong() — không nhận vào một bảng chép tay nào. */
  G.btThangNha = function (soToi) {
    var tangs = G.HT_TANG || [];
    if (!tangs.length) return null;
    var d = typeof G.htDuong === 'function' ? G.htDuong(soToi) : null;
    var dang = d && !d.chuaDo ? d.tang : null;
    var i = -1;
    tangs.forEach(function (t, k) { if (t.ma === dang) i = k; });
    return {
      chuaDo: !d || !!d.chuaDo,
      y: d && d.chuaDo ? d.y : (d && d.y) || '',
      bac: tangs.map(function (t, k) {
        var tt = i < 0 ? (k === 0 ? 'dangO' : 'chuaMo')
               : k < i ? 'xong' : k === i ? 'dangO' : 'chuaMo';
        return { so: t.so, c: t.c, bieuTuong: t.daQuy, ten: t.ten || '',
          trangThai: tt,
          viec: tt === 'dangO' ? t.thuThach : '',
          kho: tt === 'dangO' ? t.khoNhat : '' };
      })
    };
  };

  /* Bọc một hình kèm lời chú. Hình không có lời chú thì người xem tự
     đoán ý, và đoán sai thì hình có hại hơn không có hình. */
  G.hinhCard = function (svgChuoi, nhan, y) {
    if (!svgChuoi) return '';
    return '<div class="hinh-kho">' +
      (nhan ? '<div class="hinh-nhan">' + h(nhan) + '</div>' : '') +
      '<div class="hinh-ve">' + svgChuoi + '</div>' +
      (y ? '<p class="hinh-y">' + h(y) + '</p>' : '') + '</div>';
  };

  /* ═══════════════════════════════════════════════════════
     NỬA HAI — KHUNG CHỜ CHỦ HỆ
     ═══════════════════════════════════════════════════════ */

  G.KA_KHOA = function (ma) { return 'khung.' + ma + '.nguon'; };

  /* CHỈ NHẬN, không lọc. Một bộ lọc thì luôn có cách đi vòng. */
  G.kaHopLe = function (d) {
    d = String(d == null ? '' : d).trim();
    if (!d) return { ok: false, trong: true };
    var at = G.KA_ANTOAN || {};
    var xau = (at.tuChoi || []).filter(function (x) {
      return d.slice(0, x.length).toLowerCase() === x;
    })[0];
    if (xau) return { ok: false, loi: 'Không nhận địa chỉ bắt đầu bằng ' + xau +
      (xau === 'http://' ? '. ' + (at.viSaoTuChoiHttp || '') : '.') };
    var nhan = (at.chiNhan || []).some(function (x) { return d.slice(0, x.length) === x; });
    if (!nhan) return { ok: false, loi: 'Chỉ nhận địa chỉ bắt đầu bằng ' +
      (at.chiNhan || []).join(' hoặc ') + '.' };
    return { ok: true, d: d };
  };

  G.kaCua = function (man, cho) {
    return (G.KA_CHO || []).filter(function (k) {
      return k.man === man && (cho === undefined || k.cho === cho);
    });
  };
  G.kaNguon = function (ma) {
    return typeof G.nd === 'function' ? G.nd(G.KA_KHOA(ma), '') : '';
  };
  G.kaTyLe = function (ma) {
    var t = (G.KA_TY || []).filter(function (x) { return x.ma === ma; })[0];
    return t ? t.so : 56.25;
  };
  function laChuHe() { return typeof G.can === 'function' && G.can('sua_noi_dung'); }
  function biKhoa() { return typeof G.BI_KHOA_CHEP === 'function' && G.BI_KHOA_CHEP(); }

  /* Ảnh và video chịu ĐÚNG luật của chữ. Đưa ảnh vào mà quên khoá là mở
     một cửa sau ngay cạnh cái cửa đã khoá kỹ ở bản 8.4 — và cửa sau ấy
     dễ đi hơn cửa trước, vì kéo một tấm ảnh ra màn hình nền là xong. */
  function chan() {
    return biKhoa() ? ' draggable="false" oncontextmenu="return false"' +
      ' style="-webkit-user-drag:none;user-select:none;pointer-events:none"' : '';
  }

  /* Vẽ MỘT khung. Trống thì chỉ chủ hệ thấy. */
  G.kaVe = function (k) {
    if (!k) return '';
    var d = G.kaNguon(k.ma), kq = G.kaHopLe(d);
    var ty = G.kaTyLe(k.ty);

    if (!kq.ok) {
      /* Gia đình không thấy khung trống — KA_LUAT điều 3 */
      if (!laChuHe()) return '';
      var loai = (G.KA_LOAI || []).filter(function (x) { return x.ma === k.loai; })[0] || {};
      return '<div class="ka-cho" style="--ka-ty:' + ty + '%">' +
        '<div class="ka-o"><div class="ka-giua">' +
        U.ic(loai.ic || 'image', 'w-4 h-4') +
        '<b>' + h(k.ten) + '</b>' +
        '<span class="ka-ky">' + h(loai.ten || k.loai) + ' · ' + h(k.ty) + ' · ' + h(k.vuaMat || '') + '</span>' +
        '</div></div>' +
        '<p class="ka-brief"><b>Cần gì:</b> ' + h(k.brief) + '</p>' +
        '<p class="ka-vi"><b>Vì sao ở đây:</b> ' + h(k.viSaoODay) + '</p>' +
        (kq.loi ? '<p class="ka-loi">Địa chỉ đang dán không dùng được — ' + h(kq.loi) + '</p>' : '') +
        '<p class="ka-khoa">Dán địa chỉ ở màn <b>Sửa nội dung hiển thị</b>, khoá <code>' +
        h(G.KA_KHOA(k.ma)) + '</code></p></div>';
    }

    var trong;
    if (k.loai === 'video') {
      trong = '<iframe src="' + h(kq.d) + '" title="' + h(k.ten) + '" loading="lazy" ' +
        'allow="accelerometer; encrypted-media; picture-in-picture" ' +
        'referrerpolicy="no-referrer" sandbox="allow-scripts allow-same-origin allow-presentation" ' +
        'frameborder="0" allowfullscreen></iframe>';
    } else {
      trong = '<img src="' + h(kq.d) + '" alt="' + h(k.ten) + '" loading="lazy"' + chan() + '>';
    }
    return '<figure class="ka-khung ka-' + h(k.loai) + '" style="--ka-ty:' + ty + '%">' +
      '<div class="ka-o">' + trong + '</div>' +
      (k.ten ? '<figcaption>' + h(k.ten) + '</figcaption>' : '') + '</figure>';
  };

  /* Màn hình gọi hàm này ở đúng mốc. Không dòng nào khai thì không dựng
     gì cả — thêm một chỗ đặt là thêm một dòng ở kho, không sửa mã. */
  G.kaKhung = function (man, cho) {
    return G.kaCua(man, cho).map(G.kaVe).join('');
  };

  /* ═══════════ SOI ═══════════ */
  G.kaSoi = function () {
    var loi = [], ty = {}, loai = {};
    (G.KA_TY || []).forEach(function (x) { ty[x.ma] = 1; });
    (G.KA_LOAI || []).forEach(function (x) { loai[x.ma] = 1; });
    var ma = {};
    (G.KA_CHO || []).forEach(function (k) {
      if (ma[k.ma]) loi.push(k.ma + ':mã dùng hai lần');
      ma[k.ma] = 1;
      if (!ty[k.ty]) loi.push(k.ma + ':tỉ lệ "' + k.ty + '" không có trong bảng');
      if (!loai[k.loai]) loi.push(k.ma + ':loại "' + k.loai + '" không có trong bảng');
      if (!k.brief) loi.push(k.ma + ':không nói cần ảnh gì');
      if (!k.vuaMat) loi.push(k.ma + ':không nói cỡ bao nhiêu');
      /* Khung không có lý do sẽ được lấp bằng ảnh mua sẵn, và ảnh mua
         sẵn làm mất tin cả màn chứ không riêng chỗ ấy. */
      if (!k.viSaoODay) loi.push(k.ma + ':không nói vì sao ở đó');
      /* Thẻ trích phải dọc, dải phải mỏng — sai tỉ lệ thì bố cục vỡ */
      if (k.loai === 'the' && k.ty !== '4:5') loi.push(k.ma + ':thẻ trích phải tỉ lệ 4:5');
      if (k.loai === 'dai' && k.ty !== '3:1') loi.push(k.ma + ':dải ngang phải tỉ lệ 3:1');
      /* Màn không có thật thì khung ấy không bao giờ hiện ra, và không
         ai biết — nó chỉ nằm đó chiếm một dòng trong bảng chờ điền. */
      if (typeof G.manCoThat === 'function' && !G.manCoThat(k.man))
        loi.push(k.ma + ':màn "' + k.man + '" không có thật');
    });
    return loi;
  };

  /* Đếm đã điền bao nhiêu, và địa chỉ nào đang hỏng. */
  G.kaDaDien = function () {
    var xong = [], trong = [], hong = [];
    (G.KA_CHO || []).forEach(function (k) {
      var kq = G.kaHopLe(G.kaNguon(k.ma));
      if (kq.ok) xong.push(k.ma);
      else if (kq.trong) trong.push(k.ma);
      else hong.push(k.ma + ':' + kq.loi);
    });
    return { xong: xong, trong: trong, hong: hong,
      tong: (G.KA_CHO || []).length };
  };
})();
