/* ═══════════════════════════════════════════════════════════════
   GITA 365 · CỬA VÀO MỚI — QUÊN VÀ ĐẶT LẠI MẬT KHẨU

   Hai bước: xin mã sáu số qua email, rồi nhập mã kèm mật khẩu mới.

   ══ NGƯỜI DÙNG CỬA NÀY THƯỜNG ĐANG Ở TÌNH THẾ XẤU ══

   Có hai loại người bấm "quên mật khẩu": người thật sự quên, và người
   vừa phát hiện có kẻ khác vào được tài khoản mình. Cả hai đều đang
   vội và đang lo. Nên hai luật đi kèm:

     · Đặt lại xong thì ĐÁ MỌI PHIÊN đang mở, không trừ cái nào. Giữ
       lại một phiên là giữ nguyên cánh cửa mà họ vừa đi khoá.
     · Đặt lại xong thì GỬI MỘT THƯ BÁO. Nếu không phải họ làm, lá thư
       ấy là thứ duy nhất cho họ biết có chuyện, và biết sớm một giờ
       khác hẳn biết muộn một tuần.
   ═══════════════════════════════════════════════════════════════ */

import { Kho, muoiMoi, bamMoi, soSanhAnToan, mkQuaDeDoan } from './nen.js';
import { guiThu, CHAN_THU } from './thu.js';

const HAN_MA_PHUT   = 15;   /* mã sống bao lâu */
const SAI_TOI       = 5;    /* sai bao nhiêu lần thì huỷ mã */
const TRAN_XIN_GIO  = 5;    /* một tài khoản xin tối đa mấy lần mỗi giờ */

/* Cùng cách sinh và cùng cách băm với mã đăng ký — xem chú giải dài ở
   otpMoi() trong dang-ky.js về việc vì sao Math.random không dùng được
   ở đây. Hai chỗ dùng chung một luật thì hai chỗ cùng đúng hoặc cùng
   sai, và cùng sai thì còn tìm ra được. */
function maSauSo() {
  let n = '';
  const b = new Uint8Array(24);
  crypto.getRandomValues(b);
  for (let i = 0; i < b.length && n.length < 6; i++)
    if (b[i] < 250) n += (b[i] % 10);
  while (n.length < 6) n += '0';
  return n;
}

async function bamMa(ma, muoi, tieu) {
  const b = await crypto.subtle.digest('SHA-256',
    new TextEncoder().encode(String(muoi) + '·' + String(ma) + '·' + String(tieu)));
  return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join('');
}

/* Che địa chỉ email trong nhật ký. Nhật ký là thứ nhiều người đọc được
   hơn bảng tài khoản, và một dòng nhật ký đủ để biết ai đã đăng ký. */
const cheEmail = e => String(e || '').replace(/^(.{2}).*(@.*)$/, '$1***$2');

