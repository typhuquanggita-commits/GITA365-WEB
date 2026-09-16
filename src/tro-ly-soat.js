/* ═══════════════════════════════════════════════════════════════
   GITA 365 · v9.77 — TRỢ LÝ TỰ KIỂM DỮ LIỆU

   VẤN ĐỀ

   Trong máy có 178 hàm soát đang chạy được — mỗi cái canh một luật
   thật, và phần lớn do chính những bản trước dựng lên. Nhưng chúng
   chỉ chạy khi có người mở đúng màn, hoặc khi chạy bộ kiểm phát hành
   trên máy của người viết mã.

   Hỏi trợ lý "hệ có gì sai không" thì tới 9.76 nó đi TRA KHO về chủ
   đề rà soát — trả về mấy bản ghi mô tả quy trình rà soát. Đúng theo
   nghĩa tra cứu, và vô dụng theo nghĩa người hỏi.

   Câu trả lời đúng là CHẠY THẬT rồi nói ra con số.

   BỐN LUẬT CỦA PHẦN NÀY

   1. MÁY KHÔNG BAO GIỜ NÓI "ĐẠT".
      Nó nói "không thấy chỗ nào trượt". Hai câu ấy khác hẳn nhau:
      178 phép soát canh 178 chuyện, còn hệ có hàng nghìn chuyện.
      Nói "đạt" là hứa thay cho những phép soát chưa ai viết.

   2. CHỈ NGƯỜI TRONG NGHỀ CHẠY ĐƯỢC.
      Kết quả soát là tình trạng bên trong hệ: kho nào thiếu trường,
      luật nào đang hở. Gia đình không có việc gì với nó, và đưa ra
      thì thành một bản đồ chỉ chỗ yếu.

   3. KHÔNG BAO GIỜ IN RA NỘI DUNG BẢN GHI.
      Chỉ in TÊN phép soát và SỐ chỗ đỏ. Một phép soát về dữ liệu cá
      nhân mà in kèm ví dụ là chính nó làm rò thứ nó đang canh.

   4. ĐẾM CẢ PHẦN KHÔNG CHẠY ĐƯỢC.
      Hàm ném lỗi, hàm trả về hình khác — đều phải có trong con số
      cuối. Báo "sạch" trên 90 phép chạy được trong 178 phép là nói
      dối bằng một phép chia.
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

/* ═══════ NHẬN RA CÂU HỎI TỰ KIỂM ═══════ */
var RE_SOAT = new RegExp(
  'co gi sai|co loi gi|co cho nao hong|co cho nao ho|kiem tra he|kiem tra toan|' +
  'ra soat he|ra soat toan|tu kiem|soat loi|con loi nao|he co on|tinh trang he|' +
  'chay bo kiem|chay soat|soi loi|do lai he');

G.tlLaCauSoat = function (cauHoi) { return RE_SOAT.test(boDau(cauHoi)); };

/* ═══════ TÊN NHÓM — đọc từ tiền tố hàm ═══════
   Không kê 178 tên. Tiền tố của hàm soát chính là nhóm nó thuộc về,
   và bảng này chỉ dịch tiền tố sang tiếng người. Thêm một hàm soát
   ngày mai thì nó tự vào đúng nhóm. */
