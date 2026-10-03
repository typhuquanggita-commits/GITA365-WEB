/* Thử đường gửi thư của Worker (may-chu/thu.js) với fetch giả lập:
   cầu nối Gmail, rơi sang Resend, và báo lỗi khi không có đường nào.
   Chạy: node tools/thu-gui-thu.mjs */
import { guiThu, duongGuiThu, thuGuiThu } from '../may-chu/thu.js';

let hong = 0, dat = 0;
function kiem(ten, dk) { if (dk) dat++; else { hong++; console.error('HỎNG:', ten); } }

const goi = [];
let traLoi = () => new Response('{"ok":true}', {status: 200});
globalThis.fetch = async (url, opt) => { goi.push({url: String(url), opt}); return traLoi(String(url), opt); };
const tatLog = console.error; console.error = () => {};

const URL_GS = 'https://script.google.com/macros/s/ABC/exec';
const envGmail = {GITA_CAU_NOI_GMAIL: URL_GS, GITA_KHOA_CAU_NOI: 'k'.repeat(64),
  GITA_THU_TRA_LOI: 'typhuquanggita@gmail.com'};
const envCaHai = {...envGmail, GITA_KHOA_THU: 're_x', GITA_THU_GUI_TU: 'GITA 365 <a@vi-du.test>'};
const thu = {den: 'nguoi@vi-du.test', tieuDe: 'Mã', than: 'Mã: 123456'};

// 1. Thứ tự đường gửi
kiem('không cấu hình → rỗng', duongGuiThu({}).length === 0);
kiem('chỉ gmail', duongGuiThu(envGmail).map(d => d.ten).join() === 'gmail');
kiem('gmail trước resend', duongGuiThu(envCaHai).map(d => d.ten).join() === 'gmail,resend');
kiem('resend thiếu FROM → bỏ', duongGuiThu({GITA_KHOA_THU: 'x'}).length === 0);

// 2. Gmail thành công, đúng nội dung gói
goi.length = 0;
kiem('gmail trả true', await guiThu(envGmail, {...thu, batBuoc: true}) === true);
kiem('gọi đúng một lần tới cầu nối', goi.length === 1 && goi[0].url === URL_GS);
const goiTin = JSON.parse(goi[0].opt.body);
kiem('gói có khoá/den/traLoi', goiTin.khoa === envGmail.GITA_KHOA_CAU_NOI &&
  goiTin.den === thu.den && goiTin.traLoi === 'typhuquanggita@gmail.com' && goiTin.than === thu.than);
kiem('redirect follow', goi[0].opt.redirect === 'follow');

// 3. Gmail từ chối → rơi sang Resend
goi.length = 0;
traLoi = (url) => url === URL_GS
  ? new Response('{"ok":false,"error":"Hết hạn mức"}', {status: 200})
  : new Response('{"id":"1"}', {status: 200});
kiem('rơi sang resend thành công', await guiThu(envCaHai, {...thu, batBuoc: true}) === true);
kiem('gọi gmail rồi resend', goi.length === 2 && goi[1].url === 'https://api.resend.com/emails');
kiem('resend có reply_to', JSON.parse(goi[1].opt.body).reply_to === 'typhuquanggita@gmail.com');

// 4. Gmail trả trang HTML (sai URL/chưa cấp quyền) → coi là hỏng
traLoi = () => new Response('<html>đăng nhập</html>', {status: 200});
let loi = null;
try { await guiThu(envGmail, {...thu, batBuoc: true}); } catch (e) { loi = e; }
kiem('HTML → ném lỗi khi batBuoc', loi && /Cầu nối Gmail/.test(loi.message));
kiem('HTML → false khi không batBuoc', await guiThu(envGmail, thu) === false);

// 5. Không có đường gửi
loi = null;
try { await guiThu({}, {...thu, batBuoc: true}); } catch (e) { loi = e; }
kiem('không đường + batBuoc → ném', loi && /chưa cấu hình đường gửi thư/.test(loi.message));
kiem('không đường, không batBuoc → false', await guiThu({}, thu) === false);

// 6. Chế độ thử GHI_THU không gọi mạng
goi.length = 0;
const ghi = [];
kiem('GHI_THU ghi lại', await guiThu({...envGmail, GHI_THU: ghi}, thu) === true && ghi.length === 1 && goi.length === 0);

