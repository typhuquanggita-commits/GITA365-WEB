/* ═══════════════════════════════════════════════════════════════
   GITA 365 — CHƯƠNG TRÌNH LÀM PHIM · 10 BƯỚC RA PHIM (Xưởng phim AI)

   Không phải bảng — đây là CHƯƠNG TRÌNH LÀM THEO: đi từ bước 1 đến bước
   10 là có một phim 9:16 hoàn chỉnh. Mỗi bước: mục tiêu · việc cần làm
   (tick được) · GITA Studio AI làm giúp · mẫu nhanh · đầu ra → bước sau.

   Khung chuẩn thật của nghề làm phim; phần AI mô tả đúng cách xưởng dựng
   video đang chạy (sinh tại thiết bị, không gửi máy chủ/dịch vụ ngoài).
   KHÔNG đụng studio.js · máy chủ · giấy phép. View key: lam-phim-10.
   Tick dùng chung gdNV + G.gdTick (khoá riêng lp-*). Mở cho qt_trang.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G; G.VIEWS = G.VIEWS || {};
(function(){
  var U = G.U, h = U.h, ic = U.ic;
  var TTC = { '':'--ink-4', dang:'--warn', xong:'--ok' };

  var STEPS = [
    { ten:'Chọn phim & mục tiêu', muc:'Biết rõ làm phim gì, cho ai, để làm gì — trước khi viết một chữ.',
      viec:['Chọn loại phim (cầu nối · WOW · testimonial · hướng dẫn · quảng cáo)',
            'Chốt 1 thông điệp chính','Ghi đối tượng xem','Chọn lời kêu gọi (CTA)','Chọn độ dài mục tiêu'],
      ai:'GITA gợi ý loại phim & độ dài hợp mục tiêu, mở sẵn brief mẫu để điền nhanh.',
      mau:'<b>Brief 1 trang:</b> “Phim [loại] cho [đối tượng]. Một thông điệp: [___]. CTA: [___]. Độ dài: [___]. Cảm xúc muốn tạo: [___].”',
      out:'Brief 1 trang' },

    { ten:'Viết kịch bản', muc:'Có kịch bản + lời đọc, mở đầu bằng hook 3 giây giữ người xem.',
      viec:['Viết hook 3 giây đầu','Dựng cấu trúc 8 phần','Viết lời đọc tự nhiên, đúng giọng GITA','Chốt CTA ở cuối'],
      ai:'Studio sinh kịch bản từ <b>Ngân khố câu</b> theo brief — ngay tại thiết bị, lời không gửi lên máy chủ.',
      mau:'<b>8 phần:</b> Hook → Vấn đề → Đồng cảm → Giải pháp → Bằng chứng → Hướng dẫn → Kết quả → CTA.',
      out:'Kịch bản + lời đọc' },

    { ten:'Storyboard & shot list', muc:'Thấy trước từng cảnh, dựng theo khung dọc 9:16.',
      viec:['Chia cảnh theo kịch bản','Phác khung hình 9:16 từng cảnh','Ghi shot list','Đánh dấu cảnh quay vs cảnh dựng'],
      ai:'Studio tự tách cảnh từ kịch bản và gợi bố cục khung 9:16 cho mỗi cảnh.',
      mau:'<b>Mỗi dòng shot:</b> [số cảnh] · [nội dung hình] · [lời/chữ trên hình] · [thời lượng].',
      out:'Storyboard + shot list' },

    { ten:'Chuẩn bị vật liệu', muc:'Gom đủ hình · giọng · nhạc · chữ trước khi dựng, không thiếu giữa chừng.',
      viec:['Chọn giọng đọc (mẫu tham chiếu tại máy)','Chọn nhạc nền có bản quyền từ kho','Gom hình / tư liệu (b-roll)','Chuẩn bị phụ đề','Mở brand kit (logo · màu · font)'],
      ai:'Studio dựng hình canvas 1080p, giọng tham chiếu và phối nhạc <b>ngay trên thiết bị</b> — không tải ảnh/giọng lên dịch vụ ngoài.',
      out:'Bộ vật liệu đủ để dựng' },

    { ten:'Dựng hình từng cảnh', muc:'Biến mỗi cảnh trong storyboard thành hình động 9:16.',
      viec:['Dựng từng cảnh theo storyboard','Thêm chuyển động máy quay','Áp màu phim','Canh thời lượng mỗi cảnh'],
      ai:'Studio dựng cảnh, chuyển động và màu phim theo shot list đã nạp.',
      out:'Các cảnh đã dựng' },

    { ten:'Ghép bản thô (rough cut)', muc:'Thấy phim chạy đủ từ đầu đến cuối, chốt mạch kể.',
      viec:['Ghép các cảnh theo đúng thứ tự','Canh nhịp & tổng thời lượng','Xem lại toàn mạch, cắt chỗ thừa'],
      ai:'Studio ghép theo thứ tự kịch bản và báo nếu tổng thời lượng vượt mục tiêu.',
      out:'Bản dựng thô' },

    { ten:'Hoàn thiện (dựng tinh)', muc:'Phim sạch, đẹp, nghe rõ, có phụ đề, đúng thương hiệu.',
      viec:['Chỉnh màu phim','Mix âm thanh & chuẩn âm lượng','Phối nhạc nền','Gắn phụ đề','Thêm motion / đồ hoạ & logo'],
      ai:'Studio xử lý màu · âm · phụ đề · motion tại thiết bị; nhạc lấy từ kho bản quyền.',
      out:'Bản phim hoàn chỉnh' },

    { ten:'Soát & duyệt', muc:'Đạt chuẩn và an toàn trước khi ra mắt — không sửa sau khi đã đăng.',
      viec:['Soát checklist chuẩn 9:16','Soát nhận diện thương hiệu','Soát pháp lý & bản quyền nhạc/hình','Ẩn danh dữ liệu khách (theo hiến pháp)','Duyệt cuối'],
      ai:'Studio soát ngôn từ qua cổng duyệt nội dung của hệ; dữ liệu khách không bị gửi đi.',
      out:'Bản đã duyệt' },

    { ten:'Xuất & phát hành', muc:'Phim lên kênh đúng định dạng, đúng lịch, có đường đo.',
      viec:['Xuất 9:16 (1080×1920)','Viết tiêu đề & mô tả','Đặt lịch đăng','Gắn liên kết đo lường','Đăng lên kênh'],
      ai:'Studio xuất đúng định dạng dọc và gợi khung tiêu đề/mô tả theo loại phim.',
      out:'Video đã phát hành' },

    { ten:'Đo lường & lặp lại', muc:'Học từ số liệu để phim sau tốt hơn — vòng lặp không dừng.',
      viec:['Theo dõi lượt xem & giữ chân 3 giây','Đo % xem hết','Đo chia sẻ · lưu · chuyển đổi','Ghi bài học','Đưa bài học vào brief phim kế tiếp'],
      ai:'Studio tổng hợp “thẻ kết quả” mỗi phim để so sánh và chỉ ra bước nào cần cải thiện.',
      out:'Thẻ kết quả + bài học → quay lại Bước 1' }
  ];

  function demXong(){
    var nv = G.S.gdNV || {}, xong=0, tong=0;
    STEPS.forEach(function(s,si){ s.viec.forEach(function(_,i){ tong++; if(nv['lp-'+si+':'+i]==='xong') xong++; }); });
    return {xong:xong, tong:tong};
  }

  function veStep(s, si){
    var nv = G.S.gdNV || {};
    var xongBuoc = s.viec.every(function(_,i){ return nv['lp-'+si+':'+i]==='xong'; });
    var checks = s.viec.map(function(v,i){
      var id='lp-'+si+':'+i; var st=nv[id]||''; var c=TTC[st];
      return '<div class="lp-check'+(st==='xong'?' x':'')+'">'+
        '<button class="gd-tick gd-tick-'+(st||'chua')+'" data-gdtick="'+h(id)+'" style="--m:var('+c+')" title="Bấm đổi trạng thái">'+
          (st==='xong'?ic('check','w-3 h-3'):st==='dang'?ic('clock','w-3 h-3'):'')+'</button>'+
        '<span class="lp-ct">'+h(v)+'</span></div>';
    }).join('');
    var mau = s.mau ? '<div class="lp-sub">Mẫu nhanh</div><div class="lp-mau">'+s.mau+'</div>' : '';
    return '<div class="lp-step'+(xongBuoc?' done':'')+'">'+
      '<div class="lp-head"><span class="lp-num">'+(si+1)+'</span>'+
        '<div><div class="lp-tt">'+h(s.ten)+'</div><div class="lp-goal">'+h(s.muc)+'</div></div></div>'+
      '<div class="lp-sub">Việc cần làm</div>'+checks+
      '<div class="lp-sub">GITA Studio AI làm giúp</div><div class="lp-ai">'+ic('spark','w-4 h-4')+'<span>'+s.ai+'</span></div>'+
      mau+
      '<div class="lp-out">'+ic('arrow','w-3 h-3')+'Đầu ra: '+h(s.out)+'</div>'+
    '</div>';
  }

  G.VIEWS['lam-phim-10'] = function(){
    if(!(typeof G.can==='function' && G.can('qt_trang')))
      return U.lockCard('Chương trình làm phim mở cho Super Admin / Admin. Đăng nhập đúng vai để xem.');

    var d = demXong(); var pct = d.tong? Math.round(d.xong*100/d.tong):0;
    var buocXong = STEPS.filter(function(s,si){ return s.viec.every(function(_,i){ return (G.S.gdNV||{})['lp-'+si+':'+i]==='xong'; }); }).length;

    var o = U.ph({ eyebrow:'XƯỞNG PHIM AI · LÀM THEO LÀ RA PHIM', ic:'sparkle', grad:1,
      t:'Chương trình làm phim — 10 bước ra phim',
      lead:'Không phải bảng tra cứu — đây là chương trình làm theo. Đi lần lượt từ Bước 1 đến Bước 10 là có một phim 9:16 hoàn chỉnh. Mỗi bước có việc cần làm (tick khi xong), phần GITA Studio AI làm giúp, mẫu nhanh và đầu ra nối sang bước sau.' });

    o += '<div class="row mb" style="gap:8px;flex-wrap:wrap">'+
      '<button class="btn ghost sm" data-v="studio-he">'+ic('arrow','w-3 h-3')+'Hệ điều hành xưởng</button>'+
      '<button class="btn sm" data-v="ban-dung">'+ic('tools','w-3 h-3')+'Bàn dựng (biên tập tại máy)</button>'+
      (G.allowed && G.allowed('studio') ? '<button class="btn ghost sm" data-v="studio">'+ic('spark','w-3 h-3')+'Mở xưởng dựng video</button>' : '')+
      '</div>';

    o += '<div class="lp-prog"><div class="lp-prog-bar"><div class="lp-prog-fill" style="width:'+pct+'%"></div></div>'+
      '<span class="lp-prog-txt">'+buocXong+'/10 bước xong · '+d.xong+'/'+d.tong+' việc</span></div>';

    o += STEPS.map(veStep).join('');

    o += '<p class="tiny muted" style="margin-top:12px">'+ic('shield','w-3 h-3')+' Tick việc lưu trên máy anh/chị, giữ qua phiên — làm tới đâu nhớ tới đó. Phần AI dựng ngay tại thiết bị, không gửi hình/giọng/dữ liệu khách ra ngoài. Màn này không đụng xưởng dựng video (gói nghề · máy chủ).</p>';
    return o;
  };
})();
