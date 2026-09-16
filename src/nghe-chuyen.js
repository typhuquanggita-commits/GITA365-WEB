/* ═══════════════════════════════════════════════════════════════
   GITA 365 · v9.0 — ĐỌC HOẶC NGHE

   Thêm một lựa chọn cho người dùng: đọc chuyện, hoặc nghe người dẫn đọc.
   Nút chuyển nằm ngay trên mỗi chuyện, và lựa chọn được nhớ lại.

   Ba chỗ phải làm cho đúng, nếu không thì phần này lợi bất cập hại:

   1. KHÔNG GIẢ VỜ CÓ. Chưa có bản thu thì nói là chưa có, kèm đúng lý do
      và đúng thứ đang chờ. Không hiện nút Nghe rồi bấm vào im lặng.

   2. KHÔNG GẮN TÊN NGƯỜI CHƯA KÝ. Trình phát chỉ hiện tên người dẫn khi
      hồ sơ giọng có đủ tên, số hợp đồng và ngày hết hạn. Quá hạn thì tự
      gỡ khỏi trình phát, không đợi ai nhớ.

   3. NGHE ĐƯỢC NHƯNG KHÔNG TẢI ĐƯỢC. Khách hàng bị cấm tải mọi thứ. Nên
      trình phát bỏ nút tải của trình duyệt, chặn chuột phải trên chính
      nó, và không bao giờ để đường dẫn tệp lộ ra dưới dạng liên kết.
      Đây không phải khoá tuyệt đối — ai quyết tâm vẫn ghi màn hình được
      — nhưng nó chặn đường dễ, và đường dễ mới là đường người ta đi.

   Lưu ý về khoá sao chép: lớp chống chép của khách hàng có bọc
   speechSynthesis để chặn đường chép nội dung bằng giọng máy. Bản thu
   chính thức là tệp âm thanh, không phải giọng máy đọc trang, nên nó
   không đi qua cửa đó và vẫn nghe bình thường.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;

(function(){
var U = G.U, h = U.h, ic = U.ic;
G.VIEWS = G.VIEWS || {};

var KHO_CHON = 'gita365_doc_hay_nghe';
var cheDo = 'doc';                 /* 'doc' hoặc 'nghe' */
try{ cheDo = localStorage.getItem(KHO_CHON) === 'nghe' ? 'nghe' : 'doc'; }catch(e){}

G.adCheDo = function(){ return cheDo; };
G.adDatCheDo = function(x){
  cheDo = (x === 'nghe') ? 'nghe' : 'doc';
  try{ localStorage.setItem(KHO_CHON, cheDo); }catch(e){}
};

/* ─── Hồ sơ giọng cho một cấp tài khoản ─── */
function giongCua(cap){
  var ds = G.AD_GIONG || [];
  var k = (cap === 'HS' || cap === 'PH' || cap === 'CTV') ? cap : 'NGHE';
  return ds.filter(function(x){ return x.cap === k; })[0] || null;
}

/* Một hồ sơ giọng chỉ hợp lệ khi có đủ tên, hợp đồng, hạn — và còn hạn */
G.adGiongHopLe = function(g){
  if(!g) return false;
  if(!String(g.ten || '').trim()) return false;
  if(!String(g.hopDong || '').trim()) return false;
  if(!String(g.den || '').trim()) return false;
  var den = new Date(g.den + 'T23:59:59');
  if(isNaN(den.getTime())) return false;
  return den.getTime() >= Date.now();
};

/* Trạng thái thật của bản thu cho một chuyện */
G.adTrangThai = function(c){
  var g = giongCua(c && c.cap);
  if(!g) return {ma:'chua', giong:null};
  if(!String(g.ten || '').trim() || !String(g.hopDong || '').trim())
    return {ma:'chua', giong:g};
  if(!G.adGiongHopLe(g)) return {ma:'hethan', giong:g};
  if(g.trangThai === 'daky') return {ma:'daky', giong:g};
  return {ma:'song', giong:g};
};
function ttObj(ma){
  return (G.AD_TRANGTHAI || []).filter(function(x){ return x.ma === ma; })[0] ||
         {ma:ma, ten:ma, c:'var(--ink-4)', y:''};
}

G.adDuongDan = function(c){
  return (G.AD_THUMUC || 'assets/am-thanh/') + c.ma + (G.AD_DUOI || '.m4a');
};

