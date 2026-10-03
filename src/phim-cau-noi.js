/* ═══════════════════════════════════════════════════════════════
   GITA 365 — PHIM CẦU NỐI CẤP ĐỘ (50 phim · 5 tầng × 10 cấp)

   Chủ hệ: "mỗi cấp độ/tầng khách hàng có một video kết nối cấp cũ với cấp
   mới và dẫn dắt hướng tới cấp tiếp theo — không gian mẫu, hình ảnh mẫu,
   hành động mẫu, ngôn ngữ của nhà tâm lý, coach, CSKH, tư vấn, content
   marketing — giá trị nhân văn sâu sắc."

   MÀN NÀY DỰNG KỊCH BẢN, KHÔNG DỰNG PHIM. Kịch bản đi sang Xưởng phim bộ
   (G.xpBo) — nơi đã có nhân vật, bối cảnh, giọng đọc và xuất video theo
   sức máy (nang-luc-may.js). Không viết cỗ máy phim thứ hai.

   NGUỒN, KHÔNG BỊA:
     · Tên cấp, mốc       → G.KTL_CAP50 (thật, công khai)
     · Ẩn dụ tầng         → G.KTL_TANG.biet/hoa (HẠT→RỪNG, thật)
     · Vòng trung thành   → G.CWOW_ARC (THỬ→TIN→GẮN BÓ→FAN→LAN TOẢ)
     · Giáo trình cấp     → G.KTL_TL50 (kho cấp phép — có thì dùng, chưa
                            mở khoá thì kịch bản vẫn chạy bằng khung chung)
   Không gian / hình ảnh / hành động mẫu bên dưới là ĐỀ XUẤT MẪU của máy;
   chủ hệ chốt. Mỗi khung có ghi rõ chỗ nào lấy từ kho, chỗ nào là mẫu.

   LUẬT ĐẠO ĐỨC (G.CWOW_LUAT): phim cầu nối là lời GHI NHẬN và LỜI MỜI,
   không phải cú đẩy bán. Không tạo sợ bỏ lỡ, không thúc giục, không kêu
   gọi chia sẻ giữa hành trình. Bộ soát pcnSoatDaoDuc() chặn các cụm ấy.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;
G.VIEWS = G.VIEWS || {};

/* Không gian · hình ảnh · hành động MẪU theo tầng — bám ẩn dụ HẠT→RỪNG. */
G.PCN_KHONG_GIAN = {
  T1: { bieuTuong:'HẠT', khongGian:'Bàn bếp nhỏ lúc chạng vạng, một chậu đất bằng chén trà trên bậu cửa sổ',
        hinhAnh:'Hạt giống vừa nứt vỏ, một mầm trắng nhú ra', hanhDong:'Cầm bút viết đúng một dòng trong 60 giây rồi gập sổ',
        anhSang:'Nắng sớm ấm, xiên qua khung cửa', amThanh:'Guitar mộc thưa nốt, tiếng nước rót nhẹ', nhip:'chậm, nhiều khoảng lặng' },
  T2: { bieuTuong:'RỄ', khongGian:'Phòng khách gia đình sau cơn mưa, hũ thuỷ tinh trên kệ',
        hinhAnh:'Rễ trắng bám quanh đáy hũ nước trong — thấy được, chắc dần', hanhDong:'Thả đồng tiền đầu vào hũ, ghi con số lên mảnh giấy dán nắp',
        anhSang:'Trời âm u chuyển sáng dần', amThanh:'Cello trầm, mưa tạnh, tiếng trẻ con cười xa', nhip:'vững, đều như nhịp thở' },
  T3: { bieuTuong:'THÂN', khongGian:'Góc làm việc nhỏ của chính mình — một sạp, một bàn, một xưởng',
        hinhAnh:'Lát cắt thân cây với những vòng tuổi rõ nét', hanhDong:'Mở sổ kế hoạch, tự đánh dấu tuần vừa xong mà không ai nhắc',
        anhSang:'Nắng trưa trong, bóng đổ gọn', amThanh:'Bộ gõ nhịp đều, tiếng việc chạy', nhip:'chắc, có lực' },
  T4: { bieuTuong:'TÁN', khongGian:'Khu vườn chung của xóm, ghế đá dưới tán cây lớn',
        hinhAnh:'Tán lá toả bóng mát lên những người đang ngồi bên dưới', hanhDong:'Ngồi cạnh một người mới, lắng nghe trước khi nói',
        anhSang:'Chiều vàng, ánh sáng lọc qua lá', amThanh:'Dây đàn và những giọng hát nhỏ hoà vào', nhip:'rộng, ấm' },
  T5: { bieuTuong:'RỪNG', khongGian:'Bìa rừng lúc bình minh, nối sang hội trường cộng đồng',
        hinhAnh:'Nhiều thế hệ cây đứng cạnh nhau — cây mẹ và những cây con', hanhDong:'Cùng một người trẻ trồng cây con, tay đặt lên tay',
        anhSang:'Bình minh, sương mỏng tan dần', amThanh:'Dàn nhạc đầy rồi lặng hẳn, chỉ còn tiếng chim', nhip:'trang trọng, tĩnh' }
};

