/* ═══════════════════════════════════════════════════════════════
   GITA 365 — MÁY CHẠY MỘT HÀNH TRÌNH NĂM TẦNG

   Kho chuẩn ở kho-goc/data.hanh-trinh-5-tang.js.

   VIỆC CỦA TỆP NÀY: BẮT BỐN CÁI THANG NÓI CÙNG MỘT CÂU

   Kho có bốn thang cùng đo một người — năm tầng, mười bánh đà, bảy vùng
   đất, mười hai chặng. Ba cái đã nối vào năm tầng bằng khoá máy đọc
   được; cái thứ tư thì nối bằng văn xuôi trong cột ngày, tức là chưa
   nối.

   htSoiThangNoi() canh chỗ ấy. Nối bằng mắt người thì coi như chưa nối
   — mắt người không chạy trong bộ kiểm.

   htTangCua() là hàm dịch: đưa vào một vị trí ở bất kỳ thang nào, trả
   ra tầng. Có nó thì câu hỏi "nhà mình đang ở đâu" chỉ còn MỘT câu trả
   lời, dù hỏi từ thang nào.

   VÌ SAO CÓ htSoiKhongTangSau()

   Năm tầng cộng lại 848 ngày. Bộ tài liệu hứa mười năm. Cách dễ nhất
   để khớp là đặt thêm tầng 6, tầng 7 — và đó là cách sai, vì nó phá
   đúng thứ hệ này đã hứa ở GL_XONG: có một ngày hệ này xong việc.

   Cách đúng nằm sẵn trong kho từ trước: cột gồm của tầng 5 có dòng
   "vai dẫn dắt, nhà mình kèm một nhà mới". Sau tầng 5 là ĐỔI VAI sang
   thang của người đi kèm, không phải lên bậc.

   Hàm này canh để không ai đặt tầng thứ sáu — kể cả tôi ở bản sau.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;
G.VIEWS = G.VIEWS || {};

(function () {
  var U = G.U, h = U.h;
  var MA_TANG = ['T1', 'T2', 'T3', 'T4', 'T5'];

  /* ═══════════ HÀM DỊCH: MỌI THANG → TẦNG ═══════════ */
  G.htTangCua = function (thang, ma) {
    var i;
    if (thang === 'TANG') return MA_TANG.indexOf(ma) >= 0 ? [ma] : [];
    if (thang === 'BD') {
      var b = (G.BD_LON || []).filter(function (x) { return x.ma === ma || x.so === Number(ma); })[0];
      return b && b.tang ? [b.tang] : [];
    }
    if (thang === 'CHANG12') {
      var c = (G.HANHTRINH12 || []).filter(function (x) { return x.no === Number(ma); })[0];
      return c && c.tang ? [c.tang] : [];
    }
    if (thang === 'HANG') {
      var k = (G.KHACH_TANG || []).filter(function (x) { return x.ma === ma; })[0];
      return k && k.tangMa ? k.tangMa.slice() : [];
    }
    if (thang === 'VUNG') {
      /* Vùng nối GIÁN TIẾP: vùng → cấp bánh đà → bánh đà → tầng. Đây là
         chuỗi dài nhất trong kho, và cũng là chuỗi dễ đứt nhất — nên nó
         được canh riêng ở htSoiThangNoi(). */
      var v = (G.HM_VUNG || []).filter(function (x) { return x.ma === ma; })[0];
      if (!v) return [];
      var ra = [];
      for (i = Math.max(1, v.capTu); i <= v.capDen; i++) {
        var bd = (G.BD_LON || []).filter(function (x) { return x.so === i; })[0];
        if (bd && bd.tang && ra.indexOf(bd.tang) < 0) ra.push(bd.tang);
      }
      return ra;
    }
    return [];
  };

  /* ═══════════ MỌI THANG ĐỀU NỐI, VÀ NỐI BẰNG KHOÁ MÁY ĐỌC ═══════════ */
  G.htSoiThangNoi = function () {
    var loi = [];
    (G.HT_NOI || []).forEach(function (t) {
      /* Thang khai `goiNghe` mà máy này không có nó thì bỏ qua — máy của
         gia đình KHÔNG được nhận bảng hạng khách, và không nhận là đúng.
         Báo thiếu ở đây là dạy phép kiểm coi một lớp bảo vệ là một lỗi. */
      if (G[t.kho] === undefined) {
        if (t.goiNghe !== true) loi.push(t.ma + ':không thấy kho ' + t.kho);
        return;
      }
      if (!t.khoa) { loi.push(t.ma + ':không khai khoá nối'); return; }
      if (t.daNoi !== true) loi.push(t.ma + ':khai chưa nối');
    });

    /* Mười bánh đà: bánh nào cũng có tầng, và tầng ấy có thật */
    (G.BD_LON || []).forEach(function (b) {
      if (!b.tang || MA_TANG.indexOf(b.tang) < 0) loi.push('BD' + b.so + '→' + (b.tang || 'trống'));
    });
    /* Mười hai chặng: đây là thang bản 9.21 vừa nối */
    (G.HANHTRINH12 || []).forEach(function (c) {
      if (!c.tang || MA_TANG.indexOf(c.tang) < 0) loi.push('chặng ' + c.no + '→' + (c.tang || 'trống'));
    });
    /* Bốn hạng khách */
    (G.KHACH_TANG || []).forEach(function (k) {
      if (!Array.isArray(k.tangMa) || !k.tangMa.length) { loi.push('hạng ' + k.ma + ':không có tangMa'); return; }
      k.tangMa.forEach(function (m) { if (MA_TANG.indexOf(m) < 0) loi.push('hạng ' + k.ma + '→' + m); });
    });
    /* Bảy vùng: chuỗi gián tiếp phải ra được tầng, không được ra rỗng */
    (G.HM_VUNG || []).forEach(function (v) {
      if (!G.htTangCua('VUNG', v.ma).length) loi.push('vùng ' + v.ma + ':chuỗi nối đứt');
    });
    return loi;
  };

  /* ═══════════ KHÔNG CÓ TẦNG THỨ SÁU ═══════════ */
  G.htSoiKhongTangSau = function () {
    var loi = [];
    if ((G.HT_SAUT5 || {}).khongCoT6 !== true) loi.push('chưa khai không có tầng 6');
    if ((G.HT_TANG || []).length !== 5) loi.push('số tầng=' + (G.HT_TANG || []).length);
    /* Không kho nào của lớp này được nhắc tới một mã tầng ngoài năm mã */
    var re = /\bT[6-9]\b/;
    ['HT_TANG', 'HT_KC', 'HT_NOI'].forEach(function (k) {
      (G[k] || []).forEach(function (x) {
        if (re.test(JSON.stringify(x))) loi.push(k + ':nhắc tới tầng ngoài năm tầng');
      });
    });
    /* Cây cầu sang vai trỏ vào DD_CAP — kho ấy ở gói nghề. Chỉ soi được
       khi máy này CÓ nó; máy nhà không có thì bỏ qua, không báo thiếu. */
    var thang = (G.HT_SAUT5 || {}).sangThangNao;
    if (!thang) loi.push('chưa khai sang thang nào');
    var t5 = (G.HT_TANG || []).filter(function (t) { return t.ma === 'T5'; })[0];
    if (!t5 || t5.cauNoiSangVai !== true) loi.push('tầng 5 chưa khai là cây cầu');
    return loi;
  };

  /* ═══════════ CỔNG ĐỌC TỪ BẢNG HỌC PHÍ ═══════════
     Không ghi lại điều kiện xong ở đây. Ghi lại là dựng bản thứ hai của
     cùng một luật, và hai bản thì sẽ có ngày lệch nhau — lúc ấy nhà
     mình cầm bản nào? */
  G.htCongCua = function (ma) {
    var t = (G.HP_TANG || []).filter(function (x) { return x.tang === ma; })[0];
    if (!t) return null;
    var cong = (t.gom || []).filter(function (g) { return /cổng|nghiệm thu/i.test(g); });
    /* Tầng 5 không kể cổng trong cột GỒM — nó viết ở cột NHỊP: "Bốn kỳ
       theo quý, như tầng 4." Tức là nó THỪA KẾ cổng của tầng dưới.

       Đây là chỗ dữ liệu cũ dạy tôi một điều: một bảng có thể nói cùng
       một việc ở hai cột khác nhau, và hàm đọc một cột thì tưởng bảng
       thiếu. Nên hàm đi theo đúng câu bảng viết, thay vì bắt bảng viết
       lại cho vừa hàm. */
    var keThua = null;
    if (!cong.length) {
      var m = /như tầng (\d)/i.exec(String(t.nhip || ''));
      if (m) {
        var duoi = G.htCongCua('T' + m[1]);
        if (duoi) { cong = duoi.cong; keThua = duoi.tang; }
      }
    }
    return { tang: t.tang, ten: t.ten, donVi: t.donVi, cong: cong,
      keThuaCongCua: keThua, nhip: t.nhip, hoan: t.hoan };
  };

  /* Bảng học phí nằm ở gói NGHỀ — máy của gia đình KHÔNG có nó, và không
     có là đúng: bảng ấy là bảng giá năm tầng của đội bán hàng.

     Nên hàm này chưa chạy được trên máy nhà thì khai CHƯA ĐO ĐƯỢC kèm
     thiếu đúng cái gì, chứ không báo "T1 không có trong bảng học phí".
     Bản đầu tôi viết đúng kiểu ấy và bộ kiểm đỏ năm dòng liền — một
     phép kiểm báo thiếu ở chỗ dữ liệu cố ý vắng mặt là phép kiểm dạy
     người ta coi một lớp bảo vệ là một lỗi. */
  G.htSoiCong = function () {
    if (G.HP_TANG === undefined)
      return { chuaDo: true, thieu: 'Bảng học phí ở gói nghề. Máy này không có nó, nên chưa đối chiếu cổng được.' };
    var loi = [];
    (G.HT_TANG || []).forEach(function (t) {
      if (t.theoHP !== true) loi.push(t.ma + ':chưa khai đọc bảng học phí');
      var c = G.htCongCua(t.ma);
      if (!c) { loi.push(t.ma + ':không có trong bảng học phí'); return; }
      if (!c.cong.length) loi.push(t.ma + ':bảng học phí không nói cổng nào');
      /* Và tầng này KHÔNG được tự ghi lại số ngày — số ngày ở bảng kia */
      if (/\d+\s*ngày/.test(String(t.thuThach))) loi.push(t.ma + ':thử thách ghi cứng số ngày');
    });
    return { chuaDo: false, loi: loi };
  };

  /* ═══════════ NĂM PHẨM CHẤT, KHÔNG TRÙNG ═══════════ */
  G.htSoiDaQuy = function () {
    var thay = {}, loi = [];
    (G.HT_TANG || []).forEach(function (t) {
      if (!t.daQuy) { loi.push(t.ma + ':không có phẩm chất'); return; }
      if (thay[t.daQuy]) loi.push(t.daQuy + ':hai tầng cùng một phẩm chất');
      thay[t.daQuy] = t.ma;
      if (!t.thuThach || !t.khoNhat || !t.doiGiKhiXong) loi.push(t.ma + ':thiếu cột');
    });
    return loi;
  };

  /* ═══════════ BẢY CHẶNG KIM CƯƠNG: LỚP SÂU, KHÔNG PHẢI THANG ═══════════ */
  G.htSoiKC = function () {
    var ds = G.HT_KC || [], loi = [];
    if (ds.length !== 7) loi.push('số chặng=' + ds.length);
    ds.forEach(function (c) {
      var trong = Array.isArray(c.tang) && c.tang.length;
      if (trong && c.ngoaiTang) { loi.push(c.ma + ':vừa trong tầng vừa ngoài tầng'); return; }
      if (!trong && !c.ngoaiTang) { loi.push(c.ma + ':không khai tầng, cũng không khai ngoài tầng'); return; }
      if (trong) c.tang.forEach(function (m) { if (MA_TANG.indexOf(m) < 0) loi.push(c.ma + '→' + m); });
      else {
        /* Chặng ngoài tầng phải trỏ sang một cấp CÓ THẬT của thang người
           đi kèm — ngoài tầng mà không sang đâu là một chặng lơ lửng. */
        if (!c.sangVai) loi.push(c.ma + ':ngoài tầng mà không trỏ sang vai nào');
        else if (G.DD_CAP !== undefined &&
                 !G.DD_CAP.some(function (d) { return d.ma === c.sangVai; }))
          loi.push(c.ma + '→' + c.sangVai + ':cấp không có thật');
      }
      if (!c.daQuy || !c.gay) loi.push(c.ma + ':thiếu phẩm chất hoặc chỗ gãy');
    });
    return loi;
  };

  /* ═══════════ NHÀ MÌNH ĐANG Ở ĐÂU — MỘT CÂU TRẢ LỜI ═══════════
     Nhận số tối đã ghi. Trả về tầng đang đứng và ĐÚNG MỘT thử thách kế
     tiếp — không trả ba việc. Người mệt đọc một việc thì làm; đọc ba
     việc thì đóng máy. */
  G.htDuong = function (soToi) {
    var n = Number(soToi);
    if (!(n >= 0)) return { chuaDo: true, y: 'Chưa có số tối đã ghi. Chưa đo thì chưa nói nhà mình ở đâu.' };
    var cap = null;
    (G.BD_CAP || []).forEach(function (c) {
      if (c.dk && n >= (c.dk.toi || 0)) cap = c;
    });
    if (!cap) return { cap: 0, tang: 'T1', batDau: true,
      y: 'Nhà mình chưa ghi đủ ba tối. Việc duy nhất lúc này: ghi tối nay.' };
    var bd = (G.BD_LON || []).filter(function (x) { return x.so === cap.cap; })[0];
    var tang = (bd && bd.tang) || 'T1';
    var t = (G.HT_TANG || []).filter(function (x) { return x.ma === tang; })[0] || {};
    var i = MA_TANG.indexOf(tang);
    return { cap: cap.cap, capTen: cap.ten, tang: tang, daQuy: t.daQuy,
      thuThach: t.thuThach, khoNhat: t.khoNhat, doiGiKhiXong: t.doiGiKhiXong,
      cong: G.htCongCua(tang),
      tangSau: i >= 0 && i < 4 ? MA_TANG[i + 1] : null,
      hetThang: tang === 'T5',
      sauDo: tang === 'T5' ? (G.HT_SAUT5 || {}).la : null };
  };

  /* Đích đo bằng dấu của chính nhà mình, không đo bằng tầng. */
  G.htToiDichChua = function (dau) {
    var ds = (G.HT_DICH || {}).dau || [];
    if (!dau || typeof dau !== 'object')
      return { chuaDo: true, thieu: 'Sổ bốn dấu hiệu của nhà mình.' };
    var thieu = ds.filter(function (d) { return dau[d.ma] !== true; });
    return { chuaDo: false, du: thieu.length === 0, so: ds.length - thieu.length,
      thieu: thieu.map(function (d) { return d.ma + ' ' + d.t; }),
      y: thieu.length === 0
        ? 'Đủ bốn dấu. Nhà mình tới đích — bất kể đang ở tầng nào.'
        : 'Còn ' + thieu.length + ' dấu. Đích đo bằng dấu của nhà mình, không đo bằng tầng đang đứng.' };
  };

  /* Chỗ sửa nào cũng phải rơi xuống một kho có thật. Nhưng vài kho đích
     nằm ở gói nghề, nên trên máy nhà chỉ soi được phần cột — phần "kho
     có tồn tại không" để dành cho máy có gói nghề. */
  G.htSoiLech = function () {
    return (G.HT_LECH || []).filter(function (l) {
      if (!l.t || !l.thay || !l.daSua || !l.apVao) return true;
      return G[l.apVao] === undefined && G.HP_TANG !== undefined;
    }).map(function (l) { return l.so + '→' + (l.apVao || 'không rơi vào đâu'); });
  };

  /* ═══════════════════════════════════════════════════════════
     MÀN HÌNH — GIA ĐÌNH THẤY CON ĐƯỜNG, NGHỀ THẤY CHỖ NỐI
     ═══════════════════════════════════════════════════════════ */
  G.VIEWS['hanh-trinh-5-tang'] = function () {
    if (!G.HT_TANG)
      return U.empty('Chưa mở được phần này', 'Phần này nằm trong gói nền. Đăng nhập lại để nạp.');

    var d = G.HT_DICH || {};
    var o = U.ph({ eyebrow: 'MỘT HÀNH TRÌNH · NĂM TẦNG THỬ THÁCH', ic: 'compass', grad: 1,
      t: d.ten || '', lead: d.la || '' });

    o += G.kaKhung ? G.kaKhung('hanh-trinh-5-tang', 'dau') : '';

    /* ── BẬC THANG HÀNH ĐỘNG — dẫn màn bằng thứ ĐƠN GIẢN NHẤT ──
       Màn này vốn mở bằng bốn dấu hiệu của đích, rồi năm thẻ tầng, rồi
       bảy chặng, rồi bảng chỗ nối, rồi bảy chỗ lệch. Đúng hết, nhưng
       người mở lần đầu phải đọc hết mới biết mình đang ở đâu.

       Nay dẫn bằng cái thang: năm bậc, mỗi bậc một biểu tượng thành
       công, và ĐÚNG MỘT bậc hiện việc phải làm. Phần sâu vẫn nguyên,
       chỉ nằm sau.

       Số tối đã ghi lấy từ sổ của nhà mình. Chưa có sổ thì nói CHƯA ĐO
       ĐƯỢC và chỉ vào việc duy nhất lúc ấy — ghi tối nay — chứ không
       đoán một bậc rồi vẽ nó ra như thật. */
    if (G.btThangNha) {
      var soToi = (G.S && G.S.soToiDaGhi != null) ? G.S.soToiDaGhi : null;
      var th = G.btThangNha(soToi);
      if (th) {
        o += U.sec('Nhà mình đang ở bậc nào',
          'Năm bậc, mỗi bậc một biểu tượng thành công. Bậc đang đứng hiện đúng một việc — ' +
          'bậc chưa tới thì chưa hiện, để hôm nay chỉ có một việc phải làm.');
        o += G.veBacThang(th.bac, { y: th.chuaDo
          ? th.y + ' Thang dưới đây vẽ theo bậc một, và nó sẽ tự đổi khi sổ có số.'
          : '' });
      }
    }

    /* ── Đích: không phải bậc cuối ── */
    o += '<div class="card mb" style="border-color:#0B73503e">' +
      '<span class="tiny up" style="color:#0B7350">ĐÍCH KHÔNG PHẢI TẦNG CAO NHẤT</span>' +
      '<p class="sm mt" style="line-height:1.8">' + h(d.viKhongPhaiTang || '') + '</p>' +
      (d.dau || []).map(function (x) {
        return '<div style="padding:8px 0;border-bottom:1px solid var(--gita-vien-2)">' +
          '<b class="sm">' + h(x.ma + ' · ' + x.t) + '</b>' +
          '<p class="sm mt" style="line-height:1.8">' + h(x.la) + '</p>' +
          '<p class="tiny dim" style="line-height:1.7">Đo bằng: ' + h(x.doBang) + '</p></div>';
      }).join('') +
      '<p class="mt" style="line-height:1.9"><b>' + h(d.luat || '') + '</b></p>' +
      '<p class="tiny dim mt" style="line-height:1.7">' + h(d.vi || '') + '</p></div>';

    /* ── Năm tầng thử thách ── */
    var coHP = G.HP_TANG !== undefined;
    o += U.sec('Năm tầng, năm thử thách', ((G.HT_TANG_LUAT || {}).cot || ''));
    o += (G.HT_TANG || []).map(function (t) {
      var c = (coHP && G.htCongCua(t.ma)) || {};
      return '<div class="card mb" style="border-color:' + t.c + '3e">' +
        '<span class="tiny up" style="color:' + t.c + '">TẦNG ' + t.so + ' · ' + h(c.ten || t.ma) +
        ' · KẾT TINH: ' + h(t.daQuy) + '</span>' +
        '<p class="mt" style="line-height:1.9"><b>Thử thách:</b> ' + h(t.thuThach) + '</p>' +
        '<p class="sm mt" style="line-height:1.8"><b>Khó nhất ở:</b> ' + h(t.khoNhat) + '</p>' +
        '<p class="sm mt" style="line-height:1.8"><b>Xong thì nhà mình khác gì:</b> ' + h(t.doiGiKhiXong) + '</p>' +
        (c.cong && c.cong.length
          ? '<p class="tiny mt" style="line-height:1.7"><b>Cổng của tầng này' +
            (c.keThuaCongCua ? ' (thừa kế từ tầng ' + h(c.keThuaCongCua) + ')' : '') + ':</b> ' +
            c.cong.map(function (x) { return h(x); }).join(' · ') + '</p>'
          : '') +
        (t.cauNoiSangVai
          ? '<p class="tiny mt" style="line-height:1.7;color:' + t.c + '"><b>Hết thang ở đây:</b> ' +
            h((G.HT_SAUT5 || {}).la || '') + '</p>'
          : '') + '</div>';
    }).join('');
    o += '<p class="tiny dim mb" style="line-height:1.7"><b>' +
      h((G.HT_TANG_LUAT || {}).khongNhayCoc || '') + '</b> ' +
      h((G.HT_TANG_LUAT || {}).vi || '') + '</p>';

    /* ── Sau tầng năm ── */
    var s5 = G.HT_SAUT5 || {};
    o += U.sec('Sau tầng năm', 'Không có tầng thứ sáu.');
    o += '<div class="card mb" style="border-color:#B4720F3e">' +
      '<p class="mt" style="line-height:1.9"><b>' + h(s5.la || '') + '</b></p>' +
      '<p class="sm mt" style="line-height:1.8"><b>Cây cầu:</b> ' + h(s5.cauNoi || '') + '</p>' +
      '<p class="sm mt" style="line-height:1.8"><b>Sang thang nào:</b> ' + h(s5.baCap || '') + '</p>' +
      '<p class="tiny dim mt" style="line-height:1.7">' + h(s5.viKhongDatThemTang || '') + '</p></div>';

    /* ── Phần của nghề ── */
    if (!G.HT_NOI) return o;

    var noi = G.htSoiThangNoi();
    o += U.sec('Bốn cái thang, và chỗ nối' + (noi.length ? ' — LỆCH: ' + (noi.join(' ')) : ''),
      ((G.HT_NOI_LUAT || {}).motCauTraLoi || ''));
    o += U.tbl(['Mã', 'Thang', 'Kho', 'Là gì', 'Nối bằng khoá', 'Sửa ở bản này'],
      (G.HT_NOI || []).map(function (t) {
        return [h(t.ma), h(t.ten), h(t.kho), h(t.la), h(t.khoa) + (t.giaTiep ? ' (gián tiếp)' : ''),
          h(t.suaOBanNay || '—')];
      }));
    o += '<p class="tiny dim mb" style="line-height:1.7">' + h((G.HT_NOI_LUAT || {}).vi || '') +
      ' <b>' + h((G.HT_NOI_LUAT || {}).camThangMoi || '') + '</b></p>';

    o += U.sec('Bảy chặng kim cương — lớp sâu, không phải thang thứ năm', '');
    o += U.tbl(['Mã', 'Chặng', 'Kết tinh', 'Thuộc tầng', 'Bản gốc ghi', 'Chỗ gãy tự nhiên'],
      (G.HT_KC || []).map(function (c) {
        return [h(c.ma), h(c.ten), h(c.daQuy),
          c.ngoaiTang ? 'NGOÀI TẦNG → vai ' + h(c.sangVai) : h((c.tang || []).join(' + ')),
          h(c.banGocGhi || '—'), h(c.gay || '—')];
      }));
    var ghi = (G.HT_KC || []).filter(function (c) { return c.ghiChu; });
    if (ghi.length)
      o += '<div class="card mb">' + ghi.map(function (c) {
        return '<p class="tiny mt" style="line-height:1.7"><b>' + h(c.ten) + ':</b> ' + h(c.ghiChu) + '</p>';
      }).join('') + '</div>';

    var lech = G.htSoiLech();
    o += G.kaKhung ? G.kaKhung('hanh-trinh-5-tang', 'sau-kc') : '';

    o += U.sec('Sáu chỗ chưa khớp, và đã làm gì' + (lech.length ? ' — LỆCH: ' + (lech.join(' ')) : ''),
      'Mỗi chỗ sửa phải rơi xuống một kho có thật.');
    o += U.tbl(['#', 'Chỗ chưa khớp', 'Thấy gì', 'Đã làm gì', 'Rơi xuống đâu'],
      (G.HT_LECH || []).map(function (l) {
        return [String(l.so) + (l.lonNhat ? ' ★' : ''), h(l.t), h(l.thay), h(l.daSua), h(l.apVao)];
      }));

    o += U.sec('Sáu luật của hành trình', '');
    o += '<div class="card">' + (G.HT_LUAT || []).map(function (l) {
      return '<div style="padding:8px 0;border-bottom:1px solid var(--gita-vien-2)">' +
        '<b class="sm">' + l.no + '. ' + h(l.t) + '</b>' +
        '<p class="tiny dim mt" style="line-height:1.7">' + h(l.y) + '</p></div>';
    }).join('') + '</div>';
    return o;
  };
})();
