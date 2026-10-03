#!/usr/bin/env node
/*
GITA 365 — ĐO 16 HỆ (cổng CI)

Đo HAI ĐẦU độc lập (luật 9.99.84): bảng 16 hệ ở src/he-16.js khai con
trỏ; công cụ này kiểm từng con trỏ trên MÃ THẬT, không tin lời khai.
  v:view  → có  G.VIEWS['view'] =  trong src/
  g:NAME  → có  G.NAME =           trong src/
  f:cua   → có tên cửa trong may-chu/worker.js
  d:/t:   → tệp tồn tại
  m:tệp#chuỗi → tệp tồn tại VÀ chứa đúng chuỗi ấy (lá chắn 30 tầng)
Thêm: SOP chỉ dùng cửa đúng miền · mọi miền có trần tự chủ · 1000 mã
chiến lược đôi một khác nhau · repo trỏ về hệ có thật.

Dùng: node tools/do-16-he.js
*/
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const doc = rel => fs.readFileSync(path.join(ROOT, rel), 'utf8');

const srcGop = fs.readdirSync(path.join(ROOT, 'src')).filter(f => f.endsWith('.js'))
  .map(f => doc('src/' + f)).join('\n');
const worker = doc('may-chu/worker.js');

const G = { VIEWS: {}, U: { h: s => String(s), ic: () => '' } };
const ctx = { window: { G }, G, console, localStorage: { getItem: () => null, setItem() {} } };
vm.createContext(ctx);
for (const f of ['src/dieu-phoi.js', 'src/he-16.js', 'src/bo-nao-da-tri.js', 'src/la-chan-30.js']) vm.runInContext(doc(f), ctx, { filename: f });

const loi = [];
let ok = 0;
const dat = (dk, msg) => { if (dk) ok++; else loi.push(msg); };
const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function kiemTro(tro, noi) {
  const k = tro.slice(0, 2), ten = tro.slice(2);
  if (k === 'v:') return dat(new RegExp("G\\.VIEWS\\[\\s*'" + esc(ten) + "'\\s*\\]\\s*=").test(srcGop), `${noi}: màn ${ten} không có`);
  if (k === 'g:') return dat(new RegExp('G\\.' + esc(ten) + '\\s*=').test(srcGop), `${noi}: G.${ten} không có`);
  if (k === 'f:') return dat(new RegExp('\\b' + esc(ten) + '\\b').test(worker), `${noi}: cửa ${ten} không có trong worker.js`);
  if (k === 'd:' || k === 't:') return dat(fs.existsSync(path.join(ROOT, ten)), `${noi}: tệp ${ten} không có`);
  if (k === 'm:') {
    const i = ten.indexOf('#'), tep = ten.slice(0, i), chuoi = ten.slice(i + 1);
    const p = path.join(ROOT, tep);
    return dat(i > 0 && !!chuoi && fs.existsSync(p) && fs.readFileSync(p, 'utf8').includes(chuoi), `${noi}: ${tep} không chứa "${chuoi}"`);
  }
  loi.push(`${noi}: con trỏ lạ ${tro}`);
}

const HE = G.H16_HE;
dat(HE.length === 16, `Cần 16 hệ, có ${HE.length}`);
const maHe = new Set(HE.map(h => h.ma));
dat(maHe.size === HE.length, 'Mã hệ trùng');
HE.forEach(h => h.troVao.forEach(t => kiemTro(t, h.ma)));
G.H16_GP.nhom.forEach(n => n.troVao.forEach(t => kiemTro(t, n.ma)));

const mien = new Map(G.DP_MIEN.map(m => [m.ma, m]));
const cuaCua = {};
G.DP_TRO_LY.forEach(t => { (cuaCua[t.mien] = cuaCua[t.mien] || new Set()).add(t.phucVu); });
const coSop = new Set();
G.H16_SOP.forEach(s => {
  dat(mien.has(s.mien), `SOP ${s.mien}: miền không có trong DP_MIEN`);
  dat(!coSop.has(s.mien), `SOP ${s.mien}: trùng`);
  coSop.add(s.mien);
  s.buoc.forEach(b => dat(cuaCua[s.mien] && cuaCua[s.mien].has(b), `SOP ${s.mien}: cửa ${b} không thuộc miền`));
  dat(mien.has(s.trao) && s.trao !== s.mien, `SOP ${s.mien}: bàn giao ${s.trao} sai`);
  dat(!!s.kpi, `SOP ${s.mien}: thiếu KPI`);
});
mien.forEach((m, k) => {
  dat(coSop.has(k), `Miền ${k} chưa có SOP`);
  dat(!!G.H16_TU_CHU.tran[m.profile], `Miền ${k}: hồ sơ ${m.profile} chưa có trần tự chủ`);
});

const maCl = new Set();
for (let n = 0; n < 1000; n++) maCl.add(G.h16ChienLuoc(n).ma);
dat(maCl.size === 1000, `Cần 1000 mã chiến lược khác nhau, có ${maCl.size}`);
G.H16_REPO.forEach(r => dat(maHe.has(r.he) && !!G.H16_CACH[r.cach], `Repo ${r.repo}: hệ/cách sai`));
G.H16_MA.filter(x => x.lay).forEach(x => {
  const re = new RegExp(x.mau);
  const sai = x.lay().filter(v => !re.test(v));
  dat(sai.length === 0, `Mã ${x.ma}: ${sai.slice(0, 3).join(', ')} sai mẫu ${x.mau}`);
});

