/* ═══════════════════════════════════════════════════════════════
   GITA 365 · BẢN MÁY TÍNH — TIẾN TRÌNH CHÍNH
   Chạy hoàn toàn ngoại tuyến. Toàn bộ kho tri thức nằm trong ứng dụng.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
const { app, BrowserWindow, Menu, dialog, shell, protocol, net, ipcMain } = require('electron');
const path = require('node:path');
const fs = require('node:fs');
const url = require('node:url');
const mayChu = require('./may-chu');

const GOC = path.join(__dirname, 'app');
const DEV = !app.isPackaged;
const HO_SO = path.join(app.getPath('userData'), 'cua-so.json');
const GIAY_PHEP = path.join(app.getPath('userData'), 'giay-phep.json');
const MAY_KHACH = path.join(app.getPath('userData'), 'may-khach.json');
const NHATKY_CHU = path.join(app.getPath('userData'), 'nhat-ky-may-chu.jsonl');

/* Một origin ổn định cho dữ liệu trong máy — không dùng file:// */
protocol.registerSchemesAsPrivileged([{
  scheme: 'gita',
  privileges: { standard: true, secure: true, supportFetchAPI: true, stream: true }
}]);

/* ─────────── Nhớ vị trí và kích thước cửa sổ ─────────── */
function docHoSo() {
  try { return JSON.parse(fs.readFileSync(HO_SO, 'utf8')); } catch { return null; }
}
function ghiHoSo(win) {
  try {
    if (!win || win.isDestroyed()) return;
    const b = win.getNormalBounds ? win.getNormalBounds() : win.getBounds();
    fs.writeFileSync(HO_SO, JSON.stringify({ ...b, phongTo: win.isMaximized() }));
  } catch { /* không chặn việc đóng ứng dụng vì một tệp ghi hỏng */ }
}

let cuaSo = null;

/* ─────────── Giấy phép cục bộ ───────────
   Bản máy tính chạy ngoại tuyến nên khoá giải mã không lấy được từ máy chủ
   mỗi lần mở. Người vận hành đặt tệp giấy phép do Học viện GITA cấp vào
   thư mục dữ liệu; ứng dụng đọc, kiểm hạn, rồi đưa khoá vào phiên làm việc.
   Giấy phép KHÔNG nằm trong bộ cài — mỗi máy phải được cấp riêng. */
function docGiayPhep() {
  try {
    if (!fs.existsSync(GIAY_PHEP)) return null;
    const gp = JSON.parse(fs.readFileSync(GIAY_PHEP, 'utf8'));
    if (!gp || !gp.khoa || typeof gp.khoa !== 'object') return null;
    if (gp.hetHan && new Date(gp.hetHan).getTime() < Date.now()) {
      dialog.showMessageBox({ type: 'warning', message: 'Giấy phép đã hết hạn',
        detail: 'Ứng dụng sẽ chạy ở chế độ mẫu. Liên hệ Học viện GITA để gia hạn.', buttons: ['Xong'] });
      return null;
    }
    return gp;
  } catch (e) { return null; }
}

function catGiayPhep() {
  const { canceled, filePaths } = dialog.showOpenDialogSync
    ? { canceled: false, filePaths: dialog.showOpenDialogSync(cuaSo, {
        title: 'Chọn tệp giấy phép do Học viện GITA cấp', properties: ['openFile'],
        filters: [{ name: 'Giấy phép GITA 365', extensions: ['json'] }] }) || [] }
    : { canceled: true, filePaths: [] };
  if (canceled || !filePaths[0]) return;
  try {
    const gp = JSON.parse(fs.readFileSync(filePaths[0], 'utf8'));
    if (!gp || !gp.khoa) throw new Error('Tệp không phải giấy phép GITA 365.');
    fs.copyFileSync(filePaths[0], GIAY_PHEP);
    dialog.showMessageBox(cuaSo, { type: 'info', message: 'Đã kích hoạt giấy phép',
      detail: 'Ứng dụng sẽ mở lại để nạp kho theo phạm vi được cấp.', buttons: ['Mở lại'] });
    if (cuaSo) cuaSo.reload();
  } catch (e) {
    dialog.showErrorBox('Giấy phép không hợp lệ', String(e && e.message || e));
  }
}

