/* Kiểm việc tạo nhân vật AI loại 'nv' (vẽ bằng Kaggle GPU) trong
   may-chu/xuong-quay.js. Chạy: node tools/thu-nhan-vat.mjs */
import { DatabaseSync } from 'node:sqlite';
import { taoNhanVatAI, quayVideoDong, quayXem, xuLyMayQuay, phucVuPhimQuay, soatLoiNhac } from '../may-chu/xuong-quay.js';

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
    async get(k) { const x = m.get(k); if (!x) return null; return { body: x.u, httpMetadata: { contentType: x.kieu }, size: x.u.length }; },
    async delete(k) { (Array.isArray(k) ? k : [k]).forEach(x => m.delete(x)); }
  };
}
const KHOA = 'k'.repeat(64);
const env = { CSDL: taoD1(), HOSO: taoR2(), GITA_KHOA_XUONG_QUAY: KHOA };
const R01 = { uid: 'u1', role: 'R01' };
const KHAC = { uid: 'u2', role: 'R05' };
const jpg = Buffer.concat([Buffer.from([0xFF, 0xD8, 0xFF, 0xE0]), Buffer.alloc(200)]).toString('base64');
const png = Buffer.concat([Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]), Buffer.alloc(500)]);
const mp4 = Buffer.concat([Buffer.alloc(4), Buffer.from('ftypisom'), Buffer.alloc(2000)]);
function yc(duong, o = {}) {
  const h = new Headers(o.headers || {});
  h.set('X-Khoa-Quay', KHOA);
  return new Request('https://w.test' + duong, { method: o.method || 'GET', headers: h, body: o.body });
}
async function may(duong, o) { const r = await xuLyMayQuay(yc(duong, o), env, duong); return { status: r.status, j: await r.json().catch(() => null) }; }

// Quyền + kiểm đầu vào
kiem((await taoNhanVatAI({ moTa: 'người phụ nữ 35 tuổi, tóc dài, áo dài trắng' }, env, env.CSDL, KHAC)).code === 'NOPERM', 'chặn người không phải R01');
kiem(!(await taoNhanVatAI({ moTa: 'ngắn' }, env, env.CSDL, R01)).ok, 'mô tả quá ngắn bị từ chối');
kiem(!(await taoNhanVatAI({ moTa: 'người đàn ông đứng trong vườn', anhGoc: '%%%' }, env, env.CSDL, R01)).ok, 'ảnh gốc hỏng bị từ chối');
kiem(!(await taoNhanVatAI({ moTa: 'người đàn ông đứng trong vườn', anhGoc: Buffer.from('không phải ảnh').toString('base64') }, env, env.CSDL, R01)).ok, 'ảnh gốc không đúng định dạng bị từ chối');

// Cổng bí mật cho nội dung khách
const chan = await taoNhanVatAI({ moTa: 'nhân vật giải thích về hoa hồng hệ thống', phamVi: 'khach' }, env, env.CSDL, R01);
kiem(chan.code === 'BI_MAT', 'mô tả phim khách chứa bí mật bị chặn');
const gNb = await taoNhanVatAI({ moTa: 'nhân vật giải thích về hoa hồng hệ thống', phamVi: 'noi-bo' }, env, env.CSDL, R01);
kiem(gNb.ok && gNb.phamVi === 'noi-bo', 'phạm vi nội bộ không bị chặn');

// Gửi việc hợp lệ: 1 không ảnh gốc, 1 có ảnh gốc để giữ gương mặt
const g1 = await taoNhanVatAI({ moTa: 'người phụ nữ 35 tuổi, tóc dài đen, áo dài trắng, mỉm cười ấm áp trong phòng khách' }, env, env.CSDL, R01);
kiem(g1.ok && /^[0-9a-f]{32}$/.test(g1.ma) && g1.phamVi === 'khach', 'gửi việc nv ra mã');
kiem(env.HOSO._m.has('quay/' + g1.ma + '/loi') && !env.HOSO._m.has('quay/' + g1.ma + '/anh'), 'chỉ lưu lời mô tả khi không có ảnh gốc');
const g2 = await taoNhanVatAI({ moTa: 'cùng nhân vật đó, ngồi trong xe hơi, ánh nắng chiều', anhGoc: jpg }, env, env.CSDL, R01);
kiem(g2.ok && env.HOSO._m.has('quay/' + g2.ma + '/anh') && env.HOSO._m.has('quay/' + g2.ma + '/loi'), 'việc có ảnh gốc lưu đủ 2 tệp');

// Việc video chen vào để thử bộ lọc loại
const gVd = await quayVideoDong({ anh: jpg, loiNhac: 'nhân vật bước đi chậm rãi' }, env, env.CSDL, R01);
kiem(gVd.ok, 'gửi việc video chen hàng');

