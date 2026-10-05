/* Kiểm việc video chuyển động loại 'vd' (quay bằng Kaggle GPU) trong
   may-chu/xuong-quay.js. Chạy: node tools/thu-quay-video.mjs */
import { DatabaseSync } from 'node:sqlite';
import { quayVideoDong, quayKhopMoi, quayXem, quayXoa, xuLyMayQuay, soatLoiNhac } from '../may-chu/xuong-quay.js';

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
  return { prepare: cau };
}
function taoR2() {
  const m = new Map();
  return {
    _m: m,
    async put(k, v, o) { const u = v instanceof Uint8Array ? v : new Uint8Array(v); m.set(k, { u, kieu: o && o.httpMetadata && o.httpMetadata.contentType }); },
    async get(k) { const x = m.get(k); if (!x) return null; return { body: x.u, httpMetadata: { contentType: x.kieu } }; },
    async delete(k) { (Array.isArray(k) ? k : [k]).forEach(x => m.delete(x)); }
  };
}
const KHOA = 'k'.repeat(64);
const env = { CSDL: taoD1(), HOSO: taoR2(), GITA_KHOA_XUONG_QUAY: KHOA };
const R01 = { uid: 'u1', role: 'R01' };
const KHAC = { uid: 'u2', role: 'R05' };
const jpg = Buffer.concat([Buffer.from([0xFF, 0xD8, 0xFF, 0xE0]), Buffer.alloc(200)]).toString('base64');
const mp4 = Buffer.concat([Buffer.alloc(4), Buffer.from('ftypisom'), Buffer.alloc(2000)]);
function yc(duong, o = {}) {
  const h = new Headers(o.headers || {});
  h.set('X-Khoa-Quay', KHOA);
  return new Request('https://w.test' + duong, { method: o.method || 'GET', headers: h, body: o.body });
}
async function may(duong, o) { const r = await xuLyMayQuay(yc(duong, o), env, duong); return { status: r.status, j: await r.json().catch(() => null) }; }

// Quyền + kiểm đầu vào
kiem((await quayVideoDong({ anh: jpg, loiNhac: 'mỉm cười nhẹ nhàng' }, env, env.CSDL, KHAC)).code === 'NOPERM', 'chặn người không phải R01');
kiem(!(await quayVideoDong({ anh: jpg, loiNhac: 'ngắn' }, env, env.CSDL, R01)).ok, 'lời nhắc quá ngắn bị từ chối');
kiem(!(await quayVideoDong({ anh: '%%%', loiNhac: 'người bước đi chậm rãi' }, env, env.CSDL, R01)).ok, 'ảnh hỏng bị từ chối');

// Cổng bí mật cho phim khách
kiem(soatLoiNhac('kể về hoa hồng của hệ thống', 'khach') === 'hoa hồng', 'bắt từ khoá nội bộ');
kiem(soatLoiNhac('hoa hồng', 'noi-bo') === null, 'phạm vi nội bộ không chặn');
kiem(soatLoiNhac('người phụ nữ mỉm cười trong công viên', 'khach') === null, 'lời bình thường không bị chặn');
const chan = await quayVideoDong({ anh: jpg, loiNhac: 'nhân vật nói về hoa hồng chi tiết', phamVi: 'khach' }, env, env.CSDL, R01);
kiem(chan.code === 'BI_MAT', 'phim khách chứa bí mật bị chặn');

// Gửi việc hợp lệ
const g = await quayVideoDong({ anh: jpg, loiNhac: 'nhân vật bước đi chậm rãi, ánh sáng hoàng hôn' }, env, env.CSDL, R01);
kiem(g.ok && /^[0-9a-f]{32}$/.test(g.ma) && g.phamVi === 'khach', 'gửi việc vd ra mã');
kiem(env.HOSO._m.has('quay/' + g.ma + '/anh') && env.HOSO._m.has('quay/' + g.ma + '/loi'), 'đã lưu ảnh và lời nhắc');
const nb = await quayVideoDong({ anh: jpg, loiNhac: 'hướng dẫn nội bộ cho đội ngũ', phamVi: 'noi-bo' }, env, env.CSDL, R01);
kiem(nb.ok && nb.phamVi === 'noi-bo', 'việc nội bộ ghi đúng phạm vi');

// Việc khớp môi cũ chen vào để thử bộ lọc loại
const wav = Buffer.concat([Buffer.from('RIFF'), Buffer.alloc(4), Buffer.from('WAVEfmt '), Buffer.alloc(100)]).toString('base64');
const gMoi = await quayKhopMoi({ anh: jpg, am: wav }, env, env.CSDL, R01);
kiem(gMoi.ok, 'gửi việc khớp môi chen hàng');