function moCuaSo() {
  const luu = docHoSo() || {};
  cuaSo = new BrowserWindow({
    width: luu.width || 1440,
    height: luu.height || 900,
    x: luu.x, y: luu.y,
    minWidth: 380,
    minHeight: 560,
    show: false,
    backgroundColor: '#070510',
    title: 'GITA 365 — Hệ Sinh Thái Gia Đình Thịnh Vượng',
    icon: path.join(__dirname, 'build', 'icon.png'),
    autoHideMenuBar: false,
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      spellcheck: true,
      devTools: DEV
    }
  });

  if (luu.phongTo) cuaSo.maximize();
  /* Đưa khoá của giấy phép vào phiên — chỉ trong bộ nhớ, không ghi ra đĩa */
  cuaSo.webContents.on('did-start-loading', () => {
    const gp = docGiayPhep();
    cuaSo.webContents.executeJavaScript(
      gp ? 'window.GITA_KHOA = ' + JSON.stringify(gp.khoa) + ';'
         : 'window.GITA_KHOA = null;', true).catch(() => {});
  });
  cuaSo.loadURL('gita://app/index.html');

  cuaSo.once('ready-to-show', () => cuaSo.show());
  ['resize', 'move', 'close'].forEach(e => cuaSo.on(e, () => ghiHoSo(cuaSo)));
  cuaSo.on('closed', () => { cuaSo = null; });

  /* Liên kết ra ngoài mở bằng trình duyệt hệ thống, không mở trong ứng dụng */
  cuaSo.webContents.setWindowOpenHandler(({ url: u }) => {
    if (/^https?:/.test(u)) shell.openExternal(u);
    return { action: 'deny' };
  });
  cuaSo.webContents.on('will-navigate', (e, u) => {
    if (!u.startsWith('gita://')) { e.preventDefault(); if (/^https?:/.test(u)) shell.openExternal(u); }
  });

  /* Chỉ cho phép micro — trợ lý nghe giọng nói. Mọi quyền khác đều từ chối. */
  cuaSo.webContents.session.setPermissionRequestHandler((wc, quyen, cho) => cho(quyen === 'media'));
  cuaSo.webContents.session.setPermissionCheckHandler((wc, quyen) => quyen === 'media');
}

/* ─────────── Phục vụ tệp trong ứng dụng qua gita:// ─────────── */
function dungGiaoThuc() {
  protocol.handle('gita', (req) => {
    const u = new URL(req.url);
    let p = decodeURIComponent(u.pathname);
    if (!p || p === '/') p = '/index.html';
    const that = path.normalize(path.join(GOC, p));
    if (!that.startsWith(GOC)) return new Response('Không được phép', { status: 403 });
    return net.fetch(url.pathToFileURL(that).toString());
  });
}

/* ─────────── Lệnh gửi vào giao diện ─────────── */
function di(man) {
  if (cuaSo) cuaSo.webContents.executeJavaScript(
    `window.G && G.S && G.S.acc ? G.go(${JSON.stringify(man)}) : null`).catch(() => {});
}

/* Hỏi chính ứng dụng xem vai đang đăng nhập có quyền xuất bản in không.
   Trình đơn của tiến trình chính không biết vai, nên phải hỏi sang. */
/* Sao chép, cắt, chọn tất cả — chặn với tài khoản khách hàng.
   Hỏi thẳng trang xem vai hiện tại có bị khoá không; trang là nơi biết
   sự thật, tiến trình chính không giữ trạng thái đăng nhập. */
async function biKhoaChep() {
  try {
    return await cuaSo.webContents.executeJavaScript(
      '(function(){ try{ return !!(window.G && window.G.BI_KHOA_CHEP && window.G.BI_KHOA_CHEP()); }catch(e){ return false; } })()',
      true);
  } catch (e) { return false; }
}

async function chepNeuDuoc(viec) {
  if (!cuaSo) return;
  if (await biKhoaChep()) {
    try {
      await cuaSo.webContents.executeJavaScript(
        "window.G && window.G.secLog && window.G.secLog('Chặn sao chép','Trình đơn Sửa ▸ " + viec + " trên bản máy tính','Đã chặn')",
        true);
    } catch (e) {}
    dialog.showMessageBox(cuaSo, {
      type: 'info', title: 'GITA 365',
      message: 'Tài khoản này không sao chép được',
      detail: 'Nội dung trong GITA 365 là tài sản của Học viện, chỉ đọc trực tiếp trên ứng dụng.\n' +
              'Cần bản mang về thì nhắn Tư vấn hoặc Coach của nhà mình.\n\nHotline: 08.5555.4688'
    });
    return;
  }
  if (viec === 'cut') cuaSo.webContents.cut();
  else if (viec === 'copy') cuaSo.webContents.copy();
  else cuaSo.webContents.selectAll();
}

