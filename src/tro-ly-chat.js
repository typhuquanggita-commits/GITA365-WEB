/* ═══════════════════════════════════════════════════════════════
   GITA 365 · v8.2 — KHUNG TRÒ CHUYỆN VỚI TRỢ LÝ
   Bản trước là ô tra cứu: gõ một câu, nhận một khối kết quả. Nó đúng
   nhưng không giống người. Bản này là một cuộc trò chuyện thật, đi theo
   sáu nhịp của mô thức huấn luyện GITA:

     N1 MỞ · N2 NGHE · N3 CÔNG NHẬN · N4 LÀM RÕ · N5 DẪN ĐƯỜNG · N6 GIỮ

   Ba việc khung này làm khác một khung chat thường:

     · Trợ lý chào trước bằng đúng giọng của người đang nghe — lời nhà
       mình cho phụ huynh và học viên, lời nghề cho đội ngũ.
     · Câu có dấu hiệu khẩn thì trợ lý DỪNG, không kèm tư liệu, chuyển
       thẳng sang người thật. Đây là đường không được phép hỏng.
     · Tư liệu nằm ngoài phần nền 30% của gia đình vẫn hiện tên, nhưng
       không mở ra ở đây. Nó đi qua Tư vấn hoặc Coach — có người thật đọc
       lại rồi mới gửi. Gia đình bấm một nút để đặt lời xin.

   Toàn bộ chạy trong máy. Không gọi ra mạng, không có nút tải xuống,
   không có tệp nén: đọc thẳng trên ứng dụng.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;

(function(){
var U = G.U, h = U.h, ic = U.ic;

/* Lịch sử phiên này. Không ghi ra đĩa: chuyện của một nhà không nằm lại
   trên máy chung. Đóng ứng dụng là hết. */
G.CHAT = G.CHAT || [];

/* Những gì phụ huynh đã trả lời trong chuỗi, và câu mở đầu chuỗi.
   Đây là toàn bộ chỗ "vòng lặp thông minh" nằm ở: mỗi câu trả lời cộng
   vào đây thì bộ key vòng sau hẹp hơn vòng trước.

   Để trong tệp, KHÔNG gắn lên G. Hai lý do: chuyện của một nhà không
   nằm lại trên máy chung, và một mảng rỗng gắn lên G thì bộ rà soát đọc
   nó như một KHO dữ liệu khai báo mà để trống — nó đã báo đỏ đúng như
   thế. Trạng thái phiên và kho dữ liệu là hai thứ khác nhau; để lẫn một
   chỗ thì mọi phép đo về kho đều phải học cách bỏ qua ngoại lệ. */
var kbDa = [], kbCau = '';
var chuPhien = null;

function kiemTraPhien(){
  var a = G.S && G.S.acc;
  var f = a && G.myFamily ? G.myFamily() : null;
  var id = a && [a.uid || a.u || a.ten, G.S.role, f && f.tier].join('|');
  if(chuPhien !== id){
    chuPhien = id;
    G.CHAT = [];
    kbDa = [];
    kbCau = '';
    if(G.tlQuenNgu) G.tlQuenNgu();
  }
}

function khach(){ return !!(G.LA_KHACH && G.LA_KHACH()); }
function tenToi(){ return (G.S.acc && G.S.acc.ten) || 'Anh chị'; }

/* ─── Lời chào mở đầu, theo nhịp N1 ───
   Trợ lý CHỦ ĐỘNG XƯNG theo tên tài khoản đang chat (chủ hệ yêu cầu), và
   nói rõ mình ĐỊNH HƯỚNG theo kho tài liệu GITA 365. Tên lấy từ hồ sơ
   phiên; chưa có thì lùi về "anh chị" — không bao giờ để trống. */
function loiChao(){
  var K = G.KICHBAN_AI, ten = tenToi();
  if(khach()){
    var f = G.myFamily ? G.myFamily() : null;
    var nho = G.tlChaoNho ? G.tlChaoNho() : '';
    var than = (K && K.moDau && K.moDau.nha) ||
      ('Nhà mình đang mắc chuyện gì, kể em nghe.' +
       (f && f.nha ? ' Em đang mở hồ sơ ' + f.nha + '.' : ''));
    return 'Chào ' + ten + '. ' + than +
      ' Em đi theo kho tài liệu GITA 365 để dẫn nhà mình đúng chặng đang ở.' + nho;
  }
  var thanN = (K && K.moDau && K.moDau.nghe) ||
    'Em là trợ lý nghiệp vụ của Học viện — hỏi em phác đồ, kịch bản mở cửa, mô thức, ' +
    'cổng nghiệm thu, KPI, quy trình lương·duyệt chi, hay một tình huống khó với gia đình. ' +
    'Em tra thẳng kho tài liệu GITA 365 và chỉ đúng tư liệu, có mã để mở lại.';
  return 'Chào ' + ten + '. ' + thanN;
}

/* Câu gợi ý = KỊCH BẢN MỞ LỜI, phủ trọn hành trình. Với KHÁCH là các
   chặng tư vấn một gia đình đi qua; với NHÂN SỰ là các việc nghề hay tra.
   Chip chạy ngang một hàng và cuộn, nên thêm câu không ăn chỗ dọc. */
function goiY(){
  if(khach())
    return ['Con ôm điện thoại, mình bắt đầu từ đâu?',
            'Con không tự giác, phải nhắc mãi',
            'Nhà mình đang căng, nói chuyện thế nào?',
            'Con mất động lực học, làm sao đây?',
            'Hai vợ chồng chưa thống nhất cách dạy con',
            'Hôm nay nhà mình nên làm việc gì?',
            'Nhà mình đang ở chặng nào, bước tiếp là gì?',
            'Học phí và lộ trình các tầng thế nào?',
            'Khi nào thì nhà mình lên chặng sau?'];
  return ['Phác đồ cho ca ôm điện thoại tầng 2',
          'Kịch bản mở cửa cho phụ huynh còn nghi ngờ',
          'Xử lý khi phụ huynh từ chối hoặc đòi giảm giá',
          'Mô thức nào dùng khi học viên mất động lực',
          'Cổng nghiệm thu tầng 3 gồm những gì',
          'KPI của tôi tháng này tính thế nào',
          'Quy trình chốt lương và duyệt chi',
          'Tình huống con chuyển trường tụt điểm'];
}

