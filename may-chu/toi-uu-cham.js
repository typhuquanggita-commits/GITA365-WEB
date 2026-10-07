/* ═══════════════════════════════════════════════════════════════
   GITA 365 — TRUNG TÂM ĐO LƯỜNG & TỐI ƯU · CÔNG THỨC THUẦN (TU-2026.10-a)

   Một bảng chỉ số cho TOÀN HỆ, gom 16 ban vào 7 KHỐI để Super Admin nhìn
   một chỗ. Mỗi chỉ số khai: khối, đơn vị, kiểu chấm, ngưỡng đạt / cảnh báo,
   và màn chi tiết đang có sẵn (không dựng màn thứ hai cho cùng một việc).

   Kiểu chấm:
     cao     càng cao càng tốt   — đạt ≥ muc · cảnh báo ≥ vang · còn lại xấu
     thap    càng thấp càng tốt  — đạt ≤ muc · cảnh báo ≤ vang · còn lại xấu
     tang    không tụt so kỳ trước — đạt ≥ kỳ trước · cảnh báo ≥ 80% · xấu
     tran    không phình quá kỳ trước — đạt ≤ 120% · cảnh báo ≤ 150% · xấu
     theoDoi chỉ để nhìn, không chấm
   theoKy: ngưỡng tính cho 30 ngày, co theo độ dài kỳ đang xem.
   Không có số (bảng trống, chưa phát sinh) → 'chuaDo', không đoán.

   Bản sao ES5 ở src/data-toi-uu.js — tools/thu-toi-uu.mjs so hai bên.
   ═══════════════════════════════════════════════════════════════ */

export const PHIEN_BAN_TU = 'TU-2026.10-a';

export const KHOI = [
  { ma: 'TV', ten: 'Tư vấn & bán hàng',        ban: ['B04'],               man: 'crm' },
  { ma: 'CO', ten: 'Coach & chăm sóc',          ban: ['B05', 'B14'],        man: 'coach-dp' },
  { ma: 'KH', ten: 'Khách hàng & trải nghiệm',  ban: ['B06'],               man: 'do-luong-he' },
  { ma: 'MK', ten: 'Marketing & nội dung',      ban: ['B02', 'B03', 'B12'], man: 'kien-truc-thi-giac' },
  { ma: 'TC', ten: 'Tài chính',                 ban: ['B11'],               man: 'phong-tai-chinh' },
  { ma: 'NS', ten: 'Nhân sự & vận hành',        ban: ['B08', 'B13', 'B16'], man: 'nang-luc-ns' },
  { ma: 'CN', ten: 'Công nghệ, AI & an toàn',   ban: ['B01', 'B07', 'B09', 'B10', 'B15'], man: 'bo-nao-da-tri' }
];

