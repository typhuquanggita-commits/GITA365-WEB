/**
 * ═══════════════════════════════════════════════════════════════
 * GITA 365 — BẢN WEB PHỤC VỤ THẲNG TỪ APPS SCRIPT
 *
 * Bình thường bản web nằm ở một chỗ khác (GitHub Pages, hoặc gita.edu.vn)
 * và chỉ gọi về đây để xin khoá. Nhưng như vậy phải dựng thêm một chỗ nữa,
 * phải mua tên miền, và bản web nằm ngoài tay Học viện.
 *
 * Tệp này bỏ được bước đó: chính dự án Apps Script phục vụ luôn bản web.
 * Địa chỉ /exec vừa là máy chủ vừa là trang. Không thuê hosting, không tên
 * miền, không kho mã công khai — mọi thứ nằm trong Drive của Học viện.
 *
 * ── CẦN CHUẨN BỊ GÌ ──
 * Trong thư mục "Bản web GITA365" trên Drive, đặt:
 *     GITA365.html      vỏ ứng dụng, một tệp duy nhất
 *     nen.enc  nghe.enc  tang1.enc … tang5.enc      bảy gói kho
 *     mau.json          dữ liệu mẫu cho chế độ chưa cấp phép
 *
 * Bảy tệp .enc đã mã hoá AES-256-GCM. Đặt chúng ở đâu cũng được — không có
 * khoá thì chúng là một đống byte vô nghĩa. Khoá vẫn do doPost cấp, sau khi
 * đăng nhập, theo đúng vai và tầng.
 *
 * ── APPS SCRIPT CHỈ CHO MỘT doGet ──
 * Nên doGet ở đây là bộ định tuyến duy nhất của cả dự án:
 *     /exec                 → bản web
 *     /exec?viec=trangthai  → JSON tình trạng máy chủ
 *     /exec?goi=nghe        → một gói kho, dạng base64
 * ═══════════════════════════════════════════════════════════════
 */

/** Thư mục chứa bản web. Để trống thì dùng chung thư mục mã. */
var GITA_THU_MUC_WEB = '';

/** Tên tệp vỏ ứng dụng trong thư mục đó. */
var GITA_TEP_WEB = 'GITA365.html';

function gitaThuMucWeb_() {
  return GITA_THU_MUC_WEB || GITA_THU_MUC_MA;
}

/** Tìm một tệp theo tên trong thư mục bản web. Trả null nếu không có. */
function gitaTimTep_(ten) {
  var tm;
  try { tm = DriveApp.getFolderById(gitaThuMucWeb_()); } catch (e) { return null; }
  var ds = tm.getFilesByName(ten);
  return ds.hasNext() ? ds.next() : null;
}

/* ═══════════════ BỘ ĐỊNH TUYẾN ═══════════════ */
function doGet(e) {
  var t = (e && e.parameter) || {};

  if (t.viec === 'trangthai') return gitaTrangThai_();
  if (t.goi) return gitaTraGoi_(String(t.goi));
  /* ?dangnhap=1 — bỏ phiên đang nhớ và ra thẳng màn đăng nhập.
     Bản Apps Script chạy trong khung sandbox, nên gõ #dangnhap vào thanh
     địa chỉ không chạm tới được trang bên trong. Phải có đường qua máy chủ. */
  return gitaTrangWeb_(!!(t.dangnhap || t.dangxuat));
}

