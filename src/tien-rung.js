/* ═══════════════════════════════════════════════════════════════
   GITA 365 — MÁY CHẠY KINH TẾ HỌC CỦA RỪNG

   Kho chuẩn ở kho-goc/data.tien-rung.js. Ba hàm làm việc thật:

   1. trCatTiep() — trả về nhóm chi phải cắt TIẾP THEO, và TỪ CHỐI cắt
      nhân bản hay bão khi còn nhóm khác chưa cắt. Thứ tự viết sẵn để
      lúc túng không phải quyết; nhưng thứ tự nằm trong lời thì lúc
      túng người ta vẫn cắt theo cảm giác. Nên nó phải là một hàm.

   2. trSoiNguon() — không nguồn nào chạm nửa. Nguồn nào quá nửa thì
      nguồn đó bắt đầu quyết định hệ mà không cần nói ra.

   3. trChuaDien() — đếm những ô CHỦ HỆ phải tự điền. Sáu ô ấy tôi
      không điền, và màn hình in ra chúng mỗi lần mở, để chúng không
      chìm dần vào im lặng như đã chìm mấy bản nay.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;
G.VIEWS = G.VIEWS || {};

(function () {
  var U = G.U, h = U.h;

  /* ─── Cắt tiếp nhóm nào ───
     `daCat` là danh sách mã đã cắt. Trả về nhóm tiếp theo theo đúng
     thứ tự, và trả `ok:false` khi ai đó định cắt nhân bản hay bão
     trong lúc còn nhóm rẻ hơn chưa đụng tới. */
  G.trCatTiep = function (daCat) {
    var da = daCat || [];
    var con = (G.TR_CHI || []).filter(function (c) { return da.indexOf(c.ma) < 0; });
    if (!con.length) return { ok: false, het: true, loi: 'Đã cắt hết. Không còn gì để cắt — đây là lúc nói thật với cả rừng, không phải lúc tìm thêm chỗ cắt.' };
    con.sort(function (a, b) { return a.catThu - b.catThu; });
    return { ok: true, cat: con[0], con: con.length };
  };

  G.trDuocCat = function (ma, daCat) {
    var t = G.trCatTiep(daCat);
    if (!t.ok) return { ok: false, loi: t.loi };
    if (t.cat.ma === ma) return { ok: true, cat: t.cat };
    var c = (G.TR_CHI || []).filter(function (x) { return x.ma === ma; })[0];
    return { ok: false, phaiCat: t.cat,
      loi: 'Chưa tới lượt ' + (c ? c.ten : ma) + '. Cắt ' + t.cat.ten + ' trước. ' +
        (c && c.catThu === 5 ? c.catGi : (G.TR_CAT_LUAT || {}).vi || '') };
  };

  /* ─── Nguồn nào chạm nửa chưa ───
     Luật 3: nguồn nào chiếm quá nửa thì nguồn đó bắt đầu quyết định hệ
     mà không cần nói ra. */
  G.trSoiNguon = function () {
    return (G.TR_NGUON || []).filter(function (n) { return !n.tranPt || n.tranPt >= 50 || !n.dieuKien; })
      .map(function (n) { return n.ma + ':' + n.tranPt; });
  };

  /* ─── Năm nhóm chi cộng đúng một trăm chưa ─── */
  G.trSoiChi = function () {
    var ds = G.TR_CHI || [];
    if (!ds.length) return ['thiếu TR_CHI'];
    var loi = [];
    var tong = ds.reduce(function (a, c) { return a + (c.pt || 0); }, 0);
    if (tong !== 100) loi.push('tổng=' + tong);
    var cuoi = ds.filter(function (c) { return c.catThu === 5; }).map(function (c) { return c.ma; });
    if (cuoi.length !== 2 || cuoi.indexOf('C3') < 0 || cuoi.indexOf('C4') < 0)
      loi.push('cắt-sau-cùng=' + cuoi.join(','));
    ds.forEach(function (c) { if (!c.catGi) loi.push(c.ma + ':thiếu cách cắt'); });
    return loi;
  };

  /* ─── Những ô chủ hệ phải tự điền ───
     In ra mỗi lần mở màn, để chúng không chìm dần vào im lặng. */
  G.trChuaDien = function () { return (G.TR_CHUA || []).slice(); };

  /* ─── Giai đoạn tự chủ theo phần trăm hiện có ───
     Chưa biết con số thì trả null, KHÔNG đoán giai đoạn. Đoán ra giai
     đoạn B rồi rút tài trợ theo giai đoạn B là cách hết tiền. */
  G.trGiaiDoan = function (pt) {
    /* Ô TRỐNG không phải số không. Number('') ra 0, và 0 lọt vào giai
       đoạn A — tức một ô chưa điền sẽ được đọc thành "tự chủ 0%, đang
       ở giai đoạn A". Nghe vô hại, nhưng ngưỡng chuyển giai đoạn đọc
       chính con số này, và một ô trống đọc thành một giai đoạn là cách
       hệ tự tin mình đang ở đâu đó mà không ai đo. */
    if (pt === undefined || pt === null || pt === '' || isNaN(Number(pt))) return null;
    var so = Number(pt), ra = null;
    (G.TR_TUCHU || []).forEach(function (g) { if (so >= g.tuChuPt) ra = g; });
    return ra;
  };

  /* ═══════════ MÀN: TIỀN CỦA RỪNG ═══════════
     Một màn, hai tầng sâu. Gia đình đọc được SÁU ĐIỀU KHÔNG BAO GIỜ
     BÁN — đó là lời hứa về dữ liệu và về túi tiền của họ, và lời hứa
     không kiểm được thì không phải lời hứa. */
  G.VIEWS['tien-rung'] = function () {
    if (!G.TR_DEN)
      return U.empty('Chưa mở được phần này', 'Phần này nằm trong gói nền. Đăng nhập lại để nạp.');

    var o = U.ph({ eyebrow: 'TIỀN CỦA RỪNG', ic: 'shield', grad: 1,
      t: 'Sáu điều không bao giờ bán',
      lead: 'Tiền sai một cách thì mọi điều khác uốn cong theo — không phải bị phá, bị UỐN, chậm, và không ai thấy lúc nào. ' +
        'Nên sáu điều dưới đây in vào hợp đồng với mọi đối tác, và chính đối tác ký vào chúng.' });

    o += '<div class="card mb">' + (G.TR_DEN || []).map(function (d) {
      return '<div style="padding:9px 0;border-bottom:1px solid var(--gita-vien-2)">' +
        '<b class="sm" style="color:#BE0E16">' + h(d.t) + '</b>' +
        '<p class="tiny dim mt" style="line-height:1.7">' + h(d.y) + '</p></div>';
    }).join('') + '</div>';
    o += '<p class="tiny dim mb" style="line-height:1.7">' + h((G.TR_DEN_LUAT || {}).tuChoi || '') + ' ' +
      h((G.TR_DEN_LUAT || {}).vi || '') + '</p>';

    /* ── Phần của nghề ── */
    if (!G.TR_CHI) return o;

    /* Ô chưa điền để LÊN ĐẦU phần nghề. Xếp nó xuống cuối là cách nó
       chìm — và nó đã chìm mấy bản nay rồi. */
    var chua = G.trChuaDien();
    if (chua.length) {
      o += U.sec('Chờ chủ hệ điền — ' + chua.length + ' ô',
        ((G.TR_CHUA_LUAT || {}).vi || ''));
      o += U.tbl(['Ô', 'Điền ở đâu', 'Vì sao tôi không điền hộ'],
        chua.map(function (x) { return [h(x.t), h(x.noiDien || '—'), h(x.vi)]; }));
    }

    o += U.sec('Năm luật tiền', '');
    o += '<div class="card mb">' + (G.TR_LUAT || []).map(function (l) {
      return '<div style="padding:8px 0;border-bottom:1px solid var(--gita-vien-2)">' +
        '<b class="sm">' + l.no + '. ' + h(l.t) + '</b>' +
        '<p class="tiny dim mt" style="line-height:1.7">' + h(l.y) + '</p></div>';
    }).join('') + '</div>';

    var nguonLech = G.trSoiNguon();
    o += U.sec('Bốn nguồn tiền',
      'Trần từng nguồn, không phải chia phần. Không nguồn nào được chạm một nửa.' +
      (nguonLech.length ? ' LỆCH: ' + (nguonLech.join(' ')) : ''));
    o += U.tbl(['Mã', 'Nguồn', 'Trần', 'Giai đoạn', 'Điều kiện gắn'],
      (G.TR_NGUON || []).map(function (n) {
        return [h(n.ma), h(n.ten), n.tranPt + '%', h(n.giaiDoan), h(n.dieuKien)];
      }));

    var chiLech = G.trSoiChi();
    o += U.sec('Năm nhóm chi, và THỨ TỰ CẮT', ((G.TR_CAT_LUAT || {}).vi || ''));
    o += U.tbl(['Mã', 'Nhóm', 'Phần', 'Cắt thứ', 'Gồm gì', 'Cắt thế nào'],
      (G.TR_CHI || []).slice().sort(function (a, b) { return a.catThu - b.catThu; })
        .map(function (c) {
          return [h(c.ma), h(c.ten), c.pt + '%', c.catThu === 5 ? 'SAU CÙNG' : String(c.catThu),
            h(c.gom), h(c.catGi)];
        }));
    if (chiLech.length)
      o += '<div class="card mb" style="border-color:#BE0E162e"><b class="sm">Bảng chi đang lệch: ' +
        h(chiLech.join(' · ')) + '</b></div>';
    o += '<p class="tiny dim mb" style="line-height:1.7">' + h((G.TR_CAT_LUAT || {}).kiemToan || '') + '</p>';

    var l = G.TR_LUONG || {};
    o += U.sec('Lương người lắng nghe',
      'Quyết định kinh tế có hậu quả đạo đức nặng nhất của cả đề án.');
    o += '<div class="card mb"><b>' + l.mucTu + '–' + l.mucDen + '% ' + h(l.soVoi || '') + '</b>' +
      '<p class="sm mt" style="line-height:1.8;color:#BE0E16"><b>Cấm:</b> ' + h(l.camThuong || '') + '</p>' +
      '<p class="sm mt" style="line-height:1.8"><b>Thưởng được:</b> ' + h(l.thuongDuoc || '') + '</p>' +
      '<div class="mt">' + (l.ly || []).map(function (x) {
        return '<div style="padding:7px 0;border-top:1px solid var(--gita-vien-2)">' +
          '<b class="sm">' + h(x.t) + '</b><div class="tiny dim">' + h(x.y) + '</div></div>';
      }).join('') + '</div></div>';

    o += U.sec('Ba giai đoạn tự chủ', '');
    o += U.tbl(['Giai đoạn', 'Năm', 'Sống bằng gì', 'Tâm thế', 'Chuyển khi', 'Cấm'],
      (G.TR_TUCHU || []).map(function (g) {
        return [h(g.giai + ' · ' + g.ten), h(g.nam), h(g.song), h(g.tamThe), h(g.chuyenKhi), h(g.cam)];
      }));

    o += U.sec('Hai quỹ, tường ngăn tuyệt đối', ((G.TR_QUY_LUAT || {}).luat || ''));
    o += U.tbl(['Quỹ', 'Chủ', 'Nguồn', 'Dùng cho', 'Cấm', 'Sổ sách'],
      (G.TR_QUY || []).map(function (q) {
        return [h(q.ten), h(q.chu), h(q.nguon), h(q.dung), h(q.cam), h(q.soSach)];
      }));
    o += '<p class="tiny dim mb" style="line-height:1.7"><b>Nếu phải đóng cửa:</b> ' +
      h((G.TR_QUY_LUAT || {}).dongCua || '') + ' ' + h((G.TR_QUY_LUAT || {}).vi || '') + '</p>';

    o += U.sec('Bốn cơn bão tiền', '');
    o += U.tbl(['Mã', 'Cơn bão', 'Dấu hiệu sớm', 'Làm gì'],
      (G.TR_BAO || []).map(function (b) { return [h(b.ma), h(b.ten), h(b.biet), h(b.lam)]; }));

    o += U.sec('Mười câu kiểm toán niên',
      'Bốn câu kế toán quen thuộc, sáu câu chỉ đề án này mới hỏi.');
    o += '<div class="card">' + (G.TR_KIEMTOAN || []).map(function (k) {
      return '<div style="padding:8px 0;border-bottom:1px solid var(--gita-vien-2)">' +
        '<b class="sm">' + k.so + '. ' + h(k.t) + (k.rieng ? ' <span class="tiny up" style="color:#0B7350">RIÊNG CỦA RỪNG</span>' : '') + '</b>' +
        (k.y ? '<p class="tiny dim mt" style="line-height:1.7">' + h(k.y) + '</p>' : '') + '</div>';
    }).join('') + '</div>';
    return o;
  };
})();
