/* ═══════════════════════════════════════════════════════════════
   GITA 365 — TRA CỨU GIẢI PHÁP · 13 MỤC (chủ hệ 10/10/2026)

   Chủ hệ: "Lập hệ thống tra cứu: Vấn đề · Phân tích (theo quy trình) ·
   Phác đồ · Tư duy 20/80 · Kỹ năng · Các bước · Sổ nhật ký giải pháp ·
   Lưu ý · Tham vấn chuyên gia · Các phương án · Kết quả · Công cụ đánh giá
   · Bài học rút ra." Đối tượng: từ chuyên viên tư vấn trở lên (R01–R11).

   Phần NỘI DUNG của 13 mục đã nằm trong kho nghề (phác đồ, tình huống, quy
   trình nhóm, chiều sâu) và được màn `tra-cuu-gp` ghép lại ngay trên máy
   khách — không chép thêm bản thứ hai. Máy chủ giữ đúng hai việc kho chưa
   làm được:

     1. SỔ NHẬT KÝ GIẢI PHÁP — mỗi lần một người đem giải pháp ra dùng thì
        ghi: phương án đã dùng · kết quả · cách đo · bài học. Mục "Kết quả"
        và "Bài học rút ra" của từng vấn đề đọc thẳng từ sổ này, nên chúng
        lớn lên theo việc thật của đội chứ không phải một đoạn chữ viết sẵn.
        Sổ dùng chung cả đội, nên KHÔNG nhận tên hay số điện thoại gia đình
        — soát bằng đúng bộ dò Điều 13 của hệ (soatRaNgoai), không bộ thứ hai.

     2. SOẠN NHÁP cho mục kho CHƯA có (Tư duy 20/80, Kỹ năng xử lý, Các
        phương án, Tham vấn chuyên gia) — đi qua goiTheoLoai: cổng Điều 13,
        trần tải, sổ token. Bản nháp TRẢ VỀ cho người đọc, KHÔNG tự vào kho:
        nội dung nghề tới tay đội ngũ phải có người duyệt (luật ba chữ ký
        của xưởng tài liệu).
   ═══════════════════════════════════════════════════════════════ */
'use strict';

import { BAC, roleOf, tenNguoiDung as ten } from './vai-tro.js';
import { Kho } from './nen.js';
import { soatRaNgoai } from './bo-nao.js';
import { goiTheoLoai } from './bo-nao-da-tri.js';

/* Từ chuyên viên tư vấn trở lên = bậc 1…11. Cùng ngưỡng với quyền
   `ca_xu_ly` ở máy khách (data.core.js) — màn hình chỉ ẩn mục, cổng thật ở đây. */
export const BAC_TOI_DA = 11;
export function duocTraCuu(hoSo) {
  const b = BAC[roleOf(hoSo)];
  return !!b && b <= BAC_TOI_DA;
}
const CAM = { ok: false, code: 'NOPERM', error: 'Tra cứu giải pháp mở cho chuyên viên tư vấn trở lên (R01–R11).' };

export const KET_QUA = Object.freeze({ tot: 'Đạt', motPhan: 'Đạt một phần', chua: 'Chưa đạt' });

const sach = (s, n) => String(s == null ? '' : s).replace(/[\u0000-\u0008\u000b-\u001f]+/g, ' ').trim().slice(0, n);
const maHopLe = s => /^[A-Za-z0-9._:-]{1,40}$/.test(s);

let daDung = false;
async function taoBang(db) {
  if (daDung) return;
  await db.prepare('CREATE TABLE IF NOT EXISTS soNhatKyGiaiPhap (id TEXT PRIMARY KEY, maVanDe TEXT NOT NULL, tenVanDe TEXT, ' +
    'phuongAn TEXT NOT NULL, ketQua TEXT NOT NULL, danhGia TEXT, baiHoc TEXT, boiAi TEXT, vai TEXT, luc INTEGER NOT NULL)').run();
  await db.prepare('CREATE INDEX IF NOT EXISTS ix_nkgp_van_de ON soNhatKyGiaiPhap (maVanDe, luc)').run();
  daDung = true;
}

