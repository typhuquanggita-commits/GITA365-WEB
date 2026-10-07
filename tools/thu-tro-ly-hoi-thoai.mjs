/* Thử LỚP HỘI THOẠI của trợ lý (src/tro-ly-hoi-thoai.js · V50·168)
   Khoá lại lời chủ hệ 07/10/2026: trợ lý phải nghe như một tư vấn viên —
   "xin chào" không bị đem đi chẩn đoán, mỗi lượt MỘT câu hỏi, không đổ tư
   liệu chưa cần — và phân biệt rõ vai: phụ huynh · học viên · đại sứ ·
   nhân sự, mỗi vai một cách xử lý, chỉ trỏ tới màn vai ấy mở được.
   Chạy trong Node bằng vm, không cần trình duyệt.
   Dùng: node tools/thu-tro-ly-hoi-thoai.mjs */
import fs from 'node:fs';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
const ROOT = fileURLToPath(new URL('..', import.meta.url)).replace(/[\\/]$/, '');
const MA = fs.readFileSync(ROOT + '/src/tro-ly-hoi-thoai.js', 'utf8');

const VIEWS = ['lo-trinh', 'ban-do', 'hom-nay', 'nhiem-vu', 'ngoi-nha', 'vi-credit', 'ket-noi', 'hoa-hong', 'kpi-toi', 'bang-viec', 'toan-canh-tc', 'tt-cskh', 'crm', 'coach-dp', 'kn-pp'];
function dung(role, lv, khach, cam) {
  cam = cam || [];
  const G = {
    S: { role, roleObj: { id: role, n: 'Vai ' + role, lv }, acc: { ten: 'Trần Quốc Bảo', nha: 'Nhà Minh An', tang: 2 } },
    LA_KHACH: () => khach,
    myFamily: () => ({ nha: 'Chưa mở hồ sơ', tier: 1 }),
    tierOf: (t) => ({ code: 'T' + t, name: 'Tầng ' + t }),
    kpiCuaToi: () => 40,
    KPI_XIN_THEM: 80,
    VIEWS: Object.fromEntries(VIEWS.map(v => [v, () => ''])),
    allowed: (v) => cam.indexOf(v) < 0,
    navItem: (v) => ({ t: 'Màn ' + v }),
    v50HubsVai: () => [{ ten: 'Bàn làm việc' }, { ten: 'Kho nghề' }],
    U: { h: (s) => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]) }
  };
  const ctx = { window: { G }, String, RegExp, Array, Math, Object };
  vm.createContext(ctx);
  vm.runInContext(MA, ctx);
  return G;
}

let dat = 0, sai = 0;
const thu = (ten, ok) => { if (ok) { dat++; console.log('  ✓ ' + ten); } else { sai++; console.log('  ✗ ' + ten); } };
const demHoi = (html) => (html.match(/class="kb-hoi"/g) || []).length;

console.log('Nghe loại câu');
let G = dung('R13', 13, true);
const L = (c) => (G.htLoaiCau(c) || {}).loai || null;
thu('"xin chào" là câu chào, không phải chuyện cần chẩn đoán', L('xin chào') === 'chao' && L('Xin chào ạ!') === 'chao' && L('chào em') === 'chao');
thu('cảm ơn · ok · tạm biệt · khen', L('cảm ơn em') === 'camOn' && L('ok') === 'dongY' && L('tạm biệt') === 'tamBiet' && L('hay quá') === 'khen');
thu('"Được, tối nay làm" là đồng ý', L('Được, tối nay làm') === 'dongY' && L('được tối nay em làm') === 'dongY');
thu('chê được nhận ra', L('trả lời lan man quá') === 'che' && L('máy móc quá') === 'che');
const ck = G.htLoaiCau('Chào em, con mình ôm điện thoại cả tối');
thu('chào kèm chuyện: giữ phần chuyện, không đánh rơi', ck && ck.loai === 'chaoKem' && /ôm điện thoại/.test(ck.conLai));
thu('một chuyện thật không bị đọc thành xã giao', L('con tôi hay cáu khi bị nhắc học') === null);
thu('gõ nhầm là vô nghĩa, chuyện thật thì không', G.htVoNghia('abc') && G.htVoNghia('k') && !G.htVoNghia('con ôm điện thoại'));

