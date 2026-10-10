/* Thử Xưởng phim đào tạo (src/xuong-phim.js + các sửa N1–N12 của bản soát
   10/2026). Nạp tệp vào một vm giả trình duyệt rồi đo HÀNH VI của các hàm
   thuần: tách kịch bản, dò tên, thời lượng theo giọng, phụ đề, khổ 16:9.
   Phần cần canvas/AudioContext đo bằng đọc mã (vị trí khối, không loop).
   Dùng: node tools/thu-xuong-phim.mjs */
import fs from 'node:fs';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
const ROOT = fileURLToPath(new URL('..', import.meta.url)).replace(/[\\/]$/, '');
let dat = 0, truot = 0;
const kiem = (ten, dk, ct) => { if (dk) { dat++; console.log('OK  ' + ten); } else { truot++; const d = 'SAI ' + ten + (ct ? ' — ' + ct : ''); console.log(d);
  if (process.env.GITHUB_ACTIONS) console.log('::error title=thu-xuong-phim::' + d.replace(/[\r\n%]/g, ' ').slice(0, 900)); } };

function nap(ma) {
  const G = { VIEWS: {}, U: { h: s => String(s == null ? '' : s), ic: () => '', toast: () => {} } };
  const ctx = { window: { G }, G, console, Date, Math, JSON, RegExp, String, Number, Array, Object, Promise, setTimeout };
  ctx.window.window = ctx.window;
  vm.createContext(ctx);
  vm.runInContext(ma, ctx, { filename: 'xuong-phim.js' });
  return ctx.window.G;
}
const goc = fs.readFileSync(ROOT + '/src/xuong-phim.js', 'utf8');

function chay(ma) {
  const G = nap(ma), r = {};
  /* N5 — "Lan" không được kéo theo "An" */
  G.xpDA.nhanVat = [{ id: 'a', ten: 'An', prompt: 'girl An' }, { id: 'l', ten: 'Lan', prompt: 'girl Lan' }, { id: 'h', ten: 'Mẹ Hoa', prompt: 'mother' }];
  const c1 = { id: 'c1', hanhDong: 'Mẹ Hoa bước vào, thấy Lan đang khóc', thoai: [], tinNhan: [], chiDao: '', giay: 5 };
  r.nvTen = G.xpPrompt(c1).nv.map(n => n.ten);
  /* N6 — người nói được thêm vào sổ */
  const da = { boiCanh: [], nhanVat: [{ id: 'x', ten: 'Minh' }] };
  G.xpTachKichBan('# Phòng khách\n[Trung cảnh] Bé ngồi buồn\nTrainer Quang: Con đang thấy thế nào?\nBé Na: Con buồn', da);
  r.soNhanVat = da.nhanVat.map(n => n.ten);
  r.boiCanhMoi = da.boiCanh.map(b => b.ten);
  /* N1 — giọng cảnh kéo dài cảnh, phụ đề chia theo giọng */
  G.xpDA.khung = '720x1280';
  G.xpDA.canh = [{ id: 'k1', hanhDong: 'x', thoai: [{ ai: 'A', loi: 'Một câu nói ngắn' }], tinNhan: [], giay: 5, giong: 'g1' }];
  G.xpVat.g1 = { ma: 'g1', loai: 'giong', buffer: { duration: 9 } };
  r.tong = G.xpTongGiay();
  r.phuDe = G.xpDongPhuDe();
  delete G.xpVat.g1;
  r.tongKhongGiong = G.xpTongGiay();
  /* 16:9 */
  G.xpDA.khung = '1280x720';
  r.prompt169 = G.xpPrompt(c1);
  r.ngang = G.xpLaNgang();
  G.xpDA.khung = '1080x1920';
  r.prompt916 = G.xpPrompt(c1);
  return r;
}

const r = chay(goc);
kiem('N5: cảnh có "Lan" không kéo theo nhân vật "An" (dò theo biên âm tiết)', !r.nvTen.includes('An') && r.nvTen.includes('Lan') && r.nvTen.includes('Mẹ Hoa'), r.nvTen.join(','));
kiem('N6: người nói tự vào sổ nhân vật', r.soNhanVat.includes('Trainer Quang') && r.soNhanVat.includes('Bé Na') && r.soNhanVat.includes('Minh'), r.soNhanVat.join(','));
kiem('N6: bối cảnh mới tự thêm', r.boiCanhMoi.includes('Phòng khách'));
kiem('N1: cảnh có giọng 9s kéo dài thành 9,5s (không cắt giọng)', Math.abs(r.tong - 9.5) < 0.01 && r.tongKhongGiong === 5, r.tong + ' / ' + r.tongKhongGiong);
kiem('N1: phụ đề trải theo độ dài giọng', r.phuDe.length === 1 && r.phuDe[0].den > 8, JSON.stringify(r.phuDe));
kiem('16:9: prompt nói khung ngang', r.ngang === true && /Horizontal 16:9/.test(r.prompt169.anh) && /horizontal 16:9/.test(r.prompt169.video));
kiem('9:16 vẫn là khung dọc', /Vertical 9:16/.test(r.prompt916.anh));

