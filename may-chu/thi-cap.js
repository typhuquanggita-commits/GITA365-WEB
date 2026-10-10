/* ═══════════════════════════════════════════════════════════════
   GITA 365 — THI CHỨNG CHỈ THEO CẤP: TƯ VẤN 50 CẤP · COACH 100 CẤP

   Lời chủ hệ (10/10/2026): cấp càng cao được truy cập % kho càng nhiều;
   hằng tháng thi lại, bài đánh giá khác nhau và khó hơn; không dập khuôn,
   không câu hỏi đơn thuần, không học thuộc; mỗi người một lộ trình thi
   riêng. Vấn đề khó bắt buộc xin ý kiến bộ phận quản lý, có thể chuyển
   người năng lực cao hơn; nghiêm cấm giấu vấn đề và tự xử lý theo kinh
   nghiệm cá nhân. Vi phạm → hạ bậc, hạ quyền; có thể cấm tham gia và bồi
   thường.

   ══ ĐỀ KHÔNG HỌC THUỘC ĐƯỢC — GHÉP LÚC CHẠY, KHÔNG CÓ NGÂN HÀNG CÂU ══

   Một bài = nhiều CA. Mỗi ca = một vấn đề thật trong kho cấp cao (đã mã
   hoá, chỉ nằm ở D1) × một DẠNG nhiệm vụ (14 dạng, mỗi dạng một thang 4
   tiêu chí) × 0–3 BIẾN CỐ. Ghép theo hạt giống (người · cấp · tháng · lần),
   nên hai người cùng cấp cùng tháng ra hai đề khác nhau. Ca ưu tiên lấy từ
   phần kho người thi CHƯA được mở và chưa gặp trong 12 tháng — không tra
   được lời giải. Dạng nhiệm vụ nghiêng về chỗ người ấy còn yếu (điểm trung
   bình thấp nhất theo dạng) — đó là "lộ trình riêng".

   Bài làm là chữ, NGƯỜI chấm theo thang. Máy chỉ làm việc máy làm được:
   đo thời gian, và báo bài nào chép lại lời giải của kho (trùng cụm 8 chữ).

   ══ CẤP TÍNH LÚC ĐỌC, KHÔNG CÓ CỘT "CẤP HIỆN TẠI" ══

   Cấp = phát lại các sự kiện theo tháng: đạt bài cấp c → giữ hoặc lên cấp c;
   hết một tháng không đạt bài nào ở cấp đang giữ trở lên → tụt một cấp; vi
   phạm đã ghi (chưa bị Super Admin huỷ) → hạ theo mức. Cùng luật cột
   `conHan` · `den` · ba cửa: một cột tóm tắt thì hoặc bị gõ đè, hoặc cũ đi.

   ══ CỔNG CHỈ CHẠY KHI SUPER ADMIN BẬT ══

   Bật cổng là chặn ngay mọi nhân sự chưa có cấp khỏi kho cấp cao — một
   quyết định vận hành, không phải một dòng mã (cùng luật CN-02 ba cửa).
   Chưa bật thì thi, chấm, xin ý kiến, ghi vi phạm vẫn chạy; kho chưa khoá.

   ══ MÁY KHÔNG CẤM, KHÔNG TÍNH BỒI THƯỜNG ══

   Hạ cấp và khoá kho là hệ quả máy làm được và huỷ được. Cấm tham gia và
   bồi thường là quyết định có hậu quả pháp lý — máy chỉ ghi ĐỀ NGHỊ và báo
   Giám đốc + Super Admin. Người bị ghi luôn được viết giải trình.
   ═══════════════════════════════════════════════════════════════ */

import { Kho } from './nen.js';
import { BAC, roleOf, tenNguoiDung as ten } from './vai-tro.js';
import { baoLenCapCao } from './ngan-hang.js';
import { vaiVoiNha, nhaCoThat } from './credit.js';
import { CAP, DANG, BIEN } from './thi-cap-du-lieu.js';

export { CAP, DANG, BIEN };
export const HE_THI = Object.freeze({
  tuvan: { ten: 'Tư vấn', soCap: 50, heKho: ['tuvan'], vaiThi: ['R11'], vaiCham: 4, vaiDuyet: 4 },
  coach: { ten: 'Coach', soCap: 100, heKho: ['coach', 'tuvan'], vaiThi: ['R05', 'R06', 'R07', 'R08'], vaiCham: 6, vaiDuyet: 5 }
});
const HANG = ['S1', 'S3', 'S5', 'VIP', 'VVIP', 'DIAMOND'];
export const HANG_KHO = Object.freeze(['VVIP', 'DIAMOND']);      // "vấn đề khó": luôn xin ý kiến khi cổng bật
export const LAN_TOI_DA_THANG = 2;                               // mỗi tháng tối đa 2 lần thi một hệ
export const NGAY_CHO_PHEP = 14;                                 // ý kiến được duyệt có hiệu lực 14 ngày
export const TRUNG_CHEP = 0.25;                                  // > 25% cụm 8 chữ trùng lời giải kho → báo chép
export const VI_PHAM = Object.freeze({
  GIAU_VAN_DE: 'Giấu vấn đề, không báo',
  TU_Y_XU_LY: 'Tự ý xử lý vấn đề khó / vượt cấp không xin ý kiến',
  VUOT_QUYEN: 'Dùng nội dung hoặc quyền vượt cấp',
  SAI_QUY_TRINH: 'Làm sai quy trình đã chốt',
  GIAN_LAN_THI: 'Gian lận khi thi'
});
/* Mức → hệ quả máy làm được. Mức 3: về cấp 0 và khoá kho 30 ngày. */
export const HE_QUA = Object.freeze({ 1: { ha: 1 }, 2: { ha: 3 }, 3: { ha: 999, khoaNgay: 30 } });
export const DE_XUAT = Object.freeze(['dinhChi', 'boiThuong']);
/* Mỗi ca chấm riêng: một ca dưới SAN_CA (trên 100) là trượt dù điểm trung bình
   đủ — bản đầu lấy trung bình nên bỏ trắng một ca vẫn đạt. */
export const SAN_CA = 50;
/* Bài làm dài tối thiểu tăng ĐỀU theo cấp — mọi cấp đều khó hơn cấp trước ở
   ít nhất một thông số. Bản đầu có những dải cấp trùng hết thông số, chỉ thêm
   phút (tức là DỄ hơn). */
export const chuToiThieu = (he, cap) => 200 + (he === 'coach' ? 5 : 8) * (cap - 1);
/* Thi GIỮ cấp mỗi tháng phải khó hơn lần đạt cấp ấy: thêm một biến cố và nâng
   ngưỡng ba điểm — giữ cấp không phải làm lại đúng bài cũ. */
export function defThi(he, cap, muc) {
  const d = CAP[he][cap - 1];
  if (muc !== 'giu') return Object.assign({}, d, { chuToiThieu: chuToiThieu(he, cap) });
  return Object.assign({}, d, { soBien: Math.min(3, d.soBien + 1), nguong: Math.min(95, d.nguong + 3), chuToiThieu: chuToiThieu(he, cap) + 40 });
}
/* Vai đọc được hệ kho nào — cùng luật docDuocHe của kho-cao.js. R08 thi được
   thang Coach nhưng không đọc kho Coach: nói thẳng thay vì khai một % kho
   không mở được gì. */
const docKho = (heKho, role) => (BAC[role] || 99) <= 7 || (heKho === 'tuvan' && role === 'R11');
const NGAY = 86400000;
const LECH_VN = 7 * 3600000;
export const thangCua = ts => new Date(Number(ts) + LECH_VN).toISOString().slice(0, 7);
const thangSau = t => { const [y, m] = t.split('-').map(Number); return m === 12 ? (y + 1) + '-01' : y + '-' + String(m + 1).padStart(2, '0'); };
const sach = (s, n) => String(s == null ? '' : s).replace(/[\u0000-\u0008\u000b-\u001f]+/g, ' ').trim().slice(0, n);
const lv = hoSo => BAC[roleOf(hoSo)] || 99;
const laQuanLy = hoSo => lv(hoSo) <= 4;

