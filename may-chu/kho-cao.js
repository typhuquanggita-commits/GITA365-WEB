/* ═══════════════════════════════════════════════════════════════
   GITA 365 — KHO VẤN ĐỀ CẤP CAO · 6 HẠNG · TRẢ BẰNG CREDIT (chủ hệ 10/10/2026)

   Chủ hệ: "2000 vấn đề cấp cao cho tầng 4 (1000) và tầng 5 (1000) cho hệ
   thống Coach … 2000 vấn đề cho tầng 1 (200), tầng 2 (800), tầng 3 (1000)
   cho Chuyên viên tư vấn … Phân cấp 1 sao · 3 sao · 5 sao · Vip · VVip ·
   Diamond. Giải pháp có giá trị tăng dần theo gói phí. Các vấn đề đều dùng
   credit để được xử lý. Chọn càng nhiều credit thì giải pháp càng chất lượng."

   Mỗi vấn đề thuộc ĐÚNG MỘT hạng. Hạng cao hơn = vấn đề phức tạp hơn VÀ gói
   giải pháp Coach giao sâu hơn (ô `goi` của bản ghi: phạm vi · cá nhân hoá ·
   nhịp theo dõi · điều kiện gia đình cần làm).

   ══ GIÁ ══
   Giá một lượt = GỐC[hạng] × HỆ SỐ[tầng]. Chủ hệ duyệt thang đề xuất:
     1 sao 50 · 3 sao 150 · 5 sao 300 · Vip 600 · VVip 1.200 · Diamond 2.500
     credit (1 credit = 10đ), tầng 4–5 nhân 1,5.
   Super Admin sửa được, mỗi lần sửa là MỘT DÒNG MỚI kèm lý do (bảng
   giaKhoCao, không UPDATE) — giá đang chạy là dòng mới nhất, tính lúc đọc.
   Giá phải TĂNG DẦN theo hạng: "giá trị tăng dần theo gói phí" là luật
   của chủ hệ, nên một bảng giá làm Vip rẻ hơn 5 sao bị từ chối.

   ══ AN TOÀN KHÔNG BAO GIỜ BỊ KHOÁ THEO GÓI ══
   Dấu hiệu an toàn (tự làm đau, ý nghĩ tự tử, bạo lực, xâm hại) → chuyển
   ngay, MỌI hạng, KHÔNG tính credit, không cần số dư. Cửa áp dụng nhận cờ
   `anToan` và khi ấy không trừ gì — một nhà hết credit vẫn được giúp ở chỗ
   ấy. Lượt an toàn vẫn vào sổ (so = 0) để biết đã chuyển.

   ══ VÌ SAO KHO Ở MÁY CHỦ ══
   Cùng lý do kho 1000 vấn đề (tra-cuu-giai-phap.js): kho mã công khai, nội
   dung nghề vào kho mã ở dạng gói mã hoá (kho-cao/goi.enc), chỉ Super Admin
   mở gói và nạp vào bảng này. Màn hình chỉ nhận phần vai được đọc.
   ═══════════════════════════════════════════════════════════════ */
'use strict';

import { BAC, roleOf, tenNguoiDung as ten } from './vai-tro.js';
import { Kho } from './nen.js';
import { soatRaNgoai } from './bo-nao.js';
import { truTheoThuTu, soDu, vaiVoiNha, nhaCoThat, tangCuaNha, moVi } from './credit.js';

