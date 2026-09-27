/* ═══════════════════════════════════════════════════════════════
   GITA 365 · 9.99.205 — HÀNH TRÌNH "NÔI NUÔI DƯỠNG NHÂN TÀI"

   Chủ hệ: dựng hành trình theo bộ sách "Ba mẹ toàn năng — Nôi nuôi dưỡng
   nhân tài" (Trainer Trương Nhật Quang · Học viện GITA).

   Dữ liệu LÀ THẬT — chép từ MỤC LỤC cuốn "NÔI NUÔI DƯỠNG NHÂN TÀI 42.docx"
   trên Drive (thư mục "GITA 365"): 6 quyển · 10 chương · các mục con, và
   ba hành trình ở Chương 10 (90 ngày · 365 ngày · một cuộc đời). Màn TRỎ
   về bản gốc, không chép toàn văn 44MB vào kho mã.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;

G.NNT_NGUON = 'https://drive.google.com/file/d/1kV8orBSYRBvShQGLxeyxFQ9Cmiojnigo/view';

/* 6 QUYỂN — gom các chương. */
G.NNT_QUYEN = [
  {q:'Q1',ten:'Kiến tạo nền tảng thành công',ch:'C1–C3',mau:'var(--gita)'},
  {q:'Q2',ten:'Chắp cánh tài năng cùng con',ch:'C4–C5',mau:'var(--gita-sang)'},
  {q:'Q3',ten:'Nghệ thuật dẫn dắt con thành công',ch:'C6–C7',mau:'var(--gita-sau)'},
  {q:'Q4',ten:'Người thắp sáng hy vọng',ch:'C8',mau:'var(--ok)'},
  {q:'Q5',ten:'Gia đình thịnh vượng',ch:'C9',mau:'var(--gita-ink)'},
  {q:'Q6',ten:'Bản thiết kế tương lai',ch:'C10',mau:'var(--gold-2)'}
];

