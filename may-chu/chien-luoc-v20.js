/* ═══════════════════════════════════════════════════════════════
   GITA 365 — NỀN TẢNG CHIẾN LƯỢC V20 (Super Admin)

   Tầng trên của Trung tâm đo lường: không hỏi "hôm nay có gì hỏng" mà hỏi
   "doanh nghiệp đang đi về đâu, đòn bẩy nào lớn nhất, chiến lược nào đáng
   đặt cược". Một cửa đọc + ba cửa mục tiêu:

     docChienLuocV20   12 tháng chuỗi số · North Star (nhà học tích cực) ·
                       cây động lực doanh thu · dòng chảy nhà (giữ · mất · mới) ·
                       phễu 90 ngày · nhóm khách theo tháng vào (giữ chân, LTV) ·
                       đơn vị kinh tế (ARPU · churn · LTV · CAC · LTV/CAC ·
                       hoàn vốn) · dự báo 3 tháng có dải 80% · cảnh báo bất
                       thường theo ngày (z bền) · độ tin cậy dữ liệu · cơ số
                       cho mô phỏng kịch bản. R01–R03.
     dsMucTieuCL · taoMucTieuCL · capNhatMucTieuCL
                       mục tiêu chiến lược gắn một chỉ số đo được; máy tính
                       tiến độ, kỳ vọng theo thời gian, dự báo tại hạn →
                       đúng hướng · chậm · nguy cơ · đạt · trượt.

   ══ GIỚI HẠN THẬT ══
   - "Nhà tích cực" = có tick việc, báo cáo ngày hoặc thời gian dùng app trong
     tháng. Không có ngày "rời" trong dữ liệu nên churn = tích cực tháng trước
     mà không tích cực tháng này.
   - CAC = (chi Tiếp thị đã duyệt + hoa hồng đại sứ đã trả) ÷ nhà mới, 3 tháng
     trọn gần nhất. Chi phí người tư vấn không tính vào (nằm ở Lương).
   - Tháng UTC; tháng đang chạy chỉ dùng cho số tạm, không đưa vào dự báo.
   ═══════════════════════════════════════════════════════════════ */
import { BAC } from './vai-tro.js';
import { Kho } from './nen.js';
import { PHIEN_BAN_V20, holt, zBen, mucBatThuong, tachBienDong, tienDo } from './v20-toan.js';
import { KPI as KPI_TU } from './toi-uu-cham.js';
import { giaTriTU } from './trung-tam-toi-uu.js';

const lvOf = h => BAC[(h || {}).role] || 99;
async function ds(db, sql, ...a) { try { return ((await db.prepare(sql).bind(...a).all()).results) || []; } catch (e) { return null; } }
async function so(db, sql, ...a) { try { const r = await db.prepare(sql).bind(...a).first(); return r && r.n != null ? Number(r.n) : null; } catch (e) { return null; } }
const homNay = () => new Date().toISOString().slice(0, 10);
const luiNgay = (d, n) => { const x = new Date(d + 'T00:00:00Z'); x.setUTCDate(x.getUTCDate() - n); return x.toISOString().slice(0, 10); };
function dsThang(n) {
  const ra = [], d = new Date(); d.setUTCDate(1);
  for (let i = n - 1; i >= 0; i--) { const x = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() - i, 1)); ra.push(x.toISOString().slice(0, 7)); }
  return ra;
}
const r1 = x => x == null ? null : Math.round(x * 10) / 10;
const pt = (a, b) => (a == null || !(b > 0)) ? null : r1(100 * a / b);

let daTao = false;
async function taoBang(db) {
  if (daTao) return;
  await db.prepare('CREATE TABLE IF NOT EXISTS mucTieuChienLuoc (id TEXT PRIMARY KEY, ten TEXT NOT NULL, chiSo TEXT NOT NULL, giaTriDau REAL NOT NULL, ' +
    "mucTieu REAL NOT NULL, tuLuc TEXT NOT NULL, hanLuc TEXT NOT NULL, chuSo TEXT, trangThai TEXT NOT NULL DEFAULT 'dang', ghiChu TEXT, taoBoi TEXT NOT NULL, taoLuc TEXT NOT NULL, suaLuc TEXT)").run();
  daTao = true;
}