/* In màn hình — chỉ cho vai có quyền xuat_pdf (bậc ≤ 5). */
async function inManHinh() {
  if (!cuaSo) return;
  if (!(await coQuyenIn())) {
    dialog.showMessageBox(cuaSo, {
      type: 'info', title: 'GITA 365',
      message: 'Tài khoản này không in được',
      detail: 'In và xuất PDF dành cho người của Học viện GITA từ cấp quản lý. ' +
              'Hồ sơ của gia đình đọc trực tiếp trên ứng dụng.\n\nCần người thật: 08.5555.4688'
    });
    return;
  }
  cuaSo.webContents.print();
}

async function coQuyenIn() {
  try {
    return await cuaSo.webContents.executeJavaScript(
      '(function(){ try{ return !!(window.G && window.G.S && window.G.S.acc && window.G.coTheIn && window.G.coTheIn()); }catch(e){ return false; } })()',
      true);
  } catch (e) { return false; }
}

async function xuatPDF() {
  if (!cuaSo) return;
  if (!(await coQuyenIn())) {
    dialog.showMessageBox(cuaSo, {
      type: 'warning', message: 'Tài khoản này không xuất được bản in',
      detail: 'Chỉ người của Học viện GITA từ cấp quản lý mới xuất được PDF. ' +
              'Khách hàng muốn có bản giấy thì Coach hoặc quản lý in gửi.',
      buttons: ['Đã hiểu']
    });
    try {
      await cuaSo.webContents.executeJavaScript(
        "window.G && window.G.secLog && window.G.secLog('Chặn in', 'Trình đơn Xuất PDF của bản máy tính — vai không có quyền xuat_pdf', 'Đã chặn')", true);
    } catch (e) {}
    return;
  }
  const { canceled, filePath } = await dialog.showSaveDialog(cuaSo, {
    title: 'Xuất màn hình này ra PDF',
    defaultPath: path.join(app.getPath('documents'), 'GITA365-' + Date.now() + '.pdf'),
    filters: [{ name: 'PDF', extensions: ['pdf'] }]
  });
  if (canceled || !filePath) return;
  try {
    const pdf = await cuaSo.webContents.printToPDF({
      printBackground: true, pageSize: 'A4', margins: { marginType: 'default' }
    });
    fs.writeFileSync(filePath, pdf);
    dialog.showMessageBox(cuaSo, { type: 'info', message: 'Đã xuất PDF', detail: filePath, buttons: ['Xong'] });
  } catch (e) {
    dialog.showErrorBox('Chưa xuất được PDF', String(e && e.message || e));
  }
}

async function saoLuu() {
  if (!cuaSo) return;
  if (!(await coQuyenIn())) {
    dialog.showMessageBox(cuaSo, {
      type: 'warning', message: 'Tài khoản này không sao lưu ra tệp được',
      detail: 'Sao lưu là một đường đưa dữ liệu ra khỏi hệ thống nên cũng theo quyền xuất. ' +
              'Dữ liệu của nhà mình vẫn được giữ trong máy và đồng bộ lên máy chủ khi có mạng.',
      buttons: ['Đã hiểu']
    });
    return;
  }
  const du = await cuaSo.webContents.executeJavaScript(
    `JSON.stringify({v:'7.0', luc:new Date().toISOString(),
      trangThai: localStorage.getItem('gita365.v7'), ngonNgu: localStorage.getItem('gita365.lang')})`);
  const { canceled, filePath } = await dialog.showSaveDialog(cuaSo, {
    title: 'Sao lưu dữ liệu nhà mình',
    defaultPath: path.join(app.getPath('documents'), 'GITA365-saoluu-' + new Date().toISOString().slice(0, 10) + '.json'),
    filters: [{ name: 'Tệp sao lưu GITA 365', extensions: ['json'] }]
  });
  if (canceled || !filePath) return;
  fs.writeFileSync(filePath, du, 'utf8');
  dialog.showMessageBox(cuaSo, {
    type: 'info', message: 'Đã sao lưu',
    detail: 'Dữ liệu của nhà mình nằm trong tệp này. Mang đi máy khác được.\n\n' + filePath,
    buttons: ['Xong']
  });
}

