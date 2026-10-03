/* ═══════════════════════════════════════════════════════════════
   GITA 365 — LÁ CHẮN 30 TẦNG (15 BẢO MẬT + 15 PHÒNG VỆ)

   Chủ hệ: "hệ thống bảo mật cao cấp 15 tầng + 15 tầng phòng vệ, kín kẽ
   từng chi tiết, không lỗi, không lỗ hổng."

   ══ NÓI THẬT TRƯỚC ══
   Không hệ thống nào chứng minh được "không có lỗ hổng". Điều làm được:
   mỗi tầng TRỎ vào mã đang chạy, và CI (tools/do-16-he.js) đo từng con
   trỏ trên mỗi PR — tầng nào bị gỡ mất là CI đỏ. Bảng này không khai
   tầng nào chưa có mã: chỗ còn trống ghi ở LC_KHOANG_TRONG.

   BM = BẢO MẬT (ngăn trước: ai được vào, dữ liệu được khoá thế nào).
   PV = PHÒNG VỆ (khi bị tấn công/sự cố: chặn, khoanh, ghi, phục hồi).

   Con trỏ: v:/g: đo sống trên máy · f: tên cửa trong worker.js ·
   d:/t: tệp tồn tại · m:tệp#chuỗi tệp chứa đúng chuỗi ấy (CI đo).
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;
G.VIEWS = G.VIEWS || {};

(function () {
var U = G.U, h = U.h, ic = U.ic;

G.LC_TANG = [
  /* ── 15 TẦNG BẢO MẬT ── */
  { ma: 'BM01', nhom: 'BM', ten: 'Biên mạng & HTTPS bắt buộc', lo: 'Nghe lén, hạ cấp HTTP, nhúng khung (clickjacking)',
    tro: ['m:_headers#Strict-Transport-Security', 'm:_headers#X-Frame-Options'], gioiHan: 'TLS do Cloudflare cấp; HSTS preload cần đăng ký tên miền riêng.' },
  { ma: 'BM02', nhom: 'BM', ten: 'Chính sách nội dung (CSP) · nosniff · no-store', lo: 'Chèn mã (XSS), đoán kiểu tệp, bộ đệm trung gian giữ dữ liệu',
    tro: ['m:index.html#Content-Security-Policy', 'm:may-chu/worker.js#X-Content-Type-Options', 'm:may-chu/worker.js#no-store'], gioiHan: 'CSP qua thẻ meta không chặn được frame-ancestors — bù bằng X-Frame-Options (BM01).' },
  { ma: 'BM03', nhom: 'BM', ten: 'CORS theo danh sách trắng', lo: 'Trang lạ gọi máy chủ bằng phiên người dùng',
    tro: ['f:dsOriginWeb', 't:tools/thu-cors.mjs'], gioiHan: 'Biến GITA_DIA_CHI_WEB trống thì mở * — chỉ dùng khi thử.' },
  { ma: 'BM04', nhom: 'BM', ten: 'Mật khẩu băm PBKDF2 · so sánh hằng thời gian · chặn mật khẩu yếu', lo: 'Lộ CSDL thành lộ mật khẩu; dò theo thời gian phản hồi',
    tro: ['m:may-chu/nen.js#PBKDF2', 'm:may-chu/nen.js#soSanhAnToan', 'm:may-chu/nen.js#mkQuaDeDoan'], gioiHan: 'Workers giới hạn số vòng PBKDF2 ≤ 100.000.' },
  { ma: 'BM05', nhom: 'BM', ten: 'Phiên có hạn & mã ngẫu nhiên an toàn', lo: 'Chiếm phiên, đoán token',
    tro: ['m:may-chu/nen.js#kiemPhien', 'm:may-chu/nen.js#tokenMoi'], gioiHan: 'Thu hồi phiên tức thì phụ thuộc lượt đọc D1.' },
  { ma: 'BM06', nhom: 'BM', ten: 'Xác minh OTP khi đăng ký & đặt lại mật khẩu', lo: 'Tạo tài khoản ảo, chiếm tài khoản qua quên mật khẩu',
    tro: ['f:xacThucOtp', 'f:datLaiMatKhau'], gioiHan: 'Kênh gửi OTP (email/SMS) nằm ngoài GITA.' },
  { ma: 'BM07', nhom: 'BM', ten: 'Sinh trắc học WebAuthn (passkey)', lo: 'Lừa đảo lấy mật khẩu (phishing)',
    tro: ['d:may-chu/sinh-trac.js'], gioiHan: 'Tuỳ thiết bị/trình duyệt có hỗ trợ.' },
  { ma: 'BM08', nhom: 'BM', ten: 'Phân quyền theo vai trò R01–R20 · cửa bắt buộc phiên', lo: 'Leo thang đặc quyền, gọi cửa không đăng nhập',
    tro: ['m:may-chu/vai-tro.js#laR01', 'm:may-chu/worker.js#CAN_PHIEN'], gioiHan: 'Vai trò do người cấp — cấp sai là sai.' },
  { ma: 'BM09', nhom: 'BM', ten: 'Quyền xem từng phần · quyền năng AI từng Agent', lo: 'Xem quá phạm vi, Agent làm quá việc',
    tro: ['d:may-chu/quyen-xem.js', 'm:may-chu/quyen-nang-ai.js#aiCoQuyen'], gioiHan: 'Ma trận quyền cần soát định kỳ (offboard khi nghỉ việc).' },
  { ma: 'BM10', nhom: 'BM', ten: 'Mã hoá đầu cuối AES-GCM trên máy khách', lo: 'Lộ kho dữ liệu trên máy chủ/R2',
    tro: ['m:src/kho-khoa.js#AES-GCM', 'd:tools/ma-hoa-kho.js'], gioiHan: 'Máy chủ không tìm kiếm được nội dung đã mã hoá — tìm trên máy khách.' },
  { ma: 'BM11', nhom: 'BM', ten: 'Chữ ký HMAC cho chứng cứ & giao dịch ngân hàng', lo: 'Giả mạo chứng cứ, giả thông báo chuyển khoản',
    tro: ['m:may-chu/chung-cu.js#kyChungCu', 'm:may-chu/ngan-hang.js#soSanhAnToan'], gioiHan: 'An toàn bằng độ bí mật của khoá HMAC.' },
  { ma: 'BM12', nhom: 'BM', ten: 'Chống SSRF: cổng ngoài cố định, cấm chuyển hướng', lo: 'Lừa máy chủ gọi địa chỉ nội bộ/tuỳ ý',
    tro: ["m:may-chu/bo-nao-da-tri.js#redirect: 'error'", "m:may-chu/phim-ai.js#redirect: 'error'"], gioiHan: 'Mọi cửa gọi ra ngoài mới phải giữ cùng luật — người duyệt PR soát.' },
  { ma: 'BM13', nhom: 'BM', ten: 'Soát bí mật trong mã nguồn (CI)', lo: 'Khoá API bị commit lên GitHub',
    tro: ['t:tools/soat-bi-mat.js', 'm:.github/workflows/kiem-tra.yml#soat-bi-mat'], gioiHan: 'Dò theo dáng khoá đã biết; khoá dạng lạ có thể lọt — bật thêm GitHub secret scanning.' },
  { ma: 'BM14', nhom: 'BM', ten: 'Cổng Điều 13: dữ liệu trẻ em không ra nhà cung cấp AI', lo: 'Rò dữ liệu cá nhân/trẻ em sang bên thứ ba',
    tro: ['m:may-chu/an-toan-ai.js#soatRaNhaCungCap', 'm:may-chu/bo-nao.js#soatAnDanh'], gioiHan: 'Bộ dò ẩn danh dựa mẫu — không bắt được mọi cách viết.' },
  { ma: 'BM15', nhom: 'BM', ten: 'Chuỗi cung ứng mã: CodeQL · Dependabot · Scorecard · chủ sở hữu mã', lo: 'Lỗ hổng trong mã/thư viện, sửa mã không người duyệt',
    tro: ['d:.github/workflows/codeql.yml', 'd:.github/dependabot.yml', 'd:.github/workflows/scorecard.yml', 'd:.github/CODEOWNERS'], gioiHan: 'Công cụ tĩnh không thay được kiểm thử xâm nhập.' },

  /* ── 15 TẦNG PHÒNG VỆ ── */
  { ma: 'PV01', nhom: 'PV', ten: 'Chặn nhịp theo phút (cửa · AI · thường)', lo: 'Dò mật khẩu, spam, DDoS lớp ứng dụng',
    tro: ['m:may-chu/ve-chi-phi.js#HAN_PHUT', 'm:may-chu/ve-chi-phi.js#GIOI_HAN'], gioiHan: 'DDoS lớp mạng do Cloudflare chặn, không ở mã GITA.' },
  { ma: 'PV02', nhom: 'PV', ten: 'Ngân sách token ngày · trần tải 50%', lo: 'Hoá đơn bất ngờ (bill shock), cạn hạn mức miễn phí',
    tro: ['m:may-chu/bo-nao-da-tri.js#GITA_TRAN_TAI', 'm:may-chu/bo-nao-da-tri.js#HAN_NGAY'], gioiHan: 'Hạn mức gốc của Workers AI là ước lượng bảo thủ, CHƯA ĐO.' },
  { ma: 'PV03', nhom: 'PV', ten: 'Chế độ tiết kiệm khẩn cấp', lo: 'Chi phí tăng vọt khi bị lạm dụng',
    tro: ['m:may-chu/ve-chi-phi.js#GITA_CHE_DO_TIET_KIEM'], gioiHan: 'Chủ hệ bật tay.' },
  { ma: 'PV04', nhom: 'PV', ten: 'Ngăn khoang + cầu dao từng phần', lo: 'Một phần hỏng kéo sập cả hệ',
    tro: ['m:may-chu/khoang.js#chanKhoang', 'm:may-chu/worker.js#ghiLoiKhoang'], gioiHan: 'Cầu dao trong bộ nhớ từng isolate — đếm D1 bù cho phần còn lại.' },
  { ma: 'PV05', nhom: 'PV', ten: 'Trần kích thước: thân yêu cầu 10 MB · gói đồng bộ 512 KB', lo: 'Gói khổng lồ đốt CPU/bộ nhớ Worker',
    tro: ['m:may-chu/worker.js#TRAN_THAN_BYTE', 'm:may-chu/dong-bo.js#TRAN_DAY_KB'], gioiHan: 'Trần chung 10 MB; cửa nào nhỏ hơn tự đặt trần riêng.' },
  { ma: 'PV06', nhom: 'PV', ten: 'Đóng băng sự cố · cứu hệ', lo: 'Sự cố lan khi đang điều tra',
    tro: ['m:may-chu/cuu-he.js#dongBangHe', 'm:may-chu/cuu-he.js#AN_TOAN_KHI_BANG'], gioiHan: 'Ai bấm đóng băng là quyết định của người.' },
  { ma: 'PV07', nhom: 'PV', ten: 'Sao lưu & khôi phục hồ sơ', lo: 'Mất dữ liệu do ghi hỏng/xoá nhầm',
    tro: ['m:may-chu/dong-bo.js#khoiPhucTuSaoLuu'], gioiHan: 'Khoá giải mã E2EE người dùng phải tự giữ bản khôi phục.' },
  { ma: 'PV08', nhom: 'PV', ten: 'Quét dữ liệu mồ côi D1 ↔ R2', lo: 'Lệch metadata và tệp sau lỗi giữa chừng',
    tro: ['m:may-chu/dong-bo.js#quetSaoLuuMoCoi'], gioiHan: 'Quét theo lô mỗi đêm, không tức thì.' },
  { ma: 'PV09', nhom: 'PV', ten: 'Tự soát & tự chữa mỗi đêm', lo: 'Lỗi âm thầm tích tụ',
    tro: ['m:may-chu/tu-chua.js#tuSoatVaChua', 'm:may-chu/worker.js#tuSoatVaChua(env)'], gioiHan: 'Chỉ chữa lớp lỗi đã biết; lỗi mới thì báo.' },
  { ma: 'PV10', nhom: 'PV', ten: 'Nhật ký kiểm toán mọi việc ghi', lo: 'Không truy được ai làm gì',
    tro: ['m:may-chu/nen.js#ghiNhatKy', 'd:may-chu/nhat-ky.js'], gioiHan: 'Nhật ký trong cùng D1 — người có quyền R01 đọc được.' },
  { ma: 'PV11', nhom: 'PV', ten: 'Giám sát · hộp đen', lo: 'Phát hiện muộn',
    tro: ['d:may-chu/giam-sat.js', 'm:may-chu/cuu-he.js#soatSoDen'], gioiHan: 'Cảnh báo cần người trực đọc.' },
  { ma: 'PV12', nhom: 'PV', ten: 'Mã yêu cầu · lỗi không lộ cấu trúc', lo: 'Lời lỗi thành bản đồ cho kẻ dò',
    tro: ['m:may-chu/worker.js#maYeuCau', 'm:may-chu/worker.js#x-gita-ma'], gioiHan: 'Chi tiết lỗi chỉ ở nhật ký Cloudflare.' },
  { ma: 'PV13', nhom: 'PV', ten: 'Quyền dữ liệu theo luật: đồng ý · xoá · xuất', lo: 'Vi phạm Luật Bảo vệ dữ liệu cá nhân (VN) và chuẩn quốc tế tương đương',
    tro: ['m:may-chu/phap-ly-rui-ro.js#ghiDongY', 'm:may-chu/phap-ly-rui-ro.js#yeuCauXoaDuLieu', 'm:may-chu/phap-ly-rui-ro.js#xuatDuLieuNha'], gioiHan: 'Mã thực thi quy trình; đánh giá tuân thủ cần luật sư (vùng luật sư).' },
  { ma: 'PV14', nhom: 'PV', ten: 'Công tắc tắt & tự điều chỉnh đảo được', lo: 'Máy tự làm sai không dừng được',
    tro: ['m:may-chu/bo-nao-da-tri.js#GITA_DA_TRI_BAT', 'm:may-chu/bo-nao-da-tri.js#GITA_TU_DIEU_CHINH'], gioiHan: 'Đổi biến cần quyền Cloudflare của chủ hệ.' },
  { ma: 'PV15', nhom: 'PV', ten: 'Cổng CI + vòng nhà khoa học mỗi đêm · chủ hệ quyết', lo: 'Lùi chất lượng, suy giảm không ai thấy',
    tro: ['d:.github/workflows/kiem-tra.yml', 'm:may-chu/bo-nao-da-tri.js#vongKhoaHoc', 'f:docVongKhoaHoc'], gioiHan: 'Vòng chỉ đọc số đo đã có — chỉ số chưa đo thì không thấy.' }
];

