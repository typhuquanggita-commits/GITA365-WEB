#!/usr/bin/env node
/* GITA 365 — DỰNG KHUNG DỮ LIỆU CRM · TÀI CHÍNH (V50·168)

   Đọc lược đồ thật may-chu/csdl.sql, rút cấu trúc các bảng CRM và Tài chính
   (cột · kiểu · ràng buộc · chú thích trong SQL) ra src/data-khung.js để màn
   "Khung dữ liệu & ma trận quyền" hiện KHUNG BẢNG cho chủ hệ soát cấu trúc.
   Chỉ cấu trúc — không một dòng dữ liệu nào.

   Dùng:  node tools/dung-khung-du-lieu.js          → ghi src/data-khung.js
          node tools/dung-khung-du-lieu.js --kiem   → CI: báo lệch nếu lược đồ
                                                      đổi mà khung chưa dựng lại */
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const SQL = fs.readFileSync(path.join(ROOT, 'may-chu/csdl.sql'), 'utf8');
const RA = path.join(ROOT, 'src/data-khung.js');

/* Bảng của từng khối + ai đọc / ai ghi (rút từ cửa máy chủ, soát 07/10/2026). */
const NHOM = {
  crm: [
    ['hoSoKhach', 'Tệp khách hàng — gốc của mọi khối', 'Coach / Tư vấn: nhà mình phụ trách · R01–R04: toàn hệ', 'Giao người phụ trách: R01–R04 · Coach / Tư vấn sửa tệp nhà mình · đổi tầng: R01–R03 (cổng KPI + thanh toán)'],
    ['crmKhach', 'Trạng thái CRM của một nhà: giai đoạn, người phụ trách, hẹn tiếp', 'Theo quyền CRM Super Admin cấp; dưới mức quản lý chỉ khách mình', 'Mức "sửa" trở lên; giao người phụ trách cần mức "quản lý"'],
    ['crmCoHoi', 'Cơ hội bán: giá trị, giai đoạn, người phụ trách', 'Theo quyền CRM; lọc theo người phụ trách', 'Mức "sửa" trở lên'],
    ['quyenCRM', 'Sổ cấp quyền CRM theo từng người (xem · sửa · quản lý, có hạn)', 'R01–R02', 'CHỈ Super Admin cấp / thu hồi'],
    ['soCham', 'Sổ chạm — tiến trình chăm sóc: nhắn · gọi · WOW · buổi coach', 'CRM (dòng thời gian, chạm cuối, KPI) · Coach (đèn xanh / vàng / đỏ)', 'Coach / Tư vấn: nhà mình phụ trách · R01–R04: mọi nhà · tự ghi khi Coach ghi buổi'],
    ['suKienKH', 'Sự kiện của khách (sổ đo, hoạt động) — chống trùng bằng khoá duy nhất', 'Đo lường toàn diện khách hàng · Trung tâm đo lường', 'Gia đình gửi từ màn của mình'],
    ['danhGiaKH', 'NPS · CSAT theo tháng của từng người trong nhà', 'Đo lường toàn diện khách hàng · Trung tâm đo lường (kh3, kh4)', 'Gia đình chấm'],
    ['hoSoThang', 'Báo cáo tháng đã chốt của một nhà', 'Gia đình (nhà mình) · đội ngũ theo quyền đo lường', 'Chốt theo tháng ở máy chủ'],
  ],
  taiChinh: [
    ['kyThu', 'Kỳ thu học phí — dựng tự động khi đổi tầng', 'Công nợ: gia đình xem nhà mình · ban tài chính / R01–R03 mọi nhà · nhân sự khác nhà mình phụ trách', 'Máy dựng khi đổi tầng'],
    ['phieuThu', 'Phiếu thu tiền', 'R01–R03 · ban tài chính', 'Ghi: Tư vấn trở lên · duyệt: R01–R03 hoặc kế toán thu · huỷ: R01–R03'],
    ['mienGiam', 'Miễn giảm học phí', 'R01–R03', 'Đề xuất: Coach trở lên · duyệt: R01–R03'],
    ['hoanTien', 'Hoàn tiền', 'R01–R03', 'Đề xuất: Coach trở lên · duyệt: R01–R03'],
    ['hoaHongTra', 'Hoa hồng đã trả cho đại sứ', 'R01–R03', 'Trả: R01–R03'],
    ['chiPhi', 'Đề xuất chi và duyệt chi theo mốc tiền', 'R01–R03 · ban tài chính', 'Ghi: Trưởng nhóm Coach trở lên · duyệt theo mốc C0–C6 (kế toán chi / kế toán trưởng) · huỷ: R01–R03'],
    ['quyenTaiChinh', 'Vị trí ban tài chính theo từng người (kế toán thu / chi / trưởng · quản lý phòng)', 'R01–R03', 'CHỈ Super Admin cấp / thu hồi'],
    ['giaoDichNganHang', 'Giao dịch ngân hàng để đối chiếu thu', 'R01–R03 · kế toán thu', 'Nhập tay / đối chiếu: R01–R03 hoặc kế toán thu · cửa ngân hàng dùng khoá riêng'],
    ['ketToanButToan', 'Bút toán kế toán', 'R01–R03', 'R01–R03'],
    ['ketToanHoaDon', 'Hoá đơn', 'R01–R03', 'R01–R03'],
    ['ketToanToKhai', 'Tờ khai thuế', 'R01–R03', 'R01–R03'],
    ['heSoLuong', 'Hệ số lương', 'R01–R03', 'CHỈ Super Admin'],
    ['bangLuong', 'Bảng lương', 'Mỗi người xem dòng của mình · R01–R03 / ban tài chính xem đủ', 'Chốt: R01–R03 / ban tài chính'],
    ['nhacThu', 'Lịch sử nhắc thu', 'Tư vấn trở lên', 'Tư vấn trở lên'],
    ['soCredit', 'Sổ credit (nạp · tiêu · thưởng · hoàn) — chống trùng bằng khoá duy nhất', 'Ví của nhà · Credit (tài chính) · Trung tâm đo lường', 'Tiêu: Coach nhà mình / nhà tự phục vụ · nạp từ phiếu thu: R01–R03 hoặc kế toán thu · điều chỉnh: CHỈ Super Admin'],
    ['viCredit', 'Ví credit của một nhà: cấp, nhóm', 'Nhà mình · đội ngũ theo quyền', 'Máy chủ cập nhật theo sổ credit'],
    ['bangGia', 'Bảng giá đang áp dụng', 'R01–R03', 'Đổi giá: CHỈ Super Admin'],
    ['taiKhoanNhan', 'Tài khoản ngân hàng / QR nhận tiền', 'R01–R04 · phụ huynh, học viên (để chuyển khoản)', 'R01–R02'],
  ]
};

