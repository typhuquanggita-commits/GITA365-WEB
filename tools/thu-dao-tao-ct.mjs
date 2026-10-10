/* Thử Chương trình đào tạo Tư vấn → Nhân sự → Coach — D1 giả = node:sqlite.
   Chứng minh:
     · bản G.DTC_CT (màn) và CT (máy chủ) khớp từng ô — không có bản thứ hai trôi
     · mọi bước trỏ vào một màn CÓ THẬT trong src/
     · tự học: chỉ chính người học đánh dấu, phải kèm một câu
     · người chấm: không tự chấm (kể cả gửi email của chính mình), đúng bậc,
       điểm 0–100, dưới ngưỡng thì chưa xong
     · máy đọc: không ai ghi được bước ba cửa, máy đọc thẳng baCuaConNguoi
     · chứng chỉ: máy chủ kiểm đủ điều kiện lúc ký, không tự ký, không ký trùng,
       thu hồi phải có lý do
     · đọc tiến độ người khác chỉ từ R01–R06; khách hàng bị chặn
     · bảng không có cột tóm tắt kiểu "đã đủ"; cửa nối vào worker
     · PHÁ THỬ: gỡ cổng tự chấm → phép đo tự chấm phải đỏ
   Dùng: node tools/thu-dao-tao-ct.mjs   (Node >= 22.5) */
import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import vm from 'node:vm';
import { pathToFileURL, fileURLToPath } from 'node:url';
const ROOT = process.argv[2] || fileURLToPath(new URL('..', import.meta.url)).replace(/[\\/]$/, '');

let dat = 0, truot = 0;
const kiem = (ten, dk, ct) => { if (dk) { dat++; console.log('OK  ' + ten); } else { truot++; console.log('SAI ' + ten + (ct ? ' — ' + ct : '')); } };

function moDb() {
  const sq = new DatabaseSync(':memory:');
  sq.exec(fs.readFileSync(ROOT + '/may-chu/csdl.sql', 'utf8'));
  const db = {
    prepare(sql) { let a = []; const st = {
      bind(...x) { a = x; return st; },
      first() { return Promise.resolve(sq.prepare(sql).get(...a) || null); },
      all() { return Promise.resolve({ results: sq.prepare(sql).all(...a) }); },
      run() { const r = sq.prepare(sql).run(...a); return Promise.resolve({ meta: { changes: Number(r.changes) } }); } }; return st; },
    async batch(ds) { sq.exec('BEGIN'); try { for (const s of ds) await s.run(); sq.exec('COMMIT'); } catch (e) { sq.exec('ROLLBACK'); throw e; } }
  };
  const nguoi = [['U1', 'chu', 'chu@gita365.vn', 'R01'], ['U2', 'admin', 'ad@gita365.vn', 'R02'], ['U3', 'giamdoc', 'gd@gita365.vn', 'R03'],
    ['U5', 'truongcoach', 'tc@gita365.vn', 'R05'], ['U6', 'senior', 'sr@gita365.vn', 'R06'],
    ['U7', 'coach1', 'c1@gita365.vn', 'R07'], ['U11', 'tuvan1', 'tv1@gita365.vn', 'R11'],
    ['U12', 'tuvan2', 'tv2@gita365.vn', 'R11'], ['U13', 'ph1', 'ph1@gita365.vn', 'R13']];
  for (const [id, u, e, r] of nguoi)
    sq.prepare('INSERT INTO users (id, username, email, role, active) VALUES (?,?,?,?,1)').run(id, u, e, r);
  sq.prepare("INSERT INTO users (id, username, email, role, active) VALUES ('U99','nghiviec','nv@gita365.vn','R11',0)").run();
  return { sq, db };
}
const ho = (u, role, uid) => ({ u, role, uid });
const chu = ho('chu', 'R01', 'U1'), ad = ho('admin', 'R02', 'U2'), gd = ho('giamdoc', 'R03', 'U3'), tc = ho('truongcoach', 'R05', 'U5'),
  sr = ho('senior', 'R06', 'U6'), c1 = ho('coach1', 'R07', 'U7'), tv1 = ho('tuvan1', 'R11', 'U11'),
  tv2 = ho('tuvan2', 'R11', 'U12'), ph = ho('ph1', 'R13', 'U13');