const mt = G.h16MaTranAgent(null);
const du8 = mt.filter(r => G.H16_NANG_LUC.every(n => n.ma === 'NV' || r[n.ma])).length;
dat(du8 === mt.length, `Chỉ ${du8}/${mt.length} miền đủ 7 năng lực bắt buộc (NV tuỳ hồ sơ)`);
const tc = G.h16TuChu();

/* Bộ não đa trí · kho trí tuệ · tảng băng: con trỏ sống, mã không trùng,
   mỗi nguyên lý có nguồn VÀ giới hạn, hành trình trỏ nguyên lý có thật. */
const maTT = new Set(G.TT_KHO.map(x => x.ma));
dat(maTT.size === G.TT_KHO.length, 'Mã nguyên lý TT_KHO trùng');
const coMien = new Set(G.TT_MIEN.map(m => m.ma));
G.TT_KHO.forEach(x => {
  dat(coMien.has(x.mien), `${x.ma}: miền ${x.mien} không có`);
  dat(/ — /.test(x.nguonGoc) && !!x.ranhGioi && !!x.nguyenLy, `${x.ma}: thiếu nguồn "Tác giả — Sách" hoặc giới hạn`);
});
G.TT_MIEN.forEach(m => kiemTro(m.ap, 'TT ' + m.ma));
G.TB_TANG.noi.forEach(x => kiemTro(x.tro, 'Tảng nổi ' + x.ten));
G.TB_TANG.chim.forEach(x => x.tro.forEach(t => kiemTro(t, 'Tảng chìm ' + x.ten)));
G.TB_HANH_TRINH.forEach(s => {
  dat(!!s.cam, `${s.ma}: thiếu điều CẤM`);
  s.nl.forEach(m => dat(maTT.has(m), `${s.ma}: nguyên lý ${m} không có`));
});
dat(G.ttTim('thói quen', 3).length > 0 && G.ttTim('thoi quen', 3)[0].ma === G.ttTim('thói quen', 3)[0].ma, 'Tìm kiếm bỏ dấu không khớp');
/* Lá chắn 30 tầng: đúng 15 BM + 15 PV, mã không trùng, mỗi tầng có điều
   nó chặn + giới hạn thật + ít nhất một con trỏ — và MỌI con trỏ sống. */
const LC = G.LC_TANG;
dat(LC.length === 30, `Lá chắn cần 30 tầng, có ${LC.length}`);
dat(new Set(LC.map(t => t.ma)).size === LC.length, 'Mã tầng lá chắn trùng');
dat(LC.filter(t => t.nhom === 'BM').length === 15 && LC.filter(t => t.nhom === 'PV').length === 15, 'Lá chắn cần 15 BM + 15 PV');
LC.forEach(t => {
  dat(new RegExp('^' + t.nhom + '\\d{2}$').test(t.ma), `${t.ma}: mã không khớp nhóm ${t.nhom}`);
  dat(!!t.lo && !!t.gioiHan && t.tro.length > 0, `${t.ma}: thiếu "chặn gì", giới hạn hoặc con trỏ`);
  t.tro.forEach(x => kiemTro(x, t.ma));
});
dat(G.LC_KHOANG_TRONG.length > 0 && G.LC_KHOANG_TRONG.every(k => k.ten && k.vi && k.viec), 'Lá chắn: chỗ trống phải ghi đủ tên · vì sao · việc cần làm');
/* 12 tầng hậu cần: mỗi tầng hoặc trỏ vào mã thật sống, hoặc ghi thật là
   không đo được từ repo — không có tầng nào "khai suông". */
const BK = G.LC_HERCULES;
dat(BK.length === 12, `Hậu cần cần 12 tầng, có ${BK.length}`);
dat(new Set(BK.map(b => b.ma)).size === 12, 'Mã tầng hậu cần trùng');
BK.forEach(b => {
  if (b.khongDoDuoc) dat(b.khongDoDuoc.length > 20, `${b.ma}: tầng không đo được phải ghi rõ vì sao`);
  else { dat(b.tro.length > 0, `${b.ma}: thiếu con trỏ`); b.tro.forEach(x => kiemTro(x, b.ma)); }
});
dat(BK.some(b => b.khongDoDuoc), 'Hậu cần: phải ghi thật ít nhất một tầng repo không đo được');

console.log(`  ✓ ${ok} phép đo đạt · ${HE.length} hệ · ${G.H16_SOP.length} SOP · ${G.DP_TRO_LY.length} trợ lý · ${G.TT_KHO.length} nguyên lý · ${LC.length} tầng lá chắn`);
console.log(`  · Tự chủ: AI làm ${tc.aiLamPhan}% cửa · AI tự chạy trọn (TC4) ${tc.tuChayTron}% · ` +
  Object.keys(tc.dem).sort().map(k => `${k}=${tc.dem[k]}`).join(' '));
if (loi.length) {
  loi.forEach(m => console.log('  ✗ ' + m));
  console.log(`\n✗ ĐO 16 HỆ: ${loi.length} lỗi.`);
  process.exit(1);
}
console.log('\n✓ ĐO 16 HỆ ĐẠT.');
