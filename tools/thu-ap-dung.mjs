/* Thử V50 — KIẾN TRÚC VẬN HÀNH: bản đồ màn + đo mức áp dụng học thuyết.
   D1 giả = node:sqlite trong RAM. Chứng minh:
     · bản đồ màn: mọi màn được gộp / gom cụm có trong cột trái, không màn
       nào ở hai cụm, mọi đích chuyển hướng có thật, không đích nào lại bị
       chuyển tiếp (không vòng), không đụng 99 khoá màn được do-16-he canh
       theo kiểu xoá đăng ký; mã chỉ số mỗi cụm có trong Trung tâm đo lường
     · số việc từng cụm ở app KHỚP máy chủ (CUM_SO)
     · chấm điểm app KHỚP máy chủ trên 400 bảng ngẫu nhiên
     · quyền: gia đình không ghi, R04 không xem tổng, R01–R03 xem được
     · ghi một dòng / người / cụm (ghi lại = cập nhật, không nhân đôi)
     · từ chối cụm lạ, sai số việc, trạng thái lạ
     · tổng hợp: điểm TB từng cụm, theo vai, độ phủ, danh sách điểm thấp
   Dùng: node tools/thu-ap-dung.mjs   (Node >= 22.5) */
import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import vm from 'node:vm';
import { pathToFileURL, fileURLToPath } from 'node:url';
const ROOT = process.argv[2] || fileURLToPath(new URL('..', import.meta.url)).replace(/[\\/]$/, '');
const M = await import(pathToFileURL(ROOT + '/may-chu/ap-dung.js').href);

const sq = new DatabaseSync(':memory:');
sq.exec(fs.readFileSync(ROOT + '/may-chu/csdl.sql', 'utf8'));
const db = { prepare(sql) { let a = []; const st = {
  bind(...x) { a = x; return st; },
  first() { return Promise.resolve(sq.prepare(sql).get(...a) || null); },
  all() { return Promise.resolve({ results: sq.prepare(sql).all(...a) }); },
  run() { const r = sq.prepare(sql).run(...a); return Promise.resolve({ meta: { changes: Number(r.changes) } }); } }; return st; } };
let dat = 0, truot = 0;
const kiem = (ten, dk) => { if (dk) { dat++; console.log('OK  ' + ten); } else { truot++; console.log('SAI ' + ten); } };

/* ── nạp dữ liệu app (ES5) vào một hộp cát ── */
const G = { VIEWS: {} };
const ctx = { window: { G }, G, console, localStorage: { getItem: () => null, setItem() {}, removeItem() {} } };
vm.createContext(ctx);
for (const f of ['src/data.core.js', 'src/data-toi-uu.js', 'src/data-v50.js']) vm.runInContext(fs.readFileSync(ROOT + '/' + f, 'utf8'), ctx, { filename: f });
const V = G.V50, TU = G.TU;
const nav = new Set(); G.NAV.forEach(g => g.items.forEach(it => nav.add(it.v)));

/* ── bản đồ màn ── */
const cumMan = []; V.CUM.forEach(c => cumMan.push(...c.man));
kiem('14 cụm, ' + cumMan.length + ' màn học thuyết, không màn nào ở hai cụm', V.CUM.length === 14 && new Set(cumMan).size === cumMan.length && cumMan.length >= 140);
kiem('mọi màn gom cụm / gộp / ẩn đều là mục thật của cột trái', [...cumMan, ...Object.keys(V.GOP), ...Object.keys(V.AN)].every(v => nav.has(v)));
const dich = []; Object.values(V.GOP).forEach(g => dich.push(...g[0]));
kiem('mọi đích chuyển hướng có trong cột trái', dich.every(v => nav.has(v)));
kiem('không đích nào lại bị gộp / gom cụm (không vòng, không đưa vào màn đã rút)', dich.every(v => !V.GOP[v] && !V.cumCua(v) && !V.AN[v]));
kiem('màn gộp không đồng thời nằm trong cụm học thuyết', Object.keys(V.GOP).every(v => !V.cumCua(v)));
kiem('mỗi cụm trỏ vào khối và chỉ số có thật của Trung tâm đo lường', V.CUM.every(c => TU.KHOI.some(k => k.ma === c.khoi) && TU.KPI.some(k => k.ma === c.kpi && k.khoi === c.khoi)));
kiem('mỗi cụm có 5–6 việc áp dụng, mỗi việc là một câu đủ nghĩa', V.CUM.every(c => c.viec.length >= 5 && c.viec.length <= 6 && c.viec.every(t => t.length >= 20 && t.length <= 110)));
kiem('màn Thư viện vận hành có trong cột trái và không bị rút', nav.has('thu-vien-v50') && !V.cumCua('thu-vien-v50') && !V.GOP['thu-vien-v50']);
const kgSrc = fs.readFileSync(ROOT + '/src/khong-gian.js', 'utf8');
const kgVai = [...kgSrc.matchAll(/R(0[1-9]|1[0-2])\s*:\s*\{cap:\d+,\s*ds:\[([^\]]*)\]/g)].map(m => [...m[2].matchAll(/'([a-z0-9-]+)'/g)].map(x => x[1]));
const kgAz = (kgSrc.match(/var AZ10 = \[([^\]]*)\]/) || [, ''])[1];
const kgTat = kgVai.flat().concat([...kgAz.matchAll(/'([a-z0-9-]+)'/g)].map(x => x[1]));
kiem('không gian làm việc của nhân sự không còn trỏ vào màn mẫu đã gộp', kgTat.length > 30 && kgTat.every(v => !V.GOP[v]));

