/* ═══════════════════════════════════════════════════════════════
   GITA 365 — CHUẨN NGÔN TỪ HỢP NHẤT  (9.99.196)

   Theo hai bản đặc tả của chủ hệ (Content Marketing + Chatbot V20),
   phần "MỘT BỘ GUARDRAILS DUY NHẤT" (Part A) và ContentCompliance
   (Part E): mọi lời — dù đi ra ở màn NỘI DUNG hay ở câu TRẢ LỜI của
   trợ lý — đều phải qua CÙNG một chuẩn ngôn từ.

   ══ VÌ SAO DỰNG Ở ĐÂY, VÀ VÌ SAO 0 ĐỒNG ══

   Bản đặc tả đạt chất lượng bằng một mô hình ngôn ngữ chạy tại chỗ
   (Qwen3-8B trên GPU). Kho này chạy trên Cloudflare (trang tĩnh + D1),
   KHÔNG có chỗ cho một mô hình như thế, và chủ hệ chốt "tổng chi phí
   0 đồng". Nên chất lượng ở đây KHÔNG đến từ một AI sinh chữ — nó đến
   từ hai chỗ, cả hai đều 0 đồng và chạy thẳng trong máy người dùng:

     1. Bộ soạn (tro-ly-soan.js) ghép câu từ CHÍNH kho huấn luyện lõi
        của GITA365 — không bịa một chữ (luật cứng của bộ soạn).
     2. Bộ CHUẨN này gác đầu ra: chặn giọng máy, lời hứa suông, câu
        sáo rỗng, câu quá dài, nhồi từ khoá — đúng những thứ làm một
        câu trả lời "nghe kém".

   ══ KHÔNG DỰNG BẢN THỨ HAI CỦA MỘT SỰ THẬT ══

   Máy chủ ĐÃ có bộ dò chất lượng cho luồng biên soạn nội dung
   (`may-chu/kien-truc-noi-dung.js`: NGON_AI · RONG · LOI_THAY · CAM_
   CHUYENGIA · CAU_DAI). Chỗ hở DUY NHẤT là CHATBOT: câu trợ lý trả
   lời KHÔNG đi qua bộ dò nào cả. Bộ này bịt đúng chỗ hở ấy — chạy
   được ở MÁY KHÁCH (trình duyệt) nơi trợ lý soạn câu.

   Để không thành bản chép lặng lẽ trôi khỏi bản gốc: các cụm ở đây là
   TẬP CON của bảng máy chủ, và mục 123 của bộ kiểm ĐỐI CHIẾU HAI ĐẦU —
   mọi cụm giọng-máy ở client phải có trong NGON_AI của máy chủ, mọi
   cụm sáo-rỗng phải có trong RONG, và ngưỡng câu dài phải khớp CAU_DAI.
   Server đổi mà client không theo thì mục 123 đỏ.

   ══ THÊM ĐÚNG MỘT THỨ MỚI: LỜI HỨA SUÔNG ══

   Bản đặc tả ContentCompliance chặn "hứa kết quả nhanh" (trong X ngày
   con sẽ ngoan/giỏi). Máy chủ chặn nó ở bộ lọc quảng cáo QC3 (cam kết
   kết quả), nhưng chatbot thì chưa. Đây là thứ nguy nhất trong giáo
   dục: một lời hứa "sau hai tuần con hết ôm điện thoại" nghe rất êm và
   sai hoàn toàn về bản chất một đứa trẻ. Nên `CN_HUA` bắt nó, và nó là
   phần MỚI của bộ này (không mirror máy chủ).

   Ba cái bẫy dò chữ tiếng Việt (CLAUDE.md) đều tránh ở đây:
     · KHÔNG dùng \b (không khớp chữ có dấu).
     · Dò CỤM NHIỀU ÂM TIẾT trên chuỗi đã bỏ dấu — cụm dài thì gần như
       không bắt oan (cùng lối chọn-dấu-hiệu của máy chủ).
     · KHÔNG danh sách trừ: cụm nào dễ đụng văn người thật thì BỎ HẲN.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;

(function () {

  /* Bỏ dấu, thường hoá, gộp khoảng trắng — cùng phép với bộ soạn và
     bộ tra, để một cụm dò khớp y như nhau ở mọi chỗ. */
  function boDau(s) {
    return String(s == null ? '' : s).toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/đ/g, 'd').replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ').trim();
  }

  /* ── GIỌNG MÁY — tập con của NGON_AI ở máy chủ ──
     Mỗi cụm nhiều âm tiết, gần như không có trong văn người thật viết
     cho gia đình. Mục 123 đòi mọi cụm này CÓ trong NGON_AI máy chủ. */
  var CN_AI = [
    'tro ly ao', 'mo hinh ngon ngu', 'toi chi la mot', 'toi se giup ban',
    'toi khong the giup', 'hay cung nhau kham pha', 'chung ta hay bat dau',
    'that tuyet voi', 'dieu quan trong can luu y', 'sau day la mot so'
  ];

  /* ── SÁO RỖNG — tập con của RONG ở máy chủ ── */
  var CN_RONG = [
    'hay co gang', 'no luc het minh', 'chia khoa thanh cong', 'bi quyet',
    'thay doi cuoc doi', 'khong gi la khong the', 'tu duy tich cuc',
    'but pha gioi han', 'khai phong tiem nang', 'truyen cam hung'
  ];

  /* ── LỜI HỨA SUÔNG — phần MỚI (không mirror máy chủ) ──
     Hai đường: cụm cố định, và một mẫu "trong N ngày/tuần/tháng … +
     một kết quả về CON hoặc THÀNH CÔNG". Mẫu bắt được câu người viết
     tự nghĩ ra mà không dùng đúng cụm nào. */
  var CN_HUA = [
    'cam ket 100', 'hua chac chan', 'dam bao thanh cong', 'chac chan thanh cong',
    'chac chan se ngoan', 'chac chan se gioi', 'dam bao con se', 'cam ket con se'
  ];
  var RE_HUA = /trong\s+\d+\s*(ngay|tuan|thang)[^.!?]{0,40}(se\s+ngoan|se\s+gioi|se\s+nghe loi|het om dien thoai|thay doi hoan toan|chac chan)/;

  /* Ngưỡng câu dài — khớp CAU_DAI của máy chủ (mục 123 đối chiếu). */
  var CAU_DAI = 28;

  function demAmTiet(cau) { return boDau(cau).split(' ').filter(Boolean).length; }

  /* Từ dừng — để phép nhồi-từ-khoá không tính oan hư từ. */
  var HU = {};
  ('la cua va cho voi thi ma nhung o tai den tu khi nao sao gi de duoc co khong ' +
   'toi minh em anh chi con nha mot hai cac rat qua lam nen se da bi bo ai nay ' +
   'the nhu hay hon nua chua roi cung ve theo tren duoi trong ngoai mot cai')
    .split(' ').forEach(function (t) { HU[t] = 1; });

  function coCum(chu, ds) {
    var ra = [];
    for (var i = 0; i < ds.length; i++) if (chu.indexOf(ds[i]) >= 0) ra.push(ds[i]);
    return ra;
  }

  /* ── CỔNG: một câu/đoạn có đạt chuẩn ngôn từ không ──
     Trả {dat, loi:[{loai, cum, thay}]}. KHÔNG tự sửa hộ (luật kho:
     máy không xoá hộ — người gửi không biết mình vừa viết gì thì lần
     sau viết y hệt). Chỉ NÊU, kèm hướng thay. */
  var HUONG = {
    ai:   'Bỏ giọng máy — nói thẳng việc, xưng anh chị · em như nhà mình.',
    rong: 'Thay bằng một việc cụ thể, đo được (làm gì · mấy lần · dấu hiệu nào).',
    hua:  'Bỏ lời hứa kết quả theo thời hạn — một đứa trẻ không chạy theo lịch. Nói bước làm được tuần này.',
    dai:  'Cắt thành câu ngắn — trên ' + CAU_DAI + ' âm tiết là quá dài để đọc trên điện thoại.',
    nhoi: 'Một từ lặp quá nhiều đọc như nhồi từ khoá — viết cho người, không cho máy tìm.'
  };

  G.cnSoat = function (text) {
    var chu = boDau(text), loi = [];
    coCum(chu, CN_AI).forEach(function (c) { loi.push({ loai: 'ai', cum: c, thay: HUONG.ai }); });
    coCum(chu, CN_RONG).forEach(function (c) { loi.push({ loai: 'rong', cum: c, thay: HUONG.rong }); });
    coCum(chu, CN_HUA).forEach(function (c) { loi.push({ loai: 'hua', cum: c, thay: HUONG.hua }); });
    if (RE_HUA.test(chu)) loi.push({ loai: 'hua', cum: 'hứa kết quả theo thời hạn', thay: HUONG.hua });

    /* Câu dài: xét TỪNG câu, không xét cả đoạn — một đoạn dài gồm nhiều
       câu ngắn thì không sai. */
    String(text || '').split(/[.!?…]+/).forEach(function (cau) {
      var n = demAmTiet(cau);
      if (n > CAU_DAI) loi.push({ loai: 'dai', cum: n + ' âm tiết', thay: HUONG.dai });
    });

    /* Nhồi từ khoá: một tiếng nội dung chiếm quá 5% tổng tiếng (ngưỡng
       của bản đặc tả). Chỉ xét khi đoạn đủ dài để con số có nghĩa. */
    var toks = chu.split(' ').filter(function (t) { return t.length >= 3 && !HU[t]; });
    if (toks.length >= 20) {
      var dem = {}, max = 0, tuMax = '';
      toks.forEach(function (t) { dem[t] = (dem[t] || 0) + 1; if (dem[t] > max) { max = dem[t]; tuMax = t; } });
      if (max / toks.length > 0.05)
        loi.push({ loai: 'nhoi', cum: '"' + tuMax + '" ×' + max, thay: HUONG.nhoi });
    }

    return { dat: loi.length === 0, loi: loi };
  };

  /* Bày cụm ra cho mục 123 (đối chiếu hai đầu) và cho màn nội dung
     tự kiểm ngay ở máy khách. */
  G.CN = { ai: CN_AI, rong: CN_RONG, hua: CN_HUA, cauDai: CAU_DAI };

  /* Một câu gọn nói kết quả soát — dùng ở màn để hiện huy hiệu. */
  G.cnTom = function (kq) {
    if (!kq || kq.dat) return { ok: true, chu: 'Đạt chuẩn ngôn từ' };
    var d = {};
    kq.loi.forEach(function (x) { d[x.loai] = (d[x.loai] || 0) + 1; });
    var ten = { ai: 'giọng máy', rong: 'sáo rỗng', hua: 'hứa suông', dai: 'câu dài', nhoi: 'nhồi từ' };
    var phan = Object.keys(d).map(function (k) { return d[k] + ' ' + ten[k]; });
    return { ok: false, chu: 'Cần sửa: ' + phan.join(' · ') };
  };

})();
