/* ═══════════════════════════════════════════════════════════════
   GITA 365 — KIM CHỈ NAM CHO MỌI MÀN CỦA KHÁCH

   Chủ hệ 10/10: "Toàn bộ các phần của khách hàng đều có bản đồ kim chỉ
   nam chỉ dẫn, để họ không thấy cô đơn — luôn có người đồng hành hỗ trợ,
   luôn có chuyên gia bên cạnh."

   Chủ hệ 10/10, nói rõ thêm: dải kim chỉ nam GẮN VỚI NHIỆM VỤ — với các
   phần của khách VÀ với công việc của thành viên hệ thống — không thành
   một màn riêng hay giao diện riêng gây dư thừa.

   Nên cửa này trả lời ba câu, và "bước tiếp" là một VIỆC THẬT, không phải
   một tên màn:
   · Khách: tầng của nhà · việc hôm nay (đọc từ docHomNay, đúng một việc) ·
     ai đi cùng và ai đứng sau người đi cùng.
   · Thành viên: cấp chứng chỉ · việc đang chờ chính người ấy (ý kiến chờ
     duyệt → bài chờ chấm → thông báo chưa đọc → ngày thi) · ai đỡ họ khi
     việc khó. Đọc thẳng từ các cửa đã có (dsYKien · dsBaiCham · thiCuaToi ·
     bảng thongBao), không giữ bản chép nào.

   ══ BA LUẬT ══
   1. CHỈ ĐỌC. Không một câu ghi nào — dải này hiện ở mọi màn, mọi lượt vẽ
      lại; một cửa ghi đặt ở đó là một nguồn rác cho sổ.
   2. CHỈ HỌ TÊN, không tên đăng nhập, email hay số điện thoại của nhân
      sự. Gia đình cần biết người đi cùng mình là ai; họ không cần — và
      không được — cầm định danh đăng nhập của người ấy.
   3. NHÀ LẤY TỪ PHIÊN, không nhận mã nhà từ người gọi. Nhận mã nhà từ thân
      yêu cầu là để một phụ huynh đọc được người phụ trách nhà khác — đúng
      lớp lỗi IDOR đã gỡ ở 9.99.114 (nhaCuaMinh).

   Chưa xếp người phụ trách thì NÓI là đang xếp — không bịa một cái tên,
   và không đọc ra "không có ai" như thể nhà bị bỏ rơi.
   ═══════════════════════════════════════════════════════════════ */
'use strict';

import { Kho } from './nen.js';
import { roleOf, BAC } from './vai-tro.js';
import { docHomNay } from './hom-nay.js';
import { dsBaiCham, dsYKien, thiCuaToi } from './thi-cap.js';

export const VAI_KHACH = Object.freeze(['R13', 'R14', 'R15']);

async function nhaCuaPhien(db, hoSo) {
  const uid = await Kho.layUid(db, hoSo.u);
  if (!uid) return null;
  const nd = await db.prepare('SELECT maKhachHang, studentId FROM users WHERE id = ? AND deletedAt IS NULL').bind(uid).first();
  if (!nd) return null;
  if (nd.maKhachHang) {
    const k = await db.prepare('SELECT maKhachHang, tang, coach, tuVan FROM hoSoKhach WHERE maKhachHang = ?').bind(nd.maKhachHang).first();
    if (k) return Object.assign({ cuaPhien: true }, k);
  }
  /* Học viên: tài khoản của con không mang mã nhà, nhưng hồ sơ nhà ghi
     mã học viên của con. */
  if (nd.studentId) {
    const k = await db.prepare('SELECT maKhachHang, tang, coach, tuVan FROM hoSoKhach WHERE maHocVien = ? ORDER BY vaoLuc DESC, rowid DESC LIMIT 1').bind(nd.studentId).first();
    if (k) return k;
  }
  return null;
}

async function hoTenCua(db, ten) {
  if (!ten) return null;
  const r = await db.prepare('SELECT hoTen FROM users WHERE lower(username) = ? AND active = 1 AND deletedAt IS NULL').bind(String(ten).toLowerCase()).first();
  /* Người phụ trách đã nghỉ (không còn hoạt động) thì coi như chưa xếp —
     hiện tên một người đã rời đi là hứa một người không còn ở đó. */
  if (!r) return null;
  return { ten: String(r.hoTen || '').trim() || null };
}

/* Ai đỡ một thành viên khi việc khó — theo đúng đường xin ý kiến đã chạy
   (thi-cap.js · duyetYKien: người duyệt phải cao bậc hơn người xin). */
