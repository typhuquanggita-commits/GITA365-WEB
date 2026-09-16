/* ═══════════════════════════════════════════════════════════════
   GITA 365 — MÁY CHẠY BÀN LÀM VIỆC CỦA COACH

   Kho ở kho-goc/data.ban-lam-viec.js. Toàn bộ ở gói NGHỀ.

   ═══ HÀM QUAN TRỌNG NHẤT: blvXep() ═══

   Nó chia nhà của Coach vào năm ngăn, và tính chất phải giữ là:

       mỗi nhà rơi vào ĐÚNG MỘT ngăn, tổng năm ngăn bằng tổng số nhà.

   Cách giữ: xét theo THỨ TỰ BẬC và DỪNG ở ngăn đầu tiên khớp. Ngăn
   cuối — ĐANG YÊN — nhận phần còn lại, nên không nhà nào lọt.

   Viết kiểu "nhà nào khẩn thì vào ngăn đỏ, nhà nào tới hạn thì vào
   ngăn việc" mà không có ngăn vét thì một nhà bình thường biến mất
   khỏi màn hình — và đó đúng là lớp hỏng chủ hệ muốn chặn.

   ═══ MÁY ĐỀ NGHỊ CẤP, MÁY KHÔNG GÁN CẤP ═══

   blvCapDeNghi() đọc dữ liệu có thật của nhà — ngày thứ mấy, chỉ số tự
   chủ, số lần nhắc — rồi đề nghị một cấp trong mười, KÈM cái nó dựa
   vào và KÈM cái nó chưa có.

   Nó KHÔNG ghi cấp ấy vào đâu cả. Cấp chỉ thành thật khi GIÁM ĐỐC ĐIỀU
   HÀNH phê duyệt — chốt của chủ hệ ở bản 9.58 — và ngăn CHỜ KÝ giữ
   những nhà đang chờ đúng việc ấy. Việc của Coach là dựng hồ sơ cho đủ
   ba điều kiện rồi trình; xem blvDuyetDuoc().

   Vì sao không tự gán: nguyên tắc số 1 của bộ bản vẽ nói cấp độ là
   TRẠNG THÁI CỦA KHÁCH, chỉ ghi khi có bằng chứng quan sát được. Ngày
   thứ 74 không phải bằng chứng — nó chỉ là cái lịch.

   ═══ VÌ SAO blvCapDeNghi() KHÔNG DÙNG NGÀY LÀM CĂN CỨ CHÍNH ═══

   Cách dễ nhất là chia ngày cho tổng số ngày rồi nhân mười. Cách ấy
   luôn ra một con số đẹp, và luôn sai theo cùng một hướng: nhà nào
   cũng "đang tiến bộ đều".

   Nên hàm này lấy ngày làm TRẦN (không đề nghị cấp cao hơn chỗ lịch
   cho phép) và lấy chỉ số tự chủ làm CĂN CỨ. Hai thứ lệch nhau nhiều
   thì nó nói ra chỗ lệch, chứ không trung bình cộng chúng lại.

   ═══ TÁM CÁI KHOÁ ═══

   blvSoiVetCan()    tổng năm ngăn bằng tổng số nhà — không hơn không kém.
   blvSoiThuTu()     ngăn xếp đúng bậc của SV_THUTU.
   blvSoiGoi()       tám ô, mỗi ô khai lấy từ kho nào.
   blvSoiNhac()      mỗi loại nhắc có hạn và có nguồn.
   blvSoiKhongTuGui() không có đường nào từ bàn này gửi thẳng cho gia đình.
   blvSoiDuyet()     cửa duyệt đủ ba điều kiện, không kho nào chép lại
                     ngưỡng KPI, và người ký mang một quyền có thật.
   blvSoiNoiDo()     mỗi tín hiệu đỏ khai được nối bằng gì, hoặc vì sao
                     chưa nối và ai bắt thay — và hàm không nối nhiều
                     hơn kho khai.
   blvSoiMoc()       năm tầng đều có mốc gặp, mốc dẫn nguyên văn câu đã
                     hứa, và không tầng nào vừa trỏ kho vừa chép số.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;
G.VIEWS = G.VIEWS || {};

(function () {
  var U = G.U, h = U.h;
  var SO_NGAY = { T1: 7, T2: 21, T3: 90, T4: 365, T5: 365 };

  function maTang(t) { var m = String(t == null ? '' : t).match(/(\d)/); return m ? 'T' + m[1] : ''; }
  function co(x) { return x !== undefined && x !== null; }

  /* ═══════════ NHÀ CỦA COACH, ĐÃ LÀM GIÀU ═══════════ */
  G.blvNha = function (tenCoach) {
    var ds = (typeof G.dsNha === 'function' ? G.dsNha() : (G.FAMILIES || [])) || [];
    if (tenCoach) ds = ds.filter(function (n) { return n.coach === tenCoach; });
    return ds.map(function (n) {
      var t = maTang(n.tier), tong = SO_NGAY[t] || 0;
      var chang = (typeof G.t34ChangHomNay === 'function') ? G.t34ChangHomNay(t, n.ngay) : null;
      var dn = G.blvCapDeNghi(n);
      return {
        id: n.id, nha: n.nha, hv: n.hv, lop: n.lop, ph: n.ph,
        tang: t, ngay: n.ngay, tongNgay: tong,
        conLai: tong ? Math.max(0, tong - Number(n.ngay || 0)) : undefined,
        band: n.band, tuchu: n.tuchu, nhac: n.nhac, coach: n.coach, kyTich: n.kyTich,
        /* vai và kpi đi theo vì G.kpiCuaToi() đọc chúng. Bản đầu tôi bỏ quên
           vai, và KPI của mọi nhà tụt đúng 20 điểm mà không ai thấy — vì một
           con số thấp đều thì trông giống một hệ nghiêm khắc. */
        vai: n.vai, kpi: n.kpi, nguyenVong: n.nguyenVong,
        chang: chang && !chang.chuaDo && !chang.khongPhaiTang34 ? chang : undefined,
        capDeNghi: dn
      };
    });
  };

  /* ═══════════ ĐỀ NGHỊ CẤP — KHÔNG GÁN ═══════════

     Ngày làm TRẦN, chỉ số tự chủ làm CĂN CỨ. Xem đầu tệp. */
  G.blvCapDeNghi = function (n) {
    var t = maTang(n.tier), tong = SO_NGAY[t] || 0;
    if (!tong) return { chuaDoDuoc: true, vi: 'Không biết tầng này dài bao nhiêu ngày.' };

    var ngay = Number(n.ngay || 0);
    var tranTheoLich = Math.max(1, Math.min(10, Math.ceil(ngay / tong * 10)));

    var tc = Number(n.tuchu);
    if (!isFinite(tc)) return {
      chuaDoDuoc: true, tranTheoLich: tranTheoLich,
      vi: 'Nhà này chưa có chỉ số tự chủ. Đề nghị một cấp mà không có căn cứ là đoán.'
    };
    var theoCanCu = Math.max(1, Math.min(10, Math.round(tc / 10)));
    var deNghi = Math.min(tranTheoLich, theoCanCu);

    var o = (typeof G.bvCap === 'function') ? G.bvCap(t, deNghi) : null;
    var lech = tranTheoLich - theoCanCu;

    return {
      cap: deNghi, ma: o && o.ma ? o.ma : (t + '-C' + (deNghi < 10 ? '0' : '') + deNghi),
      moc: o && o.moc ? o.moc : undefined,
      doiBangChung: o && o.bangChung ? o.bangChung : undefined,
      canCu: 'Chỉ số tự chủ ' + tc + '% → cấp ' + theoCanCu,
      tranTheoLich: tranTheoLich,
      lechLich: lech,
      noiLech: lech >= 2
        ? 'Lịch cho phép tới cấp ' + tranTheoLich + ' mà căn cứ chỉ tới cấp ' + theoCanCu +
          '. Nhà này đang CHẬM hơn lịch — đừng ghi theo lịch.'
        : (lech <= -1
          ? 'Căn cứ cao hơn trần lịch. Giữ ở trần: chưa đi hết ngày thì chưa qua được ô ấy.'
          : undefined),
      chuaKy: true,
      vi: 'Máy ĐỀ NGHỊ. Cấp chỉ thành thật khi Giám đốc điều hành phê duyệt.'
    };
  };

  /* ═══════════ CỬA PHÊ DUYỆT CẤP ═══════════

     Ba điều kiện của chủ hệ, mỗi điều kiện trả về một trong BA trạng thái:
       dat        · đo được và đạt
       hut        · đo được và chưa đạt
       chuaBiet   · máy không có căn cứ để nói

     Vì sao ba chứ không hai: "chưa biết" và "chưa đạt" đòi hai việc khác
     nhau. Chưa đạt thì đi làm cho tốt hơn; chưa biết thì đi HỎI. Gộp lại
     thành một màu đỏ là làm mất đúng thông tin dùng được.

     Máy không duyệt. Ba điều kiện xanh chỉ nghĩa là hồ sơ ĐỦ ĐIỀU KIỆN
     TRÌNH lên Giám đốc điều hành. */

  G.blvDuyetDuoc = function (n, tenCoach) {
    var d = G.BLV_DUYET, ds = G.BLV_DUYET_DIEU || [];
    if (!d || !ds.length) return { chuaDo: true, thieu: 'BLV_DUYET' };
    var ra = [];

    ds.forEach(function (dk) {
      var o = { ma: dk.ma, ten: dk.ten, tuKho: dk.tuKho, aiLam: dk.aiLam };

      if (dk.ma === 'KPI') {
        /* Ngưỡng đọc từ KPI_XIN_THEM. Không viết lại con số ấy ở đây. */
        if (typeof G.kpiCuaToi !== 'function' || typeof G.KPI_XIN_THEM !== 'number') {
          o.trangThai = 'chuaBiet';
          o.noi = 'Chưa nạp kho khách — không đọc được ngưỡng KPI.';
        } else {
          var kpi = G.kpiCuaToi(n);
          o.so = kpi; o.nguong = G.KPI_XIN_THEM;
          o.trangThai = G.datKpi80(n) ? 'dat' : 'hut';
          o.noi = 'KPI ' + kpi + '% · ngưỡng ' + G.KPI_XIN_THEM + '%';
          if (o.trangThai === 'hut') o.canLam = dk.hut;
        }
      }

      if (dk.ma === 'CONGSUAT') {
        /* ═══ CHỖ BẢN 9.58 ĐẶT SAI CỬA ═══

           Bản trước tôi lấy trần công suất chặn ngay ở đây, cho mọi cấp.
           Đọc lại bốn chỗ trong kho — BV_VAI_LUAT luật 3, BV_CONG_LUAT
           luật 5, CS_NEN N2, BV_BANGIAO chặng "Tư vấn → Coach" — thì cả
           bốn đều nói trần chặn lúc NHẬN KHÁCH MỚI và lúc MỞ CỔNG. Không
           chỗ nào nói nó chặn một nhà đang đi lên cấp trong tầng.

           Và đúng là không nên: nhà Coach đã giữ, đi từ cấp 6 lên cấp 7,
           không tiêu thêm suất nào. Chặn nó vì Coach đông nhà là phạt
           gia đình vì việc điều phối của hệ.

           Nên ở cửa này trần chia hai đường:
             · cấp thường  → CẢNH BÁO, để Giám đốc thấy người này đang đầy
             · cấp 10      → CHẶN, vì cấp 10 là nhà sắp qua cổng sang
                             tầng sau và sẽ vào tay MỘT VAI KHÁC. Lúc ấy
                             nó đúng là "nhận khách mới", và luật số 5 áp
                             thẳng vào. */
        var nguoi = tenCoach || n.coach;
        if (!nguoi) {
          o.trangThai = 'chuaBiet';
          o.noi = 'Nhà này chưa có người phụ trách — chưa biết trần của ai để đếm.';
          o.canLam = 'Giao người phụ trách trước, rồi mới xét cấp.';
          ra.push(o); return;
        }
        if (typeof G.bvNhanDuoc !== 'function') {
          o.trangThai = 'chuaBiet';
          o.noi = 'Chưa nạp bộ bản vẽ — không đọc được trần công suất.';
          ra.push(o); return;
        }

        var capNay = Number((n.capDeNghi || {}).cap) || 0;
        var quaCong = capNay >= 10;
        /* Cấp 10 thì đếm trần của vai NHẬN ở tầng sau, không phải vai
           đang giữ — đó mới là người sắp gánh thêm một nhà. */
        var tangXet = quaCong
          ? 'T' + Math.min(5, (Number(String(n.tang).replace('T', '')) || 1) + 1)
          : n.tang;
        var r = G.bvNhanDuoc(nguoi, tangXet, null);
        o.vai = r.vai; o.dangGiu = r.dangGiu; o.tran = r.tran;
        o.tranChuoi = r.tranChuoi; o.nguoi = nguoi; o.tangXet = tangXet;
        o.quaCong = quaCong || undefined;

        if (r.chuaBiet) { o.trangThai = 'chuaBiet'; o.noi = r.vi; }
        else if (!r.chan) {
          o.trangThai = 'dat';
          o.noi = r.vai + ' ' + nguoi + ' đang giữ ' + r.dangGiu + '/' + r.tran +
            ' nhà ' + tangXet + (quaCong ? ' (tầng sẽ nhận)' : '');
          if (r.sapDay) o.sapDay = r.sapDay;
        } else {
          o.trangThai = 'hut'; o.noi = r.vi; o.canLam = r.lam; o.theoLuat = r.theoLuat;
          if (!quaCong) {
            /* Chỉ cảnh báo: nhà này đã ở trong tay người ấy rồi. */
            o.chiCanhBao = true;
            o.chuaChan = 'Nhà đã ở trong tay người này — lên cấp không tiêu thêm suất. ' +
              'Trần chặn lúc NHẬN nhà mới, không chặn lúc lên cấp. Nhưng Giám đốc nên biết ' +
              'người này đang quá tải trước khi ký thêm việc cho họ.';
          }
        }
      }

      if (dk.ma === 'NGUYENVONG') {
        var nv = n[dk.truong];
        if (nv === 'co')        { o.trangThai = 'dat';  o.noi = 'Nhà đã nói còn muốn đi tiếp.'; }
        else if (nv === 'khong'){ o.trangThai = 'hut';  o.noi = 'Đã hỏi — nhà KHÔNG muốn đi tiếp.';
                                  o.dungLai = true; o.canLam = dk.hut; }
        else                    { o.trangThai = 'chuaBiet'; o.chuaHoi = true;
                                  o.noi = 'CHƯA HỎI. Vắng mặt không phải là "không".';
                                  o.canLam = dk.hut; }
      }

      ra.push(o);
    });

    var hut  = ra.filter(function (x) { return x.trangThai === 'hut'; });
    var chua = ra.filter(function (x) { return x.trangThai === 'chuaBiet'; });
    /* Điều kiện chỉ CẢNH BÁO thì không chặn — nhưng vẫn hiện nguyên màu. */
    var chan = hut.filter(function (x) { return !x.chiCanhBao; });

    return {
      id: n.id, nha: n.nha, cap: (n.capDeNghi || {}).cap, ma: (n.capDeNghi || {}).ma,
      dieu: ra,
      duTrinh: chan.length === 0 && chua.length === 0,
      thieu: chan.map(function (x) { return x.ten; }),
      chuaBiet: chua.map(function (x) { return x.ten; }),
      canhBao: hut.filter(function (x) { return x.chiCanhBao; })
                  .map(function (x) { return x.noi; }),
      nguoiKy: d.nguoiKy, quyen: d.quyen,
      mayKhongDuyet: (G.BLV_DUYET_LUAT || {}).mayKhongDuyet || '',
      chuaKy: true
    };
  };

  /* Ai đang ngồi ở máy có được ký không. Đọc quyền, không đọc tên vai —
     tên vai đổi được, quyền thì gắn với bảng phân quyền. */
  G.blvAiKyDuoc = function () {
    var d = G.BLV_DUYET || {};
    var acc = G.S && G.S.acc;
    var duoc = !!(acc && typeof G.can === 'function' && G.can(d.quyen));
    return { duoc: duoc, quyen: d.quyen, nguoiKy: d.nguoiKy,
      ai: acc ? acc.ten : null,
      vi: duoc ? undefined
        : 'Chỉ ' + d.nguoiKy + ' phê duyệt cấp. Việc của Coach là dựng hồ sơ và trình.' };
  };

  /* ═══════════ HÀM QUAN TRỌNG NHẤT: CHIA NĂM NGĂN ═══════════ */
  G.blvXep = function (tenCoach) {
    var ngan = (G.BLV_NGAN || []).slice().sort(function (a, b) { return a.thu - b.thu; });
    if (!ngan.length) return { chuaDo: true, thieu: 'BLV_NGAN' };
    var ds = G.blvNha(tenCoach);

    var gom = {};
    ngan.forEach(function (x) { gom[x.ma] = []; });

    ds.forEach(function (n) {
      var vi = G.blvViCoDo(n, tenCoach);
      var viec = G.blvViecToiHan(n);
      var im = G.blvDangIm(n);
      /* Hồ sơ trình duyệt đi theo nhà vào BẤT KỲ ngăn nào, không chỉ
         ngăn chờ ký. Nhà rơi xuống ĐANG YÊN mà hồ sơ còn thiếu ba điều
         kiện thì Coach vẫn phải thấy nó thiếu gì — nếu không, "đang yên"
         đọc ra thành "không có việc". */
      var hoSo = (n.capDeNghi && n.capDeNghi.chuaKy)
        ? G.blvDuyetDuoc(n, tenCoach) : undefined;

      /* Xét theo ĐÚNG thứ tự ngăn đã khai ở kho, dừng ở ngăn đầu tiên
         khớp. Không viết cứng thứ tự vào hàm: viết cứng thì đổi thứ tự
         ở kho mà hàm vẫn chạy theo thứ tự cũ, và hai chỗ lệch nhau
         trong im lặng. */
      var khop = {
        KHAN:       function () {
          var qh = G.blvQuaHan(n);
          return (vi.length || qh) ? { viCo: vi, quaHan: qh || undefined } : null;
        },
        QUAN_TRONG: function () { return viec.length ? { viec: viec } : null; },
        CHO_KY:     function () {
          if (!(n.capDeNghi && n.capDeNghi.chuaKy)) return null;
          var hs = hoSo || {};
          /* ═══ CHỖ BẢN 9.57 CHƯA CHỮA HẾT ═══

             Bản 9.57 tôi hạ ngăn này xuống dưới VIỆC QUAN TRỌNG vì nó
             nuốt sáu nhà. Đo lại ở 9.59: nó vẫn nuốt năm nhà và ba ngăn
             dưới trống trơn. Hạ một bậc không chữa được gốc — gốc là
             điều kiện vào ngăn LUÔN ĐÚNG: chưa nhà nào từng được ký,
             nên nhà nào cũng "đang chờ ký".

             Một ngăn có điều kiện luôn đúng thì nó ăn hết mọi ngăn dưới
             nó, dù xếp ở bậc nào.

             Nay ngăn này chỉ nhận hồ sơ ĐÃ ĐỦ BA ĐIỀU KIỆN — tức việc
             thật sự nằm trên bàn Giám đốc. Hồ sơ còn thiếu là việc của
             Coach, không phải việc chờ ký, và nó hiện ở lượt rà soát
             buổi sáng RS-CAP cùng dòng ghi trên thẻ nhà. */
          if (!hs.duTrinh) return null;
          return { viCo: [], hoSo: hs };
        },
        IM_LANG:    function () { return im ? { im: im } : null; }
      };
      for (var i = 0; i < ngan.length; i++) {
        var x = ngan[i];
        if (x.laPhanConLai) break;
        var k = khop[x.ma] && khop[x.ma]();
        if (k) { k.nha = n; k.hoSo = k.hoSo || hoSo; gom[x.ma].push(k); return; }
      }
      var vet = ngan.filter(function (x) { return x.laPhanConLai; })[0];
      gom[vet.ma].push({ nha: n, hoSo: hoSo });
    });

    return {
      coach: tenCoach, tongNha: ds.length,
      ngan: ngan.map(function (x) {
        return { ma: x.ma, ten: x.ten, c: x.c, thu: x.thu, bac: x.bac, la: x.la,
          lam: x.lam, ds: gom[x.ma], so: gom[x.ma].length };
      }),
      tongTrongNgan: ngan.reduce(function (s, x) { return s + gom[x.ma].length; }, 0)
    };
  };

  /* Tín hiệu đỏ đang chạm. Đọc BV_DO cho hạn giờ và người nhận —
     không tự đặt hạn ở đây. */
  /* ═══════════ TÍN HIỆU ĐỎ ĐANG CHẠY ═══════════

     Đường nối khai ở BV_DO_NOI, không viết trong hàm này. Hàm chỉ chạy
     bốn phép tính đã được khai, và KHÔNG tự thêm cái thứ năm.

     Bản 9.57–9.59 viết thẳng hai câu if trong hàm, và cả hai nối sai
     kiểu: tín hiệu đếm NGÀY nối vào trường đếm LẦN, tín hiệu so với
     LỊCH nối vào một ngưỡng tuyệt đối. Sai kiểu thì kết quả vẫn ra một
     danh sách nhà trông hợp lý — nên nó chạy ba bản không ai thấy. */
  G.blvViCoDo = function (n, tenCoach) {
    var ds = G.BV_DO || [], noi = G.BV_DO_NOI || [], ra = [];
    if (!ds.length || !noi.length) return ra;

    var dn = n.capDeNghi || {};
    var lech = Number(dn.lechLich);
    var chan = null;
    if (typeof G.bvNhanDuoc === 'function' && (tenCoach || n.coach))
      chan = G.bvNhanDuoc(tenCoach || n.coach, n.tang, null);

    /* Mỗi khoá là số hiệu tín hiệu ở BV_DO_NOI. Thêm một khoá ở đây mà
       không khai ở kho thì blvSoiNoiDo() đỏ, và ngược lại. */
    var dodac = {
      6:  function () { return lech === 2; },
      7:  function () { return lech >= 3; },
      8:  function () { return n.nguyenVong === 'khong'; },
      17: function () { return !!(chan && chan.chan); }
    };

    noi.forEach(function (x) {
      if (!x.noi || !dodac[x.so]) return;
      if (!dodac[x.so]()) return;
      var t = ds.filter(function (d) { return d.so === x.so; })[0];
      if (!t) return;
      ra.push({ muc: t.muc, so: t.so, tinHieu: t.tinHieu, hanhDong: t.hanhDong,
        nguoiNhan: t.nguoiNhan, hanGio: t.hanGio, doBang: x.noi });
    });
    return ra;
  };

  /* Bao nhiêu tín hiệu máy bắt được, bao nhiêu là việc của tai người.
     Con số này hiện lên màn — Coach cần biết mình đang được canh mấy
     phần, chứ không đọc "hai mươi tín hiệu đỏ" rồi yên tâm. */
  G.blvDoCanhDuoc = function () {
    var noi = G.BV_DO_NOI || [];
    var may = noi.filter(function (x) { return x.noi; });
    return { tong: noi.length, may: may.length, nguoi: noi.length - may.length,
      dsMay: may.map(function (x) { return x.so; }),
      luat: (G.BV_DO_NOI_LUAT || {}).bonTrenHaiMuoi || '' };
  };

  /* Đã QUÁ ngày cuối tầng mà chưa qua cổng. Ngăn KHẨN khai sẵn "hoặc có
     việc đã QUÁ hạn giờ" — bản đầu tôi khai luật ấy mà không viết mã cho
     nó, và màn hình lộ ra ngay: một nhà ở ngày 96 trên 90 vẫn nằm ngăn
     việc quan trọng, cạnh những nhà còn hai ngày nữa mới tới hạn. */
  G.blvQuaHan = function (n) {
    var tong = SO_NGAY[n.tang] || 0;
    if (!tong) return null;
    var qua = Number(n.ngay || 0) - tong;
    if (qua <= 0) return null;
    var cong = (G.BV_CONG || []).filter(function (c) {
      return String(c.chuyen || '').indexOf('Tầng ' + n.tang.slice(1)) === 0;
    })[0];
    return {
      quaNgay: qua,
      ten: 'Quá ngày cuối tầng ' + qua + ' ngày mà chưa qua cổng',
      cong: cong ? cong.ma + ' · ' + cong.chuyen : undefined,
      lam: 'Xử hôm nay: hoặc mở cổng nếu đủ điều kiện, hoặc ghi biên bản gia hạn. ' +
        'Để trôi thêm là nhà đang trả tiền cho một tầng đã hết ngày.',
      khongDuocLam: 'Không mở cổng chỉ vì đã quá ngày. Quá ngày không phải một điều kiện.'
    };
  };

  /* Việc tới hạn trong bảy ngày: mốc gặp của chặng, và cổng cuối tầng. */
  G.blvViecToiHan = function (n) {
    var ra = [], tong = SO_NGAY[n.tang] || 0;
    if (G.blvQuaHan(n)) return ra;   /* quá hạn thì nó là ca KHẨN, không phải việc sắp tới */
    if (tong && n.conLai !== undefined && n.conLai <= 7) {
      var cong = (G.BV_CONG || []).filter(function (c) {
        return String(c.chuyen || '').indexOf('Tầng ' + n.tang.slice(1)) === 0;
      })[0];
      ra.push({
        loai: 'Cổng chuyển tầng', conLai: n.conLai,
        ten: cong ? cong.ma + ' · ' + cong.chuyen : 'Cổng cuối tầng ' + n.tang,
        dieuKien: cong ? cong.dieuKienMo : undefined,
        khiNaoKhongMo: cong ? cong.khiNaoKhongMo : undefined
      });
    }
    /* Mốc gặp đọc từ BLV_MOC, không viết cứng ở đây. */
    var mm = G.blvMocGap(n.tang);
    (mm.ngay || []).forEach(function (m) {
      var cach = m - Number(n.ngay || 0);
      if (cach >= 0 && cach <= 7)
        ra.push({ loai: 'Buổi gặp mốc', conLai: cach,
          ten: (mm.ten || 'Buổi gặp') + ' — ngày ' + m,
          chuanBi: 'Gói tài nguyên đóng trước 48 giờ', nguon: mm.nguon });
    });
    return ra;
  };

  /* ═══════════ MỐC GẶP CỦA MỘT TẦNG ═══════════

     Hai đường: "cứ N ngày một mốc", hoặc "đọc ranh giới từ một kho
     khác". Đường thứ hai quan trọng hơn — T3 và T4 KHÔNG chép lại con
     số ngày vào BLV_MOC, chúng trỏ sang T34_T3_CHANG và T34_T4_MUA và
     máy cắt ranh giới lúc chạy. Chép số vào đây thì ngày sổ tay đổi
     chặng, bảng mốc ở lại — và Coach đúng hẹn với một lịch đã chết. */
  G.blvMocGap = function (tang) {
    var t = String(tang || '').toUpperCase();
    var d = (G.BLV_MOC || []).filter(function (x) { return x.tang === t; })[0];
    if (!d) return { chuaKhai: true, tang: t, ngay: [],
      vi: 'Tầng ' + t + ' chưa khai mốc gặp ở BLV_MOC.' };
    var tong = SO_NGAY[t] || 0, ngay = [];

    if (d.cach === 'moiN' && d.n > 0) {
      for (var i = d.n; i <= tong; i += d.n) ngay.push(i);
      /* Mốc cuối LUÔN là ngày khép tầng — đó là cổng nghiệm thu. Nhưng
         nếu mốc đều đặn đã rơi sát ngày ấy thì thay nó, đừng thêm: tầng
         5 chia mỗi quý ra 91·182·273·364, thêm 365 nữa thành hai buổi
         cách nhau một ngày. */
      var cuoi = ngay[ngay.length - 1];
      if (tong && cuoi !== tong) {
        if (cuoi && tong - cuoi < d.n / 2) ngay[ngay.length - 1] = tong;
        else ngay.push(tong);
      }
    } else if (d.cach === 'tuKho') {
      var kho = G[d.tuKho] || [];
      kho.forEach(function (x) {
        /* "31–60" hay "4–6" — lấy vế SAU, đó là ngày khép chặng. */
        var m = String(x.ngay || x.thang || '').match(/(\d+)\s*[–-]\s*(\d+)/);
        if (!m) return;
        /* Trường thang đếm bằng THÁNG, trường ngay đếm bằng NGÀY. Nhân
           nhầm đơn vị ở đây thì mốc quý của tầng 4 rơi vào ngày thứ 3. */
        var so = Number(m[2]);
        ngay.push(x.thang && !x.ngay ? Math.round(so * (tong / 12)) : so);
      });
    }
    return { tang: t, ten: d.ten, nguon: d.nguon, lech: d.lech,
      ngay: ngay.filter(function (v, i, a) { return v > 0 && a.indexOf(v) === i; })
                .sort(function (a, b) { return a - b; }) };
  };

  /* ═══════════ NHÀ ĐANG TỤT NHỊP ═══════════

     Bốn mức hụt của BV_TUTCAP dùng CÙNG MỘT thứ tiếng với hai mươi tín
     hiệu đỏ: "trượt 1 mốc" · "trượt 2 mốc liên tiếp" · "trượt cả chặng"
     · "gia đình yêu cầu dừng". Nên đo bằng cùng một con số — lechLich,
     số mốc nhà đang chậm hơn lịch.

     Hai mức nặng đã thành tín hiệu đỏ và đi vào ngăn KHẨN, nên ngăn này
     chỉ còn giữ Hụt nhẹ. Đó đúng là chỗ nó phải ở: nhắc một lần bằng
     câu nhẹ, rồi để yên. */
  G.blvDangIm = function (n) {
    var lech = Number((n.capDeNghi || {}).lechLich);
    if (!(lech === 1)) return null;
    var m = (G.BV_TUTCAP || []).filter(function (x) { return /nhẹ/i.test(x.muc); })[0] || {};
    return {
      muc: m.muc || 'Hụt nhẹ',
      dauHieu: 'Chậm hơn lịch một mốc — ' + (m.dauHieu || ''),
      lam: m.hanhDong, khong: m.tuyetDoiKhong,
      doBang: 'blvCapDeNghi().lechLich === 1'
    };
  };

  /* ═══════════ GÓI TÀI NGUYÊN — TÁM Ô, Ô TRỐNG PHẢI HIỆN ═══════════ */
  G.blvGoi = function (nhaId, tenCoach) {
    var n = G.blvNha(tenCoach).filter(function (x) { return x.id === nhaId; })[0];
    if (!n) return { khongCo: true, id: nhaId };
    var dn = n.capDeNghi || {};
    var o = (typeof G.bvCap === 'function' && dn.cap) ? G.bvCap(n.tang, dn.cap) : null;
    var nhip = (G.BV_NHIP || []).filter(function (x) { return x.so === 6; })[0];
    var kho = (typeof G.t34Kho === 'function') ? G.t34Kho(n.tang) : [];
    var cong = (G.BV_CONG || []).filter(function (c) {
      return String(c.chuyen || '').indexOf('Tầng ' + n.tang.slice(1)) === 0;
    })[0];
    var band = (G.MT_BANG || []).filter(function (b) { return b.ma === n.band; })[0];

    function oGoi(ma, noiDung, chuaCoVi) {
      var d = (G.BLV_GOI || []).filter(function (x) { return x.ma === ma; })[0] || {};
      return { ma: ma, ten: d.ten, tuKho: d.tuKho,
        coGi: noiDung || undefined,
        chuaCo: noiDung ? undefined : (chuaCoVi || 'Kho chưa có phần này cho ô đang xét.') };
    }

    return {
      nha: n,
      o: [
        oGoi('VITRI', n.tang + ' · ngày ' + n.ngay + '/' + n.tongNgay +
          (n.chang ? ' · ' + (n.chang.ten || ('chặng ' + n.chang.chang) || n.chang.mua) : '') +
          (dn.cap ? ' · cấp đề nghị ' + dn.cap : '') +
          (band ? ' · băng ' + band.ma + ', ' + band.nhip : '')),
        oGoi('BANGCHUNG', o && o.bangChung, 'Chưa xác định được ô cấp độ nên chưa biết đòi bằng chứng gì.'),
        oGoi('VIEC_MAY', o && o.ai, 'Ô cấp độ này không giao việc tự động nào cho máy.'),
        oGoi('VIEC_NGUOI', o && o.nguoi, 'Ô cấp độ này bản vẽ để trống cột người làm — máy chạy một mình.'),
        oGoi('KICHBAN', nhip ? ('Nhịp ' + nhip.so + ' ' + nhip.ten + ' — chuẩn: “' + nhip.cauChuan +
          '” · CẤM: “' + nhip.cauCam + '”') : null),
        oGoi('DANGKHO', kho.length ? kho.map(function (k) { return k.ma + ' ' + k.ten; }).join(' · ')
          : null, 'Tầng này chưa có bảng dạng khó trong kho.'),
        oGoi('DUONGTUT', o && o.neuTut),
        oGoi('CONG', cong ? (cong.ma + ' — mở khi: ' + cong.dieuKienMo + ' · KHÔNG mở khi: ' +
          cong.khiNaoKhongMo) : null, 'Chưa nối được cổng cho tầng này.')
      ],
      luat: (G.BLV_GOI_LUAT || {}).khongDongGoiHo || ''
    };
  };

  /* ═══════════ TRỢ LÝ NHẮC VIỆC ═══════════ */
  /* ═══════════ TRỢ LÝ NHẮC VIỆC ═══════════

     ═══ LỜI NHẮC ĐỌC TỪ SỰ THẬT, KHÔNG ĐỌC TỪ NGĂN ═══

     Bản 9.57–9.59 duyệt theo ngăn: ngăn KHẨN thì bắn N-DO, ngăn VIỆC
     QUAN TRỌNG thì bắn N-GAP. Mà năm ngăn LOẠI TRỪ NHAU — một nhà chỉ
     nằm ở một ngăn. Nên nhà đang khủng hoảng VÀ có buổi gặp sau hai
     ngày thì mất luôn lời nhắc chuẩn bị buổi gặp ấy.

     Đo ở 9.59: ba trên bảy loại nhắc chưa bao giờ bắn một lần nào. Một
     lời nhắc chưa từng bắn thì chưa phải một lời nhắc — cùng cái luật
     đã dùng cho phép kiểm.

     Ngăn trả lời "hôm nay xử nhà nào TRƯỚC" — một câu hỏi cần loại trừ.
     Lời nhắc trả lời "nhà này còn việc gì" — một câu hỏi KHÔNG được
     loại trừ. Nay mỗi loại nhắc đọc thẳng sự thật của nhà. */
  G.blvNhac = function (tenCoach) {
    var ds = G.blvNha(tenCoach);
    if (!ds.length && !(G.BLV_NHAC || []).length)
      return { chuaDo: true, thieu: 'BLV_NHAC', ds: [], so: 0 };
    var loai = {};
    (G.BLV_NHAC || []).forEach(function (x) { loai[x.ma] = x; });
    var ra = [];

    ds.forEach(function (n) {
      /* N-DO — tín hiệu đỏ đang chạy, và việc đã quá hạn giờ */
      var qh = G.blvQuaHan(n);
      if (qh) ra.push({ ma: 'N-DO', c: '#BE0E16', nha: n.nha, id: n.id,
        viec: qh.ten, lam: qh.lam, han: 'hôm nay', nguoiNhan: 'Coach',
        cam: qh.khongDuocLam, nguon: 'BLV_NGAN KHAN' });
      G.blvViCoDo(n, tenCoach).forEach(function (d) {
        ra.push({ ma: 'N-DO', c: '#BE0E16', nha: n.nha, id: n.id,
          viec: d.tinHieu, lam: d.hanhDong, han: d.hanGio, nguoiNhan: d.nguoiNhan,
          nguon: 'BV_DO #' + d.so + ' · đo bằng ' + (d.doBang || '—') });
      });

      /* N-GAP và N-CONG — việc tới hạn, không phụ thuộc nhà đang ở ngăn nào */
      G.blvViecToiHan(n).forEach(function (v) {
        var gap = v.loai === 'Buổi gặp mốc';
        var l = loai[gap ? 'N-GAP' : 'N-CONG'] || {};
        /* Chỉ nhắc khi đã vào cửa sổ báo trước của chính loại nhắc ấy —
           truoc tính bằng GIỜ ở kho, đổi ra ngày để so với conLai. */
        var cua = Math.ceil(Number(l.truoc || 0) / 24);
        if (v.conLai > cua) return;
        ra.push({ ma: gap ? 'N-GAP' : 'N-CONG', c: '#5140B4', nha: n.nha, id: n.id,
          viec: v.ten, lam: v.chuanBi || ('Điều kiện: ' + (v.dieuKien || '—')),
          han: 'còn ' + v.conLai + ' ngày', nguoiNhan: 'Coach',
          nguon: v.nguon || (l.tuKho || '') });
      });

      /* N-IM — nhịp đang tụt nhẹ */
      var im = G.blvDangIm(n);
      if (im) ra.push({ ma: 'N-IM', c: '#B45309', nha: n.nha, id: n.id,
        viec: im.dauHieu, lam: im.lam, han: 'trong ngày', nguoiNhan: 'Coach',
        cam: im.khong, nguon: 'BV_TUTCAP · ' + (im.doBang || '') });

      /* N-BAOCAO — sắp khép một chặng. Mốc cuối cùng của tầng là chỗ
         phải có báo cáo ba trụ, và nó khác buổi gặp mốc: buổi gặp là
         ngồi với nhà, báo cáo là thứ gửi trước khi ngồi. */
      var mm = G.blvMocGap(n.tang);
      var chot = (mm.ngay || [])[(mm.ngay || []).length - 1];
      var cachChot = chot === undefined ? null : chot - Number(n.ngay || 0);
      var cuaBC = Math.ceil(Number((loai['N-BAOCAO'] || {}).truoc || 0) / 24);
      if (cachChot !== null && cachChot >= 0 && cachChot <= cuaBC)
        ra.push({ ma: 'N-BAOCAO', c: '#0B6675', nha: n.nha, id: n.id,
          viec: 'Báo cáo khép tầng ' + n.tang + ' — mốc ngày ' + chot,
          lam: (loai['N-BAOCAO'] || {}).noi || '', han: 'còn ' + cachChot + ' ngày',
          nguoiNhan: 'Coach', nguon: 'T34_BATRU · BLV_MOC' });

      /* N-KY — hồ sơ đã đủ ba điều kiện thì việc nằm trên bàn Giám đốc;
         còn thiếu thì nó là việc của Coach. Hai câu khác nhau, hai người
         nhận khác nhau. */
      var dn = n.capDeNghi || {};
      if (dn.chuaKy) {
        var hs = G.blvDuyetDuoc(n, tenCoach) || {};
        /* Chỉ nhắc khi hồ sơ ĐÃ ĐỦ — cùng luật đã dùng cho ngăn chờ ký.
           Bản đầu tôi nhắc cả hồ sơ còn thiếu, và mười nhà ra mười lời
           nhắc giống hệt lượt rà soát RS-CAP buổi sáng. Một việc nói hai
           chỗ thì người đọc bỏ qua cả hai. */
        if (hs.duTrinh)
          ra.push({ ma: 'N-KY', c: '#B4720F', nha: n.nha, id: n.id,
            viec: 'Đề nghị cấp ' + dn.cap + ' — ' + (dn.moc || ''),
            lam: 'Hồ sơ đủ ba điều kiện. Trình ' + (hs.nguoiKy || 'người phê duyệt') +
              ' đọc bằng chứng rồi duyệt hoặc từ chối. Từ chối cũng ghi lý do.',
            han: (loai['N-KY'] || {}).khi,
            nguoiNhan: hs.nguoiKy || 'Giám đốc điều hành', nguon: 'BLV_DUYET' });
      }
    });

    /* N-TRAN — trần công suất. Đọc bvNhanDuoc() chứ không tự cắt chuỗi
       trần lấy con số đầu tiên: "8 gia đình T4 hoặc 3 gia đình T5" cắt
       thô ra 8, và một Coach giữ 3 nhà T5 đã đủ trần vẫn im. */
    var nguoi = tenCoach || (ds[0] && ds[0].coach);
    if (nguoi && typeof G.bvNhanDuoc === 'function') {
      ['T4', 'T5', 'T3', 'T2'].forEach(function (t) {
        var r = G.bvNhanDuoc(nguoi, t, null);
        if (r.chuaBiet) return;
        if (r.chan || r.sapDay)
          ra.push({ ma: 'N-TRAN', c: '#BE0E16', nha: '—',
            viec: r.vai + ' đang giữ ' + r.dangGiu + '/' + r.tran + ' nhà ' + t +
              (r.chan ? ' — ĐÃ ĐỦ TRẦN' : ' — ' + r.sapDay),
            lam: r.lam || 'Trần công suất đứng trên doanh thu. Đủ trần thì dừng nhận nhà mới.',
            han: 'ngay', nguoiNhan: 'Coach + Admin', nguon: 'BV_VAI.tran · bvNhanDuoc()' });
      });
    }

    return { ds: ra, so: ra.length, luat: (G.BLV_NHAC_LUAT || {}).khongTuGui || '' };
  };

  /* ═══════════ BỐN LƯỢT RÀ SOÁT ═══════════ */
  G.blvRaSoat = function (tenCoach) {
    var ds = G.blvNha(tenCoach), ra = [];
    (G.BLV_RASOAT || []).forEach(function (r) {
      var thay = [];
      if (r.ma === 'RS-NHA')
        thay = ds.filter(function (n) { return Number(n.nhac) >= 1; })
                 .map(function (n) { return n.nha + ' — đã nhắc ' + n.nhac + ' lần'; });
      if (r.ma === 'RS-CAP')
        thay = ds.filter(function (n) { return (n.capDeNghi || {}).chuaKy; })
                 .map(function (n) {
                   var hs = G.blvDuyetDuoc(n, tenCoach) || {};
                   var t = (hs.thieu || []).concat(hs.chuaBiet || []);
                   return n.nha + ' — đề nghị cấp ' + n.capDeNghi.cap +
                     (t.length ? ', hồ sơ còn thiếu: ' + t.join(' · ')
                               : ', đủ điều kiện trình ' + (hs.nguoiKy || ''));
                 });
      if (r.ma === 'RS-KICHBAN') {
        thay = ds.filter(function (n) {
          var dn = n.capDeNghi || {};
          var o = (typeof G.bvCap === 'function' && dn.cap) ? G.bvCap(n.tang, dn.cap) : null;
          return o && !o.nguoi;
        }).map(function (n) { return n.nha + ' — ô ' + (n.capDeNghi || {}).ma + ' trống cột người làm'; });
      }
      if (r.ma === 'RS-TINHHUONG') {
        var dem = {};
        ds.forEach(function (n) { dem[n.tang] = (dem[n.tang] || 0) + 1; });
        thay = Object.keys(dem).filter(function (t) { return dem[t] >= 2; })
                     .map(function (t) { return t + ' — ' + dem[t] + ' nhà cùng tầng, dạng khó dễ lặp'; });
      }
      ra.push({ ma: r.ma, ten: r.ten, hoi: r.hoi, ra: r.ra, viDangKe: r.viDangKe,
        thay: thay, so: thay.length });
    });
    return ra;
  };

  /* ═══════════ KHOÁ 1: VÉT CẠN ═══════════ */
  G.blvSoiVetCan = function (tenCoach) {
    var x = G.blvXep(tenCoach);
    if (x.chuaDo) return { chuaDo: true, thieu: x.thieu, loi: [] };
    var loi = [];
    if (x.tongTrongNgan !== x.tongNha)
      loi.push('tổng năm ngăn = ' + x.tongTrongNgan + ', tổng số nhà = ' + x.tongNha +
        ' — có nhà lọt khe giữa hai ngăn');
    /* Không nhà nào được nằm ở hai ngăn. */
    var thay = {};
    (x.ngan || []).forEach(function (ng) {
      ng.ds.forEach(function (m) {
        var id = m.nha.id;
        if (thay[id]) loi.push(m.nha.nha + ' nằm ở cả ' + thay[id] + ' và ' + ng.ma);
        thay[id] = ng.ma;
      });
    });
    var vet = (G.BLV_NGAN || []).filter(function (n) { return n.laPhanConLai; });
    if (vet.length !== 1) loi.push('phải có ĐÚNG MỘT ngăn vét phần còn lại, đang có ' + vet.length);
    return { chuaDo: false, loi: loi, tongNha: x.tongNha, tongTrongNgan: x.tongTrongNgan };
  };

  /* ═══════════ KHOÁ 2: THỨ TỰ NGĂN THEO SV_THUTU ═══════════ */
  G.blvSoiThuTu = function () {
    var ngan = (G.BLV_NGAN || []).slice().sort(function (a, b) { return a.thu - b.thu; });
    var loi = [];
    if (!ngan.length) return { chuaDo: true, thieu: 'BLV_NGAN', loi: [] };
    if (!(G.SV_THUTU || []).length) return { chuaDo: true, thieu: 'SV_THUTU', loi: [] };
    var bac = {};
    (G.SV_THUTU || []).forEach(function (b) { bac[b.ma] = b.bac; });
    var truoc = 0;
    ngan.forEach(function (n) {
      if (!n.bac) { if (!n.laPhanConLai) loi.push(n.ma + ' không mang bậc mà cũng không phải ngăn vét'); return; }
      if (!bac[n.bac]) { loi.push(n.ma + ' mang bậc không có trong SV_THUTU: ' + n.bac); return; }
      if (bac[n.bac] < truoc) loi.push(n.ma + ' xếp sau một ngăn có bậc thấp hơn — thứ tự đảo');
      truoc = bac[n.bac];
    });
    var d1 = ngan[0];
    if (!d1 || bac[d1.bac] !== 1) loi.push('ngăn đầu phải mang bậc 1 (an toàn), đang là ' + (d1 && d1.bac));
    return { chuaDo: false, loi: loi };
  };

  /* ═══════════ KHOÁ 3, 4, 5 ═══════════ */
  G.blvSoiGoi = function () {
    var ds = G.BLV_GOI || [], loi = [];
    if (!ds.length) return { chuaDo: true, thieu: 'BLV_GOI', loi: [] };
    if (ds.length !== 8) loi.push('gói có ' + ds.length + ' ô, phải tám');
    var thay = {};
    ds.forEach(function (o) {
      if (thay[o.ma]) loi.push(o.ma + ' trùng mã');
      thay[o.ma] = 1;
      if (!o.ten) loi.push('ô ' + o.o + ' thiếu tên');
      if (!o.gom) loi.push(o.ma + ' chưa nói gom những gì');
      if (!o.tuKho) loi.push(o.ma + ' chưa khai lấy từ kho nào — ô không nguồn là ô sẽ bịa');
    });
    if (!(G.BLV_GOI_LUAT || {}).viKhongAn) loi.push('chưa khai vì sao không ẩn ô trống');
    return { chuaDo: false, loi: loi, so: ds.length };
  };

  G.blvSoiNhac = function () {
    var ds = G.BLV_NHAC || [], loi = [];
    if (!ds.length) return { chuaDo: true, thieu: 'BLV_NHAC', loi: [] };
    ds.forEach(function (n) {
      if (!n.khi) loi.push(n.ma + ' chưa khai khi nào nhắc');
      if (!co(n.truoc)) loi.push(n.ma + ' chưa khai nhắc trước bao lâu');
      if (!n.noi) loi.push(n.ma + ' chưa khai nói gì');
    });
    var l = G.BLV_NHAC_LUAT || {};
    if (!l.khongNhacDon) loi.push('chưa khai luật không nhắc dồn');
    if (!l.khongTuGui) loi.push('chưa khai luật trợ lý không tự gửi');
    return { chuaDo: false, loi: loi, so: ds.length };
  };

  /* Bàn này KHÔNG có đường gửi thẳng cho gia đình. Phép kiểm đọc chính
     mã của tệp — khai luật mà mã vẫn gửi thì luật là lời suông. */
  G.blvSoiKhongTuGui = function () {
    var loi = [];
    var ma = String(G.blvGoi) + String(G.blvNhac) + String(G.blvXep);
    if (/fetch\(|XMLHttpRequest|sendBeacon|mcGoi|guiKhach/.test(ma))
      loi.push('bàn làm việc đang có đường gửi ra ngoài — luật khongTuGui thành lời suông');
    if (!(G.BLV_LUAT || {}).khongTuGuiChoNha) loi.push('chưa khai luật không tự gửi');
    return { chuaDo: false, loi: loi };
  };

  /* ═══════════ KHOÁ 7: MỖI TÍN HIỆU ĐỎ PHẢI KHAI ĐƯỜNG NỐI ═══════════

     Không tín hiệu nào được im lặng. Khai được thì khai bằng phép tính
     nào; không khai được thì nói vì sao và AI bắt thay. Trống cả hai là
     một dòng chữ đỏ trên màn mà không ai canh. */
  G.blvSoiNoiDo = function () {
    var ds = G.BV_DO || [], noi = G.BV_DO_NOI || [], loi = [];
    if (!ds.length || !noi.length)
      return { chuaDo: true, thieu: !ds.length ? 'BV_DO' : 'BV_DO_NOI', loi: [] };

    if (noi.length !== ds.length)
      loi.push('có ' + ds.length + ' tín hiệu mà bảng nối khai ' + noi.length);

    var thay = {};
    noi.forEach(function (x) {
      if (thay[x.so]) loi.push('tín hiệu ' + x.so + ' khai hai lần');
      thay[x.so] = 1;
      if (!ds.filter(function (d) { return d.so === x.so; })[0])
        loi.push('bảng nối có tín hiệu ' + x.so + ' mà BV_DO không có');
      if (x.noi && x.chuaNoi) loi.push('tín hiệu ' + x.so + ' vừa khai nối vừa khai chưa nối');
      if (!x.noi && !x.chuaNoi) loi.push('tín hiệu ' + x.so + ' không khai gì cả');
      if (x.noi && !x.vi) loi.push('tín hiệu ' + x.so + ' nối mà không nói vì sao nối như thế');
      if (x.chuaNoi && !x.aiBat) loi.push('tín hiệu ' + x.so + ' chưa nối mà không nói ai bắt thay');
    });
    ds.forEach(function (d) {
      if (!thay[d.so]) loi.push('tín hiệu ' + d.so + ' chưa có trong bảng nối');
    });

    /* Hàm chạy không được nối nhiều hơn kho khai. Thêm một phép đo
       trong hàm mà quên khai ở kho là lại có một đường nối vô hình. */
    var trongHam = String(G.blvViCoDo).match(/^\s*(\d+):\s*function/gm) || [];
    var soHam = trongHam.map(function (x) { return Number(x.match(/\d+/)[0]); }).sort();
    var soKho = noi.filter(function (x) { return x.noi; })
                   .map(function (x) { return x.so; }).sort();
    if (soHam.join(',') !== soKho.join(','))
      loi.push('hàm đo tín hiệu [' + soHam + '] mà kho khai nối [' + soKho + ']');

    return { chuaDo: false, loi: loi, may: soKho.length, tong: ds.length };
  };

  /* ═══════════ KHOÁ 8: NĂM TẦNG ĐỀU CÓ MỐC GẶP ═══════════ */
  G.blvSoiMoc = function () {
    var loi = [], ds = G.BLV_MOC || [];
    if (!ds.length) return { chuaDo: true, thieu: 'BLV_MOC', loi: [] };
    ['T1', 'T2', 'T3', 'T4', 'T5'].forEach(function (t) {
      var m = G.blvMocGap(t);
      if (m.chuaKhai) { loi.push('tầng ' + t + ' chưa khai mốc gặp'); return; }
      if (!m.ngay.length) loi.push('tầng ' + t + ' khai mốc mà máy tính ra rỗng');
      var tong = SO_NGAY[t] || 0;
      m.ngay.forEach(function (v) {
        if (tong && v > tong) loi.push('tầng ' + t + ' có mốc ngày ' + v + ' vượt quá ' + tong);
      });
    });
    ds.forEach(function (d) {
      if (!d.nguon) loi.push('mốc tầng ' + d.tang + ' chưa dẫn nguyên văn câu đã hứa');
      if (d.cach === 'tuKho' && !(G[d.tuKho] || []).length)
        loi.push('mốc tầng ' + d.tang + ' trỏ sang ' + d.tuKho + ' mà kho ấy rỗng');
      /* Chép số ngày vào kho mốc là dựng bản thứ hai. */
      if (d.cach === 'tuKho' && d.n)
        loi.push('mốc tầng ' + d.tang + ' vừa trỏ sang kho vừa chép sẵn số ngày');
    });
    return { chuaDo: false, loi: loi, so: ds.length };
  };

  /* ═══════════ KHOÁ 6: CỬA DUYỆT ═══════════

     Bốn điều phải đúng cùng lúc, và điều thứ ba là điều tôi sợ nhất:
     không kho BLV_ nào được phép ghi lại con số ngưỡng KPI. Ngày ai đó
     tiện tay chép "80" vào đây, hệ có hai ngưỡng cùng tên, và bản chép
     sẽ là bản không được sửa. */
  G.blvSoiDuyet = function () {
    var d = G.BLV_DUYET, ds = G.BLV_DUYET_DIEU || [], l = G.BLV_DUYET_LUAT || {}, loi = [];
    if (!d || !ds.length) return { chuaDo: true, thieu: 'BLV_DUYET', loi: [] };

    if (ds.length !== 3) loi.push('chốt của chủ hệ có ba điều kiện, kho đang có ' + ds.length);
    ds.forEach(function (x) {
      if (!x.tuKho) loi.push(x.ma + ' chưa khai đọc từ kho nào');
      if (!x.hut) loi.push(x.ma + ' chưa khai hụt thì làm gì');
      if (!x.aiLam) loi.push(x.ma + ' chưa khai ai làm');
    });

    /* Không chép ngưỡng — trừ MỘT chỗ: nguyên văn lời chủ hệ.
       Lần chạy thử đầu tiên phép kiểm này đỏ ngay khi kho còn lành, vì
       chính câu chốt có chữ "80%". Bỏ hẳn câu chốt đi thì mất nguyên văn,
       mà nới phép kiểm cho qua thì mất luôn cái nó canh. Đường thứ ba:
       MIỄN cho ô nguyên văn, rồi bắt con số trong ô ấy phải KHỚP với
       G.KPI_XIN_THEM. Ngày chủ hệ đổi ngưỡng, câu chốt cũ đỏ lên và có
       người phải đọc lại nó — đúng việc cần xảy ra. */
    if (typeof G.KPI_XIN_THEM === 'number') {
      var mien = { nguyenVanChot: 1 };
      var kho = JSON.parse(JSON.stringify([d, ds, l, G.BLV_CHOCHU || []]));
      Object.keys(mien).forEach(function (k) { delete kho[0][k]; });
      var re = new RegExp('(^|[^\\d])' + G.KPI_XIN_THEM + '([^\\d%]|%|$)');
      if (re.test(JSON.stringify(kho)))
        loi.push('kho cửa duyệt đang chép lại ngưỡng KPI ' + G.KPI_XIN_THEM +
          ' — ngưỡng chỉ sống ở G.KPI_XIN_THEM');

      var trichSo = (String(d.nguyenVanChot || '').match(/(\d+)\s*%/) || [])[1];
      if (!trichSo) loi.push('câu chốt của chủ hệ không còn nêu con số ngưỡng nào');
      else if (Number(trichSo) !== G.KPI_XIN_THEM)
        loi.push('câu chốt nói ngưỡng ' + trichSo + '%, kho đang chạy ' + G.KPI_XIN_THEM +
          '% — một trong hai đã đổi mà chỗ kia chưa theo');
    }

    /* Người ký phải là một quyền có thật trong bảng phân quyền, không
       phải một chuỗi đẹp. Sai tên quyền thì G.can() trả false với MỌI
       người, và cửa duyệt đóng vĩnh viễn mà không ai hiểu vì sao. */
    if (!d.quyen) loi.push('chưa khai quyền của người phê duyệt');
    else if (G.PERM && !co(G.PERM[d.quyen]))
      loi.push('quyền "' + d.quyen + '" không có trong bảng phân quyền');

    if (!l.mayKhongDuyet) loi.push('chưa khai luật máy không duyệt');
    if (!l.baTrangThai) loi.push('chưa khai vì sao mỗi điều kiện có ba trạng thái');

    /* Hàm phải trả đủ ba trạng thái, không được rút xuống hai. */
    var thu = { id: 'x', nha: 'Nhà thử', tang: 'T4', tuchu: 95, ngay: 300, vai: 9, nhac: 0,
      coach: '· nhà thử ·', capDeNghi: { cap: 9, chuaKy: true } };
    var r = G.blvDuyetDuoc(thu);
    if (!r.chuaDo) {
      if (r.duTrinh) loi.push('nhà chưa ai hỏi nguyện vọng mà cửa vẫn cho trình');
      var nv = (r.dieu || []).filter(function (x) { return x.ma === 'NGUYENVONG'; })[0];
      if (!nv || nv.trangThai !== 'chuaBiet')
        loi.push('vắng trường nguyện vọng phải ra CHƯA BIẾT, đang ra ' + (nv && nv.trangThai));
    }
    return { chuaDo: false, loi: loi, so: ds.length };
  };

  /* ═══════════════════════════════════════════════════════════
     MÀN HÌNH
     ═══════════════════════════════════════════════════════════ */
  G.VIEWS['ban-coach'] = function () {
    if (!G.BLV_NGAN)
      return U.empty('Chưa mở được phần này',
        'Bàn làm việc nằm trong gói nghề. Đăng nhập bằng tài khoản Coach để nạp.');

    var toi = (G.S && G.S.acc) || {};
    var tenCoach = toi.ten || undefined;
    var xep = G.blvXep(tenCoach);
    /* Coach chưa có nhà nào mang tên mình thì xem toàn bộ — để bàn
       không trống trơn trên máy demo, và nói rõ đang xem của ai. */
    var loc = true;
    if (!xep.chuaDo && xep.tongNha === 0) { xep = G.blvXep(); tenCoach = undefined; loc = false; }

    var loi = G.BLV_LOI || {};
    var o = U.ph({ eyebrow: 'BÀN LÀM VIỆC · COACH', ic: 'pulse', grad: 1,
      t: 'Nhớ — nhận việc — xử lý, không bỏ sót nhà nào',
      lead: loi.khongBoSotLaPhepCong || '' });

    /* ── Thanh đếm: năm ngăn, và phép cộng ── */
    var vc = G.blvSoiVetCan(tenCoach);
    o += '<div class="card mb" style="border-color:' + (vc.loi.length ? '#BE0E16' : '#0B667556') + '">' +
      '<div style="display:flex;flex-wrap:wrap;gap:14px;align-items:baseline">' +
      (xep.ngan || []).map(function (n) {
        return '<div style="min-width:120px"><span class="tiny up" style="color:' + n.c + '">' +
          h(n.ten) + '</span><br><b style="font-size:1.5em;color:' + n.c + '">' + n.so + '</b></div>';
      }).join('') +
      '<div style="min-width:150px;border-left:1px solid var(--gita-vien-2);padding-left:14px">' +
      '<span class="tiny up dim">TỔNG NHÀ</span><br><b style="font-size:1.5em">' + xep.tongNha + '</b></div>' +
      '</div>' +
      '<p class="tiny mt" style="line-height:1.7;color:' + (vc.loi.length ? '#BE0E16' : '#0B6675') + '">' +
      (vc.loi.length
        ? '<b>LỆCH: ' + h(vc.loi.join(' · ')) + '</b>'
        : 'Năm ngăn cộng lại ' + vc.tongTrongNgan + ' = ' + vc.tongNha +
          ' nhà. Không nhà nào lọt khe giữa hai ngăn.') + '</p>' +
      '<p class="tiny dim mt" style="line-height:1.7">' +
      (loc ? 'Đang xem nhà của ' + h(tenCoach || '') + '.'
           : 'Tài khoản này chưa được giao nhà nào — đang xem toàn bộ nhà trong hệ.') + '</p></div>';

    /* Sáu khoá chạy thật mỗi lần mở màn. Bản 9.57 tôi viết năm khoá rồi
       chỉ gọi một — năm khoá kia đúng nghĩa chưa từng chạy, và một khoá
       chưa từng chạy thì chưa phải một khoá. */
    var lech = [].concat(
      G.blvSoiThuTu().loi || [], G.blvSoiGoi().loi || [], G.blvSoiNhac().loi || [],
      G.blvSoiKhongTuGui().loi || [], G.blvSoiDuyet().loi || [],
      G.blvSoiNoiDo().loi || [], G.blvSoiMoc().loi || []);
    if (lech.length)
      o += '<div class="card mb" style="border-color:#BE0E16"><b class="sm" style="color:#BE0E16">' +
        'LỆCH: ' + h(lech.join(' · ')) + '</b></div>';

    o += G.kaKhung ? G.kaKhung('ban-coach', 'dau') : '';

    /* ── Năm ngăn ── */
    (xep.ngan || []).forEach(function (ng) {
      o += U.sec(ng.ten + ' — ' + ng.so + ' nhà', ng.la);
      if (!ng.so) {
        o += '<div class="card mb"><p class="tiny dim" style="line-height:1.7">Không có nhà nào. ' +
          h(ng.lam || '') + '</p></div>';
        return;
      }
      o += '<div class="card mb" style="border-color:' + ng.c + '4d">' + ng.ds.map(function (m) {
        var n = m.nha, dn = n.capDeNghi || {};
        var s = '<div style="padding:10px 0;border-bottom:1px solid var(--gita-vien-2)">' +
          '<b class="sm">' + h(n.nha) + '</b> <span class="tiny dim">' + h(n.hv || '') +
          (n.lop ? ' · ' + h(n.lop) : '') + '</span><br>' +
          '<span class="tiny" style="color:' + ng.c + '">' + h(n.tang) + ' · ngày ' + n.ngay + '/' +
          n.tongNgay +
          [(n.chang && (n.chang.ten || n.chang.mua)) ? (n.chang.ten || n.chang.mua) : '',
           n.band ? 'băng ' + n.band : ''].filter(Boolean)
            .map(function (x) { return ' · ' + h(x); }).join('') + '</span>';

        if (m.quaHan)
          s += '<div class="mt" style="padding:8px 10px;border-left:3px solid #BE0E16;background:var(--gita-nen-2)">' +
            '<b class="tiny" style="color:#BE0E16">QUÁ HẠN ' + m.quaHan.quaNgay + ' NGÀY' +
            (m.quaHan.cong ? ' · ' + h(m.quaHan.cong) : '') + '</b>' +
            '<p class="tiny mt" style="line-height:1.7">' + h(m.quaHan.ten) + '</p>' +
            '<p class="tiny" style="line-height:1.7">' + h(m.quaHan.lam) + '</p>' +
            '<p class="tiny" style="line-height:1.7;color:#BE0E16">' + h(m.quaHan.khongDuocLam) + '</p></div>';

        if (dn.cap)
          s += '<p class="tiny mt" style="line-height:1.7">Cấp đề nghị <b>' + dn.cap + '/10</b> — ' +
            h(dn.moc || '') + ' <span style="color:#B4720F">CHƯA KÝ</span></p>' +
            '<p class="tiny dim" style="line-height:1.7">' + h(dn.canCu || '') +
            (dn.noiLech ? ' · <span style="color:#B4720F">' + h(dn.noiLech) + '</span>' : '') + '</p>';
        else if (dn.chuaDoDuoc)
          s += '<p class="tiny mt" style="line-height:1.7;color:#B4720F">Chưa đề nghị được cấp: ' +
            h(dn.vi || '') + '</p>';

        /* ── Hồ sơ trình duyệt: ba điều kiện, ba màu ──
           Điều kiện CHƯA BIẾT mang màu riêng, không dùng chung màu đỏ với
           CHƯA ĐẠT. Hai thứ ấy đòi hai việc khác nhau, và Coach nhìn màu
           trước khi đọc chữ. */
        if (m.hoSo && !m.hoSo.chuaDo) {
          var hs = m.hoSo, MAU = { dat: '#0B6675', hut: '#BE0E16', chuaBiet: '#B4720F' };
          var NHAN = { dat: 'ĐẠT', hut: 'CHƯA ĐẠT', chuaBiet: 'CHƯA BIẾT' };
          s += '<div class="mt" style="padding:8px 10px;border-left:3px solid ' +
            (hs.duTrinh ? '#0B6675' : '#B4720F') + ';background:var(--gita-nen-2)">' +
            '<b class="tiny" style="color:' + (hs.duTrinh ? '#0B6675' : '#B4720F') + '">' +
            (hs.duTrinh ? 'ĐỦ ĐIỀU KIỆN TRÌNH — chờ ' + h(hs.nguoiKy)
                        : 'HỒ SƠ CHƯA ĐỦ ĐỂ TRÌNH') + '</b>' +
            hs.dieu.map(function (dk) {
              return '<p class="tiny mt" style="line-height:1.7"><span style="color:' +
                MAU[dk.trangThai] + '">● ' + NHAN[dk.trangThai] + '</span> — ' + h(dk.ten) +
                ': ' + h(dk.noi || '') +
                (dk.canLam ? '<br><span class="dim">' + h(dk.canLam) + '</span>' : '') +
                (dk.chiCanhBao ? '<br><span style="color:#B4720F">Chỉ cảnh báo, chưa chặn — ' +
                  h(dk.chuaChan || '') + '</span>' : '') + '</p>';
            }).join('') +
            '<p class="tiny dim mt" style="line-height:1.7">' + h(hs.mayKhongDuyet) + '</p></div>';
        }

        (m.viCo || []).forEach(function (d) {
          s += '<div class="mt" style="padding:8px 10px;border-left:3px solid #BE0E16;background:var(--gita-nen-2)">' +
            '<b class="tiny" style="color:#BE0E16">' + h(d.muc) + ' #' + d.so + ' · trong ' +
            h(d.hanGio) + ' · ' + h(d.nguoiNhan) + '</b>' +
            '<p class="tiny mt" style="line-height:1.7">' + h(d.tinHieu) + '</p>' +
            '<p class="tiny" style="line-height:1.7">' + h(d.hanhDong) + '</p></div>';
        });
        (m.viec || []).forEach(function (v) {
          s += '<p class="tiny mt" style="line-height:1.7;color:#5140B4"><b>' + h(v.loai) +
            ' — còn ' + v.conLai + ' ngày:</b> ' + h(v.ten) +
            (v.dieuKien ? '<br><span class="dim">Điều kiện: ' + h(v.dieuKien) + '</span>' : '') +
            (v.chuanBi ? '<br><span class="dim">' + h(v.chuanBi) + '</span>' : '') + '</p>';
        });
        if (m.im)
          s += '<p class="tiny mt" style="line-height:1.7;color:#B45309"><b>' + h(m.im.muc) + ':</b> ' +
            h(m.im.dauHieu) + '<br>' + h(m.im.lam || '') +
            '<br><span style="color:#BE0E16">Không: ' + h(m.im.khong || '') + '</span></p>';

        return s + '</div>';
      }).join('') + '</div>';
    });

    /* ── Trợ lý nhắc việc ── */
    var nh = G.blvNhac(tenCoach);
    o += U.sec('Trợ lý nhắc việc — ' + nh.so + ' lời nhắc',
      'Mỗi lời nhắc có hạn giờ và có tên người nhận. Hạn đọc từ kho, không tự đặt.');

    /* ── Máy canh được mấy phần trong hai mươi tín hiệu ──
       Dòng này phải đứng TRƯỚC danh sách nhắc. Coach đọc một bảng đỏ
       rồi tin là mình được canh hết; nói thật con số trước khi họ đọc
       thì họ còn tự nhìn phần còn lại. */
    var cd = G.blvDoCanhDuoc();
    o += '<div class="card mb" style="border-color:#B4720F56">' +
      '<b class="sm">Máy tự bắt được <span style="color:#BE0E16">' + cd.may + '/' + cd.tong +
      '</span> tín hiệu đỏ — tín hiệu số ' + h(cd.dsMay.join(', ')) + '</b>' +
      '<p class="tiny mt" style="line-height:1.75">' + h(cd.luat) + '</p>' +
      '<div class="mt">' + (G.BV_DO_NOI || []).map(function (x) {
        var t = (G.BV_DO || []).filter(function (d) { return d.so === x.so; })[0] || {};
        return '<p class="tiny" style="line-height:1.7;padding:3px 0">' +
          '<span style="color:' + (x.noi ? '#0B6675' : '#B4720F') + '">' +
          (x.noi ? '● máy' : '○ người') + '</span> <b>#' + x.so + '</b> ' + h(t.tinHieu || '') +
          '<br><span class="dim">' + h(x.noi ? 'đo bằng ' + x.noi : x.chuaNoi) + '</span>' +
          (x.aiBat ? '<br><span class="dim">Ai bắt: ' + h(x.aiBat) + '</span>' : '') +
          (x.canTruong ? '<br><span style="color:#BE0E16">Cần trường: ' + h(x.canTruong) +
            '</span>' : '') + '</p>';
      }).join('') + '</div></div>';
    o += '<div class="card mb">' + (nh.ds || []).map(function (x) {
      return '<div style="padding:9px 0;border-bottom:1px solid var(--gita-vien-2)">' +
        '<span class="tiny up" style="color:' + x.c + '"><b>' + h(x.ma) + '</b></span> ' +
        '<b class="sm">' + h(x.nha) + '</b> ' +
        '<span class="tiny" style="color:' + x.c + '">' + h(String(x.han)) + '</span> ' +
        '<span class="tiny dim">→ ' + h(x.nguoiNhan) + '</span>' +
        '<p class="tiny mt" style="line-height:1.7">' + h(x.viec) + '</p>' +
        '<p class="tiny mt" style="line-height:1.7;color:#0B6675">' + h(x.lam || '') + '</p>' +
        (x.cam ? '<p class="tiny mt" style="line-height:1.7;color:#BE0E16">' + h(x.cam) + '</p>' : '') +
        (x.nguon ? '<p class="tiny dim mt" style="line-height:1.7">nguồn: ' + h(x.nguon) + '</p>' : '') +
        '</div>';
    }).join('') + '</div>';
    o += '<p class="tiny mb" style="line-height:1.7;color:#B4720F"><b>' + h(nh.luat) + '</b></p>';

    /* ── Gói tài nguyên: mở thật cho nhà đầu tiên có việc ── */
    var uuTien = (xep.ngan || []).filter(function (n) { return n.so; })[0];
    var nhaMau = uuTien && uuTien.ds[0] ? uuTien.ds[0].nha : null;
    if (nhaMau) {
      var g = G.blvGoi(nhaMau.id, tenCoach);
      o += U.sec('Gói tài nguyên trợ lý đã đóng sẵn — ' + h(nhaMau.nha),
        'Tám ô. Ô nào chưa có thì ghi là chưa có, không ẩn.');
      o += '<div class="card mb">' + (g.o || []).map(function (x) {
        return '<div style="padding:9px 0;border-bottom:1px solid var(--gita-vien-2)">' +
          '<b class="sm">' + h(x.ten) + '</b> <span class="tiny dim">' + h(x.tuKho || '') + '</span>' +
          (x.coGi
            ? '<p class="tiny mt" style="line-height:1.75">' + h(x.coGi) + '</p>'
            : '<p class="tiny mt" style="line-height:1.7;color:#B4720F"><b>CHƯA CÓ</b> — ' +
              h(x.chuaCo) + '</p>') + '</div>';
      }).join('') + '</div>';
      o += '<p class="tiny mb" style="line-height:1.7;color:#B4720F"><b>' + h(g.luat || '') + '</b></p>';
    }

    /* ── Mốc gặp của năm tầng ── */
    var ml = G.BLV_MOC_LUAT || {};
    o += U.sec('Mốc gặp của năm tầng', ml.cot || '');
    o += '<div class="card mb">' + ['T1', 'T2', 'T3', 'T4', 'T5'].map(function (t) {
      var m = G.blvMocGap(t);
      return '<div style="padding:8px 0;border-bottom:1px solid var(--gita-vien-2)">' +
        '<b class="sm">' + t + ' · ' + h(m.ten || '—') + '</b> ' +
        '<span class="tiny" style="color:#5140B4">ngày ' +
        h((m.ngay || []).join(' · ') || 'CHƯA CÓ') + '</span>' +
        '<p class="tiny dim mt" style="line-height:1.7">' + h(m.nguon || '') + '</p>' +
        (m.lech ? '<p class="tiny mt" style="line-height:1.7;color:#B4720F">' + h(m.lech) +
          '</p>' : '') + '</div>';
    }).join('') + '</div>';
    o += '<p class="tiny mb" style="line-height:1.75;color:#B4720F"><b>' + h(ml.viTheo || '') +
      '</b></p>';

    /* ── Bốn lượt rà soát ── */
    o += U.sec('Bốn lượt trợ lý rà mỗi sáng', '');
    o += '<div class="card mb">' + G.blvRaSoat(tenCoach).map(function (r) {
      return '<div style="padding:9px 0;border-bottom:1px solid var(--gita-vien-2)">' +
        '<b class="sm">' + h(r.ten) + '</b> <span class="tiny" style="color:#0B6675">' +
        r.so + ' chỗ</span>' +
        '<p class="tiny dim mt" style="line-height:1.7">' + h(r.hoi) + '</p>' +
        (r.thay.length
          ? '<ul class="tiny mt" style="line-height:1.8;padding-left:18px">' +
            r.thay.map(function (t) { return '<li>' + h(t) + '</li>'; }).join('') + '</ul>'
          : '<p class="tiny mt" style="line-height:1.7;color:#0B6675">Không thấy chỗ nào.</p>') +
        (r.viDangKe ? '<p class="tiny mt" style="line-height:1.7;color:#B4720F">' +
          h(r.viDangKe) + '</p>' : '') + '</div>';
    }).join('') + '</div>';

    /* ── Cửa phê duyệt cấp ── */
    var cd = G.BLV_DUYET, ky = G.blvAiKyDuoc();
    if (cd) {
      o += U.sec('Cửa phê duyệt cấp — ai ký, và ký theo điều kiện gì',
        cd.nguyenVanChot);
      o += '<div class="card mb" style="border-color:' + (ky.duoc ? '#0B6675' : '#B4720F') + '56">' +
        '<p class="sm" style="line-height:1.75"><b>Người ký: ' + h(cd.nguoiKy) + '</b> ' +
        '<span class="tiny dim">quyền ' + h(cd.quyen) + '</span></p>' +
        '<p class="tiny mt" style="line-height:1.75;color:' + (ky.duoc ? '#0B6675' : '#B4720F') + '">' +
        (ky.duoc
          ? 'Tài khoản đang dùng (' + h(ky.ai || '') + ') CÓ quyền phê duyệt.'
          : h(ky.vi)) + '</p>' +
        '<p class="tiny mt" style="line-height:1.75">' + h(cd.vieccuaCoach) + '</p>' +
        '<p class="tiny mt" style="line-height:1.75">' + h(cd.vieccuaMay) + '</p>' +
        '<p class="tiny dim mt" style="line-height:1.75">' + h(cd.viKhongPhaiCoach) + '</p>' +
        (G.BLV_DUYET_DIEU || []).map(function (dk) {
          return '<div style="padding:9px 0;border-top:1px solid var(--gita-vien-2)">' +
            '<b class="sm">' + dk.so + '. ' + h(dk.ten) + '</b> ' +
            '<span class="tiny dim">' + h(dk.tuKho) + '</span>' +
            '<p class="tiny mt" style="line-height:1.75">' +
            (dk.doDuoc ? 'Máy đo được.' : '<span style="color:#B4720F">Máy KHÔNG đo được.</span>') +
            ' ' + h(dk.aiLam) + '</p>' +
            (dk.viMayKhongSuy ? '<p class="tiny dim mt" style="line-height:1.75">' +
              h(dk.viMayKhongSuy) + '</p>' : '') + '</div>';
        }).join('') + '</div>';

      var dl = G.BLV_DUYET_LUAT || {};
      o += '<div class="card mb">' + Object.keys(dl).map(function (k) {
        return '<p class="tiny" style="line-height:1.75;padding:4px 0">• ' + h(dl[k]) + '</p>';
      }).join('') + '</div>';
    }

    /* ── Chỗ còn chờ chủ hệ ── */
    if ((G.BLV_CHOCHU || []).length) {
      o += U.sec('Chỗ này chờ chủ hệ, không chờ mã', '');
      o += '<div class="card mb" style="border-color:#B4720F56">' +
        G.BLV_CHOCHU.map(function (c) {
          return '<div style="padding:9px 0;border-bottom:1px solid var(--gita-vien-2)">' +
            '<b class="sm" style="color:#B4720F">' + h(c.hoi) + '</b>' +
            '<p class="tiny mt" style="line-height:1.75">' + h(c.boi) + '</p>' +
            (c.toiKhongTuDat ? '<p class="tiny mt" style="line-height:1.75">' +
              h(c.toiKhongTuDat) + '</p>' : '') +
            '<p class="tiny dim mt" style="line-height:1.75">Máy đang làm: ' +
            h(c.mayDangLam) + '</p></div>';
        }).join('') + '</div>';
    }

    /* ── Luật của bàn ── */
    o += U.sec('Luật của bàn này', '');
    var bl = G.BLV_LUAT || {};
    o += '<div class="card mb">' + Object.keys(bl).map(function (k) {
      return '<p class="tiny" style="line-height:1.75;padding:4px 0">• ' + h(bl[k]) + '</p>';
    }).join('') + '</div>';

    o += G.kaKhung ? G.kaKhung('ban-coach', 'cuoi') : '';
    return o;
  };
})();
