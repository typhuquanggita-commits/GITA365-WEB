/* Đóng gói SỔ TRI THỨC một cuốn sách nội bộ thành kho-sach/<sách>.enc
   (AES-256-GCM, PBKDF2-SHA256 250.000 vòng) — cùng định dạng gói kho cao,
   nên máy khách mở bằng đúng một hàm.

   Vì sao phải mã hoá: kho mã gita365-web công khai, sách là tác phẩm có bản
   quyền. Nguồn biên soạn (C1.json … C8.json) KHÔNG bao giờ vào kho mã; chỉ
   gói đã mã hoá vào. Mật khẩu là bản riêng ở Drive của chủ hệ, KHÁC mật khẩu
   mọi gói khác — lộ một gói không mở được gói kia.

   Mật khẩu KHÔNG qua tham số dòng lệnh (ps aux đọc được): GITA_MK_GOI hoặc
   tệp ở GITA_MK_TEP.

   Dùng:
     node tools/dong-goi-sach.mjs <sách> <thư-mục-nguồn>   đóng gói + tự mở lại để so
     node tools/dong-goi-sach.mjs --mo <sách> <thư-mục-ra>  mở gói ra C*.json */
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import crypto from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url)).replace(/[\\/]$/, '');
const VONG = 250000;
const tepGoi = sach => path.join(ROOT, 'kho-sach', sach + '.enc');

function matKhau() {
  let mk = process.env.GITA_MK_GOI || '';
  if (!mk && process.env.GITA_MK_TEP) mk = fs.readFileSync(process.env.GITA_MK_TEP, 'utf8').trim();
  if (mk.length < 12) { console.error('Thiếu mật khẩu: đặt GITA_MK_GOI (≥12 ký tự) hoặc GITA_MK_TEP.'); process.exit(2); }
  return mk;
}
export function moGoiSach(mk, tep) {
  const g = JSON.parse(fs.readFileSync(tep, 'utf8'));
  const ct = Buffer.from(g.ct, 'base64'), iv = Buffer.from(g.iv, 'base64');
  const d = crypto.createDecipheriv('aes-256-gcm', crypto.pbkdf2Sync(Buffer.from(mk, 'utf8'), Buffer.from(g.salt, 'base64'), g.n, 32, 'sha256'), iv);
  d.setAuthTag(ct.subarray(ct.length - 16));
  const nen = Buffer.concat([d.update(ct.subarray(0, ct.length - 16)), d.final()]);
  return { ban: g.ban, sach: g.sach, ds: JSON.parse(zlib.gunzipSync(nen).toString('utf8')) };
}

async function dongGoi(sach, nguon) {
  const { soatChuong, SACH } = await import(pathToFileURL(path.join(ROOT, 'may-chu', 'sach-noi-bo.js')).href);
  if (!SACH[sach]) { console.error('Sách không có trong danh mục SACH: ' + sach); process.exit(1); }
  const tep = fs.readdirSync(nguon).filter(f => /^C[1-8]\.json$/.test(f)).sort();
  const ds = tep.map(f => JSON.parse(fs.readFileSync(path.join(nguon, f), 'utf8')));
  const loi = [];
  if (ds.length !== SACH[sach].chuong) loi.push('có ' + ds.length + ' chương, cần ' + SACH[sach].chuong);
  ds.forEach(c => { const l = soatChuong(c); if (l.length) loi.push(c.ma + ': ' + l.join(',')); });
  if (loi.length) { console.error('KHÔNG ĐÓNG GÓI:\n' + loi.slice(0, 40).join('\n')); process.exit(1); }
  const mk = matKhau();
  const ban = 'SACH-' + sach + '-' + new Date().toISOString().slice(0, 10) + '-' + crypto.createHash('sha256').update(JSON.stringify(ds)).digest('hex').slice(0, 8);
  const salt = crypto.randomBytes(16), iv = crypto.randomBytes(12);
  const c = crypto.createCipheriv('aes-256-gcm', crypto.pbkdf2Sync(Buffer.from(mk, 'utf8'), salt, VONG, 32, 'sha256'), iv);
  const ct = Buffer.concat([c.update(zlib.gzipSync(Buffer.from(JSON.stringify(ds), 'utf8'), { level: 9 })), c.final(), c.getAuthTag()]);
  const GOI = tepGoi(sach), tam = GOI + '.tam';
  fs.mkdirSync(path.dirname(GOI), { recursive: true });
  fs.writeFileSync(tam, JSON.stringify({ v: 1, sach, ban, n: VONG, salt: salt.toString('base64'), iv: iv.toString('base64'), ct: ct.toString('base64') }));
  const mo = moGoiSach(mk, tam);
  if (JSON.stringify(mo.ds) !== JSON.stringify(ds)) { fs.unlinkSync(tam); console.error('Mở lại không khớp — đã xoá gói vừa ghi.'); process.exit(1); }
  let saiMk = false;
  try { moGoiSach(mk + 'x', tam); } catch (e) { saiMk = true; }
  if (!saiMk) { fs.unlinkSync(tam); console.error('Gói mở được bằng mật khẩu sai — đã xoá.'); process.exit(1); }
  fs.renameSync(tam, GOI);
  const soMuc = ds.reduce((a, x) => a + x.muc.length, 0);
  console.log('✓ ' + path.relative(ROOT, GOI) + ' · ' + ban + ' · ' + ds.length + ' chương · ' + soMuc + ' mục · ' +
    Math.round(fs.statSync(GOI).size / 1024) + ' KB · mở lại khớp, sai mật khẩu bị từ chối');
}

function moRa(sach, ra) {
  const { ban, ds } = moGoiSach(matKhau(), tepGoi(sach));
  fs.mkdirSync(ra, { recursive: true });
  ds.forEach(c => fs.writeFileSync(path.join(ra, c.ma + '.json'), JSON.stringify(c, null, 1)));
  console.log('✓ Đã mở ' + ban + ' ra ' + ra + ' (' + ds.length + ' chương).');
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const a = process.argv.slice(2);
  if (a[0] === '--mo' && a[1]) moRa(a[1], a[2] || 'kho-sach-mo');
  else if (a[0] && a[1]) await dongGoi(a[0], a[1]);
  else { console.log('Dùng: node tools/dong-goi-sach.mjs <sách> <thư-mục-nguồn> | --mo <sách> <thư-mục-ra>'); process.exit(2); }
}
