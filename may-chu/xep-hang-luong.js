/* ═══════════════════════════════════════════════════════════════
   GITA 365 — LỊCH TRẢ LƯƠNG · PHẢN HỒI TỪNG KHÁCH · XẾP HẠNG LƯƠNG THƯỞNG

   Chủ hệ chốt 10/2026:
   - Ngày 05 hằng tháng trả lương của tháng trước; ngày 05 trùng ngày nghỉ
     thì trả ngày 08.
   - Điểm thi gắn với xếp hạng lương thưởng — nỗ lực học tập được tính.
   - Phản hồi của khách được đo định kỳ TỪNG KHÁCH để có căn cứ lương thưởng.

   ══ BA LUẬT CỦA PHẦN NÀY ══
   1. Đo, không khai. Ba thành phần của hạng đều đọc từ sổ: bài thi ngày 28
      (thiLuot · thiCham), cấp chứng chỉ (phát lại sự kiện), và phiếu tháng
      của chính gia đình (danhGiaKH). Không ô nào người được xếp hạng gõ.
   2. Phiếu gắn người phụ trách LÚC GỬI (danhGiaKH.coach · tuVan). Nhà đổi
      Coach giữa chừng thì phiếu tháng trước vẫn thuộc người đã làm tháng
      ấy — tra hoSoKhach lúc tính thì phiếu đi theo người MỚI.
   3. Thiếu mẫu thì NÓI là thiếu, không đọc ra là 0. Dưới MAU_TOI_THIEU nhà
      có phiếu thì thành phần phản hồi là null, trọng số bị bỏ và ghi ra
      (trongBoQua) — cùng luật chấm KPI của luong.js. Một Coach có hai nhà
      cho điểm thấp không phải "Coach tệ nhất", và một Coach có hai nhà cho
      điểm cao cũng chưa phải "Coach giỏi nhất".

   ══ CHỖ CHỜ CHỦ HỆ ══
   Trọng số TRONG_SO, ngưỡng hạng HANG_LT và số nhà tối thiểu là MẶC ĐỊNH,
   điều chỉnh sau khi chạy thật. Hạng KHÔNG tự đổi ra tiền: hệ số tiền theo
   hạng là quyết định của chủ hệ, và chưa có bảng lương máy chủ cho Coach /
   Tư vấn viên (bảng lương hiện chỉ cho ba vị trí phòng tài chính).
   ═══════════════════════════════════════════════════════════════ */
'use strict';

import { Kho } from './nen.js';
import { BAC, roleOf, tenNguoiDung as ten } from './vai-tro.js';
import { capCua, ketQuaLuot, HE_THI, thangCua } from './thi-cap.js';

const LECH_VN = 7 * 3600000;

/* ═══════════════ LỊCH TRẢ LƯƠNG ═══════════════ */
export const NGAY_TRA = 5, NGAY_TRA_LUI = 8;
/* Ngày lễ dương lịch cố định (Bộ luật Lao động). Tết Âm lịch và Giỗ Tổ đổi
   ngày mỗi năm nên Super Admin khai vào bảng ngayNghi — máy không tự đoán âm
   lịch, đoán sai một ngày là trả lương sai ngày. */
export const LE_CO_DINH = Object.freeze(['01-01', '04-30', '05-01', '09-02']);
const kySau = ky => { const [y, m] = ky.split('-').map(Number); return m === 12 ? (y + 1) + '-01' : y + '-' + String(m + 1).padStart(2, '0'); };
export const hopLeKy = ky => /^\d{4}-(0[1-9]|1[0-2])$/.test(String(ky || ''));

/* Ngày nghỉ = Chủ nhật · lễ cố định · ngày Super Admin khai là nghỉ. Khai
   nghi=0 GỠ một ngày (ví dụ làm bù) — dòng mới nhất của mỗi ngày quyết. */