// 7. thuGuiThu: chỉ R01, người nhận cố định
traLoi = () => new Response('{"ok":true}', {status: 200});
kiem('không R01 → CHIR01', (await thuGuiThu({}, envGmail, null, {role: 'R02'})).code === 'CHIR01');
goi.length = 0;
const kq = await thuGuiThu({den: 'ke-la@vi-du.test'}, envGmail, null, {role: 'R01'});
kiem('R01 → ok, gửi tới hòm chủ hệ', kq.ok === true && kq.den === 'typhuquanggita@gmail.com' &&
  JSON.parse(goi[0].opt.body).den === 'typhuquanggita@gmail.com');
const kq2 = await thuGuiThu({}, {GITA_THU_TRA_LOI: 'typhuquanggita@gmail.com'}, null, {role: 'R01'});
kiem('R01 không đường → ok:false có lời', kq2.ok === false && /chưa cấu hình/.test(kq2.error));

// 8. Hộp thư GitHub — chỉ cho hòm chủ hệ, đứng trước Gmail
const envGh = {...envGmail, GITA_GH_KHOA_THU: 'github_pat_x', GITA_GH_HOP_THU: 'typhuquanggita-commits/gita365-hop-thu',
  GITA_THU_DOANH_THU: 'typhuquanggita@gmail.com'};
kiem('gh: hòm chủ hệ → github trước gmail', duongGuiThu(envGh, 'TyPhuQuangGita@gmail.com ').map(d => d.ten).join() === 'github,gmail');
kiem('gh: người lạ → không github', duongGuiThu(envGh, 'khach@vi-du.test').map(d => d.ten).join() === 'gmail');
kiem('gh: thiếu khoá → không github', duongGuiThu({...envGh, GITA_GH_KHOA_THU: ''}, 'typhuquanggita@gmail.com').map(d => d.ten).join() === 'gmail');
goi.length = 0;
traLoi = () => new Response(null, {status: 204});
kiem('gh: gửi ok', await guiThu(envGh, {den: 'typhuquanggita@gmail.com', tieuDe: 'Mã\nbảo mật', than: 'Mã: 654321', batBuoc: true}) === true);
const g0 = goi[0] || {opt: {headers: {}}};
const bodyGh = JSON.parse(g0.opt.body || '{}');
kiem('gh: đúng URL dispatches', g0.url === 'https://api.github.com/repos/typhuquanggita-commits/gita365-hop-thu/dispatches');
kiem('gh: header Bearer + UA', g0.opt.headers.Authorization === 'Bearer github_pat_x' && !!g0.opt.headers['User-Agent']);
kiem('gh: payload sạch', bodyGh.event_type === 'thu' && bodyGh.client_payload.tieuDe === 'Mã bảo mật' && bodyGh.client_payload.than === 'Mã: 654321');
kiem('gh: một lượt gọi', goi.length === 1);
goi.length = 0;
traLoi = (url) => url.startsWith('https://api.github.com') ? new Response('Bad credentials', {status: 401}) : new Response('{"ok":true}', {status: 200});
kiem('gh hỏng → rơi sang gmail', await guiThu(envGh, {den: 'typhuquanggita@gmail.com', tieuDe: 'x', than: 'y', batBuoc: true}) === true &&
  goi.length === 2 && goi[1].url === URL_GS);
goi.length = 0;
kiem('gh: khách không đi github', await guiThu(envGh, {...thu, batBuoc: true}) === true && goi.length === 1 && goi[0].url === URL_GS);
let loiKho = null;
try { await guiThu({GITA_GH_KHOA_THU: 'x', GITA_GH_HOP_THU: '../x', GITA_THU_TRA_LOI: 'a@b.c'}, {den: 'a@b.c', tieuDe: 't', than: 'b', batBuoc: true}); } catch (e) { loiKho = e; }
kiem('gh: tên kho sai dạng → lỗi', loiKho && /sai dạng/.test(loiKho.message));
const kq3 = await thuGuiThu({}, {GITA_THU_TRA_LOI: 'typhuquanggita@gmail.com', GITA_GH_KHOA_THU: 'k', GITA_GH_HOP_THU: 'a/b'}, null, {role: 'R01'});
kiem('thuGuiThu báo đường github', Array.isArray(kq3.duong) && kq3.duong.includes('github'));

console.error = tatLog;
console.log(`thu-gui-thu: ${dat} đạt, ${hong} hỏng`);
process.exit(hong ? 1 : 0);