export const KPI = [
  { ma: 'tv1', khoi: 'TV', ten: 'Nhà mới vào học',                 dv: 'nhà',        kieu: 'tang' },
  { ma: 'tv2', khoi: 'TV', ten: 'Tỷ lệ kích hoạt đăng ký',         dv: '%',          kieu: 'cao',  muc: 60, vang: 40 },
  { ma: 'tv3', khoi: 'TV', ten: 'Nhà chưa có người phụ trách',     dv: '%',          kieu: 'thap', muc: 5,  vang: 15 },
  { ma: 'tv4', khoi: 'TV', ten: 'Hẹn chăm sóc quá hạn',            dv: '%',          kieu: 'thap', muc: 5,  vang: 15 },
  { ma: 'tv5', khoi: 'TV', ten: 'Tỷ lệ chốt cơ hội',               dv: '%',          kieu: 'cao',  muc: 40, vang: 25 },
  { ma: 'tv6', khoi: 'TV', ten: 'Giá trị cơ hội đang mở',          dv: 'đ',          kieu: 'theoDoi' },
  { ma: 'co1', khoi: 'CO', ten: 'Lượt chạm mỗi nhà',               dv: 'lượt/nhà',   kieu: 'cao',  muc: 4,  vang: 2, theoKy: true },
  { ma: 'co2', khoi: 'CO', ten: 'Nhà quá 7 ngày chưa được chạm',   dv: '%',          kieu: 'thap', muc: 15, vang: 30 },
  { ma: 'co3', khoi: 'CO', ten: 'Nhà đèn đỏ',                      dv: '%',          kieu: 'thap', muc: 10, vang: 20 },
  { ma: 'co4', khoi: 'CO', ten: 'Tỷ lệ ngày tick việc hôm nay',    dv: '%',          kieu: 'cao',  muc: 50, vang: 30 },
  { ma: 'co5', khoi: 'CO', ten: 'Báo cáo ngày mỗi nhà',            dv: 'báo cáo/nhà', kieu: 'cao', muc: 12, vang: 6, theoKy: true },
  { ma: 'co6', khoi: 'CO', ten: 'Khoảnh khắc WOW',                 dv: 'lượt',       kieu: 'tang' },
  { ma: 'co7', khoi: 'CO', ten: 'Nhà lên tầng',                    dv: 'nhà',        kieu: 'tang' },
  { ma: 'kh1', khoi: 'KH', ten: 'Tỷ lệ nhà có hoạt động',          dv: '%',          kieu: 'cao',  muc: 70, vang: 50 },
  { ma: 'kh2', khoi: 'KH', ten: 'Phút dùng app mỗi nhà',           dv: 'phút/nhà',   kieu: 'cao',  muc: 300, vang: 120, theoKy: true },
  { ma: 'kh3', khoi: 'KH', ten: 'NPS',                             dv: 'điểm',       kieu: 'cao',  muc: 50, vang: 20 },
  { ma: 'kh4', khoi: 'KH', ten: 'Hài lòng CSAT',                   dv: '/5',         kieu: 'cao',  muc: 4,  vang: 3.5 },
  { ma: 'kh5', khoi: 'KH', ten: 'Tỷ lệ hoàn tiền',                 dv: '%',          kieu: 'thap', muc: 2,  vang: 5 },
  { ma: 'mk1', khoi: 'MK', ten: 'Đăng ký mới (lead)',              dv: 'lượt',       kieu: 'tang' },
  { ma: 'mk2', khoi: 'MK', ten: 'Bài nội dung vào cổng',           dv: 'bài',        kieu: 'tang' },
  { ma: 'mk3', khoi: 'MK', ten: 'Bài đăng kênh ngoài',             dv: 'bài',        kieu: 'tang' },
  { ma: 'mk4', khoi: 'MK', ten: 'Lượt xem (khai từ kênh ngoài)',   dv: 'lượt',       kieu: 'tang' },
  { ma: 'mk5', khoi: 'MK', ten: 'Tỷ lệ bấm trên xem',              dv: '%',          kieu: 'cao',  muc: 2,  vang: 1 },
  { ma: 'mk6', khoi: 'MK', ten: 'Nhà mới đến từ giới thiệu',       dv: '%',          kieu: 'cao',  muc: 20, vang: 10 },
  { ma: 'tc1', khoi: 'TC', ten: 'Tiền thu đã duyệt',               dv: 'đ',          kieu: 'tang' },
  { ma: 'tc2', khoi: 'TC', ten: 'Tỷ lệ chi trên thu',              dv: '%',          kieu: 'thap', muc: 70, vang: 90 },
  { ma: 'tc3', khoi: 'TC', ten: 'Dòng tiền ròng',                  dv: 'đ',          kieu: 'cao',  muc: 0,  vang: 0 },
  { ma: 'tc4', khoi: 'TC', ten: 'Phiếu thu chờ duyệt quá 3 ngày',  dv: 'phiếu',      kieu: 'thap', muc: 0,  vang: 2 },
  { ma: 'tc5', khoi: 'TC', ten: 'Kỳ thu quá hạn chưa thu đủ',      dv: 'kỳ',         kieu: 'thap', muc: 0,  vang: 3 },
  { ma: 'tc6', khoi: 'TC', ten: 'Chi không có hoá đơn',            dv: '%',          kieu: 'thap', muc: 10, vang: 25 },
  { ma: 'tc7', khoi: 'TC', ten: 'Đề xuất chi chờ duyệt quá 7 ngày', dv: 'phiếu',     kieu: 'thap', muc: 0,  vang: 3 },
  { ma: 'ns1', khoi: 'NS', ten: 'Nhân sự đăng nhập trong 7 ngày',  dv: '%',          kieu: 'cao',  muc: 80, vang: 60 },
  { ma: 'ns2', khoi: 'NS', ten: 'Thao tác mỗi nhân sự mỗi ngày',   dv: 'lượt',       kieu: 'theoDoi' },
  { ma: 'ns3', khoi: 'NS', ten: 'Nhân sự mới chưa qua đủ ba cửa',  dv: 'người',      kieu: 'thap', muc: 0,  vang: 1 },
  { ma: 'ns4', khoi: 'NS', ten: 'Việc tối ưu quá hạn',             dv: 'việc',       kieu: 'thap', muc: 0,  vang: 2 },
  { ma: 'ns5', khoi: 'NS', ten: 'Tài khoản nhân sự bỏ không 30 ngày', dv: 'tài khoản', kieu: 'thap', muc: 0, vang: 2 },
  { ma: 'cn1', khoi: 'CN', ten: 'Token AI tiêu thụ',               dv: 'token',      kieu: 'tran' },
  { ma: 'cn2', khoi: 'CN', ten: 'Lỗi nhà cung cấp AI mỗi ngày',    dv: 'lỗi/ngày',   kieu: 'thap', muc: 2,  vang: 5 },
  { ma: 'cn3', khoi: 'CN', ten: 'Báo động · đóng băng hệ thống',   dv: 'lần',        kieu: 'thap', muc: 0,  vang: 1 },
  { ma: 'cn4', khoi: 'CN', ten: 'Phát hiện thanh tra mức nặng',    dv: 'lần',        kieu: 'thap', muc: 0,  vang: 1 },
  { ma: 'cn5', khoi: 'CN', ten: 'Yêu cầu xoá dữ liệu quá hạn',     dv: 'yêu cầu',    kieu: 'thap', muc: 0,  vang: 0 }
];

