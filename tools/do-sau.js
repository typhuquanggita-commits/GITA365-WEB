/* ═══════════════════════════════════════════════════════════════
   GITA 365 — BỘ DÒ SÂU
   Chạy: node tools/do-sau.js        (thêm --im để chỉ in chỗ đỏ)

   VÌ SAO CÓ BỘ NÀY KHI ĐÃ CÓ BỘ KIỂM 979 PHÉP ĐO

   Bộ kiểm phát hành chạy trong trình duyệt: nó mở từng màn của từng
   vai và xem có hỏng không. Nó rất giỏi bắt thứ HIỆN RA SAI.

   Nhưng có một lớp lỗi nó không thấy được, vì lớp ấy KHÔNG hiện ra
   sai — nó hiện ra đúng, chỉ là đúng theo bản đè lên chứ không phải
   bản mình tưởng:

     · hai tệp cùng khai G.VIEWS['x'] — tệp nạp sau thắng, im lặng
     · hai tệp cùng khai G.ham() — tệp nạp sau thắng, im lặng
     · một màn có mã nhưng không đường nào tới — chạy đúng, vô hình
     · một mục NAV trỏ vào màn không tồn tại — bấm vào thì trống
     · một màn thiếu bản tiếng Anh — đổi ngôn ngữ thì rơi về tiếng Việt

   Cả năm lớp ấy đọc TĨNH trên nguồn thì thấy ngay, mà chạy động thì
   không. Nên bộ này không thay bộ kiểm — nó soi chỗ bộ kiểm không
   soi tới.

   CHỖ ĐẮT NHẤT: PHÂN BIỆT BỌC VỚI ĐÈ

   Một tệp khai lại G.ham() có thể là hai việc khác hẳn nhau:

     BỌC   đọc bản cũ vào biến rồi gọi nó bên trong bản mới. Đây là
           cách mở rộng đúng, và bộ này KHÔNG báo.
     ĐÈ    bỏ hẳn bản cũ. Việc này đôi khi cố ý — nhưng nó phụ thuộc
           THỨ TỰ TỆP trong tools/danh-sach-src.json, và thứ tự ấy
           là một dòng trong một tệp JSON mà ai cũng sửa được.

   Với ĐÈ, bộ này đòi khai ở G.DE_LEN: đè cái gì, ở đâu, vì sao. Chưa
   khai thì đỏ.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
const fs = require('fs');
const path = require('path');

const GOC = path.join(__dirname, '..');
const IM = process.argv.indexOf('--im') >= 0;

function docDS(tep) {
  const j = JSON.parse(fs.readFileSync(path.join(GOC, tep), 'utf8'));
  if (Array.isArray(j)) return j;
  const m = Object.values(j).find(Array.isArray);
  if (!m) throw new Error(tep + ' không chứa mảng tệp nào');
  return m;
}

const DS = docDS('tools/danh-sach-src.json');
const DOC = {};
DS.forEach(f => {
  const p = path.join(GOC, f);
  if (fs.existsSync(p)) DOC[f] = fs.readFileSync(p, 'utf8');
});

const bao = [];
function do_(nhom, cau) { bao.push({ nhom, cau }); }

/* ── 1 · MÀN: khai ở đâu, ai trỏ tới ────────────────────────────── */
const man = {}, manO = {};
Object.entries(DOC).forEach(([f, s]) => {
  const re = /G\.VIEWS\['([a-z0-9-]+)'\]\s*=/g;
  let m;
  while ((m = re.exec(s))) {
    const v = m[1];
    /* BỌC hay ĐÈ: nhìn 400 ký tự TRƯỚC chỗ gán. Bọc thì ở đó có một
       biến đọc lại chính G.VIEWS['x'] — đọc trước rồi mới gán đè. */
    const truoc = s.slice(Math.max(0, m.index - 400), m.index);
    const giu = truoc.match(new RegExp("(?:var\\s+)?([a-zA-Z_$][\\w$]*)\\s*=\\s*G\\.VIEWS\\['" + v + "'\\]"));
    const than = s.slice(m.index, m.index + 900);
    const boc = !!(giu && new RegExp('\\b' + giu[1].replace(/\$/g, '\\$') + '\\b\\s*[.(]').test(than));
    if (man[v] && !boc) do_('MÀN BỊ ĐÈ', v + ' khai ở cả ' + manO[v] + ' và ' + f +
      ' — tệp nạp sau thắng, im lặng');
    if (!man[v]) { man[v] = 1; manO[v] = f; }
  }
});