/* ═══════════════ 1 · XIN MÃ ═══════════════ */
export async function quenMatKhau(y, env, db) {
  const u = String(y.u || '').trim().toLowerCase();

  /* TRẢ LỜI GIỐNG HỆT NHAU dù tài khoản có thật hay không, dù bị chặn
     hay không, dù thư gửi được hay không. Đây là cửa không cần đăng
     nhập mà lại nhận một tên tài khoản; khác nhau một chữ là nó thành
     công cụ dò xem ai có tài khoản ở GITA. */
  const traLoi = {ok: true, thongBao: 'Nếu tài khoản có thật, mã lấy lại mật khẩu đã ' +
    'được gửi tới email đăng ký. Mã sống ' + HAN_MA_PHUT + ' phút.'};
  if (!u) return traLoi;

  if (await Kho.demNhip(db, 'quenMk·' + u, 3600) > TRAN_XIN_GIO) {
    await Kho.ghiNhatKy(db, {viec: 'QUEN_MK_CHAN', doiTuong: cheEmail(u),
      chiTiet: 'Vượt trần ' + TRAN_XIN_GIO + ' lần/giờ'});
    return traLoi;
  }

  /* Nhận CẢ tên đăng nhập LẪN địa chỉ email, y như lúc đăng nhập.
     Người quên mật khẩu thường cũng không nhớ chính xác tên đăng nhập;
     bắt họ nhớ đúng một trong hai là dựng thêm một cánh cửa khoá nữa
     ngay lúc họ đang bí. */
  const nd = await Kho.nguoiTheoTen(db, u);
  if (!nd || !Number(nd.active) || nd.deletedAt) return traLoi;

  const email = nd.email || nd.username;
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return traLoi;

  /* Mã lưu theo uid, không theo chuỗi người dùng gõ. Nền cũ phải quy về
     tên đăng nhập thật vì khoá bộ nhớ tạm là một chuỗi; ở đây khoá
     chính là uid nên chuyện ấy tự đúng — xin mã bằng email rồi đặt lại
     bằng tên đăng nhập vẫn khớp.

     MỘT TÀI KHOẢN MỘT MÃ: xin mã mới là mã cũ chết ngay. Để nhiều mã
     cùng sống là chỉ cần đoán trúng một cái trong số đó. */
  const ma = maSauSo(), muoi = muoiMoi();
  await db.prepare(
    'INSERT INTO maLayLai (uid, muoi, bam, hetHan, sai) VALUES (?,?,?,?,0) ' +
    'ON CONFLICT(uid) DO UPDATE SET muoi = excluded.muoi, bam = excluded.bam, ' +
    'hetHan = excluded.hetHan, sai = 0'
  ).bind(nd.id, muoi, await bamMa(ma, muoi, env.GITA_TIEU),
    Date.now() + HAN_MA_PHUT * 60000).run();

  /* Thư này KHÔNG batBuoc: gửi hỏng thì vẫn trả lời y hệt, vì một câu
     lỗi ở đây nói cho người dò biết rằng tài khoản CÓ THẬT. Ghi vào
     nhật ký để người trong nhà còn tìm ra. */
  const daGui = await guiThu(env, {den: email,
    tieuDe: 'GITA 365 — mã lấy lại mật khẩu',
    than: 'Chào ' + (nd.hoTen || 'anh chị') + ',\n\n' +
      'Mã lấy lại mật khẩu của tài khoản ' + nd.username + ' là:\n\n' +
      '        ' + ma + '\n\n' +
      'Mã sống ' + HAN_MA_PHUT + ' phút và chỉ dùng được một lần.\n\n' +
      'Nếu không phải anh chị yêu cầu, bỏ qua thư này — mật khẩu cũ vẫn nguyên. ' +
      'Nếu nhận nhiều thư như thế này, báo cho Học viện.' + CHAN_THU});

  await Kho.ghiNhatKy(db, {uid: nd.id, username: nd.username,
    viec: daGui ? 'QUEN_MK' : 'QUEN_MK_LOI',
    doiTuong: cheEmail(email),
    chiTiet: daGui ? 'Đã gửi mã' : 'KHÔNG gửi được thư — người dùng vẫn nhận câu trả lời thường'});
  return traLoi;
}

