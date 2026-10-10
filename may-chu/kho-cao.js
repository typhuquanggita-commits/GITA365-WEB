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
   ngay, MỌI hạng, KHÔNG tính credit, không cần số dư. Cửa riêng
   chuyenAnToan — tách khỏi kho và khỏi credit, báo ngay Giám đốc + Super
   Admin — nên một nhà hết credit vẫn được giúp ở chỗ ấy.

   ══ VÌ SAO KHO Ở MÁY CHỦ ══
   Cùng lý do kho 1000 vấn đề (tra-cuu-giai-phap.js): kho mã công khai, nội
   dung nghề vào kho mã ở dạng gói mã hoá (kho-cao/goi.enc), chỉ Super Admin
   mở gói và nạp vào bảng này. Màn hình chỉ nhận phần vai được đọc.
   ═══════════════════════════════════════════════════════════════ */
'use strict';

import { BAC, roleOf, tenNguoiDung as ten } from './vai-tro.js';
import { Kho } from './nen.js';
import { soatRaNgoai } from './bo-nao.js';
import { truTheoThuTu, soDu, vaiVoiNha, nhaCoThat, tangCuaNha, moVi, maNhaCuaToi, thuongCredit } from './credit.js';
import { baoLenCapCao } from './ngan-hang.js';
import { maDuocMo, coChoPhep, HANG_KHO, maDangThi } from './thi-cap.js';

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
  'C5-I': 'Lan toả: hạt nhân cộng đồng', 'C5-J': 'Chuyển giao, tốt nghiệp, bền vững sau 365 ngày',
  /* Hệ Tư vấn · tầng 1 (200) · tầng 2 (800) · tầng 3 (1000). Tên đặt đủ 20 nhóm
     ngay từ đợt 6 để các đợt sau nối vào đúng chỗ, không đổi tên giữa chừng. */
  'V1-A': 'Nhận diện ban đầu và lập baseline trung thực', 'V1-B': 'Đọc mô thức, đặt giả thuyết, kỳ vọng ban đầu',
  'V2-A': 'Kiểm chứng giả thuyết qua vòng 7 ngày', 'V2-B': 'Hết đổ lỗi — hiểu cơ chế trong nhà',
  'V2-C': 'Nhịp học tập và sự tập trung — vì sao', 'V2-D': 'Cảm xúc và phản ứng trong nhà — vì sao',
  'V2-E': 'Màn hình và thiết bị — vì sao khó dứt', 'V2-F': 'Giao tiếp cha mẹ–con — vì sao nói không nghe',
  'V2-G': 'Sinh hoạt, giấc ngủ, việc nhà — vì sao lệch', 'V2-H': 'Quan hệ khách hàng ở tầng 2',
  'V3-A': 'Dựng cấu trúc chuỗi 21 ngày đầu', 'V3-B': 'Từ cấu trúc sang tự điều hành',
  'V3-C': 'Thích ứng khi kế hoạch vấp', 'V3-D': 'Chuyển giao cho gia đình',
  'V3-E': 'Vòng cải tiến và cổng nghiệm thu', 'V3-F': 'Thói quen học tập có hệ thống',
  'V3-G': 'Cảm xúc và kỷ luật tích cực trong hệ thống mới', 'V3-H': 'Vai trò cha mẹ trong hệ thống mới',
  'V3-I': 'Màn hình, giấc ngủ, việc nhà trong hệ thống', 'V3-J': 'Quan hệ khách hàng ở tầng 3'
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

/* Vai với một nhà, cho riêng kho cấp cao. Dùng `vaiVoiNha` của credit.js rồi
   thêm đúng một nhánh: Chuyên viên tư vấn (R11) được ghi tên ở hoSoKhach.tuVan
   của nhà ấy → 'tuvan'. Không sửa vaiVoiNha dùng chung, vì nó còn mở ví, tiêu
   credit, đặt cấp ví — những quyền Tư vấn viên không có. So không phân biệt
   hoa thường; không có hồ sơ nhà thì trả '' (đóng). */
