/* ═══════════════════════════════════════════════════════════════
   GITA 365 — TRUNG TÂM ĐO LƯỜNG & TỐI ƯU (Super Admin)

   Một cửa đọc cho TOÀN HỆ, thay vì đi qua tám màn "tổng quan":
     docTrungTamDo      7 khối × 38 chỉ số (kỳ này / kỳ trước, chấm đạt ·
                        cảnh báo · xấu) · từng VAI · từng NGƯỜI · từng HOẠT
                        ĐỘNG · KẾT QUẢ KIỂM TRA. R01–R03.
     lichSuTrungTamDo   điểm khối theo ngày (ảnh chụp mỗi ngày một lần).
     taoKeHoachToiUu    chọn một giải pháp → kế hoạch có người phụ trách,
                        hạn, các bước; tự PHÂN BỔ nếu chưa chỉ định.
     capNhatKeHoachToiUu  tick bước · đổi trạng thái; xong thì ĐO LẠI chỉ số.
     dsKeHoachToiUu     R01–R03 xem hết + tải việc từng người; nhân sự xem
                        việc của mình.

   ══ ĐỌC THUẦN — KHÔNG LÀM BẨN SỐ ══
   Không gọi các cửa báo cáo có ghi nhật ký (banKeTaiChinh, doiSoat, …):
   mỗi lần đọc chúng thêm dòng audit và làm sai chính số "thao tác" ở đây.
   Mọi số tính bằng truy vấn nhóm trực tiếp; bảng chưa có (module chưa
   chạy lần nào) → null → 'chưa đo', không đoán, không đổ lỗi.
   Ngoại lệ có chủ ý: mỗi ngày một dòng ảnh chụp (chupTrungTam) để có
   đường xu hướng — một dòng, không chạm audit.

   ══ GIỚI HẠN THẬT ══
   - Ngày theo UTC (substr(...,1,10)), như docDongChay và do-luong-kh.
   - Kỳ thu quá hạn: phải thu − đã thu (phiếu đã duyệt gắn kỳ) − miễn giảm
     đã duyệt; phiếu thu không gắn kỳ không trừ được vào kỳ nào.
   - Ngưỡng là ngưỡng vận hành ban đầu (toi-uu-cham.js), không phải chuẩn ngành.
   ═══════════════════════════════════════════════════════════════ */
import { BAC } from './vai-tro.js';
import { Kho } from './nen.js';
import { KPI, KHOI, PHIEN_BAN_TU, GIAI_PHAP, chamHet, chonNguoi } from './toi-uu-cham.js';

const lvOf = hoSo => BAC[(hoSo || {}).role] || 99;
const NV = "('R01','R02','R03','R04','R05','R06','R07','R08','R09','R10','R11','R12')";
async function so(db, sql, ...a) {
  try { const r = await db.prepare(sql).bind(...a).first(); return r ? (r.n == null ? null : Number(r.n)) : null; } catch (e) { return null; }
}
async function ds(db, sql, ...a) {
  try { return ((await db.prepare(sql).bind(...a).all()).results) || []; } catch (e) { return null; }
}
const lui = (ngay, n) => { const d = new Date(ngay + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() - n); return d.toISOString().slice(0, 10); };
const homNay = () => new Date().toISOString().slice(0, 10);
const pt = (a, b) => (a == null || !(b > 0)) ? null : Math.round(1000 * a / b) / 10;
const chia = (a, b, k) => (a == null || !(b > 0)) ? null : Math.round((10 ** (k || 1)) * a / b) / (10 ** (k || 1));

let daTao = false;
async function taoBang(db) {
  if (daTao) return;
  await db.prepare('CREATE TABLE IF NOT EXISTS keHoachToiUu (id TEXT PRIMARY KEY, maGiaiPhap TEXT NOT NULL, kpi TEXT NOT NULL, khoi TEXT NOT NULL, ' +
    'ten TEXT NOT NULL, giaTriDau REAL, mucTieu REAL, vai TEXT, nguoiPhuTrach TEXT NOT NULL, hanLuc TEXT NOT NULL, trangThai TEXT NOT NULL DEFAULT \'moi\', ' +
    'buoc TEXT NOT NULL, ghiChu TEXT, ketQua REAL, taoBoi TEXT NOT NULL, taoLuc TEXT NOT NULL, suaLuc TEXT, xongLuc TEXT)').run();
  await db.prepare('CREATE INDEX IF NOT EXISTS ix_khtu_nguoi ON keHoachToiUu (nguoiPhuTrach, trangThai)').run();
  await db.prepare('CREATE TABLE IF NOT EXISTS chupTrungTam (ngay TEXT PRIMARY KEY, phienBan TEXT, duLieu TEXT NOT NULL, luc TEXT NOT NULL)').run();
  daTao = true;
}