/* Định danh chính tắc (id · tên · email → username thường). Không tra được → null, nơi gọi ĐÓNG. */
async function nguoi(db, raw) {
  const uid = await Kho.layUid(db, raw);
  if (!uid) return null;
  const nd = await Kho.nguoiTheoId(db, uid);
  if (!nd || !Number(nd.active) || nd.deletedAt) return null;
  return { uid, ten: String(nd.username || '').toLowerCase(), role: nd.role };
}

/* ═══════════════ CẤU HÌNH · CỔNG ═══════════════ */
async function cauHinh(db, khoa) {
  const r = await db.prepare('SELECT giaTri FROM thiCauHinh WHERE khoa = ? ORDER BY luc DESC, rowid DESC LIMIT 1').bind(khoa).first();
  return r ? r.giaTri : null;
}
export async function congBat(db) { return (await cauHinh(db, 'cong')) === 'bat'; }

export async function datCongThi(y, env, db, hoSo) {
  if (roleOf(hoSo) !== 'R01') return { ok: false, code: 'NOPERM', error: 'Chỉ Super Admin bật hoặc tắt cổng thi.' };
  const bat = !!(y || {}).bat, lyDo = sach((y || {}).lyDo, 300);
  if (lyDo.length < 10) return { ok: false, code: 'LYDO', error: 'Ghi lý do (ít nhất 10 ký tự) — bật cổng là chặn mọi người chưa có cấp khỏi kho cấp cao.' };
  await db.prepare('INSERT INTO thiCauHinh (id, khoa, giaTri, lyDo, boiAi, luc) VALUES (?,?,?,?,?,?)')
    .bind(crypto.randomUUID(), 'cong', bat ? 'bat' : 'tat', lyDo, ten(hoSo), Date.now()).run();
  return { ok: true, bat };
}

/* ═══════════════ CHẤM · ĐẠT HAY KHÔNG (tính lúc đọc) ═══════════════ */
async function ketQuaLuot(db, l) {
  const capDef = defThi(l.he, l.cap, l.muc);
  const r = await db.prepare('SELECT boiAi, diem, loiTruot, chiTiet, ghiChu, luc FROM thiCham WHERE luot = ? ORDER BY luc ASC, rowid ASC').bind(l.id).all();
  /* Mỗi người chấm đúng MỘT lần (chỉ mục duy nhất luot+boiAi); chỉ tính
     soNguoiCham người đầu — điểm thêm sau khi đã chốt không đảo được kết quả. */
  const theoNguoi = {};
  (r.results || []).forEach(c => { if (!theoNguoi[c.boiAi]) theoNguoi[c.boiAi] = c; });
  const cham = Object.values(theoNguoi).slice(0, capDef.soNguoiCham);
  const qua = l.nopLuc && l.hanLuc && Number(l.nopLuc) > Number(l.hanLuc);
  const duNguoi = cham.length >= capDef.soNguoiCham;
  const caDuSan = c => { try { return JSON.parse(c.chiTiet).every(d => d.reduce((a, b) => a + Number(b || 0), 0) >= SAN_CA); } catch (e) { return false; } };
  const dat = !!l.nopLuc && !qua && duNguoi && cham.every(c => Number(c.diem) >= capDef.nguong && !c.loiTruot && caDuSan(c));
  const trangThai = !l.nopLuc ? 'dangLam' : !duNguoi ? 'choCham' : dat ? 'dat' : 'truot';
  return { trangThai, dat, quaGio: !!qua, cham, nguong: capDef.nguong, canNguoi: capDef.soNguoiCham };
}

/* ═══════════════ CẤP HIỆN TẠI (phát lại sự kiện) ═══════════════ */
export async function capCua(db, maNguoi, he, now) {
  now = now || Date.now();
  const luot = (await db.prepare('SELECT * FROM thiLuot WHERE maNguoi = ? AND he = ? AND nopLuc IS NOT NULL ORDER BY nopLuc ASC, rowid ASC')
    .bind(maNguoi, he).all()).results || [];
  /* Tháng của một bài = tháng BẮT ĐẦU (cùng đồng hồ với phép đếm lượt). */
  const dat = [];
  for (const l of luot) { const k = await ketQuaLuot(db, l); if (k.dat) dat.push({ luc: Number(l.nopLuc), batDau: Number(l.batDau), thang: thangCua(l.batDau), cap: l.cap }); }
  /* Vi phạm còn hiệu lực = quyết định MỚI NHẤT không phải 'huy'. Bản đầu xét
     "có dòng huy nào" — huỷ rồi xác nhận lại vẫn bị coi là đã huỷ. */
  const vp = (await db.prepare('SELECT v.id, v.mucDo, v.luc FROM viPhamNangLuc v WHERE v.maNguoi = ? AND v.he = ? AND COALESCE(' +
    '(SELECT q.quyet FROM viPhamQuyet q WHERE q.viPham = v.id ORDER BY q.luc DESC, q.rowid DESC LIMIT 1), \'\') <> \'huy\' ORDER BY v.luc ASC, v.rowid ASC').bind(maNguoi, he).all()).results || [];
  let cap = 0, khoaDen = 0;
  if (!dat.length && !vp.length) return { cap: 0, thangNay: thangCua(now), datThangNay: false, khoaDen: 0 };
  const thangDau = [dat[0] && dat[0].thang, vp[0] && thangCua(vp[0].luc)].filter(Boolean).sort()[0];
  const thangNay = thangCua(now);
  let datThangNay = false, haLuc = 0;
  for (let t = thangDau; t <= thangNay; t = thangSau(t)) {
    const ev = [...dat.filter(d => d.thang === t).map(d => ({ luc: d.luc, dat: d.cap, batDau: d.batDau })),
      ...vp.filter(v => thangCua(v.luc) === t).map(v => ({ luc: Number(v.luc), muc: v.mucDo }))]
      /* Trùng mili-giây thì vi phạm đi TRƯỚC bài đạt: bản đầu giữ thứ tự đưa vào
         (bài đạt trước), nên một bài nộp đúng mili-giây ấy được tính lên cấp rồi
         vi phạm mới trừ — kết quả đổi theo tốc độ máy, đỏ thỉnh thoảng trên CI. */
      .sort((a, b) => a.luc - b.luc || (a.muc ? 0 : 1) - (b.muc ? 0 : 1));
    let giuDuoc = false;
    for (const e of ev) {
      /* Bài BẮT ĐẦU trước một lần bị hạ (vi phạm hoặc tụt tháng) không được
         dựng lại cấp đã mất: đề của nó ghép theo cấp cũ. */
      if (e.dat) { if (e.batDau >= haLuc && e.dat >= cap) { cap = e.dat; giuDuoc = true; } }
      else { const hq = HE_QUA[e.muc] || HE_QUA[1]; cap = Math.max(0, cap - hq.ha); haLuc = e.luc; if (hq.khoaNgay) khoaDen = Math.max(khoaDen, e.luc + hq.khoaNgay * NGAY); }
    }
    if (t === thangNay) { datThangNay = giuDuoc; break; }
    if (!giuDuoc && cap > 0) { cap -= 1; haLuc = Date.parse(thangSau(t) + '-01T00:00:00+07:00'); }   // hết tháng không đạt → tụt một cấp
  }
  return { cap, thangNay, datThangNay, khoaDen };
}

