/* ═══════════════════════════════════════════════════════════════
   GITA 365 · XƯỞNG QUAY KHỚP MÔI 0 ĐỒNG (GitHub Actions + Cloudflare)

   Cloudflare Workers AI chưa có mô hình video, và cả GitHub lẫn
   Cloudflare đều không cho GPU miễn phí. Nhưng GitHub Actions trên kho
   CÔNG KHAI thì cho máy CPU miễn phí không giới hạn phút. Nên:

     trình duyệt ──quayKhopMoi──▶ Worker: lưu ảnh cảnh + tiếng thoại vào
       R2 (quay/<ma>/...), ghi việc vào D1 (quay_viec, trạng thái 'cho')
     kho công khai GITA_GH_XUONG_QUAY (vd typhuquanggita-commits/
       gita365-xuong-quay) chạy workflow theo lịch 10 phút/lần (hoặc
       được Worker gọi ngay nếu khoá GitHub có quyền kho ấy):
         GET  /quay/can           → cần bật thêm bao nhiêu máy
         POST /quay/nhan          → nhận một việc (khoá nguyên tử)
         GET  /quay/tep/<ma>/anh|am
         PUT  /quay/kq/<ma>       → nộp MP4 H.264 (SadTalker, mã nguồn mở)
         POST /quay/loi/<ma>      → báo hỏng
         POST /quay/song          → máy còn sống
       Mọi lời gọi của máy quay phải mang X-Khoa-Quay = GITA_KHOA_XUONG_QUAY.
     trình duyệt ──quayXem──▶ trạng thái; xong thì tải
       GET /quay/phim/<ma>.mp4 (công khai theo mã 32 ký tự ngẫu nhiên).

   Nội dung KHÔNG đi vào nhật ký công khai của kho quay: máy quay chỉ
   in thời gian, không in lời thoại, không đăng artifact. Tệp tự xoá sau
   7 ngày (donQuay chạy cùng lịch dọn).
   ═══════════════════════════════════════════════════════════════ */
'use strict';
import { laR01 } from './vai-tro.js';

export const QUAY = {
  toiDaAnh: 6 * 1024 * 1024,
  toiDaAm: 4 * 1024 * 1024,
  toiDaCho: 400,          // việc đang chờ của một tài khoản
  toiDaMay: 20,           // máy quay chạy song song
  quaHanNhan: 90 * 60e3,  // nhận rồi mà quá 90 phút chưa nộp → trả về hàng chờ
  lanThuToiDa: 3,
  songTrong: 4 * 60e3,    // máy báo sống trong 4 phút gần nhất
  giuCho: 8 * 60e3,       // chỗ giữ cho máy vừa bật (đang cài đặt)
  luuNgay: 7
};

const RE_MA = /^[0-9a-f]{32}$/;
const RE_MAY = /^[A-Za-z0-9._-]{1,60}$/;
let daTaoBang = false;

export async function taoBangQuay(db) {
  if (daTaoBang) return;
  await db.prepare(`CREATE TABLE IF NOT EXISTS quay_viec (
    ma TEXT PRIMARY KEY, uid TEXT NOT NULL, trangThai TEXT NOT NULL DEFAULT 'cho',
    kieuAnh TEXT, kieuAm TEXT, taoLuc INTEGER NOT NULL, nhanLuc INTEGER, xongLuc INTEGER,
    may TEXT, lanThu INTEGER NOT NULL DEFAULT 0, loi TEXT, loai TEXT NOT NULL DEFAULT 'moi')`).run();
  await db.prepare('ALTER TABLE quay_viec ADD COLUMN loai TEXT').run().catch(() => {});
  await db.prepare('ALTER TABLE quay_viec ADD COLUMN soKhung INTEGER').run().catch(() => {});
  await db.prepare('ALTER TABLE quay_viec ADD COLUMN phamVi TEXT').run().catch(() => {});
  await db.prepare('CREATE INDEX IF NOT EXISTS ix_quay_tt ON quay_viec (trangThai, taoLuc)').run();
  await db.prepare('CREATE TABLE IF NOT EXISTS quay_may (ma TEXT PRIMARY KEY, luc INTEGER NOT NULL)').run();
  daTaoBang = true;
}

