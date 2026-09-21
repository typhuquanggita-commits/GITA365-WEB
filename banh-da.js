/* ═══════════════════════════════════════════════════════════════
   GITA 365 — MÁY CHẠY MƯỜI BÁNH ĐÀ

   Kho chuẩn ở kho-goc/data.banh-da.js (BD_LON · BD_CAP · BD_CHON ·
   BD_LUAT · BD_DAN). Tệp này là phần CHẠY: đếm bằng chứng, tính cấp độ,
   chọn việc gợi ý tiếp theo, và soi chính cấu trúc mười bánh đà.

   MỘT ĐIỀU TỰ ĐẶT VÀ SẼ KHÔNG NỚI: mọi con số ở đây đọc từ DỮ LIỆU NHÀ
   TỰ GHI. Không có mốc nào mở bằng nút bấm, không có phần trăm nào ước
   lượng. Nhà chưa ghi gì thì màn hình nói thẳng là chưa có gì để đo, và
   chỉ ra đúng một việc để bắt đầu.

   Vì sao chặt thế: cả lớp này là một trò chơi, mà trò chơi nào cũng có
   người tìm đường tắt. Đường tắt duy nhất bị chặn ở đây là đường tắt
   quan trọng nhất — không ai lên cấp bằng cách bấm.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;
G.VIEWS = G.VIEWS || {};

(function () {
  var U = G.U, h = U.h, ic = U.ic;

  /* ─── Bằng chứng, đếm từ sổ của chính nhà mình ───
     journal là sổ nhật ký tối; chotKhNgay là ngày đã chốt nhịp; test là
     bài đánh giá đã làm xong. Ba nguồn ấy đều do gia đình tạo ra. */
  function ngaySo(k) { return /^\d{4}-\d{2}-\d{2}$/.test(k) ? k : null; }
  function ngayCuaTs(ts) {
    var d = new Date(ts);
    return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
  }

  G.bdBangChung = function () {
    var j = G.S.journal || {}, chot = G.S.chotKhNgay || {}, test = G.S.test || {};
    var ngay = [];
    Object.keys(j).forEach(function (k) {
      var v = j[k], co = typeof v === 'string' ? v.trim().length > 2 : !!v;
      if (co && ngaySo(k)) ngay.push(k);
    });
    Object.keys(chot).forEach(function (k) { if (ngaySo(k) && ngay.indexOf(k) < 0) ngay.push(k); });
    ngay.sort();

    /* Chuỗi dài nhất: ngày liền nhau, tính bằng chênh lệch đúng một ngày */
    /* Chuỗi: ngày liền nhau. Nhưng ngày trống NẰM TRONG một mùa được bảo
       vệ thì không làm đứt — đà đã có không bị xoá vì một chuyện nhà mình
       không chọn. Ngày ấy vẫn KHÔNG được tính là ngày có ghi: bảo vệ thì
       bảo vệ, không phát không. */
    var dai = 0, chay = 0, truoc = null;
    ngay.forEach(function (d) {
      var t = new Date(d + 'T00:00:00').getTime();
      var lien = truoc !== null && t - truoc === 86400000;
      if (!lien && truoc !== null && G.ttNgayDuocGiuChuoi) {
        lien = true;
        for (var x = truoc + 86400000; x < t; x += 86400000) {
          if (!G.ttNgayDuocGiuChuoi(ngayCuaTs(x))) { lien = false; break; }
        }
      }
      chay = lien ? chay + 1 : 1;
      if (chay > dai) dai = chay;
      truoc = t;
    });
    var bai = 0;
    Object.keys(test).forEach(function (k) { if (test[k] && test[k].xong) bai++; });
    return { toi: ngay.length, chuoi: dai, bai: bai, ngay: ngay };
  };

  /* ─── Cấp độ ───
     Đi từ cấp 1 lên, dừng ở cấp đầu tiên CHƯA đạt. Không nhảy cóc: đạt
     điều kiện cấp 5 mà chưa đạt cấp 3 thì vẫn đứng ở cấp 2 — vì mỗi cấp
     mở ra một bánh đà, và bánh đà sau dựa lên bánh đà trước. */
  G.bdCap = function () {
    var b = G.bdBangChung(), ds = G.BD_CAP || [], dat = 0;
    for (var i = 0; i < ds.length; i++) {
      var dk = ds[i].dk || {};
      if (b.toi < (dk.toi || 0)) break;
      if (dk.chuoi && b.chuoi < dk.chuoi) break;
      if (dk.bai && b.bai < dk.bai) break;
      dat = ds[i].cap;
    }
    var sau = ds.filter(function (c) { return c.cap === dat + 1; })[0] || null;
    return { cap: dat, bangChung: b,
      hienTai: ds.filter(function (c) { return c.cap === dat; })[0] || null,
      tiepTheo: sau,
      thieu: sau ? thieuGi(b, sau.dk || {}) : [] };
  };

  function thieuGi(b, dk) {
    var t = [];
    if (dk.toi && b.toi < dk.toi) t.push('còn ' + (dk.toi - b.toi) + ' tối có ghi');
    if (dk.chuoi && b.chuoi < dk.chuoi) t.push('cần một chuỗi ' + dk.chuoi + ' ngày liền (dài nhất đang là ' + b.chuoi + ')');
    if (dk.bai && b.bai < dk.bai) t.push('còn ' + (dk.bai - b.bai) + ' bài đánh giá');
    return t;
  }

  /* ─── Bánh đà nào đã mở ───
     Mỗi cấp mở một bánh đà, theo đúng thứ tự. Cấp 0 thì chưa mở cái nào —
     và nói thẳng là chưa, chứ không mở sẵn cả mười cho đẹp. */
  G.bdDaMo = function () {
    var c = G.bdCap().cap;
    return (G.BD_LON || []).filter(function (b) { return b.so <= c; });
  };

  /* ─── Việc gợi ý tiếp theo ───
     Lấy từ bánh đà vừa mở gần nhất, việc nhỏ đầu tiên chưa đánh dấu. Một
     việc, không phải mười — giao mười việc cho một nhà đang mệt là đúng
     loại lãng phí LP-THUA trong bảng tinh gọn. */
  G.bdViecTiep = function () {
    var mo = G.bdDaMo();
    if (!mo.length) return null;
    var b = mo[mo.length - 1];
    var da = (G.S.checks || {});
    for (var i = 0; i < b.nho.length; i++) if (!da['bd-' + b.nho[i].ma]) return { lon: b, nho: b.nho[i] };
    return { lon: b, nho: b.nho[0] };
  };

  G.bdChonCua = function (cap) {
    return (G.BD_CHON || []).filter(function (c) { return c.cap === cap; })[0] || null;
  };

  /* ─── Soi chính cấu trúc ───
     Mười bánh đà lớn, mỗi cái đúng mười nhỏ, mã không trùng, vòng nào
     cũng khép. Đây là phép đo mà bộ kiểm phát hành gọi tới. */
  G.bdSoiCauTruc = function () {
    var L = G.BD_LON || [], ma = {}, trung = [], thieuNho = [], vongHo = [], thieuDau = [];
    L.forEach(function (b) {
      if ((b.nho || []).length !== 10) thieuNho.push(b.ma + ':' + (b.nho || []).length);
      if (!b.dau) thieuDau.push(b.ma);
      /* Vòng khép cần ít nhất ba mũi tên: A→B→C→(quay lại A) */
      if ((String(b.vong || '').split('→').length - 1) < 3) vongHo.push(b.ma);
      (b.nho || []).forEach(function (n) {
        if (ma[n.ma]) trung.push(n.ma); else ma[n.ma] = 1;
      });
    });
    var caps = (G.BD_CAP || []).map(function (c) { return c.cap; });
    return { soLon: L.length, soNho: Object.keys(ma).length,
      trung: trung, thieuNho: thieuNho, vongHo: vongHo, thieuDau: thieuDau,
      capLienTuc: caps.every(function (c, i) { return c === i + 1; }),
      soCap: caps.length };
  };

  /* ─── Điều kiện máy đọc có khớp với lời hứa trên màn không ───
     `dk` là điều kiện máy dùng; `mocThat` là cùng điều kiện viết bằng lời
     cho gia đình. Lệch nhau thì màn hình hứa một đằng máy mở một nẻo. So
     bằng cách rút mọi con số trong `mocThat` và đòi chúng chứa đủ các số
     trong `dk`. */
  G.bdSoiLoiHua = function () {
    return (G.BD_CAP || []).filter(function (c) {
      var so = (String(c.mocThat || '').match(/\d+/g) || []).map(Number);
      var dk = c.dk || {};
      return ['toi', 'chuoi', 'bai'].some(function (k) {
        return dk[k] && so.indexOf(dk[k]) < 0;
      });
    }).map(function (c) { return c.cap; });
  };

  /* ═══════════ TIA HY VỌNG — MỘT PHẦN TRĂM CỦA HÔM NAY ═══════════

     BD_CAP đã có đủ bốn cột cần cho việc này từ lâu, và chưa màn nào
     ghép chúng lại thành một câu:

       bangChung  nhà mình ĐÃ làm được bao nhiêu   (đo, không hỏi)
       thieu      còn đúng bao nhiêu nữa           (đây là 1% của hôm nay)
       mo         qua mốc thì mở ra gì
       wow        và nhà mình sẽ THẤY gì

     Cột `wow` là chỗ khác biệt. Nó không hứa "gia đình hạnh phúc" — nó
     nói một thứ cụ thể nhà mình sẽ nhìn thấy, lấy từ chính dữ liệu nhà
     mình vừa ghi. Lời hứa mơ hồ thì ai cũng viết được và không ai đòi
     được; lời hứa cụ thể thì đòi được, nên nó mới là tia hy vọng thật.

     KHÔNG BỊA KHI CHƯA CÓ SỔ. Chưa ghi tối nào thì nói thẳng việc duy
     nhất lúc ấy là ghi tối đầu tiên — không vẽ một thanh tiến độ rỗng
     rồi gọi nó là khởi đầu. */
  G.bdTiaHyVong = function () {
    if (!G.BD_CAP) return '';
    var t = G.bdCap(), b = t.bangChung || {}, sau = t.tiepTheo;
    if (!sau) return '';                       /* hết mốc — không hứa thêm */
    var dk = sau.dk || {};
    /* Phần trăm đi được tới mốc kế: đo trên chỉ số CÒN THIẾU NHIỀU NHẤT,
       không lấy trung bình. Trung bình ba chỉ số làm thanh đầy lên trong
       khi cái chặn thật vẫn đứng yên — và đó là một lời hứa sai. */
    var pt = 100;
    ['toi', 'chuoi', 'bai'].forEach(function (k) {
      if (!dk[k]) return;
      pt = Math.min(pt, Math.round(((b[k] || 0) / dk[k]) * 100));
    });
    pt = Math.max(0, Math.min(100, pt));
    var chuaGhi = !(b.toi > 0);

    return '<div class="tia">' +
      '<div class="tia-dinh">' +
        '<span class="tia-nhan">BƯỚC KẾ TIẾP</span>' +
        '<b class="tia-moc" style="color:' + (sau.c || 'var(--gita)') + '">' + h(sau.ten) + '</b>' +
      '</div>' +
      (chuaGhi
        ? '<p class="tia-viec">Ghi tối đầu tiên. Chỉ một tối, và chưa cần sửa gì cả.</p>'
        : '<p class="tia-viec">' + h((t.thieu || []).join(' · ')) + '</p>') +
      '<div class="tia-thanh"><i style="width:' + pt + '%;background:' +
        (sau.c || 'var(--gita)') + '"></i></div>' +
      '<p class="tia-da">Nhà mình đã có: <b>' + (b.toi || 0) + ' tối có ghi</b>' +
        (b.chuoi ? ' · chuỗi dài nhất <b>' + b.chuoi + '</b>' : '') +
        (b.bai ? ' · <b>' + b.bai + '</b> bài đã học' : '') + '</p>' +
      (sau.mo ? '<p class="tia-mo"><b>Qua mốc này thì mở:</b> ' + h(sau.mo) + '</p>' : '') +
      (sau.wow ? '<p class="tia-wow">' + h(sau.wow) + '</p>' : '') +
      '</div>';
  };

  /* ═══════════ MÀN: MƯỜI BÁNH ĐÀ ═══════════ */
  G.VIEWS['banh-da'] = function () {
    if (!G.BD_LON)
      return U.empty('Chưa mở được phần bánh đà',
        'Phần này nằm trong gói nền. Đăng nhập lại để nạp.');

    var t = G.bdCap();
    var viec = G.bdViecTiep();
    var chon = G.bdChonCua(t.cap + 1) || G.bdChonCua(t.cap);

    var o = U.ph({ eyebrow: 'MƯỜI BÁNH ĐÀ', ic: 'orbit', grad: 1,
      t: 'Việc trước đẻ ra sức cho việc sau',
      lead: 'Một danh sách việc thì làm xong là hết. Một bánh đà thì tới một điểm nó tự quay. ' +
        'Mọi mốc dưới đây mở bằng chính thứ nhà mình đã ghi — không có mốc nào mở bằng cách bấm nút.' });

    /* Cấp hiện tại — nói thẳng khi chưa có gì */
    if (!t.cap) {
      o += '<div class="card mb" style="border-color:#B4720F2e">' +
        '<b>Chưa có gì để đo</b>' +
        '<p class="sm dim mt" style="line-height:1.8">Nhà mình chưa ghi tối nào, nên chưa có con số nào để nói. ' +
        'Bên em không mở sẵn mười bánh đà cho đẹp — mở sẵn thì nhìn thì vui mà không có nghĩa gì.</p>' +
        '<p class="sm mt" style="line-height:1.8"><b>Việc duy nhất của tối nay:</b> ghi ba dòng — ' +
        'giờ ngồi vào bàn, giờ rời bàn, số lần phải nhắc.</p>' +
        '<button class="btn pri blk mt" data-v="nhat-ky-vi-tri">' + ic('book') + 'Mở sổ ghi tối nay</button></div>';
    } else {
      var ht = t.hienTai || {};
      o += '<div class="card mb" style="border-color:' + (ht.c || '#0B7350') + '2e">' +
        '<div class="row wrap" style="gap:10px;align-items:baseline">' +
        '<span class="tiny up" style="color:' + ht.c + '">CẤP ' + t.cap + ' / 10</span>' +
        '<b>' + h(ht.ten || '') + '</b></div>' +
        '<p class="sm mt" style="line-height:1.8"><b>Điểm chạm của cấp này:</b> ' + h(ht.wow || '') + '</p>' +
        '<p class="tiny dim mt">Đọc từ sổ của nhà mình: ' + t.bangChung.toi + ' tối có ghi · ' +
        'chuỗi dài nhất ' + t.bangChung.chuoi + ' ngày · ' + t.bangChung.bai + ' bài đánh giá.</p></div>';
    }

    if (t.tiepTheo) {
      o += '<div class="card mb"><b class="sm">Cấp ' + t.tiepTheo.cap + ' · ' + h(t.tiepTheo.ten) + '</b>' +
        '<p class="sm dim mt" style="line-height:1.8"><b>Mở khi:</b> ' + h(t.tiepTheo.mocThat) + '</p>' +
        (t.thieu.length ? '<p class="sm mt" style="line-height:1.8"><b>Còn thiếu:</b> ' +
          h(t.thieu.join(' · ')) + '</p>' : '') +
        '<p class="tiny mt" style="line-height:1.7;color:#0B7350"><b>Mở ra thì có gì:</b> ' +
        h(t.tiepTheo.mo) + '</p></div>';
    }

    if (viec) {
      o += '<div class="card mb" style="border-color:' + viec.lon.c + '2e">' +
        '<span class="tiny up" style="color:' + viec.lon.c + '">VIỆC GỢI Ý TIẾP THEO · ' + h(viec.lon.ten) + '</span>' +
        '<b class="sm" style="display:block;margin:7px 0">' + h(viec.nho.ten) + '</b>' +
        '<p class="sm" style="line-height:1.8"><b>Làm:</b> ' + h(viec.nho.viec) + '</p>' +
        '<p class="sm dim mt" style="line-height:1.8"><b>Sẽ thấy:</b> ' + h(viec.nho.thay) + '</p>' +
        '<p class="tiny muted mt">Một việc, không phải mười. Giao mười việc cho một nhà đang mệt là làm thừa, không phải làm nhiều.</p></div>';
    }

    /* Ngã ba của cấp sắp tới — phần học như chơi Cashflow */
    if (chon) {
      o += U.sec('Ngã ba sắp tới', 'Mỗi lựa chọn có một cái giá, và cái giá ấy nói bằng số ngày.');
      o += '<div class="card mb" style="border-color:#BE0E1626">' +
        '<p class="sm" style="line-height:1.8"><b>Khi nào gặp:</b> ' + h(chon.khi) + '</p>' +
        '<div class="grid g2 mt">' +
        '<div class="card" style="border-color:#BE0E1626"><span class="tiny up" style="color:#BE0E16">NHÁNH DỄ</span>' +
        '<p class="sm mt" style="line-height:1.8">' + h(chon.deChon) + '</p>' +
        '<p class="tiny mt" style="color:#BE0E16"><b>Giá: chậm hơn ' + chon.giaNgay + ' ngày</b></p></div>' +
        '<div class="card" style="border-color:#0B735026"><span class="tiny up" style="color:#0B7350">' +
        h(chon.ai) + ' GỢI Ý</span>' +
        '<p class="sm mt" style="line-height:1.8">' + h(chon.nenChon) + '</p></div></div>' +
        '<p class="sm mt" style="line-height:1.8"><b>Vì sao nhánh dễ đắt:</b> ' + h(chon.viSao) + '</p>' +
        '</div>';
    }

    /* Mười bánh đà — đã mở thì mở ruột, chưa mở thì chỉ hiện tên và điều kiện */
    o += U.sec('Mười bánh đà', 'Mỗi bánh đà lớn có mười việc nhỏ. Bánh đà chưa mở thì chưa hiện ruột — mở sẵn là hứa suông.');
    o += (G.BD_LON || []).map(function (b) {
      var moRoi = b.so <= t.cap;
      return '<div class="card mb" style="border-color:' + b.c + (moRoi ? '2e' : '14') + '">' +
        '<div class="row wrap" style="gap:10px;align-items:baseline">' +
        '<span class="tiny up" style="color:' + b.c + '">BÁNH ĐÀ ' + b.so + ' · ' + h(b.tang) + '</span>' +
        '<b>' + h(b.ten) + '</b>' +
        '<span class="tiny" style="margin-left:auto;color:' + (moRoi ? '#0B7350' : 'var(--ink-4)') + '">' +
        (moRoi ? 'đã mở' : 'mở ở cấp ' + b.so) + '</span></div>' +
        '<p class="sm mt" style="line-height:1.8"><b>Vòng:</b> ' + h(b.vong) + '</p>' +
        (moRoi
          ? '<p class="sm dim mt" style="line-height:1.8">' + h(b.y) + '</p>' +
            '<p class="tiny mt" style="line-height:1.7;color:#B4720F"><b>Dấu hiệu đang đứng:</b> ' + h(b.dau) + '</p>' +
            '<div class="mt">' + b.nho.map(function (n) {
              return '<div class="tiny" style="padding:5px 0;border-top:1px solid var(--gita-vien-2)">' +
                '<b>' + h(n.ten) + '</b> — ' + h(n.viec) +
                '<div class="muted">' + h(n.thay) + '</div></div>';
            }).join('') + '</div>'
          : '<p class="tiny muted mt">Mười việc nhỏ của bánh đà này mở ra khi nhà mình tới cấp ' + b.so + '.</p>') +
        '</div>';
    }).join('');

    o += U.sec('Sáu luật của lớp này', '');
    o += '<div class="card">' + (G.BD_LUAT || []).map(function (l) {
      return '<div style="padding:8px 0;border-bottom:1px solid var(--gita-vien-2)">' +
        '<b class="sm">' + l.no + '. ' + h(l.t) + '</b>' +
        '<p class="tiny dim mt" style="line-height:1.7">' + h(l.y) + '</p></div>';
    }).join('') + '</div>';
    return o;
  };
})();
