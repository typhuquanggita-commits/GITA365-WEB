/* ═══════════════════════════════════════════════════════════════
   GITA 365 · v7.0 — MÀN HÌNH BỔ SUNG
   Bắt đầu · Người đồng hành · Ghi nhận · Người dẫn dắt ·
   Cơ chế tài chính · Nhận diện thương hiệu · Rà soát hệ thống
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;
G.VIEWS = G.VIEWS || {};
(function(){
var U = G.U, h = U.h, ic = U.ic;

/* ═══════════════ BẮT ĐẦU Ở ĐÂY ═══════════════ */
/* ── Bằng chứng cho năm bước đầu ──
   Trước v9.2 màn này đánh dấu xong bằng G.S.checks['b'+i] — một ô tự
   tích, không nối với bất cứ dữ liệu nào. Nghĩa là bước "Viết bảng tầm
   nhìn" tích được khi chưa viết chữ nào, và bước "Đủ bảy tối rồi đọc
   lại" tích được khi sổ nhật ký trống trơn. Chuỗi dẫn hành động mà đi
   tiếp bằng lời khai thì nó dẫn đi đâu cũng được.

   Nay bước nào CÓ dấu vết trong máy thì đọc dấu vết ấy, và ô tích của
   bước đó thành ô chỉ-đọc: hệ thống tự bật khi đủ. Bước nào không có
   dấu vết nào để đọc — "nhìn tấm bản đồ một lần", "chốt bảng chín vai
   trong một buổi tối" — thì vẫn là ô tự xác nhận, và màn nói thẳng
   đấy là lời tự khai chứ không phải phép đo.

   Hàm trả về null nghĩa là "không đo được, dùng ô tự tích". */
function bcNhatKy(n){
  return function(){
    var j = G.S.journal || {}, d = 0;
    Object.keys(j).forEach(function(k){
      var v = j[k];
      if(typeof v === 'string' ? v.trim().length > 2 : !!v) d++;
    });
    return { xong: d, can: n, dat: d >= n, do: d + '/' + n + ' tối đã ghi' };
  };
}
function bcTamNhin(){
  var v = G.S.vision || {}, d = 0;
  Object.keys(v).forEach(function(k){ if(String(v[k]||'').trim().length > 20) d++; });
  return { xong: d, can: 1, dat: d >= 1, do: d ? d + ' ô đã viết' : 'chưa có ô nào' };
}
function bcBaiTest(n){
  return function(){
    var t = G.S.test || {}, d = 0;
    Object.keys(t).forEach(function(k){ if(t[k] && t[k].xong) d++; });
    return { xong: d, can: n, dat: d >= n, do: d + '/' + n + ' bài đã chấm' };
  };
}
function bcViecHomNay(){
  var ds = (G.TODAY || {})[G.myPortal ? G.myPortal() : 'ph'] || [];
  var d = ds.filter(function(_, i){ return G.S.checks['t' + i]; }).length;
  return { xong: d, can: ds.length, dat: ds.length > 0 && d >= ds.length,
           do: d + '/' + ds.length + ' việc hôm nay' };
}

