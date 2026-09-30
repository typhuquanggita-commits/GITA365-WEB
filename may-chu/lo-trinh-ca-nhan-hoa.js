/* ═══════════════════════════════════════════════════════════════
   GITA 365 — LỘ TRÌNH CÁ NHÂN HÓA

   Cổng phục vụ lộ trình khách hàng theo các cột mốc:
     - 7 ngày đầu (onboarding)
     - 21 ngày (kiểm tra nhịp)
     - 90 ngày (đánh giá tiến bộ)
     - 365 ngày (tổng kết năm)

   Mỗi lộ trình gắn với tầng T1–T5 và được khóa nội dung theo cấp/tầng.
   Dữ liệu gốc lấy từ hoSoKhach, nguoiHocTang, baiHocHoanThanh.
   ═══════════════════════════════════════════════════════════════ */

import { Kho } from './nen.js';
import { bacVai } from './vai-tro.js';

const MOC = [7, 21, 90, 365];

function ngayTruoc(n) {
  return new Date(Date.now() - n * 864e5).toISOString().slice(0, 10);
}
function ngayCong(ngay, soNgay) {
  return new Date(Date.parse(ngay + 'T00:00:00Z') + soNgay * 864e5)
    .toISOString().slice(0, 10);
}

/** Trả về lộ trình cá nhân hóa cho một học viên theo cấp/tầng. */
export async function loTrinhCaNhan(y, env, db, hoSo) {
  y = y || {};
  const maHV = String(y.maHocVien || '').trim();
  const maKH = String(y.maKH || '').trim();
  if (!maHV && !maKH) return { ok: false, error: 'Cần mã học viên hoặc mã khách hàng.' };

  let sql = 'SELECT * FROM nguoiHocTang WHERE 1=1';
  const bind = [];
  if (maHV) { sql += ' AND maHocVien=?'; bind.push(maHV); }
  if (maKH) { sql += ' AND maKhachHang=?'; bind.push(maKH); }
  if (bacVai(hoSo) > 4) {
    sql += ' AND uidPhuHuynh=?';
    bind.push((hoSo || {}).uid || '');
  }
  sql += ' ORDER BY vaoLuc DESC LIMIT 2';
  const ketQua = await db.prepare(sql).bind(...bind).all();
  const dsHocVien = ketQua.results || [];
  if (!maHV && dsHocVien.length > 1)
    return { ok: false, code: 'CAN_MAHV', error: 'Hồ sơ có nhiều học viên; cần mã học viên để xem đúng lộ trình.' };
  const hv = dsHocVien[0] || null;
  if (!hv) return { ok: false, error: 'Không tìm thấy học viên.' };

  const capDuocXem = Math.min(5, Math.max(1, Number(hv.tang || 1)));

  /* Đếm bài học đã hoàn thành trong các khoảng. */
  const hoanThanh = await db.prepare(
    'SELECT COUNT(*) n, MAX(ngay) ngayCuoi FROM baiHocHoanThanh WHERE maHocVien=?'
  ).bind(hv.maHocVien).first();

  const homNay = ngayTruoc(0);
  const dauNgay = String(hv.vaoLuc || homNay).slice(0, 10);
  const ngayDau = Number.isFinite(Date.parse(dauNgay + 'T00:00:00Z')) ? dauNgay : homNay;
  const ngayDaThamGia = Math.max(1,
    Math.floor((Date.parse(homNay + 'T00:00:00Z') - Date.parse(ngayDau + 'T00:00:00Z')) / 864e5) + 1);
  const baiTheoMoc = await Promise.all(MOC.map(async function (moc) {
    const cuoiMoc = ngayCong(ngayDau, moc - 1);
    const denNgay = cuoiMoc < homNay ? cuoiMoc : homNay;
    if (denNgay < ngayDau) return 0;
    const r = await db.prepare(
      'SELECT COUNT(*) n FROM baiHocHoanThanh WHERE maHocVien=? AND ngay>=? AND ngay<=?'
    ).bind(hv.maHocVien, ngayDau, denNgay).first();
    return Number((r && r.n) || 0);
  }));

  /* Tính tiến độ từng mốc. */
  const tienDo = MOC.map((m, i) => ({
    moc: m,
    dat: ngayDaThamGia >= m,
    ngayConLai: Math.max(0, m - ngayDaThamGia),
    hoanThanh: baiTheoMoc[i]
  }));

  /* Nội dung đề xuất theo tầng + mốc. */
  const goiY = tienDo.map(t => ({
    moc: t.moc,
    tieuDe: t.moc + ' ngày',
    noiDung: noiDungMoc(t.moc, capDuocXem, t.dat),
    hanhDong: hanhDongMoc(t.moc, t.dat, (hoanThanh && hoanThanh.n) || 0)
  }));

  await Kho.ghiNhatKy(db, { uid: hoSo.uid, username: hoSo.u,
    viec: 'LO_TRINH_CA_NHAN', doiTuong: hv.maHocVien, chiTiet: 'tang=' + capDuocXem });

  return { ok: true,
    hocVien: { maHocVien: hv.maHocVien, hoTen: hv.hoTen || '', tang: capDuocXem, ngayDaThamGia },
    tongQuan: { tongBaiHoanThanh: (hoanThanh && hoanThanh.n) || 0, ngayHoanThanhCuoi: (hoanThanh && hoanThanh.ngayCuoi) || '' },
    tienDo, goiY
  };
}

