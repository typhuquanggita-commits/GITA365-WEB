/* ═══════════════════════════════════════════════════════════════
   GITA 365 · v9.68 — SỔ TAY SUPER ADMIN · PHẦN MÁY SINH

   Ý CHÍNH: SỔ TAY KHÔNG ĐƯỢC CHÉP DANH SÁCH MÀN

   Chép thì sáu tháng sau app có màn mới mà sổ tay không có, và người
   đọc tin sổ tay chứ không tin app. Nên toàn bộ phần danh sách ở đây
   ĐỌC THẲNG G.NAV và G.PERM lúc chạy:

     staDanhMuc()   mọi màn, thuộc nhóm nào, khoá quyền nào, vai nào
                    thấy, hiện khi nào — sinh từ hệ đang chạy
     staTheoQuyen() lật ngược: một quyền mở ra những màn nào
     staRiengAdmin() những màn CHỈ Super Admin và Admin hệ thống thấy

   ═══ BA CÁI KHOÁ ═══

   staSoiPhuHet()   mỗi nhóm trong G.NAV phải có lời dẫn; mọi ô man
                    trong kho phải trỏ vào màn có thật
   staSoiKhopVai()  mọi quyền khai trên màn phải có thật trong G.PERM
                    (gõ nhầm là màn mở cho mọi vai, im lặng), và Super
                    Admin phải thấy hết
   staSoiKhongChep() kho người-viết không được chứa một danh sách màn
                    chép tay
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;
G.VIEWS = G.VIEWS || {};

(function () {
  var U = G.U, h = U.h;

  /* Bậc tối đa được dùng một quyền. Không có quyền thì mọi vai đều
     thấy, nên trần là bậc thấp nhất trong bậc thang. */
  function tranCua(perm) {
    if (!perm) return 99;
    var p = (G.PERM || {})[perm];
    return typeof p === 'number' ? p : 99;
  }

  /* ═══════════ DANH MỤC SINH TỪ HỆ ĐANG CHẠY ═══════════ */
  G.staDanhMuc = function () {
    var nav = G.NAV || [];
    if (!nav.length) return { chuaDo: true, thieu: 'G.NAV', nhom: [] };
    var vais = G.ROLES || [];

    var nhom = nav.map(function (g) {
      var items = (g.items || []).map(function (it) {
        var tran = tranCua(it.perm);
        var ai = vais.filter(function (r) { return r.lv <= tran; });
        return {
          v: it.v, t: it.t, h: it.h, perm: it.perm || '',
          capMo: it.capMo || '', star: !!it.star,
          hienKhi: it.hienKhi || '',
          tran: tran,
          soVai: ai.length,
          vaiDau: ai.length ? ai[0].id : '',
          vaiCuoi: ai.length ? ai[ai.length - 1].id : '',
          rieng: tran <= 2
        };
      });
      return { id: g.id, no: g.no, t: g.t, s: g.s, essence: g.essence || '',
        c: g.c, ic: g.ic, items: items, so: items.length };
    });

    var tong = nhom.reduce(function (s, g) { return s + g.so; }, 0);
    return { chuaDo: false, nhom: nhom, soNhom: nhom.length, tongMan: tong,
      soRieng: nhom.reduce(function (s, g) {
        return s + g.items.filter(function (x) { return x.rieng; }).length; }, 0) };
  };

  /* Lật ngược: một quyền mở ra những màn nào. Đây là bảng người quản
     trị cần nhất lúc sắp cấp quyền cho ai — cấp một quyền là mở cả
     một nhóm màn, không phải một màn. */
  G.staTheoQuyen = function () {
    var d = G.staDanhMuc();
    if (d.chuaDo) return { chuaDo: true, thieu: d.thieu, ds: [] };
    var goi = {};
    d.nhom.forEach(function (g) {
      g.items.forEach(function (it) {
        var k = it.perm || '(không khoá quyền)';
        (goi[k] = goi[k] || []).push({ v: it.v, t: it.t, nhom: g.no });
      });
    });
    var ds = Object.keys(goi).map(function (k) {
      return { perm: k, ten: (G.PERM_TEN || {})[k] || '', tran: tranCua(k === '(không khoá quyền)' ? '' : k),
        so: goi[k].length, man: goi[k] };
    });
    ds.sort(function (a, b) { return a.tran - b.tran || b.so - a.so; });
    return { chuaDo: false, ds: ds, so: ds.length };
  };

  G.staRiengAdmin = function () {
    var d = G.staDanhMuc();
    if (d.chuaDo) return { chuaDo: true, thieu: d.thieu, ds: [] };
    var ra = [];
    d.nhom.forEach(function (g) {
      g.items.forEach(function (it) { if (it.rieng) ra.push({ nhom: g.no, it: it }); });
    });
    return { chuaDo: false, ds: ra, so: ra.length };
  };

  /* ═══════════ KHOÁ 1: PHỦ HẾT VÀ TRỎ ĐÚNG ═══════════ */
  G.staSoiPhuHet = function () {
    var d = G.staDanhMuc(), loi = [];
    if (d.chuaDo) return { chuaDo: true, thieu: d.thieu, loi: [] };
    if (!(G.STA_NHOM || []).length) return { chuaDo: true, thieu: 'STA_NHOM', loi: [] };

    /* Mỗi nhóm trong G.NAV phải có lời dẫn. Thêm nhóm mà quên viết
       thì sổ tay thiếu một nhóm trong im lặng. */
    var coDan = {};
    (G.STA_NHOM || []).forEach(function (x) {
      coDan[x.ma] = 1;
      ['laGi', 'adminLamGi', 'deSai'].forEach(function (k) {
        if (!x[k]) loi.push('nhóm ' + x.ma + ' thiếu ô ' + k);
      });
    });
    d.nhom.forEach(function (g) {
      if (!coDan[g.id]) loi.push('nhóm ' + g.id + ' (' + g.t + ') chưa có lời dẫn trong STA_NHOM');
    });
    (G.STA_NHOM || []).forEach(function (x) {
      if (!d.nhom.filter(function (g) { return g.id === x.ma; }).length)
        loi.push('STA_NHOM có lời dẫn cho nhóm ' + x.ma + ' — nhóm ấy không còn trong G.NAV');
    });

    /* Mọi ô man phải trỏ vào màn có thật. Sổ tay dẫn tới một màn
       không tồn tại thì người đọc tưởng mình tra sót. */
    var coMan = {};
    d.nhom.forEach(function (g) { g.items.forEach(function (it) { coMan[it.v] = 1; }); });
    function kiemMan(v, o) {
      if (v && !coMan[v]) loi.push(o + ' trỏ vào màn "' + v + '" — màn ấy không có trong G.NAV');
    }
    (G.STA_XUONGSONG || []).forEach(function (x) {
      kiemMan(x.man, 'màn xương sống ' + x.man);
      ['ten', 'mo', 'docTruoc', 'nutNguy', 'daSai'].forEach(function (k) {
        if (!x[k]) loi.push('màn xương sống ' + x.man + ' thiếu ô ' + k);
      });
    });
    (G.STA_NHIP || []).forEach(function (n) {
      if (!n.viec || !n.viec.length) loi.push('nhịp ' + n.nhip + ' không có việc nào');
      (n.viec || []).forEach(function (v) {
        kiemMan(v.man, 'nhịp ' + n.nhip);
        if (!v.lam) loi.push('nhịp ' + n.nhip + ' · ' + v.man + ' không nói làm gì');
      });
    });

    if ((G.STA_BAYNGAY || []).length !== 7)
      loi.push('bảy ngày đầu phải có bảy ngày, đang có ' + (G.STA_BAYNGAY || []).length);
    (G.STA_BAYNGAY || []).forEach(function (x) {
      ['hoc', 'dich', 'lam'].forEach(function (k) {
        if (!x[k]) loi.push('ngày ' + x.ngay + ' thiếu ô ' + k);
      });
    });
    if (!(G.STA_LUAT || {}).phuHetSauNhom) loi.push('chưa khai luật phủ hết các nhóm');
    return { chuaDo: false, loi: loi, soNhom: d.soNhom, tongMan: d.tongMan };
  };

  /* ═══════════ KHOÁ 2: QUYỀN PHẢI CÓ THẬT, VÀ R01 PHẢI THẤY HẾT ═══════════

     ĐỔI PHÉP ĐO SAU KHI THỬ LÀM HỎNG — GHI LẠI ĐỂ KHÔNG QUÊN

     Bản đầu của khoá này canh "bậc thang không đảo ngược": vai bậc
     thấp không được thấy nhiều màn hơn vai bậc cao. Đem đi thử làm
     hỏng hai lần, cả hai lần đều KHÔNG đỏ — và lý do là phép ấy không
     thể đỏ. Hệ tính tầm nhìn bằng "bậc của vai ≤ trần của quyền", nên
     vai bậc thấp luôn thấy tập cha của vai bậc cao, dù đổi quyền hay
     đánh số bậc thang sai. Một phép kiểm chưa từng đỏ thì chưa phải
     phép kiểm, nên nhánh ấy bị bỏ chứ không giữ cho đẹp.

     Thay bằng chỗ hỏng CÓ THẬT và nguy hơn nhiều: một màn khai perm
     trỏ vào một quyền KHÔNG có trong G.PERM. Lúc ấy tranCua() trả về
     99, và màn đáng lẽ chỉ Super Admin thấy thì MỌI VAI đều thấy —
     im lặng, không lỗi, không ai biết. Gõ nhầm một chữ trong tên
     quyền là đủ. */
  G.staSoiKhopVai = function () {
    var d = G.staDanhMuc(), loi = [];
    if (d.chuaDo) return { chuaDo: true, thieu: d.thieu, loi: [] };
    var vais = (G.ROLES || []).slice();
    if (!vais.length) return { chuaDo: true, thieu: 'G.ROLES', loi: [] };
    vais.sort(function (a, b) { return a.lv - b.lv; });

    /* Quyền khai trên màn phải có thật trong bảng quyền. */
    d.nhom.forEach(function (g) {
      g.items.forEach(function (it) {
        if (!it.perm) return;
        if (typeof (G.PERM || {})[it.perm] !== 'number')
          loi.push('màn "' + it.v + '" khoá ở quyền "' + it.perm +
            '" — quyền ấy KHÔNG có trong G.PERM, nên màn đang mở cho mọi vai');
      });
    });

    var dem = vais.map(function (r) {
      var so = 0;
      d.nhom.forEach(function (g) {
        g.items.forEach(function (it) { if (r.lv <= it.tran) so++; });
      });
      return { id: r.id, lv: r.lv, n: r.n, so: so };
    });

    /* R01 phải thấy hết. Không thấy hết thì Super Admin đang bị khoá
       khỏi chính hệ mình quản — và đó là chỗ phép này đỏ được. */
    if (dem.length && dem[0].so !== d.tongMan)
      loi.push(dem[0].id + ' thấy ' + dem[0].so + '/' + d.tongMan +
        ' màn — Super Admin phải thấy hết');
    return { chuaDo: false, loi: loi, dem: dem };
  };

  /* ═══════════ KHOÁ 3: KHO NGƯỜI-VIẾT KHÔNG ĐƯỢC CHÉP DANH SÁCH ═══════════

     Cám dỗ lớn nhất khi viết sổ tay là chép danh sách màn vào cho
     "đầy đủ". Phép này đếm số mã màn xuất hiện trong kho người viết:
     mã dùng để TRỎ thì ít, mã dùng để CHÉP thì nhiều. Trần đặt ở một
     phần tư tổng số màn — vượt là kho đang chép chứ không trỏ. */
  G.staSoiKhongChep = function () {
    var d = G.staDanhMuc(), loi = [];
    if (d.chuaDo) return { chuaDo: true, thieu: d.thieu, loi: [] };
    var kho = [G.STA_LOI, G.STA_NHOM, G.STA_NHIP, G.STA_XUONGSONG,
               G.STA_BAYNGAY, G.STA_CAM, G.STA_LUAT].filter(Boolean);
    if (!kho.length) return { chuaDo: true, thieu: 'STA_*', loi: [] };
    /* Bỏ dấu thoát trước khi tìm. JSON.stringify biến dấu nháy bên
       trong một chuỗi thành \" — nên mã màn CHÉP vào lòng một câu
       thì tìm bằng '"ma"' không thấy, và phép này câm đúng vào lúc
       cần nhất. Đã thử làm hỏng và bắt được chỗ ấy. */
    var chu = JSON.stringify(kho).replace(/\\"/g, '"');

    var coMan = {};
    d.nhom.forEach(function (g) { g.items.forEach(function (it) { coMan[it.v] = 1; }); });
    var nhac = Object.keys(coMan).filter(function (v) {
      return chu.indexOf('"' + v + '"') >= 0;
    });
    var tran = Math.ceil(d.tongMan / 4);
    if (nhac.length > tran)
      loi.push('kho người-viết nhắc tới ' + nhac.length + '/' + d.tongMan + ' màn, quá trần ' +
        tran + ' — kho đang CHÉP danh sách chứ không TRỎ. Danh sách để máy sinh.');

    /* Và chiều ngược lại: nhắc quá ít thì kho không nối được vào app.
       Một sổ tay không trỏ vào màn nào là một bài văn. */
    if (nhac.length < 5)
      loi.push('kho người-viết chỉ nhắc ' + nhac.length + ' màn — sổ tay chưa nối được vào app');

    if (!(G.STA_LUAT || {}).maySinhPhanDanhSach)
      loi.push('chưa khai luật phần danh sách do máy sinh');
    if (!(G.STA_XUONGSONG_LUAT || {}).moiManPhaiCoDaSai)
      loi.push('chưa khai luật mỗi màn xương sống phải có ô đã sai');
    return { chuaDo: false, loi: loi, nhac: nhac.length, tran: tran, tong: d.tongMan };
  };

  /* ═══════════════════════════════════════════════════════════
     MÀN HÌNH
     ═══════════════════════════════════════════════════════════ */
  G.VIEWS['so-tay-admin'] = function () {
    if (!G.STA_NHOM)
      return U.empty('Chưa mở được phần này',
        'Sổ tay Super Admin nằm trong gói nghề. Đăng nhập bằng tài khoản có quyền nghề để nạp.');

    var loi = G.STA_LOI || {}, d = G.staDanhMuc();
    var kqP = G.staSoiPhuHet(), kqV = G.staSoiKhopVai(), kqC = G.staSoiKhongChep();
    var lech = [].concat(kqP.loi || [], kqV.loi || [], kqC.loi || []);
    var danNhom = {};
    (G.STA_NHOM || []).forEach(function (x) { danNhom[x.ma] = x; });

    var o = U.ph({ eyebrow: 'SỔ TAY SUPER ADMIN', ic: 'crown', grad: 1,
      t: d.tongMan + ' màn · ' + d.soNhom + ' nhóm · ' + d.soRieng + ' màn chỉ mình thấy',
      lead: loi.haiLop || '' });

    o += '<div class="card mb" style="border-color:' + (lech.length ? '#BE0E16' : '#B4720F') + '56">' +
      '<b class="sm" style="color:#B4720F">' + h(loi.cauDatNhat || '') + '</b>' +
      '<p class="tiny mt" style="line-height:1.75">' + h(loi.hocTheoNhip || '') + '</p>' +
      '<p class="tiny mt" style="line-height:1.75">' + h(loi.khongChepDanhSach || '') + '</p>' +
      '<p class="tiny dim mt" style="line-height:1.7">' + h(loi.nguon || '') + '</p>' +
      (lech.length ? '<p class="tiny mt" style="line-height:1.7;color:#BE0E16"><b>LỆCH: ' +
        h(lech.slice(0, 4).join(' · ')) + '</b></p>' : '') + '</div>';

    /* ── Nhịp làm việc — phần học trước ── */
    o += U.sec('Học theo nhịp, không học theo danh sách',
      (G.STA_NHIP_LUAT || {}).nhipTruocDanhSach || '');
    (G.STA_NHIP || []).forEach(function (n) {
      o += '<div class="card mb"><b class="sm" style="color:#BE0E16">' + h(n.nhip) + '</b> ' +
        '<span class="tiny dim">' + h(n.gio) + '</span>' +
        (n.viec || []).map(function (v) {
          var it = null;
          d.nhom.forEach(function (g) {
            g.items.forEach(function (x) { if (x.v === v.man) it = x; });
          });
          return '<div style="padding:9px 0;border-bottom:1px solid var(--gita-vien-2)">' +
            '<b class="sm">' + h(it ? it.t : v.man) + '</b> ' +
            '<span class="tiny dim">' + h(v.man) + '</span>' +
            '<p class="tiny mt" style="line-height:1.75">' + h(v.lam) + '</p></div>';
        }).join('') + '</div>';
    });

    o += G.kaKhung ? G.kaKhung('so-tay-admin', 'dau') : '';

    /* ── Bảy ngày đầu ── */
    o += U.sec('Bảy ngày đầu của một Super Admin',
      (G.STA_BAYNGAY_LUAT || {}).bayNgayKhongPhaiBayBuoi || '');
    o += '<div class="card mb">' + U.tbl(['Ngày', 'Học gì', 'Đích tới', 'Làm gì'],
      (G.STA_BAYNGAY || []).map(function (x) {
        return ['<b style="color:#B4720F">' + x.ngay + '</b>', h(x.hoc), h(x.dich), h(x.lam)];
      })) + '</div>';

    /* ── Mười hai màn xương sống ── */
    o += U.sec('Mười hai màn một thao tác sai gây hậu quả lớn nhất',
      (G.STA_XUONGSONG_LUAT || {}).khongPhaiMuoiHaiManHay || '');
    o += '<div class="card mb">' + (G.STA_XUONGSONG || []).map(function (x) {
      return '<div style="padding:12px 0;border-bottom:1px solid var(--gita-vien-2)">' +
        '<b class="sm">' + h(x.ten) + '</b> <span class="tiny dim">' + h(x.man) + '</span>' +
        '<p class="tiny mt" style="line-height:1.75"><b>Mở khi nào:</b> ' + h(x.mo) + '</p>' +
        '<p class="tiny" style="line-height:1.75"><b>Đọc gì trước:</b> ' + h(x.docTruoc) + '</p>' +
        '<p class="tiny mt" style="line-height:1.75;color:#BE0E16"><b>Nút nguy:</b> ' +
        h(x.nutNguy) + '</p>' +
        '<p class="tiny" style="line-height:1.75;color:#B4720F"><b>Đã từng sai:</b> ' +
        h(x.daSai) + '</p></div>';
    }).join('') + '</div>';

    /* ── Danh mục đầy đủ, máy sinh ── */
    o += U.sec('Toàn bộ ' + d.tongMan + ' màn — bảng này do máy sinh từ hệ đang chạy',
      (G.STA_LUAT || {}).maySinhPhanDanhSach || '');
    d.nhom.forEach(function (g) {
      var dan = danNhom[g.id] || {};
      o += '<div class="card mb" style="border-color:' + h(g.c || '#B4720F') + '56">' +
        '<b class="sm" style="color:' + h(g.c || '') + '">' + h(g.no) + ' · ' + h(g.t) + '</b> ' +
        '<span class="tiny dim">' + g.so + ' màn</span>' +
        '<p class="tiny mt" style="line-height:1.75">' + h(dan.laGi || g.s || '') + '</p>' +
        '<p class="tiny mt" style="line-height:1.75;color:#0B6675"><b>Super Admin làm gì ở đây:</b> ' +
        h(dan.adminLamGi || '') + '</p>' +
        '<p class="tiny" style="line-height:1.75;color:#BE0E16"><b>Chỗ dễ sai:</b> ' +
        h(dan.deSai || '') + '</p></div>';
      o += '<div class="card mb">' + U.tbl(['Màn', 'Làm gì', 'Khoá ở quyền', 'Ai thấy'],
        g.items.map(function (it) {
          return [(it.star ? '★ ' : '') + h(it.t) + '<br><span class="tiny dim">' + h(it.v) +
              (it.hienKhi ? ' · chỉ hiện khi ' + h(it.hienKhi) : '') + '</span>',
            h(it.h || ''),
            it.perm ? '<b style="color:' + (it.rieng ? '#BE0E16' : '#B4720F') + '">' +
              h(it.perm) + '</b>' : '<span class="dim">—</span>',
            it.rieng ? '<b style="color:#BE0E16">' + it.soVai + ' vị trí · CHỈ QUẢN TRỊ</b>'
              : it.soVai + ' / ' + (G.ROLES || []).length + ' vị trí'];
        })) + '</div>';
    });

    /* ── Một quyền mở ra những màn nào ── */
    var q = G.staTheoQuyen();
    o += U.sec('Cấp một quyền là mở ra bao nhiêu màn',
      'Bảng này lật ngược danh mục. Đọc nó TRƯỚC khi cấp quyền cho ai — cấp một quyền ' +
      'thường là mở cả một nhóm màn, không phải một màn.');
    o += '<div class="card mb">' + U.tbl(['Quyền', 'Tới bậc', 'Mở ra', 'Gồm những màn nào'],
      (q.ds || []).map(function (x) {
        return ['<b>' + h(x.perm) + '</b>' + (x.ten ? '<br><span class="tiny dim">' +
            h(x.ten) + '</span>' : ''),
          x.tran >= 99 ? '<span class="dim">mọi vị trí</span>' : '<b>' + x.tran + '</b>',
          '<b style="color:' + (x.tran <= 2 ? '#BE0E16' : '#B4720F') + '">' + x.so + ' màn</b>',
          '<span class="tiny">' + h(x.man.map(function (m) { return m.t; }).join(' · ')) + '</span>'];
      })) + '</div>';

    /* ── Bậc thang có còn đúng không ── */
    o += U.sec('Bậc thang mười lăm vị trí — đo lúc chạy',
      'Bảng này đọc từ hệ đang chạy. Phép canh đi kèm nó KHÔNG phải "bậc thang có đảo ' +
      'ngược không" — cách hệ tính tầm nhìn khiến chuyện ấy không xảy ra được. Nó canh ' +
      'hai chỗ hỏng thật: quyền khai trên màn có tồn tại không, và Super Admin có thấy ' +
      'hết không.');
    o += '<div class="card mb" style="border-color:' +
      ((kqV.loi || []).length ? '#BE0E16' : '#0B6675') + '56">' +
      U.tbl(['Bậc', 'Vị trí', 'Thấy bao nhiêu màn'],
        (kqV.dem || []).map(function (x) {
          return ['<b>' + x.lv + '</b>', h(x.id) + ' · ' + h(x.n),
            '<b>' + x.so + '</b> <span class="tiny dim">/ ' + d.tongMan + '</span>'];
        })) +
      '<p class="tiny mt" style="line-height:1.75">' +
      ((kqV.loi || []).length ? '<b style="color:#BE0E16">' + h((kqV.loi || []).join(' · ')) + '</b>'
        : '<b style="color:#0B6675">Mọi quyền khai trên màn đều có thật trong bảng quyền, ' +
          'và Super Admin thấy đủ ' + d.tongMan + ' màn.</b>') + '</p></div>';

    /* ── Mười điều cấm ── */
    o += U.sec('Mười điều Super Admin không được làm', '');
    o += '<div class="card mb">' + (G.STA_CAM || []).map(function (x) {
      return '<div style="padding:9px 0;border-bottom:1px solid var(--gita-vien-2)">' +
        '<b class="sm" style="color:#BE0E16">' + h(x.cam) + '</b>' +
        '<p class="tiny mt" style="line-height:1.75">' + h(x.vi) + '</p></div>';
    }).join('') + '</div>';

    /* ── Sổ tay tự soi mình ── */
    o += U.sec('Sổ tay tự soi mình',
      (G.STA_LUAT || {}).nguoiVietPhanKhongSuyDuoc || '');
    o += '<div class="card mb">' + U.tbl(['Phép kiểm', 'Canh gì', 'Kết quả'], [
      ['staSoiPhuHet()', 'Mỗi nhóm có lời dẫn, mọi ô man trỏ vào màn có thật',
        (kqP.loi || []).length ? '<b style="color:#BE0E16">' + h((kqP.loi || []).join(' · ')) + '</b>'
          : '<b style="color:#0B6675">' + kqP.soNhom + ' nhóm · ' + kqP.tongMan +
            ' màn · mọi mối nối trỏ đúng chỗ</b>'],
      ['staSoiKhopVai()', 'Quyền khai trên màn có thật trong G.PERM · Super Admin thấy hết',
        (kqV.loi || []).length ? '<b style="color:#BE0E16">' + h((kqV.loi || []).join(' · ')) + '</b>'
          : '<b style="color:#0B6675">' + (kqV.dem || []).length + ' vị trí · bậc thang còn đúng</b>'],
      ['staSoiKhongChep()', 'Kho người-viết TRỎ vào màn, không CHÉP danh sách màn',
        (kqC.loi || []).length ? '<b style="color:#BE0E16">' + h((kqC.loi || []).join(' · ')) + '</b>'
          : '<b style="color:#0B6675">nhắc ' + kqC.nhac + '/' + kqC.tong +
            ' màn · dưới trần ' + kqC.tran + ' — kho đang trỏ, không chép</b>']
    ]) + '</div>';

    return o;
  };
})();
