/* ═══════════════════════════════════════════════════════════════
   GITA 365 VVIP — CỬA MÁY CHỦ CỦA MASTER BLUEPRINT 1.0
   Khu Khách hàng & CRM · nhóm VIP/VVIP.

   Bản Blueprint (chủ hệ, 10/10/2026) đặt bốn tài sản cốt lõi. Mỗi tài sản
   ở đây là một cửa có RĂNG, không phải một bảng chữ:

     1. Bộ hồ sơ 12 tài liệu ...... luuHoSoVvip / docHoSoVvip
        — phiên bản nối tiếp (sửa = dòng mới), trường lạ bị bỏ, tài liệu 04
          đòi đồng ý dữ liệu con, tài liệu 09 chỉ R01–R03, mỗi lượt mở vào
          nhật ký. Phần máy tính được thì máy ghép, không cho gõ.
     2. CRM & quản lý quan hệ ...... nhanDienVvip · deXuatNhomVvip ·
        duyetNhomVvip · phanCongVvip · soatPhucVuVvip · tuyChonLienHeVvip
        — nhóm do HAI người quyết (đề xuất ≠ duyệt), có ảnh chụp dữ liệu
          lúc duyệt; người phục vụ nhà VVIP phải hạng A theo bảng xếp hạng
          tháng (chamMotNguoi), không theo cảm tình.
     3. Thư viện điểm chạm WOW ..... soanDiemCham · duyetDiemCham ·
        dsDiemCham · napMauDiemCham · kichHoatDiemCham
        — đủ bảy lớp mới nộp; người KHÁC người soạn tích đủ mười tiêu chuẩn
          mới bật; lúc gửi kiểm năm quy tắc tần suất rồi đi qua đúng
          ghiCham (đèn đỏ phải gọi, ba cửa…) — không mở lối ghi thứ hai.
     4. Bảng điều khiển ............. bangVvip
        — ba chỉ số 80% tách riêng (doanh thu · lợi nhuận · tăng trưởng),
          mười KPI và bốn mục tiêu thử nghiệm; chỉ số chưa đo được thì nói
          vì sao, KHÔNG trả 0.
   Cộng: chiến dịch có kết quả đo (lapChienDichVvip · duyetChienDichVvip ·
   dsChienDichVvip) và nội dung Blueprint (noiDungVvip, chỉ R01–R12).

   Năm ranh giới không đổi theo hạng khách — xem đầu vvip-noi-dung.js.
   Một ranh giới riêng của tệp này: NHÓM PHỤC VỤ ≠ TẦNG HỌC. Nhóm đổi
   theo dữ liệu cả hai chiều; tầng học (hoSoKhach.tang) không bao giờ bị
   cửa nào ở đây đụng tới.
   ═══════════════════════════════════════════════════════════════ */
import { Kho } from './nen.js';
import { BAC, roleOf, laNguoiNha } from './vai-tro.js';
import { nhaPhuTrach, LOI_NGOAI_NHA } from './pham-vi-nha.js';
import { chamMotNguoi } from './xep-hang-luong.js';
import { HE_THI } from './thi-cap.js';
import { CUM_TUYET_DOI } from './noi-dung-tiep-thi.js';
import { MUC_QUANG_CAO } from './tai-chinh-ceo.js';
import * as PhapLy from './phap-ly-rui-ro.js';
import { ghiCham } from './van-hanh-cham-soc.js';
import * as ND from './vvip-noi-dung.js';

const NGAY = 86400000;
const lvCua = h => BAC[roleOf(h)] || 99;
const bayGio = () => new Date().toISOString();
const maMoi = tien => tien + '-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const chuoi = (x, n) => String(x == null ? '' : x).trim().slice(0, n || 2000);
const tyLe = (tu, mau) => (mau > 0 ? Math.round(1000 * tu / mau) / 10 : null);

export const NHOM_QUYET = Object.freeze(['VVIP', 'VIP', 'CORE']);     // CORE = rút khỏi nhóm trọng điểm
export const NHIP = Object.freeze(Object.fromEntries(ND.NHOM_5.filter(n => n.nhip).map(n => [n.ma, n.nhip])));
export const HANG_CHO = Object.freeze(Object.fromEntries(ND.NHOM_5.filter(n => n.nguoi).map(n => [n.ma, n.nguoi])));
export const CUA_SO_NGAY = 365;
export const SO_DAU_HIEU = 7;
export const NGUONG_VVIP = 5, NGUONG_VIP = 4;                         // số dấu hiệu đạt để máy NÊU (không xếp)
export const LAP_LAI_NGAY = 14, KY_TAN_SUAT_NGAY = 7;
const REGEX_MA_DC = /^DC-[A-Z0-9]{2,12}$/;

/* ─────────────────── đọc sổ: nhóm hiện tại, doanh thu ─────────────────── */

/* Nhóm hiện tại = dòng ĐÃ DUYỆT mới nhất của nhà ấy, tính lúc đọc. Bảng
   không có cột "nhóm hiện tại" — một cột như thế hoặc bị gõ đè (một quyết
   định thành một lời khai), hoặc không ai cập nhật và nó cũ đi lặng lẽ.
   rowid phá hoà khi hai lượt duyệt cùng mili-giây (9.99.112). */
async function nhomDaQuyet(db) {
  const r = (await db.prepare("SELECT maNha, nhom, duyetLuc FROM hangVvip WHERE trangThai = 'daDuyet' ORDER BY duyetLuc DESC, rowid DESC").all()).results || [];
  const m = {};
  for (const x of r) if (!m[x.maNha]) m[x.maNha] = x.nhom;
  for (const k of Object.keys(m)) if (m[k] === 'CORE') delete m[k];
  return m;
}

/* Doanh thu thực thu = phiếu thu ĐÃ DUYỆT trừ hoàn tiền ĐÃ DUYỆT, trong
   cửa sổ [tu, den). Phiếu chờ duyệt không phải tiền đã vào. */
async function doanhThuTheoNha(db, tu, den) {
  const m = {};
  const thu = (await db.prepare("SELECT maKhachHang k, SUM(soTien) s FROM phieuThu WHERE trangThai = 'daDuyet' AND COALESCE(duyetLuc, ghiLuc) >= ? AND COALESCE(duyetLuc, ghiLuc) < ? GROUP BY maKhachHang").bind(tu, den).all()).results || [];
  for (const x of thu) m[x.k] = (m[x.k] || 0) + Number(x.s || 0);
  const hoan = (await db.prepare("SELECT maKhachHang k, SUM(soTien) s FROM hoanTien WHERE trangThai = 'daDuyet' AND COALESCE(duyetLuc, deXuatLuc) >= ? AND COALESCE(duyetLuc, deXuatLuc) < ? GROUP BY maKhachHang").bind(tu, den).all()).results || [];
  for (const x of hoan) m[x.k] = (m[x.k] || 0) - Number(x.s || 0);
  return m;
}

/* Recovery là TRẠNG THÁI chồng lên nhóm, không phải một hạng: nhà VVIP đang
   vướng mắc vẫn là VVIP, nhưng lúc ấy giải quyết vấn đề đứng trước mọi đề
   xuất sản phẩm. Dấu hiệu đọc từ sổ: đèn đỏ, phiếu hài lòng thấp, hoàn tiền
   đang chờ hay vừa duyệt trong 90 ngày. */
async function canHoTro(db, maNha, nay) {
  const ly = [];
  const k = await db.prepare('SELECT band FROM hoSoKhach WHERE maKhachHang = ?').bind(maNha).first();
  if (k && k.band === 'DO') ly.push('đèn đỏ');
  const dg = await db.prepare('SELECT csat, nps FROM danhGiaKH WHERE maNha = ? ORDER BY luc DESC, rowid DESC LIMIT 1').bind(maNha).first();
  if (dg && ((dg.csat != null && Number(dg.csat) <= 2) || (dg.nps != null && Number(dg.nps) <= 6))) ly.push('phiếu hài lòng thấp');
  const h = await db.prepare("SELECT COUNT(*) n FROM hoanTien WHERE maKhachHang = ? AND (trangThai = 'choDuyet' OR (trangThai = 'daDuyet' AND COALESCE(duyetLuc, deXuatLuc) >= ?))").bind(maNha, new Date(nay - 90 * NGAY).toISOString()).first();
  if (h && h.n > 0) ly.push('yêu cầu hoàn tiền');
  return ly;
}

async function chamCuoi(db, maNha) {
  const r = await db.prepare('SELECT ngay FROM soCham WHERE maNha = ? ORDER BY ngay DESC, rowid DESC LIMIT 1').bind(maNha).first();
  return r ? r.ngay : null;
}

