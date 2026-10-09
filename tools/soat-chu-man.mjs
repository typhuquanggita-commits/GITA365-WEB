#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════
   GITA 365 — SOÁT CHỮ TỪNG MÀN, TỪNG VAI

       npx http-server -p 8099 -s .        (hoặc python3 -m http.server 8099)
       node tools/soat-chu-man.mjs          in mọi chỗ hỏng
       node tools/soat-chu-man.mjs --im     chỉ in tổng và chỗ hỏng
       GITA_URL=http://127.0.0.1:8123/index.html node tools/soat-chu-man.mjs

   ══ VÌ SAO CẦN BỘ NÀY ══
   Ba bộ có sẵn hỏi ba câu khác: ra-soat-day-du.js đọc MÃ NGUỒN (màn có
   file không, quyền có khai không); do-khung-man.js đo KHUNG (tràn ngang,
   nút nhỏ, chữ nhỏ); thu-lien-ket.mjs đọc liên kết TĨNH. Không bộ nào đọc
   CHỮ mà người dùng thật nhìn thấy sau khi màn đã dựng xong. Mà chữ hỏng
   chỉ lộ ra ở đó: "undefined" sinh ra khi một trường vắng mặt, "&amp;"
   khi thoát hai lần, một nút trỏ tới màn đã bị gỡ, một bảng có đầu cột mà
   không có dòng nào.

   ══ ĐO GÌ, TRÊN MỌI MÀN MÀ VAI ẤY MỞ ĐƯỢC ══
     CHU_HONG   "undefined" · "NaN" · "[object Object]" · "null" đứng trần
     KY_HIEU    ký hiệu HTML lộ ra thành chữ (&amp; &quot; &lt; &#39;…) — thoát hai lần
     KHUON      dấu khuôn còn sót: ${ · {{ · }}
     NHAP       chữ nháp: lorem · TODO · FIXME · TBD
     VO_MA      chữ vỡ mã (UTF-8 đọc nhầm): Ã¡ · á»‡ · Æ°…
     LIEN_KET   nút data-v trỏ tới màn không có thật
     ANH_HONG   ảnh không tải được
     BANG_RONG  bảng có đầu cột mà không dòng nào, cũng không câu nào nói vì sao
     LOI_TRANG  lỗi JavaScript khi dựng màn
     KHONG_MO   bấm vào mà màn không đổi (bị chặn, hoặc router từ chối)

   ══ LUẬT CỦA CHÍNH BỘ NÀY ══
   · Không khai tay danh sách màn: đọc G.NAV lúc chạy, lọc bằng chính
     G.allowed mà cột trái dùng. Thêm màn mới là màn ấy tự vào phép đo.
   · Không dùng khoá kho. Màn đọc kho đã mã hoá mà kho chưa mở thì chữ
     trên màn là câu "chưa mở" — bộ này đo câu ấy, và báo riêng số màn
     đang chờ kho, không gộp vào "sạch". Muốn đo cả nội dung kho thì chạy
     trên máy có giấy phép.
   · Bỏ qua chữ trong <code>, <pre>, <textarea>, <input> — đó là chỗ người
     ta CỐ Ý viết ký hiệu.
   ═══════════════════════════════════════════════════════════════ */
import { createRequire } from 'node:module';
import fs from 'node:fs';
const require = createRequire(import.meta.url);
const PW = process.env.PW_PATH || '/opt/node22/lib/node_modules/playwright';
const URL = process.env.GITA_URL || 'http://127.0.0.1:8099/index.html';
const IM = process.argv.includes('--im');
const RA = (process.argv.find(a => a.startsWith('--ra=')) || '').slice(5);
let chromium;
try { ({ chromium } = require(PW)); } catch (e) { ({ chromium } = require('playwright-core')); }

/* Mười lăm vai — tài khoản thử có sẵn trong src/data.accounts.js (bản
   ngoại tuyến). Mỗi vai một lượt vì mỗi vai thấy một bộ màn khác nhau. */
const VAI = [
  ['superadmin@gita365.vn', 'Gita#Super01'], ['admin@gita365.vn', 'Gita#Admin02'], ['giamdoc@gita365.vn', 'Gita#Giamdoc03'],
  ['chuyenmon@gita365.vn', 'Gita#Chuyenmon04'], ['truongcoach@gita365.vn', 'Gita#Truongcoach05'], ['seniorcoach@gita365.vn', 'Gita#Senior06'],
  ['coach@gita365.vn', 'Gita#Coach07'], ['giaovien@gita365.vn', 'Gita#Giaovien08'], ['mentor@gita365.vn', 'Gita#Mentor09'],
  ['danhgia@gita365.vn', 'Gita#Assessor10'], ['tuvan@gita365.vn', 'Gita#Tuvan11'], ['phantich@gita365.vn', 'Gita#Phantich12'],
  ['phuhuynh@gita365.vn', 'Gita#Phuhuynh13'], ['hocvien@gita365.vn', 'Gita#Hocvien14'], ['daisu@gita365.vn', 'Gita#Daisu15']
];
const CHI = (process.argv.find(a => a.startsWith('--vai=')) || '').slice(6);

const LOAI = ['CHU_HONG', 'KY_HIEU', 'KHUON', 'NHAP', 'VO_MA', 'LIEN_KET', 'ANH_HONG', 'BANG_RONG', 'LOI_TRANG', 'KHONG_MO'];

const b = await chromium.launch(fs.existsSync('/opt/pw-browsers/chromium') ? { executablePath: '/opt/pw-browsers/chromium' } : {});
const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
let loiTrang = [];
p.on('pageerror', e => loiTrang.push(String(e && e.message || e).slice(0, 200)));
await p.goto(URL, { waitUntil: 'load' });
await p.evaluate(() => { try { localStorage.clear(); } catch (e) {} });
await p.reload({ waitUntil: 'load' });
await p.waitForTimeout(1500);

const tong = {}; LOAI.forEach(k => { tong[k] = []; });
let soMan = 0, soVai = 0, choKho = 0, choGoi = 0;
const gop = {};             /* màn đã gộp → màn chính router đưa tới */
const daThay = new Set();
const soDo = {};            /* màn → { ra:Set(màn đích), soNut, soChu, vai:Set } */   /* một chỗ hỏng trên một màn chỉ báo một lần, dù nhiều vai cùng thấy */

for (const [em, mk] of VAI) {
  if (CHI && em.indexOf(CHI) !== 0) continue;
  await p.evaluate(([a, b]) => { try { localStorage.clear(); } catch (e) {} if (window.G.doLogout) try { window.G.doLogout(); } catch (e) {} window.G.doLogin(a, b); }, [em, mk]);
  await p.waitForTimeout(1800);
  const vai = await p.evaluate(() => (window.G.S && window.G.S.acc && window.G.S.acc.role) || '');
  if (!vai) { tong.KHONG_MO.push(em + ' — không đăng nhập được'); continue; }
  soVai++;
  const man = await p.evaluate(() => {
    const r = [];
    (window.G.NAV || []).forEach(g => (g.items || []).forEach(i => { if (window.G.allowed(i.v) && r.indexOf(i.v) < 0) r.push(i.v); }));
    return r;
  });
  for (const v of man) {
    loiTrang = [];
    const d = await p.evaluate(async (v) => {
      const G = window.G;
      G.THROTTLE = 0;                      /* bộ chống quét của guard.js — tắt cho lượt đo, không đụng mã app */
      /* Màn của gói NGHỀ chỉ có mặt khi giấy phép nạp gói ấy. Không có khoá
         thì màn chưa tồn tại — đó là "chờ gói", không phải màn hỏng. */
      if (!G.VIEWS[v] && (G.MAN_NGHE || []).indexOf(v) >= 0) return { choGoi: true };
      try { G.go(v); } catch (e) { return { khongMo: 'G.go ném lỗi: ' + String(e && e.message || e).slice(0, 120) }; }
      await new Promise(r => setTimeout(r, 120));
      /* Màn đã GỘP vào một màn chính (V50 · mọi màn khớp màn lớn) thì router
         đưa sang màn chính — đó là thiết kế, không phải hỏng. Chỉ tính hỏng
         khi không tới được màn nào. */
      if (!G.S || !G.S.view) return { khongMo: 'router không mở màn nào' };
      if (G.S.view !== v) return { gop: G.S.view };
      const goc = document.getElementById('main');
      if (!goc) return { khongMo: 'không có #main' };
      /* Chữ người đọc thấy — bỏ code/pre/textarea/input, và bỏ phần ẩn. */
      const sao = goc.cloneNode(true);
      sao.querySelectorAll('code,pre,textarea,input,select,script,style,[hidden],template').forEach(x => x.remove());
      const chu = (sao.innerText || sao.textContent || '').replace(/\s+/g, ' ').trim();
      const tim = (re) => { const m = chu.match(re); if (!m) return ''; const i = m.index; return chu.slice(Math.max(0, i - 40), i + m[0].length + 40); };
      const r = {
        CHU_HONG: '',
        KY_HIEU: tim(/&(amp|lt|gt|quot|#39|#x27|nbsp|#\d{2,4});/),
        KHUON: tim(/\$\{|\{\{|\}\}/),
        NHAP: tim(/\b(lorem|ipsum|TODO|FIXME|TBD)\b/i),
        VO_MA: tim(/\u00E1[\u00BA\u00BB][\u0080-\u00BF\u2013-\u2122]|\u00C3[\u00A0-\u00BF]|\u00C6\u00B0|\u00C4\u2018/)
      };
      /* Chữ hỏng chỉ tính ở VỊ TRÍ DỮ LIỆU: cả nút chữ đúng bằng "undefined",
         hoặc đứng sau dấu hai chấm, hoặc dính đơn vị (NaN%, undefinedđ…).
         Một câu văn GIẢI THÍCH lỗi ("trả undefined và cổng câm") không phải
         chữ hỏng — bắt nó là dạy người ta xoá lời giải thích đi. */
      const di = document.createTreeWalker(sao, NodeFilter.SHOW_TEXT);
      const RAC = /^(undefined|NaN|null|\[object Object\])$/;
      const RAC_DINH = /(:\s*(undefined|NaN|null)\s*$)|((undefined|NaN)\s*(%|đ\b|USD|giờ|ngày|phút|tháng))|\[object Object\]/;
      for (let n = di.nextNode(); n; n = di.nextNode()) {
        const t = String(n.nodeValue || '').trim();
        if (!t) continue;
        if (RAC.test(t) || RAC_DINH.test(t)) { r.CHU_HONG = t.slice(0, 120); break; }
      }
      const chet = [];
      goc.querySelectorAll('[data-v]').forEach(el => {
        const t = el.getAttribute('data-v');
        if (t && !(G.manCoThat ? G.manCoThat(t) : G.VIEWS[t])) chet.push(t);
      });
      r.LIEN_KET = chet.length ? Array.from(new Set(chet)).slice(0, 5).join(', ') : '';
      /* Sơ đồ liên kết: màn này dẫn tới những màn nào (chỉ đích CÓ THẬT),
         và có bao nhiêu chỗ bấm làm được việc. Dùng để tìm màn NGÕ CỤT
         (đọc xong không đi đâu tiếp) và màn MỒ CÔI (không màn nào dẫn tới). */
      const ra = new Set();
      goc.querySelectorAll('[data-v]').forEach(el => { const t = el.getAttribute('data-v'); if (t && t !== v && (G.manCoThat ? G.manCoThat(t) : G.VIEWS[t])) ra.add(t); });
      r.ra = Array.from(ra);
      r.soNut = goc.querySelectorAll('button,a[href],[role=button],input[type=submit],select').length;
      const anh = [];
      goc.querySelectorAll('img').forEach(im => { if (im.complete && im.naturalWidth === 0 && im.getAttribute('src')) anh.push(im.getAttribute('src').slice(0, 60)); });
      r.ANH_HONG = anh.slice(0, 3).join(', ');
      const bang = [];
      goc.querySelectorAll('table').forEach(t => {
        const coDau = t.querySelector('thead th, thead td');
        const dong = t.querySelectorAll('tbody tr').length;
        if (coDau && dong === 0) {
          /* Có một câu nói vì sao rỗng ngay trong hoặc sát bảng thì không tính. */
          const ke = (t.parentElement && t.parentElement.innerText || '').replace((t.innerText || ''), '').trim();
          if (ke.length < 20) bang.push((t.querySelector('thead') || t).innerText.replace(/\s+/g, ' ').slice(0, 60));
        }
      });
      r.BANG_RONG = bang.slice(0, 2).join(' | ');
      r.choKho = /kho (chưa mở|chưa nạp|đang khoá)|chưa mở khoá kho|cần giấy phép/i.test(chu);
      r.soChu = chu.length;
      return r;
    }, v);
    soMan++;
    if (d.choGoi) { choGoi++; continue; }
    if (d.gop) { gop[v] = d.gop; continue; }
    if (d.khongMo) { tong.KHONG_MO.push(vai + ' · ' + v + ' — ' + d.khongMo); continue; }
    if (d.choKho) choKho++;
    if (!soDo[v]) soDo[v] = { ra: new Set(), soNut: 0, soChu: 0, vai: new Set() };
    d.ra.forEach(t => soDo[v].ra.add(t)); soDo[v].soNut = Math.max(soDo[v].soNut, d.soNut); soDo[v].soChu = Math.max(soDo[v].soChu, d.soChu); soDo[v].vai.add(vai);
    for (const k of ['CHU_HONG', 'KY_HIEU', 'KHUON', 'NHAP', 'VO_MA', 'LIEN_KET', 'ANH_HONG', 'BANG_RONG']) {
      if (!d[k]) continue;
      const khoa = k + '|' + v + '|' + d[k];
      if (daThay.has(khoa)) continue;
      daThay.add(khoa);
      tong[k].push(v + ' (' + vai + ') — ' + d[k]);
    }
    if (loiTrang.length) {
      const khoa = 'LOI|' + v + '|' + loiTrang[0];
      if (!daThay.has(khoa)) { daThay.add(khoa); tong.LOI_TRANG.push(v + ' (' + vai + ') — ' + loiTrang[0]); }
    }
  }
}
await b.close();

const soLoi = LOAI.reduce((s, k) => s + tong[k].length, 0);
/* Ngõ cụt: không dẫn tới màn nào VÀ không có chỗ bấm nào làm được việc.
   Mồ côi: không màn nào khác dẫn tới (chỉ tới được qua cột trái). Hai số
   này là THÔNG TIN để người viết màn nối thêm — không tính là chỗ hỏng,
   vì có màn cố ý là điểm cuối (một bài đọc, một biểu mẫu đã gửi). */
const vao = {};
Object.keys(soDo).forEach(v => soDo[v].ra.forEach(t => { vao[t] = (vao[t] || 0) + 1; }));
const ngoCut = Object.keys(soDo).filter(v => soDo[v].ra.size === 0 && soDo[v].soNut === 0).sort();
const moCoi = Object.keys(soDo).filter(v => !vao[v]).sort();
console.log('\nSOÁT CHỮ TỪNG MÀN — ' + soVai + ' vai · ' + soMan + ' lượt mở màn · ' + choGoi + ' lượt màn gói nghề chờ giấy phép (không đo được ở đây) · ' + choKho + ' lượt màn đang chờ kho mã hoá\n');
for (const k of LOAI) {
  const ds = tong[k];
  console.log((ds.length ? '  ✗ ' : '  ✓ ') + k + ' · ' + ds.length);
  if (ds.length && !(IM && ds.length > 40)) ds.slice(0, IM ? 40 : 400).forEach(x => console.log('      ' + x));
}
console.log('\n  · ' + Object.keys(gop).length + ' mục cột trái đã gộp vào màn chính (router đưa sang — thiết kế V50, không phải hỏng)');
console.log('  · Sơ đồ liên kết: ' + Object.keys(soDo).length + ' màn đo được · ' + ngoCut.length + ' màn ngõ cụt (không dẫn đi đâu, không chỗ bấm) · ' + moCoi.length + ' màn chỉ tới được qua cột trái');
if (!IM && ngoCut.length) console.log('      ngõ cụt: ' + ngoCut.join(', '));
const dsSoDo = {}; Object.keys(soDo).forEach(v => { dsSoDo[v] = { ra: Array.from(soDo[v].ra), vao: vao[v] || 0, soNut: soDo[v].soNut, soChu: soDo[v].soChu, vai: Array.from(soDo[v].vai) }; });
if (RA) fs.writeFileSync(RA, JSON.stringify({ soVai, soMan, choKho, choGoi, gop, tong, ngoCut, moCoi, soDo: dsSoDo }, null, 1));
console.log(soLoi ? '\n✗ ' + soLoi + ' chỗ hỏng' : '\n✓ Không chỗ hỏng nào trên chữ người dùng nhìn thấy');
process.exit(soLoi ? 1 : 0);
