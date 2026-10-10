/* ═══════════════════════════════════════════════════════════════
   GITA 365 — LỊCH TRẢ LƯƠNG · PHẢN HỒI TỪNG KHÁCH · XẾP HẠNG LƯƠNG THƯỞNG

   Chủ hệ chốt 10/2026:
   - Ngày 05 hằng tháng trả lương của tháng trước; ngày 05 trùng ngày nghỉ
     thì trả ngày 08. Thứ Bảy và Chủ nhật là ngày nghỉ (chốt 10/10); ngày
     08 cũng nghỉ thì dời tiếp sang ngày làm việc kế đó, và nhân sự nhận
     thông báo đích danh mỗi lần ngày trả bị dời (baoNgayTraLuong).
   - Thưởng lương khi KPI làm việc ≥ 90 VÀ tỷ lệ khách hài lòng ≥ 90%
     (chốt 10/10, NGUONG_THUONG).
   - Điểm thi gắn với xếp hạng lương thưởng — nỗ lực học tập được tính.
   - Phản hồi của khách được đo định kỳ TỪNG KHÁCH để có căn cứ lương thưởng.

   ══ BA LUẬT CỦA PHẦN NÀY ══
   1. Đo, không khai. Ba thành phần của hạng đều đọc từ sổ: bài thi ngày 28
      (thiLuot · thiCham), cấp chứng chỉ (phát lại sự kiện), phiếu tháng
      của chính gia đình (danhGiaKH), và điểm sát hạch nghiệp vụ do NGƯỜI
      CHẤM khác người học ghi (dtBuoc). Không ô nào người được xếp hạng gõ.
   2. Phiếu gắn người phụ trách LÚC GỬI (danhGiaKH.coach · tuVan). Nhà đổi
      Coach giữa chừng thì phiếu tháng trước vẫn thuộc người đã làm tháng
      ấy — tra hoSoKhach lúc tính thì phiếu đi theo người MỚI.
   3. Thiếu mẫu thì NÓI là thiếu, không đọc ra là 0. Dưới MAU_TOI_THIEU nhà
      có phiếu thì thành phần phản hồi là null, trọng số bị bỏ và ghi ra
      (trongBoQua) — cùng luật chấm KPI của luong.js. Một Coach có hai nhà
      cho điểm thấp không phải "Coach tệ nhất", và một Coach có hai nhà cho
      điểm cao cũng chưa phải "Coach giỏi nhất".

   ══ CHỖ CHỜ CHỦ HỆ ══
   Trọng số TRONG_SO đã chốt 10/10 (30 · 30 · 40, và phần 40 = 30 hài lòng +
   10 thi nghiệp vụ); ngưỡng hạng HANG_LT, số nhà tối thiểu và hạn 365 ngày
   của lần sát hạch nghiệp vụ là MẶC ĐỊNH,
   điều chỉnh sau khi chạy thật. Hạng KHÔNG tự đổi ra tiền: hệ số tiền theo
   hạng là quyết định của chủ hệ, và chưa có bảng lương máy chủ cho Coach /
   Tư vấn viên (bảng lương hiện chỉ cho ba vị trí phòng tài chính).
   ═══════════════════════════════════════════════════════════════ */
'use strict';

import { Kho } from './nen.js';
import { ghiThongBao } from './ngan-hang.js';
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

/* Ngày nghỉ = thứ Bảy · Chủ nhật · lễ cố định · ngày Super Admin khai là
   nghỉ. Khai nghi=0 GỠ một ngày (ví dụ làm bù thứ Bảy) — dòng mới nhất của
   mỗi ngày quyết, nên một ngày làm bù thắng luật cuối tuần. */