/* ═══════════ CHUỖI THÁNG ═══════════ */
async function theoThang(db, sql, tu) {
  const r = await ds(db, sql, tu); if (r == null) return null;
  const o = {}; r.forEach(x => { o[x.th] = Number(x.n) || 0; }); return o;
}
async function tichCucTheoThang(db, tu) {
  /* thang → Set(maNha) — gộp ba nguồn, mỗi nguồn hỏng riêng không kéo cả cụm */
  const ra = {}, them = rows => (rows || []).forEach(x => { (ra[x.th] = ra[x.th] || new Set()).add(String(x.m)); });
  them(await ds(db, 'SELECT DISTINCT substr(ngay,1,7) th, maNha m FROM nhipXong WHERE bo = 0 AND ngay >= ?', tu));
  them(await ds(db, 'SELECT DISTINCT substr(ngay,1,7) th, maKhachHang m FROM baoCaoNgay WHERE ngay >= ?', tu));
  them(await ds(db, "SELECT DISTINCT substr(ngay,1,7) th, maNha m FROM thoiGianNgay WHERE man = '__tong' AND ngay >= ?", tu));
  return ra;
}

export async function docChienLuocV20(y, env, db, hoSo) {
  if (lvOf(hoSo) > 3) return { ok: false, code: 'NOPERM', error: 'Nền tảng chiến lược V20 mở cho R01–R03.' };
  await taoBang(db);
  const TH = dsThang(13), tu = TH[0] + '-01', thNay = TH[TH.length - 1], tron = TH.slice(0, -1);  /* 12 tháng trọn + tháng đang chạy */
  const hn = homNay();
  const c = {
    thu: await theoThang(db, "SELECT substr(ghiLuc,1,7) th, SUM(soTien) n FROM phieuThu WHERE trangThai = 'daDuyet' AND ghiLuc >= ? GROUP BY th", tu),
    chi: await theoThang(db, "SELECT substr(ngayChi,1,7) th, SUM(soTien) n FROM chiPhi WHERE trangThai = 'daDuyet' AND ngayChi >= ? GROUP BY th", tu),
    tiepThi: await theoThang(db, "SELECT substr(ngayChi,1,7) th, SUM(soTien) n FROM chiPhi WHERE trangThai = 'daDuyet' AND khoanMuc = 'tiepThi' AND ngayChi >= ? GROUP BY th", tu),
    hoaHong: await theoThang(db, "SELECT substr(traLuc,1,7) th, SUM(soTien) n FROM hoaHongTra WHERE trangThai = 'daTra' AND traLuc >= ? GROUP BY th", tu),
    hoan: await theoThang(db, "SELECT substr(duyetLuc,1,7) th, SUM(soTien) n FROM hoanTien WHERE trangThai = 'daDuyet' AND duyetLuc >= ? GROUP BY th", tu),
    nhaMoi: await theoThang(db, 'SELECT substr(vaoLuc,1,7) th, COUNT(*) n FROM hoSoKhach WHERE vaoLuc >= ? GROUP BY th', tu),
    lead: await theoThang(db, 'SELECT substr(createdAt,1,7) th, COUNT(*) n FROM dangKyCho WHERE createdAt >= ? GROUP BY th', tu),
    kichHoat: await theoThang(db, "SELECT substr(createdAt,1,7) th, COUNT(*) n FROM dangKyCho WHERE trangThai = 'xong' AND createdAt >= ? GROUP BY th", tu),
    nhaTraTien: await theoThang(db, "SELECT substr(ghiLuc,1,7) th, COUNT(DISTINCT maKhachHang) n FROM phieuThu WHERE trangThai = 'daDuyet' AND ghiLuc >= ? GROUP BY th", tu),
    lenTang: await theoThang(db, 'SELECT substr(luc,1,7) th, COUNT(*) n FROM lichSuTang WHERE denTang > COALESCE(tuTang,0) AND luc >= ? GROUP BY th', tu),
    cham: await theoThang(db, 'SELECT substr(ngay,1,7) th, COUNT(*) n FROM soCham WHERE ngay >= ? GROUP BY th', tu)
  };
  const tc = await tichCucTheoThang(db, tu);
  const chuoi = {};
  Object.keys(c).forEach(k => { chuoi[k] = TH.map(t => c[k] == null ? null : (c[k][t] || 0)); });
  chuoi.nhaTichCuc = TH.map(t => tc[t] ? tc[t].size : 0);
  chuoi.thuTB = TH.map((t, i) => chuoi.nhaTraTien[i] > 0 && chuoi.thu[i] != null ? Math.round(chuoi.thu[i] / chuoi.nhaTraTien[i]) : null);
  chuoi.giuLai = TH.map((t, i) => i === 0 || !tc[TH[i - 1]] ? null : [...tc[TH[i - 1]]].filter(m => tc[t] && tc[t].has(m)).length);
  chuoi.churn = TH.map((t, i) => { const tr = i > 0 && tc[TH[i - 1]] ? tc[TH[i - 1]].size : 0; return tr > 0 && chuoi.giuLai[i] != null ? r1(100 * (tr - chuoi.giuLai[i]) / tr) : null; });

  /* ── North Star + dòng chảy nhà (tháng trọn gần nhất so tháng trước) ── */
  const iL = TH.length - 2, iP = TH.length - 3;
  const dong = {
    thang: TH[iL], dauKy: chuoi.nhaTichCuc[iP], giuLai: chuoi.giuLai[iL],
    mat: chuoi.nhaTichCuc[iP] != null && chuoi.giuLai[iL] != null ? chuoi.nhaTichCuc[iP] - chuoi.giuLai[iL] : null,
    moiVaQuayLai: chuoi.giuLai[iL] != null ? chuoi.nhaTichCuc[iL] - chuoi.giuLai[iL] : null, cuoiKy: chuoi.nhaTichCuc[iL],
    thangNay: chuoi.nhaTichCuc[TH.length - 1]
  };
  /* ── cây động lực doanh thu ── */
  const cay = { thang: TH[iL], thangTruoc: TH[iP], thu: chuoi.thu[iL], thuTruoc: chuoi.thu[iP], nha: chuoi.nhaTraTien[iL], nhaTruoc: chuoi.nhaTraTien[iP],
    tb: chuoi.thuTB[iL], tbTruoc: chuoi.thuTB[iP],
    tach: tachBienDong(chuoi.nhaTraTien[iP], chuoi.thuTB[iP] || 0, chuoi.nhaTraTien[iL], chuoi.thuTB[iL] || 0),
    nhaMoiTra: null, nhaCuTra: null };
  const tra = await ds(db, "SELECT DISTINCT p.maKhachHang m, substr(h.vaoLuc,1,7) vao FROM phieuThu p LEFT JOIN hoSoKhach h ON h.maKhachHang = p.maKhachHang WHERE p.trangThai = 'daDuyet' AND substr(p.ghiLuc,1,7) = ?", TH[iL]);
  if (tra) { cay.nhaMoiTra = tra.filter(x => x.vao === TH[iL]).length; cay.nhaCuTra = tra.length - cay.nhaMoiTra; }

  /* ── phễu 90 ngày ── */
  const t90 = luiNgay(hn, 90);
  const pheu = [
    ['lead', 'Đăng ký (lead)', await so(db, 'SELECT COUNT(*) n FROM dangKyCho WHERE substr(createdAt,1,10) >= ?', t90)],
    ['kichHoat', 'Kích hoạt tài khoản', await so(db, "SELECT COUNT(*) n FROM dangKyCho WHERE trangThai = 'xong' AND substr(createdAt,1,10) >= ?", t90)],
    ['vaoHoc', 'Vào học (hồ sơ nhà)', await so(db, 'SELECT COUNT(*) n FROM hoSoKhach WHERE substr(vaoLuc,1,10) >= ?', t90)],
    ['traTien', 'Có phiếu thu đã duyệt', await so(db, "SELECT COUNT(DISTINCT h.maKhachHang) n FROM hoSoKhach h WHERE substr(h.vaoLuc,1,10) >= ? AND EXISTS (SELECT 1 FROM phieuThu p WHERE p.maKhachHang = h.maKhachHang AND p.trangThai = 'daDuyet')", t90)],
    ['tichCuc', 'Học tích cực 30 ngày qua', await so(db, "SELECT COUNT(*) n FROM hoSoKhach h WHERE substr(h.vaoLuc,1,10) >= ? AND (EXISTS (SELECT 1 FROM nhipXong x WHERE x.maNha = h.maKhachHang AND x.bo = 0 AND x.ngay >= ?) OR EXISTS (SELECT 1 FROM baoCaoNgay b WHERE b.maKhachHang = h.maKhachHang AND b.ngay >= ?))", t90, luiNgay(hn, 30), luiNgay(hn, 30))],
    ['lenTang', 'Đã lên tầng', await so(db, 'SELECT COUNT(DISTINCT l.maKhachHang) n FROM lichSuTang l JOIN hoSoKhach h ON h.maKhachHang = l.maKhachHang WHERE substr(h.vaoLuc,1,10) >= ? AND l.denTang > COALESCE(l.tuTang,0)', t90)]
  ].map(([ma, ten, n], i, a) => ({ ma, ten, n, tyLe: i === 0 ? null : pt(n, a[i - 1][2]) }));

  /* ── nhóm khách theo tháng vào (9 tháng trọn gần nhất) ── */
  const nhomTh = tron.slice(-9);
  const vao = await ds(db, 'SELECT maKhachHang m, substr(vaoLuc,1,7) th FROM hoSoKhach WHERE substr(vaoLuc,1,7) >= ?', nhomTh[0]) || [];
  const thuNha = await ds(db, "SELECT maKhachHang m, SUM(soTien) n FROM phieuThu WHERE trangThai = 'daDuyet' GROUP BY maKhachHang") || [];
  const thuMap = {}; thuNha.forEach(x => { thuMap[x.m] = Number(x.n) || 0; });
  const nhom = nhomTh.map(th => {
    const tv = vao.filter(x => x.th === th).map(x => String(x.m)), i0 = TH.indexOf(th);
    const giu = [];
    for (let k = 0; k <= 5; k++) { const t = TH[i0 + k]; if (!t || t === thNay || !tv.length) { giu.push(null); continue; } giu.push(pt(tv.filter(m => tc[t] && tc[t].has(m)).length, tv.length)); }
    const doanhThu = tv.reduce((s, m) => s + (thuMap[m] || 0), 0);
    return { thang: th, soNha: tv.length, giu, ltvHienTai: tv.length ? Math.round(doanhThu / tv.length) : null };
  });

  /* ── đơn vị kinh tế ── */
  const ba = [iL - 2, iL - 1, iL];
  const sum = (k, idx) => idx.reduce((s, i) => s + (chuoi[k][i] || 0), 0);
  const arpu = chuoi.thuTB[iL];
  const churnTB = (() => { const v = ba.map(i => chuoi.churn[i]).filter(x => x != null); return v.length ? r1(v.reduce((a, b) => a + b, 0) / v.length) : null; })();
  const tuoiDoi = churnTB == null ? null : churnTB > 0 ? Math.min(36, r1(100 / churnTB)) : 36;
  const nhaTraTB = sum('nhaTraTien', ba) / 3, nhaTichCucTB = sum('nhaTichCuc', ba) / 3;
  const tyLeTra = nhaTichCucTB > 0 ? Math.min(1, nhaTraTB / nhaTichCucTB) : null;
  const arpuTichCuc = arpu != null && tyLeTra != null ? arpu * tyLeTra : null;     /* thu mỗi nhà tích cực mỗi tháng */
  const ltv = arpuTichCuc != null && tuoiDoi != null ? Math.round(arpuTichCuc * tuoiDoi) : null;
  const nhaMoi3 = sum('nhaMoi', ba), chiThuHut = sum('tiepThi', ba) + sum('hoaHong', ba);
  const cac = nhaMoi3 > 0 ? Math.round(chiThuHut / nhaMoi3) : null;
  const ktDonVi = { arpu, arpuTichCuc: arpuTichCuc == null ? null : Math.round(arpuTichCuc), churn: churnTB, tuoiDoi, ltv, cac, chiThuHut, nhaMoi3,
    ltvCac: ltv != null && cac > 0 ? r1(ltv / cac) : null, hoanVon: cac != null && arpuTichCuc > 0 ? r1(cac / arpuTichCuc) : null,
    bienGop: sum('thu', ba) > 0 ? pt(sum('thu', ba) - sum('chi', ba) - sum('hoan', ba), sum('thu', ba)) : null };

  /* ── dự báo 3 tháng (chỉ tháng trọn) ── */
  const db3 = {};
  ['thu', 'nhaTichCuc', 'nhaMoi', 'lead', 'chi'].forEach(k => { const s = tron.map((t, i) => chuoi[k][i]).filter(v => v != null); db3[k] = holt(s.slice(-12), 3); });
  const thSau = [1, 2, 3].map(k => { const d = new Date(thNay + '-01T00:00:00Z'); d.setUTCMonth(d.getUTCMonth() + k - 1); return d.toISOString().slice(0, 7); });
  /* tháng đang chạy: số tạm + nhịp chạy */
  const ngayQua = Number(hn.slice(8, 10)), ngayThang = new Date(Date.UTC(Number(thNay.slice(0, 4)), Number(thNay.slice(5, 7)), 0)).getUTCDate();
  const tam = { thang: thNay, ngayQua, ngayThang, thu: chuoi.thu[TH.length - 1], nhaMoi: chuoi.nhaMoi[TH.length - 1], lead: chuoi.lead[TH.length - 1] };
  tam.thuNhip = tam.thu == null ? null : Math.round(tam.thu * ngayThang / Math.max(1, ngayQua));

  /* ── cảnh báo bất thường theo ngày (60 ngày) ── */
  const t60 = luiNgay(hn, 60), homQua = luiNgay(hn, 1);
  const NGAY = [
    ['thu', 'Tiền thu đã duyệt', "SELECT substr(ghiLuc,1,10) d, SUM(soTien) n FROM phieuThu WHERE trangThai = 'daDuyet' AND substr(ghiLuc,1,10) >= ? GROUP BY d", 'phong-tai-chinh'],
    ['dangky', 'Đăng ký mới', 'SELECT substr(createdAt,1,10) d, COUNT(*) n FROM dangKyCho WHERE substr(createdAt,1,10) >= ? GROUP BY d', 'crm'],
    ['cham', 'Lượt chạm khách', 'SELECT substr(ngay,1,10) d, COUNT(*) n FROM soCham WHERE substr(ngay,1,10) >= ? GROUP BY d', 'coach-dp'],
    ['tick', 'Lượt tick việc của nhà', 'SELECT ngay d, COUNT(*) n FROM nhipXong WHERE bo = 0 AND ngay >= ? GROUP BY d', 'do-luong-he'],
    ['baocao', 'Báo cáo ngày của nhà', 'SELECT ngay d, COUNT(*) n FROM baoCaoNgay WHERE ngay >= ? GROUP BY d', 'do-luong-he'],
    ['dangnhap', 'Lượt đăng nhập', "SELECT substr(luc,1,10) d, COUNT(*) n FROM audit WHERE viec = 'DANG_NHAP' AND substr(luc,1,10) >= ? GROUP BY d", 'nhat-ky-ht'],
    ['loiai', 'Lỗi nhà cung cấp AI', 'SELECT ngay d, SUM(soLan) n FROM loiNccDaTri WHERE ngay >= ? GROUP BY d', 'bo-nao-da-tri'],
    ['chi', 'Chi được duyệt', "SELECT substr(ngayChi,1,10) d, SUM(soTien) n FROM chiPhi WHERE trangThai = 'daDuyet' AND substr(ngayChi,1,10) >= ? GROUP BY d", 'phong-tai-chinh']
  ];
  const ngays = []; for (let i = 60; i >= 1; i--) ngays.push(luiNgay(hn, i));
  const batThuong = [];
  for (const [ma, ten, sql, man] of NGAY) {
    const r = await ds(db, sql, t60); if (r == null) { batThuong.push({ ma, ten, man, muc: 'chuaDo', chuoi: [] }); continue; }
    const m = {}; r.forEach(x => { m[x.d] = Number(x.n) || 0; });
    const s = ngays.map(d => m[d] || 0);
    const nen = s.slice(-29, -1), x = s[s.length - 1];
    const z = r.length ? zBen(nen, x) : null;
    const tuan = s.slice(-7).reduce((a, b) => a + b, 0), tuanNen = [0, 1, 2, 3].map(k => s.slice(-7 * (k + 2), -7 * (k + 1)).reduce((a, b) => a + b, 0));
    const tbTuan = tuanNen.reduce((a, b) => a + b, 0) / 4;
    batThuong.push({ ma, ten, man, homQua: x, ngay: homQua, z, muc: r.length ? mucBatThuong(z) : 'chuaDo', tuan, tbTuan: Math.round(tbTuan), doiTuan: tbTuan > 0 ? pt(tuan - tbTuan, tbTuan) : null, chuoi: s.slice(-30) });
  }

  /* ── độ tin cậy dữ liệu ── */
  const NGUON = [
    ['phieuThu', 'ghiLuc', 'Phiếu thu'], ['chiPhi', 'ngayChi', 'Chi phí'], ['hoSoKhach', 'vaoLuc', 'Hồ sơ nhà'], ['dangKyCho', 'createdAt', 'Đăng ký'],
    ['crmKhach', 'capNhatLuc', 'CRM nhà'], ['crmCoHoi', 'capNhatLuc', 'Cơ hội bán'], ['soCham', 'ngay', 'Sổ chạm'], ['nhipXong', 'ngay', 'Tick việc'],
    ['baoCaoNgay', 'ngay', 'Báo cáo ngày'], ['thoiGianNgay', 'ngay', 'Thời gian dùng app'], ['danhGiaKH', 'luc', 'Phiếu hài lòng'], ['kyThu', 'taoLuc', 'Lịch thu'],
    ['khaiSoNgoai', 'ngayDoc', 'Số kênh ngoài'], ['soTokenDaTri', 'ngay', 'Token AI'], ['audit', 'luc', 'Nhật ký thao tác']
  ];
  const nguon = [];
  for (const [bang, cot, ten] of NGUON) {
    const r = await ds(db, `SELECT COUNT(*) n, MAX(substr(${cot},1,10)) cuoi FROM ${bang}`);
    if (r == null) { nguon.push({ bang, ten, so: null, cuoi: null, ngayCu: null, tt: 'thieuBang' }); continue; }
    const n = Number(r[0].n) || 0, cuoi = r[0].cuoi || null;
    const ngayCu = cuoi ? Math.round((Date.parse(hn) - Date.parse(cuoi)) / 864e5) : null;
    nguon.push({ bang, ten, so: n, cuoi, ngayCu, tt: !n ? 'trong' : ngayCu <= 3 ? 'tuoi' : ngayCu <= 14 ? 'cu' : 'ngu' });
  }
  const du = [
    ['Nhà đang học có Coach', await so(db, "SELECT COUNT(*) n FROM hoSoKhach WHERE trangThai = 'dangHoc' AND COALESCE(coach,'') <> ''"), await so(db, "SELECT COUNT(*) n FROM hoSoKhach WHERE trangThai = 'dangHoc'")],
    ['Phiếu thu gắn kỳ thu', await so(db, "SELECT COUNT(*) n FROM phieuThu WHERE trangThai = 'daDuyet' AND COALESCE(idKy,'') <> ''"), await so(db, "SELECT COUNT(*) n FROM phieuThu WHERE trangThai = 'daDuyet'")],
    ['Khoản chi có hoá đơn', await so(db, "SELECT COUNT(*) n FROM chiPhi WHERE trangThai = 'daDuyet' AND coHoaDon = 1"), await so(db, "SELECT COUNT(*) n FROM chiPhi WHERE trangThai = 'daDuyet'")],
    ['Nhà có giai đoạn CRM', await so(db, "SELECT COUNT(*) n FROM crmKhach WHERE COALESCE(giaiDoan,'') <> ''"), await so(db, 'SELECT COUNT(*) n FROM hoSoKhach')]
  ].map(([ten, a, b]) => ({ ten, co: a, tong: b, pt: pt(a, b) }));
  const diemNguon = nguon.map(x => x.tt === 'tuoi' ? 100 : x.tt === 'cu' ? 60 : x.tt === 'ngu' ? 20 : 0);
  const diemDu = du.filter(x => x.pt != null).map(x => x.pt);
  const tinCay = Math.round(0.6 * (diemNguon.reduce((a, b) => a + b, 0) / diemNguon.length) + 0.4 * (diemDu.length ? diemDu.reduce((a, b) => a + b, 0) / diemDu.length : 0));

  /* ── cơ số mô phỏng (3 tháng trọn gần nhất) ── */
  const s3 = k => sum(k, ba) / 3;
  const coSo = { lead: Math.round(s3('lead')), kichHoat: s3('lead') > 0 ? Math.min(1, s3('kichHoat') / s3('lead')) : 0.5,
    vaoHoc: s3('kichHoat') > 0 ? Math.min(1, s3('nhaMoi') / s3('kichHoat')) : 0.5, nha: chuoi.nhaTichCuc[iL] || 0,
    giuChan: churnTB == null ? 0.9 : Math.max(0, 1 - churnTB / 100), traTien: tyLeTra == null ? 0.5 : tyLeTra, arpu: arpu || 0 };

  return { ok: true, phienBan: PHIEN_BAN_V20, thang: TH, thangNay: thNay, chuoi, dong, cay, pheu, nhom, ktDonVi, duBao: { thang: thSau, ...db3 }, tam,
    batThuong, nguon, du, tinCay, coSo };
}