const CAU = 'Tôi sẽ hỏi mở trước rồi mới giới thiệu gói, và ghi lại lời khách.';
globalThis.fetch = async () => { throw new Error('không gọi mạng ngoài trong bộ thử'); };

/* ── 1. bản màn ↔ bản máy chủ ── */
const M = await import(pathToFileURL(ROOT + '/may-chu/dao-tao-ct.js').href);
const nguonMan = fs.readFileSync(ROOT + '/src/dao-tao-ct.js', 'utf8');
const sb = { window: {}, document: { addEventListener() {} } };
sb.window.G = { U: { h: s => String(s), ic: () => '' }, VIEWS: {} };
vm.createContext(sb); vm.runInContext(nguonMan, sb);
const ban = c => JSON.stringify(c.map(p => ({ ma: p.ma, ten: p.ten, vaiChinh: p.vaiChinh, chamToi: p.chamToi, capToi: p.capToi,
  buoc: p.buoc.map(b => ({ ma: b.ma, loai: b.loai, man: b.man, ten: b.ten, nguong: b.nguong, cua: b.cua })) })));
kiem('G.DTC_CT (màn) khớp CT (máy chủ) từng ô', ban(sb.window.G.DTC_CT) === ban(M.CT));
kiem('thứ tự chương trình: Tư vấn → Nhân sự → Coach', M.CT.map(c => c.ma).join('>') === 'tuvan>nhansu>coach');
kiem('mỗi bước khai đúng một trong ba loại', M.CT.every(c => c.buoc.every(b => M.LOAI.includes(b.loai))));
kiem('bước người-chấm có ngưỡng; bước máy-đọc có danh sách cửa', M.CT.every(c => c.buoc.every(b =>
  (b.loai !== 'nguoiCham' || (b.nguong > 0 && b.nguong <= 100)) && (b.loai !== 'mayCham' || (Array.isArray(b.cua) && b.cua.length)))));
kiem('mỗi chương trình có ít nhất một bước người-chấm (không chứng chỉ nào chỉ dựa vào lời khai)',
  M.CT.every(c => c.buoc.some(b => b.loai === 'nguoiCham')));
/* Màn thật = mục trong G.NAV (data.core.js). Dò G.VIEWS['x'] thôi thì hụt
   các màn đăng ký qua biến (coach-ct) hay qua vòng lặp (kn-*) — bắt oan. */
const nav = fs.readFileSync(ROOT + '/src/data.core.js', 'utf8');
const manThieu = [...new Set(M.CT.flatMap(c => c.buoc.map(b => b.man)))].filter(v => !nav.includes("v:'" + v + "'"));
kiem('mọi bước trỏ vào một màn có thật trong G.NAV', !manThieu.length, manThieu.join(', '));
/* Vai chính của mỗi chương trình phải MỞ được mọi bài của nó — không thì
   người học tự khai "đã học" một bài họ không đọc được. Đọc thẳng G.NAV ·
   G.PERM · G.PHANQUYEN_GOC từ data.core.js, cùng luật G.vaiCo. */
const sbd = { window: {} }; sbd.window.G = {}; vm.createContext(sbd);
vm.runInContext(fs.readFileSync(ROOT + '/src/data.core.js', 'utf8'), sbd);
const GD = sbd.window.G;
const muc = {}; GD.NAV.forEach(n => (n.items || []).forEach(it => { muc[it.v] = it; }));
const lvVai = id => (GD.ROLES.find(r => r.id === id) || {}).lv;
const moDuoc = (vai, man) => { const p = (muc[man] || {}).perm; if (!p) return true;
  const ov = (GD.PHANQUYEN_GOC || {})[vai]; if (ov && (ov.cam || []).includes(p)) return false;
  if (ov && (ov.cho || []).includes(p)) return true; return GD.PERM[p] !== undefined && lvVai(vai) <= GD.PERM[p]; };