/* ═══════════ MỘT LƯỢT TRẢ LỜI ═══════════ */
G.chatHoi = function(cauHoi){
  cauHoi = String(cauHoi || '').trim();
  if(!cauHoi) return;
  kiemTraPhien();
  G.CHAT.push({ai:'toi', loi:cauHoi, luc:new Date()});
  /* CÂU HỎI MỚI hay CÂU TRẢ LỜI cho vòng đang hỏi?
     Một câu dài, hoặc có dấu hỏi, là một câu hỏi MỚI — mở lại chuỗi từ
     đầu. Một câu ngắn ("buổi tối", "vừa bị nhắc") là câu trả lời cho
     vòng đang hỏi, và nó đi vào chỗ thu hẹp chứ không đi tra kho.

     Bản đầu coi MỌI câu sau câu một là câu trả lời, và chỗ ấy hỏng nặng:
     phụ huynh gõ một chuyện khẩn ở lượt thứ hai thì cả lượt ấy được đem
     đi trả lời theo câu hỏi thứ NHẤT — lưới an toàn không bao giờ nhìn
     thấy chữ "tự tử". Đường ấy không được phép hỏng, nên nay lưới an
     toàn soi CHÍNH câu vừa gõ, mọi lượt, không có ngoại lệ. */
  var coVong = !!kbCau && !!(G.CHAT.slice(0, -1).filter(function(m){
    return m.ai === 'trolY' && m.dap && m.dap.chuoi;
  }).length);
  var laCauMoi = !coVong || /[?？]/.test(cauHoi) ||
    /^(chuyển chủ đề|chuyện khác|học phí|giá|đăng nhập|làm sao|tôi muốn hỏi|mình muốn hỏi)/i.test(cauHoi);
  if(G.aiCoKhan && G.aiCoKhan(cauHoi)) laCauMoi = true;
  if(laCauMoi){ kbCau = cauHoi; kbDa = []; }
  else kbDa.push(cauHoi);
  var d = G.aiTraLoi(laCauMoi ? cauHoi : kbCau);
  /* Chuỗi chạy cho những vai kho khai ở KB_LUAT.chayChoAi — hôm nay là
     Tư vấn và nhánh Coach. Bản đầu chạy cho MỖI khách hàng, tức là đúng
     nhóm KHÔNG có kho tình huống trên máy: chuỗi rỗng cho người có nó
     trong tay, và im lặng cho người không có. */
  /* Gia đình nay CŨNG chạy chuỗi — tình huống nạp theo phiên từ máy chủ,
     xem src/tinh-huong-khach.js. Chưa nạp được thì chuỗi im lặng chứ
     không vẽ ra một khung rỗng. */
  var laKhachCoKho = (G.LA_KHACH && G.LA_KHACH()) &&
    (G.thKhachDangCo ? G.thKhachDangCo().co : false);
  var chay = laKhachCoKho ||
    ((G.KB_LUAT || {}).chayChoAi || []).indexOf(G.S.role) >= 0;
  if(G.kbChuoi && chay && !d.khan){
    d.chuoi = G.kbChuoi(kbCau, kbDa);
    if(d.chuoi && !laCauMoi && khach()){
      d.tinhTiet = kbDa.slice(-3).join(' → ');
      d.loi = null;
      d.kbs = null;
      d.soan = null;
      d.viec = null;
      d.nguon = [];
      d.chuaCo = false;
      d.chot = '';
    }
    if(G.kbNghiepVu) d.nghiepVu = G.kbNghiepVu(kbCau);
    if(G.gnMoDau && d.chuoi){
      d.mo = G.gnMoDau(d.chuoi.vong.ma);
      d.mu = (G.gnMu(d.chuoi.vong.ma) || []).filter(function(m){
        return G.gnDoiMuDuoc(m.ma, d.chuoi.vong.ma);
      });
      d.batNhip = G.gnBatNhip(kbCau);
    }
  }
  /* Hỏi thẳng thì trả lời thẳng — một câu, rồi quay lại việc đang dở.
     Đường này đứng NGOÀI mọi điều kiện vai và mọi trạng thái chuỗi: ai
     hỏi cũng được trả lời, kể cả giữa lúc đang khẩn. */
  if(G.gnHoiLaMay && G.gnHoiLaMay(cauHoi)) d.noiThat = G.gnNoiThat();
  /* Câu bật ra giữa chừng. Trả lời rồi QUAY LẠI vòng đang dở — bỏ chuỗi
     để chạy theo câu hỏi phụ là mất chỗ vừa khoanh được. */
  if(G.gnPhatSinh && !d.khan) d.phatSinh = G.gnPhatSinh(cauHoi);
  /* Gắn VAI đang trả lời, câu "hiểu ý" của chuyên gia ngôn ngữ, phân tích
     số liệu của nhà khoa học toán, và ghi nhớ nhà mình (src/tro-ly-nang.js). */
  if(G.tlPhanTich) G.tlPhanTich(cauHoi, d);
  if(G.secLog) G.secLog('Hỏi trợ lý',
    cauHoi.slice(0, 80) + ' → ' + (d.khan ? 'chuyển người thật' : d.nguon.length + ' nguồn'),
    d.khan ? 'Cảnh báo' : 'Ghi nhận');
  phatTung(d);
};

/* ═══════ ĐƯA TỪNG ĐOẠN — như một người đọc rồi mới trả lời ═══════
   Chủ hệ: đừng đổ cả khối tức thì (đọc ra máy móc, khách hết hứng). Nên
   một lượt trả lời đi làm hai nhịp: hiện "đang soạn" một quãng, rồi đoạn
   HIỂU-Ý ngắn, rồi mới tới đoạn trả lời — độ trễ theo độ dài, như người
   thật đang gõ. Câu KHẨN đi nhanh, không trì hoãn: đường an toàn không
   được chậm. Mỗi lượt mang một 'id'; câu mới tới thì id đổi và mọi nhịp
   còn treo của lượt cũ tự bỏ (không chồng lên nhau). */
var luot = 0;
function chamGo(len){ return Math.max(650, Math.min(2600, Math.round((len||400)*15))); }
function doDaiDap(d){
  var n = (d.loi?d.loi.length:0) + (d.chot?d.chot.length:0);
  if(d.kbs){ var k=d.kbs;
    n += (k.traLoi?String(k.traLoi).length:0) + (k.chanDoan?String(k.chanDoan).length:0); }
  if(d.chuoi) n += 220; if(d.viec) n += 260; if(d.toan) n += 120; if(d.soan) n += 180;
  return n || 380;
}
function moDauAm(d){
  if(d.phanAnh) return d.phanAnh;
  if(!khach()) return '';
  var ds = ['Em đọc kỹ chỗ nhà mình vừa kể rồi.',
            'Em hình dung được tình huống của nhà mình.',
            'Cảm ơn nhà mình đã kể — em nắm rồi.',
            'Em hiểu điều nhà mình đang lo.'];
  return ds[G.CHAT.length % ds.length];
}
/* DỮ LIỆU đồng bộ, HIỂN THỊ mới hoãn. Câu trả lời vào G.CHAT NGAY (mọi
   thứ đọc G.CHAT — kể cả bộ kiểm — thấy đủ tức thì), nhưng mỗi bóng mang
   mốc _hien: luồng LIVE (ve) hiện "đang soạn" cho tới mốc ấy rồi mới lộ
   nội dung. Bản dựng đầy đủ (VIEWS['tro-ly'], ô nổi lúc mở) BỎ QUA _hien
   và hiện đủ — lịch sử không phải gõ lại. */
function phatTung(d){
  var id = ++luot;
  var now = Date.now();
  var t1 = d.khan ? 200 : 620;
  var seg1 = null;
  if(!d.khan){
    var mo = moDauAm(d);
    /* Không tách đoạn hiểu-ý khi đã có chuỗi vòng dẫn — chuỗi tự có "bắt
       nhịp", thêm một đoạn nữa là thừa. */
    if(mo && !d.chuoi) seg1 = { vai:d.vai, loi:mo, _doanDau:true };
  }
  if(seg1){
    var d2 = d; d2._khongVai = true; delete d2.phanAnh;
    G.CHAT.push({ai:'trolY', dap:seg1, luc:new Date(), _hien:now + t1});
    G.CHAT.push({ai:'trolY', dap:d2, luc:new Date(), _hien:now + t1 + chamGo(doDaiDap(d))});
  } else {
    G.CHAT.push({ai:'trolY', dap:d, luc:new Date(), _hien:now + t1});
  }
  hienDan(id);
}
/* Vẽ live ngay (hiện đoạn đang soạn), rồi hẹn vẽ lại ở từng mốc lộ. */
function hienDan(id){
  ve();
  for(var i = 0; i < G.CHAT.length; i++){
    var t = G.CHAT[i]._hien;
    if(t && t > Date.now()) (function(mocT){
      setTimeout(function(){ if(id === luot) ve(); }, Math.max(0, mocT - Date.now()));
    })(t);
  }
}

