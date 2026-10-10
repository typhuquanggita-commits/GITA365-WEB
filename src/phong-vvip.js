/* ═══════════════════════════════════════════════════════════════
   GITA 365 — PHÒNG VVIP (màn hình) · khu Khách hàng & CRM

   Chủ hệ 10/10/2026 gửi "GITA 365 VVIP — MASTER BLUEPRINT 1.0" và dặn:
   "ứng dụng vào phần Khách hàng và CRM để tối ưu hóa cho hệ thống khách
   hàng VIP và VVIP … nghiêm cấm làm hời hợt."

   Màn này là chỗ LÀM VIỆC của bốn tài sản cốt lõi Blueprint chọn trước:
   bảng điều khiển 80% · CRM nhóm trọng điểm · thư viện điểm chạm WOW · bộ
   hồ sơ 12 tài liệu — cộng chiến dịch và toàn văn Blueprint.

   KHÔNG có một chữ nội dung Blueprint nào trong tệp này: src/ gộp thành
   gita-app.js tải trước đăng nhập, ai mở trang cũng đọc được. Mọi nội dung
   và số liệu đi xuống từ máy chủ (may-chu/vvip.js) theo vai. Luật nằm ở máy
   chủ; đây chỉ là cách trình bày.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;
G.VIEWS = G.VIEWS || {};

(function () {
  /* Lớp giao diện chung ở G.U (ui.js) — cùng lối các màn khác. Bản đầu viết
     window.U || {}: window.U không tồn tại, màn giữ một vật rỗng và mọi U.tbl
     nổ — mà nổ ở ngăn có dữ liệu, nên lượt dựng đầu (đang tải) vẫn trông lành. */
  var U = G.U, h = U.h, ic = U.ic;
  G.VV = G.VV || { tab: 'tong', nd: null, bang: null, nhan: null, pv: null, dc: null, cd: null, hs: null, maNha: '', bao: '' };
  function goi(fn, y) {
    if (!G.goiMayChu) return Promise.resolve({ ok: false, error: 'Chưa nối máy chủ.' });
    return G.goiMayChu(fn, y || {}).catch(function (e) { return { ok: false, error: (e && e.message) || 'Không gọi được máy chủ.' }; });
  }
  function ve() { if (G.S && G.S.view === 'phong-vvip' && G.render) G.render(); }
  function bao(x, okMsg) {
    U.toast(x && x.ok ? okMsg : ((x && x.error) || 'Không thực hiện được.'), x && x.ok ? 'ok' : 'err');
  }
  var TAI = {
    tong: function () { goi('bangVvip').then(function (x) { G.VV.bang = x; ve(); }); },
    nhan: function () { goi('nhanDienVvip').then(function (x) { G.VV.nhan = x; ve(); }); },
    phucvu: function () { goi('soatPhucVuVvip').then(function (x) { G.VV.pv = x; ve(); }); },
    wow: function () { goi('dsDiemCham').then(function (x) { G.VV.dc = x; ve(); }); },
    chiendich: function () { goi('dsChienDichVvip').then(function (x) { G.VV.cd = x; ve(); }); }
  };
  function napNoiDung() { if (!G.VV.nd) goi('noiDungVvip').then(function (x) { G.VV.nd = x; ve(); }); }
  G.vvTab = function (t) { G.VV.tab = t; ve(); window.scrollTo && window.scrollTo(0, 0); };
  G.vvTaiLai = function () { var t = G.VV.tab; G.VV[{ tong: 'bang', nhan: 'nhan', phucvu: 'pv', wow: 'dc', chiendich: 'cd' }[t]] = null; ve(); };

  /* ── thao tác ── */
  G.vvDeXuat = function (el) {
    var f = el.closest('form'), x = { maNha: f.maNha.value, nhom: f.nhom.value, lyDo: f.lyDo.value };
    goi('deXuatNhomVvip', x).then(function (r) { bao(r, 'Đã gửi đề xuất — chờ một người duyệt khác.'); if (r.ok) { G.VV.nhan = null; ve(); } });
    return false;
  };
  G.vvDuyetNhom = function (el) {
    var id = el.getAttribute('data-id'), quyet = el.getAttribute('data-q');
    var ghiChu = '';
    var o = el.closest('.vv-cho'), o2 = o && o.querySelector('textarea');
    if (o2) ghiChu = o2.value;
    goi('duyetNhomVvip', { id: id, quyet: quyet, ghiChu: ghiChu }).then(function (r) { bao(r, quyet === 'tuChoi' ? 'Đã từ chối.' : 'Đã duyệt — ảnh chụp bảy dấu hiệu đã vào hồ sơ quyết định.'); if (r.ok) { G.VV.nhan = null; ve(); } });
  };
  G.vvPhanCong = function (el) {
    var f = el.closest('form');
    goi('phanCongVvip', { maNha: f.maNha.value, vaiTro: f.vaiTro.value, nguoi: f.nguoi.value, lyDo: f.lyDo.value })
      .then(function (r) { bao(r, 'Đã phân công ' + (r.nguoi || '') + ' (hạng ' + (r.hang || '') + ')' + (r.ngoaiChuan ? ' — NGOÀI CHUẨN' : '') + '.'); if (r.ok) { G.VV.pv = null; ve(); } });
    return false;
  };
  G.vvMoHoSo = function (el) {
    var f = el.closest('form'), ma = (f.maNha.value || '').trim();
    G.VV.maNha = ma; G.VV.hs = null;
    if (ma) goi('docHoSoVvip', { maNha: ma }).then(function (r) { G.VV.hs = r; ve(); });
    ve(); return false;
  };
  G.vvLuuTaiLieu = function (el) {
    var f = el.closest('form'), tl = f.getAttribute('data-tl'), nd = {};
    Array.prototype.forEach.call(f.querySelectorAll('[data-k]'), function (o) { nd[o.getAttribute('data-k')] = o.value; });
    goi('luuHoSoVvip', { maNha: G.VV.maNha, taiLieu: tl, noiDung: nd }).then(function (r) {
      bao(r, 'Đã lưu tài liệu ' + tl + ' — bản ' + (r.phienBan || '') + '.');
      if (r.ok) goi('docHoSoVvip', { maNha: G.VV.maNha }).then(function (x) { G.VV.hs = x; ve(); });
    });
    return false;
  };
  G.vvSoanDC = function (el) {
    var f = el.closest('form'), d = {};
    Array.prototype.forEach.call(f.querySelectorAll('[data-k]'), function (o) { d[o.getAttribute('data-k')] = o.value; });
    goi('soanDiemCham', { ma: f.ma.value, diemCham: d }).then(function (r) { bao(r, 'Đã nộp ' + (r.ma || '') + ' — chờ một người khác duyệt đủ mười tiêu chuẩn.'); if (r.ok) { G.VV.dc = null; ve(); } });
    return false;
  };
  G.vvDuyetDC = function (el) {
    var ma = el.getAttribute('data-ma'), box = el.closest('.vv-dc'), chuan = [];
    Array.prototype.forEach.call(box.querySelectorAll('input[type=checkbox]:checked'), function (c) { chuan.push(Number(c.value)); });
    goi('duyetDiemCham', { ma: ma, chuan: chuan }).then(function (r) { bao(r, 'Đã bật ' + ma + '.'); if (r.ok) { G.VV.dc = null; ve(); } });
  };
  G.vvDungDC = function (el) {
    goi('duyetDiemCham', { ma: el.getAttribute('data-ma'), quyet: 'tamDung' }).then(function (r) { bao(r, 'Đã tạm dừng.'); if (r.ok) { G.VV.dc = null; ve(); } });
  };
  G.vvNapMau = function () { goi('napMauDiemCham').then(function (r) { bao(r, 'Đã nạp ' + (r.moi || 0) + ' điểm chạm mẫu — chờ duyệt.'); if (r.ok) { G.VV.dc = null; ve(); } }); };
  G.vvGuiDC = function (el) {
    var f = el.closest('form');
    goi('kichHoatDiemCham', { ma: f.ma.value, maNha: f.maNha.value, noiDung: f.noiDung.value })
      .then(function (r) { bao(r, 'Đã ghi lượt chạm vào sổ.'); });
    return false;
  };
  G.vvLapCD = function (el) {
    var f = el.closest('form'), dt = [];
    Array.prototype.forEach.call(f.querySelectorAll('input[name=doiTuong]:checked'), function (c) { dt.push(c.value); });
    var c = { mau: f.mau.value, ten: f.ten.value, mucTieu: f.mucTieu.value, doLuong: f.doLuong.value, noiDung: f.noiDung.value,
      khongLam: f.khongLam.value, batDau: f.batDau.value, ketThuc: f.ketThuc.value, doiTuong: dt };
    goi('lapChienDichVvip', { chienDich: c }).then(function (r) { bao(r, 'Đã lập chiến dịch — chờ một người khác duyệt.'); if (r.ok) { G.VV.cd = null; ve(); } });
    return false;
  };
  G.vvDuyetCD = function (el) {
    goi('duyetChienDichVvip', { id: el.getAttribute('data-id'), quyet: el.getAttribute('data-q') })
      .then(function (r) { bao(r, 'Đã cập nhật chiến dịch.'); if (r.ok) { G.VV.cd = null; ve(); } });
  };

  /* ── mảnh trình bày ── */
  function pct(v) { return v == null ? '—' : String(v).replace('.', ',') + '%'; }
  function tien(v) { return v == null ? '—' : Math.round(v).toLocaleString('vi-VN') + 'đ'; }
  function loi(x) { return '<div class="card vv-loi">' + ic('alert') + ' ' + h((x && x.error) || 'Không đọc được.') + '</div>'; }
  function cho() { return '<p class="muted">Đang đọc từ máy chủ…</p>'; }
  function nhan(t, cls) { return '<span class="vv-nhan ' + (cls || '') + '">' + h(t) + '</span>'; }

  function veTong() {
    var b = G.VV.bang;
    if (!b) { TAI.tong(); return cho(); }
    if (!b.ok) return loi(b) + '<p class="sm muted">Bảng doanh thu nhóm trọng điểm thuộc luật tài chính: chỉ R01–R03. Các ngăn khác vẫn mở theo vai.</p>';
    var B = b.baChiSo, o = '';
    o += '<div class="vv-ba">' +
      '<div class="vv-o"><div class="vv-k">Doanh thu từ nhóm trọng điểm</div><div class="vv-so">' + pct(B.DOANHTHU.giaTri) + '</div>' +
        '<div class="sm muted">đích ' + B.DOANHTHU.dich + '% · VVIP ' + pct(B.DOANHTHU.vvip) + ' · VIP ' + pct(B.DOANHTHU.vip) + '</div>' +
        '<div class="sm">' + tien(B.DOANHTHU.trongDiem) + ' / ' + tien(B.DOANHTHU.tong) + ' · ' + B.DOANHTHU.soNhaVVIP + ' nhà VVIP · ' + B.DOANHTHU.soNhaVIP + ' nhà VIP</div></div>' +
      '<div class="vv-o"><div class="vv-k">Lợi nhuận đóng góp</div><div class="vv-so vv-chua">chưa đo</div><div class="sm muted">' + h(B.LOINHUAN.vi) + '</div></div>' +
      '<div class="vv-o"><div class="vv-k">Tăng trưởng từ nhóm trọng điểm</div><div class="vv-so">' + (B.TANGTRUONG.giaTri == null ? '<span class="vv-chua">chưa đo</span>' : pct(B.TANGTRUONG.giaTri)) + '</div>' +
        '<div class="sm muted">' + h(B.TANGTRUONG.giaDinh || B.TANGTRUONG.vi || '') + '</div></div></div>';
    o += '<p class="sm muted">' + h(b.canhBao) + ' Cửa sổ ' + h(b.cuaSo.tu) + ' → ' + h(b.cuaSo.den) + '. Doanh thu = phiếu thu đã duyệt trừ hoàn tiền đã duyệt.</p>';
    o += U.sec('Đường cong tập trung doanh thu', 'Bao nhiêu % doanh thu đến từ bao nhiêu % nhà — kiểm chứng giả thuyết 80/20 bằng sổ thật');
    var t = b.tapTrung;
    o += '<div class="vv-cot" role="img" aria-label="Tỷ trọng doanh thu luỹ kế theo từng 10% số nhà">' + (t.cong10 || []).map(function (v, i) {
      return '<div class="vv-c"><div class="vv-cb" style="height:' + Math.max(2, v || 0) + '%"></div><span>' + ((i + 1) * 10) + '%</span><b>' + pct(v) + '</b></div>';
    }).join('') + '</div>';
    o += '<p class="sm">' + t.soNha + ' nhà có doanh thu · 20% nhà đầu tạo ' + pct(t.top20) + (t.soNha80 ? ' · ' + t.soNha80 + ' nhà tạo 80% doanh thu' : '') + '</p>';
    if (b.ruiRo && b.ruiRo.length) o += '<div class="card vv-canh">' + b.ruiRo.map(function (x) { return '<p class="sm">' + ic('alert') + ' ' + h(x) + '</p>'; }).join('') + '</div>';
    var doDuoc = b.kpi.filter(function (k) { return k.giaTri !== undefined; }), chua = b.kpi.filter(function (k) { return k.giaTri === undefined; });
    o += U.sec('Mười KPI quản trị — phần ĐO ĐƯỢC', 'Tính từ sổ mỗi lần mở bảng');
    o += U.tbl(['Nhóm', 'Chỉ số', 'Giá trị', 'Đo thế nào'], doDuoc.map(function (k) {
      return [h(k.nhom), h(k.chiSo), '<b>' + h(k.donVi === '%' ? pct(k.giaTri) : (k.donVi === 'đồng/nhà mới' ? tien(k.giaTri) : k.giaTri + ' ' + (k.donVi || ''))) + '</b>', h(k.do || '') + (k.ghiChu ? '<br><span class="tiny muted">' + h(k.ghiChu) + '</span>' : '')];
    }));
    o += U.sec('Mười KPI quản trị — phần CHƯA ĐO', 'Không trả số 0 thay cho "chưa biết"');
    o += U.tbl(['Nhóm', 'Chỉ số', 'Vì sao chưa đo'], chua.map(function (k) { return [h(k.nhom), h(k.chiSo), h(k.vi || '')]; }));
    o += U.sec('Bốn mục tiêu vận hành thử nghiệm');
    o += U.tbl(['Mục tiêu', 'Ngưỡng', 'Hiện tại', 'Đạt?'], b.thuNghiem.map(function (m) {
      return [h(m.ten), '≥ ' + m.nguong + '%', m.giaTri == null ? '<span class="muted">' + h(m.vi || 'chưa đo') + '</span>' : '<b>' + pct(m.giaTri) + '</b>',
        m.dat === undefined ? '—' : (m.dat ? nhan('đạt', 'xanh') : nhan('chưa', 'do'))];
    }));
    o += '<p class="sm muted">' + h(b.kpiCanhBao) + '</p>';
    return o;
  }

  function veNhan() {
    var x = G.VV.nhan;
    if (!x) { TAI.nhan(); return cho(); }
    if (!x.ok) return loi(x);
    var o = '<p class="sm">' + h(x.luat) + '</p>';
    if (x.choDuyet && x.choDuyet.length) {
      o += U.sec('Đề xuất chờ duyệt', x.duocDuyet ? 'Người duyệt phải khác người đề xuất' : 'Chỉ R01–R03 duyệt');
      o += x.choDuyet.map(function (d) {
        return '<div class="card vv-cho"><b>' + h(d.maNha) + ' → ' + h(d.nhom) + '</b> <span class="sm muted">· ' + h(d.deXuat) + '</span><p class="sm">' + h(d.lyDo) + '</p>' +
          (x.duocDuyet ? '<label class="sm">Ghi chú (bắt buộc khi từ chối, ≥ 20 ký tự)<textarea rows="2"></textarea></label><div class="row" style="gap:8px">' +
            '<button class="btn" data-id="' + h(d.id) + '" data-q="daDuyet" onclick="G.vvDuyetNhom(this)">Duyệt</button>' +
            '<button class="btn ghost" data-id="' + h(d.id) + '" data-q="tuChoi" onclick="G.vvDuyetNhom(this)">Từ chối</button></div>' : '') + '</div>';
      }).join('');
    }
    o += U.sec('Bảy dấu hiệu của từng nhà', x.soNeu + ' nhà máy nêu cần xem xét · ' + x.soNha + ' nhà đang học');
    o += U.tbl(['Nhà', 'Nhóm', 'Dấu hiệu', 'Máy nêu', 'Cần hỗ trợ', 'Phụ trách'].concat(x.xemTien ? ['Doanh thu 12 tháng'] : []), x.ds.map(function (d) {
      var dau = d.dau.map(function (z) { return '<span class="vv-dau ' + (z.dat === true ? 'co' : (z.dat === null ? 'chua' : 'khong')) + '" title="' + h(z.ten) + '">' + h(z.ma.slice(0, 2)) + '</span>'; }).join('');
      return [h(d.maNha) + (d.ten ? '<br><span class="tiny muted">' + h(d.ten) + '</span>' : ''), h(d.nhom), dau + '<br><span class="tiny">' + d.dat + '/7' + (d.chuaBiet ? ' · ' + d.chuaBiet + ' chưa biết' : '') + '</span>',
        d.neu ? nhan(d.neu, 'vang') : '—', d.recovery ? nhan(d.recovery.join(', '), 'do') : '—', h(d.phuTrach.coach) + (d.phuTrach.tuVan ? ' · ' + h(d.phuTrach.tuVan) : '')]
        .concat(x.xemTien ? [tien(d.doanhThu12)] : []);
    }));
    o += U.sec('Đề xuất nhóm cho một nhà', 'Lý do ≥ 30 ký tự, nói bằng dữ kiện');
    o += '<form class="card vv-form" onsubmit="return G.vvDeXuat(this)"><label>Mã nhà<input name="maNha" required></label>' +
      '<label>Nhóm<select name="nhom"><option value="VVIP">VVIP — Strategic</option><option value="VIP">VIP — Growth</option><option value="CORE">Rút về Core</option></select></label>' +
      '<label class="vv-rong">Lý do bằng dữ kiện<textarea name="lyDo" rows="3" minlength="30" required></textarea></label>' +
      '<button class="btn" type="submit">Gửi đề xuất</button></form>';
    return o;
  }

  function vePhucVu() {
    var x = G.VV.pv;
    if (!x) { TAI.phucvu(); return cho(); }
    if (!x.ok) return loi(x);
    var o = '<p class="sm">' + h(x.luat) + '</p><p class="sm">' + x.tong + ' nhà trọng điểm · <b>' + x.quaHan + '</b> quá hạn chạm · <b>' + x.quaHanGapDoi + '</b> quá gấp đôi nhịp · ' + x.coKeHoach + ' có kế hoạch tiếp theo.</p>';
    o += U.tbl(['Nhà', 'Nhóm', 'Ngày từ lượt chạm cuối', 'Nhịp', 'Người phục vụ', 'Kế hoạch tiếp theo'], x.ds.map(function (d) {
      return [h(d.maNha), h(d.nhom) + (d.recovery ? '<br>' + nhan('cần hỗ trợ', 'do') : ''),
        (d.ngayTuChamCuoi == null ? 'chưa chạm lần nào' : d.ngayTuChamCuoi + ' ngày') + (d.quaHanGapDoi ? ' ' + nhan('quá gấp đôi', 'do') : (d.quaHan ? ' ' + nhan('quá hạn', 'vang') : '')),
        d.nhip + ' ngày', h(d.coach) + (d.hangCoach ? ' · hạng ' + h(d.hangCoach) : '') + (d.ngoaiChuan ? ' ' + nhan('ngoài chuẩn', 'vang') : '') + (d.chuaPhanCongChuan ? '<br><span class="tiny muted">chưa phân công theo chuẩn</span>' : ''),
        d.coKeHoachTiep ? h(d.phuTrachCRM) + ' · hẹn ' + h(d.henTiep) : nhan('thiếu', 'vang')];
    }));
    o += U.sec('Phân công người phục vụ', 'Hạng đọc từ bảng xếp hạng lương thưởng tháng trước — VVIP cần hạng A');
    o += '<form class="card vv-form" onsubmit="return G.vvPhanCong(this)"><label>Mã nhà<input name="maNha" required></label>' +
      '<label>Vai<select name="vaiTro"><option value="coach">Coach phục vụ chính</option><option value="tuVan">Tư vấn viên</option></select></label>' +
      '<label>Tên đăng nhập nhân sự<input name="nguoi" required></label>' +
      '<label class="vv-rong">Lý do (bắt buộc ≥ 40 ký tự nếu giao người hạng B cho nhà VVIP)<textarea name="lyDo" rows="2"></textarea></label>' +
      '<button class="btn" type="submit">Phân công</button></form>';
    return o;
  }

  function veHoSo() {
    var nd = G.VV.nd, x = G.VV.hs;
    var o = '<form class="card vv-form" onsubmit="return G.vvMoHoSo(this)"><label>Mã nhà<input name="maNha" value="' + h(G.VV.maNha) + '" required></label>' +
      '<button class="btn" type="submit">Mở bộ hồ sơ</button><p class="tiny muted vv-rong">Mỗi lượt mở được ghi vào nhật ký (Luật 91 · ai truy cập dữ liệu gia đình nào).</p></form>';
    if (nd && nd.ok) o += '<div class="card"><b>Năm câu bộ hồ sơ phải trả lời được</b><ol class="sm">' + nd.namCauHoi.map(function (c) { return '<li>' + h(c) + '</li>'; }).join('') + '</ol></div>';
    if (!G.VV.maNha) return o;
    if (!x) return o + cho();
    if (!x.ok) return o + loi(x);
    o += '<p class="sm">Độ đầy: <b>' + x.doDay.coBan + '/' + x.doDay.canViet + '</b> tài liệu cần viết đã có' + (x.doDay.thieu.length ? ' · còn thiếu ' + h(x.doDay.thieu.join(', ')) : '') + '.</p>';
    o += x.taiLieu.map(function (t) {
      var ban = x.ban[t.ma], may = x.may[t.ma];
      var s = '<details class="card vv-tl"' + (t.ma === '01' ? ' open' : '') + '><summary><b>' + h(t.ma) + ' · ' + h(t.ten) + '</b> <span class="tiny muted">' + h(t.en) + '</span> ' +
        nhan(t.nguon === 'may' ? 'máy ghép' : (t.nguon === 'ghep' ? 'viết + máy' : 'người viết'), t.nguon === 'may' ? 'xanh' : '') + (t.truong ? (ban ? ' ' + nhan('bản ' + ban.phienBan) : ' ' + nhan('chưa có', 'vang')) : '') + '</summary>' +
        '<p class="sm muted">' + h(t.muc) + '</p>';
      if (may) s += '<div class="vv-may"><div class="tiny muted">Máy ghép từ sổ</div><pre>' + h(JSON.stringify(may, null, 2)) + '</pre></div>';
      else if (t.taiChinh) s += '<p class="tiny muted">Tài liệu tài chính — chỉ R01–R03.</p>';
      if (t.may && !may) s += '<p class="tiny muted">' + h(t.may) + '</p>';
      if (t.truong) {
        s += '<form class="vv-form" data-tl="' + h(t.ma) + '" onsubmit="return G.vvLuuTaiLieu(this)">' + t.truong.map(function (f) {
          var v = ban && ban.noiDung[f.k] || '';
          return '<label class="vv-rong">' + h(f.t) + (f.batBuoc ? ' *' : '') + '<span class="tiny muted">' + h(f.vi) + '</span><textarea data-k="' + h(f.k) + '" rows="2">' + h(v) + '</textarea></label>';
        }).join('') + (t.conCan ? '<p class="tiny muted vv-rong">Tài liệu này chứa dữ liệu về con: chỉ lưu được khi cha mẹ đã ký đồng ý dữ liệu con.</p>' : '') +
          '<button class="btn" type="submit">Lưu thành bản mới</button>' + (ban ? '<span class="tiny muted">bản ' + ban.phienBan + ' · ' + h(ban.boiAi) + '</span>' : '') + '</form>';
      }
      return s + '</details>';
    }).join('');
    return o;
  }

  function veWow() {
    var x = G.VV.dc, nd = G.VV.nd;
    if (!x) { TAI.wow(); return cho(); }
    if (!x.ok) return loi(x);
    var o = '<p class="sm">' + h(x.quyMo) + '</p>';
    o += U.tbl(['Giai đoạn', 'Phân bổ thiết kế', 'Đang bật', 'Tổng trong thư viện'], x.theoGiaiDoan.map(function (g) {
      return [h(g.ma + ' · ' + g.ten), g.phanBo.toLocaleString('vi-VN'), '<b>' + g.dangBat + '</b>', g.tong];
    }));
    o += '<p class="sm">Đang bật <b>' + x.dangBat + '</b> · mốc thử nghiệm ' + x.moc + ' · sức chứa ' + x.sucChua.toLocaleString('vi-VN') +
      (x.chuaPhanBo ? ' · <b>' + x.chuaPhanBo.toLocaleString('vi-VN') + ' chưa phân bổ</b> (năm con số của Blueprint cộng ra ' + (x.sucChua - x.chuaPhanBo).toLocaleString('vi-VN') + ' — giữ làm dự phòng, phân bổ sau 90 ngày thử theo QD6)' : '') + '</p>';
    if (G.S && G.S.acc && G.S.acc.role === 'R01') o += '<button class="btn ghost" onclick="G.vvNapMau()">Nạp 10 điểm chạm mẫu (chờ duyệt)</button>';
    o += U.sec('Thư viện', 'Đủ bảy lớp mới nộp · người khác người soạn tích đủ mười tiêu chuẩn mới bật');
    var chuan = nd && nd.ok ? nd.chuanWow10 : [];
    o += x.ds.length ? x.ds.map(function (d) {
      var s = '<details class="card vv-dc"><summary><b>' + h(d.ma) + ' · ' + h(d.ten) + '</b> ' + nhan(d.giaiDoan) + ' ' + nhan(d.nhomWow) + ' ' +
        nhan(d.trangThai === 'daDuyet' ? 'đang bật' : (d.trangThai === 'tamDung' ? 'tạm dừng' : 'chờ duyệt'), d.trangThai === 'daDuyet' ? 'xanh' : 'vang') + '</summary>';
      s += (nd && nd.ok ? nd.lop7 : []).map(function (l) { return '<div class="tt-o"><b>' + h(l.ten) + '</b><span>' + h(d[l.k] || '') + '</span></div>'; }).join('');
      s += '<p class="tiny muted">Soạn: ' + h(d.tacGia) + (d.nguoiDuyet ? ' · duyệt: ' + h(d.nguoiDuyet) : '') + '</p>';
      if (d.trangThai === 'choDuyet' && chuan.length) s += '<fieldset class="vv-chuan"><legend class="sm"><b>Mười tiêu chuẩn WOW</b></legend>' + chuan.map(function (c, i) {
        return '<label class="sm"><input type="checkbox" value="' + i + '"> ' + h(c) + '</label>'; }).join('') + '</fieldset>' +
        '<button class="btn" data-ma="' + h(d.ma) + '" onclick="G.vvDuyetDC(this)">Bật điểm chạm</button>';
      if (d.trangThai === 'daDuyet') s += '<button class="btn ghost" data-ma="' + h(d.ma) + '" onclick="G.vvDungDC(this)">Tạm dừng</button>';
      return s + '</details>';
    }).join('') : U.empty('Thư viện chưa có điểm chạm nào', 'Super Admin nạp mười điểm chạm mẫu của Blueprint, hoặc soạn điểm chạm đầu tiên ở dưới.', true);
    o += U.sec('Gửi một điểm chạm cho một nhà', 'Máy kiểm năm quy tắc tần suất rồi ghi qua sổ chạm — đèn đỏ phải gọi, người chưa qua ba cửa không chạm một mình');
    o += '<form class="card vv-form" onsubmit="return G.vvGuiDC(this)"><label>Mã điểm chạm<input name="ma" placeholder="DC-M07" required></label><label>Mã nhà<input name="maNha" required></label>' +
      '<label class="vv-rong">Nội dung đã cá nhân hoá (bỏ trống thì dùng thông điệp chuẩn)<textarea name="noiDung" rows="2"></textarea></label><button class="btn" type="submit">Gửi và ghi sổ</button></form>';
    if (nd && nd.ok) {
      o += U.sec('Soạn điểm chạm mới', 'Bảy lớp, mỗi lớp ≥ 12 ký tự');
      o += '<form class="card vv-form" onsubmit="return G.vvSoanDC(this)"><label>Mã (DC-XXXX)<input name="ma" placeholder="DC-A001"></label>' +
        '<label>Tên<input data-k="ten" required></label>' +
        '<label>Giai đoạn<select data-k="giaiDoan">' + nd.giaiDoan5.map(function (g) { return '<option value="' + h(g.ma) + '">' + h(g.ma + ' · ' + g.ten) + '</option>'; }).join('') + '</select></label>' +
        '<label>Nhóm WOW<select data-k="nhomWow">' + nd.nhomWow10.map(function (g) { return '<option value="' + h(g.ma) + '">' + h(g.ma + ' · ' + g.ten) + '</option>'; }).join('') + '</select></label>' +
        '<label>Kiểu chạm<select data-k="kieuCham"><option value="nhan">Tin nhắn</option><option value="goi">Cuộc gọi</option><option value="buoi">Buổi làm việc</option><option value="wow">Khoảnh khắc WOW</option></select></label>' +
        nd.lop7.map(function (l) { return '<label class="vv-rong">' + h(l.ten) + ' <span class="tiny muted">' + h(l.hoi) + '</span><textarea data-k="' + h(l.k) + '" rows="2" required></textarea></label>'; }).join('') +
        '<button class="btn" type="submit">Nộp chờ duyệt</button></form>';
    }
    return o;
  }

  function veChienDich() {
    var x = G.VV.cd;
    if (!x) { TAI.chiendich(); return cho(); }
    if (!x.ok) return loi(x);
    var vai = G.S && G.S.acc ? G.S.acc.role : '', duyet = /^R0[1-3]$/.test(vai);
    var o = '<p class="sm muted">' + h(x.giaDinh) + ' Gắn mã chiến dịch (CD:…) vào ô căn cứ của lượt chạm để lượt ấy được tính.</p>';
    o += x.ds.length ? U.tbl(['Chiến dịch', 'Trạng thái', 'Đối tượng', 'Đã chạm', 'Doanh thu (trong / trước)', ''], x.ds.map(function (c) {
      return ['<b>' + h(c.ten) + '</b><br><span class="tiny muted">' + h(c.mau) + ' · ' + h(c.batDau) + ' → ' + h(c.ketThuc) + ' · ' + h(c.id) + '</span><br><span class="tiny">' + h(c.mucTieu) + '</span>',
        h(c.trangThai), c.ketQua.soDoiTuong + ' nhà', c.ketQua.daCham + ' (' + pct(c.ketQua.phuSong) + ')',
        c.ketQua.doanhThuTrong === undefined ? '<span class="tiny muted">chỉ R01–R03</span>' : tien(c.ketQua.doanhThuTrong) + ' / ' + tien(c.ketQua.doanhThuTruoc),
        duyet && c.trangThai === 'choDuyet' ? '<button class="btn" data-id="' + h(c.id) + '" data-q="daDuyet" onclick="G.vvDuyetCD(this)">Duyệt</button> <button class="btn ghost" data-id="' + h(c.id) + '" data-q="tuChoi" onclick="G.vvDuyetCD(this)">Từ chối</button>' : ''];
    })) : U.empty('Chưa có chiến dịch nào', 'Lập chiến dịch đầu tiên từ một trong mười sáu mẫu ở dưới.', true);
    var mau = x.mau || { mkt: [], chamSoc: [] };
    o += U.sec('Lập chiến dịch', 'Mục tiêu đo được · ranh giới KHÔNG làm · tối đa 120 ngày · người khác duyệt');
    o += '<form class="card vv-form" onsubmit="return G.vvLapCD(this)"><label>Mẫu<select name="mau">' +
      mau.mkt.map(function (m) { return '<option value="' + h(m.ma) + '">' + h(m.ma + ' · ' + m.ten) + '</option>'; }).join('') +
      mau.chamSoc.map(function (m) { return '<option value="' + h(m.ma) + '">' + h(m.ma + ' · ' + m.ten) + '</option>'; }).join('') + '<option value="KHAC">Khác</option></select></label>' +
      '<label>Tên<input name="ten" required></label><label>Bắt đầu<input type="date" name="batDau" required></label><label>Kết thúc<input type="date" name="ketThuc" required></label>' +
      '<fieldset class="vv-rong"><legend class="sm">Đối tượng</legend>' + ['VVIP', 'VIP', 'CORE', 'NURTURE'].map(function (z) { return '<label class="sm"><input type="checkbox" name="doiTuong" value="' + z + '"> ' + z + '</label>'; }).join(' ') + '</fieldset>' +
      '<label class="vv-rong">Mục tiêu (thay đổi đo được)<textarea name="mucTieu" rows="2" required></textarea></label>' +
      '<label class="vv-rong">Đo thế nào<textarea name="doLuong" rows="2" required></textarea></label>' +
      '<label class="vv-rong">Nội dung triển khai<textarea name="noiDung" rows="3" required></textarea></label>' +
      '<label class="vv-rong">Ranh giới — điều KHÔNG làm<textarea name="khongLam" rows="2" required></textarea></label>' +
      '<button class="btn" type="submit">Lập chiến dịch</button></form>';
    o += U.sec('Mẫu chiến dịch');
    o += U.tbl(['Mã', 'Tên', 'Ý tưởng / mục tiêu', 'Bước chuyển đổi / ranh giới'], mau.mkt.map(function (m) { return [h(m.ma), h(m.ten), h(m.y), h(m.buoc)]; })
      .concat(mau.chamSoc.map(function (m) { return [h(m.ma), h(m.ten), h(m.mucTieu), h(m.khong)]; })));
    return o;
  }

  function danhSach(a) { return '<ul class="sm vv-ds">' + (a || []).map(function (x) { return '<li>' + h(x) + '</li>'; }).join('') + '</ul>'; }
  function veBlueprint() {
    var n = G.VV.nd;
    if (!n) return cho();
    if (!n.ok) return loi(n);
    var o = '<div class="card vv-bia"><div class="up">' + h(n.meta.phienBan) + '</div><h2>' + h(n.meta.ten) + '</h2><p>' + h(n.meta.phu) + '</p><p class="sm muted">' + h(n.meta.doiTuong) + '</p>' +
      '<p>' + h(n.meta.luanDiem) + '</p><p class="sm"><b>' + h(n.meta.muc80) + '</b></p></div>';
    o += U.sec('Sáu năng lực trong một kiến trúc');
    o += U.tbl(['Năng lực', 'Ý nghĩa', 'Trong hệ'], n.meta.sauNangLuc.map(function (x) { return [h(x.ten), h(x.y), h(x.trongHe)]; }));
    o += U.sec('Phần I · Cây Tiền → GITA 365', n.cayTien.nguon);
    o += U.tbl(['Chuyển hoá', 'Ý nghĩa', 'Trong hệ'], n.cayTien.chuyenHoa.map(function (x) { return [h(x.ten), h(x.y), h(x.trongHe)]; }));
    o += U.tbl(['Nguyên tắc', 'Ý nghĩa', 'Trong hệ'], n.cayTien.nguyenTac.map(function (x) { return [h(x.ten), h(x.y), h(x.trongHe)]; }));
    o += U.sec('Phần II · Bộ hồ sơ 12 tài liệu và năm nhóm quản trị');
    o += U.tbl(['Mã', 'Tài liệu', 'Nội dung', 'Nguồn'], n.hoSo12.map(function (t) { return [h(t.ma), h(t.ten) + '<br><span class="tiny muted">' + h(t.en) + '</span>', h(t.muc), h(t.nguon === 'may' ? 'máy ghép' : (t.nguon === 'ghep' ? 'viết + máy' : 'người viết'))]; }));
    o += U.tbl(['Nhóm', 'Đặc điểm', 'Cách phục vụ', 'Nhịp chạm'], n.nhom5.map(function (g) { return [h(g.ten), h(g.dacDiem), h(g.phucVu), g.nhip ? g.nhip + ' ngày' : '—']; }));
    o += '<p class="sm"><b>' + h(n.luatNhom) + '</b></p>';
    o += U.sec('Phần III · 10K WOW Touchpoint Engine', n.quyMoWow);
    o += U.tbl(['Lớp', 'Câu hỏi'], n.lop7.map(function (l) { return [h(l.ten), h(l.hoi)]; }));
    o += U.tbl(['Nhóm', 'Trải nghiệm', 'Ví dụ'], n.nhomWow10.map(function (g) { return [h(g.ma), h(g.ten), h(g.vd)]; }));
    o += '<p class="sm">' + h(n.wowKhongDat) + '</p>';
    o += U.tbl(['Quy tắc tần suất', 'Răng trong hệ'], n.tanSuat5.map(function (t) { return [h(t.y), h(t.rang)]; }));
    o += '<div class="card"><b>Mười tiêu chuẩn WOW</b>' + danhSach(n.chuanWow10) + '</div>';
    o += U.sec('Phần IV · Hệ sản phẩm', n.luatSanPham);
    o += U.tbl(['Mã', 'Sản phẩm', 'Vai', 'Gồm'], n.sanPham6.map(function (p) { return [h(p.ma), h(p.ten), h(p.vai) + (p.dieuKien ? '<br><span class="tiny muted">' + h(p.dieuKien) + '</span>' : ''), h(p.gom.join(' · '))]; }));
    o += U.tbl(['Từ', 'Có / tới', 'Chưa'], n.chuyenTiep.map(function (c) { return [h(c.tu), h(c.co || c.den || ''), h(c.chua || '')]; }));
    o += U.sec('Phần V · Demand Generation & Growth Engine', n.khaiThacDinhNghia);
    o += U.tbl(['Động cơ', 'Ý tưởng', 'Chỉ số'], n.dongCo6.map(function (d) { return [h(d.ten), h(d.y), h(d.chiSo)]; }));
    o += '<div class="card"><b>Phễu chuẩn</b><ol class="sm">' + n.pheu11.map(function (p) { return '<li>' + h(p) + '</li>'; }).join('') + '</ol></div>';
    o += U.tbl(['Khi', 'Làm'], n.khaiThac7.map(function (k) { return [h(k.khi), h(k.lam)]; }));
    o += U.sec('Phần VI · Mục tiêu 80%', n.mucTieu80.canhBao);
    o += U.tbl(['Chỉ số', 'Nghĩa'], n.mucTieu80.baChiSo.map(function (c) { return [h(c.ten), h(c.y)]; }));
    o += '<div class="card"><b>Công thức</b>' + danhSach(n.mucTieu80.congThuc) + '<p class="sm muted">' + h(n.mucTieu80.viDu.ghiChu) + ' ' + h(n.mucTieu80.viDu.ketLuan) + '</p></div>';
    o += U.tbl(['Bước', 'Việc', 'Trong hệ'], n.mucTieu80.namBuoc.map(function (b) { return [h(b.ten), h(b.y), h(b.trongHe)]; }));
    o += U.sec('Phần VII · Customer Intelligence & Revenue OS', n.quyTacTuDong.khuon);
    o += U.tbl(['Tầng', 'Trong hệ'], n.tang8.map(function (t) { return [h(t.ma + ' · ' + t.ten), h(t.trongHe)]; }));
    o += U.tbl(['Thành phần', 'Chức năng bắt buộc', 'Trong hệ'], n.thanhPhan8.map(function (t) { return [h(t.ten), h(t.bat), h(t.trongHe)]; }));
    o += '<div class="vv-hai"><div class="card"><b>AI tự xử lý theo quy tắc</b>' + danhSach(n.quyTacTuDong.aiTuLam) + '</div><div class="card"><b>Cần người có thẩm quyền</b>' + danhSach(n.quyTacTuDong.canNguoi) + '</div></div>';
    o += '<p class="sm">' + h(n.quyTacTuDong.ketLuan) + '</p>';
    o += U.sec('Phần IX · Lộ trình 90 ngày');
    o += U.tbl(['Ngày', 'Giai đoạn', 'Việc', 'Đầu ra', 'Hệ đã dựng'], n.loTrinh90.map(function (g) { return [g.tu + '–' + g.den, h(g.ten), h(g.viec.join(' · ')), h(g.dauRa), h(g.trongHe)]; }));
    o += '<div class="card"><b>Thứ tự ưu tiên đầu tư</b><ol class="sm">' + n.uuTienDauTu.map(function (x) { return '<li>' + h(x) + '</li>'; }).join('') + '</ol></div>';
    o += U.sec('Phần X · Quyết định của Ban điều hành', 'Máy không chọn hộ — mỗi chốt mang ngày và người chốt, đổi được bằng một lượt phát hành');
    o += U.tbl(['Mã', 'Câu hỏi', 'Đã chốt'], n.quyetDinh5.map(function (q) {
      return [h(q.ma), h(q.hoi), q.chot ? h(q.chot) + '<div class="sm muted">Chốt ' + h(q.ngay || '') + ' · ' + h(q.boi || '') + '</div>'
        : '<span class="muted">Chưa chốt — đang chạy theo giả định: ' + h(q.giaDinh) + '</span>'];
    }));
    o += U.tbl(['Nguyên tắc bảo vệ', 'Răng trong hệ'], n.baoVe6.map(function (b) { return [h(b.y), h(b.rang)]; }));
    o += '<div class="card"><b>Chuẩn người phục vụ nhà trọng điểm</b>' + danhSach(n.chuanNguoiPhucVu) + '</div>';
    o += '<div class="card vv-bia"><p>' + h(n.ketLuan.tuTuong) + '</p>' + danhSach(n.ketLuan.bonTaiSan) + '<p class="sm">' + h(n.ketLuan.moRong) + '</p></div>';
    return o;
  }

  var TABS = [['tong', 'Bảng 80%', 'chart'], ['nhan', 'Nhận diện · nhóm', 'users'], ['phucvu', 'Phục vụ · phân công', 'clock'],
    ['hoso', 'Hồ sơ 12 tài liệu', 'book'], ['wow', 'Điểm chạm WOW', 'spark'], ['chiendich', 'Chiến dịch', 'flame'], ['blueprint', 'Master Blueprint', 'crown']];

  G.VIEWS['phong-vvip'] = function () {
    napNoiDung();
    var o = U.ph({ eyebrow: 'Khách hàng & CRM · VIP/VVIP', t: 'Phòng VVIP', ic: 'crown',
      lead: 'Bốn tài sản cốt lõi của Master Blueprint 1.0: bảng điều khiển 80%, CRM nhóm trọng điểm, thư viện điểm chạm WOW và bộ hồ sơ 12 tài liệu. Mỗi con số tính từ sổ; mỗi quyết định có hai người.' });
    o += '<div class="tt-tabs" role="tablist">' + TABS.map(function (t) {
      return '<button class="tt-tab' + (G.VV.tab === t[0] ? ' on' : '') + '" role="tab" aria-selected="' + (G.VV.tab === t[0]) + '" onclick="G.vvTab(\'' + t[0] + '\')">' + ic(t[2]) + ' ' + t[1] + '</button>';
    }).join('') + '</div>';
    var tab = G.VV.tab;
    o += tab === 'tong' ? veTong() : tab === 'nhan' ? veNhan() : tab === 'phucvu' ? vePhucVu() : tab === 'hoso' ? veHoSo() :
      tab === 'wow' ? veWow() : tab === 'chiendich' ? veChienDich() : veBlueprint();
    if (tab !== 'blueprint' && tab !== 'hoso') o += '<p class="mt"><button class="btn ghost" onclick="G.vvTaiLai()">Đọc lại từ máy chủ</button></p>';
    o += '<p class="tiny muted mt">Liên quan: <a data-v="hang-vip">Phân hạng VIP & VVIP</a> · <a data-v="hoso-vip">Chuẩn hồ sơ VIP</a> · <a data-v="cay-tien">Cây tiền</a> · <a data-v="khach-lon">Khách lớn</a> · <a data-v="crm">CRM</a></p>';
    return '<div class="man-vv">' + o + '</div>';
  };
})();
