/* ═══════════════════════════════════════════════════════════════
   GITA 365 — CÂY TIỀN · KPI TẬP ĐOÀN ĐO TỪ DỮ LIỆU THẬT

   Ba đích chủ hệ đặt: 90% khách hài lòng · 90% tái dùng/nâng cấp ·
   20% khách đạt tầng 5. Cửa này KHÔNG nhận con số khai — mọi chỉ số
   tính lúc đọc từ D1 (hoSoKhach · phieuThu · lichSuTang · hoanTien ·
   crmKhach), cùng luật "bậc trưởng thành tính lúc đọc" (HE-L4).

   ══ NÓI THẬT VỀ "HÀI LÒNG" ══
   Hệ chưa có khảo sát NPS trực tiếp. "Hài lòng" ở đây là PROXY: khách
   KHÔNG rơi vào ba dấu hiệu xấu (đã hoàn tiền · CRM ghi "rời" · hồ sơ
   "nghỉ"). Proxy này lạc quan — khách im lặng bỏ đi chưa chắc bị ghi.
   Chỗ trống được ghi trong kết quả trả về (khoangTrong), không giấu.
   ═══════════════════════════════════════════════════════════════ */
'use strict';

import { laNguoiNha } from './vai-tro.js';

export const DICH_CAY_TIEN = { haiLong: 90, taiDungNangCap: 90, tang5: 20 };

const dem = async (db, sql) => {
  const r = await db.prepare(sql).first();
  return (r && r.n) || 0;
};

export async function docKpiCayTien(y, env, db, hoSo) {
  if (!laNguoiNha(hoSo)) return { ok: false, code: 'NOPERM', error: 'Mở cho R01–R12.' };
  const tong = await dem(db, 'SELECT COUNT(*) n FROM hoSoKhach');
  if (!tong) return { ok: true, tong: 0, dich: DICH_CAY_TIEN,
    ghiChu: 'Chưa có khách nào trong hồ sơ — mọi chỉ số sẽ tính khi có dữ liệu thật.',
    khoangTrong: ['Chưa có khảo sát hài lòng trực tiếp (NPS/CSAT) — "hài lòng" đang đo bằng dấu hiệu KHÔNG xấu, một proxy lạc quan.'] };

  const dangHoc = await dem(db, "SELECT COUNT(*) n FROM hoSoKhach WHERE trangThai = 'dangHoc'");
  const tang5 = await dem(db, 'SELECT COUNT(*) n FROM hoSoKhach WHERE tang >= 5');
  /* Tái dùng: ≥2 phiếu thu đã duyệt. Nâng cấp: đã từng lên tầng.
     HỢP của hai tập (UNION) — không cộng dồn để tránh đếm hai lần. */
  const taiDungNangCap = await dem(db,
    'SELECT COUNT(*) n FROM (SELECT maKhachHang FROM phieuThu WHERE trangThai = \'daDuyet\' GROUP BY maKhachHang ' +
    'HAVING COUNT(*) >= 2 UNION SELECT maKhachHang FROM lichSuTang WHERE denTang > COALESCE(tuTang, 0))');
  /* Dấu hiệu xấu: hoàn tiền đã duyệt · CRM "rời" · hồ sơ "nghỉ". */
  const xau = await dem(db,
    'SELECT COUNT(*) n FROM (SELECT maKhachHang FROM hoanTien WHERE trangThai = \'daDuyet\' ' +
    'UNION SELECT maKH FROM crmKhach WHERE giaiDoan = \'roi\' ' +
    'UNION SELECT maKhachHang FROM hoSoKhach WHERE trangThai = \'nghi\')');

  const pct = n => Math.round(n * 1000 / tong) / 10;
  const kpi = [
    { ma: 'HAILONG', ten: 'Khách hài lòng', dich: DICH_CAY_TIEN.haiLong, giaTri: pct(tong - xau), donVi: '%',
      congThuc: '(tổng khách − khách có dấu hiệu xấu) / tổng', nguon: 'hoanTien · crmKhach · hoSoKhach', proxy: true },
    { ma: 'TAIDUNG', ten: 'Tái dùng + nâng cấp', dich: DICH_CAY_TIEN.taiDungNangCap, giaTri: pct(taiDungNangCap), donVi: '%',
      congThuc: 'khách có ≥2 phiếu thu đã duyệt hoặc đã lên tầng / tổng', nguon: 'phieuThu · lichSuTang' },
    { ma: 'TANG5', ten: 'Khách đạt tầng 5', dich: DICH_CAY_TIEN.tang5, giaTri: pct(tang5), donVi: '%',
      congThuc: 'khách ở tầng ≥ 5 / tổng', nguon: 'hoSoKhach.tang' }
  ].map(k => Object.assign(k, { dat: k.giaTri >= k.dich, conThieu: Math.max(0, Math.round((k.dich - k.giaTri) * 10) / 10) }));

  return { ok: true, tong, dangHoc, tang5, dich: DICH_CAY_TIEN, kpi,
    khoangTrong: ['"Hài lòng" là proxy (không xấu), chưa phải khảo sát trực tiếp — khách im lặng bỏ đi có thể chưa bị ghi. Việc cần làm: thêm khảo sát CSAT sau mỗi mốc lên tầng.'] };
}
