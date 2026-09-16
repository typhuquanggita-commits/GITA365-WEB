/* ═══════════════════════════════════════════════════════════════
   GITA 365 · v8.1 — TRỢ LÝ GITA
   Chạy hoàn toàn trong máy: không gọi ra mạng, không tốn phí gọi API,
   và dữ liệu của gia đình không rời khỏi thiết bị. Trợ lý tra trong
   chính kho đã giải mã trong bộ nhớ phiên làm việc.

   Bản cũ chỉ so khớp TỪ ĐẦU TIÊN của câu hỏi nên gần như không tìm
   được gì. Bản này tách từ, bỏ dấu, chấm điểm theo số từ khớp và
   trọng số từng trường, rồi xếp hạng.

   Ba luật cứng, kiểm được bằng máy:
     · chỉ trả lời trong phạm vi vai và tầng đang được cấp
     · luôn nêu nguồn, có mã tra lại được
     · kho chưa có thì nói thẳng là chưa có, không đoán
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;

(function(){
var U = G.U;

/* ─── Chuẩn hoá tiếng Việt: bỏ dấu, thường hoá, tách từ ─── */
function boDau(s){
  return String(s || '').toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd').replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ').trim();
}
var HU_TU = ('la cua va cho voi thi ma nhung o tai den tu khi nao sao gi de duoc co khong ' +
  'toi minh em anh chi con nha mot hai cac nhung rat qua lam nen se da dang bi bo ai nay ' +
  'the nhu hay hon nua chua roi cung ve theo tren duoi trong ngoai').split(' ');
/* Tập tiếng của một chuỗi, dựng một lần rồi tra bằng khoá. Trả về
   vật chứ không trả mảng: tra khoá nhanh hơn duyệt mảng, và ở đây
   phép này chạy vài trăm nghìn lượt mỗi câu hỏi. */
function tapTieng(v){
  var ra = {}, t = boDau(v).split(' ');
  for(var i = 0; i < t.length; i++) if(t[i]) ra[t[i]] = 1;
  return ra;
}
function tachTu(s){
  return boDau(s).split(' ').filter(function(t){
    return t.length >= 2 && HU_TU.indexOf(t) < 0;
  });
}

/* ─── Nguồn tra cứu: mỗi nguồn khai trường nào đáng cân nặng bao nhiêu ─── */
function nguon(){
  return [
    {kho:G.MOTHUC,   ten_kho:'MOTHUC',   loai:'Mô thức',   mau:'#2A72C6', go:'mo-thuc',
     ma:function(x){ return x.id; }, ten:function(x){ return x.title; },
     than:function(x){ return [x.title, (x.keywords||[]).join(' '), x.summary]; }},
    {kho:G.PHACDO, ten_kho:'PHACDO', loai:'Phác đồ',   mau:'#5140B4', go:'phac-do',
     ma:function(x){ return x.ma; }, ten:function(x){ return x.ten; },
     than:function(x){ return [x.ten, x.nhomTen, x.nguyenNhan, x.giaiPhap]; }},
    {kho:G.KICHBAN, ten_kho:'KICHBAN', loai:'Kịch bản',  mau:'#0B6675', go:'kich-ban',
     ma:function(x){ return x.ma; }, ten:function(x){ return x.ten; },
     than:function(x){ return [x.ten, x.mo, x.muc, x.tang]; }},
    /* Kho 250 tình huống dùng tên trường riêng: th · mo · pt · gp · key.
       Bản trước đọc x.ten và x.tinhHuong nên không bao giờ trúng — cả kho
       này im lặng suốt. Đọc đúng trường thì nó trả lời được. */
    {kho:G.TINHHUONG, ten_kho:'TINHHUONG', loai:'Tình huống',mau:'#0B7350', go:'tinh-huong',
     ma:function(x){ return x.key || x.ma || ('TH-' + x.stt); },
     ten:function(x){ return x.th || x.ten || x.tinhHuong; },
     than:function(x){ return [x.th, x.mo, x.pt, x.gp, x.chot]; }},
    {kho:G.BAIHOC, ten_kho:'BAIHOC', loai:'Bài học',   mau:'#0B7350', go:'tu-duy',
     ma:function(x){ return x.id; }, ten:function(x){ return x.ten; },
     than:function(x){ return [x.ten, x.nguyenLy, x.apDung]; }}
  ].concat(
    /* NGUỒN THÊM — đăng ký từ src/tro-ly-rong.js.

       Trước 9.72 trợ lý chỉ tra được NĂM kho trong tổng tám trăm.
       Nghĩa là mọi thứ dựng từ 9.65 tới 9.71 — hành lang, rà soát
       pháp lý, chuẩn bằng chứng, bộ hợp đồng, hướng dẫn ký kết, sổ
       tay quản trị, bảng tin nội bộ, bảng tự động hoá — trợ lý không
       trả lời được một câu nào. Mà nó vẫn TRẢ LỜI, bằng thứ gần
       giống trong năm kho cũ. Đo được 1 trên 20 câu là trúng.

       Mỗi nguồn thêm khai QUYỀN của nó. Nguồn nào người đang hỏi
       không có quyền thì không vào danh sách tra — khoá ở chỗ TRA,
       không phải ở chỗ hiện kết quả. */
    (G.aiNguonThem ? G.aiNguonThem() : []).filter(function(n){
      if(!n.quyen) return true;
      return G.can ? G.can(n.quyen) : false;
    })
  ).filter(function(n){ return Array.isArray(n.kho) && n.kho.length; });
}