/* ═══════════════════ 1 · NHẬN DIỆN — BẢY DẤU HIỆU ═══════════════════
   "Không chỉ nhìn vào mức chi tiêu" (Blueprint · Phần I.1). Doanh thu là
   MỘT dấu hiệu trong bảy. Dấu hiệu không đo được (chưa có phiếu hài lòng)
   trả null — "chưa biết" là việc phải đi hỏi, không phải điểm 0.
   Máy NÊU nhà đủ dấu hiệu; máy không xếp nhà vào nhóm nào. */
export async function nhanDienVvip(y, env, db, hoSo) {
  const lv = lvCua(hoSo);
  if (lv > 5) return { ok: false, code: 'NOPERM', error: 'Danh sách nhận diện dành cho quản lý R01–R05.' };
  const nay = Date.now(), tu = new Date(nay - CUA_SO_NGAY * NGAY).toISOString(), den = new Date(nay + NGAY).toISOString();
  const dt = await doanhThuTheoNha(db, tu, den);
  const duong = Object.entries(dt).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]);
  const top = new Set(duong.slice(0, Math.max(1, Math.ceil(duong.length * 0.2))).map(x => x[0]));
  const daQuyet = await nhomDaQuyet(db);
  const nha = (await db.prepare("SELECT k.maKhachHang ma, k.tang, k.vaoLuc, k.coach, k.tuVan, u.hoTen ten FROM hoSoKhach k LEFT JOIN users u ON u.id = k.uidPhuHuynh WHERE k.trangThai = 'dangHoc' ORDER BY k.maKhachHang LIMIT 2000").all()).results || [];
  const xemTien = lv <= 3;
  const ds = [];
  for (const n of nha) {
    const thang = n.vaoLuc ? Math.floor((nay - Date.parse(n.vaoLuc)) / (30 * NGAY)) : null;
    const len = await db.prepare('SELECT COUNT(*) c FROM lichSuTang WHERE maKhachHang = ? AND denTang > COALESCE(tuTang, 0) AND luc >= ?').bind(n.ma, tu).first();
    const gt = await db.prepare('SELECT COUNT(*) c FROM hoSoKhach WHERE boTro = ?').bind(n.ma).first();
    const dg = await db.prepare('SELECT csat, nps FROM danhGiaKH WHERE maNha = ? ORDER BY luc DESC, rowid DESC LIMIT 1').bind(n.ma).first();
    const hoan = await db.prepare("SELECT COUNT(*) c FROM hoanTien WHERE maKhachHang = ? AND trangThai IN ('choDuyet','daDuyet') AND deXuatLuc >= ?").bind(n.ma, tu).first();
    const cham30 = await db.prepare('SELECT COUNT(*) c FROM soCham WHERE maNha = ? AND ngay >= ?').bind(n.ma, new Date(nay - 30 * NGAY).toISOString().slice(0, 10)).first();
    const dau = [
      { ma: 'KINHTE', ten: 'Giá trị kinh tế — thuộc 20% nhà có doanh thu thực thu cao nhất 12 tháng', dat: top.has(n.ma) },
      { ma: 'PHUHOP', ten: 'Phù hợp chương trình — đã ở tầng 3 trở lên', dat: Number(n.tang) >= 3 },
      { ma: 'DONGHANH', ten: 'Đồng hành cùng con — có lượt chạm trong 30 ngày', dat: cham30.c > 0 },
      { ma: 'DAIHAN', ten: 'Nhu cầu dài hạn — đồng hành ≥ 6 tháng', dat: thang == null ? null : thang >= 6 },
      { ma: 'TIEPNOI', ten: 'Tiếp nối theo kết quả — đã lên tầng trong 12 tháng', dat: len.c > 0 },
      { ma: 'GIOITHIEU', ten: 'Giới thiệu tự nguyện — có nhà vào học nhờ nhà này', dat: gt.c > 0 },
      { ma: 'HAILONG', ten: 'Hài lòng — phiếu gần nhất CSAT ≥ 4 hoặc NPS ≥ 9, không có hoàn tiền', dat: dg ? ((Number(dg.csat) >= 4 || Number(dg.nps) >= 9) && hoan.c === 0) : null }
    ];
    const dat = dau.filter(d => d.dat === true).length, chuaBiet = dau.filter(d => d.dat === null).length;
    const nhom = daQuyet[n.ma] || 'CORE';
    let neu = null;
    if (dat >= NGUONG_VVIP && dau[0].dat && nhom !== 'VVIP') neu = 'VVIP';
    else if (dat >= NGUONG_VIP && nhom === 'CORE') neu = 'VIP';
    const ho = await canHoTro(db, n.ma, nay);
    const dong = { maNha: n.ma, ten: n.ten || '', tang: n.tang, nhom, recovery: ho.length ? ho : undefined, dat, chuaBiet, dau, neu,
      phuTrach: { coach: n.coach || '', tuVan: n.tuVan || '' } };
    if (xemTien) dong.doanhThu12 = Math.round(dt[n.ma] || 0);
    ds.push(dong);
  }
  ds.sort((a, b) => (b.neu ? 1 : 0) - (a.neu ? 1 : 0) || b.dat - a.dat || a.maNha.localeCompare(b.maNha));
  const choDuyet = (await db.prepare("SELECT id, maNha, nhom, lyDo, deXuat, deXuatLuc FROM hangVvip WHERE trangThai = 'choDuyet' ORDER BY deXuatLuc").all()).results || [];
  return { ok: true, soNha: ds.length, soNeu: ds.filter(d => d.neu).length, ds, xemTien, choDuyet, duocDuyet: lv <= 3,
    luat: 'Máy NÊU nhà đủ dấu hiệu; người đề xuất và một người duyệt KHÁC quyết nhóm. Dấu hiệu "chưa biết" là việc phải đi hỏi, không phải điểm 0.' };
}

/* ═══════════════════ 2 · QUYẾT NHÓM — HAI NGƯỜI ═══════════════════ */
export async function deXuatNhomVvip(y, env, db, hoSo) {
  if (!laNguoiNha(hoSo)) return { ok: false, code: 'NOPERM', error: 'Đề xuất nhóm dành cho nhân sự.' };
  const x = y || {}, maNha = chuoi(x.maNha, 40), nhom = chuoi(x.nhom, 8), lyDo = chuoi(x.lyDo, 1200);
  if (!maNha || NHOM_QUYET.indexOf(nhom) < 0) return { ok: false, code: 'SAI', error: 'Nhóm phải là ' + NHOM_QUYET.join(' · ') + '.' };
  if (lyDo.length < 30) return { ok: false, code: 'LYDONGAN', error: 'Lý do đề xuất cần ít nhất 30 ký tự, nói bằng dữ kiện của nhà — sáu tháng sau người khác phải đọc lại được vì sao.' };
  if (!(await nhaPhuTrach(db, hoSo, maNha))) return LOI_NGOAI_NHA;
  const co = await db.prepare('SELECT 1 c FROM hoSoKhach WHERE maKhachHang = ?').bind(maNha).first();
  if (!co) return { ok: false, code: 'KHONGNHA', error: 'Không có nhà này.' };
  const cho = await db.prepare("SELECT id FROM hangVvip WHERE maNha = ? AND trangThai = 'choDuyet'").bind(maNha).first();
  if (cho) return { ok: false, code: 'DANGCHO', error: 'Nhà này đang có một đề xuất chờ duyệt (' + cho.id + ').' };
  const id = maMoi('HV');
  await db.prepare("INSERT INTO hangVvip (id, maNha, nhom, lyDo, deXuat, deXuatLuc, trangThai) VALUES (?,?,?,?,?,?,'choDuyet')").bind(id, maNha, nhom, lyDo, hoSo.u, bayGio()).run();
  await Kho.ghiNhatKy(db, { uid: hoSo.uid, username: hoSo.u, viec: 'VVIP_DEXUAT', doiTuong: maNha, chiTiet: nhom });
  return { ok: true, id, trangThai: 'choDuyet' };
}