/* Xoá cuộc trò chuyện: tăng luot để mọi nhịp còn treo tự bỏ, không đẩy
   một đoạn cũ vào một khung vừa dọn sạch. */
G.chatXoa = function(){
  luot++; G.CHAT = []; kbDa = []; kbCau = '';
  if(G.tlQuenNgu) G.tlQuenNgu();
  ve();
};

/* ═══════════ VẼ MỘT BÓNG NÓI ═══════════ */
/* Giờ của một lượt. Hai chữ số, không kèm ngày — ngày đã có vạch riêng
   ở đầu dòng chuyện, in lại ở từng bóng là chiếm chỗ mà không thêm gì. */
function gio(d){
  var t = (d instanceof Date) ? d : new Date();
  return ('0'+t.getHours()).slice(-2) + ':' + ('0'+t.getMinutes()).slice(-2);
}

function bongToi(m){
  return '<div class="ch-luot ch-toi"><div class="ch-bong">'+h(m.loi)+
    '<span class="cs-gio">'+h(gio(m.luc))+'</span></div>'+
    '<div class="ch-anh ch-anh-toi">'+h(tenToi().trim().slice(0,1).toUpperCase())+'</div></div>';
}

function theNguon(n, moDuoc){
  if(moDuoc)
    return '<button class="ai-n" style="--nc:'+n.mau+'" data-v="'+h(n.go)+'">'+
      '<div class="ai-n-h"><span class="ai-n-loai">'+h(n.loai)+'</span>'+
        '<span class="ai-n-ma mono">'+h(n.ma)+'</span></div>'+
      '<b>'+h(n.ten)+'</b>'+
      (n.tom ? '<p>'+h(n.tom)+'</p>' : '')+
      (n.muc ? '<span class="ai-n-muc">'+h(n.muc)+'</span>' : '')+
    '</button>';
  /* Ngoài phần nền: hiện tên thật, không hiện nội dung, và nói rõ đường đi. */
  var dat = G.datKpi80 && G.datKpi80();
  return '<div class="ai-n ai-n-cho" style="--nc:'+n.mau+'">'+
    '<div class="ai-n-h"><span class="ai-n-loai">'+h(n.loai)+'</span>'+
      '<span class="ai-n-ma mono">'+h(n.ma)+'</span></div>'+
    '<b>'+h(n.ten)+'</b>'+
    '<p class="ai-n-cho-loi">'+ic('lock','w-3 h-3')+
      (dat ? ' Phần này Tư vấn hoặc Coach của nhà mình gửi tới, để đọc cùng một buổi hẹn.'
           : ' Phần này mở khi nhà mình đi tới 80% chặng đang làm. Còn bây giờ thì làm nốt việc đang dở đã.')+
    '</p>'+
    (dat ? '<button class="btn sm" data-xin="'+h(n.loai)+'|'+h(n.ma)+'|'+h(n.ten)+'">'+
             ic('bell','w-3 h-3')+'Nhờ Tư vấn gửi</button>' : '')+
  '</div>';
}

/* ── SƠ ĐỒ TỪNG BƯỚC (9.99.225) ──
   Chủ hệ: với khách hàng, KHÔNG đổ một list thông tin — dẫn bằng câu ngắn,
   theo sơ đồ, từng bước. Đây là bộ vẽ một sơ đồ dọc: mỗi bước một vòng
   số, nối bằng một vạch (::before, không thẻ rỗng). Nhận sẵn danh sách
   câu NGẮN đã rút từ kho — KHÔNG bịa thêm bước nào. */
function soDo(buoc){
  buoc = (buoc || []).filter(function(x){ return x != null && String(x).trim(); });
  if(!buoc.length) return '';
  return '<div class="ai-sodo">' + buoc.map(function(b, i){
    return '<div class="ai-sodo-b"><span class="ai-sodo-so">' + (i + 1) + '</span>' +
      '<span class="ai-sodo-chu">' + h(String(b)) + '</span></div>';
  }).join('') + '</div>';
}

