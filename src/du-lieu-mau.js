/* ═══════════════════════════════════════════════════════════════
   GITA 365 — DẢI NHẮC DỮ LIỆU MẪU

   Bảng điều hành hiện "Doanh thu quý 6,84 tỷ · +18% so với quý trước",
   "78% khách từ giới thiệu", "Giữ chân 12 tháng 89,3%". Không con số
   nào được đo từ hoạt động thật — chúng nằm ở G.HEALTH và G.HAILONG, là
   dữ liệu dựng để xem giao diện.

   Vấn đề không phải là có dữ liệu mẫu; hệ thống nào cũng cần. Vấn đề
   là không có dấu nào phân biệt. Người mở màn Tài chính không có cách
   nào biết đó là số dựng — và nếu con số ấy đi vào một bản báo cáo
   hay một buổi gọi vốn thì cái giá của một dòng chữ thiếu là rất đắt.

   Tệp này bọc các màn khai trong G.DL_MAU_MAN và gắn dải nhắc lên đầu.
   Không xoá số nào: xoá đi thì giao diện rỗng và không ai dựng hay
   kiểm thử được nữa.

   Gỡ tên một kho khỏi G.DL_MAU là dải nhắc tự biến mất ở mọi màn đọc
   kho ấy — không phải đi sửa từng màn.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;

(function(){
var U = G.U, h = U.h, ic = U.ic;

/* Kho mẫu nào đang còn — trả tên kho, không trả true/false, để dải
   nhắc nói được CHÍNH XÁC màn này đang đọc số mẫu từ đâu. */
G.dlMauCon = function(){
  return (G.DL_MAU || []).filter(function(x){
    var v = G[x.kho];
    return v !== undefined && v !== null &&
      (Array.isArray(v) ? v.length > 0 : Object.keys(v).length > 0);
  });
};

G.dlMauDai = function(man){
  var ds = G.dlMauCon();
  if(!ds.length) return '';
  return '<div class="card mb" style="border-color:var(--alert);background:rgba(251,146,60,.06)">' +
    '<div class="row" style="gap:10px;align-items:flex-start">' +
      '<span style="color:var(--alert);flex:none">' + ic('bell','w-4 h-4') + '</span>' +
      '<div style="flex:1">' +
        '<b class="sm">Số trên màn này là DỮ LIỆU MẪU, chưa phải số đo được</b>' +
        '<p class="sm muted mt" style="line-height:1.7">Chúng dựng để xem giao diện và kiểm thử. ' +
        'Đừng đưa vào báo cáo, hồ sơ gọi vốn, bài đăng hay bất kỳ chỗ nào người ngoài đọc — ' +
        'đó là chỗ cái giá của một dòng chữ thiếu trở nên rất đắt.</p>' +
        '<p class="tiny mt2" style="color:var(--ink-4)">Kho mẫu đang dùng: ' +
        h(ds.map(function(x){ return x.kho; }).join(' · ')) + '</p>' +
        '<button class="btn ghost sm mt2" data-dlmau="1">' + ic('search','w-3 h-3') +
        ' Kho nào là mẫu, và khi nào thành thật</button>' +
      '</div></div></div>';
};

/* Bọc màn: dải nhắc lên ĐẦU, ngay dưới tiêu đề, không nhét xuống cuối.
   Người đọc số phải gặp dải nhắc trước khi đọc số. */

/* ─── BỌC LẠI KHI MÃ VỀ MUỘN ───
   Từ bản 9.23, mã dựng màn của nghề nằm ở gói riêng và về SAU tệp này.
   Lớp bọc chạy một lần lúc tải trang thì màn nghề không bao giờ được
   bọc — và hụt kiểu ấy không ném lỗi nào, chỉ là màn ấy thiếu một dải
   hoặc một thẻ mà không ai để ý.

   Nên noi() nhớ lại việc nó CHƯA làm được, và người nạp mã nghề gọi
   lại. Nhớ việc chưa làm rẻ hơn nhiều so với bắt mọi lớp bọc phải biết
   thứ tự nạp của cả ứng dụng. */
var CHO_BOC = [];
function noi(ten){
  var cu = G.VIEWS && G.VIEWS[ten];
  if(typeof cu !== 'function'){ if(CHO_BOC.indexOf(ten) < 0) CHO_BOC.push(ten); return false; }
  var j = CHO_BOC.indexOf(ten); if(j >= 0) CHO_BOC.splice(j, 1);
  G.VIEWS[ten] = function(){
    var o = cu.apply(this, arguments);
    if(typeof o !== 'string' || o.length < 400) return o;   /* màn khoá thì để nguyên */
    var dai = '';
    try { dai = G.dlMauDai(ten); } catch(e) { dai = ''; }
    if(!dai) return o;
    /* Chèn ngay sau khối tiêu đề đầu tiên */
    var i = o.indexOf('</div>', o.indexOf('class="ph'));
    return i > 0 ? o.slice(0, i + 6) + dai + o.slice(i + 6) : dai + o;
  };
  return true;
}