/* ═══════════ SỐ ĐO MỘT KỲ [tu, den) ═══════════ */
async function doKy(db, tu, den, soNgay) {
  const g = {};
  const hn = homNay();
  const dangHoc = await so(db, "SELECT COUNT(*) n FROM hoSoKhach WHERE trangThai = 'dangHoc'");
  /* TV */
  g.tv1 = await so(db, 'SELECT COUNT(*) n FROM hoSoKhach WHERE substr(vaoLuc,1,10) >= ? AND substr(vaoLuc,1,10) < ?', tu, den);
  const dk = await so(db, 'SELECT COUNT(*) n FROM dangKyCho WHERE substr(createdAt,1,10) >= ? AND substr(createdAt,1,10) < ?', tu, den);
  const dkXong = await so(db, "SELECT COUNT(*) n FROM dangKyCho WHERE trangThai = 'xong' AND substr(createdAt,1,10) >= ? AND substr(createdAt,1,10) < ?", tu, den);
  g.tv2 = pt(dkXong, dk);
  const thang = await so(db, "SELECT COUNT(*) n FROM crmCoHoi WHERE trangThai = 'thang' AND substr(capNhatLuc,1,10) >= ? AND substr(capNhatLuc,1,10) < ?", tu, den);
  const thua = await so(db, "SELECT COUNT(*) n FROM crmCoHoi WHERE trangThai = 'thua' AND substr(capNhatLuc,1,10) >= ? AND substr(capNhatLuc,1,10) < ?", tu, den);
  g.tv5 = thang == null || thua == null ? null : pt(thang, thang + thua);
  /* CO */
  const cham = await so(db, 'SELECT COUNT(*) n FROM soCham WHERE substr(ngay,1,10) >= ? AND substr(ngay,1,10) < ?', tu, den);
  g.co1 = chia(cham, dangHoc);
  const tick = await so(db, 'SELECT COUNT(*) n FROM (SELECT DISTINCT maNha, ngay FROM nhipXong WHERE bo = 0 AND ngay >= ? AND ngay < ?)', tu, den);
  g.co4 = tick == null || !(dangHoc > 0) ? null : Math.min(100, pt(tick, dangHoc * soNgay));
  const bc = await so(db, 'SELECT COUNT(*) n FROM baoCaoNgay WHERE ngay >= ? AND ngay < ?', tu, den);
  g.co5 = chia(bc, dangHoc);
  g.co6 = await so(db, "SELECT COUNT(*) n FROM soCham WHERE kieu = 'wow' AND substr(ngay,1,10) >= ? AND substr(ngay,1,10) < ?", tu, den);
  g.co7 = await so(db, 'SELECT COUNT(DISTINCT maKhachHang) n FROM lichSuTang WHERE denTang > COALESCE(tuTang,0) AND substr(luc,1,10) >= ? AND substr(luc,1,10) < ?', tu, den);
  /* KH */
  const coHD = await so(db,
    "SELECT COUNT(*) n FROM hoSoKhach h WHERE h.trangThai = 'dangHoc' AND (" +
    ' EXISTS (SELECT 1 FROM nhipXong x WHERE x.maNha = h.maKhachHang AND x.ngay >= ? AND x.ngay < ?)' +
    ' OR EXISTS (SELECT 1 FROM baoCaoNgay b WHERE b.maKhachHang = h.maKhachHang AND b.ngay >= ? AND b.ngay < ?))', tu, den, tu, den);
  const coApp = await so(db, "SELECT COUNT(DISTINCT t.maNha) n FROM thoiGianNgay t JOIN hoSoKhach h ON h.maKhachHang = t.maNha WHERE h.trangThai = 'dangHoc' AND t.ngay >= ? AND t.ngay < ?", tu, den);
  g.kh1 = coHD == null ? null : pt(Math.max(coHD, coApp || 0), dangHoc);
  const giay = await so(db, "SELECT COALESCE(SUM(giay),0) n FROM thoiGianNgay WHERE man = '__tong' AND ngay >= ? AND ngay < ?", tu, den);
  g.kh2 = giay == null ? null : chia(giay / 60, dangHoc, 0);
  const thTu = tu.slice(0, 7), thDen = lui(den, 1).slice(0, 7);
  const dg = await ds(db, 'SELECT nps, csat FROM danhGiaKH WHERE thang >= ? AND thang <= ?', thTu, thDen);
  if (dg && dg.length) {
    const np = dg.filter(x => x.nps != null), cs = dg.filter(x => x.csat != null);
    g.kh3 = np.length ? Math.round(100 * (np.filter(x => x.nps >= 9).length - np.filter(x => x.nps <= 6).length) / np.length) : null;
    g.kh4 = cs.length ? Math.round(10 * cs.reduce((a, x) => a + Number(x.csat), 0) / cs.length) / 10 : null;
  } else { g.kh3 = null; g.kh4 = null; }
  const hoan = await so(db, "SELECT COUNT(*) n FROM hoanTien WHERE trangThai = 'daDuyet' AND substr(duyetLuc,1,10) >= ? AND substr(duyetLuc,1,10) < ?", tu, den);
  g.kh5 = pt(hoan, dangHoc);
  /* MK */
  g.mk1 = dk;
  g.mk2 = await so(db, 'SELECT COUNT(*) n FROM baiNoiDung WHERE substr(vaoCongLuc,1,10) >= ? AND substr(vaoCongLuc,1,10) < ?', tu, den);
  g.mk3 = await so(db, 'SELECT COUNT(*) n FROM dangTamThiGiac WHERE goTrongSo IS NULL AND substr(luc,1,10) >= ? AND substr(luc,1,10) < ?', tu, den);
  const xb = await ds(db, 'SELECT COALESCE(SUM(xem),0) xem, COALESCE(SUM(bam),0) bam FROM khaiSoNgoai WHERE ngayDoc >= ? AND ngayDoc < ?', tu, den);
  g.mk4 = xb && xb[0] ? Number(xb[0].xem) : null;
  g.mk5 = xb && xb[0] ? pt(Number(xb[0].bam), Number(xb[0].xem)) : null;
  const moiGT = await so(db, "SELECT COUNT(*) n FROM hoSoKhach WHERE boTro IS NOT NULL AND boTro <> '' AND substr(vaoLuc,1,10) >= ? AND substr(vaoLuc,1,10) < ?", tu, den);
  g.mk6 = pt(moiGT, g.tv1);
  /* TC */
  g.tc1 = await so(db, "SELECT COALESCE(SUM(soTien),0) n FROM phieuThu WHERE trangThai = 'daDuyet' AND substr(ghiLuc,1,10) >= ? AND substr(ghiLuc,1,10) < ?", tu, den);
  const chi = await so(db, "SELECT COALESCE(SUM(soTien),0) n FROM chiPhi WHERE trangThai = 'daDuyet' AND substr(ngayChi,1,10) >= ? AND substr(ngayChi,1,10) < ?", tu, den);
  const chiKhong = await so(db, "SELECT COALESCE(SUM(soTien),0) n FROM chiPhi WHERE trangThai = 'daDuyet' AND coHoaDon = 0 AND substr(ngayChi,1,10) >= ? AND substr(ngayChi,1,10) < ?", tu, den);
  const hoanTien = await so(db, "SELECT COALESCE(SUM(soTien),0) n FROM hoanTien WHERE trangThai = 'daDuyet' AND substr(duyetLuc,1,10) >= ? AND substr(duyetLuc,1,10) < ?", tu, den);
  const hoaHong = await so(db, "SELECT COALESCE(SUM(soTien),0) n FROM hoaHongTra WHERE trangThai = 'daTra' AND substr(traLuc,1,10) >= ? AND substr(traLuc,1,10) < ?", tu, den);
  g.tc2 = pt(chi, g.tc1);
  g.tc3 = g.tc1 == null || chi == null ? null : g.tc1 - chi - (hoanTien || 0) - (hoaHong || 0);
  g.tc6 = pt(chiKhong, chi);
  /* NS */
  const soNV = await so(db, `SELECT COUNT(*) n FROM users WHERE active = 1 AND deletedAt IS NULL AND role IN ${NV}`);
  const thaoTacNV = await so(db, `SELECT COUNT(*) n FROM audit a JOIN users u ON u.id = a.uid WHERE u.role IN ${NV} AND substr(a.luc,1,10) >= ? AND substr(a.luc,1,10) < ?`, tu, den);
  g.ns2 = thaoTacNV == null || !(soNV > 0) ? null : Math.round(10 * thaoTacNV / soNV / soNgay) / 10;
  /* CN */
  g.cn1 = await so(db, 'SELECT COALESCE(SUM(vao + ra),0) n FROM soTokenDaTri WHERE ngay >= ? AND ngay < ?', tu, den);
  const loi = await so(db, 'SELECT COALESCE(SUM(soLan),0) n FROM loiNccDaTri WHERE ngay >= ? AND ngay < ?', tu, den);
  g.cn2 = loi == null ? null : Math.round(10 * loi / soNgay) / 10;
  g.cn3 = await so(db, "SELECT COUNT(*) n FROM cuuHe WHERE loai IN ('BANG','BAODONG') AND substr(luc,1,10) >= ? AND substr(luc,1,10) < ?", tu, den);
  g.cn4 = await so(db, "SELECT COUNT(*) n FROM thanhTraSo WHERE mucDo = 'nang' AND substr(luc,1,10) >= ? AND substr(luc,1,10) < ?", tu, den);
  return { g, phu: { dangHoc, dk, dkXong, thang, thua, cham, tick, bc, hoan, chi, chiKhong, hoanTien, hoaHong, soNV, thaoTacNV, loi, coHD, coApp } };
}