const r1 = x => Math.round(x * 10) / 10;
/* Ngưỡng của một chỉ số ở kỳ dài `ngay` ngày */
export function nguong(k, ngay) {
  const he = k.theoKy ? (Number(ngay) || 30) / 30 : 1;
  return { muc: k.muc == null ? null : r1(k.muc * he), vang: k.vang == null ? null : r1(k.vang * he) };
}
/* → 'dat' · 'canhBao' · 'xau' · 'chuaDo' · 'theoDoi' */
export function cham(k, gt, truoc, ngay) {
  if (k.kieu === 'theoDoi') return 'theoDoi';
  if (gt == null || Number.isNaN(Number(gt))) return 'chuaDo';
  const v = Number(gt);
  if (k.kieu === 'tang') {
    if (truoc == null) return 'chuaDo';
    if (!(truoc > 0)) return v > 0 ? 'dat' : 'chuaDo';
    return v >= truoc ? 'dat' : v >= truoc * 0.8 ? 'canhBao' : 'xau';
  }
  if (k.kieu === 'tran') {
    if (truoc == null || !(truoc > 0)) return v >= 0 ? 'dat' : 'chuaDo';
    return v <= truoc * 1.2 ? 'dat' : v <= truoc * 1.5 ? 'canhBao' : 'xau';
  }
  const n = nguong(k, ngay);
  if (k.kieu === 'cao') return v >= n.muc ? 'dat' : v >= n.vang && n.vang < n.muc ? 'canhBao' : 'xau';
  return v <= n.muc ? 'dat' : v <= n.vang ? 'canhBao' : 'xau';
}
const DIEM_TT = { dat: 100, canhBao: 50, xau: 0 };
/* Điểm 0–100 của một nhóm chỉ số đã chấm; không chỉ số nào chấm được → null */
export function diem(dsTT) {
  const v = dsTT.filter(t => DIEM_TT[t] != null).map(t => DIEM_TT[t]);
  return v.length ? Math.round(v.reduce((a, b) => a + b, 0) / v.length) : null;
}
export function chamHet(gt, truoc, ngay) {
  const kpi = KPI.map(k => {
    const tt = cham(k, gt[k.ma], truoc ? truoc[k.ma] : null, ngay);
    return { ma: k.ma, khoi: k.khoi, gt: gt[k.ma] == null ? null : gt[k.ma], truoc: truoc && truoc[k.ma] != null ? truoc[k.ma] : null, tt, nguong: nguong(k, ngay) };
  });
  const khoi = KHOI.map(K => {
    const ds = kpi.filter(x => x.khoi === K.ma);
    return { ma: K.ma, diem: diem(ds.map(x => x.tt)), xau: ds.filter(x => x.tt === 'xau').length, canhBao: ds.filter(x => x.tt === 'canhBao').length, dat: ds.filter(x => x.tt === 'dat').length };
  });
  const dk = khoi.map(k => k.diem).filter(x => x != null);
  return { kpi, khoi, tong: dk.length ? Math.round(dk.reduce((a, b) => a + b, 0) / dk.length) : null };
}

