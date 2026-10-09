/**
 * ═══════════════════════════════════════════════════════════════
 * GITA 365 — XUẤT BẢNG TÍNH VỀ DRIVE CỦA ADMIN
 * Dán vào cùng dự án Apps Script với GITA_CapPhep.gs.
 *
 * Dữ liệu KHÔNG đi qua máy người dùng. Máy chủ tạo Google Sheet
 * thẳng trong thư mục Drive của Admin rồi trả về đường dẫn.
 * Không có tệp nào nằm lại trong thư mục Tải về của ai cả.
 * ═══════════════════════════════════════════════════════════════
 */

/** Thư mục Drive nhận mọi bảng tính xuất ra. */
var GITA_THU_MUC_XUAT = '1pvXH45JvXXPOW9V6ObB5CR87r7gxH0fU';

/** Trần số dòng mỗi lần xuất — chặn rút cả kho bằng một lệnh. */
var GITA_TRAN_DONG_XUAT = 5000;

/** Trần số lần xuất mỗi tài khoản mỗi ngày. */
var GITA_TRAN_XUAT_NGAY = 20;

function gitaDemXuat_(u) {
  var kho = CacheService.getScriptCache();
  var k = 'XUATSHEET_' + String(u).toLowerCase() + '_' + Utilities.formatDate(new Date(), 'GMT+7', 'yyyyMMdd');
  var n = Number(kho.get(k) || 0) + 1;
  kho.put(k, String(n), GITA_CACHE_NGAY);
  return n;
}

/**
 * Tạo một Google Sheet trong thư mục Admin.
 * Gọi từ doPost khi fn === 'xuatSheet'.
 */
function gitaXuatSheet_(y, hoSo) {
  // 1. Quyền: chỉ vai có xuat_sheet. lv lấy từ ROLES trong 00_Config.gs.
  var lv = (ROLES[hoSo.role] || { lv: 99 }).lv;
  if (lv > 4) return { ok: false, code: 'PERM', error: 'Vai này không có quyền xuất bảng tính.' };

  // 2. Dữ liệu phải hợp lệ và trong trần
  var cot = Array.isArray(y.cot) ? y.cot : null;
  var dong = Array.isArray(y.dong) ? y.dong : null;
  if (!cot || !cot.length || !dong) return { ok: false, error: 'Thiếu dữ liệu bảng.' };
  if (dong.length > GITA_TRAN_DONG_XUAT)
    return { ok: false, code: 'TOOBIG', error: 'Vượt trần ' + GITA_TRAN_DONG_XUAT + ' dòng một lần xuất.' };

  var soLan = gitaDemXuat_(hoSo.u);
  if (soLan > GITA_TRAN_XUAT_NGAY)
    return { ok: false, code: 'RATE', error: 'Vượt trần ' + GITA_TRAN_XUAT_NGAY + ' lần xuất một ngày.' };

  // 3. Tạo bảng tính trong đúng thư mục
  var thuMuc = DriveApp.getFolderById(GITA_THU_MUC_XUAT);
  var maBan = String(y.maBan || '').slice(0, 40) || 'GITA-' + new Date().getTime();
  var ten = maBan + ' · ' + String(y.ten || 'Bảng dữ liệu').slice(0, 80);

  /* Dựng lưới đủ chỗ ngay từ đầu.
     SpreadsheetApp.create(ten) cho ra trang mặc định 1.000 dòng × 26 cột,
     trong khi trần xuất là 5.000 dòng — xuất từ 1.000 dòng trở lên là
     getRange ném "Those rows are out of bounds" và người dùng chỉ nhận được
     một câu báo lỗi chung chung. */
  var soDongCan = dong.length + 1;
  var soCotCan  = Math.max(cot.length, 1);
  var ss = SpreadsheetApp.create(ten, Math.max(soDongCan, 20), Math.max(soCotCan, 5));
  var sh = ss.getActiveSheet();
  sh.setName(String(y.ten || 'Dữ liệu').slice(0, 90));

  // Ngăn công thức: mọi ô ghi dưới dạng chuỗi, ô bắt đầu bằng = + - @ được thêm dấu nháy
  var an = function (v) {
    var t = (v === null || v === undefined) ? '' : String(v);
    return /^[=+\-@\t\r]/.test(t) ? "'" + t : t;
  };
  var bang = [cot.map(an)].concat(dong.map(function (r) { return (r || []).map(an); }));
  sh.getRange(1, 1, bang.length, cot.length).setValues(
    bang.map(function (r) {
      var d = r.slice(0, cot.length);
      while (d.length < cot.length) d.push('');
      return d;
    })
  );
  sh.getRange(1, 1, 1, cot.length).setFontWeight('bold').setBackground('#F5B942');
  sh.setFrozenRows(1);
  sh.autoResizeColumns(1, cot.length);

  // Trang thứ hai: dấu vết xuất — ai, lúc nào, từ máy nào
  var v = ss.insertSheet('Dấu vết');
  v.getRange(1, 1, 7, 2).setValues([
    ['Mã bản', maBan],
    ['Loại dữ liệu', String(y.loai || '')],
    ['Người xuất', hoSo.u],
    ['Vai', hoSo.role + ' — ' + ((ROLES[hoSo.role] || {}).ten || '')],
    ['Lúc xuất', Utilities.formatDate(new Date(), 'GMT+7', 'dd/MM/yyyy HH:mm:ss')],
    ['Số dòng', dong.length],
    ['Ghi chú', 'Tài sản của Học viện GITA. Bản này được ghi vào nhật ký và truy nguồn được theo mã bản.']
  ]);
  v.getRange(1, 1, 7, 1).setFontWeight('bold');
  v.autoResizeColumns(1, 2);

  // 4. Chuyển vào thư mục Admin, gỡ khỏi thư mục gốc của tài khoản chạy script
  var tep = DriveApp.getFileById(ss.getId());
  thuMuc.addFile(tep);
  try { DriveApp.getRootFolder().removeFile(tep); } catch (e) { /* đã ở đúng chỗ */ }
  // Không chia sẻ cho ai — Admin tự phân phối từ Drive
  try { tep.setSharing(DriveApp.Access.PRIVATE, DriveApp.Permission.NONE); } catch (e) {}

  ghiNhatKy_({
    viec: 'XUAT_SHEET', u: hoSo.u, role: hoSo.role, tier: hoSo.tier,
    goi: String(y.loai || ''), may: String(y.may || '').slice(0, 120), phien: hoSo.phien,
    chiTiet: maBan + ' · ' + dong.length + ' dòng · ' + ss.getId()
  });

  return { ok: true, url: ss.getUrl(), id: ss.getId(), maBan: maBan, soDong: dong.length };
}
