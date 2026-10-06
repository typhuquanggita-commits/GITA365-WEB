/* ═══════════════════════════════════════════════════════════════
   GITA 365 — HỆ ĐIỀU HÀNH XƯỞNG PHIM / STUDIO (chuyên sâu theo nghề)

   Lớp ĐIỀU HÀNH xưởng (quy trình · vai trò · chuẩn · kho · công suất ·
   đo lường) — tách hẳn khỏi xưởng DỰNG VIDEO (G.VIEWS['studio'] trong
   studio.js, có gói nghề + máy chủ). Màn này KHÔNG đụng studio.js, không
   gọi máy chủ, không gói nghề: chỉ là bàn điều hành bằng khung chuẩn thật
   của nghề làm phim 9:16; con số vận hành để mẫu (ghi rõ nhãn).

   View key: studio-he. Mở cho qt_trang (Super Admin / Admin). Dùng chung
   ô trạng thái gdNV + G.gdTick (khoá riêng sx-*). 6 module qua tab CSS.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G; G.VIEWS = G.VIEWS || {};
(function(){
  var U = G.U, h = U.h, ic = U.ic;
  var BANDC = { DO:'#BE0E16', VANG:'#B4720F', XANH:'#0B7350' };
  var TT = { '':{t:'Chưa',c:'--ink-4'}, dang:{t:'Đang làm',c:'--warn'}, xong:{t:'Đã xong',c:'--ok'} };

  /* ── BẢNG (tái dùng khung .gd-tb, cột đèn tuỳ chọn) ── */
  function veBang(b){
    var den = (b.den==null)?-1:b.den;
    var head = '<tr>'+ b.cols.map(function(c){ return '<th>'+h(c)+'</th>'; }).join('') +'</tr>';
    var body = b.rows.map(function(r){
      return '<tr>'+ r.map(function(cell,ci){
        if(ci===den){ var m=BANDC[cell]||'#73849F'; return '<td class="ta-c"><span class="gd-den" style="--m:'+m+'" title="'+h(cell)+'"></span></td>'; }
        return '<td>'+h(String(cell))+'</td>';
      }).join('') +'</tr>';
    }).join('');
    return '<div class="gd-wrap"><table class="gd-tb"><thead>'+head+'</thead><tbody>'+body+'</tbody></table></div>';
  }

  /* ══ MODULE A · QUY TRÌNH SẢN XUẤT (10 khâu) ══ */
  var QUYTRINH = [
    ['Ý tưởng & Brief','Chốt mục tiêu, thông điệp chính, đối tượng xem và lời kêu gọi (CTA) trước khi viết.',
      ['Đầu ra: Brief 1 trang','Phụ trách: Sáng tạo','Công cụ: mẫu brief','~0,5 ngày (mẫu)']],
    ['Kịch bản','Viết lời theo cấu trúc 8 phần, bắt đầu bằng hook 3 giây. Lời đọc tự nhiên, đúng giọng GITA.',
      ['Đầu ra: Kịch bản + lời đọc','Phụ trách: Biên kịch','Công cụ: Ngân khố câu','~0,5 ngày (mẫu)']],
    ['Storyboard / Shot list','Phân cảnh, phác khung hình dọc 9:16, liệt kê từng cảnh cần quay/dựng.',
      ['Đầu ra: Storyboard + shot list','Phụ trách: Đạo diễn','Công cụ: khung 9:16','~0,5 ngày (mẫu)']],
    ['Chuẩn bị sản xuất','Chọn MC/nhân vật, đạo cụ, bối cảnh; lên lịch quay và checklist thiết bị.',
      ['Đầu ra: Lịch quay + checklist','Phụ trách: Quản lý SX','Công cụ: lịch · checklist','~1 ngày (mẫu)']],
    ['Quay / Thu','Quay theo shot list, thu tiếng/giọng. Giữ bố cục dọc, đủ ánh sáng, đủ b-roll dự phòng.',
      ['Đầu ra: Footage thô','Phụ trách: Quay phim','Công cụ: máy quay / điện thoại','~1 ngày (mẫu)']],
    ['Dựng thô (rough cut)','Ghép cảnh theo kịch bản, canh nhịp và thời lượng, chốt mạch kể trước khi tinh chỉnh.',
      ['Đầu ra: Bản dựng thô','Phụ trách: Dựng phim','Công cụ: phần mềm dựng','~0,5 ngày (mẫu)']],
    ['Dựng tinh','Chỉnh màu phim, xử lý âm thanh, phối nhạc nền bản quyền, gắn phụ đề và motion/đồ hoạ.',
      ['Đầu ra: Bản hoàn chỉnh','Phụ trách: Dựng + Âm thanh + Motion','Công cụ: kho nhạc · template','~1 ngày (mẫu)']],
    ['Duyệt','Soát nội dung, chuẩn thương hiệu, pháp lý & bản quyền, ẩn danh dữ liệu khách trước khi ra.',
      ['Đầu ra: Bản đã duyệt','Phụ trách: Giám đốc / Quản trị','Công cụ: checklist chuẩn','~0,3 ngày (mẫu)']],
    ['Xuất bản & phân phối','Xuất đúng định dạng 9:16, đặt lịch, đăng lên kênh và gắn liên kết đo lường.',
      ['Đầu ra: Video phát hành','Phụ trách: Marketing','Công cụ: lịch đăng','~0,2 ngày (mẫu)']],
    ['Đo lường & học','Theo dõi lượt xem, giữ chân, chia sẻ, chuyển đổi; rút bài cho video kế tiếp.',
      ['Đầu ra: Thẻ kết quả','Phụ trách: Phân tích','Công cụ: bảng đo','liên tục']]
  ];
  function veQuyTrinh(){
    return '<div>'+ QUYTRINH.map(function(s,i){
      return '<div class="sx-step"><span class="sx-num">'+(i+1)+'</span><div>'+
        '<div class="sx-st-b">'+h(s[0])+'</div><div class="sx-st-d">'+h(s[1])+'</div>'+
        '<div class="sx-meta">'+ s[2].map(function(c){ return '<span class="sx-chip">'+h(c)+'</span>'; }).join('') +'</div>'+
      '</div></div>';
    }).join('') +'</div>';
  }

  /* ══ MODULE B · VAI TRÒ & ĐỘI NGŨ XƯỞNG ══ */
  function veVaiTro(){ return veBang({ cols:['Vai trong xưởng','Nhiệm vụ chính','Kỹ năng lõi','Đầu ra','KPI (mẫu)'], den:-1, rows:[
    ['Biên kịch','Viết kịch bản & lời đọc theo cấu trúc chuẩn','Kể chuyện · hook · ngôn ngữ GITA','Kịch bản đạt duyệt','% kịch bản duyệt lần 1'],
    ['Đạo diễn sáng tạo','Chốt ý tưởng, storyboard, mạch cảm xúc','Tư duy hình ảnh · nhịp','Storyboard · hướng hình','Điểm cảm xúc video'],
    ['Quay phim','Quay đúng shot list, đủ sáng, bố cục dọc','Máy quay · ánh sáng · bố cục','Footage đạt chuẩn','% cảnh dùng được'],
    ['Dựng phim','Dựng thô & tinh, canh nhịp, chỉnh màu','Phần mềm dựng · màu','Bản dựng hoàn chỉnh','Thời gian dựng / video'],
    ['Motion / Đồ hoạ','Chữ động, hiệu ứng, nhận diện thương hiệu','After Effects · thiết kế','Gói motion','Chuẩn thương hiệu đạt'],
    ['Âm thanh','Xử lý tiếng, chuẩn âm lượng, phối nhạc','Mix · nhạc bản quyền','Âm thanh sạch','Âm lượng đạt chuẩn'],
    ['Phụ đề / Biên tập','Gắn phụ đề, soát chính tả, cỡ chữ','Ngôn ngữ · timing','Phụ đề chuẩn','% video có phụ đề'],
    ['Quản lý sản xuất','Giữ lịch, điều phối đội, chốt hạn','Điều phối · kế hoạch','Pipeline đúng hạn','% dự án đúng hạn'],
    ['Phát hành','Xuất bản, đặt lịch, phối marketing','Nền tảng · lịch đăng','Video lên kênh','Số video phát hành']
  ]}); }

  /* ══ MODULE C · CHUẨN CHẤT LƯỢNG 9:16 ══ */
  function veChuan(){ return veBang({ cols:['Nhóm chuẩn','Tiêu chí','Ngưỡng','Vì sao'], den:-1, rows:[
    ['Kỹ thuật','Tỷ lệ khung hình','9:16 dọc (1080×1920)','Đúng nền tảng video dọc'],
    ['Kỹ thuật','Âm lượng','≈ −14 LUFS (mẫu)','Nghe đều, không vỡ tiếng'],
    ['Kỹ thuật','Độ phân giải / nét','≥ 1080p','Hình sắc trên điện thoại'],
    ['Nội dung','Hook mở đầu','≤ 3 giây','Giữ người xem khỏi lướt'],
    ['Nội dung','Độ dài','30–210 giây','Đủ ý, không lê thê'],
    ['Nội dung','Thông điệp','1 ý chính','Rõ ràng, dễ nhớ'],
    ['Thương hiệu','Logo & màu','Logo góc + màu GITA','Nhận diện nhất quán'],
    ['Thương hiệu','Nhạc nền','Có bản quyền','Tránh bị gỡ / phạt'],
    ['Khả dụng','Phụ đề','Luôn bật','Xem được khi tắt tiếng'],
    ['Khả dụng','Cỡ chữ & vùng an toàn','Chữ to, trong khung an toàn','Đọc được, không bị cắt'],
    ['Pháp lý','Dữ liệu khách','Ẩn danh theo hiến pháp','Bảo mật khách hàng'],
    ['Kêu gọi','CTA','Rõ 1 hành động','Dẫn tới bước tiếp theo']
  ]}); }

  /* ══ MODULE D · KHO SẢN XUẤT ══ */
  function veKho(){ return veBang({ cols:['Loại kho','Nội dung','Số mục (mẫu)','Đèn','Ghi chú'], den:3, rows:[
    ['Template 9:16','Khung mở đầu · thân · CTA','24','XANH','Chuẩn thương hiệu'],
    ['Nhạc nền bản quyền','Theo cảm xúc · nhịp độ','60','XANH','Đã có giấy phép'],
    ['Tư liệu / footage','Cảnh nền · b-roll','180','VANG','Bổ sung dần'],
    ['Brand kit','Logo · màu · font','1 bộ','XANH','Khoá chuẩn, không đổi tuỳ tiện'],
    ['Hiệu ứng / chuyển cảnh','Motion · transition','36','XANH','—'],
    ['Giọng đọc tham chiếu','Mẫu giọng xử lý tại máy','8','XANH','Không rời thiết bị']
  ]}); }

  /* ══ MODULE E · CÔNG SUẤT & LỊCH ══ */
  function veCongSuat(){
    var loai = veBang({ cols:['Loại nội dung','Mục tiêu','Độ dài','Nhịp/tháng (mẫu)'], den:-1, rows:[
      ['Phim cầu nối','Nối cảm xúc giữa các tầng','3–4 phút','6'],
      ['Nội dung WOW','Tạo điểm chạm bất ngờ','30–60 giây','12'],
      ['Testimonial khách','Bằng chứng chuyển hoá','1–2 phút','4'],
      ['Video hướng dẫn','Dạy một kỹ năng cụ thể','2–5 phút','8'],
      ['Quảng cáo','Kéo khách mới','15–45 giây','10']
    ]});
    var board = veBang({ cols:['Dự án','Loại','Khâu hiện tại','Phụ trách','Hạn','Đèn'], den:5, rows:[
      ['Phim cầu nối T3','Cầu nối','Dựng tinh','Dựng phim','T5','VANG'],
      ['WOW "3 giây vàng"','WOW','Quay','Quay phim','T4','VANG'],
      ['Testimonial nhà Minh An','Testimonial','Duyệt','Giám đốc','T3','XANH'],
      ['Hướng dẫn "Bảng số gia đình"','Hướng dẫn','Kịch bản','Biên kịch','T6','XANH'],
      ['Quảng cáo tuyển sinh','Quảng cáo','Phát hành','Marketing','T3','XANH']
    ]});
    return U.sec('Loại nội dung GITA','5 dòng sản phẩm của xưởng — mỗi loại một chuẩn & nhịp riêng')+loai+
      U.sec('Bảng công suất & lịch (mẫu)','Dự án đang chạy xếp theo khâu — nối máy chủ sẽ chạy thật')+board;
  }

  /* ══ MODULE F · ĐO LƯỜNG HIỆU QUẢ ══ */
  function veDoLuong(){ return veBang({ cols:['Chỉ số','Ý nghĩa','Mức tốt (mẫu)','Hiện tại (mẫu)','Đèn'], den:4, rows:[
    ['Lượt xem','Số người tiếp cận','—','42.000','XANH'],
    ['Giữ chân 3 giây','% vượt qua hook','≥ 70%','74%','XANH'],
    ['Xem hết','% xem trọn video','≥ 35%','31%','VANG'],
    ['Chia sẻ','Mức lan truyền','≥ 2%','2,4%','XANH'],
    ['Lưu','Giá trị giữ lại','≥ 1%','1,1%','XANH'],
    ['Chuyển đổi','Xem → đăng ký → chốt','≥ 3%','2,6%','VANG']
  ]}); }

  /* ══ NGHIỆP VỤ ĐIỀU HÀNH XƯỞNG (bấm-thao-tác-được) ══ */
  var NV = [
    ['Duyệt brief & ý tưởng video','noi-dung-tiep-thi'],['Giao kịch bản cho biên kịch','studio'],
    ['Duyệt storyboard / shot list','studio'],['Lên lịch quay & phân công đội','phong-ban'],
    ['Soát chuẩn chất lượng 9:16','studio'],['Duyệt nội dung trước phát hành','studio'],
    ['Quản kho template · nhạc · tư liệu','thu-vien'],['Đo hiệu quả video (view · giữ chân · chốt)','do-luong-kh'],
    ['Duyệt ngân sách sản xuất','chi-phi'],['Báo cáo kết quả xưởng phim','do-luong-kh']
  ];
  function veNV(){
    var xong=0;
    var rows = NV.map(function(it,i){
      var id='sx-nv:'+i; var st=(G.S.gdNV||{})[id]||''; if(st==='xong') xong++;
      var t=TT[st];
      var tgt=(G.manCoThat && G.manCoThat(it[1]))?it[1]:'studio';
      var mo=G.allowed?G.allowed(tgt):true;
      var nut=mo?'<button class="btn ghost sm gd-open" data-v="'+h(tgt)+'">Mở '+ic('arrow','w-3 h-3')+'</button>'
               :'<span class="vh-khoa">'+ic('lock','w-3 h-3')+'khoá</span>';
      return '<div class="gd-nvr'+(st==='xong'?' done':'')+'">'+
        '<button class="gd-tick gd-tick-'+(st||'chua')+'" data-gdtick="'+h(id)+'" style="--m:var('+t.c+')" title="Bấm đổi trạng thái">'+
          (st==='xong'?ic('check','w-3 h-3'):st==='dang'?ic('clock','w-3 h-3'):'')+'</button>'+
        '<span class="gd-nvi">'+(i+1)+'</span><span class="gd-nvt">'+h(it[0])+'</span>'+
        '<span class="gd-nvs" style="--m:var('+t.c+')">'+h(t.t)+'</span>'+nut+'</div>';
    }).join('');
    return {html:'<div class="gd-nvlist">'+rows+'</div>', xong:xong};
  }

  G.VIEWS['studio-he'] = function(){
    if(!(typeof G.can==='function' && G.can('qt_trang')))
      return U.lockCard('Hệ điều hành Xưởng phim mở cho Super Admin / Admin. Đăng nhập đúng vai để xem.');

    var o = U.ph({ eyebrow:'XƯỞNG PHIM · ĐIỀU HÀNH CHUYÊN SÂU', ic:'sparkle', grad:1,
      t:'Hệ điều hành Xưởng phim / Studio',
      lead:'Bàn điều hành chuyên môn của xưởng: quy trình 10 khâu, vai trò & đội ngũ, chuẩn chất lượng 9:16, kho sản xuất, công suất & lịch, đo lường. Khung chuẩn thật của nghề làm phim; con số vận hành để mẫu tới khi nối máy chủ.' });

    o += '<div class="row mb" style="gap:8px;flex-wrap:wrap">'+
      '<button class="btn ghost sm" data-v="van-hanh-10">'+ic('arrow','w-3 h-3')+'Bảng điều khiển vận hành</button>'+
      '<button class="btn sm" data-v="lam-phim-10">'+ic('sparkle','w-3 h-3')+'Chương trình 10 bước làm phim</button>'+
      '<button class="btn sm" data-v="ban-dung">'+ic('tools','w-3 h-3')+'Bàn dựng (biên tập tại máy)</button>'+
      (G.allowed && G.allowed('studio') ? '<button class="btn ghost sm" data-v="studio">'+ic('spark','w-3 h-3')+'Mở xưởng dựng video</button>' : '')+
      '</div>';

    o += '<div class="grid g4 mb">'+
      U.stat({k:'Khâu sản xuất', v:String(QUYTRINH.length), d:'quy trình chuẩn'})+
      U.stat({k:'Vai trong xưởng', v:'9', d:'đội ngũ nghề'})+
      U.stat({k:'Loại nội dung', v:'5', d:'dòng sản phẩm'})+
      U.stat({k:'Dự án đang chạy', v:'12', d:'tháng này (mẫu)', c:'var(--gita)'})+'</div>';

    /* 6 module qua tab CSS (radio) — tất cả bảng biểu bên trong */
    o += '<div class="sx">'+
      '<input type="radio" name="sxTab" id="sx-qt" class="sx-radio" checked>'+
      '<input type="radio" name="sxTab" id="sx-vt" class="sx-radio">'+
      '<input type="radio" name="sxTab" id="sx-cl" class="sx-radio">'+
      '<input type="radio" name="sxTab" id="sx-kh" class="sx-radio">'+
      '<input type="radio" name="sxTab" id="sx-cs" class="sx-radio">'+
      '<input type="radio" name="sxTab" id="sx-dl" class="sx-radio">'+
      '<div class="sx-tabbar">'+
        '<label for="sx-qt">'+ic('orbit','w-3 h-3')+'Quy trình 10 khâu</label>'+
        '<label for="sx-vt">'+ic('users','w-3 h-3')+'Vai trò & đội ngũ</label>'+
        '<label for="sx-cl">'+ic('check','w-3 h-3')+'Chuẩn 9:16</label>'+
        '<label for="sx-kh">'+ic('book','w-3 h-3')+'Kho sản xuất</label>'+
        '<label for="sx-cs">'+ic('grid','w-3 h-3')+'Công suất & lịch</label>'+
        '<label for="sx-dl">'+ic('chart','w-3 h-3')+'Đo lường</label>'+
      '</div>'+
      '<div id="sx-p-qt" class="sx-pan">'+U.sec('Quy trình sản xuất — 10 khâu','Từ ý tưởng tới đo lường · mỗi khâu rõ đầu ra · phụ trách · công cụ')+veQuyTrinh()+'</div>'+
      '<div id="sx-p-vt" class="sx-pan">'+U.sec('Vai trò & đội ngũ xưởng','9 vai nghề · nhiệm vụ · kỹ năng lõi · đầu ra · KPI')+veVaiTro()+'</div>'+
      '<div id="sx-p-cl" class="sx-pan">'+U.sec('Chuẩn chất lượng 9:16','Kỹ thuật · nội dung · thương hiệu · khả dụng · pháp lý · CTA')+veChuan()+'</div>'+
      '<div id="sx-p-kh" class="sx-pan">'+U.sec('Kho sản xuất','Template · nhạc bản quyền · tư liệu · brand kit · hiệu ứng · giọng')+veKho()+'</div>'+
      '<div id="sx-p-cs" class="sx-pan">'+veCongSuat()+'</div>'+
      '<div id="sx-p-dl" class="sx-pan">'+U.sec('Đo lường hiệu quả','Lượt xem · giữ chân · xem hết · chia sẻ · lưu · chuyển đổi')+veDoLuong()+'</div>'+
    '</div>';

    var nv = veNV();
    o += U.sec('Mười nghiệp vụ điều hành xưởng','Bấm ô trạng thái để theo dõi (chưa · đang · xong) · bấm "Mở" để thao tác · đã xong '+nv.xong+'/10');
    o += nv.html;

    o += '<p class="tiny muted" style="margin-top:12px">'+ic('shield','w-3 h-3')+' Màn điều hành này không đụng xưởng dựng video (gói nghề · máy chủ). Trạng thái nghiệp vụ lưu trên máy anh/chị, giữ qua phiên. Mỗi "Mở" vẫn qua cổng quyền của hệ.</p>';
    return o;
  };
})();
