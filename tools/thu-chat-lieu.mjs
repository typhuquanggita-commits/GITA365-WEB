/* Thử Kho chất liệu cốt truyện (9.99.255): dựng đoạn chất liệu từ
   kho/mau.json cho cả 5 tầng, soát qua cổng Điều 13 và kiểm máy chủ
   chèn đúng khối SOURCE MATERIAL. Chạy: node tools/thu-chat-lieu.mjs */
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { dungDauVao } from '../may-chu/phim-ai.js';
import { soatRaNgoai } from '../may-chu/bo-nao.js';

const goc = new URL('..', import.meta.url);
const mau = JSON.parse(readFileSync(new URL('kho/mau.json', goc), 'utf8'));
const window = { G: Object.assign({}, mau) };
vm.runInNewContext(readFileSync(new URL('src/xuong-phim-chat-lieu.js', goc), 'utf8'), { window });
const G = window.G;

let dat = 0, hong = 0;
function kt(ten, ok, them) { if (ok) dat++; else { hong++; console.log('✗', ten, them || ''); } }

const VAN_DE = ['', 'Con nghiện điện thoại, mẹ nhắc mãi không nghe, hai mẹ con cãi nhau',
  'Nhà khó khăn về tiền, bố mẹ mệt mỏi, không biết bắt đầu từ đâu',
  'Con học sa sút, mất động lực, không muốn đi học'];
const CAP = { T1: '1.3', T2: '2.4', T3: '3.5', T4: '4.2', T5: '5.9' };
for (const T of Object.keys(CAP)) {
  for (const v of VAN_DE) {
    const d = G.xpClDoan({ tang: T, cap: CAP[T], vanDe: v });
    const nhan = T + ' "' + v.slice(0, 20) + '"';
    kt(nhan + ' có nội dung', d.length > 1500, d.length);
    kt(nhan + ' ≤ 3900', d.length <= 3900, d.length);
    kt(nhan + ' đúng tầng', d.indexOf('· ' + T + ']') >= 0);
    kt(nhan + ' có sổ tay', d.indexOf('SỔ TAY GIA ĐÌNH') >= 0 && d.indexOf('mùa nào cũng qua') >= 0);
    kt(nhan + ' có câu hỏi thật', d.indexOf('CÂU HỎI THẬT') >= 0);
    kt(nhan + ' không lọt chữ khoá cấp phép', d.indexOf('cần cấp phép') < 0);
    const dong = d.split('\n'), sach = dong.filter(x => soatRaNgoai(x).sach);
    kt(nhan + ' máy chủ bỏ ≤ 3 dòng bị ngờ', dong.length - sach.length <= 3, dong.length - sach.length);
    kt(nhan + ' phần còn lại qua cổng Điều 13', soatRaNgoai(sach.join('\n')).sach);
    const l = dungDauVao('llm', { che: 'boPhim', keys: [], capMa: CAP[T], hanhTrinh: 'cap', chatLieu: d });
    kt(nhan + ' cả gói soát của máy chủ sạch', soatRaNgoai(JSON.stringify(l.soat)).sach);
    kt(nhan + ' tóm tắt', G.xpClTomTat({ tang: T, cap: CAP[T], vanDe: v }).length >= 5);
  }
}
const d1 = G.xpClDoan({ tang: 'T2', vanDe: 'con nghiện điện thoại cãi nhau' });
const d2 = G.xpClDoan({ tang: 'T2', vanDe: 'nhà khó khăn về tiền' });
kt('chọn theo vấn đề khác nhau', d1 !== d2);

const kinh = 'x'.repeat(400);
const a = dungDauVao('llm', { che: 'boPhim', keys: [], capMa: '2.4', hanhTrinh: 'cap 2.4', chatLieu: d1 });
kt('boPhim chèn SOURCE MATERIAL', a.dauVao && a.dauVao.prompt.indexOf('SOURCE MATERIAL') >= 0 && a.dauVao.prompt.indexOf('mùa nào cũng qua') >= 0);
kt('boPhim soát cả chất liệu', a.soat && a.soat.chatLieu.length > 1500 && a.dauVao.prompt.indexOf(a.soat.chatLieu) >= 0);
const bay = dungDauVao('llm', { che: 'tap', kinh, soTap: 2, chatLieu: 'dòng sạch về mùa đông\ncon Nguyễn Văn An 8 tuổi lớp 3' });
kt('dòng mang tên người bị bỏ', bay.dauVao.prompt.indexOf('Nguyễn') < 0 && bay.dauVao.prompt.indexOf('mùa đông') >= 0);
const b = dungDauVao('llm', { che: 'duyetKinh', kinh, chatLieu: d1 });
kt('duyetKinh chèn chất liệu', b.dauVao.prompt.indexOf('SOURCE MATERIAL') >= 0);
const c = dungDauVao('llm', { che: 'tap', kinh, soTap: 10, chatLieu: d1 });
kt('tập 10 khép bằng dòng sổ tay', c.dauVao.prompt.indexOf('handbook opening line') >= 0);
const c2 = dungDauVao('llm', { che: 'tap', kinh, soTap: 3 });
kt('không chất liệu thì không chèn', c2.dauVao.prompt.indexOf('SOURCE MATERIAL') < 0);
const p = dungDauVao('llm', { kichBan: 'Một kịch bản ngắn đủ ba mươi ký tự để thử.', chatLieu: d1 });
kt('phân cảnh thường không nhận chất liệu', p.dauVao.prompt.indexOf('SOURCE MATERIAL') < 0);
const dai = dungDauVao('llm', { che: 'tap', kinh, soTap: 2, chatLieu: 'y'.repeat(9000) });
kt('chất liệu cắt ở 4000', dai.dauVao.prompt.length < 400 + 4000 + 1000);

console.log('Mẫu T2:\n' + d1.slice(0, 1200) + '\n…');
console.log(hong ? '✗ ' + hong + ' hỏng, ' + dat + ' đạt' : '✓ ' + dat + '/' + dat + ' đạt');
process.exit(hong ? 1 : 0);