G.TL_SOAT_NHOM = [
  ['dk', 'Độ khó của ca'], ['tn', 'Ngữ cảnh hội thoại'], ['ts', 'Bản soạn'],
  ['tl', 'Chỉ mục trợ lý'], ['tr', 'Nguồn trợ lý'], ['tso', 'Tự kiểm'],
  ['hl', 'Hành lang thành công'], ['rs', 'Rà soát lỗi'], ['rsp', 'Rà soát pháp lý'],
  ['bcd', 'Chuẩn bằng chứng'], ['hs', 'Hồ sơ hợp đồng'], ['kk', 'Hướng dẫn ký kết'],
  ['sta', 'Sổ tay quản trị'], ['btn', 'Bảng tin nội bộ'], ['td', 'Tự động hoá'],
  ['dl', 'Chỗ đè hàm'], ['bv', 'Bản vẽ vận hành'], ['blv', 'Bàn làm việc'],
  ['tvb', 'Bàn Tư vấn'], ['tv', 'Quy trình tư vấn'], ['cs', 'Chăm sóc'],
  ['gl', 'Gỡ lỗi vận hành'], ['sv', 'Sổ tay vận hành'], ['sg', 'Sổ gia đình'],
  ['dt', 'Đào tạo'], ['ht', 'Hành trình'], ['hn', 'Hoà giải'], ['hm', 'Hoà giải rào cản'],
  ['pl', 'Pháp lý'], ['tin', 'Bảng tin'], ['vz', 'Vùng an toàn'], ['bn', 'Bền vững'],
  ['bd', 'Bản đồ'], ['dd', 'Đạo đức'], ['nn', 'Ngôn ngữ'], ['ka', 'Khiếu nại'],
  ['dc', 'Đo chất lượng'], ['bc', 'Bàn cờ'], ['nk', 'Nhật ký'], ['qt', 'Quy trình'],
  ['ph', 'Phác đồ'], ['cl', 'Chất lượng'], ['mp', 'Mảnh ghép'], ['nd', 'Nhịp điều hành'],
  ['tt', 'Đồng hành'], ['ccc', 'Chứng cứ'], ['cc', 'Chứng cứ'], ['clg', 'Chất lượng'],
  ['bt', 'Bàn tin'], ['hd', 'Hợp đồng'], ['phai', 'Luật bắt buộc']
];

var DANG_CHAY = false;

function nhomCua(ten) {
  var m = ten.match(/^([a-z]+)(?=[A-Z])/);
  var tien = m ? m[1] : '';
  var tot = null;
  G.TL_SOAT_NHOM.forEach(function (p) {
    if (tien === p[0] && (!tot || p[0].length > tot[0].length)) tot = p;
  });
  return tot ? tot[1] : ('Nhóm ' + tien);
}

/* ═══════ CHẠY ═══════

   MỘT DANH SÁCH KHAI RÕ, KHÔNG QUÉT MÙ — VÀ ĐÂY LÀ CHỖ TÔI ĐÃ LÀM
   SAI MỘT LẦN, GHI LẠI ĐỂ KHÔNG LÀM LẠI

   Bản đầu quét mọi hàm có hình tên "xxSoi…" rồi gọi hết, với lý do
   "kê danh sách thì danh sách sẽ cũ". Lý do ấy đúng ở mọi chỗ khác
   trong kho này, và SAI ở đây.

   Vì phần lớn 178 phép soát ấy là PHÉP PHÁ: chúng cố tình làm hỏng
   dữ liệu để chứng minh mình chưa câm, rồi trả lại. Chạy chúng vì
   một câu hỏi của người dùng là sửa trạng thái của chính người đang
   dùng — đổi G.S.acc, xoá ngữ cảnh, thêm bản ghi vào sổ xin khoá.
   Và nếu một phép phá ném lỗi giữa chừng thì trạng thái giả nằm lại.

   Đo được ngay lượt chạy đầu: quét mù trả về 13 phép đỏ và 46 chỗ,
   trong khi chạy từng cái một thì sạch. Bốn mươi sáu chỗ đỏ ấy là
   các phép soát phá lẫn nhau, không phải lỗi của hệ.

   Nên ở đây kê danh sách, và kê là một hành động AN TOÀN chứ không
   phải một chỗ lười. Thêm vào danh sách này phải qua tsoSoiKhongSua()
   — nó chụp trạng thái trước và sau, và loại thẳng phép nào có sửa.

   Phần còn lại vẫn chạy đủ ở bộ kiểm phát hành, nơi không có ai đang
   dùng máy. Câu trả lời NÓI RÕ điều đó. */