/* ─── Câu hỏi có gọi tên một LOẠI tư liệu không ───
   "Phác đồ cho trẻ mất tập trung" thì phải ra phác đồ, không ra tình
   huống. Trước đây điểm chỉ tính theo từ trúng, nên loại được gọi
   tên thẳng vẫn thua một kho khác trùng nhiều từ hơn. */
function loaiDuocGoi(chu){
  var ra = {};
  [['MOTHUC','mo thuc'],['PHACDO','phac do'],['KICHBAN','kich ban'],
   ['TINHHUONG','tinh huong'],['BAIHOC','bai hoc']].forEach(function(p){
    if(chu.indexOf(p[1]) >= 0) ra[p[0]] = 1;
  });
  (G.aiNguonThem ? G.aiNguonThem() : []).forEach(function(n){
    (n.goiTen || []).forEach(function(t){
      if(t && chu.indexOf(boDau(t)) >= 0) ra[n.ten_kho] = 1;
    });
  });
  return ra;
}

/* Tài liệu gốc: 1.647 dòng bảng — tra riêng vì cấu trúc khác */
/* Tài liệu gốc: 1.647 dòng bảng — tra riêng vì cấu trúc khác, nhưng
   TRẢ VỀ CÙNG HÌNH với các nguồn kia (tiếng trúng, chưa chấm điểm).

   Bản trước nó tự chấm theo thang riêng — cộng 2 mỗi tiếng trúng —
   rồi được nối thẳng vào danh sách đã chấm theo thang khác. Hai thang
   trộn một chỗ thì thứ tự cuối cùng vô nghĩa: một dòng bảng gom 5
   tiếng thường được 10 điểm, thắng một bản ghi trúng đúng tên. */
function traTaiLieuGoc(tu){
  var ra = [];
  /* Tài liệu Drive: tra cả bảng lẫn đoạn văn */
  (G.TAILIEU_DRIVE || []).forEach(function(d){
    (d.doan || []).forEach(function(v){
      var tp = tapTieng(v), tr = [];
      tu.forEach(function(t){ if(tp[t]) tr.push(t); });
      if(tr.length >= 3) ra.push({
        trungTen: [], trungThan: tr, boLoai: false, diem: 0, loai: 'Tài liệu Học viện', mau: '#185AB4', go: 'tai-lieu-goc',
        ma: d.ma, ten: d.ten, tom: v.slice(0, 280), muc: d.mo});
    });
    (d.bang || []).forEach(function(b){
      b.hang.forEach(function(h2){
        var tp = tapTieng(h2.join(' ')), tr = [];
        tu.forEach(function(t){ if(tp[t]) tr.push(t); });
        if(tr.length >= 3) ra.push({
          trungTen: [], trungThan: tr, boLoai: false, diem: 0, loai: 'Tài liệu Học viện', mau: '#185AB4', go: 'tai-lieu-goc',
          ma: d.ma, ten: h2[0] || d.ten, tom: h2.slice(1, 3).join(' — ').slice(0, 260), muc: d.ten});
      });
    });
  });
  (G.TAILIEU_GOC || []).forEach(function(d){
    d.bang.forEach(function(b){
      b.hang.forEach(function(h){
        var tp = tapTieng(h.join(' ')), tr = [];
        tu.forEach(function(t){ if(tp[t]) tr.push(t); });
        if(tr.length >= 2) ra.push({
          trungTen: [], trungThan: tr, boLoai: false, diem: 0, loai: 'Tài liệu gốc', mau: '#BE0E16', go: 'tai-lieu-goc',
          ma: d.ma + '·' + (h[0] || ''), ten: h[1] || h[0],
          tom: h.slice(2, 4).join(' — ').slice(0, 260), muc: b.muc || d.ten
        });
      });
    });
  });
  return ra;
}

