/* ═══════════════════════════════════════════════════════════════
   GITA 365 — CRM CHUYÊN SÂU

   Bổ sung tầng phân tích và tự động đề xuất cho CRM hiện có:
     - Điểm tiềm năng (lead score) dựa trên tầng, tương tác, thanh toán
     - Phân khúc hành vi (VIP, Tần suất, Tiềm năng, Cảnh báo)
     - Dự báo chuyển đổi theo cơ hội
     - Lộ trình chăm sóc 7/21/90/365 ngày cho từng nhà
     - Cảnh báo rủi ro rời bỏ (churn risk)

   Dữ liệu gốc vẫn lấy từ hoSoKhach, users, soCham, phieuThu, crmKhach,
   crmCoHoi — KHÔNG dựng bảng khách hàng thứ hai.
   ═══════════════════════════════════════════════════════════════ */

import { Kho } from './nen.js';

import { BAC } from './vai-tro.js';

function ngayTruoc(n) {
  return new Date(Date.now() - n * 864e5).toISOString().slice(0, 10);
}

/** Tính điểm tiềm năng (0-100) cho một nhà dựa trên dữ liệu thực. */
function tinhDiemTiemNang(kh, cham, thu) {
  let diem = 0;
  diem += Math.min(25, (kh.tang || 1) * 5);                  /* tầng cao hơn */
  diem += kh.band === 'DO' ? 0 : kh.band === 'VANG' ? 10 : kh.band === 'XANH' ? 20 : 5;
  diem += Math.min(25, (cham.soLan || 0) * 2);                /* tương tác */
  diem += Math.min(25, Math.round((thu.tong || 0) / 2_000_000)); /* thanh toán */
  if (kh.trangThai === 'hoatDong') diem += 5;
  return Math.min(100, Math.max(0, diem));
}

/** Phân khúc hành vi theo BAND + điểm + tương tác gần đây. */
function phanKhuc(kh, diem, cham, thu, coHoi) {
  if (diem >= 80 && kh.band !== 'DO') return 'VIP';
  if ((cham.soLan7Ngay || 0) >= 3 && (thu.tong || 0) > 0) return 'Tần suất cao';
  if ((coHoi.giaTri || 0) > 0 && coHoi.trangThai === 'mo') return 'Tiềm năng nâng tầng';
  if (kh.band === 'DO' || (cham.soLan30Ngay || 0) === 0) return 'Cảnh báo';
  return 'Đồng đều';
}

/** Tính chỉ số rủi ro rời bỏ 0-100. */
function tinhRuiRo(kh, cham) {
  let r = 0;
  if (kh.band === 'DO') r += 40;
  else if (kh.band === 'VANG') r += 20;
  const ngayChamCuoi = cham.ngayCuoi || '';
  if (!ngayChamCuoi) r += 35;
  else {
    const ngay = Math.floor((Date.now() - new Date(ngayChamCuoi).getTime()) / 864e5);
    if (ngay > 14) r += 30;
    else if (ngay > 7) r += 15;
  }
  if ((cham.soLan30Ngay || 0) < 2) r += 15;
  return Math.min(100, r);
}

async function thongKeCham(db, maKH) {
  const tong = await db.prepare('SELECT COUNT(*) n, MAX(ngay) maxNgay FROM soCham WHERE maNha=?').bind(maKH).first();
  const n7 = await db.prepare('SELECT COUNT(*) n FROM soCham WHERE maNha=? AND ngay >= ?').bind(maKH, ngayTruoc(7)).first();
  const n30 = await db.prepare('SELECT COUNT(*) n FROM soCham WHERE maNha=? AND ngay >= ?').bind(maKH, ngayTruoc(30)).first();
  return { soLan: (tong && tong.n) || 0, ngayCuoi: (tong && tong.maxNgay) || '',
    soLan7Ngay: (n7 && n7.n) || 0, soLan30Ngay: (n30 && n30.n) || 0 };
}

async function thongKeThu(db, maKH) {
  const t = await db.prepare(
    "SELECT COUNT(*) n, COALESCE(SUM(soTien),0) tong FROM phieuThu WHERE maKhachHang=? AND trangThai='daDuyet'"
  ).bind(maKH).first();
  return { soPhieu: (t && t.n) || 0, tong: Number((t && t.tong) || 0) };
}

async function coHoiLonNhat(db, maKH) {
  const c = await db.prepare(
    "SELECT ten, giaTri, giaiDoan, trangThai FROM crmCoHoi WHERE maKH=? AND trangThai='mo' ORDER BY giaTri DESC LIMIT 1"
  ).bind(maKH).first();
  return c || { ten: '', giaTri: 0, giaiDoan: '', trangThai: '' };
}

/** Đề xuất lộ trình chăm sóc 7/21/90/365 ngày dựa trên trạng thái. */
function deXuatLoTrinh(kh, cham, thu) {
  const ds = [];
  ds.push({ngay: 7,  viec: 'Chào đón + kiểm tra onboarding, lập kế hoạch 30 ngày đầu.'});
  ds.push({ngay: 21, viec: 'Đánh giá nhịp học, kết nối coach, giải quyết vướng mắc đầu tiên.'});
  if ((thu.tong || 0) > 0 && (kh.tang || 1) >= 1)
    ds.push({ngay: 90, viec: 'Xem xét nâng tầng/lộ trình tiếp theo, ghi nhận KPI.'});
  else
    ds.push({ngay: 90, viec: 'Tái kích hoạt quan tâm: chia sẻ kết quả nhanh, ưu đãi phù hợp.'});
  ds.push({ngay: 365, viec: 'Tổng kết năm, lập lộ trình năm tiếp theo, giới thiệu cộng đồng.'});
  return ds;
}