/* Chỉ số "ảnh chụp hiện tại" — không có kỳ trước */
async function doHienTai(db) {
  const g = {}, hn = homNay();
  const dangHoc = await so(db, "SELECT COUNT(*) n FROM hoSoKhach WHERE trangThai = 'dangHoc'");
  const chuaPT = await so(db,
    "SELECT COUNT(*) n FROM hoSoKhach h LEFT JOIN crmKhach c ON c.maKH = h.maKhachHang WHERE h.trangThai = 'dangHoc' " +
    "AND COALESCE(c.phuTrach,'') = '' AND COALESCE(h.tuVan,'') = '' AND COALESCE(h.coach,'') = ''");
  g.tv3 = pt(chuaPT, dangHoc);
  const quaHen = await so(db, "SELECT COUNT(*) n FROM crmKhach c JOIN hoSoKhach h ON h.maKhachHang = c.maKH WHERE h.trangThai = 'dangHoc' AND c.henTiep IS NOT NULL AND c.henTiep <> '' AND c.henTiep < ? AND COALESCE(c.giaiDoan,'') <> 'roi'", hn);
  g.tv4 = pt(quaHen, dangHoc);
  g.tv6 = await so(db, "SELECT COALESCE(SUM(giaTri),0) n FROM crmCoHoi WHERE trangThai = 'mo'");
  const imLang = await so(db, "SELECT COUNT(*) n FROM hoSoKhach h WHERE h.trangThai = 'dangHoc' AND COALESCE((SELECT MAX(substr(ngay,1,10)) FROM soCham s WHERE s.maNha = h.maKhachHang), '') < ?", lui(hn, 7));
  g.co2 = pt(imLang, dangHoc);
  const do_ = await so(db, "SELECT COUNT(*) n FROM hoSoKhach WHERE trangThai = 'dangHoc' AND band = 'DO'");
  g.co3 = pt(do_, dangHoc);
  g.tc4 = await so(db, "SELECT COUNT(*) n FROM phieuThu WHERE trangThai = 'choDuyet' AND substr(ghiLuc,1,10) < ?", lui(hn, 3));
  const ky = await ds(db,
    'SELECT k.id, k.phaiThu, ' +
    "COALESCE((SELECT SUM(p.soTien) FROM phieuThu p WHERE p.idKy = k.id AND p.trangThai = 'daDuyet'),0) daThu, " +
    "COALESCE((SELECT SUM(m.soTien) FROM mienGiam m WHERE m.idKy = k.id AND m.trangThai = 'daDuyet'),0) mien " +
    'FROM kyThu k WHERE k.hanLuc IS NOT NULL AND substr(k.hanLuc,1,10) < ?', hn);
  const no = ky ? ky.filter(k => Number(k.phaiThu) - Number(k.daThu) - Number(k.mien) > 0.5) : null;
  g.tc5 = no ? no.length : null;
  const tienNo = no ? no.reduce((a, k) => a + Number(k.phaiThu) - Number(k.daThu) - Number(k.mien), 0) : null;
  g.tc7 = await so(db, "SELECT COUNT(*) n FROM chiPhi WHERE trangThai = 'choDuyet' AND substr(deXuatLuc,1,10) < ?", lui(hn, 7));
  const soNV = await so(db, `SELECT COUNT(*) n FROM users WHERE active = 1 AND deletedAt IS NULL AND role IN ${NV}`);
  const vao7 = await so(db, `SELECT COUNT(DISTINCT a.uid) n FROM audit a JOIN users u ON u.id = a.uid WHERE a.viec = 'DANG_NHAP' AND u.role IN ${NV} AND u.active = 1 AND u.deletedAt IS NULL AND a.luc >= ?`, lui(hn, 7));
  g.ns1 = pt(vao7, soNV);
  g.ns3 = await so(db, `SELECT COUNT(*) n FROM users u WHERE u.active = 1 AND u.deletedAt IS NULL AND u.role IN ('R04','R05','R06','R07','R08','R09','R10','R11') AND substr(u.createdAt,1,10) >= ? ` +
    "AND (SELECT COUNT(DISTINCT b.cua) FROM baCuaConNguoi b WHERE b.maNguoi = u.username) < 3", lui(hn, 90));
  g.ns4 = await so(db, "SELECT COUNT(*) n FROM keHoachToiUu WHERE trangThai IN ('moi','dangLam') AND hanLuc < ?", hn);
  g.ns5 = await so(db, `SELECT COUNT(*) n FROM users u WHERE u.active = 1 AND u.deletedAt IS NULL AND u.role IN ${NV} AND substr(COALESCE(u.createdAt,''),1,10) < ? ` +
    "AND NOT EXISTS (SELECT 1 FROM audit a WHERE a.uid = u.id AND a.viec = 'DANG_NHAP' AND a.luc >= ?)", lui(hn, 30), lui(hn, 30));
  g.cn5 = await so(db, 'SELECT COUNT(*) n FROM yeuCauXoa WHERE xoaTrongSo IS NULL AND hanXuLy < ?', hn);
  return { g, phu: { dangHoc, chuaPT, quaHen, imLang, do: do_, tienNo, soNV, vao7 } };
}