/* ═══════════ CỬA: GHI SỔ NHẬT KÝ ═══════════ */
export async function ghiNhatKyGiaiPhap(y, env, db, hoSo) {
  if (!duocTraCuu(hoSo)) return CAM;
  const x = y || {};
  const maVanDe = sach(x.maVanDe, 40), tenVanDe = sach(x.tenVanDe, 200);
  const phuongAn = sach(x.phuongAn, 1500), danhGia = sach(x.danhGia, 800), baiHoc = sach(x.baiHoc, 1500);
  const ketQua = String(x.ketQua || '');
  if (!maHopLe(maVanDe)) return { ok: false, code: 'SAI', error: 'Thiếu mã vấn đề.' };
  if (!KET_QUA[ketQua]) return { ok: false, code: 'SAI', error: 'Kết quả phải là: Đạt · Đạt một phần · Chưa đạt.' };
  if (phuongAn.length < 10) return { ok: false, code: 'SAI', error: 'Ghi rõ phương án đã dùng (ít nhất 10 ký tự).' };
  if (baiHoc.length < 10) return { ok: false, code: 'SAI', error: 'Ghi bài học rút ra (ít nhất 10 ký tự) — sổ không có bài học thì lần sau không ai học được gì.' };
  /* Sổ dùng chung cả đội: không giữ dữ liệu nhận dạng một gia đình. */
  const ra = soatRaNgoai([tenVanDe, phuongAn, danhGia, baiHoc].join('\n'));
  if (!ra.sach) return { ok: false, code: 'DIEU13', ngo: ra.ngo,
    error: 'Sổ nhật ký dùng chung cả đội — bỏ tên, số điện thoại, địa chỉ của gia đình rồi ghi lại. Máy không tự xoá hộ.' };
  await taoBang(db);
  const id = 'NK-' + crypto.randomUUID().slice(0, 8).toUpperCase();
  await db.prepare('INSERT INTO soNhatKyGiaiPhap (id, maVanDe, tenVanDe, phuongAn, ketQua, danhGia, baiHoc, boiAi, vai, luc) VALUES (?,?,?,?,?,?,?,?,?,?)')
    .bind(id, maVanDe, tenVanDe || null, phuongAn, ketQua, danhGia || null, baiHoc, ten(hoSo), roleOf(hoSo), Date.now()).run();
  try { await Kho.ghiNhatKy(db, { uid: hoSo.uid, username: ten(hoSo), viec: 'NHAT_KY_GIAI_PHAP', doiTuong: maVanDe, chiTiet: id + ' · ' + ketQua }); } catch (e) {}
  return { ok: true, id };
}

/* ═══════════ CỬA: ĐỌC SỔ CỦA MỘT VẤN ĐỀ ═══════════
   Trả về các lượt gần nhất kèm phép đếm theo kết quả — mục "Kết quả" của
   màn đọc từ phép đếm này: một tỷ lệ đạt chỉ có nghĩa khi kèm cỡ mẫu. */
export async function docNhatKyGiaiPhap(y, env, db, hoSo) {
  if (!duocTraCuu(hoSo)) return CAM;
  const maVanDe = sach((y || {}).maVanDe, 40);
  await taoBang(db);
  const ds = maVanDe && maHopLe(maVanDe)
    ? ((await db.prepare('SELECT id, maVanDe, tenVanDe, phuongAn, ketQua, danhGia, baiHoc, boiAi, vai, luc FROM soNhatKyGiaiPhap WHERE maVanDe = ? ORDER BY luc DESC, rowid DESC LIMIT 50').bind(maVanDe).all()).results || [])
    : ((await db.prepare('SELECT id, maVanDe, tenVanDe, phuongAn, ketQua, danhGia, baiHoc, boiAi, vai, luc FROM soNhatKyGiaiPhap ORDER BY luc DESC, rowid DESC LIMIT 50').all()).results || []);
  const dem = { tot: 0, motPhan: 0, chua: 0 };
  ds.forEach(r => { if (dem[r.ketQua] != null) dem[r.ketQua]++; });
  return { ok: true, ds, dem, tong: ds.length };
}