/* % kho được mở. Quản lý (R01–R04) mở hết. Cổng tắt → mở hết. Khoá kho do vi phạm mức 3 → 0. */
export async function khoaCua(db, maNguoi) {
  let den = 0;
  for (const h of Object.keys(HE_THI)) { const c = await capCua(db, maNguoi, h); den = Math.max(den, c.khoaDen || 0); }
  return den > Date.now() ? den : 0;
}
export async function phamViKho(db, hoSo, heKho) {
  const ai = await nguoi(db, hoSo.u);
  /* Khoá do vi phạm mức 3 áp cả khi cổng tắt và cả với quản lý — bản đầu
     kiểm khoá SAU lối tắt "cổng tắt", nên lời báo "đã khoá kho 30 ngày" là
     một lời nói dối mang dấu hệ thống. */
  if (ai && roleOf(hoSo) !== 'R01') { const den = await khoaCua(db, ai.ten); if (den) return { het: false, pct: 0, ly: 'khoaDoViPham', khoaDen: den }; }
  if (laQuanLy(hoSo)) return { het: true, ly: 'quanLy' };
  if (!(await congBat(db))) return { het: true, ly: 'congTat' };
  if (!ai) return { het: false, pct: 0 };
  if (!docKho(heKho, ai.role)) return { het: false, pct: 0, ly: 'vaiKhongDocKho' };
  const heThi = Object.keys(HE_THI).find(h => HE_THI[h].vaiThi.includes(ai.role) && HE_THI[h].heKho.includes(heKho));
  if (!heThi) return { het: false, pct: 0, ly: 'khongThuocHe' };
  const c = await capCua(db, ai.ten, heThi);
  const pct = c.cap ? CAP[heThi][c.cap - 1].kho : 0;
  return { het: false, pct, cap: c.cap, heThi };
}
/* Danh sách mã được mở trong một hệ kho, theo thứ tự hạng → tầng → số thứ tự (dễ trước khó). */
export async function maDuocMo(db, hoSo, heKho) {
  const pv = await phamViKho(db, hoSo, heKho);
  if (pv.het) return { het: true, pv };
  const rows = (await db.prepare('SELECT ma, hang, tang, stt FROM khoCao WHERE he = ?').bind(heKho).all()).results || [];
  rows.sort((a, b) => HANG.indexOf(a.hang) - HANG.indexOf(b.hang) || a.tang - b.tang || a.stt - b.stt);
  const n = Math.floor(rows.length * pv.pct / 100);
  return { het: false, pv, mo: new Set(rows.slice(0, n).map(r => r.ma)) };
}
/* Ý kiến đã duyệt còn hiệu lực cho (người, nhà, mã). */
/* Chỉ QUYẾT ĐỊNH MỚI NHẤT của mỗi lượt xin có hiệu lực. Bản đầu nhận bất kỳ
   dòng cho/chuyen nào từng có — rút lại (tuChoi) hay chuyển sang người khác
   thì người cũ vẫn giữ quyền. maNha rỗng = mọi nhà (đủ để ĐỌC nội dung);
   chiChuyen = chỉ ca được CHUYỂN sang (mới cho phép đề xuất ở nhà mình không
   phụ trách). */
export async function coChoPhep(db, maNguoi, maNha, ma, chiChuyen) {
  const r = await db.prepare('SELECT q.quyet, q.choAi, q.hetHan FROM xinYKien x JOIN xinYKienQuyet q ON q.xin = x.id WHERE x.ma = ?' +
    (maNha ? ' AND x.maNha = ?' : '') + ' AND q.rowid = (SELECT q2.rowid FROM xinYKienQuyet q2 WHERE q2.xin = x.id ORDER BY q2.luc DESC, q2.rowid DESC LIMIT 1)')
    .bind(...(maNha ? [ma, maNha] : [ma])).all();
  const ok = chiChuyen ? ['chuyen'] : ['cho', 'chuyen'];
  return (r.results || []).some(q => ok.includes(q.quyet) && String(q.choAi || '').toLowerCase() === String(maNguoi || '').toLowerCase() && Number(q.hetHan) > Date.now());
}
/* Mã vấn đề đang nằm trong một bài thi chưa nộp của người này — kho không
   được đưa lời giải của chính những ca ấy ra giữa giờ thi. */
export async function maDangThi(db, maNguoi) {
  const r = (await db.prepare('SELECT de FROM thiLuot WHERE maNguoi = ? AND nopLuc IS NULL AND hanLuc > ?').bind(String(maNguoi || '').toLowerCase(), Date.now()).all()).results || [];
  const o = new Set(); r.forEach(x => { try { JSON.parse(x.de).forEach(c => o.add(c.ma)); } catch (e) {} });
  return o;
}

/* ═══════════════ GHÉP ĐỀ ═══════════════ */
async function bam(s) {
  const b = new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)));
  let i = 0;
  return () => { const v = b[i % 32] * 256 + b[(i + 7) % 32]; i++; return v / 65536; };   // dòng số giả ngẫu nhiên từ hạt giống
}
function chonCoTrongSo(ds, w, rnd) {
  const tong = ds.reduce((s, x) => s + w(x), 0); let r = rnd() * tong;
  for (const x of ds) { r -= w(x); if (r <= 0) return x; }
  return ds[ds.length - 1];
}
async function diemTheoDang(db, maNguoi, he) {
  const r = await db.prepare('SELECT c.chiTiet, l.de FROM thiCham c JOIN thiLuot l ON l.id = c.luot WHERE l.maNguoi = ? AND l.he = ? ORDER BY c.luc DESC, c.rowid DESC LIMIT 60')
    .bind(maNguoi, he).all();
  const tb = {};
  for (const row of (r.results || [])) {
    let ct = [], de = []; try { ct = JSON.parse(row.chiTiet); de = JSON.parse(row.de); } catch (e) { continue; }
    ct.forEach((d, i) => { const dg = de[i] && de[i].dang; if (!dg || !Array.isArray(d)) return; (tb[dg] = tb[dg] || []).push(d.reduce((s, x) => s + Number(x || 0), 0)); });
  }
  const o = {}; Object.keys(tb).forEach(k => { o[k] = tb[k].reduce((s, x) => s + x, 0) / tb[k].length; });
  return o;
}
export async function ghepDe(db, ai, he, cap, thang, lan, hoSoAi, muc) {
  const def = defThi(he, cap, muc);
  const rnd = await bam([ai.ten, he, cap, thang, lan].join('|'));
  let pool = [];
  for (const hk of HE_THI[he].heKho) {
    const rows = (await db.prepare('SELECT ma, hang FROM khoCao WHERE he = ?').bind(hk).all()).results || [];
    pool = pool.concat(rows.filter(r => def.hangCa.includes(r.hang)));
  }
  if (pool.length < def.soCa) return { loi: 'Kho cấp cao chưa đủ vấn đề ở hạng ' + def.hangCa.join('/') + ' để ghép đề — Super Admin nạp gói trước.' };
  const daGap = new Set();
  const cu = (await db.prepare('SELECT de FROM thiLuot WHERE maNguoi = ? AND batDau > ?').bind(ai.ten, Date.now() - 365 * NGAY).all()).results || [];
  cu.forEach(r => { try { JSON.parse(r.de).forEach(x => daGap.add(x.ma)); } catch (e) {} });
  const mo = new Set();
  for (const hk of HE_THI[he].heKho) { const m = await maDuocMo(db, hoSoAi, hk); if (!m.het) m.mo.forEach(x => mo.add(x)); }
  /* Ca nằm trong phần kho người thi ĐÃ MỞ thì họ đọc được lời giải từ trước —
     bản đầu chỉ cho nó nhẹ ký hơn (2 so với 3), nên ca dễ thường vẫn rơi
     vào đề. Nay đủ ca ngoài phần đã mở thì CHỈ ghép từ đó. */
  const ngoaiMo = pool.filter(r => !mo.has(r.ma));
  if (mo.size && ngoaiMo.length >= def.soCa) pool = ngoaiMo;
  /* Ưu tiên: chưa mở & chưa gặp (3) > chưa gặp (2) > còn lại (1). */
  const w = r => (!mo.has(r.ma) && !daGap.has(r.ma) ? 3 : !daGap.has(r.ma) ? 2 : 1);
  const yeu = await diemTheoDang(db, ai.ten, he);
  const wDang = d => (yeu[d] == null ? 60 : Math.max(5, 100 - yeu[d]));    // dạng yếu nặng ký hơn
  const de = [], dung = new Set();
  for (let i = 0; i < def.soCa; i++) {
    const conLai = pool.filter(r => !dung.has(r.ma));
    const p = chonCoTrongSo(conLai, w, rnd); dung.add(p.ma);
    const dang = chonCoTrongSo(def.dang, wDang, rnd);
    const bien = []; const bc = BIEN.map((_, k) => k);
    for (let j = 0; j < def.soBien; j++) { const k = Math.floor(rnd() * bc.length); bien.push(bc.splice(k, 1)[0]); }
    de.push({ ma: p.ma, dang, bien });
  }
  return { de };
}

