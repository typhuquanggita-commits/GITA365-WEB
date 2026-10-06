/* ═══════════════════════════════════════════════════════════════
   GITA 365 — BẢNG ĐIỀU KHIỂN GIÁM ĐỐC · 8 MÀN × 10 NGHIỆP VỤ

   Hub điều hành cho Giám đốc (perm dh_toan_he). Tám mảng theo phương án
   đã duyệt, MỖI MẢNG liệt kê 10 nghiệp vụ Giám đốc làm trong mảng đó
   (tổng 80 nghiệp vụ), kèm nút mở thẳng màn sâu — vẫn qua G.allowed().
     01 Quản lý hệ thống phòng ban        → phong-ban
     02 Quản lý nguồn lực GITA            → dieu-hanh
     03 CRM theo dõi kết quả kinh doanh   → crm
     04 Báo cáo tài chính                 → tai-chinh-ceo
     05 Quản trị nhân sự                  → con-nguoi
     06 Đào tạo & chương trình            → khoa-dao-tao
     07 Báo cáo kết quả phòng ban         → do-luong-kh
     08 Hiệu suất làm việc của Giám đốc   → bang-viec
   Không đụng máy chủ · giấy phép · mã hoá.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G; G.VIEWS = G.VIEWS || {};
(function(){
  var U = G.U, h = U.h, ic = U.ic;

  var AREA = [
    ['01','grid','--t1','Quản lý hệ thống phòng ban','phong-ban',[
      'Nắm sơ đồ 16 ban & nhân sự','Phê duyệt cơ cấu & biên chế ban','Giao mục tiêu cho từng ban',
      'Duyệt phân công Agent cho ban','Soát báo cáo dòng chảy công việc ban','Gỡ vướng liên phòng ban',
      'Duyệt nội quy · văn hoá · tiêu chuẩn','Cân tải giữa các ban','Đánh giá hiệu quả từng ban',
      'Quyết định tái cấu trúc khi cần']],
    ['02','orbit','--t3','Quản lý nguồn lực GITA','dieu-hanh',[
      'Nắm tổng nguồn lực (người·tiền·công cụ·AI)','Phân bổ nguồn lực theo ưu tiên','Soát sức chứa & tốc độ hệ',
      'Duyệt đầu tư công cụ / hạ tầng','Theo dõi chi phí tài nguyên (D1/R2)','Điều phối nguồn lực khi cao điểm',
      'Tối ưu nguồn lực nhàn rỗi','Duyệt thuê ngoài / đối tác','Giám sát token & chi phí AI',
      'Báo cáo hiệu quả sử dụng nguồn lực']],
    ['03','heart','--t5','CRM theo dõi kết quả kinh doanh','crm',[
      'Nắm phễu bán hàng toàn hệ','Theo dõi doanh thu & dự kiến chốt','Soát tỷ lệ chuyển đổi từng giai đoạn',
      'Nhận diện khách giá trị cao','Theo dõi khách rời / rủi ro','Đánh giá hiệu quả đội tư vấn',
      'Soát chất lượng chăm sóc khách','Quyết định chiến dịch thúc đẩy','Theo dõi khách tái ký / nâng gói',
      'Báo cáo kết quả kinh doanh định kỳ']],
    ['04','chart','--t4','Báo cáo tài chính','tai-chinh-ceo',[
      'Soát bảy con số CEO','Theo dõi dòng tiền ròng','Soát doanh thu – chi phí',
      'Duyệt chi vượt thẩm quyền','Theo dõi công nợ & thu hồi','Soát bảng lương & quỹ lương',
      'Kiểm tuân thủ thuế','Phân tích biên lợi nhuận','Quyết định đầu tư / cắt giảm',
      'Báo cáo tài chính cho hội đồng']],
    ['05','users','--t2','Quản trị nhân sự','con-nguoi',[
      'Nắm sơ đồ nhân sự toàn hệ','Duyệt tuyển dụng & onboarding','Soát năng lực & thăng hạng',
      'Quyết định tăng lương / thưởng','Xử lý nhân sự dưới chuẩn','Giữ chân người chủ chốt',
      'Soát văn hoá & gắn kết','Duyệt điều chuyển / bổ nhiệm','Theo dõi cảnh báo năng suất',
      'Vinh danh & ghi nhận']],
    ['06','book','--t4','Đào tạo & Chương trình','khoa-dao-tao',[
      'Duyệt chương trình đào tạo','Theo dõi tiến độ đào tạo đội','Soát chất lượng giảng dạy',
      'Duyệt lộ trình nâng cấp từng vai','Theo dõi chứng nhận cấp độ','Duyệt chương trình cho khách hàng',
      'Đo hiệu quả đào tạo (trước / sau)','Duyệt ngân sách đào tạo','Mời chuyên gia / đối tác đào tạo',
      'Báo cáo kết quả đào tạo']],
    ['07','pulse','--t3','Báo cáo kết quả phòng ban','do-luong-kh',[
      'Soát KPI từng phòng ban','So sánh kết quả giữa các ban','Nhận diện ban đỏ / cần hỗ trợ',
      'Theo dõi tiến độ mục tiêu quý','Soát dòng chảy công việc tắc','Đánh giá đề xuất cải tiến từ ban',
      'Theo dõi chỉ số hài lòng','Soát bằng chứng kết quả','Quyết định khen thưởng ban',
      'Tổng hợp báo cáo điều hành']],
    ['08','crown','--t1','Hiệu suất làm việc của Giám đốc','bang-viec',[
      'Soát KPI cá nhân Giám đốc','Theo dõi quyết định & hạn soi lại','Đo thời gian ra quyết định',
      'Soát việc tồn & ưu tiên','Tự đánh giá theo chuẩn','Ghi & soát sáng kiến chiến lược',
      'Soi quyết định lớn qua Hành lang','Theo dõi mục tiêu tăng trưởng','Cân bằng thời gian điều hành',
      'Báo cáo hiệu suất lên hội đồng']]
  ];

  function the(a){
    var mo = G.allowed ? G.allowed(a[4]) : true;
    var nut = mo ? '<button class="btn sm vh-mo" data-v="'+h(a[4])+'">'+ic('arrow','w-3 h-3')+'Mở màn</button>'
                 : '<span class="vh-khoa">'+ic('lock','w-3 h-3')+'Cần quyền</span>';
    var nv = '<ol class="gdv-nv">'+ a[5].map(function(x){ return '<li>'+h(x)+'</li>'; }).join('') +'</ol>';
    return '<div class="gdv-the'+(mo?'':' off')+'" style="--c:var('+a[2]+')">'+
      '<div class="gdv-h"><span class="vh-so">'+h(a[0])+'</span><span class="vh-ic">'+ic(a[1])+'</span>'+
        '<b class="gdv-t">'+h(a[3])+'</b>'+nut+'</div>'+
      '<div class="gdv-nvwrap"><span class="gdv-lbl">10 nghiệp vụ</span>'+nv+'</div>'+
    '</div>';
  }

  G.VIEWS['van-hanh-gd'] = function(){
    if(!(typeof G.can==='function' && G.can('dh_toan_he')))
      return U.lockCard('Bảng điều khiển Giám đốc mở cho Giám đốc trở lên. Đăng nhập đúng vai để xem.');
    var mo = AREA.filter(function(a){ return G.allowed ? G.allowed(a[4]) : true; }).length;
    var tongNV = AREA.reduce(function(s,a){ return s + a[5].length; }, 0);

    var o = U.ph({ eyebrow:'GIÁM ĐỐC · ĐIỀU HÀNH', ic:'crown', grad:1,
      t:'Bảng điều khiển Giám đốc — 8 màn × 10 nghiệp vụ',
      lead:'Tám mảng điều hành, mỗi mảng mười nghiệp vụ Giám đốc thực hiện, kèm nút mở thẳng màn sâu. Cầm tầm nhìn, điều phối nguồn lực và chịu trách nhiệm tăng trưởng — từ một chỗ.' });

    o += '<div class="grid g4 mb">'+
      U.stat({k:'Mảng điều hành', v:String(AREA.length), d:'từ phòng ban tới hiệu suất'})+
      U.stat({k:'Tổng nghiệp vụ', v:String(tongNV), d:'8 màn × 10 nghiệp vụ'})+
      U.stat({k:'Đang mở được', v:mo+'/'+AREA.length, d:'theo quyền của anh/chị', c: mo===AREA.length?'#0B7350':'#B4720F'})+
      U.stat({k:'Phòng ban', v:String(G.H16_HE?G.H16_HE.length:16), d:'bộ máy GITA'})+'</div>';

    o += '<div class="gdv-luoi">'+ AREA.map(the).join('') +'</div>';
    o += '<p class="tiny muted" style="margin-top:14px">'+ic('shield','w-3 h-3')+' Mỗi màn vẫn qua cổng quyền của hệ — mảng ngoài quyền hiển thị khoá. Đây là bàn điều khiển điều hành, không phải cửa tắt quyền.</p>';
    return o;
  };
})();
