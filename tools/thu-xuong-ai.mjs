// Thử Xưởng phim AI (src/xuong-ai.js) và Cắt theo nhịp nhạc (src/cat-nhip.js).
// Chạy: node tools/thu-xuong-ai.mjs — không cần trình duyệt, không cần mạng.
//
// Phần 1 thử thuật toán dò nhịp trên tín hiệu TỰ DỰNG: biết trước nhịp ở
// đâu, nên đo được máy bắt đúng hay lệch bao nhiêu mili-giây. Một bài
// không có nhịp (tiếng ồn trắng) thì máy phải NÓI là độ tin thấp.
// Phần 2 đối chiếu hai đầu: mỗi mục trong danh mục của khung ↔ bộ vẽ có
// thật trong src/. Một mục trỏ vào bộ vẽ không tồn tại thì người bấm gặp
// ô trống — và không bộ kiểm nào khác biết.
import fs from 'node:fs';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
const ROOT = fileURLToPath(new URL('..', import.meta.url)).replace(/[\\/]$/, '');
const doc = (f) => fs.readFileSync(ROOT + '/' + f, 'utf8');

let sai = 0;
const kiem = (t, d, ct) => { console.log((d ? '  ✓ ' : '  ✗ ') + t + (d || !ct ? '' : ' — ' + ct)); if (!d) sai++; };

/* ── nạp cat-nhip.js trong một hộp cát tối thiểu ── */
const hop = { window: { G: { U: {} } }, Float32Array, Math };
hop.window.window = hop.window;
vm.createContext(hop);
vm.runInContext(doc('src/cat-nhip.js').replace(/^'use strict';/m, ''), hop);
const CN = hop.window.G.catNhip;

/* Bộ sinh số ngẫu nhiên có hạt giống (mulberry32). Bản đầu dùng công thức
   đồng dư nhân số lớn — vượt độ chính xác của số thực 53 bit, dãy lặp lại
   sau vài nghìn mẫu, và "tiếng ồn" thành một tín hiệu có chu kỳ: máy đo ra
   độ tin 0,85 cho thứ đáng lẽ là không nhịp. Lỗi ở bài thử, không ở máy. */
function ngau(hat) {
  let a = hat >>> 0;
  return () => { a = (a + 0x6D2B79F5) >>> 0; let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return (((t ^ (t >>> 14)) >>> 0) / 4294967296) - 0.5; };
}

/* Tín hiệu nhịp: mỗi nhịp một tiếng "cách" 30ms tắt dần, trên nền ồn nhỏ
   và một âm ngân liên tục (để chắc máy lấy phần TĂNG chứ không lấy độ to). */
function dungNhip(bpm, giay, sr, lech = 0.3) {
  const a = new Float32Array(Math.floor(giay * sr)), buoc = 60 / bpm, dung = [];
  const ngauNhien = ngau(12345);
  for (let i = 0; i < a.length; i++) a[i] = 0.02 * ngauNhien() + 0.08 * Math.sin(2 * Math.PI * 220 * i / sr);
  for (let t = lech; t < giay; t += buoc) {
    dung.push(t);
    const o = Math.floor(t * sr);
    for (let j = 0; j < 0.03 * sr && o + j < a.length; j++) a[o + j] += 0.9 * Math.exp(-j / (0.006 * sr)) * Math.sin(2 * Math.PI * 1500 * j / sr);
  }
  return { a, dung };
}
function lechTB(kq, dung) {
  let tong = 0, n = 0;
  for (const t of dung) {
    let gan = Infinity;
    for (const x of kq.nhip) gan = Math.min(gan, Math.abs(x - t));
    tong += gan; n++;
  }
  return tong / n;
}