/* Trùng cụm 8 chữ giữa bài làm và lời giải trong kho — báo, không kết luận. */
function cum8(s) { const t = String(s || '').toLowerCase().normalize('NFC').split(/[^\p{L}\p{N}]+/u).filter(Boolean); const o = new Set(); for (let i = 0; i + 8 <= t.length; i++) o.add(t.slice(i, i + 8).join(' ')); return o; }
/* Chỉ đo TỈ LỆ thì chép nguyên một đoạn lời giải rồi viết thêm cho dài
   là lọt — tỉ lệ bị pha loãng. Nên báo khi tỉ lệ vượt TRUNG_CHEP HOẶC
   khi số cụm 8 chữ trùng đạt CUM_CHEP (12 cụm ≈ 19 chữ liền nhau giống
   hệt kho — không ai viết trùng tình cờ dài thế). */
export const CUM_CHEP = 12;
export function doChep(baiLam, loiGiai) {
  const a = cum8(baiLam); if (!a.size) return { ty: 0, cum: 0 };
  const b = cum8(loiGiai); let n = 0; a.forEach(x => { if (b.has(x)) n++; });
  return { ty: n / a.size, cum: n };
}
export function tyLeChep(baiLam, loiGiai) { return doChep(baiLam, loiGiai).ty; }

/* ═══════════════ CỬA ═══════════════ */
const heHopLe = h => (HE_THI[h] ? h : null);
const vaiThiDuoc = (he, role) => HE_THI[he].vaiThi.includes(role) || BAC[role] <= 4;

/* Bắt đầu một bài. muc: 'giu' (thi ở cấp đang giữ) hoặc 'len' (cấp kế). */
export async function batDauThi(y, env, db, hoSo) {
  const he = heHopLe((y || {}).he);
  if (!he) return { ok: false, code: 'SAI', error: 'Hệ thi là tuvan hoặc coach.' };
  const ai = await nguoi(db, hoSo.u);
  if (!ai) return { ok: false, code: 'KHONGNGUOI', error: 'Không tra được tài khoản.' };
  if (!vaiThiDuoc(he, ai.role)) return { ok: false, code: 'NOPERM', error: 'Thang ' + HE_THI[he].ten + ' dành cho vai ' + HE_THI[he].vaiThi.join(' · ') + '.' };
  const dang = await db.prepare('SELECT id FROM thiLuot WHERE maNguoi = ? AND nopLuc IS NULL AND hanLuc > ?').bind(ai.ten, Date.now()).first();
  if (dang) return { ok: false, code: 'DANGLAM', error: 'Đang có một bài chưa nộp.', luot: dang.id };
  const thang = thangCua(Date.now());
  const soLan = (await db.prepare('SELECT COUNT(*) n FROM thiLuot WHERE maNguoi = ? AND he = ? AND thang = ?').bind(ai.ten, he, thang).first()).n;
  if (soLan >= LAN_TOI_DA_THANG) return { ok: false, code: 'HETLAN', error: 'Tháng này đã thi ' + soLan + ' lần thang ' + HE_THI[he].ten + '. Mỗi tháng tối đa ' + LAN_TOI_DA_THANG + ' lần.' };
  const c = await capCua(db, ai.ten, he);
  const muc = (y || {}).muc === 'giu' && c.cap > 0 ? 'giu' : 'len';
  const cap = muc === 'giu' ? c.cap : Math.min(HE_THI[he].soCap, c.cap + 1);
  const g = await ghepDe(db, ai, he, cap, thang, soLan + 1, hoSo, muc);
  if (g.loi) return { ok: false, code: 'KHOCHUANAP', error: g.loi };
  const def = defThi(he, cap, muc), id = 'TL-' + crypto.randomUUID().replace(/-/g, '').slice(0, 12).toUpperCase(), luc = Date.now();
  /* Kiểm-rồi-ghi trong MỘT câu: ba lượt gọi dồn cùng lúc từng mở được ba bài
     (vượt trần hai lượt/tháng và luật một bài đang làm). */
  const r = await db.prepare('INSERT INTO thiLuot (id, maNguoi, he, cap, muc, thang, de, batDau, hanLuc) SELECT ?,?,?,?,?,?,?,?,? ' +
    'WHERE (SELECT COUNT(*) FROM thiLuot WHERE maNguoi = ? AND he = ? AND thang = ?) < ? ' +
    'AND NOT EXISTS (SELECT 1 FROM thiLuot WHERE maNguoi = ? AND nopLuc IS NULL AND hanLuc > ?)')
    .bind(id, ai.ten, he, cap, muc, thang, JSON.stringify(g.de), luc, luc + def.phut * 60000, ai.ten, he, thang, LAN_TOI_DA_THANG, ai.ten, luc).run();
  if (!r || !r.meta || !r.meta.changes) return { ok: false, code: 'DANGLAM', error: 'Đang có một bài chưa nộp, hoặc tháng này đã hết lượt thi.' };
  return { ok: true, luot: id, cap, muc, phut: def.phut, chuToiThieu: def.chuToiThieu };
}

/* Đọc đề: người thi đọc bài của mình; người chấm đọc bài được giao. Không gửi lời giải của kho. */
async function deDayDu(db, l) {
  let de = []; try { de = JSON.parse(l.de); } catch (e) {}
  const out = [];
  for (const x of de) {
    const k = await db.prepare('SELECT ma, hang, tang, ten, noiDung FROM khoCao WHERE ma = ?').bind(x.ma).first();
    let nd = {}; try { nd = JSON.parse(k.noiDung); } catch (e) {}
    const dg = DANG.find(d => d.ma === x.dang) || {};
    out.push({ ma: x.ma, hang: k && k.hang, tang: k && k.tang, ten: k && k.ten, van: nd.van || '', boiCanh: (nd.phanTich || {}).boiCanh || '',
      dang: x.dang, tenDang: dg.ten, yeuCau: dg.yeuCau, thang: (dg.thang || []).map(t => ({ ten: t[0], moTa: t[1] })),
      bien: (x.bien || []).map(i => BIEN[i]) });
  }
  return out;
}
export async function docBaiThi(y, env, db, hoSo) {
  const id = String((y || {}).luot || '');
  const l = await db.prepare('SELECT * FROM thiLuot WHERE id = ?').bind(id).first();
  if (!l) return { ok: false, code: 'KHONGCO', error: 'Không có bài thi này.' };
  const ai = await nguoi(db, hoSo.u);
  if (!ai) return { ok: false, code: 'KHONGNGUOI', error: 'Không tra được tài khoản.' };
  const laChu = ai.ten === l.maNguoi;
  if (!laChu && !(await duocCham(db, hoSo, ai, l))) return { ok: false, code: 'NOPERM', error: 'Chỉ người thi hoặc người chấm đủ thẩm quyền đọc bài này.' };
  const kq = await ketQuaLuot(db, l);
  let baiLam = []; try { baiLam = JSON.parse(l.baiLam || '[]'); } catch (e) {}
  /* Chấm mù: người chấm chưa nộp điểm thì không thấy điểm của người kia. */
  const minhDaCham = kq.cham.some(c => c.boiAi === ai.ten);
  const cham = laChu ? (kq.trangThai === 'choCham' ? [] : kq.cham) : (minhDaCham ? kq.cham : kq.cham.filter(c => c.boiAi === ai.ten));
  return { ok: true, luot: l.id, he: l.he, cap: l.cap, ma: CAP[l.he][l.cap - 1].ma, tenCap: CAP[l.he][l.cap - 1].ten, muc: l.muc,
    batDau: l.batDau, hanLuc: l.hanLuc, nopLuc: l.nopLuc || 0, de: await deDayDu(db, l), baiLam: (laChu || l.nopLuc) ? baiLam : [],
    canhBao: laChu ? undefined : (l.canhBao ? JSON.parse(l.canhBao) : []), trangThai: kq.trangThai, quaGio: kq.quaGio,
    nguong: kq.nguong, canNguoi: kq.canNguoi, chuToiThieu: defThi(l.he, l.cap, l.muc).chuToiThieu, sanCa: SAN_CA, cham: cham.map(c => ({ boiAi: c.boiAi, diem: c.diem, loiTruot: c.loiTruot || '', ghiChu: c.ghiChu || '', chiTiet: (() => { try { return JSON.parse(c.chiTiet); } catch (e) { return []; } })() })) };
}

