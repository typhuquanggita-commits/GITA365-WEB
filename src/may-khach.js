/* ═══════════════════════════════════════════════════════════════
   GITA 365 · MÁY KHÁCH — CHỈ ĐƯỢC DÙNG, KHÔNG ĐƯỢC LƯU

   Chủ hệ thống yêu cầu:
     "Toàn bộ các dữ liệu được cài trên máy tính chủ của tôi; các máy
      tính khác chỉ được dùng, không được cấp phép lưu hoặc tải dữ
      liệu về."

   Máy chủ (desktop/may-chu.js) đã giữ phần của nó: kho gốc và bộ khoá
   không rời máy chủ, mỗi phiên một khoá dùng một lần, mọi đường trả về
   đều no-store. Tệp này là phần của máy khách.

   ── NĂM VIỆC TỆP NÀY LÀM ──
   1. Khoá sao chép cho MỌI vai, kể cả Super Admin. Trên máy của chủ hệ
      thống thì Super Admin chép được — đó là máy của anh ấy. Trên máy
      người khác thì không, vì cái bị chép ra sẽ nằm lại ở máy người khác.
   2. Cắt mọi đường tải tệp: URL.createObjectURL, thẻ <a download>, và
      cửa sổ in. Không phải để làm khó, mà vì một tệp tải về là một bản
      sao nằm ngoài tầm với của Học viện, vĩnh viễn.
   3. Không để lại gì trên đĩa máy khách. localStorage bị thay bằng một
      bản chạy trong bộ nhớ: ứng dụng vẫn nhớ đủ trong lúc dùng, đóng
      tab là hết sạch.
   4. Gỡ service worker nếu máy ấy từng cài bản web GITA 365. Không gỡ
      thì bộ đệm cũ vẫn phục vụ nội dung sau khi bị cắt quyền.
   5. Hiện một dải nhắc ở đầu màn: người ngồi đó biết mình đang dùng nhờ
      máy của Học viện, và biết máy này không lưu gì.

   ── ĐIỀU KHÔNG LÀM ĐƯỢC ──
   Nội dung đang hiện trên màn hình thì nằm trong bộ nhớ trình duyệt của
   máy khách — mọi ứng dụng đều thế, không có cách nào khác. Người ngồi
   tại máy ấy mở công cụ nhà phát triển vẫn đọc được phần đang mở, và
   chụp màn hình thì không phần mềm nào cản được.

   Cái chặn được là mang cả kho đi, giữ lại dùng offline, và dùng tiếp
   sau khi bị cắt quyền. Cái không chặn được, ghi thẳng ở đây để không
   ai tưởng nhầm là đã kín.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;

(function(){
if(!window.GITA_MAY_KHACH) return;

G.LA_MAY_KHACH = true;

/* ── Địa chỉ cấp phép trỏ về chính máy chủ đang phục vụ trang này ──
   Không đi qua G.datMayChu vì hàm ấy chỉ nhận đường dẫn Apps Script. */
G.API_CAP_PHEP = '/cap-phep';

/* ── 1. Khoá sao chép cho mọi vai ──
   Đè lên G.BI_KHOA_CHEP của src/khoa-sao-chep.js. Giữ nguyên hàm cũ để
   nếu sau này bản máy chủ đổi luật thì vẫn còn đường gọi lại. */
G.BI_KHOA_CHEP_MAYCHU = G.BI_KHOA_CHEP;
G.BI_KHOA_CHEP = function(){ return true; };

/* ── 2. Cắt mọi đường tải tệp ── */
function chan(viec, chiTiet){
  if(G.secLog) G.secLog(viec, chiTiet, 'Đã chặn · máy khách');
  if(G.U && G.U.toast) G.U.toast(
    'Máy này đang dùng nhờ máy chủ của Học viện nên không tải hay in được. '+
    'Cần bản mang về thì nhắn Tư vấn hoặc Coach của nhà mình.', 'err');
}

if(window.URL && URL.createObjectURL){
  /* KHÔNG giữ lại hàm gốc ở đâu cả.
     Bản đầu tiên của tệp này có một dòng G.taoTepGoc = hàm gốc, "để phòng
     khi cần". Đó chính là một đường tải tệp vẫn mở, chỉ đổi tên — ai gõ
     được G.taoTepGoc trong bảng điều khiển là tải được như thường. Chặn
     mà vẫn để sẵn đường vòng thì không phải là chặn. */
  URL.createObjectURL = function(o){
    chan('Chặn tạo tệp tải về', 'Máy khách xin tạo một tệp để tải xuống');
    /* Trả một đường dẫn rỗng thay vì ném lỗi: ném lỗi làm hỏng cả màn,
       người dùng chỉ thấy trang trắng và không hiểu vì sao. */
    return 'about:blank';
  };
}

