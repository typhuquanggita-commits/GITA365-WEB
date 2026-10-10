#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════
   GITA 365 — TUYỂN GÓI MẪU CÔNG KHAI (kho/mau.json)

   Chủ hệ chốt 10/10 phương án C: gói mẫu là một bộ NHỎ TUYỂN CHỌN, không
   phải bản sao nội dung có cấp phép.

   ══ VÌ SAO ══
   Ai mở trang cũng tải được kho/mau.json. Đo ngày 10/10: 197/219 kho trong
   đó nằm trong G.THUOC_CAP_PHEP — tức nội dung đã trả phí đang công khai,
   chỉ là chưa ai mở công cụ nhà phát triển ra đọc. "Lọc trên màn hình
   KHÔNG PHẢI bảo vệ dữ liệu" — luật đã cắn ba lần.

   ══ CÁCH TUYỂN: GIỮ HÌNH, BỎ RUỘT ══
   Cắt hẳn 197 kho thì bản xem thử thành một dãy tường cấp phép (mục 42
   đo đúng chỗ ấy). Nên mỗi kho có cấp phép giữ KHUNG — đủ tên, đủ mã, đủ
   số mục để màn dựng ra đúng hình — còn phần RUỘT (đoạn văn dài, danh sách
   dài) bị rút:
     · chuỗi dài hơn TRAN_CHU ký tự → cắt ở khoảng trắng + "…"
     · mảng lồng bên trong GIỮ ĐỦ số phần tử — số phần tử là KHUNG: màn tự
       soát "đúng bốn năng lực", "đủ năm tầng"; cắt còn hai thì màn in ra
       chữ LỆCH ở chế độ xem thử (đã xảy ra ở coach-5-tang lần chạy đầu)
     · mảng gốc của một kho: từ TRON_BO phần tử trở xuống là một BỘ trọn
       (mười bánh đà, mười hai chặng, năm tầng) — giữ đủ số, vì đếm thiếu
       một bánh đà là vẽ sai hình hệ; dài hơn thì giữ TRAN_GOC phần tử đầu
   Ruột là thứ khách trả tiền để có; khung là thứ người lạ cần thấy để biết
   có gì mà trả.

   ══ KHÔNG RÚT ══
   · 22 kho không nằm trong G.THUOC_CAP_PHEP — đó là nội dung công khai
     (GT_* · DV_* · KENH_* · TG_*), cửa trước đọc chúng.
   · TEST750 và TODAY — đã được tuyển tay từ trước và có phép đo riêng ở
     mục 41 · 42 (năm bài tầng một, ≤40 câu mở, việc hôm nay cho sáu cổng).
   · SG_DONGDAU — dòng in đầu, chữ to nhất của sổ tay gia đình: nó sinh ra
     để ai mở sách cũng thấy trước mọi thứ. Cắt nó còn nửa câu là làm hỏng
     đúng câu duy nhất được viết cho người lạ.

   ══ CHẠY LẠI ĐƯỢC ══
   Chạy trên chính đầu ra thì không đổi gì (chuỗi đã ngắn, mảng đã cắt) —
   nên lệnh này an toàn để chạy trước mỗi lượt phát hành. `--kiem` chỉ báo
   gói hiện tại đã tuyển chưa, không ghi.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
const fs = require('fs'), path = require('path');
const GOC = path.join(__dirname, '..');
const TEP = path.join(GOC, 'kho', 'mau.json');

const TRAN_CHU = 80, TRAN_GOC = 3, TRON_BO = 12;
const KHONG_RUT = ['TEST750', 'TODAY', 'SG_DONGDAU'];

function dsCapPhep() {
  const src = fs.readFileSync(path.join(GOC, 'src', 'kho-khoa.js'), 'utf8');
  const khoi = (src.match(/G\.THUOC_CAP_PHEP\s*=\s*\[([\s\S]*?)\];/) || [])[1];
  if (!khoi) throw new Error('không đọc được G.THUOC_CAP_PHEP ở src/kho-khoa.js');
  return new Set(khoi.match(/'([A-Z0-9_]+)'/g).map(s => s.slice(1, -1)));
}

function catChu(s) {
  if (s.length <= TRAN_CHU) return s;
  const dau = s.slice(0, TRAN_CHU - 6);
  const i = dau.lastIndexOf(' ');
  return (i > 30 ? dau.slice(0, i) : dau).replace(/[\s,.;:–-]+$/, '') + '…';
}

function rut(v, goc) {
  if (typeof v === 'string') return catChu(v);
  if (Array.isArray(v)) return (goc && v.length > TRON_BO ? v.slice(0, TRAN_GOC) : v).map(x => rut(x, false));
  if (v && typeof v === 'object') {
    const o = {};
    for (const k of Object.keys(v)) o[k] = rut(v[k], false);
    return o;
  }
  return v;
}

function tuyen(m, cap) {
  const ra = {};
  for (const k of Object.keys(m)) {
    if (k === 'MAU_RUT') continue;
    ra[k] = (cap.has(k) && KHONG_RUT.indexOf(k) < 0) ? rut(m[k], true) : m[k];
  }
  /* Gói tự khai mình là bản rút — người đọc tệp (và màn nào cần) biết đây
     không phải nội dung đầy đủ, không ai tưởng kho thật chỉ có ngần ấy. */
  ra.MAU_RUT = { la: 'Bản rút gọn công khai: giữ khung, bỏ ruột nội dung có cấp phép',
    tranChu: TRAN_CHU, tranGoc: TRAN_GOC, tronBo: TRON_BO, khongRut: KHONG_RUT };
  return ra;
}

const m = JSON.parse(fs.readFileSync(TEP, 'utf8'));
const cap = dsCapPhep();
const ra = tuyen(m, cap);
const truoc = JSON.stringify(m), sau = JSON.stringify(ra);
const kho = Object.keys(m).filter(k => k !== 'MAU_RUT');
const rutDuoc = kho.filter(k => cap.has(k) && KHONG_RUT.indexOf(k) < 0);

if (process.argv.includes('--kiem')) {
  const da = truoc === sau;
  console.log((da ? '✓' : '✗') + ' kho/mau.json ' + (da ? 'đã tuyển' : 'CHƯA tuyển — chạy: node tools/tuyen-mau.js') +
    ' · ' + kho.length + ' kho · ' + Math.round(truoc.length / 1024) + ' KB');
  process.exit(da ? 0 : 1);
}
fs.writeFileSync(TEP, JSON.stringify(ra));
console.log('kho/mau.json: ' + Math.round(truoc.length / 1024) + ' KB → ' + Math.round(sau.length / 1024) + ' KB · ' +
  rutDuoc.length + ' kho có cấp phép được rút · ' + (kho.length - rutDuoc.length) + ' kho giữ nguyên');
