/**
 * ═══════════════════════════════════════════════════════════════
 * GITA 365 — SỔ ĐẾM CỘNG ĐỒNG VÀ HỘP THƯ CHUYỆN
 * Dán vào cùng dự án Apps Script với GITA_CapPhep.gs.
 *
 * ═══ TỆP NÀY TRẢ LỜI CHO BỐN CHỖ TRỐNG ĐÃ TỰ KHAI ═══
 *
 * Bốn nguồn trong G.TIN_NGUON tự khai `co: false` kèm chỗ thiếu của mình.
 * Đây là chỗ lấp, và lấp theo đúng bốn câu ấy:
 *
 *   N-XONG   "Chưa có sổ đếm ở máy chủ."          → ghiTinCongDong
 *   N-TANG   "Phải gộp đủ lớn."                    → ngưỡng ở docTinCongDong
 *   N-KEM    "Chưa có sổ cặp nhà kèm ở máy chủ."   → ghiTinCongDong loại N-KEM
 *   N-CHUYEN "Chưa có chỗ nhận chuyện gửi về."     → guiChuyen
 *
 * ═══ GIỮ SỐ, KHÔNG GIỮ HÀNG ═══
 *
 * Trang sổ đếm có đúng một dòng cho mỗi (loại · tầng), và dòng ấy chỉ có
 * một con số. KHÔNG có dòng nào cho mỗi nhà.
 *
 * Vì sao: giữ hàng thì sáu tháng sau ai đọc được bảng tính cũng đọc được
 * nhà nào xong tầng nào ngày nào. Cái bảng ấy sẽ có người xin, và lúc ấy
 * từ chối đã muộn — nó đã tồn tại rồi.
 *
 * ═══ CHẶN ĐẾM HAI LẦN MÀ KHÔNG BIẾT LÀ AI ═══
 *
 * Vẫn phải biết "người này báo rồi", nếu không thì bấm mười lần là mười
 * nhà. Cách làm: một DẤU MỘT CHIỀU băm từ tài khoản cộng khoá máy chủ.
 *
 *   · Có dấu thì biết đã báo rồi → không cộng nữa.
 *   · Không có khoá thì không lần ngược ra tài khoản nào. Khoá nằm ở
 *     PropertiesService, không nằm trong mã, và không hàm nào ở đây trả
 *     nó ra — kể cả một phần.
 *   · Trang dấu KHÔNG ghi giờ. Ghi giờ là ghép được với nhật ký đăng nhập
 *     để suy ra ai, và thế thì cả lớp băm thành vô nghĩa.
 *
 * ═══ NGƯỠNG GỘP: MỘT CHỖ QUYẾT, MỌI CHỖ HỎI ═══
 *
 * Số nhỏ chỉ mặt được từng nhà mà không cần tên: "2 nhà đang ở tầng năm"
 * là đã gần như nêu tên. Nên dưới ngưỡng thì KHÔNG trả con số ra — trả
 * tên mục vào danh sách `duoiNguong` để màn nói "chưa gộp đủ để hiện".
 *
 * Câu ấy khác hẳn "chưa có sổ đếm": một câu nói hệ CHƯA LÀM, câu kia nói
 * hệ ĐÃ LÀM và đang giữ kín cho người ta.
 *
 * Ngưỡng chỉ được quyết ở ĐÂY, vì chỉ ở đây nó chặn được thật. Máy khách
 * không gõ lại số này và không gửi nó lên — nhận từ thân yêu cầu thì ai
 * cũng đặt được thành 1. Máy khách in con số `nguong` mà máy chủ trả về.
 *
 * ═══ MÁY GIỮ HỘP THƯ, NGƯỜI CHỌN CHUYỆN ═══
 *
 * guiChuyen soi được sáu tiêu chí có ĐỦ CỘT hay chưa. Nó không đọc được
 * một chuyện hay hay dở, nên nó không bao giờ tự đặt trạng thái 'da-chon'.
 * Người của Học viện đổi cột ấy bằng tay trong bảng tính. Không giao cho
 * ai thì hộp thư đầy mà bảng tin không có gì đăng — và như thế là đúng.
 * ═══════════════════════════════════════════════════════════════
 */

/** Ngưỡng gộp mặc định. Chủ hệ đổi bằng thuộc tính GITA_NGUONG_GOP. */
var GITA_NGUONG_GOP_MAC_DINH = 10;

var GITA_TRANG_SODEM  = 'SoCongDong';
var GITA_TRANG_DAUBAO = 'DauDaBao';
var GITA_TRANG_CHUYEN = 'HopThuChuyen';

