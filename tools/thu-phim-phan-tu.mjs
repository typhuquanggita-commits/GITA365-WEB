/* Kiểm phim phân tử: công thức trong D1, ảnh dùng chung một lần, xem lại không tạo file video.
   Chạy: node tools/thu-phim-phan-tu.mjs */
import { DatabaseSync } from 'node:sqlite';
import { dongGoiPhanTu, xemPhanTu, phucVuPhimPhanTu, damBaoMau, taoBangPhanTu } from '../may-chu/phim-phan-tu.js';

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
kiem(xem.status === 200 && html.includes('<video') && html.includes('đang được AI quay chuyển động thật'),
  'trang xem phát clip AI quay thật, báo đang quay khi clip chưa về');
kiem(!html.includes('requestAnimationFrame') && !html.includes('<canvas'),
  'NGHIÊM CẤM ghép ảnh tĩnh giả chuyển động (không còn canvas pan/zoom)');
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

/* ── Người que bị cấm: trình xem không còn bộ vẽ người bằng nét ── */
kiem(!html.includes('function nguoi(') && !html.includes('else nguoi('), 'trình xem không còn vẽ người que');

/* ── Phim mẫu tự vẽ cảnh bằng Workers AI (0đ) ── */
let soLanSchnell = 0, soLanKlein = 0;
const envAI = {
  CSDL: taoD1(), HOSO: taoR2(),
  AI: { async run(model, opts) { if (opts && opts.multipart) soLanKlein++; else soLanSchnell++; return { image: jpg }; } }
};
const mauAI = await damBaoMau(envAI, envAI.CSDL);
kiem(mauAI.ok && mauAI.anhVuaVe === 4 && mauAI.duAnh === true, 'mẫu tự vẽ đủ 4 cảnh bằng AI');
kiem(soLanKlein === 5 && soLanSchnell === 0, 'vẽ 1 chân dung gốc + 4 cảnh bằng máy ảnh FLUX.2 klein');
const nvHat = await envAI.CSDL.prepare("SELECT ma FROM phim_pt_hat WHERE loai = 'nvmau' || 4").first();
kiem(!!nvHat, 'chân dung nhân vật gốc được lưu làm hạt riêng');
const ctAI = await phucVuPhimPhanTu(new Request('https://w.test/phim/cong-thuc/mau-gita-365'), envAI, '/phim/cong-thuc/mau-gita-365');
const jAI = await ctAI.json();
kiem(jAI.canh.every(c => /^[0-9a-f]{32}$/.test(c.hatNen || '')), 'mọi cảnh mẫu đều gắn hạt ảnh');
const hatAI = await phucVuPhimPhanTu(new Request('https://w.test/phim/hat/mau-gita-365/' + jAI.canh[0].hatNen), envAI, '/phim/hat/mau-gita-365/' + jAI.canh[0].hatNen);
kiem(hatAI.status === 200 && hatAI.headers.get('content-type') === 'image/jpeg', 'ảnh cảnh mẫu được phục vụ công khai');
const mauAI2 = await damBaoMau(envAI, envAI.CSDL);
kiem(mauAI2.anhVuaVe === 0 && soLanKlein === 5, 'xem lại không vẽ lại, không tốn neuron');
kiem(!JSON.stringify(jAI).includes('pbAnh'), 'JSON công khai không lộ dấu phiên bản ảnh');

/* ── Cảnh vẽ bằng bản cũ (không dấu pbAnh) được vẽ lại bằng máy ảnh mới ── */
const envPB = {
  CSDL: taoD1(), HOSO: taoR2(),
  AI: { async run(model, opts) { return { image: jpg }; } }
};
await taoBangPhanTu(envPB.CSDL);
const canhCu = Array.from({ length: 4 }, (_, i) => ({
  giay: 5, may: 'day', nhip: 'tho', loi: 'Lời ' + i,
  hatNen: 'f'.repeat(31) + i, pbAnh: 1, loiTTS: 'x'
}));
await envPB.CSDL.prepare("INSERT INTO phim_pt_cong_thuc (ma, uid, ten, noiDung, taoLuc) VALUES ('mau-gita-365', 'he-thong', 'Hành trình GITA 365 — phim phân tử', ?, 1)")
  .bind(JSON.stringify({ ten: 'Hành trình GITA 365 — phim phân tử', canh: canhCu })).run();
const veLai = await damBaoMau(envPB, envPB.CSDL);
const ctPB = await (await phucVuPhimPhanTu(new Request('https://w.test/phim/cong-thuc/mau-gita-365'), envPB, '/phim/cong-thuc/mau-gita-365')).json();
kiem(veLai.ok && veLai.anhVuaVe === 4 && ctPB.canh.every(c => c.hatNen && !/^f{31}[0-3]$/.test(c.hatNen)),
  'ảnh bản cũ bị thay bằng bản máy ảnh mới');
