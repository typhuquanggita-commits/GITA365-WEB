#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════
   GITA 365 — SOÁT THIẾT KẾ: MƯỜI BỐN LUẬT ĐO TRÊN TRÌNH DUYỆT THẬT

       npx http-server -p 8099 -s .   (cùng cổng với do-khung-man.js)
       xvfb-run -a node tools/soat-thiet-ke.js            (đủ dòng)
       xvfb-run -a node tools/soat-thiet-ke.js --im       (chỉ chỗ đỏ)
       xvfb-run -a node tools/soat-thiet-ke.js --ghi-nen  (ghi lại trần)

   ══ VÌ SAO CÓ BỘ NÀY ══

   do-khung-man.js hỏi màn có VỪA khổ không: tràn ngang, nút to đủ bấm,
   chữ dưới 10px. Nó không hỏi chữ có ĐỌC ĐƯỢC không: chữ nhạt dưới
   chuẩn tương phản, dòng sát làm dấu tiếng Việt đè nhau, dòng dài
   làm mắt lạc, tiêu đề nhảy bậc làm trình đọc màn hình mất một tầng.

   Ý tưởng luật lấy từ bộ dò của pbakaus/impeccable (Apache-2.0) — bộ
   ấy có 59 luật tất định. Mã ở đây viết lại từ đầu bằng JS thuần, chạy
   trên Playwright có sẵn, không tải chương trình nào của họ về máy.
   Sổ luật ở tools/luat-thiet-ke.json; xem lý do chọn và loại từng luật
   ở xuong-ai/NGUON-NGOAI.md.

   ══ HAI LOẠI LUẬT ══

   'chan' — phải bằng 0. Đỏ là không đẩy.
   'tran' — đã có chỗ phạm từ trước. Không được THÊM màn phạm mới so
   với tools/soat-thiet-ke.nen.json. Sửa bớt thì chạy --ghi-nen để hạ
   trần xuống; muốn NÂNG trần thì phải kèm --nhan-tang "lý do", và lý do
   ở lại trong tệp trần — không bắt viết thì trần nào cũng tự nâng.

   ══ LUẬT CỦA CHÍNH BỘ NÀY ══

   Trước khi đo màn thật, nó chạy TỰ THỬ: dựng một trang cố ý phạm đủ
   mười bốn luật, và đòi từng luật phải bắt được. Một luật không bắt
   được chỗ phạm cài sẵn là một luật câm — bộ dừng ngay, không đo tiếp,
   vì một báo cáo xanh từ luật câm tệ hơn không có báo cáo.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
const fs = require('fs');
const path = require('path');
const PW = process.env.PW_PATH || '/opt/node22/lib/node_modules/playwright';
const URL = process.env.GITA_URL || 'http://127.0.0.1:8099/index.html';
const { chromium } = require(PW);
const IM = process.argv.includes('--im');
const GHI = process.argv.includes('--ghi-nen');
const iTang = process.argv.indexOf('--nhan-tang');
const LY_DO_TANG = iTang > 0 ? (process.argv[iTang + 1] || '') : '';

const SO = JSON.parse(fs.readFileSync(path.join(__dirname, 'luat-thiet-ke.json'), 'utf8'));
const LUAT = SO.luat.filter(l => l.noi === 'trinhDuyet');
const TEP_NEN = path.join(__dirname, 'soat-thiet-ke.nen.json');

/* Hai khổ: điện thoại chạm và để bàn. Dòng dài chỉ hiện ở để bàn,
   chữ chạm mép chỉ hiện ở điện thoại — hai khổ phủ đủ hai đầu. */
const KHO = [
  { ten: 'điện thoại', w: 390, h: 844, cham: true },
  { ten: 'để bàn', w: 1440, h: 900, cham: false }
];
const VAI = ['superadmin@gita365.vn', 'phuhuynh@gita365.vn'];

/* ── BỘ DÒ — chạy TRONG trang. Một hàm cho cả tự thử lẫn màn thật,
   để tự thử đo đúng thứ đi đo màn thật, không phải một bản chép. ── */
