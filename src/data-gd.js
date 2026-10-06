/* ═══════════════════════════════════════════════════════════════
   GITA 365 — DỮ LIỆU 10 MÀN CHI TIẾT CỦA GIÁM ĐỐC (cho gd.js)

   G.GD_AREA: 10 mảng điều hành, mỗi mảng là một màn chi tiết:
     stats (4 ô số liệu) · bang (báo cáo nhanh) · nv (10 nghiệp vụ, mỗi
     nghiệp vụ mở thẳng màn thao tác) · man (màn gốc đầy đủ).

   Số liệu kinh doanh tổng hợp là MẪU VẬN HÀNH (có nhãn) tới khi nối máy
   chủ; phần đếm được (số ban, số vai, số nhân sự) lấy thật từ hệ.
   Mở cho Giám đốc trở lên (perm dh_toan_he).
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;
(function(){
  function soNS(){ return (G.ACCOUNTS||[]).filter(function(a){ var r=G.roleById?G.roleById(a.role):null; return r&&r.lv>=1&&r.lv<=12; }).length; }
  function soBan(){ return G.H16_HE?G.H16_HE.length:16; }

  G.GD_AREA = [
    { key:'phongban', so:'01', ic:'grid', c:'--t1', ten:'Quản lý hệ thống phòng ban', man:'phong-ban', nguon:'mix',
      stats:function(){ return [
        {k:'Phòng ban', v:String(soBan()), d:'bộ máy GITA'},
        {k:'Nhân sự', v:String(soNS()), d:'R01–R12 (thật)'},
        {k:'Ban ổn định', v:'12', d:'đèn xanh (mẫu)', c:'#0B7350'},
        {k:'Cần hỗ trợ', v:'4', d:'đèn vàng/đỏ (mẫu)', c:'#B4720F'} ]; },
      bang:function(){
        var dd=['XANH','XANH','VANG','XANH','XANH','VANG','XANH','XANH','VANG','XANH','XANH','XANH','VANG','XANH','XANH','XANH'];
        var rows=(G.H16_HE||[]).map(function(b,i){ return [b.ma, b.ten, (3+(i%4)), dd[i%dd.length], (72+((i*7)%26))+'%']; });
        return {cols:['Mã','Phòng ban','Nhân sự','Đèn','KPI'], den:3, rows:rows}; },
      nv:[['Nắm sơ đồ 16 ban & nhân sự','phong-ban'],['Phê duyệt cơ cấu & biên chế ban','phong-ban'],
          ['Giao mục tiêu cho từng ban','phong-ban'],['Duyệt phân công Agent cho ban','phong-ban'],
          ['Soát báo cáo dòng chảy công việc','do-luong-kh'],['Gỡ vướng liên phòng ban','con-nguoi'],
          ['Duyệt nội quy · văn hoá · tiêu chuẩn','phong-ban'],['Cân tải giữa các ban','phong-ban'],
          ['Đánh giá hiệu quả từng ban','do-luong-kh'],['Quyết định tái cấu trúc khi cần','dieu-hanh']] },

    { key:'nguonluc', so:'02', ic:'orbit', c:'--t3', ten:'Quản lý nguồn lực GITA', man:'dieu-hanh', nguon:'mau',
      stats:function(){ return [
        {k:'Nhân lực', v:String(soNS()), d:'đang vận hành (thật)'},
        {k:'Sức chứa hệ', v:'78%', d:'trên trần (mẫu)', c:'#0B7350'},
        {k:'Chi phí AI', v:'62%', d:'ngân sách tháng (mẫu)', c:'#B4720F'},
        {k:'Đối tác', v:'5', d:'nhà cung cấp (mẫu)'} ]; },
      bang:function(){ return {cols:['Nguồn lực','Đang dùng','Tổng','Trạng thái'], den:3, rows:[
        ['Nhân lực', '92', '118 slot', 'XANH'],
        ['Ghi D1/ngày', '64k', '100k', 'VANG'],
        ['Lưu trữ R2', '0.7 triệu', '1 triệu/tháng', 'XANH'],
        ['Token AI', '620k', '1 triệu', 'VANG'],
        ['Ngân sách công cụ', '58 triệu', '80 triệu', 'XANH'] ]}; },
      nv:[['Nắm tổng nguồn lực','dieu-hanh'],['Phân bổ nguồn lực theo ưu tiên','dieu-hanh'],
          ['Soát sức chứa & tốc độ hệ','suc-chua-toc-do'],['Duyệt đầu tư công cụ / hạ tầng','chi-phi'],
          ['Theo dõi chi phí tài nguyên (D1/R2)','theo-doi-tai-nguyen'],['Điều phối nguồn lực khi cao điểm','dieu-hanh'],
          ['Tối ưu nguồn lực nhàn rỗi','suc-chua-toc-do'],['Duyệt thuê ngoài / đối tác','ket-noi'],
          ['Giám sát token & chi phí AI','theo-doi-tai-nguyen'],['Báo cáo hiệu quả sử dụng nguồn lực','dieu-hanh']] },

    { key:'crm', so:'03', ic:'heart', c:'--t5', ten:'CRM theo dõi kết quả kinh doanh', man:'crm', nguon:'mau',
      stats:function(){ var n=null; try{ var d=(typeof G.ttKhach==='function')?G.ttKhach():null; n=d&&d.length?d.length:null; }catch(e){}
        return [ {k:'Khách đang mở', v:n!=null?String(n):'—', d:n!=null?'từ CRM thật':'nối CRM'},
        {k:'Giá trị phễu', v:'1,24 tỷ', d:'dự kiến (mẫu)', c:'var(--gita)'},
        {k:'Tỷ lệ chốt', v:'41%', d:'tháng này (mẫu)', c:'#0B7350'},
        {k:'Khách rủi ro', v:'8', d:'đèn đỏ (mẫu)', c:'#BE0E16'} ]; },
      bang:function(){ return {cols:['Giai đoạn','Số khách','Giá trị','Tỷ lệ'], den:-1, rows:[
        ['Mới', '46', '—', '100%'],['Tư vấn', '31', '560 triệu', '67%'],
        ['Báo giá', '19', '410 triệu', '41%'],['Đàm phán', '11', '260 triệu', '24%'],
        ['Chốt ký', '7', '180 triệu', '15%'] ]}; },
      nv:[['Nắm phễu bán hàng toàn hệ','crm'],['Theo dõi doanh thu & dự kiến chốt','crm'],
          ['Soát tỷ lệ chuyển đổi từng giai đoạn','do-luong-kh'],['Nhận diện khách giá trị cao','crm'],
          ['Theo dõi khách rời / rủi ro','do-luong-kh'],['Đánh giá hiệu quả đội tư vấn','nang-luc-ns'],
          ['Soát chất lượng chăm sóc khách','trai-nghiem-kh'],['Quyết định chiến dịch thúc đẩy','noi-dung-tiep-thi'],
          ['Theo dõi khách tái ký / nâng gói','crm'],['Báo cáo kết quả kinh doanh định kỳ','tai-chinh-ceo']] },

    { key:'taichinh', so:'04', ic:'chart', c:'--t4', ten:'Báo cáo tài chính', man:'tai-chinh-ceo', nguon:'mau',
      stats:function(){ return [
        {k:'Doanh thu tháng', v:'2,15 tỷ', d:'mẫu', c:'#0B7350'},
        {k:'Dòng tiền ròng', v:'+480 triệu', d:'mẫu', c:'#0B7350'},
        {k:'Chi phí', v:'1,67 tỷ', d:'mẫu'},
        {k:'Biên lợi nhuận', v:'22%', d:'mẫu', c:'#0B7350'} ]; },
      bang:function(){ return {cols:['Chỉ số (7 con số CEO)','Giá trị','So kỳ trước'], den:-1, rows:[
        ['Doanh thu', '2,15 tỷ', '▲ 8%'],['Giá vốn', '0,92 tỷ', '▲ 4%'],
        ['Chi phí vận hành', '0,75 tỷ', '▲ 2%'],['Lợi nhuận gộp', '1,23 tỷ', '▲ 11%'],
        ['Dòng tiền ròng', '+0,48 tỷ', '▲ 15%'],['Công nợ', '0,31 tỷ', '▼ 6%'],['Quỹ lương', '0,58 tỷ', '— 0%'] ]}; },
      nv:[['Soát bảy con số CEO','tai-chinh-ceo'],['Theo dõi dòng tiền ròng','tai-chinh-ceo'],
          ['Soát doanh thu – chi phí','tang-truong'],['Duyệt chi vượt thẩm quyền','ke-toan-thue'],
          ['Theo dõi công nợ & thu hồi','tai-chinh-ceo'],['Soát bảng lương & quỹ lương','ke-toan-thue'],
          ['Kiểm tuân thủ thuế','ke-toan-thue'],['Phân tích biên lợi nhuận','tang-truong'],
          ['Quyết định đầu tư / cắt giảm','chi-phi'],['Báo cáo tài chính cho hội đồng','tai-chinh-ceo']] },

    { key:'nhansu', so:'05', ic:'users', c:'--t2', ten:'Quản trị nhân sự', man:'con-nguoi', nguon:'mix',
      stats:function(){ return [
        {k:'Nhân sự', v:String(soNS()), d:'R01–R12 (thật)'},
        {k:'Đủ thăng hạng', v:'—', d:'xem màn Năng lực'},
        {k:'Cảnh báo', v:'—', d:'năng suất', c:'#B4720F'},
        {k:'Vai', v:String(G.ROLES?Object.keys(G.ROLES).length:15), d:'hệ vai (thật)'} ]; },
      bang:function(){ var R=G.ROLES||{}; var rows=Object.keys(R).map(function(k){return R[k];})
        .filter(function(r){return r.lv>=3&&r.lv<=12;})
        .map(function(r){ var acc=(G.ACCOUNTS||[]).filter(function(a){return a.role===r.id;})[0];
          return [r.n, 'Bậc '+r.lv, acc?acc.ten:'(trống)', acc?acc.nha:'—']; });
        return {cols:['Vai','Cấp','Nhân sự','Đơn vị'], den:-1, rows:rows}; },
      nv:[['Nắm sơ đồ nhân sự toàn hệ','phong-ban'],['Duyệt tuyển dụng & onboarding','con-nguoi'],
          ['Soát năng lực & thăng hạng','nang-luc-ns'],['Quyết định tăng lương / thưởng','nang-luc-ns'],
          ['Xử lý nhân sự dưới chuẩn','nang-luc-ns'],['Giữ chân người chủ chốt','con-nguoi'],
          ['Soát văn hoá & gắn kết','con-nguoi'],['Duyệt điều chuyển / bổ nhiệm','phan-quyen'],
          ['Theo dõi cảnh báo năng suất','nang-luc-ns'],['Vinh danh & ghi nhận','nang-luc-ns']] },

    { key:'daotao', so:'06', ic:'book', c:'--t4', ten:'Đào tạo & Chương trình', man:'khoa-dao-tao', nguon:'mau',
      stats:function(){ return [
        {k:'Chương trình', v:'8', d:'đang chạy (mẫu)'},
        {k:'Đang học', v:'46', d:'nhân sự + khách (mẫu)', c:'var(--gita)'},
        {k:'Hoàn thành', v:'71%', d:'trung bình (mẫu)', c:'#0B7350'},
        {k:'Chứng nhận', v:'5 cấp', d:'mỗi nghề'} ]; },
      bang:function(){ return {cols:['Chương trình','Đối tượng','Đang học','Hoàn thành'], den:-1, rows:[
        ['Onboarding GITA', 'Nhân sự mới', '12', '85%'],['Nghiệp vụ Coach', 'Coach', '9', '72%'],
        ['Nghiệp vụ Tư vấn', 'Tư vấn', '7', '78%'],['Làm việc cùng AI', 'Toàn đội', '14', '60%'],
        ['Chương trình khách', 'Phụ huynh', '4', '66%'] ]}; },
      nv:[['Duyệt chương trình đào tạo','khoa-dao-tao'],['Theo dõi tiến độ đào tạo đội','khoa-dao-tao'],
          ['Soát chất lượng giảng dạy','sat-hach'],['Duyệt lộ trình nâng cấp từng vai','nang-luc-ns'],
          ['Theo dõi chứng nhận cấp độ','nang-luc-ns'],['Duyệt chương trình cho khách hàng','khoa-dao-tao'],
          ['Đo hiệu quả đào tạo (trước/sau)','sat-hach'],['Duyệt ngân sách đào tạo','chi-phi'],
          ['Mời chuyên gia / đối tác đào tạo','ket-noi'],['Báo cáo kết quả đào tạo','khoa-dao-tao']] },

    { key:'baocaoban', so:'07', ic:'pulse', c:'--t3', ten:'Báo cáo kết quả phòng ban', man:'do-luong-kh', nguon:'mau',
      stats:function(){ return [
        {k:'Ban xanh', v:'12', d:'đạt chuẩn (mẫu)', c:'#0B7350'},
        {k:'Ban vàng', v:'3', d:'theo dõi (mẫu)', c:'#B4720F'},
        {k:'Ban đỏ', v:'1', d:'cần hỗ trợ (mẫu)', c:'#BE0E16'},
        {k:'Mục tiêu quý', v:'76%', d:'tiến độ (mẫu)', c:'#0B7350'} ]; },
      bang:function(){ var top=(G.H16_HE||[]).slice(0,6);
        var dd=['XANH','XANH','VANG','XANH','DO','XANH'];
        return {cols:['Phòng ban','KPI','Đèn','Xu hướng'], den:2, rows:top.map(function(b,i){
          return [b.ten, (68+((i*9)%30))+'%', dd[i%dd.length], i%2?'▲':'▼']; })}; },
      nv:[['Soát KPI từng phòng ban','do-luong-kh'],['So sánh kết quả giữa các ban','truy-van-da-chieu'],
          ['Nhận diện ban đỏ / cần hỗ trợ','do-luong-kh'],['Theo dõi tiến độ mục tiêu quý','kpi-toi'],
          ['Soát dòng chảy công việc tắc','bang-viec'],['Đánh giá đề xuất cải tiến từ ban','phong-ban'],
          ['Theo dõi chỉ số hài lòng','trai-nghiem-kh'],['Soát bằng chứng kết quả','ra-soat-kh'],
          ['Quyết định khen thưởng ban','nang-luc-ns'],['Tổng hợp báo cáo điều hành','dieu-hanh']] },

    { key:'hieusuat', so:'08', ic:'crown', c:'--t1', ten:'Hiệu suất làm việc của Giám đốc', man:'bang-viec', nguon:'mau',
      stats:function(){ return [
        {k:'KPI cá nhân', v:'88', d:'trên 100 (mẫu)', c:'#0B7350'},
        {k:'Quyết định/tuần', v:'14', d:'có ghi lý do (mẫu)'},
        {k:'Việc tồn', v:'3', d:'đang xử lý (mẫu)', c:'#B4720F'},
        {k:'Mục tiêu năm', v:'72%', d:'tiến độ (mẫu)', c:'#0B7350'} ]; },
      bang:function(){ return {cols:['Trọng tâm tuần','Trạng thái','Hạn soi lại'], den:1, rows:[
        ['Chốt chiến lược quý sau', 'XANH', 'T2 tuần tới'],['Duyệt ngân sách marketing', 'VANG', 'Hôm nay'],
        ['Giữ chân 2 nhân sự chủ chốt', 'XANH', 'Đã xong'],['Soát rủi ro dòng tiền', 'VANG', 'Thứ 6'],
        ['Họp hội đồng tháng', 'XANH', 'Cuối tháng'] ]}; },
      nv:[['Soát KPI cá nhân Giám đốc','kpi-toi'],['Theo dõi quyết định & hạn soi lại','dieu-hanh'],
          ['Đo thời gian ra quyết định','bang-viec'],['Soát việc tồn & ưu tiên','bang-viec'],
          ['Tự đánh giá theo chuẩn','nang-luc-ns'],['Ghi & soát sáng kiến chiến lược','bang-viec'],
          ['Soi quyết định lớn qua Hành lang','hanh-lang'],['Theo dõi mục tiêu tăng trưởng','tang-truong'],
          ['Cân bằng thời gian điều hành','do-thoi-gian'],['Báo cáo hiệu suất lên hội đồng','tai-chinh-ceo']] },

    { key:'chienluoc', so:'09', ic:'spark', c:'--t2', ten:'Chiến lược & Tăng trưởng', man:'tang-truong', nguon:'mau',
      stats:function(){ return [
        {k:'Mục tiêu quý', v:'6', d:'đang theo (mẫu)'},
        {k:'Đạt chuẩn', v:'4/6', d:'đúng tiến độ (mẫu)', c:'#0B7350'},
        {k:'Tăng trưởng', v:'+18%', d:'so cùng kỳ (mẫu)', c:'#0B7350'},
        {k:'Sáng kiến', v:'12', d:'đang thử (mẫu)'} ]; },
      bang:function(){ return {cols:['Mục tiêu chiến lược','Tiến độ','Trạng thái','Phụ trách'], den:2, rows:[
        ['Tăng tỷ lệ chốt lên 95%', '82%', 'VANG', 'Tư vấn'],['Mở rộng 3 vệ tinh miền', '60%', 'VANG', 'Đại sứ'],
        ['Chuẩn hoá quy trình toàn hệ', '90%', 'XANH', 'QLCM'],['Giảm 15% chi phí vận hành', '95%', 'XANH', 'Tài chính'],
        ['Nâng đèn gia đình TB ≥80', '74%', 'VANG', 'Coach'] ]}; },
      nv:[['Đặt mục tiêu chiến lược quý/năm','ban-do-chien-luoc'],['Chấm & chọn chiến lược (ICE)','ban-do-chien-luoc'],
          ['Theo dõi tiến độ mục tiêu','kpi-toi'],['Phân tích thị trường & đối thủ','truy-van-da-chieu'],
          ['Quyết định mở rộng / thu hẹp','dieu-hanh'],['Đo tăng trưởng so cùng kỳ','tang-truong'],
          ['Chạy & đo thí nghiệm cải tiến','cai-tien'],['Học từ hệ thống lớn','hoc-tu-lon'],
          ['Cân đối tăng trưởng & chuẩn nghề','chuan-1000'],['Trình chiến lược lên hội đồng','tai-chinh-ceo']] },

    { key:'phaply', so:'10', ic:'shield', c:'--t5', ten:'Pháp lý & Rủi ro', man:'phap-ly-rui-ro', nguon:'mau',
      stats:function(){ return [
        {k:'Rủi ro cao', v:'1', d:'cần xử lý (mẫu)', c:'#BE0E16'},
        {k:'Rủi ro vừa', v:'4', d:'theo dõi (mẫu)', c:'#B4720F'},
        {k:'Tuân thủ', v:'96%', d:'điểm tuân thủ (mẫu)', c:'#0B7350'},
        {k:'Bản quyền', v:'Giữ', d:'GITA365', c:'#0B7350'} ]; },
      bang:function(){ return {cols:['Rủi ro','Mức','Trạng thái','Hướng xử lý'], den:1, rows:[
        ['Hợp đồng thiếu chữ ký', 'Cao', 'DO', 'Bổ sung trong tuần'],['Dữ liệu khách chưa ẩn danh đủ', 'Vừa', 'VANG', 'Soát lá chắn'],
        ['Yêu cầu xoá dữ liệu quá hạn', 'Vừa', 'VANG', 'Xử lý đúng luật'],['Tranh chấp hoa hồng CTV', 'Vừa', 'VANG', 'Đối chiếu sổ'],
        ['Tuân thủ thuế kỳ tới', 'Thấp', 'XANH', 'Theo lịch'] ]}; },
      nv:[['Soát hợp đồng & hồ sơ pháp lý','phap-ly-rui-ro'],['Rà soát pháp lý toàn hệ','ra-soat-phap-ly'],
          ['Theo dõi rủi ro & phân mức','phap-ly-rui-ro'],['Duyệt hướng xử lý rủi ro cao','phap-ly-rui-ro'],
          ['Kiểm tuân thủ hiến pháp','bien-nien'],['Soát yêu cầu xoá dữ liệu','an-toan-du-lieu'],
          ['Giữ bản quyền GITA365','la-chan-30'],['Kiểm tuân thủ thuế','ke-toan-thue'],
          ['Xử lý tranh chấp','phap-ly-rui-ro'],['Báo cáo rủi ro lên hội đồng','dieu-hanh']] }
  ];
})();
