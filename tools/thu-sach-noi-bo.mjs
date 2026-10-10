/* Thử SÁCH NỘI BỘ (may-chu/sach-noi-bo.js) — sổ tri thức "Cây Tiền".
   D1 giả = node:sqlite. Đo: cổng nạp chỉ Super Admin, đọc chỉ R01–R11, mỗi
   lượt đọc có nhật ký, soát chương chặn trích dài (chép sách) và ngăn lạ,
   nạp cả lô hoặc không gì; và vệ sinh kho mã — sách có bản quyền, kho mã
   công khai, nên chỉ gói .enc được nằm trong kho. Mỗi cổng có phá thử.
   Dùng: node tools/thu-sach-noi-bo.mjs   (Node >= 22.5) */
import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { pathToFileURL, fileURLToPath } from 'node:url';
const ROOT = fileURLToPath(new URL('..', import.meta.url)).replace(/[\\/]$/, '');
globalThis.fetch = async () => { throw new Error('không gọi mạng ngoài'); };
let dat = 0, truot = 0;
const kiem = (ten, dk, ct) => { if (dk) { dat++; console.log('OK  ' + ten); } else { truot++; const d = 'SAI ' + ten + (ct ? ' — ' + ct : ''); console.log(d);
  if (process.env.GITHUB_ACTIONS) console.log('::error title=thu-sach-noi-bo::' + d.replace(/[\r\n%]/g, ' ').slice(0, 900)); } };

function dung() {
  const sq = new DatabaseSync(':memory:');
  sq.exec(fs.readFileSync(ROOT + '/may-chu/csdl.sql', 'utf8'));
  const db = { prepare(sql) { let a = []; const st = { bind(...x) { a = x; return st; },
      first() { try { return Promise.resolve(sq.prepare(sql).get(...a) || null); } catch (e) { return Promise.reject(e); } },
      all() { try { return Promise.resolve({ results: sq.prepare(sql).all(...a) }); } catch (e) { return Promise.reject(e); } },
      run() { try { const r = sq.prepare(sql).run(...a); return Promise.resolve({ meta: { changes: Number(r.changes) } }); } catch (e) { return Promise.reject(e); } } }; return st; },
    async batch(ds) { sq.exec('BEGIN'); try { for (const s of ds) await s.run(); sq.exec('COMMIT'); } catch (e) { sq.exec('ROLLBACK'); throw e; } } };
  return { sq, db };
}
const ho = (u, role, uid) => ({ u, role, uid });
const chu = ho('chu', 'R01', 'U1'), ad = ho('admin', 'R02', 'U2'), tv = ho('tuvan', 'R11', 'U11'), ld = ho('lead', 'R12', 'U12'), ph = ho('ph', 'R13', 'P1');
/* Chương mẫu TỰ VIẾT cho bộ thử — không một chữ của sách (kho mã công khai). */
const chuong = (ma, them) => Object.assign({ ma, ten: 'Chương thử ' + ma, trang: '1–2',
  tomTat: 'Tóm tắt thử dài đủ tám mươi ký tự để qua soát, viết riêng cho bộ thử và không lấy từ sách nào cả, chỉ để đo cổng.',
  muc: [{ ma: ma + '.1', ten: 'Mục thử', trang: '1', yChinh: ['ý một', 'ý hai', 'ý ba'], chuanSo: [{ noi: 'chuẩn thử', trang: '1' }],
    trich: [{ cau: 'câu trích thử ngắn', trang: '1' }], apGita: ['áp thử'], noiVvip: ['hoso'] }], canhBao: ['cảnh báo thử'] }, them || {});

