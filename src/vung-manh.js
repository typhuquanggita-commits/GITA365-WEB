/* ═══════════════════════════════════════════════════════════════
   GITA 365 — MÀN VÙNG MẠNH (Phân hệ 1 của Bộ não)

   ══ MÀN NÀY MỞ BẰNG MỘT CÂU TỰ PHỦ ĐỊNH, VÀ ĐÓ LÀ CHỦ Ý ══

   Bản đặc tả mở Phần III bằng câu: không có một gen nào gọi là gen
   thiên tài. Người mở màn này ra thường mở vì cái tên ấy — nên câu phủ
   định phải là dòng đầu tiên họ đọc, không phải một dòng chú thích ở
   cuối.

   Nói thứ thật ngay, vì thứ thật còn mạnh hơn.

   ══ NĂM NGĂN, VÀ THỨ TỰ LÀ THỨ TỰ VIỆC ══

     ba thứ   — vùng mạnh là gì, và nó KHÔNG phải gì
     bảy trường — chỗ gia đình ghi trong bốn tuần
     bốn tuần — quy trình, và ô CẤM nặng ngang ô việc
     thẻ      — lập và đọc, hạn 90 ngày có răng
     bậc thang— năm tầng giá trị, chỉ tiêu đếm được
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;
G.VIEWS = G.VIEWS || {};

(function () {
  var U = G.U, h = U.h, ic = U.ic;

  var NGAN = [
    {ma: 'bathu',  ten: 'Ba thứ',      ic: 'star'},
    {ma: 'truong', ten: 'Bảy trường',  ic: 'search'},
    {ma: 'tuan',   ten: 'Bốn tuần',    ic: 'clock'},
    {ma: 'the',    ten: 'Thẻ',         ic: 'quote'},
    {ma: 'bac',    ten: 'Bậc thang',   ic: 'arrow'}
  ];

  G.vmNgan = G.vmNgan || 'bathu';

  function oGiaTri(id) {
    var el = typeof document !== 'undefined' && document.getElementById(id);
    return el ? String(el.value || '').trim() : '';
  }
  function veLai() {
    if (!G.S || G.S.view !== 'vung-manh') return;
    if (typeof document === 'undefined' || !document.getElementById('main')) return;
    G.render && G.render();
  }
  G.vmMoNgan = function (ma) { G.vmNgan = ma; veLai(); };

  function thanhNgan() {
    return '<div class="row" style="gap:8px;flex-wrap:wrap;margin-bottom:18px">' +
      NGAN.map(function (n) {
        var on = G.vmNgan === n.ma;
        return '<button class="btn' + (on ? ' primary' : '') + '" ' +
          'onclick="G.vmMoNgan(\'' + n.ma + '\')" style="gap:7px">' +
          ic(n.ic) + h(n.ten) + '</button>';
      }).join('') + '</div>';
  }

  /* ═══════════ NGĂN 1 · BA THỨ QUAN SÁT ĐƯỢC ═══════════ */
  function nganBaThu() {
    var l = G.VM_BA_LUAT || {};
    var o = '<div class="card" style="border-left:3px solid var(--bad)">' +
      '<b>Nói thật trước đã</b>' +
      '<p class="sm mt"><b>Không có một gen nào gọi là gen thiên tài</b>, và không ' +
      'khoá học nào đánh thức được gen. Nói vậy với phụ huynh là nói dối — và phạm ' +
      'cùng lúc Điều 1, Điều 10, Điều 13 của Hiến pháp.</p>' +
      '<p class="sm muted mt">Nhưng thứ thật còn mạnh hơn, và chưa ai ở Việt Nam ' +
      'làm tử tế.</p></div>';

    o += U.sec('Ba thứ quan sát được', 'chỗ ba thứ chồng lên nhau là VÙNG MẠNH');
    o += '<div class="row" style="gap:12px;flex-wrap:wrap">' +
      (G.VM_BA || []).map(function (x) {
        return '<div class="card" style="flex:1 1 240px;border-left:3px solid var(--teal)">' +
          '<b class="sm">' + h(x.ten) + '</b>' +
          '<p class="sm muted mt">' + h(x.vi) + '</p></div>';
      }).join('') + '</div>';

    o += '<div class="card mt2"><p class="sm"><b>Chỗ chồng lên nhau:</b> ' +
      h(l.choChongLen || '') + '</p>' +
      '<p class="sm mt"><b>Là hành vi, không phải bài test:</b> ' +
      h(l.laHanhVi || '') + '</p>' +
      '<p class="sm mt"><b>Không chấm điểm:</b> ' + h(l.khongChamDiem || '') + '</p></div>';

    /* Bộ dò cắm ở chính phân hệ này, vì người viết bài về vùng mạnh là
       người đứng gần lời hứa gen nhất. */
    o += U.sec('Tám cụm cấm nói', 'bộ dò cắm ở chính phân hệ này, không gửi sang chỗ chung');
    o += U.tbl(['Cụm cấm', 'Vì sao'],
      (G.VM_CAM_NOI || []).map(function (x) {
        return ['<b class="sm">' + h(x.cum) + '</b>',
          '<span class="sm muted">' + h(x.vi) + '</span>'];
      }));
    o += '<div class="card mt2" style="border-left:3px solid var(--warn)">' +
      '<p class="sm muted">' + h((G.VM_CAM_LUAT || {}).viSaoCamODay || '') + '</p>' +
      '<p class="sm muted mt">' + h((G.VM_CAM_LUAT || {}).noiThayGi || '') + '</p></div>';

    o += U.sec('Ba lằn ranh đạo đức', 'cả ba cắm thành RĂNG ở máy chủ, không để làm cảnh');
    o += (G.VM_LANRANH || []).map(function (x) {
      return '<div class="card mt" style="border-left:3px solid var(--bad)">' +
        '<b>' + h(x.ma + ' · ' + x.ten) + '</b>' +
        '<p class="sm mt">' + h(x.luat) + '</p>' +
        '<p class="sm muted mt">' + h(x.vi) + '</p>' +
        '<p class="sm mt"><b>Máy canh thế nào:</b> ' + h(x.may) + '</p></div>';
    }).join('');
    return o;
  }

  /* ═══════════ NGĂN 2 · BẢY TRƯỜNG QUAN SÁT ═══════════ */
  function nganTruong() {
    var o = '<div class="card"><b>Bảy trường quan sát</b>' +
      '<p class="sm muted mt">Gia đình ghi bảy trường này trong bốn tuần. Đây là ' +
      '<b>tài sản cá nhân hoá</b> của GITA — mọi thứ về sau đều chạy trên nó.</p></div>';
    o += U.tbl(['#', 'Trường', 'Câu hỏi cha mẹ tự trả lời', 'Ví dụ ghi chép'],
      (G.VM_TRUONG || []).map(function (x) {
        return ['<b>' + h(String(x.so)) + '</b>',
          '<b class="sm">' + h(x.ten) +
            (x.quanTrongNhat ? ' <span style="color:var(--bad)">★</span>' : '') + '</b>',
          '<span class="sm">' + h(x.hoi) + '</span>',
          '<span class="sm muted">' + h(x.viDu) + '</span>'];
      }));
    /* Trường 7 đứng RIÊNG một thẻ, không chỉ là một dấu sao trong bảng:
       bản đặc tả gọi nó là trường quan trọng nhất và ít ai hỏi, và một
       dấu sao trong bảng thì người ta lướt qua. */
    var t7 = (G.VM_TRUONG || []).filter(function (x) { return x.quanTrongNhat; })[0];
    if (t7) o += '<div class="card mt2" style="border-left:3px solid var(--bad)">' +
      '<b>Trường ' + h(String(t7.so)) + ' — ' + h(t7.ten) + ' · quan trọng nhất, và ít ai hỏi</b>' +
      '<p class="sm mt">' + h(t7.vi) + '</p></div>';
    return o;
  }

  /* ═══════════ NGĂN 3 · QUY TRÌNH BỐN TUẦN ═══════════ */
  function nganTuan() {
    var o = '<div class="card"><b>Bốn tuần, rồi mới có thẻ</b>' +
      '<p class="sm muted mt">Ô <b>CẤM</b> nặng ngang ô việc. Tuần 1 mà cha mẹ bắt ' +
      'đầu sửa thì ba tuần sau đo được một đứa trẻ đang <i>diễn</i>, không phải một ' +
      'đứa trẻ.</p></div>';
    o += (G.VM_TUAN || []).map(function (x) {
      return '<div class="card mt" style="border-left:3px solid var(--teal)">' +
        '<b>TUẦN ' + h(String(x.tuan)) + ' — ' + h(x.ten) + '</b>' +
        '<p class="sm mt">' + h(x.viec) + '</p>' +
        '<p class="sm mt" style="color:var(--bad)"><b>Cấm:</b> ' + h(x.cam) + '</p>' +
        '<p class="sm muted mt">' + h(x.vi) + '</p></div>';
    }).join('');
    return o;
  }

  /* ═══════════ NGĂN 4 · THẺ VÙNG MẠNH ═══════════ */
  function nganThe() {
    var t = G.VM_THE || {};
    var o = '<div class="card"><b>Thẻ Vùng Mạnh — một tờ A4, năm dòng</b>' +
      '<p class="sm muted mt">Không điểm số. Không nhãn. Không so sánh. Hạn <b>' +
      h(String(t.hanNgay || 90)) + ' ngày</b>, và hạn là một cánh cửa chứ không phải ' +
      'một lời nhắc: quá hạn thì máy <b>không trả về năm dòng nữa</b>.</p>' +
      '<p class="sm mt" style="color:var(--bad)"><b>Thẻ không mang:</b> ' +
      h((t.khongCo || []).join(' · ')) + '</p>' +
      '<p class="sm muted mt">' + h(t.viKhongCo || '') + '</p></div>';

    o += '<div class="card mt2"><b class="sm">Lập thẻ</b>' +
      '<div class="row mt" style="gap:10px;flex-wrap:wrap">' +
      '<label class="sm" style="flex:1 1 200px"><b>Mã gia đình</b>' +
      '<input id="vmNha" class="inp" maxlength="60"></label>' +
      '<label class="sm" style="flex:1 1 120px"><b>Tuổi con</b>' +
      '<input id="vmTuoi" class="inp" inputmode="numeric" maxlength="3"></label></div>' +
      (t.dong || []).map(function (d) {
        return '<div class="mt"><label class="sm"><b>' + h(String(d.so) + '. ' + d.nhan) +
          '</b></label><input id="vm' + h(d.ma) + '" class="inp" maxlength="300"></div>';
      }).join('') +
      '<p class="tiny muted mt"><b>Ghi chú in trên thẻ, bắt buộc:</b> ' +
      h(t.chuThich || '') + '</p>' +
      '<div class="row mt2" style="gap:8px">' +
      '<button class="btn primary" onclick="G.vmLapThe()">Lập thẻ</button>' +
      '<button class="btn" onclick="G.vmDocThe()">Đọc thẻ của nhà này</button>' +
      '</div></div>';

    var r = G.vmLapRa;
    if (r) o += !r.ok
      ? '<div class="card" style="border-left:3px solid var(--bad);margin-top:14px">' +
        '<p class="sm">' + h(r.error || '') + '</p></div>'
      : '<div class="card" style="border-left:3px solid var(--ok);margin-top:14px">' +
        '<b>' + h(r.id) + ' · thẻ lần ' + h(String(r.lan)) + '</b>' +
        '<p class="sm muted mt">' + h(r.vi || '') + '</p></div>';

    var d = G.vmDocRa;
    if (d) {
      if (!d.ok) o += '<div class="card" style="border-left:3px solid var(--bad);' +
        'margin-top:14px"><p class="sm">' + h(d.error || '') + '</p></div>';
      else {
        /* Quá hạn thì cả thẻ đỏ và KHÔNG có năm dòng để đọc — không
           phải một dòng nhắc nhỏ bên trên một tấm thẻ trông vẫn y hệt. */
        o += '<div class="card" style="border-left:3px solid var(--' +
          (d.conHan ? 'ok' : 'bad') + ');margin-top:14px">' +
          '<b>' + h(d.conHan
            ? 'Thẻ lần ' + d.lan + ' · còn ' + d.conLai + ' ngày'
            : 'THẺ ĐÃ QUÁ HẠN ' + d.quaHanNgay + ' NGÀY') + '</b>' +
          '<p class="sm muted mt">' + h(d.vi || '') + '</p>' +
          (d.the
            ? (G.VM_THE.dong || []).map(function (x) {
                return '<p class="sm mt"><b>' + h(x.nhan) + ':</b> ' +
                  h(d.the[x.ma.toLowerCase()] || '') + '</p>';
              }).join('') +
              '<p class="tiny muted mt">' + h(d.chuThich || '') + '</p>'
            : '<p class="sm mt"><b>Máy không trả về năm dòng nữa.</b> Trẻ đổi rất ' +
              'nhanh; một tấm thẻ quá hạn đọc được là một cái nhãn cũ dán lên một ' +
              'đứa trẻ đã khác.</p>') +
          '</div>';
      }
    }

    o += U.sec('Từ Thẻ sang lộ trình', 'máy ĐỀ NGHỊ, người chốt — đây là chỗ cá nhân hoá thật sự xảy ra');
    o += U.tbl(['Nếu Thẻ cho thấy', 'Thì lộ trình đổi thế nào'],
      (G.VM_DOI || []).map(function (x) {
        return ['<b class="sm">' + h(x.neu) + '</b>',
          '<span class="sm">' + h(x.thi) + '</span>'];
      }));
    return o;
  }

  G.vmLapThe = function () {
    var the = {};
    ((G.VM_THE || {}).dong || []).forEach(function (d) {
      the[d.ma.toLowerCase()] = oGiaTri('vm' + d.ma);
    });
    G.goiMayChu('lapTheVungManh', {maNha: oGiaTri('vmNha'),
      tuoiCon: oGiaTri('vmTuoi'), the: the})
      .then(function (d) { G.vmLapRa = d; veLai(); });
  };
  G.vmDocThe = function () {
    G.goiMayChu('docTheVungManh', {maNha: oGiaTri('vmNha')})
      .then(function (d) { G.vmDocRa = d; veLai(); });
  };

  /* ═══════════ NGĂN 5 · BẬC THANG NĂM TẦNG GIÁ TRỊ ═══════════ */
  function nganBac() {
    var l = G.VM_BAC_LUAT || {};
    var o = '<div class="card"><b>Bậc thang năm tầng giá trị</b>' +
      '<p class="sm muted mt">Thay đổi xã hội không đến từ khẩu hiệu. Nó đến từ việc ' +
      '<b>mỗi đứa trẻ làm được một việc thật cho một người thật</b>, lặp lại đủ ' +
      'nhiều lần.</p></div>';
    o += U.tbl(['Tầng', 'Tên', 'Việc cụ thể của con', 'Dấu hiệu đạt'],
      (G.VM_BAC || []).map(function (x) {
        return ['<b>' + h(String(x.bac)) + '</b>', '<b class="sm">' + h(x.ten) + '</b>',
          '<span class="sm">' + h(x.viec) + '</span>',
          '<span class="sm muted">' + h(x.dau) + '</span>'];
      }));
    o += '<div class="card mt2" style="border-left:3px solid var(--gita)">' +
      '<b class="sm">Chỉ tiêu duy nhất, đo được, không thổi phồng</b>' +
      '<p class="sm mt">' + h(l.chiTieuDuyNhat || '') + '</p>' +
      '<p class="sm muted mt">' + h(l.vaSaoDuocNoiRa || '') + '</p>' +
      '<p class="sm muted mt">' + h(l.khoGianLanNhat || '') + '</p></div>';

    o += U.sec('Bốn mùa của 365 ngày', 'khung năm tầng đã khoá, chia theo mùa cho cha mẹ dễ hình dung');
    o += U.tbl(['Mùa', 'Ngày', 'Tầng GITA', 'Việc chính', 'Sản phẩm cuối mùa'],
      (G.VM_MUA || []).map(function (x) {
        return ['<b class="sm">' + h(x.ten) + '</b>', '<span class="sm">' + h(x.ngay) + '</span>',
          '<span class="sm muted">' + h(x.tang) + '</span>',
          '<span class="sm">' + h(x.viec) + '</span>',
          '<span class="sm">' + h(x.sanPham) + '</span>'];
      }));
    return o;
  }

  G.VIEWS['vung-manh'] = function () {
    var o = '<div class="card" style="border-left:3px solid var(--gita)">' +
      '<b>PHÂN HỆ 1 — ĐÁNH THỨC VÙNG MẠNH</b>' +
      '<p class="sm muted mt">Lõi của Bộ não v3.0. Mỗi đứa trẻ có một tổ hợp riêng ' +
      'gồm <b>ba thứ quan sát được</b>; chỗ ba thứ chồng lên nhau là vùng mạnh — nơi ' +
      'công sức bỏ ra sinh lời gấp nhiều lần so với chỗ khác.</p></div>';

    /* Kho nghề nạp SAU khi đăng nhập, và vai không có gói nghề thì không
       bao giờ nạp. Chặn ở ĐÂY, một chỗ, trước cả thanh ngăn: không chặn
       thì cả năm ngăn vẫn dựng ra khung — bảng có đầu cột mà không có
       dòng, thẻ có viền mà không có chữ. Một cái khung rỗng đọc ra là
       "chỗ này chưa làm xong", không đọc ra là "vai của bạn không mở
       được" — và hai câu ấy khác hẳn nhau. Bộ rà soát chỗ trống bắt
       đúng chỗ này ở 9.99.63. */
    if (!(G.VM_BA || []).length)
      return o + U.empty('Vùng Mạnh chưa mở',
        'Kho nghề chưa nạp. Đăng nhập bằng vai có quyền nghề.', true);

    o += thanhNgan();

    if (G.vmNgan === 'bathu')  return o + nganBaThu();
    if (G.vmNgan === 'truong') return o + nganTruong();
    if (G.vmNgan === 'tuan')   return o + nganTuan();
    if (G.vmNgan === 'the')    return o + nganThe();
    return o + nganBac();
  };

})();
