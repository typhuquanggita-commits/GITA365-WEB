/* ═══════════════════════════════════════════════════════════════
   GITA 365 — MÁY CHẠY PHẦN KẾT SỔ TAY VẬN HÀNH

   Kho chuẩn ở kho-goc/data.so-tay-van-hanh.js. Toàn bộ ở gói NGHỀ.

   ═══ BỐN CÁI MỞ ═══

   svUuTien(a, b)     hai mối lo đụng nhau thì nghe cái nào. Trả về bậc,
                      tên, và câu vì sao — không trả về một chữ "an toàn"
                      trống, vì người đọc cần biết cái kia thua ở đâu.
   svCoachThang(tang) tháng Coach ở tầng này có được cắt không. Nó KHÔNG
                      tự viết lại lời hứa: nó đọc đúng dòng trong
                      HP_TANG.gom của tầng ấy và đưa nguyên văn ra.
   svHaiNguoi(tang)   ca ở tầng này có bắt buộc hai người biết hồ sơ không.
   svKichBanSap()     lời phải nói khi hệ sập giữa nhịp.

   ═══ BA CÁI KHOÁ ═══

   svSoiDieuLe()   mỗi điều lệ phải khai noiChay và cờ chay, và KHÔNG
                   được mang con số trong CÂU điều lệ. Điều lệ mang số là
                   bản thứ hai của một con số đang sống ở kho khác.
   svSoiCoDo()     điều lệ số 7 hứa "người vào trong 24-48 giờ khi có cờ
                   đỏ". Phép soi này đo lại lời hứa ấy trên chính AICHAM:
                   mọi luật màu đỏ phải có mốc trong 48 giờ. Nó KHÔNG ghi
                   lại con số 24-48 vào kho — nó đọc cột han và tự dịch.
   svSoiKhongChep() không dòng nào của tệp này được chép nguyên văn một
                   luật đã có ở kho khác.

   ═══ VÌ SAO svSoiCoDo() ĐỌC MÀU CHỨ KHÔNG ĐỌC TÊN ═══

   "Cờ đỏ" trong sổ tay không có định nghĩa bằng danh sách. Trong AICHAM
   thì có: cột c của mỗi luật. Ba luật mang mã đỏ đậm là L03 (sắp rời
   bỏ), L14 (việc khẩn ngoài giờ), L15 (dấu hiệu vượt phạm vi). Đọc màu
   thì thêm một luật đỏ mới là phép soi tự bao luôn; đọc danh sách mã thì
   luật mới lọt qua trong im lặng.

   ═══ MỘT CHỖ ĐÃ SUÝT SAI ═══

   Bản đầu tôi định đặt SV_HAI_NGUOI.tuTang = 4 lấy từ XK_TRAN — lằn ranh
   quyền xem hồ sơ. Đó là lấy đúng số vì lý do sai: quyền xem là việc bảo
   mật, người dự phòng là việc lời hứa. Nguồn thật nằm ở HP_TANG.gom của
   T4: "Coach riêng cho cả năm, CÓ NGƯỜI THAY KHI VẮNG". T3 không có dòng
   ấy. Hai chỗ tình cờ cùng ra số 4, và nếu tôi giữ nguồn sai thì ngày
   XK_TRAN đổi vì lý do bảo mật, lời hứa với nhà cũng đổi theo mà không ai
   biết vì sao.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;
G.VIEWS = G.VIEWS || {};

(function () {
  var U = G.U, h = U.h;

  function coKho(ten) { return G[ten] !== undefined && G[ten] !== null; }

  /* Số tầng từ mọi cách người ta viết: 'T4', 4, '4', 'tang4'. */
  function soTang(t) {
    var m = String(t == null ? '' : t).match(/(\d)/);
    return m ? Number(m[1]) : 0;
  }

  /* ═══════════ MỞ 1: HAI MỐI LO ĐỤNG NHAU THÌ NGHE AI ═══════════ */
  G.svUuTien = function (a, b) {
    var ds = G.SV_THUTU || [];
    if (!ds.length) return { chuaDo: true, thieu: 'SV_THUTU' };

    function tim(x) {
      var k = String(x == null ? '' : x).toUpperCase();
      for (var i = 0; i < ds.length; i++)
        if (ds[i].ma === k || String(ds[i].ten).toUpperCase() === k) return ds[i];
      return null;
    }
    var A = tim(a), B = tim(b);
    if (!A || !B) return { khongBiet: true, thieuTen: (!A ? a : b),
      goiY: ds.map(function (x) { return x.ma; }) };

    /* Cùng một mối lo thì không có gì để quyết. Nói thẳng, đừng trả về
       một bên thắng — vì lúc ấy người đọc tưởng mình vừa được phân xử. */
    if (A.ma === B.ma) return { bangNhau: true, ten: A.ten,
      vi: 'Cùng một mối lo. Bảng này chỉ dùng lúc hai mối lo KHÁC nhau đụng nhau.' };

    var thang = A.bac < B.bac ? A : B;
    var thua  = A.bac < B.bac ? B : A;
    return {
      thang: thang.ma, tenThang: thang.ten, bacThang: thang.bac,
      thua: thua.ma, tenThua: thua.ten, bacThua: thua.bac,
      vi: thang.thang,
      thuaODau: 'Không bỏ ' + thua.ten.toLowerCase() + ' — chỉ xếp nó sau. ' +
        'Xử xong ' + thang.ten.toLowerCase() + ' thì quay lại đúng chỗ đang dở.',
      noiChay: thang.noiChay || ''
    };
  };

  /* ═══════════ MỞ 2: THÁNG COACH CÓ ĐƯỢC CẮT KHÔNG ═══════════ */
  G.svCoachThang = function (tang) {
    var cam = (G.SV_CAM_QUYMO || []).filter(function (c) { return c.ma === 'CQ-1'; })[0];
    if (!cam) return { chuaDo: true, thieu: 'SV_CAM_QUYMO CQ-1' };

    var so = soTang(tang), ma = 'T' + so;
    var trong = (cam.tang || []).indexOf(ma) >= 0;
    if (!trong) return { camCat: false, tang: ma,
      vi: 'Tầng này không có tháng Coach trong phần đã bán, nên không có gì để cắt.' };

    /* Đọc ĐÚNG dòng lời hứa của tầng ấy thay vì viết lại nó. HP_TANG là
       gói nghề; máy gia đình không có, và đó là quyền chứ không phải lỗi. */
    var loiHua = '', coBang = coKho('HP_TANG');
    if (coBang) {
      var b = (G.HP_TANG || []).filter(function (x) { return x.tang === ma; })[0];
      if (b) loiHua = (b.gom || []).filter(function (d) { return /Coach/i.test(d); }).join(' · ');
    }

    return {
      camCat: true, tang: ma,
      luat: cam.cam,
      vi: cam.vi,
      thayVao: cam.thayVao,
      loiHua: loiHua,
      chuaDoLoiHua: !coBang,
      thieuKho: coBang ? undefined : 'HP_TANG',
      noiChay: 'DD_TRAN_LUAT'
    };
  };

  /* ═══════════ MỞ 3: CA NÀY CÓ BẮT BUỘC HAI NGƯỜI KHÔNG ═══════════ */
  G.svHaiNguoi = function (tang) {
    var l = G.SV_HAI_NGUOI || {};
    if (l.tuTang === undefined) return { chuaDo: true, thieu: 'SV_HAI_NGUOI' };
    var so = soTang(tang);
    var can = so >= Number(l.tuTang);
    return {
      canHaiNguoi: can, tang: 'T' + so, tuTang: 'T' + l.tuTang,
      layTuDau: l.layTuDau || '',
      vi: can
        ? 'Ca tầng này phải có người dự phòng ĐÃ BIẾT hồ sơ — không phải người sẽ đọc hồ sơ khi cần.'
        : 'Tầng này chưa hứa người thay. Không phải vì ca dễ hơn — vì lời hứa đã bán chưa gồm nó.',
      choChuHe: can ? undefined : (l.choChuHe || '')
    };
  };

  /* ═══════════ MỞ 4: LỜI PHẢI NÓI KHI HỆ SẬP ═══════════ */
  G.svKichBanSap = function () {
    var r = (G.SV_RUIRO || []).filter(function (x) { return x.ma === 'R1'; })[0];
    if (!r) return { chuaDo: true, thieu: 'SV_RUIRO R1' };
    return { loiNoi: r.loiNoi, vi: r.viLoiNoi, buoc: (r.buoc || []).slice(), camGiau: r.camGiau };
  };

  G.svKhungHoang = function () {
    var r = (G.SV_RUIRO || []).filter(function (x) { return x.ma === 'R3'; })[0];
    if (!r) return { chuaDo: true, thieu: 'SV_RUIRO R3' };
    return { nguyenTac: r.nguyenTacSoMot, vi: r.viNguyenTacSoMot,
      loiNoi: r.loiNoi, buoc: (r.buoc || []).slice(), cam: r.camTuyetDoi };
  };

  /* Điều lệ lọc theo vai. 'ai' hoặc 'coach'; không truyền thì lấy hết. */
  G.svDieuLe = function (vai) {
    var ds = G.SV_DIEULE || [];
    if (!vai) return ds.slice();
    return ds.filter(function (d) { return (d.buoc || []).indexOf(vai) >= 0; });
  };

  /* ═══════════ KHOÁ 1: MỖI ĐIỀU PHẢI KHAI ĐƯỢC CHỖ CHẠY ═══════════ */
  G.svSoiDieuLe = function () {
    var ds = G.SV_DIEULE || [], loi = [];
    if (!ds.length) return { chuaDo: true, thieu: 'SV_DIEULE', loi: [] };
    if (ds.length !== 10) loi.push('điều lệ có ' + ds.length + ' điều, bản gốc mười điều');

    var thay = {};
    ds.forEach(function (d) {
      var n = 'điều ' + d.no;
      if (thay[d.no]) loi.push(n + ' trùng số');
      thay[d.no] = 1;
      if (!d.dieu) loi.push(n + ' thiếu nội dung');
      if (!(d.buoc || []).length) loi.push(n + ' chưa khai buộc ai');
      (d.buoc || []).forEach(function (v) {
        if (v !== 'ai' && v !== 'coach') loi.push(n + ' buộc vai lạ: ' + v);
      });

      /* Chỗ này là cả cái luật của bảng: mọi điều đều nói được nó chặn ở
         đâu, hoặc nói rõ chưa chặn ở đâu cả và thiếu cái gì. */
      if (!d.noiChay) loi.push(n + ' chưa khai noiChay');
      if (typeof d.chay !== 'boolean') loi.push(n + ' chưa khai cờ chay');
      if (d.chay === false && !/thiếu/i.test(String(d.noiChay)))
        loi.push(n + ' khai chưa chạy mà không nói thiếu cái gì');

      /* Điều lệ mang con số là bản thứ hai của một con số đang sống ở
         kho khác. Chữ số trong câu điều lệ thì cấm; trong noiChay thì
         không, vì đó là tên mã luật (L01, L15, T4…). */
      if (/\d/.test(String(d.dieu)))
        loi.push(n + ' có con số trong câu điều lệ');
    });
    return { chuaDo: false, loi: loi, soDieu: ds.length,
      chuaChay: ds.filter(function (d) { return d.chay === false; }).length };
  };

  /* ═══════════ KHOÁ 2: ĐIỀU LỆ 7 ĐO LẠI TRÊN AICHAM ═══════════

     Lời hứa: người vào trong 24-48 giờ khi có cờ đỏ, không ngoại lệ.
     Phép soi đọc cột han của mọi luật AICHAM màu đỏ đậm và dịch ra giờ.
     Mốc "ngay lập tức" hoặc tính bằng phút thì đương nhiên đạt. */
  var DO_DAM = ['#dc2626', '#BE0E16', '#b91c1c'];
  var TRAN_GIO = 48;

  function gioTu(han) {
    var s = String(han || '').toLowerCase();
    if (!s) return null;
    if (/ngay lập tức|ngay lap tuc|trong ngày|trong ngay/.test(s)) return 0;
    if (/phút|phut/.test(s)) return 1;                 /* mọi mốc phút đều < 48 giờ */
    var m = s.match(/(\d+)\s*giờ|(\d+)\s*gio/);
    if (m) return Number(m[1] || m[2]);
    var d = s.match(/(\d+)\s*ngày|(\d+)\s*ngay/);
    if (d) return Number(d[1] || d[2]) * 24;
    return null;                                        /* không dịch được */
  }

  G.svSoiCoDo = function () {
    if (!coKho('AICHAM')) return { chuaDo: true, thieu: 'AICHAM', loi: [] };
    var ds = (G.AICHAM || {}).luat || [], loi = [], do_ = [];
    if (!ds.length) return { chuaDo: true, thieu: 'AICHAM.luat', loi: [] };

    ds.forEach(function (l) {
      if (DO_DAM.indexOf(String(l.c)) < 0) return;
      do_.push(l.ma);
      var g = gioTu(l.han);
      if (g === null) { loi.push(l.ma + ' mốc "' + l.han + '" không dịch được ra giờ'); return; }
      if (g > TRAN_GIO) loi.push(l.ma + ' mốc ' + g + ' giờ, vượt ' + TRAN_GIO + ' giờ của điều lệ 7');
    });

    /* Không luật đỏ nào là chính nó một lỗi: lời hứa điều 7 lúc ấy
       không có gì đỡ, và phép soi sẽ xanh mãi mãi trong khi rỗng. */
    if (!do_.length) loi.push('AICHAM không có luật nào màu đỏ — điều lệ 7 không có chỗ chạy');

    return { chuaDo: false, loi: loi, luatDo: do_, tran: TRAN_GIO };
  };

  /* ═══════════ KHOÁ 3: KHÔNG CHÉP LẠI LUẬT ĐÃ CÓ ═══════════

     Tệp này là sổ tra. Một dòng chép nguyên văn một luật ở kho khác là
     bản thứ hai của luật ấy. So bằng câu đủ dài — dưới mười lăm chữ thì
     trùng nhau là chuyện bình thường của tiếng Việt. */
  G.svSoiKhongChep = function () {
    var loi = [], nguon = [];
    ['KBTV_BA_KHONG', 'KBTV_BA_LUON'].forEach(function (k) {
      if (coKho(k)) (G[k] || []).forEach(function (c) { nguon.push({ kho: k, cau: String(c) }); });
    });
    if (coKho('KBTV_DAODUC'))
      (G.KBTV_DAODUC || []).forEach(function (d) { nguon.push({ kho: 'KBTV_DAODUC', cau: String(d.vi || '') }); });
    if (!nguon.length) return { chuaDo: true, thieu: 'KBTV_*', loi: [] };

    function chuan(s) { return String(s || '').toLowerCase().replace(/[^\p{L}\p{N} ]/gu, ' ').replace(/\s+/g, ' ').trim(); }

    var cua = [];
    (G.SV_DIEULE || []).forEach(function (d) { cua.push({ o: 'điều lệ ' + d.no, cau: d.dieu }); });
    (G.SV_CAM_QUYMO || []).forEach(function (c) { cua.push({ o: c.ma, cau: c.cam }); });

    cua.forEach(function (x) {
      var a = chuan(x.cau);
      if (a.split(' ').length < 15) return;
      nguon.forEach(function (n) {
        if (chuan(n.cau) === a) loi.push(x.o + ' chép nguyên văn ' + n.kho);
      });
    });
    return { chuaDo: false, loi: loi, soCau: cua.length, soNguon: nguon.length };
  };

  G.svChoChu = function () { return (G.SV_CHOCHU || []).slice(); };

  /* ═══════════════════════════════════════════════════════════
     MÀN HÌNH
     ═══════════════════════════════════════════════════════════ */
  G.VIEWS['so-tay-van-hanh'] = function () {
    if (!G.SV_DIEULE)
      return U.empty('Chưa mở được phần này',
        'Phần này nằm trong gói nghề. Đăng nhập bằng tài khoản có quyền nghề để nạp.');

    var loi = G.SV_LOI || {};
    var o = U.ph({ eyebrow: 'SỔ TAY VẬN HÀNH · PHẦN KẾT 10/10', ic: 'compass', grad: 1,
      t: 'Phần Trợ lý và Coach bấm được, ở tầng ba và tầng bốn',
      lead: 'Sổ tay gốc viết cho Giám đốc và Quản lý vận hành. Trang này chỉ giữ phần ' +
        'người đi cùng một nhà thật sự phải làm — phần còn lại khai ở cuối trang, kèm lý do bỏ.' });

    o += '<div class="card mb" style="border-color:#0B667556">' +
      '<p style="line-height:1.9"><b>' + h(loi.la || '') + '</b></p>' +
      '<p class="sm mt" style="line-height:1.8">' + h(loi.phamVi || '') + '</p>' +
      '<p class="tiny dim mt" style="line-height:1.7">' + h(loi.vi || '') + '</p>' +
      '<p class="tiny mt" style="line-height:1.8;color:#0B6675"><b>' + h(loi.tuyenNgon || '') + '</b></p></div>';

    o += G.kaKhung ? G.kaKhung('so-tay-van-hanh', 'dau') : '';

    /* ── Thứ tự ưu tiên ── */
    var tl = G.SV_THUTU_LUAT || {};
    o += U.sec('Khi hai mối lo đụng nhau', tl.cot || '');
    o += '<div class="card mb">' + (G.SV_THUTU || []).map(function (t) {
      return '<div style="padding:9px 0;border-bottom:1px solid var(--gita-vien-2)">' +
        '<span class="tiny up" style="color:' + t.c + '"><b>BẬC ' + t.bac + ' · ' + h(t.ten) + '</b></span>' +
        '<p class="sm mt" style="line-height:1.8">' + h(t.la) + '</p>' +
        '<p class="tiny dim mt" style="line-height:1.7">' + h(t.thang) + '</p>' +
        '<p class="tiny mt" style="line-height:1.7;color:#0B6675">Chạy ở: ' + h(t.noiChay) + '</p></div>';
    }).join('') + '</div>';
    o += '<p class="tiny dim mb" style="line-height:1.7">' + h(tl.vi || '') + '<br>' +
      h(tl.viKhongDoiTheoTang || '') + '</p>';

    /* Một ví dụ chạy thật, để bảng không chỉ là bảng. */
    var vd = G.svUuTien('NHIP', 'AN_TOAN');
    if (vd && vd.thang)
      o += '<div class="card mb" style="border-color:#dc262644">' +
        '<span class="tiny up dim">THỬ MỘT CA</span>' +
        '<p class="sm mt" style="line-height:1.8">Nhà đang đứt nhịp bốn ngày, và trong tin nhắn ' +
        'có một câu về chuyện an toàn. Nghe cái nào trước?</p>' +
        '<p class="mt" style="line-height:1.8"><b>' + h(vd.tenThang) + ' (bậc ' + vd.bacThang + ')</b> ' +
        'trước ' + h(vd.tenThua.toLowerCase()) + ' (bậc ' + vd.bacThua + ').</p>' +
        '<p class="tiny dim mt" style="line-height:1.7">' + h(vd.thuaODau) + '</p></div>';

    /* ── Điều lệ mười điều ── */
    var sd = G.svSoiDieuLe();
    var scd = G.svSoiCoDo();
    var lech = (sd.loi || []).concat(scd.chuaDo ? [] : (scd.loi || []));
    o += U.sec('Mười điều, và chỗ mỗi điều thật sự chặn' + (lech.length ? ' — LỆCH: ' + lech.join(' · ') : ''),
      (G.SV_DIEULE_LUAT || {}).cot || '');

    o += '<div class="card mb">' + (G.SV_DIEULE || []).map(function (d) {
      var mau = d.chay === false ? '#B4720F' : '#0B6675';
      return '<div style="padding:10px 0;border-bottom:1px solid var(--gita-vien-2)">' +
        '<b class="sm">' + d.no + '. ' + h(d.dieu) + '</b>' +
        '<p class="tiny mt" style="line-height:1.7">' +
        (d.buoc || []).map(function (v) {
          return '<span class="tiny up dim">' + (v === 'ai' ? 'TRỢ LÝ' : 'COACH') + '</span>';
        }).join(' · ') + '</p>' +
        '<p class="tiny mt" style="line-height:1.7;color:' + mau + '">' +
        (d.chay === false ? h(d.noiChay) : 'Chạy ở: ' + h(d.noiChay)) + '</p></div>';
    }).join('') + '</div>';
    o += '<p class="tiny dim mb" style="line-height:1.7">' +
      h((G.SV_DIEULE_LUAT || {}).viCamSo || '') + '<br>' +
      h((G.SV_DIEULE_LUAT || {}).motDieuChuaChay || '') + '</p>';

    if (!scd.chuaDo)
      o += '<div class="card mb"><span class="tiny up dim">ĐIỀU 7 ĐO LẠI TRÊN AICHAM</span>' +
        '<p class="sm mt" style="line-height:1.8">' + (scd.luatDo || []).length +
        ' luật màu đỏ · trần ' + scd.tran + ' giờ · ' +
        (scd.loi.length ? '<b style="color:#BE0E16">' + h(scd.loi.join(' · ')) + '</b>'
                        : 'mọi mốc đều trong trần') + '</p>' +
        '<p class="tiny dim mt" style="line-height:1.7">Phép soi đọc cột hạn của từng luật đỏ và tự dịch ' +
        'ra giờ. Con số 24-48 không được chép vào kho — nó sống ở AICHAM.</p></div>';

    o += G.kaKhung ? G.kaKhung('so-tay-van-hanh', 'giua') : '';

    /* ── Bốn điều cấm khi tăng quy mô ── */
    o += U.sec('Bốn điều cấm khi hệ lớn lên',
      'Điều đầu tiên gọi thẳng tên tầng ba, tầng bốn, tầng năm — nên nó là một cổng, không phải lời khuyên.');
    o += '<div class="card mb">' + (G.SV_CAM_QUYMO || []).map(function (c) {
      return '<div style="padding:9px 0;border-bottom:1px solid var(--gita-vien-2)">' +
        '<span class="tiny up" style="color:#BE0E16">' + h(c.ma) +
        (c.tang ? ' · ' + h((c.tang || []).join(' · ')) : '') + '</span>' +
        '<p class="sm mt" style="line-height:1.8"><b>CẤM: ' + h(c.cam) + '</b></p>' +
        '<p class="tiny dim mt" style="line-height:1.7">' + h(c.vi) + '</p>' +
        '<p class="tiny mt" style="line-height:1.7;color:#0B6675">Thay vào: ' + h(c.thayVao) + '</p>' +
        (c.daHuaODau ? '<p class="tiny mt" style="line-height:1.7;color:#B4720F">' + h(c.daHuaODau) + '</p>' : '') +
        '</div>';
    }).join('') + '</div>';

    /* Cổng tháng Coach chạy thật cho hai tầng chủ hệ giao. */
    var cong = ['T3', 'T4'].map(function (t) { return G.svCoachThang(t); })
      .filter(function (x) { return x && x.camCat; });
    if (cong.length)
      o += '<div class="card mb" style="border-color:#BE0E1644">' +
        '<span class="tiny up dim">CỔNG CHẠY THẬT</span>' + cong.map(function (c) {
          return '<p class="sm mt" style="line-height:1.8"><b>' + h(c.tang) + ' — không được cắt.</b> ' +
            (c.chuaDoLoiHua
              ? '<span class="tiny dim">(chưa đọc được lời hứa: máy này không có ' + h(c.thieuKho) + ')</span>'
              : h(c.loiHua)) + '</p>';
        }).join('') +
        '<p class="tiny dim mt" style="line-height:1.7">Lời hứa đọc thẳng từ HP_TANG, không viết lại. ' +
        'Sửa bảng học phí thì dòng này đổi theo trong cùng một lần.</p></div>';

    /* ── Bốn rủi ro ── */
    o += U.sec('Bốn chỗ hệ có thể gãy, và lời phải nói',
      'Sổ tay gốc liệt sáu. Hai cái còn lại Coach không bấm được gì — khai ở cuối trang.');
    o += (G.SV_RUIRO || []).map(function (r) {
      return '<div class="card mb" style="border-color:' + r.c + '4d">' +
        '<span class="tiny up" style="color:' + r.c + '">' + h(r.ma) + ' · ' + h(r.mucDo) + '</span>' +
        '<p class="mt" style="line-height:1.9"><b>' + h(r.ten) + '</b></p>' +
        (r.nguyenTacSoMot ? '<p class="sm mt" style="line-height:1.8;color:#BE0E16"><b>' +
          h(r.nguyenTacSoMot) + '</b></p>' +
          '<p class="tiny dim mt" style="line-height:1.7">' + h(r.viNguyenTacSoMot) + '</p>' : '') +
        '<ul class="sm mt" style="line-height:1.8;padding-left:18px">' +
        (r.buoc || []).map(function (b) { return '<li>' + h(b) + '</li>'; }).join('') + '</ul>' +
        (r.loiNoi ? '<div class="mt" style="padding:10px 12px;border-left:3px solid ' + r.c +
          ';background:var(--gita-nen-2)"><p class="sm" style="line-height:1.8">' +
          '&ldquo;' + h(r.loiNoi) + '&rdquo;</p>' +
          '<p class="tiny dim mt" style="line-height:1.7">' + h(r.viLoiNoi || r.viHoanDe || '') + '</p></div>' : '') +
        (r.camGiau ? '<p class="tiny mt" style="line-height:1.7;color:#BE0E16"><b>' + h(r.camGiau) + '</b></p>' : '') +
        (r.camTuyetDoi ? '<p class="tiny mt" style="line-height:1.7;color:#BE0E16"><b>' + h(r.camTuyetDoi) + '</b></p>' : '') +
        (r.viHaiNguoi ? '<p class="tiny dim mt" style="line-height:1.7">' + h(r.viHaiNguoi) + '</p>' : '') +
        (r.viBiBoQua ? '<p class="tiny dim mt" style="line-height:1.7">' + h(r.viBiBoQua) + '</p>' : '') +
        '</div>';
    }).join('');

    /* Quy tắc hai người, chạy cho T3 và T4 để thấy chúng khác nhau. */
    var hn = ['T3', 'T4'].map(function (t) { return G.svHaiNguoi(t); });
    if (hn[0] && !hn[0].chuaDo) {
      o += '<div class="card mb"><span class="tiny up dim">QUY TẮC HAI NGƯỜI · CHẠY THẬT</span>' +
        hn.map(function (x) {
          return '<p class="sm mt" style="line-height:1.8"><b>' + h(x.tang) + ': ' +
            (x.canHaiNguoi ? 'bắt buộc hai người' : 'chưa bắt buộc') + '.</b> ' + h(x.vi) + '</p>';
        }).join('') +
        '<p class="tiny dim mt" style="line-height:1.7">' + h(hn[1].layTuDau || '') + '</p></div>';
    }

    /* ── Một dòng từ bảng ngân sách ── */
    var ns = G.SV_NGANSACH_COACH || {};
    if (ns.luat)
      o += '<div class="card mb" style="border-color:#dc262644">' +
        '<span class="tiny up" style="color:#dc2626">TỪ BẢNG NGÂN SÁCH · MỘT DÒNG</span>' +
        '<p class="mt" style="line-height:1.9"><b>' + h(ns.luat) + '</b></p>' +
        '<p class="sm mt" style="line-height:1.8">' + h(ns.nghiaLa) + '</p>' +
        '<p class="tiny dim mt" style="line-height:1.7">' + h(ns.vi) + '</p>' +
        '<p class="tiny dim mt" style="line-height:1.7">' + h(ns.viKhongMangConSo) + '</p></div>';

    /* ── Phần không vào kho ── */
    o += U.sec('Phần kết còn gì, và vì sao không vào kho',
      'Khai ra để lần sau không ai chép lại ở chỗ khác.');
    o += '<div class="card mb">' + (G.SV_NGOAI || []).map(function (n) {
      return '<div style="padding:9px 0;border-bottom:1px solid var(--gita-vien-2)">' +
        '<b class="sm">' + h(n.ma) + ' · ' + h(n.muc) + '</b>' +
        '<p class="tiny dim mt" style="line-height:1.7">' + h(n.vi) + '</p>' +
        (n.khongDung ? '<p class="tiny mt" style="line-height:1.7;color:#BE0E16">' + h(n.khongDung) + '</p>' : '') +
        (n.thayBang ? '<p class="tiny mt" style="line-height:1.7;color:#0B6675">Thay bằng: ' + h(n.thayBang) + '</p>' : '') +
        (n.daCoOKho ? '<p class="tiny mt" style="line-height:1.7;color:#0B6675">Đã có ở: ' + h(n.daCoOKho) + '</p>' : '') +
        (n.giuLaiMotDong ? '<p class="tiny mt" style="line-height:1.7;color:#0B6675">Giữ lại một dòng: ' + h(n.giuLaiMotDong) + '</p>' : '') +
        (n.giuLaiMotCau ? '<p class="tiny mt" style="line-height:1.7;color:#0B6675">' + h(n.giuLaiMotCau) + '</p>' : '') +
        (n.canGi ? '<p class="tiny mt" style="line-height:1.7;color:#B4720F">Cần: ' + h(n.canGi) + '</p>' : '') +
        '</div>';
    }).join('') + '</div>';

    /* ── Chỗ lệch ── */
    o += U.sec('Chỗ phần kết lệch với kho', 'Máy đọc kho. Chỗ lệch ghi ra, không tự chọn hộ.');
    o += '<div class="card mb">' + (G.SV_LECH || []).map(function (l) {
      return '<div style="padding:10px 0;border-bottom:1px solid var(--gita-vien-2)">' +
        '<b class="sm">' + h(l.ma) + ' · ' + h(l.o) + '</b>' +
        '<p class="tiny mt" style="line-height:1.7"><b>Tài liệu:</b> ' + h(l.taiLieu) + '</p>' +
        '<p class="tiny mt" style="line-height:1.7"><b>Kho:</b> ' + h(l.kho) + '</p>' +
        (l.tuMauThuan ? '<p class="tiny mt" style="line-height:1.7;color:#B4720F">' + h(l.tuMauThuan) + '</p>' : '') +
        (l.phepCong ? '<p class="tiny mt" style="line-height:1.7;color:#B4720F">' + h(l.phepCong) + '</p>' : '') +
        (l.yNghia ? '<p class="tiny mt" style="line-height:1.7">' + h(l.yNghia) + '</p>' : '') +
        '<p class="tiny dim mt" style="line-height:1.7">' + h(l.mayLam) + '</p>' +
        (l.noHoSo ? '<p class="tiny mt" style="line-height:1.7;color:#0B6675">Hồ sơ đã mở ở: ' + h(l.noHoSo) + '</p>' : '') +
        (l.canGi ? '<p class="tiny mt" style="line-height:1.7;color:#BE0E16"><b>Cần: ' + h(l.canGi) + '</b></p>' : '') +
        (l.daRo ? '<p class="tiny mt" style="line-height:1.7;color:#0B6675">Chỗ này không cần chủ hệ quyết.</p>' : '') +
        '</div>';
    }).join('') + '</div>';

    /* ── Chờ chủ hệ ── */
    if (G.SV_CHOCHU && G.SV_CHOCHU.length) {
      o += U.sec('Câu chờ chủ hệ', 'Mã không tự trả lời được câu này.');
      o += '<div class="card mb">' + G.svChoChu().map(function (c) {
        return '<div style="padding:9px 0">' +
          '<b class="sm">' + h(c.hoi) + '</b>' +
          '<p class="tiny dim mt" style="line-height:1.7">' + h(c.boi) + '</p>' +
          '<p class="tiny mt" style="line-height:1.7;color:#0B6675">' + h(c.toiNghieng || '') + '</p>' +
          '<p class="tiny mt" style="line-height:1.7;color:#B4720F">' + h(c.mayDangLam || '') + '</p></div>';
      }).join('') + '</div>';
    }

    o += G.kaKhung ? G.kaKhung('so-tay-van-hanh', 'cuoi') : '';
    return o;
  };
})();
