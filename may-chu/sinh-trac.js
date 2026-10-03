/* ═══════════════════════════════════════════════════════════════
   GITA 365 — ĐĂNG NHẬP BẰNG KHUÔN MẶT THẬT  (9.99.182)

   Theo yêu cầu chủ hệ: đăng nhập qua nhận diện sinh trắc khuôn mặt
   THẬT, KHÔNG qua ảnh.

   ── VÌ SAO LÀ WebAuthn, KHÔNG PHẢI TỰ DỰNG NHẬN DIỆN MẶT ──

   Có đúng MỘT cách làm việc này mà không phạm luật lõi của kho:

   1. Điều 13 (BẤT KHẢ SỬA): dữ liệu gia đình/đứa trẻ không bao giờ rời
      hệ ở dạng nhận dạng được; đẩy ra dịch vụ ngoài lãnh thổ là xử lý
      dữ liệu xuyên biên giới (Luật 91/2025). Một khuôn mặt là dữ liệu
      sinh trắc — loại được bảo vệ đặc biệt nhất.
   2. VIP_CAM (9.99.76) CẤM sinh trắc khuôn mặt cho trẻ <18 ở dạng
      GIÁM SÁT.

   Tự chụp ảnh rồi so với một tấm đã lưu là (a) "qua ẢNH" — đúng thứ chủ
   hệ nói KHÔNG; (b) bị lừa bằng một tấm ảnh; (c) phải LƯU mẫu mặt ở máy
   chủ hoặc gửi khung hình đi — phạm Điều 13.

   WebAuthn với bộ xác thực NỀN TẢNG (Face ID · Windows Hello · vân tay
   Android) làm đúng điều cần:
   · Máy QUÉT MẶT THẬT ngay trên thiết bị, có chống giả mạo (một tấm ảnh
     KHÔNG mở được Face ID) — "khuôn mặt thật, không qua ảnh".
   · Khuôn mặt KHÔNG BAO GIỜ rời thiết bị. Trình duyệt chỉ trả về một
     CHỮ KÝ khoá công khai. Máy chủ lưu ĐÚNG MỘT KHOÁ CÔNG KHAI — KHÔNG
     phải dữ liệu sinh trắc. Không có gì xuyên biên giới, không mẫu mặt
     nào để mất. Điều 13 được tôn trọng TRỌN VẸN.
   · Miễn phí, có sẵn trong trình duyệt/hệ điều hành. Chạy trên iPhone
     (Face ID), Android, Windows Hello, Mac.

   Đây KHÔNG phải sinh trắc giám sát mà VIP_CAM cấm: nó là mở-khoá-đăng-
   nhập của CHÍNH người dùng trên thiết bị CỦA HỌ, người dùng TỰ CHỌN
   bật, và KHÔNG lưu một byte sinh trắc nào. Hai chuyện khác hẳn nhau.

   ── LUẬT CỦA MÔ-ĐUN NÀY ──
   · Lưu KHOÁ CÔNG KHAI, không lưu dữ liệu sinh trắc. Cột nào mang tên
     mặt/ảnh là mục 45 báo đỏ.
   · userVerification: 'required' — buộc quét mặt/vân tay thật, không cho
     lướt qua chỉ bằng "có mặt" (userPresence).
   · authenticatorAttachment: 'platform' — bộ xác thực GẮN MÁY (Face ID…),
     không phải khoá cắm rời.
   · Thách thức (challenge) do MÁY CHỦ sinh, DÙNG MỘT LẦN — xoá ngay sau
     khi kiểm, chống phát lại (replay).
   · KHÔNG bao giờ là đường DUY NHẤT: mật khẩu vẫn còn, vì mất thiết bị
     thì vẫn phải vào được. Người dùng TỰ CHỌN bật (opt-in).
   ═══════════════════════════════════════════════════════════════ */
'use strict';

import { Kho } from './nen.js';