async function phucHoi() {
  if (!cuaSo) return;
  const { canceled, filePaths } = await dialog.showOpenDialog(cuaSo, {
    title: 'Phục hồi từ tệp sao lưu', properties: ['openFile'],
    filters: [{ name: 'Tệp sao lưu GITA 365', extensions: ['json'] }]
  });
  if (canceled || !filePaths[0]) return;
  const tra = await dialog.showMessageBox(cuaSo, {
    type: 'warning', buttons: ['Huỷ', 'Phục hồi'], defaultId: 0, cancelId: 0,
    message: 'Phục hồi sẽ ghi đè dữ liệu đang có trên máy này',
    detail: 'Dữ liệu hiện tại của nhà mình sẽ được thay bằng nội dung trong tệp sao lưu. Nên sao lưu bản hiện tại trước.'
  });
  if (tra.response !== 1) return;
  try {
    const d = JSON.parse(fs.readFileSync(filePaths[0], 'utf8'));
    await cuaSo.webContents.executeJavaScript(
      `(function(){ try{
         ${d.trangThai ? `localStorage.setItem('gita365.v7', ${JSON.stringify(d.trangThai)});` : ''}
         ${d.ngonNgu ? `localStorage.setItem('gita365.lang', ${JSON.stringify(d.ngonNgu)});` : ''}
         location.reload(); }catch(e){} })()`);
  } catch (e) {
    dialog.showErrorBox('Tệp sao lưu không đọc được', String(e && e.message || e));
  }
}

function veUngDung() {
  dialog.showMessageBox(cuaSo, {
    type: 'info',
    title: 'Về GITA 365',
    message: 'GITA 365 · phiên bản ' + app.getVersion(),
    detail:
      'Hệ Sinh Thái Gia Đình Thịnh Vượng\n' +
      'Một gia đình vận hành được — không cần ai canh.\n\n' +
      '56 màn hình · 5 nhóm chính · 15 vai · Việt / Anh\n' +
      '1.000 kịch bản · 220 phác đồ · 42 mô thức gốc\n\n' +
      'Bản máy tính chạy hoàn toàn ngoại tuyến. Dữ liệu của nhà mình\n' +
      'nằm trong máy này, không gửi đi đâu cả.\n\n' +
      'Giấy phép: ' + (docGiayPhep() ? 'đã kích hoạt' : 'chưa kích hoạt — đang ở chế độ mẫu') + '\n\n' +
      'Electron ' + process.versions.electron + ' · Chromium ' + process.versions.chrome + '\n' +
      'Hotline 08.5555.4688 · truongnhatquang.com',
    buttons: ['Xong']
  });
}


/* ═══════════════════════════════════════════════════════════════
   MÁY CHỦ LÀ MÁY CỦA CHỦ — phần nối vào ứng dụng

   Chủ hệ thống yêu cầu: dữ liệu nằm trên máy của mình; máy khác chỉ
   được dùng, không được lưu hoặc tải về. Máy chủ nhỏ ở desktop/may-chu.js
   làm phần chạy; chỗ này là ba việc nối nó vào ứng dụng:

     1. Đưa cho nó bộ khoá gốc — đọc từ giấy phép trên MÁY NÀY, không
        bao giờ gửi đi đâu.
     2. Đưa cho nó bảng cấp phát — hỏi thẳng giao diện đang mở, để luật
        phạm vi chỉ viết một lần ở src/kho-khoa.js.
     3. Nhận nhật ký của nó, ghi ra tệp và đẩy vào màn nhật ký an ninh
        của ứng dụng để chủ hệ thống nhìn thấy ngay.
   ═══════════════════════════════════════════════════════════════ */

/* Bảng cấp phát hỏi một lần rồi giữ lại: hỏi mỗi lượt đăng nhập thì một
   máy khách xin liên tục sẽ làm giao diện của chủ hệ thống giật. */
