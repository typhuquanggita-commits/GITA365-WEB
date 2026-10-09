/* ═══════════════════════════════════════════════════════════════
   GITA 365 · v9.79 — DỌN BẢNG, VÀ VÌ SAO PHẢI CÓ

   ĐO ĐƯỢC TRƯỚC KHI VIẾT

   Bốn bảng trong hệ chỉ lớn lên và không bao giờ nhỏ đi:

     sessions        mỗi lượt đăng nhập thêm một dòng; đăng xuất chỉ
                     đặt exp = 0, dòng vẫn nằm đó
     audit           mỗi hành động một dòng, không bao giờ bớt
     dangKyCho       mỗi lượt đăng ký một dòng, kể cả lượt bỏ dở
     hosoAppSaoLuu   mỗi lần đồng bộ một bản sao lưu

   Và Store.doc() đọc CẢ TRANG mỗi lần chạm tới một bảng. Mọi yêu cầu
   có xác thực đều chạm bảng sessions.

   Một trăm người dùng, hai lượt đăng nhập mỗi ngày:

       sau 1 tháng     6.000 dòng
       sau 6 tháng    36.000 dòng
       sau 1 năm      73.000 dòng   ← đọc lại đủ chừng ấy MỖI LƯỢT GỌI

   Không phải một ngày nào đó hệ đứng hẳn. Nó chậm dần, đều đặn, và
   không ai chỉ được ra ngày nó bắt đầu chậm.

   BA LUẬT CỦA BỘ DỌN NÀY

   1. XOÁ THEO LUẬT ĐÃ KHAI, KHÔNG THEO CẢM GIÁC.
      Mỗi bảng khai rõ giữ theo cột nào, giữ bao lâu, và VÌ SAO chừng
      ấy. Đổi một con số là đổi một dòng trong GITA_HAN, không phải đi
      sửa mã.

   2. KHÔNG BAO GIỜ XOÁ THỨ CÒN HIỆU LỰC.
      Phiên chưa hết hạn, đăng ký đang chờ kích hoạt, bản sao lưu gần
      nhất — không được đụng, kể cả khi bảng đã quá to. Bảng to là
      chuyện của hiệu năng; xoá nhầm là chuyện của người dùng.

   3. NÓI RA ĐÃ XOÁ BAO NHIÊU.
      Mỗi lượt dọn ghi một dòng vào audit. Một bộ dọn chạy im lặng là
      một bộ dọn không ai kiểm được — và ngày nó xoá nhầm thì cũng
      không ai biết nó đã chạy.
   ═══════════════════════════════════════════════════════════════ */

/* Luật giữ, khai một chỗ. Mỗi mục nói đủ ba điều: giữ theo cột nào,
   giữ bao lâu, và vì sao chừng ấy chứ không phải chừng khác. */
var GITA_HAN = {
  sessions: {
    cot: 'exp', kieu: 'moc', ngay: 2, cotPhu: 'createdAt',
    vi: 'Phiên hết hạn rồi thì không ai dùng lại được nữa. Giữ thêm hai ngày ' +
        'để còn tra lại "ai đăng nhập lúc nào" khi có sự cố, rồi bỏ.',
    viCotPhu: 'ĐĂNG XUẤT đặt exp = 0, không đặt một mốc quá khứ. Luật "quá hạn ' +
        'hơn hai ngày" đọc exp = 0 thành "chưa tới hạn" và bỏ sót VĨNH VIỄN đúng ' +
        'những dòng chắc chắn đã chết. Nên dòng nào exp không dương thì tính tuổi ' +
        'theo createdAt.'
  },
  audit: {
    cot: 'luc', kieu: 'ngay', ngay: 400, tran: 50000,
    vi: 'Bốn trăm ngày phủ trọn một năm cộng một quý — đủ để đối chiếu cùng kỳ ' +
        'năm ngoái. Trần năm mươi nghìn dòng là chốt chặn thứ hai: một đợt lỗi ' +
        'lặp có thể sinh vài chục nghìn dòng trong một ngày, và luật theo NGÀY ' +
        'không chặn được chuyện ấy.'
  },
  dangKyCho: {
    cot: 'createdAt', kieu: 'ngay', ngay: 30, giuKhi: 'dangCho',
    vi: 'Đăng ký bỏ dở quá ba mươi ngày thì người ta không quay lại nữa. Lượt ' +
        'ĐANG CHỜ kích hoạt thì giữ nguyên bất kể bao lâu — người ta có thể mở ' +
        'thư cũ và bấm vào.'
  },
  hosoAppSaoLuu: {
    kieu: 'moiNguoi', giu: 10, khoaNguoi: 'uid', cot: 'luc',
    vi: 'Mười bản sao lưu gần nhất mỗi người. Sao lưu để lùi lại khi hỏng, mà ' +
        'không ai lùi quá mười bước — bản thứ mười một là dung lượng, không ' +
        'phải bảo hiểm.'
  }
};