// Máy Kaggle chỉ nhận 'vd', máy GitHub không lọc
let n = await may('/quay/nhan', { method: 'POST', body: JSON.stringify({ may: 'kaggle-1', loai: 'vd' }) });
kiem(n.j.ok && n.j.ma === g.ma && n.j.loai === 'vd' && n.j.phamVi === 'khach', 'máy Kaggle nhận đúng việc vd đầu tiên, bỏ qua khớp môi');
n = await may('/quay/nhan', { method: 'POST', body: JSON.stringify({ may: 'kaggle-2', loai: 'vd' }) });
kiem(n.j.ma === nb.ma && n.j.phamVi === 'noi-bo', 'việc vd thứ hai cho máy Kaggle khác');
n = await may('/quay/nhan', { method: 'POST', body: JSON.stringify({ may: 'kaggle-1', loai: 'vd' }) });
kiem(n.j.ma === null, 'hết việc vd thì trả null, không đụng việc khớp môi');
n = await may('/quay/nhan', { method: 'POST', body: JSON.stringify({ may: 'gh-1' }) });
kiem(n.j.ma === gMoi.ma && n.j.loai === 'moi', 'máy GitHub không khai loại vẫn nhận việc khớp môi như cũ');

// Máy Kaggle đọc lời nhắc rồi nộp MP4
let t = await may('/quay/tep/' + g.ma + '/loi');
kiem(t.status === 200, 'đọc được lời nhắc');
t = await may('/quay/kq/' + g.ma, { method: 'PUT', body: mp4, headers: { 'Content-Length': String(mp4.length) } });
kiem(t.status === 200 && t.j.ok, 'nộp MP4 thành công');
const x = await quayXem({ ds: [g.ma] }, env, env.CSDL, R01);
kiem(x.ds[0].trangThai === 'xong' && x.ds[0].url === '/quay/phim/' + g.ma + '.mp4', 'xem: việc vd xong có link phim');
kiem(typeof x.ds[0].xongLuc === 'number' && x.ds[0].xongLuc > 0, 'xem: việc xong kèm thời điểm quay xong');

// Làm sạch khi có xác nhận (vòng đời sản xuất liên tục)
kiem((await quayXoa({ ma: g.ma }, env, env.CSDL, KHAC)).code === 'NOPERM', 'dọn: chặn người không phải R01');
kiem(!(await quayXoa({ ds: [] }, env, env.CSDL, R01)).ok, 'dọn: thiếu mã bị từ chối');
// nb vừa được máy Kaggle nhận ở trên (trạng thái 'dang') → không được dọn
const xoaDang = await quayXoa({ ma: nb.ma }, env, env.CSDL, R01);
kiem(xoaDang.ok && xoaDang.xoa === 0 && xoaDang.boQua.indexOf(nb.ma) >= 0, 'dọn: không đụng việc đang quay');
kiem(env.HOSO._m.has('quay/' + nb.ma + '/anh'), 'dọn: tệp việc đang quay vẫn còn');
// g đã xong → dọn thật: xoá tệp R2 + dòng D1
const xoaXong = await quayXoa({ ma: g.ma }, env, env.CSDL, R01);
kiem(xoaXong.ok && xoaXong.xoa === 1, 'dọn: việc xong được dọn');
kiem(!env.HOSO._m.has('quay/' + g.ma + '/kq.mp4') && !env.HOSO._m.has('quay/' + g.ma + '/anh'), 'dọn: tệp phim đã bị xoá khỏi R2');
kiem((await quayXem({ ds: [g.ma] }, env, env.CSDL, R01)).ds[0].trangThai === 'mat', 'dọn: dòng việc đã biến khỏi D1');
// R01 khác (uid khác) không dọn được phim của người khác (lọc theo uid)
const R01B = { uid: 'u3', role: 'R01' };
const g2 = await quayVideoDong({ anh: jpg, loiNhac: 'nhân vật mỉm cười trong vườn chiều' }, env, env.CSDL, R01);
await may('/quay/nhan', { method: 'POST', body: JSON.stringify({ may: 'kg-x', loai: 'vd' }) });
await may('/quay/kq/' + g2.ma, { method: 'PUT', body: mp4, headers: { 'Content-Length': String(mp4.length) } });
const xoaKhac = await quayXoa({ ma: g2.ma }, env, env.CSDL, R01B);
kiem(xoaKhac.ok && xoaKhac.xoa === 0, 'dọn: Super Admin khác không dọn được phim của người khác');
kiem(env.HOSO._m.has('quay/' + g2.ma + '/kq.mp4'), 'dọn: phim của người khác vẫn còn nguyên');

console.log(hong ? ('Hỏng ' + hong + '/' + (dat + hong)) : ('Đạt ' + dat + '/' + dat));
process.exit(hong ? 1 : 0);