let bangCapNho = null;
async function napBangCap() {
  if (!cuaSo) return null;
  try {
    const b = await cuaSo.webContents.executeJavaScript(
      '(function(){ try{ return window.G && G.bangCapPhat ? JSON.stringify(G.bangCapPhat()) : null; }catch(e){ return null; } })()',
      true);
    bangCapNho = b ? JSON.parse(b) : null;
  } catch (e) { bangCapNho = null; }
  return bangCapNho;
}

function ghiNhatKyChu(d) {
  try { fs.appendFileSync(NHATKY_CHU, JSON.stringify(d) + '\n'); } catch { /* nhật ký hỏng không được làm sập phục vụ */ }
  if (cuaSo && !cuaSo.isDestroyed())
    cuaSo.webContents.executeJavaScript(
      'window.G && G.secLog && G.secLog(' + JSON.stringify('Máy chủ · ' + d.viec) + ',' +
      JSON.stringify(d.chiTiet) + ',' + JSON.stringify(d.ket) + ')', true).catch(() => {});
}

async function batPhucVu() {
  if (mayChu.dangChay()) return danhSachMayKhach();
  if (!docGiayPhep()) {
    dialog.showMessageBox(cuaSo, {
      type: 'warning', message: 'Máy này chưa kích hoạt giấy phép',
      detail: 'Máy chủ phải tự mở được kho thì mới phục vụ máy khác được.\n' +
              'Vào Tệp ▸ Kích hoạt giấy phép… trước đã.', buttons: ['Đã hiểu']
    });
    return;
  }
  await napBangCap();
  if (!bangCapNho) {
    dialog.showMessageBox(cuaSo, {
      type: 'warning', message: 'Chưa đọc được bảng cấp phát',
      detail: 'Đăng nhập vào ứng dụng trên máy này trước, rồi bật phục vụ lại.', buttons: ['Đã hiểu']
    });
    return;
  }
  try {
    const kq = await mayChu.bat({
      goc: GOC,
      tepMayQuen: MAY_KHACH,
      layKhoaGoc: () => { const gp = docGiayPhep(); return gp && gp.khoa; },
      layBangCap: () => bangCapNho,
      ghiNhatKy: ghiNhatKyChu
    });
    dialog.showMessageBox(cuaSo, {
      type: 'info', title: 'Đang phục vụ máy khác',
      message: 'Máy khác mở trình duyệt và gõ địa chỉ này',
      detail: kq.diaChi.join('\n') + '\n\n' +
        'Máy lạ vào lần đầu sẽ nằm ở hàng chờ. Vào Máy chủ ▸ Máy đang dùng… để duyệt.\n\n' +
        'Máy khách KHÔNG nhận được: bảy tệp kho, bộ khoá gốc, gói ngoài phạm vi vai,\n' +
        'và không giữ lại được bản nào để dùng lần sau.',
      buttons: ['Xong']
    });
  } catch (e) {
    dialog.showErrorBox('Chưa bật được máy chủ',
      String(e && e.message || e) + '\n\nThường là do cổng ' + mayChu.CONG_MAC_DINH + ' đã có chương trình khác dùng.');
  }
}

function tatPhucVu() {
  if (!mayChu.dangChay()) return;
  mayChu.tat();
  dialog.showMessageBox(cuaSo, {
    type: 'info', message: 'Đã dừng phục vụ máy khác',
    detail: 'Mọi phiên bị cắt. Bản mã tạm trong bộ nhớ đã xoá — máy khách tải lại là trắng.',
    buttons: ['Xong']
  });
}

/* Danh sách máy: duyệt, cắt, hoặc quên. Một hộp thoại cho mỗi máy đang chờ,
   vì đây là quyết định chủ hệ thống phải nhìn từng cái rồi mới bấm. */
