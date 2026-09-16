/* ═══════════════════════════════════════════════════════════════
   GITA 365 — ĐỌC SỔ CHỜ CHỦ HỆ, VÀ ĐO XEM CÒN CHỜ THẬT KHÔNG

   ══ VÌ SAO CÓ TỆP NÀY ══

   Kho có mười hai sổ mang đuôi _CHOCHU. Mỗi sổ ghi những việc chờ
   người chứ không chờ mã. Cho tới bản 9.99.48 chúng chỉ là chữ: ai
   không mở đúng màn ấy thì không bao giờ thấy, và một mục đã làm xong
   vẫn nằm nguyên trong sổ vì không ai nhớ gỡ.

   Một sổ chờ mà không ai gỡ thì sau vài bản nó có cả việc đã xong lẫn
   việc chưa xong, và người đọc không phân biệt được — lúc ấy cả sổ
   thành vô dụng, đúng như sổ TR_CHUA đã từng mục ở 9.99.7.

   Nên tệp này làm hai việc:
     · ĐỌC mọi sổ _CHOCHU trong kho, không khai tay tên sổ nào. Thêm
       một sổ mới ở bản sau là nó tự có mặt.
     · ĐO từng mục bằng chính ô `do` mà mục ấy tự khai, rồi nói thẳng:
       còn chờ thật · đã xong mà quên gỡ · máy không đo được.

   ══ VÌ SAO NÓ NẰM Ở src/ CHỨ KHÔNG NẰM Ở tools/ ══

   Có HAI chỗ cần đo: màn Biên soạn (để chủ hệ thấy lúc đang làm) và
   bộ soát sẵn sàng (để nhắc mỗi lần phát hành). Viết hai lần là dựng
   hai bộ đo, và hai bộ đo rồi sẽ nói hai con số khác nhau.

   Nên phép đo viết đúng một lần ở đây, thuần hàm — không đụng màn
   hình, không đụng mạng — và cả hai chỗ cùng gọi. tools/soat-san-sang.js
   nạp chính tệp này trong một cái window giả.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;

/* ── BỐN KIỂU ĐO ──
   Mỗi mục chờ khai `do.kieu` là một trong bốn chữ này, hoặc khai
   `khongDoDuoc` kèm lý do. Không khai gì cả cũng là một trạng thái, và
   bộ đọc nói ra chứ không im — sổ cũ dựng trước 9.99.49 rơi vào đó. */
G.CC_KIEU = {
  coDong: 'Một kho đang rỗng. Xong khi nó có dòng đầu tiên.',
  dem: 'Một bảng có cặp số cần/có. Xong khi mọi dòng đủ số.',
  duTruong: 'Một bảng mà mỗi dòng còn thiếu vài ô. Xong khi mọi dòng đủ ô.',
  /* Thêm ở 9.99.55. Khác `dem` ở chỗ: `dem` đọc cặp số ĐÃ KHAI trong
     từng dòng, còn `duSo` chỉ khai ĐÍCH rồi ĐẾM THẬT số dòng đang có.
     Dùng khi bản đặc tả nói "phải có tám cái" mà kho mới chép bảy —
     khai thêm một ô "đang có 7" là dựng bản thứ hai của một con số
     đếm được, và bản thứ hai thì mục. */
  duSo: 'Một danh sách phải dài tới một con số đích. Xong khi đếm đủ.',
  /* Thêm ở 9.99.61, và nó bắt một lớp rữa KHÁC hẳn bốn kiểu trên.
     Bốn kiểu trên đo một kho BÊN NGOÀI mục. Kiểu này đo chính MỤC:
     một câu hỏi mang sẵn câu trả lời trong ô của nó thì nó đã xong.

     Vì sao cần: sổ chờ dựng theo lối "hỏi rồi ghi câu trả lời ngay
     cạnh" — BLV, BV, SV, T5P đều thế. Chủ hệ trả lời, người viết ghi
     vào ô `daChot` hoặc `traLoi`, rồi KHÔNG AI GỠ mục ấy khỏi sổ. Sau
     vài bản thì sổ có cả câu đã trả lời lẫn câu chưa, và người đọc
     không phân biệt được — lúc ấy cả sổ thành vô dụng, đúng như
     TR_CHUA đã từng mục ở 9.99.7.

     Ba mục đầu tiên nó bắt được đều đã trả lời từ bản 9.59. */
  daChot: 'Một câu hỏi mang sẵn câu trả lời trong ô của chính nó. Xong khi ô ấy có chữ.'
};