const khongMo = M.CT.flatMap(c => c.vaiChinh.flatMap(v => c.buoc.filter(b => !moDuoc(v, b.man)).map(b => c.ma + ':' + v + '→' + b.ma + '(' + b.man + ')')));
kiem('vai chính của mỗi chương trình mở được mọi bài của nó', GD.NAV.length > 0 && !khongMo.length, khongMo.join(', '));
const cauMan = Number((nguonMan.match(/var CAU = (\d+);/) || [])[1]);
kiem('ngưỡng câu bắt buộc ở màn bằng ngưỡng ở máy chủ', cauMan === M.CAU_TOI_THIEU, cauMan + ' ≠ ' + M.CAU_TOI_THIEU);

/* ── 2. hành vi ── */
async function chay(Mod, ghi) {
  const { sq, db } = moDb(); const env = {};
  const r = {};
  r.khach = await Mod.docDaoTao({}, env, db, ph);
  r.gdKhach = await Mod.ghiDanhDaoTao({ ct: 'tuvan' }, env, db, ph);
  r.chuaGD = await Mod.ghiBuocDaoTao({ ct: 'tuvan', buoc: 'TV01', ghiChu: CAU }, env, db, tv1);
  r.gd = await Mod.ghiDanhDaoTao({ ct: 'tuvan' }, env, db, tv1);
  r.gd2 = await Mod.ghiDanhDaoTao({ ct: 'tuvan' }, env, db, tv1);
  r.gdHoThap = await Mod.ghiDanhDaoTao({ ct: 'tuvan', maNguoi: 'tuvan2' }, env, db, tv1);
  r.gdHo = await Mod.ghiDanhDaoTao({ ct: 'tuvan', maNguoi: 'tv2@gita365.vn' }, env, db, sr);
  r.gdKhachHo = await Mod.ghiDanhDaoTao({ ct: 'tuvan', maNguoi: 'ph1' }, env, db, chu);
  r.gdNgoaiVai = await Mod.ghiDanhDaoTao({ ct: 'coach' }, env, db, tv1);
  r.xemKhach = await Mod.docDaoTao({ maNguoi: 'ph1' }, env, db, chu);
  r.gdNghi = await Mod.ghiDanhDaoTao({ ct: 'tuvan', maNguoi: 'nghiviec' }, env, db, chu);
  r.cauNgan = await Mod.ghiBuocDaoTao({ ct: 'tuvan', buoc: 'TV01', ghiChu: 'đã đọc' }, env, db, tv1);
  r.hoTuHoc = await Mod.ghiBuocDaoTao({ ct: 'tuvan', buoc: 'TV01', maNguoi: 'tuvan1', ghiChu: CAU }, env, db, chu);
  for (const b of ['TV01', 'TV02', 'TV03', 'TV04', 'TV05', 'TV06'])
    r['tu' + b] = await Mod.ghiBuocDaoTao({ ct: 'tuvan', buoc: b, ghiChu: CAU }, env, db, tv1);
  r.mayGhi = await Mod.ghiBuocDaoTao({ ct: 'tuvan', buoc: 'TV09', ghiChu: CAU }, env, db, chu);
  r.tuCham = await Mod.ghiBuocDaoTao({ ct: 'tuvan', buoc: 'TV07', diem: 95, ghiChu: CAU }, env, db, tv1);
  /* email của chính mình: chuỗi khác hẳn username, vẫn là cùng một người */
  r.tuChamEmail = await Mod.ghiBuocDaoTao({ ct: 'tuvan', buoc: 'TV07', maNguoi: 'tv1@gita365.vn', diem: 95, ghiChu: CAU },
    env, db, ho('tv1@gita365.vn', 'R11', 'U11'));
  /* tự chấm khi CÓ đủ bậc: R06 ghi danh Coach rồi chấm bước của chính mình */
  await Mod.ghiDanhDaoTao({ ct: 'coach' }, env, db, sr);
  r.tuChamCoBac = await Mod.ghiBuocDaoTao({ ct: 'coach', buoc: 'CO07', diem: 95, ghiChu: CAU }, env, db, sr);
  r.tuChamCoBacEmail = await Mod.ghiBuocDaoTao({ ct: 'coach', buoc: 'CO07', maNguoi: 'sr@gita365.vn', diem: 95, ghiChu: CAU }, env, db, sr);
  r.chamThap = await Mod.ghiBuocDaoTao({ ct: 'tuvan', buoc: 'TV07', maNguoi: 'tuvan1', diem: 90, ghiChu: CAU }, env, db, tc);
  r.diemSai = await Mod.ghiBuocDaoTao({ ct: 'tuvan', buoc: 'TV07', maNguoi: 'tuvan1', diem: 120, ghiChu: CAU }, env, db, chu);
  r.nhanXetNgan = await Mod.ghiBuocDaoTao({ ct: 'tuvan', buoc: 'TV07', maNguoi: 'tuvan1', diem: 90, ghiChu: 'tốt' }, env, db, chu);
  r.duoiNguong = await Mod.ghiBuocDaoTao({ ct: 'tuvan', buoc: 'TV07', maNguoi: 'tuvan1', diem: 60, ghiChu: CAU }, env, db, chu);
  r.doc1 = await Mod.docDaoTao({}, env, db, tv1);
  r.kyThieu = await Mod.capChungChiDaoTao({ ct: 'tuvan', maNguoi: 'tuvan1' }, env, db, gd);
  r.chamLai = await Mod.ghiBuocDaoTao({ ct: 'tuvan', buoc: 'TV07', maNguoi: 'tuvan1', diem: 88, ghiChu: CAU }, env, db, chu);
  r.chamSH = await Mod.ghiBuocDaoTao({ ct: 'tuvan', buoc: 'TV08', maNguoi: 'tuvan1', diem: 75, ghiChu: CAU }, env, db, gd);
  r.kyChuaCua = await Mod.capChungChiDaoTao({ ct: 'tuvan', maNguoi: 'tuvan1' }, env, db, gd);
  const luc = new Date().toISOString();
  /* Sổ ba cửa ghi tên đúng như người ta gõ: viết hoa, hoặc email — phải vẫn khớp. */
  for (const c of ['C1', 'C2', 'C3'])
    sq.prepare("INSERT INTO baCuaConNguoi (id, maNguoi, cua, nguon, ngayQua, boiAi, ghiLuc) VALUES (?,?,?,?,?,?,?)")
      .run('BC' + c, c === 'C3' ? 'tv1@gita365.vn' : 'TuVan1', c, c === 'C3' ? 'khaiCu' : 'quaCua', luc, 'chu', luc);
  r.doc2 = await Mod.docDaoTao({}, env, db, tv1);
  r.kyThapBac = await Mod.capChungChiDaoTao({ ct: 'tuvan', maNguoi: 'tuvan1' }, env, db, tc);
  r.tuKy = await Mod.capChungChiDaoTao({ ct: 'tuvan', maNguoi: 'giamdoc' }, env, db, gd);
  r.chamVaKy = await Mod.capChungChiDaoTao({ ct: 'tuvan', maNguoi: 'tuvan1' }, env, db, gd);
  r.ky = await Mod.capChungChiDaoTao({ ct: 'tuvan', maNguoi: 'tuvan1' }, env, db, ad);
  r.kyTrung = await Mod.capChungChiDaoTao({ ct: 'tuvan', maNguoi: 'tuvan1' }, env, db, chu);
  r.thuKhongLyDo = await Mod.thuHoiChungChiDaoTao({ ct: 'tuvan', maNguoi: 'tuvan1', lyDo: 'sai' }, env, db, chu);
  r.thuThapHon = await Mod.thuHoiChungChiDaoTao({ ct: 'tuvan', maNguoi: 'tuvan1', lyDo: 'Phát hiện cuộc chấm TV07 không có người kèm thật.' }, env, db, gd);
  r.thu = await Mod.thuHoiChungChiDaoTao({ ct: 'tuvan', maNguoi: 'tuvan1', lyDo: 'Phát hiện cuộc chấm TV07 không có người kèm thật.' }, env, db, chu);
  r.doc3 = await Mod.docDaoTao({}, env, db, tv1);
  r.xemNguoiKhacThap = await Mod.docDaoTao({ maNguoi: 'tuvan1' }, env, db, tv2);
  r.xemNguoiKhac = await Mod.docDaoTao({ maNguoi: 'tuvan1' }, env, db, sr);
  r.doiThap = await Mod.doiDaoTao({ ct: 'tuvan' }, env, db, c1);
  r.doi = await Mod.doiDaoTao({ ct: 'tuvan' }, env, db, sr);
  sq.prepare("UPDATE users SET role = 'R13' WHERE username = 'tuvan2'").run();
  r.chamSauDoiVai = await Mod.ghiBuocDaoTao({ ct: 'tuvan', buoc: 'TV07', maNguoi: 'tuvan2', diem: 90, ghiChu: CAU }, env, db, chu);
  r.soDongBuoc = sq.prepare("SELECT COUNT(*) n FROM dtBuoc WHERE buoc = 'TV07'").get().n;
  return r;
}

