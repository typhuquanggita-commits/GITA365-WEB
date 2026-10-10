/* Canh KIẾN TRÚC Ngôi nhà thịnh vượng — chạy trong CI, không cần trình duyệt.
   Kiến trúc này đã bị viết lại bốn lần (9.99.150 · 152 · 253 · 254) và mỗi
   lần hỏng một kiểu: nút dồn về tâm, chữ lộn ngược, ô tràn, vòng đứng yên,
   và — tìm ra 10/10/2026 — lớp vòng trong suốt CHE KÍN ngôi nhà nên 0/11
   phần bấm được trên máy tính. Không có phép canh nào thì lần viết lại thứ
   năm hỏng lại mà không ai biết. Bộ này khoá đúng những bất biến ấy.
   Phần đo hình học thật (không chạm nhau, chữ thẳng suốt vòng quay, bấm
   trúng): tools/thu-ngoi-nha-trinh-duyet.mjs.
   Dùng: node tools/thu-ngoi-nha.mjs */
import fs from 'node:fs';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
const ROOT = process.argv[2] || fileURLToPath(new URL('..', import.meta.url)).replace(/[\\/]$/, '');
const css = fs.readFileSync(ROOT + '/assets/style.css', 'utf8');
const jsNha = fs.readFileSync(ROOT + '/src/ngoi-nha.js', 'utf8');

let dat = 0, truot = 0;
const kiem = (ten, dk, ct) => { if (dk) { dat++; console.log('OK  ' + ten); } else { truot++; console.log('SAI ' + ten + (ct ? ' — ' + ct : '')); } };

