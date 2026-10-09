#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════
   GITA 365 — MỘT TRĂM NHÀ ĐI THỬ HÀNH TRÌNH

   Chủ hệ hỏi: một trăm khách vào thử thì bao nhiêu đi hết tầng nào,
   ai đi được tới tầng ba bốn năm, họ hứng thú vì gì và bỏ vì gì, và
   năng lực Coach · Tư vấn · tài liệu · quy trình hiện đáp ứng bao nhiêu
   phần trăm.

   ═══ LUẬT CỦA CHÍNH BỘ ĐO NÀY ═══

   HỆ CHƯA RA MẮT. Không có một nhà thật nào đã đi. Nên mọi con số ở
   đây rơi vào đúng hai ngăn, và bộ đo KHÔNG được trộn chúng:

     PHẦN A · ĐO ĐƯỢC   đọc thẳng từ kho. Đổi kho thì số đổi theo.
                        Đây là số THẬT về cái hệ đang có.
     PHẦN B · MÔ HÌNH   giả định. Mỗi giả định phải khai NGUỒN, và chỗ
                        nào không có nguồn thì ghi rõ "tôi đặt ra".

   Trộn hai ngăn ấy là đúng cái mà cả kho này dựng lên để tránh: một
   con số mô hình mặc áo con số đo được thì tới ngày có người hỏi nó
   đếm từ đâu, cả những con số THẬT đứng cạnh cũng mất giá theo.

   Nên phần B KHÔNG đưa ra một con số duy nhất. Nó quét một dải, vì
   một dải nói đúng thứ đang biết: hình dạng thì chắc, điểm thì chưa.

   Chạy:  node tools/mo-phong-100-nha.js
   ═══════════════════════════════════════════════════════════════ */
'use strict';
const fs = require('fs');
const path = require('path');

/* ─── Nạp kho gốc ─── */
global.window = { G: {} };
const GOC = path.join(__dirname, '..', 'kho-goc');
fs.readdirSync(GOC).filter(f => f.endsWith('.js')).sort().forEach(f => {
  try { require(path.join(GOC, f)); } catch (e) { /* tệp lỗi thì bỏ qua, phần A sẽ hụt */ }
});
const G = global.window.G;

const MA_TANG = ['T1', 'T2', 'T3', 'T4', 'T5'];
const line = (c = '─') => c.repeat(74);
const pc = (a, b) => b ? Math.round(a / b * 100) : 0;

function soNgay(t) {
  const x = (G.HP_TANG || []).filter(y => y.tang === t)[0];
  const m = String((x || {}).ten || '').match(/\d+/);
  return m ? Number(m[0]) : null;
}

/* ═══════════════════════════════════════════════════════════════
   PHẦN A — ĐO ĐƯỢC
   ═══════════════════════════════════════════════════════════════ */
