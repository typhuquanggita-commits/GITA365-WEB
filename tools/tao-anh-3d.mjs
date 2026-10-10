/* Tạo ảnh minh hoạ 3D (người Việt thật · hoạt động gia đình) cho các phần
   của web app, từ đề bài tools/anh-3d/de-bai.json.

   Chạy trên máy GitHub Actions (workflow tao-anh-3d.yml), KHÔNG chạy trong
   trình duyệt: khoá Cloudflare nằm ở GitHub Secrets, không bao giờ vào kho.

   Mô hình: @cf/black-forest-labs/flux-1-schnell trên Workers AI — giấy phép
   Apache-2.0 (dùng thương mại được). Trần TRAN_ANH ảnh mỗi lượt và SO_BUOC
   bước để nằm trong phần miễn phí hằng ngày (~10.000 neuron; một ảnh 6 bước
   ≈ 75 neuron). Lời nhắc là tiếng Anh chung chung về cảnh gia đình — KHÔNG
   có tên người hay dữ liệu của gia đình nào (Điều 13); bộ soát chặn mọi lời
   nhắc có ký tự ngoài ASCII để một cái tên có dấu không lọt ra ngoài.

   Dùng: CLOUDFLARE_ACCOUNT_ID=… CLOUDFLARE_API_TOKEN=… \
         node tools/tao-anh-3d.mjs <thư-mục-ra> [mã,mã,…] */
import fs from 'node:fs';
import path from 'node:path';

const MO_HINH = '@cf/black-forest-labs/flux-1-schnell';
const TRAN_ANH = 24, SO_BUOC = 6;

const ra = process.argv[2];
if (!ra) { console.error('Dùng: node tools/tao-anh-3d.mjs <thư-mục-ra> [mã,…]'); process.exit(2); }
const chon = (process.argv[3] || '').split(',').filter(Boolean);
const de = JSON.parse(fs.readFileSync(new URL('./anh-3d/de-bai.json', import.meta.url), 'utf8'));
const ds = de.anh.filter(a => !chon.length || chon.includes(a.ma));
if (ds.length > TRAN_ANH) { console.error('Quá trần ' + TRAN_ANH + ' ảnh một lượt.'); process.exit(1); }
for (const a of ds) {
  const p = a.p + ', ' + de.phongCach;
  if (!/^[\x20-\x7E]+$/.test(p)) { console.error(a.ma + ': lời nhắc có ký tự ngoài ASCII — không gửi.'); process.exit(1); }
  if (p.length > 2048) { console.error(a.ma + ': lời nhắc dài quá 2048 ký tự.'); process.exit(1); }
}
const acc = process.env.CLOUDFLARE_ACCOUNT_ID, tok = process.env.CLOUDFLARE_API_TOKEN;
if (!acc || !tok) { console.error('Thiếu CLOUDFLARE_ACCOUNT_ID / CLOUDFLARE_API_TOKEN.'); process.exit(3); }

fs.mkdirSync(ra, { recursive: true });
const url = 'https://api.cloudflare.com/client/v4/accounts/' + acc + '/ai/run/' + MO_HINH;
let dat = 0;
for (const a of ds) {
  const prompt = a.p + ', ' + de.phongCach;
  let lan = 0, xong = false;
  while (!xong && lan < 3) {
    lan++;
    const r = await fetch(url, { method: 'POST', headers: { Authorization: 'Bearer ' + tok, 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, steps: SO_BUOC, seed: 365 + de.anh.indexOf(a) }) });
    const loai = r.headers.get('content-type') || '';
    if (r.status === 401 || r.status === 403) {
      console.error('Khoá Cloudflare không có quyền Workers AI (HTTP ' + r.status + ').');
      process.exit(4);
    }
    if (!r.ok) { console.error(a.ma + ': HTTP ' + r.status + ' lần ' + lan); await new Promise(z => setTimeout(z, 3000 * lan)); continue; }
    let buf;
    if (loai.includes('application/json')) {
      const j = await r.json();
      const b64 = j && j.result && j.result.image;
      if (!b64) { console.error(a.ma + ': không có ảnh trong trả lời'); continue; }
      buf = Buffer.from(b64, 'base64');
    } else buf = Buffer.from(await r.arrayBuffer());
    fs.writeFileSync(path.join(ra, a.ma + '.jpg'), buf);
    console.log('✓ ' + a.ma + ' · ' + Math.round(buf.length / 1024) + ' KB');
    dat++; xong = true;
  }
}
fs.writeFileSync(path.join(ra, 'nguon.json'), JSON.stringify({ moHinh: MO_HINH, giayPhep: 'Apache-2.0', soBuoc: SO_BUOC,
  luc: new Date().toISOString(), anh: ds.map(a => ({ ma: a.ma, ten: a.ten, alt: a.alt, p: a.p })) }, null, 1));
console.log(dat + '/' + ds.length + ' ảnh');
process.exit(dat === ds.length ? 0 : 1);
