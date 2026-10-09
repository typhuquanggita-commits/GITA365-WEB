// Thử cửa liên hệ của trang công khai (may-chu/lien-he.js) qua worker.fetch thật.
// Chạy: node tools/thu-lien-he.mjs
//
// Vì sao có: tới 9/10/2026 form ở lien-he.html gửi tên + số điện thoại của
// cha mẹ sang formspree.io. Nay nó đi vào Worker của Học viện — bộ thử này
// đo HÀNH VI: thư tới đúng hòm chủ hệ, KHÔNG có dòng nào lưu nội dung,
// ô mồi chặn máy quét, trần nhịp theo IP, và trang không còn trỏ ra ngoài.
import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import { pathToFileURL, fileURLToPath } from 'node:url';
const ROOT = fileURLToPath(new URL('..', import.meta.url)).replace(/[\\/]$/, '');
const worker = (await import(pathToFileURL(ROOT + '/may-chu/worker.js').href)).default;
const { _xoaBoDem } = await import(pathToFileURL(ROOT + '/may-chu/ve-chi-phi.js').href);

const sq = new DatabaseSync(':memory:');
sq.exec(fs.readFileSync(ROOT + '/may-chu/csdl.sql', 'utf8'));
const db = { prepare(sql) { let a = []; const st = {
  bind(...x) { a = x; return st; },
  first() { return Promise.resolve(sq.prepare(sql).get(...a) || null); },
  all() { return Promise.resolve({ results: sq.prepare(sql).all(...a) }); },
  run() { const r = sq.prepare(sql).run(...a); return Promise.resolve({ meta: { changes: Number(r.changes) } }); } }; return st; },
  batch(ds) { return Promise.all(ds.map(s => s.run())); } };

const thu = [];
const env = { CSDL: db, GHI_THU: thu, GITA_THU_TRA_LOI: 'typhuquanggita@gmail.com' };
let sai = 0; const kiem = (t, d, ct) => { console.log((d ? '  ✓ ' : '  ✗ ') + t + (d || !ct ? '' : ' — ' + ct)); if (!d) sai++; };

async function gui(than, ip) {
  const r = await worker.fetch(new Request('https://gita365.example.workers.dev/', { method: 'POST',
    headers: { 'Content-Type': 'application/json', 'CF-Connecting-IP': ip || '203.0.113.7', Origin: 'https://gita365.pages.dev' },
    body: JSON.stringify({ fn: 'guiLienHe', ...than }) }), env, { waitUntil() {} });
  return r.json();
}
const HOP_LE = { name: 'Nguyễn Thị Hoa', phone: '0912 345 678', email: 'hoa@vi-du.test', topic: '90ngay',
  message: 'Con tôi 10 tuổi.\nTôi muốn hỏi về lộ trình.', website: '' };

console.error = () => {};
let r = await gui(HOP_LE);
kiem('Lượt hợp lệ → ok', r.ok === true, JSON.stringify(r));
kiem('Đúng một thư, tới đúng hòm chủ hệ', thu.length === 1 && thu[0].den === 'typhuquanggita@gmail.com', JSON.stringify(thu.map(t => t.den)));
kiem('Thư mang đủ tên · số điện thoại · lời nhắn (giữ xuống dòng)',
  /Nguyễn Thị Hoa/.test(thu[0].than) && /0912 345 678/.test(thu[0].than) && /10 tuổi\.\nTôi muốn/.test(thu[0].than));
kiem('Chủ đề dịch sang chữ người đọc', /Lộ trình 90 ngày/.test(thu[0].tieuDe));

/* KHÔNG LƯU: soát mọi bảng, không bảng nào được giữ tên hay số điện thoại. */
const bang = sq.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map(x => x.name);
const lo = [];
for (const b of bang) for (const dong of sq.prepare('SELECT * FROM "' + b + '"').all())
  if (/0912 345 678|Nguyễn Thị Hoa|hoa@vi-du/.test(JSON.stringify(dong))) lo.push(b);
