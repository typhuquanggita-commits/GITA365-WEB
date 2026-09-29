/* ═══════════════════════════════════════════════════════════════
   GITA 365 — MÁY CHẠY DÒNG T5-PRO

   Kho chuẩn ở gói NGHỀ CAO. Chương trình VIP này đứng ngoài 10 cấp của
   Tầng 5; R01–R02 có mặc định, nhân sự khác cần quyền cá nhân còn hạn.

   ═══ NĂM CÁI MỞ ═══

   t5pSangLoc(diem, dieuKien) sáu điểm vào, hai cổng cứng và điều kiện
                        VIP được người có thẩm quyền xác minh.
   t5pTuChoi(ma)        kịch bản từ chối, nguyên văn.
   t5pGiaiDoan(thang)   tháng thứ mấy thì đang ở giai đoạn nào.
   t5pNghiThuc(gd)      nghi thức nào được phép chạy ở giai đoạn này.
   t5pNhanCase(bang)    Coach này đã đủ chuẩn cầm case chưa.

   ═══ BẢNG GIÁ RIÊNG CỦA CHƯƠNG TRÌNH VIP ═══

   Giá T5-PRO là một khoảng giá chính thức, tách khỏi HP_TANG. Đây là
   chương trình chuyên gia đồng hành khởi nghiệp; mức cụ thể được xác
   định theo hồ sơ và phạm vi hợp đồng, không biến thành tầng thứ sáu.

   ═══ BẢY CÁI KHOÁ ═══

   t5pSoiKhongPhaiTang()  quan trọng nhất tệp. Nó đỏ nếu có bản ghi
                          nào của dòng này mang một tầng thứ sáu, hoặc
                          nếu HP_TANG khác năm dòng. Đây là phép kiểm
                          giữ cho một lần biên soạn tài liệu KHÔNG âm
                          thầm đổi số tầng của cả hệ.
   t5pSoiSangLoc()        sáu tiêu chí, hai cổng cứng và hai điều kiện
                          VIP có cách xác minh.
   t5pSoiDaoDuc()         mười hai điều, đủ bốn cụm, mỗi điều có chi
                          tiết hoặc hậu quả.
   t5pSoiNangLuc()        mười một năng lực, ba cụm, và đúng ba cái
                          đòi M4 — N1, N2, N9.
   t5pSoiNghiThuc()       bảy nghi thức, mỗi cái khai giai đoạn sớm
                          nhất; hai nghi thức cuối có mười bộ mẫu.
   t5pSoiGia()            kiểm khoảng giá chính thức và cách báo giá.
   t5pSoiR5()             giữ đúng năm nguyên tắc R5 chủ hệ đã chốt.

   ═══ VÌ SAO t5pSangLoc() CHẶN TRƯỚC KHI CỘNG ═══

   Nếu cộng trước rồi mới xét loại cứng, mã vẫn ra đúng kết quả —
   nhưng người đọc màn hình thấy "tổng 19, nhận" rồi mới thấy dòng
   từ chối bên dưới, và cái đọng lại là con số 19.

   Sổ tay nói chính xác chỗ hỏng ấy: gia đình giàu, lịch sự, tổng
   điểm đẹp, mà không có người quyết. Nên hàm này trả về phán quyết
   TỪ CHỐI trước, và tổng điểm chỉ là dữ liệu kèm theo.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;
G.VIEWS = G.VIEWS || {};

(function () {
  var U = G.U, h = U.h;
  var MUC_BAC = { M1: 1, M2: 2, M3: 3, M4: 4 };

  function coKho(ten) { return G[ten] !== undefined && G[ten] !== null; }

  /* ═══════════ MỞ 1: CỬA VÀO ═══════════

     diem là một đối tượng {1:4, 2:3, …, 6:2} hoặc một mảng sáu số.
     Thiếu tiêu chí nào thì KHÔNG đoán bằng 0 và cũng không bỏ qua —
     trả về chuaChamDu, kèm tên tiêu chí còn trống. Chấm thiếu mà ra
     phán quyết là phán quyết trên dữ liệu chưa có. */
  G.t5pSangLoc = function (diem, dieuKien) {
    var ds = G.T5P_SANGLOC || [], l = G.T5P_SANGLOC_LUAT || {};
    if (!ds.length) return { chuaDo: true, thieu: 'T5P_SANGLOC' };
    var tienQuyet = l.dieuKienTienQuyet || [];
    dieuKien = dieuKien || {};
    var chuaXacNhan = tienQuyet.filter(function (x) {
      return dieuKien[x.ma] !== true && dieuKien[x.ma] !== false;
    });
    if (chuaXacNhan.length) return {
      chuaChamDu: true, thieuDieuKien: chuaXacNhan.map(function (x) { return x.ten; }),
      ghiChu: 'Điều kiện tiên quyết phải được người có thẩm quyền xác minh trước khi kết luận.'
    };
    var khongDat = tienQuyet.filter(function (x) { return dieuKien[x.ma] === false; });
    if (khongDat.length) return {
      ket: 'khong-nhan', loaiCung: true,
      phamDieuKien: khongDat.map(function (x) { return x.ten; }),
      vi: 'Chương trình VIP chỉ dành cho hồ sơ đạt chuẩn về năng lực khởi nghiệp và mức phù hợp với hệ sinh thái.'
    };
    diem = diem || {};

    var thieu = [], tong = 0, bang = [];
    ds.forEach(function (t, i) {
      var v = diem[t.so] !== undefined ? diem[t.so] : diem[i];
      if (v === undefined || v === null || v === '') { thieu.push(t.so + '. ' + t.ten); return; }
      v = Number(v);
      if (!(v >= 0 && v <= 4)) { thieu.push(t.so + '. ' + t.ten + ' — điểm ngoài thang 0–4'); return; }
      tong += v;
      bang.push({ so: t.so, ten: t.ten, diem: v, loaiCung: !!t.loaiCung });
    });
    if (thieu.length) return { chuaChamDu: true, thieu: thieu, daCham: bang.length, can: ds.length };

    /* Loại cứng chặn TRƯỚC khi nhìn tổng — xem đầu tệp. */
    var pham = bang.filter(function (b) { return b.loaiCung && b.diem <= 1; });
    if (pham.length) return {
      ket: 'khong-nhan', loaiCung: true, tong: tong,
      phamTieuChi: pham.map(function (b) { return b.so + '. ' + b.ten + ' — ' + b.diem + ' điểm'; }),
      vi: l.viLoaiCung || '',
      luat: l.loaiCung || '',
      bang: bang,
      buocTiep: 'Dùng kịch bản từ chối mở cửa, hẹn tái khám.'
    };

    var ng = (l.nguong || []).filter(function (n) { return tong >= n.tu && tong <= n.den; })[0];
    return {
      ket: ng ? ng.ket : 'khong-ro', tong: tong, tran: ds.length * 4,
      noi: ng ? ng.noi : '', viDu: ng ? ng.viDu : undefined,
      bang: bang, loaiCung: false,
      nhacChamThap: l.viChamThap || '',
      aiCham: l.khongTuChamTuQuyet || ''
    };
  };

  /* ═══════════ MỞ 2: KỊCH BẢN TỪ CHỐI ═══════════ */
  G.t5pTuChoi = function (ma) {
    var ds = G.T5P_TUCHOI || [];
    if (!ds.length) return { chuaDo: true, thieu: 'T5P_TUCHOI' };
    if (!ma) return { ds: ds.slice(), luat: (G.T5P_TUCHOI_LUAT || []).slice() };
    var k = ds.filter(function (t) { return t.ma === String(ma).toUpperCase(); })[0];
    if (!k) return { khongCo: true, ma: ma, coNhung: ds.map(function (t) { return t.ma; }) };
    return {
      ma: k.ma, ten: k.ten, tinHieu: k.tinHieu, loi: k.loi,
      duongRa: k.duongRa, ranhGioi: k.ranhGioi, camTuyetDoi: k.camTuyetDoi,
      sauDo: (G.T5P_SAUTUCHOI || []).slice()
    };
  };

  /* ═══════════ MỞ 3: THÁNG NÀY LÀ GIAI ĐOẠN NÀO ═══════════ */
  G.t5pGiaiDoan = function (thang) {
    var ds = G.T5P_GIAIDOAN || [];
    if (!ds.length) return { chuaDo: true, thieu: 'T5P_GIAIDOAN' };
    var n = Number(thang) || 0;
    var tong = (G.T5P_LOI || {}).thoiHan || 24;
    if (n < 1 || n > tong) return { ngoaiLoTrinh: true, thang: n, tong: tong };
    var gd = ds.filter(function (g) {
      var m = String(g.thang).split(/[–-]/);
      return n >= Number(m[0]) && n <= Number(m[1]);
    })[0];
    if (!gd) return { khongRo: true, thang: n };
    return {
      thang: n, tong: tong, giaiDoan: gd.so, ten: gd.ten, c: gd.c,
      hoi: gd.hoi, loiViec: (gd.loiViec || []).slice(), sanPham: gd.sanPham,
      nghiThucMoDuoc: G.t5pNghiThuc(gd.so).duoc
    };
  };

  /* ═══════════ MỞ 4: NGHI THỨC NÀO ĐƯỢC CHẠY ═══════════ */
  G.t5pNghiThuc = function (giaiDoan) {
    var ds = G.T5P_NGHITHUC || [];
    if (!ds.length) return { chuaDo: true, thieu: 'T5P_NGHITHUC', duoc: [], chua: [] };
    var gd = Number(giaiDoan) || 0;
    var duoc = [], chua = [];
    ds.forEach(function (n) {
      (gd >= Number(n.tuGiaiDoan) ? duoc : chua).push(n);
    });
    return {
      giaiDoan: gd,
      duoc: duoc, chua: chua,
      nhac: (G.T5P_NGHITHUC_LUAT || {}).antoanTruoc || '',
      cot: (G.T5P_NGHITHUC_LUAT || {}).cot || ''
    };
  };

  /* ═══════════ MỞ 5: COACH NÀY CẦM ĐƯỢC CASE CHƯA ═══════════

     bang là {N1:'M4', N2:'M3', …}. Thiếu năng lực nào thì báo thiếu,
     không coi là chưa đạt — chưa chấm khác với chấm rồi mà thấp. */
  G.t5pNhanCase = function (bang) {
    var ds = G.T5P_NANGLUC || [];
    if (!ds.length) return { chuaDo: true, thieu: 'T5P_NANGLUC' };
    bang = bang || {};
    var thieu = [], chuaDat = [];
    ds.forEach(function (n) {
      var m = bang[n.ma];
      if (!m) { thieu.push(n.ma + ' ' + n.ten); return; }
      var co = MUC_BAC[String(m).toUpperCase()] || 0;
      var can = MUC_BAC[n.mucToiThieu] || 0;
      if (co < can) chuaDat.push(n.ma + ' ' + n.ten + ' — đang ' + m + ', cần ' + n.mucToiThieu);
    });
    if (thieu.length) return { chuaChamDu: true, thieu: thieu, daCham: ds.length - thieu.length, can: ds.length };
    return {
      nhanDuoc: chuaDat.length === 0,
      chuaDat: chuaDat,
      chuan: (G.T5P_NANGLUC_LUAT || {}).congNhanCase || '',
      aiCham: (G.T5P_NANGLUC_LUAT || {}).aiCham || ''
    };
  };

  /* ═══════════ TỪ CHỐI: BÁO GIÁ ═══════════ */
  G.t5pBaoGia = function () {
    var g = G.T5P_GIA || {};
    if (!g.donVi) return { chuaDo: true, thieu: 'T5P_GIA' };

    var giaTu = Number(g.giaTu);
    var giaDen = Number(g.giaDen);
    if (Number.isFinite(giaTu) && Number.isFinite(giaDen) && giaTu > 0 && giaDen >= giaTu)
      return { baoDuoc: true, khoangGia: true, giaTu: giaTu, giaDen: giaDen,
        donVi: g.donVi, cachBao: g.cachBao || '' };

    /* Giữ tương thích với bản cũ cho tới khi kho mới được cấp. */
    var trongBang = null;
    if (coKho('HP_TANG'))
      trongBang = (G.HP_TANG || []).filter(function (x) {
        return /pro/i.test(String(x.tang)) || /PRO/.test(String(x.ten || ''));
      })[0] || null;

    if (trongBang && trongBang.gia !== null && trongBang.gia !== undefined)
      return { baoDuoc: true, gia: trongBang.gia, donVi: trongBang.donVi, tuBang: true };

    return { baoDuoc: false, viChua: g.viChuaBaoGia || 'Chưa có bảng giá T5-PRO.',
      giaTaiLieu: g.giaTaiLieu, donViTaiLieu: g.donViTaiLieu,
      nhan: 'CHƯA CÓ GIÁ ĐƯỢC DUYỆT', luatKhac: (g.luatKhac || []).slice() };
  };

  G.t5pPhien = function (ma) {
    var ds = G.T5P_PHIEN || [];
    if (!ma) return ds.slice();
    return ds.filter(function (p) { return p.ma === String(ma).toUpperCase(); })[0] || null;
  };

  /* ═══════════ KHOÁ 1: KHÔNG ÂM THẦM THÀNH TẦNG THỨ SÁU ═══════════ */
  G.t5pSoiKhongPhaiTang = function () {
    var loi = [];
    if (!(G.T5P_LOI || {}).khongPhaiTangSau)
      loi.push('T5P_LOI chưa khai đây không phải tầng thứ sáu');

    /* Không bản ghi nào của dòng này được mang mã tầng. */
    ['T5P_GIAIDOAN', 'T5P_NGHITHUC', 'T5P_PHIEN', 'T5P_SANGLOC', 'T5P_TUCHOI'].forEach(function (k) {
      (G[k] || []).forEach(function (x) {
        if (x.tang !== undefined) loi.push(k + ' có bản ghi mang trường tang: ' + x.tang);
      });
    });

    /* Bảng giá phải vẫn đúng năm tầng. Kho nghề nên máy gia đình
       không có — vắng là quyền, không phải lỗi. */
    if (coKho('HP_TANG')) {
      var n = (G.HP_TANG || []).length;
      if (n !== 5) loi.push('HP_TANG có ' + n + ' dòng, phải năm — dòng PRO không được thành tầng thứ sáu');
    }
    return { chuaDo: false, loi: loi, doBangGia: coKho('HP_TANG') };
  };

  G.t5pSoiSangLoc = function () {
    var ds = G.T5P_SANGLOC || [], l = G.T5P_SANGLOC_LUAT || {}, loi = [];
    if (ds.length !== 6) loi.push('cửa vào phải có đúng sáu tiêu chí');
    if (ds.filter(function (x) { return x.loaiCung; }).length !== 2)
      loi.push('phải có đúng hai tiêu chí loại cứng');
    var gates = (l.dieuKienTienQuyet || []).map(function (x) { return x.ma; }).sort();
    if (gates.join(',') !== 'nangLucKhoiNghiep,phuHopHeSinhThai')
      loi.push('thiếu hoặc sai hai điều kiện tiên quyết VIP');
    (l.dieuKienTienQuyet || []).forEach(function (x) {
      if (!x.ten || !x.cachXacMinh) loi.push('điều kiện tiên quyết thiếu cách xác minh');
    });
    return { chuaDo: !ds.length, loi: loi, so: ds.length,
      dieuKienTienQuyet: gates.length };
  };

  /* ═══════════ KHOÁ 2: MƯỜI HAI ĐIỀU ĐẠO ĐỨC ═══════════ */
  G.t5pSoiDaoDuc = function () {
    var ds = G.T5P_DAODUC || [], loi = [];
    if (!ds.length) return { chuaDo: true, thieu: 'T5P_DAODUC', loi: [] };
    if (ds.length !== 12) loi.push('có ' + ds.length + ' điều, sổ tay ghi mười hai');

    var cum = {}, thay = {};
    ds.forEach(function (d) {
      var n = 'điều ' + d.no;
      if (thay[d.no]) loi.push(n + ' trùng số');
      thay[d.no] = 1;
      if (!d.dieu) loi.push(n + ' thiếu nội dung');
      if (!d.cum) loi.push(n + ' chưa khai cụm');
      else cum[d.cum] = (cum[d.cum] || 0) + 1;
      /* Một điều chỉ có tên mà không nói thêm gì là một điều không
         dùng được lúc phải quyết. */
      if (!d.chiTiet && !d.hauQua && !d.vi && !d.thayVao && !d.lam && !d.huaGi)
        loi.push(n + ' chỉ có tên, không nói được gì thêm');
    });
    if (Object.keys(cum).length !== 4)
      loi.push('có ' + Object.keys(cum).length + ' cụm, sổ tay chia bốn');

    var nang = ds.filter(function (d) { return d.nangNhat; });
    if (nang.length !== 1) loi.push('phải có đúng một điều đánh dấu nặng nhất, đang có ' + nang.length);
    if ((G.T5P_DAODUC_LUAT || {}).dichViPham !== 0)
      loi.push('đích vi phạm phải bằng không');
    return { chuaDo: false, loi: loi, soDieu: ds.length, cum: cum };
  };

  /* ═══════════ KHOÁ 3: MƯỜI MỘT NĂNG LỰC ═══════════ */
  G.t5pSoiNangLuc = function () {
    var ds = G.T5P_NANGLUC || [], loi = [];
    if (!ds.length) return { chuaDo: true, thieu: 'T5P_NANGLUC', loi: [] };
    if (ds.length !== 11) loi.push('có ' + ds.length + ' năng lực, sổ tay ghi mười một');

    var maCum = (G.T5P_CUM || []).map(function (c) { return c.ma; });
    var thay = {};
    ds.forEach(function (n) {
      if (thay[n.ma]) loi.push(n.ma + ' trùng mã');
      thay[n.ma] = 1;
      if (!n.ten) loi.push(n.ma + ' thiếu tên');
      if (maCum.indexOf(n.cum) < 0) loi.push(n.ma + ' thuộc cụm không có thật: ' + n.cum);
      if (!MUC_BAC[n.mucToiThieu]) loi.push(n.ma + ' mức tối thiểu lạ: ' + n.mucToiThieu);
    });

    /* Ba cái đòi M4 là N1, N2, N9 — không phải một danh sách tuỳ ý.
       Nới một cái trong ba là nới đúng chỗ sổ tay nói không sửa được
       bằng kinh nghiệm. */
    var m4 = ds.filter(function (n) { return n.mucToiThieu === 'M4'; })
               .map(function (n) { return n.ma; }).sort().join(',');
    if (m4 !== 'N1,N2,N9') loi.push('nhóm đòi M4 đang là [' + m4 + '], phải là N1,N2,N9');

    if ((G.T5P_MUC || []).length !== 4) loi.push('thang thành thạo phải bốn mức');
    return { chuaDo: false, loi: loi, so: ds.length };
  };

  /* ═══════════ KHOÁ 4: NGHI THỨC PHẢI CÓ CỔNG ═══════════ */
  G.t5pSoiNghiThuc = function () {
    var ds = G.T5P_NGHITHUC || [], loi = [];
    if (!ds.length) return { chuaDo: true, thieu: 'T5P_NGHITHUC', loi: [] };
    if (ds.length !== 7) loi.push('có ' + ds.length + ' nghi thức, sổ tay ghi bảy');
    var soGd = (G.T5P_GIAIDOAN || []).length || 4;
    ds.forEach(function (n) {
      var t = 'nghi thức ' + n.so;
      if (!n.ten) loi.push(t + ' thiếu tên');
      if (!(Number(n.tuGiaiDoan) >= 1 && Number(n.tuGiaiDoan) <= soGd))
        loi.push(t + ' khai giai đoạn ngoài 1–' + soGd + ': ' + n.tuGiaiDoan);
      if (!n.lam) loi.push(t + ' chưa nói làm gì');
      if (n.chuaChiTiet) loi.push(t + ' còn đánh dấu chưa có nội dung');
      if (n.so === 6 || n.so === 7) {
        var mau = n.mauThamKhao || [];
        if (mau.length !== 10) loi.push(t + ' phải có đúng mười bộ mẫu tham khảo');
        mau.forEach(function (m, i) {
          if (!m.ten || !m.mucTieu || !m.cacBuoc || !m.dauRa || !m.ranhGioi)
            loi.push(t + ' · mẫu ' + (i + 1) + ' thiếu trường bắt buộc');
        });
      }
      /* Cái sâu nhất phải có điều kiện riêng — cổng giai đoạn một
         mình nó không đủ cho một nghi thức mở vết thương. */
      if (n.sauNhat && !n.dieuKienRieng) loi.push(t + ' đánh dấu sâu nhất mà không khai điều kiện riêng');
    });
    var chuaRuot = ds.filter(function (n) { return n.chuaChiTiet; }).length;
    return { chuaDo: false, loi: loi, so: ds.length, chuaRuot: chuaRuot };
  };

  G.t5pSoiGia = function () {
    var g = G.T5P_GIA || {}, loi = [];
    if (!(Number(g.giaTu) === 500000000 && Number(g.giaDen) === 2000000000))
      loi.push('khoảng giá chính thức phải từ 500 triệu đến 2 tỷ đồng');
    if (!g.donVi || !g.cachBao) loi.push('thiếu đơn vị hoặc nguyên tắc báo giá theo hồ sơ');
    return { chuaDo: !Object.keys(g).length, loi: loi,
      giaTu: Number(g.giaTu) || 0, giaDen: Number(g.giaDen) || 0 };
  };

  G.t5pSoiR5 = function () {
    var ds = (G.T5P_R5 || {}).nguyenTac || [];
    var chuan = ['Minh bạch', 'Rõ ràng', 'Chuẩn mực', 'Cam kết', 'Chính trực'];
    var loi = [];
    if ((G.T5P_R5 || {}).ma !== 'R5') loi.push('thiếu mã quy tắc R5');
    if (ds.length !== chuan.length || ds.some(function (x, i) {
      return x !== chuan[i];
    })) loi.push('năm nguyên tắc R5 không khớp quyết định chủ hệ');
    return {chuaDo: !G.T5P_R5, loi: loi, nguyenTac: ds.length};
  };

  G.t5pChoChu = function () { return (G.T5P_CHOCHU || []).slice(); };

  /* ═══════════════════════════════════════════════════════════
     MÀN HÌNH
     ═══════════════════════════════════════════════════════════ */
  G.VIEWS['tang5-pro'] = function () {
    if (!G.can('pro_gia_nghiep'))
      return U.empty('Chưa được cấp quyền T5-PRO',
        'R01–R02 có quyền mặc định. Nhân sự khác cần được Admin cấp quyền cá nhân còn hạn rồi đăng nhập lại.');
    if (!G.T5P_LOI)
      return U.empty('Chưa mở được phần này',
        'Gói T5-PRO chưa được cấp hoặc chưa giải mã trong phiên này.');

    var loi = G.T5P_LOI;
    var o = U.ph({ eyebrow: 'CHƯƠNG TRÌNH VIP T5-PRO · KHỞI NGHIỆP', ic: 'vault', grad: 1,
      t: 'Chương trình VIP T5-PRO · Khởi nghiệp và hệ sinh thái doanh nghiệp',
      lead: 'Chương trình chuyên gia đồng hành được chuẩn bị riêng cho khách hàng tiềm năng đạt chuẩn; ' +
        'đứng ngoài 10 cấp Tầng 5, không làm thay đổi cấu trúc năm tầng.' });

    o += '<div class="card mb" style="border-color:#0B667556">' +
      '<p style="line-height:1.9"><b>' + h(loi.dinhVi || '') + '</b></p>' +
      '<p class="sm mt" style="line-height:1.85;font-style:italic">&ldquo;' + h(loi.tuyenNgon || '') + '&rdquo;</p>' +
      '<p class="tiny mt" style="line-height:1.7;color:#BE0E16"><b>' + h(loi.viKhongPhaiTangSau || '') + '</b></p>' +
      '<p class="tiny dim mt" style="line-height:1.7">' + h(loi.dungTrenNen || '') + '</p>' +
      '<p class="tiny mt" style="line-height:1.7;color:#0B6675"><b>Thước cuối: ' + h(loi.thuocDoCuoi || '') + '</b></p></div>';

    var skt = G.t5pSoiKhongPhaiTang();
    var ssl = G.t5pSoiSangLoc();
    var sgia = G.t5pSoiGia();
    var sr5 = G.t5pSoiR5();
    if (skt.loi && skt.loi.length)
      o += '<div class="card mb" style="border-color:#BE0E16"><b class="sm" style="color:#BE0E16">' +
        'LỆCH — dòng này đang chạm vào cấu trúc năm tầng: ' + h(skt.loi.join(' · ')) + '</b></div>';
    if (ssl.loi.length || sgia.loi.length || sr5.loi.length)
      o += '<div class="card mb" style="border-left:3px solid #BE0E16"><b class="sm" style="color:#BE0E16">CẦN RÀ SOÁT CỬA VÀO / GIÁ / R5</b>' +
        '<p class="tiny mt">' + h(ssl.loi.concat(sgia.loi, sr5.loi).join(' · ')) + '</p></div>';

    o += G.kaKhung ? G.kaKhung('tang5-pro', 'dau') : '';

    /* ── Ba trụ ── */
    o += U.sec('Ba trụ giá trị', 'Mọi truyền thông, mọi buổi tìm hiểu chỉ nói ba điều này.');
    o += '<div class="card mb">' + (G.T5P_BATRU || []).map(function (t) {
      return '<div style="padding:9px 0;border-bottom:1px solid var(--gita-vien-2)">' +
        '<span class="tiny up" style="color:' + t.c + '"><b>' + t.so + '. ' + h(t.ten) + '</b></span>' +
        '<p class="sm mt" style="line-height:1.8">' + h(t.nhanDuoc) + '</p>' +
        '<p class="tiny mt" style="line-height:1.7;color:#BE0E16">Nếu không có: ' + h(t.matNeuKhong) + '</p></div>';
    }).join('') + '</div>';

    /* ── Khác gì T5 thường ── */
    o += U.sec('Khác gì tầng 5 thường', (G.T5P_KHAC_LUAT || {}).dungKhiNao || '');
    if (U.tbl) {
      o += U.tbl(['Chiều', 'Tầng 5', 'T5-PRO'],
        (G.T5P_KHAC_T5 || []).map(function (r) {
          return ['<b>' + h(r.chieu) + '</b>', h(r.t5), '<b>' + h(r.pro) + '</b>'];
        }));
    }
    o += '<p class="tiny dim mb" style="line-height:1.7">' +
      h((G.T5P_KHAC_LUAT || {}).viKhongCoDongGia || '') + '</p>';

    /* ── Năm ranh giới ── */
    o += U.sec('T5-PRO KHÔNG là gì', 'Năm ranh giới định vị. Sai từ buổi đầu là sai cả dòng.');
    o += '<div class="card mb">' + (G.T5P_KHONGLA || []).map(function (k) {
      return '<div style="padding:8px 0;border-bottom:1px solid var(--gita-vien-2)">' +
        '<b class="sm" style="color:#BE0E16">KHÔNG: ' + h(k.khong) + '</b>' +
        '<p class="tiny mt" style="line-height:1.7">' + h(k.ranh) + '</p>' +
        (k.thayVao ? '<p class="tiny mt" style="line-height:1.7;color:#0B6675">Thay vào: ' +
          h(k.thayVao) + '</p>' : '') + '</div>';
    }).join('') + '</div>';

    /* ── Cửa vào ── */
    var sl = G.T5P_SANGLOC_LUAT || {};
    o += U.sec('Cửa vào — sáu tiêu chí, hai tiêu chí loại cứng và điều kiện VIP', sl.thang || '');
    o += '<div class="card mb">' + (G.T5P_SANGLOC || []).map(function (t) {
      return '<div style="padding:9px 0;border-bottom:1px solid var(--gita-vien-2)">' +
        '<b class="sm">' + t.so + '. ' + h(t.ten) + '</b>' +
        (t.loaiCung ? ' <span class="tiny" style="color:#BE0E16">LOẠI CỨNG</span>' : '') +
        '<p class="tiny mt" style="line-height:1.7;color:#0B6675">4 điểm: ' + h(t.bonDiem) + '</p>' +
        '<p class="tiny mt" style="line-height:1.7;color:#BE0E16">0 điểm: ' + h(t.khongDiem) + '</p></div>';
    }).join('') + '</div>';
    o += '<div class="card mb" style="border-color:#BE0E1644">' +
      '<p class="sm" style="line-height:1.8"><b>' + h(sl.loaiCung || '') + '</b></p>' +
      '<p class="tiny dim mt" style="line-height:1.7">' + h(sl.viLoaiCung || '') + '</p>' +
      '<p class="tiny mt" style="line-height:1.7;color:#B4720F">' + h(sl.viChamThap || '') + '</p>' +
      '<p class="tiny mt" style="line-height:1.7;color:#B4720F">' + h(sl.khongTuChamTuQuyet || '') + '</p></div>';
    o += '<div class="card mb" style="border-left:3px solid #5140B4"><b class="sm">ĐIỀU KIỆN TIÊN QUYẾT — NGƯỜI CÓ THẨM QUYỀN PHẢI XÁC MINH</b>' +
      '<p class="tiny mt" style="line-height:1.7">' + h(sl.dieuKienTienQuyetGhiChu || '') + '</p>' +
      '<ul class="tiny mt" style="line-height:1.8;padding-left:20px">' +
        (sl.dieuKienTienQuyet || []).map(function (x) {
          return '<li><b>' + h(x.ten) + ':</b> ' + h(x.cachXacMinh || '') + '</li>';
        }).join('') + '</ul>' +
      '<p class="tiny mt" style="color:#BE0E16">Thiếu xác minh hoặc không đạt một điều kiện thì không kết luận nhận vào, dù tổng điểm cao.</p></div>';

    /* Hai ca chạy thật, để thấy cổng loại cứng làm việc. */
    var dieuKienMau = { nangLucKhoiNghiep: true, phuHopHeSinhThai: true };
    var caA = G.t5pSangLoc({ 1: 4, 2: 3, 3: 3, 4: 3, 5: 3, 6: 3 }, dieuKienMau);
    var caB = G.t5pSangLoc({ 1: 1, 2: 4, 3: 4, 4: 4, 5: 4, 6: 4 }, dieuKienMau);
    if (caA && caA.ket)
      o += '<div class="card mb"><span class="tiny up dim">CỔNG CHẠY THẬT</span>' +
        '<p class="sm mt" style="line-height:1.8"><b>Ca A</b> — tổng ' + caA.tong + '/' + caA.tran +
        ', không tiêu chí nào loại cứng → <b>' + h(caA.ket) + '</b></p>' +
        '<p class="sm mt" style="line-height:1.8"><b>Ca B</b> — tổng ' + caB.tong +
        ', cao hơn ca A, nhưng tiêu chí loại cứng chỉ 1 điểm → <b style="color:#BE0E16">' +
        h(caB.ket) + '</b></p>' +
        (caB.phamTieuChi ? '<p class="tiny mt" style="line-height:1.7;color:#BE0E16">' +
          h(caB.phamTieuChi.join(' · ')) + '</p>' : '') +
        '<p class="tiny dim mt" style="line-height:1.7">Tổng điểm che được chỗ ấy, nên nó có cửa riêng.</p></div>';

    /* ── Từ chối ── */
    o += U.sec('Nghệ thuật từ chối — năm dạng, kèm nguyên văn',
      'Từ chối không đường ra là bỏ rơi.');
    o += '<div class="card mb">' + (G.T5P_TUCHOI_LUAT || []).map(function (l) {
      return '<div style="padding:7px 0;border-bottom:1px solid var(--gita-vien-2)">' +
        '<b class="sm">' + l.no + '. ' + h(l.luat) + '</b>' +
        (l.vi ? '<p class="tiny dim mt" style="line-height:1.7">' + h(l.vi) + '</p>' : '') +
        (l.mauCau ? '<p class="tiny mt" style="line-height:1.8">&ldquo;' + h(l.mauCau) + '&rdquo;</p>' : '') +
        '</div>';
    }).join('') + '</div>';
    o += (G.T5P_TUCHOI || []).map(function (t) {
      return '<div class="card mb" style="border-color:#BE0E1633">' +
        '<span class="tiny up" style="color:#BE0E16">' + h(t.ma) + '</span>' +
        '<p class="mt" style="line-height:1.9"><b>' + h(t.ten) + '</b></p>' +
        '<p class="tiny dim mt" style="line-height:1.7">Tín hiệu: ' + h(t.tinHieu) + '</p>' +
        '<div class="mt" style="padding:10px 12px;border-left:3px solid #BE0E16;background:var(--gita-nen-2)">' +
        '<p class="sm" style="line-height:1.85">&ldquo;' + h(t.loi) + '&rdquo;</p></div>' +
        (t.ranhGioi ? '<p class="tiny mt" style="line-height:1.7;color:#B4720F">' + h(t.ranhGioi) + '</p>' : '') +
        (t.camTuyetDoi ? '<p class="tiny mt" style="line-height:1.7;color:#BE0E16"><b>' +
          h(t.camTuyetDoi) + '</b></p>' : '') +
        (t.duongRa ? '<p class="tiny mt" style="line-height:1.7;color:#0B6675">Đường ra: ' +
          h(t.duongRa) + '</p>' : '') + '</div>';
    }).join('');
    o += '<div class="card mb"><span class="tiny up dim">SAU KHI TỪ CHỐI — BA VIỆC BẮT BUỘC</span>' +
      (G.T5P_SAUTUCHOI || []).map(function (v) {
        return '<p class="sm mt" style="line-height:1.8"><b>' + h(v.viec) + ':</b> ' + h(v.chiTiet) + '</p>' +
          (v.vi ? '<p class="tiny dim" style="line-height:1.7">' + h(v.vi) + '</p>' : '');
      }).join('') + '</div>';

    o += G.kaKhung ? G.kaKhung('tang5-pro', 'giua') : '';

    /* ── Bốn giai đoạn ── */
    o += U.sec('Bốn giai đoạn, mỗi giai đoạn sáu tháng',
      (G.T5P_TRINHTU || {}).ngoaiLeDuyNhat || '');
    o += (G.T5P_GIAIDOAN || []).map(function (g) {
      return '<div class="card mb" style="border-color:' + g.c + '4d">' +
        '<span class="tiny up" style="color:' + g.c + '">GIAI ĐOẠN ' + g.so + ' · THÁNG ' +
        h(g.thang) + ' · ' + h(g.ten).toUpperCase() + '</span>' +
        '<p class="mt" style="line-height:1.9"><b>&ldquo;' + h(g.hoi) + '&rdquo;</b></p>' +
        '<ul class="tiny mt" style="line-height:1.8;padding-left:18px">' +
        (g.loiViec || []).map(function (v) { return '<li>' + h(v) + '</li>'; }).join('') + '</ul>' +
        '<p class="sm mt" style="line-height:1.8">Sản phẩm: <b>' + h(g.sanPham) + '</b></p>' +
        (g.nhipDay ? '<p class="tiny dim mt" style="line-height:1.7">' + h(g.nhipDay) + '</p>' : '') +
        (g.batDauVai ? '<p class="tiny dim mt" style="line-height:1.7">' + h(g.batDauVai) + '</p>' : '') +
        '</div>';
    }).join('');
    o += '<div class="card mb"><span class="tiny up dim">VÌ SAO KHÔNG NHẢY CÓC</span>' +
      ((G.T5P_TRINHTU || {}).luat || []).map(function (l) {
        return '<p class="sm mt" style="line-height:1.8"><b>' + h(l.buoc) + '.</b> ' + h(l.vi) + '</p>';
      }).join('') +
      '<p class="tiny mt" style="line-height:1.7;color:#B4720F"><b>' +
      h((G.T5P_TRINHTU || {}).viNgoaiLe || '') + '</b></p></div>';

    /* ── Đội ba vai ── */
    o += U.sec('Đội ba vai', 'Coach giữ danh dự của hệ, Tư vấn giữ cấu trúc, Trợ lý giữ trí nhớ.');
    o += '<div class="card mb">' + (G.T5P_DOI || []).map(function (v) {
      return '<div style="padding:9px 0;border-bottom:1px solid var(--gita-vien-2)">' +
        '<span class="tiny up" style="color:' + v.c + '"><b>' + h(v.vai) + '</b></span>' +
        (v.chuTri ? ' <span class="tiny dim">chủ trì</span>' : '') +
        '<p class="sm mt" style="line-height:1.8">' + h(v.lamViecVoi) + '</p>' +
        '<p class="tiny mt" style="line-height:1.7">Phạm vi: ' + h(v.phamVi) + '</p>' +
        '<p class="tiny mt" style="line-height:1.7;color:#BE0E16">Không: ' +
        h((v.khongLam || []).join(' · ')) + '</p>' +
        (v.khacDongThuong ? '<p class="tiny mt" style="line-height:1.7;color:#B4720F">' +
          h(v.khacDongThuong) + '</p>' : '') + '</div>';
    }).join('') + '</div>';
    o += '<div class="card mb">' + (G.T5P_PHOI_DOI || []).map(function (p) {
      return '<div style="padding:8px 0;border-bottom:1px solid var(--gita-vien-2)">' +
        '<b class="sm">' + h(p.ma) + ' — ' + h(p.luat) + '</b>' +
        (p.chiTiet ? '<p class="tiny mt" style="line-height:1.7">' + h(p.chiTiet) + '</p>' : '') +
        (p.caNhan ? '<p class="tiny mt" style="line-height:1.7">' + h(p.caNhan) + '</p>' : '') +
        (p.mayKhongGiuRieng ? '<p class="tiny mt" style="line-height:1.7;color:#B4720F">' +
          h(p.mayKhongGiuRieng) + '</p>' : '') +
        (p.ngoaiLeBatBuoc ? '<p class="tiny mt" style="line-height:1.7;color:#BE0E16"><b>' +
          h(p.ngoaiLeBatBuoc) + '</b></p>' : '') +
        (p.vi ? '<p class="tiny dim mt" style="line-height:1.7">' + h(p.vi) + '</p>' : '') +
        (p.noiTuPhienDau ? '<p class="tiny mt" style="line-height:1.8">&ldquo;' +
          h(p.noiTuPhienDau) + '&rdquo;</p>' : '') + '</div>';
    }).join('') + '</div>';

    /* ── Mười hai điều đạo đức ── */
    var sdd = G.t5pSoiDaoDuc();
    o += U.sec('Mười hai điều đạo đức' + (sdd.loi && sdd.loi.length ? ' — LỆCH: ' + sdd.loi.join(' · ') : ''),
      (G.T5P_DAODUC_LUAT || {}).cot || '');
    o += '<div class="card mb">' + (G.T5P_DAODUC || []).map(function (d) {
      return '<div style="padding:8px 0;border-bottom:1px solid var(--gita-vien-2)">' +
        '<span class="tiny up dim">' + h(d.cum) + '</span> ' +
        '<b class="sm">' + d.no + '. ' + h(d.dieu) + '</b>' +
        (d.nangNhat ? ' <span class="tiny" style="color:#BE0E16">NẶNG NHẤT</span>' : '') +
        (d.chiTiet ? '<p class="tiny mt" style="line-height:1.7">' + h(d.chiTiet) + '</p>' : '') +
        (d.lam ? '<p class="tiny mt" style="line-height:1.7">' + h(d.lam) + '</p>' : '') +
        (d.thayVao ? '<p class="tiny mt" style="line-height:1.7;color:#0B6675">' + h(d.thayVao) + '</p>' : '') +
        (d.huaGi ? '<p class="tiny mt" style="line-height:1.7;color:#0B6675">' + h(d.huaGi) + '</p>' : '') +
        (d.hauQua ? '<p class="tiny mt" style="line-height:1.7;color:#BE0E16"><b>' + h(d.hauQua) + '</b></p>' : '') +
        (d.vi ? '<p class="tiny dim mt" style="line-height:1.7">' + h(d.vi) + '</p>' : '') +
        (d.khongPhaiPhucLoi ? '<p class="tiny mt" style="line-height:1.7;color:#B4720F">' +
          h(d.khongPhaiPhucLoi) + '</p>' : '') + '</div>';
    }).join('') + '</div>';
    o += '<p class="tiny dim mb" style="line-height:1.7">' +
      h((G.T5P_DAODUC_LUAT || {}).daCoONen || '') + '</p>';

    /* ── Mười một năng lực ── */
    var snl = G.t5pSoiNangLuc();
    o += U.sec('Mười một năng lực, và cổng nhận case' +
      (snl.loi && snl.loi.length ? ' — LỆCH: ' + snl.loi.join(' · ') : ''),
      (G.T5P_NANGLUC_LUAT || {}).congNhanCase || '');
    (G.T5P_CUM || []).forEach(function (c) {
      var ds = (G.T5P_NANGLUC || []).filter(function (n) { return n.cum === c.ma; });
      if (!ds.length) return;
      o += '<div class="card mb"><span class="tiny up dim">' + h(c.ten) + ' — ' + h(c.hoi) + '</span>' +
        ds.map(function (n) {
          return '<p class="sm mt" style="line-height:1.8"><b>' + h(n.ma) + '</b> ' + h(n.ten) +
            ' <span class="tiny" style="color:' + (n.mucToiThieu === 'M4' ? '#BE0E16' : '#0B6675') +
            '">cần ' + h(n.mucToiThieu) + '</span></p>';
        }).join('') + '</div>';
    });
    o += '<p class="tiny mb" style="line-height:1.7;color:#B4720F">' +
      h((G.T5P_NANGLUC_LUAT || {}).viBaCaiM4 || '') + '</p>';

    /* ── Bốn loại phiên ── */
    o += U.sec('Bốn loại phiên', 'Mỗi loại một khung riêng — dùng nhầm khung là hỏng đúng loại phiên đó.');
    o += (G.T5P_PHIEN || []).map(function (p) {
      return '<div class="card mb" style="border-color:' + p.c + '4d">' +
        '<span class="tiny up" style="color:' + p.c + '">' + h(p.ten).toUpperCase() + ' · ' +
        h(String(p.phut)) + ' PHÚT · ' + p.soNhip + ' NHỊP' +
        (p.tuoi ? ' · ' + h(p.tuoi) + ' TUỔI' : '') + '</span>' +
        (p.viKhungRieng ? '<p class="tiny dim mt" style="line-height:1.7">' + h(p.viKhungRieng) + '</p>' : '') +
        (p.nhip || []).map(function (n) {
          return '<div style="padding:8px 0;border-bottom:1px solid var(--gita-vien-2)">' +
            '<b class="sm">' + n.so + '. ' + h(n.ten) + ' — ' + h(String(n.phut)) + ' phút</b>' +
            (n.traiTim ? ' <span class="tiny" style="color:' + p.c + '">trái tim phiên</span>' : '') +
            (n.lam ? '<p class="tiny mt" style="line-height:1.7">' + h(n.lam) + '</p>' : '') +
            (n.baLuat ? '<ul class="tiny mt" style="line-height:1.8;padding-left:18px">' +
              n.baLuat.map(function (x) { return '<li>' + h(x) + '</li>'; }).join('') + '</ul>' : '') +
            (n.baCau ? '<ul class="tiny mt" style="line-height:1.8;padding-left:18px">' +
              n.baCau.map(function (x) { return '<li>' + h(x) + '</li>'; }).join('') + '</ul>' : '') +
            (n.vungSau ? '<ul class="tiny mt" style="line-height:1.8;padding-left:18px">' +
              n.vungSau.map(function (x) { return '<li>' + h(x) + '</li>'; }).join('') + '</ul>' : '') +
            (n.luatDeTai ? '<ul class="tiny mt" style="line-height:1.8;padding-left:18px">' +
              n.luatDeTai.map(function (x) { return '<li>' + h(x) + '</li>'; }).join('') + '</ul>' : '') +
            (n.haiHinhThuc ? '<ul class="tiny mt" style="line-height:1.8;padding-left:18px">' +
              n.haiHinhThuc.map(function (x) { return '<li>' + h(x) + '</li>'; }).join('') + '</ul>' : '') +
            (n.dieuChinh ? '<ul class="tiny mt" style="line-height:1.8;padding-left:18px">' +
              n.dieuChinh.map(function (x) { return '<li>' + h(x) + '</li>'; }).join('') + '</ul>' : '') +
            (n.vong ? '<ul class="tiny mt" style="line-height:1.8;padding-left:18px">' +
              n.vong.map(function (x) { return '<li>' + h(x) + '</li>'; }).join('') + '</ul>' : '') +
            (n.loi ? '<p class="tiny mt" style="line-height:1.8">&ldquo;' + h(n.loi) + '&rdquo;</p>' : '') +
            (n.chuyenHoa ? '<p class="tiny mt" style="line-height:1.8">&ldquo;' + h(n.chuyenHoa) + '&rdquo;</p>' : '') +
            (n.luat ? '<p class="tiny mt" style="line-height:1.7;color:#B4720F"><b>' + h(n.luat) + '</b></p>' : '') +
            (n.luatDeTaiChung ? '<p class="tiny mt" style="line-height:1.7;color:#B4720F">' +
              h(n.luatDeTaiChung) + '</p>' : '') +
            (n.luatDiSau ? '<p class="tiny mt" style="line-height:1.7;color:#B4720F">' + h(n.luatDiSau) + '</p>' : '') +
            (n.canhBao ? '<p class="tiny mt" style="line-height:1.7;color:#BE0E16">' + h(n.canhBao) + '</p>' : '') +
            (n.khongLam ? '<p class="tiny mt" style="line-height:1.7;color:#BE0E16">' + h(n.khongLam) + '</p>' : '') +
            (n.camTuyetDoi ? '<p class="tiny mt" style="line-height:1.7;color:#BE0E16"><b>' +
              h(n.camTuyetDoi) + '</b></p>' : '') +
            (n.ghi ? '<p class="tiny mt" style="line-height:1.7;color:#0B6675">Ghi: ' + h(n.ghi) + '</p>' : '') +
            '</div>';
        }).join('') + '</div>';
    }).join('');

    /* ── Bảy nghi thức ── */
    var snt = G.t5pSoiNghiThuc();
    o += U.sec('Bảy nghi thức hệ, và giai đoạn sớm nhất được chạy' +
      (snt.loi && snt.loi.length ? ' — LỆCH: ' + snt.loi.join(' · ') : ''),
      (G.T5P_NGHITHUC_LUAT || {}).cot || '');
    o += '<div class="card mb">' + (G.T5P_NGHITHUC || []).map(function (n) {
      return '<div style="padding:9px 0;border-bottom:1px solid var(--gita-vien-2)">' +
        '<b class="sm">' + n.so + '. ' + h(n.ten) + '</b> ' +
        '<span class="tiny" style="color:#0B6675">mở từ giai đoạn ' + n.tuGiaiDoan + '</span>' +
        (n.sauNhat ? ' <span class="tiny" style="color:#BE0E16">SÂU NHẤT</span>' : '') +
        (n.xuongSong ? ' <span class="tiny" style="color:#B4720F">xương sống</span>' : '') +
        '<p class="tiny mt" style="line-height:1.7">' + h(n.lam) + '</p>' +
        (n.luatPhong ? '<p class="tiny mt" style="line-height:1.7;color:#B4720F">Luật phòng: ' +
          h(n.luatPhong) + '</p>' : '') +
        (n.cauDan ? '<p class="tiny mt" style="line-height:1.8">&ldquo;' + h(n.cauDan) + '&rdquo;</p>' : '') +
        (n.giaTri ? '<p class="tiny dim mt" style="line-height:1.7">' + h(n.giaTri) + '</p>' : '') +
        (n.dieuKienRieng ? '<p class="tiny mt" style="line-height:1.7;color:#B4720F">' +
          h(n.dieuKienRieng) + '</p>' : '') +
        (n.camTuyetDoi ? '<p class="tiny mt" style="line-height:1.7;color:#BE0E16"><b>' +
          h(n.camTuyetDoi) + '</b></p>' : '') +
        (n.nguyenTacDongThuan ? '<p class="tiny mt" style="line-height:1.7;color:#B4720F">' +
          h(n.nguyenTacDongThuan) + '</p>' : '') +
        (n.mauThamKhao ? '<div class="mt"><b class="tiny up">10 BỘ MẪU THAM KHẢO · KHÔNG PHẢI KỊCH BẢN BẮT BUỘC</b>' +
          n.mauThamKhao.map(function (m) {
            return '<details class="mt" style="border-top:1px solid var(--gita-vien-2);padding:8px 0">' +
              '<summary class="sm" style="cursor:pointer">' + h(m.so) + '. ' + h(m.ten) + '</summary>' +
              '<p class="tiny mt"><b>Mục tiêu:</b> ' + h(m.mucTieu) + '</p>' +
              '<p class="tiny mt"><b>Thành phần:</b> ' + h(m.doiTuong || '') +
                (m.thoiLuong ? ' · <b>Thời lượng:</b> ' + h(m.thoiLuong) : '') + '</p>' +
              (m.chuanBi ? '<p class="tiny mt"><b>Chuẩn bị:</b> ' + h(m.chuanBi) + '</p>' : '') +
              '<ol class="tiny mt" style="line-height:1.8;padding-left:20px">' +
                (m.cacBuoc || []).map(function (b) { return '<li>' + h(b) + '</li>'; }).join('') +
              '</ol>' +
              (m.cauHoi ? '<p class="tiny mt"><b>Câu gợi mở:</b> ' + h(m.cauHoi.join(' · ')) + '</p>' : '') +
              '<p class="tiny mt"><b>Đầu ra gợi ý:</b> ' + h(m.dauRa) + '</p>' +
              '<p class="tiny mt" style="color:#BE0E16"><b>Ranh giới an toàn:</b> ' + h(m.ranhGioi) + '</p>' +
              (m.theoDoi ? '<p class="tiny mt"><b>Theo dõi:</b> ' + h(m.theoDoi) + '</p>' : '') +
              '</details>';
          }).join('') + '</div>' : '') +
        (n.nguonMau ? '<p class="tiny dim mt">' + h(n.nguonMau) + '</p>' : '') + '</div>';
    }).join('') + '</div>';
    o += '<p class="tiny mb" style="line-height:1.7;color:#B4720F">' +
      h((G.T5P_NGHITHUC_LUAT || {}).antoanTruoc || '') + '</p>';

    /* ── Mười khủng hoảng ── */
    o += U.sec('Mười khủng hoảng đỉnh', (G.T5P_KHUNGHOANG_LUAT || {}).cot || '');
    o += '<div class="card mb">' + (G.T5P_KHUNGHOANG || []).map(function (k) {
      return '<p class="sm" style="line-height:1.8;padding:5px 0"><b>' + k.so + '.</b> ' + h(k.ten) +
        (k.canhCua ? ' <span class="tiny" style="color:#BE0E16">— nếu đang diễn ra lúc sàng lọc thì đây là lý do TỪ CHỐI</span>' : '') +
        (k.chuyenTuyen ? ' <span class="tiny" style="color:#BE0E16">— chuyển tuyến</span>' : '') +
        (k.trongDoi ? ' <span class="tiny" style="color:#B4720F">— trong đội</span>' : '') + '</p>';
    }).join('') + '</div>';
    o += '<p class="tiny mb" style="line-height:1.7;color:#B4720F">' +
      h((G.T5P_KHUNGHOANG_LUAT || {}).chuaCoKichBan || '') + '</p>';

    /* ── Thước đo ── */
    o += U.sec('Thước đo cả dòng', '');
    o += '<div class="card mb">' + (G.T5P_DICH || []).map(function (d) {
      return '<div style="padding:7px 0;border-bottom:1px solid var(--gita-vien-2)">' +
        '<b class="sm">' + h(d.ten) + '</b> ' +
        (d.dich !== undefined
          ? '<span class="tiny" style="color:#0B6675">' + (d.nguoc ? '= ' : '≥ ') +
            h(String(d.dich)) + ' ' + h(d.donVi) + '</span>'
          : '<span class="tiny dim">' + h(d.doBang || '') + '</span>') +
        (d.thuocTong ? ' <span class="tiny" style="color:#BE0E16">THƯỚC TỔNG</span>' : '') +
        (d.y ? '<p class="tiny dim mt" style="line-height:1.7">' + h(d.y) + '</p>' : '') + '</div>';
    }).join('') + '</div>';

    /* ── Tiền ── */
    var bg = G.t5pBaoGia();
    if (bg && !bg.chuaDo) {
      o += U.sec('Bảng giá chương trình VIP', bg.baoDuoc ? '' : 'Chưa có giá được duyệt.');
      o += '<div class="card mb" style="border-color:#B4720F55">';
      if (bg.baoDuoc && bg.khoangGia) {
        o += '<p class="sm" style="line-height:1.8"><b>' +
          Number(bg.giaTu).toLocaleString('vi-VN') + ' – ' +
          Number(bg.giaDen).toLocaleString('vi-VN') + ' đồng</b> — ' + h(bg.donVi) + '</p>' +
          '<p class="tiny mt" style="line-height:1.7">' + h(bg.cachBao) + '</p>';
      } else if (bg.baoDuoc) {
        o += '<p class="sm" style="line-height:1.8"><b>' +
          Number(bg.gia).toLocaleString('vi-VN') + ' đồng</b> — ' + h(bg.donVi || '') +
          ' <span class="tiny dim">đọc từ bảng giá</span></p>';
      } else if (bg.giaTaiLieu) {
        o += '<p class="sm" style="line-height:1.8"><b style="color:#BE0E16">' + h(bg.nhan) + ':</b> ' +
          Number(bg.giaTaiLieu).toLocaleString('vi-VN') + ' đồng — ' + h(bg.donViTaiLieu) + '</p>' +
          '<p class="tiny mt" style="line-height:1.7;color:#B4720F">' + h(bg.viChua) + '</p>';
      }
      o += (bg.luatKhac || []).map(function (k) {
        return '<div style="padding:7px 0;border-top:1px solid var(--gita-vien-2)">' +
          '<b class="tiny">' + h(k.khoan) + '</b>' +
          '<p class="tiny mt" style="line-height:1.7">' + h(k.chuan) + '</p>' +
          (k.vi ? '<p class="tiny dim" style="line-height:1.7">' + h(k.vi) + '</p>' : '') +
          (k.noiTruoc ? '<p class="tiny" style="line-height:1.7;color:#0B6675">' + h(k.noiTruoc) + '</p>' : '') +
          '</div>';
      }).join('') + '</div>';
    }

    var r5 = G.T5P_R5 || {};
    o += U.sec('Quy tắc R5', r5.moTa || 'Năm nguyên tắc chủ hệ đã chốt cho chương trình T5-PRO.');
    o += '<div class="card mb">' + (r5.nguyenTac || []).map(function (x, i) {
      return '<p class="sm" style="padding:7px 0;border-bottom:1px solid var(--gita-vien-2)">' +
        '<b>R5.' + (i + 1) + '</b> · ' + h(x) + '</p>';
    }).join('') + (!r5.nguyenTac || !r5.nguyenTac.length
      ? '<p class="tiny" style="color:#BE0E16">Chưa nạp bộ nguyên tắc R5.</p>' : '') +
      (sr5.loi.length ? '<p class="tiny mt" style="color:#BE0E16">' + h(sr5.loi.join(' · ')) + '</p>' : '') +
      '</div>';

    /* ── Quyết định đã chốt và nguồn còn thiếu ── */
    if ((G.T5P_QUYETDINH || []).length) {
      o += U.sec('Quyết định chủ hệ đã chốt', 'Đã áp dụng vào cấu trúc và nội dung chương trình.');
      o += '<div class="card mb">' + G.T5P_QUYETDINH.map(function (q) {
        return '<div style="padding:8px 0;border-bottom:1px solid var(--gita-vien-2)">' +
          '<b class="sm">' + h(q.chuDe) + '</b><p class="tiny mt">' + h(q.ketLuan) + '</p></div>';
      }).join('') + '</div>';
    }
    o += U.sec('Mục cần đối chiếu tài liệu gốc', 'Không suy diễn mã nghiệp vụ khi thiếu phụ lục nguồn.');
    o += '<div class="card mb">' + (G.T5P_LECH || []).map(function (l) {
      return '<div style="padding:10px 0;border-bottom:1px solid var(--gita-vien-2)">' +
        '<b class="sm">' + h(l.ma) + ' · ' + h(l.o) + '</b>' +
        (l.tuMauThuan ? ' <span class="tiny" style="color:#B4720F">tài liệu tự mâu thuẫn</span>' : '') +
        '<p class="tiny mt" style="line-height:1.7"><b>Sổ tay:</b> ' + h(l.taiLieu) + '</p>' +
        (l.kho ? '<p class="tiny mt" style="line-height:1.7"><b>Kho:</b> ' + h(l.kho) + '</p>' : '') +
        '<p class="tiny dim mt" style="line-height:1.7">' + h(l.mayLam) + '</p>' +
        (l.viKhongTuThem ? '<p class="tiny mt" style="line-height:1.7;color:#B4720F">' +
          h(l.viKhongTuThem) + '</p>' : '') +
        (l.canGi ? '<p class="tiny mt" style="line-height:1.7;color:#BE0E16"><b>Cần: ' + h(l.canGi) + '</b></p>' : '') +
        '</div>';
    }).join('') + '</div>';

    /* ── Chờ chủ hệ ── */
    var choChu = G.t5pChoChu();
    o += U.sec('Mục chờ tài liệu/chủ hệ', choChu.length
      ? 'Chưa có đủ nguồn để chuẩn hóa an toàn.' : 'Không còn câu hỏi quyết định đang mở.');
    o += '<div class="card mb">' + (choChu.length ? choChu.map(function (c) {
      return '<div style="padding:9px 0;border-bottom:1px solid var(--gita-vien-2)">' +
        '<b class="sm">' + h(c.hoi) + '</b>' +
        '<p class="tiny dim mt" style="line-height:1.7">' + h(c.boi) + '</p>' +
        (c.canGi ? '<p class="tiny mt" style="line-height:1.7;color:#B4720F">' + h(c.canGi) + '</p>' : '') +
        '</div>';
    }).join('') : '<p class="tiny">Các quyết định về phạm vi VIP, giá và quyền truy cập đã được cập nhật.</p>') + '</div>';

    if (G.S && G.S.roleObj && G.S.roleObj.lv <= 2) o += veQuyenT5Pro();

    o += G.kaKhung ? G.kaKhung('tang5-pro', 'cuoi') : '';
    return o;
  };

  G.t5pQuyenSo = null;
  G.t5pTaiQuyen = function () {
    if (!G.goiMayChu) return;
    G.goiMayChu('dsQuyenT5Pro', {}).then(function (x) {
      G.t5pQuyenSo = x; veLai();
    }).catch(function (e) {
      G.t5pQuyenSo = {ok: false, error: e && e.message}; veLai();
    });
  };
  G.t5pCapQuyen = function () {
    if (!G.goiMayChu) return;
    var username = document.getElementById('t5p-quyen-ten');
    var lyDo = document.getElementById('t5p-quyen-lydo');
    var hetHan = document.getElementById('t5p-quyen-han');
    if (!username || !lyDo || !hetHan || !username.value || !lyDo.value || !hetHan.value) {
      U.toast('Điền tài khoản, lý do và thời điểm hết hạn.', 'err'); return;
    }
    var lucHetHan = new Date(hetHan.value);
    if (!Number.isFinite(lucHetHan.getTime()) || lucHetHan <= new Date()) {
      U.toast('Thời điểm hết hạn phải ở tương lai.', 'err'); return;
    }
    G.goiMayChu('capQuyenT5Pro', {username: username.value, lyDo: lyDo.value,
      hetHan: lucHetHan.toISOString()}).then(function (x) {
      if (x && x.ok) { U.toast('Đã cấp quyền T5-PRO có hạn.', 'ok'); G.t5pQuyenSo = null; G.t5pTaiQuyen(); }
      else U.toast((x && x.error) || 'Không cấp được quyền T5-PRO.', 'err');
    }).catch(function (e) { U.toast((e && e.message) || 'Lỗi cấp quyền T5-PRO.', 'err'); });
  };
  G.t5pThuQuyen = function (username) {
    if (!G.goiMayChu) return;
    if (!confirm('Thu hồi quyền T5-PRO của ' + username + '?')) return;
    G.goiMayChu('thuHoiQuyenT5Pro', {username: username}).then(function (x) {
      if (x && x.ok) { U.toast(x.ghiChu || 'Đã thu hồi quyền.', 'ok'); G.t5pQuyenSo = null; G.t5pTaiQuyen(); }
      else U.toast((x && x.error) || 'Không thu hồi được quyền T5-PRO.', 'err');
    }).catch(function (e) { U.toast((e && e.message) || 'Lỗi thu hồi quyền T5-PRO.', 'err'); });
  };
  if (typeof document !== 'undefined' && !G.t5pQuyenEventBound) {
    G.t5pQuyenEventBound = true;
    document.addEventListener('click', function (e) {
      var nut = e.target && e.target.closest ? e.target.closest('[data-t5p-thu]') : null;
      if (nut) G.t5pThuQuyen(nut.getAttribute('data-t5p-thu'));
    });
  }
  function veLai() {
    if (!G.S || G.S.view !== 'tang5-pro' || !document.getElementById('main')) return;
    G.render && G.render();
  }
  function veQuyenT5Pro() {
    var so = G.t5pQuyenSo;
    var o = U.sec('Cấp quyền xem T5-PRO', 'R01–R02 có quyền mặc định. Các quyền khác gắn với tài khoản, có hạn và có lý do.');
    o += '<div class="card mb"><div class="grid g3">' +
      '<label class="tiny">Tên đăng nhập<input id="t5p-quyen-ten" autocomplete="off" maxlength="80"></label>' +
      '<label class="tiny">Lý do cấp<textarea id="t5p-quyen-lydo" maxlength="500"></textarea></label>' +
      '<label class="tiny">Hết hạn<input id="t5p-quyen-han" type="datetime-local" required></label></div>' +
      '<button class="btn btn-chinh mt" onclick="G.t5pCapQuyen()">Cấp quyền có hạn</button></div>';
    if (!so) o += '<button class="btn" onclick="G.t5pTaiQuyen()">Tải sổ quyền từ máy chủ</button>';
    else if (!so.ok) o += '<p class="note" style="color:#BE0E16">' + h(so.error || 'Không tải được sổ quyền.') + '</p>';
    else {
      o += '<p class="tiny dim mb">' + h(so.vi || '') + '</p>';
      o += U.tbl(['Tài khoản','Vai khi cấp','Lý do','Người cấp','Hết hạn','Trạng thái',''],
        (so.ds || []).map(function (q) {
          return [h(q.username), h(q.role), h(q.lyDo), h(q.nguoiCap),
            h(new Date(q.hetHan).toLocaleString('vi-VN')),
            q.conHieuLuc ? 'ĐANG CẤP' : (q.thuHoiLuc ? 'ĐÃ THU HỒI' : 'HẾT HẠN'),
            q.conHieuLuc ? '<button class="btn sm" data-t5p-thu="' +
              h(q.username) + '">Thu hồi</button>' : '—'];
        }));
      o += '<p class="tiny dim mt">Thu hồi chặn lần xin khóa tiếp theo; không thể xóa nội dung đã giải mã trong phiên đang mở.</p>';
    }
    if (!so) setTimeout(function () { G.t5pTaiQuyen(); }, 0);
    return o;
  }
})();