export async function nopBaiThi(y, env, db, hoSo) {
  const id = String((y || {}).luot || '');
  const l = await db.prepare('SELECT * FROM thiLuot WHERE id = ?').bind(id).first();
  if (!l) return { ok: false, code: 'KHONGCO', error: 'Không có bài thi này.' };
  const ai = await nguoi(db, hoSo.u);
  if (!ai || ai.ten !== l.maNguoi) return { ok: false, code: 'NOPERM', error: 'Chỉ người thi nộp bài của mình.' };
  if (l.nopLuc) return { ok: false, code: 'DANOP', error: 'Bài đã nộp.' };
  let de = []; try { de = JSON.parse(l.de); } catch (e) {}
  const bl = Array.isArray((y || {}).baiLam) ? y.baiLam.map(s => sach(s, 8000)) : [];
  const toiThieu = defThi(l.he, l.cap, l.muc).chuToiThieu;
  if (bl.length !== de.length || bl.some(s => s.length < toiThieu)) return { ok: false, code: 'THIEU', error: 'Mỗi ca cần một bài viết từ ' + toiThieu + ' ký tự — đề này có ' + de.length + ' ca.' };
  const canhBao = [];
  for (let i = 0; i < de.length; i++) {
    const k = await db.prepare('SELECT noiDung FROM khoCao WHERE ma = ?').bind(de[i].ma).first();
    let nd = {}; try { nd = JSON.parse(k.noiDung); } catch (e) {}
    const loiGiai = [nd.phacDo, nd.buoc, nd.kyNang, nd.luuY, nd.phuongAn, nd.ketQua, nd.baiHoc, nd.t2080].map(v => typeof v === 'string' ? v : JSON.stringify(v || '')).join(' ');
    const ch = doChep(bl[i], loiGiai);
    if (ch.ty > TRUNG_CHEP || ch.cum >= CUM_CHEP) canhBao.push({ ca: i + 1, loai: 'chepKho', tyLe: Math.round(ch.ty * 100), cum: ch.cum });
  }
  const luc = Date.now();
  /* Ghi MỘT lần (WHERE nopLuc IS NULL). Lượt nộp thua cuộc đua phải biết là thua. */
  const w = await db.prepare('UPDATE thiLuot SET baiLam = ?, nopLuc = ?, canhBao = ? WHERE id = ? AND nopLuc IS NULL').bind(JSON.stringify(bl), luc, JSON.stringify(canhBao), id).run();
  if (!w || !w.meta || !w.meta.changes) return { ok: false, code: 'DANOP', error: 'Bài đã nộp.' };
  return { ok: true, quaGio: luc > Number(l.hanLuc), canhBao: canhBao.length };
}

/* Ai được chấm: khác người thi (định danh chính tắc), vai đủ (Tư vấn: R01–R04; Coach: R01–R06),
   và nếu không phải quản lý (R01–R04) thì cấp của chính mình phải cao hơn cấp bài thi. */
async function duocCham(db, hoSo, ai, l) {
  if (ai.ten === l.maNguoi) return false;
  const b = BAC[ai.role] || 99;
  if (b > HE_THI[l.he].vaiCham) return false;
  if (b <= 4) return true;
  const c = await capCua(db, ai.ten, l.he);
  return c.cap > l.cap;
}
export async function chamBaiThi(y, env, db, hoSo) {
  const x = y || {}, id = String(x.luot || '');
  const l = await db.prepare('SELECT * FROM thiLuot WHERE id = ?').bind(id).first();
  if (!l) return { ok: false, code: 'KHONGCO', error: 'Không có bài thi này.' };
  const ai = await nguoi(db, hoSo.u);
  if (!ai) return { ok: false, code: 'KHONGNGUOI', error: 'Không tra được tài khoản.' };
  if (ai.ten === l.maNguoi) return { ok: false, code: 'TUCHAM', error: 'Không tự chấm bài của mình.' };
  if (!(await duocCham(db, hoSo, ai, l))) return { ok: false, code: 'NOPERM', error: 'Chấm bài cấp ' + l.cap + ' cần vai quản lý, hoặc người có cấp cao hơn cấp bài thi.' };
  if (!l.nopLuc) return { ok: false, code: 'CHUANOP', error: 'Bài chưa nộp.' };
  if (await khoaCua(db, ai.ten)) return { ok: false, code: 'DANGKHOA', error: 'Đang bị khoá quyền do vi phạm mức 3 — không chấm bài trong thời gian khoá.' };
  /* Một người chấm đúng một lần, và đủ người thì chốt. Bản đầu cho chấm lại:
     chấm bừa một điểm để mở điểm của người kia rồi chấm lại theo — phá chấm
     mù; hoặc thêm một điểm 0 vào bài đã đạt từ nhiều tháng trước. Sửa điểm
     sai là quyết định của Super Admin, không phải một lượt chấm thêm. */
  const kq0 = await ketQuaLuot(db, l);
  if (kq0.cham.some(c => c.boiAi === ai.ten)) return { ok: false, code: 'DACHAM', error: 'Anh/chị đã chấm bài này — mỗi người chấm một lần.' };
  if (kq0.cham.length >= kq0.canNguoi) return { ok: false, code: 'DUNGUOI', error: 'Bài đã đủ người chấm và đã chốt kết quả.' };
  let de = []; try { de = JSON.parse(l.de); } catch (e) {}
  const ct = Array.isArray(x.chiTiet) ? x.chiTiet : [];
  const hop = ct.length === de.length && ct.every(d => Array.isArray(d) && d.length === 4 && d.every(v => Number.isInteger(v) && v >= 0 && v <= 25));
  if (!hop) return { ok: false, code: 'SAI', error: 'Chấm đủ mọi ca, mỗi ca 4 tiêu chí, mỗi tiêu chí số nguyên 0–25.' };
  const ghiChu = sach(x.ghiChu, 1500), loiTruot = sach(x.loiTruot, 300);
  if (ghiChu.length < 30) return { ok: false, code: 'THIEUCAU', error: 'Viết nhận xét (từ 30 ký tự): điểm mạnh, chỗ cần nâng.' };
  const diem = Math.round(ct.reduce((s, d) => s + d.reduce((a, b) => a + b, 0), 0) / ct.length);
  try {
    await db.prepare('INSERT INTO thiCham (id, luot, boiAi, diem, chiTiet, loiTruot, ghiChu, luc) VALUES (?,?,?,?,?,?,?,?)')
      .bind(crypto.randomUUID(), id, ai.ten, diem, JSON.stringify(ct), loiTruot || null, ghiChu, Date.now()).run();
  } catch (e) {
    if (/UNIQUE/i.test(String(e && e.message || e))) return { ok: false, code: 'DACHAM', error: 'Anh/chị đã chấm bài này — mỗi người chấm một lần.' };
    throw e;
  }
  const kq = await ketQuaLuot(db, l);
  return { ok: true, diem, trangThai: kq.trangThai };
}

/* Hàng đợi chấm: bài đã nộp, mình được chấm, mình chưa chấm, còn thiếu người chấm. */
/* Số người chấm cần cho mỗi (thang, cấp), viết thành biểu thức SQL từ chính CAP
   — để câu truy vấn lọc đúng bài còn thiếu người, không phải một hằng số 2. */
