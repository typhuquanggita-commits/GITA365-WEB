/* Thử bộ dịch giao diện (src/dich-giao-dien.js) và từ điển G.TU_DIEN_EN.
   Không cần trình duyệt: phần dịch một chuỗi là hàm thuần, và từ điển là dữ
   liệu — hai chỗ ấy hỏng thì màn nào cũng hỏng theo. Phần quét DOM được thử
   trên màn thật bằng tools/thu-chu-man.mjs.
   Dùng: node tools/thu-dich.mjs  ·  node tools/thu-dich.mjs pha  (phá thử) */
import fs from 'node:fs';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
const ROOT = fileURLToPath(new URL('..', import.meta.url)).replace(/[\\/]$/, '');
const PHA = process.argv[2] === 'pha';
let dat = 0, truot = 0;
const kiem = (ten, dk, ct) => { if (dk) { dat++; console.log('OK  ' + ten); } else { truot++; const d = 'SAI ' + ten + (ct ? ' — ' + ct : ''); console.log(d);
  if (process.env.GITHUB_ACTIONS) console.log('::error title=thu-dich::' + d.replace(/[\r\n%]/g, ' ').slice(0, 900)); } };

const ds = JSON.parse(fs.readFileSync(ROOT + '/tools/danh-sach-src.json', 'utf8')).app;
const tep = ds.filter(f => /src\/(dich-giao-dien|tu-dien-en-\d+)\.js$/.test(f));
kiem('bộ dịch và từ điển có trong danh sách gộp', tep.includes('src/dich-giao-dien.js') && tep.length >= 2, tep.join(','));

const window = {};
const ctx = vm.createContext({ window, document: {}, console });
for (const f of tep) {
  let src = fs.readFileSync(ROOT + '/' + f, 'utf8');
  if (PHA && f.endsWith('dich-giao-dien.js')) src = src.replace("return dau + ra + cuoi;", "return ra;");
  vm.runInContext(src, ctx, { filename: f });
}
const G = window.G;
G.LANG = 'en';
const D = G.TU_DIEN_EN;
const CO_DAU = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ]/;

/* ── Hàm dịch một chuỗi ── */
kiem('con số trả về đúng chỗ', G.dichChuoi('Thi viết 21 ngày') === '21-day writing challenge', G.dichChuoi('Thi viết 21 ngày'));
kiem('nhiều con số giữ đúng thứ tự', G.dichChuoi('Xem lộ trình T1 → T5 của nhà') === 'See the family’s T1 → T5 pathway', G.dichChuoi('Xem lộ trình T1 → T5 của nhà'));
kiem('giữ khoảng trắng hai đầu (nút chữ đứng sát thẻ khác)', G.dichChuoi('  Việc tối nay ') === '  Tonight’s task ', JSON.stringify(G.dichChuoi('  Việc tối nay ')));
kiem('khoảng trắng giữa câu không làm trượt khoá', G.dichChuoi('Việc   tối\n nay') === 'Tonight’s task', G.dichChuoi('Việc   tối\n nay'));
kiem('chuỗi không có trong từ điển trả nguyên văn (không dịch nửa vời)', G.dichChuoi('Một câu không ai dịch cả') === 'Một câu không ai dịch cả');
kiem('chuỗi không dấu không bị đụng', G.dichChuoi('GITA 365') === 'GITA 365');
kiem('tên người không bị dịch', G.dichChuoi('Trần Quốc Bảo') === 'Trần Quốc Bảo');

/* ── Từ điển ── */
const khoa = Object.keys(D);
const demN = s => (String(s).match(/\{n\}/g) || []).length;
const lechN = khoa.filter(k => demN(G.khoaDich(k)) !== demN(D[k]));
kiem('mỗi bản dịch mang đúng số chỗ {n} như khoá (không rơi, không thừa con số)', lechN.length === 0, lechN.slice(0, 5).join(' | '));
const rong = khoa.filter(k => typeof D[k] !== 'string' || !D[k].trim());
kiem('không bản dịch nào rỗng', rong.length === 0, rong.slice(0, 5).join(' | '));
const conDau = khoa.filter(k => CO_DAU.test(D[k]));
kiem('bản dịch không còn chữ tiếng Việt', conDau.length === 0, conDau.slice(0, 5).map(k => D[k]).join(' | '));
const gap = {}; const trung = [];
khoa.forEach(k => { const c = G.khoaDich(k); if (gap[c] !== undefined && gap[c] !== D[k]) trung.push(k); gap[c] = D[k]; });
kiem('hai khoá cùng dạng chuẩn không mang hai bản dịch khác nhau', trung.length === 0, trung.slice(0, 5).join(' | '));
kiem('từ điển có ít nhất 900 khoá', khoa.length >= 900, String(khoa.length));

/* ── Bộ quét DOM: chặn đúng lỗi đã gặp ── */
const nguon = fs.readFileSync(ROOT + '/src/dich-giao-dien.js', 'utf8');
kiem('quét thuộc tính tính cả CHÍNH thẻ gốc (nút thêm nguyên chiếc vẫn được dịch)', /\[goc\]\.concat\(/.test(nguon));
kiem('nghe đổi thuộc tính (nút lùi/tới đổi aria-label sau lượt vẽ)', /attributes:\s*true/.test(nguon) && /attributeFilter:\s*THUOC_TINH/.test(nguon));
kiem('không nghe characterData (lượt dịch không tự kích chính nó)', !/characterData:\s*true/.test(nguon));
kiem('chỉ chạy khi chọn tiếng Anh', /G\.LANG !== 'en'/.test(nguon));
kiem('bỏ qua ô nhập và vùng gắn data-khong-dich', /TEXTAREA: 1/.test(nguon) && /data-khong-dich/.test(nguon) && /isContentEditable/.test(nguon));
const app = fs.readFileSync(ROOT + '/src/app.js', 'utf8');
kiem('mỗi lượt vẽ gọi bộ dịch trên vùng nội dung', /G\.dichDom\)\s*G\.dichDom\(main\)/.test(app));

console.log('\n' + dat + ' đạt · ' + truot + ' trượt');
if (PHA) { console.log(truot > 0 ? '✓ phá thử: phép đo đỏ đúng chỗ' : '✗ phá thử mà vẫn xanh — phép đo câm'); process.exit(truot > 0 ? 0 : 1); }
process.exit(truot ? 1 : 0);
