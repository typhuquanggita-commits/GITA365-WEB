/* ═══════════════════════════════════════════════════════════════
   GITA 365 — NỀN TẢNG CHIẾN LƯỢC V20 · TOÁN THUẦN (V20-2026.10-a)

   Các phép tính làm nền cho quyết định chiến lược — thuần, không chạm D1,
   có bản sao ES5 ở src/data-v20.js (tools/thu-v20.mjs so hai bên):
     holt        dự báo xu hướng (làm trơn hàm mũ kép Holt) + dải tin cậy 80%
     zBen        độ lệch "bền" (trung vị · MAD) — phát hiện bất thường không
                 bị một ngày đột biến kéo lệch như trung bình · độ lệch chuẩn
     tachBienDong  tách thay đổi doanh thu thành phần do SỐ NHÀ và phần do
                 THU TRUNG BÌNH (phương pháp trung điểm, cộng lại đúng tổng)
     moPhong     mô phỏng 12 tháng: lead → kích hoạt → vào học → giữ chân → thu
     doNhay      tăng từng đòn bẩy 10% → doanh thu tháng 12 đổi bao nhiêu
     tienDo      tiến độ mục tiêu so với kỳ vọng tuyến tính + dự báo tại hạn
   Không đoán khi thiếu dữ liệu: chuỗi quá ngắn → null.
   ═══════════════════════════════════════════════════════════════ */

export const PHIEN_BAN_V20 = 'V20-2026.10-a';

const r2 = x => Math.round(x * 100) / 100;

/* Holt: chuỗi ≥ 3 điểm. Trả { san, xuHuong, duBao[h], duoi[h], tren[h], sai } */
export function holt(chuoi, h, alpha, beta) {
  const y = (chuoi || []).map(Number).filter(v => Number.isFinite(v));
  if (y.length < 3) return null;
  const a = alpha == null ? 0.5 : alpha, b = beta == null ? 0.3 : beta;
  let L = y[0], T = y[1] - y[0];
  const loi = [];
  for (let i = 1; i < y.length; i++) {
    const duDoan = L + T;
    loi.push(y[i] - duDoan);
    const L2 = a * y[i] + (1 - a) * (L + T);
    T = b * (L2 - L) + (1 - b) * T;
    L = L2;
  }
  const sai = Math.sqrt(loi.reduce((s, e) => s + e * e, 0) / Math.max(1, loi.length));
  const duBao = [], duoi = [], tren = [];
  for (let k = 1; k <= (h || 3); k++) {
    const v = Math.max(0, L + k * T), w = 1.2816 * sai * Math.sqrt(k);
    duBao.push(r2(v)); duoi.push(r2(Math.max(0, v - w))); tren.push(r2(v + w));
  }
  return { san: r2(L), xuHuong: r2(T), duBao, duoi, tren, sai: r2(sai) };
}

function trungVi(a) {
  const s = a.slice().sort((x, y) => x - y), n = s.length;
  return n ? (n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2) : null;
}
/* z bền của x so với mẫu nen (≥ 7 điểm). MAD = 0 → so với 10% trung vị (tối thiểu 1) */
export function zBen(nen, x) {
  const a = (nen || []).map(Number).filter(v => Number.isFinite(v));
  if (a.length < 7 || x == null || !Number.isFinite(Number(x))) return null;
  const m = trungVi(a), mad = trungVi(a.map(v => Math.abs(v - m))) * 1.4826;
  const thang = mad > 0 ? mad : Math.max(1, Math.abs(m) * 0.1);
  return r2((Number(x) - m) / thang);
}
export function mucBatThuong(z) {
  if (z == null) return 'chuaDo';
  const k = Math.abs(z);
  return k >= 3 ? 'do' : k >= 2 ? 'vang' : 'xanh';
}

/* Doanh thu = n × p. Tách (n0,p0) → (n1,p1): tổng = phần số nhà + phần thu TB */
export function tachBienDong(n0, p0, n1, p1) {
  const vals = [n0, p0, n1, p1].map(Number);
  if (vals.some(v => !Number.isFinite(v))) return null;
  const [a0, b0, a1, b1] = vals;
  const phanSoNha = (a1 - a0) * (b0 + b1) / 2, phanTrungBinh = (b1 - b0) * (a0 + a1) / 2;
  return { tong: r2(a1 * b1 - a0 * b0), phanSoNha: r2(phanSoNha), phanTrungBinh: r2(phanTrungBinh) };
}