function noiDungMoc(moc, tang, dat) {
  const nen = {
    7: 'Làm quen nền nếp học, mở khoá đầu tiên, kết nối với coach.',
    21: 'Kiểm tra nhịp 3 tuần, điều chỉnh tốc độ, giải quyết vướng mắc.',
    90: 'Đánh giá tiến bộ 3 tháng, xem xét nâng tầng/lộ trình tiếp theo.',
    365: 'Tổng kết năm, lập mục tiêu năm mới, tham gia cộng đồng.'
  };
  const theoTang = {
    1: 'Tập trung thói quen cơ bản và niềm vui học.',
    2: 'Gia tăng tự chủ, kỹ năng cốt lõi.',
    3: 'Mở rộng kiến thức, kết nối thực hành.',
    4: 'Luyện chuyên sâu, hình thành phong cách.',
    5: 'Đỉnh cao năng lực, sẵn sàng dẫn dắt.'
  };
  return (dat ? 'Đã đạt mốc. ' : 'Đang hướng tới mốc. ') + nen[moc] + ' ' + (theoTang[tang] || '');
}

function hanhDongMoc(moc, dat, tongBai) {
  if (dat) return 'Xem lại thành tích và chuẩn bị mốc tiếp theo.';
  if (moc === 7) return 'Hoàn thành ít nhất 1 bài học và 1 buổi coach.';
  if (moc === 21) return 'Duy trì ít nhất 3 buổi học/tuần, ghi nhận KPI.';
  if (moc === 90) return 'Hoàn thành ≥ ' + Math.round(moc / 10) + ' bài, đánh giá đầu ra.';
  return 'Tổng kết ≥ ' + Math.round(moc / 5) + ' bài học trong năm.';
}

/** Kiểm tra khóa nội dung theo tầng — frontend dùng để ẩn/hiện bài học. */
export async function khoaNoiDungTheoTang(y, env, db, hoSo) {
  y = y || {};
  const tangYeuCau = Number(y.tang || 1);
  if (!Number.isInteger(tangYeuCau) || tangYeuCau < 1 || tangYeuCau > 5)
    return { ok: false, error: 'Tầng yêu cầu không hợp lệ.' };
  const maHV = String(y.maHocVien || '').trim();
  let tangHienTai = 1;
  if (maHV) {
    let sql = 'SELECT tang FROM nguoiHocTang WHERE maHocVien=?';
    const bind = [maHV];
    if (bacVai(hoSo) > 4) { sql += ' AND uidPhuHuynh=?'; bind.push((hoSo || {}).uid || ''); }
    const hv = await db.prepare(sql).bind(...bind).first();
    if (!hv) return { ok: false, code: 'NOPERM', error: 'Không có quyền xem cấp nội dung của học viên này.' };
    tangHienTai = hv ? Math.min(5, Math.max(1, Number(hv.tang || 1))) : 1;
  } else if (bacVai(hoSo) > 4) {
    return { ok: false, code: 'NOPERM', error: 'Cần mã học viên thuộc hồ sơ của bạn.' };
  }
  const moDuoc = tangHienTai >= tangYeuCau || bacVai(hoSo) <= 4;
  return { ok: true, tangYeuCau, tangHienTai, moDuoc,
    lyDo: moDuoc ? '' : 'Nội dung này dành cho Tầng ' + tangYeuCau + '. Bạn đang ở Tầng ' + tangHienTai + '.' };
}
