/* ═══════════════════════════════════════════════════════════════
   GITA 365 — MÁY SOÁT NGÔN NGỮ, VÀ PHỄU CHỐT

   Kho ở kho-goc/data.ngon-ngu.js. Toàn bộ ở gói NGHỀ.

   ═══ MÁY NÀY QUÉT KHO THẬT, KHÔNG QUÉT MỘT DANH SÁCH ═══

   nnSoat() đi khắp mọi kho đang nạp và đọc từng chuỗi. Nhờ thế nó bắt
   được câu hỏng ở kho mà hôm nay chưa ai nghĩ tới.

   Ba luật của phép quét, và cả ba đều học từ chỗ đã sai:

     1. CHỈ SOI Ô LỜI NÓI. Quét tất cả ra 2878 chỗ và không dùng được
        chỗ nào — vì phần lớn kho là LUẬT nói về câu xấu, không phải
        câu xấu.

     2. BỎ HẲN NHÁNH Ô CẤM. Ô "câu dễ nói mà luật cấm", ô "tuyệt đối
        không", ô "câu bị cấm" — chúng CHỨA câu xấu vì đó là việc của
        chúng. Soi vào đấy là phạt đúng chỗ đang dạy tránh.

     3. NHÌN LUI TÌM PHỦ ĐỊNH. "Con KHÔNG lười" dùng đúng cái từ mà
        "con lười" dùng. Không nhìn lui thì máy phạt câu gỡ nhãn nặng
        như câu dán nhãn.

   ═══ BA CÁI KHOÁ ═══

   nnSoiMau()   mỗi mẫu cấm phải bắt được câu của nó và KHÔNG bắt câu
                đối chứng. Chạy trước khi mẫu kịp phán ai.
   nnSoiVai()   sáu vai đủ ô, và không vai nào thiếu ranh giới tuyệt đối.
   phSoiChot()  đích chín mươi phải khai rõ nó là chốt ĐỦ ĐIỀU KIỆN, và
                phải khai ba số đọc kèm.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;
G.VIEWS = G.VIEWS || {};

(function () {
  var U = G.U, h = U.h;

  /* Ô chứa LỜI NGƯỜI TA NÓI. */
  var O_NOI = /^(noi|cauChuan|cauThoai|dap|thuThat|may|mo|chot|cauMo|cauChot|cau|mauCau|loiMoi|tt|hoi)$/;
  /* Ô CỐ Ý chứa câu xấu để dạy tránh — bỏ hẳn nhánh. */
  var O_CAM = /^(khongNoi|cam|camNoi|cauCam|tuyetDoiKhong|truot|neuThe|khongDuocLam|khongDungDe|khong|bat|khongBat|x|loi|sai|vi|luat|chiTiet|boi|nguyenVan|viKho|thay|viRanh)$/;
  var CHU = 'a-zA-ZÀ-ỹ';

  function bien(than) {
    return new RegExp('(?<![' + CHU + '])(?:' + than + ')(?![' + CHU + '])', 'i');
  }
  /* ═══ BA CHỖ PHẢI NHÌN, KHÔNG PHẢI MỘT ═══

     Bản đầu chỉ nhìn lui bốn mươi ký tự. Chạy thật trên 4829 câu thì ra
     mười lăm chỗ, và cả mười lăm đều là câu LÀNH:

       "Bên em KHÔNG nhận việc cam kết điểm số"  phủ định nằm TRONG khớp
       "Anh chị vừa nói cháu lười"               đang trích lời khách
       "Dễ chẩn thành con lười"                  nêu chẩn đoán sai để bác

     Nên phải nhìn ba chỗ: TRƯỚC khớp, TRONG khớp, và khung TRÍCH DẪN.
     Khung trích dẫn là chỗ tinh nhất — "vừa nói", "dễ chẩn thành",
     "nghĩ là" đều mở ra một câu xấu để bác lại nó, và một máy soát
     không thấy khung ấy sẽ phạt đúng những trang dạy nghề tốt nhất. */
  var TU_CHOI = '(không|chưa|cấm|đừng|tránh|thay vì|bỏ|chớ)';
  var KHUNG = '(vừa nói|đã nói|dễ chẩn|dễ kết luận|dễ nghĩ|nghĩ là|kết luận là|gọi là|chữ|từ|' +
              'thay vì|nếu|đừng nói|không cãi|hoá ra)';
  function phuDinh(cau, vt, khop, tuPhuDinh) {
    var truoc = cau.slice(Math.max(0, vt - 45), vt);
    var re = new RegExp('(?:^|[^a-zA-ZÀ-ỹ])' + TU_CHOI + '(?![a-zA-ZÀ-ỹ])', 'i');
    if (re.test(truoc)) return true;
    if (khop && !tuPhuDinh && re.test(khop)) return true;
    if (new RegExp('(?:^|[^a-zA-ZÀ-ỹ])' + KHUNG + '(?![a-zA-ZÀ-ỹ])', 'i').test(truoc)) return true;
    return /["\u2019\u201c\u2018]\s*$/.test(truoc);
  }
  /* Mệnh lệnh mở đầu một câu. Giữa câu thì cùng chữ ấy là mô tả. */
  function moDau(cau, vt) {
    return vt === 0 || /(^|[.!?:;\u2014-])\s*$/.test(cau.slice(Math.max(0, vt - 4), vt));
  }
  function phamLuat(m, cau, k) {
    if (phuDinh(cau, k.index, k[0], m.tuPhuDinh)) return false;
    if (m.moDauCau && !moDau(cau, k.index)) return false;
    return true;
  }
  /* Chín mẫu, dựng từ NN_CAM. Mẫu sống trong mã vì nó là biểu thức;
     câu thử và lý do sống trong kho vì chúng là nội dung. */
  var THAN = {
    C1: '(cháu|con|bé|em ấy|học sinh này)\\s+(rất |hơi |khá |quá )?(lười|hư|dốt|kém|chậm hiểu|cá biệt|vô dụng)(?!\\s*(hơn|so với))',
    C2: '(bên em|bên mình|chúng tôi|học viện|gita)[^.?!]{0,30}(cam kết|đảm bảo|bảo đảm|chắc chắn sẽ)[^.?!]{0,25}(điểm|kết quả|đỗ|thi đậu|lên \\d|thành công|tiến bộ)',
    C3: '(chỉ còn \\d+ suất|sắp hết chỗ|số lượng có hạn|ưu đãi cuối|nhanh tay đăng ký|hôm nay là hạn cuối)',
    C4: '(giảm|bớt|xin sếp|ưu đãi riêng)[^.?!]{0,25}(học phí|tiền|chi phí|triệu|giá(?!\\s*trị))' +
        '|(giảm|bớt)[^.?!]{0,18}cho (chị|anh|anh chị|nhà mình)[^.?!]{0,18}(phần trăm|%)',
    C5: '(bạn|các bạn|con nhà người ta)[^.?!]{0,20}(làm được mà con|hơn con|giỏi hơn)|con xem bạn',
    C6: '(cháu|con|bé)\\s+(đang|bị|có)\\b[^.?!]{0,28}(trầm cảm|rối loạn|tự kỷ|tăng động|sang chấn)',
    C7: '(chị|anh|anh chị)\\s+(nên|phải|đừng)\\s+[a-zA-ZÀ-ỹ]',   /* + phải mở đầu câu */
    C8: '(em|chị|anh) hiểu mà|không sao đâu|ai cũng thế|chuyện thường thôi',
    C9: '(trung tâm|nơi|chỗ) khác[^.?!]{0,28}(qua loa|không bằng|kém|không tới nơi|chỉ dạy|làm ẩu)'
  };
  /* Ba mẫu siết lại sau lần chạy thật:
     C2 chỉ cấm hứa KẾT QUẢ — cam kết CÁCH LÀM (cách đo, cổng nghiệm thu)
        là thứ kho vẫn nói và vẫn nên nói.
     C4 phải có chữ TIỀN trong tầm với, không thì "giảm hai mươi phần
        trăm giấc ngủ" cũng thành giảm giá.
     C9 phải có lời HẠ THẤP, không chỉ có chữ "chỗ khác". */

  function mauCam() {
    return (G.NN_CAM || []).map(function (c) {
      return { ma: c.ma, ten: c.ten, thay: c.thay, vi: c.vi,
        bat: c.bat, khongBat: c.khongBat,
        /* C7 kết bằng một chữ cái, nên KHÔNG bọc biên từ ở đuôi — bọc
           vào thì "chị phải kiên" hỏng ngay ở chữ "k", và mẫu chết mà
           chỉ phép tự kiểm mới thấy. */
        /* C8 tự chứa chữ "không" ("không sao đâu"), nên phép soi phủ
           định TRONG khớp tha luôn chính nó. Đánh dấu để bỏ phép ấy. */
        tuPhuDinh: c.ma === 'C8',
        /* C7 là một MỆNH LỆNH, và mệnh lệnh mở đầu câu. "số lần anh chị
           phải nhắc" giữa câu là mô tả, không phải ra lệnh — sáu chỗ
           trong kho đúng dạng ấy và cả sáu đều lành. */
        moDauCau: c.ma === 'C7',
        re: THAN[c.ma] ? (c.ma === 'C7'
          ? new RegExp('(?<![a-zA-ZÀ-ỹ])(?:' + THAN[c.ma] + ')', 'i')
          : bien(THAN[c.ma])) : null };
    });
  }

  /* ═══════════ QUÉT KHO THẬT ═══════════ */
  G.nnSoat = function (gioiHan) {
    var mau = mauCam().filter(function (m) { return m.re; });
    if (!mau.length) return { chuaDo: true, thieu: 'NN_CAM' };
    var thay = [], daXet = 0;

    function di(o, duong, khoa) {
      if (typeof o === 'string') {
        if (!O_NOI.test(khoa || '')) return;
        daXet++;
        mau.forEach(function (m) {
          var k = m.re.exec(o);
          if (k && phamLuat(m, o, k))
            thay.push({ ma: m.ma, ten: m.ten, thay: m.thay, o: duong, tu: k[0], cau: o });
        });
        return;
      }
      if (Array.isArray(o)) {
        for (var i = 0; i < o.length; i++) di(o[i], duong + '[' + i + ']', khoa);
        return;
      }
      if (o && typeof o === 'object') {
        Object.keys(o).forEach(function (k) {
          if (O_CAM.test(k)) return;         /* bỏ hẳn nhánh ô cấm */
          di(o[k], duong + '.' + k, k);
        });
      }
    }
    Object.keys(G).forEach(function (k) {
      if (!/^[A-Z]/.test(k)) return;
      try { di(G[k], k, k); } catch (e) { /* kho lạ thì bỏ qua, không làm đổ màn */ }
    });

    var theoMa = {};
    thay.forEach(function (x) { theoMa[x.ma] = (theoMa[x.ma] || 0) + 1; });
    return {
      soCau: daXet, soThay: thay.length, theoMa: theoMa,
      ds: gioiHan ? thay.slice(0, gioiHan) : thay,
      sach: thay.length === 0
    };
  };

  /* ═══════════ KHOÁ 1: MẪU TỰ KIỂM TRƯỚC KHI PHÁN AI ═══════════ */
  G.nnSoiMau = function () {
    var ds = G.NN_CAM || [], loi = [];
    if (!ds.length) return { chuaDo: true, thieu: 'NN_CAM', loi: [] };
    if (ds.length !== 9) loi.push('bảng cấm có ' + ds.length + ' mục, phải 9');
    mauCam().forEach(function (m) {
      if (!m.re) { loi.push(m.ma + ' chưa có biểu thức trong mã'); return; }
      if (!m.bat || !m.khongBat) { loi.push(m.ma + ' thiếu cặp câu tự kiểm'); return; }
      if (!m.thay) loi.push(m.ma + ' chưa khai câu thay');
      if (!m.vi) loi.push(m.ma + ' chưa khai vì sao cấm');
      var a = m.re.exec(m.bat);
      if (!a || !phamLuat(m, m.bat, a))
        loi.push(m.ma + ' đã chết — câu phạm rõ ràng vẫn lọt: "' + m.bat + '"');
      var b = m.re.exec(m.khongBat);
      if (b && phamLuat(m, m.khongBat, b))
        loi.push(m.ma + ' kêu nhầm — câu đối chứng bị tính là phạm: "' + m.khongBat + '"');
    });
    if (!(G.NN_CAM_LUAT || {}).moiMauMotCap) loi.push('chưa khai luật mỗi mẫu một cặp');
    if (!(G.NN_CAM_LUAT || {}).boQuaOCam) loi.push('chưa khai luật bỏ qua ô cấm');
    return { chuaDo: false, loi: loi, so: ds.length };
  };

  /* ═══════════ KHOÁ 2: SÁU VAI ĐỦ Ô ═══════════ */
  G.nnSoiVai = function () {
    var ds = G.NN_VAI || [], loi = [];
    if (!ds.length) return { chuaDo: true, thieu: 'NN_VAI', loi: [] };
    if (ds.length !== 6) loi.push('phải có sáu vai, đang có ' + ds.length);
    var can = ['xungHo', 'goiKhach', 'giong', 'duoc', 'khong', 'mauCau', 'ranhTuyetDoi', 'viRanh', 'tuKho'];
    ds.forEach(function (v) {
      can.forEach(function (o) { if (!v[o]) loi.push(v.ma + ' thiếu ô ' + o); });
      /* Câu mẫu của một vai KHÔNG được phạm chính bảng cấm. Đây là chỗ
         dễ sai nhất: viết một câu mẫu nghe hay rồi nó vi phạm mục khác. */
      mauCam().forEach(function (m) {
        if (!m.re || !v.mauCau) return;
        var k = m.re.exec(v.mauCau);
        if (k && phamLuat(m, v.mauCau, k))
          loi.push(v.ma + ' câu mẫu phạm ' + m.ma + ' ("' + k[0] + '")');
      });
    });
    return { chuaDo: false, loi: loi, so: ds.length };
  };

  /* ═══════════ KHOÁ 3: ĐÍCH CHÍN MƯƠI PHẢI NÓI RÕ NÓ LÀ GÌ ═══════════

     Một con số phần trăm không kèm định nghĩa mẫu số là một con số ai
     đọc cũng thấy đúng ý mình. Đó là loại con số nguy hiểm nhất trong
     một bảng điều hành. */
  G.phSoiChot = function () {
    var p = G.PH_CHOT, loi = [];
    if (!p) return { chuaDo: true, thieu: 'PH_CHOT', loi: [] };
    if (!p.dichLaGi) loi.push('đích chưa khai nó đo trên mẫu số nào');
    if (!p.khongPhaiLa) loi.push('đích chưa khai nó KHÔNG phải cái gì');
    if (!p.congThuc) loi.push('chưa khai công thức');
    if (!p.soDoDiKem) loi.push('chưa khai ba số phải đọc kèm');
    if (!p.khongKeoLenBang) loi.push('chưa khai bốn cách KHÔNG được dùng để kéo số lên');
    if (!/qua/i.test(String(p.dichLaGi)) || !/sàng lọc/i.test(String(p.dichLaGi)))
      loi.push('định nghĩa đích không nhắc tới sàng lọc — mẫu số đang mơ hồ');
    var t = G.PH_TANG || [];
    if (t.length !== 5) loi.push('phễu phải đủ năm tầng, đang có ' + t.length);
    t.forEach(function (x) {
      ['aiVao', 'locGi', 'aiBiLoai', 'diTiep', 'viLocODay'].forEach(function (o) {
        if (!x[o]) loi.push('tầng ' + x.tang + ' thiếu ô ' + o);
      });
    });
    return { chuaDo: false, loi: loi, dich: p.dich };
  };

  /* ═══════════════════════════════════════════════════════════
     MÀN 1 — CHUẨN NGÔN NGỮ VÀ KẾT QUẢ SOÁT
     ═══════════════════════════════════════════════════════════ */
  G.VIEWS['chuan-ngon-ngu'] = function () {
    if (!G.NN_VAI)
      return U.empty('Chưa mở được phần này',
        'Chuẩn ngôn ngữ nằm trong gói nghề. Đăng nhập bằng tài khoản có quyền nghề để nạp.');

    var loi = G.NN_LOI || {}, s = G.nnSoat(40);
    var lech = [].concat(G.nnSoiMau().loi || [], G.nnSoiVai().loi || []);

    var o = U.ph({ eyebrow: 'CHUẨN NGÔN NGỮ · SÁU VAI', ic: 'quote', grad: 1,
      t: 'Lọc theo câu, không lọc theo từ',
      lead: loi.la || '' });

    o += '<div class="card mb" style="border-color:' +
      (s.sach && !lech.length ? '#0B667556' : '#BE0E16') + '">' +
      '<div style="display:flex;flex-wrap:wrap;gap:18px;align-items:baseline">' +
      '<div style="min-width:170px"><span class="tiny up dim">CÂU ĐÃ SOI</span><br>' +
      '<b style="font-size:1.6em;color:#0B6675">' + s.soCau + '</b></div>' +
      '<div style="min-width:170px;border-left:1px solid var(--gita-vien-2);padding-left:14px">' +
      '<span class="tiny up dim">CÂU CẦN SỬA</span><br>' +
      '<b style="font-size:1.6em;color:' + (s.soThay ? '#BE0E16' : '#0B6675') + '">' +
      s.soThay + '</b></div></div>' +
      '<p class="tiny mt" style="line-height:1.75;color:#B4720F"><b>' + h(loi.locTheoCau || '') +
      '</b></p>' +
      '<p class="tiny mt" style="line-height:1.75">' + h(loi.viKhongLocTuTu || '') + '</p>' +
      (lech.length ? '<p class="tiny mt" style="line-height:1.7;color:#BE0E16"><b>LỆCH: ' +
        h(lech.join(' · ')) + '</b></p>' : '') + '</div>';

    if (s.soThay) {
      o += U.sec('Câu cần sửa — ' + s.soThay + ' chỗ', 'Mỗi chỗ kèm mã cấm và câu thay.');
      o += '<div class="card mb" style="border-color:#BE0E16">' + (s.ds || []).map(function (x) {
        return '<div style="padding:9px 0;border-bottom:1px solid var(--gita-vien-2)">' +
          '<b class="tiny up" style="color:#BE0E16">' + h(x.ma) + ' · ' + h(x.ten) + '</b> ' +
          '<span class="tiny dim">' + h(x.o) + '</span>' +
          '<p class="tiny mt" style="line-height:1.7">' + h(x.cau.slice(0, 200)) + '</p>' +
          '<p class="tiny" style="line-height:1.7;color:#0B6675">Thay bằng: ' + h(x.thay) + '</p></div>';
      }).join('') + '</div>';
    } else {
      o += '<div class="card mb" style="border-color:#0B667556">' +
        '<b class="sm" style="color:#0B6675">Không câu nói nào trong kho phạm chín mục cấm.</b>' +
        '<p class="tiny mt" style="line-height:1.75">' + h((G.NN_CAM_LUAT || {}).chiSoiOLoiNoi || '') +
        '</p></div>';
    }

    o += G.kaKhung ? G.kaKhung('chuan-ngon-ngu', 'dau') : '';

    o += U.sec('Sáu vai — xưng hô, giọng, ranh giới', (G.NN_VAI_LUAT || {}).sauVaiSauGiong || '');
    o += '<div class="card mb">' + (G.NN_VAI || []).map(function (v) {
      return '<div style="padding:12px 0;border-bottom:1px solid var(--gita-vien-2)">' +
        '<b class="sm" style="color:' + v.c + '">' + h(v.vai) + '</b>' +
        '<p class="tiny mt" style="line-height:1.75"><b>Xưng hô:</b> ' + h(v.xungHo) + '</p>' +
        '<p class="tiny" style="line-height:1.75"><b>Gọi khách:</b> ' + h(v.goiKhach) + '</p>' +
        '<p class="tiny" style="line-height:1.75"><b>Giọng:</b> ' + h(v.giong) + '</p>' +
        '<p class="tiny" style="line-height:1.75;color:#0B6675"><b>Được:</b> ' + h(v.duoc) + '</p>' +
        '<p class="tiny" style="line-height:1.75;color:#BE0E16"><b>Không:</b> ' + h(v.khong) + '</p>' +
        '<p class="tiny mt" style="line-height:1.75;padding-left:12px;border-left:3px solid ' +
        v.c + '"><i>' + h(v.mauCau) + '</i></p>' +
        '<p class="tiny mt" style="line-height:1.75;color:#B4720F"><b>Ranh giới tuyệt đối:</b> ' +
        h(v.ranhTuyetDoi) + '</p>' +
        '<p class="tiny dim" style="line-height:1.75">' + h(v.viRanh) + '</p>' +
        '<p class="tiny dim" style="line-height:1.7">' + h(v.tuKho) + '</p></div>';
    }).join('') + '</div>';

    o += U.sec('Chín câu bị cấm — cấm theo cấu trúc', (G.NN_CAM_LUAT || {}).camTheoCau || '');
    o += '<div class="card mb">' + (G.NN_CAM || []).map(function (c) {
      return '<div style="padding:10px 0;border-bottom:1px solid var(--gita-vien-2)">' +
        '<b class="sm" style="color:#BE0E16">' + h(c.ma) + ' · ' + h(c.ten) + '</b> ' +
        '<span class="tiny dim">' + h(c.tuKho || '') + '</span>' +
        '<p class="tiny mt" style="line-height:1.75">' + h(c.vi) + '</p>' +
        '<p class="tiny mt" style="line-height:1.75;color:#BE0E16">✗ ' + h(c.bat) + '</p>' +
        '<p class="tiny" style="line-height:1.75;color:#0B6675">✓ ' + h(c.khongBat) + '</p>' +
        '<p class="tiny mt" style="line-height:1.75"><b>Thay bằng:</b> ' + h(c.thay) + '</p></div>';
    }).join('') + '</div>';

    o += G.kaKhung ? G.kaKhung('chuan-ngon-ngu', 'cuoi') : '';
    return o;
  };

  /* ═══════════════════════════════════════════════════════════
     MÀN 2 — PHỄU CHỐT
     ═══════════════════════════════════════════════════════════ */
  G.VIEWS['pheu-chot'] = function () {
    if (!G.PH_TANG)
      return U.empty('Chưa mở được phần này',
        'Phễu chốt nằm trong gói nghề. Đăng nhập bằng tài khoản có quyền nghề để nạp.');

    var loi = G.PH_LOI || {}, p = G.PH_CHOT || {};
    var lech = G.phSoiChot().loi || [];

    var o = U.ph({ eyebrow: 'PHỄU CHỐT · SÀNG LỌC THEO TẦNG', ic: 'filter', grad: 1,
      t: 'Con số chín mươi, đặt ở đúng chỗ của nó',
      lead: loi.haiConSo || '' });

    o += '<div class="card mb" style="border-color:' + (lech.length ? '#BE0E16' : '#B4720F') + '56">' +
      '<div style="display:flex;flex-wrap:wrap;gap:18px;align-items:baseline">' +
      '<div style="min-width:200px"><span class="tiny up dim">ĐÍCH — CHỐT ĐỦ ĐIỀU KIỆN</span><br>' +
      '<b style="font-size:1.9em;color:#0B6675">' + (p.dich || '—') + '%</b></div></div>' +
      '<p class="sm mt" style="line-height:1.75"><b>' + h(p.dichLaGi || '') + '</b></p>' +
      '<p class="tiny mt" style="line-height:1.75;color:#BE0E16"><b>KHÔNG phải:</b> ' +
      h(p.khongPhaiLa || '') + '</p>' +
      '<p class="tiny mt" style="line-height:1.75;font-family:monospace">' + h(p.congThuc || '') + '</p>' +
      '<p class="tiny mt" style="line-height:1.75;color:#0B6675"><b>Kéo lên bằng:</b> ' +
      h(p.keoLenBangGi || '') + '</p>' +
      '<p class="tiny" style="line-height:1.75;color:#BE0E16"><b>Không kéo lên bằng:</b> ' +
      h(p.khongKeoLenBang || '') + '</p>' +
      (lech.length ? '<p class="tiny mt" style="line-height:1.7;color:#BE0E16"><b>LỆCH: ' +
        h(lech.join(' · ')) + '</b></p>' : '') + '</div>';

    o += '<div class="card mb" style="border-color:#B4720F56">' +
      '<b class="sm" style="color:#B4720F">Hai con số đi ngược nhau</b>' +
      '<p class="tiny mt" style="line-height:1.75">' + h(loi.hequaPhaiNoiRa || '') + '</p>' +
      '<p class="tiny mt" style="line-height:1.75;color:#BE0E16">' + h(loi.nghichLy || '') + '</p>' +
      '<p class="tiny mt" style="line-height:1.75">' + h(p.soDoDiKem || '') + '</p>' +
      '<p class="tiny dim" style="line-height:1.75">' + h(p.viBaSoKia || '') + '</p></div>';

    o += G.kaKhung ? G.kaKhung('pheu-chot', 'dau') : '';

    o += U.sec('Năm tầng — ai vào, lọc gì, ai bị loại', loi.duongDuyNhat || '');
    o += '<div class="card mb">' + (G.PH_TANG || []).map(function (t) {
      return '<div style="padding:12px 0;border-bottom:1px solid var(--gita-vien-2)">' +
        '<b class="sm" style="color:' + t.c + '">' + h(t.tang) + ' · ' + h(t.ten) + '</b>' +
        '<p class="tiny mt" style="line-height:1.75"><b>Ai vào:</b> ' + h(t.aiVao) + '</p>' +
        '<p class="tiny" style="line-height:1.75"><b>Lọc gì:</b> ' + h(t.locGi) + '</p>' +
        '<p class="tiny" style="line-height:1.75;color:#BE0E16"><b>Ai bị loại:</b> ' +
        h(t.aiBiLoai) + '</p>' +
        '<p class="tiny" style="line-height:1.75;color:#0B6675"><b>Đi tiếp:</b> ' + h(t.diTiep) + '</p>' +
        '<p class="tiny mt" style="line-height:1.75;color:#B4720F">' + h(t.viLocODay) + '</p>' +
        '<p class="tiny dim" style="line-height:1.7">' + h(t.tuKho || '') + '</p></div>';
    }).join('') + '</div>';

    o += G.kaKhung ? G.kaKhung('pheu-chot', 'cuoi') : '';
    return o;
  };
})();