/* Lấy giá trị lồng: 'muc' hoặc 'a.b'. Trả về undefined nếu đứt đường —
   đứt đường là lỗi khai báo, và bộ đọc phải nói ra chứ không trả 0. */
function lay(goc, duong) {
  if (!duong) return goc;
  var cur = goc;
  var phan = String(duong).split('.');
  for (var i = 0; i < phan.length; i++) {
    if (cur === null || cur === undefined) return undefined;
    cur = cur[phan[i]];
  }
  return cur;
}

/* ── ĐO MỘT MỤC ──
   Trả về một trong bốn trạng thái, và không bao giờ đoán:
     xong       đo được, và đã đủ → mục này phải GỠ khỏi sổ
     chua       đo được, còn thiếu → kèm con số cụ thể
     khongDo    mục tự khai là máy không đo được, kèm lý do
     chuaKhai   mục chưa khai gì cả — sổ cũ, hoặc người viết quên */
G.ccDoMuc = function (muc) {
  if (!muc || typeof muc !== 'object') return { trang: 'chuaKhai' };
  if (muc.khongDoDuoc) return { trang: 'khongDo', vi: muc.khongDoDuoc };
  if (!muc.do || !muc.do.kieu) return { trang: 'chuaKhai' };

  /* Kiểu `daChot` đo CHÍNH MỤC, nên nó không khai `tai` — và phải xét
     TRƯỚC phép đòi `tai` ở dưới. Đặt sau thì mọi mục daChot rơi vào
     nhánh "chưa khai", tức là kiểu mới không bao giờ chạy. */
  if (muc.do.kieu === 'daChot') {
    var o = String(lay(muc, muc.do.truong || 'daChot') || '').trim();
    return o
      ? { trang: 'xong', so: 'đã trả lời',
          vi: o === 'true' ? 'ô ' + (muc.do.truong || 'daChot') + ' đã bật' : o.slice(0, 160) }
      : { trang: 'chua', so: 'chưa trả lời',
          con: 'ô ' + (muc.do.truong || 'daChot') + ' còn trống' };
  }

  if (!muc.do.tai) return { trang: 'chuaKhai' };
  var d = muc.do;
  var kho = G[d.tai];
  if (kho === undefined) {
    return { trang: 'hong', vi: 'Mục khai đo tại G.' + d.tai + ' — không có kho ấy.' };
  }
  if (!G.CC_KIEU[d.kieu]) {
    return { trang: 'hong', vi: 'Kiểu đo "' + d.kieu + '" không có trong G.CC_KIEU.' };
  }

  if (d.kieu === 'coDong') {
    var ds = lay(kho, d.truong);
    if (!ds || typeof ds.length !== 'number') {
      return { trang: 'hong', vi: 'Không thấy mảng G.' + d.tai +
        (d.truong ? '.' + d.truong : '') + '.' };
    }
    return ds.length > 0
      ? { trang: 'xong', so: ds.length + ' dòng' }
      : { trang: 'chua', so: '0 dòng', con: 'chưa có dòng nào' };
  }

  var dong = d.trong ? lay(kho, d.trong) : kho;
  if (!dong || typeof dong.length !== 'number') {
    return { trang: 'hong', vi: 'Không thấy mảng G.' + d.tai +
      (d.trong ? '.' + d.trong : '') + '.' };
  }

  if (d.kieu === 'dem') {
    var can = 0, co = 0, oThieu = [];
    for (var i = 0; i < dong.length; i++) {
      var c = Number(dong[i][d.can]) || 0, v = Number(dong[i][d.co]) || 0;
      can += c; co += v;
      if (v < c) oThieu.push(dong[i].ma || dong[i].ten || ('#' + (i + 1)));
    }
    return oThieu.length === 0
      ? { trang: 'xong', so: co + '/' + can }
      : { trang: 'chua', so: co + '/' + can,
          con: oThieu.length + '/' + dong.length + ' ô chưa đủ',
          ten: oThieu };
  }

  if (d.kieu === 'duSo') {
    /* Tên khác `can`/`co` của nhánh trên: cùng một hàm, cùng phạm vi
       `var`, nên trùng tên là khai lại một biến đang dùng. */
    var dich = Number(d.can) || 0;
    var dangCo = dong.length;
    return dangCo >= dich
      ? { trang: 'xong', so: dangCo + '/' + dich }
      : { trang: 'chua', so: dangCo + '/' + dich, con: 'còn thiếu ' + (dich - dangCo) };
  }

  /* duTruong */
  var can2 = d.truong || [], du = 0, thieu = [];
  for (var j = 0; j < dong.length; j++) {
    var ok = true;
    for (var k = 0; k < can2.length; k++) {
      var g = dong[j][can2[k]];
      if (g === undefined || g === null || g === '') { ok = false; break; }
    }
    if (ok) du++; else thieu.push(dong[j].ma || dong[j].truong || dong[j].ten || ('#' + (j + 1)));
  }
  return thieu.length === 0
    ? { trang: 'xong', so: du + '/' + dong.length }
    : { trang: 'chua', so: du + '/' + dong.length,
        con: thieu.length + ' dòng còn thiếu ô ' + can2.join(' · '),
        ten: thieu };
};

