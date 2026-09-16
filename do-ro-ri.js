#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════
   GITA 365 — ĐO RÒ DỮ LIỆU: VAI NÀO NHẬN VỀ MÁY NHỮNG GÌ

       xvfb-run -a node tools/do-ro-ri.js

   ══ VÌ SAO PHẢI ĐO BẰNG TRÌNH DUYỆT THẬT ══

   CLAUDE.md có một câu, và nó là câu đắt nhất trong cả tệp:

       "Lọc trên màn hình KHÔNG PHẢI bảo vệ dữ liệu. Gửi xuống rồi thì
        mở công cụ nhà phát triển là đọc được hết."

   Lỗi ấy đã xảy ra BA lần: KICHBAN (8.9) · CV_MUC (9.7) · 17 kho nghề
   (9.8). Cả ba lần đều không có bộ kiểm nào bắt được, vì mọi bộ soi đều
   đọc MÃ NGUỒN — mà mã nguồn thì khai đúng. Chỗ sai nằm ở thứ thật sự
   có mặt trong bộ nhớ trình duyệt sau khi đăng nhập, và chỉ một trình
   duyệt thật mới trả lời được.

   ══ HAI LẦN PHÉP ĐO NÀY BẮT OAN, GHI LẠI ĐỂ KHÔNG LẶP ══

   1. Bản đầu lấy `G.THUOC_CAP_PHEP` làm "danh sách kho nghề" và báo
      RÒ 570 KHO. Sai hoàn toàn: đó là danh sách kho phải XOÁ KHI ĐỔI
      VAI, gồm cả kho gói tầng mà khách hàng trả tiền để có. Một phụ
      huynh giữ kho tầng 1–3 trong bộ nhớ là thứ họ đã mua.

   2. Bản thứ hai đo ĐÚNG danh sách nhưng đo SỰ CÓ MẶT của tên kho, và
      báo RÒ 2 KHO — KICHBAN · FAMILIES. Cũng sai: cả hai là MẢNG RỖNG
      ở máy khách. Chúng là khung khai sẵn trong `src/`, và dữ liệu chỉ
      về theo gói nghề. Coach có 1.000 và 10 bản ghi; phụ huynh có 0.

   Nên phép đo phải đếm BẢN GHI, không đếm tên. Một cái tên có mặt với
   không bản ghi nào là một khung rỗng, không phải một chỗ rò — và báo
   nó là rò thì lần sau người ta tắt phép đo đi, đúng vào lúc có chỗ rò
   thật.

   ══ CÁCH ĐO ĐÚNG, BA BƯỚC ══

   1. Giải mã TỪNG gói để lấy tên kho thật — không tin lời khai nào của
      mã nguồn, vì chính mã nguồn là thứ đang bị nghi.
   2. Tính ra tập CHỈ-NGHỀ: có trong gói nghề và KHÔNG có ở gói nào
      khách mua được. Trừ phần cắt theo bản ghi nằm ở cả hai phía
      (luật G.KHO_TRAI_RA) — phần ấy hợp lệ ở cả hai bên.
   3. Đăng nhập thật bằng từng vai, rồi hỏi bộ nhớ xem kho chỉ-nghề nào
      có mặt VÀ CÓ BẢN GHI.
   ═══════════════════════════════════════════════════════════════ */
'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const zlib = require('zlib');

const GOC = path.resolve(__dirname, '..');
const URL = process.env.GITA_URL_THU || 'http://127.0.0.1:8099/index.html';
const PW = process.env.PW_DIR || '/opt/node22/lib/node_modules/playwright';

/* Gói khách hàng mua được. Khai thẳng chứ không suy từ tên: suy từ tên
   thì thêm một gói mới đặt tên lạ là nó lặng lẽ rơi ra khỏi phép đo. */
const GOI_KHACH = ['nen', 'tang1', 'tang2', 'tang3', 'tang4', 'tang5'];
const GOI_NGHE = ['nghe', 'nghe-cao'];
const VAI_KHACH = /^R1[3-5]$/;

const VAI = [
  ['phuhuynh@gita365.vn', 'R13 phụ huynh'],
  ['hocvien@gita365.vn', 'R14 học viên'],
  ['daisu@gita365.vn', 'R15 đại sứ'],
  ['coach@gita365.vn', 'coach R07'],
  ['superadmin@gita365.vn', 'R01 super admin']
];

function moGoi(khoaB64, buf) {
  const de = crypto.createDecipheriv('aes-256-gcm', Buffer.from(khoaB64, 'base64'), buf.subarray(0, 12));
  de.setAuthTag(buf.subarray(12, 28));
  const r = Buffer.concat([de.update(buf.subarray(28)), de.final()]);
  return JSON.parse((r[0] === 0x1f && r[1] === 0x8b ? zlib.gunzipSync(r) : r).toString('utf8'));
}

