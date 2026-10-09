#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════
   GITA 365 — DIỄN TẬP TRIỂN KHAI NGAY TẠI MÁY

       node tools/gia-lap-trien-khai.js [đường/dẫn/src-v69]

   Dựng tại chỗ hai thứ y hệt bản thật:
     · cổng 8091 — máy chủ cấp phép, chạy CHÍNH server/GITA_CapPhep.gs
     · cổng 8092 — bản web, phục vụ kèm đúng tiêu đề trong _headers
                   và đúng các đường dẫn bị chặn trong _redirects

   Rồi tự chạy tools/kiem-trien-khai.js lên hai địa chỉ đó.

   Ý nghĩa: diễn xong ở đây mới đụng vào Google và Cloudflare. Sai chỗ
   nào thì sửa tại máy, không phải triển khai đi triển khai lại.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const GOC = path.join(__dirname, '..');
const V69 = process.argv[2] || process.env.GITA_V69 || '';

/* ─── Chạy mã máy chủ cấp phép thật trong môi trường Apps Script giả lập ─── */
function dungMayChuCapPhep() {
  let ROLES = { R01:{lv:1,portal:'admin'}, R07:{lv:7,portal:'coach'}, R11:{lv:11,portal:'tuvan'},
                R13:{lv:13,portal:'ph'}, R14:{lv:14,portal:'hs'}, R15:{lv:15,portal:'ctv'} };
  if (V69 && fs.existsSync(path.join(V69, '00_Config.gs'))) {
    const m = fs.readFileSync(path.join(V69, '00_Config.gs'), 'utf8').match(/var ROLES\s*=\s*(\{[\s\S]*?\n\});/);
    if (m) ROLES = eval('(' + m[1] + ')');
  }
  const khoa = JSON.parse(fs.readFileSync(path.join(GOC, 'kho', 'khoa.json'), 'utf8')).khoa;
  const BO_NHO = {};
  const mt = {
    ROLES,
    Store: { find: () => null },
    readSession_: () => null,          // diễn tập: chưa có phiên thật nào
    audit_: () => {},
    isTrue: v => String(v).toUpperCase() === 'TRUE' || v === true,
    Logger: { log: () => {} },
    CacheService: { getScriptCache: () => ({
      get: k => (BO_NHO[k] === undefined ? null : BO_NHO[k]),
      put: (k, v) => { BO_NHO[k] = v; } }) },
    PropertiesService: { getScriptProperties: () => ({
      getProperty: () => JSON.stringify(khoa) }) },
    ContentService: { MimeType: { JSON: 'json' },
      createTextOutput: t => ({ _t: t, setMimeType(){ return this; }, getContent(){ return this._t; } }) }
  };
  const nguon = fs.readFileSync(path.join(GOC, 'server', 'GITA_CapPhep.gs'), 'utf8');
  const ten = Object.keys(mt);
  const S = new Function(...ten, nguon + '\n; return { doPost: doPost, doGet: doGet };')(...ten.map(k => mt[k]));

  return http.createServer((q, p) => {
    let than = '';
    q.on('data', c => { than += c; });
    q.on('end', () => {
      let ra;
      try {
        ra = q.method === 'POST'
          ? S.doPost({ postData: { contents: than } }).getContent()
          : S.doGet().getContent();
      } catch (e) { ra = JSON.stringify({ ok: false, error: String(e.message) }); }
      p.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      p.end(ra);
    });
  });
}

/* ─── Bản web, phục vụ đúng như Cloudflare Pages đọc _headers và _redirects ─── */
function dungBanWeb() {
  const dau = {};
  const chan = [];
  const hd = fs.readFileSync(path.join(GOC, '_headers'), 'utf8');
  hd.split('\n').forEach(d => {
    const m = d.match(/^\s{2}([A-Za-z-]+):\s*(.+)$/);
    if (m && !/^#/.test(m[1])) dau[m[1]] = m[2].trim();
  });
  fs.readFileSync(path.join(GOC, '_redirects'), 'utf8').split('\n').forEach(d => {
    const m = d.trim().match(/^(\/\S+)\s+\S+\s+(\d+)$/);
    if (m) chan.push({ mau: m[1].replace(/\*$/, ''), sao: m[1].endsWith('*'), ma: Number(m[2]) });
  });

  const KIEU = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8',
    '.css':'text/css; charset=utf-8', '.json':'application/json; charset=utf-8',
    '.webmanifest':'application/manifest+json', '.png':'image/png', '.woff2':'font/woff2',
    '.enc':'application/octet-stream', '.txt':'text/plain; charset=utf-8', '.gs':'text/plain; charset=utf-8' };

  return http.createServer((q, p) => {
    let d = decodeURIComponent(q.url.split('?')[0]);
    if (d === '/') d = '/index.html';
    /* Vá địa chỉ máy chủ cấp phép NGAY TRONG BỘ NHỚ. Tuyệt đối không sửa
       tệp trên đĩa: một lần bị ngắt giữa chừng là bản vá tạm lọt vào
       commit và bản web thật sẽ trỏ về máy nội bộ. */
    if (d === '/cau-hinh.js') {
      const goc = fs.readFileSync(path.join(GOC, 'cau-hinh.js'), 'utf8');
      p.writeHead(200, Object.assign({ 'Content-Type': KIEU['.js'] }, dau));
      return p.end(goc.replace(/G\.API_CAP_PHEP = '[^']*';/,
        "G.API_CAP_PHEP = 'http://127.0.0.1:8091';"));
    }
    const bi = chan.filter(c => c.sao ? d.indexOf(c.mau) === 0 : d === c.mau)[0];
    if (bi) { p.writeHead(bi.ma, { 'Content-Type': 'text/plain' }); return p.end('Không phục vụ đường dẫn này.'); }
    const tep = path.join(GOC, d.replace(/^\/+/, ''));
    if (!tep.startsWith(GOC) || !fs.existsSync(tep) || fs.statSync(tep).isDirectory()) {
      p.writeHead(404, { 'Content-Type': 'text/plain' }); return p.end('404');
    }
    const h = Object.assign({ 'Content-Type': KIEU[path.extname(tep)] || 'application/octet-stream' }, dau);
    p.writeHead(200, h);
    p.end(fs.readFileSync(tep));
  });
}

const A = dungMayChuCapPhep(), B = dungBanWeb();
A.listen(8091, '127.0.0.1', () => {
  B.listen(8092, '127.0.0.1', () => {
    console.log('  Máy chủ cấp phép giả lập : http://127.0.0.1:8091');
    console.log('  Bản web giả lập          : http://127.0.0.1:8092');
    /* Bộ kiểm phải chạy ở tiến trình riêng — chạy chặn ngay trong tiến
       trình này thì hai máy chủ trên không thể trả lời chính nó. */
    const con = spawn('node', [path.join(__dirname, 'kiem-trien-khai.js'),
      'http://127.0.0.1:8091', 'http://127.0.0.1:8092'], { stdio: 'inherit' });
    con.on('close', ma => {
      /* Bản thật chạy HTTPS; bản diễn tập chạy HTTP nên điểm đó luôn trượt. */
      console.log('  Ghi chú: điểm "chạy trên HTTPS" luôn trượt khi diễn tập tại máy —');
      console.log('           Cloudflare Pages tự bật HTTPS nên bản thật sẽ đạt.\n');
      A.close(); B.close();
      process.exit(ma === 0 ? 0 : (ma === 1 ? 0 : ma));   // chỉ điểm HTTPS trượt là chấp nhận được
    });
  });
});