async function danhSachMayKhach() {
  if (!mayChu.dangChay()) {
    dialog.showMessageBox(cuaSo, { type: 'info', message: 'Chưa bật phục vụ máy khác',
      detail: 'Vào Máy chủ ▸ Phục vụ máy khác… để bật.', buttons: ['Xong'] });
    return;
  }
  const ds = mayChu.danhSachMay();
  if (!ds.length) {
    dialog.showMessageBox(cuaSo, { type: 'info', message: 'Chưa máy nào xin vào',
      detail: 'Địa chỉ để đọc cho máy khác gõ:\n\n' + mayChu.diaChi().join('\n'), buttons: ['Xong'] });
    return;
  }
  const cho = ds.filter(m => m.duyet === 'cho');
  for (const m of cho) {
    const tra = await dialog.showMessageBox(cuaSo, {
      type: 'question', buttons: ['Để đó đã', 'Cắt quyền', 'Cho dùng'], defaultId: 0, cancelId: 0,
      message: 'Máy này xin vào: ' + m.ten,
      detail: 'Tài khoản đăng nhập: ' + (m.taiKhoan || 'chưa rõ') + '\n' +
              'Xin lúc: ' + new Date(m.luc).toLocaleString('vi-VN') + '\n\n' +
              'Cho dùng thì máy ấy đọc được nội dung trong phạm vi vai của tài khoản đó, ' +
              'nhưng không tải được gì về. Cắt quyền lúc nào cũng được.'
    });
    if (tra.response === 2) mayChu.datMay(m.van, 'thuan');
    else if (tra.response === 1) mayChu.datMay(m.van, 'chan');
  }
  const con = mayChu.danhSachMay().filter(m => m.duyet !== 'cho');
  if (!con.length) return;
  const dong = con.map(m =>
    (m.duyet === 'thuan' ? '  ✓ ' : '  ✕ ') + m.ten +
    '  ·  ' + (m.taiKhoan || '?') +
    (m.dangMo ? '  ·  đang mở ' + m.dangMo + ' phiên' : '') +
    '  ·  ' + m.soPhien + ' lượt');
  const tra = await dialog.showMessageBox(cuaSo, {
    type: 'info', buttons: ['Xong', 'Cắt hết mọi máy'], defaultId: 0, cancelId: 0,
    message: 'Máy đã biết (' + con.length + ')',
    detail: dong.join('\n') + '\n\nĐịa chỉ máy chủ:\n' + mayChu.diaChi().join('\n')
  });
  if (tra.response === 1) {
    for (const m of con) mayChu.datMay(m.van, 'chan');
    dialog.showMessageBox(cuaSo, { type: 'info', message: 'Đã cắt hết',
      detail: 'Mọi máy khách bị cắt ngay lập tức. Muốn cho dùng lại thì duyệt từng máy.', buttons: ['Xong'] });
  }
}