/* ─── Kịch bản dẫn: ghép từ chính nội dung chuyện, không thêm bớt ý ─── */
G.adKichBan = function(c){
  if(!c) return '';
  var l = G.chLoi ? G.chLoi(c.loi) : null;
  var d = [];
  d.push('[MỞ · đọc chậm, nghỉ một nhịp]');
  d.push(c.ma + ' — ' + c.ten);
  d.push('');
  d.push('[KỂ · giọng kể, không giọng đọc báo]');
  d.push(c.ke);
  d.push('');
  d.push('[CHỖ XOAY · hạ giọng, chậm lại]');
  d.push(c.xoay);
  d.push('');
  d.push('[ĐIỀU RÚT RA · đọc rõ từng chữ]');
  d.push(c.hoc);
  if(l){
    d.push('');
    d.push('[CÂU MANG THEO · đọc kèm tên tác giả, không bỏ tên]');
    d.push(l.c + ' — ' + l.ai);
  }
  d.push('');
  d.push('[VIỆC LÀM NGAY · giọng mời, nghỉ dài rồi mới hết]');
  d.push(c.lam);
  return d.join('\n');
};

/* ─── Trình phát ─── */
G.adTrinhPhat = function(c){
  var tt = G.adTrangThai(c);
  var T = ttObj(tt.ma);

  if(tt.ma !== 'song'){
    /* Nói thật là chưa nghe được, và nói rõ đang chờ gì */
    return '<div class="card mt2" style="border-left:3px solid '+T.c+'">'+
      '<div class="row" style="gap:9px;align-items:center;flex-wrap:wrap">'+
        ic('bell','w-4 h-4')+'<b style="color:'+T.c+'">'+h(T.ten)+'</b></div>'+
      '<p class="sm mt" style="line-height:1.7">'+h(T.y)+'</p>'+
      (tt.ma === 'chua'
        ? '<p class="tiny mt muted" style="line-height:1.65">Kịch bản dẫn của chuyện này đã sẵn sàng, đúng định dạng '+
          'phòng thu cầm vào là đọc được. Thiếu đúng một thứ: hợp đồng giọng đọc do chính người dẫn ký. '+
          'Học viện không gắn tên ai lên một bản thu mà người đó chưa ký.</p>' : '')+
      '<div class="row mt2" style="gap:9px;flex-wrap:wrap">'+
        '<button class="btn ghost sm" data-v="giong-doc">Xem hồ sơ giọng đọc</button>'+
        (G.can && G.can('nghe_chung')
          ? '<button class="btn ghost sm" data-adkb="'+h(c.ma)+'">Xem kịch bản dẫn</button>' : '')+
      '</div></div>';
  }

  var g = tt.giong;
  return '<div class="card mt2" style="border-left:3px solid var(--ok)">'+
    '<div class="row" style="gap:9px;align-items:center;flex-wrap:wrap">'+
      ic('quote','w-4 h-4')+'<b>Nghe người dẫn đọc</b>'+
      '<span class="chip" style="color:var(--ok)">'+h(g.ten)+'</span></div>'+
    '<audio class="ad-may" controls preload="none" controlsList="nodownload noplaybackrate" '+
      'oncontextmenu="return false" style="width:100%;margin-top:10px" '+
      'src="'+h(G.adDuongDan(c))+'" data-adnghe="'+h(c.ma)+'"></audio>'+
    '<p class="tiny mt muted">Bản thu dùng theo hợp đồng '+h(g.hopDong)+', có hạn tới '+h(g.den)+'. '+
      'Chỉ nghe trong ứng dụng, không tải xuống, không phát lại ở nơi khác.</p></div>';
};