function maMoi() {
  const b = new Uint8Array(16); crypto.getRandomValues(b);
  return [...b].map(x => x.toString(16).padStart(2, '0')).join('');
}
function giaiB64(s) {
  s = String(s || '').replace(/^data:[^,]*,/, '');
  if (!/^[A-Za-z0-9+/=\s]*$/.test(s)) return null;
  try {
    const nhi = atob(s.replace(/\s/g, ''));
    const u = new Uint8Array(nhi.length);
    for (let i = 0; i < nhi.length; i++) u[i] = nhi.charCodeAt(i);
    return u;
  } catch (e) { return null; }
}
function kieuAnh(u) {
  if (u.length > 3 && u[0] === 0xFF && u[1] === 0xD8) return 'image/jpeg';
  if (u.length > 8 && u[0] === 0x89 && u[1] === 0x50 && u[2] === 0x4E && u[3] === 0x47) return 'image/png';
  if (u.length > 12 && u[8] === 0x57 && u[9] === 0x45 && u[10] === 0x42 && u[11] === 0x50) return 'image/webp';
  return '';
}
function kieuAm(u) {
  if (u.length > 12 && u[0] === 0x52 && u[1] === 0x49 && u[2] === 0x46 && u[3] === 0x46 && u[8] === 0x57 && u[9] === 0x41) return 'audio/wav';
  return '';
}
export function bangNhau(a, b) {
  a = String(a || ''); b = String(b || '');
  if (!a || !b || a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

/* Gọi kho quay chạy ngay (nếu khoá GitHub có quyền kho đó). Không có
   thì thôi — lịch 10 phút/lần của kho quay sẽ tự nhặt việc. */
async function goiKhoQuay(env, db) {
  const kho = String(env.GITA_GH_XUONG_QUAY || '').trim();
  if (!env.GITA_GH_KHOA_THU || !/^[A-Za-z0-9][\w.-]*\/[A-Za-z0-9][\w.-]*$/.test(kho)) return false;
  const bay = Date.now();
  const r0 = await db.prepare("SELECT hetHan FROM chanNhip WHERE khoa = 'quayGoi'").first().catch(() => null);
  if (r0 && +r0.hetHan > bay) return false;
  await db.prepare("INSERT INTO chanNhip (khoa, dem, hetHan) VALUES ('quayGoi', 1, ?) " +
    'ON CONFLICT(khoa) DO UPDATE SET dem = dem + 1, hetHan = excluded.hetHan').bind(bay + 4 * 60e3).run();
  try {
    const r = await fetch('https://api.github.com/repos/' + kho + '/dispatches', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + env.GITA_GH_KHOA_THU,
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': 'gita365-worker',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ event_type: 'quay' })
    });
    return r.status === 204 || r.ok;
  } catch (e) { return false; }
}

/* ── LỜI GỌI CỦA TRÌNH DUYỆT (đã qua phiên đăng nhập) ── */
export async function quayKhopMoi(y, env, db, hoSo) {
  if (!laR01(hoSo)) return { ok: false, code: 'NOPERM', error: 'Chỉ Super Admin được dùng xưởng quay.' };
  if (!env.HOSO) return { ok: false, code: 'CHUA_CO_R2', error: 'Máy chủ chưa gắn R2.' };
  if (!env.GITA_KHOA_XUONG_QUAY) return { ok: false, code: 'CHUA_CO_XUONG', error: 'Máy chủ chưa có khoá xưởng quay (GITA_KHOA_XUONG_QUAY).' };
  await taoBangQuay(db);
  const anh = giaiB64(y && y.anh), am = giaiB64(y && y.am);
  if (!anh || !anh.length || anh.length > QUAY.toiDaAnh) return { ok: false, error: 'Ảnh cảnh thiếu hoặc quá lớn.' };
  if (!am || !am.length || am.length > QUAY.toiDaAm) return { ok: false, error: 'Tiếng thoại thiếu hoặc quá lớn.' };
  const ka = kieuAnh(anh), km = kieuAm(am);
  if (!ka) return { ok: false, error: 'Ảnh phải là JPEG/PNG/WEBP.' };
  if (!km) return { ok: false, error: 'Tiếng thoại phải là WAV.' };
  const uid = String(hoSo.uid || '');
  const dem = await db.prepare("SELECT COUNT(*) AS n FROM quay_viec WHERE uid = ? AND trangThai IN ('cho','dang')").bind(uid).first();
  if (dem && +dem.n >= QUAY.toiDaCho) return { ok: false, code: 'DAY', error: 'Hàng chờ xưởng quay đã đầy, đợi bớt rồi gửi tiếp.' };
  const ma = maMoi();
  await env.HOSO.put('quay/' + ma + '/anh', anh, { httpMetadata: { contentType: ka } });
  await env.HOSO.put('quay/' + ma + '/am', am, { httpMetadata: { contentType: km } });
  await db.prepare("INSERT INTO quay_viec (ma, uid, trangThai, kieuAnh, kieuAm, taoLuc) VALUES (?, ?, 'cho', ?, ?, ?)")
    .bind(ma, uid, ka, km, Date.now()).run();
  await goiKhoQuay(env, db).catch(() => false);
  return { ok: true, ma };
}

/* Chuỗi 2–4 khung của cùng một cảnh. Máy GitHub nối từng cặp bằng RIFE.
   Không có tiếng. Ảnh gốc luôn là khung đầu. */
export function tachKhung(y) {
  const raw = Array.isArray(y && y.khung) && y.khung.length >= 2
    ? y.khung
    : [y && y.anh].concat(Array.isArray(y && y.giua) ? y.giua : [], [y && y.sau]);
  return raw.filter(x => x != null && String(x).length > 0).slice(0, 4);
}
export async function quayChuyenDong(y, env, db, hoSo) {
  if (!laR01(hoSo)) return { ok: false, code: 'NOPERM', error: 'Chỉ Super Admin được dùng xưởng quay.' };
  if (!env.HOSO) return { ok: false, code: 'CHUA_CO_R2', error: 'Máy chủ chưa gắn R2.' };
  if (!env.GITA_KHOA_XUONG_QUAY) return { ok: false, code: 'CHUA_CO_XUONG', error: 'Máy chủ chưa có khoá xưởng quay (GITA_KHOA_XUONG_QUAY).' };
  await taoBangQuay(db);
  const raw = tachKhung(y);
  if (raw.length < 2) return { ok: false, error: 'Cần ít nhất hai khung.' };
  const khung = [];
  for (const s of raw) {
    const u = giaiB64(s);
    if (!u || !u.length || u.length > QUAY.toiDaAnh) return { ok: false, error: 'Một khung thiếu hoặc quá lớn.' };
    const k = kieuAnh(u);
    if (!k) return { ok: false, error: 'Mỗi khung phải là JPEG/PNG/WEBP.' };
    khung.push({ u, k });
  }
  const uid = String(hoSo.uid || '');
  const dem = await db.prepare("SELECT COUNT(*) AS n FROM quay_viec WHERE uid = ? AND trangThai IN ('cho','dang')").bind(uid).first();
  if (dem && +dem.n >= QUAY.toiDaCho) return { ok: false, code: 'DAY', error: 'Hàng chờ xưởng quay đã đầy, đợi bớt rồi gửi tiếp.' };
  const ma = maMoi();
  const dau = khung[0], cuoi = khung[khung.length - 1];
  for (let i = 0; i < khung.length; i++)
    await env.HOSO.put('quay/' + ma + '/k' + i, khung[i].u, { httpMetadata: { contentType: khung[i].k } });
  await env.HOSO.put('quay/' + ma + '/anh', dau.u, { httpMetadata: { contentType: dau.k } });
  await env.HOSO.put('quay/' + ma + '/cd', cuoi.u, { httpMetadata: { contentType: cuoi.k } });
  await db.prepare("INSERT INTO quay_viec (ma, uid, trangThai, kieuAnh, kieuAm, taoLuc, loai, soKhung) VALUES (?, ?, 'cho', ?, ?, ?, 'cd', ?)")
    .bind(ma, uid, dau.k, cuoi.k, Date.now(), khung.length).run();
  await goiKhoQuay(env, db).catch(() => false);
  return { ok: true, ma, soKhung: khung.length };
}

/* Từ khoáy nội bộ KHÔNG được xuất hiện trong phim dành cho khách.
   Phim khách chỉ dùng nhân vật AI và cốt truyện gợi ý theo hành trình
   5 tầng — không mang cơ chế Coach ra ngoài. Chủ hệ thêm từ vào đây. */
export const TU_KHOA_NOI_BO = [
  'hoa hồng', 'tỷ lệ chia', 'chiết khấu nội bộ', 'ma trận lương',
  'sơ đồ tuyến', 'chính sách đại lý', 'câu chốt đơn', 'kịch bản ép',
  'mã nội bộ', 'bảng giá sỉ', 'điểm hòa vốn', 'công thức chia'
];
export function soatLoiNhac(loi, phamVi) {
  if (phamVi !== 'khach') return null;
  const t = String(loi || '').toLowerCase();
  for (const k of TU_KHOA_NOI_BO) if (t.indexOf(k) >= 0) return k;
  return null;
}

/* Video chuyển động bằng GPU miễn phí bên ngoài (Kaggle T4 của Google).
   Ảnh nhân vật AI + lời nhắc động tác → clip vài giây. Máy Kaggle tự
   nhận việc loại 'vd' qua cùng khoá xưởng quay; máy GitHub vẫn lo 'moi'
   và 'cd' như cũ. */
export async function quayVideoDong(y, env, db, hoSo) {
  if (!laR01(hoSo)) return { ok: false, code: 'NOPERM', error: 'Chỉ Super Admin được dùng xưởng quay.' };
  if (!env.HOSO) return { ok: false, code: 'CHUA_CO_R2', error: 'Máy chủ chưa gắn R2.' };
  if (!env.GITA_KHOA_XUONG_QUAY) return { ok: false, code: 'CHUA_CO_XUONG', error: 'Máy chủ chưa có khoá xưởng quay (GITA_KHOA_XUONG_QUAY).' };
  await taoBangQuay(db);
  const anh = giaiB64(y && y.anh);
  if (!anh || !anh.length || anh.length > QUAY.toiDaAnh) return { ok: false, error: 'Ảnh nhân vật thiếu hoặc quá lớn.' };
  const ka = kieuAnh(anh);
  if (!ka) return { ok: false, error: 'Ảnh phải là JPEG/PNG/WEBP.' };
  const loi = String(y && y.loiNhac || '').replace(/[\u0000-\u001F]/g, ' ').trim().slice(0, 400);
  if (loi.length < 8) return { ok: false, error: 'Cần lời nhắc động tác (ít nhất 8 ký tự).' };
  const phamVi = String(y && y.phamVi || '') === 'noi-bo' ? 'noi-bo' : 'khach';
  const trung = soatLoiNhac(loi, phamVi);
  if (trung) return { ok: false, code: 'BI_MAT', error: 'Phim khách không được chứa “' + trung + '”. Bỏ từ đó hoặc chọn phạm vi nội bộ.' };
  const uid = String(hoSo.uid || '');
  const dem = await db.prepare("SELECT COUNT(*) AS n FROM quay_viec WHERE uid = ? AND trangThai IN ('cho','dang')").bind(uid).first();
  if (dem && +dem.n >= QUAY.toiDaCho) return { ok: false, code: 'DAY', error: 'Hàng chờ xưởng quay đã đầy, đợi bớt rồi gửi tiếp.' };
  const ma = maMoi();
  await env.HOSO.put('quay/' + ma + '/anh', anh, { httpMetadata: { contentType: ka } });
  await env.HOSO.put('quay/' + ma + '/loi', new TextEncoder().encode(loi), { httpMetadata: { contentType: 'text/plain; charset=utf-8' } });
  await db.prepare("INSERT INTO quay_viec (ma, uid, trangThai, kieuAnh, taoLuc, loai, phamVi) VALUES (?, ?, 'cho', ?, ?, 'vd', ?)")
    .bind(ma, uid, ka, Date.now(), phamVi).run();
  return { ok: true, ma, phamVi, ghiChu: 'Việc nằm trong hàng chờ. Clip xong khi máy Kaggle đang mở nhận và quay xong.' };
}

export async function quayXem(y, env, db, hoSo) {
  if (!laR01(hoSo)) return { ok: false, code: 'NOPERM', error: 'Chỉ Super Admin được dùng xưởng quay.' };
  await taoBangQuay(db);
  const ds = (Array.isArray(y && y.ds) ? y.ds : []).slice(0, 50).map(String).filter(m => RE_MA.test(m));
  const uid = String(hoSo.uid || '');
  const kq = [];
  for (const ma of ds) {
    const r = await db.prepare('SELECT rowid AS rid, ma, trangThai, taoLuc, loi FROM quay_viec WHERE ma = ? AND uid = ?').bind(ma, uid).first();
    if (!r) { kq.push({ ma, trangThai: 'mat' }); continue; }
    const o = { ma, trangThai: r.trangThai };
    if (r.trangThai === 'xong') o.url = '/quay/phim/' + ma + '.mp4';
    if (r.trangThai === 'loi') o.loi = String(r.loi || 'Máy quay không làm được cảnh này.');
    if (r.trangThai === 'cho') {
      const t = await db.prepare("SELECT COUNT(*) AS n FROM quay_viec WHERE trangThai = 'cho' AND (taoLuc < ? OR (taoLuc = ? AND rowid < ?))").bind(r.taoLuc, r.taoLuc, r.rid).first();
      o.truoc = t ? +t.n : 0;
    }
    kq.push(o);
  }
  const may = await db.prepare('SELECT COUNT(*) AS n FROM quay_may WHERE luc > ?').bind(Date.now() - QUAY.songTrong).first();
  return { ok: true, ds: kq, mayDangChay: may ? +may.n : 0 };
}

/* ── LỜI GỌI CỦA MÁY QUAY (GitHub Actions) ── */
function traMay(o, status) {
  return new Response(JSON.stringify(o), { status: status || 200,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } });
}

