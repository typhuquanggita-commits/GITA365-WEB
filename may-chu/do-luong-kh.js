/* ═══════════════════════════════════════════════════════════════
   GITA 365 — ĐO LƯỜNG TOÀN DIỆN KHÁCH HÀNG · HỒ SƠ THÁNG · XẾP HẠNG

   Đo từng hoạt động, từng trải nghiệm của mỗi nhà, gom thành HỒ SƠ THÁNG,
   chấm sáu điểm (do-luong-cham.js), xếp hạng và chia năm tầng chăm sóc —
   căn cứ để xây lộ trình cho khách, nâng cấp hệ thống, làm sản phẩm mới.

   ══ NGUỒN (đọc, không sửa sổ nào của module khác) ══
     thoiGianNgay  MỚI — giây dùng từng màn mỗi ngày (app gửi tổng dồn)
     suKienKH      MỚI — bài học xong, sát hạch, bài test, bài thi, nhật
                   ký, cảm xúc, đọc tài liệu (app gửi, có khoá chống trùng)
     danhGiaKH     MỚI — khảo sát hài lòng tháng: NPS 0–10, CSAT 1–5
     nhipXong      tick việc hôm nay        baoCaoNgay  báo cáo ngày
     soCham        lượt chạm của nhân sự    soCredit    việc được Coach duyệt
     phieuThu · kyThu · hoanTien  tài chính  lichSuTang  lên tầng
     hoSoKhach     tầng · đèn · Coach · người giới thiệu
     audit         lượt đăng nhập (DANG_NHAP)
   ══ CHỐNG BƠM SỐ ══
     · Thời gian: app gửi TỔNG DỒN của ngày, máy giữ MAX — gửi lại nhiều
       lần không cộng dồn; trần 16 giờ một màn, 16 giờ một ngày.
     · Sự kiện: khoá (nhà, người, loại, mã) UNIQUE — một bài học xong một lần.
     · Chỉ nhà tự gửi số đo của chính mình; nhân sự KHÔNG ghi được vào đây.
   ══ AI XEM GÌ ══
     · Nhà: hồ sơ tháng của mình, BẢN RÚT GỌN (không có tiềm năng, rủi ro,
       giá trị, tầng chăm sóc — đó là số nội bộ).
     · Coach (R06–R08): đủ hồ sơ + xếp hạng của các nhà mình phụ trách.
     · R01–R05: toàn hệ. Chốt báo cáo tháng: R01–R04.
     · R12 Phân tích dữ liệu: báo cáo toàn hệ ẨN DANH (không mã nhà).
   Bảng tự tạo. Không đụng giấy phép · mã hoá.
   ═══════════════════════════════════════════════════════════════ */

import { Kho } from './nen.js';
import { BAC } from './vai-tro.js';
import { PHIEN_BAN_DO, MUC, NHOM_MAN, nhomCuaMan, chamDiem, xepTang, lyDo, TANG_CS } from './do-luong-cham.js';

export const LOAI_SK = {
  bai_hoc: { min: null, max: null }, sat_hach: { min: 0, max: 100 }, test: { min: 0, max: 100 },
  bai_thi: { min: null, max: null }, nhat_ky: { min: null, max: null }, cam_xuc: { min: 1, max: 5 },
  doc_tai_lieu: { min: null, max: null }
};
const HOAN_THANH = ['bai_hoc', 'sat_hach', 'test', 'bai_thi'];
const TRAN_GIAY = 57600;

/* ═══════════ BẢNG ═══════════ */
let daTao = false;
async function taoBang(db) {
  if (daTao) return;
  await db.prepare('CREATE TABLE IF NOT EXISTS thoiGianNgay (maNha TEXT NOT NULL, uid TEXT NOT NULL, ngay TEXT NOT NULL, ' +
    'man TEXT NOT NULL, giay INTEGER NOT NULL, suaLuc TEXT, PRIMARY KEY (maNha, uid, ngay, man))').run();
  await db.prepare('CREATE INDEX IF NOT EXISTS ix_tgn_ngay ON thoiGianNgay (ngay, maNha)').run();
  await db.prepare('CREATE TABLE IF NOT EXISTS suKienKH (id TEXT PRIMARY KEY, maNha TEXT NOT NULL, uid TEXT NOT NULL, ' +
    'loai TEXT NOT NULL, giaTri REAL, ngay TEXT NOT NULL, khoaDuy TEXT NOT NULL, ghiChu TEXT, luc TEXT NOT NULL)').run();
  await db.prepare('CREATE UNIQUE INDEX IF NOT EXISTS ux_skkh_khoa ON suKienKH (khoaDuy)').run();
  await db.prepare('CREATE INDEX IF NOT EXISTS ix_skkh_nha ON suKienKH (maNha, ngay)').run();
  await db.prepare('CREATE TABLE IF NOT EXISTS danhGiaKH (maNha TEXT NOT NULL, uid TEXT NOT NULL, thang TEXT NOT NULL, ' +
    'nps INTEGER, csat INTEGER, ghiChu TEXT, luc TEXT NOT NULL, PRIMARY KEY (maNha, uid, thang))').run();
  await db.prepare('CREATE TABLE IF NOT EXISTS hoSoThang (maNha TEXT NOT NULL, thang TEXT NOT NULL, duLieu TEXT NOT NULL, ' +
    'tiemNang INTEGER, tangCS TEXT, chot INTEGER NOT NULL DEFAULT 0, boiAi TEXT, luc TEXT NOT NULL, PRIMARY KEY (maNha, thang))').run();
  daTao = true;
}

