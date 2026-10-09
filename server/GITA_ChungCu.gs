/**
 * ═══════════════════════════════════════════════════════════════
 * GITA 365 — KÝ VÀ ĐÓNG DẤU GIỜ CHO CHỨNG CỨ HOA HỒNG
 * Dán vào cùng dự án Apps Script với GITA_CapPhep.gs.
 *
 * ═══ VÌ SAO PHẦN NÀY PHẢI Ở MÁY CHỦ ═══
 *
 * Bảng chứng cứ ở máy khách (src/hoa-hong-kem.js) đã tự khai hai chỗ nó
 * KHÔNG làm được, và in thẳng hai chỗ ấy ra màn:
 *
 *   · Dấu kiểm ở máy khách bắt được sửa vô ý và sửa cẩu thả. Nó KHÔNG
 *     chặn được người cố tình dựng lại cả bản ghi lẫn dấu — vì thuật
 *     toán nằm ngay trong mã trang, ai cũng đọc được.
 *   · Giờ máy khách đổi được trong ba giây. Một dấu thời gian do chính
 *     bên đi đòi tiền tự đóng thì không phải bằng chứng.
 *
 * Hai chỗ ấy chỉ đóng được ở đây, và đóng được vì đúng một lý do: KHOÁ
 * KHÔNG BAO GIỜ RỜI MÁY CHỦ. Nó nằm ở PropertiesService, không nằm
 * trong mã nguồn, không đi trong bất kỳ phản hồi nào, và không có hàm
 * nào trong tệp này trả nó ra.
 *
 * ═══ MÁY KHÁCH GIỮ BIÊN NHẬN, KHÔNG GIỮ BẢN GỐC LÀM BẰNG ═══
 *
 * Sau khi ký, máy chủ giữ bản gốc trong một trang append-only và trả về
 * BIÊN NHẬN: mã, giờ máy chủ, chữ ký. Máy khách lưu biên nhận ấy cạnh
 * bản ghi của mình.
 *
 * Nếu hai bên tranh chấp: bản của máy khách đối chiếu với bản của máy
 * chủ. Lệch một ký tự thì chữ ký không khớp, và bên nào sửa thì lộ ra.
 *
 * ═══ BA ĐIỀU TỆP NÀY TỪ CHỐI LÀM ═══
 *
 * 1. Không sửa một bản đã ký. Sai thì ghi bản ĐÍNH CHÍNH trỏ về bản cũ,
 *    và cả hai cùng ở lại trang — xoá bản sai là xoá luôn bằng chứng
 *    rằng đã từng có bản sai, đúng thứ bên đối tụng sẽ hỏi.
 * 2. Không cho người ghi tự xác nhận cho mình. Đây là chỗ chống làm giả
 *    mạnh nhất của cả hệ, mạnh hơn mọi chữ ký.
 * 3. Không trả khoá ra, không trả cả một phần khoá, không trả một thứ
 *    suy ngược ra khoá được.
 * ═══════════════════════════════════════════════════════════════
 */

/** Tên trang lưu chứng cứ. Chỉ THÊM dòng, không bao giờ sửa dòng cũ. */
var GITA_TRANG_CHUNGCU = 'ChungCu';

/** Cột của trang, theo đúng thứ tự ghi. */
var GITA_COT_CHUNGCU = ['ma', 'nhiemVu', 'ngayLam', 'loai', 'noiDung', 'nguoiGhi',
  'gioMayChu', 'chuKy', 'xacNhanBoi', 'xacNhanLuc', 'dinhChinhCho', 'uidGhi'];

/**
 * Khoá ký. Sinh một lần, giữ ở PropertiesService, KHÔNG BAO GIỜ trả ra.
 * Khác khoá của gitaTieu_(): trộn hai việc vào một khoá thì đổi khoá vì
 * một việc là làm hỏng việc kia.
 */
function gitaKhoaChungCu_() {
  var P = PropertiesService.getScriptProperties();
  var k = P.getProperty('GITA_KHOA_CHUNGCU');
  if (!k) {
    k = Utilities.getUuid() + Utilities.getUuid() + Utilities.getUuid();
    P.setProperty('GITA_KHOA_CHUNGCU', k);
  }
  return k;
}

/**
 * Chuỗi chuẩn hoá để ký. PHẢI khớp từng ký tự với bên máy khách khi hai
 * bên đối chiếu, nên thứ tự trường ở đây là một phần của hợp đồng —
 * đổi thứ tự là làm mọi chữ ký cũ hết đối chiếu được.
 */
function gitaChuanChungCu_(o, gioMayChu) {
  return [
    'nhiemVu=' + String(o.nhiemVu || ''),
    'ngayLam=' + String(o.ngayLam || ''),
    'loai=' + String(o.loai || ''),
    'noiDung=' + String(o.noiDung || ''),
    'nguoiGhi=' + String(o.nguoiGhi || ''),
    'gioMayChu=' + String(gioMayChu || '')
  ].join('\n');
}

function gitaKyChungCu_(chuoi) {
  var b = Utilities.computeHmacSha256Signature(chuoi, gitaKhoaChungCu_(), Utilities.Charset.UTF_8);
  return b.map(function (x) { return ('0' + (x & 0xFF).toString(16)).slice(-2); }).join('');
}

