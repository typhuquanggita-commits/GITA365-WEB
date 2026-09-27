/* ═══════════════════════════════════════════════════════════════
   GITA 365 — MÁY CHẠY BỘ BẢN VẼ 13 TỜ

   Kho ở kho-goc/data.ban-ve.js (máy sinh) và data.ban-ve-luat.js
   (viết tay). Toàn bộ ở gói NGHỀ.

   ═══ CÁI QUAN TRỌNG NHẤT TỆP NÀY LÀM ═══

   bvGhiNhanDuoc(tang, cap, bangChung) — cổng ghi nhận cấp.

   Nguyên tắc số 1 của cả bộ bản vẽ: "Chỉ ghi nhận cấp N khi có bằng
   chứng quan sát được. Không ghi theo lịch."

   Hàm này là chỗ nguyên tắc ấy thành cái chặn. Nó KHÔNG chấm bằng
   chứng đúng hay sai — chấm đúng sai là việc nghề. Nó chỉ từ chối khi
   không có gì để chấm, và nó nói ra ô ấy đòi bằng chứng gì.

   Vì sao đáng có: một hệ ghi cấp theo lịch thì bảng lên đều còn nhà
   đứng yên, và người đọc bảng ấy quyết định sai vì họ tin con số.

   ═══ SÁU CÁI MỞ ═══

   bvCap(tang, cap)          đọc một ô: mốc, bằng chứng, máy làm gì,
                             người làm gì, điểm WOW, đường tụt.
   bvGhiNhanDuoc(...)        cổng ghi nhận — xem trên.
   bvDuocBanKhong(cap)       luật cổng số 2: từ cấp 4 trở đi mọi hoạt
                             động bán phải IM LẶNG.
   bvCong(ma)                đặc tả một cổng chuyển tầng.
   bvLoc(tin)                tám bộ lọc ngôn ngữ, chạy được.
   bvModuleThieu()           bản đồ nâng cấp: module nào còn hụt gì.

   ═══ NĂM CÁI KHOÁ ═══

   bvSoi50()          đúng 50 ô, mỗi ô có bằng chứng và có đường tụt.
   bvSoiNhip()        mười nhịp, và ba luật của cỗ máy còn đúng: 07
                      trước 08, 10 nối về 01, nhịp 03 và 09 có người.
   bvSoiDo()          hai mươi tín hiệu, mỗi cái có hạn giờ và người
                      nhận; mọi tín hiệu Đỏ 1 phải trong 2 giờ.
   bvSoiMaCong()      cổng bản vẽ KHÔNG được mang khoá C1–C4 — kho đã
                      có G.CHUYENDOI dùng bộ mã ấy với nghĩa khác.
   bvSoiModule()      mọi màn khai ở bản đồ nâng cấp phải có thật.

   ═══ VÌ SAO bvSoiMaCong() ĐÁNG CÓ MỘT PHÉP KIỂM RIÊNG ═══

   G.CHUYENDOI có tám cổng C0–C7. Bộ bản vẽ có bốn cổng cũng gọi C1–C4,
   lệch nhau đúng một bậc. Hai bộ mã trùng chữ khác nghĩa là lớp hỏng
   ngầm điển hình: cả hai đều tồn tại thật, nên người trỏ nhầm không
   thấy lỗi, chỉ thấy một cổng có điều kiện lạ.

   Nên khoá của bản vẽ là BVC*, và phép kiểm này canh đúng chỗ ấy.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;
G.VIEWS = G.VIEWS || {};

(function () {
  var U = G.U, h = U.h;
  var CAP_IM_BAN = 4;   /* từ cấp này trở đi mọi hoạt động bán im lặng */

  function maTang(t) { var m = String(t == null ? '' : t).match(/(\d)/); return m ? 'T' + m[1] : ''; }
  function gio(s) {
    var x = String(s || '').toLowerCase();
    var m = x.match(/(\d+)\s*giờ/);   if (m) return Number(m[1]);
    var d = x.match(/(\d+)\s*ngày/);  if (d) return Number(d[1]) * 24;
    if (/ngay lập tức|ngay|trong ngày/.test(x)) return 0;
    return null;
  }

  /* ═══════════ MỞ 1: ĐỌC MỘT Ô ═══════════ */
  G.bvCap = function (tang, cap) {
    var ds = G.BV_CAPDO || [];
    if (!ds.length) return { chuaDo: true, thieu: 'BV_CAPDO' };
    var t = maTang(tang), n = Number(cap);
    var o = ds.filter(function (x) { return x.tang === t && x.cap === n; })[0];
    if (!o) return { khongCo: true, tang: t, cap: n,
      coNhung: ds.filter(function (x) { return x.tang === t; }).map(function (x) { return x.cap; }) };
    return {
      ma: o.ma, tang: o.tang, cap: o.cap, moc: o.moc,
      bangChung: o.bangChung, ai: o.ai, nguoi: o.nguoi, wow: o.wow, neuTut: o.neuTut,
      khuc: o.cap <= 3 ? 'vào cuộc' : (o.cap <= 7 ? 'tạo kết quả' : 'trở thành trụ cột'),
      duocBan: G.bvDuocBanKhong(o.cap).duoc
    };
  };

  /* ═══════════ MỞ 2: CỔNG GHI NHẬN CẤP ═══════════

     KHÔNG chấm bằng chứng đúng hay sai — đó là việc nghề. Chỉ từ chối
     khi không có gì để chấm, và nói ra ô ấy đòi bằng chứng gì. */
  G.bvGhiNhanDuoc = function (tang, cap, bangChung) {
    var o = G.bvCap(tang, cap);
    if (o.chuaDo || o.khongCo) return o;
    var co = String(bangChung == null ? '' : bangChung).trim();
    if (!co) return {
      ghiDuoc: false, ma: o.ma, thieuBangChung: true,
      doiGi: o.bangChung,
      luat: (G.BV_CAPDO_LUAT || {}).cot || '',
      vi: (G.BV_CAPDO_LUAT || {}).vi || ''
    };
    return {
      ghiDuoc: true, ma: o.ma, moc: o.moc, daCo: co,
      nhac: 'Máy KHÔNG ký. Cấp mới cần tên một người thật xác nhận.',
      theoLuat: ((G.BV_NHIP_LUAT || {}).nguoiThat || {}).luat || ''
    };
  };

  /* ═══════════ MỞ 3: CẤP NÀY CÒN ĐƯỢC BÁN KHÔNG ═══════════ */
  G.bvDuocBanKhong = function (cap) {
    var n = Number(cap) || 0;
    var l = (G.BV_CONG_LUAT || []).filter(function (x) { return x.no === 2; })[0] || {};
    if (n >= CAP_IM_BAN) return {
      duoc: false, cap: n, tuCap: CAP_IM_BAN,
      luat: l.luat || '', chiTiet: l.chiTiet || '',
      conLai: 'Chỉ còn đồng hành.'
    };
    return { duoc: true, cap: n, tuCap: CAP_IM_BAN,
      nhac: 'Còn được nói, nhưng vẫn qua luật số 1: chẩn đoán trước, đề xuất sau.' };
  };

  /* ═══════════ TRẦN CÔNG SUẤT — HÀM CHẶN THẬT ═══════════

     Kho đòi hàm này hai lần, bằng chữ, và chưa ai viết nó:

       BV_VAI_LUAT luật 3   "một vai đã đủ trần thì hệ thống DỪNG nhận
                             khách mới cho vai đó. Không có ngoại lệ vì
                             lý do doanh số."
       BV_CONG_LUAT luật 5  "Không mở cổng khi Coach hoặc Tư vấn đã đủ trần."
       CS_NEN N2            "Hệ từ chối cái thứ sáu." và câu nặng nhất:
                             "Trần không có hàm chặn thì sáu tháng sau ai
                              cũng giữ tám nhà."
       BV_BANGIAO           "Tư vấn → Coach: XÁC NHẬN CÒN TRẦN CÔNG SUẤT"
                             — nêu đúng thời điểm phải hỏi.

     Bốn chỗ, ba tờ khác nhau, cùng một câu. Nên câu hỏi tôi để lại ở bản
     9.56 — "trần có được dùng để chặn không" — thật ra đã có câu trả lời
     nằm sẵn trong kho; tôi hỏi lại một điều chủ hệ đã chốt.

     ═══ TRẦN CHẶN Ở ĐÂU: NHẬN NHÀ MỚI, KHÔNG PHẢI LÊN CẤP ═══

     Cả bốn chỗ đều nói "nhận khách MỚI" và "mở CỔNG". Không chỗ nào nói
     lên cấp trong tầng. Một nhà Coach đã giữ, đi từ cấp 6 lên cấp 7,
     không tiêu thêm một suất nào — chặn nó vì Coach đông nhà là phạt
     gia đình vì việc của hệ.

     ═══ BẢN ĐỒ TẦNG → VAI KHÔNG VIẾT LẠI Ở ĐÂY ═══

     BV_VAI.tran đã tự khai tầng nào thuộc vai nào: "40 hồ sơ T2 hoặc 15
     hồ sơ T3" là Tư vấn, "8 gia đình T4 hoặc 3 gia đình T5" là Coach.
     Dựng thêm một bảng tầng→vai là dựng bản thứ hai của một thứ đã có. */

  G.bvTranVai = function (tenVai) {
    var v = (G.BV_VAI || []).filter(function (x) {
      return String(x.ten).trim() === String(tenVai).trim();
    })[0];
    if (!v) return null;
    if (!v.tran) return { vai: v.ten, chuoi: null, theoTang: {}, khongKhaiTran: true };
    var ra = { vai: v.ten, chuoi: v.tran, theoTang: {} }, m;
    var re = /(\d+)\s*(?:gia đình|hồ sơ)\s*(T\d)/g;
    while ((m = re.exec(String(v.tran)))) ra.theoTang[m[2]] = Number(m[1]);
    if (/không giới hạn/i.test(v.tran)) ra.khongGioiHan = true;
    return ra;
  };

  /* Vai nào giữ tầng này — đọc ngược từ chính các trần đã khai. */
  G.bvVaiGiuTang = function (tang) {
    var t = String(tang || '').toUpperCase(), thay = null;
    (G.BV_VAI || []).forEach(function (v) {
      var tr = G.bvTranVai(v.ten);
      if (tr && tr.theoTang && typeof tr.theoTang[t] === 'number' && !thay) thay = tr;
    });
    return thay;
  };

  /* Người này còn nhận thêm được một nhà ở tầng ấy không.
     dsNha do bên gọi truyền vào — hàm này không tự đi lấy danh sách nhà,
     vì nó nằm ở gói bản vẽ và không được biết ai đang đăng nhập. */
  G.bvNhanDuoc = function (nguoi, tang, dsNha) {
    var t = String(tang || '').toUpperCase();
    var tr = G.bvVaiGiuTang(t);
    if (!nguoi) return { chuaBiet: true, vi: 'Chưa có tên người phụ trách để đếm.' };
    if (!tr) return { chuaBiet: true, vi: 'Bộ bản vẽ chưa khai trần cho tầng ' + t + '.' };

    var ds = dsNha || (typeof G.dsNha === 'function' ? G.dsNha() : (G.FAMILIES || [])) || [];
    var giu = ds.filter(function (x) {
      var m = String(x.tier == null ? '' : x.tier).match(/(\d)/);
      return x.coach === nguoi && m && ('T' + m[1]) === t;
    }).length;

    var tran = tr.theoTang[t];
    var l5 = (G.BV_CONG_LUAT || []).filter(function (x) { return x.no === 5; })[0] || {};
    var l3 = (G.BV_VAI_LUAT || []).filter(function (x) { return /trần công suất/i.test(x.luat); })[0] || {};

    if (giu >= tran) return {
      duoc: false, chan: true, vai: tr.vai, nguoi: nguoi, tang: t,
      dangGiu: giu, tran: tran, tranChuoi: tr.chuoi,
      vi: tr.vai + ' ' + nguoi + ' đang giữ ' + giu + '/' + tran + ' nhà ' + t + ' — đã đủ trần.',
      lam: 'Chuyển cho người còn trần, hoặc để nhà chờ. KHÔNG giao dày lên.',
      theoLuat: l5.luat || '', khongNgoaiLe: (l3.chiTiet || '')
    };
    return {
      duoc: true, chan: false, vai: tr.vai, nguoi: nguoi, tang: t,
      dangGiu: giu, tran: tran, tranChuoi: tr.chuoi, conCho: tran - giu,
      /* Báo sớm từ 80% để người điều phối còn kịp xoay, chứ không báo
         đúng lúc đã đầy — lúc ấy nhà đã ở trên bàn rồi. */
      sapDay: giu >= Math.ceil(tran * 0.8) ? 'Còn ' + (tran - giu) + ' suất. Sắp đủ trần.' : undefined
    };
  };

  /* KHOÁ: trần phải CHẶN được, không chỉ nằm trên giấy. */
  G.bvSoiTran = function () {
    var loi = [], ds = G.BV_VAI || [];
    if (!ds.length) return { chuaDo: true, thieu: 'BV_VAI', loi: [] };

    /* KHÔNG đếm "phải có đúng N trần". Bản đầu tôi viết N = 7, lấy từ
       câu "bảy con số trần" tôi tự viết ở 9.56 — mà bản vẽ khai SÁU.
       Phép kiểm đỏ ngay trên kho còn lành, và nó đỏ vì con số của tôi
       sai chứ không vì kho sai. Một phép kiểm canh con số tôi tự đặt ra
       thì nó canh trí nhớ của tôi, không canh cái kho.

       Nên hỏi TÍNH CHẤT: trần nào khai theo tầng thì phải đọc ra được
       ít nhất một tầng. Chuỗi đổi cách viết mà máy đọc ra rỗng là chỗ
       trần chết trong im lặng — trần vẫn nằm đó, hàm chặn vẫn chạy, và
       nó cho qua tất cả. */
    var soTran = 0;
    ds.forEach(function (v) {
      var tr = G.bvTranVai(v.ten);
      if (!tr || !tr.chuoi) return;
      soTran++;
      if (/(gia đình|hồ sơ)\s*T\d/.test(tr.chuoi) && !Object.keys(tr.theoTang).length)
        loi.push('trần của ' + v.ten + ' ghi theo tầng mà máy đọc ra rỗng: "' + tr.chuoi + '"');
    });
    if (!soTran) loi.push('không vai nào còn khai trần — hàm chặn sẽ cho qua tất cả');

    /* Tầng CÓ THU TIỀN phải có người khai trần cho nó. Đây là chỗ luật
       số 5 nhắm tới: "bán vượt năng lực giao hàng là vi phạm nặng nhất"
       — mà chỉ bán được ở tầng có giá.

       Đích lấy từ HP_TANG, không viết tay danh sách tầng: viết tay thì
       thêm một tầng có giá mà quên thêm vào đây là phép kiểm im. Tầng 1
       giá 0 nên không đòi trần — và chỗ ấy ghi ở BV_LECH BL-0, không
       giấu. */
    (G.HP_TANG || []).forEach(function (t) {
      if (!(Number(t.gia) > 0)) return;
      var m = String(t.tang || '').match(/(\d)/);
      if (!m) return;
      if (!G.bvVaiGiuTang('T' + m[1]))
        loi.push('tầng ' + t.tang + ' có thu tiền mà không vai nào khai trần — ' +
          'bvNhanDuoc() sẽ cho qua mọi hồ sơ ở tầng ấy');
    });

    /* Phép thử phá đứng ngay trong khoá: dựng một người đã đủ trần rồi
       hỏi hàm. Trả "được" là trần lại thành lời khuyên. */
    var tr4 = G.bvVaiGiuTang('T4');
    if (tr4) {
      var day = [];
      for (var i = 0; i < tr4.theoTang.T4; i++) day.push({ coach: '· thử ·', tier: 'Tầng 4' });
      var r = G.bvNhanDuoc('· thử ·', 'T4', day);
      if (!r.chan) loi.push('người đã đủ trần T4 mà hàm vẫn cho nhận — trần thành lời khuyên');
      var r2 = G.bvNhanDuoc('· thử ·', 'T4', day.slice(0, 1));
      if (r2.chan) loi.push('người mới giữ 1 nhà mà hàm đã chặn — trần chặn nhầm');
    }
    var l5 = (G.BV_CONG_LUAT || []).filter(function (x) { return x.no === 5; })[0];
    if (!l5) loi.push('mất luật cổng số 5 — trần chặn cổng');
    return { chuaDo: false, loi: loi, soTran: soTran };
  };

  /* ═══════════ MỞ 4: MỘT CỔNG CHUYỂN TẦNG ═══════════ */
  G.bvCong = function (ma) {
    var ds = G.BV_CONG || [];
    if (!ds.length) return { chuaDo: true, thieu: 'BV_CONG' };
    if (!ma) return { ds: ds.slice(), luat: (G.BV_CONG_LUAT || []).slice() };
    var k = String(ma).toUpperCase();
    var c = ds.filter(function (x) { return x.ma === k || x.maGoc === k; })[0];
    if (!c) return { khongCo: true, ma: ma, coNhung: ds.map(function (x) { return x.ma; }) };
    /* Trả kèm cảnh báo nếu người gọi dùng mã gốc — vì mã gốc trùng
       với G.CHUYENDOI và trùng thì trỏ nhầm. */
    return {
      ma: c.ma, maGoc: c.maGoc, chuyen: c.chuyen,
      dieuKienMo: c.dieuKienMo, duLieuBatBuoc: c.duLieuBatBuoc,
      nguoiQuyet: c.nguoiQuyet, cauThoai: c.cauThoai,
      khiNaoKhongMo: c.khiNaoKhongMo, duongThayThe: c.duongThayThe,
      canhMaTrung: (k === c.maGoc)
        ? 'Vừa tra bằng mã gốc ' + c.maGoc + '. G.CHUYENDOI cũng có mã ấy với nghĩa KHÁC — ' +
          'dùng khoá ' + c.ma + ' cho chắc.'
        : undefined
    };
  };

  /* ═══════════ MỞ 5: TÁM BỘ LỌC, CHẠY ĐƯỢC ═══════════

     Nhận một đối tượng {1:true, 2:false, …} — người soạn tự trả lời
     tám câu. Máy KHÔNG tự chấm một khối chữ: chấm sai ở đây thì người
     soạn tin vào một con dấu rỗng, và đó nguy hơn không chấm. */
  G.bvLoc = function (traLoi) {
    var ds = G.BV_LOC || [];
    if (!ds.length) return { chuaDo: true, thieu: 'BV_LOC' };
    traLoi = traLoi || {};
    var truot = [], chuaTraLoi = [];
    ds.forEach(function (l) {
      var v = traLoi[l.no];
      if (v === undefined || v === null) { chuaTraLoi.push(l.no + '. ' + l.hoi); return; }
      if (!v) truot.push({ no: l.no, hoi: l.hoi, luat: l.luat });
    });
    if (chuaTraLoi.length) return { chuaTraLoiDu: true, chuaTraLoi: chuaTraLoi, soCau: ds.length };
    return {
      quaDuoc: truot.length === 0,
      truot: truot,
      luat: truot.length
        ? 'Tin không đạt bị GIỮ LẠI và báo người phụ trách.'
        : 'Qua đủ tám bộ lọc.',
      hauKiem: (G.BV_LOC_LUAT || {}).hauKiem || ''
    };
  };

  /* ═══════════ MỞ 6: BẢN ĐỒ NÂNG CẤP ═══════════ */
  G.bvModuleThieu = function () {
    var mod = G.BV_MODULE || [], noi = G.BV_MODULE_NOI || [];
    if (!mod.length) return { chuaDo: true, thieu: 'BV_MODULE' };
    var tra = {};
    noi.forEach(function (n) { tra[n.ma] = n; });
    var ds = mod.map(function (m) {
      var n = tra[m.ma] || {};
      var man = (n.man || []).filter(function (v) { return G.VIEWS && G.VIEWS[v]; });
      return {
        ma: m.ma, ten: m.ten, chucNang: m.chucNang,
        man: (n.man || []).slice(),
        manCoThat: man,
        du: !!n.du,
        thieu: n.thieu
      };
    });
    return {
      ds: ds,
      soDu: ds.filter(function (x) { return x.du; }).length,
      soThieu: ds.filter(function (x) { return x.thieu; }).length,
      manhChung: (G.BV_MODULE_LUAT || {}).manhChung || '',
      lamGiTruoc: (G.BV_MODULE_LUAT || {}).lamGiTruoc || ''
    };
  };

  /* ═══════════ KHOÁ 1: ĐÚNG NĂM MƯƠI Ô ═══════════ */
  G.bvSoi50 = function () {
    var ds = G.BV_CAPDO || [], loi = [];
    if (!ds.length) return { chuaDo: true, thieu: 'BV_CAPDO', loi: [] };
    if (ds.length !== 50) loi.push('có ' + ds.length + ' ô, phải năm mươi');
    var thay = {};
    ['T1', 'T2', 'T3', 'T4', 'T5'].forEach(function (t) {
      var cap = ds.filter(function (x) { return x.tang === t; })
                  .map(function (x) { return x.cap; }).sort(function (a, b) { return a - b; });
      var can = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      if (cap.join() !== can.join()) loi.push(t + ' cấp lệch: [' + cap.join(' ') + ']');
    });
    ds.forEach(function (o) {
      var n = o.ma || (o.tang + '-' + o.cap);
      if (thay[o.ma]) loi.push(n + ' trùng mã');
      thay[o.ma] = 1;
      if (!o.moc) loi.push(n + ' thiếu mốc trạng thái');
      /* Hai trường này là cả cái luật của ma trận. */
      if (!o.bangChung) loi.push(n + ' thiếu BẰNG CHỨNG — ô không có bằng chứng là ô ghi theo lịch');
      if (!o.neuTut) loi.push(n + ' thiếu ĐƯỜNG TỤT — ô chỉ có đường lên dạy hệ rằng khách không hụt');
    });
    return { chuaDo: false, loi: loi, so: ds.length };
  };

  /* ═══════════ KHOÁ 2: BA LUẬT CỦA CỖ MÁY ═══════════ */
  G.bvSoiNhip = function () {
    var ds = G.BV_NHIP || [], l = G.BV_NHIP_LUAT || {}, loi = [];
    if (!ds.length) return { chuaDo: true, thieu: 'BV_NHIP', loi: [] };
    if (ds.length !== 10) loi.push('có ' + ds.length + ' nhịp, phải mười');

    var theoSo = {};
    ds.forEach(function (n) {
      theoSo[n.so] = n;
      if (!n.ten) loi.push('nhịp ' + n.so + ' thiếu tên');
      if (!n.dauRa) loi.push('nhịp ' + n.so + ' thiếu đầu ra bắt buộc');
      if (!n.cauChuan) loi.push('nhịp ' + n.so + ' thiếu câu chuẩn');
      if (!n.cauCam) loi.push('nhịp ' + n.so + ' thiếu câu bị cấm');
    });

    /* Luật 1: đo trước khen. Thứ tự trong mảng phải giữ 07 < 08. */
    var i7 = ds.findIndex(function (n) { return n.so === 7; });
    var i8 = ds.findIndex(function (n) { return n.so === 8; });
    if (!(i7 >= 0 && i8 >= 0 && i7 < i8)) loi.push('nhịp 07 không còn đứng trước nhịp 08');

    /* Luật 3: nhịp 03 và 09 luôn có người thật. */
    ((l.nguoiThat || {}).nhip || [3, 9]).forEach(function (s) {
      var n = theoSo[s];
      if (n && !n.nguoiLam) loi.push('nhịp ' + s + ' phải có người thật mà cột người làm đang trống');
    });

    /* Luật 2: vòng khép. Khai ở luật, kiểm ở đây cho khỏi thành lời suông. */
    var v = l.vongKhep || {};
    if (!(Number(v.tu) === 10 && Number(v.ve) === 1)) loi.push('luật vòng khép không còn 10 nối về 01');
    return { chuaDo: false, loi: loi, so: ds.length };
  };

  /* ═══════════ KHOÁ 3: HAI MƯƠI TÍN HIỆU ĐỎ ═══════════ */
  G.bvSoiDo = function () {
    var ds = G.BV_DO || [], loi = [];
    if (!ds.length) return { chuaDo: true, thieu: 'BV_DO', loi: [] };
    if (ds.length !== 20) loi.push('có ' + ds.length + ' tín hiệu, phải hai mươi');
    var muc = {};
    ds.forEach(function (t) {
      var n = 'tín hiệu ' + t.so;
      if (!t.tinHieu) loi.push(n + ' thiếu dấu hiệu nhận biết');
      if (!t.hanhDong) loi.push(n + ' thiếu hành động chuẩn');
      if (!t.nguoiNhan) loi.push(n + ' thiếu TÊN NGƯỜI NHẬN');
      var g = gio(t.hanGio);
      if (g === null) { loi.push(n + ' hạn giờ không dịch được: ' + t.hanGio); return; }
      muc[t.muc] = (muc[t.muc] || 0) + 1;
      /* Đỏ 1 là nhóm an toàn con người. Nới nó là nới đúng chỗ không
         được nới. */
      if (t.muc === 'Đỏ 1' && g > 2)
        loi.push(n + ' thuộc Đỏ 1 mà hạn ' + g + ' giờ, phải trong 2 giờ');
    });
    if (Object.keys(muc).length !== 5)
      loi.push('có ' + Object.keys(muc).length + ' mức đỏ, bản vẽ chia năm');
    return { chuaDo: false, loi: loi, so: ds.length, muc: muc };
  };

  /* ═══════════ KHOÁ 4: MÃ CỔNG KHÔNG ĐƯỢC TRÙNG ═══════════ */
  G.bvSoiMaCong = function () {
    var ds = G.BV_CONG || [], loi = [];
    if (!ds.length) return { chuaDo: true, thieu: 'BV_CONG', loi: [] };
    ds.forEach(function (c) {
      if (/^C\d$/.test(String(c.ma)))
        loi.push(c.ma + ' đang mang mã trùng G.CHUYENDOI — phải là BVC*');
      if (!c.maGoc) loi.push(c.ma + ' mất mã gốc, không đối chiếu được với tờ giấy');
      if (!c.dieuKienMo) loi.push(c.ma + ' thiếu điều kiện mở');
      if (!c.khiNaoKhongMo) loi.push(c.ma + ' thiếu cột KHI NÀO KHÔNG MỞ');
      if (!c.duongThayThe) loi.push(c.ma + ' thiếu đường thay thế — cổng không đường ra là cổng ép');
    });
    /* Nếu máy này có cả hai kho thì kiểm chỗ trùng thật. */
    if (G.CHUYENDOI && (G.CHUYENDOI.cong || []).length) {
      var cu = (G.CHUYENDOI.cong || []).map(function (x) { return x.ma; });
      var trung = ds.filter(function (c) { return cu.indexOf(c.ma) >= 0; });
      if (trung.length) loi.push('mã trùng thật với CHUYENDOI: ' +
        trung.map(function (c) { return c.ma; }).join(' '));
    }
    return { chuaDo: false, loi: loi, so: ds.length, doCaHai: !!G.CHUYENDOI };
  };

  /* ═══════════ KHOÁ 5: BẢN ĐỒ NÂNG CẤP KHÔNG NÓI DỐI ═══════════ */
  G.bvSoiModule = function () {
    var noi = G.BV_MODULE_NOI || [], mod = G.BV_MODULE || [], loi = [];
    if (!noi.length) return { chuaDo: true, thieu: 'BV_MODULE_NOI', loi: [] };
    var maMod = mod.map(function (m) { return m.ma; });
    noi.forEach(function (n) {
      if (maMod.length && maMod.indexOf(n.ma) < 0) loi.push(n.ma + ' không có trong BV_MODULE');
      if (!n.du && !n.thieu) loi.push(n.ma + ' chưa khai đủ hay thiếu');
      if (n.du && n.thieu) loi.push(n.ma + ' khai cả đủ lẫn thiếu');
      (n.man || []).forEach(function (v) {
        if (G.VIEWS && !G.VIEWS[v]) loi.push(n.ma + ' trỏ vào màn không có thật: ' + v);
      });
    });
    if (mod.length && noi.length !== mod.length)
      loi.push('nối ' + noi.length + ' module trên tổng ' + mod.length);
    return { chuaDo: false, loi: loi };
  };

  /* Đối chiếu hai mươi tín hiệu với mười sáu luật AICHAM. Không gộp —
     chỉ nói ra chỗ bản vẽ có mà luật nền chưa có. */
  G.bvSoiDoKhopAicham = function () {
    if (!(G.AICHAM && (G.AICHAM.luat || []).length))
      return { chuaDo: true, thieu: 'AICHAM' };
    var chu = (G.AICHAM.luat || []).map(function (l) {
      return String(l.ten + ' ' + l.khi).toLowerCase();
    }).join(' | ');
    var chua = (G.BV_DO || []).filter(function (t) {
      var tu = String(t.tinHieu).toLowerCase().split(/\s+/)
        .filter(function (w) { return w.length >= 5; }).slice(0, 3);
      return !tu.some(function (w) { return chu.indexOf(w) >= 0; });
    });
    return {
      soLuatNen: (G.AICHAM.luat || []).length,
      soTinHieu: (G.BV_DO || []).length,
      chuaCoONen: chua.map(function (t) { return t.muc + ' #' + t.so + ' ' + t.tinHieu; }),
      khongGop: 'Không gộp hai bảng. AICHAM là luật máy chạy nền theo dữ liệu; ' +
        'BV_DO là bảng phân loại sự cố có mức và có đồng hồ.'
    };
  };

  G.bvChoChu = function () { return (G.BV_CHOCHU || []).slice(); };

  /* ═══════════════════════════════════════════════════════════
     MÀN HÌNH
     ═══════════════════════════════════════════════════════════ */
  G.VIEWS['ban-ve'] = function () {
    if (!G.BV_CAPDO)
      return U.empty('Chưa mở được phần này',
        'Phần này nằm trong gói nghề. Đăng nhập bằng tài khoản có quyền nghề để nạp.');

    var loi = G.BV_LOI || {};
    var o = U.ph({ eyebrow: 'BỘ BẢN VẼ · 13 TỜ A0', ic: 'map', grad: 1,
      t: 'Năm mươi ô, mỗi ô một tag, mỗi tag một bằng chứng',
      lead: 'Đây là đặc tả hệ thống, không phải nội dung. Nó không dạy nói gì với một nhà — ' +
        'nó khai hệ có bao nhiêu ô và ô nào ghi nhận bằng gì.' });

    o += '<div class="card mb" style="border-color:#0B667556">' +
      '<p style="line-height:1.9;font-size:1.05em"><b>' + h(loi.cauQuanTrongNhat || '') + '</b></p>' +
      '<p class="sm mt" style="line-height:1.8">' + h(loi.khoDangThieu || '') + '</p>' +
      '<p class="tiny dim mt" style="line-height:1.7">' + h(loi.khacTaiLieuTruoc || '') + '</p>' +
      '<p class="tiny mt" style="line-height:1.7;color:#0B6675">' + h(loi.boDem || '') + '</p></div>';

    var s50 = G.bvSoi50(), snh = G.bvSoiNhip(), sdo = G.bvSoiDo(),
        smc = G.bvSoiMaCong(), smd = G.bvSoiModule(), str = G.bvSoiTran();
    var lech = [].concat(s50.loi || [], snh.loi || [], sdo.loi || [], smc.loi || [],
      smd.loi || [], str.loi || []);
    if (lech.length)
      o += '<div class="card mb" style="border-color:#BE0E16"><b class="sm" style="color:#BE0E16">' +
        'LỆCH: ' + h(lech.join(' · ')) + '</b></div>';

    o += G.kaKhung ? G.kaKhung('ban-ve', 'dau') : '';

    /* ── Bốn nguyên tắc ── */
    o += U.sec('Bốn nguyên tắc đọc', 'Đọc sai nguyên tắc thì mọi tờ sau đều bị dùng sai.');
    o += '<div class="card mb">' + (G.BV_NGUYENTAC || []).map(function (n) {
      return '<div style="padding:8px 0;border-bottom:1px solid var(--gita-vien-2)">' +
        '<b class="sm">' + n.no + ' · ' + h(n.ten) + '</b>' +
        (n.khongPhai ? ' <span class="tiny" style="color:#BE0E16">' + h(n.khongPhai) + '</span>' : '') +
        '<p class="tiny mt" style="line-height:1.7">' + h(n.luat) + '</p>' +
        (n.coCong ? '<p class="tiny mt" style="line-height:1.7;color:#0B6675">Có cổng chạy: ' +
          h(n.coCong) + '</p>' : '') + '</div>';
    }).join('') + '</div>';

    /* ── Ma trận 50 ô ── */
    var cl = G.BV_CAPDO_LUAT || {};
    o += U.sec('Ma trận năm mươi ô', cl.cot || '');
    o += '<p class="tiny dim mb" style="line-height:1.7">' + h(cl.vi || '') + '<br>' +
      h(cl.baKhuc || '') + '</p>';
    ['T1', 'T2', 'T3', 'T4', 'T5'].forEach(function (t) {
      var ch = (G.BV_TANG || []).filter(function (x) { return x.tang === t; })[0] || {};
      var ds = (G.BV_CAPDO || []).filter(function (x) { return x.tang === t; });
      if (!ds.length) return;
      o += '<div class="card mb"><span class="tiny up dim">' + t +
        (ch.thoiLuong ? ' · ' + h(ch.thoiLuong) : '') +
        (ch.vaiDan ? ' · ' + h(ch.vaiDan) : '') + '</span>' +
        (ch.tranCongSuat ? '<p class="tiny mt" style="line-height:1.7;color:#B4720F">Trần: ' +
          h(ch.tranCongSuat) + '</p>' : '') +
        ds.map(function (x) {
          var ban = x.cap < 4;
          return '<div style="padding:8px 0;border-bottom:1px solid var(--gita-vien-2)">' +
            '<b class="sm">' + h(x.ma) + ' · ' + h(x.moc) + '</b> ' +
            '<span class="tiny dim">' + (x.cap <= 3 ? 'vào cuộc' : (x.cap <= 7 ? 'tạo kết quả' : 'trụ cột')) +
            '</span>' + (ban ? '' : ' <span class="tiny" style="color:#BE0E16">im bán</span>') +
            '<p class="tiny mt" style="line-height:1.7"><b>Bằng chứng:</b> ' + h(x.bangChung) + '</p>' +
            (x.ai ? '<p class="tiny mt" style="line-height:1.7;color:#0B6675">Máy: ' + h(x.ai) + '</p>' : '') +
            (x.nguoi ? '<p class="tiny mt" style="line-height:1.7;color:#B4720F">Người: ' + h(x.nguoi) + '</p>' : '') +
            (x.wow ? '<p class="tiny mt" style="line-height:1.8">&ldquo;' + h(x.wow) + '&rdquo;</p>' : '') +
            '<p class="tiny mt" style="line-height:1.7;color:#BE0E16">Nếu tụt: ' + h(x.neuTut) + '</p>' +
            '</div>';
        }).join('') + '</div>';
    });

    /* Cổng ghi nhận chạy thật, hai chiều. */
    var caO = G.bvGhiNhanDuoc('T3', 6, '');
    var caC = G.bvGhiNhanDuoc('T3', 6, 'Ảnh bảng tầm nhìn và biên bản cuộc gọi mốc ngày 43');
    if (caO && caO.ma)
      o += '<div class="card mb" style="border-color:#0B667544">' +
        '<span class="tiny up dim">CỔNG GHI NHẬN CHẠY THẬT · Ô ' + h(caO.ma) + '</span>' +
        '<p class="sm mt" style="line-height:1.8"><b>Không đưa bằng chứng →</b> ' +
        '<b style="color:#BE0E16">từ chối ghi nhận</b>. Ô này đòi: ' + h(caO.doiGi) + '</p>' +
        '<p class="sm mt" style="line-height:1.8"><b>Có bằng chứng →</b> ' +
        '<b style="color:#0B6675">ghi được</b> — nhưng ' + h(caC.nhac || '') + '</p>' +
        '<p class="tiny dim mt" style="line-height:1.7">' + h(caO.vi || '') + '</p></div>';

    o += G.kaKhung ? G.kaKhung('ban-ve', 'giua') : '';

    /* ── Bốn cổng ── */
    o += U.sec('Bốn cổng chuyển tầng', 'Cổng là kết luận chẩn đoán, không phải bước bán.');
    o += (G.BV_CONG || []).map(function (c) {
      return '<div class="card mb" style="border-color:#5140B444">' +
        '<span class="tiny up" style="color:#5140B4">' + h(c.ma) +
        ' <span class="dim">(tờ giấy ghi ' + h(c.maGoc) + ')</span> · ' + h(c.chuyen) + '</span>' +
        '<p class="sm mt" style="line-height:1.8"><b>Mở khi:</b> ' + h(c.dieuKienMo) + '</p>' +
        '<p class="tiny mt" style="line-height:1.7">Dữ liệu bắt buộc: ' + h(c.duLieuBatBuoc) + '</p>' +
        '<p class="tiny mt" style="line-height:1.7">Người quyết: ' + h(c.nguoiQuyet) + '</p>' +
        '<div class="mt" style="padding:9px 12px;border-left:3px solid #5140B4;background:var(--gita-nen-2)">' +
        '<p class="sm" style="line-height:1.8">&ldquo;' + h(c.cauThoai) + '&rdquo;</p></div>' +
        '<p class="tiny mt" style="line-height:1.7;color:#BE0E16">KHÔNG mở khi: ' + h(c.khiNaoKhongMo) + '</p>' +
        '<p class="tiny mt" style="line-height:1.7;color:#0B6675">Đường thay thế: ' + h(c.duongThayThe) + '</p>' +
        '</div>';
    }).join('');
    o += '<div class="card mb"><span class="tiny up dim">TÁM LUẬT CỨNG CỦA CỔNG</span>' +
      (G.BV_CONG_LUAT || []).map(function (l) {
        return '<div style="padding:7px 0;border-bottom:1px solid var(--gita-vien-2)">' +
          '<b class="sm">' + l.no + ' · ' + h(l.luat) + '</b>' +
          (l.chiTiet ? '<p class="tiny mt" style="line-height:1.7">' + h(l.chiTiet) + '</p>' : '') +
          (l.vi ? '<p class="tiny dim mt" style="line-height:1.7">' + h(l.vi) + '</p>' : '') +
          (l.khopVoiKho ? '<p class="tiny mt" style="line-height:1.7;color:#0B6675">' +
            h(l.khopVoiKho) + '</p>' : '') +
          (l.coCong ? '<p class="tiny mt" style="line-height:1.7;color:#0B6675">Có cổng chạy: ' +
            h(l.coCong) + '</p>' : '') + '</div>';
      }).join('') + '</div>';

    /* ── Đường tụt ── */
    o += U.sec('Bốn mức hụt — bắt buộc có ở cả năm mươi ô', '');
    o += '<div class="card mb">' + (G.BV_TUTCAP || []).map(function (t) {
      return '<div style="padding:8px 0;border-bottom:1px solid var(--gita-vien-2)">' +
        '<b class="sm">' + h(t.muc) + '</b> <span class="tiny dim">' + h(t.dauHieu) + '</span>' +
        '<p class="tiny mt" style="line-height:1.7">' + h(t.hanhDong) + '</p>' +
        '<p class="tiny mt" style="line-height:1.7;color:#BE0E16">Tuyệt đối không: ' +
        h(t.tuyetDoiKhong) + '</p></div>';
    }).join('') + '</div>';

    /* ── Mười nhịp ── */
    var nl = G.BV_NHIP_LUAT || {};
    o += U.sec('Cỗ máy mười nhịp', 'Vòng lặp chạy bên trong cả năm mươi ô.');
    o += '<div class="card mb">' + (G.BV_NHIP || []).map(function (n) {
      return '<div style="padding:9px 0;border-bottom:1px solid var(--gita-vien-2)">' +
        '<b class="sm">' + (n.so < 10 ? '0' : '') + n.so + ' · ' + h(n.ten) + '</b> ' +
        '<span class="tiny dim">' + h(n.mucDich) + '</span>' +
        (n.mayLam ? '<p class="tiny mt" style="line-height:1.7;color:#0B6675">Máy: ' + h(n.mayLam) + '</p>' : '') +
        (n.nguoiLam ? '<p class="tiny mt" style="line-height:1.7;color:#B4720F">Người: ' + h(n.nguoiLam) + '</p>' : '') +
        '<p class="tiny mt" style="line-height:1.7">Đầu ra: ' + h(n.dauRa) + '</p>' +
        '<p class="tiny mt" style="line-height:1.8;color:#0B6675">&ldquo;' + h(n.cauChuan) + '&rdquo;</p>' +
        '<p class="tiny mt" style="line-height:1.8;color:#BE0E16">Cấm: &ldquo;' + h(n.cauCam) + '&rdquo;</p>' +
        '</div>';
    }).join('') + '</div>';
    o += '<div class="card mb"><span class="tiny up dim">BA LUẬT CỦA CỖ MÁY</span>' +
      [nl.doTruocKhen, nl.vongKhep, nl.nguoiThat].filter(Boolean).map(function (l) {
        return '<p class="sm mt" style="line-height:1.8"><b>' + h(l.luat) + '</b></p>' +
          '<p class="tiny dim" style="line-height:1.7">' + h(l.vi) + '</p>' +
          (l.khopVoiKho ? '<p class="tiny" style="line-height:1.7;color:#0B6675">' +
            h(l.khopVoiKho) + '</p>' : '');
      }).join('') + '</div>';

    /* ── Hai mươi tín hiệu đỏ ── */
    o += U.sec('Hai mươi tín hiệu đỏ', 'Quá hạn giờ thì KHÔNG tính là đã xử lý.');
    o += '<div class="card mb">' + (G.BV_DO || []).map(function (t) {
      var d1 = t.muc === 'Đỏ 1';
      return '<div style="padding:8px 0;border-bottom:1px solid var(--gita-vien-2)">' +
        '<span class="tiny up" style="color:' + (d1 ? '#BE0E16' : '#B4720F') + '"><b>' +
        h(t.muc) + ' · #' + t.so + '</b></span> ' +
        '<span class="tiny" style="color:#0B6675">' + h(t.hanGio) + '</span>' +
        '<p class="sm mt" style="line-height:1.8"><b>' + h(t.tinHieu) + '</b></p>' +
        '<p class="tiny mt" style="line-height:1.7">' + h(t.hanhDong) + '</p>' +
        '<p class="tiny mt" style="line-height:1.7;color:#B4720F">→ ' + h(t.nguoiNhan) + '</p></div>';
    }).join('') + '</div>';
    var kh = G.bvSoiDoKhopAicham();
    if (kh && !kh.chuaDo)
      o += '<div class="card mb"><span class="tiny up dim">ĐỐI CHIẾU VỚI ' + kh.soLuatNen +
        ' LUẬT AICHAM</span>' +
        '<p class="tiny mt" style="line-height:1.7">' + h(kh.khongGop) + '</p>' +
        (kh.chuaCoONen.length
          ? '<p class="tiny mt" style="line-height:1.8;color:#B4720F">Bản vẽ có mà luật nền chưa có: ' +
            h(kh.chuaCoONen.join(' · ')) + '</p>'
          : '<p class="tiny mt" style="line-height:1.7;color:#0B6675">Luật nền phủ được cả hai mươi.</p>') +
        '</div>';

    /* ── Tám bộ lọc ── */
    o += U.sec('Tám bộ lọc ngôn ngữ', 'Mọi tin nhắn và mọi cuộc gọi đều phải qua.');
    o += '<div class="card mb">' + (G.BV_LOC || []).map(function (l) {
      return '<div style="padding:8px 0;border-bottom:1px solid var(--gita-vien-2)">' +
        '<b class="sm">' + l.no + ' · ' + h(l.hoi) + '</b>' +
        '<p class="tiny mt" style="line-height:1.7">' + h(l.luat) + '</p>' +
        (l.khopVoiKho ? '<p class="tiny mt" style="line-height:1.7;color:#0B6675">' +
          h(l.khopVoiKho) + '</p>' : '') +
        (l.chuY ? '<p class="tiny mt" style="line-height:1.7;color:#BE0E16"><b>' + h(l.chuY) + '</b></p>' : '') +
        '</div>';
    }).join('') + '</div>';
    o += '<p class="tiny mb" style="line-height:1.7;color:#B4720F">' +
      h((G.BV_LOC_LUAT || {}).locBayDangDo || '') + '</p>';

    /* ── Bốn hàng rào kỹ thuật ── */
    o += U.sec('Bốn hàng rào kỹ thuật bắt buộc', '');
    o += '<div class="card mb">' + (G.BV_RAO || []).map(function (r) {
      return '<div style="padding:8px 0;border-bottom:1px solid var(--gita-vien-2)">' +
        '<b class="sm">' + h(r.ten) + '</b>' +
        '<p class="tiny mt" style="line-height:1.7">' + h(r.luat) + '</p>' +
        (r.khopVoiKho ? '<p class="tiny mt" style="line-height:1.7;color:#0B6675">' +
          h(r.khopVoiKho) + '</p>' : '') + '</div>';
    }).join('') + '</div>';

    /* ── Trigger ── */
    o += U.sec('Trigger tự động, gắn vào tag cấp độ', '');
    o += '<div class="card mb">' + (G.BV_TRIGGER || []).map(function (t) {
      return '<div style="padding:8px 0;border-bottom:1px solid var(--gita-vien-2)">' +
        '<b class="sm">' + h(t.khi) + '</b> <span class="tiny" style="color:#0B6675">' +
        h(t.hanGio) + '</span>' +
        '<p class="tiny mt" style="line-height:1.7">' + h(t.lam) + '</p>' +
        '<p class="tiny mt" style="line-height:1.7;color:#BE0E16">Hàng rào: ' + h(t.hangRao) + '</p></div>';
    }).join('') + '</div>';

    /* ── Bản đồ nâng cấp ── */
    var mt = G.bvModuleThieu();
    o += U.sec('Bản đồ nâng cấp — tám module nối với màn đang có',
      mt.soDu + ' module đủ · ' + mt.soThieu + ' module còn hụt một mảnh');
    o += '<div class="card mb">' + (mt.ds || []).map(function (m) {
      return '<div style="padding:9px 0;border-bottom:1px solid var(--gita-vien-2)">' +
        '<b class="sm">' + h(m.ma) + ' · ' + h(m.ten) + '</b> ' +
        (m.du ? '<span class="tiny" style="color:#0B6675">ĐỦ</span>'
              : '<span class="tiny" style="color:#B4720F">CÒN HỤT</span>') +
        '<p class="tiny dim mt" style="line-height:1.7">' + h(m.chucNang) + '</p>' +
        '<p class="tiny mt" style="line-height:1.7;color:#0B6675">Màn đang có: ' +
        h(m.manCoThat.join(' · ')) + '</p>' +
        (m.thieu ? '<p class="tiny mt" style="line-height:1.7;color:#B4720F">Thiếu: ' +
          h(m.thieu) + '</p>' : '') + '</div>';
    }).join('') + '</div>';
    o += '<div class="card mb" style="border-color:#B4720F55">' +
      '<p class="sm" style="line-height:1.85"><b>' + h(mt.manhChung) + '</b></p>' +
      '<p class="tiny dim mt" style="line-height:1.7">' +
      h((G.BV_MODULE_LUAT || {}).vi || '') + '</p>' +
      '<p class="tiny mt" style="line-height:1.8;color:#0B6675"><b>Làm gì trước: ' +
      h(mt.lamGiTruoc) + '</b></p>' +
      '<p class="tiny mt" style="line-height:1.7;color:#B4720F">' +
      h((G.BV_MODULE_LUAT || {}).chuaLam || '') + '</p></div>';

    /* ── Mười vai và trần ── */
    o += U.sec('Mười vai nghiệp vụ và trần công suất',
      'Bảng TRÁCH NHIỆM. Bảng QUYỀN TRUY CẬP vẫn là mười lăm vai R* — xem BL-4.');
    o += '<div class="card mb">' + (G.BV_VAI || []).map(function (v) {
      return '<div style="padding:8px 0;border-bottom:1px solid var(--gita-vien-2)">' +
        '<b class="sm">' + (v.so < 10 ? '0' : '') + v.so + ' · ' + h(v.ten) + '</b>' +
        (v.tran ? ' <span class="tiny" style="color:#B4720F">trần ' + h(v.tran) + '</span>' : '') +
        '<p class="tiny mt" style="line-height:1.7">' + h(v.nhiemVu) + '</p>' +
        '<p class="tiny mt" style="line-height:1.7;color:#BE0E16">' + h(v.gioiHanTuyetDoi) + '</p></div>';
    }).join('') + '</div>';
    o += '<div class="card mb">' + (G.BV_VAI_LUAT || []).map(function (l) {
      return '<p class="sm mt" style="line-height:1.8"><b>' + h(l.luat) + '.</b> ' + h(l.chiTiet) + '</p>' +
        (l.vi ? '<p class="tiny dim" style="line-height:1.7">' + h(l.vi) + '</p>' : '');
    }).join('') + '</div>';

    /* ── Chỗ lệch ── */
    o += U.sec('Chỗ bộ bản vẽ lệch với kho', 'Máy đọc kho. Chỗ lệch ghi ra, không tự chọn hộ.');
    o += '<div class="card mb">' + (G.BV_LECH || []).map(function (l) {
      return '<div style="padding:10px 0;border-bottom:1px solid var(--gita-vien-2)">' +
        '<b class="sm">' + h(l.ma) + ' · ' + h(l.o) + '</b>' +
        (l.nguy ? ' <span class="tiny" style="color:#BE0E16">CHỖ NGUY</span>' : '') +
        '<p class="tiny mt" style="line-height:1.7"><b>Bản vẽ:</b> ' + h(l.banVe) + '</p>' +
        (l.kho ? '<p class="tiny mt" style="line-height:1.7"><b>Kho:</b> ' + h(l.kho) + '</p>' : '') +
        (l.taiLieuKhac ? '<p class="tiny mt" style="line-height:1.7"><b>Tài liệu khác:</b> ' +
          h(l.taiLieuKhac) + '</p>' : '') +
        (l.vanDe ? '<p class="tiny mt" style="line-height:1.7;color:#BE0E16">' + h(l.vanDe) + '</p>' : '') +
        (l.namNguon ? '<ul class="tiny mt" style="line-height:1.8;padding-left:18px">' +
          l.namNguon.map(function (x) { return '<li>' + h(x) + '</li>'; }).join('') + '</ul>' : '') +
        (l.tuXungLaNguon ? '<p class="tiny mt" style="line-height:1.7;color:#B4720F">' +
          h(l.tuXungLaNguon) + '</p>' : '') +
        (l.lanThuBa ? '<p class="tiny mt" style="line-height:1.7;color:#B4720F">' + h(l.lanThuBa) + '</p>' : '') +
        (l.caiMoi ? '<p class="tiny mt" style="line-height:1.7;color:#0B6675">' + h(l.caiMoi) + '</p>' : '') +
        '<p class="tiny dim mt" style="line-height:1.7">' + h(l.mayLam) + '</p>' +
        (l.noHoSo ? '<p class="tiny mt" style="line-height:1.7;color:#0B6675">Hồ sơ đã mở ở: ' +
          h(l.noHoSo) + '</p>' : '') +
        (l.canGi ? '<p class="tiny mt" style="line-height:1.7;color:#BE0E16"><b>Cần: ' +
          h(l.canGi) + '</b></p>' : '') +
        (l.daRo ? '<p class="tiny mt" style="line-height:1.7;color:#0B6675">Chỗ này không cần chủ hệ quyết.</p>' : '') +
        '</div>';
    }).join('') + '</div>';

    /* ── Chờ chủ hệ ── */
    o += U.sec('Ba câu chờ chủ hệ', 'Mã không tự trả lời được ba câu này.');
    o += '<div class="card mb">' + G.bvChoChu().map(function (c) {
      return '<div style="padding:9px 0;border-bottom:1px solid var(--gita-vien-2)">' +
        '<b class="sm">' + h(c.hoi) + '</b>' +
        '<p class="tiny dim mt" style="line-height:1.7">' + h(c.boi) + '</p>' +
        (c.toiNghieng ? '<p class="tiny mt" style="line-height:1.7;color:#0B6675">' +
          h(c.toiNghieng) + '</p>' : '') +
        (c.toiKhongTuDat ? '<p class="tiny mt" style="line-height:1.7;color:#0B6675">' +
          h(c.toiKhongTuDat) + '</p>' : '') +
        (c.mayDangLam ? '<p class="tiny mt" style="line-height:1.7;color:#B4720F">' +
          h(c.mayDangLam) + '</p>' : '') + '</div>';
    }).join('') + '</div>';

    o += G.kaKhung ? G.kaKhung('ban-ve', 'cuoi') : '';
    return o;
  };
})();