console.log('\n1 · Dò nhịp');
const SR = 22050;
for (const bpm of [120, 95, 140]) {
  const { a, dung } = dungNhip(bpm, 20, SR);
  const kq = CN.timNhip(a, SR);
  const l = lechTB(kq, dung);
  kiem(bpm + ' nhịp/phút: máy đo ' + kq.bpm + ', lệch trung bình ' + Math.round(l * 1000) + 'ms, độ tin ' + kq.tin,
    Math.abs(kq.bpm - bpm) <= 1 && l < 0.02 && kq.tin >= 0.3);
}
{
  const a = new Float32Array(20 * SR), ngauNhien = ngau(7);
  for (let i = 0; i < a.length; i++) a[i] = ngauNhien();
  const kq = CN.timNhip(a, SR);
  kiem('Tiếng ồn không nhịp: máy nói độ tin thấp (' + kq.tin + ' < 0.3) thay vì tự tin cắt sai', kq.tin < 0.3);
}
{
  const { a } = dungNhip(120, 10, SR);
  const kq = CN.timNhip(a, SR, 100);
  kiem('Nhịp gõ tay thắng nhịp tự dò (gõ 100 → dùng 100)', kq.bpm === 100);
}
{
  const nhip = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4];
  const d2 = CN.diemCat(nhip, 2, 0, 5);
  kiem('Cắt mỗi 2 nhịp: đoạn đầu từ 0, đoạn cuối kết ở hết bài',
    d2[0].tu === 0 && d2[d2.length - 1].den === 5 && d2.every((d, i) => i === 0 || d.tu === d2[i - 1].den),
    JSON.stringify(d2));
  const d4 = CN.diemCat(nhip, 4, 1.2, 5);
  kiem('Bắt đầu từ giây 1,2: không đoạn nào trước 1,2', d4.every(d => d.tu >= 1.2), JSON.stringify(d4));
}

console.log('\n2 · Danh mục khung ↔ bộ vẽ thật');
const xa = doc('src/xuong-ai.js');
const tatCaSrc = fs.readdirSync(ROOT + '/src').filter(f => f.endsWith('.js')).map(f => doc('src/' + f)).join('\n');
const thieu = [];
for (const m of xa.matchAll(/goiMan\('([\w-]+)'\)/g))
  if (!new RegExp("G\\.VIEWS\\[\\s*'" + m[1] + "'\\s*\\]\\s*=").test(tatCaSrc)) thieu.push('màn ' + m[1]);
const sx = doc('src/san-xuat-ai.js');
for (const m of xa.matchAll(/sxa\('([\w-]+)'\)/g))
  if (sx.indexOf("tabBtn('" + m[1] + "'") < 0) thieu.push('ngăn san-xuat-ai ' + m[1]);
for (const m of xa.matchAll(/G\.(\w+) && G\.\1\.ve/g))
  /* Ba cách khai một bộ vẽ trong kho: G.x.ve = …; var y = G.x = G.x || {} rồi y.ve = …; G.x = { ve: … } */
  if (!new RegExp('G\\.' + m[1] + '\\.ve\\s*=').test(tatCaSrc) &&
      !new RegExp('var (\\w+) = G\\.' + m[1] + ' = G\\.' + m[1] + ' \\|\\| \\{\\};[\\s\\S]*?\\n\\s*\\1\\.ve = function').test(tatCaSrc) &&
      !new RegExp('G\\.' + m[1] + '\\s*=\\s*\\{[\\s\\S]{0,200}ve\\s*:').test(tatCaSrc)) thieu.push('bộ vẽ G.' + m[1] + '.ve');
kiem('Mọi mục danh mục trỏ vào bộ vẽ có thật', !thieu.length, thieu.join(' · '));

const ma = [...xa.matchAll(/\{ k: '([\w-]+)'/g)].map(m => m[1]);
kiem('Không mục nào trùng mã (' + ma.length + ' mục)', new Set(ma).size === ma.length);
const tuVe = (xa.match(/TU_VE = \{([^}]*)\}/) || [])[1] || '';
const coVe = new Set([...xa.matchAll(/\{ k: '([\w-]+)'[^}\n]*ve: function/g)].map(m => m[1]));
const khongVe = ma.filter(k => !coVe.has(k) && tuVe.indexOf(k + ':') < 0);
kiem('Mục nào không gọi công cụ cũ thì có bộ vẽ riêng trong TU_VE', !khongVe.length, khongVe.join(','));