/* Bảng nào KHÔNG được đụng tới, và vì sao. Kê ra để lần sau không ai
   hỏi "sao bảng này không dọn" rồi tự thêm luật cho nó. */
var GITA_KHONG_DON = {
  users:     'Hồ sơ người dùng. Nghỉ việc thì đánh dấu deletedAt, không xoá dòng.',
  students:  'Hồ sơ học viên — hồ sơ ca, phải giữ theo quy định lưu trữ.',
  hosoApp:   'Bản đang dùng của mỗi người. Xoá là mất dữ liệu đang chạy.',
  thanhToan: 'Chứng từ tài chính. Không xoá, không bao giờ.',
  tailieu:   'Tài liệu đã gửi cho khách — là bằng chứng đã gửi cái gì.'
};

/* ═══════════════ CHẠY ═══════════════

   Trả về một bản kê: bảng nào, xoá bao nhiêu, còn lại bao nhiêu, và
   vì sao. Gọi được bằng tay từ trình soạn Apps Script, hoặc để bộ
   hẹn giờ gọi mỗi đêm. */
function gitaDonDep(chiXem) {
  var nay = Date.now();
  var ke = [], tongXoa = 0;

  Object.keys(GITA_HAN).forEach(function (bang) {
    var l = GITA_HAN[bang], ds;
    try { ds = Store.all(bang); }
    catch (e) { ke.push({bang: bang, loi: 'không đọc được: ' + e.message}); return; }

    var boDi = [];

    if (l.kieu === 'moc') {
      /* Cột giữ một mốc thời gian tính bằng mili-giây. Quá hạn thêm
         l.ngay ngày nữa thì bỏ. */
      var han = nay - l.ngay * 86400e3;
      ds.forEach(function (x) {
        var m = Number(x[l.cot] || 0);
        if (m > 0) { if (m < han) boDi.push(x.id); return; }
        /* Mốc không dương: dòng đã bị đóng bằng tay. Tính tuổi theo
           cột phụ — xem viCotPhu. */
        if (!l.cotPhu) return;
        var t = Date.parse(x[l.cotPhu]);
        if (!isNaN(t) && t < han) boDi.push(x.id);
      });

    } else if (l.kieu === 'ngay') {
      var hanN = nay - l.ngay * 86400e3;
      ds.forEach(function (x) {
        var t = Date.parse(x[l.cot]);
        if (!isNaN(t) && t < hanN) boDi.push(x.id);
      });
      /* Trần: quá nhiều dòng thì bỏ thêm phần CŨ NHẤT cho về trần. */
      if (l.tran && ds.length - boDi.length > l.tran) {
        var conLai = ds.filter(function (x) { return boDi.indexOf(x.id) < 0; });
        conLai.sort(function (a, b) {
          return (Date.parse(a[l.cot]) || 0) - (Date.parse(b[l.cot]) || 0);
        });
        var duThua = conLai.length - l.tran;
        for (var i = 0; i < duThua; i++) boDi.push(conLai[i].id);
      }

    } else if (l.kieu === 'moiNguoi') {
      /* Giữ N bản gần nhất cho MỖI người. Gom theo khoá người, xếp
         mới trước, bỏ phần đuôi. */
      var nhom = {};
      ds.forEach(function (x) {
        var k = String(x[l.khoaNguoi] || '(không rõ)');
        (nhom[k] || (nhom[k] = [])).push(x);
      });
      Object.keys(nhom).forEach(function (k) {
        var g = nhom[k];
        g.sort(function (a, b) {
          return (Date.parse(b[l.cot]) || 0) - (Date.parse(a[l.cot]) || 0);
        });
        for (var i = l.giu; i < g.length; i++) boDi.push(g[i].id);
      });
    }

    /* Luật 2: không đụng thứ còn hiệu lực. */
    if (l.giuKhi === 'dangCho') {
      var giuLai = {};
      ds.forEach(function (x) {
        if (String(x.trangThai || '').toUpperCase().indexOf('CHO') >= 0) giuLai[String(x.id)] = 1;
      });
      boDi = boDi.filter(function (id) { return !giuLai[String(id)]; });
    }

    var so = 0;
    if (boDi.length && !chiXem) {
      try { so = Store.xoa(bang, boDi); }
      catch (e) { ke.push({bang: bang, loi: 'không xoá được: ' + e.message}); return; }
    } else if (boDi.length) {
      so = boDi.length;                    /* chỉ xem: đếm, không đụng */
    }
    tongXoa += so;
    ke.push({bang: bang, truoc: ds.length, xoa: so, con: ds.length - so, vi: l.vi});
  });

  /* Luật 3: nói ra. Ghi vào audit SAU khi dọn, để chính dòng này
     không bị lượt dọn vừa rồi cuốn đi. */
  var tom = ke.map(function (x) {
    return x.loi ? (x.bang + ': ' + x.loi) : (x.bang + ' ' + x.truoc + '→' + x.con);
  }).join(' · ');
  if (!chiXem) {
    try { audit_(null, 'DON_DEP', 'tự động', 'xoá ' + tongXoa + ' dòng · ' + tom); } catch (e) {}
  }

  return {ok: true, chiXem: !!chiXem, tongXoa: tongXoa, ke: ke,
    luc: new Date().toISOString()};
}

