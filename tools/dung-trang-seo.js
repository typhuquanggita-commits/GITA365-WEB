#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════
   GITA 365 — DỰNG PHẦN MÁY TÌM KIẾM ĐỌC ĐƯỢC

       node tools/dung-trang-seo.js

   ── VÌ SAO CẦN ──
   Đo trước khi làm. Trước bản này, một trình thu thập của Google mở
   gita.edu.vn sẽ gặp đúng ba thứ:

     1. robots.txt ghi "Disallow: /" cho mọi trình thu thập.
     2. Thẻ <meta name="robots" content="noindex, nofollow">.
     3. Trong <body>, trước khi chạy JavaScript, có 77 ký tự:
        "Ứng dụng cần bật JavaScript…"

   Nghĩa là GITA 365 không phải đang xếp hạng thấp. Nó đang KHÔNG TỒN
   TẠI với máy tìm kiếm, do chính mình khai báo.

   ── HAI VÙNG, TÁCH BẠCH ──
   Mở cửa trước không có nghĩa mở kho. Bản này chia rõ:

     VÙNG CÔNG KHAI — cho máy tìm kiếm đọc:
       Giới thiệu, sứ mệnh, mô thức GITA, năm tầng, mười hai chặng,
       câu hỏi thường gặp, đường vào, cộng đồng, liên hệ.
       Đây đúng bộ nội dung vốn đã nằm trong bản giới thiệu vẫn gửi
       cho khách xem — không có gì mới bị mở ra.

     VÙNG KHOÁ — vẫn cấm như cũ:
       kho/*.enc, mọi màn nghề, hồ sơ gia đình, phác đồ, kịch bản.
       robots.txt vẫn Disallow, và chúng vốn nằm sau đăng nhập.

   ── VẪN CHẶN TRÌNH THU THẬP HUẤN LUYỆN AI ──
   Chủ hệ thống đã yêu cầu rõ: không hệ thống AI nào được lấy nội dung
   này. Yêu cầu đó KHÔNG mâu thuẫn với SEO, vì hai việc do hai trình
   thu thập khác nhau làm:

       Googlebot          → lập chỉ mục để tìm kiếm     ⇒ CHO
       Google-Extended    → lấy dữ liệu huấn luyện AI   ⇒ CHẶN
       GPTBot, ClaudeBot, CCBot, PerplexityBot…         ⇒ CHẶN

   Chặn Google-Extended không hạ thứ hạng tìm kiếm. Đây là hai đường
   riêng, và bản này giữ nguyên toàn bộ danh sách chặn cũ.

   ── KHÔNG DỰNG ĐÁNH GIÁ GIẢ ──
   G.HAILONG trong kho là DỮ LIỆU MẪU: "Nhà Khánh Vy", "Nhà Đức Anh"
   là nhà hư cấu, 87,4% là số dựng để xem giao diện.

   Đem chúng lên trang dưới dạng AggregateRating là hai việc sai cùng
   lúc: nói dối người đọc, và vi phạm chính sách đánh giá giả của
   Google — mức phạt là phạt tay, tức mất hẳn thứ hạng. Ngược đúng cái
   đang muốn đạt.

   Nên bộ sinh này CÓ sẵn đường phát dữ liệu đánh giá, nhưng chỉ phát
   khi có đánh giá THẬT trong kho, và im lặng khi chưa có.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
const fs = require('fs');
const path = require('path');

const GOC = path.join(__dirname, '..');
const NGUON = path.join(GOC, 'kho-goc');

/* ─── Nạp nội dung gốc, đúng cách tools/ma-hoa-kho.js làm ─── */
global.window = {};
for (const t of fs.readdirSync(NGUON).filter(f => f.endsWith('.js')).sort())
  require(path.join(NGUON, t));
/* src/data.core.js giữ G.GITA, G.META, G.CULTURE — nạp thêm */
for (const t of ['data.core.js'])
  require(path.join(GOC, 'src', t));
const G = global.window.G;

const MIEN = (fs.existsSync(path.join(GOC, 'CNAME'))
  ? fs.readFileSync(path.join(GOC, 'CNAME'), 'utf8').trim() : 'gita.edu.vn');
const GOCURL = 'https://' + MIEN;
const BAN = (G.META && G.META.version) || '';