async function vaiKhoCao(db, hoSo, maNha) {
  const v = await vaiVoiNha(db, hoSo, maNha);
  if (v || BAC[roleOf(hoSo)] !== 11 || !maNha) return v;
  const h = await db.prepare('SELECT tuVan FROM hoSoKhach WHERE maKhachHang = ?').bind(maNha).first();
  const tv = String((h && h.tuVan) || '').trim().toLowerCase();
  return tv && tv === String(ten(hoSo) || '').trim().toLowerCase() ? 'tuvan' : '';
}
/* Tư vấn viên chỉ thao tác trên vấn đề hệ Tư vấn (tầng 1–3). */
/* Có ý kiến đã duyệt cho (người, mã) ở BẤT KỲ nhà nào — đủ để ĐỌC nội dung vượt cấp.
   Một nguồn với thi-cap.js: chỉ quyết định MỚI NHẤT của mỗi lượt xin có hiệu lực. */
const coChoPhepBatKy = (db, maNguoi, ma) => coChoPhep(db, maNguoi, '', ma);
const vaiDuoc = (vai, ds) => vai === 'coach' || vai === 'ql' || (vai === 'tuvan' && ds.every(m => heCuaMa(m) === 'tuvan'));
const sach = (s, n) => String(s == null ? '' : s).replace(/[\u0000-\u0008\u000b-\u001f]+/g, ' ').trim().slice(0, n);

let daDung = false;
async function taoBang(db) {
  if (daDung) return;
  await db.prepare('CREATE TABLE IF NOT EXISTS khoCao (ma TEXT PRIMARY KEY, he TEXT NOT NULL, tang INTEGER NOT NULL, nhom TEXT NOT NULL, ' +
    'hang TEXT NOT NULL, stt INTEGER NOT NULL, ten TEXT NOT NULL, noiDung TEXT NOT NULL, ban TEXT, napLuc INTEGER NOT NULL)').run();
  await db.prepare('CREATE INDEX IF NOT EXISTS ix_kc_loc ON khoCao (he, tang, nhom, stt)').run();
  await db.prepare('CREATE TABLE IF NOT EXISTS giaKhoCao (id TEXT PRIMARY KEY, bang TEXT NOT NULL, lyDo TEXT NOT NULL, boiAi TEXT, luc INTEGER NOT NULL)').run();
  await db.prepare('CREATE TABLE IF NOT EXISTS deXuatKhoCao (id TEXT PRIMARY KEY, maNha TEXT NOT NULL, luaChon TEXT NOT NULL, ghiChu TEXT, ' +
    'trangThai TEXT NOT NULL, maChon TEXT, boiAi TEXT, luc INTEGER NOT NULL, chonLuc INTEGER, chonBoiAi TEXT)').run();
  await db.prepare('CREATE INDEX IF NOT EXISTS ix_dxkc_nha ON deXuatKhoCao (maNha, luc)').run();
  await db.prepare('CREATE TABLE IF NOT EXISTS luotKhoCao (id TEXT PRIMARY KEY, deXuat TEXT NOT NULL, ma TEXT NOT NULL, maNha TEXT NOT NULL, hang TEXT NOT NULL, ' +
    'tang INTEGER NOT NULL, so INTEGER NOT NULL, boiAi TEXT, luc INTEGER NOT NULL, xongLuc INTEGER, bangChung TEXT)').run();
  await db.prepare('CREATE INDEX IF NOT EXISTS ix_lkc_nha ON luotKhoCao (maNha, luc)').run();
  await db.prepare('CREATE UNIQUE INDEX IF NOT EXISTS ux_lkc_dx ON luotKhoCao (deXuat)').run();
  await db.prepare('CREATE TABLE IF NOT EXISTS chuyenAnToan (id TEXT PRIMARY KEY, maNha TEXT NOT NULL, ghiChu TEXT, boiAi TEXT, luc INTEGER NOT NULL)').run();
  await db.prepare('CREATE INDEX IF NOT EXISTS ix_cat_nha ON chuyenAnToan (maNha, luc)').run();
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
  /* Cấp thi mở bao nhiêu % kho (thi-cap.js). Tên vẫn hiện — để biết có vấn đề ấy
     mà xin ý kiến — nhưng nội dung khoá ở docKhoCao. Cổng tắt / quản lý: mở hết. */
  const mo = await maDuocMo(db, hoSo, he);
  return { ok: true, he, tong: rows.length, dem, nhomTen: NHOM_CAO, tenHang: TEN_HANG,
    pham: mo.het ? { het: true } : { het: false, pct: mo.pv.pct, cap: mo.pv.cap || 0, ly: mo.pv.ly || '', khoaDen: mo.pv.khoaDen || 0 },
    ds: rows.map(r => ({ ma: r.ma, tang: r.tang, nhom: r.nhom, hang: r.hang, ten: r.ten, gia: giaLuot(g.bang, r.hang, r.tang),
      khoa: !mo.het && !mo.mo.has(r.ma) })) };
}

