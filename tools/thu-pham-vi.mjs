/* Thử PHẠM VI NHÀ · NGANG CẤP · TỰ VÁ LƯỢC ĐỒ (V50·168)
   Khoá lại những lỗ đã vá ở đợt soát 07/10/2026 để không mở lại âm thầm:
     · pham-vi-nha.js: nhân sự R06–R12 chỉ mở dữ liệu nhà mình phụ trách
     · cửa chăm sóc / nhắc thu / tệp khách dùng đúng luật ấy
     · Admin không đặt lại mật khẩu / sửa tài khoản Admin ngang cấp
     · va-luoc-do.js thêm cột còn thiếu trên D1 dựng trước, không xoá gì
     · bao-cao dungKy: mốc sai dạng → null, không ném RangeError
   Dùng: node tools/thu-pham-vi.mjs   (Node >= 22.5) */
import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import { pathToFileURL, fileURLToPath } from 'node:url';
const ROOT = fileURLToPath(new URL('..', import.meta.url)).replace(/[\\/]$/, '');
globalThis.fetch = async () => { throw new Error('KHONG_MANG'); };

function taoDb(sql) {
  const sq = new DatabaseSync(':memory:');
  if (sql) sq.exec(sql);
  const db = {
    sq,
    prepare(s) { let a = []; const hua = f => { try { return Promise.resolve(f()); } catch (e) { return Promise.reject(e); } }; const st = {
      bind(...x) { a = x; return st; },
      first(col) { return hua(() => { const r = sq.prepare(s).get(...a) || null; return col && r ? r[col] : r; }); },
      all() { return hua(() => ({ results: sq.prepare(s).all(...a) })); },
      run() { return hua(() => { const r = sq.prepare(s).run(...a); return { meta: { changes: Number(r.changes) } }; }); } }; return st; },
    async batch(ds) { const ra = []; for (const st of ds) ra.push(await st.run()); return ra; }
  };
  return db;
}
const nap = t => import(pathToFileURL(ROOT + '/may-chu/' + t).href);

let dat = 0, sai = 0;
const thu = (ten, ok) => { if (ok) { dat++; console.log('  ✓ ' + ten); } else { sai++; console.log('  ✗ ' + ten); } };

const db = taoDb(fs.readFileSync(ROOT + '/may-chu/csdl.sql', 'utf8'));
db.sq.exec("INSERT INTO users (id, username, role, active) VALUES ('A1','chu','R01',1),('A2','ad1','R02',1),('A3','ad2','R02',1),('C1','coach1','R07',1),('C2','coach2','R07',1),('T1','tv1','R11',1),('P1','ph1','R13',1)");
db.sq.exec("INSERT INTO hoSoKhach (maKhachHang, uidPhuHuynh, tang, coach, tuVan) VALUES ('K1','P1',2,'coach1','tv1')");

const { nhaPhuTrach } = await nap('pham-vi-nha.js');
const ho = (u, role, uid) => ({ u, role, uid: uid || u });
console.log('Phạm vi nhà');
thu('Super Admin mở mọi nhà', await nhaPhuTrach(db, ho('chu', 'R01'), 'K1'));
thu('Trưởng nhóm Coach (R05) mở mọi nhà', await nhaPhuTrach(db, ho('x', 'R05'), 'K1'));
thu('Coach phụ trách mở nhà mình', await nhaPhuTrach(db, ho('coach1', 'R07'), 'K1'));
thu('Coach KHÔNG phụ trách bị chặn', !(await nhaPhuTrach(db, ho('coach2', 'R07'), 'K1')));
thu('Tư vấn phụ trách mở nhà mình', await nhaPhuTrach(db, ho('tv1', 'R11'), 'K1'));
thu('Khách (R13) không qua luật nhân sự', !(await nhaPhuTrach(db, ho('ph1', 'R13'), 'K1')));
thu('Trần 3: R05 không còn mở mọi nhà', !(await nhaPhuTrach(db, ho('x', 'R05'), 'K1', 3)));
thu('Thiếu mã nhà → chặn', !(await nhaPhuTrach(db, ho('coach1', 'R07'), '')));

