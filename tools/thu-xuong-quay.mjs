/* Kiểm xưởng quay khớp môi 0 đồng (may-chu/xuong-quay.js) với D1 giả lập
   bằng SQLite thật (node:sqlite) và R2 giả lập bằng Map.
   Chạy: node tools/thu-xuong-quay.mjs */
import { DatabaseSync } from 'node:sqlite';
import { quayKhopMoi, quayChuyenDong, quayXem, xuLyMayQuay, phucVuPhimQuay, donQuay, QUAY, bangNhau } from '../may-chu/xuong-quay.js';

let dat = 0, hong = 0;
function kiem(dk, ten) { if (dk) dat++; else { hong++; console.error('✗ ' + ten); } }

function taoD1() {
  const s = new DatabaseSync(':memory:');
  s.exec('CREATE TABLE chanNhip (khoa TEXT PRIMARY KEY, dem INTEGER NOT NULL DEFAULT 0, hetHan INTEGER NOT NULL)');
  const cau = (sql) => {
    let ts = [];
    const o = {
      bind(...a) { ts = a; return o; },
      async first() { return s.prepare(sql).get(...ts) || null; },
      async all() { return { results: s.prepare(sql).all(...ts) }; },
      async run() { const r = s.prepare(sql).run(...ts); return { meta: { changes: Number(r.changes) } }; }
    };
    return o;
  };
  return { prepare: cau, _s: s };
}
function taoR2() {
  const m = new Map();
  return {
    _m: m,
    async put(k, v, o) { const u = v instanceof Uint8Array ? v : new Uint8Array(v); m.set(k, { u, kieu: o && o.httpMetadata && o.httpMetadata.contentType }); },
    async get(k) { const x = m.get(k); if (!x) return null; return { body: x.u, size: x.u.length, httpMetadata: { contentType: x.kieu } }; },
    async delete(k) { (Array.isArray(k) ? k : [k]).forEach(x => m.delete(x)); }
  };
}
const KHOA = 'k'.repeat(64);
const env = { CSDL: taoD1(), HOSO: taoR2(), GITA_KHOA_XUONG_QUAY: KHOA };
const R01 = { uid: 'u1', role: 'R01', vaiTro: 'R01' };
const KHAC = { uid: 'u2', role: 'R05', vaiTro: 'R05' };

const jpg = Buffer.concat([Buffer.from([0xFF, 0xD8, 0xFF, 0xE0]), Buffer.alloc(200)]).toString('base64');
const wav = Buffer.concat([Buffer.from('RIFF'), Buffer.alloc(4), Buffer.from('WAVEfmt '), Buffer.alloc(100)]).toString('base64');
const mp4 = Buffer.concat([Buffer.alloc(4), Buffer.from('ftypisom'), Buffer.alloc(2000)]);

function yc(duong, o = {}) {
  const h = new Headers(o.headers || {});
  if (o.khoa !== false) h.set('X-Khoa-Quay', o.khoa || KHOA);
  return new Request('https://w.test' + duong, { method: o.method || 'GET', headers: h, body: o.body });
}
async function may(duong, o) { const r = await xuLyMayQuay(yc(duong, o), env, duong); return { status: r.status, j: await r.json().catch(() => null), r }; }

// Quyền
kiem((await quayKhopMoi({ anh: jpg, am: wav }, env, env.CSDL, KHAC)).code === 'NOPERM', 'chặn người không phải R01');
kiem((await quayKhopMoi({ anh: jpg, am: wav }, { ...env, GITA_KHOA_XUONG_QUAY: '' }, env.CSDL, R01)).code === 'CHUA_CO_XUONG', 'báo thiếu khoá xưởng');
kiem(!(await quayKhopMoi({ anh: wav, am: wav }, env, env.CSDL, R01)).ok, 'từ chối ảnh sai dạng');
kiem(!(await quayKhopMoi({ anh: jpg, am: jpg }, env, env.CSDL, R01)).ok, 'từ chối tiếng sai dạng');
kiem(!(await quayKhopMoi({ anh: '%%%', am: wav }, env, env.CSDL, R01)).ok, 'từ chối base64 hỏng');

// Gửi việc
const g1 = await quayKhopMoi({ anh: 'data:image/jpeg;base64,' + jpg, am: wav }, env, env.CSDL, R01);
const g2 = await quayKhopMoi({ anh: jpg, am: wav }, env, env.CSDL, R01);
kiem(g1.ok && /^[0-9a-f]{32}$/.test(g1.ma), 'gửi việc 1 ra mã 32 hex');
kiem(g2.ok && g2.ma !== g1.ma, 'gửi việc 2 mã khác');
kiem(env.HOSO._m.has('quay/' + g1.ma + '/anh') && env.HOSO._m.has('quay/' + g1.ma + '/am'), 'đã lưu tệp R2');

