/* GITA 365 — SOÁT THIẾT KẾ, PHẦN TĨNH (cổng CI, không cần trình duyệt)

   Chạy: node tools/thu-thiet-ke-tinh.mjs

   Sổ luật: tools/luat-thiet-ke.json (ý tưởng từ bộ dò của pbakaus/impeccable,
   Apache-2.0 — mã viết lại từ đầu). Phần đo trên trình duyệt thật ở
   tools/soat-thiet-ke.js; tệp này canh bốn luật đọc được thẳng từ mã nguồn:

   TK13 chữ chuyển sắc     — trần: không thêm chỗ dùng mới
   TK15 chuyển động nảy    — cubic-bezier vượt [0,1] ở trục thời gian-giá trị
                              (y1, y2) là đường vượt đích rồi bật lại
   TK16 chữ chạy ngang      — thẻ <marquee>, hoặc keyframes tên marquee/ticker
   TK19 màu chữ gõ tay      — trần: color:#hex không thêm chỗ mới
   TK18 màu cấm             — ba mã vàng cũ, KỂ CẢ dạng %23 trong URL dữ liệu.
                              kiem-tra.js đã có phép này nhưng chỉ dò dạng #…,
                              nên favicon viết %23F5B942 sống sót tới 9.99.x

   Thêm hai phép canh chính sổ luật:
   · mỗi luật khai đúng MỘT nơi đo, và nơi ấy có cài luật (đối chiếu hai đầu:
     lời khai của sổ ↔ mã của hai tệp đo)
   · tự thử: mỗi bộ dò phải ĐỎ trên một mẩu mã cố ý phạm — một bộ dò chưa
     từng đỏ thì chưa phải bộ dò. */
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
const ROOT = fileURLToPath(new URL('..', import.meta.url)).replace(/[\\/]$/, '');
const doc = (f) => fs.readFileSync(ROOT + '/' + f, 'utf8');

let sai = 0;
const kiem = (t, d, ct) => { console.log((d ? '  ✓ ' : '  ✗ ') + t + (d || !ct ? '' : ' — ' + ct)); if (!d) sai++; };

const SO = JSON.parse(doc('tools/luat-thiet-ke.json'));
const NEN = (() => { try { return JSON.parse(doc('tools/soat-thiet-ke.nen.json')); } catch (e) { return { luat: {} }; } })();

