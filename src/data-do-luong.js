/* ═══════════════════════════════════════════════════════════════
   GITA 365 — CÔNG THỨC ĐO LƯỜNG KHÁCH HÀNG (bản app)

   Bản sao ĐÚNG TỪNG PHÉP của may-chu/do-luong-cham.js — để màn hình giải
   thích được công thức và dựng ví dụ minh hoạ khi chưa nối máy chủ.
   tools/thu-do-luong.mjs chạy 400 bộ số ngẫu nhiên qua cả hai bản; lệch
   một con số là đỏ. Sửa công thức thì sửa CẢ HAI tệp.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;
(function(){
  var DL = G.DL = {};
  DL.PHIEN_BAN_DO = 'DL-2026.10-a';
  DL.MUC = { ngayHoatDong:20, phutHoc:600, ngayTick:20, baoCao:12, viecDuyet:10, hoanThanh:12 };
  DL.NHOM_MAN = {
    hoc:      ['khoa-dao-tao','sat-hach','bo-test','lo-trinh','chu-ky','banh-da','thu-vien','kho-khach','kho-tong','chuyen','tieu-thuyet','thi-viet','bai-hoc','nhiem-vu','tro-ly'],
    thucHanh: ['hom-nay','minh-chung','thoi-quen','ban-do','ban-do-ca-nhan','vong-nhac','nhat-ky','tam-nhin'],
    baoCao:   ['bang-so','tien-bo','kpi-toi','kpi-100','ho-so-thang','vi-credit','dk-cua-toi','chan-dung-nha'],
    ketNoi:   ['ket-noi','cong-dong','su-kien','vinh-danh','phan-thuong','dai-su','tin-cong-dong']
  };
  DL.TEN_NHOM = { hoc:'Học', thucHanh:'Thực hành', baoCao:'Theo dõi & báo cáo', ketNoi:'Kết nối', khac:'Khác' };
  DL.nhomCuaMan = function(man){ for(var k in DL.NHOM_MAN) if(DL.NHOM_MAN[k].indexOf(man) >= 0) return k; return 'khac'; };
  DL.TANG_CS = {
    A:{ ten:'Kim cương · đầu tư sâu', mau:'#5140B4', viec:['Senior Coach kèm riêng, chạm 2 lần/tuần','Mời lên tầng tiếp theo / chương trình VIP','Mời làm Đại sứ, kể câu chuyện','Quà credit thưởng mục tiêu'] },
    B:{ ten:'Vàng · nuôi lên tầng', mau:'#B4720F', viec:['Coach chạm mỗi tuần, đặt mốc lên tầng','Gợi ý chương trình chuyên đề hợp nhu cầu','Khen quá trình, ghi nhận công khai'] },
    C:{ ten:'Bạc · giữ nhịp chuẩn', mau:'#0B6675', viec:['Nhịp chạm chuẩn theo chương trình','Nhắc tick việc hôm nay, báo cáo tuần','Nội dung đúng tầng, đúng nút thắt'] },
    D:{ ten:'Cần cứu · rủi ro cao', mau:'#BE0E16', viec:['Gọi trong 24 giờ, nghe trước','Mở Can thiệp nhanh 14 ngày','Quản lý chuyên môn theo dõi tới khi về vàng'] },
    E:{ ten:'Ngủ đông · tái kích hoạt', mau:'#73849F', viec:['Tin nhắn tái kích hoạt chi phí thấp','Mời một sự kiện / một việc nhỏ 5 phút','Không dồn giờ Coach cho tới khi nhà quay lại'] }
  };
  function kep(x, a, b){ return Math.max(a, Math.min(b, x)); }
  function ty(x, m){ return x == null ? null : kep(Number(x) / m, 0, 1); }
  function trungBinh(phan){
    var s = 0, w = 0;
    phan.forEach(function(p){ var v = p[0], t = p[1]; if(v != null && !isNaN(v)){ s += v * t; w += t; } });
    return w ? Math.round(100 * s / w) : null;
  }
  DL.chamDiem = function(d, truoc){
    var he = d.soNgayThang ? kep(Math.max(d.soNgayThang, 10) / 30, 0, 1) : 1;
    var M = {}; Object.keys(DL.MUC).forEach(function(k){ M[k] = DL.MUC[k] * he; });
    var phutHoc = Math.max(Number(d.phutHocApp) || 0, Number(d.phutHocBaoCao) || 0);
    var ganKet = trungBinh([
      [ty(d.ngayHoatDong, M.ngayHoatDong), 30], [ty(phutHoc, M.phutHoc), 25],
      [ty(d.ngayTick, M.ngayTick), 25], [ty(d.soBaoCao, M.baoCao), 10], [ty(d.viecDuyet, M.viecDuyet), 10]
    ]);
    var coHoc = d.hoanThanh != null || d.diemTB != null;
    var tienBo = trungBinh([
      [ty(d.hoanThanh, M.hoanThanh), 30], [d.diemTB == null ? null : kep(d.diemTB / 100, 0, 1), 20],
      [ty(d.viecDuyet, M.viecDuyet), 25], [d.soNgayThang ? kep((d.ngayTick || 0) / d.soNgayThang, 0, 1) : null, 15],
      [d.lenTang ? 1 : (coHoc ? 0 : null), 10]
    ]);
    var haiLong = trungBinh([
      [d.nps == null ? null : kep(d.nps / 10, 0, 1), 40], [d.csat == null ? null : kep((d.csat - 1) / 4, 0, 1), 30],
      [d.camXuc == null ? null : kep((d.camXuc - 1) / 4, 0, 1), 20],
      [(d.nps != null || d.csat != null || d.camXuc != null) ? (d.daHoan ? 0 : 1) : null, 10]
    ]);
    var giaTri = trungBinh([
      [kep((Number(d.ltv) || 0) / 50000000, 0, 1), 50], [kep((Number(d.tang) || 1) / 5, 0, 1), 30], [d.no > 0 ? 0 : 1, 20]
    ]);
    var imLang = d.imLang == null ? null : kep((d.imLang - 3) / 11, 0, 1);
    var tut = null;
    if(truoc && truoc.ganKet != null && ganKet != null && truoc.ganKet > 0) tut = kep((truoc.ganKet - ganKet) / truoc.ganKet / 0.4, 0, 1);
    var ruiRo = trungBinh([
      [imLang, 35], [tut, 25], [d.no > 0 ? 1 : 0, 20],
      [haiLong == null ? null : (haiLong < 50 ? 1 : 0), 10], [d.band === 'DO' ? 1 : 0, 10]
    ]) || 0;
    var gioiThieu = kep((Number(d.gioiThieu) || 0) / 2, 0, 1) * 100;
    var goc = 0.30 * (ganKet || 0) + 0.25 * (tienBo == null ? (ganKet || 0) : tienBo) +
      0.20 * (haiLong == null ? 60 : haiLong) + 0.15 * (giaTri || 0) + 0.10 * gioiThieu;
    var tiemNang = Math.round(kep(goc - 0.25 * ruiRo, 0, 100));
    return { ganKet:ganKet, tienBo:tienBo, haiLong:haiLong, giaTri:giaTri, ruiRo:ruiRo, tiemNang:tiemNang, phutHoc:phutHoc };
  };
  DL.xepTang = function(diem, d){
    if(!(d.ngayHoatDong > 0) && !(d.moi)) return 'E';
    if(diem.ruiRo >= 60) return 'D';
    if(diem.tiemNang >= 75 && diem.ruiRo < 40) return 'A';
    if(diem.tiemNang >= 60 && diem.ruiRo < 50) return 'B';
    return 'C';
  };
  DL.lyDo = function(diem, d){
    var r = [];
    if(d.imLang != null && d.imLang >= 7) r.push('Im lặng ' + d.imLang + ' ngày');
    if(d.no > 0) r.push('Còn nợ học phí');
    if(diem.ganKet != null && diem.ganKet >= 75) r.push('Gắn kết cao');
    if(diem.tienBo != null && diem.tienBo >= 70) r.push('Tiến bộ rõ');
    if(diem.haiLong != null && diem.haiLong >= 80) r.push('Rất hài lòng');
    if(diem.haiLong != null && diem.haiLong < 50) r.push('Chưa hài lòng');
    if(d.lenTang) r.push('Vừa lên tầng');
    if(d.gioiThieu > 0) r.push('Đã giới thiệu ' + d.gioiThieu + ' nhà');
    if(!(d.ngayHoatDong > 0)) r.push('Không hoạt động trong tháng');
    return r.slice(0, 4);
  };
  /* Công thức nói bằng lời — màn "Công thức" đọc từ đây */
  DL.GIAI_THICH = [
    { ma:'ganKet', ten:'Gắn kết', mo:'Ngày có hoạt động (30%) · phút học (25%) · ngày tick việc hôm nay (25%) · báo cáo ngày (10%) · việc được Coach duyệt (10%). Mục tiêu tháng: 20 ngày · 600 phút · 20 ngày tick · 12 báo cáo · 10 việc. Tháng đang chạy thì mục tiêu co theo số ngày đã qua (tính tối thiểu 10 ngày).' },
    { ma:'tienBo', ten:'Tiến bộ', mo:'Bài học / test / sát hạch hoàn thành (30%) · điểm trung bình (20%) · việc được duyệt (25%) · đều đặn tick trên số ngày của tháng (15%) · lên tầng (10%).' },
    { ma:'haiLong', ten:'Hài lòng', mo:'Điểm giới thiệu NPS 0–10 (40%) · mức hài lòng CSAT 1–5 (30%) · cảm xúc tự báo 1–5 (20%) · không hoàn tiền (10%). Chưa có phiếu nào thì để trống, không đoán.' },
    { ma:'giaTri', ten:'Giá trị', mo:'Tổng đã thanh toán so với 50 triệu (50%) · tầng hiện tại (30%) · không còn nợ (20%).' },
    { ma:'ruiRo', ten:'Rủi ro rời', mo:'Số ngày im lặng — 3 ngày bắt đầu tính, 14 ngày là tối đa (35%) · gắn kết tụt so tháng trước, tụt 40% là tối đa (25%) · còn nợ (20%) · hài lòng dưới 50 (10%) · đèn đỏ (10%).' },
    { ma:'tiemNang', ten:'Tiềm năng đầu tư', mo:'30% gắn kết + 25% tiến bộ + 20% hài lòng + 15% giá trị + 10% giới thiệu nhà khác, trừ đi 25% điểm rủi ro.' }
  ];
  DL.LUAT_TANG = [
    ['E', 'Không có ngày hoạt động nào trong tháng (trừ nhà mới vào dưới 14 ngày)'],
    ['D', 'Rủi ro rời từ 60 trở lên — ưu tiên trên mọi tầng khác'],
    ['A', 'Tiềm năng từ 75 và rủi ro dưới 40'],
    ['B', 'Tiềm năng từ 60 và rủi ro dưới 50'],
    ['C', 'Các nhà còn lại']
  ];
})();