function theDap(d){
  var o = '';
  if(d.khan)
    return '<div class="ai-khan">'+ic('shield','w-5 h-5')+
      '<div><b>Việc này cần người thật, không phải trợ lý</b>'+
      '<p>'+h(d.loi)+'</p>'+
      '<a class="btn sm pri mt" href="tel:0855554688">'+ic('bell','w-3 h-3')+'Gọi 08.5555.4688</a>'+
      '</div></div>';

  if(d.y) o += '<div class="ai-nhip">'+ic('compass','w-3 h-3')+
    '<span>'+h(d.y.ten)+' · nhịp '+h(d.y.nhip)+'</span></div>';
  if(d.loi) o += '<p class="ai-loi">'+h(d.loi)+'</p>';

  /* Đoạn HIỂU-Ý (nhịp đầu của một lượt chia đoạn): chỉ có lời, dừng ở
     đây — không chạy tới phần tư liệu, nếu không nó lôi theo câu "chưa
     tìm được gì khớp" vì đoạn này cố ý không mang nguồn nào. */
  if(d._doanDau) return o;

  /* Phân tích số liệu — nhà khoa học toán trình TỪNG BƯỚC, không bịa số.
     Đứng sớm, sau câu mở, vì đây thường là điều người hỏi cần nhất. */
  if(d.toan && d.toan.co){
    var tt = d.toan;
    o += '<div class="ai-toan"><div class="ai-toan-h">'+ic('compass','w-3 h-3')+
      ' '+h(tt.tieuDe)+'</div>'+
      '<p class="ai-toan-cach">'+h(tt.cach)+' = <b>'+h(tt.ketQua)+'</b></p></div>';
  }

  /* ── KỊCH BẢN SALE · GIỌNG GITA (9.99.126) ──
     Với khách, khi câu vừa gõ khớp một tình huống đã soạn: nói MỘT câu
     giọng GITA rồi hỏi MỘT câu để hiểu — đứng ĐẦU, trước tư liệu. Một
     trọng tâm mỗi lượt (luật G5), không đổ cả khối. Dùng lại lớp .ai-loi
     và .kb-hoi đã có — không thêm CSS. */
  if(d.kbs){
    var kb = d.kbs;
    var kbCD = Array.isArray(kb.chanDoan) ? kb.chanDoan[0] : kb.chanDoan;
    /* Khớp CHƯA RÕ (đỉnh không tách hẳn á quân) — câu khách trúng nhiều
       tình huống ngang nhau. KHÔNG khẳng định một câu trả lời sâu có thể
       lạc chuyện; hỏi lại MỘT câu để hiểu đúng đã (luật G7 + G5). */
    if(kb.ro === false){
      if(kbCD) o += '<p class="kb-hoi">'+h(kbCD)+'</p>';
      else o += '<p class="kb-hoi">Em chưa chắc mình hiểu đúng ý anh chị. Anh chị kể rõ hơn một chút được không?</p>';
    } else {
      var kbTL = Array.isArray(kb.traLoi) ? kb.traLoi[0] : kb.traLoi;
      if(kbTL) o += '<p class="ai-loi">'+h(kbTL)+'</p>';
      if(kbCD) o += '<p class="kb-hoi">'+h(kbCD)+'</p>';
    }
  }

  /* ── BẢN SOẠN ĐỨNG TRƯỚC DANH SÁCH TƯ LIỆU ──
     Người đang mệt đọc được hai dòng đầu. Nếu hai dòng ấy là một
     danh sách mười hai thẻ thì họ đóng máy; nếu là câu trả lời thì
     họ đọc tiếp. Thẻ tư liệu vẫn còn nguyên ở dưới để tra lại — bản
     soạn KHÔNG thay nguồn, nó đứng trước nguồn. */
  /* Nhãn nói rõ lượt này đang nối tiếp chuyện gì. Không có nhãn thì
     người đọc không biết "còn 4 mục nữa" là còn của cái gì, và nếu
     máy hiểu nhầm thì họ cũng không có cách nào thấy. */
  if(d.noiTiep){
    o += '<div class="ai-nhip">'+ic('compass','w-3 h-3')+
      '<span>Nói tiếp về: '+h(String(d.noiTiep.hoiThat).slice(0,60))+'</span></div>';
  }
  if(d.soan){
    var s = d.soan;
    /* KHÁCH: không đổ một danh sách gạch đầu dòng kèm mã kho (nội dung nội
       bộ, đọc ra như copy-paste). Thay bằng MỘT câu dẫn + một sơ đồ ba
       bước ngắn — hướng dẫn từng bước, đúng lời chủ hệ. Chỉ lấy phần CHỮ
       của mỗi mục, bỏ mã mono. NHÂN SỰ vẫn thấy đủ danh sách để tra. */
    if(khach()){
      o += '<div class="ai-soan">'+
        '<p class="ai-soan-cau">'+h(s.cau)+'</p>'+
        soDo(s.dong.slice(0, 3).map(function(x){ return x.chu; }))+
        (s.dong.length > 3
          ? '<p class="tiny dim">Mình đi ba bước này trước đã — xong rồi em dẫn tiếp.</p>' : '')+
      '</div>';
    } else {
      o += '<div class="ai-soan">'+
        '<div class="ai-soan-dau">'+h(s.loai)+
          (s.so ? ' · '+s.so+' mục' : '')+'</div>'+
        '<p class="ai-soan-cau">'+h(s.cau)+'</p>'+
        '<ul class="ai-soan-ds">'+ s.dong.map(function(x){
          return '<li><span class="mono">'+h(x.nhan)+'</span>'+
            (x.nhan ? ' · ' : '')+h(x.chu)+'</li>';
        }).join('') +'</ul>'+
        (s.conNua ? '<p class="ai-soan-con">… còn '+s.conNua+' mục, mở tư liệu bên dưới để xem đủ</p>' : '')+
      '</div>';
    }
  }

  /* ── CHUỖI KỊCH BẢN: MỘT VÒNG, MỘT CÂU HỎI ──
     Đứng ĐẦU câu trả lời. Người đang mệt đọc được hai dòng đầu; nếu hai
     dòng ấy là một danh sách tư liệu thì họ đóng máy, còn nếu là một câu
     hỏi trả lời được thì họ trả lời. */
  /* Hỏi thẳng thì đứng đầu, trước cả chuỗi. */
  if(d.noiThat)
    o += '<p class="ai-loi gn-that">'+h(d.noiThat)+'</p>';

  /* Câu bật ra giữa chừng: nói RÕ trả lời dựa vào đâu và ranh giới ở
     đâu, rồi mới quay lại vòng. Giấu ranh giới đi thì tới lúc chạm vào
     nó, người ta thấy mình bị chặn chứ không thấy mình được nói trước. */
  if(d.phatSinh){
    var ps = d.phatSinh;
    o += '<div class="gn-ps'+(ps.chuyenNguoiThat ? ' gn-ps-nguoi' : '')+'">'+
      '<span class="gn-ps-loai">'+h(ps.loai)+'</span>'+
      '<p class="gn-ps-ranh">'+h(ps.ranh)+'</p>'+
      (ps.chuyenNguoiThat
        ? '<a class="btn sm pri" href="tel:0855554688">'+ic('bell','w-3 h-3')+'Chuyển người thật</a>'
        : '<p class="tiny dim">Trả lời dựa vào: '+h(ps.dua)+'</p>')+
      (ps.quayLaiVongDangDo ? '<p class="tiny dim">Xong câu này, mình quay lại chỗ đang dở.</p>' : '')+
      '</div>';
  }

  if(d.chuoi){
    var c = d.chuoi;
    /* Câu mở của vòng — xoay vòng, không lặp lượt kế. Đứng trước tiêu đề
       vòng vì đây là câu người ta đọc đầu tiên. */
    if(d.mo) o += '<p class="gn-mo">'+h(d.mo)+'</p>';
    /* Bắt nhịp: nhắc lại đúng CHỮ của nhà mình, không dịch sang thuật ngữ. */
    if(d.batNhip && d.batNhip.length)
      o += '<p class="gn-nhip">'+ic('compass','w-3 h-3')+' Em giữ nguyên chữ anh chị dùng: '+
        d.batNhip.map(function(w){ return '<b>'+h(w)+'</b>'; }).join(' · ')+'</p>';
    o += '<div class="kb-vong">'+
      '<div class="kb-vong-h"><span class="kb-vong-no">'+c.vong.no+'/'+c.soVong+'</span>'+
      '<b>'+h(c.vong.ten)+'</b>'+
      (c.tinhHuong ? '<span class="kb-vong-th">tầng '+h(String(c.tinhHuong.tang).slice(1))+
        ' · '+c.soTrong+' chuyện khớp</span>' : '')+'</div>';

    /* Khúc của vòng này — đọc THẲNG từ trường kho khai. */
    if(khach() && d.tinhTiet)
      o += '<p class="kb-khuc">Em ghi nhận thêm: “'+h(d.tinhTiet.slice(0, 180))+
        '”. Mình làm rõ chuyện này trước khi chọn bước tiếp theo.</p>';
    else if(c.khuc && !khach())
      o += '<p class="kb-khuc">'+h(c.khuc)+'</p>'+
        '<p class="kb-doctu tiny dim">Đọc từ '+h(c.docTu)+' · '+h(c.tinhHuong.th)+'</p>';
    else if(c.thieuKhuc && !khach())
      o += '<p class="kb-khuc kb-thieu">Kho chưa có khúc này cho chuyện ấy ('+h(c.docTu)+
        '). Em không bịa cho tròn.</p>';
    else if(!c.khoanhDuoc)
      o += '<p class="kb-khuc kb-thieu">Em chưa khoanh được đúng chuyện của nhà mình. '+
        'Anh chị kể thêm một chi tiết nữa được không?</p>';

    /* Câu hỏi của vòng — đúng MỘT câu. */
    o += '<p class="kb-hoi">'+h(c.hoi)+'</p>'+
      '<div class="kb-goiy">'+ (c.goiY||[]).map(function(g){
        return '<button class="kb-chip" data-kbv="'+h(g)+'">'+h(g)+'</button>';
      }).join('') +'</div>';
    if(c.quayLai)
      o += '<p class="kb-quaylai tiny dim">'+ic('compass','w-3 h-3')+
        ' Trả lời xong vòng này, mình quay lại vòng một — lần sau với một con số thật của '+
        'nhà mình thay vì một câu kể.</p>';
    o += '</div>';

    /* Nghiệp vụ của chính vai đang đọc — ba vai ba cột khác nhau. */
    if(d.nghiepVu && d.nghiepVu.phacDo){
      var nv = d.nghiepVu;
      o += '<div class="kb-nv"><div class="kb-nv-h">'+
        '<span class="kb-nv-vai">'+h(nv.vai.ten)+'</span>'+
        '<span class="ai-n-ma mono">'+h(nv.phacDo.ma)+'</span>'+
        '<b>'+h(nv.phacDo.ten)+'</b></div>'+
        '<p class="kb-nv-lam">'+h(nv.vai.lam)+'</p>';
      o += nv.muc.map(function(m){
        return '<div class="kb-nv-muc"><span class="kb-nv-tr mono">'+h(m.truong)+'</span>'+
          (m.thieu ? '<p class="kb-thieu">Kho chưa khai trường này cho phác đồ ấy.</p>'
                   : '<p>'+h(m.loi)+'</p>')+'</div>';
      }).join('');
      o += '<p class="tiny dim" style="margin-top:8px;line-height:1.6">Phác đồ chưa khai '+
        'tầng nên phần này chưa lọc theo tầng được — em nói rõ chỗ đó.</p></div>';
    }

    /* Mời vượt tầng — CHỈ sau khi đã đưa xong phần dùng được. */
    if(c.soVuot && c.tangVuot){
      var m = G.kbMoiVuotTang(c.tangVuot, c.soVuot);
      /* Cổng phí đóng thì IM LẶNG HẲN về tầng trên — không vẽ cả một
         khung "có phần đầy đủ hơn". Câu ấy là một lời mời đội lốt một
         lời thông báo, và nhà đang giữa chặng đọc nó ra đúng lời mời. */
      if(m && m.khongMoi) m = null;
      if(m) o += '<div class="kb-moi">'+ic('lock','w-4 h-4')+
        '<div><b>Còn '+m.so+' phần nữa, ở tầng '+m.tang+'</b>'+
        '<p>'+h(m.loi)+'</p>'+
        (m.duocGi ? '<p class="kb-moi-duoc">Đi hết tầng '+m.tang+' thì: '+h(m.duocGi)+'</p>' : '')+
        '<p class="kb-moi-gia">'+(m.chuaCoGia
          ? 'Học phí tầng này chưa khai trong kho — Tư vấn báo lại con số thật.'
          : 'Lộ trình tầng '+m.tang+': '+h(new Intl.NumberFormat('vi-VN').format(m.gia))+
            ' '+h(m.donVi||'đồng'))+'</p>'+
        '<button class="btn sm" data-v="dang-ky">Đăng ký lộ trình tầng '+m.tang+'</button>'+
        '</div></div>';
    }
  }

  /* ── BỐN NHỊP DẪN MỘT VIỆC ──
     Đặt TRƯỚC danh sách tư liệu: người hỏi về một việc cần biết tối nay
     làm gì, không cần mười hai tư liệu trước đã. */
  if(d.viec && d.viec.vuotTang)
    o += '<div class="ai-viec ai-viec-cho">'+ic('lock','w-4 h-4')+
      '<div><b>'+h(d.viec.ma)+' — việc của tầng '+h(String(d.viec.tang).slice(1))+'</b>'+
      '<p>'+h(d.viec.y)+'</p></div></div>';
  else if(d.viec){
    var v = d.viec;
    o += '<div class="ai-viec"><div class="ai-viec-h">'+
      '<span class="ai-n-ma mono">'+h(v.ma)+'</span><b>'+h(v.ten)+'</b>'+
      '<span class="ai-viec-bd">'+h(v.banhDa)+' · tầng '+h(String(v.tang).slice(1))+'</span></div>';
    o += v.nhip.map(function(n){
      return '<div class="ai-viec-n'+(n.thieu ? ' thieu' : '')+'">'+
        '<span class="ai-viec-no">'+n.no+'</span>'+
        '<div><b>'+h(n.ten)+'</b>'+
        (n.thieu
          ? '<p class="ai-viec-thieu">Kho chưa có phần này ('+h(n.docTu)+'). Em không bịa cho tròn.</p>'
          : '<p>'+h(n.loi)+'</p>')+'</div></div>';
    }).join('');
    o += '<p class="ai-viec-chan">'+ic('spark','w-3 h-3')+
      ' Bốn nhịp trên ghép từ chính kho việc — em không viết thêm câu nào.</p></div>';
  }

  if(d.chuaCo)
    return o + '<p class="ai-loi">'+h(d.thieu || 'Kho chưa có phần này. Em không đoán.')+'</p>';

  /* Khách chỉ nhận cuộc trao đổi 1:1, không nhận tên, mã, số lượng hoặc
     nội dung từ kho nghề. Phần có thể dùng đã được trả lời ở trên bằng một
     tình huống đã duyệt hoặc một câu hỏi làm rõ duy nhất. */
  if(khach()){
    if(!d.loi && !d.kbs && !d.chuoi && !d.noiThat && !d.phatSinh)
      o += '<p class="ai-loi">Em muốn hiểu đúng chuyện của nhà mình trước. Điều gì đang làm anh chị cần hỗ trợ nhất lúc này?</p>';
    if(d.chot) o += '<p class="ai-chot">'+h(d.chot)+'</p>';
    return o;
  }

  /* Chia hai rổ: mở được ngay và phải qua người thật */
  var mo = [], cho = [];
  d.nguon.forEach(function(n){
    ((!G.khachMoDuoc || !G.khachMoDuoc(n.loai, n.ma)) ? cho : mo).push(n);
  });

  /* ── KHÁCH: MỘT BƯỚC MỘT LÚC, KHÔNG LIST (9.99.225) ──
     Chủ hệ nghiêm cấm đưa một list nội dung tài liệu ra cho khách. Nên với
     khách, KHÔNG dựng danh sách thẻ tư liệu (dù có gập) — chỉ mở đúng MỘT
     phần "bước tiếp theo", rồi nói còn bao nhiêu phần để mở lần lượt. Phần
     "chờ" (ngoài nền) là điểm-trỏ có nút nhờ gửi, không phải nội dung —
     giữ lại nhưng cắt còn ba cái để không thành một bức tường. */
  if(khach()){
    if(mo.length){
      o += '<div class="ai-nguon-nhan">'+ic('arrow','w-3 h-3')+
        ' Bước tiếp theo — mở đúng phần này thôi</div>';
      o += '<div class="ai-ds">'+ theNguon(mo[0], true) +'</div>';
      if(mo.length > 1)
        o += '<p class="tiny dim">Còn '+(mo.length - 1)+' phần nữa trong kho của nhà mình — '+
          'mình mở lần lượt khi tới bước đó, không cần đọc hết một lúc.</p>';
    }
    if(cho.length){
      var choHien = cho.slice(0, 3);
      o += '<div class="ai-nguon-nhan ai-nguon-cho">'+cho.length+
        ' phần thuộc kho Học viện — đi qua Tư vấn hoặc Coach của nhà mình</div>';
      o += '<div class="ai-ds">'+ choHien.map(function(n){ return theNguon(n, false); }).join('') +'</div>';
      if(cho.length > 3)
        o += '<p class="tiny dim">… và '+(cho.length - 3)+' phần nữa — Tư vấn gửi tới theo đúng lúc nhà mình cần.</p>';
    }
  } else {
    /* ── NHÂN SỰ: GẬP DANH SÁCH ĐỂ TRA, KHÔNG ĐỔ RA MẶT (9.99.200) ──
       Người trong nghề cần tra thẳng cả kho; nhưng vẫn không phơi liền một
       bức tường thẻ — nằm trong một mục bấm-mở. Một cú bấm, đổi lại câu trả
       lời dẫn trước còn thẻ tư liệu đứng sau. */
    var dsHtml = '';
    if(mo.length){
      dsHtml += '<div class="ai-nguon-nhan">'+mo.length+' tư liệu mở được ngay — bấm để đọc</div>';
      dsHtml += '<div class="ai-ds">'+ mo.map(function(n){ return theNguon(n, true); }).join('') +'</div>';
    }
    if(cho.length){
      dsHtml += '<div class="ai-nguon-nhan ai-nguon-cho">'+cho.length+
        ' phần nữa có trong kho của Học viện — đi qua Tư vấn hoặc Coach</div>';
      dsHtml += '<div class="ai-ds">'+ cho.map(function(n){ return theNguon(n, false); }).join('') +'</div>';
    }
    if(dsHtml)
      o += '<details class="ai-tulieu"><summary>'+ic('compass','w-3 h-3')+
        ' Tư liệu trong kho ('+(mo.length+cho.length)+') — bấm để xem</summary>'+dsHtml+'</details>';
  }
  /* Câu "chưa tìm được gì khớp" CHỈ đúng khi thật sự chưa có gì. Dẫn
     xong bốn nhịp của một việc rồi vẫn in câu ấy là tự cãi mình ngay
     trong một lượt trả lời — người đọc sẽ tin câu sau và bỏ qua câu
     trước, tức là bỏ qua đúng phần dùng được. */
  if(!mo.length && !cho.length && !d.viec && !d.chuoi)
    o += '<p class="ai-loi">Em chưa tìm được gì khớp. Anh chị kể cụ thể hơn một chút được không?</p>';
  /* NÓI RA CÁI KHÔNG ĐƯA. Giấu con số này thì nhà mình tưởng kho chỉ có
     bấy nhiêu; nói ra thì họ biết còn đường phía trước, và biết đường ấy
     mở bằng cách đi hết tầng đang làm chứ không bằng cách xin. */
  if(d.giuLaiVuotTang)
    o += '<p class="ai-tang-giu">'+ic('lock','w-3 h-3')+' '+d.giuLaiVuotTang+
      ' tư liệu nữa thuộc tầng trên — em giữ lại. Nền của chúng nằm ở tầng nhà mình đang đi, '+
      'nên đọc bây giờ chưa dùng được. Đi hết chặng này thì chúng mở ra.</p>';
  /* ── KHÔNG ĐỔ TÊN KHO VÀO MẶT NGƯỜI ĐỌC ──
     Câu này từng in NGUYÊN danh sách tên biến trong kho, và với một
     phụ huynh thì nó ra khoảng sáu mươi chữ kiểu HN_NGOT, BD_HOA,
     MATRAN_T1 — chiếm hơn nửa bóng nói, và không nói gì với họ cả.
     Sự thật cần nói là "còn mấy kho chưa lọc theo tầng được"; tên
     biến là chuyện của người làm, và người làm đã có bộ kiểm. */
  var kct = d.khoChuaKhaiTang || [];
  if(kct.length)
    o += '<p class="ai-tang-chua tiny dim">Còn '+kct.length+
      ' kho chưa khai tầng nên em chưa lọc theo tầng được ở đó — phần ấy vẫn đi ' +
      'qua trần 30% như cũ.</p>';
  if(d.chot) o += '<p class="ai-chot">'+h(d.chot)+'</p>';
  return o;
}