G.TL_SOAT_LIVE = [
  'tlSoiCam', 'tlSoiKhongCaNhan', 'tlSoiKhachKhongVuot', 'trSoiRoRi',
  'hlSoiLuat12', 'hlSoiVirus', 'hlSoiKhongTuNang',
  'rsSoiChan', 'rspSoiChan', 'rspSoiLech', 'bcdSoiKhongTuNang',
  'hsSoiDK6', 'hsSoiLuong', 'kkSoiChon', 'kkSoiLuong', 'kkSoiKhongVuotCap',
  'staSoiPhuHet', 'staSoiKhopVai', 'staSoiKhongChep',
  'btnSoiPhamVi', 'btnSoiKhongXepHang', 'btnSoiNguonSo', 'btnSoiTranNhac',
  'tdSoiChan', 'tdSoiThat', 'tdSoiKhong100', 'tdSoiDuong',
  'svSoiDieuLe', 'svSoiKhongChep', 'svSoiCoDo',
  'bvSoiTran', 'bvSoiNhip', 'bvSoiModule', 'bvSoiDo', 'bvSoiMaCong', 'bvSoi50',
  'csSoiNen', 'csSoiTenTrung', 'csSoiCapKhongTrung', 'csSoiDoDuoc', 'csSoiVong',
  'nnSoiVai', 'nnSoiMau', 'hdSoiCamMay', 'hdSoiManNoi', 'hdSoiDuongRoi',
  'dcSoiDu', 'dcSoiCoach', 'dcSoiNguon', 'phSoiChot'
];

/* Trạng thái phải KHÔNG đổi sau một lượt soát. Chụp bằng chuỗi để so
   được, và chỉ chụp thứ rẻ — chụp cả kho thì phép đo đắt hơn thứ nó
   đo. */
function chupTrangThai() {
  return JSON.stringify({
    u: (G.S && G.S.acc && G.S.acc.u) || '',
    vai: (G.S && G.S.role) || '',
    ngu: G.TL_NGU ? G.TL_NGU.kho + '|' + (G.TL_NGU.daHien || []).length : '',
    xin: (G.DK_XIN || []).length,
    khach: typeof G.LA_KHACH, khan: typeof G.aiCoKhan,
    tang: typeof G.aiTrongTang, doc: typeof G.tlBanGhiKho,
    them: (G.KHACH_THEM ? Object.keys(G.KHACH_THEM).length : 0)
  });
}
G.tlChupTrangThai = chupTrangThai;

G.tlChaySoat = function () {
  var ds = G.TL_SOAT_LIVE || [];
  var tongCo = Object.keys(G).filter(function (k) {
    return typeof G[k] === 'function' && /^[a-z]{2,4}(Soi|Soat)/.test(k);
  }).length;

  var batDau = Date.now();
  var sach = [], doDo = [], chuaDo = [], khongDo = [], daSua = [];

  ds.forEach(function (k) {
    if (typeof G[k] !== 'function') {
      khongDo.push({ ten: k, nhom: nhomCua(k), vi: 'không có hàm này' }); return;
    }
    var truoc = chupTrangThai(), v;
    try { v = G[k](); }
    catch (e) { khongDo.push({ ten: k, nhom: nhomCua(k), vi: 'ném lỗi' }); return; }

    /* Khai an toàn mà chạy ra có sửa thì LOẠI, và nói ra. Lời khai
       không đủ — chỗ này phải đo. */
    if (chupTrangThai() !== truoc) {
      daSua.push({ ten: k, nhom: nhomCua(k) }); return;
    }
    if (!v || typeof v !== 'object') {
      khongDo.push({ ten: k, nhom: nhomCua(k), vi: 'trả về hình không đọc được' }); return;
    }
    if (v.chuaDo) {
      chuaDo.push({ ten: k, nhom: nhomCua(k), vi: String(v.thieu || 'chưa đo được') }); return;
    }
    if (!Array.isArray(v.loi)) {
      khongDo.push({ ten: k, nhom: nhomCua(k), vi: 'không có ô loi' }); return;
    }
    /* CHỈ đếm, KHÔNG lấy nội dung. Xem luật 3 ở đầu tệp. */
    if (v.loi.length) doDo.push({ ten: k, nhom: nhomCua(k), so: v.loi.length });
    else sach.push({ ten: k, nhom: nhomCua(k) });
  });

  return {
    khai: ds.length, tongCo: tongCo,
    daChay: sach.length + doDo.length,
    sach: sach, do: doDo, chuaDo: chuaDo, khongDo: khongDo, daSua: daSua,
    giay: Math.round((Date.now() - batDau) / 100) / 10,
    soDo: doDo.reduce(function (a, x) { return a + x.so; }, 0)
  };
};