/* ═══════════ NGÀY THÁNG ═══════════ */
const homNay = () => new Date().toISOString().slice(0, 10);
const thangNay = () => homNay().slice(0, 7);
function hopLeThang(t) { return /^\d{4}-(0[1-9]|1[0-2])$/.test(String(t || '')); }
function khoangThang(t) {
  const [y, m] = t.split('-').map(Number);
  const tu = t + '-01', den = (m === 12 ? (y + 1) + '-01' : y + '-' + String(m + 1).padStart(2, '0')) + '-01';
  const soNgay = Math.round((Date.parse(den) - Date.parse(tu)) / 86400000);
  return { tu, den, soNgay };
}
function thangTruoc(t) { const [y, m] = t.split('-').map(Number); return m === 1 ? (y - 1) + '-12' : y + '-' + String(m - 1).padStart(2, '0'); }
function cachNgay(a, b) { return Math.round((Date.parse(b) - Date.parse(a)) / 86400000); }

/* ═══════════ NHÀ & QUYỀN ═══════════ */
async function maNhaCuaToi(db, hoSo) {
  if (hoSo.maKhachHang) return String(hoSo.maKhachHang);
  const nd = await Kho.nguoiTheoId(db, hoSo.uid);
  if (nd && nd.maKhachHang) return String(nd.maKhachHang);
  if (nd && nd.studentId) {
    const h = await db.prepare('SELECT maKhachHang FROM hoSoKhach WHERE maHocVien = ? LIMIT 1').bind(nd.studentId).first();
    if (h && h.maKhachHang) return String(h.maKhachHang);
  }
  return '';
}
async function vaiVoiNha(db, hoSo, maNha) {
  const lv = BAC[hoSo.role] || 99;
  if (lv <= 5) return 'ql';
  if (lv <= 8) {
    const h = await db.prepare('SELECT coach FROM hoSoKhach WHERE maKhachHang = ?').bind(maNha).first();
    if (h && String(h.coach || '') === String(hoSo.u || '')) return 'coach';
  }
  if (maNha && (await maNhaCuaToi(db, hoSo)) === maNha) return 'nha';
  return '';
}

/* ═══════════ CỬA 1 · NHÀ GỬI SỐ ĐO ═══════════
   y.thoiGian = { 'YYYY-MM-DD': { man: giay, … } } (tối đa 14 ngày gần nhất)
   y.suKien   = [ { loai, ma, giaTri?, ngay? } ] (tối đa 200) */