(async () => {
  let khoa;
  try {
    khoa = JSON.parse(fs.readFileSync(path.join(GOC, 'kho', 'khoa.json'), 'utf8')).khoa;
  } catch {
    console.error('\n  ✗ Không có kho/khoa.json — phép đo này cần khoá để biết gói nào chứa gì.\n');
    process.exit(2);
  }

  const tenTheoGoi = {};
  for (const g of Object.keys(khoa)) {
    const f = path.join(GOC, 'kho', g + '.enc');
    if (fs.existsSync(f)) tenTheoGoi[g] = new Set(Object.keys(moGoi(khoa[g], fs.readFileSync(f))));
  }

  const khachMuaDuoc = new Set();
  GOI_KHACH.forEach(g => (tenTheoGoi[g] || new Set()).forEach(t => khachMuaDuoc.add(t)));

  const chiNghe = new Set();
  GOI_NGHE.forEach(g =>
    (tenTheoGoi[g] || new Set()).forEach(t => { if (!khachMuaDuoc.has(t)) chiNghe.add(t); }));
  const traiRa = [...(tenTheoGoi.nghe || [])].filter(t => khachMuaDuoc.has(t));

  console.log('\n── KHO CHIA THEO GÓI (giải mã thẳng từ tệp, không đọc lời khai) ──\n');
  Object.keys(tenTheoGoi).sort().forEach(g =>
    console.log('  ' + g.padEnd(10) + String(tenTheoGoi[g].size).padStart(5) + ' kho'));
  console.log('\n  CHỈ có ở gói nghề (khách không mua được) : ' + chiNghe.size + ' kho');
  console.log('  Cắt theo bản ghi, hợp lệ ở CẢ hai phía   : ' + traiRa.length + ' kho' +
    (traiRa.length ? ' — ' + traiRa.join(' · ') : ''));

  const { chromium } = require(PW);
  const b = await chromium.launch();
  const ket = [];

  for (const [u, ten] of VAI) {
    const p = await b.newPage({ viewport: { width: 1400, height: 900 } });
    await p.addInitScript(x => { window.GITA_KHOA = x; }, khoa);
    await p.goto(URL, { waitUntil: 'networkidle' });
    await p.evaluate(() => localStorage.clear());
    await p.reload({ waitUntil: 'networkidle' });
    await p.waitForFunction(() => window.G && window.G.KHO, { timeout: 30000 });
    await p.evaluate(t => window.G.doLogin(t), u);
    /* Chờ GÓI NẠP XONG, không chờ theo đồng hồ: gói to lên một chút là
       phép đo chạy trên bộ nhớ chưa đầy và báo sạch ở chỗ có lỗi. */
    await p.waitForFunction(() => window.G.KHO && !window.G.KHO.dangNap.length, { timeout: 60000 });
    await p.waitForTimeout(400);

    const d = await p.evaluate((dsChiNghe) => {
      const G = window.G;
      const dem = v => Array.isArray(v) ? v.length
        : (v && typeof v === 'object' ? Object.keys(v).length : (v == null ? 0 : 1));
      const co = Object.keys(G).filter(k => /^[A-Z][A-Z0-9_]*$/.test(k) &&
        typeof G[k] !== 'function' && G[k] != null);
      /* ĐẾM BẢN GHI, không đếm tên. Một cái tên có mặt với 0 bản ghi là
         một KHUNG RỖNG khai sẵn trong src/, không phải một chỗ rò. */
      const lot = dsChiNghe
        .map(t => ({ ten: t, so: dem(G[t]) }))
        .filter(x => x.so > 0);
      return {
        vai: (G.S && G.S.roleObj && G.S.roleObj.id) || '?',
        goi: (G.KHO.daNap || []).slice().sort(),
        soKho: co.length,
        soBanGhi: co.reduce((a, k) => a + dem(G[k]), 0),
        khungRong: dsChiNghe.filter(t => t in G && dem(G[t]) === 0).length,
        lot
      };
    }, [...chiNghe]);

    ket.push({ ten, ...d });
    await p.close();
  }
  await b.close();

  console.log('\n── VAI NÀO NHẬN VỀ MÁY NHỮNG GÌ ──\n');
  ket.forEach(k => console.log('  ' + k.ten.padEnd(18) +
    ' gói: ' + k.goi.join(',').padEnd(46) +
    String(k.soKho).padStart(5) + ' kho · ' + String(k.soBanGhi).padStart(6) + ' bản ghi'));

  console.log('\n── KHO CHỈ-NGHỀ CÓ BẢN GHI NÀO LỌT XUỐNG VAI KHÁCH KHÔNG ──\n');
  let ro = 0;
  for (const k of ket) {
    if (!VAI_KHACH.test(String(k.vai))) continue;
    if (k.lot.length) {
      ro += k.lot.length;
      console.log('  ✗ ' + k.ten + ' NHẬN ' + k.lot.length + ' kho chỉ-nghề CÓ DỮ LIỆU:');
      k.lot.slice(0, 15).forEach(x => console.log('        ' + x.ten + ' — ' + x.so + ' bản ghi'));
    } else {
      console.log('  ✓ ' + k.ten.padEnd(18) + ' 0 kho chỉ-nghề có dữ liệu' +
        ' (' + k.khungRong + ' khung rỗng — khai sẵn trong src/, đúng)');
    }
  }

  console.log('\n' + (ro === 0
    ? '  ✓ KHÔNG RÒ — không kho chỉ-nghề nào xuống máy khách kèm dữ liệu\n'
    : '  ✗ RÒ ' + ro + ' CHỖ — lọc trên màn hình không phải bảo vệ dữ liệu\n'));
  process.exit(ro === 0 ? 0 : 1);
})();