/* ═══════ SOẠN THÀNH CÂU TRẢ LỜI ═══════ */
G.tlSoanSoat = function (laKhachFn) {
  /* Luật 2: chỉ người trong nghề. Từ chối phải nói rõ vì sao, chứ
     không im — im thì người hỏi tưởng máy hỏng.

     Tham số laKhachFn để phép phá KHÔNG phải tráo G.LA_KHACH. Đây là
     lần THỨ TƯ cùng cái bẫy ấy — 9.74 aiCoKhan, 9.75 aiTrongTang,
     9.76 tlBanGhiKho, 9.77 LA_KHACH — và tôi vừa viết chính cái luật
     "truyền vào, không tráo" ở bản trước rồi vi phạm ngay bản sau.
     Bộ dò sâu bắt cả bốn lần. Cái bẫy này không nằm ở trí nhớ, nó
     nằm ở chỗ tráo một hàm là cách viết phép phá NGẮN NHẤT. */
  var laKhach = laKhachFn || G.LA_KHACH;
  if (laKhach && laKhach())
    return { y: 'SOAT_CAM', kho: '', loai: 'Tự kiểm hệ thống',
      cau: 'Phần tự kiểm hệ thống chỉ dành cho người của Học viện.',
      dong: [{ nhan: 'vì sao',
        chu: 'Kết quả tự kiểm là tình trạng bên trong hệ — kho nào thiếu trường, ' +
             'luật nào đang hở. Đưa ra ngoài thì thành một bản đồ chỉ chỗ yếu.' }],
      conNua: 0, nguon: [] };

  var r = G.tlChaySoat();
  var dong = [];

  /* Luật 1: KHÔNG nói "đạt". */
  var cau = r.soDo
    ? ('Đã chạy ' + r.daChay + ' phép soát tại chỗ (' + r.giay + ' giây). ' +
       r.do.length + ' phép đang đỏ, tổng ' + r.soDo + ' chỗ.')
    : ('Đã chạy ' + r.daChay + ' phép soát tại chỗ (' + r.giay + ' giây), không phép ' +
       'nào trượt. Đây KHÔNG phải "hệ đạt" — nó là "chưa thấy chỗ nào trượt trong ' +
       r.daChay + ' chuyện đang được canh".');

  /* Phép ĐỎ đứng trước mọi dòng khác. Cắt danh sách mà cắt mất một
     phép đỏ thì người đọc không lần ra được chỗ nào hỏng. */
  r.do.forEach(function (x) {
    dong.push({ nhan: x.nhom, chu: x.ten + ' — ' + x.so + ' chỗ đỏ' });
  });

  /* Luật 4: nói ra CẢ phần không chạy ở đây. */
  dong.push({ nhan: 'chạy ở đây', chu: r.daChay + ' trong ' + r.khai + ' phép khai an ' +
    'toàn chạy tại chỗ. Toàn hệ có ' + r.tongCo + ' phép soát; phần còn lại là phép PHÁ ' +
    '— chúng cố tình làm hỏng dữ liệu rồi trả lại, nên chỉ chạy ở bộ kiểm phát hành, ' +
    'lúc không có ai đang dùng máy.' });
  if (r.daSua.length)
    dong.push({ nhan: 'ĐÃ LOẠI', chu: r.daSua.length + ' phép khai an toàn mà chạy ra CÓ ' +
      'sửa trạng thái, đã bị loại khỏi lượt này: ' +
      r.daSua.slice(0, 4).map(function (x) { return x.ten; }).join(', ') });
  if (r.chuaDo.length)
    dong.push({ nhan: 'chưa đo được', chu: r.chuaDo.length + ' phép tự khai thiếu dữ liệu: ' +
      r.chuaDo.slice(0, 4).map(function (x) { return x.ten; }).join(', ') });
  if (r.khongDo.length)
    dong.push({ nhan: 'KHÔNG chạy được', chu: r.khongDo.length + ' phép ném lỗi hoặc trả ' +
      'về hình lạ: ' + r.khongDo.slice(0, 4).map(function (x) { return x.ten; }).join(', ') });

  return { y: 'SOAT', kho: '', loai: 'Tự kiểm hệ thống',
    cau: cau, dong: dong, conNua: 0, nguon: [],
    soDo: r.soDo, daChay: r.daChay, khai: r.khai, tongCo: r.tongCo };
};

