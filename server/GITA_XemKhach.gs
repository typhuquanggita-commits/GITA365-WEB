/**
 * ═══════════════════════════════════════════════════════════════
 * GITA 365 — AI ĐƯỢC XEM HỒ SƠ KHÁCH HÀNG
 * Dán vào cùng dự án Apps Script với GITA_CapPhep.gs.
 *
 * ═══ VÌ SAO PHẦN NÀY PHẢI Ở MÁY CHỦ ═══
 *
 * Luật chủ hệ chốt có hai vế, và cả hai đều không thi hành được ở máy
 * khách:
 *
 *   · "Tầng 4-5 chỉ từ Coach lên tới Super Admin" — lọc trên màn hình
 *     không chặn được ai mở công cụ nhà phát triển. Chặn thật là KHÔNG
 *     GỬI, và chỗ quyết định gửi hay không nằm ở đây.
 *   · "Super Admin cấp quyền mới được xem" — một giấy phép thu hồi
 *     được thì phải hỏi lại mỗi lượt. Bản sao đã nằm trong máy người ta
 *     thì không gọi ngược về được, dù có gỡ giấy phép.
 *
 * ═══ TRẦN VAI: NGƯỜI CẤP CAO NHẤT CŨNG KHÔNG PHÁ ĐƯỢC ═══
 *
 * Super Admin cấp được quyền, nhưng không cấp VƯỢT TRẦN. Cấp cho Giáo
 * viên là từ chối, kể cả khi người bấm nút là chính Super Admin.
 *
 * Trần mà người cao nhất phá được thì nó không phải trần, nó là một lời
 * khuyên — và một lời khuyên thì tới ngày bận việc sẽ có người bỏ qua.
 *
 * ═══ MỖI LƯỢT XEM MỘT DÒNG SỔ ═══
 *
 * Không phải để rình người của mình. Để ngày một hồ sơ rò ra ngoài thì
 * trả lời được câu "ai đã mở nó" — và câu ấy chỉ trả lời được nếu hôm
 * nay đã ghi. Ghi sau khi mất thì không ghi được nữa.
 * ═══════════════════════════════════════════════════════════════
 */

/** Trần vai — PHẢI khớp từng chữ với G.XK_TRAN trong kho.
 *  Khai lại ở đây không phải vì thích: máy chủ không đọc được kho đã mã
 *  hoá, nên đây là bản DUY NHẤT có hiệu lực. Bản trong kho là bản để
 *  màn hình giải thích cho người đọc; bản này là bản chặn. Bộ kiểm đối
 *  chiếu hai bản mỗi lần chạy, nên lệch một vai là đỏ ngay. */
var GITA_XK_TRAN = [
  { tang: ['T1', 'T2', 'T3'], vai: ['R01', 'R02', 'R03', 'R04', 'R05', 'R06', 'R07', 'R09', 'R10', 'R11'] },
  { tang: ['T4', 'T5'],       vai: ['R01', 'R02', 'R03', 'R04', 'R05', 'R06', 'R07', 'R10'] }
];

/** Chiều thứ BA — vai nào xem được mục nào. Vai không có tên ở đây thì
 *  xem đủ ba mục. PHẢI khớp từng chữ với G.XK_VAI_MUC trong kho; bộ kiểm
 *  đối chiếu hai bản mỗi lần chạy. */
var GITA_XK_VAI_MUC = { R10: ['kpi'] };
var GITA_XK_MUC = ['kpi', 'nhiemvu', 'hoso'];

function gitaXkMucCuaVai_(vai) {
  return GITA_XK_VAI_MUC[String(vai)] || GITA_XK_MUC;
}

/** Bậc của Coach — bậc thấp nhất còn được cấp gói NGHỀ CAO và xem tầng
 *  4-5. Đọc từ ROLES trong 00_Config.gs, không gõ con số: đổi bậc của
 *  Coach trong bảng vai thì chỗ này đổi theo. */
function gitaXkBacCoach_() {
  return (ROLES['R07'] || { lv: 7 }).lv;
}

/** Chỉ vai này cấp được quyền xem. */
var GITA_XK_AI_CAP = 'R01';

var GITA_TRANG_QUYENXEM = 'QuyenXemKhach';
var GITA_COT_QUYENXEM = ['id', 'nguoiDuocCap', 'vai', 'tangDuocXem', 'nguoiCap',
  'capLuc', 'hetHan', 'thuHoiLuc', 'thuHoiBoi', 'lyDo'];

function gitaTrangQuyenXem_() {
  var so = gitaSo_();
  var tr = so.getSheetByName(GITA_TRANG_QUYENXEM);
  if (!tr) {
    tr = so.insertSheet(GITA_TRANG_QUYENXEM);
    tr.appendRow(GITA_COT_QUYENXEM);
    tr.setFrozenRows(1);
  }
  return tr;
}

function gitaXkMaTang_(t) {
  t = String(t == null ? '' : t);
  return /^T[1-5]$/.test(t) ? t : (/^[1-5]$/.test(t) ? 'T' + t : '');
}