const DO_THEO_VAI = { R05: 'R04', R04: 'R03', R03: 'R01', R02: 'R01', R11: 'R04', R12: 'R04' };
const TEN_VAI_DO = { R01: 'Super Admin', R03: 'Giám đốc', R04: 'Trưởng nhóm chuyên môn', R05: 'Trưởng nhóm Coach' };
async function nguoiDo(db, vai) {
  const len = DO_THEO_VAI[vai] || ((BAC[vai] || 99) >= 6 && (BAC[vai] || 99) <= 10 ? 'R05' : null);
  if (!len) return null;
  const r = await db.prepare('SELECT hoTen FROM users WHERE role = ? AND active = 1 AND deletedAt IS NULL ORDER BY createdAt ASC, rowid ASC LIMIT 1').bind(len).first();
  return { vai: TEN_VAI_DO[len] || len, ten: (r && String(r.hoTen || '').trim()) || null };
}

async function kimChiNamThanhVien(env, db, hoSo, vai) {
  const bac = BAC[vai] || 99;
  const viec = [];
  if (bac <= 5) {
    const yk = await dsYKien({}, env, db, hoSo);
    const cho = yk.ok ? yk.ds.filter(x => !x.quyet && x.boiAi !== String(hoSo.u || '').toLowerCase()).length : 0;
    if (cho) viec.push({ loai: 'yKien', so: cho, nhan: 'Duyệt ' + cho + ' ý kiến đang chờ', man: 'thi-chung-chi' });
  }
  if (bac <= 6) {
    const bc = await dsBaiCham({}, env, db, hoSo);
    const n = bc.ok ? bc.ds.length : 0;
    if (n) viec.push({ loai: 'baiCham', so: n, nhan: 'Chấm ' + n + ' bài thi đang chờ', man: 'thi-chung-chi' });
  }
  const tb = await db.prepare('SELECT COUNT(*) n FROM thongBao WHERE (denVai = ? OR denAi = ?) AND docLuc IS NULL').bind(vai, hoSo.u).first();
  if (tb && tb.n) viec.push({ loai: 'thongBao', so: tb.n, nhan: 'Đọc ' + tb.n + ' thông báo đang chờ' });
  const toi = await thiCuaToi({}, env, db, hoSo);
  const cap = toi.ok ? toi.he.map(x => ({ he: x.ten, cap: x.cap, soCap: x.soCap, datThangNay: x.datThangNay })) : [];
  if (toi.ok && toi.moHomNay && toi.he.some(x => x.conLanThang > 0 && !x.datThangNay))
    viec.push({ loai: 'thi', so: 1, nhan: 'Hôm nay là ngày thi chứng chỉ', man: 'thi-chung-chi' });
  return { ok: true, vai, thanhVien: true, cap, viec, buocTiep: viec[0] || null, nguoiDo: await nguoiDo(db, vai),
    chuyenGia: vai === 'R01' ? 'Anh/chị là người quyết cuối của hệ.' : 'Việc vượt cấp của mình thì xin ý kiến trước khi trả lời khách — luôn bật.' };
}

export async function kimChiNam(y, env, db, hoSo) {
  const vai = roleOf(hoSo);
  if ((BAC[vai] || 99) <= 12) return kimChiNamThanhVien(env, db, hoSo, vai);
  if (!VAI_KHACH.includes(vai)) return { ok: false, code: 'NOPERM', error: 'Vai này không có kim chỉ nam.' };
  if (vai === 'R15') {
    return { ok: true, vai, nha: false, tang: null, nguoiDongHanh: [],
      chuyenGia: 'Ban vận hành của Học viện hỗ trợ cộng tác viên; việc khó được chuyển lên Trưởng nhóm chuyên môn.' };
  }
  const k = await nhaCuaPhien(db, hoSo);
  if (!k) {
    return { ok: true, vai, nha: false, tang: null, nguoiDongHanh: [],
      chuyenGia: 'Hồ sơ nhà mình đang được lập. Xong là nhà mình thấy ngay người đi cùng ở đây.' };
  }
  const ds = [];
  for (const [ma, nhan] of [['coach', 'Coach'], ['tuVan', 'Chuyên gia tư vấn']]) {
    const n = await hoTenCua(db, k[ma]);
    ds.push(n ? { vai: nhan, ten: n.ten || (nhan + ' của nhà mình'), daXep: true } : { vai: nhan, daXep: false });
  }
  const tang = Number(k.tang);
  /* Việc hôm nay — đúng một việc, đọc từ chính cửa của màn Hôm nay. Chỉ
     tài khoản mang mã nhà (cha mẹ) mới hỏi được cửa ấy. */
  let viecHomNay = null;
  if (k.cuaPhien) {
    const hn = await docHomNay({ maNha: k.maKhachHang }, env, db, hoSo);
    if (hn && hn.ok) viecHomNay = hn.dangBao ? { dangBao: true } : hn.viecLon ? { ten: hn.viecLon.ten, conLai: hn.conLai }
      : { xongHet: !!hn.xongHet, chuaCoNhip: !!hn.chuaCoNhip };
  }
  return { ok: true, vai, nha: true, tang: tang >= 1 && tang <= 5 ? tang : null, nguoiDongHanh: ds, viecHomNay,
    chuyenGia: 'Khi việc khó vượt quá phần của người đi cùng, họ xin ý kiến Trưởng nhóm chuyên môn trước khi trả lời nhà mình.' };
}
