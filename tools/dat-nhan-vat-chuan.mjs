#!/usr/bin/env node
/* dat-nhan-vat-chuan.mjs — KHÓA ảnh chuẩn cho một nhân vật điện ảnh
   GITA365 (trainer, mc, giang-vien, bo, me, con-gai, con-trai).

   Ảnh chuẩn là bộ tham chiếu danh tính: máy vẽ (Workers AI klein) nhận
   tối đa 4 ảnh/nhân vật làm input_image; máy quay Kaggle tải bộ ảnh này
   qua GET /quay/nvchuan để làm ảnh khởi tạo image-to-video. Nhân vật
   được khóa sẽ giữ NGUYÊN gương mặt/trang phục qua mọi cảnh, mọi phim.

   Dùng:
     node tools/dat-nhan-vat-chuan.mjs <id> <anh1.png> [anh2.png ...]
         — khóa BỘ ẢNH MỚI cho nhân vật (tối đa 4 ảnh, JPEG/PNG ≤ 3 MB,
           thứ tự truyền = thứ tự ưu tiên). Bộ cũ của nhân vật bị gỡ.
     node tools/dat-nhan-vat-chuan.mjs --ke [id]
         — liệt kê ảnh đang khóa (mọi nhân vật hoặc một nhân vật).
     node tools/dat-nhan-vat-chuan.mjs --xoa <id>
         — gỡ khóa, nhân vật quay về chân dung máy tự vẽ.

   Danh sách id hợp lệ: xem may-chu/nhan-vat-chuan.js. Muốn thêm nhân
   vật mới: thêm hồ sơ vào đó (tên, vai, giọng, promptEn) rồi chạy
   script này với ảnh chủ hệ đã duyệt bằng mắt.

   Yêu cầu: đã đăng nhập wrangler (npx wrangler login) — script gọi
   wrangler r2/d1 trong thư mục may-chu/. Sau khi khóa xong, cảnh mới
   tạo sẽ dùng bộ ảnh mới ngay; cảnh cũ đã vẽ được giữ nguyên cho tới
   khi phiên bản ảnh/prompt đổi. */
import { existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { createHash, randomBytes } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve, basename } from 'node:path';
import { NHAN_VAT_CHUAN, nhanVatHopLe, loaiHatNV } from '../may-chu/nhan-vat-chuan.js';

const GOC = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const MAY_CHU = join(GOC, 'may-chu');
const DB = 'gita365';
const BUCKET = 'gita365-hoso';
const TOI_DA_REF = 4;

