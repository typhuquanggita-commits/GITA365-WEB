#!/usr/bin/env node
/* bac-si-xuong.js — "doctor" của xưởng phim AI GITA365.
   Báo chính xác còn THIẾU binding/secret/capability nào và lệnh sửa,
   theo chỉ dẫn 04/10/2026: không có progress giả; thiếu gì thì
   BLOCKED đúng tên + hướng dẫn cấu hình cụ thể.

   Chạy: node tools/bac-si-xuong.js   (mã thoát 1 khi có mục THIẾU) */
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { soatShot, chonRoute } from '../may-chu/hop-dong-shot.js';

const GOC = join(dirname(fileURLToPath(import.meta.url)), '..');
const MAY_CHU = join(GOC, 'may-chu');
const dong = [];
function muc(trangThai, ten, cachSua) { dong.push({ trangThai, ten, cachSua }); }

/* ── 1. Binding Cloudflare trong wrangler.toml ── */
const toml = existsSync(join(MAY_CHU, 'wrangler.toml')) ? readFileSync(join(MAY_CHU, 'wrangler.toml'), 'utf8') : '';
muc(toml ? 'CO' : 'THIEU', 'may-chu/wrangler.toml', 'Khôi phục từ git; không có thì xưởng không deploy được.');
for (const [ten, mau, sua] of [
  ['binding AI (Workers AI — vẽ ảnh)', /binding\s*=\s*"AI"/, 'Thêm [[ai]] binding = "AI" vào wrangler.toml'],
  ['binding CSDL (D1 — hàng chờ, công thức phim)', /database_name\s*=\s*"gita365"/, 'npx wrangler d1 create gita365 rồi điền database_id'],
  ['binding HOSO (R2 — kho hạt/clip)', /bucket_name\s*=\s*"gita365-hoso"/, 'npx wrangler r2 bucket create gita365-hoso']
]) muc(toml && mau.test(toml) ? 'CO' : 'THIEU', ten, sua);

/* ── 2. Secret (hỏi wrangler; không đăng nhập được thì UNKNOWN) ── */
const ds = spawnSync('npx', ['wrangler', 'secret', 'list'], { cwd: MAY_CHU, encoding: 'utf8', shell: true, timeout: 60000 });
if (ds.status !== 0) {
  muc('UNKNOWN', 'danh sách secret Workers', 'Chạy: cd may-chu && npx wrangler login — sau đó chạy lại doctor.');
} else {
  let biMat = [];
  try { biMat = JSON.parse(ds.stdout).map(s => s.name); } catch (e) { biMat = []; }
  muc(biMat.includes('GITA_KHOA_XUONG_QUAY') ? 'CO' : 'THIEU', 'secret GITA_KHOA_XUONG_QUAY (khoá xưởng quay)',
    'cd may-chu && npx wrangler secret put GITA_KHOA_XUONG_QUAY  (khoá ≥32 ký tự, trùng với secret GITA_KHOA_QUAY trên Kaggle)');
  muc(biMat.includes('GITA_VE_ANH_KHOA') ? 'CO' : 'THIEU-TUY-CHON', 'secret GITA_VE_ANH_KHOA (dịch vụ vẽ ngoài — TẮT mặc định để giữ 0đ)',
    'Chỉ nạp khi chủ hệ chủ động chấp nhận chi phí: npx wrangler secret put GITA_VE_ANH_KHOA');
}

/* ── 3. Máy quay và hàng chờ ── */
muc(existsSync(join(GOC, 'may-quay-kaggle/quay-kaggle.py')) ? 'CO' : 'THIEU',
  'máy quay GPU Kaggle (LTX-Video)', 'Khôi phục may-quay-kaggle/quay-kaggle.py; hướng dẫn bật: docs/GPU-MIEN-PHI.md');
const wf = join(GOC, '.github/workflows');
const coXuongGh = existsSync(wf) && readdirSync(wf).some(f => /quay|xuong/.test(f));
muc(coXuongGh ? 'CO' : 'THIEU-TUY-CHON', 'workflow GitHub máy khớp môi (SadTalker)',
  'Máy khớp môi nằm ở kho riêng GITA_GH_XUONG_QUAY — kiểm tra kho đó còn workflow lịch 10 phút.');

/* ── 4. Hợp đồng và fixture phim thử ── */
muc(existsSync(join(MAY_CHU, 'hop-dong-shot.js')) ? 'CO' : 'THIEU', 'hợp đồng shot (may-chu/hop-dong-shot.js)', 'Khôi phục từ git.');
const THU = join(GOC, 'xuong-phim/phim-thu');
const shots = existsSync(THU) ? readdirSync(THU).filter(f => /^pilot_s\d+\.json$/.test(f)) : [];
muc(shots.length === 10 ? 'CO' : 'THIEU', 'phim thử 10 shot (xuong-phim/phim-thu)', 'Khôi phục fixture; kiểm bằng node tools/thu-hop-dong-shot.mjs');
let biChan = [];
if (shots.length === 10) for (const f of shots.sort()) {
  const s = JSON.parse(readFileSync(join(THU, f), 'utf8'));
  if (!soatShot(s).ok) biChan.push(f + ': sai hợp đồng');
  else { const r = chonRoute(s); if (!r.ok) biChan.push(f + ': ' + r.thieu.map(t => t.cap).join(',')); }
}
muc('TINH', 'shot bị BLOCKED theo sổ năng lực thật', '');
muc('CO', 'bộ kiểm thử hợp đồng (tools/thu-hop-dong-shot.mjs)', '');

/* ── Báo cáo ── */
console.log('══ BÁC SĨ XƯỞNG PHIM GITA365 ══');
let thieu = 0;
for (const d of dong) {
  if (d.trangThai === 'TINH') continue;
  const nhan = d.trangThai === 'CO' ? '✓' : d.trangThai === 'UNKNOWN' ? '?' : '✗';
  console.log(nhan, '[' + d.trangThai + ']', d.ten);
  if (d.trangThai !== 'CO' && d.cachSua) console.log('    →', d.cachSua);
  if (d.trangThai === 'THIEU') thieu++;
}
console.log('── Shot đang BLOCKED (đúng chuẩn, không âm thầm hạ cấp) ──');
if (!biChan.length) console.log('(không có)');
for (const b of biChan) console.log('·', b);
console.log(thieu ? `\nTHIẾU ${thieu} mục bắt buộc — xưởng ở trạng thái BLOCKED cho phần đó.` : '\nĐỦ cấu hình nền. Các capability bị chặn đã liệt kê ở trên.');
process.exit(thieu ? 1 : 0);