console.log('Cửa dùng luật phạm vi');
const vh = await nap('van-hanh-cham-soc.js');
const tc = await nap('tai-chinh.js');
const hs = await nap('ho-so-khach.js');
const y = { maNha: 'K1', maKhachHang: 'K1' };
for (const [ten, f] of [['docSongSinh', vh.docSongSinh], ['doSoCham', vh.doSoCham], ['lichSuNhacThu', tc.lichSuNhacThu]]) {
  const r = await f({ ...y }, {}, db, ho('coach2', 'R07', 'C2')).catch(e => ({ loi: e.message }));
  thu(ten + ': Coach ngoài nhà → NGOAINHA', r && r.code === 'NGOAINHA');
  const r2 = await f({ ...y }, {}, db, ho('coach1', 'R07', 'C1')).catch(e => ({ loi: e.message }));
  thu(ten + ': Coach phụ trách qua cổng phạm vi', !r2 || r2.code !== 'NGOAINHA');
}
const rt = await hs.xemTepKhach({ ...y, loai: 'hoSo' }, {}, db, ho('coach2', 'R07', 'C2')).catch(e => ({ loi: e.message }));
thu('xemTepKhach: Coach ngoài nhà không đọc được tệp', !rt || rt.ok !== true);

console.log('Tài khoản ngang cấp');
const qt = await nap('quan-ly-tai-khoan.js');
const r1 = await qt.adminKhoiPhucMatKhau({ username: 'ad2', matKhauMoi: 'Mot-Mat-Khau-Rat-Dai-92!' }, { GITA_TIEU: 'x' }, db, ho('ad1', 'R02', 'A2'));
thu('Admin không đặt lại mật khẩu Admin khác', r1 && r1.ok === false);
const r2 = await qt.capNhatTaiKhoan({ username: 'ad2', active: 0 }, {}, db, ho('ad1', 'R02', 'A2'));
thu('Admin không khoá Admin khác', r2 && r2.ok === false);
const r3 = await qt.dsTaiKhoan({}, {}, db, ho('gd', 'R03', 'G1'));
thu('Giám đốc: danh bạ không lộ tài khoản khách', r3 && r3.ok !== false && !(r3.ds || r3.rows || r3.items || []).some(u => /^R1[345]$/.test(u.role)));

console.log('Tự vá lược đồ');
const cu = taoDb('CREATE TABLE users (id TEXT PRIMARY KEY, username TEXT, role TEXT); INSERT INTO users VALUES (\'U1\',\'a\',\'R07\');');
const { vaLuocDo } = await nap('va-luoc-do.js');   /* vaLuocDo xoá nhớ đệm từng isolate của vaBang */
const kq = await vaLuocDo(cu);
const cot = cu.sq.prepare('PRAGMA table_info(users)').all().map(r => r.name);
thu('D1 cũ thiếu phongBan → đã thêm', cot.includes('phongBan') && kq.them.includes('users.phongBan'));
thu('Bảng chưa có được báo, không tự dựng', kq.chuaCo.includes('hoSoKhach'));
thu('Dữ liệu cũ giữ nguyên', cu.sq.prepare('SELECT count(*) AS n FROM users').get().n === 1);
thu('Không bỏ cột nào đang có', ['id', 'username', 'role'].every(c => cot.includes(c)));

console.log('Mốc kỳ báo cáo');
const { dungKy } = await nap('bao-cao.js');
let nem = false, v = 'x';
try { v = dungKy('tuan', '2026-13-99xx'); } catch (e) { nem = true; }
thu('Mốc sai dạng → null, không ném', !nem && v === null);
thu('Mốc đúng dạng vẫn dựng kỳ', !!dungKy('tuan', '2026-10-07'));

console.log('\n' + dat + ' đạt · ' + sai + ' sai');
process.exit(sai ? 1 : 0);