function chay(thamSo, batIm) {
  const wranglerJs = join(MAY_CHU, 'node_modules', 'wrangler', 'bin', 'wrangler.js');
  let r;
  if (existsSync(wranglerJs)) {
    r = spawnSync(process.execPath, [wranglerJs, ...thamSo], { cwd: MAY_CHU, stdio: batIm ? 'pipe' : 'inherit', shell: false, encoding: 'utf8' });
  } else {
    // Không có wrangler cài sẵn: gọi qua npx. Trên Windows bắt buộc shell
    // (npx là .cmd) nên phải tự bọc nháy kép cho tham số có khoảng trắng.
    const npxLenh = process.platform === 'win32' ? 'npx.cmd' : 'npx';
    const dongLenh = [npxLenh, 'wrangler', ...thamSo.map((t) => (/[\s"&|<>^]/.test(t) ? '"' + String(t).replace(/"/g, '\\"') + '"' : t))].join(' ');
    r = spawnSync(dongLenh, { cwd: MAY_CHU, stdio: batIm ? 'pipe' : 'inherit', shell: true, encoding: 'utf8' });
  }
  if (r.error || r.status !== 0) {
    console.error('LỖI khi chạy: wrangler ' + thamSo.join(' '));
    if (r.error) console.error(String(r.error.message || r.error));
    if (batIm && r.stderr) console.error(String(r.stderr).slice(-600));
    process.exit(1);
  }
  return r.stdout || '';
}

const TAO_BANG = `CREATE TABLE IF NOT EXISTS phim_pt_hat (ma TEXT PRIMARY KEY, bam TEXT NOT NULL UNIQUE, loai TEXT NOT NULL, mime TEXT NOT NULL, byte INTEGER NOT NULL, soLan INTEGER NOT NULL DEFAULT 1)`;

function sqlAnToan(s) { return String(s).replace(/'/g, "''"); }

async function ke(idLoc) {
  chay(['d1', 'execute', DB, '--remote', '--command', TAO_BANG]);
  const ra = chay(['d1', 'execute', DB, '--remote', '--json', '--command',
    "SELECT loai, ma, mime, byte FROM phim_pt_hat WHERE loai LIKE 'nvchuan-%' ORDER BY loai, rowid"], true);
  let ds = [];
  try {
    const j = JSON.parse(ra);
    ds = (Array.isArray(j) ? j[0].results : j.results) || [];
  } catch (e) { console.error('Không đọc được kết quả D1:', ra.slice(0, 300)); process.exit(1); }
  const gom = {};
  for (const r of ds) {
    const id = String(r.loai).replace(/^nvchuan-/, '');
    if (idLoc && id !== idLoc) continue;
    (gom[id] = gom[id] || []).push(r);
  }
  let trong = true;
  for (const id of Object.keys(NHAN_VAT_CHUAN)) {
    if (idLoc && id !== idLoc) continue;
    const refs = gom[id] || [];
    if (refs.length) {
      trong = false;
      console.log(`● ${id} — ${NHAN_VAT_CHUAN[id].ten} (${refs.length} ảnh khóa):`);
      refs.forEach((r, i) => console.log(`   ${i + 1}. ma=${r.ma}  ${r.mime}  ${(r.byte / 1024).toFixed(0)} KB`));
    } else {
      console.log(`○ ${id} — ${NHAN_VAT_CHUAN[id].ten} (CHƯA khóa ảnh — đang dùng chân dung máy tự vẽ)`);
    }
  }
  if (trong) console.log('Chưa nhân vật nào được khóa ảnh.');
}

const arg = process.argv[2];
if (!arg) {
  console.log('Dùng: node tools/dat-nhan-vat-chuan.mjs <id> <anh...> | --ke [id] | --xoa <id>');
  console.log('id hợp lệ: ' + Object.keys(NHAN_VAT_CHUAN).join(', '));
  process.exit(1);
}

if (arg === '--ke') { await ke(process.argv[3] || ''); process.exit(0); }

if (arg === '--xoa') {
  const id = process.argv[3];
  if (!nhanVatHopLe(id)) { console.error('LỖI: id "' + id + '" không có trong nhan-vat-chuan.js'); process.exit(1); }
  chay(['d1', 'execute', DB, '--remote', '--command',
    `DELETE FROM phim_pt_hat WHERE loai = '${sqlAnToan(loaiHatNV(id))}'`]);
  console.log(`ĐÃ GỠ khóa ảnh của ${id} (${NHAN_VAT_CHUAN[id].ten}). Nhân vật quay về chân dung máy tự vẽ.`);
  process.exit(0);
}

const id = arg;
if (!nhanVatHopLe(id)) {
  console.error('LỖI: id "' + id + '" không hợp lệ. id hợp lệ: ' + Object.keys(NHAN_VAT_CHUAN).join(', '));
  process.exit(1);
}
const tepDs = process.argv.slice(3);
if (!tepDs.length) { console.error('LỖI: cần ít nhất một đường dẫn ảnh.'); process.exit(1); }
if (tepDs.length > TOI_DA_REF) { console.error('LỖI: tối đa ' + TOI_DA_REF + ' ảnh tham chiếu cho một nhân vật.'); process.exit(1); }

const loai = loaiHatNV(id);
const hang = [];
const bamDaCo = new Set();
for (const t of tepDs) {
  const tep = resolve(t);
  const u = await readFile(tep);
  const jpg = u[0] === 0xFF && u[1] === 0xD8 && u[2] === 0xFF;
  const png = u[0] === 0x89 && u[1] === 0x50 && u[2] === 0x4E && u[3] === 0x47;
  if (!jpg && !png) { console.error('LỖI: ' + basename(tep) + ' phải là JPEG hoặc PNG.'); process.exit(1); }
  if (u.length > 3 * 1024 * 1024) { console.error('LỖI: ' + basename(tep) + ' quá 3 MB — hãy nén/cắt bớt.'); process.exit(1); }
  const bam = createHash('sha256').update(u).digest('hex');
  if (bamDaCo.has(bam)) { console.log('Bỏ qua ' + basename(tep) + ' (trùng nội dung ảnh đã chọn).'); continue; }
  bamDaCo.add(bam);
  hang.push({ tep, u, bam, mime: png ? 'image/png' : 'image/jpeg' });
}
if (!hang.length) { console.error('LỖI: không còn ảnh nào sau khi lọc trùng.'); process.exit(1); }

console.log(`Khóa ${hang.length} ảnh cho ${id} — ${NHAN_VAT_CHUAN[id].ten}`);
console.log('1/3 — Tải ảnh lên kho R2...');
for (const h of hang)
  chay(['r2', 'object', 'put', BUCKET + '/pt/' + h.bam, '--file', h.tep, '--content-type', h.mime, '--remote']);

console.log('2/3 — Ghi dấu hạt vào D1...');
chay(['d1', 'execute', DB, '--remote', '--command', TAO_BANG]);
/* Bộ khóa mới THAY THẾ bộ cũ của nhân vật (thứ tự truyền = thứ tự dùng). */
chay(['d1', 'execute', DB, '--remote', '--command',
  `DELETE FROM phim_pt_hat WHERE loai = '${sqlAnToan(loai)}'`]);
for (const h of hang) {
  const ma = randomBytes(16).toString('hex');
  chay(['d1', 'execute', DB, '--remote', '--command',
    `INSERT INTO phim_pt_hat (ma, bam, loai, mime, byte, soLan) VALUES ('${ma}', '${h.bam}', '${sqlAnToan(loai)}', '${h.mime}', ${h.u.length}, 1) ` +
    `ON CONFLICT(bam) DO UPDATE SET loai = '${sqlAnToan(loai)}', mime = excluded.mime, byte = excluded.byte`]);
  h.ma = ma;
}

console.log('3/3 — Kiểm tra lại...');
await ke(id);

const nhatKy = join(GOC, 'xuong-phim', 'nhan-vat-chuan');
const ghi = {
  id, ten: NHAN_VAT_CHUAN[id].ten, khoaLuc: new Date().toISOString(),
  refs: hang.map(h => ({ ma: h.ma, bam: h.bam, mime: h.mime, byte: h.u.length, tep: basename(h.tep) }))
};
await writeFile(join(nhatKy, id + '.json'), JSON.stringify(ghi, null, 2) + '\n', 'utf8');
console.log('');
console.log('XONG. ' + NHAN_VAT_CHUAN[id].ten + ' đã được KHÓA ' + hang.length + ' ảnh chuẩn.');
console.log('Nhật ký khóa: xuong-phim/nhan-vat-chuan/' + id + '.json (commit giúp truy vết).');
console.log('Cảnh/phim quay từ lúc này dùng đúng gương mặt đã khóa.');