/* ── Danh sách màn phải nằm Ở ĐÂY, không nằm trong kho ──
   Bản đầu đọc G.DL_MAU_MAN từ kho. Nhưng kho chỉ nạp SAU khi đăng
   nhập, còn tệp này chạy lúc nạp mã — nên lúc bọc thì danh sách còn
   rỗng và không màn nào được bọc. Đo ra: 0/16.

   Đây là lỗi cùng loại đã gặp ở lớp nối: dữ liệu trong kho không có
   mặt lúc mã khởi tạo. Cái gì cần biết lúc khởi tạo thì phải nằm
   trong src.

   Chia đúng chỗ: DANH SÁCH MÀN là hiểu biết của giao diện (màn nào
   đọc số mẫu) — để ở đây. DANH SÁCH KHO là nội dung (kho nào còn là
   mẫu, khi nào thành thật) — vẫn ở trong kho, và gỡ một dòng ở đó là
   dải nhắc tự đổi. */
G.DL_MAU_MAN = ['dieu-hanh','tai-chinh-qt','tuvan-deck','coach-deck','tang-truong',
                've-tinh','doi-ngu','bang-so','hai-long','nhat-ky-ht','su-kien',
                'wow','dau-mat','chuan-nhat','xu-ly-ca','ra-soat-kh'];

G.DL_MAU_DA_NOI = [];
G.DL_MAU_MAN.forEach(function(m){ if(noi(m)) G.DL_MAU_DA_NOI.push(m); });

/* Cửa sổ giải thích */
document.addEventListener('click', function(e){
  var a = e.target && e.target.closest && e.target.closest('[data-dlmau]');
  if(!a) return;
  var ds = G.DL_MAU || [], con = G.dlMauCon().map(function(x){ return x.kho; });
  U.modal('<div class="tiny up" style="color:var(--alert)">DỮ LIỆU MẪU TRONG HỆ THỐNG</div>' +
    '<h2 style="font-size:21px;font-weight:800;margin:6px 0 12px">Kho nào là mẫu, và khi nào thành thật</h2>' +
    '<p class="sm mb" style="line-height:1.75">Không kho nào bị xoá. Xoá đi thì giao diện rỗng và ' +
    'không ai dựng hay kiểm thử được nữa. Cái cần là người xem biết mình đang nhìn gì.</p>' +
    ds.map(function(x){
      var dang = con.indexOf(x.kho) >= 0;
      return '<div class="card pad-sm mb" style="border-color:' + (dang ? 'var(--alert)' : 'var(--ok)') + '">' +
        '<div class="row" style="gap:8px;align-items:baseline;flex-wrap:wrap">' +
        '<b class="mono sm">' + h(x.kho) + '</b>' +
        '<span class="chip" style="color:' + (dang ? 'var(--alert)' : 'var(--ok)') + '">' +
        (dang ? 'còn là mẫu' : 'đã có số thật') + '</span></div>' +
        '<p class="sm mt" style="line-height:1.7">' + h(x.la) + '</p>' +
        '<p class="sm muted mt" style="line-height:1.7"><b>Thành thật khi:</b> ' + h(x.thatKhi) + '</p></div>';
    }).join('') +
    U.sec('BỐN LUẬT', 'Để dữ liệu mẫu không bao giờ đi ra ngoài dưới dạng sự thật') +
    '<div class="card">' + (G.DL_MAU_LUAT || []).map(function(x, i){
      return '<div style="' + (i ? 'border-top:1px solid var(--line);padding-top:13px;margin-top:13px' : '') + '">' +
        '<b class="sm">' + h(x.t) + '</b>' +
        '<p class="sm muted mt" style="line-height:1.7">' + h(x.y) + '</p></div>';
    }).join('') + '</div>');
}, false);

/* Đếm thật cho bài kiểm */
G.dlMauSoat = function(){
  return { khai: (G.DL_MAU || []).length, con: G.dlMauCon().length,
    man: (G.DL_MAU_MAN || []).length, daNoi: (G.DL_MAU_DA_NOI || []).length,
    luat: (G.DL_MAU_LUAT || []).length };
};

})();

/* Bọc lại phần màn về muộn — xem lý do ở chỗ khai CHO_BOC. */
G.dlMauNoiLai = function(){
  var con = CHO_BOC.slice(), them = 0;
  for(var i = 0; i < con.length; i++) if(noi(con[i])){
    them++; if((G.DL_MAU_DA_NOI||[]).indexOf(con[i]) < 0) (G.DL_MAU_DA_NOI = G.DL_MAU_DA_NOI || []).push(con[i]);
  }
  return them;
};
(G.BOC_LAI = G.BOC_LAI || []).push('dlMauNoiLai');