const SQL_CAN_NGUOI = 'CASE ' + Object.keys(CAP).map(h => {
  const tu = (CAP[h].find(c => c.soNguoiCham >= 2) || {}).cap;
  return tu ? "WHEN l.he = '" + h + "' AND l.cap >= " + Number(tu) + ' THEN 2 ' : '';
}).join('') + 'ELSE 1 END';
export async function dsBaiCham(y, env, db, hoSo) {
  const ai = await nguoi(db, hoSo.u);
  if (!ai) return { ok: false, code: 'KHONGNGUOI', error: 'Không tra được tài khoản.' };
  if ((BAC[ai.role] || 99) > 6) return { ok: false, code: 'NOPERM', error: 'Hàng chấm mở cho R01–R06.' };
  /* Lọc NGAY trong câu truy vấn: bản đầu lấy 200 bài nộp CŨ NHẤT rồi mới bỏ bài
     đã chấm, nên từ bài thứ 201 không ai còn thấy bài mới để chấm. */
  const rows = (await db.prepare('SELECT * FROM thiLuot l WHERE l.nopLuc IS NOT NULL AND l.maNguoi <> ? ' +
    'AND NOT EXISTS (SELECT 1 FROM thiCham c WHERE c.luot = l.id AND c.boiAi = ?) ' +
    'AND (SELECT COUNT(DISTINCT c.boiAi) FROM thiCham c WHERE c.luot = l.id) < ' + SQL_CAN_NGUOI + ' ORDER BY l.nopLuc ASC, l.rowid ASC LIMIT 200').bind(ai.ten, ai.ten).all()).results || [];
  const ds = [];
  for (const l of rows) {
    if (!(await duocCham(db, hoSo, ai, l))) continue;
    const kq = await ketQuaLuot(db, l);
    if (kq.trangThai !== 'choCham' || kq.cham.some(c => c.boiAi === ai.ten)) continue;
    ds.push({ luot: l.id, he: l.he, cap: l.cap, ma: CAP[l.he][l.cap - 1].ma, nopLuc: l.nopLuc, daCham: kq.cham.length, canNguoi: kq.canNguoi, coCanhBao: !!(l.canhBao && l.canhBao !== '[]') });
  }
  return { ok: true, ds };
}

/* Bảng của tôi: cấp từng hệ, tháng này đã giữ cấp chưa, % kho, bài gần đây, ý kiến, vi phạm. */
export async function thiCuaToi(y, env, db, hoSo) {
  const ai = await nguoi(db, hoSo.u);
  if (!ai) return { ok: false, code: 'KHONGNGUOI', error: 'Không tra được tài khoản.' };
  if ((BAC[ai.role] || 99) > 12) return { ok: false, code: 'NOPERM', error: 'Thi chứng chỉ dành cho nhân sự.' };
  const he = [];
  for (const h of Object.keys(HE_THI)) {
    if (!vaiThiDuoc(h, ai.role)) continue;
    const c = await capCua(db, ai.ten, h);
    const pv = await phamViKho(db, hoSo, HE_THI[h].heKho[0]);
    const luot = (await db.prepare('SELECT * FROM thiLuot WHERE maNguoi = ? AND he = ? ORDER BY batDau DESC, rowid DESC LIMIT 12').bind(ai.ten, h).all()).results || [];
    const bai = [];
    for (const l of luot) { const k = await ketQuaLuot(db, l); bai.push({ luot: l.id, cap: l.cap, muc: l.muc, thang: l.thang, trangThai: k.trangThai, quaGio: k.quaGio, hanLuc: l.hanLuc }); }
    const soLan = luot.filter(l => l.thang === c.thangNay).length;
    he.push({ he: h, ten: HE_THI[h].ten, soCap: HE_THI[h].soCap, cap: c.cap, tenCap: c.cap ? CAP[h][c.cap - 1].ten : '', capKe: Math.min(HE_THI[h].soCap, c.cap + 1),
      tenCapKe: CAP[h][Math.min(HE_THI[h].soCap, c.cap + 1) - 1].ten, datThangNay: c.datThangNay, thangNay: c.thangNay,
      /* Chứng chỉ = cấp đang giữ. Đạt tháng này thì giữ tới hết tháng SAU (tụt
         nếu tháng sau không đạt); chưa đạt thì tới hết tháng này. */
      hieuLucDen: c.cap ? Date.parse((c.datThangNay ? thangSau(thangSau(c.thangNay)) : thangSau(c.thangNay)) + '-01T00:00:00+07:00') - 1 : 0,
      conLanThang: Math.max(0, LAN_TOI_DA_THANG - soLan), kho: pv.het ? 100 : pv.pct, khoHet: !!pv.het, khoLy: pv.ly || '', khoaDen: c.khoaDen || 0, bai });
  }
  const vp = (await db.prepare('SELECT v.*, (SELECT quyet FROM viPhamQuyet q WHERE q.viPham = v.id ORDER BY q.luc DESC, q.rowid DESC LIMIT 1) quyet, ' +
    '(SELECT noiDung FROM viPhamGiaiTrinh g WHERE g.viPham = v.id ORDER BY g.luc DESC, g.rowid DESC LIMIT 1) giaiTrinh FROM viPhamNangLuc v WHERE v.maNguoi = ? ORDER BY v.luc DESC, v.rowid DESC LIMIT 20')
    .bind(ai.ten).all()).results || [];
  return { ok: true, maNguoi: ai.ten, cong: await congBat(db), he, viPham: vp.map(v => ({ id: v.id, he: v.he, loai: v.loai, tenLoai: VI_PHAM[v.loai], mucDo: v.mucDo, chungCu: v.chungCu, boiAi: v.boiAi, luc: v.luc, deXuat: v.deXuat || '', quyet: v.quyet || '', giaiTrinh: v.giaiTrinh || '' })) };
}

/* Khung cấp (một nguồn — màn hình đọc từ đây, không giữ bản chép). */
export async function khungThi(y, env, db, hoSo) {
  if ((BAC[roleOf(hoSo)] || 99) > 12) return { ok: false, code: 'NOPERM', error: 'Khung thi dành cho nhân sự.' };
  return { ok: true, he: HE_THI, cap: CAP, dang: DANG.map(d => ({ ma: d.ma, ten: d.ten, yeuCau: d.yeuCau, thang: d.thang })), soBien: BIEN.length,
    luat: { lanToiDa: LAN_TOI_DA_THANG, hangKho: HANG_KHO, ngayChoPhep: NGAY_CHO_PHEP, heQua: HE_QUA, viPham: VI_PHAM } };
}

/* ═══════════════ XIN Ý KIẾN · CHUYỂN NGƯỜI ═══════════════ */
/* Người phụ trách một nhà: Coach/quản lý theo vaiVoiNha, hoặc Tư vấn viên ghi
   tên ở hoSoKhach.tuVan (cùng luật vaiKhoCao của kho-cao.js). */