/* ── khớp app ↔ máy chủ ── */
kiem('số việc từng cụm: app khớp máy chủ', V.CUM.every(c => M.CUM_SO[c.ma] === c.viec.length) && Object.keys(M.CUM_SO).length === V.CUM.length);
let lech = 0;
const TT = ['da', 'dang', 'chua', 'kl'];
for (let i = 0; i < 400; i++) {
  const n = 1 + Math.floor(Math.random() * 7), tt = Array.from({ length: n }, () => TT[Math.floor(Math.random() * 4)]);
  if (JSON.stringify(V.cham(tt)) !== JSON.stringify(M.chamApDung(tt))) lech++;
}
kiem('chấm điểm: app khớp máy chủ trên 400 bảng ngẫu nhiên', lech === 0);
kiem('chấm: (đã + ½ đang) / (tổng − không liên quan); toàn "không liên quan" → chưa đo', M.chamApDung(['da', 'dang', 'chua', 'kl']).diem === 50 && M.chamApDung(['kl', 'kl']).diem === null);

/* ── máy chủ ── */
sq.prepare("INSERT INTO users (id, username, role, active) VALUES ('A1','chu','R01',1),('A3','gd','R03',1),('A4','ql','R04',1),('A7','coach','R07',1),('A11','tv','R11',1),('A13','ph','R13',1)").run();
const ho = (u, role) => ({ u, uid: u, role });
const tt6 = ['da', 'da', 'dang', 'chua', 'chua', 'kl'];
kiem('gia đình không ghi tự soát', (await M.ghiApDung({ cum: 'PP', tt: tt6 }, {}, db, ho('ph', 'R13'))).code === 'NOPERM');
kiem('từ chối cụm lạ', !(await M.ghiApDung({ cum: 'XYZ', tt: tt6 }, {}, db, ho('coach', 'R07'))).ok);
kiem('từ chối sai số việc', !(await M.ghiApDung({ cum: 'PP', tt: ['da'] }, {}, db, ho('coach', 'R07'))).ok);
kiem('từ chối trạng thái lạ', !(await M.ghiApDung({ cum: 'PP', tt: ['da', 'da', 'x', 'chua', 'chua', 'kl'] }, {}, db, ho('coach', 'R07'))).ok);
const g1 = await M.ghiApDung({ cum: 'PP', tt: tt6 }, {}, db, ho('coach', 'R07'));
kiem('coach ghi cụm Phương pháp: 2 đã + 1 đang trên 5 việc liên quan = 50 điểm', g1.ok && g1.diem === 50 && g1.tong === 5);
const g2 = await M.ghiApDung({ cum: 'PP', tt: ['da', 'da', 'da', 'da', 'dang', 'kl'] }, {}, db, ho('coach', 'R07'));
const dem = sq.prepare("SELECT COUNT(*) AS n FROM apDung WHERE u = 'coach'").get().n;
kiem('ghi lại cùng cụm = cập nhật một dòng (90 điểm), không nhân đôi', g2.diem === 90 && Number(dem) === 1);
await M.ghiApDung({ cum: 'COACH', tt: ['chua', 'chua', 'chua', 'chua', 'chua', 'dang'] }, {}, db, ho('coach', 'R07'));
await M.ghiApDung({ cum: 'TUVAN', tt: ['da', 'chua', 'chua', 'chua', 'chua'] }, {}, db, ho('tv', 'R11'));
await M.ghiApDung({ cum: 'PP', tt: ['da', 'chua', 'chua', 'chua', 'chua', 'chua'] }, {}, db, ho('tv', 'R11'));
const doc = await M.docApDung({}, {}, db, ho('coach', 'R07'));
kiem('đọc lại bảng của chính mình (2 cụm, giữ đúng trạng thái từng việc)', doc.ok && doc.ds.length === 2 && doc.ds.find(x => x.cum === 'PP').tt[4] === 'dang');
kiem('gia đình đọc → danh sách rỗng, không lỗi', (await M.docApDung({}, {}, db, ho('ph', 'R13'))).ds.length === 0);
kiem('R04 không xem tổng hợp', (await M.tongApDung({}, {}, db, ho('ql', 'R04'))).code === 'NOPERM');
const tg = await M.tongApDung({}, {}, db, ho('gd', 'R03'));
const pp = tg.cum.find(x => x.cum === 'PP');
kiem('tổng hợp: cụm Phương pháp 2 người, TB (90 + 17) / 2 = 53,5, thấp nhất 17', tg.ok && pp.soNguoi === 2 && pp.diemTB === 53.5 && pp.thapNhat === 17);
kiem('tổng hợp: độ phủ = 2 người đã soát / 5 nhân sự = 40%', tg.nhanSu === 5 && tg.daSoat === 2 && tg.phu === 40);
kiem('tổng hợp: điểm theo vai và danh sách dưới 50 điểm (thấp trước)', tg.vai.some(x => x.vai === 'R11' && x.cum === 'TUVAN' && x.diemTB === 20) && tg.thap[0].diem <= tg.thap[tg.thap.length - 1].diem && tg.thap.every(x => x.diem < 50));

console.log('\n' + dat + ' đạt · ' + truot + ' sai');
process.exit(truot ? 1 : 0);