/* ─── Tra kho ─── */
G.aiTra = function(cauHoi){
  /* ═══ TỪ 9.73: ĐI QUA CHỈ MỤC TỰ DÒ ═══

     Phần dưới hàm này tra 30 kho đã khai tay. Đo trên vai Coach:
     trong bộ nhớ có 528 kho · 10.485 bản ghi. Ba mươi trên năm trăm
     hai tám — 94% tri thức nằm ngay trong máy mà không tra tới, và
     trợ lý KHÔNG im lặng, nó trả lời bằng thứ gần giống trong ba
     mươi kho kia.

     src/tro-ly-chi-muc.js dò lấy toàn bộ, chấm bằng BM25 trên một
     chỉ mục ngược, và trả về ĐÚNG hình mà bảy chỗ gọi aiTra đang
     mong — kể cả ba ô giuLaiVuotTang · khoChuaKhaiTang · tangNha mà
     mục 71 của bộ kiểm đọc tới.

     Vì sao vẫn giữ nguyên phần cũ bên dưới: nếu tệp chỉ mục không
     nạp được vì bất cứ lý do gì, trợ lý phải còn tra được ba mươi
     kho chứ không được câm. Một đường lui hẹp còn hơn không có
     đường nào. */
  if (typeof G.tlTra === 'function') return G.tlTra(cauHoi);

  var tu = tachTu(cauHoi);
  if(!tu.length) return [];
  var ra = [];
  /* Tầng của người đang hỏi. null nghĩa là KHÔNG LỌC (người trong nghề),
     không phải tầng 0 — hai thứ ấy khác nhau, tầng 0 thì chặn hết. */
  var tangNha = G.aiTangNha ? G.aiTangNha() : null;
  var giuLai = 0, khoChuaKhai = [];
  var goiLoai = loaiDuocGoi(boDau(cauHoi));
  /* Đếm mỗi tiếng xuất hiện ở bao nhiêu bản ghi — dùng ở lượt hai. */
  var dfTu = {};
  nguon().forEach(function(n){
    n.kho.forEach(function(x){
      /* KHỚP TRỌN TIẾNG, KHÔNG KHỚP CHUỖI CON

         Bản trước dùng indexOf trên chuỗi đã bỏ dấu, nên "cong" trúng
         cả trong "chung", "khong", "cong viec". Với tiếng Việt — mà
         mỗi tiếng là một âm ngắn — chuyện ấy làm điểm nở ra ở mọi kho.

         Hậu quả đo được: kho 250 tình huống và kho 200 kịch bản LUÔN
         thắng kho 18 virus, vì kho to thì thế nào cũng có một bản ghi
         gom đủ vài tiếng trùng. Trợ lý trả lời sai mà rất tự tin.

         Tách thành tập TIẾNG rồi so bằng nhau thì hết. */
      /* KHỚP TRỌN TIẾNG, KHÔNG KHỚP CHUỖI CON

         Bản trước dùng indexOf trên chuỗi đã bỏ dấu, nên "cong" trúng
         cả trong "chung", "khong", "cong viec". Với tiếng Việt — mà
         mỗi tiếng là một âm ngắn — chuyện ấy làm điểm nở ra ở mọi kho. */
      var truong = n.than(x).map(function(v){ return tapTieng(v); });
      var trungTen = [], trungThan = [];
      tu.forEach(function(t){
        if(truong[0] && truong[0][t]) { trungTen.push(t); return; }
        for(var i = 1; i < truong.length; i++)
          if(truong[i] && truong[i][t]){ trungThan.push(t); return; }
      });
      if(!trungTen.length && !trungThan.length) return;

      /* ── TRẦN TẦNG ──
         KHÔI PHỤC Ở 9.72, VÀ GHI LẠI VÌ SAO NÓ TỪNG BIẾN MẤT

         Lượt viết lại phần chấm điểm ở 9.72 thay nguyên khối từ chỗ
         đọc trường tới chỗ đẩy kết quả — và khối ấy CHỨA cả trần
         tầng. Trần biến mất mà không dòng nào báo: trợ lý vẫn chạy,
         vẫn trả lời, chỉ là trả lời cả tư liệu tầng trên cho một nhà
         chưa tới tầng ấy.

         Bộ kiểm mục 71 bắt được, qua đúng hai phép đo phụ mà nó giữ
         riêng cho chỗ này: demDuocGiuLai và manInGiuLai. Không có
         hai phép ấy thì lỗi này đi thẳng ra bản phát hành.

         Khác trần 30%: vượt tầng thì KHÔNG hiện gì cả, kể cả tên. Tư
         liệu tầng trên đọc mà không dùng được vì nền chưa có, và hiện
         tên ra chỉ tạo một cơn thèm không giúp gì cho tối nay. */
      if(G.aiTrongTang){
        var tt = G.aiTrongTang(n.ten_kho, x, tangNha);
        if(!tt.ok){ giuLai++; return; }
        if(tt.chuaKhaiTang && khoChuaKhai.indexOf(n.ten_kho) < 0) khoChuaKhai.push(n.ten_kho);
      }

      /* Chưa chấm điểm ở đây. Điểm tính ở LƯỢT HAI, khi đã biết mỗi
         tiếng hiếm tới đâu — xem chú giải dưới. */
      trungTen.concat(trungThan).forEach(function(t){ dfTu[t] = (dfTu[t] || 0) + 1; });
      ra.push({
        trungTen: trungTen, trungThan: trungThan, boLoai: !!goiLoai[n.ten_kho],
        diem: 0, loai: n.loai, mau: n.mau, go: n.go,
        /* Tên kho nguồn. Thiếu ô này thì không ai — kể cả bộ đo — nói
           được câu trả lời lấy từ đâu, và một câu trả lời không dẫn
           được nguồn thì đúng bằng một câu đoán. */
        khoNguon: n.ten_kho,
        ma: n.ma(x) || '', ten: n.ten(x) || '',
        tom: String(n.than(x)[2] || n.than(x)[1] || '').slice(0, 260)
      });
    });
  });
  /* Nối tài liệu gốc vào TRƯỚC lượt hai, để nó được chấm cùng thang
     với mọi nguồn khác. */
  traTaiLieuGoc(tu).forEach(function(x){
    x.trungThan.forEach(function(t){ dfTu[t] = (dfTu[t] || 0) + 1; });
    ra.push(x);
  });

  /* ═══ LƯỢT HAI: CHẤM THEO ĐỘ HIẾM VÀ ĐỘ PHỦ ═══

     Hai chỗ hỏng mà lượt một không chữa được:

     1. ĐIỂM KHÔNG CHUẨN HOÁ. Kho 250 tình huống có 250 lần thử, kho
        18 virus chỉ có 18. Cộng điểm thô thì kho to luôn thắng, và
        đo được đúng thế: hỏi về virus thì ra mô thức.

     2. MỌI TIẾNG NẶNG NHƯ NHAU. "virus" chỉ có ở vài bản ghi, "hành"
        có ở khắp nơi — mà cả hai đều được tính hai điểm.

     Chữa: mỗi tiếng nặng theo ĐỘ HIẾM của nó (tiếng có ở càng ít bản
     ghi thì càng nặng), và điểm cuối chia cho số tiếng của câu hỏi,
     tức là đo ĐỘ PHỦ CÂU HỎI chứ không đo tổng điểm gom được. */
  var soBanGhi = ra.length || 1;
  function nang(t){
    var df = dfTu[t] || 1;
    /* Tiếng có mặt ở quá nửa số bản ghi trúng thì gần như vô nghĩa. */
    return Math.log(1 + soBanGhi / df);
  }
  var nangCauHoi = 0;
  tu.forEach(function(t){ nangCauHoi += nang(t); });
  if(!nangCauHoi) nangCauHoi = 1;

  ra.forEach(function(x){
    var d = 0;
    x.trungTen.forEach(function(t){ d += nang(t) * 2.5; });
    x.trungThan.forEach(function(t){ d += nang(t); });
    /* Chia cho tổng nặng của câu hỏi: bản ghi phủ được nhiều phần
       câu hỏi thì thắng, không phải bản ghi gom được nhiều tiếng. */
    x.diem = d / nangCauHoi * 10;
    /* Loại được gọi thẳng tên trong câu hỏi là tín hiệu rõ nhất
       người hỏi đưa ra — rõ hơn mọi tiếng khác. Nhân chứ không cộng,
       để nó không bị một kho to gom điểm vượt qua. */
    if(x.boLoai) x.diem *= 2.2;
  });
  ra = ra.filter(function(x){ return x.diem >= 2.2; });

  ra.sort(function(a, b){ return b.diem - a.diem; });

  /* bỏ trùng theo mã */
  var thay = {}, loc = [];
  ra.forEach(function(x){
    var k = x.loai + '|' + x.ma;
    if(thay[k]) return;
    thay[k] = 1; loc.push(x);
  });
  loc = loc.slice(0, 12);

  /* Ghi mức dùng tài nguyên: mỗi tư liệu trợ lý mở ra cho người trong nghề
     đều tính một lần chạm. Đây là chỗ đếm chính xác nhất, vì tra kho là
     đường mà cả người làm việc lẫn người gom kho đều phải đi qua. */
  if(G.chamTaiNguyen) loc.forEach(function(x){ G.chamTaiNguyen(x.loai, x.ma); });

  /* Gắn con số vào chính mảng kết quả thay vì trả về một hình khác: bảy
     chỗ đang gọi aiTra và đều mong một MẢNG. Đổi hình trả về là sửa bảy
     chỗ, mà quên một chỗ thì nó im lặng hỏng. */
  loc.giuLaiVuotTang = giuLai;
  loc.khoChuaKhaiTang = khoChuaKhai;
  loc.tangNha = tangNha;
  return loc;
};