/* Dòng xưng VAI đang trả lời — ghi rõ Chuyên viên tư vấn · Coach · Giáo
   viên · Trợ lý riêng · Trợ lý nghiệp vụ. Nói với khách bằng vai người
   thật đang phụ trách, không phô "máy". */
function bongVai(vai){
  if(!vai) return '';
  return '<div class="ai-vai"><b>'+h(vai.ten)+'</b>'+
    (vai.moTa ? '<span> · '+h(vai.moTa)+'</span>' : '')+'</div>';
}
/* Bóng "đang soạn" — ba chấm nhịp, như người đang gõ. Vai lấy từ chính
   bóng đang chờ lộ (dap.vai) để dòng xưng vai không nhảy. */
function bongSoan(m){
  var vai = m.dap && m.dap.vai;
  return '<div class="ch-luot ch-troly">'+
    '<div class="ch-anh ch-anh-ai">'+ic('spark','w-4 h-4')+'</div>'+
    '<div class="ch-bong ch-bong-ai ch-soan">'+bongVai(vai)+
    '<span class="soan-cham" aria-label="đang soạn"><i></i><i></i><i></i></span></div></div>';
}
function bongTroLy(m){
  var d = m.dap || {};
  /* Xưng vai một lần: đoạn đầu (hiểu-ý) đã xưng thì đoạn trả lời không
     lặp lại (_khongVai). Câu khẩn không xưng vai — đó là lúc chuyển
     người thật, không phải lúc trò chuyện. */
  var vai = (!d.khan && !d._khongVai) ? d.vai : null;
  return '<div class="ch-luot ch-troly">'+
    '<div class="ch-anh ch-anh-ai">'+ic('spark','w-4 h-4')+'</div>'+
    '<div class="ch-bong ch-bong-ai">'+bongVai(vai)+theDap(d)+
      '<span class="cs-gio">'+h(gio(m.luc))+'</span></div></div>';
}

