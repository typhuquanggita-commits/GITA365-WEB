/* ═══════════════════════════════════════════════════════════════
   GITA 365 — LIÊN THỐNG & TOÀN VẸN DỮ LIỆU (chỉ Super Admin / Admin)

   Màn "Tự soát đầy đủ" (soat-day-du) đã đếm TỪNG KHO: con số công bố,
   trường thiếu, chất lượng chữ, màn lỗi. Nhưng nó soát mỗi kho RIÊNG.

   Màn này soát phần còn thiếu: LIÊN THỐNG — các mối nối GIỮA dữ liệu có
   đúng không. Một con số đúng trong kho A mà trỏ sai sang kho B thì cả
   hệ vẫn sai, và không phép đếm-một-kho nào bắt được.

   THUẬT TOÁN: BẤT BIẾN (invariant) + ĐO LƯỜNG + XỬ LÝ

   · Mỗi "bất biến" là một điều PHẢI luôn đúng, viết thành hàm chạy trên
     dữ liệu ĐANG NẠP, trả về danh sách vi phạm cụ thể (ở đâu, cái gì).
   · Bốn nhóm: Điều hướng (menu↔màn↔quyền) · Phân quyền (vai↔quyền↔bậc) ·
     Công việc↔KPI · Con số & trường (mượn lại máy Tự soát).
   · ĐO LƯỜNG: điểm toàn vẹn (0–100, trừ theo mức nặng), tỉ lệ bất biến
     đạt, số phát hiện đang mở. Ghi mốc đo để thấy CẢI TIẾN theo thời gian.
   · XỬ LÝ TRIỆT ĐỂ: mỗi phát hiện đánh dấu "đã xử lý" hoặc "ngoại lệ có
     lý do"; đã xử lý thì rời khỏi số đang mở — Super Admin lái về 0.

   Màn này KHÔNG tự sửa dữ liệu kho; nó chỉ đo, chỉ chính xác chỗ sai,
   đề xuất cách xử lý, và theo dõi tới khi hết. Sửa vẫn qua đúng cửa cũ.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;
G.VIEWS = G.VIEWS || {};

(function () {
  var U = G.U, h = U.h, ic = U.ic;

  var MUC_MAU = { chan: '#BE0E16', nang: '#B4720F', nhe: '#185AB4', tin: 'var(--ink-4)' };
  var MUC_TEN = { chan: 'Chặn', nang: 'Nặng', nhe: 'Nhẹ', tin: 'Thông tin' };
  var MUC_TRU = { chan: 10, nang: 4, nhe: 1, tin: 0 };

  function roleIds() { return (G.ROLES || []).map(function (r) { return r.id; }); }

  /* ─── Định nghĩa các bất biến, nhóm theo chiều liên thống ─── */
  G.ltBatBien = function () {
    var NAV = G.NAV || [], PERM = G.PERM || {}, PT = G.PERM_TEN || {}, ROLES = G.ROLES || [];
    var items = []; NAV.forEach(function (g) { (g.items || []).forEach(function (it) { items.push(it); }); });
    var rid = roleIds();
    var cat = (typeof G.cvDanhMuc === 'function') ? (G.cvDanhMuc() || []) : [];
    var nhip = (G.TG_NHIEMVU || []).map(function (x) { return x.ma; });
    var viec = (G.S && G.S.viec) || {};
    var chot = (G.S && G.S.chotNgay) || {};

    return [
      {
        ma: 'DH', ten: 'Điều hướng — Menu ↔ Màn ↔ Quyền',
        y: 'Mỗi mục trên thanh trái phải dẫn tới một màn dựng được, với quyền có thật.',
        phep: [
          { ma: 'DH1', ten: 'Mọi mục menu dựng được thành màn', muc: 'chan',
            xl: 'Thêm màn vào hệ (G.VIEWS / gói nghề) hoặc gỡ mục khỏi G.NAV.',
            chay: function () { return items.filter(function (it) { return !G.manCoThat(it.v); })
              .map(function (it) { return { id: it.v, mo: 'Mục "' + (it.t || it.v) + '" trỏ tới màn [' + it.v + '] không dựng được — bấm vào ra màn trống.' }; }); } },
          { ma: 'DH2', ten: 'Quyền của mục có trong bảng quyền', muc: 'nang',
            xl: 'Khai quyền trong G.PERM, hoặc sửa lại perm của mục cho đúng.',
            chay: function () { return items.filter(function (it) { return it.perm && PERM[it.perm] === undefined; })
              .map(function (it) { return { id: it.v, mo: 'Mục "' + (it.t || it.v) + '" cần quyền [' + it.perm + '] không có trong G.PERM → không vai nào mở được.' }; }); } },
          { ma: 'DH3', ten: 'Điều kiện hiện (hienKhi) là hàm có thật', muc: 'nang',
            xl: 'Định nghĩa hàm tương ứng trên G, hoặc bỏ thuộc tính hienKhi.',
            chay: function () { return items.filter(function (it) { return it.hienKhi && typeof G[it.hienKhi] !== 'function'; })
              .map(function (it) { return { id: it.v, mo: 'Mục "' + (it.t || it.v) + '" dùng hienKhi [' + it.hienKhi + '] không phải hàm → mục luôn bị ẩn.' }; }); } },
          { ma: 'DH4', ten: 'Không có màn trùng trong menu', muc: 'nhe',
            xl: 'Giữ mỗi màn đúng một mục; gỡ mục trùng.',
            chay: function () { var seen = {}, dup = []; items.forEach(function (it) { if (seen[it.v]) dup.push({ id: it.v, mo: 'Màn [' + it.v + '] xuất hiện nhiều lần trong menu.' }); seen[it.v] = 1; }); return dup; } },
          { ma: 'DH5', ten: 'Quyền dùng ở menu đều có tên tiếng Việt', muc: 'nhe',
            xl: 'Thêm dòng tương ứng vào G.PERM_TEN.',
            chay: function () { var seen = {}, miss = []; items.forEach(function (it) { if (it.perm && PERM[it.perm] !== undefined && !PT[it.perm] && !seen[it.perm]) { seen[it.perm] = 1; miss.push({ id: it.perm, mo: 'Quyền [' + it.perm + '] chưa có tên trong G.PERM_TEN (bảng phân quyền hiện mã thô).' }); } }); return miss; } }
        ]
      },
      {
        ma: 'PQ', ten: 'Phân quyền — Vai ↔ Quyền ↔ Bậc',
        y: 'Ngưỡng quyền và bậc vai phải nằm đúng thang 1–15 và không chồng chéo.',
        phep: [
          { ma: 'PQ1', ten: 'Ngưỡng quyền nằm trong bậc 1–15', muc: 'nang',
            xl: 'Đặt ngưỡng trong 1–15 theo đúng bậc vai được phép.',
            chay: function () { return Object.keys(PERM).filter(function (k) { var n = PERM[k]; return !(n >= 1 && n <= 15); })
              .map(function (k) { return { id: k, mo: 'Quyền [' + k + '] có ngưỡng ' + PERM[k] + ' ngoài khoảng 1–15.' }; }); } },
          { ma: 'PQ2', ten: 'Mọi quyền có tên tiếng Việt', muc: 'nhe',
            xl: 'Thêm vào G.PERM_TEN để bảng phân quyền đọc được.',
            chay: function () { return Object.keys(PERM).filter(function (k) { return !PT[k]; })
              .map(function (k) { return { id: k, mo: 'Quyền [' + k + '] thiếu tên trong G.PERM_TEN.' }; }); } },
          { ma: 'PQ3', ten: 'Bậc vai 1–15, không trùng', muc: 'nhe',
            xl: 'Mỗi vai một bậc duy nhất trong 1–15.',
            chay: function () { var lv = {}, bad = []; ROLES.forEach(function (r) { if (!(r.lv >= 1 && r.lv <= 15)) bad.push({ id: r.id, mo: 'Vai ' + r.id + ' có bậc ' + r.lv + ' ngoài 1–15.' }); if (lv[r.lv]) bad.push({ id: r.id, mo: 'Bậc ' + r.lv + ' trùng giữa ' + lv[r.lv] + ' và ' + r.id + '.' }); lv[r.lv] = r.id; }); return bad; } }
        ]
      },
      {
        ma: 'CV', ten: 'Công việc ↔ KPI — Liên thông dữ liệu',
        y: 'Đầu việc, bản ghi việc và KPI phải trỏ đúng vai, nhịp và mốc thời gian thật.',
        chuaNap: !cat.length,
        napY: 'Danh mục đầu việc nằm trong gói nghề — đăng nhập vai có gói để soát phần này.',
        phep: [
          { ma: 'CV1', ten: 'Đầu việc gắn vai có thật', muc: 'nang',
            xl: 'Sửa mã vai trong danh mục đầu việc (kho-goc/data.cong-viec.js).',
            chay: function () { var bad = []; cat.forEach(function (m) { (m.vai || []).forEach(function (v) { if (rid.indexOf(v) < 0) bad.push({ id: m.ma + ':' + v, mo: 'Đầu việc ' + m.ma + ' gắn vai [' + v + '] không có trong danh sách vai.' }); }); }); return bad; } },
          { ma: 'CV2', ten: 'Luân chuyển tới vai có thật', muc: 'nang',
            xl: 'Sửa mã vai chuyển tiếp của đầu việc.',
            chay: function () { return cat.filter(function (m) { return m.chuyen && rid.indexOf(m.chuyen) < 0; })
              .map(function (m) { return { id: m.ma, mo: 'Đầu việc ' + m.ma + ' chuyển tới vai [' + m.chuyen + '] không tồn tại.' }; }); } },
          { ma: 'CV3', ten: 'Nhịp của đầu việc có thật', muc: 'nang',
            xl: 'Khai nhịp trong G.TG_NHIEMVU hoặc sửa mã nhịp.',
            chay: function () { if (!nhip.length) return []; return cat.filter(function (m) { return m.nhip && nhip.indexOf(m.nhip) < 0; })
              .map(function (m) { return { id: m.ma, mo: 'Đầu việc ' + m.ma + ' dùng nhịp [' + m.nhip + '] không có trong bảng nhịp.' }; }); } },
          { ma: 'CV4', ten: 'Bản ghi việc trỏ đúng đầu việc', muc: 'nang',
            xl: 'Dọn bản ghi mồ côi hoặc khôi phục đầu việc đã xoá.',
            chay: function () { var map = {}; cat.forEach(function (m) { map[m.ma] = 1; }); return Object.keys(viec).filter(function (k) { return !map[viec[k].ma]; })
              .map(function (k) { return { id: k, mo: 'Bản ghi việc [' + k + '] có mã ' + viec[k].ma + ' không còn trong danh mục.' }; }); } },
          { ma: 'CV5', ten: 'Mốc thời gian hợp lệ', muc: 'nang',
            xl: 'Bản ghi thời gian hỏng — xem lại hoặc dọn bản ghi.',
            chay: function () { var bad = []; Object.keys(viec).forEach(function (k) { var v = viec[k]; if (v.hanLuc <= v.nhanLuc) bad.push({ id: k + '|han', mo: 'Việc [' + k + '] có hạn trước/bằng lúc nhận.' }); if (v.xongLuc && v.xongLuc < v.nhanLuc) bad.push({ id: k + '|xong', mo: 'Việc [' + k + '] đóng trước khi nhận.' }); }); return bad; } },
          { ma: 'CV6', ten: 'KPI ngày chốt trong khoảng 0–100%', muc: 'nhe',
            xl: 'Xem lại phép tính KPI ngày của ngày bị lệch.',
            chay: function () { return Object.keys(chot).filter(function (d) { var p = chot[d] && chot[d].pt; return !(p >= 0 && p <= 100); })
              .map(function (d) { return { id: d, mo: 'Chốt ngày ' + d + ' có KPI ' + (chot[d] && chot[d].pt) + ' ngoài 0–100%.' }; }); } }
        ]
      },
      {
        ma: 'CS', ten: 'Con số & trường — nối từ máy Tự soát',
        y: 'Gộp kết quả đếm-từng-kho của màn Tự soát đầy đủ vào cùng một điểm đo.',
        chuaNap: typeof G.soatConSo !== 'function',
        napY: 'Luật soát nằm trong gói nền — đăng nhập để nạp.',
        phep: [
          { ma: 'CS1', ten: 'Con số công bố khớp dữ liệu đếm được', muc: 'nang',
            xl: 'Mở màn "Tự soát đầy đủ" để xem từng kho lệch; đối chiếu lại con số công bố.',
            chay: function () { var ra = (typeof G.soatConSo === 'function') ? (G.soatConSo() || []) : []; return ra.filter(function (x) { return x.nap && !x.dat; })
              .map(function (x) { return { id: x.k, mo: x.ten + ': công bố ' + x.can + ', đếm được ' + x.co + '.' }; }); } },
          { ma: 'CS2', ten: 'Bản ghi đủ trường bắt buộc', muc: 'nang',
            xl: 'Bổ sung trường thiếu trong kho; màn Tự soát đầy đủ chỉ rõ từng kho.',
            chay: function () { var ra = (typeof G.soatTruong === 'function') ? (G.soatTruong() || []) : []; var bad = []; ra.forEach(function (x) { if (x.thieu && x.thieu.length) x.thieu.forEach(function (t) { bad.push({ id: x.kho + '.' + t.truong, mo: x.kho + ': ' + t.so + '/' + t.tong + ' bản ghi thiếu "' + t.truong + '".' }); }); }); return bad; } }
        ]
      }
    ];
  };

  function khoaLoi(pma, id) { return pma + '::' + id; }
  function xlCua(key) { return ((G.S && G.S.ltXuLy) || {})[key] || null; }

  /* ─── Chạy toàn bộ, tính đo lường, áp trạng thái xử lý ─── */
  G.ltSoat = function () {
    var nhom = G.ltBatBien();
    var tongPhep = 0, datPhep = 0, moActive = 0, daXuLy = 0, tru = 0, chayDuoc = 0;
    nhom.forEach(function (n) {
      n.datN = 0; n.tongN = 0; n.moN = 0;
      if (n.chuaNap) { n.phep.forEach(function (p) { p.boQua = true; }); return; }
      n.phep.forEach(function (p) {
        tongPhep++; n.tongN++; chayDuoc++;
        var loi;
        try { loi = p.chay() || []; } catch (e) { loi = [{ id: '_loi', mo: 'Phép soát lỗi khi chạy: ' + e.message }]; }
        p.tatCa = loi;
        p.mo = loi.filter(function (l) { return !xlCua(khoaLoi(p.ma, l.id)); });
        p.xong = loi.filter(function (l) { return xlCua(khoaLoi(p.ma, l.id)); });
        if (!p.mo.length) { datPhep++; n.datN++; }
        moActive += p.mo.length;
        daXuLy += p.xong.length;
        tru += p.mo.length * (MUC_TRU[p.muc] || 0);
      });
      n.moN = n.phep.reduce(function (a, p) { return a + (p.mo ? p.mo.length : 0); }, 0);
    });
    var diem = Math.max(0, 100 - tru);
    var tiLe = tongPhep ? Math.round(datPhep / tongPhep * 100) : 100;
    return { nhom: nhom, diem: diem, tiLe: tiLe, tongPhep: tongPhep, datPhep: datPhep, moActive: moActive, daXuLy: daXuLy, chayDuoc: chayDuoc, luc: Date.now() };
  };

  /* ─── Xử lý: đánh dấu đã xử lý / ngoại lệ ─── */
  G.ltDanhDau = function (key, trang, ghi) {
    if (!G.S.ltXuLy) G.S.ltXuLy = {};
    if (trang === 'mo') delete G.S.ltXuLy[key];
    else G.S.ltXuLy[key] = { trang: trang, ghi: ghi || '', luc: Date.now(), boi: (G.S.roleObj || {}).id || '' };
    if (G.save) G.save();
    if (G.render) G.render();
  };
  G.ltMoGhiChu = function (key) {
    U.modal(
      '<h2 style="font-size:20px;font-weight:800;margin-bottom:4px">Ghi lý do ngoại lệ</h2>' +
      '<p class="sm muted" style="margin-bottom:12px">Chỗ trống có lý do khác hẳn chỗ bị bỏ quên. Ghi rõ vì sao chấp nhận được.</p>' +
      '<textarea id="ltGhi" class="inp blk" rows="3" style="resize:vertical" placeholder="Vì sao đây là ngoại lệ chấp nhận được..."></textarea>' +
      '<button class="btn pri blk mt" data-ltngoaile-luu="' + h(key) + '">Lưu ngoại lệ</button>' +
      '<button class="btn ghost blk mt" data-act="dong-modal">Thôi</button>'
    );
  };
  G.ltLuuNgoaiLe = function (key) {
    var el = document.getElementById('ltGhi');
    U.closeModal();
    G.ltDanhDau(key, 'ngoaile', el ? el.value.trim() : '');
  };

  /* ─── Ghi mốc đo để theo dõi cải tiến ─── */
  G.ltGhiMoc = function () {
    var kq = G.ltSoat();
    if (!G.S.ltLichSu) G.S.ltLichSu = [];
    G.S.ltLichSu.push({ luc: kq.luc, diem: kq.diem, tiLe: kq.tiLe, mo: kq.moActive });
    if (G.S.ltLichSu.length > 20) G.S.ltLichSu = G.S.ltLichSu.slice(-20);
    if (G.save) G.save();
    if (U.toast) U.toast('Đã ghi mốc đo: ' + kq.diem + ' điểm, ' + kq.moActive + ' phát hiện đang mở.', 'ok');
    if (G.render) G.render();
  };

  function dmy(ts) { var d = new Date(ts); return ('0' + d.getDate()).slice(-2) + '/' + ('0' + (d.getMonth() + 1)).slice(-2) + ' ' + ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2); }

  /* ═══════════ MÀN ═══════════ */
  G.VIEWS['lien-thong'] = function () {
    if (!(typeof G.can === 'function' && G.can('qt_trang')))
      return U.lockCard('Bảng liên thống & toàn vẹn dữ liệu đo chính sức khoẻ dữ liệu của cả hệ — chỉ Super Admin và Admin hệ thống mở được.');

    var kq = G.ltSoat();
    var mauDiem = kq.diem >= 95 ? '#0B7350' : (kq.diem >= 80 ? '#B4720F' : '#BE0E16');
    var ls = (G.S && G.S.ltLichSu) || [];
    var truoc = ls.length ? ls[ls.length - 1] : null;
    var delta = truoc ? (kq.diem - truoc.diem) : 0;

    var o = U.ph({ eyebrow: 'LIÊN THỐNG & TOÀN VẸN DỮ LIỆU', ic: 'shield', grad: 1,
      t: 'Đo chính xác từng mối nối — rồi xử lý tới khi sạch',
      lead: 'Máy chạy ' + kq.chayDuoc + ' bất biến trên dữ liệu đang nạp: menu↔màn↔quyền, vai↔quyền↔bậc, ' +
        'công việc↔KPI, và con số↔trường. Mỗi phát hiện chỉ đúng chỗ sai và cách xử lý. ' +
        'Đánh dấu đã xử lý để lái số đang mở về 0; ghi mốc đo để thấy cải tiến.' });

    o += '<div class="grid g4 mb">' +
      U.stat({ k: 'Điểm toàn vẹn', v: kq.diem + (delta ? (delta > 0 ? ' ▲' + delta : ' ▼' + (-delta)) : ''), d: kq.diem >= 95 ? 'rất tốt' : (kq.diem >= 80 ? 'cần dọn nốt' : 'có lỗi nặng'), c: mauDiem }) +
      U.stat({ k: 'Bất biến đạt', v: kq.datPhep + '/' + kq.tongPhep, d: kq.tiLe + '% mối nối đúng', c: '#185AB4' }) +
      U.stat({ k: 'Đang mở', v: String(kq.moActive), d: kq.moActive ? 'cần xử lý' : 'đã sạch', c: kq.moActive ? '#BE0E16' : '#0B7350' }) +
      U.stat({ k: 'Đã xử lý', v: String(kq.daXuLy), d: 'đã đánh dấu', c: '#0B7350' }) +
      '</div>';

    o += '<div class="row wrap mb" style="gap:8px">' +
      '<button class="btn pri sm" data-ltghi="1">' + ic('pulse') + 'Ghi mốc đo</button>' +
      '<button class="btn ghost sm" data-ltbaocao="1">' + ic('book') + 'Xuất báo cáo</button>' +
      '<button class="btn ghost sm" data-v="soat-day-du">' + ic('search') + 'Tự soát đầy đủ (từng kho)</button>' +
      '</div>';

    if (ls.length >= 2) {
      o += '<div class="card mb"><div class="tiny up muted mb">CẢI TIẾN QUA CÁC MỐC ĐO</div>' +
        '<div class="lt-sparks">' + ls.slice(-10).map(function (m) {
          var hgt = Math.max(6, Math.round(m.diem * 0.5));
          var c = m.diem >= 95 ? '#0B7350' : (m.diem >= 80 ? '#B4720F' : '#BE0E16');
          return '<div class="lt-spark" title="' + h(dmy(m.luc)) + ': ' + m.diem + ' điểm, ' + m.mo + ' mở">' +
            '<i style="height:' + hgt + 'px;background:' + c + '"></i><span>' + m.diem + '</span></div>';
        }).join('') + '</div></div>';
    }

    /* Từng nhóm bất biến */
    kq.nhom.forEach(function (n) {
      var trang = n.chuaNap ? 'chuaNap' : (n.moN ? 'loi' : 'dat');
      var cc = trang === 'dat' ? '#0B7350' : (trang === 'loi' ? '#BE0E16' : 'var(--ink-4)');
      o += '<section class="lt-nhom" style="--cc:' + cc + '">' +
        '<div class="lt-nhom-h">' +
          '<span class="lt-nhom-ic">' + ic(trang === 'dat' ? 'check' : (trang === 'loi' ? 'alert' : 'lock')) + '</span>' +
          '<div class="grow"><b>' + h(n.ten) + '</b><div class="tiny muted">' + h(n.y) + '</div></div>' +
          '<span class="lt-nhom-dem">' + (n.chuaNap ? 'chưa nạp' : (n.moN ? n.moN + ' phát hiện' : n.datN + '/' + n.tongN + ' đạt')) + '</span>' +
        '</div>';

      if (n.chuaNap) {
        o += '<p class="tiny muted" style="padding:4px 2px">' + h(n.napY || 'Phần dữ liệu này chưa nạp trong phiên hiện tại.') + '</p>';
      } else {
        n.phep.forEach(function (p) {
          var mauP = MUC_MAU[p.muc];
          o += '<div class="lt-phep">' +
            '<div class="lt-phep-h">' +
              '<span class="lt-tron" style="background:' + (p.mo.length ? mauP : '#0B7350') + '"></span>' +
              '<b class="sm">' + h(p.ten) + '</b>' +
              '<span class="chip tiny" style="color:' + mauP + ';border-color:' + mauP + '55">' + MUC_TEN[p.muc] + '</span>' +
              (p.mo.length ? '<span class="chip tiny" style="color:#BE0E16;border-color:#BE0E1655">' + p.mo.length + ' mở</span>'
                           : '<span class="tiny" style="color:#0B7350;font-weight:700">✓ đạt</span>') +
            '</div>';
          if (p.mo.length) {
            o += '<p class="tiny" style="margin:4px 0 7px;color:var(--ink-3)"><b>Cách xử lý:</b> ' + h(p.xl) + '</p>';
            o += p.mo.map(function (l) {
              var key = khoaLoi(p.ma, l.id);
              var moMan = G.manCoThat && G.manCoThat(l.id) ? '<button class="btn ghost sm lt-act" data-v="' + h(l.id) + '">Mở màn</button>' : '';
              return '<div class="lt-loi">' +
                '<div class="lt-loi-mo">' + h(l.mo) + '</div>' +
                '<div class="lt-loi-act">' + moMan +
                  '<button class="btn ghost sm lt-act" data-ltxong="' + h(key) + '">✓ Đã xử lý</button>' +
                  '<button class="btn ghost sm lt-act" data-ltngoaile="' + h(key) + '">Ngoại lệ</button>' +
                '</div></div>';
            }).join('');
          }
          if (p.xong.length) {
            o += '<details class="lt-xong"><summary class="tiny">' + p.xong.length + ' đã xử lý / ngoại lệ</summary>' +
              p.xong.map(function (l) {
                var key = khoaLoi(p.ma, l.id); var st = xlCua(key) || {};
                return '<div class="lt-loi lt-loi-done">' +
                  '<div class="lt-loi-mo">' + (st.trang === 'ngoaile' ? '⚐ ' : '✓ ') + h(l.mo) +
                    (st.ghi ? '<div class="tiny muted" style="margin-top:3px">Lý do: ' + h(st.ghi) + '</div>' : '') + '</div>' +
                  '<div class="lt-loi-act"><button class="btn ghost sm lt-act" data-ltmo="' + h(key) + '">Mở lại</button></div>' +
                '</div>';
              }).join('') + '</details>';
          }
          o += '</div>';
        });
      }
      o += '</section>';
    });

    o += '<p class="tiny muted" style="margin-top:12px;line-height:1.6">' + ic('shield', 'w-3 h-3') +
      ' Màn chỉ ĐO và CHỈ CHỖ SAI; không tự sửa dữ liệu kho. Sửa vẫn qua đúng cửa cũ, rồi quay lại ghi mốc đo mới.</p>';
    return o;
  };

  /* Báo cáo xuất ra để xử lý ngoài (sao chép) */
  G.ltMoBaoCao = function () {
    var kq = G.ltSoat(), d = new Date();
    var t = 'BÁO CÁO LIÊN THỐNG & TOÀN VẸN DỮ LIỆU — GITA 365\n' +
      'Lúc: ' + d.toLocaleString() + '\n' +
      'Điểm toàn vẹn: ' + kq.diem + '/100 · Bất biến đạt: ' + kq.datPhep + '/' + kq.tongPhep +
      ' · Đang mở: ' + kq.moActive + ' · Đã xử lý: ' + kq.daXuLy + '\n' +
      '════════════════════════════════════════════\n';
    kq.nhom.forEach(function (n) {
      t += '\n[' + n.ma + '] ' + n.ten + (n.chuaNap ? ' — (chưa nạp)' : '') + '\n';
      if (n.chuaNap) return;
      n.phep.forEach(function (p) {
        t += '  · ' + p.ten + ' [' + MUC_TEN[p.muc] + ']: ' + (p.mo.length ? (p.mo.length + ' mở') : 'đạt') + '\n';
        p.mo.forEach(function (l) { t += '      - ' + l.mo + '\n'; });
        if (p.mo.length) t += '      → Cách xử lý: ' + p.xl + '\n';
      });
    });
    U.modal(
      '<h2 style="font-size:20px;font-weight:800;margin-bottom:4px">Báo cáo liên thống</h2>' +
      '<p class="sm muted" style="margin-bottom:10px">Chọn tất cả rồi sao chép để xử lý ngoài / gửi đội kỹ thuật.</p>' +
      '<textarea class="inp blk" rows="14" style="resize:vertical;font-family:monospace;font-size:11.5px" readonly onclick="this.select()">' + h(t) + '</textarea>' +
      '<button class="btn ghost blk mt" data-act="dong-modal">Đóng</button>'
    );
  };
})();