async function traVeHang(db) {
  const bay = Date.now();
  await db.prepare("UPDATE quay_viec SET trangThai = 'loi', loi = 'Thử ' || lanThu || ' lần vẫn không xong.', xongLuc = ? " +
    "WHERE trangThai = 'dang' AND nhanLuc < ? AND lanThu >= ?").bind(bay, bay - QUAY.quaHanNhan, QUAY.lanThuToiDa).run();
  await db.prepare("UPDATE quay_viec SET trangThai = 'cho', may = NULL WHERE trangThai = 'dang' AND nhanLuc < ?")
    .bind(bay - QUAY.quaHanNhan).run();
}

async function demCan(db) {
  await traVeHang(db);
  const bay = Date.now();
  const c = await db.prepare("SELECT COUNT(*) AS n FROM quay_viec WHERE trangThai = 'cho'").first();
  const d = await db.prepare("SELECT COUNT(*) AS n FROM quay_viec WHERE trangThai = 'dang'").first();
  const s = await db.prepare('SELECT COUNT(*) AS n FROM quay_may WHERE luc > ?').bind(bay - QUAY.songTrong).first();
  const cho = c ? +c.n : 0, dang = d ? +d.n : 0, song = s ? +s.n : 0;
  const muon = Math.min(QUAY.toiDaMay, cho + dang);
  return { cho, dang, song, can: cho ? Math.max(0, muon - song) : 0 };
}