function h(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
const ds = x => Array.isArray(x) ? x : [];

/* ═══════════════════════════════════════════════════════════════
   1 · NỘI DUNG TRANG — máy tìm kiếm đọc phần này khi chưa chạy JS
   Đặt trong <div id="app">, đúng chỗ ứng dụng ghi đè khi khởi động:
   trình thu thập thấy đủ chữ, người dùng thấy ứng dụng như cũ.
   ═══════════════════════════════════════════════════════════════ */
function mucLon(id, tieu, phu) {
  return '\n<section id="' + id + '">\n<h2>' + h(tieu) + '</h2>' +
    (phu ? '\n<p>' + h(phu) + '</p>' : '');
}

function than() {
  let o = '<div class="seo-shell">\n';
  const ul = a => '\n<ul>' + a.join('\n') + '</ul>\n';
  const ol = a => '\n<ol>' + a.join('\n') + '</ol>\n';

  /* ── Mở đầu ── */
  const vs = G.GT_VISAO || {};
  o += '<h1>GITA 365 — Hệ sinh thái Gia đình Thịnh vượng</h1>\n';
  o += '<p><strong>' + h(G.GT_MOT_CAU || '') + '</strong></p>\n';
  if (vs.canh) o += '<p>' + h(vs.canh) + '</p>\n';
  if (vs.hong) o += '<p>' + h(vs.hong) + '</p>\n';
  if (vs.chot) o += '<p><em>' + h(vs.chot) + '</em></p>\n';

  /* ── Hứa gì ── */
  if (ds(G.GT_HUA).length) {
    o += mucLon('gita-hua', 'Bốn lời hứa của GITA 365');
    o += ul(ds(G.GT_HUA).map(x =>
      '<li><strong>' + h(x.t) + '</strong>' + (x.y ? ' — ' + h(x.y) : '') + '</li>'));
    o += '</section>\n';
  }

  /* ── KHÔNG hứa gì ──
     Mục này là tín hiệu tin cậy mạnh nhất trên cả trang. Nơi khác giấu
     đi; đưa lên đầu là thứ phân biệt một chương trình thật với một lời
     chào hàng. Google gọi phần này là "trung thực về giới hạn". */
  if (ds(G.GT_KHONG).length) {
    o += mucLon('gita-khong-hua', 'Sáu điều GITA 365 KHÔNG làm',
      'Phần này để đây có chủ ý. Ai hứa với anh chị mọi thứ thì đang bán một thứ khác.');
    o += ul(ds(G.GT_KHONG).map(x => '<li>' + h(x) + '</li>'));
    o += '</section>\n';
  }

  /* ── Mô thức GITA ── */
  if (ds(G.GITA).length) {
    o += mucLon('mo-thuc-gita', 'Mô thức huấn luyện GITA',
      'Bốn trụ dẫn dắt toàn bộ chương trình.');
    o += '\n<dl>' + ds(G.GITA).map(t =>
      '\n<dt><strong>' + h(t.k) + ' — ' + h(t.name) + '</strong></dt>' +
      '\n<dd>' + h(t.desc || '') +
      (ds(t.inc).length ? '<br><em>' + h(ds(t.inc).join(' · ')) + '</em>' : '') + '</dd>'
    ).join('') + '\n</dl>\n</section>\n';
  }

  /* ── Bốn trụ hành trình ── */
  if (ds(G.TRU_GITA).length) {
    o += mucLon('bon-tru', 'Bốn trụ của hành trình một năm');
    o += ul(ds(G.TRU_GITA).map(x =>
      '<li><strong>' + h(x.ten) + '</strong>' + (x.y ? ' — ' + h(x.y) : '') + '</li>'));
    o += '</section>\n';
  }

  /* ── Năm tầng ── */
  if (ds(G.GT_TANG).length) {
    o += mucLon('nam-tang', 'Năm tầng đồng hành',
      'Mỗi tầng có việc riêng, mốc hoàn thành riêng, và cái mất nếu bỏ qua.');
    o += ds(G.GT_TANG).map(x =>
      '\n<h3>' + h(x.t) + ' · ' + h(x.ten) + '</h3>' +
      (x.y ? '\n<p>' + h(x.y) + '</p>' : '') +
      (x.max ? '\n<p><strong>Giá trị lớn nhất:</strong> ' + h(x.max) + '</p>' : '') +
      (x.cong ? '\n<p><strong>Mốc hoàn thành:</strong> ' + h(x.cong) + '</p>' : '') +
      (x.mat ? '\n<p><strong>Bỏ qua tầng này thì mất gì:</strong> ' + h(x.mat) + '</p>' : '')
    ).join('') + '\n</section>\n';
  }

  /* ── Mục tiêu đo được ── */
  if (ds(G.GT_MUCTIEU).length) {
    o += mucLon('muc-tieu', 'Mục tiêu và cách đo',
      'Mục tiêu không đo được thì không phải mục tiêu.');
    o += ds(G.GT_MUCTIEU).map(x =>
      '\n<h3>' + h(x.ten) + (x.moc ? ' <small>(' + h(x.moc) + ')</small>' : '') + '</h3>' +
      (x.dich ? '\n<p>' + h(x.dich) + '</p>' : '') +
      (x.do ? '\n<p><strong>Đo bằng:</strong> ' + h(x.do) + '</p>' : '') +
      (x.chuan ? '\n<p><strong>Đạt khi:</strong> ' + h(x.chuan) + '</p>' : '')
    ).join('') + '\n</section>\n';
  }

  /* ── Mười hai chặng ── */
  if (ds(G.HANHTRINH12).length) {
    o += mucLon('muoi-hai-chang', 'Mười hai chặng của một năm',
      'Chặng nào cũng có việc làm được, mốc biết mình đã qua, và dấu hiệu biết mình chưa qua.');
    o += ds(G.HANHTRINH12).map(x =>
      '\n<h3>Chặng ' + h(x.no) + ' · ' + h(x.ten) + '</h3>' +
      (x.ngay ? '\n<p><strong>Thời gian:</strong> ' + h(x.ngay) +
        (x.ai ? ' · <strong>Người đi cùng:</strong> ' + h(x.ai) : '') + '</p>' : '') +
      (ds(x.viec).length ? ul(ds(x.viec).map(v => '<li>' + h(v) + '</li>')) : '') +
      (x.xongKhi ? '\n<p><strong>Xong khi:</strong> ' + h(x.xongKhi) + '</p>' : '') +
      (x.chuaXong ? '\n<p><strong>Chưa xong nếu:</strong> ' + h(x.chuaXong) + '</p>' : '') +
      (x.lamGi ? '\n<p><strong>Khi ấy làm gì:</strong> ' + h(x.lamGi) + '</p>' : '')
    ).join('') + '\n</section>\n';
  }

  /* ── Đường vào sáu bước ── */
  if (ds(G.DV_BUOC).length) {
    o += mucLon('duong-vao', 'Đường vào: sáu bước từ lúc nghe tới lúc bắt đầu');
    o += ds(G.DV_BUOC).map(x =>
      '\n<h3>Bước ' + h(x.so) + ' · ' + h(x.ten) + '</h3>' +
      (x.ai ? '\n<p>' + h(x.ai) + '</p>' : '') +
      (x.lau ? '\n<p><strong>Mất bao lâu:</strong> ' + h(x.lau) + '</p>' : '') +
      (x.lam ? '\n<p><strong>Làm gì:</strong> ' + h(x.lam) + '</p>' : '') +
      (x.xong ? '\n<p><strong>Xong khi:</strong> ' + h(x.xong) + '</p>' : '') +
      (x.chan ? '\n<p><strong>Chỗ hay tắc:</strong> ' + h(x.chan) + '</p>' : '')
    ).join('') + '\n</section>\n';
  }

  /* ── Chín vai trong nhà ── */
  if (ds(G.GT_VAI).length) {
    o += mucLon('chin-vai', 'Các vai trong một gia đình vận hành được');
    o += ul(ds(G.GT_VAI).map(x =>
      '<li><strong>' + h(x.t) + '</strong>' + (x.y ? ' — ' + h(x.y) : '') + '</li>'));
    o += '</section>\n';
  }

  /* ── Bốn chặng đầu ── (chỉ trang chủ có, không trang con nào mang) */
  if (ds(G.GT_CHANG).length) {
    o += mucLon('bon-chang-dau', 'Bốn chặng đầu tiên của một nhà mới vào',
      'Ba mươi ngày đầu quyết định nhà mình có đi tiếp hay không.');
    o += ds(G.GT_CHANG).map(x =>
      '\n<h3>' + h(x.ten) + (x.ngay ? ' <small>(' + h(x.ngay) + ')</small>' : '') + '</h3>' +
      (x.lam ? '\n<p><strong>Làm gì:</strong> ' + h(x.lam) + '</p>' : '') +
      (x.xong ? '\n<p><strong>Xong khi:</strong> ' + h(x.xong) + '</p>' : '')
    ).join('') + '\n</section>\n';
  }

  /* ── Bắt đầu thế nào ── */
  if (ds(G.GT_BUOC).length) {
    o += mucLon('bat-dau', 'Bắt đầu như thế nào');
    o += ol(ds(G.GT_BUOC).map(x =>
      '<li><strong>' + h(x.t) + '</strong>' + (x.y ? ' — ' + h(x.y) : '') + '</li>'));
    o += '</section>\n';
  }

  /* ── Cách đồng hành ── */
  const dh = G.GT_DONGHANH || {};
  if (dh.y || dh.chot) {
    o += mucLon('cach-dong-hanh', 'Học viện đồng hành tới đâu — và dừng ở đâu');
    if (dh.y) o += '\n<p>' + h(dh.y) + '</p>';
    if (ds(dh.vong).length)
      o += ul(ds(dh.vong).map(v => '<li>' + h(typeof v === 'string' ? v : (v.t || v.ten || '')) +
        (v && v.y ? ' — ' + h(v.y) : '') + '</li>'));
    if (dh.cam) o += '\n<p><strong>Điều Học viện không làm:</strong> ' + h(dh.cam) + '</p>';
    if (dh.roi) o += '\n<p><strong>Khi nào gia đình rời đi được:</strong> ' + h(dh.roi) + '</p>';
    if (dh.chot) o += '\n<p><em>' + h(dh.chot) + '</em></p>';
    o += '\n</section>\n';
  }

  /* ── Câu hỏi thường gặp ── */
  const hoi = layHoi();
  if (hoi.length) {
    o += mucLon('cau-hoi', 'Câu hỏi phụ huynh hay hỏi nhất');
    o += hoi.map(q => '\n<h3>' + h(q.h) + '</h3>\n<p>' + h(q.d) + '</p>').join('');
    o += '\n</section>\n';
  }

  /* ── Cộng đồng ── */
  if (ds(G.KENH_DS).length) {
    o += mucLon('cong-dong', 'Cộng đồng Gia đình Thịnh vượng',
      'Chưa cần là khách hàng vẫn vào được.');
    o += ds(G.KENH_DS).map(k =>
      '\n<h3>' + (k.url ? '<a href="' + h(k.url) + '" rel="noopener noreferrer">' + h(k.ten) + '</a>'
        : h(k.ten)) + '</h3>' +
      (k.vaiTro ? '\n<p>' + h(k.vaiTro) + '</p>' : '') +
      (k.cho ? '\n<p><strong>Dành cho:</strong> ' + h(k.cho) + '</p>' : '')
    ).join('') + '\n</section>\n';
  }

  /* ── Ai đứng sau ──
     Google gọi đây là E-E-A-T. Với chủ đề nuôi dạy con — thuộc nhóm
     "tiền hoặc đời người" mà Google soi chặt nhất — trang không nói rõ
     ai chịu trách nhiệm thì gần như không xếp hạng được, dù nội dung
     hay tới đâu. */
  o += mucLon('ai-dung-sau', 'Ai đứng sau GITA 365');
  o += '\n<p><strong>Học viện GITA</strong> — Trương Nhật Quang sáng lập và trực tiếp ' +
    'biên soạn mô thức huấn luyện GITA.</p>\n' +
    '<ul>\n' +
    '<li>Hotline: <a href="tel:+842855554688">08.5555.4688</a></li>\n' +
    '<li>Website: <a href="https://truongnhatquang.com" rel="noopener">truongnhatquang.com</a></li>\n' +
    '<li>Ứng dụng: <a href="' + h(GOCURL) + '/">' + h(MIEN) + '</a></li>\n' +
    '</ul>\n</section>\n';

  o += '</div>\n';
  return o;
}

/* Gộp hai kho câu hỏi, bỏ trùng theo câu hỏi */
function layHoi() {
  const ra = [], da = {};
  for (const n of ['GT_HOI', 'DV_HOI'])
    for (const x of ds(G[n])) {
      const q = String(x.h || x.q || x.t || '').trim();
      const a = String(x.d || x.a || x.y || '').trim();
      if (!q || !a || da[q]) continue;
      da[q] = 1; ra.push({ h: q, d: a });
    }
  return ra;
}

/* ═══════════════════════════════════════════════════════════════
   2 · DỮ LIỆU CÓ CẤU TRÚC
   Chỉ khai những gì kiểm chứng được. Không khai giải thưởng, không
   khai số học viên, không khai đánh giá — vì chưa có bằng chứng công
   khai nào cho chúng, và khai sai là mất chỉ mục chứ không phải mất
   một hạng.
   ═══════════════════════════════════════════════════════════════ */
function danhGiaThat() {
  /* Chỗ nối cho đánh giá THẬT khi có. G.DANHGIA_THAT phải là mảng
     {ten, sao, ngay, noi} do người thật gửi và quản trị duyệt.
     Chưa có thì trả null — KHÔNG lấy G.HAILONG (dữ liệu mẫu) thay thế. */
  const a = ds(G.DANHGIA_THAT).filter(x => x && x.sao >= 1 && x.sao <= 5 && x.ten && x.noi);
  if (!a.length) return null;
  const tb = a.reduce((s, x) => s + Number(x.sao), 0) / a.length;
  return {
    '@type': 'AggregateRating',
    ratingValue: Math.round(tb * 10) / 10,
    reviewCount: a.length,
    bestRating: 5, worstRating: 1
  };
}

function coCauTruc() {
  const hoi = layHoi();
  const vs = G.GT_VISAO || {};
  const moTa = String(G.GT_MOT_CAU || vs.canh || '').slice(0, 300);

  const toChuc = {
    '@type': 'EducationalOrganization',
    '@id': GOCURL + '/#hocvien',
    name: 'Học viện GITA',
    alternateName: 'GITA 365',
    url: GOCURL + '/',
    description: moTa,
    inLanguage: 'vi-VN',
    telephone: '+84-28-5555-4688',
    areaServed: { '@type': 'Country', name: 'Việt Nam' },
    founder: { '@id': GOCURL + '/#nguoisanglap' },
    sameAs: ds(G.KENH_DS).map(k => k.url).filter(Boolean)
      .concat(['https://truongnhatquang.com'])
  };
  const dg = danhGiaThat();
  if (dg) toChuc.aggregateRating = dg;

  const nguoi = {
    '@type': 'Person',
    '@id': GOCURL + '/#nguoisanglap',
    name: 'Trương Nhật Quang',
    jobTitle: 'Người sáng lập Học viện GITA',
    url: 'https://truongnhatquang.com',
    worksFor: { '@id': GOCURL + '/#hocvien' },
    knowsAbout: ['Giáo dục gia đình', 'Huấn luyện phụ huynh',
      'Thói quen học tập', 'Phát triển năng lực học sinh']
  };

  const trang = {
    '@type': 'WebSite',
    '@id': GOCURL + '/#trang',
    url: GOCURL + '/',
    name: 'GITA 365 — Hệ sinh thái Gia đình Thịnh vượng',
    inLanguage: 'vi-VN',
    publisher: { '@id': GOCURL + '/#hocvien' }
  };

  const g = [toChuc, nguoi, trang];

  if (hoi.length)
    g.push({
      '@type': 'FAQPage',
      '@id': GOCURL + '/#hoidap',
      mainEntity: hoi.map(q => ({
        '@type': 'Question', name: q.h,
        acceptedAnswer: { '@type': 'Answer', text: q.d }
      }))
    });

  return JSON.stringify({ '@context': 'https://schema.org', '@graph': g }, null, 1);
}

/* ═══════════════════════════════════════════════════════════════
   3 · THẺ ĐẦU TRANG
   ═══════════════════════════════════════════════════════════════ */
function theDau() {
  const moTa = String(G.GT_MOT_CAU || '').slice(0, 155);
  return [
    '<link rel="canonical" href="' + GOCURL + '/">',
    '<meta property="og:type" content="website">',
    '<meta property="og:site_name" content="GITA 365 — Học viện GITA">',
    '<meta property="og:locale" content="vi_VN">',
    '<meta property="og:url" content="' + GOCURL + '/">',
    '<meta property="og:title" content="GITA 365 — Hệ sinh thái Gia đình Thịnh vượng">',
    '<meta property="og:description" content="' + h(moTa) + '">',
    '<meta property="og:image" content="' + GOCURL + '/assets/icons/chia-se-1200x630.png">',
    '<meta property="og:image:width" content="1200">',
    '<meta property="og:image:height" content="630">',
    '<meta name="twitter:card" content="summary_large_image">',
    '<meta name="twitter:title" content="GITA 365 — Hệ sinh thái Gia đình Thịnh vượng">',
    '<meta name="twitter:description" content="' + h(moTa) + '">',
    '<meta name="twitter:image" content="' + GOCURL + '/assets/icons/chia-se-1200x630.png">',
    '<meta name="author" content="Trương Nhật Quang — Học viện GITA">',
    '<link rel="alternate" hreflang="vi" href="' + GOCURL + '/">',
    '<link rel="alternate" hreflang="x-default" href="' + GOCURL + '/">',
    '<script type="application/ld+json">' + coCauTruc() + '<\/script>'
  ].join('\n');
}

/* ═══════════════════════════════════════════════════════════════
   4 · GHI VÀO index.html — giữa hai mốc, để chạy lại được nhiều lần
   ═══════════════════════════════════════════════════════════════ */
const M1 = '<!-- SEO:DAU -->', M2 = '<!-- /SEO:DAU -->';
const T1 = '<!-- SEO:THAN -->', T2 = '<!-- /SEO:THAN -->';

function thayGiuaMoc(s, m1, m2, moi, sauKhi) {
  const i = s.indexOf(m1), j = s.indexOf(m2);
  if (i >= 0 && j > i) return s.slice(0, i) + m1 + '\n' + moi + '\n' + s.slice(j);
  const k = s.indexOf(sauKhi);
  if (k < 0) throw new Error('Không tìm được chỗ chèn: ' + sauKhi);
  let cuoi = k + sauKhi.length;
  /* ── CHÈN GIỮA MỘT THẺ LÀ CẮT ĐÔI THẺ ẤY ──

     Mốc chèn là '<meta name="rights"' — một ĐOẠN ĐẦU của thẻ, không
     phải cả thẻ. Lần chạy đầu tiên khối SEO được nhét vào ngay sau
     đoạn ấy, nên thẻ bị cắt làm đôi: nửa đầu nằm trên khối SEO, còn
     nửa sau — content="..."> — rơi xuống dưới khối và trình duyệt đọc
     nó như CHỮ THƯỜNG.

     Hậu quả: dòng khai quyền sở hữu trí tuệ của Học viện hiện ra thành
     chữ ở đầu mọi trang, và chính thẻ khai ấy thì không còn tồn tại.
     Nó sống như thế qua rất nhiều bản, vì trên màn để bàn nó nằm khuất
     sau thanh trên; chỉ khi chụp màn điện thoại ở bản 9.99.51 mới thấy.

     Từ nay mốc chèn nào không kết thúc bằng '>' thì nhích tới hết thẻ
     trước khi chèn. Một bộ sinh mã tự cắt đôi thẻ là lớp hỏng tệ nhất:
     nó không báo gì, và nó lặp lại mỗi lần chạy. */
  if (!sauKhi.trim().endsWith('>')) {
    const dong = s.indexOf('>', cuoi);
    if (dong < 0) throw new Error('Mốc chèn nằm giữa một thẻ chưa đóng: ' + sauKhi);
    cuoi = dong + 1;
  }
  return s.slice(0, cuoi) + '\n' + m1 + '\n' + moi + '\n' + m2 + s.slice(cuoi);
}

/* ═══════════════════════════════════════════════════════════════
   5 · robots.txt — cho máy tìm kiếm, chặn máy huấn luyện AI
   ═══════════════════════════════════════════════════════════════ */
const AI_CHAN = ['GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'anthropic-ai',
  'Claude-Web', 'Google-Extended', 'CCBot', 'PerplexityBot', 'Bytespider', 'Amazonbot',
  'FacebookBot', 'Meta-ExternalAgent', 'Applebot-Extended', 'cohere-ai', 'Diffbot',
  'Omgilibot', 'ImagesiftBot', 'Timpibot', 'YouBot'];

fs.writeFileSync(path.join(GOC, 'robots.txt'),
  '# GITA 365 — Học viện GITA\n' +
  '# Nội dung chuyên môn là tài sản độc quyền. Xem LICENSE.\n' +
  '# Liên hệ cấp phép: truongnhatquang.com\n' +
  '#\n' +
  '# Hai đường khác nhau, hai chính sách khác nhau:\n' +
  '#   · Máy tìm kiếm  → CHO đọc phần giới thiệu công khai\n' +
  '#   · Máy huấn luyện AI → CHẶN, không ngoại lệ\n' +
  '# Chặn Google-Extended KHÔNG hạ thứ hạng tìm kiếm: Googlebot và\n' +
  '# Google-Extended là hai trình thu thập riêng biệt.\n' +
  '\n' +
  'User-agent: *\n' +
  'Allow: /$\n' +
  'Allow: /assets/\n' +
  'Allow: /manifest.webmanifest\n' +
  '# Kho tri thức đã mã hoá — không đường nào vào, kể cả để đọc tên tệp\n' +
  'Disallow: /kho/\n' +
  'Disallow: /giay-phep/\n' +
  'Disallow: /desktop/\n' +
  'Disallow: /tools/\n' +
  'Disallow: /*.enc$\n' +
  'Disallow: /*.json$\n' +
  '\n' +
  AI_CHAN.map(b => 'User-agent: ' + b + '\nDisallow: /').join('\n\n') + '\n' +
  '\nSitemap: ' + GOCURL + '/sitemap.xml\n');

/* ═══════════════════════════════════════════════════════════════
   6 · sitemap.xml
   Ứng dụng dùng định tuyến bằng dấu #, nên với máy tìm kiếm cả ứng
   dụng chỉ là MỘT địa chỉ. Khai đúng một địa chỉ ấy. Khai thêm địa
   chỉ có # là khai địa chỉ không tồn tại.
   ═══════════════════════════════════════════════════════════════ */
const ngay = new Date().toISOString().slice(0, 10);
fs.writeFileSync(path.join(GOC, 'sitemap.xml'),
  '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  '  <url>\n' +
  '    <loc>' + GOCURL + '/</loc>\n' +
  '    <lastmod>' + ngay + '</lastmod>\n' +
  '    <changefreq>weekly</changefreq>\n' +
  '    <priority>1.0</priority>\n' +
  '  </url>\n' +
  '</urlset>\n');

/* GitHub Pages: không có tệp này thì Jekyll nuốt thư mục bắt đầu bằng _ */
fs.writeFileSync(path.join(GOC, '.nojekyll'), '');

/* ═══════════════════════════════════════════════════════════════
   6b · TRANG CON — MỖI TRUY VẤN MỘT ĐỊA CHỈ

   Một địa chỉ không xếp hạng được cho nhiều truy vấn khác nhau. Người
   tìm "mô thức huấn luyện GITA" và người tìm "con không chịu học phải
   làm sao" cần hai trang khác nhau, mỗi trang trả lời trọn một câu.

   Năm trang dưới đây KHÔNG phải trang mồi: mỗi trang mang phần nội
   dung sâu của riêng nó, còn trang chủ chỉ giữ phần tóm và dẫn sang.
   Nội dung trùng nhau giữa các trang là thứ Google hạ hạng, nên phần
   nào đã sâu ở trang con thì trang chủ chỉ nhắc tên.

   Trang con là HTML tĩnh, không cần JavaScript, không gọi tài nguyên
   ngoài — mở gần như tức thì, kể cả trên 3G.
   ═══════════════════════════════════════════════════════════════ */
const KIEU = 'body{margin:0;background:#070510;color:#C9C5DC;' +
  'font:15px/1.8 "Be Vietnam Pro",-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}' +
  '.w{max-width:820px;margin:0 auto;padding:34px 22px 80px}' +
  'header nav{font-size:13px;opacity:.75;margin-bottom:26px}' +
  'header nav a{color:#F0B429;text-decoration:none;margin-right:14px}' +
  'h1{font-size:clamp(27px,5vw,40px);line-height:1.22;margin:0 0 16px;color:#F2F0FA;letter-spacing:-.01em}' +
  'h2{font-size:clamp(19px,3.4vw,26px);line-height:1.3;margin:40px 0 10px;color:#F0B429}' +
  'h3{font-size:17px;margin:26px 0 6px;color:#F2F0FA}' +
  'p{margin:0 0 12px}ul,ol{margin:0 0 14px;padding-left:22px}li{margin:0 0 7px}' +
  'dt{margin:16px 0 4px;color:#F2F0FA;font-weight:600}dd{margin:0 0 10px;padding-left:0}' +
  'strong{color:#F2F0FA}a{color:#F0B429}small{opacity:.7}' +
  '.lead{font-size:17px;color:#E4E1F0}' +
  '.box{border:1px solid #241D3E;border-left:3px solid #F0B429;border-radius:12px;padding:16px 18px;margin:22px 0}' +
  'footer{margin-top:56px;padding-top:22px;border-top:1px solid #241D3E;font-size:13px;opacity:.8}';

const TRANG = [
  { tep:'mo-thuc-huan-luyen-gita.html',
    ten:'Mô thức huấn luyện GITA',
    tieu:'Mô thức huấn luyện GITA — Goal, Inspirits, Talent, Action',
    moTa:'Bốn trụ G · I · T · A của Học viện GITA: hệ thống mục tiêu, nội lực, tài năng và hành động. ' +
         'Cách một gia đình dùng bốn trụ này để con học tốt mà không cần ai canh.',
    dan:'Bốn trụ dẫn dắt toàn bộ chương trình. Đây là phần trả lời câu hỏi "GITA dạy theo cách nào".',
    phan:['mo-thuc-gita','bon-tru'] },

  { tep:'nam-tang-dong-hanh.html',
    ten:'Năm tầng đồng hành',
    tieu:'Năm tầng đồng hành cùng gia đình — GITA 365',
    moTa:'Năm tầng của GITA 365: mỗi tầng có việc riêng, mốc hoàn thành riêng, và điều gia đình ' +
         'mất nếu bỏ qua tầng đó. Kèm mục tiêu và cách đo từng chặng.',
    dan:'Mỗi tầng có việc riêng, mốc hoàn thành riêng, và cái mất nếu bỏ qua.',
    phan:['nam-tang','muc-tieu'] },

  { tep:'hanh-trinh-12-chang.html',
    ten:'Hành trình 12 chặng',
    tieu:'Hành trình 12 chặng của một gia đình trong 365 ngày',
    moTa:'Mười hai chặng của một năm cùng GITA 365: mỗi chặng có việc làm được, mốc biết mình đã ' +
         'qua, và dấu hiệu biết mình chưa qua. Lộ trình đầy đủ từ ngày 0 tới ngày 365.',
    dan:'Chặng nào cũng có việc làm được, mốc biết mình đã qua, và dấu hiệu biết mình chưa qua.',
    phan:['muoi-hai-chang'] },

  { tep:'duong-vao.html',
    ten:'Đường vào sáu bước',
    tieu:'Đường vào GITA 365 — sáu bước từ lúc nghe tới lúc bắt đầu',
    moTa:'Sáu bước để một gia đình bắt đầu với GITA 365: mỗi bước ghi rõ mất bao lâu, làm gì, ' +
         'xong khi nào và chỗ hay tắc nhất.',
    dan:'Sáu bước, mỗi bước ghi rõ mất bao lâu và xong khi nào.',
    phan:['duong-vao'] },

  { tep:'cau-hoi-thuong-gap.html',
    ten:'Câu hỏi thường gặp',
    tieu:'Câu hỏi phụ huynh hay hỏi nhất về GITA 365',
    moTa:'Nhà tôi bận có theo nổi không? Con không hợp tác thì sao? Bao lâu thấy kết quả? ' +
         'Câu trả lời thẳng cho những câu phụ huynh hỏi nhiều nhất.',
    dan:'Trả lời thẳng, kể cả những câu Học viện không có lợi khi trả lời thật.',
    phan:['cau-hoi'] }
];

/* Cắt đúng một <section id="..."> ra khỏi khung trang chủ */
function catPhan(khung, id) {
  const d = khung.indexOf('<section id="' + id + '">');
  if (d < 0) return '';
  const c = khung.indexOf('</section>', d);
  return c < 0 ? '' : khung.slice(d, c + 10);
}

function dieuHuong(tepDang) {
  return '<nav aria-label="Đường dẫn"><a href="/">Trang chủ</a>' +
    TRANG.filter(t => t.tep !== tepDang).map(t =>
      '<a href="/' + t.tep + '">' + h(t.ten) + '</a>').join('') + '</nav>';
}

function chanTrang() {
  return '<footer>\n<p><strong>Học viện GITA</strong> — Trương Nhật Quang sáng lập và trực tiếp ' +
    'biên soạn mô thức huấn luyện GITA.</p>\n' +
    '<p>Hotline <a href="tel:+842855554688">08.5555.4688</a> · ' +
    '<a href="https://truongnhatquang.com" rel="noopener">truongnhatquang.com</a> · ' +
    '<a href="' + GOCURL + '/">Mở ứng dụng GITA 365</a></p>\n' +
    '<p><small>© ' + new Date().getFullYear() + ' Học viện GITA. Nội dung chuyên môn là tài sản ' +
    'độc quyền, được mã hoá và chỉ mở cho tài khoản được cấp phép.</small></p>\n</footer>';
}

function duongDan(t) {
  return {
    '@type':'BreadcrumbList',
    itemListElement:[
      {'@type':'ListItem', position:1, name:'Trang chủ', item:GOCURL + '/'},
      {'@type':'ListItem', position:2, name:t.ten, item:GOCURL + '/' + t.tep}
    ]
  };
}

function dungTrangCon(khung) {
  const hoi = layHoi();
  let n = 0;
  for (const t of TRANG) {
    const than = t.phan.map(id => catPhan(khung, id)).filter(Boolean).join('\n');
    if (!than) { console.log('  ⚠ bỏ qua ' + t.tep + ' — không cắt được phần nào'); continue; }

    const g = [duongDan(t), { '@type':'WebPage', '@id':GOCURL + '/' + t.tep,
      url:GOCURL + '/' + t.tep, name:t.tieu, description:t.moTa, inLanguage:'vi-VN',
      isPartOf:{ '@id':GOCURL + '/#trang' }, publisher:{ '@id':GOCURL + '/#hocvien' } }];

    /* Trang hỏi–đáp mang dữ liệu FAQ; trang đường vào mang dữ liệu HowTo.
       Hai loại này chiếm được ô kết quả mở rộng trên Google, thứ mà một
       đoạn văn thường không chiếm được. */
    if (t.tep === 'cau-hoi-thuong-gap.html' && hoi.length)
      g.push({ '@type':'FAQPage', mainEntity: hoi.map(q => ({
        '@type':'Question', name:q.h,
        acceptedAnswer:{ '@type':'Answer', text:q.d } })) });

    if (t.tep === 'duong-vao.html' && ds(G.DV_BUOC).length)
      g.push({ '@type':'HowTo', name:'Đường vào GITA 365 — sáu bước',
        description:t.moTa,
        step: ds(G.DV_BUOC).map((x, i) => ({
          '@type':'HowToStep', position:i + 1, name:String(x.ten || ''),
          text:String(x.lam || x.ai || '') })) });

    const html =
      '<!doctype html>\n<html lang="vi">\n<head>\n<meta charset="UTF-8">\n' +
      '<meta name="viewport" content="width=device-width, initial-scale=1">\n' +
      '<title>' + h(t.tieu) + '</title>\n' +
      '<meta name="description" content="' + h(t.moTa) + '">\n' +
      '<link rel="canonical" href="' + GOCURL + '/' + t.tep + '">\n' +
      '<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">\n' +
      '<meta name="author" content="Trương Nhật Quang — Học viện GITA">\n' +
      '<meta property="og:type" content="article">\n' +
      '<meta property="og:site_name" content="GITA 365 — Học viện GITA">\n' +
      '<meta property="og:locale" content="vi_VN">\n' +
      '<meta property="og:url" content="' + GOCURL + '/' + t.tep + '">\n' +
      '<meta property="og:title" content="' + h(t.tieu) + '">\n' +
      '<meta property="og:description" content="' + h(t.moTa) + '">\n' +
      '<meta property="og:image" content="' + GOCURL + '/assets/icons/chia-se-1200x630.png">\n' +
      '<meta name="twitter:card" content="summary_large_image">\n' +
      '<link rel="icon" href="/assets/icons/icon-192.png">\n' +
      '<style>' + KIEU + '</style>\n' +
      '<script type="application/ld+json">' +
      JSON.stringify({ '@context':'https://schema.org', '@graph':g }) + '<\/script>\n' +
      '</head>\n<body>\n<div class="w">\n<header>' + dieuHuong(t.tep) + '</header>\n' +
      '<h1>' + h(t.tieu) + '</h1>\n<p class="lead">' + h(t.dan) + '</p>\n' +
      than + '\n' +
      '<div class="box"><p><strong>Muốn đi thử một chặng?</strong> Ứng dụng GITA 365 mở phần giới ' +
      'thiệu và bản đồ cho mọi người, chưa cần là khách hàng.</p>' +
      '<p><a href="' + GOCURL + '/">Mở ứng dụng GITA 365 →</a></p></div>\n' +
      chanTrang() + '\n</div>\n</body>\n</html>\n';

    fs.writeFileSync(path.join(GOC, t.tep), html);
    n++;
  }
  return n;
}

const khungChu = than();
const soTrangCon = dungTrangCon(khungChu);

/* ── Trang chủ KHÔNG được lặp lại phần đã sâu ở trang con ──
   Nội dung giống nhau trên hai địa chỉ là thứ Google hạ hạng cả hai:
   nó không biết nên xếp cái nào, nên xếp thấp cả đôi. Phần nào đã có
   trang riêng thì trang chủ chỉ giữ một dòng dẫn sang.

   Phần ở lại trang chủ là phần KHÔNG trang con nào mang: lời mở, bốn
   lời hứa, sáu điều không làm, các vai trong nhà, cộng đồng, và ai
   đứng sau. Đó cũng đúng là thứ người vừa nghe tên Học viện cần đọc
   trước tiên. */
function thanTrangChu(khung) {
  let o = khung;
  const dan = [];
  for (const t of TRANG)
    for (const id of t.phan) {
      const p = catPhan(khung, id);
      if (!p) continue;
      o = o.replace(p, '');
      if (dan.indexOf(t.tep) < 0) dan.push(t.tep);
    }
  const the = TRANG.filter(t => dan.indexOf(t.tep) >= 0).map(t =>
    '\n<li><a href="/' + t.tep + '"><strong>' + h(t.ten) + '</strong></a> — ' + h(t.dan) + '</li>'
  ).join('');
  const chen = '\n<section id="doc-tiep">\n<h2>Đọc sâu từng phần</h2>\n' +
    '<p>Mỗi phần dưới đây có một trang riêng, viết đủ để dùng được ngay.</p>\n<ul>' +
    the + '\n</ul>\n</section>\n';
  /* Chèn ngay trước mục "Ai đứng sau" để phần tin cậy vẫn đứng cuối */
  const d = o.indexOf('<section id="ai-dung-sau">');
  return d < 0 ? o + chen : o.slice(0, d) + chen + o.slice(d);
}

const tepIndex = path.join(GOC, 'index.html');
let html = fs.readFileSync(tepIndex, 'utf8');

/* Cho phép lập chỉ mục. Đây là dòng đã CHẶN Google suốt các bản trước. */
html = html.replace(
  /<meta name="robots"[^>]*>/,
  '<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">');
html = html.replace(
  /<meta name="googlebot"[^>]*>/,
  '<meta name="googlebot" content="index, follow">');

html = thayGiuaMoc(html, M1, M2, theDau(), '<meta name="rights"');
html = thayGiuaMoc(html, T1, T2, thanTrangChu(khungChu), '<div id="app">');
fs.writeFileSync(tepIndex, html);


/* Sitemap dựng lại cho đủ mọi địa chỉ */
fs.writeFileSync(path.join(GOC, 'sitemap.xml'),
  '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  ['/'].concat(TRANG.map(t => '/' + t.tep)).map((u, i) =>
    '  <url>\n    <loc>' + GOCURL + u + '</loc>\n' +
    '    <lastmod>' + ngay + '</lastmod>\n' +
    '    <changefreq>' + (i ? 'monthly' : 'weekly') + '</changefreq>\n' +
    '    <priority>' + (i ? '0.8' : '1.0') + '</priority>\n  </url>').join('\n') +
  '\n</urlset>\n');

/* ═══════════════════════════════════════════════════════════════
   7 · Báo số
   ═══════════════════════════════════════════════════════════════ */
const chu = thanTrangChu(khungChu).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
console.log('Chữ máy tìm kiếm đọc được: 77 → ' + chu.length.toLocaleString('vi-VN') + ' ký tự');
console.log('Câu hỏi — đáp có cấu trúc: ' + layHoi().length);
console.log('robots.txt: cho máy tìm kiếm · chặn ' + AI_CHAN.length + ' máy huấn luyện AI');
console.log('Trang con dựng ra: ' + soTrangCon + ' (mỗi trang một truy vấn riêng)');
console.log('Đánh giá thật trong kho: ' + (danhGiaThat() ? danhGiaThat().reviewCount : 0) +
  ' — chưa có thì KHÔNG phát AggregateRating');