export const THU_NGHI = Object.freeze([0, 6]);
const TEN_THU = ['Chủ nhật', 'thứ Hai', 'thứ Ba', 'thứ Tư', 'thứ Năm', 'thứ Sáu', 'thứ Bảy'];
export function laNgayNghi(ngay, khai) {
  if (khai && Object.prototype.hasOwnProperty.call(khai, ngay)) return !!khai[ngay];
  const d = new Date(ngay + 'T00:00:00Z');
  return THU_NGHI.includes(d.getUTCDay()) || LE_CO_DINH.includes(ngay.slice(5));
}
const congNgay = (ngay, n) => new Date(Date.parse(ngay + 'T00:00:00Z') + n * 86400000).toISOString().slice(0, 10);
function viSaoNghi(ngay, khai, tenNgay) {
  if (khai && Object.prototype.hasOwnProperty.call(khai, ngay)) return (tenNgay && tenNgay[ngay]) || 'ngày nghỉ đã khai';
  if (LE_CO_DINH.includes(ngay.slice(5))) return 'ngày lễ';
  return TEN_THU[new Date(ngay + 'T00:00:00Z').getUTCDay()];
}
/* Lương kỳ YYYY-MM trả ngày 05 tháng sau; 05 là ngày nghỉ thì ngày 08; 08
   cũng nghỉ thì ngày làm việc ĐẦU TIÊN sau 08. Dời về SAU chứ không dời về
   trước: ngày 08 là ngày đã hứa với nhân sự, trả sớm hơn thì kế toán phải
   chốt bảng lương trước cả ngày chốt KPI của kỳ. */
export function ngayTraLuong(ky, khai, tenNgay) {
  const t = kySau(ky);
  const ngay05 = t + '-' + String(NGAY_TRA).padStart(2, '0');
  if (!laNgayNghi(ngay05, khai)) return { ky, ngay: ngay05, doi: false };
  let ngay = t + '-' + String(NGAY_TRA_LUI).padStart(2, '0');
  const lyDo = ['Ngày ' + ngay05 + ' là ' + viSaoNghi(ngay05, khai, tenNgay)];
  for (let i = 0; i < 20 && laNgayNghi(ngay, khai); i++) {
    if (i === 0) lyDo.push('ngày ' + ngay + ' là ' + viSaoNghi(ngay, khai, tenNgay));
    ngay = congNgay(ngay, 1);
  }
  return { ky, ngay, doi: true, lyDo: lyDo.join('; ') };
}
/* Báo cho từng nhân sự khi ngày trả lương của kỳ bị dời. Một dòng ĐÍCH DANH
   cho mỗi người, không một dòng gửi theo vai: danhDauDaDoc đánh dấu cả dòng,
   nên một Coach bấm "đã xem" sẽ làm mọi Coach khác thôi thấy. Không gửi
   trùng: doiTuong mang cả kỳ lẫn ngày, nên ngày trả đổi thêm lần nữa (Super
   Admin khai thêm ngày nghỉ) thì có thông báo mới — đúng điều người ta cần
   biết — còn chạy lại cùng ngày thì không. */