/* Dựng sẵn cả cuộc trò chuyện thành chuỗi. Màn hình trả về đã có nội dung
   ngay từ đầu — không có khoảnh khắc khung trống rồi mới hiện chữ. */
/* live=true (từ ve): bóng chưa tới mốc _hien hiện "đang soạn". Không có
   live (bản dựng đầy đủ, ô nổi lúc mở): hiện đủ, không gõ lại lịch sử. */
function cuonChat(live){
  kiemTraPhien();
  var bay = Date.now();
  return '<div class="cs-vach">Hôm nay</div>' +
    '<div class="ch-luot ch-troly"><div class="ch-anh ch-anh-ai">'+ic('spark','w-4 h-4')+'</div>'+
    '<div class="ch-bong ch-bong-ai"><p class="ai-loi">'+h(loiChao())+'</p></div></div>' +
    G.CHAT.map(function(m){
      if(m.ai === 'toi') return bongToi(m);
      if(live && m._hien && m._hien > bay) return bongSoan(m);
      return bongTroLy(m);
    }).join('');
}

function ve(){
  /* Cập nhật MỌI khung chat đang có — màn trợ lý đầy đủ (#chKhung) VÀ ô
     chat nổi ở góc (#chKhungNoi, 9.99.125). Hai khung không bao giờ mở
     cùng lúc (ô nổi ẩn khi đang ở màn tro-ly), nên đây thực chất là một;
     nhưng quét theo lớp thì thêm khung thứ ba sau này cũng tự đồng bộ. */
  var list = document.querySelectorAll('.ch-khung');
  if(!list.length) return;
  var html = cuonChat(true);
  for(var i = 0; i < list.length; i++){
    list[i].innerHTML = html; list[i].scrollTop = list[i].scrollHeight;
  }
  if(G.csCaoCuaSo) G.csCaoCuaSo();
  for(var j = 0; j < list.length; j++) list[j].scrollTop = list[j].scrollHeight;
}
G.veChat = ve;
/* Dựng sẵn transcript và danh sách gợi ý cho ô chat nổi dùng lại — TRỎ,
   không chép: một bản thứ hai của lời chào/lịch sử là một chỗ để lệch. */
G.chatCuon = cuonChat;
G.chatGoiY = goiY;