function gitaTrangChungCu_() {
  var so = gitaSo_();
  var tr = so.getSheetByName(GITA_TRANG_CHUNGCU);
  if (!tr) {
    tr = so.insertSheet(GITA_TRANG_CHUNGCU);
    tr.appendRow(GITA_COT_CHUNGCU);
    tr.setFrozenRows(1);
  }
  return tr;
}

function gitaTimChungCu_(tr, ma) {
  var v = tr.getDataRange().getValues();
  for (var i = 1; i < v.length; i++) if (String(v[i][0]) === String(ma)) return { hang: i + 1, d: v[i] };
  return null;
}

/**
 * fn:'kyChungCu'
 * Thân: { u, token, cc: { nhiemVu, ngayLam, loai, noiDung, dinhChinhCho? } }
 * Trả:  { ok, bienNhan: { ma, gioMayChu, chuKy } }
 *
 * nguoiGhi lấy từ PHIÊN, không lấy từ thân yêu cầu. Nhận từ thân thì
 * người ta ghi tên ai cũng được, và cả bảng chứng cứ mất nghĩa.
 */
function gitaKyChungCu_YC_(y, hoSo) {
  var cc = y.cc || {};
  var thieu = [];
  ['nhiemVu', 'ngayLam', 'loai', 'noiDung'].forEach(function (k) {
    if (!String(cc[k] || '').trim()) thieu.push(k);
  });
  if (thieu.length) return { ok: false, error: 'Thiếu trường: ' + thieu.join(', ') };
  if (String(cc.noiDung).length > 4000) return { ok: false, error: 'Nội dung quá 4000 ký tự.' };

  var tr = gitaTrangChungCu_();
  if (cc.dinhChinhCho && !gitaTimChungCu_(tr, cc.dinhChinhCho))
    return { ok: false, error: 'Không thấy bản được đính chính.' };

  var gio = new Date().toISOString();
  var o = { nhiemVu: cc.nhiemVu, ngayLam: cc.ngayLam, loai: cc.loai,
    noiDung: String(cc.noiDung).trim(), nguoiGhi: hoSo.u };
  var chuKy = gitaKyChungCu_(gitaChuanChungCu_(o, gio));
  var ma = 'CC-' + Utilities.getUuid().slice(0, 8) + '-' + chuKy.slice(0, 6);

  tr.appendRow([ma, o.nhiemVu, o.ngayLam, o.loai, o.noiDung, o.nguoiGhi,
    gio, chuKy, '', '', cc.dinhChinhCho || '', (hoSo.phien && hoSo.phien.uid) || hoSo.u]);

  audit_(hoSo.phien, 'CHUNGCU_KY', ma, o.nhiemVu);
  return { ok: true, bienNhan: { ma: ma, gioMayChu: gio, chuKy: chuKy } };
}

/**
 * fn:'xacNhanChungCu'  — nhà ĐƯỢC KÈM đối chứng.
 * Thân: { u, token, ma }
 *
 * Người ghi không tự xác nhận cho mình được. Đây là chỗ chống làm giả
 * mạnh nhất của cả hệ: một người không tự dựng được hồ sơ cho mình.
 */
function gitaXacNhanChungCu_(y, hoSo) {
  var tr = gitaTrangChungCu_();
  var t = gitaTimChungCu_(tr, y.ma);
  if (!t) return { ok: false, error: 'Không thấy bản ghi này.' };
  var nguoiGhi = String(t.d[5] || '');
  if (String(hoSo.u) === nguoiGhi)
    return { ok: false, error: 'Người ghi không tự xác nhận cho mình được.' };
  if (String(t.d[8] || '').trim())
    return { ok: false, error: 'Bản này đã được xác nhận rồi.' };
  var gio = new Date().toISOString();
  tr.getRange(t.hang, 9).setValue(hoSo.u);
  tr.getRange(t.hang, 10).setValue(gio);
  audit_(hoSo.phien, 'CHUNGCU_XACNHAN', y.ma, '');
  return { ok: true, xacNhan: { ai: hoSo.u, luc: gio } };
}

/**
 * fn:'soiChungCu' — đối chiếu một bản của máy khách với bản máy chủ.
 * Thân: { u, token, ma }
 * Trả về ĐỦ để bên thứ ba đối chiếu, và KHÔNG trả khoá.
 */
function gitaSoiChungCu_(y, hoSo) {
  var tr = gitaTrangChungCu_();
  var t = gitaTimChungCu_(tr, y.ma);
  if (!t) return { ok: false, error: 'Không thấy bản ghi này.' };
  var o = { nhiemVu: t.d[1], ngayLam: t.d[2], loai: t.d[3], noiDung: t.d[4], nguoiGhi: t.d[5] };
  var gio = String(t.d[6]);
  var lai = gitaKyChungCu_(gitaChuanChungCu_(o, gio));
  return { ok: true,
    ma: t.d[0], gioMayChu: gio, chuKy: t.d[7],
    khop: safeEqual_(lai, String(t.d[7])),
    xacNhanBoi: t.d[8] || null, xacNhanLuc: t.d[9] || null,
    dinhChinhCho: t.d[10] || null,
    /* Bản máy chủ trả về nguyên văn để bên kia tự so — không so hộ. */
    ban: o };
}
