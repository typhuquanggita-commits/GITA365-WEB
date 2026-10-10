/* ═══════════════════════════════════════════════════════════════
   GITA 365 — KHO 1000 NHIỆM VỤ THỰC HÀNH · CẨM NANG CẦM TAY CHỈ VIỆC

   Chủ hệ 10/2026: "1000 nhiệm vụ của khách hàng + thành viên cần được chỉ
   dẫn chi tiết như hồ sơ gửi kèm. Chất lượng sâu như hướng dẫn thực hành
   văn hoá 5S." Và: "Chất lượng cao cấp này dùng cho tầng 3-4-5. Tầng 1-2
   nhận được 3-5 nhiệm vụ — một số trải nghiệm cơ bản giúp khách hàng muốn
   được chỉ dẫn sâu hơn."

   Khuôn mẫu là hồ sơ GITA365-GD-5S-001 của chủ hệ (ba tệp: hồ sơ nghiệp
   vụ nội bộ · phiếu thực hành gia đình · bảng phân tích 8 cột). Mỗi nhiệm
   vụ trong kho có ĐỦ các phần của hồ sơ ấy — soatNhiemVu() đòi từng phần.

   ══ HAI NỬA, KHÔNG TRỘN ══
   | nửa        | ai thấy                            | gồm                         |
   |------------|------------------------------------|-----------------------------|
   | hồ sơ chủ  | nhân sự, theo trần % và cấp của vai | toàn bộ: chẩn đoán, 5 sao,  |
   |            |                                    | câu hỏi chuyên gia, credit  |
   | phiếu giao | đúng nhà / đúng người được giao     | phần của CẤP + CHẶNG đang   |
   |            |                                    | nhận, không hơn             |
   Khách hàng 0% kho nội bộ: không cửa nào trả hồ sơ chủ cho R13–R15. Phiếu
   giao do máy chủ CẮT ra từ hồ sơ (phieuKhach), không phải màn hình ẩn bớt.
   "Lọc trên màn hình KHÔNG PHẢI bảo vệ dữ liệu" — luật đã cắn ba lần.

   ══ TẦNG CỦA NHÀ QUYẾT ĐỘ SÂU ══
   · Tầng 1–2: tối đa TRAN_TRAI_NGHIEM nhiệm vụ trong đời gói, chỉ những
     nhiệm vụ mang cờ traiNghiem, chỉ cấp 1–2. Đủ để nếm cách làm, chưa đủ
     để đi sâu — đúng ý "giúp khách hàng có mong muốn được chỉ dẫn sâu hơn".
   · Tầng 3–5: cẩm nang đầy đủ 10 cấp, nhiệm vụ có tầng ≤ tầng của nhà.
   · Lên cấp có điều kiện: giao cấp n cần cấp n−1 đã nghiệm thu ĐẠT. Muốn
     bắt đầu ở cấp cao hơn 1 thì người giao phải ghi kết quả buổi phân loại
     ban đầu — "thời gian trôi qua không tự động tạo ra năng lực".

   ══ TRẦN % CỦA NHÂN SỰ (bảng "Quyền truy cập kho" của hồ sơ 5S) ══
   Tỷ lệ là TRẦN SỐ LƯỢNG trên danh mục ĐƯỢC GÁN, không phải "thấy 25% mỗi
   hồ sơ". Mặc định từ chối: chưa được gán thì không đọc, kể cả còn trần.
   Trưởng chuyên môn (R04 · R05) và Super Admin đọc toàn kho. Quản trị kỹ
   thuật (R02 · R03 · R12) không có quyền đọc mặc định.

   ══ CREDIT NGHIỆP VỤ — KHÔNG PHẢI TIỀN ══
   Cấp n đề xuất 10·n credit, chỉ ghi SAU nghiệm thu đạt. Mỗi tổ hợp đối
   tượng + nhiệm vụ + cấp + chu kỳ cộng tối đa một lần (khoá duy nhất ở
   bảng). Sổ riêng `soCreditNV`, KHÔNG phải ví credit của nhà (credit.js):
   hồ sơ 5S ghi rõ "credit là công cụ nghiệp vụ; không mặc định là tiền;
   đổi thành quyền lợi cần phê duyệt riêng".

   ══ AN TOÀN ══
   Bằng chứng nộp lên là CHỮ, không nhận tệp ảnh hay video ở đây: hồ sơ 5S
   cấm quay mặt trẻ, giấy tờ, địa chỉ; ảnh và video giữ tại nhà, người phụ
   trách xem trực tiếp. Chữ đi qua soatRaNgoai (Điều 13) trước khi lưu —
   tên trẻ, số điện thoại không vào sổ.
   ═══════════════════════════════════════════════════════════════ */
'use strict';

import { BAC, roleOf, tenNguoiDung as ten } from './vai-tro.js';
import { Kho } from './nen.js';
import { soatRaNgoai } from './bo-nao.js';
import { vaiVoiNha, nhaCoThat, tangCuaNha, maNhaCuaToi } from './credit.js';

/* ══ 21 Ô CỦA BẢN ĐỒ NGÔI NHÀ — xương sống của cả kho ══
   Chủ hệ: "Bản thiết kế full chi tiết cho hệ thống vận hành của ngôi nhà
   thịnh vượng. Từng phần trong bảng này được thiết kế chiều sâu." Bản đồ
   là màn `ngoi-nha` (G.NHA_PHAN · G.BD_LON): một mái, tám phòng, một cửa,
   một nền móng và mười bánh đà quay quanh. Mã ô ở đây khớp đúng thứ tự ấy;
   bộ thử đối chiếu tên với màn.

   1000 nhiệm vụ chia theo ô: mười bánh đà × 50 = 500; mái 50 + tám phòng ×
   45 + cửa 45 + nền 45 = 500. Mỗi ô một cuốn cẩm nang ba cấp soạn. */
export const O_NHA = Object.freeze({
  MAI: { ten: 'Tầm nhìn', vi: 'Mái nhà', soNV: 50 },
  P1: { ten: 'Mục tiêu', vi: 'Phòng 1', soNV: 45 },
  P2: { ten: 'Hành Trình Hạnh Phúc', vi: 'Phòng 2', soNV: 45 },
  P3: { ten: 'Phát triển Bản Thân', vi: 'Phòng 3', soNV: 45 },
  P4: { ten: 'Tài năng Thành viên', vi: 'Phòng 4', soNV: 45 },
  P5: { ten: 'Giá trị Sống', vi: 'Phòng 5', soNV: 45 },
  P6: { ten: 'Phẩm Chất Thành Viên', vi: 'Phòng 6', soNV: 45 },
  P7: { ten: 'Vinh Danh Ghi Nhận', vi: 'Phòng 7', soNV: 45 },
  P8: { ten: 'Tiêu Chuẩn Sống', vi: 'Phòng 8', soNV: 45 },
  CUA: { ten: 'Hành động', vi: 'Cửa chính', soNV: 45 },
  NEN: { ten: 'Nền móng', vi: 'Văn hoá · quy tắc · thói quen · kỷ luật', soNV: 45 },
  B01: { ten: 'Nhìn thật', vi: 'Bánh đà 1', soNV: 50 },
  B02: { ten: 'Nhịp nhà', vi: 'Bánh đà 2', soNV: 50 },
  B03: { ten: 'Lời nói trong nhà', vi: 'Bánh đà 3', soNV: 50 },
  B04: { ten: 'Tự học', vi: 'Bánh đà 4', soNV: 50 },
  B05: { ten: 'Nền sức khoẻ', vi: 'Bánh đà 5', soNV: 50 },
  B06: { ten: 'Tiền và lựa chọn', vi: 'Bánh đà 6', soNV: 50 },
  B07: { ten: 'Quan hệ trong nhà', vi: 'Bánh đà 7', soNV: 50 },
  B08: { ten: 'Mục tiêu và kỷ luật', vi: 'Bánh đà 8', soNV: 50 },
  B09: { ten: 'Đóng góp', vi: 'Bánh đà 9', soNV: 50 },
  B10: { ten: 'Truyền lại', vi: 'Bánh đà 10', soNV: 50 }
});
export const MA_NV = /^NV-(MAI|P[1-8]|CUA|NEN|B(?:0[1-9]|10))-(\d{2})$/;
export const DOI_TUONG = Object.freeze(['nha', 'nhanSu']);
export const SO_CAP = 10;
export const CREDIT_CAP = n => 10 * n;
export const TRAN_TRAI_NGHIEM = 5;
export const CAP_TRAI_NGHIEM = 2;
export const CHANG = Object.freeze(['khoiTao', 'thucHanh7', 'duyTri21', 'lamChu90']);
export const TEN_CHANG = Object.freeze({ khoiTao: 'Khởi tạo', thucHanh7: 'Thực hành 7 ngày', duyTri21: 'Duy trì 21 ngày', lamChu90: 'Làm chủ 90 ngày' });
export const KET_QUA = Object.freeze(['dat', 'boSung', 'lamLai']);
const TRAN_LO = 20;
const TRAN_BAN_GHI = 120000;
/* Độ sâu tối thiểu của một hồ sơ (ký tự nội dung). Đặt theo hồ sơ 5S của
   chủ hệ — bản chuyển sang khuôn này dài ~48.000 ký tự; sàn ở khoảng 40%
   để một hồ sơ "đủ mục mà mỏng ruột" không lọt qua. */