/* ═══════════════════════════════════════════════════════════════
   KHOÁ — NĂM ĐIỀU CHỨNG MINH BẰNG CÁCH CHẠY
   ═══════════════════════════════════════════════════════════════ */

/* 1 · Máy KHÔNG nói "đạt", và nói rõ đây chỉ là phần đang canh. */
G.tsoSoiKhongKhen = function () {
  var loi = [];
  var s = G.tlSoanSoat();
  if (!s) { loi.push('không soạn được'); return { chuaDo: false, loi: loi }; }
  var het = s.cau + ' ' + s.dong.map(function (d) { return d.chu; }).join(' ');
  if (/\bđạt\b|\bhoàn hảo\b|\bkhông có lỗi nào\b|\btất cả đều đúng\b/i.test(het))
    loi.push('câu trả lời có chữ khẳng định "đạt" — máy không được nói thay cho ' +
      'những phép soát chưa ai viết');
  if (!s.soDo && !/chưa thấy|KHÔNG phải/i.test(het))
    loi.push('báo sạch mà không nói rõ đây chỉ là phần đang được canh');
  if (het.indexOf('bộ kiểm phát hành') < 0)
    loi.push('không nói rõ phần lớn phép soát chỉ chạy ở bộ kiểm phát hành — ' +
      'người đọc tưởng con số này nói về cả hệ');
  return { chuaDo: false, loi: loi, daChay: s.daChay, soDo: s.soDo };
};

/* 2 · MỘT LƯỢT SOÁT KHÔNG ĐƯỢC SỬA GÌ.
      Đây là điều quan trọng nhất của cả tệp: người dùng hỏi một câu
      thì trạng thái máy họ phải y nguyên. Chụp trước, chụp sau, so. */