console.log('Suy luận theo nhóm vai');
thu('phụ huynh hỏi học phí', G.htSuyLuan('học phí bao nhiêu vậy em') === 'hocPhi');
thu('phụ huynh hỏi chặng · lên chặng · hôm nay', G.htSuyLuan('nhà mình đang ở chặng nào') === 'chang' && G.htSuyLuan('khi nào thì lên chặng sau') === 'lenChang' && G.htSuyLuan('hôm nay nhà mình nên làm việc gì') === 'homNay');
let GD = dung('R15', 15, true);
thu('đại sứ hỏi hoa hồng · giới thiệu', GD.htSuyLuan('hoa hồng của tôi tính thế nào') === 'hoaHong' && GD.htSuyLuan('tôi muốn giới thiệu một gia đình') === 'gioiThieu');
let GN = dung('R07', 7, false);
thu('nhân sự hỏi KPI · quyền · quy trình tiền', GN.htSuyLuan('KPI của tôi tháng này tính thế nào') === 'kpiToi' && GN.htSuyLuan('tôi có được xem nhà khác không') === 'quyenHan' && GN.htSuyLuan('quy trình chốt lương') === 'taiChinh');
thu('nhân sự hỏi "học phí" không bị trả lời bằng giọng phụ huynh', GN.htSuyLuan('học phí tầng 2') === null);

console.log('Trả lời thẳng · đúng vai · đúng giới hạn');
const hp = G.htTraLoiThang('hocPhi', null);
thu('phụ huynh: học phí đi qua Tư vấn, có số gọi, không bịa con số', hp.nut.some(n => n.tel) && !/\d{3}\.\d{3}|\d+ ?(triệu|đồng)/.test(hp.chinh));
let GH = dung('R14', 14, true);
const hpHV = GH.htTraLoiThang('hocPhi', null);
thu('học viên: không nói chuyện tiền với em, trỏ về bố mẹ', /bố mẹ/.test(hpHV.chinh) && !(hpHV.nut || []).some(n => n.tel));
let GC = dung('R13', 13, true, ['lo-trinh', 'ban-do']);
const hpC = GC.htTraLoiThang('hocPhi', null);
thu('B6: không bao giờ trỏ tới màn vai ấy không mở được', !hpC.nut.some(n => n.v === 'lo-trinh' || n.v === 'ban-do'));
const tcC = GN.htTraLoiThang('taiChinh', null);
thu('nhân sự chưa được cấp tài chính: nói rõ giới hạn và ai cấp', dung('R07', 7, false, ['toan-canh-tc']).htTraLoiThang('taiChinh', null).chinh.indexOf('Super Admin') >= 0 && /Toàn cảnh|Màn toan-canh-tc/.test(tcC.chinh));
const qh = GN.htTraLoiThang('quyenHan', null);
thu('nhân sự hỏi quyền: nêu vai, cấp, phạm vi', /cấp 7/.test(qh.chinh) && /phụ trách/.test(qh.chinh));

console.log('Xã giao như người');
const chao = G.htDapXaGiao('chao', {});
thu('phụ huynh chào: một câu đón, một câu hỏi, không chip, không tư liệu', chao.hoi && !(chao.chips || []).length && !chao.baiDoc && demHoi(G.htVe(chao)) === 1);
thu('học viên được gọi "em", không "anh chị"', /em/.test(GH.htDapXaGiao('chao', {}).hoi) && !/anh chị/.test(GH.htDapXaGiao('chao', {}).hoi));
thu('nhân sự chào: nói theo vai', /Vai R07/.test(GN.htDapXaGiao('chao', {}).chinh));
const dd = G.htDapXaGiao('dongY', { cau: 'ok', hoiDangDo: { hoi: 'Lúc nào?', chips: ['Tối'] } });
thu('"ok" giữa chuỗi: hỏi lại đúng câu đang dở', dd.hoi === 'Lúc nào?' && dd.chips[0] === 'Tối');