/** Vai này có nằm trong trần của tầng kia không. Nguồn sự thật của cả tệp. */
function gitaXkDuTran_(vai, tang) {
  var t = gitaXkMaTang_(tang);
  if (!t) return false;
  for (var i = 0; i < GITA_XK_TRAN.length; i++)
    if (GITA_XK_TRAN[i].tang.indexOf(t) >= 0)
      return GITA_XK_TRAN[i].vai.indexOf(String(vai)) >= 0;
  return false;
}

/** Những tầng một vai ĐỦ ĐIỀU KIỆN xem. Chưa nói tới giấy phép. */
function gitaXkTranCuaVai_(vai) {
  var ra = [];
  for (var i = 0; i < GITA_XK_TRAN.length; i++)
    for (var j = 0; j < GITA_XK_TRAN[i].tang.length; j++)
      if (GITA_XK_TRAN[i].vai.indexOf(String(vai)) >= 0) ra.push(GITA_XK_TRAN[i].tang[j]);
  return ra;
}

/**
 * Giấy phép còn hiệu lực của một tài khoản.
 * Hết hạn thì TỰ TẮT — không chờ ai nhớ ra đi gỡ. Một quyền chỉ mất khi
 * có người chủ động gỡ là một quyền sẽ ở lại mãi.
 */
function gitaXkPhepCua_(u) {
  var tr = gitaTrangQuyenXem_();
  var v = tr.getDataRange().getValues();
  var bay = new Date();
  for (var i = v.length - 1; i >= 1; i--) {
    if (String(v[i][1]).toLowerCase() !== String(u).toLowerCase()) continue;
    if (String(v[i][7] || '').trim()) continue;                 // đã thu hồi
    if (v[i][6] && new Date(v[i][6]) <= bay) continue;          // đã hết hạn
    return { hang: i + 1, nguoiDuocCap: v[i][1], vai: v[i][2],
      tang: String(v[i][3] || '').split(',').filter(Boolean),
      nguoiCap: v[i][4], capLuc: v[i][5], hetHan: v[i][6] || null, lyDo: v[i][9] || '' };
  }
  return null;
}

/**
 * fn:'capQuyenXem' — Super Admin cấp quyền xem.
 * Thân: { u, token, cap: { nguoiDuocCap, vai, tang:['T4','T5'], hetHan, lyDo } }
 *
 * Ba lớp từ chối, và mỗi lớp nói một câu khác nhau vì chúng dẫn tới ba
 * việc khác nhau cho người bấm nút.
 */
function gitaCapQuyenXem_(y, hoSo) {
  if (String(hoSo.role) !== GITA_XK_AI_CAP)
    return { ok: false, error: 'Chỉ Super Admin cấp được quyền xem hồ sơ khách hàng.' };
  var c = y.cap || {};
  var ai = String(c.nguoiDuocCap || '').trim().toLowerCase();
  var vai = String(c.vai || '').trim();
  var lyDo = String(c.lyDo || '').trim();
  if (!ai || !vai) return { ok: false, error: 'Thiếu tài khoản hoặc vai được cấp.' };
  if (!lyDo) return { ok: false, error: 'Chưa nói vì sao cấp. Không cấp quyền mà không có lý do.' };

  var xin = (Array.isArray(c.tang) ? c.tang : []).map(gitaXkMaTang_).filter(Boolean);
  if (!xin.length) return { ok: false, error: 'Chưa chọn tầng nào.' };

  /* TRẦN CHẶN THẬT, kể cả với Super Admin. Đây là chỗ luật này khác một
     lời khuyên. */
  var vuot = xin.filter(function (t) { return !gitaXkDuTran_(vai, t); });
  if (vuot.length)
    return { ok: false, vuotTran: vuot,
      error: 'Vai ' + vai + ' không được phép xem tầng ' +
        vuot.map(function (t) { return t.slice(1); }).join(', ') +
        '. Trần vai không cấp vượt được, kể cả bởi Super Admin.' };

  /* Hết hạn là bắt buộc: giấy phép không hạn thì hôm giao là giao mãi. */
  if (!c.hetHan) return { ok: false, error: 'Chưa đặt ngày hết hạn cho giấy phép.' };
  var han = new Date(c.hetHan);
  if (isNaN(han.getTime()) || han <= new Date())
    return { ok: false, error: 'Ngày hết hạn phải là một ngày trong tương lai.' };

  var cu = gitaXkPhepCua_(ai);
  if (cu) return { ok: false, error: 'Tài khoản này đang có giấy phép còn hiệu lực. ' +
    'Thu hồi bản cũ trước khi cấp bản mới — hai giấy phép cùng lúc thì không ai biết bản nào đang chạy.' };

  var tr = gitaTrangQuyenXem_();
  var gio = new Date().toISOString();
  var id = 'QX-' + Utilities.getUuid().slice(0, 8);
  tr.appendRow([id, ai, vai, xin.join(','), hoSo.u, gio, han.toISOString(), '', '', lyDo]);
  audit_(hoSo.phien, 'QUYENXEM_CAP', ai, vai + ' · ' + xin.join(',') + ' · ' + lyDo);
  return { ok: true, id: id, nguoiDuocCap: ai, tang: xin, hetHan: han.toISOString() };
}