export async function guiSoDoKH(y, env, db, hoSo) {
  await taoBang(db);
  const lv = BAC[hoSo.role] || 99;
  if (lv < 13 || lv > 14) return { ok: false, code: 'NOPERM', error: 'Số đo do chính gia đình (Phụ huynh · Học viên) gửi từ app.' };
  const maNha = await maNhaCuaToi(db, hoSo);
  if (!maNha) return { ok: false, code: 'KHONGNHA', error: 'Tài khoản chưa gắn mã khách hàng.' };
  const x = y || {}, hn = homNay(), gio = new Date().toISOString();
  let soMan = 0, soSK = 0, boQua = 0;
  const tg = x.thoiGian && typeof x.thoiGian === 'object' ? x.thoiGian : {};
  const ngays = Object.keys(tg).filter(n => /^\d{4}-\d{2}-\d{2}$/.test(n) && n <= hn && cachNgay(n, hn) <= 14).slice(0, 14);
  for (const ngay of ngays) {
    const bang = tg[ngay] || {};
    const man = Object.keys(bang).filter(m => /^[a-z0-9-]{1,40}$/.test(m) || m === '__tong').slice(0, 120);
    let tong = 0;
    for (const m of man) {
      const g = Math.floor(Number(bang[m]));
      if (!(g > 0) || g > TRAN_GIAY) { boQua++; continue; }
      if (m !== '__tong') { tong += g; if (tong > TRAN_GIAY) { boQua++; continue; } }
      await db.prepare('INSERT INTO thoiGianNgay (maNha, uid, ngay, man, giay, suaLuc) VALUES (?,?,?,?,?,?) ' +
        'ON CONFLICT(maNha, uid, ngay, man) DO UPDATE SET giay = MAX(giay, excluded.giay), suaLuc = excluded.suaLuc')
        .bind(maNha, hoSo.uid, ngay, m, g, gio).run();
      soMan++;
    }
  }
  const ds = Array.isArray(x.suKien) ? x.suKien.slice(0, 200) : [];
  for (const s of ds) {
    const loai = String((s || {}).loai || ''), ma = String((s || {}).ma || '').slice(0, 80);
    const L = LOAI_SK[loai]; if (!L || !ma) { boQua++; continue; }
    let gt = s.giaTri == null || s.giaTri === '' ? null : Number(s.giaTri);
    if (gt != null && (!Number.isFinite(gt) || (L.min != null && gt < L.min) || (L.max != null && gt > L.max))) { boQua++; continue; }
    if (L.min != null && gt == null) { boQua++; continue; }
    const ngay = /^\d{4}-\d{2}-\d{2}$/.test(String(s.ngay || '')) && s.ngay <= hn ? s.ngay : hn;
    const r = await db.prepare('INSERT INTO suKienKH (id, maNha, uid, loai, giaTri, ngay, khoaDuy, ghiChu, luc) VALUES (?,?,?,?,?,?,?,?,?) ' +
      'ON CONFLICT(khoaDuy) DO NOTHING')
      .bind('SK-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7), maNha, hoSo.uid, loai, gt, ngay,
        maNha + ':' + hoSo.uid + ':' + loai + ':' + ma, null, gio).run();
    soSK += Number((r.meta || {}).changes || 0);
  }
  return { ok: true, maNha, soMan, soSuKienMoi: soSK, boQua };
}

/* ═══════════ CỬA 2 · KHẢO SÁT HÀI LÒNG THÁNG ═══════════ */
export async function guiDanhGiaKH(y, env, db, hoSo) {
  await taoBang(db);
  const lv = BAC[hoSo.role] || 99;
  if (lv < 13 || lv > 14) return { ok: false, code: 'NOPERM', error: 'Khảo sát dành cho gia đình.' };
  const maNha = await maNhaCuaToi(db, hoSo);
  if (!maNha) return { ok: false, code: 'KHONGNHA', error: 'Tài khoản chưa gắn mã khách hàng.' };
  const x = y || {}, nps = Number(x.nps), csat = Number(x.csat);
  if (!Number.isInteger(nps) || nps < 0 || nps > 10) return { ok: false, error: 'Điểm giới thiệu phải từ 0 tới 10.' };
  if (!Number.isInteger(csat) || csat < 1 || csat > 5) return { ok: false, error: 'Mức hài lòng phải từ 1 tới 5.' };
  await db.prepare('INSERT INTO danhGiaKH (maNha, uid, thang, nps, csat, ghiChu, luc) VALUES (?,?,?,?,?,?,?) ' +
    'ON CONFLICT(maNha, uid, thang) DO UPDATE SET nps = excluded.nps, csat = excluded.csat, ghiChu = excluded.ghiChu, luc = excluded.luc')
    .bind(maNha, hoSo.uid, thangNay(), nps, csat, String(x.ghiChu || '').slice(0, 1000), new Date().toISOString()).run();
  return { ok: true, thang: thangNay() };
}

/* ═══════════ GOM SỐ ĐO THÁNG ═══════════
   Mỗi nguồn MỘT câu truy vấn nhóm theo nhà — không chạy từng nhà một. */
