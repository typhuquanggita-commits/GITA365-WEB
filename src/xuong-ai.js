/* ═════════════════════════════════════════════════
   GITA 365 · XƯỞNG PHIM AI — KHUNG BA CỘT

   Chủ hệ: "đang ở dạng liệt kê làm rất khó bao quát và thiếu chuyên
   nghiệp". Mười một công cụ phim nằm rải ở năm màn, mỗi màn một hàng tab
   riêng — muốn làm một phim phải nhớ công cụ nào ở màn nào.

   Màn này KHÔNG viết lại công cụ nào. Nó là cái khung kiểu phòng dựng
   chuyên nghiệp:
     · trái  — danh mục theo nhóm (Bắt đầu · Tạo phim · Tài nguyên ·
               Dựng & hậu kỳ · Quản lý)
     · giữa  — bảng làm việc: gọi THẲNG bộ vẽ của công cụ đã có
     · phải  — dự án đang mở, khổ hình, bước nên làm tiếp
   Công cụ mới duy nhất là "Cắt theo nhịp nhạc" (src/cat-nhip.js).

   Không đụng studio.js: mục "Studio dựng video" chỉ GỌI bộ vẽ của nó.
   Bản thân khung không gọi máy chủ hay dịch vụ ngoài; các công cụ bên
   trong thì có thể (Làm phim nhanh gửi lên trạm GPU nội bộ, Tự động A–Z
   gọi dịch vụ ảnh/video qua máy chủ có trần ngân sách) — đúng như khi
   chúng đứng riêng, và chỉ khi người dùng bấm.

   GỘP MỘT CỬA (chủ hệ chốt 10/2026): GITA Studio và Xưởng phim ngắn 9:16
   không còn mục cột trái riêng. Hai mã màn 'studio' · 'xuong-phim' vẫn
   sống, nhưng tự vẽ CHÍNH KHUNG NÀY với ngăn của mình — không chuyển
   hướng sang 'xuong-ai', vì studio.js và xuong-phim.js chỉ vẽ lại khi
   G.S.view đúng tên chúng (đã thử: chuyển hướng thì sửa gì cũng không
   hiện lên màn). View: xuong-ai. Mở cho qt_trang.
   ═════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G; G.VIEWS = G.VIEWS || {};

(function(){
var U = G.U, h = U.h, ic = U.ic;

/* Danh mục: mỗi mục trỏ vào một bộ vẽ CÓ THẬT. Thêm công cụ mới thì thêm
   một dòng ở đây — không dựng thêm màn. tools/thu-xuong-ai.mjs đối chiếu
   từng dòng với bộ vẽ thật trong src/. */