const HIEN_TAI = ['tv3', 'tv4', 'tv6', 'co2', 'co3', 'tc4', 'tc5', 'tc7', 'ns1', 'ns3', 'ns4', 'ns5', 'cn5'];

/* ═══════════ TỪNG VAI · TỪNG NGƯỜI · TỪNG HOẠT ĐỘNG ═══════════ */
async function doVai(db, tu, den) {
  const hn = homNay();
  const tk = await ds(db, 'SELECT role, COUNT(*) n FROM users WHERE active = 1 AND deletedAt IS NULL GROUP BY role') || [];
  const vao = await ds(db, "SELECT u.role, COUNT(DISTINCT a.uid) n FROM audit a JOIN users u ON u.id = a.uid WHERE a.viec = 'DANG_NHAP' AND a.luc >= ? GROUP BY u.role", lui(hn, 7)) || [];
  const tt = await ds(db, 'SELECT u.role, COUNT(*) n FROM audit a JOIN users u ON u.id = a.uid WHERE substr(a.luc,1,10) >= ? AND substr(a.luc,1,10) < ? GROUP BY u.role', tu, den) || [];
  const top = await ds(db, 'SELECT u.role, a.viec, COUNT(*) n FROM audit a JOIN users u ON u.id = a.uid WHERE substr(a.luc,1,10) >= ? AND substr(a.luc,1,10) < ? GROUP BY u.role, a.viec ORDER BY n DESC LIMIT 300', tu, den) || [];
  const m = (arr, r) => Number((arr.find(x => x.role === r) || {}).n || 0);
  return Object.keys(BAC).map(r => ({ vai: r, taiKhoan: m(tk, r), vao7: m(vao, r), thaoTac: m(tt, r),
    tbNguoi: m(tk, r) ? Math.round(m(tt, r) / m(tk, r)) : 0, top: top.filter(x => x.role === r).slice(0, 3).map(x => ({ viec: x.viec, n: Number(x.n) })) }));
}
async function doNguoi(db, tu, den) {
  const nv = await ds(db, `SELECT id, username, hoTen, role, phongBan FROM users WHERE active = 1 AND deletedAt IS NULL AND role IN ${NV} ORDER BY role, username LIMIT 300`) || [];
  const lan = await ds(db, "SELECT uid, MAX(luc) l FROM audit WHERE viec = 'DANG_NHAP' GROUP BY uid") || [];
  const tt = await ds(db, 'SELECT uid, COUNT(*) n FROM audit WHERE substr(luc,1,10) >= ? AND substr(luc,1,10) < ? GROUP BY uid', tu, den) || [];
  const cham = await ds(db, 'SELECT boiAi, COUNT(*) n FROM soCham WHERE substr(ngay,1,10) >= ? AND substr(ngay,1,10) < ? GROUP BY boiAi', tu, den) || [];
  const crm = await ds(db, "SELECT uid, COUNT(*) n FROM audit WHERE viec IN ('CRM_GHI','CRM_COHOI') AND substr(luc,1,10) >= ? AND substr(luc,1,10) < ? GROUP BY uid", tu, den) || [];
  const kh = await ds(db, "SELECT nguoiPhuTrach u, COUNT(*) n, SUM(CASE WHEN hanLuc < ? THEN 1 ELSE 0 END) tre FROM keHoachToiUu WHERE trangThai IN ('moi','dangLam') GROUP BY nguoiPhuTrach", homNay()) || [];
  const nha = await ds(db, "SELECT coach u, COUNT(*) n FROM hoSoKhach WHERE trangThai = 'dangHoc' AND coach IS NOT NULL AND coach <> '' GROUP BY coach") || [];
  const tim = (arr, k, v) => arr.find(x => String(x[k]) === String(v)) || {};
  return nv.map(u => ({ u: u.username, ten: u.hoTen || '', vai: u.role, phongBan: u.phongBan || '',
    lanCuoi: tim(lan, 'uid', u.id).l || '', thaoTac: Number(tim(tt, 'uid', u.id).n || 0), cham: Number(tim(cham, 'boiAi', u.username).n || 0),
    crm: Number(tim(crm, 'uid', u.id).n || 0), nhaKem: Number(tim(nha, 'u', u.username).n || 0),
    viecMo: Number(tim(kh, 'u', u.username).n || 0), viecTre: Number(tim(kh, 'u', u.username).tre || 0) }));
}
const HOAT_DONG = [
  ['thu', 'Phiếu thu được duyệt', "SELECT COUNT(*) n FROM phieuThu WHERE trangThai = 'daDuyet' AND substr(ghiLuc,1,10) >= ? AND substr(ghiLuc,1,10) < ?", 'phong-tai-chinh'],
  ['chi', 'Khoản chi được duyệt', "SELECT COUNT(*) n FROM chiPhi WHERE trangThai = 'daDuyet' AND substr(ngayChi,1,10) >= ? AND substr(ngayChi,1,10) < ?", 'phong-tai-chinh'],
  ['dangky', 'Đăng ký mới', 'SELECT COUNT(*) n FROM dangKyCho WHERE substr(createdAt,1,10) >= ? AND substr(createdAt,1,10) < ?', 'crm'],
  ['nhamoi', 'Nhà mới vào học', 'SELECT COUNT(*) n FROM hoSoKhach WHERE substr(vaoLuc,1,10) >= ? AND substr(vaoLuc,1,10) < ?', 'crm'],
  ['cohoi', 'Cơ hội bán mới', 'SELECT COUNT(*) n FROM crmCoHoi WHERE substr(taoLuc,1,10) >= ? AND substr(taoLuc,1,10) < ?', 'crm'],
  ['cham', 'Lượt chạm khách (nhắn · gọi · wow)', 'SELECT COUNT(*) n FROM soCham WHERE substr(ngay,1,10) >= ? AND substr(ngay,1,10) < ?', 'coach-dp'],
  ['tick', 'Lượt tick việc hôm nay', 'SELECT COUNT(*) n FROM nhipXong WHERE bo = 0 AND ngay >= ? AND ngay < ?', 'do-luong-he'],
  ['baocao', 'Báo cáo ngày của nhà', 'SELECT COUNT(*) n FROM baoCaoNgay WHERE ngay >= ? AND ngay < ?', 'do-luong-he'],
  ['baihoc', 'Bài học hoàn thành', 'SELECT COUNT(*) n FROM baiHocHoanThanh WHERE substr(ngay,1,10) >= ? AND substr(ngay,1,10) < ?', 'do-luong-he'],
  ['phut', 'Giờ dùng app của nhà', "SELECT COALESCE(SUM(giay),0)/3600 n FROM thoiGianNgay WHERE man = '__tong' AND ngay >= ? AND ngay < ?", 'do-luong-he'],
  ['lentang', 'Lượt lên tầng', 'SELECT COUNT(*) n FROM lichSuTang WHERE denTang > COALESCE(tuTang,0) AND substr(luc,1,10) >= ? AND substr(luc,1,10) < ?', 'do-luong-he'],
  ['hoan', 'Lượt hoàn tiền', "SELECT COUNT(*) n FROM hoanTien WHERE trangThai = 'daDuyet' AND substr(duyetLuc,1,10) >= ? AND substr(duyetLuc,1,10) < ?", 'phong-tai-chinh'],
  ['noidung', 'Bài nội dung vào cổng', 'SELECT COUNT(*) n FROM baiNoiDung WHERE substr(vaoCongLuc,1,10) >= ? AND substr(vaoCongLuc,1,10) < ?', 'bien-soan-noi-dung'],
  ['dangngoai', 'Bài đăng kênh ngoài', 'SELECT COUNT(*) n FROM dangTamThiGiac WHERE substr(luc,1,10) >= ? AND substr(luc,1,10) < ?', 'kien-truc-thi-giac'],
  ['credit', 'Giao dịch credit', 'SELECT COUNT(*) n FROM soCredit WHERE substr(luc,1,10) >= ? AND substr(luc,1,10) < ?', 'credit-gita'],
  ['dangnhap', 'Lượt đăng nhập', "SELECT COUNT(*) n FROM audit WHERE viec = 'DANG_NHAP' AND substr(luc,1,10) >= ? AND substr(luc,1,10) < ?", 'nhat-ky-ht'],
  ['ai', 'Lượt gọi AI', 'SELECT COALESCE(SUM(luot),0) n FROM soTokenDaTri WHERE ngay >= ? AND ngay < ?', 'bo-nao-da-tri'],
  ['thaotac', 'Tổng thao tác ghi nhật ký', 'SELECT COUNT(*) n FROM audit WHERE substr(luc,1,10) >= ? AND substr(luc,1,10) < ?', 'nhat-ky-ht']
];
async function doHoatDong(db, tu, den, tuT) {
  const ra = [];
  for (const [ma, ten, sql, man] of HOAT_DONG) ra.push({ ma, ten, man, nay: await so(db, sql, tu, den), truoc: await so(db, sql, tuT, tu) });
  const top = await ds(db, 'SELECT viec, COUNT(*) n FROM audit WHERE substr(luc,1,10) >= ? AND substr(luc,1,10) < ? GROUP BY viec ORDER BY n DESC LIMIT 12', tu, den) || [];
  return { ds: ra, topViec: top.map(x => ({ viec: x.viec, n: Number(x.n) })) };
}
async function doKiemTra(db, ht) {
  const hn = homNay();
  const k = [];
  const them = (ma, ten, n, man, ghi) => k.push({ ma, ten, so: n, dat: n === 0, chuaDo: n == null, man, ghi: ghi || '' });
  them('KT01', 'Phiếu thu chờ duyệt quá 3 ngày', ht.g.tc4, 'phong-tai-chinh');
  them('KT02', 'Kỳ thu quá hạn chưa thu đủ', ht.g.tc5, 'phong-tai-chinh', ht.phu.tienNo ? 'còn ' + Math.round(ht.phu.tienNo).toLocaleString('vi-VN') + 'đ' : '');
  them('KT03', 'Đề xuất chi chờ duyệt quá 7 ngày', ht.g.tc7, 'phong-tai-chinh');
  them('KT04', 'Nhà đang học không có người phụ trách', ht.phu.chuaPT, 'crm');
  them('KT05', 'Nhà quá hẹn chăm sóc', ht.phu.quaHen, 'crm');
  them('KT06', 'Nhà quá 7 ngày chưa được chạm', ht.phu.imLang, 'coach-dp');
  them('KT07', 'Nhà đang học tầng 2–5 chưa có lịch thu', await so(db, "SELECT COUNT(*) n FROM hoSoKhach h WHERE h.trangThai = 'dangHoc' AND h.tang >= 2 AND NOT EXISTS (SELECT 1 FROM kyThu k WHERE k.maKhachHang = h.maKhachHang)"), 'phong-tai-chinh');
  them('KT08', 'Tài khoản đã cho nghỉ mà vẫn mở', await so(db, 'SELECT COUNT(*) n FROM users WHERE offboardedAt IS NOT NULL AND active = 1'), 'vong-doi-tk');
  them('KT09', 'Tài khoản nhân sự bỏ không 30 ngày', ht.g.ns5, 'phan-quyen');
  them('KT10', 'Nhân sự mới chưa qua đủ ba cửa', ht.g.ns3, 'con-nguoi');
  them('KT11', 'Yêu cầu xoá dữ liệu quá hạn', ht.g.cn5, 'phap-ly-rui-ro');
  them('KT12', 'Việc tối ưu quá hạn', ht.g.ns4, 'trung-tam-do');
  them('KT13', 'Cơ hội bán quá ngày dự kiến chốt', await so(db, "SELECT COUNT(*) n FROM crmCoHoi WHERE trangThai = 'mo' AND duKienChot IS NOT NULL AND duKienChot <> '' AND duKienChot < ?", hn), 'crm');
  them('KT14', 'Bài nội dung treo quá 7 ngày chưa vào cổng', await so(db, "SELECT COUNT(*) n FROM baiNoiDung WHERE vaoCongLuc IS NULL AND trangThai <> 'nhap' AND substr(vietLuc,1,10) < ?", lui(hn, 7)), 'bien-soan-noi-dung');
  return k;
}