/** Điểm số + phân khúc + rủi ro cho một nhà (R01–R04 hoặc CRM quản lý). */
export async function crmPhanTichKhach(y, env, db, hoSo) {
  if ((BAC[hoSo.role] || 99) > 4) {
    const mucCrm = await db.prepare(
      'SELECT muc FROM quyenCRM WHERE username=? AND thuHoiLuc IS NULL ORDER BY capLuc DESC LIMIT 1'
    ).bind(String(hoSo.u || '').toLowerCase()).first();
    if (!mucCrm || mucCrm.muc !== 'quanly') return { ok: false, code: 'NOPERM' };
  }
  const maKH = String(y.maKH || '').trim();
  if (!maKH) return { ok: false, error: 'Thiếu mã khách hàng.' };

  const kh = await db.prepare(
    'SELECT k.*, u.hoTen, u.email, u.dienThoai FROM hoSoKhach k LEFT JOIN users u ON u.id=k.uidPhuHuynh WHERE k.maKhachHang=?'
  ).bind(maKH).first();
  if (!kh) return { ok: false, error: 'Không tìm thấy khách.' };

  const [cham, thu, coHoi] = await Promise.all([
    thongKeCham(db, maKH), thongKeThu(db, maKH), coHoiLonNhat(db, maKH)
  ]);

  const diem = tinhDiemTiemNang(kh, cham, thu);
  const khuc = phanKhuc(kh, diem, cham, thu, coHoi);
  const ruiRo = tinhRuiRo(kh, cham);
  const loTrinh = deXuatLoTrinh(kh, cham, thu);

  await Kho.ghiNhatKy(db, { uid: hoSo.uid, username: hoSo.u,
    viec: 'CRM_PHAN_TICH', doiTuong: maKH, chiTiet: 'diem=' + diem + '|khuc=' + khuc + '|ruiRo=' + ruiRo });

  return { ok: true, maKH,
    tongQuan: { hoTen: kh.hoTen || '', tang: kh.tang || 1, band: kh.band || 'XAM', trangThai: kh.trangThai || '' },
    diemTiemNang: diem, phanKhuc: khuc, ruiRoRoiBo: ruiRo,
    chamSoc: cham, thu, coHoi,
    loTrinhDeXuat: loTrinh,
    hanhDong: ruiRo >= 60 ? 'Gọi người thật trong 24 giờ' :
      diem >= 80 ? 'Chăm sóc VIP, đề xuất nâng tầng/gia hạn' :
      coHoi.giaTri > 0 ? 'Đẩy cơ hội ' + coHoi.ten : 'Giữ nhịp tương tác định kỳ'
  };
}

/** Danh sách khách cần ưu tiên theo phân khúc/rủi ro. */
export async function crmUuTienNangCao(y, env, db, hoSo) {
  if ((BAC[hoSo.role] || 99) > 4) {
    const mucCrm = await db.prepare(
      'SELECT muc FROM quyenCRM WHERE username=? AND thuHoiLuc IS NULL ORDER BY capLuc DESC LIMIT 1'
    ).bind(String(hoSo.u || '').toLowerCase()).first();
    if (!mucCrm || mucCrm.muc !== 'quanly') return { ok: false, code: 'NOPERM' };
  }
  const limit = Math.min(100, Math.max(10, Number((y || {}).limit) || 50));
  const loai = String((y || {}).loai || '').trim();

  const r = await db.prepare(
    'SELECT k.maKhachHang, k.tang, k.band, k.trangThai, k.vaoLuc, k.coach, k.tuVan, ' +
    'u.hoTen, u.dienThoai, c.phuTrach, c.giaiDoan, c.henTiep ' +
    'FROM hoSoKhach k LEFT JOIN users u ON u.id=k.uidPhuHuynh ' +
    'LEFT JOIN crmKhach c ON c.maKH=k.maKhachHang ' +
    'WHERE k.deletedAt IS NULL OR k.deletedAt = "" ' +
    'ORDER BY k.vaoLuc DESC LIMIT ?'
  ).bind(limit * 3).all();

  const ds = [];
  for (const x of (r.results || [])) {
    const [cham, thu, coHoi] = await Promise.all([
      thongKeCham(db, x.maKhachHang),
      thongKeThu(db, x.maKhachHang),
      coHoiLonNhat(db, x.maKhachHang)
    ]);
    const diem = tinhDiemTiemNang(x, cham, thu);
    const khuc = phanKhuc(x, diem, cham, thu, coHoi);
    const ruiRo = tinhRuiRo(x, cham);
    if (loai && loai !== 'all' && loai !== khuc && !(loai === 'ruiRo' && ruiRo >= 60)) continue;
    ds.push({ maKH: x.maKhachHang, hoTen: x.hoTen || '', tang: x.tang || 1, band: x.band || 'XAM',
      diemTiemNang: diem, phanKhuc: khuc, ruiRoRoiBo: ruiRo,
      chamCuoi: cham.ngayCuoi, coach: x.coach || '', tuVan: x.tuVan || '', phuTrach: x.phuTrach || '' });
  }
  ds.sort((a, b) => (b.diemTiemNang + b.ruiRoRoiBo) - (a.diemTiemNang + a.ruiRoRoiBo));
  return { ok: true, ds: ds.slice(0, limit) };
}