var NHOM = [
  { t: 'Bắt đầu', ds: [
    { k: 'nha', t: 'Trang chủ xưởng', ic: 'home' },
    { k: 'mau', t: 'Mẫu & khổ hình', ic: 'grid' } ] },
  { t: 'Tạo phim', ds: [
    { k: 'nhanh', t: 'Làm phim nhanh', ic: 'lightning', ve: function(){ return G.axn && G.axn.ve && G.axn.ve(); } },
    { k: 'tudong', t: 'Tự động A–Z', ic: 'sparkle', ve: function(){ return sxa('tudong'); } },
    { k: 'duan', t: 'Dự án phim', ic: 'target', ve: function(){ return G.axda && G.axda.ve && G.axda.ve(); } },
    { k: 'phancanh', t: 'Phân cảnh', ic: 'list', ve: function(){ return sxa('phim'); } },
    { k: 'phim916', t: 'Phim ngắn 9:16', ic: 'spark', ve: function(){ return goiMan('xuong-phim'); } },
    { k: 'studio', t: 'Studio dựng video', ic: 'orbit', ve: function(){ return goiMan('studio'); } } ] },
  { t: 'Tài nguyên', ds: [
    { k: 'nv', t: 'Nhân vật', ic: 'users', ve: function(){ return sxa('nv'); } },
    { k: 'giong', t: 'Giọng đọc', ic: 'chat' },
    { k: 'phimtruong', t: 'Phim trường', ic: 'map', ve: function(){ return sxa('phimtruong'); } },
    { k: 'thuonghieu', t: 'Bộ nhận diện', ic: 'crown' } ] },
  { t: 'Dựng & hậu kỳ', ds: [
    { k: 'catnhip', t: 'Cắt theo nhịp nhạc', ic: 'pulse', ve: function(){ return G.catNhip && G.catNhip.ve && G.catNhip.ve(); } },
    { k: 'bandung', t: 'Bàn dựng', ic: 'tools', ve: function(){ return goiMan('ban-dung'); } },
    { k: 'kyxao', t: 'Kỹ xảo & động cơ', ic: 'tools', ve: function(){ return sxa('kyxao'); } } ] },
  { t: 'Quản lý', ds: [
    { k: 'kho', t: 'Kho phim', ic: 'vault', ve: function(){ return G.khoDrive && G.khoDrive.ve && G.khoDrive.ve(); } },
    { k: 'bang', t: 'Bảng sản xuất', ic: 'chart', ve: function(){ return sxa('bang'); } },
    { k: 'prompt', t: 'Prompt & cấu hình', ic: 'edit', ve: function(){ return sxa('prompt'); } },
    { k: 'hdh', t: 'Hệ điều hành xưởng', ic: 'compass', ve: function(){ return goiMan('studio-he'); } },
    { k: 'b10', t: 'Chương trình 10 bước', ic: 'book', ve: function(){ return goiMan('lam-phim-10'); } } ] }
];
G.XA_NHOM = NHOM;

/* Bốn màn con của xưởng không có mục cột trái nên không vào được bảng
   gộp V50 (bảng ấy chỉ nhận mục cột trái — thu-ap-dung canh). Nút trong
   các công cụ cũ vẫn trỏ data-v tới chúng; không bắt lại thì người đang
   ở trong khung bị đẩy ra một màn rời. render() ở app.js đọc bảng này. */
G.XA_CUA = { 'san-xuat-ai': 'nha', 'ban-dung': 'bandung', 'studio-he': 'hdh', 'lam-phim-10': 'b10' };

/* Màn chủ của từng ngăn. Mặc định là 'xuong-ai'; hai ngăn dưới đây thuộc
   về mã màn cũ của chúng, vì bộ vẽ lại của hai công cụ ấy kiểm tên màn. */
var CHU = { studio: 'studio', phim916: 'xuong-phim' };
G.XA_CHU = CHU;
/* Bộ vẽ gốc của hai màn được giữ lại trước khi thay bằng khung. Thứ tự
   gộp (danh-sach-src.json) đặt studio.js và xuong-phim.js TRƯỚC tệp này —
   tools/thu-xuong-ai.mjs canh thứ tự ấy. */
var GOC = {};

function muc(k){
  for (var i = 0; i < NHOM.length; i++) for (var j = 0; j < NHOM[i].ds.length; j++)
    if (NHOM[i].ds[j].k === k) return NHOM[i].ds[j];
  return null;
}

/* Gọi bộ vẽ của một màn khác và bỏ phần đầu trang của nó: khung này đã có
   tiêu đề, hai tiêu đề lớn chồng nhau thì người đọc không biết mình đang
   ở đâu. U.ph() luôn dựng <header class="ph"> ở đầu chuỗi. */
function goiMan(v){
  var f = GOC[v] || G.VIEWS[v]; if (typeof f !== 'function') return '';
  return String(f() || '').replace(/^\s*<header class="ph">[\s\S]*?<\/header>/, '');
}
/* Một ngăn của bộ điều khiển sản xuất: chế độ nhúng bỏ đầu trang và hàng
   tab của nó — hàng tab ấy chính là danh mục bên trái của khung này. */
