/**
 * ═══════════════════════════════════════════════════════════════
 * GITA 365 — NHẬN TÀI LIỆU VÀ MINH CHỨNG TỪ ỨNG DỤNG
 * Dán vào cùng dự án Apps Script với GITA_CapPhep.gs.
 *
 * Mọi vị trí đều gửi được tệp lên. Tệp vào thư mục Drive của Học viện,
 * mỗi loại một thư mục con, và sổ tài liệu ghi lại ai gửi cái gì lúc nào.
 * Chỉ Super Admin và Admin hệ thống duyệt.
 * ═══════════════════════════════════════════════════════════════
 */

/* Thư mục gốc nhận tài liệu đội ngũ gửi lên. Đổi ID ở đây nếu chuyển chỗ. */
var GITA_THU_MUC_TAILIEU = '1pvXH45JvXXPOW9V6ObB5CR87r7gxH0fU';

var GITA_TL_CO_TOI_DA   = 25 * 1024 * 1024;  /* 25 MB mỗi tệp */
var GITA_TL_TRAN_NGAY   = 30;                /* mỗi tài khoản gửi tối đa 30 tệp/ngày */

/* Chỉ nhận đúng những kiểu tệp dùng được. Không nhận tệp chạy được. */
var GITA_TL_DUOI_CHO_PHEP = [
  'pdf','doc','docx','ppt','pptx','xls','xlsx','png','jpg','jpeg','webp','txt','csv'
];

function gitaDuoiTep_(ten) {
  var p = String(ten || '').split('.');
  return p.length > 1 ? p.pop().toLowerCase() : '';
}

function gitaThuMucCon_(goc, ten) {
  var it = goc.getFoldersByName(ten);
  return it.hasNext() ? it.next() : goc.createFolder(ten);
}

function gitaDemGuiNgay_(u) {
  var kho = CacheService.getScriptCache();
  var k = 'TLGUI_' + String(u).toLowerCase() + '_' + Utilities.formatDate(new Date(), 'GMT+7', 'yyyyMMdd');
  var n = Number(kho.get(k) || 0) + 1;
  kho.put(k, String(n), GITA_CACHE_NGAY);
  return n;
}

/**
 * Nhận một tệp. Thân yêu cầu:
 * {"fn":"napTaiLieu","u":"…","token":"…","ban":{…},"dulieu":"<base64>"}
 */
function gitaNapTaiLieu_(y, hoSo) {
  var ban = y.ban || {};
  var ten = String(ban.ten || '').trim();
  var tenTep = String(ban.tenTep || '').trim();
  if (!ten || !tenTep) return { ok: false, error: 'Thiếu tên tài liệu hoặc tên tệp.' };

  var duoi = gitaDuoiTep_(tenTep);
  if (GITA_TL_DUOI_CHO_PHEP.indexOf(duoi) < 0)
    return { ok: false, error: 'Không nhận tệp đuôi .' + duoi + '. Chỉ nhận tài liệu và ảnh.' };

  var soLan = gitaDemGuiNgay_(hoSo.u);
  if (soLan > GITA_TL_TRAN_NGAY) {
    ghiNhatKy_({ viec: 'GUI_TL_CHAN', u: hoSo.u, role: hoSo.role,
      chiTiet: 'Vượt trần ' + GITA_TL_TRAN_NGAY + ' tệp/ngày' });
    return { ok: false, code: 'RATE', error: 'Đã gửi quá ' + GITA_TL_TRAN_NGAY + ' tệp hôm nay. Thử lại ngày mai.' };
  }

  var thoBase64 = String(y.dulieu || '');
  if (!thoBase64) return { ok: false, error: 'Tệp rỗng.' };

  var byte;
  try { byte = Utilities.base64Decode(thoBase64); }
  catch (e) { return { ok: false, error: 'Tệp gửi lên không đọc được.' }; }
  if (byte.length > GITA_TL_CO_TOI_DA)
    return { ok: false, error: 'Tệp lớn hơn 25 MB.' };

  var goc = DriveApp.getFolderById(GITA_THU_MUC_TAILIEU);
  var thuMuc = gitaThuMucCon_(gitaThuMucCon_(goc, 'TAI-LIEU-DOI-NGU'),
    String(ban.loai || 'khac'));

  /* Tên tệp mang sẵn mã, người gửi và ngày — nhìn tên là truy được nguồn */
  var tenLuu = (ban.id || 'TL') + '__' + String(hoSo.u).split('@')[0] + '__' +
    Utilities.formatDate(new Date(), 'GMT+7', 'yyyyMMdd') + '__' + tenTep;

  var blob = Utilities.newBlob(byte, ban.kieuTep || MimeType.PLAIN_TEXT, tenLuu);
  var tep = thuMuc.createFile(blob);
  tep.setDescription(
    'Mã: ' + (ban.id || '') + '\n' +
    'Tên: ' + ten + '\n' +
    'Loại: ' + (ban.loai || '') + ' · Tầng: ' + (ban.tang || 'chung') + '\n' +
    'Người gửi: ' + hoSo.u + ' (' + hoSo.role + ')\n' +
    'Mô tả: ' + String(ban.moTa || '') + '\n' +
    'Trạng thái: CHỜ DUYỆT — chỉ vào kho sau khi Super Admin hoặc Admin duyệt.');

  /* Ghi vào sổ tài liệu để màn kiểm duyệt đọc được.
     Mã tài liệu ĐI VÀO CỘT id — Store tìm theo id, nên đặt ở cột khác thì
     sau này không ai tìm lại được bản ghi để duyệt.
     Không nuốt lỗi ở đây: tệp đã nằm trên Drive mà sổ không ghi được thì
     người gửi phải biết, nếu không tài liệu treo lơ lửng không ai duyệt. */
  var maTL = String(ban.id || '') || ('TL-' + Date.now().toString(36).toUpperCase());
  try {
    Store.insert('tailieu', {
      id: maTL, ten: ten, loai: ban.loai || '', tang: ban.tang || 0,
      moTa: String(ban.moTa || ''), driveId: tep.getId(), tenTep: tenTep,
      nguoiGui: hoSo.u, vaiGui: hoSo.role, luc: new Date().toISOString(),
      trangThai: 'cho-duyet', nguoiDuyet: '', lucDuyet: '', lyDo: ''
    });
  } catch (e) {
    ghiNhatKy_({ viec: 'GUI_TL_LOI', u: hoSo.u, role: hoSo.role,
      chiTiet: maTL + ' · tệp đã lên Drive nhưng không ghi được sổ: ' + e.message });
    return { ok: false, driveId: tep.getId(),
      error: 'Tệp đã lưu lên Drive nhưng máy chủ chưa ghi được vào sổ kiểm duyệt. ' +
             'Báo cho Admin hệ thống kèm mã ' + maTL + '.' };
  }

  ghiNhatKy_({ viec: 'GUI_TL', u: hoSo.u, role: hoSo.role,
    chiTiet: (ban.id || '') + ' · ' + ten + ' · ' + Math.round(byte.length / 1024) + ' KB' });

  return { ok: true, driveId: tep.getId(),
    thongBao: 'Đã lưu tệp vào Drive của Học viện. Tài liệu đang chờ kiểm duyệt.' };
}

