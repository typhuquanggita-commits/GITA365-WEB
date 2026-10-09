// Thử phần đo hành vi khách trên trang công khai (may-chu/do-trang.js) qua
// worker.fetch thật, cộng soát tĩnh năm trang giới thiệu.
// Chạy: node tools/thu-do-trang.mjs
//
// Vì sao có: chủ hệ cần biết khách làm gì trên trang (xem trang nào, bấm nút
// nào, có điền form không) — mà không đưa hành vi từng phụ huynh cho một dịch
// vụ đo bên ngoài, và không giữ gì nhận ra được một người.
import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import { pathToFileURL, fileURLToPath } from 'node:url';
const ROOT = fileURLToPath(new URL('..', import.meta.url)).replace(/[\\/]$/, '');
const worker = (await import(pathToFileURL(ROOT + '/may-chu/worker.js').href)).default;
const { donDep } = await import(pathToFileURL(ROOT + '/may-chu/worker.js').href);
const { docDoTrang } = await import(pathToFileURL(ROOT + '/may-chu/do-trang.js').href);

const sq = new DatabaseSync(':memory:');
sq.exec(fs.readFileSync(ROOT + '/may-chu/csdl.sql', 'utf8'));
const db = { prepare(sql) { let a = []; const st = {
  bind(...x) { a = x; return st; },
  first() { return Promise.resolve(sq.prepare(sql).get(...a) || null); },
  all() { return Promise.resolve({ results: sq.prepare(sql).all(...a) }); },
  run() { const r = sq.prepare(sql).run(...a); return Promise.resolve({ meta: { changes: Number(r.changes) } }); } }; return st; } };
const env = { CSDL: db };
let sai = 0; const kiem = (t, d, ct) => { console.log((d ? '  ✓ ' : '  ✗ ') + t + (d || !ct ? '' : ' — ' + ct)); if (!d) sai++; };

async function gui(o, ip) {
  const r = await worker.fetch(new Request('https://gita365.example.workers.dev/', { method: 'POST',
    headers: { 'Content-Type': 'text/plain', 'CF-Connecting-IP': ip || '203.0.113.50', Origin: 'https://gita365.pages.dev' },
    body: JSON.stringify({ fn: 'ghiLuotTrang', ...o }) }), env, { waitUntil() {} });
  return r.json();
}
const dem = (w) => sq.prepare('SELECT COALESCE(SUM(dem),0) n FROM doTrang WHERE ' + w).get().n;

console.error = () => {};
let r = await gui({ trang: 'landing', su: 'phienMoi', nguon: 'facebook', may: 'dt' });
kiem('Không cần phiên đăng nhập: một tín hiệu hợp lệ → ok', r.ok === true, JSON.stringify(r));
await gui({ trang: 'landing', su: 'xem', nguon: 'facebook', may: 'dt' });
await gui({ trang: 'landing', su: 'xem', nguon: 'facebook', may: 'dt' });
kiem('Cùng một ô thì cộng dồn, không mọc thêm dòng', dem("su='xem'") === 2 &&
  sq.prepare("SELECT COUNT(*) n FROM doTrang WHERE su='xem'").get().n === 1);
await gui({ trang: 'landing', su: 'bamCta', nhan: 'hero-dang-ky', nguon: 'google', may: 'may' });
await gui({ trang: 'lien-he', su: 'moForm', nguon: 'facebook', may: 'dt' });
await gui({ trang: 'lien-he', su: 'guiFormOk', nguon: 'facebook', may: 'dt' });

r = await gui({ trang: 'landing', su: '<script>alert(1)</script>' });
kiem('Việc lạ → bị từ chối, không ghi', r.ok === false && dem("su LIKE '%script%'") === 0, JSON.stringify(r));
await gui({ trang: '../../etc', su: 'xem', nhan: '<img src=x onerror=alert(1)>', nguon: 'trang-la.example', may: 'tivi' });
const la = sq.prepare("SELECT * FROM doTrang WHERE trang='khac'").get();
kiem('Trang · nhãn · nguồn · máy lạ → rơi về giá trị an toàn, không chữ tự do nào vào bảng',
  !!la && la.nhan === '' && la.nguon === 'khac' && la.may === 'may', JSON.stringify(la));

const cot = sq.prepare('PRAGMA table_info(doTrang)').all().map(x => x.name);
kiem('Bảng không có cột nào nhận ra được người (IP, cookie, mã người xem, tác nhân trình duyệt)',
  !cot.some(c => /ip|cookie|uid|user|agent|phien|ten|sdt|email/i.test(c)), cot.join(','));
const tatCa = JSON.stringify(sq.prepare('SELECT * FROM doTrang').all());
kiem('Không lưu địa chỉ IP của người gửi ở đâu trong bảng', !/203\.0\.113\.50/.test(tatCa));