/* ═══════════════ HẸN GIỜ ═══════════════

   Chạy MỘT LẦN từ trình soạn Apps Script để đặt lịch dọn mỗi đêm.
   Gọi lại nhiều lần cũng không sinh ra nhiều bộ hẹn giờ trùng nhau —
   nó gỡ bộ cũ trước khi đặt bộ mới. Bộ hẹn giờ trùng là chuyện thật:
   mỗi lần bấm chạy lại là thêm một cái, và tới lúc phát hiện thì đã
   có sáu bộ cùng dọn một lúc. */
function gitaDatLichDon() {
  var da = 0;
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'gitaDonDep') { ScriptApp.deleteTrigger(t); da++; }
  });
  ScriptApp.newTrigger('gitaDonDep').timeBased().atHour(3).everyDays(1).create();
  return {ok: true, goBoCu: da,
    loi: 'Đã đặt lịch dọn mỗi ngày lúc 3 giờ sáng' + (da ? ' (gỡ ' + da + ' bộ cũ)' : '')};
}

/* Xem trước KHÔNG XOÁ GÌ — đếm xem lượt dọn tới sẽ bỏ bao nhiêu.
   Có phép này thì không ai phải chạy thật để biết nó định làm gì.

   TRUYỀN CỜ VÀO, KHÔNG TRÁO Store.xoa. Bản đầu của tôi tráo hàm xoá
   bằng một hàm chỉ đếm rồi trả lại trong finally — đúng cái bẫy đã
   dính bốn lần liền ở phía máy khách (aiCoKhan, aiTrongTang,
   tlBanGhiKho, LA_KHACH). Tráo một hàm toàn cục thì chỉ cần một lỗi
   ném ra giữa chừng là phép XOÁ THẬT nằm nguyên trạng thái giả. */
function gitaXemTruocDon() { return gitaDonDep(true); }
