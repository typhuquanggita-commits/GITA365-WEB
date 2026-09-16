/* ═══════════════════════════════════════════════════════════════
   GITA 365 — NHÀ MÌNH ĐÃ ĐỔI GÌ

   Anh Quang đặt năm tiêu chuẩn, và cái thứ năm là "dễ thấy tiến bộ,
   thay đổi tích cực". Đo lại thì chữ "tiến bộ" xuất hiện 2.537 lần
   trong toàn bộ nội dung — mà không màn nào TÍNH RA được nó. Cả hệ
   thống nói về tiến bộ; không chỗ nào chỉ ra tiến bộ.

   Màn này làm đúng một việc: đặt con số của TUẦN NÀY cạnh con số của
   TUẦN TRƯỚC, và nói phần chênh lệch bằng lời của gia đình.

   BA LUẬT TỰ ĐẶT

   1. So với CHÍNH MÌNH, không so với nhà khác. Một nhà đang đi lên từ
      nền thấp cần biết mình đã lên; đặt họ cạnh nhà khác chỉ làm họ
      thấy mình kém, và người thấy mình kém thì bỏ cuộc sớm.
   2. Không có tuần trước thì KHÔNG vẽ mũi tên. Tuần đầu tiên chưa có
      gì để so — nói thẳng "đây là tuần đầu, tuần sau mới so được" chứ
      không vẽ một mũi tên xanh từ số không.
   3. Tụt cũng hiện, và hiện bằng đúng giọng ấy. Giấu tuần xấu đi thì
      bảng này thành bảng khen, và bảng khen thì không ai tin tới lần
      thứ ba.
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

  /* Đếm dấu vết thật trong một khoảng ngày. Mọi số đều đọc từ thứ chính
     gia đình đã ghi trong máy này — không số nào do người khác nhập. */
  function demTrongKhoang(tuNgay, denNgay) {
    var j = G.S.journal || {}, chot = G.S.chotKhNgay || {};
    var toi = 0, tongPt = 0, soChot = 0;
    Object.keys(j).forEach(function (k) {
      var v = j[k];
      var co = typeof v === 'string' ? v.trim().length > 2 : !!v;
      if (!co) return;
      /* Khoá sổ nhật ký có dạng ngày thì lọc theo ngày; không thì tính chung */
      if (/^\d{4}-\d{2}-\d{2}$/.test(k)) { if (k >= tuNgay && k <= denNgay) toi++; }
      else toi++;
    });
    Object.keys(chot).forEach(function (d) {
      if (d >= tuNgay && d <= denNgay) { tongPt += Number(chot[d].pt) || 0; soChot++; }
    });
    return { toi: toi, nhip: soChot ? Math.round(tongPt / soChot) : null, soChot: soChot };
  }

  function tuan(lui) {
    var nay = Date.now();
    var den = ngayCua(nay - lui * 7 * NGAY);
    var tu = ngayCua(nay - (lui * 7 + 6) * NGAY);
    return { tu: tu, den: den };
  }

  /* Bảng so: mỗi dòng là một thứ đo được, kèm lời giải thích bằng tiếng
     nhà mình. Không dòng nào chỉ có một con số đứng trơ. */
  G.tbSoTuan = function () {
    var a = tuan(0), b = tuan(1);
    var nay = demTrongKhoang(a.tu, a.den);
    var truoc = demTrongKhoang(b.tu, b.den);
    var kpi = G.khKpiNgay ? G.khKpiNgay() : null;
    var bai = 0;
    Object.keys(G.S.test || {}).forEach(function (k) { if (G.S.test[k] && G.S.test[k].xong) bai++; });

    var ds = [
      { ma: 'toi', ten: 'Số tối có ghi nhật ký',
        nay: nay.toi, truoc: truoc.toi, donVi: 'tối',
        y: 'Đây là việc duy nhất trong cả hệ thống không ai làm hộ được. Ghi cả tối "quên" cũng tính.',
        len: 'Thêm được tối nào là thêm một ngày nhà mình nhìn thấy sự thật thay vì nhớ lại.',
        xuong: 'Tuần này ghi ít hơn. Không sao — nhưng đừng để hai tuần liền như vậy, vì bảy tối liên tục mới đọc ra được một nếp.' },
      { ma: 'nhip', ten: 'Nhịp giữ được mỗi ngày',
        nay: nay.nhip, truoc: truoc.nhip, donVi: '%',
        y: 'Trung bình năm nhịp của những ngày nhà mình đã chốt trong tuần.',
        len: 'Nhịp lên nghĩa là việc đang chuyển từ chỗ phải nhớ sang chỗ tự làm.',
        xuong: 'Nhịp tụt thường vì tuần có việc đột xuất. Nhìn lại xem nhịp nào rơi trước — đó là nhịp yếu nhất của nhà mình.' }
    ];
    return { ds: ds, kpiHomNay: kpi, soBai: bai, tuanNay: a, tuanTruoc: b };
  };

  /* ═══════════ MÀN ═══════════ */
  G.VIEWS['tien-bo'] = function () {
    var t = G.tbSoTuan();
    var coTruoc = t.ds.some(function (x) { return x.truoc !== null && x.truoc > 0; });

    var o = U.ph({ eyebrow: 'NHÀ MÌNH ĐÃ ĐỔI GÌ', ic: 'chart', grad: 1,
      t: 'Tuần này so với tuần trước',
      lead: 'Trang này chỉ làm một việc: đặt con số tuần này cạnh con số tuần trước. ' +
        'Không so nhà mình với nhà nào khác — chỉ so với chính nhà mình bảy ngày trước.' });

    if (!coTruoc) {
      o += '<div class="card mb" style="border-color:var(--gita-vien-2)">' +
        '<div class="row mb" style="gap:9px"><span style="color:var(--gold-ink)">' + ic('seed', 'w-4 h-4') + '</span>' +
        '<b>Đây là tuần đầu — chưa có gì để so</b></div>' +
        '<p class="sm dim" style="line-height:1.8">Tuần sau mở lại trang này là thấy được chênh lệch. ' +
        'Bên em không vẽ mũi tên đi lên từ số không: một mũi tên như thế trông đẹp mà không nói được gì.</p>' +
        '<p class="sm mt" style="line-height:1.8"><b>Việc của tuần này:</b> ghi nhật ký tối nay. ' +
        'Ba dòng thôi — giờ ngồi vào bàn, giờ rời bàn, số lần phải nhắc.</p>' +
        '<button class="btn pri blk mt" data-v="nhat-ky-vi-tri">' + ic('book') + 'Mở sổ ghi tối nay</button></div>';
    }

    o += '<div class="grid g2 mb">' + t.ds.map(function (x) {
      var coSo = x.nay !== null && x.truoc !== null;
      var chenh = coSo ? x.nay - x.truoc : null;
      var mau = chenh === null ? 'var(--ink-4)' : chenh > 0 ? '#0B7350' : chenh < 0 ? '#B4720F' : 'var(--ink-3)';
      var loi = chenh === null ? '' : chenh > 0 ? x.len : chenh < 0 ? x.xuong :
        'Giữ nguyên. Giữ được đã là một việc — nếp là thứ đứng yên được, không phải thứ lúc nào cũng lên.';
      return '<div class="card" style="border-color:' + mau + '2e">' +
        '<b class="sm" style="display:block;margin-bottom:9px">' + h(x.ten) + '</b>' +
        '<div class="row wrap" style="gap:16px;align-items:baseline;margin-bottom:10px">' +
        '<div><div class="tiny up muted">TUẦN NÀY</div>' +
        '<b style="font-size:26px;color:' + mau + '">' + (x.nay === null ? '—' : x.nay) + '</b>' +
        '<span class="tiny muted"> ' + h(x.donVi) + '</span></div>' +
        '<div><div class="tiny up muted">TUẦN TRƯỚC</div>' +
        '<b style="font-size:18px;color:var(--ink-3)">' + (x.truoc === null ? '—' : x.truoc) + '</b>' +
        '<span class="tiny muted"> ' + h(x.donVi) + '</span></div>' +
        (chenh === null ? '' :
          '<div><div class="tiny up muted">CHÊNH LỆCH</div>' +
          '<b style="font-size:18px;color:' + mau + '">' + (chenh > 0 ? '+' : '') + chenh + '</b></div>') +
        '</div>' +
        '<p class="tiny muted mb" style="line-height:1.7">' + h(x.y) + '</p>' +
        (loi ? '<div class="card pad-sm" style="border-color:' + mau + '26">' +
          '<p class="tiny" style="line-height:1.75">' + h(loi) + '</p></div>' : '') +
        '</div>';
    }).join('') + '</div>';

    /* Việc của hôm nay — luật 3 của chuẩn lời: nói việc trước, lý do sau */
    if (t.kpiHomNay) {
      var chuaDat = t.kpiHomNay.chiTiet.filter(function (x) { return !x.dat; });
      o += U.sec('HÔM NAY CÒN THIẾU GÌ', 'Làm xong một dòng ở đây là con số tuần này nhích lên.');
      o += '<div class="card mb">' +
        (chuaDat.length
          ? chuaDat.map(function (x) {
              return '<div class="row" style="gap:10px;align-items:flex-start;margin-bottom:10px">' +
                '<span style="flex:none;color:var(--ink-4)">' + ic('dot', 'w-4 h-4') + '</span>' +
                '<div style="flex:1"><b class="sm">' + h(x.ten) + '</b>' +
                '<p class="tiny muted" style="line-height:1.65">' + h(x.dieu) + '</p></div></div>';
            }).join('')
          : '<p class="sm" style="line-height:1.75">Hôm nay nhà mình đã giữ đủ cả năm nhịp. ' +
            'Không còn việc nào ở đây — đóng máy và nghỉ.</p>') +
        '</div>';
    }

    o += '<div class="card" style="border-color:var(--gita-vien-1)">' +
      '<p class="tiny" style="line-height:1.75;color:var(--ink-2)">' +
      '<b>Vì sao trang này không so nhà mình với nhà khác.</b> Mỗi nhà bắt đầu từ một chỗ khác nhau. ' +
      'Một nhà đi từ hai tối lên năm tối đã đổi rất nhiều, dù vẫn kém một nhà khác đang ở bảy tối. ' +
      'Đặt hai nhà cạnh nhau chỉ làm nhà đi sau thấy mình kém — mà người thấy mình kém thì bỏ giữa chừng.</p>' +
      '<p class="tiny mt" style="line-height:1.75;color:var(--ink-2)">' +
      '<b>Và vì sao tuần xấu vẫn hiện.</b> Giấu tuần xấu đi thì trang này thành trang khen. ' +
      'Trang khen thì tới lần thứ ba không ai tin nữa, kể cả lúc nó khen đúng.</p></div>';

    o += '<div class="row wrap mt2" style="gap:8px">' +
      '<button class="btn ghost sm" data-v="nhat-ky-vi-tri">' + ic('book') + 'Sổ ghi mỗi tối</button>' +
      '<button class="btn ghost sm" data-v="kpi-toi">' + ic('chart') + 'Nhịp của nhà mình</button>' +
      '<button class="btn ghost sm" data-v="bat-dau">' + ic('seed') + 'Năm bước đầu</button></div>';
    return o;
  };
})();