function boNgoac(s) { let d = 0, o = []; let cu = ''; for (const c of s) { if (c === '(') d++; if (c === ')') d--; if (c === ',' && d === 0) { o.push(cu); cu = ''; } else cu += c; } if (cu.trim()) o.push(cu); return o; }
function rutBang(ten) {
  const re = new RegExp('CREATE TABLE IF NOT EXISTS ' + ten + '\\s*\\(');
  const m = re.exec(SQL); if (!m) throw new Error('Không thấy bảng ' + ten + ' trong csdl.sql');
  let i = m.index + m[0].length, d = 1, j = i;
  while (j < SQL.length && d > 0) { if (SQL[j] === '(') d++; else if (SQL[j] === ')') d--; j++; }
  const than = SQL.slice(i, j - 1);
  const cot = [];
  /* gom từng dòng, giữ chú thích -- của dòng */
  const dong = than.split('\n');
  let goc = '';
  const chuThich = {};
  for (const l of dong) {
    const k = l.indexOf('--');
    const ma = k >= 0 ? l.slice(0, k) : l, ct = k >= 0 ? l.slice(k + 2).trim() : '';
    goc += ma + '\n';
    const tenCot = (ma.trim().match(/^([A-Za-z_][A-Za-z0-9_]*)\s/) || [])[1];
    if (tenCot && ct) chuThich[tenCot] = ct;
  }
  for (let p of boNgoac(goc)) {
    p = p.replace(/\s+/g, ' ').trim(); if (!p) continue;
    if (/^(PRIMARY KEY|UNIQUE|FOREIGN KEY|CHECK|CONSTRAINT)\b/i.test(p)) { cot.push(['(ràng buộc)', '', p, '']); continue; }
    const mm = p.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*([A-Za-z]*)\s*(.*)$/);
    if (!mm) continue;
    cot.push([mm[1], mm[2] || '', mm[3] || '', chuThich[mm[1]] || '']);
  }
  return cot;
}

const ra = {};
for (const k of Object.keys(NHOM)) ra[k] = NHOM[k].map(([ten, mo, doc, ghi]) => ({ ten, mo, doc, ghi, cot: rutBang(ten) }));
const noiDung = '/* TỆP DỰNG RA — đừng sửa tay. Nguồn: may-chu/csdl.sql + tools/dung-khung-du-lieu.js\n' +
  '   Khung bảng CRM · Tài chính cho màn "Khung dữ liệu & ma trận quyền" (chỉ cấu trúc, không dữ liệu). */\n' +
  "'use strict';\nvar G = window.G || {}; window.G = G;\nG.KHUNG_DL = " + JSON.stringify(ra, null, 1) + ';\n';
if (process.argv.includes('--kiem')) {
  const cu = fs.existsSync(RA) ? fs.readFileSync(RA, 'utf8') : '';
  if (cu !== noiDung) { console.error('✗ src/data-khung.js lệch lược đồ csdl.sql — chạy: node tools/dung-khung-du-lieu.js'); process.exit(1); }
  console.log('✓ Khung dữ liệu khớp lược đồ: ' + ra.crm.length + ' bảng CRM · ' + ra.taiChinh.length + ' bảng tài chính');
} else {
  fs.writeFileSync(RA, noiDung);
  console.log('✓ Đã dựng src/data-khung.js: ' + ra.crm.length + ' bảng CRM · ' + ra.taiChinh.length + ' bảng tài chính');
}