export const HANG = Object.freeze(['S1', 'S3', 'S5', 'VIP', 'VVIP', 'DIAMOND']);
export const TEN_HANG = Object.freeze({ S1: '1 sao', S3: '3 sao', S5: '5 sao', VIP: 'Vip', VVIP: 'VVip', DIAMOND: 'Diamond' });
/* Thang chủ hệ duyệt 10/10/2026 — bản khởi đầu khi bảng giá chưa có dòng nào. */
export const GIA_KHOI_DAU = Object.freeze({
  goc: Object.freeze({ S1: 50, S3: 150, S5: 300, VIP: 600, VVIP: 1200, DIAMOND: 2500 }),
  heSo: Object.freeze({ 1: 1, 2: 1, 3: 1, 4: 1.5, 5: 1.5 })
});
/* Hệ thống đọc kho: Coach đọc tầng 4–5, Chuyên viên tư vấn đọc tầng 1–3. */
export const HE = Object.freeze({
  coach: { ten: 'Coach', tang: [4, 5] },
  tuvan: { ten: 'Chuyên viên tư vấn', tang: [1, 2, 3] }
});
export const NHOM_CAO = Object.freeze({
  'C4-A': 'Duy trì thói quen sau giai đoạn đầu', 'C4-B': 'Chuyển quyền tự chủ học tập cho con',
  'C4-C': 'Năng lực tự điều chỉnh cảm xúc', 'C4-D': 'Cha mẹ từ quản lý sang đồng hành',
  'C4-E': 'Thích ứng biến cố', 'C4-F': 'Tuổi dậy thì và bản sắc',
  'C4-G': 'Năng lực xã hội ngoài gia đình', 'C4-H': 'Kỷ luật tự giác, thời gian và màn hình tự quản',
  'C4-I': 'Đo tiến bộ, giữ động lực dài hạn', 'C4-J': 'Quan hệ khách hàng dài hạn ở tầng 4',
  'C5-A': 'Gia đình tự vận hành', 'C5-B': 'Định hướng tương lai, chọn ngành',
  'C5-C': 'Tạo giá trị — dự án của con', 'C5-D': 'Văn hoá và giá trị truyền đời',
  'C5-E': 'Đồng bộ nhiều thế hệ', 'C5-F': 'Cha mẹ phát triển, làm gương ở tầm cao',
  'C5-G': 'Tài chính gia đình và trao quyền tiền bạc', 'C5-H': 'Lãnh đạo bản thân, bền bỉ trước áp lực',
  'C5-I': 'Lan toả: hạt nhân cộng đồng', 'C5-J': 'Chuyển giao, tốt nghiệp, bền vững sau 365 ngày'
});
const MA = /^(C[45]|V[123])-([A-J])-(\d{3})$/;
const TRAN_LO = 100;
const TRAN_BAN_GHI = 16000;

/* Ai đọc hệ nào. Coach: quản trị + dòng Coach (R01–R07). Tư vấn: thêm R11.
   Màn hình chỉ ẩn ngăn; cổng thật ở đây. */
export function docDuocHe(hoSo, he) {
  const b = BAC[roleOf(hoSo)] || 99;
  if (he === 'coach') return b <= 7;
  if (he === 'tuvan') return b <= 7 || b === 11;
  return false;
}
const heCuaMa = ma => (ma[0] === 'C' ? 'coach' : 'tuvan');
const sach = (s, n) => String(s == null ? '' : s).replace(/[\u0000-\u0008\u000b-\u001f]+/g, ' ').trim().slice(0, n);

let daDung = false;
async function taoBang(db) {
  if (daDung) return;
  await db.prepare('CREATE TABLE IF NOT EXISTS khoCao (ma TEXT PRIMARY KEY, he TEXT NOT NULL, tang INTEGER NOT NULL, nhom TEXT NOT NULL, ' +
    'hang TEXT NOT NULL, stt INTEGER NOT NULL, ten TEXT NOT NULL, noiDung TEXT NOT NULL, ban TEXT, napLuc INTEGER NOT NULL)').run();
  await db.prepare('CREATE INDEX IF NOT EXISTS ix_kc_loc ON khoCao (he, tang, nhom, stt)').run();
  await db.prepare('CREATE TABLE IF NOT EXISTS giaKhoCao (id TEXT PRIMARY KEY, bang TEXT NOT NULL, lyDo TEXT NOT NULL, boiAi TEXT, luc INTEGER NOT NULL)').run();
  await db.prepare('CREATE TABLE IF NOT EXISTS luotKhoCao (id TEXT PRIMARY KEY, ma TEXT NOT NULL, maNha TEXT NOT NULL, hang TEXT NOT NULL, ' +
    'tang INTEGER NOT NULL, so INTEGER NOT NULL, anToan INTEGER NOT NULL, thamChieu TEXT NOT NULL, boiAi TEXT, luc INTEGER NOT NULL)').run();
  await db.prepare('CREATE INDEX IF NOT EXISTS ix_lkc_nha ON luotKhoCao (maNha, luc)').run();
  daDung = true;
}

