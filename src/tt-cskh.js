/* ═══════════════════════════════════════════════════════════════
   GITA 365 — TRUNG TÂM TƯ VẤN & CHĂM SÓC KHÁCH HÀNG (gói chiều sâu)

   Một chỗ cho Tư vấn/CSKH thao tác trọn ngày, nay có đủ lớp chiều sâu
   như các CRM đẳng cấp thị trường — chạy trên dữ liệu đã có:

     · ĐIỂM SỨC KHOẺ 0–100   — 5 chiều có trọng số (sử dụng 35 · gắn bó 22
                               · kết quả 23 · hỗ trợ 12 · quan hệ 8).
     · ĐIỂM RỦI RO RỜI        — từ sức khoẻ + tín hiệu (đèn, lâu chưa chạm,
                               ca hỗ trợ) → băng Thấp/Trung/Cao.
     · CHUỖI CHẠM (cadence)   — mẫu nhiều bước theo loại khách, tự chỉ ra
                               BƯỚC KẾ TIẾP và đổ vào Việc hôm nay.
     · PLAYBOOK theo vòng đời — kịch bản chuẩn bật theo tình huống/điểm.

   Tab: Hôm nay · Khách · Sức khoẻ & Rủi ro · Phễu→95% · Chuỗi chạm &
   Playbook · Hỗ trợ · Dòng chảy (quản trị CRM).

   Dữ liệu khách thật lấy từ máy chủ CRM (G.ttKhach); chưa nối thì hiện
   DANH SÁCH MINH HOẠ có nhãn rõ — đúng cách crm.js làm. Thuật toán chạy
   trên mọi nguồn. Mở cho Tư vấn trở lên; tab Dòng chảy cần crm_view.
   Không đụng máy chủ, giấy phép, mã hoá.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;
G.VIEWS = G.VIEWS || {};

(function () {
  var U = G.U, h = U.h, ic = U.ic;

  var GD = [
    { ma: 'moi', ten: 'Mới tiếp nhận', xs: 10, c: '#185AB4' },
    { ma: 'tuvan', ten: 'Đang tư vấn', xs: 30, c: '#2A72C6' },
    { ma: 'baogia', ten: 'Đã báo giá / lộ trình', xs: 50, c: '#0B6675' },
    { ma: 'damphan', ten: 'Khách cân nhắc', xs: 72, c: '#B4720F' },
    { ma: 'chotky', ten: 'Chuẩn bị ký', xs: 90, c: '#0B7350' }
  ];
  function gd(ma) { for (var i = 0; i < GD.length; i++) if (GD[i].ma === ma) return GD[i]; return GD[0]; }

  var SEG = [
    { ma: 'moi', ten: 'Khách mới', c: '#185AB4', mo: 'Mới vào phễu — tốc độ phản hồi quyết định tỷ lệ chốt.', viec: 'Gọi chào trong 24h, tư vấn lộ trình phù hợp.' },
    { ma: 'cu', ten: 'Khách đang dùng', c: '#0B7350', mo: 'Đang đồng hành — giữ hài lòng, mở rộng giá trị.', viec: 'Chạm đúng nhịp, nâng tầng khi đủ điều kiện.' },
    { ma: 'tai', ten: 'Khách tái ký', c: '#B4720F', mo: 'Hết chu kỳ — mời quay lại, ưu đãi trung thành.', viec: 'Gọi mời tái ký kèm ưu đãi, nhắc giá trị đã nhận.' },
    { ma: 'cham', ten: 'Chăm sóc lại', c: '#BE0E16', mo: 'Nguội / có dấu hiệu rời — tái chạm trước khi mất.', viec: 'Tái chạm ngay, hỏi vướng mắc, kéo lại hành trình.' }
  ];
  function seg(ma) { for (var i = 0; i < SEG.length; i++) if (SEG[i].ma === ma) return SEG[i]; return SEG[0]; }

  /* Khách MINH HOẠ — nay kèm TÍN HIỆU THÔ cho máy chấm điểm:
     dn=đăng nhập/30 ngày · nv=% nhiệm vụ nhà làm · tb=tiến bộ tầng ·
     ca=ca hỗ trợ đang mở · tt=% thanh toán đúng hạn · gt_ref=giới thiệu ·
     buoc=đang ở bước thứ mấy của chuỗi chạm. */
  var MAU = [
    { ten: 'Nhà Trung Nguyên', ma: 'GITA-0152', loai: 'moi', gd: 'moi', band: 'VANG', gt: 15000000, cham: 0, chot: 3, dn: 12, nv: 40, tb: 20, ca: 0, tt: 100, ref: 0, buoc: 0 },
    { ten: 'Nhà Phương Thảo', ma: 'GITA-0153', loai: 'moi', gd: 'tuvan', band: 'XANH', gt: 18000000, cham: 1, chot: 5, dn: 18, nv: 55, tb: 30, ca: 0, tt: 100, ref: 1, buoc: 1 },
    { ten: 'Nhà Văn Nghĩa', ma: 'GITA-0154', loai: 'moi', gd: 'moi', band: 'DO', gt: 12000000, cham: 3, chot: 2, dn: 5, nv: 15, tb: 10, ca: 1, tt: 80, ref: 0, buoc: 0 },
    { ten: 'Nhà Núi Nguyên', ma: 'GITA-0140', loai: 'cu', gd: 'baogia', band: 'XANH', gt: 30000000, cham: 2, chot: 6, dn: 24, nv: 85, tb: 70, ca: 0, tt: 100, ref: 2, buoc: 2 },
    { ten: 'Nhà Nguyễn Thị Hoa', ma: 'GITA-0141', loai: 'cu', gd: 'damphan', band: 'VANG', gt: 22000000, cham: 4, chot: 1, dn: 14, nv: 60, tb: 55, ca: 1, tt: 90, ref: 1, buoc: 2 },
    { ten: 'Nhà Trần Thị Lan', ma: 'GITA-0142', loai: 'tai', gd: 'tuvan', band: 'VANG', gt: 50000000, cham: 7, chot: 4, dn: 8, nv: 45, tb: 40, ca: 0, tt: 70, ref: 0, buoc: 1 },
    { ten: 'Nhà Vinachay', ma: 'GITA-0130', loai: 'tai', gd: 'baogia', band: 'DO', gt: 15000000, cham: 9, chot: 0, dn: 3, nv: 20, tb: 25, ca: 2, tt: 60, ref: 0, buoc: 0 },
    { ten: 'Nhà Khánh Vy', ma: 'GITA-0160', loai: 'cham', gd: 'damphan', band: 'DO', gt: 28000000, cham: 12, chot: 2, dn: 2, nv: 10, tb: 15, ca: 2, tt: 50, ref: 0, buoc: 0 },
    { ten: 'Nhà Bảo Châu', ma: 'GITA-0151', loai: 'cham', gd: 'chotky', band: 'VANG', gt: 40000000, cham: 5, chot: 1, dn: 10, nv: 50, tb: 45, ca: 1, tt: 85, ref: 1, buoc: 2 },
    { ten: 'Nhà Thảo Nguyên', ma: 'GITA-0167', loai: 'cu', gd: 'tuvan', band: 'XANH', gt: 20000000, cham: 1, chot: 8, dn: 22, nv: 80, tb: 65, ca: 0, tt: 100, ref: 3, buoc: 1 },
    { ten: 'Nhà Quốc Bảo', ma: 'GITA-0170', loai: 'moi', gd: 'moi', band: 'VANG', gt: 16000000, cham: 0, chot: 7, dn: 9, nv: 30, tb: 15, ca: 0, tt: 100, ref: 0, buoc: 0 },
    { ten: 'Nhà An Nhiên', ma: 'GITA-0145', loai: 'cham', gd: 'baogia', band: 'DO', gt: 25000000, cham: 15, chot: 3, dn: 1, nv: 8, tb: 12, ca: 3, tt: 40, ref: 0, buoc: 0 }
  ];
  /* ── NỐI KHÁCH THẬT từ máy chủ CRM (cùng cửa 'crmDanhSach' màn CRM dùng) ──
     Chỉ ĐỌC phía client, KHÔNG sửa máy chủ. Nạp bất đồng bộ rồi vẽ lại một
     lần; chưa nối / lỗi / rỗng → dùng danh sách minh hoạ (nhãn rõ). */
  function num(x) { var n = Number(x); return isNaN(n) ? 0 : n; }
  function soNgayToi(v) { if (!v) return 7; var d = new Date(v); if (isNaN(d.getTime())) return 7; return Math.max(0, Math.ceil((d - Date.now()) / 86400000)); }
  function suyLoai(gdMa, band, cham, nhan) {
    if (nhan && /tái|gia hạn|renew/i.test(String(nhan))) return 'tai';
    if (band === 'DO' || cham >= 10) return 'cham';
    if (gdMa === 'moi' || gdMa === 'tuvan') return 'moi';
    return 'cu';
  }
  function mapKhach(x) {
    var gdMa = ['moi', 'tuvan', 'baogia', 'damphan', 'chotky'].indexOf(x.giaiDoan) >= 0 ? x.giaiDoan : 'tuvan';
    var band = String(x.band || x.den || '').toUpperCase(); if (['DO', 'VANG', 'XANH'].indexOf(band) < 0) band = 'VANG';
    var cham = (x.lanCham != null) ? num(x.lanCham)
      : (x.chamCuoi ? Math.max(0, Math.ceil((Date.now() - new Date(x.chamCuoi)) / 86400000))
        : (band === 'DO' ? 11 : band === 'VANG' ? 4 : 1));
    var loai = (x.loai && ['moi', 'cu', 'tai', 'cham'].indexOf(x.loai) >= 0) ? x.loai : suyLoai(gdMa, band, cham, x.nhan);
    return {
      ten: x.ten || x.nha || x.maKH || '—', ma: x.maKH || x.ma || '', gt: num(x.giaTri),
      gd: gdMa, band: band, cham: cham, chot: soNgayToi(x.duKienChot || x.chot || x.henTiep),
      loai: loai, phuTrach: x.nguoiPhuTrach || x.phuTrach || '', buoc: num(x.buoc), that: true
    };
  }
  if (typeof G.ttKho === 'undefined') G.ttKho = null;
  G.ttTai = false; G.ttDaThu = (typeof G.ttDaThu !== 'undefined') ? G.ttDaThu : false;
  G.ttKhach = function () { return G.ttKho; };
  G.ttNapKhach = function () {
    if (G.ttTai || G.ttDaThu || typeof G.goiMayChu !== 'function') return;
    G.ttTai = true;
    try {
      G.goiMayChu('crmDanhSach', { q: '', chang: '', trang: 1 }).then(function (x) {
        G.ttTai = false; G.ttDaThu = true;
        if (x && x.ok && x.ds && x.ds.length) G.ttKho = x.ds.map(mapKhach);
        if (G.render) G.render();
      }, function () { G.ttTai = false; G.ttDaThu = true; if (G.render) G.render(); });
    } catch (e) { G.ttTai = false; G.ttDaThu = true; }
  };
  /* Người dùng bấm "Tải lại khách thật" → thử nạp lại từ máy chủ. */
  G.ttTaiLai = function () { G.ttKho = null; G.ttDaThu = false; G.ttNapKhach(); if (G.render) G.render(); };
  function dsKhach() {
    var real = G.ttKhach();
    if (real && real.length) return { ds: real, that: true };
    return { ds: MAU, that: false };
  }

  var BAND = { DO: { ten: 'Đỏ', c: '#BE0E16' }, VANG: { ten: 'Vàng', c: '#B4720F' }, XANH: { ten: 'Xanh', c: '#0B7350' } };
  function tien(n) { return (n >= 1e6 ? (n / 1e6).toFixed(n % 1e6 ? 1 : 0) + ' tr' : (n || 0).toLocaleString('vi-VN')); }
  function kep(v) { return Math.max(0, Math.min(100, Math.round(v))); }

  /* ══ THUẬT TOÁN ĐIỂM SỨC KHOẺ (0–100, 5 chiều có trọng số) ══ */
  var CHIEU = [
    { ma: 'suDung', ten: 'Sử dụng / tham gia', w: 0.35, c: '#2A72C6' },
    { ma: 'ganBo', ten: 'Gắn bó', w: 0.22, c: '#5140B4' },
    { ma: 'ketQua', ten: 'Kết quả', w: 0.23, c: '#0B7350' },
    { ma: 'hoTro', ten: 'Hỗ trợ', w: 0.12, c: '#B4720F' },
    { ma: 'quanHe', ten: 'Quan hệ', w: 0.08, c: '#334E7A' }
  ];
  function chieuCua(k) {
    var recency = kep(100 - (k.cham || 0) * 7);           /* lâu chưa chạm → giảm */
    return {
      suDung: kep(kep((k.dn || 0) / 20 * 100) * 0.6 + recency * 0.4),
      ganBo: kep(k.nv || 0),
      ketQua: kep(k.tb || 0),
      hoTro: kep(100 - (k.ca || 0) * 20),
      quanHe: kep((k.tt || 0) * 0.7 + Math.min(5, k.ref || 0) / 5 * 100 * 0.3)
    };
  }
  function coTinHieu(k) { return k.dn !== undefined || k.nv !== undefined; }
  function bandSK(d) { return d >= 80 ? { t: 'Khoẻ', c: '#0B7350' } : d >= 50 ? { t: 'Theo dõi', c: '#B4720F' } : { t: 'Yếu', c: '#BE0E16' }; }
  function gdChiSo(ma) { for (var i = 0; i < GD.length; i++) if (GD[i].ma === ma) return i; return 1; }
  function diemSK(k) {
    if (coTinHieu(k)) {
      var c = chieuCua(k), d = 0;
      CHIEU.forEach(function (x) { d += c[x.ma] * x.w; });
      d = kep(d);
      return { diem: d, chieu: c, band: bandSK(d), uoc: false };
    }
    /* Khách THẬT từ danh sách CRM chưa kèm tín hiệu sản phẩm → ƯỚC LƯỢNG
       từ đèn + độ mới của lần chạm + vị trí trong phễu (minh bạch là ước
       lượng tới khi máy chủ đổ về dữ liệu sử dụng/kết quả). */
    var base = k.band === 'XANH' ? 85 : k.band === 'DO' ? 30 : 60;
    base -= Math.min(30, (k.cham || 0) * 2);
    base += gdChiSo(k.gd) * 2;
    var dd = kep(base);
    var chieu = { suDung: kep(100 - (k.cham || 0) * 7), ganBo: dd, ketQua: kep(gdChiSo(k.gd) * 20 + 20), hoTro: 70, quanHe: dd };
    return { diem: dd, chieu: chieu, band: bandSK(dd), uoc: true };
  }
  /* ══ ĐIỂM RỦI RO RỜI (0–100) ══ */
  function ruiRo(k) {
    var sk = diemSK(k).diem;
    var r = 100 - sk;
    if (k.band === 'DO') r += 15;
    if ((k.cham || 0) >= 10) r += 15;
    if ((k.ca || 0) >= 2) r += 8;
    r = kep(r);
    var band = r >= 60 ? { t: 'CAO', c: '#BE0E16' } : r >= 35 ? { t: 'TRUNG', c: '#B4720F' } : { t: 'THẤP', c: '#0B7350' };
    return { diem: r, band: band };
  }

  /* ══ CHUỖI CHẠM (cadence) theo loại khách ══ */
  var CADENCE = {
    moi: { ten: 'Chào mừng khách mới', buoc: [
      { ngay: 1, kenh: 'Gọi', viec: 'Gọi chào, xác nhận nhu cầu & tầng phù hợp' },
      { ngay: 2, kenh: 'Zalo', viec: 'Gửi lộ trình & bảng giá phù hợp' },
      { ngay: 4, kenh: 'Gọi', viec: 'Theo dõi, giải đáp băn khoăn' },
      { ngay: 7, kenh: 'Gặp/Gọi', viec: 'Chốt gói & hướng dẫn ký' } ] },
    cu: { ten: 'Giữ chân & mở rộng', buoc: [
      { ngay: 7, kenh: 'Zalo', viec: 'Chúc mừng mốc tiến bộ gần nhất' },
      { ngay: 14, kenh: 'Gọi', viec: 'Hỏi thăm, gỡ vướng, gợi ý bước kế' },
      { ngay: 30, kenh: 'Gặp/Gọi', viec: 'Đề xuất nâng tầng khi đủ điều kiện' } ] },
    tai: { ten: 'Mời tái ký', buoc: [
      { ngay: 1, kenh: 'Gọi', viec: 'Nhắc giá trị đã nhận, mời tái ký' },
      { ngay: 3, kenh: 'Zalo', viec: 'Gửi ưu đãi trung thành có hạn' },
      { ngay: 7, kenh: 'Gọi', viec: 'Chốt tái ký, xử lý e ngại' } ] },
    cham: { ten: 'Cứu khách / tái chạm', buoc: [
      { ngay: 0, kenh: 'Gọi', viec: 'Gọi NGAY hỏi vướng mắc, lắng nghe' },
      { ngay: 2, kenh: 'Gặp/Gọi', viec: 'Đưa giải pháp cụ thể, cam kết đồng hành' },
      { ngay: 5, kenh: 'Zalo', viec: 'Theo dõi, gửi tài nguyên hỗ trợ' } ] }
  };
  function cadence(k) {
    var c = CADENCE[k.loai] || CADENCE.moi;
    var i = Math.min(k.buoc || 0, c.buoc.length - 1);
    var ke = (k.buoc || 0) < c.buoc.length ? c.buoc[k.buoc || 0] : null;
    return { ten: c.ten, tong: c.buoc.length, chiSo: (k.buoc || 0), buoc: c.buoc, hienTai: c.buoc[i], ke: ke };
  }

  /* ══ PLAYBOOK theo vòng đời / tình huống ══ */
  function playbook(k) {
    var rr = ruiRo(k);
    if (rr.band.t === 'CAO') return { ten: 'Playbook CỨU KHÁCH', c: '#BE0E16', buoc: [
      'Gọi trong hôm nay — lắng nghe, không bán vội', 'Xác định đúng nguyên nhân nguội (tiến bộ · chi phí · thời gian)',
      'Đưa một giải pháp cụ thể + cam kết đồng hành 2 tuần', 'Hẹn mốc kiểm lại, ghi vào sổ chăm sóc' ] };
    if (k.loai === 'moi') return { ten: 'Playbook ONBOARDING', c: '#185AB4', buoc: [
      'Xác nhận nhu cầu & tầng phù hợp', 'Dựng lộ trình 7 ngày đầu rõ ràng',
      'Hướng dẫn mở app & làm nhiệm vụ đầu tiên', 'Chốt gói khi khách thấy giá trị' ] };
    if (k.loai === 'tai') return { ten: 'Playbook TÁI KÝ', c: '#B4720F', buoc: [
      'Tổng kết giá trị đã nhận bằng số liệu', 'Mời tái ký kèm ưu đãi trung thành',
      'Xử lý e ngại, chốt gia hạn' ] };
    return { ten: 'Playbook GIỮ CHÂN & MỞ RỘNG', c: '#0B7350', buoc: [
      'Chạm đúng nhịp, chúc mừng tiến bộ', 'Gỡ vướng sớm, giữ đèn xanh',
      'Đề xuất nâng tầng/giới thiệu khi đủ điều kiện' ] };
  }

  function bandChip(b) { var x = BAND[b] || BAND.XANH; return '<span class="tvc-band" style="--bc:' + x.c + '">' + h(x.ten) + '</span>'; }
  function segChip(ma) { var s = seg(ma); return '<span class="tvc-seg-chip" style="--sc:' + s.c + '">' + h(s.ten) + '</span>'; }
  function skChip(k) { var s = diemSK(k); return '<span class="tvc-sk" style="--kc:' + s.band.c + '">' + s.diem + '</span>'; }
  function rrChip(k) { var r = ruiRo(k); return '<span class="tvc-ut" style="--uc:' + r.band.c + '">' + r.band.t + ' ' + r.diem + '</span>'; }

  /* ── Ưu tiên việc hôm nay: rủi ro cao + chốt gần + đèn đỏ ── */
  function viecHomNay(k) {
    var rr = ruiRo(k), cad = cadence(k);
    var act = cad.ke ? (cad.ke.kenh + ': ' + cad.ke.viec) : 'Hoàn tất chuỗi — chuyển nhịp giữ chân';
    var ut = 40;
    if (k.band === 'DO' || rr.band.t === 'CAO') ut = 100;
    else if (k.chot <= 2) ut = 90;
    else if (k.loai === 'moi') ut = 72;
    else if (k.loai === 'tai') ut = 64;
    else if (k.loai === 'cham') ut = 58;
    return { v: act, ut: ut, cua: k.loai === 'cham' ? 'van-hanh-cham-soc' : (k.chot <= 2 ? 'pheu-chot' : 'ban-tu-van'), buoc: cad.ke };
  }

  /* ── Tab 1 · HÔM NAY ── */
  function tabHomNay(kq) {
    var rows = kq.ds.map(function (k) { return { k: k, w: viecHomNay(k) }; }).sort(function (a, b) { return b.w.ut - a.w.ut; });
    var khan = rows.filter(function (r) { return r.w.ut >= 90; }).length;
    var o = '<div class="tvc-note">' + ic('target', 'w-4 h-4') + ' <b>' + rows.length + ' đầu việc hôm nay</b> · ' + khan +
      ' việc khẩn (rủi ro cao / chốt gần). Việc lấy từ BƯỚC KẾ của chuỗi chạm — làm từ trên xuống, không bỏ sót.</div>';
    o += '<div class="tvc-wrap"><table class="tvc-table"><thead><tr>' +
      ['#', 'Khách', 'Loại', 'Giai đoạn', 'Sức khoẻ', 'Rủi ro', 'Việc hôm nay (bước chuỗi chạm)', 'Ưu tiên', ''].map(function (c) { return '<th>' + h(c) + '</th>'; }).join('') + '</tr></thead><tbody>';
    rows.forEach(function (r, i) {
      var k = r.k, w = r.w, g = gd(k.gd);
      var utc = w.ut >= 90 ? '#BE0E16' : w.ut >= 65 ? '#B4720F' : '#185AB4';
      var utt = w.ut >= 90 ? 'KHẨN' : w.ut >= 65 ? 'CAO' : 'THƯỜNG';
      o += '<tr><td class="tvc-stt">' + (i + 1) + '</td>' +
        '<td><b>' + h(k.ten) + '</b><div class="tiny muted">' + h(k.ma) + '</div></td>' +
        '<td>' + segChip(k.loai) + '</td>' +
        '<td><span class="tvc-gd" style="--gc:' + g.c + '">' + h(g.ten) + '</span></td>' +
        '<td>' + skChip(k) + '</td><td>' + rrChip(k) + '</td>' +
        '<td>' + h(w.v) + (k.chot <= 2 ? '<div class="tiny cvt-tre" style="margin-top:2px">dự kiến chốt trong ' + k.chot + ' ngày</div>' : '') + '</td>' +
        '<td><span class="tvc-ut" style="--uc:' + utc + '">' + utt + '</span></td>' +
        '<td><button class="btn pri sm tvc-act" data-v="' + h(w.cua) + '">Xử lý</button></td></tr>';
    });
    o += '</tbody></table></div>';
    return o;
  }

  /* ── Tab 2 · KHÁCH ── */
  function tabKhach(kq) {
    var o = '<div class="tvc-segs">';
    SEG.forEach(function (s) {
      var ds = kq.ds.filter(function (k) { return k.loai === s.ma; });
      var tbSk = ds.length ? Math.round(ds.reduce(function (a, k) { return a + diemSK(k).diem; }, 0) / ds.length) : 0;
      var do_ = ds.filter(function (k) { return ruiRo(k).band.t === 'CAO'; }).length;
      o += '<div class="tvc-seg" style="--sc:' + s.c + '"><div class="tvc-seg-top"><b>' + h(s.ten) + '</b><span class="tvc-seg-n">' + ds.length + '</span></div>' +
        '<p class="tiny">' + h(s.mo) + '</p>' +
        '<div class="tvc-seg-viec">' + ic('arrow', 'w-3 h-3') + ' ' + h(s.viec) + '</div>' +
        '<div class="tiny" style="margin-top:6px">Sức khoẻ TB: <b style="color:' + (tbSk >= 80 ? '#0B7350' : tbSk >= 50 ? '#B4720F' : '#BE0E16') + '">' + tbSk + '</b>' +
        (do_ ? ' · <span style="color:#BE0E16;font-weight:700">' + do_ + ' nhà rủi ro cao</span>' : ' · <span style="color:#0B7350">ổn</span>') + '</div></div>';
    });
    o += '</div>';
    o += '<div class="tvc-wrap" style="margin-top:14px"><table class="tvc-table"><thead><tr>' +
      ['Khách', 'Loại', 'Giai đoạn', 'Sức khoẻ', 'Rủi ro', 'Giá trị', 'Lần chạm', ''].map(function (c) { return '<th>' + h(c) + '</th>'; }).join('') + '</tr></thead><tbody>';
    kq.ds.slice().sort(function (a, b) { return ruiRo(b).diem - ruiRo(a).diem; }).forEach(function (k) {
      var g = gd(k.gd);
      o += '<tr><td><b>' + h(k.ten) + '</b><div class="tiny muted">' + h(k.ma) + '</div></td>' +
        '<td>' + segChip(k.loai) + '</td>' +
        '<td><span class="tvc-gd" style="--gc:' + g.c + '">' + h(g.ten) + '</span></td>' +
        '<td>' + skChip(k) + '</td><td>' + rrChip(k) + '</td>' +
        '<td class="tvc-tien">' + tien(k.gt) + '</td>' +
        '<td class="' + (k.cham >= 10 ? 'cvt-tre' : 'muted') + ' tiny">' + (k.cham === 0 ? 'hôm nay' : k.cham + ' ngày trước') + '</td>' +
        '<td><button class="btn ghost sm tvc-act" data-v="crm">Hồ sơ</button></td></tr>';
    });
    o += '</tbody></table></div>';
    return o;
  }

  /* ── Tab 3 · SỨC KHOẺ & RỦI RO ── */
  function tabSucKhoe(kq) {
    var khoe = kq.ds.filter(function (k) { return diemSK(k).diem >= 80; }).length;
    var theoDoi = kq.ds.filter(function (k) { var d = diemSK(k).diem; return d >= 50 && d < 80; }).length;
    var yeu = kq.ds.filter(function (k) { return diemSK(k).diem < 50; }).length;
    var tb = kq.ds.length ? Math.round(kq.ds.reduce(function (a, k) { return a + diemSK(k).diem; }, 0) / kq.ds.length) : 0;
    var caoRR = kq.ds.filter(function (k) { return ruiRo(k).band.t === 'CAO'; }).sort(function (a, b) { return ruiRo(b).diem - ruiRo(a).diem; });

    var o = '<div class="grid g4 mb">' +
      U.stat({ k: 'Sức khoẻ TB', v: String(tb), d: 'trên 100', c: tb >= 80 ? '#0B7350' : tb >= 50 ? '#B4720F' : '#BE0E16' }) +
      U.stat({ k: 'Khoẻ (≥80)', v: String(khoe), d: 'mở rộng được', c: '#0B7350' }) +
      U.stat({ k: 'Theo dõi (50–79)', v: String(theoDoi), d: 'giữ nhịp', c: '#B4720F' }) +
      U.stat({ k: 'Rủi ro rời cao', v: String(caoRR.length), d: 'cứu ngay', c: '#BE0E16' }) +
      '</div>';

    o += U.sec('CÁCH CHẤM ĐIỂM SỨC KHOẺ', 'Năm chiều có trọng số — cộng lại thành một điểm 0–100');
    o += '<div class="tvc-chieu">';
    CHIEU.forEach(function (x) {
      o += '<div class="tvc-chieu-row"><div class="tvc-chieu-ten"><b>' + h(x.ten) + '</b><span class="tiny muted">trọng số ' + Math.round(x.w * 100) + '%</span></div>' +
        '<div class="tvc-chieu-bar" style="width:' + Math.round(x.w * 100 * 2.2) + '%;background:' + x.c + '"></div></div>';
    });
    o += '</div>';

    o += U.sec('KHÁCH RỦI RO RỜI CAO — CỨU TRƯỚC', caoRR.length ? 'Xếp theo điểm rủi ro, kèm playbook bật sẵn' : 'Không có khách rủi ro cao — tốt!');
    if (caoRR.length) {
      o += '<div class="tvc-wrap"><table class="tvc-table"><thead><tr>' +
        ['Khách', 'Sức khoẻ', 'Rủi ro', 'Vì sao yếu', 'Playbook bật sẵn', ''].map(function (c) { return '<th>' + h(c) + '</th>'; }).join('') + '</tr></thead><tbody>';
      caoRR.forEach(function (k) {
        var sk = diemSK(k), pb = playbook(k);
        var yeuNhat = CHIEU.slice().sort(function (a, b) { return sk.chieu[a.ma] - sk.chieu[b.ma]; })[0];
        o += '<tr><td><b>' + h(k.ten) + '</b><div class="tiny muted">' + h(k.ma) + '</div></td>' +
          '<td>' + skChip(k) + '</td><td>' + rrChip(k) + '</td>' +
          '<td class="tiny">' + h(yeuNhat.ten) + ' thấp (' + sk.chieu[yeuNhat.ma] + ')' + (k.cham >= 10 ? ' · ' + k.cham + ' ngày chưa chạm' : '') + '</td>' +
          '<td><span class="tvc-pb" style="--pc:' + pb.c + '">' + h(pb.ten) + '</span></td>' +
          '<td><button class="btn pri sm tvc-act" data-v="van-hanh-cham-soc">Cứu ngay</button></td></tr>';
      });
      o += '</tbody></table></div>';
    }
    return o;
  }

  /* ── Tab 4 · PHỄU → 95% ── */
  function tabPheu(kq) {
    var byGd = GD.map(function (g) { var ds = kq.ds.filter(function (k) { return k.gd === g.ma; }); return { g: g, so: ds.length, gt: ds.reduce(function (s, k) { return s + k.gt; }, 0) }; });
    var tongSo = byGd.reduce(function (s, x) { return s + x.so; }, 0);
    var tongGt = byGd.reduce(function (s, x) { return s + x.gt; }, 0);
    var duBao = byGd.reduce(function (s, x) { return s + x.gt * x.g.xs / 100; }, 0);
    var tyLe = tongGt ? Math.round(duBao / tongGt * 100) : 0;
    var roi = byGd.filter(function (x) { return x.so; }).sort(function (a, b) { return (b.so * (100 - b.g.xs)) - (a.so * (100 - a.g.xs)); })[0];
    var o = '<div class="grid g4 mb">' +
      U.stat({ k: 'Cơ hội đang mở', v: String(tongSo), d: 'khách trong phễu', c: 'var(--gita)' }) +
      U.stat({ k: 'Tổng giá trị mở', v: tien(tongGt), d: 'đồng', c: 'var(--gita-sau)' }) +
      U.stat({ k: 'Tỷ lệ chốt dự kiến', v: tyLe + '%', d: 'mục tiêu 95%', c: tyLe >= 95 ? '#0B7350' : '#B4720F' }) +
      U.stat({ k: 'Cần kéo thêm', v: Math.max(0, 95 - tyLe) + '%', d: 'để đạt mục tiêu', c: '#BE0E16' }) + '</div>';
    o += '<div class="tvc-gauge"><div class="tvc-gauge-bar"><i style="width:' + Math.min(100, tyLe) + '%"></i><span class="tvc-gauge-tar" style="left:95%"></span></div>' +
      '<div class="tiny muted">Tỷ lệ chốt dự kiến <b>' + tyLe + '%</b> · vạch mục tiêu <b>95%</b></div></div>';
    o += '<div class="tvc-pheu">';
    byGd.forEach(function (x, i) {
      var w = Math.max(28, 100 - i * 15);
      o += '<div class="tvc-pheu-row"><div class="tvc-pheu-ten"><b>' + h(x.g.ten) + '</b><span class="tiny muted">chốt ~' + x.g.xs + '%</span></div>' +
        '<div class="tvc-pheu-bar" style="width:' + w + '%;background:' + x.g.c + '"><span>' + x.so + ' khách · ' + tien(x.gt) + '</span></div></div>';
    });
    o += '</div>';
    if (roi) o += '<div class="tvc-note tvc-note-do">' + ic('alert', 'w-4 h-4') + ' <b>Điểm rơi lớn nhất: "' + h(roi.g.ten) + '"</b> — ' +
      roi.so + ' khách kẹt ở chặng chốt ~' + roi.g.xs + '%. Dồn lực đẩy chặng này kéo tỷ lệ chốt lên nhanh nhất. ' +
      '<button class="btn ghost sm tvc-act" style="margin-left:6px" data-v="pheu-chot">Mở phễu chốt</button></div>';
    return o;
  }

  /* ── Tab 5 · CHUỖI CHẠM & PLAYBOOK ── */
  function tabChuoiCham(kq) {
    var o = U.sec('THƯ VIỆN CHUỖI CHẠM', 'Mẫu nhiều bước theo loại khách — bước kế tự đổ vào Việc hôm nay');
    o += '<div class="tvc-cad">';
    SEG.forEach(function (s) {
      var c = CADENCE[s.ma] || CADENCE.moi;
      o += '<div class="tvc-cad-card" style="--sc:' + s.c + '"><b>' + h(c.ten) + '</b><div class="tiny muted" style="margin-bottom:8px">' + h(s.ten) + ' · ' + c.buoc.length + ' bước</div>' +
        c.buoc.map(function (b, i) {
          return '<div class="tvc-step"><span class="tvc-step-n" style="background:' + s.c + '">' + (i + 1) + '</span>' +
            '<div><b class="tiny">Ngày ' + b.ngay + ' · ' + h(b.kenh) + '</b><div class="tiny muted">' + h(b.viec) + '</div></div></div>';
        }).join('') + '</div>';
    });
    o += '</div>';

    o += U.sec('PLAYBOOK THEO VÒNG ĐỜI', 'Kịch bản chuẩn bật theo tình huống/điểm — ai làm cũng ra kết quả đều');
    var PB = [
      { ten: 'ONBOARDING (khách mới)', c: '#185AB4', khi: 'Khách mới vào phễu', buoc: playbook({ loai: 'moi', cham: 0, band: 'XANH', dn: 10, nv: 50, tb: 30, ca: 0, tt: 100, ref: 0 }).buoc },
      { ten: 'GIỮ CHÂN & MỞ RỘNG', c: '#0B7350', khi: 'Khách đang dùng, đèn xanh', buoc: playbook({ loai: 'cu', cham: 1, band: 'XANH', dn: 20, nv: 80, tb: 70, ca: 0, tt: 100, ref: 2 }).buoc },
      { ten: 'TÁI KÝ', c: '#B4720F', khi: 'Hết chu kỳ, cần gia hạn', buoc: playbook({ loai: 'tai', cham: 3, band: 'VANG', dn: 10, nv: 50, tb: 50, ca: 0, tt: 90, ref: 0 }).buoc },
      { ten: 'CỨU KHÁCH', c: '#BE0E16', khi: 'Rủi ro rời CAO', buoc: playbook({ loai: 'cham', cham: 15, band: 'DO', dn: 1, nv: 8, tb: 10, ca: 3, tt: 40, ref: 0 }).buoc }
    ];
    o += '<div class="tvc-cad">';
    PB.forEach(function (p) {
      o += '<div class="tvc-cad-card" style="--sc:' + p.c + '"><b>' + h(p.ten) + '</b><div class="tiny muted" style="margin-bottom:8px">Khi: ' + h(p.khi) + '</div>' +
        '<ol class="tvc-pb-ol">' + p.buoc.map(function (b) { return '<li>' + h(b) + '</li>'; }).join('') + '</ol></div>';
    });
    o += '</div>';
    return o;
  }

  /* ── Tab 6 · HỖ TRỢ ── */
  function tabHoTro() {
    var HT = [
      { ic: 'bell', ten: 'Hệ thống nhắc', mo: 'Nhắc gọi/chạm đúng nhịp; đèn đỏ & rủi ro cao ưu tiên — không để nhà nào rơi.', cua: 'van-hanh-cham-soc', nut: 'Nhịp chạm & nhắc' },
      { ic: 'share', ten: 'Hệ thống gửi việc', mo: 'Giao & nhận đầu việc theo vai, có hạn, có bằng chứng.', cua: 'bang-viec', nut: 'Bảng công việc' },
      { ic: 'pulse', ten: 'Hệ thống đo lường', mo: 'Điểm sức khoẻ 0–100, 7 chỉ số khách, vòng cải tiến.', cua: 'do-luong-kh', nut: 'Hệ đo lường KH' },
      { ic: 'spark', ten: 'Hệ giải pháp hỗ trợ', mo: 'Playbook · kịch bản · Trợ lý GITA gợi ý câu nói đúng tình huống.', cua: 'tro-ly', nut: 'Trợ lý GITA' },
      { ic: 'chart', ten: 'Hệ tổng hợp', mo: 'Buồng lái CRM: phễu · doanh thu · đọc trọn một nhà.', cua: 'crm', nut: 'Mở CRM' }
    ];
    var o = '<div class="tvc-ht">';
    HT.forEach(function (x) {
      o += '<div class="tvc-ht-card"><div class="tvc-ht-ic">' + ic(x.ic) + '</div><b>' + h(x.ten) + '</b><p class="tiny">' + h(x.mo) + '</p>' +
        '<button class="btn ghost sm tvc-act" data-v="' + h(x.cua) + '">' + h(x.nut) + ' →</button></div>';
    });
    o += '</div>';
    return o;
  }

  /* ── Tab 7 · DÒNG CHẢY (quản trị CRM) ── */
  function tabDongChay(kq) {
    if (!(typeof G.can === 'function' && G.can('crm_view')))
      return U.lockCard('Báo cáo dòng chảy & kết quả cả đội chỉ mở cho cấp quản trị CRM (Super Admin · Admin · Giám đốc).');
    var byGd = GD.map(function (g) { var ds = kq.ds.filter(function (k) { return k.gd === g.ma; }); return { g: g, so: ds.length, gt: ds.reduce(function (s, k) { return s + k.gt; }, 0) }; });
    var caoRR = kq.ds.filter(function (k) { return ruiRo(k).band.t === 'CAO'; }).length;
    var tbSk = kq.ds.length ? Math.round(kq.ds.reduce(function (a, k) { return a + diemSK(k).diem; }, 0) / kq.ds.length) : 0;
    var o = '<div class="grid g4 mb">' +
      U.stat({ k: 'Tổng khách', v: String(kq.ds.length), d: 'đang theo', c: 'var(--gita)' }) +
      U.stat({ k: 'Sức khoẻ TB', v: String(tbSk), d: 'trên 100', c: tbSk >= 80 ? '#0B7350' : tbSk >= 50 ? '#B4720F' : '#BE0E16' }) +
      U.stat({ k: 'Rủi ro rời cao', v: String(caoRR), d: 'cần can thiệp', c: '#BE0E16' }) +
      U.stat({ k: 'Giá trị mở', v: tien(kq.ds.reduce(function (s, k) { return s + k.gt; }, 0)), d: 'đồng', c: 'var(--gita-sau)' }) + '</div>';
    o += U.sec('DÒNG CHẢY THEO GIAI ĐOẠN', 'Khách đang ở đâu — chỗ nghẽn thì dồn người');
    o += '<div class="tvc-wrap"><table class="tvc-table"><thead><tr>' +
      ['Giai đoạn', 'Số khách', 'Giá trị', 'Xác suất chốt', 'Dự báo'].map(function (c) { return '<th>' + h(c) + '</th>'; }).join('') + '</tr></thead><tbody>' +
      byGd.map(function (x) {
        return '<tr><td><span class="tvc-gd" style="--gc:' + x.g.c + '">' + h(x.g.ten) + '</span></td><td class="tvc-stt">' + x.so + '</td>' +
          '<td class="tvc-tien">' + tien(x.gt) + '</td><td>' + x.g.xs + '%</td><td class="tvc-tien" style="color:#0B7350">' + tien(Math.round(x.gt * x.g.xs / 100)) + '</td></tr>';
      }).join('') + '</tbody></table></div>';
    o += '<p class="note mt">' + ic('shield', 'w-3 h-3') + ' Báo cáo kết quả chi tiết (doanh thu thật theo từng Sale) đọc ở màn CRM khi đã nối máy chủ. Màn này tổng hợp dòng chảy + sức khoẻ để quản trị nhìn nhanh.</p>';
    return o;
  }

  G.VIEWS['tt-cskh'] = function () {
    /* Thử nạp khách thật từ máy chủ CRM một lần khi mở màn (nếu có nối). */
    if (!G.ttKho && !G.ttDaThu && !G.ttTai && typeof G.goiMayChu === 'function') G.ttNapKhach();
    var kq = dsKhach();
    var admin = typeof G.can === 'function' && G.can('crm_view');
    var o = U.ph({ eyebrow: 'TRUNG TÂM TƯ VẤN & CHĂM SÓC KHÁCH HÀNG', ic: 'users', grad: 1,
      t: 'Làm trọn một ngày — chấm điểm, bám chuyển đổi, không bỏ sót khách',
      lead: 'Điểm sức khoẻ 0–100 & rủi ro rời cho từng nhà · việc hôm nay lấy từ bước kế của chuỗi chạm · phễu bám chốt 95% · playbook bật theo tình huống · năm hệ hỗ trợ nối thẳng màn sâu.' });
    if (kq.that) {
      o += '<div class="tvc-note" style="background:var(--okbg,rgba(11,115,80,.08));border-color:#0B735044">' + ic('check', 'w-4 h-4') +
        ' Đang chạy trên <b>' + kq.ds.length + ' khách THẬT</b> từ máy chủ CRM (trang 1). ' +
        'Điểm sức khoẻ là <b>ước lượng từ tín hiệu CRM</b> (đèn · lần chạm · phễu) tới khi máy chủ đổ về dữ liệu sử dụng/kết quả. ' +
        '<button class="btn ghost sm tvc-act" data-ttlai="1" style="margin-left:6px">Tải lại</button></div>';
    } else if (typeof G.goiMayChu === 'function' && G.ttTai) {
      o += '<div class="tvc-note">' + ic('orbit', 'w-4 h-4') + ' Đang tải khách thật từ máy chủ CRM…</div>';
    } else {
      o += '<div class="tvc-note" style="background:var(--gita-mo-1);border-color:var(--gita-vien-1)">' + ic('alert', 'w-4 h-4') +
        ' Đang hiện <b>danh sách minh hoạ</b> để xem cấu trúc & thuật toán. ' +
        (typeof G.goiMayChu === 'function' ? 'Chưa lấy được khách thật — ' : 'Chưa nối máy chủ CRM — ') +
        '<button class="btn ghost sm tvc-act" data-ttlai="1">Thử nối khách thật</button></div>';
    }

    var tabs = [['homnay', 'Hôm nay'], ['khach', 'Khách (4 loại)'], ['sk', 'Sức khoẻ & Rủi ro'], ['pheu', 'Phễu → 95%'], ['cadence', 'Chuỗi chạm & Playbook'], ['hotro', 'Hỗ trợ']];
    if (admin) tabs.push(['dongchay', 'Dòng chảy']);
    o += tabs.map(function (t, i) { return '<input type="radio" name="tvcTab" id="tvc-' + t[0] + '" class="tvc-radio"' + (i === 0 ? ' checked' : '') + '>'; }).join('');
    o += '<div class="tvc-tabbar">' + tabs.map(function (t) { return '<label for="tvc-' + t[0] + '">' + h(t[1]) + '</label>'; }).join('') + '</div>';
    o += '<div class="tvc-panel" id="tvc-p-homnay">' + tabHomNay(kq) + '</div>';
    o += '<div class="tvc-panel" id="tvc-p-khach">' + tabKhach(kq) + '</div>';
    o += '<div class="tvc-panel" id="tvc-p-sk">' + tabSucKhoe(kq) + '</div>';
    o += '<div class="tvc-panel" id="tvc-p-pheu">' + tabPheu(kq) + '</div>';
    o += '<div class="tvc-panel" id="tvc-p-cadence">' + tabChuoiCham(kq) + '</div>';
    o += '<div class="tvc-panel" id="tvc-p-hotro">' + tabHoTro() + '</div>';
    if (admin) o += '<div class="tvc-panel" id="tvc-p-dongchay">' + tabDongChay(kq) + '</div>';
    return o;
  };
})();