/* ═══════════ CỬA: SOẠN NHÁP MỤC KHO CHƯA CÓ ═══════════ */
export const MUC_SOAN = Object.freeze({
  tuDuy2080: { ten: 'Tư duy 20/80',
    khuon: 'Áp nguyên lý 20/80 vào vấn đề này. Dạng: 1) 20% việc tạo ra 80% thay đổi — tối đa 3 việc, mỗi việc một dòng, làm được trong tuần. ' +
      '2) 80% việc nên tạm gác và vì sao. 3) Dấu hiệu cho biết đang dồn sức đúng chỗ. Không bịa số liệu.' },
  kyNang: { ten: 'Kỹ năng xử lý',
    khuon: 'Liệt kê kỹ năng người tư vấn/coach cần có để xử lý vấn đề này. Dạng: tối đa 5 kỹ năng; mỗi kỹ năng: tên · làm thế nào trong buổi gặp (một câu) · cách tự kiểm đã làm đúng.' },
  phuongAn: { ten: 'Các phương án xử lý',
    khuon: 'Đưa ra 3 phương án KHÁC NHAU về cách tiếp cận. Mỗi phương án: khi nào dùng · cách làm (2–3 bước) · rủi ro · cái giá bỏ lỡ. Kết bằng một câu: phương án nào thử trước và vì sao.' },
  thamVan: { ten: 'Tham vấn chuyên gia',
    khuon: 'Khi nào vấn đề này vượt khỏi việc của tư vấn/coach và cần chuyên gia. Dạng: 1) Dấu hiệu QUAN SÁT ĐƯỢC cần chuyển (không chẩn đoán). 2) Loại chuyên gia phù hợp. ' +
      '3) Chuẩn bị gì trước khi chuyển. Ngưỡng chuyển tuyến lâm sàng do Hội đồng chuyên môn chốt — nói rõ điều đó.' }
});

export async function soanMucGiaiPhap(y, env, db, hoSo) {
  if (!duocTraCuu(hoSo)) return CAM;
  const x = y || {};
  const m = MUC_SOAN[String(x.muc || '')];
  if (!m) return { ok: false, code: 'SAI', error: 'Mục không soạn nháp được.' };
  const tenVanDe = sach(x.tenVanDe, 200);
  if (tenVanDe.length < 4) return { ok: false, code: 'SAI', error: 'Thiếu tên vấn đề.' };
  const boiCanh = sach(x.boiCanh, 2500);
  const dem = await Kho.demNhip(db, 'soanMucGP:' + String(hoSo.uid || hoSo.u || ''), 86400);
  if (dem > 60) return { ok: false, code: 'HETTRAN', error: 'Hôm nay đã soạn đủ 60 bản nháp.' };
  const cau = 'Vấn đề: ' + tenVanDe + (boiCanh ? '\nNội dung kho đã có (phân tích · phác đồ · các bước):\n' + boiCanh : '') +
    '\n\nViệc: soạn mục "' + m.ten + '" cho người tư vấn của Học viện GITA 365 (giáo dục gia đình).';
  const k = await goiTheoLoai(env, db, hoSo, 'soan', cau, { khuon: m.khuon + ' Viết tiếng Việt, gọn, không markdown đậm.', ra: 800 });
  if (!k.ok) return { ok: false, code: k.code || 'AI_LOI', error: String(k.error || '') + (Array.isArray(k.daThu) && k.daThu.length ? ' · ' + k.daThu.join('; ') : '') };
  try { await Kho.ghiNhatKy(db, { uid: hoSo.uid, username: ten(hoSo), viec: 'SOAN_MUC_GIAI_PHAP', doiTuong: String(x.muc), chiTiet: tenVanDe.slice(0, 80) + ' · ' + k.ncc }); } catch (e) {}
  return { ok: true, muc: String(x.muc), tenMuc: m.ten, nhap: String(k.text || '').replace(/\*\*(.+?)\*\*/g, '$1').trim(), ncc: k.ncc,
    vi: 'Bản nháp máy soạn — chưa duyệt, chưa vào kho. Đối chiếu với kho và người phụ trách chuyên môn trước khi dùng với gia đình.' };
}

