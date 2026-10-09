/* ═══════════════════════════════════════════════════════════════
   GITA 365 · MÁY CHỦ LÀ MÁY CỦA CHỦ

   Yêu cầu của chủ hệ thống, nguyên văn:

     "Toàn bộ các dữ liệu được cài trên máy tính chủ của tôi; các máy
      tính khác chỉ được dùng, không được cấp phép lưu hoặc tải dữ
      liệu về."

   Trước bản này, câu ấy mới chỉ là CHÍNH SÁCH ghi trong G.TD_MAYCHU.
   Đây là phần chạy thật.

   ── CÁCH LÀM ──
   Máy của anh Quang bật ứng dụng, chọn "Phục vụ máy khác". Ứng dụng mở
   một máy chủ nhỏ trong mạng nội bộ. Máy khác mở trình duyệt, gõ địa
   chỉ, đăng nhập bằng tài khoản của mình.

   ── BỐN ĐIỀU MÁY KHÁCH KHÔNG BAO GIỜ NHẬN ĐƯỢC ──
   1. Bảy tệp kho/*.enc. Máy chủ trả 403 cho mọi đường dẫn vào kho.
      Kho gốc ở lại trên máy chủ, không đi đâu cả.
   2. Bộ khoá gốc. Không một byte nào của khoá thật rời máy chủ.
   3. Gói nào ngoài phạm vi vai của mình. Máy chủ lọc theo vai TRƯỚC
      khi mã hoá — vai không được cấp thì gói ấy không tồn tại với
      máy khách, chứ không phải "có mà khoá".
   4. Một bản nào để dùng lại lần sau. Không service worker, không
      bộ đệm, Cache-Control: no-store trên mọi đường.

   ── KHOÁ MỘT LẦN DÙNG ──
   Máy chủ giải gói bằng khoá gốc, rồi mã hoá LẠI bằng một khoá ngẫu
   nhiên sinh riêng cho phiên ấy, và chỉ đưa khoá ngẫu nhiên đó đi.

   Vì sao đáng công: ai bắt được đường truyền và giữ lại cả khoá lẫn
   gói thì cũng chỉ giữ được đúng phiên ấy. Phiên hết hạn, máy chủ vứt
   bản mã đi; khoá cầm trong tay không mở được bảy tệp .enc của bản
   phát hành, vì chúng mã bằng khoá khác.

   ── MÁY LẠ PHẢI ĐƯỢC DUYỆT ──
   Máy chưa quen xin vào thì nằm ở hàng chờ, không vào được gì. Chủ hệ
   thống thấy tên máy, giờ xin, tài khoản đăng nhập — rồi tự tay duyệt
   hoặc từ chối. Duyệt rồi vẫn cắt được giữa chừng: cắt là gói đang mở
   trong bộ nhớ máy chủ bị xoá ngay, máy khách tải lại là trắng.

   ── ĐIỀU KHÔNG LÀM ĐƯỢC, NÓI THẲNG ──
   Máy khách vẫn phải nhận NỘI DUNG ĐANG XEM để hiện lên màn hình —
   không có cách nào khác, mọi ứng dụng đều thế. Ai ngồi tại máy ấy
   mở công cụ nhà phát triển thì đọc được phần đang hiện trong bộ nhớ
   của trình duyệt. Chụp màn hình cũng vậy.

   Cái bản này chặn được: mang cả kho đi, giữ lại để dùng offline,
   tải tệp, in, sao chép, và dùng tiếp sau khi bị cắt quyền.
   Cái bản này KHÔNG chặn được: người ngồi trước màn hình nhìn và chép
   tay từng chữ. Không phần mềm nào chặn được điều đó.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
const http = require('node:http');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');

const CONG_MAC_DINH = 8365;
const HAN_PHIEN_MS = 8 * 60 * 60 * 1000;      // phiên hết hạn sau 8 giờ
const HAN_CHO_MS = 30 * 60 * 1000;            // máy xin vào mà không ai duyệt: 30 phút thì bỏ
const TRAN_XIN_PHUT = 30;                     // mỗi máy tối đa 30 lượt xin khoá / phút

/* Kiểu MIME — chỉ những đuôi ứng dụng thật dùng. Đuôi lạ không phục vụ. */
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2'
};