/* ─── Lưới an toàn: dấu hiệu khẩn phải bắt được kể cả khi kho chưa mở ───
   Không phụ thuộc dữ liệu trong kho, vì đây là đường không được phép hỏng. */
var DAU_KHAN = ['tu tu','tu sat','muon chet','khong muon song','tu hai','rach tay',
  'bo nha','bo di','danh nhau','bao luc','tram cam','hoang loan','cap cuu','chay mau',
  'ngat','uong thuoc','xam hai','bat nat nang'];
G.aiCoKhan = function(cauHoi){
  var chu = boDau(cauHoi);
  for(var i = 0; i < DAU_KHAN.length; i++)
    if(chu.indexOf(DAU_KHAN[i]) >= 0) return true;
  return false;
};
var LOI_KHAN = 'Chuyện này em không trả lời bằng máy được. Anh chị gọi ngay hotline 08.5555.4688 ' +
  'để có người thật nghe. Nếu đang có nguy hiểm ngay lúc này, gọi 115 hoặc tới cơ sở y tế gần nhất trước đã.';

/* ─── Đọc ý định câu hỏi ─── */
G.aiYDinh = function(cauHoi){
  var K = G.KICHBAN_AI;
  if(!K) return null;
  var chu = boDau(cauHoi);
  /* Chấm theo ĐỘ DÀI từ khoá trúng, không đếm số lần trúng: "điện thoại"
     cụ thể hơn "bắt đầu", nên phải thắng khi câu hỏi có cả hai. */
  var tot = null, cao = 0;
  K.yDinh.forEach(function(y){
    var d = 0;
    y.dau.forEach(function(t){
      var k = boDau(t);
      if(k && chu.indexOf(k) >= 0) d += k.length;
    });
    if(d > cao){ cao = d; tot = y; }
  });
  return cao ? tot : null;
};

