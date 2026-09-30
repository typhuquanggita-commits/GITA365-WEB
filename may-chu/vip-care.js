/* ═══════════════════════════════════════════════════════════════
   GITA 365 — CÂY TIỀN VIP AUTO-CARE

   Hệ thống chăm sóc khách hàng VIP tự động để tăng chuyển đổi T2→T5.
   Kết nối với CRM, điểm số, và Agent teamwork.

   Nguyên tắc:
     · Mỗi nhà T2+ có một điểm readiness (0–100).
     · Hệ thống tự động tạo touchpoint theo quy tắc (quyTacCham).
     · Khi readiness đủ cao, gợi ý nâng tầng và handoff cho coach/tư vấn.
     · Không tự nâng tầng — chỉ gợi ý và lên lịch chạm.
   ═══════════════════════════════════════════════════════════════ */

import { Kho } from './nen.js';

import { BAC } from './vai-tro.js';

/* Trọng số điểm readiness: KPI chiếm 70%, engagement 30%. */
function tinhReadiness(hoSoKhach, soCham) {
  const kpi = Number((hoSoKhach && hoSoKhach.kpi) || 0);
  const kpiReady = Math.min(100, Math.floor((kpi / 80) * 100));
  const cham = Array.isArray(soCham) ? soCham.length : Number(soCham || 0);
  const engageReady = cham >= 4 ? 100 : (cham >= 2 ? 60 : 30);
  return Math.floor(kpiReady * 0.7 + engageReady * 0.3);
}

/* Mốc nâng tầng theo tier hiện tại. */
function tiepTheo(tier) {
  const map = { 2: 3, 3: 4, 4: 5 };
  return map[Number(tier)] || null;
}

/** Tính readiness cho một khách VIP. */
export async function tinhReadyVip(y, env, db, hoSo) {
  if ((BAC[hoSo.role] || 99) > 12 && hoSo.role !== 'R13' && hoSo.role !== 'R14')
    return { ok: false, code: 'NOPERM' };
  const maKH = String(y.maKH || '').trim();
  if (!maKH) return { ok: false, error: 'Thiếu mã khách.' };

  const khach = await db.prepare(
    'SELECT id, ma, ten, tier, kpi, coach, tuVan FROM hoSoKhach WHERE ma = ?'
  ).bind(maKH).first();
  if (!khach) return { ok: false, error: 'Không tìm thấy khách.' };

  const soCham = await db.prepare(
    'SELECT COUNT(*) n FROM soCham WHERE maKhachHang = ?'
  ).bind(maKH).first();

  const ready = tinhReadiness(khach, (soCham && soCham.n) || 0);
  const nextTier = tiepTheo(khach.tier);

  await Kho.ghiNhatKy(db, { uid: hoSo.uid, username: hoSo.u,
    viec: 'VIP_TINH_READY', doiTuong: maKH,
    chiTiet: 'T' + khach.tier + ' · ready ' + ready + '% · next T' + nextTier });

  return { ok: true, maKH, tier: khach.tier, ready, nextTier,
    deNghiNangTang: ready >= 80 && nextTier !== null };
}

/** Gợi ý bước chăm sóc tiếp theo dựa trên readiness. */
export async function deXuatChamSocVip(y, env, db, hoSo) {
  const r = await tinhReadyVip(y, env, db, hoSo);
  if (!r.ok) return r;

  let hanhDong = 'tiep_tuc_cham';
  let noiDung = 'Tiếp tục đồng hành, ghi nhận tiến bộ nhỏ.';
  if (r.ready < 40) {
    hanhDong = 'can_tho';
    noiDung = 'Khách cần được lắng nghe — gọi điện trong 24 giờ.';
  } else if (r.ready < 70) {
    hanhDong = 'gui_tai_lieu';
    noiDung = 'Gửi tài liệu phù hợp tier T' + r.tier + ' và theo dõi phản hồi.';
  } else if (r.deNghiNangTang) {
    hanhDong = 'de_xuat_nang_tang';
    noiDung = 'Readiness ' + r.ready + '% — đề xuất nâng lên T' + r.nextTier;
  }

  return { ok: true, maKH: r.maKH, tier: r.tier, ready: r.ready,
    hanhDong, noiDung, nextTier: r.nextTier };
}

/** Lập danh sách khách VIP cần chạm trong ngày. */
export async function dsVipCanCham(y, env, db, hoSo) {
  if ((BAC[hoSo.role] || 99) > 5)
    return { ok: false, code: 'NOPERM', error: 'Chỉ R01–R05 xem danh sách VIP cần chạm.' };

  const ds = await db.prepare(
    'SELECT ma, ten, tier, kpi FROM hoSoKhach WHERE tier >= 2 AND tier < 5 ORDER BY kpi DESC LIMIT 200'
  ).all();

  const ketQua = [];
  for (const k of (ds.results || [])) {
    const soCham = await db.prepare(
      'SELECT COUNT(*) n FROM soCham WHERE maKhachHang = ?'
    ).bind(k.ma).first();
    const ready = tinhReadiness(k, (soCham && soCham.n) || 0);
    ketQua.push({ maKH: k.ma, ten: k.ten, tier: k.tier, kpi: k.kpi, ready,
      canNangTang: ready >= 80 && tiepTheo(k.tier) !== null });
  }

  return { ok: true, tong: ketQua.length,
    canNangTang: ketQua.filter(x => x.canNangTang).length,
    ds: ketQua.sort((a, b) => b.ready - a.ready) };
}