async function chay(S) {
  const { sq, db } = dung(), env = {}, r = {};
  r.napAd = await S.napSachNoiBo({ sach: 'cay-tien', ds: [chuong('C1')] }, env, db, ad);
  r.dsTruoc = await S.dsSachNoiBo({ sach: 'cay-tien' }, env, db, tv);
  r.napLaSach = await S.napSachNoiBo({ sach: 'sach-la', ds: [chuong('C1')] }, env, db, chu);
  const dai = chuong('C2'); dai.muc[0].trich = [{ cau: Array(45).fill('chữ').join(' '), trang: '9' }];
  r.napDai = await S.napSachNoiBo({ sach: 'cay-tien', ds: [chuong('C1'), dai] }, env, db, chu);
  r.demSauDai = sq.prepare('SELECT COUNT(*) n FROM sachNoiBo').get().n;
  const la = chuong('C3'); la.muc[0].noiVvip = ['khongCo'];
  r.napNganLa = await S.napSachNoiBo({ sach: 'cay-tien', ds: [la] }, env, db, chu);
  const thieu = chuong('C4'); thieu.muc[0].yChinh = ['một ý'];
  r.napThieu = await S.napSachNoiBo({ sach: 'cay-tien', ds: [thieu] }, env, db, chu);
  r.nap = await S.napSachNoiBo({ sach: 'cay-tien', ds: [chuong('C1'), chuong('C2')], ban: 'SACH-thu' }, env, db, chu);
  r.dsTv = await S.dsSachNoiBo({ sach: 'cay-tien' }, env, db, tv);
  r.dsLd = await S.dsSachNoiBo({ sach: 'cay-tien' }, env, db, ld);
  r.dsPh = await S.dsSachNoiBo({ sach: 'cay-tien' }, env, db, ph);
  r.docTv = await S.docSachNoiBo({ sach: 'cay-tien', chuong: 'C2' }, env, db, tv);
  r.docPh = await S.docSachNoiBo({ sach: 'cay-tien', chuong: 'C2' }, env, db, ph);
  r.docChuaNap = await S.docSachNoiBo({ sach: 'cay-tien', chuong: 'C8' }, env, db, tv);
  r.docSai = await S.docSachNoiBo({ sach: 'cay-tien', chuong: "C1' OR 1=1" }, env, db, tv);
  r.nhatKy = sq.prepare("SELECT viec, username, doiTuong FROM audit WHERE viec LIKE 'SACH_%' ORDER BY luc").all();
  return r;
}

const S = await import(pathToFileURL(ROOT + '/may-chu/sach-noi-bo.js').href);
const r = await chay(S);
console.log('— cổng');
kiem('Admin hệ thống (R02) không nạp được — chỉ Super Admin', r.napAd.code === 'NOPERM');
kiem('chưa nạp: mục lục rỗng và nói cách nạp, không trả 0 chương như đủ', r.dsTruoc.ok && r.dsTruoc.ds.length === 0 && /Super Admin/.test(r.dsTruoc.vi || ''));
kiem('sách ngoài danh mục bị từ chối', r.napLaSach.code === 'SAI');
kiem('trích dài hơn 40 chữ bị chặn (trích dài là chép sách)', r.napDai.code === 'HONG' && /trich0\.dai/.test(r.napDai.hong.join(' ')));
kiem('một chương hỏng thì không nạp chương nào (cả lô hoặc không gì)', r.demSauDai === 0);
kiem('ngăn Phòng VVIP lạ bị chặn', r.napNganLa.code === 'HONG' && /noiVvip/.test(r.napNganLa.hong.join(' ')));
kiem('mục dưới ba ý chính bị chặn', r.napThieu.code === 'HONG' && /yChinh/.test(r.napThieu.hong.join(' ')));
kiem('Super Admin nạp được hai chương', r.nap.ok && r.nap.nap === 2);
kiem('tư vấn R11 đọc mục lục — chỉ tên mục, không nội dung', r.dsTv.ok && r.dsTv.ds.length === 2 && !('yChinh' in r.dsTv.ds[0].muc[0]) && r.dsTv.du === false);
kiem('R12 trở xuống không đọc được (đúng bậc pro_consult R01–R11)', r.dsLd.code === 'NOPERM');
kiem('phụ huynh không đọc được mục lục lẫn chương', r.dsPh.code === 'NOPERM' && r.docPh.code === 'NOPERM');
kiem('R11 đọc trọn một chương', r.docTv.ok && r.docTv.chuong.ma === 'C2' && r.docTv.chuong.muc[0].yChinh.length === 3);
kiem('chương chưa nạp nói rõ, không trả rỗng', r.docChuaNap.code === 'CHUANAP');
kiem('mã chương lạ bị chặn trước khi chạm cơ sở dữ liệu', r.docSai.code === 'SAI');
kiem('nhật ký: một dòng SACH_NAP và một dòng SACH_DOC mang tên người đọc', r.nhatKy.filter(x => x.viec === 'SACH_NAP').length === 1 &&
  r.nhatKy.some(x => x.viec === 'SACH_DOC' && x.username === 'tuvan' && x.doiTuong === 'cay-tien:C2'), JSON.stringify(r.nhatKy));