const khach = await docDoTrang({}, env, db, { role: 'R13', u: 'phuhuynh' });
kiem('Phụ huynh (R13) không đọc được số đo', khach.ok === false && khach.code === 'NOPERM');
const coach = await docDoTrang({}, env, db, { role: 'R07', u: 'coach' });
kiem('Coach (R07) không đọc được số đo', coach.ok === false);
const sa = await docDoTrang({ soNgay: 30 }, env, db, { role: 'R01', u: 'sa' });
kiem('Super Admin đọc được: lượt ghé thăm · lượt xem · phễu', sa.ok && sa.tong.phien === 1 && sa.tong.xem === 3 &&
  sa.pheu.map(x => x.n).join() === '1,1,1,1', JSON.stringify(sa.pheu));
kiem('Tỷ lệ chuyển đổi = gửi form / lượt ghé thăm', sa.tyLeChuyenDoi === 100, String(sa.tyLeChuyenDoi));
kiem('Nguồn khách và nút được bấm có tên đúng', sa.theoNguon.some(x => x.k === 'facebook') && sa.nutBam.some(x => x.k === 'hero-dang-ky'));
sq.prepare('DELETE FROM doTrang').run();
const rong = await docDoTrang({}, env, db, { role: 'R01', u: 'sa' });
kiem('Chưa có lượt ghé thăm → tỷ lệ BỎ TRỐNG, không ghi 0%', rong.ok && rong.tyLeChuyenDoi === undefined);

sq.prepare("INSERT INTO doTrang (ngay,trang,su,nhan,nguon,may,dem) VALUES ('2020-01-01','landing','xem','','khac','may',5)").run();
sq.prepare("INSERT INTO doTrang (ngay,trang,su,nhan,nguon,may,dem) VALUES (?, 'landing','xem','','khac','may',2)").run(new Date().toISOString().slice(0, 10));
await donDep(env);
kiem('Lịch dọn xoá số đếm quá 400 ngày, giữ số mới', dem("ngay='2020-01-01'") === 0 && dem("ngay<>'2020-01-01'") === 2);

/* Năm trang giới thiệu: số gọi đúng, không mã đo của bên thứ ba, đo về máy chủ riêng. */
const TRANG = ['landing', 've-chung-toi', 'dich-vu', 'bang-gia', 'lien-he'];
const html = Object.fromEntries(TRANG.map(t => [t, fs.readFileSync(ROOT + '/' + t + '.html', 'utf8')]));
const tatCaHtml = fs.readdirSync(ROOT).filter(f => f.endsWith('.html')).map(f => fs.readFileSync(ROOT + '/' + f, 'utf8')).join('\n');
kiem('Không trang nào còn nút gọi số sai (+84 28…)', !/tel:\+842855554688|\+84-28-5555-4688/.test(tatCaHtml));
kiem('Mọi nút gọi trỏ số di động 08.5555.4688', TRANG.every(t => /tel:\+84855554688/.test(html[t])));
kiem('Không mã đo của bên thứ ba (Google Analytics, Tag Manager, Facebook Pixel…)',
  !/googletagmanager|google-analytics|gtag\(|fbq\(|connect\.facebook\.net|hotjar|clarity\.ms/.test(tatCaHtml));
kiem('Mỗi trang đánh dấu đúng trang đang mở ở thanh trên', TRANG.every(t => (html[t].match(/aria-current="page"/g) || []).length === 1));
kiem('Không còn ô cảm nhận "Placeholder" hiện cho khách', TRANG.every(t => !/proofPlaceholder|>\s*Placeholder\s*</.test(html[t])));
kiem('Địa chỉ mới có ở trang Liên hệ và chân trang', /21\/27 Vũ Ngọc Phan, phường Láng, TP\. Hà Nội/.test(html['lien-he']) &&
  TRANG.every(t => /21\/27 Vũ Ngọc Phan/.test(html[t])));
kiem('Form liên hệ nói rõ dữ liệu dùng vào việc gì', /data-m="contactFormNote"/.test(html['lien-he']));
const js = fs.readFileSync(ROOT + '/assets/marketing-shared.js', 'utf8');
kiem('Tệp chạy chung gửi tín hiệu về cửa ghiLuotTrang của Học viện', /ghiLuotTrang/.test(js) && /typhuquanggita\.workers\.dev/.test(js));
kiem('Tôn trọng Do Not Track / Global Privacy Control', /doNotTrack/.test(js) && /globalPrivacyControl/.test(js));
const i18n = fs.readFileSync(ROOT + '/src/i18n-marketing.js', 'utf8');
kiem('Bản dịch không còn địa chỉ cũ (TP. Hồ Chí Minh)', !/Hồ Chí Minh|Ho Chi Minh/.test(i18n));

console.log(sai ? `\n✗ ${sai} phép đo sai` : '\n✓ Đo trang công khai: chỉ đếm, không nhận ra ai, chỉ quản lý đọc được');
process.exit(sai ? 1 : 0);
