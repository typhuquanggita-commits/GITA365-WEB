/* ═══════════════════════════════════════════════════════════════
   GITA 365 · v8.3 — KHO TỔNG

   Hệ thống có hơn năm mươi kho tư liệu nằm rải trong sáu thư mục. Ai làm
   lâu thì thuộc đường; ai mới vào thì không biết mình đang có những gì.
   Và người chịu trách nhiệm cuối cùng — Super Admin — không có chỗ nào
   nhìn thấy TOÀN BỘ trong một màn.

   Màn này là chỗ đó. Chín nhóm, mỗi nhóm liệt kê từng kho kèm SỐ ĐẾM THẬT
   lấy trực tiếp từ dữ liệu đang nạp, không phải con số viết tay. Kho nào
   trống hoặc chưa được cấp phép thì nói thẳng, không tô hồng.

   Quyền: Super Admin và Admin hệ thống thấy toàn bộ. Vị trí khác thấy
   những kho mình đã được cấp, và thấy TÊN những kho chưa được cấp cùng
   một nút xin quyền — biết hệ thống có gì là một phần của việc làm nghề,
   còn mở ra hay không là quyết định của Ban quản trị.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;

(function(){
var U = G.U, h = U.h, ic = U.ic;
G.VIEWS = G.VIEWS || {};

/* ─── Chín nhóm kho. Mỗi dòng: tên kho · biến dữ liệu · màn hình mở ra ─── */
G.KHO_TONG = [
 {ma:'K1', ten:'1.000 điểm chạm WOW', ic:'star', c:'#BE0E16',
  mo:'Mỗi tư liệu là một lần gia đình được chạm đúng lúc. Đây là phần khách hàng nhớ lâu nhất.',
  kho:[
   {t:'1.000 tài liệu quà tặng', k:'QUA1000', v:'kho-qua', d:'Cẩm nang, bảng theo dõi, kịch bản, thẻ nhắc — gắn theo từng phác đồ và tầng'},
   {t:'Chuỗi WOW',               k:'WOW',     v:'wow',     d:'Các khoảnh khắc thiết kế sẵn để tạo bất ngờ đúng nhịp'},
   {t:'Bản đồ điểm chạm cảm xúc',k:'DIEMCHAM',v:'diem-cham',d:'Chín khoảnh khắc quyết định một nhà ở lại hay đi'},
   {t:'Chuẩn 1.000 điểm',        k:'CHUAN1000',v:'chuan-1000',d:'Thang chấm chất lượng trải nghiệm trên toàn hành trình'}
  ]},

 {ma:'K2', ten:'Kho giải pháp cho Tư vấn, Coach và các vị trí', ic:'tools', c:'#5140B4',
  mo:'Thứ đội ngũ mở ra khi ngồi trước một gia đình đang mắc. Tra được theo vấn đề, theo tầng, theo vai.',
  kho:[
   {t:'220 phác đồ × 5 tầng',    k:'PHACDO',   v:'phac-do',    d:'Đường đi đã có nhiều nhà bước qua, chia theo tầng'},
   {t:'1.000 kịch bản chuyên môn',k:'KICHBAN', v:'kich-ban',   d:'Lời để nói ra miệng, đã thử qua nhiều buổi'},
   {t:'250 tình huống thực chiến',k:'TINHHUONG',v:'tinh-huong',d:'Ca thật, có phân tích, điểm chốt, thử thách 7 ngày và KPI'},
   {t:'Ma trận 220 vấn đề × 5 tầng',k:'MATRAN_T1',v:'ma-tran', d:'Cùng một vấn đề, năm độ sâu xử lý khác nhau'},
   {t:'25 mô thức huấn luyện',   k:'MOTHUC',   v:'mo-thuc',    d:'Xương sống phương pháp — cách GITA nhìn một chuyện trong nhà'},
   {t:'Bản đồ vận hành khách hàng',k:'BANDO_TUVAN',v:'bando-tuvan',d:'Đường đi của Tư vấn từ lần chạm đầu tới lúc bàn giao'},
   {t:'Bản đồ coaching',         k:'BANDO_COACH',v:'bando-coach',d:'Đường đi của Coach qua từng chặng của một nhà'},
   {t:'Năm cấp độ vận dụng',     k:'CAPDO_VANDUNG',v:'van-dung',d:'Cùng một tài liệu, năm độ sâu tuỳ người ngồi đối diện'}
  ]},

 {ma:'K3', ten:'Kho quy trình xử lý vấn đề', ic:'shield', c:'#185AB4',
  mo:'Làm theo bản năng thì không đo được, không truy được, và khi hỏng thì không ai biết hỏng ở đâu.',
  kho:[
   {t:'Bảy bước xử lý ca',       k:'QUYTRINH_XL',v:'xu-ly-ca', d:'Mỗi bước có bằng chứng bắt buộc — thiếu thì không đi tiếp được'},
   {t:'Bốn ràng buộc máy tự kiểm',k:'RANG_BUOC', v:'xu-ly-ca', d:'Không nhảy bước · quá hạn nổi lên · dấu hiệu nguy hiểm chặn · không cấp trên tầng'},
   {t:'Chuẩn vận hành',          k:'VANHANH',   v:'chuan-nhat', d:'Nhịp làm việc chuẩn của toàn hệ theo ngày, tuần, tháng'},
   {t:'Chín cổng chuyển đổi',    k:'CHUYENDOI', v:'chuyen-doi', d:'Quy trình đưa một nhà từ nghi ngờ tới cam kết'},
   {t:'Dòng chảy thông tin',     k:'KETNOI',    v:'dong-chay',  d:'Việc gì đi từ đâu tới đâu, ai bàn giao cho ai'},
   {t:'Sáu ranh giới',           k:'NGONTU_RANH',v:'ranh-gioi', d:'Điều GITA không làm — phần giữ cho mọi phần khác có nghĩa'},
   {t:'Rà soát mười hai mặt',    k:'RASOAT_KH', v:'ra-soat-kh', d:'Bộ soát định kỳ cho từng hồ sơ khách hàng'}
  ]},

 {ma:'K4', ten:'Kho dữ liệu tài chính', ic:'chart', c:'#0B7350',
  mo:'CHỈ R01 – R04 thấy phần này. R04 ở mức chỉ đọc, để đo lường và giám sát.',
  quyen:'fin_view',
  kho:[
   {t:'Hệ quản trị tài chính',   k:'TAICHINH_QT',v:'tai-chinh-qt',d:'Khung quản trị dòng tiền của toàn hệ'},
   {t:'Quy trình tài chính',     k:'VANBAN',    v:'quy-trinh-tc', d:'Các bước thu, chi, duyệt và đối soát'},
   {t:'Kiến trúc chi phí',       k:'CHIPHI',    v:'chi-phi',      d:'Chi phí vận hành từng phần của hệ thống'},
   {t:'Cơ chế tài chính đại sứ', k:'HOAHONG',   v:'hoa-hong',     d:'Hoa hồng giới thiệu — trần 10%, không ngoại lệ'},
   {t:'Tài chính & tăng trưởng', k:'DIEM',      v:'tang-truong',  d:'Số liệu tăng trưởng gắn với dòng tiền'}
  ]},

 {ma:'K5', ten:'Kho quà tặng khách hàng', ic:'seed', c:'#BE0E16',
  mo:'Quà không phải để cho. Quà là một lần gia đình được công nhận đúng việc họ vừa làm được.',
  kho:[
   {t:'Kho 1.000 tài liệu quà tặng',k:'QUA1000',v:'kho-qua',    d:'Toàn bộ tư liệu tặng kèm, gắn theo phác đồ và tầng'},
   {t:'Ghi nhận · Cấp độ · Quà tặng',k:'QUA',   v:'phan-thuong', d:'Khi nào tặng gì, và tặng để công nhận điều gì'},
   {t:'Dạng quà theo tầng',      k:'QUA_DANG',  v:'phan-thuong', d:'Mỗi tầng một loại quà phù hợp với chặng đang đi'},
   {t:'Huy hiệu',                k:'HUYHIEU',   v:'vinh-danh',   d:'Dấu ghi nhận đường dài, không phải phần thưởng nhất thời'},
   {t:'Vinh danh & kỳ tích năm', k:'SUKIEN',    v:'vinh-danh',   d:'Những việc thật của các nhà, kể lại đúng cách'}
  ]},

 {ma:'K6', ten:'Đào tạo các vị trí trực thuộc GITA365', ic:'users', c:'#5140B4',
  mo:'Người mới nhận việc cần biết làm gì trước, và biết mình đang ở cấp nào.',
  kho:[
   {t:'Năm cấp độ vận dụng',     k:'CAPDO_VANDUNG',v:'van-dung', d:'C1 làm theo → C5 dạy lại được, kèm dấu hiệu đủ để lên cấp'},
   {t:'Vận dụng theo loại tài liệu',k:'VANDUNG',v:'van-dung',    d:'Ai dùng gì, ở tầng nào, báo cáo lại những gì'},
   {t:'Hành trình người dẫn dắt',k:'DANDAT',    v:'nguoi-dan-dat',d:'Đường đi nghề nghiệp trong GITA, từ mới vào tới dẫn nhóm'},
   {t:'Đội ngũ dẫn dắt',         k:'TEAM',      v:'doi-ngu',     d:'Vai nào giữ việc gì trong hệ thống'},
   {t:'Xương sống phương pháp',  k:'PHUONGPHAP',v:'phuong-phap', d:'42 mô thức và sáu nhịp ngôn ngữ — nền của mọi buổi'},
   {t:'Bộ nhận diện ngôn từ',    k:'NGONTU',    v:'nhan-dien-loi',d:'GITA nói thế nào · mười dấu hiệu câu do máy viết'},
   {t:'Sổ tay nhận diện GITA',   k:'SOTAY_NHANDIEN',v:'so-tay-nhan-dien',d:'Bảy chương viết rõ, đọc thẳng trên ứng dụng'},
   {t:'Tệp nhân sự trung thành', k:'NHANSU_TT', v:'nhan-su-tt',  d:'Giữ người giỏi ở lại bằng gì'}
  ]},

 {ma:'K7', ten:'Chương trình đào tạo cho khách hàng', ic:'book', c:'#0B6675',
  mo:'Các khoá học và chặng đường mà gia đình đi qua, chia theo nhóm và theo tầng.',
  kho:[
   {t:'Lộ trình T1 → T5',        k:'LEVELS',    v:'lo-trinh',    d:'Năm tầng, mỗi tầng một việc phải làm xong'},
   {t:'Một trăm tầng giá trị',   k:'TANG100',   v:'kien-truc-100',d:'Kiến trúc một trăm năm của hệ thống'},
   {t:'Bộ test nhận diện 5 tầng',k:'TEST750',   v:'bo-test',     d:'Bài đo đầu chặng và cuối chặng cho từng tầng'},
   {t:'Mười điểm về đích',       k:'KPI',       v:'kpi-100',     d:'KPI của một nhà, đo được bằng bằng chứng'},
   {t:'Cổng nghiệm thu',         k:'LOTRINH',   v:'cong-nghiem-thu',d:'Buổi nhìn lại cuối mỗi chặng'},
   {t:'Hệ tư duy mới',           k:'BAIHOC',    v:'tu-duy',      d:'Bài học đổi cách nhìn trong nhà'},
   {t:'Chu kỳ 21 / 90 ngày',     k:'CHUYENDICH',v:'chu-ky',      d:'Nhịp thay đổi thật của một thói quen'}
  ]},

 {ma:'K8', ten:'Văn bản pháp lý và chuẩn hồ sơ', ic:'vault', c:'#185AB4',
  mo:'Phần giữ cho hệ thống đứng được trước pháp luật và trước khách hàng.',
  kho:[
   {t:'Bộ văn bản chuẩn',        k:'VANBAN',    v:'van-ban',     d:'Hợp đồng, cam kết, biên bản, điều khoản sử dụng'},
   {t:'Chuẩn hồ sơ VIP & VVIP',  k:'HOSO_VIP',  v:'hoso-vip',    d:'Hồ sơ khách hàng cấp cao phải có những gì'},
   {t:'Phân hạng VIP & VVIP',    k:'PHANHANG',  v:'hang-vip',    d:'Tiêu chí xếp hạng, không xếp theo cảm tính'},
   {t:'Vòng đời tài khoản',      k:'LUAT_TK',   v:'vong-doi-tk', d:'Mở, khoá, chuyển, xoá — và ai được làm việc nào'},
   {t:'Tầng quyền truy cập',     k:'TAIKHOAN_KPI',v:'tang-quyen',d:'Ai thấy gì, tới đâu, vì sao dừng ở đó'},
   {t:'Mật mã kín trên tài liệu',k:'DAU_MAT',   v:'dau-mat',     d:'Đóng dấu theo người xem để truy được nguồn rò rỉ'},
   {t:'Lá chắn dữ liệu',         k:'AUDIT',     v:'an-toan-du-lieu',d:'Sáu lớp bảo vệ tài sản số của Học viện'}
  ]},

 {ma:'K9', ten:'Tài liệu gốc của Học viện', ic:'brain', c:'#0B7350',
  mo:'Nguồn của mọi thứ ở trên. Biên soạn từ chính tài liệu người sáng lập viết ra.',
  kho:[
   {t:'Tài liệu gốc (5 bộ Word)',k:'TAILIEU_GOC',v:'tai-lieu-goc',d:'599.708 chữ · 161 bảng · 1.647 dòng dữ liệu'},
   /* Con số này từng ghi cứng "2.909 đoạn" — đúng vào lúc bộ nhập còn
      chặn ở 400 đoạn mỗi bộ. Gỡ chặn xong là số cũ sai. Đếm thẳng từ kho. */
   {t:'Tài liệu Drive (10 bộ)',  k:'TAILIEU_DRIVE',v:'tai-lieu-goc',
    d:function(){ return (G.TAILIEU_DRIVE||[]).reduce(function(a,x){return a+(x.doan||[]).length;},0)
      .toLocaleString('vi-VN')+' đoạn nội dung · giữ nguyên văn'; }},
   {t:'Sách gốc & tư liệu',      k:'SACH',      v:'sach',        d:'11 chương · 515 đoạn · tra cứu được'},
   {t:'Sách tham khảo',          k:'SACH_THAMKHAO',v:'sach',     d:'Nguồn bổ trợ, không thay thế mô thức gốc'},
   {t:'Thư viện tài liệu chung', k:null,        v:'thu-vien',    d:'Nơi mọi vị trí gửi tài liệu lên, R01–R02 kiểm duyệt'},
   {t:'Tài liệu gia đình gửi lên',k:null,       v:'tai-lieu-khach',d:'Báo cáo, ảnh và minh chứng nhiệm vụ của các nhà'}
  ]}
];