export async function duyetNhomVvip(y, env, db, hoSo) {
  if (lvCua(hoSo) > 3) return { ok: false, code: 'NOPERM', error: 'Chỉ R01–R03 duyệt nhóm khách trọng điểm.' };
  const x = y || {}, id = chuoi(x.id, 60), quyet = x.quyet === 'tuChoi' ? 'tuChoi' : 'daDuyet', ghiChu = chuoi(x.ghiChu, 800);
  const d = await db.prepare('SELECT * FROM hangVvip WHERE id = ?').bind(id).first();
  if (!d) return { ok: false, code: 'KHONGCO', error: 'Không có đề xuất này.' };
  if (d.trangThai !== 'choDuyet') return { ok: false, code: 'DAXONG', error: 'Đề xuất đã được xử lý.' };
  if (String(d.deXuat).toLowerCase() === String(hoSo.u).toLowerCase())
    return { ok: false, code: 'TUDUYET', error: 'Người đề xuất không duyệt đề xuất của chính mình — cùng một người làm cả hai thì phần duyệt chỉ là phần đề xuất nói lại lần nữa.' };
  if (quyet === 'tuChoi' && ghiChu.length < 20) return { ok: false, code: 'LYDONGAN', error: 'Từ chối cần ghi lý do ≥ 20 ký tự để người đề xuất biết sửa gì.' };
  /* Ảnh chụp dữ liệu lúc duyệt: hồ sơ quyết định phải đọc lại được "hôm ấy
     nhà này có những dấu hiệu gì" — dấu hiệu tính lại sau sáu tháng sẽ khác. */
  const nd = await nhanDienVvip({}, env, db, { ...hoSo, role: 'R01' });
  const dong = (nd.ds || []).find(z => z.maNha === d.maNha);
  const canCu = dong ? JSON.stringify({ dat: dong.dat, chuaBiet: dong.chuaBiet, dau: dong.dau.map(z => [z.ma, z.dat]) }) : null;
  await db.prepare('UPDATE hangVvip SET trangThai = ?, nguoiDuyet = ?, duyetLuc = ?, ghiChuDuyet = ?, canCuMay = ? WHERE id = ?')
    .bind(quyet, hoSo.u, bayGio(), ghiChu || null, canCu, id).run();
  await Kho.ghiNhatKy(db, { uid: hoSo.uid, username: hoSo.u, viec: 'VVIP_DUYET', doiTuong: d.maNha, chiTiet: d.nhom + ' · ' + quyet });
  return { ok: true, id, trangThai: quyet, nhom: d.nhom, canCuMay: canCu ? JSON.parse(canCu) : undefined };
}

/* ═══════════════════ 3 · PHÂN CÔNG NGƯỜI PHỤC VỤ ═══════════════════
   "Ưu tiên người giỏi nhất" thành một cổng: hạng nhân sự đọc từ bảng xếp
   hạng lương thưởng tháng trước (chamMotNguoi) — cùng con số trả lương,
   nên không ai nâng hạng một người riêng cho việc phân công được. */
const kyTruoc = () => { const d = new Date(); d.setUTCDate(1); d.setUTCMonth(d.getUTCMonth() - 1); return d.toISOString().slice(0, 7); };
export async function phanCongVvip(y, env, db, hoSo) {
  if (lvCua(hoSo) > 3) return { ok: false, code: 'NOPERM', error: 'Chỉ R01–R03 phân công người phục vụ nhà trọng điểm.' };
  const x = y || {}, maNha = chuoi(x.maNha, 40), vaiTro = x.vaiTro === 'tuVan' ? 'tuVan' : 'coach', nguoi = chuoi(x.nguoi, 80).toLowerCase(), lyDo = chuoi(x.lyDo, 800);
  const nhom = (await nhomDaQuyet(db))[maNha];
  if (!nhom) return { ok: false, code: 'CHUANHOM', error: 'Nhà này chưa được duyệt vào nhóm VIP/VVIP — phân công theo nhóm chỉ áp cho nhà trọng điểm.' };
  const u = await db.prepare('SELECT id, username, role FROM users WHERE lower(username) = ? AND active = 1 AND deletedAt IS NULL').bind(nguoi).first();
  if (!u) return { ok: false, code: 'KHONGNGUOI', error: 'Không có nhân sự đang hoạt động tên ' + nguoi + '.' };
  const vaiHop = vaiTro === 'tuVan' ? HE_THI.tuvan.vaiThi : HE_THI.coach.vaiThi;
  if (vaiHop.indexOf(u.role) < 0) return { ok: false, code: 'SAIVAI', error: 'Vai ' + u.role + ' không làm ' + (vaiTro === 'tuVan' ? 'tư vấn' : 'coach') + ' (cần ' + vaiHop.join('/') + ').' };
  const ky = kyTruoc();
  const ch = await chamMotNguoi(db, nguoi, u.role, ky);
  const choPhep = HANG_CHO[nhom] || [];
  let ngoaiChuan = 0;
  if (choPhep.indexOf(ch.hang) < 0) {
    /* VVIP được nhận người hạng B khi KHÔNG còn người hạng A — viết lý do,
       máy đánh dấu ngoài chuẩn. C và D thì không bao giờ. */
    if (nhom === 'VVIP' && ch.hang === 'B' && lyDo.length >= 40) ngoaiChuan = 1;
    else return { ok: false, code: 'DUOICHUAN', hang: ch.hang, ky, choPhep,
      error: 'Nhóm ' + nhom + ' cần người hạng ' + choPhep.join('/') + '; ' + nguoi + ' đang hạng ' + ch.hang + ' kỳ ' + ky + '.' +
        (nhom === 'VVIP' && ch.hang === 'B' ? ' Giao người hạng B cho nhà VVIP chỉ khi không còn người hạng A, và phải viết lý do ≥ 40 ký tự.' : '') };
  }
  const id = maMoi('PC'), luc = bayGio();
  await db.batch([
    db.prepare('INSERT INTO phanCongVvip (id, maNha, vaiTro, nguoi, hangNguoi, ky, ngoaiChuan, lyDo, boiAi, luc) VALUES (?,?,?,?,?,?,?,?,?,?)')
      .bind(id, maNha, vaiTro, nguoi, ch.hang, ky, ngoaiChuan, lyDo || null, hoSo.u, luc),
    db.prepare('UPDATE hoSoKhach SET ' + (vaiTro === 'tuVan' ? 'tuVan' : 'coach') + ' = ?, suaLuc = ? WHERE maKhachHang = ?').bind(nguoi, luc, maNha)
  ]);
  await Kho.ghiNhatKy(db, { uid: hoSo.uid, username: hoSo.u, viec: 'VVIP_PHANCONG', doiTuong: maNha, chiTiet: vaiTro + ' ' + nguoi + ' hạng ' + ch.hang + (ngoaiChuan ? ' NGOÀI CHUẨN' : '') });
  return { ok: true, id, maNha, nhom, nguoi, hang: ch.hang, ky, ngoaiChuan: !!ngoaiChuan };
}

/* ═══════════════════ 4 · ĐỒNG HỒ PHỤC VỤ ═══════════════════
   Một cam kết không ai đo thì trôi theo nhịp việc thường. Mỗi nhà VIP/VVIP:
   số ngày từ lượt chạm cuối so với nhịp của nhóm, người phụ trách, ngày hẹn
   tiếp ở CRM, người phục vụ có đạt hạng chuẩn không. */
export async function soatPhucVuVvip(y, env, db, hoSo) {
  if (lvCua(hoSo) > 5) return { ok: false, code: 'NOPERM', error: 'Đồng hồ phục vụ dành cho quản lý R01–R05.' };
  const nay = Date.now(), homNay = new Date(nay).toISOString().slice(0, 10);
  const daQuyet = await nhomDaQuyet(db), ds = [];
  for (const maNha of Object.keys(daQuyet)) {
    const nhom = daQuyet[maNha];
    const k = await db.prepare('SELECT coach, tuVan FROM hoSoKhach WHERE maKhachHang = ?').bind(maNha).first() || {};
    const crm = await db.prepare('SELECT phuTrach, henTiep FROM crmKhach WHERE maKH = ?').bind(maNha).first() || {};
    const cuoi = await chamCuoi(db, maNha);
    const ho = await canHoTro(db, maNha, nay);
    const nhip = ho.length ? Math.min(NHIP.RECOVERY, NHIP[nhom]) : NHIP[nhom];
    const ngay = cuoi ? Math.floor((nay - Date.parse(cuoi)) / NGAY) : null;
    const pc = await db.prepare("SELECT hangNguoi, ngoaiChuan FROM phanCongVvip WHERE maNha = ? AND vaiTro = 'coach' ORDER BY luc DESC, rowid DESC LIMIT 1").bind(maNha).first();
    const keHoach = !!(crm.phuTrach && crm.henTiep && crm.henTiep >= homNay);
    ds.push({ maNha, nhom, recovery: ho.length ? ho : undefined, nhip, ngayTuChamCuoi: ngay, quaHan: ngay == null || ngay > nhip,
      quaHanGapDoi: ngay == null || ngay > 2 * nhip, coach: k.coach || '', tuVan: k.tuVan || '',
      phuTrachCRM: crm.phuTrach || '', henTiep: crm.henTiep || '', coKeHoachTiep: keHoach,
      hangCoach: pc ? pc.hangNguoi : undefined, ngoaiChuan: pc ? !!pc.ngoaiChuan : undefined, chuaPhanCongChuan: !pc });
  }
  ds.sort((a, b) => (b.quaHanGapDoi - a.quaHanGapDoi) || (b.quaHan - a.quaHan) || ((b.ngayTuChamCuoi || 9999) - (a.ngayTuChamCuoi || 9999)));
  return { ok: true, tong: ds.length, quaHan: ds.filter(d => d.quaHan).length, quaHanGapDoi: ds.filter(d => d.quaHanGapDoi).length,
    coKeHoach: ds.filter(d => d.coKeHoachTiep).length, ds, nhip: NHIP,
    luat: 'Quá hạn gấp đôi nhịp thì quản lý chuyên môn nhận việc. Nhà chưa có lượt chạm nào tính là quá hạn từ đầu — im lặng đếm từ lúc quen nhau.' };
}

