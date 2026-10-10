/* ═══════════════════════════════════════════════════════════════
   GITA 365 — V50·168 · BẢN ĐỒ MÀN CHÍNH THEO VAI (V50-2026.10-b)

   Chủ hệ (07/10/2026): cô đọng toàn hệ xuống 168 màn; mọi phần đang tách
   rời phải khớp vào một màn lớn hơn để quản trị tập trung; số màn theo vai:
     Phụ huynh · Học sinh · CTV · Khách lạ     3 màn
     Coach → Chuyên viên dữ liệu (R06–R12)     tối đa 5 màn
     Trưởng nhóm Coach → Giám đốc (R03–R05)    tối đa 10 màn
     Admin · Super Admin (R01–R02)             tối đa 12 màn, toàn quyền
   Mỗi màn có kho nghề / kho tài liệu riêng, phần hiển thị khoá theo cấp ·
   tầng · gói dịch vụ · vai.

   BA TẦNG:
     MÀN CHÍNH (G.V50M.HUB) — 15 màn. Đây là thứ đứng ở cột trái, và là
       con số 3 / 5 / 10 / 12 theo vai.
     PHẦN — các trang làm việc bên trong một màn chính (thanh phần ở đầu
       trang). Phần nào vai chưa mở được vẫn hiện, có khoá và lý do (chờ
       tầng · cần gói · ngoài vai) — khách thấy mình sẽ được mở gì.
     KHO — mỗi màn chính trỏ vào các cụm học thuyết của nó (14 trang kho
       nghề kn-*, src/v50-kho.js); 154 trang học thuyết cũ là CHƯƠNG trong
       kho, không còn là màn rời.
   DANH MỤC = mọi trang là phần của một màn chính (kể cả 14 trang kho) —
   tools/thu-v50-168.mjs canh ≤ 168 và mọi màn đăng ký trong app đều KHỚP
   vào một màn chính (không màn nào đứng rời).
   Không xoá mã màn nào; tắt V50 (Thư viện vận hành) là về như cũ.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;
(function(){
  var M = {};
  M.PHIEN_BAN = 'V50-2026.10-b';
  M.TRAN = 168;

  /* id · tên · icon · một câu việc · phần (khoá màn có sẵn) · cụm kho */
  M.HUB = [
    { id:'cong-vao', khu:'khach',  ten:'Cổng vào',                 ic:'compass', viec:'Người chưa có tài khoản: hiểu GITA 365, đi sáu bước vào, đọc đánh giá thật.',
      phan:['gioi-thieu','tham-gia','danh-gia'], kho:[] },
    { id:'nha-minh', khu:'khach',  ten:'Nhà mình hôm nay',         ic:'home',    viec:'Việc của nhà hôm nay: một việc, nhiệm vụ, nhịp 21/90 ngày, minh chứng.',
      phan:['ngoi-nha','dk-cua-toi','hom-nay','nhiem-vu','con-duong','chu-ky','vong-nhac','minh-chung','bat-dau'], kho:['NHA'] },
    { id:'hanh-trinh', khu:'khach', ten:'Hành trình & tiến bộ',    ic:'map',     viec:'Nhà đang ở đâu trên năm tầng, đổi được gì, báo cáo tháng, ghi nhận.',
      phan:['ban-do','chan-dung-nha','tam-nhin','tien-bo','kpi-100','ban-co','ho-so-thang','phan-thuong','sat-hach','khoa-dao-tao','nhat-ky-vi-tri','thi-viet','bang-tin'], kho:['NHA','GD'] },
    { id:'dich-vu', khu:'khach',   ten:'Dịch vụ & tài khoản',      ic:'star',    viec:'Ví credit, học phí, quà theo tầng, trợ lý, sự kiện, đánh giá.',
      phan:['vi-credit','thanh-toan','kho-qua','tro-ly','giong-doc','su-kien','danh-gia'], kho:['GD'] },
    { id:'ve-tinh', khu:'khach',   ten:'Vệ tinh lan toả',          ic:'share',   viec:'CTV / Đại sứ: nhà mình giới thiệu, liên kết, hoa hồng, kết nối.',
      phan:['dk-cua-toi','ve-tinh','dai-su','hoa-hong','ket-noi','su-kien','nghe-daisu'], kho:['TRAI'] },
    { id:'ban-lam-viec', khu:'nhansu', ten:'Bàn làm việc của tôi',  ic:'target',  viec:'Bảng điều khiển theo vai, đầu việc, KPI cá nhân, vòng nhắc, nhật ký.',
      phan:['dk-cua-toi','bang-viec','danh-muc-viec','kpi-toi','vong-nhac','nhat-ky-vi-tri'], kho:['NGHE'] },
    { id:'coach', khu:'nhansu',     ten:'Hệ điều hành Coach',       ic:'flame',   viec:'Chương trình, thiết kế bài, điều phối, chất lượng, ca — mỗi buổi ghi vào tiến trình chăm sóc ở CRM.',
      phan:['coach-he','coach-dp','coach-ct','coach-tk','coach-cl','coach-gp','coach-kho','coach-pt','coach-v20','coach-nlp','van-hanh-cham-soc','xu-ly-ca','xuat-du-lieu'], kho:['PP','KHO','COACH'] },
    { id:'khach-crm', khu:'nhansu', ten:'Khách hàng & CRM',         ic:'heart',   viec:'CRM theo quyền được cấp, CSKH, đo lường khách, trải nghiệm, tài liệu gia đình.',
      phan:['toan-canh-crm','crm','tt-cskh','do-luong-he','trai-nghiem-kh','nguoi-dan-dat','tai-lieu-khach','gui-tu-lieu','tang5-pro','khung-du-lieu'], kho:['TUVAN','VIP','TRAI'] },
    { id:'dao-tao', khu:'nhansu',   ten:'Đào tạo & năng lực',       ic:'book',    viec:'Khoá đào tạo, sát hạch, cuộc thi viết — mở theo cấp bậc đạt được.',
      phan:['khoa-dao-tao','sat-hach','thi-viet'], kho:['NGHE','PP'] },
    { id:'kho-nghe', khu:'nhansu',  ten:'Kho nghề & tài liệu',      ic:'vault',   viec:'14 kho nghề theo cụm, thư viện tài liệu — chương mở theo vai, tầng, gói.',
      phan:['thu-vien-v50','tra-cuu-gp','kn-pp','kn-kho','kn-nghe','kn-coach','kn-tuvan','kn-vip','kn-trai','kn-mk','kn-gd','kn-nha','kn-pl','kn-tc','kn-kt','kn-ct','thu-vien'], kho:[] },
    { id:'dieu-hanh', khu:'nhansu', ten:'Điều hành & đo lường',     ic:'chart',   viec:'Trung tâm đo lường 41 chỉ số, V20, 16 ban, các vai, phòng ban, năng lực, con người.',
      phan:['trung-tam-do','bo-nao-van-hanh','truy-van-da-chieu','dk-cac-vai','phong-ban','nang-luc-ns','con-nguoi'], kho:['KT','CT'] },
    { id:'tai-chinh', khu:'nhansu', ten:'Tài chính',                ic:'list',    viec:'Ban tài chính theo giới hạn được cấp: kế toán, đối soát, thuế, credit, bảng giá.',
      phan:['toan-canh-tc','phong-tai-chinh','tai-chinh-ceo','ke-toan-thue','credit-gita','bang-gia','khung-du-lieu'], kho:['TC'] },
    { id:'quan-tri', khu:'nhansu',  ten:'Tài khoản & quyền',        ic:'shield',  viec:'Cấp quyền 100% do Super Admin: mở tài khoản, phân quyền, quyền CRM, khoá, nhật ký.',
      phan:['phan-quyen','phan-quyen-crm','cap-tai-khoan','khoa-tai-khoan','nguoi-dung','toi','khoa-mat','nhat-ky-ht','khung-du-lieu'], kho:['PL'] },
    { id:'van-hanh-he', khu:'nhansu', ten:'Vận hành hệ thống',      ic:'pulse',   viec:'Máy chủ, tài nguyên, liên thông dữ liệu, sức chứa, AI, thanh tra, soát màn, kiểm thử.',
      phan:['noi-may-chu','theo-doi-tai-nguyen','lien-thong','suc-chua-toc-do','bo-nao-da-tri','thanh-tra-soi','phap-ly-rui-ro','soat-toan-man','kiem-theo-vai','soat-day-du'], kho:['KT','PL'] },
    { id:'noi-dung', khu:'nhansu',  ten:'Nội dung & truyền thông',  ic:'spark',    viec:'Studio, xưởng phim, thị giác, biên soạn, sửa chữ hiển thị, duyệt tài liệu và đánh giá.',
      phan:['studio','xuong-phim','kien-truc-thi-giac','bien-soan-noi-dung','sua-hien-thi','duyet-tai-lieu','duyet-danh-gia','sap-xep'], kho:['MK'] }
  ];

  /* Màn chính theo vai, đúng trần chủ hệ đặt. 'khach-la' = chưa đăng nhập. */
  M.TRAN_VAI = { R01:15, R02:15, R03:10, R04:10, R05:10, R06:5, R07:5, R08:5, R09:5, R10:5, R11:5, R12:5, R13:3, R14:3, R15:3, 'khach-la':3 };
  /* Admin hệ thống · Super Admin: hiển thị 100% — cả 10 màn nghiệp vụ VÀ cả 5
     màn khu vực khách hàng. Cấp quyền vẫn chỉ Super Admin (máy chủ gác). */
  var QT = ['ban-lam-viec','dieu-hanh','tai-chinh','khach-crm','coach','dao-tao','kho-nghe','quan-tri','van-hanh-he','noi-dung'];
  M.VAI = {
    R01: QT, R02: QT,
    R03: ['ban-lam-viec','dieu-hanh','tai-chinh','khach-crm','coach','dao-tao','kho-nghe','noi-dung'],
    R04: ['ban-lam-viec','dieu-hanh','coach','khach-crm','dao-tao','kho-nghe','tai-chinh'],
    R05: ['ban-lam-viec','coach','khach-crm','dieu-hanh','dao-tao','kho-nghe'],
    R06: ['ban-lam-viec','coach','khach-crm','dao-tao','kho-nghe'],
    R07: ['ban-lam-viec','coach','khach-crm','dao-tao','kho-nghe'],
    R08: ['ban-lam-viec','coach','dao-tao','khach-crm','kho-nghe'],
    R09: ['ban-lam-viec','coach','khach-crm','dao-tao','kho-nghe'],
    R10: ['ban-lam-viec','coach','khach-crm','dao-tao','kho-nghe'],
    R11: ['ban-lam-viec','khach-crm','coach','dao-tao','kho-nghe'],
    R12: ['ban-lam-viec','dieu-hanh','khach-crm','dao-tao','kho-nghe'],
    R13: ['nha-minh','hanh-trinh','dich-vu'],
    R14: ['nha-minh','hanh-trinh','dich-vu'],
    R15: ['ve-tinh','cong-vao','dich-vu'],
    'khach-la': ['cong-vao']
  };

  /* KHU VỰC KHÁCH HÀNG của nhân sự — tách riêng khỏi màn nghiệp vụ, xem trong
     phạm vi quyền (phần nào vai không mở được thì không hiện). Gia đình,
     học viên, CTV thì ngược lại: KHÔNG thấy một màn nghiệp vụ nào. */
  var KH_NS = ['nha-minh','hanh-trinh','dich-vu'];
  M.VAI_KHACH = { R01:['nha-minh','hanh-trinh','dich-vu','ve-tinh','cong-vao'], R02:['nha-minh','hanh-trinh','dich-vu','ve-tinh','cong-vao'],
    R03:KH_NS, R04:KH_NS, R05:KH_NS, R06:KH_NS, R07:KH_NS, R08:KH_NS, R09:KH_NS, R10:KH_NS, R11:KH_NS, R12:KH_NS };

  /* Màn cũ không là phần của màn chính nào → khớp về màn chính nào.
     Bảng điều khiển theo vai: 12 bảng dk-<vai> + 120 màn chi tiết, 10 màn
     A–Z (va-*) và 10 màn Giám đốc (gd-*) là CÁC MỤC bên trong "Bảng điều
     khiển của tôi" — mở từ đó, không đứng ở cột trái. */
  M.KHOP_TIEN_TO = [[/^dk-(phuhuynh|hocvien)(-|$)/, 'nha-minh'], [/^dk-daisu(-|$)/, 've-tinh'],
                    [/^dk-(?!cua-toi$|cac-vai$)/, 'ban-lam-viec'], [/^va-/, 'ban-lam-viec'], [/^gd-/, 'ban-lam-viec'],
                    [/^van-hanh-(10|gd)$/, 'ban-lam-viec']];
  M.KHOP = { 'studio-he':'noi-dung', 'lam-phim-10':'noi-dung', 'ban-dung':'noi-dung', 'san-xuat-ai':'noi-dung',
             'ban-co-tong':'ban-lam-viec', 'pham-vi':'quan-tri' };

  var PHAN_CUA = {};
  M.HUB.forEach(function(hb){ hb.phan.forEach(function(v){ if(!PHAN_CUA[v]) PHAN_CUA[v] = hb.id; }); });
  M.hub = function(id){ for(var i = 0; i < M.HUB.length; i++) if(M.HUB[i].id === id) return M.HUB[i]; return null; };

  /* Danh mục: mọi trang là phần của một màn chính (không trùng). */
  M.danhMuc = function(){ return Object.keys(PHAN_CUA); };

  /* Màn chính chứa trang v (ưu tiên màn chính của vai đang dùng). */
  M.hubCua = function(v, dsVai){
    /* Trang kho nghề thuộc màn chính CỦA VAI có dùng kho ấy — gia đình mở kho
       "Hành trình nhà mình" thì ở lại màn của nhà, không bị đưa sang màn kho
       nội bộ của đội ngũ. Vai có màn Kho nghề thì ở đó. */
    var kn = /^kn-([a-z]+)$/.exec(v);
    if(kn && dsVai && dsVai.indexOf('kho-nghe') < 0){
      var ma = kn[1].toUpperCase();
      for(var k = 0; k < dsVai.length; k++){ var hk = M.hub(dsVai[k]); if(hk && hk.kho.indexOf(ma) >= 0) return hk.id; }
    }
    /* Một trang có thể là phần của hai màn (Bảng điều khiển của tôi: khu nhà
       mình cho gia đình, Bàn làm việc cho nhân sự) — ưu tiên màn CỦA VAI. */
    if(dsVai) for(var q = 0; q < dsVai.length; q++){ var hq = M.hub(dsVai[q]); if(hq && hq.phan.indexOf(v) >= 0) return hq.id; }
    if(PHAN_CUA[v]) return PHAN_CUA[v];
    var V5 = G.V50;
    if(V5 && V5.GOP && V5.GOP[v]) return M.hubCua(V5.GOP[v][0][0], dsVai);
    var c = V5 && V5.cumCua ? V5.cumCua(v) : null;
    if(c){
      var ds = dsVai || [];
      for(var i = 0; i < ds.length; i++){ var hb = M.hub(ds[i]); if(hb && hb.kho.indexOf(c.ma) >= 0) return hb.id; }
      /* Chương của kho khu khách → màn khu khách đầu tiên dùng kho ấy (không đưa
         sang màn Kho nghề nội bộ). */
      for(var j2 = 0; j2 < M.HUB.length; j2++){ var hk2 = M.HUB[j2]; if(hk2.khu === 'khach' && hk2.kho.indexOf(c.ma) >= 0) return hk2.id; }
      return 'kho-nghe';
    }
    if(M.KHOP[v]) return M.KHOP[v];
    for(var j = 0; j < M.KHOP_TIEN_TO.length; j++) if(M.KHOP_TIEN_TO[j][0].test(v)) return M.KHOP_TIEN_TO[j][1];
    return null;
  };

  /* Vai đang dùng ('khach-la' khi chưa đăng nhập). */
  M.vai = function(){ var r = G.S && G.S.roleObj; return r && r.id ? r.id : 'khach-la'; };
  M.hubVai = function(id){
    var vai = id || M.vai(), ds = (M.VAI[vai] || []).slice(), tran = M.TRAN_VAI[vai] || 0;
    /* Ban tài chính: nhân sự được Super Admin cấp vị trí tài chính có thêm màn
       Tài chính ngay sau Bàn làm việc; vẫn giữ đúng trần của vai (bỏ màn cuối). */
    if(!id && ds.indexOf('tai-chinh') < 0 && G.S && G.S.taiChinhMuc && G.S.taiChinhMuc.length && /^R(0[1-9]|1[0-2])$/.test(vai)) ds.splice(1, 0, 'tai-chinh');
    return ds.slice(0, tran);
  };
  M.hubKhach = function(id){ return (M.VAI_KHACH[id || M.vai()] || []).slice(); };
  M.hubTatCa = function(id){ return M.hubVai(id).concat(M.hubKhach(id)); };
  /* CỔNG KHU KHÁCH: tài khoản khách không mở được trang khu nhân sự — kể cả gõ
     thẳng địa chỉ #màn hay bấm một liên kết lạc. Được mở: phần của màn khu
     khách, chương học thuyết khách được đọc (cụm của kho khu khách, hoặc chương
     không mang quyền nghiệp vụ), bảng điều khiển của nhà mình. app.js gọi ở
     G.allowed; perm / gói vẫn gác như cũ. */
  M.chanKhach = function(v){
    if(!M.laKhach() || !G.S || !G.S.acc) return false;
    var id = M.hubCua(v, M.hubVai()), hb = id && M.hub(id);
    if(hb && hb.khu === 'khach') return false;
    /* Chương học thuyết: chỉ chương thuộc KHO KHU KHÁCH (Hành trình nhà mình ·
       Cam kết với gia đình · Trải nghiệm & lan toả). Chương phương pháp, nghề,
       tư vấn… của đội ngũ không mở cho khách, kể cả chương không mang quyền. */
    var c = G.V50 && G.V50.cumCua ? G.V50.cumCua(v) : null;
    if(c && M.KHO_KHACH.indexOf(c.ma) >= 0) return false;
    return true;
  };
  M.KHO_KHACH = (function(){ var o = []; M.HUB.forEach(function(hb){ if(hb.khu === 'khach') hb.kho.forEach(function(k){ if(o.indexOf(k) < 0) o.push(k); }); }); return o; })();
  M.laKhach = function(id){ var v = id || M.vai(); return v === 'khach-la' || v === 'R13' || v === 'R14' || v === 'R15'; };

  /* Vì sao trang v chưa mở với tài khoản này — null là đã mở. Khách thấy
     phần bị khoá kèm lý do (chờ tầng · cần gói · ngoài vai), không thấy
     một nút chết. Quyền thật vẫn do G.allowed / G.can / máy chủ gác. */
  var TEN_BAC = { 1:'Super Admin', 2:'Admin', 3:'Giám đốc', 4:'Quản lý chuyên môn', 5:'Trưởng nhóm Coach', 8:'Giáo viên trở lên', 10:'Chuyên gia đánh giá trở lên', 11:'Tư vấn trở lên', 12:'đội ngũ GITA 365', 13:'phụ huynh', 14:'học viên', 15:'tài khoản đã đăng ký' };
  /* Loại khoá: 'vai' (ngoài vai/cấp) · 'kichHoat' · 'tang' · 'goi' · 'khong' (chưa có).
     Khách chỉ được thấy khoá 'tang' / 'goi' / 'kichHoat' — đó là quyền lợi sẽ mở;
     khoá 'vai' là việc của nhân sự, ẩn hẳn để khách không rối. */
  M.khoaLoai = function(v){
    var ly = M.khoa(v);
    if(!ly) return null;
    if(ly === 'Chưa có trên bản này') return 'khong';
    if(/^Dành cho/.test(ly) || ly === 'Trong kho nghề của đội ngũ') return 'vai';
    if(/^Mở khi tài khoản/.test(ly)) return 'kichHoat';
    if(/Tầng/.test(ly)) return 'tang';
    return 'goi';
  };
  M.khoa = function(v){
    var it = G.navItem ? G.navItem(v) : null;
    if(!G.manCoThat || !G.manCoThat(v)) return 'Chưa có trên bản này';
    if(it && it.perm && G.can && !G.can(it.perm)){
      var lvCan = G.PERM ? G.PERM[it.perm] : null;
      return 'Dành cho ' + (TEN_BAC[lvCan] || ('cấp ' + lvCan + ' trở lên'));
    }
    if(it && it.hienKhi && typeof G[it.hienKhi] === 'function' && !G[it.hienKhi]()) return 'Mở khi tài khoản được kích hoạt dịch vụ';
    var goi = G.goiCanCho ? G.goiCanCho(v) : null;
    if(goi && G.coGoi && !G.coGoi(goi) && !(G.KHO && G.KHO.dangNap && G.KHO.dangNap.indexOf(goi) >= 0)){
      var t = /^tang(\d)$/.exec(goi);
      if(t) return 'Mở khi nhà lên Tầng ' + t[1];
      if(goi === 'nghe' || goi === 'nghe-cao') return 'Trong kho nghề của đội ngũ';
      return 'Cần gói dịch vụ đang hoạt động';
    }
    return null;
  };

  G.V50M = M;
})();