console.log('\n3 · Riêng tư và nơi đăng ký');
const khongMang = ['src/cat-nhip.js', 'src/xuong-ai.js'].filter(f => /\bfetch\s*\(|XMLHttpRequest|goiMayChu|sendBeacon|WebSocket/.test(doc(f).replace(/\/\*[\s\S]*?\*\//g, '')));
kiem('Cắt nhịp và khung không gọi mạng — nhạc, ảnh không rời máy', !khongMang.length, khongMang.join(','));
const ds = JSON.parse(doc('tools/danh-sach-src.json'));
kiem('Hai tệp mới nằm trong gói app, không ở gói nghề',
  ds.app.includes('src/cat-nhip.js') && ds.app.includes('src/xuong-ai.js') && !ds.nghe.includes('src/xuong-ai.js'));
kiem('Màn có mục cột trái, nằm trong màn chính "Nội dung & truyền thông"',
  /\{v:'xuong-ai'[^}]*perm:'qt_trang'/.test(doc('src/data.core.js')) && /phan:\['xuong-ai'/.test(doc('src/v50-man.js')));
kiem('Bộ điều khiển sản xuất có chế độ nhúng (bỏ hàng tab trùng danh mục)', /G\.S\.axNhung/.test(sx));

console.log('\n4 · Một cửa — các màn phim cũ mở vào đúng ngăn');
{
  const v50 = doc('src/data-v50.js'), app = doc('src/app.js'), nganCo = new Set(ma);
  const an = (v50.match(/V\.AN = \{([\s\S]*?)\n  \};/) || [])[1] || '';
  kiem('GITA Studio và Phim ngắn 9:16 rút khỏi cột trái (V50.AN), lối vào chung là Xưởng phim AI',
    /'studio':\s*\['xuong-ai'/.test(an) && /'xuong-phim':\s*\['xuong-ai'/.test(an));
  /* KHÔNG được chuyển hướng: studio.js và xuong-phim.js chỉ vẽ lại khi
     G.S.view đúng tên chúng — chuyển hướng là sửa gì cũng không hiện. */
  const gopV50 = (v50.match(/V\.GOP = \{([\s\S]*?)\n  \};/) || [])[1] || '';
  kiem('Hai màn ấy KHÔNG nằm trong bảng chuyển hướng GOP', !/'studio':|'xuong-phim':/.test(gopV50));
  kiem('Hai màn ấy tự vẽ khung (bộ vẽ gốc được giữ để khung gọi lại)',
    /var CHU_MAN = \{ studio: 1, 'xuong-phim': 1 \}/.test(xa) && /GOC\[v\] = G\.VIEWS\[v\];/.test(xa) && /var f = GOC\[v\] \|\| G\.VIEWS\[v\]/.test(xa));
  kiem('Ngăn của hai màn ấy mở bằng chính mã màn cũ (G.xaMo → G.go(chủ))',
    /var CHU = \{ studio: 'studio', phim916: 'xuong-phim' \}/.test(xa) && /G\.go\(chu\)/.test(xa));
  const thuTu = ds.app;
  kiem('Thứ tự gộp: studio.js và xuong-phim.js nạp TRƯỚC xuong-ai.js (để giữ được bộ vẽ gốc)',
    thuTu.indexOf('src/studio.js') >= 0 && thuTu.indexOf('src/xuong-phim.js') >= 0 &&
    thuTu.indexOf('src/studio.js') < thuTu.indexOf('src/xuong-ai.js') && thuTu.indexOf('src/xuong-phim.js') < thuTu.indexOf('src/xuong-ai.js'));
  const cua = (xa.match(/G\.XA_CUA = \{([^}]*)\}/) || [])[1] || '';
  const cuaDs = [...cua.matchAll(/'([\w-]+)': '([\w-]+)'/g)].map(m => [m[1], m[2]]);
  kiem('Bốn màn con (sản xuất, bàn dựng, hệ điều hành, 10 bước) mở trong khung', cuaDs.length === 4, cua);
  const tabNgan = (xa.match(/var TAB_NGAN = \{([\s\S]*?)\};/) || [])[1] || '';
  const tnDs = [...tabNgan.matchAll(/(\w+): '([\w-]+)'/g)].map(m => [m[1], m[2]]);
  const tabSx = [...sx.matchAll(/tabBtn\('(\w+)'/g)].map(m => m[1]);
  kiem('Mọi tab của bộ điều khiển sản xuất có một ngăn trong khung', tabSx.every(t => tnDs.some(x => x[0] === t)),
    tabSx.filter(t => !tnDs.some(x => x[0] === t)).join(','));
  const nganSai = cuaDs.concat(tnDs).filter(g => !nganCo.has(g[1])).map(g => g[0] + '→' + g[1]);
  kiem('Mọi đường gộp trỏ vào một ngăn có thật của khung', !nganSai.length, nganSai.join(','));
  kiem('render() đưa màn con vào khung, đúng ngăn của tab đang mở', /G\.XA_CUA\[G\.S\.view\]/.test(app) && /G\.XA_TAB_NGAN\[G\.S\.axTab\]/.test(app));
  const phan = (doc('src/v50-man.js').match(/id:'noi-dung'[\s\S]*?phan:\[([^\]]*)\]/) || [])[1] || '';
  kiem('Màn chính "Nội dung & truyền thông" không còn chip cho màn đã gộp',
    /'xuong-ai'/.test(phan) && !/'studio'|'xuong-phim'/.test(phan), phan);
}

console.log(sai ? '\n✗ ' + sai + ' chỗ đỏ' : '\n✓ Xưởng phim AI: xanh');
process.exit(sai ? 1 : 0);