function doTrang(opt) {
  const goc = document.querySelector(opt.goc);
  const out = {};
  const them = (ma, ct) => { (out[ma] = out[ma] || []).push(String(ct).slice(0, 70)); };
  if (!goc) return out;
  const W = document.documentElement.clientWidth;

  const rgba = (s) => {
    const m = /rgba?\(([^)]+)\)/.exec(s || '');
    if (!m) return null;
    const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number);
    return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
  };
  const lum = (c) => {
    const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
  };
  const tron = (tren, duoi) => ({
    r: tren.r * tren.a + duoi.r * (1 - tren.a), g: tren.g * tren.a + duoi.g * (1 - tren.a),
    b: tren.b * tren.a + duoi.b * (1 - tren.a), a: 1 });
  const hsl = (c) => {
    const r = c.r / 255, g = c.g / 255, b = c.b / 255;
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2;
    const s = mx === mn ? 0 : (l > 0.5 ? (mx - mn) / (2 - mx - mn) : (mx - mn) / (mx + mn));
    return { s, l };
  };
  /* Nền thật dưới một thẻ: đi ngược lên, chồng các lớp nền có độ đục.
     Gặp ảnh nền hay chuyển sắc thì KHÔNG đoán — trả null và bỏ qua thẻ
     ấy. Đoán nền sai là báo nhầm, và báo nhầm thì lần sau người ta tắt
     phép đo đi. */
  const nenDuoi = (el) => {
    const lop = [];
    for (let q = el; q; q = q.parentElement) {
      const cs = getComputedStyle(q);
      if (cs.backgroundImage && cs.backgroundImage !== 'none') return null;
      const c = rgba(cs.backgroundColor);
      if (c && c.a > 0) { lop.push(c); if (c.a >= 0.999) break; }
    }
    let nen = { r: 255, g: 255, b: 255, a: 1 };
    for (let i = lop.length - 1; i >= 0; i--) nen = tron(lop[i], nen);
    return nen;
  };
  const anDi = (el) => {
    for (let q = el; q && q !== document.body; q = q.parentElement) {
      const cs = getComputedStyle(q);
      if (cs.display === 'none' || cs.visibility === 'hidden') return true;
    }
    return false;
  };
  const chuRieng = (el) => {
    let t = '';
    for (let n = el.firstChild; n; n = n.nextSibling) if (n.nodeType === 3) t += n.nodeValue;
    return t.replace(/\s+/g, ' ').trim();
  };
  const ten = (el) => '<' + el.tagName.toLowerCase() +
    (typeof el.className === 'string' && el.className.trim() ? '.' + el.className.trim().split(/\s+/)[0] : '') + '>';
  const trongHopCuon = (el) => {
    for (let q = el.parentElement; q && q !== document.body; q = q.parentElement) {
      const ox = getComputedStyle(q).overflowX;
      if (ox === 'auto' || ox === 'scroll') return true;
    }
    return false;
  };
  const soDong = (el) => {
    const rg = document.createRange(); rg.selectNodeContents(el);
    const tops = new Set();
    for (const r of rg.getClientRects()) if (r.width > 1) tops.add(Math.round(r.top));
    return tops.size;
  };

  const ds = goc.querySelectorAll('*');
  let tongChu = 0, chuAn = 0;
  for (let i = 0; i < ds.length; i++) {
    const el = ds[i];
    if (/^(SCRIPT|STYLE|NOSCRIPT|TEMPLATE|SVG|PATH|OPTION)$/i.test(el.tagName)) continue;
    const t = chuRieng(el);
    const r = el.getBoundingClientRect();
    if (!t || r.width < 1 || r.height < 1 || anDi(el)) continue;
    const cs = getComputedStyle(el);

    /* TK10 — đo phần chữ còn độ đục 0 sau khi màn dựng xong */
    tongChu += t.length;
    let dd = 1;
    for (let q = el; q && q !== document.body; q = q.parentElement) dd *= parseFloat(getComputedStyle(q).opacity);
    if (dd < 0.05) { chuAn += t.length; continue; }
    if (el.closest('[aria-hidden="true"]')) continue;

    const fs = parseFloat(cs.fontSize) || 16;
    const wt = parseInt(cs.fontWeight, 10) || 400;

    /* TK01 · TK02 — tương phản; bỏ nút đang tắt (chuẩn WCAG miễn chúng) */
    if (!el.closest(':disabled,[aria-disabled="true"]') && cs.webkitTextFillColor !== 'rgba(0, 0, 0, 0)') {
      const fg = rgba(cs.color), nen = nenDuoi(el);
      if (fg && nen && fg.a > 0) {
        const m = tron(fg, nen);
        const a = lum(m), b = lum(nen);
        const tl = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
        const lon = fs >= 24 || (fs >= 18.66 && wt >= 700);
        const hx = (c) => '#' + [c.r, c.g, c.b].map(v => Math.round(v).toString(16).padStart(2, '0')).join('');
        if (tl < (lon ? 3 : 4.5)) them('TK01', tl.toFixed(2) + ':1 ' + ten(el) + ' ' + hx(fg) + '/' + hx(nen) + ' "' + t.slice(0, 20) + '"');
        const hc = hsl(m), hn = hsl(nen);
        if (hc.s < 0.12 && hc.l > 0.3 && hc.l < 0.75 && hn.s > 0.45 && hn.l > 0.25 && hn.l < 0.8)
          them('TK02', ten(el) + ' "' + t.slice(0, 24) + '"');
      }
    }

    const nhieuDong = t.length > 80 ? soDong(el) : 1;
    /* TK03 — dòng sát, chỉ đoạn nhiều dòng */
    /* Tiêu đề lớn (từ 24px) được phép sát hơn — luật này canh thân bài. */
    if (nhieuDong >= 2 && fs < 24) {
      const lh = cs.lineHeight === 'normal' ? fs * 1.2 : parseFloat(cs.lineHeight);
      if (lh / fs < 1.3) them('TK03', (lh / fs).toFixed(2) + '× ' + ten(el));
    }
    /* TK04 — ký tự mỗi dòng */
    if (t.length > 200 && nhieuDong >= 2 && t.length / nhieuDong > 95)
      them('TK04', Math.round(t.length / nhieuDong) + ' ký tự/dòng ' + ten(el));
    /* TK06 — in hoa cả đoạn */
    /* Hoa hay thường hỏi thẳng chữ ấy, không dò bằng khoảng mã: khoảng
       À-Ỹ chứa lẫn cả chữ thường có dấu (à, ơ, ạ…). */
    const chuCai = [...t].filter(ch => ch.toLowerCase() !== ch.toUpperCase());
    const soHoa = chuCai.filter(ch => ch === ch.toUpperCase()).length;
    if (chuCai.length > 50 && (cs.textTransform === 'uppercase' || soHoa / chuCai.length > 0.85))
      them('TK06', ten(el) + ' "' + t.slice(0, 24) + '"');
    /* TK07 · TK08 — khoảng ký tự */
    const ls = cs.letterSpacing === 'normal' ? 0 : parseFloat(cs.letterSpacing) / fs;
    if (ls > 0.05 && t.length > 40 && cs.textTransform !== 'uppercase')
      them('TK07', ls.toFixed(2) + 'em ' + ten(el));
    if (ls < -0.05) them('TK08', ls.toFixed(2) + 'em ' + ten(el));
    /* TK09 — căn đều trong cột hẹp */
    if (cs.textAlign === 'justify' && r.width < 560 && t.length > 120)
      them('TK09', Math.round(r.width) + 'px ' + ten(el));
    /* TK17 — đoạn văn chạm mép màn điện thoại */
    if (opt.cham && t.length > 60 && /^(P|LI|DD|BLOCKQUOTE)$/.test(el.tagName) && !trongHopCuon(el) &&
        (r.left < 12 || W - r.right < 12) && r.width > W * 0.6)
      them('TK17', 'cách mép ' + Math.round(Math.min(r.left, W - r.right)) + 'px ' + ten(el));
  }
  if (tongChu > 400 && chuAn / tongChu > 0.25)
    them('TK10', Math.round(100 * chuAn / tongChu) + '% chữ đang ở độ đục 0');

  /* TK05 — bậc tiêu đề */
  let truoc = 0;
  goc.querySelectorAll('h1,h2,h3,h4,h5,h6').forEach(hd => {
    if (anDi(hd)) return;
    /* aria-level thắng tên thẻ — trình đọc màn hình đọc theo nó. Nhờ vậy
       sửa được bậc mà không đổi cỡ chữ đang hiện. */
    const n = +hd.getAttribute('aria-level') || +hd.tagName[1];
    if (truoc && n > truoc + 1) them('TK05', 'h' + truoc + ' → h' + n + ' "' + (hd.textContent || '').trim().slice(0, 24) + '"');
    truoc = n;
  });

  /* TK11 — ảnh hỏng */
  goc.querySelectorAll('img').forEach(im => {
    if (anDi(im)) return;
    const src = im.getAttribute('src');
    if (!src || !src.trim() || (im.complete && im.naturalWidth === 0))
      them('TK11', (src || '(không có nguồn)').slice(0, 50));
  });

  /* TK14 — thẻ lồng thẻ: hộp có nền + bo góc + (viền đủ bốn cạnh hoặc bóng)
     nằm trong một hộp y như thế. Chỉ đếm hộp TRONG CÙNG để một chùm
     lồng ba tầng là một dòng, không phải ba. */
  const laThe = (el) => {
    const cs = getComputedStyle(el), r = el.getBoundingClientRect();
    if (r.width < 160 || r.height < 56) return false;
    const nen = rgba(cs.backgroundColor);
    if (!(nen && nen.a > 0.02) && cs.backgroundImage === 'none') return false;
    if ((parseFloat(cs.borderTopLeftRadius) || 0) < 6) return false;
    const vien = ['Top', 'Right', 'Bottom', 'Left'].every(s => parseFloat(cs['border' + s + 'Width']) >= 1);
    return vien || (cs.boxShadow && cs.boxShadow !== 'none');
  };
  const the = [...goc.querySelectorAll('div,section,article,aside,li')].filter(el => !anDi(el) && laThe(el));
  const theSet = new Set(the);
  the.forEach(el => {
    let cha = el.parentElement;
    while (cha && cha !== goc && !theSet.has(cha)) cha = cha.parentElement;
    if (cha && cha !== goc && !the.some(x => x !== el && el.contains(x)))
      them('TK14', ten(cha) + ' ⊃ ' + ten(el));
  });
  return out;
}