/* ─── Trả lời một câu ─── */
G.aiTraLoi = function(cauHoi){
  var K = G.KICHBAN_AI || {};
  var khach = G.LA_KHACH && G.LA_KHACH();
  var giong = khach ? 'nha' : 'nghe';
  var y = G.aiYDinh(cauHoi);

  /* Dấu hiệu khẩn — dừng trả lời tự động, chuyển người thật.
     Kiểm bằng lưới an toàn TRƯỚC, rồi mới tới kịch bản trong kho. */
  if(G.aiCoKhan(cauHoi) || (y && y.ma === 'KHAN')){
    if(!y || y.ma !== 'KHAN') y = {ma:'KHAN', ten:'Cần người thật', nhip:'DỪNG'};
    if(G.secLog) G.secLog('Trợ lý chuyển người thật',
      'Câu hỏi có dấu hiệu khẩn · ' + (G.S.acc && G.S.acc.u), 'Cảnh báo');
    return {khan:true, loi:(y[giong] || LOI_KHAN), nguon:[], y:y};
  }

  /* ── HỎI VỀ MỘT VIỆC TRONG KHO THỰC HÀNH ──
     Đứng TRƯỚC phần tra kho: người hỏi "làm sao làm BD1-03" cần bốn nhịp
     dẫn việc ấy, không cần mười hai tư liệu có chữ "ghi" trong đó. Một
     việc một lượt — đổ ra cả bánh đà là trả lại đúng cái bảng họ đang
     thấy khó, mà họ hỏi chính vì cái bảng ấy quá nhiều. */
  var viec = G.aiDanViec ? G.aiDanViec(cauHoi) : null;

  /* ── NÓI TIẾP (9.76) ──
     ĐỨNG SAU LƯỚI KHẨN, và đó là thứ tự bắt buộc. Một phụ huynh đang
     hỏi học phí, lượt sau gõ "con nói muốn chết" — bốn tiếng, rất
     ngắn, trông hệt một câu nói tiếp. Dựng lại trước khi soi khẩn thì
     lưới soi câu học phí và không bao giờ nhìn thấy bốn tiếng kia.

     Khối khẩn ở trên đã return rồi, nên tới được đây nghĩa là câu này
     đã qua lưới. */
  var tiep = G.tlDocNoiTiep ? G.tlDocNoiTiep(cauHoi) : { la: false };
  var hoiThat = tiep.la && G.tlDungLai ? G.tlDungLai(cauHoi, tiep) : cauHoi;

  var tim = G.aiTra(hoiThat);

  /* ── CỬA ĐỘ KHÓ (9.74) ──
     Trước bản này trợ lý chỉ có HAI trạng thái: trả lời, hoặc dừng
     vì dấu hiệu khẩn. Giữa hai thứ ấy là một khoảng rất rộng, và mọi
     ca khó rơi hết vào đó — tức là trợ lý CỨ TRẢ LỜI. Nó trả lời một
     câu về hoàn tiền y như trả lời một câu về giờ học.

     src/do-kho.js chấm ca từ 1 tới 10: 1-3 máy tự biên tập theo
     nguồn; 4-10 phải có Coach hoặc Tư vấn bật khoá. Mã ca lấy theo
     nhà đang mở, vì một khoá mở cho ĐÚNG một ca. */
  var kho = null;
  if (G.dkCua) {
    var maCa = (G.S && (G.S.nhaDangMo || (G.S.acc && G.S.acc.u))) || 'CA-CHUNG';
    /* Chấm trên câu ĐÃ DỰNG LẠI, không chấm trên bốn tiếng cụt. Hỏi
       "hoàn tiền bao nhiêu" là cấp 6 chờ người bật; hỏi tiếp "còn
       nữa" mà chấm lại từ đầu thì ra cấp 1 và máy tự trả lời — đúng
       đường vòng mà cả thang độ khó dựng lên để chặn.
       tlCapNoiTiep lấy cấp CAO HƠN giữa cấp cũ và cấp vừa chấm. */
    kho = G.dkCua(hoiThat, tim, maCa, tim.tangNha);
    if (tiep.la && G.tlCapNoiTiep && kho) {
      var capThat = G.tlCapNoiTiep(tiep, kho.cap);
      if (capThat > kho.cap) kho = G.dkCua(tiep.ngu.hoi, tim, maCa, tim.tangNha);
    }
  }

  /* ── BẢN SOẠN (9.75) ──
     CHỈ soạn khi độ khó cho phép máy tự làm. Cấp 4 trở lên thì việc
     cần làm là CHỌN chứ không phải chép, và một bản soạn trôi chảy ở
     đúng chỗ ấy là thứ nguy nhất: nó làm người đọc tin rằng câu hỏi
     đã được trả lời xong, trong khi nó đang chờ một người bật khoá. */
  /* ── TỰ KIỂM (9.77) ──
     "Hệ có gì sai không" thì CHẠY THẬT rồi nói con số, chứ không đi
     tra kho về chủ đề rà soát. Đứng TRƯỚC bộ soạn vì nó không tra
     kho — kết quả nó đưa ra là trạng thái đang chạy, không phải một
     bản ghi nào cả. */
  var soan = null;
  if (G.tlLaCauSoat && G.tlLaCauSoat(cauHoi) && G.tlSoanSoat) {
    try { soan = G.tlSoanSoat(); } catch (e) { soan = null; }
  }
  if (!soan && G.tlSoan && (!kho || kho.lam !== false)) {
    try {
      soan = G.tlSoan(hoiThat, tim);
      if (tiep.la && G.tlSoanTiep) soan = G.tlSoanTiep(tiep, soan, tim);
    } catch (e) { soan = null; }
  }
  /* Bản tự kiểm KHÔNG ghi ngữ cảnh: nó không nói về một kho nào, nên
     "còn nữa" sau nó không có gì để nối tiếp. */
  if (soan && (soan.y === 'SOAT' || soan.y === 'SOAT_CAM')) {
    if (G.tlQuenNgu) G.tlQuenNgu();
    return { khan: false, y: y, soan: soan, noiTiep: null, viec: viec,
      doKho: null, chuaCo: false, thieu: '', chot: '',
      giuLaiVuotTang: 0, khoChuaKhaiTang: [], tangNha: tim.tangNha, nguon: [] };
  }
  /* Ghi ngữ cảnh cho lượt sau. Ghi CẢ khi lượt này là nối tiếp, để
     "còn nữa" hai lần liền không lặp lại cùng một khúc. */
  if (G.tlGhiNgu) {
    if (soan && soan.y !== 'HET')
      G.tlGhiNgu(tiep.la ? tiep.ngu.hoi : cauHoi, soan, kho ? kho.cap : 1, tiep.la);
    else if (soan && soan.y === 'HET' && G.TL_NGU)
      G.TL_NGU.luc = Date.now();
    else if (kho && kho.lam === false && tim.length) {
      /* ── CA BỊ CHẶN CŨNG PHẢI GHI NGỮ CẢNH ──
         Cấp 4 trở lên thì không soạn, nên bản đầu không ghi gì. Hậu
         quả đo được: hỏi "hoàn tiền bao nhiêu" (cấp 6, chờ người
         bật) rồi hỏi tiếp "còn nữa" thì lượt sau thành một câu hỏi
         MỚI — bốn tiếng cụt, kho không đỡ nổi, và cấp nhảy lên 10.
         Cấp 10 kéo cả Admin lẫn Super Admin vào một ca hoàn tiền
         thường: đúng lớp leo thang vô ích đã chữa ở 9.75, chui vào
         lại bằng một cửa khác.
         Ghi ngữ cảnh RỖNG mục nhưng ĐỦ cấp và đủ kho. */
      G.tlGhiNgu(tiep.la ? tiep.ngu.hoi : cauHoi,
        { kho: tim[0].khoNguon, loai: tim[0].loai, y: 'CHO_BAT', dong: [] },
        kho.cap, tiep.la);
    }
  }

  return {
    khan: false,
    y: y,
    soan: soan,
    noiTiep: tiep.la ? { kieu: tiep.kieu, hoiThat: hoiThat } : null,
    /* Ô này đi CÙNG câu trả lời chứ không nằm lại trong hàm chấm:
       màn hình phải nói được cấp mấy, ai đang phải bật, và nếu không
       bật thì ai làm trực tiếp. */
    doKho: kho,
    loi: y ? y[giong] : null,
    viec: viec,
    chuaCo: !tim.length && !viec,
    thieu: (!tim.length && !viec) ? (K.chuaCo ? K.chuaCo[giong] : '') : '',
    chot: K.chot ? K.chot[giong] : '',
    /* Ba con số này nói cái trợ lý KHÔNG đưa ra, và chúng phải đi cùng
       câu trả lời chứ không nằm lại trong hàm tra. */
    giuLaiVuotTang: tim.giuLaiVuotTang || 0,
    khoChuaKhaiTang: tim.khoChuaKhaiTang || [],
    tangNha: tim.tangNha,
    nguon: tim
  };
};
})();