/* ═══════════════════ 5 · TUỲ CHỌN LIÊN HỆ ═══════════════════
   Tài liệu 03 + quy tắc tần suất TS1/TS4. Dòng mới nhất là tuỳ chọn hiện
   tại; gia đình tự đặt (cửa khách đối chiếu nhà của phiên) hoặc nhân sự
   phụ trách ghi theo lời gia đình. Từ chối quảng bá chặn mọi điểm chạm
   G1–G2 và mọi chiến dịch marketing. */
export async function tuyChonLienHeVvip(y, env, db, hoSo) {
  const x = y || {}, lv = lvCua(hoSo);
  let maNha = chuoi(x.maNha, 40);
  if (lv >= 13) {
    const nd = await Kho.nguoiTheoId(db, hoSo.uid);
    if (!nd || !nd.maKhachHang) return { ok: false, code: 'NOPERM', error: 'Tài khoản chưa gắn với một gia đình.' };
    maNha = String(nd.maKhachHang);
  } else if (!(await nhaPhuTrach(db, hoSo, maNha))) return LOI_NGOAI_NHA;
  if (!maNha) return { ok: false, error: 'Thiếu mã gia đình.' };
  const tran = {};
  for (const k of Object.keys(ND.TRAN_TAN_SUAT)) if (x.tran && x.tran[k] != null) tran[k] = Math.max(0, Math.min(ND.TRAN_TAN_SUAT[k], Math.floor(Number(x.tran[k]) || 0)));
  const kenh = Array.isArray(x.kenh) ? x.kenh.filter(k => ['nhan', 'goi', 'buoi'].indexOf(k) >= 0) : null;
  await db.prepare('INSERT INTO tuyChonLienHe (id, maNha, nhanQuangBa, kenhJson, tranJson, boiAi, luc) VALUES (?,?,?,?,?,?,?)')
    .bind(maMoi('TC'), maNha, x.nhanQuangBa === false ? 0 : 1, kenh ? JSON.stringify(kenh) : null, Object.keys(tran).length ? JSON.stringify(tran) : null, hoSo.u, bayGio()).run();
  return { ok: true, maNha, tuyChon: await docTuyChon(db, maNha) };
}
async function docTuyChon(db, maNha) {
  const r = await db.prepare('SELECT nhanQuangBa, kenhJson, tranJson, luc FROM tuyChonLienHe WHERE maNha = ? ORDER BY luc DESC, rowid DESC LIMIT 1').bind(maNha).first();
  const tran = { ...ND.TRAN_TAN_SUAT };
  if (r && r.tranJson) { try { Object.assign(tran, JSON.parse(r.tranJson)); } catch (e) { /* giữ mặc định */ } }
  return { nhanQuangBa: r ? r.nhanQuangBa === 1 : true, kenh: r && r.kenhJson ? JSON.parse(r.kenhJson) : null, tran, luc: r ? r.luc : null };
}

/* ═══════════════════ 6 · THƯ VIỆN ĐIỂM CHẠM WOW ═══════════════════ */
function soatDiemCham(d) {
  const thieu = [];
  for (const l of ND.LOP_7) if (chuoi(d[l.k], 600).length < 12) thieu.push(l.k);
  if (!ND.GIAI_DOAN_5.some(g => g.ma === d.giaiDoan)) thieu.push('giaiDoan');
  if (!ND.NHOM_WOW_10.some(g => g.ma === d.nhomWow)) thieu.push('nhomWow');
  if (['nhan', 'goi', 'buoi', 'wow'].indexOf(d.kieuCham) < 0) thieu.push('kieuCham');
  if (chuoi(d.ten, 160).length < 8) thieu.push('ten');
  const chu = [d.ten, d.thongDiep, d.hanhDong].join(' ').toLowerCase();
  const tuyetDoi = CUM_TUYET_DOI.filter(c => chu.includes(c));
  return { thieu, tuyetDoi };
}
const LOP_KHOA = ['ten', 'giaiDoan', 'nhomWow', 'kieuCham', ...ND.LOP_7.map(l => l.k)];
const gonDiemCham = d => Object.fromEntries(LOP_KHOA.map(k => [k, chuoi(d[k], k === 'ten' ? 160 : 600)]));

export async function soanDiemCham(y, env, db, hoSo) {
  if (!laNguoiNha(hoSo)) return { ok: false, code: 'NOPERM', error: 'Soạn điểm chạm dành cho nhân sự.' };
  const d = gonDiemCham((y || {}).diemCham || {});
  const s = soatDiemCham(d);
  if (s.thieu.length) return { ok: false, code: 'THIEULOP', thieu: s.thieu, error: 'Điểm chạm phải đủ bảy lớp (đúng người · đúng thời điểm · đúng nhu cầu · đúng thông điệp · đúng hành động · đúng người chịu trách nhiệm · đo lường được), mỗi lớp ≥ 12 ký tự. Thiếu: ' + s.thieu.join(', ') + '.' };
  if (s.tuyetDoi.length) return { ok: false, code: 'TUYETDOI', cum: s.tuyetDoi, error: 'Có từ tuyệt đối (' + s.tuyetDoi.join(', ') + ') — tiêu chuẩn 5: không đưa ra lời hứa vượt quá năng lực.' };
  const ma = chuoi((y || {}).ma, 16).toUpperCase() || ('DC-' + Date.now().toString(36).toUpperCase().slice(-6));
  if (!REGEX_MA_DC.test(ma)) return { ok: false, code: 'SAIMA', error: 'Mã điểm chạm có dạng DC-XXXX.' };
  const co = await db.prepare('SELECT trangThai, tacGia FROM diemChamWow WHERE ma = ?').bind(ma).first();
  if (co && co.trangThai === 'daDuyet') return { ok: false, code: 'DABAT', error: 'Điểm chạm đang bật không sửa đè được — tạm dừng rồi soạn bản mới.' };
  if (co && String(co.tacGia).toLowerCase() !== String(hoSo.u).toLowerCase() && lvCua(hoSo) > 3) return { ok: false, code: 'NOPERM', error: 'Bản nháp của người khác.' };
  const luc = bayGio();
  if (co) await db.prepare("UPDATE diemChamWow SET noiDungJson = ?, giaiDoan = ?, nhomWow = ?, trangThai = 'choDuyet', chuanJson = NULL, nguoiDuyet = NULL, duyetLuc = NULL, suaLuc = ? WHERE ma = ?").bind(JSON.stringify(d), d.giaiDoan, d.nhomWow, luc, ma).run();
  else await db.prepare("INSERT INTO diemChamWow (ma, giaiDoan, nhomWow, noiDungJson, trangThai, tacGia, taoLuc, suaLuc) VALUES (?,?,?,?,'choDuyet',?,?,?)").bind(ma, d.giaiDoan, d.nhomWow, JSON.stringify(d), hoSo.u, luc, luc).run();
  return { ok: true, ma, trangThai: 'choDuyet' };
}

/* Bật điểm chạm: người KHÁC người soạn, R01–R05, tích đủ mười tiêu chuẩn.
   Tích chín là không bật — "được kiểm thử trước khi triển khai rộng" mà bỏ
   qua thì chín cái kia không cứu được. */