/* ── TỰ THỬ: một trang phạm đủ mười bốn luật ── */
const TRANG_THU = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>
body{margin:0;font:16px/1.5 sans-serif;background:#fff}
#t{padding:0}
.nhat{color:#bbb}
.xam{background:#1f7a3a;color:#8a8a8a;padding:20px}
.sat{line-height:1.05;width:300px}
.dai{width:1300px}
.hoa{text-transform:uppercase}
.gian{letter-spacing:.2em}
.nen{letter-spacing:-.1em}
.deu{text-align:justify;width:300px}
.an{opacity:0}
.the{background:#fff;border:1px solid #ddd;border-radius:12px;padding:12px;width:600px;min-height:80px}
p.mep{margin:0;padding:0}
</style></head><body><div id="t">
<p class="nhat">Chữ nhạt quá dưới chuẩn tương phản</p>
<div class="xam">Chữ xám trên nền xanh lá đậm</div>
<p class="sat">Một đoạn văn dài nhiều dòng với giãn dòng rất sát, dấu tiếng Việt chồng lên nhau, đọc rất mệt mỏi cho mắt người xem.</p>
<p class="dai">Đoạn văn này rất dài và trải hết bề ngang màn để bàn, nên mỗi dòng chứa quá nhiều ký tự khiến mắt người đọc bị lạc khi quay về đầu dòng sau; câu được viết thêm cho đủ dài để chắc chắn có hơn hai dòng hiển thị trên khung đo của bộ tự thử này, cộng thêm vài chữ nữa cho chắc ăn hơn và dài hơn nữa.</p>
<h2>Mục</h2><h4>Nhảy bậc</h4>
<p class="hoa">đoạn này bị in hoa hết toàn bộ từ đầu tới cuối nên rất khó đọc cho người xem</p>
<p class="gian">Câu này bị giãn chữ quá rộng ở phần thân bài viết</p>
<p class="nen">Câu này bị nén chữ</p>
<p class="deu">Đoạn này căn đều hai bên trong một cột rất hẹp nên khoảng trắng giữa các chữ giãn ra thành những vệt dọc rất xấu, nhìn như có sông trắng chảy giữa đoạn.</p>
<img src="khong-co-anh-nay.png" alt="hỏng">
<div class="the"><div class="the">Thẻ lồng trong thẻ</div></div>
<p class="mep">Đoạn văn này nằm sát mép màn điện thoại, không có lề nào bao quanh để chừa chỗ cho ngón tay.</p>
</div>
<div id="an"><p class="an">${'Chữ ẩn lúc đứng yên. '.repeat(30)}</p><p>Chút chữ hiện.</p></div>
<script>setTimeout(function(){ throw new Error('loi-tu-thu') }, 0)</script>
</body></html>`;

(async () => {
  const b = await chromium.launch();
  let loi = 0;
  const bao = (ok, tenBao, ct) => {
    if (!ok) loi++;
    if (!ok || !IM) console.log((ok ? '  ✓ ' : '  ✗ ') + tenBao + (ct ? ' — ' + ct : ''));
  };
  console.log('\nSOÁT THIẾT KẾ — ' + LUAT.length + ' luật trên trình duyệt thật\n');

  /* ══ 1 · TỰ THỬ ══ */
  {
    const p = await b.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
    const loiJs = [];
    p.on('pageerror', e => loiJs.push(e.message));
    await p.setContent(TRANG_THU, { waitUntil: 'load' });
    await p.waitForTimeout(200);
    const d1 = await p.evaluate(doTrang, { goc: '#t', cham: true });
    const d2 = await p.evaluate(doTrang, { goc: '#an', cham: true });
    await p.setViewportSize({ width: 1440, height: 900 });
    const d3 = await p.evaluate(doTrang, { goc: '#t', cham: false });
    const bat = Object.assign({}, d1, d2);
    if (d3.TK04) bat.TK04 = d3.TK04;
    if (loiJs.length) bat.TK12 = loiJs;
    const cam = LUAT.filter(l => !bat[l.ma]).map(l => l.ma + ' ' + l.ten);
    bao(!cam.length, 'TỰ THỬ: cả ' + LUAT.length + ' luật đều bắt được chỗ phạm cài sẵn',
      cam.length ? 'LUẬT CÂM: ' + cam.join(' · ') : '');
    await p.close();
    if (cam.length) { await b.close(); console.log('\n✗ Dừng: có luật câm, không đo màn thật.\n'); process.exit(1); }
  }

  /* ══ 2 · ĐO MÀN THẬT ══ */
  const gap = {};          /* ma → Set(màn) */
  const viDu = {};         /* ma → màn → một dòng ví dụ */
  const tatCa = {};        /* ma → mọi dòng, cho --chi-tiet */
  let soDo = 0;
  for (const k of KHO) {
    const p = await b.newPage({ viewport: { width: k.w, height: k.h },
      hasTouch: k.cham, isMobile: k.cham, deviceScaleFactor: 1 });
    let loiJs = [];
    p.on('pageerror', e => loiJs.push(e.message));
    await p.goto(URL, { waitUntil: 'networkidle' });
    await p.evaluate(() => localStorage.clear());
    await p.reload({ waitUntil: 'networkidle' });
    await p.waitForTimeout(400);
    const ghi = (ma, man, ct) => {
      (gap[ma] = gap[ma] || new Set()).add(man);
      ((viDu[ma] = viDu[ma] || {})[man]) || (viDu[ma][man] = k.ten + ' · ' + ct);
    };
    for (const em of VAI) {
      await p.evaluate(x => window.G.doLogin(x), em);
      await p.waitForTimeout(1500);
      const man = await p.evaluate(() => {
        const r = [];
        (window.G.NAV || []).forEach(g => (g.items || []).forEach(i => r.push(i.v)));
        return [...new Set(r)];
      });
      /* ĐẾM THEO MÀN THẬT, không theo mục cột trái. Nhiều mục được
         chuyển hướng về cùng một công cụ sống (G.V50.GOP), nên bản đầu
         đếm một chỗ chữ nhạt ở màn ban-do thành 278 "màn phạm". Một con
         số phồng gấp trăm lần thì người đọc bỏ cả báo cáo. */
      const daDo = new Set();
      for (const v of man) {
        loiJs = [];
        const that = await p.evaluate(async (x) => {
          window.G.go(x);
          await new Promise(r => setTimeout(r, 60));
          /* Chờ hiệu ứng vào màn chạy xong — đo giữa lúc chữ đang hiện
             dần thì mọi màn đều "ẩn lúc đứng yên". Trần 1,5 giây để một
             hiệu ứng lặp vô hạn không treo cả lượt đo. */
          /* Lặp vài vòng: màn gọi máy chủ xong thì dựng LẠI và hiệu ứng
             vào màn chạy lần nữa — đo ngay sau vòng đầu là đo đúng lúc chữ
             đang mờ (đã bắt nhầm năm màn tài chính như thế). */
          const huuHan = () => document.getAnimations().filter(a =>
            a.playState === 'running' && a.effect && a.effect.getTiming().iterations !== Infinity);
          for (let vong = 0; vong < 4; vong++) {
            const ds = huuHan();
            if (!ds.length && vong) break;
            await Promise.race([Promise.all(ds.map(a => a.finished.catch(() => 0))),
              new Promise(r => setTimeout(r, 1500))]);
            await new Promise(r => setTimeout(r, 220));
          }
          return (window.G.S && window.G.S.view) || x;
        }, v);
        if (daDo.has(that)) continue;
        daDo.add(that);
        const d = await p.evaluate(doTrang, { goc: '#main', cham: k.cham });
        soDo++;
        for (const ma of Object.keys(d)) {
          ghi(ma, that, d[ma][0]);
          d[ma].forEach(x => (tatCa[ma] = tatCa[ma] || []).push(that + ' · ' + x));
        }
        if (loiJs.length) ghi('TK12', that, loiJs[0]);
      }
    }
    await p.close();
    if (!IM) console.log('  đã đo xong khổ ' + k.ten + ' (' + k.w + 'px)');
  }
  await b.close();

  /* ══ 3 · SO VỚI TRẦN ══ */
  let nen = { luat: {} }, coNen = false;
  try { nen = JSON.parse(fs.readFileSync(TEP_NEN, 'utf8')); coNen = true; } catch (e) { /* chưa có trần */ }
  const nenMoi = { _vi: 'Trần của tools/soat-thiet-ke.js — mỗi luật "tran" là danh sách màn đang phạm. Không được thêm màn; sửa bớt thì chạy --ghi-nen để hạ.',
    luc: new Date().toISOString().slice(0, 10), luat: {}, nangTran: (nen.nangTran || []),
    tinh: (nen.tinh || {}) };   /* trần phần tĩnh do thu-thiet-ke-tinh.mjs đọc — giữ nguyên */
  let tang = [];
  console.log('');
  for (const l of LUAT) {
    const ds = [...(gap[l.ma] || [])].sort();
    const cu = new Set((nen.luat[l.ma] || []));
    const moi = ds.filter(x => !cu.has(x));
    const ct = (x) => x + ' (' + viDu[l.ma][x] + ')';
    if (l.muc === 'chan') {
      bao(!ds.length, l.ma + ' ' + l.ten + ' — phải bằng 0', ds.slice(0, 5).map(ct).join(' · ') +
        (ds.length > 5 ? ' · … ' + ds.length + ' màn' : ''));
    } else {
      bao(!moi.length, l.ma + ' ' + l.ten + ' — ' + ds.length + ' màn (trần ' + cu.size + ')',
        moi.length ? 'MÀN PHẠM MỚI: ' + moi.slice(0, 5).map(ct).join(' · ') : '');
      if (moi.length) tang.push(l.ma + ':' + moi.join(','));
      nenMoi.luat[l.ma] = ds;
    }
  }
  /* --chi-tiet TK01 in đủ mọi màn của một luật, để sửa chứ không chỉ để đếm */
  const iCt = process.argv.indexOf('--chi-tiet');
  if (iCt > 0) {
    const ma = process.argv[iCt + 1];
    console.log('\n── ' + ma + ' ──');
    [...(gap[ma] || [])].sort().forEach(x => console.log('  ' + x + ' · ' + viDu[ma][x]));
    /* Gom theo hình lỗi (bỏ chữ cụ thể) để thấy MỘT lớp CSS gây ra bao nhiêu chỗ */
    const dem = {};
    (tatCa[ma] || []).forEach(x => { const k = x.split(' · ')[1].replace(/"[^"]*"?/g, '').trim(); dem[k] = (dem[k] || 0) + 1; });
    Object.entries(dem).sort((a, b) => b[1] - a[1]).slice(0, 30).forEach(([k, n]) => console.log('    ' + n + '× ' + k));
  }
  console.log('\n' + soDo + ' lượt đo · ' + LUAT.length + ' luật · ' + loi + ' chỗ đỏ');

  if (GHI) {
    /* Luật 'chan' đỏ thì không ghi gì — trần chỉ dành cho luật 'tran'. */
    const chanDo = LUAT.filter(l => l.muc === 'chan' && (gap[l.ma] || new Set()).size);
    if (chanDo.length) {
      console.log('\n✗ Không ghi trần: luật phải bằng 0 đang đỏ — ' + chanDo.map(l => l.ma).join(', '));
      process.exit(1);
    }
    if (tang.length && coNen && LY_DO_TANG.trim().length < 15) {
      console.log('\n✗ Không ghi trần: có màn phạm mới (' + tang.join(' · ') +
        '). Sửa nó, hoặc ghi kèm --nhan-tang "lý do ít nhất 15 ký tự".');
      process.exit(1);
    }
    if (tang.length && coNen) nenMoi.nangTran.push({ luc: nenMoi.luc, them: tang, lyDo: LY_DO_TANG.trim() });
    fs.writeFileSync(TEP_NEN, JSON.stringify(nenMoi, null, 1) + '\n');
    console.log('Đã ghi trần mới vào tools/soat-thiet-ke.nen.json');
    process.exit(0);
  }
  process.exit(loi ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