console.log('— vệ sinh kho mã (sách có bản quyền, kho mã công khai)');
const thuMuc = ROOT + '/kho-sach';
const tep = fs.existsSync(thuMuc) ? fs.readdirSync(thuMuc) : [];
kiem('kho-sach/ chỉ chứa gói .enc', tep.length > 0 && tep.every(f => /\.enc$/.test(f)), tep.join(','));
if (tep.includes('cay-tien.enc')) {
  const g = JSON.parse(fs.readFileSync(thuMuc + '/cay-tien.enc', 'utf8'));
  kiem('gói Cây Tiền đúng định dạng AES-256-GCM, PBKDF2 ≥ 250.000 vòng', g.v === 1 && g.sach === 'cay-tien' && g.n >= 250000 && g.salt && g.iv && g.ct && /^SACH-cay-tien-/.test(g.ban));
  kiem('gói không lộ chữ trần (không có trường nội dung ngoài ct)', Object.keys(g).sort().join(',') === 'ban,ct,iv,n,sach,salt,v');
}
const gi = fs.readFileSync(ROOT + '/.gitignore', 'utf8');
kiem('.gitignore chặn nguồn biên soạn và bản mở ra', /^kho-sach-nguon\/$/m.test(gi) && /^kho-sach-mo\/$/m.test(gi) && /^kho-sach\/\*\.json$/m.test(gi));
let theoGit = [];
try { theoGit = execFileSync('git', ['ls-files', 'kho-sach', 'kho-sach-nguon', 'kho-sach-mo'], { cwd: ROOT, encoding: 'utf8' }).split('\n').filter(Boolean); } catch (e) {}
kiem('git chỉ theo dõi tệp .enc trong kho-sach', theoGit.every(f => /^kho-sach\/[^/]+\.enc$/.test(f)), theoGit.join(','));
const ds = fs.readFileSync(ROOT + '/tools/dung-site.sh', 'utf8');
kiem('trang công khai mang gói sách (chỉ .enc) — không thì nút nạp nhận 404', /kho-sach/.test(ds) && /-name '\*\.enc'/.test(ds));
const man = fs.readFileSync(ROOT + '/src/phong-vvip.js', 'utf8');
kiem('màn mở gói bằng hàm chung, mật khẩu không gửi lên máy chủ', /G\.moGoiMaHoa\(mk, 'kho-sach\/cay-tien\.enc'\)/.test(man) && !/napSachNoiBo[^)]*mk/.test(man));
const wk = fs.readFileSync(ROOT + '/may-chu/worker.js', 'utf8');
kiem('ba cửa sách nằm sau cổng phiên và có đường gọi', ['napSachNoiBo', 'dsSachNoiBo', 'docSachNoiBo'].every(f =>
  wk.slice(wk.indexOf('CAN_PHIEN')).includes("'" + f + "'") && new RegExp("fn === '" + f + "'\\) return await " + f).test(wk)));

console.log('— phá thử');
const goc = fs.readFileSync(ROOT + '/may-chu/sach-noi-bo.js', 'utf8');
let lanPha = 0;
async function pha(ten, cu, moi, thay) {
  if (!goc.includes(cu)) { kiem('phá thử ' + ten + ': tìm thấy chỗ phá', false); return; }
  const tam = ROOT + '/may-chu/.pha-sach-' + process.pid + '-' + (++lanPha) + '.mjs';  /* tên riêng mỗi lượt — cùng tên thì Node dùng lại bản nạp lần đầu */
  fs.writeFileSync(tam, goc.replace(cu, moi));
  try { const rp = await chay(await import(pathToFileURL(tam).href)); kiem('phá thử ' + ten + ': phép đo đỏ đúng chỗ', thay(rp)); }
  finally { fs.unlinkSync(tam); }
}
await pha('bỏ cổng Super Admin khi nạp', "if (BAC[roleOf(hoSo)] !== 1) return { ok: false, code: 'NOPERM', error: 'Chỉ Super Admin nạp sách nội bộ.' };", '', rp => rp.napAd.ok === true);
await pha('nới bậc đọc tới khách', 'export const BAC_DOC = 11;', 'export const BAC_DOC = 15;', rp => rp.dsPh.ok === true);
await pha('bỏ trần trích', 'if (soChu(t && t.cau) > TRAN_TRICH)', 'if (false)', rp => rp.napDai.ok === true);
await pha('bỏ nhật ký đọc', "viec: 'SACH_DOC'", "viec: 'X'", rp => !rp.nhatKy.some(x => x.viec === 'SACH_DOC'));

console.log('\n' + dat + ' đạt · ' + truot + ' sai');
process.exit(truot ? 1 : 0);