export async function duyetDiemCham(y, env, db, hoSo) {
  if (lvCua(hoSo) > 5) return { ok: false, code: 'NOPERM', error: 'Duyệt điểm chạm dành cho quản lý R01–R05.' };
  const x = y || {}, ma = chuoi(x.ma, 16).toUpperCase(), quyet = x.quyet || 'bat';
  const d = await db.prepare('SELECT * FROM diemChamWow WHERE ma = ?').bind(ma).first();
  if (!d) return { ok: false, code: 'KHONGCO', error: 'Không có điểm chạm này.' };
  if (quyet === 'tamDung') {
    await db.prepare("UPDATE diemChamWow SET trangThai = 'tamDung', suaLuc = ? WHERE ma = ?").bind(bayGio(), ma).run();
    return { ok: true, ma, trangThai: 'tamDung' };
  }
  if (d.trangThai !== 'choDuyet') return { ok: false, code: 'KHONGCHO', error: 'Chỉ bật được điểm chạm đang chờ duyệt.' };
  if (String(d.tacGia).toLowerCase() === String(hoSo.u).toLowerCase()) return { ok: false, code: 'TUDUYET', error: 'Người soạn không tự bật điểm chạm của mình.' };
  const chuan = Array.isArray(x.chuan) ? x.chuan.map(Number) : [];
  const du = ND.CHUAN_WOW_10.every((_, i) => chuan.indexOf(i) >= 0);
  if (!du) return { ok: false, code: 'THIEUCHUAN', thieu: ND.CHUAN_WOW_10.map((t, i) => (chuan.indexOf(i) < 0 ? t : null)).filter(Boolean),
    error: 'Phải tích đủ mười tiêu chuẩn WOW mới bật.' };
  await db.prepare("UPDATE diemChamWow SET trangThai = 'daDuyet', chuanJson = ?, nguoiDuyet = ?, duyetLuc = ? WHERE ma = ?").bind(JSON.stringify(chuan), hoSo.u, bayGio(), ma).run();
  await Kho.ghiNhatKy(db, { uid: hoSo.uid, username: hoSo.u, viec: 'VVIP_DC_BAT', doiTuong: ma, chiTiet: d.giaiDoan + ' ' + d.nhomWow });
  return { ok: true, ma, trangThai: 'daDuyet' };
}

export async function napMauDiemCham(y, env, db, hoSo) {
  if (lvCua(hoSo) !== 1) return { ok: false, code: 'NOPERM', error: 'Chỉ Super Admin nạp mười điểm chạm mẫu của Blueprint.' };
  let moi = 0;
  for (const m of ND.MAU_DIEM_CHAM_10) {
    const co = await db.prepare('SELECT 1 c FROM diemChamWow WHERE ma = ?').bind(m.ma).first();
    if (co) continue;
    const d = gonDiemCham(m), luc = bayGio();
    await db.prepare("INSERT INTO diemChamWow (ma, giaiDoan, nhomWow, noiDungJson, trangThai, tacGia, taoLuc, suaLuc) VALUES (?,?,?,?,'choDuyet',?,?,?)").bind(m.ma, d.giaiDoan, d.nhomWow, JSON.stringify(d), hoSo.u, luc, luc).run();
    moi++;
  }
  return { ok: true, moi, ghiChu: 'Nạp ở trạng thái CHỜ DUYỆT — một người khác Super Admin tích đủ mười tiêu chuẩn mới bật.' };
}

export async function dsDiemCham(y, env, db, hoSo) {
  if (!laNguoiNha(hoSo)) return { ok: false, code: 'NOPERM', error: 'Thư viện điểm chạm dành cho nhân sự.' };
  const r = (await db.prepare('SELECT ma, giaiDoan, nhomWow, noiDungJson, trangThai, tacGia, nguoiDuyet, duyetLuc, chuanJson FROM diemChamWow ORDER BY giaiDoan, ma LIMIT 10000').all()).results || [];
  const ds = r.map(x => ({ ma: x.ma, giaiDoan: x.giaiDoan, nhomWow: x.nhomWow, trangThai: x.trangThai, tacGia: x.tacGia, nguoiDuyet: x.nguoiDuyet || undefined,
    ...JSON.parse(x.noiDungJson || '{}') }));
  const theoGiaiDoan = ND.GIAI_DOAN_5.map(g => ({ ma: g.ma, ten: g.ten, phanBo: g.phanBo,
    dangBat: ds.filter(d => d.giaiDoan === g.ma && d.trangThai === 'daDuyet').length, tong: ds.filter(d => d.giaiDoan === g.ma).length }));
  return { ok: true, ds, theoGiaiDoan, dangBat: ds.filter(d => d.trangThai === 'daDuyet').length, sucChua: ND.SUC_CHUA_WOW, chuaPhanBo: ND.CHUA_PHAN_BO, moc: 100, quyMo: ND.QUY_MO_WOW };
}

/* Gửi một điểm chạm cho một nhà: năm quy tắc tần suất có răng ở đây, rồi
   đi qua ĐÚNG ghiCham — đèn đỏ phải gọi, người chưa qua ba cửa không chạm
   một mình. Không mở lối ghi thứ hai vào sổ chạm. */
export async function kichHoatDiemCham(y, env, db, hoSo) {
  if (!laNguoiNha(hoSo)) return { ok: false, code: 'NOPERM', error: 'Gửi điểm chạm dành cho nhân sự.' };
  const x = y || {}, ma = chuoi(x.ma, 16).toUpperCase(), maNha = chuoi(x.maNha, 40);
  if (!(await nhaPhuTrach(db, hoSo, maNha))) return LOI_NGOAI_NHA;
  const d = await db.prepare('SELECT * FROM diemChamWow WHERE ma = ?').bind(ma).first();
  if (!d || d.trangThai !== 'daDuyet') return { ok: false, code: 'CHUABAT', error: 'Chỉ gửi được điểm chạm đã được duyệt và đang bật.' };
  const n = JSON.parse(d.noiDungJson || '{}');
  const k = await db.prepare('SELECT trangThai FROM hoSoKhach WHERE maKhachHang = ?').bind(maNha).first();
  const nay = Date.now();
  const tc = await docTuyChon(db, maNha);
  const quangBa = d.giaiDoan === 'G1' || d.giaiDoan === 'G2';
  /* TS4 — đã từ chối quảng bá thì dừng. */
  if (quangBa && !tc.nhanQuangBa) return { ok: false, code: 'TUCHOI', quyTac: 'TS4', error: 'Gia đình đã từ chối nhận nội dung quảng bá.' };
  /* TS3 — nhà đang học thì chăm sóc học tập đứng trước quảng bá. */
  if (quangBa && k && k.trangThai === 'dangHoc') return { ok: false, code: 'DANGHOC', quyTac: 'TS3', error: 'Nhà đang học: điểm chạm giai đoạn thu hút/tìm hiểu không gửi cho nhà này.' };
  /* TS5 — Recovery chỉ nhận điểm chạm hỗ trợ do người thật làm. */
  const ho = await canHoTro(db, maNha, nay);
  if (ho.length && d.nhomWow !== 'WOW09') return { ok: false, code: 'RECOVERY', quyTac: 'TS5', lyDo: ho,
    error: 'Nhà đang cần hỗ trợ (' + ho.join(', ') + '): chỉ gửi điểm chạm "Được phục vụ chu đáo" (WOW09) — giải quyết vấn đề trước mọi đề xuất.' };
  if (tc.kenh && tc.kenh.indexOf(n.kieuCham === 'wow' ? 'nhan' : n.kieuCham) < 0) return { ok: false, code: 'SAIKENH', quyTac: 'TS1', error: 'Gia đình không chọn kênh này.' };
  /* TS2 — cùng một điểm chạm cho cùng một nhà trong 14 ngày, bất kể ai gửi. */
  const tu14 = new Date(nay - LAP_LAI_NGAY * NGAY).toISOString().slice(0, 10);
  const lap = await db.prepare('SELECT COUNT(*) c FROM soCham WHERE maNha = ? AND ngay >= ? AND canCu LIKE ?').bind(maNha, tu14, 'DC:' + ma + '%').first();
  if (lap.c > 0) return { ok: false, code: 'TRUNGLAP', quyTac: 'TS2', error: 'Điểm chạm ' + ma + ' đã đến nhà này trong ' + LAP_LAI_NGAY + ' ngày qua.' };
  /* TS1 — trần theo kênh trong 7 ngày. */
  const tu7 = new Date(nay - KY_TAN_SUAT_NGAY * NGAY).toISOString().slice(0, 10);
  const dem = await db.prepare('SELECT COUNT(*) c FROM soCham WHERE maNha = ? AND ngay >= ? AND kieu = ?').bind(maNha, tu7, n.kieuCham).first();
  const tran = tc.tran[n.kieuCham] != null ? tc.tran[n.kieuCham] : ND.TRAN_TAN_SUAT[n.kieuCham];
  if (dem.c >= tran) return { ok: false, code: 'VUOTTRAN', quyTac: 'TS1', error: 'Đã đủ ' + tran + ' lượt kiểu "' + n.kieuCham + '" cho nhà này trong 7 ngày.' };
  const kq = await ghiCham({ maNha, kieu: n.kieuCham, noiDung: chuoi(x.noiDung, 2000) || n.thongDiep, canCu: 'DC:' + ma + ' · ' + d.nhomWow + ' · ' + n.ten,
    aiDuyet: d.nguoiDuyet, boiAi: x.boiAi, nguoiKem: x.nguoiKem, bayGio: x.bayGio }, env, db, hoSo);
  if (kq.ok) await Kho.ghiNhatKy(db, { uid: hoSo.uid, username: hoSo.u, viec: 'VVIP_DC_GUI', doiTuong: maNha, chiTiet: ma });
  return kq.ok ? { ...kq, ma } : kq;
}