export async function baoNgayTraLuong(db, ky, nd) {
  const d = nd || await docNgayNghi(db);
  const t = ngayTraLuong(ky, d.khai, d.ten);
  if (!t.doi) return { ky, doi: false, gui: 0 };
  const doiTuong = 'traLuong:' + ky + ':' + t.ngay;
  const [y, m] = ky.split('-');
  const tieuDe = 'Lương tháng ' + Number(m) + '/' + y + ' trả ngày ' + t.ngay.slice(8, 10) + '/' + t.ngay.slice(5, 7) + '/' + t.ngay.slice(0, 4);
  const than = 'Ngày trả lương kỳ này dời sang ' + TEN_THU[new Date(t.ngay + 'T00:00:00Z').getUTCDay()] + ' ' + t.ngay +
    '. Lý do: ' + t.lyDo + '. Luật của Học viện: trả ngày 05 hằng tháng; 05 trùng ngày nghỉ thì trả ngày 08; ' +
    '08 cũng nghỉ thì trả ngày làm việc kế tiếp. Thứ Bảy và Chủ nhật là ngày nghỉ.';
  const ds = (await db.prepare('SELECT username FROM users WHERE active = 1 AND deletedAt IS NULL AND role IN (' +
    VAI_NHAN_SU.map(() => '?').join(',') + ') ORDER BY username LIMIT 2000').bind(...VAI_NHAN_SU).all()).results || [];
  let gui = 0;
  for (const u of ds) {
    const co = await db.prepare('SELECT 1 x FROM thongBao WHERE denAi = ? AND doiTuong = ? LIMIT 1').bind(u.username, doiTuong).first();
    if (co) continue;
    await ghiThongBao(db, { denAi: u.username, loai: 'traLuong', mucDo: 'canXem', tieuDe, than, doiTuong });
    gui++;
  }
  return { ky, doi: true, ngay: t.ngay, gui };
}
const VAI_NHAN_SU = Object.freeze(['R01', 'R02', 'R03', 'R04', 'R05', 'R06', 'R07', 'R08', 'R09', 'R10', 'R11', 'R12']);
/* Hai kỳ cần báo vào một thời điểm: kỳ trước (trả trong tháng này) và kỳ này
   (trả đầu tháng sau) — báo trước gần một tháng thì người ta còn kịp sắp xếp. */
