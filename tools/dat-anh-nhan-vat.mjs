#!/usr/bin/env node
/* dat-anh-nhan-vat.mjs — Đặt ảnh CHÂN DUNG NHÂN VẬT MẪU do chủ hệ chọn.
   Ảnh này làm tham chiếu gương mặt cho MỌI cảnh phim mẫu (và clip
   chuyển động thật sau đó), thay cho chân dung máy tự vẽ.

   Dùng:
     node tools/dat-anh-nhan-vat.mjs <duong-dan-anh.jpg|png>
     node tools/dat-anh-nhan-vat.mjs --xoa        (gỡ ảnh chủ hệ, quay
                                                   lại chân dung máy vẽ)

   Chạy xong mở https://gita365.pages.dev/phim/mau một lần: hệ thống
   tự vẽ lại toàn bộ cảnh theo gương mặt mới (neuron miễn phí của
   Workers AI, mất vài phút). Clip cũ theo mặt cũ sẽ được xếp quay lại.

   Yêu cầu: đã đăng nhập wrangler (npx wrangler login) — script gọi
   wrangler r2/d1 trong thư mục may-chu/. Ảnh tối đa 3 MB, JPEG/PNG. */
import { readFile } from 'node:fs/promises';
import { createHash, randomBytes } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const GOC = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const MAY_CHU = join(GOC, 'may-chu');
const DB = 'gita365';
const BUCKET = 'gita365-hoso';

function chay(thamSo) {
  const r = spawnSync('npx', ['wrangler', ...thamSo], { cwd: MAY_CHU, stdio: 'inherit', shell: true });
  if (r.status !== 0) {
    console.error('LỖI khi chạy: npx wrangler ' + thamSo.join(' '));
    process.exit(1);
  }
}

const arg = process.argv[2];
if (!arg) {
  console.log('Dùng: node tools/dat-anh-nhan-vat.mjs <anh.jpg|png> | --xoa');
  process.exit(1);
}

const TAO_BANG = `CREATE TABLE IF NOT EXISTS phim_pt_hat (ma TEXT PRIMARY KEY, bam TEXT NOT NULL UNIQUE, loai TEXT NOT NULL, mime TEXT NOT NULL, byte INTEGER NOT NULL, soLan INTEGER NOT NULL DEFAULT 1)`;

if (arg === '--xoa') {
  chay(['d1', 'execute', DB, '--remote', '--command', "DELETE FROM phim_pt_hat WHERE loai = 'nvmau-chu'"]);
  console.log('ĐÃ GỠ ảnh nhân vật của chủ hệ. Mở /phim/mau để máy tự vẽ lại chân dung gốc và toàn bộ cảnh.');
  process.exit(0);
}

const tep = resolve(arg);
const u = await readFile(tep);
const jpg = u[0] === 0xFF && u[1] === 0xD8 && u[2] === 0xFF;
const png = u[0] === 0x89 && u[1] === 0x50 && u[2] === 0x4E && u[3] === 0x47;
if (!jpg && !png) { console.error('LỖI: tệp phải là ảnh JPEG hoặc PNG.'); process.exit(1); }
if (u.length > 3 * 1024 * 1024) { console.error('LỖI: ảnh quá 3 MB — hãy nén/cắt bớt.'); process.exit(1); }

const mime = png ? 'image/png' : 'image/jpeg';
const bam = createHash('sha256').update(u).digest('hex');
const ma = randomBytes(16).toString('hex');

console.log('Tải ảnh lên kho R2...');
chay(['r2', 'object', 'put', BUCKET + '/pt/' + bam, '--file', tep, '--content-type', mime, '--remote']);

console.log('Ghi dấu hạt vào D1...');
chay(['d1', 'execute', DB, '--remote', '--command', TAO_BANG]);
chay(['d1', 'execute', DB, '--remote', '--command', "DELETE FROM phim_pt_hat WHERE loai = 'nvmau-chu'"]);
chay(['d1', 'execute', DB, '--remote', '--command',
  `INSERT INTO phim_pt_hat (ma, bam, loai, mime, byte, soLan) VALUES ('${ma}', '${bam}', 'nvmau-chu', '${mime}', ${u.length}, 1) ON CONFLICT(bam) DO UPDATE SET loai = 'nvmau-chu', mime = excluded.mime, byte = excluded.byte`]);

console.log('');
console.log('XONG. Ảnh nhân vật của chủ hệ đã làm chuẩn gương mặt cho xưởng phim.');
console.log('Mở https://gita365.pages.dev/phim/mau để hệ thống tự vẽ lại toàn bộ cảnh theo gương mặt này.');