function sxa(tab){
  var cu = G.S.axTab; G.S.axTab = tab; G.S.axNhung = 1;
  try { return goiMan('san-xuat-ai'); } finally { G.S.axNhung = 0; G.S.axTab = cu; }
}

G.xaMo = function(k){
  if (!muc(k)) return;
  G.S.xaMuc = k;
  var chu = CHU[k] || 'xuong-ai';
  if (G.S.view !== chu && G.go) G.go(chu);
  else { if (G.save) G.save(); if (G.render) G.render(); }
};
/* Nút trong công cụ cũ gọi G.ax.tab('khophim')… để đổi tab của bộ điều
   khiển sản xuất. Trong khung, tab ấy là một ngăn — đổi ngăn thay vì đổi
   một tab đang bị giấu (bản đầu: bấm "Xem trong Kho phim" không có gì xảy ra). */
var TAB_NGAN = { nhanh: 'nhanh', duan: 'duan', khophim: 'kho', nv: 'nv', phim: 'phancanh', prompt: 'prompt',
                 bang: 'bang', phimtruong: 'phimtruong', kyxao: 'kyxao', tudong: 'tudong' };
G.XA_TAB_NGAN = TAB_NGAN;
setTimeout(function(){
  if (!G.ax || !G.ax.tab || G.ax.tab._xa) return;
  var tabCu = G.ax.tab;
  G.ax.tab = function(t){
    if (G.S && (G.S.view === 'xuong-ai' || CHU_MAN[G.S.view]) && TAB_NGAN[t]) return G.xaMo(TAB_NGAN[t]);
    return tabCu(t);
  };
  G.ax.tab._xa = 1;
}, 0);
var CHU_MAN = { studio: 1, 'xuong-phim': 1 };
G.xaKhung = function(k){ G.S.xaKhung = k; if (G.save) G.save(); if (G.render) G.render(); };

/* ════════ BA NGĂN TỰ VẼ (không có công cụ cũ tương ứng) ════════ */
var KHO_HINH = [
  { k: '9:16', t: 'Dọc 9:16', d: 'Reels · TikTok · Shorts — khổ chính của phim ngắn GITA' },
  { k: '16:9', t: 'Ngang 16:9', d: 'YouTube · màn chiếu hội trường' },
  { k: '1:1', t: 'Vuông 1:1', d: 'Bảng tin Facebook, Zalo' },
  { k: '4:5', t: 'Dọc 4:5', d: 'Bảng tin Instagram — chiếm nhiều màn hơn 1:1' }
];

function veNha(){
  var da = G.xpDA || {}, ax = G.S.axDA || {};
  var the = function(k, ic1, t, d){
    return '<button class="xa-tao" onclick="G.xaMo(\'' + k + '\')">' + ic(ic1, 'w-5 h-5') + '<b>' + h(t) + '</b><span>' + h(d) + '</span></button>';
  };
  var o = '<div class="xa-tao-luoi">' +
    the('nhanh', 'lightning', 'Làm phim nhanh', 'Chọn ảnh nhân vật, dán kịch bản, bấm một nút — máy GPU nội bộ dựng 1080p.') +
    the('duan', 'target', 'Dự án phim 4–8 phút', 'Cảnh quay thật, cảnh nền miễn phí, cảnh AI — ráp trên Google Drive.') +
    the('phim916', 'spark', 'Phim ngắn 9:16', 'Kịch bản → prompt từng cảnh → nạp clip → phụ đề, logo, nhạc.') +
    the('catnhip', 'pulse', 'Cắt theo nhịp nhạc', 'Một bài nhạc + một bộ ảnh — mỗi cú chuyển cảnh rơi đúng một nhịp.') +
    '</div>';
  o += '<h2 class="xa-h">Đang làm dở</h2><div class="xa-gan">';
  var co = false;
  if (da.ten){ co = true; o += '<button class="xa-gan-o" onclick="G.xaMo(\'phim916\')"><b>' + h(da.ten) + '</b><span>Phim ngắn 9:16 · tập ' + h(da.tap || 1) + ' · ' + ((da.canh || []).length) + ' cảnh</span></button>'; }
  if (ax.ten){ co = true; o += '<button class="xa-gan-o" onclick="G.xaMo(\'duan\')"><b>' + h(ax.ten) + '</b><span>Dự án phim · ' + h(ax.cheDo === 'ai100' ? '100% AI từ ảnh' : (ax.cheDo || 'chưa chọn cách làm')) + '</span></button>'; }
  if (!co) o += '<p class="muted sm">Chưa có dự án nào. Chọn một ô ở trên để bắt đầu.</p>';
  o += '</div>';
  return o;
}