/* ═══════════ GIÁ ═══════════ */
/* Soát một bảng giá. Trả danh sách lỗi (rỗng = hợp lệ). */
export function soatBangGia(b) {
  const loi = [];
  if (!b || typeof b !== 'object' || !b.goc || !b.heSo) return ['thiếu goc/heSo'];
  let truoc = 0;
  for (const h of HANG) {
    const g = b.goc[h];
    if (!Number.isInteger(g) || g < 1 || g > 1000000) { loi.push('giá ' + TEN_HANG[h] + ' phải là số nguyên 1–1.000.000'); continue; }
    if (g <= truoc) loi.push(TEN_HANG[h] + ' phải đắt hơn hạng dưới');
    truoc = g;
  }
  for (const t of [1, 2, 3, 4, 5]) {
    const k = Number(b.heSo[t]);
    if (!(k >= 1 && k <= 5)) loi.push('hệ số tầng ' + t + ' phải trong 1–5');
  }
  return loi;
}
export function giaLuot(bang, hang, tang) {
  return Math.round(bang.goc[hang] * Number(bang.heSo[tang] || 1));
}
export async function bangGiaDangChay(db) {
  await taoBang(db);
  const r = await db.prepare('SELECT bang, lyDo, boiAi, luc FROM giaKhoCao ORDER BY luc DESC, rowid DESC LIMIT 1').first();
  if (r) { try { const b = JSON.parse(r.bang); if (!soatBangGia(b).length) return { bang: b, lyDo: r.lyDo, boiAi: r.boiAi, luc: r.luc, khoiDau: false }; } catch (e) {} }
  return { bang: GIA_KHOI_DAU, khoiDau: true };
}
function bangDayDu(b) {
  const o = {};
  for (const t of [1, 2, 3, 4, 5]) { o[t] = {}; for (const h of HANG) o[t][h] = giaLuot(b, h, t); }
  return o;
}

/* CỬA · ĐỌC BẢNG GIÁ — mọi phiên đọc được: gia đình cần thấy hạng nào
   tốn bao nhiêu credit trước khi chọn. */
export async function giaKhoCao(y, env, db, hoSo) {
  const g = await bangGiaDangChay(db);
  return { ok: true, hang: HANG, tenHang: TEN_HANG, bang: g.bang, theoTang: bangDayDu(g.bang), khoiDau: g.khoiDau, lyDo: g.lyDo || '', luc: g.luc || 0 };
}