let may = null;          // http.Server đang chạy
let cong = CONG_MAC_DINH;
let goc = null;          // thư mục desktop/app
let layKhoaGoc = null;   // hàm trả bộ khoá gốc (từ giấy phép trên máy chủ)
let layBangCap = null;   // hàm trả bảng {tên đăng nhập → {vai, goi[]}}
let ghiNhatKy = null;    // hàm báo về giao diện

const phien = new Map();   // ma phiên  → {may, vai, taiKhoan, mo:Map<ten,Buffer>, khoa:{}, luc, chot}
const mayQuen = new Map(); // vân tay máy → {ten, duyet:'cho'|'thuan'|'chan', luc, lanCuoi, soPhien}
const nhipXin = new Map(); // vân tay máy → {phut, so}

let tepMayQuen = null;     // nơi ghi danh sách máy đã duyệt

/* ─────────── Danh sách máy: ghi ra đĩa để lần sau còn nhớ ─────────── */
function docMayQuen() {
  try {
    const d = JSON.parse(fs.readFileSync(tepMayQuen, 'utf8'));
    if (Array.isArray(d)) for (const m of d) if (m && m.van) mayQuen.set(m.van, m);
  } catch { /* chưa có tệp là chuyện thường — lần đầu chạy */ }
}
function ghiMayQuen() {
  try {
    const ds = [];
    for (const [van, m] of mayQuen) if (m.duyet !== 'cho') ds.push({ ...m, van });
    fs.writeFileSync(tepMayQuen, JSON.stringify(ds, null, 2));
  } catch { /* không ghi được thì vẫn chạy, chỉ là lần sau phải duyệt lại */ }
}

/* Vân tay máy: đủ để phân biệt hai máy trong nhà, không phải để định danh người.
   Lấy từ địa chỉ mạng + chuỗi trình duyệt. Đổi trình duyệt là phải duyệt lại —
   đúng ý: mỗi đường vào mới là một lần chủ hệ thống nhìn thấy. */
function vanTay(req) {
  const ip = (req.socket.remoteAddress || '').replace(/^::ffff:/, '');
  const ua = String(req.headers['user-agent'] || '').slice(0, 200);
  return crypto.createHash('sha256').update(ip + '|' + ua).digest('hex').slice(0, 16);
}
function tenMay(req) {
  const ip = (req.socket.remoteAddress || '').replace(/^::ffff:/, '');
  const ua = String(req.headers['user-agent'] || '');
  let he = 'máy lạ';
  if (/Windows/.test(ua)) he = 'Windows';
  else if (/Android/.test(ua)) he = 'Android';
  else if (/iPhone|iPad/.test(ua)) he = 'iPhone / iPad';
  else if (/Mac OS X/.test(ua)) he = 'macOS';
  else if (/Linux/.test(ua)) he = 'Linux';
  let tr = /Edg\//.test(ua) ? 'Edge' : /Chrome\//.test(ua) ? 'Chrome'
    : /Firefox\//.test(ua) ? 'Firefox' : /Safari\//.test(ua) ? 'Safari' : 'trình duyệt lạ';
  return he + ' · ' + tr + ' · ' + ip;
}

/* ─────────── Nhịp xin: một máy hỏng hoặc một kịch bản quét đều lộ ở đây ─────────── */
function quaNhip(van) {
  const phut = Math.floor(Date.now() / 60000);
  const c = nhipXin.get(van);
  if (!c || c.phut !== phut) { nhipXin.set(van, { phut, so: 1 }); return false; }
  c.so++;
  return c.so > TRAN_XIN_PHUT;
}

/* ─────────── Mã hoá lại một gói bằng khoá dùng một lần ───────────
   Định dạng phải khớp đúng cái src/kho-khoa.js chờ: iv(12) + tag(16) + bản mã. */
function maLai(goiRo) {
  /* goiRo là BYTE, không phải chữ. Từ bản 9.9 ruột gói được nén trước khi
     mã hoá, nên nó là gzip — nhị phân. Đi qua toString('utf8') là hỏng
     không cứu được: mọi byte không hợp lệ theo UTF-8 bị thay bằng U+FFFD,
     và máy khách giải nén ra rác. Giữ Buffer suốt đường là xong. */
  const ro = Buffer.isBuffer(goiRo) ? goiRo : Buffer.from(goiRo, 'utf8');
  const khoa = crypto.randomBytes(32);
  const iv = crypto.randomBytes(12);
  const c = crypto.createCipheriv('aes-256-gcm', khoa, iv);
  const ct = Buffer.concat([c.update(ro), c.final()]);
  return { khoa: khoa.toString('base64'), goi: Buffer.concat([iv, c.getAuthTag(), ct]) };
}