function veMau(){
  var cur = G.S.xaKhung || '9:16';
  var o = '<p class="sm" style="color:var(--ink-2)">Khổ hình dùng chung cho công cụ "Cắt theo nhịp nhạc". Các công cụ khác giữ khổ riêng trong dự án của chúng.</p>';
  o += '<div class="xa-kho">' + KHO_HINH.map(function(x){
    var p = x.k.split(':'), r = (+p[0]) / (+p[1]);
    return '<button class="xa-kho-o' + (x.k === cur ? ' on' : '') + '" aria-pressed="' + (x.k === cur) + '" onclick="G.xaKhung(\'' + x.k + '\')">' +
      '<span class="xa-kho-hinh" style="aspect-ratio:' + p[0] + '/' + p[1] + ';' + (r >= 1 ? 'width:56px' : 'height:56px') + '"></span>' +
      '<b>' + h(x.t) + '</b><span>' + h(x.d) + '</span></button>';
  }).join('') + '</div>';
  o += '<h2 class="xa-h">Mẫu có sẵn</h2><div class="xa-gan">' +
    '<button class="xa-gan-o" onclick="G.xaMo(\'b10\')"><b>Chương trình 10 bước ra phim</b><span>Đi từ ý tưởng tới phim 9:16 hoàn chỉnh, mỗi bước có việc tick được</span></button>' +
    '<button class="xa-gan-o" onclick="G.xaMo(\'phim916\')"><b>Dự án mẫu "Bữa Cơm Muộn"</b><span>Trong Phim ngắn 9:16 → "Nạp lại dự án mẫu"</span></button></div>';
  return o;
}

function veGiong(){
  /* Thứ tự này là quyết định đã chốt: giọng người thật có đồng ý trước,
     rồi mới tới giọng máy, và giọng máy chạy trên máy nội bộ. */
  var ds = [
    ['Thu âm giọng người thật', 'Ưu tiên số một. Người đọc đồng ý cho dùng giọng, mỗi câu truy được về một người đã nói câu ấy.'],
    ['VieNeu-TTS — tiếng Việt', 'Mô hình mở chạy trên máy GPU nội bộ, không gửi văn bản ra dịch vụ ngoài. Dùng khi chưa có người đọc.'],
    ['Chatterbox — tiếng Anh', 'Cho phim tiếng Anh. Cũng chạy nội bộ.']
  ];
  return '<ol class="xa-giong">' + ds.map(function(x){ return '<li><b>' + h(x[0]) + '</b><span>' + h(x[1]) + '</span></li>'; }).join('') + '</ol>' +
    '<p class="sm" style="color:var(--ink-2)">Cấu hình động cơ giọng nằm ở <button class="btn ghost sm" onclick="G.xaMo(\'kyxao\')">Kỹ xảo & động cơ</button>. Không nhái giọng một người khi chưa có sự đồng ý của chính người ấy.</p>';
}

