/* Đóng gói Kho 1000 vấn đề thành kho-van-de/goi.enc (AES-256-GCM).

   Kho mã là CÔNG KHAI, nên nội dung nghề chỉ được vào kho mã ở dạng đã mã
   hoá. Bản nguồn (20 tệp JSON của 20 nhóm) KHÔNG nằm trong kho mã; gói mã
   hoá là bản lưu đi cùng kho mã, mật khẩu là bản lưu thứ hai nằm riêng (Drive
   của chủ hệ). Mất một trong hai thì còn bên kia — mất cả hai thì mất hẳn.

   Mật khẩu KHÔNG đi qua tham số dòng lệnh (ps aux đọc được tham số, shell ghi
   lịch sử): đọc từ biến môi trường GITA_MK_GOI hoặc tệp chỉ ra ở GITA_MK_TEP.

   Dùng:
     node tools/dong-goi-kho-van-de.mjs <thư-mục-nguồn>       đóng gói + tự mở lại để so
     node tools/dong-goi-kho-van-de.mjs --mo <thư-mục-ra>     mở gói ra 20 tệp JSON (khôi phục nguồn)

   Gói có định dạng giống bộ mở ở màn tra cứu (src/tra-cuu-giai-phap.js →
   moGoi): JSON {v, ban, n, salt, iv, ct}, ct = AES-GCM(gzip(JSON mảng)). */
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import crypto from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url)).replace(/[\\/]$/, '');
const GOI = path.join(ROOT, 'kho-van-de', 'goi.enc');
const NHOM = [];
for (const l of ['KH', 'NS']) for (const c of 'ABCDEFGHIJ') NHOM.push(l + '-' + c);
const VONG = 250000;

function matKhau() {
  let mk = process.env.GITA_MK_GOI || '';
  if (!mk && process.env.GITA_MK_TEP) mk = fs.readFileSync(process.env.GITA_MK_TEP, 'utf8').trim();
  if (mk.length < 12) { console.error('Thiếu mật khẩu: đặt GITA_MK_GOI (≥12 ký tự) hoặc GITA_MK_TEP.'); process.exit(2); }
  return mk;
}
const khoa = (mk, salt) => crypto.pbkdf2Sync(Buffer.from(mk, 'utf8'), salt, VONG, 32, 'sha256');

export function moGoiTep(mk, tep = GOI) {
  const g = JSON.parse(fs.readFileSync(tep, 'utf8'));
  const ct = Buffer.from(g.ct, 'base64'), iv = Buffer.from(g.iv, 'base64');
  const d = crypto.createDecipheriv('aes-256-gcm', crypto.pbkdf2Sync(Buffer.from(mk, 'utf8'), Buffer.from(g.salt, 'base64'), g.n, 32, 'sha256'), iv);
  d.setAuthTag(ct.subarray(ct.length - 16));
  const nen = Buffer.concat([d.update(ct.subarray(0, ct.length - 16)), d.final()]);
  return { ban: g.ban, ds: JSON.parse(zlib.gunzipSync(nen).toString('utf8')) };
}

async function dongGoi(nguon) {
  const { soatBanGhiKho } = await import(pathToFileURL(path.join(ROOT, 'may-chu', 'tra-cuu-giai-phap.js')).href);
  let ds = [];
  const loi = [];
  for (const n of NHOM) {
    const f = path.join(nguon, n + '.json');
    if (!fs.existsSync(f)) { loi.push('thiếu ' + n + '.json'); continue; }
    const a = JSON.parse(fs.readFileSync(f, 'utf8'));
    if (a.length !== 50) loi.push(n + ': ' + a.length + ' bản ghi (cần 50)');
    ds = ds.concat(a);
  }
  ds.forEach(r => { const l = soatBanGhiKho(r); if (l.length) loi.push(r.id + ': ' + l.join(',')); });
  const ids = ds.map(r => r.id);
  const trung = ids.filter((x, i) => ids.indexOf(x) !== i);
  if (trung.length) loi.push('trùng mã: ' + [...new Set(trung)].join(','));
  if (ds.length !== 1000) loi.push('tổng ' + ds.length + ' (cần 1000)');
  if (loi.length) { console.error('KHÔNG ĐÓNG GÓI:\n' + loi.slice(0, 40).join('\n')); process.exit(1); }

  const mk = matKhau();
  const ban = 'KVD-' + new Date().toISOString().slice(0, 10) + '-' + crypto.createHash('sha256').update(JSON.stringify(ds)).digest('hex').slice(0, 8);
  const salt = crypto.randomBytes(16), iv = crypto.randomBytes(12);
  const c = crypto.createCipheriv('aes-256-gcm', khoa(mk, salt), iv);
  const ct = Buffer.concat([c.update(zlib.gzipSync(Buffer.from(JSON.stringify(ds), 'utf8'), { level: 9 })), c.final(), c.getAuthTag()]);
  fs.mkdirSync(path.dirname(GOI), { recursive: true });
  const tam = GOI + '.tam';
  fs.writeFileSync(tam, JSON.stringify({ v: 1, ban, n: VONG, salt: salt.toString('base64'), iv: iv.toString('base64'), ct: ct.toString('base64') }));
  /* Tự kiểm ngay: đọc lại TỪ ĐĨA, mở bằng đúng mật khẩu, so từng bản ghi.
     Lệch thì xoá tệp tạm — một gói không mở lại được là một gói không có. */
  const mo = moGoiTep(mk, tam);
  if (JSON.stringify(mo.ds) !== JSON.stringify(ds)) { fs.unlinkSync(tam); console.error('Mở lại không khớp — đã xoá gói vừa ghi.'); process.exit(1); }
  let saiMk = false;
  try { moGoiTep(mk + 'x', tam); } catch (e) { saiMk = true; }
  if (!saiMk) { fs.unlinkSync(tam); console.error('Gói mở được bằng mật khẩu sai — đã xoá.'); process.exit(1); }
  fs.renameSync(tam, GOI);
  const dem = { kh: ds.filter(r => r.id.startsWith('KH')).length, ns: ds.filter(r => r.id.startsWith('NS')).length };
  console.log('✓ ' + path.relative(ROOT, GOI) + ' · ' + ban + ' · ' + dem.kh + ' khách hàng + ' + dem.ns + ' nội bộ · ' + Math.round(fs.statSync(GOI).size / 1024) + ' KB · mở lại khớp, sai mật khẩu bị từ chối');
}

function moRa(ra) {
  const { ban, ds } = moGoiTep(matKhau());
  fs.mkdirSync(ra, { recursive: true });
  for (const n of NHOM) fs.writeFileSync(path.join(ra, n + '.json'), JSON.stringify(ds.filter(r => r.id.startsWith(n + '-')), null, 1));
  console.log('✓ Đã mở ' + ban + ' ra ' + ra + ' (' + ds.length + ' vấn đề, 20 tệp).');
}

if (process.argv[2] === '--mo') moRa(process.argv[3] || 'kho-van-de-mo');
else if (process.argv[2]) await dongGoi(process.argv[2]);
else { console.log('Dùng: node tools/dong-goi-kho-van-de.mjs <thư-mục-nguồn> | --mo <thư-mục-ra>'); process.exit(2); }