async function tat(db, sql, a) { try { return ((await db.prepare(sql).bind(...a).all()).results) || []; } catch (e) { return []; } }
export async function gomThang(db, thang, maNha) {
  await taoBang(db);
  const K = khoangThang(thang), hn = homNay();
  const denThat = K.den <= hn ? K.den : (() => { const d = new Date(hn + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() + 1); return d.toISOString().slice(0, 10); })();
  const soNgay = Math.max(1, Math.min(K.soNgay, cachNgay(K.tu, denThat)));
  const f = (cot) => maNha ? ' AND ' + cot + ' = ?' : '';
  const a = (...x) => maNha ? x.concat([maNha]) : x;
  const nhaRows = await tat(db, 'SELECT maKhachHang AS maNha, tang, band, coach, trangThai, vaoLuc, uidPhuHuynh FROM hoSoKhach WHERE 1=1' + f('maKhachHang'), a());
  const D = {};
  nhaRows.forEach(n => {
    D[n.maNha] = { maNha: n.maNha, tang: Number(n.tang) || 1, band: n.band || '', coach: n.coach || '', trangThai: n.trangThai || '',
      vaoLuc: n.vaoLuc || '', uid: n.uidPhuHuynh || '', soNgayThang: soNgay, ngayHoatDong: 0, phutHocApp: 0, phutApp: 0,
      phutNhom: { hoc: 0, thucHanh: 0, baoCao: 0, ketNoi: 0, khac: 0 }, ngayApp: 0, ngayTick: 0, soBo: 0, soBaoCao: 0,
      phutHocBaoCao: 0, kpiBaoCao: null, hoanThanh: null, diemTB: null, camXuc: null, nhatKy: 0, docTaiLieu: 0, viecDuyet: 0,
      creditThuong: 0, cham: { nhan: 0, goi: 0, wow: 0 }, thuThang: 0, ltv: 0, no: 0, daHoan: false, lenTang: false,
      nps: null, csat: null, dangNhap: 0, gioiThieu: 0, imLang: null, man: {} };
    const vao = String(n.vaoLuc || '').slice(0, 10);
    D[n.maNha].moi = !!vao && cachNgay(vao, denThat) <= 14;
  });
  const g = (m) => D[m];
  const U = (sql) => sql;   /* chỉ để đọc cho dễ */
  /* hợp các ngày có hoạt động */
  const unionNgay = U("SELECT maNha, ngay FROM thoiGianNgay WHERE man = '__tong' AND giay > 0 UNION " +
    'SELECT maNha, ngay FROM nhipXong WHERE bo = 0 UNION SELECT maKhachHang AS maNha, ngay FROM baoCaoNgay UNION SELECT maNha, ngay FROM suKienKH');
  (await tat(db, 'SELECT maNha, COUNT(DISTINCT ngay) AS n FROM (' + unionNgay + ') WHERE ngay >= ? AND ngay < ?' + f('maNha') + ' GROUP BY maNha', a(K.tu, K.den)))
    .forEach(r => { if (g(r.maNha)) g(r.maNha).ngayHoatDong = Number(r.n) || 0; });
  (await tat(db, 'SELECT maNha, MAX(ngay) AS m FROM (' + unionNgay + ') WHERE ngay < ?' + f('maNha') + ' GROUP BY maNha', a(denThat)))
    .forEach(r => { if (g(r.maNha) && r.m) g(r.maNha).imLang = Math.max(0, cachNgay(r.m, denThat) - 1); });
  Object.values(D).forEach(d => { if (d.imLang == null) { const vao = String(d.vaoLuc || '').slice(0, 10); d.imLang = vao ? Math.max(0, cachNgay(vao < K.tu ? K.tu : vao, denThat) - 1) : soNgay; } });
  /* thời gian dùng app theo màn */
  (await tat(db, 'SELECT maNha, man, SUM(giay) AS s, COUNT(DISTINCT ngay) AS n FROM thoiGianNgay WHERE ngay >= ? AND ngay < ?' + f('maNha') + ' GROUP BY maNha, man', a(K.tu, K.den)))
    .forEach(r => { const d = g(r.maNha); if (!d) return; const p = (Number(r.s) || 0) / 60;
      if (r.man === '__tong') { d.phutApp = Math.round(p); d.ngayApp = Number(r.n) || 0; return; }
      d.man[r.man] = Math.round(p); const nh = nhomCuaMan(r.man); d.phutNhom[nh] = Math.round((d.phutNhom[nh] || 0) + p);
      if (nh === 'hoc') d.phutHocApp = Math.round(d.phutHocApp + p); });
  Object.values(D).forEach(d => { if (!d.phutApp) d.phutApp = Object.values(d.man).reduce((s, x) => s + x, 0); });
  /* sự kiện học tập */
  (await tat(db, 'SELECT maNha, loai, COUNT(*) AS n, AVG(giaTri) AS tb FROM suKienKH WHERE ngay >= ? AND ngay < ?' + f('maNha') + ' GROUP BY maNha, loai', a(K.tu, K.den)))
    .forEach(r => { const d = g(r.maNha); if (!d) return; const n = Number(r.n) || 0;
      if (HOAN_THANH.indexOf(r.loai) >= 0) d.hoanThanh = (d.hoanThanh || 0) + n;
      if (r.loai === 'cam_xuc') d.camXuc = r.tb == null ? null : Math.round(Number(r.tb) * 10) / 10;
      if (r.loai === 'nhat_ky') d.nhatKy = n; if (r.loai === 'doc_tai_lieu') d.docTaiLieu = n; });
  (await tat(db, "SELECT maNha, AVG(giaTri) AS tb FROM suKienKH WHERE loai IN ('sat_hach','test') AND giaTri IS NOT NULL AND ngay >= ? AND ngay < ?" + f('maNha') + ' GROUP BY maNha', a(K.tu, K.den)))
    .forEach(r => { if (g(r.maNha) && r.tb != null) g(r.maNha).diemTB = Math.round(Number(r.tb)); });
  /* tick việc hôm nay */
  (await tat(db, 'SELECT maNha, COUNT(DISTINCT CASE WHEN bo = 0 THEN ngay END) AS t, SUM(CASE WHEN bo = 1 THEN 1 ELSE 0 END) AS b FROM nhipXong WHERE ngay >= ? AND ngay < ?' + f('maNha') + ' GROUP BY maNha', a(K.tu, K.den)))
    .forEach(r => { if (g(r.maNha)) { g(r.maNha).ngayTick = Number(r.t) || 0; g(r.maNha).soBo = Number(r.b) || 0; } });
  /* báo cáo ngày */
  (await tat(db, 'SELECT maKhachHang AS maNha, COUNT(*) AS n, SUM(phutHoc) AS p, AVG(kpi) AS k FROM baoCaoNgay WHERE ngay >= ? AND ngay < ?' + f('maKhachHang') + ' GROUP BY maKhachHang', a(K.tu, K.den)))
    .forEach(r => { const d = g(r.maNha); if (!d) return; d.soBaoCao = Number(r.n) || 0; d.phutHocBaoCao = Number(r.p) || 0; d.kpiBaoCao = r.k == null ? null : Math.round(Number(r.k)); });
  /* việc được Coach duyệt + credit thưởng */
  (await tat(db, "SELECT maNha, SUM(CASE WHEN viec IN ('thuong:nv','thuong:mc','thuong:cong') THEN 1 ELSE 0 END) AS v, SUM(CASE WHEN loai = 'thuong' AND so > 0 THEN so ELSE 0 END) AS c FROM soCredit WHERE luc >= ? AND luc < ?" + f('maNha') + ' GROUP BY maNha', a(K.tu, K.den)))
    .forEach(r => { if (g(r.maNha)) { g(r.maNha).viecDuyet = Number(r.v) || 0; g(r.maNha).creditThuong = Number(r.c) || 0; } });
  /* lượt chạm của nhân sự */
  (await tat(db, 'SELECT maNha, kieu, COUNT(*) AS n FROM soCham WHERE substr(ngay,1,10) >= ? AND substr(ngay,1,10) < ?' + f('maNha') + ' GROUP BY maNha, kieu', a(K.tu, K.den)))
    .forEach(r => { const d = g(r.maNha); if (d && d.cham[r.kieu] != null) d.cham[r.kieu] = Number(r.n) || 0; });
  /* tài chính */
  (await tat(db, "SELECT maKhachHang AS maNha, SUM(CASE WHEN ghiLuc >= ? THEN soTien ELSE 0 END) AS th, SUM(soTien) AS lt FROM phieuThu WHERE trangThai = 'daDuyet' AND ghiLuc < ?" + f('maKhachHang') + ' GROUP BY maKhachHang', a(K.tu, K.den)))
    .forEach(r => { if (g(r.maNha)) { g(r.maNha).thuThang = Number(r.th) || 0; g(r.maNha).ltv = Number(r.lt) || 0; } });
  (await tat(db, 'SELECT maKhachHang AS maNha, SUM(phaiThu) AS p FROM kyThu WHERE hanLuc IS NOT NULL AND hanLuc < ?' + f('maKhachHang') + ' GROUP BY maKhachHang', a(denThat)))
    .forEach(r => { const d = g(r.maNha); if (d) d.no = Math.max(0, Math.round((Number(r.p) || 0) - d.ltv)); });
  (await tat(db, "SELECT maKhachHang AS maNha, COUNT(*) AS n FROM hoanTien WHERE trangThai = 'daDuyet'" + f('maKhachHang') + ' GROUP BY maKhachHang', a()))
    .forEach(r => { if (g(r.maNha)) g(r.maNha).daHoan = Number(r.n) > 0; });
  (await tat(db, 'SELECT maKhachHang AS maNha, COUNT(*) AS n FROM lichSuTang WHERE luc >= ? AND luc < ? AND denTang > COALESCE(tuTang, 0)' + f('maKhachHang') + ' GROUP BY maKhachHang', a(K.tu, K.den)))
    .forEach(r => { if (g(r.maNha)) g(r.maNha).lenTang = Number(r.n) > 0; });
  /* hài lòng */
  (await tat(db, 'SELECT maNha, AVG(nps) AS n, AVG(csat) AS c FROM danhGiaKH WHERE thang = ?' + f('maNha') + ' GROUP BY maNha', a(thang)))
    .forEach(r => { const d = g(r.maNha); if (!d) return; d.nps = r.n == null ? null : Math.round(Number(r.n) * 10) / 10; d.csat = r.c == null ? null : Math.round(Number(r.c) * 10) / 10; });
  /* đăng nhập (theo tài khoản phụ huynh) + giới thiệu */
  const theoUid = {}; Object.values(D).forEach(d => { if (d.uid) theoUid[d.uid] = d; });
  (await tat(db, "SELECT uid, COUNT(*) AS n FROM audit WHERE viec = 'DANG_NHAP' AND luc >= ? AND luc < ? GROUP BY uid", [K.tu, K.den]))
    .forEach(r => { if (theoUid[r.uid]) theoUid[r.uid].dangNhap = Number(r.n) || 0; });
  (await tat(db, "SELECT boTro AS maNha, COUNT(*) AS n FROM hoSoKhach WHERE boTro IS NOT NULL AND boTro <> ''" + f('boTro') + ' GROUP BY boTro', a()))
    .forEach(r => { if (g(r.maNha)) g(r.maNha).gioiThieu = Number(r.n) || 0; });
  return { thang, K, soNgay, D };
}