export function laNgayNghi(ngay, khai) {
  if (khai && Object.prototype.hasOwnProperty.call(khai, ngay)) return !!khai[ngay];
  const d = new Date(ngay + 'T00:00:00Z');
  return d.getUTCDay() === 0 || LE_CO_DINH.includes(ngay.slice(5));
}
/* Lương kỳ YYYY-MM trả ngày 05 tháng sau; 05 là ngày nghỉ thì ngày 08. */
export function ngayTraLuong(ky, khai) {
  const t = kySau(ky);
  const ngay05 = t + '-' + String(NGAY_TRA).padStart(2, '0');
  if (!laNgayNghi(ngay05, khai)) return { ky, ngay: ngay05, doi: false };
  return { ky, ngay: t + '-' + String(NGAY_TRA_LUI).padStart(2, '0'), doi: true, lyDo: 'Ngày ' + ngay05 + ' là ngày nghỉ' };
}
export async function docNgayNghi(db) {
  const r = (await db.prepare('SELECT ngay, nghi, ten FROM ngayNghi ORDER BY luc ASC, rowid ASC').all()).results || [];
  const khai = {}, ten2 = {};
  r.forEach(x => { khai[x.ngay] = Number(x.nghi) ? 1 : 0; ten2[x.ngay] = x.ten; });
  return { khai, ten: ten2 };
}
export async function lichTraLuong(y, env, db, hoSo) {
  if ((BAC[roleOf(hoSo)] || 99) > 12) return { ok: false, code: 'NOPERM', error: 'Lịch trả lương dành cho nhân sự.' };
  const nam = Number((y || {}).nam) || new Date(Date.now() + LECH_VN).getUTCFullYear();
  if (nam < 2024 || nam > 2100) return { ok: false, code: 'SAI', error: 'Năm không hợp lệ.' };
  const { khai, ten: tenNgay } = await docNgayNghi(db);
  const lich = [];
  for (let m = 1; m <= 12; m++) lich.push(ngayTraLuong(nam + '-' + String(m).padStart(2, '0'), khai));
  const nghiKhai = Object.keys(khai).filter(k => k.startsWith(String(nam))).sort().map(k => ({ ngay: k, nghi: !!khai[k], ten: tenNgay[k] || '' }));
  return { ok: true, nam, lich, nghiKhai, luat: { ngayTra: NGAY_TRA, ngayLui: NGAY_TRA_LUI, leCoDinh: LE_CO_DINH } };
}
export async function khaiNgayNghi(y, env, db, hoSo) {
  if (roleOf(hoSo) !== 'R01') return { ok: false, code: 'NOPERM', error: 'Chỉ Super Admin khai ngày nghỉ.' };
  const x = y || {}, ngay = String(x.ngay || ''), tenNgay = String(x.ten || '').trim().slice(0, 120);
  if (!/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(ngay) || isNaN(Date.parse(ngay + 'T00:00:00Z'))) return { ok: false, code: 'SAI', error: 'Ngày có dạng YYYY-MM-DD.' };
  if (tenNgay.length < 3) return { ok: false, code: 'THIEUCAU', error: 'Ghi tên ngày nghỉ (ví dụ: Mùng 2 Tết, nghỉ bù 30/4).' };
  await db.prepare('INSERT INTO ngayNghi (id, ngay, nghi, ten, boiAi, luc) VALUES (?,?,?,?,?,?)')
    .bind(crypto.randomUUID(), ngay, x.nghi === false ? 0 : 1, tenNgay, ten(hoSo), Date.now()).run();
  try { await Kho.ghiNhatKy(db, { uid: hoSo.uid, username: ten(hoSo), viec: 'KHAI_NGAY_NGHI', doiTuong: ngay, chiTiet: (x.nghi === false ? 'gỡ · ' : 'nghỉ · ') + tenNgay }); } catch (e) {}
  return { ok: true, ngay, nghi: x.nghi !== false };
}

/* ═══════════════ PHẢN HỒI TỪNG KHÁCH ═══════════════ */
/* Năm tiêu chí — mỗi câu hỏi về một việc gia đình THẤY được, không hỏi cảm
   tình chung chung (cảm tình chung đã có ở NPS · CSAT). */
