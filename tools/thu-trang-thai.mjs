/* Thử trang trạng thái công khai — D1 giả. Chứng minh: không cần phiên ·
   chỉ tổng hợp số · không lộ dữ liệu cá nhân · sống khi có bảng.
   Dùng: node tools/thu-trang-thai.mjs   (Node >= 22.5) */
import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import { pathToFileURL, fileURLToPath } from 'node:url';
const ROOT = process.argv[2] || fileURLToPath(new URL('..', import.meta.url)).replace(/[\\/]$/, '');
const { trangThaiCongKhai } = await import(pathToFileURL(ROOT + '/may-chu/trang-thai.js').href);

const sq = new DatabaseSync(':memory:');
sq.exec(fs.readFileSync(ROOT + '/may-chu/csdl.sql', 'utf8'));
const db = {
  prepare(sql) { let a = []; const st = {
    bind(...x) { a = x; return st; },
    first() { return Promise.resolve(sq.prepare(sql).get(...a) || null); },
    all() { return Promise.resolve({ results: sq.prepare(sql).all(...a) }); },
    run() { const r = sq.prepare(sql).run(...a); return Promise.resolve({ meta: { changes: Number(r.changes) } }); } }; return st; },
  async batch(ds) { for (const s of ds) await s.run(); }
};
let dat = 0, truot = 0;
const kiem = (ten, dk) => { if (dk) { dat++; console.log('OK  ' + ten); } else { truot++; console.log('SAI ' + ten); } };

/* KHÔNG có phiên, KHÔNG có hoSo — cửa phải vẫn trả lời. */
const r = await trangThaiCongKhai({}, {}, db);
kiem('không cần phiên vẫn trả lời được', r.ok === true && r.he.song === true);
kiem('chỉ tổng hợp số: có giờ, có nhịp tự soát (hoặc null)', !!r.luc && 'tuSoatGanNhat' in r.he);
kiem('không lộ bảng người dùng: không trường users/hoSoKhach trong kết quả',
  !/users|hoSoKhach|username|hoTen/i.test(JSON.stringify(r)));

/* Gieo một nhịp và vài lượt lọc hôm nay rồi đo lại. */
const hn = new Date().toISOString().slice(0, 10);
sq.prepare("INSERT INTO nhipDaTri (viec, luc) VALUES ('vongKhoaHoc', ?)").run(Date.now() - 3600e3);
sq.prepare("INSERT INTO soLocDaTri (ngay, cua, luot) VALUES (?, 'dem', 7), (?, 'kho', 3)").run(hn, hn);
sq.prepare("INSERT INTO audit (id, luc, uid, username, viec) VALUES ('A1', ?, 'MAY', 'may', 'TU_SOAT')").run(new Date().toISOString());
const r2 = await trangThaiCongKhai({}, {}, db);
kiem('đếm lượt lọc 0 token hôm nay (7+3=10)', r2.he.soLuotLocTruocTokenHomNay === 10);
kiem('đếm lượt ghi sổ hôm nay (1)', r2.he.soLuotGhiSoHomNay === 1);
kiem('báo giờ tự soát gần nhất dạng ISO', typeof r2.he.tuSoatGanNhat === 'string' && r2.he.tuSoatGanNhat.includes('T'));

/* Khi bảng vắng (lỗi D1 giả lập bằng db hỏng) thì vẫn trả ok với null. */
const dbHong = { prepare() { throw new Error('D1 hong'); } };
const r3 = await trangThaiCongKhai({}, {}, dbHong);
kiem('D1 hỏng vẫn trả ok với số null (không sập)', r3.ok === true && r3.he.song === true);

console.log(`\n${dat} đạt · ${truot} sai`);
process.exit(truot ? 1 : 0);
