/* ═══════════════════════════════════════════════════════════════
   GITA 365 — BỘ ĐIỀU KHIỂN SẢN XUẤT PHIM AI (xưởng phim AI · phần não)

   App GITA KHÔNG sinh video (việc đó ở notebook Kaggle · model mở). Màn
   này là BỘ ĐIỀU KHIỂN: giữ dàn nhân vật nhất quán, phân cảnh kịch bản,
   SINH PROMPT + FILE CẤU HÌNH chuẩn cho các công cụ free (SDXL + LoRA ·
   Wan I2V · VieNeu-TTS · InfiniteTalk), và theo dõi sản xuất từng cảnh/tập.

   Tải "cấu hình .json" → đưa vào notebook Kaggle để sinh. KHÔNG slideshow,
   KHÔNG ảnh mấp môi — mô tả cảnh người thật chuyển động. View: san-xuat-ai.
   Dữ liệu lưu qua phiên (axNV · axPhim). Mở cho qt_trang.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G; G.VIEWS = G.VIEWS || {};
(function(){
  var U = G.U, h = U.h, ic = U.ic;
  var TT = [ {k:'',t:'Chưa',c:'--ink-4'}, {k:'anh',t:'Ảnh xong',c:'--gita'},
             {k:'clip',t:'Clip xong',c:'--warn'}, {k:'lip',t:'Lip-sync',c:'#5140B4'}, {k:'rap',t:'Đã ráp',c:'--ok'} ];
  function ttOf(k){ for(var i=0;i<TT.length;i++) if(TT[i].k===k) return TT[i]; return TT[0]; }
  function uid(p){ return p+Math.random().toString(36).slice(2,8); }

  /* Vai · giới · độ tuổi · giọng theo giới+tuổi */
  var VAI = [['trainer','Trainer'],['mc','MC'],['dienvien','Diễn viên'],['phu','Vai phụ']];
  var GIOI = [['nam','Nam'],['nu','Nữ']];
  var TUOI = [['lon','Người lớn'],['teen','Thiếu niên'],['treem','Trẻ em']];
  function nhan(o,arr){ var f=arr.filter(function(x){return x[0]===o;})[0]; return f?f[1]:''; }
  function giongKey(gioi,tuoi){ return (gioi||'nam')+'-'+(tuoi||'lon'); }
  function coLora(l){ return !!(l && String(l).trim() && String(l).indexOf('chưa')<0 && String(l).indexOf('(')!==0); }
  function trigger(id){ return 'gita'+String(id||'').replace(/[^a-z0-9]/gi,'').toLowerCase(); }
  function giongTen(gioi,tuoi){ var m={ 'nam-lon':'Nam trầm ấm','nu-lon':'Nữ truyền cảm',
    'nam-teen':'Nam trẻ trong','nu-teen':'Nữ trẻ tươi','nam-treem':'Bé trai hồn nhiên','nu-treem':'Bé gái hồn nhiên' };
    return m[giongKey(gioi,tuoi)] || 'Nam trầm ấm'; }
  /* Ép chất lượng + chặn hoạt hình/người que/mấp môi */
  var QPROM = 'ảnh chụp thật, máy ảnh DSLR, 4K, nét căng, điện ảnh, ánh sáng tự nhiên, da người thật, chân dung nhất quán';
  var QNEG  = 'hoạt hình, anime, cartoon, hoạt hoạ, 2D, tranh vẽ, phác thảo, người que, hình que, ảnh tĩnh, mấp máy môi, mặt méo, biến dạng, thừa ngón tay, mờ nhoè, răng cưa, chất lượng thấp, sai tỉ lệ cơ thể';
  /* Khoá ngôn ngữ giọng · khoá phong cách không gian thương hiệu GITA */
  var NGON = [['vi','Tiếng Việt'],['en','Tiếng Anh']];
  var KGITA_STYLE = 'phong cách thương hiệu GITA365 cao cấp, sang trọng hiện đại, tông xanh dương và vàng gold, ánh sáng điện ảnh ấm, chất lượng điện ảnh';
  var KGITA_CANH  = 'sảnh hệ sinh thái giáo dục GITA365 sang trọng, bảng LED lớn phát sáng logo GITA365, sàn đá cẩm thạch bóng, cây xanh, nội thất hiện đại tông xanh dương – vàng gold';
  /* Bối cảnh chuẩn cho chương trình ĐÀO TẠO / COACH của GITA (khớp bộ ảnh Trainer) */
  var COACH_CANH = [
    ['','— chọn bối cảnh đào tạo / coach —'],
    ['Phòng hội thảo GITA sáng, hàng ghế gọn gàng, cửa kính, cây xanh, ánh sáng tự nhiên','Phòng hội thảo'],
    ['Bục giảng studio GITA, màn hình lớn phía sau, vách gỗ, ánh sáng điện ảnh ấm','Bục giảng studio'],
    ['Lớp học bảng trắng, không gian đào tạo hiện đại, cây xanh, ánh sáng tự nhiên','Lớp học bảng trắng'],
    ['Văn phòng điều hành GITA cao cấp, kệ sách gỗ, cửa kính nhìn thành phố, đèn ấm','Văn phòng điều hành'],
    ['Sân khấu sự kiện GITA, nền xanh dương – vàng gold, đèn sân khấu, mic cài tai','Sân khấu sự kiện'],
    ['Phòng coach 1-1 ấm cúng, ghế sofa, cây xanh, ánh sáng mềm','Phòng coach 1-1'],
    ['Phòng khách sang trọng, kệ sách, cây xanh, đèn ấm','Phòng khách']
  ];
  /* Động cơ sinh video. Giá = USD / giây video sinh ra, tra tháng 10/2026 từ bảng giá công khai
     của nhà cung cấp & cổng API (fal.ai, Kie.ai, WaveSpeed…) — giá đổi thường xuyên, kiểm lại khi mua.
     Động cơ MỞ: 0đ trên Kaggle free; "thue" = chi phí ƯỚC TÍNH nếu thuê GPU RTX 4090 (~$0.34/giờ). */
  var DONGCO = [
    ['auto','Theo phương án đã chọn'],
    ['wan','Wan 2.2 — mở · free · cảnh người thật chuyển động'],
    ['infinitetalk','InfiniteTalk — mở · free · người dẫn nói cả thân, khớp môi'],
    ['framepack','FramePack — mở · free · clip dài, GPU yếu'],
    ['ltx','LTX-Video — mở · free · nhanh, nháp'],
    ['cogvideox','CogVideoX — mở · free'],
    ['longcat','LongCat-Video — mở · MIT · cảnh dài, nối tiếp liền mạch (đi, chạy, tương tác)'],
    ['wan_animate','Wan 2.2 Animate — mở · diễn theo video động tác quay thật'],
    ['seedance','Seedance 1.0 Pro — API · rẻ · cảnh điện ảnh'],
    ['wan_api','Wan 2.2 A14B (fal.ai) — API · rẻ'],
    ['infinitetalk_api','InfiniteTalk (API) — rẻ · người dẫn nói'],
    ['kling','Kling 3.0 — API · cao cấp'],
    ['veo3fast','Veo 3.1 Fast — API · cao cấp, có tiếng'],
    ['veo3','Veo 3.1 Standard — API · đắt nhất'],
    ['heygen','HeyGen Digital Twin — API · người dẫn nói'],
    ['runway','Runway — API (chưa tra giá)']
  ];
  var GIA = { /* $ / giây video */
    seedance:0.03, wan_api:0.08, infinitetalk_api:0.06, kling:0.075, veo3fast:0.10, veo3:0.40, heygen:0.067, runway:null,
    /* động cơ mở: phút GPU 4090 cho 1 giây video (ước tính) → quy ra $ khi thuê */
    wan:1.2, infinitetalk:2.0, framepack:1.0, ltx:0.3, cogvideox:1.4, longcat:2.0, wan_animate:2.5 };
  var MO = ['wan','infinitetalk','framepack','ltx','cogvideox','longcat','wan_animate'];
  var GPU_GIO = 0.34, TY_GIA = 26000;   /* $/giờ RTX 4090 Runpod Community · đ/USD (xấp xỉ) */
  /* Máy GPU thuê theo giờ cho xưởng nội bộ. he = hệ số phút GPU so với 4090 (A100 80GB chạy được
     Wan 2.2 A14B 720p — chất cao hơn nhưng nặng hơn, nên mỗi giây video tốn nhiều phút hơn). */
  var GPU = { r4090:{ten:'RTX 4090 24GB', gio:0.34, he:1.0, chat:'Wan 2.2 TI2V-5B 720p · InfiniteTalk 480p'},
              a100:{ten:'A100 80GB', gio:1.19, he:1.5, chat:'Wan 2.2 A14B 720p (chất cao nhất bản mở) · InfiniteTalk 480p'} };
  var NGOAI_TOI_DA = 0.10;              /* Phương án D: thuê ngoài tối đa 10% thời lượng */
  function gpuCua(p){ return GPU[(p&&p.gpu)||'r4090'] || GPU.r4090; }
  function laMo(k){ return MO.indexOf(k)>=0; }
  function giaGiay(k,p){ var g=gpuCua(p); if(laMo(k)) return GIA[k]*g.he/60*g.gio; return GIA[k]; }   /* $ / giây */
  function heSoLam(c){ return (c.loai==='nguoi' && (c.thoai||'').trim()) ? 1.3 : 2.0; }  /* làm lại trung bình */
  /* Máy quay ảo nội bộ: cỡ cảnh · góc máy · chuyển động máy (di máy làm CHÍNH XÁC ở hậu kỳ trên video) */
  var MQ_CO = [['dac_ta','Đặc tả'],['can','Cận cảnh'],['trung','Trung cảnh'],['trung_rong','Trung rộng'],['toan','Toàn cảnh']];
  var MQ_GOC = [['ngang_mat','Ngang mắt'],['thap','Góc thấp (uy lực)'],['cao','Góc cao'],['qua_vai','Qua vai'],['nghieng','Nghiêng (kịch tính)']];
  var MQ_CHUYEN = [['tinh','Máy tĩnh'],['day_vao','Đẩy vào (dolly in)'],['keo_ra','Kéo ra (dolly out)'],['lia_trai','Lia trái'],
    ['lia_phai','Lia phải'],['nghieng_len','Nghiêng lên (tilt up)'],['nghieng_xuong','Nghiêng xuống'],['cam_tay','Cầm tay (sống động)'],
    ['zoom_giat','Zoom giật (crash zoom)'],
    /* nhóm dưới: mô hình tự quay trong không gian 3D (hậu kỳ không làm được) */
    ['bam_theo','✦ Bám theo nhân vật (tracking)'],['xoay_quanh','✦ Xoay vòng quanh (orbit)'],['cau_len','✦ Cẩu máy lên cao (crane)'],
    ['truot_ngang','✦ Trượt ngang có chiều sâu (truck)'],['dolly_zoom','✦ Dolly zoom (hiệu ứng Vertigo)'],['doi_net','✦ Đổi tiêu điểm (rack focus)'],
    ['fpv','✦ Flycam / FPV bay xuyên cảnh'],['ai','✦ Để mô hình tự chọn cách di máy']];
  var MQ_MO_HINH = ['bam_theo','xoay_quanh','cau_len','truot_ngang','dolly_zoom','doi_net','fpv','ai'];
  /* Hành động diễn viên — viết sẵn ngữ pháp chuyển động để mô hình diễn đúng cơ thể người thật */
  var HANH_DONG = [['','— tự mô tả ở ô dưới —'],['di_bo','Đi bộ về phía máy'],['di_ngang','Đi ngang khung hình'],['chay','Chạy'],
    ['ngoi_xuong','Ngồi xuống ghế'],['dung_len','Đứng dậy'],['cam_do','Cầm / nhấc đồ vật'],['dua_do','Trao đồ vật cho người kia'],
    ['bat_tay','Bắt tay'],['om','Ôm'],['tro_chuyen','Hai người trò chuyện'],['thuyet_trinh','Thuyết trình, tay chỉ màn hình'],
    ['rot_tra','Rót trà / cà phê'],['go_may','Gõ máy tính'],['vay_tay','Vẫy tay chào'],['gat_dau','Gật đầu lắng nghe']];
  var DONG_TAC = [['','Không — mô hình tự diễn'],['dien','Diễn theo video động tác mẫu (nhân vật làm y hệt)'],['thay','Thay người trong video quay thật (giữ nguyên bối cảnh thật)']];
  function mqMacDinh(c){ var noi=c&&c.loai==='nguoi'; return {co: noi?'trung':'toan', goc:'ngang_mat', chuyen: noi?'day_vao':'lia_phai', cuong:0.4}; }
  function mqCua(c){ return (c&&c.mq) ? c.mq : mqMacDinh(c); }
  function mqChu(c){ var m=mqCua(c); return [nhan(m.co,MQ_CO), nhan(m.goc,MQ_GOC), nhan(m.chuyen,MQ_CHUYEN)].filter(Boolean).join(' · '); }
  /* Dây chuyền hậu kỳ cao cấp (bật/tắt) */
  var HAUKY = [
    ['giuMat','Giữ & phục hồi khuôn mặt (GFPGAN v1.4)',true],
    ['napNet','Nâng nét 1080p+ (Real-ESRGAN)',true],
    ['muot60','Làm mượt 60fps (RIFE)',true],
    ['chinhMau','Chỉnh màu điện ảnh',true],
    ['khuNhieu','Khử nhiễu',false],
    ['onDinh','Ổn định khung (giảm rung)',false],
    ['masterGiong','Xử lý giọng chuẩn phát sóng (lọc ồn, cân tiếng, -14 LUFS)',true],
    ['khopGiong','Khớp chất giọng nhân vật (OpenVoice)',true],
    ['theTen','Thẻ tên nhân vật khi xuất hiện lần đầu',true],
    ['phuDe','Phụ đề tự động (chuẩn Reels dọc, 2 dòng ≤ 32 ký tự)',true],
    ['nhacNen','Nhạc nền (tự hạ khi có lời thoại)',true]
  ];
  function hauMacDinh(){ var o={}; HAUKY.forEach(function(x){o[x[0]]=x[2];}); return o; }
  function hauCua(p){ var d=hauMacDinh(); if(p&&p.hauKy) Object.keys(p.hauKy).forEach(function(k){ d[k]=p.hauKy[k]; }); return d; }
  function tenDC(k){ var f=DONGCO.filter(function(x){return x[0]===k;})[0]; return f?f[1]:k; }
  /* Định tuyến: cảnh chọn riêng > tập chọn > PHƯƠNG ÁN.
     A · Free: người dẫn nói → InfiniteTalk · cảnh > 6s → FramePack · còn lại → Wan 2.2.
     B · Tối ưu có phí: người dẫn nói → InfiniteTalk API · cảnh then chốt → Veo 3.1 Fast · còn lại → Seedance.
     C · Lai: người dẫn nói → InfiniteTalk tự chạy GPU thuê · cảnh → Seedance · then chốt → Veo 3.1 Fast.
     D · Nội bộ 90% (mặc định): mọi cảnh chạy model mở trên máy GITA; chỉ cảnh then chốt được thuê
         Veo 3.1 Fast, và chỉ khi tổng giây thuê ngoài vẫn ≤ 10% thời lượng tập (xét theo thứ tự cảnh). */
  function ngoaiDuocPhep(p){
    var tong=0, dung=0, ok={};
    (p.canh||[]).forEach(function(c){ tong+=(+c.giay||5); });
    (p.canh||[]).forEach(function(c){ var g=(+c.giay||5);
      if(c.hero && !(c.loai==='nguoi' && (c.thoai||'').trim()) && dung+g <= tong*NGOAI_TOI_DA){ ok[c.id]=1; dung+=g; } });
    return ok;
  }
  function chonDongCo(c,p,pa){
    var k = c.dongCo || (p&&p.dongCo) || 'auto';
    if(k!=='auto') return k;
    var noi = c.loai==='nguoi' && (c.thoai||'').trim();
    var P=(pa||(p&&p.phuongAn)||'D');
    if(P==='B'){ if(noi) return 'infinitetalk_api'; if(c.hero) return 'veo3fast'; return 'seedance'; }
    if(P==='C'){ if(noi) return 'infinitetalk'; if(c.hero) return 'veo3fast'; return 'seedance'; }
    if(P==='D'){
      if(c.dongTac) return 'wan_animate';                       /* có video động tác quay thật → diễn y hệt */
      if(noi) return 'infinitetalk';                            /* 1 hoặc 2 người nói */
      if(c.hero && ngoaiDuocPhep(p)[c.id]) return 'veo3fast';
      if((c.noiTiep || (+c.giay||5)>6) && gpuCua(p)===GPU.a100) return 'longcat';   /* cảnh dài / liền mạch */
      return 'wan'; }
    if(noi) return 'infinitetalk';
    return (+c.giay||5) > 6 ? 'framepack' : 'wan';
  }
  /* Dự toán một phương án cho tập hiện tại: $ thuê/API · giờ GPU (động cơ mở) · giây thành phẩm */
  function duToan(p,pa){
    var r={usd:0, gpuPhut:0, giay:0, chuaGia:0, giayNgoai:0};
    (p.canh||[]).forEach(function(c){
      var k=chonDongCo(pa?{id:c.id,dongCo:'',loai:c.loai,thoai:c.thoai,giay:c.giay,hero:c.hero,dongTac:c.dongTac,noiTiep:c.noiTiep}:c,p,pa);
      var g=(+c.giay||5), sinh=g*heSoLam(c); r.giay+=g;
      if(laMo(k)){ r.gpuPhut+=sinh*GIA[k]*gpuCua(p).he; r.usd+=sinh*giaGiay(k,p); }
      else { r.giayNgoai+=g; if(GIA[k]==null) r.chuaGia+=1; else r.usd+=sinh*GIA[k]; }
    });
    return r;
  }

  function initData(){
    if(!G.S.axNV){ G.S.axNV = [
      { id:'nv-trainer', ten:'Trainer Trương Nhật Quang', loai:'nguoi', vai:'trainer', gioi:'nam', tuoi:'lon', khoaMat:true,
        mota:'Nam trainer/giảng viên Á Đông ~35–40 tuổi, tóc ngắn đen gọn, đeo kính gọng đen, gương mặt điềm đạm trí tuệ, ánh mắt cuốn hút',
        phongCach:'phong thái tự tin, chuyên nghiệp, truyền cảm hứng; blazer lịch lãm (xám / navy / đỏ đô) phối sơ mi trắng hoặc polo tối màu',
        trangPhuc:'Blazer xám hoặc navy hoặc đỏ đô, sơ mi trắng (hoặc polo)', giong:'Nam trầm ấm', seed:'101', lora:'(chưa train)', ghiChu:'Trainer thương hiệu GITA · chương trình đào tạo & coach · KHOÁ MẶT + PHONG CÁCH (train LoRA nv-trainer)' },
      { id:'nv-mc', ten:'MC GITA (thương hiệu)', loai:'nguoi', vai:'mc', gioi:'nu', tuoi:'lon', khoaMat:true,
        mota:'Nữ MC thương hiệu GITA Á Đông ~28–30 tuổi, tóc dài gợn sóng nâu đen, gương mặt thanh tú, nụ cười rạng rỡ, khí chất sang trọng chuyên nghiệp, phù hiệu GITA trên ngực áo',
        trangPhuc:'Vest nữ kem/trắng thanh lịch (hoặc xanh nhạt), chân váy, giày cao gót', giong:'Nữ truyền cảm', seed:'202', lora:'(chưa train)', ghiChu:'MC dẫn chương trình & nhân vật phim · KHOÁ MẶT (train LoRA nv-mc)' },
      { id:'nv-bo', ten:'Bố', loai:'nguoi', vai:'dienvien', gioi:'nam', tuoi:'lon',
        mota:'Người bố Á Đông ~40 tuổi, tóc đen, gương mặt hiền, khoẻ khoắn',
        trangPhuc:'Sơ mi xanh nhạt, quần kaki', giong:'Nam trầm ấm', seed:'301', lora:'(chưa train)', ghiChu:'Nhân vật gia đình' },
      { id:'nv-me', ten:'Mẹ', loai:'nguoi', vai:'dienvien', gioi:'nu', tuoi:'lon',
        mota:'Người mẹ Á Đông ~38 tuổi, tóc nâu ngang vai, dịu dàng, ấm áp',
        trangPhuc:'Áo blouse kem', giong:'Nữ truyền cảm', seed:'302', lora:'(chưa train)', ghiChu:'Nhân vật gia đình' },
      { id:'nv-congai', ten:'Con gái (tuổi teen)', loai:'nguoi', vai:'dienvien', gioi:'nu', tuoi:'teen',
        mota:'Thiếu nữ Á Đông ~16 tuổi, tóc dài đen, tươi tắn, năng động',
        trangPhuc:'Áo thun tím, quần jeans', giong:'Nữ trẻ tươi', seed:'303', lora:'(chưa train)', ghiChu:'Nhân vật gia đình' },
      { id:'nv-contrai', ten:'Con trai (thiếu niên)', loai:'nguoi', vai:'dienvien', gioi:'nam', tuoi:'teen',
        mota:'Bé trai Á Đông ~11 tuổi, tóc đen, lanh lợi, vui vẻ',
        trangPhuc:'Áo polo xanh teal, quần short', giong:'Nam trẻ trong', seed:'304', lora:'(chưa train)', ghiChu:'Nhân vật gia đình' }
    ]; }
    if(!G.S.axPhim){ G.S.axPhim = [
      { id:'phim-1', ten:'Tập 1 — Hành trình GITA 365', mota:'Giới thiệu hành trình 5 tầng, dạng người dẫn + cảnh minh hoạ',
        ngonNgu:'vi', phongCachGita:true, dongCo:'auto', phuongAn:'D', gpu:'r4090', phutThang:20, hauKy:hauMacDinh(),
        canh:[
          { id:uid('c'), nvId:'nv-trainer', loai:'nguoi', bcId:'bc-bucgiang', boiCanh:'Bục giảng studio GITA, màn hình lớn phía sau, vách gỗ, ánh sáng điện ảnh ấm', may:'Trung cảnh, máy tĩnh ngang ngực', chuyenDong:'Đứng dẫn, cử động tay truyền cảm hứng, gật đầu nhẹ', thoai:'Chào anh chị, hành trình thịnh vượng của gia đình bắt đầu từ một quyết định.', giay:5, tt:'' },
          { id:uid('c'), nvId:'nv-mc', loai:'nguoi', boiCanh:'Trường quay sáng, màn hình lớn phía sau', may:'Trung cảnh, máy lia nhẹ sang phải', chuyenDong:'Đứng thuyết trình, tay chỉ về màn hình', thoai:'GITA đồng hành cùng gia đình qua năm tầng phát triển.', giay:5, tt:'' },
          { id:uid('c'), nvId:'nv-bo', loai:'canh', bcId:'bc-vuontre', boiCanh:'Vườn tre, cả gia đình cùng đi dạo trò chuyện', may:'Toàn cảnh, máy đi lùi theo bước chân', chuyenDong:'Cả nhà đi bộ, trò chuyện, cùng cười', thoai:'', giay:5, hero:true, tt:'' }
        ] }
    ]; }
    /* Nâng tập cũ (trước khi có xưởng nội bộ) lên phương án D · Nội bộ 90% — một lần */
    (G.S.axPhim||[]).forEach(function(p){ if(!p.gpu){ p.gpu='r4090'; p.phuongAn='D'; } });
    if(!G.S.axBC){ G.S.axBC = [
      {id:'bc-sanh', ten:'Sảnh hệ sinh thái GITA365', mota:KGITA_CANH, seed:'501'},
      {id:'bc-bucgiang', ten:'Bục giảng studio GITA', mota:'Bục giảng studio GITA, màn hình lớn phía sau, vách gỗ, ánh sáng điện ảnh ấm', seed:'502'},
      {id:'bc-hoithao', ten:'Phòng hội thảo GITA', mota:'Phòng hội thảo GITA sáng, hàng ghế gọn gàng, cửa kính, cây xanh, ánh sáng tự nhiên', seed:'503'},
      {id:'bc-lophoc', ten:'Lớp học bảng trắng', mota:'Lớp học bảng trắng, không gian đào tạo hiện đại, cây xanh, ánh sáng tự nhiên', seed:'504'},
      {id:'bc-vanphong', ten:'Văn phòng điều hành', mota:'Văn phòng điều hành GITA cao cấp, kệ sách gỗ, cửa kính nhìn thành phố, đèn ấm', seed:'505'},
      {id:'bc-sankhau', ten:'Sân khấu sự kiện GITA', mota:'Sân khấu sự kiện GITA, nền xanh dương – vàng gold, đèn sân khấu', seed:'506'},
      {id:'bc-coach', ten:'Phòng coach 1-1', mota:'Phòng coach 1-1 ấm cúng, ghế sofa, cây xanh, ánh sáng mềm', seed:'507'},
      {id:'bc-phongkhach', ten:'Phòng khách gia đình', mota:'Phòng khách gia đình sang trọng, sofa, kệ sách, cây xanh, nắng chiều ấm', seed:'508'},
      {id:'bc-vuontre', ten:'Vườn tre', mota:'Lối đi vườn tre xanh, nhà gỗ truyền thống phía xa, nắng xuyên lá', seed:'509'},
      {id:'bc-bep', ten:'Bếp gia đình', mota:'Bếp gia đình hiện đại, đảo bếp inox, rau củ tươi, cửa kính lớn, cây xanh', seed:'510'},
      {id:'bc-bien', ten:'Bãi biển hoàng hôn', mota:'Bãi biển hoàng hôn, sóng nhẹ, thành phố ven biển phía xa, cát vàng', seed:'511'}
    ].map(function(b){ b.lora='(chưa train)'; return b; }); }
    if(!G.S.axActive) G.S.axActive = G.S.axPhim[0].id;
    if(!G.S.axTab) G.S.axTab = 'nhanh';
  }
  function bcById(id){ return (G.S.axBC||[]).filter(function(x){return x.id===id;})[0]; }
  function nvById(id){ return (G.S.axNV||[]).filter(function(x){return x.id===id;})[0]; }
  function phimActive(){ return (G.S.axPhim||[]).filter(function(x){return x.id===G.S.axActive;})[0] || (G.S.axPhim||[])[0]; }
  function luu(){ if(G.save) G.save(); if(G.render) G.render(); }

  G.ax = G.ax || {};
  G.ax.tab = function(t){ G.S.axTab=t; if(G.render) G.render(); };

  /* ── NHÂN VẬT ── */
  function selOpts(arr,cur){ return arr.map(function(x){ return '<option value="'+x[0]+'"'+(x[0]===cur?' selected':'')+'>'+h(x[1])+'</option>'; }).join(''); }
  function formNV(nv){
    var e = nv||{id:'',ten:'',vai:'dienvien',gioi:'nam',tuoi:'lon',mota:'',trangPhuc:'',seed:'',lora:'',ghiChu:''};
    var ss='padding:8px;border:1px solid var(--line);border-radius:9px;width:100%;box-sizing:border-box';
    return '<h3 class="mb">'+(nv?'Sửa nhân vật':'Thêm nhân vật')+'</h3>'+
      '<div class="bd-field"><span>Tên vai</span><input type="text" id="f-ten" value="'+h(e.ten)+'"></div>'+
      '<div class="grid g3">'+
        '<div class="bd-field"><span>Vai trò</span><select id="f-vai" style="'+ss+'">'+selOpts(VAI,e.vai||'dienvien')+'</select></div>'+
        '<div class="bd-field"><span>Giới tính</span><select id="f-gioi" style="'+ss+'">'+selOpts(GIOI,e.gioi||'nam')+'</select></div>'+
        '<div class="bd-field"><span>Độ tuổi</span><select id="f-tuoi" style="'+ss+'">'+selOpts(TUOI,e.tuoi||'lon')+'</select></div>'+
      '</div>'+
      '<p class="bd-tip">Giọng tự chọn theo giới tính + độ tuổi (vd Nam người lớn → "Nam trầm ấm"). Dùng mẫu giọng <b>giong/&lt;giới-tuổi&gt;.wav</b> trong bộ cast. Hay nhất: Trainer/MC <b>thu âm thật</b> từng câu thoại → đặt <b>thu-am/&lt;mã cảnh&gt;.wav</b>, động cơ dùng thẳng giọng thật.</p>'+
      '<div class="bd-field"><span>Mô tả ngoại hình (giữ nhân vật nhất quán)</span><textarea id="f-mota" rows="3" style="'+ss+'">'+h(e.mota)+'</textarea></div>'+
      '<div class="bd-field"><span>Phong cách (thần thái + wardrobe — khoá chất riêng)</span><input type="text" id="f-phongcach" value="'+h(e.phongCach||'')+'" placeholder="VD: tự tin, truyền cảm hứng; blazer xám/navy/đỏ đô phối sơ mi"></div>'+
      '<div class="bd-field"><span>Trang phục mặc định</span><input type="text" id="f-tp" value="'+h(e.trangPhuc)+'"></div>'+
      '<div class="grid g2"><div class="bd-field"><span>Seed (giữ khuôn mặt)</span><input type="text" id="f-seed" value="'+h(e.seed)+'"></div>'+
      '<div class="bd-field"><span>Tên LoRA (nếu có)</span><input type="text" id="f-lora" value="'+h(e.lora)+'"></div></div>'+
      '<div class="bd-field"><label style="display:flex;gap:8px;align-items:center;font-size:12.5px;color:var(--ink-2)"><input type="checkbox" id="f-khoamat"'+(e.khoaMat?' checked':'')+'> Khoá mặt (nhân vật thương hiệu — train LoRA để ra đúng một gương mặt)</label></div>'+
      '<div class="bd-field"><span>Ghi chú</span><input type="text" id="f-gc" value="'+h(e.ghiChu)+'"></div>'+
      '<div class="row mt" style="gap:8px"><button class="btn" onclick="G.ax.nvLuu(\''+(e.id||'')+'\')">Lưu</button>'+
      '<button class="btn ghost" onclick="U.closeModal()">Huỷ</button></div>';
  }
  G.ax.nvThem = function(){ U.modal(formNV(null)); };
  G.ax.nvSuaMo = function(id){ U.modal(formNV(nvById(id))); };
  G.ax.nvLuu = function(id){
    function v(x){ var el=document.getElementById(x); return el?(el.value||'').trim():''; }
    var gioi=v('f-gioi')||'nam', tuoi=v('f-tuoi')||'lon';
    var o = { ten:v('f-ten')||'Nhân vật', vai:v('f-vai')||'dienvien', gioi:gioi, tuoi:tuoi, loai:'nguoi',
      mota:v('f-mota'), phongCach:v('f-phongcach'), trangPhuc:v('f-tp'), giong:giongTen(gioi,tuoi), seed:v('f-seed'), lora:v('f-lora'),
      khoaMat:!!(document.getElementById('f-khoamat')||{}).checked, ghiChu:v('f-gc') };
    if(id){ var nv=nvById(id); if(nv) Object.assign(nv,o); }
    else { o.id=uid('nv'); G.S.axNV.push(o); }
    U.closeModal(); luu();
  };
  G.ax.nvXoa = function(id){ G.S.axNV = G.S.axNV.filter(function(x){return x.id!==id;}); luu(); };

  /* ── PHIM / TẬP ── */
  G.ax.phimChon = function(id){ G.S.axActive=id; if(G.render) G.render(); };
  G.ax.phimNgon = function(v){ var p=phimActive(); if(p){ p.ngonNgu=v; luu(); } };
  G.ax.phimGita = function(){ var p=phimActive(); if(p){ p.phongCachGita = (p.phongCachGita===false); luu(); } };
  G.ax.phuongAn = function(v){ var p=phimActive(); if(p){ p.phuongAn=v; p.dongCo='auto'; luu(); } };
  G.ax.gpu = function(v){ var p=phimActive(); if(p && GPU[v]){ p.gpu=v; luu(); } };
  G.ax.phutThang = function(v){ var p=phimActive(); if(p){ p.phutThang=Math.max(1,Math.min(600,+v||20)); luu(); } };
  G.ax.phimDongCo = function(v){ var p=phimActive(); if(p){ p.dongCo=v; luu(); } };
  G.ax.hauToggle = function(k){ var p=phimActive(); if(!p) return; p.hauKy=hauCua(p); p.hauKy[k]=!p.hauKy[k]; luu(); };
  G.ax.bcMo = function(id){
    var b = id ? bcById(id) : {id:'',ten:'',mota:'',seed:'',lora:'(chưa train)'};
    U.modal('<h3 class="mb">'+(id?'Sửa phim trường':'Thêm phim trường')+'</h3>'+
      '<div class="bd-field"><span>Tên phim trường</span><input type="text" id="f-bten" value="'+h(b.ten)+'"></div>'+
      '<div class="bd-field"><span>Mô tả bối cảnh (cố định cho mọi cảnh quay ở đây)</span><textarea id="f-bmota" rows="3" style="padding:8px;border:1px solid var(--line);border-radius:9px;width:100%;box-sizing:border-box">'+h(b.mota)+'</textarea></div>'+
      '<div class="grid g2"><div class="bd-field"><span>Seed</span><input type="text" id="f-bseed" value="'+h(b.seed)+'"></div>'+
      '<div class="bd-field"><span>LoRA phim trường (id sau khi train)</span><input type="text" id="f-blora" value="'+h(b.lora)+'"></div></div>'+
      '<p class="bd-tip">Train LoRA phim trường giống train nhân vật: 15–30 ảnh của bối cảnh → <code>train_lora.py --nhan-vat '+h(b.id||'bc-...')+'</code>.</p>'+
      '<div class="row mt" style="gap:8px"><button class="btn" onclick="G.ax.bcLuu(\''+(b.id||'')+'\')">Lưu</button><button class="btn ghost" onclick="U.closeModal()">Huỷ</button></div>');
  };
  G.ax.bcLuu = function(id){
    function v(x){ var el=document.getElementById(x); return el?(el.value||'').trim():''; }
    var o={ ten:v('f-bten')||'Phim trường', mota:v('f-bmota'), seed:v('f-bseed'), lora:v('f-blora')||'(chưa train)' };
    if(id){ Object.assign(bcById(id),o); } else { o.id=uid('bc-'); G.S.axBC.push(o); }
    U.closeModal(); luu();
  };
  G.ax.bcXoa = function(id){ G.S.axBC=G.S.axBC.filter(function(x){return x.id!==id;}); luu(); };
  G.ax.canhKgita = function(){ var el=document.getElementById('f-bc'); if(el) el.value=KGITA_CANH; };
  G.ax.phimThem = function(){
    U.modal('<h3 class="mb">Thêm tập phim</h3>'+
      '<div class="bd-field"><span>Tên tập</span><input type="text" id="f-pten" placeholder="VD: Tập 2 — Tầng Nền"></div>'+
      '<div class="bd-field"><span>Mô tả</span><input type="text" id="f-pmota"></div>'+
      '<div class="row mt" style="gap:8px"><button class="btn" onclick="G.ax.phimLuu()">Tạo tập</button><button class="btn ghost" onclick="U.closeModal()">Huỷ</button></div>');
  };
  G.ax.phimLuu = function(){
    var t=(document.getElementById('f-pten')||{}).value||'Tập mới';
    var m=(document.getElementById('f-pmota')||{}).value||'';
    var p={id:uid('phim'),ten:t.trim(),mota:m.trim(),ngonNgu:'vi',phongCachGita:true,dongCo:'auto',phuongAn:'D',gpu:'r4090',phutThang:20,hauKy:hauMacDinh(),canh:[]}; G.S.axPhim.push(p); G.S.axActive=p.id;
    U.closeModal(); luu();
  };
  G.ax.phimXoa = function(id){ if(G.S.axPhim.length<=1) return U.toast('Giữ lại ít nhất một tập.','err');
    G.S.axPhim=G.S.axPhim.filter(function(x){return x.id!==id;}); if(G.S.axActive===id) G.S.axActive=G.S.axPhim[0].id; luu(); };

  /* ── CẢNH ── */
  function formCanh(c){
    var e=c||{id:'',nvId:(G.S.axNV[0]||{}).id,loai:'nguoi',boiCanh:'',may:'',chuyenDong:'',thoai:'',giay:5};
    var opts=(G.S.axNV||[]).map(function(n){return '<option value="'+n.id+'"'+(n.id===e.nvId?' selected':'')+'>'+h(n.ten)+'</option>';}).join('');
    return '<h3 class="mb">'+(c?'Sửa cảnh':'Thêm cảnh')+'</h3>'+
      '<div class="grid g2"><div class="bd-field"><span>Nhân vật</span><select id="f-nv" style="padding:8px;border:1px solid var(--line);border-radius:9px">'+opts+'</select></div>'+
      '<div class="bd-field"><span>Loại cảnh</span><div class="bd-seg"><button type="button" class="'+(e.loai==='nguoi'?'on':'')+'" onclick="this.parentNode.querySelectorAll(\'button\').forEach(function(b){b.classList.remove(\'on\')});this.classList.add(\'on\');window.__cloai=\'nguoi\'">Người dẫn nói</button><button type="button" class="'+(e.loai==='canh'?'on':'')+'" onclick="this.parentNode.querySelectorAll(\'button\').forEach(function(b){b.classList.remove(\'on\')});this.classList.add(\'on\');window.__cloai=\'canh\'">Cảnh diễn</button></div></div></div>'+
      '<div class="bd-field"><span>Bối cảnh</span><input type="text" id="f-bc" value="'+h(e.boiCanh)+'" placeholder="VD: trường quay sáng, màn hình lớn">'+
        '<div class="row" style="gap:6px;margin-top:6px;flex-wrap:wrap"><select id="f-bcid" onchange="var b=(G.S.axBC||[]).filter(function(x){return x.id===this.value;},this)[0]; if(b)document.getElementById(\'f-bc\').value=b.mota;" style="padding:7px;border:1px solid var(--line);border-radius:9px">'+
          '<option value="">— phim trường nội bộ —</option>'+(G.S.axBC||[]).map(function(x){return '<option value="'+x.id+'"'+(e.bcId===x.id?' selected':'')+'>🏛 '+h(x.ten)+(coLora(x.lora)?' · LoRA':'')+'</option>';}).join('')+'</select>'+
          '<button type="button" class="btn ghost sm" onclick="G.ax.canhKgita()">+ Không gian GITA</button></div></div>'+
      (function(){ var m=mqCua(e.id?e:{loai:'nguoi'}); var ss='padding:8px;border:1px solid var(--line);border-radius:9px;width:100%;box-sizing:border-box';
        function sel(id,arr,v){ return '<select id="'+id+'" style="'+ss+'">'+arr.map(function(x){return '<option value="'+x[0]+'"'+(x[0]===v?' selected':'')+'>'+h(x[1])+'</option>';}).join('')+'</select>'; }
        return '<div class="bd-field"><span>🎥 Máy quay ảo nội bộ</span><div class="grid g3">'+
          '<div>'+sel('f-mq-co',MQ_CO,m.co)+'</div><div>'+sel('f-mq-goc',MQ_GOC,m.goc)+'</div><div>'+sel('f-mq-ch',MQ_CHUYEN,m.chuyen)+'</div></div>'+
          '<div class="row" style="gap:8px;align-items:center;margin-top:6px"><span class="tiny muted">Biên độ di máy</span>'+
          '<input type="range" id="f-mq-cuong" min="0" max="1" step="0.1" value="'+(m.cuong!=null?m.cuong:0.4)+'" style="flex:1"></div>'+
          '<input type="text" id="f-may" value="'+h(e.may||'')+'" placeholder="Ghi chú thêm cho máy quay (tuỳ chọn)" style="margin-top:6px">'+
          '<p class="bd-tip" style="margin-top:4px">Di máy thường làm chính xác ở hậu kỳ. Mục có dấu ✦ (bám theo, xoay vòng, cẩu, dolly zoom, flycam…) do mô hình quay trong không gian 3D.</p></div>'; })()+
      (function(){ var ss='padding:8px;border:1px solid var(--line);border-radius:9px;width:100%;box-sizing:border-box';
        function sel(id,arr,v){ return '<select id="'+id+'" style="'+ss+'">'+arr.map(function(x){return '<option value="'+x[0]+'"'+(x[0]===(v||'')?' selected':'')+'>'+h(x[1])+'</option>';}).join('')+'</select>'; }
        var nv2=[['','— không có —']].concat((G.S.axNV||[]).map(function(n){return [n.id,n.ten];}));
        return '<div class="bd-field"><span>🎬 Diễn xuất</span><div class="grid g2">'+
            '<div>'+sel('f-hd',HANH_DONG,e.hanhDong)+'</div>'+
            '<div><input type="text" id="f-dovat" value="'+h(e.doVat||'')+'" placeholder="Đồ vật (VD: tách trà, cuốn sách)" style="'+ss+'"></div></div>'+
          '<input type="text" id="f-cd" value="'+h(e.chuyenDong)+'" placeholder="Mô tả thêm chuyển động (VD: vừa đi vừa nhìn sang người bên cạnh)" style="margin-top:6px"></div>'+
          '<div class="bd-field"><span>👥 Diễn viên thứ hai trong cảnh (tương tác nhiều người)</span>'+sel('f-nv2',nv2,e.nv2Id)+'</div>'+
          '<div class="bd-field"><span>📱 Video động tác quay thật (máy quay nội bộ)</span>'+sel('f-dt',DONG_TAC,e.dongTac)+
            '<p class="bd-tip" style="margin-top:4px">Quay người thật làm động tác bằng điện thoại → đặt tệp <b>dong-tac/'+h(e.id||'&lt;mã cảnh&gt;')+'.mp4</b>. Nhân vật GITA sẽ diễn y hệt (đi, chạy, ngồi, cầm đồ vật). Cần máy A100.</p></div>'+
          '<div class="bd-field"><label style="display:flex;gap:8px;align-items:center;font-size:12.5px;color:var(--ink-2)"><input type="checkbox" id="f-noitiep"'+(e.noiTiep?' checked':'')+'> Nối tiếp liền mạch từ cảnh trước (giữ nguyên người, tư thế, ánh sáng)</label></div>'; })()+
      '<div class="bd-field"><span>Thoại (để trống nếu cảnh không lời)</span><textarea id="f-thoai" rows="2">'+h(e.thoai)+'</textarea></div>'+
      '<div class="bd-field"><span>Thoại của diễn viên thứ hai (nói sau, nếu có)</span><textarea id="f-thoai2" rows="2">'+h(e.thoai2||'')+'</textarea></div>'+
      '<div class="bd-field"><span>Thời lượng (giây)</span><input type="number" id="f-giay" min="2" max="30" value="'+(e.giay||5)+'" style="width:90px"> <span class="tiny muted">tối đa 30s · trên 6s dùng LongCat nối đoạn (máy A100)</span></div>'+
      '<div class="bd-field"><span>Động cơ cho cảnh này (để trống = theo tập)</span><select id="f-dongco" style="padding:8px;border:1px solid var(--line);border-radius:9px">'+
        '<option value="">— theo cài đặt của tập —</option>'+DONGCO.map(function(x){return '<option value="'+x[0]+'"'+(e.dongCo===x[0]?' selected':'')+'>'+h(x[1])+'</option>';}).join('')+'</select></div>'+
      '<div class="bd-field"><label style="display:flex;gap:8px;align-items:center;font-size:12.5px;color:var(--ink-2)"><input type="checkbox" id="f-hero"'+(e.hero?' checked':'')+'> Cảnh then chốt (B/C: thuê Veo 3.1 Fast · D: chỉ thuê khi còn trong trần 10%)</label></div>'+
      '<div class="row mt" style="gap:8px"><button class="btn" onclick="G.ax.canhLuu(\''+(e.id||'')+'\')">Lưu</button><button class="btn ghost" onclick="U.closeModal()">Huỷ</button></div>';
  }
  G.ax.canhThem = function(){ window.__cloai='nguoi'; U.modal(formCanh(null)); };
  G.ax.canhSuaMo = function(id){ var p=phimActive(); var c=p.canh.filter(function(x){return x.id===id;})[0]; window.__cloai=c.loai; U.modal(formCanh(c)); };
  G.ax.canhLuu = function(id){
    function v(x){var el=document.getElementById(x);return el?el.value:'';}
    var o={ nvId:v('f-nv'), loai:window.__cloai||'nguoi', boiCanh:v('f-bc').trim(), may:v('f-may').trim(),
      bcId:v('f-bcid'),
      mq:{ co:v('f-mq-co')||'trung', goc:v('f-mq-goc')||'ngang_mat', chuyen:v('f-mq-ch')||'tinh', cuong:+(v('f-mq-cuong')||0.4) },
      chuyenDong:v('f-cd').trim(), thoai:v('f-thoai').trim(), giay:Math.max(2,Math.min(30,+v('f-giay')||5)), dongCo:v('f-dongco'), hero:!!(document.getElementById('f-hero')||{}).checked,
      hanhDong:v('f-hd'), doVat:v('f-dovat').trim(), nv2Id:v('f-nv2'), thoai2:v('f-thoai2').trim(), dongTac:v('f-dt'),
      noiTiep:!!(document.getElementById('f-noitiep')||{}).checked };
    if(o.nv2Id===o.nvId) o.nv2Id='';
    var p=phimActive();
    if(id){ var c=p.canh.filter(function(x){return x.id===id;})[0]; if(c) Object.assign(c,o); }
    else { o.id=uid('c'); o.tt=''; p.canh.push(o); }
    U.closeModal(); luu();
  };
  G.ax.canhXoa = function(id){ var p=phimActive(); p.canh=p.canh.filter(function(x){return x.id!==id;}); luu(); };
  G.ax.canhDoi = function(id,d){ var p=phimActive(), i=p.canh.findIndex(function(x){return x.id===id;}); var j=i+d;
    if(i<0||j<0||j>=p.canh.length) return; var t=p.canh[i]; p.canh[i]=p.canh[j]; p.canh[j]=t; luu(); };
  G.ax.canhTT = function(id){ var p=phimActive(), c=p.canh.filter(function(x){return x.id===id;})[0]; if(!c) return;
    var i=TT.findIndex(function(t){return t.k===(c.tt||'');}); c.tt=TT[(i+1)%TT.length].k; luu(); };

  /* ── SINH PROMPT ── */
  function promptCanh(c){
    var nv=nvById(c.nvId)||{};
    var noi = c.loai==='nguoi' && (c.thoai||'').trim();
    var m = mqCua(c);
    var nv2 = c.nv2Id ? nvById(c.nv2Id) : null;
    var img = [nv.mota, nv.phongCach, nv.trangPhuc, nv2 ? 'cùng '+[nv2.mota,nv2.trangPhuc].filter(Boolean).join(', ') : '', c.boiCanh, nhan(c.hanhDong||'',HANH_DONG)&&c.hanhDong ? nhan(c.hanhDong,HANH_DONG) : '', nhan(m.co,MQ_CO), nhan(m.goc,MQ_GOC), c.may, 'khung dọc 9:16', QPROM].filter(Boolean).join(', ');
    if(coLora(nv.lora)) img = trigger(nv.id)+', '+img;   /* từ khoá LoRA khoá đúng mặt */
    if((phimActive()||{}).phongCachGita!==false) img = img + ', ' + KGITA_STYLE;  /* khoá phong cách không gian GITA */
    var hd = c.hanhDong ? nhan(c.hanhDong,HANH_DONG) + (c.doVat?' ('+c.doVat+')':'') : '';
    var vid = [hd, c.chuyenDong||(hd?'':'(giữ tư thế tự nhiên)'),
      nv2 ? 'tương tác tự nhiên với '+(nv2.ten||'người thứ hai')+', ánh mắt nhìn nhau' : '',
      noi?'đang nói, khẩu hình khớp lời, cử động đầu và tay tự nhiên':'diễn theo cảnh, cơ thể chuyển động tự nhiên, tay cầm đồ vật đúng',
      MQ_MO_HINH.indexOf(m.chuyen)>=0 ? 'máy quay: '+nhan(m.chuyen,MQ_CHUYEN).replace('✦ ','') : 'máy giữ yên (di máy làm ở hậu kỳ)',
      c.noiTiep ? 'nối tiếp liền mạch từ cảnh trước' : '',
      'chuyển động mượt, sắc nét, người thật, không hoạt hình', (c.giay||5)+' giây'].filter(Boolean).join(', ');
    return {img:img, vid:vid, neg:QNEG};
  }
  function configPhim(){
    var p=phimActive();
    return {
      phim:{ id:p.id, ten:p.ten, mota:p.mota },
      ngon_ngu: p.ngonNgu||'vi',
      dong_co: p.dongCo||'auto',
      phuong_an: p.phuongAn||'D', gpu: (p.gpu||'r4090'), ngoai_toi_da: (p.phuongAn||'D')==='D' ? NGOAI_TOI_DA : 1,
      hau_ky: hauCua(p),
      cam:['khong-hoat-hinh','khong-nguoi-que','khong-anh-tinh-map-moi','phai-nguoi-that-chuyen-dong-sac-net'],
      chuan:{ negative_chung:QNEG, phong_cach:'ảnh thật điện ảnh 9:16, nét căng, khớp khẩu hình với giọng',
        phong_cach_gita: p.phongCachGita!==false, phong_cach_khong_gian:KGITA_STYLE },
      pipeline:{ anh:'sdxl_lora', i2v:'wan2.2 · longcat · wan_animate', tts:'thu_am · vieneu · chatterbox + openvoice', lipsync:'infinitetalk', nang_net:'gfpgan_realesrgan', muot:'rife', phu_de:'ass_tu_thoai', the_ten:'ass', rap:'ffmpeg_loudnorm_-14', khung:'1080x1920', fps_xuat:(hauCua(p).muot60?60:30) },
      nhan_vat: (G.S.axNV||[]).map(function(n){ return {id:n.id,ten:n.ten,vai:n.vai,gioi:n.gioi,tuoi:n.tuoi,loai:n.loai,
        mo_ta:n.mota,phong_cach:n.phongCach,trang_phuc:n.trangPhuc,giong:n.giong,giong_key:giongKey(n.gioi,n.tuoi),seed:n.seed,
        lora:n.lora, co_lora:coLora(n.lora), trigger:trigger(n.id), khoa_mat:!!n.khoaMat}; }),
      canh: p.canh.map(function(c,i){ var pr=promptCanh(c); var nv=nvById(c.nvId)||{};
        return { thu_tu:i+1, id:c.id, nhan_vat:c.nvId, loai:c.loai, boi_canh:c.boiCanh, may_quay:c.may, may_quay_ao:mqCua(c),
          boi_canh_id:c.bcId||'', boi_canh_lora:!!(bcById(c.bcId)&&coLora(bcById(c.bcId).lora)), boi_canh_trigger:c.bcId?trigger(c.bcId):'',
          prompt_anh:pr.img, prompt_video:pr.vid, negative:pr.neg, thoai:c.thoai,
          giong:nv.giong, giong_key:giongKey(nv.gioi,nv.tuoi), seed:nv.seed,
          lora:nv.lora, co_lora:coLora(nv.lora), trigger:trigger(nv.id), khoa_mat:!!nv.khoaMat,
          ngon_ngu: p.ngonNgu||'vi',
          dong_co: chonDongCo(c, p), hero: !!c.hero,
          giay:c.giay||5, lip_sync: c.loai==='nguoi' && !!(c.thoai&&c.thoai.trim()), trang_thai:c.tt||'',
          hanh_dong:c.hanhDong||'', do_vat:c.doVat||'', noi_tiep:!!c.noiTiep, dong_tac:c.dongTac||'',
          nv_phu: (function(){ var n=c.nv2Id?nvById(c.nv2Id):null; return n ? {id:n.id, ten:n.ten, vai:n.vai, mo_ta:n.mota, trang_phuc:n.trangPhuc,
            giong_key:giongKey(n.gioi,n.tuoi), co_lora:coLora(n.lora), trigger:trigger(n.id)} : null; })(),
          thoai2: c.nv2Id ? (c.thoai2||'') : '' }; })
    };
  }
  G.ax.taiConfig = function(){
    try{ var cfg=configPhim(); var a=document.createElement('a');
      a.download='gita-phim-'+(phimActive().id)+'.json';
      a.href='data:application/json;charset=utf-8,'+encodeURIComponent(JSON.stringify(cfg,null,2)); a.click();
      U.toast('Đã tải cấu hình .json cho notebook Kaggle.','ok');
    }catch(e){ U.toast('Lỗi xuất cấu hình: '+(e&&e.message),'err'); }
  };

  /* ════════ CHẠY TỰ ĐỘNG (Worker → GitHub → Kaggle → R2) ════════ */
  var tdTimer=null;
  function lsGet(k){ try{ return window.localStorage.getItem(k)||''; }catch(e){ return ''; } }
  function lsSet(k,v){ try{ window.localStorage.setItem(k,v); }catch(e){} }
  function tdCfg(){ return { worker:lsGet('axWorker').replace(/\/+$/,''), token:lsGet('axToken'), job:lsGet('axJob') }; }
  var TDT = { queued:{t:'Đang xếp hàng',c:'--ink-4'}, running:{t:'Đang dựng…',c:'--warn'}, done:{t:'Xong',c:'--ok'}, error:{t:'Lỗi',c:'--gita-do-ink'} };

  G.ax.tdLuuCaiDat = function(){
    var w=(document.getElementById('f-worker')||{}).value||'';
    var t=(document.getElementById('f-token')||{}).value||'';
    lsSet('axWorker', w.trim()); lsSet('axToken', t.trim());
    U.toast('Đã lưu cài đặt tự động trên máy.','ok'); if(G.render) G.render();
  };
  G.ax.tdGui = function(){
    var cf=tdCfg(); if(!cf.worker||!cf.token){ U.toast('Chưa có URL Worker / mật khẩu.','err'); return; }
    var cfg=configPhim();
    G.ax.tdSetUI('queued','Đang gửi lên Worker…','');
    fetch(cf.worker+'/api/phim',{ method:'POST', headers:{'content-type':'application/json','x-gita-token':cf.token}, body:JSON.stringify({config:cfg}) })
      .then(function(r){ return r.json(); })
      .then(function(d){ if(d.jobid){ lsSet('axJob',d.jobid); G.ax.tdTheoDoi(d.jobid); U.toast('Đã gửi. Mã job: '+d.jobid,'ok'); }
        else { G.ax.tdSetUI('error', d.loi||'Gửi thất bại', ''); } })
      .catch(function(e){ G.ax.tdSetUI('error','Không gọi được Worker: '+(e&&e.message),''); });
  };
  G.ax.tdTheoDoi = function(jobid){
    var cf=tdCfg(); if(!cf.worker||!jobid) return;
    if(tdTimer) clearInterval(tdTimer);
    function tick(){
      fetch(cf.worker+'/api/phim/'+jobid).then(function(r){return r.json();}).then(function(s){
        G.ax.tdSetUI(s.trangThai||'running', s.buoc||'', s.phim?jobid:'');
        if(s.trangThai==='done'||s.trangThai==='error'){ if(tdTimer){clearInterval(tdTimer);tdTimer=null;} }
      }).catch(function(){});
    }
    tick(); tdTimer=setInterval(tick, 8000);
  };
  G.ax.tdSetUI = function(tt,buoc,jobForVideo){
    var box=document.getElementById('ax-td-status'); if(!box) return;
    var m=TDT[tt]||TDT.running; var cf=tdCfg();
    var vid = (tt==='done'&&jobForVideo)?
      '<div class="mt"><video src="'+h(cf.worker+'/api/phim/'+jobForVideo+'/video')+'" controls style="width:100%;max-width:320px;border-radius:12px;background:#000"></video>'+
      '<div class="row mt" style="gap:8px"><a class="btn sm" href="'+h(cf.worker+'/api/phim/'+jobForVideo+'/video')+'" target="_blank" rel="noopener">Tải / mở phim</a></div></div>' : '';
    box.innerHTML = '<div class="row" style="gap:8px;align-items:center"><span class="gd-den" style="--m:var('+m.c+')"></span>'+
      '<b style="color:var('+m.c+')">'+h(m.t)+'</b></div>'+
      '<p class="sm muted" style="margin-top:4px">'+h(buoc||'')+'</p>'+vid;
  };

  /* ════════ GIAO DIỆN ════════ */
  function tabBtn(k,t){ return '<button class="btn sm '+(G.S.axTab===k?'':'ghost')+'" onclick="G.ax.tab(\''+k+'\')">'+h(t)+'</button>'; }

  function veTuDong(){
    var cf=tdCfg();
    var o=U.sec('Chạy tự động','Gửi một cái là Cloudflare → GitHub → Kaggle tự dựng ra phim, hiện lại ở đây');
    if(!cf.worker || !cf.token){
      o += '<div class="card pad-sm"><b class="sm">Cài đặt kết nối (một lần)</b>'+
        '<p class="bd-tip">Dán URL Worker và mật khẩu (SUBMIT_TOKEN) đã tạo theo hướng dẫn xuong-phim-ai/tu-dong. Lưu trên máy anh/chị, không đẩy lên mạng.</p>'+
        '<div class="bd-field"><span>URL Worker</span><input type="text" id="f-worker" value="'+h(cf.worker)+'" placeholder="https://gita-xuong-phim.xxx.workers.dev"></div>'+
        '<div class="bd-field"><span>Mật khẩu gửi (SUBMIT_TOKEN)</span><input type="password" id="f-token" value="'+h(cf.token)+'"></div>'+
        '<div class="row mt"><button class="btn sm" onclick="G.ax.tdLuuCaiDat()">Lưu cài đặt</button></div></div>';
      return o;
    }
    o += '<div class="row mb" style="gap:8px;flex-wrap:wrap">'+
      '<button class="btn" onclick="G.ax.tdGui()">'+ic('spark','w-3 h-3')+'Gửi sản xuất tự động</button>'+
      '<button class="btn ghost sm" onclick="(function(){try{localStorage.removeItem(\'axWorker\')}catch(e){}; if(G.render)G.render();})()">Sửa cài đặt</button>'+
      '<span class="bd-chip">Worker: đã kết nối</span></div>';
    o += '<div class="card pad-sm" id="ax-td-status"><p class="sm muted">Chưa gửi tập nào. Bấm "Gửi sản xuất tự động" để bắt đầu.</p></div>';
    o += '<p class="bd-tip" style="margin-top:8px">Dây chuyền: Web → Cloudflare Worker → GitHub Action → Kaggle (GPU, model mở) → phim về R2 → hiện ở đây. Mỗi phim mất ~30 phút đến vài giờ tuỳ hàng đợi Kaggle.</p>';
    return o;
  }

  function veNhanVat(){
    var o=U.sec('Kho nhân vật','Giữ đúng một dàn người qua mọi tập — nhất quán như bộ ảnh mẫu')+
      '<div class="row mb"><button class="btn sm" onclick="G.ax.nvThem()">'+ic('spark','w-3 h-3')+'Thêm nhân vật</button></div>';
    o += '<div class="grid g2">'+ (G.S.axNV||[]).map(function(n){
      return '<div class="card pad-sm"><div class="row" style="justify-content:space-between"><b>'+h(n.ten)+'</b>'+
        '<span class="bd-chip">'+h(nhan(n.vai,VAI)||'Diễn viên')+'</span></div>'+
        '<div class="bd-chips" style="margin:5px 0"><span class="bd-chip">'+h(nhan(n.gioi,GIOI)||'—')+'</span><span class="bd-chip">'+h(nhan(n.tuoi,TUOI)||'—')+'</span>'+
          (n.khoaMat?'<span class="bd-chip" style="border-color:var(--gita);color:var(--gita)">🔒 Khoá mặt'+(coLora(n.lora)?'':' · chưa train LoRA')+'</span>':'')+'</div>'+
        '<p class="sm muted" style="line-height:1.5;margin:6px 0">'+h(n.mota)+'</p>'+
        '<p class="tiny muted">👔 '+h(n.trangPhuc||'—')+'</p>'+
        '<p class="tiny muted">🎙 '+h(n.giong||'—')+' ('+h(giongKey(n.gioi,n.tuoi))+') · seed '+h(n.seed||'—')+'</p>'+
        '<div class="row mt" style="gap:6px"><button class="btn ghost sm" onclick="G.ax.nvSuaMo(\''+n.id+'\')">Sửa</button>'+
        '<button class="btn ghost sm" onclick="G.ax.nvXoa(\''+n.id+'\')">Xoá</button></div></div>';
    }).join('') +'</div>';
    return o;
  }

  function vePhanCanh(){
    var p=phimActive();
    var sel=(G.S.axPhim||[]).map(function(x){return '<option value="'+x.id+'"'+(x.id===G.S.axActive?' selected':'')+'>'+h(x.ten)+'</option>';}).join('');
    var o=U.sec('Phim & phân cảnh','Mỗi tập là một chuỗi cảnh — cảnh người dẫn nói hoặc cảnh diễn')+
      '<div class="row mb" style="gap:8px;flex-wrap:wrap">'+
        '<select onchange="G.ax.phimChon(this.value)" style="padding:8px;border:1px solid var(--line);border-radius:9px">'+sel+'</select>'+
        '<button class="btn sm" onclick="G.ax.phimThem()">'+ic('spark','w-3 h-3')+'Thêm tập</button>'+
        '<button class="btn ghost sm" onclick="G.ax.phimXoa(\''+p.id+'\')">Xoá tập</button>'+
        '<button class="btn sm" onclick="G.ax.canhThem()">'+ic('check','w-3 h-3')+'Thêm cảnh</button></div>';
    o += '<div class="row mb" style="gap:8px;flex-wrap:wrap;align-items:center">'+
        '<span class="tiny muted">🔒 Ngôn ngữ giọng:</span>'+
        '<select onchange="G.ax.phimNgon(this.value)" style="padding:7px;border:1px solid var(--line);border-radius:9px">'+
          NGON.map(function(x){return '<option value="'+x[0]+'"'+((p.ngonNgu||'vi')===x[0]?' selected':'')+'>'+h(x[1])+'</option>';}).join('')+'</select>'+
        '<button class="btn '+(p.phongCachGita!==false?'sm':'ghost sm')+'" onclick="G.ax.phimGita()">'+ic('sparkle','w-3 h-3')+(p.phongCachGita!==false?'🔒 Khoá không gian GITA: BẬT':'Khoá không gian GITA: tắt')+'</button>'+
      '</div>';
    o += '<p class="sm muted mb">'+h(p.mota||'')+'</p>';
    if(!p.canh.length) o += '<p class="bd-tip">Chưa có cảnh. Bấm "Thêm cảnh" để bắt đầu phân cảnh.</p>';
    o += p.canh.map(function(c,i){ var nv=nvById(c.nvId)||{}; var pr=promptCanh(c);
      return '<div class="card pad-sm mb"><div class="row" style="justify-content:space-between;align-items:flex-start">'+
        '<div><b>Cảnh '+(i+1)+' · '+h(nv.ten||'?')+'</b> <span class="bd-chip">'+(c.loai==='nguoi'?'Người dẫn nói':'Cảnh diễn')+'</span> <span class="bd-chip">'+(c.giay||5)+'s</span></div>'+
        '<div class="row" style="gap:4px"><button class="btn ghost sm" onclick="G.ax.canhDoi(\''+c.id+'\',-1)" title="Lên">▲</button>'+
        '<button class="btn ghost sm" onclick="G.ax.canhDoi(\''+c.id+'\',1)" title="Xuống">▼</button>'+
        '<button class="btn ghost sm" onclick="G.ax.canhSuaMo(\''+c.id+'\')">Sửa</button>'+
        '<button class="btn ghost sm" onclick="G.ax.canhXoa(\''+c.id+'\')">Xoá</button></div></div>'+
        '<p class="tiny muted" style="margin-top:6px">🎬 '+h(c.boiCanh||'—')+' · 🎥 '+h(mqChu(c))+(c.may?' · '+h(c.may):'')+'</p>'+
        ((c.hanhDong||c.nv2Id||c.dongTac||c.noiTiep) ? '<p class="tiny" style="margin-top:4px;display:flex;gap:6px;flex-wrap:wrap">'+
          (c.hanhDong?'<span class="bd-chip">🎭 '+h(nhan(c.hanhDong,HANH_DONG))+(c.doVat?' · '+h(c.doVat):'')+'</span>':'')+
          (c.nv2Id?'<span class="bd-chip">👥 cùng '+h((nvById(c.nv2Id)||{}).ten||'')+'</span>':'')+
          (c.dongTac?'<span class="bd-chip">📱 '+(c.dongTac==='thay'?'thay người trong video thật':'diễn theo video động tác')+'</span>':'')+
          (c.noiTiep?'<span class="bd-chip">🔗 nối tiếp cảnh trước</span>':'')+'</p>' : '')+
        (c.thoai?'<p class="sm" style="margin-top:4px">🗣 "'+h(c.thoai)+'"</p>':'')+
        '</div>';
    }).join('');
    return o;
  }

  function vePrompt(){
    var p=phimActive();
    var o=U.sec('Prompt & cấu hình','Sinh sẵn prompt + file .json cho notebook Kaggle (model mở, free)')+
      '<div class="row mb" style="gap:8px;flex-wrap:wrap"><button class="btn" onclick="G.ax.taiConfig()">'+ic('arrow','w-3 h-3')+'Tải cấu hình .json cho Kaggle</button>'+
      '<span class="bd-chip">Tập: '+h(p.ten)+' · '+p.canh.length+' cảnh</span></div>';
    o += '<div class="gd-wrap"><table class="gd-tb"><thead><tr><th>#</th><th>Nhân vật</th><th>Prompt ảnh (SDXL + LoRA)</th><th>Prompt video (Wan I2V)</th><th>Thoại · giọng</th><th>Lip-sync</th></tr></thead><tbody>'+
      p.canh.map(function(c,i){ var nv=nvById(c.nvId)||{}; var pr=promptCanh(c);
        return '<tr><td>'+(i+1)+'</td><td>'+h(nv.ten||'?')+'</td><td style="min-width:220px">'+h(pr.img)+'</td>'+
        '<td style="min-width:200px">'+h(pr.vid)+'</td><td>'+(c.thoai?h(c.thoai)+' <span class="tiny muted">('+h(nv.giong||'—')+')</span>':'<span class="muted">—</span>')+'</td>'+
        '<td class="ta-c">'+((c.loai==='nguoi'&&c.thoai)?'✔':'—')+'</td></tr>';
      }).join('') +'</tbody></table></div>'+
      '<p class="bd-tip">File .json gồm: dàn nhân vật (giữ nhất quán) · pipeline model mở · từng cảnh (prompt ảnh/video · thoại · giọng · seed · lip-sync). Notebook Kaggle đọc file này để sinh — em sẽ viết notebook ngay sau.</p>';
    return o;
  }

  function vePhimTruong(){
    var o=U.sec('Phim trường nội bộ','Bối cảnh cố định của GITA — mọi tập quay cùng một nơi đều giống hệt nhau')+
      '<div class="row mb"><button class="btn sm" onclick="G.ax.bcMo()">'+ic('spark','w-3 h-3')+'Thêm phim trường</button></div>';
    o += '<div class="grid g2">'+(G.S.axBC||[]).map(function(b){
      var dung=0; (G.S.axPhim||[]).forEach(function(p){ p.canh.forEach(function(c){ if(c.bcId===b.id) dung++; }); });
      return '<div class="card pad-sm"><div class="row" style="justify-content:space-between"><b>🏛 '+h(b.ten)+'</b>'+
        '<span class="bd-chip"'+(coLora(b.lora)?' style="border-color:var(--ok);color:var(--ok)"':'')+'>'+(coLora(b.lora)?'🔒 LoRA '+h(b.lora):'chưa train LoRA')+'</span></div>'+
        '<p class="sm muted" style="line-height:1.5;margin:6px 0">'+h(b.mota)+'</p>'+
        '<p class="tiny muted">seed '+h(b.seed||'—')+' · trigger '+h(trigger(b.id))+' · dùng trong '+dung+' cảnh</p>'+
        '<div class="row mt" style="gap:6px"><button class="btn ghost sm" onclick="G.ax.bcMo(\''+b.id+'\')">Sửa</button>'+
        '<button class="btn ghost sm" onclick="G.ax.bcXoa(\''+b.id+'\')">Xoá</button></div></div>'; }).join('')+'</div>';
    o += '<p class="bd-tip" style="margin-top:10px">Khoá phim trường chắc nhất: chụp/sinh 15–30 ảnh của bối cảnh → train LoRA như nhân vật → điền ô LoRA. Động cơ nạp đồng thời LoRA nhân vật + LoRA phim trường.</p>';
    return o;
  }

  function veKyXao(){
    var p=phimActive(), hk=hauCua(p);
    var o=U.sec('Kỹ xảo & Động cơ','Chọn phương án sản xuất · dự toán chi phí · động cơ từng cảnh · hậu kỳ');
    var pa=p.phuongAn||'D', phut=p.phutThang||20, gp=gpuCua(p);
    function usd(x){ return '$'+(x<10?x.toFixed(2):Math.round(x)); }
    function vnd(x){ return Math.round(x*TY_GIA/1000).toLocaleString('vi-VN')+'k đ'; }
    var A=duToan(p,'A'), B=duToan(p,'B'), C=duToan(p,'C'), D=duToan(p,'D'), giayTap=A.giay||1;
    var heso=phut*60/giayTap;                      /* quy tập hiện tại ra sản lượng tháng */
    var gioGPU=A.gpuPhut*heso/60, gioT4=gioGPU/gp.he*4.5;  /* T4 Kaggle chậm hơn 4090 khoảng 4–5 lần */
    var aThue=A.usd*heso, bApi=B.usd*heso, bTong=bApi+22, cMix=C.usd*heso, cGio=C.gpuPhut*heso/60;
    var dMix=D.usd*heso, dGio=D.gpuPhut*heso/60;
    /* % thuê ngoài của tập theo phương án đang chọn (tính cả cảnh chọn động cơ riêng) */
    var hien=duToan(p), ngoaiPct=hien.giay? Math.round(hien.giayNgoai/hien.giay*100) : 0;
    function nut(k,t,d){ return '<button class="btn '+(pa===k?'':'ghost ')+'sm" style="text-align:left;flex:1;min-width:220px;white-space:normal;line-height:1.4;border-radius:14px;display:block;padding:10px 12px" onclick="G.ax.phuongAn(\''+k+'\')"><b style="display:block">'+t+'</b><span class="tiny" style="display:block;opacity:.85;margin-top:3px">'+d+'</span></button>'; }
    o += '<div class="card pad-sm mb"><b class="sm">Phương án sản xuất của tập</b>'+
      '<div class="row mt" style="gap:8px;flex-wrap:wrap">'+
        nut('D','D · Nội bộ 90% — khuyên dùng','Mọi cảnh chạy model mở trên máy GITA · chỉ cảnh then chốt thuê Veo 3.1 Fast, trần 10% thời lượng')+
        nut('A','A · Free (model mở)','Người dẫn nói: InfiniteTalk · cảnh: Wan 2.2 · cảnh dài: FramePack')+
        nut('C','C · Lai','Người dẫn nói: InfiniteTalk tự chạy · cảnh: Seedance · then chốt: Veo 3.1 Fast')+
        nut('B','B · Tối ưu có phí','Người dẫn nói: InfiniteTalk API · cảnh: Seedance · then chốt: Veo 3.1 Fast')+
      '</div>'+
      '<div class="row mt" style="gap:8px;align-items:center;flex-wrap:wrap"><span class="tiny muted">Sản lượng dự kiến:</span>'+
        '<input type="number" min="1" max="600" value="'+phut+'" onchange="G.ax.phutThang(this.value)" style="width:80px;padding:6px;border:1px solid var(--line);border-radius:8px"> <span class="tiny muted">phút phim thành phẩm / tháng</span>'+
        '<span class="tiny muted" style="margin-left:10px">Máy GPU thuê theo giờ:</span>'+
        '<select onchange="G.ax.gpu(this.value)" style="padding:6px;border:1px solid var(--line);border-radius:8px">'+
          Object.keys(GPU).map(function(k){ return '<option value="'+k+'"'+(GPU[k]===gp?' selected':'')+'>'+h(GPU[k].ten)+' · ~$'+GPU[k].gio+'/giờ</option>'; }).join('')+
        '</select></div>'+
      '<p class="bd-tip" style="margin-top:6px">'+h(gp.ten)+' chạy được: '+h(gp.chat)+'.</p></div>';
    var mau = ngoaiPct<=10 ? '#0B7350' : (ngoaiPct<=30 ? '#B4720F' : '#B42318');
    o += '<div class="card pad-sm mb"><div class="row" style="justify-content:space-between;align-items:baseline;flex-wrap:wrap;gap:6px">'+
        '<b class="sm">Tỉ lệ nội bộ của tập</b><span class="tiny" style="color:'+mau+'"><b>'+(100-ngoaiPct)+'% nội bộ · '+ngoaiPct+'% thuê ngoài</b> (mục tiêu ≤ 10%)</span></div>'+
      '<div style="height:10px;border-radius:6px;background:var(--line);overflow:hidden;margin-top:8px;display:flex">'+
        '<div style="width:'+(100-ngoaiPct)+'%;background:#0B7350"></div><div style="width:'+ngoaiPct+'%;background:'+mau+'"></div></div>'+
      '<p class="bd-tip" style="margin-top:6px">Tính theo giây thành phẩm: '+hien.giayNgoai+'s / '+hien.giay+'s chạy động cơ thuê ngoài. '+
        (ngoaiPct>10 ? '<b>Đang vượt trần 10%</b> — chọn phương án D, hoặc bỏ bớt ô "Cảnh then chốt" / động cơ có phí chọn riêng ở từng cảnh.' :
         'Đạt chuẩn xưởng nội bộ. Động cơ cũng tự giữ trần này khi dựng (cảnh vượt trần tự chạy model mở).')+'</p></div>';
    o += '<div class="gd-wrap mb"><table class="gd-tb"><thead><tr><th>Dự toán / tháng ('+phut+' phút)</th><th>D · Nội bộ 90%</th><th>A · Free trên Kaggle</th><th>A · Thuê '+h(gp.ten)+'</th><th>C · Lai</th><th>B · Tối ưu có phí</th></tr></thead><tbody>'+
      '<tr><td>Sinh video (gồm làm lại)</td><td>'+usd(dMix)+' · '+vnd(dMix)+'</td><td>0 đ</td><td>'+usd(aThue)+' · '+vnd(aThue)+'</td><td>'+usd(cMix)+' · '+vnd(cMix)+'</td><td>'+usd(bApi)+' · '+vnd(bApi)+'</td></tr>'+
      '<tr><td>Giọng đọc</td><td>0 đ (thu âm thật / VieNeu-TTS nội bộ)</td><td>0 đ (VieNeu-TTS)</td><td>0 đ (VieNeu-TTS)</td><td>0 đ nội bộ · $22 nếu thuê giọng ngoài</td><td>$22 · '+vnd(22)+' (ElevenLabs Creator)</td></tr>'+
      '<tr><td><b>Tổng</b></td><td><b>'+usd(dMix)+' · '+vnd(dMix)+'</b></td><td><b>0 đ</b></td><td><b>'+usd(aThue)+' · '+vnd(aThue)+'</b></td><td><b>'+usd(cMix)+'–'+usd(cMix+22)+'</b></td><td><b>'+usd(bTong)+' · '+vnd(bTong)+'</b></td></tr>'+
      '<tr><td>Mỗi phút thành phẩm</td><td>'+usd(dMix/phut)+'</td><td>0 đ</td><td>'+usd(aThue/phut)+'</td><td>'+usd(cMix/phut)+'–'+usd((cMix+22)/phut)+'</td><td>'+usd(bTong/phut)+'</td></tr>'+
      '<tr><td>Thuê ngoài</td><td>'+(D.giay?Math.round(D.giayNgoai/D.giay*100):0)+'%</td><td>0%</td><td>0%</td><td>'+(C.giay?Math.round(C.giayNgoai/C.giay*100):0)+'%</td><td>100%</td></tr>'+
      '<tr><td>Thời gian máy</td><td>≈ '+Math.round(dGio)+' giờ '+h(gp.ten)+'</td><td>≈ '+Math.round(gioT4)+' giờ T4 (Kaggle cho ~120 giờ/tháng)</td><td>≈ '+Math.round(gioGPU)+' giờ '+h(gp.ten)+'</td><td>≈ '+Math.round(cGio)+' giờ (chỉ cảnh người dẫn)</td><td>Gần như tức thì (máy nhà cung cấp)</td></tr>'+
      '</tbody></table></div>'+
      '<p class="bd-tip">Tính theo đúng tỉ lệ cảnh của tập này, nhân lên '+phut+' phút/tháng, đã gồm làm lại (cảnh diễn ×2, người dẫn ×1,3). Giá API tra tháng 10/2026; giờ GPU của động cơ mở là ước tính — chạy thử 1 tập để đo thật. '+
        (gioT4>120?'<b>Sản lượng này vượt hạn mức Kaggle free</b> → cần thuê GPU hoặc giảm sản lượng.':'Sản lượng này nằm trong hạn mức Kaggle free.')+(B.chuaGia?' Có '+B.chuaGia+' cảnh dùng động cơ chưa có giá.':'')+'</p>';
    o += '<div class="card pad-sm mb"><b class="sm">Ghi đè động cơ cho cả tập (tuỳ chọn)</b>'+
      '<div class="row mt" style="gap:8px;flex-wrap:wrap;align-items:center">'+
      '<select onchange="G.ax.phimDongCo(this.value)" style="padding:8px;border:1px solid var(--line);border-radius:9px;min-width:300px">'+
        DONGCO.map(function(x){return '<option value="'+x[0]+'"'+((p.dongCo||'auto')===x[0]?' selected':'')+'>'+h(x[1])+'</option>';}).join('')+'</select></div>'+
      '<p class="bd-tip">Để "Theo phương án đã chọn" là tối ưu nhất. Chọn riêng từng cảnh trong form cảnh (ô "Động cơ" và "Cảnh then chốt").</p></div>';
    o += '<div class="gd-wrap mb"><table class="gd-tb"><thead><tr><th>#</th><th>Cảnh</th><th>Động cơ sẽ chạy</th><th>Loại</th></tr></thead><tbody>'+
      p.canh.map(function(c,i){ var nv=nvById(c.nvId)||{}; var k=chonDongCo(c,p); var phi=!laMo(k);
        return '<tr><td>'+(i+1)+'</td><td>'+h(nv.ten||'?')+' · '+h((c.boiCanh||'').slice(0,40))+'</td><td>'+h(tenDC(k))+(c.dongCo?' <span class="bd-chip">riêng</span>':'')+'</td>'+
          '<td><span class="bd-chip" style="'+(phi?'border-color:#B4720F;color:#B4720F':'')+'">'+(phi?('Có phí'+(GIA[k]!=null?' · $'+GIA[k]+'/s':'')):'Free')+'</span></td></tr>'; }).join('')+
      '</tbody></table></div>';
    o += '<div class="card pad-sm"><b class="sm">Dây chuyền hậu kỳ cao cấp</b><div style="margin-top:8px">'+
      HAUKY.map(function(x){ return '<label style="display:flex;gap:9px;align-items:center;padding:6px 0;font-size:13px;color:var(--ink-2)">'+
        '<input type="checkbox"'+(hk[x[0]]?' checked':'')+' onchange="G.ax.hauToggle(\''+x[0]+'\')"> '+h(x[1])+'</label>'; }).join('')+
      '</div><p class="bd-tip">Thứ tự chạy thật: sinh clip → giọng → lip-sync → giữ mặt → nâng nét → ổn định/khử nhiễu/chỉnh màu → mượt 60fps → phụ đề → ráp + nhạc nền (đặt tệp nhạc vào nhac/). Bật càng nhiều càng nét nhưng tốn thêm giờ GPU.</p></div>';
    return o;
  }

  function veBang(){
    var p=phimActive();
    var dem={}; TT.forEach(function(t){dem[t.k]=0;}); p.canh.forEach(function(c){dem[c.tt||'']++;});
    var xong=dem['rap']||0;
    var o=U.sec('Bảng sản xuất','Bấm ô trạng thái để cập nhật: Chưa → Ảnh → Clip → Lip-sync → Đã ráp')+
      '<div class="grid g4 mb">'+
      U.stat({k:'Tổng cảnh',v:String(p.canh.length),d:'tập này'})+
      U.stat({k:'Đã ráp',v:xong+'/'+p.canh.length,d:'hoàn tất',c:xong===p.canh.length&&p.canh.length?'#0B7350':'#B4720F'})+
      U.stat({k:'Đang làm',v:String((dem['anh']||0)+(dem['clip']||0)+(dem['lip']||0)),d:'giữa chừng'})+
      U.stat({k:'Tổng thời lượng',v:p.canh.reduce(function(s,c){return s+(c.giay||5);},0)+'s',d:'ước tính'})+'</div>';
    o += p.canh.map(function(c,i){ var nv=nvById(c.nvId)||{}; var t=ttOf(c.tt||'');
      return '<div class="gd-nvr"><button class="gd-tick" style="--m:var('+t.c+')" onclick="G.ax.canhTT(\''+c.id+'\')" title="Đổi trạng thái"></button>'+
        '<span class="gd-nvi">'+(i+1)+'</span><span class="gd-nvt">'+h(nv.ten||'?')+' · '+h(c.boiCanh||'')+'</span>'+
        '<span class="gd-nvs" style="--m:var('+t.c+')">'+h(t.t)+'</span></div>';
    }).join('');
    return o;
  }

  G.VIEWS['san-xuat-ai'] = function(){
    if(!(typeof G.can==='function' && G.can('qt_trang')))
      return U.lockCard('Bộ điều khiển sản xuất phim AI mở cho Super Admin / Admin. Đăng nhập đúng vai để xem.');
    initData();

    var o = U.ph({ eyebrow:'XƯỞNG PHIM AI · BỘ ĐIỀU KHIỂN', ic:'orbit', grad:1,
      t:'Bộ điều khiển sản xuất phim AI',
      lead:'App GITA là bộ não của xưởng nội bộ: dàn nhân vật khoá mặt, phim trường, phân cảnh, máy quay ảo, kỹ xảo — rồi xuất cấu hình cho động cơ model mở chạy trên GPU (Kaggle hoặc máy thuê theo giờ). Thuê ngoài tối đa 10% — không slideshow, không ảnh mấp máy môi.' });

    o += '<div class="row mb" style="gap:8px;flex-wrap:wrap">'+
      '<button class="btn ghost sm" data-v="studio-he">'+ic('arrow','w-3 h-3')+'Hệ điều hành xưởng</button>'+
      '<button class="btn ghost sm" data-v="lam-phim-10">'+ic('sparkle','w-3 h-3')+'Chương trình 10 bước</button>'+
      '</div>';

    o += '<div class="row mb" style="gap:6px;flex-wrap:wrap">'+
      tabBtn('nhanh','⚡ Làm phim nhanh')+tabBtn('duan','🎬 Dự án phim')+tabBtn('khophim','🗄 Kho phim')+tabBtn('nv','Kho nhân vật')+tabBtn('phim','Phim & phân cảnh')+tabBtn('prompt','Prompt & cấu hình')+tabBtn('bang','Bảng sản xuất')+tabBtn('phimtruong','Phim trường')+tabBtn('kyxao','Kỹ xảo & Động cơ')+tabBtn('tudong','Tự động')+'</div>';

    if(G.S.axTab==='nhanh') o += (G.axn && G.axn.ve ? G.axn.ve() : '');
    else if(G.S.axTab==='khophim') o += (G.khoDrive && G.khoDrive.ve ? G.khoDrive.ve() : '');
    else if(G.S.axTab==='duan') o += (G.axda && G.axda.ve ? G.axda.ve() : '');
    else if(G.S.axTab==='nv') o += veNhanVat();
    else if(G.S.axTab==='phim') o += vePhanCanh();
    else if(G.S.axTab==='prompt') o += vePrompt();
    else if(G.S.axTab==='bang') o += veBang();
    else if(G.S.axTab==='kyxao') o += veKyXao();
    else if(G.S.axTab==='phimtruong') o += vePhimTruong();
    else { o += veTuDong(); var _j=tdCfg().job; if(_j) setTimeout(function(){ try{ G.ax.tdTheoDoi(_j); }catch(e){} }, 0); }

    o += '<p class="tiny muted" style="margin-top:14px">'+ic('shield','w-3 h-3')+' Dữ liệu nhân vật & phân cảnh lưu trên máy anh/chị, giữ qua phiên. Ảnh mẫu, kịch bản và phim nằm trong Google Drive của anh/chị (hoặc trạm/máy GPU riêng của GITA nếu có thuê) — chỉ gửi khi anh/chị bấm, không qua dịch vụ AI bên ngoài.</p>';
    return o;
  };
})();