/* CỬA · SỬA BẢNG GIÁ — chỉ Super Admin, phải có lý do. Một dòng mới. */
export async function datGiaKhoCao(y, env, db, hoSo) {
  if (BAC[roleOf(hoSo)] !== 1) return { ok: false, code: 'NOPERM', error: 'Chỉ Super Admin sửa bảng giá kho cấp cao.' };
  const x = y || {};
  const lyDo = sach(x.lyDo, 300);
  if (lyDo.length < 10) return { ok: false, code: 'LYDO', error: 'Ghi lý do đổi giá (ít nhất 10 ký tự) — người đọc sổ sau cần biết vì sao.' };
  const b = { goc: {}, heSo: {} };
  for (const h of HANG) b.goc[h] = Number((x.goc || {})[h]);
  for (const t of [1, 2, 3, 4, 5]) b.heSo[t] = Number((x.heSo || {})[t]);
  const loi = soatBangGia(b);
  if (loi.length) return { ok: false, code: 'SAI', loi, error: loi.join(' · ') };
  await taoBang(db);
  const id = 'GKC-' + crypto.randomUUID().slice(0, 8).toUpperCase();
  await db.prepare('INSERT INTO giaKhoCao (id, bang, lyDo, boiAi, luc) VALUES (?,?,?,?,?)').bind(id, JSON.stringify(b), lyDo, ten(hoSo), Date.now()).run();
  try { await Kho.ghiNhatKy(db, { uid: hoSo.uid, username: ten(hoSo), viec: 'GIA_KHO_CAO', doiTuong: id, chiTiet: lyDo.slice(0, 120) }); } catch (e) {}
  return { ok: true, id, bang: b, theoTang: bangDayDu(b) };
}

/* ═══════════ NỘI DUNG ═══════════ */
export function soatBanGhiCao(r) {
  const loi = [];
  const s = v => typeof v === 'string' && v.trim().length > 0;
  const mang = (v, a, b) => Array.isArray(v) && v.length >= a && v.length <= b && v.every(s);
  if (!r || typeof r !== 'object') return ['không phải bản ghi'];
  if (!MA.test(r.id || '')) loi.push('id sai dạng');
  if (!HANG.includes(r.hang)) loi.push('hang');
  if (!s(r.ten) || r.ten.length > 140) loi.push('ten');
  if (!s(r.van)) loi.push('van');
  const p = r.phanTich || {};
  if (!s(p.hienTuong) || !s(p.boiCanh) || !mang(p.nguyenNhan, 1, 6) || !s(p.tacDong) || !s(p.donBay)) loi.push('phanTich');
  if (!mang(r.phacDo, 1, 8)) loi.push('phacDo');
  if (!r.t2080 || !mang(r.t2080.lam, 1, 5) || !s(r.t2080.gac)) loi.push('t2080');
  if (!mang(r.kyNang, 1, 8)) loi.push('kyNang');
  if (!mang(r.buoc, 2, 10)) loi.push('buoc');
  if (!mang(r.luuY, 1, 8)) loi.push('luuY');
  if (!r.thamVan || !s(r.thamVan.khi) || !s(r.thamVan.ai)) loi.push('thamVan');
  if (!Array.isArray(r.phuongAn) || r.phuongAn.length < 2 || r.phuongAn.length > 5 || !r.phuongAn.every(x => x && s(x.ten) && s(x.khi) && s(x.cach))) loi.push('phuongAn');
  if (!s(r.ketQua)) loi.push('ketQua');
  if (!mang(r.doBang, 1, 6)) loi.push('doBang');
  if (!s(r.baiHoc)) loi.push('baiHoc');
  const g = r.goi || {};
  if (!s(g.phamVi) || !s(g.caNhanHoa) || !s(g.theoDoi) || !s(g.dieuKien)) loi.push('goi');
  if (loi.length) return loi;
  if (JSON.stringify(r).length > TRAN_BAN_GHI) loi.push('quá dài');
  const ra = soatRaNgoai(Object.values(r).map(v => typeof v === 'string' ? v : JSON.stringify(v)).join('\n'));
  if (!ra.sach) loi.push('DIEU13');
  return loi;
}
function noiDungCua(r) {
  const { id, ten, hang, ...con } = r;
  return JSON.stringify(con);
}