function ketQua(d, truoc) {
  const diem = chamDiem(d, truoc);
  const tang = xepTang(diem, d);
  return Object.assign({}, d, { diem, tangCS: tang, tenTangCS: TANG_CS[tang].ten, lyDo: lyDo(diem, d), viecNen: TANG_CS[tang].viec });
}
function rutGonChoNha(x) {
  return { maNha: x.maNha, thang: x.thang, tang: x.tang, soNgayThang: x.soNgayThang, ngayHoatDong: x.ngayHoatDong, phutApp: x.phutApp,
    phutHoc: x.diem.phutHoc, phutNhom: x.phutNhom, ngayTick: x.ngayTick, soBaoCao: x.soBaoCao, hoanThanh: x.hoanThanh, diemTB: x.diemTB,
    nhatKy: x.nhatKy, viecDuyet: x.viecDuyet, creditThuong: x.creditThuong, lenTang: x.lenTang,
    diem: { ganKet: x.diem.ganKet, tienBo: x.diem.tienBo }, muc: MUC };
}

/* ═══════════ CỬA 3 · HỒ SƠ THÁNG MỘT NHÀ (+ xu hướng 6 tháng) ═══════════ */
export async function hoSoDoLuongKH(y, env, db, hoSo) {
  await taoBang(db);
  const x = y || {}, thang = hopLeThang(x.thang) ? x.thang : thangNay();
  const maNha = String(x.maNha || '').trim() || await maNhaCuaToi(db, hoSo);
  if (!maNha) return { ok: false, code: 'KHONGNHA', error: 'Thiếu mã nhà.' };
  const vai = await vaiVoiNha(db, hoSo, maNha);
  if (!vai) return { ok: false, code: 'NOPERM', error: 'Chỉ xem được hồ sơ của nhà mình hoặc nhà mình phụ trách.' };
  const ds = []; let t = thang;
  for (let i = 0; i < 6; i++) { ds.unshift(t); t = thangTruoc(t); }
  const kq = []; let truoc = null;
  for (const th of ds) {
    const G = await gomThang(db, th, maNha);
    const d = G.D[maNha]; if (!d) { truoc = null; continue; }
    const r = ketQua(Object.assign({ thang: th }, d), truoc);
    kq.push(r); truoc = r.diem;
  }
  if (!kq.length) return { ok: false, code: 'KHONGNHA', error: 'Không có hồ sơ khách mang mã ' + maNha + '.' };
  const nay = kq[kq.length - 1];
  if (vai === 'nha') return { ok: true, vai, phienBan: PHIEN_BAN_DO, ho: rutGonChoNha(nay),
    xuHuong: kq.map(r => ({ thang: r.thang, ganKet: r.diem.ganKet, tienBo: r.diem.tienBo, phutHoc: r.diem.phutHoc, ngayHoatDong: r.ngayHoatDong })) };
  return { ok: true, vai, phienBan: PHIEN_BAN_DO, ho: nay,
    xuHuong: kq.map(r => ({ thang: r.thang, diem: r.diem, tangCS: r.tangCS, ngayHoatDong: r.ngayHoatDong, phutApp: r.phutApp })) };
}

