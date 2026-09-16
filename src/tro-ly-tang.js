/* ═══════════════════════════════════════════════════════════════
   GITA 365 — TRỢ LÝ: LỌC THEO TẦNG, VÀ DẪN TỪNG VIỆC

   Kho chuẩn ở kho-goc/data.tro-ly-tang.js.

   VÌ SAO CÓ TỆP NÀY

   Tới bản 9.47 hai màn in ra câu "trả lời trong đúng phạm vi tầng của
   nhà mình", mà G.aiTra tra thẳng toàn kho máy này đang giữ. Lời hứa
   có, việc chạy thì không. Một câu hứa không có việc dưới thì tệ hơn
   không hứa — nó làm người đọc yên tâm về đúng chỗ đang hở.

   HAI CÁI TRẦN KHÁC NHAU, ĐỪNG LẪN

     · Trần 30% (G.khachMoDuoc) hỏi: bản ghi này có nằm trong 30% đầu
       bảng không. Vượt trần thì HIỆN TÊN và nói "đi qua Tư vấn" — vì
       đó là tư liệu CÙNG TẦNG mà nhà chưa tới lượt.
     · Trần TẦNG (tệp này) hỏi: bản ghi này thuộc tầng nào. Vượt tầng
       thì KHÔNG HIỆN GÌ CẢ — vì nó đọc mà không dùng được, nền chưa
       có, và hiện tên chỉ tạo một cơn thèm không giúp gì cho tối nay.

   Hai câu hỏi khác nhau, hai cách trả lời khác nhau. Gộp chúng lại là
   cách bỏ sót một trong hai.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;

(function () {

  function laKhach() { return !!(G.LA_KHACH && G.LA_KHACH()); }

  function soTang(t) {
    if (t == null || t === '') return null;
    var m = /^T?([1-5])$/.exec(String(t).trim());
    return m ? Number(m[1]) : null;
  }

  /* ═══════════ TẦNG CỦA NGƯỜI ĐANG HỎI ═══════════
     Người trong nghề trả về null, và null ở đây nghĩa là KHÔNG LỌC —
     không phải "tầng 0". Hai thứ ấy khác nhau: tầng 0 thì chặn hết. */
  G.aiTangNha = function () {
    if (!laKhach()) return null;
    /* TẦNG ĐỌC TỪ TÀI KHOẢN, KHÔNG TỪ HỒ SƠ NHÀ.
       Hai chỗ cùng mang một con số tầng và chúng lệch nhau thật: tài
       khoản phuhuynh@ khai tang 3, còn bản ghi nhà nó đại diện khai
       tier 5. Phải chọn đúng một nguồn, và nguồn đúng là TÀI KHOẢN —
       vì chính nó là thứ G.goiDuocCap() dùng để xin gói tầng. Lấy tầng
       ở chỗ khác thì trợ lý và kho nói hai con số khác nhau, và trợ lý
       sẽ hứa thứ kho không gửi về. */
    var t = soTang(G.S && G.S.acc && G.S.acc.tang);
    if (t) return t;
    var f = G.myFamily ? G.myFamily() : null;
    t = soTang(f && f.tier);
    /* Chưa đọc được tầng thì lấy tầng một — CHẶT NHẤT, không phải rộng
       nhất. Đoán rộng khi thiếu dữ liệu là cách một cái trần biến mất
       trong im lặng. */
    return t || 1;
  };

  /* Tầng của một bản ghi. Đọc theo đúng trường và đúng dạng kho khai —
     không đoán từ mã, không đoán từ tên nhóm. Kho khai nhiều tầng thì
     lấy tầng THẤP NHẤT: một mô thức dùng được từ tầng một thì nhà tầng
     một được đọc, dù nó còn dùng tiếp ở tầng bốn. */
  G.aiTangCuaBanGhi = function (tenKho, x) {
    var d = (G.TL_TANG_TRUONG || []).filter(function (k) { return k.kho === tenKho; })[0];
    if (!d || !x) return null;
    var v = x[d.truong];
    if (v == null) return null;
    if (d.dang === 'mang') {
      var ds = (Array.isArray(v) ? v : [v]).map(soTang).filter(Boolean);
      return ds.length ? Math.min.apply(null, ds) : null;
    }
    return soTang(v);
  };

  /* Kho này có lọc theo tầng được không. Kho chưa khai tầng thì KHÔNG —
     và chỗ gọi phải biết điều đó để nói ra, chứ không lặng lẽ cho qua. */
  G.aiLocTangDuoc = function (tenKho) {
    return (G.TL_TANG_TRUONG || []).some(function (k) { return k.kho === tenKho; });
  };

  /* Bản ghi này có trong phạm vi tầng của người đang hỏi không.
     Trả về một OBJECT chứ không phải true/false: chỗ gọi cần phân biệt
     "trong tầng", "vượt tầng" và "kho chưa khai tầng nên không hỏi
     được" — ba thứ ấy dẫn tới ba câu khác nhau trên màn. */
  G.aiTrongTang = function (tenKho, x, tangNha) {
    if (tangNha == null) return { ok: true, khongLoc: true };      // người trong nghề
    if (!G.aiLocTangDuoc(tenKho)) return { ok: true, chuaKhaiTang: true, kho: tenKho };
    var t = G.aiTangCuaBanGhi(tenKho, x);
    if (t == null) return { ok: true, chuaKhaiTang: true, kho: tenKho };
    if (t <= tangNha) return { ok: true, tang: t };
    return { ok: false, vuotTang: true, tang: t };
  };

  /* ═══════════ DẪN MỘT VIỆC TRONG KHO THỰC HÀNH ═══════════
     Ghép bốn nhịp từ đúng những trường có sẵn trong BD_LON. Không một
     câu chuyên môn nào sinh ra ở đây. */
  G.aiTimViec = function (cauHoi) {
    var chu = String(cauHoi || '').toLowerCase();
    var khong = G.U && G.U.boDau ? G.U.boDau : function (s) { return String(s).toLowerCase(); };
    var q = khong(chu);
    var ra = null, diem = 0;

    (G.BD_LON || []).forEach(function (b) {
      (b.nho || []).forEach(function (v) {
        var d = 0;
        /* Ba đường nhận ra, xếp theo độ chắc chắn — bảng ở TL_VIEC_DAU. */
        if (v.ma && q.indexOf(khong(v.ma)) >= 0) d = 100;                    // gõ thẳng mã
        else if (v.ten && q.indexOf(khong(v.ten)) >= 0) d = 60;              // trúng nguyên tên
        else {
          /* ĐƯỜNG YẾU NHẤT, VÀ NÓ ĐÃ DẪN NHẦM THẬT.
             Bản đầu lấy mọi chữ từ 3 ký tự và đòi trúng hai chữ. Câu hỏi
             "Con ôm điện thoại, mình BẮT ĐẦU từ đâu?" trúng "bắt" và "đầu"
             của việc BD1-06 "Chụp lại bàn học lúc bắt đầu" — trợ lý dẫn
             một nhà đang hỏi về điện thoại đi chụp ảnh bàn học.

             Chữ ba ký tự trong tiếng Việt gần như luôn là chữ chung: bắt,
             đầu, lúc, bàn, học, một, nay. Trúng hai chữ chung không nói
             lên gì cả.

             Nên: chỉ tính chữ từ BỐN ký tự, và phải trúng ít nhất hai.
             Việc nào tên toàn chữ ngắn thì đường này không nhận ra được —
             đúng thế còn hơn nhận nhầm, vì dẫn nhầm thì người ta LÀM THEO,
             còn không dẫn thì họ hỏi lại. */
          var tu = khong(v.ten || '').split(' ').filter(function (t) { return t.length >= 4; });
          var n = tu.filter(function (t) { return q.indexOf(t) >= 0; }).length;
          if (n >= 2) d = 10 + n;
        }
        if (d > diem) { diem = d; ra = { bd: b, viec: v }; }
      });
    });
    return diem ? ra : null;
  };

  G.aiDanViec = function (maHoacCau) {
    var t = G.aiTimViec(maHoacCau);
    if (!t) return null;
    var b = t.bd, v = t.viec;

    /* Không vượt tầng — cùng một luật với mọi tư liệu khác. Kho việc là
       kho dễ thấy nhất nên cũng là chỗ dễ quên nhất. */
    var tangNha = G.aiTangNha();
    var tv = soTang(b.tang);
    if (tangNha != null && tv != null && tv > tangNha)
      return { vuotTang: true, ma: v.ma, tang: b.tang, tangNha: tangNha,
        y: 'Việc này thuộc bánh đà tầng ' + tv + ', mà nhà mình đang ở tầng ' + tangNha +
           '. Làm xong tầng đang đi thì nó mở ra.' };

    /* Bốn nhịp, mỗi nhịp trỏ vào một trường. Thiếu trường thì KHAI
       THIẾU chứ không bịa cho tròn — một câu bịa nằm giữa ba câu thật
       thì cả bốn câu mất giá trị. */
    var nguon = { LAMGI: v.viec, THAY: v.thay, DAUGAY: b.dau,
      VISAO: [b.vong, b.y].filter(Boolean).join(' ') };
    var nhip = (G.TL_VIEC_NHIP || []).map(function (n) {
      var loi = nguon[n.ma];
      return loi ? { no: n.no, ma: n.ma, ten: n.ten, loi: loi, docTu: n.docTu }
                 : { no: n.no, ma: n.ma, ten: n.ten, thieu: true, docTu: n.docTu };
    });
    return { ma: v.ma, ten: v.ten, banhDa: b.ten, bdMa: b.ma, tang: b.tang,
      nhip: nhip, soThieu: nhip.filter(function (x) { return x.thieu; }).length,
      chiGhep: (G.TL_VIEC_LUAT || {}).chiGhepKhongViet === true };
  };

})();
