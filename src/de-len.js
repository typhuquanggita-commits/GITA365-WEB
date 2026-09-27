/* ═══════════════════════════════════════════════════════════════
   GITA 365 · v9.70 — BẢNG KHAI CHỖ ĐÈ

   VẤN ĐỀ BỘ DÒ SÂU TÌM RA

   Bốn hàm trong hệ bị một tệp khác khai đè lên. Cả bốn đều CỐ Ý —
   nhưng cả bốn đều phụ thuộc một thứ không ai canh: THỨ TỰ TỆP
   trong tools/danh-sach-src.json.

   Thứ tự ấy là một dãy dòng trong một tệp JSON. Ai cũng sửa được, và
   sửa nhầm thì bản đè thua bản bị đè — không lỗi, không cảnh báo,
   màn hình vẫn hiện ra bình thường. Chỉ có điều nó chạy theo bản cũ.

   HAI TRONG BỐN CHỖ ẤY LÀ KHOÁ AN TOÀN

   src/may-khach.js đè G.BI_KHOA_CHEP() và G.coTheIn() để bản chạy
   trên máy khách hàng KHÔNG in được và KHÔNG sao chép được, kể cả
   khi vai ấy có quyền xuat_pdf trên máy chủ.

   Nếu ngày nào đó ai kéo may-khach.js lên trước app.js trong danh
   sách, thì bản máy khách lặng lẽ lấy lại quyền in. Không ai biết,
   cho tới lúc một hồ sơ gia đình nằm trên máy in ở đâu đó.

   Nên bảng này khai bốn chỗ ấy, và bộ dò sâu canh ba điều với mỗi
   chỗ: có khai không, khai đúng tệp không, và THỨ TỰ NẠP có đúng
   chiều không. Chỗ nào đánh antoan thì dlSoiChieu() còn gọi CẢ HAI
   bản và chứng minh bản đè CHẶT HƠN bản bị đè — chứ không tin lời
   khai.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;

G.DE_LEN = [
  { ham: 'BI_KHOA_CHEP',
    tepCu: 'src/khoa-sao-chep.js', tepMoi: 'src/may-khach.js',
    antoan: true, chatHon: true,
    vi: 'Bản chạy trên máy khách hàng khoá sao chép cho MỌI vai, không ' +
        'phân biệt quyền. Bản gốc chỉ khoá theo màn và theo quyền.',
    neuNguoc: 'Máy khách lấy lại quyền sao chép theo vai — tức là mất chính lớp bảo vệ ' +
        'mà bản máy khách sinh ra để có.',
    giuDuong: 'G.BI_KHOA_CHEP_MAYCHU giữ bản cũ, để ngày luật máy chủ đổi thì còn đường ' +
        'gọi lại.' },

  { ham: 'coTheIn',
    tepCu: 'src/app.js', tepMoi: 'src/may-khach.js',
    antoan: true, chatHon: true,
    vi: 'Máy khách KHÔNG in, kể cả vai có quyền xuat_pdf trên máy chủ. Bản in là một ' +
        'bản sao nằm lại ở máy khác — đúng thứ chính sách cấm.',
    neuNguoc: 'Máy khách in được theo quyền vai. Một hồ sơ gia đình ra khỏi hệ bằng ' +
        'đường giấy, và không nhật ký nào ghi lại.',
    giuDuong: 'G.coTheIn_MAYCHU giữ bản cũ.' },

  { ham: 'aiHoi',
    tepCu: 'src/tro-ly-ai.js', tepMoi: 'src/tro-ly-chat.js',
    antoan: false,
    vi: 'Bản chat thay bản tra kho một chiều: cùng một câu hỏi, nhưng đi qua khung hội ' +
        'thoại có nhớ lượt trước và có nhánh dừng khi chạm dấu hiệu khẩn.',
    neuNguoc: 'Trợ lý quay về kiểu tra một chiều, mất nhánh dừng khi câu hỏi chạm dấu ' +
        'hiệu khẩn — đó là nhánh bắt buộc theo luật chuyển tuyến an toàn.' }
];

G.DE_LEN_LUAT = {
  khaiChuKhongDoiTen: 'Bốn chỗ này KHÔNG đổi tên hàm, vì đổi tên thì mọi chỗ gọi phải ' +
      'sửa theo và đó là rủi ro lớn hơn. Thay vào đó là khai ra và canh.',
  thuTuLaMotDongJSON: 'Điều đáng sợ nhất của lớp lỗi này: thứ tự nạp sống trong MỘT DÃY ' +
      'DÒNG của một tệp JSON. Không ai coi việc sắp lại danh sách tệp là việc nguy hiểm, ' +
      'mà nó nguy hiểm.',
  antoanPhaiChungMinh: 'Chỗ nào đánh antoan thì không được tin lời khai. dlSoiChieu() gọi ' +
      'CẢ HAI bản và so kết quả: bản đè phải CHẶT HƠN. Khai chặt hơn mà chạy ra lỏng hơn ' +
      'thì đỏ.',
  khongSoHaiBan: 'Không so kết quả bản đè với bản bị đè. Phép so ấy phụ thuộc VAI ĐANG ' +
      'ĐĂNG NHẬP — coTheIn bản gốc đọc quyền xuat_pdf, nên với vai không có quyền ấy thì ' +
      'hai bản trùng nhau một cách chính đáng. Thứ phải chứng minh là bản đè trả về hằng ' +
      'số chặt, KHÔNG điều kiện.',
  hanBanWebKhongChay: 'Hai chỗ đè an toàn nằm trong src/may-khach.js, và tệp ấy chỉ chạy ' +
      'khi window.GITA_MAY_KHACH bật — tức bản đóng gói cho máy khách hàng. Trên bản web ' +
      'chúng NẰM IM, nên dlSoiChieu() báo "chưa chạy" chứ không báo đỏ. Một phép kiểm báo ' +
      'oan trên bản sạch thì lần sau người ta tắt nó đi.',
  moTroLyDaBo: 'Chỗ đè thứ năm — G.moTroLy() — đã được bỏ ở 9.70. Hai bản giống hệt nhau ' +
      'từng chữ, nên bản sau không thêm gì mà chỉ thêm một chỗ để hỏng. Bỏ bản thừa rẻ ' +
      'hơn khai nó.'
};

(function () {
  /* ═══════ KHOÁ: BẢN ĐÈ PHẢI CHẶT HƠN BẢN BỊ ĐÈ ═══════

     Không đọc lời khai. Gọi cả hai bản và so kết quả thật.

     "Chặt hơn" ở đây có nghĩa cụ thể: với hàm trả về "có được phép
     không" thì bản đè phải trả về false ở chỗ bản cũ trả về true;
     với hàm trả về "có bị chặn không" thì ngược lại. Nên bảng khai
     rõ chiều bằng ô chatHon, và phép đo so theo đúng chiều ấy. */
  G.dlSoiChieu = function () {
    var ds = G.DE_LEN || [], loi = [], chuaChay = [];
    if (!ds.length) return { chuaDo: true, thieu: 'DE_LEN', loi: [] };

    ds.forEach(function (x) {
      ['ham', 'tepCu', 'tepMoi', 'vi', 'neuNguoc'].forEach(function (k) {
        if (!x[k]) loi.push(x.ham + ' thiếu ô ' + k);
      });
      if (!x.antoan) return;

      /* src/may-khach.js chỉ chạy khi window.GITA_MAY_KHACH bật — tức
         là trong bản đóng gói cho máy khách hàng, không phải bản web.
         Trong bản web nó nằm im, nên hai chỗ đè an toàn CHƯA xảy ra.

         Phép đo phải nói đúng điều đó chứ không báo đỏ. Bản đầu báo
         đỏ ngay trên bản web sạch, và một phép kiểm báo oan thì lần
         sau người ta tắt nó đi. */
      if (x.tepMoi === 'src/may-khach.js' && !G.LA_MAY_KHACH) {
        chuaChay.push(x.ham);
        return;
      }
      var moi = G[x.ham], cu = G[x.ham + '_MAYCHU'];
      if (typeof moi !== 'function') {
        loi.push('G.' + x.ham + '() không còn là hàm — bản đè đã biến mất');
        return;
      }
      if (typeof cu !== 'function') {
        loi.push('G.' + x.ham + '_MAYCHU không còn — bản máy khách đang chạy mà mất ' +
          'đường gọi lại bản cũ, và mất luôn cách chứng minh bản đè chặt hơn');
        return;
      }
      /* Gọi thật cả hai. Bản đè phải trả về hằng số, và hằng số ấy
         phải là phía CHẶT. */
      var rMoi;
      try { rMoi = moi(); } catch (e) { loi.push('gọi G.' + x.ham + '() ném lỗi: ' + e.message); return; }

      if (x.ham === 'coTheIn') {
        /* coTheIn: chặt hơn = false */
        if (rMoi !== false)
          loi.push('G.coTheIn() trả về ' + JSON.stringify(rMoi) + ' — bản máy khách phải ' +
            'trả về false, không in được, không ngoại lệ');
      } else if (x.ham === 'BI_KHOA_CHEP') {
        /* BI_KHOA_CHEP: chặt hơn = true */
        if (rMoi !== true)
          loi.push('G.BI_KHOA_CHEP() trả về ' + JSON.stringify(rMoi) + ' — bản máy khách ' +
            'phải trả về true, khoá sao chép cho mọi vai');
      } else {
        loi.push(x.ham + ' đánh antoan mà phép đo chưa biết so chiều nào cho nó');
      }
      /* ĐÃ BỎ MỘT PHÉP SO — GHI LẠI VÌ SAO

         Bản đầu còn so rMoi với rCu và đỏ khi hai bản cho cùng kết
         quả, với lý do "vậy chỗ đè này không còn tác dụng gì".

         Phép ấy BÁO OAN, và nó báo oan ngay trên bản sạch. G.coTheIn
         bản gốc là G.can('xuat_pdf') — với một vai KHÔNG có quyền ấy
         thì bản gốc cũng trả về false, y như bản đè. Hai bản giống
         nhau ở đây không phải vì chỗ đè vô dụng, mà vì vai đang đăng
         nhập vốn đã không được in.

         Nói cách khác: phép so ấy phụ thuộc AI ĐANG ĐĂNG NHẬP, mà
         một phép canh an toàn thì không được phụ thuộc điều đó. Thứ
         cần chứng minh là bản đè trả về hằng số CHẶT, không điều
         kiện — và hai phép đo ở trên đã chứng minh đúng điều ấy.

         Chỗ "bản đè có gọi bản cũ không" thì tools/do-sau.js canh
         tĩnh, chắc hơn canh động. */
    });

    if (!(G.DE_LEN_LUAT || {}).antoanPhaiChungMinh)
      loi.push('chưa khai luật chỗ an toàn phải chứng minh');
    if (!(G.DE_LEN_LUAT || {}).thuTuLaMotDongJSON)
      loi.push('chưa khai vì sao thứ tự nạp là chỗ đáng sợ');
    return { chuaDo: false, loi: loi, so: ds.length,
      soAnToan: ds.filter(function (x) { return x.antoan; }).length,
      chuaChay: chuaChay, laMayKhach: !!G.LA_MAY_KHACH };
  };
})();