/* CỬA · ĐỌC MỘT VẤN ĐỀ */
export async function docKhoCao(y, env, db, hoSo) {
  const ma = String((y || {}).ma || '');
  if (!MA.test(ma)) return { ok: false, code: 'SAI', error: 'Mã vấn đề không hợp lệ.' };
  if (!docDuocHe(hoSo, heCuaMa(ma))) return { ok: false, code: 'NOPERM', error: 'Kho cấp cao này không mở cho vai của anh/chị.' };
  await taoBang(db);
  const r = await db.prepare('SELECT ma, he, tang, nhom, hang, ten, noiDung FROM khoCao WHERE ma = ?').bind(ma).first();
  if (!r) return { ok: false, code: 'KHONGCO', error: 'Kho chưa có vấn đề này — Super Admin chưa nạp gói.' };
  /* Đang thi một bài có ca này thì không mở lời giải của nó — kể cả với người
     đã mở phần kho ấy từ trước (cổng tắt thì mọi người đều đã mở). */
  if ((await maDangThi(db, ten(hoSo))).has(ma)) return { ok: false, code: 'DANGTHI', error: 'Vấn đề này đang nằm trong bài thi chưa nộp của anh/chị — nộp bài rồi mới đọc được.' };
  const mo = await maDuocMo(db, hoSo, r.he);
  if (!mo.het && !mo.mo.has(ma) && !(await coChoPhepBatKy(db, ten(hoSo), ma)))
    return { ok: false, code: 'CAPCHUA', error: 'Vấn đề này vượt cấp thi của anh/chị (đang mở ' + (mo.pv.pct || 0) + '% kho). Xin ý kiến bộ phận quản lý — không tự xử lý.' };
  let nd = {};
  try { nd = JSON.parse(r.noiDung); } catch (e) {}
  const g = await bangGiaDangChay(db);
  return { ok: true, vd: Object.assign({}, nd, { ma: r.ma, he: r.he, tang: r.tang, nhom: r.nhom, nhomTen: NHOM_CAO[r.nhom] || '',
    hang: r.hang, tenHang: TEN_HANG[r.hang], ten: r.ten, gia: giaLuot(g.bang, r.hang, r.tang) }) };
}

/* ═══════════ ĐỀ XUẤT → NHÀ CHỌN → TRỪ CREDIT ═══════════
   "Chọn càng nhiều credit thì giải pháp càng chất lượng" là lựa chọn CỦA
   GIA ĐÌNH, nên credit không bao giờ bị trừ chỉ vì Coach bấm một nút:
     1. Coach phụ trách (hoặc Trưởng nhóm Coach trở lên) đề xuất 1–3 phương
        án — thường là cùng một vấn đề ở các hạng khác nhau, mỗi phương án
        kèm giá và gói (phạm vi · cá nhân hoá · theo dõi · nhà cần làm).
     2. Gia đình (tài khoản của chính nhà ấy) xem và CHỌN một phương án.
        Lúc ấy mới trừ credit — trừ một lần, khoá chống trùng là mã đề xuất.
     3. Gói giao xong, Coach ghi hoàn thành kèm bằng chứng → nhà nhận credit
        thưởng "nhiệm vụ" theo bảng thưởng đã duyệt. Đó là phần "thực hiện
        càng chăm chỉ": làm thật thì credit quay lại cho gói kế tiếp.
   Quyền lợi theo tầng: vấn đề tầng N chỉ đề xuất được cho nhà tầng ≥ N. */
const TRAN_LUA_CHON = 3;
function tomGoi(nd) {
  const g = (nd && nd.goi) || {};
  return { phamVi: g.phamVi || '', caNhanHoa: g.caNhanHoa || '', theoDoi: g.theoDoi || '', dieuKien: g.dieuKien || '' };
}