function phanA() {
  console.log('\n' + line('═'));
  console.log('PHẦN A · ĐO ĐƯỢC — đọc thẳng từ kho, đổi kho thì số đổi theo');
  console.log(line('═'));

  /* A1 · Nội dung và việc của từng tầng */
  console.log('\nA1 · MỖI TẦNG CÓ BAO NHIÊU VIỆC VÀ BAO NHIÊU NGÀY');
  const viecTheoTang = {};
  (G.BD_LON || []).forEach(b => {
    viecTheoTang[b.tang] = (viecTheoTang[b.tang] || 0) + (b.nho || []).length;
  });
  const bdTheoTang = {};
  (G.BD_LON || []).forEach(b => { bdTheoTang[b.tang] = (bdTheoTang[b.tang] || 0) + 1; });
  MA_TANG.forEach(t => {
    const n = soNgay(t), v = viecTheoTang[t] || 0, bd = bdTheoTang[t] || 0;
    const moiViecMayNgay = v ? (n / v).toFixed(1) : '—';
    console.log(`  ${t}  ${String(n).padStart(3)} ngày · ${bd} bánh đà · ${String(v).padStart(3)} việc nhỏ` +
      `  →  mỗi việc phải đỡ ${moiViecMayNgay} ngày`);
  });
  const tongViec = Object.values(viecTheoTang).reduce((a, b) => a + b, 0);
  console.log(`  Cộng: ${tongViec} việc nhỏ cho ${MA_TANG.reduce((a, t) => a + (soNgay(t) || 0), 0)} ngày.`);
  console.log('  → T4 và T5 mỗi tầng 365 ngày mà chỉ 20 việc: ĐÂY LÀ CHỖ MỎNG NHẤT của kho việc.');

  /* A2 · Năng lực dữ liệu của Coach — kho đã tự khai có/chưa */
  console.log('\nA2 · NĂNG LỰC DỮ LIỆU CỦA COACH — kho tự khai, không phải tôi chấm');
  const ds = G.CS_DULIEU || [];
  const co = ds.filter(x => x.co === true);
  console.log(`  ${co.length}/${ds.length} ô có kho chạy thật = ${pc(co.length, ds.length)}%`);
  ds.forEach(x => console.log(`    ${x.co === true ? '✓' : '○'} ${x.ten}` +
    (x.co === true ? '' : `\n        thiếu: ${String(x.thieu || '').slice(0, 96)}`)));

  /* A3 · Quy trình tư vấn */
  console.log('\nA3 · QUY TRÌNH TƯ VẤN');
  console.log(`  ${(G.TV_PHANKHUC || []).length} phân khúc khách · ` +
    `${(G.TV_SUP || []).length} chỗ buổi tư vấn có thể sụp · ` +
    `${(G.HP_KICHBAN || []).length} kịch bản báo giá`);
  const pkCoCauMo = (G.TV_PHANKHUC || []).filter(x => x.cauMo).length;
  console.log(`  ${pkCoCauMo}/${(G.TV_PHANKHUC || []).length} phân khúc có sẵn câu mở = ` +
    `${pc(pkCoCauMo, (G.TV_PHANKHUC || []).length)}%`);

  /* A4 · Chỗ khó đã khai — đây là bản đồ bỏ cuộc, kho viết sẵn */
  console.log('\nA4 · CHỖ NHÀ MÌNH BỎ CUỘC — kho đã khai sẵn, không phải tôi đoán');
  MA_TANG.forEach(t => {
    const h = (G.HT_TANG || []).filter(x => x.ma === t)[0];
    if (h) console.log(`  ${t} · ${h.khoNhat}`);
  });
  console.log('  Và mỗi bánh đà khai riêng chỗ nó hỏng:');
  (G.BD_LON || []).forEach(b =>
    console.log(`    ${b.ma} (${b.tang}) ${String(b.dau).split('.')[0]}.`));

  /* A5 · Cổng nghiệm thu */
  console.log('\nA5 · CỔNG NGHIỆM THU MỖI TẦNG');
  MA_TANG.forEach(t => {
    const hp = (G.HP_TANG || []).filter(x => x.tang === t)[0] || {};
    const cong = (hp.gom || []).filter(x => /nghiệm thu|cổng/i.test(x));
    console.log(`  ${t} · ${cong.length ? cong.join(' | ') : '— chưa khai cổng nào'}`);
  });

  /* A6 · Chỗ hệ TỰ KHAI là chưa có */
  console.log('\nA6 · HỆ TỰ KHAI CHỖ CHƯA CÓ — cộng lại từ mọi kho CHOCHU');
  let choChu = 0;
  Object.keys(G).filter(k => /CHOCHU$/.test(k)).forEach(k => {
    const v = G[k];
    const n = Array.isArray(v) ? v.length : (v && typeof v === 'object' ? 1 : 0);
    if (n) { choChu += n; console.log(`    ${k}: ${n}`); }
  });
  const nguonChua = (G.TIN_NGUON || []).filter(x => x.co !== true).length;
  console.log(`  Cộng ${choChu} chỗ chờ chủ hệ · ${nguonChua} sổ đếm cộng đồng chưa có · ` +
    `${(G.HP_TANG || []).filter(x => x.gia == null).length}/5 tầng chưa có giá`);
  return { tongViec, viecTheoTang, coachCo: co.length, coachTong: ds.length };
}

/* ═══════════════════════════════════════════════════════════════
   PHẦN B — MÔ HÌNH
   ═══════════════════════════════════════════════════════════════ */