/* ─────────── Mở một gói .enc bằng khoá gốc ─────────── */
function moGoiGoc(ten, khoaB64) {
  const p = path.join(goc, 'kho', ten + '.enc');
  if (!fs.existsSync(p)) return null;
  const b = fs.readFileSync(p);
  const raw = Buffer.from(khoaB64, 'base64');
  const d = crypto.createDecipheriv('aes-256-gcm', raw, b.subarray(0, 12));
  d.setAuthTag(b.subarray(12, 28));
  /* Trả BUFFER, không trả chuỗi — ruột gói nay là gzip. */
  return Buffer.concat([d.update(b.subarray(28)), d.final()]);
}

/* ─────────── Dọn phiên hết hạn và máy chờ quá lâu ─────────── */
function don() {
  const nay = Date.now();
  for (const [ma, p] of phien)
    if (nay - p.luc > HAN_PHIEN_MS) { p.mo.clear(); phien.delete(ma); }
  for (const [van, m] of mayQuen)
    if (m.duyet === 'cho' && nay - m.luc > HAN_CHO_MS) mayQuen.delete(van);
}

/* ─────────── Trả lời ─────────── */
function traJSON(res, ma, du) {
  const b = Buffer.from(JSON.stringify(du), 'utf8');
  res.writeHead(ma, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': b.length,
    'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
    'Pragma': 'no-cache',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'no-referrer'
  });
  res.end(b);
}

/* Đầu trang cho mọi tệp tĩnh. no-store là điều kiện cần của "không được lưu":
   trình duyệt không giữ bản nào trên đĩa, đóng tab là hết. */
function dauTinh(duoi, dai) {
  return {
    'Content-Type': MIME[duoi] || 'application/octet-stream',
    'Content-Length': dai,
    'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
    'Pragma': 'no-cache',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'no-referrer',
    'X-Frame-Options': 'SAMEORIGIN'
  };
}

/* ─────────── index.html cho máy khách: gắn cờ và cắt service worker ─────────── */
function trangKhach() {
  let html = fs.readFileSync(path.join(goc, 'index.html'), 'utf8');
  /* Service worker là bộ đệm — đúng thứ chính sách cấm. Cắt hẳn. */
  html = html.replace(/if \('serviceWorker' in navigator[\s\S]*?\n\}\n/, '');
  /* Cờ phải nằm TRƯỚC mọi thẻ script của ứng dụng, nếu không src/may-khach.js
     chạy sau khi các lớp khác đã dựng xong thì chặn muộn mất. */
  const co = '<script>window.GITA_MAY_KHACH=true;' +
    'window.GITA_NGUON_KHO="/kho-phuc-vu/";' +
    'window.GITA_KHOA=null;<\/script>\n';
  return html.replace(/<script/, co + '<script');
}

