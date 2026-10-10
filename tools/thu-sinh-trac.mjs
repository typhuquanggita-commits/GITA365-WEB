/* Thử đăng nhập khuôn mặt (may-chu/sinh-trac.js) bằng một BỘ XÁC THỰC GIẢ
   chạy bằng WebCrypto: nó làm đúng việc Face ID / Windows Hello / điện thoại
   làm — sinh khoá ES256, dựng attestationObject (CBOR, fmt "none"), ký
   assertion trên authenticatorData || SHA-256(clientDataJSON).

   Vì sao cần: tới 10/10/2026 mô-đun này KHÔNG có bộ thử nào, và chủ hệ báo
   "lỗi check in khuôn mặt". Một nghi thức mật mã không bộ thử thì không ai
   biết nó hỏng ở bước nào.

   Đo: đăng ký trên máy này (platform) · đăng ký bằng điện thoại quét QR
   (cross-platform) · không còn khoá transports ['internal'] chặn khoá của
   điện thoại · đăng nhập bằng khoá ấy · các cổng phải ĐỎ (sai thách thức,
   sai miền, thiếu cờ UV, chữ ký giả, thách thức dùng lại, origin gita://).
   Dùng: node tools/thu-sinh-trac.mjs   (Node >= 22.5) */
import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import { webcrypto as wc } from 'node:crypto';
import { pathToFileURL, fileURLToPath } from 'node:url';
const ROOT = fileURLToPath(new URL('..', import.meta.url)).replace(/[\\/]$/, '');
globalThis.fetch = async () => { throw new Error('không gọi mạng ngoài'); };
let dat = 0, truot = 0;
const kiem = (ten, dk, ct) => { if (dk) { dat++; console.log('OK  ' + ten); } else { truot++; const d = 'SAI ' + ten + (ct ? ' — ' + ct : ''); console.log(d);
  if (process.env.GITHUB_ACTIONS) console.log('::error title=thu-sinh-trac::' + d.replace(/[\r\n%]/g, ' ').slice(0, 900)); } };

const S = await import(pathToFileURL(ROOT + '/may-chu/sinh-trac.js').href);

/* ── base64url ── */
const b64u = b => Buffer.from(b).toString('base64url');
const ub64 = s => new Uint8Array(Buffer.from(String(s), 'base64url'));
const sha = async b => new Uint8Array(await wc.subtle.digest('SHA-256', b));
const noi = (...a) => { const n = a.reduce((x, y) => x + y.length, 0), o = new Uint8Array(n); let i = 0; for (const x of a) { o.set(x, i); i += x.length; } return o; };

/* ── CBOR tối thiểu: số nguyên, byte, chuỗi, map ── */
function dau(mt, v) {
  if (v < 24) return [mt << 5 | v];
  if (v < 256) return [mt << 5 | 24, v];
  if (v < 65536) return [mt << 5 | 25, v >> 8, v & 255];
  return [mt << 5 | 26, v >>> 24, (v >> 16) & 255, (v >> 8) & 255, v & 255];
}
function cbor(x) {
  if (typeof x === 'number') return new Uint8Array(x >= 0 ? dau(0, x) : dau(1, -1 - x));
  if (x instanceof Uint8Array) return noi(new Uint8Array(dau(2, x.length)), x);
  if (typeof x === 'string') { const b = new TextEncoder().encode(x); return noi(new Uint8Array(dau(3, b.length)), b); }
  if (x instanceof Map) { const p = [new Uint8Array(dau(5, x.size))]; for (const [k, v] of x) { p.push(cbor(k), cbor(v)); } return noi(...p); }
  throw new Error('cbor: kiểu lạ');
}

/* ── chữ ký raw r||s → DER (WebAuthn gửi DER) ── */
function derInt(b) { let i = 0; while (i < b.length - 1 && b[i] === 0) i++; b = b.slice(i); if (b[0] & 0x80) b = noi(new Uint8Array([0]), b); return noi(new Uint8Array([2, b.length]), b); }
function sangDer(raw) { const r = derInt(raw.slice(0, 32)), s = derInt(raw.slice(32)); const t = noi(r, s); return noi(new Uint8Array([0x30, t.length]), t); }

