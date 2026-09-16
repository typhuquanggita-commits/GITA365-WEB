/* ═══════════════════════════════════════════════════════════════
   GITA 365 · v9.75 — SOẠN CÂU TRẢ LỜI, THAY VÌ ĐỔ RA MƯỜI HAI THẺ

   VẤN ĐỀ

   Từ 9.73 trợ lý tra đúng kho trong 833 kho. Nhưng thứ nó đưa ra vẫn
   là MƯỜI HAI THẺ TƯ LIỆU xếp theo điểm.

   Hỏi "có bao nhiêu hợp đồng trong bộ hồ sơ" thì nhận về mười hai thẻ
   hợp đồng — và người hỏi phải tự đếm. Câu trả lời đúng là MỘT CON SỐ,
   và con số ấy máy đếm được trong một phần nghìn giây.

   Hỏi "bảy cửa trước khi ký kết là gì" thì nhận mười hai thẻ, trong
   đó bảy cái là bảy cửa và năm cái là thứ khác. Câu trả lời đúng là
   BẢY DÒNG, đúng thứ tự.

   Đó là khoảng cách giữa "tìm được" và "trả lời được".

   LUẬT CỨNG CỦA PHẦN NÀY: KHÔNG MỘT CHỮ NÀO SINH RA Ở ĐÂY

   Mọi câu chữ trong bản soạn phải TRUY NGƯỢC được về một dòng trong
   kho. Khung câu là mẫu cố định; ruột là giá trị đọc từ kho; mỗi dòng
   mang theo mã bản ghi để tra lại.

   Đây chính là định nghĩa cấp 3 trong DOKHO_CAP — "bỏ nguồn ra thì
   câu trả lời không còn gì". Bộ soạn CHỈ chạy ở cấp 1-3; từ cấp 4 trở
   lên nó không được gọi, vì lúc ấy việc cần làm là CHỌN chứ không
   phải chép, và chọn thì có người chịu trách nhiệm.

   SÁU Ý CÂU HỎI

     ĐẾM      "có bao nhiêu / mấy"        → một con số, đếm thật
     LIỆT KÊ  "gồm những gì / những nào"  → danh sách đủ, đúng thứ tự
     MÃ       câu gọi thẳng DK16, HĐ-09   → mở đúng bản ghi ấy ra
     LÀ GÌ    "là gì / nghĩa là"          → tên + phần ruột chính
     CÁCH LÀM "làm thế nào / các bước"    → các bước theo thứ tự kho
     TÓM      còn lại                     → một đoạn ngắn + thẻ như cũ
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;

(function () {

function boDau(s) {
  return String(s == null ? '' : s).toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd').replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ').trim();
}

/* ═══════ ĐỌC Ý CÂU HỎI ═══════

   Thứ tự soát QUAN TRỌNG và không tuỳ tiện: cái nào HẸP hơn thì soát
   trước. "Điều khoản DK16 gồm những gì" vừa gọi mã vừa xin liệt kê —
   mã hẹp hơn, nên mã thắng. Đảo lại thì nó liệt kê cả kho điều khoản
   trong khi người ta hỏi đúng một điều. */