/* ─────────── Bộ xử lý ─────────── */
function xuLy(req, res) {
  don();
  const van = vanTay(req);
  let u;
  try { u = new URL(req.url, 'http://x'); } catch { return traJSON(res, 400, { ok: false, error: 'Đường dẫn hỏng' }); }
  const duong = decodeURIComponent(u.pathname);

  /* ── Kho gốc: KHÔNG BAO GIỜ ──
     Đây là điều kiện đủ của "dữ liệu ở lại máy chủ". Chặn ở đây, trước
     mọi thứ khác, để không một nhánh nào phía dưới lỡ tay phục vụ. */
  if (/^\/kho\//.test(duong) || /\.enc$/.test(duong) || /khoa\.json$/.test(duong)) {
    bao('Chặn tải kho', tenMay(req) + ' xin ' + duong, 'Đã chặn');
    return traJSON(res, 403, { ok: false, error: 'Kho gốc không rời máy chủ. Máy khách chỉ được dùng.' });
  }

  /* ── Xin khoá / đăng nhập ── */
  if (req.method === 'POST' && duong === '/cap-phep') {
    if (quaNhip(van)) return traJSON(res, 429, { ok: false, error: 'Xin quá nhanh — thử lại sau một phút.' });
    let than = '';
    req.on('data', c => { than += c; if (than.length > 65536) req.destroy(); });
    return req.on('end', () => {
      let d; try { d = JSON.parse(than); } catch { return traJSON(res, 400, { ok: false, error: 'Yêu cầu hỏng' }); }
      capPhep(req, res, van, d);
    });
  }

  /* ── Lấy một gói đã mã hoá lại cho phiên này ── */
  if (duong.startsWith('/kho-phuc-vu/')) {
    const ten = duong.slice('/kho-phuc-vu/'.length);
    const ma = String(req.headers['x-gita-phien'] || u.searchParams.get('p') || '');
    const p = phien.get(ma);
    if (!p || p.van !== van)
      return traJSON(res, 401, { ok: false, error: 'Phiên không còn hiệu lực. Đăng nhập lại.' });
    if (Date.now() - p.luc > HAN_PHIEN_MS) { phien.delete(ma); return traJSON(res, 401, { ok: false, error: 'Phiên đã hết hạn.' }); }
    /* Gói mẫu đi đường riêng: src/kho-khoa.js đọc thẳng đối tượng JSON của
       nó, không phải bọc {ok, du}. Bọc nhầm là chế độ mẫu trắng trơn mà
       không một dòng lỗi nào. */
    if (ten === 'mau') {
      const m = p.mo.get('mau');
      if (!m) return traJSON(res, 404, { ok: false, error: 'Máy chủ không có gói mẫu' });
      res.writeHead(200, dauTinh('.json', m.length));
      return res.end(m);
    }
    const b = p.mo.get(ten);
    if (!b) {
      bao('Xin gói ngoài phạm vi', p.taiKhoan + ' (' + p.vai + ') xin gói "' + ten + '"', 'Đã từ chối');
      return traJSON(res, 403, { ok: false, error: 'Vai này không được cấp gói ' + ten });
    }
    return traJSON(res, 200, { ok: true, du: b.toString('base64') });
  }

  /* ── Tệp tĩnh của ứng dụng ── */
  if (req.method !== 'GET' && req.method !== 'HEAD')
    return traJSON(res, 405, { ok: false, error: 'Cách gọi không được phép' });

  if (duong === '/' || duong === '/index.html') {
    const b = Buffer.from(trangKhach(), 'utf8');
    res.writeHead(200, dauTinh('.html', b.length));
    return res.end(req.method === 'HEAD' ? undefined : b);
  }
  /* Service worker: máy khách không được có. Trả tệp rỗng thay vì 404 để
     trình duyệt gỡ bản đã đăng ký từ lần trước, nếu có. */
  if (duong === '/sw.js') {
    const b = Buffer.from("self.addEventListener('install',()=>self.skipWaiting());\n" +
      "self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.map(x=>caches.delete(x))))));\n", 'utf8');
    res.writeHead(200, dauTinh('.js', b.length));
    return res.end(b);
  }

  const that = path.normalize(path.join(goc, duong));
  if (!that.startsWith(goc + path.sep)) return traJSON(res, 403, { ok: false, error: 'Không được phép' });
  const duoi = path.extname(that).toLowerCase();
  if (!MIME[duoi]) return traJSON(res, 403, { ok: false, error: 'Loại tệp này không phục vụ' });
  if (!fs.existsSync(that) || !fs.statSync(that).isFile()) return traJSON(res, 404, { ok: false, error: 'Không có' });

  const b = fs.readFileSync(that);
  res.writeHead(200, dauTinh(duoi, b.length));
  res.end(req.method === 'HEAD' ? undefined : b);
}