console.log('— đọc mã');
const xa = fs.readFileSync(ROOT + '/src/xuong-ai.js', 'utf8');
const pn = fs.readFileSync(ROOT + '/src/phim-nhanh.js', 'utf8');
const bd = fs.readFileSync(ROOT + '/src/studio-ban-dung.js', 'utf8');
const dap = fs.readFileSync(ROOT + '/src/du-an-phim.js', 'utf8');
const khoiLD = (goc.match(/var ld = G\.xpDA\.loiDan[\s\S]*?chay\.loiDan = sl;/) || [''])[0];
kiem('N1: lời dẫn cả phim phát một lần — không đặt loop', khoiLD.length > 0 && !/loop/.test(khoiLD));
kiem('N1: giọng là tệp hoặc ghi micro — không gọi bộ sinh giọng', /getUserMedia/.test(goc) && !/speechSynthesis|SpeechSynthesis|piper/i.test(goc.replace(/\/\*[\s\S]*?\*\//g, '')));
kiem('N1: ghi micro không sinh địa chỉ blob', !/createObjectURL/.test(goc.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '')));
const viTri5 = goc.indexOf('5 · Nạp clip, dựng và xuất phim'), viTriMay = goc.indexOf('var khoiMay =');
kiem('N10: bốn khối cần máy chủ nằm SAU mục 5, trong một <details>', viTri5 > 0 && viTriMay > viTri5 && /<details class="giay xp-may"/.test(goc));
kiem('N8: trang chủ đặt Phim đào tạo (chạy ngay) trước, "Làm phim nhanh" ở nhóm cần máy chủ',
  xa.indexOf("the('phim916'") > 0 && xa.indexOf("the('phim916'") < xa.indexOf("the('nhanh'") && /nha: \['phim916'/.test(xa));
kiem('N7: trạm GPU chỉ nhận *.typhuquanggita.workers.dev', /typhuquanggita\\\.workers\\\.dev\$/.test(pn));
kiem('N9: Bàn dựng hỏi kéo dài khung cuối khi giọng dài hơn phim', /S\.giong\.duration \+ 0\.5 - tongGiay\(\)/.test(bd));
kiem('N12: chép danh sách có nhánh lỗi', /writeText\(t\)\.then\(function\(\)\{[^}]*\}, function\(\)/.test(dap));
kiem('N12: nút "Sản xuất phim AI" vào Phân cảnh, không về Trang chủ', /'san-xuat-ai': 'phancanh'/.test(xa));

/* ── phá thử ── */
function pha(ten, cu, moi, kiemDo) {
  if (!goc.includes(cu)) { kiem('phá thử ' + ten + ': tìm thấy chỗ phá', false, cu.slice(0, 60)); return; }
  let rp; try { rp = chay(goc.replace(cu, moi)); } catch (e) { rp = { loi: e.message }; }
  kiem('phá thử ' + ten + ': phép đo đỏ đúng chỗ', kiemDo(rp));
}
pha('dò tên bằng chuỗi con', "return G.xpDA.nhanVat.filter(function (n) { return n.ten && coTen(chu, n.ten); });",
  "return G.xpDA.nhanVat.filter(function (n) { return n.ten && chu.indexOf(n.ten.toLowerCase()) >= 0; });", rp => rp.nvTen && rp.nvTen.includes('An'));
pha('bỏ tự thêm người nói', "if (!co) da.nhanVat.push(", "if (false) da.nhanVat.push(", rp => rp.soNhanVat && !rp.soNhanVat.includes('Bé Na'));
pha('bỏ thời lượng theo giọng cảnh', "if (gc && gc.buffer) can = Math.max(can, gc.buffer.duration + 0.5);", "", rp => rp.tong === 5);

console.log('\n' + dat + ' đạt · ' + truot + ' sai');
process.exit(truot ? 1 : 0);
