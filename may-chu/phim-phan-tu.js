/* ═══════════════════════════════════════════════════════════════
   GITA 365 · PHIM PHÂN TỬ

   Không lưu file video. Một phim là một công thức ngắn trong D1:
   thứ tự cảnh, câu thoại, mã động tác, mã máy quay. Ảnh dùng chung
   nằm một lần trong R2. Bấm link thì trình duyệt ghép lại.

   Động tác là công thức (thở, giơ tay, quay đầu, một bước), không phải
   video. Chạy, đánh, nhảy không có trong thư viện — không có mô hình
   video trên Cloudflare.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
import { laR01 } from './vai-tro.js';

export const MAY = {
  dung: { x: 0.5, y: 0.55, z: 1, x2: 0.5, y2: 0.54, z2: 1.06 },
  day: { x: 0.5, y: 0.52, z: 1, x2: 0.5, y2: 0.4, z2: 1.22 },
  lia: { x: 0.38, y: 0.5, z: 1.08, x2: 0.62, y2: 0.5, z2: 1.08 },
  cat: { x: 0.5, y: 0.48, z: 1.12, x2: 0.5, y2: 0.48, z2: 1.12 }
};
export const NHIP = ['tho', 'gio-tay', 'quay-dau', 'buoc'];
const NEN = ['troi-sang', 'troi-chieu', 'phong', 'dem'];
const MA_MAU = 'mau-gita-365';
let daTao = false;

function chu(v, n) { return String(v == null ? '' : v).replace(/[\u0000-\u001F]/g, ' ').trim().slice(0, n); }
function maMoi() {
  const b = new Uint8Array(16); crypto.getRandomValues(b);
  return [...b].map(x => x.toString(16).padStart(2, '0')).join('');
}
function loi(code, error) { return { ok: false, code, error }; }

export async function taoBangPhanTu(db) {
  if (daTao) return;
  await db.prepare(`CREATE TABLE IF NOT EXISTS phim_pt_cong_thuc (
    ma TEXT PRIMARY KEY, uid TEXT NOT NULL, ten TEXT NOT NULL, noiDung TEXT NOT NULL, taoLuc INTEGER NOT NULL)`).run();
  await db.prepare(`CREATE TABLE IF NOT EXISTS phim_pt_hat (
    ma TEXT PRIMARY KEY, bam TEXT NOT NULL UNIQUE, loai TEXT NOT NULL, mime TEXT NOT NULL, byte INTEGER NOT NULL, soLan INTEGER NOT NULL DEFAULT 1)`).run();
  daTao = true;
}

export function mayTheoMa(ma) { return MAY[ma] || MAY.dung; }

function mauCongThuc() {
  return {
    ten: 'Mẫu — ghép từ công thức',
    canh: [
      { giay: 4, may: 'lia', nen: 'troi-sang', nhip: 'tho', nhan: 'Người dẫn', loi: 'Đây không phải file video. Bấm link là máy ghép lại từ công thức.' },
      { giay: 4, may: 'day', nen: 'phong', nhip: 'gio-tay', nhan: 'Người dẫn', loi: 'Người chỉ thở, giơ tay, quay đầu hoặc bước một bước. Không chạy, không đánh, không nhảy.' },
      { giay: 4, may: 'cat', nen: 'troi-chieu', nhip: 'quay-dau', nhan: 'Người dẫn', loi: 'Ảnh và câu thoại dùng chung. Phim khác chỉ lưu công thức mới, không lưu lại cả file.' },
      { giay: 4, may: 'dung', nen: 'dem', nhip: 'buoc', nhan: 'Người dẫn', loi: 'Xem lại cũng là link này. Không cần GPU. Cloudflare không có máy quay phim AI.' }
    ]
  };
}

function chuanCanh(raw) {
  const ds = (Array.isArray(raw) ? raw : []).slice(0, 12);
  if (ds.length < 1) return loi('THIEU_CANH', 'Cần ít nhất một cảnh.');
  const ra = [];
  for (const c of ds) {
    const may = MAY[c.may] ? c.may : 'dung';
    const nhip = NHIP.indexOf(c.nhip) >= 0 ? c.nhip : 'tho';
    const nen = NEN.indexOf(c.nen) >= 0 ? c.nen : 'phong';
    const giay = Math.min(8, Math.max(2, Math.round(Number(c.giay) || 4)));
    const mot = { giay, may, nen, nhip, nhan: chu(c.nhan, 40), loi: chu(c.loi, 180) };
    const nenH = chu(c.hatNen, 32);
    const nguoiH = chu(c.hatNguoi, 32);
    if (nenH) mot.hatNen = nenH;
    if (nguoiH) mot.hatNguoi = nguoiH;
    ra.push(mot);
  }
  return { ok: true, canh: ra };
}

async function bamByte(u8) {
  const d = await crypto.subtle.digest('SHA-256', u8);
  return [...new Uint8Array(d)].map(x => x.toString(16).padStart(2, '0')).join('');
}

function docAnh(s) {
  const t = String(s || '');
  const m = t.match(/^data:image\/(jpeg|png);base64,([A-Za-z0-9+/=\s]+)$/);
  const b64 = m ? m[2] : t;
  const mime = m ? (m[1] === 'png' ? 'image/png' : 'image/jpeg') : '';
  if (!/^[A-Za-z0-9+/=\s]+$/.test(b64) || b64.length < 32 || b64.length > 500000) return null;
  let u;
  try { u = Uint8Array.from(atob(b64.replace(/\s/g, '')), c => c.charCodeAt(0)); } catch (e) { return null; }
  if (u.length < 32 || u.length > 350000) return null;
  const jpg = u[0] === 0xFF && u[1] === 0xD8 && u[2] === 0xFF;
  const png = u[0] === 0x89 && u[1] === 0x50 && u[2] === 0x4E && u[3] === 0x47;
  if (!jpg && !png) return null;
  return { u, mime: mime || (png ? 'image/png' : 'image/jpeg') };
}

async function luuHat(env, db, anh, loai) {
  if (!env.HOSO) return loi('CHUA_CO_R2', 'Máy chủ chưa gắn kho tệp.');
  const bam = await bamByte(anh.u);
  const co = await db.prepare('SELECT ma FROM phim_pt_hat WHERE bam = ?').bind(bam).first();
  if (co) {
    await db.prepare('UPDATE phim_pt_hat SET soLan = soLan + 1 WHERE ma = ?').bind(co.ma).run();
    return { ok: true, ma: co.ma, trung: true, byte: anh.u.length };
  }
  const ma = maMoi();
  await env.HOSO.put('pt/' + bam, anh.u, { httpMetadata: { contentType: anh.mime } });
  await db.prepare('INSERT INTO phim_pt_hat (ma, bam, loai, mime, byte, soLan) VALUES (?, ?, ?, ?, ?, 1)')
    .bind(ma, bam, loai, anh.mime, anh.u.length).run();
  return { ok: true, ma, trung: false, byte: anh.u.length };
}

async function ghiCongThuc(db, uid, ten, canh, maCo) {
  const ma = maCo || maMoi();
  const noi = JSON.stringify({ ten, canh });
  if (maCo) {
    await db.prepare('INSERT INTO phim_pt_cong_thuc (ma, uid, ten, noiDung, taoLuc) VALUES (?, ?, ?, ?, ?) ON CONFLICT(ma) DO UPDATE SET noiDung = excluded.noiDung, ten = excluded.ten')
      .bind(ma, uid, ten, noi, Date.now()).run();
  } else {
    await db.prepare('INSERT INTO phim_pt_cong_thuc (ma, uid, ten, noiDung, taoLuc) VALUES (?, ?, ?, ?, ?)')
      .bind(ma, uid, ten, noi, Date.now()).run();
  }
  return { ma, byteCongThuc: noi.length };
}

export async function damBaoMau(env, db) {
  await taoBangPhanTu(db);
  const co = await db.prepare('SELECT ma FROM phim_pt_cong_thuc WHERE ma = ?').bind(MA_MAU).first();
  const mau = mauCongThuc();
  if (!co) await ghiCongThuc(db, 'he-thong', mau.ten, mau.canh, MA_MAU);
  return { ok: true, ma: MA_MAU, link: '/phim/xem/' + MA_MAU, daCo: !!co };
}

export async function dongGoiPhanTu(y, env, db, hoSo) {
  if (!laR01(hoSo)) return loi('NOPERM', 'Chỉ chủ hệ đóng gói phim.');
  await taoBangPhanTu(db);
  if (y && y.mau === true) return await damBaoMau(env, db);
  const ten = chu(y && y.ten, 80) || 'Phim ghép';
  const ch = chuanCanh(y && y.canh);
  if (!ch.ok) return ch;
  const anh = Array.isArray(y.anh) ? y.anh.slice(0, 8) : [];
  const hat = {};
  let byteAnh = 0, trung = 0;
  for (const a of anh) {
    const khoa = chu(a.khoa, 20);
    const doc = docAnh(a.duLieu);
    if (!khoa || !doc) return loi('ANH', 'Ảnh phải là JPEG hoặc PNG, mỗi ảnh dưới 350 KB.');
    const luu = await luuHat(env, db, doc, a.loai === 'nguoi' ? 'nguoi' : 'nen');
    if (!luu.ok) return luu;
    hat[khoa] = luu.ma;
    byteAnh += doc.u.length;
    if (luu.trung) trung++;
  }
  for (const c of ch.canh) {
    if (c.hatNen && hat[c.hatNen]) c.hatNen = hat[c.hatNen];
    if (c.hatNguoi && hat[c.hatNguoi]) c.hatNguoi = hat[c.hatNguoi];
    if (c.hatNen && !/^[0-9a-f]{32}$/.test(c.hatNen)) delete c.hatNen;
    if (c.hatNguoi && !/^[0-9a-f]{32}$/.test(c.hatNguoi)) delete c.hatNguoi;
  }
  const g = await ghiCongThuc(db, hoSo.uid || 'r01', ten, ch.canh);
  const giay = ch.canh.reduce((s, c) => s + c.giay, 0);
  return {
    ok: true, ma: g.ma, link: '/phim/xem/' + g.ma,
    byteCongThuc: g.byteCongThuc, byteAnh, anhTrung: trung,
    byteNeuLuuVideo: giay * 250000,
    ghiChu: 'Đã lưu công thức, không lưu file video. Người chỉ nhích theo công thức. Chạy, đánh, nhảy chưa làm được.'
  };
}

export async function xemPhanTu(y, env, db, hoSo) {
  if (!laR01(hoSo)) return loi('NOPERM', 'Chỉ chủ hệ xem kho phim.');
  await taoBangPhanTu(db);
  const ds = await db.prepare('SELECT ma, ten, taoLuc, length(noiDung) AS byte FROM phim_pt_cong_thuc WHERE uid = ? OR ma = ? ORDER BY taoLuc DESC LIMIT 30')
    .bind(hoSo.uid || '', MA_MAU).all();
  const hat = await db.prepare('SELECT COUNT(*) AS so, COALESCE(SUM(byte), 0) AS byte FROM phim_pt_hat').first();
  return { ok: true, ds: (ds && ds.results) || [], hat: hat || { so: 0, byte: 0 } };
}

function jsonCongKhai(noi) {
  let o;
  try { o = JSON.parse(noi); } catch (e) { return null; }
  if (!o || !Array.isArray(o.canh)) return null;
  return { ten: chu(o.ten, 80), canh: o.canh };
}

const DAU = { 'Access-Control-Allow-Origin': '*', 'X-Content-Type-Options': 'nosniff' };

function trangXem() {
  return `<!DOCTYPE html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Phim GITA</title><style>
body{margin:0;background:#111;color:#f3efe6;font-family:Segoe UI,sans-serif;display:flex;flex-direction:column;align-items:center}
p{max-width:420px;font-size:14px;line-height:1.45;padding:0 16px}
canvas{width:min(92vw,360px);height:auto;background:#000;border-radius:8px}
button{margin:12px;padding:8px 16px}
</style></head><body>
<p id="chu">Đang ghép phim từ công thức. Không tải file video.</p>
<canvas id="man" width="360" height="640"></canvas>
<button id="lai" type="button">Xem lại</button>
<script>
const ma = location.pathname.split('/').pop();
const MAY = ${JSON.stringify(MAY)};
const man = document.getElementById('man');
const ctx = man.getContext('2d');
let phim = null, i = 0, t0 = 0, chay = false, anh = {};
function lerp(a,b,t){return a+(b-a)*t}
function cam(c,t){
  const m = MAY[c.may] || MAY.dung;
  const k = t*t*(3-2*t);
  return {x:lerp(m.x,m.x2,k), y:lerp(m.y,m.y2,k), z:lerp(m.z,m.z2,k)};
}
function nen(ten){
  const g = ctx.createLinearGradient(0,0,0,640);
  if(ten==='troi-chieu'){g.addColorStop(0,'#c46a3a');g.addColorStop(1,'#2a211c')}
  else if(ten==='dem'){g.addColorStop(0,'#1b2744');g.addColorStop(1,'#0c0e14')}
  else if(ten==='phong'){g.addColorStop(0,'#d8c7a8');g.addColorStop(1,'#6d5b48')}
  else {g.addColorStop(0,'#8ec6e8');g.addColorStop(1,'#d7c39a')}
  ctx.fillStyle=g; ctx.fillRect(0,0,360,640);
}
function nguoi(c, t, giay){
  const k = Math.min(1, t/Math.max(0.2, giay));
  let sx = Math.sin(t*1.4)*8, sy = Math.sin(t*1.8)*3, tay = -0.2, dau = 0;
  if(c.nhip==='gio-tay') tay = -0.2 - k*1.1;
  if(c.nhip==='quay-dau') dau = Math.sin(k*Math.PI)*14;
  if(c.nhip==='buoc') sx += k*28 - 14;
  const x = 180+sx+dau, y = 390+sy;
  ctx.save(); ctx.translate(x,y); ctx.strokeStyle='#1c140f'; ctx.fillStyle='#1c140f'; ctx.lineWidth=8; ctx.lineCap='round';
  ctx.beginPath(); ctx.arc(0,-78,22,0,6.3); ctx.fill();
  ctx.beginPath(); ctx.moveTo(0,-54); ctx.lineTo(0,20); ctx.moveTo(0,-30); ctx.lineTo(-28,10);
  ctx.moveTo(0,-30); ctx.lineTo(Math.cos(tay)*36, Math.sin(tay)*36); ctx.moveTo(0,20); ctx.lineTo(-16,70); ctx.moveTo(0,20); ctx.lineTo(16,70); ctx.stroke();
  ctx.restore();
}
function veAnh(img, x, y, w, h){
  const s = Math.max(w/img.width, h/img.height);
  const dw = img.width*s, dh = img.height*s;
  ctx.drawImage(img, x+(w-dw)/2, y+(h-dh)/2, dw, dh);
}
function ve(c, t){
  const m = cam(c, Math.min(1, t/c.giay));
  ctx.save(); ctx.translate(360*m.x, 640*m.y); ctx.scale(m.z,m.z); ctx.translate(-180,-320);
  if(anh[c.hatNen]) veAnh(anh[c.hatNen], 0, 0, 360, 640); else nen(c.nen);
  if(anh[c.hatNguoi]){
    const sx = c.nhip==='buoc' ? (Math.min(1,t/c.giay)*28-14) : Math.sin(t*1.4)*8;
    veAnh(anh[c.hatNguoi], 90+sx, 180, 180, 320);
  } else nguoi(c, t, c.giay);
  ctx.restore();
  ctx.fillStyle='rgba(0,0,0,.55)'; ctx.fillRect(0,540,360,100);
  ctx.fillStyle='#fff'; ctx.font='16px Segoe UI'; ctx.fillText(c.nhan||'', 16, 568);
  ctx.font='15px Segoe UI';
  const loi = c.loi||'';
  ctx.fillText(loi.slice(0,42), 16, 594);
  if(loi.length>42) ctx.fillText(loi.slice(42,84), 16, 616);
}
function vong(now){
  if(!chay||!phim) return;
  const c = phim.canh[i];
  const t = (now-t0)/1000;
  if(t>=c.giay){ i++; if(i>=phim.canh.length){ chay=false; document.getElementById('chu').textContent='Hết phim. Bấm Xem lại để ghép lại. Không có file video.'; return; } t0=now; }
  ve(phim.canh[Math.min(i, phim.canh.length-1)], Math.max(0,(now-t0)/1000));
  requestAnimationFrame(vong);
}
function bat(){ i=0; t0=performance.now(); chay=true; requestAnimationFrame(vong); }
document.getElementById('lai').onclick=bat;
function tai(id){
  return new Promise(ok=>{
    if(!id||anh[id]) return ok();
    const im = new Image();
    im.onload=()=>{ anh[id]=im; ok(); };
    im.onerror=()=>ok();
    im.src='/phim/hat/'+ma+'/'+id;
  });
}
fetch('/phim/cong-thuc/'+ma).then(r=>r.json()).then(async j=>{
  phim=j;
  const ids=[];
  (j.canh||[]).forEach(c=>{ if(c.hatNen) ids.push(c.hatNen); if(c.hatNguoi) ids.push(c.hatNguoi); });
  for(const id of ids) await tai(id);
  document.getElementById('chu').textContent=j.ten+' — ghép tại máy bạn, không tải video.';
  bat();
}).catch(()=>{ document.getElementById('chu').textContent='Không ghép được phim này.'; });
</script></body></html>`;
}

export async function phucVuPhimPhanTu(req, env, duong) {
  if (req.method !== 'GET' && req.method !== 'HEAD')
    return new Response('Chỉ xem bằng đường dẫn.', { status: 405, headers: DAU });
  const db = env.CSDL;
  if (!db) return new Response('Chưa có cơ sở dữ liệu.', { status: 500, headers: DAU });
  await taoBangPhanTu(db);
  if (duong === '/phim/mau') {
    const m = await damBaoMau(env, db);
    return Response.redirect(new URL(m.link, req.url).toString(), 302);
  }
  let khop = duong.match(/^\/phim\/xem\/([0-9a-z-]{8,40})$/);
  if (khop) {
    const co = await db.prepare('SELECT ma FROM phim_pt_cong_thuc WHERE ma = ?').bind(khop[1]).first();
    if (!co) return new Response('Không có phim này.', { status: 404, headers: DAU });
    return new Response(req.method === 'HEAD' ? null : trangXem(), {
      status: 200,
      headers: { ...DAU, 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' }
    });
  }
  khop = duong.match(/^\/phim\/cong-thuc\/([0-9a-z-]{8,40})$/);
  if (khop) {
    const co = await db.prepare('SELECT ten, noiDung FROM phim_pt_cong_thuc WHERE ma = ?').bind(khop[1]).first();
    const o = co && jsonCongKhai(co.noiDung);
    if (!o) return new Response('{}', { status: 404, headers: DAU });
    return new Response(req.method === 'HEAD' ? null : JSON.stringify(o), {
      status: 200,
      headers: { ...DAU, 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'public, max-age=60' }
    });
  }
  khop = duong.match(/^\/phim\/hat\/([0-9a-z-]{8,40})\/([0-9a-f]{32})$/);
  if (khop) {
    const ct = await db.prepare('SELECT noiDung FROM phim_pt_cong_thuc WHERE ma = ?').bind(khop[1]).first();
    if (!ct || ct.noiDung.indexOf(khop[2]) < 0) return new Response('Không có ảnh.', { status: 404, headers: DAU });
    const hat = await db.prepare('SELECT bam, mime FROM phim_pt_hat WHERE ma = ?').bind(khop[2]).first();
    if (!hat || !env.HOSO) return new Response('Không có ảnh.', { status: 404, headers: DAU });
    const o = await env.HOSO.get('pt/' + hat.bam);
    if (!o) return new Response('Không có ảnh.', { status: 404, headers: DAU });
    return new Response(req.method === 'HEAD' ? null : o.body, {
      status: 200,
      headers: { ...DAU, 'Content-Type': hat.mime, 'Cache-Control': 'public, max-age=86400' }
    });
  }
  return new Response('Không có đường này.', { status: 404, headers: DAU });
}