/* ═══════════════ 2 · ĐẶT LẠI BẰNG MÃ ═══════════════ */
export async function datLaiMatKhau(y, env, db) {
  const u = String(y.u || '').trim().toLowerCase();
  const ma = String(y.ma || '').trim();
  const moi = String(y.moi || '');
  if (!u || !ma || !moi)
    return {ok: false, error: 'Thiếu tên đăng nhập, mã hoặc mật khẩu mới.'};

  const nd = await Kho.nguoiTheoTen(db, u);
  /* KHÔNG nói "không có tài khoản này". Câu trả lời phải giống hệt câu
     khi có tài khoản mà mã sai hoặc hết hạn. */
  const hetHan = {ok: false, code: 'EXPIRED',
    error: 'Mã đã hết hạn hoặc chưa được cấp. Xin mã mới.'};
  if (!nd || !Number(nd.active) || nd.deletedAt) return hetHan;

  const g = await db.prepare('SELECT * FROM maLayLai WHERE uid = ?').bind(nd.id).first();
  if (!g) return hetHan;
  if (Number(g.hetHan) < Date.now()) {
    await db.prepare('DELETE FROM maLayLai WHERE uid = ?').bind(nd.id).run();
    return {ok: false, code: 'EXPIRED', error: 'Mã đã hết hạn. Xin mã mới.'};
  }

  if (!soSanhAnToan(await bamMa(ma, g.muoi, env.GITA_TIEU), g.bam)) {
    const sai = Number(g.sai || 0) + 1;
    if (sai >= SAI_TOI) {
      await db.prepare('DELETE FROM maLayLai WHERE uid = ?').bind(nd.id).run();
      await Kho.ghiNhatKy(db, {uid: nd.id, username: nd.username,
        viec: 'DAT_LAI_MK_CHAN', chiTiet: 'Sai mã ' + SAI_TOI + ' lần — huỷ mã'});
      return {ok: false, code: 'LOCKED', error: 'Sai mã năm lần. Mã đã bị huỷ, xin mã mới.'};
    }
    await db.prepare('UPDATE maLayLai SET sai = ? WHERE uid = ?').bind(sai, nd.id).run();
    return {ok: false, code: 'WRONG',
      error: 'Mã không đúng. Còn ' + (SAI_TOI - sai) + ' lần thử.'};
  }

  /* Kiểm mật khẩu SAU khi mã đã đúng. Kiểm trước thì một người có mật
     khẩu yếu nhận câu "mật khẩu quá dễ đoán" mà chưa cần biết mã — tức
     là biết mình đoán đúng tên tài khoản. */
  const che = mkQuaDeDoan(moi, nd);
  if (che) return {ok: false, code: 'WEAK', error: che};

  const muoi = muoiMoi();
  await db.prepare(
    'UPDATE users SET pwSalt = ?, pwHash = ?, mustChangePw = 0, pwDoiLuc = ?, updatedAt = ? ' +
    'WHERE id = ?'
  ).bind(muoi, await bamMoi(moi, muoi, env.GITA_TIEU),
    new Date().toISOString(), new Date().toISOString(), nd.id).run();

  await db.prepare('DELETE FROM maLayLai WHERE uid = ?').bind(nd.id).run();
  await Kho.xoaNhip(db, 'dangNhapSai·' + String(nd.username || '').toLowerCase());
  await Kho.xoaNhip(db, 'dangNhapSai·' + String(nd.email || '').toLowerCase());

  /* ĐÁ MỌI PHIÊN, KHÔNG TRỪ CÁI NÀO. Ở chỗ đổi mật khẩu thì phiên đang
     dùng được giữ lại — người ta đang ngồi đó, đá ra là phiền vô ích.
     Ở đây thì khác: người dùng cửa này thường không đăng nhập được, và
     nếu có kẻ khác đang giữ một phiên thì đó chính là thứ phải cắt. */
  const soPhien = await Kho.daPhienKhac(db, nd.id, '');

  await Kho.ghiNhatKy(db, {uid: nd.id, username: nd.username, viec: 'DAT_LAI_MK',
    chiTiet: 'Đặt lại bằng mã email · đóng ' + soPhien + ' phiên đang mở'});

  /* Thư báo — thứ duy nhất cho người thật biết có chuyện, nếu không
     phải họ làm. Gửi hỏng không kéo đổ việc chính: mật khẩu ĐÃ đổi
     rồi, báo lỗi lúc này chỉ làm người ta tưởng chưa đổi và làm lại. */
  await guiThu(env, {den: nd.email || nd.username,
    tieuDe: 'GITA 365 — mật khẩu đã được đặt lại',
    than: 'Mật khẩu tài khoản ' + nd.username + ' vừa được đặt lại lúc ' +
      gioVN() + '.\n\nMọi thiết bị đang đăng nhập đã bị đăng xuất.\n\n' +
      'Nếu không phải anh chị làm, báo NGAY cho Học viện.' + CHAN_THU});

  return {ok: true, thongBao: 'Đã đặt lại mật khẩu. Đăng nhập bằng mật khẩu mới.'};
}

/* Giờ Việt Nam, viết tay vì Worker không có múi giờ mặc định như Apps
   Script. Người đọc lá thư ở Việt Nam, nên giờ trong thư phải là giờ
   họ đang nhìn trên đồng hồ — một mốc UTC ở đây làm người ta tưởng
   chuyện xảy ra lúc khác và bỏ qua đúng lá thư cần đọc. */
function gioVN() {
  const d = new Date(Date.now() + 7 * 3600e3);
  const hai = n => String(n).padStart(2, '0');
  return hai(d.getUTCHours()) + ':' + hai(d.getUTCMinutes()) + ' ngày ' +
    hai(d.getUTCDate()) + '/' + hai(d.getUTCMonth() + 1) + '/' + d.getUTCFullYear() +
    ' (giờ Việt Nam)';
}