export async function xuLyMayQuay(req, env, duong) {
  if (!env.GITA_KHOA_XUONG_QUAY || !bangNhau(req.headers.get('X-Khoa-Quay'), env.GITA_KHOA_XUONG_QUAY))
    return traMay({ ok: false, error: 'Sai khoá.' }, 401);
  const db = env.CSDL;
  await taoBangQuay(db);
  const bay = Date.now();

  if (req.method === 'GET' && duong === '/quay/can') {
    const k = await demCan(db);
    /* Giữ chỗ cho số máy sắp bật, để lượt lịch sau không bật trùng. */
    for (let i = 0; i < k.can; i++)
      await db.prepare('INSERT OR REPLACE INTO quay_may (ma, luc) VALUES (?, ?)').bind('giu-' + maMoi().slice(0, 12), bay + QUAY.giuCho - QUAY.songTrong).run();
    await db.prepare('DELETE FROM quay_may WHERE luc < ?').bind(bay - 24 * 3600e3).run();
    return traMay({ ok: true, can: k.can, cho: k.cho });
  }

  if (req.method === 'POST' && (duong === '/quay/song' || duong === '/quay/nhan')) {
    let y = {}; try { y = await req.json(); } catch (e) {}
    const may = RE_MAY.test(String(y.may || '')) ? String(y.may) : '';
    if (!may) return traMay({ ok: false, error: 'Thiếu tên máy.' }, 400);
    await db.prepare('INSERT OR REPLACE INTO quay_may (ma, luc) VALUES (?, ?)').bind(may, bay).run();
    if (duong === '/quay/song') return traMay({ ok: true });
    await traVeHang(db);
    /* Máy khai loai='vd' chỉ nhận việc video (máy Kaggle). Không khai
       thì nhận mọi loại — giữ nguyên hành vi máy GitHub cũ. */
    const chiLoai = ['moi', 'cd', 'vd'].indexOf(String(y.loai || '')) >= 0 ? String(y.loai) : '';
    for (let lan = 0; lan < 5; lan++) {
      const r = chiLoai
        ? await db.prepare("SELECT ma, kieuAnh, kieuAm, loai, soKhung, phamVi FROM quay_viec WHERE trangThai = 'cho' AND loai = ? ORDER BY taoLuc, rowid LIMIT 1").bind(chiLoai).first()
        : await db.prepare("SELECT ma, kieuAnh, kieuAm, loai, soKhung, phamVi FROM quay_viec WHERE trangThai = 'cho' ORDER BY taoLuc, rowid LIMIT 1").first();
      if (!r) return traMay({ ok: true, ma: null });
      const u = await db.prepare("UPDATE quay_viec SET trangThai = 'dang', nhanLuc = ?, may = ?, lanThu = lanThu + 1 WHERE ma = ? AND trangThai = 'cho'")
        .bind(bay, may, r.ma).run();
      if (u && u.meta && u.meta.changes === 1) {
        const duoi = function (k) { return k === 'image/png' ? 'png' : k === 'image/webp' ? 'webp' : 'jpg'; };
        return traMay({ ok: true, ma: r.ma, loai: r.loai || 'moi', soKhung: r.soKhung || 0, phamVi: r.phamVi || '',
          duoiAnh: duoi(r.kieuAnh), duoiCd: duoi(r.kieuAm) });
      }
    }
    return traMay({ ok: true, ma: null });
  }

  const m = /^\/quay\/(tep|kq|loi)\/([0-9a-f]{32})(?:\/(anh|am|cd|loi|k[0-3]))?$/.exec(duong);
  if (!m) return traMay({ ok: false, error: 'Không có đường này.' }, 404);
  const [, viec, ma, tep] = m;
  const r = await db.prepare('SELECT trangThai FROM quay_viec WHERE ma = ?').bind(ma).first();
  if (!r) return traMay({ ok: false, error: 'Không có việc này.' }, 404);

  if (viec === 'tep' && req.method === 'GET' && tep) {
    const o = await env.HOSO.get('quay/' + ma + '/' + tep);
    if (!o) return traMay({ ok: false, error: 'Mất tệp.' }, 404);
    return new Response(o.body, { status: 200, headers: { 'Content-Type': (o.httpMetadata && o.httpMetadata.contentType) || 'application/octet-stream', 'Cache-Control': 'no-store' } });
  }
  if (r.trangThai !== 'dang') return traMay({ ok: false, error: 'Việc không ở trạng thái đang quay.' }, 409);
  if (viec === 'kq' && req.method === 'PUT' && !tep) {
    const dai = +req.headers.get('Content-Length') || 0;
    if (dai > 95 * 1024 * 1024) return traMay({ ok: false, error: 'Tệp quá lớn.' }, 413);
    const buf = new Uint8Array(await req.arrayBuffer());
    if (buf.length < 1000 || !(buf[4] === 0x66 && buf[5] === 0x74 && buf[6] === 0x79 && buf[7] === 0x70))
      return traMay({ ok: false, error: 'Không phải MP4.' }, 400);
    await env.HOSO.put('quay/' + ma + '/kq.mp4', buf, { httpMetadata: { contentType: 'video/mp4' } });
    await db.prepare("UPDATE quay_viec SET trangThai = 'xong', xongLuc = ?, loi = NULL WHERE ma = ?").bind(bay, ma).run();
    return traMay({ ok: true });
  }
  if (viec === 'loi' && req.method === 'POST' && !tep) {
    let y = {}; try { y = await req.json(); } catch (e) {}
    const loi = String(y.loi || 'Máy quay báo hỏng.').replace(/[\u0000-\u001F]/g, ' ').slice(0, 200);
    const tamThoi = !!y.tamThoi;
    if (tamThoi) await db.prepare("UPDATE quay_viec SET trangThai = 'cho', may = NULL WHERE ma = ? AND lanThu < ?").bind(ma, QUAY.lanThuToiDa).run();
    await db.prepare("UPDATE quay_viec SET trangThai = 'loi', loi = ?, xongLuc = ? WHERE ma = ? AND trangThai = 'dang'").bind(loi, bay, ma).run();
    return traMay({ ok: true });
  }
  return traMay({ ok: false, error: 'Không có đường này.' }, 404);
}

