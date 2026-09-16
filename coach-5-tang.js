/* ═══════════════════════════════════════════════════════════════
   GITA 365 — MÁY CHẠY HỆ THỐNG COACH NĂM TẦNG

   Kho chuẩn ở kho-goc/data.coach-5-tang.js.

   ═══ VÌ SAO TỆP NÀY Ở GÓI NỀN ═══

   Năm tầng Coach là cái thước nhà mình được cầm. Nhưng phần lớn kho nó
   trỏ vào — DD_CAP, HP_TANG, DT_*, TD_MUC — nằm ở gói NGHỀ. Nên mọi
   phép soi ở đây phải BIẾT PHÂN BIỆT hai thứ:

     · kho vắng vì dữ liệu hỏng     → đỏ
     · kho vắng vì máy này không có quyền → chưa đo được, kèm tên kho

   Bản 9.21 tôi đã mắc đúng chỗ này: htSoiCong() đỏ trên máy gia đình vì
   nó đòi HP_TANG, mà HP_TANG là gói nghề. Một phép kiểm báo thiếu ở chỗ
   dữ liệu CỐ Ý vắng mặt là phép kiểm dạy người ta coi một lớp bảo vệ là
   một lỗi — và sau vài lần thì người ta tắt nó đi.

   ═══ BỐN CÁI KHOÁ ═══

   csSoiNoi()          năm tầng Coach khớp một-một với năm tầng. Không
                       tầng nào hai mặt, không mặt nào không tầng.
   csSoiKhongChepLai() cột của CS_TANG không được chép nguyên văn
                       thuThach hay doiGiKhiXong của HT_TANG. Đây là
                       chỗ HT_LUAT điều 3 thành hàm.
   csSoiTenTrung()     không bước vận hành nào trùng tên một bánh đà.
   csSoiCapKhongTrung() không dòng nào mang mã của một hạng DD_CAP —
                       năm mức trưởng thành không được biến thành
                       bảng xếp hạng thứ hai của nghề.

   ═══ MỘT CÁI MỞ ═══

   csQuyMo(n) chia con số đích cho trần, tại chỗ, từ DD_CAP. Không ghi
   sẵn kết quả vào kho: trần đổi thì con số ghi sẵn không đổi theo, và
   nửa năm sau không ai biết bản nào đúng.

   Và nó trả về thứ bảng gốc không nói: nút thắt không phải người, là
   NĂM. Đồng Hành cần ba năm trong hệ; Cố Vấn cần thêm mười tám tháng
   làm Đồng Hành. Cố Vấn đầu tiên sớm nhất là tháng năm mươi tư. Con số
   ấy đọc ra từ chính cột dieuKien của DD_CAP, không phải tôi ước.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;
G.VIEWS = G.VIEWS || {};

(function () {
  var U = G.U, h = U.h;
  var MA_TANG = ['T1', 'T2', 'T3', 'T4', 'T5'];

  /* Kho nào trỏ tới mà máy này không có thì KHÔNG phải lỗi — là quyền.
     Trả về true khi kho có mặt thật. */
  function coKho(ten) { return G[ten] !== undefined && G[ten] !== null; }

  /* ═══════════ KHOÁ 1: KHỚP MỘT-MỘT VỚI NĂM TẦNG ═══════════ */
  G.csSoiNoi = function () {
    var ds = G.CS_TANG || [], loi = [], thay = {};
    if (ds.length !== MA_TANG.length)
      loi.push('số tầng Coach=' + ds.length + ', số tầng=' + MA_TANG.length);
    ds.forEach(function (t) {
      if (!t.tang || MA_TANG.indexOf(t.tang) < 0) { loi.push(t.ma + '→' + (t.tang || 'trống')); return; }
      if (thay[t.tang]) loi.push(t.tang + ':hai tầng Coach cùng một tầng');
      thay[t.tang] = t.ma;
      if (t.so !== Number(t.tang.slice(1))) loi.push(t.ma + ':số thứ tự lệch tầng');
      if (!t.suMenh || !t.ketQua || !t.mucDo || !t.saiHayGap) loi.push(t.ma + ':thiếu cột');
      /* Đúng bốn năng lực. Bốn thì nhớ được khi đang ngồi trước một
         gia đình; sáu thì phải mở sổ, mà mở sổ giữa phiên là đã hỏng. */
      if (!Array.isArray(t.nangLuc) || t.nangLuc.length !== 4)
        loi.push(t.ma + ':' + ((t.nangLuc || []).length) + ' năng lực, phải đúng 4');
    });
    MA_TANG.forEach(function (m) { if (!thay[m]) loi.push(m + ':không mặt Coach nào phủ'); });
    if ((G.CS_LOI || {}).khongPhaiThang !== true) loi.push('chưa khai không phải thang thứ sáu');
    /* Mức trưởng thành phải tăng đều 1..5 và không trùng tên nhau.
       Một thang có hai bậc cùng tên là thang đứng yên ở giữa. */
    var ten = {};
    ds.forEach(function (t, i) {
      if (t.mucDoSo !== i + 1) loi.push(t.ma + ':mức trưởng thành=' + t.mucDoSo + ', phải=' + (i + 1));
      if (ten[t.mucDo]) loi.push('mức "' + t.mucDo + '" dùng hai lần');
      ten[t.mucDo] = 1;
    });
    return loi;
  };

  /* ═══════════ KHOÁ 2: KHÔNG DỰNG BẢN THỨ HAI CỦA MỘT LUẬT ═══════════
     HT_LUAT điều 3 cấm ghi điều kiện xong của tầng ở chỗ thứ hai. Ở đây
     nó thành hàm: CS_TANG nói việc của NGƯỜI KÈM, HT_TANG nói việc của
     NHÀ. Chép nguyên văn sang là biến mặt thứ ba thành bản sao thứ hai,
     và hai bản thì sẽ có ngày lệch nhau lặng lẽ. */
  G.csSoiKhongChepLai = function () {
    if (!coKho('HT_TANG')) return { chuaDo: true, thieu: 'HT_TANG' };
    var loi = [];
    function gon(s) { return String(s || '').replace(/\s+/g, ' ').trim().toLowerCase(); }
    (G.CS_TANG || []).forEach(function (t) {
      var g = (G.HT_TANG || []).filter(function (x) { return x.ma === t.tang; })[0];
      if (!g) { loi.push(t.ma + ':không thấy tầng ' + t.tang + ' ở HT_TANG'); return; }
      ['suMenh', 'ketQua'].forEach(function (c) {
        if (gon(t[c]) && (gon(t[c]) === gon(g.thuThach) || gon(t[c]) === gon(g.doiGiKhiXong)))
          loi.push(t.ma + '.' + c + ':chép lại nguyên văn từ HT_TANG');
      });
    });
    return { chuaDo: false, loi: loi };
  };

  /* ═══════════ KHOÁ 3: CHỖ TRÙNG TÊN ═══════════
     Bản gốc gọi vòng vận hành là "10 bánh đà", mà G.BD_LON đã là mười
     bánh đà với nội dung khác hẳn. Trùng tên trùng số lượng là chỗ sáu
     tháng sau có người trỏ nhầm mà bộ kiểm vẫn xanh. */
  G.csSoiTenTrung = function () {
    /* Vòng vận hành ở gói NGHỀ. Máy gia đình không có nó, và đó là
       quyền — hỏi "sao chưa khai" ở đây là đỏ oan, và một phép kiểm đỏ
       oan vài lần là một phép kiểm bị tắt. */
    if (!coKho('CS_VONG') || !coKho('CS_VONG_LUAT'))
      return { chuaDo: true, thieu: 'CS_VONG', loi: [] };
    var loi = [];
    if ((G.CS_VONG_LUAT || {}).khongPhaiBanhDa === undefined)
      loi.push('CS_VONG_LUAT chưa khai vì sao không gọi là bánh đà');
    if (!coKho('BD_LON')) return { chuaDo: true, thieu: 'BD_LON', loi: loi };
    var bd = {};
    (G.BD_LON || []).forEach(function (b) { bd[String(b.ten || '').trim().toLowerCase()] = b.ma; });
    (G.CS_VONG || []).forEach(function (v) {
      var k = String(v.ten || '').trim().toLowerCase();
      if (bd[k]) loi.push(v.ma + ':trùng tên với bánh đà ' + bd[k]);
    });
    return { chuaDo: false, loi: loi };
  };

  /* ═══════════ KHOÁ 4: KHÔNG DỰNG BẢNG HẠNG THỨ HAI ═══════════
     Hạng của người kèm có đúng ba, ở DD_CAP. Năm mức trưởng thành là
     mức của NHÀ ở bậc ấy. Hai bảng xếp hạng cho một nghề là hai bảng sẽ
     lệch, và lúc lệch thì người bị chấm chọn bảng nào lợi hơn. */
  G.csSoiCapKhongTrung = function () {
    var loi = [];
    if ((G.CS_TANG_LUAT || {}).mucDoKhongPhaiHang === undefined)
      loi.push('chưa khai mức trưởng thành không phải hạng người kèm');
    if (!coKho('DD_CAP')) return { chuaDo: true, thieu: 'DD_CAP', loi: loi };
    var ma = {}, ten = {};
    (G.DD_CAP || []).forEach(function (c) {
      ma[c.ma] = c.ten; ten[String(c.ten).trim().toLowerCase()] = c.ma;
    });
    (G.CS_TANG || []).forEach(function (t) {
      if (ma[t.ma]) loi.push(t.ma + ':mã trùng một hạng của DD_CAP');
      if (ten[String(t.mucDo).trim().toLowerCase()])
        loi.push(t.ma + ':mức "' + t.mucDo + '" trùng tên một hạng DD_CAP');
    });
    return { chuaDo: false, loi: loi };
  };

  /* ═══════════ MỖI NĂNG LỰC PHẢI ĐO ĐƯỢC BẰNG MỘT KHO CÓ THẬT ═══════
     Năng lực không đo được là một tính từ, và bảng toàn tính từ thì ai
     cũng đạt. Nhưng nhiều kho đo ở gói NGHỀ — máy gia đình không có,
     và đó là quyền chứ không phải lỗi. Trả về hai danh sách riêng. */
  G.csSoiDoDuoc = function () {
    var loi = [], thieu = {};
    (G.CS_TANG || []).forEach(function (t) {
      (t.nangLuc || []).forEach(function (n) {
        if (!n.t || !n.do) { loi.push(t.ma + ':năng lực thiếu cột'); return; }
        if (!n.theoKho) { loi.push(t.ma + ':"' + n.t + '" không trỏ vào kho nào'); return; }
        if (!coKho(n.theoKho)) thieu[n.theoKho] = 1;
      });
    });
    return { loi: loi, khoThieu: Object.keys(thieu) };
  };

  /* ═══════════ VÒNG VẬN HÀNH ═══════════
     Mười bước, và bước mười quay về bước một. Vòng không có cầu quay
     về là một danh sách được vẽ cong. */
  G.csSoiVong = function () {
    if (!coKho('CS_VONG')) return { chuaDo: true, thieu: 'CS_VONG', loi: [], khoThieu: [] };
    var ds = G.CS_VONG || [], loi = [], thieu = {}, thay = {};
    if (ds.length !== 10) loi.push('số bước=' + ds.length + ', phải 10');
    ds.forEach(function (v, i) {
      if (v.so !== i + 1) loi.push(v.ma + ':số thứ tự lệch');
      if (thay[v.ma]) loi.push(v.ma + ':mã dùng hai lần');
      thay[v.ma] = 1;
      if (!v.lam || !v.vi) loi.push(v.ma + ':thiếu cột');
      if (!v.theoKho) { loi.push(v.ma + ':không trỏ vào kho nào'); return; }
      if (!coKho(v.theoKho)) thieu[v.theoKho] = 1;
    });
    /* Cầu quay về. Đúng MỘT bước được đóng vòng, và nó phải trỏ về
       bước đầu — hai chỗ đóng vòng thì đó là hai vòng chồng nhau. */
    var dong = ds.filter(function (v) { return v.dongVong === true; });
    if (dong.length !== 1) loi.push('số bước đóng vòng=' + dong.length + ', phải 1');
    else if (dong[0].veBuoc !== (ds[0] || {}).ma)
      loi.push(dong[0].ma + ':quay về ' + dong[0].veBuoc + ', phải về ' + (ds[0] || {}).ma);
    if ((G.CS_VONG_LUAT || {}).laVong !== true) loi.push('CS_VONG_LUAT chưa khai đây là vòng');
    return { chuaDo: false, loi: loi, khoThieu: Object.keys(thieu) };
  };

  /* ═══════════ BẢY NĂNG LỰC DỮ LIỆU: BỐN CÓ, BA CHƯA ═══════════
     Ô nào khai CÓ thì phải trỏ vào kho có thật; ô nào khai CHƯA thì
     phải nói thiếu cái gì. "Đang phát triển" không phải một trạng thái —
     nó là cách viết chữ KHÔNG cho đỡ khó nhìn. */
  G.csSoiDuLieu = function () {
    if (!coKho('CS_DULIEU'))
      return { chuaDo: true, thieu: 'CS_DULIEU', loi: [], khoThieu: [], dem: { co: 0, chua: 0 } };
    var ds = G.CS_DULIEU || [], loi = [], thieu = {}, dem = { co: 0, chua: 0 };
    ds.forEach(function (d) {
      if (typeof d.co !== 'boolean') { loi.push(d.ma + ':cột co không phải đúng/sai'); return; }
      if (!d.dungDe) loi.push(d.ma + ':không nói dùng để làm gì');
      if (d.co) {
        dem.co++;
        if (!d.theoKho) { loi.push(d.ma + ':khai CÓ mà không trỏ kho'); return; }
        if (!coKho(d.theoKho)) thieu[d.theoKho] = 1;
        if (d.thieu) loi.push(d.ma + ':khai CÓ mà vẫn ghi thiếu');
      } else {
        dem.chua++;
        if (!d.thieu) loi.push(d.ma + ':khai CHƯA mà không nói thiếu cái gì');
        if (d.theoKho) loi.push(d.ma + ':khai CHƯA mà vẫn trỏ kho');
      }
    });
    return { chuaDo: false, loi: loi, khoThieu: Object.keys(thieu), dem: dem };
  };

  /* ═══════════ NĂM TRỤ NỀN ═══════════ */
  G.csSoiNen = function () {
    var loi = [], thieu = {};
    var ds = G.CS_NEN || [];
    if (ds.length !== 5) loi.push('số trụ=' + ds.length + ', phải 5');
    ds.forEach(function (n) {
      if (!n.la || !n.vi) loi.push(n.ma + ':thiếu cột');
      if (!n.theoLuat) { loi.push(n.ma + ':không trỏ vào luật nào'); return; }
      if (!coKho(n.theoLuat)) thieu[n.theoLuat] = 1;
    });
    return { loi: loi, khoThieu: Object.keys(thieu) };
  };

  /* ═══════════ CHIA CON SỐ ĐÍCH CHO TRẦN ═══════════
     Tính TẠI CHỖ từ DD_CAP. Ghi sẵn kết quả vào kho là dựng bản thứ hai
     của một phép chia: trần đổi thì bản ghi sẵn không đổi theo.

     Trả thêm nút thắt NĂM, vì đó là câu trả lời thật cho "cần bao nhiêu
     để có một nghìn": không phải tiền, là năm. Và năm thì không mua
     được bằng cách tuyển nhanh hơn. */
  G.csQuyMo = function (n) {
    var dich = Number(n) || (G.CS_QUYMO || {}).dich || 0;
    if (!coKho('DD_CAP') || typeof G.ddTranCua !== 'function') {
      /* Trường không áp dụng thì BỎ HẲN khoá. Trả `dich: 0` ở đây là
         trả một con số bịa — và con số không có nguồn nguy hiểm hơn ô
         trống, vì ô trống thì người đọc biết là chưa có. */
      var r = { chuaDo: true, thieu: 'DD_CAP',
        y: 'Bảng cấp người kèm nằm ở gói nghề. Máy này không chia được.' };
      if (dich) r.dich = dich;
      return r;
    }
    var tDH = G.ddTranCua('DH'), tCV = G.ddTranCua('CV'), tCM = G.ddTranCua('CM');
    var dh = tDH ? Math.ceil(dich / tDH) : 0;
    var cv = tCV ? Math.ceil(dh / tCV) : 0;
    var cm = tCM ? Math.ceil(dich / tCM) : 0;
    function cap(ma) { return (G.DD_CAP || []).filter(function (c) { return c.ma === ma; })[0] || {}; }
    var gio = dh * (cap('DH').gioDaoTao || 0) + cv * (cap('CV').gioDaoTao || 0);
    var phutTuan = dh * tDH * (cap('DH').phutTuan || 0);
    return {
      chuaDo: false, dich: dich,
      tran: { DH: tDH, CV: tCV, CM: tCM },
      canDH: dh, canCV: cv, canCM: cm,
      gioDaoTao: gio,
      phutMoiTuan: phutTuan,
      gioMoiTuan: Math.round(phutTuan / 60),
      /* Ba năm sống trong hệ trước khi kèm ai, rồi mười tám tháng làm
         Đồng Hành trước khi lên Cố Vấn. Hai câu ấy nằm ở cột dieuKien
         của DD_CAP; ở đây chỉ cộng lại. */
      thangSomNhatCoCV: 36 + 18,
      nutThat: (G.CS_QUYMO || {}).nutThatLaNam || '',
      luatChan: (G.CS_QUYMO || {}).luatChan || '',
      y: 'Cần ' + dh + ' Đồng Hành và ' + cv + ' Cố Vấn. Nút thắt không phải người — ' +
         'Cố Vấn đầu tiên sớm nhất là tháng thứ ' + (36 + 18) + '.'
    };
  };

  G.csTangCua = function (tang) {
    return (G.CS_TANG || []).filter(function (t) { return t.tang === tang; })[0] || null;
  };

  /* Bọc htDuongDayDu() của bản trước, thêm mặt thứ ba: ở bậc này người
     đi cùng phải làm được gì. Bọc thì một nguồn; dựng hàm thứ hai trả
     lời cùng câu hỏi thì hai nguồn, và hai nguồn sẽ lệch. */
  G.htDuongBaMat = function (soToi, dau) {
    var goc = typeof G.htDuongDayDu === 'function' ? G.htDuongDayDu
            : typeof G.htDuong === 'function' ? G.htDuong : null;
    if (!goc) return null;
    var d = goc(soToi, dau);
    if (!d || d.chuaDo) return d;
    var t = G.csTangCua(d.tang);
    d.nguoiKem = t ? { ma: t.ma, ten: t.ten, suMenh: t.suMenh, mucDo: t.mucDo,
      nangLuc: (t.nangLuc || []).map(function (n) { return n.t; }),
      ketQua: t.ketQua, saiHayGap: t.saiHayGap } : null;
    return d;
  };

  G.csChoChu = function () { return (G.CS_CHOCHU || []).slice(); };

  /* ═══════════════════════════════════════════════════════════
     MÀN HÌNH
     ═══════════════════════════════════════════════════════════ */
  G.VIEWS['coach-5-tang'] = function () {
    if (!G.CS_TANG)
      return U.empty('Chưa mở được phần này', 'Phần này nằm trong gói nền. Đăng nhập lại để nạp.');

    var loi = G.CS_LOI || {};
    var o = U.ph({ eyebrow: 'HỆ THỐNG COACH · NĂM TẦNG', ic: 'users', grad: 1,
      t: 'Ở bậc nhà mình đang đứng, người đi cùng phải làm được gì',
      lead: 'Cùng một cái thang, mặt thứ ba. Bảng này là cái thước nhà mình được cầm — ' +
        'đọc xong thì hỏi thẳng được người đi cùng: bốn việc này anh chị làm được chưa.' });

    o += '<div class="card mb" style="border-color:#0B667556">' +
      '<p style="line-height:1.9"><b>' + h(loi.la || '') + '</b></p>' +
      '<p class="sm mt" style="line-height:1.8">' + h(loi.baMat || '') + '</p>' +
      '<p class="sm mt" style="line-height:1.8">' + h(loi.quyenCuaNha || '') + '</p>' +
      '<p class="tiny dim mt" style="line-height:1.7">' + h(loi.vi || '') + '</p>' +
      '<p class="tiny mt" style="line-height:1.7;color:#B4720F"><b>' + h(loi.hauQuaNeuGiau || '') + '</b></p></div>';

    o += G.kaKhung ? G.kaKhung('coach-5-tang', 'dau') : '';

    /* Thang dựng từ CHÍNH CS_TANG — màu lấy từ cột c của từng bậc. Sửa
       kho thì hình đổi theo trong cùng một lần, nên nó không lệch được
       với năm thẻ ngay bên dưới. */
    if (G.veThangBac) o += G.hinhCard(
      G.veThangBac((G.CS_TANG || []).map(function (t) {
        return { ten: t.ten, phu: t.mucDo, c: t.c };
      }), { nhan: 'Năm tầng Coach' }),
      'Năm bậc · đọc từ dưới lên',
      'Bậc dưới rộng hơn bậc trên vì việc ở dưới nhiều người làm được hơn. ' +
      'Không bậc nào nhảy cóc được: cột bên trái nối liền từ bậc một lên bậc năm.');

    /* ── Năm tầng ── */
    var sn = G.csSoiNoi();
    var cl = G.csSoiKhongChepLai();
    if (!cl.chuaDo && cl.loi.length) sn = sn.concat(cl.loi);
    var dd = G.csSoiDoDuoc();
    if (dd.loi.length) sn = sn.concat(dd.loi);

    o += U.sec('Năm tầng của người đi cùng' + (sn.length ? ' — LỆCH: ' + (sn.join(' ')) : ''),
      ((G.CS_TANG_LUAT || {}).cot || ''));

    o += (G.CS_TANG || []).map(function (t) {
      return '<div class="card mb" style="border-color:' + t.c + '5e">' +
        '<span class="tiny up" style="color:' + t.c + '">TẦNG ' + h(String(t.so)) + ' · ' +
        h(t.ten) + ' · ' + h(t.mucDo) + '</span>' +
        '<p class="mt" style="line-height:1.9"><b>' + h(t.suMenh) + '</b></p>' +
        '<p class="tiny dim mt">BỐN NĂNG LỰC TRỌNG TÂM</p>' +
        '<div class="mt">' + (t.nangLuc || []).map(function (n, i) {
          var thieu = n.theoKho && G[n.theoKho] === undefined;
          return '<div style="padding:7px 0;border-bottom:1px solid var(--gita-vien-2)">' +
            '<b class="sm">' + (i + 1) + '. ' + h(n.t) + '</b>' +
            '<p class="tiny dim mt" style="line-height:1.7">Đo bằng: ' + h(n.do) +
            (thieu ? ' <span style="color:#B4720F">· thước ở gói nghề</span>' : '') +
            '</p></div>';
        }).join('') + '</div>' +
        '<p class="sm mt" style="line-height:1.8;color:' + t.c + '"><b>Kết quả:</b> ' + h(t.ketQua) + '</p>' +
        '<p class="tiny mt" style="line-height:1.7"><b>Sai hay gặp:</b> ' + h(t.saiHayGap) + '</p></div>';
    }).join('');

    if (dd.khoThieu.length)
      o += '<p class="tiny dim mb" style="line-height:1.7">Chưa đo được trên máy này (thước nằm ở gói nghề): ' +
        h(dd.khoThieu.join(' · ')) + '</p>';

    o += '<p class="tiny dim mb" style="line-height:1.7"><b>' +
      h((G.CS_TANG_LUAT || {}).mucDoKhongPhaiHang || '') + '</b> ' +
      h((G.CS_TANG_LUAT || {}).viSaoKhongLamHangThuHai || '') + '</p>';

    /* ── Vòng vận hành: chỉ hiện khi có gói nghề ── */
    if (G.CS_VONG) {
      var sv = G.csSoiVong(), st = G.csSoiTenTrung();
      var lv = (sv.chuaDo ? [] : sv.loi).concat(st.chuaDo ? [] : st.loi);
      o += U.sec('Vòng vận hành mười bước' + (lv.length ? ' — LỆCH: ' + (lv.join(' ')) : ''),
        ((G.CS_VONG_LUAT || {}).khongPhaiBanhDa || ''));
      o += '<div class="card mb">' + (G.CS_VONG || []).map(function (v) {
        var thieu = v.theoKho && G[v.theoKho] === undefined;
        return '<div style="padding:9px 0;border-bottom:1px solid var(--gita-vien-2)">' +
          '<b class="sm">' + h(v.ma) + ' · ' + h(v.ten) + '</b> ' +
          '<span class="tiny" style="color:' + (thieu ? '#B4720F' : '#0B7350') + '">' +
          h(v.theoKho) + (thieu ? ' (gói nghề)' : '') + '</span>' +
          '<p class="sm mt" style="line-height:1.8">' + h(v.lam) + '</p>' +
          '<p class="tiny dim mt" style="line-height:1.7">' + h(v.vi) + '</p>' +
          (v.dongVong ? '<p class="tiny mt" style="line-height:1.7;color:#0B6675"><b>↻ Vòng khép lại ở đây — quay về ' +
            h(v.veBuoc) + '.</b></p>' : '') + '</div>';
      }).join('') + '</div>';
      /* Vẽ thành VÒNG chứ không thành hàng, vì đó chính là điều đang
         phải chứng minh. Xếp hàng ngang thì mắt đọc nó là một cái
         thang, dù chữ bên cạnh có nói gì đi nữa. */
      if (G.veVongTron) o += G.hinhCard(
        G.veVongTron((G.CS_VONG || []).map(function (v) {
          return { ten: v.ten, nhan: String(v.so), dongVong: v.dongVong === true,
            c: v.dongVong ? '#BE0E16' : '#0B6675' };
        }), { nhan: 'Vòng vận hành', giua: 'MƯỜI BƯỚC', giuaPhu: 'bước 10 → bước 01' }),
        'Vòng vận hành · không phải cái thang',
        'Vòng vẽ nét đứt vì nó không khép kín bằng thủ tục — nó khép bằng một người: ' +
        'nhà xong tầng năm thành người kèm nhà mới. Bước 10 vẽ đậm là chỗ ấy.');

      o += '<p class="tiny dim mb" style="line-height:1.7"><b>' +
        h((G.CS_VONG_LUAT || {}).buocNamLaViecThat || '') + '</b></p>';

      o += G.kaKhung ? G.kaKhung('coach-5-tang', 'sau-vong') : '';
    }

    /* ── Bảy năng lực dữ liệu ── */
    if (G.CS_DULIEU) {
      var sd = G.csSoiDuLieu();
      o += U.sec('Bảy năng lực dữ liệu — ' + sd.dem.co + ' có, ' + sd.dem.chua + ' chưa' +
        (sd.loi.length ? ' — LỆCH: ' + (sd.loi.join(' ')) : ''),
        ((G.CS_DULIEU_LUAT || {}).vi || ''));

      /* Bốn đặc ba rỗng, đếm từ chính CS_DULIEU. Tô xanh hết một bảng
         là cách nhanh nhất làm nó vô dụng, nên hình phải để lộ ba chỗ
         rỗng ngay từ cái nhìn đầu tiên. */
      if (G.veCham) o += G.hinhCard(
        G.veCham((G.CS_DULIEU || []).map(function (d) {
          return { ten: d.ten, co: d.co === true, phu: d.co ? d.theoKho : 'chưa có' };
        }), { nhan: 'Bảy năng lực dữ liệu' }),
        'Bốn có · ba chưa',
        'Ba chấm rỗng là ba việc đáng làm tiếp, không phải ba chỗ hỏng. ' +
        'Bảng tô xanh hết là bảng không quyết định được gì.');
      o += '<div class="card mb">' + (G.CS_DULIEU || []).map(function (d) {
        return '<div style="padding:9px 0;border-bottom:1px solid var(--gita-vien-2)">' +
          '<b class="sm" style="color:' + (d.co ? '#0B7350' : '#B4720F') + '">' +
          (d.co ? '✓ ' : '○ ') + h(d.ten) + '</b>' +
          '<p class="tiny dim mt" style="line-height:1.7">' + h(d.dungDe) + '</p>' +
          (d.co ? '<p class="tiny mt" style="color:#0B7350">Chạy trên kho ' + h(d.theoKho) + '</p>'
                : '<p class="tiny mt" style="line-height:1.7;color:#B4720F"><b>Thiếu:</b> ' + h(d.thieu) + '</p>' +
                  '<p class="tiny dim mt" style="line-height:1.7">' + h(d.viSaoChuaLam || '') + '</p>') +
          '</div>';
      }).join('') + '</div>';
    }

    /* ── Phép chia cho con số đích ── */
    if (G.CS_QUYMO) {
      var q = G.csQuyMo();
      o += U.sec('Một nghìn lãnh đạo — chia cho trần thì ra bao nhiêu', (G.CS_QUYMO.dichLa || ''));
      if (q.chuaDo) {
        o += '<div class="card mb"><p class="sm" style="line-height:1.8">' + h(q.y) + '</p></div>';
      } else {
        o += '<div class="card mb" style="border-color:#185AB456">' +
          '<p style="line-height:1.9"><b>' + q.dich + ' gia đình xong tầng năm</b> · trần ' +
          q.tran.DH + ' · ' + q.tran.CV + ' · ' + q.tran.CM + '</p>' +
          '<p class="sm mt" style="line-height:1.8">Cần <b>' + q.canDH + ' Đồng Hành</b> và <b>' +
          q.canCV + ' Cố Vấn</b>. Đào tạo cộng lại <b>' + q.gioDaoTao.toLocaleString('vi-VN') +
          ' giờ</b>. Nghe mỗi tuần <b>' + q.gioMoiTuan.toLocaleString('vi-VN') + ' giờ</b>.</p>' +
          '<p class="sm mt" style="line-height:1.8;color:#BE0E16"><b>Nút thắt không phải người — là năm. ' +
          'Cố Vấn đầu tiên sớm nhất ở tháng thứ ' + q.thangSomNhatCoCV + '.</b></p>' +
          '<p class="tiny dim mt" style="line-height:1.7">' + h(q.nutThat) + '</p>' +
          '<p class="tiny mt" style="line-height:1.7">' + h(q.luatChan) + '</p>' +
          '<p class="tiny dim mt" style="line-height:1.7">' + h(G.CS_QUYMO.viSaoKhongGhiSan || '') + '</p></div>';

        if (G.vePheu) o += G.hinhCard(
          G.vePheu([
            { so: q.dich,  ten: 'gia đình xong tầng năm',                         c: '#BE0E16' },
            { so: q.canDH, ten: 'Đồng Hành — trần ' + q.tran.DH + ' nhà mỗi người', c: '#185AB4' },
            { so: q.canCV, ten: 'Cố Vấn — trần ' + q.tran.CV + ' Đồng Hành mỗi người', c: '#0B7350' }
          ], { nhan: 'Chia cho trần' }),
          'Một nghìn chia cho trần',
          'Ba con số này TÍNH TẠI CHỖ từ DD_CAP, không ghi sẵn ở đâu — đổi trần thì hình đổi theo. ' +
          'Con số hình này KHÔNG vẽ được là số năm: Cố Vấn đầu tiên sớm nhất ở tháng thứ ' +
          q.thangSomNhatCoCV + '.');
      }
    }

    /* ── Năm trụ nền ── */
    var snn = G.csSoiNen();
    o += U.sec('Năm trụ nền' + (snn.loi.length ? ' — LỆCH: ' + (snn.loi.join(' ')) : ''),
      'Mỗi trụ trỏ vào một luật đã có. Viết lại luật ở đây là dựng bản thứ hai.');
    o += '<div class="card mb">' + (G.CS_NEN || []).map(function (n) {
      var thieu = n.theoLuat && G[n.theoLuat] === undefined;
      return '<div style="padding:9px 0;border-bottom:1px solid var(--gita-vien-2)">' +
        '<b class="sm">' + h(n.ten) + '</b> <span class="tiny" style="color:' +
        (thieu ? '#B4720F' : '#0B7350') + '">' + h(n.theoLuat) + (thieu ? ' (gói nghề)' : '') + '</span>' +
        '<p class="sm mt" style="line-height:1.8">' + h(n.la) + '</p>' +
        '<p class="tiny dim mt" style="line-height:1.7">' + h(n.vi) + '</p></div>';
    }).join('') + '</div>';

    /* ── Chỗ lệch với bản gốc ── */
    if (G.CS_LECH) {
      o += U.sec('Bốn chỗ bức tranh lệch với hệ đã dựng',
        'Ghi lại để lần sau không bàn lại.');
      o += (G.CS_LECH || []).map(function (l) {
        return '<div class="card mb" style="border-color:#B4720F3e">' +
          '<span class="tiny up" style="color:#B4720F">' + h(l.ma) + ' · ' + h(l.o) + '</span>' +
          '<p class="sm mt" style="line-height:1.8"><b>Tranh ghi:</b> ' + h(l.tranhGhi) + '</p>' +
          '<p class="sm mt" style="line-height:1.8"><b>Hệ đã có:</b> ' + h(l.heDaCo) + '</p>' +
          '<p class="sm mt" style="line-height:1.8;color:#0B7350"><b>Xử lý:</b> ' + h(l.xuLy) + '</p>' +
          '<p class="tiny dim mt" style="line-height:1.7">' + h(l.vi) + '</p></div>';
      }).join('');
    }

    /* ── Chờ chủ hệ ── */
    if (G.CS_CHOCHU) {
      o += U.sec('Hai câu chờ chủ hệ', 'Mã không tự trả lời được hai câu này.');
      o += '<div class="card mb">' + G.csChoChu().map(function (c) {
        return '<div style="padding:9px 0;border-bottom:1px solid var(--gita-vien-2)">' +
          '<b class="sm">' + h(c.hoi) + '</b>' +
          '<p class="tiny dim mt" style="line-height:1.7">' + h(c.boi) + '</p>' +
          '<p class="tiny mt" style="line-height:1.7;color:#0B6675">' +
          h(c.toiNghieng || c.toiKhongTuDat || '') + '</p></div>';
      }).join('') + '</div>';
    }

    o += G.kaKhung ? G.kaKhung('coach-5-tang', 'cuoi') : '';

    o += U.sec('Sáu luật của hệ Coach', '');
    o += '<div class="card">' + (G.CS_LUAT || []).map(function (l) {
      return '<div style="padding:8px 0;border-bottom:1px solid var(--gita-vien-2)">' +
        '<b class="sm">' + l.no + '. ' + h(l.t) + '</b>' +
        '<p class="tiny dim mt" style="line-height:1.7">' + h(l.y) + '</p></div>';
    }).join('') + '</div>';
    return o;
  };
})();
