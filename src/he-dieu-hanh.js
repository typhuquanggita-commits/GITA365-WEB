/* ═══════════════════════════════════════════════════════════════
   GITA 365 — MÀN HỆ ĐIỀU HÀNH  (GITA-CEO-OS v3.0)

   Ba vùng uỷ quyền và hội đồng bảy ghế đã ở màn Bộ não từ 9.99.62 —
   màn này KHÔNG dựng lại, nó dựng năm thứ còn lại của tài liệu điều
   hành.

   ══ NGĂN CHỈ SỐ CHIA HAI, KHÔNG XẾP MƯỜI HAI DÒNG LIỀN ══

   Chín con số máy đo và ba con số người khai nằm hai ngăn riêng. Đặt
   một con số gõ tay cạnh một con số đo được — cùng hàng, cùng kiểu
   chữ — thì người đọc tin cả hai như nhau, mà con số gõ tay thì gõ
   nhầm được, gõ đẹp lên được, hoặc quên gõ mà hàng vẫn đầy.

   ══ NĂM NGĂN ══

     nhịp     — bốn nhịp, mỗi nhịp có THỜI LƯỢNG
     chỉ số   — mười hai, chia theo nguồn
     quyết    — năm bước, và hai mốc thời gian
     chặng    — năm chặng, và điều kiện bất di bất dịch
     lệnh     — bốn câu lệnh, câu thứ tư là phép thử
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;
G.VIEWS = G.VIEWS || {};

(function () {
  var U = G.U, h = U.h, ic = U.ic;

  var NGAN = [
    {ma: 'nhip',  ten: 'Nhịp vận hành', ic: 'clock'},
    {ma: 'chiso', ten: '12 chỉ số',     ic: 'star'},
    {ma: 'quyet', ten: '5 bước quyết',  ic: 'search'},
    {ma: 'chang', ten: '5 chặng',       ic: 'compass'},
    {ma: 'lenh',  ten: '4 câu lệnh',    ic: 'quote'}
  ];

  var TEN_AI = {
    maySoanNguoiQuyet: 'Máy soạn, NGƯỜI quyết',
    nguoiQuyet: 'NGƯỜI làm, không uỷ quyền'
  };

  G.hdhNgan = G.hdhNgan || 'nhip';

  function veLai() {
    if (!G.S || G.S.view !== 'he-dieu-hanh') return;
    if (typeof document === 'undefined' || !document.getElementById('main')) return;
    G.render && G.render();
  }
  G.hdhMoNgan = function (ma) { G.hdhNgan = ma; veLai(); };

  function thanhNgan() {
    return '<div class="row" style="gap:8px;flex-wrap:wrap;margin-bottom:18px">' +
      NGAN.map(function (n) {
        var on = G.hdhNgan === n.ma;
        return '<button class="btn' + (on ? ' primary' : '') + '" ' +
          'onclick="G.hdhMoNgan(\'' + n.ma + '\')" style="gap:7px">' +
          ic(n.ic) + h(n.ten) + '</button>';
      }).join('') + '</div>';
  }

  /* ═══════════ NGĂN 1 · NHỊP ═══════════ */
  function nganNhip() {
    var l = G.HDH_NHIP_LUAT || {};
    var o = '<div class="card" style="border-left:3px solid var(--gita)">' +
      '<b>' + h(l.nhipHonThongMinh || '') + '</b>' +
      '<p class="sm mt">' + h(l.motManHinh || '') + '</p>' +
      '<p class="sm mt">' + h(l.khongCatIM || '') + '</p>' +
      '<p class="sm muted mt">' + h(l.baNhaNgauNhien || '') + '</p></div>';

    o += (G.HDH_NHIP || []).map(function (n) {
      return '<div class="card mt" style="border-left:3px solid ' + h(n.c) + '">' +
        '<b>' + h(n.ten) + ' — ' + h(String(n.phut)) + ' phút</b>' +
        '<p class="sm mt">' + h(n.lam) + '</p>' +
        '<p class="sm mt"><b>Ai làm:</b> ' + h(TEN_AI[n.aiLam] || n.aiLam) + '</p>' +
        '<p class="sm muted mt">' + h(n.y) + '</p></div>';
    }).join('');
    return o;
  }

  /* ═══════════ NGĂN 2 · MƯỜI HAI CHỈ SỐ ═══════════ */
  function nganChiSo() {
    var l = G.HDH_CHISO_LUAT || {};
    var o = '<div class="card" style="border-left:3px solid var(--gita)">' +
      '<b>' + h(l.motManHinh || '') + '</b>' +
      '<p class="sm mt">' + h(l.troChuKhongTinhLai || '') + '</p>' +
      '<p class="sm mt">' + h(l.oTrongDocRaLaSoKhong || '') + '</p>' +
      '<p class="sm muted mt">' + h(l.khongTronHaiLoai || '') + '</p></div>';

    /* Chia theo NGUỒN, không xếp mười hai dòng liền. */
    [['mayDo', 'Máy đo — gọi thẳng cửa đã có', 'ok'],
     ['nguoiKhai', 'NGƯỜI khai — không có cửa máy chủ nào', 'warn']]
      .forEach(function (nh) {
        var ds = (G.HDH_CHISO12 || []).filter(function (c) {
          return c.nguon === nh[0];
        });
        if (!ds.length) return;
        o += U.sec(nh[1], ds.length + ' chỉ số');
        o += U.tbl(['Mã', 'Nhóm', 'Chỉ số', nh[0] === 'mayDo' ? 'Cửa' : 'Vì sao người khai',
          'Báo động khi'],
          ds.map(function (c) {
            return ['<b class="sm">' + h(c.ma) + '</b>',
              '<span class="sm">' + h(c.nhom) + '</span>',
              '<span class="sm">' + h(c.ten) + '</span>',
              nh[0] === 'mayDo'
                ? '<code class="sm">' + h(c.cua) + (c.o ? ' → ' + h(c.o) : '') + '</code>'
                : '<span class="sm">' + h(c.y || '') + '</span>',
              '<span class="sm">' + h(c.baoDong) + '</span>'];
          }));
      });

    o += '<div class="card mt2" style="border-left:3px solid var(--bad)">' +
      '<b class="sm">Chỉ số thứ mười hai</b>' +
      '<p class="sm mt">' + h(l.chiSoCuoiKhoGianLanNhat || '') + '</p></div>';

    /* Tám thước đo tuần — năm thước đích 100% không có dung sai. */
    var tl = G.HDH_THUOC_LUAT || {};
    o += U.sec('Tám thước đo hằng tuần', 'năm thước đích 100%, và 100% thì không có dung sai');
    o += U.tbl(['Thước', 'Đích', 'Ai đo', 'Trỏ vào rào'],
      (G.HDH_THUOC_TUAN || []).map(function (t) {
        return [(t.nangNhat ? '<b class="sm" style="color:var(--bad)">' : '<b class="sm">') +
            h(t.thuoc) + (t.nangNhat ? ' — NẶNG NHẤT' : '') + '</b>',
          '<span class="sm">' + h(String(t.dich)) + '%</span>',
          '<span class="sm">' + (t.nguon === 'mayDo' ? 'Máy' : 'NGƯỜI') + '</span>',
          '<span class="sm">' + h(t.rao || t.cua || '—') + '</span>'];
      }));
    o += '<div class="card mt"><p class="sm">' + h(tl.motTramKhongCoDungSai || '') +
      '</p><p class="sm muted mt">' + h(tl.namThuocDauTroVaoHangRao || '') + '</p></div>';
    return o;
  }

  /* ═══════════ NGĂN 3 · NĂM BƯỚC QUYẾT ═══════════ */
  function nganQuyet() {
    var l = G.HDH_QUYET_LUAT || {};
    var o = '<div class="card" style="border-left:3px solid var(--bad)">' +
      '<b>' + h(l.hoiNguocTruocKhiQuyet || '') + '</b>' +
      '<p class="sm mt">' + h(l.baPhuongAn || '') + '</p>' +
      '<p class="sm mt">' + h(l.coDoThiDung || '') + '</p>' +
      '<p class="sm muted mt">' + h(l.mayKhongQuyet || '') + '</p></div>';

    o += (G.HDH_QUYET5 || []).map(function (b) {
      return '<div class="card mt" style="border-left:3px solid var(--' +
        (b.mayCanh ? 'ok' : 'line') + ')">' +
        '<b class="sm">' + h(b.ma) + ' · ' + h(b.ten) +
        (b.mayCanh ? ' — máy canh' : '') + '</b>' +
        '<p class="sm mt">' + h(b.lam) + '</p>' +
        '<p class="sm muted mt">' + h(b.y) + '</p></div>';
    }).join('');
    return o;
  }

  /* ═══════════ NGĂN 4 · NĂM CHẶNG ═══════════ */
  function nganChang() {
    var l = G.HDH_CHANG_LUAT || {};
    var o = '<div class="card" style="border-left:3px solid var(--bad)">' +
      '<b>' + h(l.khongNhayCoc || '') + '</b>' +
      '<p class="sm mt">' + h(l.vi || '') + '</p>' +
      '<p class="sm mt">' + h(l.mayNoiDuChuKhongChuyen || '') + '</p></div>';

    o += U.tbl(['Chặng', 'Quy mô', 'Việc DUY NHẤT phải làm đúng', 'Được sang chặng sau khi'],
      (G.HDH_CHANG || []).map(function (c) {
        return ['<b class="sm">' + h(String(c.so)) + '. ' + h(c.ten) + '</b>',
          '<span class="sm">' + h(c.quyMo) + '</span>',
          '<span class="sm">' + h(c.dungMotViec) + '</span>',
          '<span class="sm">' + h(c.quaChang) +
            (c.nguoiDo ? ' <b>(người đo)</b>' : '') + '</span>'];
      }));

    o += '<div class="card mt2"><b class="sm">Học gì từ Google</b>' +
      '<p class="sm mt">' + h(l.hocGiTuGoogle || '') + '</p></div>';
    return o;
  }

  /* ═══════════ NGĂN 5 · BỐN CÂU LỆNH ═══════════ */
  function nganLenh() {
    var l = G.HDH_LENH_LUAT || {};
    var o = '<div class="card" style="border-left:3px solid var(--gita)">' +
      '<b>' + h(l.vangBaNgayLaPhepThu || '') + '</b>' +
      '<p class="sm mt">' + h(l.nguongGoiKhongDungBanThuHai || '') + '</p></div>';

    o += (G.HDH_LENH4 || []).map(function (x) {
      return '<div class="card mt" style="border-left:3px solid var(--' +
        (x.dangGiaNhat ? 'bad' : 'line') + ')">' +
        '<b class="sm">' + h(x.lenh) + (x.dangGiaNhat ? ' — ĐÁNG GIÁ NHẤT' : '') + '</b>' +
        '<p class="sm mt"><b>Ra gì:</b> ' + h(x.ra) + '</p>' +
        '<p class="sm mt"><b>Cửa:</b> <code>' + h(x.cua) + '</code></p>' +
        (x.y ? '<p class="sm muted mt">' + h(x.y) + '</p>' : '') + '</div>';
    }).join('');

    var ht = G.HDH_HATANG || {};
    o += U.sec('Hạ tầng', 'không đồng → một đô la');
    o += '<div class="card" style="border-left:3px solid var(--bad)">' +
      '<b class="sm">Bắt buộc mới</b>' +
      '<p class="sm mt">' + h(ht.batBuocMoi || '') + '</p></div>' +
      '<div class="card mt"><p class="sm">' + h(ht.bacKhongDong || '') + '</p>' +
      '<p class="sm mt">' + h(ht.bacMotDoLa || '') + '</p>' +
      '<p class="sm muted mt">' + h(ht.giaDoiNhanh || '') + '</p></div>';
    return o;
  }

  G.VIEWS['he-dieu-hanh'] = function () {
    var o = '<div class="card" style="border-left:3px solid var(--gita)">' +
      '<b>HỆ ĐIỀU HÀNH CẤP ĐIỀU HÀNH — GITA-CEO-OS v3.0</b>' +
      '<p class="sm muted mt">Ba vùng uỷ quyền và hội đồng bảy ghế nằm ở màn <b>Bộ ' +
      'não</b> — màn này không dựng lại. Nó dựng thứ biến bộ não từ <i>trợ lý trả ' +
      'lời khi được hỏi</i> thành <i>bộ máy tự chạy</i>: <b>nhịp quan trọng hơn thông ' +
      'minh</b>.</p></div>';

    if (!(G.HDH_NHIP || []).length)
      return o + U.empty('Hệ điều hành chưa mở',
        'Kho nghề chưa nạp. Đăng nhập bằng vai có quyền nghề.', true);

    o += thanhNgan();
    if (G.hdhNgan === 'chiso') o += nganChiSo();
    else if (G.hdhNgan === 'quyet') o += nganQuyet();
    else if (G.hdhNgan === 'chang') o += nganChang();
    else if (G.hdhNgan === 'lenh') o += nganLenh();
    else o += nganNhip();
    return o;
  };
})();
