/* Thử VÍ CREDIT — D1 giả = node:sqlite trong RAM. Chứng minh: quyền từng
   cửa · credit tặng một lần mỗi tầng · thưởng tick/chuỗi tự động chỉ từ
   nhipXong thật · thưởng do Coach ghi không trùng, có trần · tiêu theo
   thứ tự tặng → thưởng → trả phí, không âm · nạp chỉ từ phiếu ĐÃ DUYỆT,
   một lần · điều chỉnh R01 có lý do · tham số máy chủ KHỚP app.
   Dùng: node tools/thu-credit.mjs   (Node >= 22.5) */
import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import vm from 'node:vm';
import { pathToFileURL, fileURLToPath } from 'node:url';
const ROOT = process.argv[2] || fileURLToPath(new URL('..', import.meta.url)).replace(/[\\/]$/, '');
const C = await import(pathToFileURL(ROOT + '/may-chu/credit.js').href);

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

const user = (id, u, role, mk) => sq.prepare("INSERT INTO users (id, username, role, active, maKhachHang) VALUES (?, ?, ?, 1, ?)").run(id, u, role, mk || null);
user('P1', 'phuhuynh1', 'R13', 'K1'); user('P2', 'phuhuynh2', 'R13', 'K2');
user('C1', 'coach1', 'R07'); user('C2', 'coach2', 'R07'); user('T5', 'truongnhom', 'R05');
user('A1', 'chu', 'R01'); user('A4', 'qlcm', 'R04'); user('KT', 'ketoanthu', 'R09');
sq.prepare("INSERT INTO hoSoKhach (maKhachHang, uidPhuHuynh, tang, coach) VALUES ('K1','P1',3,'coach1')").run();
sq.prepare("INSERT INTO hoSoKhach (maKhachHang, uidPhuHuynh, tang, coach) VALUES ('K2','P2',1,'coach2')").run();
const hs = (uid, u, role, mk) => ({ uid, u, role, maKhachHang: mk || '' });
const P1 = hs('P1', 'phuhuynh1', 'R13', 'K1'), P2 = hs('P2', 'phuhuynh2', 'R13', 'K2');
const C1 = hs('C1', 'coach1', 'R07'), C2 = hs('C2', 'coach2', 'R07'), TN = hs('T5', 'truongnhom', 'R05');
const A1 = hs('A1', 'chu', 'R01'), A4 = hs('A4', 'qlcm', 'R04');

/* ── tặng ── */
let v = await C.viCredit({}, {}, db, P1);
const T3 = C.thongSoTang(3, 10000000);
kiem('nhà mở ví: tầng 3 nhận đúng 5.000 credit tặng đăng ký', v.ok && v.tang === 3 && v.soDu.tang === 5000 && v.quaMoi === 1);
v = await C.viCredit({}, {}, db, P1);
kiem('mở lại ví không tặng lần hai', v.ok && v.quaMoi === 0 && v.soDu.tang === 5000);
const v2 = await C.viCredit({}, {}, db, P2);
kiem('nhà tầng 1 nhận đúng 2.000 credit tặng', v2.ok && v2.soDu.tang === 2000);
kiem('nhà khác không xem được ví K1', (await C.viCredit({ maNha: 'K1' }, {}, db, P2)).code === 'NOPERM');
kiem('Coach không phụ trách không xem được ví K1', (await C.viCredit({ maNha: 'K1' }, {}, db, C2)).code === 'NOPERM');
kiem('mã nhà không có thật: không mở ví, không tặng', (await C.viCredit({ maNha: 'KHONG-CO' }, {}, db, TN)).code === 'KHONGNHA' && !sq.prepare("SELECT 1 FROM soCredit WHERE maNha = 'KHONG-CO'").get());
kiem('Coach phụ trách xem được ví K1', (await C.viCredit({ maNha: 'K1' }, {}, db, C1)).vai === 'coach');