/* ── ĐỌC MỌI SỔ ──
   Nhặt theo HÌNH TÊN, không theo danh sách khai tay. Một sổ mới tên
   XX_CHOCHU là nó tự có mặt ở đây, ở màn Biên soạn, và ở bộ soát sẵn
   sàng — không phải sửa ba chỗ.

   Bỏ qua *_CHOCHU_LUAT: đó là luật của sổ, không phải mục chờ. */
G.ccDocSo = function () {
  var ra = [];
  var ten = Object.keys(G).filter(function (k) { return /_CHOCHU$/.test(k); }).sort();
  for (var i = 0; i < ten.length; i++) {
    var so = G[ten[i]];
    if (!so || typeof so.length !== 'number') continue;
    var muc = [];
    for (var j = 0; j < so.length; j++) {
      muc.push({ muc: so[j], ket: G.ccDoMuc(so[j]) });
    }
    ra.push({ so: ten[i], muc: muc });
  }
  return ra;
};

/* ── TÓM TẮT MỘT DÒNG ──
   Dùng ở chỗ chỉ có một dòng để nói: đầu màn Biên soạn, cuối bộ soát
   sẵn sàng. Đếm cả `hong` và `xong` riêng ra, vì hai cái ấy là VIỆC CỦA
   NGƯỜI LÀM chứ không phải việc của chủ hệ:
     hong  mục khai sai đường đo — bộ kiểm mục 77 bắt đỏ
     xong  việc đã làm xong mà mục vẫn nằm trong sổ — phải gỡ */
G.ccTomTat = function (docRa) {
  var d = docRa || G.ccDocSo();
  var t = { so: d.length, tong: 0, chua: 0, xong: 0, khongDo: 0, chuaKhai: 0, hong: 0 };
  for (var i = 0; i < d.length; i++) {
    for (var j = 0; j < d[i].muc.length; j++) {
      t.tong++;
      var tr = d[i].muc[j].ket.trang;
      if (t[tr] !== undefined) t[tr]++;
    }
  }
  return t;
};