/* 12 tầng hậu cần (bài học "bếp không chỉ có mặt tiền"): một hệ thống
   thật gồm cả chục tầng dưới giao diện. Mỗi tầng TRỎ vào mã/cấu hình
   thật; tầng nào repo không đo được thì GHI THẬT, không giả vờ đo. */
G.LC_HERCULES = [
  { ma: 'BK01', ten: 'Giao diện (frontend)', tro: ['t:gita-app.js'] },
  { ma: 'BK02', ten: 'API & logic máy chủ', tro: ['t:may-chu/worker.js'] },
  { ma: 'BK03', ten: 'Cơ sở dữ liệu & lưu trữ', tro: ['t:may-chu/csdl.sql'] },
  { ma: 'BK04', ten: 'Đăng nhập & phân quyền', tro: ['f:kiemPhien'] },
  { ma: 'BK05', ten: 'Hosting & triển khai', tro: ['m:may-chu/wrangler.toml#name = "gita365"'] },
  { ma: 'BK06', ten: 'Điện toán đám mây', tro: ['t:may-chu/wrangler.toml'] },
  { ma: 'BK07', ten: 'CI/CD & quản lý phiên bản', tro: ['t:.github/workflows/kiem-tra.yml'] },
  { ma: 'BK08', ten: 'Bảo mật & quyền trên dữ liệu', tro: ['v:la-chan-30'] },
  { ma: 'BK09', ten: 'Chặn nhịp (rate limiting)', tro: ['m:may-chu/ve-chi-phi.js#HAN_PHUT'] },
  { ma: 'BK10', ten: 'Bộ đệm & CDN', tro: ['m:_headers#Cache-Control'] },
  { ma: 'BK11', ten: 'Cân bằng tải & co giãn', tro: [], khongDoDuoc: 'Cloudflare lo ở tầng mạng toàn cầu — repo không đo được; bận rộn nhất vẫn là hạn mức Worker, đã có trần tải 50% canh.' },
  { ma: 'BK12', ten: 'Bắt lỗi & nhật ký', tro: ['f:soatSoDen'] }
];