var GITA_COT_SODEM  = ['muc', 'loai', 'tang', 'so'];
/* Không có cột giờ. Xem phần đầu tệp: giờ là chỗ lần ngược ra người. */
var GITA_COT_DAUBAO = ['dau', 'loai', 'tang'];
var GITA_COT_CHUYEN = ['ma', 'loai', 'tang', 'noiDung',
  'tc1', 'tc2', 'tc3', 'tc4', 'tc5', 'tc6',
  'trangThai', 'nguoiGui', 'nhanLuc', 'nguoiChon', 'chonLuc'];

/** Ba loại được cộng vào sổ đếm. Đúng ba mã của G.TIN_NGUON. */
var GITA_LOAI_DEM = ['N-XONG', 'N-TANG', 'N-KEM'];

/**
 * Khoá băm dấu. Riêng một khoá cho việc này — trộn với khoá chứng cứ thì
 * đổi khoá vì một việc là làm hỏng việc kia.
 */
function gitaKhoaSoCongDong_() {
  var P = PropertiesService.getScriptProperties();
  var k = P.getProperty('GITA_KHOA_SOCONGDONG');
  if (!k) {
    k = Utilities.getUuid() + Utilities.getUuid() + Utilities.getUuid();
    P.setProperty('GITA_KHOA_SOCONGDONG', k);
  }
  return k;
}

function gitaNguongGop_() {
  var v = Number(PropertiesService.getScriptProperties().getProperty('GITA_NGUONG_GOP'));
  return (v && v > 0) ? v : GITA_NGUONG_GOP_MAC_DINH;
}

function gitaTrangCD_(ten, cot) {
  var so = gitaSo_();
  var tr = so.getSheetByName(ten);
  if (!tr) {
    tr = so.insertSheet(ten);
    tr.appendRow(cot);
    tr.setFrozenRows(1);
  }
  return tr;
}

/**
 * Dấu một chiều. Băm tài khoản cộng khoá máy chủ.
 *
 * N-TANG băm KHÔNG kèm tầng: một nhà ở đúng một tầng tại một lúc, nên khi
 * nhà ấy báo tầng mới thì phải trừ ở tầng cũ, và muốn trừ thì phải nhận ra
 * đúng cái dấu cũ. Hai loại kia thì mỗi tầng là một việc xong riêng, nên
 * kèm tầng vào dấu để một nhà đếm được một lần ở MỖI tầng.
 */
function gitaDauBao_(u, loai, tang) {
  var chuoi = String(u).toLowerCase() + '|' + loai + (loai === 'N-TANG' ? '' : '|' + tang);
  var b = Utilities.computeHmacSha256Signature(chuoi, gitaKhoaSoCongDong_(), Utilities.Charset.UTF_8);
  return b.map(function (x) { return ('0' + (x & 0xFF).toString(16)).slice(-2); }).join('');
}

function gitaMucDem_(loai, tang) { return loai + ':' + tang; }

/** Cộng (hoặc trừ) một vào ô đếm. Không tụt xuống dưới 0. */
function gitaCongO_(loai, tang, buoc) {
  var tr = gitaTrangCD_(GITA_TRANG_SODEM, GITA_COT_SODEM);
  var muc = gitaMucDem_(loai, tang);
  var v = tr.getDataRange().getValues();
  for (var i = 1; i < v.length; i++) {
    if (String(v[i][0]) === muc) {
      var m = Math.max(0, (Number(v[i][3]) || 0) + buoc);
      tr.getRange(i + 1, 4).setValue(m);
      return m;
    }
  }
  var dau = Math.max(0, buoc);
  tr.appendRow([muc, loai, tang, dau]);
  return dau;
}

/**
 * fn:'ghiTinCongDong'
 * Thân: { u, token, bao: { loai, tang, dongY } }
 * Trả:  { ok, daGhi: true|false, viSao? }
 *
 * `dongY` phải là true trong CHÍNH yêu cầu này. Máy khách chỉ gửi khi nhà
 * ấy đã bật công tắc chia sẻ, nhưng máy chủ không tin điều đó — nó đòi
 * lời đồng ý đi kèm mỗi lần báo, và ghi việc ấy vào nhật ký.
 *
 * Vì sao đòi cho bằng được: một con số gom lén thì tới ngày có người hỏi
 * "lấy ở đâu ra" là hết đường trả lời, và lúc ấy mất luôn cả những con số
 * đã xin phép tử tế.
 */