/* ═══════════ TÍNH CẢ HỆ (dùng chung cho xếp hạng · báo cáo · chốt) ═══════════ */
async function tinhHe(db, thang) {
  const nay = await gomThang(db, thang, null), cu = await gomThang(db, thangTruoc(thang), null);
  const ds = Object.values(nay.D).map(d => {
    const c = cu.D[d.maNha] ? chamDiem(cu.D[d.maNha], null) : null;
    return ketQua(Object.assign({ thang }, d), c);
  });
  ds.sort((a, b) => b.diem.tiemNang - a.diem.tiemNang || a.diem.ruiRo - b.diem.ruiRo);
  ds.forEach((x, i) => { x.hang = i + 1; });
  return { ds, soNgay: nay.soNgay };
}

/* ═══════════ CỬA 4 · XẾP HẠNG & PHÂN TẦNG ═══════════ */
export async function xepHangKH(y, env, db, hoSo) {
  await taoBang(db);
  const lv = BAC[hoSo.role] || 99;
  if (lv > 8) return { ok: false, code: 'NOPERM', error: 'Xếp hạng khách mở cho đội dẫn dắt (R01–R08).' };
  const x = y || {}, thang = hopLeThang(x.thang) ? x.thang : thangNay();
  const he = await tinhHe(db, thang);
  let ds = he.ds;
  if (lv > 5) ds = ds.filter(d => String(d.coach) === String(hoSo.u));
  if (x.tangCS && /^[A-E]$/.test(x.tangCS)) ds = ds.filter(d => d.tangCS === x.tangCS);
  if (x.coach && lv <= 5) ds = ds.filter(d => d.coach === String(x.coach));
  const dem = { A: 0, B: 0, C: 0, D: 0, E: 0 }; ds.forEach(d => { dem[d.tangCS]++; });
  return { ok: true, phienBan: PHIEN_BAN_DO, thang, tong: ds.length, dem, tangCS: TANG_CS,
    ds: ds.slice(0, 500).map(d => ({ hang: d.hang, maNha: d.maNha, tang: d.tang, coach: d.coach, band: d.band, tangCS: d.tangCS,
      diem: d.diem, lyDo: d.lyDo, ngayHoatDong: d.ngayHoatDong, phutApp: d.phutApp, imLang: d.imLang, ltv: d.ltv, no: d.no, moi: d.moi })) };
}