/* CỬA · NẠP KHO — chỉ Super Admin, cả lô hoặc không bản nào. */
export async function napKhoCao(y, env, db, hoSo) {
  if (BAC[roleOf(hoSo)] !== 1) return { ok: false, code: 'NOPERM', error: 'Chỉ Super Admin nạp kho cấp cao.' };
  const x = y || {};
  const ds = Array.isArray(x.ds) ? x.ds : [];
  if (!ds.length || ds.length > TRAN_LO) return { ok: false, code: 'SAI', error: 'Mỗi lượt nạp từ 1 đến ' + TRAN_LO + ' vấn đề.' };
  const ban = sach(x.ban, 40) || null;
  const hong = [];
  ds.forEach(r => { const l = soatBanGhiCao(r); if (l.length) hong.push((r && r.id || '?') + ': ' + l.join(',')); });
  if (hong.length) return { ok: false, code: 'HONG', hong: hong.slice(0, 20), error: hong.length + ' vấn đề không qua soát — không nạp bản nào trong lô này.' };
  await taoBang(db);
  const luc = Date.now();
  await db.batch(ds.map(r => {
    const m = MA.exec(r.id);
    const he = heCuaMa(r.id), tang = Number(m[1][1]), nhom = m[1] + '-' + m[2];
    const stt = ('ABCDEFGHIJ'.indexOf(m[2]) + 1) * 1000 + Number(m[3]);
    return db.prepare('INSERT INTO khoCao (ma, he, tang, nhom, hang, stt, ten, noiDung, ban, napLuc) VALUES (?,?,?,?,?,?,?,?,?,?) ' +
      'ON CONFLICT(ma) DO UPDATE SET he=excluded.he, tang=excluded.tang, nhom=excluded.nhom, hang=excluded.hang, stt=excluded.stt, ' +
      'ten=excluded.ten, noiDung=excluded.noiDung, ban=excluded.ban, napLuc=excluded.napLuc')
      .bind(r.id, he, tang, nhom, r.hang, stt, sach(r.ten, 140), noiDungCua(r), ban, luc);
  }));
  const tong = await db.prepare('SELECT he, COUNT(*) n FROM khoCao GROUP BY he').all();
  const dem = { coach: 0, tuvan: 0 };
  (tong.results || []).forEach(r => { if (dem[r.he] != null) dem[r.he] = Number(r.n); });
  try { await Kho.ghiNhatKy(db, { uid: hoSo.uid, username: ten(hoSo), viec: 'NAP_KHO_CAO', doiTuong: ban || '', chiTiet: ds.length + ' vấn đề · coach ' + dem.coach + ' · tư vấn ' + dem.tuvan }); } catch (e) {}
  return { ok: true, nap: ds.length, dem };
}

/* CỬA · DANH SÁCH — tên + hạng + giá, không nội dung. Lọc theo hệ, tầng,
   nhóm, hạng. */
export async function dsKhoCao(y, env, db, hoSo) {
  const x = y || {};
  const he = String(x.he || '');
  if (!HE[he]) return { ok: false, code: 'SAI', error: 'Hệ phải là coach hoặc tuvan.' };
  if (!docDuocHe(hoSo, he)) return { ok: false, code: 'NOPERM', error: 'Kho cấp cao của hệ ' + HE[he].ten + ' không mở cho vai này.' };
  await taoBang(db);
  const tang = Number(x.tang) || 0, nhom = String(x.nhom || ''), hang = String(x.hang || '');
  let sql = 'SELECT ma, tang, nhom, hang, ten FROM khoCao WHERE he = ?'; const b = [he];
  if (tang) { sql += ' AND tang = ?'; b.push(tang); }
  if (/^(C[45]|V[123])-[A-J]$/.test(nhom)) { sql += ' AND nhom = ?'; b.push(nhom); }
  if (HANG.includes(hang)) { sql += ' AND hang = ?'; b.push(hang); }
  sql += ' ORDER BY tang ASC, stt ASC';
  const rows = (await db.prepare(sql).bind(...b).all()).results || [];
  const g = await bangGiaDangChay(db);
  const dem = {}; HANG.forEach(h => { dem[h] = 0; });
  rows.forEach(r => { if (dem[r.hang] != null) dem[r.hang]++; });
  return { ok: true, he, tong: rows.length, dem, nhomTen: NHOM_CAO, tenHang: TEN_HANG,
    ds: rows.map(r => ({ ma: r.ma, tang: r.tang, nhom: r.nhom, hang: r.hang, ten: r.ten, gia: giaLuot(g.bang, r.hang, r.tang) })) };
}