/* ═══════════ CỬA 1 · ĐỌC TRUNG TÂM ═══════════ */
export async function docTrungTamDo(y, env, db, hoSo) {
  if (lvOf(hoSo) > 3) return { ok: false, code: 'NOPERM', error: 'Trung tâm đo lường & tối ưu mở cho R01–R03.' };
  await taoBang(db);
  const ngay = [7, 30, 90].includes(Number((y || {}).ngay)) ? Number(y.ngay) : 30;
  const hn = homNay(), den = lui(hn, -1), tu = lui(den, ngay), tuT = lui(tu, ngay);
  const nay = await doKy(db, tu, den, ngay), truoc = await doKy(db, tuT, tu, ngay), ht = await doHienTai(db);
  const gt = Object.assign({}, nay.g, ht.g), gtTruoc = Object.assign({}, truoc.g);
  HIEN_TAI.forEach(k => { gtTruoc[k] = null; });
  const kq = chamHet(gt, gtTruoc, ngay);
  const ra = { ok: true, phienBan: PHIEN_BAN_TU, ngay, tu, den, truocTu: tuT, ...kq, phu: Object.assign({}, nay.phu, ht.phu),
    vai: await doVai(db, tu, den), nguoi: await doNguoi(db, tu, den), hoatDong: await doHoatDong(db, tu, den, tuT), kiemTra: await doKiemTra(db, ht) };
  if (ngay === 30) {
    try {
      await db.prepare('INSERT INTO chupTrungTam (ngay, phienBan, duLieu, luc) VALUES (?,?,?,?) ON CONFLICT(ngay) DO NOTHING')
        .bind(hn, PHIEN_BAN_TU, JSON.stringify({ tong: kq.tong, khoi: kq.khoi.map(k => [k.ma, k.diem]), kpi: kq.kpi.map(k => [k.ma, k.gt, k.tt]) }), new Date().toISOString()).run();
    } catch (e) { /* ảnh chụp là phần phụ — không làm hỏng lượt đọc */ }
  }
  return ra;
}

