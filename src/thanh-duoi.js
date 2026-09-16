/* ═══════════════════════════════════════════════════════════════
   GITA 365 — THANH ĐIỀU HƯỚNG DƯỚI ĐÁY, CHO ĐIỆN THOẠI

   ══ VÌ SAO ══

   Trên điện thoại, cả menu chính nằm sau một nút ba gạch ở GÓC TRÊN
   BÊN TRÁI. Cầm máy một tay thì đó là góc xa ngón cái nhất trên cả màn
   — với tới nó phải đổi thế cầm, và đổi thế cầm là lúc rơi máy.

   Đáy màn thì ngược lại: ngón cái nằm sẵn ở đó.

   Nên bốn chỗ hay tới nhất chuyển xuống đáy, và nút ba gạch ở trên vẫn
   giữ nguyên cho ai đã quen tay.

   ══ LẤY BỐN CHỖ ẤY Ở ĐÂU — VÀ VÌ SAO PHẢI KHAI TAY ══

   Bản đầu tôi KHÔNG khai tay, vì luật của kho là đừng dựng bản thứ hai
   của một danh sách đã có. Tôi lấy bốn mục đầu tiên mà vai mở được
   trong G.NAV, đúng theo thứ tự cột trái.

   Chạy thì đúng. Nhưng ĐO ra thì cả sáu vai đều có chung ba ô:
   "Đã đổi gì · KPI · GITA là gì" — vì nhóm đầu của G.NAV là nhóm giới
   thiệu. Một thanh điều hướng nhanh mà ô nào cũng dẫn tới trang giới
   thiệu thì nó không nhanh hơn gì cả.

   Bài học: thứ tự trong G.NAV là thứ tự ĐỌC, không phải thứ tự HAY
   DÙNG. Hai thứ ấy khác nhau, và không chỗ nào trong kho nói cái thứ
   hai. Thứ chưa có thì phải khai, không suy ra được.

   Nên nay ba nguồn, xếp theo thứ tự tin cậy:

     1. `G.DUOI[portal]` — lời khai của chủ hệ, ở src/data.core.js
     2. `G.PORTALS[vai].home` — trang chủ của vai, luôn phải có mặt
     3. Thứ tự `G.NAV` — LẤP chỗ còn trống, không dẫn

   Khai sai ở nguồn 1 cũng không vỡ: `them()` bỏ qua màn nào vai không
   mở được, và nguồn 3 lấp nốt. Đó là lời gợi ý, không phải lời hứa.

   Ô `star` trong G.NAV KHÔNG dùng được ở đây — có 101 mục mang star,
   tức là nó đánh dấu "đáng chú ý" chứ không đánh dấu "bốn chỗ hay tới
   nhất". Ghi ra để lần sau không ai thử lại đường ấy.

   ══ MỘT CHỖ PHẢI CẨN THẬN ══

   Thanh này đứng đè lên đáy trang, nên vùng nội dung phải chừa chỗ cho
   nó — kể cả phần dưới vạch về nhà của máy có tai thỏ. Thiếu chỗ chừa
   thì dòng cuối của mọi màn nằm dưới thanh và không ai đọc được, mà
   cũng không ai báo, vì người ta tưởng màn hết ở đó.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;

(function () {
var U = G.U, h = U.h, ic = U.ic;

var SO_O = 4;   /* bốn chỗ, cộng nút Menu là năm — quá năm thì mỗi ô
                   hẹp dưới 60px và nhãn cụt mất nghĩa */

/* Nhãn ngắn cho thanh dưới. Tên đầy đủ trong G.NAV viết cho cột trái
   rộng 288px; đặt nguyên vào một ô rộng 70px thì nó cụt giữa chừng.
   Chỉ khai NHỮNG TÊN DÀI — tên nào đã ngắn thì dùng thẳng, không chép
   lại, để danh sách này không phình thành bản thứ hai của G.NAV. */
