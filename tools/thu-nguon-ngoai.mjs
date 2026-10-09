// Thử sổ máy chủ ngoài (may-chu/nguon-ngoai.js) và phép soát mật khẩu đã lộ
// (mkDaLo ở may-chu/nen.js).
// Chạy: node tools/thu-nguon-ngoai.mjs
//
// Vì sao có: public-apis giữ được chất lượng vì mỗi dòng khai đủ cột và có
// bộ kiểm từ chối dòng khai thiếu. Ở đây bộ kiểm đối chiếu HAI ĐẦU: lời khai
// của sổ với chuỗi https://… thật trong mã máy chủ. Không cần mạng — mọi
// lượt gọi ra đều bị thay bằng fetch giả.
import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { pathToFileURL, fileURLToPath } from 'node:url';
const ROOT = fileURLToPath(new URL('..', import.meta.url)).replace(/[\\/]$/, '');
const MC = ROOT + '/may-chu/';
const { NGUON_NGOAI, DICH_CAU_HINH, GUI_RA, XAC_THUC, KHI_HONG } = await import(pathToFileURL(MC + 'nguon-ngoai.js').href);
const { mkDaLo, kiemMkMoi } = await import(pathToFileURL(MC + 'nen.js').href);

let sai = 0; const kiem = (t, d, ct) => { console.log((d ? '  ✓ ' : '  ✗ ') + t + (d || !ct ? '' : ' — ' + ct)); if (!d) sai++; };