/* ═══════════════ MÀN HỒ SƠ GIỌNG ĐỌC ═══════════════ */
G.VIEWS['giong-doc'] = function(){
  var quanTri = !!(G.can && G.can('qt_trang'));

  var o = U.ph({eyebrow:'ĐỌC HOẶC NGHE · BẢN QUYỀN GIỌNG', ic:'quote', grad:1,
    t:'Giọng đọc cho kho chuyện',
    lead:'Sáu trăm chuyện đều có thể nghe thay vì đọc. Phần kỹ thuật đã dựng xong: chỗ để tệp, trình phát, '+
      'nút chuyển Đọc ↔ Nghe, chống tải xuống. Còn đúng một thứ không nằm trong tay hệ thống — hợp đồng '+
      'giọng đọc do chính người dẫn ký.'});

  /* Nói thẳng chỗ khó, ngay đầu màn */
  o += '<div class="card mt2" style="border-color:var(--gita-vien-1)">'+
    '<b>'+ic('shield','w-4 h-4')+' Vì sao chưa có bản thu nào</b>'+
    '<p class="sm mt" style="line-height:1.75">Giọng của một người có thật là tài sản của chính họ. Muốn dùng giọng '+
    'một MC dẫn chương trình — của VTV hay bất kỳ đài nào — thì phải có hợp đồng ghi âm hoặc hợp đồng cấp quyền '+
    'sử dụng giọng, do chính người đó ký. Không có văn bản ấy thì mọi bản ghi mang danh họ, dù thu thật hay dựng '+
    'bằng máy, đều là mạo danh: sai luật, và hỏng đúng thứ Học viện đang bán là lòng tin.</p>'+
    '<p class="sm mt" style="line-height:1.75">Nên hệ thống làm sẵn tất cả phần còn lại. Ngày ký được hợp đồng với '+
    'người dẫn nào, thả tệp vào đúng thư mục và điền ba ô trong hồ sơ dưới đây — audio lên ngay, không phải sửa '+
    'một dòng mã nào.</p></div>';

  /* Hồ sơ từng giọng */
  o += U.sec('BỐN GIỌNG CẦN CÓ','Mỗi cấp tài khoản một chất giọng riêng — người nghe khác nhau thì giọng phải khác nhau');
  (G.AD_GIONG || []).forEach(function(g){
    var hopLe = G.adGiongHopLe(g);
    var T = ttObj(hopLe ? 'song' : (String(g.ten||'').trim() ? 'hethan' : 'chua'));
    o += '<div class="card mt2" style="border-left:3px solid '+T.c+'">'+
      '<div class="row" style="gap:9px;align-items:baseline;flex-wrap:wrap">'+
        '<span class="mono tiny" style="color:'+T.c+'">'+h(g.ma)+'</span>'+
        '<b style="flex:1;min-width:200px">'+h(g.vai)+'</b>'+
        '<span class="chip" style="color:'+T.c+'">'+h(T.ten)+'</span></div>'+
      '<p class="sm mt" style="line-height:1.7"><b>Chất giọng cần:</b> '+h(g.chatGiong)+'</p>'+
      '<div class="row wrap mt2" style="gap:11px">'+
        ['Người dẫn|'+(g.ten || '— chưa có —'),
         'Hợp đồng số|'+(g.hopDong || '— chưa có —'),
         'Có hạn tới|'+(g.den || '— chưa có —')]
        .map(function(x){
          var p = x.split('|');
          return '<div style="flex:1;min-width:170px"><span class="tiny up muted">'+h(p[0])+'</span>'+
            '<div class="sm mt" style="color:'+(p[1].indexOf('chưa có') >= 0 ? 'var(--ink-4)' : 'var(--ink)')+'">'+
            h(p[1])+'</div></div>';
        }).join('')+
      '</div>'+
      (quanTri && !hopLe
        ? '<p class="tiny mt" style="line-height:1.65;color:var(--gita-do-ink)">Điền đủ ba ô trên trong '+
          'kho-goc/data.giong-doc.js rồi thả tệp vào '+h(G.AD_THUMUC)+' theo đúng mã chuyện. '+
          'Hệ thống tự kiểm hạn và tự gỡ khi quá hạn.</p>' : '')+
    '</div>';
  });

  /* Điều khoản hợp đồng */
  o += U.sec('SÁU ĐIỀU KHOẢN BẮT BUỘC TRONG HỢP ĐỒNG','Bộ này để đưa bộ phận pháp lý, không phải để trang trí');
  o += '<div class="card">'+ (G.AD_DIEUKHOAN || []).map(function(x, i){
    return '<div style="'+(i ? 'border-top:1px solid var(--line);padding-top:12px;margin-top:12px' : '')+'">'+
      '<b class="sm">'+(i+1)+'. '+h(x.t)+'</b>'+
      '<p class="tiny mt" style="line-height:1.7">'+h(x.y)+'</p></div>';
  }).join('') +'</div>';

  /* Chuẩn kỹ thuật */
  o += U.sec('CHUẨN KỸ THUẬT GỬI PHÒNG THU','Gửi nguyên bảng này thì không phải thu lại lần hai');
  o += U.tbl(['Mục','Yêu cầu'], (G.AD_KYTHUAT || []).map(function(x){
    return ['<b class="sm">'+h(x.t)+'</b>', '<span class="sm">'+h(x.y)+'</span>'];
  }));

  /* Khung kịch bản */
  o += U.sec('KHUNG KỊCH BẢN DẪN','Hệ thống tự ghép kịch bản từ nội dung chuyện — phòng thu không phải viết lại gì');
  o += U.tbl(['Phần','Khoảng','Chỉ dẫn đọc'], (G.AD_KHUNG || []).map(function(x){
    return ['<b class="sm">'+h(x.phan)+'</b>', '<span class="mono sm">~'+x.giay+'s</span>',
            '<span class="sm">'+h(x.chi)+'</span>'];
  }));

  o += '<div class="card mt2" style="background:var(--phu-1)">'+
    '<p class="sm" style="line-height:1.75">Tổng khối lượng nếu thu đủ sáu trăm chuyện: khoảng '+
    '<b>hai mươi bốn tới ba mươi giờ thành phẩm</b>. Nên thu theo đợt — một trăm chuyện của kho Học viên trước, '+
    'vì đó là nhóm cần nghe nhất và ít đọc nhất.</p>'+
    '<button class="btn ghost sm mt" data-v="chuyen-cam-hung">Về kho chuyện</button></div>';

  return o;
};