const r = await chay(M);
const tt = (d, ma) => d && d.ok && d.ct.find(x => x.ct === ma);
const bc = (d, ma, b) => tt(d, ma) && tt(d, ma).buoc.find(x => x.ma === b);
kiem('khách hàng (R13) không đọc được chương trình', r.khach.code === 'NOPERM');
kiem('khách hàng không ghi danh được', r.gdKhach.code === 'NOPERM');
kiem('chưa ghi danh thì không đánh dấu được', r.chuaGD.code === 'CHUAGHIDANH');
kiem('ghi danh chính mình được; ghi lần hai không thêm dòng', r.gd.ok && r.gd2.ok && r.gd2.daCo);
kiem('R11 không ghi danh hộ người khác', r.gdHoThap.code === 'NOPERM');
kiem('R06 ghi danh hộ được (tra cả bằng email)', r.gdHo.ok && !r.gdHo.daCo);
kiem('không ghi danh khách hàng vào chương trình nhân sự', r.gdKhachHo.code === 'NGOAIVAI');
kiem('R11 không ghi danh vào chương trình Coach (ngoài vai chính)', r.gdNgoaiVai.code === 'NGOAIVAI');
kiem('không đọc tiến độ của tài khoản khách hàng, kể cả R01', r.xemKhach.code === 'NOPERM');
kiem('tài khoản đã khoá không tra ra → đóng', r.gdNghi.code === 'KHONGNGUOI');
kiem('tự học thiếu câu bị từ chối', r.cauNgan.code === 'THIEUCAU');
kiem('người khác không đánh dấu tự học hộ, kể cả Super Admin', r.hoTuHoc.code === 'TUHOC');
kiem('sáu bước tự học ghi được', ['TV01', 'TV02', 'TV03', 'TV04', 'TV05', 'TV06'].every(b => r['tu' + b].ok));
kiem('bước máy-đọc không ghi được từ cửa này', r.mayGhi.code === 'MAYCHAM');
kiem('không tự chấm bước người-chấm', r.tuCham.code === 'TUCHAM');
kiem('không tự chấm kể cả khi gửi email của chính mình', r.tuChamEmail.code === 'TUCHAM', JSON.stringify(r.tuChamEmail));
kiem('người đủ bậc chấm (R06) vẫn không tự chấm bước của mình, kể cả qua email', r.tuChamCoBac.code === 'TUCHAM' && r.tuChamCoBacEmail.code === 'TUCHAM');
kiem('R05 không chấm được chương trình Tư vấn (chamToi R04)', r.chamThap.code === 'NOPERM');
kiem('điểm ngoài 0–100 bị từ chối', r.diemSai.code === 'SAI');
kiem('chấm thiếu nhận xét bị từ chối', r.nhanXetNgan.code === 'THIEUCAU');
kiem('điểm dưới ngưỡng ghi được nhưng bước CHƯA xong', r.duoiNguong.ok && r.duoiNguong.dat === false && bc(r.doc1, 'tuvan', 'TV07').xong === false);
kiem('tiến độ hiện người chấm và điểm lượt cuối', bc(r.doc1, 'tuvan', 'TV07').boiAi === 'chu' && bc(r.doc1, 'tuvan', 'TV07').diem === 60);
kiem('ký khi chưa đủ → CHUADU kèm danh sách thiếu', r.kyThieu.code === 'CHUADU' && r.kyThieu.thieu.includes('TV07') && r.kyThieu.thieu.includes('TV09'));
kiem('chấm lại thêm dòng mới, dòng cuối thắng (lịch sử còn nguyên)', r.chamLai.ok && r.soDongBuoc === 2 && bc(r.doc2, 'tuvan', 'TV07').diem === 88);
kiem('chưa qua ba cửa thì vẫn chưa đủ', r.kyChuaCua.code === 'CHUADU' && r.kyChuaCua.thieu.join() === 'TV09');
kiem('máy đọc ba cửa từ baCuaConNguoi, khớp cả tên viết hoa lẫn email: đủ C1·C2·C3 → bước xong', bc(r.doc2, 'tuvan', 'TV09').xong === true);
kiem('cửa khai hộ được NÓI RA, không lẫn vào phép đo', bc(r.doc2, 'tuvan', 'TV09').coKhaiCu === true);
kiem('máy đọc ba cửa cũng phủ chương trình chưa ghi danh (Coach CO09 xong theo sổ)', bc(r.doc2, 'coach', 'CO09').xong === true);
const tl = tt(r.doc2, 'tuvan').theoLoai;
kiem('đủ điều kiện tính lúc đọc; tiến độ đếm RIÊNG từng loại bước', tt(r.doc2, 'tuvan').duDieuKien === true &&
  JSON.stringify(tl) === JSON.stringify({ tuHoc: { xong: 6, tong: 6 }, nguoiCham: { xong: 2, tong: 2 }, mayCham: { xong: 1, tong: 1 } }), JSON.stringify(tl));
