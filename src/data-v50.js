/* ═══════════════════════════════════════════════════════════════
   GITA 365 — KIẾN TRÚC VẬN HÀNH V50 · BẢN ĐỒ MÀN (V50-2026.10-a)

   Soát 270 mục cột trái ngày 07/10/2026 (đo trên bản chạy, đọc cả mã):
     · ~94 màn là CÔNG CỤ — nhập liệu, bấm việc, gọi máy chủ, lưu trạng thái.
     · 160 màn là HỌC THUYẾT / LIỆT KÊ — đọc được, nhưng không bấm được việc
       gì và không đo được ai đã làm theo. Nằm rải trong sáu nhóm, nhân sự
       phải lội qua chúng mới tới được công cụ.
     · 17 màn là SỐ MINH HOẠ hoặc TRÙNG một công cụ sống đã có
       (bảng điều khiển mẫu, buồng lái mẫu, bảng tài chính mẫu…).

   V50 xử lý ba loại bằng ba luật, KHÔNG xoá mã màn nào (99 khoá màn được
   tools/do-16-he.js canh vẫn đăng ký nguyên), nên đảo ngược được ngay:
     GOP  màn mẫu / trùng → CHUYỂN THẲNG sang công cụ sống. Có danh sách
          dự phòng: vai không mở được đích thì đi đích kế; không đích nào
          mở được thì giữ màn cũ (không bao giờ chuyển vào chỗ bị khoá).
     CUM  màn học thuyết → rút khỏi cột trái của NHÂN SỰ (lv ≤ 12), gom vào
          14 cụm ở màn Thư viện vận hành. Mỗi cụm có BẢNG VIỆC ÁP DỤNG
          (5–6 việc đo được) và CHỈ SỐ chịu tác động ở Trung tâm đo lường —
          học thuyết thành việc, việc thành số.
     AN   màn trùng một lối vào khác (bảng điều khiển theo vai) → rút khỏi
          cột trái, lối vào gốc vẫn mở.
   Gia đình, học viên, CTV (lv ≥ 13) KHÔNG đổi cột trái — các màn hành
   trình của nhà mình vẫn ở đúng chỗ cũ.

   Tắt toàn bộ V50 (về y như trước): Thư viện vận hành → "Hiện lại đủ",
   hoặc localStorage gita_v50_tat = '1'.

   Bảng việc áp dụng có bản sao số lượng ở may-chu/ap-dung.js (CUM_SO);
   tools/thu-ap-dung.mjs so hai bên.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;
(function(){
  var V = {};
  V.PHIEN_BAN = 'V50-2026.10-a';

  /* [đích ưu tiên…], lý do, tuỳ chọn mở đích */
  V.GOP = {
    'dieu-hanh':         [['trung-tam-do'], 'Số minh hoạ — Trung tâm đo lường đo thật 41 chỉ số, 7 khối.'],
    'tong-quan':         [['trung-tam-do'], 'Tổng quan hôm nay đã gộp vào Trung tâm đo lường.'],
    'tang-truong':       [['trung-tam-do'], 'Tăng trưởng thật ở tầng Chiến lược V20 (North Star, dự báo, kịch bản).', { lop:'v20' }],
    'ban-do-chien-luoc': [['trung-tam-do'], 'Bản đồ chiến lược thay bằng mục tiêu V20 có số đo và tiến độ.', { lop:'v20' }],
    'the-diem-can-bang': [['trung-tam-do'], 'Thẻ điểm cân bằng thay bằng 7 khối × 41 chỉ số đo thật.', { lop:'v20' }],
    'tai-chinh-qt':      [['phong-tai-chinh'], 'Bảng tài chính mẫu — dùng Phòng Kế toán – Tài chính (số thật).'],
    'chi-phi':           [['phong-tai-chinh'], 'Kiến trúc chi phí mẫu — chi thật, duyệt thật ở Phòng tài chính.'],
    'coach-deck':        [['coach-dp', 'coach-he'], 'Buồng lái mẫu — Điều phối & giám sát chương trình là bản sống.'],
    'doi-ngu':           [['coach-dp', 'coach-he'], 'Đội ngũ mẫu — tải việc từng coach ở Điều phối & giám sát.'],
    'bando-coach':       [['coach-he'], 'Bản đồ coaching gộp vào Hệ điều hành Coach.'],
    'tuvan-deck':        [['crm', 'tt-cskh'], 'Khoang mở cửa mẫu — trùng CRM.'],
    'bando-tuvan':       [['tt-cskh', 'crm'], 'Bản đồ vận hành khách gộp vào Trung tâm Tư vấn & CSKH.'],
    'hai-long':          [['do-luong-he'], 'NPS / CSAT thật ở Đo lường toàn diện khách hàng.'],
    'kiem-thu':          [['kiem-theo-vai'], 'Phòng kiểm thử mẫu — Kiểm thử theo vai chạy thật.'],
    'thanh-tra':         [['thanh-tra-soi'], 'Thanh tra mẫu — Mười tổ thanh tra soi chạy thật.'],
    'vong-doi-tk':       [['khoa-tai-khoan', 'nguoi-dung'], 'Vòng đời tài khoản: khoá · mở lại · xoá làm thật ở đây.'],
    'kiem-duyet':        [['duyet-tai-lieu'], 'Kiểm duyệt mẫu — Kiểm duyệt tài liệu duyệt thật.']
  };

  /* Trùng một lối vào khác: rút khỏi cột trái, không chuyển hướng
     (Bảng điều khiển của tôi đang dựng chính các màn này theo vai). */
  V.AN = {
    'van-hanh-10': ['dk-cua-toi', 'Bảng điều khiển của tôi mở đúng bảng này cho Super Admin / Admin.'],
    'van-hanh-gd': ['dk-cua-toi', 'Bảng điều khiển của tôi mở đúng bảng này cho Giám đốc.']
  };

  /* 14 cụm học thuyết. khoi/kpi = mã ở G.TU (data-toi-uu.js). */
  V.CUM = [
    { ma:'PP', ten:'Phương pháp & lộ trình GITA', khoi:'CO', kpi:'co7',
      mo:'Năm tầng, mười hai chặng, mô thức và ngôn từ dẫn dắt — xương sống mọi buổi làm việc.',
      man:['gioi-thieu','phuong-phap','tu-duy','chieu-sau','van-dung','mo-thuc','kien-truc-100','sau-vung','coach-5-tang','ngon-tu'],
      viec:['Mỗi nhà đang phụ trách đã xác định đúng tầng (T1–T5) và ghi vào hồ sơ',
            'Buổi làm việc gần nhất bám đúng mô thức của tầng ấy, không nhảy tầng',
            'Mở tầng mới bằng bằng chứng, không mở bằng lời hứa',
            'Dùng ngôn từ dẫn dắt chuẩn, không dùng nỗi sợ để thúc',
            'Mỗi tháng rà nhà đứng yên quá 60 ngày ở một tầng',
            'Người mới trong đội đã qua bài kiểm phần phương pháp'] },
    { ma:'KHO', ten:'Kho chuyên môn', khoi:'CO', kpi:'co3',
      mo:'Phác đồ, kịch bản, tình huống, ma trận vấn đề — tra trước khi làm, ghi mã để đo lại.',
      man:['kho','phac-do','kich-ban','tinh-huong','ma-tran','ma-tran-bang','sach','tai-lieu-goc','kho-tai-lieu','kho-tong','van-tay','diem-cham'],
      viec:['Mỗi nhà đèn đỏ đã gắn một phác đồ cụ thể (ghi mã trong ca)',
            'Trước buổi khó đã tra tình huống tương tự trong kho',
            'Kịch bản dùng trong buổi lấy từ kho và ghi mã để đo hiệu quả',
            'Tài liệu gửi gia đình đã qua kiểm duyệt',
            'Lỗ hổng phát hiện trong kho được gửi lên Thư viện tài liệu'] },
    { ma:'NGHE', ten:'Chuẩn nghề các vai', khoi:'NS', kpi:'ns3',
      mo:'Mô tả nghề từng vai, gói nghề, 40 giờ đào tạo, sổ tay năm đầu, nôi nhân tài.',
      man:['nghe-tu-van','nghe-coach','nghe-qlcm','nghe-mentor','nghe-danhgia','nghe-phantich','nghe-tncoach','nghe-giamdoc','nghe-giaovien','nghe-quantri','goi-nghe','dao-tao-dh','nam-dau','noi-nhan-tai'],
      viec:['Mỗi nhân sự có mô tả nghề đúng vai và đã ký nhận',
            'Nhân sự mới qua đủ ba cửa trước khi nhận nhà riêng',
            'Đủ 40 giờ đào tạo năm đầu, có ghi nhận',
            'Đánh giá năng lực theo khung thăng hạng mỗi quý',
            'Có người kế cận cho mỗi vị trí quan trọng'] },
    { ma:'COACH', ten:'Coach & chăm sóc hằng ngày', khoi:'CO', kpi:'co2',
      mo:'Bàn làm việc, điểm chạm, diễn thử, luật làm việc với gia đình, đồng hành từng cấp.',
      man:['ban-coach','so-tay-van-hanh','diem-cham-1000','dien-thu','hoat-dong','ban-ve','chuan-ngon-ngu','luat-lam-viec','coach-kh','vung-manh','dong-hanh-cap','phim-cau-noi'],
      viec:['Không nhà nào quá 7 ngày chưa được chạm',
            'Mỗi buổi coach được ghi nhận ở Điều phối & giám sát trong 24 giờ',
            'Diễn thử trước hai buổi khó nhất (buổi đầu, buổi chuyển tầng)',
            'Mọi trao đổi với gia đình đi qua hệ thống, không qua kênh riêng',
            'Việc chưa ai nhận được giao người ngay trong ngày',
            'Trưởng nhóm duyệt chất lượng ít nhất một buổi mỗi coach mỗi tuần'] },
    { ma:'TUVAN', ten:'Tư vấn & chuyển đổi', khoi:'TV', kpi:'tv5',
      mo:'Bàn tư vấn, phễu chốt, chân dung khách, chín cổng chuyển đổi, học phí, giới thiệu.',
      man:['ban-tu-van','tang34','pheu-chot','so-tay-tu-van','kich-ban-sale','chan-dung-kh','chuyen-doi','hoc-phi','referral','ref-gita','assessment','chan-dung-tc'],
      viec:['Mỗi lead có người phụ trách trong 24 giờ',
            'Cuộc gọi đầu dùng phiếu chẩn đoán Tầng 1 và lưu kết quả',
            'Nói học phí đúng bảng giá, không giảm ngoài quyền',
            'Cơ hội đang mở luôn có ngày hẹn kế tiếp',
            'Nhà đã vào học được mời giới thiệu sau khoảnh khắc WOW đầu'] },
    { ma:'VIP', ten:'VIP & khách lớn', khoi:'TV', kpi:'tv6',
      mo:'Phân hạng, hồ sơ, cây tiền VIP, tệp nhân sự trung thành, trợ lý chăm sóc.',
      man:['hang-vip','hoso-vip','cay-tien','cay-tien-vip','khach-lon','nhan-su-tt','ai-cham'],
      viec:['Danh sách VIP / VVIP cập nhật theo chuẩn phân hạng, có người phụ trách riêng',
            'Hồ sơ VIP đủ trường bắt buộc và mốc chăm sóc',
            'Lịch chạm VIP dày hơn chuẩn thường và đúng hạn',
            'Có nhân sự trung thành được giao cho nhóm VIP',
            'Rà rủi ro rời bỏ của nhóm VIP mỗi tháng'] },
    { ma:'TRAI', ten:'Trải nghiệm & lan toả', khoi:'KH', kpi:'kh3',
      mo:'Chuỗi WOW → Fan → lan toả, định nghĩa đo lường khách, rà soát mười hai mặt, vinh danh.',
      man:['chuoi-wow','wow','do-luong-kh','ra-soat-kh','vinh-danh','chuyen-cam-hung','chuyen-the-gioi'],
      viec:['Mỗi nhà có ít nhất một khoảnh khắc WOW được ghi trong tháng',
            'Nhà chấm NPS / CSAT thấp được gọi lại trong 48 giờ',
            'Rà soát mười hai mặt cho nhà sắp hết kỳ',
            'Câu chuyện thành công được xin phép và đưa vào vinh danh',
            'Fan tích cực được mời vào chương trình giới thiệu'] },
    { ma:'MK', ten:'Thương hiệu & nội dung', khoi:'MK', kpi:'mk2',
      mo:'Nhận diện, ngôn từ, luật giao diện, bộ prompt, giọng đọc, nội dung tiếp thị.',
      man:['noi-dung-tiep-thi','thuong-hieu','nhan-dien','nhan-dien-loi','so-tay-nhan-dien','luat-giao-dien','bo-prompt'],
      viec:['Mọi bài đăng dùng đúng bộ nhận diện (logo, màu, giọng GITA)',
            'Không dùng từ cấm trong bộ nhận diện ngôn từ',
            'Lịch nội dung tuần có ít nhất ba bài vào cổng',
            'Mỗi bài ghi kênh, lượt xem, lượt bấm để đo ở Trung tâm',
            'Prompt AI dùng bộ chuẩn bốn vai'] },
    { ma:'GD', ten:'Cam kết với gia đình', khoi:'KH', kpi:'kh4',
      mo:'Bảy quyền, sáu điều không bán, năm điều không ai được sửa, ranh giới, cổng nghiệm thu.',
      man:['phap-ly','tien-rung','bien-nien','giu-lua','so-tay-gia-dinh','hansei-sach','doi-dong-hanh','ranh-gioi','cong-nghiem-thu','chuan-nhat'],
      viec:['Gia đình đã được nói rõ bảy quyền và ký nhận',
            'Không vi phạm sáu điều không bao giờ bán',
            'Nhật ký không sửa xoá — mọi chỉnh sửa có dấu vết',
            'Yêu cầu của gia đình (xoá dữ liệu, hoàn tiền) xử lý đúng hạn',
            'Nghiệm thu mỗi chặng có bằng chứng và xác nhận của gia đình'] },
    { ma:'NHA', ten:'Hành trình nhà mình', khoi:'KH', kpi:'kh1',
      mo:'Định vị hôm nay, bản đồ cá nhân, thói quen, bộ test, tiến bộ của con — những bài cả nhà cùng đọc trên hành trình.',
      man:['dinh-vi','ban-do-ca-nhan','chuyen-hoa','hanh-trinh-con','dong-hanh','nhan-vat','cay-vip','bo-test','mua-doi','buc-tranh','chin-vai','thoi-quen','cu-hich','bang-so','do-thoi-gian','lo-trinh','hanh-trinh-12','hanh-trinh-5-tang','gita-map','banh-da'],
      viec:['Gia đình mở app ít nhất ba ngày mỗi tuần',
            'Bản đồ cá nhân và định vị được cập nhật hằng tháng',
            'Có thói quen / nghi lễ gia đình đang theo dõi',
            'Bộ test nhận diện làm lại mỗi chu kỳ 90 ngày',
            'Tiến bộ của con ghi bằng bằng chứng, không chỉ cảm nhận'] },
    { ma:'PL', ten:'Pháp lý, quyền & dữ liệu', khoi:'CN', kpi:'cn5',
      mo:'Rà soát pháp lý, bằng chứng điện tử, ký kết, văn bản, tầng quyền, mật mã kín, lá chắn.',
      man:['ra-soat-phap-ly','bang-chung','ho-so-hop-dong','ky-ket','van-ban','tang-quyen','hang-tai-lieu','dau-mat','dong-chay','an-toan-du-lieu','la-chan-30','so-tay-admin'],
      viec:['Hợp đồng ký đúng luồng và lưu bằng chứng điện tử',
            'Phát hiện rà soát pháp lý có người xử lý và hạn',
            'Tài khoản nghỉ việc bị khoá ngay trong ngày',
            'Tài liệu mật mang dấu mật mã kín',
            'Yêu cầu xoá dữ liệu xử lý trong hạn'] },
    { ma:'TC', ten:'Quy trình tài chính', khoi:'TC', kpi:'tc4',
      mo:'Quy trình thu – chi – duyệt và hệ điều hành CEO.',
      man:['quy-trinh-tc','he-dieu-hanh'],
      viec:['Phiếu thu được duyệt trong 3 ngày',
            'Mọi khoản chi có hoá đơn',
            'Đề xuất chi được duyệt trong 7 ngày',
            'Đối soát cuối tháng khớp sổ',
            'Bảy con số CEO cập nhật mỗi tuần'] },
    { ma:'KT', ten:'Kiến trúc & tự vận hành hệ', khoi:'NS', kpi:'ns4',
      mo:'16 hệ, kiến trúc hợp nhất, bản đồ 12 khối, bánh đà, tuyến, điều phối AI, tự vận hành.',
      man:['he-16','kien-truc-hop-nhat','ban-do-tong-the','vong-lap-van-hanh','khung-van-hanh','bo-may-tap-doan','tuyen','quy-trinh-toan-he','tu-van-hanh','tu-nang-cap','tu-hoan-thien','giam-sat','quyen-nang-ai','dieu-phoi','supreme','bo-nao','ai-dieu-phoi','nam-man'],
      viec:['Mỗi hệ trong 16 hệ có chủ sở hữu và chỉ số ở Trung tâm',
            'Việc tối ưu quá hạn được xử lý trước việc mới',
            'Quyền AI cấp đúng trần tự chủ, có nhật ký',
            'Mỗi quý rà kiến trúc mục tiêu so với mã đang chạy',
            'Thay đổi lớn qua kiểm thử theo vai trước khi phát hành'] },
    { ma:'CT', ten:'Cải tiến & kiểm soát', khoi:'NS', kpi:'ns4',
      mo:'Rà soát hệ thống, điểm gãy, hành lang thành công, tự động hoá, tinh gọn, chuẩn 1000 điểm.',
      man:['ra-soat','ra-soat-loi','hanh-lang','tu-dong','cai-tien','tinh-gon','giai-doan-bao-ve','chuan-1000','hoc-tu-lon','tin-noi-bo'],
      viec:['Mỗi điểm gãy trong rà soát có người sửa và hạn',
            'Đề xuất cải tiến từ người làm được trả lời trong 7 ngày',
            'Việc lặp hơn ba lần mỗi tuần được xem xét tự động hoá',
            'Quyết định quan trọng lên bảng tin nội bộ trong ngày',
            'Chuẩn 1000 điểm chấm lại mỗi quý'] }
  ];

  var CUA = {};
  V.CUM.forEach(function(c){ c.man.forEach(function(v){ CUA[v] = c; }); });
  V.cumCua = function(v){ return CUA[v] || null; };
  V.cum = function(ma){ for(var i = 0; i < V.CUM.length; i++) if(V.CUM[i].ma === ma) return V.CUM[i]; return null; };

  /* Chấm một bảng tự soát — bản sao ĐÚNG phép của may-chu/ap-dung.js.
     tt: mảng 'da' | 'dang' | 'chua' | 'kl' (không liên quan). */
  V.cham = function(tt){
    var da = 0, dang = 0, kl = 0, n = (tt || []).length;
    for(var i = 0; i < n; i++){ var x = tt[i]; if(x === 'da') da++; else if(x === 'dang') dang++; else if(x === 'kl') kl++; }
    var tong = n - kl;
    return { da:da, dang:dang, tong:tong, diem: tong > 0 ? Math.round(100 * (da + 0.5 * dang) / tong) : null };
  };

  /* ── Bật / tắt ── */
  V.tat = function(){ try { return localStorage.getItem('gita_v50_tat') === '1'; } catch(e){ return false; } };
  V.datTat = function(b){ try { if(b) localStorage.setItem('gita_v50_tat', '1'); else localStorage.removeItem('gita_v50_tat'); } catch(e){} };
  function lv(){ var r = G.S && G.S.roleObj; return r && r.lv ? r.lv : 99; }
  V.laNhanSu = function(){ return lv() <= 12; };

  /* Đích chuyển hướng của một màn, hoặc null. Chỉ chuyển khi đích có thật
     VÀ vai mở được — không bao giờ đưa người dùng vào chỗ bị khoá. */
  V.boQua = {};
  V.dich = function(v){
    if(V.tat() || V.boQua[v]) return null;
    var g = V.GOP[v]; if(!g) return null;
    for(var i = 0; i < g[0].length; i++){
      var t = g[0][i];
      if(G.manCoThat && G.manCoThat(t) && (!G.allowed || G.allowed(t))) return { v:t, ly:g[1], mo:g[2] || null };
    }
    return null;
  };
  /* Rút khỏi cột trái? (chỉ nhân sự; gia đình giữ nguyên cột) */
  V.an = function(v){
    if(V.tat() || !V.laNhanSu()) return false;
    return !!(V.GOP[v] || V.AN[v] || CUA[v]);
  };

  G.V50 = V;
})();
