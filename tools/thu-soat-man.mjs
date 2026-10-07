/* Thử SOÁT TOÀN BỘ MÀN — báo cáo chỉ đi ra ngoài ở dạng BẢN MÃ.
   Chứng minh:
     · khoá công khai trong app là RSA-3072 SPKI hợp lệ, dấu vân tay khớp
     · mã hoá trong app (WebCrypto: gzip → AES-256-GCM, khoá bọc RSA-OAEP)
       giải lại ĐÚNG từng byte bằng khoá riêng (cặp khoá thử sinh tại chỗ)
     · bản app sinh ra lọt khuôn bản mã của máy chủ; dữ liệu đọc được thì bị
       từ chối (gói JSON thường, thêm trường, sai độ dài khoá, quá trần)
     · chỉ R01 gửi; giữ 3 bản mới nhất; cửa công khai chỉ trả bản mã mới
       nhất, KHÔNG trả tên người gửi; quá 14 ngày thì tự xoá
   Dùng: node tools/thu-soat-man.mjs   (Node >= 22.5) */
import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import vm from 'node:vm';
import crypto from 'node:crypto';
import zlib from 'node:zlib';
import { pathToFileURL, fileURLToPath } from 'node:url';
const ROOT = process.argv[2] || fileURLToPath(new URL('..', import.meta.url)).replace(/[\\/]$/, '');
const M = await import(pathToFileURL(ROOT + '/may-chu/soat-man.js').href);

const sq = new DatabaseSync(':memory:');
sq.exec(fs.readFileSync(ROOT + '/may-chu/csdl.sql', 'utf8'));
const db = { prepare(sql) { let a = []; const st = {
  bind(...x) { a = x; return st; },
  first() { return Promise.resolve(sq.prepare(sql).get(...a) || null); },
  all() { return Promise.resolve({ results: sq.prepare(sql).all(...a) }); },
  run() { const r = sq.prepare(sql).run(...a); return Promise.resolve({ meta: { changes: Number(r.changes) } }); } }; return st; } };
let dat = 0, truot = 0;
const kiem = (ten, dk) => { if (dk) { dat++; console.log('OK  ' + ten); } else { truot++; console.log('SAI ' + ten); } };

/* ── khoá công khai trong app ── */
const G = { VIEWS: {}, U: { h: s => String(s), ic: () => '', ph: () => '', lockCard: () => '', toast() {} } };
const ctx = { window: { G }, G, console, document: { addEventListener() {} }, crypto: globalThis.crypto, TextEncoder, CompressionStream,
  Blob, Response, btoa, atob, Uint8Array, Promise, JSON };
vm.createContext(ctx);
for (const f of ['src/khoa-soat.js', 'src/soat-toan-man.js']) vm.runInContext(fs.readFileSync(ROOT + '/' + f, 'utf8'), ctx, { filename: f });
const der = Buffer.from(G.KHOA_SOAT.pub, 'base64');
const pk = crypto.createPublicKey({ key: der, format: 'der', type: 'spki' });
kiem('khoá công khai: RSA 3072 bit, SPKI hợp lệ', pk.asymmetricKeyType === 'rsa' && pk.asymmetricKeyDetails.modulusLength === 3072);
kiem('dấu vân tay khớp 8 byte đầu SHA-256 của khoá', crypto.createHash('sha256').update(der).digest('hex').slice(0, 16) === G.KHOA_SOAT.dauVan);
kiem('kho mã không chứa khoá riêng nào', !/PRIVATE KEY/.test(fs.readFileSync(ROOT + '/src/khoa-soat.js', 'utf8')));

/* ── mã hoá trong app ↔ giải bằng khoá riêng (cặp khoá thử) ── */
const cap = crypto.generateKeyPairSync('rsa', { modulusLength: 3072 });
const khoaThu = { dauVan: crypto.createHash('sha256').update(cap.publicKey.export({ type: 'spki', format: 'der' })).digest('hex').slice(0, 16),
  pub: cap.publicKey.export({ type: 'spki', format: 'der' }).toString('base64') };
