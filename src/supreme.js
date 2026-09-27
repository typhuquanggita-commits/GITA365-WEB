/* ═══════════════════════════════════════════════════════════════
   GITA 365 — MÀN GITA SUPREME: BẢN ĐỒ VÀ TRẦN  (9.99.86)

   Theo tệp `MYVIP.doc` của chủ hệ — ba quyển, 410.000 ký tự:
   Quyển I nghiên cứu 14 nền tảng → ma trận 28 sức mạnh · Quyển II
   chuỗi 100.000 điểm chạm chia 10 lớp · Quyển III Kênh GITA Supreme
   100 phần.

   ══ MÀN NÀY TRÌNH BẢN ĐỒ VÀ CÁI TRẦN, CHƯA TRÌNH CÁI KÊNH ══

   Lần thứ tư thứ tự ấy được chọn, sau Hiến pháp (9.99.62), trần giám
   sát (9.99.76) và vòng tự nâng cấp (9.99.77). Ở đây lý do gắt hơn cả
   ba: bản đặc tả không mô tả một màn hình — nó mô tả MỘT MẠNG XÃ HỘI.
   Dựng mạng trước rồi mới hỏi luật nào áp cho nó thì tới lúc ấy mỗi
   tính năng đã có một luật riêng, và gom lại không gom được nữa.

   ══ NGĂN ĐẦU LÀ BẪY TÊN GỌI, KHÔNG PHẢI CHỖ VA ══

   Khác 9.99.76, nơi ngăn đầu là sáu điều cấm. Ở đây chỗ nguy nhất
   không phải một luật bị phạm — nó là BA THANG CÙNG TÊN "điểm chạm".
   Một luật bị phạm thì có người cãi; hai thang cùng tên thì không ai
   cãi, chúng chỉ lặng lẽ được đọc như một.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;
G.VIEWS = G.VIEWS || {};

(function () {
  var U = G.U, h = U.h, ic = U.ic;

  var NGAN = [
    {ma: 'ten',  ten: 'Bẫy tên gọi',      ic: 'shield'},
    {ma: 'va',   ten: 'Chỗ va · chỗ hợp', ic: 'pulse'},
    /* `lightning` chứ không phải một tên biểu tượng nghe hợp hơn: U.ic()
       rơi về `spark` khi không có tên, và rơi LẶNG LẼ — một biểu tượng
       sai trông y hệt một biểu tượng đúng. Tên nào cũng phải có trong
       U.P mới được gõ. */
    {ma: 'mauthuan', ten: 'Tự mâu thuẫn', ic: 'lightning'},
    {ma: 'matran', ten: 'Ma trận 28',     ic: 'star'},
    {ma: 'lop',  ten: '10 lớp · 100 phần', ic: 'list'}
  ];

  G.supNgan = G.supNgan || 'ten';

  function veLai() {
    if (!G.S || G.S.view !== 'supreme') return;
    if (typeof document === 'undefined' || !document.getElementById('main')) return;
    G.render && G.render();
  }
  G.supMoNgan = function (ma) { G.supNgan = ma; veLai(); };

  /* ── NGĂN 1 · BẪY TÊN GỌI ── */
  function veTen() {
    var ds = G.SUP_THANG || [], lu = G.SUP_THANG_LUAT || {};
    /* U.sec() TỰ gọi U.h() trên tham số — truyền h(...) vào là thoát
       lần thứ hai và người đọc thấy &quot; giữa câu tiếng Việt. Lỗi này
       không sinh lỗi trang nên nó sống rất lâu (bản 9.24 gỡ 77 chỗ,
       9.99.70 mắc lại ở U.empty). Bộ rà soát chỗ trống bắt ngay. */
    var o = U.sec('Ba thang cùng mang chữ "điểm chạm"', lu.vaSao || '');
    o += U.tbl(['Mã', 'Thang', 'Gõ là gì', 'Tổng', 'Chốt ở đâu'],
      ds.map(function (t) {
        return [h(t.ma), h(t.ten), '<code>' + h(t.o) + '</code>',
          h(t.tong), h(t.chotO)];
      }));
    ds.forEach(function (t) {
      o += '<p class="note"><b>' + h(t.ten) + ':</b> ' + h(t.la) +
        ' <span class="muted">— dùng ở: ' + h(t.aiDung) + '</span></p>';
    });
    if (lu.cachGoi) o += '<p class="note">' + h(lu.cachGoi) + '</p>';
    if (lu.mucNao) o += '<p class="note">' + h(lu.mucNao) + '</p>';
    return o;
  }

  /* ── NGĂN 2 · CHỖ VA VÀ CHỖ BẮT OAN ──
     Hai bảng đi CÙNG NHAU, không tách ra hai ngăn. Nêu chỗ va mà giấu
     chỗ bắt oan thì người đọc tưởng cả bản đặc tả là sai rồi thôi
     không đọc — và lúc ấy bốn chỗ va thật cũng không ai đọc. */
  /* Mỗi con số đếm được in KÈM CỤM DÒ sinh ra nó. Bản 9.99.83 chỉ in
     con số, và một con số không kèm cụm thì không ai chạy lại được —
     nên không ai biết bốn con số ấy đều sai. */
  function veCum(v) {
    var cs = v.cum || [];
    if (!cs.length) return '—';
    return cs.map(function (c) {
      return '<code>' + h(c.c) + '</code> ' + c.n;
    }).join('<br>');
  }

  function veVa() {
    var ds = G.SUP_VA || [], cu = G.SUP_VA_CU || [],
      oan = G.SUP_OAN || [], ol = G.SUP_OAN_LUAT || {};
    var o = U.sec(ds.length + ' chỗ va MỚI — không chép lại sáu điều cấm đã có',
      'Sáu điều cấm của GITA-VIP (9.99.76) đã phủ bốn chỗ Quyển I–III đụng tới: ' +
      'xếp hạng người · sinh trắc trẻ · hạ cấp và đặt lại chuỗi · doạ mất chuỗi. ' +
      'Chép chúng sang đây là dựng bản thứ hai của một BẢNG CẤM — bản nguy nhất, ' +
      'vì sửa một bên thì bên kia vẫn chặn theo luật cũ mà cả hai vẫn xanh. ' +
      'Cột "Đếm được" in kèm chính cụm dò sinh ra con số: một con số không ' +
      'kèm cụm thì không ai chạy lại được, nên không ai biết nó sai.');
    o += U.tbl(['Mã', 'Bản đặc tả đòi gì', 'Cụm dò · đếm được', 'Luật nào', 'Đường đi'],
      ds.map(function (v) {
        return [h(v.ma), h(v.doi), veCum(v),
          '<code>' + h(v.luat) + '</code>', h(v.duong)];
      }));
    ds.forEach(function (v) {
      o += '<p class="note"><b>' + h(v.ma) + ' · vì sao:</b> ' + h(v.viSao) + '</p>';
    });

    if (cu.length) {
      o += U.sec('Chỗ đụng điều cấm ĐÃ CÓ — trỏ, không cấp mã mới',
        'Loại chỗ thứ hai, chỉ lượt đọc đủ mới thấy: bản đặc tả đụng vào một điều ' +
        'cấm đã có răng, nhưng đụng qua một cửa khác với cửa mà điều cấm ấy đã ghi. ' +
        'Không được cấp mã va mới — cấp mã mới là dựng bản thứ hai của một điều cấm. ' +
        'Nhưng cũng không được im: im thì người dựng sau đọc điều cấm cũ, thấy nó nói ' +
        'về một cửa khác, rồi kết luận cửa mình đang dựng không liên quan.');
      o += U.tbl(['Chỗ trong bản đặc tả', 'Điều cấm đã có', 'Luật nào', 'Đường đi'],
        cu.map(function (x) {
          return [h(x.noi), '<code>VIP_CAM ' + h(x.camCu) + '</code>',
            '<code>' + h(x.luat) + '</code>', h(x.duong)];
        }));
      cu.forEach(function (x) {
        o += '<p class="note"><b>' + h(x.noi) + ' · vì sao:</b> ' + h(x.viSao) +
          (x.coGiKhac ? ' <span class="muted">' + h(x.coGiKhac) + '</span>' : '') + '</p>';
      });
    }

    /* Ngưỡng tuổi đứng NGAY SAU hai bảng chỗ va, không xuống cuối: nó
       là câu trả lời cho V1 (người dưới 18) và cho chỗ đụng C1 (xếp
       hạng trẻ), nên đọc liền mạch mới thấy nó thuộc về đâu. */
    var tu = G.SUP_TUOI || {};
    if (tu.nguong) {
      /* KHÔNG bọc h() ở đây — U.sec() tự gọi U.h() trên tham số, và
         bọc thêm là thoát lần thứ hai. Lỗi này đã mắc ở 9.24 (77 chỗ),
         9.99.70 (U.empty), 9.99.83 (U.sec) — và vừa mắc lại lần thứ tư
         ở đúng tệp có dòng cảnh báo cách đây bảy mươi dòng. */
      o += U.sec('Ngưỡng tuổi đã chốt — ' + tu.nguong + ' tuổi, và CHIỀU CẮT mới là phần quan trọng',
        (tu.chot || '') + ' ' + (tu.giuNguyen || ''));
      o += U.tbl(['Ngưỡng', 'Áp cho vai', 'Là gì', 'Chốt ngày', 'Ai chốt'],
        [[String(tu.nguong), h(tu.apChoVai || ''), h(tu.la || ''),
          h(tu.chotNgay || ''), h(tu.boiAi || '')]]);
      o += '<p class="note"><b>Chưa có chỗ cắm răng:</b> ' + h(tu.chuaCoMat || '') +
        ' <b>Khi dựng cửa ấy:</b> ' + h(tu.camKhiDung || '') + '</p>';
      o += '<p class="note"><b>Chỗ dễ dựng sai nhất:</b> ' + h(tu.khongDungTuoiCon || '') +
        ' ' + h(tu.ngaySinhOdau || '') + '</p>';
      o += '<p class="note">' + h(tu.khong18 || '') + '</p>';
    }

    /* Hai chốt của 9.99.86. Cả hai là chốt MỞ RA việc, không phải chốt
       đóng việc — nên phần in đậm nhất phải là chỗ CÒN LẠI, không phải
       chữ "đã chốt". Một mục đã chốt "mở" rất dễ được đọc là "mở được
       rồi". */
    var wow = G.SUP_WOW || [], wl = G.SUP_WOW_LUAT || {}, ch = G.SUP_CHO || {};
    if (wow.length) {
      o += U.sec('SUP-01 đã chốt — 100.000 là CÁCH ĐẾM, và năm nguồn wow',
        (wl.cachDem || '') + ' ' + (wl.bayDoiCho || ''));
      o += U.tbl(['Mã', 'Nguồn wow (nguyên văn)', 'Ai đo', 'Đo thế nào', 'Hôm nay đã có gì'],
        wow.map(function (w) {
          return [h(w.ma), h(w.nguon),
            w.mayDo ? 'máy' : '<b>người</b>',
            h(w.mayDo || w.nguoiDo || ''), h(w.daCo || '')];
        }));
      o += '<p class="note"><b>Không đặt ngưỡng cho wow:</b> ' +
        h(wl.camDatChiTieu || '') + '</p>';
      if (wl.cangDungCangWow)
        o += '<p class="note">' + h(wl.cangDungCangWow) + '</p>';
    }

    /* ── BA CHIỀU CỦA SUP-01, CHỦ HỆ NÓI LẠI RỘNG HƠN (9.99.87) ──
       Mẫu số của chiều B1 ĐẾM LÚC ĐỌC bằng chính G.vaiCo mà cột trái
       dùng — không gõ con số nào vào kho, và không dựng lại phép so
       cấp bằng tay: `r.lv <= need` mới là một nửa luật, nửa kia là lớp
       cấm riêng G.PHANQUYEN. Lượt đo đầu của tôi bỏ nửa ấy và ra 68
       thay vì 66 — sai theo hướng RỘNG RA. */
    var bc = G.SUP_BACHIEU || [], bl = G.SUP_BACHIEU_LUAT || {};
    if (bc.length) {
      o += U.sec('Chủ hệ nói lại SUP-01 rộng hơn — ba chiều, ba vai khách',
        (bl.nguyenVan || '') + ' ' + (bl.khachChuKhongPhaiHocVien || ''));

      o += U.tbl(['Chiều', 'Ai đo', 'Đo thế nào', 'Hôm nay còn thiếu gì', 'Cái bẫy'],
        bc.map(function (b) {
          return [h(b.chieu), b.mayDo ? 'máy' : '<b>người</b>',
            h(b.mayDo || b.nguoiDo || ''),
            h(b.chuaDo || b.daCo || ''), h(b.bay || '')];
        }));

      /* Đếm lại mỗi lần mở màn. Kho chỉ giữ bản ghi của MỘT lượt đo để
         đối chiếu — bảng này mới là nguồn. */
      if (G.NAV && G.vaiCo) {
        var VAI = ['R13', 'R14', 'R15'], hop = {}, tong = 0, dong = [];
        G.NAV.forEach(function (g) { tong += g.items.length; });
        VAI.forEach(function (v) {
          var r = G.roleById ? G.roleById(v) : null, n = 0;
          G.NAV.forEach(function (g) {
            g.items.forEach(function (it) {
              if (!it.perm || G.vaiCo(v, it.perm)) { n++; hop[it.v] = 1; }
            });
          });
          dong.push([h(v + ' · ' + (r ? r.n : '')), String(n),
            Math.round(n * 100 / tong) + '%']);
        });
        var soHop = Object.keys(hop).length;
        o += U.tbl(['Vai khách', 'Mở được mấy mục', 'Trên ' + tong + ' mục'], dong);
        o += '<p class="note"><b>Hợp ba vai: ' + soHop + ' mục</b> — không phải tổng. ' +
          h(bl.hopKhongPhaiTong || '') + '</p>';
        o += '<p class="note"><b>Đếm lúc đọc:</b> ' + h(bl.mauSoTinhLucDoc || '') + '</p>';
        o += '<p class="note"><b>Bẫy đã cắn ngay lượt đo đầu:</b> ' +
          h(bl.bayPhanQuyenRieng || '') + '</p>';
      }

      o += '<p class="note"><b>Không gộp ba chiều:</b> ' +
        h(bl.khongGopBaChieu || '') + '</p>';
      o += '<p class="note">' + h(bl.chuaDoChiDiVoiMayDo || '') + '</p>';
      o += '<p class="note"><b>Vẫn là cách đếm:</b> ' + h(bl.vanLaCachDem || '') + '</p>';
    }

    /* ── MƯỜI VIỆC MỘT NGƯỜI HÂM MỘ LÀM (9.99.87) ──
       Bảy việc đầu là HÀNH VI nên đếm thẳng được — chốt này làm phần
       máy đo TO RA. Nhưng bốn việc đã có chỗ đếm đang chạy, một việc bị
       SUP-05 chặn, một việc phạm L08. Cột "Đã có" và cột "Va vào" phải
       đứng ngay cạnh cột "Ai đo", không xuống chú thích cuối bảng:
       xuống cuối thì người đọc thấy mười dòng đếm được rồi đi dựng. */
    var fan = G.SUP_FAN || [], fl = G.SUP_FAN_LUAT || {};
    if (fan.length) {
      o += U.sec(fan.length + ' việc một người hâm mộ làm — ' +
        fan.filter(function (f) { return f.mayDo; }).length + ' việc máy đếm được',
        (fl.canCanLat || '') + ' ' + (fl.fanKhongPhaiChiSo || ''));
      o += U.tbl(['Mã', 'Việc (nguyên văn)', 'Ai đo', 'Đo thế nào', 'Đã có chỗ đếm', 'Va vào'],
        fan.map(function (f) {
          return [h(f.ma), h(f.viec),
            f.mayDo ? 'máy' : '<b>người</b>',
            h(f.mayDo || f.nguoiDo || ''),
            f.daCo ? h(f.daCo) : '—',
            f.vaLuat ? '<code>' + h(f.vaLuat) + '</code>'
              : f.chanBoi ? '<b>chặn bởi ' + h(f.chanBoi) + '</b>' : '—'];
        }));
      fan.forEach(function (f) {
        if (f.khongDungLai)
          o += '<p class="note"><b>' + h(f.ma) + ' · đừng đếm lại:</b> ' +
            h(f.khongDungLai) + '</p>';
        if (f.vaViSao)
          o += '<p class="note"><b>' + h(f.ma) + ' · vì sao:</b> ' + h(f.vaViSao) + '</p>';
      });
      o += '<p class="note"><b>Bốn việc đã có chỗ đếm:</b> ' +
        h(fl.bonViecDaCoChoDem || '') + '</p>';
      o += '<p class="note"><b>Đếm được KHÔNG mở đường đặt đích:</b> ' +
        h(fl.chiTieuVanCam || '') + ' ' + h(fl.vaySaoVanDem || '') + '</p>';
      o += '<p class="note">' + h(fl.loiChotTuVaBoLoc || '') + '</p>';
    }

    if (ch.chot) {
      /* Không h() trong tham số U.sec — nó tự gọi U.h(). Ở đây giá trị
         là "MỞ" nên thoát hai lần không lộ ra, và đó chính là lý do lớp
         lỗi này sống lâu: nó chỉ hiện khi chuỗi có ký tự đặc biệt. */
      o += U.sec('SUP-02 đã chốt — ' + (ch.chot || '') + ', và cổng CÒN LẠI không phải chất lượng',
        ch.conCong || '');
      o += U.tbl(['Bốn điều kiện chủ hệ chốt'],
        (ch.dieuKien || []).map(function (d) { return [h(d)]; }));
      o += '<p class="note"><b>Chưa có cửa nào:</b> ' + h(ch.chuaCoCua || '') + '</p>';
      o += '<p class="note"><b>Chỗ dễ nhầm nhất:</b> ' + h(ch.khacHoaHong || '') + '</p>';
      o += '<p class="note"><b>Lỗ ngay trong điều kiện 4 sao:</b> ' +
        h(ch.loColdStart || '') + '</p>';
      o += '<p class="note"><b>Chống nuôi sao:</b> ' + h(ch.chongFarmSao || '') +
        ' ' + h(ch.saoKhacXepHangNguoi || '') + '</p>';
    }

    o += U.sec(oan.length + ' chỗ phép dò của tôi BẮT OAN', ol.bai || '');
    o += U.tbl(['Dấu hiệu', 'Khớp', 'Nguyên văn trong tài liệu', 'Sự thật'],
      oan.map(function (x) {
        return [h(x.dau), x.dem + ' lần', h(x.nguyenVan), h(x.that)];
      }));
    if (ol.vaSao) o += '<p class="note">' + h(ol.vaSao) + '</p>';
    if (ol.tieuDe) o += '<p class="note">' + h(ol.tieuDe) + '</p>';
    return o;
  }

  /* ── NGĂN 3 · CHỖ BẢN ĐẶC TẢ TỰ MÂU THUẪN ──
     Khác chỗ va (đụng luật kho) và khác chỗ bắt oan (phép dò của tôi
     sai). Đây là chỗ bản đặc tả nói hai điều ngược nhau ở hai phần cách
     nhau hàng chục nghìn ký tự — người dựng sau chỉ đọc MỘT vế, và vế
     họ đọc trước là vế thắng, mà không ai quyết định điều đó cả. */
  function veMauThuan() {
    var ds = G.SUP_MAUTHUAN || [];
    var o = U.sec('Chỗ bản đặc tả nói hai điều ngược nhau',
      'Ba chỗ này chỉ lộ ra khi đọc hết 409.993 ký tự: hai vế nằm cách nhau hàng ' +
      'chục nghìn ký tự nên không lượt đọc lướt nào bắt được. Phải khai, vì người ' +
      'dựng sau sẽ đọc đúng một trong hai vế — và vế nào họ đọc trước thì vế ấy ' +
      'thắng, mà không ai quyết định điều đó cả.');
    o += U.tbl(['Câu hỏi', 'Vế A', 'Vế B', 'Kho theo vế'],
      ds.map(function (x) {
        return [h(x.ten), h(x.veA), h(x.veB),
          (x.khoTheoBen === '—' ? '—' : '<b>' + h(x.khoTheoBen) + '</b>')];
      }));
    ds.forEach(function (x) {
      o += '<p class="note"><b>' + h(x.ten) + ':</b> ' + h(x.vi) + '</p>';
    });
    return o;
  }

  /* ── NGĂN 4 · MA TRẬN 28 ── */
  function veMaTran() {
    var ds = G.SUP_CUM || [];
    var tong = ds.reduce(function (a, c) { return a + (c.nl || []).length; }, 0);
    var o = U.sec('Hai mươi tám sức mạnh, năm cụm',
      'Quyển I giải phẫu 14 nền tảng rồi trích ra "gen trội" của từng cái, hợp nhất ' +
      'thành hai mươi tám năng lực. Bảng này giữ CÁCH CHIA CỤM của bản đặc tả và ' +
      'không chấm điểm cụm nào — chấm điểm ở đây là tự chấm, đúng thứ thang 1000 ' +
      'điểm vừa phải tách hai ngăn để thôi làm (9.99.81).');
    o += U.tbl(['Cụm', 'Tên', 'Năng lực', 'Bao nhiêu'],
      ds.map(function (c) {
        return [h(c.ma), h(c.ten),
          (c.nl || []).join(' · '), String((c.nl || []).length)];
      }));
    o += '<p class="note">Tổng ' + tong + ' năng lực. ' +
      (tong === 28 ? 'Khớp con số bản đặc tả khai.'
        : '<b>LỆCH</b> với con số 28 bản đặc tả khai — nói ra chỗ lệch, ' +
          'im thì người đọc tự đếm rồi ngờ chính bản đặc tả.') + '</p>';
    return o;
  }

  /* ── NGĂN 5 · MƯỜI LỚP VÀ MỘT TRĂM PHẦN ── */
  function veLop() {
    var lop = G.SUP_LOP || [], khoi = G.SUP_KHOI || [], d = G.SUP_DEM || {};
    var o = U.sec('Mười lớp điểm chạm — hai vòng đồng tâm và một vành đai',
      'Mười lớp không xếp theo thời gian mà theo hai vòng đời người dùng, cộng một ' +
      'vành đai bắc qua mọi vòng. Cột "Tổng" cố ý KHÔNG ghi 10.000 cho mỗi lớp: con ' +
      'số ấy là một CHỈ TIÊU chủ hệ đặt, chưa phải một phép đếm — ghi vào bảng là để ' +
      'một chỉ tiêu đọc ra như một phép đo.');
    o += U.tbl(['Lớp', 'Tên', 'Vòng', 'Đã biên soạn ở', 'Vì sao lớp này tồn tại'],
      lop.map(function (l) {
        return [h(l.ma), h(l.ten), h(l.vong),
          l.daBienSoan ? h(l.daBienSoan) : '<span class="muted">chưa</span>', h(l.y)];
      }));

    /* Cộng lại từ SUP_KHOI, kể cả phần lẻ của khối chưa trọn. Con số
       này vẫn là bản chép thứ hai của `d.coChu` — nó canh được sự NHẤT
       QUÁN, không canh được sự ĐÚNG, và đó chính là chỗ con số 45 của
       bản 9.99.83 sống qua một lượt phát hành. Nên ô `nguon` bên dưới
       phải nói thẳng con số ấy là lời khai. */
    var coChu = khoi.reduce(function (a, k) {
      return a + (k.daViet ? (k.den - k.tu + 1) : (k.le || []).length);
    }, 0);
    var kk = G.SUP_KHONGKHOI || {};
    o += U.sec('Một trăm phần — và chỗ bản đặc tả còn trống',
      'Đếm được thì đếm, nhưng đếm ở ĐÂU thì phải nói ra. Trình "100 phần" mà không ' +
      'nói bao nhiêu phần chưa có chữ nào thì người đọc tin là đã đủ — cùng luật với ' +
      '`conLaiChuaTrinh` của bản tin sáng (9.99.71).');
    o += U.tbl(['Khối', 'Tên', 'Phần', 'Đã viết'],
      khoi.map(function (k) {
        return [h(k.ma), h(k.ten), k.tu + '–' + k.den,
          k.daViet ? 'trọn ' + (k.den - k.tu + 1) + ' phần'
            : '<b>' + (k.le || []).length + '/' + (k.den - k.tu + 1) + '</b>' +
              ((k.le || []).length ? ' — đã viết ' + k.le.join(' · ') : '')];
      }));
    o += '<p class="note"><b>' + coChu + '/' + (d.khai || 100) +
      ' phần đã có chữ</b> · còn ' + ((d.khai || 100) - coChu) +
      ' phần trống. ' + h(d.vi || '') + '</p>';

    /* Con số đếm được là LỜI KHAI, và lời khai phải mang ngày, người và
       cách đếm — nếu không, nó đứng cạnh những con số đo được và đọc ra
       như nhau (9.99.59 · 9.99.62 · 9.99.81). */
    if (d.nguon === 'nguoiDem') {
      o += '<p class="note"><b>Con số này là LỜI KHAI, không phải phép đo.</b> ' +
        h(d.vaSaoLaLoiKhai || '') + '</p>';
      o += U.tbl(['Ai đếm', 'Ngày', 'Đếm trên tệp nào', 'Cách đếm'],
        [[h(d.ai || '—'), h(d.ngay || '—'), h(d.tep || '—'), h(d.cachDem || '—')]]);
    }

    if (kk.so) {
      o += U.sec(kk.so + ' phần KHÔNG THUỘC KHỐI NÀO — phần ' + kk.tu + '–' + kk.den,
        kk.cach || '');
      o += '<p class="note">' + h(kk.vi || '') + '</p>';
      o += '<p class="note"><b>Cần gì:</b> ' + h(kk.canGi || '') + '</p>';
    }
    return o;
  }

  var VE = {ten: veTen, va: veVa, mauthuan: veMauThuan,
    matran: veMaTran, lop: veLop};

  G.VIEWS['supreme'] = function () {
    /* Chặn ở MỘT chỗ, trước cả thanh ngăn — bài học 9.99.63: vai không
       có kho thì cả bốn ngăn vẫn dựng ra bảng có đầu cột mà không có
       dòng, và một khung rỗng đọc ra là "chỗ này chưa làm xong". */
    if (!G.SUP_THANG || !G.SUP_THANG.length) {
      return U.ph({eyebrow: 'GITA SUPREME', ic: 'shield', t: 'Bản đồ và trần',
        lead: 'Màn này đọc kho nghiên cứu của chủ hệ, và kho ấy nằm trong gói nghề.'}) +
        '<div class="card"><p>Vai đang dùng chưa được cấp gói nghề, nên bốn ngăn ' +
        'của màn này không có dữ liệu để dựng. Đây không phải một chỗ chưa làm ' +
        'xong — đây là phạm vi cấp phép đang chạy đúng.</p>' +
        '<p class="note">Thứ nằm trong màn này là bản đồ một tài liệu nghiên cứu ' +
        'nội bộ: bảng chỗ va giữa bản đặc tả mới với luật đã chốt, ma trận hai mươi ' +
        'tám năng lực, mười lớp điểm chạm, và tiến độ một trăm phần. Nó phục vụ ' +
        'người DỰNG hệ, không phải người DÙNG hệ — nên nó ở gói nghề là đúng chỗ.</p>' +
        '<p class="note">Lời hứa với gia đình nằm ở màn <b>Luật giao diện</b>: ' +
        'mười hai luật ấy đọc được với mọi vai, vì chúng là lời hứa VỚI gia đình ' +
        'chứ không phải mã nguồn của hệ.</p></div>';
    }

    var o = U.ph({eyebrow: 'GITA SUPREME · QUYỂN I–III', ic: 'shield', grad: 1,
      t: 'Bản đồ và trần',
      lead: 'Bản đặc tả 410.000 ký tự không mô tả một màn hình — nó mô tả một mạng ' +
        'xã hội. Nên dựng CÁI TRẦN trước, lần thứ tư trong kho này. Ngăn đầu không ' +
        'phải chỗ va mà là bẫy tên gọi: một luật bị phạm thì có người cãi, hai thang ' +
        'cùng tên thì không ai cãi — chúng chỉ lặng lẽ được đọc như một.'});

    o += '<div class="row wrap mb" style="gap:8px">' + NGAN.map(function (n) {
      var on = G.supNgan === n.ma;
      return '<button class="btn' + (on ? ' pri' : '') +
        '" onclick="G.supMoNgan(\'' + n.ma + '\')">' +
        ic(n.ic, 'w-3 h-3') + ' ' + h(n.ten) + '</button>';
    }).join('') + '</div>';

    o += (VE[G.supNgan] || veTen)();
    return o;
  };
})();