/* 10 CHƯƠNG — kèm mục con thật. */
G.NNT_CHUONG = [
  {c:'C1',q:'Q1',ten:'Thấu hiểu con và soi hình bóng cha mẹ',
    muc:['Sức mạnh của quan sát','Sức mạnh của lắng nghe','Sức mạnh của câu hỏi','Bức tranh hoàn hảo hơn','Soi hình bóng cha mẹ trong con']},
  {c:'C2',q:'Q1',ten:'Kiến tạo môi trường mới, gắn kết mới',
    muc:['Bản thiết kế cho tương lai','Định hướng phát triển năng lực','Kiến tạo Nôi nuôi dưỡng tâm hồn – Gia đình','Môi trường phát triển tài năng','Trường học – Sân khấu thể hiện xuất sắc','Trải nghiệm xu hướng – sự nghiệp tương lai']},
  {c:'C3',q:'Q1',ten:'Xây dựng hệ thống niềm tin mới',
    muc:['Những cú sốc ngăn cản','Niềm tin hiện tại trong con','Thử thách mới thiết lập niềm tin mới','Niềm tin thành công mới','Thiết lập tương lai mới']},
  {c:'C4',q:'Q2',ten:'Thiết lập các chặng thử thách',
    muc:['Vòng tròn học tập thành công xuất sắc','Thử thách nhỏ nuôi hy vọng lớn','Đủ lượng sẽ thay đổi chất','Bữa tiệc ăn mừng và cảm xúc chiến thắng','Tốt hơn 1% mỗi ngày','Cùng nhân lên gấp 11 lần']},
  {c:'C5',q:'Q2',ten:'Tài trí trong hành động',
    muc:['Con có thể làm tốt hơn','Tiền đẻ ra tiền – Kiến thức tạo giá trị','Vay và phát tri thức','Tìm công thức thành công','Tư duy bút chì có gôm','Thay đổi tư duy – Thay đổi kết quả']},
  {c:'C6',q:'Q3',ten:'Nghệ thuật đồng hành cùng con',
    muc:['Nuôi dưỡng niềm tin vào chính con','Tư duy thông thái cùng con làm chủ','Định hướng con từ điều nhỏ nhất','Đồng hành Đúng – Đủ – Đều','Dạy con trò chuyện với cơ thể','Nghệ thuật sử dụng câu chuyện','Nuôi dưỡng phẩm chất thành đạt','Từ nơi khốn cùng đến vinh quang']},
  {c:'C7',q:'Q3',ten:'Sức mạnh của sự chỉ dẫn',
    muc:['Chỉ dẫn mơ hồ và những nút thắt','Chỉ dẫn hoàn hảo và điều kỳ diệu','Quy trình G-PDCA trong chỉ dẫn','Nguyên tắc 6C – Nuôi dạy con khoa học','Cố vấn và những giá trị lớn','Tinh thần trách nhiệm']},
  {c:'C8',q:'Q4',ten:'Người thắp sáng hy vọng',
    muc:['Bóng đêm ký ức','Điểm tựa niềm tin','Kiên nhẫn thực hiện ước mơ','Người thắp sáng hy vọng','Người truyền lửa tuyệt vời','Cuốn sổ nhật ký kỳ diệu','Định hướng lộ trình thành công','Văn hoá biết ơn và trân trọng']},
  {c:'C9',q:'Q5',ten:'Gia đình thịnh vượng – Nôi nuôi dưỡng nhân tài',
    muc:['Hiệu ứng Domino gia đình thịnh vượng','Khai phá năng lực sáng tạo','Tư duy vượt chướng ngại cùng con','Để con hoàn hảo là chính mình','Hướng tới những vì sao','Sức mạnh của sự lựa chọn']},
  {c:'C10',q:'Q6',ten:'Bản thiết kế tương lai',
    muc:['Bản đồ tài chính trong gia đình','Hành trình 90 ngày hạnh phúc','Hành trình 365 ngày nâng cấp gia đình','Hành trình một cuộc đời viên mãn cùng con']}
];

/* BA HÀNH TRÌNH — lấy từ Chương 10, đây là "hành trình" chủ hệ muốn dựng. */
G.NNT_HANHTRINH = [
  {h:'90 ngày',ten:'90 ngày hạnh phúc',mau:'var(--gita)',
    y:'Kết nối lại, đặt nền — cha mẹ hiểu con và dựng thói quen gốc.',
    moc:['Thấu hiểu con (C1)','Kiến tạo môi trường (C2)','Niềm tin mới (C3)','Ăn mừng mốc đầu (C4)']},
  {h:'365 ngày',ten:'365 ngày nâng cấp gia đình',mau:'var(--gita-sau)',
    y:'Chắp cánh tài năng, thành thói quen Đúng–Đủ–Đều cả năm.',
    moc:['Chặng thử thách (C4)','Tài trí hành động (C5)','Đồng hành nghệ thuật (C6)','Chỉ dẫn G-PDCA · 6C (C7)']},
  {h:'1 cuộc đời',ten:'Một cuộc đời viên mãn cùng con',mau:'var(--gold-2)',
    y:'Gia đình thịnh vượng, để lại di sản — nôi nuôi dưỡng nhân tài trường tồn.',
    moc:['Thắp sáng hy vọng (C8)','Gia đình thịnh vượng (C9)','Bản thiết kế tương lai (C10)','Di sản 100 năm']}
];