/* ── PHIM ĐÃ QUAY: công khai theo mã ngẫu nhiên 128 bit ── */
export async function phucVuPhimQuay(req, env, duong) {
  const m = /^\/quay\/phim\/([0-9a-f]{32})\.mp4$/.exec(duong);
  const dau = { 'Access-Control-Allow-Origin': '*', 'Cross-Origin-Resource-Policy': 'cross-origin', 'X-Content-Type-Options': 'nosniff' };
  if (!m || !env.HOSO) return new Response('Không có phim này.', { status: 404, headers: dau });
  const o = await env.HOSO.get('quay/' + m[1] + '/kq.mp4');
  if (!o) return new Response('Không có phim này.', { status: 404, headers: dau });
  dau['Content-Type'] = 'video/mp4';
  dau['Content-Length'] = String(o.size);
  dau['Cache-Control'] = 'private, max-age=86400';
  return new Response(req.method === 'HEAD' ? null : o.body, { status: 200, headers: dau });
}

/* ── DỌN: xoá việc + tệp quá 7 ngày ── */
export async function donQuay(env) {
  const db = env.CSDL;
  await taoBangQuay(db);
  const moc = Date.now() - QUAY.luuNgay * 86400e3;
  const ds = await db.prepare('SELECT ma FROM quay_viec WHERE taoLuc < ? LIMIT 500').bind(moc).all();
  const ma = ((ds && ds.results) || []).map(r => r.ma);
  if (env.HOSO && ma.length) {
    const khoa = [];
    ma.forEach(m => khoa.push('quay/' + m + '/anh', 'quay/' + m + '/am', 'quay/' + m + '/cd', 'quay/' + m + '/loi', 'quay/' + m + '/k0', 'quay/' + m + '/k1', 'quay/' + m + '/k2', 'quay/' + m + '/k3', 'quay/' + m + '/kq.mp4'));
    for (let i = 0; i < khoa.length; i += 900) await env.HOSO.delete(khoa.slice(i, i + 900));
  }
  const r = await db.prepare('DELETE FROM quay_viec WHERE taoLuc < ?').bind(moc).run();
  await db.prepare('DELETE FROM quay_may WHERE luc < ?').bind(Date.now() - 86400e3).run();
  return (r && r.meta && r.meta.changes) || 0;
}
