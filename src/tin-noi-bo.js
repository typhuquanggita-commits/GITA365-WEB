/* ═══════════════════════════════════════════════════════════════
   GITA 365 · v9.69 — BẢNG TIN NỘI BỘ · PHẦN CHẠY

   Kho chuẩn ở kho-goc/data.tin-noi-bo.js (BTN_*). Khác hẳn
   src/bang-tin.js — bảng tin cộng đồng cho gia đình.

   ═══ BỐN CÁI KHOÁ ═══

   btnSoiPhamVi()      mỗi ngăn khai một quyền; quyền ấy phải CÓ THẬT
                       trong G.PERM và trần phải ≤ 12. Trần > 12 nghĩa
                       là phụ huynh, học viên hoặc cộng tác viên với
                       tới được — và đó đúng là điều chủ hệ đã cấm.
                       Đây là khoá đắt nhất của tệp này.

   btnSoiKhongXepHang() không hạng mục vinh danh nào được mang chữ xếp
                       hạng, và mỗi hạng mục phải khai ô khongDungLam.

   btnSoiNguonSo()     mọi con số hiện trên bảng phải khai nó đếm từ
                       đâu — luật mượn từ bảng tin cộng đồng.

   btnSoiTranNhac()    trần thông báo mỗi ngày phải là một con số thật
                       và phải cấm chuỗi leo thang, theo khoá K9.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;
G.VIEWS = G.VIEWS || {};

(function () {
  var U = G.U, h = U.h;

  /* Bậc cao nhất còn với tới được một quyền. Không khai quyền thì mọi
     vai đều với tới — với bảng này, đó là lỗi. */
  function tranCua(perm) {
    if (!perm) return 99;
    var p = (G.PERM || {})[perm];
    return typeof p === 'number' ? p : 99;
  }

  /* Ranh giới nghề: bậc cuối cùng còn được coi là người của Học viện.
     Đọc từ chính bậc thang, không chép con số — ngày ai thêm một vai
     nghề thì ranh giới tự dịch theo. */
  function ranhNghe() {
    var vais = G.ROLES || [];
    var khach = vais.filter(function (r) {
      return /Phụ huynh|Học viên|CTV|Đại sứ/i.test(String(r.n) + ' ' + String(r.short));
    });
    if (!khach.length) return 12;
    return Math.min.apply(null, khach.map(function (r) { return r.lv; })) - 1;
  }
  G.btnRanhNghe = ranhNghe;

  /* ═══════════ KHOÁ 1: PHẠM VI — KHÁCH KHÔNG ĐƯỢC VỚI TỚI ═══════════ */
  G.btnSoiPhamVi = function () {
    var ds = G.BTN_NGAN || [], loi = [];
    if (!ds.length) return { chuaDo: true, thieu: 'BTN_NGAN', loi: [] };
    var ranh = ranhNghe(), vais = G.ROLES || [];
    if (!vais.length) return { chuaDo: true, thieu: 'G.ROLES', loi: [] };

    /* Mẫu tự kiểm: ranh giới rút ra phải thật sự tách được người nghề
       khỏi khách. Không tách được thì phép này đang canh rỗng. */
    var nghe = vais.filter(function (r) { return r.lv <= ranh; });
    var khach = vais.filter(function (r) { return r.lv > ranh; });
    if (!nghe.length || !khach.length)
      loi.push('MẪU HỎNG · ranh giới nghề ' + ranh + ' không tách được hai nhóm — ' +
        nghe.length + ' vị trí nghề, ' + khach.length + ' vị trí khách');
    khach.forEach(function (r) {
      if (!/Phụ huynh|Học viên|CTV|Đại sứ/i.test(String(r.n) + ' ' + String(r.short)))
        loi.push('MẪU HỎNG · ' + r.id + ' (' + r.n + ') rơi vào nhóm khách mà không phải khách');
    });

    var thay = {};
    ds.forEach(function (n) {
      if (thay[n.ma]) loi.push(n.ma + ' trùng mã');
      thay[n.ma] = 1;
      ['ten', 'quyen', 'laGi', 'aiThay', 'lay'].forEach(function (k) {
        if (!n[k]) loi.push(n.ma + ' thiếu ô ' + k);
      });
      if (typeof (G.PERM || {})[n.quyen] !== 'number') {
        loi.push(n.ma + ' khai quyền "' + n.quyen + '" — quyền ấy KHÔNG có trong G.PERM, ' +
          'nên ngăn này đang mở cho mọi vai kể cả khách hàng');
        return;
      }
      var tran = tranCua(n.quyen);
      if (tran > ranh) {
        var loNguoi = vais.filter(function (r) { return r.lv > ranh && r.lv <= tran; });
        loi.push(n.ma + ' khoá ở "' + n.quyen + '" trần bậc ' + tran + ', vượt ranh giới ' +
          'nghề (' + ranh + ') — ' + loNguoi.map(function (r) { return r.id + ' ' + r.n; })
            .join(', ') + ' đọc được ngăn này');
      }
    });

    if (!(G.BTN_NGAN_LUAT || {}).moiNganKhaiQuyen)
      loi.push('chưa khai luật mỗi ngăn phải khai quyền');
    if (!(G.BTN_LUAT || {}).khoaODuLieu) loi.push('chưa khai luật khoá ở tầng dữ liệu');
    return { chuaDo: false, loi: loi, so: ds.length, ranh: ranh,
      soNghe: nghe.length, soKhach: khach.length };
  };

  /* ═══════════ KHOÁ 2: VINH DANH KHÔNG ĐƯỢC THÀNH XẾP HẠNG ═══════════

     Khoá K8 của hệ là khoá bất biến. Phép này canh hai chiều: chữ
     xếp hạng không được có mặt, và ô khongDungLam phải có mặt.

     Mỗi mẫu mang một cặp tự kiểm chạy TRƯỚC khi được xử ai — luật
     nhà, và nó đã cứu bốn lần trong kho này. */
  var CAM_HANG = [
    { ten: 'thứ hạng',
      re: /(xếp hạng|thứ hạng|hạng nhất|đứng đầu bảng|top\s*\d|bảng điểm|đua nhau|hơn đồng nghiệp)/i,
      bat: 'Bảng xếp hạng Coach theo số buổi đạt chuẩn trong tháng.',
      khongBat: 'Bảng này GHI NHẬN việc đã làm, KHÔNG xếp thứ hạng.' },
    { ten: 'người xuất sắc nhất',
      re: /(xuất sắc nhất|giỏi nhất|tốt nhất tháng|nhất tuần|quán quân)/i,
      bat: 'Coach xuất sắc nhất tháng này là người có nhiều ca nhất.',
      khongBat: 'Câu vinh danh nói VIỆC trước, tên sau — không dùng chữ xuất sắc nhất.' }
  ];

  function coTuChoi(cau, vt) {
    /* Nhìn lui tới ĐẦU MỆNH ĐỀ, không lui một số ký tự cố định. Đây
       là chỗ đã sai ở 9.66: một câu cấm dài có chữ phủ định ở đầu mà
       chỗ khớp ở cuối thì bị bắt oan. */
    var dau = cau.slice(0, vt), menh = dau.split(/[.!?;]\s/).pop();
    return /(^|[^a-zA-ZÀ-ỹ])(không|chưa|cấm|đừng|tránh|thay vì|chớ)([^a-zA-ZÀ-ỹ]|$)/i.test(menh) ||
           /\bKHÔNG\b/.test(menh);
  }

  /* Ô mang TÊN là bảng cấm thì nội dung của nó đương nhiên là việc
     không được làm — bắt nó là bắt oan chính câu luật. */
  var O_CAM = /^(khongLam|khongDungLam|viKhong|cam|vi|khongLaGi|camLeoThang|viCamLeoThang|ghiNhanKhongXepHang|vinhDanhViecKhongVinhDanhNguoi|oKhongDungLamLaOGiuBang)$/;

  G.btnSoiKhongXepHang = function () {
    var ds = G.BTN_VINHDANH || [], loi = [];
    if (!ds.length) return { chuaDo: true, thieu: 'BTN_VINHDANH', loi: [] };

    CAM_HANG.forEach(function (c) {
      if (!c.bat.match(c.re))
        loi.push('MẪU HỎNG · "' + c.ten + '" không bắt được câu đáng lẽ phải bắt');
      var m = c.khongBat.match(c.re);
      if (m && !coTuChoi(c.khongBat, m.index))
        loi.push('MẪU HỎNG · "' + c.ten + '" bắt oan câu tuân thủ');
    });

    var thay = {};
    ds.forEach(function (x) {
      if (thay[x.ma]) loi.push(x.ma + ' trùng mã');
      thay[x.ma] = 1;
      ['ten', 'canCu', 'doTuDau', 'aiXet', 'nhip', 'khongDungLam', 'viKhong'].forEach(function (k) {
        if (!x[k]) loi.push(x.ma + ' thiếu ô ' + k);
      });
      /* Căn cứ và cách đo KHÔNG được mang chữ xếp hạng. Ô khongDungLam
         và viKhong thì được — chúng là chỗ nói ra điều bị cấm. */
      ['canCu', 'doTuDau', 'ten'].forEach(function (k) {
        var cau = String(x[k] || '');
        CAM_HANG.forEach(function (c) {
          var m = cau.match(c.re);
          if (m && !coTuChoi(cau, m.index))
            loi.push(x.ma + '.' + k + ' mang chữ "' + c.ten + '": …' +
              cau.slice(Math.max(0, m.index - 20), m.index + 40) + '…');
        });
      });
    });

    /* Quét cả kho: ô nào KHÔNG phải bảng cấm mà mang chữ xếp hạng
       thì đỏ. Đi từng trường, không dồn cả kho thành một chuỗi —
       dồn thì phép chặn phủ định đọc nhầm sang trường bên cạnh. */
    var truong = [];
    (function diTung(v, duong) {
      if (typeof v === 'string') { truong.push({ duong: duong, cau: v }); return; }
      if (Array.isArray(v)) { v.forEach(function (x, i) { diTung(x, duong + '[' + i + ']'); }); return; }
      if (v && typeof v === 'object')
        Object.keys(v).forEach(function (k) { diTung(v[k], duong + '.' + k); });
    })({ BTN_LOI: G.BTN_LOI, BTN_NGAN: G.BTN_NGAN, BTN_TRAN: G.BTN_TRAN }, '');

    truong.forEach(function (t) {
      var ten = t.duong.split('.').pop().replace(/\[\d+\]$/, '');
      if (O_CAM.test(ten)) return;
      CAM_HANG.forEach(function (c) {
        var m = t.cau.match(c.re);
        if (m && !coTuChoi(t.cau, m.index))
          loi.push(t.duong + ' mang chữ "' + c.ten + '": …' +
            t.cau.slice(Math.max(0, m.index - 20), m.index + 40) + '…');
      });
    });

    if (!(G.BTN_VINHDANH_LUAT || {}).ghiNhanKhongXepHang)
      loi.push('chưa khai luật ghi nhận chứ không xếp hạng');
    if (!(G.BTN_VINHDANH_LUAT || {}).oKhongDungLamLaOGiuBang)
      loi.push('chưa khai vì sao ô khongDungLam là ô giữ bảng');
    return { chuaDo: false, loi: loi, so: ds.length };
  };

  /* ═══════════ KHOÁ 3: MỌI CON SỐ PHẢI KHAI NGUỒN ═══════════ */
  G.btnSoiNguonSo = function () {
    var ds = G.BTN_NGAN || [], loi = [];
    if (!ds.length) return { chuaDo: true, thieu: 'BTN_NGAN', loi: [] };
    ds.forEach(function (n) {
      /* Ngăn hiện số thì phải khai lấy số từ đâu. Ô lay là chỗ khai. */
      if (!n.lay) loi.push(n.ma + ' không khai lấy dữ liệu từ đâu');
      else if (String(n.lay).length < 12)
        loi.push(n.ma + ' khai nguồn quá sơ sài: "' + n.lay + '"');
    });
    (G.BTN_VINHDANH || []).forEach(function (x) {
      if (!x.doTuDau) loi.push(x.ma + ' không khai đo từ đâu');
    });
    if (!(G.BTN_LOI || {}).moiSoCoNguon) loi.push('chưa khai luật mỗi số phải có nguồn');
    if (!(G.BTN_LUAT || {}).moiSoKhaiNguon) loi.push('chưa khai lại luật ấy ở BTN_LUAT');
    return { chuaDo: false, loi: loi, so: ds.length };
  };

  /* ═══════════ KHOÁ 4: TRẦN THÔNG BÁO THEO KHOÁ K9 ═══════════ */
  G.btnSoiTranNhac = function () {
    var t = G.BTN_TRAN || {}, loi = [];
    if (!Object.keys(t).length) return { chuaDo: true, thieu: 'BTN_TRAN', loi: [] };
    if (typeof t.moiNgay !== 'number')
      loi.push('trần thông báo mỗi ngày phải là một CON SỐ, đang là "' + t.moiNgay + '"');
    else if (t.moiNgay < 1 || t.moiNgay > 5)
      loi.push('trần ' + t.moiNgay + ' tin mỗi ngày nằm ngoài khoảng 1–5 — quá thấp thì ' +
        'tin gấp không tới, quá cao thì người ta tắt thông báo');
    ['giaiThich', 'viBa', 'camLeoThang', 'viCamLeoThang', 'nguon'].forEach(function (k) {
      if (!t[k]) loi.push('BTN_TRAN thiếu ô ' + k);
    });
    /* Khoá K9 phải còn tồn tại và còn bất biến. Kho này viết dưới nó,
       nên ngày ai gỡ K9 thì kho này mất chỗ dựa và phải biết. */
    var k9 = (G.HL_KHOA9 || []).filter(function (x) { return x.ma === 'K9'; })[0];
    if (!k9) loi.push('khoá K9 không còn trong HL_KHOA9 — bảng tin đang mất chỗ dựa');
    else if (!k9.batBien) loi.push('khoá K9 không còn bất biến — trần thông báo mất hiệu lực');
    return { chuaDo: false, loi: loi, tran: t.moiNgay };
  };

  /* ═══════════════════════════════════════════════════════════
     MÀN HÌNH
     ═══════════════════════════════════════════════════════════ */
  G.VIEWS['tin-noi-bo'] = function () {
    if (!G.BTN_NGAN)
      return U.empty('Chưa mở được phần này',
        'Bảng tin nội bộ nằm trong gói nghề. Đăng nhập bằng tài khoản có quyền nghề để nạp.');

    var loi = G.BTN_LOI || {};
    var kqP = G.btnSoiPhamVi(), kqX = G.btnSoiKhongXepHang(),
        kqN = G.btnSoiNguonSo(), kqT = G.btnSoiTranNhac();
    var lech = [].concat(kqP.loi || [], kqX.loi || [], kqN.loi || [], kqT.loi || []);
    var toi = (G.S && G.S.roleObj) || null;
    var bacToi = toi ? toi.lv : 99;

    var o = U.ph({ eyebrow: 'BẢNG TIN NỘI BỘ', ic: 'bell', grad: 1,
      t: 'Năm ngăn · ' + (kqP.soNghe || 0) + ' vị trí thấy · ' + (kqP.soKhach || 0) +
         ' vị trí không',
      lead: loi.laGi || '' });

    o += '<div class="card mb" style="border-color:' + (lech.length ? '#BE0E16' : '#B4720F') + '56">' +
      '<b class="sm" style="color:#B4720F">' + h(loi.cauDatNhat || '') + '</b>' +
      '<p class="tiny mt" style="line-height:1.75">' + h(loi.khongLaGi || '') + '</p>' +
      '<p class="tiny mt" style="line-height:1.75;color:#0B6675">' + h(loi.aiThay || '') + '</p>' +
      '<p class="tiny mt" style="line-height:1.75">' + h(loi.khoaODauLieu || '') + '</p>' +
      '<p class="tiny dim mt" style="line-height:1.7">' + h(loi.nguon || '') + '</p>' +
      (lech.length ? '<p class="tiny mt" style="line-height:1.7;color:#BE0E16"><b>LỆCH: ' +
        h(lech.slice(0, 4).join(' · ')) + '</b></p>' : '') + '</div>';

    /* ── Ai thấy, ai không — đo lúc chạy ── */
    o += U.sec('Ai đọc được bảng này — đo từ bậc thang lúc chạy',
      (G.BTN_NGAN_LUAT || {}).moiNganKhaiQuyen || '');
    o += '<div class="card mb" style="border-color:' +
      ((kqP.loi || []).length ? '#BE0E16' : '#0B6675') + '56">' +
      U.tbl(['Bậc', 'Vị trí', 'Bảng tin nội bộ', 'Ngăn số toàn hệ'],
        (G.ROLES || []).map(function (r) {
          var thayBang = r.lv <= (kqP.ranh || 12);
          var thayN5 = r.lv <= tranCua('dh_toan_he');
          return ['<b>' + r.lv + '</b>', h(r.id) + ' · ' + h(r.n),
            thayBang ? '<b style="color:#0B6675">ĐỌC ĐƯỢC</b>'
                     : '<b style="color:#BE0E16">KHÔNG</b>',
            thayN5 ? '<b style="color:#0B6675">có</b>' : '<span class="dim">không</span>'];
        })) +
      '<p class="tiny mt" style="line-height:1.75">' +
      ((kqP.loi || []).length ? '<b style="color:#BE0E16">' + h((kqP.loi || []).join(' · ')) + '</b>'
        : '<b style="color:#0B6675">Ranh giới nghề ở bậc ' + kqP.ranh + ', đọc từ chính bậc ' +
          'thang chứ không chép con số. Không ngăn nào vượt qua ranh giới ấy.</b>') +
      '</p></div>';

    /* ── Năm ngăn ── */
    o += U.sec('Năm ngăn của bảng tin',
      (G.BTN_NGAN_LUAT || {}).vieCTruocTinSau || '');
    o += '<div class="card mb">' + (G.BTN_NGAN || []).map(function (n) {
      var tran = tranCua(n.quyen), toiThay = bacToi <= tran;
      return '<div style="padding:12px 0;border-bottom:1px solid var(--gita-vien-2)">' +
        '<b class="sm" style="color:' + h(n.c || '') + '">' + h(n.ma) + ' · ' + h(n.ten) + '</b> ' +
        (toiThay ? '<span class="tiny up" style="color:#0B6675">VAI CỦA BẠN ĐỌC ĐƯỢC</span>'
                 : '<span class="tiny up" style="color:#655F7E">NGOÀI PHẠM VI VAI CỦA BẠN</span>') +
        '<p class="tiny mt" style="line-height:1.75">' + h(n.laGi) + '</p>' +
        '<p class="tiny" style="line-height:1.75"><b>Ai thấy:</b> ' + h(n.aiThay) +
        ' <span class="dim">· khoá ' + h(n.quyen) + ', trần bậc ' + tran + '</span></p>' +
        '<p class="tiny" style="line-height:1.75"><b>Lấy số từ:</b> ' + h(n.lay) + '</p>' +
        (n.viDauTien ? '<p class="tiny mt" style="line-height:1.75;color:#B4720F">' +
          h(n.viDauTien) + '</p>' : '') +
        (n.viHep ? '<p class="tiny mt" style="line-height:1.75;color:#B4720F">' +
          h(n.viHep) + '</p>' : '') +
        (n.khongLam ? '<p class="tiny mt" style="line-height:1.75;color:#BE0E16">' +
          '<b>Không làm:</b> ' + h(n.khongLam) + '</p>' : '') + '</div>';
    }).join('') + '</div>';

    o += G.kaKhung ? G.kaKhung('tin-noi-bo', 'dau') : '';

    /* ── Vinh danh ── */
    o += U.sec('Bảng vinh danh — ghi nhận việc, không xếp thứ hạng',
      (G.BTN_VINHDANH_LUAT || {}).vinhDanhViecKhongVinhDanhNguoi || '');
    o += '<div class="card mb">' + (G.BTN_VINHDANH || []).map(function (x) {
      return '<div style="padding:13px 0;border-bottom:1px solid var(--gita-vien-2)">' +
        '<b class="sm" style="color:' + h(x.c || '') + '">' + h(x.ma) + ' · ' + h(x.ten) + '</b> ' +
        '<span class="tiny dim">' + h(x.nhip) + '</span>' +
        (x.canDongY ? ' <span class="tiny up" style="color:#BE0E16">CẦN GIA ĐÌNH ĐỒNG Ý</span>' : '') +
        '<p class="tiny mt" style="line-height:1.75"><b>Căn cứ:</b> ' + h(x.canCu) + '</p>' +
        '<p class="tiny" style="line-height:1.75"><b>Đo từ đâu:</b> ' + h(x.doTuDau) + '</p>' +
        '<p class="tiny" style="line-height:1.75"><b>Ai xét:</b> ' + h(x.aiXet) + '</p>' +
        '<p class="tiny mt" style="line-height:1.75;color:#BE0E16"><b>KHÔNG được dùng làm ' +
        'căn cứ:</b> ' + h(x.khongDungLam) + '</p>' +
        '<p class="tiny" style="line-height:1.75;color:#B4720F">' + h(x.viKhong) + '</p></div>';
    }).join('') +
      '<p class="tiny mt" style="line-height:1.75">' +
      h((G.BTN_VINHDANH_LUAT || {}).oKhongDungLamLaOGiuBang || '') + '</p></div>';

    /* ── Trần thông báo ── */
    var t = G.BTN_TRAN || {};
    o += U.sec('Trần thông báo mỗi ngày', t.nguon || '');
    o += '<div class="card mb" style="border-color:' +
      ((kqT.loi || []).length ? '#BE0E16' : '#B4720F') + '56">' +
      '<div style="display:flex;gap:24px;align-items:baseline;flex-wrap:wrap">' +
      '<div><span class="tiny up" style="color:#B4720F">TỐI ĐA MỖI NGÀY</span><br>' +
      '<b style="font-size:1.9em;color:#B4720F">' + h(String(t.moiNgay)) + '</b>' +
      '<span class="tiny dim"> tin đẩy cho một người</span></div></div>' +
      '<p class="tiny mt" style="line-height:1.75">' + h(t.giaiThich || '') + '</p>' +
      '<p class="tiny mt" style="line-height:1.75">' + h(t.viBa || '') + '</p>' +
      '<p class="tiny mt" style="line-height:1.75;color:#BE0E16"><b>' +
      h(t.camLeoThang || '') + '</b></p>' +
      '<p class="tiny" style="line-height:1.75">' + h(t.viCamLeoThang || '') + '</p></div>';

    /* ── Tám điều cấm ── */
    o += U.sec('Tám điều bảng tin nội bộ không được làm', '');
    o += '<div class="card mb">' + (G.BTN_CAM || []).map(function (x) {
      return '<div style="padding:9px 0;border-bottom:1px solid var(--gita-vien-2)">' +
        '<b class="sm" style="color:#BE0E16">' + h(x.cam) + '</b>' +
        '<p class="tiny mt" style="line-height:1.75">' + h(x.vi) + '</p></div>';
    }).join('') + '</div>';

    /* ── Bảng tự soi ── */
    o += U.sec('Bảng tin tự soi mình', (G.BTN_LUAT || {}).duoiBonLuatCu || '');
    o += '<div class="card mb">' + U.tbl(['Phép kiểm', 'Canh gì', 'Kết quả'], [
      ['btnSoiPhamVi()', 'Mỗi ngăn khoá ở quyền có thật, và trần không vượt ranh giới nghề',
        (kqP.loi || []).length ? '<b style="color:#BE0E16">' + h((kqP.loi || []).join(' · ')) + '</b>'
          : '<b style="color:#0B6675">' + kqP.so + ' ngăn · ranh giới bậc ' + kqP.ranh +
            ' · ' + kqP.soKhach + ' vị trí khách không với tới ngăn nào</b>'],
      ['btnSoiKhongXepHang()', 'Không hạng mục nào mang chữ xếp hạng; mỗi hạng mục có ô khongDungLam',
        (kqX.loi || []).length ? '<b style="color:#BE0E16">' + h((kqX.loi || []).join(' · ')) + '</b>'
          : '<b style="color:#0B6675">' + kqX.so + ' hạng mục · không ô nào mang chữ xếp hạng</b>'],
      ['btnSoiNguonSo()', 'Mọi ngăn và mọi hạng mục khai được nó đếm từ đâu',
        (kqN.loi || []).length ? '<b style="color:#BE0E16">' + h((kqN.loi || []).join(' · ')) + '</b>'
          : '<b style="color:#0B6675">' + kqN.so + ' ngăn · mọi con số có nguồn</b>'],
      ['btnSoiTranNhac()', 'Trần thông báo là con số thật, cấm chuỗi leo thang, khoá K9 còn bất biến',
        (kqT.loi || []).length ? '<b style="color:#BE0E16">' + h((kqT.loi || []).join(' · ')) + '</b>'
          : '<b style="color:#0B6675">trần ' + kqT.tran + ' tin mỗi ngày · K9 còn bất biến</b>']
    ]) + '</div>';

    return o;
  };
})();
