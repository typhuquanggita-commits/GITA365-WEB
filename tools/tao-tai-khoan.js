#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════
   GITA 365 — SINH BỘ TÀI KHOẢN KHỞI ĐẦU

       node tools/tao-tai-khoan.js

   Ra hai thứ:
     giay-phep/GITA_NapTaiKhoan.gs  — dán vào Apps Script, chạy một lần
                                       rồi XOÁ. Ghi tài khoản vào sổ users
                                       với mật khẩu đã băm + muối.
     giay-phep/BAN_GIAO_TAI_KHOAN.md — bảng bàn giao cho Admin, có mật khẩu
                                       khởi đầu để phát cho từng người.

   Mọi tài khoản đều bật mustChangePw: người nhận buộc phải đổi mật khẩu
   ngay lần đăng nhập đầu. Mật khẩu khởi đầu chỉ dùng đúng một lần.

   ⚠ Hai tệp trên mang mật khẩu thật. giay-phep/ nằm trong .gitignore.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const GOC = path.join(__dirname, '..');
const RA = path.join(GOC, 'giay-phep');

/* Đọc danh sách vai và tài khoản mẫu từ chính mã nguồn — một nguồn sự thật */
global.window = {};
eval(fs.readFileSync(path.join(GOC, 'src', 'data.core.js'), 'utf8'));
eval(fs.readFileSync(path.join(GOC, 'src', 'data.accounts.js'), 'utf8'));
const G = global.window.G;

/* Mật khẩu khởi đầu: dễ đọc qua điện thoại, khó đoán, đủ chuẩn.
   Không dùng chữ dễ nhầm (0/O, 1/l/I). */
const CHU = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
const thuong = 'abcdefghijkmnpqrstuvwxyz';
const SO = '23456789';
const DAC = '#@$%&*!?';
function matKhau() {
  const lay = (n, b) => Array.from({ length: n }, () => b[crypto.randomInt(b.length)]).join('');
  const tho = (lay(2, CHU) + lay(4, thuong) + lay(3, SO) + lay(2, DAC) + lay(2, thuong)).split('');
  /* trộn nhưng giữ ký tự đầu là chữ hoa cho dễ đọc */
  for (let i = tho.length - 1; i > 1; i--) {
    const j = 1 + crypto.randomInt(i);
    [tho[i], tho[j]] = [tho[j], tho[i]];
  }
  return tho.join('');
}

const ds = G.ACCOUNTS.map(a => {
  const r = G.ROLES.filter(x => x.id === a.role)[0] || {};
  return {
    username: a.u, fullName: a.ten, role: a.role, vaiTen: r.n || '', lv: r.lv,
    portal: r.portal, phamVi: a.nha, mk: matKhau(),
    studentId: r.portal === 'ph' || r.portal === 'hs' ? 'S-001' : ''
  };
});
const kiemThu = G.AUDITORS.map(a => {
  const r = G.ROLES.filter(x => x.id === a.role)[0] || {};
  return {
    username: a.u, fullName: a.ten, role: a.role, vaiTen: r.n || '', lv: r.lv,
    portal: r.portal, phamVi: 'Tài khoản phản biện · ' + a.persona, mk: matKhau(),
    studentId: r.portal === 'ph' ? 'S-001' : ''
  };
});
const tatCa = ds.concat(kiemThu);

