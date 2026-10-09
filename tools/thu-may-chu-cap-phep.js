/* ═══════════════════════════════════════════════════════════════
   GITA 365 — THỬ MÁY CHỦ CẤP PHÉP

       node tools/thu-may-chu-cap-phep.js [đường/dẫn/tới/src-v69]

   Chạy server/GITA_CapPhep.gs trong một môi trường giả lập Apps Script,
   nạp ROLES thật từ 00_Config.gs của hệ thống v6.9, rồi kiểm bốn việc:

     1. Phiên hỏng, token của người khác, tài khoản đã khoá  → không cấp
     2. Mỗi vai chỉ nhận đúng những gói được cấp, không hơn một gói
     3. Phụ huynh chỉ mở tới đúng tầng con đang học
     4. Xin khoá quá trần trong một giờ thì bị chặn

   Không cần mạng, không cần Google. Chạy trước khi dán lên Apps Script.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
const fs = require('fs');
const path = require('path');

const GOC = path.join(__dirname, '..');

/* Danh sách gói lấy từ chính thư mục kho/ — kho/*.enc là bản phát hành
   thật, và nó không phụ thuộc kho/khoa.json (tệp ấy nằm trong
   .gitignore, nên máy nào không có khoá vẫn chạy được bộ thử này).

   Trước 9.73 danh sách này gõ tay ở BA chỗ trong tệp: bộ khoá giả của
   PropertiesService, lượt xin mặc định, và bảng kỳ vọng. Cả ba đều
   dừng ở bảy gói, còn kho đã có tám từ bản 9.46. */
const GOI_DU = fs.readdirSync(path.join(GOC, 'kho'))
  .filter(f => /\.enc$/.test(f)).map(f => f.replace(/\.enc$/, '')).sort();

const V69 = process.argv[2] ||
  '/tmp/claude-0/-home-user-Quang-GITA/0c18496f-dc69-5c66-b565-ec9d18e49341/scratchpad/v69/GITA365_v69/src';

if (!fs.existsSync(path.join(V69, '00_Config.gs'))) {
  console.error('Không tìm thấy 00_Config.gs trong: ' + V69);
  console.error('Chạy lại và chỉ đường tới thư mục src của bản v6.9.');
  process.exit(1);
}

/* ─── ROLES thật, lấy nguyên từ hệ thống v6.9 ─── */
const cfg = fs.readFileSync(path.join(V69, '00_Config.gs'), 'utf8');
const mR = cfg.match(/var ROLES\s*=\s*(\{[\s\S]*?\n\});/);
if (!mR) { console.error('Không đọc được ROLES từ 00_Config.gs'); process.exit(1); }
const ROLES = eval('(' + mR[1] + ')');

/* ─── Dữ liệu giả lập ─── */
const BANG = {
  users: [
    { id:'U1', username:'superadmin@gita365.vn', role:'R01', active:'TRUE', studentId:'' },
    { id:'U2', username:'coach@gita365.vn',      role:'R07', active:'TRUE', studentId:'' },
    { id:'U3', username:'tuvan@gita365.vn',      role:'R11', active:'TRUE', studentId:'' },
    { id:'U4', username:'phuhuynh@gita365.vn',   role:'R13', active:'TRUE', studentId:'S1' },
    { id:'U5', username:'hocvien@gita365.vn',    role:'R14', active:'TRUE', studentId:'S2' },
    { id:'U6', username:'daisu@gita365.vn',      role:'R15', active:'TRUE', studentId:'' },
    { id:'U7', username:'nghi@gita365.vn',       role:'R07', active:'FALSE', studentId:'' },
    { id:'U8', username:'chuavao@gita365.vn',    role:'R13', active:'TRUE', studentId:'S3' },
    { id:'U9', username:'bikhoa@gita365.vn',     role:'R13', active:'TRUE', studentId:'S4' }
  ],
  students: [
    { id:'S1', tier:3, status:'active' },
    { id:'S2', tier:5, status:'active' },
    { id:'S3', tier:0, status:'active' },
    { id:'S4', tier:2, status:'locked' }
  ]
};
const PHIEN = {};                 // token → session
const NHAT_KY = [];
const BO_NHO = {};                // CacheService

function moPhien(username) {
  const nd = BANG.users.filter(x => x.username === username)[0];
  const tk = 'TK-' + username;
  PHIEN[tk] = { uid: nd.id, username: nd.username, role: nd.role,
    portal: (ROLES[nd.role] || {}).portal, studentId: nd.studentId,
    exp: Date.now() + 3600e3 };
  return tk;
}

