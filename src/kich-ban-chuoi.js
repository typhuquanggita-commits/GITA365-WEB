/* ═══════════════════════════════════════════════════════════════
   GITA 365 — MÁY CHẠY CHUỖI KỊCH BẢN TRẢ LỜI PHỤ HUYNH

   Kho chuẩn ở kho-goc/data.kich-ban-chuoi.js.

   BỘ KEY SINH RA TỪ KHO, KHÔNG GÕ TAY

   Trước bản này, thứ duy nhất nhận ra ý người hỏi là KICHBAN_AI.yDinh —
   mười một ý định với danh sách từ khoá GÕ TAY. Mười một cái cho 250
   tình huống, và mỗi lần kho thêm một tình huống thì phải nhớ đi thêm
   từ khoá. Trí nhớ là thứ hỏng đầu tiên.

   Nay bộ key dựng lúc chạy từ chính kho: mã key, tên nhóm, và chữ trong
   `th`/`mo` của từng tình huống. Thêm một tình huống vào kho là bộ key
   tự có nó trong cùng lần chạy.

   NĂM VÒNG, VÀ VÒNG SAU HẸP HƠN VÒNG TRƯỚC

   Đây là chỗ chuỗi này khác một danh sách câu hỏi. Danh sách hỏi xong
   vẫn thế; vòng lặp thì mỗi câu trả lời của phụ huynh THU HẸP bộ key,
   nên vòng sau trúng hơn vòng trước. Vòng năm hỏi một con số, và con số
   ấy mở lại vòng một — lần này với dữ liệu thật thay vì một câu kể.

   CẢ CHUỖI ĐỨNG TRONG TẦNG NHÀ MÌNH ĐANG Ở

   Tình huống tầng trên không mở, kể cả khi nó khớp hơn: nó khớp bằng
   CHỮ, nhưng cách hoá giải của nó đứng trên một cái nền nhà ấy chưa
   dựng. Có khớp thì nói thẳng là có, nói ở tầng nào, và mời đăng ký lộ
   trình — sau khi đã đưa xong phần dùng được của tầng đang ở.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;

(function () {

  function boDau(s) {
    return String(s || '').toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd')
      .replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
  }

  function soTang(t) {
    var m = /^T?([1-5])$/.exec(String(t == null ? '' : t).trim());
    return m ? Number(m[1]) : null;
  }

  /* Chữ chung thì không phân biệt được gì. Dùng lại đúng ngưỡng bốn ký
     tự đã học được ở bản 9.48: chữ ba ký tự trong tiếng Việt gần như
     luôn là chữ chung — bắt, đầu, lúc, bàn, học, một, nay. */
  function chuDangKe(s) {
    var ra = [], t = boDau(s).split(' ');
    for (var i = 0; i < t.length; i++)
      if (t[i].length >= 4 && ra.indexOf(t[i]) < 0) ra.push(t[i]);
    return ra;
  }

  /* ═══════════ BỘ KEY ═══════════
     Dựng từ kho theo bảng KB_KEY_NGUON. Kho nào khai tầng thì mỗi key
     mang tầng của bản ghi sinh ra nó; kho không khai tầng thì key ấy chỉ
     dùng để NHẬN RA chuyện, không dùng làm khúc trả lời. */
  G.kbBoKey = function () {
    var ra = [];
    (G.KB_KEY_NGUON || []).forEach(function (n) {
      var kho = G[n.kho];
      if (!Array.isArray(kho)) return;
      kho.forEach(function (x, i) {
        var chu = [];
        (n.truongChu || []).forEach(function (f) {
          var v = x[f];
          chu = chu.concat(chuDangKe(Array.isArray(v) ? v.join(' ') : v));
        });
        if (n.truongNhom) chu = chu.concat(chuDangKe(x[n.truongNhom]));
        if (n.truongKey) chu = chu.concat(chuDangKe(x[n.truongKey]));
        if (!chu.length) return;
        var t = null;
        if (n.truongTang) {
          var v2 = x[n.truongTang];
          if (Array.isArray(v2)) {
            var ds = v2.map(soTang).filter(Boolean);
            t = ds.length ? Math.min.apply(null, ds) : null;
          } else t = soTang(v2);
        }
        ra.push({
          kho: n.kho, i: i,
          key: n.truongKey ? x[n.truongKey] : null,
          nhom: n.truongNhom ? x[n.truongNhom] : null,
          ten: x.th || x.ten || x.title || '',
          tang: t,
          traLoiDuoc: n.kho === 'TINHHUONG',   /* chỉ kho này có đủ năm khúc */
          tu: chu
        });
      });
    });
    return ra;
  };

  /* Lọc bộ key theo câu người hỏi. Trả về CẢ hai rổ: trong tầng và vượt
     tầng — vượt tầng không hiện tên, nhưng phải ĐẾM được để nói ra. */
  /* Lọc bộ key. `daTraLoi` là MẢNG câu trả lời theo thứ tự các vòng, và
     nó được áp LẦN LƯỢT — mỗi câu thu hẹp cái rổ mà câu trước để lại.

     Bản đầu chỉ giao với câu trả lời GẦN NHẤT, nên rổ phình lại ở vòng
     ba: 44 → 27 → 36. Hẹp rồi rộng ra thì không phải vòng lặp, chỉ là ba
     phép lọc rời nhau đứng cạnh nhau. Hẹp dần phải là hẹp DẦN.

     Câu nào không chuyện nào chạm thì BỎ QUA câu ấy, giữ nguyên rổ. Thu
     về rỗng là mất luôn phần đang đúng, và người trả lời một câu ngoài
     dự kiến không đáng bị phạt bằng cách mất hết. */
  G.kbLocKey = function (cau, boKey, daTraLoi) {
    var tu = chuDangKe(cau);
    var tangNha = G.aiTangNha ? G.aiTangNha() : null;
    if (!tu.length) return { trong: [], vuot: [], tangNha: tangNha, chuaCoChu: true };

    var ds = (boKey || G.kbBoKey()).map(function (k) {
      var d = 0;
      for (var i = 0; i < tu.length; i++) if (k.tu.indexOf(tu[i]) >= 0) d++;
      return d ? { d: d, k: k } : null;
    }).filter(Boolean);

    (daTraLoi || []).forEach(function (cauTL) {
      var t2 = chuDangKe(cauTL);
      if (!t2.length) return;
      var hep = ds.map(function (o) {
        var cham = 0;
        for (var j = 0; j < t2.length; j++) if (o.k.tu.indexOf(t2[j]) >= 0) cham++;
        return cham ? { d: o.d + cham * 2, k: o.k } : null;
      }).filter(Boolean);
      if (hep.length) ds = hep;      /* không ai chạm thì giữ nguyên rổ */
    });

    var trong = [], vuot = [];
    ds.forEach(function (o) {
      /* Kho không khai tầng thì KHÔNG bị coi là vượt tầng — nó chỉ giúp
         nhận ra chuyện. Đẩy nó sang rổ vượt tầng là nói sai một câu về
         chính cái mình không biết. */
      if (tangNha != null && o.k.tang != null && o.k.tang > tangNha) vuot.push(o);
      else trong.push(o);
    });
    trong.sort(function (a, b) { return b.d - a.d; });
    vuot.sort(function (a, b) { return b.d - a.d; });
    return { trong: trong, vuot: vuot, tangNha: tangNha };
  };

  /* ═══════════ MỘT LƯỢT CỦA CHUỖI ═══════════
     `da` là những gì phụ huynh đã trả lời ở các vòng trước — mảng chuỗi.
     Cộng chúng vào câu hỏi để bộ key HẸP DẦN: đó là toàn bộ chỗ "vòng
     lặp thông minh" nằm ở. */
  G.kbChuoi = function (cauDau, da) {
    da = da || [];
    var VONG = G.KB_VONG || [];
    if (!VONG.length) return null;

    /* Câu ĐẦU dựng rổ; các câu trả lời áp LẦN LƯỢT để hẹp dần. Gộp tất
       vào một chuỗi rồi chấm chung là chỉ làm rổ RỘNG ra — cộng chữ bao
       giờ cũng cộng thêm chuyện khớp. */
    var loc = G.kbLocKey(cauDau, null, da);

    /* Vòng đang ở = số câu đã trả lời, chặn ở vòng cuối. Vòng cuối quay
       lại vòng một, nên chuỗi không có điểm kết — nó là một vòng lặp. */
    var i = Math.min(da.length, VONG.length - 1);
    var vong = VONG[i];

    var tot = loc.trong[0];
    var th = tot && tot.k.traLoiDuoc ? (G[tot.k.kho] || [])[tot.k.i] : null;

    /* Khúc của vòng này đọc THẲNG từ trường kho khai — không viết lại. */
    var khuc = th ? th[vong.moKhuc] : null;

    return {
      vong: vong,
      soVong: VONG.length,
      hoi: vong.hoi,
      goiY: vong.goiY,
      khoanhDuoc: !!th,
      tinhHuong: th ? { stt: th.stt, th: th.th, nhom: th.nhom, tang: th.tang } : null,
      khuc: khuc || null,
      thieuKhuc: !!th && !khuc,
      docTu: 'TINHHUONG.' + vong.moKhuc,
      soTrong: loc.trong.length,
      soVuot: loc.vuot.length,
      tangNha: loc.tangNha,
      tangVuot: loc.vuot.length ? Math.min.apply(null,
        loc.vuot.map(function (x) { return x.k.tang; })) : null,
      daTraLoi: da.length,
      quayLai: vong.quayLai || null
    };
  };

  /* ═══════════ NGHIỆP VỤ THEO VAI ═══════════
     Ba vai đọc ba chỗ khác nhau trên cùng một bản ghi. Chia theo VAI chứ
     không theo bậc: Giáo viên bậc 8 đọc cột `ph`, Coach bậc 7 đọc cột
     `coach` — bậc không nói được điều đó.

     Khách hàng KHÔNG đọc lớp này: cột `coach` của phác đồ nói cả những
     việc người dẫn không được làm, và đưa cho gia đình đọc là đưa họ đi
     soi người đang giúp mình thay vì làm việc của tối nay. */
  G.kbNghiepVu = function (cauHoi, vai) {
    vai = vai || (G.S && G.S.role);
    if (G.LA_KHACH && G.LA_KHACH()) return null;
    var d = (G.KB_NGHIEPVU || []).filter(function (x) {
      return (x.vai || []).indexOf(vai) >= 0;
    })[0];
    if (!d) return null;

    /* Phác đồ gần nhất với câu hỏi. PHACDO không khai tầng nên nó KHÔNG
       lọc theo tầng được — nói thẳng thế ở chỗ hiện, đừng lặng lẽ. */
    var tu = chuDangKe(cauHoi), tot = null, cao = 0;
    (G.PHACDO || []).forEach(function (x) {
      var chu = chuDangKe([x.ten, x.nhomTen, x.nguyenNhan].join(' '));
      var n = 0;
      for (var i = 0; i < tu.length; i++) if (chu.indexOf(tu[i]) >= 0) n++;
      if (n > cao) { cao = n; tot = x; }
    });
    if (!tot) return { vai: d, chuaKhoanhDuoc: true };

    /* Mỗi vai một bộ trường, đọc theo bảng d.doc — không gõ tên trường
       ở đây, để thêm một vai là khai một dòng trong kho. */
    /* Bảng d.doc trỏ sang CẢ HAI kho, nên phải tra tình huống nữa —
       bản đầu chỉ có ba trường của phác đồ, nên mọi dòng TINHHUONG.* đều
       báo "kho chưa khai", trong khi 250/250 tình huống đều có `tt`.
       Một câu tự chê sai chỗ làm người làm nghề mất tin vào cả bảng. */
    var loc = G.kbLocKey(cauHoi);
    var th = loc.trong.length && loc.trong[0].k.traLoiDuoc
      ? (G[loc.trong[0].k.kho] || [])[loc.trong[0].k.i] : null;
    var lay = { 'PHACDO.ph': tot.ph, 'PHACDO.coach': tot.coach, 'PHACDO.dich': tot.dich,
      'TINHHUONG.tt': th && th.tt, 'TINHHUONG.gp': th && th.gp, 'TINHHUONG.dich': th && th.dich };
    var muc = (d.doc || []).map(function (f) {
      return { truong: f, loi: lay[f] || null, thieu: !lay[f] };
    });
    return { vai: d, phacDo: { ma: tot.ma, ten: tot.ten, nhom: tot.nhomTen },
      muc: muc, soThieu: muc.filter(function (m) { return m.thieu; }).length,
      phacDoKhongKhaiTang: true };
  };

  /* ═══════════ MỜI ĐĂNG KÝ LỘ TRÌNH TẦNG TRÊN ═══════════
     Chỉ gọi khi ĐÃ đưa xong phần dùng được của tầng đang ở. Mời khi chưa
     đưa gì là bán hàng; mời sau khi đã đưa là chỉ đường.

     Không hiện tên tình huống tầng trên. Chỉ nói CÓ, nói ở tầng nào, và
     giá đọc từ HP_TANG — không gõ một con số tiền nào ở đây. */
  G.kbMoiVuotTang = function (tangCan, so) {
    var M = G.KB_MOI_TANG || {};
    if (!tangCan) return null;

    /* ── CỔNG PHÍ ĐỨNG TRƯỚC, KHÔNG PHẢI SAU ──
       Chủ hệ chốt 3.9.2026: không khuyến khích vượt tầng; chỉ nói phí
       khi đã hoàn tất chặng và KPI từ 80% trở lên.

       Bản 9.49 bật lời mời này mỗi khi khớp một tình huống tầng trên —
       tức là đúng lúc nhà mình đang giữa chặng và đang mắc. Nghe mời lúc
       ấy thì họ hiểu là chặng này chưa đủ, rồi bỏ dở chặng đang đi để
       mua chặng sau; nền không dựng xong thì tầng sau đứng trên cát.

       Nên cổng đứng ở ĐÂY, trước cả việc dựng lời mời — dựng ra rồi mới
       lọc trên màn là để một câu bán hàng nằm sẵn trong dữ liệu, chờ một
       hôm có người quên lọc. */
    if (typeof G.tvCongPhi === 'function') {
      var cong = G.tvCongPhi();
      if (!cong.noiPhi)
        return { khongMoi: true, trangThai: cong.trangThai, thieu: cong.thieu || [],
          /* Trả về lý do chứ không trả null: màn cần biết vì sao im lặng,
             để nó im lặng đúng cách thay vì vẽ một khoảng trống. */
          y: cong.y };
    }
    var ma = 'T' + tangCan;
    /* HP_TANG nằm ở gói NGHỀ — máy khách KHÔNG có nó. Bản rút HP_NGAY ở
       gói nền mang tên tầng, số ngày và (từ 9.49) cả giá. Đọc HP_TANG
       trước cho máy nghề, rơi về HP_NGAY cho máy khách; thiếu cả hai thì
       nói chưa có giá chứ không in số 0 — 0 đọc thành "miễn phí". */
    var t = (G.HP_TANG || []).filter(function (x) { return x.tang === ma; })[0] ||
            (G.HP_NGAY || []).filter(function (x) { return x.tang === ma; })[0];
    var ht = (G.HT_TANG || []).filter(function (x) { return x.ma === ma; })[0];
    return {
      tang: tangCan,
      so: so || 0,
      tenTang: (t && t.ten) || (ht && ht.ma) || ma,
      /* Giá CHƯA CÓ thì nói chưa có, không in số 0 cho tròn — 0 đọc thành
         "miễn phí", mà sự thật có thể là "chưa điền giá". */
      chuaCoGia: !t || t.gia == null,
      gia: t && t.gia != null ? t.gia : null,
      donVi: t && t.donVi,
      duocGi: ht ? ht.doiGiKhiXong : null,
      khongMoTen: M.khongMoTen === true,
      loi: 'Có ' + (so || 0) + ' phần trả lời đầy đủ hơn cho chuyện này, và chúng nằm ở ' +
        'tầng ' + tangCan + '. Em không mở tên ra ở đây — cách hoá giải của chúng đứng trên ' +
        'một cái nền nhà mình chưa dựng, nên đọc bây giờ chưa dùng được.'
    };
  };

})();