let x = await quayXem({ ds: [g1.ma, g2.ma, 'zz'] }, env, env.CSDL, R01);
kiem(x.ok && x.ds.length === 2 && x.ds[0].trangThai === 'cho' && x.ds[1].truoc === 1, 'xem: đang chờ, việc 2 đứng sau 1');
x = await quayXem({ ds: [g1.ma] }, env, env.CSDL, { ...R01, uid: 'khac' });
kiem(x.ds[0].trangThai === 'mat', 'xem: không thấy việc của tài khoản khác');

// Khoá máy quay
kiem((await may('/quay/can', { khoa: false })).status === 401, 'máy thiếu khoá → 401');
kiem((await may('/quay/can', { khoa: 'x'.repeat(64) })).status === 401, 'máy sai khoá → 401');
kiem(bangNhau('abc', 'abc') && !bangNhau('abc', 'abd') && !bangNhau('', ''), 'so khoá');

// Đếm máy cần bật + giữ chỗ
let c = await may('/quay/can');
kiem(c.status === 200 && c.j.can === 2 && c.j.cho === 2, 'cần 2 máy cho 2 việc');
c = await may('/quay/can');
kiem(c.j.can === 0, 'lượt lịch sau không bật trùng (đã giữ chỗ)');

// Nhận việc nguyên tử
const jb = (o) => ({ method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(o) });
kiem((await may('/quay/nhan', jb({ may: 'a b' }))).status === 400, 'tên máy sai dạng');
const n1 = await may('/quay/nhan', jb({ may: 'gh-1-1' }));
const n2 = await may('/quay/nhan', jb({ may: 'gh-1-2' }));
const n3 = await may('/quay/nhan', jb({ may: 'gh-1-3' }));
kiem(n1.j.ma === g1.ma && n1.j.duoiAnh === 'jpg', 'máy 1 nhận việc cũ nhất');
kiem(n2.j.ma === g2.ma, 'máy 2 nhận việc kế');
kiem(n3.j.ok && n3.j.ma === null, 'hết việc → ma null');

// Tải tệp
let t = await may('/quay/tep/' + g1.ma + '/anh');
kiem(t.r.status === 200 && t.r.headers.get('Content-Type') === 'image/jpeg', 'máy tải được ảnh');
kiem((await may('/quay/tep/' + g1.ma + '/xx')).status === 404, 'đường tệp lạ → 404');
kiem((await may('/quay/tep/' + 'f'.repeat(32) + '/anh')).status === 404, 'mã không có → 404');

// Nộp kết quả
kiem((await may('/quay/kq/' + g1.ma, { method: 'PUT', body: Buffer.alloc(3000) })).status === 400, 'từ chối tệp không phải MP4');
kiem((await may('/quay/kq/' + g1.ma, { method: 'PUT', body: mp4 })).j.ok, 'nộp MP4 được');
kiem((await may('/quay/kq/' + g1.ma, { method: 'PUT', body: mp4 })).status === 409, 'nộp lại lần 2 bị chặn');
x = await quayXem({ ds: [g1.ma] }, env, env.CSDL, R01);
kiem(x.ds[0].trangThai === 'xong' && x.ds[0].url === '/quay/phim/' + g1.ma + '.mp4', 'xem: xong + đường phim');

// Phim công khai theo mã
let p = await phucVuPhimQuay(new Request('https://w.test/quay/phim/' + g1.ma + '.mp4'), env, '/quay/phim/' + g1.ma + '.mp4');
kiem(p.status === 200 && p.headers.get('Content-Type') === 'video/mp4' && p.headers.get('Access-Control-Allow-Origin') === '*', 'phát phim công khai, CORS *');
p = await phucVuPhimQuay(new Request('https://w.test/quay/phim/' + g2.ma + '.mp4'), env, '/quay/phim/' + g2.ma + '.mp4');
kiem(p.status === 404, 'chưa xong thì 404');
p = await phucVuPhimQuay(new Request('https://w.test/quay/phim/../x'), env, '/quay/phim/../x');
kiem(p.status === 404, 'đường lạ 404');

