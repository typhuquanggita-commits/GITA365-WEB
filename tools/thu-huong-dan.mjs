/* GITA 365 — THỬ VIDEO HƯỚNG DẪN & CHẾ ĐỘ "LÀM THEO TỪNG BƯỚC" (không trình duyệt)

   Chứng minh, chạy thẳng mã app trong node:vm:
     a. G.hdChoMan dựng được kịch bản cho MỌI mục G.NAV — nhân sự 5 mục, khách
        10 mục, mục nào cũng có ít nhất một cảnh có tiêu đề và lời
     b. G.hdBuocTuMoTa ra đúng câu theo loại, tối đa 8 bước, bỏ nhãn trống/trùng,
        KHÔNG tự thoát HTML; bóng chữ G.hdDenHtml thoát mọi nhãn; và soát tĩnh:
        chỗ ghép HTML luôn bọc nhãn bằng h(…)
     c. không còn tệp nào trong src/ trỏ tới 'video-huong-dan.html' — trang ấy
        không có trong kho, ai bấm cũng gặp 404
     d. src/huong-dan.js và src/con-duong.js giữ ES5 (không =>, let, const, dấu `)
     + tên/mô tả màn đi qua G.iname/G.ihint (lời của người đang xem) · nhãn đối
       tượng trên bìa · nhân vật "Bạn đang ở đây" ở Con đường vẽ thật

   Dùng: node tools/thu-huong-dan.mjs [thư-mục-gốc]   (mặc định: kho chứa tệp này) */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = process.argv[2] ? path.resolve(process.argv[2]) : path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const doc = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
let dat = 0, truot = 0;
const kiem = (ten, dk, chiTiet) => {
  if (dk) { dat++; console.log('✓ ' + ten); }
  else { truot++; console.log('✗ ' + ten + (chiTiet ? '\n    ' + chiTiet : '')); }
};