/* ═══════════ CỬA 5 · BÁO CÁO THÁNG TOÀN HỆ ═══════════ */
export async function baoCaoThangHe(y, env, db, hoSo) {
  await taoBang(db);
  const lv = BAC[hoSo.role] || 99, anDanh = lv === 12;
  if (lv > 4 && !anDanh) return { ok: false, code: 'NOPERM', error: 'Báo cáo tháng toàn hệ mở cho R01–R04; Phân tích dữ liệu xem bản ẩn danh.' };
  const x = y || {}, thang = hopLeThang(x.thang) ? x.thang : thangNay();
  const he = await tinhHe(db, thang), ds = he.ds, n = ds.length || 1;
  const tb = k => { const v = ds.map(d => d.diem[k]).filter(z => z != null); return v.length ? Math.round(v.reduce((s, z) => s + z, 0) / v.length) : null; };
  const dem = { A: 0, B: 0, C: 0, D: 0, E: 0 }; ds.forEach(d => { dem[d.tangCS]++; });
  const man = {}; ds.forEach(d => Object.keys(d.man).forEach(m => { const o = man[m] = man[m] || { man: m, phut: 0, soNha: 0, nhom: nhomCuaMan(m) }; o.phut += d.man[m]; o.soNha++; }));
  const dsMan = Object.values(man).sort((a, b) => b.phut - a.phut);
  const nhom = { hoc: 0, thucHanh: 0, baoCao: 0, ketNoi: 0, khac: 0 }; ds.forEach(d => Object.keys(d.phutNhom).forEach(k => { nhom[k] += d.phutNhom[k] || 0; }));
  const coNps = ds.filter(d => d.nps != null), quang = coNps.filter(d => d.nps >= 9).length, che = coNps.filter(d => d.nps <= 6).length;
  const theoTang = {}; ds.forEach(d => { const o = theoTang[d.tang] = theoTang[d.tang] || { tang: d.tang, soNha: 0, ganKet: 0, tienBo: 0, n: 0 }; o.soNha++; if (d.diem.ganKet != null) { o.ganKet += d.diem.ganKet; o.n++; } });
  Object.values(theoTang).forEach(o => { o.ganKet = o.n ? Math.round(o.ganKet / o.n) : null; delete o.n; delete o.tienBo; });
  const ma = d => anDanh ? 'Nhà #' + d.hang : d.maNha;
  const binhLuan = anDanh ? [] : (await tat(db, "SELECT maNha, nps, csat, ghiChu FROM danhGiaKH WHERE thang = ? AND ghiChu IS NOT NULL AND ghiChu <> '' ORDER BY luc DESC LIMIT 30", [thang]));
  return { ok: true, phienBan: PHIEN_BAN_DO, thang, anDanh, soNha: ds.length,
    tb: { ganKet: tb('ganKet'), tienBo: tb('tienBo'), haiLong: tb('haiLong'), giaTri: tb('giaTri'), ruiRo: tb('ruiRo'), tiemNang: tb('tiemNang') },
    hoatDong: { tyLeHoatDong: Math.round(100 * ds.filter(d => d.ngayHoatDong > 0).length / n), ngayHoatDongTB: Math.round(ds.reduce((s, d) => s + d.ngayHoatDong, 0) / n),
      phutAppTB: Math.round(ds.reduce((s, d) => s + d.phutApp, 0) / n), phutHocTB: Math.round(ds.reduce((s, d) => s + d.diem.phutHoc, 0) / n),
      hoanThanh: ds.reduce((s, d) => s + (d.hoanThanh || 0), 0), ngayTickTB: Math.round(ds.reduce((s, d) => s + d.ngayTick, 0) / n),
      baoCao: ds.reduce((s, d) => s + d.soBaoCao, 0), viecDuyet: ds.reduce((s, d) => s + d.viecDuyet, 0),
      cham: ds.reduce((s, d) => s + d.cham.nhan + d.cham.goi + d.cham.wow, 0), lenTang: ds.filter(d => d.lenTang).length },
    taiChinh: anDanh ? null : { thuThang: ds.reduce((s, d) => s + d.thuThang, 0), soNhaNo: ds.filter(d => d.no > 0).length, tongNo: ds.reduce((s, d) => s + d.no, 0) },
    haiLong: { soPhieu: coNps.length, nps: coNps.length ? Math.round(100 * (quang - che) / coNps.length) : null, csatTB: (() => { const v = ds.filter(d => d.csat != null); return v.length ? Math.round(10 * v.reduce((s, d) => s + d.csat, 0) / v.length) / 10 : null; })(), binhLuan },
    tangCS: dem, tenTangCS: TANG_CS, theoTang: Object.values(theoTang),
    sanPham: { man: dsMan.slice(0, 25), manItDung: dsMan.filter(m => m.soNha <= Math.max(1, Math.round(n * 0.1))).slice(0, 15), nhom },
    top: ds.slice(0, 10).map(d => ({ ma: ma(d), tangCS: d.tangCS, tiemNang: d.diem.tiemNang, lyDo: d.lyDo })),
    canCuu: ds.filter(d => d.tangCS === 'D').slice(0, 20).map(d => ({ ma: ma(d), ruiRo: d.diem.ruiRo, imLang: d.imLang, lyDo: d.lyDo, coach: anDanh ? '' : d.coach })) };
}