/* ═══════════════════════════════════════════════════════════════
   KHO 1000 VẤN ĐỀ (chủ hệ 10/10/2026) — 500 vấn đề khách hàng · 500 vấn
   đề nội bộ (nhân sự, hệ thống, vận hành, công nghệ…), mỗi vấn đề đủ 13
   mục của hệ thống tra cứu.

   Kho này nằm ở MÁY CHỦ (bảng khoVanDe), không nằm trong gói gửi xuống máy
   khách. Hai lý do:
     1. Kho mã là công khai. Nội dung nghề không được nằm trần trong kho mã
        — gói nguồn đi vào kho mã ĐÃ MÃ HOÁ (kho-van-de/goi.enc), và chỉ
        Super Admin có mật khẩu mở gói để nạp vào bảng này.
     2. Tỷ lệ xem theo vai được CẮT Ở ĐÂY. Màn hình chỉ nhận đúng phần vai
        được xem; vấn đề ngoài tỷ lệ chỉ gửi tên, không gửi nội dung. Kho
        nghề cũ thì đã nằm sẵn trên máy nên tỷ lệ ở đó chỉ là chính sách
        hiển thị — kho này thì không.
   ═══════════════════════════════════════════════════════════════ */

/* Bản máy chủ của G.TCGP_TY_LE (src/data.core.js). Hai bản phải khớp — bộ
   thử tools/thu-tra-cuu-giai-phap.mjs đối chiếu mỗi lần chạy. Máy chủ phải
   có bản riêng vì nó là chỗ cắt thật; máy khách cần bản của nó cho kho nghề. */
export const TY_LE = Object.freeze([
  { vai: ['R01', 'R02'], pt: 100 },
  { vai: ['R03', 'R04'], pt: 82 },
  { vai: ['R05', 'R06', 'R07'], pt: 77 },
  { vai: ['R08'], pt: 76 },
  { vai: ['R09', 'R10', 'R11'], pt: 69 }
]);
export function tyLe(vai) {
  for (const r of TY_LE) if (r.vai.includes(vai)) return r.pt;
  return 0;
}

export const LOAI_KHO = Object.freeze({ kh: 'Khách hàng', ns: 'Nội bộ' });
export const NHOM_KHO = Object.freeze({
  'KH-A': 'Học tập & động lực học', 'KH-B': 'Cảm xúc & hành vi của con', 'KH-C': 'Màn hình & công nghệ',
  'KH-D': 'Giao tiếp cha mẹ – con', 'KH-E': 'Vợ chồng & gia đình nhiều thế hệ', 'KH-F': 'Thói quen, kỷ luật & tự lập',
  'KH-G': 'Anh chị em & bạn bè', 'KH-H': 'Tài năng, định hướng & giá trị sống', 'KH-I': 'Cha mẹ tự phát triển',
  'KH-J': 'Khách hàng với dịch vụ GITA',
  'NS-A': 'Tuyển dụng, hội nhập & giữ người', 'NS-B': 'Năng lực coach & tư vấn viên', 'NS-C': 'Hiệu suất, KPI & lương',
  'NS-D': 'Văn hoá, xung đột & đạo đức nội bộ', 'NS-E': 'Vận hành quy trình & chăm sóc khách', 'NS-F': 'Hệ thống, tài khoản & phân quyền',
  'NS-G': 'Công nghệ, ứng dụng & AI', 'NS-H': 'Dữ liệu, bảo mật & pháp lý', 'NS-I': 'Tài chính & chi tiêu nội bộ',
  'NS-J': 'Nội dung, truyền thông & khủng hoảng'
});
const MA_KHO = /^(KH|NS)-([A-J])-(\d{2})$/;
const TRAN_LO = 100;          // bản ghi mỗi lượt nạp
const TRAN_BAN_GHI = 14000;   // ký tự nội dung một bản ghi