/* ═══════════════════ 7 · BỘ HỒ SƠ 12 TÀI LIỆU ═══════════════════ */
async function quyenHoSo(db, hoSo, maNha) {
  if (!laNguoiNha(hoSo)) return false;
  return nhaPhuTrach(db, hoSo, maNha);
}
export async function luuHoSoVvip(y, env, db, hoSo) {
  const x = y || {}, maNha = chuoi(x.maNha, 40), maTL = chuoi(x.taiLieu, 2);
  if (!(await quyenHoSo(db, hoSo, maNha))) return LOI_NGOAI_NHA;
  const tl = ND.HO_SO_12.find(t => t.ma === maTL);
  if (!tl) return { ok: false, code: 'SAI', error: 'Tài liệu phải là 01–12.' };
  if (!tl.truong) return { ok: false, code: 'MAYGHEP', error: 'Tài liệu ' + maTL + ' do máy ghép từ sổ thật — không gõ tay, để một con số đo được không biến thành lời khai.' };
  if (tl.conCan) {
    const dy = await PhapLy.soatDongYCon(maNha, db);
    if (!dy.duoc) return { ok: false, code: dy.code, error: 'Tài liệu ' + maTL + ' chứa dữ liệu về con: nhà này ' + (dy.code === 'DARUT' ? 'đã RÚT' : 'chưa có') + ' đồng ý dữ liệu con.' };
  }
  /* Chỉ giữ trường đã khai — trường lạ bị bỏ: "chỉ thu thông tin cần thiết". */
  const vao = x.noiDung || {}, ra = {}, thieu = [];
  for (const f of tl.truong) {
    const v = chuoi(vao[f.k], 1200);
    if (v) ra[f.k] = v;
    else if (f.batBuoc) thieu.push(f.t);
  }
  if (thieu.length) return { ok: false, code: 'THIEUTRUONG', thieu, error: 'Thiếu trường bắt buộc: ' + thieu.join(' · ') + '.' };
  const truoc = await db.prepare('SELECT MAX(phienBan) p FROM hoSoVvip WHERE maNha = ? AND taiLieu = ?').bind(maNha, maTL).first();
  const pb = Number((truoc && truoc.p) || 0) + 1;
  await db.prepare('INSERT INTO hoSoVvip (id, maNha, taiLieu, phienBan, noiDungJson, boiAi, luc) VALUES (?,?,?,?,?,?,?)')
    .bind(maMoi('HS'), maNha, maTL, pb, JSON.stringify(ra), hoSo.u, bayGio()).run();
  await Kho.ghiNhatKy(db, { uid: hoSo.uid, username: hoSo.u, viec: 'VVIP_HOSO_GHI', doiTuong: maNha, chiTiet: 'tài liệu ' + maTL + ' bản ' + pb });
  return { ok: true, maNha, taiLieu: maTL, phienBan: pb };
}

export async function docHoSoVvip(y, env, db, hoSo) {
  const maNha = chuoi((y || {}).maNha, 40);
  if (!(await quyenHoSo(db, hoSo, maNha))) return LOI_NGOAI_NHA;
  const k = await db.prepare("SELECT k.maKhachHang ma, k.tang, k.coach, k.tuVan, k.vaoLuc, k.trangThai, k.boTro FROM hoSoKhach k WHERE k.maKhachHang = ?").bind(maNha).first();
  if (!k) return { ok: false, code: 'KHONGNHA', error: 'Không có nhà này.' };
  const nay = Date.now(), lv = lvCua(hoSo);
  const ban = {};
  const r = (await db.prepare('SELECT taiLieu, phienBan, noiDungJson, boiAi, luc FROM hoSoVvip WHERE maNha = ? ORDER BY taiLieu, phienBan DESC').bind(maNha).all()).results || [];
  for (const x of r) if (!ban[x.taiLieu]) ban[x.taiLieu] = { phienBan: x.phienBan, noiDung: JSON.parse(x.noiDungJson || '{}'), boiAi: x.boiAi, luc: x.luc };
  const nhom = (await nhomDaQuyet(db))[maNha] || 'CORE';
  const ho = await canHoTro(db, maNha, nay);
  const crm = await db.prepare('SELECT phuTrach, henTiep FROM crmKhach WHERE maKH = ?').bind(maNha).first() || {};
  const may = {
    '01': { maHoSo: 'GITA-VIP-' + maNha, nhom, recovery: ho.length ? ho : undefined, tang: k.tang, coach: k.coach || '', tuVan: k.tuVan || '', ranSoatTiep: crm.henTiep || '' },
    '03': { lienHe: await docTuyChon(db, maNha) },
    '05': { nhom, nhip: ho.length ? Math.min(NHIP.RECOVERY, NHIP[nhom] || NHIP.CORE) : (NHIP[nhom] || NHIP.CORE),
      phanCong: ((await db.prepare('SELECT vaiTro, nguoi, hangNguoi, ky, ngoaiChuan FROM phanCongVvip WHERE maNha = ? ORDER BY luc DESC, rowid DESC LIMIT 4').bind(maNha).all()).results || []),
      chuan: 'Thời gian phản hồi và quyền lợi theo chuẩn phục vụ của nhóm (màn Phân hạng VIP & VVIP).' },
    '07': { cham: ((await db.prepare('SELECT ngay, kieu, canCu, boiAi FROM soCham WHERE maNha = ? ORDER BY ngay DESC, rowid DESC LIMIT 60').bind(maNha).all()).results || []) },
    '10': { ngayTuChamCuoi: await chamCuoi(db, maNha), dauHieu: ho },
    '11': { soNhaDaGioiThieu: (await db.prepare('SELECT COUNT(*) c FROM hoSoKhach WHERE boTro = ?').bind(maNha).first()).c },
    '12': { dongYMoiNhat: ((await db.prepare('SELECT o, viec, ghiLuc FROM dongYDuLieu WHERE maNha = ? ORDER BY ghiLuc DESC, rowid DESC LIMIT 20').bind(maNha).all()).results || []),
      luotMoHoSo: ((await db.prepare("SELECT username, luc FROM audit WHERE viec = 'VVIP_HOSO_DOC' AND doiTuong = ? ORDER BY luc DESC LIMIT 20").bind(maNha).all()).results || []) }
  };
  if (lv <= 3) {
    const tu = new Date(nay - CUA_SO_NGAY * NGAY).toISOString(), den = new Date(nay + NGAY).toISOString();
    may['09'] = { doanhThuThucThu12: Math.round((await doanhThuTheoNha(db, tu, den))[maNha] || 0), loiNhuanDongGop: null,
      vi: 'Chi phí trực tiếp phục vụ theo nhà chưa có trong sổ — biên lợi nhuận đóng góp để trống, không ước bừa.' };
  }
  const du = ND.HO_SO_12.filter(t => t.truong).map(t => ({ ma: t.ma, co: !!ban[t.ma] }));
  await Kho.ghiNhatKy(db, { uid: hoSo.uid, username: hoSo.u, viec: 'VVIP_HOSO_DOC', doiTuong: maNha, chiTiet: 'mở bộ hồ sơ' });
  return { ok: true, maNha, ban, may, doDay: { coBan: du.filter(z => z.co).length, canViet: du.length, thieu: du.filter(z => !z.co).map(z => z.ma) },
    taiLieu: ND.HO_SO_12, namCauHoi: ND.NAM_CAU_HOI };
}