/* ═══ GIẢI PHÁP — mã · chỉ số · vai triển khai · hạn (ngày) ═══
   Nội dung từng giải pháp ở src/data-toi-uu.js; máy chủ chỉ cần mã để
   kiểm, vai để phân bổ, hạn để đặt mốc. Thử nghiệm so hai bên. */
export const GIAI_PHAP = {
  'tv2-1': ['tv2', ['R11'], 7],  'tv2-2': ['tv2', ['R11', 'R03'], 14], 'tv2-3': ['tv2', ['R02'], 7],
  'tv3-1': ['tv3', ['R03', 'R04'], 3], 'tv3-2': ['tv3', ['R02'], 7], 'tv3-3': ['tv3', ['R05'], 7],
  'tv4-1': ['tv4', ['R11'], 3],  'tv4-2': ['tv4', ['R04'], 7],  'tv4-3': ['tv4', ['R02'], 14],
  'tv5-1': ['tv5', ['R11'], 14], 'tv5-2': ['tv5', ['R04', 'R11'], 21], 'tv5-3': ['tv5', ['R03'], 30], 'tv5-4': ['tv5', ['R11'], 14],
  'tv1-1': ['tv1', ['R11'], 30], 'tv1-2': ['tv1', ['R15'], 30], 'tv1-3': ['tv1', ['R03'], 30],
  'co1-1': ['co1', ['R05'], 7],  'co1-2': ['co1', ['R06', 'R07'], 14], 'co1-3': ['co1', ['R02'], 14],
  'co2-1': ['co2', ['R06', 'R07'], 2], 'co2-2': ['co2', ['R05'], 7], 'co2-3': ['co2', ['R02'], 14],
  'co3-1': ['co3', ['R06', 'R07'], 1], 'co3-2': ['co3', ['R05', 'R04'], 14], 'co3-3': ['co3', ['R04'], 30],
  'co4-1': ['co4', ['R06', 'R07'], 14], 'co4-2': ['co4', ['R04'], 21], 'co4-3': ['co4', ['R02'], 14], 'co4-4': ['co4', ['R03'], 21],
  'co5-1': ['co5', ['R06', 'R07'], 14], 'co5-2': ['co5', ['R04'], 14], 'co5-3': ['co5', ['R02'], 21],
  'co6-1': ['co6', ['R05'], 30], 'co6-2': ['co6', ['R06', 'R07'], 30],
  'co7-1': ['co7', ['R05'], 30], 'co7-2': ['co7', ['R04'], 30], 'co7-3': ['co7', ['R11'], 30],
  'kh1-1': ['kh1', ['R06', 'R07'], 7], 'kh1-2': ['kh1', ['R04'], 21], 'kh1-3': ['kh1', ['R02'], 21],
  'kh2-1': ['kh2', ['R04'], 21], 'kh2-2': ['kh2', ['R08'], 30], 'kh2-3': ['kh2', ['R02'], 21],
  'kh3-1': ['kh3', ['R04'], 14], 'kh3-2': ['kh3', ['R05'], 30], 'kh3-3': ['kh3', ['R03'], 30],
  'kh4-1': ['kh4', ['R04'], 14], 'kh4-2': ['kh4', ['R05'], 30], 'kh4-3': ['kh4', ['R12'], 14],
  'kh5-1': ['kh5', ['R03'], 7],  'kh5-2': ['kh5', ['R04'], 30], 'kh5-3': ['kh5', ['R11'], 30],
  'mk1-1': ['mk1', ['R03'], 30], 'mk1-2': ['mk1', ['R15'], 30], 'mk1-3': ['mk1', ['R12'], 14],
  'mk2-1': ['mk2', ['R03'], 14], 'mk2-2': ['mk2', ['R04'], 14],
  'mk3-1': ['mk3', ['R03'], 14], 'mk3-2': ['mk3', ['R02'], 14],
  'mk4-1': ['mk4', ['R12'], 14], 'mk4-2': ['mk4', ['R03'], 30],
  'mk5-1': ['mk5', ['R03'], 14], 'mk5-2': ['mk5', ['R12'], 14], 'mk5-3': ['mk5', ['R03'], 21],
  'mk6-1': ['mk6', ['R03'], 30], 'mk6-2': ['mk6', ['R05'], 30], 'mk6-3': ['mk6', ['R15'], 30],
  'tc1-1': ['tc1', ['R03'], 14], 'tc1-2': ['tc1', ['R11'], 30], 'tc1-3': ['tc1', ['R03'], 30],
  'tc2-1': ['tc2', ['R03'], 14], 'tc2-2': ['tc2', ['R02'], 30], 'tc2-3': ['tc2', ['R01'], 30],
  'tc3-1': ['tc3', ['R01', 'R03'], 7], 'tc3-2': ['tc3', ['R03'], 30],
  'tc4-1': ['tc4', ['R03'], 2],  'tc4-2': ['tc4', ['R02'], 7],
  'tc5-1': ['tc5', ['R11'], 3],  'tc5-2': ['tc5', ['R03'], 7],  'tc5-3': ['tc5', ['R02'], 14],
  'tc6-1': ['tc6', ['R03'], 7],  'tc6-2': ['tc6', ['R02'], 14],
  'tc7-1': ['tc7', ['R03'], 3],  'tc7-2': ['tc7', ['R01'], 14],
  'ns1-1': ['ns1', ['R03'], 7],  'ns1-2': ['ns1', ['R02'], 14], 'ns1-3': ['ns1', ['R03'], 14],
  'ns3-1': ['ns3', ['R04'], 7],  'ns3-2': ['ns3', ['R03'], 14],
  'ns4-1': ['ns4', ['R02'], 3],  'ns4-2': ['ns4', ['R01'], 7],  'ns4-3': ['ns4', ['R02'], 14],
  'ns5-1': ['ns5', ['R02'], 2],  'ns5-2': ['ns5', ['R02'], 14],
  'cn1-1': ['cn1', ['R02'], 7],  'cn1-2': ['cn1', ['R12'], 14], 'cn1-3': ['cn1', ['R02'], 14],
  'cn2-1': ['cn2', ['R02'], 3],  'cn2-2': ['cn2', ['R02'], 14],
  'cn3-1': ['cn3', ['R01', 'R02'], 1], 'cn3-2': ['cn3', ['R02'], 14],
  'cn4-1': ['cn4', ['R01', 'R02'], 3], 'cn4-2': ['cn4', ['R04'], 14],
  'cn5-1': ['cn5', ['R02'], 1],  'cn5-2': ['cn5', ['R02'], 14]
};

/* Phân bổ: trong các ứng viên đúng vai, chọn người ít việc tối ưu đang mở
   nhất; hoà thì người đăng nhập gần nhất; hoà nữa thì theo tên. */
export function chonNguoi(ungVien) {
  const ds = (ungVien || []).slice().sort((a, b) =>
    (a.dangMo - b.dangMo) || String(b.lanCuoi || '').localeCompare(String(a.lanCuoi || '')) || String(a.u).localeCompare(String(b.u)));
  return ds[0] || null;
}
