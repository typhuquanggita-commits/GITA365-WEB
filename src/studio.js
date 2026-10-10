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

   2. **Không gọi bộ tạo chữ từ trình duyệt.** XU-02 chỉ mở đường soạn
      bản nháp qua Worker cho Super Admin, sau xác nhận gửi và cổng ẩn
      danh; dữ liệu khách không được gửi và bản nháp không tự phát hành.

   3. **KHÔNG có `esc()` riêng.** `U.h()` đã có, và bản chép của bản
      mẫu sót dấu nháy đơn — mà lời đọc tiếng Việt đầy dấu nháy đơn.

   4. **Không sinh mã bằng `crypto.randomUUID()`.** Bản `.exe` mở tệp
      bằng `file://`, ở đó nó không tồn tại và cả xưởng ném lỗi ngay
      dòng đầu — trong khi mọi lượt thử qua https đều xanh. Đúng lớp
      lỗi nhánh `isTTY` ở 9.99.79.

   ══ CHỖ BẢN MẪU ĐÚNG VÀ KHÔNG ĐƯỢC "CẢI TIẾN" ══

   **Không gọi dịch vụ tạo giọng/ảnh/video bên ngoài.** Giọng đến từ
   micro người thật hoặc tệp có sẵn. Hình tham chiếu, phối cảnh, màu phim
   và nhạc được xử lý cục bộ; ảnh tĩnh không được quảng bá là MC 3D biết
   nói hay biểu cảm thật.
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
  var mcMacDinh = {
    hinh: 'mc-gita-mau', vaiDan: 'mc', sacThai: 'than-thien', mayQuay: 'dolly',
    mauPhim: 'dien-anh', viTri: 'phai', nhacNen: '', amLuongNhac: 0.18,
    amLuongGiong: 1
  };
  G.xuDA.mc = G.xuDA.mc || {};
  Object.keys(mcMacDinh).forEach(function (k) {
    if (G.xuDA.mc[k] == null) G.xuDA.mc[k] = mcMacDinh[k];
  });
  G.xuVat = G.xuVat || {};       // mã → {ma,ten,loai,url,el,buffer}
  if (typeof Image !== 'undefined' && !G.xuVat['mc-gita-mau']) {
    var anhMC = new Image();
    G.xuVat['mc-gita-mau'] = {ma: 'mc-gita-mau', ten: 'MC GITA · ảnh tham chiếu',
      loai: 'hinh', el: anhMC, mau: true};
    anhMC.onload = function () { veLai(); };
    anhMC.src = 'assets/anh/gita-mc-tham-chieu.png';
  }
  G.xuSoat = G.xuSoat || null;   // kết quả cửa soatNoiDung
  G.xuDangSoat = false;
  G.xuBanNhapAI = null;
  G.xuGiuLai = '';               // lời khai lúc bấm Dừng khẩn
  G.xuDanhGiaPilot = G.xuDanhGiaPilot || {};

  /* Pilot có chủ ý nhỏ: ba màn nền tảng, mỗi màn ba video 3p30. Các câu
     chuyên môn vẫn đi qua Ngân khố câu khi dựng; danh sách này chỉ giữ
     cấu trúc sản xuất, lịch thử và những dữ liệu cần đo. */
  var CHUOI_PILOT = [
    {ma: 'gioi-thieu', ten: 'Giới thiệu GITA 365', nguon: 'Màn Giới thiệu',
      videos: [
        ['GT-01', 'Giới thiệu', 'Vì sao gia đình cần một hệ điều hành chung', 'Chọn một việc cả nhà cùng thử tối nay.'],
        ['GT-02', 'Phân tích & hướng dẫn', 'Đọc một màn GITA 365 để bắt đầu đúng', 'Mở màn này và chọn một điều nhỏ phù hợp gia đình.'],
        ['GT-03', 'Tình huống & thực hành', 'Một buổi tối bận rộn vẫn có thể bắt đầu', 'Hỏi từng người một câu ngắn trước giờ nghỉ.']
      ]},
    {ma: 'hanh-trinh-5-tang', ten: 'Hành trình 5 tầng', nguon: 'Màn Hành trình 5 tầng',
      videos: [
        ['HT-01', 'Giới thiệu', 'Năm tầng giúp gia đình đi từng bước', 'Xác định tầng phù hợp với gia đình hôm nay.'],
        ['HT-02', 'Phân tích & hướng dẫn', 'Cách chọn việc vừa sức ở tầng đang đứng', 'Chọn một việc nhỏ, rõ người làm và thời điểm làm.'],
        ['HT-03', 'Tình huống & thực hành', 'Khi mọi người muốn thay đổi quá nhanh', 'Cùng thống nhất một bước trong bảy ngày tới.']
      ]},
    {ma: 'so-tay-gia-dinh', ten: 'Sổ tay gia đình', nguon: 'Màn Sổ tay gia đình',
      videos: [
        ['ST-01', 'Giới thiệu', 'Sổ tay biến điều mong muốn thành việc hằng ngày', 'Ghi một điều gia đình muốn giữ trong tuần này.'],
        ['ST-02', 'Phân tích & hướng dẫn', 'Cách ghi một cam kết gia đình dễ thực hiện', 'Viết một cam kết có người làm và thời điểm cụ thể.'],
        ['ST-03', 'Tình huống & thực hành', 'Khi cam kết bị bỏ quên giữa tuần', 'Họp gia đình năm phút để điều chỉnh cam kết.']
      ]}
  ];
  var KHUNG_BAT_BUOC = [
    ['hook', 'Hook', 15], ['phan-tich-man', 'Phân tích màn', 25],
    ['huong-dan', 'Hướng dẫn thao tác', 30], ['vi-du', 'Ví dụ', 30],
    ['tinh-huong', 'Tình huống gia đình', 30], ['bai-hoc', 'Bài học đúc kết', 30],
    ['nguyen-vong', 'Nguyện vọng gia đình', 25], ['trainer-mc', 'Hoạt động Trainer/MC', 25]
  ];

  function keHoachVideo(thongTin, man) {
    var ma = thongTin[0], dinhDang = thongTin[1], tieuDe = thongTin[2], cta = thongTin[3];
    return {
      ma: ma, man: man.ma, manTen: man.ten, dinhDang: dinhDang, tieuDe: tieuDe,
      thoiLuong: 210, cta: cta, nguon: man.nguon,
      thanhPhan: KHUNG_BAT_BUOC.map(function (p) {
        return {ma: p[0], ten: p[1], giay: p[2],
          canh: p[1] + ' · MC/Trainer đứng dẫn, chuyển động máy quay 2.5D nhẹ và phụ đề đồng bộ.'};
      })
    };
  }
  function tatCaVideoPilot() {
    var ra = [];
    CHUOI_PILOT.forEach(function (man) {
      man.videos.forEach(function (v) { ra.push(keHoachVideo(v, man)); });
    });
    return ra;
  }
  function loiMau(keHoach, phan) {
    var chu = keHoach.tieuDe;
    var noi = {
      hook: 'Nếu gia đình đang bận, hãy bắt đầu bằng một điều nhỏ thay vì cố sửa mọi thứ cùng lúc.',
      'phan-tich-man': 'Màn này giúp cả nhà nhìn rõ bước đang đứng, để không chọn việc vượt quá sức hiện tại.',
      'huong-dan': 'Cùng mở màn, chọn một mục phù hợp, rồi ghi rõ người làm và thời điểm thực hiện.',
      'vi-du': 'Ví dụ, cả nhà dành năm phút sau bữa tối để mỗi người nói một điều mình cần được lắng nghe.',
      'tinh-huong': 'Khi một người quên việc đã hẹn, Trainer mời gia đình điều chỉnh cách làm thay vì trách móc.',
      'bai-hoc': 'Bài học là một cam kết nhỏ được làm đều có giá trị hơn một kế hoạch lớn bị bỏ dở.',
      'nguyen-vong': 'Gia đình mong có thêm thời gian lắng nghe nhau và cùng giữ nhịp sinh hoạt ấm áp.',
      'trainer-mc': 'MC hoặc Trainer mời mọi người đứng dậy, chọn một hành động trong tuần và nói lời cam kết ngắn.'
    };
    return chu + '. ' + (noi[phan.ma] || '');
  }
  G.xuNapVideoChuoi = function (ma) {
    var ke = tatCaVideoPilot().filter(function (x) { return x.ma === ma; })[0];
    if (!ke) return;
    var d = G.xuDA;
    d.ten = ke.tieuDe; d.dich = ke.thoiLuong; d.nguon = ke.nguon;
    d.dieuNho = ke.cta; d.cta = ke.cta; d.keHoachVideo = ke;
    if (G.xu3D) G.xu3D.khongGian = ke.dinhDang === 'Phân tích & hướng dẫn'
      ? 'san-khau-huan-luyen' : 'bang-dao-tao';
    d.canh = ke.thanhPhan.map(function (p, i) {
      return {id: ma + '-' + p.ma, vai: p.ma, giay: p.giay, loi: loiMau(ke, p),
        chuMan: p.ten, hinh: p.canh, vatHinh: '', vatTieng: '',
        sacThai: i === 0 ? 'truyen-cam-hung' : 'than-thien'};
    });
    G.xuSoat = null; veLai();
  };
  G.xuCapNhatDanhGiaPilot = function (ma, o, gt) {
    var d = G.xuDanhGiaPilot[ma] || {hoanThanh: 0, phanHoi: ''};
    d[o] = o === 'hoanThanh' ? Math.max(0, Math.min(100, +gt || 0)) : String(gt || '');
    G.xuDanhGiaPilot[ma] = d; veLai();
  };

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
      loi: x.loi, chuMan: x.chu, hinh: x.hinh, vatHinh: '', vatTieng: '',
      sacThai: 'than-thien'};
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

  G.xuSoanDeBaiNgoai = function () {
    var dongY = typeof document !== 'undefined' && document.getElementById('xuDongYAI');
    if (!dongY || !dongY.checked) {
      U.toast('Xác nhận trước khi gửi đề bài ra nhà cung cấp.', 'err'); return;
    }
    if (!G.goiMayChu || G.xuBanNhapAI && G.xuBanNhapAI.dang) return;
    var d = G.xuDA;
    var deBai = 'Chủ đề: ' + String(d.ten || '').trim() +
      '\nNgười xem: ' + String(d.nguoiXem || '').trim() +
      '\nTầng nội dung: ' + String(d.tang || '').trim() +
      '\nĐiều nhỏ cần truyền đạt: ' + String(d.dieuNho || '').trim();
    G.xuBanNhapAI = {dang: true, banNhap: ''}; veLai();
    G.goiMayChu('soanDeBaiNgoai', {deBai: deBai}).then(function (x) {
      G.xuBanNhapAI = x && x.ok ? x : {ok: false, error: x && x.error || 'Không tạo được bản nháp.'};
      veLai();
    }).catch(function (e) {
      G.xuBanNhapAI = {ok: false, error: String(e && e.message || e)};
      veLai();
    });
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
    if (o === 'giay' || o === 'vatHinh' || o === 'sacThai') G.xuVe(G.xuDongHo);
    G.xuTomTat();
  };
  G.xuSuaO = function (o, gt) {
    G.xuDA[o] = gt;
    if (o === 'kho') G.xuCoManh();
    veLai();
  };
  G.xuSuaMC = function (o, gt) {
    if (['hinh', 'vaiDan', 'sacThai', 'mayQuay', 'mauPhim', 'viTri', 'nhacNen',
      'amLuongNhac', 'amLuongGiong'].indexOf(o) < 0) return;
    G.xuDA.mc[o] = (o === 'amLuongNhac' || o === 'amLuongGiong')
      ? Math.max(0, Math.min(1, +gt || 0)) : gt;
    G.xuVe(G.xuDongHo);
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
    var baD = G.xu3DKiem ? G.xu3DKiem() : null;
    if (baD) o.push({tt: baD.sanSang ? 'ok' : 'warn', t: 'Quyền nhân vật 3D & giọng thu',
      ref: 'ST-3D', n: baD.sanSang ? 'Mô hình cục bộ, quyền sử dụng, lời thoại và sự đồng ý giọng đã đủ.'
        : 'Chưa đủ điều kiện dùng nhân vật 3D diễn xuất; Studio chỉ xem sân khấu kỹ thuật/2.5D.'});

    var mc = G.xuDA.mc || {}, anhMC = G.xuVat[mc.hinh];
    var anhMCsanSang = anhMC && anhMC.loai === 'hinh' && anhMC.el &&
      (anhMC.el.width || anhMC.el.naturalWidth);
    o.push({tt: anhMCsanSang ? 'ok' : 'warn', t: 'Ảnh tham chiếu MC',
      ref: 'ST-MC', n: anhMC ? 'Ảnh chỉ được dùng làm lớp tham chiếu cục bộ, không biến thành hoạt ảnh khuôn mặt.'
        : 'Chưa chọn ảnh MC. Có thể dùng ảnh mẫu hoặc tệp ảnh chọn ngay trên thiết bị.'});

    o.push({tt: 'nguoi', t: 'Chất ấm — nghe có như người quen nói không', ref: 'LT_AM.WS-3',
      n: 'Một người nghe hết rồi ký tên, và người ấy không được là người dựng. Máy chấm ' +
        'được từ ngữ và nhịp câu; nó KHÔNG chấm được câu này, và câu trả lời của máy cho ' +
        'nó nghe y hệt câu trả lời thật.'});

    if (G.xuGiuLai) o.push({tt: 'bad', t: 'Video đang bị giữ lại', ref: 'LT_MOC.G1-4',
      n: G.xuGiuLai});
    return o;
  }
  /* ══ VẼ 1080p ══ */
  G.xuDongHo = 0;
  function khung() {
    var k = KHO_HINH().filter(function (x) { return x.ma === G.xuDA.kho; })[0];
    return (k && k.r) || [1080, 1920];
  }
  function boLocMau(mau) {
    return mau === 'am' ? 'sepia(.16) saturate(1.12)'
      : mau === 'lanh' ? 'saturate(.86) hue-rotate(8deg)'
        : mau === 'trang-den' ? 'grayscale(1) contrast(1.08)'
          : mau === 'song-dong' ? 'saturate(1.18) contrast(1.04)' : 'contrast(1.05) saturate(1.04)';
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
    var mc = G.xuDA.mc || {};
    var mayQuay = mc.mayQuay || 'dolly';
    var doLech = (giay - cur.a) * 0.7;
    var tiLe = mayQuay === 'tinh' ? 1.03
      : mayQuay === 'orbit' ? 1.12
        : mayQuay === 'troi' ? 1.09 : 1.06 + 0.08 * p;
    var panX = mayQuay === 'orbit' ? Math.sin(doLech) * W * 0.012
      : mayQuay === 'troi' ? Math.sin(doLech * 0.45) * W * 0.008 : 0;
    var panY = mayQuay === 'troi' ? Math.cos(doLech * 0.5) * H * 0.008 : 0;
    ct.save();
    if ('filter' in ct) ct.filter = boLocMau(mc.mauPhim);
    if (v && v.loai === 'hinh' && v.el) phu(ct, v.el, W, H, tiLe, panX, panY);
    else nenDen(ct, W, H, cur.i, p);
    ct.restore();

    if (cur.i > 0 && p < 0.5) {
      var truoc = G.xuVat[G.xuDA.canh[cur.i - 1].vatHinh];
      if (truoc && truoc.loai === 'hinh' && truoc.el) {
        ct.save(); ct.globalAlpha = 1 - p / 0.5;
        phu(ct, truoc.el, W, H, tiLe, -panX, -panY);
        ct.restore();
      }
    }
    if (G.xu3D && G.xu3D.khongGian === 'bang-dao-tao') veBangDaoTao(ct, c, W, H, u);
    veMC(ct, mc, W, H, u, c.sacThai);

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
    if (mc.mauPhim === 'dien-anh') veKhungDienAnh(ct, W, H);

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
  function phu(ct, el, W, H, ti, panX, panY) {
    var iw = el.width || el.naturalWidth, ih = el.height || el.naturalHeight;
    if (!iw || !ih) return;
    panX = +panX || 0; panY = +panY || 0;
    var r = Math.max(W / iw, H / ih) * ti, w = iw * r, hh = ih * r;
    ct.drawImage(el, (W - w) / 2 + panX, (H - hh) / 2 + panY, w, hh);
  }
  function veMC(ct, mc, W, H, u, sacThaiCanh) {
    var v = G.xuVat[mc.hinh], el = v && v.el;
    if (!el || v.loai !== 'hinh' || !(el.width || el.naturalWidth)) return;
    var iw = el.width || el.naturalWidth, ih = el.height || el.naturalHeight;
    var bw = W * 0.31, bh = H * 0.40, pad = 10 * u;
    var x = mc.viTri === 'trai' ? W * 0.045 : W - bw - W * 0.045;
    var y = H * 0.075;
    ct.save();
    ct.shadowColor = 'rgba(0,0,0,.55)'; ct.shadowBlur = 28 * u;
    ct.fillStyle = 'rgba(7,18,39,.78)'; ct.fillRect(x, y, bw, bh);
    ct.shadowBlur = 0;
    if ('filter' in ct) ct.filter = boLocMau(mc.mauPhim);
    var r = Math.min((bw - pad * 2) / iw, (bh - pad * 2) / ih);
    var w = iw * r, h = ih * r;
    ct.drawImage(el, x + (bw - w) / 2, y + (bh - h) / 2, w, h);
    if ('filter' in ct) ct.filter = 'none';
    ct.strokeStyle = 'rgba(255,255,255,.78)'; ct.lineWidth = 2 * u;
    ct.strokeRect(x, y, bw, bh);
    ct.fillStyle = 'rgba(5,14,28,.82)'; ct.fillRect(x, y + bh - 46 * u, bw, 46 * u);
    ct.fillStyle = '#FFFFFF'; ct.textAlign = 'left';
    ct.font = '700 ' + (22 * u) + 'px sans-serif';
    ct.fillText((mc.vaiDan === 'trainer' ? 'TRAINER GITA' : 'MC GITA') + ' · ' +
      String(sacThaiCanh || mc.sacThai || 'than-thien').replace(/-/g, ' ').toUpperCase(),
      x + 12 * u, y + bh - 16 * u, bw - 24 * u);
    ct.restore();
  }
  function veBangDaoTao(ct, c, W, H, u) {
    var bw = W * 0.57, bh = H * 0.42, x = W * 0.07, y = H * 0.13;
    ct.save();
    ct.fillStyle = 'rgba(10,51,45,.92)'; ct.fillRect(x, y, bw, bh);
    ct.strokeStyle = '#D8A94D'; ct.lineWidth = 6 * u; ct.strokeRect(x, y, bw, bh);
    ct.fillStyle = 'rgba(255,250,234,.94)'; ct.textAlign = 'left';
    ct.font = '700 ' + (32 * u) + 'px sans-serif'; ct.fillText('GITA 365', x + 34 * u, y + 62 * u);
    ct.font = '600 ' + (25 * u) + 'px sans-serif';
    xuong(ct, c.chuMan || 'Cùng học một điều nhỏ', x + 34 * u, y + 116 * u, bw - 68 * u, 28 * u, 600);
    ct.strokeStyle = 'rgba(255,250,234,.56)'; ct.lineWidth = 2 * u;
    for (var i = 0; i < 3; i++) ct.strokeRect(x + 34 * u, y + (190 + i * 54) * u, 22 * u, 22 * u);
    ct.restore();
  }
  function veKhungDienAnh(ct, W, H) {
    ct.fillStyle = 'rgba(0,0,0,.48)';
    ct.fillRect(0, 0, W, H * 0.025);
    ct.fillRect(0, H * 0.975, W, H * 0.025);
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
        var n = a.createBufferSource(), gain = a.createGain();
        var pan = a.createStereoPanner ? a.createStereoPanner() : null;
        n.buffer = v.buffer; gain.gain.value = G.xuDA.mc.amLuongGiong;
        n.connect(gain);
        if (pan) {
          pan.pan.value = G.xuDA.mc.viTri === 'trai' ? -0.18 : 0.18;
          gain.connect(pan); pan.connect(dich);
        } else gain.connect(dich);
        n.start(t0 + at); nut.push(n);
      }
      at += (+c.giay || 0);
    });
    var nhac = G.xuVat[G.xuDA.mc.nhacNen];
    if (nhac && nhac.buffer) {
      var nen = a.createBufferSource(), am = a.createGain();
      nen.buffer = nhac.buffer; nen.loop = true;
      am.gain.value = G.xuDA.mc.amLuongNhac;
      nen.connect(am); am.connect(dich); nen.start(t0); nut.push(nen);
    }
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
  G.xuDung = function () {
    /* Dừng giữa lúc đang xuất = huỷ bản ghi: một tệp phim có đoạn đứng hình
       ở giữa trông vẫn "xong", và người nhận không biết nó hỏng. */
    if (G.xuGhi && G.xuGhi.state === 'recording' && G.xuDongHo < tong() - 0.05) { G.xuHuyXuat = true; G.xuGhi.stop(); }
    chay = false; cancelAnimationFrame(raf); dungTieng();
  };
  function nhip(gio) {
    if (!chay) return;
    G.xuDongHo += (gio - mocTruoc) / 1000; mocTruoc = gio;
    if (G.xuDongHo >= tong()) {
      G.xuDongHo = tong(); G.xuVe(G.xuDongHo);
      if (G.xuGhi && G.xuGhi.state === 'recording') G.xuGhi.stop();
      G.xuDung(); return;
    }
    G.xuVe(G.xuDongHo);
    raf = requestAnimationFrame(nhip);
  }
  G.xuTua = function (v) {
    G.xuDung(); G.xuDongHo = tong() * (+v / 100); G.xuVe(G.xuDongHo);
  };

  /* ══ XUẤT PHIM (N3 · soát 10/2026) ══
     Bản cũ chỉ có chữ "chưa nối renderer" — Studio soạn được, xem được,
     nhưng không ra tệp nào. Nay ghi đúng thứ đang xem: canvas 1080p
     (captureStream) + tiếng xếp bởi xepTieng vào một nút đích ghi được.
     Cổng: một đèn ĐỎ là không xuất (LT_RM.RM-1 — không có "xuất tạm"),
     Dừng khẩn là huỷ bản đang ghi. Lưu qua ngoại lệ có tên N4
     (G.luuTepPhim: R01–R02, không máy khách, ghi sổ máy chủ). */
  /* Đèn "chưa soát" cũng đóng cổng: phim là thứ rời khỏi xưởng, nên lời
     đọc phải qua cửa nội dung TRƯỚC khi thành tệp, không phải sau. */
  G.xuDenDo = function () { return den().filter(function (l) { return l.tt === 'bad' || l.tt === 'cho'; }); };
  G.xuXuat = function () {
    if (G.xuGhi && G.xuGhi.state === 'recording') return;
    if (!tong()) { U.toast('Chưa có cảnh nào để xuất.', 'err'); return; }
    var dd = G.xuDenDo();
    if (dd.length) { U.toast('Cổng xuất đóng: ' + dd.map(function (l) { return l.t; }).join(' · '), 'err'); return; }
    if (!G.duocLuuPhim || !G.duocLuuPhim()) return;
    var cv = document.getElementById('xu-man');
    if (!cv || !cv.captureStream || !window.MediaRecorder) {
      U.toast('Trình duyệt này không ghi được video. Dùng Chrome hoặc Edge trên máy tính.', 'err'); return;
    }
    var kieu = ['video/mp4;codecs=avc1.42E01E,mp4a.40.2', 'video/mp4', 'video/webm;codecs=vp9,opus', 'video/webm']
      .filter(function (k) { return MediaRecorder.isTypeSupported(k); })[0];
    if (!kieu) { U.toast('Trình duyệt này không có định dạng video ghi được.', 'err'); return; }
    var mp4 = /mp4/.test(kieu), duoi = mp4 ? '.mp4' : '.webm', mo = mp4 ? 'video/mp4' : 'video/webm';
    var a = ac(); a.resume();
    var dich = a.createMediaStreamDestination(), tron = a.createGain();
    tron.connect(a.destination); tron.connect(dich);
    var luong = cv.captureStream(30);
    dich.stream.getAudioTracks().forEach(function (t) { luong.addTrack(t); });
    var manh = [], ghi = new MediaRecorder(luong, {mimeType: kieu, videoBitsPerSecond: 8000000});
    ghi.ondataavailable = function (e) { if (e.data && e.data.size) manh.push(e.data); };
    ghi.onstop = function () {
      var huy = G.xuHuyXuat; G.xuGhi = null; G.xuHuyXuat = false;
      try { tron.disconnect(); } catch (e) {}
      if (huy) { U.toast('Đã huỷ bản đang xuất.', 'ok'); veLai(); return; }
      var ten = String(G.xuDA.ten || 'studio').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/gi, 'd').replace(/[^a-z0-9]+/gi, '-').toLowerCase().slice(0, 60) + duoi;
      G.luuTepPhim(new Blob(manh, {type: kieu}), ten, mo, duoi, 'phim').then(function () { veLai(); });
    };
    G.xuDung(); G.xuDongHo = 0; G.xuHuyXuat = false; G.xuGhi = ghi;
    ghi.start(1000);
    chay = true; mocTruoc = performance.now();
    xepTieng(tron);
    raf = requestAnimationFrame(nhip);
    U.toast('Đang xuất theo thời gian thực (' + phut(tong()) + '). Giữ tab này mở và hiện trên màn hình.', 'ok');
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
        U.toast('Studio hiện nhận ảnh và âm thanh cục bộ; chưa nhận hoặc kết xuất tệp phim.', 'err');
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
    o += '<label>Chỉ đạo biểu cảm <select onchange="G.xuSuaCanh(\'' + h(c.id) +
      '\',\'sacThai\',this.value)">' +
      [['than-thien','Thân thiện'],['vui-tuoi','Vui tươi'],['dong-cam','Đồng cảm'],
        ['suy-tu','Suy tư'],['nghiem-tuc','Nghiêm túc'],['khich-le','Khích lệ']]
        .map(function (x) { return '<option value="' + x[0] + '"' +
          ((c.sacThai || 'than-thien') === x[0] ? ' selected' : '') + '>' + x[1] + '</option>'; }).join('') +
      '</select></label>';
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
      'MC tham chiếu, chuyển động máy quay, màu phim và phối nhạc xử lý ngay trên thiết bị. ' +
      'Ảnh, giọng và nhạc không tải lên máy chủ hay dịch vụ ngoài.</p></div>';

    /* Một chỗ chặn duy nhất, TRƯỚC mọi ngăn. Vai không có gói nghề thì
       kho không bao giờ nạp, và mọi ngăn sẽ dựng ra khung rỗng — mà
       một khung rỗng đọc ra là "chỗ này chưa làm xong", không đọc ra
       là "vai của bạn không mở được" (bài học 9.99.63). */
    if (!(G.XU_NGANKHO || []).length) {
      /* N2 (soát 10/2026): bản cũ nói "dành cho tài khoản được cấp quyền"
         kể cả với Super Admin — trong khi nguyên nhân thật là máy chủ cấp
         phép không trả gói nghề. Nói SAI nguyên nhân thì người đọc đi xin
         quyền, không đi nối máy chủ. Nay tách ba trường hợp. */
      var K = G.KHO || {}, loiNghe = K.loiMo && K.loiMo.nghe;
      var xinNghe = G.goiDuocCap ? G.goiDuocCap().indexOf('nghe') >= 0 : false;
      if ((K.dangNap || []).indexOf('nghe') >= 0) {
        return o + U.empty('Đang mở gói nghề…', 'Studio dựng ngay khi gói nghề giải mã xong.');
      }
      if (xinNghe && (K.cheDoMau || K.maTuChoi || loiNghe)) {
        return o + U.empty('Không nối được máy chủ cấp phép — Studio cần gói nghề',
          'Tài khoản này được xin gói nghề, nhưng máy chủ chưa trả khoá' +
          (K.lyDoTuChoi || loiNghe ? ' (' + String(K.lyDoTuChoi || loiNghe).slice(0, 160) + ')' : '') +
          '. Đây là chuyện nối máy chủ, không phải chuyện quyền.') +
          (G.can && G.can('qt_trang') ? '<p><button class="btn btn-chinh" data-v="noi-may-chu">Nối máy chủ</button></p>' : '');
      }
      return o + U.empty('Xưởng Studio dành cho tài khoản được cấp quyền',
        'Màn sản xuất nội bộ chỉ mở khi phiên có gói nghề tương ứng. Nội dung dựng, hình ' +
        'tham chiếu và âm thanh được xử lý tại thiết bị; quyền xem không đồng nghĩa với ' +
        'quyền phát hành video.');
    }

    /* Bọc phần điều khiển trong .man-xu để nới vùng chạm ĐÚNG Ở ĐÂY,
       không nới toàn cục: thanh kéo tua và ô nhập của xưởng cần ≥32px
       trên màn chạm, mà nới `input` toàn cục thì trăm ô ở màn khác nở
       theo (bài học "nới đúng chỗ" của cổng vào 9.99.80). */
    o += '<div class="man-xu">';

    /* 0 · Chuỗi video — nạp một video là nạp đủ kịch bản, shot list,
       thời lượng và CTA vào cùng G.xuDA mà Studio đang dựng. */
    var videoPilot = tatCaVideoPilot();
    o += '<div class="giay"><h3>0 · Chuỗi video thử nghiệm</h3>' +
      '<p class="note">Ba màn ưu tiên × ba video 3 phút 30 giây = 10 phút 30 giây/màn. ' +
      'Mỗi video có đủ 8 phần bắt buộc; chọn video để nạp kịch bản, cảnh quay, thời lượng và CTA vào Studio.</p>' +
      '<div class="row"><label>Video thử nghiệm <select onchange="G.xuNapVideoChuoi(this.value)">' +
      '<option value="">— chọn video để dựng —</option>' + videoPilot.map(function (v) {
        return '<option value="' + h(v.ma) + '">' + h(v.manTen + ' · ' + v.ma + ' · ' + v.dinhDang) + '</option>';
      }).join('') + '</select></label></div>';
    if (G.xuDA.keHoachVideo) {
      var ke = G.xuDA.keHoachVideo;
      o += '<p class="note"><b>' + h(ke.ma + ' · ' + ke.dinhDang) + '</b> · ' +
        h(ke.thoiLuong / 60 + ' phút') + ' · CTA: ' + h(ke.cta) + '</p>';
    }
    o += '<div class="row" style="flex-wrap:wrap">' + videoPilot.map(function (v) {
      var dg = G.xuDanhGiaPilot[v.ma] || {hoanThanh: 0, phanHoi: ''};
      return '<div class="note" style="max-width:300px"><b>' + h(v.ma + ' · ' + v.dinhDang) + '</b><br>' +
        h(v.manTen) + '<br><label>Hoàn thành <input type="number" min="0" max="100" value="' +
        h(String(dg.hoanThanh)) + '" onchange="G.xuCapNhatDanhGiaPilot(\'' + h(v.ma) +
        '\',\'hoanThanh\',this.value)">%</label><label>Phản hồi gia đình <input type="text" value="' +
        h(dg.phanHoi) + '" onchange="G.xuCapNhatDanhGiaPilot(\'' + h(v.ma) +
        '\',\'phanHoi\',this.value)"></label></div>';
    }).join('') + '</div><p class="note">Chỉ số thử nghiệm ở phiên làm việc này: tỷ lệ hoàn thành và phản hồi ngắn của gia đình. ' +
      'Không tự gửi dữ liệu gia đình ra ngoài.</p></div>';

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
    if (G.S && G.S.acc && G.S.acc.role === 'R01') {
      o += '<label class="note"><input id="xuDongYAI" type="checkbox"> Tôi xác nhận đề bài không chứa thông tin nhận dạng ' +
        'khách hàng và đồng ý gửi đề bài tới OpenAI để tạo bản nháp.</label>' +
        '<button class="btn" onclick="G.xuSoanDeBaiNgoai()">' +
        (G.xuBanNhapAI && G.xuBanNhapAI.dang ? 'Đang soạn…' : 'Soạn bản nháp AI · qua máy chủ') + '</button>';
      if (G.xuBanNhapAI && G.xuBanNhapAI.ok)
        o += '<div class="note"><b>' + h(G.xuBanNhapAI.nhac || 'Bản nháp cần người duyệt.') +
          '</b><pre class="sm" style="white-space:pre-wrap">' + h(G.xuBanNhapAI.banNhap) + '</pre></div>';
      else if (G.xuBanNhapAI && G.xuBanNhapAI.error)
        o += '<p class="note">' + h(G.xuBanNhapAI.error) + '</p>';
    }
    o += '<p class="note">Bộ viết chạy ngay trong máy, không gọi mạng. Ngân khố câu nằm ' +
      'trong kho nghề nên người viết nội dung sửa được mà không phải sửa mã.</p></div>';

    /* 2 · MC và đạo diễn hình ảnh — tài liệu tham chiếu chỉ xử lý tại máy. */
    var hinhMC = Object.keys(G.xuVat).filter(function (k) {
      return G.xuVat[k].loai === 'hinh';
    });
    var amNhac = Object.keys(G.xuVat).filter(function (k) {
      return G.xuVat[k].loai === 'tieng';
    });
    var mc = G.xuDA.mc;
    o += '<div class="giay xu-mc"><h3>2 · MC &amp; đạo diễn hình ảnh</h3>' +
      '<div class="row"><label>Người dẫn <select onchange="G.xuSuaMC(\'vaiDan\',this.value)">' +
      '<option value="mc"' + (mc.vaiDan === 'mc' ? ' selected' : '') + '>MC đứng dẫn</option>' +
      '<option value="trainer"' + (mc.vaiDan === 'trainer' ? ' selected' : '') + '>Trainer đứng đào tạo</option>' +
      '</select></label><label>Ảnh tham chiếu MC/Trainer <select onchange="G.xuSuaMC(\'hinh\',this.value)">' +
      '<option value="">— không chèn MC —</option>' + hinhMC.map(function (k) {
        return '<option value="' + h(k) + '"' + (k === mc.hinh ? ' selected' : '') + '>' +
          h(G.xuVat[k].ten) + '</option>';
      }).join('') + '</select></label>' +
      '<label>Vị trí MC <select onchange="G.xuSuaMC(\'viTri\',this.value)">' +
      '<option value="phai"' + (mc.viTri === 'phai' ? ' selected' : '') + '>Phải</option>' +
      '<option value="trai"' + (mc.viTri === 'trai' ? ' selected' : '') + '>Trái</option></select></label>' +
      '<label>Sắc thái dẫn chuyện <select onchange="G.xuSuaMC(\'sacThai\',this.value)">' +
      [['than-thien','Thân thiện'],['truyen-cam-hung','Truyền cảm hứng'],['binh-tinh','Bình tĩnh'],['nghiem-tuc','Nghiêm túc']]
        .map(function (x) { return '<option value="' + x[0] + '"' +
          (mc.sacThai === x[0] ? ' selected' : '') + '>' + x[1] + '</option>'; }).join('') +
      '</select></label></div>' +
      '<div class="row"><label>Chuyển động máy quay <select onchange="G.xuSuaMC(\'mayQuay\',this.value)">' +
      [['dolly','Dolly-in nhẹ'],['orbit','Trôi vòng cung'],['troi','Trôi mềm'],['tinh','Khung tĩnh']]
        .map(function (x) { return '<option value="' + x[0] + '"' +
          (mc.mayQuay === x[0] ? ' selected' : '') + '>' + x[1] + '</option>'; }).join('') +
      '</select></label><label>Màu phim <select onchange="G.xuSuaMC(\'mauPhim\',this.value)">' +
      [['dien-anh','Điện ảnh'],['am','Ấm'],['lanh','Lạnh'],['song-dong','Sống động'],['trang-den','Trắng đen']]
        .map(function (x) { return '<option value="' + x[0] + '"' +
          (mc.mauPhim === x[0] ? ' selected' : '') + '>' + x[1] + '</option>'; }).join('') +
      '</select></label><label>Nhạc nền cục bộ <select onchange="G.xuSuaMC(\'nhacNen\',this.value)">' +
      '<option value="">— không nhạc —</option>' + amNhac.map(function (k) {
        return '<option value="' + h(k) + '"' + (k === mc.nhacNen ? ' selected' : '') + '>' +
          h(G.xuVat[k].ten) + '</option>';
      }).join('') + '</select></label></div>' +
      '<div class="row"><label>Âm lượng giọng <input type="range" min="0" max="1" step="0.05" value="' +
      h(String(mc.amLuongGiong)) + '" onchange="G.xuSuaMC(\'amLuongGiong\',this.value)"></label>' +
      '<label>Âm lượng nhạc <input type="range" min="0" max="0.6" step="0.02" value="' +
      h(String(mc.amLuongNhac)) + '" onchange="G.xuSuaMC(\'amLuongNhac\',this.value)"></label></div>' +
      '<p class="note">MC/Trainer đứng dẫn bằng ảnh tham chiếu trong khung; chỉ đạo cảnh và chuyển động máy quay ' +
      '2.5D tạo nhịp gần quay trực tiếp, nhưng không tuyên bố nhân vật 3D hoặc nét mặt chuyển động khi chưa có renderer. ' +
      'Giọng chất lượng dùng micro hoặc tệp thu sẵn, khớp thời lượng từng cảnh và nghe thử trước kiểm duyệt; bộ dựng ' +
      'không tạo bản sao giọng AI. Âm thanh stereo được đặt nhẹ theo vị trí người dẫn.</p></div>';

    /* 3 · Màn xem thử */
    o += '<div class="giay"><h3>3 · Xem thử</h3>' +
      '<canvas id="xu-man" class="xu-man" width="1080" height="1920"></canvas>';
    o += '<div class="row"><button class="btn btn-chinh" onclick="G.xuXem()">Xem thử</button>' +
      '<button class="btn" onclick="G.xuDung()">Tạm dừng</button>' +
      '<button class="btn btn-do" onclick="G.xuDungKhan()">' +
      (G.xuGiuLai ? 'Mở lại video' : 'Dừng khẩn') + '</button>' +
      '<span class="note" id="xu-gio">0.0 / ' + tong().toFixed(1) + 's</span></div>';
    o += '<input type="range" min="0" max="100" step="0.1" value="0" class="xu-tua" ' +
      'aria-label="Tua video" oninput="G.xuTua(this.value)">';
    o += '<p class="note" id="xu-tt">Đây là bản xem trước 2.5D dựng tại thiết bị; chưa phải nhân vật 3D ' +
      'biểu cảm thật hay phim 4D/5D. Mục 7 ghi đúng bản xem này thành tệp video. Hình, giọng và nhạc ' +
      'không được gửi đi.</p></div>';

    o += G.xu3DPanel ? G.xu3DPanel() : '';

    /* 3 · Kịch bản */
    o += '<div class="giay"><h3>4 · Kịch bản</h3>';
    var a = 0;
    o += (G.xuDA.canh || []).map(function (c, i) {
      var s = veCanh(c, i, a); a += (+c.giay || 0); return s;
    }).join('') || '<p class="note">Chưa có cảnh nào — bấm “Viết kịch bản”.</p>';
    o += '<div class="row"><button class="btn" onclick="G.xuThemCanh()">Thêm cảnh</button>' +
      '<span class="note" id="xu-tom">' + (G.xuDA.canh || []).length + ' cảnh · ' +
      phut(tong()) + ' · đích ' + phut(+G.xuDA.dich || 0) + '</span></div></div>';

    /* 4 · Kho vật liệu */
    o += '<div class="giay"><h3>5 · Kho hình &amp; tiếng</h3>' +
      '<input type="file" multiple accept="image/*,video/*,audio/*" ' +
      'onchange="G.xuNhanTep(this.files)" aria-label="Chọn ảnh, video hoặc tiếng">';
    var ks = Object.keys(G.xuVat);
    o += '<p class="note">' + (ks.length ? ks.length + ' tệp trong bộ nhớ trình duyệt: ' +
      ks.map(function (k) { return h(G.xuVat[k].ten); }).join(' · ')
      : 'Chưa có tệp nào. Tệp anh chọn nằm trong máy anh, xưởng không tải lên đâu cả.') +
      '</p></div>';

    /* 5 · Đèn */
    o += '<div class="giay"><h3>6 · Đèn kiểm định</h3>' +
      '<p class="note">Một đèn đỏ là cổng xuất đóng — cổng cứng, không có “xuất tạm” ' +
      '(LT_RM.RM-1). Hai đèn đầu <b>không đo ở đây</b>: chúng hỏi cửa <code>soatNoiDung</code>, ' +
      'vì hai bảng dấu hiệu lệch nhau thì cả hai đều xanh trên hai thứ khác nhau.</p>';
    o += (G.xuDangSoat ? '<p class="note">Đang hỏi cửa nội dung…</p>' : '');
    o += '<ul class="xu-den">' + den().map(function (l) {
      return '<li class="xu-' + l.tt + '"><b>' + h(l.t) + '</b> <em>' + h(l.ref) + '</em>' +
        '<span>' + h(l.n) + '</span></li>';
    }).join('') + '</ul></div>';

    /* 6 · Xuất kèm */
    var doXuat = G.xuDenDo();
    o += '<div class="giay"><h3>7 · Xuất phim</h3>' +
      '<p class="note">Ghi đúng bản đang xem — canvas ' + khung().join('×') + ' cùng giọng và nhạc — thành tệp ' +
      'video ngay trên máy, theo thời gian thực. Không gửi ảnh/giọng lên dịch vụ ngoài. Lưu tệp chỉ dành cho ' +
      'Super Admin và Admin hệ thống, và mỗi lượt lưu vào sổ (ngoại lệ N4).</p>' +
      (doXuat.length ? '<p class="note xu-bad">Cổng xuất đóng — còn ' + doXuat.length + ' đèn đỏ: ' +
        doXuat.map(function (l) { return h(l.t); }).join(' · ') + '.</p>' : '') +
      '<div class="row"><button class="btn btn-chinh" onclick="G.xuXuat()"' + (doXuat.length ? ' disabled' : '') + '>' +
      (G.xuGhi ? 'Đang xuất…' : 'Xuất phim') + '</button>' +
      (G.xuGhi ? '<button class="btn" onclick="G.xuDung()">Huỷ bản đang xuất</button>' : '') + '</div></div>';

    setTimeout(function () { G.xuCoManh(); }, 0);
    return o + '</div>';
  };
})();
