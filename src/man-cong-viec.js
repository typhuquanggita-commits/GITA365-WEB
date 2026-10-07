/* ═══════════════════════════════════════════════════════════════
   GITA 365 — BA MÀN HÌNH CỦA BẢNG CÔNG VIỆC

     bang-viec       bảng tiến trình bốn cột + chốt ngày
     danh-muc-viec   danh mục đầu việc, tích chọn để nhận
     kpi-toi         KPI ngày · KPI tháng · phần liên đới · hạng

   Máy chấm ở src/cong-viec.js. Tệp này chỉ vẽ.

   Một quyết định về thứ tự: cột TRỄ HẠN đứng ĐẦU TIÊN, không đứng cuối
   theo dòng thời gian. Bảng công việc mở ra mỗi sáng để trả lời câu
   "hôm nay chữa cháy ở đâu", và cột trễ là câu trả lời. Đặt nó cuối
   bảng là bắt người dùng cuộn qua ba cột yên ổn mới thấy chỗ đang cháy.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;
G.VIEWS = G.VIEWS || {};

(function () {
  var U = G.U, h = U.h, ic = U.ic;

  function trangCua(ma) {
    var ds = G.CV_TRANG || [];
    for (var i = 0; i < ds.length; i++) if (ds[i].ma === ma) return ds[i];
    return { ma: ma, ten: ma, c: 'var(--ink-4)', ic: 'dot' };
  }
  function tenVai(id) {
    var r = G.roleById && G.roleById(id);
    return r ? r.n : id;
  }
  function conLai(v) {
    var ms = v.hanLuc - Date.now();
    var gio = Math.round(Math.abs(ms) / 3600000);
    if (ms >= 0) return gio >= 48 ? ('còn ' + Math.round(gio / 24) + ' ngày') : ('còn ' + gio + ' giờ');
    return gio >= 48 ? ('trễ ' + Math.round(gio / 24) + ' ngày') : ('trễ ' + gio + ' giờ');
  }

  /* ═══════════ BẢNG TIẾN TRÌNH ═══════════ */
  G.VIEWS['bang-viec'] = function () {
    if (!G.cvDanhMuc().length) return U.empty('Chưa mở được bảng công việc',
      'Danh mục đầu việc đi theo gói cấp phép của vị trí. Đăng nhập lại để nạp.');

    var bo = G.cvTheoTrang();
    var homNay = G.cvNgay(Date.now());
    var k = G.cvKpiNgay(homNay);
    var daChot = G.cvDaChot(homNay);
    var lienDoi = G.cvLienDoi();

    var o = U.ph({ eyebrow: 'BẢNG CÔNG VIỆC', ic: 'pulse', grad: 1,
      t: 'Việc của tôi — bốn cột, một tuần phải sạch',
      lead: 'Mỗi việc có hạn tính từ lúc NHẬN, không từ lúc bắt đầu. Đóng việc phải kèm bằng chứng — ' +
        'không có bằng chứng thì việc vẫn nằm ở cột đang làm, dù mình nói đã xong. ' +
        'Cuối ngày bấm chốt là điểm của ngày ấy vào KPI tháng.' });

    o += '<div class="grid g4 mb">' +
      U.stat({ k: 'Trễ hạn', v: String(bo.tre.length), d: bo.tre.length ? 'xử lý trước mọi việc khác' : 'không việc nào quá hạn', c: '#BE0E16' }) +
      U.stat({ k: 'Đang làm', v: String(bo.dang.length), d: bo.dang.length > 3 ? 'quá ba — đang làm dở nhiều thứ' : 'trong ngưỡng ba việc', c: '#B4720F' }) +
      U.stat({ k: 'Mới nhận', v: String(bo.moi.length), d: 'chưa động đến', c: '#185AB4' }) +
      U.stat({ k: 'KPI hôm nay', v: k.tinh ? k.pt + '%' : '—', d: k.tinh ? (k.tuSo + '/' + k.mauSo + ' điểm' + (k.tru ? ' · trừ ' + k.tru : '')) : 'không có việc đến hạn', c: '#0B7350' }) +
      '</div>';

    /* Chốt ngày */
    o += '<div class="card mb" style="border-color:' + (daChot ? '#0B735044' : 'var(--gita-vien-2)') + '">' +
      '<div class="row wrap" style="gap:14px;align-items:center">' +
      '<div class="grow" style="min-width:250px">' +
      '<b class="sm" style="display:block;margin-bottom:5px">' +
      (daChot ? 'Ngày ' + h(homNay) + ' đã chốt — ' + G.S.chotNgay[homNay].pt + '%'
              : 'Chốt ngày ' + h(homNay)) + '</b>' +
      '<p class="tiny" style="line-height:1.7;color:var(--ink-2)">' +
      (daChot
        ? 'Đã vào KPI tháng và không sửa được nữa. Sửa được thì KPI không còn nghĩa gì — số nào cũng chỉnh lại được vào cuối tháng.'
        : (k.tinh
          ? 'Hôm nay có ' + k.mauSo + ' điểm đến hạn, đã đóng ' + k.tuSo + '.' +
            (k.tru ? ' Trừ ' + k.tru + ' điểm do trễ hạn.' : '') +
            ' Chốt rồi thì không sửa được nữa.'
          : 'Hôm nay không có việc nào đến hạn, nên không có gì để chốt — và ngày này KHÔNG tính vào trung bình tháng. ' +
            'Đưa 0% vào trung bình là phạt mình vì hệ thống không giao việc.')) + '</p></div>' +
      (daChot || !k.tinh ? '' :
        '<button class="btn pri" data-cvchot="1">' + ic('check') + 'Chốt ngày hôm nay</button>') +
      '</div></div>';

    /* HAI DẠNG XEM — Bảng chi tiết (CRM) mặc định · Dạng cột (kanban cũ).
       Chọn bằng ô radio ẩn (CSS thuần), không thêm trạng thái, không sửa
       app.js. Radio và hai panel là anh em cùng cấp để bộ chọn ~ chạy. */
    o += '<input type="radio" name="cvDang" id="cvDang-bang" class="cvt-radio" checked>' +
      '<input type="radio" name="cvDang" id="cvDang-cot" class="cvt-radio">' +
      '<div class="cvt-seg">' +
        '<label for="cvDang-bang">' + ic('grid', 'w-4 h-4') + ' Bảng chi tiết</label>' +
        '<label for="cvDang-cot">' + ic('list', 'w-4 h-4') + ' Dạng cột</label>' +
      '</div>';
    o += '<div class="cvt-panel" id="cvt-p-bang">' + veBangChiTiet() + '</div>';
    o += '<div class="cvt-panel" id="cvt-p-cot">' + veCot(bo) + '</div>';

    /* Liên đới */
    if (lienDoi.length) {
      o += U.sec('TRÁCH NHIỆM LIÊN ĐỚI · ' + lienDoi.length + ' VIỆC',
        'Việc đã rời tay mình nhưng mình vẫn dính phần. Hiện riêng, không gộp vào phần việc của chính mình — ' +
        'gộp vào thì không ai hiểu vì sao KPI tụt.');
      o += '<div class="card">' + lienDoi.map(function (x) {
        var tr = trangCua(x.trang);
        return '<div style="padding:11px 0;border-bottom:1px solid var(--line)">' +
          '<div class="row wrap mb" style="gap:7px">' + U.chip(x.ma) + U.chip(tr.ten, tr.c) +
          '<span class="tiny muted">đang ở: ' + h(tenVai(x.dangO)) + '</span>' +
          (x.so ? '<span class="chip" style="color:' + (x.so > 0 ? '#0B7350' : '#BE0E16') + '">' +
            (x.so > 0 ? '+' : '') + x.so + ' điểm</span>' : '') + '</div>' +
          '<b class="sm" style="display:block;margin-bottom:4px">' + h(x.ten) + '</b>' +
          '<p class="tiny" style="line-height:1.65;color:var(--ink-3)">' + h(x.luat) + '</p></div>';
      }).join('') + '</div>';
    }

    o += '<div class="row wrap mt2" style="gap:8px">' +
      '<button class="btn ghost sm" data-v="danh-muc-viec">' + ic('plus') + 'Nhận thêm đầu việc</button>' +
      '<button class="btn ghost sm" data-v="kpi-toi">' + ic('chart') + 'KPI của tôi</button></div>';
    return o;
  };

  function the(v, t, tr) {
    var m = G.cvMuc(v.ma) || {};
    var muon = v.xongLuc && v.xongLuc > v.hanLuc;
    var o = '<div class="card pad-sm mb" style="border-color:' + tr.c + '22">' +
      '<div class="row wrap mb" style="gap:6px">' + U.chip(v.ma, tr.c) +
      '<span class="tiny muted">' + h(m.ten || '') + '</span></div>' +
      '<div class="row wrap mb" style="gap:6px">' +
      '<span class="tiny" style="color:' + (t === 'tre' ? '#BE0E16' : 'var(--ink-3)') + '">' +
      (t === 'xong' ? ('đóng ' + (muon ? 'MUỘN' : 'đúng hạn')) : h(conLai(v))) + '</span>' +
      '<span class="tiny muted">· ' + (m.diem || 0) + ' điểm</span>' +
      (v.giaoTu ? '<span class="tiny muted">· nhận từ ' + h(tenVai(v.giaoTu)) + '</span>' : '') +
      '</div>';

    if (t === 'xong') {
      o += '<p class="tiny" style="line-height:1.6;color:var(--ink-3);padding:7px 9px;border-radius:9px;' +
        'background:var(--phu-2)">' + h(v.bangChung) + '</p>';
    } else {
      o += '<p class="tiny muted mb" style="line-height:1.6"><b>Đóng khi:</b> ' + h(m.xong || '') + '</p>' +
        '<div class="row wrap" style="gap:6px">' +
        (t === 'moi' ? '<button class="btn ghost sm" data-cvbatdau="' + h(v.id) + '">Bắt đầu</button>' : '') +
        '<button class="btn ' + (t === 'tre' ? 'pri' : 'ghost') + ' sm" data-cvxong="' + h(v.id) + '">Đóng kèm bằng chứng</button>' +
        (m.chuyen ? '<button class="btn ghost sm" data-cvchuyen="' + h(v.id) + '">Chuyển cho ' + h(tenVai(m.chuyen)) + '</button>' : '') +
        '<button class="btn ghost sm" data-cvduong="' + h(v.id) + '">Đường đi</button></div>';
    }
    return o + '</div>';
  }

  /* ═══════════ DẠNG CỘT (kanban cũ, tách ra để dùng lại) ═══════════ */
  function veCot(bo) {
    var thuTu = ['tre', 'dang', 'moi', 'xong'];
    return '<div class="grid g2">' + thuTu.map(function (t) {
      var tr = trangCua(t), ds = bo[t];
      return '<div class="card mb" style="border-color:' + tr.c + '2e">' +
        '<div class="row wrap mb" style="gap:8px;align-items:center">' +
        '<span style="color:' + tr.c + ';flex:none">' + ic(tr.ic, 'w-4 h-4') + '</span>' +
        '<b style="color:' + tr.c + ';font-size:16px">' + h(tr.ten) + '</b>' +
        '<span class="chip" style="color:' + tr.c + ';border-color:' + tr.c + '40">' + ds.length + '</span></div>' +
        '<p class="tiny muted mb" style="line-height:1.6">' + h(tr.y) + '</p>' +
        (ds.length ? ds.map(function (v) { return the(v, t, tr); }).join('')
          : '<p class="tiny" style="color:var(--ink-4);padding:8px 0">Không có việc nào ở cột này.</p>') +
        '</div>';
    }).join('') + '</div>';
  }

  /* ═══════════ BẢNG CHI TIẾT KIỂU CRM ═══════════
     Mỗi đầu việc của vai đang đăng nhập là MỘT DÒNG. Cột theo yêu cầu:
     STT · Đầu mục · Nội dung · Quy trình · Tiến độ · Báo cáo · KPI ·
     Sáng kiến · Trợ lý GITA. Đọc dữ liệu sống (cvMucCuaToi + sổ việc),
     mọi nút tái dùng handler cũ (data-cvnhan/batdau/xong/chuyen/duong).
     Chỉ hiện cho vai CÓ đầu việc — gia đình không vào đây. */

  /* Bản ghi để hiện cho một đầu mục: ưu tiên bản đang mở, không thì bản mới nhất. */
  function recCua(ma) {
    var s = G.cvSo() || {}, mo = null, moi = null;
    for (var k in s) {
      if (s[k].ma !== ma) continue;
      if (!s[k].xongLuc && !mo) mo = s[k];
      if (!moi || s[k].nhanLuc > moi.nhanLuc) moi = s[k];
    }
    return mo || moi;
  }
  function trangKey(v) {
    if (!v) return 'chua';
    if (v.xongLuc) return 'xong';
    if (v.hanLuc < Date.now()) return 'tre';
    if (v.batDauLuc) return 'dang';
    return 'moi';
  }
  function trangGon(tk) {
    if (tk === 'chua') return { ten: 'Chưa nhận', c: 'var(--ink-4)', ic: 'dot' };
    return trangCua(tk);
  }
  /* Gợi ý ngắn của Trợ lý GITA theo trạng thái — một câu, dẫn việc. */
  function troLyGoi(tk, m) {
    if (tk === 'tre') return 'Trễ hạn — ưu tiên đóng ngay kèm bằng chứng trước mọi việc khác.';
    if (tk === 'dang') return 'Đang làm — gom đúng bằng chứng cho "' + (m.xong ? 'điều kiện đóng' : 'việc này') + '" để đóng gọn.';
    if (tk === 'moi') return 'Mới nhận — bấm Bắt đầu để đồng hồ minh bạch, rồi làm theo quy trình.';
    if (tk === 'xong') return 'Đã đóng — ghi một sáng kiến để lần sau nhanh hơn.';
    return 'Nhận việc này khi tới nhịp; Trợ lý sẽ dẫn từng bước.';
  }

  function oHanhDong(tk, v, m) {
    if (tk === 'chua') return '<button class="btn pri sm cvt-act" data-cvnhan="' + h(m.ma) + '">Nhận</button>';
    if (tk === 'xong') return '<span class="tiny" style="color:#0B7350;font-weight:700">✓ đã đóng</span>';
    var b = '';
    if (tk === 'moi') b += '<button class="btn ghost sm cvt-act" data-cvbatdau="' + h(v.id) + '">Bắt đầu</button>';
    b += '<button class="btn ' + (tk === 'tre' ? 'pri' : 'ghost') + ' sm cvt-act" data-cvxong="' + h(v.id) + '">Đóng</button>';
    if (m.chuyen) b += '<button class="btn ghost sm cvt-act" data-cvchuyen="' + h(v.id) + '">Chuyển</button>';
    b += '<button class="btn ghost sm cvt-act" data-cvduong="' + h(v.id) + '">Đường đi</button>';
    return b;
  }

  /* ══ THUẬT TOÁN CÁC CỘT THÔNG MINH ══ */
  function nhipCuaMuc(m) { return (G.TG_NHIEMVU || []).filter(function (x) { return x.ma === m.nhip; })[0] || {}; }

  /* ƯU TIÊN — điểm gộp từ trạng thái + độ gấp của hạn + giá trị việc,
     rồi xếp bậc. Để nhân sự biết làm gì TRƯỚC, không bỏ sót việc gấp. */
  function uuTien(m, v, tk) {
    if (tk === 'xong') return { bac: 'XONG', c: '#0B7350', s: 0 };
    var s = 0;
    if (tk === 'tre') s += 100;
    else if (v && !v.xongLuc) { var con = (v.hanLuc - Date.now()) / 3600000; if (con <= 4) s += 60; else if (con <= 24) s += 30; }
    else if (tk === 'chua') { var nh = nhipCuaMuc(m); if (nh.han && nh.han <= 24) s += 25; }
    s += Math.min(40, (m.diem || 0) * 2);
    if (s >= 100) return { bac: 'KHẨN', c: '#BE0E16', s: s };
    if (s >= 50) return { bac: 'CAO', c: '#B4720F', s: s };
    if (s >= 20) return { bac: 'THƯỜNG', c: '#185AB4', s: s };
    return { bac: 'THẤP', c: 'var(--ink-4)', s: s };
  }

  /* NHIỆM VỤ CỤ THỂ — checklist thao tác chuẩn, để làm chuyên nghiệp và
     không bỏ sót bước nào. Bước cuối tự đổi theo có luân chuyển hay không. */
  function nhiemVuChecklist(m) {
    var b = ['Chuẩn bị: đọc rõ yêu cầu & hồ sơ liên quan', 'Thực hiện đúng nội dung công việc', 'Ghi bằng chứng: số liệu · mốc giờ · tên việc'];
    b.push(m.chuyen ? ('Bàn giao ' + tenVai(m.chuyen) + ' kèm ghi chú') : 'Đóng việc kèm bằng chứng');
    return '<ol class="cvt-nv">' + b.map(function (x) { return '<li>' + h(x) + '</li>'; }).join('') + '</ol>';
  }

  /* HẠN CHÓT — ngày giờ + đếm ngược, màu theo độ gấp. */
  function hanChot(m, v, tk) {
    if (tk === 'xong') return '<span class="tiny" style="color:#0B7350;font-weight:700">đã đóng</span>';
    if (v && v.hanLuc) {
      var d = new Date(v.hanLuc), con = (v.hanLuc - Date.now()) / 3600000;
      var c = con < 0 ? '#BE0E16' : (con <= 24 ? '#B4720F' : 'var(--ink-2)');
      var dt = ('0' + d.getDate()).slice(-2) + '/' + ('0' + (d.getMonth() + 1)).slice(-2) + ' ' + ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2);
      return '<b style="color:' + c + '">' + dt + '</b><div class="tiny ' + (con < 0 ? 'cvt-tre' : 'muted') + '" style="margin-top:2px">' + h(conLai(v)) + '</div>';
    }
    var nh = nhipCuaMuc(m);
    return '<span class="tiny muted">+' + (nh.han || 24) + 'h kể từ khi nhận</span>';
  }

  /* GIÁ TRỊ · TÁC ĐỘNG — vì sao việc này quan trọng, suy từ nhịp/điểm/
     luân chuyển. Cho nhân sự thấy việc mình nối vào kinh doanh & chăm
     sóc khách ở đâu — hiểu lý do thì làm tự giác hơn. */
  function giaTri(m) {
    var nh = nhipCuaMuc(m), han = nh.han || 24;
    if (m.chuyen) return { chip: 'VẬN HÀNH', c: '#5140B4', mo: 'Bàn giao sạch để giữ chất lượng dịch vụ.' };
    if (han <= 24) return { chip: 'CHĂM SÓC KH', c: '#0B7350', mo: 'Giữ chân & tăng hài lòng của nhà đang phục vụ.' };
    if ((m.diem || 0) >= 12) return { chip: 'KINH DOANH', c: '#BE0E16', mo: 'Đóng góp trực tiếp vào tăng trưởng & doanh thu.' };
    return { chip: 'CHUYÊN MÔN', c: '#185AB4', mo: 'Nâng chuẩn nghề của đội ngũ.' };
  }

  /* Chuỗi đóng đúng hạn gần nhất — đòn bẩy động lực tự giác. */
  function chuoiDungHan() {
    var s = G.cvSo() || {}, arr = []; for (var k in s) { if (s[k].xongLuc) arr.push(s[k]); }
    arr.sort(function (a, b) { return b.xongLuc - a.xongLuc; });
    var n = 0; for (var i = 0; i < arr.length; i++) { if (arr[i].xongLuc <= arr[i].hanLuc) n++; else break; }
    return n;
  }

  /* ĐỘNG LỰC · THƯỞNG — nối việc với phần thưởng cụ thể. */
  function dongLuc(m, v, tk) {
    if (tk === 'xong') {
      var ok = v && v.xongLuc <= v.hanLuc;
      return '<b style="color:' + (ok ? '#0B7350' : '#B4720F') + '">' + (ok ? '✓ +' + (m.diem || 0) + ' điểm' : '+' + (m.diem || 0) + ' điểm') + '</b>' +
        '<div class="tiny" style="color:' + (ok ? '#0B7350' : 'var(--ink-4)') + ';margin-top:2px">' + (ok ? 'đúng hạn — giữ chuỗi!' : 'trễ — lần sau đúng hạn') + '</div>';
    }
    return '<div class="tiny" style="line-height:1.5"><b style="color:#185AB4">Đóng đúng hạn → +' + (m.diem || 0) + ' điểm</b><br>vào KPI tháng & xếp hạng lương thưởng</div>';
  }

  function veBangChiTiet() {
    var ds = G.cvMucCuaToi();
    if (!ds.length) return '<div class="card center" style="padding:28px">' +
      '<b>Vị trí này chưa có đầu việc chuẩn</b>' +
      '<p class="sm muted mt">Danh mục mở cho tài khoản chưa gắn đầu việc nào cho vị trí đang đăng nhập.</p></div>';

    var COT = ['STT', 'Ưu tiên', 'Đầu mục', 'Nội dung công việc', 'Nhiệm vụ cụ thể', 'Quy trình', 'Hạn chót', 'Tiến độ', 'Báo cáo kết quả', 'KPI', 'Giá trị · Tác động', 'Động lực', 'Sáng kiến', 'Trợ lý GITA'];
    var MAU = ['var(--ink-4)', '#BE0E16', 'var(--gita-sau)', 'var(--ink)', '#0B6675', '#5140B4', '#B4720F', '#185AB4', '#0E7490', '#0B7350', '#9333EA', '#7A5BE0', 'var(--gita-ink)', 'var(--gita)'];
    var head = '<tr>' + COT.map(function (c, i) {
      return '<th style="--cc:' + MAU[i] + '">' + h(c) + '</th>';
    }).join('') + '</tr>';

    var body = ds.map(function (m, i) {
      var v = recCua(m.ma), tk = trangKey(v), tr = trangGon(tk);
      var nhip = nhipCuaMuc(m);
      var sk = ((G.S && G.S.cvSangKien) || {})[m.ma] || '';
      var muon = v && v.xongLuc && v.xongLuc > v.hanLuc;
      var ut = uuTien(m, v, tk), gt = giaTri(m);

      var cUt = '<span class="cvt-ut" style="--uc:' + ut.c + '">' + h(ut.bac) + '</span>';
      var cTien = '<span class="cvt-trang" style="--tc:' + tr.c + '">' + ic(tr.ic, 'w-3 h-3') + ' ' + h(tr.ten) + '</span>' +
        (tk === 'xong' ? '<div class="tiny" style="margin-top:3px;color:' + (muon ? '#BE0E16' : '#0B7350') + '">' + (muon ? 'đóng muộn' : 'đúng hạn') + '</div>' : '') +
        '<div class="cvt-acts">' + oHanhDong(tk, v, m) + '</div>';
      var cBao = (v && v.bangChung) ? '<div class="cvt-bc">' + h(v.bangChung) + '</div>' : '<span class="tiny" style="color:var(--ink-4)">— chưa có —</span>';
      var cKpi = '<b style="color:#0B7350">' + (m.diem || 0) + '</b> <span class="tiny muted">điểm</span>' +
        (tk === 'xong' ? '<div class="tiny" style="color:#0B7350;margin-top:2px">✓ đã tính</div>' : '<div class="tiny muted" style="margin-top:2px">khi đóng</div>');
      var cGt = '<span class="cvt-gt" style="--gc:' + gt.c + '">' + h(gt.chip) + '</span><div class="tiny muted cvt-gt-mo">' + h(gt.mo) + '</div>';
      var cSk = (sk ? '<div class="cvt-sk">' + h(sk) + '</div>' : '<span class="tiny" style="color:var(--ink-4)">chưa có</span>') +
        '<button class="btn ghost sm cvt-act" style="margin-top:5px" data-cvsk="' + h(m.ma) + '">' + ic('edit', 'w-3 h-3') + (sk ? ' Sửa' : ' Thêm') + '</button>';
      var cTro = '<div class="tiny cvt-tip">' + h(troLyGoi(tk, m)) + '</div>' +
        '<button class="btn ghost sm cvt-act" style="margin-top:5px" data-v="tro-ly">' + ic('chat', 'w-3 h-3') + ' Hỏi Trợ lý</button>';

      return '<tr>' +
        '<td class="cvt-stt">' + (i + 1) + '</td>' +
        '<td>' + cUt + '</td>' +
        '<td><span class="chip" style="color:var(--gita-ink);border-color:var(--gita-vien-1)">' + h(m.ma) + '</span>' +
          (nhip.ten ? '<div class="tiny muted" style="margin-top:4px">' + h(nhip.ten) + '</div>' : '') + '</td>' +
        '<td><b class="cvt-ten">' + h(m.ten || '') + '</b>' + (m.mo ? '<div class="tiny muted cvt-mo">' + h(m.mo) + '</div>' : '') + '</td>' +
        '<td>' + nhiemVuChecklist(m) + '</td>' +
        '<td><div class="tiny"><b>Đóng khi:</b> ' + h(m.xong || '—') + '</div>' +
          (m.chuyen ? '<div class="tiny" style="color:#5140B4;margin-top:3px">→ chuyển ' + h(tenVai(m.chuyen)) + '</div>' : '') + '</td>' +
        '<td>' + hanChot(m, v, tk) + '</td>' +
        '<td>' + cTien + '</td>' +
        '<td>' + cBao + '</td>' +
        '<td class="cvt-kpi">' + cKpi + '</td>' +
        '<td>' + cGt + '</td>' +
        '<td>' + dongLuc(m, v, tk) + '</td>' +
        '<td>' + cSk + '</td>' +
        '<td>' + cTro + '</td>' +
      '</tr>';
    }).join('');

    var chuoi = chuoiDungHan();
    var banner = '<div class="cvt-chuoi' + (chuoi ? '' : ' cvt-chuoi-0') + '">' +
      (chuoi ? '🔥 <b>Chuỗi ' + chuoi + ' việc đóng đúng hạn</b> — giữ chuỗi để lên hạng thưởng!'
             : 'Chưa có chuỗi — đóng việc đầu tiên đúng hạn để bắt đầu chuỗi 🔥') + '</div>';

    return banner + '<div class="cvt-wrap"><table class="cvt-table cvt-rong"><thead>' + head + '</thead><tbody>' + body + '</tbody></table></div>' +
      '<p class="tiny muted" style="margin-top:8px;line-height:1.6">' + ic('shield', 'w-3 h-3') +
      ' Bảng chỉ hiện đầu việc của vị trí bạn — không thấy việc của vai khác. Cuộn ngang để xem đủ cột. ' +
      'Ưu tiên · Hạn chót · Giá trị · Động lực do hệ tự tính từ dữ liệu việc.</p>';
  }

  /* ─── Sáng kiến cho một đầu việc (lưu theo máy, bền qua tải lại) ─── */
  G.cvMoSangKien = function (ma) {
    var m = G.cvMuc(ma) || {};
    var cur = ((G.S && G.S.cvSangKien) || {})[ma] || '';
    U.modal(
      '<h2 style="font-size:21px;font-weight:800;margin-bottom:4px">Sáng kiến · ' + h(ma) + '</h2>' +
      '<p class="sm muted" style="margin-bottom:12px">' + h(m.ten || '') + '</p>' +
      '<label class="tiny up muted">Ý TƯỞNG LÀM NHANH HƠN / TỐT HƠN</label>' +
      '<textarea id="cvSk" class="inp blk" rows="4" style="resize:vertical" ' +
      'placeholder="Cách rút gọn bước nào, mẫu nào dùng lại được, chỗ nào hay vướng...">' + h(cur) + '</textarea>' +
      '<button class="btn pri blk mt" data-cvsklu="' + h(ma) + '">Lưu sáng kiến</button>' +
      '<button class="btn ghost blk mt" data-act="dong-modal">Để sau</button>'
    );
  };
  G.cvLuuSangKien = function (ma) {
    var el = document.getElementById('cvSk');
    if (!G.S.cvSangKien) G.S.cvSangKien = {};
    var t = el ? el.value.trim() : '';
    if (t) G.S.cvSangKien[ma] = t; else delete G.S.cvSangKien[ma];
    if (G.save) G.save();
    U.closeModal();
    bao('Đã lưu sáng kiến.', 'ok');
    veLai();
  };

  /* ═══════════ DANH MỤC ĐẦU VIỆC ═══════════ */
  G.VIEWS['danh-muc-viec'] = function () {
    var ds = G.cvMucCuaToi();
    var tong = G.cvDanhMuc().length;
    if (!tong) return U.empty('Chưa mở được danh mục',
      'Danh mục đầu việc đi theo gói cấp phép của vị trí.');
    if (!ds.length) return U.empty('Vị trí này chưa có đầu việc chuẩn',
      'Danh mục mở cho tài khoản này có ' + tong + ' đầu việc, chưa đầu việc nào gắn cho vị trí đang đăng nhập.');

    var o = U.ph({ eyebrow: 'DANH MỤC ĐẦU VIỆC', ic: 'list', grad: 1,
      t: 'Đầu việc chuẩn của ' + h((G.S.roleObj || {}).n || ''),
      lead: 'Tích chọn để nhận việc vào bảng của mình. Mỗi đầu việc nói rõ bốn điều: thuộc nhịp nào, ' +
        'đóng được thì cộng bao nhiêu điểm, CÁI GÌ chứng minh nó xong, và xong rồi thì đi tiếp tới ai.' });

    var theoNhip = {};
    ds.forEach(function (m) { (theoNhip[m.nhip] = theoNhip[m.nhip] || []).push(m); });

    o += '<div class="grid g4 mb">' +
      U.stat({ k: 'Đầu việc', v: String(ds.length), d: 'của vị trí này', c: '#185AB4' }) +
      U.stat({ k: 'Đang mở', v: String(ds.filter(function (m) { return G.cvDangMo(m.ma); }).length), d: 'đã nhận, chưa đóng', c: '#B4720F' }) +
      U.stat({ k: 'Có luân chuyển', v: String(ds.filter(function (m) { return m.chuyen; }).length), d: 'đi tiếp tới vị trí khác', c: '#5140B4' }) +
      U.stat({ k: 'Có liên đới', v: String(ds.filter(function (m) { return m.lienDoi; }).length), d: 'điểm và lỗi chia theo tay', c: '#BE0E16' }) +
      '</div>';

    Object.keys(theoNhip).forEach(function (nh) {
      var n = (G.TG_NHIEMVU || []).filter(function (x) { return x.ma === nh; })[0] || {};
      o += U.sec((n.ten || nh).toUpperCase(),
        'Hạn ' + (n.han || '?') + ' giờ kể từ lúc nhận' + (n.phat ? ' · ' + n.phat : ''));
      o += '<div class="grid g2 mb">' + theoNhip[nh].map(function (m) {
        var dang = G.cvDangMo(m.ma);
        return '<div class="card" style="border-color:' + (dang ? '#B4720F44' : 'var(--line)') + '">' +
          '<div class="row wrap mb" style="gap:6px">' + U.chip(m.ma) + U.chip(m.diem + ' điểm', '#185AB4') +
          (dang ? U.chip('đang mở', '#B4720F') : '') + '</div>' +
          '<b class="sm" style="display:block;line-height:1.4;margin-bottom:6px">' + h(m.ten) + '</b>' +
          '<p class="tiny dim mb" style="line-height:1.7">' + h(m.mo) + '</p>' +
          '<div class="card pad-sm mb" style="border-color:#0B735033">' +
          '<div class="tiny up mb" style="color:#0B7350">ĐÓNG ĐƯỢC KHI</div>' +
          '<p class="tiny" style="line-height:1.65">' + h(m.xong) + '</p></div>' +
          (m.chuyen ? '<p class="tiny mb" style="line-height:1.6;color:var(--ink-3)">' +
            ic('arrow', 'w-3 h-3') + ' Xong rồi chuyển tới <b>' + h(tenVai(m.chuyen)) + '</b></p>' : '') +
          (m.lienDoi ? '<div class="card pad-sm mb" style="border-color:#BE0E1633">' +
            '<div class="tiny up mb" style="color:#BE0E16">LIÊN ĐỚI</div>' +
            '<p class="tiny" style="line-height:1.65">' + h(m.lienDoi) + '</p></div>' : '') +
          (dang ? '<p class="tiny muted center">Đã có một bản ghi đang mở. Đóng bản ghi cũ trước khi nhận lại.</p>'
                : '<button class="btn pri blk" data-cvnhan="' + h(m.ma) + '">' + ic('plus') + 'Nhận việc này</button>') +
          '</div>';
      }).join('') + '</div>';
    });
    return o;
  };

  /* ═══════════ KPI CỦA TÔI ═══════════ */
  G.VIEWS['kpi-toi'] = function () {
    if (!G.CV_LUAT) return U.empty('Chưa mở được bảng KPI', 'Luật chấm KPI nằm trong gói nền.');
    /* Rẽ theo CÓ VIỆC ĐƯỢC GIAO HAY KHÔNG, không rẽ theo "là khách hàng".
       Cộng tác viên nằm trong nhóm khách theo G.LA_KHACH() nhưng có ba
       đầu việc trong danh mục và có bảng công việc riêng — rẽ theo
       LA_KHACH thì họ nhận màn "Nhịp của nhà mình" với dòng "nhà mình
       không có việc ai giao", trong khi họ đang có việc được giao thật. */
    return G.cvVaiCoDauViec && G.cvVaiCoDauViec() ? kpiDoiNgu() : kpiKhach();
  };

  function kpiDoiNgu() {
    var th = G.cvThang(Date.now());
    var thang = G.cvKpiThang(th);
    var homNay = G.cvKpiNgay();
    var lienDoi = G.cvLienDoi();
    var congLD = lienDoi.reduce(function (a, x) { return a + x.so; }, 0);

    var o = U.ph({ eyebrow: 'KPI CỦA TÔI', ic: 'chart', grad: 1,
      t: 'KPI ngày · KPI tháng · phần liên đới',
      lead: h(G.CV_LUAT.cot) });

    o += '<div class="grid g4 mb">' +
      U.stat({ k: 'KPI hôm nay', v: homNay.tinh ? homNay.pt + '%' : '—',
        d: homNay.tinh ? homNay.tuSo + '/' + homNay.mauSo + ' điểm' : 'không có việc đến hạn', c: '#185AB4' }) +
      U.stat({ k: 'KPI tháng ' + th.slice(5), v: thang.du ? thang.pt + '%' : '—',
        d: (thang.du ? 'đủ ' : 'mới ') + thang.soDo + '/' + thang.san + ' ' +
           ((thang.cap && thang.cap.donVi) || 'ngày') + ' được tính', c: '#0B7350' }) +
      U.stat({ k: 'Hạng', v: thang.du && thang.hang ? thang.hang.ma : '—',
        d: thang.du && thang.hang ? thang.hang.ten : 'chưa đủ dữ liệu', c: thang.du && thang.hang ? thang.hang.c : 'var(--ink-4)' }) +
      U.stat({ k: 'Liên đới', v: (congLD > 0 ? '+' : '') + congLD, d: lienDoi.length + ' việc qua tay mình', c: '#5140B4' }) +
      '</div>';

    /* Hồ sơ KPI của CẤP — nói rõ cấp này được đo bằng đơn vị gì và vì sao */
    var cap = thang.cap;
    if (cap)
      o += '<div class="card mb" style="border-color:' + cap.c + '3a">' +
        '<div class="row wrap mb" style="gap:8px;align-items:center">' + U.dot(cap.c) +
        '<b style="color:' + cap.c + ';font-size:16px">' + h(cap.ten) + '</b>' +
        U.chip('đo theo ' + h(cap.donVi), cap.c) + U.chip('sàn ' + cap.san + ' ' + h(cap.donVi)) + '</div>' +
        '<p class="sm dim mb" style="line-height:1.75"><b>Cấp này nặng nhất ở đâu.</b> ' + h(cap.trong) + '</p>' +
        '<p class="tiny mb" style="line-height:1.7;color:var(--ink-2)"><b>Vì sao đo bằng ' + h(cap.donVi) +
        '.</b> ' + h(cap.vi) + '</p>' +
        '<div class="card pad-sm" style="border-color:' + cap.c + '26">' +
        '<p class="tiny" style="line-height:1.7">' + h(cap.banGhi) + '</p></div></div>';

    if (!thang.du)
      o += '<div class="card mb" style="border-color:var(--alert);background:rgba(251,146,60,.06)">' +
        '<p class="tiny" style="line-height:1.75;color:var(--ink-2)"><b>Tháng này mới có ' + thang.soDo + ' ' +
        h((cap && cap.donVi) || 'ngày') + ' được tính, sàn của cấp này là ' + thang.san + '.</b> ' +
        'Chưa đủ thì KPI tháng ghi "chưa đủ dữ liệu" chứ không ghi một con số — trung bình của vài lần đo ' +
        'không nói được gì về một tháng, mà một con số thì trông như đã nói.</p></div>';

    /* Bảng ngày trong tháng */
    if (thang.ngay && thang.ngay.length) {
      o += U.sec('TỪNG NGÀY TRONG THÁNG', 'Chỉ ngày có việc đến hạn mới vào trung bình. Ngày trống không tính, không phải 0%.');
      o += '<div class="card">' + thang.ngay.map(function (d) {
        var c = d.pt >= 90 ? '#0B7350' : d.pt >= 80 ? '#185AB4' : d.pt >= 65 ? '#B4720F' : '#BE0E16';
        return '<div class="row" style="gap:10px;align-items:center;margin-bottom:9px">' +
          '<span class="mono tiny" style="flex:none;width:88px;color:var(--ink-3)">' + h(d.ngay) + '</span>' +
          '<span style="flex:1">' + U.bar(d.pt, c) + '</span>' +
          '<b class="tiny" style="flex:none;width:44px;text-align:right;color:' + c + '">' + d.pt + '%</b>' +
          '<span class="tiny muted" style="flex:none;width:96px;text-align:right">' + d.tuSo + '/' + d.mauSo +
          (d.tru ? ' · −' + d.tru : '') + '</span></div>';
      }).join('') + '</div>';
    }

    /* Bốn hạng */
    o += U.sec('BỐN HẠNG THÁNG', 'Hạng quyết định thưởng và tải của tháng sau. Không ghi số tiền ở đây — bảng lương của Học viện nhân vào.');
    o += '<div class="grid g4 mb">' + (G.CV_HANG || []).map(function (x) {
      var dang = thang.du && thang.hang && thang.hang.ma === x.ma;
      return '<div class="card pad-sm" style="border-color:' + x.c + (dang ? '66' : '26') + ';' + (dang ? 'background:' + x.c + '0d' : '') + '">' +
        '<div class="row mb" style="gap:8px">' + U.dot(x.c) +
        '<b class="sm" style="color:' + x.c + '">' + h(x.ma) + ' · ' + h(x.ten) + '</b>' +
        (dang ? U.chip('đang ở đây', x.c) : '') + '</div>' +
        '<p class="tiny mb" style="line-height:1.6;color:var(--ink-3)">' + h(x.dieu) + '</p>' +
        '<p class="tiny" style="line-height:1.65">' + h(x.duoc) + '</p>' +
        '<p class="tiny muted mt" style="line-height:1.6">' + h(x.canThem) + '</p></div>';
    }).join('') + '</div>';

    /* Luật */
    o += U.sec('LUẬT CHẤM KPI NGÀY', 'Năm luật này quyết định mọi con số ở trên.');
    o += '<div class="card mb">' + G.CV_LUAT.ngay.map(function (x) {
      return '<div class="rule"><span class="n">' + x.b + '</span><div class="tx"><b>' + h(x.t) + '</b>' +
        '<p>' + h(x.d) + '</p></div></div>';
    }).join('') + '</div>';

    o += U.sec('TRÁCH NHIỆM LIÊN ĐỚI', 'Việc đi qua nhiều tay thì điểm và lỗi chia theo tay — không dồn hết cho người cuối cùng cầm nó.');
    o += '<div class="card mb">' + G.CV_LUAT.lienDoi.map(function (x) {
      return '<div class="rule"><span class="n">' + x.b + '</span><div class="tx"><b>' + h(x.t) + '</b>' +
        '<p>' + h(x.d) + '</p></div></div>';
    }).join('') + '</div>';

    /* Ba cấp, và luật giữ cho không ai hạ sàn của cấp mình */
    o += U.sec('BA CẤP — MỖI CẤP MỘT ĐƠN VỊ ĐO',
      'Công thức giống nhau cho mọi cấp: điểm đóng chia điểm đến hạn. Chỉ đơn vị đo và sàn dữ liệu đổi theo nhịp việc của cấp — không phải vì kỳ vọng khác nhau.');
    o += '<div class="grid g3 mb">' + (G.CV_KPI_CAP || []).map(function (x) {
      var dang = cap && cap.ma === x.ma;
      return '<div class="card pad-sm" style="border-color:' + x.c + (dang ? '66' : '26') + ';' +
        (dang ? 'background:' + x.c + '0d' : '') + '">' +
        '<div class="row wrap mb" style="gap:7px">' + U.dot(x.c) +
        '<b class="sm" style="color:' + x.c + '">' + h(x.ten) + '</b>' +
        (dang ? U.chip('cấp của tôi', x.c) : '') + '</div>' +
        '<div class="tiny muted mb">đo theo ' + h(x.donVi) + ' · sàn ' + x.san + '</div>' +
        '<p class="tiny" style="line-height:1.65">' + h(x.vi) + '</p></div>';
    }).join('') + '</div>';
    o += '<div class="card mb">' + U.list(G.CV_KPI_CAP_LUAT || [], 'var(--gita)') + '</div>';

    o += U.sec('LUẬT GỘP THÁNG', '');
    o += '<div class="card">' + G.CV_LUAT.thang.map(function (x) {
      return '<div class="rule"><span class="n">' + x.b + '</span><div class="tx"><b>' + h(x.t) + '</b>' +
        '<p>' + h(x.d) + '</p></div></div>';
    }).join('') + '</div>';
    return o;
  }

  /* ═══════════ KPI KHÁCH HÀNG ═══════════ */
  function kpiKhach() {
    var ngay = G.khKpiNgay();
    var tang = G.khKpiTang();
    var T = G.CV_KH_TANG || {};
    var daChot = !!(G.S.chotKhNgay && G.S.chotKhNgay[G.cvNgay(Date.now())]);

    var o = U.ph({ eyebrow: 'NHỊP CỦA NHÀ MÌNH', ic: 'chart', grad: 1,
      t: 'KPI ngày và KPI tầng',
      lead: 'Nhà mình không có việc ai giao — nhà mình có NHỊP phải giữ. Năm nhịp dưới đây đo mỗi ngày, ' +
        'và trung bình của chúng suốt tầng là phần nặng nhất trong điểm xét lên tầng.' });

    o += '<div class="grid g4 mb">' +
      U.stat({ k: 'Nhịp hôm nay', v: ngay.pt + '%', d: ngay.dat + '/' + ngay.tong + ' điểm', c: '#185AB4' }) +
      U.stat({ k: 'KPI tầng', v: tang.du ? tang.pt + '%' : '—',
        d: tang.du ? tang.soNgay + ' ngày đã chốt' : 'mới ' + tang.soNgay + '/' + tang.san + ' ngày', c: '#0B7350' }) +
      U.stat({ k: 'Nhịp ngày', v: tang.du ? tang.nhipPt + '%' : '—', d: 'chiếm 60% điểm tầng', c: '#5140B4' }) +
      U.stat({ k: 'Tiêu chí mốc', v: tang.mocPt + '%', d: 'chiếm 40% điểm tầng', c: '#0B6675' }) +
      '</div>';

    o += '<div class="card mb" style="border-color:var(--gita-vien-2)">' +
      '<div class="row mb" style="gap:8px"><span style="color:var(--gold-ink)">' + ic('target', 'w-4 h-4') + '</span>' +
      '<b>' + h(T.congThuc || '') + '</b></div>' +
      '<p class="sm dim" style="line-height:1.8">' + h(T.vi || '') + '</p></div>';

    /* Năm nhịp hôm nay */
    o += U.sec('NĂM NHỊP CỦA HÔM NAY', 'Mỗi nhịp tự bật khi hệ thống thấy dấu vết thật trong máy này — không ai khai hộ.');
    o += '<div class="card mb">' + ngay.chiTiet.map(function (x) {
      return '<div class="row" style="gap:10px;align-items:flex-start;margin-bottom:11px">' +
        '<span style="flex:none;color:' + (x.dat ? '#0B7350' : 'var(--ink-4)') + '">' +
        ic(x.dat ? 'check' : 'dot', 'w-4 h-4') + '</span>' +
        '<div style="flex:1"><b class="sm">' + h(x.ten) + '</b>' +
        '<p class="tiny muted" style="line-height:1.6">' + h(x.dieu) + '</p></div>' +
        '<span class="chip" style="flex:none;color:' + (x.dat ? '#0B7350' : 'var(--ink-4)') + '">' +
        (x.dat ? '+' : '') + x.diem + '</span></div>';
    }).join('') + '</div>';

    o += '<div class="card mb" style="border-color:' + (daChot ? '#0B735044' : 'var(--gita-vien-2)') + '">' +
      '<div class="row wrap" style="gap:14px;align-items:center">' +
      '<div class="grow" style="min-width:250px">' +
      '<b class="sm" style="display:block;margin-bottom:5px">' +
      (daChot ? 'Hôm nay đã chốt' : 'Chốt nhịp hôm nay') + '</b>' +
      '<p class="tiny" style="line-height:1.7;color:var(--ink-2)">' +
      (daChot ? 'Điểm của hôm nay đã vào KPI tầng. Ngày mai mở lại là một ngày mới.'
              : 'Chốt là ghi điểm của hôm nay vào KPI tầng. Chưa đủ ' + tang.san +
                ' ngày thì KPI tầng chưa ra số — vì trung bình vài ngày không nói được gì về một tầng.') +
      '</p></div>' +
      (daChot ? '' : '<button class="btn pri" data-khchot="1">' + ic('check') + 'Chốt hôm nay</button>') +
      '</div></div>';

    /* Ba ngưỡng */
    o += U.sec('BA NGƯỠNG XÉT PHÂN TẦNG', 'Ngưỡng quyết định nhà mình có được xét lên tầng hay chưa.');
    o += '<div class="grid g3 mb">' + (T.nguong || []).map(function (x) {
      var dang = tang.du && tang.nguong && tang.nguong.ma === x.ma;
      return '<div class="card pad-sm" style="border-color:' + x.c + (dang ? '66' : '26') + ';' + (dang ? 'background:' + x.c + '0d' : '') + '">' +
        '<div class="row mb" style="gap:8px">' + U.dot(x.c) +
        '<b class="sm" style="color:' + x.c + '">' + h(x.ten) + '</b>' +
        (dang ? U.chip('nhà mình', x.c) : '') + '</div>' +
        '<div class="tiny muted mb">từ ' + x.min + '%</div>' +
        '<p class="tiny" style="line-height:1.7">' + h(x.y) + '</p></div>';
    }).join('') + '</div>';

    o += U.sec('NĂM LUẬT CỦA KPI TẦNG', 'Đọc trước khi thắc mắc vì sao chưa được xét.');
    o += '<div class="card">' + U.list(T.luat || [], 'var(--gita)') + '</div>';

    o += '<div class="row wrap mt2" style="gap:8px">' +
      '<button class="btn ghost sm" data-v="nhiem-vu">' + ic('check') + 'Việc của hôm nay</button>' +
      '<button class="btn ghost sm" data-v="kpi-100">' + ic('crown') + 'Mười điểm về đích</button>' +
      '<button class="btn ghost sm" data-v="pham-vi">' + ic('compass') + 'Phạm vi của tôi</button></div>';
    return o;
  }
})();