/* ─── Tệp nạp vào Apps Script ─── */
const gs = `/**
 * GITA 365 — NẠP BỘ TÀI KHOẢN KHỞI ĐẦU
 *
 * BỐN BƯỚC, không bỏ bước nào:
 *   1. Dán tệp này vào dự án Apps Script của GITA 365.
 *   2. Chọn hàm napTaiKhoanMotLan rồi bấm Run.
 *   3. Xem log: phải báo "Đã nạp ${tatCa.length} tài khoản".
 *   4. XOÁ TỆP NÀY khỏi dự án Apps Script ngay lập tức.
 *
 * Mật khẩu được băm bằng hashPw_ + newSalt_ của 02_Security.gs ngay
 * trên máy chủ. Mật khẩu thô KHÔNG bao giờ nằm trong sổ users.
 * Mọi tài khoản đều bật mustChangePw — buộc đổi ở lần đăng nhập đầu.
 *
 * ⚠ TỆP NÀY MANG MẬT KHẨU KHỞI ĐẦU THẬT.
 *   Tạo lúc: ${new Date().toISOString()}
 */
function napTaiKhoanMotLan() {
  var ds = ${JSON.stringify(tatCa.map(x => ({
    username: x.username, fullName: x.fullName, role: x.role,
    studentId: x.studentId, mk: x.mk
  })), null, 4).replace(/\n/g, '\n  ')};

  var moi = 0, capNhat = 0;
  ds.forEach(function (a) {
    var muoi = newSalt_();
    var ho = {
      username: a.username, fullName: a.fullName, role: a.role,
      studentId: a.studentId || '', email: a.username,
      pwSalt: muoi, pwHash: hashPw_(a.mk, muoi),
      active: 'TRUE', mustChangePw: 'TRUE',
      createdAt: new Date().toISOString(), createdBy: 'SEED', note: 'Tài khoản khởi đầu'
    };
    var co = Store.all('users').filter(function (x) {
      return String(x.username || '').toLowerCase() === a.username.toLowerCase();
    })[0];
    if (co) { Store.update('users', co.id, ho); capNhat++; }
    else { ho.id = uid('USR-'); Store.insert('users', ho); moi++; }
  });

  var t = 'Đã nạp ' + ds.length + ' tài khoản (' + moi + ' mới, ' + capNhat + ' cập nhật). ' +
          'XOÁ TỆP NÀY khỏi dự án ngay bây giờ.';
  Logger.log(t);
  return t;
}

/** Xem tài khoản nào chưa đổi mật khẩu khởi đầu. */
function kiemTaiKhoanChuaDoi() {
  var ds = Store.all('users').filter(function (x) { return isTrue(x.mustChangePw); });
  return ds.length ? ds.map(function (x) { return x.username; }).join(', ')
                   : 'Mọi tài khoản đều đã đổi mật khẩu khởi đầu.';
}
`;

/* ─── Bảng bàn giao ─── */
const cot = ['Vị trí', 'Cấp', 'Tên đăng nhập', 'Mật khẩu khởi đầu', 'Người nhận', 'Phạm vi'];
const hang = tatCa.map(x => [x.vaiTen, 'lv' + x.lv, x.username, x.mk, x.fullName, x.phamVi]);
const rong = cot.map((c, i) => Math.max(c.length, ...hang.map(r => String(r[i]).length)));
const dong = r => '| ' + r.map((v, i) => String(v).padEnd(rong[i])).join(' | ') + ' |';