export const SAN_DO_SAU = 18000;

/* Trần theo vai: pct (trần số lượng trên kho đang hoạt động) · capToi (cấp
   cao nhất được đọc) · toanKho (đọc hết, không cần gán). Tư vấn R11 chưa có
   chứng nhận chương trình Tư vấn (dtChungChi) là tập sự. */
export const TRAN_VAI = Object.freeze({
  R01: { toanKho: true, capToi: 10, ten: 'Super Admin' },
  R04: { toanKho: true, capToi: 10, ten: 'Trưởng chuyên môn' },
  R05: { toanKho: true, capToi: 10, ten: 'Trưởng chuyên môn Coach' },
  R06: { pct: 60, capToi: 10, ten: 'Coach' },
  R07: { pct: 60, capToi: 10, ten: 'Coach' },
  R08: { pct: 25, capToi: 5, ten: 'Giáo viên' },
  R09: { pct: 25, capToi: 5, ten: 'Mentor' },
  R10: { pct: 25, capToi: 5, ten: 'Chuyên gia đánh giá' },
  R11: { pct: 25, capToi: 5, ten: 'Tư vấn chính' }
});
export const TRAN_TAP_SU = Object.freeze({ pct: 10, capToi: 3, ten: 'Tư vấn tập sự' });
/* Ai gán danh mục cho nhân sự: Super Admin và hai vai trưởng chuyên môn. */
const LV_GAN = 5;

const sach = (s, n) => String(s == null ? '' : s).replace(/[\u0000-\u0008\u000b-\u001f]+/g, ' ').trim().slice(0, n);
const S = v => typeof v === 'string' && v.trim().length > 0;
const dai = (v, n) => S(v) && v.trim().length >= n;
const dsChu = (v, a, b, n) => Array.isArray(v) && v.length >= a && v.length <= b && v.every(x => dai(x, n || 1));
function chuCua(v) {
  if (typeof v === 'string') return v.length;
  if (Array.isArray(v)) return v.reduce((s, x) => s + chuCua(x), 0);
  if (v && typeof v === 'object') return Object.keys(v).reduce((s, k) => s + chuCua(v[k]), 0);
  return 0;
}

/* ═══════════ SOÁT MỘT HỒ SƠ ═══════════
   Trả danh sách lỗi (rỗng = sạch). Mỗi lỗi gọi đúng TÊN PHẦN thiếu — một
   hồ sơ thiếu cột 5 của cấp 7 phải nói ra đúng "cap7.gocTuDuy", không chỉ
   "hồ sơ chưa đủ". */