G.tsoSoiKhongSua = function () {
  var loi = [];
  var truoc = G.tlChupTrangThai();
  var r = G.tlChaySoat();
  var sau = G.tlChupTrangThai();
  if (truoc !== sau)
    loi.push('một lượt soát ĐÃ SỬA trạng thái máy — trước: ' + truoc.slice(0, 90) +
      ' · sau: ' + sau.slice(0, 90));
  if (r.daSua.length)
    loi.push(r.daSua.length + ' phép trong TL_SOAT_LIVE có sửa trạng thái và đã bị ' +
      'loại: ' + r.daSua.map(function (x) { return x.ten; }).join(', ') +
      ' — gỡ chúng khỏi danh sách khai an toàn');
  if (!r.daChay) loi.push('không phép nào chạy được');

  /* Và phép này phải chứng minh mình chưa câm: cắm một phép soát CÓ
     sửa vào danh sách rồi đòi nó bị loại. */
  G.zzzSoiCoSua = function () { G.DK_XIN.push({ ma: 'THU' }); return { chuaDo: false, loi: [] }; };
  G.TL_SOAT_LIVE.push('zzzSoiCoSua');
  var b = G.tlChaySoat();
  G.TL_SOAT_LIVE.pop();
  G.DK_XIN = (G.DK_XIN || []).filter(function (x) { return x.ma !== 'THU'; });
  delete G.zzzSoiCoSua;
  if (!b.daSua.filter(function (x) { return x.ten === 'zzzSoiCoSua'; }).length)
    loi.push('cắm một phép soát CÓ sửa trạng thái mà nó không bị loại — phép đo này câm');
  return { chuaDo: false, loi: loi, daChay: r.daChay, khai: r.khai, tongCo: r.tongCo };
};

/* 3 · Khách hàng KHÔNG chạy được, và lời từ chối nói rõ vì sao. */
G.tsoSoiKhachKhongChay = function () {
  var loi = [];
  var s = G.tlSoanSoat(function () { return true; });
  if (!s || s.y !== 'SOAT_CAM')
    loi.push('vai khách vẫn chạy được phần tự kiểm — kết quả soát là bản đồ chỉ chỗ yếu');
  if (s && !(s.dong || []).length)
    loi.push('từ chối mà không nói vì sao — người hỏi sẽ tưởng máy hỏng');
  if (typeof G.LA_KHACH !== 'function')
    loi.push('G.LA_KHACH không còn là hàm sau lượt phá');
  return { chuaDo: false, loi: loi };
};

/* 4 · KHÔNG in ra nội dung ô loi, nhưng PHẢI in tên phép đỏ. */
G.tsoSoiKhongLoRuot = function () {
  var loi = [];
  var BIMAT = 'CHUOI-BI-MAT-KHONG-DUOC-IN-RA';
  G.zzzSoiRoRuot = function () { return { chuaDo: false, loi: [BIMAT] }; };
  G.TL_SOAT_LIVE.push('zzzSoiRoRuot');
  var s;
  try { s = G.tlSoanSoat(); }
  finally { G.TL_SOAT_LIVE.pop(); delete G.zzzSoiRoRuot; }
  var het = JSON.stringify(s || {});
  if (het.indexOf(BIMAT) >= 0)
    loi.push('nội dung ô loi lọt ra câu trả lời — một phép soát về dữ liệu cá nhân ' +
      'sẽ tự làm rò đúng thứ nó đang canh');
  if (het.indexOf('zzzSoiRoRuot') < 0)
    loi.push('phép soát đỏ mà TÊN nó không được nêu — không ai lần ra được chỗ nào hỏng');
  return { chuaDo: false, loi: loi };
};

/* 5 · Mọi tên trong TL_SOAT_LIVE phải có hàm thật, và danh sách
      không được rỗng dần đi mà không ai biết. */
G.tsoSoiDanhSachThat = function () {
  var loi = [], ds = G.TL_SOAT_LIVE || [];
  if (ds.length < 40) loi.push('danh sách khai an toàn còn ' + ds.length + ' tên — có ' +
    'người vừa gỡ bớt');
  var thieu = ds.filter(function (k) { return typeof G[k] !== 'function'; });
  if (thieu.length)
    loi.push(thieu.length + ' tên không có hàm thật: ' + thieu.slice(0, 6).join(', ') +
      ' — mỗi tên ma là một phép soát người ta tưởng đang chạy mà không chạy');
  var trung = {}, lap = [];
  ds.forEach(function (k) { if (trung[k]) lap.push(k); trung[k] = 1; });
  if (lap.length) loi.push('tên lặp: ' + lap.join(', '));
  return { chuaDo: false, loi: loi, so: ds.length };
};

})();