/* ─── Giả lập Apps Script vừa đủ ─── */
const moiTruong = {
  ROLES,
  Store: { find: (bang, id) => (BANG[bang] || []).filter(x => x.id === id)[0] || null },
  readSession_: t => { const s = PHIEN[t]; return (s && s.exp > Date.now()) ? s : null; },
  audit_: (s, act, tgt, ct) => NHAT_KY.push({ u: s && s.username, act, tgt, ct }),
  isTrue: v => String(v).toUpperCase() === 'TRUE' || v === true,
  Logger: { log: () => {} },
  CacheService: { getScriptCache: () => ({
    get: k => (BO_NHO[k] === undefined ? null : BO_NHO[k]),
    put: (k, v) => { BO_NHO[k] = v; }
  }) },
  PropertiesService: { getScriptProperties: () => ({
    /* Bộ khoá giả dựng từ GOI_DU: thiếu một gói ở đây là máy chủ
       không cấp được gói ấy, và phép đo báo đỏ vì BỘ THỬ thiếu chứ
       không vì máy chủ sai — đúng thứ đã xảy ra với nghe-cao. */
    getProperty: () => JSON.stringify(GOI_DU.reduce(
      (o, g) => { o[g] = 'K-' + g; return o; }, {}))
  }) },
  ContentService: { MimeType: { JSON: 'json' },
    createTextOutput: t => ({ _t: t, setMimeType(){ return this; }, getContent(){ return this._t; } }) }
};

/* NẠP TỆP ĐANG THỬ, CỘNG TỆP NÓ PHỤ THUỘC.

   Trước 9.73 chỗ này đọc đúng GITA_CapPhep.gs. Nhưng từ bản 9.46 hàm
   gitaPhamViCapPhep() gọi gitaXkBacCoach_(), mà hàm ấy ở
   GITA_XemKhach.gs — không được nạp, nên mọi vai NGHỀ ném lỗi và ba
   dòng Super Admin · Coach · Tư vấn báo đỏ với ô chi tiết TRỐNG.

   Ô trống ấy là chỗ đáng nói: phép đo đỏ mà không nói được vì sao,
   nên người đọc dễ cho là "máy chủ chưa dựng xong" rồi bỏ qua. Ba
   dòng đỏ ấy đã đứng như thế từ 9.46 tới nay.

   Tôi đã thử nạp CẢ thư mục và hỏng nặng hơn, hai lần:
     · xếp theo bảng chữ cái thì GITA_XemKhach.gs đứng sau và cướp mất
       doPost — khai hàm thì bản sau đè bản trước;
     · xếp lại thứ tự vẫn đỏ hết, vì bộ giả lập ở tệp này dựng vừa đủ
       cho phần cấp phép, còn các tệp khác đụng những API chưa giả lập.
   Nới bộ giả lập cho cả thư mục là dựng lại tools/thu-may-chu.js lần
   thứ hai, mà hai bộ giả lập cho một máy chủ thì sẽ có ngày lệch nhau.

   Nên hai tên dưới đây vẫn gõ tay — nhưng chúng gõ một PHỤ THUỘC cụ
   thể chứ không gõ lại một thứ đã có nguồn, khác hẳn ba chỗ vừa sửa.
   Ngày GITA_CapPhep.gs gọi thêm hàm ở tệp thứ ba thì nó ném lỗi kèm
   đúng tên hàm còn thiếu. */
const dsGs = ['GITA_XemKhach.gs', 'GITA_CapPhep.gs'];
const nguon = dsGs
  .map(f => fs.readFileSync(path.join(GOC, 'server', f), 'utf8')).join('\n;\n');

const ten = Object.keys(moiTruong);
/* doGet nay là bộ định tuyến trong GITA_BanWeb.gs; hàm trả JSON tình trạng đã
   đổi tên thành gitaTrangThai_ vì Apps Script chỉ cho phép một doGet. */
const TRA = '; return { doPost: doPost, kiemTraPhien_: kiemTraPhien_, '
  + 'gitaPhamViCapPhep: gitaPhamViCapPhep, '
  + 'doGet: (typeof gitaTrangThai_ === "function" ? gitaTrangThai_ : function(){}) };';
const chay = new Function(...ten, nguon + TRA);
const S = chay(...ten.map(k => moiTruong[k]));

function xin(token, u, goi) {
  const r = S.doPost({ postData: { contents: JSON.stringify({
    fn: 'capKhoa', token, u, goi: goi || GOI_DU,
    may: 'may-thu' }) } });
  return JSON.parse(r.getContent());
}

let loi = 0;
const bao = (ok, ten, ct) => { if (!ok) loi++; console.log((ok ? '  ✓ ' : '  ✗ ') + ten + (ct ? ' — ' + ct : '')); };
const goi = d => Object.keys(d.khoa || {}).sort().join(' ');

console.log('\nTHỬ MÁY CHỦ CẤP PHÉP — chạy với ROLES thật của v6.9\n');