G.VIEWS['bat-dau'] = function(){
  var p = G.myPortal();
  var buoc = {
    ph:[
      {t:'Nhìn tấm bản đồ một lần',    d:'Năm khoang, chín vai. Chưa cần làm gì cả — chỉ xem nhà mình đang đứng ở khoang nào.', v:'ban-do', p:'5 phút'},
      {t:'Viết bảng tầm nhìn',          d:'Cả nhà ngồi đủ mặt. Mỗi người viết bằng lời của mình. Không ai viết hộ ai.', v:'tam-nhin', p:'40 phút', bc:bcTamNhin},
      {t:'Ghi ba dòng nhật ký tối nay', d:'Giờ ngồi vào bàn · giờ rời bàn · số lần phải nhắc. Ăn cơm xong là mở sổ.', v:'nhat-ky-vi-tri', p:'2 phút mỗi tối', bc:bcNhatKy(1)},
      {t:'Đủ bảy tối rồi đọc lại',      d:'Bảy dòng, không cần đẹp. Tìm một tối khác hẳn sáu tối còn lại — đó là đòn bẩy.', v:'dinh-vi', p:'20 phút', bc:bcNhatKy(7)},
      {t:'Chốt bảng chín vai',          d:'Một buổi tối, cả nhà tự nhận vai mình giữ. Có biên bản, dán lên tường.', v:'chin-vai', p:'60 phút'}
    ],
    hs:[
      {t:'Xem hành trình của mình',     d:'Năm chặng. Em đang ở chặng nào và chặng sau là gì.', v:'hanh-trinh-con', p:'5 phút'},
      {t:'Ghi nhật ký ba dòng',         d:'Hôm nay chỗ nào mình tuột, chỗ nào mình giữ được.', v:'nhat-ky-vi-tri', p:'2 phút', bc:bcNhatKy(1)},
      {t:'Chọn một việc khó làm trước', d:'25 phút không điện thoại, làm việc khó nhất trước.', v:'nhiem-vu', p:'25 phút', bc:bcViecHomNay},
      {t:'Chuẩn bị một câu cho buổi ngồi lại', d:'Điều mình muốn bố mẹ hiểu mà chưa nói được.', v:'thoi-quen', p:'10 phút'},
      {t:'Nhận huy hiệu đầu tiên',      d:'Bảy tối liên tục có dữ liệu — kể cả tối ghi "quên".', v:'phan-thuong', p:'7 ngày', bc:bcNhatKy(7)}
    ],
    coach:[
      {t:'Đọc sáu ranh giới trước',     d:'Bắt buộc, trước khi dùng mô hình với bất kỳ gia đình nào.', v:'ranh-gioi', p:'10 phút'},
      {t:'Mở buồng lái',                d:'Xem nhà nào băng CAM và ĐỎ — chạm trong 48 giờ.', v:'coach-deck', p:'5 phút'},
      {t:'Kê đúng kịch bản cho đúng tầng', d:'Mở kịch bản của buổi hôm nay, đọc câu mở và phần không được làm.', v:'kich-ban', p:'15 phút'},
      {t:'Học một mô thức',             d:'Mỗi tháng một mô thức, thực hành ngay trên ca của mình.', v:'mo-thuc', p:'30 phút'},
      {t:'Gửi ghi nhận tuần',           d:'Công thức ba bước: thấy gì · họ tự làm gì · điều đó giúp ai.', v:'vinh-danh', p:'20 phút'}
    ],
    tuvan:[
      {t:'Thuộc sáu nhịp ngôn từ',      d:'Đi đúng thứ tự. Nhảy sang nhịp năm khi chưa qua nhịp ba là mất người.', v:'ngon-tu', p:'40 phút'},
      {t:'Đọc bản đồ điểm chạm',        d:'Chín khoảnh khắc quyết định họ ở lại hay không.', v:'diem-cham', p:'20 phút'},
      {t:'Mở khoang đón nhà mới',       d:'Ba gia đình đang chờ phiên mở cửa tuần này.', v:'tuvan-deck', p:'5 phút'},
      {t:'Gửi bản đồ một trang',        d:'Không kèm bảng giá ở lần đầu. Cho họ thấy nhà mình trong bản đồ trước.', v:'ban-do', p:'10 phút'},
      {t:'Rà lại ranh giới ngôn từ',    d:'Sáu điều không được làm — đọc lại trước mỗi phiên.', v:'ranh-gioi', p:'5 phút'}
    ],
    /* Nhánh cộng tác viên. Trước v9.2 không có nhánh này, nên ctv rơi
       vào `buoc.ph` và được giao năm bước của một gia đình: viết bảng
       tầm nhìn của nhà mình, chốt bảng chín vai trong nhà. Cộng tác
       viên không có "nhà mình" trong hệ thống — họ có mã liên kết, có
       nhà mình giới thiệu, và có trần hoa hồng 10%. */
    ctv:[
      {t:'Đọc sáu điều GITA 365 KHÔNG làm', d:'Phần phải thuộc trước phần "làm". Nói sai một câu ở buổi đầu thì ba tháng sau Học viện mất một gia đình — và người giới thiệu mất uy tín trước chính người quen của mình.', v:'gioi-thieu', p:'10 phút'},
      {t:'Mở mã liên kết của mình',    d:'Mã dạng CTV-xxxxxx là chỗ DUY NHẤT hệ thống ghi nhận công. Giới thiệu miệng mà người ta tự đăng ký thì không có gì để đối soát.', v:'ve-tinh', p:'5 phút'},
      {t:'Làm việc của hôm nay',       d:'Việc của cộng tác viên là việc theo ngày, không phải theo đợt. Một tuần im lặng là một tuần không nhà nào được giới thiệu.', v:'nhiem-vu', p:'dưới 20 phút', bc:bcViecHomNay},
      {t:'Ghi sổ nhật ký vị trí',      d:'Hoa hồng tính trên việc có ghi chép. Làm mà không ghi thì tới kỳ đối soát không có gì đối chiếu.', v:'nhat-ky-vi-tri', p:'5 phút mỗi ngày', bc:bcNhatKy(1)},
      {t:'Đọc trần hoa hồng và ranh giới chia sẻ', d:'Trần 10%, không ngoại lệ, và sáu điều không được làm khi kể chuyện nhà người khác. Đọc trước khi kể, không đọc sau khi bị nhắc.', v:'ranh-gioi', p:'15 phút'}
    ],
    admin:[
      {t:'Mở trung tâm điều hành',      d:'Toàn cảnh sức khoẻ hệ sinh thái, nhà nào cần chạm trước.', v:'dieu-hanh', p:'5 phút'},
      {t:'Đọc biên bản rà soát',        d:'Bốn lỗi đã vá, bảy điểm cần máy chủ. Xem chỗ nào chặn phát hành.', v:'ra-soat', p:'15 phút'},
      {t:'Xem chuẩn 1000 điểm',         d:'Mười nhóm, từng chi tiết. Biết còn thiếu đúng bao nhiêu điểm.', v:'chuan-1000', p:'15 phút'},
      {t:'Duyệt hàng chờ kho báu vật',  d:'Năm mục đang chờ, một mục vi phạm quy tắc an toàn.', v:'kiem-duyet', p:'20 phút'},
      {t:'Xác nhận sáu điểm chưa chắc', d:'Kho mô thức chờ chủ hệ thống chốt để gỡ cờ.', v:'kiem-duyet', p:'30 phút'}
    ]
  };
  var list = buoc[p] || buoc.ph;
  /* Bước nào đo được thì đọc dấu vết; bước nào không thì đọc ô tự tích. */
  var soDo = list.map(function(x){ return x.bc ? x.bc() : null; });
  var xongCua = list.map(function(x,i){ return soDo[i] ? soDo[i].dat : !!G.S.checks['b'+i]; });
  var done = xongCua.filter(Boolean).length;
  var soDoDuoc = soDo.filter(Boolean).length;

  var o = U.ph({eyebrow:'BẮT ĐẦU Ở ĐÂY', ic:'seed', grad:1, t:'Năm bước đầu tiên',
    lead:'Không phải năm mươi màn hình. Chỉ năm bước, đúng thứ tự, cho đúng vai của anh chị. Làm xong bước một rồi hãy nhìn bước hai.'});

  o += '<div class="card glow mb"><div class="row wrap" style="gap:24px">'+
    U.ring(Math.round(done/list.length*100), 'var(--gita)', 'ĐÃ XONG')+
    '<div class="grow" style="min-width:230px"><div class="up muted">ĐANG ĐI VỚI VAI</div>'+
    '<h2 style="font-size:21px;font-weight:800;margin:4px 0 6px">'+h(G.S.roleObj.n)+'</h2>'+
    '<p class="sm dim">'+h((G.PORTALS[p]||{}).say||'')+'</p></div></div></div>';

  if(soDoDuoc)
    o += '<div class="card mb" style="border-color:var(--gita-vien-1)">'+
      '<p class="tiny" style="line-height:1.75;color:var(--ink-2)"><b>'+soDoDuoc+' trong '+list.length+
      ' bước dưới đây tự đánh dấu bằng DẤU VẾT THẬT</b> — bài đã chấm, dòng đã ghi, ô đã tích trong máy này. '+
      'Không tích tay được, và cũng không cần tích: đủ là tự bật. '+(list.length-soDoDuoc)+
      ' bước còn lại không có gì để đo — chúng xảy ra ngoài màn hình — nên vẫn là ô anh chị tự xác nhận, '+
      'và ô ấy là lời tự khai chứ không phải phép đo.</p></div>';

  o += list.map(function(x,i){
    var dm = soDo[i], d = xongCua[i], next = !d && i===done;
    var oTick = !dm;   /* chỉ bước KHÔNG đo được mới bấm tích tay */
    return '<div class="card mb '+(next?'glow':'')+'" style="'+(d?'opacity:.72':'')+'">'+
      '<div class="row wrap" style="gap:14px;align-items:flex-start">'+
      '<'+(oTick?'button':'span')+' class="bx"'+(oTick?' data-check="b'+i+'"':'')+
      ' style="width:34px;height:34px;border-radius:11px;'+
      'border:1.5px solid '+(d?'transparent':'var(--line-2)')+';display:grid;place-items:center;flex:none;'+
      (d?'background:linear-gradient(135deg,var(--ok),#0B7350);color:#04241A':'color:var(--ink-4)')+'">'+
      (d?ic('check','w-4 h-4'):'<b style="font-size:14.5px">'+(i+1)+'</b>')+'</'+(oTick?'button':'span')+'>'+
      '<div class="grow" style="min-width:220px">'+
        '<div class="row wrap" style="gap:8px;margin-bottom:5px">'+
        /* Lớp `buoc-t` để bộ kiểm bám vào CẤU TRÚC. Trước v9.26 mục 42
           bám vào chuỗi "font-size:15.5px" — rồi thang cỡ chữ đổi 15,5
           thành 16, phép kiểm khớp rỗng, ba chuỗi thành ba chuỗi rỗng
           GIỐNG NHAU, và nó đỏ như thể mã hỏng. Phép kiểm buộc vào một
           con số trình bày là phép kiểm sẽ đỏ oan ở lần đổi giao diện
           kế tiếp. */
        '<b class="buoc-t" style="font-size:16px">'+h(x.t)+'</b>'+U.chip(x.p)+
        (next?U.chip('BƯỚC TIẾP THEO','var(--gita)',1):'')+
        (dm?U.chip(dm.do, d?'#0B7350':'var(--ink-4)'):U.chip('tự xác nhận'))+'</div>'+
        '<p class="sm dim" style="line-height:1.6">'+h(x.d)+'</p>'+
        (dm && !dm.dat && dm.can>1
          ? '<div class="mt">'+U.bar(Math.round(dm.xong/dm.can*100), 'var(--gita)')+'</div>' : '')+
      '</div>'+
      '<button class="btn '+(next?'pri':'ghost')+' sm" data-go="'+h(x.v)+'">Mở '+ic('arrow')+'</button>'+
      '</div></div>';
  }).join('');

  if(done===list.length)
    o += '<div class="card glow center mt2"><div style="color:var(--gold-ink);margin-bottom:10px">'+ic('crown','w-9 h-9')+'</div>'+
      '<b style="font-size:18px">Xong năm bước đầu tiên.</b>'+
      '<p class="sm muted mt" style="max-width:56ch;margin-inline:auto">Từ đây hệ thống không dẫn theo bước nữa — nó dẫn theo nhịp. '+
      'Mỗi ngày một check-in, mỗi tuần một buổi ngồi lại, mỗi 21 ngày một đêm rà đòn bẩy.</p>'+
      '<button class="btn pri mt2" data-go="thoi-quen">Xem nhịp sống của nhà mình '+ic('arrow')+'</button></div>';
  return o;
};

