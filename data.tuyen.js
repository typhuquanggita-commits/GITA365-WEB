/* ═══════════════════════════════════════════════════════════════
   GITA 365 · v7.8 — BỐN TUYẾN VÀ ĐƯỜNG GHÉP

   Học viện chạy thêm bốn tuyến chuyên môn: ENGWIN365 · MATH365 ·
   SAT365 · HSA365. Chuẩn của từng tuyến đang được dựng riêng, hợp nhất
   vào GITA365 sau.

   Tệp này KHÔNG chứa chuẩn của tuyến nào. Nó chỉ dựng sẵn đường ghép:
   chỗ để khai một tuyến, cách đặt tên gói cấp phép của tuyến ấy, và
   hình dạng mà chuẩn phải có khi mang về. Nội dung thật đi vào kho-goc/
   như mọi kho khác, và được mã hoá thành gói riêng.

   BA QUYẾT ĐỊNH ĐÃ CHỐT — chép lại ở đây để lần sau không phải đoán:

   1. NĂM TẦNG DÙNG CHUNG. Cả bốn tuyến đi theo T1 NHẬN DIỆN → T5 BỨT
      PHÁ. Nghĩa là ma trận, cổng nghiệm thu, chuẩn thời gian và cách
      đồng hành dùng lại được nguyên; hợp nhất là ghép dữ liệu, không
      phải viết lại khung.

   2. BĂNG RIÊNG TỪNG TUYẾN. Bốn băng XANH · VÀNG · CAM · ĐỎ giữ nguyên
      tên và nguyên ý nghĩa, nhưng TÍN HIỆU VÀO băng do từng tuyến tự
      đặt: SAT365 đo bằng điểm thi thử, MATH365 đo bằng tốc độ và độ
      chắc khi làm bài, GITA365 đo bằng mức tự chủ và số ngày liền mạch.
      Cùng một cái tên băng phải có cùng một ý nghĩa hành động, nếu
      không thì Coach chạy hai tuyến sẽ hiểu "nhà CAM" theo hai kiểu.

   3. KHÔNG RƠI VỀ BĂNG CỦA GITA365. Tuyến chưa có chuẩn băng thì
      G.bangCuaTuyen() trả về null và giao diện nói thẳng là chưa có.
      Mượn tạm băng của GITA365 cho đỡ trống là cách chắc chắn nhất để
      một tuyến chạy sai chuẩn suốt nhiều tháng mà không ai biết.

   TÊN GÓI CẤP PHÉP — ràng buộc cứng: bảy gói cũ (nen · nghe · tang1…
   tang5) KHÔNG được đổi tên. Giấy phép đã cấp cho đội ngũ và cho máy
   khách đang dùng đúng những tên ấy; đổi tên là mọi giấy phép đã phát
   ra thành giấy lộn. Nên tuyến GITA365 giữ nguyên tên cũ, còn tuyến mới
   mang tiền tố riêng: math365-nghe, math365-t1, …
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;

/* ══════════ A · NĂM TUYẾN ══════════
   trangThai:
     'chay'  — đã hợp nhất, đang phục vụ khách
     'chuan' — đang dựng chuẩn, chưa mở cho khách
   Một tuyến chỉ được chuyển sang 'chay' khi đủ sáu mốc ở phần C. */
