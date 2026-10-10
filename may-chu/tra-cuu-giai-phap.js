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
