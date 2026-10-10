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

/* ══ Bốn việc chủ hệ chốt 10/10/2026 ══ */
console.log('— N4 · ngoại lệ có tên: lưu phim ra máy');
const ltp = fs.readFileSync(ROOT + '/src/luu-tep-phim.js', 'utf8');
function napLuu(ma, o) {
  const da = { the: 0, soGoi: [] };
  const G = { U: { toast: () => {} }, LA_MAY_KHACH: !!o.mayKhach, BI_KHOA_CHEP: () => !!o.khoaChep, can: p => p === 'qt_trang' && !!o.quyen,
    goiMayChu: (fn, y) => { da.soGoi.push(fn); return Promise.resolve(o.soOk ? { ok: true } : { ok: false, error: 'NOPERM_LUU' }); }, S: { view: 'xuong-phim' } };
  const document = { createElement: () => ({ click() { da.the++; }, remove() {} }), body: { appendChild() {} } };
  const URL = { createObjectURL: () => 'blob:x', revokeObjectURL() {} };
  const ctx = { window: { G }, G, document, URL, console, Promise, setTimeout, String, Math };
  ctx.window.window = ctx.window;
  vm.createContext(ctx); vm.runInContext(ma, ctx, { filename: 'luu-tep-phim.js' });
  return { G, da };
}
async function thuLuu(ma, o) { const { G, da } = napLuu(ma, o); const kq = await G.luuTepPhim({ size: 10 }, 'a.mp4', 'video/mp4', '.mp4', 'phim'); return { kq, the: da.the, soGoi: da.soGoi }; }
const l1 = await thuLuu(ltp, { quyen: true, soOk: true });
kiem('R01–R02, sổ máy chủ nhận → lưu được (ghi sổ TRƯỚC khi tạo tệp)', l1.kq === true && l1.the === 1 && l1.soGoi[0] === 'ghiLuuPhim');
const l2 = await thuLuu(ltp, { quyen: true, soOk: false });
kiem('sổ máy chủ từ chối → KHÔNG lưu', l2.kq === false && l2.the === 0);
const l3 = await thuLuu(ltp, { quyen: false, soOk: true });
kiem('không có quyền qt_trang → không lưu, không gọi máy chủ', l3.kq === false && l3.the === 0 && !l3.soGoi.length);
const l4 = await thuLuu(ltp, { quyen: true, soOk: true, mayKhach: true });
kiem('máy khách → không lưu dù là Super Admin', l4.kq === false && l4.the === 0);
const l5 = await thuLuu(ltp, { quyen: true, soOk: true, khoaChep: true });
kiem('tài khoản bị khoá chép → không lưu', l5.kq === false && l5.the === 0);

const { ghiLuuPhim } = await import(new URL('../may-chu/luu-phim.js', import.meta.url).href);
const soDb = []; const dbGia = { prepare: q => ({ bind: (...a) => ({ run: async () => { soDb.push({ q, a }); return {}; } }) }) };
const m1 = await ghiLuuPhim({ ten: 'phim.mp4', loai: 'phim', co: 99 }, {}, dbGia, { role: 'R01', uid: 'u1', u: 'sa' });
const m2 = await ghiLuuPhim({ ten: 'phim.mp4', loai: 'phim' }, {}, dbGia, { role: 'R05', uid: 'u2', u: 'coach' });
const m3 = await ghiLuuPhim({ ten: 'phim.mp4', loai: 'phim' }, {}, dbGia, { role: 'R13', uid: 'u3', u: 'ph' });
const m4 = await ghiLuuPhim({ ten: 'x', loai: 'csv' }, {}, dbGia, { role: 'R01', uid: 'u1', u: 'sa' });
kiem('máy chủ: R01 ghi sổ LUU_TEP_PHIM kèm tên và cỡ', m1.ok && soDb.length === 1 && /INSERT INTO audit/.test(soDb[0].q) && soDb[0].a.includes('LUU_TEP_PHIM') && soDb[0].a.includes('phim.mp4'));
kiem('máy chủ: R05 và khách R13 bị từ chối, không ghi gì', m2.error === 'NOPERM_LUU' && m3.error === 'NOPERM_LUU' && soDb.length === 1);
kiem('máy chủ: loại tệp ngoài danh sách (csv) bị từ chối', m4.error === 'LOAI_LA');
const wk = fs.readFileSync(ROOT + '/may-chu/worker.js', 'utf8');
kiem('máy chủ: cửa ghiLuuPhim nằm sau cổng phiên (CAN_PHIEN) và có đường gọi', /'ghiLuuPhim'/.test(wk.slice(wk.indexOf('CAN_PHIEN'))) && /fn === 'ghiLuuPhim'\) return await ghiLuuPhim\(y, env, db, hoSo\)/.test(wk));