/* ═══════════ CỬA 2 · LỊCH SỬ ĐIỂM ═══════════ */
export async function lichSuTrungTamDo(y, env, db, hoSo) {
  if (lvOf(hoSo) > 3) return { ok: false, code: 'NOPERM', error: 'Mở cho R01–R03.' };
  await taoBang(db);
  const r = await ds(db, 'SELECT ngay, duLieu FROM chupTrungTam ORDER BY ngay DESC LIMIT 90') || [];
  return { ok: true, ds: r.reverse().map(x => { const d = JSON.parse(x.duLieu || '{}'); return { ngay: x.ngay, tong: d.tong, khoi: d.khoi || [], kpi: d.kpi || [] }; }) };
}

/* ═══════════ PHÂN BỔ ═══════════ */
async function ungVien(db, vai) {
  if (!vai.length) return [];
  const ph = vai.map(() => '?').join(',');
  const u = await ds(db, `SELECT id, username, role FROM users WHERE active = 1 AND deletedAt IS NULL AND role IN (${ph})`, ...vai) || [];
  const mo = await ds(db, "SELECT nguoiPhuTrach u, COUNT(*) n FROM keHoachToiUu WHERE trangThai IN ('moi','dangLam') GROUP BY nguoiPhuTrach") || [];
  const lan = await ds(db, "SELECT uid, MAX(luc) l FROM audit WHERE viec = 'DANG_NHAP' GROUP BY uid") || [];
  return u.map(x => ({ u: x.username, vai: x.role, dangMo: Number((mo.find(m => m.u === x.username) || {}).n || 0), lanCuoi: (lan.find(l => l.uid === x.id) || {}).l || '' }));
}
export async function goiYPhanBo(y, env, db, hoSo) {
  if (lvOf(hoSo) > 3) return { ok: false, code: 'NOPERM', error: 'Mở cho R01–R03.' };
  await taoBang(db);
  const gp = GIAI_PHAP[String((y || {}).maGiaiPhap || '')];
  if (!gp) return { ok: false, error: 'Không có giải pháp mang mã này.' };
  const uv = await ungVien(db, gp[1]);
  return { ok: true, vai: gp[1], hanNgay: gp[2], ungVien: uv.sort((a, b) => a.dangMo - b.dangMo), chon: chonNguoi(uv) };
}