export const TIEU_CHI = Object.freeze([
  { ma: 'T1', ten: 'Người đồng hành lắng nghe và hiểu đúng nhà mình' },
  { ma: 'T2', ten: 'Đúng hẹn, giữ lời đã hứa' },
  { ma: 'T3', ten: 'Hướng dẫn rõ ràng, nhà mình làm theo được' },
  { ma: 'T4', ten: 'Nhà mình thấy thay đổi thật ở con hoặc ở nếp nhà' },
  { ma: 'T5', ten: 'Tôn trọng, không phán xét, không so sánh nhà mình với nhà khác' }
]);
/* Điểm một phiếu (0–100). Có tiêu chí: NPS 40 · CSAT 30 · tiêu chí 30;
   phiếu cũ chưa có tiêu chí: NPS 4/7 · CSAT 3/7 — không đoán điểm tiêu chí. */
export function diemPhieu(p) {
  const nps = Number(p.nps), csat = Number(p.csat);
  if (!(nps >= 0 && nps <= 10) || !(csat >= 1 && csat <= 5)) return null;
  let tc = null; try { tc = p.tieuChi ? JSON.parse(p.tieuChi) : null; } catch (e) { tc = null; }
  const a = nps * 10, b = (csat - 1) / 4 * 100;
  if (Array.isArray(tc) && tc.length === TIEU_CHI.length && tc.every(v => Number.isInteger(v) && v >= 1 && v <= 5)) {
    const c = (tc.reduce((s, v) => s + v, 0) / tc.length - 1) / 4 * 100;
    return Math.round(a * 0.4 + b * 0.3 + c * 0.3);
  }
  return Math.round(a * 4 / 7 + b * 3 / 7);
}

/* ═══════════════ XẾP HẠNG LƯƠNG THƯỞNG THÁNG ═══════════════ */
export const TRONG_SO = Object.freeze({ thi: 40, phanHoi: 40, cap: 20 });
export const MAU_TOI_THIEU = 3;
export const HANG_LT = Object.freeze([{ hang: 'A', tu: 90 }, { hang: 'B', tu: 80 }, { hang: 'C', tu: 65 }, { hang: 'D', tu: 0 }]);
const hangCua = d => (HANG_LT.find(h => d >= h.tu) || HANG_LT[HANG_LT.length - 1]).hang;
const cuoiKy = ky => Date.parse(kySau(ky) + '-01T00:00:00+07:00') - 1;

/* Điểm thi tháng: bài có kết quả cao nhất trong tháng (theo tháng bắt đầu).
   Không dự thi ngày 28 thì 0 — kỳ thi là bắt buộc, vắng mặt không phải
   "chưa đo được". Bài còn chờ chấm chưa tính. */