var Y = [
  { ma: 'MA',      /* nhận bằng regex trên câu gốc, không bằng chữ */ },
  /* "CÓ bao nhiêu X" là ĐẾM; "X LÀ bao nhiêu" là hỏi GIÁ TRỊ. Hai
     câu chỉ khác nhau một chữ mà đòi hai câu trả lời khác hẳn: một
     bên là số mục, một bên là con số ghi trong kho. Đo được ngay:
     "trần hoa hồng của đại sứ là bao nhiêu" ra "có 4 mục trong kho
     hoa hồng" — đúng về số mục và vô dụng với người hỏi. */
  { ma: 'GIATRI',  tu: ['la bao nhieu', 'bao nhieu tien', 'bao nhieu phan tram',
                        'bao nhieu phut', 'bao nhieu ngay', 'gia bao nhieu',
                        'muc bao nhieu', 'tran bao nhieu'] },
  { ma: 'DEM',     tu: ['co bao nhieu', 'bao nhieu', 'may cai', 'gom may', 'co may',
                        'so luong', 'dem duoc', 'tat ca may'] },
  /* LIỆT KÊ dò bằng MẪU chứ không bằng chuỗi liền: giữa "những" và
     "gì" người ta hay chèn một danh từ — "những VIỆC gì", "những
     ĐIỀU nào", "gồm những BƯỚC nào". Bản đầu kê chuỗi liền nên câu
     "máy không được nhận những việc gì" rơi về TÓM và trả về đúng
     MỘT trong năm điều cấm. Trả lời thiếu bốn phần năm mà trông vẫn
     như một câu trả lời đầy đủ. */
  { ma: 'LIETKE',  re: /nhung(\s+\S+){0,2}\s+(gi|nao)\b|gom nhung|ke ten|liet ke|danh sach|gom gi|la nhung|co nhung|nhung nao/ },
  { ma: 'CACHLAM', tu: ['lam the nao', 'lam sao', 'cac buoc', 'quy trinh', 'trinh tu',
                        'thu tu lam', 'bat dau tu dau', 'huong dan'] },
  { ma: 'LAGI',    tu: ['la gi', 'nghia la', 'hieu the nao', 'noi gi', 'the nao la',
                        'dinh nghia', 'ra sao'] }
];

/* Hai hình mã, cố ý tách:
     · hai chữ cái trở lên thì cho phép dấu nối hoặc DẤU CÁCH — "DK 16"
     · một chữ cái thì KHÔNG cho dấu cách, chỉ "L12" hay "T-3"
   Cho một chữ cái đi kèm dấu cách thì "tôi có 3 con" thành mã "CO 3",
   và mọi câu có một con số biến thành câu tra mã. */
var RE_MA = /\b([A-ZĐ]{2,6}[-_ ]?\d{1,3}|[A-ZĐ][-_]?\d{1,3})\b/;

/* Con số viết bằng chữ. Cùng bảng với soTrongCau() ở tro-ly-chi-muc,
   nhưng ở đây dùng cho việc khác: nhận ra câu hỏi ĐANG XIN MỘT DANH
   SÁCH dù không dùng chữ "gồm những gì".

   "Bảy cửa trước khi ký kết là gì" — chữ "là gì" nói đó là câu định
   nghĩa, nhưng chữ "bảy" nói đó là câu liệt kê. Chữ số đúng hơn: hỏi
   định nghĩa thì người ta không đếm trước. Đo được ngay lượt đầu:
   câu ấy ra một dòng lẻ của kho bảy cửa thay vì ra bảy dòng. */
var SO_TIENG = { mot: 1, hai: 2, ba: 3, bon: 4, tu: 4, nam: 5, sau: 6, bay: 7,
  tam: 8, chin: 9, muoi: 10, chuc: 10, lam: 5 };
function soTrongCau(cauHoi) {
  var t = boDau(cauHoi).split(' '), ra = {}, i;
  for (i = 0; i < t.length; i++) {
    if (/^\d{1,3}$/.test(t[i])) { ra[+t[i]] = 1; continue; }
    var a = SO_TIENG[t[i]];
    if (!a) continue;
    if (a === 10) { var b = SO_TIENG[t[i + 1]]; ra[b && b < 10 ? 10 + b : 10] = 1; }
    else if (SO_TIENG[t[i + 1]] === 10) {
      var c = SO_TIENG[t[i + 2]]; ra[a * 10 + (c && c < 10 ? c : 0)] = 1;
    } else ra[a] = 1;
  }
  return ra;
}
G.tlSoTrongCau = soTrongCau;

