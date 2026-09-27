/* ═══════════════════════════════════════════════════════════════
   GITA 365 — BỘ VẼ TRONG MÁY

   ══ VÌ SAO VẼ Ở ĐÂY CHỨ KHÔNG GỌI RA NGOÀI ══

   TG-01 trong hiến pháp thị giác ghi: "Đưa được nội dung thiết kế ra
   ngoài là đưa được nội dung ra ngoài — cùng cái cửa." Cửa ấy có thật
   (guiDeBaiRaNgoai) và đang ĐÓNG, và nó cố tình chỉ gửi ĐỀ BÀI, không
   gửi nội dung.

   Nhưng chủ hệ cần ẢNH, không cần đề bài. Bộ vẽ này là đường thứ ba:
   vẽ bằng chính máy, ngay trong trình duyệt đã đăng nhập. Chữ đi từ
   kho đã mở ra thẳng thẻ <svg> trên màn — không một lượt hỏi mạng nào,
   nên không có cửa nào để rò.

   Đổi lại: nó chỉ vẽ được thứ nó biết dựng. Đó là chỗ mạnh chứ không
   phải chỗ yếu — một bộ vẽ dựng hình theo LUẬT thì mọi tấm cùng một
   hệ, còn một bộ vẽ đoán thì mỗi tấm một kiểu.

   ══ BA LUẬT CỦA BỘ VẼ NÀY ══

   1. KHÔNG VẼ TỰ DO. Chỉ vẽ từ một bản ghi đã qua cổng Tầng. Không có
      hàm nào nhận chữ trần rồi vẽ — vẽ được chữ trần thì cổng Tầng
      thành đồ trang trí.
   2. KHÔNG BỊA. Loại hình nào chưa có bộ vẽ thì NÓI CHƯA CÓ, không vẽ
      đại một khung chung rồi nhét chữ vào. Luật C10 cấm tự suy diễn,
      và một tấm vẽ đại chính là một suy diễn có màu.
   3. MÀU LẤY TỪ BẢNG ĐÃ CHỐT. Đọc biến CSS đang chạy, nên tấm hình
      đổi theo nền sáng/tối y như giao diện. Không mã màu nào gõ tay ở
      tệp này — gõ tay là một bảng màu thứ hai mọc lên lặng lẽ.

   ══ CHỖ NÀY CHƯA LÀM, VÀ CỐ Ý CHƯA LÀM ══

   TG-02: ấn phẩm IN RA GIẤY cần bảng màu riêng, chủ hệ chốt. Bộ vẽ
   này vẽ cho MÀN HÌNH — đúng chỗ mấy tấm tầm nhìn sẽ nằm.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;

(function () {
  var U = G.U, h = U.h;

  /* ── KHỔ GIẤY ──
     1200×630 là khổ chia sẻ của chính kho này (assets/icons/chia-se-
     1200x630.png). Dùng lại chứ không đặt khổ mới: một tấm vẽ ra vừa
     khít chỗ nó sẽ nằm thì không ai phải cắt lại. */
  var KHO_GIAY = {
    rong:  {w: 1200, h: 630,  ten: 'Khổ chia sẻ 1200×630'},
    vuong: {w: 1080, h: 1080, ten: 'Khổ vuông 1080×1080'},
    doc:   {w: 1080, h: 1350, ten: 'Khổ dọc 1080×1350'},
    /* ── KHỔ ĐỨNG TRÀN MÀN (9.99.30) ──
       Bảng này có ba khổ và không khổ nào là 9:16. Khổ dọc 1080×1350
       là 4:5 — khổ ảnh của trang cá nhân, KHÔNG phải khổ video đứng.
       Đăng một tấm 4:5 vào chỗ 9:16 thì nền tự bù hai dải xám trên
       dưới, và tấm mất gần một phần tư chiều cao vào chỗ không phải
       của mình.
       Đây là khổ người ta nhìn nhiều nhất hôm nay, và nó thiếu. */
    dung:  {w: 1080, h: 1920, ten: 'Khổ đứng tràn màn 1080×1920'}
  };

  /* ── KHỔ IN, ĐO BẰNG MILIMÉT (9.99.33) ──

     Bốn khổ trên đo bằng ĐIỂM ẢNH, và điểm ảnh là đơn vị của màn
     hình. Trên giấy nó không nói được gì: 1080 điểm ảnh in ra to bằng
     nào thì tuỳ máy in. Nên khổ in khai bằng milimét và một mật độ,
     rồi mới suy ra điểm ảnh — chứ không khai điểm ảnh rồi đoán ngược.

     300 điểm mỗi tấc Anh là mật độ nhà in đòi. Thấp hơn thì nét chữ
     ra răng cưa nhìn thấy được ở khoảng cách đọc.

     ── PHẦN NÀY KHÔNG PHẢI VIỆC CỦA CHỦ HỆ ──

     Sổ chờ ghi TG-02 "bảng màu và bộ chữ cho ấn phẩm — chủ hệ chốt",
     và câu ấy đã chặn cả đường in suốt nhiều bản. Nhưng phần lớn thứ
     đang chặn KHÔNG phải một lựa chọn: nền tối tốn mực và ra đục là
     sự thật về mực, không phải sở thích; chữ dưới 2,1mm đọc không ra
     là sự thật về mắt. Chốt phần sự thật ở đây, và để lại cho chủ hệ
     đúng phần còn là lựa chọn: mã mực và loại giấy. */
  var MM_MOI_TAC = 25.4;
  function khoIn(mmR, mmC, ten, dpi) {
    var d = dpi || 300;
    return {w: Math.round(mmR * d / MM_MOI_TAC), h: Math.round(mmC * d / MM_MOI_TAC),
            mmR: mmR, mmC: mmC, dpi: d, in: true, ten: ten};
  }
  KHO_GIAY.a4d = khoIn(210, 297, 'A4 dọc — in 210×297mm');
  KHO_GIAY.a4n = khoIn(297, 210, 'A4 ngang — in 297×210mm');
  KHO_GIAY.a5d = khoIn(148, 210, 'A5 dọc — in 148×210mm');

  /* Chữ nhỏ nhất đọc được trên giấy ở khoảng cách cầm tay. Dưới mức
     này thì không phải "chữ nhỏ", là chữ không ai đọc — và một tấm có
     phần không ai đọc thì phần ấy đáng lẽ không nên có. */
  var CHU_NHO_NHAT_MM = 2.1;
  /* Máy xén giấy có sai số. Chữ đứng gần mép hơn ngần này thì một lô in
     ra có tấm cụt mất chữ và tấm thì không — và lô ấy đã in xong rồi. */
  var LE_XEN_MM = 5;

  /* ── MÀU: ĐỌC TỪ BIẾN CSS ĐANG CHẠY ──
     Trả về mã thật (rgb) chứ không trả về "var(--gita)": chuỗi var()
     sống trong thẻ <svg> trên màn, nhưng chết ngay khi tấm ấy được
     tách ra thành tệp. Đọc một lần lúc vẽ thì tấm đứng độc lập. */
  function mau(ten, duPhong) {
    if (typeof document === 'undefined') return duPhong || '#000000';
    var v = '';
    try {
      v = getComputedStyle(document.documentElement)
        .getPropertyValue('--' + ten).trim();
    } catch (e) { v = ''; }
    return v || duPhong || '#000000';
  }

  /* ── HAI NỀN, VÀ NỀN SÂU LÀ MẶC ĐỊNH CHO ẤN PHẨM ──
     Bản 9.99.14 vẽ mọi tấm trên nền TRẮNG của giao diện, và tấm nào
     cũng nhợt: tấm kính trắng trên nền trắng thì gần như không tách
     ra khỏi nền, huy hiệu màu không phát sáng được, quầng sáng ở nền
     mờ tới mức không ai thấy.

     Câu trả lời nằm sẵn trong sổ thương hiệu, mục G.BRAND.mau:
       "Đêm sâu #070510 — Nền của mọi màn hình.
        ĐỂ ÁNH SÁNG CỦA HÀNH TRÌNH NỔI LÊN."
     Chính chủ hệ đã chốt từ v7.0. Tôi vẽ trên nền sáng suốt ba bản
     vừa rồi là làm ngược một quyết định đã có, chứ không phải thiếu
     một quyết định.

     Nền SÁNG vẫn giữ, cho hình nhúng thẳng vào giao diện ban ngày.
     Nền SÂU cho ẤN PHẨM — bìa, lưới ô, con số — vì đó là chỗ tấm
     hình đứng một mình và phải tự có sức nặng. */
  function bang(che) {
    if (che === 'but') return bangBut();
    if (che === 'giay') return bangGiay();
    var s = bangSang();
    if (che !== 'sau') return s;
    var ds = (G.BRAND && G.BRAND.mau) || [];
    var dem = ds.filter(function (x) { return x.k === 'Đêm sâu'; })[0];
    var day = (dem && dem.hex) || '#070510';
    return {
      nen: day,
      nen2: doiSang(day, 0.10),
      /* Chữ trên nền sâu KHÔNG dùng trắng tinh: trắng tinh trên gần
         đen bị loá viền chữ ở cỡ nhỏ. Hạ một nấc thì mềm mắt mà vẫn
         thừa tương phản — phép đo tương phản canh chỗ này. */
      muc: '#F4F6FB',
      muc2: 'rgba(226,233,247,0.80)',
      muc3: 'rgba(200,211,232,0.60)',
      gita: doiSang(s.gita, 0.22),
      gitaSang: doiSang(s.gitaSang, 0.20),
      gitaSau: s.gita,
      gitaInk: doiSang(s.gita, 0.46),
      do: doiSang(s.do, 0.24),
      doInk: doiSang(s.do, 0.40),
      vien: 'rgba(255,255,255,0.16)',
      sau: true
    };
  }

  /* ══════════ NỀN GIẤY — MẶC ĐỊNH CHO ẤN PHẨM ══════════

     ĐÂY LÀ CHỖ TÔI ĐÃ SAI, VÀ SAI VÌ ĐỌC MỘT DÒNG RỒI BỎ QUA BẢNG
     NGAY DƯỚI NÓ.

     Bản 9.99.15 tôi trích G.BRAND.mau: "Đêm sâu — nền của mọi màn
     hình" rồi lấy đó làm nền cho ẤN PHẨM. Nhưng bốn dòng bên dưới,
     trong cùng một đối tượng, G.BRAND.dungO là bảng ghi MÔI TRƯỜNG
     NÀO DÙNG NỀN NÀO:

       Web app       → nền đêm sâu
       Bản đồ A3 in  → NỀN GIẤY TRẮNG, CHỮ ĐEN, MÀU TẦNG LÀM MÃ MÀU
       Hợp đồng      → đen trắng, không hiệu ứng

     Đêm sâu là nền của MÀN HÌNH ỨNG DỤNG. Một tấm áp phích, một tấm
     tháp tầng, một tấm hành trình — đó là ẤN PHẨM, và ấn phẩm đã có
     dòng riêng: giấy trắng, chữ đen, màu tầng làm mã màu.

     ══ VÀ LẦN TRƯỚC NỀN SÁNG HỎNG VÌ MỘT LÝ DO KHÁC HẲN ══
     Bản 9.99.14 vẽ trên nền sáng và nhợt, nên tôi kết luận nhầm là
     "nền sáng sai". Không phải. Nó nhợt vì TẤM TRẮNG ĐẶT TRÊN NỀN
     TRẮNG — không có gì tách hai lớp ra. Trên giấy, thứ tách các lớp
     không phải bóng đổ mà là:
       · nền trang hơi xám, tấm thì TRẮNG HẲN
       · khối màu ĐẶC và BÃO HOÀ, không phải màu pha loãng
       · viền thật một pixel, không phải kính bán trong
     Đúng cách mọi tấm mẫu chủ hệ gửi đang làm. */
  function bangGiay() {
    var ds = (G.BRAND && G.BRAND.mau) || [];
    var dem = ds.filter(function (x) { return x.k === 'Đêm sâu'; })[0];
    var muc = (dem && dem.hex) || '#070510';
    var s = bangSang();
    return {
      /* Nền trang hơi xám để tấm TRẮNG nổi lên. Trắng trên trắng là
         đúng chỗ bản nền sáng trước đã chết. */
      nen: '#EEF1F7',
      nen2: '#FFFFFF',
      muc: muc,
      muc2: 'rgb(74,79,94)',
      /* Mực phụ trên giấy phải ĐẬM hơn hẳn trên màn: dòng chân dấu
         GITA chỉ 11px, và ở cỡ ấy ngưỡng là 4,5:1 chứ không phải 3,0.
         Xám nhạt quen mắt trên màn thì trên giấy là chữ chìm. */
      muc3: 'rgb(92,99,116)',
      gita: s.gita, gitaSang: s.gitaSang, gitaSau: s.gitaSau, gitaInk: s.gitaInk,
      do: s.do, doInk: s.doInk,
      vien: 'rgba(20,18,28,0.14)',
      giay: true
    };
  }

  /* ══════════ GIẤY BÚT MÀU ══════════

     Chủ hệ chốt 9.99.27: "tạo ảnh theo ảnh vẽ bằng bút màu."

     Đây là nền DUY NHẤT bộ vẽ trong máy làm được trọn vẹn, và lý do
     đáng nói: một bức vẽ bút màu KHÔNG cố tỏ ra là ảnh chụp. Nét run,
     màu chồng lớp, giấy có hạt — đó là thứ hình học dựng được. Còn da
     người có kết cấu thì không.

     Nên ở nền này KHÔNG có ô chờ, không cần cửa đi ra, không cần một
     bí mật nào. Tấm dựng xong là xong.

     Màu vẫn lấy từ bảng đã chốt, chỉ hạ bão hoà và nhạt đi — bút màu
     trên giấy không bao giờ đặc như mực in. */
  function bangBut() {
    var s = bangSang();
    return {
      nen: '#FBF6EC',                 /* giấy ngà, không phải trắng máy in */
      nen2: '#FFFDF8',
      /* Mực trên giấy ngà: nâu-đen như chì, không phải đen tuyệt đối.
         Đen tuyệt đối cạnh nét bút màu đọc ra là chữ dán vào. */
      muc: '#2C2418',
      muc2: 'rgb(88,76,58)',
      muc3: 'rgb(116,102,80)',
      gita: s.gita, gitaSang: s.gitaSang, gitaSau: s.gitaSau, gitaInk: s.gitaInk,
      do: s.do, doInk: s.doInk,
      vien: 'rgba(44,36,24,0.20)',
      giay: true,                     /* dùng chung luật bố cục với nền giấy */
      but: true
    };
  }

  /* ── NÉT RUN VÀ HẠT GIẤY ──
     Hai bộ lọc, và chúng làm hai việc khác nhau. Gộp lại một cái thì
     mất đường chỉnh riêng, mà hai thứ này phải chỉnh riêng: nét run
     quá tay thì hình méo; hạt giấy quá tay thì chữ mờ.

     `run` xô lệch đường nét bằng nhiễu — giống tay người không kẻ được
     một đường thật thẳng. `hat` rải hạt lên cả tấm, nhân xuống, để
     giấy có bề mặt.

     CHỮ KHÔNG ĐI QUA BỘ LỌC NÀO. Nét run trên chữ tiếng Việt làm dấu
     thanh dính vào thân chữ, và một tấm đọc không ra thì đẹp cũng vô
     ích — luật gốc đã xếp DỄ HIỂU trên ĐẸP. */
  function defBut() {
    var r = idMoi('run'), t = idMoi('hat');
    return {run: r, hat: t, defs:
      '<filter id="' + r + '" x="-12%" y="-12%" width="124%" height="124%">' +
        '<feTurbulence type="fractalNoise" baseFrequency="0.028" numOctaves="4" ' +
          'seed="7" result="n"/>' +
        '<feDisplacementMap in="SourceGraphic" in2="n" scale="4.2" ' +
          'xChannelSelector="R" yChannelSelector="G"/>' +
      '</filter>' +
      '<filter id="' + t + '" x="0" y="0" width="100%" height="100%">' +
        '<feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" ' +
          'seed="11" result="h"/>' +
        '<feColorMatrix in="h" type="saturate" values="0" result="hx"/>' +
      '</filter>'};
  }

  /* Một mảng màu vẽ bằng bút: KHÔNG tô đặc. Bút màu để lại vệt, và
     chồng hai ba lượt mới đậm. Dựng bằng ba lượt nét chéo lệch nhau —
     tô đặc rồi thêm hạt lên trên thì ra màu in bị bẩn, không ra bút. */
  function vetBut(x, y, w, ht, hex, dam, id) {
    var g = idMoi('vet');
    var buoc = Math.max(5, Math.round(ht / 9));
    var net = '';
    for (var i = -ht; i < w + ht; i += buoc)
      net += '<line x1="' + (x + i) + '" y1="' + (y + ht) + '" x2="' +
        (x + i + ht) + '" y2="' + y + '" />';
    return {defs:
      '<clipPath id="' + g + '"><rect x="' + x + '" y="' + y + '" width="' + w +
        '" height="' + ht + '" rx="' + Math.round(Math.min(w, ht) * 0.10) +
        '"/></clipPath>',
      ve: '<g clip-path="url(#' + g + ')"' +
        (id ? ' filter="url(#' + id + ')"' : '') +
        ' stroke="' + h(hex) + '" stroke-opacity="' + (dam || 0.34).toFixed(2) +
        '" stroke-width="' + Math.max(2.4, buoc * 0.62).toFixed(1) +
        '" stroke-linecap="round">' + net + '</g>'};
  }

  /* Bảng màu một tấm hình. Gom lại một chỗ để mỗi bộ vẽ không tự đi
     hỏi lẻ — và để thấy ngay tấm hình đang dùng đúng mấy màu nào. */
  function bangSang() {
    return {
      nen:    mau('nen-1', '#FFFFFF'),
      nen2:   mau('nen-2', '#F7F4FC'),
      muc:    mau('ink-1', '#1C1440'),
      muc2:   mau('ink-2', '#4A4270'),
      muc3:   mau('ink-3', '#7C7599'),
      gita:   mau('gita', '#2A72C6'),
      gitaSang: mau('gita-sang', '#5C9BE0'),
      gitaSau: mau('gita-sau', '#185AB4'),
      gitaInk: mau('gita-ink', '#14509E'),
      do:     mau('gita-do', '#F61824'),
      doInk:  mau('gita-do-ink', '#BE0E16'),
      vien:   mau('vien-1', 'rgba(28,20,64,.12)')
    };
  }

  /* ── SÁU SẮC TẦNG: ĐỌC TỪ G.BRAND.mau, KHÔNG TỰ ĐẶT ──
     Ảnh mẫu chủ hệ gửi có sáu ô sáu màu khác nhau. Cám dỗ là tự chọn
     sáu màu cho đẹp — làm thế là dựng bảng màu thứ hai, đúng thứ luật
     "màu lấy từ bảng đã chốt" cấm.
     Không phải tự chọn: G.BRAND.mau đã có sẵn năm sắc tầng cộng một
     sắc nhắc, đủ sáu, và đã được duyệt từ v7.0. Đọc thẳng từ đấy.
     Không mở được kho thì trả rỗng, và bộ vẽ nào cần sáu sắc sẽ NÓI
     là chưa mở kho — chứ không lấy tạm sáu màu khác. */
  var TEN_SAC = ['T1 · Xanh dương', 'T2 · Tím', 'T3 · Lam',
                 'T4 · Lục', 'T5 · Hổ phách', 'Hồng nhắc'];
  function sacTang() {
    var ds = (G.BRAND && G.BRAND.mau) || [];
    var ra = [];
    for (var i = 0; i < TEN_SAC.length; i++) {
      var m = ds.filter(function (x) { return x.k === TEN_SAC[i]; })[0];
      if (m && m.hex) ra.push({hex: m.hex, ten: m.k});
    }
    return ra;
  }

  /* Sáng hơn / tối hơn một sắc, để dựng chuyển sắc trong huy hiệu mà
     vẫn chỉ dùng đúng một màu gốc đã duyệt. */
  function doiSang(hex, ty) {
    var t = String(hex).trim(), r, g, b;
    var m = /^#?([0-9a-f]{6})$/i.exec(t);
    if (m) {
      var n = parseInt(m[1], 16); r = n >> 16; g = (n >> 8) & 255; b = n & 255;
    } else {
      /* getComputedStyle trả biến CSS về nguyên văn, mà nguyên văn có
         thể là "rgb(42,114,198)" chứ không phải mã băm. Bản đầu chỉ
         nhận mã băm nên nó lặng lẽ trả về nguyên chuỗi, và mọi chỗ
         pha sáng/tối thành không pha gì — hỏng mà không kêu. */
      var q = /rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/i.exec(t);
      if (!q) return hex;
      r = +q[1]; g = +q[2]; b = +q[3];
    }
    var f = function (v) {
      return Math.max(0, Math.min(255, Math.round(ty > 0
        ? v + (255 - v) * ty : v * (1 + ty)))); };
    return '#' + ((1 << 24) + (f(r) << 16) + (f(g) << 8) + f(b))
      .toString(16).slice(1);
  }

  /* ═══════════ LỚP CHIỀU SÂU ═══════════
     Chiều sâu trong tấm hình không đến từ việc dán bóng đổ lên mọi
     thứ. Nó đến từ BA LỚP tách bạch, mỗi lớp một việc:

       lớp 1 · NỀN     — quầng sáng mờ, không có nét, không đọc được
       lớp 2 · TẤM     — mặt kính có viền sáng trên và bóng đổ dưới
       lớp 3 · CHỮ     — nét đặc, tương phản cao nhất tấm

     Mắt đọc lớp 3 trước, lớp 2 sau, lớp 1 không bao giờ. Đảo thứ tự
     ấy — chẳng hạn cho nền một hoạ tiết đủ đậm để mắt dừng lại — là
     chỗ mọi tấm hình "nhiều hiệu ứng" hỏng.

     Một luật cấm kỵ của thương hiệu đứng ngay đây: BRAND.camKy ghi
     "không đổi màu logo, không nghiêng, KHÔNG THÊM BÓNG ĐỔ". Nên dấu
     GITA là thứ DUY NHẤT trong tấm không được nhận bóng. */
  var demId = 0;
  function idMoi(g) { demId++; return 'gita-' + g + '-' + demId; }

  function lopNen(kg, k, dam) {
    /* Ba quầng sáng radial, cùng ngôn ngữ với #aura của giao diện.
       Trên nền SÂU chúng đậm hơn hẳn: trên nền trắng một quầng 20%
       gần như vô hình, còn trên nền gần đen thì cùng quầng ấy dựng
       hẳn một khoảng không gian phía sau tấm. Đó chính là chỗ "để
       ánh sáng của hành trình nổi lên" có nghĩa thật.
       Cộng một lớp TỐI DẦN Ở RÌA (vignette): mắt tự tìm chỗ sáng
       nhất, nên rìa tối là cách đẩy mắt vào giữa mà không vẽ thêm
       gì để mắt phải đọc. */
    /* ── GIẤY BÚT KHÔNG CÓ QUẦNG SÁNG ──
       Ba quầng radial dựng chiều sâu cho một MÀN HÌNH. Trên một tờ
       giấy thì không có gì phát sáng phía sau cả — quầng ở đó đọc ra
       là tờ giấy bị ố, và cả tấm mất đúng thứ nó đang giả: mặt giấy
       phẳng, đều, có hạt. Nền bút trả về một mặt giấy trơn cộng một
       lớp hạt, không quầng, không tối rìa. */
    if (k.but) {
      var hg = defBut();
      return {defs: hg.defs,
        ve: '<rect x="0" y="0" width="' + kg.w + '" height="' + kg.h + '" fill="' +
          h(k.nen) + '"/>' +
          '<rect x="0" y="0" width="' + kg.w + '" height="' + kg.h +
          '" filter="url(#' + hg.hat + ')" opacity="0.055"/>'};
    }
    var a = idMoi('quang'), b = idMoi('quang'), c = idMoi('quang'), r = idMoi('ria');
    var d = (dam === undefined ? 1 : dam) * (k.sau ? 2.6 : (k.giay ? 0.55 : 1));
    var q = function (id, mau, dam2) {
      return '<radialGradient id="' + id + '" cx="50%" cy="50%" r="50%">' +
        '<stop offset="0%" stop-color="' + h(mau) + '" stop-opacity="' +
          Math.min(0.85, dam2 * d).toFixed(3) + '"/>' +
        '<stop offset="100%" stop-color="' + h(mau) + '" stop-opacity="0"/>' +
        '</radialGradient>'; };
    return {
      defs: q(a, k.gita, 0.20) + q(b, k.do, 0.09) + q(c, k.gitaSang, 0.13) +
        '<radialGradient id="' + r + '" cx="50%" cy="45%" r="72%">' +
          '<stop offset="55%" stop-color="#000000" stop-opacity="0"/>' +
          '<stop offset="100%" stop-color="#000000" stop-opacity="' +
            (k.sau ? '0.45' : (k.giay ? '0.03' : '0.06')) + '"/></radialGradient>',
      ve:
        '<ellipse cx="' + Math.round(kg.w * 0.80) + '" cy="' + Math.round(kg.h * 0.10) +
          '" rx="' + Math.round(kg.w * 0.50) + '" ry="' + Math.round(kg.h * 0.66) +
          '" fill="url(#' + a + ')"/>' +
        '<ellipse cx="' + Math.round(kg.w * 0.08) + '" cy="' + Math.round(kg.h * 0.96) +
          '" rx="' + Math.round(kg.w * 0.38) + '" ry="' + Math.round(kg.h * 0.48) +
          '" fill="url(#' + b + ')"/>' +
        '<ellipse cx="' + Math.round(kg.w * 0.22) + '" cy="' + Math.round(kg.h * 0.06) +
          '" rx="' + Math.round(kg.w * 0.36) + '" ry="' + Math.round(kg.h * 0.40) +
          '" fill="url(#' + c + ')"/>' +
        '<rect width="' + kg.w + '" height="' + kg.h + '" fill="url(#' + r + ')"/>'
    };
  }

  /* ── MỘT NGUỒN SÁNG, TỪ TRÊN BÊN TRÁI ──
     Bản trước đổ bóng thẳng xuống (dx=0) nhưng lại vẽ vệt sáng ở cạnh
     TRÊN — hai chi tiết ấy kể hai câu chuyện khác nhau về chỗ ánh
     sáng đến từ đâu, và mắt đọc ra ngay là "hình này giả" dù không
     chỉ được chỗ nào sai.
     Chốt một hướng: sáng từ trên-trái. Bóng lệch xuống-phải, vệt sáng
     ở cạnh trên và cạnh trái. Mọi thứ trong tấm theo đúng một hướng.

     Ba BẬC NỔI, không phải một bóng cho mọi thứ: nền(0) · tấm(1) ·
     huy hiệu(2). Vật càng nổi thì bóng càng xa và càng mềm — đó là
     cách mắt đo khoảng cách, và dùng một bóng cho mọi thứ là bỏ mất
     công cụ ấy. */
  var HUONG_SANG = {dx: 0.42, dy: 1};
  function defBong(k, bac) {
    var id = idMoi('bong');
    var n = bac || 1;
    var xa = [0, 12, 22][n] || 12;
    var toe = [0, 16, 26][n] || 16;
    var dam = k.sau ? [0, 0.55, 0.62][n]
      : (k.giay ? [0, 0.13, 0.17][n] : [0, 0.16, 0.20][n]);
    var mau = k.sau ? '#000000' : (k.giay ? '#1A2340' : k.gitaSau);
    return {id: id, defs:
      '<filter id="' + id + '" x="-40%" y="-40%" width="185%" height="200%">' +
        '<feDropShadow dx="' + (xa * HUONG_SANG.dx).toFixed(1) + '" dy="' +
          (xa * HUONG_SANG.dy).toFixed(1) + '" stdDeviation="' + toe + '" ' +
          'flood-color="' + h(mau) + '" flood-opacity="' + dam + '"/>' +
      '</filter>'};
  }

  /* Mặt kính: chuyển sắc rất nhẹ từ trắng xuống, cộng một nét viền
     sáng Ở TRÊN. Viền sáng trên là thứ nói với mắt "vật này nổi lên",
     vì ngoài đời ánh sáng đến từ trên. Bỏ nó đi thì tấm kính dẹt ra
     ngay, dù bóng đổ vẫn còn. */
  function tamKinh(x, y, w, ht, k, o) {
    o = o || {};
    var g = idMoi('kinh');
    var r = o.bo === undefined ? 20 : o.bo;
    var sac = o.sac || k.gita;
    /* Trên nền SÂU, tấm kính là một mảng TRẮNG RẤT MỜ chứ không phải
       một mảng trắng đục: mảng đục cắt hẳn khỏi nền và thành một cái
       thẻ dán lên, còn mảng mờ cho quầng sáng phía sau lọt qua và
       tấm mới thật sự nằm TRONG không gian ấy. Đó là khác biệt giữa
       "có bóng đổ" và "có chiều sâu". */
    var mo = k.sau;
    /* Trên GIẤY: tấm trắng hẳn, không pha. Nền trang đã hơi xám nên
       chính độ trắng là thứ tách tấm ra — thêm chuyển sắc vào đây là
       làm tấm xám đi và mất luôn cái tách ấy. */
    var d1 = mo ? 'rgba(255,255,255,0.13)' : (k.giay ? '#FFFFFF' : doiSang(k.nen, 0.06));
    var d2 = mo ? 'rgba(255,255,255,0.05)' : (k.giay ? '#FFFFFF' : k.nen2);
    var op = mo ? '1' : (k.giay ? '1' : '0.94');
    return {
      defs: '<linearGradient id="' + g + '" x1="0.15" y1="0" x2="0.85" y2="1">' +
        '<stop offset="0%" stop-color="' + h(d1) + '" stop-opacity="' + op + '"/>' +
        '<stop offset="100%" stop-color="' + h(d2) + '" stop-opacity="' + op + '"/>' +
        '</linearGradient>',
      ve:
        '<g' + (o.bong ? ' filter="url(#' + o.bong + ')"' : '') + '>' +
          '<rect class="gita-tam" x="' + x + '" y="' + y + '" width="' + w +
            '" height="' + ht +
            '" rx="' + r + '" fill="url(#' + g + ')" stroke="' + h(sac) +
            '" stroke-opacity="' + (mo ? '0.42' : (k.giay ? '0.55' : '0.22')) +
            '" stroke-width="' + (k.giay ? '1.5' : '1') + '"/>' +
          /* Vệt sáng ôm cạnh TRÊN và cạnh TRÁI — đúng hướng nguồn sáng
             đã chốt. Bản trước chỉ vẽ cạnh trên, nên tấm trông như bị
             chiếu thẳng từ đỉnh đầu chứ không từ trên-trái. */
          (k.giay ? '' :
          '<path d="M' + (x + 0.9) + ' ' + (y + ht * 0.55) + ' V' + (y + r) +
            ' A' + r + ' ' + r + ' 0 0 1 ' + (x + r) + ' ' + (y + 0.9) +
            ' H' + (x + w - r) + '" fill="none" stroke="' +
            (mo ? 'rgba(255,255,255,0.55)' : h(doiSang(k.nen, 0.9))) +
            '" stroke-opacity="0.9" stroke-width="1.4" stroke-linecap="round"/>') +
        '</g>'
    };
  }

  /* ── HUY HIỆU BIỂU TƯỢNG ──
     Vòng tròn chuyển sắc từ một sắc tầng, biểu tượng nét trắng bên
     trong. Sáu biểu tượng vẽ bằng hình học thuần, không nạp bộ chữ
     biểu tượng nào — một tệp phông ngoài là một lượt hỏi mạng, và
     luật của bộ vẽ này là không có lượt nào. */
  /* Mỗi biểu tượng là một mảnh SVG vẽ trong ô 30×30 quanh gốc toạ độ.
     Cho phép cả nét (stroke) chứ không chỉ mảng đặc: bản đầu vẽ tất cả
     bằng mảng đặc với fill-rule="evenodd", và cái ĐÍCH ra thành một
     đốm tròn có lỗ — nhìn không ra là đích. Ba vòng đồng tâm vẽ bằng
     NÉT thì đọc ra ngay. Cái ĐẦU NGƯỜI nhìn nghiêng cũng ra một giọt
     nước; đổi sang hai bong bóng thoại, vì việc của ô ấy là TƯ VẤN —
     và trò chuyện là thứ ai cũng đọc được ngay. */
  var HINH = {
    sach: '<path d="M-9 -7 h7 a2 2 0 0 1 2 2 v12 a2 2 0 0 0 -2 -2 h-7 z ' +
          'M9 -7 h-7 a2 2 0 0 0 -2 2 v12 a2 2 0 0 1 2 -2 h7 z"/>',
    thoai:'<path d="M-10 -8 h13 a2.5 2.5 0 0 1 2.5 2.5 v7 a2.5 2.5 0 0 1 -2.5 2.5 ' +
          'h-6 l-4.5 4 v-4 h-2.5 a2.5 2.5 0 0 1 -2.5 -2.5 v-7 a2.5 2.5 0 0 1 2.5 -2.5 z"/>' +
          '<path d="M7 -3.5 h3 a2.5 2.5 0 0 1 2.5 2.5 v6 a2.5 2.5 0 0 1 -2.5 2.5 ' +
          'v3.5 l-3.5 -3.5 h-1" fill="none" stroke="#FFFFFF" stroke-width="2.2" ' +
          'stroke-linejoin="round"/>',
    dich: '<circle cx="0" cy="0" r="9" fill="none" stroke="#FFFFFF" stroke-width="2.4"/>' +
          '<circle cx="0" cy="0" r="4.6" fill="none" stroke="#FFFFFF" stroke-width="2.4"/>' +
          '<circle cx="0" cy="0" r="1.6"/>',
    den:  '<path d="M0 -9 a6.5 6.5 0 0 1 3.8 11.8 v2.2 h-7.6 v-2.2 A6.5 6.5 0 0 1 0 -9 z"/>' +
          '<rect x="-3" y="6.4" width="6" height="2" rx="1"/>' +
          '<rect x="-2.2" y="9.4" width="4.4" height="2" rx="1"/>',
    banh: '<path d="M-1.6 -9 h3.2 l0.5 2.6 l2.3 1.3 l2.4 -1.1 l1.6 2.8 l-1.9 1.8 v2.6 ' +
          'l1.9 1.8 l-1.6 2.8 l-2.4 -1.1 l-2.3 1.3 l-0.5 2.6 h-3.2 l-0.5 -2.6 ' +
          'l-2.3 -1.3 l-2.4 1.1 l-1.6 -2.8 l1.9 -1.8 v-2.6 l-1.9 -1.8 l1.6 -2.8 ' +
          /* Lỗ bánh răng phải nằm TRONG CÙNG một thẻ path thì fill-rule
             evenodd mới khoét được. Tách ra thành <circle> riêng là vẽ
             thêm một đĩa đặc đè lên, không phải khoét. */
          'l2.4 1.1 l2.3 -1.3 z M0 -3.2 a3.2 3.2 0 1 0 0.01 0 z"/>',
    cot:  '<path d="M-9 9 v-6 h4 v6 z M-2 9 v-11 h4 v11 z M5 9 v-16 h4 v16 z"/>' +
          '<path d="M-8 -4 l6 -5 l5 3 l6 -7" fill="none" stroke="#FFFFFF" ' +
          'stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" ' +
          'opacity="0.85"/>'
  };
  /* ── BỘ BIỂU TƯỢNG RỘNG RA, VÀ CHỌN THEO NGHĨA ──
     Chủ hệ đề nghị "biểu tượng làm điểm nhấn khác biệt cho từng
     phần". Sáu hình xoay vòng theo THỨ TỰ thì phần nào cũng có hình,
     nhưng hình không dính gì tới phần ấy — và mắt đọc ra ngay là
     hình dán cho có.
     Nay mười sáu hình, và chọn theo TỪ KHOÁ trong tên phần. Đây là
     một suy diễn, nên nói rõ nó là suy diễn gì: máy đoán HÌNH MINH
     HOẠ, không đoán NỘI DUNG. Đoán sai một cái hình thì tấm vẫn nói
     đúng; luật C10 cấm đoán nội dung, không cấm chọn hình. Và khi
     không có từ khoá nào khớp thì quay về thứ tự — chứ không bỏ
     trống, vì một ô thiếu hình giữa năm ô có hình mới là hỏng. */
  var HINH_THEM = {
    dung: '<path d="M-9 0 l6 6 l12 -13" fill="none" stroke="#FFFFFF" ' +
          'stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/>',
    sai:  '<path d="M-7 -7 l14 14 M7 -7 l-14 14" fill="none" stroke="#FFFFFF" ' +
          'stroke-width="3.4" stroke-linecap="round"/>',
    nui:  '<path d="M-11 8 l7 -12 l4 6 l5 -9 l6 15 z"/>',
    co:   '<path d="M-6 9 v-18 h1.8 v18 z M-4 -9 l13 3.4 l-13 3.4 z"/>',
    khoa: '<path d="M-7 -1 h14 a1.6 1.6 0 0 1 1.6 1.6 v7.8 a1.6 1.6 0 0 1 -1.6 1.6 ' +
          'h-14 a1.6 1.6 0 0 1 -1.6 -1.6 v-7.8 a1.6 1.6 0 0 1 1.6 -1.6 z ' +
          'M-4.4 -1 v-3.6 a4.4 4.4 0 0 1 8.8 0 v3.6 h-2.3 v-3.6 a2.1 2.1 0 0 0 -4.2 0 v3.6 z"/>',
    khien:'<path d="M0 -10 l9 3.4 v6.2 c0 5 -3.8 8.6 -9 10.4 c-5.2 -1.8 -9 -5.4 -9 -10.4 ' +
          'v-6.2 z"/>',
    tim:  '<path d="M0 9 c-7 -4.6 -10 -8 -10 -11.6 a4.9 4.9 0 0 1 10 -2.4 ' +
          'a4.9 4.9 0 0 1 10 2.4 c0 3.6 -3 7 -10 11.6 z"/>',
    tay:  '<path d="M-11 -1 l4 -4 l5 4 l5 -4 l4 4 l-5 5 l-3 -2 l-3 3 l-3 -3 l-3 2 z"/>',
    labàn:'<circle cx="0" cy="0" r="9.4" fill="none" stroke="#FFFFFF" stroke-width="2.4"/>' +
          '<path d="M4.4 -4.4 l-2.6 6.6 l-6.6 2.6 l2.6 -6.6 z"/>',
    lich: '<rect x="-9" y="-7.4" width="18" height="16" rx="2.2" fill="none" ' +
          'stroke="#FFFFFF" stroke-width="2.4"/><path d="M-9 -2.6 h18" stroke="#FFFFFF" ' +
          'stroke-width="2.2"/><path d="M-5 -10.4 v4.4 M5 -10.4 v4.4" stroke="#FFFFFF" ' +
          'stroke-width="2.4" stroke-linecap="round"/>',
    sao:  '<path d="M0 -10 l2.9 6.4 l7 0.8 l-5.2 4.7 l1.4 6.9 l-6.1 -3.5 l-6.1 3.5 ' +
          'l1.4 -6.9 l-5.2 -4.7 l7 -0.8 z"/>',
    cup:  '<path d="M-6 -9 h12 v5 a6 6 0 0 1 -12 0 z M-6 -7 h-3 a3 3 0 0 0 3 3 z ' +
          'M6 -7 h3 a3 3 0 0 1 -3 3 z M-1.6 1.4 h3.2 v4.2 h3.4 v2.6 h-10 v-2.6 h3.4 z"/>',
    nguoi:'<circle cx="0" cy="-5" r="4.2"/><path d="M-8 9 a8 8 0 0 1 16 0 z"/>',
    doi:  '<circle cx="-5.4" cy="-5" r="3.6"/><circle cx="5.4" cy="-5" r="3.6"/>' +
          '<path d="M-12 8 a6.6 6.6 0 0 1 13.2 0 z M1.4 8 a6.6 6.6 0 0 1 12 0 z"/>'
  };
  Object.keys(HINH_THEM).forEach(function (k2) { HINH[k2] = HINH_THEM[k2]; });

  /* ── TỪ VỰNG THẬT CỦA GITA, KHÔNG PHẢI TỪ VỰNG CHUNG (9.99.26) ──
     Bảng này ban đầu chỉ có từ chung: "mục tiêu", "tối ưu", "kết quả".
     Nên tấm cổng nghiệm thu ngày bảy ra ba biểu tượng sách · bóng thoại
     · bia bắn cho ba điều kiện là bộ test, phiếu ghi và buổi đọc hồ sơ
     — không hình nào dính đến nghĩa nào. Không phải khớp SAI: không từ
     nào khớp cả, nên nó rơi xuống vòng luân phiên mặc định.
     Vòng luân phiên có lý do tồn tại — nó giữ cho một lưới ô không ra
     sáu hình giống nhau. Nhưng nó là chỗ RƠI XUỐNG, và một hệ mà mọi
     tấm đều rơi xuống chỗ ấy thì biểu tượng chỉ còn là màu.
     Bốn dòng đầu là từ vựng người trong nhà GITA dùng hằng ngày; hình
     tương ứng đã nằm sẵn trong HINH từ lâu, chỉ chưa ai nối vào. */
  var TU_KHOA_HINH = [
    ['dung',  'nghiem thu|dat chuan|lam xong|hoan thanh|qua chang|dieu kien'],
    ['lich',  'phieu ghi|nhat ky|ghi chep|bay ngay|hang tuan|so ghi'],
    ['doi',   'ho so|buoi doc|ngoi lai|gap mat|buoi tiep nhan|ca nha cung'],
    ['sach',  'bo test|kiem tra|sat hach|dau vao|bai thi'],
    ['dich',  'muc tieu|muc dich|dich den|dinh huong'],
    ['thoai', 'tu van|lang nghe|hoi dap|tro chuyen|giao tiep|phan hoi'],
    ['den',   'giai dap|y tuong|tu duy|khai mo|sang tao'],
    ['banh',  'toi uu|he thong|van hanh|quy trinh'],
    ['cot',   'ket qua|tang truong|hieu qua|tien bo|do luong'],
    ['sach',  'doc hieu|hoc tap|kien thuc|tai lieu|dao tao'],
    ['nui',   'tam nhin|dinh nui|vuot|thu thach|but pha|dot pha'],
    ['co',    'bat dau|khoi dau|chang|moc|buoc'],
    ['khoa',  'bao mat|rieng tu|an toan|quyen'],
    ['khien', 'bao ve|cam ket|nguyen tac|chuan muc'],
    ['tim',   'dong hanh|cam xuc|niem tin|tu tam'],
    ['tay',   'hop tac|ket noi|chia se|phoi hop|cung ban'],
    ['labàn', 'chien luoc|lo trinh|ban do|phuong huong'],
    ['lich',  'nhip|lich|chu ky|thoi gian|hang ngay'],
    ['sao',   'chat luong|xuat sac|noi bat|gia tri'],
    ['cup',   'thanh cong|ky tich|vuot troi|thanh tuu'],
    ['nguoi', 'ca nhan|ban than|hoc vien'],
    ['doi',   'gia dinh|doi nhom|ca nha|cong dong|phu huynh|ho tro']
  ];
  var THU_TU_HINH = ['sach', 'thoai', 'dich', 'den', 'banh', 'cot',
                     'labàn', 'tim', 'co', 'sao', 'doi', 'cup'];

  /* ── KHỚP THEO BIÊN TỪ, KHÔNG KHỚP GIỮA TỪ ──
     Bản đầu dò bằng chuỗi con, và ô "GIA ĐÌNH" ra hình NÚI: từ khoá
     "dinh" (của "đỉnh") nằm gọn trong "gia dinh". Một từ khoá ngắn
     luôn tìm được chỗ trú trong một từ dài hơn.
     Sau khi bỏ dấu thì chuỗi chỉ còn chữ cái Latin, nên \b dùng được
     ở đây — khác hẳn chỗ dò chữ "và" có dấu, nơi \b không bao giờ
     khớp. Hai chỗ dò chữ, hai luật khác nhau, và biết vì sao khác. */
  function chonHinh(ten, i) {
    var t = boDauChu(ten);
    for (var j = 0; j < TU_KHOA_HINH.length; j++)
      if (new RegExp('\\b(?:' + TU_KHOA_HINH[j][1] + ')\\b', 'i').test(t))
        return TU_KHOA_HINH[j][0];
    return THU_TU_HINH[i % THU_TU_HINH.length];
  }
  function boDauChu(x) {
    return String(x || '').toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd');
  }

  function huyHieu(cx, cy, r, hex, hinh, bong, k) {
    var g = idMoi('hh'), a = idMoi('anh'), q = idMoi('quanghh');
    var bo = Math.round(r * 0.62);
    /* Quầng sáng toả sau huy hiệu là ngôn ngữ của MÀN HÌNH: nó nói
       "vật này phát sáng". Giấy không phát sáng. Để nguyên quầng trên
       nền giấy thì huy hiệu trông nhoè như in lem, chứ không trông
       sáng — và đó đúng là chỗ cuối cùng còn mùi web trên một tấm ấn
       phẩm. Tắt hẳn khi vẽ trên giấy. */
    var coQuang = !(k && k.giay);
    return {
      defs:
        /* Chuyển sắc chạy theo ĐÚNG hướng nguồn sáng: sáng ở góc
           trên-trái, tối dần xuống góc dưới-phải. */
        '<linearGradient id="' + g + '" x1="0.1" y1="0" x2="0.9" y2="1">' +
          '<stop offset="0%" stop-color="' + h(doiSang(hex, 0.30)) + '"/>' +
          '<stop offset="52%" stop-color="' + h(hex) + '"/>' +
          '<stop offset="100%" stop-color="' + h(doiSang(hex, -0.26)) + '"/>' +
        '</linearGradient>' +
        /* Vệt ÁNH ở nửa trên — thứ làm một khối màu trông như một vật
           có mặt bóng, thay vì một ô màu tô đặc. Rất nhẹ: thấy được
           thì hỏng, chỉ nên cảm được. */
        '<linearGradient id="' + a + '" x1="0" y1="0" x2="0" y2="1">' +
          '<stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.34"/>' +
          '<stop offset="60%" stop-color="#FFFFFF" stop-opacity="0.04"/>' +
          '<stop offset="100%" stop-color="#FFFFFF" stop-opacity="0"/>' +
        '</linearGradient>' +
        /* Quầng màu toả ra sau huy hiệu. Trên nền sâu đây là chỗ sắc
           tầng thật sự PHÁT SÁNG chứ chỉ nằm im. */
        '<radialGradient id="' + q + '" cx="50%" cy="50%" r="50%">' +
          '<stop offset="0%" stop-color="' + h(hex) + '" stop-opacity="0.42"/>' +
          '<stop offset="100%" stop-color="' + h(hex) + '" stop-opacity="0"/>' +
        '</radialGradient>',
      ve:
        (coQuang ? '<circle cx="' + cx + '" cy="' + cy + '" r="' +
          Math.round(r * 1.85) + '" fill="url(#' + q + ')"/>' : '') +
        '<g' + (bong ? ' filter="url(#' + bong + ')"' : '') + '>' +
          '<rect x="' + (cx - r) + '" y="' + (cy - r) + '" width="' + (r * 2) +
            '" height="' + (r * 2) + '" rx="' + bo + '" fill="url(#' + g + ')"/>' +
          '<rect x="' + (cx - r) + '" y="' + (cy - r) + '" width="' + (r * 2) +
            '" height="' + r + '" rx="' + bo + '" fill="url(#' + a + ')"/>' +
          '<rect x="' + (cx - r + 0.7) + '" y="' + (cy - r + 0.7) + '" width="' +
            (r * 2 - 1.4) + '" height="' + (r * 2 - 1.4) + '" rx="' + bo +
            '" fill="none" stroke="#FFFFFF" stroke-opacity="0.30" stroke-width="1.2"/>' +
          '<g transform="translate(' + cx + ',' + cy + ') scale(' + (r / 15).toFixed(3) +
            ')" fill="#FFFFFF" fill-rule="evenodd">' + HINH[hinh] + '</g></g>'
    };
  }

  /* ── MỰC ĐẶT TRÊN MỘT MẢNG MÀU ĐẶC ──
     Mặc định trắng là sai một nửa số lần. Sáu sắc thương hiệu có cả
     sắc TỐI (tím, xanh dương) lẫn sắc SÁNG (hổ phách, lục): chữ trắng
     trên hổ phách chỉ được 2,5:1 — phép đo tương phản bắt ngay.
     Luật: đo độ sáng của chính mảng màu ấy rồi chọn mực. Đây là chỗ
     một bảng màu nhiều sắc BẮT BUỘC phải có, còn bảng một sắc thì
     không ai để ý là thiếu. */
  function doSang(hex) {
    var t = String(hex), r, g, b;
    var m = /^#?([0-9a-f]{6})$/i.exec(t.trim());
    if (m) { var n = parseInt(m[1], 16); r = n >> 16; g = (n >> 8) & 255; b = n & 255; }
    else {
      var q = /rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/i.exec(t);
      if (!q) return 0.5;
      r = +q[1]; g = +q[2]; b = +q[3];
    }
    var f = function (v) { v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  }
  /* ── KHÔNG ĐẶT NGƯỠNG ĐỘ SÁNG: TÍNH CẢ HAI RỒI CHỌN ──
     Bản đầu viết "sáng hơn 0,42 thì dùng mực đen". Con số 0,42 là một
     con số ma, và nó sai ngay ở sắc LAM #06B6D4: độ sáng 0,38 nên máy
     chọn mực trắng, mà trắng trên lam chỉ được 2,5:1 — trong khi mực
     đen trên chính nó được 7,4:1. Lam là màu "không bên nào": không
     đủ tối cho chữ trắng, không đủ sáng để bị coi là màu sáng.
     Bỏ ngưỡng đi. Đo tương phản của CẢ HAI mực rồi lấy mực thắng.
     Không còn con số nào để đoán sai. */
  var MUC_TOI = '#15121F';
  function tuongPhan(a, b) {
    var L1 = doSang(a), L2 = doSang(b);
    return (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
  }
  /* Chọn mực theo ĐẦU TỆ NHẤT của dải, không theo màu gốc.
     Nêm được tô bằng chuyển sắc, nên chữ nằm trên một KHOẢNG màu chứ
     không nằm trên một màu. Chọn theo màu gốc thì mực thắng ở giữa
     nêm mà thua ở một đầu — và phép đo lấy trung bình nền ngay dưới
     chữ nên nó bắt được đúng chỗ ấy.
     Kéo theo một luật nữa: dải của nêm phải HẸP. Dải càng rộng thì
     đầu tệ nhất càng tệ, tới mức không mực nào cứu được. */
  /* Trên GIẤY dải của nêm còn hẹp hơn nữa: mắt trên nền trắng nhạy
     với sắc độ hơn hẳn, nên một dải rộng làm khối màu trông bẩn chứ
     không trông có khối. Tấm mẫu chủ hệ gửi dùng khối màu gần như
     ĐẶC — chỉ một chút chuyển để không chết cứng. */
  var NEM_DAI = 0.12;
  function nemDai(k) { return k && k.giay ? 0.07 : NEM_DAI; }
  function mucTren(hex) {
    var s1 = doiSang(hex, NEM_DAI), s2 = doiSang(hex, -NEM_DAI);
    var t = Math.min(tuongPhan(MUC_TOI, s1), tuongPhan(MUC_TOI, s2));
    var w = Math.min(tuongPhan('#FFFFFF', s1), tuongPhan('#FFFFFF', s2));
    return t >= w ? MUC_TOI : '#FFFFFF';
  }
  /* Dòng phụ trên mảng màu dùng ĐÚNG mực ấy, không pha loãng.
     Làm mờ đi để tạo thứ bậc là cách rẻ tiền và nó ăn thẳng vào
     tương phản: mực đen 80% trên nền tầng chỉ còn 4,19:1, hụt ngưỡng.
     Thứ bậc dựng bằng CỠ CHỮ và ĐỘ ĐẬM — hai thứ không tốn một chút
     tương phản nào. */
  function mucPhuTren(hex) { return mucTren(hex); }

  /* Mực trên một mảng ĐẶC — so đúng màu ấy, không so hai đầu một dải.
     Vòng số của thẻ ngày tô đặc, mà tôi gọi nhầm hàm dành cho nêm
     chuyển sắc, nên nó chọn mực theo đầu tệ nhất của một dải không
     tồn tại và hụt ngưỡng 4,36 trên 4,5. Hai loại nền, hai hàm. */
  function mucTrenDac(hex) {
    return tuongPhan(MUC_TOI, hex) >= tuongPhan('#FFFFFF', hex)
      ? MUC_TOI : '#FFFFFF';
  }

  /* ── MẢNG ĐẶC MANG CHỮ NHỎ THÌ PHẢI LÀM SÂU ──
     Một sắc bão hoà tầm trung — tím #8B5CF6 là ví dụ rõ nhất — không
     mực nào đạt nổi 4,5:1 ở cỡ chữ nhỏ: trắng được 4,24, đen được
     4,27, cả hai đều hụt. Lần trước tôi giải bằng cách PHÓNG CHỮ TO
     cho lọt ngưỡng chữ lớn. Ở đây phóng không được — một cái chip
     nhãn không thể to bằng tiêu đề.
     Cách còn lại là làm SÂU chính mảng màu cho tới khi chữ trắng đủ
     tương phản. Vẫn là sắc ấy, chỉ đậm hơn — mà đậm hơn thì đúng cho
     một mảng đặc nhỏ, vì mảng nhỏ vốn cần nặng hơn để không trôi. */
  function nenDac(hex, canTP) {
    var can = canTP || 4.5;
    var t = hex;
    for (var i = 0; i < 14; i++) {
      if (tuongPhan('#FFFFFF', t) >= can) return t;
      t = doiSang(t, -0.09);
    }
    return t;
  }

  /* ── NHÃN TRÊN ──
     Dòng chữ nhỏ, viết hoa, giãn chữ rộng, đứng TRÊN tiêu đề. Việc
     của nó là nói tấm này thuộc loại gì trước khi mắt đọc tiêu đề —
     và nó là thứ tách một tấm có dựng khỏi một tấm chỉ gõ chữ to. */
  /* `neoChu` = neo theo CHỮ chứ theo vạch đỏ: chữ bắt đầu đúng ở x, còn
     vạch đỏ treo ra ngoài lề trái. Dùng khi nhãn đứng chung một đường
     dọc với tiêu đề bên dưới — neo theo vạch thì chữ nhãn thụt vào
     đúng bề rộng vạch cộng khoảng hở, và mắt đọc ra HAI đường trái ở
     một cột. Chỗ ấy đã hỏng thật trên áp phích: nhãn thụt 48 điểm ảnh
     so với tiêu đề. */
  function nhanTren(chu, x, y, k, co, neoChu) {
    var c = co || 17;
    var xV = neoChu ? Math.round(x - c * 0.95) : x;
    /* Ở chế độ neoChu, VẠCH ĐỎ cố ý treo ra ngoài lề — chỉ CHỮ đứng
       trên đường dọc. Nên dấu neo đặt lên thẻ <text>, không đặt lên cả
       cụm: hộp bao của cụm bắt đầu ở vạch, và phép đo đường dọc sẽ báo
       lệch đúng bằng bề rộng vạch cộng khoảng hở. Nó đã báo: 26 điểm
       ảnh, và nó báo đúng thứ nó nhìn thấy. */
    return '<g>' +
      '<rect x="' + xV + '" y="' + Math.round(y - c * 0.78) + '" width="' + Math.round(c * 0.28) +
        '" height="' + Math.round(c * 1.02) + '" rx="' + Math.round(c * 0.14) +
        '" fill="' + h(k.do) + '"/>' +
      '<text' + (neoChu ? ' class="gita-ray"' : '') +
        ' x="' + Math.round(xV + c * 0.95) + '" y="' + y + '" font-family="' + h(CHU_THAN) +
        '" font-size="' + c + '" font-weight="800" fill="' + h(k.gitaInk) +
        '" letter-spacing="' + (c * 0.16).toFixed(1) + '">' +
        h(String(chu).toUpperCase()) + '</text></g>';
  }

  /* ── DẢI BĂNG ──
     Một câu ngắn nằm trong một dải màu đặc, viết hoa. Ảnh mẫu chủ hệ
     gửi có đúng một dải như thế và nó gánh gần hết sức nặng của tấm:
     nó là chỗ DUY NHẤT có nền đặc, nên mắt dừng ở đó sau tiêu đề.
     Chỉ được MỘT dải một tấm — hai dải thì không dải nào còn là điểm
     dừng. */
  /* `giuaX` là TÂM dải. Trả về cả `rong` để chỗ gọi neo được dải theo
     lề trái: không trả ra thì chỗ gọi phải đoán bề rộng, mà đoán bề
     rộng của một dải co theo chữ thì luôn lệch. */
  function daiBang(chu, giuaX, y, k, rongToiDa) {
    var c = 22, g = idMoi('bang');
    var chuHoa = String(chu).toUpperCase();
    /* ── ĐO PHẢI KỂ CẢ GIÃN CHỮ ──
       doRong() hỏi canvas, mà canvas KHÔNG biết letter-spacing của thẻ
       <text>. Dải này giãn 0,10 lần cỡ chữ, nên với một câu ba mươi
       ký tự nó rộng thêm 66 điểm ảnh mà phép đo không thấy — chữ tràn
       ra ngoài hai đầu dải đúng 13 điểm ảnh mỗi bên. Nhìn thì chỉ thấy
       "dải hơi chật", không ai gọi được tên. Đo được ra thì thấy ngay.
       Cùng công thức với thuộc tính letter-spacing bên dưới, và hai
       chỗ ấy phải luôn đi cùng nhau. */
    var gian = 0.10;
    var rongChuThat = function (co) {
      return doRong(chuHoa, '800 ' + co + 'px ' + CHU_THAN) + chuHoa.length * co * gian;
    };
    var rong = rongChuThat(c) + c * 3.4;
    while (rong > rongToiDa && c > 12) {
      c -= 1; rong = rongChuThat(c) + c * 3.4;
    }
    rong = Math.round(rong);
    var ht = Math.round(c * 2.05);
    return {
      rong: rong,
      /* ── ĐẦU SÁNG CỦA DẢI PHẢI TỰ ĐẠT NGƯỠNG ──
         Bản trước dựng dải bằng doiSang(k.do, +0.14) → −0.24 quanh sắc
         đỏ đang chạy. Trên nền GIẤY thì đỏ đã sẫm nên chữ trắng thừa
         tương phản. Trên nền SÂU, k.do được làm sáng lên một nấc cho
         hợp nền — và dải sáng theo, nên chữ trắng tụt còn 4,11:1 trong
         khi ngưỡng là 4,5.
         Lỗi này nằm im suốt vì mặc định là nền giấy; đổi mặc định của
         áp phích sang nền sâu ở 9.99.29 thì phép đo tương phản bắt được
         ngay lượt chạy đầu.
         Nay ĐẦU SÁNG được ép sẫm cho tới khi chữ trắng đạt 4,6:1, rồi
         đầu tối dựng từ chính nó. Neo vào đầu XẤU NHẤT chứ không vào
         sắc gốc: một dải có hai đầu, và đầu này đọc được không có nghĩa
         đầu kia đọc được. */
      defs: (function () {
        var sang = nenDac(doiSang(k.do, 0.14), 4.6);
        return '<linearGradient id="' + g + '" x1="0" y1="0" x2="1" y2="0.6">' +
          '<stop offset="0%" stop-color="' + h(sang) + '"/>' +
          '<stop offset="100%" stop-color="' + h(doiSang(sang, -0.30)) + '"/>' +
          '</linearGradient>';
      })(),
      cao: ht,
      ve: '<g>' +
        '<rect x="' + Math.round(giuaX - rong / 2) + '" y="' + Math.round(y) +
          '" width="' + rong + '" height="' + ht + '" rx="' +
          Math.round(ht / 2) + '" fill="url(#' + g + ')"/>' +
        '<text x="' + giuaX + '" y="' + Math.round(y + ht * 0.685) +
          '" text-anchor="middle" font-family="' + h(CHU_THAN) + '" font-size="' + c +
          '" font-weight="800" fill="#FFFFFF" letter-spacing="' +
          (c * gian).toFixed(2) + '">' + h(chuHoa) + '</text></g>'
    };
  }

  /* Đọc các dòng ĐÁNH DẤU trong nội dung. Máy không đoán đâu là nhãn,
     đâu là dải băng — người viết gõ dấu ra. Cùng luật với lưới ô. */
  /* ── MỘT DANH SÁCH DẤU, MỘT CHỖ ──
     Bản trước bộ lọc dấu gõ tay đúng hai tên: NHÃN và BĂNG. Rồi thẻ
     ngày thêm ẢNH, PHỤ, ĐÓNG ĐINH, HÌNH — và bộ lọc không biết, nên
     dòng "HÌNH: nha" trôi vào thân bài và thành CÂU LỚN của tấm bìa.
     Tấm ấy in ra chữ "HÌNH: nha" to bằng nửa khổ.

     Lỗi này không phải quên một dòng — nó là hậu quả của việc có HAI
     nơi biết danh sách dấu: chỗ đọc và chỗ lọc. Hai bản của một sự
     thật thì bản nào cũng có ngày lệch. Nay một danh sách, cả hai
     đọc từ đó, và thêm dấu mới là sửa đúng một chỗ. */
  var DAU_DONG = ['NHÃN', 'BĂNG', 'ẢNH', 'PHỤ', 'HÌNH', 'HÌNH1', 'HÌNH2',
                  'ĐÓNG ĐINH',
                  /* Ba dấu của áp phích có người (9.99.24). BÊN nói người
                     đứng phía nào; THOẠI là bóng thoại; KÝ là câu viết tay
                     ở chân tấm. */
                  'BÊN', 'THOẠI', 'KÝ',
                  /* Dấu của sơ đồ toả (9.99.36). TÂM là chữ ở giữa —
                     một GIÁ TRỊ, nên nó dùng dạng dấu hai chấm; còn
                     NHÁNH mở một KHỐI nên nó nằm ở RE_KHOI bên dưới.
                     Kho này có đúng hai dạng dấu và lẫn hai dạng là
                     lỗi tôi vừa mắc: gõ "TÂM |" thì docDau không thấy,
                     và bộ vẽ từ chối một nội dung đúng ý. */
                  'TÂM'];
  function docDau(chu, dau) {
    var re = new RegExp('^\\s*' + dau + '\\s*:\\s*(.+)$', 'im');
    var m = re.exec(String(chu || ''));
    return m ? m[1].trim() : '';
  }
  var RE_DAU = new RegExp('^\\s*(?:' +
    DAU_DONG.slice().sort(function (a, b) { return b.length - a.length; })
      .join('|') + ')\\s*:', 'i');
  /* ── DẤU MỞ KHỐI CŨNG PHẢI LỌC KHỎI THÂN BÀI ──
     DAU_DONG chỉ gom loại dấu "TÊN:" — nó không biết loại dấu thứ hai
     của kho này: "TÊN | …", dùng cho lưới ô, tầng, bước, cột, cổng.
     Hậu quả thấy được: bỏ dòng PHỤ ra khỏi một áp phích thì câu phụ
     rơi xuống đoạn kế tiếp, mà đoạn ấy là năm dòng "Ô | …" — và tấm
     in ra nguyên văn "Ô | Bộ test đầu vào | Cho cả học viên..." làm
     câu phụ.
     Đúng lớp lỗi của vụ "HÌNH: nha" ở 9.99.22, quay lại ở loại dấu
     thứ hai. Hai loại dấu, hai biểu thức, và cả hai phải lọc. */
  var RE_KHOI = /^\s*(?:Ô|TẦNG\s*\d+|BƯỚC\s*\d+|TRÁI|PHẢI|VAI|NHÓM|CỔNG|SỐ|CỘT|NHÁNH)\s*\|/i;
  function boDau(chu) {
    return String(chu || '').split('\n')
      .filter(function (d) { return !RE_DAU.test(d) && !RE_KHOI.test(d); })
      .join('\n').replace(/\n{3,}/g, '\n\n').trim();
  }

  /* Chữ chuyển sắc — cùng ngôn ngữ với .grad-text của giao diện:
     xanh sâu → xanh → đỏ. Chỉ dùng cho MỘT câu trong tấm; hai câu
     chuyển sắc thì không câu nào còn là câu chính. */
  function defChuSac(k) {
    var id = idMoi('chusac');
    /* ── DẢI CHUYỂN SẮC PHẢI ĐỌC ĐƯỢC Ở CẢ HAI ĐẦU ──
       Trên nền sáng, dải chạy xanh-sâu → xanh → đỏ-sẫm: cả ba chặng
       đều tối, đều nổi trên nền trắng.
       Lật sang nền SÂU mà giữ nguyên ba chặng ấy thì đầu cuối chìm
       hẳn — phép đo tương phản bắt được 2,17:1 ở câu TO NHẤT của
       tấm, tức là chỗ tệ nhất có thể tệ. Trên nền sâu dải phải chạy
       ngược: sáng → sáng hơn → hồng sáng. */
    var a = k.sau ? doiSang(k.gita, 0.42) : k.gitaSau;
    var b = k.sau ? '#EAF1FC' : k.gita;
    var c = k.sau ? doiSang(k.do, 0.42) : k.doInk;
    return {id: id, defs:
      '<linearGradient id="' + id + '" x1="0" y1="0" x2="1" y2="0.35">' +
        '<stop offset="0%" stop-color="' + h(a) + '"/>' +
        '<stop offset="52%" stop-color="' + h(b) + '"/>' +
        '<stop offset="100%" stop-color="' + h(c) + '"/>' +
      '</linearGradient>'};
  }

  /* ── ĐO CHỮ THẬT, KHÔNG ĐẾM KÝ TỰ ──
     Bản đầu tôi định ngắt dòng bằng cách đếm ký tự. Sai với tiếng
     Việt: dấu mũ và dấu thanh không thêm bề ngang, còn "M" với "i"
     thì hơn nhau gấp ba. Canvas đo bằng đúng bộ chữ đang tải nên
     dòng ngắt đúng chỗ mắt thấy. */
  var doBoi = null;
  function doRong(chu, font) {
    if (!doBoi && typeof document !== 'undefined')
      doBoi = document.createElement('canvas').getContext('2d');
    if (!doBoi) return String(chu).length * 8;   /* chạy ngoài trình duyệt */
    doBoi.font = font;
    return doBoi.measureText(String(chu)).width;
  }

  /* ── CHỪA MỘT SỢI TÓC, VÌ CANVAS VÀ TRÌNH DUYỆT ĐO HAI THỨ KHÁC NHAU ──
     measureText trả về BỀ TIẾN: con trỏ chạy được bao xa. Còn hộp bao
     mà trình duyệt vẽ ra là bề MỰC: phần nét thật sự phủ. Hai cái lệch
     nhau ở chữ cuối dòng, vì nét của nhiều con chữ nhô ra ngoài bề
     tiến của chính nó — đuôi chữ, và với tiếng Việt là cả dấu mũ dấu
     thanh nằm chếch sang bên.
     Đo được ra: dòng phụ của áp phích vượt lề phải 1,09 điểm ảnh trong
     khi phép ngắt dòng tin là nó vừa khít. Một điểm ảnh thì không ai
     chỉ ra được, nhưng nó là chữ nằm NGOÀI lề, và lề là thứ duy nhất
     giữ cho một trang trông có người dựng.
     Chừa 6% cỡ chữ: đủ phủ phần mực nhô ra ở mọi cỡ đang dùng, và nhỏ
     hơn một khoảng trắng nên không đổi chỗ ngắt của dòng nào đang vừa. */
  /* ── PHẦN MỰC NHÔ RA TRƯỚC ĐIỂM ĐẶT ──
     Đặt <text x="440"> thì 440 là điểm ĐẶT BÚT, không phải mép trái của
     nét. Với chữ đứng hai cái gần trùng nhau; với chữ NGHIÊNG thì không:
     nét chữ đổ sang trái nên mực bắt đầu trước điểm đặt.
     Đo được ra: câu ký Playfair nghiêng của áp phích nằm ở 438 trong
     khi cả cột ở 440. Hai điểm ảnh, và mắt đọc ra đúng cái nó là — một
     dòng thò ra khỏi hàng. */
  function nhoTrai(chu, font) {
    if (!doBoi && typeof document !== 'undefined')
      doBoi = document.createElement('canvas').getContext('2d');
    if (!doBoi) return 0;
    try {
      doBoi.font = font;
      return Math.max(0, doBoi.measureText(String(chu)).actualBoundingBoxLeft || 0);
    } catch (e) { return 0; }
  }

  /* ── ĐO MỰC, KHÔNG ĐO Ô CHỮ ──
     Ô chữ (em box) của một dòng cao đúng bằng cỡ chữ, và mọi phép
     tính chiều cao trong tệp này từ trước tới nay đều tính theo ô ấy.
     MỰC thì không nằm gọn trong ô: tiếng Việt chồng hai tầng dấu lên
     một nguyên âm — "Ầ" là A + mũ + huyền, trồi lên trên ô; "Ạ" thõng
     một chấm xuống dưới ô.

     Chỗ này hỏng thật, và hỏng ở đúng tấm chủ hệ đang xem: áp phích
     "BẢY NGÀY / ĐẦU" xếp hai dòng cách nhau 1,10 lần cỡ chữ, và mũ
     của "Ầ" dòng dưới ĐÈ lên dấu nặng của "Ạ" dòng trên. Bộ kiểm xanh
     toàn bộ, vì không phép đo nào hỏi tới mực — chỉ hỏi tới ô.

     Cùng một lớp lỗi với `nhoTrai`: ở đó là mực TRÀN SANG TRÁI của
     chữ nghiêng, ở đây là mực TRÀN LÊN TRÊN của dấu tiếng Việt. Đo
     một chiều rồi quên chiều kia. */
  function mucDoc(chu, font) {
    var mCo = /(\d+(?:\.\d+)?)px/.exec(String(font));
    var co = mCo ? Number(mCo[1]) : 16;
    /* Không đo được thì lấy số rộng rãi, KHÔNG lấy số sát — đoán sát
       thì trở lại đúng chỗ vừa sửa. */
    var duPhong = {tren: co * 0.92, duoi: co * 0.26};
    if (!doBoi && typeof document !== 'undefined')
      doBoi = document.createElement('canvas').getContext('2d');
    if (!doBoi) return duPhong;
    try {
      doBoi.font = font;
      var m = doBoi.measureText(String(chu || ''));
      if (!(m.actualBoundingBoxAscent >= 0)) return duPhong;
      return {tren: m.actualBoundingBoxAscent,
              duoi: Math.max(0, m.actualBoundingBoxDescent || 0)};
    } catch (e) { return duPhong; }
  }

  function catDong(chu, font, rongToiDa) {
    var mCo = /(\d+(?:\.\d+)?)px/.exec(String(font));
    var chua = mCo ? Number(mCo[1]) * 0.06 : 1;
    var tran = rongToiDa - chua;
    var tu = String(chu || '').trim().split(/\s+/), dong = [], nay = '';
    for (var i = 0; i < tu.length; i++) {
      var thu = nay ? nay + ' ' + tu[i] : tu[i];
      if (nay && doRong(thu, font) > tran) { dong.push(nay); nay = tu[i]; }
      else nay = thu;
    }
    if (nay) dong.push(nay);
    return dong;
  }

  /* Bó chữ thành mấy thẻ <text>. Trả về cả CHIỀU CAO đã dùng để chỗ
     gọi xếp phần dưới — không có nó thì mọi bố cục phải đoán, và đoán
     sai một dòng là chữ đè lên nhau. */
  /* ── MỘT KHỐI CHỮ, ĐO TRƯỚC KHI VẼ ──
     Tách phần ĐO ra khỏi phần VẼ vì chỗ gọi cần biết khối cao bao
     nhiêu TRƯỚC khi quyết định đặt nó ở đâu — và cho tới nay mỗi chỗ
     gọi tự nhân `số dòng × cỡ × giãn` một lần nữa. Hai bản chép của
     một phép tính thì có ngày lệch nhau, và ngày ấy chữ đè lên chữ.

     Bước dòng NỚI RA khi mực đòi, không bao giờ bóp lại: dòng nào chỉ
     có chữ thường thì mực nằm gọn trong ô và bước đúng bằng số cũ —
     nên mọi bố cục đang vừa vẫn vừa y như trước. */
  function khoiChu(chu, o) {
    var font = (o.dam || 600) + ' ' + o.co + 'px ' + o.chu;
    var dong = catDong(chu, font, o.rong);
    var buoc = o.co * (o.gian || 1.28);
    var ho = o.co * 0.05;          /* hở tối thiểu giữa mực hai dòng */
    var muc = dong.map(function (d) { return mucDoc(d, font); });
    var yDong = [0], dang = 0;
    for (var i = 1; i < dong.length; i++) {
      dang += Math.max(buoc, muc[i - 1].duoi + muc[i].tren + ho);
      yDong.push(dang);
    }
    return {dong: dong, font: font, yDong: yDong, buoc: buoc,
            cao: dang + buoc, soDong: dong.length,
            tren: dong.length ? muc[0].tren : 0,
            duoi: dong.length ? muc[dong.length - 1].duoi : 0};
  }

  function veChu(chu, x, y, o) {
    var kh = khoiChu(chu, o);
    var font = kh.font, dong = kh.dong;
    var can = o.can || 'start';
    var ra = dong.map(function (d, i) {
      return '<text x="' + x + '" y="' + (y + kh.yDong[i]).toFixed(1) + '" ' +
        'font-family="' + h(o.chu) + '" font-size="' + o.co + '" ' +
        'font-weight="' + (o.dam || 600) + '" fill="' + h(o.mau) + '" ' +
        'text-anchor="' + can + '"' +
        (o.gianChu ? ' letter-spacing="' + o.gianChu + '"' : '') +
        '>' + h(d) + '</text>';
    }).join('');
    return {svg: ra, cao: kh.cao, soDong: kh.soDong,
            tren: kh.tren, duoi: kh.duoi};
  }

  var CHU_TIEU = '"Playfair Display", Georgia, serif';
  var CHU_THAN = '"Be Vietnam Pro", system-ui, sans-serif';

  /* Dấu GITA ở góc — cùng một chỗ trên mọi tấm. Nhận diện không phải
     là dán logo to, mà là ĐẶT ĐÚNG MỘT CHỖ qua tất cả các tấm. */
  /* ── DẤU GITA PHẢI CO THEO TỜ GIẤY ──
     Tới 9.99.32 dấu này vẽ ở cỡ điểm ảnh CỐ ĐỊNH — vòng bán kính 15,
     tên 17px, dòng dưới 10,5px — bất kể tấm rộng bao nhiêu. Trên tấm
     màn hình 1080 thì vừa. Trên tờ A4 rộng 2480 thì nó là một vết
     nhỏ, và dòng "HỆ SINH THÁI GIA ĐÌNH THỊNH VƯỢNG" ra 0,89mm: dấu
     nhận diện của Học viện in ra không đọc được.
     Phép đo chữ-theo-milimét của luật C22 bắt đúng chỗ này ngay lượt
     chạy đầu — và nó chỉ lộ ra ở khổ in, vì trên màn hình mọi khổ đều
     quanh 1080 nên sai số không bao giờ hiện.

     Mốc là 1200 chứ không phải 1080: bốn khổ màn hình rộng 1080–1200,
     lấy 1200 thì cả bốn ra tỉ lệ đúng 1 và không tấm nào đang chạy bị
     đổi. Khổ in thì nới thêm cho tới khi dòng nhỏ nhất của dấu đạt
     ngưỡng đọc được — luật là luật, dấu thương hiệu không có ngoại lệ. */
  var DAU_CHU_NHO = 10.5;

  /* ── CỠ CHỮ THẬT, KHÔNG PHẢI CỠ GHI TRONG THẺ ──
     Bản đầu của phép đo chữ-theo-milimét đọc thẳng thuộc tính
     `font-size` rồi lấy số nhỏ nhất. Sai, và sai theo kiểu tệ nhất:
     nó báo đỏ một tấm ĐÚNG. Dấu GITA nằm trong một nhóm có scale(),
     nên chữ 10,5 ghi trong thẻ ra 24,8 điểm ảnh thật — đọc thuộc
     tính mà bỏ phép biến hình bao ngoài là đo một con số không phải
     con số người xem thấy.
     Cùng lớp lỗi với phép đo mực ở 9.99.31, chỗ phải hỏi getCTM()
     thay vì đọc x/y: toạ độ và cỡ trong SVG luôn là toạ độ TRONG
     nhóm, không phải trong tấm. */
  function coChuNhoNhat(svg) {
    var nho = null, ngan = [1];
    var re = /<(\/?)(g|text)\b([^>]*)>/g, m;
    while ((m = re.exec(svg))) {
      if (m[2] === 'g') {
        if (m[1]) { if (ngan.length > 1) ngan.pop(); }
        else {
          var s = /scale\(([\d.]+)/.exec(m[3]);
          ngan.push(ngan[ngan.length - 1] * (s ? Number(s[1]) : 1));
        }
      } else if (!m[1]) {
        var c = /font-size="([\d.]+)"/.exec(m[3]);
        if (c) {
          var v = Number(c[1]) * ngan[ngan.length - 1];
          if (v > 0 && (nho === null || v < nho)) nho = v;
        }
      }
    }
    return nho;
  }

  function tiDau(kg) {
    var t = (kg && kg.w) ? Math.max(1, kg.w / 1200) : 1;
    if (kg && kg.in)
      t = Math.max(t, (CHU_NHO_NHAT_MM * kg.dpi / MM_MOI_TAC) / DAU_CHU_NHO);
    return t;
  }
  function dauGita(k, x, y, kg) {
    var ti = tiDau(kg);
    return '<g transform="translate(' + x + ',' + y + ')' +
      (ti !== 1 ? ' scale(' + ti.toFixed(4) + ')' : '') + '">' +
      '<circle cx="0" cy="0" r="15" fill="none" stroke="' + h(k.gita) +
        '" stroke-width="2"/>' +
      '<circle cx="0" cy="0" r="5" fill="' + h(k.do) + '"/>' +
      /* Lớp `gita-dau` để phép dựng CHỮ THAY ẢNH nhận ra hai dòng
         này là DẤU THƯƠNG HIỆU, không phải nội dung của tấm. Khai ra
         chứ không để chỗ kia dò theo chuỗi chữ: dò theo chuỗi là giữ
         một bản chép của hai câu này ở chỗ thứ hai, và bản chép thì
         không đổi theo khi câu gốc đổi. */
      '<text class="gita-dau" x="26" y="-2" font-family="' + h(CHU_THAN) + '" font-size="17" ' +
        'font-weight="800" fill="' + h(k.sau ? k.muc : k.gitaSau) +
        '" letter-spacing="1.6">GITA 365</text>' +
      '<text class="gita-dau" x="26" y="15" font-family="' + h(CHU_THAN) + '" font-size="10.5" ' +
        'font-weight="600" fill="' + h(k.sau ? k.muc2 : k.muc3) + '" letter-spacing="1.1">' +
        'HỆ SINH THÁI GIA ĐÌNH THỊNH VƯỢNG</text></g>';
  }

  /* ═══════════ DÒNG TRUY NGUỒN ═══════════

     Dấu ở góc nói tấm này CỦA AI. Dòng này nói tấm này LÀ TẤM NÀO.

     Một tấm rời khỏi hệ rồi thì nó đi một mình. Lúc nó hiện lên ở một
     chỗ không ai ngờ, câu hỏi đầu tiên luôn là "tấm này ra khỏi hệ lúc
     nào, qua cửa nào" — mà kho có hàng trăm tấm cùng loại hình, cùng
     bảng màu, nhìn thì y hệt nhau.

     ── CHỈ MÃ, KHÔNG TÊN NGƯỜI ──
     Tấm đi tới tay khách. Đặt tên người xuất lên tấm là đưa một nhân sự
     ra trước mặt người lạ, để đổi lấy thứ mà nhật ký TG_XUAT đã giữ rồi.
     Mã dẫn về sổ; sổ mới nói tên. Ai đọc được sổ thì mới biết tên, và
     đó đúng là người cần biết.

     ── CỠ CHỮ ĐI THEO tiDau() ──
     Cùng phép nâng cỡ với dấu thương hiệu, nên trên khổ in nó vẫn đạt
     2,1mm của luật C22. Đặt cỡ cứng thì trên tấm A4 dòng này nhỏ hơn
     ngưỡng đọc được — và một dòng truy nguồn đọc không ra thì nó không
     truy được nguồn, nó chỉ là một vệt bẩn ở mép tấm. */
  function dongTruyNguon(x, kg, k) {
    var ti = tiDau(kg);
    /* ── CỠ GỐC PHẢI ĐÚNG BẰNG DAU_CHU_NHO, KHÔNG ĐƯỢC NHỎ HƠN ──
       tiDau() nâng cỡ sao cho một chữ DAU_CHU_NHO điểm ảnh đạt đúng
       2,1mm khi in. Bản đầu tôi đặt cỡ gốc 8,5 cho dòng này nhạt đi —
       và phép đo bản in bắt ngay: 8,5/10,5 × 2,1 = 1,70mm, dưới ngưỡng
       C22. Muốn nhạt thì hạ ĐỘ ĐỤC, đừng hạ cỡ chữ: độ đục không đổi
       theo khổ in, còn cỡ chữ thì đổi. */
    var co = DAU_CHU_NHO * ti;
    /* Ngày thôi, không giờ phút. Giờ phút trên tấm là một mức chi tiết
       không giúp gì cho việc lần về sổ — sổ có sẵn giờ — mà lại nói
       cho người ngoài biết nhịp làm việc của Học viện. */
    var ngay = new Date().toISOString().slice(0, 10);
    var dong = String(x.id || '') +
      (Number(x.ban) > 1 ? ' · b' + Number(x.ban) : '') + ' · ' + ngay;
    /* ── LỀ PHẢI ĐỦ CHO MÁY XÉN GIẤY ──
       Khổ in có sai số xén; luật của kho đòi chữ cách mép ít nhất 5mm.
       Bản đầu tôi lấy lề dọc bằng 55% lề ngang cho dòng này nằm sát
       đáy — ra 4,0mm, và phép đo bản in bắt. Nay lề dọc KHÔNG nhỏ hơn
       lề ngang, và cả hai đều bị nâng lên tối thiểu 5mm khi in. */
    var le = Math.round(kg.w * 0.028);
    /* Cộng thêm phần ĐUÔI CHỮ tụt xuống dưới đường chân: y là đường chân,
       còn hộp bao thì chạy quá nó. Phép đo bản in đo HỘP BAO, nên tính lề
       theo đường chân là tính thiếu đúng phần đuôi. */
    if (kg.in) le = Math.max(le, Math.ceil(LE_XEN_MM * kg.dpi / MM_MOI_TAC + co * 0.3));
    /* Mực nhạt nhất của bảng đang dùng, không phải một mã tự đặt: dòng
       này phải đọc được nhưng không được tranh chỗ với nội dung. */
    var muc = k.muc3 || k.muc2 || k.muc;
    return '<text class="gita-truy" x="' + (kg.w - le) + '" y="' +
      (kg.h - le) + '" text-anchor="end" ' +
      'font-family="' + h(CHU_THAN) + '" font-size="' + co.toFixed(2) + '" ' +
      'font-weight="500" fill="' + h(muc) + '" opacity="0.62" ' +
      'letter-spacing="0.4">' + h(dong) + '</text>';
  }

  function khung(kg, k, ruot, defs) {
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + kg.w + ' ' +
      kg.h + '" width="' + kg.w + '" height="' + kg.h + '" role="img">' +
      '<defs>' + (defs || '') + '</defs>' +
      '<rect width="' + kg.w + '" height="' + kg.h + '" fill="' + h(k.nen) + '"/>' +
      ruot + '</svg>';
  }

  /* Gom các mảnh (mỗi mảnh là {defs, ve}) thành một cặp. Viết tay
     việc nối defs ở từng bộ vẽ là chỗ quên chắc chắn xảy ra: quên một
     defs thì hình vẫn vẽ ra, chỉ mất chuyển sắc — im lặng đúng kiểu
     khó thấy nhất. */
  function gom(ds) {
    return {defs: ds.map(function (x) { return x.defs || ''; }).join(''),
            ve: ds.map(function (x) { return x.ve || ''; }).join('')};
  }

  /* Câu đầu của nội dung. Tấm bìa nói MỘT câu — câu đầu là câu chủ hệ
     đặt lên đầu, nên đó là câu ấy. Không tự chọn câu nào "hay hơn". */
  function cauDau(chu) {
    return String(chu || '').trim().split(/\n\s*\n/)[0].trim();
  }
  function cauHai(chu) {
    var d = String(chu || '').trim().split(/\n\s*\n/);
    return d.length > 1 ? d[1].trim() : '';
  }

  /* ═══════════ BỘ VẼ · BÌA ═══════════
     Một câu lớn, một dấu, một dòng phụ. Không hơn. Bìa mà có ba khối
     chữ thì mắt không biết đọc khối nào trước, và tấm ấy hỏng đúng
     nhiệm vụ duy nhất của nó. */
  function veBia(x, kg, che) {
    /* Có dòng ẢNH thì đây là THẺ NGÀY — khuôn ấn phẩm định kỳ của
       chủ hệ. Không có thì vẫn là tấm bìa một câu như cũ. Một loại
       hình, hai khuôn, chọn bằng nội dung chứ không bằng một mã mới. */
    var maAnh = docDau(x.noiDung, 'ẢNH');
    if (maAnh) {
      if (!ANH_NGUOI[maAnh]) return {ok: false,
        error: 'Chỉ nhận ảnh đã có trong kho: ' + Object.keys(ANH_NGUOI).join(', ') +
               '. Bộ vẽ KHÔNG nhận đường dẫn ảnh tự do — nhận được thì bất kỳ ' +
               'ảnh nào cũng vào được một ấn phẩm mang dấu GITA, và luật ảnh ' +
               'của thương hiệu thành một câu trong sổ.'};
      return veTheNgay(x, kg, che, maAnh);
    }
    var k = bang(che);
    var chu = boDau(x.noiDung);
    var nhan = docDau(x.noiDung, 'NHÃN'), bang2 = docDau(x.noiDung, 'BĂNG');
    var cau = cauDau(chu), phu = cauHai(chu);
    if (!cau) return {ok: false, error: 'Nội dung rỗng — không có câu nào để đặt lên bìa.'};

    var maHinh = docDau(x.noiDung, 'HÌNH');
    if (maHinh && !NGUOI[maHinh]) return {ok: false,
      error: 'Không có hình người tên "' + maHinh + '". Đang có: ' +
             Object.keys(NGUOI).join(', ') + '.'};
    var le = Math.round(kg.w * 0.085);
    /* Có hình thì chữ lùi vào một cột, nhường cột phải cho hình —
       chữ chạy dưới hình là chữ đọc trên một cái nền có nét. */
    var rong = kg.w - le * 2 - (maHinh ? Math.round(kg.w * 0.30) : 0);
    /* Cỡ chữ co lại cho tới khi câu vừa BỐN dòng. Đặt cỡ cứng thì câu
       dài tràn khỏi tấm, mà tràn thì không ai thấy lúc vẽ — chỉ thấy
       lúc đã dán lên giao diện. */
    var co = Math.round(kg.w / 21), dong;
    for (;;) {
      dong = catDong(cau, '600 ' + co + 'px ' + CHU_TIEU, rong);
      if (dong.length <= 4 || co <= 20) break;
      co -= 2;
    }
    /* ── CĂN CẢ KHỐI, KHÔNG CĂN RIÊNG CÂU CHÍNH ──
       Bản đầu chỉ căn giữa câu chính rồi thả dòng phụ xuống dưới, nên
       tấm nào có dòng phụ cũng lệch lên và hở một mảng dưới. Đo cả
       khối (câu + khoảng + phụ) rồi căn giữa VÙNG NẰM TRÊN dấu GITA —
       căn giữa cả tấm thì khối chữ đè vào dấu. */
    /* Dòng phụ 0,34 lần câu chính là quá nhỏ trên khổ ngang: câu
       chính 43px thì phụ chỉ còn 14px, bằng chú thích chứ không bằng
       một câu người ta đọc. Nó là câu THỨ HAI của tấm, không phải
       một dòng chú. */
    var coPhu = Math.round(co * 0.42);
    var caoCau = dong.length * co * 1.24;
    var caoPhu = phu
      ? co * 0.5 + catDong(phu, '500 ' + coPhu + 'px ' + CHU_THAN, rong).length *
        coPhu * 1.45
      : 0;
    /* Nhãn trên và dải băng chiếm chỗ THẬT, nên phải vào phép tính căn
       giữa. Vẽ xong mới nhớ ra là chúng có chiều cao thì cả khối đã
       lệch — đúng lớp lỗi đã sửa hai lần trước ở tấm bìa và lưới ô. */
    var caoNhan = nhan ? Math.round(co * 0.86) : 0;
    var dbang = bang2 ? daiBang(bang2, Math.round(kg.w / 2), 0, k, rong) : null;
    var caoBang = dbang ? dbang.cao + Math.round(co * 0.55) : 0;

    /* ── KHỐI CHỮ VÀ HÌNH PHẢI CÙNG MỘT TRỤC NGANG ──
       Bản trước căn khối chữ vào giữa VÙNG TRÊN dấu GITA, còn hình
       thì căn vào giữa TẤM. Hai trục khác nhau, nên tấm trông như
       chữ tụt lên còn hình tụt xuống — mỗi phần đều cân, mà đặt
       cạnh nhau thì lệch.
       Khi có hình: neo tâm khối chữ vào đúng tâm hình. Không có
       hình: giữ cách cũ, căn giữa vùng trên dấu. */
    var dayVung = kg.h - Math.round(kg.h * 0.085) - 34;   /* chừa chỗ dấu GITA */
    var caoKhoi = caoNhan + caoCau + caoPhu + caoBang;
    var dinh = maHinh
      ? Math.round(kg.h * 0.48 - caoKhoi / 2) + caoNhan + co * 0.32
      : Math.round((dayVung - caoKhoi) / 2) + caoNhan + co * 0.32;

    var nen = lopNen(kg, k);
    var cs = defChuSac(k);
    var t = veChu(cau, le, dinh, {co: co, chu: CHU_TIEU, dam: 600,
      mau: 'url(#' + cs.id + ')', rong: rong, gian: 1.24});
    var o = nen.ve +
      '<rect x="0" y="0" width="' + kg.w + '" height="6" fill="' + h(k.gita) + '"/>';
    o += nhan
      ? nhanTren(nhan, le, Math.round(dinh - co * 1.16), k, Math.round(co * 0.34))
      : '<rect x="' + le + '" y="' + Math.round(dinh - co * 1.02) +
        '" width="52" height="4" rx="2" fill="' + h(k.do) + '"/>';
    o += t.svg;
    var day = dinh + t.cao;
    if (phu) {
      o += veChu(phu, le, day + co * 0.5, {co: coPhu,
        chu: CHU_THAN, dam: 500, mau: k.muc2, rong: rong, gian: 1.45}).svg;
      day += caoPhu;
    }
    if (dbang) {
      dbang = daiBang(bang2, Math.round(kg.w / 2), Math.round(day + co * 0.55), k, rong);
      o += dbang.ve;
    }
    if (maHinh) {
      /* Hình đứng trong một đĩa màu ở cột phải, căn giữa theo chiều
         dọc của cả tấm — nó là điểm tựa thị giác, không phải một
         mẩu trang trí thả vào góc. */
      var sacH = (sacTang()[0] || {hex: k.gita}).hex;
      var rD2 = Math.round(kg.h * 0.30);
      var cxH = kg.w - le - rD2;
      o += '<circle cx="' + cxH + '" cy="' + Math.round(kg.h * 0.48) + '" r="' + rD2 +
        '" fill="' + h(sacH) + '" fill-opacity="' + (k.sau ? '0.20' : '0.11') + '"/>';
      o += veNet('nguoi', maHinh, cxH, Math.round(kg.h * 0.48),
        Math.round(rD2 * 1.42), sacH);
    }
    o += dauGita(k, le + Math.round(15 * tiDau(kg)), kg.h - Math.round(kg.h * 0.085), kg);
    return {ok: true, svg: khung(kg, k, o,
      nen.defs + cs.defs + (dbang ? dbang.defs : ''))};
  }

  /* ═══════════ BỘ VẼ · MỘT CON SỐ ═══════════
     Loại hình này chỉ có một việc: cho thấy MỘT con số. Nên nó phải
     tìm được con số ấy TRONG nội dung. Không tìm thấy thì DỪNG, chứ
     không vẽ một tấm có chỗ trống hình con số — luật C10, không tự
     suy diễn thứ chủ hệ chưa viết ra. */
  var SO_CHU = {
    'một triệu': '1.000.000', 'mot trieu': '1.000.000',
    'một nghìn': '1.000', 'một trăm': '100', 'mười nghìn': '10.000',
    'trăm nghìn': '100.000', 'một tỷ': '1.000.000.000'
  };
  function timSo(chu) {
    var t = String(chu || '');
    for (var k in SO_CHU)
      if (t.toLowerCase().indexOf(k) >= 0) return {so: SO_CHU[k], goc: k};
    /* Số viết bằng chữ số, kể cả có dấu chấm/phẩy phân nhóm. Bỏ qua
       số dính chữ (365 trong "GITA 365") bằng cách đòi ít nhất hai
       chữ số VÀ không đứng ngay sau một chữ cái. */
    var m = t.match(/(?:^|[^\wÀ-ỹ])(\d{1,3}(?:[.,]\d{3})+|\d{2,})(?![\wÀ-ỹ])/);
    return m ? {so: m[1], goc: m[1]} : null;
  }

  function veMotSo(x, kg, che) {
    var k = bang(che);
    var chu = boDau(x.noiDung);
    var nhan = docDau(x.noiDung, 'NHÃN'), bang2 = docDau(x.noiDung, 'BĂNG');
    var s = timSo(chu + ' ' + x.nhiemVu);
    if (!s) return {ok: false,
      error: 'Loại hình MỘT CON SỐ mà trong nội dung không có con số nào. ' +
             'Máy không tự nghĩ ra một con số để lấp chỗ — viết con số vào ' +
             'nội dung rồi vẽ lại.'};

    var cau = cauDau(chu), le = Math.round(kg.w * 0.085);
    var rong = kg.w - le * 2;
    var coSo = Math.round(kg.w / 6.2);
    while (doRong(s.so, '800 ' + coSo + 'px ' + CHU_THAN) > rong && coSo > 40) coSo -= 4;

    var giua = Math.round(kg.w / 2), dinh = Math.round(kg.h * 0.44);
    var nen = lopNen(kg, k);
    var cs = defChuSac(k);
    var o = nen.ve +
      '<rect x="0" y="0" width="' + kg.w + '" height="6" fill="' + h(k.gita) + '"/>' +
      /* Nhãn trên đứng cùng lề với dấu GITA ở góc dưới, nên hai đầu
         tấm neo vào một đường dọc — mắt đọc ra là tấm có trục, chứ
         không phải mấy khối rời thả vào giữa. */
      (nhan ? nhanTren(nhan, le, Math.round(dinh - coSo * 0.92), k, 18) : '') +
      '<text x="' + giua + '" y="' + dinh + '" text-anchor="middle" ' +
        'font-family="' + h(CHU_THAN) + '" font-size="' + coSo + '" font-weight="800" ' +
        'fill="url(#' + cs.id + ')" letter-spacing="-2">' + h(s.so) + '</text>' +
      '<rect x="' + (giua - 26) + '" y="' + Math.round(dinh + coSo * 0.22) +
        '" width="52" height="4" rx="2" fill="' + h(k.do) + '"/>';
    o += veChu(cau, giua, Math.round(dinh + coSo * 0.62), {co: Math.round(kg.w / 42),
      chu: CHU_THAN, dam: 500, mau: k.muc2, rong: Math.round(rong * 0.9),
      gian: 1.5, can: 'middle'}).svg;
    o += dauGita(k, le + Math.round(15 * tiDau(kg)), kg.h - Math.round(kg.h * 0.085), kg);
    return {ok: true, svg: khung(kg, k, o, nen.defs + cs.defs)};
  }

  /* ═══════════ BỘ VẼ · BẢN ĐỒ HÀNH TRÌNH ═══════════
     Năm chặng đọc thẳng từ G.HP_TANG — bảng giá đã chốt, KHÔNG chép
     lại thành một danh sách riêng ở đây. Chép ra là ngày nào đó bảng
     giá đổi mà tấm hình vẫn vẽ bản cũ. */
  function veBanDo(x, kg, che) {
    var k = bang(che);
    var ds = (G.HP_TANG || []).slice(0, 5);
    if (!ds.length) return {ok: false,
      error: 'Chưa mở được bảng chặng (G.HP_TANG). Bản đồ hành trình vẽ từ ' +
             'bảng ấy chứ không từ một danh sách chép tay.'};

    var le = Math.round(kg.w * 0.075), rong = kg.w - le * 2;
    /* ── MỐC ĐỨNG GIỮA Ô, KHÔNG ĐỨNG Ở HAI ĐẦU ĐƯỜNG ──
       Bản đầu đặt mốc thứ nhất ở đúng mép trái và mốc cuối ở đúng mép
       phải. Nhãn dưới mốc căn GIỮA, nên nửa nhãn của hai mốc ngoài
       cùng đổ hẳn ra ngoài tấm — chạy demo mới thấy, vì bộ vẽ không
       báo lỗi khi chữ tràn, nó cứ vẽ.
       Chia đường thành N ô đều rồi đặt mốc ở tâm mỗi ô thì mọi nhãn
       đều có đủ nửa ô ở cả hai bên, kể cả nhãn đầu và cuối. */
    var o1 = rong / ds.length;
    var viTriX = function (i) { return Math.round(le + o1 * (i + 0.5)); };
    var buoc = o1;
    var truc = Math.round(kg.h * 0.46);
    var dang = String(x.tang || '').toUpperCase();

    var nen = lopNen(kg, k);
    var bong = defBong(k);
    var cs = defChuSac(k);
    var o = nen.ve +
      '<rect x="0" y="0" width="' + kg.w + '" height="6" fill="' + h(k.gita) + '"/>';
    o += veChu(x.nhiemVu, le, Math.round(kg.h * 0.17), {co: Math.round(kg.w / 30),
      chu: CHU_TIEU, dam: 600, mau: 'url(#' + cs.id + ')', rong: rong, gian: 1.25}).svg;
    o += '<line x1="' + viTriX(0) + '" y1="' + truc + '" x2="' + viTriX(ds.length - 1) +
      '" y2="' + truc + '" stroke="' + h(k.vien) + '" stroke-width="3"/>';

    ds.forEach(function (t, i) {
      var cx = viTriX(i);
      var day = (t.tang === dang);
      /* Mốc nhận bóng đổ nên nó NỔI TRÊN đường kẻ, chứ không nằm cùng
         một mặt phẳng với đường. Đó là chỗ chiều sâu có việc thật để
         làm: mắt đọc ngay cái nào là mốc, cái nào là đường nối. */
      o += '<g filter="url(#' + bong.id + ')">' +
        '<circle cx="' + cx + '" cy="' + truc + '" r="' + (day ? 15 : 9) + '" ' +
        'fill="' + h(day ? k.do : k.gita) + '"/></g>' +
        (day ? '<circle cx="' + cx + '" cy="' + truc + '" r="24" fill="none" stroke="' +
          h(k.do) + '" stroke-width="2" opacity="0.45"/>' : '') +
        '<text x="' + cx + '" y="' + (truc - 38) + '" text-anchor="middle" ' +
          'font-family="' + h(CHU_THAN) + '" font-size="' + Math.round(kg.w / 55) +
          /* Đỏ tươi dùng làm MẢNG thì tốt, làm CHỮ trên giấy thì hụt:
             3,62:1 ở cỡ 22px. Chữ dùng đỏ sẫm, mảng vẫn dùng đỏ tươi —
             hai vai trò khác nhau của cùng một màu thương hiệu. */
          '" font-weight="800" fill="' + h(day ? (k.giay ? k.doInk : k.do)
            : (k.sau ? k.muc : k.gitaSau)) + '" ' +
          'letter-spacing="1.2">' + h(t.tang) + '</text>';
      /* Chừa RÃNH giữa hai nhãn. Bản trước cho nhãn rộng 0,94 ô nên
         hai nhãn cạnh nhau chạm đúng vào nhau — vẫn nằm trong khung,
         nên phép đo tràn không thấy; mắt thấy ngay. Rãnh 22 pixel là
         chỗ để mắt biết đây là hai mục, không phải một câu dài. */
      o += veChu(t.ten || t.tang, cx, truc + 42, {co: Math.round(kg.w / 62),
        chu: CHU_THAN, dam: day ? 700 : 500, mau: day ? k.muc : k.muc2,
        rong: Math.round(buoc - 22), gian: 1.35, can: 'middle'}).svg;
    });
    o += dauGita(k, le + Math.round(15 * tiDau(kg)), kg.h - Math.round(kg.h * 0.09), kg);
    return {ok: true, svg: khung(kg, k, o, nen.defs + bong.defs + cs.defs)};
  }

  /* ═══════════ BỘ VẼ · KHUNG PHƯƠNG PHÁP (LƯỚI Ô) ═══════════
     Ảnh mẫu chủ hệ gửi có sáu ô năng lực, mỗi ô một huy hiệu màu, một
     tiêu đề, một câu mô tả. Đó là đúng nhiệm vụ của loại hình KHUNG
     trong hiến pháp: "Giúp hiểu hệ thống làm việc theo cách nào".

     ══ MÁY KHÔNG ĐOÁN ĐÂU LÀ MỘT Ô ══
     Cám dỗ là cho máy tự cắt nội dung thành sáu ô. Cắt kiểu gì cũng
     là đoán, và đoán sai thì tấm hình nói sai — luật C10 cấm đúng
     thứ đó. Nên định dạng phải RÕ, người viết gõ ra, máy chỉ đọc:

         ĐỌC HIỂU — Toàn bộ hệ thống Web App GITA 365
         TƯ VẤN — Cá nhân hoá theo nhu cầu của bạn

     Mỗi dòng một ô: TÊN, dấu gạch dài, rồi mô tả. Không đủ ba dòng
     đúng dạng thì bộ vẽ DỪNG và chỉ ra dạng cần gõ — nói "không vẽ
     được" mà không nói cần gõ thế nào thì người dùng đoán tiếp. */
  function catO(chu) {
    var ra = [];
    String(chu || '').split('\n').forEach(function (d) {
      var m = /^\s*(.{2,40}?)\s+[—–]\s+(.{4,})$/.exec(d);
      if (m) ra.push({ten: m[1].trim(), y: m[2].trim()});
    });
    return ra;
  }

  function veKhung(x, kg, che) {
    var k = bang(che);
    var o6 = catO(x.noiDung);
    var nhan = docDau(x.noiDung, 'NHÃN'), bang2 = docDau(x.noiDung, 'BĂNG');
    if (o6.length < 3) return {ok: false,
      error: 'Khung phương pháp cần ít nhất BA ô, mỗi ô một dòng theo dạng ' +
             '"TÊN Ô — mô tả một câu" (dấu gạch dài). Máy KHÔNG tự cắt nội ' +
             'dung thành ô: cắt kiểu gì cũng là đoán, và một tấm hình dựng ' +
             'trên cái đoán thì nói sai mà trông vẫn chắc chắn. Đang đọc ra ' +
             o6.length + ' ô.'};
    var sac = sacTang();
    if (sac.length < 6) return {ok: false,
      error: 'Chưa mở được bảng màu thương hiệu (G.BRAND.mau). Sáu sắc của ' +
             'lưới ô lấy từ bảng ấy chứ không tự đặt — tự đặt là dựng bảng ' +
             'màu thứ hai mà không ai biết là có bản thứ hai.'};

    o6 = o6.slice(0, 6);
    var cot = o6.length <= 4 ? 2 : 3;
    var hang = Math.ceil(o6.length / cot);
    var le = Math.round(kg.w * 0.06);
    /* Lưới bắt đầu ngay dưới tiêu đề. Bản đầu để 0,34 và tấm hở một
       mảng trắng bằng một phần tư chiều cao ở giữa — mảng trống ấy
       không mang tin gì, mà lại đẩy sáu ô xuống lùn đi. Chỗ trống
       trong một tấm hình phải là chỗ NGHỈ giữa hai khối, không phải
       chỗ thừa vì tính sai. */
    var dayLuoi = kg.h - Math.round(kg.h * 0.115);
    var rongO = Math.round((kg.w - le * 2 - 18 * (cot - 1)) / cot);

    var nen = lopNen(kg, k, 1.3);
    var bong = defBong(k, 1);
    var bongHh = defBong(k, 2);
    var cs = defChuSac(k);
    var manh = [nen, bong, bongHh, cs];

    /* Tiêu đề dùng chữ nhấn và chuyển sắc — MỘT câu duy nhất trong
       tấm được phép, đúng luật của .grad-text. */
    var coTieu = Math.round(kg.w / 26);
    var yTieu = Math.round(kg.h * (nhan ? 0.175 : 0.155));
    var tieu = veChu(x.nhiemVu, le, yTieu,
      {co: coTieu, chu: CHU_TIEU, dam: 600,
       mau: 'url(#' + cs.id + ')', rong: kg.w - le * 2, gian: 1.2});
    var dnhan = nhan
      ? nhanTren(nhan, le, Math.round(yTieu - coTieu * 0.92), k, Math.round(coTieu * 0.34))
      : '';

    /* ── LƯỚI BẮT ĐẦU Ở CHỖ KHỐI TRÊN KẾT THÚC ──
       Bản đầu neo đỉnh lưới vào một tỷ lệ CỐ ĐỊNH của chiều cao tấm
       (0,235) mà không hỏi khối tiêu đề cao bao nhiêu — nên khi thêm
       dải băng, dải ấy đè thẳng lên đáy tiêu đề. Đúng lớp lỗi "đặt
       bằng một con số đoán thay vì đo khối trước" đã sửa ba lần rồi ở
       tấm bìa và trong từng ô; lần này nó quay lại ở tầng bố cục lớn.
       Nay chảy theo thứ tự thật: nhãn → tiêu đề → dải băng → lưới. */
    var day = yTieu + tieu.cao;
    var dbang = null;
    if (bang2) {
      dbang = daiBang(bang2, Math.round(kg.w / 2),
        Math.round(day + coTieu * 0.30), k, kg.w - le * 2);
      manh.push(dbang);
      day = day + coTieu * 0.30 + dbang.cao;
    }
    var dinhLuoi = Math.round(day + coTieu * 0.72);
    var caoO = Math.round((dayLuoi - dinhLuoi - 18 * (hang - 1)) / hang);

    /* ── ĐỈNH CỤM CHUNG CHO CẢ HÀNG ──
       Căn giữa từng ô một cách độc lập thì ô nào mô tả một dòng sẽ tụt
       xuống so với ô bên cạnh hai dòng, và sáu tiêu đề không thẳng
       hàng. Mắt quét một cái lưới theo HÀNG NGANG, nên tiêu đề lệch
       nhau đọc ra ngay là xếp ẩu — dù từng ô riêng lẻ đều cân.
       Lấy cụm CAO NHẤT trong hàng làm chuẩn cho cả hàng: huy hiệu và
       tiêu đề thẳng băng, chỉ phần mô tả dài ngắn khác nhau ở dưới,
       mà đó là chỗ khác nhau THẬT nên khác nhau là đúng. */
    var coTenC = Math.round(kg.w / 44), coYC = Math.round(kg.w / 66);
    var rC = Math.round(Math.min(rongO, caoO) * 0.17);
    var hoTenC = Math.round(caoO * 0.115), hoYC = Math.round(caoO * 0.055);
    var caoHang = [];
    o6.forEach(function (m, i) {
      var dT = catDong(m.ten, '800 ' + coTenC + 'px ' + CHU_THAN, rongO - 24);
      var dY = catDong(m.y, '500 ' + coYC + 'px ' + CHU_THAN, rongO - 26);
      var c = rC * 2 + hoTenC + dT.length * coTenC * 1.2 +
        hoYC + dY.length * coYC * 1.34;
      var hg = Math.floor(i / cot);
      caoHang[hg] = Math.max(caoHang[hg] || 0, c);
    });

    var ve = '';
    o6.forEach(function (m, i) {
      var cx = le + (i % cot) * (rongO + 18);
      var cy = dinhLuoi + Math.floor(i / cot) * (caoO + 18);
      var s = sac[i % sac.length];
      var kinh = tamKinh(cx, cy, rongO, caoO, k, {sac: s.hex, bong: bong.id});
      var r = Math.round(Math.min(rongO, caoO) * 0.17);
      var giuaX = cx + Math.round(rongO / 2);

      /* ── CĂN CẢ CỤM VÀO GIỮA Ô, KHÔNG THẢ TỪ TRÊN XUỐNG ──
         Bản đầu đặt huy hiệu ở 0,27 chiều cao ô rồi thả tên và mô tả
         xuống dưới. Ô nào mô tả ngắn thì hở hẳn một mảng ở đáy, ô nào
         dài thì chật — sáu ô cùng khổ mà ruột lệch nhau, và mắt đọc
         ra ngay là "tấm này xếp ẩu" dù không chỉ được ra chỗ nào sai.
         Đo cụm trước, rồi mới đặt: đúng cách đã sửa cho tấm bìa. */
      var coTen = Math.round(kg.w / 44), coY = Math.round(kg.w / 66);
      var dTen = catDong(m.ten, '800 ' + coTen + 'px ' + CHU_THAN, rongO - 24);
      var dY = catDong(m.y, '500 ' + coY + 'px ' + CHU_THAN, rongO - 26);
      var hoTen = Math.round(caoO * 0.115), hoY = Math.round(caoO * 0.055);
      var dinhCum = cy + Math.round((caoO - caoHang[Math.floor(i / cot)]) / 2);

      var hh = huyHieu(giuaX, dinhCum + r, r, s.hex,
        chonHinh(m.ten, i), bongHh.id, k);
      manh.push(kinh); manh.push(hh);
      ve += kinh.ve + hh.ve;

      var yTen = dinhCum + r * 2 + hoTen + coTen * 0.78;
      ve += veChu(m.ten, giuaX, yTen,
        {co: coTen, chu: CHU_THAN, dam: 800, mau: k.muc,
         rong: rongO - 24, gian: 1.2, can: 'middle', gianChu: 0.4}).svg;
      ve += veChu(m.y, giuaX,
        yTen + (dTen.length - 1) * coTen * 1.2 + hoY + coY * 1.05,
        {co: coY, chu: CHU_THAN, dam: 500, mau: k.muc2,
         rong: rongO - 26, gian: 1.34, can: 'middle'}).svg;
    });

    /* Dải băng đứng NGAY DƯỚI tiêu đề, trên lưới — đúng chỗ ảnh mẫu
       chủ hệ gửi đặt nó, và đúng vì mắt đi từ tiêu đề xuống lưới thì
       nó nằm trên đường đi ấy. Đặt nó dưới đáy tấm thì mắt đã rời đi
       trước khi tới. */
    var g = gom(manh);
    var ruot = nen.ve +
      '<rect x="0" y="0" width="' + kg.w + '" height="6" fill="' + h(k.gita) + '"/>' +
      dnhan + tieu.svg + (dbang ? dbang.ve : '') + ve +
      dauGita(k, le + Math.round(15 * tiDau(kg)), kg.h - Math.round(kg.h * 0.062), kg);
    return {ok: true, svg: khung(kg, k, ruot, g.defs)};
  }

  /* ═══════════════════════════════════════════════════════════════
     CẤU TRÚC MANG NGHĨA, KHÔNG PHẢI LƯỚI Ô CHO MỌI THỨ

     Chủ hệ gửi năm tấm mẫu và nói tư duy thiết kế của máy còn xấu.
     Đọc kỹ năm tấm thì chúng KHÔNG hơn nhau ở hiệu ứng — chúng hơn ở
     CẤU TRÚC THÔNG TIN:

       · tháp năm tầng, mỗi tầng một nêm số cộng một thẻ ba cột
       · hai cột đối chứng, mỗi bên một danh sách có dấu đúng/sai
       · ba vòng giao nhau, chỗ giao là câu trả lời
       · ray đánh số mười hai bước, mỗi bước một cụm gạch đầu dòng

     Máy trước đó chỉ dựng được LƯỚI Ô — cấu trúc yếu nhất trong cả
     năm — rồi đi mài bóng đổ cho nó. Mài bề mặt của một cấu trúc sai
     thì càng mài càng lộ ra là sai.

     Ba cấu trúc kia ĐÃ CÓ TÊN trong hiến pháp từ trước: SO_SANH_TANG
     "bảng cột theo chặng", QUY_TRINH "chuỗi bước", TRUOC_SAU "hai cột
     đối xứng". Chúng không phải thứ phải nghĩ ra — chúng là thứ đã
     khai mà chưa ai dựng.

     ══ VÀ THỨ THẬT SỰ THIẾU: MẬT ĐỘ ══
     Mỗi tấm mẫu mang bốn mươi tới một trăm mẩu chữ. Lưới ô của máy
     mang sáu. Một tấm hình đáng để người ta dừng lại nhìn là tấm TRẢ
     CÔNG cho việc dừng lại — nên ô phải chứa được DANH SÁCH, không
     chỉ một câu.
     ═══════════════════════════════════════════════════════════════ */

  /* Gạch đầu dòng trong một ô. Trả cả chiều cao đã dùng, vì mọi bố
     cục ở đây xếp chồng và khối nào cũng phải nói mình cao bao nhiêu. */
  function veGachDau(ds, x, y, o) {
    var co = o.co, rong = o.rong, ra = '', cao = 0;
    ds.forEach(function (d) {
      var dong = catDong(d, '500 ' + co + 'px ' + CHU_THAN, rong - co * 1.15);
      ra += '<circle cx="' + (x + co * 0.30) + '" cy="' + (y + cao + co * 0.30) +
        '" r="' + (co * 0.17).toFixed(1) + '" fill="' + h(o.cham || o.mau) + '"/>';
      dong.forEach(function (t, i) {
        ra += '<text x="' + (x + co * 1.05) + '" y="' +
          (y + cao + i * co * 1.36 + co * 0.55) + '" font-family="' + h(CHU_THAN) +
          '" font-size="' + co + '" font-weight="500" fill="' + h(o.mau) + '">' +
          h(t) + '</text>';
      });
      cao += dong.length * co * 1.36 + co * 0.30;
    });
    return {svg: ra, cao: cao};
  }

  /* ── ĐỌC KHỐI TẦNG ──
     TẦNG 5 | Tầm nhìn & Di sản | Coach truyền cảm hứng
     MỤC TIÊU — Kiến tạo tầm nhìn lớn, giá trị và di sản.
     COACH LÀM GÌ — Khai mở sứ mệnh, tầm nhìn 10x–100x.
     KẾT QUẢ — Khách hàng sống có ý nghĩa, tạo di sản.

     Vẫn một luật: NGƯỜI VIẾT GÕ RA, máy không đoán đâu là một tầng. */
  function catTang(chu) {
    var ra = [], nay = null;
    String(chu || '').split('\n').forEach(function (d) {
      var t = /^\s*(?:TẦNG|BẬC|CẤP)\s+(\S+)\s*\|\s*([^|]+?)\s*(?:\|\s*(.+?))?\s*$/i.exec(d);
      if (t) { nay = {so: t[1], ten: t[2].trim(), vai: (t[3] || '').trim(), o: []};
        ra.push(nay); return; }
      var c = /^\s*(.{2,40}?)\s+[—–]\s+(.{4,})$/.exec(d);
      if (c && nay) nay.o.push({ten: c[1].trim(), y: c[2].trim()});
    });
    return ra.filter(function (x) { return x.o.length; });
  }

  function veSoSanhTang(x, kg, che) {
    var k = bang(che);
    var ds = catTang(x.noiDung);
    var nhan = docDau(x.noiDung, 'NHÃN'), bang2 = docDau(x.noiDung, 'BĂNG');
    if (ds.length < 2) return {ok: false,
      error: 'Bảng tầng cần ít nhất HAI tầng. Mỗi tầng mở bằng một dòng ' +
             '"TẦNG 5 | Tên tầng | Vai của Coach", rồi các dòng "CỘT — nội dung" ' +
             'ngay dưới nó (tối đa ba cột mỗi tầng). Máy KHÔNG tự chia nội dung ' +
             'thành tầng: chia kiểu gì cũng là đoán. Đang đọc ra ' + ds.length + ' tầng.'};
    var sac = sacTang();
    if (!sac.length) return {ok: false,
      error: 'Chưa mở được bảng màu thương hiệu (G.BRAND.mau).'};

    ds = ds.slice(0, 6);
    var le = Math.round(kg.w * 0.045);
    var nen = lopNen(kg, k, 1.2);
    var bong = defBong(k, 1);
    var cs = defChuSac(k);
    var manh = [nen, bong, cs];

    /* ĐẦU TẤM chảy theo thứ tự thật, như đã sửa cho lưới ô. */
    var coTieu = Math.round(kg.w / 22);
    var yTieu = Math.round(kg.h * (nhan ? 0.075 : 0.062)) + coTieu;
    var tieu = veChu(x.nhiemVu, Math.round(kg.w / 2), yTieu,
      {co: coTieu, chu: CHU_TIEU, dam: 600, mau: 'url(#' + cs.id + ')',
       rong: kg.w - le * 2, gian: 1.16, can: 'middle'});
    var dnhan = nhan ? nhanTren(nhan, le + 6,
      Math.round(yTieu - coTieu * 0.95), k, Math.round(coTieu * 0.40)) : '';
    var day = yTieu + tieu.cao;
    var dbang = null;
    if (bang2) {
      dbang = daiBang(bang2, Math.round(kg.w / 2), Math.round(day + coTieu * 0.22),
        k, kg.w - le * 2);
      manh.push(dbang);
      day = day + coTieu * 0.22 + dbang.cao;
    }

    var dinh = Math.round(day + coTieu * 0.52);
    var dayBang2 = kg.h - Math.round(kg.h * 0.075);
    var khe = 12;
    var caoT = Math.round((dayBang2 - dinh - khe * (ds.length - 1)) / ds.length);
    /* Nêm bên trái rộng đúng một phần tư: đủ cho số lớn và tên tầng,
       mà không ăn vào chỗ của ba cột — ba cột mới là phần mang tin. */
    var rongNem = Math.round(kg.w * 0.25);
    var rongThe = kg.w - le * 2 - rongNem - 10;

    var ve = '';
    ds.forEach(function (t, i) {
      var y = dinh + i * (caoT + khe);
      var s = sac[(ds.length - 1 - i) % sac.length];
      /* ── NÊM, KHÔNG PHẢI HỘP ──
         Cạnh phải vát chéo cho tầng trên hẹp hơn tầng dưới, nên xếp
         chồng lại thành một cái THÁP. Hộp vuông xếp chồng chỉ là một
         danh sách; hình tháp nói thêm một điều mà danh sách không nói:
         tầng trên đứng TRÊN tầng dưới, và không nhảy cóc được. */
      var vat = Math.round(rongNem * 0.14 * (ds.length - i) / ds.length);
      var gN = idMoi('nem');
      manh.push({defs: '<linearGradient id="' + gN + '" x1="0" y1="0" x2="1" y2="1">' +
        '<stop offset="0%" stop-color="' + h(doiSang(s.hex, nemDai(k))) + '"/>' +
        '<stop offset="100%" stop-color="' + h(doiSang(s.hex, -nemDai(k))) + '"/>' +
        '</linearGradient>'});
      ve += '<g filter="url(#' + bong.id + ')"><path d="M' + le + ' ' + y +
        ' H' + (le + rongNem - vat) + ' L' + (le + rongNem) + ' ' + (y + caoT) +
        ' H' + le + ' Z" fill="url(#' + gN + ')"/></g>';

      /* ── THANG CHỮ NEO VÀO KHỔ TẤM, KHÔNG NEO VÀO CHIỀU CAO HÀNG ──
         Bản đầu tính mọi cỡ chữ theo caoT. Ba tầng thì mỗi hàng cao
         gấp đôi năm tầng, nên cùng một tấm mà chữ phình từ 26px lên
         43px và con số từ 65px lên 108px — chữ to ra chỉ VÌ ÍT HÀNG,
         không vì nó quan trọng hơn.
         Đó là lỗi tư duy chứ không phải lỗi vặt: cỡ chữ phải nói về
         VAI TRÒ của chữ trong tấm, không nói về việc hôm nay có mấy
         hàng. Neo vào bề ngang tấm, rồi chặn trần theo chiều cao hàng
         để hàng thấp không bị tràn. */
      var coSo = Math.min(Math.round(kg.w * 0.062), Math.round(caoT * 0.34));
      var xSo = le + Math.round(rongNem * 0.11);
      /* ── SỐ HẸP VẪN PHẢI CHIẾM MỘT CỘT RỘNG BẰNG NHAU ──
         Bản đầu đặt tên tầng ngay sau bề rộng THẬT của chữ số, nên số
         "1" hẹp khiến tên dính sát vào nó, còn số "5" rộng thì tên
         lùi ra — năm tầng, năm chỗ bắt đầu khác nhau, và tầng 1 thì
         chữ chồng lên số. Chốt một cột số rộng cố định: mọi tên tầng
         bắt đầu ở đúng một đường dọc. */
      var rongCotSo = Math.max(
        doRong(t.so, '800 ' + coSo + 'px ' + CHU_THAN), coSo * 0.66);
      var xT = Math.round(xSo + rongCotSo + coSo * 0.30);
      var rongTen = rongNem - (xT - le) - vat - 10;

      /* Căn cả cụm (tên + vai) vào giữa nêm theo chiều dọc, cùng luật
         đã dùng cho từng ô của lưới. */
      var coTen2 = Math.min(Math.round(kg.w * 0.026), Math.round(caoT * 0.135));
      /* Dòng vai to hơn một nấc, và đây là QUYẾT ĐỊNH chứ không phải
         nới lỏng: trên một sắc bão hoà, chữ NHỎ không mực nào đạt nổi
         4,5:1 — trắng thua ở đầu sáng, đen thua ở đầu tối. Ngưỡng
         WCAG cho chữ từ 24px là 3,0, và ở cỡ ấy nó đọc được THẬT.
         Nên hoặc chữ to lên, hoặc chữ phải rời khỏi mảng màu. Chọn to
         lên: dòng vai là phần định danh của tầng, nó đáng được đọc. */
      var coVai = Math.min(Math.round(kg.w * 0.0235), Math.round(caoT * 0.105));
      var dTen2 = catDong(t.ten, '800 ' + coTen2 + 'px ' + CHU_THAN, rongTen);
      var dVai = t.vai
        ? catDong(t.vai, '500 ' + coVai + 'px ' + CHU_THAN, rongTen) : [];
      var caoCum2 = dTen2.length * coTen2 * 1.18 +
        (dVai.length ? 6 + dVai.length * coVai * 1.22 : 0);
      var yCum = Math.round(y + (caoT - caoCum2) / 2 + coTen2 * 0.80);

      ve += '<text x="' + xSo + '" y="' +
        Math.round(y + caoT / 2 + coSo * 0.35) + '" font-family="' + h(CHU_THAN) +
        '" font-size="' + coSo + '" font-weight="800" fill="' + h(mucTren(s.hex)) +
        '" fill-opacity="0.96">' + h(t.so) + '</text>';
      var tenT = veChu(t.ten, xT, yCum,
        {co: coTen2, chu: CHU_THAN, dam: 800, mau: mucTren(s.hex),
         rong: rongTen, gian: 1.18});
      ve += tenT.svg;
      if (t.vai)
        ve += veChu(t.vai, xT, yCum + tenT.cao + 6,
          {co: coVai, chu: CHU_THAN, dam: 500, mau: mucPhuTren(s.hex),
           rong: rongTen, gian: 1.22}).svg;

      /* THẺ BA CỘT — chỗ mang tin thật. */
      var xThe = le + rongNem + 10;
      var kinh = tamKinh(xThe, y, rongThe, caoT, k, {sac: s.hex, bong: bong.id, bo: 14});
      manh.push(kinh); ve += kinh.ve;

      var nO = Math.min(3, t.o.length);
      var demO = 14;
      var rongO2 = Math.round((rongThe - 26 - demO * (nO - 1)) / nO);
      var coH2 = Math.min(Math.round(kg.w * 0.0195), Math.round(caoT * 0.105));
      var coB2 = Math.min(Math.round(kg.w * 0.0175), Math.round(caoT * 0.093));
      var rH2 = Math.round(coH2 * 0.86);
      /* ── CỘT DÀI NHẤT ĐỊNH CHỖ CHO CẢ HÀNG ──
         Bản đầu neo ba cột vào mép trên thẻ (y + 20), nên khi thẻ cao
         hơn cụm chữ thì cả ba cột dồn lên nửa trên và hở hẳn nửa dưới
         — đúng lớp lỗi đã sửa ba lần ở chỗ khác, quay lại lần thứ tư.
         Đo cột dài nhất rồi căn cả hàng vào giữa thẻ. */
      var caoCotMax = 0;
      t.o.slice(0, nO).forEach(function (m) {
        var d = catDong(m.y, '500 ' + coB2 + 'px ' + CHU_THAN, rongO2 - 4);
        caoCotMax = Math.max(caoCotMax, rH2 * 2 + coB2 * 1.5 + d.length * coB2 * 1.34);
      });
      var yCot = Math.round(y + Math.max(16, (caoT - caoCotMax) / 2));
      t.o.slice(0, nO).forEach(function (m, j) {
        var xo = xThe + 13 + j * (rongO2 + demO);
        if (j) ve += '<line x1="' + (xo - demO / 2) + '" y1="' + (y + 14) +
          '" x2="' + (xo - demO / 2) + '" y2="' + (y + caoT - 14) +
          '" stroke="' + h(s.hex) + '" stroke-opacity="0.34" ' +
          'stroke-width="1" stroke-dasharray="3 4"/>';
        var hh = huyHieu(xo + rH2, yCot + rH2, rH2, s.hex,
          chonHinh(m.ten, i * 3 + j), null, k);
        manh.push(hh); ve += hh.ve;
        ve += '<text x="' + (xo + rH2 * 2 + 8) + '" y="' + (yCot + rH2 + coH2 * 0.36) +
          '" font-family="' + h(CHU_THAN) + '" font-size="' + coH2 +
          '" font-weight="800" fill="' + h(k.muc) + '" letter-spacing="0.5">' +
          h(m.ten.toUpperCase()) + '</text>';
        ve += veChu(m.y, xo, yCot + rH2 * 2 + coB2 * 1.5,
          {co: coB2, chu: CHU_THAN, dam: 500, mau: k.muc2,
           rong: rongO2 - 4, gian: 1.34}).svg;
      });
    });

    var g = gom(manh);
    return {ok: true, svg: khung(kg, k,
      nen.ve + '<rect x="0" y="0" width="' + kg.w + '" height="6" fill="' +
      h(k.gita) + '"/>' + dnhan + tieu.svg + (dbang ? dbang.ve : '') + ve +
      dauGita(k, le + Math.round(21 * tiDau(kg)), kg.h - Math.round(kg.h * 0.032), kg), g.defs)};
  }

  /* ── ĐỌC KHỐI BƯỚC ──
     BƯỚC 01 | Lắng nghe, kết nối, thấu hiểu
     · Lắng nghe câu chuyện của học viên
     · Kết nối và xây dựng niềm tin */
  function catBuoc(chu) {
    var ra = [], nay = null;
    String(chu || '').split('\n').forEach(function (d) {
      var b = /^\s*(?:BƯỚC|CHẶNG|MỐC)\s+(\S+)\s*\|\s*(.+?)\s*$/i.exec(d);
      if (b) { nay = {so: b[1], ten: b[2].trim(), y: []}; ra.push(nay); return; }
      var g = /^\s*[·•\-*]\s+(.{3,})$/.exec(d);
      if (g && nay) nay.y.push(g[1].trim());
    });
    return ra;
  }

  function veQuyTrinh(x, kg, che) {
    var k = bang(che);
    var ds = catBuoc(x.noiDung);
    var nhan = docDau(x.noiDung, 'NHÃN'), bang2 = docDau(x.noiDung, 'BĂNG');
    if (ds.length < 3) return {ok: false,
      error: 'Quy trình cần ít nhất BA bước. Mỗi bước mở bằng một dòng ' +
             '"BƯỚC 01 | Tên bước", rồi các dòng bắt đầu bằng dấu · là ý của ' +
             'bước ấy. Máy KHÔNG tự cắt nội dung thành bước — thứ tự các bước ' +
             'là thứ tấm hình này tồn tại để nói, nên đoán sai thứ tự là nói ' +
             'sai đúng điều duy nhất nó phải nói. Đang đọc ra ' + ds.length + ' bước.'};
    var sac = sacTang();
    if (!sac.length) return {ok: false,
      error: 'Chưa mở được bảng màu thương hiệu (G.BRAND.mau).'};

    ds = ds.slice(0, 8);
    var le = Math.round(kg.w * 0.055);
    var nen = lopNen(kg, k, 1.2);
    var bong = defBong(k, 1);
    var bongHh = defBong(k, 2);
    var cs = defChuSac(k);
    var manh = [nen, bong, bongHh, cs];

    var coTieu = Math.round(kg.w / 22);
    var yTieu = Math.round(kg.h * (nhan ? 0.072 : 0.058)) + coTieu;
    var tieu = veChu(x.nhiemVu, Math.round(kg.w / 2), yTieu,
      {co: coTieu, chu: CHU_TIEU, dam: 600, mau: 'url(#' + cs.id + ')',
       rong: kg.w - le * 2, gian: 1.16, can: 'middle'});
    var dnhan = nhan ? nhanTren(nhan, le + 6,
      Math.round(yTieu - coTieu * 0.95), k, Math.round(coTieu * 0.40)) : '';
    var day = yTieu + tieu.cao;
    var dbang = null;
    if (bang2) {
      dbang = daiBang(bang2, Math.round(kg.w / 2), Math.round(day + coTieu * 0.22),
        k, kg.w - le * 2);
      manh.push(dbang);
      day = day + coTieu * 0.22 + dbang.cao;
    }

    var dinh = Math.round(day + coTieu * 0.55);
    var dayVung = kg.h - Math.round(kg.h * 0.072);
    var khe = 12;
    var caoB = Math.round((dayVung - dinh - khe * (ds.length - 1)) / ds.length);
    var rTron = Math.round(Math.min(caoB * 0.32, kg.w * 0.036));
    var xTron = le + rTron;

    /* ── RAY DỌC NỐI CÁC BƯỚC ──
       Một đường chạy suốt sau các số. Không có nó thì tám vòng tròn
       chỉ là tám vòng tròn; có nó thì chúng thành MỘT chuỗi, và chuỗi
       là đúng thứ loại hình này khai: "giúp làm theo đúng thứ tự". */
    var ve = '<line x1="' + xTron + '" y1="' + (dinh + rTron) + '" x2="' + xTron +
      '" y2="' + (dinh + (ds.length - 1) * (caoB + khe) + rTron) +
      '" stroke="' + h(k.gita) + '" stroke-opacity="0.35" stroke-width="3"/>';

    ds.forEach(function (t, i) {
      var y = dinh + i * (caoB + khe);
      var s = sac[i % sac.length];
      var kinh = tamKinh(xTron + rTron + 16, y, kg.w - le - (xTron + rTron + 16),
        caoB, k, {sac: s.hex, bong: bong.id, bo: 14});
      manh.push(kinh); ve += kinh.ve;

      var gT = idMoi('tron');
      manh.push({defs: '<linearGradient id="' + gT + '" x1="0" y1="0" x2="1" y2="1">' +
        '<stop offset="0%" stop-color="' + h(doiSang(s.hex, nemDai(k))) + '"/>' +
        '<stop offset="100%" stop-color="' + h(doiSang(s.hex, -nemDai(k))) + '"/>' +
        '</linearGradient>'});
      ve += '<g filter="url(#' + bongHh.id + ')"><circle cx="' + xTron + '" cy="' +
        (y + rTron) + '" r="' + rTron + '" fill="url(#' + gT + ')"/></g>' +
        '<text x="' + xTron + '" y="' + Math.round(y + rTron + rTron * 0.38) +
        '" text-anchor="middle" font-family="' + h(CHU_THAN) + '" font-size="' +
        Math.round(rTron * 1.02) + '" font-weight="800" fill="' +
        h(mucTren(s.hex)) + '">' + h(t.so) + '</text>';

      var xN = xTron + rTron + 32;
      var rongN = kg.w - le - xN - 16;
      var coTen = Math.min(Math.round(kg.w * 0.030), Math.round(caoB * 0.155));
      var coY = Math.min(Math.round(kg.w * 0.0195), Math.round(caoB * 0.115));
      var ys = t.y.slice(0, 4);

      /* ── ĐO CẢ CỤM RỒI MỚI ĐẶT ──
         Lần thứ năm cùng một lớp lỗi trong tệp này, nên ghi hẳn ra:
         mọi khối chữ trong một khung có sẵn phải ĐO TRƯỚC rồi mới đặt.
         Neo vào mép trên thì khung nào cao hơn cụm cũng hở đáy, và ba
         khung cạnh nhau hở ba kiểu khác nhau.
         Cộng một khe nghỉ THẬT giữa tên bước và danh sách: không có
         khe thì mắt đọc tên bước thành gạch đầu dòng thứ nhất. */
      var dTenB = catDong(t.ten, '800 ' + coTen + 'px ' + CHU_THAN, rongN);
      var caoTenB = dTenB.length * coTen * 1.18;
      var caoY = 0;
      ys.forEach(function (d) {
        caoY += catDong(d, '500 ' + coY + 'px ' + CHU_THAN, rongN - coY * 1.15)
          .length * coY * 1.36 + coY * 0.30;
      });
      var kheTen = ys.length ? coTen * 0.42 : 0;
      var yCumB = Math.round(y + Math.max(14, (caoB - caoTenB - kheTen - caoY) / 2));

      ve += veChu(t.ten, xN, yCumB + coTen * 0.82,
        {co: coTen, chu: CHU_THAN, dam: 800, mau: k.muc,
         rong: rongN, gian: 1.18}).svg;
      if (ys.length)
        ve += veGachDau(ys, xN, yCumB + caoTenB + kheTen,
          {co: coY, rong: rongN, mau: k.muc2, cham: s.hex}).svg;
    });

    var g = gom(manh);
    return {ok: true, svg: khung(kg, k,
      nen.ve + '<rect x="0" y="0" width="' + kg.w + '" height="6" fill="' +
      h(k.gita) + '"/>' + dnhan + tieu.svg + (dbang ? dbang.ve : '') + ve +
      dauGita(k, le + Math.round(21 * tiDau(kg)), kg.h - Math.round(kg.h * 0.030), kg), g.defs)};
  }

  /* ── BÚT DẠ QUANG ──
     Bốn trên năm tấm mẫu mới của chủ hệ dùng một vệt vàng sau cụm chữ
     quan trọng nhất. Nó làm được thứ chữ đậm không làm: đậm nói "chữ
     này nặng", vệt vàng nói "ĐỌC CHỖ NÀY TRƯỚC". Trên một tấm dày
     bốn mươi mẩu chữ thì đó là khác biệt giữa đọc được và đọc nổi.
     Người viết đánh dấu bằng ==hai dấu bằng==, máy không tự chọn —
     máy chọn thì nó tô vàng chỗ nó tưởng là quan trọng. */
  var VANG_QUANG = '#FFE24D';
  function tachQuang(chu) {
    var ra = [], t = String(chu || ''), m;
    var re = /==([^=]{1,80})==/g, cuoi = 0;
    while ((m = re.exec(t))) {
      if (m.index > cuoi) ra.push({t: t.slice(cuoi, m.index), q: false});
      ra.push({t: m[1], q: true});
      cuoi = m.index + m[0].length;
    }
    if (cuoi < t.length) ra.push({t: t.slice(cuoi), q: false});
    return ra.length ? ra : [{t: t, q: false}];
  }
  function boQuang(chu) { return String(chu || '').replace(/==([^=]{1,80})==/g, '$1'); }

  /* Vẽ MỘT dòng có thể chứa vệt quang. Chỉ dùng cho dòng ngắn đứng
     một mình (tiêu đề phụ, nhãn cột) — không dùng cho đoạn văn dài,
     vì vệt quang cắt qua chỗ ngắt dòng thì trông như bôi bẩn. */
  function veDongQuang(chu, x, y, o) {
    /* ── CO CHO VỪA, KHÔNG VẼ TRÀN ──
       Hàm này vẽ MỘT dòng, không ngắt dòng — nên nếu chỗ chứa hẹp
       hơn câu thì nó cứ vẽ, và chữ chạy thẳng ra khỏi thẻ sang cột
       bên cạnh. Phép đo "chữ trong chính thẻ của nó" bắt đúng chỗ
       này, sau khi ba phép đo trước đều trượt.
       Vệt quang không ngắt dòng được cho đẹp, nên cách đúng là CO cỡ
       chữ tới khi vừa. Có sàn: dưới sàn thì thà cắt chữ còn hơn để
       một dòng bé tí không ai đọc. */
    if (o.rongToiDa) {
      while (o.co > 11 &&
             doRong(boQuang(chu), (o.dam || 700) + ' ' + o.co + 'px ' + o.chu) >
             o.rongToiDa) o.co -= 1;
    }
    var manh = tachQuang(chu), dx = 0, ra = '', font = (o.dam || 700) + ' ' + o.co + 'px ' + o.chu;
    var tong = doRong(boQuang(chu), font);
    var x0 = o.can === 'middle' ? x - tong / 2 : x;
    manh.forEach(function (m) {
      var w = doRong(m.t, font);
      /* Vệt vàng phải ôm TRỌN hộp chữ, kể cả phần vươn lên và phần
         thõng xuống của dấu tiếng Việt. Bản đầu chỉ cao 1,06 lần cỡ
         chữ nên dấu "ệ" và "đ" thò ra ngoài vệt — phép đo vắt-mép bắt
         ngay, và đó đúng là thứ chủ hệ nói: "không để chữ ngoài màu".
         Tiếng Việt cần vệt cao hơn tiếng Latin không dấu, vì dấu
         chồng lên nguyên âm đẩy hộp chữ cao thêm một nấc. */
      if (m.q) ra += '<rect x="' + (x0 + dx - o.co * 0.22).toFixed(1) + '" y="' +
        (y - o.co * 1.00).toFixed(1) + '" width="' + (w + o.co * 0.44).toFixed(1) +
        '" height="' + (o.co * 1.42).toFixed(1) + '" rx="' + (o.co * 0.12).toFixed(1) +
        '" fill="' + h(VANG_QUANG) + '" fill-opacity="0.92"/>';
      dx += w;
    });
    dx = 0;
    manh.forEach(function (m) {
      ra += '<text x="' + (x0 + dx).toFixed(1) + '" y="' + y + '" font-family="' +
        h(o.chu) + '" font-size="' + o.co + '" font-weight="' + (o.dam || 700) +
        '" fill="' + h(o.mau) + '"' +
        (o.gianChu ? ' letter-spacing="' + o.gianChu + '"' : '') + '>' +
        h(m.t) + '</text>';
      dx += doRong(m.t, font);
    });
    return {svg: ra, rong: tong};
  }

  /* ═══════════ BỘ VẼ · HAI CỘT ĐỐI CHỨNG ═══════════
     Loại hình TRUOC_SAU, hiến pháp khai "hai cột đối xứng · giúp nhìn
     thấy chỗ đã đổi". Đây là cấu trúc có trong bốn trên năm tấm mẫu
     mới của chủ hệ, và là cấu trúc thuyết phục nhất trong cả bộ: nó
     không kể một chuyện, nó đặt hai chuyện cạnh nhau rồi để người đọc
     tự kết luận. Một đường kẻ dọc ở giữa là toàn bộ lập luận.

     Định dạng, người viết gõ ra:
       TRÁI | Chỉ bán sản phẩm | == dễ bị sao chép ==
       ✗ Không có dịch vụ đi kèm.
       ✗ Khách hàng chỉ quan tâm đến giá.
       PHẢI | Dịch vụ và trải nghiệm | == lợi thế thật sự ==
       ✓ Tạo khác biệt bằng trải nghiệm.
       ✓ Khách hàng quay lại nhiều lần. */
  function catCot(chu) {
    var ra = [], nay = null;
    String(chu || '').split('\n').forEach(function (d) {
      var c = /^\s*(TRÁI|PHẢI|TRƯỚC|SAU)\s*\|\s*([^|]+?)\s*(?:\|\s*(.+?))?\s*$/i.exec(d);
      if (c) { nay = {ben: c[1].toUpperCase(), ten: c[2].trim(),
        phu: (c[3] || '').trim(), y: []}; ra.push(nay); return; }
      var g = /^\s*([✓✔×✗x])\s+(.{3,})$/i.exec(d);
      if (g && nay) nay.y.push({dung: /[✓✔]/.test(g[1]), t: g[2].trim()});
    });
    return ra.slice(0, 2);
  }

  function veTruocSau(x, kg, che) {
    var k = bang(che);
    var ds = catCot(x.noiDung);
    var nhan = docDau(x.noiDung, 'NHÃN'), bang2 = docDau(x.noiDung, 'BĂNG');
    if (ds.length < 2 || !ds[0].y.length || !ds[1].y.length) return {ok: false,
      error: 'Hai cột đối chứng cần ĐỦ HAI cột, mỗi cột có danh sách. Mở cột ' +
             'bằng dòng "TRÁI | Tiêu đề cột | ==câu nhấn==" rồi các dòng bắt ' +
             'đầu bằng ✓ hoặc ✗. Máy KHÔNG tự chia nội dung làm đôi: chia sai ' +
             'chỗ thì hai cột nói ngược nhau, mà cả tấm này tồn tại chỉ để đặt ' +
             'hai bên cạnh nhau cho đúng. Đang đọc ra ' + ds.length + ' cột.'};
    var sac = sacTang();
    var mauSai = k.doInk || k.do;
    var mauDung = (sac.filter(function (c) { return /Lục/.test(c.ten); })[0] || {}).hex
      || '#10B981';

    var le = Math.round(kg.w * 0.055);
    var nen = lopNen(kg, k, 0.9);
    var bong = defBong(k, 1);
    var cs = defChuSac(k);
    var manh = [nen, bong, cs];

    /* ── NỀN BÚT: VẼ BẰNG NÉT, KHÔNG BẰNG MẢNG ──
       Tới 9.99.34 nền `but` chỉ đổi BẢNG MÀU — giấy ngà, mực nâu —
       rồi vẽ y hệt mọi nền khác: chip tô đặc, vòng tròn tô đặc, bóng
       đổ. Ra một tấm in màu trên giấy ngà, không ra một tấm vẽ tay.

       Tấm mẫu chủ hệ gửi gần như KHÔNG có mảng đặc nào: tất cả là nét
       mực trên giấy, và chỗ duy nhất có mảng là vệt bút nhớ vàng.
       Nên ở nền bút: chip thành khung viền, vòng dấu thành nét, bóng
       đổ bỏ hẳn, và mọi nét đi qua bộ lọc `run` cho hơi run tay.

       CHỮ KHÔNG QUA BỘ LỌC. Nét run làm hình sống; làm chữ thì thành
       chữ nhoè, mà chữ nhoè là chữ hỏng. */
    var but = defBut();
    var netRun = '';
    if (k.but) {
      manh.push({defs: but.defs});
      netRun = ' filter="url(#' + but.run + ')"';
    }

    var coTieu = Math.round(kg.w / 24);
    var yTieu = Math.round(kg.h * (nhan ? 0.085 : 0.070)) + coTieu;
    var tieu = veChu(x.nhiemVu, Math.round(kg.w / 2), yTieu,
      {co: coTieu, chu: CHU_TIEU, dam: 600, mau: 'url(#' + cs.id + ')',
       rong: kg.w - le * 2, gian: 1.16, can: 'middle'});
    var dnhan = nhan ? nhanTren(nhan, le + 6,
      Math.round(yTieu - coTieu * 0.95), k, Math.round(coTieu * 0.40)) : '';
    var day = yTieu + tieu.cao;
    var dbang = null;
    if (bang2) {
      dbang = daiBang(bang2, Math.round(kg.w / 2), Math.round(day + coTieu * 0.24),
        k, kg.w - le * 2);
      manh.push(dbang);
      day = day + coTieu * 0.24 + dbang.cao;
    }

    var dinh = Math.round(day + coTieu * 0.60);
    var dayVung = kg.h - Math.round(kg.h * 0.075);
    var khe = Math.round(kg.w * 0.035);
    var rongCot = Math.round((kg.w - le * 2 - khe) / 2);

    /* Đường kẻ dọc ở giữa — toàn bộ lập luận của tấm nằm ở đây. */
    var ve = '<line' + netRun + ' x1="' + Math.round(kg.w / 2) + '" y1="' + (dinh - 8) +
      '" x2="' + Math.round(kg.w / 2) + '" y2="' + dayVung +
      '" stroke="' + h(k.muc3) + '" stroke-opacity="' + (k.but ? '0.75' : '0.5') +
      '" stroke-width="' + (k.but ? 2.4 : 1.5) + '"/>';

    /* ── KHỔ CAO: DỜI CẢ CỤM XUỐNG GIỮA, ĐỪNG BỎ TRỐNG NỬA DƯỚI ──
       Khối "giãn đều cho hết vùng" bên dưới chặn trần mỗi khe ở
       1,15·cỡ chữ — đúng, vì một cột bốn mục kéo giãn hết một tờ 9:16
       thì đọc ra là thưa thớt chứ không ra thoáng. Nhưng chặn trần
       rồi thì phần thừa KHÔNG hấp thụ hết đi đâu cả: nó dồn xuống
       đáy, và tấm 9:16 ra nửa dưới trắng trơn.
       Chủ hệ nhìn ra chỗ này ngay lượt đầu. Nay đo trước chiều cao
       tự nhiên của cột cao nhất, trừ đi phần mấy cái khe hấp thụ
       được, còn lại bao nhiêu thì dời cụm xuống NỬA phần ấy — cụm
       nằm giữa vùng thay vì treo ở trên. */
    var coYDo = Math.round(kg.w * 0.0195), rDDo = Math.round(coYDo * 0.78);
    var caoTuNhien = 0, soMucNhat = 0;
    ds.forEach(function (c) {
      var coDauDo = Math.round(kg.w * 0.026);
      var cao = catDong(c.ten, '800 ' + coDauDo + 'px ' + CHU_THAN, rongCot - 32)
        .length * coDauDo * 1.2 + coDauDo * 1.0;
      cao += 14 + Math.round(kg.h * 0.115) * 1.16 + 14;
      if (c.phu) cao += Math.round(kg.w * 0.021) * 2.1;
      var ds2Do = c.y.slice(0, 9);
      ds2Do.forEach(function (m) {
        cao += Math.max(rDDo * 2,
          catDong(m.t, '500 ' + coYDo + 'px ' + CHU_THAN,
            rongCot - rDDo * 2 - 16).length * coYDo * 1.34) + coYDo * 0.52;
      });
      if (cao > caoTuNhien) { caoTuNhien = cao; soMucNhat = ds2Do.length; }
    });
    var thuaChung = dayVung - dinh - caoTuNhien;
    var kheHutDuoc = soMucNhat > 1 ? coYDo * 1.15 * (soMucNhat - 1) : 0;
    if (thuaChung - kheHutDuoc > 0)
      dinh = Math.round(dinh + (thuaChung - kheHutDuoc) / 2);

    ds.forEach(function (c, i) {
      var xc = le + i * (rongCot + khe);
      var mau = i === 0 ? mauSai : mauDung;

      /* Đầu cột: một CHIP màu đặc, chữ nằm TRỌN trong chip — chủ hệ
         nói thẳng "không để chữ ngoài màu", nên chip đo theo chữ chứ
         không đặt bề rộng cố định rồi hy vọng chữ vừa. */
      var coDau = Math.round(kg.w * 0.026);
      var dDau = catDong(c.ten, '800 ' + coDau + 'px ' + CHU_THAN, rongCot - 32);
      var caoChip = dDau.length * coDau * 1.2 + coDau * 1.0;
      var gC = idMoi('chip');
      manh.push({defs: '<linearGradient id="' + gC + '" x1="0" y1="0" x2="1" y2="1">' +
        '<stop offset="0%" stop-color="' + h(doiSang(mau, nemDai(k))) + '"/>' +
        '<stop offset="100%" stop-color="' + h(doiSang(mau, -nemDai(k))) + '"/>' +
        '</linearGradient>'});
      if (k.but) {
        /* Khung viền, không mảng đặc — và không bóng đổ: giấy không
           có bóng đổ, nó chỉ có nét đè lên nét. Chữ đầu cột mặc chính
           sắc của cột, đủ đậm trên giấy ngà. */
        ve += '<rect' + netRun + ' class="gita-tam" x="' + xc + '" y="' + dinh +
          '" width="' + rongCot + '" height="' + Math.round(caoChip) + '" rx="10" ' +
          'fill="none" stroke="' + h(nenDac(mau, 4.6)) + '" stroke-width="3"/>';
        ve += veChu(c.ten, xc + Math.round(rongCot / 2), dinh + coDau * 1.05,
          {co: coDau, chu: CHU_THAN, dam: 800, mau: nenDac(mau, 4.6),
           rong: rongCot - 32, gian: 1.2, can: 'middle'}).svg;
      } else {
      ve += '<g filter="url(#' + bong.id + ')"><rect class="gita-tam" x="' + xc +
        '" y="' + dinh +
        '" width="' + rongCot + '" height="' + Math.round(caoChip) + '" rx="12" ' +
        'fill="url(#' + gC + ')"/></g>';
      ve += veChu(c.ten, xc + Math.round(rongCot / 2), dinh + coDau * 1.05,
        {co: coDau, chu: CHU_THAN, dam: 800, mau: mucTren(mau),
         rong: rongCot - 32, gian: 1.2, can: 'middle'}).svg;
      }

      var yy = dinh + caoChip + 14;

      /* ── MỘT CẢNH NÉT CHO MỖI BÊN ──
         Tấm mẫu chủ hệ gửi đặt một hình vẽ ở đầu mỗi cột: bên trái
         một người rối, bên phải một người cầm bản đồ. Hình ấy không
         trang trí — nó nói KẾT LUẬN của cột trước khi người đọc kịp
         đọc danh sách, và danh sách chỉ đi chứng minh lại.
         Người viết chọn bằng "HÌNH: ma", không chọn thì đoán theo tên
         cột; bên trái mặc định là người rối, bên phải là người leo. */
      var maH = docDau(x.noiDung, 'HÌNH' + (i === 0 ? '1' : '2')) ||
        chonNguoi(c.ten + ' ' + c.phu, i === 0 ? 6 : 5);
      if (i === 0 && !docDau(x.noiDung, 'HÌNH1') &&
          !/\b(?:roi|be tac|cam tinh|lung tung)\b/.test(boDauChu(c.ten + ' ' + c.phu)))
        maH = 'roi';
      if (i === 1 && !docDau(x.noiDung, 'HÌNH2') &&
          !/\b(?:lo trinh|ban do|dong hanh|gia dinh)\b/.test(boDauChu(c.ten + ' ' + c.phu)))
        maH = 'leo';
      var caoH = Math.round(kg.h * 0.115);
      ve += k.but
        ? '<rect' + netRun + ' x="' + (xc + Math.round(rongCot * 0.14)) +
          '" y="' + Math.round(yy) + '" width="' + Math.round(rongCot * 0.72) +
          '" height="' + Math.round(caoH * 1.16) + '" rx="12" fill="none" stroke="' +
          h(nenDac(mau, 3.2)) + '" stroke-width="2" stroke-opacity="0.75"/>'
        : '<rect x="' + (xc + Math.round(rongCot * 0.14)) + '" y="' + Math.round(yy) +
          '" width="' + Math.round(rongCot * 0.72) + '" height="' + Math.round(caoH * 1.16) +
          '" rx="14" fill="' + h(mau) + '" fill-opacity="' + (k.sau ? '0.14' : '0.09') + '"/>';
      /* Giấy bút thì vẽ NÉT — trên giấy không có khối, chỉ có nét đè
         nét. Mọi nền khác thì vẽ KHỐI: cùng hình ấy, thêm hướng sáng,
         bóng tiếp đất và vệt bắt sáng. */
      if (k.but) {
        ve += '<g' + netRun + '>' +
          veNet('nguoi', maH, xc + Math.round(rongCot / 2),
            Math.round(yy + caoH * 0.58), caoH, nenDac(mau, 4.6), 3.2, true) +
          '</g>';
      } else {
        var nk = veNguoiKhoi(maH, xc + Math.round(rongCot / 2),
          Math.round(yy + caoH * 0.52), caoH, mau, k, null);
        ve += nk.ve;
      }
      yy += caoH * 1.16 + 14;

      if (c.phu) {
        var coPhu2 = Math.round(kg.w * 0.021);
        ve += veDongQuang(c.phu, xc + Math.round(rongCot / 2), yy + coPhu2 * 0.85,
          {co: coPhu2, chu: CHU_THAN, dam: 700, mau: k.muc, can: 'middle',
           rongToiDa: rongCot - 28}).svg;
        yy += coPhu2 * 2.1;
      }

      /* Danh sách có dấu: dấu nằm trong một vòng tròn màu đặc, chữ
         nằm NGOÀI vòng — hai thứ tách bạch, không chồng lên nhau. */
      var coY = Math.round(kg.w * 0.0195), rD = Math.round(coY * 0.78);
      /* ── GIÃN ĐỀU CHO HẾT VÙNG, KHÔNG ĐỂ HỞ ĐÁY ──
         Cụm ngắn hơn khung là mặt trái của lỗi "cụm dài hơn khung":
         cùng một nguyên nhân — không đo trước. Đo tổng chiều cao danh
         sách, còn thừa bao nhiêu thì CHIA ĐỀU vào các khe, chặn trần
         để tấm ít mục không bị kéo giãn thành thưa thớt. */
      var ds2 = c.y.slice(0, 9);
      var caoDs = 0;
      ds2.forEach(function (m) {
        var d2 = catDong(m.t, '500 ' + coY + 'px ' + CHU_THAN, rongCot - rD * 2 - 16);
        caoDs += Math.max(rD * 2, d2.length * coY * 1.34) + coY * 0.52;
      });
      var thua = Math.max(0, dayVung - yy - caoDs);
      var themKhe = ds2.length > 1
        ? Math.min(coY * 1.15, thua / (ds2.length - 1)) : 0;
      ds2.forEach(function (m) {
        var mD = m.dung ? mauDung : mauSai;
        var dong = catDong(m.t, '500 ' + coY + 'px ' + CHU_THAN,
          rongCot - rD * 2 - 16);
        /* Nền bút: dấu vẽ bằng NÉT trên giấy, không phải một huy hiệu
           tô đặc. Hai nét chéo cho dấu sai, hai nét gấp cho dấu đúng
           — đúng thứ tay người vạch ra khi ghi nhanh một danh sách. */
        if (k.but) {
          var mB = nenDac(mD, 4.6), r2 = rD * 0.86;
          ve += '<g' + netRun + ' stroke="' + h(mB) + '" stroke-width="' +
            Math.max(2, rD * 0.26).toFixed(1) + '" stroke-linecap="round" fill="none">' +
            (m.dung
              ? '<path d="M' + (xc + rD - r2 * 0.62) + ' ' + Math.round(yy + rD) +
                ' l' + (r2 * 0.45).toFixed(1) + ' ' + (r2 * 0.52).toFixed(1) +
                ' l' + (r2 * 0.92).toFixed(1) + ' -' + (r2 * 1.12).toFixed(1) + '"/>'
              : '<path d="M' + (xc + rD - r2 * 0.6) + ' ' + Math.round(yy + rD - r2 * 0.6) +
                ' l' + (r2 * 1.2).toFixed(1) + ' ' + (r2 * 1.2).toFixed(1) +
                ' M' + (xc + rD + r2 * 0.6) + ' ' + Math.round(yy + rD - r2 * 0.6) +
                ' l-' + (r2 * 1.2).toFixed(1) + ' ' + (r2 * 1.2).toFixed(1) + '"/>') +
            '</g>';
        } else
        ve += '<circle cx="' + (xc + rD) + '" cy="' + Math.round(yy + rD) +
          '" r="' + rD + '" fill="' + h(mD) + '"/>' +
          '<g transform="translate(' + (xc + rD) + ',' + Math.round(yy + rD) +
          ') scale(' + (rD / 13).toFixed(3) + ')" fill="#FFFFFF">' +
          HINH[m.dung ? 'dung' : 'sai'] + '</g>';
        dong.forEach(function (t2, j) {
          ve += '<text x="' + (xc + rD * 2 + 12) + '" y="' +
            Math.round(yy + rD + coY * 0.36 + j * coY * 1.34) +
            '" font-family="' + h(CHU_THAN) + '" font-size="' + coY +
            '" font-weight="500" fill="' + h(k.muc2) + '">' + h(t2) + '</text>';
        });
        yy += Math.max(rD * 2, dong.length * coY * 1.34) + coY * 0.52 + themKhe;
      });
    });

    var g = gom(manh);
    return {ok: true, svg: khung(kg, k,
      nen.ve + '<rect x="0" y="0" width="' + kg.w + '" height="6" fill="' +
      h(k.gita) + '"/>' + dnhan + tieu.svg + (dbang ? dbang.ve : '') + ve +
      dauGita(k, le + Math.round(21 * tiDau(kg)), kg.h - Math.round(kg.h * 0.030), kg), g.defs)};
  }

  /* ═══════════════════════════════════════════════════════════════
     HÌNH NGƯỜI VÀ BỐI CẢNH — VẼ BẰNG NÉT

     ══ TÔI ĐÃ TỰ GIỚI HẠN SAI ══
     Bốn bản liền tôi nói "máy không vẽ được người thật". Đúng, nếu
     "thật" nghĩa là ảnh chụp. Nhưng những tấm mẫu chủ hệ gửi KHÔNG
     dùng ảnh chụp — chúng dùng HÌNH VẼ NÉT: một người ngồi bàn, hai
     người đối thoại, một người đi qua cầu. Nét thì vẽ được, và nét
     mới là thứ hợp với một tấm thông tin: ảnh chụp kéo mắt về khuôn
     mặt, nét để mắt ở lại với nội dung.

     ══ VÀ NÉT TRÁNH ĐƯỢC ĐÚNG THỨ THƯƠNG HIỆU CẤM ══
     BRAND.camKy: "Không dùng ảnh trẻ em khi chưa có văn bản đồng ý
     của cha mẹ và của chính trẻ từ 7 tuổi." Hình nét KHÔNG CÓ MẶT,
     không có ai để nhận ra — nên nó không chạm vào luật ấy, mà vẫn
     nói được "đây là một đứa trẻ, đây là cha mẹ".
     BRAND.dungO ghi "Bài đại sứ: ảnh nền không có hình người". Dòng
     ấy nói về ẢNH NỀN của BÀI ĐẠI SỨ — một tấm thông tin có hình vẽ
     nét minh hoạ vai không phải thứ ấy. Tôi đọc thế và nói ra, để
     chủ hệ bác được nếu tôi đọc sai.

     ══ LUẬT VẼ NGƯỜI Ở ĐÂY ══
     Không mặt. Không tay chi tiết. Không quần áo có kiểu. Một hình
     người ở đây nói VAI — phụ huynh, học viên, người làm nghề — chứ
     không nói một con người cụ thể. Thêm một nét mặt là bắt đầu nói
     về một người, và lúc ấy mọi câu hỏi về đồng ý hình ảnh quay lại.
     ═══════════════════════════════════════════════════════════════ */
  var NGUOI = {
    /* ══ HÌNH KHỐI PHẲNG, KHÔNG PHẢI HÌNH QUE ══
       Bản trước tôi vẽ người bằng nét mảnh — que. Que đọc được nhưng
       trông như bản phác, và một tấm ấn phẩm mang dấu GITA thì không
       được trông như bản phác. Hình KHỐI: đầu và thân tô đặc, tay
       chân là nét DÀY đầu tròn. Khối đọc được ở cỡ nhỏ, que thì mờ.

       Vẫn KHÔNG MẶT. Không mắt, không miệng. Hình ở đây nói VAI, và
       một khuôn mặt là bắt đầu nói về một người — lúc ấy mọi câu hỏi
       về bản quyền và đồng ý hình ảnh quay lại. Máy tự dựng từ hình
       học, không chép của ai. */
    nguoi: '<circle cx="0" cy="-20" r="15"/>' +
           '<path d="M-30 44 C-30 14 -15 2 0 2 C15 2 30 14 30 44 Z"/>',
    /* Lắng nghe — một tay đưa lên cằm. Hình của NGƯỜI LÀM NGHỀ: việc
       đầu tiên trong hệ này là nghe, không phải nói. */
    /* Tay phải đi TỪ VAI lên tới CẰM, và nắm tay chạm cằm. Bản đầu
       tôi đặt nắm tay ở ngoài má nên nó đọc ra thành một cái đuôi
       tròn cạnh đầu, không đọc ra là tay chống cằm. Một chi phải nối
       vào thân ở một đầu và chạm vào chỗ nó tới ở đầu kia — thiếu
       một trong hai thì nó thành một vệt rời. */
    nghe:  '<circle cx="-4" cy="-20" r="15"/>' +
           '<path d="M-33 44 C-33 15 -18 3 -4 3 C10 3 25 15 25 44 Z"/>' +
           '<path d="M21 40 C30 26 22 8 8 -4" fill="none" stroke-width="9" ' +
           'stroke-linecap="round"/>' +
           '<circle cx="5" cy="-6" r="7.5"/>',
    /* Chỉ lên — tư thế trong chính ảnh mẫu của chủ hệ */
    chi:   '<circle cx="-4" cy="-18" r="14"/>' +
           '<path d="M-32 44 C-32 16 -18 4 -4 4 C10 4 24 16 24 44 Z"/>' +
           '<path d="M20 40 C30 26 26 4 22 -18" fill="none" stroke-width="10" ' +
           'stroke-linecap="round"/>' +
           '<circle cx="22" cy="-24" r="7"/>',
    /* Nắm tay — vượt qua được */
    mung:  '<circle cx="-4" cy="-18" r="14"/>' +
           '<path d="M-32 44 C-32 16 -18 4 -4 4 C10 4 24 16 24 44 Z"/>' +
           '<path d="M20 40 C32 28 28 4 24 -8" fill="none" stroke-width="10" ' +
           'stroke-linecap="round"/>' +
           '<rect x="15" y="-24" width="19" height="17" rx="7"/>',
    /* Hai người đối thoại — một bong bóng thoại giữa hai đầu */
    hai:   '<circle cx="-19" cy="-14" r="12"/>' +
           '<path d="M-42 44 C-42 20 -31 9 -19 9 C-7 9 4 20 4 44 Z"/>' +
           '<circle cx="20" cy="-14" r="12"/>' +
           '<path d="M-3 44 C-3 20 8 9 20 9 C32 9 43 20 43 44 Z"/>' +
           '<path d="M-11 -46 h24 a6 6 0 0 1 6 6 v11 a6 6 0 0 1 -6 6 h-9 ' +
           'l-8 7 v-7 h-7 a6 6 0 0 1 -6 -6 v-11 a6 6 0 0 1 6 -6 z"/>',
    /* Cả nhà — hai người lớn, một trẻ Ở GIỮA. Ở giữa chứ không đứng
       trước: hệ này nói nhà đi cùng nhau, không nói người lớn đẩy
       đứa trẻ đi trước mặt mình. */
    /* Cả nhà: hai người lớn tách hẳn sang hai bên, trẻ ở GIỮA và
       thấp hơn. Bản đầu ba thân chồng lên nhau nên cụm ra thành một
       khối liền có ba cái đầu nổi lên — mắt không tách được ai với
       ai. Ba thân phải RỜI nhau thì mới đọc ra là ba người. */
    nha:   '<circle cx="-30" cy="-18" r="11"/>' +
           '<path d="M-48 44 C-48 22 -40 12 -30 12 C-20 12 -12 22 -12 44 Z"/>' +
           '<circle cx="30" cy="-18" r="11"/>' +
           '<path d="M12 44 C12 22 20 12 30 12 C40 12 48 22 48 44 Z"/>' +
           '<circle cx="0" cy="4" r="8.5"/>' +
           '<path d="M-9 44 C-9 30 -5 22 0 22 C5 22 9 30 9 44 Z"/>',
    /* Ngồi bàn — bối cảnh học và làm */
    ban:   '<circle cx="-6" cy="-24" r="13"/>' +
           '<path d="M-30 20 C-30 -2 -18 -9 -6 -9 C6 -9 18 -2 18 20 Z"/>' +
           '<rect x="-40" y="22" width="80" height="7" rx="3.5"/>' +
           '<path d="M-32 29 v16 M32 29 v16" fill="none" stroke-width="7" ' +
           'stroke-linecap="round"/>' +
           '<path d="M6 22 l7 -16 h20 l-4 16 z"/>',
    /* Leo bậc tới lá cờ — hành trình có bậc, không phải một cú nhảy */
    leo:   '<path d="M-46 44 h16 v-11 h15 v-11 h15 v-12 h16" fill="none" ' +
           'stroke-width="8" stroke-linejoin="round" stroke-linecap="round"/>' +
           '<circle cx="0" cy="-16" r="12"/>' +
           '<path d="M-18 22 C-18 2 -10 -4 0 -4 C10 -4 18 2 18 22 Z"/>' +
           '<path d="M-10 22 l-8 18 M8 22 l10 12" fill="none" stroke-width="9" ' +
           'stroke-linecap="round"/>' +
           '<path d="M34 -6 v-38" fill="none" stroke-width="6" stroke-linecap="round"/>' +
           '<path d="M34 -44 l22 8 l-22 8 z"/>',
    /* Cầm bản đồ — có phương hướng */
    /* Bản đồ vẽ bằng nét TRẮNG đè lên thân. Bản đầu vẽ nét CÙNG MÀU
       với thân, nên nó chìm hẳn vào khối và cả hình đọc ra thành một
       người đang ôm một cái hộp. Một chi tiết đặt TRÊN một khối đặc
       thì phải khác màu khối ấy — nếu không, nó không tồn tại. */
    bando: '<circle cx="0" cy="-28" r="13"/>' +
           '<path d="M-28 44 C-28 14 -14 2 0 2 C14 2 28 14 28 44 Z"/>' +
           '<path d="M-21 14 L0 9 L21 14 L21 34 L0 29 L-21 34 Z" fill="none" ' +
           'stroke="#FFFFFF" stroke-width="6" stroke-linejoin="round"/>' +
           '<path d="M0 9 V29" fill="none" stroke="#FFFFFF" stroke-width="4"/>',
    /* Rối — một cuộn chỉ rối trên đầu. Không vẽ mặt buồn: một nét mặt
       là bắt đầu nói về một người cụ thể. */
    roi:   '<circle cx="0" cy="-14" r="14"/>' +
           '<path d="M-30 44 C-30 16 -15 5 0 5 C15 5 30 16 30 44 Z"/>' +
           '<path d="M-16 -40 c9 -12 24 -4 15 5 c-9 9 -24 2 -12 -9 ' +
           'c12 -10 27 6 13 12" fill="none" stroke-width="6" ' +
           'stroke-linecap="round"/>'
  };
  var CANH = {
    cay:  '<path d="M0 26 V4 M0 10 c-12 0 -16 -10 -16 -16 c10 0 16 6 16 16 z ' +
          'M0 6 c12 0 17 -11 17 -18 c-11 0 -17 7 -17 18 z"/>',
    sach: '<path d="M-20 26 h40 v-8 h-40 z M-17 18 h34 v-8 h-34 z M-14 10 h28 v-8 h-28 z"/>',
    nui:  '<path d="M-32 22 L-12 -12 L-2 4 L10 -20 L32 22 Z"/>',
    bien: '<path d="M-2 28 V-16 M-2 -16 h26 l7 8 l-7 8 h-26 M-2 0 h-22 l-7 8 l7 8 h22"/>',
    cau:  '<path d="M-34 20 h10 M24 20 h10 M-24 20 C-24 -6 24 -6 24 20 ' +
          'M-24 20 V10 M-12 20 V4 M0 20 V0 M12 20 V4 M24 20 V10"/>'
  };

  /* ═══════════ NGƯỜI CÓ KHỐI ═══════════

     Chủ hệ hỏi "vẽ người 3D". Trong một tấm vector thì 3D không phải
     dựng lưới tam giác — nó là BA THỨ mắt dùng để đọc ra khối, và cả
     ba đều vẽ được bằng hình phẳng:

       1. một hướng sáng DUY NHẤT cho cả tấm, nên chỗ nào cũng sáng ở
          cùng một phía và tối ở cùng một phía
       2. một bóng TIẾP ĐẤT — vệt tối ngay dưới chân, nói vật này đứng
          trên một mặt phẳng chứ không trôi
       3. một bóng ĐỔ mềm về phía khuất sáng

     Thiếu bóng tiếp đất là chỗ hay hỏng nhất: có chuyển sắc, có bóng
     đổ, mà hình vẫn trôi lơ lửng — vì mắt tìm chỗ vật CHẠM mặt đất
     trước khi nó tin vật ấy có khối.

     Hướng sáng đọc từ HUONG_SANG, cùng biến với huy hiệu và tấm kính.
     Hai vật cạnh nhau đổ bóng hai phía là hai vật ở hai thế giới.

     ── VÀ VẪN KHÔNG MẶT ──
     Khối làm hình dày lên, không làm nó thành một người cụ thể. Không
     mắt, không miệng — luật cũ của NGUOI giữ nguyên. */
  function veNguoiKhoi(ma, cx, cy, cao, mau, k, bongId) {
    var t = NGUOI[ma];
    if (!t) return {defs: '', ve: ''};
    var ty = cao / 100;
    var g = idMoi('ngk'), gs = idMoi('ngs'), gd = idMoi('ngd');
    var sang = doiSang(mau, k && k.sau ? 0.26 : 0.20);
    var toi = doiSang(mau, k && k.sau ? -0.20 : -0.24);
    /* Bóng tiếp đất: bẹt, mờ dần ra rìa. Rộng hơn thân một chút và
       rất thấp — bóng cao thì đọc ra là một vũng, không ra bóng. */
    var rX = cao * 0.34, rY = cao * 0.075;
    var yDat = cy + cao * 0.455;
    var ve =
      '<defs><radialGradient id="' + gd + '" cx="50%" cy="50%" r="50%">' +
        '<stop offset="0%" stop-color="' + h(k && k.sau ? '#000000' : k.gitaSau) +
          '" stop-opacity="' + (k && k.sau ? 0.55 : 0.30) + '"/>' +
        '<stop offset="100%" stop-color="' + h(k && k.sau ? '#000000' : k.gitaSau) +
          '" stop-opacity="0"/></radialGradient>' +
      '<linearGradient id="' + g + '" x1="' + (0.5 - HUONG_SANG.dx * 0.42).toFixed(2) +
        '" y1="' + (0.5 - HUONG_SANG.dy * 0.42).toFixed(2) + '" x2="' +
        (0.5 + HUONG_SANG.dx * 0.42).toFixed(2) + '" y2="' +
        (0.5 + HUONG_SANG.dy * 0.42).toFixed(2) + '">' +
        '<stop offset="0%" stop-color="' + h(sang) + '"/>' +
        '<stop offset="55%" stop-color="' + h(mau) + '"/>' +
        '<stop offset="100%" stop-color="' + h(toi) + '"/></linearGradient>' +
      /* Vệt sáng viền: một bản hình nhỏ hơn, sáng hơn, lệch về phía
         nguồn sáng — đủ để mép trên-trái bắt sáng. */
      '<linearGradient id="' + gs + '" x1="0" y1="0" x2="0.7" y2="1">' +
        '<stop offset="0%" stop-color="' + h(doiSang(mau, 0.45)) +
          '" stop-opacity="0.85"/>' +
        '<stop offset="45%" stop-color="' + h(doiSang(mau, 0.45)) +
          '" stop-opacity="0"/></linearGradient></defs>' +
      '<ellipse cx="' + cx.toFixed(1) + '" cy="' + yDat.toFixed(1) + '" rx="' +
        rX.toFixed(1) + '" ry="' + rY.toFixed(1) + '" fill="url(#' + gd + ')"/>' +
      '<g' + (bongId ? ' filter="url(#' + bongId + ')"' : '') +
        ' transform="translate(' + cx + ',' + cy + ') scale(' + ty.toFixed(4) +
        ')" fill="url(#' + g + ')" stroke="url(#' + g + ')" ' +
        'stroke-linejoin="round" class="gita-net">' + t + '</g>' +
      /* Lớp bắt sáng vẽ CHỒNG lên, thu nhỏ quanh tâm để nó nằm gọn
         bên trong đường viền — tràn ra ngoài thì thành một quầng, và
         quầng thì nói "vật này phát sáng", không nói "vật này có khối". */
      '<g transform="translate(' + cx + ',' + (cy - cao * 0.012) + ') scale(' +
        (ty * 0.94).toFixed(4) + ')" fill="url(#' + gs + ')" stroke="none">' +
        t + '</g>';
    return {defs: '', ve: ve};
  }

  /* Vẽ một hình nét. Hình người trong hộp 100 đơn vị; `cao` là chiều
     cao thật trên tấm. Nét dày theo cỡ, để hình nhỏ không thành một
     vệt mờ và hình lớn không thành một khối đen. */
  function veNet(bo, ma, cx, cy, cao, mau, dam, chiNet) {
    var t = (bo === 'nguoi' ? NGUOI : CANH)[ma];
    if (!t) return '';
    var ty = cao / 100;
    /* ── TRÊN GIẤY BÚT: HÌNH NGƯỜI VẼ BẰNG NÉT, KHÔNG TÔ ĐẶC ──
       Hình người trong kho dựng bằng khối đặc — đúng cho một tấm in
       màu, sai cho một trang giấy vẽ tay: trên giấy, một khối đặc đọc
       ra là một vết mực đổ, không ra một người. Cùng hình ấy, chỉ đổi
       tô thành nét, là ra đúng thứ tay người vẽ. */
    if (bo === 'nguoi' && chiNet)
      return '<g transform="translate(' + cx + ',' + cy + ') scale(' + ty.toFixed(4) +
        ')" fill="none" stroke="' + h(mau) + '" stroke-width="' + (dam || 4) +
        '" stroke-linecap="round" stroke-linejoin="round" class="gita-net">' +
        t + '</g>';
    /* Hình NGƯỜI dựng bằng khối đặc — nhóm tô màu, phần nào cần nét
       thì tự khai fill="none" và stroke-width của riêng nó. Hình BỐI
       CẢNH vẫn vẽ bằng nét, vì bối cảnh phải nhạt hơn người: người là
       chủ thể, bối cảnh chỉ nói chỗ đứng. */
    if (bo === 'nguoi')
      return '<g transform="translate(' + cx + ',' + cy + ') scale(' + ty.toFixed(4) +
        ')" fill="' + h(mau) + '" stroke="' + h(mau) + '" stroke-linejoin="round" ' +
        'class="gita-net">' + t + '</g>';
    return '<g transform="translate(' + cx + ',' + cy + ') scale(' + ty.toFixed(4) +
      ')" fill="none" stroke="' + h(mau) + '" stroke-width="' + (dam || 5) +
      '" stroke-linecap="round" stroke-linejoin="round" class="gita-net">' +
      t + '</g>';
  }

  /* Chọn hình người theo nghĩa của tên vai, cùng luật với biểu tượng:
     khớp theo BIÊN TỪ, không khớp giữa từ. */
  var TU_KHOA_NGUOI = [
    ['nghe',  'coach|nguoi lam nghe|tu van|lang nghe|chuyen gia'],
    ['nha',   'gia dinh|ca nha|phu huynh|cha me|bo me'],
    ['hai',   'doi thoai|trao doi|hoi dap|ket noi|dong hanh'],
    ['ban',   'hoc vien|hoc sinh|lam bai|hoc tap|ghi chep'],
    ['leo',   'but pha|vuot|tien bo|nang cap|thanh cong|muc tieu'],
    ['bando', 'lo trinh|chien luoc|dinh huong|ban do|phuong huong'],
    ['roi',   'roi|be tac|khong biet|mat phuong huong|cam tinh|lung tung'],
    ['chi',   'dinh huong|chi ra|huong dan|dan duong|mo duong'],
    ['mung',  'thanh cong|vuot qua|lam duoc|tu tin|niem tin']
  ];
  function chonNguoi(ten, i) {
    var t = boDauChu(ten);
    for (var j = 0; j < TU_KHOA_NGUOI.length; j++)
      if (new RegExp('\\b(?:' + TU_KHOA_NGUOI[j][1] + ')\\b', 'i').test(t))
        return TU_KHOA_NGUOI[j][0];
    return ['nghe', 'nha', 'ban', 'hai', 'bando', 'leo', 'chi', 'mung'][i % 8];
  }

  /* ── ĐẦU TẤM VÀ CHÂN TẤM, DỰNG MỘT LẦN ──
     Nhãn trên → tiêu đề → dải băng → (thân) → dấu GITA. Bốn bộ vẽ
     trước mỗi bộ chép lại khối này, và mỗi lần chép là một chỗ để
     quên một mảnh defs hoặc tính lệch một khoảng — tôi đã quên đúng
     hai lần rồi. Gom một chỗ thì mọi tấm có cùng một nhịp đầu, và
     sửa nhịp ấy là sửa cho tất cả.
     Trả về `dinh` — chỗ thân tấm được phép bắt đầu — vì đó là con số
     duy nhất bộ vẽ nào cũng cần và cũng dễ đoán sai nhất. */
  function dauTam(x, kg, k, chiaTieu) {
    var nhan = docDau(x.noiDung, 'NHÃN'), bang2 = docDau(x.noiDung, 'BĂNG');
    var le = Math.round(kg.w * 0.055);
    var nen = lopNen(kg, k, 1.1);
    var bong = defBong(k, 1), bongHh = defBong(k, 2), cs = defChuSac(k);
    var manh = [nen, bong, bongHh, cs];

    var coTieu = Math.round(kg.w / (chiaTieu || 24));
    var yTieu = Math.round(kg.h * (nhan ? 0.078 : 0.062)) + coTieu;
    var tieu = veChu(x.nhiemVu, Math.round(kg.w / 2), yTieu,
      {co: coTieu, chu: CHU_TIEU, dam: 600, mau: 'url(#' + cs.id + ')',
       rong: kg.w - le * 2, gian: 1.16, can: 'middle'});
    var dnhan = nhan ? nhanTren(nhan, le + 6,
      Math.round(yTieu - coTieu * 0.95), k, Math.round(coTieu * 0.40)) : '';

    var day = yTieu + tieu.cao;
    var dbang = null;
    if (bang2) {
      dbang = daiBang(bang2, Math.round(kg.w / 2), Math.round(day + coTieu * 0.24),
        k, kg.w - le * 2);
      manh.push(dbang);
      day = day + coTieu * 0.24 + dbang.cao;
    }
    return {
      dinh: Math.round(day + coTieu * 0.58),
      manh: manh, bong: bong, bongHh: bongHh, cs: cs, le: le,
      tren: nen.ve + '<rect x="0" y="0" width="' + kg.w + '" height="6" fill="' +
        h(k.gita) + '"/>' + dnhan + tieu.svg + (dbang ? dbang.ve : ''),
      duoi: dauGita(k, le + Math.round(21 * tiDau(kg)), kg.h - Math.round(kg.h * 0.030), kg)
    };
  }

  /* ═══════════════════════════════════════════════════════════════
     ẢNH NGƯỜI THẬT — CHỦ HỆ CHO PHÉP, VÀ CHỈ ẢNH CỦA CHÍNH ANH

     BRAND.camKy cấm dùng ảnh trẻ em chưa có văn bản đồng ý, và cấm
     ảnh chụp bảng số của một gia đình chưa được phép. Ảnh chân dung
     của CHÍNH chủ hệ không nằm trong hai điều cấm ấy, và anh đã cho
     phép bằng câu nói thẳng. Nên bộ vẽ nhận đúng MỘT ảnh: ảnh trainer
     đã cắt nền, để trong assets/anh/.

     Không có đường nào nạp một ảnh khác vào đây. Muốn thêm ảnh người
     thì phải thêm tệp vào kho mã và sửa danh sách này — tức là phải
     đi qua một lượt duyệt, không phải một lượt gõ. Đó là chỗ khác
     nhau giữa "bộ vẽ dùng ảnh" và "bộ vẽ nhận ảnh nào cũng vẽ".

     ══ VÌ SAO ẢNH LÀ MỘT TỆP, KHÔNG PHẢI MỘT CHUỖI NHÚNG ══
     Nhúng thẳng vào mã thì gói mã nặng thêm ba trăm ký cho MỌI người
     dùng, kể cả người không bao giờ mở màn thiết kế. Để thành tệp thì
     chỉ ai vẽ mới tải. Đổi lại: tấm SVG tách rời khỏi kho sẽ mất ảnh
     — nên chỗ nào cần một tấm đứng độc lập thì phải nhúng lúc xuất,
     không phải lúc vẽ.
     Và nói cho đúng: đây là tệp CÙNG MỘT MÁY CHỦ với trang đang chạy.
     Luật "không một lượt hỏi mạng nào" của bộ vẽ nói về NỘI DUNG ĐI
     RA — không có gì rời khỏi Học viện ở đây. */
  var ANH_NGUOI = {
    trainer: {tep: 'assets/anh/trainer-quang.png', w: 276, h: 536,
              ten: 'Trương Nhật Quang', vai: 'Mentor định hướng nghề nghiệp'},
    /* ── BẢN VẼ MÀU, DỰNG TỪ CHÍNH TẤM ẢNH TRÊN ──
       Chủ hệ chốt 9.99.27: "tạo ảnh vẽ màu sắc nét và tạo dựng từ hình
       người thật để có 90% nét tương đồng."
       Dựng bằng tools/ve-tu-anh.py: gộp màu thành mảng rồi kẻ lại biên.
       Không đoán một điểm ảnh nào — nên nét tương đồng giữ được, và
       không cần bộ tạo ảnh nào.
       Vẫn là ẢNH trong kho ảnh, không phải hình vẽ của máy: nó dựng từ
       một tấm ảnh có người thật đã đồng ý. Nên luật C16 nhận nó, còn
       một hình vẽ máy tự dựng thì không. */
    'trainer-ve': {tep: 'assets/anh/trainer-quang-ve.png', w: 276, h: 536,
              ten: 'Trương Nhật Quang', vai: 'Mentor định hướng nghề nghiệp'}
  };

  /* ── ẢNH THẬT CHỈ DÙNG Ở MỘT CHỖ, VÀ ĐÓ LÀ MỘT LUẬT ──
     Chủ hệ nói thẳng: "không phải ảnh nào cũng sử dụng ảnh thương
     hiệu của tôi". Đúng, và lý do sâu hơn một sở thích: ảnh chân
     dung một người thật gắn tấm hình vào MỘT NGƯỜI. Một tấm nói về
     phần việc của phụ huynh mà có mặt trainer thì người đọc hiểu là
     trainer đang dạy họ, chứ không hiểu là hệ thống mô tả vai.

     Nên: ảnh thật CHỈ ở THẺ NGÀY — ấn phẩm định kỳ đứng tên anh, nơi
     mặt anh chính là nội dung. Mười một loại hình còn lại dùng hình
     người do máy dựng: không mặt, không ai để nhận ra, không chép
     của ai, nên không đụng bản quyền hay quyền hình ảnh của bất kỳ
     người nào. Bộ kiểm canh chỗ này. */
  function veAnhNguoi(ma, x, y, cao, k, sac) {
    var a = ANH_NGUOI[ma];
    if (!a) return '';
    var rong = Math.round(cao * a.w / a.h);
    var idc = idMoi('cung');
    /* Vòng cung xanh sau người — cùng ngôn ngữ với tấm mẫu, và nó
       cũng là thứ làm mép ảnh đọc ra là THIẾT KẾ chứ không phải một
       hình chữ nhật dán lên. */
    return '<g>' +
      '<radialGradient id="' + idc + '" cx="50%" cy="50%" r="50%">' +
        '<stop offset="60%" stop-color="' + h(sac) + '" stop-opacity="' +
          (k.sau ? '0.30' : '0.16') + '"/>' +
        '<stop offset="100%" stop-color="' + h(sac) + '" stop-opacity="0"/>' +
      '</radialGradient>' +
      '<circle cx="' + Math.round(x + rong * 0.50) + '" cy="' +
        Math.round(y + cao * 0.30) + '" r="' + Math.round(rong * 0.62) +
        '" fill="url(#' + idc + ')"/>' +
      '<image href="' + h(a.tep) + '" x="' + Math.round(x) + '" y="' +
        Math.round(y) + '" width="' + rong + '" height="' + Math.round(cao) +
        '" preserveAspectRatio="xMidYMin meet"/>' +
      '</g>';
  }

  /* Bảng tên trainer — khối navy đặc dưới chân ảnh, đúng như tấm mẫu. */
  function bangTen(ma, giuaX, y, rong, k) {
    var a = ANH_NGUOI[ma];
    if (!a) return {svg: '', cao: 0};
    var co1 = Math.round(rong * 0.088), co2 = Math.round(rong * 0.052);
    var coTen = co1, coVai = co2;
    while (coTen > 10 &&
           doRong(a.ten, '800 ' + coTen + 'px ' + CHU_THAN) > rong - 52) coTen -= 1;
    while (coVai > 7 &&
           doRong(a.vai.toUpperCase(), '600 ' + coVai + 'px ' + CHU_THAN) >
           rong - 48) coVai -= 1;

    /* ── HAI DÒNG NÀY TỪNG DÍNH VÀO NHAU ──
       Ba đường chân trong khối này neo cứng: 0,98 · 2,02 · 2,72 lần
       co1. Khoảng giữa tên và chức danh là 0,70·co1 — đủ cho chữ La
       Mã, KHÔNG đủ cho "Trương Nhật Quang" (chữ ư và dấu nặng thõng
       xuống) đứng trên "MENTOR ĐỊNH HƯỚNG NGHỀ NGHIỆP" (Đ, Ị, Ư trồi
       lên). Đo ra chồng 5 điểm ảnh, ngay trên tấm biển mang tên chủ
       hệ. Nay đường chân chức danh lùi theo MỰC thật của hai dòng. */
    var mTen = mucDoc(a.ten, '800 ' + coTen + 'px ' + CHU_THAN);
    var mVai = mucDoc(a.vai.toUpperCase(), '600 ' + coVai + 'px ' + CHU_THAN);
    var yTen = co1 * 2.02;
    var yVai = yTen + Math.max(co1 * 0.70, mTen.duoi + mVai.tren + co2 * 0.30);
    var cao = Math.round(Math.max(co1 * 2.9, yVai + mVai.duoi + co1 * 0.28));
    return {cao: cao, svg:
      '<rect class="gita-tam" x="' + Math.round(giuaX - rong / 2) + '" y="' +
        Math.round(y) +
        '" width="' + rong + '" height="' + cao + '" rx="10" fill="' +
        h(k.gitaInk) + '"/>' +
      '<text x="' + giuaX + '" y="' + Math.round(y + co1 * 0.98) +
        '" text-anchor="middle" font-family="' + h(CHU_THAN) + '" font-size="' +
        /* Chữ TRAINER trên khối navy: trắng mờ, không xanh sáng. Xanh
           sáng trên navy chỉ được 2,70:1 — hai màu cùng họ thì gần
           nhau về độ sáng dù nhìn có vẻ tương phản. */
        Math.round(co2 * 0.92) + '" font-weight="700" ' +
        'fill="rgba(255,255,255,0.92)" letter-spacing="' +
        (co2 * 0.30).toFixed(1) + '">TRAINER</text>' +
      /* Co cho vừa khối. Tên người và chức danh dài ngắn khác nhau,
         nên đặt một cỡ chữ cố định là chắc chắn có ngày tràn — và
         tràn ở đây là tên trainer chạy ra ngoài tấm biển mang tên
         chính anh, chỗ hỏng khó tha nhất trong cả tấm. */
      '<text x="' + giuaX + '" y="' + Math.round(y + yTen) +
        '" text-anchor="middle" font-family="' + h(CHU_THAN) + '" font-size="' +
        coTen + '" font-weight="800" fill="#FFFFFF">' + h(a.ten) + '</text>' +
      '<text x="' + giuaX + '" y="' + Math.round(y + yVai) +
        '" text-anchor="middle" font-family="' + h(CHU_THAN) + '" font-size="' +
        coVai + '" font-weight="600" fill="rgba(255,255,255,0.90)">' +
        h(a.vai.toUpperCase()) + '</text>'};
  }

  /* Hoạ tiết chấm bi ở góc — thứ duy nhất trong tấm được phép KHÔNG
     mang tin. Nó làm góc trống bớt trống mà không kéo mắt, vì nó rất
     nhạt và rất đều: mắt bỏ qua cái đều. */
  function chamBi(x, y, cot, hang, buoc, mau, mo) {
    var ra = '';
    for (var i = 0; i < cot; i++)
      for (var j = 0; j < hang; j++)
        ra += '<circle cx="' + (x + i * buoc) + '" cy="' + (y + j * buoc) +
          '" r="' + (buoc * 0.14).toFixed(1) + '" fill="' + h(mau) +
          '" fill-opacity="' + mo + '"/>';
    return ra;
  }

  /* ═══════════ BỘ VẼ · AI LÀM GÌ (VAI_TRO) ═══════════
     Hiến pháp khai "ba cột: nhà · học viên · Coach". Ba cột chứ không
     phải ba ô của một lưới: lưới nói "ba thứ ngang hàng", ba cột có
     đầu cột nói "ba NGƯỜI, mỗi người một phần việc" — và đó mới là
     nhiệm vụ khai của loại hình này. */
  function catVai(chu) {
    var ra = [], nay = null;
    String(chu || '').split('\n').forEach(function (d) {
      var v = /^\s*VAI\s+([^|]+?)\s*(?:\|\s*(.+?))?\s*$/i.exec(d);
      if (v) { nay = {ten: v[1].trim(), phu: (v[2] || '').trim(), y: []};
        ra.push(nay); return; }
      var g = /^\s*[·•\-*]\s+(.{3,})$/.exec(d);
      if (g && nay) nay.y.push(g[1].trim());
    });
    return ra.filter(function (x) { return x.y.length; }).slice(0, 3);
  }

  function veVaiTro(x, kg, che) {
    var k = bang(che);
    var ds = catVai(x.noiDung);
    if (ds.length < 2) return {ok: false,
      error: 'Bảng ai-làm-gì cần ít nhất HAI vai. Mở mỗi vai bằng dòng ' +
             '"VAI Phụ huynh | phần việc chính", rồi các dòng bắt đầu bằng dấu · ' +
             'là việc của vai ấy. Máy KHÔNG tự chia việc cho ai: chia sai là nói ' +
             'sai đúng điều duy nhất tấm này phải nói. Đang đọc ra ' + ds.length + ' vai.'};
    var sac = sacTang();
    if (!sac.length) return {ok: false, error: 'Chưa mở được bảng màu thương hiệu.'};

    var d = dauTam(x, kg, k, 24);
    var le = Math.round(kg.w * 0.05), khe = Math.round(kg.w * 0.028);
    var rongCot = Math.round((kg.w - le * 2 - khe * (ds.length - 1)) / ds.length);
    var dayVung = kg.h - Math.round(kg.h * 0.072);
    var ve = '';

    /* ── THẺ CAO BẰNG NỘI DUNG DÀI NHẤT, KHÔNG CAO BẰNG CẢ VÙNG ──
       Kéo thẻ xuống hết vùng thì cột nào ít việc cũng hở một mảng
       trắng bằng nửa thẻ, và ba thẻ trông như ba cái hộp rỗng. Đo cột
       dài nhất rồi cho cả ba cao bằng đúng nó — hở thì hở ở NGOÀI ba
       thẻ, chỗ ấy là lề, và lề thì được phép trống. */
    var rHtmp = Math.round(kg.w * 0.058);
    var coTenT = Math.round(kg.w * 0.026), coYT = Math.round(kg.w * 0.0185);
    var caoThe = 0;
    ds.forEach(function (c) {
      var cao = 20 + rHtmp * 2 +
        catDong(c.ten, '800 ' + coTenT + 'px ' + CHU_THAN, rongCot - 24).length *
          coTenT * 1.18 + coTenT * 1.25 +
        (c.phu ? Math.round(kg.w * 0.0185) * 2.0 : 0) + 18 + 3;
      c.y.slice(0, 8).forEach(function (t) {
        cao += catDong(t, '500 ' + coYT + 'px ' + CHU_THAN,
          rongCot - 32 - coYT * 1.15).length * coYT * 1.36 + coYT * 0.30;
      });
      caoThe = Math.max(caoThe, Math.round(cao + 26));
    });
    caoThe = Math.min(caoThe, dayVung - d.dinh);

    ds.forEach(function (c, i) {
      var xc = le + i * (rongCot + khe);
      var s = sac[i % sac.length];
      var kinh = tamKinh(xc, d.dinh, rongCot, caoThe, k,
        {sac: s.hex, bong: d.bong.id, bo: 14});
      d.manh.push(kinh); ve += kinh.ve;

      /* ── MỖI CỘT LÀ MỘT NGƯỜI, NÊN VẼ MỘT NGƯỜI ──
         Huy hiệu biểu tượng nói "mục này về X". Hình người nói "mục
         này LÀ một người, và người ấy có phần việc". Với loại hình
         "ai làm gì" thì khác biệt ấy chính là nội dung.
         Vẽ trong một đĩa màu nhạt để hình có chỗ đứng và không trôi
         giữa nền trắng — đĩa cũng là chỗ sắc tầng xuất hiện lần đầu. */
      var rH = Math.round(kg.w * 0.058);
      ve += '<circle cx="' + (xc + Math.round(rongCot / 2)) + '" cy="' +
        (d.dinh + 20 + rH) + '" r="' + rH + '" fill="' + h(s.hex) +
        '" fill-opacity="' + (k.sau ? '0.20' : '0.13') + '"/>';
      ve += veNet('nguoi', chonNguoi(c.ten, i), xc + Math.round(rongCot / 2),
        d.dinh + 20 + rH, Math.round(rH * 1.62), s.hex, 3.6);

      var coTen = Math.round(kg.w * 0.026);
      var yTen = d.dinh + 20 + rH * 2 + coTen * 1.25;
      var ten = veChu(c.ten, xc + Math.round(rongCot / 2), yTen,
        {co: coTen, chu: CHU_THAN, dam: 800, mau: k.muc,
         rong: rongCot - 24, gian: 1.18, can: 'middle', gianChu: 0.4});
      ve += ten.svg;
      var yy = yTen + ten.cao;
      if (c.phu) {
        var coP = Math.round(kg.w * 0.0185);
        ve += veDongQuang(c.phu, xc + Math.round(rongCot / 2), yy + coP * 0.9,
          {co: coP, chu: CHU_THAN, dam: 700, mau: k.muc, can: 'middle',
           rongToiDa: rongCot - 28}).svg;
        yy += coP * 2.0;
      }
      /* Gạch màu ngang tách đầu cột khỏi danh sách — và nó là chỗ sắc
         tầng xuất hiện lần thứ hai, sau huy hiệu, nên màu không phải
         thứ duy nhất phân biệt ba cột: tên vai viết ra bằng chữ. */
      ve += '<rect x="' + (xc + Math.round(rongCot * 0.28)) + '" y="' + Math.round(yy) +
        '" width="' + Math.round(rongCot * 0.44) + '" height="3" rx="1.5" fill="' +
        h(s.hex) + '"/>';
      yy += 18;
      var coY = Math.round(kg.w * 0.0185);
      ve += veGachDau(c.y.slice(0, 8), xc + 16, yy,
        {co: coY, rong: rongCot - 32, mau: k.muc2, cham: s.hex}).svg;
    });
    return {ok: true, svg: khung(kg, k, d.tren + ve + d.duoi, gom(d.manh).defs)};
  }

  /* ═══════════ BỘ VẼ · DANH SÁCH VIỆC ═══════════
     "Cột dọc có ô đánh dấu · giúp hành động ngay hôm nay". Ô đánh dấu
     là điểm khác biệt duy nhất giữa loại này và một danh sách thường:
     ô trống nói "việc này CHƯA làm, và bạn là người làm nó". */
  function catViec(chu) {
    var ra = [], nay = null;
    String(chu || '').split('\n').forEach(function (d) {
      var n = /^\s*NHÓM\s*\|\s*(.+?)\s*$/i.exec(d);
      if (n) { nay = {ten: n[1].trim(), y: []}; ra.push(nay); return; }
      var g = /^\s*[·•\-*☐]\s+(.{3,})$/.exec(d);
      if (g) { if (!nay) { nay = {ten: '', y: []}; ra.push(nay); } nay.y.push(g[1].trim()); }
    });
    return ra.filter(function (v) { return v.y.length; });
  }

  function veDanhSachViec(x, kg, che) {
    var k = bang(che);
    var ds = catViec(x.noiDung);
    var tong = ds.reduce(function (a, v) { return a + v.y.length; }, 0);
    if (tong < 3) return {ok: false,
      error: 'Danh sách việc cần ít nhất BA việc. Mỗi việc một dòng bắt đầu ' +
             'bằng dấu ·, và có thể gom nhóm bằng dòng "NHÓM | Mỗi ngày". Máy ' +
             'KHÔNG tự tách câu thành việc: một việc là thứ làm xong được trong ' +
             'một lần, và chỉ người viết biết chỗ nào là một lần. Đang đọc ra ' +
             tong + ' việc.'};
    var sac = sacTang();
    var d = dauTam(x, kg, k, 24);
    var le = Math.round(kg.w * 0.075);
    var rong = kg.w - le * 2;
    var yy = d.dinh;
    var ve = '';
    var coN = Math.round(kg.w * 0.023), coV = Math.round(kg.w * 0.0215);
    var o = Math.round(coV * 1.15);

    ds.forEach(function (v, i) {
      var s = sac[i % sac.length];
      if (v.ten) {
        ve += '<rect x="' + le + '" y="' + Math.round(yy) + '" width="4" height="' +
          Math.round(coN * 1.1) + '" rx="2" fill="' + h(s.hex) + '"/>';
        ve += '<text x="' + (le + 14) + '" y="' + Math.round(yy + coN * 0.85) +
          '" font-family="' + h(CHU_THAN) + '" font-size="' + coN +
          '" font-weight="800" fill="' + h(k.muc) + '" letter-spacing="0.6">' +
          h(v.ten.toUpperCase()) + '</text>';
        yy += coN * 1.75;
      }
      v.y.forEach(function (t) {
        var dong = catDong(t, '500 ' + coV + 'px ' + CHU_THAN, rong - o - 18);
        /* Ô đánh dấu TRỐNG — đây là việc chưa làm, không phải việc đã xong. */
        ve += '<rect x="' + le + '" y="' + Math.round(yy) + '" width="' + o +
          '" height="' + o + '" rx="5" fill="none" stroke="' + h(s.hex) +
          '" stroke-width="2"/>';
        dong.forEach(function (t2, j) {
          ve += '<text x="' + (le + o + 14) + '" y="' +
            Math.round(yy + o * 0.72 + j * coV * 1.34) + '" font-family="' +
            h(CHU_THAN) + '" font-size="' + coV + '" font-weight="500" fill="' +
            h(k.muc2) + '">' + h(t2) + '</text>';
        });
        yy += Math.max(o, dong.length * coV * 1.34) + coV * 0.62;
      });
      yy += coV * 0.5;
    });
    return {ok: true, svg: khung(kg, k, d.tren + ve + d.duoi, gom(d.manh).defs)};
  }

  /* ═══════════ BỘ VẼ · CỔNG NGHIỆM THU ═══════════
     "Một cổng, hai ba điều kiện · giúp biết qua chặng cần đạt gì".
     Vẽ đúng một cái CỔNG: hai trụ và một vòm. Hình cổng làm được thứ
     một cái hộp không làm — nó nói có BÊN NÀY và BÊN KIA, và muốn
     sang thì phải đi qua. Danh sách điều kiện nằm giữa hai trụ, đúng
     chỗ người ta phải đi qua. */
  function catCong(chu) {
    var ten = '', dk = [];
    String(chu || '').split('\n').forEach(function (d) {
      var c = /^\s*CỔNG\s*\|\s*(.+?)\s*$/i.exec(d);
      if (c) { ten = c[1].trim(); return; }
      var e = /^\s*(.{2,40}?)\s+[—–]\s+(.{4,})$/.exec(d);
      if (e) dk.push({ten: e[1].trim(), y: e[2].trim()});
    });
    return {ten: ten, dk: dk.slice(0, 4)};
  }

  function veCong(x, kg, che) {
    var k = bang(che);
    var c = catCong(x.noiDung);
    /* ── CÂU TỪ CHỐI CŨNG LÀ TÀI LIỆU, VÀ NÓ TỪNG DẠY SAI ──
       Bản trước viết mẫu là "ĐIỀU KIỆN — nội dung". Làm theo đúng mẫu
       ấy thì ba thẻ ra ba cái tên GIỐNG HỆT NHAU: "ĐIỀU KIỆN" ba lần,
       đứng ở dòng nổi nhất của mỗi thẻ và không mang một tin nào.
       Người viết không sai — họ gõ đúng thứ máy bảo gõ. Một câu hướng
       dẫn sai còn tệ hơn không có câu nào, vì nó làm người ta thôi
       nghĩ. Mẫu nay là tên THẬT của từng điều kiện. */
    if (!c.ten || c.dk.length < 2) return {ok: false,
      error: 'Cổng nghiệm thu cần MỘT tên cổng và ít nhất HAI điều kiện. Gõ ' +
             '"CỔNG | Cổng ngày bảy" rồi mỗi điều kiện một dòng "Tên ngắn — ' +
             'nội dung", ví dụ "Bộ test — cả học viên và phụ huynh đã làm xong". ' +
             'Một cổng chỉ có một điều kiện thì không phải cổng, đó là một cái ' +
             'cửa mở. Đang đọc ra ' + c.dk.length + ' điều kiện.'};

    /* Tên trùng nhau thì thẻ mất dòng đắt nhất của nó. Máy chặn chứ
       không vẽ ra rồi để người xem tự bỏ qua ba dòng vô nghĩa. */
    var tenDk = c.dk.map(function (e) { return e.ten.toUpperCase(); });
    if (tenDk.length !== tenDk.filter(function (t, i) {
          return tenDk.indexOf(t) === i; }).length)
      return {ok: false, code: 'TENTRUNG',
        error: 'Hai điều kiện đang mang cùng một tên. Tên đứng ở dòng nổi nhất ' +
               'của mỗi thẻ, nên tên trùng là ba dòng to nhất của tấm không nói ' +
               'gì cả — người xem phải đọc dòng nhỏ mới biết thẻ nào là thẻ nào. ' +
               'Đặt cho mỗi điều kiện một tên riêng, ngắn. Đang có: ' +
               tenDk.join(' · ')};
    var sac = sacTang();
    var d = dauTam(x, kg, k, 24);
    var le = Math.round(kg.w * 0.10), rong = kg.w - le * 2;
    var dayVung = kg.h - Math.round(kg.h * 0.072);
    var sTru = sac[0] || {hex: k.gita};

    /* Hai trụ và một vòm, vẽ bằng một nét dày. Vòm mở lên trên vì
       qua cổng là ĐI LÊN một chặng, không phải đi ngang. */
    var truW = Math.round(kg.w * 0.028);
    var caoVom = Math.round(kg.w * 0.10);
    var xIn = le + truW, rongIn = rong - truW * 2;

    var coTen = Math.round(kg.w * 0.030);
    var ten = veChu(c.ten, Math.round(kg.w / 2), 0,
      {co: coTen, chu: CHU_THAN, dam: 800, mau: k.muc,
       rong: rong - truW * 3, gian: 1.18, can: 'middle', gianChu: 0.5});

    /* ── ĐO THẺ THEO NỘI DUNG, RỒI MỚI DỰNG CỔNG QUANH CHÚNG ──
       Bản trước chia đều chỗ CÒN LẠI cho mấy thẻ: caoDk = (đáy tấm −
       đỉnh) / số điều kiện. Ba điều kiện hai dòng chữ trên khổ vuông
       thành ba thẻ cao 290 điểm ảnh, mỗi thẻ chứa hai dòng và bỏ trống
       hơn nửa. Và hai chân cổng vẫn chạy tới đáy tấm, nên cả khối trông
       như một cái khung rỗng có ba mẩu chữ trôi bên trong.
       Giãn một khối cho vừa chỗ trống là lấy chỗ trống làm nội dung.
       Nay: đo nội dung trước, thẻ cao đúng bằng thứ nó chở, rồi CỔNG
       thu lại ôm lấy chồng thẻ. */
    var rH = Math.round(kg.w * 0.030);
    var xT = xIn + 16 + rH * 2 + 34, rongT = rongIn - 32 - (rH * 2 + 50);
    var coH = Math.round(kg.w * 0.0205), coB = Math.round(kg.w * 0.0185);
    var dongDk = c.dk.map(function (e) {
      return catDong(e.y, '500 ' + coB + 'px ' + CHU_THAN, rongT); });
    var demTrong = Math.round(coB * 1.5);          /* mép trên dưới trong thẻ */
    var caoDk = 0;
    dongDk.forEach(function (dB) {
      caoDk = Math.max(caoDk,
        demTrong * 2 + coH * 1.15 + dB.length * coB * 1.34); });
    /* Thẻ không được thấp hơn chính huy hiệu của nó cộng mép. */
    caoDk = Math.round(Math.max(caoDk, rH * 2 + demTrong * 1.6));

    var giuaDk = 14;
    var caoChong = c.dk.length * caoDk + (c.dk.length - 1) * giuaDk;
    var caoTenO = ten.cao + 22;                    /* tên cổng nằm trong vòm */

    /* Cả khối cổng — vòm, tên, chồng thẻ — căn giữa vùng còn lại. */
    var caoCong = caoVom + caoTenO + caoChong + Math.round(kg.w * 0.045);
    var dinhCong = Math.round(d.dinh + Math.max(0, (dayVung - d.dinh - caoCong) / 2));
    var dayCong = dinhCong + caoCong;

    var ve = '<path d="M' + le + ' ' + dayCong + ' V' + (dinhCong + caoVom) +
      ' A' + Math.round(rong / 2) + ' ' + caoVom + ' 0 0 1 ' + (le + rong) + ' ' +
      (dinhCong + caoVom) + ' V' + dayCong + '" fill="none" stroke="' + h(sTru.hex) +
      '" stroke-opacity="0.30" stroke-width="' + truW + '" stroke-linecap="round"/>';

    ten = veChu(c.ten, Math.round(kg.w / 2), dinhCong + caoVom * 0.62,
      {co: coTen, chu: CHU_THAN, dam: 800, mau: k.muc,
       rong: rong - truW * 3, gian: 1.18, can: 'middle', gianChu: 0.5});
    ve += ten.svg;

    var dinhDk = dinhCong + caoVom + caoTenO;
    c.dk.forEach(function (e, i) {
      var s = sac[(i + 1) % sac.length];
      var y = dinhDk + i * (caoDk + giuaDk);
      var kinh = tamKinh(xIn + 16, y, rongIn - 32, caoDk, k,
        {sac: s.hex, bong: d.bong.id, bo: 12});
      d.manh.push(kinh); ve += kinh.ve;
      var hh = huyHieu(xIn + 16 + rH + 18, y + Math.round(caoDk / 2), rH, s.hex,
        chonHinh(e.ten, i), null, k);
      d.manh.push(hh); ve += hh.ve;
      var dB = dongDk[i];
      var caoCum = coH * 1.15 + dB.length * coB * 1.34;
      var y0 = y + Math.round((caoDk - caoCum) / 2) + coH * 0.82;
      ve += '<text x="' + xT + '" y="' + Math.round(y0) + '" font-family="' +
        h(CHU_THAN) + '" font-size="' + coH + '" font-weight="800" fill="' +
        h(k.muc) + '" letter-spacing="0.5">' + h(e.ten.toUpperCase()) + '</text>';
      ve += veChu(e.y, xT, y0 + coH * 1.15 + coB * 0.2,
        {co: coB, chu: CHU_THAN, dam: 500, mau: k.muc2,
         rong: rongT, gian: 1.34}).svg;
    });
    return {ok: true, svg: khung(kg, k, d.tren + ve + d.duoi, gom(d.manh).defs)};
  }

  /* ═══════════ BỘ VẼ · NHỊP MỘT CHU KỲ ═══════════
     "Vòng tròn hoặc lịch · giúp hiểu một tuần hoặc một chu kỳ diễn ra
     thế nào". Vẽ VÒNG, vì vòng nói được thứ danh sách dọc không nói:
     hết vòng thì quay lại đầu. Một chu kỳ mà vẽ thành đường thẳng là
     vẽ nó thành một việc làm một lần rồi thôi. */
  function veNhip(x, kg, che) {
    var k = bang(che);
    var ds = catO(x.noiDung);
    if (ds.length < 3) return {ok: false,
      error: 'Nhịp một chu kỳ cần ít nhất BA chặng, mỗi chặng một dòng dạng ' +
             '"TÊN — mô tả một câu". Dưới ba chặng thì không thành vòng, và cả ' +
             'điểm của tấm này là cho thấy hết vòng thì quay lại đầu. Đang đọc ' +
             'ra ' + ds.length + ' chặng.'};
    var sac = sacTang();
    if (!sac.length) return {ok: false, error: 'Chưa mở được bảng màu thương hiệu.'};
    ds = ds.slice(0, 6);

    var d = dauTam(x, kg, k, 24);
    var dayVung = kg.h - Math.round(kg.h * 0.072);
    var cx = Math.round(kg.w / 2), cy = Math.round((d.dinh + dayVung) / 2);
    /* ── VÒNG PHẢI CHỪA CHỖ CHO NHÃN ──
       Bản đầu lấy bán kính lớn nhất mà vòng vừa khung, rồi mới thả
       nhãn ra ngoài vòng — nên nhãn tràn hẳn khỏi tấm ở hai bên. Chỗ
       nhãn nằm phải được TRỪ RA trước khi chọn bán kính; nhãn là nội
       dung, vòng chỉ là cái giá đỡ. */
    var leN = Math.round(kg.w * 0.055);
    var chuaNhan = Math.round(kg.w * 0.215);
    var R = Math.round(Math.min(
      (kg.w - leN * 2) / 2 - chuaNhan,
      (dayVung - d.dinh) * 0.40));
    var dayR = Math.round(R * 0.30);
    var n = ds.length, ve = '';

    /* Mỗi chặng một cung. Chừa một khe giữa hai cung để mắt đếm được
       số chặng mà không phải dò màu — màu là lớp thứ hai, không phải
       lớp duy nhất. */
    var khe = 0.055;
    ds.forEach(function (m, i) {
      var s = sac[i % sac.length];
      var a1 = (i / n) * Math.PI * 2 - Math.PI / 2 + khe;
      var a2 = ((i + 1) / n) * Math.PI * 2 - Math.PI / 2 - khe;
      var lon = (a2 - a1) > Math.PI ? 1 : 0;
      var xy = function (a, r) {
        return [(cx + Math.cos(a) * r).toFixed(1), (cy + Math.sin(a) * r).toFixed(1)]; };
      var p1 = xy(a1, R), p2 = xy(a2, R), p3 = xy(a2, R - dayR), p4 = xy(a1, R - dayR);
      ve += '<path d="M' + p1[0] + ' ' + p1[1] + ' A' + R + ' ' + R + ' 0 ' + lon +
        ' 1 ' + p2[0] + ' ' + p2[1] + ' L' + p3[0] + ' ' + p3[1] + ' A' +
        (R - dayR) + ' ' + (R - dayR) + ' 0 ' + lon + ' 0 ' + p4[0] + ' ' + p4[1] +
        ' Z" fill="' + h(s.hex) + '"/>';

      /* Số chặng nằm TRONG cung — mực chọn theo chính sắc ấy. */
      var ag = (a1 + a2) / 2, pg = xy(ag, R - dayR / 2);
      var coS = Math.round(dayR * 0.52);
      ve += '<text x="' + pg[0] + '" y="' + (parseFloat(pg[1]) + coS * 0.36).toFixed(1) +
        '" text-anchor="middle" font-family="' + h(CHU_THAN) + '" font-size="' + coS +
        '" font-weight="800" fill="' + h(mucTren(s.hex)) + '">' + (i + 1) + '</text>';

      /* Nhãn ngoài vòng, căn theo phía để không đè vào vòng. */
      var ben = Math.cos(ag) < -0.3 ? 'end' : (Math.cos(ag) > 0.3 ? 'start' : 'middle');
      var coN = Math.round(kg.w * 0.019);
      var pn = xy(ag, R + 20);
      /* Bề rộng nhãn đo bằng chỗ CÒN LẠI tới mép tấm, không bằng một
         tỷ lệ đoán. Nhãn giữa được rộng gấp đôi vì nó toả sang hai
         bên; nhãn cạnh chỉ toả một bên. */
      var rongN = ben === 'middle'
        ? Math.min(kg.w - leN * 2, Math.round(kg.w * 0.40))
        : (ben === 'start'
            ? Math.max(60, kg.w - leN - parseFloat(pn[0]))
            : Math.max(60, parseFloat(pn[0]) - leN));
      /* ── ĐẨY KHỐI NHÃN RA THEO CHÍNH CHIỀU CAO CỦA NÓ ──
         Nhãn bắt đầu ở R+20 rồi lớn dần XUỐNG. Với chặng ở nửa dưới
         vòng thì "xuống" là ra xa, không sao; nhưng với chặng ở nửa
         TRÊN thì dòng cuối của nhãn bò ngược vào vòng và vắt lên
         cung màu — phép đo vắt-mép bắt đúng chỗ ấy.
         Đo khối trước, rồi đẩy ra thêm một nửa chiều cao nhân với
         phần thẳng đứng của hướng: chặng ở đỉnh và đáy bị đẩy nhiều
         nhất, chặng ở hai bên gần như không cần đẩy. */
      var coY2 = Math.round(coN * 0.86);
      var dT = catDong(m.ten, '800 ' + coN + 'px ' + CHU_THAN, rongN);
      var dY2 = catDong(m.y, '500 ' + coY2 + 'px ' + CHU_THAN, rongN);
      var caoKhoi = dT.length * coN * 1.18 + dY2.length * coY2 * 1.3;
      var them = Math.abs(Math.sin(ag)) * caoKhoi * 0.5;
      var pn2 = xy(ag, R + 20 + them);
      var y0 = parseFloat(pn2[1]) - (Math.sin(ag) < 0 ? caoKhoi * 0.72 : 0) + coN * 0.2;
      var t1 = veChu(m.ten, parseFloat(pn2[0]), y0,
        {co: coN, chu: CHU_THAN, dam: 800, mau: k.muc, rong: rongN,
         gian: 1.18, can: ben});
      ve += t1.svg;
      ve += veChu(m.y, parseFloat(pn2[0]), y0 + t1.cao,
        {co: coY2, chu: CHU_THAN, dam: 500, mau: k.muc2,
         rong: rongN, gian: 1.3, can: ben}).svg;
    });

    /* Mũi tên khép vòng ở tâm — nói thẳng "hết vòng quay lại đầu". */
    var rT = Math.round(R * 0.42);
    ve += '<circle cx="' + cx + '" cy="' + cy + '" r="' + rT + '" fill="none" ' +
      'stroke="' + h(k.muc3) + '" stroke-opacity="0.45" stroke-width="2" ' +
      'stroke-dasharray="5 6"/>' +
      '<path d="M' + (cx - 8) + ' ' + (cy - rT) + ' l8 -7 l8 7 z" fill="' +
      h(k.muc3) + '" fill-opacity="0.7"/>';
    return {ok: true, svg: khung(kg, k, d.tren + ve + d.duoi, gom(d.manh).defs)};
  }

  /* ═══════════ BỘ VẼ · BẢNG THEO DÕI ═══════════
     "Lưới ô số cộng một biểu đồ · giúp theo dõi tiến bộ bằng số".

     ══ BIỂU ĐỒ DÙNG MỘT SẮC, KHÔNG DÙNG SÁU ══
     Sáu sắc tầng là bảng ĐỊNH DANH — mỗi sắc một chặng khác nhau.
     Các cột của một biểu đồ theo tuần KHÔNG phải sáu thứ khác nhau,
     chúng là CÙNG một thứ đo ở sáu thời điểm. Tô chúng sáu màu là
     nói dối bằng màu: mắt đọc ra "sáu loại", trong khi chỉ có một.
     Đo độ lớn thì dùng một sắc, đậm dần. */
  function catBang(chu) {
    var so = [], cot = [];
    String(chu || '').split('\n').forEach(function (d) {
      var a = /^\s*SỐ\s*\|\s*([^|]{1,14})\s*\|\s*(.+?)\s*$/i.exec(d);
      if (a) { so.push({v: a[1].trim(), t: a[2].trim()}); return; }
      var b2 = /^\s*CỘT\s*\|\s*([^|]{1,20})\s*\|\s*(-?\d+(?:[.,]\d+)?)\s*$/i.exec(d);
      if (b2) cot.push({t: b2[1].trim(), v: parseFloat(String(b2[2]).replace(',', '.'))});
    });
    return {so: so.slice(0, 4), cot: cot.slice(0, 12)};
  }

  function veBangDieuKhien(x, kg, che) {
    var k = bang(che);
    var b = catBang(x.noiDung);
    if (b.so.length < 2 || b.cot.length < 3) return {ok: false,
      error: 'Bảng theo dõi cần ít nhất HAI ô số và BA cột biểu đồ. Gõ ' +
             '"SỐ | 21 | Ngày liên tiếp" cho mỗi ô số, và "CỘT | Tuần 1 | 4" ' +
             'cho mỗi cột. Máy KHÔNG tự rút số ra khỏi câu văn: rút sai một ' +
             'con số thì cả bảng nói sai, mà bảng này tồn tại chỉ để nói số. ' +
             'Đang đọc ra ' + b.so.length + ' ô số và ' + b.cot.length + ' cột.'};
    var sac = sacTang();
    var d = dauTam(x, kg, k, 24);
    var le = Math.round(kg.w * 0.055);
    var rong = kg.w - le * 2;
    var dayVung = kg.h - Math.round(kg.h * 0.072);
    var ve = '';

    /* Hàng ô số */
    var nS = b.so.length, kheS = 14;
    var rongS = Math.round((rong - kheS * (nS - 1)) / nS);
    var caoS = Math.round(Math.min(kg.h * 0.15, rongS * 0.72));
    b.so.forEach(function (m, i) {
      var xs = le + i * (rongS + kheS);
      var s = sac[i % sac.length];
      var kinh = tamKinh(xs, d.dinh, rongS, caoS, k,
        {sac: s.hex, bong: d.bong.id, bo: 14});
      d.manh.push(kinh); ve += kinh.ve;
      var coV = Math.round(Math.min(caoS * 0.42, rongS * 0.30));
      while (doRong(m.v, '800 ' + coV + 'px ' + CHU_THAN) > rongS - 28 && coV > 14) coV -= 2;
      /* ── CHỮ MẶC MỰC, KHÔNG MẶC MÀU CHUỖI ──
         Bản đầu tô con số bằng chính sắc tầng của ô, và "4/4" trên
         thẻ trắng chỉ được 2,43:1 — bốn trên sáu sắc thương hiệu đều
         dưới 3:1 trên nền sáng, đo bằng bộ soi bảng màu chứ không
         đoán. Màu là việc của MẢNG, không phải việc của chữ: giữ một
         vệt màu bên cạnh để mang định danh, còn con số mặc mực. */
      ve += '<rect x="' + (xs + Math.round(rongS * 0.36)) + '" y="' +
        Math.round(d.dinh + caoS * 0.14) + '" width="' + Math.round(rongS * 0.28) +
        '" height="3.5" rx="1.75" fill="' + h(s.hex) + '"/>';
      var ySo = Math.round(d.dinh + caoS * 0.56);
      ve += '<text x="' + (xs + Math.round(rongS / 2)) + '" y="' + ySo +
        '" text-anchor="middle" font-family="' +
        h(CHU_THAN) + '" font-size="' + coV + '" font-weight="800" fill="' +
        h(k.muc) + '">' + h(m.v) + '</text>';
      /* ── CON SỐ VÀ CÂU DƯỚI NÓ TỪNG CHẠM NHAU ──
         Hai đường chân neo cứng ở 0,56 và 0,82 lần chiều cao ô, tức
         cách nhau 0,26 — mà con số cao tới 0,42. Với "21" thì vừa;
         với "4/4" đứng trên "Cổng đã qua trong chuỗi" thì dấu hỏi
         của chữ "ổ" trồi lên chạm chân con số, đo ra 2 điểm ảnh.
         Nay câu dưới lùi theo mực thật của cả hai dòng. */
      var coCau = Math.round(kg.w * 0.0165);
      var oCau = {co: coCau, chu: CHU_THAN, dam: 600, mau: k.muc2,
                  rong: rongS - 22, gian: 1.24, can: 'middle'};
      var yCau = Math.max(Math.round(d.dinh + caoS * 0.82),
        Math.round(ySo + mucDoc(m.v, '800 ' + coV + 'px ' + CHU_THAN).duoi +
          khoiChu(m.t, oCau).tren + coCau * 0.28));
      ve += veChu(m.t, xs + Math.round(rongS / 2), yCau, oCau).svg;
    });

    /* Biểu đồ cột — MỘT sắc, đậm dần theo độ lớn */
    var dinhBd = d.dinh + caoS + Math.round(kg.h * 0.045);
    var sBd = sac[0] || {hex: k.gita};
    var lonNhat = Math.max.apply(null, b.cot.map(function (c) { return c.v; }));
    if (!(lonNhat > 0)) lonNhat = 1;
    var coNhan = Math.round(kg.w * 0.0155);
    var dayCot = dayVung - coNhan * 2.2;
    var caoBd = dayCot - dinhBd - coNhan * 1.6;
    var nC = b.cot.length;
    /* Khe 2 pixel giữa hai cột — đủ để mắt tách, không đủ để thành khe hở. */
    var buoc = rong / nC;
    var rongC = Math.max(6, buoc - Math.max(2, buoc * 0.28));

    ve += '<line x1="' + le + '" y1="' + dayCot + '" x2="' + (le + rong) +
      '" y2="' + dayCot + '" stroke="' + h(k.muc3) + '" stroke-opacity="0.35" ' +
      'stroke-width="1.5"/>';
    b.cot.forEach(function (c, i) {
      var ty = Math.max(0, c.v) / lonNhat;
      var hC = Math.max(4, Math.round(caoBd * ty));
      var xc = le + Math.round(buoc * i + (buoc - rongC) / 2);
      /* Đậm dần theo độ lớn: cột cao nhất là sắc gốc, cột thấp nhạt
         hơn. Một sắc, một thang — đó là cách mã hoá ĐỘ LỚN. */
      var mauC = doiSang(sBd.hex, 0.46 * (1 - ty));
      ve += '<path class="gita-cot" d="M' + xc + ' ' + dayCot + ' V' + (dayCot - hC + 4) +
        ' a4 4 0 0 1 4 -4 h' + Math.round(rongC - 8) + ' a4 4 0 0 1 4 4 V' +
        dayCot + ' Z" fill="' + h(mauC) + '"/>';
      ve += '<text x="' + Math.round(xc + rongC / 2) + '" y="' +
        Math.round(dayCot - hC - coNhan * 0.45) + '" text-anchor="middle" ' +
        'font-family="' + h(CHU_THAN) + '" font-size="' + coNhan +
        '" font-weight="800" fill="' + h(k.muc) + '">' + h(String(c.v)) + '</text>';
      ve += '<text x="' + Math.round(xc + rongC / 2) + '" y="' +
        Math.round(dayCot + coNhan * 1.45) + '" text-anchor="middle" ' +
        'font-family="' + h(CHU_THAN) + '" font-size="' + coNhan +
        '" font-weight="500" fill="' + h(k.muc2) + '">' + h(c.t) + '</text>';
    });
    return {ok: true, svg: khung(kg, k, d.tren + ve + d.duoi, gom(d.manh).defs)};
  }

  /* ═══════════ BỘ VẼ · THẺ NGÀY (BIA có ảnh người) ═══════════
     Năm tấm mẫu mới của chủ hệ là MỘT khuôn: logo và số kỳ ở đầu,
     tiêu đề rất lớn, câu phụ nghiêng, các khối đánh số ở cột trái,
     ảnh trainer chiếm hết cột phải, và một dải CÂU ĐÓNG ĐINH ở đáy.

     Đó là một khuôn ẤN PHẨM ĐỊNH KỲ, không phải một loại hình mới —
     nên nó nằm trong BIA ("giúp nhận ra đây là tài liệu gì của ai"),
     bật lên khi nội dung có dòng ẢNH. Hiến pháp vẫn mười hai loại,
     tôi không tự thêm loại thứ mười ba.

     Định dạng người viết gõ:
       NHÃN: 30.7
       ẢNH: trainer
       PHỤ: Tự tin thật được xây từ những lần tự mình vượt qua.
       Ý — Niềm tin không đến từ lời khen suông.
       Ý — Mà từ trải nghiệm vượt qua từng bước.
       HỎI — Việc gì con từng nghĩ mình không thể?
       LÀM — Viết ra một điều con sẽ thử lại.
       ĐÓNG ĐINH: Tự tin thật xây từ những lần ==chính mình vượt qua==. */
  function catThe(chu) {
    var y = [], hoi = '', lam = '';
    String(chu || '').split('\n').forEach(function (d) {
      var m = /^\s*(Ý|HỎI|LÀM)\s*[—–]\s*(.{4,})$/i.exec(d);
      if (!m) return;
      var k2 = m[1].toUpperCase();
      if (k2 === 'Ý') y.push(m[2].trim());
      else if (k2 === 'HỎI') hoi = m[2].trim();
      else lam = m[2].trim();
    });
    return {y: y.slice(0, 5), hoi: hoi, lam: lam};
  }

  function veTheNgay(x, kg, che, ma) {
    var k = bang(che);
    var t = catThe(x.noiDung);
    var nhan = docDau(x.noiDung, 'NHÃN');
    var phu = docDau(x.noiDung, 'PHỤ');
    var dinh2 = docDau(x.noiDung, 'ĐÓNG ĐINH');
    if (t.y.length < 2 || !t.hoi || !t.lam) return {ok: false,
      error: 'Thẻ ngày cần ít nhất HAI dòng "Ý — …", một dòng "HỎI — …" và một ' +
             'dòng "LÀM — …". Câu hỏi coaching và việc làm hôm nay là hai chỗ ' +
             'khuôn này tồn tại để nói; thiếu một trong hai thì tấm chỉ còn là ' +
             'một câu trích. Đang đọc ra ' + t.y.length + ' ý' +
             (t.hoi ? '' : ', thiếu HỎI') + (t.lam ? '' : ', thiếu LÀM') + '.'};
    var sac = sacTang();
    if (!sac.length) return {ok: false, error: 'Chưa mở được bảng màu thương hiệu.'};

    var le = Math.round(kg.w * 0.055);
    var nen = lopNen(kg, k, 0.8);
    var bong = defBong(k, 1), bongHh = defBong(k, 2), cs = defChuSac(k);
    var manh = [nen, bong, bongHh, cs];
    var sChinh = sac[0];

    /* Cột phải giữ ảnh; cột trái giữ chữ. Tỷ lệ 54/46 là chỗ tấm mẫu
       đặt: đủ để ảnh đứng thành người, đủ để chữ không bị bóp. */
    var rongTrai = Math.round((kg.w - le * 2) * 0.54);
    var xPhai = le + rongTrai + Math.round(kg.w * 0.02);
    var rongPhai = kg.w - le - xPhai;

    var ve = chamBi(Math.round(kg.w * 0.70), Math.round(kg.h * 0.022),
      14, 7, Math.round(kg.w * 0.021), k.gita, k.sau ? 0.22 : 0.16);

    /* ── ĐẦU: số kỳ trong một huy hiệu, cạnh dấu GITA ── */
    var yDau = Math.round(kg.h * 0.045);
    ve += dauGita(k, le + Math.round(21 * tiDau(kg)), yDau + Math.round(16 * tiDau(kg)), kg);
    if (nhan) {
      var coK = Math.round(kg.w * 0.030);
      var rongK = Math.round(doRong(nhan, '800 ' + coK + 'px ' + CHU_THAN) + coK * 1.7);
      var xK = le + Math.round(kg.w * 0.30);
      ve += '<rect class="gita-tam" x="' + xK + '" y="' + yDau + '" width="' +
        rongK + '" height="' +
        Math.round(coK * 1.72) + '" rx="8" fill="' + h(k.gitaInk) + '"/>' +
        '<text x="' + Math.round(xK + rongK / 2) + '" y="' +
        Math.round(yDau + coK * 1.20) + '" text-anchor="middle" font-family="' +
        h(CHU_THAN) + '" font-size="' + coK + '" font-weight="800" fill="#FFFFFF">' +
        h(nhan) + '</text>';
    }

    /* ── ẢNH NGƯỜI, cột phải ── */
    var caoAnh = Math.round(kg.h * 0.60);
    var yAnh = Math.round(kg.h * 0.145);
    ve += veAnhNguoi(ma || 'trainer',
      xPhai + Math.round((rongPhai - caoAnh * 276 / 536) / 2), yAnh, caoAnh, k,
      sChinh.hex);
    var bt = bangTen(ma || 'trainer', xPhai + Math.round(rongPhai / 2),
      yAnh + caoAnh + 10, Math.round(rongPhai * 0.96), k);
    manh.push({defs: ''}); ve += bt.svg;

    /* ── TIÊU ĐỀ RẤT LỚN, cột trái ── */
    var coT = Math.round(kg.w / 15);
    var yT = Math.round(kg.h * 0.145) + coT;
    var dT = catDong(x.nhiemVu, '800 ' + coT + 'px ' + CHU_THAN, rongTrai);
    while (dT.length > 3 && coT > 26) {
      coT -= 2; dT = catDong(x.nhiemVu, '800 ' + coT + 'px ' + CHU_THAN, rongTrai);
    }
    var tieu = veChu(x.nhiemVu, le, yT, {co: coT, chu: CHU_THAN, dam: 800,
      mau: k.gitaInk, rong: rongTrai, gian: 1.14});
    ve += tieu.svg;
    var yy = yT + tieu.cao;
    ve += '<rect x="' + le + '" y="' + Math.round(yy + coT * 0.10) + '" width="' +
      Math.round(rongTrai * 0.30) + '" height="4" rx="2" fill="' + h(k.do) + '"/>';
    yy += coT * 0.44;
    if (phu) {
      var coP = Math.round(kg.w * 0.0245);
      /* Câu phụ dùng sắc LAM như tấm mẫu, nhưng lam nguyên bản trên
         nền sáng chỉ 2,12:1 — sắc đó sinh ra để làm MẢNG, không để
         làm chữ. Đậm xuống một nấc thì vẫn là lam, mà đọc được. */
      var mauPhu = sac[2] ? doiSang(sac[2].hex, -0.42) : k.gitaInk;
      var tp = veChu(phu, le, yy + coP * 1.1, {co: coP, chu: CHU_THAN, dam: 600,
        mau: mauPhu, rong: rongTrai, gian: 1.32});
      ve += tp.svg; yy += coP * 1.1 + tp.cao;
    }

    /* ── VÙNG CHỮ DỪNG TRƯỚC DẢI ĐÓNG ĐINH ──
       Dải đóng đinh chạy hết bề ngang ở đáy, nên nó cắt ngang cả cột
       trái. Vẽ cột trái tới đâu hay tới đó rồi mới đặt dải là dải đè
       lên khối cuối — đúng chỗ vừa hỏng. Tính chỗ đáy TRƯỚC, rồi ép
       các khối vừa vào đó. */
    var caoDai = dinh2 ? Math.round(kg.h * 0.085) + 14 : 0;
    var dayChu = kg.h - le - caoDai - 8;

    /* ── CÁC Ý, đánh số, mỗi ý một thẻ ── */
    yy += Math.round(kg.h * 0.014);
    var dinh0 = yy;
    var coY = Math.round(kg.w * 0.0215);
    t.y.forEach(function (m, i) {
      var s = sac[i % sac.length];
      var dY = catDong(m, '500 ' + coY + 'px ' + CHU_THAN, rongTrai - coY * 3.6);
      var caoO = Math.max(coY * 2.5, dY.length * coY * 1.36 + coY * 1.0);
      var kinh = tamKinh(le, yy, rongTrai, caoO, k,
        {sac: s.hex, bong: bong.id, bo: 11});
      manh.push(kinh); ve += kinh.ve;
      var rS = Math.round(coY * 0.82);
      var nSo = nenDac(s.hex);
      ve += '<circle cx="' + Math.round(le + coY * 1.05) + '" cy="' +
        Math.round(yy + caoO / 2) + '" r="' + rS + '" fill="' + h(nSo) + '"/>' +
        '<text x="' + Math.round(le + coY * 1.05) + '" y="' +
        Math.round(yy + caoO / 2 + rS * 0.36) + '" text-anchor="middle" ' +
        'font-family="' + h(CHU_THAN) + '" font-size="' + Math.round(rS * 1.05) +
        '" font-weight="800" fill="' + h(mucTrenDac(nSo)) + '">' + (i + 1) + '</text>';
      var y0 = yy + (caoO - dY.length * coY * 1.36) / 2 + coY * 0.82;
      dY.forEach(function (d2, j) {
        ve += '<text x="' + Math.round(le + coY * 2.35) + '" y="' +
          Math.round(y0 + j * coY * 1.36) + '" font-family="' + h(CHU_THAN) +
          '" font-size="' + coY + '" font-weight="500" fill="' + h(k.muc) + '">' +
          h(d2) + '</text>';
      });
      yy += caoO + 9;
    });

    /* ── HỎI và LÀM: hai khối cố định của khuôn ── */
    var doi = [{n: 'CÂU HỎI COACHING', t: t.hoi, s: sac[1] || sChinh, hinh: 'thoai'},
               {n: 'HÀNH ĐỘNG HÔM NAY', t: t.lam, s: sac[3] || sChinh, hinh: 'lich'}];
    /* Hai khối này BẮT BUỘC có chỗ — chúng là lý do khuôn tồn tại.
       Nên đo chúng trước, rồi lùi điểm bắt đầu lên nếu các ý ở trên
       đã ăn hết chỗ. Thà các ý sát nhau còn hơn mất câu hỏi coaching. */
    var caoDoi = 0;
    doi.forEach(function (m) {
      var coN0 = Math.round(kg.w * 0.0165), coB0 = Math.round(kg.w * 0.0215);
      caoDoi += Math.round(kg.h * 0.008) + coN0 * 2.0 +
        catDong(m.t, '600 ' + coB0 + 'px ' + CHU_THAN,
          rongTrai - coB0 * 3.8).length * coB0 * 1.36 + coB0 * 0.8 + 6;
    });
    /* ── HẾT CHỖ THÌ NÓI HẾT CHỖ, KHÔNG LÙI CHỒNG LÊN ──
       Bản vừa rồi tôi lùi điểm bắt đầu lên khi thiếu chỗ — và nó lùi
       thẳng vào giữa khối đã vẽ, nên câu hỏi coaching đè lên ý số
       bốn. Lùi để "vừa" là giấu một tấm quá tải bằng cách chồng chữ,
       và chồng chữ thì tệ hơn không vẽ.
       Máy không tự cắt bớt ý: cắt là bỏ nội dung mà không nói ai
       biết. Nói thẳng là dài quá khổ, và nói luôn bớt bao nhiêu. */
    if (yy + caoDoi > dayChu) {
      var thua2 = Math.round(yy + caoDoi - dayChu);
      return {ok: false, code: 'DAIQUAKHO',
        error: 'Nội dung dài hơn khổ tấm ' + thua2 + ' điểm ảnh. Bớt một dòng ' +
               '"Ý — …" hoặc rút ngắn câu, rồi vẽ lại. Máy KHÔNG tự cắt bớt ý ' +
               'cho vừa: cắt là bỏ nội dung mà không ai biết là đã bỏ, và một ' +
               'tấm thiếu một ý trông y hệt một tấm đủ ý. Đang có ' + t.y.length +
               ' ý.'};
    }
    doi.forEach(function (m) {
      yy += Math.round(kg.h * 0.008);
      var coN = Math.round(kg.w * 0.0165), coB = Math.round(kg.w * 0.0215);
      var dB = catDong(m.t, '600 ' + coB + 'px ' + CHU_THAN, rongTrai - coB * 3.8);
      var caoO = coN * 2.0 + dB.length * coB * 1.36 + coB * 0.8;
      var kinh = tamKinh(le, yy, rongTrai, caoO, k,
        {sac: m.s.hex, bong: bong.id, bo: 11});
      manh.push(kinh); ve += kinh.ve;
      /* Nhãn khối là một chip màu đặc — chữ nằm TRỌN trong chip. */
      var rongC = Math.round(doRong(m.n, '800 ' + coN + 'px ' + CHU_THAN) + coN * 1.9);
      ve += '<rect class="gita-tam" x="' + (le + 12) + '" y="' +
        Math.round(yy - coN * 0.30) +
        '" width="' + rongC + '" height="' + Math.round(coN * 1.85) + '" rx="7" ' +
        'fill="' + h(nenDac(m.s.hex)) + '"/>' +
        '<text x="' + Math.round(le + 12 + rongC / 2) + '" y="' +
        Math.round(yy + coN * 0.92) + '" text-anchor="middle" font-family="' +
        h(CHU_THAN) + '" font-size="' + coN + '" font-weight="800" fill="' +
        h(mucTrenDac(nenDac(m.s.hex))) + '" letter-spacing="0.5">' + h(m.n) + '</text>';
      var rH = Math.round(coB * 0.92);
      var hh = huyHieu(le + 14 + rH, yy + coN * 1.9 + rH, rH, m.s.hex, m.hinh, null, k);
      manh.push(hh); ve += hh.ve;
      dB.forEach(function (d2, j) {
        ve += '<text x="' + Math.round(le + 14 + rH * 2 + 14) + '" y="' +
          Math.round(yy + coN * 1.9 + coB * 0.9 + j * coB * 1.36) +
          '" font-family="' + h(CHU_THAN) + '" font-size="' + coB +
          '" font-weight="600" fill="' + h(k.muc) + '">' + h(d2) + '</text>';
      });
      yy += caoO + 6;
    });

    /* ── DẢI CÂU ĐÓNG ĐINH, chạy hết bề ngang tấm ── */
    if (dinh2) {
      var caoD = Math.round(kg.h * 0.085);
      var yD = kg.h - le - caoD;
      ve += '<rect class="gita-tam" x="' + le + '" y="' + yD + '" width="' +
        (kg.w - le * 2) +
        '" height="' + caoD + '" rx="14" fill="' + h(k.gitaInk) + '"/>';
      var coD = Math.round(kg.w * 0.0245);
      var dD = catDong(boQuang(dinh2), '700 ' + coD + 'px ' + CHU_TIEU,
        kg.w - le * 2 - coD * 5);
      while (dD.length > 2 && coD > 14) {
        coD -= 1;
        dD = catDong(boQuang(dinh2), '700 ' + coD + 'px ' + CHU_TIEU,
          kg.w - le * 2 - coD * 5);
      }
      ve += '<text x="' + (le + Math.round(coD * 1.0)) + '" y="' +
        Math.round(yD + caoD * 0.62) + '" font-family="' + h(CHU_TIEU) +
        '" font-size="' + Math.round(coD * 2.4) + '" font-weight="700" fill="' +
        h(sac[4] ? sac[4].hex : k.gitaSang) + '">“</text>';
      var xD = le + Math.round(coD * 2.6);
      var y0D = yD + (caoD - dD.length * coD * 1.34) / 2 + coD * 0.86;
      dD.forEach(function (d2, j) {
        ve += '<text x="' + xD + '" y="' + Math.round(y0D + j * coD * 1.34) +
          '" font-family="' + h(CHU_TIEU) + '" font-size="' + coD +
          '" font-weight="600" fill="#FFFFFF">' + h(d2) + '</text>';
      });
    }

    return {ok: true, svg: khung(kg, k, nen.ve +
      '<rect x="0" y="0" width="' + kg.w + '" height="6" fill="' + h(k.gita) + '"/>' +
      ve, gom(manh).defs)};
  }

  /* ═══════════ LỚP NGƯỜI ═══════════

     Luật lopGhep của hiến pháp: một tấm có người là HAI LỚP. Lớp dưới
     là người và bối cảnh, do bộ tạo ảnh ngoài sinh, KHÔNG mang một chữ
     nào. Lớp trên là dấu, tiêu đề, ô việc, con số — do máy đặt.

     Hàm này vẽ lớp dưới, và nó chỉ nhận ảnh từ ĐÚNG HAI NGUỒN:
       · một mã trong ANH_NGUOI — kho ảnh của Học viện
       · x.anhNguoi — ảnh máy chủ ghi vào bản ghi SAU khi tấm đã đi đủ
         thang duyệt (luật C12)
     Đường dẫn tự do trong nội dung thì KHÔNG. Nhận được thì bất kỳ ảnh
     nào cũng vào được một ấn phẩm mang dấu GITA.

     ── CHƯA CÓ ẢNH THÌ VẼ Ô CHỜ, KHÔNG VẼ ĐẠI MỘT NGƯỜI ──
     Đây là chỗ dễ sai nhất của cả tệp. Bộ vẽ trong máy dựng được hình
     người phẳng, nên rất dễ thả một hình phẳng vào chỗ đợi ảnh chụp
     cho "đỡ trống". Làm thế thì tấm trông như đã xong, và không ai đi
     tìm lớp ảnh còn thiếu nữa — tấm ấy đi thẳng ra ấn phẩm với một
     hình que ở chỗ đáng lẽ là một người.
     Ô chờ vẽ ra đúng khung, đúng tỷ lệ, và NÓI RA nó đang chờ gì. */
  /* ══ LỚP NGƯỜI VẼ BẰNG BÚT MÀU ══

     Chủ hệ chốt 9.99.27. Đây là đường DUY NHẤT bộ vẽ trong máy đi trọn
     được, và nó đi được chính vì bức vẽ bút màu KHÔNG cố tỏ ra là ảnh
     chụp: nét run, màu chồng lớp, giấy có hạt — hình học dựng được cả
     ba. Da người có kết cấu thì không.

     Nên ở nền này không có ô chờ, không cần cửa đi ra, không cần một bí
     mật nào. Và luật C16 không cấm chỗ này: nó cấm hình vẽ ĐỨNG THAY
     một tấm ảnh, chứ không cấm một bức vẽ được đặt hàng làm bức vẽ.

     Vẽ ba lượt chồng nhau, đúng cách tay người cầm bút:
       1. mảng màu nền — vệt chéo thưa, nhạt
       2. thân hình tô màu bút, mềm, có run
       3. nét viền nâu chì đè lên trên, run mạnh hơn một chút
     Bỏ lượt nào thì nó ra hình vẽ máy: phẳng, đều, sạch quá. */
  /* Lấy một sắc theo TÊN trong bảng đã chốt. Gõ thẳng mã màu vào src/
     là dựng bảng màu thứ hai — và ba mã vàng-cam của bản cũ đã bị cấm
     hẳn trong kho này vì đúng chuyện đó. Bộ kiểm mục 13 canh, và nó
     vừa bắt được tôi ở chính hàm dưới đây. */
  function sacTheo(ten, duPhong) {
    var d = ((G.BRAND && G.BRAND.mau) || []).filter(function (m) {
      return m.k === ten; })[0];
    return (d && d.hex) || duPhong;
  }

  function canhButMau(x, y, w, ht, k, sac, maHinh) {
    var f = defBut();
    var manh = [{defs: f.defs}];
    var g = idMoi('canh');
    var ve = '<clipPath id="' + g + '"><rect x="' + x + '" y="' + y + '" width="' +
      w + '" height="' + ht + '" rx="18"/></clipPath>';
    ve = '';
    var defs = f.defs +
      '<clipPath id="' + g + '"><rect x="' + x + '" y="' + y + '" width="' + w +
      '" height="' + ht + '" rx="18"/></clipPath>';

    var trong = '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + ht +
      '" fill="' + h(k.nen2) + '"/>';

    /* 1 · mảng trời và mảng đất, mỗi mảng một lượt vệt chéo */
    var troi = vetBut(x, y, w, Math.round(ht * 0.62), sac, 0.22, f.run);
    var dat = vetBut(x, y + Math.round(ht * 0.62), w, Math.round(ht * 0.38),
      sacTheo('T4 · Lục', k.gita), 0.20, f.run);
    defs += troi.defs + dat.defs;
    trong += troi.ve + dat.ve;

    /* Mặt trời — một vòng nét run, không tô. Bút màu hiếm khi tô kín
       một vòng tròn to; nó khoanh rồi tô thưa bên trong. */
    var rM = Math.round(w * 0.15);
    trong += '<g filter="url(#' + f.run + ')" fill="none" stroke="' +
      h(sacTheo('Vàng GITA', k.gita)) +
      '" stroke-width="' + Math.max(3, rM * 0.13).toFixed(1) + '" stroke-opacity="0.85" ' +
      'stroke-linecap="round">' +
      '<circle cx="' + Math.round(x + w * 0.74) + '" cy="' + Math.round(y + ht * 0.15) +
        '" r="' + rM + '"/>' +
      '<circle cx="' + Math.round(x + w * 0.74) + '" cy="' + Math.round(y + ht * 0.15) +
        '" r="' + Math.round(rM * 0.62) + '" stroke-opacity="0.45"/></g>';

    /* Đường chân đất, vẽ tay — dựng TRƯỚC vì người phải đứng lên nó */
    var dayDat = Math.round(y + ht * 0.735);
    trong += '<g filter="url(#' + f.run + ')"><line x1="' + Math.round(x + w * 0.08) +
      '" y1="' + dayDat + '" x2="' + Math.round(x + w * 0.92) +
      '" y2="' + dayDat + '" stroke="' + h(k.muc2) +
      '" stroke-width="3" stroke-opacity="0.5" stroke-linecap="round"/></g>';

    /* ── 2 · NGƯỜI: VẼ TỪNG NGƯỜI, MỖI NGƯỜI MỘT MÀU BÚT ──

       Bản đầu tôi gọi thẳng hình ghép `nha` một lượt. Hai chỗ hỏng, cả
       hai đều thấy được ngay khi mở ảnh ra:

       · CẮT MẤT CHÂN VÀ MẤT NGƯỜI BÊN TRÁI. veNet co theo CHIỀU CAO
         (cao/100), mà hình `nha` rộng 96 đơn vị — nên bề ngang thật là
         0,96 lần chiều cao. Đặt cao 42% của tấm 1080 thì hình rộng 435
         điểm ảnh trong một cột rộng 410. Neo một khối vào MỘT chiều rồi
         quên chiều kia: đúng lớp lỗi đã sửa năm lần trong tệp này, nay
         quay lại ở chỗ thứ sáu.
       · RA MÀU NAVY ĐẶC. Lượt tô màu tầng, rồi lượt viền mực nâu đè lên
         ở 55% — hai lượt cộng lại thành một khối tối, không còn ra bút
         màu. Bút màu ĐẬM DẦN theo lượt, nhưng vẫn phải nhìn thấy màu.

       Nay: ba người vẽ RIÊNG, ba màu khác nhau lấy từ bảng đã chốt —
       đúng cách một bức vẽ bút màu phân biệt người, và cũng là cách
       tấm ấy nói "cả nhà" thay vì "một khối ba đầu". */
    var chan = [
      {hex: sac,      caoTy: 0.230, xTy: 0.24},   /* người lớn thứ nhất */
      {hex: sacTheo('T5 · Hổ phách', k.gita), caoTy: 0.160, xTy: 0.50},
      {hex: sacTheo('T4 · Lục', k.gita), caoTy: 0.220, xTy: 0.76}
    ];
    /* Hình `nguoi` rộng 60 đơn vị trên 100 đơn vị cao, và đáy nằm ở +44.
       Hai con số ấy đọc từ chính đường dẫn, không đoán. */
    var NG_RONG = 0.60, NG_DAY = 0.44;
    chan.forEach(function (m) {
      var cao = Math.round(ht * m.caoTy);
      /* Chặn theo CẢ HAI chiều: không quá 30% bề ngang cột. */
      cao = Math.min(cao, Math.round(w * 0.30 / NG_RONG));
      var cx = Math.round(x + w * m.xTy);
      var cy = Math.round(dayDat - cao * NG_DAY);
      /* Nét chì sẫm hơi to hơn, nằm dưới — đó là viền bút, không phải
         bóng đổ: bóng đổ là ngôn ngữ của màn hình, giấy không có bóng. */
      trong += '<g filter="url(#' + f.run + ')" opacity="0.55">' +
        veNet('nguoi', 'nguoi', cx, cy, Math.round(cao * 1.045),
          doiSang(m.hex, -0.45)) + '</g>';
      trong += '<g filter="url(#' + f.run + ')" opacity="0.88">' +
        veNet('nguoi', 'nguoi', cx, cy, cao, m.hex) + '</g>';
    });

    return {defs: defs, ve: '<g clip-path="url(#' + g + ')">' + trong + '</g>',
            coAnh: true};
  }

  function lopNguoi(ma, x, y, w, ht, k, sac, xRec, treTren) {
    /* Nền bút màu: máy VẼ lớp người, không chờ ảnh. */
    if (k.but) return canhButMau(x, y, w, ht, k, sac, ma && NGUOI[ma] ? ma : 'nha');
    var tep = '';
    if (ma && ANH_NGUOI[ma]) tep = ANH_NGUOI[ma].tep;
    else if (ma === 'kho' && xRec && xRec.anhNguoi) tep = String(xRec.anhNguoi);
    var idc = idMoi('cat'), idq = idMoi('quangn');
    /* Quầng sắc chặng sau người — thứ nối lớp ảnh vào lớp chữ. Không
       có nó thì ảnh trông như dán lên, không như nằm trong tấm. */
    var quang =
      '<radialGradient id="' + idq + '" cx="50%" cy="45%" r="55%">' +
        '<stop offset="0%" stop-color="' + h(sac) + '" stop-opacity="' +
          (k.sau ? '0.34' : '0.15') + '"/>' +
        '<stop offset="100%" stop-color="' + h(sac) + '" stop-opacity="0"/>' +
      '</radialGradient>';
    var nenQ = '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' +
      ht + '" fill="url(#' + idq + ')"/>';

    if (!tep) {
      /* Ô CHỜ. Nét đứt, không nền đặc, và một câu nói thẳng. Trông
         phải RA một chỗ còn thiếu, không ra một mảng thiết kế. */
      var co = Math.max(13, Math.round(w * 0.045));
      /* ── BA DÒNG NÀY PHẢI TRÁNH BÓNG THOẠI ──
         Chúng vẫn căn giữa dải người — đúng khi dải cao. Ở khổ đứng
         tràn màn thì dải chỉ còn hơn một phần tư tấm, mà bóng thoại
         neo vào đầu dải, nên giữa dải RƠI ĐÚNG vào bóng: chữ "Ô CHỜ
         LỚP NGƯỜI" chui ra sau bóng, còn thấy mỗi "…ỜI".
         Chủ hệ nhìn ra chỗ này trước bộ kiểm, vì bộ kiểm chỉ dựng khổ
         mặc định — khổ đứng chưa từng được dựng lần nào.
         Nay chỗ gọi ĐO bóng trước rồi báo xuống đây phải nhường bao
         nhiêu, và ba dòng căn giữa phần CÒN LẠI. */
      var nhuong = Math.max(0, Math.min(Number(treTren) || 0, ht * 0.6));
      var giuaY = y + nhuong + (ht - nhuong) / 2;
      var loi = ['Ô CHỜ LỚP NGƯỜI', Math.round(w) + '×' + Math.round(ht),
                 'ảnh về rồi mới đầy'];
      var svg = nenQ +
        '<rect x="' + (x + 2) + '" y="' + (y + 2) + '" width="' + (w - 4) +
          '" height="' + (ht - 4) + '" rx="16" fill="none" stroke="' + h(sac) +
          '" stroke-opacity="0.55" stroke-width="2" stroke-dasharray="11 8"/>';
      /* Lớp `gita-giangiao` — chữ của Ô CHỜ là GIÀN GIÁO, không phải
         nội dung của tấm. Bản đầu của chữ thay ảnh nuốt luôn cả ba
         dòng này, nên câu tả một áp phích mở đầu bằng "Ô CHỜ LỚP
         NGƯỜI · 410×1080 · ảnh về rồi mới đầy" — đúng ba dòng nói về
         chỗ CHƯA CÓ GÌ, đứng trước mọi thứ tấm thật sự nói.
         Tấm đã phát hành thì không còn ô chờ (luật C16), nhưng tấm
         đang đi trong thang duyệt thì có, và bản mô tả của nó phải
         dùng được ngay lúc ấy. */
      loi.forEach(function (d, i) {
        svg += '<text class="gita-giangiao" x="' + Math.round(x + w / 2) + '" y="' +
          Math.round(giuaY + (i - 1) * co * 1.5) + '" text-anchor="middle" ' +
          'font-family="' + h(CHU_THAN) + '" font-size="' +
          (i === 0 ? co : Math.round(co * 0.82)) + '" font-weight="' +
          (i === 0 ? 800 : 500) + '" fill="' + h(k.muc2) + '" letter-spacing="' +
          (i === 0 ? (co * 0.10).toFixed(1) : '0') + '">' + h(d) + '</text>';
      });
      return {defs: quang, ve: svg, coAnh: false};
    }

    return {defs: quang +
      '<clipPath id="' + idc + '"><rect x="' + x + '" y="' + y + '" width="' + w +
        '" height="' + ht + '" rx="16"/></clipPath>',
      coAnh: true,
      ve: nenQ +
        /* ── VỪA KHUNG, NEO ĐÁY — KHÔNG CẮT PHÓNG ──
           `slice` phủ kín khung bằng cách phóng ảnh lên rồi cắt phần
           thừa. Với cột người 410×1080 (tỷ lệ 0,38) và một ảnh chân
           dung 276×536 (tỷ lệ 0,51), nó phóng ảnh gần gấp đôi để phủ
           chiều cao — và cái phủ được là KHUÔN MẶT, chiếm trọn cột.
           Một tấm áp phích cần thấy cả người, không cần thấy lỗ chân
           lông. `meet` cho ảnh vừa hẳn vào bề ngang; neo ĐÁY để người
           đứng trên mép dưới, phần trống dồn lên trên — đúng chỗ bóng
           thoại đã ngồi sẵn. */
        '<image href="' + h(tep) + '" x="' + x + '" y="' + y + '" width="' + w +
          '" height="' + ht + '" preserveAspectRatio="xMidYMax meet" clip-path="url(#' +
          idc + ')"/>'};
  }

  /* ── BÓNG THOẠI ──
     Một câu ngắn trong bóng bo tròn có đuôi, đặt CHỒNG lên lớp người.
     Nền đặc chứ không mờ: đặt lên một tấm ảnh thì nền mờ nghĩa là chữ
     đọc trên bất cứ thứ gì ảnh có ở đúng chỗ đó, và ảnh thì đổi. */
  function bongThoai(chu, x, y, rongToiDa, k, sac) {
    var co = Math.max(13, Math.round(rongToiDa * 0.062));
    var dong = catDong(chu, '600 ' + co + 'px ' + CHU_THAN, rongToiDa - co * 2.2);
    while (dong.length > 4 && co > 11) {
      co -= 1;
      dong = catDong(chu, '600 ' + co + 'px ' + CHU_THAN, rongToiDa - co * 2.2);
    }
    var rong = 0;
    dong.forEach(function (d) {
      rong = Math.max(rong, doRong(d, '600 ' + co + 'px ' + CHU_THAN)); });
    rong = Math.min(rongToiDa, Math.round(rong + co * 2.2));
    var ht = Math.round(dong.length * co * 1.42 + co * 1.5);
    var nen = nenDac(sac, 5.5);          /* đủ tối cho chữ trắng, 5,5:1 */
    var muc = mucTrenDac(nen);
    var svg = '<g><rect class="gita-tam" x="' + x + '" y="' + y + '" width="' + rong +
      '" height="' + ht + '" rx="' + Math.round(co * 1.1) + '" fill="' + h(nen) + '"/>' +
      /* Đuôi bóng chỉ xuống dưới-trái, về phía người. */
      '<path d="M' + Math.round(x + co * 1.4) + ' ' + (y + ht - 1) +
        ' l0 ' + Math.round(co * 1.15) + ' l' + Math.round(co * 1.25) + ' -' +
        Math.round(co * 1.15) + ' Z" fill="' + h(nen) + '"/>';
    dong.forEach(function (d, i) {
      svg += '<text x="' + Math.round(x + co * 1.1) + '" y="' +
        Math.round(y + co * 1.35 + i * co * 1.42) + '" font-family="' + h(CHU_THAN) +
        '" font-size="' + co + '" font-weight="600" fill="' + h(muc) + '">' +
        h(d) + '</text>';
    });
    return {cao: ht + Math.round(co * 1.15), rong: rong, ve: svg + '</g>'};
  }

  /* Đọc các dòng "Ô | tên | mô tả" thành lưới ô việc. Máy KHÔNG tự cắt
     một đoạn văn thành ô — cùng luật với lưới ô của KHUNG: cắt là đoán,
     và đoán sai thì không ai biết là đã đoán. */
  function docO(chu) {
    return String(chu || '').split('\n').map(function (d) {
      var m = /^\s*Ô\s*\|\s*(.+)$/.exec(d);
      if (!m) return null;
      var p = m[1].split('|').map(function (v) { return v.trim(); });
      if (!p[0]) return null;
      var o = {ten: p[0]};
      if (p[1]) o.mo = p[1];           /* không có mô tả thì BỎ HẲN khoá */
      return o;
    }).filter(Boolean);
  }

  /* ═══════════ BỘ VẼ · ÁP PHÍCH CÓ NGƯỜI ═══════════

     Khuôn của tấm mẫu chủ hệ gửi: người chiếm trọn một cột từ mép tới
     mép, cột kia là dấu — nhãn — tiêu đề lớn — câu phụ — dải băng —
     lưới ô việc, và một câu viết tay ở chân. */
  function veApPhich(x, kg, che) {
    var k = bang(che);
    var chu = boDau(x.noiDung);
    var cau = cauDau(chu);
    if (!cau) return {ok: false,
      error: 'Áp phích cần một TIÊU ĐỀ ở dòng đầu nội dung — vài chữ thôi, ' +
             'đó là thứ người ta đọc trước cả khi thấy người trong ảnh.'};

    var o = docO(x.noiDung);
    if (!o.length) return {ok: false,
      error: 'Áp phích cần ít nhất một dòng "Ô | tên | mô tả". Máy KHÔNG tự cắt ' +
             'một đoạn văn thành ô — cắt là đoán, và một tấm đoán sai trông y ' +
             'hệt một tấm đúng.'};
    if (o.length > 6) return {ok: false, code: 'QUANHIEUO',
      error: 'Tối đa SÁU ô một áp phích, đang có ' + o.length + '. Luật C07 cấm ' +
             'nhồi chữ vào hình: quá sáu thì mắt không đọc hết trước khi bỏ đi, ' +
             'và ô thứ bảy chỉ làm sáu ô kia khó thấy hơn.'};

    var sac = sacTang();
    if (!sac.length) return {ok: false, error: 'Chưa mở được bảng màu thương hiệu.'};
    var maAnh = docDau(x.noiDung, 'ẢNH');
    if (maAnh && maAnh !== 'kho' && !ANH_NGUOI[maAnh]) return {ok: false,
      error: 'Không có ảnh "' + maAnh + '" trong kho ảnh. Đang có: ' +
             Object.keys(ANH_NGUOI).join(', ') + ' · hoặc "kho" để dùng ảnh máy ' +
             'chủ đã ghi vào bản ghi sau khi tấm qua đủ thang duyệt.'};
    /* Hai dấu, hai nguồn, KHÔNG lẫn nhau:
         ẢNH:  — một mã trong kho ẢNH CHỤP của Học viện
         HÌNH: — một hình VẼ trong bộ hình của máy, chỉ dùng ở nền bút màu
       Lẫn hai dấu này là mở đường cho một hình vẽ đứng thay một tấm
       ảnh, đúng thứ luật C16 cấm. */
    var maHinh = docDau(x.noiDung, 'HÌNH');
    if (maHinh && !NGUOI[maHinh]) return {ok: false,
      error: 'Không có hình vẽ tên "' + maHinh + '". Đang có: ' +
             Object.keys(NGUOI).join(', ') + '.'};
    if (maHinh && che !== 'but') return {ok: false, code: 'HINHSAINEN',
      error: 'Dấu "HÌNH:" chỉ dùng được ở nền GIẤY BÚT MÀU. Trên nền ảnh chụp, ' +
             'một hình vẽ đứng thay chỗ người là đúng thứ luật C16 cấm: tấm ấy ' +
             'TRÔNG NHƯ ĐÃ XONG nên không ai đi tìm lớp người còn thiếu nữa. ' +
             'Vẽ tấm này ở nền "but", hoặc bỏ dấu HÌNH và đặt ảnh thật.'};

    var ben = (docDau(x.noiDung, 'BÊN') || 'trái').toLowerCase();
    var traiLaNguoi = ben.indexOf('ph') !== 0;

    var le = Math.round(kg.w * 0.045);
    /* ── KHUNG CAO THÌ XẾP CHỒNG, KHÔNG XẾP CẠNH ──
       Bố cục hai cột dựng cho khổ vuông. Đặt nguyên nó lên khổ đứng
       1080×1920 thì cả hai cột cùng hẹp lại một nửa trong khi chiều
       cao thừa ra gần gấp đôi: người teo xuống một góc, khối chữ căn
       giữa để trống hẳn phần trên và phần dưới.
       Vẽ ra mới thấy, và nó là một lớp lỗi có tên: một bố cục neo vào
       TỶ LỆ mà lại đem dùng ở một tỷ lệ khác. Trên khung cao hơn 1,45
       lần bề ngang thì người thành một DẢI ngang chiếm hết bề ngang ở
       đáy, chữ nằm trọn bề ngang phía trên. */
    var khungCao = kg.h / kg.w > 1.45;
    var rongNguoi, xNguoi, xChu, rongChu, yNguoi, caoNguoi;
    if (khungCao) {
      rongNguoi = kg.w; xNguoi = 0;
      caoNguoi = Math.round(kg.h * 0.42);
      yNguoi = kg.h - caoNguoi;
      xChu = le; rongChu = kg.w - le * 2;
    } else {
      rongNguoi = Math.round(kg.w * 0.38);
      xNguoi = traiLaNguoi ? 0 : kg.w - rongNguoi;
      caoNguoi = kg.h; yNguoi = 0;
      xChu = traiLaNguoi ? rongNguoi + Math.round(kg.w * 0.028) : le;
      rongChu = kg.w - rongNguoi - Math.round(kg.w * 0.028) - le;
    }

    var nen = lopNen(kg, k, 0.8);
    var bong = defBong(k, 1), cs = defChuSac(k);
    var manh = [nen, bong, cs];
    var sChinh = sac[0];

    /* LỚP NGƯỜI DỰNG SAU KHI ĐO XONG CỘT CHỮ — xem chú giải ở chỗ
       tính caoTong bên dưới. Ở đây mới chỉ giữ chỗ. */
    var ln = null, ve = '';

    /* ── ĐO CẢ CỘT CHỮ TRƯỚC KHI VẼ MỘT NÉT NÀO ──
       Lớp lỗi đã sửa năm lần trong tệp này: neo một khối vào một con
       số đoán rồi mới đo. Ở đây cột chữ có tới sáu khối chồng nhau,
       nên đoán một khối là lệch cả năm khối dưới. */
    var nhan = docDau(x.noiDung, 'NHÃN');
    var phu = docDau(x.noiDung, 'PHỤ') || cauHai(chu);
    var bangC = docDau(x.noiDung, 'BĂNG');
    var ky = docDau(x.noiDung, 'KÝ');

    var coT = Math.round(kg.w / 12), dT;
    for (;;) {
      dT = catDong(cau, '800 ' + coT + 'px ' + CHU_THAN, rongChu);
      if (dT.length <= 2 || coT <= 26) break;
      coT -= 2;
    }
    /* ── CHIỀU CAO CỦA TIÊU ĐỀ: HỎI KHỐI, ĐỪNG NHÂN LẠI ──
       Trước đây chỗ này và chỗ vẽ ở dưới CÙNG nhân `dT.length × coT ×
       1,10` — hai bản chép của một phép tính. Nay cả hai đọc `kT`.
       `trenT` là khoảng từ đỉnh khối tới ĐƯỜNG CHÂN dòng đầu: phải đủ
       cho mực chứ không phải đủ cho ô, nếu không mũ của "Ầ" chui lên
       đè vào dòng nhãn ở trên. 0,24·coT dưới đường chân cuối là đúng
       phần thừa của công thức cũ (1,10 − 0,86), giữ nguyên để khoảng
       cách tới vạch đỏ không đổi. */
    var kT = khoiChu(cau, {co: coT, chu: CHU_THAN, dam: 800,
      rong: rongChu, gian: 1.10});
    var trenT = Math.max(coT * 0.86, kT.tren + coT * 0.05);
    var caoKhoiT = trenT + (kT.cao - kT.buoc) + coT * 0.24;

    var coN = Math.round(coT * 0.30);
    var coP = Math.round(coT * 0.32);
    var dP = phu ? catDong(phu, '500 ' + coP + 'px ' + CHU_THAN, rongChu) : [];
    /* Gọi lần này chỉ để ĐO bề rộng và chiều cao dải; bản vẽ thật dựng
       lại ở dưới với tâm đã neo đúng lề. Không đẩy vào manh — đẩy thì
       tấm mang hai chuyển sắc y hệt nhau, một cái không ai dùng. */
    var db = bangC ? daiBang(bangC, 0, 0, k, rongChu) : null;

    /* ── LƯỚI Ô: SỐ CỘT THEO SỐ Ô, VÀ SÁU Ô LÀ BA CỘT ──
       Bản đầu xếp sáu ô thành 2 cột × 3 hàng và tấm tràn 213 điểm ảnh.
       Tấm mẫu chủ hệ gửi xếp 3 × 2, và đó không phải một sở thích: một
       hàng thêm vào tốn CẢ chiều cao ô, còn một cột thêm vào chỉ tốn
       một phần chiều ngang mà cột ấy vốn đang thừa. Chiều cao là thứ
       khan hiếm trên khổ vuông, không phải chiều ngang. */
    var soCot = o.length >= 5 ? 3 : (o.length >= 3 ? 2 : 1);
    var soHang = Math.ceil(o.length / soCot);
    var giua = Math.round(kg.w * 0.013);
    /* ── PHẦN DƯ CỦA PHÉP CHIA ĐI ĐÂU ──
       rongO = làm tròn((rongChu − hở)/số cột) rồi nhân lại thì tổng
       lệch tới (số cột − 1) điểm ảnh so với cột chữ: ô cuối đổ ra
       ngoài lề phải, hoặc hụt vào trong. Một điểm ảnh thì không ai
       gọi tên được, nhưng mắt đọc ra là "lưới không thẳng lề".
       Chia sàn rồi RẢI phần dư cho mấy ô đầu, mỗi ô một điểm ảnh —
       tổng khớp tuyệt đối, và chênh lệch lớn nhất giữa hai ô là 1. */
    var rongTho = rongChu - giua * (soCot - 1);
    var rongO = Math.floor(rongTho / soCot);
    var duO = rongTho - rongO * soCot;                 /* 0 … soCot−1 */
    /* Bề rộng và mốc trái của TỪNG cột, tính sẵn một lần. */
    var cotRong = [], cotX = [], _x = 0;
    for (var _c = 0; _c < soCot; _c++) {
      var _w = rongO + (_c < duO ? 1 : 0);
      cotRong.push(_w); cotX.push(_x); _x += _w + giua;
    }
    /* ── TRẦN THEO KHỔ TẤM, KHÔNG CHỈ THEO BỀ RỘNG Ô ──
       Ba cỡ này co theo bề rộng ô. Trên khổ vuông cột chữ rộng 591 nên
       ô rộng 187 và huy hiệu 36 — vừa. Trên khổ đứng cột chữ chiếm trọn
       bề ngang 982, ô rộng 318, huy hiệu phình lên 60 và Ô CAO THEO:
       307 điểm ảnh mỗi ô thay vì 190. Hai hàng ô ăn hết 628, và cả cột
       chữ đòi 1382 trên một tấm cao 1920.
       Nghịch lý là cột RỘNG ra lại làm tấm THIẾU chỗ — vì chỉ có một
       chiều được neo. Trần theo khổ tấm chặn đúng chỗ ấy: một huy hiệu
       to hơn 4,5% bề ngang tấm thì cũng không đọc rõ hơn, chỉ chiếm chỗ. */
    var coTenO = Math.max(13, Math.min(Math.round(rongO * 0.105),
                                       Math.round(kg.w * 0.028)));
    var coMoO = Math.max(11, Math.min(Math.round(rongO * 0.072),
                                      Math.round(kg.w * 0.020)));
    var rHH = Math.min(Math.round(rongO * 0.19), Math.round(kg.w * 0.045));
    /* ── HUY HIỆU ĐO TỪ TÂM, KHÔNG TỪ ĐỈNH ──
       Bản đầu đặt tên ô ở rHH*2 dưới đỉnh ô, mà huy hiệu tâm ở rHH*1.5
       và bán kính rHH nên đáy nó ở rHH*2.5 — tên chui vào nửa dưới huy
       hiệu. Vẽ ra mới thấy: "HỖ TRỢ" bị cắt ngang. Nay mọi mốc tính từ
       ĐÁY huy hiệu, và đáy ấy có tên riêng để không ai cộng nhầm nữa. */
    /* ── TÊN Ô PHẢI VỪA Ô, VÀ VỪA Ở CÙNG MỘT CỠ ──
       Bản trước đặt tên ô bằng MỘT thẻ <text> căn giữa, không đo, không
       ngắt dòng. Tên ngắn như "ĐỌC HIỂU" thì lọt, nên nó chạy qua mấy
       bản mà không ai thấy. Tấm "cả nhà cùng bắt đầu" có tên dài —
       "PHIẾU GHI BẢY NGÀY", "CỔNG NGHIỆM THU" — và cả năm tên tràn ra
       ngoài ô, đè lên ô bên cạnh.
       Bộ kiểm vẫn XANH suốt, vì bản mẫu của nó cũng dùng tên ngắn. Phép
       đo có thật và đúng; chỗ hổng nằm ở BẢN MẪU quá dễ. Đã đổi bản mẫu
       sang tên dài cùng lượt sửa này.
       Tìm MỘT cỡ chữ vừa cho MỌI ô, không co riêng từng ô: mỗi ô một cỡ
       thì hàng ô đọc ra lồi lõm, mà lồi lõm ở đây không mang tin gì. */
    var rongTen = rongO - coMoO * 1.0;
    var dongTen;
    for (;;) {
      dongTen = o.map(function (m) {
        return catDong(String(m.ten).toUpperCase(),
          '800 ' + coTenO + 'px ' + CHU_THAN, rongTen); });
      var quaDai = dongTen.filter(function (d) { return d.length > 2; }).length;
      if (!quaDai || coTenO <= 11) break;
      coTenO -= 1;
    }
    /* Tên ô cao bao nhiêu thì HỎI khối, đừng nhân `số dòng × cỡ ×
       1,15`. Bản trước nhân tay, và hai dòng chữ hoa "BỘ TEST ĐẦU /
       VÀO" có dấu huyền dòng dưới đè lên chân dòng trên 2 điểm ảnh —
       "CỔNG NGHIỆM / THU NGÀY BẢY" đè 3. Mắt đọc ra là hai dòng dính
       vào nhau; bộ kiểm thì tới 9.99.31 mới có phép đo mực để thấy. */
    var khoiTen = o.map(function (m) {
      return khoiChu(String(m.ten).toUpperCase(), {co: coTenO, chu: CHU_THAN,
        dam: 800, rong: rongTen, gian: 1.15}); });

    var oDem = Math.round(coTenO * 0.75);       /* chừa mép trên trong ô */
    var oDayHH = oDem + rHH * 2.5;              /* đáy huy hiệu, kể từ đỉnh ô */
    var caoTen = coTenO * 0.15 + Math.max.apply(null,
      khoiTen.map(function (q) { return q.cao; }));
    var caoO = 0;
    var dongO = o.map(function (m) {
      var d = m.mo ? catDong(m.mo, '500 ' + coMoO + 'px ' + CHU_THAN,
        rongO - coMoO * 1.3) : [];
      caoO = Math.max(caoO, oDayHH + caoTen + d.length * coMoO * 1.30 +
        coTenO * 0.85);
      return d;
    });
    caoO = Math.round(caoO);

    var caoKy = ky ? Math.round(coT * 0.42) * 1.7 : 0;
    var caoTong = (nhan ? coN * 1.9 : 0) +
      caoKhoiT + coT * 0.34 +
      (dP.length ? dP.length * coP * 1.38 + coP * 0.7 : 0) +
      (db ? db.cao + coT * 0.34 : 0) +
      soHang * caoO + (soHang - 1) * giua + coT * 0.40 + caoKy;

    var yDau = Math.round(kg.h * 0.052);
    var caoDau = Math.round(kg.h * 0.075);
    var vungY = yDau + caoDau;

    /* ── DẢI NGƯỜI LẤY PHẦN CÒN LẠI, KHÔNG LẤY MỘT TỶ LỆ CỐ ĐỊNH ──
       Bản đầu chốt cứng dải người 42% chiều cao rồi mới đo cột chữ —
       và cột chữ tràn 406 điểm ảnh. Cùng lớp lỗi đã sửa ở cổng nghiệm
       thu: chốt khung trước rồi ép nội dung vào chỗ thừa.
       Nay đo chữ trước, người lấy phần còn lại. Còn dưới 26% chiều cao
       thì KHÔNG bóp người xuống nữa — một dải người mỏng hơn thế đọc ra
       là một vệt, không đọc ra là người — mà để phép từ chối bên dưới
       nói thẳng là tấm quá tải. */
    /* ── VÀ ĐÂY LÀ CHỖ TÔI ĐẾM HAI LẦN ──
       Bản đầu của khối này viết:
         conLai   = cao tấm − đầu − caoTong − hở
         caoNguoi = kẹp(conLai, 26%..46%)
       rồi để vungCao tính lại từ yNguoi. Nghĩa là chữ bị đo trên phần
       CÒN LẠI SAU KHI người đã lấy — mà người lại lấy theo phần còn
       lại sau chữ. Hai bên cùng trừ nhau một lần nữa.
       Bằng chứng nó sai: BỎ BỚT một câu khỏi nội dung thì tấm tràn
       NHIỀU HƠN — 99 lên 219 điểm ảnh. Nội dung ít đi mà chỗ thiếu
       nhiều lên là một mâu thuẫn, và mâu thuẫn thì luôn là lỗi của
       phép tính chứ không phải của nội dung.
       Nay: CHỮ lấy đúng thứ nó cần, NGƯỜI lấy phần thừa. Thừa không
       đủ 26% chiều cao thì phép từ chối bên dưới nói ra. */
    if (khungCao) {
      caoNguoi = kg.h - vungY - caoTong - Math.round(kg.h * 0.03);
      caoNguoi = Math.round(Math.min(caoNguoi, kg.h * 0.46));
      yNguoi = kg.h - Math.max(caoNguoi, 0);
    }
    /* Khung cao: vùng chữ dừng TRƯỚC dải người, không lấn xuống. Không
       trừ thì khối chữ căn giữa cả tấm và nửa dưới của nó nằm đè lên
       người. */
    var vungCao = khungCao ? Math.max(caoTong, 0)
                           : kg.h - vungY - Math.round(kg.h * 0.03);
    /* ĐO bóng thoại trước khi vẽ lớp người, để lớp người biết phải
       nhường bao nhiêu ở đầu dải. Gọi lần này chỉ để đo — bản vẽ thật
       dựng lại ở cuối, sau lớp người, vì bóng phải nằm TRÊN. Cùng cách
       `daiBang` đã làm. */
    var thoaiDo = docDau(x.noiDung, 'THOẠI');
    var nhuongThoai = 0;
    if (thoaiDo) {
      var btDo = bongThoai(thoaiDo,
        khungCao ? le : xNguoi + Math.round(rongNguoi * 0.06),
        khungCao ? Math.round(yNguoi + kg.h * 0.02) : Math.round(kg.h * 0.075),
        Math.round((khungCao ? kg.w - le * 2 : rongNguoi) * 0.80), k, sChinh.hex);
      var dayBong = (khungCao ? Math.round(yNguoi + kg.h * 0.02)
                              : Math.round(kg.h * 0.075)) + btDo.cao;
      nhuongThoai = Math.max(0, dayBong - yNguoi + Math.round(kg.h * 0.015));
    }
    ln = lopNguoi(maHinh || maAnh, xNguoi, yNguoi, rongNguoi, caoNguoi, k,
      sChinh.hex, x, nhuongThoai);
    manh.push(ln); ve = ln.ve;
    var thieuNguoi = khungCao && caoNguoi < Math.round(kg.h * 0.26);
    if (caoTong > vungCao || thieuNguoi) {
      var thua = thieuNguoi ? Math.round(kg.h * 0.26 - caoNguoi)
                            : Math.round(caoTong - vungCao);
      if (thieuNguoi) return {ok: false, code: 'HETCHONGUOI',
        error: 'Khổ đứng này còn ' + Math.max(caoNguoi, 0) + ' điểm ảnh cho dải ' +
               'người, thiếu ' + thua + ' nữa mới đủ. Dải mỏng hơn một phần tư ' +
               'chiều cao thì đọc ra là một vệt, không đọc ra là người — nên máy ' +
               'KHÔNG bóp tiếp. Bớt một ô hoặc bỏ câu phụ.'};
      return {ok: false, code: 'DAIQUAKHO',
        error: 'Cột chữ dài hơn khổ tấm ' + thua + ' điểm ảnh. Bớt một ô, rút ' +
               'ngắn mô tả, hoặc bỏ câu phụ. Máy KHÔNG đẩy khối lên cho vừa: ' +
               'đẩy lên là chồng chữ lên khối đã vẽ, tức là giấu một tấm quá ' +
               'tải bằng cách làm nó khó đọc — đúng lỗi đã sửa ở thẻ ngày. ' +
               'Đang có ' + o.length + ' ô.'};
    }

    /* ── VẼ ──
       ══ MỘT ĐƯỜNG DỌC, KHÔNG BỐN ══
       Bản 9.99.24 có BỐN mép trái khác nhau trong cùng một cột, và
       không cái nào sai hẳn nên không cái nào tự lộ ra:
         · vòng dấu GITA lệch 6 điểm ảnh (tâm đặt ở +21, bán kính 16)
         · chữ nhãn thụt 48 điểm ảnh — nó neo theo VẠCH ĐỎ, không theo
           chữ, mà vạch đỏ đứng trước chữ
         · dải băng căn GIỮA cột trong khi cả cột căn TRÁI
         · lưới ô lệch tới 2 điểm ảnh vì phần dư phép chia rơi mất
       Bốn cái cùng nhỏ thì mắt không gọi được tên cái nào; nó chỉ đọc
       ra "cột này không thẳng". Nay mọi thứ neo vào đúng một biến. */
    var RAY = xChu;                       /* đường dọc DUY NHẤT của cột */
    /* Đánh dấu từng khối neo vào đường dọc ấy. Không phải để trang trí:
       bộ kiểm đọc đúng lớp này rồi đòi mọi mép trái trùng nhau. Không
       đánh dấu thì phép đo phải ĐOÁN khối nào đáng lẽ thẳng hàng, mà
       chữ căn giữa trong ô cũng có mép trái riêng và nó thẳng hàng với
       chính nó — đoán kiểu gì cũng có ngày báo oan. */
    var ray = function (s) { return '<g class="gita-ray">' + s + '</g>'; };
    ve += dauGita(k, RAY + Math.round(16 * tiDau(kg)), yDau + Math.round(16 * tiDau(kg)), kg);   /* +16 = bán kính vòng + nét */
    var yy = Math.round(vungY + (vungCao - caoTong) / 2);
    if (nhan) {
      /* Không bọc ray() ở đây — nhanTren tự đánh dấu đúng thẻ <text>. */
      ve += nhanTren(nhan, RAY, Math.round(yy + coN), k, coN, true);
      yy = Math.round(yy + coN * 1.9);
    }
    var tt = veChu(cau, RAY, Math.round(yy + trenT), {co: coT, chu: CHU_THAN,
      dam: 800, mau: 'url(#' + cs.id + ')', rong: rongChu, gian: 1.10});
    ve += ray(tt.svg); yy = Math.round(yy + caoKhoiT);
    ve += ray('<rect x="' + RAY + '" y="' + Math.round(yy + coT * 0.10) + '" width="' +
      Math.round(rongChu * 0.26) + '" height="4" rx="2" fill="' + h(k.do) + '"/>');
    yy = Math.round(yy + coT * 0.34);
    if (dP.length) {
      ve += ray(veChu(phu, RAY, Math.round(yy + coP * 1.0), {co: coP, chu: CHU_THAN,
        dam: 500, mau: k.muc2, rong: rongChu, gian: 1.38}).svg);
      yy = Math.round(yy + dP.length * coP * 1.38 + coP * 0.7);
    }
    if (db) {
      /* Neo dải theo LỀ TRÁI: daiBang nhận tâm, nên tâm = lề + nửa bề
         rộng thật của dải. Bề rộng ấy co theo chữ nên phải hỏi lại
         daiBang, không được đoán. */
      db = daiBang(bangC, RAY + Math.round(db.rong / 2), yy, k, rongChu);
      manh.push(db); ve += ray(db.ve); yy = Math.round(yy + db.cao + coT * 0.34);
    }

    o.forEach(function (m, i) {
      var cot = i % soCot, hang = Math.floor(i / soCot);
      var ox = xChu + cotX[cot], wO = cotRong[cot];
      var oy = Math.round(yy + hang * (caoO + giua));
      var s = sac[i % sac.length];
      var kinh = tamKinh(ox, oy, wO, caoO, k, {sac: s.hex, bong: bong.id, bo: 14});
      manh.push(kinh);
      /* Chỉ ô ở CỘT ĐẦU mới neo vào đường dọc; các cột sau lùi theo
         lưới, thẳng hàng với nhau chứ không với đường dọc. */
      ve += (cot === 0 ? ray(kinh.ve) : kinh.ve);
      var hh = huyHieu(Math.round(ox + wO / 2), Math.round(oy + oDem + rHH * 1.5),
        rHH, s.hex, chonHinh(m.ten, i), bong.id, k);
      manh.push(hh); ve += hh.ve;
      dongTen[i].forEach(function (d, j) {
        ve += '<text x="' + Math.round(ox + wO / 2) + '" y="' +
          Math.round(oy + oDayHH + coTenO * 1.05 + khoiTen[i].yDong[j]) +
          '" text-anchor="middle" font-family="' + h(CHU_THAN) + '" font-size="' +
          coTenO + '" font-weight="800" fill="' + h(k.muc) + '">' + h(d) + '</text>';
      });
      dongO[i].forEach(function (d, j) {
        ve += '<text x="' + Math.round(ox + wO / 2) + '" y="' +
          Math.round(oy + oDayHH + caoTen + coMoO * (1.05 + j * 1.30)) +
          '" text-anchor="middle" font-family="' + h(CHU_THAN) + '" font-size="' +
          coMoO + '" font-weight="500" fill="' + h(k.muc2) + '">' + h(d) + '</text>';
      });
    });
    yy = Math.round(yy + soHang * caoO + (soHang - 1) * giua + coT * 0.40);

    if (ky) {
      var coK = Math.round(coT * 0.42);
      /* Đẩy sang phải đúng phần mực nhô ra, để MÉP NÉT trùng đường dọc
         chứ không phải điểm đặt bút trùng đường dọc. */
      var xK = RAY + Math.round(nhoTrai(ky, 'italic 500 ' + coK + 'px ' + CHU_TIEU));
      ve += ray('<text x="' + xK + '" y="' +
        Math.round(yy + coK) + '" font-family="' + h(CHU_TIEU) +
        '" font-size="' + coK + '" font-style="italic" font-weight="500" fill="' +
        h(sChinh.hex === k.nen ? k.muc : nenDac(sChinh.hex, 4.5)) + '">' +
        h(ky) + '</text>');
    }

    /* Bóng thoại vẽ SAU CÙNG: nó nằm chồng lên lớp người, nên phải là
       thứ trên cùng. Vẽ trước thì ảnh phủ lên nó. */
    var thoai = docDau(x.noiDung, 'THOẠI');
    if (thoai) {
      var bt2 = bongThoai(thoai,
        khungCao ? le : xNguoi + Math.round(rongNguoi * 0.06),
        khungCao ? Math.round(yNguoi + kg.h * 0.02) : Math.round(kg.h * 0.075),
        Math.round((khungCao ? kg.w - le * 2 : rongNguoi) * 0.80), k, sChinh.hex);
      ve += bt2.ve;
    }

    return {ok: true, svg: khung(kg, k, ve, gom(manh).defs)};
  }

  /* ═══════════ BỘ VẼ · SƠ ĐỒ TOẢ NHÁNH ═══════════

     Chủ hệ gửi một tấm sơ đồ tư duy vẽ tay trên giấy khổ lớn: một
     chữ ở giữa, bốn nhánh toả ra, mỗi nhánh một màu bút và một chùm
     ý con. Trong mười bốn loại hình KHÔNG có cái nào như thế.

     ══ VÌ SAO KHÔNG ÉP VÀO LƯỚI Ô ══

     Lưới ô nói "sáu thứ này ngang hàng nhau". Sơ đồ toả nói một thứ
     KHÁC HẲN: có một cái ở giữa, và mọi thứ còn lại treo vào nó. Ép
     một sơ đồ toả vào lưới ô là bỏ đúng cái nó tồn tại để nói — quan
     hệ giữa tâm và nhánh — rồi giữ lại phần dễ nhất là danh sách chữ.

     ══ TOẢ NỬA TRÁI NỬA PHẢI, KHÔNG TOẢ ĐỀU 360° ══

     Toả đều quanh tâm thì đẹp trên giấy khổ lớn, nơi người vẽ xoay
     được tờ giấy. Trên một tấm hình thì nhánh ở phía trên và phía
     dưới bắt chữ phải nằm ngang trong khi nhánh của nó đi dọc — hoặc
     chữ xoay theo nhánh, mà chữ xoay là chữ đọc chậm. Nên chia hai
     cột: nhánh trái viết phải-sang-trái, nhánh phải viết trái-sang-
     phải, và mọi dòng chữ vẫn nằm ngang.

     Người viết gõ:
       TÂM | Học
       NHÁNH | Tư duy
       · Tầm nhìn
       · Quan điểm
       NHÁNH | Ước mơ
       · Mục tiêu
  */
  function docNhanh(chu) {
    var ra = [], nay = null;
    String(chu || '').split('\n').forEach(function (d) {
      var mN = /^\s*NHÁNH\s*\|\s*(.+)$/i.exec(d);
      if (mN) { nay = {ten: mN[1].trim(), y: []}; ra.push(nay); return; }
      var mY = /^\s*[·•\-]\s*(.+)$/.exec(d);
      if (mY && nay) nay.y.push(mY[1].trim());
    });
    return ra;
  }

  function veSoDoToa(x, kg, che) {
    var k = bang(che);
    var tam = docDau(x.noiDung, 'TÂM');
    var nh = docNhanh(x.noiDung);
    if (!tam || nh.length < 2) return {ok: false,
      error: 'Sơ đồ toả cần một dòng "TÂM: chữ ở giữa" và ÍT NHẤT HAI nhánh, ' +
             'mỗi nhánh mở bằng "NHÁNH | tên nhánh" rồi các dòng ý con bắt đầu ' +
             'bằng dấu ·. Máy KHÔNG tự chọn cái nào làm tâm: chọn sai tâm thì cả ' +
             'sơ đồ nói ngược, mà tấm này tồn tại chỉ để nói quan hệ tâm–nhánh. ' +
             'Đang đọc ra ' + (tam ? 'tâm "' + tam + '"' : 'không có tâm') +
             ' và ' + nh.length + ' nhánh.'};
    if (nh.length > 6) return {ok: false, code: 'NHIEUNHANH',
      error: 'Sơ đồ toả nhận tối đa SÁU nhánh, đang có ' + nh.length + '. Hơn sáu ' +
             'thì mắt thôi đọc ra hình toả và bắt đầu đọc ra một danh sách — mà ' +
             'danh sách thì đã có loại hình riêng, xếp thẳng hàng dễ đọc hơn.'};

    var sac = sacTang();
    var d = dauTam(x, kg, k, 26);
    var but = defBut();
    if (k.but) d.manh.push({defs: but.defs});
    var netRun = k.but ? ' filter="url(#' + but.run + ')"' : '';

    var le = Math.round(kg.w * 0.045);
    var dayVung = kg.h - Math.round(kg.h * 0.072);
    var vungCao = dayVung - d.dinh;
    var giuaX = Math.round(kg.w / 2), giuaY = Math.round(d.dinh + vungCao / 2);

    /* Tâm: một vòng tròn đo THEO CHỮ, không đặt bán kính cố định rồi
       mong chữ vừa — cùng luật với chip đầu cột của hai cột đối chứng. */
    var coTam = Math.round(kg.w * 0.040);
    var dTam = catDong(tam, '800 ' + coTam + 'px ' + CHU_THAN, kg.w * 0.20);
    while (dTam.length > 2 && coTam > 16) {
      coTam -= 2;
      dTam = catDong(tam, '800 ' + coTam + 'px ' + CHU_THAN, kg.w * 0.20);
    }
    var rTam = Math.round(Math.max(kg.w * 0.075,
      doRong(dTam[0] || tam, '800 ' + coTam + 'px ' + CHU_THAN) / 2 + coTam * 0.9));

    /* Chia nhánh hai bên. Số lẻ thì bên phải nhiều hơn một: mắt người
       đọc từ trái sang, nên bên phải là chỗ nó dừng lại lâu hơn. */
    var trai = [], phai = [];
    nh.forEach(function (b, i) { (i % 2 === 0 ? phai : trai).push(b); });

    var rongCot = Math.round(kg.w * 0.30);
    var coTen = Math.round(kg.w * 0.024);
    var coY = Math.round(kg.w * 0.0175);
    var ve = '';

    var thieu = 0;
    var veBen = function (ds2, ben) {
      if (!ds2.length) return;
      /* Đo trước chiều cao từng nhánh, rồi chia đều cả cột — cùng
         cách mọi bố cục khác trong tệp này: đo trước, đặt sau. */
      var cao = ds2.map(function (b) {
        var c = coTen * 1.5;
        b.y.forEach(function (t) {
          c += catDong(t, '500 ' + coY + 'px ' + CHU_THAN, rongCot - coY * 1.6)
            .length * coY * 1.3 + coY * 0.34;
        });
        return c;
      });
      var tong = cao.reduce(function (a, b2) { return a + b2; }, 0);
      var toiThieu = tong + coY * 1.2 * Math.max(0, ds2.length - 1);
      /* Không vừa thì DỪNG, không bóp. Bóp khe xuống dưới mức đọc được
         là dồn hai nhánh dính vào nhau, mà hai nhánh dính nhau thì mắt
         đọc thành một nhánh dài — đúng thứ sơ đồ toả sinh ra để tách. */
      if (toiThieu > vungCao) { thieu = Math.round(toiThieu - vungCao); return; }
      var khe = ds2.length > 1
        ? Math.max(coY * 1.2, (vungCao - tong) / (ds2.length - 1)) : 0;
      var yy = Math.round(giuaY - (tong + khe * (ds2.length - 1)) / 2);

      ds2.forEach(function (b, i) {
        var s = sac[nh.indexOf(b) % sac.length];
        var mau = nenDac(s.hex, k.sau ? 3.0 : 4.6);
        var xNeo = ben < 0 ? le + rongCot : kg.w - le - rongCot;
        var xChu = ben < 0 ? le + rongCot : kg.w - le - rongCot;
        var can = ben < 0 ? 'end' : 'start';
        var yTen = Math.round(yy + coTen);

        /* Nhánh: một đường cong từ mép vòng tâm tới đầu nhánh. Cong
           chứ không gãy góc — mắt đi theo đường cong mà không phải
           dừng ở mỗi khúc quẹo. */
        var xTam = giuaX + ben * rTam;
        /* Đầu nhánh dừng ở PHÍA NGOÀI cột chữ, không phía trong.
           Bản đầu tôi đặt `+ ben * gap` — với cột trái (ben = −1) nó
           lùi sang trái, tức là chui vào giữa chữ, và đường cong cắt
           ngang tên nhánh. Dấu ngược lại mới đúng: cột trái thì đầu
           nhánh nằm bên phải chữ, cột phải thì nằm bên trái. */
        var xDau = xNeo - ben * Math.round(kg.w * 0.014);
        ve += '<path' + netRun + ' d="M' + xTam + ' ' + giuaY +
          ' C' + Math.round(xTam + ben * kg.w * 0.06) + ' ' + giuaY +
          ', ' + Math.round(xDau - ben * kg.w * 0.05) + ' ' + yTen +
          ', ' + xDau + ' ' + yTen + '" fill="none" stroke="' + h(mau) +
          '" stroke-width="' + (k.but ? 3 : 2.6) + '" stroke-linecap="round"/>';

        ve += veChu(b.ten, xChu, yTen, {co: coTen, chu: CHU_THAN, dam: 800,
          mau: mau, rong: rongCot, gian: 1.18, can: can}).svg;
        /* Gạch chân nhánh — cùng vai trò với vạch đỏ dưới tiêu đề:
           nói "hết tên nhánh, dưới đây là ý con". */
        var rGach = Math.min(rongCot,
          doRong(b.ten, '800 ' + coTen + 'px ' + CHU_THAN));
        ve += '<line' + netRun + ' x1="' + (ben < 0 ? xChu - rGach : xChu) +
          '" y1="' + Math.round(yTen + coTen * 0.36) + '" x2="' +
          (ben < 0 ? xChu : xChu + rGach) + '" y2="' +
          Math.round(yTen + coTen * 0.36) + '" stroke="' + h(mau) +
          '" stroke-width="2" stroke-opacity="0.55"/>';

        var yc = yTen + coTen * 0.95;
        b.y.forEach(function (t) {
          var dong = catDong(t, '500 ' + coY + 'px ' + CHU_THAN, rongCot - coY * 1.6);
          var xCham = ben < 0 ? xChu - rongCot + coY * 0.1 : xChu + rongCot - coY * 0.1;
          dong.forEach(function (t2, j) {
            ve += '<text x="' + xChu + '" y="' + Math.round(yc + coY + j * coY * 1.3) +
              '" text-anchor="' + can + '" font-family="' + h(CHU_THAN) +
              '" font-size="' + coY + '" font-weight="500" fill="' + h(k.muc2) +
              '">' + h(t2) + '</text>';
          });
          /* Một chấm nhỏ đầu dòng, phía ngoài cột chữ. */
          ve += '<circle' + netRun + ' cx="' +
            Math.round(ben < 0 ? xChu + coY * 0.55 : xChu - coY * 0.55) +
            '" cy="' + Math.round(yc + coY * 0.62) + '" r="' +
            (coY * 0.17).toFixed(1) + '" fill="' + h(mau) + '"/>';
          yc += dong.length * coY * 1.3 + coY * 0.34;
        });
        yy += cao[i] + khe;
      });
    };
    veBen(trai, -1);
    veBen(phai, 1);
    if (thieu) return {ok: false, code: 'TOAQUADAY',
      error: 'Một bên của sơ đồ dài hơn khổ tấm ' + thieu + ' điểm ảnh. Bớt một ' +
             'ý con, bớt một nhánh, hoặc dựng ở khổ cao hơn. Máy KHÔNG bóp khe ' +
             'giữa hai nhánh cho vừa: hai nhánh dính vào nhau thì mắt đọc thành ' +
             'một nhánh dài, mà tấm này tồn tại chỉ để tách chúng ra.'};

    /* Vòng tâm vẽ SAU CÙNG: mọi nhánh xuất phát từ mép nó, nên nó
       phải nằm trên để chỗ nối gọn. */
    var sTam = sac[0] || {hex: k.gita};
    var mauTam = nenDac(sTam.hex, k.sau ? 3.0 : 4.6);
    if (k.but) {
      ve += '<circle' + netRun + ' cx="' + giuaX + '" cy="' + giuaY + '" r="' + rTam +
        '" fill="' + h(k.nen) + '" stroke="' + h(mauTam) + '" stroke-width="4"/>';
    } else {
      var gT = idMoi('tam');
      d.manh.push({defs: '<radialGradient id="' + gT + '" cx="42%" cy="36%" r="72%">' +
        '<stop offset="0%" stop-color="' + h(doiSang(sTam.hex, 0.18)) + '"/>' +
        '<stop offset="100%" stop-color="' + h(doiSang(sTam.hex, -0.10)) + '"/>' +
        '</radialGradient>'});
      ve += '<g filter="url(#' + d.bongHh.id + ')"><circle class="gita-tam" cx="' +
        giuaX + '" cy="' + giuaY + '" r="' + rTam + '" fill="url(#' + gT + ')"/></g>';
    }
    ve += veChu(tam, giuaX,
      Math.round(giuaY - (dTam.length - 1) * coTam * 0.58 + coTam * 0.34),
      {co: coTam, chu: CHU_THAN, dam: 800,
       mau: k.but ? mauTam : mucTren(sTam.hex),
       rong: rTam * 1.8, gian: 1.16, can: 'middle'}).svg;

    return {ok: true, svg: khung(kg, k, d.tren + ve + d.duoi, gom(d.manh).defs)};
  }

  /* ═══════════ BỘ VẼ · CHÂN DUNG MỘT VAI ═══════════
     Nửa người ở trên, tên vai và một câu ở dưới. Khuôn hẹp, một việc. */
  function veChanDung(x, kg, che) {
    var k = bang(che);
    var chu = boDau(x.noiDung);
    var ten = cauDau(chu);
    if (!ten) return {ok: false,
      error: 'Chân dung cần TÊN VAI ở dòng đầu nội dung.'};
    var cau2 = cauHai(chu);
    var sac = sacTang();
    if (!sac.length) return {ok: false, error: 'Chưa mở được bảng màu thương hiệu.'};
    var maAnh = docDau(x.noiDung, 'ẢNH');
    if (maAnh && maAnh !== 'kho' && !ANH_NGUOI[maAnh]) return {ok: false,
      error: 'Không có ảnh "' + maAnh + '" trong kho ảnh. Đang có: ' +
             Object.keys(ANH_NGUOI).join(', ') + ' · hoặc "kho".'};

    var le = Math.round(kg.w * 0.075);
    var nen = lopNen(kg, k, 0.8);
    var cs = defChuSac(k);
    var manh = [nen, cs];
    var s = sac[0];

    var nhan = docDau(x.noiDung, 'NHÃN');
    var rongA = kg.w - le * 2;
    var caoA = Math.round(kg.h * 0.46);
    var yA = Math.round(kg.h * 0.135);
    var ln = lopNguoi(maAnh, le, yA, rongA, caoA, k, s.hex, x);
    manh.push(ln);

    var coTen = Math.round(kg.w / 13);
    while (coTen > 20 && doRong(ten, '800 ' + coTen + 'px ' + CHU_THAN) > rongA)
      coTen -= 1;
    var yT = yA + caoA + Math.round(kg.h * 0.055);
    var ve = ln.ve;
    if (nhan) ve += nhanTren(nhan, le, Math.round(kg.h * 0.088), k,
      Math.round(coTen * 0.34));
    ve += '<text x="' + Math.round(kg.w / 2) + '" y="' + yT +
      '" text-anchor="middle" font-family="' + h(CHU_THAN) + '" font-size="' + coTen +
      '" font-weight="800" fill="url(#' + cs.id + ')">' + h(ten) + '</text>';
    ve += '<rect x="' + Math.round(kg.w / 2 - rongA * 0.10) + '" y="' +
      Math.round(yT + coTen * 0.40) + '" width="' + Math.round(rongA * 0.20) +
      '" height="4" rx="2" fill="' + h(k.do) + '"/>';
    if (cau2) {
      var coC = Math.round(coTen * 0.40);
      ve += veChu(cau2, Math.round(kg.w / 2), Math.round(yT + coTen * 1.25),
        {co: coC, chu: CHU_THAN, dam: 500, mau: k.muc2, rong: rongA, gian: 1.42,
         can: 'middle'}).svg;
    }
    /* Dấu ở GÓC TRÁI, không ở giữa. Luật của chính hàm dauGita là "cùng
       một chỗ trên mọi tấm", và mọi tấm khác đặt nó ở lề trái. Đặt vào
       giữa thì nó cũng KHÔNG cân: vòng tròn ở tâm nhưng chữ "GITA 365"
       chạy sang phải từ +26, nên cả cụm lệch hẳn về một bên. +16 là bán
       kính vòng cộng nét, để mép trái vòng trùng lề. */
    ve += dauGita(k, le + Math.round(16 * tiDau(kg)), kg.h - Math.round(kg.h * 0.052), kg);
    return {ok: true, svg: khung(kg, k, ve, gom(manh).defs)};
  }

  /* ═══════════ BẢNG PHÂN VIỆC ═══════════
     Loại hình nào KHÔNG có tên ở đây thì bộ vẽ nói thẳng là chưa có.
     Danh sách trắng, không danh sách cấm — cùng luật với mọi cửa khác
     trong kho này: loại hình mới thêm vào ngày mai cũng không tự lọt
     qua đây và nhận một bố cục đại khái. */
  var BO_VE = {
    BIA:              {ve: veBia,    kho: 'rong'},
    MOT_SO:           {ve: veMotSo,  kho: 'rong'},
    BANDO_HANHTRINH:  {ve: veBanDo,  kho: 'rong'},
    /* Lưới ô mặc định khổ VUÔNG: sáu ô xếp 3×2 trên khổ ngang thì mỗi
       ô lùn quá cho hai dòng mô tả. Khổ vuông cho ô thở. */
    KHUNG:            {ve: veKhung,  kho: 'vuong'},
    /* Hai cấu trúc DÀY: khổ dọc, vì cả hai xếp chồng theo chiều dọc và
       mỗi hàng phải đủ cao cho một cụm chữ, không phải một dòng. */
    SO_SANH_TANG:     {ve: veSoSanhTang, kho: 'doc'},
    QUY_TRINH:        {ve: veQuyTrinh,   kho: 'doc'},
    TRUOC_SAU:        {ve: veTruocSau,   kho: 'vuong'},
    VAI_TRO:          {ve: veVaiTro,     kho: 'vuong'},
    DANH_SACH_VIEC:   {ve: veDanhSachViec, kho: 'doc'},
    CONG:             {ve: veCong,       kho: 'vuong'},
    NHIP:             {ve: veNhip,       kho: 'vuong'},
    BANG_DIEU_KHIEN:  {ve: veBangDieuKhien, kho: 'rong'},
    /* Hai khuôn có người. Áp phích khổ VUÔNG như tấm mẫu; chân dung khổ
       DỌC vì một người đứng cần chiều cao, không cần chiều ngang. */
    AP_PHICH:         {ve: veApPhich,  kho: 'vuong'},
    CHAN_DUNG:        {ve: veChanDung, kho: 'doc'},
    /* Sơ đồ toả: khổ VUÔNG. Nó cần chiều ngang cho hai cột nhánh,
       nhưng khổ chia sẻ 1200×630 quá thấp — bốn nhánh mỗi nhánh bốn ý
       là tràn xuống chạm dấu GITA. Vuông cho cả hai chiều đủ dùng. */
    SO_DO_TOA:        {ve: veSoDoToa,  kho: 'vuong'}
  };

  /* Loại hình nào là ÁP PHÍCH — dùng để chọn nền mặc định. Khai một
     chỗ, đọc một chỗ: hai bản của cùng một sự thật thì bản nào cũng
     có ngày lệch. */
  var CAN_NGUOI_VE = ['AP_PHICH', 'CHAN_DUNG'];

  /* ── ĐỐI CHIẾU TỪNG Ý VỚI CHỮ ĐÃ ĐẶT LÊN TẤM ──
     Không so nguyên câu: người viết gõ "Phiếu ghi bảy ngày và hướng
     dẫn ghi" mà tấm đặt "Phiếu ghi bảy ngày — kèm hướng dẫn", hai
     chuỗi khác nhau nhưng cùng một ý. So nguyên câu thì phép đo đỏ
     ở mọi tấm đúng, và một phép đo đỏ ở mọi chỗ thì người ta tắt nó.

     So theo TỪ CÓ NGHĨA: mỗi ý lấy các từ từ bốn ký tự trở lên, và
     đòi quá nửa số từ ấy có mặt trong chữ của tấm. Ngưỡng quá nửa
     chứ không phải tất cả — một ý luôn bị rút gọn khi lên hình, đó
     là việc của thiết kế, không phải lỗi. */
  function soatYTrenTam(x, svg) {
    var ds = [];
    try { ds = JSON.parse(x.yBatBuoc || '[]'); } catch (e) { ds = []; }
    if (!ds.length) return {tong: 0, thieu: []};
    /* Chữ đã đặt = mọi nội dung trong thẻ <text>. Đọc thẳng chuỗi SVG
       chứ không dựng DOM: bộ vẽ chạy được cả ở chỗ không có trình
       duyệt, và phép soát không được đòi thêm điều kiện nào. */
    var chu = (svg.match(/<text[^>]*>([\s\S]*?)<\/text>/g) || [])
      .map(function (t) { return t.replace(/<[^>]+>/g, ' '); }).join(' ');
    chu = ' ' + boDauChu(chu).replace(/[^a-z0-9]+/g, ' ') + ' ';
    var thieu = [];
    ds.forEach(function (y) {
      var tu = boDauChu(y).replace(/[^a-z0-9]+/g, ' ').split(' ')
        .filter(function (w) { return w.length >= 4; });
      if (!tu.length) return;
      var co = tu.filter(function (w) { return chu.indexOf(' ' + w + ' ') >= 0; });
      if (co.length * 2 <= tu.length)
        thieu.push({y: String(y).slice(0, 90), co: co.length, tong: tu.length});
    });
    return {tong: ds.length, thieu: thieu};
  }

  /* ═══════════ CHỮ THAY ẢNH ═══════════

     Một tấm hình của Học viện tới nay ra khỏi máy mà KHÔNG mang theo
     một dòng nào nói nó vẽ gì. Ba hậu quả, và cả ba đều thật:

       · Người đọc bằng máy đọc màn hình nghe được đúng một chữ: "ảnh".
         Cả tấm — sáu ô việc, một câu đóng đinh — biến mất với họ.
       · Thang chấm có mục D7 "SEO" nặng 5 điểm, mà trong cả kho KHÔNG
         có một dòng mã nào sinh ra chữ mô tả. Chấm một thứ không tồn
         tại thì năm điểm ấy là năm điểm cho không.
       · Sáu tháng sau muốn tìm lại "tấm nói về cổng ngày bảy" thì
         không tìm được: sổ giữ nội dung ĐỀ BÀI, không giữ thứ đã đặt
         lên tấm, mà hai thứ ấy khác nhau (bộ vẽ rút gọn, xuống dòng,
         đổi hoa thường).

     ── VÌ SAO MÁY DỰNG ĐƯỢC CÂU NÀY MÀ KHÔNG PHẢI ĐOÁN ──

     Bản đề xuất kiến trúc ngoài sinh chữ mô tả bằng một mô hình thị
     giác: nhìn tấm ảnh rồi tả lại. Ở đây không cần, và không được —
     chính máy này đặt từng chữ (luật C14), nên nó BIẾT trên tấm có
     chữ gì. Câu mô tả ghép từ chữ ĐÃ ĐẶT, không thêm một từ nào của
     riêng nó. Đó là khác biệt giữa một bản mô tả và một lời đoán, và
     luật C10 cấm đúng cái thứ hai. */
  var CAT_MOTA = 300;   /* dài hơn thế thì máy đọc màn hình đọc mãi */

  function moTaTam(x, svg, kg, che) {
    var ten = (function () {
      for (var i = 0; i < (G.TG_LOAIHINH || []).length; i++)
        if (G.TG_LOAIHINH[i].ma === x.loaiHinh) return G.TG_LOAIHINH[i].ten;
      return x.loaiHinh;
    })();
    /* Chữ theo ĐÚNG thứ tự đã đặt lên tấm — đó cũng là thứ tự mắt
       đọc, nên câu mô tả đi cùng đường với người xem. */
    /* Bỏ DẤU THƯƠNG HIỆU khỏi phần ruột: hai dòng ấy đứng y hệt trên
       MỌI tấm, nên chúng không phân biệt tấm này với tấm nào cả — mà
       chỗ trống trong câu mô tả thì có hạn. Nói tên thương hiệu MỘT
       lần ở nhãn ngắn, chỗ máy đọc màn hình đọc trước tiên, rồi dành
       trọn phần còn lại cho nội dung của chính tấm này. */
    var dong = (svg.match(/<text[^>]*>([\s\S]*?)<\/text>/g) || [])
      .filter(function (t) {
        return t.indexOf('gita-dau') < 0 && t.indexOf('gita-giangiao') < 0; })
      .map(function (t) { return t.replace(/<[^>]+>/g, '').trim(); })
      .filter(function (s) { return s.length > 1; });
    /* Bỏ trùng liền kề: một câu ngắt hai dòng ra hai thẻ <text>, mà
       đọc lên thì là một câu.
       VÀ bỏ dòng trùng chính NHIỆM VỤ: nhiều bố cục đặt nhiệm vụ làm
       tiêu đề, nên câu ấy vào bản mô tả hai lần — một lần ở phần đầu,
       một lần trong ruột. Đọc bằng mắt thì thừa; nghe bằng máy đọc
       màn hình thì là cùng một câu đọc liền hai lượt, và người nghe
       tưởng máy kẹt. */
    var nv = boDauChu(String(x.nhiemVu || '')).replace(/[^a-z0-9]+/g, ' ').trim();
    var gom = [];
    dong.forEach(function (d) {
      if (gom.length && gom[gom.length - 1] === d) return;
      if (nv && boDauChu(d).replace(/[^a-z0-9]+/g, ' ').trim() === nv) return;
      gom.push(d);
    });
    var ruot = gom.join(' · ');

    var dau = ten + ', chặng ' + (x.tang || '?') + '. ' +
      String(x.nhiemVu || '').trim();
    if (dau && !/[.!?]$/.test(dau)) dau += '.';
    var cau = dau + ' Trên tấm: ' + ruot + '.';
    if (cau.length > CAT_MOTA) cau = cau.slice(0, CAT_MOTA - 1).replace(/\s+\S*$/, '') + '…';
    return {
      /* `ten` là nhãn ngắn — cái máy đọc màn hình đọc trước tiên. */
      ten: ('GITA 365 · ' + ten + ' — ' + String(x.nhiemVu || '').trim()).slice(0, 120),
      alt: cau,
      soChu: gom.length
    };
  }

  /* ═══════════ CỬA DUY NHẤT ═══════════ */
  G.veThiGiac = function (x, khoMuon, cheMuon) {
    if (!x || !x.id) return {ok: false,
      error: 'Bộ vẽ chỉ vẽ từ một bản ghi đề xuất. Không có hàm nào nhận chữ ' +
             'trần rồi vẽ — vẽ được chữ trần thì cổng Tầng thành đồ trang trí.'};

    /* ── KHÔNG QUA CỔNG TẦNG THÌ KHÔNG VẼ ──
       Mọi bản ghi trong sổ đều đã qua cổng lúc đề xuất, nên chỗ này
       gần như không bao giờ đỏ. Giữ lại vì "gần như" không phải là
       "không bao giờ": ngày nào đó có đường ghi thẳng vào sổ thì đây
       là chỗ chặn, và nó đã đứng sẵn. */
    if (!x.soatTang) return {ok: false,
      error: 'Bản ghi này chưa có dấu qua cổng Tầng. Chưa qua cổng thì chưa vẽ.'};

    /* ── CHƯA CÓ PHÔNG CHỮ THÌ CHƯA VẼ ──
       Cả bố cục của tệp này đứng trên doRong(), mà doRong() hỏi canvas,
       và canvas trả lời bằng PHÔNG NÀO ĐANG CÓ. Phông thương hiệu chưa
       tải xong thì nó đo bằng phông dự phòng của hệ điều hành — hẹp
       hơn — nên máy tin là câu vừa một dòng rồi vẽ ra bằng phông thật,
       và câu ấy dài hơn thứ đã đo.
       Đo được ra: dòng phụ của áp phích rộng 592 điểm ảnh trong khi
       phép ngắt dòng tin nó rộng 570. Hai mươi hai điểm ảnh nằm ngoài
       lề, và KHÔNG phép đo nào trong bộ kiểm bắt được — vì bộ kiểm
       chờ phông xong rồi mới vẽ, còn giao diện thật thì không.
       Sai ở đây không lệch một chút: nó lệch KHÁC NHAU mỗi lần chạy,
       tuỳ phông tải kịp hay không. Nên máy TỪ CHỐI thay vì vẽ ra một
       tấm không lặp lại được. */
    if (typeof document !== 'undefined' && document.fonts &&
        typeof document.fonts.check === 'function') {
      var thieu = ['700 20px "Be Vietnam Pro"', '600 20px "Playfair Display"']
        .filter(function (f) {
          try { return !document.fonts.check(f); } catch (e) { return false; } });
      if (thieu.length) return {ok: false, code: 'CHUACOCHU',
        error: 'Phông chữ thương hiệu chưa tải xong, nên chưa vẽ được. Mọi phép ' +
               'ngắt dòng của bộ vẽ đo bằng phông đang có; đo bằng phông dự phòng ' +
               'rồi vẽ bằng phông thật thì chữ dài hơn thứ đã đo và tràn ra ngoài ' +
               'lề — mà lệch bao nhiêu thì tuỳ lần chạy, nên tấm ấy không dựng lại ' +
               'được. Chờ document.fonts.ready rồi gọi lại. Đang thiếu: ' +
               thieu.join(' · ')};
    }

    var b = BO_VE[x.loaiHinh];
    if (!b) return {ok: false, chuaCo: true,
      error: 'Chưa có bộ vẽ cho loại hình "' + x.loaiHinh + '". Máy KHÔNG vẽ ' +
             'đại một khung chung rồi nhét chữ vào — một tấm vẽ đại là một ' +
             'suy diễn có màu, và luật C10 cấm đúng thứ đó. Đã vẽ được: ' +
             Object.keys(BO_VE).join(', ') + '.'};

    /* Thẻ ngày là khuôn DỌC — ảnh người đứng cần chiều cao, và cột
       chữ bên trái cần chỗ cho năm khối. Tấm bìa một câu vẫn ngang.
       Cùng một loại hình, hai khổ, chọn theo nội dung. */
    var khoMac = b.kho;
    if (x.loaiHinh === 'BIA' && docDau(x.noiDung, 'ẢNH')) khoMac = 'doc';
    var kg = KHO_GIAY[khoMuon || khoMac] || KHO_GIAY[khoMac];
    /* Mặc định NỀN SÂU, theo đúng câu chốt trong G.BRAND.mau: "Đêm sâu
       — nền của mọi màn hình, để ánh sáng của hành trình nổi lên."
       Nền sáng vẫn gọi được, cho hình nhúng thẳng vào giao diện ban
       ngày; nhưng mặc định phải là thứ thương hiệu đã chốt, không
       phải thứ tiện tay lấy được từ biến CSS đang chạy. */
    /* ── MẶC ĐỊNH ĐỌC TỪ MÔI TRƯỜNG, KHÔNG PHẢI MỘT HẰNG SỐ ──
       Tới 9.99.28 mặc định là GIẤY cho MỌI loại hình, theo dòng "Bản đồ
       A3 in" của BRAND.dungO. Đó là chỗ chặn đắt nhất của cả bộ vẽ, và
       nó không phải lỗi của bộ vẽ: bảng dungO có bốn môi trường và
       KHÔNG môi trường nào là áp phích đăng mạng, nên áp phích rơi vào
       dòng viết cho một tấm chạy qua máy in văn phòng — trắng, phẳng,
       không quầng sáng.
       Bản 9.99.29 thêm dòng "Áp phích đăng mạng" vào chính bảng ấy, và
       chỗ này đọc theo nó: loại hình CÓ NGƯỜI là áp phích, nên mặc định
       NỀN SÂU. Mấy loại hình còn lại vẫn là ấn phẩm in, vẫn nền giấy. */
    /* ── NỀN MẶC ĐỊNH CỦA ÁP PHÍCH: SÁNG, KHÔNG PHẢI ĐÊM SÂU ──
       Ở 9.99.29 tôi chốt mặc định `sau` cho loại hình có người, và
       chốt bằng cách đọc dòng "Áp phích đăng mạng" trong BRAND.dungO
       — mà dòng ấy CŨNG do tôi viết ở chính bản đó. Hai bước, một
       nguồn: tôi viết ra một câu rồi lấy chính câu ấy làm căn cứ.
       Chủ hệ xem tấm dựng ra và nói thẳng: ghét nền tối đen xì. Đó
       là người quyết định thật, và quyết định ấy thắng.
       Vẫn gọi được `sau` khi muốn — chỉ là nó thôi làm mặc định.

       CHỈ ĐỔI ĐÚNG CHỖ ĐANG TỐI. Bản sửa đầu tôi đặt thẳng
       `cheMac = 'sang'` cho MỌI loại hình — rộng tay hơn thứ chủ hệ
       nói, và bộ kiểm bắt ngay: bản đồ hành trình vốn nền giấy, sang
       nền `sang` thì chữ "T1" tụt còn 4,06:1, dưới ngưỡng 4,5. Chủ
       hệ chê nền TỐI, không chê nền giấy. */
    var cheMac = CAN_NGUOI_VE.indexOf(x.loaiHinh) >= 0 ? 'sang' : 'giay';
    /* ── KHỔ IN THÌ NỀN MẶC ĐỊNH LÀ GIẤY, KHÔNG PHẢI ĐÊM SÂU ──
       Nền sâu là nền của MÀN HÌNH — ở đó nó không tốn gì. Trên giấy
       thì một tấm A4 phủ kín mực tối là gần một mililít mực cho mỗi
       bản, giấy cong lên vì ướt, và màu ra đục chứ không sâu. */
    if (kg.in) cheMac = 'giay';
    var che = ['sau', 'sang', 'but', 'giay'].indexOf(cheMuon) >= 0 ? cheMuon : cheMac;
    if (kg.in && che === 'sau') return {ok: false, code: 'NENTOIDEIN',
      error: 'Khổ in không nhận nền ĐÊM SÂU. Một tấm ' + kg.mmR + '×' + kg.mmC +
             'mm phủ kín mực tối tốn gần một mililít mực mỗi bản, làm giấy cong ' +
             'vì ướt, và ra đục chứ không ra sâu — nền sâu đẹp vì màn hình TỰ ' +
             'phát sáng, còn giấy thì chỉ hắt lại. Dùng nền "giay" hoặc "sang". ' +
             'Máy KHÔNG tự đổi hộ: đổi nền là đổi cả tương phản của mọi chữ trên ' +
             'tấm, và đó là quyết định của người dựng chứ không phải của máy.'};
    var r;
    try { r = b.ve(x, kg, che); }
    catch (e) { return {ok: false, error: 'Bộ vẽ hỏng giữa chừng: ' + e.message}; }
    if (!r.ok) return r;

    /* ── DÒNG TRUY NGUỒN, CHÈN Ở ĐÚNG MỘT CHỖ ──
       Mười sáu bộ vẽ đều đi qua đây. Chèn ở từng bộ vẽ là mười sáu chỗ
       phải nhớ, và bộ vẽ thứ mười bảy viết sau sẽ quên — quên mà không
       báo gì, vì tấm vẫn vẽ ra bình thường. Một tấm không mang dòng truy
       nguồn thì lúc cần lần về sổ mới biết là thiếu, và lúc ấy đã muộn.

       Chèn vào TRƯỚC </svg> chứ không dựng lại khung: dựng lại khung thì
       phải hiểu ruột của cả mười sáu bộ vẽ. */
    if (r.svg && r.svg.lastIndexOf('</svg>') >= 0) {
      var kTruy = bang(che);
      r.svg = r.svg.slice(0, r.svg.lastIndexOf('</svg>')) +
        dongTruyNguon(x, kg, kTruy) + '</svg>';
    }

    /* ══ SOÁT Ý — TẤM VẼ RA CÓ NÓI ĐỦ THỨ NỘI DUNG NÓI KHÔNG ══

       Bản đề xuất kiến trúc mới gọi bước này là "Visual QA", và ở đó
       nó phải dùng THỊ GIÁC: một mô hình nhìn tấm ảnh, đọc lại chữ,
       đoán xem có đủ ý chưa. Phải làm thế vì bên ấy để BỘ TẠO ẢNH viết
       chữ — nên chính hệ cũng không biết trên tấm có chữ gì.

       Ở đây thì biết chính xác, vì CHÍNH MÁY NÀY đặt từng chữ (luật
       C14). Nên phép soát là một phép ĐO đúng nghĩa: lấy chữ đã đặt,
       đối chiếu với danh sách ý bắt buộc đã chốt lúc đề xuất. Không
       nhìn, không đoán, không tốn một lượt sinh ảnh nào.

       Đây là chỗ luật "máy viết chữ" trả lãi: nó không chỉ giữ dấu
       tiếng Việt, nó còn làm cho việc kiểm nội dung trở thành đo được. */
    /* ── CHỮ TRÊN GIẤY ĐO BẰNG MILIMÉT ──
       Cả bố cục của tệp này tính theo kg.w, nên đổi sang khổ to hơn
       thì mọi cỡ chữ to lên theo. Nghe thì có vẻ chỗ này không bao
       giờ đỏ — nhưng A5 hẹp hơn khổ vuông 1080, nên cùng một bố cục
       ở A5 cho chữ NHỎ HƠN cả bản màn hình. Đo thật:
         A4 (2480 rộng) · chú thích 12px-ở-1080 → 2,33mm  → đọc được
         A5 (1748 rộng) · cùng chú thích ấy     → 1,64mm  → không
       Máy không rút bớt nội dung cho vừa và cũng không phóng chữ lên
       cho lọt ngưỡng: cả hai đều là sửa tấm mà không ai được báo. */
    if (kg.in) {
      var coNho = coChuNhoNhat(r.svg);
      if (coNho !== null) {
        var mm = coNho * MM_MOI_TAC / kg.dpi;
        /* Chừa 5 phần nghìn milimét: `tiDau` nới dấu GITA lên ĐÚNG
           ngưỡng, nên phép nhân chia quay lại ra 2,0999999… và một
           tấm đúng bị từ chối vì một sai số của số thực. Năm phần
           nghìn milimét không phải một quyết định về thẩm mỹ — nó
           nhỏ hơn mọi thứ mắt hay máy in phân biệt được. */
        if (mm < CHU_NHO_NHAT_MM - 0.005) return {ok: false, code: 'CHUNHOQUADEIN',
          error: 'Chữ nhỏ nhất trên tấm ra ' + mm.toFixed(2) + 'mm khi in ở khổ ' +
                 kg.mmR + '×' + kg.mmC + 'mm — dưới ngưỡng ' + CHU_NHO_NHAT_MM +
                 'mm thì cầm trên tay không đọc ra. Không phải "chữ nhỏ", là chữ ' +
                 'không ai đọc, mà một tấm có phần không ai đọc thì phần ấy đáng ' +
                 'lẽ không nên có. Bớt nội dung, hoặc in khổ lớn hơn.'};
      }
    }

    var soat = soatYTrenTam(x, r.svg);

    /* ── GẮN CHỮ THAY ẢNH VÀO CHÍNH TẤM (luật C21) ──
       `<title>` là cái máy đọc màn hình đọc thay cho tấm; `<desc>` là
       bản dài hơn cho ai muốn nghe hết. Gắn ngay trong SVG chứ không
       để chỗ gọi tự thêm: tấm đi đâu thì chữ đi theo đó, kể cả khi ai
       đó dán chuỗi SVG này sang một trang khác. Một câu mô tả nằm
       riêng ở chỗ gọi là câu sẽ rơi mất ở lượt sao chép đầu tiên. */
    var mt = moTaTam(x, r.svg, kg, che);
    var svg = r.svg.replace('<defs>',
      '<title>' + h(mt.ten) + '</title><desc>' + h(mt.alt) + '</desc><defs>');

    return {ok: true, svg: svg, kho: kg.ten, nen: che, w: kg.w, h: kg.h,
      moTa: mt.alt, moTaTen: mt.ten,
      thieuY: soat.thieu, soY: soat.tong, duY: soat.thieu.length === 0,
      vi: 'Vẽ trong máy này. Không một chữ nào rời khỏi trình duyệt — ' +
          'không có lượt hỏi mạng nào trong cả lượt vẽ.'};
  };

  /* ═══════════ VẼ CẢ MỘT BỘ, KHOÁ KIỂU MỘT LẦN ═══════════

     Luật `boAnh` của hiến pháp (9.99.30). Tới bản trước, mỗi tấm tự
     chọn nền và khổ theo loại hình của RIÊNG nó: áp phích ra nền sâu
     khổ vuông, cổng ra nền giấy khổ vuông, chân dung ra khổ dọc. Từng
     tấm đều đúng luật. Mười lăm tấm xếp cạnh nhau thì ra mười lăm tấm
     rời — người xem đọc ra là góp nhặt.

     Cửa này chốt kiểu ĐÚNG MỘT LẦN rồi mọi tấm thừa hưởng. Và nó TRẢ
     RA cái khoá ấy, để chỗ gọi biết mình vừa khoá theo gì — một cái
     khoá không nói ra được thì lần sau không ai dựng lại đúng bộ ấy.

     Khoá lấy từ TẤM ĐẦU nếu không ai chỉ định: tấm đầu của một bộ gần
     như luôn là bìa, và bìa là chỗ người ta đã cân nhắc kỹ nhất.

     KHÔNG ép loại hình: hai tấm cùng bộ vẫn được khác loại hình, vì
     mỗi tấm có một nhiệm vụ riêng. Thứ bị khoá là NỀN, KHỔ — mấy thứ
     mắt đọc ra ngay là "cùng một bộ" — không phải nội dung. */
  G.veThiGiacBo = function (ds, khoaMuon) {
    if (!Array.isArray(ds) || !ds.length) return {ok: false,
      error: 'Bộ ảnh cần ít nhất một bản ghi.'};

    var khoa = {
      che: (khoaMuon && khoaMuon.che) || null,
      kho: (khoaMuon && khoaMuon.kho) || null
    };
    /* Chưa chỉ định thì đọc từ TẤM ĐẦU — vẽ thử một lượt để hỏi chính
       bộ vẽ nó sẽ chọn gì, chứ không chép lại bảng chọn ở đây. Chép
       lại là dựng bản thứ hai của một sự thật. */
    if (!khoa.che || !khoa.kho) {
      /* Dò ở ĐÚNG KHỔ đã chỉ định, không dò ở khổ mặc định rồi áp
         sang. Bản trước dò trần, nên gọi bộ ở khổ A4 vẫn lấy nền của
         khổ màn hình — và tờ giấy ra nền `sang` thay vì nền giấy,
         trong khi chính bộ vẽ có luật riêng cho khổ in. Lỗi này chỉ
         hiện khi khổ đổi luật nền, tức là từ 9.99.33 mới có chỗ để
         hiện. */
      var thu = G.veThiGiac(ds[0], khoa.kho || undefined, khoa.che || undefined);
      if (!thu.ok) return {ok: false, code: 'TAMDAUHONG',
        error: 'Không vẽ được tấm đầu, nên chưa chốt được kiểu cho cả bộ: ' +
               thu.error};
      khoa.che = khoa.che || thu.nen;
      khoa.kho = khoa.kho || (function () {
        var k = Object.keys(KHO_GIAY);
        for (var i = 0; i < k.length; i++)
          if (KHO_GIAY[k[i]].ten === thu.kho) return k[i];
        return 'vuong';
      })();
    }

    var ra = [], hong = [], thieuY = [];
    ds.forEach(function (x, i) {
      var r = G.veThiGiac(x, khoa.kho, khoa.che);
      if (!r.ok) { hong.push({so: i + 1, id: x.id, error: r.error}); return; }
      if (!r.duY) thieuY.push({so: i + 1, id: x.id, thieu: r.thieuY});
      ra.push({so: i + 1, id: x.id, loaiHinh: x.loaiHinh, svg: r.svg,
               w: r.w, h: r.h});
    });

    return {ok: true, khoa: khoa, so: ra.length, tam: ra,
      hong: hong, thieuY: thieuY,
      vi: 'Cả bộ khoá cùng một nền và một khổ. Loại hình vẫn khác nhau được — ' +
          'mỗi tấm có một nhiệm vụ riêng, và ép chung loại hình là ép mười lăm ' +
          'việc khác nhau vào một khuôn. Thứ bị khoá là mấy thứ mắt đọc ra ngay ' +
          'là "cùng một bộ".'};
  };

  /* Danh sách khổ và loại hình vẽ được, cho màn hình dựng ô chọn mà
     không phải chép lại hai bảng trên. */
  /* Mở hàm chọn hình ra cho bộ kiểm neo được mấy cặp tên ↔ hình. */
  G.veThiGiacChonHinh = chonHinh;

  /* Mở HAI danh sách dấu ra cho bộ kiểm đọc thẳng. Bộ kiểm từng giữ
     một BẢN CHÉP của danh sách dấu — và bản chép ấy không biết loại
     dấu "TÊN |", nên phép đo "dấu rò vào thân bài" không bao giờ bắt
     được dòng "Ô | …" trôi vào câu phụ. Một bản chép trong bộ kiểm là
     chỗ tệ nhất để đặt bản chép: nó làm phép đo xanh trong khi kho
     đang hỏng. */
  G.veThiGiacDau = function () {
    return {dong: DAU_DONG.slice(), khoi: RE_KHOI.source};
  };

  G.veThiGiacBiet = function () {
    return {loaiHinh: Object.keys(BO_VE),
      /* Khai ra sáu sắc đang dùng thật, để bộ kiểm đối chiếu được
         chúng với G.BRAND.mau. Không khai thì luật "màu lấy từ bảng
         đã chốt" chỉ là một câu trong chú giải. */
      sac: sacTang(),
      nen: [{ma: 'giay', ten: 'Nền giấy — ấn phẩm (mặc định)'},
            {ma: 'sau',  ten: 'Nền đêm sâu — nhúng vào web app'},
            {ma: 'sang', ten: 'Nền sáng theo giao diện đang chạy'},
            {ma: 'but',  ten: 'Giấy bút màu — vẽ tay, không cần cửa đi ra'}],
      /* Khổ in khai thêm milimét, mật độ và ngưỡng chữ — để bộ kiểm
         đo bằng chính con số bộ vẽ đang dùng, không giữ bản chép. */
      chuNhoNhatMm: CHU_NHO_NHAT_MM,
      kho: Object.keys(KHO_GIAY).map(function (m) {
        var k = KHO_GIAY[m];
        return k.in
          ? {ma: m, ten: k.ten, in: true, mmR: k.mmR, mmC: k.mmC, dpi: k.dpi,
             w: k.w, h: k.h}
          : {ma: m, ten: k.ten, w: k.w, h: k.h}; })};
  };
})();
