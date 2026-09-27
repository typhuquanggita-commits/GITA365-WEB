/* ═══════════════════════════════════════════════════════════════
   GITA 365 — MÁY CHẠY SỔ TAY TƯ VẤN

   Kho chuẩn ở kho-goc/data.so-tay-tu-van.js. Máy này làm bốn việc mà
   một bảng chữ không làm được:

   1. tvNhanKhach() — TỪ CHỐI. Bảy câu sàng lọc chỉ có nghĩa khi có hàm
      chặn đi kèm; không có hàm thì sáu tháng sau ai cũng "đã sàng lọc
      rồi" và không ai từ chối nhà nào. Cùng một lý do với ddNhanThem().

   2. tvLoaiTuChoi() — phân loại từ chối THẬT hay GIẢ. Đây là ý sắc
      nhất của cả bộ sổ tay: một lời từ chối là giả khi trả lời xong mà
      quyết định vẫn không đổi. Cãi thắng một lời từ chối giả rồi tưởng
      mình đã chốt là cách mất đơn phổ biến nhất của nghề này.

   3. tvTranTuVan() và tvSoiCayMe() — ĐỌC TRẦN, không ghi số. Sổ tay
      viết một người mười lăm nhà, và viết một tư vấn cộng mười Cây Mẹ
      bằng ba trăm nhà. Trần thật là năm và ba. Mười Cây Mẹ là ba mươi
      nhà — lệch mười lần.

      Đây là lần thứ TƯ một tỉ lệ được viết cứng lệch khỏi trần đã ép.
      Nên lần này không có con số nào trong kho để mà lệch.

   4. tvSoiSo15() — mười lăm con số tháng, số nào cũng khai nguồn. Số
      không có nguồn thì khai chưa đo được. Một bảng thành tích tự điền
      là một bảng luôn đẹp, và một bảng luôn đẹp thì không ai dùng nó
      để sửa gì.

   VÌ SAO MÁY QUÉT NGÔN TỪ DÙNG LẠI CỦA BỨC TRANH

   G.hmQuetTuCam() đã có sẵn và đã có chuẩn từ cấm. Sổ tay tư vấn có
   hàng chục câu NÓI VỚI NHÀ, và chúng đi qua đúng máy quét ấy. Dựng
   máy quét thứ hai thì rồi sẽ có ngày hai máy lệch nhau, và lúc ấy
   chuẩn ngôn từ của Học viện có hai bản.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;
G.VIEWS = G.VIEWS || {};

(function () {
  var U = G.U, h = U.h;

  /* ─── Đọc một bản ghi theo đường 'KHO.MA' ─── */
  function banGhi(duong) {
    var p = String(duong || '').split('.');
    var ds = G[p[0]];
    if (!Array.isArray(ds)) return undefined;
    return ds.filter(function (x) { return x.ma === p[1]; })[0];
  }

  /* ═══════════ TRẦN — ĐỌC, KHÔNG GHI ═══════════ */

  /* Một người tư vấn ký thêm được bao nhiêu nhà thì phụ thuộc số Đồng
     Hành đang có, không phụ thuộc sức bán. Nhà đã ký mà không có người
     đi cùng là nhà đã trả tiền cho một chỗ trống. */
  G.tvTranTuVan = function (soNhaDaKy, soDongHanh) {
    var tran = G.ddTranCua ? G.ddTranCua('DH') : 0;
    if (!tran) return null;
    var nha = Math.max(0, Number(soNhaDaKy) || 0);
    var nguoi = Math.max(0, Number(soDongHanh) || 0);
    var doNoi = nguoi * tran;
    if (nha > doNoi)
      return { ok: false, tran: tran, doNoi: doNoi, nha: nha,
        can: Math.ceil(nha / tran),
        loi: nguoi + ' Đồng Hành đỡ được ' + doNoi + ' nhà, mà đang có ' + nha +
          ' nhà đã ký. Thiếu người thì nhận CHẬM lại, không giao dày lên.' };
    return { ok: true, tran: tran, doNoi: doNoi, nha: nha, con: doNoi - nha };
  };

  /* Sổ tay viết: một tư vấn cộng mười Cây Mẹ bằng ba trăm nhà.
     Trần Cây Mẹ là ba. Mười nhân ba là ba mươi. */
  G.tvSoiCayMe = function (soCayMe) {
    var tran = G.ddTranCua ? G.ddTranCua('CM') : 0;
    if (!tran) return null;
    var n = Math.max(0, Number(soCayMe) || 0);
    return { tran: tran, soCayMe: n, that: n * tran,
      banGocGhi: 300,
      lech: n === 10 ? (300 / (n * tran)) : null };
  };

  /* Không kho nào của lớp này được ghi một con số tỉ lệ người-trên-nhà.
     Bốn tài liệu đã ghi bốn con số; con số thứ năm sẽ tới từ tài liệu
     thứ năm nếu chỗ này để hở. */
  G.tvSoiTranGhiCung = function () {
    var pham = [];
    var re = /(mười lăm|15|mười|10)\s*(nhà|gia đình)/i;
    [['TV_TRAN.nhipTuVan', (G.TV_TRAN || {}).nhipTuVan],
     ['TV_TRAN.luatVao', (G.TV_TRAN || {}).luatVao]].forEach(function (c) {
      if (re.test(String(c[1] || ''))) pham.push(c[0]);
    });
    (G.TV_GIOITHIEU || []).forEach(function (g) {
      if (re.test(String(g.vi || ''))) pham.push('TV_GIOITHIEU.' + g.ma);
    });
    return pham;
  };

  /* ═══════════ SÀNG LỌC — HÀM TỪ CHỐI ═══════════
     `traLoi` là sổ trả lời dạng { SL1: true, SL3: false, ... } trong đó
     true nghĩa là ĐÃ GẶP cờ đỏ của câu ấy. Thiếu sổ thì hàm nói chưa
     sàng lọc được, KHÔNG nói "nhận được". */
  G.tvNhanKhach = function (traLoi) {
    var ds = G.TV_SANGLOC || [];
    if (!ds.length) return { ok: false, loi: 'Chưa có bộ sàng lọc.' };
    if (!traLoi || typeof traLoi !== 'object')
      return { ok: false, chuaLoc: true,
        loi: 'Chưa có sổ trả lời bảy câu sàng lọc. Chưa lọc thì chưa nhận.' };
    var chan = ds.filter(function (s) { return s.chan && traLoi[s.ma] === true; });
    var luuY = ds.filter(function (s) { return !s.chan && traLoi[s.ma] === true; });
    var thieu = ds.filter(function (s) { return traLoi[s.ma] === undefined; });
    if (thieu.length)
      return { ok: false, chuaLoc: true, thieu: thieu.map(function (s) { return s.ma; }),
        loi: 'Còn ' + thieu.length + ' câu chưa hỏi. Chưa hỏi hết thì chưa nhận.' };
    if (chan.length)
      return { ok: false, chan: chan.map(function (s) { return s.ma; }),
        lam: chan.map(function (s) { return s.neuThe; }),
        loi: 'Cờ đỏ ở ' + chan.map(function (s) { return s.ma; }).join(' · ') +
          '. Đây là cách chốt số tám — chốt bằng cách DỪNG, không phải cách thua.' };
    return { ok: true, luuY: luuY.map(function (s) { return s.ma; }) };
  };

  /* ═══════════ TỪ CHỐI THẬT HAY GIẢ ═══════════
     `gonThiDoi` là câu trả lời cho phép thử: gỡ được chỗ này thì nhà
     mình bắt đầu chứ? true = thật · false = giả · thiếu = chưa thử. */
  G.tvLoaiTuChoi = function (ma, gonThiDoi) {
    var tc = (G.TV_TUCHOI || []).filter(function (x) { return x.ma === ma; })[0];
    if (!tc) return null;
    if (gonThiDoi === undefined)
      return { ma: ma, khi: tc.khi, chuaThu: true, thuBang: tc.thuThat,
        y: 'Chưa thử thì chưa biết. Trả lời một lời từ chối chưa phân loại là trả lời cho một câu chưa chắc được hỏi.' };
    var loai = gonThiDoi === true ? 'that' : 'gia';
    return { ma: ma, khi: tc.khi, loai: loai, dap: tc.dap,
      khopKho: loai === tc.loai,
      lam: loai === 'that'
        ? 'Trả lời theo ba đường ở cột đáp. Đường thứ ba là đường DỪNG.'
        : 'KHÔNG trả lời nó. Quay lại tầng hai của câu hỏi và tìm điều chưa nói.' };
  };

  G.tvSoiTuChoi = function () {
    var loi = [], ds = G.TV_TUCHOI || [];
    if (ds.length !== 30) loi.push('số tình huống=' + ds.length);
    ds.forEach(function (t) {
      if (t.loai !== 'that' && t.loai !== 'gia') loi.push(t.ma + ':loại lạ');
      if (!Array.isArray(t.dap) || t.dap.length !== 3) loi.push(t.ma + ':thiếu đường đáp');
    });
    /* Loại GIẢ mà không có câu thử thì không phân loại được bằng gì.
       Loại THẬT thì có thể không cần thử — câu hỏi tự nó đã rõ. */
    ds.filter(function (t) { return t.loai === 'gia'; }).forEach(function (t) {
      if (!t.thuThat || t.thuThat === '—') loi.push(t.ma + ':giả mà không có câu thử');
    });
    return loi;
  };

  /* ═══════════ NĂM NHỊP MƯỜI PHÚT ═══════════ */
  G.tvSoiNhip5 = function () {
    var ds = G.TV_NHIP5 || [], loi = [];
    if (ds.length !== 5) loi.push('số nhịp=' + ds.length);
    var tong = ds.reduce(function (a, n) { return a + (Number(n.phut) || 0); }, 0);
    if (tong !== 10) loi.push('cộng ' + tong + ' phút, khai mười');
    ds.forEach(function (n) { if (!n.noi || !n.cam) loi.push('nhịp ' + n.nhip + ':thiếu cột'); });
    return loi;
  };

  /* ═══════════ HOÀN TIỀN ĐỌC HP_TANG ═══════════
     Không kho nào của lớp này được ghi một tỉ lệ hoàn. Sổ tay ghi bảy
     mươi phần trăm; HP_TANG có chính sách riêng cho từng chặng. Một
     lời hứa hoàn tiền nói miệng mà hợp đồng không giữ là chỗ Học viện
     thua kiện, và thua đúng. */
  G.tvHoanCua = function (tang) {
    var t = (G.HP_TANG || []).filter(function (x) { return x.tang === tang; })[0];
    if (!t) return null;
    return { tang: t.tang, ten: t.ten, hoan: t.hoan, nhip: t.nhip };
  };

  G.tvSoiHoan = function () {
    var loi = [], hh = G.TV_HOAN || {};
    if (hh.theoHP !== true) loi.push('TV_HOAN chưa khai đọc HP_TANG');
    var re = /(bảy mươi|70)\s*(phần trăm|%)/i;
    ['lam', 'vi'].forEach(function (k) { if (re.test(String(hh[k] || ''))) loi.push('TV_HOAN.' + k + ':ghi tỉ lệ'); });
    (G.TV_TUCHOI || []).forEach(function (t) {
      (t.dap || []).forEach(function (d, i) {
        if (re.test(String(d))) loi.push(t.ma + '.dap' + (i + 1) + ':ghi tỉ lệ hoàn');
      });
    });
    /* Và chặng nào cũng có cột hoàn để mà đọc */
    (G.HP_TANG || []).forEach(function (t) { if (!t.hoan) loi.push(t.tang + ':HP_TANG thiếu cột hoàn'); });
    return loi;
  };

  /* ═══════════ KHÔNG GIÁ NÀO Ở ĐÂY ═══════════
     Quét những kho người tư vấn ĐỌC RA TRƯỚC MẶT KHÁCH. TV_CHOCHU cố ý
     nằm ngoài: nó ghi lại nguyên văn đề nghị của tài liệu để chủ hệ
     quyết, và ghi lại một đề nghị khác hẳn với báo nó thành giá. */
  G.tvSoiGia = function () {
    /* Chỉ nhận đơn vị tiền viết ĐỦ CHỮ. Bản đầu bắt cả "tr" và "k" viết
       tắt, và \b của JavaScript tính theo bảng chữ ASCII — nên "LR5, kể
       cả khi..." khớp thành "5 k", và một câu dặn về đạo đức bị báo là
       một câu báo giá. Một phép kiểm đỏ oan vài lần là một phép kiểm bị
       tắt, nên thà bỏ sót chữ viết tắt còn hơn. */
    var pham = [], re = /\d[\d.,]*\s*(triệu|nghìn|ngàn|đồng)/i;
    function quet(nhan, s) { if (re.test(String(s || ''))) pham.push(nhan); }
    (G.TV_PHANKHUC || []).forEach(function (p) { quet('TV_PHANKHUC.' + p.ma, p.cauMo); });
    (G.TV_NHIP5 || []).forEach(function (n) { quet('TV_NHIP5.' + n.nhip, n.noi); });
    (G.TV_TUCHOI || []).forEach(function (t) {
      (t.dap || []).forEach(function (d, i) { quet(t.ma + '.dap' + (i + 1), d); });
    });
    (G.TV_CHOT || []).forEach(function (c) { quet('TV_CHOT.' + c.ma, c.lam); });
    return pham;
  };

  /* ═══════════ MƯỜI LĂM CON SỐ THÁNG ═══════════ */
  G.tvSoiSo15 = function () {
    var ds = G.TV_SO15 || [], loi = [];
    if (ds.length !== 15) loi.push('số ô=' + ds.length);
    ds.forEach(function (s) {
      if (s.chuaDo) {
        if (!s.thieu) loi.push(s.no + ':khai chưa đo mà không nói thiếu gì');
        if (s.nguon) loi.push(s.no + ':vừa chưa đo vừa có nguồn');
        return;
      }
      if (!s.nguon) { loi.push(s.no + ':không nguồn, không khai chưa đo'); return; }
      if (G[s.nguon] === undefined) loi.push(s.no + '→' + s.nguon + ':không có thật');
    });
    return loi;
  };

  G.tvSoChuaDo = function () {
    return (G.TV_SO15 || []).filter(function (s) { return s.chuaDo; });
  };

  /* ═══════════ PHÂN KHÚC · LẰN RANH · CHỜ CHỦ HỆ ═══════════ */
  G.tvSoiPhanKhuc = function () {
    var tang = (G.HP_TANG || []).map(function (t) { return t.tang; });
    return (G.TV_PHANKHUC || []).filter(function (p) {
      return !p.hopTang || tang.indexOf(p.hopTang) < 0 || !p.cauMo || !p.khongHop;
    }).map(function (p) { return p.ma + '→' + (p.hopTang || 'trống'); });
  };

  /* Mỗi lằn ranh phải trỏ vào một CỬA BÁO có thật. Lằn ranh không có
     cửa báo là lời tự hứa, và lời tự hứa thì chỉ người hứa biết mình
     đã phá. */
  G.tvSoiLanRanh = function () {
    return (G.TV_LANRANH || []).filter(function (r) {
      return !r.khong || !r.viDu || !r.phat || !r.bao || banGhi(r.bao) === undefined;
    }).map(function (r) { return r.ma + '→' + (r.bao || 'không cửa báo'); });
  };

  G.tvChoChu = function () {
    return (G.TV_CHOCHU || []).filter(function (c) {
      return c.t && c.banGoc && c.lenhDung && c.canGi;
    });
  };

  /* ═══════════ NGÔN TỪ ═══════════
     Chỉ quét những câu NÓI VỚI NHÀ. Cột hướng dẫn cho người tư vấn thì
     không quét — luật ngôn từ là luật của lời nói với gia đình, không
     phải luật của sổ tay nội bộ. */
  G.tvLoiNoiVoiNha = function () {
    var ds = [];
    (G.TV_PHANKHUC || []).forEach(function (p) { ds.push(['TV_PHANKHUC.' + p.ma, p.cauMo]); });
    (G.TV_SANGLOC || []).forEach(function (s) { ds.push(['TV_SANGLOC.' + s.ma, s.hoi]); });
    (G.TV_HOI || []).forEach(function (t) {
      (t.hoi || []).forEach(function (c, i) { ds.push(['TV_HOI.' + t.tang + '.' + (i + 1), c]); });
    });
    (G.TV_NHIP5 || []).forEach(function (n) { ds.push(['TV_NHIP5.' + n.nhip, n.noi]); });
    (G.TV_306090 || []).forEach(function (m) {
      (m.hoi || []).forEach(function (c, i) { ds.push(['TV_306090.' + m.moc + '.' + (i + 1), c]); });
    });
    (G.TV_VO || []).forEach(function (v) { ds.push(['TV_VO.' + v.ma, v.noi]); });
    (G.TV_GIOITHIEU || []).forEach(function (g) {
      if (g.hoi && g.hoi !== '—') ds.push(['TV_GIOITHIEU.' + g.ma, g.hoi]);
    });
    return ds;
  };

  G.tvSoiNgonTu = function () {
    return G.hmQuetTuCam ? G.hmQuetTuCam(G.tvLoiNoiVoiNha()) : [];
  };

  /* ═══════════════════════════════════════════════════════════
     MÀN HÌNH — MỘT MÀN, HAI ĐỘ SÂU

     Gia đình thấy năm lằn ranh. Phần nghề chỉ dựng khi máy THẬT SỰ có
     kho nghề, không dựng theo một câu `if` đọc vai — chặn ở kho thì
     không có đường lách.
     ═══════════════════════════════════════════════════════════ */
  G.VIEWS['so-tay-tu-van'] = function () {
    if (!G.TV_LANRANH)
      return U.empty('Chưa mở được phần này', 'Phần này nằm trong gói nền. Đăng nhập lại để nạp.');

    var lr = G.TV_LANRANH || [];
    var o = U.ph({ eyebrow: 'SỔ TAY TƯ VẤN', ic: 'shield', grad: 1,
      t: 'Năm điều người tư vấn không được làm với nhà mình',
      lead: 'Người bán hàng nào cũng biết năm điều này là sai. Biết mà vẫn làm, vì lúc sắp mất một đơn ' +
        'thì lý lẽ nào cũng nghe hợp lý — nên chúng nằm ở đây, chỗ người bị thiệt đọc được.' });

    o += G.kaKhung ? G.kaKhung('so-tay-tu-van', 'dau') : '';

    o += U.sec('Năm điều người tư vấn KHÔNG được làm với nhà mình',
      ((G.TV_LANRANH_LUAT || {}).inODau || ''));
    o += '<div class="card mb" style="border-color:#BE0E163e">' + lr.map(function (r) {
      return '<div style="padding:10px 0;border-bottom:1px solid var(--gita-vien-2)">' +
        '<b class="sm">' + h(r.ma + ' · ' + r.t) + '</b>' +
        '<p class="sm mt" style="line-height:1.8">' + h(r.khong) + '</p>' +
        '<p class="tiny mt" style="line-height:1.7"><b>Ví dụ:</b> ' + h(r.viDu) + '</p>' +
        '<p class="tiny dim mt" style="line-height:1.7">' + h(r.vi) + '</p>' +
        '<p class="tiny mt" style="line-height:1.7;color:#BE0E16"><b>Nếu gặp:</b> ' + h(r.phat) + '</p></div>';
    }).join('') +
      '<p class="tiny dim mt" style="line-height:1.7"><b>' +
      h((G.TV_LANRANH_LUAT || {}).khongThuHep || '') + '</b> ' +
      h((G.TV_LANRANH_LUAT || {}).vi || '') + '</p></div>';

    /* ── Phần của nghề ── */
    if (!G.TV_TUCHOI) return o;

    var cho = G.tvChoChu();
    if (cho.length) {
      o += U.sec('Chờ chủ hệ quyết — ' + cho.length + ' câu',
        ((G.TV_CHOCHU_LUAT || {}).camTuQuyet || ''));
      o += '<div class="card mb" style="border-color:#B4720F3e">' + cho.map(function (c) {
        return '<div style="padding:9px 0;border-bottom:1px solid var(--gita-vien-2)">' +
          '<b class="sm">' + h(c.t) + '</b>' +
          '<p class="tiny mt" style="line-height:1.7"><b>Sổ tay đề nghị:</b> ' + h(c.banGoc) + '</p>' +
          '<p class="tiny mt" style="line-height:1.7"><b>Trạng thái đang giữ:</b> ' + h(c.lenhDung) + '</p>' +
          '<p class="tiny dim mt" style="line-height:1.7">' + h(c.vi) + '</p>' +
          '<p class="tiny mt" style="line-height:1.7;color:#B4720F"><b>Cần gì:</b> ' + h(c.canGi) + '</p></div>';
      }).join('') +
        '<p class="tiny dim mt" style="line-height:1.7">' + h((G.TV_CHOCHU_LUAT || {}).vi || '') + '</p></div>';
    }

    var tr = G.TV_TRAN || {}, cm = G.tvSoiCayMe(10), tt = G.tvTranTuVan(0, 1);
    o += U.sec('Trần quan hệ — đọc, không ghi số', '');
    o += '<div class="card mb" style="border-color:#0B73502e">' +
      '<p class="tiny dim" style="line-height:1.7"><b>Sổ tay ghi:</b> ' + h(tr.banGocGhi || '') + '</p>' +
      '<p class="sm mt" style="line-height:1.8"><b>Trần đã ép:</b> ' + h(tr.saoKhongDung || '') + '</p>' +
      (cm ? '<p class="sm mt" style="line-height:1.8">Mười Cây Mẹ với trần ' + cm.tran +
        ' nhà mới là <b>' + cm.that + ' nhà</b>, không phải ' + cm.banGocGhi +
        ' — lệch ' + (cm.lech || 0) + ' lần.</p>' : '') +
      (tt ? '<p class="sm mt" style="line-height:1.8">Mỗi Đồng Hành đỡ ' + tt.tran +
        ' nhà. Số nhà ký thêm được tính từ số người đang có, không từ sức bán.</p>' : '') +
      '<p class="tiny dim mt" style="line-height:1.7">' + h(tr.vi || '') + '</p>' +
      '<p class="tiny mt" style="line-height:1.7"><b>' + h(tr.luatVao || '') + '</b></p></div>';

    o += U.sec('Sáu phân khúc gia đình',
      'Cột chặng hợp trỏ vào chặng CÓ THẬT ở bảng học phí — phân khúc trỏ vào chặng không tồn tại là phân khúc chỉ có tên.');
    o += U.tbl(['Mã', 'Phân khúc', 'Đang ở đâu', 'Đau ở đâu', 'Câu mở', 'Chặng hợp', 'Không được làm'],
      (G.TV_PHANKHUC || []).map(function (p) {
        return [h(p.ma), h(p.ten), h(p.dau), h(p.dauDon), h(p.cauMo), h(p.hopTang), h(p.khongHop)];
      }));

    o += U.sec('Bảy câu sàng lọc',
      'Sàng lọc là để TỪ CHỐI, không phải để phân loại. Cột chặn là cột có hàm đứng sau.');
    o += U.tbl(['Mã', 'Câu hỏi', 'Cờ đỏ', 'Gặp cờ thì làm gì', 'Chặn'],
      (G.TV_SANGLOC || []).map(function (s) {
        return [h(s.ma), h(s.hoi), h(s.co), h(s.neuThe), s.chan ? 'CHẶN' : 'lưu ý'];
      }));

    o += U.sec('Ba tầng câu hỏi và bảy cách nghe', '');
    o += (G.TV_HOI || []).map(function (t) {
      return '<div class="card mb"><span class="tiny up">TẦNG ' + t.tang + ' · ' + h(t.ten) + '</span>' +
        '<p class="sm mt" style="line-height:1.8">' + (t.hoi || []).map(function (c) { return h(c); }).join('<br>') + '</p>' +
        '<p class="tiny dim mt" style="line-height:1.7"><b>Dùng:</b> ' + h(t.dung) + '</p>' +
        '<p class="tiny mt" style="line-height:1.7;color:#BE0E16"><b>Bẫy:</b> ' + h(t.bay) + '</p></div>';
    }).join('');
    o += U.tbl(['Mã', 'Cách nghe', 'Làm gì', 'Vì sao'],
      (G.TV_NGHE || []).map(function (n) { return [h(n.ma), h(n.t), h(n.lam), h(n.vi)]; }));

    o += U.sec('Chín ô hồ sơ',
      'Ô nào chưa hỏi được thì ĐỂ TRỐNG. Điền đoán là biến một chỗ chưa biết thành một chỗ tưởng đã biết, và cả chặng sau chạy trên chỗ tưởng ấy.');
    o += U.tbl(['Ô', 'Tên', 'Là gì', 'Chưa hỏi được thì'],
      (G.TV_OHOSO || []).map(function (x) { return [String(x.o), h(x.ten), h(x.la), h(x.neuDoan)]; }));

    o += U.sec('Bảy kỷ luật trước khi nói về chương trình', '');
    o += U.tbl(['#', 'Kỷ luật', 'Vì sao'],
      (G.TV_KYLUAT || []).map(function (k) { return [String(k.no), h(k.t), h(k.vi)]; }));

    var n5 = G.tvSoiNhip5();
    o += U.sec('Năm nhịp mười phút' + (n5.length ? ' — LỆCH: ' + (n5.join(' ')) : ''),
      'Mười phút là mười phút. Nhịp nào dài ra thì nhịp khác ngắn lại, và nhịp bị ngắn lại luôn là nhịp năm — nhịp im lặng.');
    o += U.tbl(['Nhịp', 'Tên', 'Phút', 'Nói gì', 'Cấm'],
      (G.TV_NHIP5 || []).map(function (n) {
        return [String(n.nhip), h(n.ten), String(n.phut), h(n.noi), h(n.cam)];
      }));

    var tcl = G.TV_TUCHOI_LUAT || {};
    o += U.sec('Ba mươi lời từ chối — thật hay giả', (tcl.cot || ''));
    o += '<div class="card mb" style="border-color:#B4720F3e">' +
      '<p class="sm" style="line-height:1.8"><b>Phép thử:</b> ' + h(tcl.thuThe || '') + '</p>' +
      '<p class="sm mt" style="line-height:1.8"><b>Gặp loại giả:</b> ' + h(tcl.luatGia || '') + '</p>' +
      '<p class="tiny dim mt" style="line-height:1.7">' + h(tcl.viCanLuat || '') + '</p>' +
      '<p class="tiny mt" style="line-height:1.7"><b>' + h(tcl.camDap3 || '') + '</b></p></div>';
    o += U.tbl(['Mã', 'Khách nói', 'Loại', 'Câu thử', 'Ba đường đáp — đường ba là đường dừng'],
      (G.TV_TUCHOI || []).map(function (t) {
        return [h(t.ma), h(t.khi), t.loai === 'that' ? 'THẬT' : 'giả', h(t.thuThat),
          (t.dap || []).map(function (d, i) { return (i + 1) + '. ' + h(d); }).join('<br>')];
      }));

    o += U.sec('Mười hai tín hiệu chốt', ((G.TV_TINHIEU_LUAT || {}).cot || ''));
    o += '<div class="card mb">' + (G.TV_TINHIEU || []).map(function (x) {
      return '<span class="tiny" style="display:inline-block;margin:3px 8px 3px 0">' +
        x.no + '. ' + h(x.t) + '</span>';
    }).join('') +
      '<p class="tiny dim mt" style="line-height:1.7">' + h((G.TV_TINHIEU_LUAT || {}).vi || '') + '</p>' +
      '<p class="tiny mt" style="line-height:1.7"><b>' + h((G.TV_TINHIEU_LUAT || {}).camDem || '') + '</b></p></div>';

    o += U.sec('Tám cách chốt', 'Cách thứ tám là chốt bằng cách DỪNG, và nó là một cách chốt chứ không phải một cách thua.');
    o += U.tbl(['Mã', 'Cách', 'Làm gì', 'Khi nào', 'Cấm'],
      (G.TV_CHOT || []).map(function (c) { return [h(c.ma), h(c.ten), h(c.lam), h(c.khiNao), h(c.cam)]; }));

    o += U.sec('Chín chỗ sụp phút chót', '');
    o += U.tbl(['Mã', 'Khi', 'Cứu thế nào'],
      (G.TV_SUP || []).map(function (s) { return [h(s.ma), h(s.khi), h(s.cuu)]; }));

    var hh = G.TV_HOAN || {};
    o += U.sec('Hoàn tiền — đọc bảng học phí, không nhớ một câu chung', '');
    o += '<div class="card mb" style="border-color:#BE0E163e">' +
      '<p class="tiny dim" style="line-height:1.7"><b>Sổ tay ghi:</b> ' + h(hh.banGocGhi || '') + '</p>' +
      '<p class="sm mt" style="line-height:1.8"><b>Vì sao không dùng:</b> ' + h(hh.saoKhongDung || '') + '</p>' +
      '<p class="sm mt" style="line-height:1.8"><b>Làm gì:</b> ' + h(hh.lam || '') + '</p>' +
      '<p class="tiny dim mt" style="line-height:1.7">' + h(hh.vi || '') + '</p></div>';
    o += U.tbl(['Chặng', 'Tên chặng', 'Nhịp thu', 'Chính sách hoàn — đọc nguyên văn'],
      (G.HP_TANG || []).map(function (t) { return [h(t.tang), h(t.ten), h(t.nhip), h(t.hoan)]; }));

    o += U.sec('Giữ nhà — ba mươi · sáu mươi · chín mươi', '');
    o += U.tbl(['Mốc', 'Tên', 'Dài', 'Hỏi gì', 'Tìm gì'],
      (G.TV_306090 || []).map(function (m) {
        return [String(m.moc), h(m.ten), h(m.dai), (m.hoi || []).map(function (c) { return h(c); }).join('<br>'), h(m.tim)];
      }));

    var ho = (G.TV_VO || []).filter(function (v) { return v.ma === 'HO-T2'; })[0];
    if (ho) {
      o += U.sec('Hố vô hình tháng hai', (ho.khi));
      o += '<div class="card mb" style="border-color:' + ho.c + '3e">' +
        '<p class="sm" style="line-height:1.8"><b>Dấu hiệu:</b> ' + h(ho.dauHieu) + '</p>' +
        '<p class="sm mt" style="line-height:1.8"><b>Vì sao không ai gọi tên được:</b> ' + h(ho.viSaoKhong) + '</p>' +
        '<p class="sm mt" style="line-height:1.8"><b>Đo bằng:</b> ' + h(ho.do) + '</p>' +
        '<div class="mt">' + (ho.cuu || []).map(function (b) {
          return '<p class="sm" style="line-height:1.8"><b>Bước ' + b.buoc + ':</b> ' + h(b.lam) + '</p>';
        }).join('') + '</div>' +
        '<p class="tiny mt" style="line-height:1.7"><b>Nói với nhà:</b> ' + h(ho.noi) + '</p></div>';
    }
    o += U.tbl(['Mã', 'Chỗ vỡ', 'Khi', 'Dấu hiệu', 'Vì sao', 'Đo bằng'],
      (G.TV_VO || []).filter(function (v) { return v.ma !== 'HO-T2'; }).map(function (v) {
        return [h(v.ma), h(v.ten), h(v.khi), h(v.dauHieu), h(v.viSaoKhong), h(v.do)];
      }));

    o += U.sec('Bốn cửa giới thiệu',
      'Không hứa hoa hồng hay quà ĐỔI LẤY một lời giới thiệu. Điều này không cấm chương trình đại sứ — chương trình ấy có trần mười phần trăm công khai, và người ta tự chọn bước vào.');
    o += U.tbl(['Mã', 'Cửa', 'Khi nào', 'Hỏi gì', 'Hứa thưởng', 'Vì sao'],
      (G.TV_GIOITHIEU || []).map(function (g) {
        return [h(g.ma), h(g.ten), h(g.khi), h(g.hoi),
          g.khongHuaThuong ? 'KHÔNG' : 'theo ' + h(g.theoChinhSach || 'chính sách công khai'), h(g.vi)];
      }));

    var chuaDo = G.tvSoChuaDo();
    o += U.sec('Mười lăm con số tháng' + (chuaDo.length ? ' — ' + chuaDo.length + ' số chưa đo được' : ''),
      ((G.TV_SO15_LUAT || {}).cot || ''));
    o += U.tbl(['#', 'Con số', 'Nguồn', 'Ghi chú'],
      (G.TV_SO15 || []).map(function (s) {
        return [String(s.no), h(s.t),
          s.chuaDo ? 'CHƯA ĐO ĐƯỢC' : h(s.nguon),
          h(s.chuaDo ? 'Thiếu: ' + s.thieu : (s.vi || '—'))];
      }));
    o += '<p class="tiny dim mb" style="line-height:1.7"><b>' +
      h((G.TV_SO15_LUAT || {}).camTuDien || '') + '</b> ' + h((G.TV_SO15_LUAT || {}).vi || '') + '</p>';

    o += U.sec('Kỷ luật ngày', '');
    o += U.tbl(['Khi', 'Làm gì'], (G.TV_NGAY || []).map(function (x) { return [h(x.khi), h(x.lam)]; }));

    o += U.sec('Mười hai tháng của một người tư vấn', '');
    o += U.tbl(['Tháng', 'Việc', 'Đo bằng'],
      (G.TV_12THANG || []).map(function (x) { return [String(x.thang), h(x.viec), h(x.do)]; }));

    var tn = G.TV_TOTNGHIEP || {};
    o += U.sec('Thi tốt nghiệp', '');
    o += U.tbl(['Mã', 'Phần thi', 'Đạt khi'],
      (tn.gom || []).map(function (x) { return [h(x.ma), h(x.t), h(x.dat)]; }));
    o += '<div class="card mb" style="border-color:#BE0E163e">' +
      '<span class="tiny up" style="color:#BE0E16">TIÊU CHÍ TUYỆT ĐỐI · ' + h(tn.tuyetDoi || '') + '</span>' +
      '<p class="tiny dim mt" style="line-height:1.7">' + h(tn.vi || '') + '</p></div>';

    o += U.sec('Sáu luật của lớp tư vấn', '');
    o += '<div class="card">' + (G.TV_LUAT || []).map(function (l) {
      return '<div style="padding:8px 0;border-bottom:1px solid var(--gita-vien-2)">' +
        '<b class="sm">' + l.no + '. ' + h(l.t) + '</b>' +
        '<p class="tiny dim mt" style="line-height:1.7">' + h(l.y) + '</p></div>';
    }).join('') + '</div>';
    return o;
  };
})();
