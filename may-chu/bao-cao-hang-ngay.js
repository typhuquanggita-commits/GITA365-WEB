/* ═══════════════════════════════════════════════════════════════
   GITA 365 — ĐÁNH GIÁ BÁO CÁO HÀNG NGÀY

   Cổng cho phép khách hàng gửi báo cáo hàng ngày (KPI, cảm xúc, ghi chú)
   và hệ thống đánh giá chuẩn xác:
     - Chấm điểm tự động theo các tiêu chí có thể đo
     - Cross-check với dữ liệu thực (bài học, chạm, thanh toán)
     - Phát hiện bất thường (anomaly)
     - Tổng hợp 7/30/90 ngày
   ═══════════════════════════════════════════════════════════════ */

import { Kho, tokenMoi } from './nen.js';
import { bacVai } from './vai-tro.js';

function homNay() { return new Date().toISOString().slice(0, 10); }
function ngayHopLe(ngay) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(ngay)) return false;
  const d = new Date(ngay + 'T00:00:00Z');
  return Number.isFinite(d.getTime()) && d.toISOString().slice(0, 10) === ngay;
}

async function hoSoDuocTruyCap(db, maKH, hoSo) {
  const khach = await db.prepare(
    'SELECT uidPhuHuynh, maHocVien FROM hoSoKhach WHERE maKhachHang=?'
  ).bind(maKH).first();
  if (!khach || (bacVai(hoSo) > 4 && khach.uidPhuHuynh !== hoSo.uid)) return null;
  return khach;
}

/** Gửi báo cáo hàng ngày. */
export async function guiBaoCaoNgay(y, env, db, hoSo) {
  y = y || {};
  const uid = hoSo.uid;
  const maKH = String(y.maKH || '').trim();
  const ngay = String(y.ngay || '').trim() || homNay();
  const baiHoc = Number(y.baiHoc);
  const phutHoc = Number(y.phutHoc);
  const camXuc = String(y.camXuc || '').trim().slice(0, 80);
  const kpi = Number(y.kpi);
  const ghiChu = String(y.ghiChu || '').trim().slice(0, 1000);
  if (!maKH) return { ok: false, error: 'Thiếu mã khách hàng.' };
  const khach = await hoSoDuocTruyCap(db, maKH, hoSo);
  if (!khach) return { ok: false, code: 'NOPERM', error: 'Không có quyền gửi báo cáo cho hồ sơ này.' };
  if (!ngayHopLe(ngay) || ngay > homNay())
    return { ok: false, error: 'Ngày báo cáo không hợp lệ.' };
  if (!Number.isInteger(baiHoc) || baiHoc < 0 || baiHoc > 50 ||
      !Number.isInteger(phutHoc) || phutHoc < 0 || phutHoc > 1440 ||
      !Number.isFinite(kpi) || kpi < 0 || kpi > 100)
    return { ok: false, error: 'Bài học, thời lượng hoặc KPI nằm ngoài giới hạn hợp lệ.' };

  const id = 'BC-' + tokenMoi().slice(0, 16);
  await db.prepare(
    'INSERT INTO baoCaoNgay (id,uid,maKhachHang,ngay,baiHoc,phutHoc,camXuc,kpi,ghiChu,guiLuc) ' +
    'VALUES (?,?,?,?,?,?,?,?,?,?) ' +
    'ON CONFLICT(maKhachHang,ngay) DO UPDATE SET baiHoc=excluded.baiHoc, phutHoc=excluded.phutHoc, ' +
    'camXuc=excluded.camXuc, kpi=excluded.kpi, ghiChu=excluded.ghiChu, guiLuc=excluded.guiLuc'
  ).bind(id, uid, maKH, ngay, baiHoc, phutHoc, camXuc, kpi, ghiChu, new Date().toISOString()).run();

  const danhGia = await danhGiaBaoCao(db, khach.maHocVien, ngay, { baiHoc, phutHoc, camXuc, kpi });
  await Kho.ghiNhatKy(db, { uid, username: hoSo.u, viec: 'BAOCAO_NGAY_GUI',
    doiTuong: maKH, chiTiet: 'ngay=' + ngay + '|diem=' + danhGia.diem });

  return { ok: true, maKH, ngay, danhGia };
}

