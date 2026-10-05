#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════
   GITA 365 — CHUYỂN .py SANG .ipynb (notebook Kaggle tải lên thẳng)

   Vì sao có bộ này: nhiều lần dán NHẦM nội dung JSON của tệp .ipynb
   vào ô code Kaggle rồi Run → Python gặp `null` (từ của JSON) và báo
   "NameError: name 'null' is not defined". Cách chắc ăn là KHÔNG dán
   tay nữa mà TẢI LÊN tệp .ipynb (New Notebook → File → Upload, hoặc
   File → Import Notebook).

   Bộ này dựng .ipynb từ .py để hai bản luôn khớp: mỗi .py thành một
   notebook có 1 ô Markdown (nhắc cài đặt) + 1 ô Code (toàn bộ .py).

   Chạy:  node tools/py-sang-ipynb.mjs            (dựng cho cả 3 notebook)
          node tools/py-sang-ipynb.mjs --kiem     (dựng vào bộ nhớ rồi
                                                    đối với tệp hiện có)
   ═══════════════════════════════════════════════════════════════ */
'use strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const goc = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const THU_MUC = path.join(goc, 'may-quay-kaggle');

/* Ô Markdown nhắc cài đặt Kaggle — in trên đầu mỗi notebook. */
const NHAC = {
  'xuong-phim-studio': [
    '# GITA 365 · Xưởng phim Kaggle — sản xuất phim nguyên bộ (0 đồng)\n',
    '\n',
    '**Cài đặt trước khi Run (làm một lần):**\n',
    '1. Settings → Accelerator → **GPU T4 x2** · Internet → **On**.\n',
    '2. Add-ons → Secrets → thêm **`GITA_KHOA_QUAY`** = khoá xưởng quay (GitHub secret `GITA_KHOA_XUONG_QUAY`).\n',
    '3. Bấm **Run All**. Máy tự nhận việc `film`/`tts`, quay xong tự nộp về máy chủ.\n',
    '\n',
    'Phiên tự dừng sạch trước giới hạn Kaggle (~11 giờ) — hết thì **Run All** lại, việc dở chạy tiếp theo checkpoint.\n'
  ],
  'quay-kaggle': [
    '# GITA 365 · Máy quay clip đơn lẻ trên Kaggle (việc `vd`)\n',
    '\n',
    '**Bản cũ — chỉ quay clip đơn lẻ.** Muốn quay PHIM NGUYÊN BỘ dùng `xuong-phim-studio.ipynb`.\n',
    '\n',
    '1. Settings → Accelerator → **GPU T4** · Internet → **On**.\n',
    '2. Add-ons → Secrets → **`GITA_KHOA_QUAY`**.\n',
    '3. **Run All**.\n'
  ],
  'tao-nhan-vat': [
    '# GITA 365 · Máy vẽ nhân vật AI trên Kaggle (việc `nv`)\n',
    '\n',
    '1. Settings → Accelerator → **GPU T4** · Internet → **On**.\n',
    '2. Add-ons → Secrets → **`GITA_KHOA_QUAY`**.\n',
    '3. **Run All**. Vẽ bằng FLUX.1-schnell; ảnh xong ở `/quay/phim/<ma>.png`.\n'
  ]
};

/* Tách chuỗi thành mảng dòng kiểu nbformat (mỗi dòng giữ \n ở cuối, trừ
   dòng cuối). */
function thanhDong(chu) {
  const d = chu.split('\n');
  if (d.length && d[d.length - 1] === '') d.pop();   // bỏ dòng rỗng cuối do \n cuối tệp
  return d.map((l, i) => (i < d.length - 1 ? l + '\n' : l));
}

function dungNotebook(ten, maPy) {
  const nhac = NHAC[ten] || ['# ' + ten + '\n'];
  return {
    cells: [
      { cell_type: 'markdown', metadata: {}, source: nhac },
      { cell_type: 'code', execution_count: null, metadata: {}, outputs: [], source: thanhDong(maPy) }
    ],
    metadata: {
      kernelspec: { display_name: 'Python 3', language: 'python', name: 'python3' },
      language_info: { name: 'python' },
      accelerator: 'GPU'
    },
    nbformat: 4,
    nbformat_minor: 5
  };
}

const KIEM = process.argv.includes('--kiem');
let hong = 0;
for (const ten of Object.keys(NHAC)) {
  const py = path.join(THU_MUC, ten + '.py');
  const nb = path.join(THU_MUC, ten + '.ipynb');
  if (!fs.existsSync(py)) { console.error('✗ thiếu ' + ten + '.py'); hong++; continue; }
  const maPy = fs.readFileSync(py, 'utf8');
  const chuMoi = JSON.stringify(dungNotebook(ten, maPy), null, 1) + '\n';
  if (KIEM) {
    const cu = fs.existsSync(nb) ? fs.readFileSync(nb, 'utf8') : '';
    if (cu === chuMoi) console.log('✓ ' + ten + '.ipynb · khớp');
    else { console.error('✗ ' + ten + '.ipynb · KHÁC .py — chạy: node tools/py-sang-ipynb.mjs'); hong++; }
  } else {
    fs.writeFileSync(nb, chuMoi);
    console.log('✓ ' + ten + '.ipynb · ' + Math.round(chuMoi.length / 1024) + ' KB');
  }
}
process.exit(hong ? 1 : 0);