let daDungKho = false;
async function taoBangKho(db) {
  if (daDungKho) return;
  await db.prepare('CREATE TABLE IF NOT EXISTS khoVanDe (ma TEXT PRIMARY KEY, loai TEXT NOT NULL, nhom TEXT NOT NULL, cap INTEGER NOT NULL, ' +
    'stt INTEGER NOT NULL, ten TEXT NOT NULL, noiDung TEXT NOT NULL, ban TEXT, napLuc INTEGER NOT NULL)').run();
  await db.prepare('CREATE INDEX IF NOT EXISTS ix_kvd_hang ON khoVanDe (loai, cap, stt)').run();
  daDungKho = true;
}

/* Soát một bản ghi trước khi vào bảng. Trả về danh sách lỗi (rỗng = sạch).
   Cùng hình với bộ kiểm biên soạn — nạp lại một gói hỏng thì hỏng ở đây,
   không lặng lẽ thành một vấn đề thiếu mục trên màn. */
export function soatBanGhiKho(r) {
  const loi = [];
  const s = v => typeof v === 'string' && v.trim().length > 0;
  const mang = (v, a, b) => Array.isArray(v) && v.length >= a && v.length <= b && v.every(s);
  if (!r || typeof r !== 'object') return ['không phải bản ghi'];
  if (!MA_KHO.test(r.id || '')) loi.push('id sai dạng');
  if (!s(r.ten) || r.ten.length > 140) loi.push('ten');
  if (![1, 2, 3, 4, 5].includes(r.cap)) loi.push('cap');
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
  if (loi.length) return loi;
  if (JSON.stringify(r).length > TRAN_BAN_GHI) loi.push('quá dài');
  /* Kho dùng chung cả đội: không giữ dữ liệu nhận dạng một người. */
  const ra = soatRaNgoai(Object.values(r).map(v => typeof v === 'string' ? v : JSON.stringify(v)).join('\n'));
  if (!ra.sach) loi.push('DIEU13');
  return loi;
}
function noiDungCua(r) {
  const { id, ten, cap, ...con } = r;
  return JSON.stringify(con);
}

/* ═══════════ CỬA: NẠP KHO (chỉ Super Admin) ═══════════
   Cả lô hoặc không bản nào: một bản ghi hỏng thì từ chối cả lô và nói đúng
   mã nào hỏng chỗ nào — nạp một nửa thì kho có lỗ mà không ai biết lỗ ở đâu. */
export async function napKhoVanDe(y, env, db, hoSo) {
  if (BAC[roleOf(hoSo)] !== 1) return { ok: false, code: 'NOPERM', error: 'Chỉ Super Admin nạp kho 1000 vấn đề.' };
  const x = y || {};
  const ds = Array.isArray(x.ds) ? x.ds : [];
  if (!ds.length || ds.length > TRAN_LO) return { ok: false, code: 'SAI', error: 'Mỗi lượt nạp từ 1 đến ' + TRAN_LO + ' vấn đề.' };
  const ban = sach(x.ban, 40) || null;
  const hong = [];
  ds.forEach(r => { const l = soatBanGhiKho(r); if (l.length) hong.push((r && r.id || '?') + ': ' + l.join(',')); });
  if (hong.length) return { ok: false, code: 'HONG', hong: hong.slice(0, 20), error: hong.length + ' vấn đề không qua soát — không nạp bản nào trong lô này.' };
  await taoBangKho(db);
  const luc = Date.now();
  const cau = ds.map(r => {
    const m = MA_KHO.exec(r.id);
    const loai = m[1] === 'KH' ? 'kh' : 'ns', nhom = m[1] + '-' + m[2];
    const stt = ('ABCDEFGHIJ'.indexOf(m[2]) + 1) * 100 + Number(m[3]);
    return db.prepare('INSERT INTO khoVanDe (ma, loai, nhom, cap, stt, ten, noiDung, ban, napLuc) VALUES (?,?,?,?,?,?,?,?,?) ' +
      'ON CONFLICT(ma) DO UPDATE SET loai=excluded.loai, nhom=excluded.nhom, cap=excluded.cap, stt=excluded.stt, ten=excluded.ten, ' +
      'noiDung=excluded.noiDung, ban=excluded.ban, napLuc=excluded.napLuc')
      .bind(r.id, loai, nhom, r.cap, stt, sach(r.ten, 140), noiDungCua(r), ban, luc);
  });
  await db.batch(cau);
  const tong = await db.prepare('SELECT loai, COUNT(*) n FROM khoVanDe GROUP BY loai').all();
  const dem = { kh: 0, ns: 0 };
  (tong.results || []).forEach(r => { if (dem[r.loai] != null) dem[r.loai] = Number(r.n); });
  try { await Kho.ghiNhatKy(db, { uid: hoSo.uid, username: ten(hoSo), viec: 'NAP_KHO_VAN_DE', doiTuong: ban || '', chiTiet: ds.length + ' vấn đề · kho ' + dem.kh + '/' + dem.ns }); } catch (e) {}
  return { ok: true, nap: ds.length, dem };
}

