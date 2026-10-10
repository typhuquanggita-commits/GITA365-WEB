/* Đóng gói kho Ngôi nhà thịnh vượng (cẩm nang ba cấp + nhiệm vụ) thành
   kho-nha/goi.enc (AES-256-GCM, PBKDF2-SHA256).

   Cùng định dạng với kho-cao/goi.enc để màn hình mở bằng cùng một hàm:
   kho mã là công khai, nên nội dung kho Coach chỉ vào kho mã ở dạng mã
   hoá. Mật khẩu là bản lưu thứ hai nằm riêng (Drive của chủ hệ) và KHÁC
   mật khẩu các gói khác — lộ một gói không mở được gói kia.

   Nguồn: thư mục chứa CN-<ô>.json (đã ghép bởi tools/soat-kho-nha.mjs) và
   NV-<ô>-<nn>.json. Mọi bản ghi phải qua đúng bộ soát của máy chủ; một bản
   hỏng thì KHÔNG đóng gói gì cả.

   Mật khẩu KHÔNG qua tham số dòng lệnh: GITA_MK_GOI hoặc tệp GITA_MK_TEP.

   Dùng:
     node tools/dong-goi-kho-nha.mjs <thư-mục-nguồn>     đóng gói + tự mở lại để so
     node tools/dong-goi-kho-nha.mjs --mo <thư-mục-ra>   mở gói ra (khôi phục nguồn) */
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import crypto from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url)).replace(/[\\/]$/, '');
const GOI = path.join(ROOT, 'kho-nha', 'goi.enc');
const VONG = 250000;

function matKhau() {
  let mk = process.env.GITA_MK_GOI || '';
  if (!mk && process.env.GITA_MK_TEP) mk = fs.readFileSync(process.env.GITA_MK_TEP, 'utf8').trim();
  if (mk.length < 16) { console.error('Thiếu mật khẩu: đặt GITA_MK_GOI (≥16 ký tự) hoặc GITA_MK_TEP.'); process.exit(2); }
  return mk;
}
export function moGoiTep(mk, tep = GOI) {
  const g = JSON.parse(fs.readFileSync(tep, 'utf8'));
  const ct = Buffer.from(g.ct, 'base64'), iv = Buffer.from(g.iv, 'base64');
  const d = crypto.createDecipheriv('aes-256-gcm', crypto.pbkdf2Sync(Buffer.from(mk, 'utf8'), Buffer.from(g.salt, 'base64'), g.n, 32, 'sha256'), iv);
  d.setAuthTag(ct.subarray(ct.length - 16));
  const nen = Buffer.concat([d.update(ct.subarray(0, ct.length - 16)), d.final()]);
  return { ban: g.ban, ds: JSON.parse(zlib.gunzipSync(nen).toString('utf8')) };
}

async function dongGoi(nguon) {
  const K = await import(pathToFileURL(path.join(ROOT, 'may-chu', 'kho-nhiem-vu.js')).href);
  if (path.resolve(nguon).startsWith(ROOT + path.sep)) { console.error('Thư mục nguồn nằm TRONG kho mã — nội dung chữ trần không được ở đây.'); process.exit(1); }
  const tep = fs.readdirSync(nguon).sort();
  const cn = tep.filter(f => /^CN-[A-Z0-9]+\.json$/.test(f)).map(f => JSON.parse(fs.readFileSync(path.join(nguon, f), 'utf8')));
  const nv = tep.filter(f => /^NV-.+\.json$/.test(f)).map(f => JSON.parse(fs.readFileSync(path.join(nguon, f), 'utf8')));
  if (!cn.length && !nv.length) { console.error('Thư mục nguồn không có CN-*.json hay NV-*.json.'); process.exit(1); }
  const loi = [];
  cn.forEach(r => { const l = K.soatCamNang(r); if (l.length) loi.push(r.id + ': ' + l.slice(0, 5).join(', ')); });
  nv.forEach(r => { const l = K.soatNhiemVu(r); if (l.length) loi.push(r.id + ': ' + l.slice(0, 5).join(', ')); });
  const ids = cn.map(r => r.id).concat(nv.map(r => r.id)), trung = ids.filter((x, i) => ids.indexOf(x) !== i);
  if (trung.length) loi.push('trùng mã: ' + [...new Set(trung)].join(','));
  if (loi.length) { console.error('KHÔNG ĐÓNG GÓI:\n' + loi.slice(0, 40).join('\n')); process.exit(1); }

  const ds = { cn, nv };
  const mk = matKhau();
  const ban = 'KN-' + new Date().toISOString().slice(0, 10) + '-' + crypto.createHash('sha256').update(JSON.stringify(ds)).digest('hex').slice(0, 8);
  const salt = crypto.randomBytes(16), iv = crypto.randomBytes(12);
  const c = crypto.createCipheriv('aes-256-gcm', crypto.pbkdf2Sync(Buffer.from(mk, 'utf8'), salt, VONG, 32, 'sha256'), iv);
  const ct = Buffer.concat([c.update(zlib.gzipSync(Buffer.from(JSON.stringify(ds), 'utf8'), { level: 9 })), c.final(), c.getAuthTag()]);
  fs.mkdirSync(path.dirname(GOI), { recursive: true });
  const tam = GOI + '.tam';
  fs.writeFileSync(tam, JSON.stringify({ v: 1, ban, n: VONG, salt: salt.toString('base64'), iv: iv.toString('base64'), ct: ct.toString('base64') }));
  const mo = moGoiTep(mk, tam);
  if (JSON.stringify(mo.ds) !== JSON.stringify(ds)) { fs.unlinkSync(tam); console.error('Mở lại không khớp — đã xoá gói vừa ghi.'); process.exit(1); }
  let saiMk = false;
  try { moGoiTep(mk + 'x', tam); } catch (e) { saiMk = true; }
  if (!saiMk) { fs.unlinkSync(tam); console.error('Gói mở được bằng mật khẩu sai — đã xoá.'); process.exit(1); }
  fs.renameSync(tam, GOI);
  const chu = JSON.stringify(cn).length + JSON.stringify(nv).length;
  console.log('✓ ' + path.relative(ROOT, GOI) + ' · ' + ban + ' · ' + cn.length + ' cẩm nang · ' + nv.length + ' nhiệm vụ · ~' +
    Math.round(chu / 2500) + ' trang · ' + Math.round(fs.statSync(GOI).size / 1024) + ' KB · mở lại khớp, sai mật khẩu bị từ chối');
}

function moRa(ra) {
  const { ban, ds } = moGoiTep(matKhau());
  if (path.resolve(ra).startsWith(ROOT + path.sep)) { console.error('Không mở gói ra TRONG kho mã.'); process.exit(1); }
  fs.mkdirSync(ra, { recursive: true });
  ds.cn.forEach(r => fs.writeFileSync(path.join(ra, r.id + '.json'), JSON.stringify(r, null, 1)));
  ds.nv.forEach(r => fs.writeFileSync(path.join(ra, r.id + '.json'), JSON.stringify(r, null, 1)));
  console.log('✓ Đã mở ' + ban + ' ra ' + ra + ' (' + ds.cn.length + ' cẩm nang, ' + ds.nv.length + ' nhiệm vụ).');
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  if (process.argv[2] === '--mo') moRa(process.argv[3] || '');
  else if (process.argv[2]) await dongGoi(process.argv[2]);
  else { console.log('Dùng: node tools/dong-goi-kho-nha.mjs <thư-mục-nguồn> | --mo <thư-mục-ra>'); process.exit(2); }
}