async function phuTrachNha(db, hoSo, ai, maNha) {
  if (await vaiVoiNha(db, hoSo, maNha)) return true;
  if (ai.role !== 'R11') return false;
  const h = await db.prepare('SELECT tuVan FROM hoSoKhach WHERE maKhachHang = ?').bind(maNha).first();
  return String((h && h.tuVan) || '').trim().toLowerCase() === ai.ten;
}
export async function xinYKienKho(y, env, db, hoSo) {
  const x = y || {}, maNha = sach(x.maNha, 40), ma = sach(x.ma, 20), lyDo = sach(x.lyDo, 1000);
  const ai = await nguoi(db, hoSo.u);
  if (!ai || (BAC[ai.role] || 99) > 12) return { ok: false, code: 'NOPERM', error: 'Xin ý kiến dành cho nhân sự.' };
  if (!maNha || !/^(C[45]|V[123])-[A-J]-\d{3}$/.test(ma)) return { ok: false, code: 'SAI', error: 'Thiếu mã nhà hoặc mã vấn đề.' };
  if (lyDo.length < 30) return { ok: false, code: 'THIEUCAU', error: 'Viết đủ (từ 30 ký tự): vấn đề gì, vì sao khó, đã làm gì, đề nghị ai xử lý.' };
  const k = await db.prepare('SELECT ma FROM khoCao WHERE ma = ?').bind(ma).first();
  if (!k) return { ok: false, code: 'KHONGCO', error: 'Kho chưa có vấn đề ' + ma + '.' };
  if (!(await nhaCoThat(db, maNha))) return { ok: false, code: 'KHONGNHA', error: 'Không có nhà nào mang mã ' + maNha + '.' };
  if (!(await phuTrachNha(db, hoSo, ai, maNha))) return { ok: false, code: 'NOPERM', error: 'Chỉ người phụ trách nhà này (hoặc quản lý) xin ý kiến cho nhà ấy.' };
  const id = 'YK-' + crypto.randomUUID().replace(/-/g, '').slice(0, 12).toUpperCase();
  await db.prepare('INSERT INTO xinYKien (id, maNha, ma, boiAi, lyDo, luc) VALUES (?,?,?,?,?,?)').bind(id, maNha, ma, ai.ten, lyDo, Date.now()).run();
  try { await Kho.ghiNhatKy(db, { uid: hoSo.uid, username: ten(hoSo), viec: 'XIN_Y_KIEN', doiTuong: maNha, chiTiet: id + ' · ' + ma }); } catch (e) {}
  return { ok: true, id };
}
const heCuaMa = ma => (String(ma)[0] === 'C' ? 'coach' : 'tuvan');
export async function duyetYKien(y, env, db, hoSo) {
  const x = y || {}, id = String(x.id || ''), quyet = String(x.quyet || ''), ghiChu = sach(x.ghiChu, 600);
  if (!['cho', 'chuyen', 'tuChoi'].includes(quyet)) return { ok: false, code: 'SAI', error: 'Quyết định là cho · chuyen · tuChoi.' };
  const xin = await db.prepare('SELECT * FROM xinYKien WHERE id = ?').bind(id).first();
  if (!xin) return { ok: false, code: 'KHONGCO', error: 'Không có lượt xin ý kiến này.' };
  const ai = await nguoi(db, hoSo.u);
  const heT = heCuaMa(xin.ma) === 'coach' ? 'coach' : 'tuvan';
  if (!ai || (BAC[ai.role] || 99) > HE_THI[heT].vaiDuyet) return { ok: false, code: 'NOPERM', error: 'Duyệt ý kiến cần vai quản lý (R01–R0' + HE_THI[heT].vaiDuyet + ').' };
  if (ai.ten === xin.boiAi) return { ok: false, code: 'TUDUYET', error: 'Không tự duyệt lượt xin của chính mình.' };
  if (await khoaCua(db, ai.ten)) return { ok: false, code: 'DANGKHOA', error: 'Đang bị khoá quyền do vi phạm mức 3 — không duyệt ý kiến trong thời gian khoá.' };
  /* Người duyệt phải ĐỨNG TRÊN người xin (Super Admin thì luôn được): hai
     Trưởng nhóm duyệt chéo cho nhau thì "xin ý kiến" chỉ còn là thủ tục. */
  const nguoiXin = await nguoi(db, xin.boiAi);
  if (roleOf(hoSo) !== 'R01' && nguoiXin && (BAC[ai.role] || 99) >= (BAC[nguoiXin.role] || 99))
    return { ok: false, code: 'NGANGCAP', error: 'Người duyệt phải ở bậc cao hơn người xin.' };
  if (ghiChu.length < 10) return { ok: false, code: 'THIEUCAU', error: 'Ghi lý do quyết định (từ 10 ký tự).' };
  let choAi = xin.boiAi;
  if (quyet === 'chuyen') {
    const nhan = await nguoi(db, x.choAi);
    if (!nhan || (BAC[nhan.role] || 99) > 12) return { ok: false, code: 'KHONGNGUOI', error: 'Người nhận phải là nhân sự có thật.' };
    if (nhan.ten === xin.boiAi) return { ok: false, code: 'SAI', error: 'Chuyển là giao cho người khác người xin.' };
    if (nhan.uid === ai.uid) return { ok: false, code: 'TUNHAN', error: 'Không chuyển ca cho chính mình — người duyệt không là người hưởng.' };
    if (!docKho(heT === 'coach' ? 'coach' : 'tuvan', nhan.role)) return { ok: false, code: 'KHONGDOCKHO', error: 'Người nhận không đọc được kho của vấn đề này.' };
    if (await khoaCua(db, nhan.ten)) return { ok: false, code: 'DANGKHOA', error: 'Người nhận đang bị khoá quyền do vi phạm.' };
    /* "Chuyển cho người có năng lực cao hơn" — đo được: quản lý, Coach nhận ca
       hệ Tư vấn từ Tư vấn viên, hoặc cùng thang với cấp thi CAO HƠN người xin. */
    const bacN = BAC[nhan.role] || 99;
    let caoHon = bacN <= 4;
    if (!caoHon && nguoiXin) {
      const thangN = nhan.role === 'R11' ? 'tuvan' : 'coach', thangX = nguoiXin.role === 'R11' ? 'tuvan' : 'coach';
      if (thangN === 'coach' && thangX === 'tuvan') caoHon = true;
      else if (thangN === thangX) caoHon = (await capCua(db, nhan.ten, thangN)).cap > (await capCua(db, nguoiXin.ten, thangX)).cap;
    }
    if (!caoHon) return { ok: false, code: 'CHUACAOHON', error: 'Người nhận phải có năng lực cao hơn người xin: quản lý, hoặc cấp thi cao hơn ở cùng thang.' };
    choAi = nhan.ten;
  }
  await db.prepare('INSERT INTO xinYKienQuyet (id, xin, quyet, choAi, boiAi, ghiChu, luc, hetHan) VALUES (?,?,?,?,?,?,?,?)')
    .bind(crypto.randomUUID(), id, quyet, quyet === 'tuChoi' ? null : choAi, ai.ten, ghiChu, Date.now(), Date.now() + NGAY_CHO_PHEP * NGAY).run();
  return { ok: true, choAi: quyet === 'tuChoi' ? '' : choAi };
}
export async function dsYKien(y, env, db, hoSo) {
  const ai = await nguoi(db, hoSo.u);
  if (!ai || (BAC[ai.role] || 99) > 12) return { ok: false, code: 'NOPERM', error: 'Dành cho nhân sự.' };
  const ql = (BAC[ai.role] || 99) <= 5;
  const rows = (await db.prepare('SELECT x.*, (SELECT quyet FROM xinYKienQuyet q WHERE q.xin = x.id ORDER BY q.luc DESC, q.rowid DESC LIMIT 1) quyet, ' +
    '(SELECT choAi FROM xinYKienQuyet q WHERE q.xin = x.id ORDER BY q.luc DESC, q.rowid DESC LIMIT 1) choAi FROM xinYKien x ' +
    (ql ? '' : 'WHERE x.boiAi = ? ') + 'ORDER BY x.luc DESC, x.rowid DESC LIMIT 100').bind(...(ql ? [] : [ai.ten])).all()).results || [];
  /* Trưởng nhóm Coach (R05) chỉ duyệt được ca hệ Coach — chỉ thấy những ca ấy
     và lượt của chính mình; ca hệ Tư vấn là việc của R01–R04. */
  const bacMinh = BAC[ai.role] || 99;
  const thay = r => !ql || bacMinh <= 4 || r.boiAi === ai.ten || heCuaMa(r.ma) === 'coach';
  return { ok: true, quanLy: ql, ds: rows.filter(thay).map(r => ({ id: r.id, maNha: r.maNha, ma: r.ma, boiAi: r.boiAi, lyDo: r.lyDo, luc: r.luc, quyet: r.quyet || '', choAi: r.choAi || '' })) };
}

