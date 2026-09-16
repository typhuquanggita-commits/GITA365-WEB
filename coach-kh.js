/* ═══════════════════════════════════════════════════════════════
   GITA 365 — MÀN COACH KHÁCH HÀNG (Phân hệ 2 của Bộ não)

   ══ MÀN NÀY CÓ ÍT THỨ MỚI, VÀ ĐÓ LÀ CHỦ Ý ══

   Bản đặc tả mở Phần IV bằng một câu: "Giữ nguyên toàn bộ từ v2.0,
   nhắc lại ở dạng nén." Nên màn này KHÔNG chép lại những thứ kho đã
   có ở chỗ khác — chép lại là dựng bản thứ hai của một sự thật, và
   bản thứ hai mục trong im lặng.

   Thứ thật sự mới của v3.0 nằm ở đúng một câu cuối phần, và nó có
   ngăn riêng đứng ĐẦU: trước khi trả lời câu hỏi về một đứa trẻ cụ
   thể, máy đọc Thẻ Vùng Mạnh của con đó trước.

   ══ NĂM NGĂN ══

     nối     — chỗ Phân hệ 2 cắm vào Phân hệ 1, và thử ngay tại chỗ
     vòng 9  — chín bước, bước 3 có trần một câu
     luồng   — mười hai luồng, bốn luồng nặng đi đường khác
     hội đồng— năm ghế, ghế thứ năm máy không ngồi được
     bé bò   — ba cái trần đếm được, soi một bản nháp
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;
G.VIEWS = G.VIEWS || {};

(function () {
  var U = G.U, h = U.h, ic = U.ic;

  var NGAN = [
    {ma: 'noi',    ten: 'Nối Thẻ',    ic: 'star'},
    {ma: 'vong',   ten: 'Vòng 9 bước', ic: 'arrow'},
    {ma: 'luong',  ten: '12 luồng',   ic: 'search'},
    {ma: 'ghe',    ten: 'Hội đồng',   ic: 'quote'},
    {ma: 'bebo',   ten: 'Bé tập bò',  ic: 'clock'}
  ];

  G.ckNgan = G.ckNgan || 'noi';

  function oGiaTri(id) {
    var el = typeof document !== 'undefined' && document.getElementById(id);
    return el ? String(el.value || '').trim() : '';
  }
  function veLai() {
    if (!G.S || G.S.view !== 'coach-kh') return;
    if (typeof document === 'undefined' || !document.getElementById('main')) return;
    G.render && G.render();
  }
  G.ckMoNgan = function (ma) { G.ckNgan = ma; veLai(); };

  function thanhNgan() {
    return '<div class="row" style="gap:8px;flex-wrap:wrap;margin-bottom:18px">' +
      NGAN.map(function (n) {
        var on = G.ckNgan === n.ma;
        return '<button class="btn' + (on ? ' primary' : '') + '" ' +
          'onclick="G.ckMoNgan(\'' + n.ma + '\')" style="gap:7px">' +
          ic(n.ic) + h(n.ten) + '</button>';
      }).join('') + '</div>';
  }

  /* ═══════════ NGĂN 1 · NỐI VÀO PHÂN HỆ 1 ═══════════ */
  function nganNoi() {
    var l = G.CK_NOI_LUAT || {};
    var o = '<div class="card" style="border-left:3px solid var(--gita)">' +
      '<b>' + h(l.cot || '') + '</b>' +
      '<p class="sm muted mt">' + h(l.viCoRang || '') + '</p></div>';

    o += U.sec('Ba cửa tiếp nhận, ba câu trả lời',
      'cùng một câu hỏi — con vào qua cửa nào thì câu trả lời đổi theo cửa ấy');
    o += U.tbl(['Cửa', 'Câu trả lời đổi thế nào', 'Chỗ hay làm sai'],
      (G.CK_CUA3 || []).map(function (x) {
        return ['<b class="sm">' + h(x.ten) + '</b>',
          '<span class="sm">' + h(x.doi) + '</span>',
          '<span class="sm muted">' + h(x.trach) + '</span>'];
      }));

    o += U.sec('Ngưỡng sợ đổi GIỌNG, không đổi nội dung',
      'cửa đổi CÁCH ĐƯA; sợ đổi CHỖ ĐỨNG của người nói');
    o += U.tbl(['Ngưỡng sợ', 'Giọng của câu trả lời'],
      (G.CK_SO3 || []).map(function (x) {
        return ['<b class="sm">' + h(x.ten) + '</b>',
          '<span class="sm">' + h(x.giong) + '</span>'];
      }));

    o += '<div class="card mt2"><b class="sm">Thử ngay: trả lời một câu về một nhà</b>' +
      '<p class="tiny muted mt">Máy chủ TỰ đọc thẻ. Không có ô nào để khai rằng đã ' +
      'đọc — một ô như thế bật được mà không đọc gì.</p>' +
      '<div class="row mt" style="gap:10px;flex-wrap:wrap">' +
      '<label class="sm" style="flex:1 1 180px"><b>Mã gia đình</b>' +
      '<input id="ckNha" class="inp" maxlength="60"></label>' +
      '<label class="sm" style="flex:1 1 140px"><b>Luồng</b>' +
      '<select id="ckLuong" class="inp">' +
      (G.CK_LUONG12 || []).map(function (x) {
        return '<option value="' + h(x.ma) + '">' + h(x.ma + ' · ' + x.ten) + '</option>';
      }).join('') + '</select></label></div>' +
      '<div class="mt"><label class="sm"><b>Câu hỏi của gia đình</b></label>' +
      '<input id="ckHoi" class="inp" maxlength="300"></div>' +
      '<div class="row mt2" style="gap:8px">' +
      '<button class="btn primary" onclick="G.ckTraLoi()">Dựng câu trả lời</button>' +
      '</div></div>';

    var r = G.ckTraRa;
    if (r) o += !r.ok
      ? '<div class="card" style="border-left:3px solid var(--bad);margin-top:14px">' +
        '<p class="sm">' + h(r.error || '') + '</p></div>'
      : '<div class="card" style="border-left:3px solid var(--ok);margin-top:14px">' +
        '<b>Cửa ' + h(r.cua) + (r.soHai ? ' · ' + h(r.soHai) : '') +
        ' · mức ' + h(r.muc) + '</b>' +
        '<p class="sm mt"><b>Đổi cách đưa:</b> ' + h(r.doi || '') + '</p>' +
        '<p class="sm mt"><b>Chỗ hay làm sai:</b> ' + h(r.trach || '') + '</p>' +
        (r.giong ? '<p class="sm mt"><b>Giọng:</b> ' + h(r.giong) + '</p>' : '') +
        '<p class="sm muted mt">' + h(r.vi || '') + '</p></div>';
    return o;
  }

  /* ═══════════ NGĂN 2 · VÒNG CHÍN BƯỚC ═══════════ */
  function nganVong() {
    var l = G.CK_VONG9_LUAT || {};
    var o = '<div class="card"><b>' + h(l.cot || '') + '</b>' +
      '<p class="sm mt"><b>Đảo thứ tự thì sao:</b> ' + h(l.viDaoThuTu || '') + '</p>' +
      '<p class="sm muted mt">' + h(l.khongGopBuoc || '') + '</p></div>';

    o += (G.CK_VONG9 || []).map(function (x) {
      return '<div class="card mt" style="border-left:3px solid var(--teal)">' +
        '<b>' + h(String(x.buoc) + '. ' + x.ten) +
        (x.tran ? ' — trần ' + h(String(x.tran)) + ' câu' : '') + '</b>' +
        '<p class="sm mt">' + h(x.lam) + '</p>' +
        (x.cam ? '<p class="sm mt" style="color:var(--bad)"><b>Cấm:</b> ' +
          h(x.cam) + '</p>' : '') +
        '<p class="sm muted mt">' + h(x.vi) + '</p></div>';
    }).join('');

    o += U.sec('Thang năm mức giải thích', 'mặc định M3, và mức luôn được GHI RA');
    o += U.tbl(['Mức', 'Cho ai', 'Ghi chú'],
      (G.CK_MUC5 || []).map(function (x) {
        return ['<b class="sm">' + h(x.ma + ' · ' + x.ten) +
          (x.macDinh ? ' ★' : '') + '</b>',
          '<span class="sm">' + h(x.cho) + '</span>',
          '<span class="sm muted">' + h(x.vi || '') + '</span>'];
      }));

    o += U.sec('Bốn trụ tri thức', 'lấy từ trụ, không tự nghĩ ra');
    o += (G.CK_TRU4 || []).map(function (x) {
      return '<div class="card mt"><b class="sm">' + h(x.ten) + '</b>' +
        '<p class="sm mt">' + h(x.loi) + '</p>' +
        '<p class="sm muted mt">' + h(x.vi) + '</p></div>';
    }).join('');
    return o;
  }

  /* ═══════════ NGĂN 3 · MƯỜI HAI LUỒNG ═══════════ */
  function nganLuong() {
    var l = G.CK_LUONG_LUAT || {};
    var o = '<div class="card" style="border-left:3px solid var(--warn)">' +
      '<b>' + h(l.cot || '') + '</b>' +
      '<p class="sm mt">' + h(l.viChonBon || '') + '</p>' +
      '<p class="sm mt"><b>Vì sao ba lượt:</b> ' + h(l.viBaLuot || '') + '</p>' +
      '<p class="sm muted mt">' + h(l.khongTrungLuot || '') + '</p></div>';

    o += U.sec('Mười hai luồng', 'bốn luồng mang dấu ★ bắt buộc ba lượt hội đồng');
    o += U.tbl(['Luồng', 'Vì sao đáng biết'],
      (G.CK_LUONG12 || []).map(function (x) {
        return ['<b class="sm">' + h(x.ma + ' · ' + x.ten) +
          (x.hoiDong3 ? ' ★' : '') + '</b>',
          '<span class="sm muted">' + h(x.vi) + '</span>'];
      }));
    return o;
  }

  /* ═══════════ NGĂN 4 · HỘI ĐỒNG NĂM GHẾ ═══════════ */
  function nganGhe() {
    var l = G.CK_GHE_LUAT || {};
    var o = '<div class="card"><b>' + h(l.cot || '') + '</b>' +
      '<p class="sm mt">' + h(l.viKhaiTen || '') + '</p>' +
      '<p class="sm muted mt">' + h(l.mayKhongNgoi || '') + '</p></div>';

    o += (G.CK_GHE5 || []).map(function (x) {
      return '<div class="card mt" style="border-left:3px solid var(--' +
        (x.phaiNguoiThat ? 'bad' : 'teal') + ')">' +
        '<b>' + h(x.ma + ' · ' + x.ten) +
        (x.phaiNguoiThat ? ' — BẮT BUỘC LÀ NGƯỜI THẬT' : '') + '</b>' +
        '<p class="sm mt"><b>Hỏi:</b> ' + h(x.hoi) + '</p>' +
        '<p class="sm muted mt">' + h(x.vi) + '</p></div>';
    }).join('');
    return o;
  }

  /* ═══════════ NGĂN 5 · BÉ TẬP BÒ ═══════════ */
  function nganBeBo() {
    var t = G.CK_BTB_TRAN || {};
    var o = '<div class="card"><b>Một câu · một hình · một bước · một ngày · một kết quả</b>' +
      '<p class="sm mt">Trần: <b>' + h(String(t.chuMoiCau || 20)) + ' chữ</b> mỗi câu · ' +
      '<b>' + h(String(t.dongMoiDoan || 4)) + ' dòng</b> mỗi đoạn · <b>' +
      h(String(t.soTrongBai || 2)) + ' con số</b> cả bài.</p>' +
      '<p class="sm muted mt">' + h(t.viTranSo || '') + '</p>' +
      '<p class="sm mt" style="color:var(--bad)">' + h(t.mayKhongCatHo || '') + '</p></div>';

    o += U.tbl(['Ô', 'Là gì'],
      (G.CK_BTB || []).map(function (x) {
        return ['<b class="sm">' + h(x.ten) + '</b>',
          '<span class="sm">' + h(x.la) + '</span>'];
      }));

    o += '<div class="card mt2"><b class="sm">Soi một bản nháp</b>' +
      '<div class="mt"><textarea id="ckNhap" class="inp" rows="5" ' +
      'maxlength="4000"></textarea></div>' +
      '<div class="row mt2" style="gap:8px">' +
      '<button class="btn primary" onclick="G.ckSoat()">Soi bản nháp</button>' +
      '</div></div>';

    var r = G.ckSoatRa;
    if (r) o += !r.ok
      ? '<div class="card" style="border-left:3px solid var(--bad);margin-top:14px">' +
        '<p class="sm">' + h(r.error || '') + '</p></div>'
      : '<div class="card" style="border-left:3px solid var(--' +
        (r.dat ? 'ok' : 'bad') + ');margin-top:14px">' +
        '<b>' + h(r.dat ? 'Đạt cả ba trần' : 'Vượt trần') + '</b>' +
        '<p class="sm mt">' + h((r.beTapBo || {}).vi || '') + '</p>' +
        (!(r.gen || {}).sach
          ? '<p class="sm mt" style="color:var(--bad)">' + h((r.gen || {}).vi || '') +
            '</p>'
          : '') + '</div>';
    return o;
  }

  G.ckTraLoi = function () {
    G.goiMayChu('traLoiCoach', {maNha: oGiaTri('ckNha'),
      luong: oGiaTri('ckLuong'), cauHoi: oGiaTri('ckHoi')})
      .then(function (d) { G.ckTraRa = d; veLai(); });
  };
  G.ckSoat = function () {
    G.goiMayChu('soatBanTra', {chu: oGiaTri('ckNhap')})
      .then(function (d) { G.ckSoatRa = d; veLai(); });
  };

  G.VIEWS['coach-kh'] = function () {
    var o = '<div class="card" style="border-left:3px solid var(--gita)">' +
      '<b>PHÂN HỆ 2 — COACH KHÁCH HÀNG</b>' +
      '<p class="sm muted mt">Phần lớn phân hệ này giữ nguyên từ v2.0. Thứ mới của ' +
      'v3.0 là <b>chỗ nó cắm vào Phân hệ 1</b>: trả lời về một đứa trẻ cụ thể thì ' +
      'đọc Thẻ Vùng Mạnh của con đó trước — nếu không, bốn tuần quan sát của một ' +
      'gia đình thật dừng lại ở một tờ giấy đẹp.</p></div>';

    /* Cùng cái cổng của hai màn Bộ não và Vùng Mạnh: kho nghề nạp sau
       khi đăng nhập, nên vai không có gói nghề thấy năm cái khung rỗng
       chứ không thấy một câu nói vì sao. */
    if (!(G.CK_VONG9 || []).length)
      return o + U.empty('Coach khách hàng chưa mở',
        'Kho nghề chưa nạp. Đăng nhập bằng vai có quyền nghề.', true);

    o += thanhNgan();

    if (G.ckNgan === 'noi')   return o + nganNoi();
    if (G.ckNgan === 'vong')  return o + nganVong();
    if (G.ckNgan === 'luong') return o + nganLuong();
    if (G.ckNgan === 'ghe')   return o + nganGhe();
    return o + nganBeBo();
  };

})();