function phanB(A) {
  console.log('\n' + line('═'));
  console.log('PHẦN B · MÔ HÌNH — giả định, KHÔNG phải đo. Mỗi dòng khai nguồn.');
  console.log(line('═'));

  console.log('\nB1 · MỘT TRĂM NHÀ VÀO — TỆP CHIA THẾ NÀO');
  const cd = G.CHANDUNG_KH || [];
  cd.forEach(x => console.log(`  ${x.ma} ${x.ten.padEnd(24)} ${String(x.tyLe).padStart(12)}`));
  console.log('  ⚠ NGUỒN: CHANDUNG_KH.tyLe — kho khai sẵn, nhưng KHÔNG dòng nào nói nó đếm');
  console.log('    từ đâu, y như CUHICH.thamgia. Hệ chưa ra mắt nên nó chưa thể là số đếm.');
  console.log('    Cả phần B đứng trên con số này, nên sai ở đây thì sai hết phần B.');

  console.log('\nB2 · GIẢ ĐỊNH VỀ BỎ CUỘC — và vì sao đặt như thế');
  console.log('  Kho khai chỗ khó của từng tầng (A4). Mô hình giả định: TỚI chỗ khó ấy thì');
  console.log('  một tỉ lệ nhà dừng. Tỉ lệ ấy TÔI ĐẶT RA — không kho nào khai nó.');
  console.log('  Nên không đưa một con số, mà quét ba kịch bản để thấy HÌNH DẠNG:');

  /* Trọng số khó của từng tầng — suy từ ĐỘ DÀI và SỐ CHỖ KHÓ đã khai,
     hai thứ đều đọc được từ kho. Không gõ tay một bảng khó riêng. */
  const kho = {};
  MA_TANG.forEach(t => {
    const n = soNgay(t) || 1;
    const h = (G.HT_TANG || []).filter(x => x.ma === t)[0] || {};
    /* Số CHỖ khó khai trong câu: "chuỗi thứ hai và thứ ba" là hai chỗ. */
    const soCho = (String(h.khoNhat || '').match(/thứ\s+\S+/g) || ['x']).length;
    /* Số việc phải đỡ mỗi ngày — tầng nào ít việc mà dài ngày thì nhà
       mình hết thứ để làm trước khi hết ngày. */
    const v = A.viecTheoTang[t] || 1;
    kho[t] = { ngay: n, soCho, viec: v, ngayMoiViec: n / v };
  });

  const kichBan = [
    { ten: 'Rộng lượng', boChoKho: 0.20, nhan: 'chỉ 1 trong 5 nhà dừng ở chỗ khó' },
    { ten: 'Giữa',      boChoKho: 0.40, nhan: '2 trong 5' },
    { ten: 'Khắt khe',  boChoKho: 0.60, nhan: '3 trong 5 — mức thường thấy ở app thói quen' }
  ];
  console.log('');
  kichBan.forEach(kb => {
    let con = 100;
    const hang = [];
    MA_TANG.forEach(t => {
      /* Mỗi tầng: rơi ở chỗ khó (số chỗ khó nhân tỉ lệ bỏ), CỘNG phần
         rơi vì tầng dài mà ít việc — cả hai hệ số đều lấy từ kho. */
      const k = kho[t];
      const roiChoKho = 1 - Math.pow(1 - kb.boChoKho, k.soCho);
      /* Mỗi ngày một việc; tầng nào một việc phải đỡ hơn 3 ngày thì
         phần thừa tính thêm rủi ro cạn nội dung. */
      const canNoiDung = Math.max(0, Math.min(0.5, (k.ngayMoiViec - 3) / 40));
      const giu = (1 - roiChoKho) * (1 - canNoiDung);
      con = con * giu;
      hang.push(`${t} ${String(Math.round(con)).padStart(3)}`);
    });
    console.log(`  ${kb.ten.padEnd(10)} (${kb.nhan})`);
    console.log(`    còn lại sau mỗi tầng:  ${hang.join('   ')}   (trên 100 nhà vào)`);
  });
  console.log('\n  ĐỌC BẢNG NÀY THẾ NÀO: con số cuối cùng KHÔNG đáng tin — nó là hàm của');
  console.log('  một tham số tôi đặt ra. Cái đáng tin là HÌNH DẠNG: cả ba kịch bản đều');
  console.log('  gãy mạnh nhất ở cùng một chỗ, và chỗ ấy đọc được từ kho chứ không từ mô hình.');

  /* Chỗ gãy mạnh nhất — tính thật từ hệ số */
  console.log('\nB3 · CHỖ GÃY MẠNH NHẤT (tính từ hệ số của kho, không phụ thuộc kịch bản)');
  const xep = MA_TANG.map(t => {
    const k = kho[t];
    return { t, soCho: k.soCho, ngayMoiViec: k.ngayMoiViec,
      diem: k.soCho * 10 + Math.max(0, k.ngayMoiViec - 3) };
  }).sort((a, b) => b.diem - a.diem);
  xep.forEach(x => console.log(`  ${x.t} · ${x.soCho} chỗ khó khai sẵn · ` +
    `mỗi việc đỡ ${x.ngayMoiViec.toFixed(1)} ngày`));
  return { xep };
}