/* ═══════════ MÀN HÌNH ═══════════ */
G.VIEWS['tro-ly'] = function(){
  var K = G.KICHBAN_AI;
  var kh = khach();
  var f = kh && G.myFamily ? G.myFamily() : null;
  var t = f && G.tierOf ? G.tierOf(f.tier) : null;

  /* ══ ĐẦU CỬA SỔ ══
     Dòng dưới tên KHÔNG phải một câu trang trí. Nó trả lời câu hỏi mà
     người đang gõ thật sự cần biết: mình đang nói với ai, và câu trả
     lời sắp tới nằm trong phạm vi nào. Một cửa sổ chat giấu phạm vi
     thì người dùng tưởng mọi câu hỏi đều được trả lời như nhau. */
  var duoi = kh
    ? (t ? t.code + ' · ' + G.tname(t) : 'Nhà mình')
    : 'Kho của Học viện · trong phạm vi vai đang dùng';

  var o = '<div class="cs-lo"><div class="card cs-win">' +
    '<div class="cs-dau">' +
      '<div class="cs-anh">'+ic('spark')+'</div>' +
      '<div class="cs-ten"><b>Trợ lý GITA</b>' +
        '<div class="cs-duoi"><span class="cs-cham"></span>đang nghe · '+h(duoi)+'</div></div>' +
      (G.CHAT.length
        ? '<button class="btn ghost sm" data-act="chat-xoa">'+ic('x','w-3 h-3')+'Bắt đầu lại</button>'
        : '') +
    '</div>' +
    '<div id="chKhung" class="ch-khung cs-cuon">'+cuonChat()+'</div>' +
    '<div class="cs-go">' +
      /* ── CÂU GỢI Ý Ở LẠI SUỐT CUỘC TRÒ CHUYỆN ──
         Bản đầu tôi giấu chúng đi sau câu hỏi thứ nhất, vì trên màn
         hẹp chúng xuống dòng thành năm hàng và ăn mất 175px của dòng
         chuyện. Bộ kiểm mục 18 đỏ ngay, và nó đúng: một phụ huynh
         không biết mở lời thì ở lượt thứ năm cũng vẫn không biết, chứ
         không phải chỉ ở lượt thứ nhất.
         Chỗ ngồi lấy lại được bằng cách khác — cho chúng chạy ngang
         một hàng và cuộn, hết 35px thay vì 175px. Sửa cái chiếm chỗ,
         đừng bỏ cái có ích. */
      '<div class="cs-goiy">' +
      goiY().map(function(g){ return '<button class="chip" data-aiq="'+h(g)+'">'+h(g)+'</button>'; }).join('') +
      '</div>' +
      '<div class="cs-o">' +
        '<textarea id="aiQ" rows="1" autocomplete="off" placeholder="'+
          (kh ? 'Nhà mình đang mắc chuyện gì?' : 'Tra phác đồ, kịch bản, mô thức, tình huống…')+
          '"></textarea>' +
        '<button class="cs-nut" id="micBtn" data-act="mic" aria-label="Nói vào micro" ' +
          'title="Nói thay vì gõ">'+ic('pulse')+'</button>' +
        '<button class="cs-nut pri" data-act="ai-ask" aria-label="Gửi">'+ic('arrow')+'</button>' +
      '</div>' +
      '<p class="cs-meo">Enter để gửi · Shift+Enter xuống dòng · ' +
        'cuộc trò chuyện chạy trong máy, không gửi đi đâu cả.</p>' +
    '</div></div>';

  /* ══ CỘT PHẢI ══
     Bốn thẻ này ở bản trước nằm DƯỚI khung chat, nên muốn đọc chúng thì
     phải cuộn khung chat ra khỏi tầm mắt. Nay chúng đứng cạnh và đứng
     yên — đọc được mà không mất chỗ đang gõ. */
  o += '<div class="cs-ben">';

  if(t) o += '<div class="card pad-sm" style="border-color:'+t.c+'44">'+
    '<div class="tiny up mb" style="color:'+t.c+'">ĐANG TRẢ LỜI TRONG PHẠM VI</div>'+
    '<b class="sm" style="color:'+t.c+'">'+h(t.code+' · '+G.tname(t))+'</b>'+
    '<p class="tiny muted mt" style="line-height:1.55">'+h(t.note)+'</p></div>';

  /* Gia đình: nói thẳng phần nào đang mở, phần nào chưa, và mở bằng cách nào */
  if(kh && G.khoCuaNha){
    var s = G.khoCuaNha();
    o += '<div class="card pad-sm" style="border-color:var(--gita-vien-1)">'+
      '<div class="row" style="gap:14px;align-items:center;flex-wrap:wrap">'+
        U.ring(s.phanTramMo, 'var(--gita)', 'ĐANG MỞ')+
        U.ring(s.kpi, s.dat80 ? 'var(--ok)' : 'var(--gita-do)', 'KPI')+
      '</div>'+
      '<b class="sm mt" style="display:block">'+s.mo.toLocaleString('vi-VN')+' / '+
        s.tong.toLocaleString('vi-VN')+' tư liệu</b>'+
      /* NÓI ĐÚNG MẪU SỐ. Câu cũ là "30% kho", mà con số ấy đo trên KHO
         DÀNH CHO GIA ĐÌNH chứ không phải toàn kho Học viện — bốn kho
         nghề không xuống máy khách nên không nằm trong mẫu số. Hai
         câu chênh nhau đúng một cụm bốn chữ, mà cụm ấy là toàn bộ
         khác nhau giữa một con số đúng và một con số nghe to hơn sự
         thật. Câu đúng đọc từ kho, không gõ lại ở đây. */
      '<p class="tiny dim mt" style="line-height:1.6">Phần nền của mỗi nhà là '+
        Math.round(G.TRAN_KHACH*100)+'% '+
        h(((G.KB_TRAN_NHA||{}).cauDung||'kho').replace(/^\d+% /, ''))+
        ' — đủ đi hết chặng đang ở. '+
        'Phần nghề không mất đi: Tư vấn và Coach đọc lại rồi gửi tới theo đúng lúc nhà '+
        'mình cần, khi KPI đi qua '+G.KPI_XIN_THEM+'%.</p>'+
      (s.them ? '<p class="tiny mt" style="color:var(--ok)">'+ic('check','w-3 h-3')+
         ' Đã nhận thêm '+s.them+' tư liệu do Tư vấn và Coach gửi.</p>' : '')+
      '</div>';

    var cho = G.XIN_THEM.filter(function(x){ return x.trangThai === 'cho'; });
    if(cho.length)
      o += '<div class="card pad-sm"><div class="tiny up mb">ĐANG CHỜ TƯ VẤN XEM</div>'+
        U.list(cho.map(function(x){ return x.loai + ' · ' + x.ten; }))+'</div>';
  }

  /* Nói trước trợ lý làm gì và không làm gì — không để ai kỳ vọng sai */
  o += '<div class="card pad-sm" style="border-color:var(--gita-vien-1)">'+
      '<div class="up mb" style="color:var(--gita-ink)">'+ic('check','w-4 h-4')+' LÀM ĐƯỢC</div>'+
      U.list([
        'Nghe chuyện bằng lời thường ngày, không bắt ai nói đúng thuật ngữ.',
        'Tra trong kho của Học viện và chỉ ra đúng tư liệu, có mã để mở lại.',
        'Trả lời trong đúng phần vai và chặng của tài khoản đang dùng.',
        'Chạy hoàn toàn trong máy — chuyện của nhà mình không gửi đi đâu cả.'
      ])+'</div>'+
    '<div class="card pad-sm">'+
      '<div class="up mb" style="color:var(--gita-do-ink)">'+ic('x','w-4 h-4')+' TUYỆT ĐỐI KHÔNG</div>'+
      (K ? U.list(K.khongLam.slice(0, 5), 'var(--gita-do)') : '')+'</div>';

  o += '</div></div>';

  setTimeout(function(){
    var k = document.getElementById('chKhung');
    if(k) k.scrollTop = k.scrollHeight;
    var i = document.getElementById('aiQ');
    if(i){ caoTheoChu(i); if(G.CHAT.length) i.focus(); }
    G.csCaoCuaSo();
    if(k) k.scrollTop = k.scrollHeight;
  }, 0);
  return o;
};

