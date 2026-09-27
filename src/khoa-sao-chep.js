/* ═══════════════════════════════════════════════════════════════
   GITA 365 · v8.4 — KHOÁ SAO CHÉP CHO TÀI KHOẢN KHÁCH HÀNG

   Luật của Học viện: phụ huynh, học viên và cộng tác viên KHÔNG được tải
   bất kỳ dữ liệu nào ra khỏi ứng dụng, và không được sao chép nội dung
   trên giao diện — bằng chuột, bằng phím tắt, hay bằng trợ lý đọc màn hình.

   ── NÓI THẲNG LỚP NÀY LÀM ĐƯỢC GÌ VÀ KHÔNG LÀM ĐƯỢC GÌ ──

   LÀM ĐƯỢC, và làm chặt:
     · Bôi đen văn bản — tắt hẳn, trừ ô để gõ
     · Ctrl+C · Ctrl+X · Ctrl+A · chuột phải · kéo thả
     · Ctrl+S lưu trang · Ctrl+P in · Ctrl+U xem mã nguồn
     · Trợ lý đọc màn hình và lệnh sao chép bằng giọng nói — cả hai đều
       phải bôi đen được văn bản trước, mà bôi đen đã bị tắt
     · Mọi lần thử đều vào nhật ký kèm tên tài khoản, màn hình và giờ

   KHÔNG LÀM ĐƯỢC, và không giả vờ làm được:
     · Chụp màn hình bằng điện thoại — anh Quang đã nói rõ là chịu phần này
     · Người biết mở công cụ lập trình của trình duyệt vẫn đọc được dữ liệu
       đã giải mã trong bộ nhớ. Không hệ thống chạy trong trình duyệt nào
       chặn được điều đó.

   Phần chặn thật nằm ở chỗ khác và đã có: kho mã hoá AES-256-GCM, khoá do
   máy chủ cấp theo vai, đóng dấu chìm mang tên người xem trên mọi màn, và
   nhật ký không xoá được. Lớp này là hàng rào thứ nhất, không phải hàng
   rào duy nhất.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;

(function(){

/* Ai bị khoá: phụ huynh, học viên, cộng tác viên — và mọi vai bậc ≥ 13. */
G.BI_KHOA_CHEP = function(){
  var r = G.S && G.S.roleObj;
  return !!(r && r.lv >= 13);
};

/* Ô nào vẫn phải gõ và chọn được — nếu không thì khách không đăng ký,
   không viết nhật ký, không hỏi trợ lý được. */
function laOGo(el){
  if(!el || !el.closest) return false;
  return !!el.closest('input, textarea, select, [contenteditable="true"], .cho-chep');
}

function ghi(viec, chiTiet){
  if(G.secLog) G.secLog(viec, chiTiet, 'Đã chặn');
}

var nhac = 0;
function baoNhe(loi){
  var nay = Date.now();
  if(nay - nhac < 4000) return;      /* không dội liên tiếp vào mặt người dùng */
  nhac = nay;
  if(G.U && G.U.toast) G.U.toast(loi, 'err');
}

var LOI = 'Nội dung trong GITA 365 là tài sản của Học viện, chỉ đọc trực tiếp trên ứng dụng. ' +
          'Cần bản mang về thì nhắn Tư vấn hoặc Coach của nhà mình.';

/* ─── 1 · Tắt bôi đen ───
   Đây là lớp gốc: trợ lý đọc màn hình, lệnh sao chép bằng giọng nói và mọi
   thao tác chép bằng chuột đều phải bôi đen được văn bản trước. */
function datLopThan(){
  var b = document.body;
  if(!b) return;
  b.classList.toggle('khoa-chep', G.BI_KHOA_CHEP());
}
G.datKhoaChep = datLopThan;

document.addEventListener('selectstart', function(e){
  if(!G.BI_KHOA_CHEP() || laOGo(e.target)) return;
  e.preventDefault();
});

/* ─── 2 · Chặn sao chép, cắt, kéo thả ─── */
['copy','cut','beforecopy','beforecut'].forEach(function(ten){
  document.addEventListener(ten, function(e){
    if(!G.BI_KHOA_CHEP() || laOGo(e.target)) return;
    e.preventDefault();
    try{ if(e.clipboardData) e.clipboardData.setData('text/plain', ''); }catch(err){}
    ghi('Chặn sao chép', 'Thao tác ' + ten + ' trên màn ' + ((G.S && G.S.view) || '—'));
    baoNhe(LOI);
  }, true);
});

document.addEventListener('dragstart', function(e){
  if(!G.BI_KHOA_CHEP() || laOGo(e.target)) return;
  e.preventDefault();
  ghi('Chặn kéo thả', 'Kéo nội dung ra khỏi ứng dụng · màn ' + ((G.S && G.S.view) || '—'));
}, true);

/* ─── 3 · Chặn chuột phải ─── */
document.addEventListener('contextmenu', function(e){
  if(!G.BI_KHOA_CHEP() || laOGo(e.target)) return;
  e.preventDefault();
  ghi('Chặn chuột phải', 'Mở trình đơn ngữ cảnh · màn ' + ((G.S && G.S.view) || '—'));
  baoNhe(LOI);
}, true);