/* Năm giọng chuyên gia — mỗi giọng một việc, một kỹ thuật, một câu mẫu. */
G.PCN_GIONG = [
  { ma:'TL', ten:'Nhà tâm lý', viec:'Ghi nhận cảm xúc, gọi đúng tên điều người ấy đã trải qua',
    kyThuat:'Xác nhận (validation) · gọi tên cảm xúc · bình thường hoá nỗi sợ' },
  { ma:'CO', ten:'Coach', viec:'Ghi nhận NỖ LỰC (không chỉ kết quả), mở hành động nhỏ kế tiếp',
    kyThuat:'Câu hỏi mở · ý định thực thi "khi… thì tôi sẽ…" · bước nhỏ nhất có thể' },
  { ma:'CS', ten:'Chăm sóc khách hàng', viec:'Trấn an, nói rõ có ai đi cùng và tìm ở đâu khi cần',
    kyThuat:'Lời hứa có địa chỉ · không bỏ ai lại · quyền dừng lại bất cứ lúc nào' },
  { ma:'TV', ten:'Chuyên gia tư vấn', viec:'Chỉ đúng một bước cụ thể, đo được, ở cấp mới',
    kyThuat:'Một việc · một mốc · một tín hiệu biết mình đã xong' },
  { ma:'CM', ten:'Content marketing', viec:'Giữ mạch truyện: móc mở đầu, vòng mở ở cuối',
    kyThuat:'Gọi lại hình ảnh cũ (callback) · vòng mở (open loop) · không thúc giục' }
];

/* Cụm cấm — trái CWOW_LUAT (không FOMO, không thúc, không kêu gọi chia sẻ giữa hành trình). */
G.PCN_CAM = ['chỉ còn', 'kẻo lỡ', 'nhanh tay', 'duy nhất hôm nay', 'sắp hết', 'chia sẻ ngay', 'đừng bỏ lỡ',
  'cuối cùng', 'mua ngay', 'đăng ký ngay', 'bạn sẽ hối hận', 'mọi người đều đã'];

G.pcnSoatDaoDuc = function (chu) {
  var t = String(chu || '').toLowerCase();
  return G.PCN_CAM.filter(function (c) { return t.indexOf(c) >= 0; });
};

