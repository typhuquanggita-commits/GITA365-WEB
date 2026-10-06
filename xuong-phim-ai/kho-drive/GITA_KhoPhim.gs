/* ═══════════════════════════════════════════════════════════════
   GITA 365 · KHO PHIM TRÊN GOOGLE DRIVE (Apps Script, chạy bằng tài khoản Drive 2TB của chủ hệ)

   Một dự án Apps Script RIÊNG (không đụng máy chủ GITA hiện có). Nó là "trạm miễn phí":
     · giữ thư mục  GITA365 · Kho phim/  { Phim/<năm-tháng>/ · Cast/ · Viec/ · Mo-hinh/ }
     · nhận ảnh mẫu nhân vật từ app → Cast/
     · nhận việc làm phim từ app → Viec/ → gọi GitHub Action (Kaggle GPU miễn phí) nếu đã nối
     · mở "phiên tải lên" cho máy dựng phim → phim đi THẲNG vào Drive (không giới hạn 50MB)
     · liệt kê phim cho app, bật/tắt chia sẻ link

   Hai khoá (tạo tự động khi chạy caiDat):
     KHOA_APP — app GITA dùng (xem kho, gửi ảnh, gửi việc)
     KHOA_MAY — máy dựng phim dùng (đọc việc, báo tiến độ, tải phim lên)
   Tuỳ chọn (Project Settings → Script properties) để tự gọi máy dựng miễn phí:
     GH_TOKEN — GitHub token (quyền Actions/Contents: write của repo) · GH_REPO — vd typhuquanggita-commits/GITA365-WEB

   Cài: xem README-kho-drive.md (dán mã → chạy caiDat → Deploy Web app: Execute as Me, Anyone).
   ═══════════════════════════════════════════════════════════════ */
const TEN_GOC = 'GITA365 · Kho phim';
const MA = /^[a-z0-9-]{1,40}$/i;
const MA_VIEC = /^[a-z0-9]{8,40}$/;