/* CỬA · ĐỌC MỘT VẤN ĐỀ */
export async function docKhoCao(y, env, db, hoSo) {
  const ma = String((y || {}).ma || '');
  if (!MA.test(ma)) return { ok: false, code: 'SAI', error: 'Mã vấn đề không hợp lệ.' };
  if (!docDuocHe(hoSo, heCuaMa(ma))) return { ok: false, code: 'NOPERM', error: 'Kho cấp cao này không mở cho vai của anh/chị.' };
  await taoBang(db);
  const r = await db.prepare('SELECT ma, he, tang, nhom, hang, ten, noiDung FROM khoCao WHERE ma = ?').bind(ma).first();
  if (!r) return { ok: false, code: 'KHONGCO', error: 'Kho chưa có vấn đề này — Super Admin chưa nạp gói.' };
  let nd = {};
  try { nd = JSON.parse(r.noiDung); } catch (e) {}
  const g = await bangGiaDangChay(db);
  return { ok: true, vd: Object.assign({}, nd, { ma: r.ma, he: r.he, tang: r.tang, nhom: r.nhom, nhomTen: NHOM_CAO[r.nhom] || '',
    hang: r.hang, tenHang: TEN_HANG[r.hang], ten: r.ten, gia: giaLuot(g.bang, r.hang, r.tang) }) };
}

/* CỬA · ÁP DỤNG GIẢI PHÁP CHO MỘT NHÀ — trừ credit của nhà.
   Ai: Coach phụ trách nhà ấy, hoặc Trưởng nhóm Coach trở lên (cùng luật
   tieuCredit — vaiVoiNha). Nhà tự bấm thì không: gói giải pháp do Coach
   giao, không phải món tự lấy.
   Tầng: vấn đề tầng N chỉ áp cho nhà đã ở tầng ≥ N — quyền lợi đi theo tầng.
   An toàn: anToan = true → không trừ, không cần số dư, mọi tầng. */