export async function baoLichTraLuongSapToi(db, now) {
  const homNay = new Date((now || Date.now()) + LECH_VN).toISOString().slice(0, 7);
  const [y, m] = homNay.split('-').map(Number);
  const kyTruoc = m === 1 ? (y - 1) + '-12' : y + '-' + String(m - 1).padStart(2, '0');
  const nd = await docNgayNghi(db);
  return [await baoNgayTraLuong(db, kyTruoc, nd), await baoNgayTraLuong(db, homNay, nd)];
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
  for (let m = 1; m <= 12; m++) lich.push(ngayTraLuong(nam + '-' + String(m).padStart(2, '0'), khai, tenNgay));
  const nghiKhai = Object.keys(khai).filter(k => k.startsWith(String(nam))).sort().map(k => ({ ngay: k, nghi: !!khai[k], ten: tenNgay[k] || '' }));
  return { ok: true, nam, lich, nghiKhai, luat: { ngayTra: NGAY_TRA, ngayLui: NGAY_TRA_LUI, leCoDinh: LE_CO_DINH, thuNghi: THU_NGHI } };
}
export async function khaiNgayNghi(y, env, db, hoSo) {
  if (roleOf(hoSo) !== 'R01') return { ok: false, code: 'NOPERM', error: 'Chỉ Super Admin khai ngày nghỉ.' };
  const x = y || {}, ngay = String(x.ngay || ''), tenNgay = String(x.ten || '').trim().slice(0, 120);
  if (!/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(ngay) || isNaN(Date.parse(ngay + 'T00:00:00Z'))) return { ok: false, code: 'SAI', error: 'Ngày có dạng YYYY-MM-DD.' };
  if (tenNgay.length < 3) return { ok: false, code: 'THIEUCAU', error: 'Ghi tên ngày nghỉ (ví dụ: Mùng 2 Tết, nghỉ bù 30/4).' };
  await db.prepare('INSERT INTO ngayNghi (id, ngay, nghi, ten, boiAi, luc) VALUES (?,?,?,?,?,?)')
    .bind(crypto.randomUUID(), ngay, x.nghi === false ? 0 : 1, tenNgay, ten(hoSo), Date.now()).run();
  try { await Kho.ghiNhatKy(db, { uid: hoSo.uid, username: ten(hoSo), viec: 'KHAI_NGAY_NGHI', doiTuong: ngay, chiTiet: (x.nghi === false ? 'gỡ · ' : 'nghỉ · ') + tenNgay }); } catch (e) {}
  /* Ngày vừa khai có thể dời ngày trả lương của kỳ trước nó (ngày 05–14 của
     tháng ấy) — báo ngay, không chờ lượt chạy đêm. */
  let bao = null;
  const [ny, nm] = ngay.split('-').map(Number);
  if (Number(ngay.slice(8, 10)) >= NGAY_TRA && Number(ngay.slice(8, 10)) <= 14)
    bao = await baoNgayTraLuong(db, nm === 1 ? (ny - 1) + '-12' : ny + '-' + String(nm - 1).padStart(2, '0'));
  return { ok: true, ngay, nghi: x.nghi !== false, bao };
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
/* Chủ hệ chốt 10/10: thi 30 · cấp chứng chỉ (nâng cấp nghiệp vụ) 30 · khối
   40 — và nói rõ thêm: khối 40 = tỷ lệ khách hài lòng 30 + thi nghiệp vụ 10.
   Phần hài lòng đo bằng TỶ LỆ NHÀ HÀI LÒNG (CSAT ≥ 4/5), không bằng điểm
   phiếu tổng — cùng thước với điều kiện thưởng, để một người không đạt KPI
   nhờ phiếu điểm cao mà nhà vẫn chưa hài lòng.

   Thi nghiệp vụ KHÁC thi ngày 28. Thi ngày 28 là bài giải tình huống trên
   giấy; thi nghiệp vụ là bước SÁT HẠCH của chương trình đào tạo (TV08 ·
   CO08) — làm trước mặt người chấm, người chấm khác người học ghi điểm. Đó
   là điểm DUY NHẤT trong sổ đo tay nghề bằng mắt một người thứ hai. */
export const TRONG_SO = Object.freeze({ thi: 30, cap: 30, phanHoi: 30, nghiepVu: 10 });
/* Bước sát hạch của từng hệ, bản chép từ dao-tao-ct.js CT (bộ thử đối chiếu). */
export const BUOC_NGHIEP_VU = Object.freeze({ tuvan: { ct: 'tuvan', buoc: 'TV08' }, coach: { ct: 'coach', buoc: 'CO08' } });
/* Một lần sát hạch có giá trị 365 ngày (MẶC ĐỊNH). Không có hạn thì một
   điểm 95 của ba năm trước nuôi KPI mãi trong khi tay nghề đã khác. */
export const HAN_NGHIEP_VU_NGAY = 365;
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
/* Thi nghiệp vụ: lần sát hạch gần nhất TÍNH ĐẾN CUỐI KỲ, do người chấm ghi.
   Chưa sát hạch thì 0, không phải "chưa đo được" — cùng luật vắng thi ngày
   28: bỏ trọng số thì người né sát hạch lại được chia đều phần 10 cho ba
   phần kia, tức là né được lợi. Lần sát hạch quá hạn cũng 0, và nói ra. */
async function nghiepVuCua(db, maNguoi, he, ky) {
  const b = BUOC_NGHIEP_VU[he], den = cuoiKy(ky);
  const d = await db.prepare('SELECT diem, boiAi, ghiLuc FROM dtBuoc WHERE maNguoi = ? AND ct = ? AND buoc = ? AND loai = ? AND ghiLuc <= ?' +
    ' ORDER BY ghiLuc DESC, rowid DESC LIMIT 1').bind(maNguoi, b.ct, b.buoc, 'nguoiCham', new Date(den).toISOString()).first();
  if (!d) return { diem: 0, ghiChu: 'chưa sát hạch nghiệp vụ (' + b.buoc + ')' };
  const tuoi = Math.floor((den - Date.parse(d.ghiLuc)) / 86400000);
  if (tuoi > HAN_NGHIEP_VU_NGAY) return { diem: 0, ghiChu: 'lần sát hạch gần nhất ' + String(d.ghiLuc).slice(0, 10) + ' đã quá ' + HAN_NGHIEP_VU_NGAY + ' ngày' };
  return { diem: Math.max(0, Math.min(100, Number(d.diem) || 0)), ghiChu: 'sát hạch ' + String(d.ghiLuc).slice(0, 10) + ' · người chấm ' + d.boiAi };
}
/* Một nhà HÀI LÒNG khi điểm hài lòng (CSAT) trung bình của nhà ấy trong
   tháng từ 4/5 trở lên — cách đếm "hai ô trên cùng" quen thuộc của CSAT.
   Tỷ lệ tính trên NHÀ, không trên phiếu: một nhà gửi ba phiếu không được
   nặng gấp ba một nhà gửi một phiếu. */
export const CSAT_HAI_LONG = 4;
async function phanHoiCua(db, maNguoi, ky) {
  const r = (await db.prepare('SELECT maNha, nps, csat, tieuChi FROM danhGiaKH WHERE thang = ? AND (lower(coach) = ? OR lower(tuVan) = ?)').bind(ky, maNguoi, maNguoi).all()).results || [];
  const theoNha = {}, csatNha = {};
  r.forEach(p => { const d = diemPhieu(p); if (d === null) return; (theoNha[p.maNha] = theoNha[p.maNha] || []).push(d); (csatNha[p.maNha] = csatNha[p.maNha] || []).push(Number(p.csat)); });
  const ma = Object.keys(theoNha);
  const nha = ma.map(k => theoNha[k].reduce((s, v) => s + v, 0) / theoNha[k].length);
  const haiLong = ma.filter(k => csatNha[k].reduce((s, v) => s + v, 0) / csatNha[k].length >= CSAT_HAI_LONG).length;
  const du = nha.length >= MAU_TOI_THIEU;
  return { soNha: nha.length, soNhaHaiLong: haiLong, diem: du ? Math.round(nha.reduce((s, v) => s + v, 0) / nha.length) : null,
    tyLeHaiLong: du ? Math.round(100 * haiLong / nha.length) : null };
}
/* Thưởng lương: cả HAI điều kiện, không bù trừ cho nhau — KPI làm việc cao
   mà khách không hài lòng thì không thưởng, và ngược lại. KPI làm việc là
   điểm tổng của tháng (thi ngày 28 · cấp chứng chỉ · hài lòng · nghiệp vụ).
   Chưa đủ mẫu phiếu thì CHƯA xét được — nói thẳng, không đọc ra "không đạt"
   và cũng không đọc ra "đạt". Máy chỉ nói đủ hay chưa đủ điều kiện; số tiền
   thưởng là quyết định của chủ hệ. */
export const NGUONG_THUONG = Object.freeze({ kpi: 90, haiLong: 90 });
/* Mức thưởng 3–5% lương (chủ hệ 10/10), bậc theo KPI: vừa chạm ngưỡng 90 là
   3%, cao hơn thì nhiều hơn. Bậc là MẶC ĐỊNH, chủ hệ chỉnh. Máy trả về phần
   trăm; tiền thì nhân với lương của người ấy ở bảng lương. */
export const MUC_THUONG = Object.freeze([{ tu: 97, pt: 5 }, { tu: 94, pt: 4 }, { tu: 90, pt: 3 }]);
export const ptThuong = kpi => (MUC_THUONG.find(m => kpi >= m.tu) || { pt: 0 }).pt;
export function xetThuong(diem, ph) {
  const thieu = [];
  if (diem < NGUONG_THUONG.kpi) thieu.push('KPI ' + diem + ' dưới ' + NGUONG_THUONG.kpi);
  if (ph.tyLeHaiLong === null) {
    const trangThai = thieu.length ? 'khongDat' : 'chuaXet';
    return { trangThai, du: false, tyLeHaiLong: null,
      lyDo: thieu.concat(['mới ' + ph.soNha + ' nhà có phiếu tháng này, cần ít nhất ' + MAU_TOI_THIEU + ' nhà để tính tỷ lệ hài lòng']).join('; ') };
  }
  if (ph.tyLeHaiLong < NGUONG_THUONG.haiLong) thieu.push('hài lòng ' + ph.tyLeHaiLong + '% dưới ' + NGUONG_THUONG.haiLong + '%');
  const dat = !thieu.length;
  return { trangThai: dat ? 'dat' : 'khongDat', du: dat, tyLeHaiLong: ph.tyLeHaiLong, ptLuong: dat ? ptThuong(diem) : 0,
    lyDo: dat ? 'KPI ' + diem + ' và ' + ph.tyLeHaiLong + '% nhà hài lòng (' + ph.soNhaHaiLong + '/' + ph.soNha + ') — thưởng ' + ptThuong(diem) + '% lương'
      : thieu.join('; ') };
}
export async function chamMotNguoi(db, maNguoi, role, ky) {
  const he = role === 'R11' ? 'tuvan' : 'coach';
  const thi = await diemThiThang(db, maNguoi, he, ky);
  const c = await capCua(db, maNguoi, he, Math.min(Date.now(), cuoiKy(ky)));
  const ph = await phanHoiCua(db, maNguoi, ky);
  const nv = await nghiepVuCua(db, maNguoi, he, ky);
  const phuTrach = (await db.prepare('SELECT COUNT(*) n FROM hoSoKhach WHERE lower(coach) = ? OR lower(tuVan) = ?').bind(maNguoi, maNguoi).first()).n;
  const tp = [
    { ma: 'thi', ten: 'Điểm thi ngày 28', giaTri: thi.diem, trong: TRONG_SO.thi, ghiChu: thi.duThi ? (thi.choCham ? thi.choCham + ' bài chờ chấm' : '') : 'không dự thi' },
    { ma: 'cap', ten: 'Cấp chứng chỉ cuối kỳ', giaTri: Math.round(100 * c.cap / HE_THI[he].soCap), trong: TRONG_SO.cap, ghiChu: 'cấp ' + c.cap + '/' + HE_THI[he].soCap },
    { ma: 'phanHoi', ten: 'Tỷ lệ nhà hài lòng', giaTri: ph.tyLeHaiLong, trong: TRONG_SO.phanHoi,
      ghiChu: ph.soNha + ' nhà có phiếu' + (ph.diem === null ? ' — dưới ' + MAU_TOI_THIEU + ' nhà, chưa đủ mẫu' : '') },
    { ma: 'nghiepVu', ten: 'Thi nghiệp vụ (sát hạch có người chấm)', giaTri: nv.diem, trong: TRONG_SO.nghiepVu, ghiChu: nv.ghiChu }
  ];
  const dung = tp.filter(t => t.giaTri !== null), trongDung = dung.reduce((s, t) => s + t.trong, 0);
  const diem = trongDung ? Math.round(dung.reduce((s, t) => s + t.giaTri * t.trong, 0) / trongDung) : 0;
  return { maNguoi, role, he, ky, diem, hang: hangCua(diem), trongBoQua: 100 - trongDung, thanhPhan: tp,
    soNhaPhanHoi: ph.soNha, soNhaPhuTrach: phuTrach, choChamCon: thi.choCham, thuong: xetThuong(diem, ph) };
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
  const { khai, ten: tenNgay } = await docNgayNghi(db);
  return { ok: true, ky, chiDongCuaToi: rieng, ds, ngayTra: ngayTraLuong(ky, khai, tenNgay),
    luat: { trongSo: TRONG_SO, hang: HANG_LT, mauToiThieu: MAU_TOI_THIEU, tieuChi: TIEU_CHI, thuong: NGUONG_THUONG, mucThuong: MUC_THUONG, csatHaiLong: CSAT_HAI_LONG,
      nghiepVu: BUOC_NGHIEP_VU, hanNghiepVu: HAN_NGHIEP_VU_NGAY },
    gioiHan: 'Máy chỉ nói đủ hay chưa đủ điều kiện thưởng (KPI ≥ ' + NGUONG_THUONG.kpi + ' và ≥ ' + NGUONG_THUONG.haiLong +
      '% nhà hài lòng) và mức thưởng 3–5% lương theo bậc KPI; số tiền = phần trăm × lương của người ấy.' };
}