/* ═══════════════════ 8 · CHIẾN DỊCH ═══════════════════ */
const MAU_CD = [...ND.CHIEN_DICH_MKT_10.map(c => c.ma), ...ND.CHIEN_DICH_CS_6.map(c => c.ma), 'KHAC'];
export async function lapChienDichVvip(y, env, db, hoSo) {
  if (lvCua(hoSo) > 5) return { ok: false, code: 'NOPERM', error: 'Lập chiến dịch dành cho quản lý R01–R05.' };
  const c = (y || {}).chienDich || {};
  const d = { mau: chuoi(c.mau, 8), ten: chuoi(c.ten, 160), mucTieu: chuoi(c.mucTieu, 800), doLuong: chuoi(c.doLuong, 600),
    noiDung: chuoi(c.noiDung, 3000), khongLam: chuoi(c.khongLam, 600), batDau: chuoi(c.batDau, 10), ketThuc: chuoi(c.ketThuc, 10),
    doiTuong: Array.isArray(c.doiTuong) ? c.doiTuong.filter(z => ['VVIP', 'VIP', 'CORE', 'NURTURE'].indexOf(z) >= 0) : [] };
  const loi = [];
  if (MAU_CD.indexOf(d.mau) < 0) loi.push('mẫu (MK01–MK10 · CS01–CS06 · KHAC)');
  if (d.ten.length < 10) loi.push('tên ≥ 10 ký tự');
  if (d.mucTieu.length < 30) loi.push('mục tiêu ≥ 30 ký tự, viết thành thay đổi đo được');
  if (d.doLuong.length < 15) loi.push('cách đo');
  if (d.noiDung.length < 80) loi.push('nội dung ≥ 80 ký tự');
  if (d.khongLam.length < 20) loi.push('ranh giới KHÔNG làm ≥ 20 ký tự');
  if (!d.doiTuong.length) loi.push('đối tượng');
  const bd = Date.parse(d.batDau), kt = Date.parse(d.ketThuc);
  if (!(bd < kt) || (kt - bd) / NGAY > 120) loi.push('ngày bắt đầu < kết thúc, tối đa 120 ngày');
  if (loi.length) return { ok: false, code: 'THIEU', thieu: loi, error: 'Chiến dịch thiếu: ' + loi.join(' · ') + '.' };
  const tuyetDoi = CUM_TUYET_DOI.filter(z => (d.ten + ' ' + d.noiDung).toLowerCase().includes(z));
  if (tuyetDoi.length) return { ok: false, code: 'TUYETDOI', cum: tuyetDoi, error: 'Có từ tuyệt đối: ' + tuyetDoi.join(', ') + ' — bộ lọc quảng cáo QC1.' };
  const id = maMoi('CD');
  await db.prepare("INSERT INTO chienDichVvip (id, mau, noiDungJson, batDau, ketThuc, trangThai, taoBoi, taoLuc) VALUES (?,?,?,?,?,'choDuyet',?,?)")
    .bind(id, d.mau, JSON.stringify(d), d.batDau, d.ketThuc, hoSo.u, bayGio()).run();
  return { ok: true, id, trangThai: 'choDuyet' };
}
export async function duyetChienDichVvip(y, env, db, hoSo) {
  if (lvCua(hoSo) > 3) return { ok: false, code: 'NOPERM', error: 'Chỉ R01–R03 duyệt chiến dịch.' };
  const x = y || {}, id = chuoi(x.id, 60), quyet = x.quyet === 'tuChoi' ? 'tuChoi' : (x.quyet === 'huy' ? 'huy' : 'daDuyet');
  const d = await db.prepare('SELECT * FROM chienDichVvip WHERE id = ?').bind(id).first();
  if (!d) return { ok: false, code: 'KHONGCO', error: 'Không có chiến dịch này.' };
  if (quyet !== 'huy' && d.trangThai !== 'choDuyet') return { ok: false, code: 'DAXONG', error: 'Chiến dịch đã được xử lý.' };
  if (quyet === 'daDuyet' && String(d.taoBoi).toLowerCase() === String(hoSo.u).toLowerCase()) return { ok: false, code: 'TUDUYET', error: 'Người lập không tự duyệt chiến dịch của mình.' };
  await db.prepare('UPDATE chienDichVvip SET trangThai = ?, nguoiDuyet = ?, duyetLuc = ? WHERE id = ?').bind(quyet, hoSo.u, bayGio(), id).run();
  return { ok: true, id, trangThai: quyet };
}
/* Kết quả tính LÚC ĐỌC: số nhà đối tượng (theo nhóm HIỆN TẠI — nói rõ giả
   định ấy), số nhà đã chạm có gắn mã chiến dịch, và — chỉ R01–R03 — doanh
   thu nhóm đối tượng trong cửa sổ so với cửa sổ cùng độ dài ngay trước. */
export async function dsChienDichVvip(y, env, db, hoSo) {
  const lv = lvCua(hoSo);
  if (lv > 5) return { ok: false, code: 'NOPERM', error: 'Chiến dịch dành cho quản lý R01–R05.' };
  const r = (await db.prepare('SELECT * FROM chienDichVvip ORDER BY batDau DESC LIMIT 200').all()).results || [];
  const daQuyet = await nhomDaQuyet(db);
  const tatCa = ((await db.prepare("SELECT maKhachHang ma, trangThai FROM hoSoKhach").all()).results || []);
  const homNay = new Date().toISOString().slice(0, 10), ds = [];
  for (const c of r) {
    const d = JSON.parse(c.noiDungJson || '{}');
    const doiTuong = tatCa.filter(n => d.doiTuong.indexOf(daQuyet[n.ma] || (n.trangThai === 'dangHoc' ? 'CORE' : 'NURTURE')) >= 0).map(n => n.ma);
    const cham = await db.prepare('SELECT COUNT(DISTINCT maNha) c FROM soCham WHERE canCu LIKE ? AND ngay >= ? AND ngay <= ?').bind('%' + c.id + '%', c.batDau, c.ketThuc).first();
    let tt = c.trangThai;
    if (tt === 'daDuyet') tt = homNay < c.batDau ? 'sapChay' : (homNay <= c.ketThuc ? 'dangChay' : 'daXong');
    const dong = { id: c.id, mau: c.mau, ...d, trangThai: tt, taoBoi: c.taoBoi, nguoiDuyet: c.nguoiDuyet || undefined,
      ketQua: { soDoiTuong: doiTuong.length, daCham: cham.c, phuSong: tyLe(cham.c, doiTuong.length) } };
    if (lv <= 3 && doiTuong.length) {
      const dai = Date.parse(c.ketThuc) - Date.parse(c.batDau) + NGAY;
      const trong = await doanhThuTheoNha(db, c.batDau, new Date(Date.parse(c.ketThuc) + NGAY).toISOString());
      const truoc = await doanhThuTheoNha(db, new Date(Date.parse(c.batDau) - dai).toISOString(), c.batDau);
      const tong = m => Math.round(doiTuong.reduce((s, k) => s + (m[k] || 0), 0));
      dong.ketQua.doanhThuTrong = tong(trong); dong.ketQua.doanhThuTruoc = tong(truoc);
    }
    ds.push(dong);
  }
  return { ok: true, ds, mau: { mkt: ND.CHIEN_DICH_MKT_10, chamSoc: ND.CHIEN_DICH_CS_6 },
    giaDinh: 'Đối tượng tính theo nhóm HIỆN TẠI của mỗi nhà; lượt chạm của chiến dịch là lượt có mã chiến dịch trong ô căn cứ.' };
}

