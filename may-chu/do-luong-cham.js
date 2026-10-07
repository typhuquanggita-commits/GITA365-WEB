/* ═══════════════════════════════════════════════════════════════
   GITA 365 — CÔNG THỨC ĐO LƯỜNG KHÁCH HÀNG (thuần, không chạm D1)

   Một tệp công thức dùng cho cả máy chủ (do-luong-kh.js) và bản sao ở
   app (src/data-do-luong.js) — tools/thu-do-luong.mjs so hai bên từng
   con số. Đầu vào là SỐ ĐO THÁNG của một nhà (gom từ mọi sổ), đầu ra:

     ganKet   Gắn kết      — có mặt, học, tick, báo cáo, việc được duyệt
     tienBo   Tiến bộ      — bài hoàn thành, điểm, việc đạt, đều đặn, lên tầng
     haiLong  Hài lòng     — NPS, CSAT, cảm xúc, không hoàn tiền
     giaTri   Giá trị      — đã thanh toán, tầng, không nợ
     ruiRo    Rủi ro rời   — im lặng, tụt so tháng trước, nợ, buồn, đèn đỏ
     tiemNang Tiềm năng    — nơi đầu tư chăm sóc sinh lời nhất
   + tầng chăm sóc A–E và việc nên làm.

   Phần nào KHÔNG có dữ liệu thì để null và chia lại trọng số — không đoán.
   Mọi ngưỡng là ngưỡng vận hành ban đầu; chỉnh MUC / TRONG_SO ở đây.
   ═══════════════════════════════════════════════════════════════ */

export const PHIEN_BAN_DO = 'DL-2026.10-a';

/* Mục tiêu một tháng (đạt = 100% phần ấy) */
export const MUC = { ngayHoatDong: 20, phutHoc: 600, ngayTick: 20, baoCao: 12, viecDuyet: 10, hoanThanh: 12 };

/* Màn → nhóm trải nghiệm (thời gian dùng app chia theo nhóm này) */
export const NHOM_MAN = {
  hoc:      ['khoa-dao-tao', 'sat-hach', 'bo-test', 'lo-trinh', 'chu-ky', 'banh-da', 'thu-vien', 'kho-khach', 'kho-tong', 'chuyen', 'tieu-thuyet', 'thi-viet', 'bai-hoc', 'nhiem-vu', 'tro-ly'],
  thucHanh: ['hom-nay', 'minh-chung', 'thoi-quen', 'ban-do', 'ban-do-ca-nhan', 'vong-nhac', 'nhat-ky', 'tam-nhin'],
  baoCao:   ['bang-so', 'tien-bo', 'kpi-toi', 'kpi-100', 'ho-so-thang', 'vi-credit', 'dk-cua-toi', 'chan-dung-nha'],
  ketNoi:   ['ket-noi', 'cong-dong', 'su-kien', 'vinh-danh', 'phan-thuong', 'dai-su', 'tin-cong-dong']
};
export function nhomCuaMan(man) {
  for (const k of Object.keys(NHOM_MAN)) if (NHOM_MAN[k].indexOf(man) >= 0) return k;
  return 'khac';
}

export const TANG_CS = {
  A: { ten: 'Kim cương · đầu tư sâu', mau: '#5140B4',
       viec: ['Senior Coach kèm riêng, chạm 2 lần/tuần', 'Mời lên tầng tiếp theo / chương trình VIP', 'Mời làm Đại sứ, kể câu chuyện', 'Quà credit thưởng mục tiêu'] },
  B: { ten: 'Vàng · nuôi lên tầng', mau: '#B4720F',
       viec: ['Coach chạm mỗi tuần, đặt mốc lên tầng', 'Gợi ý chương trình chuyên đề hợp nhu cầu', 'Khen quá trình, ghi nhận công khai'] },
  C: { ten: 'Bạc · giữ nhịp chuẩn', mau: '#0B6675',
       viec: ['Nhịp chạm chuẩn theo chương trình', 'Nhắc tick việc hôm nay, báo cáo tuần', 'Nội dung đúng tầng, đúng nút thắt'] },
  D: { ten: 'Cần cứu · rủi ro cao', mau: '#BE0E16',
       viec: ['Gọi trong 24 giờ, nghe trước', 'Mở Can thiệp nhanh 14 ngày', 'Quản lý chuyên môn theo dõi tới khi về vàng'] },
  E: { ten: 'Ngủ đông · tái kích hoạt', mau: '#73849F',
       viec: ['Tin nhắn tái kích hoạt chi phí thấp', 'Mời một sự kiện / một việc nhỏ 5 phút', 'Không dồn giờ Coach cho tới khi nhà quay lại'] }
};

const kep = (x, a, b) => Math.max(a, Math.min(b, x));
const ty = (x, m) => (x == null ? null : kep(Number(x) / m, 0, 1));
function trungBinh(phan) {          /* [[giá trị 0..1 | null, trọng số]] → 0..100 | null */
  let s = 0, w = 0;
  phan.forEach(([v, t]) => { if (v != null && !Number.isNaN(v)) { s += v * t; w += t; } });
  return w ? Math.round(100 * s / w) : null;
}