document.addEventListener('click', function(e){
  var a = e.target && e.target.closest && e.target.closest('a[download]');
  if(a){
    e.preventDefault(); e.stopPropagation();
    chan('Chặn tải tệp', 'Thẻ tải về: ' + (a.getAttribute('download') || a.href || ''));
  }
}, true);

/* In: máy khách không in, kể cả vai có quyền xuat_pdf trên máy chủ.
   Bản in là một bản sao nằm lại ở máy khác — đúng thứ chính sách cấm. */
G.coTheIn_MAYCHU = G.coTheIn;
G.coTheIn = function(){ return false; };
window.addEventListener('beforeprint', function(){ chan('Chặn in', 'Lệnh in trên máy khách'); });
if(window.print) window.print = function(){ chan('Chặn in', 'Lệnh in gọi thẳng từ mã trang'); };

/* ── 3. Không để lại gì trên đĩa ──
   Thay localStorage bằng một bản chạy trong bộ nhớ. Ứng dụng gọi y như
   cũ nên không màn nào phải sửa; chỉ khác là đóng tab thì mất hết. */
(function thayKhoLuu(){
  var trong = {};
  var gia = {
    getItem: function(k){ return Object.prototype.hasOwnProperty.call(trong, k) ? trong[k] : null; },
    setItem: function(k, v){ trong[k] = String(v); },
    removeItem: function(k){ delete trong[k]; },
    clear: function(){ trong = {}; },
    key: function(i){ return Object.keys(trong)[i] || null; }
  };
  Object.defineProperty(gia, 'length', { get: function(){ return Object.keys(trong).length; } });
  try{
    Object.defineProperty(window, 'localStorage', { get: function(){ return gia; }, configurable: true });
    G.KHO_LUU_TRONG_BO_NHO = true;
  }catch(e){
    /* Trình duyệt nào không cho đè thì ít nhất dọn sạch những gì ứng dụng
       đã ghi, và dọn lại lúc rời trang. */
    G.KHO_LUU_TRONG_BO_NHO = false;
    try{ localStorage.clear(); }catch(e2){}
    window.addEventListener('pagehide', function(){ try{ localStorage.clear(); }catch(e2){} });
  }
})();

/* ── 4. Gỡ bộ đệm cũ, nếu máy này từng cài bản web ── */
if(navigator.serviceWorker && navigator.serviceWorker.getRegistrations){
  navigator.serviceWorker.getRegistrations()
    .then(function(ds){ ds.forEach(function(r){ r.unregister(); }); })
    .catch(function(){});
}
if(window.caches && caches.keys){
  caches.keys().then(function(ds){ ds.forEach(function(t){ caches.delete(t); }); }).catch(function(){});
}

/* ── 5. Dải nhắc ở đầu màn ── */
function dungDai(){
  if(document.getElementById('dai-may-khach')) return;
  var d = document.createElement('div');
  d.id = 'dai-may-khach';
  d.setAttribute('role', 'status');
  d.style.cssText =
    'position:fixed;left:0;right:0;top:0;z-index:9998;padding:6px 14px;'+
    'font:600 12px/1.5 system-ui,-apple-system,"Segoe UI",sans-serif;letter-spacing:.02em;'+
    'text-align:center;color:#0B1120;background:#B45309;background:linear-gradient(90deg,#B45309,#D97706);'+
    'box-shadow:0 1px 0 rgba(0,0,0,.35);color:#FFF7ED;';
  d.textContent = 'Đang dùng nhờ máy chủ của Học viện GITA · máy này không lưu, không tải, không in được';
  document.body.appendChild(d);
  /* Đẩy nội dung xuống để dải không che mất hàng đầu tiên của trang */
  document.documentElement.style.setProperty('scroll-padding-top', '34px');
  if(document.body) document.body.style.paddingTop = '26px';
}
if(document.readyState === 'loading')
  document.addEventListener('DOMContentLoaded', dungDai);
else dungDai();

/* ── Nói thật khi bị cắt quyền ──
   Máy chủ cắt là gói trong bộ nhớ nó bị xoá, nên lần xin gói sau trả 401.
   Không bắt chỗ này thì người dùng chỉ thấy màn trắng và tưởng máy hỏng. */
G.MAY_KHACH_BI_CAT = function(ly){
  if(G.U && G.U.toast) G.U.toast(ly || 'Máy chủ đã cắt quyền dùng của máy này.', 'err');
};

})();