G.TUYEN = [
  { ma:'GITA365', ten:'GITA 365', day:'Hệ Sinh Thái Gia Đình Thịnh Vượng',
    c:'#2A72C6', trangThai:'chay', goiCu:true,
    mo:'Tuyến gốc. Đồng hành cả gia đình vận hành được sau 365 ngày.',
    ai:'Cả nhà — phụ huynh và học viên đi cùng nhau.',
    bangKho:'MT_BANG',
    doBang:'Mức tự chủ của học viên và số ngày giữ được nhịp liên tiếp.' },

  { ma:'ENGWIN365', ten:'Engwin 365', day:'Tiếng Anh — thắng bằng nhịp, không bằng nhồi',
    c:'#0B7350', trangThai:'chuan', goiCu:false,
    mo:'Tuyến tiếng Anh. Chuẩn đang dựng.',
    ai:'Học viên có mục tiêu tiếng Anh, đi kèm nhịp nhà.',
    bangKho:'ENGWIN_BANG',
    doBang:'' },

  { ma:'MATH365', ten:'Math 365', day:'Toán — chắc gốc trước, nhanh sau',
    c:'#5140B4', trangThai:'chuan', goiCu:false,
    mo:'Tuyến toán. Chuẩn đang dựng.',
    ai:'Học viên cần dựng lại nền toán hoặc đẩy lên mức cao.',
    bangKho:'MATH_BANG',
    doBang:'' },

  { ma:'SAT365', ten:'SAT 365', day:'SAT — đi theo mốc điểm, không đi theo cảm giác',
    c:'#B45309', trangThai:'chuan', goiCu:false,
    mo:'Tuyến luyện SAT. Chuẩn đang dựng.',
    ai:'Học viên đặt mục tiêu du học hoặc xét tuyển bằng SAT.',
    bangKho:'SAT_BANG',
    doBang:'' },

  { ma:'HSA365', ten:'HSA 365', day:'Đánh giá năng lực HSA — đủ dạng trước, đủ tốc sau',
    c:'#BE0E16', trangThai:'chuan', goiCu:false,
    mo:'Tuyến đánh giá năng lực HSA. Chuẩn đang dựng.',
    ai:'Học viên thi đánh giá năng lực để xét tuyển đại học.',
    bangKho:'HSA_BANG',
    doBang:'' }
];

G.TUYEN_GOC = 'GITA365';

/* ══════════ B · TÊN GÓI CẤP PHÉP ══════════
   Một chỗ duy nhất sinh ra tên gói. Trước v7.8 danh sách bảy gói được
   gõ cứng ở ba nơi — src/kho-khoa.js, tools/tao-giay-phep.js và
   server/GITA_CapPhep.gs — nên thêm một gói là phải nhớ sửa đủ ba chỗ,
   quên một chỗ thì máy chủ cấp khoá cho gói mà ứng dụng không biết xin,
   hoặc ngược lại. Nay hai nơi chạy JavaScript đọc thẳng từ đây; bản
   trên máy chủ Apps Script là bản chép, và bộ kiểm phát hành đối chiếu
   hai bản mỗi lần chạy. */

G.TUYEN_SO_TANG = 5;

/* Tên gói NGHỀ của một tuyến */
G.goiNghe = function(maTuyen){
  var t = G.tuyen(maTuyen);
  if(!t) return '';
  return t.goiCu ? 'nghe' : (t.ma.toLowerCase() + '-nghe');
};

/* Tên gói NGHỀ CAO — hồ sơ khách hàng tầng 4-5, chỉ từ Coach lên tới
   Super Admin. Tách ra thành gói riêng chứ không lọc trên màn hình: gói
   NGHỀ cấp tới bậc 12, nên để chung là Giáo viên, Mentor, Chuyên gia
   đánh giá và Phân tích dữ liệu đều nhận đủ hồ sơ tầng cao về máy. */
G.goiNgheCao = function(maTuyen){
  var t = G.tuyen(maTuyen);
  if(!t) return '';
  return t.goiCu ? 'nghe-cao' : (t.ma.toLowerCase() + '-nghe-cao');
};

/* Tên gói TẦNG của một tuyến */
G.goiTang = function(maTuyen, tang){
  var t = G.tuyen(maTuyen);
  if(!t || !(tang >= 1 && tang <= G.TUYEN_SO_TANG)) return '';
  return t.goiCu ? ('tang' + tang) : (t.ma.toLowerCase() + '-t' + tang);
};

G.tuyen = function(ma){
  var a = G.TUYEN || [];
  for(var i = 0; i < a.length; i++) if(a[i].ma === ma) return a[i];
  return null;
};