/* ═══════════════ VI PHẠM ═══════════════ */
export async function ghiViPham(y, env, db, hoSo) {
  const x = y || {};
  const ai = await nguoi(db, hoSo.u);
  if (!ai || (BAC[ai.role] || 99) > 5) return { ok: false, code: 'NOPERM', error: 'Ghi vi phạm cần vai quản lý (R01–R05).' };
  const he = heHopLe(x.he), loai = String(x.loai || ''), muc = Number(x.mucDo), chungCu = sach(x.chungCu, 2000);
  const deXuat = DE_XUAT.includes(x.deXuat) ? x.deXuat : '';
  if (!he || !VI_PHAM[loai] || !HE_QUA[muc]) return { ok: false, code: 'SAI', error: 'Cần hệ (tuvan/coach), loại vi phạm hợp lệ và mức 1–3.' };
  if (chungCu.length < 30) return { ok: false, code: 'THIEUCAU', error: 'Ghi chứng cứ cụ thể (từ 30 ký tự): việc gì, lúc nào, ở ca nào.' };
  const bi = await nguoi(db, x.maNguoi);
  if (!bi || (BAC[bi.role] || 99) > 12) return { ok: false, code: 'KHONGNGUOI', error: 'Không tra được nhân sự này.' };
  if (bi.uid === ai.uid) return { ok: false, code: 'TUGHI', error: 'Không tự ghi vi phạm cho chính mình.' };
  if (!vaiThiDuoc(he, bi.role)) return { ok: false, code: 'SAIHE', error: 'Người này không thuộc thang ' + HE_THI[he].ten + ' — ghi ở thang của họ thì hệ quả mới áp được.' };
  if (roleOf(hoSo) !== 'R01' && await khoaCua(db, ai.ten)) return { ok: false, code: 'DANGKHOA', error: 'Đang bị khoá quyền do vi phạm mức 3.' };
  if ((BAC[bi.role] || 99) <= (BAC[ai.role] || 99) && roleOf(hoSo) !== 'R01') return { ok: false, code: 'NGANGCAP', error: 'Chỉ ghi vi phạm cho người bậc thấp hơn mình (Super Admin ghi được mọi người).' };
  const id = 'VP-' + crypto.randomUUID().replace(/-/g, '').slice(0, 12).toUpperCase();
  await db.prepare('INSERT INTO viPhamNangLuc (id, maNguoi, he, loai, mucDo, chungCu, deXuat, boiAi, luc) VALUES (?,?,?,?,?,?,?,?,?)')
    .bind(id, bi.ten, he, loai, muc, chungCu, deXuat || null, ai.ten, Date.now()).run();
  if (deXuat) { try { await baoLenCapCao(db, { loai: 'viPham', mucDo: 'gap', tieuDe: 'Đề nghị ' + (deXuat === 'dinhChi' ? 'đình chỉ tham gia' : 'bồi thường') + ' · ' + bi.ten, than: VI_PHAM[loai] + ' (mức ' + muc + '). Máy KHÔNG tự đình chỉ hay tính bồi thường — chờ quyết định của người có thẩm quyền.', doiTuong: bi.ten }); } catch (e) {} }
  try { await Kho.ghiNhatKy(db, { uid: hoSo.uid, username: ten(hoSo), viec: 'GHI_VI_PHAM', doiTuong: bi.ten, chiTiet: id + ' · ' + loai + ' · mức ' + muc }); } catch (e) {}
  return { ok: true, id, heQua: HE_QUA[muc], vi: 'Đã ghi. Hệ quả máy làm ngay: hạ ' + (muc === 3 ? 'về cấp 0 và khoá kho cấp cao 30 ngày' : HE_QUA[muc].ha + ' cấp') + '. Người bị ghi viết được giải trình; Super Admin huỷ được nếu ghi sai.' };
}
export async function giaiTrinhViPham(y, env, db, hoSo) {
  const id = String((y || {}).id || ''), noiDung = sach((y || {}).noiDung, 2000);
  const v = await db.prepare('SELECT maNguoi FROM viPhamNangLuc WHERE id = ?').bind(id).first();
  if (!v) return { ok: false, code: 'KHONGCO', error: 'Không có vi phạm này.' };
  const ai = await nguoi(db, hoSo.u);
  if (!ai || ai.ten !== v.maNguoi) return { ok: false, code: 'NOPERM', error: 'Chỉ chính người bị ghi viết giải trình.' };
  if (noiDung.length < 30) return { ok: false, code: 'THIEUCAU', error: 'Giải trình từ 30 ký tự.' };
  await db.prepare('INSERT INTO viPhamGiaiTrinh (id, viPham, noiDung, luc) VALUES (?,?,?,?)').bind(crypto.randomUUID(), id, noiDung, Date.now()).run();
  return { ok: true };
}
export async function quyetViPham(y, env, db, hoSo) {
  if (roleOf(hoSo) !== 'R01') return { ok: false, code: 'NOPERM', error: 'Chỉ Super Admin quyết huỷ hay xác nhận vi phạm.' };
  const id = String((y || {}).id || ''), quyet = String((y || {}).quyet || ''), ghiChu = sach((y || {}).ghiChu, 1000);
  if (!['huy', 'xacNhan'].includes(quyet)) return { ok: false, code: 'SAI', error: 'Quyết định là huy hoặc xacNhan.' };
  if (ghiChu.length < 10) return { ok: false, code: 'THIEUCAU', error: 'Ghi lý do (từ 10 ký tự).' };
  const v = await db.prepare('SELECT id, maNguoi FROM viPhamNangLuc WHERE id = ?').bind(id).first();
  if (!v) return { ok: false, code: 'KHONGCO', error: 'Không có vi phạm này.' };
  const bi = await Kho.layUid(db, v.maNguoi);
  if (bi && bi === hoSo.uid) return { ok: false, code: 'TUQUYET', error: 'Không tự quyết vi phạm ghi cho chính mình.' };
  await db.prepare('INSERT INTO viPhamQuyet (id, viPham, quyet, boiAi, ghiChu, luc) VALUES (?,?,?,?,?,?)').bind(crypto.randomUUID(), id, quyet, ten(hoSo), ghiChu, Date.now()).run();
  return { ok: true };
}
/* Sổ vi phạm cho quản lý (R01–R05): Super Admin cần đọc chứng cứ và giải
   trình trước khi quyết — tới lúc thêm cửa này chỉ người bị ghi thấy
   vi phạm của mình, nên quyết định huỷ/xác nhận không có chỗ đọc. */
export async function dsViPham(y, env, db, hoSo) {
  if ((BAC[roleOf(hoSo)] || 99) > 5) return { ok: false, code: 'NOPERM', error: 'Sổ vi phạm dành cho quản lý (R01–R05).' };
  const rows = (await db.prepare('SELECT v.*, (SELECT quyet FROM viPhamQuyet q WHERE q.viPham = v.id ORDER BY q.luc DESC, q.rowid DESC LIMIT 1) quyet, ' +
    '(SELECT noiDung FROM viPhamGiaiTrinh g WHERE g.viPham = v.id ORDER BY g.luc DESC, g.rowid DESC LIMIT 1) giaiTrinh FROM viPhamNangLuc v ORDER BY v.luc DESC, v.rowid DESC LIMIT 100')
    .all()).results || [];
  /* Trưởng nhóm chỉ đọc vi phạm của người bậc DƯỚI mình — cùng luật ghi. */
  const laChu = roleOf(hoSo) === 'R01', bacMinh = lv(hoSo), loc = [];
  for (const v of rows) { if (laChu) { loc.push(v); continue; } const n = await nguoi(db, v.maNguoi); if (n && (BAC[n.role] || 99) > bacMinh) loc.push(v); }
  return { ok: true, ds: loc.map(v => ({ id: v.id, maNguoi: v.maNguoi, he: v.he, loai: v.loai, tenLoai: VI_PHAM[v.loai], mucDo: v.mucDo, chungCu: v.chungCu,
    boiAi: v.boiAi, luc: v.luc, deXuat: v.deXuat || '', quyet: v.quyet || '', giaiTrinh: v.giaiTrinh || '' })) };
}

/* Đội: quản lý xem cấp của từng nhân sự trong một hệ. */
export async function doiThi(y, env, db, hoSo) {
  if ((BAC[roleOf(hoSo)] || 99) > 5) return { ok: false, code: 'NOPERM', error: 'Xem đội cần vai quản lý (R01–R05).' };
  const he = heHopLe((y || {}).he);
  if (!he) return { ok: false, code: 'SAI', error: 'Hệ thi là tuvan hoặc coach.' };
  const vai = HE_THI[he].vaiThi;
  const rows = (await db.prepare('SELECT username, role FROM users WHERE active = 1 AND deletedAt IS NULL AND role IN (' + vai.map(() => '?').join(',') + ') ORDER BY username LIMIT 500').bind(...vai).all()).results || [];
  const ds = [];
  for (const r of rows) { const t = String(r.username).toLowerCase(); const c = await capCua(db, t, he); ds.push({ maNguoi: t, role: r.role, cap: c.cap, datThangNay: c.datThangNay, khoaDen: c.khoaDen || 0 }); }
  return { ok: true, he, ds };
}