function giai(goi, rieng) {
  const aes = crypto.privateDecrypt({ key: rieng, padding: crypto.constants.RSA_PKCS1_OAEP_PADDING, oaepHash: 'sha256' }, Buffer.from(goi.k, 'base64'));
  const d = Buffer.from(goi.d, 'base64'), iv = Buffer.from(goi.iv, 'base64');
  const de = crypto.createDecipheriv('aes-256-gcm', aes, iv); de.setAuthTag(d.subarray(d.length - 16));
  let raw = Buffer.concat([de.update(d.subarray(0, d.length - 16)), de.final()]);
  if (goi.z === 1) raw = zlib.gunzipSync(raw);
  return JSON.parse(raw.toString('utf8'));
}
const baoCao = { phienBan: 'SOAT-2026.10-a', man: Array.from({ length: 270 }, (_, i) => ({ v: 'man-' + i, t: 'Màn số ' + i + ' — tiếng Việt có dấu', dai: i * 7, dau: ['Tiêu đề ' + i], chu: 'Nội dung '.repeat(150) })) };
const goi = await G.soatMaHoa(baoCao, khoaThu);
kiem('app mã hoá được báo cáo 270 màn (nén gzip)', goi && goi.v === 1 && goi.z === 1 && goi.dv === khoaThu.dauVan);
kiem('giải bằng khoá riêng → đúng nguyên báo cáo', JSON.stringify(giai(goi, cap.privateKey)) === JSON.stringify(baoCao));
kiem('bản mã không lộ chữ nào của báo cáo', !/Màn số|man-1|Nội dung/.test(JSON.stringify(goi)));
const khac = crypto.generateKeyPairSync('rsa', { modulusLength: 3072 });
let moDuoc = true; try { giai(goi, khac.privateKey); } catch (e) { moDuoc = false; }
kiem('khoá riêng khác không giải được', !moDuoc);
const sua = Object.assign({}, goi, { d: Buffer.from(Buffer.from(goi.d, 'base64').map((b, i) => i === 5 ? b ^ 1 : b)).toString('base64') });
let suaDuoc = true; try { giai(sua, cap.privateKey); } catch (e) { suaDuoc = false; }
kiem('sửa một bit bản mã → bị phát hiện (GCM), không giải ra rác', !suaDuoc);

/* ── máy chủ ── */
const ho = (u, role) => ({ u, uid: u, role });
const than = JSON.stringify(goi);
kiem('khuôn bản mã: bản app sinh ra lọt khuôn', M.laBanMa(goi));
kiem('R02 không gửi được', (await M.ghiSoatMan({ goi: than, so: 270 }, {}, db, ho('ad', 'R02'))).code === 'NOPERM');
kiem('từ chối gói đọc được (JSON báo cáo thường)', !(await M.ghiSoatMan({ goi: JSON.stringify(baoCao), so: 270 }, {}, db, ho('chu', 'R01'))).ok);
kiem('từ chối gói có thêm trường', !(await M.ghiSoatMan({ goi: JSON.stringify(Object.assign({ ghiChu: 'x' }, goi)), so: 1 }, {}, db, ho('chu', 'R01'))).ok);
kiem('từ chối khoá bọc sai độ dài', !(await M.ghiSoatMan({ goi: JSON.stringify(Object.assign({}, goi, { k: goi.k.slice(4) })), so: 1 }, {}, db, ho('chu', 'R01'))).ok);
kiem('từ chối vượt trần', !(await M.ghiSoatMan({ goi: 'x'.repeat(1800001), so: 1 }, {}, db, ho('chu', 'R01'))).ok);
kiem('chưa có báo cáo → cửa công khai trả "trống"', (await M.layBaoCaoSoat({}, {}, db)).trong === true);
let cuoi;
for (let i = 0; i < 5; i++) { cuoi = await M.ghiSoatMan({ goi: than, so: 270 + i }, {}, db, ho('chu', 'R01')); await new Promise(r => setTimeout(r, 3)); }
kiem('R01 gửi được; ghi nhật ký', cuoi.ok && Number(sq.prepare("SELECT COUNT(*) n FROM audit WHERE viec = 'SOAT_TOAN_MAN'").get().n) === 5);
kiem('chỉ giữ 3 bản mới nhất', Number(sq.prepare('SELECT COUNT(*) n FROM soatMan').get().n) === 3);
const lay = await M.layBaoCaoSoat({}, {}, db);
kiem('cửa công khai trả bản mới nhất (274 màn), đúng bản mã, không tên người gửi', lay.ok && lay.so === 274 && lay.goi === than && !('u' in lay) && !JSON.stringify(lay).includes('chu'));
sq.prepare("UPDATE soatMan SET luc = '2020-01-01T00:00:00.000Z'").run();
kiem('quá 14 ngày → tự xoá, cửa trả "trống"', (await M.layBaoCaoSoat({}, {}, db)).trong === true && Number(sq.prepare('SELECT COUNT(*) n FROM soatMan').get().n) === 0);

const wf = fs.readFileSync(ROOT + '/.github/workflows/lay-bao-cao-soat.yml', 'utf8');
kiem('workflow không dùng secret, kiểm khuôn bản mã trước khi đẩy', !/secrets\./.test(wf) && /d,dv,iv,k,v,z/.test(wf));
const day = [...wf.matchAll(/git push[^\n]*/g)].map(m => m[0]);
kiem('workflow chỉ đẩy vào nhánh dữ liệu bao-cao-soat, không chạm main', day.length === 1 && /bao-cao-soat$/.test(day[0].trim()) && !/\bmain\b/.test(day[0]));

console.log('\n' + dat + ' đạt · ' + truot + ' sai');
process.exit(truot ? 1 : 0);