/* ═══════════════ NGƯỜI ĐỒNG HÀNH ═══════════════ */
G.VIEWS['dong-hanh'] = function(){
  var moods = [
    {k:'met',  t:'Mệt',       c:'#F87175', d:'Hôm nay nhà mình đuối'},
    {k:'roi',  t:'Rối',       c:'#BE0E16', d:'Không biết bắt đầu từ đâu'},
    {k:'thuong',t:'Bình thường',c:'#38BDF8',d:'Vẫn đang đi'},
    {k:'sang', t:'Sáng',      c:'#0B7350', d:'Có chuyện tốt muốn kể'}
  ];
  var cur = G.S.mood;
  var traLoi = {
    met:{t:'Anh chị mệt là đúng.', d:'Em không bảo anh chị cố lên. Hôm nay mình bỏ hết, giữ đúng một việc nhỏ nhất: ghi ba dòng nhật ký rồi đi ngủ. Dòng "quên" cũng là dữ liệu thật. Ngày mai mình nói tiếp.', v:'nhiem-vu', b:'Chỉ ghi ba dòng thôi'},
    roi:{t:'Rối là vì đang nhìn cả năm khoang một lúc.', d:'Nhà mình không hụt ở năm chỗ. Mình mở bản đồ, chỉ nhìn đúng một khoang đang hụt, rồi chọn đúng một đòn bẩy cho 21 ngày tới. Không chọn hai.', v:'ban-do', b:'Mở bản đồ, tìm một khoang'},
    thuong:{t:'Vẫn đang đi là đã hơn phần lớn rồi.', d:'Giai đoạn này không cần cú hích. Cần nhịp. Giữ đúng buổi ngồi lại cuối tuần, dù hôm đó chỉ mười lăm phút.', v:'thoi-quen', b:'Xem nghi lễ tuần này'},
    sang:{t:'Kể em nghe với.', d:'Chuyện tốt trong nhà mà không được kể lại thì tuần sau không ai nhớ nó đã xảy ra. Ghi nhận theo ba bước: thấy gì · ai đã tự làm gì · điều đó giúp ai.', v:'vinh-danh', b:'Ghi nhận chuyện hôm nay'}
  };
  var o = U.ph({eyebrow:'NHÓM 01 · KHỞI NGUỒN', ic:'heart', grad:1, t:'Người đồng hành',
    lead:'Không phải một trợ lý trả lời cho nhanh. Là chỗ để nói thật khi trong nhà chưa nói được với ai — nghe trước, công nhận, rồi mới dẫn đúng một bước.'});

  o += '<div class="card glow"><b style="font-size:18px;display:block;margin-bottom:4px">Hôm nay nhà mình thế nào?</b>'+
    '<p class="sm muted mb">Không có đáp án đúng. Chọn cái gần nhất với thật.</p>'+
    '<div class="grid g4">' + moods.map(function(m){
      return '<button class="card pad-sm lift '+(cur===m.k?'glow':'')+'" data-mood="'+m.k+'" '+
        'style="text-align:center;border-color:'+m.c+(cur===m.k?'66':'26')+'">'+
        '<b style="font-size:16px;color:'+m.c+';display:block">'+h(m.t)+'</b>'+
        '<span class="tiny muted">'+h(m.d)+'</span></button>';
    }).join('') + '</div>';
  if(cur && traLoi[cur]){
    var r = traLoi[cur];
    o += '<div class="mt2" style="padding:18px 20px;border-radius:16px;background:var(--gita-mo-1);border-left:2px solid var(--gold)">'+
      '<b class="serif" style="font-size:18px;font-style:italic;color:var(--gold-2);display:block;margin-bottom:8px">'+h(r.t)+'</b>'+
      '<p class="sm" style="line-height:1.7">'+h(r.d)+'</p>'+
      '<button class="btn pri sm mt2" data-go="'+h(r.v)+'">'+h(r.b)+' '+ic('arrow')+'</button></div>';
  }
  o += '</div>';

  o += U.sec('NGƯỜI ĐỒNG HÀNH NÀY LÀM GÌ VÀ KHÔNG LÀM GÌ','Nói rõ từ đầu để anh chị biết mình đang dựa vào cái gì');
  var lam = [
    {ok:1, t:'Nghe hết trước khi nói',   d:'Mười phút đầu không đưa giải pháp nào, dù nhìn thấy rõ.'},
    {ok:1, t:'Công nhận có bằng chứng',  d:'Gọi tên đúng một việc anh chị đã tự làm được, không kèm chữ "nhưng".'},
    {ok:1, t:'Chỉ giao một bước',        d:'Một việc nhỏ làm được trong 24 giờ, kèm cách tự biết mình đã làm được.'},
    {ok:1, t:'Ở lại đúng phạm vi tầng',  d:'Không hứa điều thuộc về tầng anh chị chưa bước vào.'},
    {ok:0, t:'Không chẩn đoán tâm lý',   d:'Đây là đồng hành giáo dục, không phải can thiệp lâm sàng. Có mốc thì chuyển tuyến.'},
    {ok:0, t:'Không phán xét ai trong nhà',d:'Không mô tả con người bằng tính từ. Chỉ mô tả hành vi và hoàn cảnh.'},
    {ok:0, t:'Không dùng chuyện của nhà mình để bán gì', d:'Mọi thứ nói ở đây ở lại đây.'},
    {ok:0, t:'Không thay anh chị quyết định',d:'Coach đưa khung và giữ chuẩn. Nhà mình lắp phần của mình.'}
  ];
  o += '<div class="grid g2">' + lam.map(function(x){
    return '<div class="card pad-sm" style="border-color:'+(x.ok?'rgba(52,211,153,.24)':'rgba(248,113,113,.22)')+'">'+
      '<div class="row" style="gap:9px;margin-bottom:5px">'+
      '<span style="color:'+(x.ok?'var(--ok)':'var(--bad)')+';flex:none">'+ic(x.ok?'check':'x','w-4 h-4')+'</span>'+
      '<b class="sm">'+h(x.t)+'</b></div>'+
      '<p class="tiny muted" style="line-height:1.55;padding-left:25px">'+h(x.d)+'</p></div>';
  }).join('') + '</div>';

  o += U.sec('KHI NÀO CŨNG CÓ MẶT','Ba đường vào, không đường nào phải chờ');
  o += '<div class="grid g3">'+
    ['<b>Ngay trong ứng dụng</b><p class="tiny muted mt">Ô này, bất cứ lúc nào — kể cả 2 giờ sáng.</p>',
     '<b>Coach của nhà mình</b><p class="tiny muted mt">Nhắn trong giờ đã hẹn. Ngoài giờ vẫn đọc, trả lời buổi sáng.</p>',
     '<b>Nhóm đồng hành</b><p class="tiny muted mt">Nơi kể chỗ mình vấp không bị đánh giá — có 13 quy tắc an toàn giữ chỗ đó.</p>'
    ].map(function(x){ return '<div class="card pad-sm">'+x+'</div>'; }).join('') + '</div>';

  o += '<div class="mt2">'+U.quote('Anh chị cứ kể hết đi ạ, em chưa góp ý gì đâu. Em muốn nghe cho đủ trước đã.','Nhịp ngôn từ 02 · Nghe')+'</div>';
  return o;
};

