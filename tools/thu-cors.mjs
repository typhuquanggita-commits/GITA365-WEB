#!/usr/bin/env node
/* GITA 365 — THỬ CORS CỦA WORKER
     node tools/thu-cors.mjs
   Giả lập Request với các Origin khác nhau, gọi thẳng worker.fetch() và
   đối chiếu Access-Control-Allow-Origin. GITA_DIA_CHI_WEB lấy từ wrangler.toml. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const worker = (await import(pathToFileURL(path.join(ROOT, 'may-chu', 'worker.js')).href)).default;
const toml = fs.readFileSync(path.join(ROOT, 'may-chu', 'wrangler.toml'), 'utf8');
const DS = (toml.match(/^\s*GITA_DIA_CHI_WEB\s*=\s*"([^"]*)"/m) || [])[1] || '';

let loi = 0;
function kiem(ten, dung) { console.log((dung ? '  ✓ ' : '  ✗ ') + ten); if (!dung) loi++; }

async function goi(env, method, origin) {
  const headers = origin === undefined ? {} : {Origin: origin};
  const res = await worker.fetch(new Request('https://gita365.example.workers.dev/', {method, headers}), env);
  return {acao: res.headers.get('Access-Control-Allow-Origin'), vary: res.headers.get('Vary'), status: res.status};
}

const env = {GITA_DIA_CHI_WEB: DS};
const dau = DS.split(',')[0].trim();
console.log('GITA_DIA_CHI_WEB = ' + DS);

for (const o of ['https://gita.edu.vn', 'https://www.gita.edu.vn', 'https://gita365.pages.dev']) {
  for (const m of ['GET', 'OPTIONS']) {
    const r = await goi(env, m, o);
    kiem(m + ' ' + o + ' → ' + r.acao, r.acao === o && /Origin/.test(r.vary || ''));
  }
}
for (const o of ['https://ke-la.example', 'null', undefined]) {
  const r = await goi(env, 'OPTIONS', o);
  kiem('OPTIONS ' + o + ' → ' + r.acao + ' (không mở cho origin lạ)', r.acao === dau && r.acao !== 'null');
}
const r1 = await goi({GITA_DIA_CHI_WEB: 'null, https://a.example/'}, 'GET', 'null');
kiem('origin "null" trong biến bị bỏ qua → ' + r1.acao, r1.acao === 'https://a.example');
const r2 = await goi({}, 'GET', 'https://bat-ky.example');
kiem('biến trống → ' + r2.acao, r2.acao === '*');
const r3 = await goi(env, 'PUT', 'https://www.gita.edu.vn');
kiem('405 cũng mang CORS đúng origin → ' + r3.acao, r3.status === 405 && r3.acao === 'https://www.gita.edu.vn');

const cname = fs.readFileSync(path.join(ROOT, 'CNAME'), 'utf8').trim();
kiem('CNAME https://' + cname + ' nằm trong GITA_DIA_CHI_WEB', DS.split(',').map(s => s.trim()).includes('https://' + cname));

console.log(loi ? '\nCÓ ' + loi + ' LỖI.' : '\nCORS ĐÚNG.');
process.exit(loi ? 1 : 0);