/* ── BỘ XÁC THỰC GIẢ ── */
async function boXacThuc() {
  const kp = await wc.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']);
  const jwk = await wc.subtle.exportKey('jwk', kp.publicKey);
  const credId = wc.getRandomValues(new Uint8Array(32));
  let dem = 0;
  return {
    credId,
    async tao(pk, origin, { uv = true, rp } = {}) {
      const cd = new TextEncoder().encode(JSON.stringify({ type: 'webauthn.create', challenge: pk.challenge, origin }));
      const rpId = rp || new URL(origin).hostname;
      const cose = new Map([[1, 2], [3, -7], [-1, 1], [-2, ub64(jwk.x)], [-3, ub64(jwk.y)]]);
      const ad = noi(await sha(new TextEncoder().encode(rpId)), new Uint8Array([0x41 | (uv ? 4 : 0)]), new Uint8Array([0, 0, 0, 0]),
        new Uint8Array(16), new Uint8Array([0, credId.length]), credId, cbor(cose));
      const att = cbor(new Map([['fmt', 'none'], ['attStmt', new Map()], ['authData', ad]]));
      return { id: b64u(credId), response: { clientDataJSON: b64u(cd), attestationObject: b64u(att) } };
    },
    async ky(pk, origin, { uv = true, kyGia = false } = {}) {
      dem++;
      const cd = new TextEncoder().encode(JSON.stringify({ type: 'webauthn.get', challenge: pk.challenge, origin }));
      const ad = noi(await sha(new TextEncoder().encode(new URL(origin).hostname)), new Uint8Array([0x01 | (uv ? 4 : 0)]),
        new Uint8Array([0, 0, 0, dem]));
      const raw = new Uint8Array(await wc.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, kp.privateKey, noi(ad, await sha(cd))));
      if (kyGia) raw[5] ^= 0xff;
      return { id: b64u(credId), response: { clientDataJSON: b64u(cd), authenticatorData: b64u(ad), signature: b64u(sangDer(raw)), userHandle: null } };
    }
  };
}

function dung() {
  const sq = new DatabaseSync(':memory:');
  sq.exec(fs.readFileSync(ROOT + '/may-chu/csdl.sql', 'utf8'));
  const db = { prepare(sql) { let a = []; const st = { bind(...x) { a = x; return st; },
      first() { try { return Promise.resolve(sq.prepare(sql).get(...a) || null); } catch (e) { return Promise.reject(e); } },
      all() { return Promise.resolve({ results: sq.prepare(sql).all(...a) }); },
      run() { const r = sq.prepare(sql).run(...a); return Promise.resolve({ meta: { changes: Number(r.changes) } }); } }; return st; },
    async batch(ds) { sq.exec('BEGIN'); try { for (const s of ds) await s.run(); sq.exec('COMMIT'); } catch (e) { sq.exec('ROLLBACK'); throw e; } } };
  sq.prepare("INSERT INTO users (id, username, email, role, active) VALUES ('U1','chu','chu@gita.vn','R01',1)").run();
  sq.prepare("INSERT INTO users (id, username, email, role, active) VALUES ('U7','coach1','coach1@gita.vn','R07',1)").run();
  return { sq, db };
}

const ORI = 'https://gita365.pages.dev';
const { sq, db } = dung(), env = {};
const chu = { u: 'chu', role: 'R01', uid: 'U1' };

/* 1 · đăng ký trên CHÍNH máy này (Face ID / Windows Hello) */
const a1 = await boXacThuc();
let b = await S.dangKyKhoaMatBatDau({ origin: ORI, kieu: 'nenTang' }, env, db, chu);
kiem('bắt đầu đăng ký (máy này) trả thách thức', b.ok && b.publicKey && b.publicKey.challenge, JSON.stringify(b).slice(0, 200));
kiem('máy này → authenticatorAttachment platform', b.publicKey.authenticatorSelection.authenticatorAttachment === 'platform');
kiem('bắt buộc quét thật (userVerification required)', b.publicKey.authenticatorSelection.userVerification === 'required');
let x = await S.dangKyKhoaMatXong({ choId: b.choId, ten: 'Laptop', ...(await a1.tao(b.publicKey, ORI)) }, env, db, chu);
kiem('đăng ký khoá máy này thành công', x.ok, JSON.stringify(x));

/* 2 · đăng ký bằng ĐIỆN THOẠI quét mã QR — đường cho máy không có Hello */
const a2 = await boXacThuc();
b = await S.dangKyKhoaMatBatDau({ origin: ORI, kieu: 'dienThoai' }, env, db, chu);
kiem('điện thoại → authenticatorAttachment cross-platform', b.publicKey.authenticatorSelection.authenticatorAttachment === 'cross-platform');
kiem('excludeCredentials không khoá transports ["internal"]', (b.publicKey.excludeCredentials || []).length === 1 &&
  b.publicKey.excludeCredentials.every(c => !c.transports), JSON.stringify(b.publicKey.excludeCredentials));
x = await S.dangKyKhoaMatXong({ choId: b.choId, ten: 'iPhone', ...(await a2.tao(b.publicKey, ORI)) }, env, db, chu);
kiem('đăng ký khoá điện thoại thành công', x.ok, JSON.stringify(x));
kiem('kiểu lạ rơi về máy này', (await S.dangKyKhoaMatBatDau({ origin: ORI, kieu: 'gi-do' }, env, db, chu)).publicKey
  .authenticatorSelection.authenticatorAttachment === 'platform');

/* 3 · đăng nhập bằng khoá điện thoại */
b = await S.dangNhapMatBatDau({ uMat: 'chu', origin: ORI }, env, db);
kiem('đăng nhập: allowCredentials đủ 2 khoá, không khai transports', b.ok && b.publicKey.allowCredentials.length === 2 &&
  b.publicKey.allowCredentials.every(c => !c.transports), JSON.stringify(b.publicKey && b.publicKey.allowCredentials));