/* ═══════════════ GHI NHẬN · CẤP ĐỘ · QUÀ TẶNG ═══════════════ */
G.VIEWS['phan-thuong'] = function(){
  var diem = 1680;
  var lv = G.LEVELS[0], next = G.LEVELS[1];
  G.LEVELS.forEach(function(l,i){ if(diem>=l.diem){ lv=l; next=G.LEVELS[i+1]||l; } });
  var pct = next===lv ? 100 : Math.round((diem-lv.diem)/(next.diem-lv.diem)*100);

  var o = U.ph({eyebrow:'NHÓM 04 · CÚ HÍCH & NHỊP SỐNG', ic:'crown', grad:1, t:'Ghi nhận · Cấp độ · Quà tặng',
    lead:'Điểm ở đây ghi nhận VIỆC ĐÃ LÀM, không xếp hạng ai. Không có bảng xếp hạng giữa các nhà — nhà mình chỉ so với nhà mình chặng trước.'});

  o += '<div class="card glow mb"><div class="row wrap" style="gap:26px;align-items:center">'+
    U.ring(pct, lv.c, 'LÊN CẤP')+
    '<div class="grow" style="min-width:250px">'+
      '<div class="up muted">CẤP ĐỘ HIỆN TẠI</div>'+
      '<div class="row" style="gap:10px;align-items:baseline;margin:3px 0 6px">'+
      '<b style="font-size:26px;color:'+lv.c+'">LV'+lv.lv+' · '+h(lv.ten)+'</b></div>'+
      '<p class="sm dim">'+h(lv.mo)+'</p>'+
      '<p class="sm mt" style="color:var(--gold-ink)"><b class="mono">'+diem.toLocaleString('vi-VN')+'</b> điểm · còn '+
      '<b class="mono">'+(next.diem-diem).toLocaleString('vi-VN')+'</b> điểm để lên <b>'+h(next.ten)+'</b></p>'+
      '<div class="mt">'+U.bar(pct, lv.c)+'</div></div></div></div>';

  o += U.sec('MƯỜI CẤP ĐỘ HÀNH TRÌNH','Lên cấp bằng việc đã làm có bằng chứng, không bằng thời gian ngồi lâu');
  o += '<div class="grid g5">' + G.LEVELS.map(function(l){
    var reached = diem >= l.diem;
    return '<div class="card pad-sm '+(l.lv===lv.lv?'glow':'')+'" style="border-color:'+l.c+(reached?'55':'1a')+';'+(reached?'':'opacity:.6')+'">'+
      '<div class="row" style="gap:7px;margin-bottom:6px">'+
      '<span class="pill" style="background:'+l.c+'22;color:'+l.c+'">LV'+l.lv+'</span>'+
      (reached?'<span style="color:var(--ok)">'+ic('check','w-3 h-3')+'</span>':'')+'</div>'+
      '<b class="sm" style="display:block;color:'+l.c+';line-height:1.3">'+h(l.ten)+'</b>'+
      '<div class="mono tiny muted mt">'+l.diem.toLocaleString('vi-VN')+' điểm</div>'+
      '<p class="tiny muted mt" style="line-height:1.5">'+h(l.mo)+'</p></div>';
  }).join('') + '</div>';

  o += '<div class="grid g2 mt2" style="gap:20px"><div>';
  o += U.sec('CÁCH TÍCH ĐIỂM','Minh bạch tuyệt đối — không có điểm ẩn');
  o += '<div class="card">' + G.DIEM.map(function(d){
    return '<div style="display:flex;gap:10px;align-items:center;padding:9px 0;border-bottom:1px dashed var(--phu-3)">'+
      '<span class="dot" style="color:'+d.c+';flex:none"></span>'+
      '<span class="sm grow">'+h(d.viec)+'</span>'+
      '<span class="tiny muted">'+h(d.nhip)+'</span>'+
      '<b class="mono" style="color:'+d.c+';min-width:52px;text-align:right">+'+d.d+'</b></div>';
  }).join('') + '</div>';
  o += '</div><div>';
  o += U.sec('HUY HIỆU','Mỗi huy hiệu là một việc thật, có bằng chứng');
  o += '<div class="grid g2">' + G.HUYHIEU.map(function(b){
    return '<div class="card pad-sm" style="border-color:'+b.c+(b.co?'55':'1a')+';'+(b.co?'':'opacity:.5')+'">'+
      '<div style="color:'+b.c+';margin-bottom:6px">'+ic(b.co?'star':'lock','w-5 h-5')+'</div>'+
      '<b class="tiny" style="display:block;color:'+b.c+';letter-spacing:.04em">'+h(b.ten)+'</b>'+
      '<p class="tiny muted mt" style="line-height:1.45">'+h(b.dk)+'</p></div>';
  }).join('') + '</div></div></div>';

  o += U.sec('ĐỔI ĐIỂM LẤY QUÀ','Quà tặng là công cụ đi tiếp, không phải phần thưởng cho việc ngoan');
  o += '<div class="grid g3">' + G.QUA.map(function(q){
    var du = diem >= q.diem;
    return '<div class="card lift" style="border-color:'+q.c+'2a">'+
      '<div class="row" style="gap:8px;margin-bottom:8px">'+
      '<span style="width:34px;height:34px;border-radius:11px;display:grid;place-items:center;background:'+q.c+'22;color:'+q.c+'">'+ic('crown','w-4 h-4')+'</span>'+
      '<b class="mono" style="color:'+q.c+'">'+q.diem.toLocaleString('vi-VN')+'</b><span class="tiny muted">điểm</span></div>'+
      '<b class="sm" style="display:block;line-height:1.35;margin-bottom:6px">'+h(q.ten)+'</b>'+
      '<p class="tiny muted" style="line-height:1.55">'+h(q.mo)+'</p>'+
      '<button class="btn '+(du?'pri':'ghost')+' sm blk mt" data-act="doi-qua"'+(du?'':' disabled style="opacity:.5"')+'>'+
      (du?'Đổi quà này':'Còn '+(q.diem-diem).toLocaleString('vi-VN')+' điểm')+'</button></div>';
  }).join('') + '</div>';

  o += '<div class="card mt2" style="border-color:rgba(248,113,113,.3)">'+
    '<div class="row mb"><span style="color:var(--bad)">'+ic('shield','w-4 h-4')+'</span>'+
    '<b>Vì sao ở đây không có bảng xếp hạng</b></div>'+
    '<p class="sm muted">Cơ chế thi đua tạo động lực trong tổ chức và tạo tổn thương trong nhà. Mỗi đứa trẻ chỉ so với chính nó; mỗi gia đình chỉ so với chính mình chặng trước. Đây là ranh giới số bốn của mô hình và nó không thương lượng.</p></div>';
  return o;
};