var TEN_NGAN = {
  'ban-do': 'Bản đồ',
  'ban-do-ca-nhan': 'Bản đồ tôi',
  'bat-dau': 'Bắt đầu',
  'tham-gia': 'Đường vào',
  'gioi-thieu': 'GITA là gì',
  'bang-viec': 'Việc',
  'viec-hom-nay': 'Hôm nay',
  'tien-bo': 'Đã đổi gì',
  'kpi-toi': 'KPI',
  'pham-vi': 'Phạm vi',
  'tro-ly': 'Trợ lý',
  'dieu-hanh': 'Điều hành',
  'coach-deck': 'Buồng lái',
  'tuvan-deck': 'Mở cửa',
  'nhiem-vu': 'Nhiệm vụ',
  'tien-rung': 'Tiền rừng'
};

function tenNgan(it) {
  if (TEN_NGAN[it.v]) return TEN_NGAN[it.v];
  var t = String(it.t || it.v);
  /* Cắt ở khoảng trắng gần nhất chứ không cắt giữa chữ. Cắt giữa chữ
     tiếng Việt ra những mảnh không đọc được thành tiếng. */
  if (t.length <= 12) return t;
  var c = t.slice(0, 12);
  var k = c.lastIndexOf(' ');
  return (k > 5 ? c.slice(0, k) : c) + '…';
}

/* Bốn ô, dựng lúc chạy từ vai đang dùng. */
G.duoiMuc = function () {
  var vai = G.S && G.S.roleObj;
  if (!vai) return [];
  var nha = ((G.PORTALS || {})[vai.portal] || {}).home;
  var ra = [], da = {};

  function them(v) {
    if (!v || da[v] || ra.length >= SO_O) return;
    if (!G.manCoThat || !G.manCoThat(v)) return;
    if (G.allowed && !G.allowed(v)) return;
    var it = G.navItem ? G.navItem(v) : null;
    if (!it) return;
    da[v] = 1;
    ra.push(it);
  }

  /* Lời khai của chủ hệ đứng trước. */
  ((G.DUOI || {})[vai.portal] || []).forEach(them);
  /* Trang chủ của vai luôn phải có mặt, kể cả khi lời khai quên nó. */
  them(nha);
  /* Còn thiếu thì lấp bằng thứ tự cột trái. Lấp chứ không dẫn: thứ tự
     G.NAV là thứ tự ĐỌC, và bản đầu của hàm này dùng nó làm nguồn chính
     nên cả sáu vai ra chung ba ô của nhóm giới thiệu. */
  (G.NAV || []).forEach(function (g) {
    (g.items || []).forEach(function (i) { them(i.v); });
  });
  return ra;
};

G.thanhDuoi = function () {
  var ds = G.duoiMuc();
  if (!ds.length) return '';
  var dang = (G.S || {}).view;
  var o = ds.map(function (it) {
    var on = (it.v === dang);
    return '<button class="td-o' + (on ? ' on' : '') + '" data-v="' + h(it.v) + '" ' +
      'aria-label="' + h(it.t) + '"' + (on ? ' aria-current="page"' : '') + '>' +
      ic(it.ic || 'dot') + '<span>' + h(tenNgan(it)) + '</span></button>';
  }).join('');
  /* Nút Menu mở ĐÚNG ngăn kéo cũ, không dựng ngăn kéo thứ hai. Nó sáng
     lên khi màn đang mở KHÔNG nằm trong bốn ô — để người dùng biết chỗ
     mình đang đứng nằm ở trong ấy. */
  var ngoai = ds.every(function (it) { return it.v !== dang; });
  o += '<button class="td-o' + (ngoai ? ' on' : '') + '" data-act="toggle-left" ' +
    'aria-label="Mở danh sách đầy đủ">' + ic('menu') + '<span>Menu</span></button>';
  return o;
};

/* Vẽ lại. Gọi sau mỗi lần đổi màn để ô đang đứng sáng đúng chỗ. */
G.duoiVe = function () {
  var el = document.getElementById('duoi');
  if (!el) return;
  el.innerHTML = G.thanhDuoi();
};

})();