let as = await a2.ky(b.publicKey, ORI);
x = await S.xacThucDangNhapMat({ choId: b.choId, ...as }, env, db);
kiem('đăng nhập bằng khoá điện thoại thành công', x.ok && x.nd && x.nd.id === 'U1', JSON.stringify(x).slice(0, 200));
x = await S.xacThucDangNhapMat({ choId: b.choId, ...as }, env, db);
kiem('thách thức dùng lại bị từ chối (chống phát lại)', !x.ok && x.code === 'CHO', JSON.stringify(x));

/* 4 · các cổng phải ĐỎ */
b = await S.dangNhapMatBatDau({ uMat: 'chu', origin: ORI }, env, db);
x = await S.xacThucDangNhapMat({ choId: b.choId, ...(await a1.ky(b.publicKey, ORI, { kyGia: true })) }, env, db);
kiem('chữ ký giả bị từ chối', !x.ok, JSON.stringify(x));
b = await S.dangNhapMatBatDau({ uMat: 'chu', origin: ORI }, env, db);
x = await S.xacThucDangNhapMat({ choId: b.choId, ...(await a1.ky(b.publicKey, ORI, { uv: false })) }, env, db);
kiem('thiếu cờ UV (chỉ chạm, không quét mặt) bị từ chối', !x.ok && x.code === 'KHONGUV', JSON.stringify(x));
b = await S.dangNhapMatBatDau({ uMat: 'chu', origin: ORI }, env, db);
x = await S.xacThucDangNhapMat({ choId: b.choId, ...(await a1.ky({ challenge: 'thach-thuc-khac' }, ORI)) }, env, db);
kiem('sai thách thức bị từ chối', !x.ok, JSON.stringify(x));
b = await S.dangNhapMatBatDau({ uMat: 'chu', origin: ORI }, env, db);
x = await S.xacThucDangNhapMat({ choId: b.choId, ...(await a1.ky(b.publicKey, 'https://gita-gia-mao.com')) }, env, db);
kiem('trang giả mạo (miền khác) bị từ chối', !x.ok, JSON.stringify(x));
b = await S.dangKyKhoaMatBatDau({ origin: ORI, kieu: 'nenTang' }, env, db, chu);
x = await S.dangKyKhoaMatXong({ choId: b.choId, ...(await (await boXacThuc()).tao(b.publicKey, ORI, { uv: false })) }, env, db, chu);
kiem('đăng ký không quét mặt (thiếu UV) bị từ chối', !x.ok && x.code === 'KHONGUV', JSON.stringify(x));
b = await S.dangKyKhoaMatBatDau({ origin: ORI, kieu: 'nenTang' }, env, db, chu);
x = await S.dangKyKhoaMatXong({ choId: b.choId, ...(await (await boXacThuc()).tao(b.publicKey, ORI, { rp: 'gita-gia-mao.com' })) }, env, db, chu);
kiem('đăng ký với rpId miền khác bị từ chối', !x.ok, JSON.stringify(x));
kiem('origin gita:// (bản máy tính) bị từ chối, nói rõ', !(await S.dangKyKhoaMatBatDau({ origin: 'gita://app' }, env, db, chu)).ok);
b = await S.dangKyKhoaMatBatDau({ origin: ORI }, env, db, chu);
x = await S.dangKyKhoaMatXong({ choId: b.choId, ...(await (await boXacThuc()).tao(b.publicKey, ORI)) }, env, db, { u: 'coach1', role: 'R07', uid: 'U7' });
kiem('người khác không hoàn tất được lượt đăng ký của mình', !x.ok && x.code === 'NOPERM', JSON.stringify(x));
const soKhoa = sq.prepare("SELECT COUNT(*) n FROM khoaSinhTrac WHERE uid='U1'").get().n;
kiem('chỉ lưu đúng 2 khoá công khai hợp lệ', soKhoa === 2, 'có ' + soKhoa);
const cot = sq.prepare('PRAGMA table_info(khoaSinhTrac)').all().map(c => c.name);
kiem('bảng không có cột ảnh / mẫu mặt (Điều 13)', !cot.some(c => /anh|mat|face|image|mau/i.test(c)), cot.join(','));

/* 5 · máy khách: không còn window.prompt, có đường điện thoại, nói rõ khi ở gita:// */
const kh = fs.readFileSync(ROOT + '/src/dang-nhap-mat.js', 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
kiem('màn khoá mặt không dùng window.prompt (Electron không hỗ trợ)', !/window\.prompt\s*\(/.test(kh));
kiem('màn có nút dùng điện thoại quét mã QR', /stThemHoi\(\\'dienThoai\\'\)/.test(kh));
kiem('màn dò Face ID/Windows Hello thật trước khi mời', /stDoNenTang\(\)/.test(kh) && /isUserVerifyingPlatformAuthenticatorAvailable/.test(kh));
kiem('màn chặn rõ ràng khi không ở https (bản máy tính)', /stDiaChiHopLe\(\)/.test(kh));

console.log('\n' + dat + ' đạt · ' + truot + ' sai');
process.exit(truot ? 1 : 0);
