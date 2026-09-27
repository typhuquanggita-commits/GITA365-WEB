/* ═══════════════════════════════════════════════════════════════
   GITA 365 — MÀN BẢNG GIÁ  (9.99.73)

   ══ MÀN NÀY SỬA SỐ, NÓ KHÔNG SỬA LỜI HỨA ══

   Khung — tên bậc, gồm gì, KHÔNG gồm gì, nhịp thu, điều khoản hoàn —
   nằm ở `G.HP_TANG` trong kho, và màn này chỉ ĐỌC nó ra cho người sửa
   giá nhìn thấy mình đang gắn con số vào lời hứa nào.

   Cắt như thế vì khung là thứ Học viện HỨA GIAO: một gia đình ký hôm
   nay phải chỉ ra được bản mô tả nào đang áp cho họ. Cho sửa khung ngay
   trên màn hình là cho đổi lời hứa mà không để lại dấu.

   ══ BA NGĂN ══

     giá   — bảng đang chạy, và ô sửa (chỉ R01)
     sổ    — mọi lần đã đổi, xếp tăng dần
     luật  — cắt ở đâu, ba cái răng, và vì sao không ghi đè
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;
G.VIEWS = G.VIEWS || {};

(function () {
  var U = G.U, h = U.h, ic = U.ic;

  var NGAN = [
    {ma: 'gia',  ten: 'Bảng giá', ic: 'star'},
    {ma: 'so',   ten: 'Sổ đổi giá', ic: 'clock'},
    {ma: 'luat', ten: 'Luật', ic: 'shield'}
  ];

  G.bgNgan = G.bgNgan || 'gia';
  G.bgDangDoc = G.bgDangDoc || null;

  function veLai() {
    if (!G.S || G.S.view !== 'bang-gia') return;
    if (typeof document === 'undefined' || !document.getElementById('main')) return;
    G.render && G.render();
  }
  G.bgMoNgan = function (ma) { G.bgNgan = ma; veLai(); };

  function laR01() {
    return String(((G.S || {}).hoSo || {}).role || '') === 'R01';
  }

  function tien(n) {
    if (n === undefined || n === null) return '—';
    return Number(n).toLocaleString('vi-VN') + 'đ';
  }

  /* Khung đọc từ kho. Bậc nào có trong bảng giá mà không có trong kho
     là bậc MỚI thêm ở sổ — nói ra chứ không lặng lẽ để trống. */
  function khungCua(tang) {
    var so = String(tang).replace(/[^0-9]/g, '');
    return (G.HP_TANG || []).filter(function (t) {
      return String(t.tang).replace(/[^0-9]/g, '') === so;
    })[0];
  }

  G.bgTaiGia = function () {
    if (!G.goiMayChu) return;
    G.goiMayChu('docBangGia', {}).then(function (x) {
      G.bgDangDoc = x; veLai();
    }).catch(function (e) {
      G.bgDangDoc = {ok: false, error: e && e.message}; veLai();
    });
  };

  G.bgDoiGia = function (tang) {
    var g = (document.getElementById('bg_gia_' + tang) || {}).value;
    var l = (document.getElementById('bg_ly_' + tang) || {}).value;
    var o = document.getElementById('bg_bao_' + tang);
    function bao(t) { if (o) o.textContent = t; }
    if (!G.goiMayChu) { bao('Bản mẫu chưa nối máy chủ.'); return; }
    bao('Đang gửi…');
    G.goiMayChu('doiGia', {tang: tang, gia: Number(g), lyDo: String(l || '')})
      .then(function (x) {
        if (!x.ok) { bao(x.error || 'Không đổi được.'); return; }
        bao('Đã ghi một dòng mới. ' + x.lichThuCuKhongDoi);
        G.bgTaiGia();
      })
      .catch(function (e) { bao(e && e.message ? e.message : 'Lỗi.'); });
  };

  function thanhNgan() {
    return '<div class="row" style="gap:8px;flex-wrap:wrap;margin-bottom:18px">' +
      NGAN.map(function (n) {
        var on = G.bgNgan === n.ma;
        return '<button class="btn' + (on ? ' primary' : '') + '" ' +
          'onclick="G.bgMoNgan(\'' + n.ma + '\')" style="gap:7px">' +
          ic(n.ic) + h(n.ten) + '</button>';
      }).join('') + '</div>';
  }

  /* ═══════════ NGĂN 1 · BẢNG GIÁ ═══════════ */
  function nganGia() {
    var l = G.BG_SO_LUAT || {};
    var o = '<div class="card" style="border-left:3px solid var(--bad)">' +
      '<b>' + h(l.motDongMoi || '') + '</b>' +
      '<p class="sm mt">' + h(l.viKhongGhiDe || '') + '</p>' +
      '<p class="sm muted mt">' + h(l.phaiCoLyDo || '') + '</p></div>';

    if (!laR01()) o += '<div class="card mt" style="border-left:3px solid var(--warn)">' +
      '<b class="sm">Vai này XEM được, không đổi được</b>' +
      '<p class="sm mt">Đặt và đổi giá nằm trong mười việc <b>Vùng Đỏ</b> của Hiến ' +
      'pháp — chỉ Super Admin, không uỷ quyền cho ai và cũng không cho máy.</p></div>';

    var d = G.bgDangDoc;
    if (!d) {
      o += '<div class="card mt"><p class="sm">Chưa tải bảng giá.</p>' +
        '<button class="btn mt" onclick="G.bgTaiGia()">Tải bảng giá</button></div>';
      return o;
    }
    if (!d.ok) return o + '<div class="card mt" style="border-left:3px solid var(--bad)">' +
      '<p class="sm">' + h(d.error || 'Không đọc được bảng giá.') + '</p>' +
      '<button class="btn mt" onclick="G.bgTaiGia()">Thử lại</button></div>';

    o += U.sec('Đang chạy', d.vi || '');
    o += Object.keys(d.gia || {}).sort().map(function (t) {
      var k = khungCua(t) || {};
      var moi = d.nguon[t] === 'daDoi';
      var dong = (d.dongBac || []).indexOf(t) >= 0;
      var r = '<div class="card mt" style="border-left:3px solid var(--' +
        (dong ? 'line' : moi ? 'ok' : 'warn') + ')">' +
        '<b>Bậc ' + h(t) + (k.ten ? ' — ' + h(k.ten) : '') +
        (dong ? ' · ĐÃ ĐÓNG' : '') + '</b>' +
        '<p class="sm mt" style="font-size:17px"><b>' + h(tien(d.gia[t])) + '</b> ' +
        (k.donVi ? '<span class="muted">' + h(k.donVi) + '</span>' : '') + '</p>' +
        '<p class="sm mt">' + (moi
          ? 'Đã đổi lúc ' + h(String(d.doiLuc[t] || '').slice(0, 16)) +
            ' bởi ' + h(d.boiAi[t] || '')
          : '<b>GIÁ KHỞI ĐẦU</b> — chưa ai đổi lần nào') + '</p>';

      /* Khung đọc từ kho, chỉ để nhìn. Người sửa giá phải thấy mình
         đang gắn con số vào lời hứa nào. */
      if (k.gom) r += '<p class="sm mt"><b>Gồm:</b> ' + h(k.gom.join(' · ')) + '</p>';
      if (k.khong) r += '<p class="sm mt" style="color:var(--bad)"><b>KHÔNG gồm:</b> ' +
        h(k.khong.join(' · ')) + '</p>';
      if (k.nhip) r += '<p class="sm muted mt"><b>Nhịp thu:</b> ' + h(k.nhip) + '</p>';
      if (!k.ten) r += '<p class="sm mt" style="color:var(--warn)">Bậc này chưa có ' +
        'khung trong kho — nó được thêm ở sổ. Khung chốt rồi thì chép về ' +
        '<code>G.HP_TANG</code> ở lượt phát hành sau.</p>';

      if (laR01() && !dong) r +=
        '<div class="row mt" style="gap:8px;flex-wrap:wrap">' +
        '<input id="bg_gia_' + h(t) + '" class="inp" type="number" min="0" ' +
        'placeholder="Giá mới" value="' + h(String(d.gia[t])) + '">' +
        '<input id="bg_ly_' + h(t) + '" class="inp" ' +
        'placeholder="Vì sao đổi — ít nhất một câu" style="flex:1;min-width:220px">' +
        '<button class="btn" onclick="G.bgDoiGia(\'' + h(t) + '\')">Ghi dòng mới</button>' +
        '</div><div id="bg_bao_' + h(t) + '" class="tiny mt" ' +
        'style="color:var(--warn);min-height:16px"></div>';
      return r + '</div>';
    }).join('');

    o += '<div class="card mt2"><p class="sm">' + h(d.khungOKho || '') + '</p></div>';
    return o;
  }

  /* ═══════════ NGĂN 2 · SỔ ═══════════ */
  function nganSo() {
    var l = G.BG_SO_LUAT || {};
    var o = '<div class="card" style="border-left:3px solid var(--gita)">' +
      '<b class="sm">' + h(l.dongChuKhongXoa || '') + '</b>' +
      '<p class="sm mt">' + h(l.khongGhiDongTrung || '') + '</p></div>' +
      '<div class="card mt"><button class="btn" onclick="G.bgTaiSo()">Tải sổ đổi giá</button>' +
      '<div id="bg_so" class="mt"></div></div>';
    return o;
  }

  G.bgTaiSo = function () {
    var o = document.getElementById('bg_so');
    if (!o) return;
    if (!G.goiMayChu) { o.textContent = 'Bản mẫu chưa nối máy chủ.'; return; }
    o.textContent = 'Đang tải…';
    G.goiMayChu('soDoiGia', {}).then(function (x) {
      if (!x.ok) { o.textContent = x.error || 'Không đọc được.'; return; }
      if (!x.so) { o.textContent = x.vi; return; }
      o.innerHTML = U.tbl(['Lúc', 'Bậc', 'Giá', 'Ai ký', 'Vì sao'],
        (x.ds || []).map(function (d) {
          return ['<span class="sm">' + h(String(d.ghiLuc).slice(0, 16)) + '</span>',
            '<b class="sm">' + h(d.tang) + '</b>',
            '<span class="sm">' + h(tien(d.gia)) + '</span>',
            '<span class="sm">' + h(d.boiAi) + '</span>',
            '<span class="sm">' + h(d.lyDo) + '</span>'];
        }));
    }).catch(function (e) { o.textContent = (e && e.message) || 'Lỗi.'; });
  };

  /* ═══════════ NGĂN 3 · LUẬT ═══════════ */
  function nganLuat() {
    var c = G.BG_CAT_LUAT || {};
    var o = '<div class="card" style="border-left:3px solid var(--gita)">' +
      '<b>' + h(c.catTheoToc || '') + '</b>' +
      '<p class="sm mt">' + h(c.khongCotGiaHienTai || '') + '</p>' +
      '<p class="sm muted mt">' + h(c.giaKhoiDauKhacGiaDangChay || '') + '</p></div>';

    o += U.sec('Cắt ở đâu', 'khung là lời hứa, số là con số');
    o += U.tbl(['Phần', 'Nằm ở đâu', 'Gồm gì', 'Đổi thế nào', 'Vì sao'],
      (G.BG_CAT || []).map(function (x) {
        return ['<b class="sm">' + h(x.ten) + '</b>',
          '<code class="sm">' + h(x.oDau) + '</code>',
          '<span class="sm">' + h((x.gom || []).join(' · ')) + '</span>',
          '<span class="sm">' + h(x.doiThenao) + '</span>',
          '<span class="sm">' + h(x.y) + '</span>'];
      }));

    o += U.sec('Ba cái răng', 'cho sửa giá là mở một cánh cửa vào giữa phần tiền');
    o += (G.BG_RANG || []).map(function (r) {
      return '<div class="card mt" style="border-left:3px solid var(--bad)">' +
        '<b class="sm">' + h(r.ma) + ' · ' + h(r.ten) + '</b>' +
        '<p class="sm mt"><b>Máy làm gì:</b> ' + h(r.lam) + '</p>' +
        '<p class="sm mt" style="color:var(--bad)"><b>Không có nó thì:</b> ' +
        h(r.neuKhong) + '</p>' +
        '<p class="sm muted mt"><b>Đo bằng:</b> ' + h(r.doBang) + '</p></div>';
    }).join('');

    var bm = G.BG_BAC_MOI || {};
    o += U.sec('Thêm một bậc mới', bm.cot || '');
    o += '<div class="card"><p class="sm">' + h(bm.vi || '') + '</p>' +
      '<p class="sm mt">' + h(bm.oKhongGomLaOKho || '') + '</p>' +
      '<p class="sm muted mt">' + h(bm.batBaLan || '') + '</p></div>';
    return o;
  }

  G.VIEWS['bang-gia'] = function () {
    var o = '<div class="card" style="border-left:3px solid var(--gita)">' +
      '<b>BẢNG GIÁ — SỐ SỬA ĐƯỢC, KHUNG Ở KHO</b>' +
      '<p class="sm muted mt">Giá đang là con số <b>tạm</b> trong lúc dựng, nên nó ' +
      'phải sửa được ngay. Nhưng <b>khung</b> — bậc ấy hứa giao gì và KHÔNG giao gì — ' +
      'là lời hứa, và lời hứa thì đổi qua một lượt phát hành để còn đọc lại được.</p></div>';

    if (!(G.BG_CAT || []).length)
      return o + U.empty('Bảng giá chưa mở',
        'Kho nghề chưa nạp. Đăng nhập bằng vai có quyền nghề.', true);

    o += thanhNgan();
    if (G.bgNgan === 'so') o += nganSo();
    else if (G.bgNgan === 'luat') o += nganLuat();
    else o += nganGia();
    return o;
  };
})();