export async function deXuatKhoCao(y, env, db, hoSo) {
  const x = y || {};
  const maNha = sach(x.maNha, 40), ghiChu = sach(x.ghiChu, 300);
  const ds = Array.isArray(x.ds) ? [...new Set(x.ds.map(m => String(m || '')))] : [];
  if (!maNha) return { ok: false, code: 'SAI', error: 'Thiếu mã khách hàng của nhà.' };
  if (!ds.length || ds.length > TRAN_LUA_CHON || !ds.every(m => MA.test(m))) return { ok: false, code: 'SAI', error: 'Đề xuất từ 1 đến ' + TRAN_LUA_CHON + ' phương án, mỗi phương án một mã vấn đề hợp lệ.' };
  if (!ds.every(m => docDuocHe(hoSo, heCuaMa(m)))) return { ok: false, code: 'NOPERM', error: 'Vai này không đề xuất được kho cấp cao ấy.' };
  const vai = await vaiKhoCao(db, hoSo, maNha);
  /* Người được quản lý CHUYỂN ca sang (xin ý kiến → chuyển) đề xuất được cho nhà
     ấy dù không phải người phụ trách — đúng những mã đã được duyệt. */
  let duocChuyen = false;
  /* Chỉ ca được CHUYỂN sang mới mở cửa này — bản đầu nhận cả 'cho', nên một
     người không phụ trách nhà xin ý kiến rồi được "cho" là đề xuất được. */
  if (!vaiDuoc(vai, ds)) { duocChuyen = true; for (const m of ds) if (!(await coChoPhep(db, ten(hoSo), maNha, m, true))) { duocChuyen = false; break; } }
  if (!vaiDuoc(vai, ds) && !duocChuyen) return { ok: false, code: 'NOPERM', error: vai === 'tuvan'
    ? 'Tư vấn viên chỉ đề xuất vấn đề hệ Tư vấn (tầng 1–3) cho nhà mình phụ trách.'
    : 'Chỉ Coach hoặc Tư vấn viên phụ trách nhà này, hoặc Trưởng nhóm Coach trở lên, đề xuất giải pháp cho nhà.' };
  if (!(await nhaCoThat(db, maNha))) return { ok: false, code: 'KHONGNHA', error: 'Không có nhà nào mang mã ' + maNha + '.' };
  const dangThi = await maDangThi(db, ten(hoSo));
  if (ds.some(m => dangThi.has(m))) return { ok: false, code: 'DANGTHI', error: 'Có vấn đề đang nằm trong bài thi chưa nộp của anh/chị — nộp bài rồi mới đề xuất được.' };
  if (ghiChu && !soatRaNgoai(ghiChu).sach) return { ok: false, code: 'DIEU13', error: 'Lời nhắn không ghi tên, số điện thoại hay địa chỉ — bỏ đi rồi gửi lại.' };
  await taoBang(db);
  const tangNha = await tangCuaNha(db, maNha);
  for (const m of ds) {
    const r = await db.prepare('SELECT tang FROM khoCao WHERE ma = ?').bind(m).first();
    if (!r) return { ok: false, code: 'KHONGCO', error: 'Kho chưa có vấn đề ' + m + '.' };
    if (tangNha < r.tang) return { ok: false, code: 'TANGCHUA', error: 'Nhà đang ở tầng ' + tangNha + ' — vấn đề ' + m + ' thuộc quyền lợi tầng ' + r.tang + '.' };
  }
  /* Sau luật tầng: vấn đề nhà không được nhận thì từ chối thẳng, không bắt xin
     ý kiến cho một việc vốn không được làm.
     Xin ý kiến LUÔN BẬT (chủ hệ chốt 10/2026), không chờ cổng kho: vấn đề vượt
     CẤP THI THẬT của người đề xuất, và mọi vấn đề hạng VVIP/Diamond, phải có ý
     kiến quản lý đã duyệt cho đúng nhà ấy. Cổng (R01) chỉ còn quyết việc ĐỌC
     kho theo cấp. Quản lý (R01–R04) không qua luật này. */
  if (BAC[roleOf(hoSo)] > 4) {
    for (const m of ds) {
      const k = await db.prepare('SELECT he, hang FROM khoCao WHERE ma = ?').bind(m).first();
      if (!k) continue;
      const mo = await maDuocMo(db, hoSo, k.he, true);
      const canXin = (!mo.het && !mo.mo.has(m)) || HANG_KHO.includes(k.hang);
      if (canXin && !(await coChoPhep(db, ten(hoSo), maNha, m)))
        return { ok: false, code: 'XINYKIEN', ma: m, error: (HANG_KHO.includes(k.hang) ? 'Vấn đề hạng ' + TEN_HANG[k.hang] + ' là vấn đề khó' : 'Vấn đề ' + m + ' vượt cấp thi của anh/chị') +
          ' — bắt buộc xin ý kiến bộ phận quản lý trước khi đề xuất cho nhà. Nghiêm cấm tự xử lý.' };
    }
  }
  const id = 'DX-' + crypto.randomUUID().replace(/-/g, '').slice(0, 12).toUpperCase();
  await db.prepare("INSERT INTO deXuatKhoCao (id, maNha, luaChon, ghiChu, trangThai, boiAi, luc) VALUES (?,?,?,?,'cho',?,?)")
    .bind(id, maNha, JSON.stringify(ds), ghiChu || null, ten(hoSo), Date.now()).run();
  try { await Kho.ghiNhatKy(db, { uid: hoSo.uid, username: ten(hoSo), viec: 'KHO_CAO_DE_XUAT', doiTuong: maNha, chiTiet: id + ' · ' + ds.join(',') }); } catch (e) {}
  return { ok: true, id };
}