/* ── Bộ dò — hàm thuần, nhận chuỗi, trả danh sách chỗ phạm ── */
const DO = {
  TK13: (s) => [...s.matchAll(/background-clip\s*:\s*text|class=\\?["'][^"']*\bgrad-text\b/g)].map(m => m[0].slice(0, 40)),
  TK15: (s) => {
    const r = [];
    for (const m of s.matchAll(/cubic-bezier\(\s*([-\d.]+)\s*,\s*([-\d.]+)\s*,\s*([-\d.]+)\s*,\s*([-\d.]+)\s*\)/g)) {
      const y1 = +m[2], y2 = +m[4];
      if (y1 < 0 || y1 > 1 || y2 < 0 || y2 > 1) r.push(m[0]);
    }
    for (const m of s.matchAll(/@keyframes\s+([\w-]*(bounce|elastic|wobble|nay-bat)[\w-]*)/gi)) r.push('@keyframes ' + m[1]);
    return r;
  },
  TK16: (s) => [...s.matchAll(/<marquee\b|@keyframes\s+[\w-]*(marquee|ticker|chay-ngang)[\w-]*/gi)].map(m => m[0]),
  /* Không chặn chữ số đứng sau: kho này hay viết màu kèm độ trong như
     #F5B94245, và chặn như vậy là để lọt đúng dạng hay gặp nhất. */
  TK18: (s) => [...s.matchAll(/(#|%23)(F5B942|FFD98A|FF7A45)|rgba?\(\s*245\s*,\s*185\s*,\s*66\b/gi)].map(m => m[0]),
  /* Màu chữ gõ tay bằng mã hex: không đổi theo nền Sáng/Tối, và là nguồn
     của gần hết chỗ chữ nhạt lần soát đầu tìm ra. Trần — không thêm chỗ mới. */
  TK19: (s) => [...s.matchAll(/(?<![-\w])color:\s*#[0-9a-f]{3,8}\b/gi)].map(m => m[0])
};

/* ── 1 · Tự thử ── */
const MAU_PHAM = {
  TK13: '.x{background-clip:text}',
  TK15: '.x{transition:.3s cubic-bezier(.5,-0.4,.3,1.6)}',
  TK16: '<marquee>chạy</marquee>',
  TK18: "fill='%23FF7A45' border-color:#F5B94245",
  TK19: '<b style="color:#8B5CF6">'
};
const MAU_SACH = '.x{transition:.3s cubic-bezier(.2,.8,.3,1);color:var(--ink)}';
for (const ma of Object.keys(DO)) {
  kiem('TỰ THỬ ' + ma + ': đỏ trên mẫu phạm, xanh trên mẫu sạch',
    DO[ma](MAU_PHAM[ma]).length > 0 && DO[ma](MAU_SACH).length === 0);
}

/* ── 2 · Sổ luật khớp với hai tệp đo ── */
const maTrinhDuyet = doc('tools/soat-thiet-ke.js');
const saiTruocSo = sai;
for (const l of SO.luat) {
  const thieu = ['ma', 'ten', 'nguon', 'noi', 'muc', 'vi'].filter(k => !l[k]);
  if (thieu.length) kiem('SỔ: ' + l.ma + ' đủ ô', false, 'thiếu ' + thieu.join(','));
  if (l.noi === 'tinh' && !DO[l.ma]) kiem('SỔ: ' + l.ma + ' khai đo tĩnh mà tệp này không cài', false);
  if (l.noi === 'trinhDuyet' && l.ma !== 'TK12' && maTrinhDuyet.indexOf("'" + l.ma + "'") < 0)
    kiem('SỔ: ' + l.ma + ' khai đo trên trình duyệt mà soat-thiet-ke.js không cài', false);
  if (['chan', 'tran'].indexOf(l.muc) < 0) kiem('SỔ: ' + l.ma + ' mức lạ', false, l.muc);
}
for (const ma of Object.keys(DO))
  if (!SO.luat.some(l => l.ma === ma && l.noi === 'tinh')) kiem('SỔ: ' + ma + ' đo tĩnh mà sổ không khai', false);
kiem('SỔ LUẬT: ' + SO.luat.length + ' luật, mỗi luật đúng một nơi đo và nơi ấy có cài', sai === saiTruocSo);

/* ── 3 · Đo mã thật ── */
const DANH = ['assets/style.css', 'index.html'].concat(
  fs.readdirSync(ROOT + '/src').filter(f => f.endsWith('.js')).map(f => 'src/' + f));
const gap = {};
for (const f of DANH) {
  const s = doc(f);
  for (const ma of Object.keys(DO)) for (const x of DO[ma](s)) (gap[ma] = gap[ma] || []).push(f + ': ' + x);
}
for (const l of SO.luat.filter(x => x.noi === 'tinh')) {
  const ds = gap[l.ma] || [];
  if (l.muc === 'chan') {
    kiem(l.ma + ' ' + l.ten + ' — phải bằng 0', !ds.length, ds.slice(0, 4).join(' · '));
  } else {
    const tran = (NEN.tinh || {})[l.ma];
    kiem(l.ma + ' ' + l.ten + ' — ' + ds.length + ' chỗ (trần ' + tran + ')',
      typeof tran === 'number' && ds.length <= tran,
      typeof tran !== 'number' ? 'chưa có trần trong soat-thiet-ke.nen.json'
        : 'vượt trần ' + (ds.length - tran) + ' chỗ — tìm chỗ vừa thêm bằng git diff (' + ds.slice(-3).join(' · ') + ' …)');
    if (typeof tran === 'number' && ds.length < tran)
      console.log('    ↓ ít hơn trần — hạ "tinh.' + l.ma + '" trong soat-thiet-ke.nen.json xuống ' + ds.length);
  }
}

console.log(sai ? '\n✗ ' + sai + ' chỗ đỏ' : '\n✓ Soát thiết kế tĩnh: xanh');
process.exit(sai ? 1 : 0);