/* co: { lead, kichHoat (0..1), vaoHoc (0..1 của lead đã kích hoạt), nha, giuChan (0..1 = 1 − churn),
         traTien (0..1 nhà tích cực có trả tiền trong tháng), arpu }
   dc: điều chỉnh tương đối, ví dụ { lead: 0.1 } = +10%; kichHoat/vaoHoc/giuChan/traTien cộng điểm % tuyệt đối khi đặt *_d */
export function apDieuChinh(co, dc) {
  const d = dc || {}, c = Object.assign({}, co);
  const kep = (v, a, b) => Math.max(a, Math.min(b, v));
  c.lead = c.lead * (1 + (d.lead || 0));
  c.kichHoat = kep(c.kichHoat + (d.kichHoat || 0), 0, 1);
  c.vaoHoc = kep(c.vaoHoc + (d.vaoHoc || 0), 0, 1);
  c.giuChan = kep(c.giuChan + (d.giuChan || 0), 0, 0.995);
  c.traTien = kep(c.traTien + (d.traTien || 0), 0, 1);
  c.arpu = c.arpu * (1 + (d.arpu || 0));
  return c;
}
export function moPhong(co, dc, soThang) {
  const c = apDieuChinh(co, dc), n = soThang || 12, nha = [], thu = [];
  let N = Number(c.nha) || 0;
  for (let i = 0; i < n; i++) {
    const moi = c.lead * c.kichHoat * c.vaoHoc;
    N = N * c.giuChan + moi;
    nha.push(Math.round(N));
    thu.push(Math.round(N * c.traTien * c.arpu));
  }
  return { nha, thu, tongThu: thu.reduce((a, b) => a + b, 0) };
}
/* Độ nhạy: mỗi đòn bẩy tăng 10% giá trị của chính nó (giữ chân: giảm 10% tỷ lệ rời) → % đổi tổng thu 12 tháng */
export const DON_BAY = [
  ['lead', 'Lượng lead mỗi tháng'], ['kichHoat', 'Tỷ lệ kích hoạt đăng ký'], ['vaoHoc', 'Tỷ lệ lead kích hoạt vào học'],
  ['giuChan', 'Giữ chân (giảm 10% số nhà rời)'], ['traTien', 'Tỷ lệ nhà tích cực có trả tiền'], ['arpu', 'Thu trung bình mỗi nhà trả tiền']
];
export function doNhay(co, soThang) {
  const goc = moPhong(co, {}, soThang).tongThu;
  if (!(goc > 0)) return DON_BAY.map(([ma, ten]) => ({ ma, ten, pt: null }));
  return DON_BAY.map(([ma, ten]) => {
    const dc = {};
    if (ma === 'lead' || ma === 'arpu') dc[ma] = 0.1;
    else if (ma === 'giuChan') dc[ma] = (1 - (co.giuChan || 0)) * 0.1;   /* giữ chân: giảm 10% phần rời — cùng cỡ với các đòn bẩy khác */
    else dc[ma] = (co[ma] || 0) * 0.1;
    return { ma, ten, pt: r2(100 * (moPhong(co, dc, soThang).tongThu - goc) / goc) };
  }).sort((a, b) => (b.pt || 0) - (a.pt || 0));
}

/* Tiến độ mục tiêu. huong 'cao' | 'thap'. Trả { tienDo, kyVong, trangThai } */
export function tienDo(m, hienTai, homNay, duBaoTaiHan) {
  const dau = Number(m.giaTriDau), muc = Number(m.mucTieu), v = hienTai == null ? null : Number(hienTai);
  if (!Number.isFinite(dau) || !Number.isFinite(muc) || muc === dau || v == null || !Number.isFinite(v)) return { tienDo: null, kyVong: null, trangThai: 'chuaDo' };
  const t0 = Date.parse(m.tuLuc), t1 = Date.parse(m.hanLuc), t = Date.parse(homNay);
  const kyVong = t1 > t0 ? Math.max(0, Math.min(100, 100 * (t - t0) / (t1 - t0))) : 100;
  const td = 100 * (v - dau) / (muc - dau);
  const datRoi = muc > dau ? v >= muc : v <= muc;
  let tt;
  if (datRoi) tt = 'dat';
  else if (t > t1) tt = 'truot';
  else {
    const dbDat = duBaoTaiHan == null ? null : (muc > dau ? duBaoTaiHan >= muc : duBaoTaiHan <= muc);
    tt = td >= kyVong - 10 ? 'dungHuong' : (dbDat ? 'cham' : 'nguyCo');
  }
  return { tienDo: r2(td), kyVong: r2(kyVong), trangThai: tt };
}
