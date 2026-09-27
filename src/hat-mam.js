/* ═══════════════════════════════════════════════════════════════
   GITA 365 — MÁY CHẠY BỨC TRANH HÀNH TRÌNH

   Kho chuẩn ở kho-goc/data.hat-mam.js. Tệp này là phần CHẠY, và nó chỉ
   dựng ĐÚNG BA cơ chế mới — phần cảm xúc, mùa đời, cấp độ đã có ở
   trai-tim.js và banh-da.js rồi, chép lại là có hai bản và hai bản sẽ
   lệch nhau.

   1. NĂM CỬA TỬ — hmNguyHienTai() nói nhà này đang đứng ở cửa nào, tính
      từ dấu vết đầu tiên họ để lại. Cửa khủng hoảng mở theo MÙA ĐÃ KHAI
      chứ không theo ngày, vì nó tới lúc nào không ai biết trước.

   2. NHÁNH HÉO — hmNhanhHeo() đếm số ngày mỗi nhịp không có dấu, đọc từ
      cột `ma` trong sổ chốt. Nhánh nào mùa này không phải giữ thì KHÔNG
      héo: mùa đông đã hạ mẫu số rồi mà còn báo héo thì đó là phạt trá
      hình, đúng thứ HM_HEO cấm.

   3. NGÔN TỪ — hmSoiNgonTu() quét đúng những câu NÓI VỚI GIA ĐÌNH và bắt
      từ cấm. Bảng `thayBang` chứa sẵn câu xấu làm ví dụ nên KHÔNG quét,
      còn cột `di` của lều là lời dặn người trong nghề, cũng không quét.

   VÌ SAO PHẢI CÓ hmSoiNgonTu: một chuẩn ngôn từ không ai kiểm được thì
   sáu tháng sau không còn ai giữ. Bộ kiểm phát hành mục 51 chạy nó.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;
G.VIEWS = G.VIEWS || {};

(function () {
  var U = G.U, h = U.h, ic = U.ic;
  var NGAY = 86400000;

  function ngayCua(ts) {
    var d = new Date(ts);
    return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
  }
  function tuNgayChu(s) { return new Date(s + 'T12:00:00').getTime(); }
  /* Đếm NGÀY LỊCH, không đếm mili giây trôi qua. Mốc lưu là giữa trưa,
     mà lúc chạy thì có thể là ba giờ sáng — trừ thẳng hai con số ấy thì
     chín ngày ra tám, và bảng héo nói sai đúng một ngày mỗi lần. */
  function cachNgay(tuChu, luc) {
    return Math.round((tuNgayChu(ngayCua(luc)) - tuNgayChu(tuChu)) / NGAY);
  }

  /* ─── Nhà mình đã đi được bao nhiêu ngày ───
     Đếm từ DẤU VẾT ĐẦU TIÊN, không đếm từ ngày mở tài khoản. Người mở tài
     khoản rồi ba tháng sau mới bắt đầu thì họ đang ở ngày thứ nhất của
     mình, không phải ngày thứ chín mươi. */
  G.hmNgayDaDi = function (luc) {
    var moc = [];
    Object.keys(G.S.journal || {}).forEach(function (d) { moc.push(tuNgayChu(d)); });
    Object.keys(G.S.chotKhNgay || {}).forEach(function (d) { moc.push(tuNgayChu(d)); });
    if (!moc.length) return 0;
    var dau = ngayCua(Math.min.apply(null, moc));
    return Math.max(0, cachNgay(dau, luc || Date.now()));
  };

  /* ─── Cửa tử đang mở ───
     Mùa khó thắng mọi mốc ngày: nhà đang mất thu nhập ở tháng thứ bảy thì
     cửa của họ là khủng hoảng, không phải "mệt vì đều đặn". */
  G.hmNguyHienTai = function (luc) {
    var ds = G.HM_NGUY || [];
    var t = G.ttMuaCua ? G.ttMuaCua(luc) : null;
    if (t && t.khai && t.mua && t.mua.ma !== 'THUONG') {
      var kh = ds.filter(function (x) { return x.khiMua; })[0];
      if (kh) return kh;
    }
    var n = G.hmNgayDaDi(luc);
    if (!n) return null;
    for (var i = 0; i < ds.length; i++) {
      var x = ds[i];
      if (x.tuNgay === undefined) continue;
      if (n >= x.tuNgay && n <= x.denNgay) return x;
    }
    return null;
  };

  /* ─── Vùng đất đang đứng ───
     Nối vào cấp bánh đà. Không dựng thang thứ hai — hai thang song song
     thì sẽ có ngày lệch nhau, và lúc ấy không ai biết tin cái nào. */
  G.hmVungCua = function () {
    var cap = G.bdCap ? G.bdCap().cap : 0;
    var ds = G.HM_VUNG || [];
    for (var i = 0; i < ds.length; i++)
      if (cap >= ds[i].capTu && cap <= ds[i].capDen) return ds[i];
    return ds[0] || null;
  };

  /* ─── Nhánh nào đang héo ───
     Đọc cột `ma` của sổ chốt. Chốt cũ chưa có cột ấy thì trả `chuaDo`,
     KHÔNG trả héo: suy đoán từ chỗ thiếu dữ liệu thì sớm muộn cũng báo
     héo cho một nhà đang đều, và báo sai một lần là mất niềm tin vào cả
     bảng. Nhịp mùa này không phải giữ thì bỏ hẳn khỏi bảng. */
  G.hmNhanhHeo = function (luc) {
    var t = luc || Date.now();
    var giu = G.ttNhipCanGiu ? G.ttNhipCanGiu() : null;
    var nhip = (G.CV_KH_NGAY || []).filter(function (x) {
      return !giu || !giu.length || giu.indexOf(x.ma) >= 0;
    });
    var so = G.S.chotKhNgay || {};
    var ngayCo = Object.keys(so).sort();
    var coCotMa = ngayCo.some(function (d) { return Array.isArray(so[d].ma); });
    return nhip.map(function (x) {
      if (!coCotMa) return { ma: x.ma, ten: x.ten, chuaDo: true };
      var cuoi = null;
      for (var i = ngayCo.length - 1; i >= 0; i--) {
        var r = so[ngayCo[i]];
        if (Array.isArray(r.ma) && r.ma.indexOf(x.ma) >= 0) { cuoi = ngayCo[i]; break; }
      }
      if (!cuoi) return { ma: x.ma, ten: x.ten, chuaDo: true };
      var ngay = Math.max(0, cachNgay(cuoi, t));
      var muc = null;
      (G.HM_HEO && G.HM_HEO.nguong || []).forEach(function (n) { if (ngay >= n.ngay) muc = n; });
      return { ma: x.ma, ten: x.ten, ngay: ngay, cuoi: cuoi, muc: muc };
    });
  };

  /* ─── Quét ngôn từ của lời nói với gia đình ───
     Chỉ quét câu THẬT SỰ hiện ra trước mặt họ. Câu xấu trong bảng
     `thayBang` là ví dụ để đối chiếu, quét nó vào thì phép kiểm đỏ vĩnh
     viễn và người ta sẽ tắt phép kiểm — đó là cách một chuẩn chết. */
  G.hmLoiNoiVoiNha = function () {
    var ds = [];
    if (G.HM_NGAY1) { ds.push(['HM_NGAY1.noi', G.HM_NGAY1.noi]); ds.push(['HM_NGAY1.lam', G.HM_NGAY1.lam]); }
    (G.HM_HOI3 || []).forEach(function (x) { ds.push(['HM_HOI3.' + x.so, x.hoi]); });
    if (G.HM_LEU) {
      ds.push(['HM_LEU.hoi', G.HM_LEU.hoi]);
      (G.HM_LEU.dap || []).forEach(function (d) { ds.push(['HM_LEU.' + d.ma, d.ten]); });
    }
    return ds;
  };

  /* ─── Máy quét dùng chung ───
     Nhận danh sách [nhãn, câu] và trả về những chỗ phạm. Để CHUNG một
     máy vì sổ tay Cây Mẹ cũng quét bằng đúng chuẩn này: hai máy quét
     rồi sẽ có ngày lệch nhau, và lúc ấy chuẩn ngôn từ có hai bản. */
  G.hmQuetTuCam = function (dsCau) {
    var cam = (G.HM_NGONTU || {}).camTu || [];
    var pham = [];
    (dsCau || []).forEach(function (c) {
      var chu = String(c[1] || '');
      cam.forEach(function (tu) {
        /* Bắt theo TỪ, không theo chuỗi con: 'nên' nằm trong 'lên' và
           'trên', bắt theo chuỗi con thì phép kiểm đỏ ở chỗ không có lỗi
           và người ta học được cách bỏ qua nó. */
        var re = new RegExp('(^|[^\\p{L}])' + tu + '($|[^\\p{L}])', 'iu');
        if (re.test(chu)) pham.push(c[0] + '→' + tu);
      });
    });
    return pham;
  };

  G.hmSoiNgonTu = function () { return G.hmQuetTuCam(G.hmLoiNoiVoiNha()); };

  /* ─── Mỗi cửa tử có CƠ CHẾ CÓ THẬT chặn không ───
     Cột `co` liệt kê tên hàm hoặc tên kho, cách nhau bằng dấu chấm giữa,
     phần sau dấu gạch dài là lời giải thích. Cửa nào trỏ vào thứ không
     tồn tại thì đó là một lời động viên, không phải một cơ chế. */
  G.hmSoiCoChe = function () {
    var thieu = [];
    (G.HM_NGUY || []).forEach(function (x) {
      var phan = String(x.co || '').split('—')[0];
      var ten = phan.split('·').map(function (s) { return s.trim().split(' ')[0].trim(); })
        .filter(function (s) { return s; });
      if (!ten.length) { thieu.push(x.ma + ':trống'); return; }
      ten.forEach(function (n) { if (G[n] === undefined) thieu.push(x.ma + '→' + n); });
    });
    return thieu;
  };

  /* ─── Phần của nghề, dựng riêng ───
     Phải dựng được ở CẢ HAI lối ra của màn. Lần đầu tôi để nó sau lối ra
     "ngày thứ nhất", nên một tài khoản nghề chưa có dấu vết nào thì mở
     màn ra chỉ thấy đúng một câu của gia đình — bảng cửa tử biến mất mà
     không ai báo. Bộ kiểm mục 51 bắt đúng chỗ này.

     Gia đình KHÔNG có G.HM_SAU trong máy, nên khối này không dựng ra
     được với tài khoản của họ. Đó là cách chặn thật; ẩn bằng câu lệnh
     if thì mở công cụ nhà phát triển là đọc được. */
  function phanNghe() {
    if (!G.HM_SAU) return '';
    var o = U.sec('Bản ghi sau màn hình — phần của nghề',
      'Đây là điều gia đình KHÔNG cần biết, và cũng không được nhận. Biết mình đang bị chấm bao nhiêu điểm thì cái nhìn đổi ngay.');
    o += U.tbl(['Khi nào', 'Máy làm gì', 'Tuyệt đối không'],
      (G.HM_SAU || []).map(function (s) { return [h(s.khi), h(s.may), h(s.cam)]; }));
    o += U.sec('Năm cửa tử — bơm gì, chặn bằng gì', '');
    o += U.tbl(['Cửa', 'Khi nào', 'Vì sao mất người', 'Bơm cảm xúc', 'Cơ chế chặn'],
      (G.HM_NGUY_SAU || []).map(function (x) {
        return [h(x.ten), h(x.khi), h(x.vi), h(x.bom), h(x.co)];
      }));
    var nt = G.HM_NGONTU || {};
    o += U.sec('Chuẩn ngôn từ', (nt.cot || ''));
    o += '<div class="card mb"><p class="sm" style="line-height:1.8"><b>Từ cấm:</b> ' +
      h((nt.camTu || []).join(' · ')) + '</p>' +
      '<p class="sm mt" style="line-height:1.8">' + h(nt.khongNhac || '') + '</p>' +
      (nt.thayBang || []).map(function (t) {
        return '<div class="tiny mt" style="line-height:1.7;padding-top:6px;border-top:1px solid var(--gita-vien-2)">' +
          '<span style="color:#BE0E16">' + h(t.xau) + '</span> → <span style="color:#0B7350">' + h(t.tot) + '</span></div>';
      }).join('') + '</div>';
    return o;
  }

  /* ═══════════ MÀN: BỨC TRANH HÀNH TRÌNH ═══════════ */
  G.VIEWS['buc-tranh'] = function () {
    if (!G.HM_VUNG)
      return U.empty('Chưa mở được bức tranh', 'Phần này nằm trong gói nền. Đăng nhập lại để nạp.');

    var vung = G.hmVungCua();
    var cap = G.bdCap ? G.bdCap() : { cap: 0 };
    var nguy = G.hmNguyHienTai();
    var heo = G.hmNhanhHeo();
    var daDi = G.hmNgayDaDi();
    var mua = G.ttMuaCua ? G.ttMuaCua() : null;
    var trongMuaKho = !!(mua && mua.khai && mua.mua.ma !== 'THUONG');

    var o = U.ph({ eyebrow: 'BỨC TRANH HÀNH TRÌNH', ic: 'sun', grad: 1,
      t: 'Một hạt, một mảnh đất, và một giọt mỗi ngày',
      lead: 'Con đường được nhìn thấy là con đường đã đi được một nửa. Người ta bỏ cuộc không phải vì ' +
        'đường dài, mà vì không thấy đích và không thấy mình đã đi được bao xa.' });

    /* ── Chưa có dấu vết nào: chỉ nói MỘT việc ──
       Không bày bảy vùng đất, không bày mốc mười năm. Người mở lần đầu
       nhìn thấy một núi việc là bỏ trước khi bắt đầu. */
    if (!daDi && G.HM_NGAY1) {
      var n1 = G.HM_NGAY1;
      o += '<div class="card mb" style="border-color:#0B735038">' +
        '<p class="sm dim" style="line-height:1.8">' + h(n1.thay) + '</p>' +
        '<p class="mt" style="line-height:1.9">' + h(n1.noi) + '</p>' +
        '<p class="sm mt" style="line-height:1.8;color:#0B7350"><b>Việc hôm nay:</b> ' + h(n1.lam) + '</p>' +
        '<p class="tiny muted mt">' + h(n1.sau) + '</p></div>';
      o += '<div class="card mb"><p class="tiny dim" style="line-height:1.7">' + h(n1.luat) + '</p></div>';
      return o + phanNghe();
    }

    /* ── Đang ở vùng nào ──
       Vùng đã qua thì sáng, vùng đang tới thì sáng rực, vùng xa thì mờ.
       `mo` chính là cái sương ấy — đủ để tin, không đủ để lo. */
    if (vung) {
      o += '<div class="card mb" style="border-color:' + vung.c + '3e">' +
        '<div class="row wrap" style="gap:10px;align-items:baseline">' +
        '<span style="color:' + vung.c + '">' + ic('sun', 'w-5 h-5') + '</span>' +
        '<b>' + h(vung.ten) + '</b>' +
        '<span class="tiny muted" style="margin-left:auto">ngày thứ ' + daDi + '</span></div>' +
        '<p class="sm mt" style="line-height:1.8">' + h(vung.y) + '</p></div>';
    }

    o += '<div class="row wrap mb" style="gap:6px">' + (G.HM_VUNG || []).map(function (v) {
      var qua = cap.cap > v.capDen, dang = vung && v.ma === vung.ma;
      var mo = (!qua && !dang) ? (v.capTu - cap.cap >= 4 ? .22 : .5) : 1;
      return '<div style="flex:1 1 84px;padding:8px;border-radius:8px;opacity:' + mo +
        ';border:1px solid ' + v.c + (dang ? '5e' : '1e') + ';background:' + v.c + (dang ? '12' : '06') + '">' +
        '<div class="tiny up" style="color:' + v.c + '">' + h(v.ten) + '</div>' +
        '<div class="tiny muted">' + (dang ? 'đang ở đây' : qua ? 'đã qua' : 'cấp ' + v.capTu) + '</div></div>';
    }).join('') + '</div>';
    o += '<p class="tiny dim mb" style="line-height:1.7">' + h((G.HM_VUNG_LUAT || {}).cot || '') + ' ' +
      h((G.HM_VUNG_LUAT || {}).vi || '') + '</p>';

    /* ── Lều trú gió: trong mùa khó thì mỗi tối CHỈ MỘT câu ──
       Ba đường phải khác nhau thật, nên in cả ba đường ra ngay dưới câu
       hỏi: nhà mình nhìn thấy trả lời xong thì đi đâu, chứ không trả lời
       vào chỗ tối. */
    if (trongMuaKho && G.HM_LEU) {
      o += '<div class="card mb" style="border-color:#185AB43e">' +
        '<span class="tiny up" style="color:#185AB4">LỀU TRÚ GIÓ</span>' +
        '<p class="mt" style="line-height:1.9"><b>' + h(G.HM_LEU.hoi) + '</b></p>' +
        (G.HM_LEU.dap || []).map(function (d) {
          return '<div class="sm mt" style="line-height:1.8;padding-top:6px;border-top:1px solid var(--gita-vien-2)">' +
            '<b>' + h(d.ten) + '</b> — ' + h(d.di) + '</div>';
        }).join('') + '</div>';
    } else if (G.HM_HOI3) {
      o += U.sec('Ba câu mỗi tối', 'Sáu mươi giây. Hỏi cái mệt trước cái được — người đang mệt mà bị hỏi thành tích trước thì trả lời cho xong.');
      o += '<div class="card mb">' + (G.HM_HOI3 || []).map(function (x) {
        return '<div style="padding:8px 0;border-bottom:1px solid var(--gita-vien-2)">' +
          '<b class="sm">' + h(x.hoi) + '</b></div>';
      }).join('') + '</div>';
    }

    /* ── Nhánh héo ──
       Nhạt màu, không nhãn đỏ, không trừ điểm. Nhà tự thấy và tự sửa. */
    var coHeo = heo.filter(function (x) { return x.muc; });
    o += U.sec('Nhánh nào đang cần tưới', ((G.HM_HEO || {}).cot || ''));
    o += '<div class="card mb">' + heo.map(function (x) {
      if (x.chuaDo)
        return '<div class="row wrap" style="gap:8px;padding:7px 0;border-bottom:1px solid var(--gita-vien-2)">' +
          '<span class="sm" style="opacity:.55">' + h(x.ten) + '</span>' +
          '<span class="tiny muted" style="margin-left:auto">chưa có dấu nào để so</span></div>';
      var m = x.muc;
      return '<div class="row wrap" style="gap:8px;padding:7px 0;border-bottom:1px solid var(--gita-vien-2)">' +
        '<span class="sm" style="opacity:' + (m ? (m.ngay >= 14 ? .5 : .72) : 1) + '">' + h(x.ten) + '</span>' +
        '<span class="tiny muted" style="margin-left:auto">' +
        (m ? h(m.ten) + ' · ' + x.ngay + ' ngày' : 'xanh · ' + x.ngay + ' ngày') + '</span></div>';
    }).join('') + '</div>';
    if (coHeo.length)
      o += '<p class="tiny dim mb" style="line-height:1.7">' + h((G.HM_HEO || {}).luat || '') + '</p>';

    /* ── Cửa đang đứng ──
       Nói với gia đình thì nói phần CƠ CHẾ ĐANG ĐỠ HỌ, không nói "anh
       chị đang ở cửa dễ bỏ cuộc nhất". Câu sau là câu của người trong
       nghề, và nó nằm ở HM_SAU. */
    if (nguy) {
      o += '<div class="card mb" style="border-color:' + nguy.c + '2e">' +
        '<span class="tiny up" style="color:' + nguy.c + '">CHẶNG NÀY · ' + h(nguy.ten) + '</span>' +
        '<p class="sm mt" style="line-height:1.8">' + h(nguy.khi) + '</p>' +
        '<p class="sm mt" style="line-height:1.8"><b>Nhà mình đang được đỡ bằng:</b> ' +
        h(String(nguy.co).split('—')[1] || nguy.co) + '</p></div>';
    }

    o += U.sec('Sáu luật của bức tranh này', '');
    o += '<div class="card">' + (G.HM_LUAT || []).map(function (l) {
      return '<div style="padding:8px 0;border-bottom:1px solid var(--gita-vien-2)">' +
        '<b class="sm">' + l.no + '. ' + h(l.t) + '</b>' +
        '<p class="tiny dim mt" style="line-height:1.7">' + h(l.y) + '</p></div>';
    }).join('') + '</div>';

    return o + phanNghe();
  };
})();