/* ═══════════ MỤC TIÊU CHIẾN LƯỢC ═══════════ */
export const CHI_SO_V20 = {
  nhaTichCuc: ['Nhà học tích cực (tháng)', 'nhà', 'cao'], thu: ['Doanh thu tháng', 'đ', 'cao'], nhaMoi: ['Nhà mới mỗi tháng', 'nhà', 'cao'],
  lead: ['Lead mỗi tháng', 'lượt', 'cao'], tyLeKichHoat: ['Tỷ lệ kích hoạt đăng ký', '%', 'cao'], arpu: ['Thu TB mỗi nhà trả tiền', 'đ', 'cao'],
  churn: ['Tỷ lệ rời hằng tháng', '%', 'thap'], cac: ['Chi phí thu hút một nhà (CAC)', 'đ', 'thap'], ltvCac: ['LTV / CAC', 'lần', 'cao'],
  bienGop: ['Biên thu − chi', '%', 'cao']
};
function giaTriV20(d) {
  const iL = d.thang.length - 2, c = d.chuoi;
  return { nhaTichCuc: c.nhaTichCuc[iL], thu: c.thu[iL], nhaMoi: c.nhaMoi[iL], lead: c.lead[iL],
    tyLeKichHoat: c.lead[iL] > 0 ? Math.round(1000 * c.kichHoat[iL] / c.lead[iL]) / 10 : null, arpu: d.ktDonVi.arpu, churn: d.ktDonVi.churn,
    cac: d.ktDonVi.cac, ltvCac: d.ktDonVi.ltvCac, bienGop: d.ktDonVi.bienGop };
}
function duBaoTai(d, chiSo, hanLuc) {
  const k = { nhaTichCuc: 'nhaTichCuc', thu: 'thu', nhaMoi: 'nhaMoi', lead: 'lead' }[chiSo];
  if (!k) return null;
  const s = d.chuoi[k].slice(0, -1).filter(v => v != null);
  const h = Math.max(1, Math.round((Date.parse(hanLuc) - Date.now()) / (30.4 * 864e5)));
  const f = holt(s.slice(-12), Math.min(24, h));
  return f ? f.duBao[f.duBao.length - 1] : null;
}
function hopLeChiSo(ma) { return !!CHI_SO_V20[ma] || KPI_TU.some(k => k.ma === ma && k.kieu !== 'theoDoi'); }

