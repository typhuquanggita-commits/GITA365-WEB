/* ═══════════════════════════════════════════════════════════════
   GITA 365 · v9.66 — RÀ SOÁT PHÁP LÝ · CHUẨN BẰNG CHỨNG · BỘ HỒ SƠ

   BA MÀN, MỘT Ý: ỨNG DỤNG TỰ ĐỐI CHIẾU VỚI TÀI LIỆU PHÁP LÝ

   Hai tài liệu chủ hệ nói ứng dụng PHẢI làm được gì. Ba màn này trả
   lời ứng dụng ĐANG làm được gì — bằng cách gọi thẳng vào hàm đang
   chạy, không bằng cách đọc một danh sách khai sẵn.

   Chỗ đắt nhất là bảng bằng chứng. Nó không hỏi "có ghi log không".
   Nó lấy một bản ghi thật của G.SECLOG rồi đếm xem bản ghi ấy có mấy
   trong sáu tính chất mà tài liệu đòi. Kết quả hôm nay không đẹp, và
   đó là điểm — bảng đẹp thì không ai sửa gì.

   ═══ NĂM CÁI KHOÁ ═══

   rspSoiChan()      hai mươi mục nghiêm trọng, mỗi mục khai ứng dụng
                     ở đâu; khai ĐÃ ĐÓNG thì phải dẫn được tên hàm
   rspSoiLech()      bốn chỗ tài liệu và ứng dụng nói khác nhau — mỗi
                     chỗ phải nêu cả hai bên và một hướng đề xuất
   bcdSoatBangChung() mười ba thao tác × sáu tính chất, đọc hàm thật
   bcdSoiKhongTuNang() không được khai đủ sáu tính chất cho tất cả
   hsSoiDK6()        sáu điều khoản đặc thù có mặt đúng ở các hợp
                     đồng phải có — đối chiếu NGƯỢC từ HSH_HD
   hsSoiLuong()      công thức lương không chứa biến đếm đầu người —
                     điều duy nhất trong bộ hồ sơ máy canh được
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;
G.VIEWS = G.VIEWS || {};

(function () {
  var U = G.U, h = U.h;

  /* Gộp nông hai vật — bộ U không có sẵn, và Object.assign thì kho
     này tránh vì mã chạy trên trình duyệt cũ của máy khách. */
  function gop(a, b) {
    var r = {}, k;
    for (k in a) if (Object.prototype.hasOwnProperty.call(a, k)) r[k] = a[k];
    for (k in b) if (Object.prototype.hasOwnProperty.call(b, k)) r[k] = b[k];
    return r;
  }

  /* ═══════════ PHÉP ĐO SÁU TÍNH CHẤT TRÊN MỘT BẢN GHI THẬT ═══════════

     Tài liệu đòi sáu tính chất. Sáu hàm dưới đây mỗi hàm trả lời một
     tính chất cho MỘT loại bằng chứng, bằng cách nhìn vào hàm hoặc
     kho đang nạp. Không hàm nào đọc lời khai. */

  /* Một bản ghi SECLOG mẫu — lấy bản có thật nếu đang có, còn không
     thì dựng một bản bằng chính hàm ghi, để đo đúng thứ hệ sinh ra
     chứ không đo thứ mình tưởng tượng. */
  function mauSecLog() {
    var ds = G.SECLOG || [];
    if (ds.length) return ds[0];
    if (typeof G.secLog !== 'function') return null;
    G.secLog('Đo chuẩn bằng chứng', 'Bản ghi do phép đo sinh ra để soi cấu trúc nhật ký.', 'Ghi nhận');
    return (G.SECLOG || [])[0] || null;
  }

  /* Nhật ký trong trình duyệt có bị cắt bớt không. Mảng thường mà
     pop() được thì bản ghi cũ biến mất trong im lặng — đó đúng là
     điều tính chất T1 cấm. */
  function secLogCatBot() {
    var ds = G.SECLOG;
    if (!Array.isArray(ds)) return null;
    return { catDuoc: typeof ds.pop === 'function' && !Object.isFrozen(ds),
             dangGiu: ds.length };
  }

  var DO = {
    /* BC01 — chấp thuận điều khoản. Hệ có G.CONSENT nhưng nó là một
       cờ true/false, không mang bản đã hiển thị. */
    MA_BAM_DIEU_KHOAN: function () {
      var coCo = typeof G.CONSENT !== 'undefined';
      var coBam = typeof G.CONSENT === 'object' && G.CONSENT && !!G.CONSENT.maBam;
      return { co: coCo && coBam ? ['T2','T3','T4'] : (coCo ? ['T2'] : []),
        dan: coBam ? 'G.CONSENT mang mã băm bản đã hiển thị'
                   : 'G.CONSENT là một cờ true/false trong src/guard.js — biết ĐÃ đồng ý, ' +
                     'không biết đồng ý với BẢN NÀO. Đây đúng là lỗi MG2.' };
    },

    /* BC02 — đồng ý xử lý dữ liệu theo từng mục đích. Khác hẳn
       G.xinDongY(): hàm ấy là đồng ý XUẤT, cho người của Học viện. */
    DONG_Y_TACH_MUC_DICH: function () {
      return { co: [],
        dan: 'G.xinDongY() trong src/guard.js là đồng ý XUẤT DỮ LIỆU cho người của Học ' +
             'viện, không phải đồng ý XỬ LÝ dữ liệu của chủ thể. Hai thứ khác nhau, và ' +
             'tên giống nhau là chỗ dễ tưởng đã có.' };
    },

    RUT_DONG_Y: function () {
      var co = typeof G.xinDongY === 'function';
      return { co: co ? ['T2'] : [],
        dan: co ? 'G.xinDongY() bật tắt được cả hai chiều và mỗi lần đều gọi secLog — ' +
                  'nhưng nó rút quyền XUẤT, không rút đồng ý xử lý dữ liệu.'
                : 'chưa có đường rút nào.' };
    },

    /* BC06 — biên bản xoá. Hệ chưa có chức năng xoá theo yêu cầu của
       chủ thể dữ liệu ở bất kỳ đâu. */
    BIEN_BAN_XOA: function () {
      var co = typeof G.xoaTheoYeuCau === 'function';
      return { co: co ? ['T2','T4'] : [],
        dan: co ? 'G.xoaTheoYeuCau() có thật'
                : 'không hàm nào trong hệ xoá dữ liệu theo yêu cầu của chủ thể. Chưa có ' +
                  'việc thì chưa có biên bản — và lỗi MG3 sẽ xảy ra đúng vào ngày làm ' +
                  'chức năng ấy, nếu không nhớ trước.' };
    },

    /* BC07 — nhật ký XEM. Đây là chỗ ứng dụng làm tốt hơn tài liệu
       tưởng: chamTaiNguyen() ghi từng lượt MỞ tư liệu, không chỉ lượt
       sửa, và còn cảnh báo khi một người quét quá 20% kho. */
    NHAT_KY_XEM: function () {
      if (typeof G.chamTaiNguyen !== 'function' || typeof G.tinhTaiNguyen !== 'function')
        return { co: [] };
      var mau = mauSecLog();
      var coDanhTinh = !!(mau && mau.ai);
      return { co: coDanhTinh ? ['T2','T6'] : ['T6'],
        dan: 'G.chamTaiNguyen() ghi từng lượt MỞ tư liệu của vai nghề, gắn tài khoản và ' +
             'vai, và G.canhBaoTaiNguyen() bắn cảnh báo khi một người chạm quá ngưỡng ' +
             'trong cửa sổ ngày — nên nó có T2 và có T6 (cửa sổ ngày chính là thời hạn). ' +
             'Thiếu T1: bản ghi nằm trong bộ nhớ trang, sửa được. Thiếu T3: không mã băm.' };
    },

    /* BC08 — nhật ký trợ lý. Có ghi lượt HỎI, không ghi lượt ĐÁP. */
    NHAT_KY_TRO_LY: function () {
      var coTro = typeof G.aiTra === 'function' || !!G.KICHBAN_AI || !!G.VIEWS['tro-ly'];
      var mau = mauSecLog();
      return { co: (coTro && mau && mau.ai) ? ['T2'] : [],
        dan: 'src/tro-ly-chat.js gọi G.secLog("Hỏi trợ lý", …) nên biết được AI ĐÃ ĐƯỢC ' +
             'HỎI và ai hỏi. Nhưng không lưu câu ĐÁP, và bản ghi nằm trong SECLOG — ' +
             'mảng 120 dòng, mất theo phiên. Biết đã hỏi mà không biết đã đáp gì thì ' +
             'không giải trình được, mà giải trình là nghĩa vụ theo luật AI.' };
    },

    /* BC09 — quyết định tự động. Hệ có nhiều quyết định tự động thật
       (xếp cấp, chặn trần, cửa duyệt) nhưng không cái nào lưu lý do. */
    GIAI_TRINH_TU_DONG: function () {
      var coQD = typeof G.bvNhanDuoc === 'function' || typeof G.blvDuyetDuoc === 'function';
      /* blvDuyetDuoc trả về từng điều kiện kèm lý do — đó là giải
         trình TẠI CHỖ, dù không lưu lại. Ghi đúng một nửa ấy. */
      return { co: coQD ? ['T5'] : [],
        dan: coQD ? 'G.blvDuyetDuoc() và G.bvNhanDuoc() trả về TỪNG điều kiện kèm lý do ' +
                    'đạt hay hụt, nên quyết định GIẢI TRÌNH ĐƯỢC tại chỗ (T5). Nhưng ' +
                    'không lần chạy nào được lưu lại — hỏi lại sau ba tháng thì không ' +
                    'còn gì để đọc.'
                  : 'chưa có hàm quyết định nào.' };
    },

    DOI_KHOA: function () {
      return { co: [],
        dan: 'Đổi khoá hiện là sửa mã rồi phát hành — dấu vết nằm ở lịch sử kho mã, ' +
             'không nằm trong app. Tài liệu đòi giữ VĨNH VIỄN, và lịch sử kho mã đúng ' +
             'là vĩnh viễn, nhưng nó không dẫn được người duyệt và kết quả 5 vòng test.' };
    },

    /* BC11 — hồ sơ ca. Bàn Coach và bàn Tư vấn đều giữ hồ sơ ca gắn
       người thực hiện, và TVB_LUAT bắt ca không hồ sơ là chưa xong. */
    HO_SO_CA: function () {
      var co = typeof G.blvNha === 'function' && typeof G.tvbNha === 'function';
      return { co: co ? ['T2','T5'] : [],
        dan: co ? 'G.blvNha(tenCoach) và G.tvbNha(tenTuVan) giữ hồ sơ ca gắn người phụ ' +
                  'trách, đọc ra được bất cứ lúc nào. Thiếu T1 và T3 như mọi thứ khác ' +
                  'trong trình duyệt.'
                : 'chưa có bàn làm việc nào.' };
    },

    CHUYEN_TUYEN: function () {
      var coDung = !!(G.NN_CAM || G.BV_DO_NOI);
      return { co: coDung ? ['T5'] : [],
        dan: coDung ? 'Trợ lý DỪNG khi câu chạm dấu hiệu khẩn và chuyển sang nhánh "việc ' +
                      'này cần người thật" (src/tro-ly-chat.js), và BV_DO_NOI khai đường ' +
                      'nổi của tín hiệu đỏ. Nhưng không lượt chuyển tuyến nào được ghi ' +
                      'lại thành hồ sơ, mà tài liệu đòi giữ TỐI THIỂU 5 NĂM.'
                    : 'chưa có bộ tín hiệu nào.' };
    },

    /* BC13 — tuyên bố phạm vi. Có hiển thị thật, nhưng không lưu bản
       đã hiển thị. Đúng lỗi MG2 lần thứ hai. */
    TUYEN_BO_PHAM_VI: function () {
      var co = !!(G.NN_CAM || G.HL_LUAT12);
      return { co: co ? ['T5'] : [],
        dan: co ? 'Trợ lý nói trước mình làm gì và không làm gì, và NN_CAM cấm chín cấu ' +
                  'trúc câu hứa hẹn — nnSoat() quét trên chính kho. Nhưng không lưu bản ' +
                  'chụp giao diện đã hiển thị, nên khi bị khiếu nại là hứa hẹn quá mức ' +
                  'thì không có bằng chứng đã hiển thị tuyên bố phạm vi. Lỗi MG2.'
                : 'chưa có bộ lọc ngôn ngữ.' };
    }
  };

  /* ═══════════ BẢNG BẰNG CHỨNG ═══════════ */
  G.bcdSoatBangChung = function () {
    var ds = G.BCD_THAOTAC || [];
    if (!ds.length) return { chuaDo: true, thieu: 'BCD_THAOTAC', ds: [] };
    var dem = { DU: 0, MOT_PHAN: 0, CHUA_CO: 0, CHUA_KIEM: 0 }, tongTC = 0;

    var ra = ds.map(function (x) {
      if (x.chuaKiem) { dem.CHUA_KIEM++; return gop(x, { muc: 'CHUA_KIEM', tc: [] }); }
      var f = DO[x.mayKiem];
      if (!f) { dem.CHUA_KIEM++; return gop(x, { muc: 'CHUA_KIEM', tc: [],
        vi: 'khai phép đo "' + x.mayKiem + '" nhưng phép đo ấy không có trong mã' }); }
      var r = f() || {}, tc = r.co || [];
      tongTC += tc.length;
      var muc = tc.length >= 6 ? 'DU' : (tc.length ? 'MOT_PHAN' : 'CHUA_CO');
      dem[muc]++;
      return gop(x, { muc: muc, tc: tc, dan: r.dan });
    });

    return { chuaDo: false, ds: ra, tong: ds.length, dem: dem,
      /* Tỉ lệ tính trên TỔNG SỐ Ô — 13 thao tác × 6 tính chất — chứ
         không tính trên số thao tác. Đếm theo thao tác thì một thao
         tác đạt 1/6 cũng nhìn như đạt. */
      tongO: ds.length * 6, daCo: tongTC,
      phanTram: Math.round(tongTC / (ds.length * 6) * 100) };
  };

  /* KHOÁ: không được khai đủ sáu tính chất cho tất cả. Bảng nào cũng
     đủ là bảng đã hạ chuẩn — và ở đây thì còn tệ hơn thế, vì không
     một thao tác nào trong trình duyệt có T1 được. */
  G.bcdSoiKhongTuNang = function () {
    var s = G.bcdSoatBangChung(), loi = [];
    if (s.chuaDo) return { chuaDo: true, thieu: s.thieu, loi: [] };
    if (s.dem.DU === s.tong)
      loi.push('cả mười ba thao tác đều khai đủ sáu tính chất — bảng đã hạ chuẩn để đạt điểm');
    if (s.dem.CHUA_KIEM === s.tong)
      loi.push('cả mười ba đều chưa kiểm được — bảng chỉ là một danh sách');
    s.ds.forEach(function (x) {
      if (x.muc !== 'CHUA_KIEM' && !x.dan)
        loi.push(x.ma + ' có phép đo chạy mà không dẫn được nguồn');
      if (x.chuaKiem && !x.aiBat)
        loi.push(x.ma + ' khai chưa kiểm được mà không nói AI BẮT được nó');
      if (!x.giu) loi.push(x.ma + ' thiếu ô giữ bao lâu');
      /* T1 là tính chất chặn: có T1 thì phải nằm ngoài trình duyệt.
         Khai T1 cho một thứ sống trong bộ nhớ trang là khai sai. */
      if ((x.tc || []).indexOf('T1') >= 0 && !/máy chủ|server|audit_/i.test(String(x.dan || '')))
        loi.push(x.ma + ' khai có T1 (không sửa được) mà nguồn không nằm ngoài trình duyệt');
    });
    if ((G.BCD_TINHCHAT || []).length !== 6)
      loi.push('phải có đúng sáu tính chất, đang có ' + (G.BCD_TINHCHAT || []).length);
    if (!(G.BCD_THAOTAC_LUAT || {}).mayKiemLaCotDatNhat)
      loi.push('chưa khai vì sao cột mayKiem là cột đắt nhất');
    return { chuaDo: false, loi: loi, dem: s.dem };
  };

  /* ═══════════ HAI MƯƠI MỤC NGHIÊM TRỌNG ═══════════ */
  G.rspSoiChan = function () {
    var ds = G.RSP_CHAN || [], loi = [];
    if (!ds.length) return { chuaDo: true, thieu: 'RSP_CHAN', loi: [] };
    if (ds.length !== 20) loi.push('bản rà soát khai hai mươi mục nghiêm trọng, đang có ' + ds.length);
    var hop = ['DA_DONG', 'CON_HO', 'NGOAI_APP'], thay = {};
    ds.forEach(function (x) {
      if (thay[x.ma]) loi.push(x.ma + ' trùng mã');
      thay[x.ma] = 1;
      ['ten', 'rui', 'ungDung', 'noiUngDung', 'lamGi'].forEach(function (k) {
        if (!x[k]) loi.push(x.ma + ' thiếu ô ' + k);
      });
      if (hop.indexOf(x.ungDung) < 0)
        loi.push(x.ma + ' khai trạng thái "' + x.ungDung + '" không hợp lệ');
      /* Khai ĐÃ ĐÓNG thì phải dẫn được tên hàm hoặc tên kho. Cùng
         phép chặn với rsSoiChan() ở 9.65, và cùng lý do: không dẫn
         được thì nó là CÒN HỞ, và làm tròn lên là cách sổ lỗi chết. */
      if (x.ungDung === 'DA_DONG' && !/[a-zA-Z_]{3,}\(\)|[A-Z][A-Z0-9_]{3,}/.test(String(x.noiUngDung)))
        loi.push(x.ma + ' khai ĐÃ ĐÓNG mà không dẫn được tên hàm hoặc tên kho');
      var nh = (G.RSP_NHOM || []).filter(function (n) { return n.ma === x.nhom; })[0];
      if (!nh) loi.push(x.ma + ' thuộc nhóm "' + x.nhom + '" không có trong bảng nhóm');
    });
    var tongNang = (G.RSP_NHOM || []).reduce(function (s, n) { return s + (n.nang || 0); }, 0);
    if (tongNang !== 20)
      loi.push('tổng cột nghiêm trọng của tám nhóm là ' + tongNang + ', phải bằng 20');
    var tongSo = (G.RSP_NHOM || []).reduce(function (s, n) { return s + (n.so || 0); }, 0);
    if (tongSo !== 64)
      loi.push('tổng phát hiện của tám nhóm là ' + tongSo + ', bản rà soát nói 64');
    if (!(G.RSP_CHAN_LUAT || {}).daDongPhaiDanDuoc)
      loi.push('chưa khai luật phải dẫn được tên hàm');
    return { chuaDo: false, loi: loi, so: ds.length };
  };

  G.rspDo = function () {
    var ds = G.RSP_CHAN || [], d = { DA_DONG: 0, CON_HO: 0, NGOAI_APP: 0 };
    ds.forEach(function (x) { d[x.ungDung] = (d[x.ungDung] || 0) + 1; });
    return { tong: ds.length, dem: d,
      tongPhatHien: (G.RSP_NHOM || []).reduce(function (s, n) { return s + (n.so || 0); }, 0) };
  };

  /* KHOÁ: mỗi chỗ lệch phải nêu CẢ HAI bên và một hướng đề xuất.
     Nêu một bên thì đó là lời phàn nàn, không phải chỗ lệch. */
  G.rspSoiLech = function () {
    var ds = G.RSP_LECH || [], loi = [];
    if (!ds.length) return { chuaDo: true, thieu: 'RSP_LECH', loi: [] };
    ds.forEach(function (x) {
      ['ten', 'taiLieuNoi', 'ungDungLam', 'viSaoQuanTrong', 'huongDeXuat'].forEach(function (k) {
        if (!x[k]) loi.push(x.ma + ' thiếu ô ' + k);
      });
      if (x.taiLieuNoi && x.ungDungLam &&
          String(x.taiLieuNoi).trim() === String(x.ungDungLam).trim())
        loi.push(x.ma + ' — hai bên chép lại y nhau, vậy không có chỗ lệch nào');
    });
    if (!ds.filter(function (x) { return x.nguy; }).length)
      loi.push('không chỗ lệch nào đánh nguy — nếu thật thế thì bốn chỗ này không đáng ghi');
    if (!(G.RSP_LECH_LUAT || {}).ghiChuTuQuyet)
      loi.push('chưa khai luật máy không tự quyết chỗ lệch');
    return { chuaDo: false, loi: loi, so: ds.length };
  };

  /* ═══════════ SÁU ĐIỀU KHOẢN ĐẶC THÙ — ĐỐI CHIẾU NGƯỢC ═══════════

     Không đọc HSH_DK6 rồi gật. Đi từ danh sách phaiCoO sang HSH_HD và
     kiểm hợp đồng ấy có khai điều khoản ấy trong ô nen không. Đọc
     xuôi thì hai bảng cùng sai vẫn xanh. */
  G.hsSoiDK6 = function () {
    var d6 = G.HSH_DK6 || [], hd = G.HSH_HD || [], loi = [];
    if (!d6.length) return { chuaDo: true, thieu: 'HSH_DK6', loi: [] };
    if (d6.length !== 6) loi.push('phải có sáu điều khoản đặc thù, đang có ' + d6.length);
    if (hd.length !== 16) loi.push('bộ hồ sơ khai mười sáu hợp đồng, đang có ' + hd.length);

    var mucHD = {};
    hd.forEach(function (x) { mucHD[x.ma] = x; });

    d6.forEach(function (dk) {
      ['ten', 'loi', 'phaiCoO', 'ungDungCo'].forEach(function (k) {
        if (!dk[k]) loi.push(dk.ma + ' thiếu ô ' + k);
      });
      /* Điều khoản đặc thù phải có mặt trong ngân hàng 25 và phải
         được đánh dấu dacThu ở đó — hai bảng phải nhất quán. */
      var oNgan = (G.HSH_DK || []).filter(function (n) { return n.ma === dk.ma; })[0];
      if (!oNgan) loi.push(dk.ma + ' không có trong ngân hàng điều khoản nền');
      else if (!oNgan.dacThu) loi.push(dk.ma + ' là điều khoản đặc thù mà ngân hàng không đánh dấu');

      (dk.phaiCoO || []).forEach(function (ma) {
        var x = mucHD[ma];
        if (!x) { loi.push(dk.ma + ' đòi có ở ' + ma + ' — hợp đồng ấy không tồn tại'); return; }
        if ((x.nen || []).indexOf(dk.ma) < 0)
          loi.push(ma + ' phải có ' + dk.ma + ' mà không khai trong ô nen');
      });
    });

    /* Mọi mã điều khoản mà hợp đồng trỏ vào đều phải có thật trong
       ngân hàng. Trỏ vào chỗ trống là mối nối gãy trong im lặng. */
    var coDK = {};
    (G.HSH_DK || []).forEach(function (x) { coDK[x.ma] = 1; });
    hd.forEach(function (x) {
      ['ten', 'ben', 'dich', 'han', 'nen', 'rieng', 'bay'].forEach(function (k) {
        if (!x[k] || (Array.isArray(x[k]) && !x[k].length)) loi.push(x.ma + ' thiếu ô ' + k);
      });
      (x.nen || []).forEach(function (m) {
        if (!coDK[m]) loi.push(x.ma + ' trỏ vào ' + m + ' — điều khoản ấy không có trong ngân hàng');
      });
    });

    if (!(G.HSH_DK6_LUAT || {}).doiChieuNguoc) loi.push('chưa khai luật đối chiếu ngược');
    if (!(G.HSH_LOI || {}).chuaThamDinh) loi.push('chưa khai câu cảnh báo bộ khung chưa thẩm định');
    return { chuaDo: false, loi: loi, so: d6.length, soHD: hd.length };
  };

  /* ═══════════ CÔNG THỨC LƯƠNG KHÔNG ĐẾM ĐẦU NGƯỜI ═══════════

     Tài liệu tự nói: "Đây là ràng buộc kỹ thuật, kiểm được bằng cách
     đọc công thức." Nên phép này ĐỌC THẬT — nó quét các kho thù lao
     đang nạp và tìm dấu hiệu tính theo số người đưa vào hệ.

     Chỗ dễ sai, và đã sai ba lần trong kho này: mẫu bắt cả câu CẤM
     việc ấy. "Không tính theo số người đưa vào hệ" chứa đúng cụm cần
     tìm. Nên mỗi mẫu mang một cặp tự kiểm, và cặp ấy chạy TRƯỚC khi
     mẫu được phép xử ai. */
  var CAM_LUONG = [
    { ten: 'thù lao theo số người tuyển',
      re: /(theo|tính theo|nhân với|×|x)\s*(số|đầu)\s*(người|thành viên|tuyến dưới|F\d)/i,
      bat: 'Thưởng tháng tính theo số người tuyến dưới đưa vào hệ.',
      khongBat: 'Thù lao KHÔNG tính theo số người đưa vào hệ dưới bất kỳ hình thức nào.' },
    { ten: 'tầng tuyến dưới',
      re: /(hoa hồng|thù lao|thưởng|hưởng)\s+\S*\s*(tầng|cấp)\s*(hai|ba|2|3)\s*(tuyến|dưới)/i,
      bat: 'Hoa hồng tầng hai tuyến dưới trả 3%.',
      khongBat: 'Không có hoa hồng tầng hai tuyến dưới — trần hai bậc là hết.' },
    { ten: 'thưởng theo thời gian ở lại',
      re: /(thưởng|hệ số)\s+\S*\s*(theo|tính theo)\s+(thời gian|số tháng)\s+(ở lại|gắn bó|lưu)/i,
      bat: 'Thưởng quý tính theo thời gian ở lại của khách.',
      khongBat: 'Không thưởng theo thời gian ở lại — chỉ số dùng cho thưởng là hành vi thật.' }
  ];

  /* Ô nào mang TÊN là một danh sách cấm thì nội dung của nó đương
     nhiên là việc KHÔNG được làm. Bắt nó là bắt oan chính câu luật.
     Cùng phép chặn với O_CAM của bộ soát ngôn ngữ ở 9.63. */
  var O_CAM = /^(khongLam|khong|cam|camLam|khongDuoc|tuyetDoiKhong|khongNoi|cauCam|bay|loi|viPham|truot|khongDungDe)$/;

  function oLaBangCam(duong) {
    /* Đường dẫn dạng DAISU.vinhDanh.khongLam[3] — lấy tên ô cuối
       cùng, bỏ phần chỉ số mảng. */
    var doan = String(duong).split('.');
    for (var i = doan.length - 1; i >= 0; i--) {
      var ten = doan[i].replace(/\[\d+\]$/, '');
      if (O_CAM.test(ten)) return true;
    }
    return false;
  }

  function coTuChoi(cau, vt) {
    /* Câu phủ định trước cụm bị bắt thì không phải vi phạm — nó là
       chính câu luật cấm việc ấy.

       Nhìn lui tới ĐẦU MỆNH ĐỀ, không nhìn lui một số ký tự cố định.
       Bản đầu nhìn lui 60 ký tự và đã tha oan hụt một câu thật:
       "Không quy đổi điểm đại sứ thành hoa hồng tiền mặt, chiết khấu
       học phí theo số người giới thiệu được…" — chữ Không đứng ở ký
       tự 0, chỗ khớp ở ký tự 70. Một con số cố định thì luôn có câu
       dài hơn nó. */
    var dau = cau.slice(0, vt);
    var menh = dau.split(/[.!?;]\s/).pop();
    return /(^|[^a-zA-ZÀ-ỹ])(không|chưa|cấm|đừng|tránh|thay vì|chớ)([^a-zA-ZÀ-ỹ]|$)/i.test(menh);
  }

  G.hsSoiLuong = function () {
    var loi = [];

    /* ── Mẫu tự kiểm trước khi kiểm người khác ──
       Một phép kiểm chưa từng đỏ thì chưa phải phép kiểm, nên cả ba
       mẫu và cả phép chặn phủ định đều phải chứng minh mình còn sống
       TRƯỚC khi được phép xử ai. */
    CAM_LUONG.forEach(function (c) {
      var mBat = c.bat.match(c.re);
      if (!mBat) loi.push('MẪU HỎNG · "' + c.ten + '" không bắt được câu đáng lẽ phải bắt');
      var mKhong = c.khongBat.match(c.re);
      if (mKhong && !coTuChoi(c.khongBat, mKhong.index))
        loi.push('MẪU HỎNG · "' + c.ten + '" bắt oan câu tuân thủ');
    });

    /* Phép chặn phủ định: câu cấm DÀI — phủ định ở đầu, chỗ khớp ở
       cuối — phải được tha; đúng câu ấy bỏ chữ đầu thì phải bị bắt. */
    var CAU_DAI = 'Không quy đổi điểm đại sứ thành hoa hồng tiền mặt, chiết khấu học phí ' +
        'theo số người giới thiệu được, hay bất kỳ cơ chế nào khiến chia sẻ thành bán hàng.';
    var CAU_VI = CAU_DAI.replace(/^Không quy đổi/, 'Quy đổi');
    var mD = CAU_DAI.match(CAM_LUONG[0].re), mV = CAU_VI.match(CAM_LUONG[0].re);
    if (!mD || !coTuChoi(CAU_DAI, mD.index))
      loi.push('PHÉP CHẶN HỎNG · câu cấm dài bị bắt oan — phủ định ở đầu câu không còn được thấy');
    if (mV && coTuChoi(CAU_VI, mV.index))
      loi.push('PHÉP CHẶN HỎNG · bỏ chữ phủ định rồi mà vẫn được tha');

    /* Ô mang tên là bảng cấm thì phải được nhận ra. */
    if (!oLaBangCam('DAISU.vinhDanh.khongLam[3]'))
      loi.push('PHÉP CHẶN HỎNG · không nhận ra ô khongLam là một bảng cấm');
    if (oLaBangCam('HOAHONG.thuongMoi'))
      loi.push('PHÉP CHẶN HỎNG · nhận nhầm một ô thường thành bảng cấm');

    /* ── Quét kho thù lao đang nạp ──

       Quét TỪNG TRƯỜNG, không quét cả kho đã dồn thành một chuỗi.

       Bản đầu của phép này dồn cả kho bằng JSON.stringify rồi tìm
       trên chuỗi ấy. Nó câm: phép chặn phủ định nhìn lui 60 ký tự
       trước chỗ khớp, mà trong một chuỗi dồn thì 60 ký tự ấy là
       TRƯỜNG BÊN CẠNH. Kho HOAHONG có đầy chữ "không" ở các trường
       khác, nên câu vi phạm cấy vào được tha oan.

       Đây là lần thứ tư kho này gặp đúng lớp lỗi ấy — bộ lọc đọc
       nhầm ranh giới. Chữa bằng cách đi từng trường: phép chặn phủ
       định chỉ được nhìn trong lòng MỘT câu. */
    var KHO = ['HOAHONG', 'HOA_HONG_KEM', 'DAISU', 'REWARD', 'KPI', 'CV_HANG',
               'HSH_BAC', 'HSH_LUONG_LUAT', 'REFERRAL'];
    var doc = 0, truong = [];
    function diTung(v, duong) {
      if (typeof v === 'string') { truong.push({ duong: duong, cau: v }); return; }
      if (Array.isArray(v)) { v.forEach(function (x, i) { diTung(x, duong + '[' + i + ']'); }); return; }
      if (v && typeof v === 'object')
        Object.keys(v).forEach(function (k) { diTung(v[k], duong + '.' + k); });
    }
    KHO.forEach(function (k) {
      if (G[k] === undefined) return;
      doc++;
      diTung(G[k], k);
    });
    if (!doc) return { chuaDo: true, thieu: 'kho thù lao chưa nạp', loi: [] };

    truong.forEach(function (t) {
      if (oLaBangCam(t.duong)) return;
      CAM_LUONG.forEach(function (c) {
        var m = t.cau.match(c.re);
        if (m && !coTuChoi(t.cau, m.index))
          loi.push(t.duong + ' có dấu hiệu "' + c.ten + '": …' +
            t.cau.slice(Math.max(0, m.index - 30), m.index + 60) + '…');
      });
    });

    /* Trần hoa hồng phải còn nguyên. Đây là con số chủ hệ đã chốt, và
       nó phải đọc được từ kho chứ không chép vào đây. */
    var tran = (G.HOAHONG || {}).tran;
    if (typeof tran !== 'number') loi.push('G.HOAHONG.tran không còn là một con số');

    /* Nguyên tắc NL1 phải tự khai là kiểm được — không thì phép này
       đang canh một luật mà bảng không thừa nhận. */
    var nl1 = (G.HSH_LUONG_LUAT || []).filter(function (x) { return x.ma === 'NL1'; })[0];
    if (!nl1) loi.push('HSH_LUONG_LUAT thiếu nguyên tắc NL1');
    else if (!nl1.tuKiemDuoc) loi.push('NL1 không khai tuKiemDuoc — vậy phép đọc công thức đang canh gì');

    return { chuaDo: false, loi: loi, soKho: doc, soTruong: truong.length, tran: tran };
  };

  /* ═══════════════════════════════════════════════════════════
     MÀN HÌNH
     ═══════════════════════════════════════════════════════════ */
  var MAU = { DA_DONG: '#0B6675', CON_HO: '#BE0E16', NGOAI_APP: '#655F7E',
              DU: '#0B6675', MOT_PHAN: '#B4720F', CHUA_CO: '#BE0E16', CHUA_KIEM: '#655F7E' };
  var NHAN = { DA_DONG: 'ỨNG DỤNG ĐÃ ĐÓNG', CON_HO: 'CÒN HỞ', NGOAI_APP: 'NGOÀI PHẠM VI WEB APP',
               DU: 'ĐỦ SÁU TÍNH CHẤT', MOT_PHAN: 'ĐƯỢC MỘT PHẦN', CHUA_CO: 'CHƯA CÓ',
               CHUA_KIEM: 'CHƯA KIỂM ĐƯỢC' };

  function oDem(dem, ma, tong) {
    return ma.map(function (m) {
      return '<div style="min-width:180px"><span class="tiny up" style="color:' + MAU[m] +
        '">' + h(NHAN[m]) + '</span><br><b style="font-size:1.7em;color:' + MAU[m] + '">' +
        (dem[m] || 0) + '</b>' + (tong ? '<span class="tiny dim"> / ' + tong + '</span>' : '') +
        '</div>';
    }).join('');
  }

  /* ── MÀN 1: RÀ SOÁT PHÁP LÝ ─────────────────────────────────── */
  G.VIEWS['ra-soat-phap-ly'] = function () {
    if (!G.RSP_CHAN)
      return U.empty('Chưa mở được phần này',
        'Bản rà soát pháp lý nằm trong gói nghề. Đăng nhập bằng tài khoản có quyền nghề để nạp.');

    var loi = G.RSP_LOI || {}, d = G.rspDo();
    var lech = [].concat(G.rspSoiChan().loi || [], G.rspSoiLech().loi || []);

    var o = U.ph({ eyebrow: 'RÀ SOÁT PHÁP LÝ', ic: 'shield', grad: 1,
      t: 'Sáu mươi tư phát hiện · hai mươi nghiêm trọng',
      lead: loi.baViecLamDuoc || '' });

    o += '<div class="card mb" style="border-color:' + (lech.length ? '#BE0E16' : '#B4720F') + '56">' +
      '<b class="sm" style="color:#B4720F">' + h(loi.cauDatNhat || '') + '</b>' +
      '<p class="tiny mt" style="line-height:1.75">' + h(loi.khongPhaiLuatSu || '') + '</p>' +
      '<p class="tiny mt" style="line-height:1.75">' + h(loi.viSaoDoiChieuChuKhongChep || '') + '</p>' +
      '<p class="tiny dim mt" style="line-height:1.7">' + h(loi.nguon || '') + '</p>' +
      (lech.length ? '<p class="tiny mt" style="line-height:1.7;color:#BE0E16"><b>LỆCH: ' +
        h(lech.slice(0, 4).join(' · ')) + '</b></p>' : '') + '</div>';

    /* Hai luật mới */
    o += U.sec('Hai luật mới mà bộ hồ sơ chưa có điều khoản nào',
      (G.RSP_LUATMOI_LUAT || {}).khongDoanNgay || '');
    o += '<div class="card mb">' + (G.RSP_LUATMOI || []).map(function (x) {
      return '<div style="padding:11px 0;border-bottom:1px solid var(--gita-vien-2)">' +
        '<b class="sm">' + h(x.ten) + '</b> <span class="tiny dim">hiệu lực ' + h(x.hieuLuc) + '</span>' +
        '<p class="tiny mt" style="line-height:1.75"><b>Chạm vào đâu:</b> ' + h(x.chamVaoDau) + '</p>' +
        '<p class="tiny mt" style="line-height:1.75;color:#0B6675"><b>Ứng dụng đang có:</b> ' +
        h(x.ungDungDangCo) + '</p>' +
        '<p class="tiny" style="line-height:1.75;color:#B4720F"><b>Chờ luật sư:</b> ' +
        h(x.choLuatSu) + '</p></div>';
    }).join('') + '</div>';

    /* Đối chiếu 20 mục nghiêm trọng */
    o += U.sec('Hai mươi mục nghiêm trọng — ứng dụng này đang ở đâu',
      (G.RSP_CHAN_LUAT || {}).khongTuKhenDuDo || '');
    o += '<div class="card mb" style="border-color:#B4720F56">' +
      '<div style="display:flex;flex-wrap:wrap;gap:18px;align-items:baseline">' +
      oDem(d.dem, ['DA_DONG', 'CON_HO', 'NGOAI_APP'], d.tong) + '</div>' +
      '<p class="tiny mt" style="line-height:1.75">' +
      h((G.RSP_CHAN_LUAT || {}).ngoaiAppKhongPhaiXong || '') + '</p></div>';

    o += '<div class="card mb">' + (G.RSP_CHAN || []).map(function (x) {
      return '<div style="padding:11px 0;border-bottom:1px solid var(--gita-vien-2)">' +
        '<b class="sm">' + h(x.ma) + ' · ' + h(x.ten) + '</b> ' +
        '<span class="tiny up" style="color:' + MAU[x.ungDung] + '">' + h(NHAN[x.ungDung]) + '</span>' +
        '<p class="tiny mt" style="line-height:1.75;color:#BE0E16"><b>Rủi ro:</b> ' + h(x.rui) + '</p>' +
        '<p class="tiny mt" style="line-height:1.75;color:' + MAU[x.ungDung] + '">' +
        '<b>Ứng dụng:</b> ' + h(x.noiUngDung) + '</p>' +
        '<p class="tiny dim" style="line-height:1.7"><b>Phải làm:</b> ' + h(x.lamGi) + '</p></div>';
    }).join('') + '</div>';

    o += G.kaKhung ? G.kaKhung('ra-soat-phap-ly', 'dau') : '';

    /* Chỗ lệch */
    o += U.sec('Bốn chỗ tài liệu và ứng dụng nói khác nhau',
      (G.RSP_LECH_LUAT || {}).ghiChuTuQuyet || '');
    o += '<div class="card mb">' + (G.RSP_LECH || []).map(function (x) {
      return '<div style="padding:12px 0;border-bottom:1px solid var(--gita-vien-2)">' +
        '<b class="sm">' + h(x.ma) + ' · ' + h(x.ten) + '</b>' +
        (x.nguy ? ' <span class="tiny up" style="color:#BE0E16">HAI BÊN LOẠI TRỪ NHAU</span>' : '') +
        '<p class="tiny mt" style="line-height:1.75"><b>Tài liệu nói:</b> ' + h(x.taiLieuNoi) + '</p>' +
        '<p class="tiny" style="line-height:1.75"><b>Ứng dụng làm:</b> ' + h(x.ungDungLam) + '</p>' +
        '<p class="tiny mt" style="line-height:1.75;color:#BE0E16">' + h(x.viSaoQuanTrong) + '</p>' +
        '<p class="tiny mt" style="line-height:1.75;color:#0B6675"><b>Hướng đề xuất:</b> ' +
        h(x.huongDeXuat) + '</p></div>';
    }).join('') + '</div>';

    /* Tám nhóm · năm lỗi gốc */
    o += U.sec('Tám nhóm phát hiện', '');
    o += '<div class="card mb">' + U.tbl(
      ['Nhóm', 'Tên', 'Phát hiện', 'Nghiêm trọng'],
      (G.RSP_NHOM || []).map(function (x) {
        return [h(x.ma), h(x.ten) + '<br><span class="tiny dim">' + h(x.gon) + '</span>',
          String(x.so), '<b style="color:' + (x.nang ? '#BE0E16' : '#0B6675') + '">' + x.nang + '</b>'];
      })) + '</div>';

    o += U.sec('Năm lỗi gốc', '');
    o += '<div class="card mb">' + (G.RSP_GOC || []).map(function (x) {
      return '<div style="padding:9px 0;border-bottom:1px solid var(--gita-vien-2)">' +
        '<b class="sm">' + h(x.ma) + ' · ' + h(x.ten) + '</b>' +
        '<p class="tiny mt" style="line-height:1.75">' + h(x.vi) + '</p></div>';
    }).join('') + '</div>';

    /* Mười hai văn bản · ba điều khoản nền mới */
    o += U.sec('Mười hai văn bản cần bổ sung và ba điều khoản nền mới', '');
    o += '<div class="card mb">' + U.tbl(['Mã', 'Văn bản', 'Vì sao cần', 'Khi nào'],
      (G.RSP_VB || []).map(function (x) {
        return [h(x.ma), h(x.ten), h(x.vi),
          '<b style="color:' + (/Trước khi mở/.test(x.khi) ? '#BE0E16' : '#B4720F') + '">' +
            h(x.khi) + '</b>'];
      })) + '</div>';

    o += '<div class="card mb">' + (G.RSP_DKMOI || []).map(function (x) {
      return '<div style="padding:9px 0;border-bottom:1px solid var(--gita-vien-2)">' +
        '<b class="sm">' + h(x.ma) + ' · ' + h(x.ten) + '</b> ' +
        '<span class="tiny dim">bắt buộc với: ' + h(x.batBuocVoi) + '</span>' +
        '<p class="tiny mt" style="line-height:1.75">' + h(x.loi) + '</p></div>';
    }).join('') + '</div>';

    /* Bốn đợt · chín việc cùng luật sư */
    o += U.sec('Bốn đợt xử lý', '');
    o += '<div class="card mb">' + U.tbl(['Đợt', 'Phạm vi', 'Điều kiện đóng đợt'],
      (G.RSP_DOT || []).map(function (x) {
        return ['<b>' + h(x.ma) + '</b><br><span class="tiny dim">' + h(x.ten) + '</span>',
          h(x.gom), h(x.dong)];
      })) + '</div>';

    o += U.sec('Chín việc bắt buộc làm cùng luật sư',
      'Không việc nào trong chín việc này máy làm thay được.');
    o += '<div class="card mb">' + (G.RSP_LUATSU || []).map(function (x, i) {
      return '<p class="tiny" style="line-height:1.8;padding:5px 0;border-bottom:1px solid var(--gita-vien-2)">' +
        '<b style="color:#B4720F">' + (i + 1) + '.</b> ' + h(x) + '</p>';
    }).join('') + '</div>';

    return o;
  };

  /* ── MÀN 2: CHUẨN BẰNG CHỨNG ─────────────────────────────────── */
  G.VIEWS['bang-chung'] = function () {
    if (!G.BCD_THAOTAC)
      return U.empty('Chưa mở được phần này',
        'Chuẩn bằng chứng nằm trong gói nghề. Đăng nhập bằng tài khoản có quyền nghề để nạp.');

    var loi = G.BCD_LOI || {}, s = G.bcdSoatBangChung();
    var lech = G.bcdSoiKhongTuNang().loi || [];
    var cat = secLogCatBot();

    var o = U.ph({ eyebrow: 'CHUẨN BẰNG CHỨNG ĐIỆN TỬ', ic: 'lock', grad: 1,
      t: 'Mười ba thao tác · sáu tính chất · máy tự đo',
      lead: loi.baThuCuuDuoc || '' });

    o += '<div class="card mb" style="border-color:' + (lech.length ? '#BE0E16' : '#B4720F') + '56">' +
      '<b class="sm" style="color:#B4720F">' + h(loi.cauDatNhat || '') + '</b>' +
      '<p class="tiny mt" style="line-height:1.75">' + h(loi.viSaoMayTuDo || '') + '</p>' +
      '<p class="tiny dim mt" style="line-height:1.7">' + h(loi.nguon || '') + '</p>' +
      (lech.length ? '<p class="tiny mt" style="line-height:1.7;color:#BE0E16"><b>LỆCH: ' +
        h(lech.slice(0, 4).join(' · ')) + '</b></p>' : '') + '</div>';

    /* Số đo */
    o += U.sec('Mười ba thao tác — ứng dụng sinh được bằng chứng cho mấy cái',
      (G.BCD_THAOTAC_LUAT || {}).mayKiemLaCotDatNhat || '');
    o += '<div class="card mb" style="border-color:#BE0E1656">' +
      '<div style="display:flex;flex-wrap:wrap;gap:18px;align-items:baseline">' +
      oDem(s.dem, ['DU', 'MOT_PHAN', 'CHUA_CO', 'CHUA_KIEM']) +
      '<div style="min-width:200px"><span class="tiny up" style="color:#BE0E16">Ô ĐẠT / TỔNG Ô</span>' +
      '<br><b style="font-size:1.7em;color:#BE0E16">' + s.daCo + '</b>' +
      '<span class="tiny dim"> / ' + s.tongO + ' · ' + s.phanTram + '%</span></div></div>' +
      '<p class="tiny mt" style="line-height:1.75">' +
      h((G.BCD_LUAT || {}).bonTrenMuoiBaLaThatTha || '') + '</p>' +
      (cat ? '<p class="tiny mt" style="line-height:1.75;color:#BE0E16"><b>Đo trực tiếp:</b> ' +
        'G.SECLOG đang giữ ' + cat.dangGiu + ' dòng và ' +
        (cat.catDuoc ? 'CẮT ĐƯỢC — mảng thường, pop() được, không đóng băng. Tính chất T1 ' +
          '(không sửa được) không thao tác nào trong trình duyệt có.'
                     : 'đã đóng băng.') + '</p>' : '') + '</div>';

    /* Bảng thao tác */
    o += '<div class="card mb">' + (s.ds || []).map(function (x) {
      var tc = x.tc || [];
      return '<div style="padding:11px 0;border-bottom:1px solid var(--gita-vien-2)">' +
        '<b class="sm">' + h(x.ma) + ' · ' + h(x.ten) + '</b> ' +
        '<span class="tiny up" style="color:' + MAU[x.muc] + '">' + h(NHAN[x.muc]) + '</span> ' +
        '<span class="tiny dim">' + tc.length + '/6</span>' +
        '<p class="tiny mt" style="line-height:1.75"><b>Phải có:</b> ' + h(x.phaiCo) + '</p>' +
        '<p class="tiny" style="line-height:1.75"><b>Giữ bao lâu:</b> ' + h(x.giu) + '</p>' +
        (tc.length ? '<p class="tiny mt" style="line-height:1.7;color:#0B6675"><b>Đang có:</b> ' +
          h(tc.join(' · ')) + '</p>' : '') +
        (x.dan ? '<p class="tiny mt" style="line-height:1.75">' + h(x.dan) + '</p>' : '') +
        (x.chuaKiem ? '<p class="tiny" style="line-height:1.75;color:#655F7E">' +
          h(x.chuaKiem) + ' <b>Ai bắt:</b> ' + h(x.aiBat || '') + '</p>' : '') +
        '</div>';
    }).join('') + '</div>';

    o += G.kaKhung ? G.kaKhung('bang-chung', 'dau') : '';

    /* Sáu tính chất */
    o += U.sec('Sáu tính chất một bằng chứng phải có',
      (G.BCD_TINHCHAT_LUAT || {}).thuTuSupDo || '');
    o += '<div class="card mb">' + (G.BCD_TINHCHAT || []).map(function (x) {
      return '<div style="padding:9px 0;border-bottom:1px solid var(--gita-vien-2)">' +
        '<b class="sm">' + h(x.ma) + ' · ' + h(x.ten) + '</b>' +
        '<p class="tiny mt" style="line-height:1.75">' + h(x.loi) + '</p>' +
        (x.viLaDau ? '<p class="tiny" style="line-height:1.75;color:#BE0E16">' + h(x.viLaDau) + '</p>' : '') +
        (x.haiChieu ? '<p class="tiny" style="line-height:1.75;color:#B4720F">' + h(x.haiChieu) + '</p>' : '') +
        '</div>';
    }).join('') + '</div>';

    /* Ba lỗi làm mất giá trị */
    o += U.sec('Ba lỗi làm bằng chứng mất giá trị',
      (G.BCD_MATGIA_LUAT || {}).ghiCaChoMinhSai || '');
    o += '<div class="card mb">' + (G.BCD_MATGIA || []).map(function (x) {
      return '<div style="padding:11px 0;border-bottom:1px solid var(--gita-vien-2)">' +
        '<b class="sm" style="color:#BE0E16">' + h(x.ma) + ' · ' + h(x.loi) + '</b>' +
        '<p class="tiny mt" style="line-height:1.75">' + h(x.vi) + '</p>' +
        '<p class="tiny" style="line-height:1.75;color:#0B6675"><b>Cách tránh:</b> ' + h(x.tranh) + '</p>' +
        '<p class="tiny mt" style="line-height:1.75;color:#B4720F"><b>Ứng dụng này:</b> ' +
        h(x.ungDungNay) + '</p></div>';
    }).join('') + '</div>';

    /* Việc gần nhất */
    o += U.sec('Năm việc gần nhất, xếp theo thứ tự gỡ được nhiều nhất', '');
    o += '<div class="card mb">' + U.tbl(['Ưu tiên', 'Việc', 'Vì sao', 'Ở đâu'],
      (G.BCD_VIECGAN || []).map(function (x) {
        return ['<b style="color:#BE0E16">' + x.uu + '</b>', h(x.viec), h(x.vi),
          '<span class="tiny dim">' + h(x.cho) + '</span>'];
      })) + '</div>';

    return o;
  };

  /* ── MÀN 3: BỘ HỒ SƠ HỢP ĐỒNG ────────────────────────────────── */
  G.VIEWS['ho-so-hop-dong'] = function () {
    if (!G.HSH_HD)
      return U.empty('Chưa mở được phần này',
        'Bộ hồ sơ hợp đồng nằm trong gói nghề. Đăng nhập bằng tài khoản có quyền nghề để nạp.');

    var loi = G.HSH_LOI || {};
    var kq = G.hsSoiDK6(), kqL = G.hsSoiLuong();
    var lech = [].concat(kq.loi || [], kqL.loi || []);

    var o = U.ph({ eyebrow: 'BỘ HỒ SƠ HỢP ĐỒNG VÀ VẬN HÀNH', ic: 'book', grad: 1,
      t: 'Mười sáu hợp đồng · hai mươi lăm điều khoản nền',
      lead: loi.viSaoLapTuNganHang || '' });

    o += '<div class="card mb" style="border-color:#BE0E1656">' +
      '<b class="sm" style="color:#BE0E16">' + h(loi.chuaThamDinh || '') + '</b>' +
      '<p class="tiny mt" style="line-height:1.75">' + h(loi.bonNhomBatBuocRieng || '') + '</p>' +
      '<p class="tiny mt" style="line-height:1.75">' + h(loi.khongChepNoiDung || '') + '</p>' +
      '<p class="tiny dim mt" style="line-height:1.7">' + h(loi.nguon || '') + '</p>' +
      (lech.length ? '<p class="tiny mt" style="line-height:1.7;color:#BE0E16"><b>LỆCH: ' +
        h(lech.slice(0, 4).join(' · ')) + '</b></p>' : '') + '</div>';

    /* Sáu điều khoản đặc thù */
    o += U.sec('Sáu điều khoản đặc thù không được bỏ',
      (G.HSH_DK6_LUAT || {}).khongPhaiSauDieuHay || '');
    o += '<div class="card mb">' + (G.HSH_DK6 || []).map(function (x) {
      return '<div style="padding:12px 0;border-bottom:1px solid var(--gita-vien-2)">' +
        '<b class="sm">' + h(x.ma) + ' · ' + h(x.ten) + '</b> ' +
        '<span class="tiny dim">' + (x.phaiCoO || []).length + ' hợp đồng bắt buộc có</span>' +
        '<p class="tiny mt" style="line-height:1.75">' + h(x.loi) + '</p>' +
        (x.viCanThiet ? '<p class="tiny" style="line-height:1.75;color:#BE0E16">' +
          h(x.viCanThiet) + '</p>' : '') +
        '<p class="tiny mt" style="line-height:1.75;color:#0B6675"><b>Ứng dụng đang có:</b> ' +
        h(x.ungDungCo) + '</p>' +
        '<p class="tiny dim" style="line-height:1.7">Phải có ở: ' +
        h((x.phaiCoO || []).join(' · ')) + '</p></div>';
    }).join('') + '</div>';

    /* Nguyên tắc lương */
    o += U.sec('Bốn nguyên tắc bất biến của bảng lương',
      (G.HSH_LUAT || {}).luongLaDieuMayCanhDuoc || '');
    o += '<div class="card mb" style="border-color:' + (kqL.loi && kqL.loi.length ? '#BE0E16' : '#0B6675') + '56">' +
      (G.HSH_LUONG_LUAT || []).map(function (x) {
        return '<div style="padding:10px 0;border-bottom:1px solid var(--gita-vien-2)">' +
          '<b class="sm">' + h(x.ma) + ' · ' + h(x.luat) + '</b>' +
          (x.tuKiemDuoc ? ' <span class="tiny up" style="color:#0B6675">MÁY CANH ĐƯỢC</span>' : '') +
          '<p class="tiny mt" style="line-height:1.75">' + h(x.loi) + '</p>' +
          (x.vi ? '<p class="tiny" style="line-height:1.75;color:#B4720F">' + h(x.vi) + '</p>' : '') +
          (x.tuKiemThuNao ? '<p class="tiny mt" style="line-height:1.75;color:#0B6675">' +
            h(x.tuKiemThuNao) + '</p>' : '') + '</div>';
      }).join('') +
      '<p class="tiny mt" style="line-height:1.75">' +
      (kqL.chuaDo ? 'Kho thù lao chưa nạp — chưa đọc được công thức.'
                  : '<b>Đã đọc ' + kqL.soKho + ' kho thù lao đang nạp' +
                    (typeof kqL.tran === 'number' ? ', trần hoa hồng ' + kqL.tran + '%' : '') +
                    ': ' + ((kqL.loi || []).length ? (kqL.loi || []).join(' · ')
                                                   : 'không kho nào chứa biến đếm đầu người') +
                    '.</b>') + '</p></div>';

    /* Mười sáu hợp đồng */
    o += U.sec('Mười sáu hợp đồng',
      'Mỗi hợp đồng lắp từ ngân hàng điều khoản cộng phần đặc thù riêng. Cột điều khoản ' +
      'nền TRỎ vào mã, không chép nội dung.');
    o += '<div class="card mb">' + (G.HSH_HD || []).map(function (x) {
      return '<div style="padding:13px 0;border-bottom:1px solid var(--gita-vien-2)">' +
        '<b class="sm">' + h(x.ma) + ' · ' + h(x.ten) + '</b>' +
        (x.luatSuTungBan ? ' <span class="tiny up" style="color:#BE0E16">LUẬT SƯ TỪNG BẢN</span>' : '') +
        '<p class="tiny dim mt">' + h(x.ben) + ' · ' + h(x.han) + '</p>' +
        '<p class="tiny mt" style="line-height:1.75"><b>Mục đích:</b> ' + h(x.dich) + '</p>' +
        '<p class="tiny mt" style="line-height:1.7"><b>Điều khoản nền:</b> ' +
        h((x.nen || []).join(' · ')) + '</p>' +
        '<p class="tiny mt" style="line-height:1.75;color:#0B6675"><b>Đặc thù GITA:</b></p>' +
        (x.rieng || []).map(function (r) {
          return '<p class="tiny" style="line-height:1.7;padding-left:14px">▪ ' + h(r) + '</p>';
        }).join('') +
        '<p class="tiny mt" style="line-height:1.75;color:#BE0E16"><b>Cạm bẫy thường gặp:</b></p>' +
        (x.bay || []).map(function (r) {
          return '<p class="tiny" style="line-height:1.7;padding-left:14px;color:#BE0E16">▪ ' +
            h(r) + '</p>';
        }).join('') +
        (x.lech ? '<p class="tiny mt" style="line-height:1.75;color:#B4720F"><b>Lệch với hệ:</b> ' +
          h(x.lech) + '</p>' : '') + '</div>';
    }).join('') + '</div>';

    o += G.kaKhung ? G.kaKhung('ho-so-hop-dong', 'dau') : '';

    /* Ngân hàng điều khoản */
    o += U.sec('Ngân hàng hai mươi lăm điều khoản nền',
      (G.HSH_LUAT || {}).motNoiMotDieuKhoan || '');
    o += '<div class="card mb">' + U.tbl(['Mã', 'Điều khoản', 'Bắt buộc với'],
      (G.HSH_DK || []).map(function (x) {
        return [(x.dacThu ? '<b style="color:#BE0E16">' + h(x.ma) + '</b>' : h(x.ma)),
          h(x.ten) + (x.ghi ? '<br><span class="tiny dim">' + h(x.ghi) + '</span>' : ''),
          h(x.batBuoc)];
      })) + '</div>';

    /* Ba cấp chữ ký */
    o += U.sec('Ba cấp chữ ký điện tử',
      (G.HSH_KY_LUAT || {}).diemDeSaiNhat || '');
    o += '<div class="card mb">' + U.tbl(['Cấp', 'Hình thức', 'Dùng cho', 'Giá trị pháp lý'],
      (G.HSH_KY || []).map(function (x) {
        return ['<b>' + h(x.ma) + '</b><br><span class="tiny dim">' + h(x.ten) + '</span>',
          h(x.hinh), h(x.dung), h(x.gia)];
      })) + '</div>';

    /* Lộ trình số hoá */
    o += U.sec('Lộ trình chuyển bộ hồ sơ lên Web App',
      (G.HSH_LOTRINH_LUAT || {}).dangODau || '');
    o += '<div class="card mb">' + U.tbl(['Giai đoạn', 'Phạm vi', 'Điều kiện đóng'],
      (G.HSH_LOTRINH || []).map(function (x) {
        return ['<b style="color:' + (x.dangO ? '#B4720F' : 'inherit') + '">' + h(x.gd) +
            (x.dangO ? '<br><span class="tiny up">ĐANG Ở ĐÂY</span>' : '') + '</b>',
          h(x.pham), h(x.dong)];
      })) + '</div>';

    /* Chín bậc */
    o += U.sec('Chín bậc và bốn cấu phần thu nhập', '');
    o += '<div class="card mb">' + U.tbl(['Bậc', 'Định nghĩa bằng năng lực', 'Cấu phần', 'Phần biến đổi'],
      (G.HSH_BAC || []).map(function (x) {
        return ['<b>' + h(x.ma) + '</b><br><span class="tiny dim">' + h(x.ten) + '</span>',
          h(x.nangLuc), h(x.thuNhap), h(x.bienDoi)];
      })) + '</div>';

    /* Mười phòng · bốn giao diện dễ vỡ */
    o += U.sec('Mười phòng và bốn giao diện dễ vỡ nhất', '');
    o += '<div class="card mb">' + U.tbl(['Mã', 'Phòng', 'Chức năng chính'],
      (G.HSH_PHONG || []).map(function (x) { return [h(x.ma), h(x.ten), h(x.viec)]; })) + '</div>';

    o += '<div class="card mb">' + (G.HSH_VO || []).map(function (x) {
      return '<div style="padding:9px 0;border-bottom:1px solid var(--gita-vien-2)">' +
        '<b class="sm">' + h(x.noi) + '</b>' +
        '<p class="tiny mt" style="line-height:1.75;color:#BE0E16">' + h(x.van) + '</p>' +
        '<p class="tiny" style="line-height:1.75;color:#0B6675">' + h(x.xu) + '</p></div>';
    }).join('') + '</div>';

    /* Tám loại họp */
    o += U.sec('Tám loại họp — mỗi cuộc có đầu vào bắt buộc và một đầu ra', '');
    o += '<div class="card mb">' + U.tbl(['Mã', 'Loại họp', 'Nhịp', 'Trần', 'Đầu vào bắt buộc', 'Đầu ra bắt buộc'],
      (G.HSH_HOP || []).map(function (x) {
        return [h(x.ma), h(x.ten), h(x.nhip), '<b>' + h(x.tran) + '</b>', h(x.vao), h(x.ra)];
      })) + '</div>';

    o += '<div class="card mb">' + (G.HSH_HOP_LUAT || []).map(function (x, i) {
      return '<p class="tiny" style="line-height:1.8;padding:5px 0;border-bottom:1px solid var(--gita-vien-2)">' +
        '<b style="color:#B4720F">' + (i + 1) + '.</b> ' + h(x) + '</p>';
    }).join('') + '</div>';

    /* Sáu bảo mật kho văn bản */
    o += U.sec('Sáu điều bảo mật cho kho văn bản', '');
    o += '<div class="card mb">' + (G.HSH_BAOMAT || []).map(function (x) {
      return '<p class="tiny" style="line-height:1.8;padding:5px 0;border-bottom:1px solid var(--gita-vien-2)">▪ ' +
        h(x) + '</p>';
    }).join('') + '</div>';

    return o;
  };
})();