function veThuongHieu(){
  /* Đọc THẲNG token lúc vẽ — một bảng màu chép tay ở đây sẽ lệch với
     style.css ngay lần đổi màu sau. */
  var cs = getComputedStyle(document.documentElement);
  var mau = [['--gita-sau', 'Xanh sâu · chữ GITA'], ['--gita', 'Xanh GITA · nút, viền'], ['--gita-sang', 'Xanh sáng · chuyển sắc'],
             ['--gita-do', 'Đỏ GITA · ngôi sao đỏ'], ['--ink', 'Mực chữ'], ['--bg-1', 'Nền giấy']];
  var o = '<div class="xa-logo"><img src="assets/brand/logo-gita.png" alt="Logo GITA 365" width="96" height="96" loading="lazy">' +
    '<img src="assets/brand/dau-gita.png" alt="Dấu GITA" width="96" height="96" loading="lazy"></div>';
  o += '<div class="xa-mau">' + mau.map(function(m){
    var v = (cs.getPropertyValue(m[0]) || '').trim();
    return '<div class="xa-mau-o"><span class="xa-mau-cham" style="background:var(' + m[0] + ')"></span><b class="mono">' + h(v) + '</b><span>' + h(m[1]) + '</span></div>';
  }).join('') + '</div>';
  o += '<p class="sm" style="color:var(--ink-2)">Chữ: <b>Be Vietnam Pro</b> cho thân bài và nhãn, <b>Playfair Display</b> cho tiêu đề lớn. Logo và màu lấy từ tệp logo gốc — không đổi sắc, không kéo méo, chừa khoảng trống quanh logo.</p>';
  return o;
}

var TU_VE = { nha: veNha, mau: veMau, giong: veGiong, thuonghieu: veThuongHieu };

/* ════════ CỘT PHẢI ════════ */
var TIEP = {
  nha: ['nhanh', 'Bắt đầu nhanh nhất: Làm phim nhanh'],
  nhanh: ['kho', 'Phim xong nằm ở Kho phim'],
  duan: ['kho', 'Tệp dự án nằm trên Google Drive — xem ở Kho phim'],
  phim916: ['catnhip', 'Có nhạc nền? Thử cắt cảnh theo nhịp'],
  catnhip: ['mau', 'Đổi khổ hình ở Mẫu & khổ'],
  nv: ['phimtruong', 'Nhân vật xong thì chọn phim trường'],
  phimtruong: ['prompt', 'Xuất prompt & cấu hình cho máy GPU'],
  prompt: ['bang', 'Theo dõi từng cảnh ở Bảng sản xuất'],
  bandung: ['catnhip', 'Muốn cắt khớp nhạc: Cắt theo nhịp']
};
function veCotPhai(k){
  var da = G.xpDA || {}, ax = G.S.axDA || {}, tp = TIEP[k];
  var o = '<div class="xa-the"><span class="tiny muted">Khổ hình</span><b>' + h(G.S.xaKhung || '9:16') + '</b>' +
    '<button class="btn ghost sm" onclick="G.xaMo(\'mau\')">Đổi</button></div>';
  o += '<div class="xa-the"><span class="tiny muted">Phim 9:16 đang mở</span><b>' + h(da.ten || 'Chưa có') + '</b>' +
    (da.ten ? '<span class="tiny">Tập ' + h(da.tap || 1) + ' · ' + ((da.canh || []).length) + ' cảnh · ' + h(da.khung || '') + '</span>' : '') + '</div>';
  o += '<div class="xa-the"><span class="tiny muted">Dự án phim</span><b>' + h(ax.ten || 'Chưa có') + '</b></div>';
  if (tp) o += '<button class="xa-tiep" onclick="G.xaMo(\'' + tp[0] + '\')">' + ic('arrow', 'w-4 h-4') + '<span>' + h(tp[1]) + '</span></button>';
  o += '<p class="tiny muted">' + ic('shield', 'w-3 h-3') + ' Ảnh, nhạc, kịch bản xử lý trên máy anh/chị hoặc trạm GPU riêng của GITA — chỉ gửi khi anh/chị bấm.</p>';
  return o;
}

