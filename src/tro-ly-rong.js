/* ═══════════════════════════════════════════════════════════════
   GITA 365 · v9.72 — MỞ KHO CHO TRỢ LÝ TRA

   ĐO ĐƯỢC GÌ TRƯỚC KHI SỬA

   Đưa hai mươi câu hỏi thật vào trợ lý và đếm xem nó trúng mấy câu:
   TRÚNG 1 / 20.

   Nó KHÔNG im lặng ở mười chín câu còn lại — nó vẫn trả về mười hai
   tư liệu, lấy từ năm kho cũ, gần giống mà sai. Đó là kiểu hỏng tệ
   hơn im lặng: im lặng thì người ta đi tra chỗ khác, còn trả lời sai
   thì người ta tin.

   Nguyên nhân: hàm nguon() trong src/tro-ly-ai.js liệt kê đúng NĂM
   kho — mô thức, phác đồ, kịch bản, tình huống, bài học — trong tổng
   hơn tám trăm kho của hệ. Mọi thứ dựng từ 9.65 tới 9.71 nằm ngoài
   tầm với của trợ lý.

   KHOÁ Ở CHỖ TRA, KHÔNG Ở CHỖ HIỆN KẾT QUẢ

   Mỗi nguồn thêm khai QUYỀN của nó. nguon() lọc bằng G.can() TRƯỚC
   khi tra, nên kho nghề không bao giờ vào vòng chấm điểm của một
   người không có quyền — chứ không phải chấm xong rồi giấu kết quả.

   Đây là đúng luật đã sai ba lần trong kho này: lọc trên màn hình
   không phải bảo vệ dữ liệu.

   trSoiRoRi() đăng nhập-độc-lập không làm được, nên nó canh chiều
   khác: mọi nguồn thêm phải khai quyền, và quyền ấy phải có thật
   trong G.PERM. Thiếu một trong hai thì đỏ.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;

(function () {
  /* Mỗi nguồn: kho nào, gọi tên bằng chữ gì trong câu hỏi, lấy mã và
     tên ra sao, và những trường nào đem đi so.

     Ô goiTen là chỗ đắt: nó cho người hỏi gọi thẳng tên loại tư liệu
     và được ưu tiên. "Bảy cửa trước khi KÝ KẾT" thì phải ra kho ký
     kết, không ra một kịch bản trùng vài từ. */
  /* Phần lớn nguồn trỏ THẲNG vào một kho: kho là một mảng bản ghi, và
     tra thẳng trên nó. Nhưng vài kho khai theo hình khác — TC_DIEULE là
     một VẬT có ô .dieu, TC_QUYCHE mỗi dòng ôm một mảng điều con — nên
     chúng cần một lượt dựng lại thành mảng phẳng để tra.

     Ô lay() dựng cái mảng ấy LÚC TRA, không chép nó vào kho: chép vào
     kho là hai bản của cùng một sự thật, và bản thứ hai nằm trong tệp
     đã mã hoá nên không ai thấy nó lệch. */
  function danhSach(o) { return o.lay ? o.lay() : G[o.kho]; }
  function on(o) {
    var d = danhSach(o);
    return Array.isArray(d) ? d.length > 0 : (d !== undefined && d !== null);
  }

  /* ── VĂN BẢN PHÒNG TÀI CHÍNH (9.99.4) ──

     Năm kho văn bản của phòng: điều lệ, quy chế, quy trình, biểu mẫu,
     sổ rủi ro. Trước bản này trợ lý không tra được câu nào trong đó —
     hỏi "chia nhỏ khoản chi thì sao" thì nó trả về một kịch bản tư vấn
     phụ huynh trùng vài từ, tức là kiểu hỏng tệ hơn im lặng.

     AI TRA ĐƯỢC, VÀ AI KHÔNG — NÓI THẲNG:

     Quyền fin_view mở tới bậc 4, nên trợ lý tra được cho Super Admin,
     Admin hệ thống, Giám đốc và Quản lý chuyên môn — và cho kế toán
     trưởng, vì kế toán trưởng là vai R04.

     KẾ TOÁN THU và KẾ TOÁN CHI là vai R08, nên KHÔNG tra được qua trợ
     lý. Đó không phải chỗ quên: G.can() chấm theo VAI, mà phòng tài
     chính là một trục riêng vuông góc với thang vai — cùng cái vướng
     đã buộc phòng này phải có trục riêng ngay từ đầu. Họ đọc đủ năm
     kho ấy ở ngăn "Quy chế" của màn Phòng Kế toán – Tài chính, vốn mở
     theo VỊ TRÍ. Mở thêm bằng cách hạ quyền xuống bậc 8 thì Giáo viên
     và Mentor cũng đọc được điều lệ tài chính, và đó là cái giá đắt
     hơn nhiều so với việc kế toán chi phải bấm sang một ngăn khác. */
  var VB_TC = [
    { kho: 'TC_DIEULE', loai: 'Điều lệ tài chính', mau: '#0B7350',
      go: 'phong-tai-chinh', quyen: 'fin_view',
      goiTen: ['dieu le tai chinh', 'dieu le phong ke toan', 'dieu may', 'quy dinh tai chinh'],
      ma: 'ma', ten: 'ten', than: ['ten', 'noi', 'vi'],
      lay: function () {
        return ((G.TC_DIEULE || {}).dieu || []).map(function (d) {
          return {ma: 'Điều ' + d.so, ten: d.ten, noi: d.noi, vi: d.vi || ''};
        });
      } },
    { kho: 'TC_QUYCHE', loai: 'Quy chế tài chính', mau: '#0B7350',
      go: 'phong-tai-chinh', quyen: 'fin_view',
      goiTen: ['quy che thu', 'quy che chi', 'quy che luong', 'quy che hoa hong', 'quy che tai chinh'],
      ma: 'ma', ten: 'ten', than: ['ten', 'phamVi', 'dieu'],
      lay: function () {
        return (G.TC_QUYCHE || []).map(function (q) {
          return {ma: q.ma, ten: q.ten, phamVi: q.pham_vi || '',
            dieu: (q.dieu || []).join(' ')};
        });
      } },
    { kho: 'TC_QUYTRINH', loai: 'Quy trình tài chính', mau: '#0B7350',
      go: 'phong-tai-chinh', quyen: 'fin_view',
      goiTen: ['quy trinh thu', 'quy trinh chi', 'quy trinh duyet', 'may buoc'],
      ma: 'ma', ten: 'ten', than: ['ten', 'buoc'],
      lay: function () {
        return (G.TC_QUYTRINH || []).map(function (q) {
          return {ma: q.ma, ten: q.ten,
            buoc: (q.buoc || []).map(function (b) {
              return b.b + '. ' + b.ai + ': ' + b.lam +
                (b.dieuKien ? ' (' + b.dieuKien + ')' : '');
            }).join(' · ')};
        });
      } },
    { kho: 'TC_BIEUMAU', loai: 'Biểu mẫu tài chính', mau: '#0B7350',
      go: 'phong-tai-chinh', quyen: 'fin_view',
      goiTen: ['bieu mau', 'phieu thu can gi', 'phieu chi can gi', 'truong bat buoc'],
      ma: 'ma', ten: 'ten', than: ['ten', 'chungTu', 'batBuoc'],
      lay: function () {
        return (G.TC_BIEUMAU || []).map(function (b) {
          return {ma: b.ma, ten: b.ten, chungTu: b.chungTu || '',
            batBuoc: (b.batBuoc || []).join(', ')};
        });
      } },
    /* Sổ rủi ro là kho đáng tra nhất của cả năm: người hỏi "chia nhỏ
       khoản chi thì sao" đang đứng đúng ở TC-RR-02, và câu trả lời họ
       cần là chỗ ĐÃ CANH cùng phần CÒN LẠI sau khi canh. */
    { kho: 'TC_RUIRO', loai: 'Rủi ro tài chính', mau: '#BE0E16',
      go: 'phong-tai-chinh', quyen: 'fin_view',
      goiTen: ['rui ro tai chinh', 'chia nho khoan chi', 'thong dong', 'that thoat', 'so rui ro'],
      ma: 'ma', ten: 'ten', than: ['ten', 'chan', 'con', 'ai'],
      lay: function () {
        return (G.TC_RUIRO || []).map(function (r) {
          return {ma: r.ma, ten: r.ten, chan: r.chan || '', con: r.con || '',
            ai: r.ai || ''};
        });
      } }
  ];

  var THEM = VB_TC.concat([
    /* ── Thang độ khó của một ca (9.74) ──
       DOKHO_CAP và DOKHO_DAU ở gói NỀN nên KHÔNG khai quyền: gia
       đình phải tra được vì sao trợ lý dừng lại. Bốn kho định tuyến
       thì ở gói NGHỀ và khai quyền nghề. */
    { kho: 'DOKHO_CAP', loai: 'Độ khó của ca', mau: '#BE0E16', khongCoMan: 'Từ 9.75 bản soạn hiện nội dung ngay trong khung trò chuyện, nên nguồn này không cần màn riêng.',
      goiTen: ['do kho', 'cap do', 'cap 1', 'cap 10', 'muoi cap', 'thang do kho'],
      ma: 'ma', ten: 'ten', than: ['ten', 'mo', 'viDu', 'vi', 'nhip'] },
    { kho: 'DOKHO_DAU', loai: 'Dấu hiệu độ khó', mau: '#BE0E16', khongCoMan: 'Từ 9.75 bản soạn hiện nội dung ngay trong khung trò chuyện, nên nguồn này không cần màn riêng.',
      goiTen: ['dau hieu', 'vi sao dung lai', 'vi sao phai cho'],
      ma: 'ma', ten: 'ten', than: ['ten', 'vi'] },
    { kho: 'DOKHO_TUYEN', loai: 'Ai xác nhận', mau: '#BE0E16', khongCoMan: 'Từ 9.75 bản soạn hiện nội dung ngay trong khung trò chuyện, nên nguồn này không cần màn riêng.',
      quyen: 'nghe_chung', goiTen: ['ai xac nhan', 'bat khoa', 'khoa xu ly', 'ai duyet'],
      ma: 'ma', ten: 'ten', than: ['ten', 'vi', 'tuXK'] },
    { kho: 'DOKHO_CAM', loai: 'Khoá mở rồi vẫn cấm', mau: '#BE0E16', khongCoMan: 'Từ 9.75 bản soạn hiện nội dung ngay trong khung trò chuyện, nên nguồn này không cần màn riêng.',
      quyen: 'nghe_chung', goiTen: ['mo khoa van cam', 'bat roi van khong duoc'],
      ma: 'ma', ten: 'viec', than: ['viec', 'vi', 'tuLuat'] },
    /* ── Nghề: bản vẽ, bàn làm việc, ngôn ngữ ── */
    { kho: 'BV_VAI', loai: 'Trần vai', mau: '#5140B4', go: 'ban-ve',
      quyen: 'nghe_chung', goiTen: ['tran vai', 'phu trach toi da', 'ban ve'],
      ma: 'ten', ten: 'ten', than: ['ten', 'tran', 'gioiHanTuyetDoi'] },
    { kho: 'BLV_NGAN', loai: 'Bàn Coach', mau: '#5140B4', go: 'ban-coach',
      quyen: 'pro_coach', goiTen: ['ban coach', 'ban lam viec', 'ngan'],
      ma: 'ma', ten: 'ten', than: ['ten', 'laGi', 'vet'] },
    { kho: 'NN_CAM', loai: 'Câu cấm', mau: '#BE0E16', go: 'chuan-ngon-ngu',
      quyen: 'pro_coach', goiTen: ['cau cam', 'chuan ngon ngu', 'khong duoc noi'],
      ma: 'ma', ten: 'ten', than: ['ten', 'vi', 'thay'] },

    /* ── Hành lang và rà soát hệ ── */
    { kho: 'HL_VIRUS', loai: 'Virus', mau: '#BE0E16', go: 'hanh-lang',
      quyen: 'pro_coach', goiTen: ['virus', 'vac xin', 'hanh lang'],
      ma: 'ma', ten: 'ten', than: ['ten', 'trieuChung', 'duongLay', 'vacXin'] },
    { kho: 'HL_LUAT12', loai: 'Luật hành lang', mau: '#B4720F', go: 'hanh-lang',
      quyen: 'pro_coach', goiTen: ['muoi hai luat', 'luat hanh lang'],
      ma: 'ma', ten: 'luat', than: ['luat', 'hanhVi', 'viPham'] },
    { kho: 'HL_SAUNHIP', loai: 'Sáu Nhịp', mau: '#0B6675', go: 'hanh-lang',
      quyen: 'pro_coach', goiTen: ['sau nhip'],
      ma: 'ma', ten: 'ten', than: ['ten', 'laGi', 'lam'] },
    { kho: 'HL_KHOA9', loai: 'Khoá hệ', mau: '#185AB4', go: 'hanh-lang',
      quyen: 'pro_coach', goiTen: ['khoa he', 'chin khoa', 'bat bien'],
      ma: 'ma', ten: 'ten', than: ['ten', 'chan', 'coChe'] },
    { kho: 'RS_CHAN', loai: 'Lỗi chặn', mau: '#BE0E16', go: 'ra-soat-loi',
      quyen: 'pro_coach', goiTen: ['loi chan', 'ra soat loi', 'diem gay'],
      ma: 'ma', ten: 'loi', than: ['loi', 'hauQua', 'xuLy', 'noiUngDung'] },

    /* ── Pháp lý ── */
    { kho: 'RSP_CHAN', loai: 'Phát hiện pháp lý', mau: '#BE0E16', go: 'ra-soat-phap-ly',
      quyen: 'pro_coach', goiTen: ['phap ly', 'phat hien', 'nghiem trong'],
      ma: 'ma', ten: 'ten', than: ['ten', 'rui', 'noiUngDung', 'lamGi'] },
    { kho: 'RSP_LECH', loai: 'Chỗ lệch', mau: '#B4720F', go: 'ra-soat-phap-ly',
      quyen: 'pro_coach', goiTen: ['cho lech', 'tai lieu noi khac'],
      ma: 'ma', ten: 'ten', than: ['ten', 'taiLieuNoi', 'ungDungLam', 'huongDeXuat'] },
    { kho: 'BCD_THAOTAC', loai: 'Bằng chứng', mau: '#0B6675', go: 'bang-chung',
      quyen: 'pro_coach', goiTen: ['bang chung', 'thao tac sinh bang chung'],
      ma: 'ma', ten: 'ten', than: ['ten', 'phaiCo', 'giu'] },
    { kho: 'BCD_TINHCHAT', loai: 'Tính chất bằng chứng', mau: '#0B6675', go: 'bang-chung',
      quyen: 'pro_coach', goiTen: ['tinh chat', 'chuan bang chung'],
      ma: 'ma', ten: 'ten', than: ['ten', 'loi', 'viLaDau'] },

    /* ── Hợp đồng và ký kết ── */
    { kho: 'HSH_HD', loai: 'Hợp đồng', mau: '#185AB4', go: 'ho-so-hop-dong',
      quyen: 'pro_coach', goiTen: ['hop dong', 'ho so hop dong'],
      ma: 'ma', ten: 'ten', than: ['ten', 'dich', 'ben', 'han'] },
    { kho: 'HSH_DK', loai: 'Điều khoản', mau: '#185AB4', go: 'ho-so-hop-dong',
      quyen: 'pro_coach', goiTen: ['dieu khoan', 'dk'],
      ma: 'ma', ten: 'ten', than: ['ten', 'batBuoc', 'ghi'] },
    { kho: 'HSH_KY', loai: 'Cấp chữ ký', mau: '#B4720F', go: 'ho-so-hop-dong',
      quyen: 'pro_coach', goiTen: ['chu ky', 'cap chu ky', 'ky so'],
      ma: 'ma', ten: 'ten', than: ['ten', 'hinh', 'dung', 'gia'] },
    { kho: 'HSH_BAC', loai: 'Bậc lương', mau: '#0B7350', go: 'ho-so-hop-dong',
      quyen: 'pro_coach', goiTen: ['bac luong', 'chin bac', 'thu nhap'],
      ma: 'ma', ten: 'ten', than: ['ten', 'nangLuc', 'thuNhap', 'bienDoi'] },
    { kho: 'KK_CUA', loai: 'Cửa ký kết', mau: '#BE0E16', go: 'ky-ket',
      quyen: 'pro_coach', goiTen: ['ky ket', 'truoc khi ky', 'bay cua'],
      ma: 'so', ten: 'cua', than: ['cua', 'hoi', 'khongQua'] },

    /* ── Quản trị và vận hành ── */
    { kho: 'STA_NHIP', loai: 'Nhịp quản trị', mau: '#185AB4', go: 'so-tay-admin',
      quyen: 'qt_trang', goiTen: ['nhip', 'moi ngay', 'so tay', 'super admin'],
      ma: 'nhip', ten: 'nhip', than: ['nhip', 'gio'] },
    { kho: 'STA_XUONGSONG', loai: 'Màn quản trị', mau: '#BE0E16', go: 'so-tay-admin',
      quyen: 'qt_trang', goiTen: ['man quan tri', 'xuong song', 'nut nguy'],
      ma: 'man', ten: 'ten', than: ['ten', 'mo', 'docTruoc', 'nutNguy', 'daSai'] },
    { kho: 'BTN_NGAN', loai: 'Ngăn bảng tin', mau: '#0B6675', go: 'tin-noi-bo',
      quyen: 'nghe_chung', goiTen: ['bang tin noi bo', 'ngan bang tin'],
      ma: 'ma', ten: 'ten', than: ['ten', 'laGi', 'aiThay', 'lay'] },
    { kho: 'BTN_VINHDANH', loai: 'Vinh danh', mau: '#5140B4', go: 'tin-noi-bo',
      quyen: 'nghe_chung', goiTen: ['vinh danh', 'ghi nhan', 'thuong ky'],
      ma: 'ma', ten: 'ten', than: ['ten', 'canCu', 'doTuDau', 'khongDungLam'] },
    { kho: 'TDH_HE', loai: 'Việc hệ thống', mau: '#0B6675', go: 'tu-dong',
      quyen: 'nghe_chung', goiTen: ['tu dong', 'tu dong hoa', 'may chay'],
      ma: 'ma', ten: 'ten', than: ['ten', 'kich', 'may', 'nguoi', 'neuHong'] },
    { kho: 'TDH_CHAN', loai: 'Máy không được nhận', mau: '#BE0E16', go: 'tu-dong',
      quyen: 'nghe_chung', goiTen: ['may khong duoc', 'cam may', 'chi nguoi'],
      ma: 'ma', ten: 'viec', than: ['viec', 'vi', 'tuLuat'] },

    /* ── Quyền của gia đình: mở cho MỌI vai, vì đây là thứ nhà mình
         phải đọc được. Không khai ô quyen nghĩa là không lọc. ── */
    { kho: 'PL_QUYEN', loai: 'Quyền của nhà mình', mau: '#0B7350', go: 'phap-ly',
      goiTen: ['quyen', 'bay quyen', 'quyen cua nha'],
      ma: 'ma', ten: 't', than: ['t', 'la', 'demBang'] },
    { kho: 'PL_CO', loai: 'Cơ chế dùng quyền', mau: '#0B7350', go: 'phap-ly',
      goiTen: ['lam the nao', 'xin xoa', 'khieu nai', 'co che'],
      ma: 'ma', ten: 'lam', than: ['lam', 'ai', 'han', 'khong'] }
  ]);

  /* TỆP NÀY NẰM Ở GÓI CHUNG, KHÔNG Ở GÓI NGHỀ — VÀ ĐÓ LÀ CỐ Ý

     Bản đầu tôi khai nó vào cả hai danh sách, nên nó chỉ vào gói
     nghề. Đo lại thì thấy: phụ huynh, học viên và cộng tác viên
     KHÔNG rò một dòng kho nghề nào — đúng ý — nhưng họ cũng mất
     luôn hai nguồn đáng lẽ mở cho họ: bảy quyền của gia đình, và
     cơ chế dùng từng quyền ấy.

     Nhà mình phải hỏi được về quyền của chính mình. Nên tệp về gói
     chung, và việc chặn giao cho HAI lớp đã có:

       lớp 1 · kho nghề nằm trong gói .enc mà máy khách hàng không
               nhận được — không có dữ liệu thì không tra được gì
       lớp 2 · nguon() lọc bằng G.can(quyen) TRƯỚC khi tra

     Hai lớp ấy độc lập nhau. Mất một lớp thì lớp kia vẫn giữ.

     DỰNG LẠI MỖI LẦN TRA, KHÔNG DỰNG MỘT LẦN LÚC TẢI TỆP

     Bản đầu gán G.AI_NGUON_THEM một lần ngay khi tệp chạy, và kết
     quả đo KHÔNG nhúc nhích: vẫn 2 trên 20.

     Lý do là luật số hai của kho này: KHO NẠP SAU KHI ĐĂNG NHẬP. Lúc
     tệp vừa tải thì G.HL_VIRUS, G.HSH_HD, G.KK_CUA đều chưa tồn tại,
     nên bộ lọc "kho đã nạp chưa" gạt sạch hai mươi lăm nguồn và trợ
     lý vẫn chỉ có năm kho cũ.

     Nên hàm này dựng lại mỗi lần được gọi. Tốn thêm vài mi-li-giây
     một lượt hỏi, đổi lấy việc nó luôn đúng với thứ đang nạp. */
  G.aiNguonThem = function () { return DUNG(); };

  function DUNG() { return THEM.filter(on).map(function (o) {
    return {
      kho: danhSach(o), ten_kho: o.kho, loai: o.loai, mau: o.mau, go: o.go,
      /* Chuyển cả lời khai "nguồn này không có màn". Quên ô này thì
         phép soi thấy go rỗng, không thấy lời khai, và báo đỏ một
         nguồn hoàn toàn lành. */
      khongCoMan: o.khongCoMan || '',
      quyen: o.quyen || '', goiTen: o.goiTen || [],
      ma: function (x) { return String(x[o.ma] || ''); },
      ten: function (x) { return String(x[o.ten] || ''); },
      than: function (x) {
        return o.than.map(function (k) { return String(x[k] || ''); });
      }
    };
  }); }

  /* ═══════ KHOÁ: MỌI NGUỒN NGHỀ PHẢI KHAI QUYỀN CÓ THẬT ═══════

     Không đăng nhập-độc-lập được trong cùng một trang, nên phép này
     canh chiều khác: nguồn nào trỏ vào kho của gói nghề thì BẮT BUỘC
     khai quyền, và quyền ấy phải có thật trong G.PERM.

     Gõ nhầm tên quyền là chỗ hỏng im lặng nhất: G.can() trả về false
     cho quyền không tồn tại, nên nguồn ấy biến mất khỏi mọi vai —
     kể cả vai đáng lẽ được tra. Trợ lý im về cả một mảng kho mà
     không ai biết. */
  G.trSoiRoRi = function () {
    var ds = G.aiNguonThem(), loi = [];
    if (!ds.length) return { chuaDo: true, thieu: 'AI_NGUON_THEM', loi: [] };

    var khoNghe = {};
    (G.THUOC_CAP_PHEP || []).forEach(function (k) { khoNghe[k] = 1; });
    if (!Object.keys(khoNghe).length)
      return { chuaDo: true, thieu: 'THUOC_CAP_PHEP', loi: [] };

    var moVai = [];
    ds.forEach(function (n) {
      if (!n.loai) loi.push(n.ten_kho + ' thiếu ô loai');
      if (!(n.goiTen || []).length)
        loi.push(n.ten_kho + ' không khai ô goiTen — người hỏi không gọi thẳng tên nó được');

      /* ── NGUỒN KHÔNG CÓ MÀN LÀ HỢP LỆ TỪ 9.75 ──
         Phép này dựng khi mọi nguồn đều phải mở được một màn. Từ 9.75
         bản soạn hiện nội dung NGAY trong khung trò chuyện, nên một
         nguồn không cần màn riêng nữa.

         Nhưng "không có màn" phải được KHAI RA, không được để ô trống:
         ô trống thì không phân biệt được "cố ý không có" với "quên
         điền", và bốn nguồn DOKHO_ ở 9.76 đã báo đỏ đúng vì để trống. */
      if (n.khongCoMan) {
        if (String(n.khongCoMan).length < 20)
          loi.push(n.ten_kho + ' khai không có màn mà không nói vì sao');
        if (n.go) loi.push(n.ten_kho + ' vừa khai không có màn vừa trỏ vào màn "' + n.go + '"');
      } else if (!n.go) {
        loi.push(n.ten_kho + ' thiếu ô go, mà cũng không khai khongCoMan');
      } else if (typeof (G.VIEWS || {})[n.go] !== 'function') {
        loi.push(n.ten_kho + ' trỏ vào màn "' + n.go + '" — màn ấy không có thật');
      }

      /* ── KHO NÀO PHẢI KHAI QUYỀN ──
         THUOC_CAP_PHEP là danh sách kho BỊ XOÁ KHI ĐĂNG XUẤT, không
         phải danh sách kho CỦA NGHỀ. Hai thứ ấy trùng nhau phần lớn
         nhưng không phải tất cả: PL_QUYEN và PL_CO nằm trong đó mà cố
         ý mở cho gia đình — bảy quyền của nhà và cơ chế khiếu nại là
         thứ nhà mình phải đọc được.

         Nên chỗ đối chiếu đúng là TL_KHACH_XEM: danh sách khai rõ kho
         nào khách được tra, dựng ở 9.73. Kho có tên ở đó thì không
         phải khai quyền; kho không có tên thì phải. */
      var choKhach = (G.TL_KHACH_XEM || []).indexOf(n.ten_kho) >= 0;
      if (khoNghe[n.ten_kho] && !n.quyen && !choKhach)
        loi.push(n.ten_kho + ' thuộc gói cấp phép, KHÔNG khai quyền, và cũng không có tên ' +
          'trong TL_KHACH_XEM — mọi vai tra được mà không ai cố ý mở');
      if (n.quyen && typeof (G.PERM || {})[n.quyen] !== 'number')
        loi.push(n.ten_kho + ' khai quyền "' + n.quyen + '" — quyền ấy không có trong G.PERM, ' +
          'nên nguồn này biến mất khỏi MỌI vai, kể cả vai đáng lẽ được tra');
      if (!n.quyen) moVai.push(n.ten_kho);
    });

    /* Phải còn ít nhất một nguồn mở cho mọi vai — bảy quyền của gia
       đình là thứ nhà mình phải hỏi được. Không còn cái nào thì trợ
       lý của khách hàng chỉ còn năm kho cũ, y như trước 9.72. */
    if (!moVai.length)
      loi.push('không nguồn thêm nào mở cho mọi vai — trợ lý của khách hàng lại chỉ còn ' +
        'năm kho cũ');
    return { chuaDo: false, loi: loi, so: ds.length, moVai: moVai.length,
      khoaNghe: ds.length - moVai.length };
  };
})();
