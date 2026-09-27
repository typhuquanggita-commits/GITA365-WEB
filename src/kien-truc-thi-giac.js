/* ═══════════════════════════════════════════════════════════════
   GITA 365 — MÀN KIẾN TRÚC SƯ THỊ GIÁC

   Chốt của chủ hệ thống bản 9.99.10: "Hiểu hệ thống trước — hiểu nội
   dung — hiểu người dùng — rồi mới thiết kế."

   ══ MÀN NÀY KHÔNG VẼ ẢNH, VÀ NÓI THẲNG RA NGAY DÒNG ĐẦU ══

   Nó dựng ĐỀ BÀI THIẾT KẾ và giữ cổng duyệt. Người dùng mở ra mà tưởng
   sắp có ảnh thì họ thất vọng ở giây thứ ba; nói trước thì họ dùng đúng
   thứ nó làm được.

   ══ SÁU NGĂN, VÀ THỨ TỰ LÀ MỘT QUYẾT ĐỊNH ══

     đọc màn  — máy dựng một màn thật ra chữ rồi đọc
     tài liệu — dán chữ tài liệu, máy chỉ chỗ nên thành hình
     đề xuất  — chỗ làm việc
     kho      — mọi đề xuất, cây phiên bản, chặn ở đâu
     hiến pháp— tra cứu ranh giới Tầng và luật
     luật     — sổ quyết định thương hiệu, bộ nhớ dài hạn

   ĐỌC MÀN đứng đầu vì đó là chỗ bắt đầu đúng: đọc hệ thống trước, rồi
   mới thiết kế. Gõ tay nội dung vào ô đề xuất là đọc một bản chép tay.

   Hiến pháp KHÔNG đứng đầu dù nó là bộ não: người ta mở tra cứu khi có
   một câu hỏi cụ thể, không phải để đọc mỗi ngày.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;
G.VIEWS = G.VIEWS || {};

(function () {
  var U = G.U, h = U.h, ic = U.ic;

  var NGAN = [
    {ma: 'docman',  ten: 'Đọc màn',    ic: 'search'},
    {ma: 'tailieu', ten: 'Tài liệu',   ic: 'quote'},
    /* Đặt TRƯỚC ngăn Đề xuất, theo đúng thứ tự việc: đọc ra ý định →
       đề nghị khổ và sắc khí → phác ba góc → rồi mới viết đề xuất.
       Xếp sau thì người ta viết xong đề xuất mới thấy nó, và lúc ấy
       không ai quay lại đổi khổ nữa. */
    {ma: 'ytuong',  ten: 'Ý tưởng',    ic: 'lightning'},
    {ma: 'dexuat',  ten: 'Đề xuất',    ic: 'plus'},
    /* Sau Đề xuất, vì góp ý chỉ có nghĩa khi đã có một tấm để góp. */
    {ma: 'gopy',    ten: 'Góp ý',      ic: 'quote'},
    /* Cuối, vì đăng là việc cuối cùng — và ngăn này cũng là chỗ GỠ. */
    {ma: 'dang',    ten: 'Đăng · Gỡ',  ic: 'share'},
    {ma: 'phieu',   ten: 'Phễu · Đời tấm', ic: 'pulse'},
    {ma: 'ungpho',  ten: 'Ứng phó',    ic: 'shield'},
    {ma: 'kho',     ten: 'Kho',        ic: 'vault'},
    {ma: 'hienphap',ten: 'Hiến pháp',  ic: 'book'},
    {ma: 'luat',    ten: 'Luật',       ic: 'shield'}
  ];

  G.ktNgan = G.ktNgan || 'docman';
  G.ktDuLieu = G.ktDuLieu || {};

  /* Màu của từng bậc. Lấy từ biến CSS — cùng luật với bảng tin. */
  var MAU_BAC = {
    nhap: 'var(--ink-3)', deXuat: 'var(--teal)', mophong: 'var(--warn)',
    duyet: 'var(--ok)', hoanThien: 'var(--ok)', phatHanh: 'var(--gita)',
    tuChoi: 'var(--bad)'
  };
  var TEN_BAC = {nhap: 'Nháp', deXuat: 'Đã đề xuất', mophong: 'Mô phỏng',
    duyet: 'Đã duyệt', hoanThien: 'Bản cuối', phatHanh: 'Đã phát hành',
    tuChoi: 'Bị từ chối'};

  function laChuHe() {
    return ((G.S && G.S.acc && G.S.acc.role) || '') === 'R01';
  }
  function oGiaTri(id) {
    var el = typeof document !== 'undefined' && document.getElementById(id);
    return el ? String(el.value || '').trim() : '';
  }
  function veLai() {
    if (!G.S || G.S.view !== 'kien-truc-thi-giac') return;
    if (typeof document === 'undefined' || !document.getElementById('main')) return;
    G.render && G.render();
  }

  function thanhNgan() {
    return '<div class="row" style="gap:8px;flex-wrap:wrap;margin-bottom:18px">' +
      NGAN.map(function (n) {
        var on = G.ktNgan === n.ma;
        return '<button class="btn' + (on ? ' primary' : '') + '" ' +
          'onclick="G.ktMoNgan(\'' + n.ma + '\')" style="gap:7px">' +
          ic(n.ic) + h(n.ten) + '</button>';
      }).join('') + '</div>';
  }
  G.ktMoNgan = function (ma) { G.ktNgan = ma; veLai(); };

  G.ktNap = function () {
    if (!G.goiMayChu) return;
    G.ktDuLieu.dangNap = true;
    G.goiMayChu('khoThiGiac', {}).then(function (d) {
      G.ktDuLieu.kho = d; G.ktDuLieu.dangNap = false; veLai();
    });
  };

  /* ═══════════ NGĂN 1 · ĐỌC MÀN HÌNH THẬT ═══════════

     Chốt 9.99.11. Trước bản này người dùng phải TỰ GÕ nội dung vào ô đề
     xuất, nghĩa là máy đọc một bản chép tay của màn hình chứ không đọc
     màn hình. Bản chép tay thì thiếu chỗ nào không ai biết.

     Nay nó dựng thẳng màn ấy ra chữ rồi đọc. Chạy ở MÁY KHÁCH vì màn
     hình là mã máy khách — máy chủ không có gì để đọc.

     ══ VÀ NÓ KHÔNG TỰ GỬI ĐI ══

     Nó điền sẵn ô đề xuất rồi DỪNG. Máy đoán Tầng bằng cách dò chữ, và
     dò chữ thì đoán sai được — một đề xuất tự gửi dựa trên một cái đoán
     là đúng thứ luật "không tự suy diễn" cấm. Người xác nhận rồi mới đi
     tiếp. */
  function nganDocMan() {
    /* G.NAV là danh sách NHÓM, mỗi nhóm có .items — không phải danh sách
       màn. Bản đầu tôi lọc thẳng trên G.NAV nên ô chọn ra RỖNG, và lượt
       đọc rơi vào nhánh "màn không có chữ" với một câu chẩn đoán trỏ sai
       hẳn chỗ. Chạy demo mới thấy: 0 mục trong ô chọn. */
    var nav = [];
    (G.NAV || []).forEach(function (nh) {
      (nh.items || []).forEach(function (x) {
        if (x && x.v && x.t && G.VIEWS[x.v]) nav.push(x);
      });
    });
    var o = '<div class="card"><b>Máy dựng màn ấy ra chữ rồi đọc</b>' +
      '<p class="sm muted mt">Trước bản này người dùng phải tự gõ nội dung vào ô ' +
      'đề xuất — nghĩa là máy đọc một bản chép tay chứ không đọc màn hình, và bản ' +
      'chép tay thì thiếu chỗ nào không ai biết. Máy ĐOÁN chặng bằng cách dò chữ và ' +
      'điền sẵn, rồi DỪNG: đoán sai được, nên người xác nhận rồi mới đi tiếp.</p></div>';

    o += U.sec('Chọn một màn', nav.length + ' màn đang có trong hệ');
    o += '<div class="card"><select id="ktMan" class="inp">' +
      nav.map(function (x) {
        return '<option value="' + h(x.v) + '">' + h(x.t) + '</option>';
      }).join('') + '</select>' +
      '<div class="row mt2" style="gap:8px">' +
      '<button class="btn primary" onclick="G.ktDocMan()">Đọc màn này</button>' +
      '</div></div>';

    var r = G.ktDocRa;
    if (!r) return o;
    if (r.loi)
      return o + '<div class="card" style="border-left:3px solid var(--bad);margin-top:14px">' +
        '<b>Không dựng được màn này ra chữ</b>' +
        '<p class="sm mt">' + h(r.loi) + '</p>' +
        '<p class="sm muted mt">Một số màn cần dữ liệu của một vai cụ thể mới vẽ ' +
        'được. Đăng nhập bằng vai ấy rồi đọc lại.</p></div>';

    o += U.sec('Máy đọc được gì', 'Máy ĐOÁN — người xác nhận.');
    o += '<div class="card">' +
      '<p class="sm"><b>Màn:</b> ' + h(r.ten) + ' · <code>' + h(r.v) + '</code></p>' +
      '<p class="sm mt"><b>Chặng máy đoán:</b> ' +
        (r.tangDoan ? '<b style="color:var(--teal)">' + h(r.tangDoan) + '</b>' +
          ' <span class="muted">(' + h(r.viDoan) + ')</span>'
        : '<span class="muted">không đoán được — người khai</span>') + '</p>' +
      '<p class="sm mt"><b>Người xem máy đoán:</b> ' +
        h((r.nguoiDoan || []).join(', ') || '(không rõ)') + '</p>' +
      '<p class="sm mt"><b>Dài:</b> ' + h(String(r.soChu)) + ' chữ · ' +
        h(String(r.soMuc)) + ' mục</p>' +
      '<p class="sm mt"><b>Loại hình máy đề nghị:</b> ' +
        h(r.loaiDoan || '(chưa rõ)') + '</p>' +
      '<div class="row mt2" style="gap:8px">' +
      '<button class="btn primary" onclick="G.ktDienSan()">Điền sẵn vào ô đề xuất</button>' +
      '</div></div>';
    o += '<pre class="sm mt" style="white-space:pre-wrap;background:var(--phu-2);' +
      'padding:12px;border-radius:10px;max-height:260px;overflow:auto">' +
      h(r.chu.slice(0, 1800)) + '</pre>';
    return o;
  }

  /* Dò chặng bằng chữ. Đọc HP_TANG chứ không gắn cứng — bảng chặng đổi
     thì phép dò đổi theo. */
  function doanTang(chu) {
    var t = String(chu || '').toLowerCase();
    var diem = [];
    (G.HP_TANG || []).forEach(function (x) {
      var d = 0, ten = String(x.ten || '').toLowerCase();
      if (t.indexOf(x.tang.toLowerCase()) >= 0) d += 2;
      ten.split(/[\s—,]+/).forEach(function (w) {
        if (w.length >= 4 && t.indexOf(w) >= 0) d += 1;
      });
      if (d) diem.push({tang: x.tang, d: d, ten: x.ten});
    });
    diem.sort(function (a, b) { return b.d - a.d; });
    return diem[0] || null;
  }

  G.ktDocMan = function () {
    var v = oGiaTri('ktMan');
    var muc = {};
    (G.NAV || []).forEach(function (nh) {
      (nh.items || []).forEach(function (x) { if (x.v === v) muc = x; });
    });
    if (!v || !G.VIEWS[v]) {
      G.ktDocRa = {loi: 'Chưa chọn được màn nào. Ô chọn đang rỗng — nghĩa là bảng ' +
        'điều hướng chưa nạp, hoặc vai hiện tại không mở màn nào.'};
      return veLai();
    }
    var chu = '', loi = '';
    try {
      var html = (G.VIEWS && G.VIEWS[v]) ? G.VIEWS[v]() : '';
      chu = String(html).replace(/<style[\s\S]*?<\/style>/g, ' ')
        .replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/g, ' ')
        .replace(/\s+/g, ' ').trim();
      if (chu.length < 40) loi = 'Màn dựng ra gần như không có chữ.';
    } catch (e) { loi = String(e && e.message || e); }

    if (loi) { G.ktDocRa = {loi: loi}; return veLai(); }

    var dt = doanTang(chu + ' ' + (muc.t || '') + ' ' + (muc.h || ''));
    /* Người xem đoán từ chính chữ trên màn, không đoán từ tên màn: tên
       màn là thứ người làm đặt, còn chữ là thứ người dùng đọc. */
    var ng = [];
    if (/phụ huynh|bố mẹ|gia đình mình/i.test(chu)) ng.push('PHUHUYNH');
    if (/học viên|con đang|bài tập/i.test(chu)) ng.push('HOCVIEN');
    if (/coach|kèm|phác đồ|kịch bản/i.test(chu)) ng.push('COACH');
    if (/toàn hệ|super admin|quản trị/i.test(chu)) ng.push('CHUHE');
    if (!ng.length) ng.push('COACH');

    var loai = /bước|quy trình/i.test(chu) ? 'QUY_TRINH'
      : /ngày|chặng|lộ trình/i.test(chu) ? 'BANDO_HANHTRINH'
      : /điều kiện|nghiệm thu/i.test(chu) ? 'CONG'
      : /danh sách|cần làm/i.test(chu) ? 'DANH_SACH_VIEC' : 'KHUNG';

    G.ktDocRa = {v: v, ten: muc.t || v, chu: chu, soChu: chu.length,
      soMuc: (String(chu).match(/·/g) || []).length,
      tangDoan: dt ? dt.tang : '', viDoan: dt ? dt.ten : '',
      nguoiDoan: ng, loaiDoan: loai};
    veLai();
  };

  G.ktDienSan = function () {
    var r = G.ktDocRa;
    if (!r || r.loi) return;
    G.ktMoiTuMan = r;
    G.ktNgan = 'dexuat';
    veLai();
    U.toast('Đã điền sẵn — kiểm lại chặng trước khi đề xuất');
  };

  /* ═══════════ NGĂN 2 · TÀI LIỆU ═══════════

     Nó đọc CHỮ, không đọc PDF hay DOCX: mở ba định dạng ấy cần một thư
     viện tải từ mạng ngoài, mà chính sách nội dung của bản web chặn mọi
     nguồn ngoài — và nới ra để đọc một tệp là nới cho mọi thứ khác đi
     qua cùng cái lỗ. Mở tài liệu bằng phần mềm sẵn có, chọn hết, dán
     vào: mất mười giây, và không phải nới lỗ nào. */
  function nganTaiLieu() {
    var o = '<div class="card"><b>Dán chữ của tài liệu vào đây</b>' +
      '<p class="sm muted mt">Máy đọc CHỮ, không đọc PDF hay DOCX — mở ba định dạng ' +
      'ấy cần một thư viện tải từ mạng ngoài, mà nới chính sách nội dung ra để đọc ' +
      'một tệp là nới cho mọi thứ khác đi qua cùng cái lỗ. Mở tài liệu bằng phần ' +
      'mềm sẵn có, chọn hết, dán vào.</p>' +
      '<p class="sm muted mt">Máy CHỈ nói chỗ nào nên thành hình gì. Nó không sửa ' +
      'một chữ nào — sửa nội dung đã duyệt là việc của người viết.</p></div>';

    o += '<div class="card mt2">' +
      '<label class="sm"><b>Tài liệu này thuộc chặng nào</b></label>' +
      '<select id="ktTlTang" class="inp">' +
      ['T1', 'T2', 'T3', 'T4', 'T5'].map(function (t) {
        var x = (G.HP_TANG || []).filter(function (y) { return y.tang === t; })[0];
        return '<option value="' + t + '">' + h(t + ' — ' +
          ((x && x.ten) || '').slice(0, 50)) + '</option>';
      }).join('') + '</select>' +
      '<div class="mt"><label class="sm"><b>Chữ của tài liệu</b> ' +
      '<span class="muted">(để dòng trống giữa các ý — máy chia theo đó)</span></label>' +
      '<textarea id="ktTlChu" class="inp" rows="10" maxlength="200000"></textarea></div>' +
      '<div class="row mt2" style="gap:8px">' +
      '<button class="btn primary" onclick="G.ktDocTaiLieu()">Đọc và đề nghị</button>' +
      '</div></div>';

    var d = G.ktTlRa;
    if (!d) return o;
    if (!d.ok)
      return o + '<div class="card" style="border-left:3px solid var(--bad);margin-top:14px">' +
        '<p class="sm">' + h(d.error || '') + '</p></div>';

    if ((d.phamTang || []).length)
      o += '<div class="card" style="border-left:3px solid var(--bad);margin-top:14px">' +
        '<b>' + h(String(d.phamTang.length)) + ' đoạn vượt ranh giới chặng ' +
        h(d.tang) + '</b>' +
        d.phamTang.map(function (p) {
          return '<p class="sm mt">Đoạn ' + h(String(p.doan)) + ' — phạm <b>' +
            h(p.pham.join(', ')) + '</b><br><span class="muted">' + h(p.trich) +
            '…</span></p>';
        }).join('') + '</div>';

    if (d.canhBao)
      o += '<div class="card" style="border-left:3px solid var(--warn);margin-top:14px">' +
        '<p class="sm">' + h(d.canhBao) + '</p></div>';

    o += U.sec('Chỗ nên thành hình',
      d.soDoan + ' đoạn · ' + d.viTri.length + ' chỗ được đề nghị · ' + d.tyLe + '%');
    o += U.tbl(['Đoạn', 'Nên làm', 'Vì', 'Trích'],
      d.viTri.map(function (v) {
        var lh = (G.TG_LOAIHINH || []).filter(function (x) { return x.ma === v.nen; })[0];
        return ['<b>' + h(String(v.doan)) + '</b>',
          h((lh && lh.ten) || v.nen),
          '<span class="sm muted">' + h(v.vi) + '</span>',
          '<span class="sm muted">' + h(v.trich) + '…</span>'];
      }));
    return o;
  }

  G.ktDocTaiLieu = function () {
    G.goiMayChu('docTaiLieuThiGiac', {tang: oGiaTri('ktTlTang'), chu: oGiaTri('ktTlChu')})
      .then(function (d) { G.ktTlRa = d; veLai(); });
  };

  /* ═══════════ NGĂN 3 · Ý TƯỞNG ═══════════

     Ba việc trong một lượt, và ba việc ấy phải đứng CÙNG MỘT CHỖ vì
     chúng phụ thuộc nhau: ý định quyết khổ, khổ quyết bố cục, và bố cục
     quyết được bao nhiêu chữ.

     Ba chỗ máy CỐ Ý không làm thay, ghi ra ở đây để lần sau không ai
     tưởng là thiếu sót:

       · Không đoán ý định khi không có dấu hiệu nào. Rơi về một ý định
         mặc định là đoán, và một cái đoán trình ra như một đề nghị thì
         người ta tin nó đã được cân nhắc.
       · Không chọn khổ khi hai nhóm người xem cần hai khổ khác nhau.
         Hai nhóm lệch khổ nghĩa là cần HAI TẤM.
       · Không nghĩ hộ ý tưởng. Máy dựng BA KHUNG theo ba góc nhìn khai
         trước; phần sáng tạo người viết điền. */
  function nganYTuong() {
    var o = '<div class="card"><b>Đọc ý định → đề nghị khổ → phác ba góc</b>' +
      '<p class="sm muted mt">Máy ĐỀ NGHỊ, người chốt. Cả lượt đọc chạy trong máy ' +
      'chủ Học viện — không một câu nội dung nào đi ra ngoài.</p></div>';

    var nx = (G.ktDuLieu.kho && G.ktDuLieu.kho.ok && G.ktDuLieu.kho.nguoiXem) || [];
    o += '<div class="card mt2">' +
      '<label class="sm"><b>Nội dung cần truyền đạt</b> ' +
      '<span class="muted">(từ hai mươi chữ trở lên)</span></label>' +
      '<textarea id="ktYtChu" class="inp" rows="5" maxlength="4000"></textarea>' +
      '<div class="mt"><label class="sm"><b>Nhiệm vụ của tấm</b> ' +
      '<span class="muted">(không bắt buộc — máy đọc kèm để dò ý định)</span></label>' +
      '<input id="ktYtNhiemVu" class="inp" maxlength="300"></div>' +
      '<div class="mt"><label class="sm"><b>Cho ai xem</b></label>' +
      '<div class="row" style="gap:12px;flex-wrap:wrap;margin-top:6px">' +
      nx.map(function (m) {
        var x = (G.TG_NGUOI || []).filter(function (y) { return y.ma === m; })[0];
        return '<label class="sm" style="display:flex;gap:6px;align-items:center">' +
          '<input type="checkbox" class="ktYtNX" value="' + h(m) + '"> ' +
          h((x && x.ten) || m) + '</label>';
      }).join('') + '</div></div>' +
      '<div class="row mt2" style="gap:8px">' +
      '<button class="btn primary" onclick="G.ktDocYTuong()">Đọc và đề nghị</button>' +
      '</div></div>';

    var d = G.ktYtRa;
    if (!d) return o;
    if (!d.ok)
      return o + '<div class="card" style="border-left:3px solid var(--bad);margin-top:14px">' +
        '<p class="sm">' + h(d.error || '') + '</p></div>';

    /* ── Ý ĐỊNH ── */
    var yd = d.yDinh || {};
    var tenY = function (ma) {
      var x = (G.TG_YDINH || []).filter(function (y) { return y.ma === ma; })[0];
      return (x && x.ten) || ma;
    };
    o += '<div class="card" style="border-left:3px solid ' +
      (yd.yDinh ? 'var(--ok)' : 'var(--warn)') + ';margin-top:14px">' +
      '<b>' + h(yd.yDinh ? 'Ý định: ' + tenY(yd.yDinh) : 'Máy không đọc ra ý định nào') +
      '</b><p class="sm muted mt">' + h(yd.vi || '') + '</p>' +
      /* Hai ý định bằng điểm nhau thì NÓI RA. Giấu đi là đưa ra một đề
         nghị chắc chắn hơn sự thật. */
      ((yd.ngang || []).length
        ? '<p class="sm mt"><b>Bằng điểm nhau:</b> ' +
          h(yd.ngang.map(tenY).join(' · ')) + ' — người chọn.</p>' : '') +
      ((yd.xep || []).length > 1
        ? '<p class="tiny muted mt">Xếp sau: ' + h(yd.xep.slice(1).map(function (x) {
            return tenY(x.yDinh) + ' (' + x.diem + ')'; }).join(' · ')) + '</p>' : '') +
      '</div>';

    /* ── KHỔ VÀ SẮC KHÍ ── */
    var k = d.khung || {};
    var tenKho = function (ma) {
      var x = (G.TG_QUYET_KHO || []).filter(function (y) { return y.ma === ma; })[0];
      return x ? x.ten + ' · ' + x.ti : ma;
    };
    o += '<div class="card" style="border-left:3px solid ' +
      (k.co ? 'var(--ok)' : 'var(--warn)') + ';margin-top:14px">' +
      (k.co
        ? '<b>Đề nghị khổ ' + h(tenKho(k.kho)) + '</b>' +
          '<p class="sm mt">Sắc khí: <b>' + h(k.sacKhi || '') + '</b></p>'
        : '<b>' + h(k.lechKho ? 'Hai nhóm người xem cần HAI TẤM' : 'Chưa có đề nghị khổ') +
          '</b><p class="sm muted mt">' + h(k.vi || '') + '</p>') +
      '</div>';

    /* ── BA GÓC ── */
    if ((d.baY || []).length) {
      var tenGoc = function (ma) {
        var x = (G.TG_GOCNHIN || []).filter(function (y) { return y.ma === ma; })[0];
        return (x && x.ten) || ma;
      };
      o += U.sec('Ba góc nhìn', 'ba ý khác nhau ở GỐC, không phải ba biến thể của một ý');
      o += '<div class="row" style="gap:12px;flex-wrap:wrap">' +
        d.baY.map(function (b) {
          var anDu = b.anDu
            ? (G.TG_ANDU || []).filter(function (y) { return y.ma === b.anDu; })[0]
            : null;
          return '<div class="card" style="flex:1 1 260px;border-left:3px solid ' +
            (b.trong ? 'var(--warn)' : 'var(--teal)') + '">' +
            '<b class="sm">' + h(tenGoc(b.gocNhin)) + '</b>' +
            '<p class="sm muted mt">' + h(b.lam || '') + '</p>' +
            (anDu ? '<p class="sm mt">' + h(anDu.hinh) + '</p>' : '') +
            '</div>';
        }).join('') + '</div>';
    }

    o += '<div class="card mt2"><p class="sm muted">' + h(d.vi || '') + '</p></div>';
    return o;
  }

  G.ktDocYTuong = function () {
    var nguoi = [];
    if (typeof document !== 'undefined')
      Array.prototype.forEach.call(document.querySelectorAll('.ktYtNX'), function (c) {
        if (c.checked) nguoi.push(c.value);
      });
    G.goiMayChu('docYTuong', {deXuat: {
      noiDung: oGiaTri('ktYtChu'), nhiemVu: oGiaTri('ktYtNhiemVu'), nguoiXem: nguoi
    }}).then(function (d) { G.ktYtRa = d; veLai(); });
  };

  /* ═══════════ NGĂN 5 · GÓP Ý VÁ VÀO ĐÂU ═══════════

     Màn này KHÔNG viết câu vá. Nó nói vá vào LỚP NÀO, và để nguyên câu
     góp ý của người nói ở lớp ấy.

     Vì sao máy không viết hộ: tấm sau sẽ mang giọng của máy chứ không
     mang giọng của Học viện, và không ai nhận ra chuyện ấy đã xảy ra —
     họ chỉ thấy tấm nào cũng hao hao nhau. */
  function nganGopY() {
    var o = '<div class="card"><b>Góp ý này vá vào lớp nào</b>' +
      '<p class="sm muted mt">Mỗi lượt vẽ lại tốn một lượt gọi bộ tạo ảnh. Góp ý ' +
      '"nhìn lạnh quá" là chuyện lớp Cảm xúc; đem đi sửa Bố cục thì tấm mới vẫn ' +
      'lạnh y hệt, và mất một lượt vẽ để đổi lấy không gì cả.</p>' +
      '<p class="sm muted mt">Máy nói vá vào lớp nào. <b>Câu vá là của người ' +
      'viết</b> — máy viết hộ thì tấm sau mang giọng của máy.</p></div>';

    o += '<div class="card mt2">' +
      '<label class="sm"><b>Góp ý, nguyên văn</b> ' +
      '<span class="muted">(mỗi ý một dòng hoặc một câu)</span></label>' +
      '<textarea id="ktGyChu" class="inp" rows="6" maxlength="4000" ' +
      'placeholder="ví dụ: Bố cục hơi chật ở mép trên. Nhìn lạnh quá. Chữ dòng ' +
      'cuối bị sai dấu."></textarea>' +
      '<div class="row mt2" style="gap:8px">' +
      '<button class="btn primary" onclick="G.ktDocGopY()">Đọc và chia lớp</button>' +
      '</div></div>';

    var d = G.ktGyRa;
    if (!d) return o;
    if (!d.ok)
      return o + '<div class="card" style="border-left:3px solid var(--bad);margin-top:14px">' +
        '<p class="sm">' + h(d.error || '') + '</p></div>';

    /* ── TỪ CHỐI ĐỨNG TRƯỚC ──
       Đặt sau bảng vá thì người ta đọc bảng vá rồi đóng màn. Lời từ chối
       phải là thứ đọc được đầu tiên, và phải kèm AI ĐỔI ĐƯỢC — một lời
       từ chối không chỉ đường thì nó là một cánh cửa đóng. */
    if ((d.tuChoi || []).length) {
      o += '<div class="card" style="border-left:3px solid var(--bad);margin-top:14px">' +
        '<b>' + h(String(d.tuChoi.length)) + ' câu đang xin đổi thứ không mở</b>' +
        d.tuChoi.map(function (t) {
          return '<div class="mt"><p class="sm">“' + h(t.cau) + '”</p>' +
            t.adn.map(function (ma) {
              var a = (G.TG_ADN || []).filter(function (x) { return x.ma === ma; })[0];
              if (!a) return '';
              return '<p class="sm muted mt"><b>' + h(a.ten) + '</b> — ' + h(a.vi) +
                '<br><b>Ai đổi được:</b> ' + h(a.aiDoi) + '</p>';
            }).join('') + '</div>';
        }).join('') + '</div>';
    }

    /* ── BẢNG VÁ, THEO THỨ TỰ L1→L5 ── */
    if ((d.lop || []).length) {
      o += U.sec('Vá vào đâu', d.lop.length + '/5 lớp · thứ tự năm lớp là trọng số');
      o += U.tbl(['Lớp', 'Lớp ấy gồm gì', 'Câu góp ý'],
        d.lop.map(function (x) {
          var l = (G.TG_LOP5 || []).filter(function (y) { return y.ma === x.lop; })[0];
          return ['<b>' + h(x.lop + ' · ' + ((l && l.ten) || '')) + '</b>',
            '<span class="sm muted">' + h((l && l.gom) || '') + '</span>',
            x.cau.map(function (c) { return '<span class="sm">“' + h(c) + '”</span>'; })
              .join('<br>')];
        }));
    }

    /* ── CHƯA ĐỌC RA ── */
    if ((d.khongDoc || []).length)
      o += '<div class="card" style="border-left:3px solid var(--warn);margin-top:14px">' +
        '<b>' + h(String(d.khongDoc.length)) + ' câu máy chưa đọc ra lớp nào</b>' +
        '<p class="sm muted mt">Máy không đoán. Đoán một lớp rồi trình ra như một ' +
        'đề nghị thì người ta tin nó đã được cân nhắc, và họ đi sửa nhầm lớp — ' +
        'tốn đúng một lượt vẽ.</p>' +
        d.khongDoc.map(function (c) {
          return '<p class="sm mt">“' + h(c) + '”</p>'; }).join('') + '</div>';

    o += '<div class="card mt2"><p class="sm muted">' + h(d.vi || '') + '</p></div>';
    return o;
  }

  G.ktDocGopY = function () {
    G.goiMayChu('docGopY', {gopY: oGiaTri('ktGyChu')})
      .then(function (d) { G.ktGyRa = d; veLai(); });
  };

  /* ═══════════ NGĂN 6 · ĐĂNG LÊN KÊNH, VÀ GỠ XUỐNG ═══════════

     Chỗ dễ dựng sai nhất của cả màn này là NÚT GỠ. Dựng sai thì nó tệ
     hơn không có: người bấm tin rằng chuyện đã xong.

     Nên màn hiện HAI trạng thái tách hẳn nhau, và chỗ hở giữa chúng
     đứng ở trên cùng — không nằm trong một cột của bảng, vì một cột
     trong bảng thì người ta lướt qua. */
  function nganDang() {
    var o = '<div class="card"><b>Đăng lên kênh, và gỡ xuống</b>' +
      '<p class="sm muted mt">Chỉ đăng thứ đã <b>phát hành</b>. Mỗi kênh một khổ ' +
      'riêng — đăng sai khổ thì nền tảng tự cắt, và nó cắt ở giữa.</p>' +
      '<p class="sm muted mt"><b>Gỡ trong sổ KHÔNG gỡ được ở ngoài.</b> Tấm đã ' +
      'đăng thì nằm ở máy chủ của nền tảng ấy; ai đã lưu về hoặc chụp màn hình ' +
      'thì vẫn giữ. Sổ chỉ ghi được rằng Học viện đã QUYẾT gỡ.</p></div>';

    o += U.sec('Ba khung giờ vàng', 'máy nói ra khi đăng ngoài khung — và KHÔNG chặn');
    o += '<div class="row" style="gap:10px;flex-wrap:wrap">' +
      (G.TG_GIO_VANG || []).map(function (g) {
        return '<div class="card" style="flex:1 1 220px">' +
          '<b class="sm">' + h(g.tu + ' – ' + g.den) + '</b>' +
          '<p class="sm muted mt">' + h(g.vi) + '</p></div>';
      }).join('') + '</div>';

    o += '<div class="card mt2">' +
      '<div class="row" style="gap:10px;flex-wrap:wrap">' +
      '<label class="sm" style="flex:1 1 200px"><b>Mã tấm đã phát hành</b>' +
      '<input id="ktDgId" class="inp" maxlength="60"></label>' +
      '<label class="sm" style="flex:1 1 200px"><b>Kênh</b>' +
      '<select id="ktDgKenh" class="inp">' + (G.TG_KENH || []).map(function (k) {
        return '<option value="' + h(k.ma) + '">' + h(k.ten) + ' — nhận khổ ' +
          h((k.kho || []).join(' · ')) + '</option>';
      }).join('') + '</select></label>' +
      '<label class="sm" style="flex:1 1 140px"><b>Khổ</b>' +
      '<select id="ktDgKho" class="inp">' + (G.TG_QUYET_KHO || []).map(function (k) {
        return '<option value="' + h(k.ma) + '">' + h(k.ten) + '</option>';
      }).join('') + '</select></label></div>' +
      '<div class="mt"><label class="sm"><b>Chỗ tấm nằm ở kênh ngoài</b> ' +
      '<span class="muted">(không bắt buộc, nhưng thiếu thì lúc cần gỡ phải đi tìm)</span>' +
      '</label><input id="ktDgDuong" class="inp" maxlength="500"></div>' +
      '<div class="mt"><label class="sm"><b>Nếu đăng ngoài khung giờ vàng: vì sao</b>' +
      '</label><input id="ktDgVi" class="inp" maxlength="400" ' +
      'placeholder="ví dụ: nhà đang hỏi ngay trong nhóm, trả lời chậm thì mất nhịp"></div>' +
      '<div class="row mt2" style="gap:8px">' +
      '<button class="btn primary" onclick="G.ktDangTam()">Đăng</button>' +
      '<button class="btn" onclick="G.ktSoDang()">Đọc sổ đăng</button>' +
      '</div></div>';

    var d = G.ktDgRa;
    if (d) o += !d.ok
      ? '<div class="card" style="border-left:3px solid var(--bad);margin-top:14px">' +
        '<p class="sm">' + h(d.error || '') + '</p></div>'
      : '<div class="card" style="border-left:3px solid var(--ok);margin-top:14px">' +
        '<b>' + h(d.id || '') + '</b><p class="sm muted mt">' + h(d.vi || '') + '</p>' +
        (d.conPhaiLam ? '<p class="sm mt"><b>Còn phải làm:</b> ' +
          h(d.conPhaiLam) + '</p>' : '') + '</div>';

    var s = G.ktSoDangRa;
    if (!s || !s.ok) return o;

    /* ── CHỖ HỞ ĐỨNG TRÊN CÙNG ──
       Đã QUYẾT gỡ mà chưa ai vào kênh gỡ xuống thì tấm vẫn đang ở ngoài
       kia. Để dòng ấy thành một cột trong bảng là để người ta lướt qua. */
    if ((s.hoGo || []).length)
      o += '<div class="card" style="border-left:3px solid var(--bad);margin-top:14px">' +
        '<b>' + h(String(s.hoGo.length)) + ' lượt đã QUYẾT gỡ mà tấm vẫn đang ở ngoài</b>' +
        '<p class="sm muted mt">Chưa ai báo đã vào kênh gỡ xuống.</p>' +
        s.hoGo.map(function (x) {
          return '<p class="sm mt">' + (x.gapNgay
            ? '<b style="color:var(--bad)">GẤP</b> · ' : '') +
            h(x.kenh + ' · ' + x.lyDo + ' · quyết lúc ' +
              String(x.quyetLuc || '').slice(0, 16).replace('T', ' ')) + '</p>';
        }).join('') + '</div>';

    o += U.sec('Sổ đăng', s.so + ' lượt · ' + s.soNgoaiGio + ' lượt ngoài khung giờ');
    o += U.tbl(['Kênh', 'Khổ', 'Lúc', 'Khung giờ', 'Gỡ trong sổ', 'Gỡ ở ngoài'],
      (s.ds || []).slice(0, 40).map(function (x) {
        return [h(x.kenh), h(x.kho),
          '<span class="sm muted">' + h(String(x.luc || '').slice(0, 16).replace('T', ' ')) + '</span>',
          x.trongGioVang ? h(x.trongGioVang)
            : '<span class="sm muted">ngoài khung</span>',
          x.goTrongSo ? '<b>' + h(x.goLyDo || '') + '</b>' : '<span class="muted">—</span>',
          /* Hai cột riêng, cố ý. Gộp thành một cột "đã gỡ" là dựng đúng
             cái ô làm người đọc sổ yên tâm nhầm. */
          x.daGoNgoai ? '✓' : (x.goTrongSo
            ? '<b style="color:var(--bad)">CHƯA</b>' : '<span class="muted">—</span>')];
      }));
    return o;
  }

  G.ktDangTam = function () {
    G.goiMayChu('dangTamThiGiac', {
      id: oGiaTri('ktDgId'), kenh: oGiaTri('ktDgKenh'), kho: oGiaTri('ktDgKho'),
      duongDan: oGiaTri('ktDgDuong'), lyDoNgoaiGio: oGiaTri('ktDgVi')
    }).then(function (d) { G.ktDgRa = d; veLai(); });
  };
  G.ktSoDang = function () {
    G.goiMayChu('soDangBai', {}).then(function (d) { G.ktSoDangRa = d; veLai(); });
  };

  /* ═══════════ NGĂN 7 · PHỄU VÀ ĐỜI MỘT TẤM ═══════════

     Luật của cả ngăn này nằm ở một câu: KHÔNG BAO GIỜ gộp cột đo được
     với cột lời khai.

     Đặt một con số gõ tay cạnh một con số đo được — cùng hàng, cùng
     kiểu chữ — thì người đọc tin cả hai như nhau. Mà con số gõ tay thì
     gõ nhầm được, gõ đẹp lên được, hoặc quên gõ mà hàng vẫn đầy.

     Nên hai khối tách hẳn, và khối lời khai KHÔNG có con số nào — chỉ
     có tên của thứ máy không đo được. */
  function nganPheu() {
    var o = '<div class="card"><b>Phễu của đường làm hình</b>' +
      '<p class="sm muted mt">Sáu con số dưới đây <b>đo thẳng</b> trong sổ của Học ' +
      'viện, không ai gõ vào.</p></div>';

    var p = G.ktPheuRa;
    if (!p) o += '<div class="card mt2"><button class="btn primary" ' +
      'onclick="G.ktDoPheu()">Đo phễu</button></div>';
    else if (!p.ok) o += '<div class="card" style="border-left:3px solid var(--bad);' +
      'margin-top:14px"><p class="sm">' + h(p.error || '') + '</p></div>';
    else {
      var d = p.doDuoc || {};
      o += U.sec('Đo được', 'đếm thẳng trong sổ — không ai gõ vào');
      o += '<div class="row" style="gap:10px;flex-wrap:wrap">' +
        (G.TG_PHEU || []).filter(function (x) { return x.nguon === 'do'; })
        .map(function (x) {
          var so = x.ma === 'GO'
            ? (d.GO_TRONG_SO || 0) + ' / ' + (d.GO_THAT_SU || 0)
            : (d[x.ma] === undefined ? '—' : d[x.ma]);
          return '<div class="card" style="flex:1 1 170px">' +
            '<div style="font-size:26px;font-weight:800">' + h(String(so)) + '</div>' +
            '<b class="sm">' + h(x.ten) + '</b>' +
            '<p class="tiny muted mt">' + h(x.vi) + '</p></div>';
        }).join('') + '</div>';
      o += '<p class="sm muted mt">Ô <b>Đã gỡ</b> là hai con số: đã QUYẾT gỡ / đã ' +
        'gỡ THẬT ở ngoài. Một con số gộp thì chỗ hở giữa hai cái biến mất.</p>';

      /* ── KHỐI LỜI KHAI KHÔNG CÓ CON SỐ NÀO ──
         Kể cả số 0. Một số 0 nằm cùng bảng với sáu số đo được thì đọc
         ra là "chưa ai xem", không đọc ra là "máy không biết" — và hai
         câu ấy khác hẳn nhau. */
      o += U.sec('Máy KHÔNG đo được', 'ba thứ này ở bảng của nền tảng ngoài');
      o += '<div class="card" style="border-left:3px solid var(--warn)">' +
        (G.TG_PHEU || []).filter(function (x) { return x.nguon === 'khai'; })
        .map(function (x) {
          return '<p class="sm mt"><b>' + h(x.ten) + '</b> — ' + h(x.vi) + '</p>';
        }).join('') +
        '<p class="sm muted mt">Máy chủ Học viện không nhìn thấy kênh ngoài. Đặt ' +
        'chúng vào bảng trên với giá trị 0 là để người đọc tin chúng như tin sáu ' +
        'con số kia, nên máy không đặt.</p>' +
        /* Từ 9.99.60 chúng CÓ chỗ ghi — và con số đọc lại vẫn nằm trong
           chính khối này, không leo sang bảng đo được. */
        (function () {
          var k = p.loiKhai || {};
          if (!k.soLuotDaKhai) return '<p class="sm mt"><b>' + h(k.vi || '') + '</b></p>';
          return '<p class="sm mt"><b>Đã có người gõ ' + h(String(k.soLuotDaKhai)) +
            ' lượt.</b></p>' +
            ['XEM', 'BAM', 'NHAN_VE'].map(function (m) {
              var o2 = k[m];
              var ten = ((G.TG_PHEU || []).filter(function (x) { return x.ma === m; })[0]
                || {}).ten || m;
              return '<p class="sm mt">' + h(ten) + ': ' + (o2
                ? '<b>' + h(String(o2.tong)) + '</b> <span class="muted">trên ' +
                  h(String(o2.tren)) + ' lượt đăng</span>'
                : '<span class="muted">chưa ai đọc được ô này</span>') + '</p>';
            }).join('') +
            '<p class="tiny muted mt">' + h(k.vi || '') + '</p>';
        })() + '</div>';

      /* Chỗ GÕ nằm ngay dưới khối lời khai, không nằm cạnh bảng đo được:
         đứng cạnh bảng đo được thì người gõ tưởng mình đang bổ sung vào
         cùng một bảng. */
      o += '<div class="card mt2">' +
        '<b class="sm">Gõ số đọc được từ bảng của nền tảng</b>' +
        '<div class="row mt" style="gap:10px;flex-wrap:wrap">' +
        '<label class="sm" style="flex:1 1 200px"><b>Mã lượt đăng</b>' +
        '<input id="ktKsDang" class="inp" maxlength="60"></label>' +
        '<label class="sm" style="flex:1 1 160px"><b>Ngày đọc bảng</b>' +
        '<input id="ktKsNgay" class="inp" type="date"></label></div>' +
        '<div class="row mt" style="gap:10px;flex-wrap:wrap">' +
        '<label class="sm" style="flex:1 1 130px"><b>Lượt xem</b>' +
        '<input id="ktKsXem" class="inp" inputmode="numeric"></label>' +
        '<label class="sm" style="flex:1 1 130px"><b>Lượt bấm</b>' +
        '<input id="ktKsBam" class="inp" inputmode="numeric"></label>' +
        '<label class="sm" style="flex:1 1 130px"><b>Lượt nhắn về</b>' +
        '<input id="ktKsNhan" class="inp" inputmode="numeric"></label></div>' +
        /* Nói thẳng ở ngay chỗ gõ, không giấu trong chú giải: để TRỐNG
           khác hẳn gõ số 0. */
        '<p class="tiny muted mt">Ô nào không đọc được thì <b>để trống</b> — trống ' +
        'nghĩa là không đọc được, khác hẳn số 0 nghĩa là đọc được và bằng không.</p>' +
        '<div class="row mt2" style="gap:8px">' +
        '<button class="btn primary" onclick="G.ktKhaiSo()">Ghi</button></div>' +
        (G.ktKhaiRa ? '<p class="sm mt" style="color:var(--' +
          (G.ktKhaiRa.ok ? 'ok' : 'bad') + ')">' +
          h(G.ktKhaiRa.ok ? G.ktKhaiRa.vi : (G.ktKhaiRa.error || '')) + '</p>' : '') +
        '</div>';
    }

    o += U.sec('Đời một tấm', 'nhật ký đã ghi đủ từ lâu — chỗ này gom lại một chỗ');
    o += '<div class="card"><div class="row" style="gap:10px;flex-wrap:wrap">' +
      '<label class="sm" style="flex:1 1 220px"><b>Mã tấm</b>' +
      '<input id="ktDtId" class="inp" maxlength="60"></label></div>' +
      '<div class="row mt2" style="gap:8px">' +
      '<button class="btn primary" onclick="G.ktDoiTam()">Đọc đời tấm này</button>' +
      '</div></div>';

    var t = G.ktDoiRa;
    if (!t) return o;
    if (!t.ok) return o + '<div class="card" style="border-left:3px solid var(--bad);' +
      'margin-top:14px"><p class="sm">' + h(t.error || '') + '</p></div>';

    /* Chỗ hở đứng TRƯỚC dòng thời gian: một dòng nằm trong dòng thời
       gian thì người ta đọc như một việc đã qua. */
    if ((t.conHo || []).length)
      o += '<div class="card" style="border-left:3px solid var(--bad);margin-top:14px">' +
        '<b>Tấm này còn ở ngoài kia</b>' +
        t.conHo.map(function (c) {
          return '<p class="sm mt">' + h(c.kenh + ' · đã quyết gỡ ' +
            String(c.quyetLuc || '').slice(0, 16).replace('T', ' ') +
            ' · chưa ai báo đã gỡ') + '</p>';
        }).join('') + '</div>';

    o += '<div class="card mt2"><p class="sm">Bản ' + h(String(t.ban)) +
      ' · bậc <b>' + h(t.trangThai) + '</b>' +
      (t.diem !== null && t.diem !== undefined
        ? ' · ' + h(String(t.diem)) + 'đ ' + h(t.bacDiem || '') : '') + '</p></div>';
    o += U.tbl(['Lúc', 'Việc', 'Ai', 'Chi tiết'],
      (t.nhatKy || []).map(function (n) {
        return ['<span class="sm muted">' +
            h(String(n.luc || '').slice(0, 16).replace('T', ' ')) + '</span>',
          '<b class="sm">' + h(n.viec) + '</b>',
          '<span class="sm">' + h(n.username || '') + '</span>',
          '<span class="sm muted">' + h(String(n.chiTiet || '').slice(0, 120)) + '</span>'];
      }));
    return o;
  }

  G.ktDoPheu = function () {
    G.goiMayChu('doPheuThiGiac', {}).then(function (d) { G.ktPheuRa = d; veLai(); });
  };
  G.ktKhaiSo = function () {
    G.goiMayChu('khaiSoKenhNgoai', {
      idDang: oGiaTri('ktKsDang'), ngayDoc: oGiaTri('ktKsNgay'),
      xem: oGiaTri('ktKsXem'), bam: oGiaTri('ktKsBam'), nhanVe: oGiaTri('ktKsNhan')
    }).then(function (d) {
      G.ktKhaiRa = d;
      /* Ghi xong thì đo lại ngay — không bắt người dùng bấm lần nữa để
         thấy con số mình vừa gõ. */
      if (d.ok) G.goiMayChu('doPheuThiGiac', {}).then(function (q) {
        G.ktPheuRa = q; veLai(); });
      else veLai();
    });
  };
  G.ktDoiTam = function () {
    G.goiMayChu('doiMotTam', {id: oGiaTri('ktDtId')})
      .then(function (d) { G.ktDoiRa = d; veLai(); });
  };

  /* ═══════════ NGĂN 8 · MƯỜI TỜ ỨNG PHÓ ═══════════

     Mười chuyện có thể xảy ra thật. Mỗi tờ viết TRƯỚC, vì lúc chuyện
     xảy ra thì không ai ngồi nghĩ ra quy trình được.

     Tờ GẤP đứng trước, và mang nhãn đỏ. Xếp theo mã thì tờ "bộ kiểm đỏ
     trước giờ phát hành" nằm cạnh tờ "người trong ảnh rút lời đồng ý"
     như thể hai việc cùng một nhịp — mà chúng không cùng. */
  function nganUngPho() {
    var ds = (G.TG_UNGPHO || []).slice().sort(function (a, b) {
      return (b.gap ? 1 : 0) - (a.gap ? 1 : 0);
    });
    var soGap = ds.filter(function (x) { return x.gap; }).length;
    var o = '<div class="card"><b>Mười tờ ứng phó</b>' +
      '<p class="sm muted mt">Viết trước, vì lúc chuyện xảy ra thì không ai ngồi ' +
      'nghĩ ra quy trình được. Mỗi bước phải <b>làm được</b> — "xử lý nhanh" không ' +
      'phải một bước.</p></div>';
    o += U.sec('Mười tờ', soGap + ' tờ GẤP đứng trước');
    o += ds.map(function (x) {
      return '<div class="card mt" style="border-left:3px solid ' +
        (x.gap ? 'var(--bad)' : 'var(--teal)') + '">' +
        '<b>' + (x.gap ? '<span style="color:var(--bad)">GẤP</span> · ' : '') +
        h(x.ma + ' · ' + x.ten) + '</b>' +
        '<p class="sm mt"><b>Khi nào:</b> ' + h(x.khiNao) + '</p>' +
        '<p class="sm mt"><b>Ai làm:</b> ' + h(x.aiLam) +
        ' · <b>Trong:</b> ' + h(x.trong) + '</p>' +
        '<ol class="sm mt" style="padding-left:20px">' +
        (x.buoc || []).map(function (b) {
          return '<li style="margin-top:4px">' + h(b) + '</li>'; }).join('') +
        '</ol><p class="sm muted mt">' + h(x.vi) + '</p></div>';
    }).join('');
    return o;
  }

  /* ═══════════ NGĂN 4 · ĐỀ XUẤT ═══════════ */
  function nganDeXuat() {
    var d = G.ktDuLieu.kho;
    var loai = (d && d.ok && d.loaiHinh) || [];
    var nx = (d && d.ok && d.nguoiXem) || [];
    var tang = (d && d.ok && d.thuTuTang) || ['T1', 'T2', 'T3', 'T4', 'T5'];
    var hp = G.TG_LOAIHINH || [];

    /* Điền sẵn từ ngăn ĐỌC MÀN, nếu vừa bấm sang. Đọc một lần rồi thôi:
       giữ mãi thì người dùng sửa tay xong, đổi ngăn, quay lại và thấy
       tay mình bị đè bởi cái máy đoán. */
    var tuMan = G.ktMoiTuMan; G.ktMoiTuMan = null;
    var sanTang = (tuMan && tuMan.tangDoan) || '';
    var sanLoai = (tuMan && tuMan.loaiDoan) || '';
    var sanNguoi = (tuMan && tuMan.nguoiDoan) || [];
    var sanChu = tuMan ? tuMan.chu.slice(0, 3000) : '';
    var sanViTri = tuMan ? ('màn ' + tuMan.v) : '';

    var o = '';
    if (tuMan)
      o += '<div class="card" style="border-left:3px solid var(--warn)">' +
        '<b>Điền sẵn từ màn "' + h(tuMan.ten) + '"</b>' +
        '<p class="sm muted mt">Máy ĐOÁN chặng và người xem bằng cách dò chữ. ' +
        'Kiểm lại trước khi đề xuất — một đề xuất dựng trên một cái đoán chưa ai ' +
        'xác nhận là đúng thứ luật "không tự suy diễn" cấm.</p></div>';

    o += '<div class="card"><b>Máy dựng ĐỀ BÀI THIẾT KẾ, không vẽ ảnh</b>' +
      '<p class="sm muted mt">Nó không gọi ra một bộ tạo ảnh nào — đưa được nội ' +
      'dung thiết kế ra ngoài là đưa được nội dung ra ngoài, cùng một cái cửa. ' +
      'Việc của nó là CHẶN một tấm sai Tầng lại trước khi có ai bỏ công vẽ, và ' +
      'bắt mỗi tấm đi đủ sáu bậc duyệt.</p></div>';

    o += U.sec('Đề xuất một hình',
      'Cổng Tầng chạy TRƯỚC mọi thứ khác. Ranh giới đọc thẳng từ bảng chặng đã ' +
      'chốt, không phải một bản khai riêng.');

    o += '<div class="card">' +
      '<div><label class="sm"><b>Chặng</b></label>' +
      '<select id="ktTang" class="inp">' + tang.map(function (t) {
        var x = (G.TG_TANG || []).filter(function (y) { return y.tang === t; })[0];
        var hpt = (G.HP_TANG || []).filter(function (y) { return y.tang === t; })[0];
        return '<option value="' + h(t) + '"' + (t === sanTang ? ' selected' : '') +
          '>' + h(t + ' — ' +
          ((hpt && hpt.ten) || (x && x.ngonNgu) || t).slice(0, 60)) + '</option>';
      }).join('') + '</select></div>' +

      '<div class="mt"><label class="sm"><b>Loại hình</b> ' +
      '<span class="muted">(mỗi loại đúng MỘT nhiệm vụ)</span></label>' +
      '<select id="ktLoai" class="inp">' + loai.map(function (m) {
        var x = hp.filter(function (y) { return y.ma === m; })[0];
        return '<option value="' + h(m) + '"' + (m === sanLoai ? ' selected' : '') +
          '>' + h(((x && x.ten) || m) +
          ((x && x.nhiemVu) ? ' — ' + x.nhiemVu : '')) + '</option>';
      }).join('') + '</select></div>' +

      '<div class="mt"><label class="sm"><b>Nhiệm vụ DUY NHẤT của tấm này</b></label>' +
      '<input id="ktNhiemVu" class="inp" maxlength="300" ' +
      'placeholder="Viết một câu. Viết không nổi một câu nghĩa là nó đang mang hai việc."></div>' +

      /* ── HAI Ô CỦA CỔNG ĐIỀU NHỎ ──
         Đặt NGAY DƯỚI ô nhiệm vụ, có chủ ý: hai ô này hay bị nhầm là
         một. Nhiệm vụ là việc của TẤM; điều nhỏ là việc của NGƯỜI sau
         khi xem. Đứng cạnh nhau thì cái khác nhau ấy đọc ra ngay. */
      '<div class="mt"><label class="sm"><b>Xem xong, người ta LÀM ĐƯỢC điều nhỏ gì</b>' +
      '<span class="tiny muted"> — việc nhìn thấy được, không phải "hiểu" hay "nhớ"</span>' +
      '</label>' +
      '<input id="ktDieuNho" class="inp" maxlength="300" ' +
      'placeholder="ví dụ: tối nay ghi một dòng vào sổ · bấm mở chặng 1 · nhắn cho Tư vấn một câu hỏi"></div>' +

      '<div class="mt"><label class="sm"><b>Họ gặp tấm này vào lúc nào trong đời</b></label>' +
      '<input id="ktThoiDiem" class="inp" maxlength="200" ' +
      'placeholder="ví dụ: tối sau giờ học · mùa khai giảng · lúc vừa cãi nhau với con"></div>' +

      '<div class="mt"><label class="sm"><b>Cho ai xem</b></label>' +
      '<div class="row" style="gap:12px;flex-wrap:wrap;margin-top:6px">' +
      nx.map(function (m) {
        var x = (G.TG_NGUOI || []).filter(function (y) { return y.ma === m; })[0];
        return '<label class="sm" style="display:flex;gap:6px;align-items:center">' +
          '<input type="checkbox" class="ktNX" value="' + h(m) + '"' +
          (sanNguoi.indexOf(m) >= 0 ? ' checked' : '') + '> ' +
          h((x && x.ten) || m) + '</label>';
      }).join('') + '</div></div>' +

      '<div class="mt"><label class="sm"><b>Nội dung cần truyền đạt</b></label>' +
      '<textarea id="ktNoiDung" class="inp" rows="4" maxlength="4000" ' +
      'placeholder="Máy đọc chỗ này để soi Tầng. Viết đủ thì cổng Tầng làm được việc.">' +
      h(sanChu) + '</textarea></div>' +

      '<div class="mt"><label class="sm"><b>Bố cục</b> <span class="muted">(không bắt buộc)</span></label>' +
      '<input id="ktBoCuc" class="inp" maxlength="200"></div>' +
      '<div class="mt"><label class="sm"><b>Đặt ở đâu trên giao diện</b> ' +
      '<span class="muted">(không bắt buộc)</span></label>' +
      '<input id="ktViTri" class="inp" maxlength="200" value="' + h(sanViTri) +
      '" placeholder="ví dụ: trang chặng T1 › phần 2"></div>' +

      '<div class="row mt2" style="gap:8px">' +
      '<button class="btn primary" onclick="G.ktGuiDeXuat()">Đề xuất</button></div>' +
      '</div>';

    if (G.ktDap) {
      var r = G.ktDap;
      o += r.ok
        ? '<div class="card" style="border-left:3px solid var(--ok);margin-top:14px">' +
          '<b>Đã qua cổng Tầng · ' + h(r.id) + '</b>' +
          '<p class="sm muted mt">' + h(r.soatTang || '') + '</p>' +
          /* Máy cho qua nhưng thấy chỗ đáng ngờ thì phải NÓI RA ngay ở
             đây, chứ không chỉ giấu trong đề bài. Người đề xuất đang
             nhìn màn này, và sửa lúc này rẻ hơn sửa sau khi đã vẽ. */
          ((r.luuY || []).length
            ? '<div class="mt" style="border-left:3px solid var(--warn);padding-left:10px">' +
              '<b class="sm">Máy không chặn, nhưng người duyệt đọc lại</b>' +
              r.luuY.map(function (x) {
                return '<p class="sm muted mt">' + h(x) + '</p>'; }).join('') + '</div>'
            : '') +
          '<pre class="sm mt" style="white-space:pre-wrap;background:var(--phu-2);' +
          'padding:12px;border-radius:10px;overflow-x:auto">' + h(r.deBai || '') + '</pre>' +
          '</div>'
        : '<div class="card" style="border-left:3px solid var(--bad);margin-top:14px">' +
          '<b>' + h(r.chan ? 'CỔNG TẦNG CHẶN LẠI' : 'Chưa đề xuất được') + '</b>' +
          '<p class="sm mt">' + h(r.error || '') + '</p>' +
          ((r.phamPhai || []).length
            ? '<p class="sm mt"><b>Phạm:</b> ' + h(r.phamPhai.join(' · ')) + '</p>'
            : '') +
          /* Cổng Điều Nhỏ chặn thì hiện KHUÔN BỐN CÂU, không hiện một
             dòng báo đỏ. Một cổng chỉ nói "thiếu trường bắt buộc" thì
             người ta điền cho qua cổng; nói lại điều mình ĐÃ hiểu trước
             khi hỏi thì câu trả lời sau đó là câu thật. */
          (r.khuon4
            ? '<div class="mt" style="border-top:1px solid var(--line);padding-top:12px">' +
              '<p class="sm">' + h(r.khuon4.lang) + ' ' + h(r.khuon4.daHieu) + '</p>' +
              '<ul class="sm mt" style="padding-left:18px;line-height:1.7">' +
              r.khuon4.hoiRo.map(function (c) { return '<li>' + h(c) + '</li>'; }).join('') +
              '</ul>' +
              '<p class="sm mt" style="color:var(--teal)">' + h(r.khuon4.buocTiep) + '</p>' +
              '</div>'
            : '') + '</div>';
    }
    return o;
  }

  G.ktGuiDeXuat = function () {
    var nx = [];
    if (typeof document !== 'undefined')
      Array.prototype.forEach.call(document.querySelectorAll('.ktNX'), function (e) {
        if (e.checked) nx.push(e.value);
      });
    G.goiMayChu('deXuatThiGiac', {deXuat: {
      tang: oGiaTri('ktTang'), loaiHinh: oGiaTri('ktLoai'),
      nhiemVu: oGiaTri('ktNhiemVu'), noiDung: oGiaTri('ktNoiDung'),
      dieuNho: oGiaTri('ktDieuNho'), thoiDiem: oGiaTri('ktThoiDiem'),
      boCuc: oGiaTri('ktBoCuc'), viTri: oGiaTri('ktViTri'), nguoiXem: nx
    }}).then(function (d) {
      G.ktDap = d;
      U.toast(d.ok ? 'Đã vào sổ ở bậc ĐỀ XUẤT' : (d.error || 'Chưa đề xuất được'),
        d.ok ? 'ok' : 'err');
      if (d.ok) G.ktNap(); else veLai();
    });
  };

  /* ═══════════ NGĂN 2 · KHO ═══════════ */
  function nganKho() {
    var d = G.ktDuLieu.kho;
    if (!d) return U.empty('Đang mở kho', 'Chờ máy chủ trả lời.', true);
    if (!d.ok) return U.empty('Chưa mở được kho', d.error || '', true);
    if (!d.ds.length)
      return U.empty('Kho còn trống',
        'Chưa có đề xuất nào. Sang ngăn "Đề xuất" để bắt đầu.', true);

    var o = '<div class="row" style="gap:8px;flex-wrap:wrap">' +
      Object.keys(d.dem).map(function (k) {
        return U.chip((TEN_BAC[k] || k) + ': ' + d.dem[k], MAU_BAC[k] || 'var(--ink-3)', true);
      }).join('') + '</div>';

    o += U.sec('Mọi đề xuất', d.vi || '');
    o += d.ds.map(function (x) {
      var mau = MAU_BAC[x.trangThai] || 'var(--ink-3)';
      return '<div class="card" style="border-left:3px solid ' + mau + ';margin-bottom:10px">' +
        '<div class="row" style="gap:8px;flex-wrap:wrap;align-items:center">' +
          U.chip(TEN_BAC[x.trangThai] || x.trangThai, mau, true) +
          U.chip(x.tang, 'var(--teal)') +
          (x.ban > 1 ? U.chip('bản ' + x.ban, 'var(--warn)', true) : '') +
          (x.diem !== null && x.diem !== undefined
            ? U.chip(x.diem + ' · ' + (x.bacDiem || ''), 'var(--gold)', true) : '') +
        '</div>' +
        '<b style="display:block;margin-top:8px">' + h(x.nhiemVu) + '</b>' +
        '<p class="tiny muted mt">' + h(x.loaiHinh + ' · ' + x.nguoiXem.join(', ') +
          ' · ' + x.nguoiDe + ' · ' + String(x.deLuc).slice(0, 16).replace('T', ' ')) +
          (x.banTruoc ? h(' · sửa từ ' + x.banTruoc) : '') + '</p>' +
        (x.lyDo ? '<p class="sm mt"><b>Lý do:</b> ' + h(x.lyDo) + '</p>' : '') +
        (x.viTri ? '<p class="sm muted mt">Đặt tại: ' + h(x.viTri) + '</p>' : '') +
        '<div class="row" style="gap:8px;flex-wrap:wrap;margin-top:10px">' +
        (x.keTiep || []).map(function (b) {
          var canChu = (b === 'duyet' || b === 'phatHanh');
          if (canChu && !laChuHe())
            return '<span class="sm muted">' + h(TEN_BAC[b] || b) + ': chờ Super Admin</span>';
          return '<button class="btn' + (b === 'tuChoi' ? '' : ' primary') + '" ' +
            'onclick="G.ktMoChuyenBac(\'' + h(x.id) + '\',\'' + h(b) + '\')">' +
            h(TEN_BAC[b] || b) + '</button>';
        }).join('') +
        '<button class="btn" onclick="G.ktMoCham(\'' + h(x.id) + '\')">Chấm điểm</button>' +
        '<button class="btn" onclick="G.ktVe(\'' + h(x.id) + '\')">Vẽ thử</button>' +
        (x.trangThai === 'duyet' || x.trangThai === 'phatHanh'
          ? '<button class="btn" onclick="G.ktBanMoi(\'' + h(x.id) + '\')">Sửa → bản mới</button>'
          : '') +
        '</div></div>';
    }).join('');
    return o;
  }

  G.ktMoChuyenBac = function (id, den) {
    if (den !== 'tuChoi') {
      G.goiMayChu('chuyenBacThiGiac', {id: id, den: den}).then(function (d) {
        U.toast(d.ok ? d.vi : (d.error || 'Không đi được'), d.ok ? 'ok' : 'err');
        if (d.ok) G.ktNap();
      });
      return;
    }
    U.modal('<h3>Từ chối đề xuất này</h3>' +
      '<p class="sm muted mt">Nói vì sao. Không nói thì lần sau máy đề xuất y hệt, ' +
      'và câu từ chối ấy phải nói lại mãi.</p>' +
      '<textarea id="ktLyDo" class="inp mt2" rows="3" maxlength="500"></textarea>' +
      '<div class="row mt2" style="gap:8px">' +
      '<button class="btn primary" onclick="G.ktGuiTuChoi(\'' + h(id) + '\')">Từ chối</button>' +
      '<button class="btn" onclick="U.closeModal()">Thôi</button></div>');
  };
  G.ktGuiTuChoi = function (id) {
    G.goiMayChu('chuyenBacThiGiac', {id: id, den: 'tuChoi', lyDo: oGiaTri('ktLyDo')})
      .then(function (d) {
        if (!d.ok) return U.toast(d.error || 'Chưa từ chối được', 'err');
        U.closeModal(); U.toast('Đã từ chối'); G.ktNap();
      });
  };
  G.ktBanMoi = function (id) {
    G.goiMayChu('banMoiThiGiac', {id: id, deXuat: {}}).then(function (d) {
      U.toast(d.ok ? d.vi : (d.error || 'Chưa tạo được bản mới'), d.ok ? 'ok' : 'err');
      if (d.ok) G.ktNap();
    });
  };

  /* ═══════════ VẼ THỬ — BỘ VẼ NẰM TRONG MÁY ═══════════
     Ảnh dựng ngay trong trình duyệt đã đăng nhập, từ chính bản ghi đã
     qua cổng. Không một lượt hỏi mạng nào trong cả lượt vẽ, nên không
     có cửa nào để rò. Xem src/ve-thi-giac.js.

     Loại hình chưa có bộ vẽ thì hộp này nói CHƯA CÓ và nói luôn đã vẽ
     được những loại nào — nói "không vẽ được" mà không nói vẽ được gì
     thì người dùng thử mò từng loại. */
  /* Bộ vẽ TỪ CHỐI khi phông thương hiệu chưa tải — mọi phép ngắt dòng
     của nó đo bằng phông đang có, nên đo bằng phông dự phòng rồi vẽ
     bằng phông thật là chữ tràn lề. Nên chờ ở ĐÂY, một lần, thay vì
     để người bấm nhận một lời từ chối họ không làm gì được. */
  G.ktVe = function (id, kho) {
    if (typeof document !== 'undefined' && document.fonts && document.fonts.ready &&
        !G._ktChuXong) {
      document.fonts.ready.then(function () {
        G._ktChuXong = 1; G.ktVe(id, kho);
      });
      return;
    }
    var d = G.ktDuLieu.kho;
    var x = ((d && d.ds) || []).filter(function (y) { return y.id === id; })[0];
    if (!x) return U.toast('Không tìm thấy bản ghi này trong sổ.', 'err');

    /* ── ẢNH CỬA MANG VỀ PHẢI TỚI ĐƯỢC BỘ VẼ (9.99.38) ──
       Cửa đi ra cất ảnh vào kho R2 và ghi khoá tệp `tg/DR-….png` vào
       cột anhNguoi. Khoá tệp KHÔNG phải một đường dẫn trình duyệt mở
       được — nó là một chỗ trong kho, và kho ấy chỉ máy chủ chạm tới.

       Nên trước khi vẽ, xin ảnh về bằng cửa docAnhThiGiac rồi thay
       khoá tệp bằng chuỗi data. Không có nhịp này thì cả vòng đi–về
       chạy đúng tới bước cuối rồi bộ vẽ nhận một chuỗi nó không mở
       được — và tấm ra vẫn là Ô CHỜ, trong khi mọi phép đo đều xanh.
       Chỗ hỏng nằm ở MỐI NỐI, đúng như mọi lần trước. */
    if (x.anhNguoi && /^tg\//.test(String(x.anhNguoi)) && !x._anhData &&
        G.goiMayChu) {
      G.goiMayChu('docAnhThiGiac', {id: x.id}).then(function (a) {
        if (a && a.ok && a.anh) { x._anhData = a.anh; G.ktVe(id, kho); }
        else U.toast('Không lấy được ảnh lớp người: ' +
          ((a && a.error) || 'không rõ'), 'err');
      });
      return;
    }
    var biet = G.veThiGiacBiet ? G.veThiGiacBiet() : {kho: []};
    /* Bộ vẽ đọc `anhNguoi` — đưa nó chuỗi data, giữ nguyên bản ghi
       gốc để không ghi đè thứ sổ đang giữ. */
    var xVe = x._anhData
      ? Object.assign({}, x, {anhNguoi: x._anhData}) : x;
    var r = G.veThiGiac(xVe, kho);
    U.modal('<h3>Vẽ thử · ' + h(x.loaiHinh) + '</h3>' +
      (r.ok
        ? '<p class="sm muted mt">' + h(r.kho + ' · ' + r.vi) + '</p>' +
          '<div class="mt" style="border:1px solid var(--vien-1);border-radius:12px;' +
          'overflow:hidden;line-height:0">' + r.svg + '</div>' +
          '<div class="row mt2" style="gap:8px;flex-wrap:wrap">' +
          biet.kho.map(function (m) {
            return '<button class="btn" onclick="G.ktVe(\'' + h(x.id) + '\',\'' +
              h(m.ma) + '\')">' + h(m.ten) + '</button>'; }).join('') + '</div>'
        : '<div class="card mt" style="border-left:3px solid var(--bad)">' +
          '<p class="sm">' + h(r.error) + '</p></div>') +
      '<div class="row mt2" style="gap:8px">' +
      '<button class="btn" onclick="U.closeModal()">Đóng</button></div>');
  };

  G.ktMoCham = function (id) {
    var muc = G.TG_DIEM || [];
    U.modal('<h3>Chấm thang điểm 100</h3>' +
      '<p class="sm muted mt">Đúng hệ thống nặng 25, thẩm mỹ 10. Một tấm rất đẹp mà ' +
      'sai Tầng thì tệ hơn một tấm xấu mà đúng — tấm đẹp được tin, và cái sai đi ' +
      'theo nó xa hơn.</p>' +
      muc.map(function (m) {
        return '<div class="mt"><label class="sm"><b>' + h(m.ten) + '</b> ' +
          '<span class="muted">trọng số ' + h(String(m.trong)) + ' · ' + h(m.hoi) +
          '</span></label>' +
          '<input id="ktD_' + h(m.ma) + '" class="inp" type="number" min="0" max="100" ' +
          'value="100"></div>';
      }).join('') +
      '<div class="row mt2" style="gap:8px">' +
      '<button class="btn primary" onclick="G.ktGuiCham(\'' + h(id) + '\')">Chấm</button>' +
      '<button class="btn" onclick="U.closeModal()">Thôi</button></div>');
  };
  G.ktGuiCham = function (id) {
    var cham = {};
    (G.TG_DIEM || []).forEach(function (m) {
      cham[m.ma] = Number(oGiaTri('ktD_' + m.ma) || 0);
    });
    G.goiMayChu('chamThiGiac', {id: id, cham: cham}).then(function (d) {
      if (!d.ok) return U.toast(d.error || 'Chưa chấm được', 'err');
      U.closeModal(); U.toast(d.diem + ' điểm · ' + d.bac); G.ktNap();
    });
  };

  /* ═══════════ NGĂN 3 · HIẾN PHÁP ═══════════ */
  function nganHienPhap() {
    if (!(G.TG_TANG || []).length)
      return U.empty('Hiến pháp thị giác chưa mở',
        'Kho nghề chưa nạp. Đăng nhập bằng vai có quyền nghề.', true);

    var o = '<div class="card"><p class="sm">' + h((G.TG_LUAT_GOC || {}).cot || '') +
      '</p><p class="sm muted mt">' + h((G.TG_LUAT_GOC || {}).vi || '') + '</p></div>';

    o += U.sec('Ranh giới từng chặng',
      'Ranh giới THẬT nằm ở bảng chặng — ô "gồm" và ô "không". Chỗ này chỉ thêm ' +
      'lớp thị giác: chặng ấy hứa được gì bằng hình.');
    o += U.tbl(['Chặng', 'Hình được hứa', 'Hình KHÔNG được hứa', 'Mật độ'],
      G.TG_TANG.map(function (t) {
        var hpt = (G.HP_TANG || []).filter(function (y) { return y.tang === t.tang; })[0];
        return ['<b>' + h(t.tang) + '</b><div class="tiny muted">' +
            h(((hpt && hpt.ten) || '').slice(0, 40)) + '</div>',
          h(t.hinhDuocHua),
          '<span style="color:var(--bad)">' + h(t.hinhKhongDuocHua) + '</span>',
          '<span class="sm muted">' + h(t.matDo) + '</span>'];
      }));

    o += U.sec('Mười hai loại hình — mỗi loại một nhiệm vụ');
    o += U.tbl(['Loại', 'Nhiệm vụ', 'Hợp chặng'],
      (G.TG_LOAIHINH || []).map(function (x) {
        return [h(x.ten), h(x.nhiemVu),
          '<span class="sm muted">' + h((x.hop || []).join(' ')) + '</span>'];
      }));

    o += U.sec('Mười điều cấm');
    o += '<div class="card"><ol class="sm">' + (G.TG_CAM || []).map(function (x) {
      return '<li>' + h(x.luat) + '</li>'; }).join('') + '</ol></div>';

    o += U.sec('Chỗ máy dừng lại',
      'Cùng luật với L-01 của bảng lương: máy làm phần của máy và nói thẳng phần ' +
      'nó không làm được.');
    o += (G.TG_CHOCHU || []).map(function (x) {
      return '<div class="card" style="border-left:3px solid var(--warn);margin-bottom:10px">' +
        '<b>' + h(x.ma + ' · ' + x.viec) + '</b>' +
        '<p class="sm muted mt">' + h(x.vi) + '</p></div>';
    }).join('');
    return o;
  }

  /* ═══════════ NGĂN 4 · SỔ LUẬT THƯƠNG HIỆU ═══════════ */
  function nganLuat() {
    var d = G.ktDuLieu.kho;
    var o = '<div class="card"><b>Đây là chỗ máy HỌC từ chủ hệ</b>' +
      '<p class="sm muted mt">Chủ hệ từ chối một hướng và nói vì sao; câu ấy ở lại, ' +
      'và mọi đề xuất sau đọc nó trước. Không có sổ này thì mỗi lượt thiết kế bắt ' +
      'đầu lại từ số không, và chủ hệ phải nói lại cùng một câu tới lần thứ mười ' +
      'thì thôi dùng.</p>' +
      (laChuHe()
        ? '<div class="row mt" style="gap:8px"><button class="btn primary" ' +
          'onclick="G.ktMoGhiLuat()">Ghi một luật</button></div>'
        : '<p class="tiny muted mt">Chỉ Super Admin ghi được.</p>') + '</div>';

    var ds = (d && d.ok && d.luatThuongHieu) || [];
    if (!ds.length)
      return o + U.empty('Sổ luật còn trống',
        'Chưa có quyết định thương hiệu nào được ghi.', true);

    o += U.sec('Luật đang có hiệu lực');
    o += ds.map(function (x) {
      return '<div class="card" style="margin-bottom:10px">' +
        U.chip(x.nhom, 'var(--teal)') +
        (x.hieuLuc === 'vinhVien' ? U.chip('vĩnh viễn', 'var(--gita)', true) : '') +
        '<b style="display:block;margin-top:8px">' + h(x.luat) + '</b>' +
        '<p class="sm muted mt">' + h(x.vi) + '</p>' +
        '<p class="tiny muted mt">' + h(x.boiAi + ' · ' +
          String(x.ghiLuc).slice(0, 10)) + '</p></div>';
    }).join('');
    return o;
  }

  G.ktMoGhiLuat = function () {
    U.modal('<h3>Ghi một luật thương hiệu</h3>' +
      '<p class="sm muted mt">Luật phải kèm LÝ DO. Không có lý do thì sáu tháng sau ' +
      'người ta gỡ nó ra, vì không ai biết gỡ thì hỏng gì.</p>' +
      '<div class="mt2"><label class="sm"><b>Nhóm</b></label>' +
      '<select id="ktLNhom" class="inp">' +
      '<option value="mau">Màu</option><option value="chu">Chữ</option>' +
      '<option value="bocuc">Bố cục</option><option value="giong">Giọng</option>' +
      '<option value="anh">Ảnh</option><option value="khac">Khác</option></select></div>' +
      '<div class="mt"><label class="sm"><b>Luật</b></label>' +
      '<input id="ktLLuat" class="inp" maxlength="500"></div>' +
      '<div class="mt"><label class="sm"><b>Vì sao</b></label>' +
      '<textarea id="ktLVi" class="inp" rows="3" maxlength="800"></textarea></div>' +
      '<div class="row mt2" style="gap:8px">' +
      '<button class="btn primary" onclick="G.ktGuiLuat()">Ghi</button>' +
      '<button class="btn" onclick="U.closeModal()">Thôi</button></div>');
  };
  G.ktGuiLuat = function () {
    G.goiMayChu('ghiLuatThuongHieu', {luat: {
      nhom: oGiaTri('ktLNhom'), luat: oGiaTri('ktLLuat'), vi: oGiaTri('ktLVi')
    }}).then(function (d) {
      if (!d.ok) return U.toast(d.error || 'Chưa ghi được', 'err');
      U.closeModal(); U.toast('Đã ghi — mọi đề xuất sau đọc luật này trước'); G.ktNap();
    });
  };

  /* ═══════════ MÀN CHÍNH ═══════════ */
  G.VIEWS['kien-truc-thi-giac'] = function () {
    if (!G.ktDuLieu.daGoi) { G.ktDuLieu.daGoi = true; G.ktNap(); }

    var o = U.ph({
      t: 'Kiến trúc sư thị giác',
      s: 'Hiểu hệ thống trước — hiểu nội dung — hiểu người dùng — rồi mới thiết kế.'
    });
    o += thanhNgan();

    if (G.ktNgan === 'docman')   return o + nganDocMan();
    if (G.ktNgan === 'tailieu')  return o + nganTaiLieu();
    if (G.ktNgan === 'ytuong')   return o + nganYTuong();
    if (G.ktNgan === 'dexuat')   return o + nganDeXuat();
    if (G.ktNgan === 'gopy')     return o + nganGopY();
    if (G.ktNgan === 'dang')     return o + nganDang();
    if (G.ktNgan === 'phieu')    return o + nganPheu();
    if (G.ktNgan === 'ungpho')   return o + nganUngPho();
    if (G.ktNgan === 'kho')      return o + nganKho();
    if (G.ktNgan === 'hienphap') return o + nganHienPhap();
    return o + nganLuat();
  };
})();
