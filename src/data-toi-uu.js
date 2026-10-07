/* ═══════════════════════════════════════════════════════════════
   GITA 365 — TRUNG TÂM ĐO LƯỜNG & TỐI ƯU · THAM SỐ + THƯ VIỆN GIẢI PHÁP

   1. KHOI · KPI · cham() — bản sao ĐÚNG TỪNG PHÉP của may-chu/toi-uu-cham.js
      (tools/thu-toi-uu.mjs so hai bên; lệch là đỏ).
   2. VAN_DE — mỗi chỉ số chấm được có: vấn đề, nguyên nhân thường gặp,
      2–5 giải pháp. Mỗi giải pháp: các bước, vai triển khai, hạn (ngày),
      tác động (1–3), công sức (1–3), màn làm việc. Vai và hạn PHẢI khớp
      GIAI_PHAP của máy chủ — máy chủ dùng chúng để phân bổ và đặt mốc.
   3. BAN_DO — mỗi khối trỏ về các màn đang có, ghi màn nào số thật, màn
      nào số mẫu, màn nào lý thuyết; màn trùng ghi rõ dùng màn nào thay.
   4. QUY_TRINH — đo → chẩn đoán → chọn giải pháp → phân bổ → triển khai
      → đo lại → đóng hoặc nhân rộng.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;
(function(){
  var TU = G.TU = {};
  TU.PHIEN_BAN_TU = 'TU-2026.10-a';
  TU.KHOI = [
    { ma:'TV', ten:'Tư vấn & bán hàng',        ban:['B04'],               man:'crm' },
    { ma:'CO', ten:'Coach & chăm sóc',          ban:['B05','B14'],         man:'coach-dp' },
    { ma:'KH', ten:'Khách hàng & trải nghiệm',  ban:['B06'],               man:'do-luong-he' },
    { ma:'MK', ten:'Marketing & nội dung',      ban:['B02','B03','B12'],   man:'kien-truc-thi-giac' },
    { ma:'TC', ten:'Tài chính',                 ban:['B11'],               man:'phong-tai-chinh' },
    { ma:'NS', ten:'Nhân sự & vận hành',        ban:['B08','B13','B16'],   man:'nang-luc-ns' },
    { ma:'CN', ten:'Công nghệ, AI & an toàn',   ban:['B01','B07','B09','B10','B15'], man:'bo-nao-da-tri' }
  ];
  TU.KPI = [
    { ma:'tv1', khoi:'TV', ten:'Nhà mới vào học',                 dv:'nhà',        kieu:'tang' },
    { ma:'tv2', khoi:'TV', ten:'Tỷ lệ kích hoạt đăng ký',         dv:'%',          kieu:'cao',  muc:60, vang:40 },
    { ma:'tv3', khoi:'TV', ten:'Nhà chưa có người phụ trách',     dv:'%',          kieu:'thap', muc:5,  vang:15 },
    { ma:'tv4', khoi:'TV', ten:'Hẹn chăm sóc quá hạn',            dv:'%',          kieu:'thap', muc:5,  vang:15 },
    { ma:'tv5', khoi:'TV', ten:'Tỷ lệ chốt cơ hội',               dv:'%',          kieu:'cao',  muc:40, vang:25 },
    { ma:'tv6', khoi:'TV', ten:'Giá trị cơ hội đang mở',          dv:'đ',          kieu:'theoDoi' },
    { ma:'co1', khoi:'CO', ten:'Lượt chạm mỗi nhà',               dv:'lượt/nhà',   kieu:'cao',  muc:4,  vang:2, theoKy:true },
    { ma:'co2', khoi:'CO', ten:'Nhà quá 7 ngày chưa được chạm',   dv:'%',          kieu:'thap', muc:15, vang:30 },
    { ma:'co3', khoi:'CO', ten:'Nhà đèn đỏ',                      dv:'%',          kieu:'thap', muc:10, vang:20 },
    { ma:'co4', khoi:'CO', ten:'Tỷ lệ ngày tick việc hôm nay',    dv:'%',          kieu:'cao',  muc:50, vang:30 },
    { ma:'co5', khoi:'CO', ten:'Báo cáo ngày mỗi nhà',            dv:'báo cáo/nhà', kieu:'cao', muc:12, vang:6, theoKy:true },
    { ma:'co6', khoi:'CO', ten:'Khoảnh khắc WOW',                 dv:'lượt',       kieu:'tang' },
    { ma:'co7', khoi:'CO', ten:'Nhà lên tầng',                    dv:'nhà',        kieu:'tang' },
    { ma:'kh1', khoi:'KH', ten:'Tỷ lệ nhà có hoạt động',          dv:'%',          kieu:'cao',  muc:70, vang:50 },
    { ma:'kh2', khoi:'KH', ten:'Phút dùng app mỗi nhà',           dv:'phút/nhà',   kieu:'cao',  muc:300, vang:120, theoKy:true },
    { ma:'kh3', khoi:'KH', ten:'NPS',                             dv:'điểm',       kieu:'cao',  muc:50, vang:20 },
    { ma:'kh4', khoi:'KH', ten:'Hài lòng CSAT',                   dv:'/5',         kieu:'cao',  muc:4,  vang:3.5 },
    { ma:'kh5', khoi:'KH', ten:'Tỷ lệ hoàn tiền',                 dv:'%',          kieu:'thap', muc:2,  vang:5 },
    { ma:'mk1', khoi:'MK', ten:'Đăng ký mới (lead)',              dv:'lượt',       kieu:'tang' },
    { ma:'mk2', khoi:'MK', ten:'Bài nội dung vào cổng',           dv:'bài',        kieu:'tang' },
    { ma:'mk3', khoi:'MK', ten:'Bài đăng kênh ngoài',             dv:'bài',        kieu:'tang' },
    { ma:'mk4', khoi:'MK', ten:'Lượt xem (khai từ kênh ngoài)',   dv:'lượt',       kieu:'tang' },
    { ma:'mk5', khoi:'MK', ten:'Tỷ lệ bấm trên xem',              dv:'%',          kieu:'cao',  muc:2,  vang:1 },
    { ma:'mk6', khoi:'MK', ten:'Nhà mới đến từ giới thiệu',       dv:'%',          kieu:'cao',  muc:20, vang:10 },
    { ma:'tc1', khoi:'TC', ten:'Tiền thu đã duyệt',               dv:'đ',          kieu:'tang' },
    { ma:'tc2', khoi:'TC', ten:'Tỷ lệ chi trên thu',              dv:'%',          kieu:'thap', muc:70, vang:90 },
    { ma:'tc3', khoi:'TC', ten:'Dòng tiền ròng',                  dv:'đ',          kieu:'cao',  muc:0,  vang:0 },
    { ma:'tc4', khoi:'TC', ten:'Phiếu thu chờ duyệt quá 3 ngày',  dv:'phiếu',      kieu:'thap', muc:0,  vang:2 },
    { ma:'tc5', khoi:'TC', ten:'Kỳ thu quá hạn chưa thu đủ',      dv:'kỳ',         kieu:'thap', muc:0,  vang:3 },
    { ma:'tc6', khoi:'TC', ten:'Chi không có hoá đơn',            dv:'%',          kieu:'thap', muc:10, vang:25 },
    { ma:'tc7', khoi:'TC', ten:'Đề xuất chi chờ duyệt quá 7 ngày', dv:'phiếu',     kieu:'thap', muc:0,  vang:3 },
    { ma:'ns1', khoi:'NS', ten:'Nhân sự đăng nhập trong 7 ngày',  dv:'%',          kieu:'cao',  muc:80, vang:60 },
    { ma:'ns2', khoi:'NS', ten:'Thao tác mỗi nhân sự mỗi ngày',   dv:'lượt',       kieu:'theoDoi' },
    { ma:'ns3', khoi:'NS', ten:'Nhân sự mới chưa qua đủ ba cửa',  dv:'người',      kieu:'thap', muc:0,  vang:1 },
    { ma:'ns4', khoi:'NS', ten:'Việc tối ưu quá hạn',             dv:'việc',       kieu:'thap', muc:0,  vang:2 },
    { ma:'ns5', khoi:'NS', ten:'Tài khoản nhân sự bỏ không 30 ngày', dv:'tài khoản', kieu:'thap', muc:0, vang:2 },
    { ma:'cn1', khoi:'CN', ten:'Token AI tiêu thụ',               dv:'token',      kieu:'tran' },
    { ma:'cn2', khoi:'CN', ten:'Lỗi nhà cung cấp AI mỗi ngày',    dv:'lỗi/ngày',   kieu:'thap', muc:2,  vang:5 },
    { ma:'cn3', khoi:'CN', ten:'Báo động · đóng băng hệ thống',   dv:'lần',        kieu:'thap', muc:0,  vang:1 },
    { ma:'cn4', khoi:'CN', ten:'Phát hiện thanh tra mức nặng',    dv:'lần',        kieu:'thap', muc:0,  vang:1 },
    { ma:'cn5', khoi:'CN', ten:'Yêu cầu xoá dữ liệu quá hạn',     dv:'yêu cầu',    kieu:'thap', muc:0,  vang:0 }
  ];
  function r1(x){ return Math.round(x * 10) / 10; }
  TU.nguong = function(k, ngay){
    var he = k.theoKy ? (Number(ngay) || 30) / 30 : 1;
    return { muc: k.muc == null ? null : r1(k.muc * he), vang: k.vang == null ? null : r1(k.vang * he) };
  };
  TU.cham = function(k, gt, truoc, ngay){
    if(k.kieu === 'theoDoi') return 'theoDoi';
    if(gt == null || isNaN(Number(gt))) return 'chuaDo';
    var v = Number(gt);
    if(k.kieu === 'tang'){
      if(truoc == null) return 'chuaDo';
      if(!(truoc > 0)) return v > 0 ? 'dat' : 'chuaDo';
      return v >= truoc ? 'dat' : v >= truoc * 0.8 ? 'canhBao' : 'xau';
    }
    if(k.kieu === 'tran'){
      if(truoc == null || !(truoc > 0)) return v >= 0 ? 'dat' : 'chuaDo';
      return v <= truoc * 1.2 ? 'dat' : v <= truoc * 1.5 ? 'canhBao' : 'xau';
    }
    var n = TU.nguong(k, ngay);
    if(k.kieu === 'cao') return v >= n.muc ? 'dat' : v >= n.vang && n.vang < n.muc ? 'canhBao' : 'xau';
    return v <= n.muc ? 'dat' : v <= n.vang ? 'canhBao' : 'xau';
  };
  var DIEM_TT = { dat:100, canhBao:50, xau:0 };
  TU.diem = function(dsTT){
    var v = dsTT.filter(function(t){ return DIEM_TT[t] != null; }).map(function(t){ return DIEM_TT[t]; });
    return v.length ? Math.round(v.reduce(function(a, b){ return a + b; }, 0) / v.length) : null;
  };
  TU.chamHet = function(gt, truoc, ngay){
    var kpi = TU.KPI.map(function(k){
      var tt = TU.cham(k, gt[k.ma], truoc ? truoc[k.ma] : null, ngay);
      return { ma:k.ma, khoi:k.khoi, gt: gt[k.ma] == null ? null : gt[k.ma], truoc: truoc && truoc[k.ma] != null ? truoc[k.ma] : null, tt:tt, nguong:TU.nguong(k, ngay) };
    });
    var khoi = TU.KHOI.map(function(K){
      var ds = kpi.filter(function(x){ return x.khoi === K.ma; });
      return { ma:K.ma, diem:TU.diem(ds.map(function(x){ return x.tt; })), xau:ds.filter(function(x){ return x.tt === 'xau'; }).length,
        canhBao:ds.filter(function(x){ return x.tt === 'canhBao'; }).length, dat:ds.filter(function(x){ return x.tt === 'dat'; }).length };
    });
    var dk = khoi.map(function(k){ return k.diem; }).filter(function(x){ return x != null; });
    return { kpi:kpi, khoi:khoi, tong: dk.length ? Math.round(dk.reduce(function(a, b){ return a + b; }, 0) / dk.length) : null };
  };

  /* ═══════════ THƯ VIỆN VẤN ĐỀ → GIẢI PHÁP ═══════════
     gp(ma, ten, mo, buoc, vai, han, tacDong, congSuc, man) */
  function gp(ma, ten, mo, buoc, vai, han, td, cs, man){ return { ma:ma, ten:ten, mo:mo, buoc:buoc, vai:vai, han:han, tacDong:td, congSuc:cs, man:man }; }
  TU.VAN_DE = {
    tv1: { ten:'Số nhà mới vào học tụt so kỳ trước', viSao:['Lead vào ít (xem mk1)','Lead có nhưng tư vấn chậm gọi lại','Giá / gói chưa khớp nhóm khách đang đến'], gp:[
      gp('tv1-1','Gọi lại mọi lead trong 2 giờ','Tốc độ phản hồi là đòn bẩy chốt lớn nhất ở bước đầu.',['Bật danh sách lead mới mỗi sáng ở CRM','Chia lead theo tư vấn viên, mỗi người tối đa 15 lead/ngày','Gọi trong 2 giờ, ghi kết quả ngay vào CRM','Cuối tuần đo tỷ lệ gọi trong 2 giờ'],['R11'],30,3,2,'crm'),
      gp('tv1-2','Mở lại kênh giới thiệu từ nhà cũ','Nhà đang học hài lòng là nguồn khách rẻ và tin nhất.',['Lọc nhà tầng A/B ở Đo lường khách hàng','Đại sứ gửi lời mời kèm câu chuyện thật','Tặng credit thưởng khi nhà được giới thiệu vào học'],['R15'],30,2,1,'dai-su'),
      gp('tv1-3','Rà gói tầng 1–2 theo phản hồi khách','Khi khách đến mà không vào học, thường gói chưa khớp.',['Đọc lý do thua ở cơ hội CRM 60 ngày gần nhất','Gom 3 lý do lặp lại nhiều nhất','Đề xuất chỉnh gói / lời hứa ở Bảng giá, Super Admin duyệt'],['R03'],30,2,2,'bang-gia')
    ]},
    tv2: { ten:'Đăng ký xong nhưng không kích hoạt tài khoản', viSao:['Thư kích hoạt vào thư rác hoặc hết hạn','Không ai gọi nhắc trong 24 giờ đầu','Bước đăng ký còn dài, khó trên điện thoại'], gp:[
      gp('tv2-1','Gọi nhắc trong 24 giờ','Một cuộc gọi ngắn nhắc kích hoạt và chào đón.',['Mỗi sáng lấy danh sách đăng ký chờ kích hoạt','Gọi, hướng dẫn mở thư, gửi lại liên kết nếu cần','Ghi kết quả gọi vào CRM'],['R11'],7,3,1,'crm'),
      gp('tv2-2','Kịch bản chào đón 3 chạm','Nhắn ngay · gọi sau 24 giờ · nhắn lời mời việc đầu tiên sau 48 giờ.',['Soạn 3 tin theo giọng GITA','Gắn vào quy trình tư vấn','Đo tỷ lệ kích hoạt sau 2 tuần'],['R11','R03'],14,2,2,'kich-ban-sale'),
      gp('tv2-3','Rút gọn bước kích hoạt','Kiểm thư kích hoạt, thời hạn liên kết và màn trên điện thoại.',['Thử đăng ký trên 2 điện thoại','Ghi các chỗ vướng','Sửa thời hạn liên kết / nội dung thư'],['R02'],7,2,2,'noi-may-chu')
    ]},
    tv3: { ten:'Nhà đang học chưa có người phụ trách', viSao:['Nhà mới vào chưa được giao Coach / tư vấn','Nhân sự nghỉ mà chưa chuyển nhà','Không có luật giao tự động'], gp:[
      gp('tv3-1','Giao ngay các nhà đang trống','Mỗi nhà phải có một người chịu trách nhiệm.',['Lọc nhà chưa phụ trách ở CRM','Giao theo tải: người đang kèm ít nhà nhất','Báo người được giao trong ngày'],['R03','R04'],3,3,1,'crm'),
      gp('tv3-2','Luật bàn giao khi nhân sự nghỉ','Cho nghỉ một tài khoản thì phải chuyển hết nhà trước.',['Thêm bước "chuyển nhà" vào quy trình cho nghỉ','Kiểm tra: tài khoản nghỉ không còn nhà nào','Ghi nhật ký bàn giao'],['R02'],7,2,2,'vong-doi-tk'),
      gp('tv3-3','Trưởng nhóm rà phân bổ mỗi tuần','10 phút đầu tuần xem nhà trống và tải từng Coach.',['Mở thẻ Từng người ở Trung tâm đo lường','Chuyển nhà từ người quá tải sang người còn sức','Ghi lý do chuyển'],['R05'],7,2,1,'trung-tam-do')
    ]},
    tv4: { ten:'Hẹn chăm sóc đã quá hạn', viSao:['Tư vấn quá tải','Hẹn đặt xa mà không có nhắc','Nhà đã rời nhưng chưa đóng trên CRM'], gp:[
      gp('tv4-1','Dọn hẹn quá hạn trong 3 ngày','Gọi hoặc đặt lại hẹn mới có lý do, đóng nhà đã rời.',['Lọc hẹn quá hạn ở CRM','Gọi từng nhà, ghi kết quả','Nhà đã rời: chuyển giai đoạn "rời" có lý do'],['R11'],3,3,1,'crm'),
      gp('tv4-2','Trần tải mỗi tư vấn viên','Một người không giữ quá số nhà chăm được.',['Đo số nhà mỗi người ở thẻ Từng người','Đặt trần (ví dụ 60 nhà)','Chuyển phần vượt sang người khác'],['R04'],7,2,2,'trung-tam-do'),
      gp('tv4-3','Nhắc hẹn tự động mỗi sáng','Danh sách hẹn hôm nay hiện đầu màn của tư vấn.',['Bật bộ lọc "hẹn hôm nay" làm mặc định ở CRM','Thêm thông báo sáng cho người phụ trách','Đo hẹn quá hạn sau 2 tuần'],['R02'],14,2,2,'crm')
    ]},
    tv5: { ten:'Tỷ lệ chốt cơ hội thấp', viSao:['Hỏi chưa đủ để hiểu nhu cầu trước khi báo giá','Báo giá sai gói','Theo dõi sau báo giá thưa'], gp:[
      gp('tv5-1','Sáu nhịp tư vấn đủ trước khi báo giá','Không báo giá khi chưa qua bước hỏi để hiểu.',['Ôn kịch bản sale giọng GITA','Ghi rõ nhu cầu chính vào cơ hội trước khi chuyển "báo giá"','Trưởng phòng nghe lại 3 cuộc/tuần'],['R11'],14,3,2,'kich-ban-sale'),
      gp('tv5-2','Phân tích lý do thua','Đọc lý do thua để sửa đúng chỗ.',['Gom lý do thua 60 ngày','Xếp 3 lý do đầu','Mỗi lý do một cách xử lý được viết vào kịch bản'],['R04','R11'],21,2,2,'crm'),
      gp('tv5-3','Gói dùng thử 7 ngày','Cho khách trải nghiệm trước khi quyết định.',['Thiết kế gói thử từ tầng 1','Đặt điều kiện chuyển gói','Đo tỷ lệ chuyển sau 30 ngày'],['R03'],30,2,3,'bang-gia'),
      gp('tv5-4','Nhịp theo dõi sau báo giá','Chạm lại ngày 1 · 3 · 7 sau báo giá.',['Đặt hẹn tiếp ngay khi báo giá','Mỗi lần chạm mang một giá trị mới (câu chuyện, tài liệu)','Đóng cơ hội có lý do sau ngày 14'],['R11'],14,2,1,'crm')
    ]},
    co1: { ten:'Coach chạm khách quá thưa', viSao:['Coach kèm quá nhiều nhà','Chưa có nhịp chạm chuẩn','Chạm mà không ghi vào sổ'], gp:[
      gp('co1-1','Nhịp chạm chuẩn mỗi tuần','Mỗi nhà tối thiểu 1 lượt chạm/tuần, ghi sổ chạm.',['Trưởng nhóm phổ biến nhịp','Coach lên lịch chạm cố định','Cuối tuần đối chiếu ở Điều phối & giám sát'],['R05'],7,3,1,'coach-dp'),
      gp('co1-2','Ghi đủ mọi lượt chạm','Chạm qua điện thoại / Zalo cũng phải ghi sổ.',['Ghi ngay sau khi chạm','Mỗi lượt kèm căn cứ','Kiểm số lượt ghi so với lịch'],['R06','R07'],14,2,1,'van-hanh-cham-soc'),
      gp('co1-3','Mẫu tin chạm nhanh','Tin nhắn mẫu theo tầng giúp chạm trong 1 phút.',['Soạn 10 mẫu theo tầng và tình huống','Gắn vào màn chạm','Đo số lượt chạm trước/sau'],['R02'],14,2,2,'van-hanh-cham-soc')
    ]},
    co2: { ten:'Nhiều nhà im lặng quá 7 ngày không ai chạm', viSao:['Không có danh sách "nhà im lặng" mỗi sáng','Coach chỉ chạm nhà chủ động hỏi','Nhà mới vào chưa có lịch chạm'], gp:[
      gp('co2-1','Chạm ngay mọi nhà im lặng','Trong 48 giờ, mỗi nhà im lặng nhận một lượt hỏi thăm.',['Lọc nhà quá 7 ngày ở Điều phối & giám sát','Chạm, nghe trước, ghi sổ','Nhà không phản hồi: báo Trưởng nhóm'],['R06','R07'],2,3,1,'coach-dp'),
      gp('co2-2','Danh sách im lặng mỗi sáng','Trưởng nhóm phát danh sách cho Coach mỗi sáng.',['Mở danh sách im lặng 8 giờ sáng','Giao từng nhà cho Coach phụ trách','Chiều kiểm đã chạm chưa'],['R05'],7,2,1,'trung-tam-do'),
      gp('co2-3','Cảnh báo tự động ngày thứ 5','Nhà im lặng 5 ngày thì hiện cảnh báo cho Coach.',['Thêm cảnh báo ở màn Coach','Kèm nút chạm nhanh','Đo tỷ lệ im lặng sau 2 tuần'],['R02'],14,2,2,'coach-dp')
    ]},
    co3: { ten:'Tỷ lệ nhà đèn đỏ cao', viSao:['Can thiệp chậm khi nhà chuyển vàng','Vấn đề gốc chưa được phân tích','Coach thiếu công cụ xử lý ca khó'], gp:[
      gp('co3-1','Gọi mọi nhà đỏ trong 24 giờ','Nghe trước, công nhận, rồi một bước nhỏ.',['Lọc nhà đỏ','Gọi trong 24 giờ, ghi sổ chạm','Mở ca xử lý cho nhà chưa ổn'],['R06','R07'],1,3,1,'xu-ly-ca'),
      gp('co3-2','Can thiệp nhanh 14 ngày','Trưởng nhóm / quản lý chuyên môn kèm ca đỏ tới khi về vàng.',['Mở Phân tích nhu cầu cho từng nhà đỏ','Chọn giải pháp từ kho giải pháp coach','Họp ca 2 lần/tuần'],['R05','R04'],14,3,2,'coach-pt'),
      gp('co3-3','Bồi dưỡng Coach xử lý ca khó','Đào tạo theo 3 ca đỏ lặp lại nhiều nhất.',['Gom 3 dạng ca đỏ phổ biến','Soạn buổi luyện tình huống','Đánh giá lại sau 30 ngày'],['R04'],30,2,2,'coach-cl')
    ]},
    co4: { ten:'Nhà ít tick việc hôm nay', viSao:['Việc hôm nay quá nặng','Quên mở app','Không thấy lợi ích của việc tick'], gp:[
      gp('co4-1','Coach hạ việc về một việc nhỏ','Một việc duy nhất, làm được trong 5 phút.',['Rà việc hôm nay của từng nhà tick thấp','Thay bằng việc nhỏ hơn','Khen ngay khi nhà tick lần đầu'],['R06','R07'],14,3,1,'coach-tk'),
      gp('co4-2','Thử thách 7 ngày liền','Chuỗi 7 ngày có credit thưởng.',['Mở thử thách cho nhà tick thấp','Nhắc mỗi tối','Trao credit thưởng chuỗi'],['R04'],21,2,2,'vi-credit'),
      gp('co4-3','Nhắc tối đúng giờ','Một nhắc lúc 20 giờ theo giờ nhà đã chọn.',['Thêm giờ nhắc vào hồ sơ nhà','Gửi nhắc','Đo tỷ lệ tick sau 2 tuần'],['R02'],14,2,2,'hom-nay'),
      gp('co4-4','Gắn credit thưởng rõ ràng','Hiện rõ mỗi lần tick được bao nhiêu credit.',['Hiện số credit cạnh nút tick','Thông báo khi cộng thưởng','Đo trước/sau'],['R03'],21,1,1,'credit-gita')
    ]},
    co5: { ten:'Nhà ít gửi báo cáo ngày', viSao:['Mẫu báo cáo dài','Không ai phản hồi báo cáo','Nhà không thấy báo cáo dùng để làm gì'], gp:[
      gp('co5-1','Coach phản hồi mọi báo cáo trong 24 giờ','Báo cáo có người đọc thì nhà mới gửi tiếp.',['Mỗi sáng đọc báo cáo hôm qua','Phản hồi một câu cụ thể','Ghi lượt chạm'],['R06','R07'],14,3,1,'coach-dp'),
      gp('co5-2','Rút gọn mẫu báo cáo','Ba ô: học bao lâu · việc gì xong · cảm xúc.',['Rà mẫu hiện tại','Bỏ ô không dùng','Thử 2 tuần'],['R04'],14,2,1,'do-luong-he'),
      gp('co5-3','Tổng kết tuần tự động','Nhà nhận bảng tóm tắt tuần từ chính báo cáo của mình.',['Dựng bảng tóm tắt tuần','Gửi tối chủ nhật','Đo số báo cáo sau 3 tuần'],['R02'],21,2,2,'ho-so-thang')
    ]},
    co6: { ten:'Ít khoảnh khắc WOW', viSao:['Coach chưa chủ động tạo bất ngờ','Không có danh mục WOW để chọn'], gp:[
      gp('co6-1','Mỗi Coach 2 WOW/tuần','Chủ động ghi nhận tiến bộ nhỏ của nhà.',['Đặt chỉ tiêu 2 WOW/tuần','Chia sẻ WOW hay trong nhóm','Ghi vào sổ chạm loại wow'],['R05'],30,2,1,'coach-dp'),
      gp('co6-2','Danh mục WOW theo tầng','20 ý tưởng WOW chi phí thấp.',['Soạn danh mục','Gắn vào màn Coach','Đo số WOW sau 30 ngày'],['R06','R07'],30,2,2,'chuoi-wow')
    ]},
    co7: { ten:'Ít nhà lên tầng', viSao:['Chưa có mốc lên tầng rõ','Nhà không thấy giá trị tầng sau','Tư vấn chưa vào cuộc ở thời điểm vàng'], gp:[
      gp('co7-1','Đặt mốc lên tầng cho nhà tầng A/B','Mỗi nhà tiềm năng có ngày mục tiêu lên tầng.',['Lọc nhà tầng A/B','Coach thống nhất mốc với nhà','Theo dõi mốc hằng tuần'],['R05'],30,3,2,'do-luong-he'),
      gp('co7-2','Buổi tổng kết thành quả trước khi hết tầng','Cho nhà thấy mình đã đi được bao xa.',['Lên lịch buổi tổng kết 7 ngày trước hết tầng','Dùng hồ sơ tháng làm bằng chứng','Giới thiệu tầng sau'],['R04'],30,3,2,'ho-so-thang'),
      gp('co7-3','Tư vấn vào cuộc đúng lúc','Tư vấn gặp nhà ngay sau buổi tổng kết.',['Coach báo tư vấn khi nhà sẵn sàng','Tư vấn gặp trong 48 giờ','Ghi cơ hội lên tầng ở CRM'],['R11'],30,2,1,'crm')
    ]},
    kh1: { ten:'Nhiều nhà không hoạt động trong kỳ', viSao:['Nhà mất nhịp sau 2–3 tuần đầu','App chưa có việc rõ ràng cho mỗi ngày','Không ai nhận ra nhà đã ngừng'], gp:[
      gp('kh1-1','Tái kích hoạt nhà ngừng hoạt động','Một lời mời việc nhỏ 5 phút.',['Lọc nhà không hoạt động ở Đo lường khách hàng','Gửi lời mời việc nhỏ','Gọi nếu sau 3 ngày vẫn im'],['R06','R07'],7,3,1,'do-luong-he'),
      gp('kh1-2','Chương trình 21 ngày đầu','Kèm sát 21 ngày đầu để hình thành nếp.',['Thiết kế nhịp 21 ngày','Gắn cho mọi nhà mới','Đo tỷ lệ hoạt động ngày 30'],['R04'],21,3,2,'coach-ct'),
      gp('kh1-3','Màn Hôm nay rõ một việc','Mở app là thấy đúng một việc nên làm.',['Rà màn Hôm nay','Bỏ nhiễu, giữ một việc','Đo tỷ lệ hoạt động sau 3 tuần'],['R02'],21,2,2,'hom-nay')
    ]},
    kh2: { ten:'Nhà dùng app quá ít phút', viSao:['Nội dung chưa hấp dẫn','Khó tìm bài phù hợp','Không có lộ trình học từng tuần'], gp:[
      gp('kh2-1','Lộ trình học từng tuần cho từng nhà','Mỗi tuần 3 bài đúng nút thắt của nhà.',['Coach chọn 3 bài/tuần','Gắn vào lộ trình nhà','Đo phút học sau 3 tuần'],['R04'],21,3,2,'lo-trinh'),
      gp('kh2-2','Bài ngắn 7 phút','Chia bài dài thành bài ngắn dễ học.',['Chọn 10 bài học nhiều nhất','Cắt thành bài 7 phút','Đo phút học'],['R08'],30,2,3,'khoa-dao-tao'),
      gp('kh2-3','Gợi ý bài tiếp theo','Học xong một bài thì gợi ý bài kế.',['Thêm gợi ý cuối bài','Theo nút thắt của nhà','Đo phút học sau 3 tuần'],['R02'],21,2,2,'khoa-dao-tao')
    ]},
    kh3: { ten:'NPS thấp', viSao:['Kỳ vọng khi mua cao hơn trải nghiệm','Phản hồi chậm','Nhà không thấy tiến bộ rõ'], gp:[
      gp('kh3-1','Gọi lại mọi nhà chấm 0–6','Nghe lý do, sửa ngay một điều.',['Lọc phiếu NPS 0–6','Gọi trong 48 giờ','Ghi lý do và cách sửa'],['R04'],14,3,1,'do-luong-he'),
      gp('kh3-2','Cho nhà thấy tiến bộ mỗi tháng','Hồ sơ tháng gửi kèm lời Coach.',['Coach viết 3 dòng nhận xét tháng','Gửi cùng báo cáo tháng','Đo NPS tháng sau'],['R05'],30,3,2,'ho-so-thang'),
      gp('kh3-3','Khớp lời hứa bán hàng với trải nghiệm','Sửa lời hứa vượt quá điều giao được.',['Đối chiếu kịch bản sale với chương trình','Bỏ lời hứa không giao được','Cập nhật Bảng giá / kịch bản'],['R03'],30,2,2,'bang-gia')
    ]},
    kh4: { ten:'Mức hài lòng CSAT thấp', viSao:['Buổi coach chưa đều chất lượng','Thời gian phản hồi dài','Kênh hỗ trợ không rõ'], gp:[
      gp('kh4-1','Chấm chất lượng buổi coach','Mỗi tuần chấm 3 buổi theo 10 tiêu chí.',['Chọn ngẫu nhiên 3 buổi','Chấm ở Kiểm soát chất lượng','Phản hồi Coach trong 48 giờ'],['R04'],14,3,2,'coach-cl'),
      gp('kh4-2','Cam kết phản hồi 24 giờ','Mọi câu hỏi của nhà được trả lời trong 24 giờ.',['Công bố cam kết','Đo thời gian phản hồi','Nhắc người trễ'],['R05'],30,2,1,'coach-dp'),
      gp('kh4-3','Đọc lời nhà nói mỗi tháng','Phân tích bình luận khảo sát để tìm gốc.',['Gom bình luận tháng','Xếp chủ đề','Đề xuất 2 thay đổi'],['R12'],14,2,1,'do-luong-he')
    ]},
    kh5: { ten:'Tỷ lệ hoàn tiền cao', viSao:['Bán sai gói','Trải nghiệm tuần đầu kém','Chưa giữ chân trước khi duyệt hoàn'], gp:[
      gp('kh5-1','Cuộc gọi giữ chân trước khi duyệt hoàn','Hiểu lý do, đề nghị phương án khác.',['Mọi đề xuất hoàn qua một cuộc gọi','Ghi lý do','Duyệt hoàn đúng luật nếu nhà vẫn muốn'],['R03'],7,2,1,'phong-tai-chinh'),
      gp('kh5-2','Kèm sát tuần đầu','Tuần đầu quyết định nhà ở lại.',['Coach chạm 3 lần tuần đầu','Một thắng lợi nhỏ trong 7 ngày','Đo hoàn tiền 60 ngày'],['R04'],30,3,2,'coach-ct'),
      gp('kh5-3','Tư vấn đúng gói','Kiểm nhu cầu trước khi chốt gói.',['Thêm 3 câu kiểm nhu cầu vào kịch bản','Ghi vào cơ hội','Đo hoàn tiền theo tư vấn viên'],['R11'],30,2,2,'kich-ban-sale')
    ]},
    mk1: { ten:'Lead mới tụt', viSao:['Đăng bài thưa','Nội dung chưa đúng nỗi đau','Không có lời mời hành động rõ'], gp:[
      gp('mk1-1','Lịch đăng cố định 5 bài/tuần','Đều đặn hơn là nhiều.',['Lập lịch 4 tuần','Một gốc ra bảy nhánh','Theo dõi lead mỗi tuần'],['R03'],30,3,2,'noi-dung-tiep-thi'),
      gp('mk1-2','Đại sứ chia sẻ câu chuyện thật','Câu chuyện nhà thật hút lead tốt nhất.',['Chọn 5 nhà có tiến bộ rõ, xin đồng ý','Soạn câu chuyện','Đại sứ chia sẻ'],['R15'],30,2,2,'dai-su'),
      gp('mk1-3','Đo nguồn lead','Biết kênh nào ra lead để dồn sức.',['Gắn mã nguồn vào liên kết đăng ký','Đọc nguồn mỗi tuần','Bỏ kênh không ra lead'],['R12'],14,2,1,'kien-truc-thi-giac')
    ]},
    mk2: { ten:'Ít bài nội dung được duyệt vào cổng', viSao:['Bài kẹt ở bước soát','Thiếu người viết'], gp:[
      gp('mk2-1','Dọn bài treo','Duyệt hoặc trả bài treo quá 7 ngày.',['Lọc bài treo','Phân người soát','Trả lời trong 48 giờ'],['R03'],14,2,1,'bien-soan-noi-dung'),
      gp('mk2-2','Lịch viết theo tầng','Mỗi tuần mỗi tầng một bài.',['Lập lịch','Giao người viết','Đo số bài vào cổng'],['R04'],14,2,2,'bien-soan-noi-dung')
    ]},
    mk3: { ten:'Ít bài đăng kênh ngoài', viSao:['Không có người phụ trách đăng','Thiếu nội dung đã duyệt'], gp:[
      gp('mk3-1','Một người phụ trách đăng mỗi kênh','Rõ người, rõ giờ vàng.',['Giao người phụ trách từng kênh','Đặt giờ vàng','Ghi sổ đăng'],['R03'],14,2,1,'kien-truc-thi-giac'),
      gp('mk3-2','Lên lịch đăng sẵn','Đăng hẹn giờ để không phụ thuộc người.',['Chọn công cụ hẹn giờ','Nạp bài 2 tuần','Kiểm hằng tuần'],['R02'],14,2,2,'kien-truc-thi-giac')
    ]},
    mk4: { ten:'Lượt xem kênh ngoài tụt', viSao:['Chưa khai số đều','Nội dung kém hút'], gp:[
      gp('mk4-1','Khai số kênh ngoài mỗi tuần','Không khai thì không đo được.',['Đặt lịch khai thứ Hai','Khai đủ xem · bấm · nhắn','Đọc xu hướng'],['R12'],14,2,1,'kien-truc-thi-giac'),
      gp('mk4-2','Làm lại 3 bài tệ nhất','Đổi tiêu đề, ảnh bìa, 3 giây đầu.',['Lọc 3 bài xem thấp','Làm lại','So sánh lượt xem'],['R03'],30,2,2,'kien-truc-thi-giac')
    ]},
    mk5: { ten:'Tỷ lệ bấm thấp', viSao:['Lời mời hành động mờ','Liên kết khó bấm'], gp:[
      gp('mk5-1','Lời mời hành động rõ một việc','Mỗi bài một lời mời duy nhất.',['Rà 10 bài gần nhất','Viết lại lời mời','Đo tỷ lệ bấm'],['R03'],14,2,1,'noi-dung-tiep-thi'),
      gp('mk5-2','Thử A/B tiêu đề','Hai tiêu đề, giữ cái thắng.',['Chọn bài thử','Đăng 2 phiên bản','Ghi kết quả'],['R12'],14,2,2,'kien-truc-thi-giac'),
      gp('mk5-3','Trang đích ngắn','Bấm vào là thấy ngay lợi ích và nút đăng ký.',['Rà trang đích','Rút gọn','Đo tỷ lệ đăng ký'],['R03'],21,2,2,'tham-gia')
    ]},
    mk6: { ten:'Ít nhà mới đến từ giới thiệu', viSao:['Chưa có chương trình giới thiệu','Nhà hài lòng chưa được mời'], gp:[
      gp('mk6-1','Chương trình giới thiệu có credit thưởng','Nhà giới thiệu thành công nhận credit.',['Thiết kế mức thưởng','Công bố trong app','Đo nhà giới thiệu'],['R03'],30,3,2,'credit-gita'),
      gp('mk6-2','Mời nhà tầng A sau buổi tổng kết','Lúc nhà vui nhất là lúc mời.',['Coach mời sau buổi tổng kết','Đưa thiệp giới thiệu','Ghi vào CRM'],['R05'],30,2,1,'do-luong-he'),
      gp('mk6-3','Đại sứ kèm nhà mới','Đại sứ dẫn nhà được giới thiệu qua tuần đầu.',['Ghép đại sứ với nhà mới','Lịch 3 chạm tuần đầu','Đo tỷ lệ ở lại'],['R15'],30,2,2,'dai-su')
    ]},
    tc1: { ten:'Tiền thu tụt so kỳ trước', viSao:['Ít nhà mới','Thu kỳ chậm','Nhiều phiếu chưa duyệt'], gp:[
      gp('tc1-1','Duyệt hết phiếu thu tồn','Tiền đã nhận mà chưa duyệt thì chưa vào số.',['Lọc phiếu chờ duyệt','Duyệt / trả lại trong 48 giờ','Đối chiếu ngân hàng'],['R03'],14,2,1,'phong-tai-chinh'),
      gp('tc1-2','Nhắc thu đúng hạn','Nhắc trước hạn 3 ngày, đúng hạn và sau hạn.',['Lập danh sách kỳ sắp tới hạn','Nhắc theo mẫu','Ghi hẹn thanh toán'],['R11'],30,3,1,'phong-tai-chinh'),
      gp('tc1-3','Tăng giá trị trung bình mỗi nhà','Lên tầng và gói chuyên đề.',['Kết hợp giải pháp co7','Đề xuất gói chuyên đề','Đo giá trị trung bình'],['R03'],30,2,2,'bang-gia')
    ]},
    tc2: { ten:'Chi chiếm tỷ lệ cao trên thu', viSao:['Chi cố định lớn so quy mô','Chi phát sinh không qua duyệt','Tiền thu thấp'], gp:[
      gp('tc2-1','Rà 5 khoản chi lớn nhất','Cắt hoặc thương lượng lại.',['Lọc 5 khoản lớn nhất','Đánh giá giá trị mang lại','Cắt / giảm ít nhất một khoản'],['R03'],14,3,2,'phong-tai-chinh'),
      gp('tc2-2','Trần chi theo khoản mục','Mỗi khoản mục một trần tháng.',['Đặt trần theo lịch sử','Cảnh báo khi chạm 80%','Duyệt riêng khi vượt'],['R02'],30,2,2,'chi-phi'),
      gp('tc2-3','Quy tắc duyệt chi 2 người','Khoản trên ngưỡng cần 2 người duyệt.',['Đặt ngưỡng','Bật duyệt 2 người','Kiểm hằng tháng'],['R01'],30,2,1,'phong-tai-chinh')
    ]},
    tc3: { ten:'Dòng tiền ròng âm', viSao:['Chi vượt thu trong kỳ','Thu bị dồn về sau'], gp:[
      gp('tc3-1','Kế hoạch tiền mặt 13 tuần','Nhìn trước tuần nào thiếu tiền.',['Lập bảng thu/chi 13 tuần','Đánh dấu tuần âm','Dời chi không gấp'],['R01','R03'],7,3,2,'tai-chinh-ceo'),
      gp('tc3-2','Thu trước theo kỳ','Khuyến khích trả trước tầng.',['Thiết kế ưu đãi trả trước','Công bố','Đo dòng tiền'],['R03'],30,2,2,'bang-gia')
    ]},
    tc4: { ten:'Phiếu thu chờ duyệt quá lâu', viSao:['Người duyệt quá tải','Thiếu chứng từ'], gp:[
      gp('tc4-1','Duyệt trong 48 giờ','Mọi phiếu thu được xử lý trong 48 giờ.',['Lọc phiếu quá 3 ngày','Duyệt hoặc trả lại có lý do','Báo người ghi'],['R03'],2,3,1,'phong-tai-chinh'),
      gp('tc4-2','Người duyệt dự phòng','Một người duyệt thay khi vắng.',['Cấp quyền kế toán thu cho người thứ hai','Ghi luật thay','Đo thời gian duyệt'],['R02'],7,2,1,'phan-quyen')
    ]},
    tc5: { ten:'Kỳ thu quá hạn chưa thu đủ', viSao:['Không nhắc trước hạn','Nhà gặp khó khăn tài chính','Kỳ thu ghi sai'], gp:[
      gp('tc5-1','Gọi mọi kỳ quá hạn trong 3 ngày','Nghe, hẹn ngày trả, ghi hẹn.',['Lọc kỳ quá hạn','Gọi, ghi hẹn thanh toán','Báo kế toán'],['R11'],3,3,1,'phong-tai-chinh'),
      gp('tc5-2','Phương án giãn kỳ có luật','Cho nhà khó khăn giãn kỳ thay vì bỏ học.',['Soạn luật giãn kỳ','Duyệt từng ca','Ghi miễn giảm / lịch mới'],['R03'],7,2,2,'phong-tai-chinh'),
      gp('tc5-3','Nhắc thu tự động trước hạn','Nhắc trước hạn 3 ngày.',['Bật nhắc','Mẫu tin','Đo quá hạn sau 30 ngày'],['R02'],14,2,2,'phong-tai-chinh')
    ]},
    tc6: { ten:'Nhiều khoản chi không có hoá đơn', viSao:['Mua lẻ không lấy hoá đơn','Nhà cung cấp không xuất hoá đơn'], gp:[
      gp('tc6-1','Luật không hoá đơn không duyệt','Trừ khoản dưới ngưỡng nhỏ.',['Đặt ngưỡng','Từ chối khoản thiếu hoá đơn','Đo tỷ lệ'],['R03'],7,3,1,'phong-tai-chinh'),
      gp('tc6-2','Đổi nhà cung cấp có hoá đơn','Ưu tiên nhà cung cấp xuất hoá đơn.',['Lọc nhà cung cấp không hoá đơn','Tìm thay thế','Chuyển dần'],['R02'],14,2,2,'phong-tai-chinh')
    ]},
    tc7: { ten:'Đề xuất chi chờ duyệt quá lâu', viSao:['Người duyệt vắng','Thiếu báo giá / chứng từ'], gp:[
      gp('tc7-1','Duyệt chi trong 72 giờ','Duyệt hoặc trả lại có lý do.',['Lọc đề xuất quá 7 ngày','Xử lý','Báo người đề xuất'],['R03'],3,2,1,'phong-tai-chinh'),
      gp('tc7-2','Phân cấp duyệt theo số tiền','Khoản nhỏ duyệt cấp dưới.',['Đặt bậc duyệt','Cấp quyền','Đo thời gian duyệt'],['R01'],14,2,2,'phong-tai-chinh')
    ]},
    ns1: { ten:'Nhân sự ít đăng nhập', viSao:['Việc không gắn với app','Tài khoản thừa','Đăng nhập khó'], gp:[
      gp('ns1-1','Mỗi vai một việc hằng ngày trong app','Việc thật gắn vào bảng công việc.',['Rà bảng công việc từng vai','Giao việc hằng ngày','Đo đăng nhập'],['R03'],7,3,2,'bang-viec'),
      gp('ns1-2','Đăng nhập một chạm','Ghi nhớ thiết bị, khoá sinh trắc.',['Bật đăng nhập nhanh','Hướng dẫn','Đo đăng nhập'],['R02'],14,2,2,'noi-may-chu'),
      gp('ns1-3','Rà tài khoản thừa','Khoá tài khoản không dùng.',['Lọc tài khoản không đăng nhập 30 ngày','Hỏi trưởng bộ phận','Khoá có lý do'],['R03'],14,1,1,'phan-quyen')
    ]},
    ns3: { ten:'Nhân sự mới chưa qua đủ ba cửa', viSao:['Chưa có lịch kèm','Người kèm bận'], gp:[
      gp('ns3-1','Lịch qua ba cửa trong 14 ngày','Mỗi người mới có lịch và người kèm.',['Lập lịch','Giao người kèm','Ghi từng cửa'],['R04'],7,3,1,'con-nguoi'),
      gp('ns3-2','Chặn chạm khách khi chưa đủ cửa','Đúng luật Con người · Ba cửa.',['Kiểm luật đang bật','Nhắc người mới','Đo số người còn thiếu'],['R03'],14,2,1,'con-nguoi')
    ]},
    ns4: { ten:'Việc tối ưu bị trễ hạn', viSao:['Giao cho người quá tải','Hạn quá ngắn','Không ai theo dõi'], gp:[
      gp('ns4-1','Rà việc trễ và chuyển người','Chuyển việc từ người quá tải.',['Mở thẻ Triển khai','Chuyển người hoặc gia hạn có lý do','Báo người mới'],['R02'],3,3,1,'trung-tam-do'),
      gp('ns4-2','Họp 15 phút mỗi tuần','Điểm qua từng việc tối ưu đang chạy.',['Chọn giờ cố định','Mỗi việc một dòng tình trạng','Ghi quyết định'],['R01'],7,2,1,'trung-tam-do'),
      gp('ns4-3','Giới hạn 3 việc mở mỗi người','Không giao thêm khi đã có 3 việc.',['Đặt giới hạn','Phân bổ theo tải','Đo trễ hạn'],['R02'],14,2,1,'trung-tam-do')
    ]},
    ns5: { ten:'Có tài khoản nhân sự bỏ không', viSao:['Người đã nghỉ chưa khoá','Tài khoản dùng chung'], gp:[
      gp('ns5-1','Khoá tài khoản bỏ không','Giảm rủi ro an toàn dữ liệu.',['Lọc tài khoản không đăng nhập 30 ngày','Xác nhận với trưởng bộ phận','Khoá, ghi lý do'],['R02'],2,3,1,'phan-quyen'),
      gp('ns5-2','Quy trình cho nghỉ chuẩn','Nghỉ là khoá tài khoản trong ngày.',['Rà quy trình vòng đời tài khoản','Thêm bước khoá','Kiểm hằng tháng'],['R02'],14,2,1,'vong-doi-tk')
    ]},
    cn1: { ten:'Token AI phình nhanh', viSao:['Trùng lời gọi, không dùng bộ đệm','Gọi mô hình đắt cho việc đơn giản'], gp:[
      gp('cn1-1','Bật bộ đệm & rẻ trước','Việc lặp dùng bộ đệm; việc đơn giản dùng mô hình rẻ.',['Rà tỷ lệ trúng bộ đệm','Chuyển việc đơn giản sang mô hình rẻ','Đo token'],['R02'],7,3,2,'bo-nao-da-tri'),
      gp('cn1-2','Đo token theo tính năng','Biết tính năng nào ăn token.',['Gắn nhãn tính năng','Đọc top 5','Tối ưu tính năng đầu bảng'],['R12'],14,2,2,'bo-nao-da-tri'),
      gp('cn1-3','Trần token mỗi ngày','Chạm trần thì xếp hàng việc không gấp.',['Đặt trần','Cảnh báo 80%','Đo chi phí'],['R02'],14,2,1,'bo-nao-da-tri')
    ]},
    cn2: { ten:'Nhiều lỗi nhà cung cấp AI', viSao:['Một nhà cung cấp chập chờn','Thiếu dự phòng'], gp:[
      gp('cn2-1','Bật đường dự phòng','Lỗi thì tự chuyển nhà cung cấp khác.',['Kiểm cấu hình dự phòng','Thử ngắt giả lập','Đo lỗi'],['R02'],3,3,2,'bo-nao-da-tri'),
      gp('cn2-2','Ngắt mạch nhà cung cấp lỗi','Tạm ngắt khi lỗi vượt ngưỡng.',['Đặt ngưỡng','Bật ngắt mạch','Theo dõi'],['R02'],14,2,2,'noi-may-chu')
    ]},
    cn3: { ten:'Có báo động / đóng băng hệ thống', viSao:['Tấn công hoặc thao tác bất thường','Lỗi cấu hình'], gp:[
      gp('cn3-1','Điều tra trong 24 giờ','Đọc nhật ký cứu hệ, tìm gốc, ghi biên bản.',['Mở nhật ký cứu hệ','Xác định gốc','Ghi biên bản và cách phòng'],['R01','R02'],1,3,2,'noi-may-chu'),
      gp('cn3-2','Diễn tập cứu hệ mỗi quý','Đội biết làm gì khi có sự cố.',['Lên kịch bản','Diễn tập','Sửa quy trình'],['R02'],14,2,2,'la-chan-30')
    ]},
    cn4: { ten:'Thanh tra phát hiện lỗi nặng', viSao:['Quy trình bị bỏ qua','Thiếu kiểm tra chéo'], gp:[
      gp('cn4-1','Xử lý từng phát hiện nặng','Mỗi phát hiện có người, hạn, bằng chứng đóng.',['Đọc báo cáo thanh tra','Giao người xử lý','Đóng có bằng chứng'],['R01','R02'],3,3,2,'thanh-tra-soi'),
      gp('cn4-2','Đào tạo lại quy trình bị vi phạm','Sửa gốc thay vì sửa ngọn.',['Xác định quy trình','Đào tạo lại','Thanh tra lại sau 14 ngày'],['R04'],14,2,2,'luat-lam-viec')
    ]},
    cn5: { ten:'Yêu cầu xoá dữ liệu quá hạn', viSao:['Không ai nhận việc','Quy trình xoá chưa rõ'], gp:[
      gp('cn5-1','Xử lý ngay yêu cầu quá hạn','Đúng luật bảo vệ dữ liệu.',['Lọc yêu cầu quá hạn','Xoá trong sổ và ngoài sổ','Ghi căn cứ'],['R02'],1,3,1,'phap-ly-rui-ro'),
      gp('cn5-2','Giao người trực yêu cầu xoá','Một người chịu trách nhiệm, có người thay.',['Giao người trực','Cảnh báo khi còn 3 ngày','Kiểm hằng tuần'],['R02'],14,2,1,'phap-ly-rui-ro')
    ]}
  };
  /* Điểm ưu tiên của một giải pháp: tác động gấp đôi, trừ công sức */
  TU.uuTien = function(g){ return g.tacDong * 2 - g.congSuc; };
  /* Bảng mã → [kpi, vai, hạn] để so với máy chủ */
  TU.GIAI_PHAP = (function(){ var o = {}; Object.keys(TU.VAN_DE).forEach(function(k){ TU.VAN_DE[k].gp.forEach(function(g){ o[g.ma] = [k, g.vai.slice(), g.han]; }); }); return o; })();

  /* Vai → khối chịu trách nhiệm (đọc kết quả theo vai) */
  TU.VAI_KHOI = { R01:['TV','CO','KH','MK','TC','NS','CN'], R02:['NS','CN'], R03:['TV','CO','KH','MK','TC','NS'], R04:['CO','KH'], R05:['CO'], R06:['CO'], R07:['CO'],
    R08:['KH'], R09:['KH'], R10:['KH'], R11:['TV'], R12:['KH','CN'], R13:['KH'], R14:['KH'], R15:['MK'] };

  /* ═══════════ BẢN ĐỒ GOM MÀN — mỗi khối một chỗ ═══════════
     loai: that (số thật máy chủ) · mau (số minh hoạ) · ly (lý thuyết, khung) */
  TU.BAN_DO = {
    TV: [['crm','CRM — phễu, ưu tiên, cơ hội, KPI','that'], ['tt-cskh','Trung tâm Tư vấn & CSKH','that'], ['ban-tu-van','Bàn Tư vấn','ly'], ['kich-ban-sale','Kịch bản sale','ly'], ['tuvan-deck','Khoang mở cửa','mau','Trùng CRM — dùng CRM']],
    CO: [['coach-dp','Điều phối & giám sát Coach','that'], ['van-hanh-cham-soc','Vận hành & chăm sóc','that'], ['coach-cl','Kiểm soát chất lượng buổi coach','that'], ['coach-he','Hệ điều hành Coach','that'], ['coach-deck','Buồng lái Coach','mau','Trùng Điều phối & giám sát — dùng coach-dp'], ['doi-ngu','Đội ngũ dẫn dắt','mau','Dùng thẻ Từng người ở Trung tâm này']],
    KH: [['do-luong-he','Đo lường toàn diện khách hàng','that'], ['do-luong-kh','Hệ đo lường khách hàng (định nghĩa)','ly'], ['ra-soat-kh','Rà soát khách hàng','ly'], ['hai-long','Chỉ số hài lòng','mau','Trùng — NPS/CSAT thật ở Đo lường toàn diện khách hàng']],
    MK: [['kien-truc-thi-giac','Kiến trúc thị giác — phễu đăng','that'], ['bien-soan-noi-dung','Biên soạn nội dung','that'], ['noi-dung-tiep-thi','Nội dung & tiếp thị','ly'], ['chuoi-wow','Chuỗi WOW','ly']],
    TC: [['phong-tai-chinh','Phòng tài chính — kế toán, đối soát, KPI','that'], ['tai-chinh-ceo','Bảy con số CEO','that'], ['ke-toan-thue','Kế toán – Thuế','that'], ['credit-gita','Hệ thống Credit','that'], ['bang-gia','Bảng giá','that'], ['tai-chinh-qt','Bảng tài chính','mau','Trùng — dùng Phòng tài chính'], ['tang-truong','Tăng trưởng','mau','Trùng — dùng Trung tâm này (tc1, tv1)']],
    NS: [['nang-luc-ns','Năng lực nhân sự','that'], ['phan-quyen','Phân quyền','that'], ['con-nguoi','Con người · Ba cửa','that'], ['bang-viec','Bảng công việc','that'], ['dk-cac-vai','Bảng điều khiển các vai','that'], ['vong-doi-tk','Vòng đời tài khoản','mau']],
    CN: [['bo-nao-da-tri','Bộ não đa trí — token, lỗi, chi phí AI','that'], ['noi-may-chu','Nối máy chủ — sức khoẻ đêm','that'], ['suc-chua-toc-do','Sức chứa & tốc độ','that'], ['thanh-tra-soi','Thanh tra soi','that'], ['nhat-ky-ht','Nhật ký toàn hệ','that'], ['phap-ly-rui-ro','Pháp lý & rủi ro','that'], ['la-chan-30','Lá chắn 30 tầng','ly']],
    TONG: [['tong-quan','Tổng quan hôm nay','that','Gộp vào Trung tâm này — giữ làm màn phụ'], ['truy-van-da-chieu','Truy vấn đa chiều · bảng điểm 16 ban','that','Giữ — 16 ban gom vào 7 khối ở đây'], ['dieu-hanh','Trung tâm điều hành','mau','Số minh hoạ — thay bằng Trung tâm này làm màn chính'], ['van-hanh-10','Bảng điều khiển vận hành','mau'], ['van-hanh-gd','Bảng điều khiển Giám đốc','mau'], ['he-16','16 hệ thống','ly'], ['bo-may-tap-doan','Bộ máy tập đoàn','ly']]
  };
  TU.QUY_TRINH = [
    ['Đo', 'Máy tính 38 chỉ số từ dữ liệu thật mỗi lần mở; không ô nhập tay.'],
    ['Chẩn đoán', 'Chỉ số xấu / cảnh báo → vấn đề + nguyên nhân thường gặp; xếp theo khối điểm thấp nhất.'],
    ['Chọn giải pháp', '2–5 giải pháp mỗi vấn đề, xếp theo điểm ưu tiên = 2 × tác động − công sức. Super Admin chọn.'],
    ['Phân bổ', 'Máy chọn đúng vai của giải pháp, trong vai chọn người đang ít việc tối ưu nhất (hoà thì người hoạt động gần nhất). Super Admin đổi được.'],
    ['Triển khai', 'Kế hoạch có các bước, hạn, người phụ trách; người phụ trách tick từng bước.'],
    ['Đo lại', 'Đóng kế hoạch → máy đo lại đúng chỉ số ấy, ghi giá trị trước / sau.'],
    ['Đóng hoặc nhân rộng', 'Chỉ số đã cải thiện → giữ làm quy trình chuẩn; chưa cải thiện → chọn giải pháp khác.']
  ];
})();