/* Toàn bộ tên gói hợp lệ của hệ. 'nen' đứng ngoài mọi tuyến: nó là mô
   hình chung của hệ sinh thái, ai đăng nhập cũng có. */
G.moiGoi = function(){
  var ds = ['nen'], i, j;
  for(i = 0; i < (G.TUYEN || []).length; i++){
    var t = G.TUYEN[i];
    ds.push(G.goiNghe(t.ma));
    for(j = 1; j <= G.TUYEN_SO_TANG; j++) ds.push(G.goiTang(t.ma, j));
  }
  return ds;
};

/* Gói của MỘT tuyến — dùng khi cấp giấy phép theo tuyến */
G.goiCuaTuyen = function(maTuyen){
  var t = G.tuyen(maTuyen); if(!t) return [];
  var ds = [G.goiNghe(maTuyen)];
  for(var j = 1; j <= G.TUYEN_SO_TANG; j++) ds.push(G.goiTang(maTuyen, j));
  return ds;
};

/* Đọc ngược: một tên gói thuộc tuyến nào, tầng nào */
G.doiGoi = function(ten){
  var s = String(ten || '');
  if(s === 'nen') return { tuyen:null, loai:'nen', tang:0 };
  if(s === 'nghe') return { tuyen:'GITA365', loai:'nghe', tang:0 };
  var m = s.match(/^tang([1-5])$/);
  if(m) return { tuyen:'GITA365', loai:'tang', tang:Number(m[1]) };
  m = s.match(/^([a-z0-9]+)-(nghe|t([1-5]))$/);
  if(!m) return null;
  var t = null, a = G.TUYEN || [];
  for(var i = 0; i < a.length; i++) if(a[i].ma.toLowerCase() === m[1]) t = a[i];
  if(!t) return null;
  return { tuyen:t.ma, loai:m[3] ? 'tang' : 'nghe', tang:m[3] ? Number(m[3]) : 0 };
};

/* ══════════ C · TUYẾN ĐỦ ĐIỀU KIỆN HỢP NHẤT CHƯA ══════════
   Sáu mốc. Không mốc nào là thủ tục: thiếu bất kỳ mốc nào thì tuyến ấy
   mở ra là khách gặp chỗ trống, hoặc đội ngũ chạy không có chuẩn. */
G.TUYEN_MOC = [
  { ma:'M1', ten:'Bốn băng có tín hiệu vào',
    y:'Băng riêng là phần khác nhau giữa các tuyến. Thiếu nó thì không biết lúc nào một học viên đang trượt, và cả bộ máy đồng hành đứng im.',
    do:'bang' },
  { ma:'M2', ten:'Năm tầng có nội dung',
    y:'Năm tầng dùng chung khung, nhưng nội dung từng tầng là của riêng tuyến. Tầng rỗng thì học viên lên tầng ấy là gặp màn trống.',
    do:'tang' },
  { ma:'M3', ten:'Kịch bản dẫn dắt',
    y:'Người dạy và người đồng hành phải có câu mở, mục tiêu và câu chốt cho từng tình huống — không thì mười người dạy mười kiểu.',
    do:'kichban' },
  { ma:'M4', ten:'Bộ đo đầu vào',
    y:'Chưa đo được thì không xếp được băng, không đặt được mục tiêu, và không chứng minh được tiến bộ về sau.',
    do:'do' },
  { ma:'M5', ten:'Gói cấp phép đã mã hoá',
    y:'Nội dung tuyến phải nằm trong gói .enc riêng, để bán tuyến này mà không mở tuyến kia.',
    do:'goi' },
  { ma:'M6', ten:'Học phí riêng của tuyến',
    y:'Mỗi tuyến một chính sách học phí ĐỘC LẬP — không dùng bảng giá của tuyến khác. Chưa có giá của chính tuyến này thì Tư vấn không nói chuyện tiền được, và mở ra là mở nửa vời.',
    do:'hocphi' },
  { ma:'M7', ten:'Hợp đồng riêng của tuyến',
    y:'Mỗi tuyến biên soạn hợp đồng theo quy định của chính tuyến ấy: mười bốn điều chung ở G.HD_CHUAN không được bỏ điều nào, bảy điều riêng ở G.HD_RIENG phải do người phụ trách tuyến tự quyết. Nhận tiền của gia đình khi chưa có văn bản ghi rõ giao gì và hoàn thế nào là đặt cả hai bên vào chỗ không có đường lui.',
    do:'hopdong' }
];

