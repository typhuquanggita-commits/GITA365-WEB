/* Thu CHỮ TIẾNG VIỆT CÒN SÓT trên màn hình thật ở chế độ tiếng Anh.

   tools/trich-chu-viet.js đếm chuỗi trong MÃ — nhanh, nhưng một câu ghép
   từ nhiều mảnh ('Đã làm ' + n + '/3 tối') thì trong mã là ba mảnh, trên
   màn là một nút chữ. Bộ dịch tra theo nút chữ trên màn, nên danh sách
   cần dịch phải lấy từ MÀN: công cụ này đăng nhập từng vai, bật tiếng
   Anh, đi qua mọi màn vai ấy mở được, và ghi lại mọi nút chữ còn dấu
   tiếng Việt — đúng dạng khoá mà G.khoaDich() tra.

   Dùng:  GITA_URL=http://127.0.0.1:8098/index.html \
          node tools/thu-chu-man.mjs <ra.json> [vai1,vai2…]
   Mặc định đi ba vai khách (phụ huynh · học viên · đại sứ). */
import fs from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
let pw;
try { pw = require('playwright'); } catch (e) { pw = require('/opt/node22/lib/node_modules/playwright'); }
const URL = process.env.GITA_URL || 'http://127.0.0.1:8099/index.html';
const RA = process.argv[2] || 'chu-man.json';
const VAI = (process.argv[3] || 'phuhuynh@gita365.vn,hocvien@gita365.vn,daisu@gita365.vn').split(',');
const exe = fs.existsSync('/opt/pw-browsers/chromium') ? { executablePath: '/opt/pw-browsers/chromium' } : {};

const b = await pw.chromium.launch(exe);
const gom = {};   // khoá → { lan, man:Set }
for (const u of VAI) {
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  await p.goto(URL); await p.waitForTimeout(1200);
  await p.evaluate(u => { G.setLang && G.setLang('en'); G.doLogin(u); }, u);
  await p.waitForTimeout(2500);
  const ds = await p.evaluate(() => {
    const out = []; (G.NAV || []).forEach(g => (g.items || []).forEach(i => { if (!G.allowed || G.allowed(i.v)) out.push(i.v); }));
    return out;
  });
  for (const v of ds) {
    await p.evaluate(v => { G.S.view = v; G.render(); }, v);
    await p.waitForTimeout(250);
    const chu = await p.evaluate(() => {
      const re = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ]/;
      const k = s => String(s).replace(/\s+/g, ' ').trim().replace(/\d+(?:[.,]\d+)*/g, '{n}');
      const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT), out = [];
      let n; while ((n = w.nextNode())) {
        const el = n.parentNode; if (!el || /SCRIPT|STYLE/.test(el.tagName) || (el.closest && el.closest('[data-khong-dich]'))) continue;
        if (re.test(n.nodeValue) && el.offsetParent !== null) out.push(k(n.nodeValue));
      }
      document.querySelectorAll('[placeholder],[aria-label],[title]').forEach(e => ['placeholder', 'aria-label', 'title'].forEach(a => {
        const v = e.getAttribute(a); if (v && re.test(v)) out.push(k(v)); }));
      return out;
    });
    chu.forEach(c => { (gom[c] = gom[c] || { lan: 0, man: new Set() }); gom[c].lan++; gom[c].man.add(v); });
  }
  await p.close();
}
await b.close();
const ra = Object.keys(gom).sort((a, c) => gom[c].man.size - gom[a].man.size || gom[c].lan - gom[a].lan)
  .map(k => ({ vi: k, soMan: gom[k].man.size, man: [...gom[k].man].slice(0, 5) }));
fs.writeFileSync(RA, JSON.stringify(ra, null, 1));
console.log(ra.length + ' chuỗi tiếng Việt còn sót trên màn (' + VAI.length + ' vai) → ' + RA);