console.log('1 · XÁC THỰC');
bao(!xin('token-bia', 'superadmin@gita365.vn').ok, 'token bịa không cấp khoá');
bao(!xin('', 'superadmin@gita365.vn').ok, 'không có token thì không cấp khoá');
{
  const tk = moPhien('phuhuynh@gita365.vn');
  const d = xin(tk, 'superadmin@gita365.vn');
  bao(!d.ok && d.code === 'AUTH', 'không mượn được token của người khác', d.code || '');
}
{
  const tk = moPhien('nghi@gita365.vn');
  const d = xin(tk, 'nghi@gita365.vn');
  bao(!d.ok && d.code === 'LOCKED', 'tài khoản đã nghỉ thì không cấp khoá', d.code || '');
}
{
  const tk = moPhien('bikhoa@gita365.vn');
  const d = xin(tk, 'bikhoa@gita365.vn');
  bao(!d.ok && d.code === 'LOCKED', 'hồ sơ học viên bị khoá thì không cấp khoá', d.code || '');
}

console.log('\n2 · PHẠM VI THEO VAI');
/* GÓI NGHỀ CAO — MANG HỒ SƠ KHÁCH TẦNG 4-5.
   Bảng này viết TAY chứ không suy từ mã đang được thử: suy ra từ nó
   thì phép đo chỉ còn hỏi "mã có bằng chính nó không". Chủ hệ chốt
   tầng 4-5 chỉ từ Coach lên tới Super Admin, nên:
     Super Admin (bậc 1) và Coach (bậc 7) CÓ nghe-cao
     Tư vấn (bậc 11) KHÔNG — bậc cao hơn bậc Coach
   Ba dòng này trước 9.73 đều thiếu nghe-cao và đều báo đỏ. */
const CHO = {
  'superadmin@gita365.vn': 'nen nghe nghe-cao tang1 tang2 tang3 tang4 tang5',
  'coach@gita365.vn':      'nen nghe nghe-cao tang1 tang2 tang3 tang4 tang5',
  'tuvan@gita365.vn':      'nen nghe tang1 tang2 tang3 tang4 tang5',
  'phuhuynh@gita365.vn':   'nen tang1 tang2 tang3',
  'hocvien@gita365.vn':    'nen tang1 tang2 tang3 tang4 tang5',
  'daisu@gita365.vn':      'nen',
  'chuavao@gita365.vn':    'nen'
};
Object.keys(CHO).forEach(u => {
  const d = xin(moPhien(u), u);
  const co = goi(d);
  bao(d.ok && co === CHO[u], u.padEnd(26) + ROLES[BANG.users.filter(x=>x.username===u)[0].role].short, co);
});

console.log('\n3 · KHÔNG XIN ĐƯỢC QUÁ PHẠM VI');
{
  const u = 'phuhuynh@gita365.vn';
  const d = xin(moPhien(u), u, GOI_DU);
  bao(!d.khoa.nghe, 'phụ huynh xin kho nghề vẫn không được cấp');
  bao(!d.khoa['nghe-cao'], 'phụ huynh xin gói NGHỀ CAO cũng không được cấp');
  bao(!d.khoa.tang4 && !d.khoa.tang5, 'phụ huynh không lấy được tầng con chưa học');
}
{
  const u = 'daisu@gita365.vn';
  const d = xin(moPhien(u), u);
  bao(Object.keys(d.khoa).length === 1, 'cộng tác viên chỉ nhận đúng một gói nền', goi(d));
}

console.log('\n4 · CHẶN RÚT KHOÁ HÀNG LOẠT');
{
  const u = 'coach@gita365.vn';
  const tk = moPhien(u);
  let chan = 0, dat = 0;
  for (let i = 0; i < 20; i++) { const d = xin(tk, u); if (d.ok) dat++; else if (d.code === 'RATE') chan++; }
  bao(dat <= 12 && chan >= 8, 'quá trần 12 lượt/giờ thì bị chặn', dat + ' lượt cấp · ' + chan + ' lượt chặn');
}

console.log('\n5 · NHẬT KÝ');
bao(NHAT_KY.length > 0, 'mọi lượt cấp khoá đều để lại dấu vết', NHAT_KY.length + ' dòng');
bao(NHAT_KY.some(x => x.act === 'CAP_KHOA_CHAN'), 'lượt bị chặn cũng được ghi lại');

console.log('\n6 · KIỂM SỐNG');
{
  const d = JSON.parse(S.doGet().getContent());
  bao(d.ok && d.daNapKhoa === GOI_DU.length,
    'doGet báo đúng số gói khoá đã nạp (' + GOI_DU.length + '), không lộ khoá nào',
    d.daNapKhoa + ' gói · không có trường khoá: ' + (d.khoa === undefined));
}

console.log('\n' + (loi ? '✗ CÒN ' + loi + ' ĐIỂM CHƯA ĐẠT' : '✓ TOÀN BỘ ĐẠT — dán lên Apps Script được'));
process.exit(loi ? 1 : 0);