kiem('Không bảng nào trong cơ sở dữ liệu giữ tên/số điện thoại', lo.length === 0, lo.join(','));
kiem('Nhật ký có một dòng "có lượt liên hệ" (không nội dung)',
  sq.prepare("SELECT COUNT(*) n FROM audit WHERE viec='LIEN_HE'").get().n === 1);

r = await gui({ ...HOP_LE, website: 'http://spam.example' }, '203.0.113.8');
kiem('Ô mồi điền → trả ok nhưng KHÔNG gửi thư', r.ok === true && thu.length === 1, String(thu.length));
r = await gui({ ...HOP_LE, phone: 'goi-toi-nhe' }, '203.0.113.9');
kiem('Số điện thoại hỏng → SDT', r.code === 'SDT', JSON.stringify(r));
r = await gui({ ...HOP_LE, email: 'khong-phai-email' }, '203.0.113.9');
kiem('Email hỏng → THU', r.code === 'THU', JSON.stringify(r));
r = await gui({ ...HOP_LE, message: '' }, '203.0.113.9');
kiem('Lời nhắn trống → LOI', r.code === 'LOI', JSON.stringify(r));
r = await gui({ ...HOP_LE, topic: '<script>', email: '' }, '203.0.113.10');
kiem('Chủ đề lạ → rơi về "Câu hỏi khác", email trống được', r.ok && /Câu hỏi khác/.test(thu[thu.length - 1].tieuDe), JSON.stringify(r));
r = await gui({ ...HOP_LE, den: 'nguoi-la@vi-du.test', to: 'nguoi-la@vi-du.test' }, '203.0.113.11');
kiem('Trình duyệt không đổi được người nhận', r.ok && thu[thu.length - 1].den === 'typhuquanggita@gmail.com');

/* Trần nhịp D1: 3 lượt/giờ/IP. Xoá bộ đếm trong bộ nhớ để chắc là D1 chặn. */
const ip = '198.51.100.20';
for (let i = 0; i < 3; i++) { _xoaBoDem(); await gui(HOP_LE, ip); }
_xoaBoDem();
r = await gui(HOP_LE, ip);
kiem('Lượt thứ tư trong một giờ cùng IP → NHIP (đếm trên D1, không chỉ bộ nhớ)', r.code === 'NHIP', JSON.stringify(r));

/* Gửi hỏng phải nói thật. */
const envHong = { CSDL: db, GITA_THU_TRA_LOI: 'typhuquanggita@gmail.com' };
_xoaBoDem();
const rh = await (await worker.fetch(new Request('https://x.example/', { method: 'POST',
  headers: { 'Content-Type': 'application/json', 'CF-Connecting-IP': '198.51.100.99' },
  body: JSON.stringify({ fn: 'guiLienHe', ...HOP_LE }) }), envHong, { waitUntil() {} })).json();
kiem('Không có đường gửi thư → GUIHONG kèm số hotline, không báo "đã nhận"', rh.ok === false && rh.code === 'GUIHONG' && /08\.5555\.4688/.test(rh.error), JSON.stringify(rh));

/* Trang không còn gửi dữ liệu ra dịch vụ ngoài. */
const trang = fs.readFileSync(ROOT + '/lien-he.html', 'utf8');
kiem('lien-he.html không còn trỏ formspree', !/formspree/i.test(trang));
kiem('Form trỏ về Worker của Học viện', /data-may-chu="https:\/\/gita365\.typhuquanggita\.workers\.dev\/"/.test(trang));
kiem('Form có ô mồi "website" ẩn', /name="website"/.test(trang));
const js = fs.readFileSync(ROOT + '/assets/marketing-shared.js', 'utf8');
kiem('marketing-shared.js gửi fn guiLienHe dạng JSON', /guiLienHe/.test(js) && /application\/json/.test(js));

console.log(sai ? `\n✗ ${sai} phép đo sai` : '\n✓ Cửa liên hệ: thư tới hòm chủ hệ, không lưu, không ra dịch vụ ngoài');
process.exit(sai ? 1 : 0);