/* CỬA · ĐỀ XUẤT CỦA MỘT NHÀ — nhà xem phương án kèm giá + gói để chọn;
   Coach/quản lý xem trạng thái. Nhà không truyền mã thì lấy nhà của phiên. */
export async function dsDeXuatNha(y, env, db, hoSo) {
  const maNha = sach((y || {}).maNha, 40) || await maNhaCuaToi(db, hoSo);
  if (!maNha) return { ok: false, code: 'KHONGNHA', error: 'Tài khoản này chưa gắn với mã khách hàng nào.' };
  const vai = await vaiKhoCao(db, hoSo, maNha);
  if (!vai) return { ok: false, code: 'NOPERM', error: 'Không xem được đề xuất của nhà này.' };
  await taoBang(db);
  const g = await bangGiaDangChay(db);
  const rows = (await db.prepare('SELECT id, luaChon, ghiChu, trangThai, maChon, boiAi, luc, chonLuc FROM deXuatKhoCao WHERE maNha = ? ORDER BY luc DESC, rowid DESC LIMIT 30').bind(maNha).all()).results || [];
  const ds = [];
  for (const r of rows) {
    let ma = []; try { ma = JSON.parse(r.luaChon); } catch (e) {}
    /* Tư vấn viên chỉ đọc vấn đề hệ Tư vấn — gói hệ Coach của cùng nhà ấy là
       nội dung docKhoCao/dsKhoCao chặn với R11, không được lọt qua đây. */
    if (vai === 'tuvan') { ma = ma.filter(m => heCuaMa(String(m)) === 'tuvan'); if (!ma.length) continue; }
    const pa = [];
    for (const m of ma) {
      const k = await db.prepare('SELECT ma, tang, hang, ten, noiDung FROM khoCao WHERE ma = ?').bind(m).first();
      if (!k) continue;
      let nd = {}; try { nd = JSON.parse(k.noiDung); } catch (e) {}
      pa.push({ ma: k.ma, ten: k.ten, hang: k.hang, tenHang: TEN_HANG[k.hang], tang: k.tang, gia: giaLuot(g.bang, k.hang, k.tang), goi: tomGoi(nd) });
    }
    ds.push({ id: r.id, trangThai: r.trangThai, maChon: r.maChon || '', ghiChu: r.ghiChu || '', boiAi: r.boiAi, luc: r.luc, chonLuc: r.chonLuc || 0, phuongAn: pa });
  }
  return { ok: true, maNha, vai, ds, soDu: await soDu(db, maNha) };
}

/* CỬA · NHÀ CHỌN MỘT PHƯƠNG ÁN — chỉ tài khoản của chính nhà ấy. Trừ credit
   theo giá đang chạy lúc chọn; khoá chống trùng là mã đề xuất. */