kiem('không trả về phân số chung gộp mọi loại bước', !('soXong' in tt(r.doc2, 'tuvan')) && !('soBuoc' in tt(r.doc2, 'tuvan')));
kiem('R05 không ký chứng chỉ Tư vấn (capToi R03)', r.kyThapBac.code === 'NOPERM');
kiem('không tự ký chứng chỉ cho mình', r.tuKy.code === 'TUCAP');
kiem('người đã chấm một bước không ký chứng nhận của người ấy', r.chamVaKy.code === 'CHAMVAKY');
kiem('người ký khác người chấm (R02) ký được khi đủ điều kiện', r.ky.ok);
kiem('không ký trùng khi chứng chỉ còn hiệu lực', r.kyTrung.code === 'DACO');
kiem('R03 không thu hồi chữ ký của R02', r.thuThapHon.code === 'NOPERM');
kiem('thu hồi thiếu lý do bị từ chối', r.thuKhongLyDo.code === 'THIEUCAU');
kiem('thu hồi có lý do → chứng chỉ hết hiệu lực, lý do đọc lại được', r.thu.ok && !tt(r.doc3, 'tuvan').chungChi && /không có người kèm/.test(tt(r.doc3, 'tuvan').daThuHoi.lyDo));
kiem('R11 không xem được tiến độ người khác', r.xemNguoiKhacThap.code === 'NOPERM');
kiem('R06 xem được tiến độ người mình kèm', r.xemNguoiKhac.ok && r.xemNguoiKhac.maNguoi === 'tuvan1');
kiem('R07 không xem được bảng đội', r.doiThap.code === 'NOPERM');
kiem('đổi vai sang khách hàng thì không chấm tiếp được', r.chamSauDoiVai.code === 'NGOAIVAI');
kiem('bảng đội liệt kê đủ người đã ghi danh', r.doi.ok && r.doi.ds.map(d => d.maNguoi).sort().join() === 'tuvan1,tuvan2');