/* Ô chữ cao lên theo số dòng đã gõ, tới trần thì cuộn. Đặt riêng một
   hàm vì có ba chỗ gọi: lúc dựng màn, lúc gõ, và lúc gửi xong (phải
   thu về một dòng, nếu không ô ở lại cao như cũ trong khi đã trống). */
function caoTheoChu(el){
  if(!el) return;
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 120) + 'px';
}
/* Gắn lên G vì nút Gửi nằm ở src/app.js — nó xoá ô xong thì ô phải thu
   về một dòng, không thì ô ở lại cao như cũ trong khi đã trống. */
G.aiOCao = caoTheoChu;

/* ── CHIỀU CAO CỬA SỔ: ĐO, KHÔNG ĐOÁN ──

   Cửa sổ phải chạm đúng đáy màn hình, vì cả ý nghĩa của nó là chỗ gõ
   không bao giờ rời tầm mắt.

   Bản đầu tôi trừ bằng số trong CSS và đo thử thì đáy nằm 61px DƯỚI
   tầm mắt. Phía trên cửa sổ có ba thứ chồng nhau: lề vùng nội dung,
   thanh nhắc việc trễ nhịp (lúc có lúc không), và 26px nữa mà đọc CSS
   không truy ra nguồn. Trừ bằng số là đoán cả ba, và đoán sai thì sai
   IM LẶNG — trang vẫn dựng ra, chỉ là chỗ gõ nằm ngoài màn, mà không
   phép kiểm nào của kho này nhìn được chuyện ấy.

   Nên đo: lấy đúng khoảng từ đỉnh cửa sổ tới đáy màn. Thêm hay bớt
   thanh nào ở trên cũng vẫn đúng. */
G.csCaoCuaSo = function(){
  var w = document.querySelector('.cs-win');
  if(!w) return;
  /* Cộng offsetTop dọc chuỗi cha, KHÔNG dùng getBoundingClientRect.
     Lớp .view mở màn bằng một chuyển động trượt lên 14px trong 0,42
     giây; đo bằng rect ngay sau khi vẽ là đo giữa lúc nó còn đang
     trượt, và cửa sổ hụt đúng 14px ấy — đo thử ra -32 thay vì -18.
     offsetTop không bị chuyển động làm lệch. */
  var t = 0, el = w;
  while(el){ t += el.offsetTop; el = el.offsetParent; }
  /* Trừ cả thanh điều hướng dưới đáy, nếu nó đang hiện. ĐO chiều cao
     thật của nó chứ không trừ một con số: thanh cao thêm đúng phần dưới
     vạch về nhà của từng máy, mà con số ấy mỗi máy một khác.
     Bản đầu tôi quên hẳn chuyện này, và bộ đo khung màn bắt ngay: chỗ
     gõ của màn trợ lý nằm dưới thanh 41px trên điện thoại, 71px trên
     máy bảng — tức là đúng thứ cửa sổ này sinh ra để tránh. */
  var td = document.getElementById('duoi');
  var caoTd = (td && getComputedStyle(td).display !== 'none')
    ? td.getBoundingClientRect().height : 0;
  var cao = window.innerHeight - (t - (window.pageYOffset || 0)) - 18 - caoTd;
  /* Sàn: trên điện thoại, thanh nhắc việc trễ nhịp có thể cao tới vài
     trăm điểm ảnh và đẩy cửa sổ xuống gần hết màn. Lúc ấy đừng cố nhét
     cửa sổ vào phần còn lại — nó co xuống 22px và thành vô dụng. Cho
     nó một chiều cao đọc được rồi để trang cuộn qua thanh nhắc. */
  var san = Math.min(Math.round((window.innerHeight - caoTd) * 0.62), 560);
  w.style.height = Math.max(cao, san) + 'px';
};
window.addEventListener('resize', function(){ G.csCaoCuaSo(); });

/* Giữ đường cũ chạy được: nơi nào còn gọi G.aiHoi thì vào thẳng khung chat.
   Chỗ đè này khai ở src/de-len.js — nó đổi HÀNH VI, nên phải khai.

   G.moTroLy() từng được khai lại ở đây, giống hệt bản của
   src/tro-ly-ai.js từng chữ. Bỏ ở 9.70: bản sau không thêm gì mà chỉ
   thêm một chỗ để hỏng nếu thứ tự nạp đổi. Bỏ bản thừa rẻ hơn khai nó. */
G.aiHoi = function(q){ G.chatHoi(q); };

/* ═══════════ BẤM ═══════════ */
document.addEventListener('click', function(e){
  var q = e.target.closest && e.target.closest('[data-aiq]');
  if(q){
    G.chatHoi(q.getAttribute('data-aiq'));
    var i = document.getElementById('aiQ'); if(i) i.value = '';
    return;
  }
  /* Chip gợi ý của một vòng = một CÂU TRẢ LỜI, đi thẳng vào chuỗi.
     Tên thuộc tính là data-kbv chứ không phải data-kb: app.js đã dùng
     data-kb cho modal kịch bản từ lâu, và trùng tên thì bấm một chip
     gợi ý sẽ mở nhầm một cửa sổ chẳng liên quan. */
  var v = e.target.closest && e.target.closest('[data-kbv]');
  if(v){ G.chatHoi(v.getAttribute('data-kbv')); return; }
  var x = e.target.closest && e.target.closest('[data-xin]');
  if(x){
    var p = x.getAttribute('data-xin').split('|');
    var r = G.xinThemTuLieu(p[0], p[1], p[2]);
    if(!r.ok){ U.toast(r.ly, 'err'); return; }
    U.toast('Đã nhắn Tư vấn của nhà mình. Phần này sẽ được gửi tới trong buổi hẹn gần nhất.', 'ok');
    G.render && G.render();
  }
});

/* ENTER GỬI · SHIFT+ENTER XUỐNG DÒNG.

   Ô gõ từ bản 9.99.50 là một <textarea> chứ không còn là <input>, vì ô
   một dòng bắt người ta gõ một câu dài mà chỉ nhìn thấy khúc cuối của
   nó — và phụ huynh kể chuyện nhà mình thì câu dài là bình thường.

   Đổi sang textarea thì Enter mặc định XUỐNG DÒNG, tức là mất luôn cách
   gửi quen tay. Nên phải bắt lại ở đây, và phải chừa Shift+Enter — nếu
   không thì người muốn xuống dòng sẽ gửi đi một câu đang viết dở. */
document.addEventListener('keydown', function(e){
  if(e.key !== 'Enter' || e.shiftKey) return;
  var i = document.getElementById('aiQ');
  if(!i || document.activeElement !== i) return;
  e.preventDefault();
  G.chatHoi(i.value); i.value = ''; caoTheoChu(i);
});

/* Ô cao lên theo chữ đang gõ. Bắt ở 'input' chứ không ở 'keyup': dán
   một đoạn dài bằng chuột không sinh ra phím nào cả. */
document.addEventListener('input', function(e){
  if(e.target && e.target.id === 'aiQ') caoTheoChu(e.target);
});

})();
