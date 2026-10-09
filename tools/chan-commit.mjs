#!/usr/bin/env node
/*
GITA 365 — CHẶN COMMIT NGUY HIỂM (lớp chặn trước khi tệp vào lịch sử git)

Hai chế độ:
  node tools/chan-commit.mjs           soát các tệp ĐANG CHỜ commit (móc pre-commit)
  node tools/chan-commit.mjs --tat-ca  soát MỌI tệp git đang theo dõi (CI)

Chặn ba loại, mỗi loại nói rõ cách gỡ:
  1. Tệp mật: kho-goc/, kho/khoa.json, giay-phep/, *.gita, .dev.vars, .env,
     khoá riêng (*.pem, *.key…), kaggle.json, phiếu quyết.
  2. Tệp nén (*.zip, *.7z, *.rar, *.tar.gz) và tệp quá lớn: tệp nén là chỗ một
     bản sao cả kho mã — kể cả khoá — lọt vào lịch sử công khai mà không ai đọc
     bên trong. Git nhớ mãi: xoá sau cũng không gỡ được khỏi lịch sử.
  3. Dáng khoá thật trong nội dung (dùng chung bộ dáng của tools/soat-bi-mat.js).

Vì sao chạy cả ở CI (--tat-ca): móc pre-commit chỉ chạy trên máy đã cài nó.
Tệp tải lên qua trang web GitHub ("Add files via upload") đi thẳng vào kho mà
không qua móc nào — CI là chỗ duy nhất bắt được đường ấy.

Cài móc trên máy (một lần):  git config core.hooksPath .githooks
*/
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const { quet } = createRequire(import.meta.url)(path.join(ROOT, 'tools/soat-bi-mat.js'));
const TAT_CA = process.argv.includes('--tat-ca');
const TRAN_MB = 8;

const CAM = [
  [/^kho-goc\//, 'nội dung gốc chưa mã hoá'],
  [/^kho\/khoa\.json$/, 'khoá chủ của kho nội dung'],
  [/^giay-phep\//, 'giấy phép mang khoá thật'],
  [/\.gita$|\.bien-nhan\.txt$/, 'bản sao lưu mang toàn bộ khoá'],
  [/(^|\/)\.dev\.vars$/, 'bí mật chạy thử của Worker'],
  [/(^|\/)\.env(\.(?!example$)[^/]+)?$/, 'tệp biến môi trường'],
  [/\.(pem|key|p12|pfx)$|(^|\/)id_rsa/, 'khoá riêng'],
  [/(^|\/)kaggle\.json$/, 'khoá Kaggle'],
  [/(^|\/)(PHIEU-QUYET\.md|[^/]*-phieu-quyet\.md)$/, 'phiếu quyết mang nội dung nghề'],
  [/\.(zip|7z|rar|tgz)$|\.tar(\.gz|\.xz|\.bz2)?$/i, 'tệp nén'],
];
const BO_QUA_NOI_DUNG = /\.(png|jpe?g|gif|webp|ico|woff2?|ttf|otf|mp3|mp4|webm|pdf|wasm|enc)$/i;

function git(args) { return execFileSync('git', args, { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 << 20 }); }

let ds;
try {
  ds = TAT_CA ? git(['ls-files', '-z']).split('\0') : git(['diff', '--cached', '--name-only', '-z', '--diff-filter=ACMR']).split('\0');
} catch (e) {
  console.error('✗ Không đọc được danh sách tệp từ git — cổng không được đạt khi không đo được.');
  process.exit(2);
}
ds = ds.filter(Boolean);

const loi = [];
for (const rel of ds) {
  const cam = CAM.find(([re]) => re.test(rel));
  if (cam) { loi.push(`${rel} — ${cam[1]}`); continue; }
  let buf;
  try { buf = TAT_CA ? fs.readFileSync(path.join(ROOT, rel)) : execFileSync('git', ['show', ':' + rel], { cwd: ROOT, maxBuffer: 256 << 20 }); }
  catch (e) { continue; }
  if (buf.length > TRAN_MB * 1024 * 1024) { loi.push(`${rel} — nặng ${(buf.length / 1048576).toFixed(1)} MB, quá trần ${TRAN_MB} MB`); continue; }
  if (BO_QUA_NOI_DUNG.test(rel)) continue;
  quet(buf.toString('utf8')).forEach(t => loi.push(`${rel}:${t.dong} — dáng khoá ${t.loai}`));
}

const pham = TAT_CA ? `${ds.length} tệp đang theo dõi` : `${ds.length} tệp chờ commit`;
if (loi.length) {
  console.log(`✗ CHẶN: ${loi.length} chỗ nguy hiểm trong ${pham}`);
  loi.slice(0, 40).forEach(x => console.log('  ✗ ' + x));
  console.log(`
Cách gỡ:
  · Tệp mật / khoá: gỡ khỏi lượt commit (git restore --staged <tệp>). Nếu khoá
    đã từng lên GitHub thì phải XOAY khoá ở nhà cung cấp — xoá tệp không đủ.
  · Tệp nén: đừng đưa bản đóng gói vào kho mã; mã nguồn đã có sẵn trong git.
  · Dáng khoá là ví dụ cố ý: ghi "gita-bi-mat:bo-qua" trên chính dòng ấy.`);
  process.exit(1);
}
console.log(`✓ Không có tệp mật, tệp nén, tệp quá ${TRAN_MB} MB hay dáng khoá trong ${pham}.`);