/* ─────────── Cấp phép: duyệt máy, rồi mã hoá lại theo vai ─────────── */
function capPhep(req, res, van, d) {
  if (!d || d.fn !== 'capKhoa')
    return traJSON(res, 400, { ok: false, error: 'Máy chủ này chỉ cấp khoá mở kho. Đổi mật khẩu và đồng bộ vẫn đi qua máy chủ của Học viện.' });

  let m = mayQuen.get(van);
  if (!m) {
    m = { ten: tenMay(req), duyet: 'cho', luc: Date.now(), lanCuoi: Date.now(), soPhien: 0, taiKhoan: d.u || '' };
    mayQuen.set(van, m);
    bao('Máy lạ xin vào', m.ten + ' — tài khoản ' + (d.u || 'chưa rõ'), 'Đang chờ chủ hệ thống duyệt');
  }
  m.lanCuoi = Date.now();
  m.taiKhoan = d.u || m.taiKhoan;

  if (m.duyet === 'chan')
    return traJSON(res, 403, { ok: false, code: 'BICHAN', error: 'Máy này đã bị chủ hệ thống cắt quyền dùng.' });
  if (m.duyet !== 'thuan')
    return traJSON(res, 403, { ok: false, code: 'CHODUYET', error: 'Máy này đang chờ chủ hệ thống duyệt. Báo với anh Quang rồi thử lại.' });

  const khoaGoc = layKhoaGoc && layKhoaGoc();
  if (!khoaGoc)
    return traJSON(res, 503, { ok: false, error: 'Máy chủ chưa kích hoạt giấy phép nên chưa mở kho được.' });

  /* ── Phạm vi do MÁY CHỦ quyết, không do máy khách khai ──
     d.vai là chữ máy khách gửi lên; máy khách nào cũng gõ được "R01" vào đó.
     Nên máy chủ bỏ qua nó và tra bảng cấp phát theo TÊN ĐĂNG NHẬP. Tài khoản
     lạ thì không có dòng nào trong bảng, và không gói nào được mã hoá cho nó. */
  const bang = (layBangCap && layBangCap()) || {};
  const hoSo = bang[String(d.u || '').toLowerCase()];
  if (!hoSo) {
    bao('Từ chối cấp khoá', tenMay(req) + ' đăng nhập "' + (d.u || '') + '"', 'Không có tài khoản này trong bảng cấp phát');
    return traJSON(res, 403, { ok: false, error: 'Tài khoản này chưa có trong bảng cấp phát của máy chủ.' });
  }
  if (d.vai && d.vai !== hoSo.vai)
    bao('Máy khách khai sai vai', (d.u || '') + ' khai "' + d.vai + '", hồ sơ là "' + hoSo.vai + '"', 'Đã dùng vai trong hồ sơ');

  /* Lọc TRƯỚC khi mã. Gói ngoài phạm vi không được sinh ra bản mã nào cả —
     máy khách không có gì để mà tải. */
  const xin = Array.isArray(d.goi) ? d.goi : [];
  const duoc = hoSo.goi || [];
  const ds = xin.filter(t => duoc.indexOf(t) >= 0 && khoaGoc[t]);

  const maPhien = crypto.randomBytes(24).toString('base64url');
  const p = { van, vai: hoSo.vai, taiKhoan: d.u || '', mo: new Map(), khoa: {}, luc: Date.now() };
  const truot = [];
  for (const ten of ds) {
    let ro;
    try { ro = moGoiGoc(ten, khoaGoc[ten]); }
    catch (e) { ro = null; truot.push(ten + ': ' + (e && e.message || e)); }
    if (!ro) { if (truot.indexOf(ten) < 0 && !truot.some(x => x.startsWith(ten + ':'))) truot.push(ten + ': không mở được'); continue; }
    const r = maLai(ro);
    p.mo.set(ten, r.goi);
    p.khoa[ten] = r.khoa;
  }

  /* ── Không được trả "xong" với bàn tay trắng ──
     Bộ khoá sai định dạng, hay bảy tệp .enc thiếu, thì vòng lặp trên chạy
     hết mà không mở nổi gói nào — và nếu chỗ này vẫn trả ok:true kèm khoá
     rỗng thì máy khách rơi về chế độ mẫu, không một dòng lỗi nào, còn chủ
     hệ thống thì tưởng máy chủ đang phục vụ tử tế.

     Đây đúng kiểu hỏng đã bắt được một lần ở G.hdConThieu: đạt rỗng.
     Xin có gói mà không mở được gói nào là HỎNG, phải nói ra. */
  if (ds.length && !p.mo.size) {
    bao('Máy chủ không mở được kho', 'Xin ' + ds.length + ' gói, mở được 0. ' + truot.join(' · '),
      'Đã báo hỏng cho máy khách — kiểm lại tệp giấy phép trên máy chủ');
    return traJSON(res, 500, { ok: false, code: 'KHONGMO',
      error: 'Máy chủ có giấy phép nhưng không mở được gói nào. Kiểm lại tệp giấy phép trên máy chủ.' });
  }
  if (truot.length)
    bao('Một số gói không mở được', truot.join(' · '), 'Phiên vẫn cấp cho ' + p.mo.size + ' gói còn lại');
  /* Gói mẫu cũng qua đường này — bản tĩnh đọc kho/mau.json cạnh trang,
     mà cạnh trang thì máy khách không được vào. */
  try {
    /* Gói mẫu vốn đã công khai — nó chính là thứ bản web cho người chưa
       đăng nhập xem — nên không mã hoá lại. Nhưng vẫn phải đi qua phiên,
       vì đường /kho/ đã chặn cứng ở trên. */
    p.mo.set('mau', fs.readFileSync(path.join(goc, 'kho', 'mau.json')));
  } catch { /* không có mẫu thì thôi */ }

  phien.set(maPhien, p);
  m.soPhien++;
  ghiMayQuen();
  bao('Cấp khoá phiên', m.ten + ' · ' + (d.u || '?') + ' · vai ' + hoSo.vai,
    ds.length + ' gói, khoá dùng một lần, hết hạn sau 8 giờ');

  traJSON(res, 200, {
    ok: true, khoa: p.khoa, phien: maPhien,
    hetHan: new Date(Date.now() + HAN_PHIEN_MS).toISOString()
  });
}