/* ─── Đếm thật, không viết tay ─── */
function dem(k){
  if(!k) return null;
  var v = G[k];
  if(Array.isArray(v)) return v.length;
  if(v && typeof v === 'object') return Object.keys(v).length;
  return 0;
}
function moDuoc(muc){
  if(!G.VIEWS[muc.v]) return false;
  var can = G.goiCanCho ? G.goiCanCho(muc.v) : null;
  if(can && G.coGoi && !G.coGoi(can)) return false;
  var it = null;
  G.NAV.forEach(function(g){ g.items.forEach(function(x){ if(x.v === muc.v) it = x; }); });
  if(it && it.perm && !G.can(it.perm)) return false;
  return true;
}

G.VIEWS['kho-tong'] = function(){
  var toanQuyen = G.can('qt_trang');   /* R01 – R02 */

  var o = U.ph({eyebrow:'TOÀN CẢNH', ic:'vault', grad:1,
    t:'Kho tổng — nhìn thấy toàn bộ',
    lead: toanQuyen
      ? 'Chín nhóm kho của Học viện trong một màn. Số đếm lấy thẳng từ dữ liệu đang nạp, không phải con số viết tay.'
      : 'Chín nhóm kho của Học viện. Phần anh chị đã được cấp thì mở thẳng; phần chưa được cấp vẫn hiện tên, để biết hệ thống có gì.'});

  /* Bảng số tổng */
  var tongKho = 0, tongMuc = 0, moRa = 0, khoa = 0;
  G.KHO_TONG.forEach(function(n){
    n.kho.forEach(function(m){
      tongKho++;
      var d = dem(m.k); if(d) tongMuc += d;
      if(moDuoc(m)) moRa++; else khoa++;
    });
  });

  o += '<div class="row wrap mt2" style="gap:12px">'+
    [[String(G.KHO_TONG.length), 'NHÓM KHO', 'var(--gita)'],
     [String(tongKho), 'KHO TƯ LIỆU', 'var(--gita-sau)'],
     [tongMuc.toLocaleString('vi-VN'), 'BẢN GHI ĐANG NẠP', 'var(--ok)'],
     [String(moRa) + ' / ' + tongKho, 'ANH CHỊ MỞ ĐƯỢC', khoa ? 'var(--gita-do)' : 'var(--ok)']]
    .map(function(x){
      return '<div class="card" style="flex:1;min-width:150px;text-align:center">'+
        '<b style="font-size:26px;color:'+x[2]+'">'+h(x[0])+'</b>'+
        '<div class="tiny up muted mt">'+h(x[1])+'</div></div>';
    }).join('')+'</div>';

  /* Kho tổng ĐẾM; màn tự soát KIỂM. Hai việc khác nhau và người cầm hệ
     thống cần cả hai — đếm ra 1.000 kịch bản không nói được bên trong có
     ruột hay không. Nối thẳng sang đó cho R01–R02. */
  if(toanQuyen && G.VIEWS['soat-day-du'])
    o += '<div class="card mt2" style="border-color:rgba(16,185,129,.4);background:rgba(16,185,129,.05)">'+
      '<div class="row wrap" style="gap:11px;align-items:center">'+
      '<span style="color:var(--ok)">'+ic('shield','w-5 h-5')+'</span>'+
      '<div class="grow" style="min-width:240px">'+
      '<b class="sm" style="display:block">Màn này ĐẾM. Muốn KIỂM thì sang bộ tự soát.</b>'+
      '<span class="tiny muted">Đếm ra 1.000 kịch bản không nói được bên trong có ruột hay không. '+
      'Bộ tự soát chạy năm phép: con số công bố, bản ghi thiếu trường, chất lượng nội dung, '+
      'dựng thử mọi màn, và liệt kê đủ chỗ trống có chủ đích kèm lý do.</span></div>'+
      '<button class="btn pri sm" data-v="soat-day-du">Mở bộ tự soát</button></div></div>';

  if(!toanQuyen && khoa)
    o += '<div class="card mt2" style="border-color:var(--gita-vien-1)">'+
      '<p class="sm" style="line-height:1.7">'+ic('lock','w-4 h-4')+' '+khoa+
      ' kho chưa mở cho vai của anh chị. Đây không phải là giấu — mỗi vị trí mở đúng phần '+
      'mình cần để làm việc. Cần thêm phần nào thì nhắn Admin hệ thống, nói rõ dùng vào việc gì.</p></div>';

  /* Chín nhóm */
  G.KHO_TONG.forEach(function(n){
    if(n.quyen && !G.can(n.quyen)) return;   /* nhóm tài chính: R01–R04 */

    o += '<div class="mt2" style="border-left:3px solid '+n.c+';padding-left:14px;margin-top:26px">'+
      '<div class="row" style="gap:9px;align-items:baseline;flex-wrap:wrap">'+
        '<span class="mono" style="font-size:18px;font-weight:800;color:'+n.c+'">'+h(n.ma)+'</span>'+
        '<b style="font-size:16px;flex:1;min-width:220px">'+h(n.ten)+'</b>'+
        '<span class="chip">'+n.kho.length+' kho</span></div>'+
      '<p class="sm dim mt" style="line-height:1.65">'+h(n.mo)+'</p></div>';

    o += U.tbl(['Kho tư liệu','Bản ghi','Mở được',''], n.kho.map(function(m){
      var d = dem(m.k), mo = moDuoc(m);
      return [
        /* m.d nhận cả chuỗi lẫn hàm: vài dòng phải ĐẾM từ kho thay vì
           ghi cứng, vì số ghi cứng đúng đúng một lần rồi sai mãi. */
        '<b class="sm">'+h(m.t)+'</b><div class="tiny muted mt">'+
          h(typeof m.d === 'function' ? m.d() : m.d)+'</div>',
        d === null ? '<span class="muted tiny">—</span>'
          : d ? '<b class="mono" style="color:'+n.c+'">'+d.toLocaleString('vi-VN')+'</b>'
              : '<span class="tiny" style="color:var(--gita-do-ink)">chưa nạp</span>',
        mo ? '<span style="color:var(--ok)">✓</span>'
           : '<span style="color:var(--gita-do)">'+ic('lock','w-3 h-3')+'</span>',
        mo ? '<button class="btn sm" data-v="'+h(m.v)+'">Mở</button>'
           : '<span class="tiny muted">chưa cấp</span>'
      ];
    }));
  });

  if(toanQuyen)
    o += '<div class="card mt2" style="border-color:var(--gita)">'+
      '<b>'+ic('shield','w-4 h-4')+' Cấp quyền cho vị trí khác</b>'+
      '<p class="sm dim mt" style="line-height:1.7">Mỗi kho mở theo quyền gắn trên mục điều hướng của nó. '+
      'Muốn mở thêm cho một vị trí, vào <b>Phân công &amp; cấp quyền</b> và bật đúng quyền ấy cho vai đó — '+
      'thay đổi có hiệu lực ngay, và vào nhật ký kèm tên người làm.</p>'+
      '<button class="btn pri mt" data-v="phan-quyen">'+ic('arrow','w-4 h-4')+'Mở bảng phân quyền</button></div>';

  o += '<div class="card mt2" style="border-color:var(--gita-do)">'+
    '<div class="up mb" style="color:var(--gita-do-ink)">'+ic('shield','w-4 h-4')+' TÀI SẢN CỦA HỌC VIỆN</div>'+
    '<p class="sm" style="line-height:1.7">Toàn bộ kho trên là tài sản số của Học viện GITA. Người được cấp '+
    'tài khoản đọc trong phạm vi vai mình được cấp phép. Không sao chép ra ngoài, không chuyển cho bên thứ ba, '+
    'không dùng cho mục đích khác khi chưa có sự đồng ý của GITA.</p></div>';

  return o;
};
})();
