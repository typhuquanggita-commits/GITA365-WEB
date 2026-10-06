/* ═══════════════════════════════════════════════════════════════
   GITA 365 — BẢNG ĐIỀU KHIỂN VẬN HÀNH · 10 MÀN (Super Admin / Admin)

   Gom trọn 10 mảng quản trị A–Z theo phương án đã duyệt thành MỘT hub:
     01 Quản trị quyền hạn thành viên        → phan-quyen
     02 Quản trị phòng ban & vận hành         → phong-ban
     03 Quản trị tài chính · thuế · doanh thu → tai-chinh-qt
     04 Quản trị hiệu suất & năng lực          → nang-luc-ns
     05 Sản xuất xưởng phim / Studio           → studio
     06 Quản trị hệ thống khách hàng           → crm
     07 Quản trị Marketing                     → noi-dung-tiep-thi
     08 Quản trị sản phẩm / dịch vụ            → bang-gia
     09 Quản trị bảo mật · phục hồi · bản quyền → la-chan-30
     10 Quản trị đào tạo & huấn luyện          → khoa-dao-tao

   Mỗi thẻ: số thứ tự · icon · mô tả · SỐ LIỆU NHANH (từ dữ liệu thật) ·
   nút mở thẳng màn sâu — vẫn qua G.allowed() (màn ngoài quyền thì khoá).
   Mở cho qt_trang (Super Admin / Admin). Không đụng máy chủ · giấy phép.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G; G.VIEWS = G.VIEWS || {};
(function(){
  var U = G.U, h = U.h, ic = U.ic;

  function soNhanSu(){ return (G.ACCOUNTS||[]).filter(function(a){
    var r = G.roleById ? G.roleById(a.role) : null; return r && r.lv>=1 && r.lv<=12; }).length; }
  function soKhach(){ try{ var d = (typeof G.ttKhach==='function') ? G.ttKhach() : null; return d && d.length ? d.length : null; }catch(e){ return null; } }

  /* Mỗi mảng: [số, icon, màu tầng, tên, mô tả, hàm-số-liệu, khoá-màn, cụm] */
  function KHOI(){
    var nRole = G.ROLES ? Object.keys(G.ROLES).length : 15;
    var nPerm = G.PERM ? Object.keys(G.PERM).length : 44;
    var nBan  = G.H16_HE ? G.H16_HE.length : 16;
    var nNS   = soNhanSu();
    var nKH   = soKhach();
    return [
      ['01','shield','--t1','Quyền hạn thành viên','Phân công & cấp quyền theo vai – cấp – tầng. Soát quyền thừa, giữ cổng.', nRole+' vai · '+nPerm+' quyền', 'phan-quyen','A'],
      ['02','grid','--t1','Phòng ban & vận hành','16 ban · nhân sự · Agent · báo cáo · kho · nội quy. Vận hành công việc toàn hệ.', nBan+' ban · '+nNS+' nhân sự', 'phong-ban','A'],
      ['04','pulse','--t3','Hiệu suất & Năng lực','Test đầu vào · thi tháng · thăng hạng · lương · cảnh báo · vinh danh.', nNS+' nhân sự theo dõi', 'nang-luc-ns','A'],
      ['10','book','--t4','Đào tạo & Huấn luyện','Chương trình đào tạo, huấn luyện, chứng nhận cấp độ cho đội ngũ.', '5 trụ · chứng nhận', 'khoa-dao-tao','A'],
      ['06','heart','--t5','Hệ thống khách hàng','CRM: phễu · hẹn tiếp · doanh thu — một chỗ đọc trọn một nhà.', nKH!=null ? (nKH+' khách đang mở') : 'Phễu · doanh thu', 'crm','B'],
      ['07','spark','--t2','Marketing','Nội dung & tiếp thị · chuỗi WOW · kiến trúc thị giác · xưởng nội dung.', 'Nội dung · chuỗi WOW', 'noi-dung-tiep-thi','B'],
      ['08','seed','--t4','Sản phẩm / Dịch vụ','Bảng giá năm tầng · gói dịch vụ · học phí — cấu trúc sản phẩm.', '5 tầng · gói dịch vụ', 'bang-gia','B'],
      ['03','chart','--t4','Tài chính · Thuế · Doanh thu','Hệ quản trị tài chính: thu – chi – lương – thuế – đối soát – chốt sổ.', 'Thu · chi · lương · thuế', 'tai-chinh-qt','B'],
      ['05','sparkle','--t2','Xưởng phim / Studio','GITA Studio · xưởng dựng video 9:16 · sản xuất nội dung hình ảnh.', 'Dựng video · 9:16', 'studio','C'],
      ['09','lock','--t5','Bảo mật · Phục hồi · Bản quyền','Lá chắn 30 tầng · an toàn dữ liệu · sao lưu – phục hồi · giữ bản quyền GITA365.', '30 tầng bảo vệ', 'la-chan-30','C']
    ];
  }

  var CUM = { A:{t:'NGƯỜI & TỔ CHỨC', s:'Quyền · phòng ban · năng lực · đào tạo'},
              B:{t:'KINH DOANH', s:'Khách hàng · marketing · sản phẩm · tài chính'},
              C:{t:'SẢN XUẤT & AN TOÀN', s:'Studio · bảo mật & bản quyền'} };

  function the(k){
    var mo = G.allowed ? G.allowed(k[6]) : true;
    var nut = mo ? '<button class="btn sm vh-mo" data-v="'+h(k[6])+'">'+ic('arrow','w-3 h-3')+'Mở màn</button>'
                 : '<span class="vh-khoa">'+ic('lock','w-3 h-3')+'Cần quyền</span>';
    return '<div class="vh-the'+(mo?'':' off')+'" style="--c:var('+k[2]+')">'+
      '<div class="vh-top"><span class="vh-so">'+h(k[0])+'</span><span class="vh-ic">'+ic(k[1])+'</span></div>'+
      '<b class="vh-t">'+h(k[3])+'</b>'+
      '<p class="vh-mt">'+h(k[4])+'</p>'+
      '<div class="vh-foot"><span class="vh-stat">'+ic('pulse','w-3 h-3')+h(k[5])+'</span>'+nut+'</div>'+
    '</div>';
  }

  G.VIEWS['van-hanh-10'] = function(){
    if(!(typeof G.can==='function' && G.can('qt_trang')))
      return U.lockCard('Bảng điều khiển vận hành mở cho Super Admin / Admin. Đăng nhập đúng vai để xem.');
    var ds = KHOI();
    var mo = ds.filter(function(k){ return G.allowed ? G.allowed(k[6]) : true; }).length;

    var o = U.ph({ eyebrow:'SUPER ADMIN · VẬN HÀNH A–Z', ic:'grid', grad:1,
      t:'Bảng điều khiển vận hành — 10 màn',
      lead:'Trọn mười mảng quản trị của hệ, gom về một chỗ: người & tổ chức, kinh doanh, sản xuất & an toàn. Mỗi mảng mở thẳng màn sâu, vẫn giữ đúng cổng quyền.' });

    o += '<div class="grid g4 mb">'+
      U.stat({k:'Mảng vận hành', v:String(ds.length), d:'từ A đến Z'})+
      U.stat({k:'Đang mở được', v:mo+'/'+ds.length, d:'theo quyền của anh/chị', c: mo===ds.length?'#0B7350':'#B4720F'})+
      U.stat({k:'Vai × quyền', v:(G.ROLES?Object.keys(G.ROLES).length:15)+'×'+(G.PERM?Object.keys(G.PERM).length:44), d:'ma trận phân quyền'})+
      U.stat({k:'Phòng ban', v:String(G.H16_HE?G.H16_HE.length:16), d:'bộ máy GITA'})+'</div>';

    ['A','B','C'].forEach(function(c){
      var nhom = ds.filter(function(k){ return k[7]===c; });
      if(!nhom.length) return;
      o += U.sec(CUM[c].t, CUM[c].s);
      o += '<div class="vh-luoi">'+ nhom.map(the).join('') +'</div>';
    });
    o += '<p class="tiny muted" style="margin-top:14px">'+ic('shield','w-3 h-3')+' Mỗi màn vẫn qua cổng quyền của hệ — mảng ngoài quyền hiển thị khoá, không mở được. Đây là bàn điều khiển, không phải cửa tắt quyền.</p>';
    return o;
  };
})();