/* d: số đo tháng của một nhà (xem gomThang ở do-luong-kh.js để biết từng ô) */
export function chamDiem(d, truoc) {
  /* Tháng đang chạy: mục tiêu co theo số ngày đã qua (sàn 10 ngày) — ngày 7
     của tháng không bị chấm như đã hết tháng. Tháng đủ ngày: hệ số 1. */
  const he = d.soNgayThang ? kep(Math.max(d.soNgayThang, 10) / 30, 0, 1) : 1;
  const MUC_T = {}; Object.keys(MUC).forEach(k => { MUC_T[k] = MUC[k] * he; });
  const phutHoc = Math.max(Number(d.phutHocApp) || 0, Number(d.phutHocBaoCao) || 0);
  const ganKet = trungBinh([
    [ty(d.ngayHoatDong, MUC_T.ngayHoatDong), 30], [ty(phutHoc, MUC_T.phutHoc), 25],
    [ty(d.ngayTick, MUC_T.ngayTick), 25], [ty(d.soBaoCao, MUC_T.baoCao), 10], [ty(d.viecDuyet, MUC_T.viecDuyet), 10]
  ]);
  const coHoc = d.hoanThanh != null || d.diemTB != null;
  const tienBo = trungBinh([
    [ty(d.hoanThanh, MUC_T.hoanThanh), 30], [d.diemTB == null ? null : kep(d.diemTB / 100, 0, 1), 20],
    [ty(d.viecDuyet, MUC_T.viecDuyet), 25], [d.soNgayThang ? kep((d.ngayTick || 0) / d.soNgayThang, 0, 1) : null, 15],
    [d.lenTang ? 1 : (coHoc ? 0 : null), 10]
  ]);
  const haiLong = trungBinh([
    [d.nps == null ? null : kep(d.nps / 10, 0, 1), 40], [d.csat == null ? null : kep((d.csat - 1) / 4, 0, 1), 30],
    [d.camXuc == null ? null : kep((d.camXuc - 1) / 4, 0, 1), 20],
    [(d.nps != null || d.csat != null || d.camXuc != null) ? (d.daHoan ? 0 : 1) : null, 10]
  ]);
  const giaTri = trungBinh([
    [kep((Number(d.ltv) || 0) / 50000000, 0, 1), 50], [kep((Number(d.tang) || 1) / 5, 0, 1), 30], [d.no > 0 ? 0 : 1, 20]
  ]);
  const imLang = d.imLang == null ? null : kep((d.imLang - 3) / 11, 0, 1);       /* 3 ngày → 0 · 14 ngày → 1 */
  let tut = null;
  if (truoc && truoc.ganKet != null && ganKet != null && truoc.ganKet > 0) tut = kep((truoc.ganKet - ganKet) / truoc.ganKet / 0.4, 0, 1);
  const ruiRo = trungBinh([
    [imLang, 35], [tut, 25], [d.no > 0 ? 1 : 0, 20],
    [haiLong == null ? null : (haiLong < 50 ? 1 : 0), 10], [d.band === 'DO' ? 1 : 0, 10]
  ]) || 0;
  const gioiThieu = kep((Number(d.gioiThieu) || 0) / 2, 0, 1) * 100;
  const goc = 0.30 * (ganKet || 0) + 0.25 * (tienBo == null ? (ganKet || 0) : tienBo) +
    0.20 * (haiLong == null ? 60 : haiLong) + 0.15 * (giaTri || 0) + 0.10 * gioiThieu;
  const tiemNang = Math.round(kep(goc - 0.25 * ruiRo, 0, 100));
  return { ganKet, tienBo, haiLong, giaTri, ruiRo, tiemNang, phutHoc };
}

export function xepTang(diem, d) {
  if (!(d.ngayHoatDong > 0) && !(d.moi)) return 'E';
  if (diem.ruiRo >= 60) return 'D';
  if (diem.tiemNang >= 75 && diem.ruiRo < 40) return 'A';
  if (diem.tiemNang >= 60 && diem.ruiRo < 50) return 'B';
  return 'C';
}

/* Lời giải thích ngắn cho Coach: vì sao nhà ở tầng này */
export function lyDo(diem, d) {
  const r = [];
  if (d.imLang != null && d.imLang >= 7) r.push('Im lặng ' + d.imLang + ' ngày');
  if (d.no > 0) r.push('Còn nợ học phí');
  if (diem.ganKet != null && diem.ganKet >= 75) r.push('Gắn kết cao');
  if (diem.tienBo != null && diem.tienBo >= 70) r.push('Tiến bộ rõ');
  if (diem.haiLong != null && diem.haiLong >= 80) r.push('Rất hài lòng');
  if (diem.haiLong != null && diem.haiLong < 50) r.push('Chưa hài lòng');
  if (d.lenTang) r.push('Vừa lên tầng');
  if (d.gioiThieu > 0) r.push('Đã giới thiệu ' + d.gioiThieu + ' nhà');
  if (!(d.ngayHoatDong > 0)) r.push('Không hoạt động trong tháng');
  return r.slice(0, 4);
}