const md = `# GITA 365 — BÀN GIAO BỘ TÀI KHOẢN KHỞI ĐẦU

Sinh lúc: ${new Date().toLocaleString('vi-VN')} · ${tatCa.length} tài khoản

## ĐỌC KỸ CHỖ NÀY TRƯỚC — có HAI bộ tài khoản khác nhau

| | Bộ A — **chạy ngay** | Bộ B — **bảng dưới đây** |
|---|---|---|
| Nằm ở đâu | Sẵn trong app và bản web | Máy chủ Apps Script |
| Dùng được khi nào | **Ngay bây giờ**, không cần làm gì | **Chỉ sau khi** nạp lên máy chủ và nối <code>cau-hinh.js</code> |
| Mật khẩu | <code>Gita#Super01</code>, <code>Gita#Coach07</code>… — xem ngay trong app | Bảng dưới đây |
| Để làm gì | Xem thử, kiểm tra giao diện, kiểm phạm vi từng vai | Vận hành thật với dữ liệu thật |

**Muốn vào app ngay bây giờ thì KHÔNG dùng bảng dưới đây.** Làm thế này:

> Mở app → ở cột phải, **bấm thẳng vào một vai** (ví dụ *R01 Super Admin*) →
> vào luôn, không cần mật khẩu.
>
> Hoặc bấm **Xem tài khoản và mật khẩu** để thấy đủ 15 tài khoản kèm mật khẩu.

Bảng dưới đây chỉ dùng tới ở **bước cuối**, khi anh đã dựng xong máy chủ.

---

> ⚠ **Tệp này mang mật khẩu thật.** Phát cho từng người theo kênh riêng —
> nhắn riêng hoặc đưa tận tay. Đừng gửi cả bảng vào nhóm chat.
> Người nhận **buộc phải đổi mật khẩu ngay lần đăng nhập đầu**;
> mật khẩu trong bảng này chỉ dùng được đúng một lần.

## Mười lăm vị trí vận hành

${dong(cot)}
${dong(rong.map(n => '-'.repeat(n)))}
${hang.slice(0, 15).map(dong).join('\n')}

## Bốn tài khoản phản biện — dùng để tự chấm hệ thống

${dong(cot)}
${dong(rong.map(n => '-'.repeat(n)))}
${hang.slice(15).map(dong).join('\n')}

## Ai xuất được gì

| Việc | Vai được phép | Vai KHÔNG được |
|---|---|---|
| In PDF (\`xuat_pdf\`) | R01–R05 — từ Trưởng nhóm Coach trở lên | R06–R15, gồm **toàn bộ khách hàng** |
| Đẩy Google Sheet lên Drive (\`xuat_sheet\`) | R01–R04 — Ban điều hành | R05–R15 |
| Mở kho nghề | R01–R11 | Phụ huynh, học viên, cộng tác viên |

Khách hàng muốn có bản giấy thì Coach hoặc quản lý in gửi. Không có
đường nào cho khách tự xuất hồ sơ.

## Khi nào dùng bảng này

Chỉ sau khi đã xong ba bước trong <code>docs/CACH_LAM.md</code>:
dán bốn tệp <code>server/*.gs</code> vào Apps Script → nạp bộ khoá → Deploy Web app →
điền URL vào <code>cau-hinh.js</code>. Chưa xong ba bước đó thì mật khẩu trong bảng
này chưa có chỗ nào kiểm được.

## Ba việc cần làm khi tới lúc

1. **Nạp tài khoản**: dán \`giay-phep/GITA_NapTaiKhoan.gs\` vào Apps Script →
   chạy \`napTaiKhoanMotLan()\` → thấy log "Đã nạp ${tatCa.length} tài khoản" →
   **xoá tệp đó khỏi dự án**.
2. **Phát mật khẩu** cho từng người theo kênh riêng.
3. **Kiểm sau một tuần**: chạy \`kiemTaiKhoanChuaDoi()\` trên Apps Script.
   Ai còn trong danh sách là chưa đăng nhập lần nào — nhắc hoặc khoá.

## Khi ai đó quên mật khẩu

Người dùng tự làm được, không cần Admin:
Màn hình đăng nhập → **Quên mật khẩu?** → nhập email → nhận mã sáu số →
đặt mật khẩu mới. Mã sống 15 phút, sai 5 lần thì huỷ, tối đa 5 lần xin mã mỗi giờ.

## Đổi mật khẩu khi đang dùng

Thanh trái → **Đổi mật khẩu**. Đổi xong hệ thống đóng phiên hiện tại,
đăng nhập lại bằng mật khẩu mới.
`;

fs.mkdirSync(RA, { recursive: true });
fs.writeFileSync(path.join(RA, 'GITA_NapTaiKhoan.gs'), gs);
fs.writeFileSync(path.join(RA, 'BAN_GIAO_TAI_KHOAN.md'), md);

console.log('  Đã sinh ' + tatCa.length + ' tài khoản (' + ds.length + ' vị trí + ' + kiemThu.length + ' phản biện)');
console.log('  giay-phep/GITA_NapTaiKhoan.gs   → dán vào Apps Script, chạy một lần rồi xoá');
console.log('  giay-phep/BAN_GIAO_TAI_KHOAN.md → bảng bàn giao, phát cho từng người');
console.log('\n  Mọi tài khoản đều bật mustChangePw — buộc đổi ở lần đăng nhập đầu.');
console.log('  ⚠ Cả hai tệp mang mật khẩu thật. giay-phep/ nằm trong .gitignore.');