const HAN_CHO_GIAY = 300;      /* thách thức sống 5 phút rồi hết hạn */
const RP_TEN = 'GITA 365';

/* ── base64url ── */
function b64uMa(buf) {
  const b = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let s = '';
  for (let i = 0; i < b.length; i++) s += String.fromCharCode(b[i]);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function b64uGiai(str) {
  const s = String(str || '').replace(/-/g, '+').replace(/_/g, '/');
  const bin = atob(s + '==='.slice((s.length + 3) % 4));
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
function chuoiUtf8(buf) { return new TextDecoder().decode(buf); }

async function sha256(bytes) {
  const d = await crypto.subtle.digest('SHA-256', bytes);
  return new Uint8Array(d);
}
function bangByte(a, b) {
  if (a.length !== b.length) return false;
  let kh = 0;                     /* so hằng-thời-gian */
  for (let i = 0; i < a.length; i++) kh |= a[i] ^ b[i];
  return kh === 0;
}
function ngauNhien(n) { const b = new Uint8Array(n); crypto.getRandomValues(b); return b; }

/* ── CBOR: bộ GIẢI mã tối thiểu (đủ cho attestationObject + khoá COSE) ──
   Chỉ cần: uint · negint · byte-string · text-string · array · map. */
function cborGiai(buf, i0) {
  let i = i0 || 0;
  function doc() {
    const b = buf[i++], mt = b >> 5, ai = b & 0x1f;
    let val;
    if (ai < 24) val = ai;
    else if (ai === 24) val = buf[i++];
    else if (ai === 25) { val = (buf[i] << 8) | buf[i + 1]; i += 2; }
    else if (ai === 26) { val = (buf[i] * 0x1000000) + (buf[i + 1] << 16) + (buf[i + 2] << 8) + buf[i + 3]; i += 4; }
    else throw new Error('CBOR: độ dài không hỗ trợ');
    switch (mt) {
      case 0: return val;                       /* uint */
      case 1: return -1 - val;                  /* negint */
      case 2: { const s = buf.slice(i, i + val); i += val; return s; }  /* bytes */
      case 3: { const s = chuoiUtf8(buf.slice(i, i + val)); i += val; return s; }  /* text */
      case 4: { const a = []; for (let k = 0; k < val; k++) a.push(doc()); return a; }  /* array */
      case 5: { const m = new Map(); for (let k = 0; k < val; k++) { const key = doc(); m.set(key, doc()); } return m; }  /* map */
      default: throw new Error('CBOR: kiểu không hỗ trợ ' + mt);
    }
  }
  const v = doc();
  return { val: v, cuoi: i };
}

/* ── authenticatorData ──
   32 rpIdHash · 1 flags · 4 signCount · (nếu AT) attestedCredentialData. */
function docAuthData(ad) {
  const rpIdHash = ad.slice(0, 32);
  const flags = ad[32];
  const up = !!(flags & 0x01), uv = !!(flags & 0x04), at = !!(flags & 0x40);
  const signCount = (ad[33] << 24) | (ad[34] << 16) | (ad[35] << 8) | ad[36];
  const kq = { rpIdHash, up, uv, at, signCount: signCount >>> 0 };
  if (at) {
    let p = 37;
    p += 16;                                    /* aaguid */
    const idLen = (ad[p] << 8) | ad[p + 1]; p += 2;
    kq.credId = ad.slice(p, p + idLen); p += idLen;
    kq.coseKey = cborGiai(ad, p).val;           /* khoá công khai COSE */
  }
  return kq;
}

/* ── COSE → JWK (chỉ ES256 và RS256 — phủ Face ID/Android/Windows Hello) ── */
function coseSangJwk(cose) {
  const kty = cose.get(1), alg = cose.get(3);
  if (kty === 2) {                              /* EC2 — ES256 */
    if (alg !== -7) throw new Error('EC alg không phải ES256');
    return { alg: -7, jwk: { kty: 'EC', crv: 'P-256',
      x: b64uMa(cose.get(-2)), y: b64uMa(cose.get(-3)), ext: true } };
  }
  if (kty === 3) {                              /* RSA — RS256 */
    if (alg !== -257) throw new Error('RSA alg không phải RS256');
    return { alg: -257, jwk: { kty: 'RSA',
      n: b64uMa(cose.get(-1)), e: b64uMa(cose.get(-2)), ext: true } };
  }
  throw new Error('Loại khoá không hỗ trợ');
}

/* Chữ ký ES256 của WebAuthn là DER (ASN.1); WebCrypto cần r||s 64 byte. */
function derSangRaw(der) {
  let i = 0;
  if (der[i++] !== 0x30) throw new Error('DER: thiếu SEQUENCE');
  if (der[i] & 0x80) i += 1 + (der[i] & 0x7f); else i++;   /* bỏ độ dài seq */
  function doInt() {
    if (der[i++] !== 0x02) throw new Error('DER: thiếu INTEGER');
    let len = der[i++];
    let v = der.slice(i, i + len); i += len;
    while (v.length > 32 && v[0] === 0) v = v.slice(1);     /* bỏ byte 0 dẫn */
    const out = new Uint8Array(32); out.set(v, 32 - v.length);
    return out;
  }
  const r = doInt(), s = doInt();
  const raw = new Uint8Array(64); raw.set(r, 0); raw.set(s, 32);
  return raw;
}

async function kiemChuKy(alg, jwk, chuKy, duLieu) {
  if (alg === -7) {
    const key = await crypto.subtle.importKey('jwk', jwk,
      { name: 'ECDSA', namedCurve: 'P-256' }, false, ['verify']);
    let raw; try { raw = derSangRaw(chuKy); } catch (e) { return false; }
    return await crypto.subtle.verify({ name: 'ECDSA', hash: 'SHA-256' }, key, raw, duLieu);
  }
  if (alg === -257) {
    const key = await crypto.subtle.importKey('jwk', jwk,
      { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
    return await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, chuKy, duLieu);
  }
  return false;
}

/* Miền hợp lệ: https bất kỳ, hoặc localhost khi chạy thử. rpId = tên
   miền; khoá đã đăng ký với miền nào chỉ dùng lại được ở đúng miền ấy
   (trình duyệt cưỡng chế; ta canh thêm một lớp). */
function mienTu(origin) {
  let u; try { u = new URL(origin); } catch (e) { return null; }
  const localhost = u.hostname === 'localhost' || u.hostname === '127.0.0.1';
  if (u.protocol !== 'https:' && !(u.protocol === 'http:' && localhost)) return null;
  return u.hostname;
}

async function docClientData(b64, kieuMong, choChallenge, choOrigin) {
  let cd; try { cd = JSON.parse(chuoiUtf8(b64uGiai(b64))); } catch (e) { return { loi: 'clientDataJSON hỏng' }; }
  if (cd.type !== kieuMong) return { loi: 'type sai' };
  /* challenge phải KHỚP thách thức máy chủ vừa phát (dùng một lần). */
  if (String(cd.challenge || '') !== String(choChallenge || '')) return { loi: 'challenge không khớp' };
  const mien = mienTu(cd.origin);
  if (!mien) return { loi: 'origin không hợp lệ' };
  if (choOrigin && cd.origin !== choOrigin) return { loi: 'origin khác lúc bắt đầu' };
  return { cd, mien, origin: cd.origin };
}

async function layCho(db, choId, kieu) {
  const r = await db.prepare('SELECT * FROM webauthnCho WHERE choId = ?').bind(String(choId || '')).first();
  if (!r) return null;
  await db.prepare('DELETE FROM webauthnCho WHERE choId = ?').bind(r.choId).run();  /* DÙNG MỘT LẦN */
  if (r.kieu !== kieu) return null;
  if (Number(r.hetHan || 0) < Date.now()) return null;
  return r;
}

async function moCho(db, uid, kieu, origin) {
  const choId = 'CHO-' + b64uMa(ngauNhien(18));
  const challenge = b64uMa(ngauNhien(32));
  await db.prepare('INSERT INTO webauthnCho (choId,uid,kieu,challenge,origin,hetHan) VALUES (?,?,?,?,?,?)')
    .bind(choId, uid || null, kieu, challenge, origin || null, Date.now() + HAN_CHO_GIAY * 1000).run();
  return { choId, challenge };
}

/* ═══════════════ ĐĂNG KÝ KHOÁ MẶT — cần phiên ═══════════════
   Chỉ người ĐÃ đăng nhập mới thêm khoá mặt cho tài khoản CỦA MÌNH. */
export async function dangKyKhoaMatBatDau(y, env, db, hoSo) {
  const origin = String(y.origin || '').trim();
  if (!mienTu(origin)) return { ok: false, error: 'Origin không hợp lệ.' };
  const { choId, challenge } = await moCho(db, hoSo.uid, 'dangky', origin);

  const daCo = await db.prepare('SELECT credentialId FROM khoaSinhTrac WHERE uid = ?')
    .bind(hoSo.uid).all();

  return { ok: true, choId, publicKey: {
    challenge,
    rp: { name: RP_TEN },                       /* bỏ id → trình duyệt lấy đúng miền hiện tại */
    user: { id: b64uMa(new TextEncoder().encode(String(hoSo.uid))), name: hoSo.u, displayName: hoSo.u },
    pubKeyCredParams: [{ type: 'public-key', alg: -7 }, { type: 'public-key', alg: -257 }],
    authenticatorSelection: { authenticatorAttachment: 'platform', userVerification: 'required', residentKey: 'preferred' },
    timeout: 120000, attestation: 'none',
    excludeCredentials: (daCo.results || []).map(c => ({ type: 'public-key', id: c.credentialId, transports: ['internal'] }))
  } };
}

export async function dangKyKhoaMatXong(y, env, db, hoSo) {
  const cho = await layCho(db, y.choId, 'dangky');
  if (!cho) return { ok: false, code: 'CHO', error: 'Phiên đăng ký khoá mặt đã hết hạn — thử lại.' };
  if (String(cho.uid) !== String(hoSo.uid)) return { ok: false, code: 'NOPERM', error: 'Khoá này không thuộc phiên của bạn.' };

  const r = y.response || {};
  const cdr = await docClientData(r.clientDataJSON, 'webauthn.create', cho.challenge, cho.origin);
  if (cdr.loi) return { ok: false, error: 'Xác thực thất bại: ' + cdr.loi };

  let att, ad, khoa;
  try {
    att = cborGiai(b64uGiai(r.attestationObject)).val;   /* Map {fmt, attStmt, authData} */
    ad = docAuthData(att.get('authData'));
    if (!ad.at || !ad.coseKey) return { ok: false, error: 'Thiếu dữ liệu khoá trong đăng ký.' };
    khoa = coseSangJwk(ad.coseKey);
  } catch (e) { return { ok: false, error: 'Không đọc được đăng ký khoá mặt.' }; }

  /* userVerification BẮT BUỘC: cờ UV phải bật — tức người đã quét mặt/
     vân tay thật, không chỉ chạm. Thiếu nó thì đây không phải sinh trắc. */
  if (!ad.uv) return { ok: false, code: 'KHONGUV',
    error: 'Thiết bị chưa xác thực bằng khuôn mặt/vân tay. Bật Face ID / Windows Hello rồi thử lại.' };

  /* rpIdHash phải khớp miền của origin — cột chặt khoá vào đúng miền. */
  const mienHash = await sha256(new TextEncoder().encode(cdr.mien));
  if (!bangByte(ad.rpIdHash, mienHash)) return { ok: false, error: 'rpId không khớp miền.' };

  const credId = b64uMa(ad.credId);
  const trung = await db.prepare('SELECT id FROM khoaSinhTrac WHERE credentialId = ?').bind(credId).first();
  if (trung) return { ok: false, error: 'Khoá mặt này đã được đăng ký.' };

  const ten = String(y.ten || '').slice(0, 60) || 'Khuôn mặt';
  const id = 'KST-' + b64uMa(ngauNhien(12));
  await db.prepare(
    'INSERT INTO khoaSinhTrac (id,uid,credentialId,publicKey,alg,signCount,rpId,ten,taoLuc) ' +
    'VALUES (?,?,?,?,?,?,?,?,?)'
  ).bind(id, hoSo.uid, credId, JSON.stringify(khoa.jwk), khoa.alg, ad.signCount, cdr.mien, ten,
    new Date().toISOString()).run();

  await Kho.ghiNhatKy(db, { uid: hoSo.uid, username: hoSo.u, viec: 'KHOAMAT_DANGKY',
    doiTuong: id, chiTiet: 'thêm khoá mặt "' + ten + '" (chỉ lưu khoá công khai, KHÔNG lưu dữ liệu mặt)' });
  return { ok: true, id, ten };
}

/* ═══════════════ ĐĂNG NHẬP BẰNG MẶT — KHÔNG cần phiên ═══════════════ */
export async function dangNhapMatBatDau(y, env, db) {
  /* uMat, không phải u: cửa gọi chung (goiMayChu) ghi đè `u` bằng tên
     người ĐANG đăng nhập — mà đăng nhập bằng mặt thì CHƯA có ai đăng
     nhập, `u` rỗng. Tên người muốn vào đi qua uMat. */
  const u = String(y.uMat || y.u || '').trim().toLowerCase();
  const origin = String(y.origin || '').trim();
  if (!mienTu(origin)) return { ok: false, error: 'Origin không hợp lệ.' };
  if (!u) return { ok: false, error: 'Thiếu tên đăng nhập.' };

  const nd = await Kho.nguoiTheoTen(db, u);
  /* KHÔNG lộ tài khoản có tồn tại hay không, có khoá mặt hay không: luôn
     trả về một thách thức + danh sách khoá (rỗng nếu không có). Danh sách
     rỗng thì trình duyệt báo "không có khoá" y như tài khoản thật chưa
     bật — hai đường nhìn giống nhau. */
  let creds = { results: [] };
  if (nd && !nd.deletedAt)
    creds = await db.prepare('SELECT credentialId FROM khoaSinhTrac WHERE uid = ?').bind(nd.id).all();

  const { choId, challenge } = await moCho(db, nd ? nd.id : null, 'dangnhap', origin);
  return { ok: true, choId, publicKey: {
    challenge,
    allowCredentials: (creds.results || []).map(c => ({ type: 'public-key', id: c.credentialId, transports: ['internal'] })),
    userVerification: 'required', timeout: 120000
  } };
}

/* ── KIỂM MỘT ASSERTION (chữ ký khuôn mặt) — MỘT NGUỒN ──
   Dùng chung cho đăng nhập (xacThucDangNhapMat) VÀ xác thực lại/step-up
   (xacThucLaiMat). Trả về {ok, kst} hoặc {ok:false, code, error}.
   `uidPhai` là uid mà khoá PHẢI thuộc về (đăng nhập: cho.uid; step-up:
   uid của phiên). Cập nhật signCount khi hợp lệ. */
async function kiemAssertion(db, cho, y, uidPhai) {
  const credId = String((y.response && y.response.id) || y.id || '');
  const kst = await db.prepare('SELECT * FROM khoaSinhTrac WHERE credentialId = ? AND uid = ?')
    .bind(credId, uidPhai).first();
  if (!kst) return { ok: false, code: 'SAI', error: 'Không xác thực được bằng khuôn mặt.' };

  const r = y.response || {};
  const cdr = await docClientData(r.clientDataJSON, 'webauthn.get', cho.challenge, cho.origin);
  if (cdr.loi) return { ok: false, code: 'SAI', error: 'Xác thực thất bại: ' + cdr.loi };
  /* Khoá đã đăng ký với miền nào chỉ dùng lại ở đúng miền ấy. */
  if (cdr.mien !== kst.rpId) return { ok: false, code: 'SAI', error: 'Khoá mặt không dùng được ở miền này.' };

  let ad;
  try { ad = docAuthData(b64uGiai(r.authenticatorData)); }
  catch (e) { return { ok: false, code: 'SAI', error: 'authenticatorData hỏng.' }; }

  if (!ad.uv) return { ok: false, code: 'KHONGUV',
    error: 'Chưa xác thực bằng khuôn mặt/vân tay trên thiết bị.' };
  const mienHash = await sha256(new TextEncoder().encode(kst.rpId));
  if (!bangByte(ad.rpIdHash, mienHash)) return { ok: false, code: 'SAI', error: 'rpId không khớp.' };

  /* signCount chống nhân bản khoá: bộ xác thực có đếm (khác 0) thì lần
     này phải LỚN HƠN lần trước. Nhiều bộ (Apple) giữ đếm ở 0 — bỏ qua. */
  if (ad.signCount !== 0 && Number(kst.signCount) !== 0 && ad.signCount <= Number(kst.signCount))
    return { ok: false, code: 'NHANBAN', error: 'Phát hiện dấu hiệu khoá bị nhân bản.' };

  /* Chữ ký ký trên: authenticatorData || SHA-256(clientDataJSON). */
  const cdHash = await sha256(b64uGiai(r.clientDataJSON));
  const adBytes = b64uGiai(r.authenticatorData);
  const kyTren = new Uint8Array(adBytes.length + cdHash.length);
  kyTren.set(adBytes, 0); kyTren.set(cdHash, adBytes.length);

  let jwk; try { jwk = JSON.parse(kst.publicKey); } catch (e) { return { ok: false, code: 'SAI', error: 'Khoá hỏng.' }; }
  const ok = await kiemChuKy(Number(kst.alg), jwk, b64uGiai(r.signature), kyTren);
  if (!ok) return { ok: false, code: 'SAI', error: 'Chữ ký không hợp lệ.' };

  await db.prepare('UPDATE khoaSinhTrac SET signCount = ?, dungLuc = ? WHERE id = ?')
    .bind(ad.signCount, new Date().toISOString(), kst.id).run();
  return { ok: true, kst };
}

/* Trả về {ok, nd} khi chữ ký hợp lệ — worker.js cấp phiên và dựng đáp
   ứng đăng nhập GIỐNG HỆT dangNhap (một nguồn cho hình đáp ứng). */
export async function xacThucDangNhapMat(y, env, db) {
  const cho = await layCho(db, y.choId, 'dangnhap');
  if (!cho) return { ok: false, code: 'CHO', error: 'Phiên đăng nhập đã hết hạn — thử lại.' };
  if (!cho.uid) return { ok: false, code: 'SAI', error: 'Không đăng nhập được bằng khuôn mặt.' };

  const kq = await kiemAssertion(db, cho, y, cho.uid);
  if (!kq.ok) return kq;

  const nd = await Kho.nguoiTheoId(db, cho.uid);
  if (!nd || nd.deletedAt) return { ok: false, code: 'SAI', error: 'Tài khoản không còn.' };
  if (!Number(nd.active)) return { ok: false, code: 'LOCKED', error: 'Tài khoản đang bị khoá.' };
  return { ok: true, nd, tenKhoa: kq.kst.ten };
}

/* ═══════════════ XÁC THỰC LẠI BẰNG KHUÔN MẶT — step-up (cần phiên) ═══════
   Tăng bảo mật + chống chiếm tài khoản: việc quan trọng đòi một lượt quét
   mặt TƯƠI, dù đã đăng nhập. Kẻ trộm mật khẩu/phiên không có khuôn mặt
   thật thì không qua được. WebAuthn khoá theo miền nên cũng chống lừa đảo
   (trang giả không lấy được chữ ký cho gita365.pages.dev). */
export const BUOCMAT_SONG_GIAY = 120;   /* bằng chứng mặt tươi sống 2 phút */

export async function xacThucLaiMatBatDau(y, env, db, hoSo) {
  const origin = String(y.origin || '').trim();
  if (!mienTu(origin)) return { ok: false, error: 'Origin không hợp lệ.' };
  const creds = await db.prepare('SELECT credentialId FROM khoaSinhTrac WHERE uid = ?').bind(hoSo.uid).all();
  if (!(creds.results || []).length)
    return { ok: false, code: 'CHUABAT', error: 'Tài khoản chưa bật khoá mặt trên thiết bị nào.' };
  const { choId, challenge } = await moCho(db, hoSo.uid, 'buocmat', origin);
  return { ok: true, choId, publicKey: {
    challenge,
    allowCredentials: creds.results.map(c => ({ type: 'public-key', id: c.credentialId, transports: ['internal'] })),
    userVerification: 'required', timeout: 120000
  } };
}

export async function xacThucLaiMat(y, env, db, hoSo) {
  const cho = await layCho(db, y.choId, 'buocmat');
  if (!cho) return { ok: false, code: 'CHO', error: 'Hết giờ xác thực khuôn mặt — thử lại.' };
  if (String(cho.uid) !== String(hoSo.uid)) return { ok: false, code: 'NOPERM', error: 'Không đúng phiên.' };

  const kq = await kiemAssertion(db, cho, y, hoSo.uid);
  if (!kq.ok) return kq;

  /* Ghi bằng chứng mặt TƯƠI, gắn theo TOKEN phiên (một phiên khác không
     dùng lại được). Sống ngắn — mỗi việc quan trọng đòi một lượt mới. */
  await db.prepare('INSERT INTO matChungThuc (token, uid, lucLuc) VALUES (?,?,?) ' +
    'ON CONFLICT(token) DO UPDATE SET lucLuc = excluded.lucLuc, uid = excluded.uid')
    .bind(hoSo.token, hoSo.uid, Date.now()).run();
  await Kho.ghiNhatKy(db, { uid: hoSo.uid, username: hoSo.u, viec: 'BUOCMAT',
    chiTiet: 'xác thực lại bằng khuôn mặt cho việc quan trọng' });
  return { ok: true, hanGiay: BUOCMAT_SONG_GIAY };
}

/* Tài khoản này CÓ bật khoá mặt không (có ít nhất một khoá). */
export async function coKhoaMat(db, uid) {
  const r = await db.prepare('SELECT COUNT(*) n FROM khoaSinhTrac WHERE uid = ?').bind(uid).first();
  return ((r && r.n) || 0) > 0;
}
/* Phiên này đã xác thực mặt TƯƠI trong `giay` giây gần đây chưa. */
export async function daBuocMatGanDay(db, hoSo, giay) {
  const r = await db.prepare('SELECT lucLuc FROM matChungThuc WHERE token = ? AND uid = ?')
    .bind(hoSo.token || '', hoSo.uid).first();
  if (!r) return false;
  return (Date.now() - Number(r.lucLuc || 0)) <= giay * 1000;
}
/* CỔNG DÙNG CHUNG cho việc quan trọng: nếu tài khoản đã bật khoá mặt mà
   phiên chưa xác thực mặt tươi → chặn với code CANMAT (máy khách sẽ chạy
   step-up rồi thử lại). Tài khoản chưa bật khoá mặt → không đổi gì (cho
   qua) — người chưa dùng khuôn mặt vẫn làm việc như cũ. */
export async function congBuocMat(db, hoSo) {
  if (!await coKhoaMat(db, hoSo.uid)) return { ok: true };
  if (await daBuocMatGanDay(db, hoSo, BUOCMAT_SONG_GIAY)) return { ok: true };
  return { ok: false, code: 'CANMAT',
    error: 'Tài khoản này được bảo vệ bằng khuôn mặt. Xác thực khuôn mặt trước khi làm việc này.' };
}

/* Nhật ký an toàn của CHÍNH tài khoản — thấy lượt lạ thì đổi mật khẩu
   ngay (chống lừa đảo/chiếm tài khoản: người dùng tự soi được). */
export async function nhatKyAnToan(y, env, db, hoSo) {
  const VIEC = ['DANG_NHAP', 'DOI_MAT_KHAU', 'BUOCMAT', 'KHOAMAT_DANGKY', 'KHOAMAT_XOA', 'DAT_LAI_MK'];
  const hoi = VIEC.map(() => '?').join(',');
  const r = await db.prepare(
    'SELECT luc, viec, chiTiet FROM audit WHERE uid = ? AND viec IN (' + hoi + ') ORDER BY luc DESC LIMIT 50'
  ).bind(hoSo.uid, ...VIEC).all();
  return { ok: true, dong: (r.results || []).map(x => ({ luc: x.luc, viec: x.viec, chiTiet: x.chiTiet || '' })),
    vi: 'Nhật ký bảo mật của tài khoản bạn: đăng nhập, đổi mật khẩu, xác thực khuôn mặt. ' +
        'Thấy một lượt đăng nhập bạn KHÔNG làm → đổi mật khẩu ngay và gỡ khoá mặt lạ.' };
}

/* ═══════════════ LIỆT KÊ / XOÁ KHOÁ MẶT — cần phiên ═══════════════ */
export async function dsKhoaMat(y, env, db, hoSo) {
  const r = await db.prepare(
    'SELECT id, ten, taoLuc, dungLuc, rpId FROM khoaSinhTrac WHERE uid = ? ORDER BY taoLuc DESC'
  ).bind(hoSo.uid).all();
  return { ok: true, khoa: (r.results || []).map(k => ({
    id: k.id, ten: k.ten, taoLuc: k.taoLuc, dungLuc: k.dungLuc || '', mien: k.rpId })),
    vi: 'Mỗi dòng là một thiết bị đã bật khuôn mặt cho tài khoản này. Chỉ lưu KHOÁ CÔNG KHAI ' +
        '— không có mẫu mặt nào ở đây. Mất thiết bị thì xoá dòng của nó.' };
}

export async function xoaKhoaMat(y, env, db, hoSo) {
  const id = String(y.id || '').trim();
  if (!id) return { ok: false, error: 'Thiếu mã khoá.' };
  /* GỠ khoá mặt là gỡ lớp bảo vệ — đòi xác thực mặt tươi trước, để kẻ
     chiếm phiên không tự tháo khoá mặt của bạn. Gỡ bằng bất kỳ khoá nào
     bạn còn; mất hẳn thiết bị thì khoá cũ vô hại (chỉ là khoá công khai)
     và vào lại bằng mật khẩu + đặt lại qua email. */
  const cong = await congBuocMat(db, hoSo);
  if (!cong.ok) return cong;
  const r = await db.prepare('DELETE FROM khoaSinhTrac WHERE id = ? AND uid = ?')
    .bind(id, hoSo.uid).run();
  const n = (r && r.meta && r.meta.changes) || 0;
  if (!n) return { ok: false, error: 'Không tìm thấy khoá này của bạn.' };
  await Kho.ghiNhatKy(db, { uid: hoSo.uid, username: hoSo.u, viec: 'KHOAMAT_XOA', doiTuong: id });
  return { ok: true };
}