/* ═══════════ CỬA 6 · CHỐT BÁO CÁO THÁNG (lưu hồ sơ tháng) ═══════════ */
export async function chotBaoCaoThang(y, env, db, hoSo) {
  await taoBang(db);
  if ((BAC[hoSo.role] || 99) > 4) return { ok: false, code: 'NOPERM', error: 'Chốt báo cáo tháng do R01–R04.' };
  const thang = String((y || {}).thang || '');
  if (!hopLeThang(thang) || thang >= thangNay()) return { ok: false, error: 'Chỉ chốt được tháng ĐÃ KẾT THÚC.' };
  const da = await db.prepare('SELECT COUNT(*) AS n FROM hoSoThang WHERE thang = ? AND chot = 1').bind(thang).first();
  if (Number((da || {}).n || 0)) return { ok: false, code: 'DACHOT', error: 'Tháng ' + thang + ' đã chốt — hồ sơ đã chốt không ghi đè.' };
  const he = await tinhHe(db, thang), gio = new Date().toISOString();
  for (const d of he.ds) {
    await db.prepare('INSERT INTO hoSoThang (maNha, thang, duLieu, tiemNang, tangCS, chot, boiAi, luc) VALUES (?,?,?,?,?,1,?,?) ' +
      'ON CONFLICT(maNha, thang) DO NOTHING').bind(d.maNha, thang, JSON.stringify(d), d.diem.tiemNang, d.tangCS, hoSo.u, gio).run();
  }
  await Kho.ghiNhatKy(db, { uid: hoSo.uid, username: hoSo.u, viec: 'CHOT_BAOCAO_THANG', doiTuong: thang, chiTiet: String(he.ds.length) + ' nhà' });
  return { ok: true, thang, soNha: he.ds.length };
}

/* ═══════════ CỬA 7 · LỊCH SỬ HỒ SƠ THÁNG ĐÃ CHỐT ═══════════ */
export async function dsHoSoThang(y, env, db, hoSo) {
  await taoBang(db);
  const maNha = String((y || {}).maNha || '').trim() || await maNhaCuaToi(db, hoSo);
  const vai = maNha ? await vaiVoiNha(db, hoSo, maNha) : '';
  if (!vai) return { ok: false, code: 'NOPERM', error: 'Không xem được hồ sơ tháng của nhà này.' };
  const r = await tat(db, 'SELECT thang, duLieu, tiemNang, tangCS, luc FROM hoSoThang WHERE maNha = ? AND chot = 1 ORDER BY thang DESC LIMIT 24', [maNha]);
  return { ok: true, maNha, ds: r.map(x => { const d = JSON.parse(x.duLieu || '{}'); return vai === 'nha' ? rutGonChoNha(d) : d; }) };
}
