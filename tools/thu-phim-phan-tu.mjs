/* Kiểm phim phân tử: công thức trong D1, ảnh dùng chung một lần, xem lại không tạo file video.
   Chạy: node tools/thu-phim-phan-tu.mjs */
import { DatabaseSync } from 'node:sqlite';
import { dongGoiPhanTu, xemPhanTu, phucVuPhimPhanTu, damBaoMau } from '../may-chu/phim-phan-tu.js';

let dat = 0, hong = 0;
function kiem(dk, ten) { if (dk) dat++; else { hong++; console.error('✗ ' + ten); } }

function taoD1() {
  const s = new DatabaseSync(':memory:');
  const cau = (sql) => {
    let ts = [];
    const o = {
      bind(...a) { ts = a; return o; },
      async first() { return s.prepare(sql).get(...ts) || null; },
      async all() { return { results: s.prepare(sql).all(...ts) }; },
      async run() { s.prepare(sql).run(...ts); return { meta: { changes: 1 } }; }
    };
    return o;
  };
  return { prepare: cau };
}
function taoR2() {
  const m = new Map();
  return {
    _m: m,
    async put(k, v) { m.set(k, v instanceof Uint8Array ? v : new Uint8Array(v)); },
    async get(k) { const u = m.get(k); return u ? { body: u } : null; }
  };
}
const env = { CSDL: taoD1(), HOSO: taoR2() };
const R01 = { uid: 'u1', role: 'R01' };
const KHAC = { uid: 'u2', role: 'R05' };
const jpg = Buffer.concat([Buffer.from([0xFF, 0xD8, 0xFF, 0xE0]), Buffer.alloc(80)]).toString('base64');

kiem((await dongGoiPhanTu({ mau: true }, env, env.CSDL, KHAC)).code === 'NOPERM', 'chặn người không phải chủ hệ');
const mau = await damBaoMau(env, env.CSDL);
kiem(mau.ok && mau.ma === 'mau-gita-365', 'có phim mẫu cố định');
const mau2 = await damBaoMau(env, env.CSDL);
kiem(mau2.daCo === true, 'xem lại không tạo công thức mới');

const r = await phucVuPhimPhanTu(new Request('https://w.test/phim/mau'), env, '/phim/mau');
kiem(r.status === 302 && r.headers.get('location').endsWith('/phim/xem/mau-gita-365'), 'link mẫu chuyển tới trang ghép');
const xem = await phucVuPhimPhanTu(new Request('https://w.test/phim/xem/mau-gita-365'), env, '/phim/xem/mau-gita-365');
const html = await xem.text();
kiem(xem.status === 200 && html.includes('Không tải file video') && !html.includes('.mp4'), 'trang xem không phát file video');
const ct = await phucVuPhimPhanTu(new Request('https://w.test/phim/cong-thuc/mau-gita-365'), env, '/phim/cong-thuc/mau-gita-365');
const j = await ct.json();
kiem(j.canh.length === 4 && j.canh.every(c => ['tho', 'gio-tay', 'quay-dau', 'buoc'].includes(c.nhip)), 'công thức có 4 nhịp nhẹ');
kiem(!JSON.stringify(j).includes('chay') && j.canh.every(c => c.nhip !== 'danh'), 'không có chạy đánh nhảy');

const g = await dongGoiPhanTu({
  ten: 'Phim khách',
  anh: [{ khoa: 'nen1', duLieu: jpg }, { khoa: 'nguoi1', loai: 'nguoi', duLieu: jpg }],
  canh: [{ giay: 3, may: 'day', nhip: 'tho', hatNen: 'nen1', hatNguoi: 'nguoi1', loi: 'Câu của khách' }]
}, env, env.CSDL, R01);
kiem(g.ok && g.byteCongThuc < 2000 && g.byteNeuLuuVideo > g.byteAnh, 'công thức nhỏ hơn file video ước tính');
kiem(g.anhTrung === 1 && env.HOSO._m.size === 1, 'cùng một ảnh chỉ lưu một lần');
const hat = j.canh[0];
kiem(hat, 'mẫu còn nguyên');
const cam = await phucVuPhimPhanTu(new Request('https://w.test/phim/hat/khong-co/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'), env, '/phim/hat/khong-co/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa');
kiem(cam.status === 404, 'không lấy ảnh nếu không thuộc phim');
const coAnh = await phucVuPhimPhanTu(new Request('https://w.test/phim/hat/' + g.ma + '/' + 'f'.repeat(32)), env, '/phim/hat/' + g.ma + '/' + 'f'.repeat(32));
kiem(coAnh.status === 404, 'mã ảnh không có trong công thức thì từ chối');

const xemKho = await xemPhanTu({}, env, env.CSDL, R01);
kiem(xemKho.ok && xemKho.hat.so === 1, 'kho ảnh đếm một hạt');
kiem((await dongGoiPhanTu({ canh: [] }, env, env.CSDL, R01)).code === 'THIEU_CANH', 'từ chối phim không có cảnh');
kiem((await dongGoiPhanTu({ canh: [{ loi: 'x' }], anh: [{ khoa: 'a', duLieu: 'abc' }] }, env, env.CSDL, R01)).code === 'ANH', 'từ chối ảnh hỏng');

console.log(hong ? ('Hỏng ' + hong + '/' + (dat + hong)) : ('Đạt ' + dat + '/' + dat));
process.exit(hong ? 1 : 0);
