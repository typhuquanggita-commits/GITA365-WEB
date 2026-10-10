/* Đóng gói Kho vấn đề CẤP CAO (6 hạng) thành kho-cao/goi.enc (AES-256-GCM).

   Cùng định dạng và cùng luật với tools/dong-goi-kho-van-de.mjs: kho mã là
   công khai nên nội dung nghề chỉ vào kho mã ở dạng đã mã hoá; mật khẩu là
   bản lưu thứ hai nằm riêng (Drive của chủ hệ), KHÁC mật khẩu gói kho 1000
   — lộ một gói không mở được gói kia.

   Nguồn: một thư mục chứa các tệp <NHÓM>.json (C4-A … C5-J, sau này V1-A …),
   mỗi tệp đúng 100 bản ghi mang mã của chính nhóm ấy. Gói gồm mọi nhóm có
   mặt — đợt 1 là Coach (C4, C5), đợt 2 thêm Tư vấn (V1–V3).

   Mật khẩu KHÔNG qua tham số dòng lệnh: GITA_MK_GOI hoặc tệp ở GITA_MK_TEP.

   Dùng:
     node tools/dong-goi-kho-cao.mjs <thư-mục-nguồn>     đóng gói + tự mở lại để so
     node tools/dong-goi-kho-cao.mjs --mo <thư-mục-ra>   mở gói ra từng nhóm (khôi phục nguồn) */
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import crypto from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url)).replace(/[\\/]$/, '');
const GOI = path.join(ROOT, 'kho-cao', 'goi.enc');
const TEP_NHOM = /^((C[45]|V[123])-[A-J])\.json$/;
const VONG = 250000;

function matKhau() {
  let mk = process.env.GITA_MK_GOI || '';
  if (!mk && process.env.GITA_MK_TEP) mk = fs.readFileSync(process.env.GITA_MK_TEP, 'utf8').trim();
  if (mk.length < 12) { console.error('Thiếu mật khẩu: đặt GITA_MK_GOI (≥12 ký tự) hoặc GITA_MK_TEP.'); process.exit(2); }
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
  const { soatBanGhiCao, HANG } = await import(pathToFileURL(path.join(ROOT, 'may-chu', 'kho-cao.js')).href);
  const tep = fs.readdirSync(nguon).filter(f => TEP_NHOM.test(f)).sort();
  if (!tep.length) { console.error('Thư mục nguồn không có tệp nhóm nào (C4-A.json …).'); process.exit(1); }
  let ds = []; const loi = [];
  for (const f of tep) {
    const nhom = TEP_NHOM.exec(f)[1];
    const a = JSON.parse(fs.readFileSync(path.join(nguon, f), 'utf8'));
    if (a.length !== 100) loi.push(nhom + ': ' + a.length + ' bản ghi (cần 100)');
    a.forEach(r => { if (!String(r.id || '').startsWith(nhom + '-')) loi.push(r.id + ': không thuộc nhóm ' + nhom); });
    ds = ds.concat(a);
  }
  ds.forEach(r => { const l = soatBanGhiCao(r); if (l.length) loi.push(r.id + ': ' + l.join(',')); });
  const ids = ds.map(r => r.id), trung = ids.filter((x, i) => ids.indexOf(x) !== i);
  if (trung.length) loi.push('trùng mã: ' + [...new Set(trung)].join(','));
  if (loi.length) { console.error('KHÔNG ĐÓNG GÓI:\n' + loi.slice(0, 40).join('\n')); process.exit(1); }

  const mk = matKhau();
  const ban = 'KC-' + new Date().toISOString().slice(0, 10) + '-' + crypto.createHash('sha256').update(JSON.stringify(ds)).digest('hex').slice(0, 8);
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
  const dem = {}; HANG.forEach(h => { dem[h] = ds.filter(r => r.hang === h).length; });
  console.log('✓ ' + path.relative(ROOT, GOI) + ' · ' + ban + ' · ' + ds.length + ' vấn đề · ' + tep.length + ' nhóm · ' +
    HANG.map(h => h + ' ' + dem[h]).join(' · ') + ' · ' + Math.round(fs.statSync(GOI).size / 1024) + ' KB · mở lại khớp, sai mật khẩu bị từ chối');
}

function moRa(ra) {
  const { ban, ds } = moGoiTep(matKhau());
  fs.mkdirSync(ra, { recursive: true });
  const nhom = [...new Set(ds.map(r => r.id.slice(0, 4)))];
  for (const n of nhom) fs.writeFileSync(path.join(ra, n + '.json'), JSON.stringify(ds.filter(r => r.id.startsWith(n + '-')), null, 1));
  console.log('✓ Đã mở ' + ban + ' ra ' + ra + ' (' + ds.length + ' vấn đề, ' + nhom.length + ' tệp).');
}

/* Chỉ chạy dòng lệnh khi được gọi trực tiếp — bộ thử import moGoiTep. */
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  if (process.argv[2] === '--mo') moRa(process.argv[3] || 'kho-cao-mo');
  else if (process.argv[2]) await dongGoi(process.argv[2]);
  else { console.log('Dùng: node tools/dong-goi-kho-cao.mjs <thư-mục-nguồn> | --mo <thư-mục-ra>'); process.exit(2); }
}