/* ═══════════════ TRẢ BẢN WEB ═══════════════ */
function gitaTrangWeb_(raNgoai) {
  var tep = gitaTimTep_(GITA_TEP_WEB);
  if (!tep) return HtmlService.createHtmlOutput(gitaTrangHuongDan_())
    .setTitle('GITA 365 — chưa đặt bản web');

  var html = tep.getBlob().getDataAsString('UTF-8');

  /* Nối bản web với chính máy chủ này. Hai dòng dưới đây thay cho việc phải
     sửa cau-hinh.js bằng tay: trang biết địa chỉ máy chủ, và biết lấy kho
     qua đường nào. */
  var diaChi = ScriptApp.getService().getUrl();
  var tiem = '<script>' +
    'window.G = window.G || {};' +
    'window.G.API_CAP_PHEP = ' + JSON.stringify(diaChi) + ';' +
    'window.GITA_NGUON_KHO = ' + JSON.stringify(diaChi + '?goi=') + ';' +
    'window.GITA_CUA_DANG_NHAP = ' + JSON.stringify(diaChi + '?dangnhap=1') + ';' +
    (raNgoai ? 'window.GITA_RA_NGOAI = true;' : '') +
    '</script>';

  /* Chèn ngay sau <head> nếu có, không thì lên đầu tệp. */
  var i = html.toLowerCase().indexOf('<head>');
  html = (i >= 0) ? html.slice(0, i + 6) + tiem + html.slice(i + 6) : tiem + html;

  return HtmlService.createHtmlOutput(html)
    .setTitle('GITA 365 — Hệ Sinh Thái Gia Đình Thịnh Vượng')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/* ═══════════════ TRẢ MỘT GÓI KHO ═══════════════
   Gói đã mã hoá sẵn, nên đường này không cần phiên: không có khoá thì tệp
   là một đống byte vô nghĩa. Vẫn chỉ nhận đúng bảy tên gói, để không ai
   dùng tham số này đọc tệp khác trong Drive. */
var GITA_GOI_HOP_LE = ['nen', 'nghe', 'tang1', 'tang2', 'tang3', 'tang4', 'tang5'];

function gitaTraGoi_(ten) {
  var json = function (o) {
    return ContentService.createTextOutput(JSON.stringify(o))
      .setMimeType(ContentService.MimeType.JSON);
  };

  if (ten === 'mau') {
    var tm = gitaTimTep_('mau.json');
    if (!tm) return json({ok: false, error: 'Chưa đặt mau.json trong thư mục bản web.'});
    return ContentService.createTextOutput(tm.getBlob().getDataAsString('UTF-8'))
      .setMimeType(ContentService.MimeType.JSON);
  }

  if (GITA_GOI_HOP_LE.indexOf(ten) < 0)
    return json({ok: false, error: 'Không có gói tên này.'});

  var tep = gitaTimTep_(ten + '.enc');
  if (!tep) return json({ok: false, error: 'Chưa đặt ' + ten + '.enc trong thư mục bản web.'});

  /* base64 vì ContentService chỉ trả được chữ, không trả được byte thô.
     Trình duyệt giải ngược lại trước khi đưa vào WebCrypto. */
  return json({ok: true, goi: ten, du: Utilities.base64Encode(tep.getBlob().getBytes())});
}

/* ═══════════════ TRANG KHI CHƯA ĐẶT BẢN WEB ═══════════════
   Không để trắng màn hình. Nói thẳng còn thiếu gì và lấy ở đâu. */
function gitaTrangHuongDan_() {
  var tm = '';
  try { tm = DriveApp.getFolderById(gitaThuMucWeb_()).getName(); } catch (e) { tm = '(không mở được)'; }

  var co = [], thieu = [];
  ['GITA365.html', 'mau.json'].concat(GITA_GOI_HOP_LE.map(function (g) { return g + '.enc'; }))
    .forEach(function (t) { (gitaTimTep_(t) ? co : thieu).push(t); });

  return '<!doctype html><meta charset="utf-8">' +
    '<style>body{font:15px/1.7 system-ui,sans-serif;max-width:640px;margin:48px auto;padding:0 20px;' +
    'color:#1a1a2e;background:#F6F3FC}h1{font-size:22px;color:#185AB4;margin-bottom:4px}' +
    'code{background:#fff;padding:2px 6px;border-radius:4px;font-size:13px}' +
    'li{margin:4px 0}.x{color:#BE0E16}.v{color:#0B7350}</style>' +
    '<h1>GITA 365 — máy chủ đã chạy, bản web chưa đặt</h1>' +
    '<p>Máy chủ sống và trả lời được. Còn thiếu các tệp của bản web trong thư mục ' +
    '<b>' + tm + '</b>.</p>' +
    '<h3>Đã có (' + co.length + ')</h3><ul>' +
    (co.length ? co.map(function (t) { return '<li class="v">✓ <code>' + t + '</code></li>'; }).join('')
               : '<li>chưa có tệp nào</li>') +
    '</ul><h3>Còn thiếu (' + thieu.length + ')</h3><ul>' +
    thieu.map(function (t) { return '<li class="x">✕ <code>' + t + '</code></li>'; }).join('') +
    '</ul><p>Tải cả bộ từ kho mã của Học viện, rồi kéo thả vào thư mục trên. ' +
    'Xong thì tải lại trang này.</p>' +
    '<p style="color:#666;font-size:13px">Máy chủ vẫn dùng được ngay cả khi chưa đặt bản web — ' +
    'bản web ở chỗ khác vẫn gọi về địa chỉ này xin khoá như thường.</p>';
}