async function diemThiThang(db, maNguoi, he, ky) {
  const ls = (await db.prepare('SELECT * FROM thiLuot WHERE maNguoi = ? AND he = ? AND thang = ? AND nopLuc IS NOT NULL ORDER BY batDau ASC, rowid ASC')
    .bind(maNguoi, he, ky).all()).results || [];
  let tot = 0, coKq = false, cho = 0;
  for (const l of ls) {
    const k = await ketQuaLuot(db, l);
    if (k.trangThai === 'choCham') { cho++; continue; }
    coKq = true;
    const tb = k.cham.length ? k.cham.reduce((s, c) => s + Number(c.diem || 0), 0) / k.cham.length : 0;
    tot = Math.max(tot, k.quaGio ? 0 : Math.round(tb));
  }
  return { diem: tot, soBai: ls.length, choCham: cho, duThi: ls.length > 0, coKq };
}
async function phanHoiCua(db, maNguoi, ky) {
  const r = (await db.prepare('SELECT maNha, nps, csat, tieuChi FROM danhGiaKH WHERE thang = ? AND (lower(coach) = ? OR lower(tuVan) = ?)').bind(ky, maNguoi, maNguoi).all()).results || [];
  const theoNha = {};
  r.forEach(p => { const d = diemPhieu(p); if (d === null) return; (theoNha[p.maNha] = theoNha[p.maNha] || []).push(d); });
  const nha = Object.keys(theoNha).map(k => theoNha[k].reduce((s, v) => s + v, 0) / theoNha[k].length);
  return { soNha: nha.length, diem: nha.length >= MAU_TOI_THIEU ? Math.round(nha.reduce((s, v) => s + v, 0) / nha.length) : null };
}
export async function chamMotNguoi(db, maNguoi, role, ky) {
  const he = role === 'R11' ? 'tuvan' : 'coach';
  const thi = await diemThiThang(db, maNguoi, he, ky);
  const c = await capCua(db, maNguoi, he, Math.min(Date.now(), cuoiKy(ky)));
  const ph = await phanHoiCua(db, maNguoi, ky);
  const phuTrach = (await db.prepare('SELECT COUNT(*) n FROM hoSoKhach WHERE lower(coach) = ? OR lower(tuVan) = ?').bind(maNguoi, maNguoi).first()).n;
  const tp = [
    { ma: 'thi', ten: 'Điểm thi ngày 28', giaTri: thi.diem, trong: TRONG_SO.thi, ghiChu: thi.duThi ? (thi.choCham ? thi.choCham + ' bài chờ chấm' : '') : 'không dự thi' },
    { ma: 'cap', ten: 'Cấp chứng chỉ cuối kỳ', giaTri: Math.round(100 * c.cap / HE_THI[he].soCap), trong: TRONG_SO.cap, ghiChu: 'cấp ' + c.cap + '/' + HE_THI[he].soCap },
    { ma: 'phanHoi', ten: 'Phản hồi của các nhà phụ trách', giaTri: ph.diem, trong: TRONG_SO.phanHoi,
      ghiChu: ph.soNha + ' nhà có phiếu' + (ph.diem === null ? ' — dưới ' + MAU_TOI_THIEU + ' nhà, chưa đủ mẫu' : '') }
  ];
  const dung = tp.filter(t => t.giaTri !== null), trongDung = dung.reduce((s, t) => s + t.trong, 0);
  const diem = trongDung ? Math.round(dung.reduce((s, t) => s + t.giaTri * t.trong, 0) / trongDung) : 0;
  return { maNguoi, role, he, ky, diem, hang: hangCua(diem), trongBoQua: 100 - trongDung, thanhPhan: tp,
    soNhaPhanHoi: ph.soNha, soNhaPhuTrach: phuTrach, choChamCon: thi.choCham };
}
/* Quản lý (R01–R05) xem cả đội; nhân sự khác chỉ xem dòng của mình. */
export async function xepHangThang(y, env, db, hoSo) {
  const lvMinh = BAC[roleOf(hoSo)] || 99;
  if (lvMinh > 12) return { ok: false, code: 'NOPERM', error: 'Xếp hạng lương thưởng dành cho nhân sự.' };
  const ky = String((y || {}).ky || thangCua(Date.now() - 20 * 86400000));
  if (!hopLeKy(ky)) return { ok: false, code: 'SAI', error: 'Kỳ có dạng YYYY-MM.' };
  const vai = [...new Set([...HE_THI.coach.vaiThi, ...HE_THI.tuvan.vaiThi])];
  let rows = (await db.prepare('SELECT id, username, role FROM users WHERE active = 1 AND deletedAt IS NULL AND role IN (' + vai.map(() => '?').join(',') + ') ORDER BY username LIMIT 500')
    .bind(...vai).all()).results || [];
  const minh = await Kho.layUid(db, hoSo.u);
  const rieng = lvMinh > 5;
  if (rieng) rows = rows.filter(r => r.id === minh);
  const ds = [];
  for (const r of rows) ds.push(await chamMotNguoi(db, String(r.username).toLowerCase(), r.role, ky));
  ds.sort((a, b) => b.diem - a.diem || a.maNguoi.localeCompare(b.maNguoi));
  const { khai } = await docNgayNghi(db);
  return { ok: true, ky, chiDongCuaToi: rieng, ds, ngayTra: ngayTraLuong(ky, khai),
    luat: { trongSo: TRONG_SO, hang: HANG_LT, mauToiThieu: MAU_TOI_THIEU, tieuChi: TIEU_CHI },
    gioiHan: 'Hạng chưa tự đổi ra tiền: hệ số tiền theo hạng chờ chủ hệ chốt. Trọng số và ngưỡng là mặc định, điều chỉnh sau khi chạy thật.' };
}