export async function chonDeXuat(y, env, db, hoSo) {
  const x = y || {};
  const id = String(x.id || ''), ma = String(x.ma || '');
  if (!/^DX-[A-Z0-9]{12}$/.test(id) || !MA.test(ma)) return { ok: false, code: 'SAI', error: 'Thiếu mã đề xuất hoặc mã phương án.' };
  await taoBang(db);
  const d = await db.prepare('SELECT id, maNha, luaChon, trangThai FROM deXuatKhoCao WHERE id = ?').bind(id).first();
  if (!d) return { ok: false, code: 'KHONGCO', error: 'Không có đề xuất này.' };
  if ((await vaiVoiNha(db, hoSo, d.maNha)) !== 'nha') return { ok: false, code: 'NOPERM', error: 'Chỉ chính gia đình được chọn phương án — credit là của nhà.' };
  if (d.trangThai !== 'cho') return { ok: false, code: 'DAXONG', error: 'Đề xuất này đã được chọn hoặc đã huỷ.' };
  let ma0 = []; try { ma0 = JSON.parse(d.luaChon); } catch (e) {}
  if (!ma0.includes(ma)) return { ok: false, code: 'SAI', error: 'Phương án không nằm trong đề xuất.' };
  const k = await db.prepare('SELECT ma, tang, hang, ten FROM khoCao WHERE ma = ?').bind(ma).first();
  if (!k) return { ok: false, code: 'KHONGCO', error: 'Kho chưa có vấn đề này.' };
  const tangNha = await tangCuaNha(db, d.maNha);
  if (tangNha < k.tang) return { ok: false, code: 'TANGCHUA', error: 'Nhà đang ở tầng ' + tangNha + ' — phương án này thuộc quyền lợi tầng ' + k.tang + '.' };
  const g = await bangGiaDangChay(db);
  const gia = giaLuot(g.bang, k.hang, k.tang);
  const vi = await moVi(db, d.maNha, hoSo.u);
  const t = await truTheoThuTu(db, { maNha: d.maNha, gia, viec: 'khoCao:' + k.hang, tc: id, tang: tangNha, cap: vi.cap, ghiChu: (TEN_HANG[k.hang] + ' · ' + k.ten).slice(0, 200), boiAi: hoSo.u });
  if (!t.ok) return t;
  const luc = Date.now();
  await db.batch([
    db.prepare("UPDATE deXuatKhoCao SET trangThai = 'chon', maChon = ?, chonLuc = ?, chonBoiAi = ? WHERE id = ? AND trangThai = 'cho'").bind(ma, luc, ten(hoSo), id),
    db.prepare('INSERT INTO luotKhoCao (id, deXuat, ma, maNha, hang, tang, so, boiAi, luc) VALUES (?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO NOTHING')
      .bind('LKC-' + id.slice(3), id, ma, d.maNha, k.hang, k.tang, t.trung ? 0 : gia, ten(hoSo), luc)
  ]);
  try { await Kho.ghiNhatKy(db, { uid: hoSo.uid, username: ten(hoSo), viec: 'KHO_CAO_NHA_CHON', doiTuong: d.maNha, chiTiet: id + ' · ' + ma + ' · ' + gia + ' credit' }); } catch (e) {}
  return { ok: true, so: t.trung ? 0 : gia, trung: !!t.trung, hang: k.hang, soDu: await soDu(db, d.maNha) };
}

/* CỬA · HUỶ ĐỀ XUẤT CHƯA CHỌN — Coach/quản lý, hoặc chính nhà từ chối. */
export async function huyDeXuat(y, env, db, hoSo) {
  const id = String((y || {}).id || '');
  if (!/^DX-[A-Z0-9]{12}$/.test(id)) return { ok: false, code: 'SAI', error: 'Thiếu mã đề xuất.' };
  await taoBang(db);
  const d = await db.prepare('SELECT maNha, trangThai, luaChon FROM deXuatKhoCao WHERE id = ?').bind(id).first();
  if (!d) return { ok: false, code: 'KHONGCO', error: 'Không có đề xuất này.' };
  const vaiH = await vaiKhoCao(db, hoSo, d.maNha);
  let dsH = []; try { dsH = JSON.parse(d.luaChon); } catch (e) {}
  /* Danh sách rỗng/hỏng thì Tư vấn viên KHÔNG được qua: [].every() là true. */
  if (!vaiH || (vaiH === 'tuvan' && (!Array.isArray(dsH) || !dsH.length || !vaiDuoc(vaiH, dsH)))) return { ok: false, code: 'NOPERM', error: 'Không huỷ được đề xuất của nhà này.' };
  if (d.trangThai !== 'cho') return { ok: false, code: 'DAXONG', error: 'Đề xuất đã chọn thì không huỷ được — credit đã trừ đi theo gói.' };
  await db.prepare("UPDATE deXuatKhoCao SET trangThai = 'huy', chonLuc = ?, chonBoiAi = ? WHERE id = ? AND trangThai = 'cho'").bind(Date.now(), ten(hoSo), id).run();
  return { ok: true };
}

