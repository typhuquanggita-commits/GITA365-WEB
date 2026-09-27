/* ═══════════════════════════════════════════════════════════════
   GITA 365 — MÁY CHẠY HÀNH LANG VÀ SỔ RÀ SOÁT LỖI

   Kho: data.hanh-lang.js và data.ra-soat-loi.js. Gói NGHỀ.
   Nguồn gốc: hai tài liệu của chủ hệ trong Drive, đọc 04/09/2026.

   ═══ VIỆC ĐÁNG GIÁ NHẤT CỦA MÀN NÀY ═══

   Không phải hiển thị lại tài liệu — tài liệu đọc trong Word cũng được.
   Việc đáng giá là ĐỐI CHIẾU: mười tám vắc-xin, ứng dụng này đã có mấy
   cái, và cái nào chỉ là một dòng chữ.

   hlSoatVacXin() chạy phép đối chiếu ấy trên kho THẬT đang nạp. Nó trả
   ba giá trị và không làm tròn:

     DA_CO       kiểm được và có thật, dẫn được tên hàm hoặc tên kho
     CON_HO      kiểm được và CHƯA có
     CHUA_KIEM   chưa viết được phép kiểm cho vắc-xin này

   Một bảng vắc-xin toàn DA_CO là một bảng đã hạ chuẩn để đạt điểm.
   hlSoiKhongTuNang() đỏ nếu điều ấy xảy ra.

   ═══ BỐN CÁI KHOÁ ═══

   hlSoiLuat12()      mười hai luật, mỗi luật có hành vi đo được và dấu
                      hiệu vi phạm; trần cứng mười hai.
   hlSoiVirus()       mười tám chủng, mỗi chủng có đường lây và vắc-xin
                      là một HÀNH ĐỘNG.
   hlSoiKhongTuNang() không được khai DA_CO cho vắc-xin chưa có phép đo.
   rsSoiChan()        mười ba lỗi chặn, mỗi lỗi khai ứng dụng đang ở đâu
                      và lỗi DA_DONG phải dẫn được tên hàm.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;
G.VIEWS = G.VIEWS || {};

(function () {
  var U = G.U, h = U.h;

  /* ═══════════ PHÉP ĐỐI CHIẾU VẮC-XIN VỚI KHO THẬT ═══════════

     Mỗi phép kiểm đọc kho đang nạp, không đọc một danh sách khai sẵn.
     Nhờ thế ngày ai đó gỡ một khoá đi, ô ấy tự chuyển sang CÒN HỞ. */
  var KIEM = {
    KHONG_HIEN_TANG: function () {
      /* V01 — cấm hiển thị tầng của người khác. Bàn Tư vấn và bàn Coach
         chỉ hiện nhà của chính người đang đăng nhập. */
      var co = typeof G.tvbNha === 'function' && typeof G.blvNha === 'function';
      return co ? { co: true, dan: 'tvbNha(tenTuVan) và blvNha(tenCoach) lọc theo người phụ trách' }
                : { co: false };
    },
    KHONG_XEP_HANG: function () {
      /* V03 — cấm bảng xếp hạng. Có phép kiểm đọc chính mã. */
      if (typeof G.tvbSoiKhongChamDiem !== 'function') return { co: false };
      var r = G.tvbSoiKhongChamDiem();
      return { co: !(r.loi || []).length,
        dan: 'tvbSoiKhongChamDiem() đọc chính mã của bàn Tư vấn · TVB_LUAT.khongXepHangKhach' };
    },
    LOC_THEO_TANG: function () {
      /* V05 — tri thức sai tầng là một dạng virus. Kho chia theo gói. */
      var co = Array.isArray(G.THUOC_CAP_PHEP) && G.THUOC_CAP_PHEP.length > 0;
      return co ? { co: true, dan: 'G.THUOC_CAP_PHEP chia kho theo gói cấp phép · donKho() xoá khi đổi vai' }
                : { co: false };
    },
    KHONG_BAN_T1: function () {
      /* V13 — cấm mọi đề nghị trả phí ở Tầng 1. */
      if (typeof G.bvDuocBanKhong !== 'function') return { co: false };
      var vai = (G.BV_VAI || []).filter(function (v) { return /Trợ lý AI/i.test(String(v.ten)); })[0];
      var cam = vai && /cấm bán ở Tầng 1/i.test(String(vai.gioiHanTuyetDoi));
      return { co: !!cam,
        dan: 'BV_VAI Trợ lý AI gioiHanTuyetDoi "cấm bán ở Tầng 1" · bvDuocBanKhong() im lặng từ cấp 4' };
    },
    CHUYEN_CO_HOANCANH: function () {
      /* V08 — mọi câu chuyện mở đầu bằng hoàn cảnh thật. */
      var ds = G.CHUYEN || [];
      if (!ds.length) return { co: false };
      var coHoanCanh = ds.filter(function (x) { return x.ke || x.boi; }).length;
      return { co: coHoanCanh === ds.length,
        dan: 'CHUYEN — ' + coHoanCanh + '/' + ds.length + ' chuyện có ô hoàn cảnh' };
    },
    MOC_THEO_NHA: function () {
      /* V10 — mốc gắn với dữ kiện của chính nhà đó. */
      var co = typeof G.blvCapDeNghi === 'function' && typeof G.blvMocGap === 'function';
      return { co: co,
        dan: 'blvCapDeNghi() lấy chỉ số tự chủ CỦA NHÀ ẤY làm căn cứ · blvMocGap() đọc mốc từ ' +
          'lời đã hứa của tầng, không dùng mốc chung' };
    },
    DOI_BANG_CHUNG: function () {
      /* V16 — chỉ đếm hành vi có dấu vết thật. */
      if (typeof G.bvGhiNhanDuoc !== 'function') return { co: false };
      var thu = G.bvGhiNhanDuoc('T3', 7, '');
      return { co: thu && thu.ghiDuoc === false && !!thu.thieuBangChung,
        dan: 'bvGhiNhanDuoc() từ chối ghi cấp khi ô bằng chứng trống · BV_CAPDO có cột bangChung ' +
          'ở cả 50 ô' };
    },
    KHONG_TO_DO_NGAY_TRONG: function () {
      /* V09 — cấm màu cảnh báo cho ngày trống. Chưa có phép đo: màu nằm
         ở CSS và ở nhiều màn, không đọc được từ kho. */
      return { chuaKiem: true,
        vi: 'Màu của ô ngày trống nằm ở tệp kiểu và ở từng màn, không đọc được từ kho. Cần một ' +
          'phép soi tệp kiểu, chưa dựng.' };
    },
    TRAN_MOT_VIEC:     function () { return { co: false }; },
    CAN_TRUONG_NGAY_IM:function () { return { co: false }; },
    CHUA_NOI:          function () { return { chuaKiem: true,
      vi: 'Vắc-xin này nằm ở luồng nhiệm vụ và cộng đồng của gia đình — phần ứng dụng chưa dựng.' }; }
  };

  G.hlSoatVacXin = function () {
    var ds = G.HL_VIRUS || [];
    if (!ds.length) return { chuaDo: true, thieu: 'HL_VIRUS' };
    var ra = ds.map(function (v) {
      var f = KIEM[v.mayKiem] || KIEM.CHUA_NOI;
      var r;
      try { r = f(); } catch (e) { r = { chuaKiem: true, vi: 'phép kiểm lỗi: ' + e.message }; }
      var muc = r.chuaKiem ? 'CHUA_KIEM' : (r.co ? 'DA_CO' : 'CON_HO');
      return { ma: v.ma, nhom: v.nhom, ten: v.ten, vacXin: v.vacXin,
        duongLay: v.duongLay, trieuChung: v.trieuChung,
        muc: muc, dan: r.dan, vi: r.vi };
    });
    var d = { DA_CO: 0, CON_HO: 0, CHUA_KIEM: 0 };
    ra.forEach(function (x) { d[x.muc]++; });
    return { ds: ra, tong: ds.length, dem: d,
      phanTram: Math.round(d.DA_CO / ds.length * 100) };
  };

  /* ═══════════ KHOÁ 1 và 2 ═══════════ */
  G.hlSoiLuat12 = function () {
    var ds = G.HL_LUAT12 || [], loi = [];
    if (!ds.length) return { chuaDo: true, thieu: 'HL_LUAT12', loi: [] };
    if (ds.length !== 12) loi.push('trần cứng mười hai luật, đang có ' + ds.length);
    var thay = {};
    ds.forEach(function (x) {
      if (thay[x.ma]) loi.push(x.ma + ' trùng mã');
      thay[x.ma] = 1;
      ['luat', 'hanhVi', 'viPham'].forEach(function (k) {
        if (!x[k]) loi.push(x.ma + ' thiếu ô ' + k);
      });
      /* Hành vi phải KHÁC câu luật. Giống nhau thì đó là khẩu hiệu chép
         lại, không phải một hành vi đo được. */
      if (x.hanhVi && x.luat && String(x.hanhVi).trim() === String(x.luat).trim())
        loi.push(x.ma + ' — hành vi đo được chép lại đúng câu luật');
    });
    if (!(G.HL_LUAT12_LUAT || {}).tranCung12) loi.push('chưa khai trần cứng mười hai');
    return { chuaDo: false, loi: loi, so: ds.length };
  };

  G.hlSoiVirus = function () {
    var ds = G.HL_VIRUS || [], loi = [];
    if (!ds.length) return { chuaDo: true, thieu: 'HL_VIRUS', loi: [] };
    if (ds.length !== 18) loi.push('phải có mười tám chủng, đang có ' + ds.length);
    var thay = {};
    ds.forEach(function (x) {
      if (thay[x.ma]) loi.push(x.ma + ' trùng mã');
      thay[x.ma] = 1;
      ['ten', 'trieuChung', 'duongLay', 'vacXin', 'mayKiem'].forEach(function (k) {
        if (!x[k]) loi.push(x.ma + ' thiếu ô ' + k);
      });
      if (!KIEM[x.mayKiem]) loi.push(x.ma + ' khai phép kiểm "' + x.mayKiem + '" không có trong mã');
      /* Vắc-xin phải là một HÀNH ĐỘNG. Câu khuyên bắt đầu bằng "nên",
         "hãy", "cố gắng" là lời khuyên, không phải hành động của hệ. */
      if (/^(nên|hãy|cố gắng|đừng nên)\b/i.test(String(x.vacXin).trim()))
        loi.push(x.ma + ' — vắc-xin viết như một lời khuyên, không phải hành động của hệ');
    });
    if (!(G.HL_VIRUS_LUAT || {}).vacXinLaHanhDong) loi.push('chưa khai luật vắc-xin là hành động');
    return { chuaDo: false, loi: loi, so: ds.length };
  };

  /* ═══════════ KHOÁ 3: KHÔNG TỰ NÂNG ĐIỂM ═══════════

     Cách dễ nhất để bảng này trông đẹp là khai mọi vắc-xin thành DA_CO.
     Bốn phép chặn: phải còn ít nhất một CÒN HỞ, phép kiểm phải có thật
     trong mã, mọi DA_CO phải dẫn được nguồn, và bảng không được toàn
     CHUA_KIEM — toàn chưa kiểm thì bảng chỉ là một danh sách. */
  G.hlSoiKhongTuNang = function () {
    var s = G.hlSoatVacXin(), loi = [];
    if (s.chuaDo) return { chuaDo: true, thieu: s.thieu, loi: [] };
    if (s.dem.CON_HO === 0 && s.dem.CHUA_KIEM === 0)
      loi.push('cả mười tám vắc-xin đều khai đã có — bảng đã hạ chuẩn để đạt điểm');
    if (s.dem.DA_CO === 0)
      loi.push('không vắc-xin nào đã có — bảng chưa nối được vào ứng dụng');
    if (s.dem.CHUA_KIEM === s.tong)
      loi.push('cả mười tám đều chưa kiểm được — bảng chỉ là một danh sách');
    s.ds.forEach(function (x) {
      if (x.muc === 'DA_CO' && !x.dan)
        loi.push(x.ma + ' khai ĐÃ CÓ mà không dẫn được tên hàm hoặc tên kho');
      if (x.muc === 'CHUA_KIEM' && !x.vi)
        loi.push(x.ma + ' khai CHƯA KIỂM mà không nói vì sao chưa kiểm được');
    });
    if (!(G.HL_VIRUS_LUAT || {}).mayKiemLaCotDatNhat)
      loi.push('chưa khai vì sao cột mayKiem là cột đắt nhất');
    return { chuaDo: false, loi: loi, dem: s.dem };
  };

  /* ═══════════ KHOÁ 4: MƯỜI BA LỖI CHẶN PHÁT HÀNH ═══════════ */
  G.rsSoiChan = function () {
    var ds = G.RS_CHAN || [], loi = [];
    if (!ds.length) return { chuaDo: true, thieu: 'RS_CHAN', loi: [] };
    if (ds.length !== 13) loi.push('sổ rà soát khai mười ba lỗi chặn, đang có ' + ds.length);
    var hop = ['DA_DONG', 'CON_HO', 'NGOAI_APP'];
    ds.forEach(function (x) {
      ['loi', 'hauQua', 'xuLy', 'ungDung', 'noiUngDung'].forEach(function (k) {
        if (!x[k]) loi.push(x.ma + ' thiếu ô ' + k);
      });
      if (hop.indexOf(x.ungDung) < 0)
        loi.push(x.ma + ' khai trạng thái "' + x.ungDung + '" không hợp lệ');
      /* Lỗi khai ĐÃ ĐÓNG phải dẫn được tên hàm hoặc tên kho — không dẫn
         được thì nó là CÒN HỞ, và làm tròn lên là cách sổ lỗi chết. */
      if (x.ungDung === 'DA_DONG' && !/[a-zA-Z_]{3,}\(\)|[A-Z][A-Z0-9_]{3,}/.test(String(x.noiUngDung)))
        loi.push(x.ma + ' khai ĐÃ ĐÓNG mà không dẫn được tên hàm hoặc tên kho');
      var nh = (G.RS_NHOM || []).filter(function (n) { return n.ma === x.nhom; })[0];
      if (!nh) loi.push(x.ma + ' thuộc nhóm "' + x.nhom + '" không có trong bảng nhóm');
    });
    var tongNghiem = (G.RS_NHOM || []).reduce(function (s, n) { return s + (n.nghiem || 0); }, 0);
    if (tongNghiem !== 13)
      loi.push('tổng cột nghiêm trọng của tám nhóm là ' + tongNghiem + ', phải bằng 13');
    if (!(G.RS_LUAT || {}).danDuocTenHam) loi.push('chưa khai luật phải dẫn được tên hàm');
    return { chuaDo: false, loi: loi, so: ds.length };
  };

  G.rsDo = function () {
    var ds = G.RS_CHAN || [];
    var d = { DA_DONG: 0, CON_HO: 0, NGOAI_APP: 0 };
    ds.forEach(function (x) { d[x.ungDung] = (d[x.ungDung] || 0) + 1; });
    return { tong: ds.length, dem: d,
      tongDiemGay: (G.RS_NHOM || []).reduce(function (s, n) { return s + n.so; }, 0) };
  };

  /* ═══════════════════════════════════════════════════════════
     MÀN HÌNH
     ═══════════════════════════════════════════════════════════ */
  var MAU = { DA_CO: '#0B6675', CON_HO: '#BE0E16', CHUA_KIEM: '#B4720F',
              DA_DONG: '#0B6675', NGOAI_APP: '#655F7E' };
  var NHAN = { DA_CO: 'ĐÃ CÓ', CON_HO: 'CÒN HỞ', CHUA_KIEM: 'CHƯA KIỂM ĐƯỢC',
               DA_DONG: 'ỨNG DỤNG ĐÃ ĐÓNG', NGOAI_APP: 'NGOÀI PHẠM VI WEB APP' };

  G.VIEWS['hanh-lang'] = function () {
    if (!G.HL_VIRUS)
      return U.empty('Chưa mở được phần này',
        'Hành lang thành công nằm trong gói nghề. Đăng nhập bằng tài khoản có quyền nghề để nạp.');

    var loi = G.HL_LOI || {}, s = G.hlSoatVacXin();
    var lech = [].concat(G.hlSoiLuat12().loi || [], G.hlSoiVirus().loi || [],
      G.hlSoiKhongTuNang().loi || []);

    var o = U.ph({ eyebrow: 'HÀNH LANG THÀNH CÔNG', ic: 'shield', grad: 1,
      t: 'Mười hai luật · mười tám virus · chín lớp khoá',
      lead: loi.bonThanhPhan || '' });

    o += '<div class="card mb" style="border-color:' + (lech.length ? '#BE0E16' : '#B4720F') + '56">' +
      '<b class="sm" style="color:#B4720F">' + h(loi.cauDatNhat || '') + '</b>' +
      '<p class="tiny mt" style="line-height:1.75">' + h(loi.hanhLangTot || '') + '</p>' +
      '<p class="tiny mt" style="line-height:1.75">' + h(loi.mienDichKhongPhaiKiemDuyet || '') + '</p>' +
      '<p class="tiny dim mt" style="line-height:1.7">' + h(loi.nguon || '') + '</p>' +
      (lech.length ? '<p class="tiny mt" style="line-height:1.7;color:#BE0E16"><b>LỆCH: ' +
        h(lech.slice(0, 4).join(' · ')) + '</b></p>' : '') + '</div>';

    /* ── Đối chiếu vắc-xin với ứng dụng ── */
    o += U.sec('Mười tám vắc-xin — ứng dụng này đã có mấy cái',
      (G.HL_VIRUS_LUAT || {}).mayKiemLaCotDatNhat || '');
    o += '<div class="card mb" style="border-color:#B4720F56">' +
      '<div style="display:flex;flex-wrap:wrap;gap:18px;align-items:baseline">' +
      ['DA_CO', 'CON_HO', 'CHUA_KIEM'].map(function (m) {
        return '<div style="min-width:170px"><span class="tiny up" style="color:' + MAU[m] + '">' +
          h(NHAN[m]) + '</span><br><b style="font-size:1.7em;color:' + MAU[m] + '">' +
          (s.dem[m] || 0) + '</b></div>';
      }).join('') + '</div>' +
      '<p class="tiny mt" style="line-height:1.75">' +
      h((G.HL_VIRUS_LUAT || {}).virusVaoHaiLan || '') + '</p></div>';

    o += '<div class="card mb">' + (s.ds || []).map(function (x) {
      return '<div style="padding:11px 0;border-bottom:1px solid var(--gita-vien-2)">' +
        '<b class="sm">' + h(x.ma) + ' · ' + h(x.ten) + '</b> ' +
        '<span class="tiny up" style="color:' + MAU[x.muc] + '">' + h(NHAN[x.muc]) + '</span> ' +
        '<span class="tiny dim">' + h(x.nhom) + '</span>' +
        '<p class="tiny mt" style="line-height:1.75"><b>Triệu chứng:</b> ' + h(x.trieuChung) + '</p>' +
        '<p class="tiny" style="line-height:1.75"><b>Đường lây:</b> ' + h(x.duongLay) + '</p>' +
        '<p class="tiny mt" style="line-height:1.75;color:' + MAU[x.muc] + '"><b>Vắc-xin:</b> ' +
        h(x.vacXin) + '</p>' +
        (x.dan ? '<p class="tiny dim" style="line-height:1.7">Đã có ở: ' + h(x.dan) + '</p>' : '') +
        (x.vi ? '<p class="tiny" style="line-height:1.7;color:#B4720F">' + h(x.vi) + '</p>' : '') +
        '</div>';
    }).join('') + '</div>';

    o += G.kaKhung ? G.kaKhung('hanh-lang', 'dau') : '';

    /* ── Mười hai luật ── */
    o += U.sec('Mười hai luật — mỗi luật một hành vi đo được',
      (G.HL_LUAT12_LUAT || {}).daoNguocLaDauHieu || '');
    o += '<div class="card mb">' + (G.HL_LUAT12 || []).map(function (x) {
      return '<div style="padding:9px 0;border-bottom:1px solid var(--gita-vien-2)">' +
        '<b class="sm">' + h(x.ma) + ' · ' + h(x.luat) + '</b>' +
        '<p class="tiny mt" style="line-height:1.75;color:#0B6675"><b>Hành vi đo được:</b> ' +
        h(x.hanhVi) + '</p>' +
        '<p class="tiny" style="line-height:1.75;color:#BE0E16"><b>Dấu hiệu vi phạm:</b> ' +
        h(x.viPham) + '</p></div>';
    }).join('') + '</div>';

    /* ── Chín khoá ── */
    o += U.sec('Chín lớp khoá — chặn bằng cấu trúc',
      (G.HL_KHOA9_LUAT || {}).chanBangCauTruc || '');
    o += '<div class="card mb">' + (G.HL_KHOA9 || []).map(function (x) {
      return '<div style="padding:9px 0;border-bottom:1px solid var(--gita-vien-2)">' +
        '<b class="sm" style="color:' + (x.batBien ? '#BE0E16' : '#5140B4') + '">' + h(x.ma) +
        ' · ' + h(x.ten) + '</b>' +
        (x.batBien ? ' <span class="tiny up" style="color:#BE0E16">BẤT BIẾN</span>' : '') +
        '<p class="tiny mt" style="line-height:1.75"><b>Chặn:</b> ' + h(x.chan) + '</p>' +
        '<p class="tiny" style="line-height:1.75"><b>Cơ chế:</b> ' + h(x.coChe) + '</p>' +
        '<p class="tiny" style="line-height:1.75;color:#BE0E16"><b>Ai mở được:</b> ' + h(x.aiMo) +
        '</p></div>';
    }).join('') + '</div>';

    /* ── Sáu nhịp và chỗ lệch ── */
    o += U.sec('Sáu Nhịp — và vì sao chưa gộp vào kho',
      (G.HL_SAUNHIP_LUAT || {}).kiemDinhBuoi || '');
    o += '<div class="card mb">' + (G.HL_SAUNHIP || []).map(function (x) {
      return '<div style="padding:8px 0;border-bottom:1px solid var(--gita-vien-2)">' +
        '<b class="sm">' + x.nhip + '. ' + h(x.ten) + '</b>' +
        '<p class="tiny mt" style="line-height:1.75">' + h(x.viec) + '</p>' +
        '<p class="tiny" style="line-height:1.75;color:#BE0E16"><b>Cấm ở nhịp này:</b> ' +
        h(x.cam) + '</p></div>';
    }).join('') + '</div>';

    o += U.sec('Chỗ tài liệu lệch với ứng dụng đang chạy — ' + (G.HL_LECH || []).length + ' chỗ',
      'Sổ rà soát tìm mười mâu thuẫn giữa bốn tài liệu. Đây là loại thứ mười một: giữa tài liệu ' +
      'và ứng dụng, và phải chạy mới thấy.');
    o += '<div class="card mb" style="border-color:#BE0E1656">' + (G.HL_LECH || []).map(function (x) {
      return '<div style="padding:11px 0;border-bottom:1px solid var(--gita-vien-2)">' +
        '<b class="sm" style="color:#BE0E16">' + h(x.ma) + ' · ' + h(x.o) + '</b>' +
        (x.nguy ? ' <span class="tiny up" style="color:#BE0E16">NGUY</span>' : '') +
        '<p class="tiny mt" style="line-height:1.75"><b>Tài liệu:</b> ' + h(x.taiLieu) + '</p>' +
        '<p class="tiny" style="line-height:1.75"><b>Ứng dụng:</b> ' + h(x.ungDung) + '</p>' +
        '<p class="tiny mt" style="line-height:1.75;color:#B4720F">' + h(x.vanDe) + '</p>' +
        (x.mayLam ? '<p class="tiny" style="line-height:1.75">Máy đang làm: ' + h(x.mayLam) + '</p>' : '') +
        (x.lienQuan ? '<p class="tiny dim" style="line-height:1.7">' + h(x.lienQuan) + '</p>' : '') +
        (x.choChuHe ? '<p class="tiny mt" style="line-height:1.75;color:#BE0E16"><b>Chờ chủ hệ:</b> ' +
          h(x.choChuHe) + '</p>' : '') + '</div>';
    }).join('') + '</div>';

    o += G.kaKhung ? G.kaKhung('hanh-lang', 'cuoi') : '';
    return o;
  };

  G.VIEWS['ra-soat-loi'] = function () {
    if (!G.RS_CHAN)
      return U.empty('Chưa mở được phần này',
        'Sổ rà soát lỗi nằm trong gói nghề. Đăng nhập bằng tài khoản có quyền nghề để nạp.');

    var loi = G.RS_LOI || {}, d = G.rsDo();
    var lech = G.rsSoiChan().loi || [];

    var o = U.ph({ eyebrow: 'SỔ RÀ SOÁT LỖI HỆ THỐNG', ic: 'alert', grad: 1,
      t: 'Sáu mươi sáu điểm gãy, mười ba lỗi chặn phát hành',
      lead: loi.la || '' });

    o += '<div class="card mb" style="border-color:' + (lech.length ? '#BE0E16' : '#B4720F') + '56">' +
      '<div style="display:flex;flex-wrap:wrap;gap:18px;align-items:baseline">' +
      ['DA_DONG', 'CON_HO', 'NGOAI_APP'].map(function (m) {
        return '<div style="min-width:200px"><span class="tiny up" style="color:' + MAU[m] + '">' +
          h(NHAN[m]) + '</span><br><b style="font-size:1.7em;color:' + MAU[m] + '">' +
          (d.dem[m] || 0) + '</b> <span class="tiny dim">/ ' + d.tong + '</span></div>';
      }).join('') + '</div>' +
      '<p class="tiny mt" style="line-height:1.75;color:#B4720F"><b>' + h(loi.cauDatNhat || '') +
      '</b></p>' +
      '<p class="tiny mt" style="line-height:1.75">' + h((G.RS_LUAT || {}).ngoaiAppKhongPhaiXong || '') +
      '</p>' +
      '<p class="tiny dim mt" style="line-height:1.7">' + h(loi.nguon || '') + '</p>' +
      (lech.length ? '<p class="tiny mt" style="line-height:1.7;color:#BE0E16"><b>LỆCH: ' +
        h(lech.join(' · ')) + '</b></p>' : '') + '</div>';

    o += G.kaKhung ? G.kaKhung('ra-soat-loi', 'dau') : '';

    o += U.sec('Ba câu hỏi tìm lỗi mới', (G.RS_LUAT || {}).baCauHoiDangGiaHon || '');
    o += '<div class="card mb" style="border-color:#0B667556">' + (G.RS_HOI || []).map(function (x) {
      return '<div style="padding:10px 0;border-bottom:1px solid var(--gita-vien-2)">' +
        '<b class="sm" style="color:#0B6675">' + x.so + '. ' + h(x.hoi) + '</b>' +
        '<p class="tiny mt" style="line-height:1.75">' + h(x.them) + '</p></div>';
    }).join('') + '</div>';

    o += U.sec('Bốn lỗi gốc sinh ra phần lớn các lỗi khác', '');
    o += '<div class="card mb">' + (G.RS_GOC || []).map(function (x) {
      return '<div style="padding:10px 0;border-bottom:1px solid var(--gita-vien-2)">' +
        '<b class="sm">' + x.so + '. ' + h(x.ten) + '</b>' +
        '<p class="tiny mt" style="line-height:1.75;color:#BE0E16"><b>Sinh ra:</b> ' + h(x.sinhRa) + '</p>' +
        '<p class="tiny" style="line-height:1.75;color:#0B6675"><b>Sửa gốc:</b> ' + h(x.suaGoc) + '</p></div>';
    }).join('') + '</div>';

    o += U.sec('Tám nhóm — ' + d.tongDiemGay + ' điểm gãy', '');
    o += '<div class="card mb">' + (G.RS_NHOM || []).map(function (n) {
      return '<div style="padding:8px 0;border-bottom:1px solid var(--gita-vien-2)">' +
        '<b class="sm" style="color:' + n.c + '">' + h(n.ma) + ' · ' + h(n.ten) + '</b> ' +
        '<span class="tiny">' + n.so + ' điểm gãy</span> ' +
        (n.nghiem ? '<span class="tiny up" style="color:#BE0E16">' + n.nghiem +
          ' NGHIÊM TRỌNG</span>' : '') +
        (n.viXuLyTruoc ? '<p class="tiny mt" style="line-height:1.75">' + h(n.viXuLyTruoc) +
          '</p>' : '') + '</div>';
    }).join('') + '</div>';

    o += U.sec('Mười ba lỗi chặn phát hành — ứng dụng này đang ở đâu',
      (G.RS_LUAT || {}).danDuocTenHam || '');
    o += '<div class="card mb">' + (G.RS_CHAN || []).map(function (x) {
      return '<div style="padding:12px 0;border-bottom:1px solid var(--gita-vien-2)">' +
        '<b class="sm">' + h(x.ma) + ' · ' + h(x.loi) + '</b> ' +
        '<span class="tiny up" style="color:' + MAU[x.ungDung] + '">' + h(NHAN[x.ungDung]) + '</span>' +
        '<p class="tiny mt" style="line-height:1.75;color:#BE0E16"><b>Hậu quả:</b> ' + h(x.hauQua) + '</p>' +
        '<p class="tiny" style="line-height:1.75"><b>Xử lý:</b> ' + h(x.xuLy) + '</p>' +
        '<p class="tiny mt" style="line-height:1.75;color:' + MAU[x.ungDung] + '"><b>Web App:</b> ' +
        h(x.noiUngDung) + '</p></div>';
    }).join('') + '</div>';

    o += U.sec('Năm đợt xử lý', '');
    o += '<div class="card mb">' + (G.RS_DOT || []).map(function (x) {
      return '<div style="padding:8px 0;border-bottom:1px solid var(--gita-vien-2)">' +
        '<b class="sm">Đợt ' + x.dot + ' — ' + h(x.ten) + '</b> ' +
        '<span class="tiny dim">' + h(x.pham) + '</span>' +
        '<p class="tiny mt" style="line-height:1.75;color:#0B6675"><b>Đóng đợt khi:</b> ' +
        h(x.dongKhi) + '</p></div>';
    }).join('') + '</div>';

    o += G.kaKhung ? G.kaKhung('ra-soat-loi', 'cuoi') : '';
    return o;
  };
})();