// Báo lỗi tạm thời → về hàng chờ; lỗi hẳn → loi
await may('/quay/loi/' + g2.ma, jb({ loi: 'tạm', tamThoi: true }));
x = await quayXem({ ds: [g2.ma] }, env, env.CSDL, R01);
kiem(x.ds[0].trangThai === 'cho', 'lỗi tạm thời → chờ lại');
const n4 = await may('/quay/nhan', jb({ may: 'gh-1-2' }));
kiem(n4.j.ma === g2.ma, 'nhận lại việc 2');
await may('/quay/loi/' + g2.ma, jb({ loi: 'Khong thay khuon mat\n', tamThoi: false }));
x = await quayXem({ ds: [g2.ma] }, env, env.CSDL, R01);
kiem(x.ds[0].trangThai === 'loi' && /khuon mat/.test(x.ds[0].loi) && !/\n/.test(x.ds[0].loi), 'lỗi hẳn → loi, đã lọc ký tự điều khiển');

// Quá hạn nhận → trả về hàng; quá số lần thử → lỗi
const g3 = await quayKhopMoi({ anh: jpg, am: wav }, env, env.CSDL, R01);
await may('/quay/nhan', jb({ may: 'gh-2-1' }));
env.CSDL._s.prepare('UPDATE quay_viec SET nhanLuc = ? WHERE ma = ?').run(Date.now() - QUAY.quaHanNhan - 1000, g3.ma);
c = await may('/quay/can');
x = await quayXem({ ds: [g3.ma] }, env, env.CSDL, R01);
kiem(x.ds[0].trangThai === 'cho', 'quá hạn nhận → về hàng chờ');
env.CSDL._s.prepare("UPDATE quay_viec SET trangThai = 'dang', lanThu = ?, nhanLuc = ? WHERE ma = ?").run(QUAY.lanThuToiDa, Date.now() - QUAY.quaHanNhan - 1000, g3.ma);
await may('/quay/nhan', jb({ may: 'gh-2-1' }));
x = await quayXem({ ds: [g3.ma] }, env, env.CSDL, R01);
kiem(x.ds[0].trangThai === 'loi', 'thử quá ' + QUAY.lanThuToiDa + ' lần → lỗi');

// Máy sống
kiem((await may('/quay/song', jb({ may: 'gh-9-9' }))).j.ok, 'báo sống');
x = await quayXem({ ds: [] }, env, env.CSDL, R01);
kiem(x.mayDangChay >= 1, 'đếm máy đang chạy');

// Dọn 7 ngày
env.CSDL._s.prepare('UPDATE quay_viec SET taoLuc = ? WHERE ma = ?').run(Date.now() - 8 * 86400e3, g1.ma);
const xoa = await donQuay(env);
kiem(xoa === 1 && !env.HOSO._m.has('quay/' + g1.ma + '/kq.mp4') && env.HOSO._m.has('quay/' + g3.ma + '/anh'), 'dọn việc + tệp quá 7 ngày');

// Hàng chờ đầy
env.CSDL._s.prepare("UPDATE quay_viec SET trangThai='cho'").run();
env.CSDL._s.prepare("UPDATE quay_viec SET trangThai = 'xong' WHERE trangThai = 'cho'").run();
const cd = await quayChuyenDong({ anh: jpg, sau: jpg }, env, env.CSDL, R01);
kiem(cd.ok && /^[0-9a-f]{32}$/.test(cd.ma), 'gửi việc chuyển động ra mã');
kiem(!(await quayChuyenDong({ anh: jpg }, env, env.CSDL, R01)).ok, 'thiếu khung cuối thì từ chối');
kiem(env.HOSO._m.has('quay/' + cd.ma + '/cd'), 'đã lưu khung cuối');
const ncd = await may('/quay/nhan', jb({ may: 'gh-cd-1' }));
kiem(ncd.j.ma === cd.ma && ncd.j.loai === 'cd', 'nhận việc chuyển động, loại cd');
kiem((await may('/quay/tep/' + cd.ma + '/cd')).status === 200, 'máy tải được khung cuối');

for (let i = 0; i < QUAY.toiDaCho; i++)
  env.CSDL._s.prepare("INSERT INTO quay_viec (ma, uid, trangThai, taoLuc) VALUES (?, 'u1', 'cho', ?)").run('day' + i, Date.now());
kiem((await quayKhopMoi({ anh: jpg, am: wav }, env, env.CSDL, R01)).code === 'DAY', 'hàng chờ đầy → DAY');

console.log((hong ? '✗' : '✓') + ' thu-xuong-quay: ' + dat + '/' + (dat + hong));
process.exit(hong ? 1 : 0);