/* ═══════════════ BẤM ═══════════════ */
document.addEventListener('click', function(e){
  var t = e.target;
  if(!t || !t.closest) return;

  var m = t.closest('[data-adche]');
  if(m){
    G.adDatCheDo(m.getAttribute('data-adche'));
    if(G.render) G.render();
    return;
  }
  var k = t.closest('[data-adkb]');
  if(k){
    var ma = k.getAttribute('data-adkb');
    var c = (G.CHUYEN || []).filter(function(x){ return x.ma === ma; })[0];
    if(!c) return;
    U.modal('<div style="max-width:640px"><b style="font-size:18px">Kịch bản dẫn · '+h(c.ma)+'</b>'+
      '<p class="tiny muted mt">Gửi nguyên phần này cho phòng thu. Không thêm, không bớt ý.</p>'+
      '<pre class="cho-chep" style="white-space:pre-wrap;line-height:1.75;font-size:14.5px;'+
        'background:var(--phu-1);padding:14px;border-radius:12px;margin-top:12px;max-height:56vh;overflow:auto">'+
        h(G.adKichBan(c))+'</pre></div>');
  }
});

/* Chặn nốt đường tải xuống trên chính trình phát, sau mỗi lần vẽ lại màn */
G.adDonTrinhPhat = function(){
  document.querySelectorAll('audio.ad-may').forEach(function(a){
    a.setAttribute('controlsList', 'nodownload noplaybackrate');
    a.oncontextmenu = function(){ return false; };
  });
};

/* ═══════════════ GẮN VÀO KHO CHUYỆN ═══════════════
   Bọc G.veChuyen để mọi chỗ hiện chuyện đều có nút chuyển Đọc ↔ Nghe:
   màn kho chuyện, chuyện hôm nay, và chuyện đi kèm từng nhiệm vụ. */
(function(){
  var goc = G.veChuyen;
  if(typeof goc !== 'function') return;
  G.veChuyen = function(c, gon){
    if(!c) return '';
    var than = goc.call(this, c, gon);
    var nghe = (cheDo === 'nghe');
    var tt = G.adTrangThai(c);

    var nut = '<div class="row" style="gap:7px;flex-wrap:wrap;margin-bottom:9px">'+
      '<button class="btn '+(nghe ? 'ghost' : 'pri')+' sm" data-adche="doc">'+
        ic('book','w-3 h-3')+' Đọc</button>'+
      '<button class="btn '+(nghe ? 'pri' : 'ghost')+' sm" data-adche="nghe">'+
        ic('quote','w-3 h-3')+' Nghe'+(tt.ma === 'song' ? '' : ' · chưa có bản thu')+'</button>'+
    '</div>';

    /* Bọc ngoài thay vì chèn vào giữa thân chuyện: chèn vào giữa thì phụ
       thuộc hình dạng HTML của hàm gốc, và hàm gốc đổi một chút là hỏng. */
    return '<div class="ch-boc">' + nut + than + (nghe ? G.adTrinhPhat(c) : '') + '</div>';
  };
})();

})();