/* ── 3. tĩnh ── */
const sql = fs.readFileSync(ROOT + '/may-chu/csdl.sql', 'utf8');
const cotBang = ten => { const m = sql.match(new RegExp('CREATE TABLE IF NOT EXISTS ' + ten + ' \\(([\\s\\S]*?)\\n\\);')); return m ? m[1] : ''; };
const coCam = ['dtGhiDanh', 'dtBuoc', 'dtChungChi'].flatMap(t =>
  M.COT_CAM.filter(c => new RegExp('^\\s*' + c + '\\b', 'm').test(cotBang(t))).map(c => t + '.' + c));
kiem('ba bảng có mặt trong csdl.sql', ['dtGhiDanh', 'dtBuoc', 'dtChungChi'].every(t => cotBang(t)));
kiem('không bảng nào có cột tóm tắt "đã đủ / tiến độ"', !coCam.length, coCam.join(', '));
const wk = fs.readFileSync(ROOT + '/may-chu/worker.js', 'utf8');
const CUA = ['docDaoTao', 'ghiDanhDaoTao', 'ghiBuocDaoTao', 'capChungChiDaoTao', 'thuHoiChungChiDaoTao', 'doiDaoTao'];
const canPhien = (wk.match(/const CAN_PHIEN = \[([\s\S]*?)\];/) || [])[1] || '';
kiem('sáu cửa nằm trong CAN_PHIEN và có đường gọi', CUA.every(f => canPhien.includes("'" + f + "'") && wk.includes("fn === '" + f + "'")));
const manBo = nguonMan.replace(/\/\*[\s\S]*?\*\//g, '');
kiem('màn không đọc phân số chung soXong/soBuoc (máy chủ không trả về nữa)', !/soXong|soBuoc/.test(manBo));
kiem('màn không gọi mạng thẳng và không giữ tiến độ trong máy', !/fetch\(|localStorage|sessionStorage/.test(manBo));
kiem('màn có trong danh sách gộp và cột trái', fs.readFileSync(ROOT + '/tools/danh-sach-src.json', 'utf8').includes('src/dao-tao-ct.js') &&
  /v:'chuong-trinh-dt'/.test(fs.readFileSync(ROOT + '/src/data.core.js', 'utf8')));

/* ── 4. phá thử: gỡ cổng tự chấm → phép đo phải đỏ ── */
const tamP = ROOT + '/may-chu/_pha-dao-tao-ct.js';
const goc = fs.readFileSync(ROOT + '/may-chu/dao-tao-ct.js', 'utf8');
const pha = goc.replace("if (ai.uid === minh.uid) return { ok: false, code: 'TUCHAM',", "if (false) return { ok: false, code: 'TUCHAM',");
kiem('phá thử: bản phá khác bản gốc', pha !== goc);
try {
  fs.writeFileSync(tamP, pha);
  const P = await import(pathToFileURL(tamP).href + '?v=' + Date.now());
  const rp = await chay(P);
  kiem('phá thử: gỡ cổng tự chấm thì người học tự chấm được (phép đo đỏ đúng chỗ)', rp.tuChamCoBac.ok === true && rp.tuChamCoBacEmail.ok === true);
} finally { fs.rmSync(tamP, { force: true }); }

console.log('\n' + dat + ' đạt · ' + truot + ' sai');
process.exit(truot ? 1 : 0);