/* ═══════════════════════════════════════════════════════════════
   PHẦN C — AI ĐI ĐƯỢC TỚI ĐÂU
   ═══════════════════════════════════════════════════════════════ */
function phanC() {
  console.log('\n' + line('═'));
  console.log('PHẦN C · CHÂN DUNG ĐI ĐƯỢC TỚI ĐÂU — suy từ kho, có ghi lối suy');
  console.log(line('═'));
  console.log('\nLối suy: đối chiếu ĐAU của từng chân dung (CHANDUNG_KH.dau · TV_PHANKHUC)');
  console.log('với THỬ THÁCH của từng tầng (HT_TANG.thuThach). Tầng nào đòi thứ mà cái đau');
  console.log('của nhà ấy KHÔNG tự đẩy họ tới, thì đó là chỗ họ dừng.\n');
  MA_TANG.forEach(t => {
    const h = (G.HT_TANG || []).filter(x => x.ma === t)[0] || {};
    console.log(`  ${t} đòi: ${h.thuThach}`);
    console.log(`     đổi được: ${h.doiGiKhiXong}`);
  });
  console.log('\n  Sáu chân dung, và cái đau của họ:');
  (G.CHANDUNG_KH || []).forEach(x =>
    console.log(`    ${x.ma} ${x.ten.padEnd(24)} ${String(x.dau || '').slice(0, 78)}`));
}

/* ═══════════════════════════════════════════════════════════════
   PHẦN D — PHẢI ĐO GÌ TRƯỚC KHI RA MẮT
   ═══════════════════════════════════════════════════════════════ */
function phanD() {
  console.log('\n' + line('═'));
  console.log('PHẦN D · NHỮNG CON SỐ CẢ MÔ HÌNH ĐANG ĐỨNG LÊN, MÀ CHƯA AI ĐO');
  console.log(line('═'));
  const ds = [
    ['Tỉ lệ tệp đến của 6 chân dung', 'CHANDUNG_KH.tyLe — khai sẵn, không có nguồn',
      'Đếm từ sổ tiếp nhận của 50 buổi tư vấn đầu tiên.'],
    ['Tỉ lệ dừng ở chỗ khó của từng tầng', 'chưa kho nào khai — mô hình tự đặt',
      'Bàn cờ đã ghi ngày cuối cùng mỗi nhà đặt quân. Đếm ở đó.'],
    ['Giá gói từng tầng', 'HP_TANG.gia = null cả 5 tầng',
      'Không có giá thì không tính được hoa hồng, không tính được chi phí giữ một nhà.'],
    ['Số nhà một Coach giữ nổi', 'DD_CAP khai trần 5·10·3 — trần thì có, TẢI THẬT thì chưa',
      'CS_DULIEU đã khai thiếu đúng ô này: "Bảng tải của cả đội kèm".'],
    ['Thời lượng thật mỗi ngày', 'TG_MUC đặt mục 30–45 phút; chưa nhà nào đi để đối chiếu',
      'Đồng hồ đã chạy sẵn và đo được — chỉ cần có người dùng.']
  ];
  ds.forEach((x, i) => {
    console.log(`\n  ${i + 1}. ${x[0]}`);
    console.log(`     hôm nay: ${x[1]}`);
    console.log(`     đo bằng: ${x[2]}`);
  });
}

const A = phanA();
const B = phanB(A);
phanC();
phanD();
console.log('\n' + line('═'));
console.log('PHẦN A đọc từ kho — đổi kho thì chạy lại, số đổi theo.');
console.log('PHẦN B là mô hình. Đừng trích một con số nào của nó ra khỏi ngữ cảnh này.');
console.log(line('═') + '\n');