const core = DOC['src/data.core.js'] || '';
const NAV = [...core.matchAll(/\{v:'([a-z0-9-]+)'/g)].map(m => m[1]);

const demNav = {};
NAV.forEach(v => { demNav[v] = (demNav[v] || 0) + 1; });
Object.entries(demNav).forEach(([v, n]) => {
  if (n > 1) do_('NAV TRÙNG MỤC', v + ' xuất hiện ' + n + ' lần trong G.NAV');
});

NAV.forEach(v => {
  if (!man[v]) do_('NAV TRỎ VÀO KHOẢNG KHÔNG', v + ' có trong G.NAV mà không tệp nào khai màn');
});
Object.keys(man).forEach(v => {
  if (NAV.indexOf(v) < 0) {
    /* Màn không có mục NAV vẫn có thể tới được bằng G.go('x') từ một
       nút. Chỉ báo khi KHÔNG chỗ nào gọi tới. */
    const goi = Object.entries(DOC).some(([f, s]) =>
      f !== manO[v] && new RegExp("go\\(\\s*['\"]" + v + "['\"]").test(s));
    if (!goi) do_('MÀN CHẾT', v + ' (' + manO[v] + ') — không mục NAV, không nút nào gọi tới');
  }
});

/* ── 2 · TIẾNG ANH phủ hết mục NAV ─────────────────────────────── */
const i18 = DOC['src/i18n.js'] || '';
NAV.forEach(v => {
  if (i18.indexOf("'" + v + "':[") < 0) do_('THIẾU BẢN TIẾNG ANH', v);
});

/* ── 3 · HÀM bị đè ─────────────────────────────────────────────── */
const ham = {}, hamO = {}, deLen = [];
Object.entries(DOC).forEach(([f, s]) => {
  const re = /(^|\n)\s*G\.([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*function/g;
  let m;
  while ((m = re.exec(s))) {
    const n = m[2];
    /* BỌC hay ĐÈ. Giữ lại tham chiếu cũ là chưa đủ để gọi là bọc —
       hai hàm an toàn nhất của bản máy khách (BI_KHOA_CHEP, coTheIn)
       đều giữ tham chiếu rồi trả về hằng số, không gọi bản cũ lần
       nào. Chúng là ĐÈ, và đúng là hai chỗ cần canh nhất.

       Nên phép nhận dạng là: bản mới có GỌI bản cũ trong thân nó
       không. Có thì bọc; không thì đè, dù tham chiếu còn nằm đó. */
    const truoc = s.slice(Math.max(0, m.index - 400), m.index);
    const giu = truoc.match(new RegExp('(?:var\\s+)?([a-zA-Z_$][\\w$]*)\\s*=\\s*G\\.' + n + '\\b'));
    const than = s.slice(m.index, m.index + 900);
    const boc = !!(giu && new RegExp('\\b' + giu[1].replace(/\$/g, '\\$') + '\\b\\s*[.(]').test(than));
    if (ham[n] && hamO[n] !== f) {
      if (!boc) deLen.push({ ham: n, cu: hamO[n], moi: f });
    }
    if (!ham[n]) { ham[n] = 1; hamO[n] = f; }
    else if (!boc) hamO[n] = f;
  }
});

/* Đọc bảng khai ĐÈ. Bảng nằm ở src/de-len.js dưới dạng một mảng
   thường — đọc bằng regex chứ không nạp mã, vì tệp ấy cần window. */
const sDL = DOC['src/de-len.js'] || '';
const khaiDL = {};
/* Cắt bảng theo mốc "{ ham:" chứ không cắt theo số ký tự. Bản đầu cắt
   ở 400 ký tự và không mục nào lọt — mỗi mục dài hơn thế, nên bộ dò
   báo "chưa khai" cho cả ba chỗ đã khai đầy đủ. Một bộ dò báo oan thì
   lần sau người ta tắt nó đi. */
{
  const moc = [...sDL.matchAll(/\{\s*ham:\s*'([a-zA-Z0-9_]+)'/g)];
  moc.forEach((m, i) => {
    const het = i + 1 < moc.length ? moc[i + 1].index : sDL.length;
    const kh = sDL.slice(m.index, het);
    khaiDL[m[1]] = {
      cu: (kh.match(/tepCu:\s*'([^']+)'/) || [])[1] || '',
      moi: (kh.match(/tepMoi:\s*'([^']+)'/) || [])[1] || '',
      vi: /\bvi:\s*'/.test(kh),
      antoan: /antoan:\s*true/.test(kh)
    };
  });
}

deLen.forEach(d => {
  const k = khaiDL[d.ham];
  if (!k) {
    do_('HÀM BỊ ĐÈ MÀ KHÔNG KHAI', 'G.' + d.ham + '() — ' + d.cu + ' bị ' + d.moi +
      ' đè. Khai ở src/de-len.js hoặc đổi tên một trong hai.');
    return;
  }
  if (k.cu !== d.cu || k.moi !== d.moi)
    do_('KHAI ĐÈ SAI TỆP', 'G.' + d.ham + '() khai "' + k.cu + ' → ' + k.moi +
      '" mà thật ra là "' + d.cu + ' → ' + d.moi + '"');
  if (!k.vi) do_('KHAI ĐÈ KHÔNG NÓI VÌ SAO', 'G.' + d.ham + '()');
});

/* ── VỀ THỨ TỰ NẠP, VÀ VỀ MỘT NHÁNH ĐÃ BỎ ──────────────────────────
   Bản đầu có thêm một nhánh riêng canh "thứ tự nạp ngược": nếu tệp
   đè nạp TRƯỚC tệp bị đè thì đỏ. Đem thử làm hỏng — kéo may-khach.js
   lên trước app.js — và nhánh ấy KHÔNG chạy tới.

   Lý do: khi thứ tự đảo, chính phép dò cũng đọc ngược. May-khach trở
   thành tệp khai TRƯỚC, app.js thành tệp đè. Nên d.moi luôn là tệp
   nạp sau, và THU_TU[d.moi] < THU_TU[d.cu] không bao giờ đúng được.

   Nhưng phép thử ấy VẪN đỏ — ở nhánh KHAI ĐÈ SAI TỆP, và câu báo còn
   rõ hơn: 'khai "app.js → may-khach.js" mà thật ra là "may-khach.js →
   app.js"'. Tức là chỗ nguy hiểm nhất vẫn được canh, chỉ là canh bằng
   nhánh khác.

   Nên nhánh thứ tự bị bỏ. Một phép kiểm chưa từng đỏ thì chưa phải
   phép kiểm — kho này đã bỏ một phép như thế ở 9.68, và đây là lần
   thứ hai. Giữ lại vì nhìn chặt là tự lừa mình. */

/* Khai thừa: khai một chỗ đè mà thật ra không còn đè nữa. */
Object.keys(khaiDL).forEach(n => {
  if (!deLen.some(d => d.ham === n))
    do_('KHAI ĐÈ THỪA', 'G.' + n + '() khai ở src/de-len.js mà không tệp nào đè nó nữa');
});

/* ── 4 · TỆP khai trong danh sách mà không có trên đĩa ─────────── */
DS.forEach(f => {
  if (!DOC[f]) do_('TỆP KHAI MÀ KHÔNG CÓ', f);
});

/* ── IN ────────────────────────────────────────────────────────── */
const nhom = {};
bao.forEach(b => (nhom[b.nhom] = nhom[b.nhom] || []).push(b.cau));

if (!IM) {
  console.log('── BỘ DÒ SÂU ──');
  console.log('  ' + DS.length + ' tệp nguồn · ' + NAV.length + ' mục NAV · ' +
    Object.keys(man).length + ' màn · ' + Object.keys(ham).length + ' hàm · ' +
    deLen.length + ' chỗ đè');
  console.log();
}

Object.entries(nhom).forEach(([k, vs]) => {
  console.log('  ✗ ' + k + ' — ' + vs.length);
  vs.forEach(v => console.log('      · ' + v));
});

if (!bao.length) console.log('✓ BỘ DÒ SÂU SẠCH — không màn nào bị đè, không hàm nào đè trộm, ' +
  'không màn chết, không mục NAV trỏ vào khoảng không');
else console.log('\n✗ CÒN ' + bao.length + ' CHỖ — bộ dò sâu');

process.exit(bao.length ? 1 : 0);