console.log('Một lượt gọn');
const viec = { ten: 'Điện thoại ra khỏi phòng', nhip: [{ ten: 'Tối nay', loi: 'Ra khỏi phòng, không phải úp xuống bàn.' }, { ten: 'Thấy gì', loi: 'Số lần bị ngắt tụt ngay tuần đầu.' }, { ten: 'Chỗ gãy', loi: 'Cuối tuần bù giờ.' }] };
const chuoi = { vong: { ma: 'BOICANH', no: 1 }, soVong: 5, hoi: 'Chuyện xảy ra vào lúc nào?', goiY: ['Buổi tối', 'Sáng sớm', 'Cuối tuần', 'Bất cứ lúc nào', 'Thừa'], khoanhDuoc: true };
const g1 = G.htGon({ chuoi, viec, nguon: [] }, { cau: 'Con ôm điện thoại', laCauMoi: true, baiDoc: { ten: 'Bài A', go: 'x', tom: 'Ý bài.' } });
const h1 = G.htVe(g1);
thu('lượt đầu: một việc nhỏ + đúng MỘT câu hỏi', /Điện thoại ra khỏi phòng/.test(g1.chinh) && demHoi(h1) === 1);
thu('lượt đầu: tối đa 4 lựa chọn, chưa đưa bài đọc', g1.chips.length === 4 && !g1.baiDoc);
thu('không lộ chữ nội bộ (kho · mã · trần 30%)', !/kho chưa|trần 30|khoChua|TINHHUONG|PHACDO/.test(h1));
const gChot = G.htGon({ chuoi: { vong: { ma: 'DO' }, soVong: 5, hoi: 'x', goiY: [] }, nguon: [] }, { cau: 'Số lần phải nhắc', laCauMoi: false, daTra: 5, daChon: ['a', 'b', 'c', 'Được, làm tối nay', 'Số lần phải nhắc'], viec, baiDoc: { ten: 'Bài A', go: 'x' } });
thu('hết chuỗi: chốt một việc · một con số · một bài đọc', gChot.chot && /Điện thoại ra khỏi phòng/.test(gChot.chinh) && /số lần phải nhắc/.test(gChot.chinh) && gChot.baiDoc);
const gHV = GH.htGon({ chuoi, viec, nguon: [] }, { cau: 'em mất tập trung', laCauMoi: true });
thu('học viên: không bị hỏi chuỗi chẩn đoán viết cho phụ huynh', !(gHV.chips || []).some(c => /Buổi tối/.test(c)) && !/con /i.test(gHV.hoi || ''));
const gDS = GD.htGon({ chuoi, viec, nguon: [] }, { cau: 'nhà bạn tôi con nghiện game', laCauMoi: true });
thu('đại sứ kể chuyện nhà khác: không chẩn đoán hộ, chuyển Tư vấn', gDS.moHo && gDS.nut.some(n => n.tel) && !(gDS.chips || []).length);
const gMo = G.htGon({ nguon: [] }, { cau: 'abc xyz', laCauMoi: true, moHoTruoc: true });
thu('hỏi mở hai lần chưa rõ: mời người thật, không hỏi lần ba', gMo.moHo && gMo.nut.some(n => n.tel));
const gt = G.htGiaiThem(viec);
thu('"chưa hiểu cách làm": giải thích hai nhịp kế của chính việc ấy', /ngắt tụt/.test(gt.chinh) && /bù giờ/.test(gt.chinh));

console.log('An toàn cho mọi trình duyệt');
const tep = fs.readdirSync(ROOT + '/src').filter(f => /^tro-ly-/.test(f));
const lookbehind = tep.filter(f => /[=(,:]\s*\/[^/\n]*\(\?<[=!]/.test(fs.readFileSync(ROOT + '/src/' + f, 'utf8')));
thu('không biểu thức lookbehind dạng chữ trong trợ lý (Safari < 16.4 không đọc được)', !lookbehind.length);

console.log('\n' + dat + ' đạt · ' + sai + ' sai');
process.exit(sai ? 1 : 0);