/* ═══════════════════════════════════════════════════════════════
   GIAO DIỆN TRỢ LÝ — một khung trò chuyện, mở được từ mọi màn hình
   ═══════════════════════════════════════════════════════════════ */
(function(){
var U = G.U, h = U.h, ic = U.ic;
G.AI_HOI = [];        /* lịch sử phiên này, không ghi ra đĩa */

function goiY(){
  if(G.LA_KHACH && G.LA_KHACH())
    return ['Con ôm điện thoại, mình bắt đầu từ đâu?',
            'Con không tự giác, phải nhắc mãi',
            'Nhà mình đang căng, nói chuyện thế nào?',
            'Hôm nay nhà mình nên làm việc gì?',
            'Khi nào thì nhà mình lên chặng sau?'];
  return ['Phác đồ cho ca ôm điện thoại tầng 2',
          'Kịch bản mở cửa cho phụ huynh còn nghi ngờ',
          'Mô thức nào dùng khi học viên mất động lực',
          'Cổng nghiệm thu tầng 3 gồm những gì',
          'Tình huống con chuyển trường tụt điểm'];
}

G.aiHoi = function(cauHoi){
  cauHoi = String(cauHoi || '').trim();
  if(!cauHoi) return;
  var d = G.aiTraLoi(cauHoi);
  G.AI_HOI.push({hoi: cauHoi, dap: d, luc: new Date()});
  if(G.secLog) G.secLog('Hỏi trợ lý',
    cauHoi.slice(0, 80) + ' → ' + (d.khan ? 'chuyển người thật' : d.nguon.length + ' nguồn'), 'Ghi nhận');
  veKhung();
};

function theDap(d){
  var o = '';
  if(d.khan){
    return '<div class="ai-khan">'+ic('shield','w-5 h-5')+
      '<div><b>Việc này cần người thật, không phải trợ lý</b>'+
      '<p>'+h(d.loi)+'</p></div></div>';
  }
  if(d.y) o += '<div class="ai-nhip">'+ic('compass','w-3 h-3')+
    '<span>'+h(d.y.ten)+' · nhịp '+h(d.y.nhip)+'</span></div>';
  if(d.loi) o += '<p class="ai-loi">'+h(d.loi)+'</p>';

  if(d.chuaCo){
    o += '<div class="ai-chuaco">'+ic('seed','w-4 h-4')+'<span>'+h(d.thieu)+'</span></div>';
    return o;
  }

  o += '<div class="ai-nguon-nhan">'+d.nguon.length+' tư liệu trong kho — bấm để mở</div>';
  o += '<div class="ai-ds">'+ d.nguon.map(function(n){
    return '<button class="ai-n" style="--nc:'+n.mau+'" data-v="'+h(n.go)+'">'+
      '<div class="ai-n-h"><span class="ai-n-loai">'+h(n.loai)+'</span>'+
        '<span class="ai-n-ma mono">'+h(n.ma)+'</span></div>'+
      '<b>'+h(n.ten)+'</b>'+
      (n.tom ? '<p>'+h(n.tom)+'</p>' : '')+
      (n.muc ? '<span class="ai-n-muc">'+h(n.muc)+'</span>' : '')+
    '</button>';
  }).join('') +'</div>';
  if(d.chot) o += '<p class="ai-chot">'+h(d.chot)+'</p>';
  return o;
}

function veKhung(){
  var o = document.getElementById('aiKhung');
  if(!o) return;
  o.innerHTML = G.AI_HOI.map(function(x){
    return '<div class="ai-luot">'+
      '<div class="ai-hoi">'+h(x.hoi)+'</div>'+
      '<div class="ai-dap">'+theDap(x.dap)+'</div></div>';
  }).join('');
  o.scrollTop = o.scrollHeight;
}

/* ═══ MÀN TRỢ LÝ CŨ ĐÃ GỠ Ở BẢN 9.48 ═══
   Bản này bị src/tro-ly-chat.js đè (nạp sau trong danh-sach-src.json),
   nên nó chưa từng hiện ra kể từ v8.2. Gỡ đi để đọc mã là biết đúng một
   màn đang chạy — chứ không phải đọc ba bản rồi tự đoán bản nào thắng.

   Phần TRA KHO ở nửa trên tệp này VẪN CHẠY và là bản duy nhất: G.aiTra,
   G.aiTraLoi, lưới an toàn DAU_KHAN. Chỉ phần vẽ màn là chết.

   Màn thật: src/tro-ly-chat.js. Lọc theo tầng: src/tro-ly-tang.js. */

/* Nút trợ lý nổi — mở được từ mọi màn hình */
G.moTroLy = function(){ G.go('tro-ly'); };

/* Bộ nghe [data-aiq] và phím Enter nay nằm TRỌN trong src/tro-ly-chat.js.
   Trước đây ba tệp cùng bắt một selector ở cấp document — app.js, tệp này và
   tro-ly-chat.js — nên bấm một chip gợi ý là hỏi trợ lý ba lần, khung chat
   lặp lại câu hỏi ba lần và nhật ký ghi ba dòng trùng. */

})();