/* ─────────── Trình đơn tiếng Việt ─────────── */
function dungTrinhDon() {
  const mac = process.platform === 'darwin';
  const nhom = [
    { l: 'Bắt đầu ở đây', v: 'bat-dau', p: 'CmdOrCtrl+1' },
    { l: 'Bản đồ gia đình thịnh vượng', v: 'ban-do', p: 'CmdOrCtrl+2' },
    { l: 'Nhiệm vụ hôm nay', v: 'nhiem-vu', p: 'CmdOrCtrl+3' },
    { l: 'Kho báu vật', v: 'kho', p: 'CmdOrCtrl+4' },
    { l: 'Chín vai giữ trong nhà', v: 'chin-vai', p: 'CmdOrCtrl+5' },
    { l: 'Ngôn từ dẫn dắt', v: 'ngon-tu', p: 'CmdOrCtrl+6' },
    { type: 'separator' },
    { l: 'Trợ lý GITA', v: 'tro-ly' },
    { l: 'Người đồng hành', v: 'dong-hanh' },
    { type: 'separator' },
    { l: 'Trung tâm điều hành', v: 'dieu-hanh' },
    { l: 'Rà soát hệ thống', v: 'ra-soat' },
    { type: 'separator' },
    { l: 'Tài khoản của tôi', v: 'toi' }
  ].map(m => m.type ? m : { label: m.l, accelerator: m.p, click: () => di(m.v) });

  const mau = [
    ...(mac ? [{ role: 'appMenu' }] : []),
    {
      label: 'Tệp',
      submenu: [
        { label: 'Kích hoạt giấy phép…', click: catGiayPhep },
        { type: 'separator' },
        { label: 'Sao lưu dữ liệu nhà mình…', accelerator: 'CmdOrCtrl+S', click: saoLuu },
        { label: 'Phục hồi từ tệp sao lưu…', click: phucHoi },
        { type: 'separator' },
        { label: 'Xuất màn hình này ra PDF…', accelerator: 'CmdOrCtrl+E', click: xuatPDF },
        /* PHẢI kiểm quyền như mục Xuất PDF ngay trên.
           Trước đây mục này in thẳng không hỏi gì, mà phím tắt Ctrl+P lại do
           trình đơn của tiến trình chính bắt trước — nên nó nuốt luôn phím và
           lớp chặn Ctrl+P bên trong trang không bao giờ chạy. Phụ huynh mở
           Tệp ▸ In… rồi chọn "Microsoft Print to PDF" là có bản PDF hồ sơ gia
           đình, không một dòng nhật ký nào. Đúng thứ luật của Học viện cấm. */
        { label: 'In…', accelerator: 'CmdOrCtrl+P', click: inManHinh },
        { type: 'separator' },
        mac ? { role: 'close', label: 'Đóng cửa sổ' } : { role: 'quit', label: 'Thoát' }
      ]
    },
    {
      label: 'Sửa',
      submenu: [
        { role: 'undo', label: 'Hoàn tác' }, { role: 'redo', label: 'Làm lại' },
        { type: 'separator' },
        /* Ba mục này do TIẾN TRÌNH CHÍNH thực hiện, nên lớp chặn bên trong
           trang không với tới được: Ctrl+C của trình đơn chép thẳng từ vùng
           chọn, bỏ qua mọi bộ nghe của ứng dụng. Phải hỏi vai trước.
           Dán vẫn để nguyên — khách hàng cần dán khi điền biểu mẫu. */
        { label: 'Cắt',          accelerator: 'CmdOrCtrl+X', click: () => chepNeuDuoc('cut') },
        { label: 'Sao chép',     accelerator: 'CmdOrCtrl+C', click: () => chepNeuDuoc('copy') },
        { role: 'paste',         label: 'Dán' },
        { label: 'Chọn tất cả',  accelerator: 'CmdOrCtrl+A', click: () => chepNeuDuoc('selectAll') }
      ]
    },
    { label: 'Đi tới', submenu: nhom },
    {
      /* Chủ hệ thống: "dữ liệu ở máy tôi, máy khác chỉ được dùng."
         Ba mục này là chỗ bật, xem và tắt điều đó. */
      label: 'Máy chủ',
      submenu: [
        { label: 'Phục vụ máy khác…', click: batPhucVu },
        { label: 'Máy đang dùng…', click: danhSachMayKhach },
        { label: 'Dừng phục vụ', click: tatPhucVu }
      ]
    },
    {
      label: 'Xem',
      submenu: [
        { role: 'reload', label: 'Tải lại' },
        { type: 'separator' },
        { role: 'resetZoom', label: 'Cỡ chữ gốc' },
        { role: 'zoomIn', label: 'Phóng to' },
        { role: 'zoomOut', label: 'Thu nhỏ' },
        { type: 'separator' },
        { role: 'togglefullscreen', label: 'Toàn màn hình' },
        ...(DEV ? [{ role: 'toggleDevTools', label: 'Công cụ nhà phát triển' }] : [])
      ]
    },
    {
      label: 'Trợ giúp',
      submenu: [
        { label: 'Tài khoản trải nghiệm 15 vai', click: () => {
            if (cuaSo) cuaSo.webContents.executeJavaScript('window.G && G.accountsModal && G.accountsModal()').catch(() => {});
          } },
        { label: 'Hướng dẫn sử dụng', click: () => di('bat-dau') },
        { type: 'separator' },
        { label: 'Trang chủ Học viện GITA', click: () => shell.openExternal('https://truongnhatquang.com') },
        { label: 'Về GITA 365', click: veUngDung }
      ]
    }
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(mau));
}

/* ─────────── Chỉ cho chạy một bản ─────────── */
if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (cuaSo) { if (cuaSo.isMinimized()) cuaSo.restore(); cuaSo.focus(); }
  });

  app.whenReady().then(() => {
    dungGiaoThuc();
    dungTrinhDon();
    moCuaSo();
    app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) moCuaSo(); });
  });

  /* Đóng ứng dụng là cắt phục vụ. Để máy chủ chạy tiếp sau khi cửa sổ đóng
     là để một cổng mở mà không ai nhìn — đúng kiểu lỗ hổng lặng lẽ nhất. */
  app.on('before-quit', () => { try { mayChu.tat(); } catch {} });
  app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
}

ipcMain.handle('gita:phien-ban', () => ({
  ungDung: app.getVersion(), electron: process.versions.electron, chromium: process.versions.chrome,
  nenTang: process.platform, duLieu: app.getPath('userData')
}));