/* ═══════════════ HÀNH TRÌNH NGƯỜI DẪN DẮT ═══════════════ */
G.VIEWS['nguoi-dan-dat'] = function(){
  if(!G.can('pro_consult')) return U.lockCard();
  var D = G.DANDAT;
  var o = U.ph({eyebrow:'NHÓM 05 · HỆ SINH THÁI', ic:'flame', grad:1, t:'Hành trình người dẫn dắt',
    lead:D.loiHua});

  o += U.sec('NĂM BẬC NGHỀ','Lên bậc bằng ca thật có bằng chứng, không bằng thâm niên');
  o += '<div class="grid g5">' + D.bac.map(function(b,i){
    return '<div class="card pad-sm lift" style="border-color:'+b.c+'2a">'+
      '<span class="pill" style="background:'+b.c+'22;color:'+b.c+'">BẬC '+(i+1)+'</span>'+
      '<b class="sm" style="display:block;margin:8px 0 5px;color:'+b.c+'">'+h(b.b)+'</b>'+
      '<div class="mono tiny muted">'+(b.gio?b.gio+' giờ đồng hành':'khởi điểm')+'</div>'+
      '<p class="tiny muted mt" style="line-height:1.55">'+h(b.mo)+'</p></div>';
  }).join('') + '</div>';

  o += U.sec('SÁU VIỆC NUÔI LỬA NGƯỜI DẪN DẮT','Người dẫn cạn thì gia đình cũng cạn theo');
  o += '<div class="grid g2">' + D.nuoiLua.map(function(x,i){
    return '<div class="card pad-sm"><div class="row" style="gap:9px;margin-bottom:5px">'+
      '<span class="pill" style="background:var(--gita-mo-2);color:var(--gold-ink)">0'+(i+1)+'</span>'+
      '<b class="sm">'+h(x.t)+'</b></div>'+
      '<p class="tiny muted" style="line-height:1.6">'+h(x.d)+'</p></div>';
  }).join('') + '</div>';

  o += U.sec('ĐÓNG GÓP VÀO KHO BÁU VẬT','Mỗi tư liệu được duyệt là 200 điểm nghề và tên người viết đứng trên tài liệu');
  o += '<div class="card center" style="border-style:dashed">'+
    '<div style="color:var(--ink-4);margin-bottom:10px">'+ic('plus','w-8 h-8')+'</div>'+
    '<b>Gửi một tư liệu bạn đã dùng và thấy hiệu quả</b>'+
    '<p class="sm muted mt" style="max-width:58ch;margin-inline:auto">Một kịch bản bạn tự viết, một cách gỡ nút chưa có trong kho, một biểu mẫu bạn tự làm. '+
    'Hội đồng chuyên môn đọc trong 7 ngày và trả lời có căn cứ — kể cả khi chưa nhận.</p>'+
    '<button class="btn mt2" data-act="upload">'+ic('arrow')+'Gửi tư liệu</button></div>';

  o += U.sec('GÓP Ý CỦA NGƯỜI DẪN DẮT ĐÃ THÀNH TÍNH NĂNG','Nghe người trực tiếp làm nghề là cách nhanh nhất để hệ thống tốt lên');
  o += '<div class="grid g3">' + D.gopY.map(function(g){
    return '<div class="card pad-sm"><b class="sm" style="display:block;margin-bottom:6px">'+h(g.ng)+'</b>'+
      '<p class="sm dim" style="line-height:1.6;font-style:italic">"'+h(g.v)+'"</p>'+
      '<div class="chip on mt">'+h(g.tr)+'</div></div>';
  }).join('') + '</div>';
  return o;
};

