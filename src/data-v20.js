/* ═══════════════════════════════════════════════════════════════
   GITA 365 — NỀN TẢNG CHIẾN LƯỢC V20 · TOÁN + LUẬT ĐỌC (bản app)

   1. holt · zBen · tachBienDong · moPhong · doNhay · tienDo — bản sao ĐÚNG
      TỪNG PHÉP của may-chu/v20-toan.js (tools/thu-v20.mjs so hai bên).
   2. CHI_SO — danh mục chỉ số V20 đặt được mục tiêu (khớp máy chủ).
   3. banTin(d) — luật đọc số thành BẢN TIN CHIẾN LƯỢC: mỗi điều có mức,
      căn cứ bằng số, và việc nên làm; đòn bẩy lớn nhất trỏ về giải pháp
      đang có ở Trung tâm (G.TU.VAN_DE) để giao triển khai.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;
(function(){
  var V = G.V20 = {};
  V.PHIEN_BAN_V20 = 'V20-2026.10-a';
  function r2(x){ return Math.round(x * 100) / 100; }
  V.holt = function(chuoi, h, alpha, beta){
    var y = (chuoi || []).map(Number).filter(function(v){ return isFinite(v); });
    if(y.length < 3) return null;
    var a = alpha == null ? 0.5 : alpha, b = beta == null ? 0.3 : beta;
    var L = y[0], T = y[1] - y[0], loi = [];
    for(var i = 1; i < y.length; i++){
      var duDoan = L + T; loi.push(y[i] - duDoan);
      var L2 = a * y[i] + (1 - a) * (L + T);
      T = b * (L2 - L) + (1 - b) * T; L = L2;
    }
    var sai = Math.sqrt(loi.reduce(function(s, e){ return s + e * e; }, 0) / Math.max(1, loi.length));
    var duBao = [], duoi = [], tren = [];
    for(var k = 1; k <= (h || 3); k++){
      var v = Math.max(0, L + k * T), w = 1.2816 * sai * Math.sqrt(k);
      duBao.push(r2(v)); duoi.push(r2(Math.max(0, v - w))); tren.push(r2(v + w));
    }
    return { san:r2(L), xuHuong:r2(T), duBao:duBao, duoi:duoi, tren:tren, sai:r2(sai) };
  };
  function trungVi(a){ var s = a.slice().sort(function(x, y){ return x - y; }), n = s.length; return n ? (n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2) : null; }
  V.zBen = function(nen, x){
    var a = (nen || []).map(Number).filter(function(v){ return isFinite(v); });
    if(a.length < 7 || x == null || !isFinite(Number(x))) return null;
    var m = trungVi(a), mad = trungVi(a.map(function(v){ return Math.abs(v - m); })) * 1.4826;
    var thang = mad > 0 ? mad : Math.max(1, Math.abs(m) * 0.1);
    return r2((Number(x) - m) / thang);
  };
  V.mucBatThuong = function(z){ if(z == null) return 'chuaDo'; var k = Math.abs(z); return k >= 3 ? 'do' : k >= 2 ? 'vang' : 'xanh'; };
  V.tachBienDong = function(n0, p0, n1, p1){
    var v = [n0, p0, n1, p1].map(Number);
    if(v.some(function(x){ return !isFinite(x); })) return null;
    var a0 = v[0], b0 = v[1], a1 = v[2], b1 = v[3];
    return { tong:r2(a1 * b1 - a0 * b0), phanSoNha:r2((a1 - a0) * (b0 + b1) / 2), phanTrungBinh:r2((b1 - b0) * (a0 + a1) / 2) };
  };
  V.apDieuChinh = function(co, dc){
    var d = dc || {}, c = {}; Object.keys(co).forEach(function(k){ c[k] = co[k]; });
    function kep(v, a, b){ return Math.max(a, Math.min(b, v)); }
    c.lead = c.lead * (1 + (d.lead || 0));
    c.kichHoat = kep(c.kichHoat + (d.kichHoat || 0), 0, 1);
    c.vaoHoc = kep(c.vaoHoc + (d.vaoHoc || 0), 0, 1);
    c.giuChan = kep(c.giuChan + (d.giuChan || 0), 0, 0.995);
    c.traTien = kep(c.traTien + (d.traTien || 0), 0, 1);
    c.arpu = c.arpu * (1 + (d.arpu || 0));
    return c;
  };
  V.moPhong = function(co, dc, soThang){
    var c = V.apDieuChinh(co, dc), n = soThang || 12, nha = [], thu = [], N = Number(c.nha) || 0;
    for(var i = 0; i < n; i++){ var moi = c.lead * c.kichHoat * c.vaoHoc; N = N * c.giuChan + moi; nha.push(Math.round(N)); thu.push(Math.round(N * c.traTien * c.arpu)); }
    return { nha:nha, thu:thu, tongThu:thu.reduce(function(a, b){ return a + b; }, 0) };
  };
  V.DON_BAY = [['lead','Lượng lead mỗi tháng'],['kichHoat','Tỷ lệ kích hoạt đăng ký'],['vaoHoc','Tỷ lệ lead kích hoạt vào học'],
    ['giuChan','Giữ chân (giảm 10% số nhà rời)'],['traTien','Tỷ lệ nhà tích cực có trả tiền'],['arpu','Thu trung bình mỗi nhà trả tiền']];
  V.doNhay = function(co, soThang){
    var goc = V.moPhong(co, {}, soThang).tongThu;
    if(!(goc > 0)) return V.DON_BAY.map(function(x){ return { ma:x[0], ten:x[1], pt:null }; });
    return V.DON_BAY.map(function(x){
      var dc = {}; if(x[0] === 'lead' || x[0] === 'arpu') dc[x[0]] = 0.1; else if(x[0] === 'giuChan') dc[x[0]] = (1 - (co.giuChan || 0)) * 0.1; else dc[x[0]] = (co[x[0]] || 0) * 0.1;
      return { ma:x[0], ten:x[1], pt:r2(100 * (V.moPhong(co, dc, soThang).tongThu - goc) / goc) };
    }).sort(function(a, b){ return (b.pt || 0) - (a.pt || 0); });
  };
  V.tienDo = function(m, hienTai, homNay, duBaoTaiHan){
    var dau = Number(m.giaTriDau), muc = Number(m.mucTieu), v = hienTai == null ? null : Number(hienTai);
    if(!isFinite(dau) || !isFinite(muc) || muc === dau || v == null || !isFinite(v)) return { tienDo:null, kyVong:null, trangThai:'chuaDo' };
    var t0 = Date.parse(m.tuLuc), t1 = Date.parse(m.hanLuc), t = Date.parse(homNay);
    var kyVong = t1 > t0 ? Math.max(0, Math.min(100, 100 * (t - t0) / (t1 - t0))) : 100;
    var td = 100 * (v - dau) / (muc - dau), datRoi = muc > dau ? v >= muc : v <= muc, tt;
    if(datRoi) tt = 'dat';
    else if(t > t1) tt = 'truot';
    else { var dbDat = duBaoTaiHan == null ? null : (muc > dau ? duBaoTaiHan >= muc : duBaoTaiHan <= muc); tt = td >= kyVong - 10 ? 'dungHuong' : (dbDat ? 'cham' : 'nguyCo'); }
    return { tienDo:r2(td), kyVong:r2(kyVong), trangThai:tt };
  };

  V.CHI_SO = {
    nhaTichCuc:['Nhà học tích cực (tháng)','nhà','cao'], thu:['Doanh thu tháng','đ','cao'], nhaMoi:['Nhà mới mỗi tháng','nhà','cao'],
    lead:['Lead mỗi tháng','lượt','cao'], tyLeKichHoat:['Tỷ lệ kích hoạt đăng ký','%','cao'], arpu:['Thu TB mỗi nhà trả tiền','đ','cao'],
    churn:['Tỷ lệ rời hằng tháng','%','thap'], cac:['Chi phí thu hút một nhà (CAC)','đ','thap'], ltvCac:['LTV / CAC','lần','cao'],
    bienGop:['Biên thu − chi','%','cao']
  };
  V.TEN_DANH_GIA = { dat:['Đã đạt','#0B7350'], dungHuong:['Đúng hướng','#185AB4'], cham:['Chậm — dự báo vẫn kịp','#B4720F'], nguyCo:['Nguy cơ trượt','#BE0E16'], truot:['Quá hạn chưa đạt','#BE0E16'], huy:['Đã huỷ','#73849F'], chuaDo:['Chưa đo','#73849F'] };
  /* Đòn bẩy → giải pháp ở Trung tâm (mã vấn đề G.TU.VAN_DE) */
  V.DON_BAY_GP = { lead:['mk1','mk6','tv1'], kichHoat:['tv2'], vaoHoc:['tv5','tv1'], giuChan:['kh1','co2','co4','kh3'], traTien:['tc5','tc1'], arpu:['co7','tc1'] };

  function sv(x){ return x == null ? '—' : (Math.round(Number(x) * 10) / 10).toLocaleString('vi-VN'); }
  function tien(n){ return n == null ? '—' : Math.round(n).toLocaleString('vi-VN') + 'đ'; }
  function phanTram(a, b){ return a == null || !(b > 0) ? null : Math.round(1000 * (a - b) / b) / 10; }
  /* d: kết quả docChienLuocV20 → [{ muc:'tot'|'canhBao'|'xau', ten, canCu, viec, the? , donBay? }] */
  V.banTin = function(d){
    var ra = [], c = d.chuoi, iL = d.thang.length - 2, iP = iL - 1, k = d.ktDonVi || {};
    var ns = phanTram(c.nhaTichCuc[iL], c.nhaTichCuc[iP]);
    if(ns != null) ra.push({ muc: ns >= 0 ? 'tot' : ns > -10 ? 'canhBao' : 'xau', ten:'North Star — nhà học tích cực ' + (ns >= 0 ? 'tăng ' : 'giảm ') + sv(Math.abs(ns)) + '%',
      canCu: d.thang[iL] + ': ' + c.nhaTichCuc[iL] + ' nhà (tháng trước ' + c.nhaTichCuc[iP] + '); giữ lại ' + (d.dong.giuLai == null ? '—' : d.dong.giuLai) + ', mất ' + (d.dong.mat == null ? '—' : d.dong.mat) + ', mới/quay lại ' + (d.dong.moiVaQuayLai == null ? '—' : d.dong.moiVaQuayLai) + '.',
      viec: ns >= 0 ? 'Giữ nhịp; nhân rộng nguồn nhà mới đang hiệu quả.' : (d.dong.mat > (d.dong.moiVaQuayLai || 0) ? 'Mất nhà nhiều hơn nhà mới — ưu tiên giữ chân trước khi đổ tiền tìm khách.' : 'Nhà mới vào chậm — ưu tiên phễu thu hút.'), the:'ns' });
    var t = d.cay && d.cay.tach;
    if(t && d.cay.thuTruoc != null) ra.push({ muc: t.tong >= 0 ? 'tot' : 'canhBao', ten:'Doanh thu ' + (t.tong >= 0 ? 'tăng ' : 'giảm ') + tien(Math.abs(t.tong)) + ' — chủ yếu do ' + (Math.abs(t.phanSoNha) >= Math.abs(t.phanTrungBinh) ? 'SỐ NHÀ trả tiền' : 'THU TRUNG BÌNH mỗi nhà'),
      canCu:'Phần do số nhà ' + tien(t.phanSoNha) + ' · phần do thu trung bình ' + tien(t.phanTrungBinh) + '.',
      viec: Math.abs(t.phanSoNha) >= Math.abs(t.phanTrungBinh) ? 'Đòn bẩy là số nhà: phễu và giữ chân.' : 'Đòn bẩy là giá trị mỗi nhà: lên tầng, gói chuyên đề, thu đúng hạn.', the:'ns' });
    if(k.ltvCac != null) ra.push({ muc: k.ltvCac >= 3 ? 'tot' : k.ltvCac >= 1 ? 'canhBao' : 'xau', ten:'LTV/CAC = ' + sv(k.ltvCac) + ' lần' + (k.hoanVon != null ? ' · hoàn vốn ' + sv(k.hoanVon) + ' tháng' : ''),
      canCu:'Một nhà mang lại ' + tien(k.ltv) + ' suốt vòng đời (~' + sv(k.tuoiDoi) + ' tháng); thu hút một nhà tốn ' + tien(k.cac) + '.',
      viec: k.ltvCac >= 3 ? 'Mô hình khoẻ — có thể tăng chi thu hút có kiểm soát.' : k.ltvCac >= 1 ? 'Chưa đủ 3 lần — tăng giữ chân trước khi tăng chi tiếp thị.' : 'Thu hút đang lỗ — dừng kênh đắt, dồn sức giới thiệu và giữ chân.', the:'kt2' });
    else if(k.cac == null) ra.push({ muc:'canhBao', ten:'Chưa tính được CAC', canCu:'Không có chi "Tiếp thị" / hoa hồng hoặc không có nhà mới trong 3 tháng trọn.', viec:'Ghi đủ chi tiếp thị vào khoản mục Tiếp thị để đo được hiệu quả thu hút.', the:'kt2' });
    if(k.churn != null) ra.push({ muc: k.churn <= 8 ? 'tot' : k.churn <= 15 ? 'canhBao' : 'xau', ten:'Tỷ lệ rời hằng tháng ' + sv(k.churn) + '%', canCu:'Trung bình 3 tháng trọn gần nhất; tuổi đời ước tính ' + sv(k.tuoiDoi) + ' tháng.',
      viec: k.churn <= 8 ? 'Giữ chuẩn chăm sóc hiện tại.' : 'Mỗi điểm % churn giảm kéo dài vòng đời — xem đòn bẩy Giữ chân.', the:'kt2' });
    var dn = d.coSo ? V.doNhay(d.coSo, 12) : [];
    if(dn.length && dn[0].pt != null) ra.push({ muc:'tot', ten:'Đòn bẩy số 1: ' + dn[0].ten, canCu:'Tăng 10% → tổng thu 12 tháng +' + sv(dn[0].pt) + '% (thứ hai: ' + dn[1].ten + ' +' + sv(dn[1].pt) + '%).', viec:'Đặt chiến lược chính vào đòn bẩy này — xem giải pháp gợi ý.', the:'db', donBay:dn[0].ma });
    var ph = (d.pheu || []).filter(function(x){ return x.tyLe != null; }).sort(function(a, b){ return a.tyLe - b.tyLe; })[0];
    if(ph) ra.push({ muc: ph.tyLe >= 50 ? 'tot' : ph.tyLe >= 25 ? 'canhBao' : 'xau', ten:'Chỗ rơi lớn nhất của phễu: "' + ph.ten + '" (' + sv(ph.tyLe) + '%)', canCu:'90 ngày gần nhất, từ bước trước sang bước này.', viec:'Sửa một bước hẹp nhất trước — mọi bước sau đều hưởng.', the:'ph' });
    var bt = (d.batThuong || []).filter(function(x){ return x.muc === 'do'; });
    if(bt.length) ra.push({ muc:'xau', ten:bt.length + ' tín hiệu bất thường mạnh hôm qua', canCu:bt.map(function(x){ return x.ten + ' (z = ' + sv(x.z) + ')'; }).join(' · '), viec:'Kiểm tra ngay nguyên nhân: sự cố, chiến dịch, hay lỗi ghi số.', the:'bt' });
    if(d.tinCay != null && d.tinCay < 70) ra.push({ muc: d.tinCay >= 50 ? 'canhBao' : 'xau', ten:'Độ tin cậy dữ liệu ' + d.tinCay + '/100', canCu:'Nhiều nguồn cũ / trống hoặc thiếu trường.', viec:'Chiến lược chỉ tốt bằng dữ liệu — xem thẻ Độ tin cậy dữ liệu.', the:'dl' });
    var f = d.duBao && d.duBao.thu;
    if(f && c.thu[iL] != null) { var dt = phanTram(f.duBao[0], c.thu[iL]); ra.push({ muc: dt >= 0 ? 'tot' : 'canhBao', ten:'Dự báo doanh thu tháng tới ' + tien(f.duBao[0]), canCu:'Khoảng 80%: ' + tien(f.duoi[0]) + ' – ' + tien(f.tren[0]) + ' · so tháng trọn gần nhất ' + (dt > 0 ? '+' : '') + sv(dt) + '%.', viec: dt >= 0 ? 'Xu hướng đi lên.' : 'Xu hướng đi xuống — xem kịch bản để biết cần đẩy đòn bẩy nào.', the:'db' }); }
    var thu = { xau:0, canhBao:1, tot:2 };
    return ra.sort(function(a, b){ return thu[a.muc] - thu[b.muc]; });
  };
})();
