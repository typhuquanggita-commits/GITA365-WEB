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

   BACKEND: các cửa CRM ở Cloudflare Workers (may-chu/crm.js). Chưa nối
   được thì mỗi ngăn nói rõ "cần nối máy chủ CRM" — không dựng dữ liệu giả.

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
    {ma: 'hoat-dong', ten: 'Hoạt động',     ic: 'map'},
    {ma: 'duong-ong', ten: 'Đường ống',     ic: 'orbit'},
    {ma: 'bang',    ten: 'Buồng lái',       ic: 'chart'},
    {ma: 'viec',    ten: 'Việc nên làm',    ic: 'target'},
    {ma: 'ds',      ten: 'Danh sách khách', ic: 'users'},
    {ma: 'cohoi',   ten: 'Cơ hội',          ic: 'compass'},
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
  /* Bảng màu phễu theo VỊ TRÍ (không theo tên chặng — một nguồn chặng ở máy chủ).
     9.99.238: hoà sắc lại thành một dải LẠNH cân đối (xanh → lam thép → chàm →
     một xanh lá → xám lam) — bỏ nâu/cam chói để không rối mắt, giữ đủ phân biệt
     tám bước. Sắc thương hiệu làm trục. */
  var SAC_PHEU = ['#2A72C6', '#185AB4', '#3E7CA8', '#0B6675', '#3F52A6', '#5140B4', '#0B7350', '#5B6B8C'];

  G.crmNgan = G.crmNgan || 'hoat-dong';
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
  G.crmCoHoiData = G.crmCoHoiData || null;

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
      'Ngăn này cần các cửa CRM ở máy chủ. Máy chủ Cloudflare Worker chưa nối backend CRM — ' +
      'nối vào rồi thì phễu, danh sách và số liệu hiện thẳng ở đây, không dựng số giả.');
  }

  /* ── THÀNH PHẦN THỊ GIÁC ── */
  function denBadge(band) {
    var d = DEN[band] || {ten: band || '—', mau: '#64708A'};
    return '<span class="crm-den" style="background:' + d.mau + '">' + h(d.ten) + '</span>';
  }
  /* Nhãn CHẶNG có màu (kiểu bảng Deals của FAST/Zoho): mỗi chặng một sắc,
     đọc ra trạng thái ngay không phải dò chữ. Chặng lạ (máy chủ trả về) thì
     băm tên vào bảng màu để vẫn có màu ổn định. */
  var CHANG_MAU = {
    'Vào phễu': '#64708A', 'Tiếp cận': '#185AB4', 'Tư vấn': '#0B6675', 'Cơ hội': '#5140B4',
    'Báo giá': '#7A5AA6', 'Chốt': '#0B7350', 'Vận hành': '#128A5E', 'Giữ nhịp': '#0B7350'
  };
  function changBadge(ten) {
    ten = ten || '—';
    var c = CHANG_MAU[ten];
    if (!c) { var s = 0; for (var i = 0; i < ten.length; i++) s += ten.charCodeAt(i); c = SAC_PHEU[s % SAC_PHEU.length]; }
    return '<span class="crm-stage" style="--sc:' + c + '">' + h(ten) + '</span>';
  }
  function tienO(v) { return '<span class="crm-tien">' + h(v) + '</span>'; }

  /* ── MÁY TỰ KIỂM 3 LƯỢT ──────────────────────────────────────────────
     Một con số quan trọng được tính LẠI ở ba chặng độc lập: lúc NHẬP (từ
     dữ liệu thô), lúc XỬ LÝ (tổng hợp), lúc RA KẾT QUẢ (số hiện trên buồng
     lái). Khớp CẢ BA mới báo "đạt". Lệch ở đâu thì chỉ ra đúng chặng ấy —
     đây là chỗ bắt lỗi im lặng khi một nơi sửa mà nơi khác quên.
     `cac` = [{ten, v(số), hienthi, mo}]. So khớp theo dung sai 1 đồng. */
  function kiem3(nhan, cac) {
    var lech = -1;
    for (var i = 1; i < cac.length; i++) {
      if (Math.abs((cac[i].v || 0) - (cac[i - 1].v || 0)) >= 1) { lech = i; break; }
    }
    var dat = lech < 0;
    var o = '<div class="k3"><div class="k3-dau">' + ic('shield', 'w-4 h-4') +
      '<b>Máy tự kiểm 3 lượt · ' + h(nhan) + '</b>' +
      '<span class="k3-kl ' + (dat ? 'dat' : 'lech') + '">' +
        (dat ? ic('check', 'w-3 h-3') + ' Khớp cả 3 — ĐẠT'
             : ic('x', 'w-3 h-3') + ' Lệch ở lượt ' + (lech + 1)) + '</span></div>';
    o += '<div class="k3-hang">';
    cac.forEach(function (x, i) {
      var khop = i === 0 || Math.abs((x.v || 0) - (cac[i - 1].v || 0)) < 1;
      o += '<div class="k3-o' + (khop ? '' : ' lech') + '">' +
        '<span class="k3-so">' + (i + 1) + '</span>' +
        '<div class="k3-noidung"><b>' + h(x.ten) + '</b>' +
        '<div class="k3-v">' + h(x.hienthi) + '</div>' +
        '<div class="k3-mo">' + h(x.mo) + '</div></div></div>';
      if (i < cac.length - 1)
        o += '<div class="k3-noi' + (khop && (i + 1) !== lech ? '' : ' x') + '">' +
          ((i + 1) === lech ? '≠' : '=') + '</div>';
    });
    o += '</div></div>';
    return o;
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
  G.crmTaiCoHoi = function () { goi('crmCoHoi', {}, function (x) { G.crmCoHoiData = x; veLai(); }); };
  G.crmLuuCoHoi = function () {
    if (!G.goiMayChu) return;
    var tham = {maKH: val('ch_makh'), ten: val('ch_ten'),
      giaTri: Number(String(val('ch_giatri')).replace(/[^\d]/g, '')) || 0,
      giaiDoan: val('ch_gd'), duKienChot: val('ch_chot')};
    if (!tham.maKH) { U.toast('Nhập mã khách hàng (vd: GITA-0151).', 'err'); return; }
    if (!tham.ten) { U.toast('Nhập tên cơ hội.', 'err'); return; }
    if (tham.giaTri <= 0) { U.toast('Nhập giá trị dự kiến (đồng).', 'err'); return; }
    G.goiMayChu('crmGhiCoHoi', tham).then(function (x) {
      if (x && x.ok) { U.toast('Đã ghi cơ hội.', 'ok'); G.crmCoHoiData = null; G.crmTaiCoHoi(); }
      else U.toast((x && x.error) || 'Không ghi được cơ hội.', 'err');
    });
  };
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

  /* ── BUỒNG LÁI MINH HOẠ — xem trước bố cục & DÒNG CHẢY khi chưa nối máy chủ ──
     Chủ hệ cần "nhìn thấy dòng chảy công việc" ngay. Chưa nối backend CRM
     thì thay khung trống bằng một buồng lái MINH HOẠ, có dải nói thẳng đây
     là số minh hoạ — nối máy chủ thì mọi số tự thay bằng số thật. */
  function veBangMinhHoa() {
    var o = U.bdNguon(false);
    o += U.bdSoHang([
      {k:'Tổng khách', v:'1.284', c:'var(--gita)', d:'đang đồng hành'},
      {k:'Khách mới tháng', v:'96', c:'var(--gita-sang)', xu:12},
      {k:'Hẹn quá hạn', v:'7', c:'var(--gita-do)', d:'chạm ngay', tot:false},
      {k:'Chốt hợp đồng', v:'38', c:'var(--ok)', xu:8},
      {k:'Giữ nhịp 90 ngày', v:'82%', c:'var(--gita-sau)', d:'ở lại đủ chặng đầu'},
      {k:'Doanh thu tháng', v:'1,95 tỷ', c:'var(--gold-2)', xu:4}
    ]);
    o += U.bdViec([
      {muc:'khan',ten:'Nhà Khánh Vy — đèn đỏ, gọi trong 24h',phu:'3 ngày chưa liên hệ · Minh phụ trách',nhan:'khẩn'},
      {muc:'khan',ten:'3 hẹn tiếp quá hạn hôm nay',phu:'chạm ngay kẻo nguội',nhan:'khẩn'},
      {muc:'luuy',ten:'Nhà Bảo Châu — chờ chốt hợp đồng',phu:'đã tư vấn xong Tầng 4',nhan:'lưu ý'},
      {muc:'nhac',ten:'1 nhà chưa có người phụ trách',phu:'Nhà Quốc Bảo mới vào phễu',nhan:'nhắc'}
    ], {tieuDe:'Việc cần xử lý ngay', phu:'xếp theo mức khẩn'});
    o += U.sec('DÒNG CHẢY VẬN HÀNH A → Z','Một nhà đi từ lúc vào phễu tới lúc giữ nhịp — mỗi cột một chặng, mỗi ô một việc');
    o += U.bdDong([
      {ten:'1 · Vào phễu', mau:'var(--gita)', o:[{t:'Khách mới',p:'từ kênh · giới thiệu'},{t:'Gán người phụ trách'}]},
      {ten:'2 · Tiếp cận', mau:'var(--gita-sang)', o:[{t:'Gọi · nhắn trong 24h'},{t:'Đặt đèn sức khoẻ'}]},
      {ten:'3 · Tư vấn', mau:'var(--gita-sau)', o:[{t:'Hiểu nhu cầu nhà'},{t:'Đề xuất lộ trình tầng'}]},
      {ten:'4 · Chốt', mau:'var(--ok)', o:[{t:'Ký hợp đồng',p:'phiếu thu · duyệt'},{t:'Vào lịch thu'}]},
      {ten:'5 · Vận hành 365', mau:'var(--gita-ink)', o:[{t:'Onboarding 5 bước'},{t:'Đồng hành theo nhịp'}]},
      {ten:'6 · Giữ & nâng', mau:'var(--gold-2)', o:[{t:'Đèn đỏ gọi người thật'},{t:'Mời nâng tầng đúng lúc'}]}
    ], {chu:'Đây chính là "hệ vận hành riêng biệt từ A–Z": mỗi cột trỏ vào một cửa CRM thật ở máy chủ khi đã nối.'});
    o += '<div class="grid g2">'+
      '<div>'+U.sec('PHỄU THEO CHẶNG','Thu hẹp dần · số bên phải là tỷ lệ chuyển')+
        U.bdPhieu([{ten:'Vào phễu',so:1284},{ten:'Tiếp cận',so:940},{ten:'Tư vấn',so:520},
                   {ten:'Chốt',so:210},{ten:'Vận hành',so:168},{ten:'Giữ nhịp',so:138}])+'</div>'+
      '<div>'+U.sec('PHÂN BỐ ĐÈN SỨC KHOẺ','Xanh khoẻ · Vàng để mắt · Đỏ gọi ngay · Xám chưa rõ')+
        U.bdVong([{ten:'Xanh',gia:812,mau:'var(--ok)'},{ten:'Vàng',gia:296,mau:'var(--warn)'},
                  {ten:'Đỏ',gia:64,mau:'var(--gita-do)'},{ten:'Xám',gia:112,mau:'#64708A'}],
                 {giua:'1.284',duoi:'nhà'})+'</div>'+
      '</div>';
    o += U.sec('DOANH THU 6 THÁNG','Cột theo tháng — nhìn nhịp lên xuống');
    o += U.bdCot([{nhan:'T4',a:1520e6},{nhan:'T5',a:1680e6},{nhan:'T6',a:1740e6},
                  {nhan:'T7',a:1610e6},{nhan:'T8',a:1880e6},{nhan:'T9',a:1950e6}]);
    return o;
  }

  /* ── DỮ LIỆU MINH HOẠ CHUNG cho các ngăn khi chưa nối máy chủ ──
     Để CRM đi được A→Z ngay: danh sách khách, việc nên làm, KPI đều xem
     trước được. Nối máy chủ thì số thật thay số minh hoạ. */
  var KH_MAU = [
    {ma:'GITA-0148',ten:'Nhà Minh An',chang:'Tư vấn',den:'XANH',pt:'Thu',hen:'28/09',dt:'12,0tr'},
    {ma:'GITA-0151',ten:'Nhà Bảo Châu',chang:'Chốt',den:'VANG',pt:'Hà',hen:'26/09',dt:'30,0tr'},
    {ma:'GITA-0155',ten:'Nhà Gia Hưng',chang:'Vận hành',den:'XANH',pt:'Thu',hen:'02/10',dt:'10,0tr'},
    {ma:'GITA-0160',ten:'Nhà Khánh Vy',chang:'Tiếp cận',den:'DO',pt:'Minh',hen:'25/09',dt:'—'},
    {ma:'GITA-0162',ten:'Nhà Đăng Khoa',chang:'Giữ nhịp',den:'XANH',pt:'Hà',hen:'05/10',dt:'100,0tr'},
    {ma:'GITA-0167',ten:'Nhà Thảo Nguyên',chang:'Tư vấn',den:'VANG',pt:'Minh',hen:'27/09',dt:'—'},
    {ma:'GITA-0170',ten:'Nhà Quốc Bảo',chang:'Vào phễu',den:'XAM',pt:'—',hen:'—',dt:'—'},
    {ma:'GITA-0173',ten:'Nhà Phương Linh',chang:'Chốt',den:'XANH',pt:'Thu',hen:'29/09',dt:'30,0tr'}
  ];
  function dsMinhHoa() {
    var o = U.bdNguon(false);
    o += U.sec('Danh sách khách — quản lý A→Z','Tìm · lọc chặng · mở trọn một nhà · giao việc — nối máy chủ thì chạy trên 100.000 khách thật');
    o += '<div class="crm-kpis">'+ kpi('Đang hiển thị', KH_MAU.length, '#185AB4')+
      kpi('Đèn đỏ cần gọi', KH_MAU.filter(function(k){return k.den==='DO';}).length, '#D11F2A','gọi ngay')+
      kpi('Chưa phụ trách', KH_MAU.filter(function(k){return k.pt==='—';}).length, '#B45309')+'</div>';
    o += U.tbl(['Mã','Nhà','Chặng','Đèn','Phụ trách','Hẹn tiếp','Doanh thu',''],
      KH_MAU.map(function(k){
        return ['<span class="mono">'+h(k.ma)+'</span>','<b class="sm">'+h(k.ten)+'</b>',
          changBadge(k.chang), denBadge(k.den), h(k.pt),
          (k.hen==='—'?'—':'<span style="color:'+(k.den==='DO'?'#D11F2A':'var(--ink-2)')+'">'+h(k.hen)+'</span>'),
          tienO(k.dt),
          '<button class="btn" disabled title="Nối máy chủ để mở hồ sơ nhà">Mở nhà</button>'];
      }));
    o += '<p class="note mt">Bấm "Mở nhà" khi đã nối máy chủ để xem trọn hồ sơ: nhịp, ghi chú, lịch hẹn, phiếu thu, lịch sử chạm.</p>';
    return o;
  }
  function viecMinhHoa() {
    var o = U.bdNguon(false);
    o += U.sec('Việc nên làm hôm nay','Máy xếp việc GẤP lên trước, mỗi việc trỏ một cửa thật');
    var ds = [
      {nha:'Nhà Khánh Vy (GITA-0160)',den:'DO',viec:'Gọi trong 24h — nhà đèn đỏ',vi:'3 ngày chưa liên hệ',cua:'ghiCham'},
      {nha:'Nhà Bảo Châu (GITA-0151)',den:'VANG',viec:'Chốt hợp đồng Tầng 4',vi:'đã tư vấn xong, chờ quyết',cua:'phieuThu'},
      {nha:'Nhà Thảo Nguyên (GITA-0167)',den:'VANG',viec:'Gửi lộ trình tầng phù hợp',vi:'đang phân vân gói',cua:'guiLoTrinh'},
      {nha:'Nhà Quốc Bảo (GITA-0170)',den:'XAM',viec:'Gán người phụ trách',vi:'mới vào phễu, chưa ai nhận',cua:'ganPhuTrach'}
    ];
    o += U.tbl(['Nhà','Đèn','Việc nên làm','Cửa',''], ds.map(function(v){
      return [h(v.nha)+' <br><span class="note">'+h(v.vi)+'</span>', denBadge(v.den),
        '<b class="sm">'+h(v.viec)+'</b>','<code>'+h(v.cua)+'</code>',
        '<button class="btn" disabled>Mở nhà</button>'];
    }));
    return o;
  }
  function kpiMinhHoa() {
    var o = U.bdNguon(false);
    o += U.sec('KPI CRM','Số đo hiệu quả đội — nối máy chủ thì tính trên dữ liệu thật');
    o += U.bdSoHang([
      {k:'Khách mới tháng',v:'96',c:'var(--gita)',xu:12},
      {k:'Tỷ lệ chốt',v:'22%',c:'var(--ok)',xu:3,d:'chốt / tư vấn'},
      {k:'Doanh thu tháng',v:'1,95 tỷ',c:'var(--gold-2)',xu:4},
      {k:'Hẹn quá hạn',v:'7',c:'var(--gita-do)',tot:false,d:'chạm ngay'},
      {k:'Giữ nhịp 90 ngày',v:'82%',c:'var(--gita-sau)'},
      {k:'NPS',v:'71',c:'var(--gita-sang)',d:'khách sẵn lòng giới thiệu'}
    ]);
    o += '<div class="grid g2">'+
      '<div>'+U.sec('CHỐT THEO THÁNG','')+U.bdCot([{nhan:'T5',a:28},{nhan:'T6',a:31},{nhan:'T7',a:26},{nhan:'T8',a:35},{nhan:'T9',a:38}])+'</div>'+
      '<div>'+U.sec('PHÂN BỐ ĐÈN','')+U.bdVong([{ten:'Xanh',gia:812,mau:'var(--ok)'},{ten:'Vàng',gia:296,mau:'var(--warn)'},{ten:'Đỏ',gia:64,mau:'var(--gita-do)'},{ten:'Xám',gia:112,mau:'#64708A'}],{giua:'1.284',duoi:'nhà'})+'</div>'+
      '</div>';
    return o;
  }

  /* ── NGĂN · CƠ HỘI BÁN HÀNG (phễu dự báo doanh thu) ── */
  function cohoiMinhHoa() {
    var o = U.bdNguon(false);
    /* MỘT NGUỒN dữ liệu phễu — mọi con số (ô tổng · bảng · kiểm 3 lượt) đều
       tính TỪ ĐÂY, không gõ tay ở ba nơi rồi lệch nhau. */
    var PHEU = [
      {ten: 'Mới',         xs: 0.10, so: 6, gt: 300000000},
      {ten: 'Đang tư vấn', xs: 0.30, so: 7, gt: 350000000},
      {ten: 'Đã báo giá',  xs: 0.50, so: 5, gt: 280000000},
      {ten: 'Đàm phán',    xs: 0.70, so: 4, gt: 170000000},
      {ten: 'Chuẩn bị ký', xs: 0.90, so: 2, gt: 80000000}
    ];
    var tongMo  = PHEU.reduce(function (s, x) { return s + x.gt; }, 0);
    var soMo    = PHEU.reduce(function (s, x) { return s + x.so; }, 0);
    var trongSo = PHEU.reduce(function (s, x) { return s + Math.round(x.gt * x.xs); }, 0);

    o += U.bdSoHang([
      {k: 'Cơ hội đang mở', v: String(soMo), c: 'var(--gita)'},
      {k: 'Tổng giá trị mở', v: dinhTien(tongMo) + ' đ', c: 'var(--gita-sau)'},
      {k: 'Dự báo (trọng số)', v: dinhTien(trongSo) + ' đ', c: 'var(--ok)', d: 'Σ giá trị × xác suất'},
      {k: 'Tỷ lệ thắng', v: '64%', c: 'var(--gold-2)', d: 'thắng/(thắng+thua)'}
    ]);

    /* Kiểm 3 lượt cho DỰ BÁO TRỌNG SỐ — con số dễ lệch nhất vì được tính ở
       nhiều nơi. Ba lượt tính ĐỘC LẬP; khớp cả ba mới đạt. */
    var l1 = PHEU.reduce(function (s, x) { return s + Math.round(x.gt * x.xs); }, 0);
    var l2 = Math.round(PHEU.reduce(function (s, x) { return s + x.gt * x.xs; }, 0));
    var l3 = trongSo;
    o += kiem3('Dự báo doanh thu (trọng số)', [
      {ten: 'Lượt 1 · Nhập',   v: l1, hienthi: dinhTien(l1) + ' đ', mo: 'Cộng từng dòng thô: Σ (giá trị × xác suất)'},
      {ten: 'Lượt 2 · Xử lý',  v: l2, hienthi: dinhTien(l2) + ' đ', mo: 'Tổng hợp lại trên toàn phễu'},
      {ten: 'Lượt 3 · Kết quả', v: l3, hienthi: dinhTien(l3) + ' đ', mo: 'Số hiện ở ô "Dự báo (trọng số)"'}
    ]);

    o += U.sec('Phễu theo chặng', 'Minh hoạ — nối máy chủ thì tính trên cơ hội thật');
    o += U.tbl(['Chặng', 'Xác suất', 'Số cơ hội', 'Giá trị', 'Trọng số'],
      PHEU.map(function (x) {
        return ['<b class="sm">' + h(x.ten) + '</b>',
          tienO(Math.round(x.xs * 100) + '%'), tienO(String(x.so)),
          tienO(dinhTien(x.gt) + 'đ'), tienO(dinhTien(Math.round(x.gt * x.xs)) + 'đ')];
      }));
    o += '<p class="note mt">Nối máy chủ CRM để thêm/cập nhật cơ hội thật và tính dự báo trọng số trên dữ liệu sống.</p>';
    return o;
  }
  /* ── NGĂN ĐƯỜNG ỐNG (KANBAN) — thứ chủ hệ muốn thấy khi mở CRM ──
     Mỗi CHẶNG một cột; mỗi CƠ HỘI một thẻ (tên · mã KH · giá trị · dự kiến
     chốt · phụ trách). Đầu cột: số cơ hội + tổng giá trị của chặng. Dữ liệu
     thật lấy từ máy chủ (so.ds theo giaiDoan); chưa nối thì hiện THẺ MẪU có
     dải nói rõ là minh hoạ — không dựng số giả không nhãn. */
  var CRM_GD_MAU = [
    {ma:'moi',     ten:'Mới tiếp nhận', xs:10},
    {ma:'tuvan',   ten:'Đang tư vấn',   xs:30},
    {ma:'baogia',  ten:'Đã báo giá',    xs:50},
    {ma:'damphan', ten:'Đàm phán',      xs:70},
    {ma:'chotky',  ten:'Chuẩn bị ký',   xs:90}
  ];
  var COHOI_MAU = [
    {ten:'Nhà Trung Nguyên',   maKH:'GITA-0152', sdt:'090 111 2233', giaTri:15000000, giaiDoan:'moi',     chot:'2026-10-20', phuTrach:'Minh', nhan:'Mới'},
    {ten:'Nhà Phương Thảo',    maKH:'GITA-0153', sdt:'090 222 3344', giaTri:18000000, giaiDoan:'moi',     chot:'2026-10-22', phuTrach:'Lan',  nhan:'Vật liệu'},
    {ten:'Nhà Văn Nghĩa',      maKH:'GITA-0154', sdt:'091 679 9406', giaTri:12000000, giaiDoan:'moi',     chot:'2026-10-25', phuTrach:'Minh', nhan:'Điện lực'},
    {ten:'Nhà Núi Nguyên',     maKH:'GITA-0140', sdt:'086 950 0370', giaTri:30000000, giaiDoan:'tuvan',   chot:'2026-10-18', phuTrach:'Lan',  nhan:'Nội thất'},
    {ten:'Nhà Nguyễn Thị Hoa', maKH:'GITA-0141', sdt:'098 765 4321', giaTri:22000000, giaiDoan:'tuvan',   chot:'2026-10-19', phuTrach:'Hà',   nhan:'Ấm'},
    {ten:'Nhà Trần Thị Lan',   maKH:'GITA-0142', sdt:'091 720 5876', giaTri:50000000, giaiDoan:'tuvan',   chot:'2026-10-21', phuTrach:'Minh', nhan:'Đào tạo'},
    {ten:'Nhà Vinachay',       maKH:'GITA-0130', sdt:'097 201 6848', giaTri:15000000, giaiDoan:'baogia',  chot:'2026-10-15', phuTrach:'Hà',   nhan:'Nóng'},
    {ten:'Nhà Thanh Hường',    maKH:'GITA-0131', sdt:'090 396 8412', giaTri:50000000, giaiDoan:'baogia',  chot:'2026-10-16', phuTrach:'Lan',  nhan:'Đối tác'},
    {ten:'Nhà Lan Ngọc',       maKH:'GITA-0132', sdt:'036 604 5541', giaTri:35000000, giaiDoan:'baogia',  chot:'2026-10-17', phuTrach:'Minh', nhan:'Thực phẩm'},
    {ten:'Nhà Lê Quang Huy',   maKH:'GITA-0120', sdt:'088 671 8267', giaTri:60000000, giaiDoan:'damphan', chot:'2026-10-12', phuTrach:'Hà',   nhan:'Tour'},
    {ten:'Nhà Anh Tùng',       maKH:'GITA-0121', sdt:'093 698 9436', giaTri:50000000, giaiDoan:'damphan', chot:'2026-10-13', phuTrach:'Lan',  nhan:'ERP'},
    {ten:'Nhà Hương CEO',      maKH:'GITA-0110', sdt:'036 246 6889', giaTri:90000000, giaiDoan:'chotky',  chot:'2026-10-10', phuTrach:'Minh', nhan:'VIP'},
    {ten:'Nhà Chị Huế',        maKH:'GITA-0111', sdt:'098 111 2222', giaTri:80000000, giaiDoan:'chotky',  chot:'2026-10-11', phuTrach:'Hà',   nhan:'Đàm phán xong'}
  ];

  function theCoHoi(x, mau) {
    return '<div class="crm-kb-the">' +
      '<div class="crm-kb-the-ten">' + h(x.ten) + '</div>' +
      (x.sdt ? '<div class="crm-kb-the-sdt">' + ic('pulse','w-3 h-3') + h(x.sdt) + '</div>' : '') +
      '<div class="crm-kb-the-gia" style="color:' + mau + '">' + dinhTien(x.giaTri) + 'đ</div>' +
      '<div class="crm-kb-the-chan">' +
        (x.nhan ? '<span class="crm-kb-nhan">' + h(x.nhan) + '</span>' : '<span></span>') +
        (x.phuTrach ? '<span class="crm-kb-pt">' + h(x.phuTrach) + '</span>' : '') +
      '</div>' +
      (x.chot ? '<div class="crm-kb-the-chot">' + ic('calendar','w-3 h-3') + 'Dự kiến chốt ' + h(x.chot) + '</div>' : '') +
    '</div>';
  }

  /* ── NGĂN · HOẠT ĐỘNG THẾ NÀO (sơ đồ giới thiệu, KHÔNG gọi máy chủ) ──
     Trả lời "CRM GITA làm gì" bằng HÌNH, như các sơ đồ CRM chuyên nghiệp
     chủ hệ gửi: hành trình một nhà qua tám bước · thu thập đa kênh về một
     kho · năm nhóm insight 360° · dải lợi ích. Toàn nội dung TĨNH — mô tả,
     không phải số liệu vận hành — nên KHÔNG đồng bộ với kho chặng thật
     (chặng thật sống ở Đường ống & Cơ hội, một nguồn ở máy chủ; chép sang
     đây là bản thứ hai của một sự thật). Dựng tức thì, không bao giờ rỗng,
     hợp khổ điện thoại bằng flex-wrap. */
  function veHoatDong() {
    var buoc = [
      {ic: 'search', ten: 'Tiếp cận',  vi: 'Khách đến từ website, quảng cáo, mạng xã hội, sự kiện'},
      {ic: 'seed',   ten: 'Lead',      vi: 'Ghi nhận thông tin, phân loại lead'},
      {ic: 'chat',   ten: 'Tư vấn',    vi: 'Liên hệ, nắm nhu cầu, cập nhật lịch sử tương tác'},
      {ic: 'target', ten: 'Cơ hội',    vi: 'Khách có nhu cầu, chuyển thành cơ hội bán'},
      {ic: 'book',   ten: 'Báo giá',   vi: 'Gửi báo giá, đàm phán, theo dõi quá trình'},
      {ic: 'check',  ten: 'Bán hàng',  vi: 'Chốt đơn, tạo giao dịch thành công'},
      {ic: 'heart',  ten: 'Chăm sóc',  vi: 'Chăm sau bán, nhắc lịch, hỗ trợ'},
      {ic: 'arrow',  ten: 'Mua lại',   vi: 'Quay lại và giới thiệu khách mới'}
    ];
    var kenh = ['Website', 'Facebook', 'Zalo', 'Email', 'Tổng đài', 'Sự kiện', 'Chat/Chatbot', 'POS/Ứng dụng'];
    var insight = [
      {ic: 'users', ten: 'Nhân khẩu học',      vi: 'Tuổi, giới, vị trí, nghề nghiệp, thu nhập'},
      {ic: 'chart', ten: 'Hành vi mua hàng',   vi: 'Sản phẩm quan tâm, tần suất mua, giá trị đơn'},
      {ic: 'pulse', ten: 'Hành vi tương tác',  vi: 'Kênh, tần suất, thời điểm tương tác'},
      {ic: 'heart', ten: 'Sở thích & quan tâm', vi: 'Chủ đề quan tâm, nội dung đã xem'},
      {ic: 'star',  ten: 'Giá trị khách (RFM)', vi: 'Gần đây (R), tần suất (F), giá trị (M)'}
    ];
    var loi = [
      {ic: 'vault', ten: 'Tập trung dữ liệu khách'},
      {ic: 'chart', ten: 'Tăng hiệu suất bán'},
      {ic: 'heart', ten: 'Chăm sóc tốt hơn'},
      {ic: 'crown', ten: 'Tăng doanh thu & giữ chân'}
    ];

    var o = U.sec('CRM GITA hoạt động thế nào',
      'Một nơi quản lý trọn hành trình khách hàng: thu thập đa kênh, hiểu khách 360°, ' +
      'và giữ nhịp chăm sóc. Sơ đồ dưới là bức tranh chung — bấm "Đường ống" để làm việc thật.');

    o += U.sec('Hành trình một nhà qua GITA', 'Tám bước, mỗi bước một việc rõ.');
    /* Khung quy trình kiểu bảng vận hành: cả sơ đồ nằm trong một khung có
       tiêu đề, các bước nối nhau bằng mũi tên → đọc được thành DÒNG CHẢY,
       không phải tám thẻ rời. */
    o += '<div class="crm-qt">' +
      '<div class="crm-qt-dau">' + ic('orbit', 'w-4 h-4') +
        '<b>Quy trình CRM · 8 bước</b>' +
        '<span>Sơ đồ vận hành — từ tiếp cận đến mua lại</span></div>' +
      '<div class="crm-ht-ht crm-qt-luong">';
    buoc.forEach(function (b, i) {
      var mau = SAC_PHEU[i % SAC_PHEU.length];
      o += '<div class="crm-ht-buoc">' +
        '<div class="crm-ht-tron" style="background:' + mau + '">' + ic(b.ic, 'w-5 h-5') + '</div>' +
        '<div class="crm-ht-so">' + (i + 1) + '</div>' +
        '<div class="crm-ht-ten">' + h(b.ten) + '</div>' +
        '<div class="crm-ht-vi">' + h(b.vi) + '</div>' +
      '</div>';
    });
    o += '</div></div>';

    /* ── Sơ đồ kiến trúc CRM (kiểu CRMOnline): Người dùng ở trên · ba cột
          Nguồn dữ liệu → Hệ thống CRM → Tích hợp · Dữ liệu ở dưới. ── */
    var nguoiDung = [
      {ic: 'chart', ten: 'Marketing'}, {ic: 'target', ten: 'Sales'}, {ic: 'heart', ten: 'CSKH'},
      {ic: 'crown', ten: 'Quản lý'}, {ic: 'vault', ten: 'Kế toán'}, {ic: 'users', ten: 'Nhân sự'}
    ];
    var nguon = [
      {ic: 'compass', ten: 'Website'}, {ic: 'book', ten: 'Landing Page'}, {ic: 'chat', ten: 'Facebook'},
      {ic: 'chat', ten: 'Zalo'}, {ic: 'book', ten: 'Email'}, {ic: 'pulse', ten: 'Tổng đài'},
      {ic: 'star', ten: 'Sự kiện'}, {ic: 'users', ten: 'Nhân viên'}
    ];
    var tichHop = [
      {ic: 'chat', ten: 'Zalo OA'}, {ic: 'chat', ten: 'Facebook'}, {ic: 'book', ten: 'Email Marketing'},
      {ic: 'pulse', ten: 'Tổng đài · SMS'}, {ic: 'spark', ten: 'Chatbot AI'}, {ic: 'vault', ten: 'Hóa đơn · Kế toán'},
      {ic: 'target', ten: 'Kho hàng'}, {ic: 'orbit', ten: 'Ứng dụng khác'}
    ];
    var loiCrm = [
      {ten: 'Thu thập dữ liệu', vi: 'Đa kênh về một mối'},
      {ten: 'Lưu trữ & chuẩn hóa', vi: 'Sạch · hợp nhất · không trùng'},
      {ten: 'Phân loại & giao Lead', vi: 'Đúng người, đúng lúc'},
      {ten: 'Theo dõi Sales', vi: 'Phễu cơ hội theo chặng'},
      {ten: 'Chăm sóc khách', vi: 'Nhắc lịch, giữ nhịp'},
      {ten: 'Báo cáo & phân tích', vi: 'Đo được, quyết đúng'}
    ];
    var duLieu = [
      {ic: 'users', ten: 'Khách hàng'}, {ic: 'seed', ten: 'Lead'}, {ic: 'chat', ten: 'Contact'},
      {ic: 'target', ten: 'Cơ hội'}, {ic: 'pulse', ten: 'Hoạt động'}, {ic: 'check', ten: 'Công việc'},
      {ic: 'book', ten: 'Sản phẩm'}, {ic: 'vault', ten: 'Đơn hàng'}, {ic: 'heart', ten: 'Lịch sử tương tác'},
      {ic: 'chart', ten: 'Báo cáo'}
    ];

    o += U.sec('Kiến trúc CRM — Dữ liệu · Con người · Quy trình · Công nghệ',
      'Một sơ đồ: nguồn dữ liệu đổ vào Hệ thống CRM, nối ra các công cụ tích hợp; người dùng ở trên, dữ liệu ở dưới.');
    o += '<div class="crm-so">';
    /* Người dùng */
    o += '<div class="crm-so-nhom"><span class="crm-so-nhan">Người dùng</span><div class="crm-so-nguoi">';
    nguoiDung.forEach(function (u) {
      o += '<div class="crm-so-u"><span class="crm-so-u-ic">' + ic(u.ic, 'w-4 h-4') + '</span>' + h(u.ten) + '</div>';
    });
    o += '</div></div>';
    /* Ba cột */
    o += '<div class="crm-so-hang">';
    o += '<div class="crm-so-cot"><div class="crm-so-cot-dau">Nguồn dữ liệu</div>';
    nguon.forEach(function (n) { o += '<div class="crm-so-item">' + ic(n.ic, 'w-4 h-4') + '<span>' + h(n.ten) + '</span></div>'; });
    o += '</div>';
    o += '<div class="crm-so-muiten">' + ic('arrow', 'w-5 h-5') + '</div>';
    o += '<div class="crm-so-giua"><div class="crm-so-giua-dau">' + ic('orbit', 'w-4 h-4') + 'Hệ thống CRM</div><div class="crm-so-giua-than">';
    loiCrm.forEach(function (s, i) {
      o += '<div class="crm-so-b"><span class="crm-so-b-so">' + (i + 1) + '</span>' +
        '<div><b>' + h(s.ten) + '</b><span>' + h(s.vi) + '</span></div></div>';
    });
    o += '</div></div>';
    o += '<div class="crm-so-muiten">' + ic('arrow', 'w-5 h-5') + '</div>';
    o += '<div class="crm-so-cot"><div class="crm-so-cot-dau">Tích hợp</div>';
    tichHop.forEach(function (t) { o += '<div class="crm-so-item">' + ic(t.ic, 'w-4 h-4') + '<span>' + h(t.ten) + '</span></div>'; });
    o += '</div>';
    o += '</div>';
    /* Dữ liệu */
    o += '<div class="crm-so-nhom"><span class="crm-so-nhan">Dữ liệu</span><div class="crm-so-du">';
    duLieu.forEach(function (d) { o += '<span class="crm-so-chip">' + ic(d.ic, 'w-3 h-3') + h(d.ten) + '</span>'; });
    o += '</div></div>';
    o += '</div>';

    o += U.sec('Hiểu khách 360° — insight theo nhóm',
      'Từ dữ liệu đã hợp nhất, dựng chân dung khách theo từng nhóm thông tin.');
    o += '<div class="crm-ht-luoi">';
    insight.forEach(function (x, i) {
      var mau = SAC_PHEU[i % SAC_PHEU.length];
      o += '<div class="crm-ht-the">' +
        '<div class="crm-ht-the-ic" style="color:' + mau + '">' + ic(x.ic, 'w-5 h-5') + '</div>' +
        '<div><div class="crm-ht-the-ten">' + h(x.ten) + '</div>' +
        '<div class="crm-ht-the-vi">' + h(x.vi) + '</div></div>' +
      '</div>';
    });
    o += '</div>';

    o += '<div class="crm-ht-loi">';
    loi.forEach(function (l) {
      o += '<div class="crm-ht-loi-o">' + ic(l.ic, 'w-5 h-5') + '<span>' + h(l.ten) + '</span></div>';
    });
    o += '</div>';
    return o;
  }

  function veDuongOng() {
    var so = G.crmCoHoiData;
    var that = so && so.ok;
    var gd = (that && so.giaiDoanCoThe && so.giaiDoanCoThe.length) ? so.giaiDoanCoThe : CRM_GD_MAU;
    var ds = that ? (so.ds || []) : COHOI_MAU;

    var o = U.bdNguon(!!that);
    if (!that)
      o += '<div class="crm-mau">' + ic('spark','w-4 h-4') +
        ' Đường ống MINH HOẠ — nối máy chủ CRM thì các thẻ tự thay bằng cơ hội thật của nhà mình.</div>';

    /* Cột theo chặng — mỗi cột cuộn dọc riêng, cả dải cuộn ngang trên màn hẹp. */
    o += '<div class="crm-kb">';
    gd.forEach(function (g, i) {
      var mau = SAC_PHEU[i % SAC_PHEU.length];
      var trong = ds.filter(function (x) { return x.giaiDoan === g.ma; });
      var tong = trong.reduce(function (s, x) { return s + (Number(x.giaTri) || 0); }, 0);
      o += '<div class="crm-kb-cot">' +
        '<div class="crm-kb-dau" style="border-top-color:' + mau + '">' +
          '<div class="crm-kb-dau-ten">' + h(g.ten) + '</div>' +
          '<div class="crm-kb-dau-so"><b>' + trong.length + '</b> cơ hội · ' +
            '<span style="color:' + mau + '">' + dinhTien(tong) + 'đ</span></div>' +
          '<div class="crm-kb-dau-xs">' + ic('compass','w-3 h-3') + ' xác suất ' + h(String(g.xs)) + '%</div>' +
        '</div>' +
        '<div class="crm-kb-cot-than">' +
          (trong.length ? trong.map(function (x) { return theCoHoi(x, mau); }).join('')
                        : '<div class="crm-kb-trong">Chưa có cơ hội</div>') +
        '</div>' +
      '</div>';
    });
    o += '</div>';

    if (that)
      o += '<p class="note mt"><button class="btn sm" onclick="G.crmMoNgan(\'cohoi\')">' +
        'Xem phễu dự báo & thêm cơ hội →</button></p>';
    else
      o += '<p class="note mt">Nối máy chủ ở <b>Quản trị trang → Nối máy chủ</b> để đường ống hiện cơ hội thật.</p>';
    return o;
  }

  function veCoHoi() {
    var so = G.crmCoHoiData;
    var o = U.sec('Phễu cơ hội — dự báo doanh thu',
      'Mỗi chặng mang một xác suất chốt; giá trị TRỌNG SỐ = Σ(giá trị × xác suất) — dự báo sát ' +
      'hơn tổng thô. Chỉ tính cơ hội ĐANG MỞ; thắng/thua để riêng.');
    if (!so) return o + '<p class="note"><button class="btn" onclick="G.crmTaiCoHoi()">Tải phễu cơ hội</button></p>';
    if (!so.ok) return o + cohoiMinhHoa();

    o += U.bdNguon(true);
    o += U.bdSoHang([
      {k:'Cơ hội đang mở', v:String(so.tongMo||0), c:'var(--gita)'},
      {k:'Tổng giá trị mở', v:dinhTien(so.tongGiaTri||0)+'đ', c:'var(--gita-sau)'},
      {k:'Dự báo (trọng số)', v:dinhTien(so.tongTrongSo||0)+'đ', c:'var(--ok)', d:'Σ giá trị × xác suất'},
      {k:'Tỷ lệ thắng', v:(so.tyLeThang===null||so.tyLeThang===undefined?'—':so.tyLeThang+'%'), c:'var(--gold-2)', d:'thắng/(thắng+thua)'}
    ]);

    o += U.sec('Phễu theo chặng', 'Số cơ hội · giá trị · giá trị trọng số từng chặng');
    o += U.tbl(['Chặng','Xác suất','Số cơ hội','Giá trị','Trọng số'],
      (so.theoGiaiDoan||[]).map(function (g) {
        return ['<b class="sm">'+h(g.ten)+'</b>','<span class="mono">'+h(String(g.xs))+'%</span>',
          '<span class="mono">'+h(String(g.n))+'</span>','<span class="mono">'+dinhTien(g.giaTri)+'đ</span>',
          '<b class="mono">'+dinhTien(g.trongSo)+'đ</b>'];
      }));

    o += '<div class="crm-dens" style="margin-top:8px">' +
      '<div class="crm-den-o" style="border-left-color:#0B7350"><b>'+h(String(so.thang.n))+' thắng</b><span>'+dinhTien(so.thang.tong)+'đ</span></div>' +
      '<div class="crm-den-o" style="border-left-color:#D11F2A"><b>'+h(String(so.thua.n))+' thua</b><span>'+dinhTien(so.thua.tong)+'đ</span></div>' +
      '</div>';

    o += U.sec('Thêm / cập nhật cơ hội', 'Cần quyền mức "sửa" trở lên · nhà bạn phụ trách. Đánh dấu THUA thì phải ghi lý do.');
    o += '<div class="row" style="flex-direction:column;gap:10px;max-width:520px">';
    o += '<label>Mã khách hàng<br><input id="ch_makh" placeholder="vd: GITA-0151"></label>';
    o += '<label>Tên cơ hội<br><input id="ch_ten" placeholder="vd: Nâng Tầng 4 · Gia hạn 365"></label>';
    o += '<label>Giá trị dự kiến (đồng)<br><input id="ch_giatri" inputmode="numeric" placeholder="vd: 30000000"></label>';
    o += '<label>Chặng<br><select id="ch_gd">' +
      (so.giaiDoanCoThe||[]).map(function (g) {
        return '<option value="'+h(g.ma)+'">'+h(g.ten)+' — '+h(String(g.xs))+'%</option>';
      }).join('') + '</select></label>';
    o += '<label>Dự kiến chốt (YYYY-MM-DD)<br><input id="ch_chot" type="date"></label>';
    o += '<div><button class="btn btn-chinh" onclick="G.crmLuuCoHoi()">Ghi cơ hội</button></div>';
    o += '</div>';

    o += U.sec('Cơ hội đang mở', h(so.vi || ''));
    var ds = so.ds || [];
    if (ds.length)
      o += U.tbl(['Cơ hội','Mã khách','Giá trị','Chặng','Dự kiến chốt','Phụ trách'],
        ds.map(function (x) {
          return ['<b class="sm">'+h(x.ten)+'</b>', h(x.maKH), '<span class="mono">'+dinhTien(x.giaTri)+'đ</span>',
            h(tenChang(x.giaiDoan, so.giaiDoanCoThe)), h(x.duKienChot||'—'), h(x.nguoiPhuTrach||'—')];
        }));
    else o += '<p class="note">Chưa có cơ hội nào đang mở. Thêm ở form trên.</p>';
    return o;
  }

  /* ── NGĂN 1 · BUỒNG LÁI ── */
  function veBang() {
    var so = G.crmBang;
    if (!so) return '<p class="note"><button class="btn" onclick="G.crmTaiBang()">Tải buồng lái</button></p>';
    if (!so.ok) return veBangMinhHoa();

    var o = U.sec('Buồng lái CRM' + (so.toanBo ? ' — toàn hệ' : ' — phần bạn phụ trách'), h(so.vi || ''));
    o += U.bdNguon(true);

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
    if (!so.ok) return o + viecMinhHoa();

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
    if (!so.ok) return dsMinhHoa();

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
    if (!so.ok) return o + kpiMinhHoa();

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

    /* Ngăn quản trị (cấp quyền · quản trị · luật) chỉ cho ba vai mặc định
       (lv≤3). Bộ phận được cấp qua quyenCRM chỉ thấy ngăn THAO TÁC — đúng
       "thao tác theo giới hạn được cấp". Máy chủ vẫn gác từng cửa, đây chỉ
       gọn màn. Người được cấp mà lỡ ở một ngăn quản trị thì rơi về Hoạt động. */
    var lvVai = (G.S.roleObj && G.S.roleObj.lv) || 99;
    var laQuanTri = lvVai <= 3;
    var NGAN_HIEN = NGAN.filter(function (n) {
      return (n.ma === 'quyen' || n.ma === 'quantri' || n.ma === 'luat') ? laQuanTri : true;
    });
    if (!laQuanTri && (G.crmNgan === 'quyen' || G.crmNgan === 'quantri' || G.crmNgan === 'luat'))
      G.crmNgan = 'hoat-dong';

    o += '<div class="tabs">' + NGAN_HIEN.map(function (n) {
      return '<button class="tab' + (G.crmNgan === n.ma ? ' on' : '') + '" onclick="G.crmMoNgan(\'' +
        n.ma + '\')">' + ic(n.ic) + ' ' + h(n.ten) + '</button>';
    }).join('') + '</div>';

    if (G.crmNgan === 'hoat-dong') { o += veHoatDong(); }
    else if (G.crmNgan === 'duong-ong') { o += veDuongOng(); if (!G.crmCoHoiData) setTimeout(G.crmTaiCoHoi, 0); }
    else if (G.crmNgan === 'bang') { o += veBang(); if (!G.crmBang) setTimeout(G.crmTaiBang, 0); }
    else if (G.crmNgan === 'viec') { o += veUuTien(); if (!G.crmViec) setTimeout(G.crmTaiViec, 0); }
    else if (G.crmNgan === 'ds') { o += veDs(); if (!G.crmDs && !G.crmCt) setTimeout(G.crmTaiDs, 0); }
    else if (G.crmNgan === 'cohoi') { o += veCoHoi(); if (!G.crmCoHoiData) setTimeout(G.crmTaiCoHoi, 0); }
    else if (G.crmNgan === 'troly') { o += veTroLy(); if (!G.crmAi) setTimeout(G.crmTaiAi, 0); }
    else if (G.crmNgan === 'kpi') { o += veKpi(); if (!G.crmKpi) setTimeout(G.crmTaiKpi, 0); }
    else if (G.crmNgan === 'quyen') { o += veQuyen(); if (!G.crmQ) setTimeout(G.crmTaiQuyen, 0); }
    else if (G.crmNgan === 'quantri') { o += veQuanTri(); if (!G.crmQt) setTimeout(G.crmTaiQuanTri, 0); }
    else o += veLuat();
    return o;
  };

  /* ── MÀN "PHÂN QUYỀN CRM" trong Quản trị trang ──
     Chủ hệ muốn một chỗ CẤP QUYỀN CRM ngay trong Quản trị trang, không
     phải đi vòng vào mục CRM. Dùng LẠI đúng bộ cấp quyền của ngăn "Cấp
     quyền" (veQuyen) — một nguồn, không dựng bản thứ hai. Người được cấp
     ở đây sẽ THẤY mục CRM ở lần đăng nhập sau (máy chủ trả crmMuc) và
     thao tác theo mức: xem · sửa · quản lý. Máy chủ vẫn gác mọi thao tác. */
  G.VIEWS['phan-quyen-crm'] = function () {
    if (!(G.can && G.can('qt_trang')))
      return U.lockCard('Phân quyền CRM chỉ mở cho Super Admin và Admin hệ thống. ' +
        'Đây là chỗ quyết ai được xem và thao tác trên dữ liệu quan hệ khách hàng.');
    var o = '<div class="hd"><h2>' + ic('lock') + ' Phân quyền CRM</h2>' +
      '<p class="sub">Cấp quyền CRM cho bộ phận khác (coach, tư vấn…). Người được cấp sẽ ' +
      'THẤY mục CRM ở lần đăng nhập sau và thao tác theo mức: <b>xem</b> · <b>sửa</b> · ' +
      '<b>quản lý</b>. Khách hàng không bao giờ thấy CRM. Ba vai quản trị (Super Admin · ' +
      'Admin hệ thống · Giám đốc) thấy sẵn, không cần cấp.</p></div>';
    o += veQuyen();
    if (!G.crmQ) setTimeout(G.crmTaiQuyen, 0);
    return o;
  };
})();