/* ═══════════════ CƠ CHẾ TÀI CHÍNH ĐẠI SỨ ═══════════════ */
G.VIEWS['hoa-hong'] = function(){
  var H = G.HOAHONG;
  var o = U.ph({eyebrow:'NHÓM 05 · HỆ SINH THÁI', ic:'share', grad:1, t:'Cơ chế tài chính đại sứ',
    lead:'Bốn cấp, trần 10%, công bố trước khi ký và không đàm phán riêng với ai. Hoa hồng gắn với việc gia đình được giới thiệu đi được bao xa — không gắn với chữ ký hợp đồng.'});

  o += '<div class="grid g4 mb">'+
    U.stat({k:'TRẦN HOA HỒNG', v:H.tran+'%', d:'toàn hệ thống · không ngoại lệ', c:'#185AB4'})+
    U.stat({k:'CẤP ĐẠI SỨ', v:H.cap.length, d:'3% · 5% · 8% · 10%', c:'#5140B4'})+
    U.stat({k:'MỐC CHI ĐẦU', v:'Ngày 30', d:'khi nhà được giới thiệu còn giữ nhịp', c:'#0B7350'})+
    U.stat({k:'THƯỞNG THEO LƯỢT CHỐT', v:'0', d:'thưởng theo chất lượng, không theo số', c:'#BE0E16'})+
  '</div>';

  o += U.sec('BỐN CẤP VÀ TỈ LỆ','Lên cấp bằng việc đã làm — không bằng doanh số');
  o += '<div class="grid g4">' + H.cap.map(function(c){
    return '<div class="card lift" style="border-color:'+c.c+'2e">'+
      '<div class="row" style="gap:8px;margin-bottom:8px">'+
      '<span class="pill" style="background:'+c.c+'22;color:'+c.c+'">CẤP '+c.cap+'</span>'+
      '<b class="mono grow" style="text-align:right;font-size:26px;color:'+c.c+'">'+c.pct+'%</b></div>'+
      '<b class="sm" style="display:block;margin-bottom:8px;color:'+c.c+'">'+h(c.ten)+'</b>'+
      '<div class="tiny up muted mb">ĐIỀU KIỆN</div>'+
      '<p class="tiny muted" style="line-height:1.55;margin-bottom:9px">'+h(c.dk)+'</p>'+
      '<div class="tiny up muted mb">NGOÀI TIỀN CÒN CÓ</div>'+
      '<p class="tiny" style="line-height:1.55;color:var(--ink-2)">'+h(c.them)+'</p></div>';
  }).join('') + '</div>';

  o += U.sec('MỐC CHI TRẢ','Chi theo chặng đường nhà được giới thiệu đi được, không theo hợp đồng ký xong');
  o += U.tbl(['Mốc','Điều kiện','Phần chi'], H.moc.map(function(m){
    return ['<b class="mono">'+h(m.m)+'</b>', '<span class="sm">'+h(m.v)+'</span>',
      '<span class="chip'+(m.chi.indexOf('không')===0?'':' on')+'">'+h(m.chi)+'</span>'];
  }));

  o += U.sec('NĂM NGUYÊN TẮC KHÔNG THƯƠNG LƯỢNG','');
  o += '<div class="card">' + H.nguyenTac.map(function(n,i){
    return '<div class="rule"><span class="n">'+(i+1)+'</span><div class="tx"><b>'+h(n)+'</b></div></div>';
  }).join('') + '</div>';

  o += '<div class="card mt2" style="border-color:rgba(248,113,113,.3);background:rgba(248,113,113,.05)">'+
    '<div class="row mb"><span style="color:var(--bad)">'+ic('shield','w-4 h-4')+'</span>'+
    '<b>Vì sao trần 10% và vì sao không thưởng theo lượt chốt</b></div>'+
    '<p class="sm muted" style="line-height:1.7">Tỉ lệ càng cao thì áp lực chốt càng lớn, và áp lực chốt kéo ngôn từ của cả hệ sinh thái về phía bán hàng. '+
    'Khi đó thứ quý nhất của mô hình — một nơi gia đình dám kể thật — sẽ mất trước tiên. Mười phần trăm là mức đủ để ghi nhận công sức thật '+
    'mà chưa đủ để biến một người đồng hành thành một người bán hàng.</p></div>';
  return o;
};