/* Chỗ trống THẬT — ghi ra thay vì khai đã có. */
G.LC_KHOANG_TRONG = [
  { ten: 'Kiểm thử xâm nhập độc lập', vi: 'Chưa có bên thứ ba kiểm. Không công cụ tĩnh nào thay được.', viec: 'Thuê/mời kiểm thử trước khi vượt 200.000 tài khoản.' },
  { ten: 'WAF · Bot Fight Mode của Cloudflare', vi: 'Bật ở bảng điều khiển Cloudflare — repo không đo được.', viec: 'Chủ hệ bật Bot Fight Mode + quy tắc WAF miễn phí, chụp lại cấu hình.' },
  { ten: 'Diễn tập khôi phục định kỳ', vi: 'Mã khôi phục có thử giả lập (thu-dong-bo.mjs) nhưng chưa diễn tập trên dữ liệu thật.', viec: 'Mỗi quý: khôi phục một hồ sơ thử từ sao lưu, ghi biên bản.' },
  { ten: 'Đánh giá pháp lý chính thức', vi: 'Mã thực thi đồng ý/xoá/xuất; kết luận tuân thủ phải do luật sư.', viec: 'Dùng vùng luật sư (docVungLuatSu) trước khi mở bán diện rộng.' }
];

G.lcDo = function () {
  return G.LC_TANG.map(function (t) {
    var kq = t.tro.map(G.h16DoTro || function (x) { return { tro: x, song: null, noi: 'ci' }; });
    var may = kq.filter(function (x) { return x.noi === 'may'; });
    return { ma: t.ma, may: may.length, song: may.filter(function (x) { return x.song; }).length, ci: kq.length - may.length, kq: kq };
  });
};