G.tlDocY = function (cauHoi, soBanGhiKho) {
  if (RE_MA.test(String(cauHoi || '').toUpperCase())) return 'MA';
  var chu = boDau(cauHoi);
  for (var i = 1; i < Y.length; i++) {
    var trung = Y[i].re ? Y[i].re.test(chu) : false;
    if (!trung) {
      for (var j = 0; j < (Y[i].tu || []).length; j++)
        if (chu.indexOf(Y[i].tu[j]) >= 0) { trung = true; break; }
    }
    {
      if (trung) {
        /* "là gì" mà câu có con số đúng bằng số bản ghi của kho thì
           đó là câu LIỆT KÊ, không phải câu định nghĩa. */
        if (Y[i].ma === 'LAGI' && soBanGhiKho && soTrongCau(chu)[soBanGhiKho])
          return 'LIETKE';
        return Y[i].ma;
      }
    }
  }
  /* Không có chữ nào báo ý, nhưng có con số khớp số bản ghi của kho:
     "Mười hai luật hành lang thành công" — không hỏi gì cả, mà rõ
     ràng đang xin mười hai dòng. */
  if (soBanGhiKho && soTrongCau(chu)[soBanGhiKho]) return 'LIETKE';
  return 'TOM';
};

/* ═══════ NHÃN TRƯỜNG ═══════
   Kho này dùng tên trường viết tắt rất nhiều — th, mo, pt, gp, chot.
   Bảng nhãn để bản soạn đọc ra tiếng người. Trường nào chưa có nhãn
   thì tách camelCase ra làm nhãn tạm, chứ KHÔNG giấu đi: giấu một
   trường là giấu một phần nội dung mà không ai biết là có. */
var NHAN = {
  ten: '', th: 'Biểu hiện', mo: 'Bối cảnh', pt: 'Phân tích', gp: 'Giải pháp',
  chot: 'Chốt', kpi: 'Đo bằng', vi: 'Vì sao', viDu: 'Ví dụ', nhip: 'Nhịp',
  laGi: 'Là gì', aiThay: 'Ai thấy', lay: 'Lấy từ', khongLam: 'Không làm',
  buoc: 'Bước', muc: 'Mục', tang: 'Tầng', nhom: 'Nhóm', tuLuat: 'Theo luật',
  nguyenNhan: 'Nguyên nhân', giaiPhap: 'Giải pháp', nguyenLy: 'Nguyên lý',
  apDung: 'Áp dụng', summary: 'Tóm', keywords: 'Từ khoá', title: '',
  khi: 'Khi nào', viec: 'Việc', guard: 'Chặn ở', kieu: 'Kiểu',
  phaiCoO: 'Phải có ở', chuaSoan: 'Chưa soạn', chan: 'Chặn',
  san: 'Cấp sàn', may: 'Máy tự làm', nguoi: 'Người phụ trách', gia: 'Giá trị'
};
var BO_TRUONG = /^(mau|color|icon|url|href|link|anh|img|src|go|view|man|css|class|c|ic|tu)$/;

function nhanCua(k) {
  if (Object.prototype.hasOwnProperty.call(NHAN, k)) return NHAN[k];
  return k.replace(/([a-z0-9])([A-Z])/g, '$1 $2')
          .replace(/^./, function (c) { return c.toUpperCase(); });
}

