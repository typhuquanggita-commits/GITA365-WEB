/* ═══════════════════════════════════════════════════════════════
   GITA 365 — MÁY CHẠY HOA HỒNG KÈM VÀ SỔ CHỨNG CỨ

   Kho chuẩn ở kho-goc/data.hoa-hong-kem.js.

   ĐÂY LÀ TỆP DUY NHẤT TRONG src/ RA TIỀN THẬT

   Mọi tệp khác sai thì sửa. Tệp này sai thì kết thúc ở toà. Nên nó có
   ba thói quen khác hẳn phần còn lại của kho:

     · Không hàm nào trả về một con số TIỀN khi chưa có giá. Trả về tỉ
       lệ, kèm câu nói rõ nó chưa nhân được với cái gì.
     · Không bản ghi nào sửa được sau khi đối phương đã xác nhận. Sai
       thì ghi bản đính chính trỏ về bản cũ, và cả hai cùng ở lại.
     · Chỗ nào máy KHÔNG chứng minh được thì nó nói thẳng là không —
       dấu kiểm không phải chữ ký số, giờ máy khách không phải bằng
       chứng. Giấu hai chỗ ấy mới làm hồ sơ yếu đi.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;
G.VIEWS = G.VIEWS || {};

(function () {
  /* ═══════════ AI ĐĂNG KÝ NHẬN KÈM ĐƯỢC ═══════════
     Từ tầng bốn trở lên. Số tầng đọc từ HT_TANG.so, không so chuỗi. */
  G.hhDangKyDuoc = function (tangNhaKem) {
    var tu = (G.HH_KEM || {}).tuTang;
    if (!tu) return { ok: false, y: 'Kho chưa khai từ tầng nào được nhận kèm.' };
    var a = (G.HT_TANG || []).filter(function (x) { return x.ma === tangNhaKem; })[0];
    var b = (G.HT_TANG || []).filter(function (x) { return x.ma === tu; })[0];
    if (!a || !b) return { ok: false, y: 'Chưa đọc được số của tầng.' };
    if (a.so < b.so) return { ok: false, tuTang: tu,
      y: 'Nhà ở tầng ' + a.so + ' chưa đăng ký nhận kèm được. Từ tầng ' + b.so +
        ' trở lên — ' + ((G.HH_KEM || {}).viTuTangBon || '') };
    return { ok: true, tuTang: tu };
  };

  /* ═══════════ QUÀ CHO VIỆC KÈM ═══════════
     Quà KHÔNG khai ở kho hoa hồng. Nó đã khai một lần ở TIN_KEM_THUONG —
     50 điểm và một bí kíp — nên ở đây chỉ TRỎ tới, không chép lại. Chép
     lại là dựng bản thứ hai của một điều khoản, và hai bản thì sẽ có ngày
     lệch nhau đúng vào lúc có người hỏi.

     Sao của bí kíp lấy theo tầng của nhà ĐƯỢC KÈM, không theo tầng của
     nhà kèm: quà nói về việc vừa làm xong. Lấy theo tầng nhà kèm thì nhà
     tầng năm kèm một nhà tầng một cũng nhận bí kíp năm sao — thành ra quà
     nói về địa vị người nhận chứ không nói về việc đã làm.

     Quà này có ở MỌI tầng kèm, không riêng tầng một. Tầng một chỉ khác ở
     chỗ nó là thứ DUY NHẤT nhà kèm nhận được. */
  G.hhQuaKem = function (tangDuocKem) {
    var q = G.TIN_KEM_THUONG || {};
    if (!q.diem) return { chuaCoKho: true,
      thieu: 'TIN_KEM_THUONG nằm ở gói nền — máy này chưa mở được.' };
    var sao = (typeof G.bkSao === 'function') ? G.bkSao(tangDuocKem) : null;
    if (!sao) return { diem: q.diem, chuaDocDuocSao: true, tang: tangDuocKem,
      thieu: 'Chưa đọc được số sao của tầng ' + String(tangDuocKem) + '.' };
    /* Cùng cổng không-trao-vượt-tầng, không dựng luật thứ hai. Nhà kèm
       luôn ở tầng cao hơn nhà được kèm, nên cổng này gần như luôn mở —
       "gần như" không phải "luôn", nên vẫn đi qua cổng. */
    var cho = (typeof G.bkChoPhep === 'function') ? G.bkChoPhep(tangDuocKem, sao) : { ok: true };
    return { diem: q.diem, qua: q.qua, sao: sao, tang: tangDuocKem,
      traoDuoc: cho.ok === true, viKhongTrao: cho.ok === true ? undefined : cho.y,
      docTu: 'TIN_KEM_THUONG', khongVuotTang: q.quaKhongVuotTang === true };
  };

  /* ═══════════ TỈ LỆ HOA HỒNG ═══════════
     Đọc bậc từ HH_BAC, và trần từ HOAHONG.tran. Không con số nào gõ ở
     đây. Bậc nào đòi gì thì chính bậc ấy khai ra ở cột `doi`. */
  G.hhTinh = function (d) {
    d = d || {};
    var tran = (G.HOAHONG || {}).tran;
    var bac = (G.HH_BAC || []).slice().sort(function (a, b) { return b.phanTram - a.phanTram; });
    var thieu = [];
    if (d.vuotTang !== true) thieu.push('Nhà được kèm chưa hoàn thành KPI vượt tầng.');
    var kA = Number(d.kpiKem), kB = Number(d.kpiDuocKem);
    if (!(kA >= 0)) thieu.push('Chưa có KPI của nhà kèm.');
    if (thieu.length) return { phanTram: 0, bac: null, dat: false, thieu: thieu, tran: tran };

    /* ── TẦNG KÈM KHÔNG CÓ TIỀN ──
       Chốt ở HH-CC-03: kèm nhà tầng một là 0% — ĐIỀU KHOẢN, không phải
       5% nhân với giá 0. Nên chặn ở ĐÂY, TRƯỚC vòng chọn bậc: để nó rơi
       xuống vòng dưới rồi ra 0 đồng thì con số đúng mà câu chuyện sai —
       màn sẽ nói "5%, thành 0đ", và ngày giá tầng một đổi thì nó lặng lẽ
       thành 5% có tiền, trong khi chủ hệ chưa quyết gì cả.

       Vẫn phải vượt tầng mới có quà: không tiền không có nghĩa là không
       điều kiện. */
    var kt = G.HH_KHONG_TIEN || {};
    if ((kt.tang || []).indexOf(d.tangDuocKem) >= 0)
      return { phanTram: kt.phanTram, bac: null, dat: false, tran: tran, thieu: [],
        khongTien: true, laDieuKhoan: kt.laDieuKhoan === true,
        vi: kt.vi, quaDocTu: kt.quaDocTu, qua: G.hhQuaKem(d.tangDuocKem) };
    for (var i = 0; i < bac.length; i++) {
      var b = bac[i], o = b.doi || {};
      if (o.nhaDuocKemVuotTang && d.vuotTang !== true) continue;
      if (o.kpiNhaKem != null && !(kA >= o.kpiNhaKem)) continue;
      if (o.kpiNhaDuocKem != null && !(kB >= o.kpiNhaDuocKem)) continue;
      /* Trần của cả hệ vẫn chặn trên cùng, kể cả khi một bậc khai cao
         hơn. Trần mà không có hàm chặn thì sáu tháng sau nó chỉ là một
         câu chữ. */
      var pt = tran != null ? Math.min(b.phanTram, tran) : b.phanTram;
      /* Quà đi kèm ở MỌI tầng, không riêng tầng một — TIN_KEM_THUONG
         không khai điều kiện tầng nào. Tầng một chỉ khác ở chỗ quà là
         thứ duy nhất nhận được. */
      return { phanTram: pt, bac: b.ma, bacTen: b.ten, dat: true, thieu: [], tran: tran,
        chamTran: tran != null && pt >= tran, qua: G.hhQuaKem(d.tangDuocKem) };
    }
    return { phanTram: 0, bac: null, dat: false, tran: tran,
      thieu: ['KPI của nhà kèm chưa tới ngưỡng thấp nhất của bậc nào.'] };
  };

  /* SỐ TIỀN — và vì sao nó chưa ra được.
     HP_TANG ở gói NGHỀ vì nó chứa giá; máy gia đình đọc HP_NGAY, mà bản
     rút ấy không mang giá. Cả hai đường đều dẫn tới cùng một câu trả
     lời hôm nay: chưa có giá. */
  G.hhTien = function (phanTram, tangDuocKem) {
    var t = (G.HP_TANG || []).filter(function (x) { return x.tang === tangDuocKem; })[0];
    if (!t) return { chuaCoGia: true,
      thieu: 'Bảng học phí nằm ở gói nghề — máy này chưa mở được.' };
    if (t.gia == null) return { chuaCoGia: true, tang: tangDuocKem,
      thieu: 'HP_TANG.gia của tầng ' + tangDuocKem.slice(1) + ' đang để trống. Tỉ lệ ' +
        phanTram + '% đã tính được, nhưng chưa nhân được với cái gì.' };
    return { chuaCoGia: false, tang: tangDuocKem, gia: t.gia, donVi: t.donVi,
      tien: Math.round(t.gia * phanTram / 100) };
  };

  /* ═══════════ DẤU KIỂM NỘI DUNG ═══════════
     KHÔNG PHẢI CHỮ KÝ SỐ, và tên hàm cố ý không gọi là "ký". Nó bắt
     được sửa vô ý và sửa cẩu thả; nó không chặn được người cố tình dựng
     lại cả bản ghi lẫn dấu. Chữ ký thật ký ở máy chủ. */
  function chuanHoa(o) {
    return ['nhiemVu', 'ngayLam', 'loai', 'noiDung', 'nguoiGhi', 'luc']
      .map(function (k) { return k + '=' + String(o[k] == null ? '' : o[k]); }).join('');
  }
  G.ccVanTay = function (o) {
    var s = typeof o === 'string' ? o : chuanHoa(o || {});
    var a = 0x811c9dc5;
    for (var i = 0; i < s.length; i++) {
      a ^= s.charCodeAt(i);
      a = (a + ((a << 1) + (a << 4) + (a << 7) + (a << 8) + (a << 24))) >>> 0;
    }
    return ('00000000' + a.toString(16)).slice(-8);
  };

  /* ═══════════ SỔ CHỨNG CỨ ═══════════ */
  function so() { if (G.S && !G.S.ccSo) G.S.ccSo = []; return (G.S && G.S.ccSo) || []; }
  G.ccDanhSach = function () { return so().slice(); };

  G.ccThieuTruong = function (o) {
    return (G.HH_CHUNGCU || []).filter(function (c) {
      return c.buoc === true && c.cot !== 'ma' && c.cot !== 'luc' &&
        c.cot !== 'nguonGio' && c.cot !== 'vanTay' &&
        !String((o || {})[c.cot] || '').trim();
    }).map(function (c) { return c.ten; });
  };

  G.ccGhi = function (o) {
    o = o || {};
    var thieu = G.ccThieuTruong(o);
    if (thieu.length) return { ok: false, thieu: thieu,
      y: 'Chưa nộp được. Còn thiếu: ' + thieu.join(' · ') };
    if (!(G.HH_LOAI_CC || []).filter(function (x) { return x.ma === o.loai; })[0])
      return { ok: false, y: 'Loại chứng cứ không có trong bảng.' };
    var coViec = (G.BD_LON || []).some(function (b) {
      return (b.nho || []).some(function (n) { return n.ma === o.nhiemVu; });
    });
    if (!coViec) return { ok: false,
      y: 'Mã nhiệm vụ "' + o.nhiemVu + '" không có trong kho việc.' };
    var t = { ma: 'CC-' + Date.now().toString(36) + '-' + so().length,
      nhiemVu: o.nhiemVu, ngayLam: o.ngayLam, loai: o.loai,
      noiDung: String(o.noiDung).trim(), nguoiGhi: o.nguoiGhi,
      luc: Date.now(),
      /* Giờ máy khách KHÔNG phải bằng chứng — cột này nói thẳng ra chỗ
         ấy, và nó chỉ đổi được khi máy chủ đóng dấu. */
      nguonGio: 'may-khach',
      xacNhan: null, dinhChinhCho: o.dinhChinhCho || null };
    t.vanTay = G.ccVanTay(t);
    G.S.ccSo = [t].concat(so());
    if (G.save) G.save();
    return { ok: true, cc: t };
  };

  /* Nhà ĐƯỢC KÈM xác nhận. Chỗ chống làm giả mạnh nhất của cả bảng:
     một người không tự dựng được hồ sơ cho mình. */
  G.ccXacNhan = function (ma, nguoiXacNhan) {
    var t = so().filter(function (x) { return x.ma === ma; })[0];
    if (!t) return { ok: false, y: 'Không thấy bản ghi này.' };
    if (t.xacNhan) return { ok: false, y: 'Bản này đã được xác nhận rồi — không xác nhận lại.' };
    if (!String(nguoiXacNhan || '').trim())
      return { ok: false, y: 'Chưa có người xác nhận.' };
    if (String(nguoiXacNhan).trim() === String(t.nguoiGhi).trim())
      return { ok: false, y: 'Người ghi không tự xác nhận cho mình được. ' +
        ((G.HH_CC_LUAT || {}).viHaiChuKy || '') };
    t.xacNhan = { ai: String(nguoiXacNhan).trim(), luc: Date.now(), nguonGio: 'may-khach' };
    if (G.save) G.save();
    return { ok: true, cc: t };
  };

  /* Đã xác nhận thì KHOÁ. Sai thì ghi bản đính chính trỏ về bản cũ —
     xoá bản sai là xoá luôn bằng chứng rằng đã từng có bản sai. */
  G.ccSuaDuoc = function (ma) {
    var t = so().filter(function (x) { return x.ma === ma; })[0];
    return !!t && !t.xacNhan;
  };
  G.ccDinhChinh = function (ma, o) {
    var t = so().filter(function (x) { return x.ma === ma; })[0];
    if (!t) return { ok: false, y: 'Không thấy bản ghi này.' };
    var moi = {}, k;
    for (k in (o || {})) if (Object.prototype.hasOwnProperty.call(o, k)) moi[k] = o[k];
    moi.dinhChinhCho = ma;
    return G.ccGhi(moi);
  };

  /* ═══════════ BIÊN NHẬN CỦA MÁY CHỦ ═══════════
     Máy chủ ký nội dung bằng khoá nó giữ (server/GITA_ChungCu.gs) và
     trả về biên nhận: mã, giờ máy chủ, chữ ký. Nhận biên nhận thì cột
     nguonGio đổi từ 'may-khach' sang 'may-chu' — và đó là lúc bản ghi
     ấy mới thật sự đứng được khi đối chất.

     Máy khách KHÔNG giữ khoá và KHÔNG kiểm được chữ ký. Nó chỉ giữ biên
     nhận để đối chiếu; việc kiểm là của máy chủ, qua fn 'soiChungCu'.
     Tự kiểm được ở đây nghĩa là khoá đã nằm ở máy khách, và lúc ấy chữ
     ký không còn giá trị gì. */
  G.ccNhanBienNhan = function (ma, bn) {
    var t = so().filter(function (x) { return x.ma === ma; })[0];
    if (!t) return { ok: false, y: 'Không thấy bản ghi này.' };
    if (!bn || !bn.chuKy || !bn.gioMayChu)
      return { ok: false, y: 'Biên nhận thiếu chữ ký hoặc giờ máy chủ.' };
    t.bienNhan = { ma: bn.ma || ma, gioMayChu: bn.gioMayChu, chuKy: bn.chuKy };
    t.nguonGio = 'may-chu';
    if (G.save) G.save();
    return { ok: true, cc: t };
  };

  /* Soi cả sổ: dấu kiểm còn khớp không, bản nào chưa đối chứng. */
  G.ccSoi = function () {
    var lech = [], chuaXac = [], dinhChinh = [];
    so().forEach(function (t) {
      if (G.ccVanTay(t) !== t.vanTay) lech.push(t.ma);
      if (!t.xacNhan) chuaXac.push(t.ma);
      if (t.dinhChinhCho) dinhChinh.push({ ma: t.ma, cho: t.dinhChinhCho });
    });
    return { tong: so().length, lech: lech, chuaXacNhan: chuaXac, dinhChinh: dinhChinh,
      gioMayChu: so().filter(function (t) { return t.nguonGio === 'may-chu'; }).length };
  };

  /* ═══════════ HỒ SƠ MỘT LẦN ĐÒI HOA HỒNG ═══════════
     Chỉ chứng cứ ĐÃ ĐỐI CHỨNG mới được tính. Bản chưa xác nhận vẫn nằm
     trong sổ, nhưng đứng ngoài hồ sơ. */
  G.hhHoSo = function (d) {
    d = d || {};
    var tinh = G.hhTinh(d);
    var s = G.ccSoi();
    var duoc = so().filter(function (t) { return !!t.xacNhan; });
    var canh = [];
    if (s.lech.length) canh.push('Có ' + s.lech.length + ' bản ghi dấu kiểm KHÔNG KHỚP — ' +
      'nội dung đã bị sửa sau khi ghi.');
    /* CẢNH BÁO PHẢI ĐÚNG VỚI TÌNH TRẠNG THẬT, KHÔNG NÓI CHUNG CHUNG.
       Bản đầu tôi đẩy câu "dấu kiểm không phải chữ ký số" ra mọi lúc.
       Nhưng khi máy chủ đã ký thì câu ấy đọc thành "hồ sơ này không có
       chữ ký" — sai theo hướng NGƯỢC LẠI, và một câu tự chê sai chỗ
       cũng làm hồ sơ yếu đi y như một câu tự khen sai chỗ.
       Nên nó đếm: bao nhiêu bản đã có biên nhận máy chủ, bao nhiêu chưa. */
    var chuaKy = so().length - s.gioMayChu;
    if (chuaKy > 0) {
      canh.push(chuaKy + '/' + so().length + ' bản ghi CHƯA có chữ ký và dấu giờ của máy ' +
        'chủ. ' + ((G.HH_CC_LUAT || {}).viGioMayKhach || ''));
      canh.push((G.HH_CC_LUAT || {}).viVanTay || '');
    }
    /* Tầng không có tiền thì KHÔNG gọi hhTien: gọi rồi thì hồ sơ in ra
       "0 đồng" cạnh một bảng giá, và người đọc hiểu là phép nhân ra 0.
       Đây là 0% khai thẳng, nên chỗ ấy để trống và câu điều khoản đứng
       thay — trống là đúng, một con số 0 mới là nói sai. */
    return { tinh: tinh, tien: (tinh.dat && !tinh.khongTien) ? G.hhTien(tinh.phanTram, d.tangDuocKem) : null,
      khongTien: tinh.khongTien === true, qua: tinh.qua || null,
      soChungCu: so().length, daDoiChung: duoc.length,
      chuaDoiChung: s.chuaXacNhan.length, lech: s.lech,
      daKyMayChu: s.gioMayChu, chuaKyMayChu: so().length - s.gioMayChu,
      nopDuoc: tinh.dat && duoc.length > 0 && s.lech.length === 0,
      canh: canh.filter(Boolean) };
  };
})();