/* ════════ MÀN ════════ */
function veKhung(){
  if (!(typeof G.can === 'function' && G.can('qt_trang')))
    return U.lockCard('Xưởng phim AI mở cho Super Admin / Admin. Đăng nhập đúng vai để xem.');
  var k = muc(G.S.xaMuc) ? G.S.xaMuc : 'nha', m = muc(k);

  var o = U.ph({ eyebrow: 'XƯỞNG PHIM AI', ic: 'orbit', t: 'Xưởng phim AI',
    lead: 'Một chỗ cho cả quy trình: tạo phim, tài nguyên, dựng, kho. Chọn việc ở danh mục.' });

  o += '<div class="xa">';
  o += '<nav class="xa-trai" aria-label="Danh mục xưởng phim">' + NHOM.map(function(n){
    return '<div class="xa-nhom"><span class="xa-nhom-t">' + h(n.t) + '</span>' + n.ds.map(function(x){
      return '<button class="xa-muc' + (x.k === k ? ' on' : '') + '"' + (x.k === k ? ' aria-current="page"' : '') +
        ' onclick="G.xaMo(\'' + x.k + '\')">' + ic(x.ic, 'w-4 h-4') + '<span>' + h(x.t) + '</span></button>';
    }).join('') + '</div>';
  }).join('') + '</nav>';

  var than = '';
  var loiVe = '';
  try { than = TU_VE[k] ? TU_VE[k]() : (m.ve ? m.ve() : ''); }
  catch (e) { than = ''; loiVe = (e && e.message) || String(e); if (window.console) console.error('xuong-ai/' + k, e); }
  if (!than) than = U.empty(loiVe ? 'Công cụ này gặp lỗi khi mở' : 'Công cụ này chưa sẵn sàng trên máy này',
    loiVe ? 'Lỗi: ' + loiVe + ' — chụp dòng này gửi bộ phận kỹ thuật.' : 'Có thể vai hiện tại chưa mở gói của công cụ, hoặc trình duyệt chặn một tính năng nó cần.', true);

  o += '<section class="xa-giua" aria-labelledby="xa-giua-t"><h2 id="xa-giua-t" class="xa-giua-t">' + ic(m.ic, 'w-5 h-5') + h(m.t) + '</h2>' + than + '</section>';
  o += '<aside class="xa-phai" aria-label="Dự án và bước tiếp theo">' + veCotPhai(k) + '</aside>';
  o += '</div>';
  /* Trên điện thoại danh mục là một dải cuộn ngang: mục đang mở có thể nằm
     ngoài mép phải, người dùng không thấy mình đang ở đâu. Cuộn nó vào giữa. */
  /* Chỉ cuộn NGANG dải danh mục — scrollIntoView sẽ kéo cả trang lên đầu
     mỗi lần một công cụ bên trong vẽ lại, đúng lúc người dùng đang đọc ở dưới. */
  setTimeout(function(){
    var e = document.querySelector('.xa-muc.on'), d = document.querySelector('.xa-trai');
    if (e && d && window.innerWidth <= 860) d.scrollLeft = Math.max(0, e.offsetLeft - (d.clientWidth - e.offsetWidth) / 2);
  }, 0);
  return o;
}

G.VIEWS['xuong-ai'] = function(){
  /* Đang ở một ngăn có màn chủ riêng mà vào bằng 'xuong-ai' (cột trái,
     địa chỉ cũ) — về trang chủ xưởng, đừng vẽ công cụ dưới tên màn sai. */
  if (CHU[G.S.xaMuc]) G.S.xaMuc = 'nha';
  return veKhung();
};
Object.keys(CHU_MAN).forEach(function(v){
  GOC[v] = G.VIEWS[v];
  G.VIEWS[v] = function(){
    var ngan = v === 'studio' ? 'studio' : 'phim916';
    G.S.xaMuc = ngan;
    return veKhung();
  };
});
})();
