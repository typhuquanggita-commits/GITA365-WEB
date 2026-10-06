/* ═══════════════════════════════════════════════════════════════
   GITA 365 — DỮ LIỆU 10 MÀN CHI TIẾT VẬN HÀNH (Super Admin / Admin)

   G.VA_AREA: 10 mảng quản trị A–Z, mỗi mảng là một MÀN CHI TIẾT:
     stats (4 ô số liệu) · bang (BÁO CÁO CHUYÊN SÂU — nhiều cột, có đèn) ·
     nv (10 nghiệp vụ, mỗi nghiệp vụ mở thẳng màn thao tác) · man (màn gốc).

   BẢNG ĐÃ NÂNG CẤP: mỗi bảng dày thêm 5 cột để đọc sâu hơn. Phần ĐẾM ĐƯỢC
   lấy THẬT từ hệ (15 vai · 44 quyền · 16 ban · nhân sự · 100 Agent · điểm
   vào từng ban); số liệu kinh doanh/sản xuất tổng hợp là MẪU VẬN HÀNH (ghi
   rõ nhãn) tới khi nối máy chủ. Mở cho qt_trang (Super Admin/Admin).
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;
(function(){
  function soNS(){ return (G.ACCOUNTS||[]).filter(function(a){ var r=G.roleById?G.roleById(a.role):null; return r&&r.lv>=1&&r.lv<=12; }).length; }
  function soBan(){ return G.H16_HE?G.H16_HE.length:16; }
  function soVai(){ return G.ROLES?G.ROLES.length:15; }
  function soQuyen(){ return G.PERM?Object.keys(G.PERM).length:44; }
  function soAgent(){ return G.DP_TRO_LY?G.DP_TRO_LY.length:100; }
  function quyenCua(r){ try{ return Object.keys(G.PERM).filter(function(k){ return r.lv<=G.PERM[k]; }).length; }catch(e){ return 0; } }
  function accCua(id){ return (G.ACCOUNTS||[]).filter(function(a){ return a.role===id; })[0]; }
  function nguongPerm(p,def){ try{ return (G.PERM&&G.PERM[p]!=null)?G.PERM[p]:def; }catch(e){ return def; } }
  function chamDiem(acc){ try{ var d=(G.S&&G.S.nlDiem)?G.S.nlDiem[acc.u]:null; return (d&&d.dv!=null)?d:null; }catch(e){ return null; } }
  function diemTong(d){ return Math.round(0.25*d.dv + 0.40*d.tt + 0.35*d.hs); }
  function demRef(b,pre){ try{ return (b.troVao||[]).filter(function(x){ return String(x).indexOf(pre)===0; }).length; }catch(e){ return 0; } }

  var crmTh = nguongPerm('crm_view',3), finTh = nguongPerm('fin_view',4), finPay = nguongPerm('fin_payout',3);

  G.VA_AREA = [
    /* ══ CỤM A · NGƯỜI & TỔ CHỨC ══ */
    { key:'quyen', so:'01', ic:'shield', c:'--t1', cum:'A', ten:'Quản trị quyền hạn thành viên',
      man:'phan-quyen', nguon:'that',
      stats:function(){ return [
        {k:'Vai', v:String(soVai()), d:'R01–R15 (thật)'},
        {k:'Quyền', v:String(soQuyen()), d:'trong ma trận (thật)'},
        {k:'Có tài khoản', v:String((G.ACCOUNTS||[]).length), d:'đang hoạt động (thật)', c:'#0B7350'},
        {k:'Tầng quản trị', v:'3', d:'trang · toàn hệ · nghề'} ]; },
      bang:function(){ var rows=(G.ROLES||[]).map(function(r){
          var acc=accCua(r.id);
          var tang = r.lv<=2?'Trang':(r.lv<=4?'Toàn hệ':'Nghề');
          var crm = r.lv<=crmTh?'Có':'—';
          var fin = r.lv<=finPay?'Duyệt chi':(r.lv<=finTh?'Chỉ xem':'—');
          return [r.id+' · '+(r.short||r.n), 'Bậc '+r.lv, tang, acc?acc.ten:'(trống)', acc?acc.nha:'—',
                  String(quyenCua(r)), crm, fin, acc?'Hoạt động':'Trống', acc?'XANH':'VANG'];
        });
        return {cols:['Vai','Cấp','Tầng','Nhân sự','Đơn vị','Số quyền','CRM','Tài chính','Trạng thái','Đèn'], den:9, rows:rows}; },
      nv:[['Soát toàn bộ vai & quyền (ma trận)','phan-quyen'],['Cấp quyền theo vai – cấp – tầng','phan-quyen'],
          ['Thu hồi quyền thừa / quá hạn','phan-quyen'],['Mở / khoá / xoá tài khoản','phan-quyen'],
          ['Soát quyền CRM từng bộ phận','phan-quyen'],['Kiểm tra quyền theo vai (giả lập)','kiem-theo-vai'],
          ['Duyệt bổ nhiệm / điều chuyển','phan-quyen'],['Giữ cổng tài chính (chỉ 3 vai đầu)','phan-quyen'],
          ['Soát nhật ký thay đổi quyền','phan-quyen'],['Báo cáo tình trạng phân quyền','phan-quyen']] },

    { key:'vanhanh', so:'02', ic:'grid', c:'--t1', cum:'A', ten:'Quản trị phòng ban & vận hành',
      man:'phong-ban', nguon:'mix',
      stats:function(){ return [
        {k:'Phòng ban', v:String(soBan()), d:'bộ máy GITA (thật)'},
        {k:'Nhân sự', v:String(soNS()), d:'R01–R12 (thật)'},
        {k:'Agent AI', v:String(soAgent()), d:'trợ lý nghiệp vụ (thật)'},
        {k:'Ban cần hỗ trợ', v:'4', d:'đèn vàng/đỏ (mẫu)', c:'#B4720F'} ]; },
      bang:function(){ var dd=['XANH','XANH','VANG','XANH','XANH','VANG','XANH','XANH','VANG','XANH','XANH','XANH','VANG','XANH','XANH','XANH'];
        var rows=(G.H16_HE||[]).map(function(b,i){
          var diem=(b.troVao||[]).length, man=demRef(b,'v:'), cong=demRef(b,'f:')+demRef(b,'t:'), tai=demRef(b,'d:')+demRef(b,'g:');
          var den=dd[i%dd.length];
          return [b.ma, b.ten, String(3+(i%4)), String(diem), String(man), String(cong), String(tai),
                  (72+((i*7)%26))+'%', den, den==='XANH'?'Ổn định':(den==='VANG'?'Theo dõi':'Cần hỗ trợ')];
        });
        return {cols:['Mã','Phòng ban','Nhân sự','Điểm vào','Màn','Công cụ','Tài liệu','KPI','Đèn','Trạng thái'], den:8, rows:rows}; },
      nv:[['Nắm sơ đồ 16 ban & nhân sự','phong-ban'],['Duyệt cơ cấu & biên chế từng ban','phong-ban'],
          ['Phân công Agent cho ban','phong-ban'],['Giao & soát nhiệm vụ toàn hệ','man-cong-viec'],
          ['Soát dòng chảy công việc','bang-viec'],['Duyệt nội quy · văn hoá · tiêu chuẩn','luat-lam-viec'],
          ['Chuẩn hoá quy trình toàn hệ','quy-trinh-toan-he'],['Cân tải giữa các ban','phong-ban'],
          ['Soát kho tài liệu từng ban','thu-vien'],['Quyết định tái cấu trúc khi cần','phong-ban']] },

    { key:'nangluc', so:'04', ic:'pulse', c:'--t3', cum:'A', ten:'Quản trị hiệu suất & năng lực',
      man:'nang-luc-ns', nguon:'mix',
      stats:function(){ var ds=(G.S&&G.S.nlDiem)?Object.keys(G.S.nlDiem).length:0;
        return [
        {k:'Nhân sự theo dõi', v:String(soNS()-2), d:'bậc 3–12 (thật)'},
        {k:'Đã chấm', v:String(ds), d:ds?'có điểm (thật)':'chưa chấm ai', c:ds?'#0B7350':'#B4720F'},
        {k:'Chu kỳ', v:'Tháng', d:'thi nâng cấp'},
        {k:'Hạng', v:'5', d:'bậc mỗi nghề'} ]; },
      bang:function(){ var rows=(G.ROLES||[]).filter(function(r){return r.lv>=3&&r.lv<=12;})
          .map(function(r){ var acc=accCua(r.id); var d=acc?chamDiem(acc):null; var t=d?diemTong(d):null;
            var dx = t==null?'—':(t>=80?'Thăng hạng':(t>=60?'Giữ hạng':'Kèm thêm'));
            var den = t==null?'VANG':(t>=80?'XANH':(t>=60?'VANG':'DO'));
            return [r.short||r.n, acc?acc.ten:'(trống)', acc?acc.nha:'—', d?('Bậc '+(d.cap||1)):'—',
                    d?String(d.dv):'—', d?String(d.tt):'—', d?String(d.hs):'—', t!=null?String(t):'Chưa chấm', den, dx]; });
        return {cols:['Vai','Nhân sự','Đơn vị','Cấp','Chuyên môn','Thái độ','Kết quả','Điểm','Đèn','Đề xuất'], den:8, rows:rows}; },
      nv:[['Giao bài test đầu vào','sat-hach'],['Chấm & lưu điểm năng lực','nang-luc-ns'],
          ['Mở thi nâng cấp hàng tháng','sat-hach'],['Xét thăng hạng theo điểm','nang-luc-ns'],
          ['Đề xuất tăng lương / thưởng','nang-luc-ns'],['Theo dõi cảnh báo năng suất','nang-luc-ns'],
          ['Xử lý nhân sự dưới chuẩn','nang-luc-ns'],['Vinh danh mọi cấp độ','nang-luc-ns'],
          ['Soát lộ trình nâng cấp từng vai','khoa-dao-tao'],['Báo cáo năng lực toàn hệ','nang-luc-ns']] },

    { key:'daotaoqt', so:'10', ic:'book', c:'--t4', cum:'A', ten:'Quản trị đào tạo & huấn luyện',
      man:'khoa-dao-tao', nguon:'mau',
      stats:function(){ return [
        {k:'Chương trình', v:'8', d:'đang chạy (mẫu)'},
        {k:'Đang học', v:'46', d:'nhân sự + khách (mẫu)', c:'var(--gita)'},
        {k:'Hoàn thành', v:'71%', d:'trung bình (mẫu)', c:'#0B7350'},
        {k:'Chứng nhận', v:'5 cấp', d:'mỗi nghề'} ]; },
      bang:function(){ return {cols:['Chương trình','Đối tượng','Đang học','Hoàn thành','Thời lượng','Giảng viên','Chứng nhận','Đèn','Cập nhật'], den:7, rows:[
        ['Onboarding GITA','Nhân sự mới','12','85%','2 tuần','QLCM','Cấp 1','XANH','Tuần này'],
        ['Nghiệp vụ Coach','Coach','9','72%','6 tuần','TN Coach','Cấp 1–3','XANH','Tuần này'],
        ['Nghiệp vụ Tư vấn','Tư vấn','7','78%','4 tuần','Tư vấn trưởng','Cấp 1–2','XANH','Hôm qua'],
        ['Làm việc cùng AI','Toàn đội','14','60%','3 tuần','Phân tích','Chứng chỉ','VANG','Tuần này'],
        ['Chương trình khách','Phụ huynh','4','66%','5 buổi','Coach','—','VANG','Tháng này'] ]}; },
      nv:[['Duyệt chương trình đào tạo','khoa-dao-tao'],['Theo dõi tiến độ đào tạo đội','khoa-dao-tao'],
          ['Soát chất lượng giảng dạy','sat-hach'],['Duyệt lộ trình nâng cấp từng vai','nang-luc-ns'],
          ['Theo dõi chứng nhận cấp độ','nang-luc-ns'],['Duyệt chương trình cho khách hàng','khoa-dao-tao'],
          ['Đo hiệu quả đào tạo (trước/sau)','sat-hach'],['Duyệt ngân sách đào tạo','chi-phi'],
          ['Mời chuyên gia / đối tác đào tạo','ket-noi'],['Báo cáo kết quả đào tạo','khoa-dao-tao']] },

    /* ══ CỤM B · KINH DOANH ══ */
    { key:'crmqt', so:'06', ic:'heart', c:'--t5', cum:'B', ten:'Quản trị hệ thống khách hàng',
      man:'crm', nguon:'mau',
      stats:function(){ var n=null; try{ var d=(typeof G.ttKhach==='function')?G.ttKhach():null; n=d&&d.length?d.length:null; }catch(e){}
        return [ {k:'Khách đang mở', v:n!=null?String(n):'—', d:n!=null?'từ CRM thật':'nối CRM'},
        {k:'Giá trị phễu', v:'1,24 tỷ', d:'dự kiến (mẫu)', c:'var(--gita)'},
        {k:'Tỷ lệ chốt', v:'41%', d:'tháng này (mẫu)', c:'#0B7350'},
        {k:'Khách rủi ro', v:'8', d:'đèn đỏ (mẫu)', c:'#BE0E16'} ]; },
      bang:function(){ return {cols:['Giai đoạn','Số khách','Giá trị','Tỷ lệ','Giá trị TB','Thời gian ở','Phụ trách','Đèn','Xu hướng'], den:7, rows:[
        ['Mới','46','—','100%','—','1,2 ngày','Tư vấn','XANH','▲'],
        ['Tư vấn','31','560 triệu','67%','18 triệu','3,5 ngày','Tư vấn','XANH','▲'],
        ['Báo giá','19','410 triệu','41%','21,6 triệu','4,1 ngày','Tư vấn','VANG','▬'],
        ['Đàm phán','11','260 triệu','24%','23,6 triệu','5,8 ngày','Giám đốc','VANG','▼'],
        ['Chốt ký','7','180 triệu','15%','25,7 triệu','2,0 ngày','Giám đốc','XANH','▲'] ]}; },
      nv:[['Nắm phễu bán hàng toàn hệ','crm'],['Soát quyền truy cập CRM','phan-quyen'],
          ['Theo dõi doanh thu & dự kiến chốt','crm'],['Nhận diện khách giá trị cao','crm'],
          ['Theo dõi khách rời / rủi ro','do-luong-kh'],['Soát chất lượng chăm sóc khách','trai-nghiem-kh'],
          ['Đánh giá hiệu quả đội tư vấn','nang-luc-ns'],['Quyết định chiến dịch thúc đẩy','noi-dung-tiep-thi'],
          ['Giữ bảo mật & hiến pháp khách','an-toan-du-lieu'],['Báo cáo kết quả kinh doanh','do-luong-kh']] },

    { key:'marketing', so:'07', ic:'spark', c:'--t2', cum:'B', ten:'Quản trị Marketing',
      man:'noi-dung-tiep-thi', nguon:'mau',
      stats:function(){ return [
        {k:'Kênh', v:'5', d:'đang chạy (mẫu)'},
        {k:'Chiến dịch', v:'6', d:'trong tháng (mẫu)', c:'var(--gita)'},
        {k:'Khách mới / tháng', v:'214', d:'từ marketing (mẫu)', c:'#0B7350'},
        {k:'Chi phí / khách', v:'168k', d:'CAC (mẫu)'} ]; },
      bang:function(){ return {cols:['Kênh','Tiếp cận','Khách mới','Chuyển đổi','Chi phí/khách','Doanh thu','ROI','Đèn','Xu hướng'], den:7, rows:[
        ['Giới thiệu (CTV)','—','86','12,4%','92k','1,05 tỷ','×11','XANH','▲'],
        ['Nội dung / SEO','18.400','52','3,1%','140k','620 triệu','×6','XANH','▲'],
        ['Mạng xã hội','42.000','41','1,2%','196k','440 triệu','×4','VANG','▬'],
        ['Quảng cáo','30.500','28','0,9%','268k','300 triệu','×2,8','VANG','▼'],
        ['Sự kiện','1.200','7','5,8%','640k','95 triệu','×1,3','DO','▼'] ]}; },
      nv:[['Duyệt kế hoạch nội dung','noi-dung-tiep-thi'],['Soát chuỗi điểm chạm WOW','noi-dung-tiep-thi'],
          ['Duyệt kiến trúc thị giác','noi-dung-tiep-thi'],['Theo dõi hiệu quả từng kênh','do-luong-kh'],
          ['Duyệt ngân sách marketing','chi-phi'],['Soát chi phí / khách (CAC)','tai-chinh-qt'],
          ['Phối hợp marketing – tư vấn','crm'],['Chạy & đo thí nghiệm nội dung','cai-tien'],
          ['Quản chuẩn thương hiệu','luat-lam-viec'],['Báo cáo kết quả marketing','do-luong-kh']] },

    { key:'sanpham', so:'08', ic:'seed', c:'--t4', cum:'B', ten:'Quản trị sản phẩm / dịch vụ',
      man:'bang-gia', nguon:'mau',
      stats:function(){ return [
        {k:'Tầng sản phẩm', v:'5', d:'T1 → T5'},
        {k:'Gói dịch vụ', v:'12', d:'đang bán (mẫu)'},
        {k:'Gói bán chạy', v:'T3', d:'tháng này (mẫu)', c:'#0B7350'},
        {k:'Giá TB / gói', v:'14,5 tr', d:'mẫu' } ]; },
      bang:function(){ return {cols:['Tầng','Sản phẩm','Giá (mẫu)','Đã bán','Doanh thu','Biên LN','Hài lòng','Đèn','Xu hướng'], den:7, rows:[
        ['T1','Khởi đầu – nền tảng','4,9 triệu','118','578 triệu','54%','4,6/5','XANH','▲'],
        ['T2','Đồng hành cơ bản','9,8 triệu','86','843 triệu','51%','4,7/5','XANH','▲'],
        ['T3','Chuyển hoá chuyên sâu','18 triệu','74','1,33 tỷ','49%','4,8/5','XANH','▲'],
        ['T4','Dẫn dắt nâng cao','32 triệu','22','704 triệu','46%','4,7/5','VANG','▬'],
        ['T5','Khai phóng toàn diện','56 triệu','9','504 triệu','44%','4,9/5','VANG','▼'] ]}; },
      nv:[['Soát cấu trúc 5 tầng sản phẩm','bang-gia'],['Duyệt bảng giá & học phí','bang-gia'],
          ['Thiết kế / sửa gói dịch vụ','bang-gia'],['Theo dõi gói bán chạy','do-luong-kh'],
          ['Soát biên lợi nhuận từng gói','tai-chinh-qt'],['Duyệt khuyến mãi / ưu đãi','bang-gia'],
          ['Chuẩn hoá nội dung từng tầng','chuan-1000'],['Phối sản phẩm với lộ trình học','khoa-dao-tao'],
          ['Quản vòng đời sản phẩm','sap-xep'],['Báo cáo hiệu quả sản phẩm','do-luong-kh']] },

    { key:'taichinhqt', so:'03', ic:'chart', c:'--t4', cum:'B', ten:'Quản trị tài chính · thuế · doanh thu',
      man:'tai-chinh-qt', nguon:'mau',
      stats:function(){ return [
        {k:'Doanh thu tháng', v:'2,15 tỷ', d:'mẫu', c:'#0B7350'},
        {k:'Dòng tiền ròng', v:'+480 triệu', d:'mẫu', c:'#0B7350'},
        {k:'Công nợ', v:'310 triệu', d:'mẫu', c:'#B4720F'},
        {k:'Tuân thủ thuế', v:'96%', d:'mẫu', c:'#0B7350'} ]; },
      bang:function(){ return {cols:['Khoản mục','Giá trị (mẫu)','Kỳ trước','Kế hoạch','Đạt KH','Ghi chú','Phụ trách','Đèn','Xu hướng'], den:7, rows:[
        ['Doanh thu','2,15 tỷ','1,99 tỷ','2,10 tỷ','102%','Vượt nhẹ','Giám đốc','XANH','▲'],
        ['Chi phí vận hành','0,75 tỷ','0,74 tỷ','0,72 tỷ','104%','Theo dõi','Tài chính','VANG','▲'],
        ['Quỹ lương','0,58 tỷ','0,58 tỷ','0,58 tỷ','100%','Đúng kế hoạch','Tài chính','XANH','▬'],
        ['Công nợ phải thu','0,31 tỷ','0,33 tỷ','0,25 tỷ','124%','Cần thu hồi','Kế toán','VANG','▼'],
        ['Thuế phải nộp kỳ tới','0,12 tỷ','0,11 tỷ','0,12 tỷ','100%','Đúng hạn','Kế toán','XANH','▲'] ]}; },
      nv:[['Soát thu – chi toàn hệ','tai-chinh-qt'],['Duyệt chi vượt thẩm quyền','chi-phi'],
          ['Soát bảng lương & quỹ lương','ke-toan-thue'],['Kiểm tuân thủ thuế','ke-toan-thue'],
          ['Theo dõi công nợ & thu hồi','tai-chinh-qt'],['Đối soát doanh thu – CRM','crm'],
          ['Chốt sổ định kỳ','ke-toan-thue'],['Phân tích biên lợi nhuận','tang-truong'],
          ['Quyết định đầu tư / cắt giảm','chi-phi'],['Báo cáo tài chính cho hội đồng','tai-chinh-qt']] },

    /* ══ CỤM C · SẢN XUẤT & AN TOÀN ══ */
    { key:'studio', so:'05', ic:'sparkle', c:'--t2', cum:'C', ten:'Quản trị xưởng phim / Studio',
      man:'studio', nguon:'mau',
      stats:function(){ return [
        {k:'Dự án video', v:'18', d:'trong tháng (mẫu)'},
        {k:'Đang dựng', v:'5', d:'khâu hậu kỳ (mẫu)', c:'#B4720F'},
        {k:'Đã phát hành', v:'11', d:'9:16 (mẫu)', c:'#0B7350'},
        {k:'Thời gian / video', v:'3,2 ngày', d:'trung bình (mẫu)'} ]; },
      bang:function(){ return {cols:['Khâu','Số dự án','Nhân sự','Thời gian','Tiến độ','Phụ trách','Hạn','Đèn','Ghi chú'], den:7, rows:[
        ['Kịch bản','4','2','0,5 ngày','90%','Biên kịch','T2','XANH','Đúng tiến độ'],
        ['Quay / thu','3','3','1,2 ngày','55%','Quay phim','T4','VANG','Chờ lịch'],
        ['Dựng','5','2','1,5 ngày','40%','Dựng phim','T5','VANG','Hậu kỳ'],
        ['Duyệt','2','1','0,3 ngày','70%','Giám đốc','T3','XANH','Chờ duyệt'],
        ['Phát hành','4','1','0,2 ngày','100%','Marketing','T6','XANH','Đã lên lịch'] ]}; },
      nv:[['Duyệt kịch bản video','studio'],['Theo dõi tiến độ sản xuất','studio'],
          ['Soát chuẩn thị giác 9:16','studio'],['Duyệt nội dung trước phát hành','studio'],
          ['Quản kho tư liệu hình ảnh','thu-vien'],['Phân công đội sản xuất','phong-ban'],
          ['Đo hiệu quả video (view/chốt)','do-luong-kh'],['Phối studio với marketing','noi-dung-tiep-thi'],
          ['Duyệt ngân sách sản xuất','chi-phi'],['Báo cáo kết quả xưởng phim','do-luong-kh']] },

    { key:'baomat', so:'09', ic:'lock', c:'--t5', cum:'C', ten:'Quản trị bảo mật · phục hồi · bản quyền',
      man:'la-chan-30', nguon:'mau',
      stats:function(){ return [
        {k:'Lá chắn', v:'30 tầng', d:'bảo vệ hệ'},
        {k:'Đang bật', v:'30/30', d:'mẫu vận hành', c:'#0B7350'},
        {k:'Sao lưu gần nhất', v:'Hôm nay', d:'mẫu', c:'#0B7350'},
        {k:'Bản quyền', v:'Giữ', d:'GITA365', c:'#0B7350'} ]; },
      bang:function(){ return {cols:['Nhóm lá chắn','Số tầng','Đang bật','Kiểm gần nhất','Mức ưu tiên','Sự cố','Phụ trách','Đèn','Ghi chú'], den:7, rows:[
        ['Chặn cổng & danh tính','6','6/6','Hôm nay','Cao','0','Super Admin','XANH','Đăng nhập · phiên · vai'],
        ['Mã hoá nội dung (.enc)','5','5/5','Hôm nay','Rất cao','0','Super Admin','XANH','Gói nghề · giấy phép'],
        ['Ẩn danh dữ liệu khách','5','5/5','Hôm qua','Rất cao','0','Admin','XANH','Theo hiến pháp'],
        ['Sao lưu & phục hồi','6','6/6','Hôm nay','Cao','0','Admin','XANH','Định kỳ'],
        ['Giám sát & cảnh báo','4','4/4','Hôm nay','Vừa','1','Admin','VANG','Theo dõi bất thường'],
        ['Giữ bản quyền GITA365','4','4/4','Tuần này','Rất cao','0','Super Admin','XANH','Chống sao chép'] ]}; },
      nv:[['Soát 30 tầng lá chắn','la-chan-30'],['Kiểm an toàn dữ liệu khách','an-toan-du-lieu'],
          ['Soát ẩn danh theo hiến pháp','bien-nien'],['Giám sát đăng nhập & phiên','phan-quyen'],
          ['Chạy sao lưu định kỳ','la-chan-30'],['Diễn tập phục hồi dữ liệu','la-chan-30'],
          ['Giữ bản quyền gói .enc & giấy phép','la-chan-30'],['Xử lý yêu cầu xoá dữ liệu','an-toan-du-lieu'],
          ['Soát nhật ký bảo mật','phan-quyen'],['Báo cáo an toàn & bản quyền','la-chan-30']] }
  ];
})();