(function () {
  var U = G.U, h = U.h, ic = U.ic;

  function capTheoMa(ma) { return (G.KTL_CAP50 || []).filter(function (c) { return c.ma === ma; })[0] || null; }
  function tangTheoMa(ma) { return (G.KTL_TANG || []).filter(function (t) { return t.ma === ma; })[0] || {}; }
  function arcTheo(ma) { return (G.CWOW_ARC || []).filter(function (a) { return a.tang === ma; })[0] || {}; }
  function gon(s, n) { s = String(s || '').replace(/\s+/g, ' ').trim(); return s.length > n ? s.slice(0, n - 1) + '…' : s; }

  /* Kịch bản 8 hồi cho một cấp. Trả về đối tượng thuần — để màn hình vẽ,
     để chép ra chữ, và để đưa sang Xưởng phim bộ. */
  G.pcnKichBan = function (ma) {
    var CAP = G.KTL_CAP50 || [];
    var i = CAP.map(function (c) { return c.ma; }).indexOf(ma);
    if (i < 0) return null;
    var cur = CAP[i], truoc = CAP[i - 1] || null, sau = CAP[i + 1] || null;
    var tg = tangTheoMa(cur.tang), kg = G.PCN_KHONG_GIAN[cur.tang] || G.PCN_KHONG_GIAN.T1;
    var kgTruoc = truoc ? (G.PCN_KHONG_GIAN[truoc.tang] || kg) : null;
    var kgSau = sau ? (G.PCN_KHONG_GIAN[sau.tang] || kg) : null;
    var qua = !!(sau && sau.tang !== cur.tang), vao = !!(truoc && truoc.tang !== cur.tang);
    var arc = arcTheo(cur.tang), arcSau = sau ? arcTheo(sau.tang) : {};
    var d = (G.KTL_TL50 || {})[ma] || null, hn = d && d.hn || {};
    var nguon = d ? 'kho' : 'mau';

    var hoi = [];
    hoi.push({ ten:'Nhìn lại', giay:8, giong:'CM',
      khung: truoc ? ('Gọi lại hình ảnh cấp ' + truoc.ma + ' (' + (kgTruoc.hinhAnh) + '), chuyển cảnh mềm sang hiện tại')
                   : 'Một buổi tối bình thường trước khi biết GITA — đèn bếp, chiếc điện thoại úp mặt',
      loi: truoc ? ('Còn nhớ lúc mình là "' + truoc.ten + '" không? Hôm ấy chưa ai biết điều gì sẽ mọc lên.')
                 : 'Có những thay đổi bắt đầu từ một buổi tối rất bình thường — như tối nay.' });
    hoi.push({ ten:'Ghi nhận', giay:10, giong:'TL',
      khung: 'Cận bàn tay, khuôn mặt thả lỏng · ' + kg.anhSang,
      loi: truoc ? ('Đi được tới đây không phải vì dễ. Có hôm mệt, có hôm nghi ngờ — và mình vẫn quay lại. Điều đó đáng được gọi tên: đó là sự kiên trì.')
                 : 'Tò mò là một cảm giác đẹp. Không cần chắc chắn điều gì — chỉ cần cho mình một phút để nhìn.' });
    hoi.push({ ten: vao ? 'Bước qua cửa tầng' : 'Ngưỡng cửa', giay: vao ? 12 : 8, giong:'CO',
      khung: vao ? ('Biểu tượng chuyển hoá: ' + (kgTruoc ? kgTruoc.bieuTuong : '') + ' → ' + kg.bieuTuong + ' · ' + (tg.hoa || ''))
                 : ('Một cánh cửa gỗ hé mở, phía trong là ' + kg.khongGian.toLowerCase()),
      loi: 'Từ hôm nay, mình là "' + cur.ten + '". ' + (vao ? ('Một tầng mới — ' + (tg.ten || cur.tang) + '. ') : '') +
           'Không phải vì ai cấp danh hiệu, mà vì chính mình đã làm được những điều của cấp trước.' });
    hoi.push({ ten:'Không gian của cấp mới', giay:14, giong:'TV',
      khung: 'Không gian mẫu: ' + kg.khongGian + ' · Hình ảnh: ' + kg.hinhAnh + ' · Âm thanh: ' + kg.amThanh,
      loi: (hn.mucTamHon ? gon(hn.mucTamHon, 220) : (d && d.chuoi ? gon(d.chuoi, 220) :
           ('Ở cấp này, điều quan trọng không phải làm nhiều hơn — mà làm đều hơn, nhẹ hơn, và hiểu mình hơn.'))),
      nguon: hn.mucTamHon || (d && d.chuoi) ? 'kho' : 'mau' });
    hoi.push({ ten:'Hành động nhỏ đầu tiên', giay:12, giong:'TV',
      khung: 'Hành động mẫu: ' + kg.hanhDong + ' (quay liền một cảnh, không cắt)',
      loi: (hn.nhiemVu ? ('Việc đầu tiên, chưa tới 60 giây: ' + gon(hn.nhiemVu, 200)) :
           ('Việc đầu tiên rất nhỏ: ' + kg.hanhDong.toLowerCase() + '. Khi xong, mình sẽ biết — và thế là đủ cho hôm nay.')),
      nguon: hn.nhiemVu ? 'kho' : 'mau' });
    hoi.push({ ten:'Có người đi cùng', giay:8, giong:'CS',
      khung: 'Hai bàn tay đặt cạnh nhau trên bàn · nụ cười của người đồng hành',
      loi: 'Mình không đi một mình. Khi cần, đội đồng hành ở ngay trong ứng dụng. Muốn chậm lại, muốn dừng nghỉ — cũng đều được.' });
    hoi.push({ ten: sau ? 'Hé lộ phía trước' : 'Vòng khép', giay:10, giong:'CM',
      khung: sau ? ('Lướt qua rất nhanh hình ảnh ' + (kgSau.hinhAnh || '').toLowerCase() + ' — mờ, chưa rõ hẳn' + (qua ? (' · biểu tượng ' + kgSau.bieuTuong) : ''))
                 : 'Cây mẹ giữa rừng, máy lùi xa dần cho thấy cả khu rừng · rồi một hạt giống trong tay một người lạ',
      loi: sau ? ((qua ? ('Phía trên còn một tầng nữa — ' + (arcSau.pha || '').toLowerCase() + '. ') : '') +
                  'Có một điều đang đợi ở "' + sau.ten + '". Chưa cần biết ngay. Khi mình sẵn sàng, nó sẽ ở đó.')
               : 'Một ngày nào đó, câu chuyện của mình sẽ là buổi tối đầu tiên của một người khác. Vòng khép lại — và mở ra.' });
    hoi.push({ ten:'Lời hẹn', giay:6, giong:'CO',
      khung: 'Chữ trên nền ' + kg.anhSang.toLowerCase() + ': "' + cur.ten + '" · logo GITA 365',
      loi: 'Hẹn mình ngày mai — cùng một phút ấy.' });

    var tong = hoi.reduce(function (s, x) { return s + x.giay; }, 0);
    var chu = hoi.map(function (x) { return x.loi; }).join(' ');
    return { ma: ma, cur: cur, truoc: truoc, sau: sau, tang: tg, kg: kg, arc: arc, quaTang: qua, vaoTang: vao,
      hoi: hoi, tongGiay: tong, nguon: nguon, viPham: G.pcnSoatDaoDuc(chu),
      wow: d && (hn.wowCD || d.wow) ? gon(hn.wowCD || d.wow, 240) : '', tinHieu: d && d.tinHieu ? gon(d.tinHieu, 240) : '' };
  };

  G.pcnChuThuan = function (k) {
    if (!k) return '';
    var GI = {}; G.PCN_GIONG.forEach(function (g) { GI[g.ma] = g.ten; });
    var o = ['PHIM CẦU NỐI · CẤP ' + k.ma + ' — ' + k.cur.ten,
      (k.tang.ten || k.cur.tang) + ' · ' + (k.kg.bieuTuong || '') + (k.arc.pha ? ' · vòng trung thành: ' + k.arc.pha : '') +
      ' · ~' + k.tongGiay + ' giây · nhịp ' + k.kg.nhip,
      (k.truoc ? 'Nối từ: ' + k.truoc.ma + ' ' + k.truoc.ten : 'Mở đầu hành trình') + (k.sau ? ' → hé lộ: ' + k.sau.ma + ' ' + k.sau.ten : ' → vòng khép'), ''];
    k.hoi.forEach(function (x, i) {
      o.push((i + 1) + '. ' + x.ten.toUpperCase() + ' (' + x.giay + 's · giọng ' + GI[x.giong] + ')');
      o.push('   Hình: ' + x.khung);
      o.push('   Lời: ' + x.loi);
    });
    if (k.wow) o.push('', 'Điểm chạm WOW của cấp (kho): ' + k.wow);
    if (k.tinHieu) o.push('Tín hiệu lên cấp (kho): ' + k.tinHieu);
    o.push('', 'Luật: ghi nhận & mời — không thúc giục, không tạo sợ bỏ lỡ, không kêu gọi chia sẻ.');
    return o.join('\n');
  };

  G.pcnChon = function (ma) { G.pcnCap = ma; G.render && G.render(); };

  G.pcnGuiXuong = function (ma) {
    var k = G.pcnKichBan(ma); if (!k) return;
    try {
      if (!G.xpBo && G.xpBoKhoiTao) G.xpBoKhoiTao();
      if (!G.xpBoSua || !G.xpBo) throw new Error('Xưởng phim bộ chưa nạp');
      if (G.xpBoDangChay && G.xpBoDangChay()) throw new Error('Xưởng đang chạy một bộ phim — chờ xong rồi gửi');
      G.xpBoSua('tang', k.cur.tang);
      G.xpBoSua('ghiChu', G.pcnChuThuan(k).slice(0, 4000));
      U.toast('Đã đưa kịch bản cấp ' + ma + ' sang Xưởng phim bộ (mục khách hàng → ghi chú).', 'ok');
      if (G.go) G.go('xuong-phim');
    } catch (e) { U.toast('Không đưa sang Xưởng phim được: ' + (e && e.message || e), 'err'); }
  };

  G.pcnChep = function (ma) {
    var chu = G.pcnChuThuan(G.pcnKichBan(ma));
    if (navigator.clipboard) navigator.clipboard.writeText(chu).then(function () { U.toast('Đã chép kịch bản cấp ' + ma + '.', 'ok'); },
      function () { U.toast('Trình duyệt không cho chép — mở trang bằng https.', 'err'); });
  };

  G.VIEWS['phim-cau-noi'] = function () {
    if (!G.can || !G.can('pro_consult')) return U.lockCard ? U.lockCard() : U.empty('Cần gói nghề', 'Màn này khoá ở quyền nghề.');
    var CAP = G.KTL_CAP50 || [], TANG = G.KTL_TANG || [];
    if (!CAP.length) return U.empty('Chưa có trục 50 cấp', 'Không tìm thấy G.KTL_CAP50.');
    if (!capTheoMa(G.pcnCap)) G.pcnCap = CAP[0].ma;

    var o = U.ph({ eyebrow:'HÀNH TRÌNH · 50 PHIM CẦU NỐI', ic:'spark', grad:1,
      t:'Phim cầu nối cấp độ',
      lead:'Mỗi lần khách lên một cấp là một khoảnh khắc đáng ghi nhớ. Phim cầu nối gọi lại hình ảnh cấp cũ, ghi nhận nỗ lực, mở không gian cấp mới bằng một hành động nhỏ, rồi hé lộ — không thúc — điều đang đợi ở cấp sau.' });

    o += '<div class="dh-chon">';
    TANG.forEach(function (t) {
      o += '<div class="dh-tang-hang"><span class="dh-tang-nhan" style="color:' + (t.mau || 'var(--gita)') + '">' +
        h(t.ma) + ' ' + h(t.biet || '') + '</span><div class="dh-caps">' +
        CAP.filter(function (c) { return c.tang === t.ma; }).map(function (c) {
          var on = c.ma === G.pcnCap;
          return '<button class="dh-cap' + (on ? ' on' : '') + '" onclick="G.pcnChon(\'' + c.ma + '\')"' +
            (on ? ' style="background:' + (t.mau || 'var(--gita)') + ';border-color:' + (t.mau || 'var(--gita)') + '"' : '') +
            '>' + h(c.ma) + '</button>';
        }).join('') + '</div></div>';
    });
    o += '</div>';

    var k = G.pcnKichBan(G.pcnCap), mau = k.tang.mau || 'var(--gita)';
    var GI = {}; G.PCN_GIONG.forEach(function (g) { GI[g.ma] = g; });

    o += '<div class="dh-panel" style="border-top:4px solid ' + mau + '">';
    o += '<div class="dh-dau"><span class="mono dh-ma" style="background:' + mau + '">' + h(k.ma) + '</span>' +
      '<div><b class="dh-ten">' + h(k.cur.ten) + '</b><div class="tiny muted">' +
      (k.truoc ? 'nối từ ' + h(k.truoc.ma + ' ' + k.truoc.ten) : 'mở đầu hành trình') + ' → ' +
      (k.sau ? 'hé lộ ' + h(k.sau.ma + ' ' + k.sau.ten) : 'vòng khép') +
      ' · ~' + k.tongGiay + ' giây' + (k.quaTang ? ' · <b>phim chuyển tầng</b>' : '') + '</div></div></div>';

    o += '<div class="row mt" style="gap:9px;flex-wrap:wrap">' +
      '<button class="btn pri" onclick="G.pcnGuiXuong(\'' + k.ma + '\')">' + ic('spark', 'w-4 h-4') + 'Gửi sang Xưởng phim bộ</button>' +
      '<button class="btn ghost" onclick="G.pcnChep(\'' + k.ma + '\')">' + ic('list', 'w-4 h-4') + 'Chép kịch bản</button>' +
      '<span class="chip" style="border:1px solid ' + (k.viPham.length ? 'var(--gita-do)' : 'var(--ok)') + '">' +
        ic(k.viPham.length ? 'alert' : 'shield', 'w-3 h-3') + (k.viPham.length ? ' Vướng luật: ' + h(k.viPham.join(', ')) : ' Đạt luật đạo đức WOW') + '</span>' +
      '<span class="chip">' + (k.nguon === 'kho' ? 'Có giáo trình cấp từ kho' : 'Khung chung — mở kho để làm giàu') + '</span></div>';

    o += U.sec('KHÔNG GIAN · HÌNH ẢNH · HÀNH ĐỘNG MẪU', 'Đề xuất mẫu theo ẩn dụ ' + h(k.kg.bieuTuong) + ' — chủ hệ chốt.');
    o += U.tbl(['Lớp', 'Mẫu'], [
      ['Không gian', h(k.kg.khongGian)], ['Hình ảnh', h(k.kg.hinhAnh)], ['Hành động', h(k.kg.hanhDong)],
      ['Ánh sáng', h(k.kg.anhSang)], ['Âm thanh', h(k.kg.amThanh)], ['Nhịp dựng', h(k.kg.nhip)]]);

    o += U.sec('KỊCH BẢN 8 HỒI', 'Mỗi hồi một giọng chuyên gia dẫn — cảm xúc trước, hành động sau, lời mời ở cuối.');
    k.hoi.forEach(function (x, i) {
      var g = GI[x.giong] || {};
      o += '<div class="card mt" style="border-left:3px solid ' + mau + '">' +
        '<div class="row" style="gap:8px;align-items:center;flex-wrap:wrap"><b class="sm">' + (i + 1) + '. ' + h(x.ten) + '</b>' +
        '<span class="chip">' + x.giay + 's</span><span class="chip" title="' + h(g.kyThuat || '') + '">' + h(g.ten || '') + '</span>' +
        (x.nguon ? '<span class="tiny muted">' + (x.nguon === 'kho' ? 'lời từ kho' : 'lời mẫu') + '</span>' : '') + '</div>' +
        '<p class="tiny dim mt">' + ic('eye', 'w-3 h-3') + ' ' + h(x.khung) + '</p>' +
        '<p class="sm mt" style="line-height:1.7">“' + h(x.loi) + '”</p></div>';
    });
    if (k.wow || k.tinHieu) {
      o += '<div class="card mt2"><p class="tiny">' + (k.wow ? '<b>Điểm chạm WOW (kho):</b> ' + h(k.wow) + '<br>' : '') +
        (k.tinHieu ? '<b>Tín hiệu lên cấp (kho):</b> ' + h(k.tinHieu) : '') + '</p></div>';
    }

    o += U.sec('NĂM GIỌNG CHUYÊN GIA', 'Mỗi giọng một việc — không giọng nào được bán hàng.');
    o += U.tbl(['Giọng', 'Việc trong phim', 'Kỹ thuật'], G.PCN_GIONG.map(function (g) {
      return ['<b class="sm">' + h(g.ten) + '</b>', '<span class="sm">' + h(g.viec) + '</span>', '<span class="tiny">' + h(g.kyThuat) + '</span>'];
    }));
    o += '</div>';
    return o;
  };
})();