const veLai2 = await damBaoMau(envPB, envPB.CSDL);
kiem(veLai2.anhVuaVe === 0, 'sau khi lên bản mới thì không vẽ lại nữa');

/* ── Ảnh chân dung do CHỦ HỆ chọn (hạt 'nvmau-chu') được ưu tiên tuyệt
   đối: mọi cảnh tự vẽ lại theo đúng gương mặt chủ hệ gửi ── */
const nhanRef = [];
const envChu = {
  CSDL: taoD1(), HOSO: taoR2(),
  AI: { async run(model, opts) {
    if (opts && opts.multipart) nhanRef.push(String(await new Response(opts.multipart.body).text()).includes('input_image_0'));
    return { image: jpg };
  } }
};
await taoBangPhanTu(envChu.CSDL);
const bamChu = 'c'.repeat(64);
await envChu.HOSO.put('pt/' + bamChu, Uint8Array.from(atob(jpg), c => c.charCodeAt(0)));
await envChu.CSDL.prepare("INSERT INTO phim_pt_hat (ma, bam, loai, mime, byte, soLan) VALUES (?, ?, 'nvmau-chu', 'image/jpeg', 84, 1)")
  .bind('b'.repeat(32), bamChu).run();
const canhMatCu = Array.from({ length: 4 }, (_, i) => ({
  giay: 5, may: 'day', nhip: 'tho', loi: 'Lời ' + i,
  hatNen: 'd'.repeat(31) + i, pbAnh: 4, nvRef: 'a'.repeat(32)
}));
await envChu.CSDL.prepare("INSERT INTO phim_pt_cong_thuc (ma, uid, ten, noiDung, taoLuc) VALUES ('mau-gita-365', 'he-thong', 'Hành trình GITA 365 — phim phân tử', ?, 1)")
  .bind(JSON.stringify({ ten: 'Hành trình GITA 365 — phim phân tử', canh: canhMatCu })).run();
const veChu = await damBaoMau(envChu, envChu.CSDL);
kiem(veChu.ok && veChu.anhVuaVe === 4, 'đặt ảnh chủ hệ → toàn bộ cảnh tự vẽ lại theo gương mặt mới');
kiem(nhanRef.length === 4 && nhanRef.every(Boolean), 'mọi cảnh đều nhận ảnh chân dung chủ hệ làm tham chiếu');
const jChu = await (await phucVuPhimPhanTu(new Request('https://w.test/phim/cong-thuc/mau-gita-365'), envChu, '/phim/cong-thuc/mau-gita-365')).json();
kiem(!JSON.stringify(jChu).includes('nvRef'), 'JSON công khai không lộ dấu tham chiếu nhân vật');
const veChu2 = await damBaoMau(envChu, envChu.CSDL);
kiem(veChu2.anhVuaVe === 0 && nhanRef.length === 4, 'vẽ theo mặt chủ hệ xong thì không vẽ lại, không tốn neuron');

/* ── Cảnh đã có ảnh được gửi xưởng quay LTX-Video (chuyển động THẬT) ── */
const envQ = {
  CSDL: taoD1(), HOSO: taoR2(), GITA_KHOA_XUONG_QUAY: 'k'.repeat(40),
  AI: { async run() { return { image: jpg }; } }
};
const mauQ = await damBaoMau(envQ, envQ.CSDL);
kiem(mauQ.ok && mauQ.clipMoi === 4, 'bốn cảnh được xếp việc quay chuyển động thật');
const viecQ = await envQ.CSDL.prepare("SELECT ma FROM quay_viec WHERE loai = 'vd' ORDER BY rowid").all();
kiem(viecQ.results.length === 4, 'hàng chờ có đúng 4 việc video');
const jQ0 = await (await phucVuPhimPhanTu(new Request('https://w.test/phim/cong-thuc/mau-gita-365'), envQ, '/phim/cong-thuc/mau-gita-365')).json();
kiem(!JSON.stringify(jQ0).includes('clipXong') && !jQ0.canh.some(c => c.video), 'clip chưa quay xong thì chưa công khai đường phát');
await envQ.CSDL.prepare("UPDATE quay_viec SET trangThai = 'xong' WHERE ma = ?").bind(viecQ.results[0].ma).run();
await damBaoMau(envQ, envQ.CSDL);
const jQ1 = await (await phucVuPhimPhanTu(new Request('https://w.test/phim/cong-thuc/mau-gita-365'), envQ, '/phim/cong-thuc/mau-gita-365')).json();
kiem(jQ1.canh[0].video === '/quay/phim/' + viecQ.results[0].ma + '.mp4' && !jQ1.canh[1].video,
  'clip quay xong thì công khai đúng đường phát của cảnh đó');
const viecQ2 = await envQ.CSDL.prepare("SELECT COUNT(*) AS n FROM quay_viec WHERE loai = 'vd'").first();
kiem(+viecQ2.n === 4, 'đồng bộ trạng thái không xếp việc trùng');