const boChu = t => t.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"])\/\/[^\n]*/g, '$1');
const XUONG = ['xuong-phim.js', 'xuong-phim-tu-dong.js', 'xuong-ai.js', 'cat-nhip.js', 'studio.js', 'studio-ban-dung.js', 'san-xuat-ai.js', 'phim-nhanh.js', 'du-an-phim.js'];
const lo = XUONG.filter(f => /a\.download\s*=|createObjectURL\s*\(|showSaveFilePicker\s*\(|showDirectoryPicker\s*\(\s*\)/.test(boChu(fs.readFileSync(ROOT + '/src/' + f, 'utf8'))));
const xpG = boChu(goc);
kiem('thẻ tải / địa chỉ blob / hộp lưu CHỈ sinh ở luu-tep-phim.js — không tệp xưởng nào tự mở đường', !lo.length, lo.join(' '));
kiem('xuất phim, phụ đề, prompt đi qua G.luuTepPhim / G.moNoiLuuPhim', /G\.moNoiLuuPhim\(/.test(xpG) && /G\.luuTepPhim\([^\n]{0,200}'phuDe'\)/.test(xpG));
kiem('chọn thư mục bộ phim cũng ghi sổ', /showDirectoryPicker\([^)]*\)\s*\.then\(function \(th\) \{ return G\.ghiSoLuuPhim/.test(xpG));
kiem('tải phim từ kho máy chủ không còn lối window.open (đường vòng qua cổng)', !/window\.open\(url/.test(boChu(fs.readFileSync(ROOT + '/src/xuong-phim-tu-dong.js', 'utf8'))));

console.log('— N2 · N3 · Studio');
const st = fs.readFileSync(ROOT + '/src/studio.js', 'utf8'), stM = boChu(st);
kiem('N2: Studio nói đúng nguyên nhân khi máy chủ cấp phép không trả gói nghề', /Không nối được máy chủ cấp phép — Studio cần gói nghề/.test(st) && /data-v="noi-may-chu"/.test(st));
kiem('N3: Studio có bộ xuất thật (captureStream + MediaRecorder + xepTieng vào nút đích)', /G\.xuXuat = function/.test(stM) && /captureStream\(30\)/.test(stM) && /new MediaRecorder\(luong/.test(stM) && /xepTieng\(tron\)/.test(stM));
kiem('N3: lưu qua ngoại lệ N4', /G\.luuTepPhim\(new Blob\(manh/.test(stM));
kiem('N3: đèn đỏ VÀ đèn "chưa soát" đều đóng cổng xuất', /l\.tt === 'bad' \|\| l\.tt === 'cho'/.test(stM) && /G\.xuDenDo\(\);\s*if \(dd\.length\)/.test(stM));
kiem('N3: dừng giữa chừng / dừng khẩn = huỷ bản đang ghi', /G\.xuHuyXuat = true; G\.xuGhi\.stop\(\)/.test(stM) && /if \(huy\)/.test(stM));
kiem('N3: chữ "chưa nối renderer" đã gỡ khỏi màn', !/chưa được nối với renderer/.test(st));

console.log('— C20 · nhãn giọng máy đọc');
const td = fs.readFileSync(ROOT + '/src/xuong-phim-tu-dong.js', 'utf8');
kiem('giọng của đường tự động / 0 đồng mang cờ tongHop', /loai: 'giong', buffer: buf, tongHop: true/.test(td));
function veNhan(ma, coTongHop) {
  const G = nap(ma), chu = [];
  G.xpDA.khung = '720x1280'; G.xpDA.tap = 1; G.xpDA.logo = 'GITA';
  G.xpDA.canh = [{ id: 'k1', hanhDong: 'x', thoai: [{ ai: 'A', loi: 'Câu', am: 'g1' }], tinNhan: [], giay: 3 }];
  G.xpVat.g1 = { ma: 'g1', loai: 'giong', buffer: { duration: 2 }, tongHop: coTongHop };
  const x = new Proxy({ measureText: t => ({ width: t.length * 10 }), fillText: t => chu.push(t), strokeText() {} }, { get: (o, k) => k in o ? o[k] : () => {}, set: () => true });
  G.xpVeKhung(x, G.xpDA.canh[0], 1, 3, 1);
  return chu;
}
kiem('phim có giọng máy đọc → đè nhãn "Giọng đọc tổng hợp bằng máy"', veNhan(goc, true).includes('Giọng đọc tổng hợp bằng máy'));
kiem('phim giọng người thật → không có nhãn', !veNhan(goc, false).includes('Giọng đọc tổng hợp bằng máy'));
const od = fs.readFileSync(ROOT + '/src/xuong-phim-0d.js', 'utf8');
kiem('Piper chỉ dùng giọng kho có sẵn — không có đường nạp mẫu để nhái giọng', /NGOẠI LỆ C20 CÓ TÊN/.test(od) && !/speaker_?embedding|cloneVoice|nhaiGiong/i.test(boChu(od)));

console.log('— phá thử bốn việc');
for (const [ten, cu, moi, chiu] of [
  ['bỏ ghi sổ trước khi lưu', 'return G.ghiSoLuuPhim(ten, loai, co).then(function () { taiQuaThe(du, ten);', 'return Promise.resolve().then(function () { taiQuaThe(du, ten);', async m => (await thuLuu(m, { quyen: true, soOk: false })).the === 1],
  ['bỏ cổng quyền', "else if (!(G.can && G.can('qt_trang'))) ly", 'else if (false) ly', async m => (await thuLuu(m, { quyen: false, soOk: true })).kq === true],
]) {
  if (!ltp.includes(cu)) { kiem('phá thử ' + ten + ': tìm thấy chỗ phá', false); continue; }
  kiem('phá thử ' + ten + ': phép đo đỏ đúng chỗ', await chiu(ltp.replace(cu, moi)));
}
{
  const cu = 'if (G.xpCoGiongTongHop()) {';
  kiem('phá thử bỏ nhãn giọng máy: phép đo đỏ đúng chỗ', goc.includes(cu) && !veNhan(goc.replace(cu, 'if (false) {'), true).includes('Giọng đọc tổng hợp bằng máy'));
}

console.log('\n' + dat + ' đạt · ' + truot + ' sai');
process.exit(truot ? 1 : 0);