export function soatNhiemVu(r) {
  const loi = [];
  if (!r || typeof r !== 'object') return ['không phải bản ghi'];
  const m = MA_NV.exec(r.id || '');
  if (!m) loi.push('id sai dạng (NV-<ô>-01..50, ô: MAI · P1–P8 · CUA · NEN · B01–B10)');
  else if (Number(m[2]) < 1 || Number(m[2]) > O_NHA[m[1]].soNV) loi.push('id: số thứ tự 01–' + O_NHA[m[1]].soNV + ' của ô ' + m[1]);
  if (!dai(r.ten, 8) || r.ten.length > 140) loi.push('ten');
  if (!DOI_TUONG.includes(r.doiTuong)) loi.push('doiTuong (nha | nhanSu)');
  if (r.doiTuong === 'nha') {
    if (![3, 4, 5].includes(r.tang)) loi.push('tang (nhà: 3|4|5 — tầng của cẩm nang đầy đủ)');
  } else if (r.tang !== undefined) loi.push('tang: nhiệm vụ nội bộ không mang tầng khách');
  if (r.traiNghiem !== undefined && r.traiNghiem !== true) loi.push('traiNghiem: chỉ true hoặc bỏ hẳn khoá');
  if (r.traiNghiem && r.doiTuong !== 'nha') loi.push('traiNghiem chỉ dành cho nhiệm vụ của nhà');
  if (!dai(r.tenViec, 40)) loi.push('tenViec');
  if (!dai(r.noiDungViec, 120)) loi.push('noiDungViec');
  if (!dai(r.ketQua, 80)) loi.push('ketQua');
  const tt = r.thuocTinh || {};
  ['doiTuong', 'thoiLuong', 'phamVi', 'vatLieu', 'dauRa', 'phanLoai'].forEach(k => { if (!dai(tt[k], 12)) loi.push('thuocTinh.' + k); });
  const nt = r.nenTang || {};
  if (!dai(nt.ten, 4) || !Array.isArray(nt.buoc) || nt.buoc.length < 3 || nt.buoc.length > 7 ||
      !nt.buoc.every(b => b && dai(b.ten, 3) && dai(b.cachLam, 40) && dai(b.bangChung, 15))) loi.push('nenTang (3–7 bước: ten · cachLam · bangChung)');
  if (!dai(nt.nguon, 20)) loi.push('nenTang.nguon (nguồn nền tảng, nêu rõ phần nào GITA đề xuất)');
  const g = r.gita || {};
  ['G', 'I', 'T', 'A'].forEach(k => { if (!dai(g[k], 80)) loi.push('gita.' + k); });
  const c = r.c437 || {};
  if (!Array.isArray(c.yeuTo) || c.yeuTo.length !== 4 || !c.yeuTo.every(y => y && dai(y.ten, 4) && dai(y.hanhVi, 25) && dai(y.hoTro, 25)))
    loi.push('c437.yeuTo (đúng 4: ten · hanhVi · hoTro)');
  if (!c.giaiDoan || !['dung', 'du', 'deu'].every(k => dai(c.giaiDoan[k], 40))) loi.push('c437.giaiDoan (Đúng · Đủ · Đều)');
  if (!Array.isArray(c.buoc) || c.buoc.length !== 7 || !c.buoc.every(b => b && dai(b.ten, 3) && dai(b.hanhDong, 25) && dai(b.dauRa, 10)))
    loi.push('c437.buoc (đúng 7: ten · hanhDong · dauRa)');
  if (!Array.isArray(r.phanVai) || r.phanVai.length < 3 || !r.phanVai.every(v => v && dai(v.vai, 3) && dai(v.phanViec, 25))) loi.push('phanVai (≥3)');
  if (!Array.isArray(r.lich7) || r.lich7.length !== 7 || !r.lich7.every(d => d && dai(d.ten, 3) && dai(d.hoatDong, 40) && dai(d.dauRa, 10) && dai(d.cauHoi, 10)))
    loi.push('lich7 (đúng 7 ngày: ten · hoatDong · dauRa · cauHoi)');
  const bm = r.baMuc || {};
  ['toiThieu', 'tieuChuan', 'moRong'].forEach(k => { if (!dai(bm[k], 30)) loi.push('baMuc.' + k); });
  if (!dai(r.phucHoi, 120)) loi.push('phucHoi');
  if (!Array.isArray(r.saoChuyenGia) || r.saoChuyenGia.length !== 5 ||
      !r.saoChuyenGia.every(s => s && dai(s.kyNang, 4) && dai(s.hanhVi, 30) && dai(s.chuaDat, 20))) loi.push('saoChuyenGia (đúng 5 sao)');
  if (!dai(r.phanHoi, 120)) loi.push('phanHoi (quy trình phản hồi có chiều sâu)');
  if (!dsChu(r.cauHoiChuyenGia, 5, 12, 15)) loi.push('cauHoiChuyenGia (5–12)');
  if (!dai(r.video, 120)) loi.push('video (kịch bản phản tư)');
  if (!Array.isArray(r.baiHocGiaTri) || r.baiHocGiaTri.length < 5 ||
      !r.baiHocGiaTri.every(b => b && dai(b.giaTri, 3) && dai(b.traiNghiem, 20) && dai(b.cauHoi, 15))) loi.push('baiHocGiaTri (≥5)');
  const kt = r.kyThuat || {};
  ['toChuc', 'anToan', 'quanHe'].forEach(k => { if (!dai(kt[k], 100)) loi.push('kyThuat.' + k); });
  if (!Array.isArray(r.moc) || r.moc.length < 5 || !r.moc.every(x => x && dai(x.chiSo, 3) && dai(x.n7, 8) && dai(x.n21, 8) && dai(x.n90, 8)))
    loi.push('moc (≥5 chỉ số × 7/21/90 ngày)');
  const d3 = r.ddd || {};
  ['dung', 'du', 'deu'].forEach(k => { if (!dai(d3[k], 30)) loi.push('ddd.' + k); });
  if (!Array.isArray(r.cap) || r.cap.length !== SO_CAP) loi.push('cap (đúng 10 cấp)');
  else r.cap.forEach((x, i) => {
    const n = i + 1, p = 'cap' + n + '.';
    if (!x || x.so !== n) { loi.push(p + 'so'); return; }
    if (x.credit !== CREDIT_CAP(n)) loi.push(p + 'credit (cấp ' + n + ' = ' + CREDIT_CAP(n) + ')');
    [['ten', 6], ['traiNghiem', 6], ['nangLuc', 40], ['mucTieu', 60], ['nhiemVu', 60], ['baiHoc', 40], ['ungDung', 30],
      ['chuanDat', 60], ['bangChung', 25], ['chuaDat', 25], ['hoTro', 40], ['cuaLenCap', 25], ['cauDaoSau', 20]]
      .forEach(([k, l]) => { if (!dai(x[k], l)) loi.push(p + k); });
    if (!dsChu(x.huongDan, 7, 7, 15)) loi.push(p + 'huongDan (đúng 7 bước cầm tay chỉ việc)');
    if (!dsChu(x.gocTuDuy, 3, 6, 15)) loi.push(p + 'gocTuDuy (3–6 câu)');
  });
  const ch = r.chang || {};
  CHANG.forEach(k => { if (!ch[k] || !dai(ch[k].phanGiao, 40) || !dai(ch[k].dieuKien, 20)) loi.push('chang.' + k); });
  if (!dai(r.canhBao, 60)) loi.push('canhBao (an toàn và lúc phải chuyển chuyên môn)');
  const doSau = chuCua(r);
  if (doSau < SAN_DO_SAU) loi.push('độ sâu ' + doSau + ' ký tự < sàn ' + SAN_DO_SAU);
  if (doSau > TRAN_BAN_GHI) loi.push('quá dài ' + doSau + ' ký tự > trần ' + TRAN_BAN_GHI);
  /* Từ tuyệt đối và lời hứa kết quả không vào cẩm nang (QC1 · QC3). */
  const toan = JSON.stringify(r);
  if (/(cam kết|đảm bảo|bảo đảm) (con|gia đình|kết quả)[^"]{0,30}(chắc chắn|100%)|tốt nhất thế giới|số 1 việt nam|100% hiệu quả/i.test(toan)) loi.push('lời hứa kết quả / từ tuyệt đối');
  return loi;
}

/* Phiếu giao: phần của MỘT cấp + MỘT chặng, cắt ở máy chủ. Không có credit,
   không có cột Coach hỗ trợ, không có năm sao hay câu hỏi chẩn đoán. */
export function phieuKhach(r, so, chang) {
  const x = r.cap[so - 1];
  const p = {
    ma: r.id, ten: r.ten, tenViec: r.tenViec, ketQua: r.ketQua, cap: so, tenCap: x.ten, traiNghiem: x.traiNghiem,
    chang, tenChang: TEN_CHANG[chang], phanGiao: r.chang[chang].phanGiao, dieuKienChang: r.chang[chang].dieuKien,
    nangLuc: x.nangLuc, mucTieu: x.mucTieu, nhiemVu: x.nhiemVu, huongDan: x.huongDan, gocTuDuy: x.gocTuDuy,
    cauDaoSau: x.cauDaoSau, baiHoc: x.baiHoc, ungDung: x.ungDung, chuanDat: x.chuanDat, bangChung: x.bangChung,
    baMuc: r.baMuc, phucHoi: r.phucHoi, anToan: r.kyThuat.anToan, video: r.video, ddd: r.ddd,
    phanVai: r.phanVai, canhBao: r.canhBao
  };
  if (chang === 'thucHanh7') p.lich7 = r.lich7;
  return p;
}

/* ═══════════ BẢNG ═══════════ */
let daDung = false;
async function taoBang(db) {
  if (daDung) return;
  await db.prepare('CREATE TABLE IF NOT EXISTS khoNhiemVu (ma TEXT PRIMARY KEY, doiTuong TEXT NOT NULL, o TEXT NOT NULL, tang INTEGER, ' +
    'traiNghiem INTEGER NOT NULL DEFAULT 0, stt INTEGER NOT NULL, ten TEXT NOT NULL, noiDung TEXT NOT NULL, ban TEXT, napLuc INTEGER NOT NULL)').run();
  await db.prepare('CREATE INDEX IF NOT EXISTS ix_knv_loc ON khoNhiemVu (o, stt)').run();
  /* Gán danh mục cho nhân sự — dòng mới nhất của (người, mã) quyết; bỏ gán là
     một dòng bo=1, không xoá, để còn trả lời "hôm ấy ai được đọc gì". */
  await db.prepare('CREATE TABLE IF NOT EXISTS ganNhiemVu (id TEXT PRIMARY KEY, maNguoi TEXT NOT NULL, ma TEXT NOT NULL, bo INTEGER NOT NULL DEFAULT 0, ' +
    'boiAi TEXT NOT NULL, luc INTEGER NOT NULL)').run();
  await db.prepare('CREATE INDEX IF NOT EXISTS ix_gnv_nguoi ON ganNhiemVu (maNguoi, ma, luc)').run();
  /* Phiếu đã giao: giữ nguyên NỘI DUNG lúc giao (phieu) để nghiệm thu đúng
     tiêu chí tại thời điểm giao, kể cả khi kho được nạp bản mới. */
  await db.prepare('CREATE TABLE IF NOT EXISTS phieuNhiemVu (id TEXT PRIMARY KEY, doiTuong TEXT NOT NULL, loaiDoiTuong TEXT NOT NULL, ma TEXT NOT NULL, ' +
    'cap INTEGER NOT NULL, chang TEXT NOT NULL, chuKy TEXT NOT NULL, phieu TEXT NOT NULL, phanLoai TEXT, ban TEXT, boiAi TEXT NOT NULL, luc INTEGER NOT NULL)').run();
  await db.prepare('CREATE INDEX IF NOT EXISTS ix_pnv_dt ON phieuNhiemVu (doiTuong, luc)').run();
  await db.prepare('CREATE TABLE IF NOT EXISTS nopNhiemVu (id TEXT PRIMARY KEY, phieu TEXT NOT NULL, noiDung TEXT NOT NULL, boiAi TEXT NOT NULL, luc INTEGER NOT NULL)').run();
  await db.prepare('CREATE INDEX IF NOT EXISTS ix_nnv_p ON nopNhiemVu (phieu, luc)').run();
  await db.prepare('CREATE TABLE IF NOT EXISTS nghiemThuNV (id TEXT PRIMARY KEY, phieu TEXT NOT NULL, ketQua TEXT NOT NULL, ghiChu TEXT NOT NULL, ' +
    'boiAi TEXT NOT NULL, luc INTEGER NOT NULL)').run();
  await db.prepare('CREATE INDEX IF NOT EXISTS ix_ntnv_p ON nghiemThuNV (phieu, luc)').run();
  await db.prepare('CREATE TABLE IF NOT EXISTS soCreditNV (id TEXT PRIMARY KEY, doiTuong TEXT NOT NULL, ma TEXT NOT NULL, cap INTEGER NOT NULL, ' +
    'chuKy TEXT NOT NULL, so INTEGER NOT NULL, phieu TEXT NOT NULL, boiAi TEXT NOT NULL, luc INTEGER NOT NULL)').run();
  await db.prepare('CREATE UNIQUE INDEX IF NOT EXISTS ux_scnv ON soCreditNV (doiTuong, ma, cap, chuKy)').run();
  daDung = true;
}
const sttCua = m => (Object.keys(O_NHA).indexOf(m[1]) + 1) * 100 + Number(m[2]);

/* ═══════════ NẠP ═══════════ */
export async function napKhoNhiemVu(y, env, db, hoSo) {
  if (BAC[roleOf(hoSo)] !== 1) return { ok: false, code: 'NOPERM', error: 'Chỉ Super Admin nạp kho nhiệm vụ.' };
  const x = y || {}, ds = Array.isArray(x.ds) ? x.ds : [];
  if (!ds.length || ds.length > TRAN_LO) return { ok: false, code: 'SAI', error: 'Mỗi lượt nạp từ 1 đến ' + TRAN_LO + ' nhiệm vụ.' };
  const hong = [];
  ds.forEach(r => { const l = soatNhiemVu(r); if (l.length) hong.push((r && r.id || '?') + ': ' + l.slice(0, 8).join(', ')); });
  if (hong.length) return { ok: false, code: 'HONG', hong: hong.slice(0, 20), error: hong.length + ' nhiệm vụ không qua soát — không nạp bản nào trong lô này.' };
  await taoBang(db);
  const ban = sach(x.ban, 40) || null, luc = Date.now();
  await db.batch(ds.map(r => {
    const m = MA_NV.exec(r.id);
    return db.prepare('INSERT INTO khoNhiemVu (ma, doiTuong, o, tang, traiNghiem, stt, ten, noiDung, ban, napLuc) VALUES (?,?,?,?,?,?,?,?,?,?) ' +
      'ON CONFLICT(ma) DO UPDATE SET doiTuong=excluded.doiTuong, o=excluded.o, tang=excluded.tang, traiNghiem=excluded.traiNghiem, ' +
      'stt=excluded.stt, ten=excluded.ten, noiDung=excluded.noiDung, ban=excluded.ban, napLuc=excluded.napLuc')
      .bind(r.id, r.doiTuong, m[1], r.doiTuong === 'nha' ? r.tang : null, r.traiNghiem ? 1 : 0, sttCua(m), sach(r.ten, 140), JSON.stringify(r), ban, luc);
  }));
  const tong = await db.prepare('SELECT doiTuong, COUNT(*) n FROM khoNhiemVu GROUP BY doiTuong').all();
  const dem = { nha: 0, nhanSu: 0 };
  (tong.results || []).forEach(t => { if (dem[t.doiTuong] != null) dem[t.doiTuong] = Number(t.n); });
  try { await Kho.ghiNhatKy(db, { uid: hoSo.uid, username: ten(hoSo), viec: 'NAP_KHO_NHIEM_VU', doiTuong: ban || '', chiTiet: ds.length + ' nhiệm vụ · nhà ' + dem.nha + ' · nhân sự ' + dem.nhanSu }); } catch (e) {}
  return { ok: true, nap: ds.length, dem };
}

/* ═══════════ QUYỀN CỦA NHÂN SỰ ═══════════ */
async function tranCua(db, hoSo) {
  const vai = roleOf(hoSo);
  let t = TRAN_VAI[vai];
  if (!t) return null;
  if (vai === 'R11') {
    const minh = String(ten(hoSo) || '').toLowerCase();
    const cc = await db.prepare("SELECT loai FROM dtChungChi WHERE maNguoi = ? AND ct = 'tuvan' ORDER BY ghiLuc DESC, rowid DESC LIMIT 1").bind(minh).first().catch(() => null);
    if (!cc || cc.loai !== 'cap') t = TRAN_TAP_SU;
  }
  return t;
}
async function soHoatDong(db) {
  return Number((await db.prepare('SELECT COUNT(*) n FROM khoNhiemVu').first()).n) || 0;
}
/* Danh mục đang được gán: dòng mới nhất mỗi mã, bo=0. */
async function maDuocGan(db, maNguoi) {
  const r = (await db.prepare('SELECT ma, bo FROM ganNhiemVu WHERE maNguoi = ? ORDER BY luc ASC, rowid ASC').bind(maNguoi).all()).results || [];
  const cuoi = {};
  r.forEach(x => { cuoi[x.ma] = Number(x.bo); });
  return new Set(Object.keys(cuoi).filter(k => cuoi[k] === 0));
}
export async function quyenDocNhanSu(db, hoSo) {
  const t = await tranCua(db, hoSo);
  if (!t) return { ok: false };
  if (t.toanKho) return { ok: true, toanKho: true, capToi: t.capToi, ten: t.ten };
  const tong = await soHoatDong(db);
  const gan = await maDuocGan(db, String(ten(hoSo) || '').toLowerCase());
  return { ok: true, toanKho: false, capToi: t.capToi, ten: t.ten, pct: t.pct, tran: Math.floor(tong * t.pct / 100), gan };
}

/* GÁN DANH MỤC — chỉ R01 · R04 · R05; vượt trần thì không gán thêm. */
export async function ganNhiemVu(y, env, db, hoSo) {
  if ((BAC[roleOf(hoSo)] || 99) > LV_GAN || BAC[roleOf(hoSo)] === 2 || BAC[roleOf(hoSo)] === 3)
    return { ok: false, code: 'NOPERM', error: 'Gán danh mục nhiệm vụ dành cho Super Admin và Trưởng chuyên môn.' };
  const x = y || {};
  const uid = await Kho.layUid(db, x.maNguoi);
  const nd = uid && await Kho.nguoiTheoId(db, uid);
  if (!nd || !Number(nd.active) || nd.deletedAt) return { ok: false, code: 'KHONGNGUOI', error: 'Không tra được nhân sự này.' };
  const maNguoi = String(nd.username || '').toLowerCase();
  const t = await tranCua(db, { role: nd.role, u: nd.username });
  if (!t) return { ok: false, code: 'NGOAIVAI', error: 'Vai ' + nd.role + ' không có quyền đọc kho nhiệm vụ.' };
  if (t.toanKho) return { ok: false, code: 'TOANKHO', error: 'Vai này đã đọc toàn kho, không cần gán.' };
  const ds = (Array.isArray(x.ma) ? x.ma : [x.ma]).map(m => String(m || '')).filter(m => MA_NV.test(m));
  if (!ds.length) return { ok: false, code: 'SAI', error: 'Không có mã nhiệm vụ hợp lệ.' };
  await taoBang(db);
  const bo = x.bo === true;
  if (!bo) {
    const coThat = (await db.prepare('SELECT ma FROM khoNhiemVu WHERE ma IN (' + ds.map(() => '?').join(',') + ')').bind(...ds).all()).results || [];
    if (coThat.length !== ds.length) return { ok: false, code: 'KHONGCO', error: 'Có mã chưa nạp vào kho.' };
    const gan = await maDuocGan(db, maNguoi);
    ds.forEach(m => gan.add(m));
    const tran = Math.floor((await soHoatDong(db)) * t.pct / 100);
    if (gan.size > tran) return { ok: false, code: 'VUOTTRAN', error: t.ten + ' được gán tối đa ' + t.pct + '% kho = ' + tran + ' nhiệm vụ; gán thêm sẽ thành ' + gan.size + '.' };
  }
  const luc = Date.now();
  await db.batch(ds.map(m => db.prepare('INSERT INTO ganNhiemVu (id, maNguoi, ma, bo, boiAi, luc) VALUES (?,?,?,?,?,?)')
    .bind(crypto.randomUUID(), maNguoi, m, bo ? 1 : 0, ten(hoSo), luc)));
  try { await Kho.ghiNhatKy(db, { uid: hoSo.uid, username: ten(hoSo), viec: bo ? 'BO_GAN_NV' : 'GAN_NV', doiTuong: maNguoi, chiTiet: ds.join(',').slice(0, 300) }); } catch (e) {}
  return { ok: true, maNguoi, so: ds.length, bo };
}

/* DANH SÁCH — tên, nhóm, tầng; không nội dung. Nhân sự thấy mã nào đọc được. */
export async function dsKhoNhiemVu(y, env, db, hoSo) {
  const q = await quyenDocNhanSu(db, hoSo);
  if (!q.ok) return { ok: false, code: 'NOPERM', error: 'Kho nhiệm vụ nội bộ không mở cho vai này.' };
  await taoBang(db);
  const x = y || {};
  let sql = 'SELECT ma, doiTuong, o, tang, traiNghiem, ten FROM khoNhiemVu'; const b = [];
  if (O_NHA[String(x.o || '')]) { sql += ' WHERE o = ?'; b.push(x.o); }
  sql += ' ORDER BY stt ASC';
  const rows = (await db.prepare(sql).bind(...b).all()).results || [];
  return { ok: true, quyen: { toanKho: q.toanKho, capToi: q.capToi, ten: q.ten, pct: q.pct, tran: q.tran, daGan: q.gan ? q.gan.size : undefined },
    oNha: O_NHA,
    ds: rows.map(r => ({ ma: r.ma, doiTuong: r.doiTuong, o: r.o, tang: r.tang || undefined, traiNghiem: r.traiNghiem ? true : undefined, ten: r.ten,
      khoa: !q.toanKho && !q.gan.has(r.ma) })) };
}

/* ĐỌC HỒ SƠ CHỦ — chỉ nhân sự, đúng trần; cấp vượt capToi bị cắt khỏi bản trả. */
export async function docNhiemVu(y, env, db, hoSo) {
  const ma = String((y || {}).ma || '');
  if (!MA_NV.test(ma)) return { ok: false, code: 'SAI', error: 'Mã nhiệm vụ không hợp lệ.' };
  const q = await quyenDocNhanSu(db, hoSo);
  if (!q.ok) return { ok: false, code: 'NOPERM', error: 'Hồ sơ nhiệm vụ nội bộ không mở cho vai này.' };
  if (!q.toanKho && !q.gan.has(ma)) return { ok: false, code: 'CHUAGAN', error: 'Nhiệm vụ này chưa được gán cho anh/chị (trần ' + q.pct + '% kho). Xin Trưởng chuyên môn gán.' };
  await taoBang(db);
  const r = await db.prepare('SELECT noiDung FROM khoNhiemVu WHERE ma = ?').bind(ma).first();
  if (!r) return { ok: false, code: 'KHONGCO', error: 'Kho chưa có nhiệm vụ này — Super Admin chưa nạp gói.' };
  const nv = JSON.parse(r.noiDung);
  const catBot = nv.cap.length > q.capToi;
  nv.cap = nv.cap.slice(0, q.capToi);
  try { await Kho.ghiNhatKy(db, { uid: hoSo.uid, username: ten(hoSo), viec: 'DOC_NV', doiTuong: ma, chiTiet: 'cấp 1–' + q.capToi }); } catch (e) {}
  return { ok: true, nv, capToi: q.capToi, catBot: catBot || undefined };
}

/* ═══════════ GIAO PHIẾU ═══════════
   Đối tượng nhận: một NHÀ (nhiệm vụ KH) hoặc một NHÂN SỰ (nhiệm vụ NS).
   Người giao: với nhà — người phụ trách nhà ấy (coach, tư vấn ghi ở hồ sơ)
   hoặc quản lý R01–R05; với nhân sự — R01–R05. Người giao phải ĐỌC ĐƯỢC
   nhiệm vụ ấy ở cấp ấy: không giao thứ mình chưa được cấp quyền đọc. */
async function vaiVoiNhaNV(db, hoSo, maNha) {
  const v = await vaiVoiNha(db, hoSo, maNha);
  if (v === 'ql' || v === 'coach') return v;
  if (BAC[roleOf(hoSo)] === 11 && maNha) {
    const h = await db.prepare('SELECT tuVan FROM hoSoKhach WHERE maKhachHang = ?').bind(maNha).first();
    const tv = String((h && h.tuVan) || '').trim().toLowerCase();
    if (tv && tv === String(ten(hoSo) || '').trim().toLowerCase()) return 'tuvan';
  }
  return '';
}
const chuKyMac = () => new Date(Date.now() + 7 * 3600000).toISOString().slice(0, 4);
async function ketQuaCuoi(db, phieuId) {
  return await db.prepare('SELECT ketQua, ghiChu, boiAi, luc FROM nghiemThuNV WHERE phieu = ? ORDER BY luc DESC, rowid DESC LIMIT 1').bind(phieuId).first();
}
async function datCapTruoc(db, doiTuong, ma, cap, chuKy) {
  const ds = (await db.prepare('SELECT id FROM phieuNhiemVu WHERE doiTuong = ? AND ma = ? AND cap = ? AND chuKy = ?').bind(doiTuong, ma, cap, chuKy).all()).results || [];
  for (const p of ds) { const k = await ketQuaCuoi(db, p.id); if (k && k.ketQua === 'dat') return true; }
  return false;
}

export async function giaoPhieuNhiemVu(y, env, db, hoSo) {
  const x = y || {};
  const ma = String(x.ma || ''), so = Number(x.cap), chang = String(x.chang || '');
  const m = MA_NV.exec(ma);
  if (!m) return { ok: false, code: 'SAI', error: 'Mã nhiệm vụ không hợp lệ.' };
  if (!Number.isInteger(so) || so < 1 || so > SO_CAP) return { ok: false, code: 'SAI', error: 'Cấp từ 1 đến 10.' };
  if (!CHANG.includes(chang)) return { ok: false, code: 'SAI', error: 'Chặng: khoiTao · thucHanh7 · duyTri21 · lamChu90.' };
  const q = await quyenDocNhanSu(db, hoSo);
  if (!q.ok) return { ok: false, code: 'NOPERM', error: 'Giao nhiệm vụ dành cho nhân sự có quyền đọc kho.' };
  if (!q.toanKho && !q.gan.has(ma)) return { ok: false, code: 'CHUAGAN', error: 'Anh/chị chưa được gán nhiệm vụ này nên chưa giao được.' };
  if (so > q.capToi) return { ok: false, code: 'VUOTCAP', error: 'Vai ' + q.ten + ' giao tới cấp ' + q.capToi + '. Cấp ' + so + ' cần người cấp cao hơn.' };
  await taoBang(db);
  const r = await db.prepare('SELECT noiDung, ban FROM khoNhiemVu WHERE ma = ?').bind(ma).first();
  if (!r) return { ok: false, code: 'KHONGCO', error: 'Kho chưa có nhiệm vụ này.' };
  const nv = JSON.parse(r.noiDung);
  const chuKy = /^\d{4}$/.test(String(x.chuKy || '')) ? String(x.chuKy) : chuKyMac();
  let doiTuong, loaiDoiTuong;
  if (nv.doiTuong === 'nha') {
    const maNha = sach(x.maNha, 40);
    if (!maNha || !(await nhaCoThat(db, maNha))) return { ok: false, code: 'KHONGNHA', error: 'Không có nhà mang mã này.' };
    if (!(await vaiVoiNhaNV(db, hoSo, maNha))) return { ok: false, code: 'NOPERM_NHA', error: 'Anh/chị không phụ trách nhà này.' };
    const tang = await tangCuaNha(db, maNha);
    if (tang <= 2) {
      if (!nv.traiNghiem) return { ok: false, code: 'NGOAITRAINGHIEM', error: 'Nhà tầng ' + tang + ' chỉ nhận nhiệm vụ trải nghiệm cơ bản. Cẩm nang đầy đủ mở từ tầng 3.' };
      if (so > CAP_TRAI_NGHIEM) return { ok: false, code: 'VUOTTRAINGHIEM', error: 'Nhà tầng ' + tang + ' nhận tới cấp ' + CAP_TRAI_NGHIEM + '. Các cấp sâu hơn mở từ tầng 3.' };
      const daNhan = (await db.prepare('SELECT DISTINCT ma FROM phieuNhiemVu WHERE doiTuong = ?').bind(maNha).all()).results || [];
      const maDaNhan = new Set(daNhan.map(z => z.ma));
      if (!maDaNhan.has(ma) && maDaNhan.size >= TRAN_TRAI_NGHIEM)
        return { ok: false, code: 'DUTRAINGHIEM', error: 'Nhà tầng ' + tang + ' đã nhận đủ ' + TRAN_TRAI_NGHIEM + ' nhiệm vụ trải nghiệm. Muốn đi sâu hơn thì lên tầng 3.' };
    } else if (nv.tang > tang) return { ok: false, code: 'VUOTTANG', error: 'Nhiệm vụ tầng ' + nv.tang + ' chỉ giao cho nhà từ tầng ' + nv.tang + ' (nhà này tầng ' + tang + ').' };
    doiTuong = maNha; loaiDoiTuong = 'nha';
  } else {
    if ((BAC[roleOf(hoSo)] || 99) > 5) return { ok: false, code: 'NOPERM', error: 'Giao nhiệm vụ nội bộ cho nhân sự dành cho R01–R05.' };
    const uid = await Kho.layUid(db, x.maNguoi);
    const nd = uid && await Kho.nguoiTheoId(db, uid);
    if (!nd || !Number(nd.active) || nd.deletedAt || !((BAC[nd.role] || 99) <= 12)) return { ok: false, code: 'KHONGNGUOI', error: 'Không tra được nhân sự này.' };
    doiTuong = String(nd.username || '').toLowerCase(); loaiDoiTuong = 'nhanSu';
  }
  /* Lên cấp có điều kiện: cấp n cần cấp n−1 đạt trong cùng chu kỳ, hoặc ghi
     kết quả buổi phân loại ban đầu khi bắt đầu ở cấp > 1. */
  const phanLoai = sach(x.phanLoai, 600);
  const coPhieuTruoc = await db.prepare('SELECT 1 x FROM phieuNhiemVu WHERE doiTuong = ? AND ma = ? AND chuKy = ? LIMIT 1').bind(doiTuong, ma, chuKy).first();
  if (so > 1 && !(await datCapTruoc(db, doiTuong, ma, so - 1, chuKy))) {
    if (coPhieuTruoc) return { ok: false, code: 'CHUADATCAPTRUOC', error: 'Cấp ' + (so - 1) + ' chưa nghiệm thu đạt. Chỉ tăng phạm vi khi đã làm đúng.' };
    if (phanLoai.length < 40) return { ok: false, code: 'THIEUPHANLOAI', error: 'Bắt đầu ở cấp ' + so + ' cần ghi kết quả buổi phân loại ban đầu (từ 40 ký tự): phần làm được độc lập, phần cần gợi ý, phần cần làm mẫu.' };
    const sp = soatRaNgoai(phanLoai);
    if (!sp.sach) return { ok: false, code: 'DULIEUNGUOI', error: 'Ghi chú phân loại có dấu hiệu dữ liệu nhận dạng (' + (sp.ngo || []).map(d => d.ma).join(', ') + '). Viết lại không tên, không số điện thoại.' };
  }
  const phieu = phieuKhach(nv, so, chang);
  const id = crypto.randomUUID();
  await db.prepare('INSERT INTO phieuNhiemVu (id, doiTuong, loaiDoiTuong, ma, cap, chang, chuKy, phieu, phanLoai, ban, boiAi, luc) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)')
    .bind(id, doiTuong, loaiDoiTuong, ma, so, chang, chuKy, JSON.stringify(phieu), phanLoai || null, r.ban || null, ten(hoSo), Date.now()).run();
  try { await Kho.ghiNhatKy(db, { uid: hoSo.uid, username: ten(hoSo), viec: 'GIAO_NV', doiTuong, chiTiet: ma + ' · cấp ' + so + ' · ' + chang }); } catch (e) {}
  return { ok: true, id, doiTuong, ma, cap: so, chang };
}

/* PHIẾU CỦA TÔI — nhà (R13/R14 của nhà) hoặc nhân sự đọc đúng phiếu đã giao
   cho mình. Người phụ trách đọc phiếu của nhà mình phụ trách. */
export async function phieuCuaToi(y, env, db, hoSo) {
  await taoBang(db);
  const x = y || {}, lv = BAC[roleOf(hoSo)] || 99;
  let doiTuong;
  if (lv >= 13) {
    if (lv === 15) return { ok: false, code: 'NOPERM', error: 'Phiếu nhiệm vụ dành cho gia đình đang đồng hành.' };
    doiTuong = await maNhaCuaToi(db, hoSo);
    if (!doiTuong) return { ok: true, ds: [], tang: 0 };
  } else if (x.maNha) {
    const maNha = sach(x.maNha, 40);
    if (!(await vaiVoiNhaNV(db, hoSo, maNha))) return { ok: false, code: 'NOPERM_NHA', error: 'Anh/chị không phụ trách nhà này.' };
    doiTuong = maNha;
  } else doiTuong = String(ten(hoSo) || '').toLowerCase();
  const rows = (await db.prepare('SELECT id, ma, cap, chang, chuKy, phieu, boiAi, luc FROM phieuNhiemVu WHERE doiTuong = ? ORDER BY luc DESC, rowid DESC LIMIT 200').bind(doiTuong).all()).results || [];
  const ds = [];
  for (const p of rows) {
    const k = await ketQuaCuoi(db, p.id);
    const n = await db.prepare('SELECT COUNT(*) n FROM nopNhiemVu WHERE phieu = ?').bind(p.id).first();
    ds.push({ id: p.id, ma: p.ma, cap: p.cap, chang: p.chang, chuKy: p.chuKy, boiAi: p.boiAi, luc: p.luc, phieu: JSON.parse(p.phieu),
      soNop: Number(n.n) || 0, nghiemThu: k ? { ketQua: k.ketQua, ghiChu: k.ghiChu, boiAi: k.boiAi, luc: k.luc } : undefined });
  }
  const tang = lv >= 13 ? await tangCuaNha(db, doiTuong) : undefined;
  return { ok: true, doiTuong, tang, tranTraiNghiem: tang && tang <= 2 ? TRAN_TRAI_NGHIEM : undefined, ds };
}

/* NỘP BẰNG CHỨNG — chữ; đi qua cổng Điều 13 trước khi lưu. */
export async function nopNhiemVu(y, env, db, hoSo) {
  await taoBang(db);
  const x = y || {};
  const p = await db.prepare('SELECT id, doiTuong, loaiDoiTuong FROM phieuNhiemVu WHERE id = ?').bind(String(x.phieu || '')).first();
  if (!p) return { ok: false, code: 'KHONGCO', error: 'Không có phiếu này.' };
  const lv = BAC[roleOf(hoSo)] || 99;
  const cuaMinh = p.loaiDoiTuong === 'nha' ? (lv >= 13 && lv <= 14 && (await maNhaCuaToi(db, hoSo)) === p.doiTuong)
    : p.doiTuong === String(ten(hoSo) || '').toLowerCase();
  if (!cuaMinh) return { ok: false, code: 'NOPERM', error: 'Chỉ người nhận phiếu nộp bằng chứng cho phiếu ấy.' };
  const k = await ketQuaCuoi(db, p.id);
  if (k && k.ketQua === 'dat') return { ok: false, code: 'DADAT', error: 'Phiếu đã nghiệm thu đạt.' };
  const nd = sach(x.noiDung, 3000);
  if (nd.length < 40) return { ok: false, code: 'THIEUCAU', error: 'Bằng chứng viết từ 40 ký tự: đã làm gì, số đo, một khó khăn và cách sửa. Ảnh, video giữ tại nhà.' };
  const s = soatRaNgoai(nd);
  if (!s.sach) return { ok: false, code: 'DULIEUNGUOI', error: 'Bằng chứng có dấu hiệu dữ liệu nhận dạng (' + (s.ngo || []).map(d => d.ma).join(', ') + '). Viết lại không ghi tên con, số điện thoại hay địa chỉ.' };
  await db.prepare('INSERT INTO nopNhiemVu (id, phieu, noiDung, boiAi, luc) VALUES (?,?,?,?,?)').bind(crypto.randomUUID(), p.id, nd, ten(hoSo), Date.now()).run();
  return { ok: true };
}

/* NGHIỆM THU — người giao hoặc người phụ trách / quản lý; không tự nghiệm thu
   phiếu của chính mình. Đạt thì ghi credit nghiệp vụ một lần. */
export async function nghiemThuNhiemVu(y, env, db, hoSo) {
  await taoBang(db);
  const x = y || {};
  const p = await db.prepare('SELECT * FROM phieuNhiemVu WHERE id = ?').bind(String(x.phieu || '')).first();
  if (!p) return { ok: false, code: 'KHONGCO', error: 'Không có phiếu này.' };
  const lv = BAC[roleOf(hoSo)] || 99;
  if (lv > 12) return { ok: false, code: 'NOPERM', error: 'Nghiệm thu dành cho người phụ trách.' };
  const minh = String(ten(hoSo) || '').toLowerCase();
  if (p.loaiDoiTuong === 'nhanSu' && p.doiTuong === minh) return { ok: false, code: 'TUNGHIEMTHU', error: 'Không tự nghiệm thu phiếu của chính mình.' };
  const duoc = String(p.boiAi || '').toLowerCase() === minh || lv <= 5 ||
    (p.loaiDoiTuong === 'nha' && !!(await vaiVoiNhaNV(db, hoSo, p.doiTuong)));
  if (!duoc) return { ok: false, code: 'NOPERM', error: 'Anh/chị không phụ trách phiếu này.' };
  const kq = String(x.ketQua || '');
  if (!KET_QUA.includes(kq)) return { ok: false, code: 'SAI', error: 'Kết quả: dat · boSung · lamLai.' };
  const ghi = sach(x.ghiChu, 1000);
  if (ghi.length < 30) return { ok: false, code: 'THIEUCAU', error: 'Ghi chú nghiệm thu từ 30 ký tự: tiêu chí đã đạt, tiêu chí còn thiếu, ngày kiểm lại.' };
  if (!soatRaNgoai(ghi).sach) return { ok: false, code: 'DULIEUNGUOI', error: 'Ghi chú có dấu hiệu dữ liệu nhận dạng — viết lại không tên, không số điện thoại.' };
  const cuoi = await ketQuaCuoi(db, p.id);
  if (cuoi && cuoi.ketQua === 'dat') return { ok: false, code: 'DADAT', error: 'Phiếu đã nghiệm thu đạt.' };
  const coNop = await db.prepare('SELECT 1 x FROM nopNhiemVu WHERE phieu = ? LIMIT 1').bind(p.id).first();
  if (kq === 'dat' && !coNop && ghi.length < 80) return { ok: false, code: 'CHUANOP', error: 'Chưa có bằng chứng nộp lên. Nghiệm thu đạt bằng quan sát trực tiếp thì ghi rõ đã quan sát gì (từ 80 ký tự).' };
  const luc = Date.now();
  const lenh = [db.prepare('INSERT INTO nghiemThuNV (id, phieu, ketQua, ghiChu, boiAi, luc) VALUES (?,?,?,?,?,?)').bind(crypto.randomUUID(), p.id, kq, ghi, ten(hoSo), luc)];
  if (kq === 'dat') lenh.push(db.prepare('INSERT INTO soCreditNV (id, doiTuong, ma, cap, chuKy, so, phieu, boiAi, luc) VALUES (?,?,?,?,?,?,?,?,?) ' +
    'ON CONFLICT(doiTuong, ma, cap, chuKy) DO NOTHING').bind(crypto.randomUUID(), p.doiTuong, p.ma, p.cap, p.chuKy, CREDIT_CAP(p.cap), p.id, ten(hoSo), luc));
  await db.batch(lenh);
  try { await Kho.ghiNhatKy(db, { uid: hoSo.uid, username: ten(hoSo), viec: 'NGHIEM_THU_NV', doiTuong: p.doiTuong, chiTiet: p.ma + ' · cấp ' + p.cap + ' · ' + kq }); } catch (e) {}
  return { ok: true, ketQua: kq, credit: kq === 'dat' ? CREDIT_CAP(p.cap) : 0 };
}

/* SỔ CREDIT NGHIỆP VỤ của một đối tượng — chính mình, hoặc người phụ trách. */
export async function soCreditNhiemVu(y, env, db, hoSo) {
  await taoBang(db);
  const x = y || {}, lv = BAC[roleOf(hoSo)] || 99;
  let doiTuong;
  if (lv >= 13) doiTuong = await maNhaCuaToi(db, hoSo);
  else if (x.maNha) {
    if (!(await vaiVoiNhaNV(db, hoSo, sach(x.maNha, 40)))) return { ok: false, code: 'NOPERM_NHA', error: 'Anh/chị không phụ trách nhà này.' };
    doiTuong = sach(x.maNha, 40);
  } else doiTuong = String(ten(hoSo) || '').toLowerCase();
  if (!doiTuong) return { ok: true, tong: 0, ds: [] };
  const ds = (await db.prepare('SELECT ma, cap, chuKy, so, luc FROM soCreditNV WHERE doiTuong = ? ORDER BY luc ASC, rowid ASC').bind(doiTuong).all()).results || [];
  return { ok: true, doiTuong, tong: ds.reduce((s, r) => s + Number(r.so), 0), ds, luu: 'Credit nghiệp vụ ghi nhận năng lực đã nghiệm thu — không phải tiền, không trừ vào ví.' };
}

/* ═══════════════════════════════════════════════════════════════
   CẨM NANG BA CẤP SOẠN CHO MỖI Ô BẢN ĐỒ
   Chủ hệ: "3 cấp độ soạn khác nhau:
     Cấp 1 — thực hành cơ bản, dễ hiểu, dễ áp dụng cho khách hàng;
     Cấp 2 — chi tiết bài bản cho Tư vấn, một bản ứng dụng cho nhiều khách;
     Cấp 3 — chuyên gia Coach: biến từng key trên bản đồ thành một chuỗi giải
     pháp chữa lành – gắn kết – khai mở – định hướng – nâng tầm cho nhân sự
     và khách hàng, cao cấp gấp 10–20 lần cấp khách hàng, tư vấn. Full từ lý
     thuyết – thực hành – biểu mẫu – lộ trình – từng bước triển khai – tư duy
     khác biệt – nguyên lý 20/80 – Mô thức huấn luyện GITA."
   "Toàn bộ tài liệu này được chuyển vào kho coach."

   Ba cấp là ba CÁNH CỬA ở máy chủ, không phải ba ngăn trên màn:
   | cấp | ai đọc                                | đường tới khách          |
   |-----|---------------------------------------|--------------------------|
   | 1   | nhân sự R01–R12 (để trao cho nhà)     | người phụ trách TRAO cho |
   |     |                                       | từng nhà (giaoCamNang)   |
   | 2   | Tư vấn và dòng Coach (R01 · R04–R11)  | không                    |
   | 3   | kho Coach (R01 · R04–R07)             | không                    |
   Cấp 3 phải dài ít nhất 10 lần cấp 1 — đo bằng ký tự, không đo bằng lời
   khai "chuyên sâu". Chuỗi năm giai đoạn đủ năm, không gộp.
   ═══════════════════════════════════════════════════════════════ */
export const CHUOI5 = Object.freeze(['chuaLanh', 'ganKet', 'khaiMo', 'dinhHuong', 'nangTam']);
export const TEN_CHUOI5 = Object.freeze({ chuaLanh: 'Chữa lành', ganKet: 'Gắn kết', khaiMo: 'Khai mở', dinhHuong: 'Định hướng', nangTam: 'Nâng tầm' });
export const DOC_CAP_CN = Object.freeze({ 1: lv => lv >= 1 && lv <= 12, 2: lv => lv === 1 || (lv >= 4 && lv <= 11), 3: lv => lv === 1 || (lv >= 4 && lv <= 7) });
export const HE_SO_CAP3 = 10;
const MA_CN = /^CN-(MAI|P[1-8]|CUA|NEN|B(?:0[1-9]|10))$/;

export function soatCamNang(r) {
  const loi = [];
  if (!r || typeof r !== 'object') return ['không phải bản ghi'];
  const m = MA_CN.exec(r.id || '');
  if (!m) loi.push('id (CN-<ô>)');
  else if (r.ten !== O_NHA[m[1]].ten) loi.push('ten phải đúng tên ô: ' + O_NHA[m[1]].ten);
  const a = r.cap1 || {}, b = r.cap2 || {}, c = r.cap3 || {};
  /* Cấp 1 — khách hàng */
  [['loiMo', 120], ['viSao', 200], ['khiNaoHoi', 80], ['buocDauTien', 80]].forEach(([k, l]) => { if (!dai(a[k], l)) loi.push('cap1.' + k); });
  if (!Array.isArray(a.baViec) || a.baViec.length !== 3 || !a.baViec.every(v => v && dai(v.viec, 15) && dai(v.cachLam, 60) && dai(v.dauHieu, 20))) loi.push('cap1.baViec (đúng 3: viec · cachLam · dauHieu)');
  if (!Array.isArray(a.phieu7) || a.phieu7.length !== 7 || !a.phieu7.every(d => dai(d, 20))) loi.push('cap1.phieu7 (7 ngày)');
  if (!dsChu(a.cauHoiNha, 3, 8, 15)) loi.push('cap1.cauHoiNha (3–8)');
  if (!dsChu(a.dauHieuTienBo, 3, 8, 15)) loi.push('cap1.dauHieuTienBo (3–8)');
  if (!dsChu(a.dungLam, 3, 8, 15)) loi.push('cap1.dungLam (3–8 điều tránh)');
  /* Cấp 2 — tư vấn */
  [['mucTieuNghiepVu', 200], ['chuanDat', 200], ['khiChuyenCoach', 120], ['nguyenLy2080', 200]].forEach(([k, l]) => { if (!dai(b[k], l)) loi.push('cap2.' + k); });
  const cd = b.chanDoan || {};
  if (!dsChu(cd.dauHieu, 5, 15, 20) || !dsChu(cd.cauHoi, 6, 20, 15) || !dai(cd.ngheGi, 120)) loi.push('cap2.chanDoan (dauHieu ≥5 · cauHoi ≥6 · ngheGi)');
  const kb = b.kichBanBuoi || {};
  ['mo', 'khai', 'thongNhat', 'chot'].forEach(k => { if (!dai(kb[k], 150)) loi.push('cap2.kichBanBuoi.' + k); });
  if (!Array.isArray(b.bieuMau) || b.bieuMau.length < 3 || !b.bieuMau.every(f => f && dai(f.ten, 4) && dai(f.dung, 30) && dsChu(f.truong, 4, 20, 3))) loi.push('cap2.bieuMau (≥3: ten · dung · truong ≥4)');
  const lt = b.loTrinh || {};
  ['n7', 'n21', 'n90'].forEach(k => { if (!dai(lt[k], 150)) loi.push('cap2.loTrinh.' + k); });
  const cn = b.caNhanHoa || {};
  ['T1', 'T2', 'T3', 'T4', 'T5'].forEach(k => { if (!dai(cn[k], 60)) loi.push('cap2.caNhanHoa.' + k); });
  if (!Array.isArray(b.phanDoi) || b.phanDoi.length < 5 || !b.phanDoi.every(x => x && dai(x.cau, 10) && dai(x.dap, 80))) loi.push('cap2.phanDoi (≥5: cau · dap)');
  /* Cấp 3 — kho Coach */
  const ly = c.lyThuyet || {};
  if (!dai(ly.nguyenLy, 600) || !dsChu(ly.nenTang, 3, 12, 60) || !dai(ly.nguon, 60)) loi.push('cap3.lyThuyet (nguyenLy · nenTang ≥3 · nguon)');
  const ch = c.chuoi5 || {};
  CHUOI5.forEach(k => {
    const g = ch[k] || {}, p = 'cap3.chuoi5.' + k + '.';
    [['mucDich', 150], ['dauHieuVao', 100], ['bieuMau', 120], ['chuanRa', 100], ['bay', 100], ['voiNhanSu', 120]].forEach(([f, l]) => { if (!dai(g[f], l)) loi.push(p + f); });
    if (!dsChu(g.thucHanh, 5, 12, 40)) loi.push(p + 'thucHanh (5–12 bước)');
    if (!dsChu(g.cauHoiKhaiVan, 8, 20, 15)) loi.push(p + 'cauHoiKhaiVan (≥8)');
  });
  if (!dsChu(c.trienKhai, 10, 30, 40)) loi.push('cap3.trienKhai (≥10 bước)');
  const l90 = c.loTrinh90 || {};
  if (!Array.isArray(l90.tuan) || l90.tuan.length < 12 || !l90.tuan.every(t => dai(t, 40))) loi.push('cap3.loTrinh90.tuan (≥12 tuần)');
  if (!Array.isArray(c.tuDuyKhacBiet) || c.tuDuyKhacBiet.length < 5 || !c.tuDuyKhacBiet.every(t => t && dai(t.thuongNghi, 15) && dai(t.gitaNghi, 40) && dai(t.viSao, 40))) loi.push('cap3.tuDuyKhacBiet (≥5)');
  const n28 = c.nguyenLy2080 || {};
  if (!dsChu(n28.hai, 3, 6, 30) || !dai(n28.tamMuoi, 100) || !dai(n28.viSao, 150) || !dsChu(n28.boQua, 3, 8, 20)) loi.push('cap3.nguyenLy2080 (hai 3–6 · tamMuoi · viSao · boQua)');
  const mt = c.moThucGITA || {};
  ['G', 'I', 'T', 'A', 'c437'].forEach(k => { if (!dai(mt[k], 150)) loi.push('cap3.moThucGITA.' + k); });
  if (!Array.isArray(c.bieuMau) || c.bieuMau.length < 6 || !c.bieuMau.every(f => f && dai(f.ten, 4) && dai(f.dung, 30) && dsChu(f.truong, 5, 25, 3))) loi.push('cap3.bieuMau (≥6)');
  if (!Array.isArray(c.caMau) || c.caMau.length < 3 || !c.caMau.every(x => x && dai(x.boiCanh, 150) && dai(x.diBuoc, 300) && dai(x.ketQua, 80) && dai(x.baiHoc, 60))) loi.push('cap3.caMau (≥3)');
  if (!Array.isArray(c.saoChuyenGia) || c.saoChuyenGia.length !== 5 || !c.saoChuyenGia.every(s => s && dai(s.kyNang, 4) && dai(s.hanhVi, 40) && dai(s.chuaDat, 25))) loi.push('cap3.saoChuyenGia (5)');
  if (!dai(c.anToan, 200)) loi.push('cap3.anToan');
  const n1 = chuCua(a), n3 = chuCua(c);
  if (n1 && n3 < HE_SO_CAP3 * n1) loi.push('cap3 dài ' + n3 + ' < ' + HE_SO_CAP3 + ' × cap1 (' + n1 + ')');
  if (chuCua(b) < 3 * n1) loi.push('cap2 phải dài hơn cap1 ít nhất 3 lần');
  const toan = JSON.stringify(r);
  if (/(cam kết|đảm bảo|bảo đảm) (con|gia đình|kết quả)[^"]{0,30}(chắc chắn|100%)|tốt nhất thế giới|số 1 việt nam|100% hiệu quả/i.test(toan)) loi.push('lời hứa kết quả / từ tuyệt đối');
  return loi;
}

let daDungCN = false;
async function taoBangCN(db) {
  if (daDungCN) return;
  await db.prepare('CREATE TABLE IF NOT EXISTS camNangNha (ma TEXT PRIMARY KEY, o TEXT NOT NULL, ten TEXT NOT NULL, cap1 TEXT NOT NULL, ' +
    'cap2 TEXT NOT NULL, cap3 TEXT NOT NULL, ban TEXT, napLuc INTEGER NOT NULL)').run();
  /* Cẩm nang cấp 1 đã trao cho một nhà — giữ bản lúc trao. */
  await db.prepare('CREATE TABLE IF NOT EXISTS camNangGiao (id TEXT PRIMARY KEY, maNha TEXT NOT NULL, ma TEXT NOT NULL, noiDung TEXT NOT NULL, ' +
    'boiAi TEXT NOT NULL, luc INTEGER NOT NULL)').run();
  await db.prepare('CREATE INDEX IF NOT EXISTS ix_cng_nha ON camNangGiao (maNha, luc)').run();
  daDungCN = true;
}

export async function napCamNang(y, env, db, hoSo) {
  if (BAC[roleOf(hoSo)] !== 1) return { ok: false, code: 'NOPERM', error: 'Chỉ Super Admin nạp cẩm nang.' };
  const x = y || {}, ds = Array.isArray(x.ds) ? x.ds : [];
  if (!ds.length || ds.length > 3) return { ok: false, code: 'SAI', error: 'Mỗi lượt nạp từ 1 đến 3 cẩm nang.' };
  const hong = [];
  ds.forEach(r => { const l = soatCamNang(r); if (l.length) hong.push((r && r.id || '?') + ': ' + l.slice(0, 8).join(', ')); });
  if (hong.length) return { ok: false, code: 'HONG', hong, error: hong.length + ' cẩm nang không qua soát — không nạp bản nào.' };
  await taoBangCN(db);
  const ban = sach(x.ban, 40) || null, luc = Date.now();
  await db.batch(ds.map(r => db.prepare('INSERT INTO camNangNha (ma, o, ten, cap1, cap2, cap3, ban, napLuc) VALUES (?,?,?,?,?,?,?,?) ' +
    'ON CONFLICT(ma) DO UPDATE SET o=excluded.o, ten=excluded.ten, cap1=excluded.cap1, cap2=excluded.cap2, cap3=excluded.cap3, ban=excluded.ban, napLuc=excluded.napLuc')
    .bind(r.id, MA_CN.exec(r.id)[1], r.ten, JSON.stringify(r.cap1), JSON.stringify(r.cap2), JSON.stringify(r.cap3), ban, luc)));
  try { await Kho.ghiNhatKy(db, { uid: hoSo.uid, username: ten(hoSo), viec: 'NAP_CAM_NANG', doiTuong: ban || '', chiTiet: ds.map(r => r.id).join(',') }); } catch (e) {}
  return { ok: true, nap: ds.length };
}

/* MỤC LỤC — cấp nào vai này mở được; không nội dung. */
export async function dsCamNang(y, env, db, hoSo) {
  const lv = BAC[roleOf(hoSo)] || 99;
  if (!DOC_CAP_CN[1](lv)) return { ok: false, code: 'NOPERM', error: 'Cẩm nang Ngôi nhà nằm trong kho nghề.' };
  await taoBangCN(db);
  const co = new Set(((await db.prepare('SELECT ma FROM camNangNha').all()).results || []).map(r => r.ma));
  return { ok: true, capMo: [1, 2, 3].filter(n => DOC_CAP_CN[n](lv)),
    ds: Object.keys(O_NHA).map(o => ({ ma: 'CN-' + o, o, ten: O_NHA[o].ten, vi: O_NHA[o].vi, daNap: co.has('CN-' + o) })) };
}

export async function docCamNang(y, env, db, hoSo) {
  const x = y || {}, ma = String(x.ma || ''), cap = Number(x.cap);
  if (!MA_CN.test(ma) || ![1, 2, 3].includes(cap)) return { ok: false, code: 'SAI', error: 'Mã cẩm nang hoặc cấp không hợp lệ.' };
  const lv = BAC[roleOf(hoSo)] || 99;
  if (!DOC_CAP_CN[cap](lv)) return { ok: false, code: 'NOPERM', error: cap === 3 ? 'Cấp 3 nằm trong kho Coach (R01 · R04–R07).' : cap === 2 ? 'Cấp 2 dành cho Tư vấn và dòng Coach.' : 'Cẩm nang nằm trong kho nghề.' };
  await taoBangCN(db);
  const r = await db.prepare('SELECT ma, o, ten, cap' + cap + ' nd FROM camNangNha WHERE ma = ?').bind(ma).first();
  if (!r) return { ok: false, code: 'KHONGCO', error: 'Cẩm nang ô này chưa nạp.' };
  try { await Kho.ghiNhatKy(db, { uid: hoSo.uid, username: ten(hoSo), viec: 'DOC_CAM_NANG', doiTuong: ma, chiTiet: 'cấp ' + cap }); } catch (e) {}
  return { ok: true, ma: r.ma, o: r.o, ten: r.ten, cap, noiDung: JSON.parse(r.nd) };
}

/* TRAO cẩm nang cấp 1 cho một nhà — chỉ người phụ trách nhà ấy hoặc quản lý. */
export async function giaoCamNang(y, env, db, hoSo) {
  const x = y || {}, ma = String(x.ma || ''), maNha = sach(x.maNha, 40);
  if (!MA_CN.test(ma)) return { ok: false, code: 'SAI', error: 'Mã cẩm nang không hợp lệ.' };
  if (!maNha || !(await nhaCoThat(db, maNha))) return { ok: false, code: 'KHONGNHA', error: 'Không có nhà mang mã này.' };
  if (!(await vaiVoiNhaNV(db, hoSo, maNha))) return { ok: false, code: 'NOPERM_NHA', error: 'Anh/chị không phụ trách nhà này.' };
  await taoBangCN(db);
  const r = await db.prepare('SELECT ten, cap1 FROM camNangNha WHERE ma = ?').bind(ma).first();
  if (!r) return { ok: false, code: 'KHONGCO', error: 'Cẩm nang ô này chưa nạp.' };
  const id = crypto.randomUUID();
  await db.prepare('INSERT INTO camNangGiao (id, maNha, ma, noiDung, boiAi, luc) VALUES (?,?,?,?,?,?)')
    .bind(id, maNha, ma, JSON.stringify({ ten: r.ten, cap1: JSON.parse(r.cap1) }), ten(hoSo), Date.now()).run();
  try { await Kho.ghiNhatKy(db, { uid: hoSo.uid, username: ten(hoSo), viec: 'GIAO_CAM_NANG', doiTuong: maNha, chiTiet: ma }); } catch (e) {}
  return { ok: true, id };
}

/* Nhà đọc đúng các cẩm nang cấp 1 đã được trao. */
export async function camNangCuaNha(y, env, db, hoSo) {
  const lv = BAC[roleOf(hoSo)] || 99;
  await taoBangCN(db);
  let maNha;
  if (lv === 13 || lv === 14) maNha = await maNhaCuaToi(db, hoSo);
  else if (lv <= 12 && (y || {}).maNha) {
    maNha = sach(y.maNha, 40);
    if (!(await vaiVoiNhaNV(db, hoSo, maNha))) return { ok: false, code: 'NOPERM_NHA', error: 'Anh/chị không phụ trách nhà này.' };
  } else return { ok: false, code: 'NOPERM', error: 'Cẩm nang được trao cho gia đình đang đồng hành.' };
  if (!maNha) return { ok: true, ds: [] };
  const rows = (await db.prepare('SELECT id, ma, noiDung, boiAi, luc FROM camNangGiao WHERE maNha = ? ORDER BY luc DESC, rowid DESC LIMIT 50').bind(maNha).all()).results || [];
  const thay = new Set();
  const ds = rows.filter(r => { if (thay.has(r.ma)) return false; thay.add(r.ma); return true; })
    .map(r => Object.assign({ id: r.id, ma: r.ma, boiAi: r.boiAi, luc: r.luc }, JSON.parse(r.noiDung)));
  return { ok: true, maNha, ds };
}