/* ── Mẫu cũ (thoại đùa, không ảnh) được nâng cấp ── */
const envCu = { CSDL: taoD1(), HOSO: taoR2(), AI: { async run() { return { image: jpg }; } } };
await taoBangPhanTu(envCu.CSDL);
await envCu.CSDL.prepare("INSERT INTO phim_pt_cong_thuc (ma, uid, ten, noiDung, taoLuc) VALUES ('mau-gita-365', 'he-thong', 'Mẫu — ghép từ công thức', '{\"ten\":\"cu\",\"canh\":[{\"giay\":4,\"may\":\"lia\",\"nen\":\"troi-sang\",\"nhip\":\"tho\",\"nhan\":\"Người dẫn\",\"loi\":\"Đây không phải file video.\"}]}', 1)").run();
const nang = await damBaoMau(envCu, envCu.CSDL);
const ctCu = await (await phucVuPhimPhanTu(new Request('https://w.test/phim/cong-thuc/mau-gita-365'), envCu, '/phim/cong-thuc/mau-gita-365')).json();
kiem(nang.ok && ctCu.ten === 'Hành trình GITA 365 — phim phân tử' && ctCu.canh.every(c => c.hatNen), 'mẫu cũ được viết lại thoại và gắn ảnh');

/* ── Binding trả luồng byte (bản cũ) vẫn được nhận ── */
const jpgU = Uint8Array.from(atob(jpg), c => c.charCodeAt(0));
const envStream = { CSDL: taoD1(), HOSO: taoR2(), AI: { async run() { return new Response(jpgU).body; } } };
const mauStream = await damBaoMau(envStream, envStream.CSDL);
kiem(mauStream.ok && mauStream.duAnh === true, 'nhận cả kết quả AI dạng luồng byte');

/* ── Dịch vụ vẽ ngoài (chủ hệ tự gắn khoá) được ưu tiên ── */
const fetchGoc = globalThis.fetch;
let goiNgoai = 0;
globalThis.fetch = async (url, opt) => {
  goiNgoai++;
  if (String(opt && opt.headers && opt.headers.authorization || '').indexOf('Bearer ') !== 0) return new Response('x', { status: 401 });
  return new Response(JSON.stringify({ data: [{ b64_json: jpg }] }), { status: 200 });
};
const envNgoai = { CSDL: taoD1(), HOSO: taoR2(), GITA_VE_ANH_URL: 'https://api.test/v1/images/generations', GITA_VE_ANH_KHOA: 'sk-gia' };
const mauNgoai = await damBaoMau(envNgoai, envNgoai.CSDL);
globalThis.fetch = fetchGoc;
kiem(mauNgoai.ok && mauNgoai.duAnh === true && goiNgoai === 4, 'dịch vụ ngoài vẽ cảnh khi được cấu hình');
kiem((await dongGoiPhanTu({ canh: [] }, env, env.CSDL, R01)).code === 'THIEU_CANH', 'từ chối phim không có cảnh');
kiem((await dongGoiPhanTu({ canh: [{ loi: 'x' }], anh: [{ khoa: 'a', duLieu: 'abc' }] }, env, env.CSDL, R01)).code === 'ANH', 'từ chối ảnh hỏng');

/* Người lạ mở /phim/* không được kích dịch vụ vẽ ảnh TRẢ PHÍ bên ngoài
   (9/10/2026). Chỉ lượt của chủ hệ (dongGoiPhanTu mau) mới được gọi. */
{
  const envTraPhi = { CSDL: taoD1(), HOSO: taoR2(), GITA_VE_ANH_URL: 'https://ve-anh.thu/v1/images', GITA_VE_ANH_KHOA: 'khoa-thu' };
  const fetchGoc = globalThis.fetch; let goiTraPhi = 0;
  globalThis.fetch = async (u) => { if (String(u).startsWith('https://ve-anh.thu/')) goiTraPhi++; return new Response('{}', { status: 500 }); };
  try {
    await phucVuPhimPhanTu(new Request('https://x/phim/mau'), envTraPhi, '/phim/mau');
    await phucVuPhimPhanTu(new Request('https://x/phim/xem/mau-gita-365'), envTraPhi, '/phim/xem/mau-gita-365');
    kiem(goiTraPhi === 0, 'người lạ mở /phim/* không gọi dịch vụ vẽ trả phí (gọi ' + goiTraPhi + ' lần)');
    await dongGoiPhanTu({ mau: true }, envTraPhi, envTraPhi.CSDL, R01);
    kiem(goiTraPhi > 0, 'lượt của chủ hệ vẫn gọi được dịch vụ vẽ (phép đo có thể đỏ)');
  } finally { globalThis.fetch = fetchGoc; }
}

console.log(hong ? ('Hỏng ' + hong + '/' + (dat + hong)) : ('Đạt ' + dat + '/' + dat));
process.exit(hong ? 1 : 0);