/* ═══════════════════════════════════════════════════════════════
   PHẦN BẤM — cửa sổ nhập liệu và phản hồi

   Tách khỏi phần vẽ vì đây là chỗ DUY NHẤT dữ liệu công việc đi vào hệ
   thống, và mọi lối vào đều phải qua đúng một cửa có kiểm. Rải lệnh ghi
   ra nhiều chỗ là cách chắc chắn để sáu tháng nữa có một chỗ quên kiểm
   bằng chứng.
   ═══════════════════════════════════════════════════════════════ */
(function () {
  var U = G.U, h = U.h, ic = U.ic;

  function veLai() { if (G.render) G.render(); }
  function bao(t, loai) { if (U.toast) U.toast(t, loai || 'ok'); }

  G.cvNhanHoiDap = function (ma) {
    var r = G.cvNhan(ma);
    if (!r.ok) return bao(r.loi, 'err');
    var m = G.cvMuc(ma) || {};
    bao('Đã nhận "' + m.ten + '". Đồng hồ hạn chạy từ bây giờ.', 'ok');
    veLai();
  };

  G.cvBatDauHoiDap = function (id) {
    if (!G.cvBatDau(id)) return bao('Không bắt đầu được việc này.', 'err');
    veLai();
  };

  /* Đóng việc — cửa sổ nhập bằng chứng. Nhắc rõ đóng bằng CÁI GÌ, lấy
     nguyên câu từ danh mục, để người nhập không phải nhớ. */
  G.cvMoDongViec = function (id) {
    var v = (G.cvSo() || {})[id];
    if (!v) return bao('Không tìm thấy việc.', 'err');
    var m = G.cvMuc(v.ma) || {};
    U.modal(
      '<h2 style="font-size:21px;font-weight:800;margin-bottom:4px">Đóng việc ' + h(v.ma) + '</h2>' +
      '<p class="sm muted" style="margin-bottom:12px">' + h(m.ten || '') + '</p>' +
      '<div class="card pad-sm mb" style="border-color:#0B735033">' +
      '<div class="tiny up mb" style="color:#0B7350">ĐÓNG ĐƯỢC KHI</div>' +
      '<p class="tiny" style="line-height:1.7">' + h(m.xong || '') + '</p></div>' +
      '<label class="tiny up muted">BẰNG CHỨNG ĐÓNG VIỆC</label>' +
      '<textarea id="cvBc" class="inp blk" rows="4" style="resize:vertical" ' +
      'placeholder="Viết đúng cái đã làm được, có mốc thời gian và tên việc cụ thể."></textarea>' +
      '<p class="tiny muted" style="margin:6px 0 10px;line-height:1.6">Ít nhất ' +
      G.CV_BANGCHUNG_TOITHIEU + ' ký tự. Đây không phải thủ tục: KPI chấm trên việc có bằng chứng, ' +
      'nên một dòng "đã xong" sẽ bị từ chối.</p>' +
      '<div id="cvLoi" class="tiny mb" style="color:#BE0E16;min-height:16px"></div>' +
      '<button class="btn pri blk" data-cvdong="' + h(id) + '">Đóng việc</button>' +
      '<button class="btn ghost blk mt" data-act="dong-modal">Để sau</button>'
    );
  };

  G.cvDongThat = function (id) {
    var el = document.getElementById('cvBc');
    var r = G.cvXong(id, el ? el.value : '');
    var loi = document.getElementById('cvLoi');
    if (!r.ok) { if (loi) loi.textContent = r.loi; return; }
    U.closeModal();
    var muon = r.viec.xongLuc > r.viec.hanLuc;
    bao(muon ? 'Đã đóng — nhưng muộn hạn, KPI ngày hôm nay bị trừ theo bảng phạt.'
             : 'Đã đóng đúng hạn.', muon ? 'err' : 'ok');
    veLai();
  };

  /* Luân chuyển — nói rõ chuyển cho ai và phần liên đới đi kèm */
  G.cvMoChuyen = function (id) {
    var v = (G.cvSo() || {})[id];
    if (!v) return bao('Không tìm thấy việc.', 'err');
    var m = G.cvMuc(v.ma) || {};
    if (!m.chuyen) return bao('Đầu việc này không có bước luân chuyển.', 'err');
    var r = G.roleById && G.roleById(m.chuyen);
    U.modal(
      '<h2 style="font-size:21px;font-weight:800;margin-bottom:4px">Chuyển việc ' + h(v.ma) + '</h2>' +
      '<p class="sm muted" style="margin-bottom:12px">Sang <b>' + h(r ? r.n : m.chuyen) + '</b></p>' +
      (m.lienDoi ? '<div class="card pad-sm mb" style="border-color:#BE0E1633">' +
        '<div class="tiny up mb" style="color:#BE0E16">PHẦN LIÊN ĐỚI CỦA MÌNH SAU KHI CHUYỂN</div>' +
        '<p class="tiny" style="line-height:1.7">' + h(m.lienDoi) + '</p></div>' : '') +
      '<div class="card pad-sm mb" style="border-color:var(--gita-vien-1)">' +
      '<p class="tiny" style="line-height:1.7">Chuyển rồi thì mình giữ ' +
      Math.round(G.CV_PHAN_GIAO * 100) + '% điểm của việc này cho tới khi người nhận đóng xong. ' +
      'Người nhận đóng hụt vì hồ sơ bàn giao thiếu thì điểm trừ chia đôi — nên phần ghi chú dưới đây ' +
      'là phần bảo vệ chính mình.</p></div>' +
      '<label class="tiny up muted">BÀN GIAO LẠI ĐIỀU GÌ</label>' +
      '<textarea id="cvGhi" class="inp blk" rows="3" style="resize:vertical" ' +
      'placeholder="Nhà này mắc gì · đã hứa gì với họ · chỗ nào mình chưa chắc."></textarea>' +
      '<div class="mt"></div>' +
      '<button class="btn pri blk" data-cvchuyenthat="' + h(id) + '">Chuyển và ghi vào đường đi</button>' +
      '<button class="btn ghost blk mt" data-act="dong-modal">Để sau</button>'
    );
  };

  G.cvChuyenThat = function (id) {
    var v = (G.cvSo() || {})[id], m = v && G.cvMuc(v.ma);
    if (!m) return;
    var el = document.getElementById('cvGhi');
    var r = G.cvChuyen(id, m.chuyen, el ? el.value.trim() : '');
    U.closeModal();
    if (!r.ok) return bao(r.loi, 'err');
    bao('Đã chuyển. Việc này giờ nằm ở bảng của ' + h((G.roleById(m.chuyen) || {}).n || m.chuyen) + '.', 'ok');
    veLai();
  };

  /* Đường đi — trả lời câu "việc này đã qua tay ai" */
  G.cvMoDuongDi = function (id) {
    var v = (G.cvSo() || {})[id];
    if (!v) return bao('Không tìm thấy việc.', 'err');
    var m = G.cvMuc(v.ma) || {};
    function ten(x) { var r = G.roleById && G.roleById(x); return r ? r.n : (x || '—'); }
    function luc(t) { return new Date(t).toLocaleString('vi-VN'); }
    U.modal(
      '<h2 style="font-size:21px;font-weight:800;margin-bottom:4px">Đường đi của ' + h(v.ma) + '</h2>' +
      '<p class="sm muted" style="margin-bottom:14px">' + h(m.ten || '') + '</p>' +
      '<div class="card pad-sm mb"><div class="tiny up muted mb">ĐANG Ở TAY</div>' +
      '<b class="sm">' + h(ten(v.nguoi)) + '</b>' +
      '<p class="tiny muted mt">Hạn: ' + h(luc(v.hanLuc)) + '</p></div>' +
      '<div class="card">' + (v.lichSu || []).map(function (l, i) {
        return '<div class="rule"><span class="n">' + (i + 1) + '</span><div class="tx">' +
          '<b>' + h(l.viec) + '</b><p>' + h(luc(l.luc)) + ' · ' + h(ten(l.vai)) + '</p></div></div>';
      }).join('') + '</div>' +
      '<button class="btn ghost blk mt" data-act="dong-modal">Đóng</button>'
    );
  };

  G.cvChotHoiDap = function () {
    var r = G.cvChotNgay();
    if (!r.ok) return bao(r.loi, 'err');
    bao('Đã chốt ngày · ' + r.kpi.pt + '%. Con số này đã vào KPI tháng và không sửa được nữa.', 'ok');
    veLai();
  };

  G.khChotHoiDap = function () {
    var r = G.khChotNgay();
    if (!r.ok) return bao(r.loi, 'err');
    bao('Đã chốt nhịp hôm nay · ' + r.kpi.pt + '%.', 'ok');
    veLai();
  };
})();