/* ══════════ D · HÌNH DẠNG CHUẨN BĂNG PHẢI CÓ ══════════
   Khi anh mang chuẩn băng của một tuyến về, nó phải có đúng những
   trường này — cùng hình dạng với G.MT_BANG của GITA365. Cùng hình
   dạng thì lúc hợp nhất là ghép, không phải nắn lại.

   Trường 'vao' là phần RIÊNG của mỗi tuyến; những trường còn lại nói
   cách hành động, và bốn tuyến phải giữ cùng một ý nghĩa hành động cho
   cùng một tên băng. */
G.TUYEN_BANG_TRUONG = [
  { t:'ma',    y:'XANH · VANG · CAM · DO — đúng bốn mã này, không thêm bớt.' },
  { t:'ten',   y:'Tên gọi trong tuyến này, ví dụ "Băng CAM — học viên đang trượt".' },
  { t:'c',     y:'Mã màu. Dùng đúng màu của G.MT_BANG để bốn tuyến nhìn như một hệ.' },
  { t:'thu',   y:'Thứ tự 1–4 từ tốt xuống xấu.' },
  { t:'tyLe',  y:'Tỉ lệ ước tính của tệp học viên rơi vào băng này.' },
  { t:'y',     y:'Một câu nói băng này nghĩa là gì với học viên.' },
  { t:'vao',   y:'TÍN HIỆU VÀO — phần riêng của tuyến. Phải là con số đo được, không phải cảm nhận.' },
  { t:'nhip',  y:'Bao lâu chạm một lần, và chạm bằng cách gì.' },
  { t:'tran',  y:'Trần việc giao mỗi tuần ở băng này.' },
  { t:'keo',   y:'Ai kéo chính, ai vào cùng.' },
  { t:'len',   y:'Điều kiện lên băng trên.' },
  { t:'xuong', y:'Điều kiện rơi xuống băng dưới.' },
  { t:'cam',   y:'Việc TUYỆT ĐỐI không làm ở băng này.' }
];

/* Băng của một tuyến. Trả null khi tuyến chưa có chuẩn — KHÔNG mượn
   băng của GITA365. Xem lý do ở quyết định số 3 đầu tệp. */
G.bangCuaTuyen = function(maTuyen){
  var t = G.tuyen(maTuyen);
  if(!t || !t.bangKho) return null;
  var b = G[t.bangKho];
  return (b && b.length) ? b : null;
};

/* Tuyến đã đạt mốc nào — đo bằng dữ liệu thật đang có trong máy, không
   bằng một cờ ai đó tự bật. */
G.tuyenDatMoc = function(maTuyen){
  var t = G.tuyen(maTuyen); if(!t) return {};
  var goc = t.ma === G.TUYEN_GOC;
  var bang = G.bangCuaTuyen(maTuyen);
  var daNap = (G.KHO && G.KHO.daNap) || [];
  return {
    bang:    !!(bang && bang.length === 4),
    tang:    goc ? true : !!G[t.ma + '_TANG'],
    kichban: goc ? true : !!G[t.ma + '_KICHBAN'],
    do:      goc ? true : !!G[t.ma + '_DO'],
    goi:     daNap.indexOf(G.goiNghe(maTuyen)) >= 0,
    /* Học phí: tuyến gốc đọc kho HP_* (chương trình năm tầng đã lập trình
       từ đầu, chỉ áp cho GITA365); tuyến mới đọc kho riêng của nó. Không
       tuyến nào mượn bảng giá của tuyến nào. */
    hocphi:  goc ? (G.hpDaCoGia ? G.hpDaCoGia() : false) : !!G[t.ma + '_HOCPHI'],
    /* Hợp đồng: phải có kho riêng của tuyến VÀ phủ đủ mười bốn điều chuẩn.
       Có kho mà thiếu điều là chưa đạt — thiếu một điều là bỏ một lớp bảo
       vệ, và lớp bị bỏ luôn là lớp cần tới đúng lúc khó nhất. */
    hopdong: G.hdDuChuan ? G.hdDuChuan(maTuyen) : false
  };
};