/* ═══════════════ NHẬN DIỆN THƯƠNG HIỆU ═══════════════ */
G.VIEWS['thuong-hieu'] = function(){
  /* Kho này về gói NGHỀ từ 9.8. Vai không có gói ấy vẫn có thể gọi thẳng
     hàm dựng màn — cột trái đã ẩn mục, nhưng ẩn không phải là canh cửa. */
  if (!G.BRAND) return U.empty('Chưa mở được bộ nhận diện',
    'Bộ nhận diện thương hiệu nằm trong gói nghề. Đăng nhập bằng tài khoản có phạm vi ấy để mở.');

  var B = G.BRAND;
  var o = U.ph({eyebrow:'NHÓM 03 · KHO BÁU VẬT', ic:'star', grad:1, t:'Nhận diện thương hiệu GITA 365',
    lead:'Một bảng màu, hai bộ chữ, một giọng nói. Ai cũng dùng được mà không làm hỏng — đó là chuẩn của một bộ nhận diện tốt.'});

  o += '<div class="card glow mb"><div class="row wrap" style="gap:24px;align-items:center">'+
    '<span style="width:96px;height:96px;border-radius:28px;display:grid;place-items:center;font-weight:900;font-size:21px;'+
    'background:linear-gradient(135deg,var(--gita),var(--gita-do));color:#1A1006;flex:none;box-shadow:0 18px 46px -14px var(--gita-day)">GITA</span>'+
    '<div class="grow" style="min-width:250px">'+
    '<h2 style="font-size:26px;font-weight:800">'+h(B.ten)+'</h2>'+
    '<p class="up" style="color:var(--ink-4);margin:2px 0 10px">'+h(B.dinhVi)+'</p>'+
    '<p class="serif" style="font-size:18px;font-style:italic;color:var(--gold-2)">"'+h(B.cauLoi)+'"</p>'+
    '<p class="sm dim mt">'+h(B.giaiNghia)+'</p></div></div></div>';

  o += U.sec('BẢNG MÀU','Màu năm tầng giữ nguyên mã của hệ thống v6.9 — không đổi khi in, khi chiếu hay khi làm ảnh');
  o += '<div class="grid g3">' + B.mau.map(function(m){
    return '<div class="card pad-sm"><div class="row" style="gap:11px">'+
      '<span style="width:46px;height:46px;border-radius:14px;background:'+m.hex+';flex:none;border:1px solid var(--phu-5)"></span>'+
      '<div><b class="sm" style="display:block">'+h(m.k)+'</b>'+
      '<span class="mono tiny" style="color:'+m.hex+'">'+h(m.hex)+'</span></div></div>'+
      '<p class="tiny muted mt" style="line-height:1.5">'+h(m.d)+'</p></div>';
  }).join('') + '</div>';

  o += U.sec('BỘ CHỮ','');
  o += '<div class="grid g2">' + B.chu.map(function(c){
    var serif = c.k.indexOf('Playfair')===0;
    return '<div class="card"><b style="font-size:16px;display:block;margin-bottom:6px">'+h(c.k)+'</b>'+
      '<p class="sm muted" style="line-height:1.6;margin-bottom:12px">'+h(c.d)+'</p>'+
      '<p class="'+(serif?'serif':'')+'" style="font-size:'+(serif?'19px;font-style:italic':'17px;font-weight:700')+';color:var(--gold-2)">'+h(c.vd)+'</p></div>';
  }).join('') + '</div>';

  o += U.sec('GIỌNG NÓI','Cùng một ý, hai kết quả khác hẳn nhau');
  o += '<div class="grid g2">' + B.giong.map(function(g){
    return '<div class="card pad-sm">'+
      '<div style="display:flex;gap:9px;margin-bottom:8px"><span style="color:var(--ok);flex:none;margin-top:2px">'+ic('check','w-3 h-3')+'</span>'+
      '<span class="sm">'+h(g.nen)+'</span></div>'+
      '<div style="display:flex;gap:9px"><span style="color:var(--bad);flex:none;margin-top:2px">'+ic('x','w-3 h-3')+'</span>'+
      '<span class="sm" style="color:var(--ink-3)">'+h(g.khong)+'</span></div></div>';
  }).join('') + '</div>';

  o += U.sec('DÙNG Ở ĐÂU','');
  o += '<div class="grid g4">' + B.dungO.map(function(d){
    return '<div class="card pad-sm"><b class="sm" style="display:block;margin-bottom:6px">'+h(d.t)+'</b>'+
      '<p class="tiny muted" style="line-height:1.55">'+h(d.d)+'</p></div>';
  }).join('') + '</div>';

  o += U.sec('SÁU ĐIỀU CẤM KỴ','Vi phạm một điều là gỡ tài liệu, không phải nhắc nhở');
  o += '<div class="card">' + B.camKy.map(function(c,i){
    return '<div class="rule"><span class="n" style="background:rgba(248,113,113,.16);color:var(--bad)">✕</span>'+
      '<div class="tx"><b>'+h(c)+'</b></div></div>';
  }).join('') + '</div>';
  return o;
};