// Bộ lọc loại: máy vẽ chỉ nhận 'nv' (hàng chờ theo thứ tự gửi: gNb → g1 → g2)
let n = await may('/quay/nhan', { method: 'POST', body: JSON.stringify({ may: 'knv-1', loai: 'nv' }) });
kiem(n.j.ok && n.j.ma === gNb.ma && n.j.loai === 'nv' && n.j.phamVi === 'noi-bo', 'máy vẽ nhận việc nv đầu tiên, bỏ qua video');
n = await may('/quay/nhan', { method: 'POST', body: JSON.stringify({ may: 'knv-1', loai: 'nv' }) });
kiem(n.j.ma === g1.ma && n.j.phamVi === 'khach', 'việc nv thứ hai đúng thứ tự');
n = await may('/quay/nhan', { method: 'POST', body: JSON.stringify({ may: 'knv-1', loai: 'vd,nv' }) });
kiem(n.j.ma === g2.ma && n.j.loai === 'nv', 'máy khai vd,nv nhận nốt việc nv còn lại');
n = await may('/quay/nhan', { method: 'POST', body: JSON.stringify({ may: 'knv-1', loai: 'nv' }) });
kiem(n.j.ma === null, 'hết việc nv thì trả null, không đụng việc video');
n = await may('/quay/nhan', { method: 'POST', body: JSON.stringify({ may: 'kvd-1', loai: 'vd' }) });
kiem(n.j.ma === gVd.ma && n.j.loai === 'vd', 'máy video nhận đúng việc vd');

// Nộp kết quả: việc nv nhận ẢNH, từ chối MP4; việc vd nhận MP4, từ chối ảnh
let t = await may('/quay/tep/' + g1.ma + '/loi');
kiem(t.status === 200, 'máy vẽ đọc được lời mô tả');
t = await may('/quay/tep/' + g2.ma + '/anh');
kiem(t.status === 200, 'máy vẽ đọc được ảnh gốc');
t = await may('/quay/kq/' + g1.ma, { method: 'PUT', body: mp4 });
kiem(t.status === 400, 'việc nv từ chối MP4');
t = await may('/quay/kq/' + gVd.ma, { method: 'PUT', body: png });
kiem(t.status === 400, 'việc vd từ chối ảnh PNG');
t = await may('/quay/kq/' + g1.ma, { method: 'PUT', body: png });
kiem(t.status === 200 && t.j.ok, 'nộp PNG cho việc nv thành công');
t = await may('/quay/kq/' + g2.ma, { method: 'PUT', body: Buffer.concat([Buffer.from([0xFF, 0xD8, 0xFF]), Buffer.alloc(500)]) });
kiem(t.status === 200 && t.j.ok, 'nộp JPEG cho việc nv cũng được');
t = await may('/quay/kq/' + gVd.ma, { method: 'PUT', body: mp4 });
kiem(t.status === 200 && t.j.ok, 'nộp MP4 cho việc vd thành công');

// Xem: việc nv xong trả link .png
const x = await quayXem({ ds: [g1.ma, gVd.ma] }, env, env.CSDL, R01);
kiem(x.ds[0].trangThai === 'xong' && x.ds[0].loai === 'nv' && x.ds[0].url === '/quay/phim/' + g1.ma + '.png', 'xem: việc nv xong có link ảnh .png');
kiem(x.ds[1].trangThai === 'xong' && x.ds[1].url === '/quay/phim/' + gVd.ma + '.mp4', 'xem: việc vd vẫn link .mp4');

// Phục vụ công khai: .png ra ảnh đúng kiểu, mã lạ 404
let p = await phucVuPhimQuay(new Request('https://w.test/quay/phim/' + g1.ma + '.png'), env, '/quay/phim/' + g1.ma + '.png');
kiem(p.status === 200 && p.headers.get('Content-Type') === 'image/png', 'phục vụ PNG công khai đúng kiểu');
const anhVe = Buffer.from(await p.arrayBuffer());
kiem(anhVe.length === png.length && anhVe[0] === 0x89 && anhVe[1] === 0x50, 'ảnh phục vụ đúng nội dung đã nộp');
p = await phucVuPhimQuay(new Request('https://w.test/quay/phim/' + g2.ma + '.png'), env, '/quay/phim/' + g2.ma + '.png');
kiem(p.status === 200 && p.headers.get('Content-Type') === 'image/jpeg', 'việc nộp JPEG thì phục vụ kiểu JPEG');
p = await phucVuPhimQuay(new Request('https://w.test/quay/phim/' + '0'.repeat(32) + '.png'), env, '/quay/phim/' + '0'.repeat(32) + '.png');
kiem(p.status === 404, 'mã lạ trả 404');

console.log(hong ? ('Hỏng ' + hong + '/' + (dat + hong)) : ('Đạt ' + dat + '/' + dat));
process.exit(hong ? 1 : 0);