/* CỬA · GHI HOÀN THÀNH — Coach phụ trách/quản lý, kèm bằng chứng. Nhà nhận
   credit thưởng "nhiệm vụ" (bảng thưởng đã duyệt, có trần theo tầng). */
export async function hoanThanhKhoCao(y, env, db, hoSo) {
  const x = y || {};
  const id = String(x.id || ''), bangChung = sach(x.bangChung, 500);
  if (!/^DX-[A-Z0-9]{12}$/.test(id)) return { ok: false, code: 'SAI', error: 'Thiếu mã đề xuất.' };
  if (bangChung.length < 10) return { ok: false, code: 'SAI', error: 'Ghi bằng chứng gia đình đã làm (ít nhất 10 ký tự) — thưởng chỉ ghi khi có bằng chứng.' };
  if (!soatRaNgoai(bangChung).sach) return { ok: false, code: 'DIEU13', error: 'Bằng chứng không ghi tên, số điện thoại, địa chỉ.' };
  await taoBang(db);
  const l = await db.prepare('SELECT id, ma, maNha, xongLuc FROM luotKhoCao WHERE deXuat = ?').bind(id).first();
  if (!l) return { ok: false, code: 'KHONGCO', error: 'Đề xuất này chưa được nhà chọn.' };
  const vai = await vaiKhoCao(db, hoSo, l.maNha);
  if (!vaiDuoc(vai, [l.ma])) return { ok: false, code: 'NOPERM', error: 'Chỉ Coach hoặc Tư vấn viên phụ trách nhà (đúng hệ của vấn đề), hoặc Trưởng nhóm Coach trở lên, ghi hoàn thành.' };
  if (l.xongLuc) return { ok: true, trung: true };
  /* Thưởng credit "nhiệm vụ" theo luật của ví: Coach của nhà hoặc Trưởng nhóm
     ghi SAU KHI kiểm bằng chứng. Nên Tư vấn viên chỉ NỘP bằng chứng — lượt
     chưa đóng (xongLuc trống) — và Coach/Trưởng nhóm bấm hoàn thành lần nữa
     để đóng lượt và cộng thưởng. Đóng lượt ngay ở đây thì lần bấm của Coach
     trả "đã xong" và phần thưởng mất lặng lẽ. */
  if (vai === 'tuvan') {
    await db.prepare('UPDATE luotKhoCao SET bangChung = ? WHERE id = ? AND xongLuc IS NULL').bind(bangChung, l.id).run();
    return { ok: true, thuong: 0, choXacNhan: true,
      vi: 'Đã nộp bằng chứng. Coach của nhà hoặc Trưởng nhóm kiểm rồi bấm hoàn thành — lúc ấy lượt mới đóng và nhà mới được cộng thưởng.' };
  }
  await db.prepare('UPDATE luotKhoCao SET xongLuc = ?, bangChung = ? WHERE id = ? AND xongLuc IS NULL').bind(Date.now(), bangChung, l.id).run();
  const th = await thuongCredit({ maNha: l.maNha, hoatDong: 'nv', thamChieu: id, ghiChu: 'Hoàn thành gói kho cấp cao' }, env, db, hoSo);
  return { ok: true, thuong: th && th.ok ? th.so : 0, thuongLoi: th && !th.ok ? th.error : '' };
}

/* CỬA · CHUYỂN AN TOÀN — tách hẳn khỏi kho và khỏi credit.
   Dấu hiệu an toàn (tự làm đau, ý nghĩ tự tử, bạo lực, xâm hại) → chuyển
   ngay, MỌI hạng, không tính credit, không cần số dư, không cần mã vấn đề.
   Ghi được: Coach phụ trách nhà hoặc quản lý (không phải mọi vai cho mọi
   nhà), mỗi nhà một lượt mỗi giờ. Báo ngay Giám đốc + Super Admin trong hộp
   thông báo của hệ — "chuyển ngay" phải tới tay một người, không chỉ nằm
   trong sổ. Lượt này không giao gói nào, nên không phải đường né credit. */