function gitaGhiTinCongDong_(y, hoSo) {
  var b = y.bao || {};
  var loai = String(b.loai || '');
  var tang = String(b.tang || '');
  if (GITA_LOAI_DEM.indexOf(loai) < 0) return { ok: false, error: 'Loại báo không hợp lệ.' };
  if (!/^T[1-5]$/.test(tang)) return { ok: false, error: 'Tầng không hợp lệ.' };
  if (b.dongY !== true)
    return { ok: false, error: 'Chưa có lời đồng ý chia sẻ của nhà mình.' };

  var dau = gitaDauBao_(hoSo.u, loai, tang);
  var trD = gitaTrangCD_(GITA_TRANG_DAUBAO, GITA_COT_DAUBAO);
  var v = trD.getDataRange().getValues();
  for (var i = 1; i < v.length; i++) {
    if (safeEqual_(String(v[i][0]), dau)) {
      /* Đã báo rồi. Với N-TANG, báo tầng khác nghĩa là nhà ấy đã lên tầng:
         trừ ở tầng cũ, cộng ở tầng mới, và sửa dòng dấu. Sổ đếm N-TANG nói
         "đang ở", nên cộng dồn mà không trừ là nói sai. */
      if (loai === 'N-TANG' && String(v[i][2]) !== tang) {
        gitaCongO_(loai, String(v[i][2]), -1);
        gitaCongO_(loai, tang, 1);
        trD.getRange(i + 1, 3).setValue(tang);
        audit_(hoSo.phien, 'CONGDONG_CHUYEN_TANG', loai, tang);
        return { ok: true, daGhi: true };
      }
      return { ok: true, daGhi: false, viSao: 'Nhà mình đã báo mục này rồi.' };
    }
  }

  gitaCongO_(loai, tang, 1);
  trD.appendRow([dau, loai, tang]);
  audit_(hoSo.phien, 'CONGDONG_GHI', loai, tang);
  return { ok: true, daGhi: true };
}

/**
 * fn:'docTinCongDong'
 * Thân: { u, token }
 * Trả:  { ok, nguong, so: {...}, duoiNguong: [...], chuyenDaChon }
 *
 * `so` chỉ chứa những mục ĐẠT ngưỡng. Mục chưa đạt đi vào `duoiNguong`
 * dưới dạng TÊN MỤC, không kèm con số — kèm số là ngưỡng thành vô nghĩa.
 */
function gitaDocTinCongDong_(y, hoSo) {
  var nguong = gitaNguongGop_();
  var tr = gitaTrangCD_(GITA_TRANG_SODEM, GITA_COT_SODEM);
  var v = tr.getDataRange().getValues();
  var so = {}, duoi = [];
  for (var i = 1; i < v.length; i++) {
    var muc = String(v[i][0]); var n = Number(v[i][3]) || 0;
    if (n >= nguong) so[muc] = n; else duoi.push(muc);
  }

  /* Chuyện đã chọn thì đã công khai, nên không cần ngưỡng: đếm chuyện,
     không đếm nhà. */
  var trC = gitaTrangCD_(GITA_TRANG_CHUYEN, GITA_COT_CHUYEN);
  var c = trC.getDataRange().getValues(); var daChon = 0;
  for (var j = 1; j < c.length; j++) if (String(c[j][10]) === 'da-chon') daChon++;

  return { ok: true, nguong: nguong, so: so, duoiNguong: duoi, chuyenDaChon: daChon };
}

/**
 * fn:'guiChuyen'
 * Thân: { u, token, chuyen: { tang, noiDung, tc1..tc6 } }
 * Trả:  { ok, ma, trangThai:'cho-doc' }
 *
 * tc1..tc6 là sáu tiêu chí ở G.TIN_TIEUCHI. Máy đòi ĐỦ SÁU — qua năm trên
 * sáu vẫn là trượt. Nó soi cột có hay không, KHÔNG soi chuyện hay hay dở.
 *
 * Trạng thái ra là 'cho-doc' và chỉ có thể là 'cho-doc'. Không có đường
 * nào trong tệp này đặt được 'da-chon' — người của Học viện đổi bằng tay.
 */
function gitaGuiChuyen_(y, hoSo) {
  var c = y.chuyen || {};
  var tang = String(c.tang || '');
  if (!/^T[1-5]$/.test(tang)) return { ok: false, error: 'Tầng không hợp lệ.' };
  var nd = String(c.noiDung || '').trim();
  if (!nd) return { ok: false, error: 'Chưa có nội dung chuyện.' };
  if (nd.length > 8000) return { ok: false, error: 'Nội dung quá 8000 ký tự.' };

  var thieu = [];
  for (var k = 1; k <= 6; k++) if (c['tc' + k] !== true) thieu.push(k);
  if (thieu.length)
    return { ok: false, error: 'Chưa đủ tiêu chí: ' + thieu.join(', ') +
      '. Đủ sáu mới nhận — tiêu chí 6 là lời đồng ý bằng chữ, không bỏ qua được.' };

  var trC = gitaTrangCD_(GITA_TRANG_CHUYEN, GITA_COT_CHUYEN);
  var ma = 'CH-' + Utilities.getUuid().slice(0, 8);
  trC.appendRow([ma, 'N-CHUYEN', tang, nd,
    true, true, true, true, true, true,
    'cho-doc', hoSo.u, new Date().toISOString(), '', '']);
  audit_(hoSo.phien, 'CHUYEN_GUI', ma, tang);
  return { ok: true, ma: ma, trangThai: 'cho-doc' };
}