(function(){
var U = G.U, h = U.h, ic = U.ic;

G.nntHt = G.nntHt || '90 ngày';
G.nntChonHt = function(hh){ G.nntHt = hh; G.render && G.render(); };

function chuongCuaQuyen(q){ return G.NNT_CHUONG.filter(function(c){return c.q===q;}); }

G.VIEWS['noi-nhan-tai'] = function(){
  var soMuc = G.NNT_CHUONG.reduce(function(s,c){return s+c.muc.length;},0);
  var o = U.ph({eyebrow:'CHA MẸ THÔNG THÁI', ic:'seed', grad:1, t:'Nôi nuôi dưỡng nhân tài',
    lead:'Hành trình theo bộ sách "Ba mẹ toàn năng — Nôi nuôi dưỡng nhân tài": hiểu con · kiến tạo môi trường · dựng niềm tin · chặng thử thách · đồng hành · chỉ dẫn · thắp sáng · gia đình thịnh vượng · di sản.'});

  o += U.bdSoHang([
    {k:'Bộ sách', v:'6 quyển', c:'var(--gita)', d:'gom 10 chương'},
    {k:'Chương', v:'10', c:'var(--gita-sau)'},
    {k:'Mục nội dung', v:String(soMuc), c:'var(--ok)'},
    {k:'Hành trình', v:'3', c:'var(--gold-2)', d:'90 ngày · 365 ngày · một đời'}
  ]);

  /* ── BA HÀNH TRÌNH — chọn một để xem mốc ── */
  o += U.sec('BA HÀNH TRÌNH','Chọn nhịp đi — mỗi hành trình là một lát cắt của cùng bộ sách');
  o += '<div class="nnt-ht-chon">'+ G.NNT_HANHTRINH.map(function(x){
    return '<button class="nnt-ht-nut'+(G.nntHt===x.h?' on':'')+'" style="--hc:'+x.mau+
      '" onclick="G.nntChonHt(\''+x.h+'\')">'+h(x.ten)+'</button>';
  }).join('') +'</div>';
  var ht = G.NNT_HANHTRINH.filter(function(x){return x.h===G.nntHt;})[0] || G.NNT_HANHTRINH[0];
  o += '<p class="note" style="margin:6px 0 10px">'+h(ht.y)+'</p>';
  o += U.bdDong(ht.moc.map(function(m,i){ return {ten:(i+1)+'', o:[{t:m}]}; }),
    {chu:'Các mốc rút từ chính chương sách — đi tuần tự, mỗi mốc là một chương thực hành.'});

  /* ── SÁU QUYỂN — dòng chảy ── */
  o += U.sec('SÁU QUYỂN','Đường lớn của bộ sách, từ nền tảng tới di sản');
  o += U.bdDong(G.NNT_QUYEN.map(function(q){
    return {ten:q.q+' · '+q.ch, mau:q.mau, o:[{t:q.ten}]};
  }));

  /* ── 10 CHƯƠNG — thẻ gập, mục con bên trong (giữ chữ gọn) ── */
  o += U.sec('MƯỜI CHƯƠNG · CHI TIẾT','Bấm một chương để mở các mục — nội dung đầy đủ đọc ở bản sách gốc');
  o += '<div class="nnt-chuong">'+ G.NNT_QUYEN.map(function(q){
    var cs = chuongCuaQuyen(q.q);
    return '<div class="nnt-q" style="--qc:'+q.mau+'"><div class="nnt-q-h">'+h(q.q)+' · '+h(q.ten)+'</div>'+
      cs.map(function(c){
        return '<details class="nnt-c"><summary><span class="nnt-c-ma mono">'+h(c.c)+'</span>'+h(c.ten)+
          ' <span class="nnt-c-so">'+c.muc.length+' mục</span></summary>'+
          '<ul class="nnt-c-ds">'+c.muc.map(function(m){return '<li>'+h(m)+'</li>';}).join('')+'</ul></details>';
      }).join('') +'</div>';
  }).join('') +'</div>';

  o += '<p class="note mt">'+ic('book','w-4 h-4')+' Nguồn đầy đủ: '+
    '<a href="'+h(G.NNT_NGUON)+'" target="_blank" rel="noopener">bản sách "Nôi nuôi dưỡng nhân tài" trên Drive</a>'+
    ' · Trainer Trương Nhật Quang · Học viện GITA.</p>';
  return o;
};

})();