/* ═══════════ CỬA 3 · TẠO KẾ HOẠCH TỪ MỘT GIẢI PHÁP ═══════════ */
export async function taoKeHoachToiUu(y, env, db, hoSo) {
  if (lvOf(hoSo) > 3) return { ok: false, code: 'NOPERM', error: 'Duyệt và giao giải pháp do R01–R03.' };
  await taoBang(db);
  const x = y || {}, ma = String(x.maGiaiPhap || ''), gp = GIAI_PHAP[ma];
  if (!gp) return { ok: false, error: 'Không có giải pháp mang mã này.' };
  const buoc = (Array.isArray(x.buoc) ? x.buoc : []).map(b => String(b || '').trim().slice(0, 240)).filter(Boolean).slice(0, 12);
  if (!buoc.length) return { ok: false, error: 'Kế hoạch cần ít nhất một bước.' };
  const ten = String(x.ten || '').trim().slice(0, 200) || ma;
  const trung = await db.prepare("SELECT id FROM keHoachToiUu WHERE maGiaiPhap = ? AND trangThai IN ('moi','dangLam') LIMIT 1").bind(ma).first();
  if (trung) return { ok: false, code: 'TRUNG', error: 'Giải pháp này đang có kế hoạch chạy (' + trung.id + ').', id: trung.id };
  let nguoi = String(x.nguoiPhuTrach || '').trim(), cachChon = 'chiDinh';
  const uv = await ungVien(db, gp[1]);
  if (nguoi) {
    const u = await db.prepare('SELECT username FROM users WHERE username = ? AND active = 1 AND deletedAt IS NULL').bind(nguoi).first();
    if (!u) return { ok: false, error: 'Không có tài khoản đang hoạt động tên ' + nguoi + '.' };
  } else {
    const c = chonNguoi(uv);
    if (!c) return { ok: false, code: 'KHONGNGUOI', error: 'Chưa có tài khoản đang hoạt động ở vai ' + gp[1].join(', ') + ' — chỉ định người phụ trách.' };
    nguoi = c.u; cachChon = 'tuPhanBo';
  }
  const han = Number(x.hanNgay) >= 1 && Number(x.hanNgay) <= 180 ? Number(x.hanNgay) : gp[2];
  const k = KPI.find(z => z.ma === gp[0]);
  const id = 'TU-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), gio = new Date().toISOString();
  const num = v => (v === '' || v == null || !Number.isFinite(Number(v))) ? null : Number(v);
  await db.prepare('INSERT INTO keHoachToiUu (id, maGiaiPhap, kpi, khoi, ten, giaTriDau, mucTieu, vai, nguoiPhuTrach, hanLuc, trangThai, buoc, ghiChu, taoBoi, taoLuc) ' +
    "VALUES (?,?,?,?,?,?,?,?,?,?,'moi',?,?,?,?)")
    .bind(id, ma, gp[0], k.khoi, ten, num(x.giaTriDau), num(x.mucTieu), gp[1].join(','), nguoi, lui(homNay(), -han),
      JSON.stringify(buoc.map(t => ({ t, xong: false }))), String(x.ghiChu || '').slice(0, 1000), hoSo.u, gio).run();
  await Kho.ghiNhatKy(db, { uid: hoSo.uid, username: hoSo.u, viec: 'TOIUU_GIAO', doiTuong: id, chiTiet: ma + ' → ' + nguoi + ' (' + cachChon + ')' });
  return { ok: true, id, nguoiPhuTrach: nguoi, cachChon, hanLuc: lui(homNay(), -han), ungVien: uv };
}