/**
 * Quyết định của người kiểm duyệt. CHỈ vai bậc ≤ 2.
 * {"fn":"duyetTaiLieu","u":"…","token":"…","ma":"TL-…","viec":"duyet|sua|tuchoi","lyDo":"…"}
 */
function gitaDuyetTaiLieu_(y, hoSo) {
  var lv = (ROLES[hoSo.role] || { lv: 99 }).lv;
  if (lv > 2) {
    ghiNhatKy_({ viec: 'DUYET_TL_CHAN', u: hoSo.u, role: hoSo.role,
      chiTiet: 'Vai bậc ' + lv + ' không được kiểm duyệt tài liệu' });
    return { ok: false, code: 'PERM',
      error: 'Chỉ Super Admin và Admin hệ thống được kiểm duyệt tài liệu.' };
  }
  var viec = String(y.viec || '');
  if (['duyet', 'sua', 'tuchoi'].indexOf(viec) < 0)
    return { ok: false, error: 'Việc không hợp lệ.' };
  var lyDo = String(y.lyDo || '').trim();
  if (viec !== 'duyet' && lyDo.length < 8)
    return { ok: false, error: 'Phải ghi rõ lý do hoặc điều cần bổ sung.' };

  var tt = viec === 'duyet' ? 'da-duyet' : viec === 'sua' ? 'yeu-cau-sua' : 'tu-choi';
  var ma = String(y.ma || '');

  /* Store.find nhận một MÃ, không nhận đối tượng. Truyền {ma:…} vào đây thì
     nó so với chuỗi "[object Object]" và luôn không tìm thấy — nên trước đây
     hàm này trả về ok cho ứng dụng mà không đổi gì ở đâu cả: Admin tưởng đã
     duyệt, tài liệu vẫn nằm nguyên trạng thái chờ. */
  var b = null;
  try { b = Store.find('tailieu', ma); } catch (e) { b = null; }
  if (!b) return { ok: false, code: 'NOTFOUND',
    error: 'Không tìm thấy tài liệu mã ' + ma + ' trong sổ.' };

  try {
    Store.update('tailieu', b.id, {
      trangThai: tt, nguoiDuyet: hoSo.u, lucDuyet: new Date().toISOString(), lyDo: lyDo
    });
  } catch (e) {
    return { ok: false, error: 'Không ghi được quyết định: ' + e.message };
  }

  ghiNhatKy_({ viec: 'DUYET_TL', u: hoSo.u, role: hoSo.role,
    chiTiet: ma + ' → ' + tt + (lyDo ? ' · ' + lyDo : '') });
  return { ok: true, ma: ma, trangThai: tt, thongBao: 'Đã ghi quyết định.' };
}