/* ─── 4 · Chặn phím tắt ───
   Đặt ở giai đoạn bắt (capture) để chạy trước mọi bộ nghe khác. */
var PHIM_CHAN = {
  c:'sao chép', x:'cắt', a:'chọn tất cả', s:'lưu trang', p:'in trang', u:'xem mã nguồn'
};
document.addEventListener('keydown', function(e){
  if(!G.BI_KHOA_CHEP()) return;
  var k = (e.key || '').toLowerCase();

  /* Công cụ lập trình — chặn được phím tắt, không chặn được menu trình duyệt.
     Ghi lại để quản trị nhìn thấy ý định, đó là phần làm được. */
  if(k === 'f12' || ((e.ctrlKey || e.metaKey) && e.shiftKey && ['i','j','c'].indexOf(k) >= 0)){
    e.preventDefault();
    ghi('Chặn mở công cụ lập trình', 'Phím ' + (k === 'f12' ? 'F12' : 'Ctrl+Shift+' + k.toUpperCase()));
    baoNhe('Công cụ lập trình bị khoá với tài khoản này. Lần mở đã được ghi lại.');
    return;
  }

  if(!(e.ctrlKey || e.metaKey)) return;
  if(!PHIM_CHAN[k]) return;
  if(laOGo(e.target) && (k === 'c' || k === 'x' || k === 'a')) return;   /* trong ô gõ thì cho */

  e.preventDefault();
  ghi('Chặn phím tắt', PHIM_CHAN[k] + ' (Ctrl+' + k.toUpperCase() + ') · màn ' + ((G.S && G.S.view) || '—'));
  baoNhe(k === 's' || k === 'p'
    ? 'Tài khoản này không lưu và không in được. Hồ sơ của nhà mình đọc trực tiếp trên ứng dụng.'
    : LOI);
}, true);

/* ─── 5 · Chặn trợ lý đọc màn hình đọc to nội dung ───
   Bôi đen đã tắt nên phần lớn đường đọc to đã đứt. Chặn thêm đường trang
   tự gọi bộ đọc của trình duyệt, để không ai dùng chính ứng dụng làm công
   cụ đọc kho ra thành tiếng rồi ghi âm lại. */
(function chanDocTo(){
  if(!window.speechSynthesis || !window.speechSynthesis.speak) return;
  var goc = window.speechSynthesis.speak.bind(window.speechSynthesis);
  try{
    window.speechSynthesis.speak = function(loi){
      if(G.BI_KHOA_CHEP()){
        ghi('Chặn đọc to', 'Yêu cầu đọc nội dung thành tiếng · màn ' + ((G.S && G.S.view) || '—'));
        return;
      }
      return goc(loi);
    };
  }catch(e){}
})();

/* ─── 5b · Chặn in ở cả ba đường ───
   Phím tắt Ctrl+P đã chặn ở trên. Nhưng trình đơn của trình duyệt và lệnh
   in của hệ điều hành không đi qua bàn phím. Hai đường ấy vẫn dựng bản in,
   nên bắt ở đây: assets/style.css ẩn toàn bộ nội dung trong @media print,
   còn chỗ này ghi lại ai vừa thử in. */
window.addEventListener('beforeprint', function(){
  if(!G.BI_KHOA_CHEP()) return;
  ghi('Chặn in', 'Bản in bị chặn ở tầng bản in · màn ' + ((G.S && G.S.view) || '—'));
  baoNhe('Tài khoản này không in được. Trang in ra chỉ có một dòng báo, không có nội dung.');
});

/* ─── 6 · Đóng dấu chìm trên MỌI màn của khách hàng ───
   Trước đây dấu chìm chỉ hiện ở các màn chuyên môn — mà khách hàng thì gần
   như không vào màn nào trong số đó. Chụp màn hình là phần không chặn được,
   nên ít nhất tấm ảnh chụp ra phải mang tên người chụp. */
var isCanhGoc = G.isCanh;
G.isCanh = function(v){
  if(G.BI_KHOA_CHEP()) return true;
  return isCanhGoc ? isCanhGoc(v) : false;
};

/* ─── 7 · Không để lọt thuộc tính tải xuống ───
   Quét sau mỗi lần dựng màn: bất kỳ liên kết nào mang download hoặc trỏ
   tới blob:/data: đều bị gỡ với tài khoản khách hàng. */
G.quetTaiXuong = function(){
  if(!G.BI_KHOA_CHEP()) return 0;
  var n = 0;
  document.querySelectorAll('a[download], a[href^="blob:"], a[href^="data:"]').forEach(function(a){
    a.removeAttribute('download');
    a.removeAttribute('href');
    a.setAttribute('aria-disabled', 'true');
    a.style.pointerEvents = 'none';
    n++;
  });
  if(n) ghi('Gỡ đường tải xuống', n + ' liên kết tải xuống bị gỡ · màn ' + ((G.S && G.S.view) || '—'));
  return n;
};

/* Chạy sau mỗi lần dựng màn hình */
var veGoc = null;
G.batKhoaChep = function(){
  datLopThan();
  G.quetTaiXuong();
};

})();