/* ═══════════════════ 9 · BẢNG ĐIỀU KHIỂN 80% + KPI ═══════════════════ */
export async function bangVvip(y, env, db, hoSo) {
  if (lvCua(hoSo) > 3) return { ok: false, code: 'NOPERM', error: 'Bảng doanh thu nhóm trọng điểm chỉ R01–R03 (luật tài chính).' };
  const nay = Date.now(), iso = t => new Date(t).toISOString();
  const a = iso(nay - CUA_SO_NGAY * NGAY), b = iso(nay + NGAY), a0 = iso(nay - 2 * CUA_SO_NGAY * NGAY);
  const dt = await doanhThuTheoNha(db, a, b), dt0 = await doanhThuTheoNha(db, a0, a);
  const daQuyet = await nhomDaQuyet(db);
  const cong = (m, f) => Object.entries(m).filter(([k]) => f(k)).reduce((s, [, v]) => s + v, 0);
  const tong = cong(dt, () => true), tong0 = cong(dt0, () => true);
  const laNhom = g => k => daQuyet[k] === g, laTrongDiem = k => !!daQuyet[k];
  const vvip = cong(dt, laNhom('VVIP')), vip = cong(dt, laNhom('VIP')), td = vvip + vip;
  /* Đường cong tập trung — chỉ nhà có doanh thu thực thu dương. */
  const duong = Object.values(dt).filter(v => v > 0).sort((x, y2) => y2 - x), sumDuong = duong.reduce((s, v) => s + v, 0);
  let luy = 0, soNha80 = null; const cong10 = [];
  duong.forEach((v, i) => { luy += v; if (soNha80 == null && luy >= 0.8 * sumDuong) soNha80 = i + 1; });
  for (let p = 1; p <= 10; p++) { const n = Math.ceil(duong.length * p / 10); cong10.push(tyLe(duong.slice(0, n).reduce((s, v) => s + v, 0), sumDuong)); }
  const top20 = duong.slice(0, Math.max(1, Math.ceil(duong.length * 0.2))).reduce((s, v) => s + v, 0);
  const tang = tong - tong0, tangTD = td - cong(dt0, laTrongDiem);
  const ruiRo = [];
  if (duong.length && duong[0] / sumDuong > 0.15) ruiRo.push('Một nhà chiếm ' + String(tyLe(duong[0], sumDuong)).replace('.', ',') + '% doanh thu — tập trung cao là phụ thuộc cao: nhà ấy rời đi thì doanh thu tụt tương ứng.');
  if (duong.length < 20) ruiRo.push('Mới ' + duong.length + ' nhà có doanh thu — mẫu nhỏ, tỷ trọng dao động mạnh khi thêm bớt một nhà.');
  const baChiSo = {
    DOANHTHU: { giaTri: tyLe(td, tong), vvip: tyLe(vvip, tong), vip: tyLe(vip, tong), dich: ND.MUC_TIEU_80.dich, tong: Math.round(tong), trongDiem: Math.round(td),
      soNhaVVIP: Object.values(daQuyet).filter(z => z === 'VVIP').length, soNhaVIP: Object.values(daQuyet).filter(z => z === 'VIP').length },
    LOINHUAN: { giaTri: null, vi: 'Chưa đo được: sổ chưa có chi phí trực tiếp phục vụ theo từng nhà (giờ coach, tài liệu, sự kiện). Cần quyết định QD3 trước khi tính.' },
    TANGTRUONG: tang > 0 ? { giaTri: tyLe(tangTD, tang), tangTong: Math.round(tang), tangTrongDiem: Math.round(tangTD),
      giaDinh: 'So 12 tháng gần nhất với 12 tháng trước đó, theo nhóm HIỆN TẠI của mỗi nhà.' }
      : { giaTri: null, vi: tong0 === 0 ? 'Chưa có dữ liệu kỳ gốc (12 tháng trước).' : 'Doanh thu không tăng so với kỳ gốc — tỷ trọng tăng trưởng không xác định.' }
  };
  /* KPI — đo được thì có giaTri; không thì vi. Không trả 0 thay cho "chưa đo". */
  const ngay12 = a.slice(0, 10), homNay = iso(nay).slice(0, 10);
  const K = {};
  K.K02 = { giaTri: (await db.prepare("SELECT COUNT(*) c FROM crmKhach WHERE giaiDoan IN ('moi','tuvan')").first()).c, donVi: 'nhà' };
  const ch = await db.prepare("SELECT SUM(trangThai = 'thang') t, SUM(trangThai = 'thua') u FROM crmCoHoi WHERE COALESCE(capNhatLuc, taoLuc) >= ?").bind(a).first();
  K.K03 = (Number(ch.t || 0) + Number(ch.u || 0)) ? { giaTri: tyLe(Number(ch.t || 0), Number(ch.t || 0) + Number(ch.u || 0)), donVi: '%' } : { vi: 'Chưa có cơ hội nào đóng (thắng/thua) trong 12 tháng.' };
  const qc = (await db.prepare("SELECT SUM(soTien) s FROM chiPhi WHERE khoanMuc = ? AND trangThai = 'daDuyet' AND ngayChi >= ?").bind(MUC_QUANG_CAO, ngay12).first()).s || 0;
  const nhaMoi = (await db.prepare('SELECT COUNT(*) c FROM hoSoKhach WHERE vaoLuc >= ?').bind(a).first()).c;
  K.K04 = nhaMoi ? { giaTri: Math.round(qc / nhaMoi), donVi: 'đồng/nhà mới', ghiChu: 'Lợi nhuận đóng góp chưa đo được (xem ba chỉ số).' } : { vi: 'Chưa có nhà mới trong 12 tháng.' };
  const cu = await db.prepare("SELECT COUNT(*) n, SUM(trangThai = 'dangHoc') o FROM hoSoKhach WHERE vaoLuc <= ?").bind(iso(nay - 90 * NGAY)).first();
  K.K05 = cu.n ? { giaTri: tyLe(Number(cu.o || 0), cu.n), donVi: '%' } : { vi: 'Chưa có nhà vào trên 90 ngày.' };
  const hl = await db.prepare('SELECT COUNT(*) n, SUM(csat >= 4) d FROM danhGiaKH WHERE csat IS NOT NULL AND luc >= ?').bind(iso(nay - 90 * NGAY)).first();
  K.K06 = hl.n ? { giaTri: tyLe(Number(hl.d || 0), hl.n), donVi: '%', ghiChu: 'Phần "tỷ lệ xử lý vấn đề" chưa nối Service Desk.' } : { vi: 'Chưa có phiếu CSAT trong 90 ngày.' };
  const gt = await db.prepare('SELECT COUNT(*) n, SUM(boTro IS NOT NULL AND boTro <> \'\') g FROM hoSoKhach WHERE vaoLuc >= ?').bind(a).first();
  K.K08 = gt.n ? { giaTri: tyLe(Number(gt.g || 0), gt.n), donVi: '%' } : { vi: 'Chưa có nhà mới trong 12 tháng.' };
  const pv = await soatPhucVuVvip({}, env, db, hoSo);
  K.K09 = pv.tong ? { giaTri: tyLe(pv.tong - pv.quaHan, pv.tong), donVi: '%' } : { vi: 'Chưa có nhà nào được duyệt vào nhóm VIP/VVIP.' };
  const kpi = ND.KPI_10.map(k => ({ ...k, ...(K[k.ma] || {}) }));
  const dc = (await db.prepare("SELECT noiDungJson, chuanJson FROM diemChamWow WHERE trangThai = 'daDuyet'").all()).results || [];
  const dcDat = dc.filter(z => soatDiemCham(JSON.parse(z.noiDungJson || '{}')).thieu.length === 0 && (JSON.parse(z.chuanJson || '[]')).length === ND.CHUAN_WOW_10.length).length;
  const M = { M2: dc.length ? { giaTri: tyLe(dcDat, dc.length) } : { vi: 'Chưa có điểm chạm nào đang bật.' },
    M4: pv.tong ? { giaTri: tyLe(pv.coKeHoach, pv.tong) } : { vi: 'Chưa có nhà nào được duyệt vào nhóm VIP/VVIP.' } };
  const thuNghiem = ND.MUC_TIEU_THU_4.map(m => ({ ...m, ...(M[m.ma] || {}), dat: M[m.ma] && M[m.ma].giaTri != null ? M[m.ma].giaTri >= m.nguong : undefined }));
  return { ok: true, cuaSo: { tu: a.slice(0, 10), den: homNay }, baChiSo, tapTrung: { soNha: duong.length, top20: tyLe(top20, sumDuong), soNha80, cong10 },
    ruiRo, kpi, thuNghiem, canhBao: ND.MUC_TIEU_80.canhBao, kpiCanhBao: ND.KPI_CANH_BAO };
}

/* ═══════════════════ 10 · NỘI DUNG BLUEPRINT ═══════════════════ */
export async function noiDungVvip(y, env, db, hoSo) {
  if (!laNguoiNha(hoSo)) return { ok: false, code: 'NOPERM', error: 'Nội dung Blueprint VVIP dành cho nhân sự R01–R12.' };
  return { ok: true, meta: ND.BP_META, cayTien: ND.BP_CAY_TIEN, hoSo12: ND.HO_SO_12, namCauHoi: ND.NAM_CAU_HOI, nhom5: ND.NHOM_5, luatNhom: ND.LUAT_NHOM,
    giaiDoan5: ND.GIAI_DOAN_5, quyMoWow: ND.QUY_MO_WOW, lop7: ND.LOP_7, nhomWow10: ND.NHOM_WOW_10, wowKhongDat: ND.WOW_KHONG_DAT, mauDiemCham10: ND.MAU_DIEM_CHAM_10,
    tanSuat5: ND.TAN_SUAT_5, tranTanSuat: ND.TRAN_TAN_SUAT, chuanWow10: ND.CHUAN_WOW_10, sanPham6: ND.SAN_PHAM_6, luatSanPham: ND.LUAT_SAN_PHAM, chuyenTiep: ND.CHUYEN_TIEP,
    dongCo6: ND.DONG_CO_6, chienDichMkt10: ND.CHIEN_DICH_MKT_10, chienDichCs6: ND.CHIEN_DICH_CS_6, pheu11: ND.PHEU_11, khaiThacDinhNghia: ND.KHAI_THAC_DINH_NGHIA,
    khaiThac7: ND.KHAI_THAC_7, mucTieu80: ND.MUC_TIEU_80, tang8: ND.TANG_8, thanhPhan8: ND.THANH_PHAN_8, quyTacTuDong: ND.QUY_TAC_TU_DONG, kpi10: ND.KPI_10,
    mucTieuThu4: ND.MUC_TIEU_THU_4, kpiCanhBao: ND.KPI_CANH_BAO, loTrinh90: ND.LO_TRINH_90, uuTienDauTu: ND.UU_TIEN_DAU_TU, quyetDinh5: ND.QUYET_DINH_5,
    baoVe6: ND.BAO_VE_6, ketLuan: ND.KET_LUAN, chuanNguoiPhucVu: ND.CHUAN_NGUOI_PHUC_VU };
}