/* ── Hộp cát: stub tối thiểu, mọi lời gọi DOM trả về thứ an toàn ── */
const thoat = s => String(s === null || s === undefined ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
function theGia() {
  return {
    style: {}, attrs: {}, children: [], innerHTML: '', textContent: '', hidden: false,
    classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
    setAttribute(k, v) { this.attrs[k] = String(v); }, getAttribute(k) { return k in this.attrs ? this.attrs[k] : null; },
    appendChild(c) { this.children.push(c); return c; }, removeChild(c) { return c; }, remove() {},
    querySelector() { return null; }, querySelectorAll() { return []; },
    addEventListener() {}, removeEventListener() {}, focus() {}, contains() { return false; },
    getClientRects() { return []; }, getBoundingClientRect() { return { top: 0, left: 0, right: 0, bottom: 0, width: 0, height: 0 }; }
  };
}
const kho = {};
const localStorage = {
  getItem: k => (Object.prototype.hasOwnProperty.call(kho, k) ? kho[k] : null),
  setItem: (k, v) => { kho[k] = String(v); }, removeItem: k => { delete kho[k]; }
};
const document = {
  body: theGia(), head: theGia(), documentElement: theGia(),
  createElement: () => theGia(), getElementById: () => null,
  querySelector: () => null, querySelectorAll: () => [],
  addEventListener() {}, removeEventListener() {}
};
const G = { VIEWS: {}, U: { h: thoat, ic: () => '', toast() {}, empty: (t, s) => '<div class="card">' + thoat(t) + ' ' + thoat(s || '') + '</div>' } };
const window = { G, document, localStorage, innerWidth: 390, innerHeight: 800, addEventListener() {}, removeEventListener() {} };
const ctx = { window, G, document, localStorage, console, setTimeout, clearTimeout };
vm.createContext(ctx);
for (const f of ['src/data.core.js', 'src/huong-dan.js', 'src/nhan-vat.js', 'src/con-duong.js']) {
  vm.runInContext(doc(f), ctx, { filename: f });
}
kiem('nạp được data.core.js · huong-dan.js · nhan-vat.js · con-duong.js trong hộp cát',
  typeof G.hdChoMan === 'function' && typeof G.hdBuocTuMoTa === 'function' && typeof G.hdQuetMan === 'function' &&
  typeof G.hdDenHtml === 'function' && typeof G.hdDen === 'function' && typeof G.VIEWS['con-duong'] === 'function');

/* ══ a · kịch bản cho mọi mục G.NAV ══ */
const nav = [];
(G.NAV || []).forEach(g => (g.items || []).forEach(it => nav.push(it)));
const duKichBan = (kb, soMuc) => !!kb && Array.isArray(kb.muc) && kb.muc.length === soMuc &&
  kb.muc.every(m => Array.isArray(m.canh) && m.canh.length >= 1 &&
    m.canh.every(c => c && String(c.td || '').trim() && String(c.loi || '').trim()));

G.LA_KHACH = () => false; G.S = { roleObj: { lv: 7 } };
const loiNS = [];
for (const it of nav) { let kb; try { kb = G.hdChoMan(it.v); } catch (e) { kb = null; } if (!duKichBan(kb, 5)) loiNS.push(it.v); }
kiem('nhân sự: ' + (nav.length - loiNS.length) + '/' + nav.length + ' mục G.NAV có kịch bản đủ 5 mục, mục nào cũng ≥ 1 cảnh',
  nav.length >= 200 && !loiNS.length, loiNS.slice(0, 8).join(' · '));

G.LA_KHACH = () => true; G.S = { roleObj: { lv: 13 } };
const loiKH = [];
for (const it of nav) { let kb; try { kb = G.hdChoMan(it.v); } catch (e) { kb = null; } if (!duKichBan(kb, 10)) loiKH.push(it.v); }
kiem('khách: ' + (nav.length - loiKH.length) + '/' + nav.length + ' mục G.NAV có kịch bản đủ 10 mục, mục nào cũng ≥ 1 cảnh',
  nav.length >= 200 && !loiKH.length, loiKH.slice(0, 8).join(' · '));

const gioiThieu = new Set(nav.map(it => G.hdChoMan(it.v).muc[0].canh[0].loi));
kiem('cảnh giới thiệu nói riêng về từng màn (' + gioiThieu.size + ' lời khác nhau / ' + nav.length + ' màn)',
  gioiThieu.size >= Math.floor(nav.length * 0.9));
kiem('màn lạ (không có trong G.NAV) vẫn có kịch bản, không ném lỗi', duKichBan(G.hdChoMan('man-khong-co-that'), 10));

/* tên & mô tả màn theo lời của người đang xem */
const mauNav = nav.filter(it => it.v === 'ban-co-tong')[0] || nav[1];
G.iname = it => 'Lời nhà mình · ' + it.t;
G.ihint = it => 'Gợi ý nhà mình · ' + it.h;
const kbLoi = G.hdChoMan(mauNav.v);
kiem('tên và mô tả màn đi qua G.iname/G.ihint, không đọc thẳng nav.t/nav.h',
  kbLoi.tua === 'Lời nhà mình · ' + mauNav.t && kbLoi.muc[0].canh[0].loi.indexOf('Gợi ý nhà mình · ') === 0,
  kbLoi.tua + ' | ' + kbLoi.muc[0].canh[0].loi);
G.iname = () => { throw new Error('thiếu G.ITEM_EN'); };
kiem('G.iname ném lỗi thì lùi về chữ gốc, video không vỡ', G.hdChoMan(mauNav.v).tua === mauNav.t);
delete G.iname; delete G.ihint;

/* nhãn đối tượng trên bìa */
const doiTuong = (khach, lv) => { G.LA_KHACH = () => khach; G.S = lv === null ? {} : { roleObj: { lv } }; return G.hdChoMan('crm').doiTuong; };
const dt = [doiTuong(true, 13), doiTuong(false, 1), doiTuong(false, 5), doiTuong(false, 6), doiTuong(false, null)];
kiem('nhãn đối tượng: khách hàng · chuyên gia (bậc ≤ 5) · nhân sự',
  JSON.stringify(dt) === JSON.stringify(['Dành cho khách hàng', 'Dành cho chuyên gia', 'Dành cho chuyên gia', 'Dành cho nhân sự', 'Dành cho nhân sự']),
  JSON.stringify(dt));

/* ══ b · từ mô tả ra bước ══ */
const B = (ds, opt) => G.hdBuocTuMoTa(ds, opt);
const mau = [
  { kieu: 'muc', nhan: 'Thông tin chung' },
  { kieu: 'ngan', nhan: 'Tổng quan', bat: true },
  { kieu: 'ngan', nhan: 'Việc nên làm' },
  { kieu: 'o', nhan: 'Họ tên:' },
  { kieu: 'o', nhan: 'Chặng', loai: 'chon' },
  { kieu: 'o', nhan: 'Đồng ý điều khoản', loai: 'tich' },
  { kieu: 'bang', nhan: 'Danh sách khách' },
  { kieu: 'nut', nhan: 'Lưu', bat: true }
];
const r1 = B(mau);
const cau1 = r1.map(b => b.cau);
kiem('câu đúng theo loại: phần · ngăn · ô · ô chọn · ô đánh dấu · bảng · nút',
  JSON.stringify(cau1) === JSON.stringify(['Xem phần «Thông tin chung»', 'Chọn ngăn «Việc nên làm»', 'Điền ô «Họ tên»',
    'Chọn «Chặng»', 'Đánh dấu «Đồng ý điều khoản»', 'Đọc bảng «Danh sách khách»', 'Bấm «Lưu»']), JSON.stringify(cau1));
kiem('ngăn ĐANG mở không thành một bước "chọn" thừa', !r1.some(b => b.nhan === 'Tổng quan'));
kiem('mỗi bước có i trỏ đúng mô tả gốc · có nhãn · có câu gợi ý',
  r1.every(b => mau[b.i] && mau[b.i].kieu === b.kieu && b.nhan && b.goi));

const nhieu = [];
for (let k = 1; k <= 6; k++) nhieu.push({ kieu: 'muc', nhan: 'Phần ' + k });
for (let k = 1; k <= 6; k++) nhieu.push({ kieu: 'ngan', nhan: 'Ngăn ' + k });
for (let k = 1; k <= 6; k++) nhieu.push({ kieu: 'o', nhan: 'Trường ' + k });
nhieu.push({ kieu: 'bang', nhan: 'Bảng tổng' }, { kieu: 'nut', nhan: 'Gửi', bat: true }, { kieu: 'nut', nhan: 'Huỷ' });
const r2 = B(nhieu);
kiem('tối đa 8 bước, và luôn giữ một chỗ cho nút chính', r2.length === 8 && r2.some(b => b.cau === 'Bấm «Gửi»'), JSON.stringify(r2.map(b => b.cau)));
kiem('màn bận rộn vẫn đủ mặt: phần · ngăn · ô · bảng · nút', ['muc', 'ngan', 'o', 'bang', 'nut'].every(k => r2.some(b => b.kieu === k)));
kiem('bước ra theo thứ tự trên màn (vòng sáng đi một chiều)', r2.every((b, k) => k === 0 || r2[k - 1].i < b.i));
kiem('opt.toiDa nhỏ hơn thì theo, lớn hơn 8 vẫn chỉ 8', B(nhieu, { toiDa: 3 }).length === 3 && B(nhieu, { toiDa: 50 }).length === 8);

const r3 = B([{ kieu: 'nut', nhan: 'Lưu' }, { kieu: 'nut', nhan: '  Lưu ' }, { kieu: 'muc', nhan: '' }, { kieu: 'o', nhan: '   ' },
  { kieu: 'muc', nhan: 'Ghi chú' }, { kieu: 'o', nhan: 'Ghi chú' }, null, { kieu: 'la', nhan: 'X' }]);
kiem('bỏ nhãn trống · nhãn trùng (giữ loại LÀM được) · mô tả hỏng',
  JSON.stringify(r3.map(b => b.cau)) === JSON.stringify(['Điền ô «Ghi chú»', 'Bấm «Lưu»']), JSON.stringify(r3.map(b => b.cau)));

const r4 = B([{ kieu: 'ngan', nhan: '01 BẢN ĐỒ THỊNH VƯỢNG 24/26' }, { kieu: 'o', nhan: 'Ô tìm kiếm' }, { kieu: 'o', nhan: 'Ô nhập' },
  { kieu: 'o', nhan: 'Email *' }, { kieu: 'muc', nhan: 'x'.repeat(80) }]);
const nhan4 = r4.map(b => b.nhan);
kiem('làm sạch nhãn: số thứ tự và bộ đếm · tiền tố "Ô" · dấu bắt buộc · nhãn chung "Ô nhập" · cắt nhãn dài',
  nhan4.indexOf('BẢN ĐỒ THỊNH VƯỢNG') >= 0 && nhan4.indexOf('tìm kiếm') >= 0 && nhan4.indexOf('Email') >= 0 &&
  !nhan4.some(n => /nhập/.test(n)) && nhan4.some(n => n.length === 48 && /…$/.test(n)), JSON.stringify(nhan4));

const r5 = B([{ kieu: 'nut', nhan: 'Lưu thay đổi', bat: true }, { kieu: 'o', nhan: 'Họ tên' }, { kieu: 'o', nhan: 'Số điện thoại' }, { kieu: 'bang', nhan: 'Lịch sử' }]);
kiem('nút chính đứng TRƯỚC các ô thì được chỉ ngay sau ô cuối (điền xong mới bấm)',
  JSON.stringify(r5.map(b => b.kieu)) === '["o","o","nut","bang"]', JSON.stringify(r5.map(b => b.cau)));
const r6 = B([{ kieu: 'nut', nhan: 'Nạp tệp giấy phép', bat: true }, { kieu: 'nut', nhan: 'Nối máy chủ' }]);
kiem('không có ô thì nút giữ thứ tự trên màn', JSON.stringify(r6.map(b => b.cau)) === '["Bấm «Nạp tệp giấy phép»","Bấm «Nối máy chủ»"]',
  JSON.stringify(r6.map(b => b.cau)));
kiem('đầu vào rỗng/hỏng ra mảng rỗng, không ném lỗi', B([]).length === 0 && B(null).length === 0 && B(undefined, {}).length === 0);

const doc1 = '<img src=x onerror=alert(1)>';
const r7 = B([{ kieu: 'nut', nhan: doc1, bat: true }]);
kiem('G.hdBuocTuMoTa KHÔNG tự thoát HTML (thoát ở chỗ ghép, không thoát hai lần)',
  r7.length === 1 && r7[0].nhan === doc1 && r7[0].cau === 'Bấm «' + doc1 + '»');
const bong = G.hdDenHtml(r7, 0);
kiem('bóng chữ thoát mọi nhãn: "Bước 1/1 · …", không thẻ <img nào lọt vào HTML',
  bong.indexOf('<img') < 0 && bong.indexOf('&lt;img') >= 0 && bong.indexOf('Bước 1/1</b> · ') >= 0, bong);
kiem('màn không có thao tác: nói thẳng, không dựng một vòng rỗng',
  G.hdDenHtml([], 0).indexOf('Màn này chưa có thao tác nào để chỉ — đọc phần giới thiệu ở trên') >= 0);
const q0 = G.hdQuetMan();
kiem('quét màn khi chưa có #main: trả rỗng, không ném lỗi', !!q0 && q0.ds.length === 0 && q0.el.length === 0);

/* Soát tĩnh: tách mã thành (bỏ chú thích, giữ chuỗi) — hiểu cả chuỗi lẫn
   biểu thức chính quy, để "//" trong chuỗi không bị tưởng là chú thích. */
function boChuThich(s) {
  let o = '', i = 0, truoc = '';
  while (i < s.length) {
    const c = s[i], d = s[i + 1];
    if (c === '/' && d === '*') {
      const j = s.indexOf('*/', i + 2), e = j < 0 ? s.length : j + 2;
      o += (s.slice(i, e).match(/\n/g) || []).join(''); i = e; continue;
    }
    if (c === '/' && d === '/') { const j = s.indexOf('\n', i); i = j < 0 ? s.length : j; continue; }
    if (c === "'" || c === '"' || c === '`') {
      let j = i + 1;
      while (j < s.length && s[j] !== c) { if (s[j] === '\\') j++; else if (s[j] === '\n' && c !== '`') break; j++; }
      o += s.slice(i, j + 1); i = j + 1; truoc = c; continue;
    }
    if (c === '/' && (truoc === '' || /[(,=:[!&|?{};+\-*%<>~^]/.test(truoc))) {
      let j = i + 1, lop = false;
      while (j < s.length && s[j] !== '\n') {
        if (s[j] === '\\') { j += 2; continue; }
        if (s[j] === '[') lop = true; else if (s[j] === ']') lop = false; else if (s[j] === '/' && !lop) break;
        j++;
      }
      j++; while (j < s.length && /[a-z]/i.test(s[j])) j++;
      o += s.slice(i, j); i = j; truoc = 'r'; continue;
    }
    o += c; if (!/\s/.test(c)) truoc = c; i++;
  }
  return o;
}
const maHD = boChuThich(doc('src/huong-dan.js'));
/* Dòng ghép HTML = dòng có một chuỗi chứa "<". Trên dòng ấy, bỏ hết chỗ đã
   bọc h(…) rồi tìm chỗ còn NỐI THẲNG .cau/.nhan/.goi bằng dấu + — đó mới là
   chỗ chữ của màn chui vào HTML. (Dùng làm điều kiện "b.goi ? …" thì không.) */
const dongHtml = maHD.split('\n').filter(l => /'[^'\n]*<[^'\n]*'/.test(l) || /"[^"\n]*<[^"\n]*"/.test(l));
const noiTho = /\+\s*[\w$.[\]]*\.(?:cau|nhan|goi)\b(?!\s*\()|[\w$\]]\.(?:cau|nhan|goi)\s*\+/;
const loThoat = dongHtml.filter(l => noiTho.test(l.replace(/\b(?:U\.)?h\(\s*[\w$.[\]]+\.(?:cau|nhan|goi)\s*\)/g, ' ')));
kiem('soát tĩnh: chỗ ghép HTML trong huong-dan.js luôn bọc nhãn/câu bằng h(…)',
  /\bh\(\s*b\.cau\s*\)/.test(maHD) && !loThoat.length, loThoat.slice(0, 3).map(l => l.trim()).join(' | '));
kiem('chế độ từng bước không gọi mạng (không fetch, không địa chỉ http)', !/\bfetch\s*\(|https?:\/\//.test(maHD));

/* ══ c · liên kết chết ══ */
const conLink = fs.readdirSync(path.join(ROOT, 'src')).filter(f => f.endsWith('.js') && doc('src/' + f).indexOf('video-huong-dan.html') >= 0);
kiem("không tệp nào trong src/ còn trỏ tới 'video-huong-dan.html' (trang không tồn tại)", !conLink.length, conLink.join(', '));
G.LA_KHACH = () => false; const nutNS = G.hdNut('crm', '', 'Xem video hướng dẫn màn này');
G.LA_KHACH = () => true; const nutKH = G.hdNut('crm', '', 'Xem video hướng dẫn màn này');
kiem('nút ở đầu màn mở chế độ từng bước ngay trong app (không <a href>), nhãn theo người xem',
  /data-hd-buoc="crm"/.test(nutNS) && /data-hd-mo="crm\|"/.test(nutNS) && !/<a\b|href=/.test(nutNS + nutKH) &&
  nutNS.indexOf('Làm theo từng bước') >= 0 && nutKH.indexOf('Xem cách làm từng bước') >= 0);

/* ══ d · ES5 ══ */
for (const f of ['src/huong-dan.js', 'src/con-duong.js']) {
  const sach = boChuThich(doc(f)), loi = [];
  sach.split('\n').forEach((l, k) => {
    if (/=>/.test(l) || /(^|[^\w$.])(let|const)\s/.test(l) || l.indexOf('`') >= 0) loi.push(f + ':' + (k + 1) + ' ' + l.trim().slice(0, 60));
  });
  kiem(f + ' giữ ES5 ngoài chú thích (không =>, let, const, dấu `)', !loi.length, loi.slice(0, 4).join(' · '));
}

/* ══ + · nhân vật ở Con đường ══ */
kho.gita_nhanvat = JSON.stringify({ da: 3, tocMau: 2, toc: 1, ao: 2, kinh: 1 });
G.nvDoc = null;
G.BD_LON = [{ ma: 'BD1', ten: 'Bánh đà thử', tang: 'T1', c: 'var(--t1)', vong: 'Vòng thử.', y: 'Vì sao.', nho: ['Một việc nhỏ'] }];
G.TIERS = [{ code: 'T1' }]; G.cdXong = {};
const htmlCD = G.VIEWS['con-duong']();
const nv = (htmlCD.match(/<span class="cd-here">([\s\S]*?)<\/span>/) || [])[1] || '';
kiem('Con đường: "Bạn đang ở đây" là một <svg viewBox="0 0 64 96"> thật, vẽ từ nhân vật ĐÃ LƯU',
  /^<svg[^>]*viewBox="0 0 64 96"[^>]*>/.test(nv) && nv.indexOf('</svg>') > 0 && nv.indexOf(G.NV.da[3]) >= 0 && /height="30"/.test(nv),
  nv.slice(0, 160));
kiem('Con đường: không còn lời gọi G.nvVe(30) (soát trên mã đã bỏ chú thích)', boChuThich(doc('src/con-duong.js')).indexOf('nvVe(30)') < 0);

console.log('\n' + dat + ' đạt · ' + truot + ' sai');
process.exit(truot ? 1 : 0);