/* ── dựng màn trong vm với kho giả 10 bánh đà ── */
function dung(o) {
  const luu = {};
  const win = {
    matchMedia: () => ({ matches: !!o.giamDong }),
    localStorage: o.chanLuu ? { getItem() { throw new Error('chặn'); }, setItem() { throw new Error('chặn'); } }
      : { getItem: k => (k in luu ? luu[k] : null), setItem: (k, v) => { luu[k] = String(v); } }
  };
  const G = { VIEWS: {}, can: () => true, S: { roleObj: { lv: 1 } },
    U: { h: s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'), ic: n => '<i data-ic="' + n + '"></i>' },
    BD_LON: Array.from({ length: 10 }, (_, i) => ({ ten: 'Bánh ' + (i + 1), ic: 'star' })) };
  win.G = G; win.window = win;
  if (o.cheDo) luu['gita.nhaQuay'] = o.cheDo;
  const ctx = vm.createContext(Object.assign(win, { document: { querySelector: () => null }, console }));
  vm.runInContext(jsNha, ctx);
  return { G, html: G.VIEWS['ngoi-nha'](), luu };
}
const d = dung({});
const slot = [...d.html.matchAll(/class="nha-bd-slot" style="left:([\d.]+)%;top:([\d.]+)%"/g)].map(m => [Number(m[1]), Number(m[2])]);
kiem('mười bánh đà, mỗi bánh một slot trên vòng', slot.length === 10, slot.length);
const ban = slot.map(([x, y]) => Math.hypot(x - 50, y - 50));
kiem('mọi bánh nằm đúng bán kính 37% (± 0,05)', ban.every(r => Math.abs(r - 37) < 0.05), ban.map(r => r.toFixed(2)).join(','));
const goc = slot.map(([x, y]) => (Math.atan2(y - 50, x - 50) * 180 / Math.PI + 450) % 360);
const buoc = goc.map((g, i) => ((goc[(i + 1) % 10] - g) + 360) % 360);
kiem('mười bánh cách đều 36°, bánh đầu ở đỉnh', buoc.every(b => Math.abs(b - 36) < 0.2) && Math.abs(goc[0]) < 0.2, buoc.map(b => b.toFixed(1)).join(','));
kiem('mỗi bánh là <button data-v="banh-da"> thật (bấm được, Tab tới được)', (d.html.match(/<button class="nha-bd-o"[^>]*data-v="banh-da"/g) || []).length === 10);
kiem('bánh đà đọc THẲNG G.BD_LON, không chép mười tên vào màn', /G\.BD_LON/.test(jsNha) && !/'Nhìn thật'|'Nhịp nhà'|'Truyền lại'/.test(jsNha));
kiem('vòng khẩu hiệu SVG luôn dựng, đứng yên (không gắn animation)', /class="nha-khauhieu"/.test(d.html));
const phan = (d.html.match(/class="nha-o /g) || []).length;
kiem('đủ 11 phần ngôi nhà: mái · 8 ngăn · cửa · nền', phan === 11 && d.G.NHA_PHAN.length === 11, phan);

/* ── mỗi phần trỏ một màn CÓ THẬT trong G.NAV ── */
const core = fs.readFileSync(ROOT + '/src/data.core.js', 'utf8');
const navV = new Set([...core.matchAll(/\{v:'([a-z0-9-]+)'/g)].map(m => m[1]));
const chet = d.G.NHA_PHAN.filter(p => !navV.has(p.v)).map(p => p.k + '→' + p.v);
kiem('mọi phần ngôi nhà trỏ màn có trong G.NAV (không cửa dẫn vào tường)', !chet.length && navV.has('banh-da'), chet.join(', '));

/* ── quay / dừng: lựa chọn người dùng thắng mặc định của máy ── */
kiem('máy KHÔNG xin giảm chuyển động → đang quay, nút "Dừng"', d.G.nhaDangQuay() === true && /Dừng vòng bánh đà/.test(d.html));
const g1 = dung({ giamDong: true });
kiem('máy xin giảm chuyển động → vẫn QUAY (chậm) + NÓI RA vì sao + nút "Dừng" và "Quay đủ nhịp"',
  g1.G.nhaDangQuay() === true && /quay chậm/.test(g1.html) && /Dừng vòng bánh đà/.test(g1.html) && /Quay đủ nhịp/.test(g1.html) && !/class="nha-ring nha-/.test(g1.html));
const g2 = dung({ giamDong: true, cheDo: 'quay' });
kiem('người dùng chọn "quay" → quay dù máy xin giảm (lớp nha-quay)', g2.G.nhaDangQuay() === true && /class="nha-ring nha-quay"/.test(g2.html));
const g3 = dung({ cheDo: 'dung' });
kiem('người dùng chọn "dừng" → dừng dù máy không xin (lớp nha-dung)', g3.G.nhaDangQuay() === false && /class="nha-ring nha-dung"/.test(g3.html));
let vo = null; try { vo = dung({ chanLuu: true, giamDong: true }); } catch (e) { vo = null; }
kiem('trình duyệt chặn lưu → không vỡ màn, theo mặc định (quay)', vo && vo.G.nhaDangQuay() === true && /nha-ring/.test(vo.html));
const g4 = dung({}); g4.G.nhaDoiQuay();
kiem('bấm nút → nhớ lựa chọn (gita.nhaQuay)', g4.luu['gita.nhaQuay'] === 'dung');

/* ── CSS: khối @container nhaVong giữ đúng các bất biến ── */
const iC = css.indexOf('@container nhaVong (min-width:760px){');
let sau = -1;
if (iC >= 0) { let n = 0; for (let i = css.indexOf('{', iC); i < css.length; i++) { if (css[i] === '{') n++; else if (css[i] === '}' && --n === 0) { sau = i; break; } } }
const khoi = iC >= 0 && sau > 0 ? css.slice(iC, sau + 1) : '';
kiem('có khối @container nhaVong dựng con dấu tròn', !!khoi);
const quay = khoi.match(/\.nha-ring-nodes\{[^}]*animation:nhaQuay (\d+)s linear infinite/);
const giu = khoi.match(/\.nha-ring-nodes \.nha-bd-o\{[^}]*animation:nhaGiu (\d+)s linear infinite/);
kiem('vòng quay (nhaQuay) và bánh giữ thẳng (nhaGiu) CÙNG thời lượng — lệch là chữ nghiêng dần', quay && giu && quay[1] === giu[1], (quay && quay[1]) + ' / ' + (giu && giu[1]));
kiem('nhaGiu quay NGƯỢC chiều và giữ tâm (translate -50%) — chữ luôn thẳng',
  /@keyframes nhaGiu\{from\{transform:translate\(-50%,-50%\) rotate\(0\)\}to\{transform:translate\(-50%,-50%\) rotate\(-360deg\)\}\}/.test(css) &&
  /@keyframes nhaQuay\{from\{transform:rotate\(0\)\}to\{transform:rotate\(360deg\)\}\}/.test(css));
kiem('lớp vòng KHÔNG nhận bấm (pointer-events:none) — không che 11 phần ngôi nhà', /\.nha-ring-nodes\{[^}]*pointer-events:none/.test(khoi));
kiem('chỉ nút bánh đà nhận bấm (pointer-events:auto)', /\.nha-ring-nodes \.nha-bd-o\{pointer-events:auto\}/.test(css));
kiem('lựa chọn "quay" của người dùng có luật riêng, nặng hơn luật giảm chuyển động',
  /\.nha-ring\.nha-quay \.nha-ring-nodes\{animation:nhaQuay/.test(khoi) && /\.nha-ring\.nha-quay \.nha-ring-nodes \.nha-bd-o\{animation:nhaGiu/.test(khoi));
kiem('lựa chọn "quay" giữ 60 giây bằng !important — thắng luật *{animation-duration:.01ms!important} của máy giảm chuyển động',
  /\*\{animation-duration:\.01ms!important/.test(css) &&
  /\.nha-ring\.nha-quay \.nha-ring-nodes,\.nha-ring\.nha-quay \.nha-ring-nodes \.nha-bd-o\{animation-duration:(\d+)s!important\}/.test(khoi) &&
  khoi.match(/\.nha-ring\.nha-quay \.nha-ring-nodes,\.nha-ring\.nha-quay \.nha-ring-nodes \.nha-bd-o\{animation-duration:(\d+)s!important\}/)[1] === (quay && quay[1]));
kiem('lựa chọn "dừng" dừng cả vòng lẫn bánh', /\.nha-ring\.nha-dung \.nha-ring-nodes,\.nha-ring\.nha-dung \.nha-ring-nodes \.nha-bd-o\{animation:none\}/.test(khoi));
kiem('rê/Tab vào bánh thì dừng CẢ vòng lẫn bánh cùng lúc (không nghiêng chữ)',
  /\.nha-ring-nodes:hover,\.nha-ring-nodes:hover \.nha-bd-o,\s*\.nha-ring-nodes:focus-within,\.nha-ring-nodes:focus-within \.nha-bd-o\{animation-play-state:paused\}/.test(khoi));
kiem('máy xin giảm chuyển động → quay CHẬM 240s (!important thắng luật ép .01ms), không dừng hẳn',
  /@media\(prefers-reduced-motion:reduce\)\{\.nha-ring-nodes,\.nha-ring-nodes \.nha-bd-o\{animation-duration:240s!important\}\}/.test(khoi));
/* Luật tắt vòng chỉ được sống ở MỘT chỗ: ngoài khối container mà còn một luật
   animation:none cho vòng trong @media giảm chuyển động thì nó đè mất nhịp chậm. */
const ngoai = css.slice(0, iC) + css.slice(sau + 1);
kiem('không còn bản chép thứ hai của luật tắt vòng ngoài khối @container',
  !/prefers-reduced-motion:reduce\)\{[^@]*\.nha-ring-nodes[^{]*\{[^}]*animation:none/.test(ngoai), (ngoai.match(/\.nha-ring-nodes[^{]*\{[^}]*animation:none[^}]*\}/g) || []).join(' | '));
kiem('vòng khẩu hiệu không quay', !/\.nha-khauhieu[^{]*\{[^}]*animation:/.test(css));
kiem('lớp: khẩu hiệu (0) < nhà (1) < bánh đà (3)', /\.nha-khauhieu\{[^}]*z-index:0/.test(khoi) && /\.nha-ring \.nha\{[^}]*z-index:1/.test(khoi) && /\.nha-ring-nodes\{[^}]*z-index:3/.test(khoi));
const baseNut = css.indexOf('.nha-quay-nut{display:none');
kiem('luật ẩn nút ở khổ hẹp đứng TRƯỚC khối @container (dòng sau thắng)', baseNut > 0 && baseNut < iC);
/* Hình học tĩnh: tâm bánh 37% + nửa nhãn (13.5cqi/2 ≈ 6.75%) < vòng chữ (47% − cỡ chữ 3cqi) */
const maxW = Number((khoi.match(/\.nha-ring-nodes \.nha-bd-o\{[^}]*max-width:([\d.]+)cqi/) || [])[1]);
kiem('nhãn bánh đà không chạm vòng khẩu hiệu: 37 + max-width/2 < 47 − 3', maxW > 0 && 37 + maxW / 2 < 44, maxW);

console.log('\n' + (truot ? '✗ ' + truot + ' SAI · ' : '✓ ') + dat + ' đạt');
process.exit(truot ? 1 : 0);