/* Thứ hạng trong một loại: cấp thấp trước, rồi thứ tự gốc. Vai mở
   ceil(tổng × tỷ lệ) vấn đề đầu — cùng cách cắt với màn hình. */
async function soMo(db, loai, hoSo) {
  const n = Number(((await db.prepare('SELECT COUNT(*) n FROM khoVanDe WHERE loai = ?').bind(loai).first()) || {}).n || 0);
  const pt = tyLe(roleOf(hoSo));
  return { n, pt, so: Math.ceil(n * pt / 100) };
}

/* ═══════════ CỬA: DANH SÁCH MỘT LOẠI ═══════════
   Trả TÊN của mọi vấn đề (vấn đề ngoài tỷ lệ hiện tên kèm ổ khoá), không
   trả nội dung. */
export async function dsKhoVanDe(y, env, db, hoSo) {
  if (!duocTraCuu(hoSo)) return CAM;
  const loai = String((y || {}).loai || '');
  if (!LOAI_KHO[loai]) return { ok: false, code: 'SAI', error: 'Loại phải là kh hoặc ns.' };
  await taoBangKho(db);
  const { n, pt, so } = await soMo(db, loai, hoSo);
  const rows = (await db.prepare('SELECT ma, nhom, cap, ten FROM khoVanDe WHERE loai = ? ORDER BY cap ASC, stt ASC').bind(loai).all()).results || [];
  return { ok: true, loai, pt, so, tong: n, nhomTen: NHOM_KHO,
    ds: rows.map((r, i) => ({ ma: r.ma, nhom: r.nhom, cap: r.cap, ten: r.ten, mo: i < so })) };
}

/* ═══════════ CỬA: ĐỌC MỘT VẤN ĐỀ ═══════════ */
export async function docKhoVanDe(y, env, db, hoSo) {
  if (!duocTraCuu(hoSo)) return CAM;
  const ma = String((y || {}).ma || '');
  if (!MA_KHO.test(ma)) return { ok: false, code: 'SAI', error: 'Mã vấn đề không hợp lệ.' };
  await taoBangKho(db);
  const r = await db.prepare('SELECT ma, loai, nhom, cap, stt, ten, noiDung FROM khoVanDe WHERE ma = ?').bind(ma).first();
  if (!r) return { ok: false, code: 'KHONGCO', error: 'Kho chưa có vấn đề này — Super Admin chưa nạp gói.' };
  const { so } = await soMo(db, r.loai, hoSo);
  const hang = Number(((await db.prepare('SELECT COUNT(*) n FROM khoVanDe WHERE loai = ? AND (cap < ? OR (cap = ? AND stt < ?))')
    .bind(r.loai, r.cap, r.cap, r.stt).first()) || {}).n || 0);
  if (hang >= so) return { ok: false, code: 'NGOAITYLE', error: 'Vấn đề này nằm ngoài phần trăm vai của anh/chị được xem.' };
  let nd = {};
  try { nd = JSON.parse(r.noiDung); } catch (e) {}
  return { ok: true, vd: Object.assign({}, nd, { ma: r.ma, loai: r.loai, nhom: r.nhom, nhomTen: NHOM_KHO[r.nhom] || '', cap: r.cap, ten: r.ten }) };
}