/* Hợp đồng của một tuyến đã phủ đủ mười bốn điều chuẩn chưa.
   Kho hợp đồng của tuyến đặt tên theo tiền tố: GITA365_HOPDONG,
   MATH365_HOPDONG… mỗi bản ghi mang trường `ma` khớp mã điều chuẩn. */
G.hdDuChuan = function(maTuyen){
  var t = G.tuyen(maTuyen); if(!t) return false;
  var hd = G[t.ma + '_HOPDONG'];
  if(!hd || !hd.length) return false;
  var can = (G.HD_CHUAN || []).map(function(x){ return x.ma; });
  if(!can.length) return false;
  var co = {};
  hd.forEach(function(x){ if(x && x.ma) co[x.ma] = true; });
  for(var i = 0; i < can.length; i++) if(!co[can[i]]) return false;
  return true;
};

/* Điều nào của bản chuẩn mà hợp đồng tuyến này còn thiếu.

   Trả về NULL khi chưa nạp được bản chuẩn — không trả mảng rỗng. Bản
   chuẩn nằm trong kho nghề, nên tài khoản chưa được cấp phép sẽ không
   có nó; lọc trên một mảng rỗng cho ra "không thiếu điều nào", và đó là
   ĐẠT RỖNG: bài kiểm xanh vì không có gì để kiểm, chứ không phải vì mọi
   thứ đã đủ. */
G.hdConThieu = function(maTuyen){
  var can = G.HD_CHUAN;
  if(!can || !can.length) return null;
  var t = G.tuyen(maTuyen);
  if(!t) return can.map(function(x){ return x.ma; });
  var hd = G[t.ma + '_HOPDONG'] || [], co = {};
  hd.forEach(function(x){ if(x && x.ma) co[x.ma] = true; });
  return can.filter(function(x){ return !co[x.ma]; }).map(function(x){ return x.ma; });
};

/* ══════════ E · TUYẾN CỦA MỘT TÀI KHOẢN ══════════
   Tài khoản không khai tuyến thì mặc định chỉ có GITA365. Đây là điều
   giữ cho mọi tài khoản và mọi giấy phép đã cấp trước v7.8 chạy y
   nguyên: không khai gì là không đổi gì. */
G.tuyenCuaTK = function(acc){
  var ds = acc && acc.tuyen;
  /* Không khai gì nghĩa là GITA365 — mọi tài khoản có trước v7.8 giữ
     nguyên phạm vi cũ mà không phải sửa. */
  if(!ds || !ds.length) return [G.TUYEN_GOC];
  var ra = [];
  for(var i = 0; i < ds.length; i++)
    if(G.tuyen(ds[i]) && ra.indexOf(ds[i]) < 0) ra.push(ds[i]);
  /* Có khai nhưng không tuyến nào có thật thì KHÔNG rơi về GITA365. Khai
     sai mà vẫn được phục vụ GITA365 là xem nhầm tuyến trong im lặng.
     Trả về rỗng thì chỉ còn gói nền và màn xin cấp phép hiện ngay — sai
     thấy được là sai sửa được. Giữ đúng một luật với máy chủ cấp phép ở
     server/GITA_CapPhep.gs. */
  return ra;
};