export async function dsMucTieuCL(y, env, db, hoSo) {
  if (lvOf(hoSo) > 3) return { ok: false, code: 'NOPERM', error: 'Mục tiêu chiến lược mở cho R01–R03.' };
  await taoBang(db);
  const r = await ds(db, 'SELECT * FROM mucTieuChienLuoc ORDER BY trangThai, hanLuc LIMIT 100') || [];
  if (!r.length) return { ok: true, ds: [] };
  const d = await docChienLuocV20({}, env, db, hoSo), v20 = giaTriV20(d);
  const canTU = r.some(m => !CHI_SO_V20[m.chiSo]);
  const tu = canTU ? await giaTriTU(db) : {};
  const hn = homNay();
  return { ok: true, ds: r.map(m => {
    const hienTai = CHI_SO_V20[m.chiSo] ? v20[m.chiSo] : tu[m.chiSo];
    const db1 = duBaoTai(d, m.chiSo, m.hanLuc);
    const t = m.trangThai === 'huy' ? { tienDo: null, kyVong: null, trangThai: 'huy' } : tienDo(m, hienTai, hn, db1);
    return Object.assign({}, m, { hienTai: hienTai == null ? null : hienTai, duBaoTaiHan: db1, tienDo: t.tienDo, kyVong: t.kyVong, danhGia: t.trangThai });
  }) };
}
export async function taoMucTieuCL(y, env, db, hoSo) {
  if (lvOf(hoSo) > 2) return { ok: false, code: 'NOPERM', error: 'Đặt mục tiêu chiến lược do R01–R02.' };
  await taoBang(db);
  const x = y || {}, ten = String(x.ten || '').trim().slice(0, 200), ma = String(x.chiSo || '');
  if (ten.length < 5) return { ok: false, error: 'Đặt tên mục tiêu (ít nhất 5 ký tự).' };
  if (!hopLeChiSo(ma)) return { ok: false, error: 'Chỉ số không có trong danh mục đo được.' };
  const dau = Number(x.giaTriDau), muc = Number(x.mucTieu);
  if (!Number.isFinite(dau) || !Number.isFinite(muc) || dau === muc) return { ok: false, error: 'Cần giá trị đầu và mục tiêu là số, khác nhau.' };
  const han = String(x.hanLuc || '');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(han) || han <= homNay()) return { ok: false, error: 'Hạn phải là ngày trong tương lai (YYYY-MM-DD).' };
  const dem = await so(db, "SELECT COUNT(*) n FROM mucTieuChienLuoc WHERE trangThai = 'dang'");
  if (dem >= 30) return { ok: false, error: 'Đã có 30 mục tiêu đang chạy — chiến lược tốt là ít mục tiêu. Đóng bớt trước.' };
  const id = 'CL-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), gio = new Date().toISOString();
  await db.prepare("INSERT INTO mucTieuChienLuoc (id, ten, chiSo, giaTriDau, mucTieu, tuLuc, hanLuc, chuSo, trangThai, ghiChu, taoBoi, taoLuc) VALUES (?,?,?,?,?,?,?,?,'dang',?,?,?)")
    .bind(id, ten, ma, dau, muc, homNay(), han, String(x.chuSo || '').slice(0, 60), String(x.ghiChu || '').slice(0, 1000), hoSo.u, gio).run();
  await Kho.ghiNhatKy(db, { uid: hoSo.uid, username: hoSo.u, viec: 'CL_DAT_MUC_TIEU', doiTuong: id, chiTiet: ma + ': ' + dau + ' → ' + muc + ' trước ' + han });
  return { ok: true, id };
}
export async function capNhatMucTieuCL(y, env, db, hoSo) {
  if (lvOf(hoSo) > 2) return { ok: false, code: 'NOPERM', error: 'Sửa mục tiêu chiến lược do R01–R02.' };
  await taoBang(db);
  const x = y || {}, m = await db.prepare('SELECT * FROM mucTieuChienLuoc WHERE id = ?').bind(String(x.id || '')).first();
  if (!m) return { ok: false, error: 'Không có mục tiêu này.' };
  const tt = x.trangThai ? String(x.trangThai) : m.trangThai;
  if (['dang', 'dat', 'huy'].indexOf(tt) < 0) return { ok: false, error: 'Trạng thái không hợp lệ.' };
  const muc = x.mucTieu == null || x.mucTieu === '' ? m.mucTieu : Number(x.mucTieu);
  const han = x.hanLuc ? String(x.hanLuc) : m.hanLuc;
  if (!Number.isFinite(muc) || !/^\d{4}-\d{2}-\d{2}$/.test(han)) return { ok: false, error: 'Mục tiêu / hạn không hợp lệ.' };
  const lyDo = String(x.lyDo || '').trim();
  if ((muc !== m.mucTieu || han !== m.hanLuc) && lyDo.length < 10) return { ok: false, error: 'Đổi mục tiêu hoặc hạn phải ghi lý do (ít nhất 10 ký tự).' };
  await db.prepare('UPDATE mucTieuChienLuoc SET mucTieu = ?, hanLuc = ?, trangThai = ?, ghiChu = ?, suaLuc = ? WHERE id = ?')
    .bind(muc, han, tt, lyDo ? ((m.ghiChu ? m.ghiChu + '\n' : '') + homNay() + ': ' + lyDo).slice(-2000) : m.ghiChu, new Date().toISOString(), m.id).run();
  await Kho.ghiNhatKy(db, { uid: hoSo.uid, username: hoSo.u, viec: 'CL_SUA_MUC_TIEU', doiTuong: m.id, chiTiet: m.trangThai + '→' + tt + (lyDo ? ' · ' + lyDo.slice(0, 120) : '') });
  return { ok: true, id: m.id, trangThai: tt };
}