/* ═══════════════ RÀ SOÁT HỆ THỐNG ═══════════════ */
G.VIEWS['ra-soat'] = function(){
  if(!G.can('pro_report')) return U.lockCard();
  var R = G.RASOAT;
  var all = []; R.nhom.forEach(function(n){ n.muc.forEach(function(m){ all.push(m); }); });
  var vaRoi = all.filter(function(m){ return m.trang.indexOf('ĐÃ VÁ')===0; }).length;
  var conHo = all.filter(function(m){ return m.trang.indexOf('CÒN HỞ')===0; }).length;
  var canMC = all.filter(function(m){ return m.trang.indexOf('CẦN MÁY CHỦ')===0; }).length;
  var mau = {'ĐÃ VÁ':'#0B7350','CÒN HỞ':'#BE0E16','CẦN MÁY CHỦ':'#BE0E16','KHỚP 100%':'#0B7350',
    'ĐỦ':'#0B7350','ĐẠT':'#0B7350','ĐÃ CHỐT':'#0B7350','ĐANG GIỮ ĐÚNG':'#0B7350',
    'ĐANG CHẶN ĐÚNG':'#0B7350','ĐÃ KIỂM · AN TOÀN':'#0B7350','CHỜ CHỦ HỆ THỐNG':'#5140B4',
    'ĐÃ MỞ MỘT PHẦN':'#0B6675'};

  var o = U.ph({eyebrow:'NHÓM 05 · VẬN HÀNH', ic:'shield', grad:1, t:'Biên bản rà soát hệ thống',
    lead:R.tomTat});

  o += '<div class="grid g4 mb">'+
    U.stat({k:'ĐIỂM ĐÃ RÀ', v:all.length, d:'trên sáu nhóm', c:'#5140B4'})+
    U.stat({k:'ĐÃ VÁ TRONG BẢN NÀY', v:vaRoi, d:'lỗi thật, đã kiểm lại', c:'#0B7350'})+
    U.stat({k:'CÒN HỞ', v:conHo, d:'cần quyết định của chủ hệ thống', c:'#BE0E16'})+
    U.stat({k:'CẦN MÁY CHỦ', v:canMC, d:'không vá được bằng mã trình duyệt', c:'#BE0E16'})+
  '</div>';

  o += '<div class="card mb" style="border-color:rgba(248,113,113,.35);background:rgba(248,113,113,.05)">'+
    '<div class="row mb"><span style="color:var(--bad)">'+ic('shield','w-4 h-4')+'</span>'+
    '<b>Ba điểm chặn phát hành ra ngoài</b></div>'+
    '<div class="stack">'+
    ['Xác thực đang chạy phía trình duyệt — phải nối 02_Security.gs trước khi mở cho khách thật.',
     'Chưa hiện tên pháp nhân, mã số thuế, người chịu trách nhiệm nội dung.',
     'Chưa có mốc chuyển tuyến chuyên khoa tâm lý — cần hội đồng chuyên môn chốt.'
    ].map(function(x,i){ return '<div style="display:flex;gap:9px"><span class="mono tiny" style="color:var(--bad);flex:none;margin-top:3px">0'+(i+1)+'</span>'+
      '<span class="sm">'+h(x)+'</span></div>'; }).join('') + '</div></div>';

  o += R.nhom.map(function(n){
    return '<div class="mt2"><div class="up mb" style="color:'+n.c+'">'+h(n.n)+' <span class="muted">· '+n.muc.length+' điểm</span></div>'+
      n.muc.map(function(m){
        var c = mau[m.trang] || '#665E88';
        return '<div class="card mb" style="border-color:'+c+'26">'+
          '<div class="row wrap" style="gap:9px;margin-bottom:8px">'+
          '<b class="grow" style="font-size:14.5px;min-width:200px">'+h(m.t)+'</b>'+
          (m.mucdo && m.mucdo!=='—' ? U.chip(m.mucdo, m.mucdo==='Nghiêm trọng'?'#BE0E16':(m.mucdo==='Trung bình'?'#BE0E16':'#665E88')) : '')+
          '<span class="chip" style="color:'+c+';border-color:'+c+'55;background:'+c+'14">'+h(m.trang)+'</span></div>'+
          '<p class="sm muted" style="line-height:1.6;margin-bottom:9px">'+h(m.mo)+'</p>'+
          '<div style="padding:11px 13px;border-radius:12px;background:'+c+'0d;border-left:2px solid '+c+'">'+
          '<span class="tiny up" style="color:'+c+'">XỬ LÝ</span>'+
          '<p class="sm mt" style="line-height:1.6">'+h(m.sua)+'</p></div></div>';
      }).join('') + '</div>';
  }).join('');

  o += '<p class="tiny muted center mt2">Biên bản lập ngày '+h(R.ngay)+' cho bản '+h(R.phienBan)+
    ' · chạy lại bộ kiểm tự động mỗi lần phát hành.</p>';
  return o;
};
})();