export async function chuyenAnToan(y, env, db, hoSo) {
  const x = y || {};
  const maNha = sach(x.maNha, 40), ghiChu = sach(x.ghiChu, 500);
  if (!maNha) return { ok: false, code: 'SAI', error: 'Thiếu mã khách hàng của nhà.' };
  /* Tư vấn viên phụ trách nhà cũng ghi được: người thấy dấu hiệu sớm nhất ở
     tầng 1–3 thường là họ, và "chuyển ngay" không được chờ qua một người nữa. */
  const vai = await vaiKhoCao(db, hoSo, maNha);
  if (vai !== 'coach' && vai !== 'ql' && vai !== 'tuvan') return { ok: false, code: 'NOPERM', error: 'Chỉ Coach hoặc Tư vấn viên phụ trách nhà này, hoặc quản lý, ghi được lượt chuyển. Người khác thấy dấu hiệu: báo ngay Trưởng nhóm Coach.' };
  if (!(await nhaCoThat(db, maNha))) return { ok: false, code: 'KHONGNHA', error: 'Không có nhà nào mang mã ' + maNha + '.' };
  if (ghiChu && !soatRaNgoai(ghiChu).sach) return { ok: false, code: 'DIEU13', error: 'Ghi chú không ghi tên, số điện thoại, địa chỉ — mô tả dấu hiệu quan sát được.' };
  await taoBang(db);
  const gio = Math.floor(Date.now() / 3600000);
  const id = 'AT-' + maNha.replace(/[^A-Za-z0-9]/g, '').slice(0, 20) + '-' + gio;
  const r = await db.prepare('INSERT INTO chuyenAnToan (id, maNha, ghiChu, boiAi, luc) VALUES (?,?,?,?,?) ON CONFLICT(id) DO NOTHING')
    .bind(id, maNha, ghiChu || null, ten(hoSo), Date.now()).run();
  const moi = Number((r.meta || {}).changes || 0) === 1;
  if (moi) {
    try { await baoLenCapCao(db, { loai: 'anToan', mucDo: 'gap', tieuDe: 'Chuyển an toàn · nhà ' + maNha, than: 'Coach ghi dấu hiệu an toàn, cần chuyển chuyên gia ngay. ' + (ghiChu || ''), doiTuong: maNha }); } catch (e) {}
    try { await Kho.ghiNhatKy(db, { uid: hoSo.uid, username: ten(hoSo), viec: 'CHUYEN_AN_TOAN', doiTuong: maNha, chiTiet: id }); } catch (e) {}
  }
  return { ok: true, trung: !moi, so: 0,
    vi: 'Đã ghi và báo Giám đốc + Super Admin. Chuyển ngay tới chuyên gia/bộ phận phụ trách — mọi hạng, không tính credit, không chờ số dư.' };
}

/* CỬA · SỔ CỦA MỘT NHÀ — gói đã chọn, credit, hoàn thành. */
export async function soKhoCaoNha(y, env, db, hoSo) {
  const maNha = sach((y || {}).maNha, 40) || await maNhaCuaToi(db, hoSo);
  if (!maNha) return { ok: false, code: 'SAI', error: 'Thiếu mã khách hàng.' };
  const vai = await vaiKhoCao(db, hoSo, maNha);
  if (!vai) return { ok: false, code: 'NOPERM', error: 'Không xem được sổ của nhà này.' };
  await taoBang(db);
  let ds = (await db.prepare('SELECT l.deXuat, l.ma, l.hang, l.tang, l.so, l.boiAi, l.luc, l.xongLuc, k.ten FROM luotKhoCao l LEFT JOIN khoCao k ON k.ma = l.ma ' +
    'WHERE l.maNha = ? ORDER BY l.luc DESC, l.rowid DESC LIMIT 100').bind(maNha).all()).results || [];
  if (vai === 'tuvan') ds = ds.filter(r => heCuaMa(String(r.ma)) === 'tuvan');
  return { ok: true, maNha, ds };
}
