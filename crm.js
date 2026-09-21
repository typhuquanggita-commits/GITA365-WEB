/* ═══════════════════════════════════════════════════════════════
   GITA 365 — MÀN CRM QUẢN TRỊ  (9.99.180)

   Buồng lái quản lý quan hệ khách hàng cho nhân sự. Màn chỉ HIỆN; mọi
   cổng quyền chặn ở máy chủ. Quyền XEM mặc định: R01 Super Admin ·
   R02 Admin hệ thống · R03 Giám đốc (perm crm_view). Super Admin cấp
   thêm/thu hồi cho bộ phận khác ở ngăn "Cấp quyền".

   THIẾT KẾ LẠI 9.99.178: bảng điều khiển khoa học — thẻ chỉ số có sắc
   khí, phễu chặng vẽ thanh theo tỉ lệ, đèn tô màu rõ, bảng sạch. Màu
   truyền qua style nội tuyến; nền/viền lấy token ở style.css.

   MỘT NGUỒN CHẶNG: danh sách chặng lấy TỪ MÁY CHỦ (giaiDoanCoThe) —
   view không chép, không giữ danh sách chặng thứ hai. Phễu tô màu theo
   VỊ TRÍ trong danh sách máy chủ trả về, không theo tên chặng.

   BACKEND: các cửa CRM hiện có ở Cloudflare Workers (may-chu/crm.js);
   Apps Script chưa có. Chưa nối được thì mỗi ngăn nói rõ "cần nối máy
   chủ CRM" — không dựng dữ liệu giả.

   QUY MÔ (9.99.179): 100 Sale · 100.000 khách. Tìm · lọc chặng · phân
   trang đều do MÁY CHỦ làm (crmDanhSach nhận q · chang · trang) — màn
   KHÔNG lọc tại chỗ, không kéo cả trăm nghìn nhà về. G.crmTim giữ ý
   muốn người dùng; trang/số trang đọc từ đáp ứng, không giữ bản thứ hai.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;
G.VIEWS = G.VIEWS || {};

(function () {
  var U = G.U, h = U.h, ic = U.ic;

  var NGAN = [
    {ma: 'bang',    ten: 'Buồng lái',       ic: 'chart'},
    {ma: 'viec',    ten: 'Việc nên làm',    ic: 'target'},
    {ma: 'ds',      ten: 'Danh sách khách', ic: 'users'},
    {ma: 'troly',   ten: 'Trợ lý AI',       ic: 'spark'},
    {ma: 'kpi',     ten: 'Hệ KPI',          ic: 'pulse'},
    {ma: 'quyen',   ten: 'Cấp quyền',       ic: 'lock'},
    {ma: 'quantri', ten: 'Quản trị',        ic: 'shield'},
    {ma: 'luat',    ten: 'Luật',            ic: 'book'}
  ];

  /* Đèn: tên + màu rõ. Ba mã bị cấm không dùng ở đây; đây là màu an toàn. */
  var DEN = {
    XANH: {ten: 'Xanh', mau: '#0B7350'},
    VANG: {ten: 'Vàng', mau: '#B45309'},
    DO:   {ten: 'Đỏ',   mau: '#D11F2A'},
    XAM:  {ten: 'Xám',  mau: '#64708A'}
  };
  /* Bảng màu phễu theo VỊ TRÍ (không theo tên chặng — một nguồn chặng ở máy chủ). */
  var SAC_PHEU = ['#185AB4', '#0B6675', '#5140B4', '#0B7350', '#128A5E', '#B45309', '#64708A', '#7A5AA6'];

  G.crmNgan = G.crmNgan || 'bang';
  G.crmBang = G.crmBang || null;
  G.crmViec = G.crmViec || null;
  G.crmDs = G.crmDs || null;
  G.crmQ = G.crmQ || null;
  G.crmCt = G.crmCt || null;
  /* Tìm/lọc/trang do MÁY CHỦ làm — 100k khách không kéo hết về màn.
     Ba ô này chỉ giữ Ý MUỐN của người dùng để gửi lên; kết quả (trang
     mấy, còn mấy trang) đọc từ đáp ứng, không giữ bản thứ hai. */
  G.crmTim = G.crmTim || {q: '', chang: '', trang: 1};
  G.crmAi = G.crmAi || null;
  G.crmKeHoach = G.crmKeHoach || null;
  G.crmKpi = G.crmKpi || null;
  G.crmKpiTl = G.crmKpiTl || null;
  G.crmQt = G.crmQt || null;

  function veLai() {
    if (!G.S || G.S.view !== 'crm') return;
    if (typeof document === 'undefined' || !document.getElementById('main')) return;
    G.render && G.render();
  }
  function goi(cua, tham, nhan) {
    if (!G.goiMayChu) { nhan({ok: false, error: 'Chưa nối máy chủ.'}); return; }
    G.goiMayChu(cua, tham || {}).then(nhan)
      .catch(function (e) { nhan({ok: false, error: e && e.message}); });
  }
  function val(id) {
    var el = document.getElementById(id);
    return el ? String(el.value || '').trim() : '';
  }
  function tenChang(ma, coThe) {
    var d = (coThe || []).filter(function (x) { return x.ma === ma; })[0];
    return d ? d.ten : (ma || '—');
  }
  function jsstr(s) { return String(s || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'"); }
  function dinhTien(n) {
    n = Number(n) || 0;
    return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  /* Chưa nối máy chủ CRM / chưa đủ quyền — nói rõ, không dựng số giả. */
  function canNoi(so) {
    if (so && so.error && /quyền|permission|cấp/i.test(String(so.error)))
      return U.empty('Chưa đủ quyền', h(so.error));
    return U.empty('Cần nối máy chủ CRM',
      'Ngăn này cần các cửa CRM ở máy chủ. Máy chủ Apps Script hiện chưa có backend CRM — ' +
      'nối vào rồi thì phễu, danh sách và số liệu hiện thẳng ở đây, không dựng số giả.');
  }

  /* ── THÀNH PHẦN THỊ GIÁC ── */
  function denBadge(band) {
    var d = DEN[band] || {ten: band || '—', mau: '#64708A'};
    return '<span class="crm-den" style="background:' + d.mau + '">' + h(d.ten) + '</span>';
  }
  function kpi(nhan, giaTri, mau, phu) {
    return '<div class="crm-kpi" style="border-top-color:' + mau + '">' +
      '<span class="crm-kpi-nhan">' + h(nhan) + '</span>' +
      '<b class="crm-kpi-so">' + h(String(giaTri)) + '</b>' +
      (phu ? '<span class="crm-kpi-phu">' + h(phu) + '</span>' : '') +
      '</div>';
  }
  function pheu(hang) {
    var max = 1;
    hang.forEach(function (c) { if (c.n > max) max = c.n; });
    var o = '<div class="crm-pheu">';
    hang.forEach(function (c, i) {
      var mau = SAC_PHEU[i % SAC_PHEU.length];
      var pct = Math.max(4, Math.round(c.n / max * 100));
      o += '<div class="crm-pheu-hang">' +
        '<span class="crm-pheu-ten">' + h(c.ten) + '</span>' +
        '<span class="crm-pheu-thanh"><i style="width:' + pct + '%;background:' + mau + '"></i></span>' +
        '<b class="crm-pheu-so">' + h(String(c.n)) + '</b>' +
        '</div>';
    });
    o += '</div>';
    return o;
  }

  G.crmMoNgan = function (ma) { G.crmNgan = ma; G.crmCt = null; veLai(); };
  G.crmTaiBang = function () { goi('crmBangDieuKhien', {}, function (x) { G.crmBang = x; veLai(); }); };
  G.crmTaiViec = function () { goi('crmUuTien', {}, function (x) { G.crmViec = x; veLai(); }); };
  G.crmTaiDs = function () {
    var t = G.crmTim;
    goi('crmDanhSach', {q: t.q, chang: t.chang, trang: t.trang}, function (x) {
      G.crmDs = x;
      /* Máy chủ kẹp trang về khoảng hợp lệ — đọc lại con số thật, không tự đoán. */
      if (x && x.ok && x.trang) G.crmTim.trang = x.trang;
      veLai();
    });
  };
  G.crmTimDs = function () {
    G.crmTim.q = val('crm_q');
    G.crmTim.chang = val('crm_loc');
    G.crmTim.trang = 1;      /* đổi tìm/lọc là về trang 1 */
    G.crmDs = null; G.crmTaiDs();
  };
  G.crmTrang = function (delta) {
    var so = G.crmDs; if (!so || !so.ok) return;
    var t = Math.max(1, Math.min(so.soTrang || 1, (G.crmTim.trang || 1) + delta));
    if (t === G.crmTim.trang) return;
    G.crmTim.trang = t; G.crmDs = null; G.crmTaiDs();
  };
  G.crmTaiQuyen = function () { goi('dsQuyenCRM', {}, function (x) { G.crmQ = x; veLai(); }); };
  G.crmTaiAi = function () { goi('crmTroLy', {}, function (x) { G.crmAi = x; veLai(); }); };
  G.crmTaiKpi = function () {
    goi('crmKpiCham', {}, function (x) { G.crmKpi = x; veLai(); });
    goi('crmKpiTroLy', {}, function (x) { G.crmKpiTl = x; veLai(); });
  };
  G.crmTaiQuanTri = function () { goi('crmQuanTri', {}, function (x) { G.crmQt = x; veLai(); }); };
  G.crmMoKhach = function (maKH) { goi('crmChiTiet', {maKH: maKH}, function (x) { G.crmCt = x; veLai(); }); };
  G.crmDongChiTiet = function () { G.crmCt = null; veLai(); };
  G.crmChay = function (ma) {
    goi('crmDieuPhoiAI', {tro: ma}, function (x) {
      if (x && x.ok) { G.crmKeHoach = x.keHoach; veLai(); }
      else U.toast((x && x.error) || 'Không lập được kế hoạch.', 'err');
    });
  };
  G.crmLuu = function (maKH) {
    if (!G.goiMayChu) return;
    var tham = {maKH: maKH, giaiDoan: val('crm_gd'), henTiep: val('crm_hen'), ghiChu: val('crm_ghichu')};
    var pt = document.getElementById('crm_phutrach');
    if (pt) tham.phuTrach = String(pt.value || '').trim();
    G.goiMayChu('crmGhiKhach', tham).then(function (x) {
      if (x && x.ok) { U.toast('Đã lưu.', 'ok'); G.crmDs = null; G.crmMoKhach(maKH); }
      else U.toast((x && x.error) || 'Không lưu được.', 'err');
    });
  };
  G.crmCap = function () {
    if (!G.goiMayChu) return;
    var tham = {username: val('crm_u'), muc: val('crm_muc'), lyDo: val('crm_lydo')};
    G.goiMayChu('capQuyenCRM', tham).then(function (x) {
      if (x && x.ok) { U.toast('Đã cấp quyền CRM.', 'ok'); G.crmQ = null; G.crmTaiQuyen(); }
      else U.toast((x && x.error) || 'Không cấp được.', 'err');
    });
  };
  G.crmThu = function (u) {
    if (!G.goiMayChu) return;
    G.goiMayChu('thuHoiQuyenCRM', {username: u}).then(function (x) {
      if (x && x.ok) { U.toast('Đã thu hồi.', 'ok'); G.crmQ = null; G.crmTaiQuyen(); }
      else U.toast((x && x.error) || 'Không thu được.', 'err');
    });
  };

  /* ── NGĂN 1 · BUỒNG LÁI ── */
  function veBang() {
    var so = G.crmBang;
    if (!so) return '<p class="note"><button class="btn" onclick="G.crmTaiBang()">Tải buồng lái</button></p>';
    if (!so.ok) return canNoi(so);

    var o = U.sec('Buồng lái CRM' + (so.toanBo ? ' — toàn hệ' : ' — phần bạn phụ trách'), h(so.vi || ''));

    o += '<div class="crm-kpis">' +
      kpi('Tổng khách', so.tongKhach, '#185AB4') +
      kpi('Hẹn quá hạn', so.soQuaHan, '#D11F2A', 'chạm ngay') +
      (so.toanBo ? kpi('Chưa có người phụ trách', so.chuaPhuTrach, '#B45309') : '') +
      kpi('Phiếu thu đã duyệt', so.soPhieu, '#0B7350') +
      kpi('Doanh thu', dinhTien(so.doanhThu) + 'đ', '#5140B4') +
      '</div>';

    o += U.sec('Phễu theo chặng', 'Mỗi chặng một sắc; thanh dài theo số nhà. Chặng vắng đọc ra là "không có bước ấy".');
    var tc = (so.theoChang || []).slice();
    if (so.chuaXep) tc = tc.concat([{ten: 'Chưa xếp chặng', n: so.chuaXep}]);
    o += pheu(tc);

    o += U.sec('Phân bố đèn sức khoẻ', 'Xanh khoẻ · Vàng cần để mắt · Đỏ gọi người thật · Xám chưa rõ.');
    o += '<div class="crm-dens">' + (so.theoBand || []).map(function (b) {
      var d = DEN[b.band] || {ten: b.band, mau: '#64708A'};
      return '<div class="crm-den-o" style="border-left-color:' + d.mau + '">' +
        denBadge(b.band) + '<b>' + h(String(b.n)) + '</b><span>nhà</span></div>';
    }).join('') + '</div>';

    if ((so.quaHan || []).length) {
      o += U.sec('Hẹn tiếp đã quá hạn — chạm ngay', '');
      o += U.tbl(['Mã khách', 'Hẹn', 'Chặng', 'Phụ trách', ''],
        so.quaHan.map(function (q) {
          return [h(q.maKH), '<span style="color:#D11F2A;font-weight:600">' + h(q.henTiep) + '</span>',
            h(tenChang(q.giaiDoan, so.theoChang)), h(q.phuTrach || '—'),
            '<button class="btn" onclick="G.crmMoKhach(\'' + jsstr(q.maKH) + '\')">Mở</button>'];
        }));
    }
    return o;
  }

  /* ── NGĂN · VIỆC NÊN LÀM (tầng thông minh) ── */
  function hangViec(ds) {
    return U.tbl(['Nhà', 'Đèn', 'Việc nên làm', 'Cửa', ''],
      ds.map(function (v) {
        var nha = h(v.hoTen || '—') + ' <span class="note">(' + h(v.maKH) + ')</span>';
        if (v.loai === 'quahan' && v.soNgay) nha += ' · <b style="color:#D11F2A">quá ' + h(String(v.soNgay)) + ' ngày</b>';
        var viec = '<b>' + h(v.viec) + '</b><br><span class="note">' + h(v.vi || '') + '</span>';
        return [nha, denBadge(v.band), viec, '<code>' + h(v.cua) + '</code>',
          '<button class="btn" onclick="G.crmMoKhach(\'' + jsstr(v.maKH) + '\')">Mở nhà</button>'];
      }));
  }
  function veUuTien() {
    var so = G.crmViec;
    var o = U.sec('Việc nên làm hôm nay' + (so && so.toanBo ? ' — toàn hệ' : ' — phần bạn phụ trách'),
      'Máy đọc dữ liệu lúc đọc, xếp việc GẤP lên trước, mỗi việc trỏ một cửa thật. ' +
      'Máy đề xuất — người quyết; bấm "Mở nhà" rồi làm qua cửa ấy.');
    if (!so) return o + '<p class="note"><button class="btn" onclick="G.crmTaiViec()">Tải việc nên làm</button></p>';
    if (!so.ok) return o + canNoi(so);

    var d = so.dem || {};
    o += '<div class="crm-kpis">' +
      kpi('Việc GẤP', d.tongGap, '#D11F2A', 'đèn đỏ + hẹn quá hạn') +
      kpi('Đèn đỏ — gọi ngay', d.do, '#D11F2A', 'gọi người thật 24 giờ') +
      kpi('Hẹn quá hạn', d.quaHan, '#B45309') +
      kpi('Việc thường', d.tongThuong, '#185AB4') +
      '</div>';

    if ((so.gap || []).length) {
      o += U.sec('GẤP — làm trước', 'Đèn đỏ phải GỌI người thật (luật buộc, không nhắn); hẹn quá hạn để trôi là mất nhịp.');
      o += hangViec(so.gap);
    } else {
      o += U.sec('GẤP — làm trước', '');
      o += '<p class="note">Không có việc gấp nào. Nhịp đang được giữ tốt.</p>';
    }

    if ((so.thuong || []).length) {
      o += U.sec('Việc thường', 'Giữ nhịp đèn vàng, xếp chặng, gán người phụ trách — làm sau việc gấp.');
      o += hangViec(so.thuong);
    }
    return o;
  }

  /* ── NGĂN 2 · DANH SÁCH KHÁCH ── */
  function veDs() {
    if (G.crmCt) return veChiTiet();
    var so = G.crmDs;
    if (!so) return '<p class="note"><button class="btn" onclick="G.crmTaiDs()">Tải danh sách khách</button></p>';
    if (!so.ok) return canNoi(so);

    var coThe = so.giaiDoanCoThe || [];
    var o = U.sec('Danh sách khách' + (so.toanBo ? ' — toàn hệ' : ' — phần bạn phụ trách'), h(so.vi || ''));

    /* Tìm + lọc + trang do MÁY CHỦ làm — nhập rồi bấm Tìm mới gọi lên,
       không lọc tại màn (100k nhà không kéo hết về). Enter cũng tìm. */
    o += '<div class="row" style="gap:8px;align-items:end;flex-wrap:wrap">' +
      '<label>Tìm (mã · tên · điện thoại)<br><input id="crm_q" value="' + h(G.crmTim.q) +
        '" placeholder="gõ rồi Enter" onkeydown="if(event.key===\'Enter\')G.crmTimDs()"></label>' +
      '<label>Lọc theo chặng<br><select id="crm_loc" onchange="G.crmTimDs()">' +
      '<option value="">Tất cả</option>' +
      coThe.map(function (g) {
        return '<option value="' + h(g.ma) + '"' + (G.crmTim.chang === g.ma ? ' selected' : '') +
          '>' + h(g.ten) + '</option>';
      }).join('') + '</select></label>' +
      '<button class="btn btn-chinh" onclick="G.crmTimDs()">Tìm</button></div>';

    var ds = so.khach || [];
    var tong = so.tongTatCa || 0;
    var tuSo = tong ? ((so.trang - 1) * so.moiTrang + 1) : 0;
    var denSo = (so.trang - 1) * so.moiTrang + ds.length;
    o += '<p class="note">' + (tong
      ? 'Có <b>' + h(String(tong)) + '</b> nhà khớp · đang xem ' + h(String(tuSo)) + '–' +
        h(String(denSo)) + ' (trang ' + h(String(so.trang)) + '/' + h(String(so.soTrang)) + ')'
      : 'Không có nhà nào khớp' + (G.crmTim.q || G.crmTim.chang ? ' bộ tìm/lọc.' : '.')) + '</p>';

    if (!ds.length) return o;

    o += U.tbl(['Mã', 'Phụ huynh', 'Tầng', 'Đèn', 'Chặng', 'Hẹn tiếp', 'Phụ trách', ''],
      ds.map(function (k) {
        return [h(k.maKH), h(k.hoTen || '—'), '<b>' + h(String(k.tang)) + '</b>', denBadge(k.band),
          h(tenChang(k.giaiDoan, coThe)), h(k.henTiep || '—'), h(k.phuTrach || '—'),
          '<button class="btn" onclick="G.crmMoKhach(\'' + jsstr(k.maKH) + '\')">Mở</button>'];
      }));

    /* Nút chuyển trang — chỉ hiện khi có nhiều hơn một trang. */
    if ((so.soTrang || 1) > 1) {
      o += '<div class="row" style="gap:8px;align-items:center;justify-content:center;margin-top:12px">' +
        '<button class="btn"' + (so.trang <= 1 ? ' disabled' : '') +
          ' onclick="G.crmTrang(-1)">← Trang trước</button>' +
        '<span class="note">Trang ' + h(String(so.trang)) + '/' + h(String(so.soTrang)) + '</span>' +
        '<button class="btn"' + (so.trang >= so.soTrang ? ' disabled' : '') +
          ' onclick="G.crmTrang(1)">Trang sau →</button>' +
        '</div>';
    }
    return o;
  }

  /* ── CHI TIẾT MỘT KHÁCH ── */
  function veChiTiet() {
    var so = G.crmCt;
    if (!so) return '';
    if (!so.ok) {
      return U.sec('Chi tiết khách', '') + U.empty('Không mở được', h(so.error || '')) +
        '<p class="note"><button class="btn" onclick="G.crmDongChiTiet()">← Về danh sách</button></p>';
    }
    var k = so.khach, cr = so.crm || {}, coThe = so.giaiDoanCoThe || [];
    var suaDuoc = so.muc === 'sua' || so.muc === 'quanly';
    var quanLy = so.muc === 'quanly';

    var o = '<p class="note"><button class="btn" onclick="G.crmDongChiTiet()">← Về danh sách</button></p>';
    o += U.sec(h(k.hoTen || k.maKH), 'Mã ' + h(k.maKH) + ' · tuyến ' + h(k.tuyen) + ' · tầng ' + k.tang);
    o += U.tbl(['Trường', 'Giá trị'], [
      ['Phụ huynh', h(k.hoTen || '—')],
      ['Điện thoại', h(k.dienThoai || '—')],
      ['Email', h(k.email || '—')],
      ['Đèn', denBadge(k.band)],
      ['Coach', h(k.coach || '—')],
      ['Tư vấn', h(k.tuVan || '—')],
      ['Trạng thái học', h(k.trangThai || '—')],
      ['Phiếu thu đã duyệt', String(so.thu.soPhieu) + ' · ' + dinhTien(so.thu.tong) + 'đ']
    ]);

    if (suaDuoc) {
      o += U.sec('Cập nhật CRM', quanLy
        ? 'Quản lý: đổi được cả người phụ trách.'
        : 'Đổi chặng · hẹn tiếp · ghi chú cho nhà bạn phụ trách. Gán người phụ trách là việc của quản lý.');
      o += '<div class="row" style="flex-direction:column;gap:10px;max-width:520px">';
      o += '<label>Chặng<br><select id="crm_gd">' +
        '<option value="">— chưa xếp —</option>' +
        coThe.map(function (g) {
          return '<option value="' + h(g.ma) + '"' + (cr.giaiDoan === g.ma ? ' selected' : '') +
            '>' + h(g.ten) + '</option>';
        }).join('') + '</select></label>';
      o += '<label>Hẹn tiếp (YYYY-MM-DD)<br><input id="crm_hen" type="date" value="' +
        h((cr.henTiep || '').slice(0, 10)) + '"></label>';
      if (quanLy)
        o += '<label>Người phụ trách (tên đăng nhập)<br><input id="crm_phutrach" value="' +
          h(cr.phuTrach || '') + '" placeholder="để trống là bỏ phụ trách"></label>';
      o += '<label>Ghi chú<br><textarea id="crm_ghichu" rows="3">' + h(cr.ghiChu || '') + '</textarea></label>';
      o += '<div><button class="btn btn-chinh" onclick="G.crmLuu(\'' + jsstr(k.maKH) + '\')">Lưu</button></div>';
      o += '</div>';
    }

    o += U.sec('Hai mươi lượt chạm gần nhất', 'Đọc thẳng sổ chăm — nối bằng maNha.');
    if ((so.soCham || []).length)
      o += U.tbl(['Ngày', 'Kiểu', 'Đèn', 'Nội dung', 'Người chạm'],
        so.soCham.map(function (s) {
          return [h(s.ngay), h(s.kieu), denBadge(s.denLuc), h(s.noiDung), h(s.boiAi)];
        }));
    else o += '<p class="note">Chưa có lượt chạm nào trong sổ.</p>';
    return o;
  }

  /* ── NGĂN · TRỢ LÝ AI ── */
  function veTroLy() {
    var so = G.crmAi;
    var o = U.sec('Mười trợ lý AI CRM + một AI tài chính',
      'Mỗi trợ lý TRỎ vào một cửa CÓ THẬT và đi qua cổng của cửa ấy — AI giúp vận hành, ' +
      'cổng không đổi. Điều phối chỉ lập KẾ HOẠCH rồi dừng, không tự ra tay.');
    if (!so) return o + '<p class="note"><button class="btn" onclick="G.crmTaiAi()">Tải trợ lý</button></p>';
    if (!so.ok) return o + canNoi(so);

    o += U.tbl(['Mã', 'Trợ lý', 'Việc', 'Cửa thật', 'Cổng đang áp', ''],
      (so.troLy || []).map(function (t) {
        var cua = t.coCua ? '<code>' + h(t.cua) + '</code>'
          : '<code>' + h(t.cua) + '</code> <em>(cửa lạ!)</em>';
        var nut = t.coCua
          ? '<button class="btn" onclick="G.crmChay(\'' + jsstr(t.ma) + '\')">Lập kế hoạch</button>' : '—';
        var dau = t.nhom === 'taichinh' ? ' 💰' : (t.nhom === 'khoahoc' ? ' 🔬' : '');
        return [h(t.ma) + dau, h(t.ten), h(t.viec), cua, h(t.cong), nut];
      }));

    if (G.crmKeHoach) {
      var k = G.crmKeHoach;
      o += U.sec('Kế hoạch điều phối gần nhất', '');
      o += U.tbl(['Trường', 'Giá trị'], [
        ['Trợ lý', h(k.ten) + ' (' + h(k.tro) + ')'],
        ['Việc', h(k.viec)],
        ['Gọi cửa', '<code>' + h(k.cua) + '</code>'],
        ['Cổng áp', h(k.cong)]
      ]);
      o += '<p class="note">Điều phối KHÔNG chạy việc — nó chỉ chỉ đường. Việc thật gọi đúng ' +
        'cửa ấy, và cửa ấy tự kiểm cổng.</p>';
    }

    o += U.sec('Năm luật của tầng trợ lý AI', '');
    o += U.tbl(['Mã', 'Luật'], (so.luat || []).map(function (l) { return [h(l.ma), h(l.luat)]; }));
    return o;
  }

  /* ── NGĂN · KPI ── */
  function veKpi() {
    var so = G.crmKpi;
    var o = U.sec('KPI chuẩn cho Agent CRM',
      'Tám KPI máy đo tính LÚC ĐỌC từ sổ thật; ba KPI người khai để riêng, không con số giả. ' +
      'KHÔNG ngưỡng — đặt chỉ tiêu là mời chạy cho đủ số. Ngưỡng là Vùng Đỏ chờ chủ hệ.');
    if (!so) return o + '<p class="note"><button class="btn" onclick="G.crmTaiKpi()">Tải KPI</button></p>';
    if (!so.ok) return o + canNoi(so);

    o += U.tbl(['Mã', 'KPI', 'Ai đo', 'Giá trị', 'Chiều', 'Nguồn'],
      (so.bang || []).map(function (k) {
        var gt = k.ai === 'mayDo'
          ? (k.giaTri === null || k.giaTri === undefined ? '<em>chưa đo được</em>' : '<b>' + h(String(k.giaTri)) + '</b>')
          : '<em>' + h(k.khai || 'người khai') + '</em>';
        return [h(k.ma), h(k.ten), k.ai === 'mayDo' ? 'máy' : 'người', gt, h(k.chieu), h(k.nguon)];
      }));

    var tl = G.crmKpiTl;
    if (tl && tl.ok) {
      o += U.sec('Hoạt động theo từng trợ lý AI', h(tl.vi || ''));
      if ((tl.theoTroLy || []).length)
        o += U.tbl(['Trợ lý', 'Lượt điều phối'],
          tl.theoTroLy.map(function (t) { return [h(t.tro), String(t.soLuot)]; }));
      else o += '<p class="note">Chưa có lượt điều phối nào được ghi.</p>';
    }

    o += U.sec('Năm luật của hệ KPI', '');
    o += U.tbl(['Mã', 'Luật'], (so.luat || []).map(function (l) { return [h(l.ma), h(l.luat)]; }));
    return o;
  }

  /* ── NGĂN · QUẢN TRỊ (Super Admin) ── */
  function veQuanTri() {
    var so = G.crmQt;
    var o = U.sec('Quản trị CRM — Super Admin',
      'Cấp quyền ở ngăn "Cấp quyền"; vận hành ở đây. Mọi thao tác CRM đã vào nhật ký kèm tên ' +
      'người làm — panel này gom lại, không dựng sổ vết thứ hai.');
    if (!so) return o + '<p class="note"><button class="btn" onclick="G.crmTaiQuanTri()">Tải quản trị</button></p>';
    if (!so.ok) return o + canNoi(so);

    var t = so.tomTat || {};
    o += '<div class="crm-kpis">' +
      kpi('Quyền đang có', t.quyenDangCo, '#185AB4') +
      kpi('Lượt cấp quyền', t.capQuyen, '#0B7350') +
      kpi('Lượt thu hồi', t.thuHoiQuyen, '#B45309') +
      kpi('Lượt đọc hồ sơ', t.luotDoc, '#5140B4') +
      kpi('Lượt cập nhật', t.luotCapNhat, '#0B6675') +
      kpi('Điều phối AI', t.dieuPhoiAI, '#128A5E') +
      '</div>';

    o += U.sec('Nhật ký thao tác CRM gần nhất', '');
    if ((so.nhatKy || []).length)
      o += U.tbl(['Lúc', 'Người', 'Việc', 'Đối tượng', 'Chi tiết'],
        so.nhatKy.map(function (r) {
          return [h((r.luc || '').slice(0, 19).replace('T', ' ')), h(r.ai || '—'),
            h(r.viec), h(r.doiTuong || '—'), h(r.chiTiet || '')];
        }));
    else o += '<p class="note">Chưa có thao tác nào trong nhật ký.</p>';
    return o;
  }

  /* ── NGĂN 3 · CẤP QUYỀN ── */
  function veQuyen() {
    var so = G.crmQ;
    var o = U.sec('Cấp quyền CRM — Super Admin cấp cho bộ phận khác',
      'Mặc định ba vai đầu XEM được: Super Admin · Admin hệ thống · Giám đốc. Muốn mở cho bộ phận ' +
      'khác (coach, tư vấn…) thì cấp ở đây. Ba mức: xem · sửa · quản lý. Không ai tự cấp cho mình.');
    if (!so) return o + '<p class="note"><button class="btn" onclick="G.crmTaiQuyen()">Tải sổ quyền</button></p>';
    if (!so.ok) return o + canNoi(so);

    o += '<div class="row" style="flex-direction:column;gap:10px;max-width:520px">';
    o += '<label>Tên đăng nhập (hoặc email)<br><input id="crm_u" placeholder="vd: coach.an"></label>';
    o += '<label>Mức quyền<br><select id="crm_muc">' +
      (so.mucCoThe || []).map(function (m) {
        return '<option value="' + h(m.ma) + '">' + h(m.ten) + ' — ' + h(m.vi) + '</option>';
      }).join('') + '</select></label>';
    o += '<label>Vì sao cấp<br><input id="crm_lydo" placeholder="một câu, để sang năm còn dựng lại được"></label>';
    o += '<div><button class="btn btn-chinh" onclick="G.crmCap()">Cấp quyền</button></div>';
    o += '</div>';

    o += U.sec('Đang có quyền (ngoài ba vai mặc định)', h(so.vi || ''));
    var dc = so.dangCoQuyen || [];
    if (dc.length)
      o += U.tbl(['Người', 'Mức', 'Vì sao', 'Cấp bởi', 'Hết hạn', ''],
        dc.map(function (q) {
          return [h(q.username), h(q.tenMuc), h(q.lyDo), h(q.boiAi), h(q.hetHan || '—'),
            '<button class="btn" onclick="G.crmThu(\'' + jsstr(q.username) + '\')">Thu hồi</button>'];
        }));
    else o += '<p class="note">Chưa cấp thêm cho ai ngoài ba vai mặc định (Super Admin · Admin hệ thống · Giám đốc).</p>';
    return o;
  }

  /* ── NGĂN 4 · LUẬT ── */
  function veLuat() {
    var o = U.sec('Ai xem được CRM', '');
    o += U.tbl(['Vai', 'Mặc định', 'Quyền'], [
      ['Super Admin (R01)', '<b style="color:#0B7350">Có</b>', 'Xem · sửa · quản lý · cấp/thu quyền'],
      ['Admin hệ thống (R02)', '<b style="color:#0B7350">Có</b>', 'Quản lý'],
      ['Giám đốc (R03)', '<b style="color:#0B7350">Có</b>', 'Quản lý'],
      ['Bộ phận khác', '<span style="color:#B45309">Khi được cấp</span>', 'Super Admin cấp ở ngăn "Cấp quyền"'],
      ['Khách (R13–R15)', '<b style="color:#D11F2A">Không</b>', 'Không xem được CRM']
    ]);

    o += U.sec('Bốn luật của CRM', '');
    o += U.tbl(['Luật', 'Nội dung'], [
      ['TRỎ, không chép',
        'Dữ liệu khách sống ở hoSoKhach · users · soCham · phieuThu. CRM chỉ thêm lớp phủ ' +
        '(ai phụ trách · chặng · hẹn tiếp) và gom về một chỗ — không bảng khách thứ hai.'],
      ['Quyền tính lúc đọc',
        'Ba vai đầu xem đương nhiên; cấp thêm bằng một dòng ghi được, đọc dòng mới nhất còn hiệu lực ' +
        '— không cột "đang có quyền". Chỉ Super Admin cấp, không ai tự cấp cho mình.'],
      ['Lọc ở câu truy vấn',
        'Người mức xem/sửa chỉ thấy khách MÌNH phụ trách/coach/tư vấn — lọc ở máy chủ, không ở màn. ' +
        'Lọc trên màn không phải bảo vệ dữ liệu.'],
      ['Xem nội bộ được, ra ngoài thì không',
        'Nhân sự đọc khách để làm việc là hợp lệ (Điều 13 cấm dữ liệu RỜI HỆ, không cấm đọc nội bộ). ' +
        'Mỗi lượt đọc vào nhật ký; băm mật khẩu không bao giờ trả về.']
    ]);
    return o;
  }

  G.VIEWS['crm'] = function () {
    var o = '<div class="hd"><h2>' + ic('users') + ' CRM · quản lý quan hệ khách hàng</h2>' +
      '<p class="sub">Buồng lái của nhân sự: phễu theo chặng, hẹn tiếp không để trôi, doanh thu ' +
      'theo phần mình phụ trách, và một chỗ đọc trọn một nhà. Mặc định: Super Admin · Admin hệ thống · ' +
      'Giám đốc; Super Admin cấp thêm cho bộ phận khác.</p></div>';

    o += '<div class="tabs">' + NGAN.map(function (n) {
      return '<button class="tab' + (G.crmNgan === n.ma ? ' on' : '') + '" onclick="G.crmMoNgan(\'' +
        n.ma + '\')">' + ic(n.ic) + ' ' + h(n.ten) + '</button>';
    }).join('') + '</div>';

    if (G.crmNgan === 'bang') { o += veBang(); if (!G.crmBang) setTimeout(G.crmTaiBang, 0); }
    else if (G.crmNgan === 'viec') { o += veUuTien(); if (!G.crmViec) setTimeout(G.crmTaiViec, 0); }
    else if (G.crmNgan === 'ds') { o += veDs(); if (!G.crmDs && !G.crmCt) setTimeout(G.crmTaiDs, 0); }
    else if (G.crmNgan === 'troly') { o += veTroLy(); if (!G.crmAi) setTimeout(G.crmTaiAi, 0); }
    else if (G.crmNgan === 'kpi') { o += veKpi(); if (!G.crmKpi) setTimeout(G.crmTaiKpi, 0); }
    else if (G.crmNgan === 'quyen') { o += veQuyen(); if (!G.crmQ) setTimeout(G.crmTaiQuyen, 0); }
    else if (G.crmNgan === 'quantri') { o += veQuanTri(); if (!G.crmQt) setTimeout(G.crmTaiQuanTri, 0); }
    else o += veLuat();
    return o;
  };
})();