async function danhGiaBaoCao(db, maHocVien, ngay, baoCao) {
  let diem = 0;
  const chiTiet = [];

  /* 1. Số bài học (tối đa 30 điểm). */
  if (baoCao.baiHoc >= 3) { diem += 30; chiTiet.push({ tieuChi: 'baiHoc', diem: 30, nhanXet: 'Hoàn thành ≥ 3 bài' }); }
  else if (baoCao.baiHoc >= 1) { diem += 15; chiTiet.push({ tieuChi: 'baiHoc', diem: 15, nhanXet: 'Hoàn thành 1–2 bài' }); }
  else { chiTiet.push({ tieuChi: 'baiHoc', diem: 0, nhanXet: 'Chưa ghi nhận bài học' }); }

  /* 2. Thời gian học (tối đa 30 điểm). */
  if (baoCao.phutHoc >= 45) { diem += 30; chiTiet.push({ tieuChi: 'phutHoc', diem: 30, nhanXet: 'Học ≥ 45 phút' }); }
  else if (baoCao.phutHoc >= 20) { diem += 15; chiTiet.push({ tieuChi: 'phutHoc', diem: 15, nhanXet: 'Học 20–44 phút' }); }
  else { chiTiet.push({ tieuChi: 'phutHoc', diem: 0, nhanXet: 'Học dưới 20 phút' }); }

  /* 3. KPI tự đánh giá (tối đa 20 điểm). */
  diem += Math.min(20, Math.round(baoCao.kpi / 5));
  chiTiet.push({ tieuChi: 'kpi', diem: Math.min(20, Math.round(baoCao.kpi / 5)), nhanXet: 'KPI tự báo ' + baoCao.kpi + '%' });

  /* 4. Cảm xúc tích cực (tối đa 20 điểm). */
  const cxTichCuc = ['vui','hào hứng','tự tin','thoải mái','tốt','hạnh phúc','phấn khởi'];
  const cxTieuCuc = ['buồn','mệt','chán','tuyệt vọng','lo lắng','tức giận','sợ'];
  const cx = String(baoCao.camXuc).toLowerCase();
  if (cxTichCuc.some(c => cx.includes(c))) { diem += 20; chiTiet.push({ tieuChi: 'camXuc', diem: 20, nhanXet: 'Cảm xúc tích cực' }); }
  else if (cxTieuCuc.some(c => cx.includes(c))) { chiTiet.push({ tieuChi: 'camXuc', diem: 0, nhanXet: 'Cần quan tâm cảm xúc' }); }
  else { diem += 10; chiTiet.push({ tieuChi: 'camXuc', diem: 10, nhanXet: 'Cảm xúc trung tính' }); }

  /* Kiểm chứng chéo với dữ liệu thực. */
  const ht = maHocVien ? await db.prepare(
    'SELECT COUNT(*) n FROM baiHocHoanThanh WHERE maHocVien=? AND ngay=?'
  ).bind(maHocVien, ngay).first() : null;
  const baiThuc = (ht && ht.n) || 0;
  const batThuong = baiThuc < baoCao.baiHoc;

  /* Phát hiện cảm xúc tiêu cực nghiêm trọng. */
  const canCanThiep = ['tuyệt vọng','muốn bỏ','không chịu nổi','quá mệt'].some(c => cx.includes(c));

  return { diem: Math.min(100, diem), chiTiet, batThuong, canCanThiep,
    nhanXet: canCanThiep ? 'Cần can thiệp cảm xúc ngay' :
      diem >= 80 ? 'Xuất sắc' : diem >= 60 ? 'Tốt, cần duy trì' : 'Cần động viên và điều chỉnh' };
}

/** Tổng hợp báo cáo theo khoảng ngày. */
export async function tongHopBaoCao(y, env, db, hoSo) {
  y = y || {};
  const maKH = String(y.maKH || '').trim();
  const ngayKetThuc = String(y.ngayKetThuc || '').trim() || homNay();
  const soNgay = Math.min(365, Math.max(7, Number(y.soNgay) || 30));
  if (!maKH) return { ok: false, error: 'Thiếu mã khách hàng.' };
  if (!(await hoSoDuocTruyCap(db, maKH, hoSo)))
    return { ok: false, code: 'NOPERM', error: 'Không có quyền xem báo cáo của hồ sơ này.' };
  if (!ngayHopLe(ngayKetThuc) || ngayKetThuc > homNay())
    return { ok: false, error: 'Ngày kết thúc không hợp lệ.' };

  const dau = new Date(Date.parse(ngayKetThuc + 'T00:00:00Z') - (soNgay - 1) * 864e5).toISOString().slice(0, 10);
  const rs = await db.prepare(
    'SELECT COUNT(*) soNgayGui, COALESCE(AVG(kpi),0) kpiTrungBinh, ' +
    'COALESCE(SUM(baiHoc),0) tongBai, COALESCE(SUM(phutHoc),0) tongPhut ' +
    'FROM baoCaoNgay WHERE maKhachHang=? AND ngay >= ? AND ngay <= ?'
  ).bind(maKH, dau, ngayKetThuc).first();

  await Kho.ghiNhatKy(db, { uid: hoSo.uid, username: hoSo.u,
    viec: 'BAOCAO_TONG_HOP', doiTuong: maKH, chiTiet: dau + '..' + ngayKetThuc });

  return { ok: true, maKH, tuNgay: dau, denNgay: ngayKetThuc,
    soNgayGui: (rs && rs.soNgayGui) || 0,
    kpiTrungBinh: Math.round(Number((rs && rs.kpiTrungBinh) || 0)),
    tongBai: (rs && rs.tongBai) || 0,
    tongPhut: (rs && rs.tongPhut) || 0,
    deXuat: soNgay >= 90 ? 'Đánh giá tiến bộ 3 tháy, xem xét nâng tầng.' :
      soNgay >= 21 ? 'Kiểm tra nhịp học, điều chỉnh lộ trình.' : 'Duy trì thói quen hàng ngày.'
  };
}

/** Danh sách báo cáo gần đây (R01–R04 hoặc chính chủ). */
export async function dsBaoCaoNgay(y, env, db, hoSo) {
  y = y || {};
  const maKH = String(y.maKH || '').trim();
  const limit = Math.min(100, Math.max(1, Number(y.limit) || 30));
  if (!maKH) return { ok: false, error: 'Thiếu mã khách hàng.' };
  if (!(await hoSoDuocTruyCap(db, maKH, hoSo))) return { ok: false, code: 'NOPERM' };
  const rs = await db.prepare(
    'SELECT ngay, baiHoc, phutHoc, camXuc, kpi, ghiChu, guiLuc FROM baoCaoNgay WHERE maKhachHang=? ORDER BY ngay DESC LIMIT ?'
  ).bind(maKH, limit).all();
  return { ok: true, maKH, ds: rs.results || [] };
}