/* Các dòng nội dung của một bản ghi, đã bỏ trường không mang nghĩa. */
function dongCua(x, boQuaTen) {
  var ra = [];
  if (!x || typeof x !== 'object') return ra;
  Object.keys(x).forEach(function (k) {
    if (BO_TRUONG.test(k)) return;
    var v = x[k];
    if (v == null || v === '') return;
    if (typeof v === 'boolean') v = v ? 'có' : 'không';
    if (Array.isArray(v)) {
      v = v.filter(function (t) { return typeof t === 'string' || typeof t === 'number'; })
           .join(' · ');
      if (!v) return;
    }
    if (typeof v === 'object') {
      /* Vật con: mở một lớp. Kho hình vật như HOAHONG để mọi giá trị
         trong vật con, nên bỏ qua chúng là bản soạn trả về RỖNG —
         đúng chuyện đã xảy ra với câu "trần hoa hồng của đại sứ". */
      Object.keys(v).forEach(function (k2) {
        var v2 = v[k2];
        if (v2 == null || v2 === '' || typeof v2 === 'object') return;
        ra.push({ nhan: nhanCua(k) + ' · ' + nhanCua(k2), chu: String(v2) });
      });
      return;
    }
    v = String(v);
    if (boQuaTen && v === boQuaTen) return;
    if (/^#[0-9a-fA-F]{3,8}$/.test(v)) return;
    ra.push({ nhan: nhanCua(k), chu: v });
  });
  return ra;
}

/* ═══════ KHO THẮNG ═══════
   Kho nào đang trả lời câu này. Không lấy đơn thuần kho của kết quả
   đầu bảng: một kho có bốn bản ghi trong tám kết quả đầu thì nó đang
   trả lời, còn kho chiếm đúng một chỗ đầu thì có thể chỉ trùng chữ. */
function khoThang(kq) {
  var dem = {}, diem = {};
  kq.slice(0, 8).forEach(function (x, i) {
    dem[x.khoNguon] = (dem[x.khoNguon] || 0) + 1;
    diem[x.khoNguon] = (diem[x.khoNguon] || 0) + (x.diem || 0) * (i === 0 ? 1.6 : 1);
  });
  /* ── KHO THẮNG PHẢI CÓ MẶT TRONG BA KẾT QUẢ ĐẦU ──
     Bản đầu cộng điểm trên tám kết quả đầu và thưởng thêm cho kho
     nào chiếm nhiều chỗ. TAILIEU_DRIVE — 5.352 mẩu tài liệu — gom
     được nhiều chỗ ở giữa bảng nên nó THẮNG, trong khi kết quả đầu
     bảng là TDH_CHAN.

     Hậu quả: câu "máy không được nhận những việc gì" trả lời bằng
     "Tài liệu Học viện có 5.352 mục". Vừa sai vừa vô dụng, mà lại
     đúng cú pháp nên không có gì đỏ.

     Kho nào không lọt nổi ba kết quả đầu thì không phải kho đang
     trả lời câu này — nó chỉ đang trùng chữ ở nhiều chỗ. */
  var baDau = {};
  kq.slice(0, 3).forEach(function (x) { baDau[x.khoNguon] = 1; });
  var tot = '', cao = -1;
  Object.keys(diem).forEach(function (k) {
    if (!baDau[k]) return;
    var d = diem[k] * (1 + 0.25 * Math.min(dem[k] - 1, 3));
    if (d > cao) { cao = d; tot = k; }
  });
  return tot || (kq[0] ? kq[0].khoNguon : '');
}

/* Kho quá lớn thì LIỆT KÊ cả kho không còn là câu trả lời. Hai trăm
   năm mươi dòng đổ ra màn hình là đúng thứ mà bản soạn dựng lên để
   không có. ĐẾM thì vẫn có nghĩa — "có 250 tình huống" là một câu
   trả lời thật — nên trần này chỉ chặn nhánh liệt kê. */
var TRAN_LIETKE = 60;

/* Dưới mức này thì hiện đủ, không cắt — xem chú giải ở nhánh LIỆT KÊ. */
var DU_HIEN = 16;

/* Toàn bộ bản ghi của một kho mà người đang hỏi ĐƯỢC ĐỌC.
   Hai lớp lọc y như lúc tra: kho có được phép không, và từng bản ghi
   có trong tầng không. Bỏ một trong hai là bản soạn đi vòng qua đúng
   cái trần mà phần tra đang giữ. */
function banGhiDuocDoc(tenKho, tangNha, trongTang) {
  return G.tlBanGhiKho ? G.tlBanGhiKho(tenKho, tangNha, trongTang) : [];
}
/* Trần tầng dùng cho lượt soạn hiện tại. Phép phá đặt một hàm khác
   vào đây rồi trả về null — không tệp nào tráo G.aiTrongTang. */
var TRAN_THU = null;

/* TRỎ vào G.tlTenBanGhi ở src/tro-ly-chi-muc.js chứ không chép lại.
   Cả chỉ mục lẫn bộ soạn phải gọi một bản ghi bằng CÙNG MỘT TÊN —
   lệch nhau thì thẻ nguồn nói một đằng, dòng đã soạn nói một nẻo, và
   người đọc không biết tin cái nào. */
function tenBanGhi(x) {
  return G.tlTenBanGhi ? G.tlTenBanGhi(x) : '';
}
function maBanGhi(x, i, tenKho) {
  var uu = ['ma', 'id', 'key', 'code', 'ms'];
  for (var k = 0; k < uu.length; k++)
    if (x[uu[k]] != null && x[uu[k]] !== '') return String(x[uu[k]]);
  return tenKho + '#' + (i + 1);
}

/* Kho này có phải một quy trình không — đọc từ nhãn và tên kho, chứ
   không đoán từ hình dữ liệu. */
var RE_QUYTRINH = /(quy trinh|huong dan|cac buoc|lo trinh|trinh tu|hanh lang|nhip)/;
function laQuyTrinh(tenKho, loai) {
  if (/^(QT_|KK_|GT_BUOC|HL_QUYTRINH|QUYTRINH|ND_|BV_NHIP)/.test(tenKho)) return true;
  return RE_QUYTRINH.test(boDau(loai || ''));
}

/* ═══════ SOẠN ═══════ */
G.tlSoan = function (cauHoi, kq) {
  if (!kq || !kq.length) return null;
  var tang = kq.tangNha;
  var kho = khoThang(kq);
  if (!kho) return null;
  /* Đọc ý SAU khi biết kho thắng, vì phép nhận "câu có con số khớp
     số bản ghi" cần con số ấy. Đọc trước thì mất hẳn nhánh liệt kê. */
  var soKho = banGhiDuocDoc(kho, tang, TRAN_THU).length;
  var y = G.tlDocY(cauHoi, soKho);
  var nhanKho = kq.filter(function (x) { return x.khoNguon === kho; })[0];
  var loai = nhanKho ? nhanKho.loai : kho;

  /* ── MÃ: mở đúng bản ghi được gọi tên ── */
  if (y === 'MA') {
    var dau = kq[0];
    if (!dau || !dau.goc) return null;
    return {
      y: 'MA', kho: dau.khoNguon, loai: dau.loai,
      cau: dau.ma + ' — ' + dau.ten,
      dong: dongCua(dau.goc, dau.ten),
      nguon: [dau.ma]
    };
  }

  /* ── ĐẾM và LIỆT KÊ: đọc CẢ kho, không chỉ mười hai kết quả ──
     Đây là chỗ khác nhau lớn nhất. Kết quả tra bị cắt ở mười hai để
     màn hình đọc được; nhưng câu "có bao nhiêu" hỏi về CẢ kho, và
     đếm trên mười hai cái đã cắt thì ra một con số sai mà trông rất
     giống đúng. */
  if (y === 'DEM' || y === 'LIETKE') {
    var ds = banGhiDuocDoc(kho, tang, TRAN_THU);
    if (!ds.length) return null;
    var dong = ds.map(function (x) {
      return { nhan: x.ma, chu: x.ten || '(chưa có tên)' };
    }).filter(function (d) { return d.chu; });
    if (!dong.length) return null;

    if (y === 'LIETKE' && ds.length > TRAN_LIETKE) {
      /* Quá lớn để liệt kê: đổi sang liệt kê CHÍNH NHỮNG BẢN GHI ĐÃ
         TRÚNG, và nói thẳng đây là phần trúng chứ không phải cả kho.
         Nói nhầm chỗ này là hứa một danh sách đủ mà đưa một phần. */
      var tr = kq.filter(function (x) { return x.khoNguon === kho; }).slice(0, 12);
      if (!tr.length) return null;
      return { y: 'LIETKE_TRUNG', kho: kho, loai: loai, so: ds.length,
        cau: loai + ' có ' + ds.length + ' mục — đây là ' + tr.length + ' mục hợp nhất:',
        dong: tr.map(function (x) { return { nhan: x.ma, chu: x.ten }; }),
        conNua: 0, mocTruotHet: true,
        nguon: tr.map(function (x) { return x.ma; }) };
    }

    if (y === 'DEM')
      return { y: 'DEM', kho: kho, loai: loai, so: ds.length,
        cau: 'Có ' + ds.length + ' mục trong ' + loai + '.',
        dong: dong.slice(0, 12),
        conNua: Math.max(0, dong.length - 12),
        nguon: dong.slice(0, 12).map(function (d) { return d.nhan; }) };

    return { y: 'LIETKE', kho: kho, loai: loai, so: ds.length,
      cau: loai + ' có ' + ds.length + ' mục:',
      /* ── TRẦN HIỂN THỊ, VÀ VÌ SAO NÓ KHÔNG PHẢI MỘT CON SỐ ──
         Hai mươi dòng trên màn điện thoại là một bức tường, nên cắt ở
         mười hai. Nhưng cắt cứng ở mười hai thì kho mười sáu mục bị
         giấu mất bốn — và bộ đo bắt ngay: câu "bộ hồ sơ gồm những hợp
         đồng nào" mất luôn HĐ-16 Hợp đồng lao động.

         Giấu bốn trên mười sáu tệ hơn hiện thêm bốn dòng. Nên: danh
         sách vừa phải thì hiện ĐỦ, danh sách dài mới cắt. */
      dong: dong.slice(0, dong.length <= DU_HIEN ? dong.length : 12),
      conNua: dong.length <= DU_HIEN ? 0 : dong.length - 12,
      nguon: dong.slice(0, dong.length <= DU_HIEN ? dong.length : 12)
        .map(function (d) { return d.nhan; }) };
  }

  /* ── CÁCH LÀM: các bước theo đúng thứ tự trong kho ──
     KHÔNG sắp xếp lại. Thứ tự trong kho là thứ tự người soạn kho đã
     chọn, và với một quy trình thì thứ tự CHÍNH LÀ nội dung. */
  if (y === 'CACHLAM') {
    /* CHỈ kho thật sự là một QUY TRÌNH mới được đọc ra thành các bước.
       Bản đầu đọc mọi kho ra thành bước, và câu "ký hợp đồng lao động
       làm thế nào" trả về "Hồ sơ hợp đồng — 16 bước", trong khi
       HSH_HD là một DANH MỤC mười sáu hợp đồng, không phải mười sáu
       bước. Sai kiểu ấy tệ hơn không trả lời: người đọc làm theo.

       Không đoán từ dữ liệu — hình của một danh mục và hình của một
       quy trình giống hệt nhau (đều là mã tăng dần kèm tên). Nên đọc
       từ NHÃN: nhãn nói quy trình thì mới là quy trình. */
    var db = laQuyTrinh(kho, loai) ? banGhiDuocDoc(kho, tang, TRAN_THU) : [];
    if (db.length >= 2 && db.length <= 30) {
      var bd = db.map(function (x) {
        var g = x.goc || {};
        var them = g.mo || g.vi || g.gp || g.laGi || g.hoi || '';
        return { nhan: x.ma,
          chu: x.ten + (them && them !== x.ten ? ' — ' + String(them).slice(0, 160) : '') };
      }).filter(function (d) { return d.chu.trim(); });
      if (bd.length)
        return { y: 'CACHLAM', kho: kho, loai: loai, so: db.length,
          cau: loai + ' — ' + db.length + ' bước, theo đúng thứ tự trong kho:',
          dong: bd.slice(0, 20), conNua: Math.max(0, bd.length - 20),
          nguon: bd.slice(0, 20).map(function (d) { return d.nhan; }) };
    }
  }

  /* ── LÀ GÌ và TÓM: bản ghi đầu bảng, mở ruột ra ── */
  var d0 = kq[0];
  if (!d0 || !d0.goc) return null;
  var dg = dongCua(d0.goc, d0.ten);
  if (!dg.length) return null;
  return {
    y: (y === 'LAGI' || y === 'GIATRI') ? y : 'TOM',
    kho: d0.khoNguon, loai: d0.loai,
    cau: d0.ten,
    dong: dg.slice(0, 6), conNua: Math.max(0, dg.length - 6),
    nguon: [d0.ma]
  };
};

/* ═══════════════════════════════════════════════════════════════
   KHOÁ — BỐN ĐIỀU CHỨNG MINH BẰNG CÁCH CHẠY
   ═══════════════════════════════════════════════════════════════ */

/* 1 · Không một chữ nào sinh ra ở bộ soạn.
      Chứng minh bằng cách đối chiếu NGƯỢC: mọi đoạn chữ trong bản
      soạn phải tìm lại được trong chính kho nguồn. Bịa một câu thì
      không tìm lại được, và phép này đỏ. */
G.tsSoiKhongBia = function () {
  var loi = [], daDo = 0;
  var thu = ['Có bao nhiêu hợp đồng trong bộ hồ sơ',
             'Bảy cửa trước khi ký kết là gì',
             'Điều khoản DK16 nói gì',
             'Mười hai luật hành lang thành công'];
  thu.forEach(function (q) {
    var kq = G.aiTra(q);
    var s = G.tlSoan(q, kq);
    if (!s) { loi.push('"' + q.slice(0, 30) + '" không soạn được gì'); return; }
    daDo++;
    /* Dựng một chuỗi chứa TOÀN BỘ kho nguồn, rồi đòi mọi dòng nằm
       trong đó. Chậm nhưng chỉ chạy khi soi. */
    var kho = G[s.kho];
    var het = Array.isArray(kho) ? JSON.stringify(kho) : '';
    s.dong.forEach(function (d) {
      var c = String(d.chu).split(' — ')[0].trim();
      if (c.length < 8) return;                       /* quá ngắn thì không kết luận được */
      if (c.indexOf('(chưa có tên)') >= 0) return;
      if (het.indexOf(c.slice(0, 40)) < 0)
        loi.push('dòng "' + c.slice(0, 40) + '" không tìm lại được trong kho ' + s.kho);
    });
  });
  if (!daDo) loi.push('không soạn được câu nào — phép đo này đang câm');
  return { chuaDo: false, loi: loi, soDaDo: daDo };
};

/* 2 · Câu ĐẾM phải đếm CẢ KHO, không đếm mười hai kết quả đã cắt.
      Kho nào có hơn mười hai bản ghi thì con số phải lớn hơn mười
      hai — đó là phép phân biệt duy nhất chắc chắn. */
G.tsSoiDemCaKho = function () {
  var loi = [];
  var kq = G.aiTra('Có bao nhiêu tình huống trong kho');
  var s = G.tlSoan('Có bao nhiêu tình huống trong kho', kq);
  if (!s) { loi.push('không soạn được câu đếm'); return { chuaDo: false, loi: loi }; }
  if (s.y !== 'DEM') loi.push('câu "có bao nhiêu" đọc ra ý ' + s.y + ', đáng lẽ DEM');
  var that = Array.isArray(G[s.kho]) ? G[s.kho].length : 0;
  if (that > 12 && s.so <= 12)
    loi.push('kho ' + s.kho + ' có ' + that + ' bản ghi mà đếm ra ' + s.so +
      ' — đang đếm mười hai kết quả đã cắt chứ không đếm kho');
  if (s.so > that)
    loi.push('đếm ra ' + s.so + ' mà kho chỉ có ' + that + ' — đếm cả bản ghi ngoài kho');
  return { chuaDo: false, loi: loi, kho: s.kho, so: s.so, thatSu: that };
};

/* 3 · Bản soạn KHÔNG đi vòng qua trần tầng.
      Đây là chỗ nguy nhất của cả tệp: phần tra đã lọc theo tầng, còn
      bộ soạn đọc THẲNG G[tenKho] để đếm và liệt kê. Quên lọc ở đây
      là mở toang đúng cái trần mà phần tra đang giữ — và không dòng
      nào báo, vì câu trả lời trông vẫn đúng.

      Phép đo cắm một trần giả chặn một nửa kho rồi đòi con số giảm. */
G.tsSoiTheoTang = function () {
  var loi = [];
  var q = 'Có bao nhiêu tình huống trong kho';
  var a = G.tlSoan(q, G.aiTra(q));
  if (!a) return { chuaDo: true, thieu: 'không soạn được', loi: [] };

  var dem = 0;
  TRAN_THU = function () { dem++; return { ok: dem % 2 === 0 }; };
  var b;
  try { b = G.tlSoan(q, G.aiTra(q)); } finally { TRAN_THU = null; }

  if (!b) { loi.push('cắm trần giả vào thì bộ soạn trả về rỗng — chặt quá'); }
  else if (b.so >= a.so)
    loi.push('trần giả chặn một nửa kho mà số đếm vẫn ' + b.so + ' (trước ' + a.so +
      ') — bộ soạn đang đọc thẳng kho, đi vòng qua trần tầng');

  if (typeof G.aiTrongTang !== 'function')
    loi.push('G.aiTrongTang không còn là hàm sau lượt phá');
  return { chuaDo: false, loi: loi, truoc: a ? a.so : 0, sau: b ? b.so : 0 };
};

/* 5 · Không bao giờ liệt kê cả một kho quá lớn, và kho thắng phải
      nằm trong ba kết quả đầu. */
G.tsSoiKhoQuaTo = function () {
  var loi = [];
  var q = 'Máy không được nhận những việc gì';
  var kq = G.aiTra(q);
  var s = G.tlSoan(q, kq);
  if (!s) { loi.push('không soạn được "' + q + '"'); return { chuaDo: false, loi: loi }; }
  var baDau = kq.slice(0, 3).map(function (x) { return x.khoNguon; });
  if (baDau.indexOf(s.kho) < 0)
    loi.push('kho thắng ' + s.kho + ' không nằm trong ba kết quả đầu (' + baDau.join(', ') + ')');
  if (s.y === 'LIETKE' && s.dong.length > 30)
    loi.push('liệt kê ' + s.dong.length + ' dòng — quá dài để đọc');

  /* Kho lớn thật thì phải rơi về nhánh LIETKE_TRUNG, không đổ cả kho */
  var q2 = 'Tài liệu Học viện gồm những gì';
  var s2 = G.tlSoan(q2, G.aiTra(q2));
  if (s2 && s2.y === 'LIETKE' && s2.so > 60)
    loi.push('kho ' + s2.kho + ' có ' + s2.so + ' mục mà vẫn đi nhánh LIETKE đầy đủ');
  return { chuaDo: false, loi: loi, khoThang: s.kho, y: s.y };
};

/* 4 · Đọc ý: mã hẹp hơn liệt kê, và sáu ý đều bắt được. */
G.tsSoiDocY = function () {
  var loi = [];
  var thu = [
    ['Có bao nhiêu hợp đồng', 'DEM'],
    ['Bảy cửa gồm những gì', 'LIETKE'],
    ['Điều khoản DK16 gồm những gì', 'MA'],
    ['Hành lang thành công là gì', 'LAGI'],
    ['Ký hợp đồng lao động làm thế nào', 'CACHLAM'],
    ['Phác đồ cho trẻ mất tập trung', 'TOM']
  ];
  thu.forEach(function (p) {
    var y = G.tlDocY(p[0]);
    if (y !== p[1]) loi.push('"' + p[0] + '" đọc ra ' + y + ', đáng lẽ ' + p[1]);
  });
  return { chuaDo: false, loi: loi };
};

})();