/* ── thưởng tự động từ nhipXong ── */
const hom = new Date().toISOString().slice(0, 10);
const cong = (s, n) => { const d = new Date(s + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
for (let i = 0; i < 8; i++) sq.prepare('INSERT INTO nhipXong (id,maNha,maNhip,ngay,bo,boiAi,ghiLuc) VALUES (?,?,?,?,0,?,?)').run('NX' + i, 'K1', 'N1', cong(hom, i), 'p', hom);
sq.prepare('INSERT INTO nhipXong (id,maNha,maNhip,ngay,bo,boiAi,ghiLuc) VALUES (?,?,?,?,1,?,?)').run('NXbo', 'K1', 'N2', cong(hom, 9), 'p', hom);
sq.prepare('INSERT INTO nhipXong (id,maNha,maNhip,ngay,bo,boiAi,ghiLuc) VALUES (?,?,?,?,0,?,?)').run('NXcu', 'K1', 'N1', cong(hom, -5), 'p', hom);
v = await C.viCredit({}, {}, db, P1);
const gTick = C.thuongMoiLan(T3, 'tick'), gChuoi = C.thuongMoiLan(T3, 'chuoi');
kiem('8 ngày tick thật → 8 thưởng tick + 1 chuỗi 7 ngày; ngày BỎ và ngày trước khi mở ví không tính',
  v.thuongMoi === 9 && v.soDu.thuong === 8 * gTick + gChuoi);
v = await C.viCredit({}, {}, db, P1);
kiem('đồng bộ lại không thưởng trùng', v.thuongMoi === 0 && v.soDu.thuong === 8 * gTick + gChuoi);

/* ── thưởng do Coach ghi ── */
kiem('nhà không tự ghi thưởng', (await C.thuongCredit({ maNha: 'K1', hoatDong: 'nv', thamChieu: 'NV1' }, {}, db, P1)).code === 'NOPERM');
let t = await C.thuongCredit({ maNha: 'K1', hoatDong: 'nv', thamChieu: 'NV1' }, {}, db, C1);
kiem('Coach ghi thưởng nhiệm vụ đúng giá bảng', t.ok && t.daGhi && t.so === C.thuongMoiLan(T3, 'nv'));
t = await C.thuongCredit({ maNha: 'K1', hoatDong: 'nv', thamChieu: 'NV1' }, {}, db, C1);
kiem('cùng tham chiếu không thưởng hai lần', t.ok && t.trung);
kiem('thưởng tick không ghi tay được', (await C.thuongCredit({ maNha: 'K1', hoatDong: 'tick', thamChieu: 'x' }, {}, db, C1)).code === 'TUDONG');
for (let i = 0; i < 4; i++) await C.thuongCredit({ maNha: 'K1', hoatDong: 'cong', thamChieu: 'G' + i }, {}, db, TN);
kiem('đủ trần cổng của tầng (4) thì chặn', (await C.thuongCredit({ maNha: 'K1', hoatDong: 'cong', thamChieu: 'G9' }, {}, db, TN)).code === 'TRAN');

/* ── tiêu ── */
kiem('nhà không tự trừ buổi coach', (await C.tieuCredit({ hoatDong: 'buoi-11', thamChieu: 'B1' }, {}, db, P1)).code === 'CANCOACH');
const truoc = (await C.viCredit({}, {}, db, P1)).soDu;
let x = await C.tieuCredit({ hoatDong: 'tai-lieu', thamChieu: 'TL1' }, {}, db, P1);
kiem('nhà tự mở tài liệu: trừ credit TẶNG trước', x.ok && x.chiTiet.length === 1 && x.chiTiet[0].loai === 'tang' && x.soDu.tang === truoc.tang - x.so);
x = await C.tieuCredit({ hoatDong: 'tai-lieu', thamChieu: 'TL1' }, {}, db, P1);
kiem('cùng tham chiếu không trừ hai lần', x.ok && x.trung);
x = await C.tieuCredit({ maNha: 'K1', hoatDong: 'danh-gia', thamChieu: 'DG1' }, {}, db, C1);
kiem('không đủ credit thì từ chối, ví không âm', x.code === 'THIEU' && (await C.soDu(db, 'K1')).tong >= 0);

/* ── nạp từ phiếu thu ── */
sq.prepare("INSERT INTO phieuThu (id, maKhachHang, soTien, hinhThuc, nguoiGhi, ghiLuc, trangThai) VALUES ('PT1','K1',10000000,'chuyenKhoan','nv','2026-10-01','choDuyet')").run();
kiem('Coach không nạp credit', (await C.napCreditPhieu({ idPhieu: 'PT1' }, {}, db, C1)).code === 'NOPERM');
kiem('phiếu chưa duyệt không nạp được', (await C.napCreditPhieu({ idPhieu: 'PT1' }, {}, db, A1)).code === 'CHUADUYET');
sq.prepare("UPDATE phieuThu SET trangThai = 'daDuyet', nguoiDuyet = 'kt', duyetLuc = '2026-10-02' WHERE id = 'PT1'").run();
kiem('danh sách phiếu đã duyệt chưa nạp có PT1', (await C.dsPhieuThuChuaNap({}, {}, db, A1)).ds.some(p => p.id === 'PT1' && p.credit === 1000000));
let n = await C.napCreditPhieu({ idPhieu: 'PT1' }, {}, db, A1);
kiem('nạp 10.000.000đ = 1.000.000 credit trả phí', n.ok && n.daNap && n.so === 1000000 && n.soDu.traPhi === 1000000);
n = await C.napCreditPhieu({ idPhieu: 'PT1' }, {}, db, A1);
kiem('nạp lại cùng phiếu không cộng hai lần', n.ok && n.trung && (await C.soDu(db, 'K1')).traPhi === 1000000);

/* ── thứ tự trừ khi một lượt vượt tặng + thưởng ── */
const du = await C.soDu(db, 'K1');
x = await C.tieuCredit({ maNha: 'K1', hoatDong: 'danh-gia', thamChieu: 'DG2' }, {}, db, C1);
const cTang = (x.chiTiet || []).find(c => c.loai === 'tang'), cTh = (x.chiTiet || []).find(c => c.loai === 'thuong'), cTp = (x.chiTiet || []).find(c => c.loai === 'traPhi');
kiem('một lượt lớn: trừ hết tặng, rồi hết thưởng, phần còn lại vào trả phí',
  x.ok && cTang && cTang.so === du.tang && cTh && cTh.so === du.thuong && cTp && cTp.so === x.so - du.tang - du.thuong);
kiem('sau lượt ấy tặng = 0, thưởng = 0', x.soDu.tang === 0 && x.soDu.thuong === 0);

/* ── điều chỉnh & tổng quan ── */
kiem('R04 không điều chỉnh được', (await C.dieuChinhCredit({ maNha: 'K1', loai: 'tang', so: 100, lyDo: 'bù lỗi hệ thống tuần 41' }, {}, db, A4)).code === 'NOPERM');
kiem('điều chỉnh thiếu lý do bị chặn', !(await C.dieuChinhCredit({ maNha: 'K1', loai: 'tang', so: 100, lyDo: 'bù' }, {}, db, A1)).ok);
kiem('R01 điều chỉnh có lý do', (await C.dieuChinhCredit({ maNha: 'K1', loai: 'tang', so: 100, lyDo: 'bù lỗi hệ thống tuần 41' }, {}, db, A1)).soDu.tang === 100);
kiem('Coach không xem tổng quan', (await C.tongQuanCredit({}, {}, db, C1)).code === 'NOPERM');
const tq = await C.tongQuanCredit({}, {}, db, A4);
kiem('R04 xem tổng quan, phiên bản đúng', tq.ok && tq.phienBan === C.PHIEN_BAN && tq.soVi === 2);
/* ── gói tầng 2: 500.000đ → 300.000 credit · 868.000đ → 1.000.000 credit (vẫn 10đ = 1 credit) ── */
user('P3', 'phuhuynh3', 'R13', 'K3'); user('P4', 'phuhuynh4', 'R13', 'K4');
sq.prepare("INSERT INTO hoSoKhach (maKhachHang, uidPhuHuynh, tang, coach) VALUES ('K3','P3',2,'coach1')").run();
sq.prepare("INSERT INTO hoSoKhach (maKhachHang, uidPhuHuynh, tang, coach) VALUES ('K4','P4',2,'coach1')").run();
[['PT5','K3',500000], ['PT8','K4',868000], ['PT7','K3',700000], ['PT9','K1',500000]].forEach(p => sq.prepare("INSERT INTO phieuThu (id, maKhachHang, soTien, hinhThuc, nguoiGhi, ghiLuc, trangThai, nguoiDuyet, duyetLuc) VALUES (?,?,?,'chuyenKhoan','nv','2026-10-03','daDuyet','kt','2026-10-04')").run(...p));
const ds2 = await C.dsPhieuThuChuaNap({}, {}, db, A1), d5 = ds2.ds.find(x => x.id === 'PT5'), d8 = ds2.ds.find(x => x.id === 'PT8');
kiem('danh sách chờ nạp báo trước credit tặng theo gói T2', d5 && d5.credit === 50000 && d5.tangGoi === 250000 && d8 && d8.tangGoi === 913200);
const tr3 = (await C.viCredit({ maNha: 'K3' }, {}, db, A1)).soDu;
let g2 = await C.napCreditPhieu({ idPhieu: 'PT5' }, {}, db, A1);
kiem('T2 lựa chọn 1: 500.000đ → 50.000 trả phí + 250.000 tặng = 300.000 credit', g2.ok && g2.so === 50000 && g2.tangGoi === 250000 &&
  g2.soDu.traPhi === 50000 && g2.soDu.tang === tr3.tang + 250000);
g2 = await C.napCreditPhieu({ idPhieu: 'PT5' }, {}, db, A1);
kiem('nạp lại phiếu T2 không cộng lần hai', g2.ok && g2.trung && g2.soDu.traPhi === 50000 && g2.soDu.tang === tr3.tang + 250000);
const tr4 = (await C.viCredit({ maNha: 'K4' }, {}, db, A1)).soDu;
g2 = await C.napCreditPhieu({ idPhieu: 'PT8' }, {}, db, A1);
kiem('T2 lựa chọn 2: 868.000đ → 86.800 trả phí + 913.200 tặng = 1.000.000 credit', g2.ok && g2.so === 86800 && g2.tangGoi === 913200 && g2.soDu.tong - tr4.tong === 1000000);
g2 = await C.napCreditPhieu({ idPhieu: 'PT7' }, {}, db, A1);
kiem('phiếu T2 không đúng giá lựa chọn: chỉ 10đ = 1 credit, không tặng gói', g2.ok && g2.so === 70000 && !g2.tangGoi);
g2 = await C.napCreditPhieu({ idPhieu: 'PT9' }, {}, db, A1);
kiem('nhà tầng 3 trả 500.000đ: không nhận tặng gói tầng 2', g2.ok && g2.so === 50000 && !g2.tangGoi);
const T2a = C.thongSoTang(2, 500000), T2b = C.thongSoTang(2, 3000000);
kiem('bảng giá hoạt động T2 tính trên 300.000 credit chuẩn, không theo giá gói', T2a.cr === 300000 && C.giaHoatDong(T2a, 5, 'CS', 'buoi-11') === C.giaHoatDong(T2b, 5, 'CS', 'buoi-11'));

kiem('sổ chỉ thêm dòng: không có UPDATE/DELETE trên soCredit trong mã', !/UPDATE soCredit|DELETE FROM soCredit/.test(fs.readFileSync(ROOT + '/may-chu/credit.js', 'utf8')));

/* ── tham số máy chủ KHỚP app ── */
const ctx = { window: {}, document: { addEventListener() {} }, localStorage: { getItem() { return null; }, setItem() {} } };
ctx.window.G = { U: { h: s => s, ic: () => '' }, VIEWS: {} }; ctx.G = ctx.window.G; vm.createContext(ctx);
for (const f of ['src/data-credit.js', 'src/credit.js']) vm.runInContext(fs.readFileSync(ROOT + '/' + f, 'utf8'), ctx);
const G = ctx.G, CR = G.CR, PS = G.CR_THAMSO;
kiem('phiên bản app = máy chủ', PS.phienBan === C.PHIEN_BAN);
let lech = [];
for (let tg = 1; tg <= 5; tg++) {
  const Tc = CR.tang(tg), Ts = C.thongSoTang(tg, Tc.gia);
  if (Tc.cr !== Ts.cr) lech.push('cr T' + tg);
  if ((Tc.dk || 0) !== (C.DANG_KY[tg] || 0)) lech.push('đăng ký T' + tg);
  CR.bang(tg).forEach(r => { if (r.crBuoi !== C.giaHoatDong(Ts, r.c, 'CS', 'buoi-11')) lech.push('buổi T' + tg + '.' + r.c); });
  CR.thuong(tg).forEach(a => { if (a.cr !== C.thuongMoiLan(Ts, a.ma)) lech.push('thưởng ' + a.ma + ' T' + tg); });
  PS.tieu.forEach(a => { [1, 5, 10].forEach(c => PS.nhom.forEach(g => { if (CR.gia(tg, c, g.ma, a.ma) !== C.giaHoatDong(Ts, c, g.ma, a.ma)) lech.push(a.ma + ' T' + tg + 'c' + c + g.ma); })); });
}
kiem('mọi giá buổi, thưởng, tiêu của app khớp máy chủ (5 tầng × cấp × nhóm)' + (lech.length ? ' — lệch: ' + lech.slice(0, 5).join(', ') : ''), lech.length === 0);
kiem('tặng T1 app = máy chủ (2.000)', CR.tang(1).cr === C.TANG_T1);
kiem('gói T2 app = máy chủ (500.000đ → 300.000 · 868.000đ → 1.000.000)', JSON.stringify(CR.tang(2).goi.map(g => [g.ma, g.gia, g.cr])) === JSON.stringify(C.GOI[2].map(g => [g.ma, g.gia, g.cr])) &&
  CR.tang(2).goi[0].tangGoi === 250000 && CR.tang(2).goi[1].tangGoi === 913200);
kiem('thứ tự trừ app nói = máy chủ làm', /tặng.*thưởng.*trả phí/.test(PS.luat.join(' ')) && C.THU_TU_TRU.join() === 'tang,thuong,traPhi');

console.log('\n' + dat + ' đạt · ' + truot + ' sai');
process.exit(truot ? 1 : 0);
