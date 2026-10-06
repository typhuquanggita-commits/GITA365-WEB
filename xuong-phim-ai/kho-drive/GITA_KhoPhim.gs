/* ═══════════════════════════════════════════════════════════════
   GITA 365 · KHO PHIM TRÊN GOOGLE DRIVE (Apps Script, chạy bằng tài khoản Drive 2TB của chủ hệ)

   Một dự án Apps Script RIÊNG (không đụng máy chủ GITA hiện có). Nó là "trạm miễn phí":
     · giữ thư mục  GITA365 · Kho phim/  { Phim/<năm-tháng>/ · Cast/ · Viec/ · Mo-hinh/ }
     · nhận ảnh mẫu nhân vật từ app → Cast/
     · nhận việc làm phim từ app → Viec/ → gọi GitHub Action (Kaggle GPU miễn phí) nếu đã nối
     · mở "phiên tải lên" cho máy dựng phim → phim đi THẲNG vào Drive (không giới hạn 50MB)
     · liệt kê phim cho app, bật/tắt chia sẻ link
     · DỰ ÁN PHIM: Du-an/<tên>/{Quay-that, Stock, AI} — chủ hệ thả tệp cảnh 01.mp4, 02.mov…; máy ráp
       tải về (mở link tạm thời, ráp xong khoá lại) → phim thành phẩm vào Phim/<tháng>/

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
      case 'taoDuAn': if (app) return tra_(taoDuAn_(tm, b.ten)); break;
      case 'dsDuAn': return tra_({ tep: dsDuAn_(tm, b.duAn) });
      case 'datAI': if (app) return tra_(datViec_(tm, b, 'dung-phim-drive', true)); break;
      case 'datRap': if (app) return tra_(datViec_(tm, b, 'rap-phim-drive', true)); break;
      case 'moTai': if (may) return tra_(moTai_(tm, b.jobid, b.nhom)); break;
      case 'dongTai': if (may) return tra_(dongTai_(tm, b.jobid)); break;
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
function datViec_(tm, b, suKien, laDuAn) {
  const kh = b.ke_hoach;
  if (laDuAn) { duAn_(tm, kh && kh.du_an); kh.chi_clip = suKien === 'dung-phim-drive' && !b.tron; kh.tron = !!b.tron; }
  if (!kh || !Array.isArray(kh.canh) || !kh.canh.length || kh.canh.length > 20 || !Array.isArray(kh.nhan_vat))
    throw new Error('Kế hoạch phim không hợp lệ (1–20 cảnh).');
  kh.nhan_vat.forEach(function (n) { if (!MA.test(String(n.id || ''))) throw new Error('Nhân vật không hợp lệ.'); if (n.anh) tepKho_(tm, n.anh, 'Cast'); });
  const jobid = Utilities.getUuid().replace(/-/g, '').slice(0, 16);
  DriveApp.getFolderById(tm.Viec).createFile(jobid + '.json', JSON.stringify(kh), 'application/json');
  ghiTT_(tm, jobid, { trangThai: 'queued', buoc: 'Đã nhận kịch bản, đang gọi máy dựng…', phanTram: 2, tao: new Date().toISOString(), tieuDe: kh.tieu_de || '' });
  const p = props_(), tok = p.getProperty('GH_TOKEN'), repo = p.getProperty('GH_REPO');
  if (!tok || !repo) {
    ghiTT_(tm, jobid, { buoc: 'Đã lưu việc vào Drive. Chưa nối máy dựng tự động — chạy Action "' + (suKien === 'rap-phim-drive' ? 'Ráp phim dự án từ Drive' : 'Dựng phim từ kho Drive') + '" với mã ' + jobid });
    return { jobid: jobid, trangThai: 'queued', noiMay: false };
  }
  const r = UrlFetchApp.fetch('https://api.github.com/repos/' + repo + '/dispatches', {
    method: 'post', contentType: 'application/json', muteHttpExceptions: true,
    headers: { Authorization: 'Bearer ' + tok, Accept: 'application/vnd.github+json', 'User-Agent': 'gita-kho-phim' },
    payload: JSON.stringify({ event_type: suKien || 'dung-phim-drive', client_payload: { jobid: jobid } })
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
  let thu, ten;
  if (b.duAn) {                                     // cảnh AI của dự án → Du-an/<tên>/AI/<số>.mp4
    if (!/^\d{2,3}\.mp4$/.test(String(b.ten || ''))) throw new Error('Tên cảnh AI phải dạng 05.mp4');
    thu = layHoacTao_(duAn_(tm, b.duAn), 'AI'); ten = b.ten;
    const cu = thu.getFilesByName(ten); while (cu.hasNext()) cu.next().setTrashed(true);
  } else {
    thu = layHoacTao_(DriveApp.getFolderById(tm.Phim), Utilities.formatDate(new Date(), 'Asia/Ho_Chi_Minh', 'yyyy-MM'));
    ten = String(b.ten || ('gita-' + b.jobid + '.mp4')).replace(/[\\/:*?"<>|]+/g, ' ').slice(0, 120);
  }
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
  if (b.ban === 'ai') { tepKho_(tm, b.fileId, 'Du-an'); return ghiTT_(tm, b.jobid, { canhAI: (docTT_(tm, b.jobid).canhAI || 0) + 1 }); }
  const f = tepKho_(tm, b.fileId, 'Phim');
  const k = b.ban === 'phude' ? 'phimPhuDeId' : 'phimId', o = {}; o[k] = f.getId();
  return ghiTT_(tm, b.jobid, o);
}

/* ── DỰ ÁN PHIM ── */
function gocDuAn_(tm) {
  if (!tm['Du-an']) {
    tm['Du-an'] = layHoacTao_(DriveApp.getFolderById(tm.goc), 'Du-an').getId();
    props_().setProperty('THU_MUC', JSON.stringify(tm));
  }
  return DriveApp.getFolderById(tm['Du-an']);
}
function duAn_(tm, id) {
  if (!/^[A-Za-z0-9_-]{10,80}$/.test(String(id || ''))) throw new Error('Mã dự án không hợp lệ.');
  const d = DriveApp.getFolderById(id), goc = gocDuAn_(tm).getId(), cha = d.getParents();
  while (cha.hasNext()) if (cha.next().getId() === goc) return d;
  throw new Error('Thư mục không thuộc Du-an của kho.');
}
const NHOM_ = { 'Quay-that': 'quay', 'Stock': 'stock', 'AI': 'ai', 'Nhac': 'nhac', 'Anh': 'anh', 'Giong': 'giong' };
function taoDuAn_(tm, ten) {
  const t = String(ten || '').replace(/[\\/:*?"<>|]+/g, ' ').trim().slice(0, 80);
  if (!t) throw new Error('Thiếu tên dự án.');
  const d = layHoacTao_(gocDuAn_(tm), t);
  Object.keys(NHOM_).forEach(function (x) { layHoacTao_(d, x); });
  return { id: d.getId(), ten: t, link: 'https://drive.google.com/drive/folders/' + d.getId() };
}
function dsDuAn_(tm, id) {
  const d = duAn_(tm, id), ra = [], con = d.getFolders();
  while (con.hasNext()) {
    const f = con.next(), nhom = NHOM_[f.getName()]; if (!nhom) continue;
    const it = f.getFiles();
    while (it.hasNext()) {
      const x = it.next();
      const ten = x.getName();
      const m = nhom === 'nhac' || nhom === 'giong' ? (/^[^\\/]{1,100}\.(mp3|wav|m4a)$/i.test(ten) ? [0, nhom] : null)
              : nhom === 'anh' ? ten.match(/^(\d{2,3})\.(jpg|jpeg|png)$/i)          // ảnh khung đầu của cảnh
              : ten.match(/^(\d{2,3})\.(mp4|mov|m4v|mkv|webm)$/i);
      if (m) ra.push({ id: x.getId(), ten: x.getName(), so: m[1], nhom: nhom, kichThuoc: x.getSize(),
                       congKhai: x.getSharingAccess() === DriveApp.Access.ANYONE_WITH_LINK });
    }
  }
  return ra.sort(function (a, b) { return a.so < b.so ? -1 : 1; });
}
/* Máy ráp tải tệp cảnh về: mở "ai có link" TẠM THỜI cho đúng các tệp đang riêng tư, ghi lại để khoá lại sau */
function moTai_(tm, jobid, nhom) {
  const kh = JSON.parse(docTep_(tm, jobid + '.json')), mo = [];
  const tep = dsDuAn_(tm, kh.du_an).filter(function (t) { return !Array.isArray(nhom) || nhom.indexOf(t.nhom) >= 0; });
  tep.forEach(function (t) {
    if (!t.congKhai) { DriveApp.getFileById(t.id).setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW); mo.push(t.id); }
  });
  DriveApp.getFolderById(tm.Viec).createFile(jobid + '.mo.json', JSON.stringify(mo), 'application/json');
  return { ke_hoach: kh, tep: tep.map(function (t) { return { id: t.id, ten: t.ten, so: t.so, nhom: t.nhom }; }) };
}
function dongTai_(tm, jobid) {
  const it = DriveApp.getFolderById(tm.Viec).getFilesByName(jobid + '.mo.json');
  let n = 0;
  while (it.hasNext()) {
    const f = it.next();
    JSON.parse(f.getBlob().getDataAsString()).forEach(function (id) {
      const x = tepKho_(tm, id, 'Du-an'); x.setSharing(DriveApp.Access.PRIVATE, DriveApp.Permission.NONE); n++;
    });
    f.setTrashed(true);
  }
  return { ok: true, daKhoa: n };
}
function docTep_(tm, ten) {
  if (!/^[a-z0-9]{8,40}\.json$/.test(ten)) throw new Error('Mã việc không hợp lệ.');
  const it = DriveApp.getFolderById(tm.Viec).getFilesByName(ten);
  if (!it.hasNext()) throw new Error('Không thấy việc.');
  return it.next().getBlob().getDataAsString();
}