function bao(viec, chiTiet, ket) {
  if (ghiNhatKy) { try { ghiNhatKy({ viec, chiTiet, ket, luc: new Date().toISOString() }); } catch {} }
}

/* ─────────── Địa chỉ để đọc cho người khác gõ ─────────── */
function diaChi() {
  const ra = [];
  const m = os.networkInterfaces();
  for (const ten of Object.keys(m))
    for (const c of m[ten] || [])
      if (c.family === 'IPv4' && !c.internal) ra.push('http://' + c.address + ':' + cong);
  if (!ra.length) ra.push('http://127.0.0.1:' + cong);
  return ra;
}

/* ─────────── API cho main.js ─────────── */
function bat(o) {
  if (may) return { ok: true, dangChay: true, diaChi: diaChi() };
  goc = o.goc;
  cong = o.cong || CONG_MAC_DINH;
  layKhoaGoc = o.layKhoaGoc;
  layBangCap = o.layBangCap;
  ghiNhatKy = o.ghiNhatKy;
  tepMayQuen = o.tepMayQuen;
  docMayQuen();

  return new Promise((thanh, hong) => {
    may = http.createServer(xuLy);
    may.on('error', e => { may = null; hong(e); });
    may.listen(cong, '0.0.0.0', () => {
      bao('Bật phục vụ máy khác', diaChi().join('  ·  '), 'Đang chạy');
      thanh({ ok: true, diaChi: diaChi(), cong });
    });
  });
}

function tat() {
  if (!may) return { ok: true, dangChay: false };
  for (const [, p] of phien) p.mo.clear();
  phien.clear();
  may.close();
  may = null;
  bao('Tắt phục vụ máy khác', 'Mọi phiên bị cắt, bản mã trong bộ nhớ đã xoá', 'Đã dừng');
  return { ok: true, dangChay: false };
}

function dangChay() { return !!may; }

function danhSachMay() {
  don();
  const ra = [];
  for (const [van, m] of mayQuen) {
    let dangMo = 0;
    for (const [, p] of phien) if (p.van === van) dangMo++;
    ra.push({ van, ten: m.ten, duyet: m.duyet, taiKhoan: m.taiKhoan || '', luc: m.luc, lanCuoi: m.lanCuoi, soPhien: m.soPhien || 0, dangMo });
  }
  return ra.sort((a, b) => b.lanCuoi - a.lanCuoi);
}

/* Duyệt, chặn, hoặc quên hẳn một máy.
   Chặn phải CẮT NGAY phiên đang mở — nếu chỉ chặn lần xin sau thì người
   đang ngồi đó vẫn dùng tiếp tới tám tiếng. Cắt là xoá bản mã trong bộ
   nhớ máy chủ: máy khách tải lại một cái là trắng. */
function datMay(van, duyet) {
  const m = mayQuen.get(van);
  if (!m) return { ok: false, ly: 'Không có máy này trong danh sách' };
  if (duyet === 'quen') {
    mayQuen.delete(van);
    for (const [ma, p] of phien) if (p.van === van) { p.mo.clear(); phien.delete(ma); }
    ghiMayQuen();
    bao('Quên máy', m.ten, 'Đã xoá khỏi danh sách, phiên bị cắt');
    return { ok: true };
  }
  m.duyet = duyet;
  if (duyet !== 'thuan')
    for (const [ma, p] of phien) if (p.van === van) { p.mo.clear(); phien.delete(ma); }
  ghiMayQuen();
  bao(duyet === 'thuan' ? 'Duyệt máy' : 'Cắt quyền máy', m.ten,
    duyet === 'thuan' ? 'Được dùng' : 'Phiên đang mở đã bị cắt ngay');
  return { ok: true };
}

module.exports = { bat, tat, dangChay, danhSachMay, datMay, diaChi, CONG_MAC_DINH };