function props_() { return PropertiesService.getScriptProperties(); }
function tra_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
function khoa_() { return (Utilities.getUuid() + Utilities.getUuid()).replace(/-/g, '').slice(0, 48); }
function layHoacTao_(cha, ten) { const it = cha.getFoldersByName(ten); return it.hasNext() ? it.next() : cha.createFolder(ten); }
function bang_(a, b) {                               // so khớp không lộ thời gian
  if (!a || !b || a.length !== b.length) return false;
  let d = 0; for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

/* ── Chạy MỘT LẦN trong trình soạn Apps Script: tạo thư mục + khoá ── */
function caiDat() {
  const p = props_();
  const goc = layHoacTao_(DriveApp.getRootFolder(), TEN_GOC);
  const tm = { goc: goc.getId() };
  ['Phim', 'Cast', 'Viec', 'Mo-hinh'].forEach(function (t) { tm[t] = layHoacTao_(goc, t).getId(); });
  p.setProperty('THU_MUC', JSON.stringify(tm));
  if (!p.getProperty('KHOA_APP')) p.setProperty('KHOA_APP', khoa_());
  if (!p.getProperty('KHOA_MAY')) p.setProperty('KHOA_MAY', khoa_());
  Logger.log('✅ Đã tạo "' + TEN_GOC + '" trong Drive.');
  Logger.log('KHOA_APP (dán vào app GITA → Kho phim → Cài đặt): ' + p.getProperty('KHOA_APP'));
  Logger.log('KHOA_MAY (đặt secret KHO_DRIVE_KHOA trên GitHub): ' + p.getProperty('KHOA_MAY'));
  Logger.log('Dung lượng: ' + Math.round(DriveApp.getStorageUsed() / 1e9) + 'GB / ' + Math.round(DriveApp.getStorageLimit() / 1e9) + 'GB');
}

function doGet() { return tra_({ ok: true, ten: 'Kho phim GITA365' }); }

function doPost(e) {
  let b;
  try { b = JSON.parse(e.postData.contents); } catch (x) { return tra_({ loi: 'Dữ liệu không hợp lệ.' }); }
  const p = props_();
  const app = bang_(String(b.khoa || ''), p.getProperty('KHOA_APP') || '');
  const may = bang_(String(b.khoa || ''), p.getProperty('KHOA_MAY') || '');
  if (!app && !may) return tra_({ loi: 'Sai khoá kho.' });
  const tm = JSON.parse(p.getProperty('THU_MUC') || 'null');
  if (!tm) return tra_({ loi: 'Kho chưa cài — chạy caiDat() một lần.' });
  try {
    switch (b.viec) {
      case 'kiemTra': return tra_({ ok: true, daDung: DriveApp.getStorageUsed(), toiDa: DriveApp.getStorageLimit(), noiMay: !!p.getProperty('GH_TOKEN'), thuMuc: tm.goc });
      case 'trangThai': return tra_(docTT_(tm, b.jobid));
      case 'danhSach': if (app) return tra_({ phim: danhSach_(tm) }); break;
      case 'chiaSe': if (app) return tra_(chiaSe_(tm, b.id, !!b.congKhai)); break;
      case 'xoa': if (app) return tra_(xoa_(tm, b.id)); break;
      case 'taiAnh': if (app) return tra_(taiAnh_(tm, b)); break;
      case 'datViec': if (app) return tra_(datViec_(tm, b)); break;
      case 'docViec': if (may) return tra_(docViec_(tm, b.jobid)); break;
      case 'baoViec': if (may) return tra_(baoViec_(tm, b)); break;
      case 'phienTaiLen': if (may) return tra_(phienTaiLen_(tm, b)); break;
      case 'xongTaiLen': if (may) return tra_(xongTaiLen_(tm, b)); break;
    }
    return tra_({ loi: 'Việc không hợp lệ hoặc khoá không đủ quyền.' });
  } catch (x) {
    return tra_({ loi: String((x && x.message) || x).slice(0, 300) });
  }
}

/* ── tệp có nằm trong một thư mục của kho không (chặn đụng tệp khác trong Drive) ── */
function thuoc_(file, idThuMuc, sau) {
  let ds = [file.getParents()];
  for (let tang = 0; tang < (sau || 3); tang++) {
    const tiep = [];
    for (const it of ds) while (it.hasNext()) { const f = it.next(); if (f.getId() === idThuMuc) return true; tiep.push(f.getParents()); }
    ds = tiep;
  }
  return false;
}
function tepKho_(tm, id, thuMuc) {
  if (!/^[A-Za-z0-9_-]{10,80}$/.test(String(id || ''))) throw new Error('Mã tệp không hợp lệ.');
  const f = DriveApp.getFileById(id);
  if (!thuoc_(f, tm[thuMuc])) throw new Error('Tệp không thuộc kho ' + thuMuc + '.');
  return f;
}

/* ── PHIM ── */
function danhSach_(tm) {
  const ra = [];
  const them = function (f, thu) {
    const m = f.getMimeType();
    if (m.indexOf('video/') !== 0) return;
    ra.push({ id: f.getId(), ten: f.getName(), kichThuoc: f.getSize(), ngay: f.getDateCreated().toISOString(), thuMuc: thu,
      congKhai: f.getSharingAccess() === DriveApp.Access.ANYONE_WITH_LINK, moTa: f.getDescription() || '' });
  };
  const phim = DriveApp.getFolderById(tm.Phim);
  let it = phim.getFiles(); while (it.hasNext()) them(it.next(), '');
  const con = phim.getFolders();
  while (con.hasNext()) { const d = con.next(); it = d.getFiles(); while (it.hasNext()) them(it.next(), d.getName()); }
  ra.sort(function (a, b) { return a.ngay < b.ngay ? 1 : -1; });
  return ra.slice(0, 300);
}
function chiaSe_(tm, id, congKhai) {
  const f = tepKho_(tm, id, 'Phim');
  if (congKhai) f.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  else f.setSharing(DriveApp.Access.PRIVATE, DriveApp.Permission.NONE);
  return { ok: true, congKhai: congKhai, link: 'https://drive.google.com/file/d/' + id + '/view' };
}
function xoa_(tm, id) { tepKho_(tm, id, 'Phim').setTrashed(true); return { ok: true }; }   // vào Thùng rác 30 ngày

/* ── ẢNH MẪU ── */
function taiAnh_(tm, b) {
  const m = typeof b.data === 'string' && b.data.match(/^data:image\/jpeg;base64,([A-Za-z0-9+/=]+)$/);
  if (!m || !MA.test(String(b.id || ''))) throw new Error('Ảnh không hợp lệ (cần JPEG).');
  const bytes = Utilities.base64Decode(m[1]);
  if (bytes.length > 4 * 1024 * 1024) throw new Error('Ảnh quá lớn (tối đa 4MB).');
  const cast = DriveApp.getFolderById(tm.Cast), ten = b.id + '.jpg';
  const cu = cast.getFilesByName(ten); while (cu.hasNext()) cu.next().setTrashed(true);
  const f = cast.createFile(Utilities.newBlob(bytes, 'image/jpeg', ten));
  return { id: f.getId() };
}

/* ── VIỆC LÀM PHIM ── */
function docTT_(tm, jobid) {
  if (!MA_VIEC.test(String(jobid || ''))) throw new Error('Mã việc không hợp lệ.');
  const it = DriveApp.getFolderById(tm.Viec).getFilesByName(jobid + '.tt.json');
  return it.hasNext() ? JSON.parse(it.next().getBlob().getDataAsString()) : { loi: 'Không thấy việc.' };
}
function ghiTT_(tm, jobid, them) {
  const lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    const viec = DriveApp.getFolderById(tm.Viec), it = viec.getFilesByName(jobid + '.tt.json');
    const f = it.hasNext() ? it.next() : null;
    const cu = f ? JSON.parse(f.getBlob().getDataAsString()) : { jobid: jobid };
    const moi = Object.assign(cu, them, { capNhat: new Date().toISOString() });
    if (f) f.setContent(JSON.stringify(moi)); else viec.createFile(jobid + '.tt.json', JSON.stringify(moi), 'application/json');
    return moi;
  } finally { lock.releaseLock(); }
}
function datViec_(tm, b) {
  const kh = b.ke_hoach;
  if (!kh || !Array.isArray(kh.canh) || !kh.canh.length || kh.canh.length > 20 || !Array.isArray(kh.nhan_vat))
    throw new Error('Kế hoạch phim không hợp lệ (1–20 cảnh).');
  kh.nhan_vat.forEach(function (n) { if (!MA.test(String(n.id || ''))) throw new Error('Nhân vật không hợp lệ.'); if (n.anh) tepKho_(tm, n.anh, 'Cast'); });
  const jobid = Utilities.getUuid().replace(/-/g, '').slice(0, 16);
  DriveApp.getFolderById(tm.Viec).createFile(jobid + '.json', JSON.stringify(kh), 'application/json');
  ghiTT_(tm, jobid, { trangThai: 'queued', buoc: 'Đã nhận kịch bản, đang gọi máy dựng…', phanTram: 2, tao: new Date().toISOString(), tieuDe: kh.tieu_de || '' });
  const p = props_(), tok = p.getProperty('GH_TOKEN'), repo = p.getProperty('GH_REPO');
  if (!tok || !repo) {
    ghiTT_(tm, jobid, { buoc: 'Đã lưu việc vào Drive. Chưa nối máy dựng tự động — chạy Action "Dựng phim từ kho Drive" với mã ' + jobid });
    return { jobid: jobid, trangThai: 'queued', noiMay: false };
  }
  const r = UrlFetchApp.fetch('https://api.github.com/repos/' + repo + '/dispatches', {
    method: 'post', contentType: 'application/json', muteHttpExceptions: true,
    headers: { Authorization: 'Bearer ' + tok, Accept: 'application/vnd.github+json', 'User-Agent': 'gita-kho-phim' },
    payload: JSON.stringify({ event_type: 'dung-phim-drive', client_payload: { jobid: jobid } })
  });
  if (r.getResponseCode() !== 204) {
    ghiTT_(tm, jobid, { trangThai: 'error', buoc: 'Không gọi được GitHub Action (mã ' + r.getResponseCode() + ') — kiểm tra GH_TOKEN/GH_REPO.' });
    return { jobid: jobid, trangThai: 'error' };
  }
  return { jobid: jobid, trangThai: 'queued', noiMay: true };
}
function docViec_(tm, jobid) {
  if (!MA_VIEC.test(String(jobid || ''))) throw new Error('Mã việc không hợp lệ.');
  const it = DriveApp.getFolderById(tm.Viec).getFilesByName(jobid + '.json');
  if (!it.hasNext()) throw new Error('Không thấy việc ' + jobid);
  const kh = JSON.parse(it.next().getBlob().getDataAsString()), anh = {};
  kh.nhan_vat.forEach(function (n) { if (n.anh) anh[n.id] = Utilities.base64Encode(tepKho_(tm, n.anh, 'Cast').getBlob().getBytes()); });
  return { ke_hoach: kh, anh: anh };
}
function baoViec_(tm, b) {
  if (!MA_VIEC.test(String(b.jobid || ''))) throw new Error('Mã việc không hợp lệ.');
  const o = {};
  ['trangThai', 'buoc', 'phanTram'].forEach(function (k) { if (b[k] !== undefined) o[k] = b[k]; });
  if (o.trangThai === 'done') o.xong = new Date().toISOString();
  return ghiTT_(tm, b.jobid, o);
}
/* Mở phiên tải lên có thể nối tiếp (resumable) bằng quyền của script — máy dựng PUT thẳng vào Drive,
   không cầm token Google nào. Phiên chỉ tạo được một tệp, trong Phim/<năm-tháng>/, sống tối đa 1 tuần. */