G.VIEWS['la-chan-30'] = function () {
  var do_ = {}; G.lcDo().forEach(function (d) { do_[d.ma] = d; });
  var tong = G.LC_TANG.reduce(function (s, t) { return s + t.tro.length; }, 0);
  var o = '<div class="hd"><h2>' + ic('shield') + ' Lá chắn 30 tầng</h2><p class="sub">15 tầng <b>bảo mật</b> (ngăn trước) + 15 tầng <b>phòng vệ</b> (chặn · khoanh · ghi · phục hồi). ' +
    'Mỗi tầng trỏ vào mã đang chạy — ' + tong + ' con trỏ được CI đo trên mỗi PR (tools/do-16-he.js). Không hệ nào chứng minh được "không lỗ hổng"; ' +
    'điều GITA cam kết là <b>đo liên tục</b> và <b>ghi thật chỗ còn trống</b>.</p></div>';
  ['BM', 'PV'].forEach(function (nh) {
    o += '<div class="card mt"><b>' + (nh === 'BM' ? '15 tầng bảo mật' : '15 tầng phòng vệ') + '</b><table class="tbl sm mt"><tr><th>Mã</th><th>Tầng</th><th>Chặn gì</th><th>Trỏ vào mã</th><th>Giới hạn thật</th></tr>' +
      G.LC_TANG.filter(function (t) { return t.nhom === nh; }).map(function (t) {
        var d = do_[t.ma];
        return '<tr><td class="mono">' + h(t.ma) + '</td><td><b>' + h(t.ten) + '</b></td><td class="tiny">' + h(t.lo) + '</td><td class="mono tiny">' +
          d.kq.map(function (x) { return h(x.tro) + (x.noi === 'may' ? (x.song ? ' ✓' : ' ✗') : ''); }).join('<br>') + '</td><td class="tiny muted">' + h(t.gioiHan) + '</td></tr>';
      }).join('') + '</table></div>';
  });
  o += '<div class="card mt"><b>12 tầng hậu cần dưới giao diện</b><div class="tiny muted mt">Bài học "bếp không chỉ có mặt tiền": hệ thống thật gồm cả chục tầng bên dưới. ' +
    'Mỗi tầng trỏ vào mã thật; tầng repo không đo được thì ghi thật, không giả vờ đo.</div>' +
    '<table class="tbl sm mt"><tr><th>Mã</th><th>Tầng</th><th>Trỏ vào / ghi thật</th></tr>' +
    G.LC_HERCULES.map(function (b) {
      return '<tr><td class="mono">' + h(b.ma) + '</td><td><b>' + h(b.ten) + '</b></td><td class="mono tiny">' +
        (b.khongDoDuoc ? '<span style="color:var(--gita-sau)">không đo được từ repo:</span> <span class="tiny muted">' + h(b.khongDoDuoc) + '</span>' :
          b.tro.map(function (x) { var k = (G.h16DoTro || function () { return {}; })(x); return h(x) + (k.noi === 'may' ? (k.song ? ' ✓' : ' ✗') : ''); }).join('<br>')) + '</td></tr>';
    }).join('') + '</table></div>';
  o += '<div class="card mt" style="border-color:var(--gita-sau)"><b>Chỗ còn trống — ghi thật</b>' + G.LC_KHOANG_TRONG.map(function (k) {
    return '<div class="sm mt"><b>' + h(k.ten) + ':</b> ' + h(k.vi) + ' <span class="tiny muted">→ ' + h(k.viec) + '</span></div>';
  }).join('') + '</div>';
  return o;
};
})();
