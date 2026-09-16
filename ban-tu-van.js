/* ═══════════════════════════════════════════════════════════════
   GITA 365 — MÁY CHẠY BÀN LÀM VIỆC CỦA TƯ VẤN

   Kho ở kho-goc/data.ban-tu-van.js. Toàn bộ ở gói NGHỀ.

   ═══ CÙNG TÍNH CHẤT VỚI BÀN COACH, ĐO BẰNG CÙNG MỘT PHÉP CỘNG ═══

       mỗi nhà rơi vào ĐÚNG MỘT ngăn, tổng năm ngăn bằng tổng số nhà.

   ═══ HAI TRƯỜNG NGƯỜI GHI, VÀ VÌ SAO KHÔNG SUY RA ═══

   Bàn này cần biết một nhà đã sàng lọc chưa và hồ sơ đủ mấy ô. Cả hai
   là thứ NGƯỜI NGHE ĐƯỢC rồi ghi vào, không phải thứ suy ra từ chỉ số.

     nha.loc     kết quả bảy câu sàng lọc — { SL1: 'qua' | 'chan' | ... }
     nha.oHoSo   ô nào trong chín ô đã có nội dung — [1, 2, 5, ...]

   Vắng mặt nghĩa là CHƯA GHI, và chưa ghi thì nhà nằm ở ngăn chưa sàng
   lọc. Đó là kết quả đúng: một nhà không có kết quả sàng lọc trong hệ
   thì trong hệ nó chưa được sàng lọc, dù ngoài đời ai đó đã hỏi rồi.

   Suy "chắc đã lọc rồi vì nhà đang ở tầng 3" là cách một bảng công việc
   tự cho mình qua chỗ khó nhất của nó.

   ═══ BÀN NÀY KHÔNG XẾP HẠNG KHÁCH ═══

   Không cột nóng-ấm-lạnh, không điểm tiềm năng. Chỉ số ngược duy nhất
   trong hệ là tỷ lệ TỪ CHỐI, và một bàn xếp hạng theo khả năng chốt sẽ
   đẩy người dùng nó đi ngược đúng chỉ số ấy — êm ái, mỗi ngày một chút.

   ═══ NĂM CÁI KHOÁ ═══

   tvbSoiVetCan()   tổng năm ngăn bằng tổng số nhà.
   tvbSoiThuTu()    ngăn xếp đúng bậc của SV_THUTU, và sàng lọc đứng
                    TRƯỚC hồ sơ.
   tvbSoiGoi()      sáu ô, mỗi ô khai lấy từ kho nào.
   tvbSoiChan()     bốn câu chặn của sàng lọc thật sự chặn được.
   tvbSoiKhongChamDiem() không hàm nào của bàn này cộng điểm cho một nhà.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;
G.VIEWS = G.VIEWS || {};

(function () {
  var U = G.U, h = U.h;
  var TANG_TU_VAN = ['T1', 'T2', 'T3'];

  function maTang(t) { var m = String(t == null ? '' : t).match(/(\d)/); return m ? 'T' + m[1] : ''; }

  /* ═══════════ NHÀ CỦA TƯ VẤN ═══════════

     Tầng nào thuộc Tư vấn đọc từ BV_VAI.tran — cùng đường bvVaiGiuTang()
     đã dùng ở cửa duyệt, không khai lại bảng tầng→vai lần thứ hai.
     Tầng 1 chưa vai nào khai trần (BV_LECH BL-0) nên thêm bằng tay ở
     hằng số trên, và chỗ ấy ghi rõ chứ không giấu. */
  G.tvbNha = function (tenTuVan) {
    var ds = (typeof G.dsNha === 'function' ? G.dsNha() : (G.FAMILIES || [])) || [];
    return ds.filter(function (n) {
      return TANG_TU_VAN.indexOf(maTang(n.tier)) >= 0;
    }).filter(function (n) {
      return !tenTuVan || n.coach === tenTuVan;
    }).map(function (n) {
      var t = maTang(n.tier);
      return {
        id: n.id, nha: n.nha, hv: n.hv, lop: n.lop, ph: n.ph, tang: t,
        ngay: n.ngay, coach: n.coach, band: n.band,
        loc: G.tvbSangLoc(n), hoSo: G.tvbHoSo(n),
        /* daGoi và nguyenVong đi theo vì tvbLoMoc() và blvViCoDo() đọc
           chúng. Bản đầu tôi bỏ quên daGoi, và mọi nhà đã gọi đủ vẫn bị
           báo lỡ mốc ba mươi — đúng lớp lỗi bỏ quên trường vai ở bản
           9.60, và cũng im lặng y như thế. */
        daGoi: n.daGoi, nguyenVong: n.nguyenVong,
        ngayNghe: n.ngayNghe, ketQua: n.ketQua
      };
    });
  };

  /* ═══════════ BẢY CÂU SÀNG LỌC ═══════════

     Bốn câu mang cờ chan trong kho. Chưa có trả lời cho một câu chặn
     thì cả buổi CHƯA ĐƯỢC mở phần chương trình — không phải "nên tránh",
     mà là khoá thật, vì đó là chỗ duy nhất hệ được phép nói không. */
  G.tvbSangLoc = function (n) {
    var ds = G.TV_SANGLOC || [];
    if (!ds.length) return { chuaDo: true, thieu: 'TV_SANGLOC' };
    var da = (n && n.loc) || {};
    var cauChan = ds.filter(function (x) { return x.chan === true; });
    var chuaTraLoi = [], dangChan = [];
    ds.forEach(function (x) {
      var v = da[x.ma];
      if (v === undefined || v === null || v === '') { chuaTraLoi.push(x.ma); return; }
      if (v === 'chan') dangChan.push({ ma: x.ma, hoi: x.hoi, neuThe: x.neuThe, vi: x.vi });
    });
    var chanChuaXong = cauChan.filter(function (x) {
      return chuaTraLoi.indexOf(x.ma) >= 0;
    }).map(function (x) { return x.ma; });

    return {
      tong: ds.length, soCauChan: cauChan.length,
      daTraLoi: ds.length - chuaTraLoi.length,
      chuaTraLoi: chuaTraLoi, chanChuaXong: chanChuaXong, dangChan: dangChan,
      /* Hai lý do khác nhau, hai câu khác nhau. Gộp lại thành "chưa mở
         được" là làm mất chỗ cần làm gì tiếp. */
      moDuocChuongTrinh: chanChuaXong.length === 0 && dangChan.length === 0,
      viKhongMo: chanChuaXong.length
        ? 'Còn ' + chanChuaXong.length + ' câu chặn chưa hỏi: ' + chanChuaXong.join(' · ')
        : (dangChan.length
          ? 'Câu ' + dangChan.map(function (x) { return x.ma; }).join(' · ') + ' đang chặn — ' +
            'đây là chỗ phải nói KHÔNG, không phải chỗ tìm cách đi vòng.'
          : undefined)
    };
  };

  /* ═══════════ CHÍN Ô HỒ SƠ ═══════════ */
  G.tvbHoSo = function (n) {
    var ds = G.TV_OHOSO || [];
    if (!ds.length) return { chuaDo: true, thieu: 'TV_OHOSO' };
    var da = (n && n.oHoSo) || [];
    var co = ds.filter(function (x) { return da.indexOf(x.o) >= 0; });
    var trong = ds.filter(function (x) { return da.indexOf(x.o) < 0; });
    /* Ô chín là ô KẾT QUẢ ĐO, điền sau cùng. Tám ô kia đủ mới được đo. */
    var taWithoutChin = ds.filter(function (x) { return x.o !== 9; });
    var duTam = taWithoutChin.filter(function (x) { return da.indexOf(x.o) >= 0; }).length >= 8;
    return {
      tong: ds.length, daCo: co.length,
      trong: trong.map(function (x) { return { o: x.o, ten: x.ten, la: x.la, neuDoan: x.neuDoan }; }),
      duTam: duTam,
      oChinDaCo: da.indexOf(9) >= 0,
      /* Điền ô chín khi tám ô kia chưa đủ là đo một nhà mình chưa nghe. */
      oChinSai: da.indexOf(9) >= 0 && !duTam
        ? 'Ô chín đã điền mà tám ô kia chưa đủ — chặng đo ra đang dựa trên một nhà chưa nghe hết.'
        : undefined
    };
  };

  /* ═══════════ CHIA NĂM NGĂN ═══════════ */
  G.tvbXep = function (tenTuVan) {
    var ngan = (G.TVB_NGAN || []).slice().sort(function (a, b) { return a.thu - b.thu; });
    if (!ngan.length) return { chuaDo: true, thieu: 'TVB_NGAN' };
    var ds = G.tvbNha(tenTuVan);
    var gom = {};
    ngan.forEach(function (x) { gom[x.ma] = []; });

    ds.forEach(function (n) {
      var khop = {
        TVB_KHAN: function () {
          var vi = (typeof G.blvViCoDo === 'function') ? G.blvViCoDo(n, tenTuVan) : [];
          var loM = G.tvbLoMoc(n);
          return (vi.length || loM) ? { viCo: vi, loMoc: loM || undefined } : null;
        },
        TVB_CHUA_LOC: function () {
          return (n.loc && !n.loc.chuaDo && !n.loc.moDuocChuongTrinh) ? { loc: n.loc } : null;
        },
        TVB_THIEU_O: function () {
          return (n.hoSo && !n.hoSo.chuaDo && !n.hoSo.duTam) ? { hoSo: n.hoSo } : null;
        },
        TVB_TREO: function () {
          var t = G.tvbTreo(n);
          return t ? { treo: t } : null;
        }
      };
      for (var i = 0; i < ngan.length; i++) {
        var x = ngan[i];
        if (x.laPhanConLai) break;
        var k = khop[x.ma] && khop[x.ma]();
        if (k) { k.nha = n; gom[x.ma].push(k); return; }
      }
      var vet = ngan.filter(function (y) { return y.laPhanConLai; })[0];
      gom[vet.ma].push({ nha: n });
    });

    return {
      tuVan: tenTuVan, tongNha: ds.length,
      ngan: ngan.map(function (x) {
        return { ma: x.ma, ten: x.ten, c: x.c, thu: x.thu, bac: x.bac, la: x.la,
          lam: x.lam, khongDuocLam: x.khongDuocLam, ds: gom[x.ma], so: gom[x.ma].length };
      }),
      tongTrongNgan: Object.keys(gom).reduce(function (s, k) { return s + gom[k].length; }, 0)
    };
  };

  /* ═══════════ LỠ MỘT MỐC GỌI ═══════════

     Mốc đọc từ TV_306090, không tự đặt. Và phải đọc thêm CUỘC GỌI ĐÃ
     THỰC HIỆN — nha.daGoi, một mảng số mốc, do người ghi.

     Bản đầu tôi viết hàm này chỉ so ngày với mốc: mốc nào đã qua ba ngày
     thì báo lỡ. Nhà ở ngày 74 lập tức lỡ cả mốc 30 lẫn mốc 60 — vĩnh
     viễn, kể cả khi đã gọi đủ. Đó đúng cái lớp lỗi vừa chữa ở bàn Coach
     bản 9.60: một điều kiện LUÔN ĐÚNG thì ngăn mang nó nuốt mọi ngăn dưới.

     Vắng daGoi nghĩa là CHƯA GỌI, và đó là kết quả đúng — không có ghi
     nhận cuộc gọi trong hệ thì trong hệ cuộc gọi ấy chưa xảy ra.

     Chỉ báo mốc SỚM NHẤT còn chưa gọi: nhắc dồn ba mốc một lúc thì
     Coach làm mốc dễ nhất trước, và mốc bị bỏ lâu nhất bị bỏ tiếp. */
  G.tvbLoMoc = function (n) {
    var ds = (G.TV_306090 || []).slice().sort(function (a, b) { return a.moc - b.moc; });
    var ngay = Number(n.ngay || 0);
    var daGoi = (n && n.daGoi) || [];
    for (var i = 0; i < ds.length; i++) {
      var moc = Number(ds[i].moc);
      if (daGoi.indexOf(moc) >= 0) continue;
      var qua = ngay - moc;
      if (qua >= 3) return { moc: moc, ten: ds[i].ten, quaNgay: qua,
        hoi: ds[i].hoi, tim: ds[i].tim,
        conLai: ds.filter(function (m) { return daGoi.indexOf(Number(m.moc)) < 0; }).length };
    }
    return null;
  };

  /* Đang treo: nghe xong, hồ sơ đủ, quá bảy ngày chưa có câu trả lời. */
  G.tvbTreo = function (n) {
    if (!(n.hoSo && n.hoSo.duTam)) return null;
    if (n.ketQua === 'chot' || n.ketQua === 'tuchoi') return null;
    var d = Number(n.ngayNghe);
    if (!isFinite(d)) return null;
    var qua = Number(n.ngay || 0) - d;
    if (qua < 7) return null;
    return {
      quaNgay: qua, tuNgay: d,
      lam: 'Nói một câu. Chốt hoặc từ chối — cả hai đều là câu trả lời.',
      cauTuChoi: (G.TV_TUCHOI || []).length,
      vi: (G.TVB_NGAN || []).filter(function (x) { return x.ma === 'TVB_TREO'; })[0]
        ? (G.TVB_NGAN.filter(function (x) { return x.ma === 'TVB_TREO'; })[0].viLaNganDatNhat) : ''
    };
  };

  /* ═══════════ GÓI TÀI LIỆU SÁU Ô ═══════════ */
  G.tvbGoi = function (nhaId, tenTuVan) {
    var n = G.tvbNha(tenTuVan).filter(function (x) { return x.id === nhaId; })[0];
    if (!n) return { chuaCoNha: true };
    var lay = {
      LOC: function () {
        var l = n.loc || {};
        if (l.chuaDo) return null;
        return 'Đã trả lời ' + l.daTraLoi + '/' + l.tong + ' câu' +
          (l.chanChuaXong.length ? ' · còn chặn: ' + l.chanChuaXong.join(' ') : ' · bốn câu chặn đã qua') +
          (l.dangChan.length ? ' · ĐANG CHẶN ở ' + l.dangChan.map(function (x) { return x.ma; }).join(' ') : '');
      },
      HOSO: function () {
        var s = n.hoSo || {};
        if (s.chuaDo) return null;
        return 'Đủ ' + s.daCo + '/' + s.tong + ' ô' +
          (s.trong.length ? ' · còn trống: ' + s.trong.map(function (x) { return 'ô ' + x.o + ' ' + x.ten; }).join(' · ') : '');
      },
      NHIP5: function () {
        var ds = G.TV_NHIP5 || [];
        return ds.length ? ds.map(function (x) { return x.nhip + '. ' + x.ten + ' (' + x.phut + "')"; }).join(' · ') : null;
      },
      TINHIEU: function () {
        var ds = G.TV_TINHIEU || [];
        return ds.length ? ds.length + ' tín hiệu — nghe được thì IM và để họ nói' : null;
      },
      TUCHOI: function () {
        var ds = G.TV_TUCHOI || [];
        return ds.length ? ds.length + ' câu từ chối nguyên văn, sẵn dùng' : null;
      },
      MOCGOI: function () {
        var ds = G.TV_306090 || [];
        var ngay = Number(n.ngay || 0);
        var toi = ds.filter(function (m) { return Number(m.moc) >= ngay; })[0];
        if (!toi) return null;
        return toi.ten + ' — còn ' + (Number(toi.moc) - ngay) + ' ngày · ' +
          (toi.hoi || []).length + ' câu hỏi · ' + (toi.tim || '');
      }
    };
    return {
      nha: n,
      o: (G.TVB_GOI || []).map(function (d) {
        var v = null;
        try { v = lay[d.ma] ? lay[d.ma]() : null; } catch (e) { v = null; }
        return { ma: d.ma, ten: d.ten, tuKho: d.tuKho, coGi: v || undefined,
          chuaCo: v ? undefined : 'Kho ' + d.tuKho + ' chưa có dữ liệu cho nhà này.',
          khongDungDe: d.khongDungDe, viQuanTrong: d.viQuanTrong };
      }),
      luat: (G.TVB_GOI_LUAT || {}).khongChamDiem || ''
    };
  };

  /* ═══════════ KHOÁ ═══════════ */
  G.tvbSoiVetCan = function (tenTuVan) {
    var x = G.tvbXep(tenTuVan);
    if (x.chuaDo) return { chuaDo: true, thieu: x.thieu, loi: [] };
    var loi = [];
    if (x.tongTrongNgan !== x.tongNha)
      loi.push('tổng năm ngăn = ' + x.tongTrongNgan + ', tổng số nhà = ' + x.tongNha);
    var thay = {};
    (x.ngan || []).forEach(function (ng) {
      ng.ds.forEach(function (m) {
        if (thay[m.nha.id]) loi.push(m.nha.nha + ' nằm ở cả ' + thay[m.nha.id] + ' và ' + ng.ma);
        thay[m.nha.id] = ng.ma;
      });
    });
    var vet = (G.TVB_NGAN || []).filter(function (n) { return n.laPhanConLai; });
    if (vet.length !== 1) loi.push('phải có ĐÚNG MỘT ngăn vét, đang có ' + vet.length);
    return { chuaDo: false, loi: loi, tongNha: x.tongNha, tongTrongNgan: x.tongTrongNgan };
  };

  G.tvbSoiThuTu = function () {
    var ngan = (G.TVB_NGAN || []).slice().sort(function (a, b) { return a.thu - b.thu; });
    var bac = (G.SV_THUTU || []), loi = [];
    if (!ngan.length) return { chuaDo: true, thieu: 'TVB_NGAN', loi: [] };
    var hang = {};
    bac.forEach(function (b) { hang[b.ma] = b.bac !== undefined ? b.bac : b.thu; });
    var truoc = 0;
    ngan.forEach(function (n) {
      if (n.laPhanConLai) return;
      if (!n.bac) { loi.push(n.ma + ' không mang bậc'); return; }
      if (bac.length && hang[n.bac] === undefined)
        loi.push(n.ma + ' mang bậc "' + n.bac + '" không có trong SV_THUTU');
      var v = hang[n.bac];
      if (v !== undefined && v < truoc) loi.push(n.ma + ' xếp sai bậc');
      if (v !== undefined) truoc = v;
    });
    /* Sàng lọc phải đứng TRƯỚC hồ sơ — luật riêng của bàn này. */
    var iLoc = ngan.map(function (n) { return n.ma; }).indexOf('TVB_CHUA_LOC');
    var iHo  = ngan.map(function (n) { return n.ma; }).indexOf('TVB_THIEU_O');
    if (iLoc >= 0 && iHo >= 0 && iLoc > iHo)
      loi.push('ngăn hồ sơ đang đứng TRƯỚC ngăn sàng lọc — đảo thứ tự là bỏ công vào một nhà ' +
        'lẽ ra không nhận');
    if (!(G.TVB_NGAN_LUAT || {}).locTruocHoSo) loi.push('chưa khai luật lọc trước hồ sơ');
    return { chuaDo: false, loi: loi, so: ngan.length };
  };

  G.tvbSoiGoi = function () {
    var ds = G.TVB_GOI || [], loi = [], thay = {};
    if (!ds.length) return { chuaDo: true, thieu: 'TVB_GOI', loi: [] };
    ds.forEach(function (o) {
      if (thay[o.ma]) loi.push(o.ma + ' trùng mã');
      thay[o.ma] = 1;
      if (!o.ten) loi.push('ô ' + o.o + ' thiếu tên');
      if (!o.tuKho) loi.push(o.ma + ' chưa khai lấy từ kho nào');
    });
    if (!(G.TVB_GOI_LUAT || {}).viSauKhongTam) loi.push('chưa khai vì sao sáu ô chứ không tám');
    return { chuaDo: false, loi: loi, so: ds.length };
  };

  /* Bốn câu chặn phải CHẶN được thật. Phép thử phá đứng ngay trong khoá:
     dựng một nhà chưa trả lời câu chặn nào rồi hỏi hàm — trả "mở được"
     là bảy câu sàng lọc chỉ còn là bảy dòng chữ. */
  G.tvbSoiChan = function () {
    var ds = G.TV_SANGLOC || [], loi = [];
    if (!ds.length) return { chuaDo: true, thieu: 'TV_SANGLOC', loi: [] };
    var chan = ds.filter(function (x) { return x.chan === true; });
    if (!chan.length) loi.push('không câu nào mang cờ chan — sàng lọc không chặn được gì');
    chan.forEach(function (x) {
      if (!x.neuThe) loi.push(x.ma + ' là câu chặn mà không nói nếu thế thì làm gì');
    });

    var trong = G.tvbSangLoc({});
    if (trong.moDuocChuongTrinh)
      loi.push('nhà chưa trả lời câu sàng lọc nào mà hàm vẫn cho mở phần chương trình');

    var du = { loc: {} };
    ds.forEach(function (x) { du.loc[x.ma] = 'qua'; });
    if (!G.tvbSangLoc(du).moDuocChuongTrinh)
      loi.push('nhà đã qua cả bảy câu mà hàm vẫn không cho mở');

    var mot = { loc: {} };
    ds.forEach(function (x) { mot.loc[x.ma] = 'qua'; });
    mot.loc[chan[0].ma] = 'chan';
    if (G.tvbSangLoc(mot).moDuocChuongTrinh)
      loi.push('một câu chặn đang bật mà hàm vẫn cho mở — câu chặn thành lời khuyên');
    return { chuaDo: false, loi: loi, soChan: chan.length };
  };

  /* Bàn này không được chấm điểm khách. Phép kiểm đọc chính mã của tệp:
     khai luật mà mã vẫn cộng điểm thì luật là lời suông. */
  G.tvbSoiKhongChamDiem = function () {
    var loi = [];
    var ma = String(G.tvbXep) + String(G.tvbNha) + String(G.tvbGoi) + String(G.tvbSangLoc);
    /* Bắt TÊN BIẾN chấm điểm, không bắt chữ "điểm" ở bất cứ đâu. Bản đầu
       tôi soi /diem|score|nong/ và nó đỏ ngay trên kho lành — vì khớp
       đúng khoá khongChamDiem, tức chính chỗ đang thi hành luật ấy. Một
       phép kiểm bắt được người canh cửa là một phép kiểm sẽ bị tắt. */
    if (/diemNha|diemChot|diemTiemNang|leadScore|scoreNha|xepHangNha|hangKhach/i.test(ma))
      loi.push('bàn Tư vấn đang có chỗ chấm điểm khách — luật khongXepHangKhach thành lời suông');
    if (!(G.TVB_LUAT || {}).khongXepHangKhach) loi.push('chưa khai luật không xếp hạng khách');
    if (!(G.TVB_LUAT || {}).tuChoiLaKetQua) loi.push('chưa khai từ chối là một kết quả');
    return { chuaDo: false, loi: loi };
  };

  /* ═══════════════════════════════════════════════════════════
     MÀN HÌNH
     ═══════════════════════════════════════════════════════════ */
  G.VIEWS['ban-tu-van'] = function () {
    if (!G.TVB_NGAN)
      return U.empty('Chưa mở được phần này',
        'Bàn làm việc của Tư vấn nằm trong gói nghề. Đăng nhập bằng tài khoản Tư vấn để nạp.');

    var toi = (G.S && G.S.acc) || {};
    var ten = toi.ten || undefined;
    var xep = G.tvbXep(ten);
    var loc = true;
    if (!xep.chuaDo && xep.tongNha === 0) { xep = G.tvbXep(); ten = undefined; loc = false; }

    var loi = G.TVB_LOI || {};
    var o = U.ph({ eyebrow: 'BÀN LÀM VIỆC · TƯ VẤN', ic: 'compass', grad: 1,
      t: 'Cửa vào của cả hệ — không nhà nào bị bỏ lửng',
      lead: loi.la || '' });

    var vc = G.tvbSoiVetCan(ten);
    var lech = [].concat(vc.loi || [], G.tvbSoiThuTu().loi || [], G.tvbSoiGoi().loi || [],
      G.tvbSoiChan().loi || [], G.tvbSoiKhongChamDiem().loi || []);

    o += '<div class="card mb" style="border-color:' + (lech.length ? '#BE0E16' : '#0B667556') + '">' +
      '<div style="display:flex;flex-wrap:wrap;gap:14px;align-items:baseline">' +
      (xep.ngan || []).map(function (n) {
        return '<div style="min-width:130px"><span class="tiny up" style="color:' + n.c + '">' +
          h(n.ten) + '</span><br><b style="font-size:1.5em;color:' + n.c + '">' + n.so + '</b></div>';
      }).join('') +
      '<div style="min-width:150px;border-left:1px solid var(--gita-vien-2);padding-left:14px">' +
      '<span class="tiny up dim">TỔNG NHÀ</span><br><b style="font-size:1.5em">' +
      xep.tongNha + '</b></div></div>' +
      '<p class="tiny mt" style="line-height:1.7;color:' + (lech.length ? '#BE0E16' : '#0B6675') + '">' +
      (lech.length ? '<b>LỆCH: ' + h(lech.join(' · ')) + '</b>'
        : 'Năm ngăn cộng lại ' + vc.tongTrongNgan + ' = ' + vc.tongNha + ' nhà.') + '</p>' +
      '<p class="tiny dim mt" style="line-height:1.7">' +
      (loc ? 'Đang xem nhà của ' + h(ten || '') + '.'
           : 'Tài khoản này chưa được giao nhà nào — đang xem toàn bộ nhà ở tầng 1 tới 3.') +
      '</p></div>';

    o += '<div class="card mb" style="border-color:#B4720F56">' +
      '<b class="sm" style="color:#B4720F">' + h(loi.khongXepHang || '') + '</b>' +
      '<p class="tiny mt" style="line-height:1.75">' + h(loi.viKhongXepHang || '') + '</p></div>';

    o += G.kaKhung ? G.kaKhung('ban-tu-van', 'dau') : '';

    (xep.ngan || []).forEach(function (ng) {
      o += U.sec(ng.ten + ' — ' + ng.so + ' nhà', ng.la);
      if (!ng.so) {
        o += '<div class="card mb"><p class="tiny dim" style="line-height:1.7">Không có nhà nào. ' +
          h(ng.lam || '') + '</p></div>';
        return;
      }
      o += '<div class="card mb" style="border-color:' + ng.c + '4d">' + ng.ds.map(function (m) {
        var n = m.nha;
        var s = '<div style="padding:10px 0;border-bottom:1px solid var(--gita-vien-2)">' +
          '<b class="sm">' + h(n.nha) + '</b> <span class="tiny dim">' + h(n.hv || '') + '</span><br>' +
          '<span class="tiny" style="color:' + ng.c + '">' + h(n.tang) + ' · ngày ' + n.ngay +
          (n.band ? ' · băng ' + h(n.band) : '') + '</span>';

        if (m.loMoc)
          s += '<div class="mt" style="padding:8px 10px;border-left:3px solid #BE0E16;background:var(--gita-nen-2)">' +
            '<b class="tiny" style="color:#BE0E16">LỠ ' + h(m.loMoc.ten) + ' — QUÁ ' +
            m.loMoc.quaNgay + ' NGÀY</b>' +
            '<p class="tiny mt" style="line-height:1.7">' + h(m.loMoc.tim || '') + '</p></div>';

        (m.viCo || []).forEach(function (d) {
          s += '<div class="mt" style="padding:8px 10px;border-left:3px solid #BE0E16;background:var(--gita-nen-2)">' +
            '<b class="tiny" style="color:#BE0E16">' + h(d.muc) + ' #' + d.so + ' · trong ' +
            h(d.hanGio) + '</b><p class="tiny mt" style="line-height:1.7">' + h(d.tinHieu) + '</p></div>';
        });

        if (m.loc)
          s += '<p class="tiny mt" style="line-height:1.7;color:#5140B4"><b>Sàng lọc ' +
            m.loc.daTraLoi + '/' + m.loc.tong + ':</b> ' + h(m.loc.viKhongMo || '') + '</p>' +
            (m.loc.dangChan || []).map(function (d) {
              return '<p class="tiny" style="line-height:1.7;color:#BE0E16">' + h(d.ma) + ' — ' +
                h(d.neuThe || '') + '</p>';
            }).join('');

        if (m.hoSo)
          s += '<p class="tiny mt" style="line-height:1.7;color:#B4720F"><b>Hồ sơ ' +
            m.hoSo.daCo + '/' + m.hoSo.tong + ' ô.</b> Còn trống: ' +
            h(m.hoSo.trong.map(function (x) { return 'ô ' + x.o + ' ' + x.ten; }).join(' · ')) + '</p>' +
            (m.hoSo.oChinSai ? '<p class="tiny" style="line-height:1.7;color:#BE0E16">' +
              h(m.hoSo.oChinSai) + '</p>' : '');

        if (m.treo)
          s += '<p class="tiny mt" style="line-height:1.7;color:#B45309"><b>Treo ' +
            m.treo.quaNgay + ' ngày kể từ buổi nghe.</b> ' + h(m.treo.lam) + '</p>' +
            '<p class="tiny" style="line-height:1.7;color:#BE0E16">' + h(m.treo.vi || '') + '</p>' +
            '<p class="tiny dim" style="line-height:1.7">Có sẵn ' + m.treo.cauTuChoi +
            ' câu từ chối nguyên văn — từ chối là một câu, không phải im lặng.</p>';

        return s + '</div>';
      }).join('') + '</div>';
    });

    /* ── Gói tài liệu sáu ô cho nhà đầu tiên có việc ── */
    var uu = (xep.ngan || []).filter(function (n) { return n.so; })[0];
    var mau = uu && uu.ds[0] ? uu.ds[0].nha : null;
    if (mau) {
      var g = G.tvbGoi(mau.id, ten);
      o += U.sec('Gói tài liệu trợ lý đóng sẵn — ' + h(mau.nha),
        (G.TVB_GOI_LUAT || {}).cot || '');
      o += '<div class="card mb">' + (g.o || []).map(function (x) {
        return '<div style="padding:9px 0;border-bottom:1px solid var(--gita-vien-2)">' +
          '<b class="sm">' + h(x.ten) + '</b> <span class="tiny dim">' + h(x.tuKho || '') + '</span>' +
          (x.coGi ? '<p class="tiny mt" style="line-height:1.75">' + h(x.coGi) + '</p>'
            : '<p class="tiny mt" style="line-height:1.7;color:#B4720F"><b>CHƯA CÓ</b> — ' +
              h(x.chuaCo) + '</p>') +
          (x.khongDungDe ? '<p class="tiny mt" style="line-height:1.7;color:#BE0E16">' +
            h(x.khongDungDe) + '</p>' : '') + '</div>';
      }).join('') + '</div>';
      o += '<p class="tiny mb" style="line-height:1.75;color:#B4720F"><b>' + h(g.luat || '') +
        '</b></p>';
    }

    o += U.sec('Luật của bàn này', '');
    var tl = G.TVB_LUAT || {};
    o += '<div class="card mb">' + Object.keys(tl).map(function (k) {
      return '<p class="tiny" style="line-height:1.75;padding:4px 0">• ' + h(tl[k]) + '</p>';
    }).join('') + '</div>';

    o += G.kaKhung ? G.kaKhung('ban-tu-van', 'cuoi') : '';
    return o;
  };
})();