/* ── Phần 1 · Sổ khớp với mã thật ── */
const tep = Object.fromEntries(fs.readdirSync(MC).filter(f => f.endsWith('.js')).map(f => [f, fs.readFileSync(MC + f, 'utf8')]));
function soat(tepMa, so, cauHinh) {
  const loi = [];
  const daKhai = new Set(so.map(r => r.mien));
  for (const [f, s] of Object.entries(tepMa)) {
    for (const m of s.matchAll(/https:\/\/([a-z0-9-]+(?:\.[a-z0-9-]+)+)/gi)) {
      const h = m[1].toLowerCase();
      if (!daKhai.has(h)) loi.push('CHƯA KHAI: ' + f + ' gọi ' + h);
    }
    for (const m of s.matchAll(/['"`]http:\/\/([^'"`\s/]+)/gi))
      loi.push('KHÔNG HTTPS: ' + f + ' có http://' + m[1]);
  }
  for (const r of so) {
    for (const k of ['ma', 'mien', 'viec', 'xacThuc', 'guiRa', 'tep'])
      if (r[k] === undefined || r[k] === '' || (Array.isArray(r[k]) && !r[k].length)) loi.push('THIẾU Ô ' + k + ': ' + (r.ma || r.mien));
    if (GUI_RA.indexOf(r.guiRa) < 0) loi.push('guiRa LẠ: ' + r.ma);
    if (XAC_THUC.indexOf(r.xacThuc) < 0) loi.push('xacThuc LẠ: ' + r.ma);
    if ((r.guiRa === 'caNhan') && !r.vi) loi.push('GỬI DỮ LIỆU NGƯỜI MÀ KHÔNG NÓI VÌ SAO: ' + r.ma);
    if ((r.guiRa === 'anDanh' || r.guiRa === 'bam') && !r.cong) loi.push('KHAI ẨN DANH MÀ KHÔNG NÊU CỔNG: ' + r.ma);
    if (r.xacThuc !== 'khong' && !r.batKhi && r.guiRa !== 'lienKet') loi.push('CẦN KHOÁ MÀ KHÔNG NÊU BIẾN BẬT: ' + r.ma);
    for (const f of r.tep || []) {
      if (!tepMa[f]) { loi.push('TỆP KHÔNG CÓ: ' + r.ma + ' → ' + f); continue; }
      if (r.cong && tepMa[f].indexOf(r.cong) < 0) loi.push('KHÔNG QUA CỔNG ' + r.cong + ': ' + r.ma + ' ở ' + f);
    }
    if (!(r.tep || []).some(f => tepMa[f] && tepMa[f].indexOf('https://' + r.mien) >= 0))
      loi.push('DÒNG CŨ — mã không còn gọi: ' + r.ma + ' ' + r.mien);
    for (const b of String(r.batKhi || '').split(/\s+/).filter(Boolean))
      if (!(r.tep || []).some(f => tepMa[f] && tepMa[f].indexOf(b) >= 0)) loi.push('BIẾN BẬT KHÔNG CÓ TRONG MÃ: ' + r.ma + ' ' + b);
  }
  for (const r of cauHinh) {
    if (GUI_RA.indexOf(r.guiRa) < 0) loi.push('guiRa LẠ: ' + r.ma);
    if (r.guiRa === 'anDanh' && !r.cong) loi.push('KHAI ẨN DANH MÀ KHÔNG NÊU CỔNG: ' + r.ma);
    if ((r.guiRa === 'caNhan' || r.guiRa === 'khong') && !r.vi) loi.push('THIẾU LỜI GIẢI THÍCH: ' + r.ma);
    for (const f of r.tep) {
      if (!tepMa[f]) { loi.push('TỆP KHÔNG CÓ: ' + r.ma + ' → ' + f); continue; }
      if (tepMa[f].indexOf(r.bien) < 0) loi.push('BIẾN ĐỊA CHỈ KHÔNG CÓ TRONG MÃ: ' + r.ma + ' ' + r.bien);
      if (r.cong && tepMa[f].indexOf(r.cong) < 0) loi.push('KHÔNG QUA CỔNG ' + r.cong + ': ' + r.ma + ' ở ' + f);
    }
  }
  /* Khi hỏng: mỗi dòng phải nói nó sập thì hệ còn gì — và đường lùi phải có
     THẬT trong mã của tệp ấy, không chỉ trên giấy. */
  for (const r of so.concat(cauHinh)) {
    const k = r.khiHong;
    if (!k || KHI_HONG.indexOf(k.kieu) < 0 || !k.vi) { loi.push('THIẾU KHI HỎNG: ' + r.ma); continue; }
    if (k.kieu === 'duongLui' && !(r.tep || []).some(f => tepMa[f] && k.lui && tepMa[f].indexOf(k.lui) >= 0))
      loi.push('ĐƯỜNG LÙI KHÔNG CÓ TRONG MÃ: ' + r.ma + ' → ' + (k.lui || '(trống)'));
  }
  const ma = so.map(r => r.ma).concat(cauHinh.map(r => r.ma));
  if (new Set(ma).size !== ma.length) loi.push('TRÙNG MÃ DÒNG');
  return loi;
}
const loi = soat(tep, NGUON_NGOAI, DICH_CAU_HINH);
kiem('Mọi máy chủ ngoài mà mã gọi tới đều có trong sổ, khai đủ cột, không dòng cũ', loi.length === 0, loi.join(' | '));

/* Phá thử ngay trong bộ thử: một phép kiểm chưa từng đỏ thì chưa phải phép kiểm. */
const pha1 = soat({ ...tep, 'la.js': "fetch('https://api.trang-la.example/x')" }, NGUON_NGOAI, DICH_CAU_HINH);
kiem('Phá thử: thêm lượt gọi tới máy chủ lạ → đỏ đúng tên', pha1.some(x => /CHƯA KHAI: la\.js gọi api\.trang-la\.example/.test(x)));
const pha2 = soat({ ...tep, 'la.js': "const u = 'http://api.khong-ma-hoa.example';" }, NGUON_NGOAI, DICH_CAU_HINH);
kiem('Phá thử: chuỗi http:// không mã hoá → đỏ', pha2.some(x => /KHÔNG HTTPS/.test(x)));
const boCong = { ...tep, 'quyen-nang-ai.js': tep['quyen-nang-ai.js'].split('soatRaNhaCungCap').join('boQuaCong') };
kiem('Phá thử: gỡ cổng ẩn danh khỏi một tệp gọi AI ngoài → đỏ',
  soat(boCong, NGUON_NGOAI, DICH_CAU_HINH).some(x => /KHÔNG QUA CỔNG soatRaNhaCungCap: NN06 ở quyen-nang-ai\.js/.test(x)));
const soCu = NGUON_NGOAI.concat([{ ma: 'NN99', mien: 'api.da-bo.example', viec: 'x', xacThuc: 'khong', guiRa: 'khong', tep: ['thu.js'] }]);
kiem('Phá thử: dòng khai máy chủ mà mã không còn gọi → đỏ', soat(tep, soCu, DICH_CAU_HINH).some(x => /DÒNG CŨ.*NN99/.test(x)));

const luiGia = NGUON_NGOAI.map(r => r.ma === 'NN02' ? Object.assign({}, r, { khiHong: { kieu: 'duongLui', lui: 'duongKhongCoThat', vi: 'x' } }) : r);
kiem('Phá thử: khai đường lùi không có trong mã → đỏ', soat(tep, luiGia, DICH_CAU_HINH).some(x => /ĐƯỜNG LÙI KHÔNG CÓ TRONG MÃ: NN02/.test(x)));
const tatCa = NGUON_NGOAI.concat(DICH_CAU_HINH);
const dung = tatCa.filter(r => r.khiHong && r.khiHong.kieu === 'dungTinhNang').map(r => r.ma);
kiem('Tự chủ: chỉ ' + dung.length + '/' + tatCa.length + ' nguồn ngoài mà sập thì một tính năng dừng (' + dung.join(', ') + ') — không nguồn nào làm sập việc lõi',
  dung.length <= 2 && dung.every(m => ['NN09', 'CH02'].indexOf(m) >= 0), dung.join(','));

/* ── Phần 2 · Mọi cửa đặt mật khẩu mới đều đi qua kiemMkMoi ── */
const CUA_MK = ['mat-khau.js', 'dang-ky.js', 'quan-ly-tai-khoan.js', 'cuu-he.js', 'worker.js'];
const thieu = CUA_MK.filter(f => tep[f].indexOf('kiemMkMoi(') < 0);
const goiTho = CUA_MK.filter(f => /mkQuaDeDoan\s*\(/.test(tep[f]));
kiem('Năm tệp có cửa đặt mật khẩu đều gọi kiemMkMoi, không gọi thẳng luật cũ', !thieu.length && !goiTho.length,
  'thiếu: ' + thieu.join(',') + ' · gọi thẳng: ' + goiTho.join(','));

/* ── Phần 3 · mkDaLo: hỏi mà không nói ra ── */
const sha1 = s => crypto.createHash('sha1').update(s).digest('hex').toUpperCase();
const MK_LO = 'Hanoi@2024abc', H = sha1(MK_LO);
let goi = [];
const fetchGoc = globalThis.fetch;
function giaFetch(traVe) {
  globalThis.fetch = async (url, o) => { goi.push({ url: String(url), o }); return traVe(url); };
}
const phanHoi = (txt, ok = true) => ({ ok, text: async () => txt });

goi = []; giaFetch(() => phanHoi(''));
kiem('Biến GITA_KIEM_MK_RO chưa bật → không gọi ra mạng', (await mkDaLo(MK_LO, {})) === '' && goi.length === 0);

goi = []; giaFetch(() => phanHoi('0000000000000000000000000000000000A:3\r\n' + H.slice(5) + ':52\r\nFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF:0'));
const ra = await mkDaLo(MK_LO, { GITA_KIEM_MK_RO: '1' });
kiem('Mật khẩu có trong danh sách đã lộ → bị chặn kèm lời dặn', /lộ dữ liệu/.test(ra), ra);
const u = goi[0] ? goi[0].url : '';
kiem('Chỉ gửi ĐÚNG 5 ký tự đầu của mã băm — không mật khẩu, không mã băm đầy đủ',
  goi.length === 1 && u === 'https://api.pwnedpasswords.com/range/' + H.slice(0, 5) &&
  u.indexOf(H.slice(5, 12)) < 0 && u.indexOf(MK_LO) < 0 && !(goi[0].o && goi[0].o.body), u);
kiem('Có xin đệm (Add-Padding) để độ dài phản hồi không lộ gì', goi[0] && goi[0].o.headers['Add-Padding'] === 'true');

goi = []; giaFetch(() => phanHoi(H.slice(5) + ':0'));
kiem('Dòng đệm mang số 0 không bị tính là đã lộ', (await mkDaLo(MK_LO, { GITA_KIEM_MK_RO: '1' })) === '');
giaFetch(() => { throw new Error('mất mạng'); });
kiem('Dịch vụ không trả lời → cửa vẫn mở (không để bên thứ ba khoá cửa vào)', (await mkDaLo(MK_LO, { GITA_KIEM_MK_RO: '1' })) === '');
giaFetch(() => phanHoi('', false));
kiem('Dịch vụ báo lỗi → cửa vẫn mở', (await mkDaLo(MK_LO, { GITA_KIEM_MK_RO: '1' })) === '');
goi = []; giaFetch(() => phanHoi(H.slice(5) + ':9'));
kiem('Luật tại chỗ chạy TRƯỚC: mật khẩu ngắn bị chặn mà không cần hỏi ra ngoài',
  /10 ký tự/.test(await kiemMkMoi('abc', {}, { GITA_KIEM_MK_RO: '1' })) && goi.length === 0);
kiem('wrangler.toml bật soát mật khẩu đã lộ ở máy chủ thật',
  /^GITA_KIEM_MK_RO\s*=\s*"1"/m.test(fs.readFileSync(MC + 'wrangler.toml', 'utf8')));

/* ── Phần 4 · Cửa tạo Super Admin đầu tiên — luật cũ chỉ đòi 8 ký tự ── */
const worker = (await import(pathToFileURL(MC + 'worker.js').href)).default;
const sq = new DatabaseSync(':memory:');
sq.exec(fs.readFileSync(MC + 'csdl.sql', 'utf8'));
const db = { prepare(sql) { let a = []; const st = {
  bind(...x) { a = x; return st; },
  first() { return Promise.resolve(sq.prepare(sql).get(...a) || null); },
  all() { return Promise.resolve({ results: sq.prepare(sql).all(...a) }); },
  run() { const r = sq.prepare(sql).run(...a); return Promise.resolve({ meta: { changes: Number(r.changes) } }); } }; return st; } };
const env = { CSDL: db, GITA_TIEU: 'tieu-thu-nguon-ngoai', GITA_TAO_ADMIN: 'khoa-khoi-tao-thu', GITA_KIEM_MK_RO: '1' };
console.error = () => {};
async function taoAdmin(mk) {
  const r = await worker.fetch(new Request('https://gita365.example.workers.dev/', { method: 'POST',
    headers: { 'Content-Type': 'text/plain', 'CF-Connecting-IP': '203.0.113.77', Origin: 'https://gita365.pages.dev' },
    body: JSON.stringify({ fn: 'taoAdminDau', setupKey: 'khoa-khoi-tao-thu', tenMoi: 'quanglead', mk }) }), env, { waitUntil() {} });
  return r.json();
}
giaFetch(() => phanHoi(''));
let r = await taoAdmin('12345678');
kiem('Super Admin đầu tiên: "12345678" bị chặn (bản cũ nhận vì đủ 8 ký tự)', r.ok === false && r.code === 'WEAK', JSON.stringify(r));
giaFetch(() => phanHoi(sha1('Hanoi@2024xyz').slice(5) + ':7'));
r = await taoAdmin('Hanoi@2024xyz');
kiem('Super Admin đầu tiên: mật khẩu đã lộ bị chặn', r.ok === false && r.code === 'WEAK', JSON.stringify(r));
giaFetch(() => phanHoi(''));
r = await taoAdmin('Den-Truong-Sa-xanh-9');
kiem('Super Admin đầu tiên: mật khẩu mạnh, chưa lộ → tạo được', r.ok === true, JSON.stringify(r));
globalThis.fetch = fetchGoc;

console.log(sai ? `\n✗ ${sai} phép đo sai` : '\n✓ Sổ máy chủ ngoài khớp mã; mật khẩu mới được soát với danh sách đã lộ mà không lộ gì');
process.exit(sai ? 1 : 0);
