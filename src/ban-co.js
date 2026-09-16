/* ═══════════════════════════════════════════════════════════════
   GITA 365 — MÁY CHẠY BÀN CỜ HÀNH TRÌNH

   Kho chuẩn ở kho-goc/data.ban-co.js.

   KHÔNG DỰNG KHO VIỆC MỚI

   Mười gợi ý mỗi ngày lấy từ mười bánh đà đã có: mỗi bánh đà đưa ra
   việc nhỏ KẾ TIẾP của nó — việc đầu tiên trong `nho` mà nhà mình chưa
   đặt lần nào. Một trăm việc đã nằm sẵn trong BD_LON từ lâu, mỗi việc
   đã có sẵn cả "làm gì" lẫn "rồi sẽ thấy gì".

   Dựng một kho nhiệm vụ thứ hai là để dành một ngày mà hai kho lệch
   nhau, và lúc ấy màn này bảo làm một việc còn màn bánh đà bảo làm việc
   khác.

   SỐ NGÀY CỦA TẦNG ĐỌC TỪ HP_TANG

   Bảy · hai mươi mốt · chín mươi · ba trăm sáu lăm · ba trăm sáu lăm.
   Con số ấy đã nằm trong bảng học phí; rút ra bằng cách đọc số đầu
   tiên trong tên chặng. HP_TANG ở gói NGHỀ, nên máy gia đình không có —
   và lúc ấy màn nói CHƯA ĐO ĐƯỢC kèm tên kho, không đoán một con số.

   MỘT CHỖ DỄ SAI: NGÀY THEO GIỜ MÁY NGƯỜI DÙNG

   Khoá ô là ngày địa phương, không phải ngày UTC. Dùng toISOString()
   thì nhà mình đặt quân lúc chín giờ tối giờ Việt Nam sẽ rơi vào ô của
   NGÀY HÔM SAU — và cái bàn cờ lệch đúng một ô suốt cả tầng.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;
G.VIEWS = G.VIEWS || {};

(function () {
  var U = G.U, h = U.h;
  var MA_TANG = ['T1', 'T2', 'T3', 'T4', 'T5'];

  /* Ngày địa phương. toISOString() trả về ngày UTC — chín giờ tối giờ
     Việt Nam đã là ngày hôm sau ở UTC, và bàn cờ lệch một ô cả tầng. */
  G.bcNgay = function (d) {
    d = d || new Date();
    var m = d.getMonth() + 1, n = d.getDate();
    return d.getFullYear() + '-' + (m < 10 ? '0' : '') + m + '-' + (n < 10 ? '0' : '') + n;
  };

  /* Số ngày của một tầng — ĐỌC từ HP_TANG, không ghi lại ở đây. */
  G.bcSoNgay = function (tang) {
    /* HP_TANG ở gói NGHỀ vì nó chứa GIÁ. HP_NGAY là bản rút của chính nó,
       sinh ra lúc đóng gói và để ở gói NỀN — vì số ngày là LỜI HỨA với
       nhà mình, không phải bí mật, và bản đồ công khai đã in nó rồi.
       Máy nghề đọc bản đầy đủ, máy gia đình đọc bản rút. Một nguồn. */
    var t = (G.HP_TANG || []).filter(function (x) { return x.tang === tang; })[0];
    if (t) {
      var so = String(t.ten || '').match(/\d+/);
      return so ? Number(so[0]) : null;
    }
    var n = (G.HP_NGAY || []).filter(function (x) { return x.tang === tang; })[0];
    return n && n.ngay ? n.ngay : null;
  };

  /* ═══════════ VÒNG CỦA MỘT TẦNG ═══════════
     ĐỌC từ chỗ đã viết, không khai lại:
       HP_TANG.ten  'Chặng bứt phá — 90 ngày, 4 chuỗi 21 ngày'
       CUHICH.hua   'Mỗi vòng bảy ngày thay đúng một biến.'  (tier T2)
     Không thấy ở đâu thì tầng ấy không chia vòng — và nói là không có,
     chứ không tự đặt ra một con số cho đều bảng. */
  var SO_CHU = { nhất: 1, hai: 2, ba: 3, tư: 4, bốn: 4, năm: 5, sáu: 6, bảy: 7, tám: 8,
    chín: 9, mười: 10, 'mười một': 11, 'hai mươi mốt': 21 };
  function soTuChu(t) {
    t = String(t || '').toLowerCase();
    var k = Object.keys(SO_CHU).sort(function (a, b) { return b.length - a.length; });
    for (var i = 0; i < k.length; i++) if (t.indexOf(k[i]) >= 0) return SO_CHU[k[i]];
    return null;
  }
  G.bcVong = function (tang) {
    var can = G.bcSoNgay(tang);
    if (!can) return null;
    /* 1. Tên chặng: 'N chuỗi M ngày' hoặc 'N chu kỳ M ngày' */
    var t = (G.HP_TANG || []).filter(function (x) { return x.tang === tang; })[0] ||
            (G.HP_NGAY || []).filter(function (x) { return x.tang === tang; })[0];
    /* Lấy luôn CHỮ mà kho gọi cái vòng ấy: tầng ba gọi là "chuỗi", tầng
       bốn gọi là "chu kỳ". Gọi cả hai là "vòng" thì màn nói một đằng mà
       hợp đồng nói một nẻo, và nhà mình phải tự dịch. */
    var m = /(\d+)\s*(chuỗi|chu kỳ|vòng)\s*(\d+)\s*ngày/i.exec((t && t.ten) || '');
    if (m) return vongRa(Number(m[1]), Number(m[3]), can, 'HP_TANG.ten', m[2]);
    /* 2. Lời hứa của cú hích cùng tầng: 'Mỗi vòng bảy ngày…' */
    var ch = (G.CUHICH || []).filter(function (x) { return x.tier === tang; })[0];
    var hua = (ch && ch.hua) || '';
    var mv = /mỗi vòng\s+([^,\.]+?)\s*ngày/i.exec(hua);
    var dai = mv ? (Number(mv[1]) || soTuChu(mv[1])) : null;
    if (dai && dai > 0 && dai <= can)
      return vongRa(Math.floor(can / dai), dai, can, 'CUHICH.' + ch.ma + '.hua', 'vòng');
    return null;
  };
  /* Vòng KHÔNG lát kín tầng ở hai chỗ, và cả hai đều nằm sẵn trong kho:
       T3  '90 ngày, 4 chuỗi 21 ngày'   → 4×21 = 84, dư 6
       T4  '365 ngày, 4 chu kỳ 90 ngày' → 4×90 = 360, dư 5
     Kho không nói mấy ngày dư ấy là gì. Nên KHÔNG làm tròn và KHÔNG
     giãn vòng cho vừa — trả về số dư và để màn nói thẳng. Giãn cho vừa
     là sửa lời hứa cho khớp cái bàn, mà đáng ra phải ngược lại. */
  function vongRa(soVong, dai, can, docTu, ten) {
    var du = can - soVong * dai;
    ten = String(ten || 'vòng').toLowerCase();
    return { soVong: soVong, dai: dai, du: du, docTu: docTu,
      ten: ten, tenVong: ten.charAt(0).toUpperCase() + ten.slice(1),
      la: soVong + ' ' + ten + ', mỗi ' + ten + ' ' + dai + ' ngày' +
        (du > 0 ? ' · dư ' + du + ' ngày' : ''),
      duChuaKhai: du > 0
        ? 'Kho khai ' + can + ' ngày và ' + soVong + ' ' + ten + ' ' + dai + ' ngày — cộng lại ' +
          (soVong * dai) + ', dư ' + du + ' ngày chưa nói là gì. Bàn cờ để ' + du +
          ' ô ấy ngoài ' + ten + ' chứ không giãn ' + ten + ' cho vừa.'
        : null };
  }

  /* Biến của một vòng — nhà mình tự ghi, và KHÔNG bắt buộc. Bắt điền mới
     cho đi tiếp là dựng một cái cổng ở chỗ đáng ra chỉ cần một lời mời. */
  G.bcBien = function (tang, vong) {
    var b = (G.S && G.S.bcBien) || {};
    return (b[tang] || {})[vong] || null;
  };
  G.bcGhiBien = function (tang, vong, cu, moi) {
    if (!String(moi || '').trim()) return false;
    G.S.bcBien = G.S.bcBien || {};
    G.S.bcBien[tang] = G.S.bcBien[tang] || {};
    G.S.bcBien[tang][vong] = { cu: String(cu || '').trim(), moi: String(moi).trim(),
      ngay: G.bcNgay() };
    if (G.save) G.save();
    return true;
  };

  function so() { return (G.S && G.S.banCo) || {}; }
  function soCua(tang) { return so()[tang] || {}; }

  /* ═══════════ AI TRONG NHÀ ĐANG CÙNG ĐI ═══════════
     Mặc định ba: mẹ · bố · con. Nhưng có nhà một mẹ nuôi con, có nhà ông
     bà nuôi cháu — ép đủ ba mới được tính là đuổi đúng những nhà cần hệ
     này nhất ra ngoài. Nhà hai người thì hai việc là đủ, và ô ấy đầy y
     như ô của nhà ba người. */
  G.bcVaiNha = function () {
    var khai = (G.S && G.S.bcVai) || null;
    var ds = G.BC_VAI || [];
    if (!khai) return ds.filter(function (v) { return v.mac === true; });
    var co = ds.filter(function (v) { return khai.indexOf(v.ma) >= 0; });
    /* Khai rỗng thì rơi về mặc định — một bàn cờ không có ai đi thì ô
       nào cũng đầy sẵn, và cái bàn ấy vô nghĩa. */
    return co.length ? co : ds.filter(function (v) { return v.mac === true; });
  };
  G.bcDatVai = function (dsMa) {
    if (!Array.isArray(dsMa) || !dsMa.length) return false;
    var hop = (G.BC_VAI || []).map(function (v) { return v.ma; });
    G.S.bcVai = dsMa.filter(function (m) { return hop.indexOf(m) >= 0; });
    if (!G.S.bcVai.length) { delete G.S.bcVai; return false; }
    if (G.save) G.save();
    return true;
  };

  /* Ô của một ngày, dạng chuẩn. Bản 9.32 ghi một việc thẳng vào ô; từ
     9.34 ô là { vai: {...} }. Đọc được cả hai để bàn cờ đã đặt không
     mất màu sau khi cập nhật. */
  function oChuan(q) {
    if (!q) return null;
    if (q.vai) return q;
    return { vai: { _cu: { ma: q.ma, bd: q.bd, diem: q.diem, c: q.c, muc: q.muc } } };
  }
  function diemO(q) {
    q = oChuan(q); if (!q) return 0;
    var t = 0;
    Object.keys(q.vai).forEach(function (v) { t += Number(q.vai[v].diem) || 0; });
    return t + (Number(q.thuong) || 0);
  }
  function oDay(q, canVai) {
    q = oChuan(q); if (!q) return false;
    if (q.vai._cu) return true;                    /* ô kiểu cũ coi như đầy */
    return canVai.every(function (v) { return !!q.vai[v.ma]; });
  }

  /* ═══════════ MƯỜI GỢI Ý CỦA HÔM NAY ═══════════
     Mỗi bánh đà đưa ra việc nhỏ kế tiếp của nó. Đúng mười, vì có đúng
     mười bánh đà. */
  G.bcGoiY = function (tang) {
    if (!G.BD_LON) return [];
    /* Việc đã đặt phải rút khỏi danh sách gợi ý. Ô nay là { vai: {...} }
       chứ không còn là một việc phẳng — đọc `.ma` thẳng trên ô thì luôn
       ra undefined, và cùng một việc gợi ý lại mãi. Chỉ lộ ra khi đặt
       xong rồi nhìn lại danh sách. */
    var daDat = {};
    Object.keys(so()).forEach(function (t) {
      Object.keys(so()[t]).forEach(function (n) {
        var q = oChuan(so()[t][n]);
        Object.keys(q.vai).forEach(function (v) { if (q.vai[v].ma) daDat[q.vai[v].ma] = true; });
      });
    });
    var iNay = MA_TANG.indexOf(tang);
    return (G.BD_LON || []).map(function (b) {
      var nho = (b.nho || []).filter(function (x) { return !daDat[x.ma]; })[0] || null;
      if (!nho) return null;
      var iB = MA_TANG.indexOf(b.tang);
      var muc = iB === iNay ? 'DUNG_TANG' : iB < iNay ? 'TANG_TRUOC' : 'TANG_SAU';
      var w = (G.BC_TRONGSO || []).filter(function (x) { return x.ma === muc; })[0] || {};
      return { ma: nho.ma, ten: nho.ten, viec: nho.viec, thay: nho.thay,
        banhDa: b.ma, banhDaTen: b.ten, tang: b.tang, c: b.c,
        muc: muc, mucTen: w.ten || '', diem: w.diem || 1 };
    }).filter(Boolean);
  };

  /* ═══════════ ĐẶT MỘT QUÂN ═══════════
     Ô đã đặt thì không xoá và không đặt đè — việc đã làm rồi thì đã làm
     rồi, và một bàn cờ sửa được thì nhìn nó không còn nghĩa gì. */
  G.bcDat = function (tang, vai, maViec) {
    var canVai = G.bcVaiNha();
    if (!canVai.filter(function (v) { return v.ma === vai; })[0])
      return { ok: false, y: 'Nhà mình chưa khai vai này đang cùng đi.' };
    var g = G.bcGoiY(tang).filter(function (x) { return x.ma === maViec; })[0];
    if (!g) return { ok: false, y: 'Việc này không có trong mười gợi ý của hôm nay.' };
    G.S.banCo = G.S.banCo || {};
    G.S.banCo[tang] = G.S.banCo[tang] || {};
    var n = G.bcNgay();
    var q = G.S.banCo[tang][n] || { vai: {} };
    if (q.vai && q.vai[vai])
      return { ok: false, y: 'Hôm nay ' + (G.BC_VAI.filter(function (v) { return v.ma === vai; })[0] || {}).ten +
        ' đã đặt việc của mình rồi. Mai đặt tiếp.' };
    q.vai = q.vai || {};
    q.vai[vai] = { ma: g.ma, bd: g.banhDa, diem: g.diem, c: g.c, muc: g.muc };
    /* Thưởng CÙNG NHAU: ô đầy trong cùng một ngày thì cả nhà được thêm
       điểm bằng số người đã khai. Bằng số người chứ không phải một con
       số cố định — con số cố định thì nhà đông thấy rẻ, nhà ít thấy với
       không tới. Chỉ cộng đúng một lần, ở đúng lúc ô vừa đầy. */
    var vuaDay = oDay(q, canVai) && !q.thuong;
    if (vuaDay) q.thuong = canVai.length;
    G.S.banCo[tang][n] = q;
    if (G.save) G.save();
    return { ok: true, diem: g.diem, thuong: vuaDay ? canVai.length : 0,
      day: oDay(q, canVai), conThieu: canVai.filter(function (v) { return !q.vai[v.ma]; })
        .map(function (v) { return v.ten; }),
      o: q, viec: g };
  };

  /* ═══════════ ĐO ═══════════ */
  G.bcDo = function (tang) {
    var s = soCua(tang), ngay = Object.keys(s).sort();
    var canVai = G.bcVaiNha();
    var tong = 0, bd = {}, day = [], dang = 0;
    ngay.forEach(function (n) {
      var q = oChuan(s[n]);
      tong += diemO(q);
      Object.keys(q.vai).forEach(function (v) { if (q.vai[v].bd) bd[q.vai[v].bd] = true; });
      /* Ô ĐẦY mới được tính là một ô có màu. Ô mới một người làm là ô
         dở dang — công đã cộng, nhưng bức tranh chưa có ô ấy. */
      if (oDay(q, canVai)) day.push(n); else dang++;
    });
    /* Chuỗi tính trên ô ĐẦY: chuỗi là "cả nhà cùng làm mấy tối liền",
       không phải "có người làm mấy tối liền". */
    var chuoi = 0, d = new Date();
    for (;;) {
      var q0 = s[G.bcNgay(d)];
      if (!q0 || !oDay(q0, canVai)) break;
      chuoi++; d = new Date(d.getTime() - 86400000);
    }
    var dai = 0, chay = 0, truoc = null;
    day.forEach(function (n) {
      var t = new Date(n + 'T00:00:00').getTime();
      chay = (truoc !== null && t - truoc === 86400000) ? chay + 1 : 1;
      if (chay > dai) dai = chay;
      truoc = t;
    });
    var can = G.bcSoNgay(tang);
    var nay = oChuan(s[G.bcNgay()]);
    return { soO: day.length, dangDo: dang, tong: tong, chuoi: chuoi, chuoiDai: dai,
      soBanhDa: Object.keys(bd).length, can: can, soVai: canVai.length,
      phanTram: can ? Math.min(100, Math.round(day.length * 100 / can)) : null,
      xong: can ? day.length >= can : false,
      daDatHomNay: !!(nay && oDay(nay, canVai)),
      vaiHomNay: canVai.map(function (v) {
        return { ma: v.ma, ten: v.ten, c: v.c, xong: !!(nay && nay.vai[v.ma]),
          viec: nay && nay.vai[v.ma] ? nay.vai[v.ma] : null };
      }) };
  };

  /* Mốc nào vừa chạm. Trả về mốc CAO NHẤT đạt được — nổi năm cái cùng
     lúc thì không cái nào được nhìn. */
  G.bcMocDat = function (tang) {
    var d = G.bcDo(tang), ra = [];
    if (d.xong) ra.push('XONG_TANG');
    if (d.soBanhDa >= 10) ra.push('DU_MUOI');
    if (d.can && d.soO >= Math.ceil(d.can / 2)) ra.push('NUA_BAN');
    if (d.chuoi >= 7) ra.push('BAY_LIEN');
    if (d.daDatHomNay) ra.push('MOI_NGAY');
    var thu = ['XONG_TANG', 'DU_MUOI', 'NUA_BAN', 'BAY_LIEN', 'MOI_NGAY'];
    for (var i = 0; i < thu.length; i++)
      if (ra.indexOf(thu[i]) >= 0)
        return (G.BC_MUNG || []).filter(function (m) { return m.ma === thu[i]; })[0] || null;
    return null;
  };

  /* ═══════════ SOI ═══════════ */
  G.bcSoi = function () {
    var loi = [], chuaDo = [];
    if ((G.BC_TRONGSO || []).length !== 3) loi.push('trọng số phải đúng 3 mức');
    var d = {};
    (G.BC_TRONGSO || []).forEach(function (t) {
      if (d[t.diem]) loi.push('hai mức cùng ' + t.diem + ' điểm');
      d[t.diem] = 1;
      if (!t.khi || !t.vi) loi.push(t.ma + ':thiếu cột');
    });
    (G.BC_MUNG || []).forEach(function (m) {
      if (!m.bieuTuong || !m.loi || !m.phu || !m.khi) loi.push(m.ma + ':mốc mừng thiếu cột');
    });
    if ((G.BC_TRONGSO_LUAT || {}).khongXepHang !== true) loi.push('chưa khai không xếp hạng');
    if ((G.BC_TRONGSO_LUAT || {}).khongPhatNgayBoLo !== true) loi.push('chưa khai không phạt ngày bỏ lỡ');
    /* Số ngày phải ĐỌC được từ HP_TANG cho cả năm tầng — nếu không thì
       bàn cờ không biết mình dài bao nhiêu ô. HP_TANG ở gói nghề. */
    if (!G.HP_TANG) chuaDo.push('HP_TANG');
    else MA_TANG.forEach(function (t) {
      if (!G.bcSoNgay(t)) loi.push(t + ':không đọc được số ngày từ HP_TANG');
    });
    return { loi: loi, chuaDo: chuaDo };
  };

  /* ═══════════════════════════════════════════════════════════
     MÀN HÌNH
     ═══════════════════════════════════════════════════════════ */
  /* Bàn chia theo VÒNG: mỗi vòng một dải riêng, có nhãn và có chỗ ghi
     biến. Đổ 21 ô liền một mạch thì mắt đọc ra một dải ngày, không đọc
     ra ba lần thử — mà ba lần thử mới là thứ tầng hai đang dạy. */
  /* Số của một vòng. Nói gì thì tuỳ vòng ấy ĐÃ TRỌN, ĐANG ĐI hay CHƯA
     TỚI — một vòng chưa tới lượt mà bị báo "kém 7 ô" là bị trách về một
     việc chưa đến lượt làm, và một vòng mới đi ba ngày mà đem so với
     một vòng đã trọn hai mươi mốt thì con số ấy âm vì lịch chứ không
     vì nhà mình. */
  function veSoVong(dv, v) {
    if (!dv || dv.soO === undefined) return '';
    if (dv.trangThai === 'chuaToi')
      return '<p class="bc-vong-so dim">Chưa tới ' + h(v.ten) + ' này.</p>';
    var o = '<p class="bc-vong-so"><b>' + dv.soO + '</b>/' +
      (dv.trangThai === 'dangDi' ? dv.ngayThu : v.dai) + ' ô · <b>' +
      dv.tong + '</b> điểm · dài nhất <b>' + dv.chuoiDai + '</b> ngày liền';
    if (dv.trangThai === 'dangDi') {
      o += ' <span class="dang">đang đi · ngày thứ ' + dv.ngayThu + '/' + v.dai + '</span>';
      if (dv.truocCungNgay !== null && dv.truocCungNgay !== undefined) {
        var c = dv.soO - dv.truocCungNgay;
        o += '<br><span class="' + (c > 0 ? 'hon' : c < 0 ? 'kem' : 'bang') + '">' +
          h(v.tenVong) + ' trước tới đúng ngày thứ ' + dv.ngayThu + ' có ' +
          dv.truocCungNgay + ' ô' +
          (c > 0 ? ' — nhà mình đang hơn ' + c : c < 0 ? ' — đang kém ' + (-c) : ' — đang bằng') +
          '</span>';
      }
    } else if (dv.hon !== null && dv.hon !== undefined) {
      o += ' <span class="' + (dv.hon > 0 ? 'hon' : dv.hon < 0 ? 'kem' : 'bang') + '">' +
        (dv.hon > 0 ? '+' + dv.hon + ' ô so với ' + v.ten + ' trước'
         : dv.hon < 0 ? dv.hon + ' ô so với ' + v.ten + ' trước'
         : 'bằng ' + v.ten + ' trước') + '</span>';
    }
    return o + '</p>';
  }

  /* Nhịp tụt hay không — và khi CHƯA ĐO ĐƯỢC thì nói thẳng thiếu gì,
     không đưa ra một con số cho đủ ô. Một con số bịa nguy hiểm hơn một
     ô trống, vì ô trống thì người ta đi tìm, còn con số bịa thì người
     ta tin. */
  function veNhip(nk) {
    if (nk.chuaDo)
      return '<div class="bc-nhip chua"><b>Nhịp nhà mình có tụt không — chưa đo được</b>' +
        '<p>' + h(nk.thieu) + '</p></div>';
    return '<div class="bc-nhip' + (nk.tut ? ' tut' : ' giu') + '">' +
      '<b>' + (nk.tut ? 'Nhịp nhà mình ĐANG TỤT' : 'Nhịp nhà mình không tụt') + '</b>' +
      '<p><b>' + Math.round(nk.nay.ty * 100) + '%</b> bây giờ (' + nk.nay.soO + '/' +
      nk.nay.qua + ' ngày đã qua) · <b>' + Math.round(nk.truoc.ty * 100) + '%</b> ở tầng ' +
      nk.tangTruoc.slice(1) + ' (' + nk.truoc.soO + '/' + nk.truoc.qua + ')' +
      ' · ' + (nk.chenh > 0 ? 'hơn ' + nk.chenh : nk.chenh < 0 ? 'kém ' + (-nk.chenh) : 'bằng') +
      (nk.chenh ? ' điểm phần trăm' : '') + '.</p>' +
      '<p class="dim">' + h((G.BC_NHIP_LUAT || {}).vi || '') + '</p></div>';
  }

  /* Nhà mình đang kèm. Màn nói LỊCH — thứ tính được — và nói thẳng chỗ
     KPI là chỗ chưa đo được. Suy KPI từ lịch đúng là cái luật vừa cấm. */
  function veKem() {
    var L = G.BC_KEM_LUAT || {};
    var d = G.bcKemDo();
    if (!d) return '<div class="bc-kem chua"><b>Nhà mình đang kèm — chưa khai</b>' +
      '<p>' + h(L.cot || '') + '</p>' +
      '<button class="bc-nutbien" data-bckem="1">Khai nhà mình đang kèm</button></div>';
    if (d.chuaDo) return '<div class="bc-kem chua"><b>' + h(d.ten) + ' — chưa đo được</b>' +
      '<p>' + h(d.thieu) + '</p>' +
      '<button class="bc-nutbien" data-bckem="1">Khai lại</button></div>';
    var o = '<div class="bc-kem' + (d.hetLich ? ' het' : '') + '">' +
      '<b>' + h(d.ten) + ' · tầng ' + d.tang.slice(1) + '</b>' +
      '<p>Mùa đầu của nhà kia dài <b>' + d.muaDau + ' ngày</b> — theo đúng quy định của tầng ' +
      d.tang.slice(1) + '. Bắt đầu ' + h(d.batDau) + ', đã qua <b>' + d.qua + '</b> ngày' +
      (d.hetLich ? '' : ', còn <b>' + d.conLai + '</b> ngày') + '.</p>';
    if (d.vong)
      o += '<p>Đang ở ' + h(d.vong.ten) + ' <b>' +
        (d.ngoaiVong ? 'ngoài ' + h(d.vong.ten) : d.vongNao + '/' + d.vong.soVong) + '</b>' +
        (d.ngayTrongVong ? ' · ngày thứ ' + d.ngayTrongVong + '/' + d.vong.dai : '') + '.</p>';
    /* HẾT NGÀY KHÔNG PHẢI LÀ XONG TẦNG. Đây là chỗ dễ đọc sai nhất trên
       cả màn, nên nó phải đứng ngay dưới con số ngày. */
    if (d.hetLich)
      o += '<p class="canh"><b>' + h(L.hetNgayKhongPhaiXong || '') + '</b></p>';
    var c = d.cong;
    o += c.chuaDo
      ? '<p class="dim"><b>KPI của nhà kia — chưa đo được ở máy này.</b> ' + h(c.thieu) + '</p>'
      : '<p class="dim"><b>Cổng lên tầng</b> · ' +
        (c.chiSo ? h(c.chiSo.ma + ' ' + c.chiSo.ten + ' — ' + c.chiSo.nguong) : '') +
        (c.cauKhong ? ' · “' + h(c.cauKhong) + '”' : '') +
        ' (đọc từ ' + h(c.docTu) + ')</p>';
    return o + '<button class="bc-nutbien" data-bckem="1">Sửa</button></div>' + veHoaHong(d);
  }

  /* Hoa hồng kèm — bậc đọc từ HH_BAC, trần từ HOAHONG.tran, và KHÔNG in
     ra một con số tiền nào khi chưa có giá. Chỗ này ra tiền thật, nên
     nó nói cả chỗ mình chưa chứng minh được. */
  function veHoaHong(d) {
    if (typeof G.hhTinh !== 'function' || !G.HH_BAC) return '';
    var K = G.HH_KEM || {}, L = G.HH_CC_LUAT || {};
    var hs = G.hhHoSo({ vuotTang: false, tangDuocKem: d && d.tang });
    var KT = G.HH_KHONG_TIEN || {};
    var khongTien = (KT.tang || []).indexOf(d && d.tang) >= 0;

    /* TẦNG KÈM KHÔNG CÓ TIỀN thì KHÔNG mở đầu bằng bảng hai bậc. Bảng ấy
       nói 5% và 10%, mà tầng này là 0% — in nó trước rồi mới cải chính ở
       dưới là để người ta đọc con số sai trước con số đúng, và con số đọc
       trước là con số nhớ. Điều khoản của chính tầng đang kèm lên đầu. */
    var o = '<div class="bc-hh">';
    if (khongTien) {
      var q = (typeof G.hhQuaKem === 'function') ? G.hhQuaKem(d && d.tang) : null;
      o += '<b>Kèm nhà tầng ' + h(String(d.tang).slice(1)) + ': ' + KT.phanTram + '% hoa hồng</b>' +
        '<p>' + h(KT.vi || '') + '</p>' +
        '<p class="dim">' + h(KT.viLaDieuKhoan || '') + '</p>';
      if (q && q.diem)
        o += '<p class="bc-hh-qua"><b>Đổi lại, kèm được một nhà lên tầng thì nhà mình ' +
          'nhận ' + h(String(q.diem)) + ' điểm và ' +
          (q.sao ? 'một bí kíp ' + h(String(q.sao)) + ' sao' : 'một bí kíp') + '.</b> ' +
          h(KT.saoTheoTangNao || '') + '<br><span class="dim">' +
          h(KT.viSaoTheoTangDuocKem || '') + ' (đọc từ ' + h(q.docTu || '') + ')</span></p>';
      else if (q && q.thieu)
        o += '<p class="canh">' + h(q.thieu) + '</p>';
      o += '<p class="canh"><b>Vẫn phải vượt tầng mới có quà.</b> ' +
        h(KT.viVanPhaiVuotTang || '') + '</p>';
      o += '<p class="dim">Các tầng khác — hai bậc, trần ' + ((G.HOAHONG || {}).tran) + '%:</p>';
    } else {
      o += '<b>Hoa hồng kèm — hai bậc, trần ' + ((G.HOAHONG || {}).tran) + '%</b>' +
        '<p>' + h(K.cot || '') + '</p>';
    }
    o += '<div class="bc-hh-bac">' + (G.HH_BAC || []).map(function (b) {
      return '<div class="bc-hh-hang"><b>' + b.phanTram + '%</b><span>' + h(b.khi) + '</span></div>';
    }).join('') + '</div>';
    o += '<p class="dim">' + h((G.HH_BAC_LUAT || {}).khongVuotTangThiKhongCo || '') + '</p>';
    /* Số tiền: nói thẳng vì sao chưa ra được. Tầng không có tiền thì không
       hỏi câu ấy — hỏi rồi in "0 đồng" là mời người đọc hiểu thành một
       phép nhân ra 0, đúng thứ điều khoản này dựng lên để không bị hiểu. */
    if (!khongTien) {
      var ti = G.hhTien(10, d && d.tang);
      if (ti.chuaCoGia) o += '<p class="canh"><b>Chưa ra được số tiền.</b> ' + h(ti.thieu) + '</p>';
    }
    /* Bảng chứng cứ: nói TRƯỚC sẽ hỏi những gì, để nhà mình ghi từ đầu
       chứ không đi dựng lại hồ sơ lúc đòi tiền. */
    o += '<p class="bc-hh-cc"><b>Sổ chứng cứ — ' + hs.soChungCu + ' bản, ' +
      hs.daDoiChung + ' đã đối chứng</b><br>' +
      (G.HH_CHUNGCU || []).filter(function (c) { return c.buoc; })
        .map(function (c) { return h(c.ten); }).join(' · ') + '</p>';
    o += '<p class="dim">' + h(L.viHaiChuKy || '') + '</p>';
    (hs.canh || []).forEach(function (c) {
      o += '<p class="canh">' + h(c) + '</p>';
    });
    return o + '</div>';
  }

  function veNep(tang, nd) {
    if (nd.daGhi)
      return '<div class="bc-nep xong"><b>Nếp nhà mình khoanh được</b>' +
        '<p>' + h(nd.daGhi.nep) + '</p>' +
        '<p class="loi">Nói lại bằng lời nhà mình: “' + h(nd.daGhi.loi) + '”</p></div>';
    if (!nd.moDuoc)
      return '<div class="bc-nep chua"><b>Cuối chặng mới khoanh một nếp</b>' +
        '<p>Còn ' + nd.conThieu + ' tối nữa. Khoanh nếp ở giữa chặng là rút kết luận từ ' +
        'mấy tối — mà cả chặng này dựng lên để tránh đúng chuyện ấy.</p>' +
        '<p class="dim">(đọc từ ' + h(nd.docTu) + ')</p></div>';
    return '<div class="bc-nep mo"><b>Đủ ' + nd.can + ' tối rồi — đọc lại và khoanh MỘT nếp</b>' +
      '<p>Chọn đúng một thứ lặp lại đủ để gọi là nếp, rồi nói lại bằng lời của nhà mình. ' +
      'Nhắc đúng thuật ngữ của Học viện thì chưa phải là hiểu.</p>' +
      '<button class="bc-nutbien" data-bcnep="' + h(tang) + '">Khoanh một nếp</button></div>';
  }

  function veTheoVong(tang, can, s, v) {
    var o = '', d0 = ngayDau(s);
    var dsKho = G.bcVongKho(tang) || [];
    var doV = G.bcVongDo(tang) || [];
    var noi = G.bcMoiNoi(tang) || [];
    for (var k = 0; k < v.soVong; k++) {
      var bien = G.bcBien(tang, k + 1);
      var kho = dsKho.indexOf(k + 1) >= 0;
      var dv = doV[k] || {};
      /* Mối nối vào TRƯỚC dải của vòng sau — cái khớp nằm giữa hai
         chuỗi, nên nó phải hiện ở giữa, không phải nằm dưới chân một
         trong hai. */
      var mn = noi.filter(function (x) { return x.den === k + 1; })[0];
      if (mn) o += '<div class="bc-khop' + (mn.noi ? ' noi' : '') + '">' +
        (mn.noi ? '⟶ nối được từ chuỗi ' + mn.tu + ' sang chuỗi ' + mn.den
                : '⟝ hở ở khớp chuỗi ' + mn.tu + ' sang chuỗi ' + mn.den) + '</div>';
      o += '<div class="bc-vong' + (kho ? ' kho' : '') + '">' +
        '<div class="bc-vong-d"><b>' + h(v.tenVong || 'Vòng') + ' ' + (k + 1) + '</b>' +
        '<span>' + v.dai + ' ngày</span>' +
        (kho ? '<span class="bc-vong-kho">CHỖ KHÓ NHẤT CỦA TẦNG</span>' : '') + '</div>' +
        veO(tang, s, d0, k * v.dai, v.dai) +
        /* Số của từng vòng, và chênh với vòng trước. Trong quãng "không
           kết quả nào", con số này là kết quả duy nhất có thật. */
        veSoVong(dv, v) +
        (bien
          ? '<p class="bc-bien"><b>Biến của ' + h(v.ten) + ' này:</b> ' +
            (bien.cu ? '<s>' + h(bien.cu) + '</s> → ' : '') + h(bien.moi) + '</p>'
          /* Vòng chưa tới thì không mời ghi biến. Mời ghi biến cho một
             vòng còn cách đây hai tháng là mời nghĩ hộ chính mình của
             hai tháng nữa, mà lúc ấy nhà mình đã khác. */
          : dv.trangThai === 'chuaToi' ? ''
          : '<button class="bc-nutbien" data-bcbien="' + (k + 1) + '">' +
            'Ghi một biến cho ' + h(v.ten) + ' này</button>') +
        '</div>';
    }
    if (v.du > 0) {
      o += '<div class="bc-vong du"><div class="bc-vong-d"><b>Ngoài ' + h(v.ten || 'vòng') + '</b>' +
        '<span>' + v.du + ' ngày</span></div>' +
        veO(tang, s, d0, v.soVong * v.dai, v.du) +
        '<p class="bc-bien dim">' + h(v.duChuaKhai || '') + '</p></div>';
    }
    return o;
  }

  /* Chỗ khó của tầng — đọc từ HT_TANG.khoNhat, rút số vòng trong câu.
       T2  'Tuần thứ hai — lúc hào hứng đã hết mà nếp thì chưa thành.'
       T3  'Chuỗi thứ hai và thứ ba. Không biến cố nào, không kết quả nào…'

     TRẢ VỀ MỘT DANH SÁCH, KHÔNG PHẢI MỘT SỐ

     Bản 9.35 chỉ bắt 'tuần thứ N' và trả về một số. Tầng ba nói CHUỖI
     chứ không nói tuần, và nói HAI vòng chứ không một — nên lời báo
     trước dựng ở 9.35 im lặng đúng ở tầng cần nó nhất: tầng ba là tầng
     dài nhất trước khi sang năm, và chỗ chán của nó kéo suốt sáu tuần
     giữa. Im lặng ấy không đỏ ở đâu cả, vì phép kiểm cũng chỉ hỏi T2. */
  G.bcVongKho = function (tang) {
    var t = (G.HT_TANG || []).filter(function (x) { return x.ma === tang; })[0];
    var m = /(?:tuần|chuỗi|chu kỳ|vòng)\s+thứ\s+([^\s,\.—–]+)(?:\s+và\s+(?:thứ\s+)?([^\s,\.—–]+))?/i
      .exec((t && t.khoNhat) || '');
    if (!m) return null;
    var ra = [m[1], m[2]].map(function (x) {
      if (!x) return null;
      var n = Number(x) || soTuChu(x);
      return n > 0 ? n : null;
    }).filter(Boolean);
    return ra.length ? ra : null;
  };
  G.bcKhoNhat = function (tang) {
    var t = (G.HT_TANG || []).filter(function (x) { return x.ma === tang; })[0];
    return (t && t.khoNhat) || null;
  };
  G.bcThuThach = function (tang) {
    var t = (G.HT_TANG || []).filter(function (x) { return x.ma === tang; })[0];
    return (t && t.thuThach) || null;
  };

  function ngayThu(d0, i) {
    return G.bcNgay(new Date(new Date(d0 + 'T00:00:00').getTime() + i * 86400000));
  }
  function ngayDau(s) { var k = Object.keys(s).sort(); return k.length ? k[0] : null; }

  /* ═══════════ ĐO TỪNG VÒNG ═══════════
     Tầng ba nói thẳng chỗ khó của nó: 'Không biến cố nào, không kết quả
     nào — chỉ là dài.' Sáu tuần giữa không có gì để nhìn, và đó là lý
     do thật khiến người ta bỏ ở chuỗi hai chứ không phải vì việc nặng.

     Thứ duy nhất có thật để nhìn trong quãng ấy là CHÍNH CHUỖI TRƯỚC.
     Chuỗi một mười lăm ô, chuỗi hai mười bảy — đó là một kết quả, và nó
     không phải đi vay ở đâu: nó nằm sẵn trên bàn cờ của chính nhà mình.

     So với chuỗi trước, KHÔNG so với nhà khác. Luật 11 đã cấm bảng vàng;
     chỗ này là cái thay thế duy nhất còn đúng — vì nhà mình tháng trước
     và nhà mình tháng này thì cùng một hoàn cảnh. */
  G.bcVongDo = function (tang) {
    var v = G.bcVong(tang); if (!v) return null;
    var s = soCua(tang), d0 = ngayDau(s), canVai = G.bcVaiNha();
    var nayI = d0 ? Math.floor((new Date(G.bcNgay() + 'T00:00:00').getTime() -
      new Date(d0 + 'T00:00:00').getTime()) / 86400000) : -1;
    /* Đếm ô đầy trong DEM ngày đầu của vòng k. Dùng cho cả phép đếm cả
       vòng lẫn phép so cùng độ dài. */
    function dem(k, sl) {
      var soO = 0, tong = 0, dai = 0, chay = 0;
      for (var i = 0; i < sl; i++) {
        var q = d0 ? oChuan(s[ngayThu(d0, k * v.dai + i)]) : null;
        if (!q) { chay = 0; continue; }
        tong += diemO(q);
        if (oDay(q, canVai)) { soO++; chay++; if (chay > dai) dai = chay; }
        else chay = 0;
      }
      return { soO: soO, tong: tong, chuoiDai: dai };
    }
    var ra = [];
    for (var k = 0; k < v.soVong; k++) {
      var d = dem(k, v.dai);
      /* TRẠNG THÁI CỦA VÒNG — và vì sao nó quyết định được phép so gì.
         Vòng chưa tới thì mọi con số của nó là 0, và "0 ô, kém 7 ô so
         với vòng trước" là một lời trách về một việc chưa tới lượt làm.
         Vòng ĐANG ĐI thì mới đi được mấy ngày, đem so với một vòng đã
         trọn hai mươi mốt ngày là so nửa chuỗi với cả chuỗi — con số ra
         luôn âm, và nó âm vì lịch chứ không vì nhà mình. */
      var tt = nayI < 0 ? 'chuaToi'
        : nayI >= (k + 1) * v.dai ? 'xong'
        : nayI >= k * v.dai ? 'dangDi' : 'chuaToi';
      var ngThu = tt === 'dangDi' ? nayI - k * v.dai + 1 : null;
      var truoc = k > 0 ? ra[k - 1] : null;
      ra.push({ vong: k + 1, dai: v.dai, soO: d.soO, tong: d.tong, chuoiDai: d.chuoiDai,
        trangThai: tt, ngayThu: ngThu,
        /* Chỉ so hai vòng ĐỀU ĐÃ TRỌN. */
        hon: (tt === 'xong' && truoc && truoc.trangThai === 'xong')
          ? d.soO - truoc.soO : null,
        /* Vòng đang đi thì so CÙNG ĐỘ DÀI: vòng trước tới đúng ngày thứ
           ấy đã có mấy ô. Đó là phép so duy nhất còn công bằng, và nó
           chính là thứ cần nhất trong quãng dài không có gì để nhìn. */
        truocCungNgay: (tt === 'dangDi' && truoc) ? dem(k - 1, ngThu).soO : null });
    }
    return ra;
  };

  /* ═══════════ MỐI NỐI GIỮA HAI VÒNG ═══════════
     Tầng ba đòi 'bốn chuỗi hai mươi mốt ngày NỐI NHAU'. Nối nhau là
     chuyện của đúng một cái khớp: tối cuối chuỗi này và tối đầu chuỗi
     sau. Đó cũng đúng là chỗ người ta dừng — xong một chuỗi thì thấy đã
     xong, và tối hôm sau không ai mở màn này nữa.

     HIỆN RA CHỨ KHÔNG PHẠT. Luật 8 đã nói ô trống là ô trống. Mối nối
     hở thì màn nói hở, không trừ điểm, không đỏ lên. Và chỉ nói về mối
     nối ĐÃ QUA — báo hở một cái khớp còn chưa tới là bịa. */
  /* ═══════════ NHỊP CỦA MỘT BÀN ═══════════
     Ô đầy chia cho số ngày ĐÃ QUA của bàn ấy — không chia cho cả tầng,
     vì bàn đang đi dở mà chia cho 365 thì tầng nào đang đi cũng "kém". */
  function nhipBan(tang) {
    var s = soCua(tang), d0 = ngayDau(s); if (!d0) return null;
    var canVai = G.bcVaiNha(), can = G.bcSoNgay(tang) || 0;
    var qua = Math.floor((new Date(G.bcNgay() + 'T00:00:00').getTime() -
      new Date(d0 + 'T00:00:00').getTime()) / 86400000) + 1;
    if (can && qua > can) qua = can;
    if (qua < 1) return null;
    var soO = 0;
    Object.keys(s).forEach(function (n) {
      if (oDay(oChuan(s[n]), canVai)) soO++;
    });
    if (soO > qua) soO = qua;
    return { soO: soO, qua: qua, ty: soO / qua };
  }

  /* ═══════════ 'MÀ NHỊP NHÀ MÌNH KHÔNG TỤT' ═══════════
     Thử thách tầng năm có HAI vế: 'Kèm một nhà mới đi hết mùa đầu của
     họ, MÀ NHỊP NHÀ MÌNH KHÔNG TỤT.' Vế thứ hai là một điều kiện thật,
     và nó đo được ngay trên hai cái bàn nhà mình đã có — không cần thêm
     dữ liệu nào.

     Đọc điều kiện TỪ CÂU của kho chứ không gắn cứng vào T5: tầng nào
     khai câu ấy thì tầng ấy được đo. Gắn cứng thì mai kho đổi câu mà
     máy vẫn đo, hoặc kho thêm câu ấy cho tầng khác mà máy im.

     Đây cũng chính là chỗ tầng năm dễ hỏng nhất trong đời thật: dồn hết
     sức cho nhà mình đang kèm, còn nếp nhà mình thì tụt — và tụt trong
     lúc đang làm gương thì hỏng cả hai nhà. */
  G.bcNhipKhongTut = function (tang) {
    if (!/nhịp nhà mình không tụt/i.test(G.bcThuThach(tang) || '')) return null;
    var i = MA_TANG.indexOf(tang);
    if (i <= 0) return { chuaDo: true, thieu: 'Tầng này không có tầng trước để so.' };
    var truoc = MA_TANG[i - 1];
    var n = nhipBan(tang);
    if (!n) return { chuaDo: true, thieu: 'Bàn tầng ' + tang.slice(1) + ' chưa có ô nào.' };
    var t = nhipBan(truoc);
    if (!t) return { chuaDo: true, tenTruoc: truoc,
      thieu: 'Chưa có bàn cờ tầng ' + truoc.slice(1) + ' trên máy này để so nhịp.' };
    var chenh = Math.round(n.ty * 100) - Math.round(t.ty * 100);
    return { chuaDo: false, tang: tang, tangTruoc: truoc,
      nay: n, truoc: t, chenh: chenh, tut: chenh < 0,
      la: 'Nhịp bây giờ ' + Math.round(n.ty * 100) + '% · tầng ' + truoc.slice(1) + ' là ' +
        Math.round(t.ty * 100) + '%' };
  };

  /* ═══════════ TẦNG MỘT: BÀN CỜ BẢO LÀM, MÀ TẦNG BẢO ĐỪNG ═══════════

     Cú hích của tầng một hứa nguyên văn: 'Cả nhà cùng ghi nhật ký bảy
     tối. KHÔNG SỬA GÌ CẢ. Cuối tuần đọc lại và chỉ ra một mô thức lặp.'

     Còn bàn cờ thì bày ra mười việc kèm điểm số và mời làm ngay tối
     nay. Một nhà tầng một đọc màn ấy sẽ bắt đầu đổi giờ học, đặt luật
     mới, sửa chỗ này chỗ kia — và bảy ngày ghi được sẽ là đường nền ĐÃ
     BỊ BÓP, không phải đường nền thật. Cả tầng một chỉ có một việc duy
     nhất là lấy cho được đường nền thật ấy.

     Không luật nào của bàn cờ bị vi phạm ở đây. Nhưng bàn cờ đang mời
     làm đúng cái mà tầng đang cấm, và nó mời bằng điểm số.

     Nên tầng nào có cú hích khai câu ấy thì màn NÓI NGAY TRÊN BÀN, kèm
     chỗ đọc ra. Đọc từ câu chứ không gắn cứng vào T1: mai kho đổi câu
     thì máy đổi theo, mà kho khai câu ấy cho tầng khác thì máy cũng nói. */
  G.bcKhongSua = function (tang) {
    var ch = (G.CUHICH || []).filter(function (x) { return x.tier === tang; })[0];
    var m = /(không sửa gì cả[^\.]*)\./i.exec((ch && ch.hua) || '');
    if (!m) return null;
    /* Vì sao — lấy từ chính việc nhỏ khai điều ấy trong bánh đà, không
       viết lại ở đây. BD1-03 'Không sửa gì trong bảy ngày'. */
    var vi = null, viec = null;
    (G.BD_LON || []).forEach(function (b) {
      (b.nho || []).forEach(function (n) {
        if (!vi && /không sửa gì/i.test(n.ten || '')) { vi = n.thay; viec = n.ma; }
      });
    });
    return { cau: m[1], docTu: 'CUHICH.' + ch.ma + '.hua', vi: vi, viecDocTu: viec };
  };

  /* ═══════════ MỘT MÔ THỨC LẶP, KHOANH Ở CUỐI ═══════════
     Cũng từ câu ấy: 'CUỐI TUẦN đọc lại và chỉ ra một mô thức lặp.' Và
     bánh đà một khai hai việc nhỏ đúng cho chỗ này: BD1-09 'Khoanh một
     nếp — chọn đúng MỘT thứ lặp lại đủ để gọi là nếp' và BD1-10 'Nói
     lại nếp ấy bằng lời của mình, không dùng chữ của Học viện'.

     KHOANH SỚM THÌ KHÔNG CHO KHOANH. Khoanh nếp ở tối thứ hai là rút
     kết luận từ hai tối — đúng cái sai mà cả tầng một dựng lên để
     tránh. Đây là chỗ DUY NHẤT trong bàn cờ có cổng, và nó có cổng vì
     kho khai chữ 'cuối tuần' chứ không phải vì tôi thấy nên có. */
  G.bcNepDoi = function (tang) {
    var ch = (G.CUHICH || []).filter(function (x) { return x.tier === tang; })[0];
    if (!/chỉ ra một mô thức lặp/i.test((ch && ch.hua) || '')) return null;
    var can = G.bcSoNgay(tang), s = soCua(tang), d0 = ngayDau(s);
    var qua = d0 ? Math.floor((new Date(G.bcNgay() + 'T00:00:00').getTime() -
      new Date(d0 + 'T00:00:00').getTime()) / 86400000) + 1 : 0;
    return { docTu: 'CUHICH.' + ch.ma + '.hua', can: can, qua: qua,
      moDuoc: !!(can && qua >= can), conThieu: can ? Math.max(0, can - qua) : null,
      daGhi: G.bcNep(tang) };
  };
  G.bcNep = function (tang) {
    return ((G.S && G.S.bcNep) || {})[tang] || null;
  };
  G.bcGhiNep = function (tang, nep, loiMinh) {
    var d = G.bcNepDoi(tang);
    if (!d) return { ok: false, y: 'Tầng này không khai việc khoanh một nếp.' };
    if (!d.moDuoc) return { ok: false, y: 'Còn ' + d.conThieu +
      ' tối nữa. Khoanh nếp ở giữa chặng là rút kết luận từ mấy tối, ' +
      'mà cả chặng này dựng lên để tránh đúng chuyện ấy.' };
    if (!String(nep || '').trim()) return { ok: false, y: 'Chưa ghi được — nếp để trống.' };
    if (!String(loiMinh || '').trim()) return { ok: false, y:
      'Còn thiếu câu nói lại bằng lời của nhà mình. Nhắc đúng thuật ngữ thì chưa phải là hiểu.' };
    G.S.bcNep = G.S.bcNep || {};
    G.S.bcNep[tang] = { nep: String(nep).trim(), loi: String(loiMinh).trim(),
      ngay: G.bcNgay() };
    if (G.save) G.save();
    return { ok: true };
  };

  /* ═══════════ VẾ MỘT CỦA TẦNG NĂM: KÈM MỘT NHÀ ═══════════

     Chủ hệ thống chốt ba việc, và không việc nào đẻ ra một con số mới:

       · nhà nào đang được kèm, bắt đầu hôm nào  → nhà mình khai
       · 'mùa đầu' dài theo QUY ĐỊNH CỦA TỪNG TẦNG (nhập tầng một là bảy
         ngày)                                    → ĐỌC từ HP_NGAY
       · nhà được kèm đi đúng chu kỳ tầng, KHÔNG ĐƯỢC VƯỢT khi chưa
         hoàn thành KPI                           → cổng đã khai sẵn

     MÁY NÀY BIẾT LỊCH, KHÔNG BIẾT KPI CỦA NHÀ KIA

     Số ngày và chu kỳ của tầng thì tính được hết ngay trên máy này.
     Nhưng KPI của nhà kia nằm ở máy chủ và ở gói nghề, không ở đây —
     nên màn nói THẲNG là chưa đo được, và tuyệt đối không suy ra một
     con số KPI từ cái lịch. Hết ngày không phải là xong tầng; lấy lịch
     thay cho KPI đúng là cái mà luật của chủ hệ thống vừa cấm.

     Máy nghề mở được DOLUONG_KH và HP_KICHBAN thì màn dẫn NGUYÊN VĂN
     ngưỡng và câu cổng ở đó ra. Chép lại hai câu ấy vào tệp này là dựng
     bản thứ hai của một luật — và hai bản thì sẽ có ngày lệch nhau. */
  G.bcKem = function () { return (G.S && G.S.bcKem) || null; };

  G.bcDatKem = function (ten, tang, batDau) {
    if (!String(ten || '').trim()) return { ok: false, y: 'Chưa có tên nhà mình đang kèm.' };
    if (MA_TANG.indexOf(tang) < 0)
      return { ok: false, y: 'Tầng phải là một trong: ' + MA_TANG.join(' · ') };
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(batDau || '')))
      return { ok: false, y: 'Ngày bắt đầu ghi theo dạng NĂM-THÁNG-NGÀY, ví dụ 2026-09-01.' };
    if (batDau > G.bcNgay())
      return { ok: false, y: 'Ngày bắt đầu nằm ở tương lai. Nhà kia chưa bắt đầu thì chưa có gì để đo.' };
    G.S.bcKem = { ten: String(ten).trim(), tang: tang, batDau: batDau };
    if (G.save) G.save();
    return { ok: true };
  };
  G.bcXoaKem = function () { if (G.S) delete G.S.bcKem; if (G.save) G.save(); return true; };

  /* Cổng lên tầng — ĐỌC từ chỗ đã khai, không chép lại.
       DOLUONG_KH.chiSo  chỉ số nào có chữ 'không cho lên tầng' trong ngưỡng
       HP_KICHBAN.khong  câu 'không mở … khi … chưa nghiệm thu'
     Cả hai ở gói NGHỀ. Máy gia đình không mở được, và lúc ấy màn nói
     thiếu gì kèm tên kho — không tự đặt ra một ngưỡng cho đủ ô. */
  G.bcKemCong = function (tang) {
    var m4 = (((G.DOLUONG_KH || {}).chiSo) || []).filter(function (x) {
      return /không cho lên tầng/i.test(x.nguong || '');
    })[0];
    var kb = (G.HP_KICHBAN || []).filter(function (x) { return x.tang === tang; })[0];
    var cau = kb ? (kb.khong || []).filter(function (c) {
      return /chưa nghiệm thu/i.test(c); })[0] : null;
    if (!m4 && !cau) return { chuaDo: true,
      thieu: 'Ngưỡng KPI lên tầng và câu cổng nghiệm thu nằm ở gói NGHỀ ' +
        '(DOLUONG_KH · HP_KICHBAN). Máy này chưa mở được, nên màn không nói một con số nào.' };
    return { chuaDo: false,
      chiSo: m4 ? { ma: m4.ma, ten: m4.ten, cach: m4.cach, nguong: m4.nguong } : null,
      cauKhong: cau || null,
      docTu: [m4 ? 'DOLUONG_KH.' + m4.ma : null, cau ? 'HP_KICHBAN.' + kb.ma + '.khong' : null]
        .filter(Boolean).join(' · ') };
  };

  /* ═══════════ NHÀ KÈM ĐƯỢC XEM GÌ CỦA NHÀ KIA ═══════════
     Chủ hệ chốt ba việc, và ba việc ấy là ba câu trả lời khác nhau:

       bàn cờ    ĐƯỢC — thấy chỗ dày chỗ thưa mới kèm được đúng chỗ
       KPI       ĐƯỢC — để động viên khích lệ
       nhiệm vụ  KHÔNG — việc nhà kia chọn tối nay là việc riêng của họ

     Vì sao vạch đúng ở đó: nhìn HÌNH của bàn cờ là biết nhà kia đang
     đuối tuần nào — đủ để hỏi một câu đúng lúc. Nhìn TỪNG VIỆC là biết
     tối qua bố họ chọn gì, mẹ họ chọn gì; đó không còn là kèm nữa, đó
     là đọc nhật ký của một nhà khác.

     LỌC Ở ĐÂY, KHÔNG LỌC Ở MÀN HÌNH

     Luật của kho: lọc trên màn hình KHÔNG phải bảo vệ dữ liệu — gửi
     xuống rồi thì mở công cụ nhà phát triển là đọc được hết. Nên bàn cờ
     của nhà kia phải đi qua cổng này TRƯỚC khi vào máy, và cái ra khỏi
     cổng không còn mang mã việc lẫn mã bánh đà. */
  G.bcKemLoc = function (ban) {
    if (!ban || typeof ban !== 'object') return null;
    var ra = {};
    Object.keys(ban).forEach(function (n) {
      var q = oChuan(ban[n]); if (!q) return;
      var vai = {};
      Object.keys(q.vai).forEach(function (v) {
        /* Giữ ĐÚNG hai thứ: có làm hay không, và màu để vẽ. Bỏ `ma`
           (việc nào) và `bd` (bánh đà nào) — hai cột ấy chính là
           "nhiệm vụ được giao". `diem` cũng bỏ: điểm của từng ô lần
           ngược ra được trọng số, mà trọng số lần ra tầng của việc. */
        vai[v] = { c: q.vai[v].c || null };
      });
      ra[n] = { vai: vai };
    });
    return ra;
  };
  G.bcKemXem = function () {
    var x = (G.BC_KEM_LUAT || {}).xem || {};
    return { banCo: x.banCo === true, kpi: x.kpi === true, nhiemVu: x.nhiemVu === true };
  };

  G.bcKemDo = function () {
    var k = G.bcKem(); if (!k) return null;
    var can = G.bcSoNgay(k.tang);
    if (!can) return { ten: k.ten, tang: k.tang, chuaDo: true,
      thieu: 'Số ngày của tầng ' + k.tang.slice(1) + ' đọc từ bảng học phí, mà máy này ' +
        'chưa mở được bảng ấy.' };
    var qua = Math.floor((new Date(G.bcNgay() + 'T00:00:00').getTime() -
      new Date(k.batDau + 'T00:00:00').getTime()) / 86400000) + 1;
    var v = G.bcVong(k.tang), vongNao = null, ngayTrongVong = null, ngoaiVong = false;
    if (v) {
      if (qua > v.soVong * v.dai) ngoaiVong = true;
      else { vongNao = Math.floor((qua - 1) / v.dai) + 1; ngayTrongVong = qua - (vongNao - 1) * v.dai; }
    }
    return { chuaDo: false, ten: k.ten, tang: k.tang, batDau: k.batDau,
      muaDau: can, qua: qua, conLai: Math.max(0, can - qua), hetLich: qua >= can,
      vong: v, vongNao: vongNao, ngayTrongVong: ngayTrongVong, ngoaiVong: ngoaiVong,
      cong: G.bcKemCong(k.tang) };
  };

  G.bcDoiGiKhiXong = function (tang) {
    var t = (G.HT_TANG || []).filter(function (x) { return x.ma === tang; })[0];
    return (t && t.doiGiKhiXong) || null;
  };

  G.bcMoiNoi = function (tang) {
    var v = G.bcVong(tang); if (!v || v.soVong < 2) return null;
    var s = soCua(tang), d0 = ngayDau(s); if (!d0) return null;
    var canVai = G.bcVaiNha();
    var daQua = Math.floor((new Date(G.bcNgay() + 'T00:00:00').getTime() -
      new Date(d0 + 'T00:00:00').getTime()) / 86400000);
    var ra = [];
    for (var k = 1; k < v.soVong; k++) {
      var iDau = k * v.dai;
      if (iDau > daQua) break;
      var a = oChuan(s[ngayThu(d0, iDau - 1)]), b = oChuan(s[ngayThu(d0, iDau)]);
      ra.push({ tu: k, den: k + 1,
        noi: !!(a && oDay(a, canVai)) && !!(b && oDay(b, canVai)) });
    }
    return ra.length ? ra : null;
  };

  /* ═══════════ TẦNG KHÔNG KHAI VÒNG THÌ CHIA THEO THÁNG LỊCH ═══════════
     Tầng năm dài ba trăm sáu lăm ngày và kho KHÔNG khai vòng nào cho
     nó. Đổ cả ba trăm sáu lăm ô thành một khối thì không ai định vị
     được mình đang ở đâu — mà bàn cờ tồn tại chính là để nhìn ra "chỗ
     nào dày, chỗ nào thưa".

     Chia theo THÁNG LỊCH, và nói rõ đó là lịch. Tháng là thứ có sẵn
     ngoài đời, không phải một cái vòng tôi nghĩ ra cho đều bảng — nếu
     đặt ra một số vòng ở đây thì đúng bằng việc khai một con số kho
     chưa khai, và cả tệp này dựng lên để tránh chuyện ấy. */
  var TEN_THANG = ['Tháng một', 'Tháng hai', 'Tháng ba', 'Tháng tư', 'Tháng năm', 'Tháng sáu',
    'Tháng bảy', 'Tháng tám', 'Tháng chín', 'Tháng mười', 'Tháng mười một', 'Tháng mười hai'];
  function veTheoThang(tang, can, s, d0) {
    var canVai = G.bcVaiNha(), homNay = G.bcNgay();
    var khoi = [], truoc = null;
    for (var i = 0; i < can; i++) {
      var ng = ngayThu(d0, i), k = ng.slice(0, 7);
      if (k !== truoc) { khoi.push({ k: k, tu: i, dem: 0, soO: 0, qua: 0 }); truoc = k; }
      var b = khoi[khoi.length - 1];
      b.dem++;
      if (ng <= homNay) b.qua++;
      var q = oChuan(s[ng]);
      if (q && oDay(q, canVai)) b.soO++;
    }
    return khoi.map(function (b) {
      var th = Number(b.k.slice(5, 7)) - 1, nam = b.k.slice(0, 4);
      return '<div class="bc-vong thang">' +
        '<div class="bc-vong-d"><b>' + TEN_THANG[th] + '</b><span>' + nam + ' · ' +
        b.dem + ' ngày</span></div>' +
        veO(tang, s, d0, b.tu, b.dem) +
        '<p class="bc-vong-so' + (b.qua ? '' : ' dim') + '">' +
        (b.qua
          ? '<b>' + b.soO + '</b>/' + b.qua + ' ô' +
            (b.qua < b.dem ? ' · còn ' + (b.dem - b.qua) + ' ngày chưa tới' : '')
          : 'Chưa tới tháng này.') + '</p></div>';
    }).join('');
  }

  function veBan(tang, can, s) {
    if (!can) return '';
    var d0 = ngayDau(s);
    /* Tầng có vòng thì vẽ theo vòng; tầng dài mà không khai vòng thì
       chia theo tháng lịch; còn lại một dải. Không tự đặt ra một số
       vòng cho đều bảng — tầng một và tầng năm thật sự không khai vòng
       nào ở kho, và nói KHÔNG CÓ là câu đúng. */
    var v = G.bcVong(tang);
    if (v && v.soVong > 1) return veTheoVong(tang, can, s, v);
    if (!v && can > 90 && d0) return veTheoThang(tang, can, s, d0);
    return veO(tang, s, d0, 0, can);
  }

  function veO(tang, s, d0, tu, dem) {
    /* Một chuỗi hai mươi mốt ngày vẽ thành MỘT HÀNG hai mươi mốt ô —
       vì kho gọi nó là "chuỗi", và một chuỗi bẻ làm ba dòng thì mắt đọc
       ra ba tuần rời chứ không đọc ra một chuỗi. */
    var cot = dem <= 7 ? 7 : dem <= 21 ? dem : dem <= 90 ? 15 : 28;
    var o = '<div class="bc-ban" style="--bc-cot:' + cot + '">';
    var canVai = G.bcVaiNha(), homNay = G.bcNgay();
    for (var i = tu; i < tu + dem; i++) {
      var ng = d0 ? G.bcNgay(new Date(new Date(d0 + 'T00:00:00').getTime() + i * 86400000)) : null;
      var q = ng ? oChuan(s[ng]) : null;
      /* Ô CHƯA TỚI khác ô đã qua mà để trống. Bàn tầng năm có ba trăm
         sáu lăm ô, và tối đầu tiên nhà mình mở ra đã thấy ba trăm sáu
         tư ô xám — trông y như ba trăm sáu tư lần bỏ lỡ. Không có luật
         nào bị vi phạm ở đây (ô trống vẫn không trừ điểm), nhưng cái
         nhìn nói dối, và người ta bỏ vì cái nhìn chứ không vì luật. */
      if (!q) {
        o += '<i class="bc-o' + (ng && ng > homNay ? ' sau' : '') + '"></i>';
        continue;
      }
      /* Ô chia sọc theo vai: mỗi người một sọc, sọc có màu là người ấy
         đã làm. Nhìn một ô là biết tối ấy ai có mặt ai vắng — thứ một
         ô đặc một màu không nói được. */
      var n2 = canVai.length, sac = [], b2 = 100 / n2;
      canVai.forEach(function (v, k) {
        var xong = !!q.vai[v.ma] || !!q.vai._cu;
        var mau = xong ? (q.vai[v.ma] ? q.vai[v.ma].c : v.c) : 'transparent';
        sac.push(mau + ' ' + (k * b2).toFixed(2) + '% ' + ((k + 1) * b2).toFixed(2) + '%');
      });
      var du = oDay(q, canVai);
      var mo = canVai.filter(function (v) { return q.vai[v.ma]; })
        .map(function (v) { return v.ten; }).join('+') || 'đã đặt';
      o += '<i class="bc-o co' + (du ? ' du' : ' dang') + '" style="background:linear-gradient(180deg,' +
        sac.join(',') + ')" title="' + h(ng + ' · ' + mo + ' · +' + diemO(q)) + '"></i>';
    }
    return o + '</div>';
  }

  function gyTen(ma) {
    var r = null;
    (G.BD_LON || []).forEach(function (b) {
      (b.nho || []).forEach(function (x) { if (x.ma === ma) r = x; });
    });
    return r;
  }

  G.VIEWS['ban-co'] = function () {
    if (!G.BD_LON || !G.BC_TRONGSO)
      return U.empty('Chưa mở được bàn cờ', 'Phần này nằm trong gói nền. Đăng nhập lại để nạp.');

    var loi = G.BC_LOI || {};
    var tang = G.S.bcTang || 'T1';
    var s = soCua(tang), d = G.bcDo(tang);

    var o = U.ph({ eyebrow: 'BÀN CỜ HÀNH TRÌNH', ic: 'target', grad: 1,
      t: loi.la || '', lead: loi.viBanCo || '' });

    /* ── Chọn tầng ── */
    o += '<div class="row wrap mb" style="gap:8px">' + MA_TANG.map(function (t) {
      var n = G.bcSoNgay(t);
      return '<button class="btn ' + (t === tang ? 'pri' : 'ghost') + ' sm" data-bctang="' + t + '">' +
        'Tầng ' + t.slice(1) + (n ? '<span class="muted"> · ' + n + ' ngày</span>' : '') + '</button>';
    }).join('') + '</div>';

    if (!d.can) {
      o += '<div class="card mb"><p class="sm">Số ngày của tầng đọc từ bảng học phí, mà bảng ấy ' +
        'nằm ở gói nghề — máy này chưa mở được. Bàn cờ chưa biết mình dài bao nhiêu ô, nên ' +
        'chưa vẽ ra. Mười gợi ý bên dưới vẫn dùng được.</p></div>';
    } else {
      o += '<div class="bc-dinh">' +
        '<div class="bc-so"><b>' + d.soO + '</b><span>/ ' + d.can + ' ô đã có màu</span></div>' +
        '<div class="bc-so"><b>' + d.tong + '</b><span>điểm KPI</span></div>' +
        '<div class="bc-so"><b>' + d.chuoi + '</b><span>ngày liên tiếp</span></div>' +
        '<div class="bc-so"><b>' + d.soBanhDa + '</b><span>/ 10 bánh đà đã chạm</span></div></div>';
      /* Vòng: nói ngay dưới bàn, và nói ĐỌC TỪ ĐÂU — con số vòng không
         phải tôi đặt, nó nằm sẵn trong tên chặng hoặc lời hứa cú hích. */
      var vg = G.bcVong(tang);
      /* Thử thách của tầng, in NGUYÊN CÂU của kho. Tầng ba: 'Đi bốn
         chuỗi hai mươi mốt ngày nối nhau, và qua được cơn chán ở giữa.'
         Câu ấy nói đúng hai việc phải làm, và cả hai đều đo được trên
         chính bàn này — nên nó phải đứng ngay trên bàn. */
      var tt = G.bcThuThach(tang);
      if (tt) o += '<p class="bc-thuthach"><b>Việc của tầng này:</b> ' + h(tt) + '</p>';
      /* Cảnh báo đứng TRÊN bàn và trên mười gợi ý. Đứng dưới thì nhà
         mình đã đọc xong danh sách việc rồi mới gặp câu bảo đừng làm. */
      var ks = G.bcKhongSua(tang);
      if (ks) o += '<div class="bc-dung"><b>' + h(ks.cau.toUpperCase()) + '</b>' +
        '<p>Chặng này chỉ có một việc: NHÌN và GHI. Mười gợi ý bên dưới đều là việc ' +
        'nhìn và ghi — không phải việc sửa.</p>' +
        (ks.vi ? '<p>' + h(ks.vi) + '</p>' : '') +
        '<p class="dim">(đọc từ ' + h(ks.docTu) +
        (ks.viecDocTu ? ' · ' + h(ks.viecDocTu) : '') + ')</p></div>';
      /* Tầng nào khai điều kiện 'nhịp nhà mình không tụt' thì ĐO nó ngay
         ở đây. Điều kiện in ra mà không ai đo thì nó chỉ là một câu văn. */
      /* Vế MỘT của thử thách đứng trước vế HAI, đúng thứ tự trong câu. */
      if (/kèm một nhà/i.test(tt || '')) o += veKem();
      var nk = G.bcNhipKhongTut(tang);
      if (nk) o += veNhip(nk);
      if (!G.bcVong(tang))
        o += '<p class="bc-y dim">Kho không khai vòng nào cho tầng này' +
          (d.can > 90 ? ' — bàn chia theo THÁNG LỊCH để nhìn được. Tháng là lịch, ' +
            'không phải một vòng.' : '.') + '</p>';
      if (vg) o += '<p class="bc-y"><b>' + h(vg.la) + '</b> · ' +
        h((G.BC_VONG_LUAT || {}).motBienMotVong || '') +
        ' <span class="dim">(đọc từ ' + h(vg.docTu) + ')</span></p>';
      o += veBan(tang, d.can, s);
      /* Mối nối: nói ngay dưới bàn, và nói nó KHÔNG phải hình phạt —
         nếu không thì một cái khớp hở đọc thành một lời trách. */
      var mn = G.bcMoiNoi(tang);
      if (mn) {
        var ho = mn.filter(function (x) { return !x.noi; }).length;
        o += '<p class="bc-y"><b>Mối nối giữa các ' + h(vg.ten) + ': ' +
          (mn.length - ho) + '/' + mn.length + ' nối được.</b> ' +
          h((G.BC_VONG_LUAT || {}).viMoiNoi || '') + '</p>';
      }
      /* Chỗ khó BÁO TRƯỚC, không đợi tới lúc nó tới. Câu này nằm ở
         HT_TANG.khoNhat từ bản 9.21 mà chưa màn nào nói ra đúng lúc. */
      var kn = G.bcKhoNhat(tang);
      if (kn) o += '<div class="bc-baotruoc"><b>Chỗ khó nhất của tầng này — nói trước</b>' +
        '<p>' + h(kn) + '</p>' +
        '<p class="dim">' + h((G.BC_VONG_LUAT || {}).viBaoTruoc || '') + '</p></div>';
      /* Khoanh nếp — đứng ngay dưới bàn, vì nó là việc ĐỌC LẠI cái bàn. */
      var nd = G.bcNepDoi(tang);
      if (nd) o += veNep(tang, nd);
      /* Xong tầng thì nói ra nhà mình vừa đổi được gì. Câu ấy nằm ở
         HT_TANG.doiGiKhiXong từ lâu mà chưa màn nào nói ra đúng lúc —
         và đúng lúc của nó là lúc bàn vừa kín. */
      if (d.xong) {
        var dx = G.bcDoiGiKhiXong(tang);
        if (dx) o += '<div class="bc-doi"><b>Bàn này đã kín. Nhà mình đổi được gì</b>' +
          '<p>' + h(dx) + '</p></div>';
      }
      o += '<p class="bc-y">' + h(loi.viKienTri || '') + '</p>';
    }

    /* ── Mốc vừa chạm ── */
    var moc = G.bcMocDat(tang);
    if (moc)
      o += '<div class="bc-mung"><span class="bc-bt">' + h(moc.bieuTuong) + '</span>' +
        '<div><b>' + h(moc.loi) + '</b><p>' + h(moc.phu) + '</p></div></div>';

    /* ── TỐI NAY: BA NGƯỜI, MỘT QUÂN ── */
    var canVai = G.bcVaiNha();
    var chuaXong = d.vaiHomNay.filter(function (v) { return !v.xong; });
    o += U.sec('TỐI NAY — MỘT QUÂN LÀ ' + canVai.length + ' VIỆC',
      (G.BC_VAI_LUAT || {}).cot || '');
    o += '<div class="bc-toinay">' + d.vaiHomNay.map(function (v) {
      return '<div class="bc-nguoi' + (v.xong ? ' xong' : '') + '" style="--bc-c:' + v.c + '">' +
        '<div class="bc-nguoi-d"><b>' + h(v.ten) + '</b>' +
        '<span>' + (v.xong ? '✓ xong' : 'chưa chọn') + '</span></div>' +
        (v.xong
          ? '<p class="bc-nguoi-v">' + h((gyTen(v.viec.ma) || {}).ten || v.viec.ma) + '</p>' +
            '<span class="bc-nguoi-d2">+' + v.viec.diem + '</span>'
          : '<p class="bc-nguoi-v dim">Chọn một việc trong mười gợi ý bên dưới.</p>') +
        '</div>';
    }).join('') + '</div>';
    o += '<p class="bc-y">' + h(d.daDatHomNay
      ? 'Ô hôm nay đã đầy. Cả nhà được thêm ' + canVai.length + ' điểm cho việc cùng nhau.'
      : 'Ô hôm nay còn chờ: ' + chuaXong.map(function (v) { return v.ten; }).join(' · ') +
        '. Công của người đã làm đã cộng rồi và không mất đi.') + '</p>';

    /* Ai đang cùng đi — sửa được */
    o += '<div class="row wrap mb" style="gap:8px;align-items:center">' +
      '<span class="tiny up" style="color:var(--ink-4)">AI TRONG NHÀ ĐANG CÙNG ĐI</span>' +
      (G.BC_VAI || []).map(function (v) {
        var co = canVai.filter(function (x) { return x.ma === v.ma; }).length > 0;
        return '<button class="btn ' + (co ? 'pri' : 'ghost') + ' sm" data-bcvai="' + v.ma + '">' +
          h(v.ten) + '</button>';
      }).join('') + '</div>';
    o += '<p class="tiny dim mb" style="line-height:1.7">' +
      h((G.BC_VAI_LUAT || {}).viKhongEpDuBa || '') + '</p>';

    /* ── Mười gợi ý, chọn cho từng người ── */
    var gy = G.bcGoiY(tang);
    o += U.sec('MƯỜI VIỆC GỢI Ý',
      chuaXong.length
        ? 'Bấm một việc rồi chọn việc ấy cho ai. ' + (G.BC_VAI_LUAT || {}).moiNguoiChonRieng
        : 'Tối nay cả nhà đã chọn xong. Mai chọn tiếp.');
    o += '<div class="bc-ds">' + gy.map(function (g) {
      return '<div class="bc-viec" style="--bc-c:' + g.c + '">' +
        '<span class="bc-diem">+' + g.diem + '</span>' +
        '<span class="bc-bd">' + h(g.banhDaTen) + ' · ' + h(g.mucTen) + '</span>' +
        '<b>' + h(g.ten) + '</b>' +
        '<span class="bc-lam">' + h(g.viec) + '</span>' +
        (g.thay ? '<span class="bc-thay">Rồi sẽ thấy: ' + h(g.thay) + '</span>' : '') +
        (chuaXong.length
          ? '<div class="bc-cho">' + chuaXong.map(function (v) {
              return '<button class="bc-nut" data-bcdat="' + h(g.ma) + '" data-bcvai2="' + v.ma +
                '" style="--bc-c:' + v.c + '">việc của ' + h(v.ten) + '</button>';
            }).join('') + '</div>'
          : '') + '</div>';
    }).join('') + '</div>';

    /* ── Ba mức trọng số, nói thẳng ── */
    o += U.sec('VÌ SAO VIỆC NÀY BA ĐIỂM, VIỆC KIA MỘT',
      (G.BC_TRONGSO_LUAT || {}).cot || '');
    o += '<div class="card mb">' + (G.BC_TRONGSO || []).map(function (t) {
      return '<div style="padding:9px 0;border-bottom:1px solid var(--gita-vien-2)">' +
        '<b class="sm">+' + t.diem + ' · ' + h(t.ten) + '</b>' +
        '<p class="sm mt" style="line-height:1.75">' + h(t.khi) + '</p>' +
        '<p class="tiny dim mt" style="line-height:1.7">' + h(t.vi) + '</p></div>';
    }).join('') + '</div>';
    o += '<p class="tiny dim mb" style="line-height:1.7"><b>' +
      h((G.BC_TRONGSO_LUAT || {}).viKhongXepHang || '') + '</b> ' +
      h((G.BC_TRONGSO_LUAT || {}).viKhongPhat || '') + '</p>';

    /* Đếm chứ không gõ tay. Nhan đề còn ghi "Sáu luật" trong khi kho đã
       có mười một — một con số gõ tay thì đứng yên trong lúc kho đi tiếp. */
    /* Việc còn chờ chủ hệ thống — in thẳng ra màn mỗi lần chạy. Nằm im
       trong một tệp ghi chú thì sáu tháng nữa vẫn nằm im ở đó. */
    var cc = (G.BC_CHOCHU || []).filter(function (x) {
      return String(x.o || '').indexOf('Tầng ' + tang.slice(1)) >= 0;
    });
    if (cc.length) {
      o += U.sec('CHƯA ĐO ĐƯỢC — CHỜ CHỦ HỆ THỐNG', '');
      o += '<div class="card mb">' + cc.map(function (x) {
        return '<div style="padding:9px 0;border-bottom:1px solid var(--gita-vien-2)">' +
          '<b class="sm">' + h(x.o) + '</b>' +
          '<p class="sm mt" style="line-height:1.75">' + h(x.hoi) + '</p>' +
          '<p class="tiny dim mt" style="line-height:1.7">' + h(x.vi) + '</p>' +
          '<p class="tiny dim mt" style="line-height:1.7"><b>Cần gì:</b> ' + h(x.canGi) +
          '</p></div>';
      }).join('') + '</div>';
    }

    o += U.sec((G.BC_LUAT || []).length + ' luật của bàn cờ', '');
    o += '<div class="card">' + (G.BC_LUAT || []).map(function (l) {
      return '<div style="padding:8px 0;border-bottom:1px solid var(--gita-vien-2)">' +
        '<b class="sm">' + l.no + '. ' + h(l.t) + '</b>' +
        '<p class="tiny dim mt" style="line-height:1.7">' + h(l.y) + '</p></div>';
    }).join('') + '</div>';
    return o;
  };

  /* ═══════════ BẤM ═══════════ */
  document.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('[data-bctang]');
    if (t) { G.S.bcTang = t.getAttribute('data-bctang'); G.render(); return; }
    var nb = e.target.closest && e.target.closest('[data-bcbien]');
    if (nb) {
      var vg = Number(nb.getAttribute('data-bcbien'));
      var cu = window.prompt('Câu quen cũ trong nhà (bỏ trống cũng được):', '');
      if (cu === null) return;
      var moi = window.prompt('Câu mới nhà mình muốn giữ suốt vòng này:', '');
      if (moi === null) return;
      if (!G.bcGhiBien(G.S.bcTang || 'T1', vg, cu, moi)) {
        if (U.toast) U.toast('Chưa ghi được — câu mới không được để trống.', 'err');
        return;
      }
      G.render(); return;
    }
    var km = e.target.closest && e.target.closest('[data-bckem]');
    if (km) {
      var cu = G.bcKem() || {};
      var tenK = window.prompt('Tên nhà mình đang kèm:', cu.ten || '');
      if (tenK === null) return;
      var tgK = window.prompt('Nhà ấy đang ở tầng nào (T1 · T2 · T3 · T4 · T5):', cu.tang || 'T1');
      if (tgK === null) return;
      var bdK = window.prompt('Nhà ấy bắt đầu hôm nào (NĂM-THÁNG-NGÀY, ví dụ 2026-09-01):',
        cu.batDau || G.bcNgay());
      if (bdK === null) return;
      var kk = G.bcDatKem(tenK, String(tgK || '').trim().toUpperCase(), String(bdK || '').trim());
      if (!kk.ok) { if (U.toast) U.toast(kk.y, 'err'); return; }
      G.render(); return;
    }
    var np = e.target.closest && e.target.closest('[data-bcnep]');
    if (np) {
      var tg = np.getAttribute('data-bcnep');
      var nep = window.prompt('Một thứ lặp lại đủ để gọi là nếp — đúng MỘT thôi:', '');
      if (nep === null) return;
      var loi = window.prompt('Nói lại nếp ấy bằng lời của nhà mình:', '');
      if (loi === null) return;
      var kn = G.bcGhiNep(tg, nep, loi);
      if (!kn.ok) { if (U.toast) U.toast(kn.y, 'err'); return; }
      if (typeof G.tinGhiSuKien === 'function') {
        G.tinGhiSuKien('NHAN_THUONG', { tang: tg, nep: String(nep).trim() });
        if (U.toast) U.toast('Đã khoanh một nếp. Ghi vào bảng tin của nhà mình.', 'ok');
      }
      G.render(); return;
    }
    var vv = e.target.closest && e.target.closest('[data-bcvai]');
    if (vv) {
      var ma = vv.getAttribute('data-bcvai');
      var nay = G.bcVaiNha().map(function (x) { return x.ma; });
      var i = nay.indexOf(ma);
      if (i >= 0) nay.splice(i, 1); else nay.push(ma);
      if (!G.bcDatVai(nay) && U.toast)
        U.toast('Phải có ít nhất một người cùng đi.', 'err');
      G.render(); return;
    }
    var v = e.target.closest && e.target.closest('[data-bcdat]');
    if (!v) return;
    var kq = G.bcDat(G.S.bcTang || 'T1', v.getAttribute('data-bcvai2'),
      v.getAttribute('data-bcdat'));
    if (!kq.ok) { if (U.toast) U.toast(kq.y, 'err'); return; }
    /* Điểm nổi lên ngay tại chỗ vừa bấm, TRƯỚC khi dựng lại màn. Dựng
       lại rồi mới nổi thì nút ấy đã biến mất và điểm nổi giữa hư không. */
    /* Ô vừa đầy thì nổi luôn cả điểm thưởng cùng nhau — hai con số nổi
       liền nhau là lúc nhà mình thấy rõ nhất việc cùng làm được thêm. */
    noiDiem(v, kq.diem);
    if (kq.thuong) setTimeout(function () { noiDiem(v, kq.thuong, true); }, 260);
    /* Ô vừa ĐẦY là một sự kiện thật của nhà mình — ghi vào sổ tin ngay,
       để bảng tin có cái chạy liên tục mà không phải đợi máy chủ. Chỉ
       ghi lúc ô ĐẦY, không ghi mỗi lần một người đặt: ghi ba lần một
       tối thì sổ thành tiếng ồn, và tiếng ồn thì người ta tắt. */
    if (kq.day) ghiTin(G.S.bcTang || 'T1');
    setTimeout(function () { G.render(); }, 620);
  });

  /* Sổ tin của nhà mình: ô đầy · mốc vừa chạm · kín bàn. Ba thứ ấy là
     sự kiện có thật, đo được ngay trong máy này — không con số nào phải
     đi mượn. */
  function ghiTin(tang) {
    if (typeof G.tinGhiSuKien !== 'function') return;
    var d = G.bcDo(tang), moc = G.bcMocDat(tang);
    var t = (G.HT_TANG || []).filter(function (x) { return x.ma === tang; })[0];
    G.tinGhiSuKien(d.xong ? 'XONG_CHANG' : 'NHAN_THUONG', {
      tang: tang, soTang: t ? t.so : null, soO: d.soO, can: d.can, diem: d.tong,
      moc: moc ? moc.ma : null, mocLoi: moc ? moc.loi : null,
      bieuTuong: moc ? moc.bieuTuong : null });
    /* Thông báo nổi ngay lúc làm xong, không đợi mở lại màn bảng tin.
       Không kèm tiếng — nhà mình mở màn này lúc chín giờ tối, cạnh đứa
       nhỏ đang ngủ (BC_MUNG_LUAT.khongAmThanh). */
    if (U.toast) U.toast((moc ? moc.bieuTuong + ' ' + moc.loi + ' ' : 'Ô hôm nay đã đầy. ') +
      'Đã ghi vào bảng tin của nhà mình.', 'ok');
  }

  function noiDiem(nut, diem, cungNhau) {
    try {
      var r = nut.getBoundingClientRect();
      var e = document.createElement('div');
      e.className = 'bc-noi' + (cungNhau ? ' cung' : '');
      e.textContent = '+' + diem + (cungNhau ? ' cùng nhau' : '');
      /* Kẹp vào trong khung nhìn. position:fixed lấy toạ độ của nút, mà
         nút có thể đang nằm dưới màn — lúc ấy chữ +3 nổi ngoài khung và
         không ai thấy phần thưởng của chính mình. Chỉ lộ ra khi bấm một
         nút ở cuối danh sách, nên đọc mã không thấy. */
      var W = window.innerWidth, H = window.innerHeight;
      e.style.left = Math.max(40, Math.min(W - 40, r.left + r.width / 2)) + 'px';
      e.style.top = Math.max(70, Math.min(H - 90, r.top + 12)) + 'px';
      document.body.appendChild(e);
      setTimeout(function () { if (e.parentNode) e.parentNode.removeChild(e); }, 1100);
    } catch (x) { /* nổi điểm hỏng thì không được làm hỏng việc đặt quân */ }
  }
})();