/* ═══════════ CỬA 4 · CẬP NHẬT · ĐO LẠI ═══════════ */
export async function capNhatKeHoachToiUu(y, env, db, hoSo) {
  await taoBang(db);
  const x = y || {}, id = String(x.id || '');
  const k = await db.prepare('SELECT * FROM keHoachToiUu WHERE id = ?').bind(id).first();
  if (!k) return { ok: false, error: 'Không có kế hoạch này.' };
  const ql = lvOf(hoSo) <= 3, chu = String(k.nguoiPhuTrach) === String(hoSo.u);
  if (!ql && !chu) return { ok: false, code: 'NOPERM', error: 'Chỉ người phụ trách hoặc R01–R03 cập nhật kế hoạch này.' };
  if (k.trangThai === 'xong' || k.trangThai === 'huy') return { ok: false, error: 'Kế hoạch đã đóng.' };
  const buoc = JSON.parse(k.buoc || '[]');
  if (Array.isArray(x.buocXong)) buoc.forEach((b, i) => { b.xong = x.buocXong.indexOf(i) >= 0; });
  let tt = k.trangThai;
  if (x.trangThai) {
    if (['moi', 'dangLam', 'xong', 'huy'].indexOf(x.trangThai) < 0) return { ok: false, error: 'Trạng thái không hợp lệ.' };
    if (x.trangThai === 'huy' && !ql) return { ok: false, code: 'NOPERM', error: 'Huỷ kế hoạch do R01–R03.' };
    if (x.trangThai === 'xong' && buoc.some(b => !b.xong)) return { ok: false, error: 'Còn bước chưa xong — tick đủ các bước rồi mới đóng.' };
    tt = x.trangThai;
  } else if (tt === 'moi' && buoc.some(b => b.xong)) tt = 'dangLam';
  let ketQua = null, gio = new Date().toISOString();
  if (tt === 'xong') {
    /* ĐO LẠI: lấy đúng chỉ số của giải pháp ở kỳ 30 ngày tới hôm nay */
    const hn = homNay(), den = lui(hn, -1), tu = lui(den, 30);
    const a = await doKy(db, tu, den, 30), b = await doHienTai(db);
    const v = Object.assign({}, a.g, b.g)[k.kpi];
    ketQua = v == null ? null : Number(v);
  }
  let nguoi = k.nguoiPhuTrach;
  if (x.nguoiPhuTrach && ql) {
    const u = await db.prepare('SELECT username FROM users WHERE username = ? AND active = 1 AND deletedAt IS NULL').bind(String(x.nguoiPhuTrach)).first();
    if (!u) return { ok: false, error: 'Không có tài khoản đang hoạt động tên ' + x.nguoiPhuTrach + '.' };
    nguoi = u.username;
  }
  const ghi = x.ghiChu == null ? k.ghiChu : String(x.ghiChu).slice(0, 1000);
  await db.prepare('UPDATE keHoachToiUu SET buoc = ?, trangThai = ?, ghiChu = ?, nguoiPhuTrach = ?, suaLuc = ?, xongLuc = ?, ketQua = ? WHERE id = ?')
    .bind(JSON.stringify(buoc), tt, ghi, nguoi, gio, tt === 'xong' ? gio : null, tt === 'xong' ? ketQua : null, id).run();
  if (tt !== k.trangThai || nguoi !== k.nguoiPhuTrach)
    await Kho.ghiNhatKy(db, { uid: hoSo.uid, username: hoSo.u, viec: 'TOIUU_CAPNHAT', doiTuong: id, chiTiet: k.trangThai + '→' + tt + (nguoi !== k.nguoiPhuTrach ? ' · giao ' + nguoi : '') });
  return { ok: true, id, trangThai: tt, ketQua, giaTriDau: k.giaTriDau, tienDo: buoc.length ? Math.round(100 * buoc.filter(b => b.xong).length / buoc.length) : 0 };
}

/* ═══════════ CỬA 5 · DANH SÁCH KẾ HOẠCH + TẢI VIỆC ═══════════ */
export async function dsKeHoachToiUu(y, env, db, hoSo) {
  const lv = lvOf(hoSo);
  if (lv > 12) return { ok: false, code: 'NOPERM', error: 'Việc tối ưu dành cho đội ngũ.' };
  await taoBang(db);
  const ql = lv <= 3;
  const r = (ql ? await ds(db, 'SELECT * FROM keHoachToiUu ORDER BY taoLuc DESC LIMIT 300')
                : await ds(db, 'SELECT * FROM keHoachToiUu WHERE nguoiPhuTrach = ? ORDER BY taoLuc DESC LIMIT 100', hoSo.u)) || [];
  const hn = homNay();
  const list = r.map(k => { const b = JSON.parse(k.buoc || '[]');
    return Object.assign({}, k, { buoc: b, tienDo: b.length ? Math.round(100 * b.filter(z => z.xong).length / b.length) : 0, tre: (k.trangThai === 'moi' || k.trangThai === 'dangLam') && k.hanLuc < hn }); });
  const tai = {};
  list.filter(k => k.trangThai === 'moi' || k.trangThai === 'dangLam').forEach(k => { const t = tai[k.nguoiPhuTrach] = tai[k.nguoiPhuTrach] || { u: k.nguoiPhuTrach, mo: 0, tre: 0 }; t.mo++; if (k.tre) t.tre++; });
  return { ok: true, quanLy: ql, ds: list, taiViec: Object.values(tai).sort((a, b) => b.mo - a.mo),
    dem: { moi: list.filter(k => k.trangThai === 'moi').length, dangLam: list.filter(k => k.trangThai === 'dangLam').length, xong: list.filter(k => k.trangThai === 'xong').length, tre: list.filter(k => k.tre).length } };
}