/**
 * fn:'thuHoiQuyenXem'
 * Thân: { u, token, nguoiDuocCap }
 * Thu hồi KHÔNG xoá dòng — đánh dấu. Xoá là xoá luôn bằng chứng đã từng
 * cấp, đúng thứ cần trả lời khi có chuyện.
 */
function gitaThuHoiQuyenXem_(y, hoSo) {
  if (String(hoSo.role) !== GITA_XK_AI_CAP)
    return { ok: false, error: 'Chỉ Super Admin thu hồi được quyền xem.' };
  var p = gitaXkPhepCua_(String(y.nguoiDuocCap || ''));
  if (!p) return { ok: false, error: 'Tài khoản này không có giấy phép nào đang hiệu lực.' };
  var tr = gitaTrangQuyenXem_();
  var gio = new Date().toISOString();
  tr.getRange(p.hang, 8).setValue(gio);
  tr.getRange(p.hang, 9).setValue(hoSo.u);
  audit_(hoSo.phien, 'QUYENXEM_THUHOI', y.nguoiDuocCap, p.tang.join(','));
  return { ok: true, thuHoiLuc: gio };
}

/**
 * fn:'soiQuyenXem' — tài khoản tự hỏi mình đang được xem tầng nào.
 * Trả về CẢ trần lẫn giấy phép, vì hai câu "vai anh không được phép" và
 * "vai anh được phép nhưng chưa ai cấp quyền" dẫn tới hai việc khác nhau.
 */
function gitaSoiQuyenXem_(y, hoSo) {
  var tran = gitaXkTranCuaVai_(hoSo.role);
  var p = gitaXkPhepCua_(hoSo.u);
  var mucDuoc = gitaXkMucCuaVai_(hoSo.role);
  if (!p) return { ok: true, tang: [], tranVai: tran, muc: mucDuoc, coGiayPhep: false };
  /* Trần đọc lại lúc DÙNG, không tin cột đã ghi: vai của một người đổi
     được sau khi giấy phép đã cấp, và lúc ấy giấy phép cũ vẫn nằm đó. */
  var con = p.tang.filter(function (t) { return gitaXkDuTran_(hoSo.role, t); });
  return { ok: true, tang: con, tranVai: tran, muc: mucDuoc, coGiayPhep: true,
    hetHan: p.hetHan, nguoiCap: p.nguoiCap, lyDo: p.lyDo,
    tutTheoVai: con.length < p.tang.length };
}

/**
 * fn:'xemKhachCao' — trả hồ sơ khách hàng tầng 4-5.
 * Đây là dữ liệu KHÔNG nằm trong gói nào gửi về máy, nên đây là cửa duy
 * nhất, và mỗi lượt qua cửa là một dòng sổ.
 */
function gitaXemKhachCao_(y, hoSo) {
  /* Trả về HỒ SƠ, nên phải qua cổng mục 'hoso'. Chuyên gia đánh giá đủ
     trần tầng 4-5 nhưng chỉ được mục kpi — đủ tầng mà không đủ mục thì
     vẫn là không. */
  if (gitaXkMucCuaVai_(hoSo.role).indexOf('hoso') < 0) {
    audit_(hoSo.phien, 'XEMKHACH_TUCHOI', hoSo.role, 'ngoài mục hoso');
    return { ok: false, code: 'NOPERM',
      error: 'Vai này không xem được hồ sơ khách hàng. Chỉ xem được: ' +
        gitaXkMucCuaVai_(hoSo.role).join(', ') + '.' };
  }
  var q = gitaSoiQuyenXem_(y, hoSo);
  var cao = q.tang.filter(function (t) { return t === 'T4' || t === 'T5'; });
  if (!cao.length) {
    audit_(hoSo.phien, 'XEMKHACH_TUCHOI', hoSo.role, q.coGiayPhep ? 'ngoài trần' : 'chưa có giấy phép');
    return { ok: false, code: 'NOPERM',
      error: q.coGiayPhep
        ? 'Giấy phép của tài khoản này không gồm tầng 4-5.'
        : 'Chưa được Super Admin cấp quyền xem hồ sơ khách hàng.' };
  }
  var ds = [];
  try {
    ds = Store.all('students').filter(function (s) {
      var t = 'T' + Number(s.tier || 0);
      return cao.indexOf(t) >= 0 && !s.deletedAt;
    });
  } catch (e) { return { ok: false, error: 'Chưa đọc được sổ học viên.' }; }

  audit_(hoSo.phien, 'XEMKHACH_CAO', cao.join(','), ds.length + ' hồ sơ');
  return { ok: true, tang: cao, so: ds.length, nha: ds };
}
