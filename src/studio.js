/* ═══════════════════════════════════════════════════════════════
   GITA STUDIO 365 — XƯỞNG DỰNG VIDEO  (9.99.94)

   Đây là **P9 của bộ đặc tả Studio** — màn chính, thứ `ST_PHAN` khai
   `chuaCo` từ 9.99.92. Dựng theo bản mẫu chạy được của chủ hệ, sau một
   lượt đo tìm ra chín lỗi và bảy chỗ đúng (`G.XU_LOI` · `G.XU_HOP`).

   ══ BỐN CHỖ CỐ Ý KHÁC BẢN MẪU ══

   1. **KHÔNG có bảng từ cấm nào ở đây.** Đèn ngôn từ gọi thẳng cửa
      `soatNoiDung` đã chạy từ 9.99.41. Bản mẫu tự dựng một `WAF` —
      và dòng regex ấy mang HAI bẫy cùng lúc: `\bhư\b` không bao giờ
      khớp (bẫy dò chữ #1 của kho), còn `\bngu\b` khớp vào "ngu|ồn"
      tức là bắt oan chính ô *Nguồn tri thức* đứng ngay bên trên.

   2. **KHÔNG gọi thẳng bộ tạo chữ ngoài lãnh thổ từ trình duyệt.**
      Chuỗi đi ra mang chủ đề, người xem và điều nhỏ của một gia đình.
      Đường ra khỏi hệ đã có cổng ẩn danh từ 9.99.62; một lời `fetch`
      trong mã trình duyệt đi vòng qua nó.

   3. **KHÔNG có `esc()` riêng.** `U.h()` đã có, và bản chép của bản
      mẫu sót dấu nháy đơn — mà lời đọc tiếng Việt đầy dấu nháy đơn.

   4. **Không sinh mã bằng `crypto.randomUUID()`.** Bản `.exe` mở tệp
      bằng `file://`, ở đó nó không tồn tại và cả xưởng ném lỗi ngay
      dòng đầu — trong khi mọi lượt thử qua https đều xanh. Đúng lớp
      lỗi nhánh `isTTY` ở 9.99.79.

   ══ CHỖ BẢN MẪU ĐÚNG VÀ KHÔNG ĐƯỢC "CẢI TIẾN" ══

   **Giọng chỉ đến từ micro người thật hoặc tệp có sẵn.** Không một
   dòng sinh giọng nào. Đó là luật C20 giữ nguyên, và nó là chỗ dễ bị
   sửa nhất ở bản sau — nên nó có một phép đo riêng ở mục 103.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;
G.VIEWS = G.VIEWS || {};

(function () {
  var U = G.U, h = U.h, ic = U.ic;

  /* Mã cục bộ trong bộ nhớ — KHÔNG dùng crypto.randomUUID: nó chỉ có
     trong ngữ cảnh an toàn, và bản máy tính mở bằng file://. */
  var demMa = 0;
  function ma(tien) { demMa += 1; return tien + '-' + demMa.toString(36); }

  var KHO_HINH = function () { return G.XU_KHO_HINH || []; };
  var NGAN = function () { return G.XU_NGANKHO || []; };
  var KHUON = function () { return G.XU_KHUON || []; };

  /* ══ TRẠNG THÁI ══ */
  G.xuDA = G.xuDA || {           // dự án đang mở
    ten: 'GITA 365 — một điều nhỏ mỗi tối cùng con',
    kho: '9:16', dich: 60, khuon: 'SC2',
    nguoiXem: 'Phụ huynh chưa biết GITA', tang: 'T1 · công khai',
    dieuNho: 'Tối nay hỏi con: hôm nay chỗ nào khó nhất?',
    nguon: 'KS-04 · Triết lý Một Điều Nhỏ',
    canh: []
  };
  G.xuVat = G.xuVat || {};       // mã → {ma,ten,loai,url,el,buffer}
  G.xuSoat = G.xuSoat || null;   // kết quả cửa soatNoiDung
  G.xuDangSoat = false;
  G.xuGiuLai = '';               // lời khai lúc bấm Dừng khẩn

  function tong() {
    return (G.xuDA.canh || []).reduce(function (a, c) { return a + (+c.giay || 0); }, 0);
  }
  function phut(s) {
    return Math.floor(s / 60) + 'p' + String(Math.round(s % 60)).padStart(2, '0');
  }
  function veLai() {
    if (!G.S || G.S.view !== 'studio') return;
    if (typeof document === 'undefined' || !document.getElementById('main')) return;
    G.render && G.render();
  }

  /* ══ BỘ VIẾT KỊCH BẢN — hàm ở đây, CÂU ở kho ══
     Luật 1 của kho nội dung: JSON.stringify bỏ hàm, nên phần chạy phải
     ở src/. Ngân khố câu nằm ở `G.XU_NGANKHO` để người viết nội dung
     sửa được mà không phải sửa mã. */
  function nhom(vai) {
    return NGAN().filter(function (n) { return n.vai === vai; })[0];
  }
  function lay(vai, dem) {
    var n = nhom(vai);
    if (!n || !n.cau.length) return {loi: '', chu: '', hinh: ''};
    var i = dem % n.cau.length;
    return {loi: n.cau[i], chu: (n.chuMan || [])[i] || '', hinh: n.hinh || ''};
  }
  function moiCanh(vai, giay, dem) {
    var x = lay(vai, dem);
    return {id: ma('c'), vai: vai, giay: giay,
      loi: x.loi, chuMan: x.chu, hinh: x.hinh, vatHinh: '', vatTieng: ''};
  }

  G.xuViet = function () {
    var d = G.xuDA;
    var dich = Math.max(30, Math.min(300, +d.dich || 60));
    var k = KHUON().filter(function (x) { return x.ma === d.khuon; })[0];
    var nhip = (k && k.nhip) || ['vi_sao', 'cach_lam'];
    var dem = {}, ds = [];
    function ke(vai) { dem[vai] = (dem[vai] == null ? -1 : dem[vai]) + 1; return dem[vai]; }

    ds.push(moiCanh('hook', 4, ke('hook')));
    var da = 4, i = 0, tuNhipTho = 0, chotDai = 4;

    /* Trần vòng lặp là một cái chặn THẬT, không phải phòng xa: `dich`
       tối đa 300 giây và mỗi cảnh ít nhất 3 giây, nên 120 vòng là dư —
       nhưng một vòng `while` đọc dữ liệu người nhập mà không có trần
       thì nó treo cả trang, và trang treo thì không có dòng lỗi nào. */
    var vong = 0;
    while (da < dich - chotDai - 5 && vong < 120) {
      vong += 1;
      if (tuNhipTho >= 8) {
        ds.push(moiCanh('nhip_tho', 3, ke('nhip_tho'))); da += 3; tuNhipTho = 0; continue;
      }
      var vai = nhip[i % nhip.length];
      ds.push(moiCanh(vai, 6, ke(vai))); da += 6; i += 1; tuNhipTho += 1;
    }

    var cuoi = moiCanh('cta', Math.max(3, dich - da), ke('cta'));
    if (String(d.dieuNho || '').trim()) cuoi.loi = String(d.dieuNho).trim();
    ds.push(cuoi);

    d.canh = ds;
    G.xuSoat = null;
    veLai();
  };

  G.xuThemCanh = function () {
    G.xuDA.canh.push(moiCanh('cach_lam', 6, 0)); G.xuSoat = null; veLai();
  };
  G.xuXoaCanh = function (id) {
    G.xuDA.canh = G.xuDA.canh.filter(function (c) { return c.id !== id; });
    G.xuSoat = null; veLai();
  };
  G.xuSuaCanh = function (id, o, gt) {
    var c = G.xuDA.canh.filter(function (x) { return x.id === id; })[0];
    if (!c) return;
    c[o] = (o === 'giay') ? Math.max(1, Math.min(60, +gt || 1)) : gt;
    if (o === 'loi') G.xuSoat = null;
    if (o === 'giay' || o === 'vatHinh') G.xuVe(G.xuDongHo);
    G.xuTomTat();
  };
  G.xuSuaO = function (o, gt) {
    G.xuDA[o] = gt;
    if (o === 'kho') G.xuCoManh();
    veLai();
  };

  /* Khớp giây theo độ dài giọng — một phép đo, không phải một lời khai.
     Người gõ tay con số giây thì con số ấy đúng lúc gõ và sai từ lượt
     ghi giọng sau. */
  G.xuKhopGiay = function (id) {
    var c = G.xuDA.canh.filter(function (x) { return x.id === id; })[0];
    if (!c) return;
    var v = G.xuVat[c.vatTieng];
    if (!v || !v.buffer) { U.toast('Cảnh này chưa gắn giọng.', 'err'); return; }
    c.giay = Math.round((v.buffer.duration + 0.4) * 10) / 10;
    veLai();
  };

  /* ══ ĐÈN KIỂM ĐỊNH ══
     D1 và D2 KHÔNG đo ở đây. Chúng đọc kết quả cửa `soatNoiDung` —
     mục 103 canh rằng tệp này không khai một cụm dấu hiệu nào. */
  G.xuGoiSoat = function () {
    var chu = (G.xuDA.canh || []).map(function (c) { return c.loi; })
      .filter(Boolean).join(' ');
    if (chu.trim().length < 40) {
      G.xuSoat = {ok: false, error: 'QUANGAN',
        vi: 'Lời đọc cộng lại chưa đủ 40 ký tự — cửa nội dung không soát bài quá ngắn.'};
      veLai(); return;
    }
    if (!G.goiMayChu) return;
    G.xuDangSoat = true; veLai();
    G.goiMayChu('soatNoiDung', {chu: chu, tang: G.xuDA.tang, khuon: 'BAIHOC',
      doiTuong: /công khai|phụ huynh/i.test(G.xuDA.tang) ? 'khach' : 'noiBo'})
      .then(function (x) { G.xuSoat = x; G.xuDangSoat = false; veLai(); })
      .catch(function (e) {
        G.xuSoat = {ok: false, error: String(e && e.message || e)};
        G.xuDangSoat = false; veLai();
      });
  };

  function den() {
    var d = G.xuDA, ds = d.canh || [], t = tong(), s = G.xuSoat;
    var coHinh = ds.filter(function (c) { return c.vatHinh; }).length;
    var coTieng = ds.filter(function (c) { return c.vatTieng; }).length;
    var chan = (s && s.ok && (s.cam || []).filter(function (x) { return !x.canhBao; })) || [];
    var o = [];

    o.push(!s ? {tt: 'cho', t: 'Ngôn từ qua hiến pháp nội dung', ref: 'soatNoiDung',
        n: 'Chưa soát. Bấm "Soát lời đọc" — xưởng KHÔNG tự đo, nó hỏi cửa nội dung.'}
      : !s.ok ? {tt: 'bad', t: 'Ngôn từ qua hiến pháp nội dung', ref: 'soatNoiDung',
        n: String(s.vi || s.error || 'Cửa nội dung từ chối.')}
      : {tt: chan.length ? 'bad' : 'ok', t: 'Ngôn từ qua hiến pháp nội dung', ref: 'soatNoiDung',
        n: chan.length ? chan.map(function (x) { return x.ma; }).join(' · ') + ' — ' +
             String(chan[0].vi || '').slice(0, 160)
           : 'Cửa nội dung không nêu chỗ chặn nào.'});

    o.push(!s || !s.ok ? {tt: 'cho', t: 'Câu đủ ngắn để nghe', ref: 'soatNoiDung',
        n: 'Ngưỡng câu dài nằm ở cửa nội dung, không nằm ở xưởng.'}
      : {tt: (s.cauDai && s.cauDai.length) ? 'warn' : 'ok', t: 'Câu đủ ngắn để nghe',
        ref: 'soatNoiDung',
        n: (s.cauDai && s.cauDai.length) ? s.cauDai.length + ' câu vượt ngưỡng của cửa nội dung.'
           : 'Không câu nào vượt ngưỡng.'});

    o.push({tt: (t < 30 || t > 300) ? 'bad' : 'ok', t: 'Thời lượng trong khung 30 giây – 5 phút',
      ref: 'FV-2', n: phut(t) + ' trên ' + ds.length + ' cảnh.'});

    o.push({tt: String(d.dieuNho || '').trim() ? 'ok' : 'bad', t: 'Điều nhỏ có thật',
      ref: 'TG_DIEUNHO.DN2',
      n: String(d.dieuNho || '').trim()
        ? 'Có chữ. Câu ấy có phải một việc LÀM ĐƯỢC hay không thì DN2 chốt — cấm "hiểu · nhớ · tin".'
        : 'Chưa ghi điều nhỏ người xem làm được.'});

    o.push({tt: String(d.nguon || '').trim() ? 'ok' : 'bad', t: 'Có nguồn tri thức',
      ref: 'KS-*', n: String(d.nguon || '').trim() || 'Chưa gắn nguồn.'});

    o.push({tt: !ds.length ? 'bad' : coHinh < ds.length ? 'warn' : 'ok', t: 'Hình cho từng cảnh',
      ref: 'P6', n: coHinh + '/' + ds.length + ' cảnh đã gắn hình. Cảnh trống dùng nền ' +
        'ánh đèn — vàng, không đỏ: nền ánh đèn là một lựa chọn hợp lệ.'});

    o.push({tt: coTieng ? 'ok' : 'warn', t: 'Giọng đọc', ref: 'ST_VA.SV1',
      n: coTieng ? coTieng + '/' + ds.length + ' cảnh có giọng.'
        : 'Chưa có giọng — video xuất ra sẽ im tiếng. Xưởng KHÔNG sinh giọng: luật C20 ' +
          'nói máy TRỘN, không SINH.'});

    o.push({tt: 'nguoi', t: 'Chất ấm — nghe có như người quen nói không', ref: 'LT_AM.WS-3',
      n: 'Một người nghe hết rồi ký tên, và người ấy không được là người dựng. Máy chấm ' +
        'được từ ngữ và nhịp câu; nó KHÔNG chấm được câu này, và câu trả lời của máy cho ' +
        'nó nghe y hệt câu trả lời thật.'});

    if (G.xuGiuLai) o.push({tt: 'bad', t: 'Video đang bị giữ lại', ref: 'LT_MOC.G1-4',
      n: G.xuGiuLai});
    return o;
  }
  function congMo() {
    return !den().some(function (l) { return l.tt === 'bad'; });
  }

  /* ══ VẼ 1080p ══ */
  G.xuDongHo = 0;
  function khung() {
    var k = KHO_HINH().filter(function (x) { return x.ma === G.xuDA.kho; })[0];
    return (k && k.r) || [1080, 1920];
  }
  G.xuCoManh = function () {
    var cv = document.getElementById('xu-man'); if (!cv) return;
    var r = khung(); cv.width = r[0]; cv.height = r[1];
    G.xuVe(G.xuDongHo);
  };
  function canhTai(giay) {
    var ds = G.xuDA.canh || [], a = 0;
    for (var i = 0; i < ds.length; i++) {
      var b = a + (+ds[i].giay || 0);
      if (giay < b || i === ds.length - 1) return {i: i, c: ds[i], a: a, b: b};
      a = b;
    }
    return null;
  }
  G.xuVe = function (giay) {
    var cv = document.getElementById('xu-man'); if (!cv) return;
    var ct = cv.getContext('2d'), W = cv.width, H = cv.height, u = W / 1080;
    ct.fillStyle = '#0B0E15'; ct.fillRect(0, 0, W, H);
    var t = tong();

    /* Chưa có cảnh thì DỪNG ở đây. Bản mẫu chia `giay / total()` và
       `0/0` ra NaN — fillRect với NaN không ném lỗi, nó vẽ ra không có
       gì, nên chỗ hỏng im lặng. */
    if (!t) {
      ct.fillStyle = 'rgba(255,255,255,.55)'; ct.textAlign = 'center';
      ct.font = '600 ' + (44 * u) + 'px sans-serif';
      ct.fillText('Chưa có cảnh nào', W / 2, H / 2);
      return;
    }
    var cur = canhTai(Math.min(giay, t)); if (!cur) return;
    var c = cur.c, p = (cur.b - cur.a) ? (giay - cur.a) / (cur.b - cur.a) : 0;

    var v = G.xuVat[c.vatHinh];
    if (v && v.loai === 'hinh' && v.el) phu(ct, v.el, W, H, 1.06 + 0.08 * p);
    else nenDen(ct, W, H, cur.i, p);

    var g = ct.createLinearGradient(0, H * 0.45, 0, H);
    g.addColorStop(0, 'rgba(6,8,12,0)'); g.addColorStop(1, 'rgba(6,8,12,.82)');
    ct.fillStyle = g; ct.fillRect(0, H * 0.45, W, H * 0.55);

    if (c.chuMan) {
      ct.globalAlpha = Math.min(1, (giay - cur.a) / 0.45);
      ct.textAlign = 'center'; ct.fillStyle = '#FFF6E8';
      xuong(ct, c.chuMan, W / 2, H * (c.vai === 'cta' ? 0.46 : 0.34), W * 0.82, 112 * u, 800);
      ct.globalAlpha = 1;
    }
    if (c.loi) karaoke(ct, c, giay - cur.a, W, H, u);

    ct.fillStyle = 'rgba(255,255,255,.14)'; ct.fillRect(0, 0, W, 6 * u);
    ct.fillStyle = '#E8A33C'; ct.fillRect(0, 0, W * (giay / t), 6 * u);
    ct.textAlign = 'right'; ct.fillStyle = 'rgba(255,255,255,.6)';
    ct.font = '700 ' + (34 * u) + 'px sans-serif';
    ct.fillText('GITA 365', W - 40 * u, H - 46 * u);

    var dh = document.getElementById('xu-gio');
    if (dh) dh.textContent = giay.toFixed(1) + ' / ' + t.toFixed(1) + 's';
  };
  function nenDen(ct, W, H, i, p) {
    var am = 0.3 + 0.5 * ((i % 5) / 4);
    var g = ct.createRadialGradient(W / 2, H * (0.36 - 0.03 * p), 20, W / 2, H / 2, H * 0.82);
    g.addColorStop(0, 'rgb(' + ((232 * am + 22) | 0) + ',' + ((163 * am + 20) | 0) +
      ',' + ((60 * am + 28) | 0) + ')');
    g.addColorStop(1, '#0B0E15');
    ct.fillStyle = g; ct.fillRect(0, 0, W, H);
  }
  function phu(ct, el, W, H, ti) {
    var iw = el.width || el.naturalWidth, ih = el.height || el.naturalHeight;
    if (!iw || !ih) return;
    var r = Math.max(W / iw, H / ih) * ti, w = iw * r, hh = ih * r;
    ct.drawImage(el, (W - w) / 2, (H - hh) / 2, w, hh);
  }
  function xuong(ct, chu, x, y, rong, co, dam) {
    ct.font = dam + ' ' + co + 'px sans-serif';
    var ws = String(chu).split(' '), d = '', yy = y;
    ws.forEach(function (w) {
      if (ct.measureText(d + w).width > rong && d) { ct.fillText(d.trim(), x, yy); yy += co * 1.1; d = ''; }
      d += w + ' ';
    });
    ct.fillText(d.trim(), x, yy);
  }
  function karaoke(ct, c, cucBo, W, H, u) {
    var ws = String(c.loi).trim().split(/\s+/).filter(Boolean);
    if (!ws.length) return;
    var moi = (+c.giay || 1) / ws.length, dang = Math.floor(cucBo / moi);
    ct.font = '700 ' + (56 * u) + 'px sans-serif';
    var rongMax = W * 0.84, dong = [[]], cong = 0;
    ws.forEach(function (w) {
      var ww = ct.measureText(w + ' ').width;
      if (cong + ww > rongMax && dong[dong.length - 1].length) { dong.push([]); cong = 0; }
      dong[dong.length - 1].push(w); cong += ww;
    });
    var hien = dong.slice(0, 3), y0 = H * 0.845 - (hien.length - 1) * 34 * u, k = 0;
    hien.forEach(function (d, li) {
      var ws2 = d.map(function (w) { return ct.measureText(w + ' ').width; });
      var x = W / 2 - ws2.reduce(function (m, n) { return m + n; }, 0) / 2;
      ct.textAlign = 'left';
      d.forEach(function (w, j) {
        ct.fillStyle = k === dang ? '#FFD37A' : k < dang ? 'rgba(255,255,255,.95)'
          : 'rgba(255,255,255,.45)';
        ct.fillText(w, x, y0 + li * 74 * u); x += ws2[j]; k += 1;
      });
    });
  }

  /* ══ TIẾNG ══ */
  var AC = null, nut = [];
  function ac() { return (AC = AC || new (window.AudioContext || window.webkitAudioContext)()); }
  function xepTieng(dich) {
    dungTieng();
    var a = ac(), t0 = a.currentTime + 0.08, at = 0;
    (G.xuDA.canh || []).forEach(function (c) {
      var v = G.xuVat[c.vatTieng];
      if (v && v.buffer) {
        var n = a.createBufferSource(); n.buffer = v.buffer;
        n.connect(dich); n.start(t0 + at); nut.push(n);
      }
      at += (+c.giay || 0);
    });
  }
  function dungTieng() { nut.forEach(function (n) { try { n.stop(); } catch (e) {} }); nut = []; }

  var chay = false, raf = 0, mocTruoc = 0;
  G.xuXem = function () {
    if (!tong()) return;
    if (G.xuDongHo >= tong()) G.xuDongHo = 0;
    chay = true; mocTruoc = performance.now();
    ac().resume(); xepTieng(ac().destination);
    raf = requestAnimationFrame(nhip);
  };
  G.xuDung = function () { chay = false; cancelAnimationFrame(raf); dungTieng(); };
  function nhip(gio) {
    if (!chay) return;
    G.xuDongHo += (gio - mocTruoc) / 1000; mocTruoc = gio;
    if (G.xuDongHo >= tong()) { G.xuDongHo = tong(); G.xuVe(G.xuDongHo); G.xuDung(); return; }
    G.xuVe(G.xuDongHo);
    raf = requestAnimationFrame(nhip);
  }
  G.xuTua = function (v) {
    G.xuDung(); G.xuDongHo = tong() * (+v / 100); G.xuVe(G.xuDongHo);
  };

  /* ══ DỪNG KHẨN — GIỮ LẠI, không chỉ tạm dừng ══
     Một nút dừng chỉ tạm dừng thì nó không phải dừng khẩn: bấm xong
     người ta bấm chạy lại và video vẫn ra. Ở đây nó bật một đèn ĐỎ,
     và đèn đỏ đóng cổng xuất. */
  G.xuDungKhan = function () {
    if (G.xuGiuLai) {
      G.xuGiuLai = '';
      U.toast('Mở lại — nhớ ghi một dòng vào sổ tay (RM-8).', 'ok');
      veLai(); return;
    }
    G.xuDung();
    if (G.xuGhi && G.xuGhi.state === 'recording') { G.xuHuyXuat = true; G.xuGhi.stop(); }
    G.xuGiuLai = 'Dừng khẩn lúc ' + G.xuDongHo.toFixed(1) + ' giây — video giữ lại chờ rà. ' +
      'Cổng xuất đóng cho tới khi có người mở lại.';
    veLai();
  };

  /* ══ KHO VẬT LIỆU — nằm trong máy, không tải lên đâu ══ */
  G.xuNhanTep = function (ds) {
    var xong = 0, n = ds.length;
    function het() { xong += 1; if (xong >= n) veLai(); }
    Array.prototype.forEach.call(ds, function (f) {
      var id = ma('v');
      /* KHÔNG `URL.createObjectURL` — mục 8 và 18 cấm nó trong `src/`,
         và cấm đúng: một địa chỉ blob là một tệp tải về được. Ảnh đi
         thẳng vào `createImageBitmap`, tiếng đi thẳng vào
         `decodeAudioData`. Cả hai đều KHÔNG sinh ra một địa chỉ nào. */
      if (/^image\//.test(f.type)) {
        G.xuVat[id] = {ma: id, ten: f.name, loai: 'hinh'};
        createImageBitmap(f).then(function (bm) { G.xuVat[id].el = bm; het(); })
          .catch(function () { delete G.xuVat[id]; het(); });
      } else if (/^audio\//.test(f.type)) {
        G.xuVat[id] = {ma: id, ten: f.name, loai: 'tieng'};
        f.arrayBuffer().then(function (b) { return ac().decodeAudioData(b); })
          .then(function (buf) { G.xuVat[id].buffer = buf; het(); })
          .catch(function () { delete G.xuVat[id]; het(); });
      } else {
        /* Tệp PHIM cần một địa chỉ để `<video src>` bám vào, và địa chỉ
           ấy là thứ bị cấm. Nói ra thay vì im: một tệp lặng lẽ bị bỏ
           qua thì người dùng tưởng mình đã gắn được. */
        U.toast('Xưởng web nhận ảnh và tiếng. Tệp phim dựng ở tools/bo-phim.js.', 'ok');
        het();
      }
    });
  };

  /* Ghi giọng bằng micro — ĐƯỜNG DUY NHẤT sinh tiếng trong xưởng, và
     nó không sinh gì cả: nó ghi lại một người đang nói. Luật C20. */
  G.xuGhiGiong = function (id) {
    if (G.xuMicDang) { try { G.xuMicDang.stop(); } catch (e) {} return; }
    if (!navigator.mediaDevices) { U.toast('Trình duyệt này không mở được micro.', 'err'); return; }
    navigator.mediaDevices.getUserMedia({audio: true}).then(function (st) {
      var mr = new MediaRecorder(st), manh = [];
      G.xuMicDang = mr; G.xuMicCanh = id; veLai();
      mr.ondataavailable = function (e) { if (e.data.size) manh.push(e.data); };
      mr.onstop = function () {
        st.getTracks().forEach(function (t) { t.stop(); });
        var bl = new Blob(manh, {type: mr.mimeType});
        bl.arrayBuffer().then(function (b) { return ac().decodeAudioData(b); })
          .then(function (buf) {
            var vid = ma('v');
            G.xuVat[vid] = {ma: vid, ten: 'giong-' + id + '.webm', loai: 'tieng', buffer: buf};
            var c = G.xuDA.canh.filter(function (x) { return x.id === id; })[0];
            if (c) c.vatTieng = vid;
            G.xuMicDang = null; G.xuMicCanh = '';
            U.toast('Đã ghi ' + buf.duration.toFixed(1) + ' giây giọng.', 'ok');
            veLai();
          }).catch(function () { G.xuMicDang = null; veLai(); });
      };
      mr.start();
    }).catch(function (e) {
      U.toast('Không mở được micro: ' + (e && e.message), 'err');
    });
  };

  /* ══ GỬI ĐỀ BÀI SANG XƯỞNG DỰNG ══

     KHÔNG có một đường tải tệp nào trong tệp này, và đó KHÔNG phải một
     chỗ thiếu — nó là luật của chủ hệ, canh cứng ở mục 8 và mục 18:
     `src/` không được có `a.download`, không được có `createObjectURL`,
     không được có `showSaveFilePicker`.

     Bản mẫu xuất thẳng WebM bằng `MediaRecorder` rồi bấm một thẻ `<a
     download>`. Bộ kiểm bắt ngay, và nó bắt ĐÚNG: một màn xuất tệp là
     một đường vòng quanh mọi cổng khác, và nó không hỏi người bấm là ai.

     Câu trả lời đúng đã nằm sẵn trong kho từ lâu — `tools/dung-phim.js`
     và `tools/bo-phim.js` dựng phim ngoài trình duyệt, có ffmpeg, và
     có luật C19 buộc dựng từ tấm ĐÃ PHÁT HÀNH. Xưởng web làm phần nó
     làm tốt: viết kịch bản, xem thử ở đúng khổ, soát đèn. Rồi đề bài
     đi qua MÁY CHỦ sang bộ dựng — không qua một tệp nằm trên máy ai đó.

     Kéo theo, và đây là phần đáng giữ: đề bài đi qua cửa thì nó vào
     nhật ký. Một tệp tải về thì không. */
  G.xuGuiDeBai = function () {
    if (!congMo()) { U.toast('Còn đèn đỏ — cổng gửi đóng.', 'err'); return; }
    if (!G.goiMayChu) return;
    G.goiMayChu('ghiDeBaiVideo', {
      ten: G.xuDA.ten, kho: G.xuDA.kho, tang: G.xuDA.tang, nguon: G.xuDA.nguon,
      dieuNho: G.xuDA.dieuNho, khuon: G.xuDA.khuon, giay: tong(),
      canh: (G.xuDA.canh || []).map(function (c) {
        return {vai: c.vai, giay: +c.giay || 0, loi: c.loi, chuMan: c.chuMan, hinh: c.hinh};
      })
    }).then(function (x) {
      U.toast((x && x.ok)
        ? 'Đã gửi đề bài ' + x.ma + ' — dựng bằng: node tools/dung-phim.js'
        : String((x && x.vi) || 'Cửa đề bài từ chối.'), (x && x.ok) ? 'ok' : 'err');
    }).catch(function (e) { U.toast(String(e && e.message || e), 'err'); });
  };

  /* ══ MÀN ══ */
  function oChon(o, gt, ds) {
    return '<select onchange="G.xuSuaO(\'' + o + '\',this.value)">' + ds.map(function (x) {
      return '<option' + (x === gt ? ' selected' : '') + '>' + h(x) + '</option>';
    }).join('') + '</select>';
  }
  function veCanh(c, i, t0) {
    var vHinh = Object.keys(G.xuVat).filter(function (k) { return G.xuVat[k].loai !== 'tieng'; });
    var vTieng = Object.keys(G.xuVat).filter(function (k) { return G.xuVat[k].loai === 'tieng'; });
    var o = '<div class="giay xu-canh"><div class="row">' +
      '<b>' + h(String(c.vai).toUpperCase()) + '</b>' +
      '<span class="note">' + t0.toFixed(0) + '–' + (t0 + (+c.giay || 0)).toFixed(0) + 's · ' +
      h(c.hinh || '') + '</span></div>';
    o += '<textarea rows="2" oninput="G.xuSuaCanh(\'' + h(c.id) + '\',\'loi\',this.value)">' +
      h(c.loi) + '</textarea>';
    o += '<div class="row"><label>Chữ trên màn <input type="text" value="' + h(c.chuMan) +
      '" oninput="G.xuSuaCanh(\'' + h(c.id) + '\',\'chuMan\',this.value)"></label>';
    o += '<label>Giây <input type="number" min="1" max="60" step="0.5" value="' +
      h(String(c.giay)) + '" oninput="G.xuSuaCanh(\'' + h(c.id) + '\',\'giay\',this.value)"></label>';
    o += '<label>Hình <select onchange="G.xuSuaCanh(\'' + h(c.id) + '\',\'vatHinh\',this.value)">' +
      '<option value="">— nền ánh đèn —</option>' + vHinh.map(function (k) {
        return '<option value="' + h(k) + '"' + (k === c.vatHinh ? ' selected' : '') + '>' +
          h(G.xuVat[k].ten) + '</option>';
      }).join('') + '</select></label></div>';
    o += '<div class="row"><label>Giọng <select onchange="G.xuSuaCanh(\'' + h(c.id) +
      '\',\'vatTieng\',this.value)"><option value="">— chưa có giọng —</option>' +
      vTieng.map(function (k) {
        return '<option value="' + h(k) + '"' + (k === c.vatTieng ? ' selected' : '') + '>' +
          h(G.xuVat[k].ten) + '</option>';
      }).join('') + '</select></label>';
    o += '<span class="row">' +
      '<button class="btn" onclick="G.xuGhiGiong(\'' + h(c.id) + '\')">' +
      (G.xuMicCanh === c.id && G.xuMicDang ? 'Dừng ghi' : 'Ghi giọng') + '</button>' +
      '<button class="btn" onclick="G.xuKhopGiay(\'' + h(c.id) + '\')">Khớp giây theo giọng</button>' +
      '<button class="btn" onclick="G.xuXoaCanh(\'' + h(c.id) + '\')">Xoá cảnh</button>' +
      '</span></div></div>';
    return o;
  }
  G.xuTomTat = function () {
    var e = document.getElementById('xu-tom');
    if (e) e.textContent = (G.xuDA.canh || []).length + ' cảnh · ' + phut(tong()) +
      ' · đích ' + phut(+G.xuDA.dich || 0);
  };

  G.VIEWS['studio'] = function () {
    var o = '<div class="hd"><h2>' + ic('spark') + ' GITA Studio · Xưởng dựng video</h2>' +
      '<p class="sub">Kịch bản sinh tại chỗ từ Ngân khố câu, hình dựng bằng canvas 1080p, ' +
      'giọng lấy từ micro người thật hoặc tệp có sẵn, video xuất thẳng trong trình duyệt. ' +
      'Tệp nằm trong máy anh — không lượt tải lên nào.</p></div>';

    /* Một chỗ chặn duy nhất, TRƯỚC mọi ngăn. Vai không có gói nghề thì
       kho không bao giờ nạp, và mọi ngăn sẽ dựng ra khung rỗng — mà
       một khung rỗng đọc ra là "chỗ này chưa làm xong", không đọc ra
       là "vai của bạn không mở được" (bài học 9.99.63). */
    if (!(G.XU_NGANKHO || []).length) {
      return o + U.empty('Xưởng dựng video thuộc gói nghề',
        'Màn này là công cụ sản xuất của Học viện: nó xuất tệp video, tệp phụ đề và hộ ' +
        'chiếu video ra máy người dùng, nên nó chỉ mở cho người của Học viện đã đăng ' +
        'nhập bằng tài khoản nghề. Gia đình xem video đã phát hành ở kênh, không dựng ' +
        'video trong hệ — và đó là một quyết định về bảo mật, không phải một chỗ chưa ' +
        'làm xong. Ngân khố câu, năm khuôn kịch bản và tám đèn kiểm định đều nằm trong ' +
        'gói nghề, nên với vai này màn không có gì để dựng.');
    }

    /* Bọc phần điều khiển trong .man-xu để nới vùng chạm ĐÚNG Ở ĐÂY,
       không nới toàn cục: thanh kéo tua và ô nhập của xưởng cần ≥32px
       trên màn chạm, mà nới `input` toàn cục thì trăm ô ở màn khác nở
       theo (bài học "nới đúng chỗ" của cổng vào 9.99.80). */
    o += '<div class="man-xu">';

    /* 1 · Yêu cầu */
    o += '<div class="giay"><h3>1 · Yêu cầu</h3>';
    o += '<label>Chủ đề <input type="text" value="' + h(G.xuDA.ten) +
      '" oninput="G.xuSuaO(\'ten\',this.value)"></label>';
    o += '<div class="row"><label>Khổ hình ' +
      oChon('kho', G.xuDA.kho, KHO_HINH().map(function (k) { return k.ma; })) + '</label>';
    o += '<label>Thời lượng đích (giây) <input type="number" min="30" max="300" step="5" value="' +
      h(String(G.xuDA.dich)) + '" oninput="G.xuSuaO(\'dich\',this.value)"></label>';
    o += '<label>Khuôn ' + '<select onchange="G.xuSuaO(\'khuon\',this.value)">' +
      KHUON().map(function (k) {
        return '<option value="' + h(k.ma) + '"' + (k.ma === G.xuDA.khuon ? ' selected' : '') +
          '>' + h(k.ma + ' · ' + k.ten) + '</option>';
      }).join('') + '</select></label></div>';
    o += '<div class="row"><label>Tầng quyền ' +
      oChon('tang', G.xuDA.tang, ['T1 · công khai', 'T2 · phụ huynh đã đăng ký', 'T3 · nội bộ']) +
      '</label>';
    o += '<label>Nguồn tri thức <input type="text" value="' + h(G.xuDA.nguon) +
      '" oninput="G.xuSuaO(\'nguon\',this.value)"></label></div>';
    o += '<label>Điều nhỏ người xem làm được <input type="text" value="' + h(G.xuDA.dieuNho) +
      '" oninput="G.xuSuaO(\'dieuNho\',this.value)"></label>';
    o += '<div class="row"><button class="btn btn-chinh" onclick="G.xuViet()">Viết kịch bản</button>' +
      '<button class="btn" onclick="G.xuGoiSoat()">Soát lời đọc</button></div>';
    o += '<p class="note">Bộ viết chạy ngay trong máy, không gọi mạng. Ngân khố câu nằm ' +
      'trong kho nghề nên người viết nội dung sửa được mà không phải sửa mã.</p></div>';

    /* 2 · Màn xem thử */
    o += '<div class="giay"><h3>2 · Xem thử</h3>' +
      '<canvas id="xu-man" class="xu-man" width="1080" height="1920"></canvas>';
    o += '<div class="row"><button class="btn btn-chinh" onclick="G.xuXem()">Xem thử</button>' +
      '<button class="btn" onclick="G.xuDung()">Tạm dừng</button>' +
      '<button class="btn btn-do" onclick="G.xuDungKhan()">' +
      (G.xuGiuLai ? 'Mở lại video' : 'Dừng khẩn') + '</button>' +
      '<span class="note" id="xu-gio">0.0 / ' + tong().toFixed(1) + 's</span></div>';
    o += '<input type="range" min="0" max="100" step="0.1" value="0" class="xu-tua" ' +
      'aria-label="Tua video" oninput="G.xuTua(this.value)">';
    o += '<div class="row"><button class="btn btn-chinh" onclick="G.xuXuat()"' +
      (congMo() ? '' : ' disabled') + '>' +
      (congMo() ? 'Xuất video 1080p' : 'Chưa đủ đèn để xuất') + '</button>' +
      '<button class="btn" onclick="G.xuHuy()">Huỷ</button></div>';
    o += '<div class="xu-thanh"><i id="xu-tien"></i></div>';
    o += '<p class="note" id="xu-tt">Xuất chạy theo <b>thời gian thật</b>: video ba phút mất ' +
      'khoảng ba phút. Nói ra chứ không giấu sau một thanh chạy nhanh hơn sự thật.</p></div>';

    /* 3 · Kịch bản */
    o += '<div class="giay"><h3>3 · Kịch bản</h3>';
    var a = 0;
    o += (G.xuDA.canh || []).map(function (c, i) {
      var s = veCanh(c, i, a); a += (+c.giay || 0); return s;
    }).join('') || '<p class="note">Chưa có cảnh nào — bấm “Viết kịch bản”.</p>';
    o += '<div class="row"><button class="btn" onclick="G.xuThemCanh()">Thêm cảnh</button>' +
      '<span class="note" id="xu-tom">' + (G.xuDA.canh || []).length + ' cảnh · ' +
      phut(tong()) + ' · đích ' + phut(+G.xuDA.dich || 0) + '</span></div></div>';

    /* 4 · Kho vật liệu */
    o += '<div class="giay"><h3>4 · Kho hình &amp; tiếng</h3>' +
      '<input type="file" multiple accept="image/*,video/*,audio/*" ' +
      'onchange="G.xuNhanTep(this.files)" aria-label="Chọn ảnh, video hoặc tiếng">';
    var ks = Object.keys(G.xuVat);
    o += '<p class="note">' + (ks.length ? ks.length + ' tệp trong bộ nhớ trình duyệt: ' +
      ks.map(function (k) { return h(G.xuVat[k].ten); }).join(' · ')
      : 'Chưa có tệp nào. Tệp anh chọn nằm trong máy anh, xưởng không tải lên đâu cả.') +
      '</p></div>';

    /* 5 · Đèn */
    o += '<div class="giay"><h3>5 · Đèn kiểm định</h3>' +
      '<p class="note">Một đèn đỏ là cổng xuất đóng — cổng cứng, không có “xuất tạm” ' +
      '(LT_RM.RM-1). Hai đèn đầu <b>không đo ở đây</b>: chúng hỏi cửa <code>soatNoiDung</code>, ' +
      'vì hai bảng dấu hiệu lệch nhau thì cả hai đều xanh trên hai thứ khác nhau.</p>';
    o += (G.xuDangSoat ? '<p class="note">Đang hỏi cửa nội dung…</p>' : '');
    o += '<ul class="xu-den">' + den().map(function (l) {
      return '<li class="xu-' + l.tt + '"><b>' + h(l.t) + '</b> <em>' + h(l.ref) + '</em>' +
        '<span>' + h(l.n) + '</span></li>';
    }).join('') + '</ul></div>';

    /* 6 · Xuất kèm */
    o += '<div class="giay"><h3>6 · Xuất kèm</h3><div class="row">' +
      '<button class="btn" onclick="G.xuXuatSrt()">Phụ đề (.srt)</button>' +
      '<button class="btn" onclick="G.xuXuatHoSo()">Hộ chiếu video (.json)</button></div>' +
      '<p class="note">Hộ chiếu đi qua <b>cửa máy chủ</b>, không dựng ở màn hình: nó phải ' +
      'vào nhật ký thì mới truy được về sau, và một hộ chiếu dựng ở trình duyệt là một ' +
      'tờ giấy tự ký.</p></div>';

    setTimeout(function () { G.xuCoManh(); }, 0);
    return o + '</div>';
  };
})();
