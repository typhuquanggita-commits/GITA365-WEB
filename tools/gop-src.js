#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════
   GITA 365 — GỘP MÃ NGUỒN  (khôi phục 9.99.238)

   Gộp src/*.js thành hai gói tải-một-lượt:
     · gita-app.js  — 140 tệp nền, nằm trong index.html
     · gita-nghe.js — 36 tệp màn NGHỀ, chỉ nạp khi giấy phép có gói nghề

   Vì sao bọc từng tệp trong (function(){…})(): có ~30 tên trùng ở phạm
   vi ngoài cùng giữa các tệp — nối thẳng là giẫm lên nhau trong im lặng.

   THỨ TỰ NẠP  : tools/danh-sach-src.json   (app[], nghe[])
   ĐẦU MỖI GÓI : tools/entete-app.txt · tools/entete-nghe.txt
                 (đầu gói app mang khối G.MAN_NGHE — danh sách màn nằm ở
                  gói nghề, để nền biết khi nào cần nạp gói nghề)

   Chạy:  node tools/gop-src.js         (gộp)
          node tools/gop-src.js --kiem  (gộp vào bộ nhớ rồi ĐỐI với tệp
                                          hiện có; khác byte là báo đỏ)

   Tệp này được dựng lại byte-khớp từ chính hai gói .js đã phát hành sau
   khi bộ công cụ gốc mất trong sự cố container. Đối chiếu: cả hai gói
   khớp từng byte với bản đang chạy.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const KIEM = process.argv.includes('--kiem');

const man = JSON.parse(fs.readFileSync(path.join(__dirname, 'danh-sach-src.json'), 'utf8'));

function dungGoi(key) {
  const header = fs.readFileSync(path.join(__dirname, 'entete-' + key + '.txt'), 'utf8');
  const body = man[key].map(function (f) {
    const src = fs.readFileSync(path.join(ROOT, f), 'utf8');
    return '/* ═════════ ' + f + ' ═════════ */\n(function(){\n' + src + '\n})();';
  }).join('\n\n');
  return header + body + '\n';
}

const goi = { 'gita-app.js': dungGoi('app'), 'gita-nghe.js': dungGoi('nghe') };

let doLech = 0;
for (const ten of Object.keys(goi)) {
  const duongDan = path.join(ROOT, ten);
  if (KIEM) {
    const cu = fs.existsSync(duongDan) ? fs.readFileSync(duongDan, 'utf8') : '';
    const khop = cu === goi[ten];
    console.log((khop ? '✓' : '✗') + ' ' + ten + ' · ' + (goi[ten].length / 1024 | 0) + ' KB' +
      (khop ? ' · khớp' : ' · LỆCH so với tệp hiện có'));
    if (!khop) doLech++;
  } else {
    fs.writeFileSync(duongDan, goi[ten]);
    console.log('✓ ' + ten + ' · ' + man[ten.replace('gita-', '').replace('.js', '')].length +
      ' tệp · ' + (goi[ten].length / 1024 | 0) + ' KB');
  }
}
if (KIEM && doLech) process.exit(1);