function phienTaiLen_(tm, b) {
  if (!MA_VIEC.test(String(b.jobid || ''))) throw new Error('Mã việc không hợp lệ.');
  const co = Number(b.kichThuoc);
  if (!(co > 0 && co < 20e9)) throw new Error('Kích thước tệp không hợp lệ.');
  const thang = Utilities.formatDate(new Date(), 'Asia/Ho_Chi_Minh', 'yyyy-MM');
  const thu = layHoacTao_(DriveApp.getFolderById(tm.Phim), thang);
  const ten = String(b.ten || ('gita-' + b.jobid + '.mp4')).replace(/[\\/:*?"<>|]+/g, ' ').slice(0, 120);
  const r = UrlFetchApp.fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable', {
    method: 'post', contentType: 'application/json; charset=UTF-8', muteHttpExceptions: true,
    headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken(), 'X-Upload-Content-Type': 'video/mp4', 'X-Upload-Content-Length': String(co) },
    payload: JSON.stringify({ name: ten, parents: [thu.getId()], mimeType: 'video/mp4', description: 'GITA365 · việc ' + b.jobid })
  });
  const h = r.getHeaders(), loc = h.Location || h.location;
  if (r.getResponseCode() !== 200 || !loc) throw new Error('Drive không mở được phiên tải lên (mã ' + r.getResponseCode() + ').');
  return { uploadUrl: loc };
}
function xongTaiLen_(tm, b) {
  const f = tepKho_(tm, b.fileId, 'Phim');
  const k = b.ban === 'phude' ? 'phimPhuDeId' : 'phimId', o = {}; o[k] = f.getId();
  return ghiTT_(tm, b.jobid, o);
}