export async function apDungKhoCao(y, env, db, hoSo) {
  const x = y || {};
  const ma = String(x.ma || ''), maNha = sach(x.maNha, 40), thamChieu = sach(x.thamChieu, 60);
  const anToan = x.anToan === true;
  if (!MA.test(ma)) return { ok: false, code: 'SAI', error: 'Mã vấn đề không hợp lệ.' };
  if (!maNha) return { ok: false, code: 'SAI', error: 'Thiếu mã khách hàng của nhà.' };
  if (!docDuocHe(hoSo, heCuaMa(ma))) return { ok: false, code: 'NOPERM', error: 'Vai này không áp dụng được kho cấp cao ấy.' };
  if (!(await nhaCoThat(db, maNha))) return { ok: false, code: 'KHONGNHA', error: 'Không có nhà nào mang mã ' + maNha + '.' };
  await taoBang(db);
  const r = await db.prepare('SELECT ma, tang, hang, ten FROM khoCao WHERE ma = ?').bind(ma).first();
  if (!r) return { ok: false, code: 'KHONGCO', error: 'Kho chưa có vấn đề này.' };
  const luc = Date.now();
  const idLuot = 'LKC-' + crypto.randomUUID().slice(0, 8).toUpperCase();
  /* An toàn đứng TRƯỚC cổng "Coach phụ trách" và cổng tầng: người nhìn
     thấy dấu hiệu là người phải chuyển, dù không phụ trách nhà ấy. */
  if (anToan) {
    await db.prepare('INSERT INTO luotKhoCao (id, ma, maNha, hang, tang, so, anToan, thamChieu, boiAi, luc) VALUES (?,?,?,?,?,0,1,?,?,?)')
      .bind(idLuot, ma, maNha, r.hang, r.tang, thamChieu || 'an-toan', ten(hoSo), luc).run();
    try { await Kho.ghiNhatKy(db, { uid: hoSo.uid, username: ten(hoSo), viec: 'KHO_CAO_AN_TOAN', doiTuong: maNha, chiTiet: ma }); } catch (e) {}
    return { ok: true, anToan: true, so: 0,
      vi: 'Dấu hiệu an toàn — chuyển ngay tới chuyên gia/bộ phận phụ trách, mọi hạng, không tính credit. Không chờ số dư, không chờ gói.' };
  }
  const vai = await vaiVoiNha(db, hoSo, maNha);
  if (vai !== 'coach' && vai !== 'ql') return { ok: false, code: 'NOPERM', error: 'Chỉ Coach phụ trách nhà này, hoặc Trưởng nhóm Coach trở lên, áp dụng giải pháp cho nhà.' };
  if (!thamChieu || !/^[A-Za-z0-9._:-]{1,60}$/.test(thamChieu)) return { ok: false, code: 'THIEUTC', error: 'Thiếu mã tham chiếu (mã ca, mã buổi…) để không trừ trùng.' };
  const tangNha = await tangCuaNha(db, maNha);
  if (tangNha < r.tang) return { ok: false, code: 'TANGCHUA', error: 'Nhà đang ở tầng ' + tangNha + ' — vấn đề này thuộc quyền lợi tầng ' + r.tang + '.' };
  const g = await bangGiaDangChay(db);
  const gia = giaLuot(g.bang, r.hang, r.tang);
  const vi = await moVi(db, maNha, hoSo.u);
  const tc = 'KC:' + ma + ':' + thamChieu;
  const k = await truTheoThuTu(db, { maNha, gia, viec: 'khoCao:' + r.hang, tc, tang: tangNha, cap: vi.cap, ghiChu: (TEN_HANG[r.hang] + ' · ' + r.ten).slice(0, 200), boiAi: hoSo.u });
  if (!k.ok) return k;
  if (k.trung) return { ok: true, trung: true, so: 0, soDu: k.soDu };
  await db.prepare('INSERT INTO luotKhoCao (id, ma, maNha, hang, tang, so, anToan, thamChieu, boiAi, luc) VALUES (?,?,?,?,?,?,0,?,?,?)')
    .bind(idLuot, ma, maNha, r.hang, r.tang, gia, thamChieu, ten(hoSo), luc).run();
  try { await Kho.ghiNhatKy(db, { uid: hoSo.uid, username: ten(hoSo), viec: 'KHO_CAO_AP_DUNG', doiTuong: maNha, chiTiet: ma + ' · ' + gia + ' credit' }); } catch (e) {}
  return { ok: true, so: gia, hang: r.hang, chiTiet: k.daGhi.map(([l, s]) => ({ loai: l, so: s })), soDu: await soDu(db, maNha) };
}

/* CỬA · SỔ ÁP DỤNG CỦA MỘT NHÀ — ai đã giao gói nào, bao nhiêu credit. */
export async function soKhoCaoNha(y, env, db, hoSo) {
  const maNha = sach((y || {}).maNha, 40);
  if (!maNha) return { ok: false, code: 'SAI', error: 'Thiếu mã khách hàng.' };
  const vai = await vaiVoiNha(db, hoSo, maNha);
  if (!vai) return { ok: false, code: 'NOPERM', error: 'Không xem được sổ của nhà này.' };
  await taoBang(db);
  const ds = (await db.prepare('SELECT l.ma, l.hang, l.tang, l.so, l.anToan, l.thamChieu, l.boiAi, l.luc, k.ten FROM luotKhoCao l LEFT JOIN khoCao k ON k.ma = l.ma ' +
    'WHERE l.maNha = ? ORDER BY l.luc DESC, l.rowid DESC LIMIT 100').bind(maNha).all()).results || [];
  return { ok: true, maNha, ds };
}
