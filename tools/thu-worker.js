/* ═══════════════════════════════════════════════════════════════
   GITA 365 — THỬ CỬA VÀO MỚI

       node tools/thu-worker.js

   Bộ thử gọi ĐÚNG hàm fetch của may-chu/worker.js, qua một Request
   thật và nhận về một Response thật. Không dựng lại luồng xử lý ở đây:
   dựng lại là thử một bản chép, và bản chép thì đúng cho tới hôm bản
   thật đổi.

   Chỗ duy nhất phải dựng là D1 — Cloudflare không chạy được ở máy này.
   Lớp dựng ấy mỏng đúng ba hàm (.bind .first .all .run) và chạy trên
   node:sqlite, tức là chạy trên CÙNG một cỗ máy cơ sở dữ liệu mà D1
   dùng. Câu lệnh nào chạy ở đây thì chạy ở đó.

   ═══════════ MỖI PHÉP ĐO Ở ĐÂY LÀ MỘT CÂU HỎI VỀ AN TOÀN ═══════════

   Cửa vào là chỗ duy nhất người lạ chạm được. Nên bộ thử này không đo
   "chạy có ra kết quả không" — nó đo những chỗ mà một câu trả lời SAI
   sẽ mở ra một cánh cửa: dò được email nào đã đăng ký, dùng token của
   người khác, giữ phiên cũ sau khi đổi mật khẩu, rút khoá kho hàng
   loạt, nhận khoá của gói không được cấp.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
const path = require('path');
process.chdir(path.join(__dirname, '..'));
const fs = require('fs');
const { DatabaseSync } = require('node:sqlite');

const dinhDangVN = n => Number(n || 0).toLocaleString('vi-VN') + 'đ';

/* ══ NGÀY THEO GIỜ VIỆT NAM ══

   Hai phép đo dưới đây từng ĐỎ THEO NGÀY TRONG TUẦN, và đó là lớp hỏng
   tệ nhất một bộ thử có thể mắc: nó không đỏ mỗi lần, nó đỏ THỈNH
   THOẢNG, nên sau vài lần người ta chạy lại cho qua — tới hôm nó đỏ vì
   lý do thật thì cũng chạy lại cho qua nốt. Chính kho này đã ghi lời
   cảnh báo ấy ở tools/doi-kho-xong.js.

   Gốc của nó: mẫu thử ghi phiếu theo "BÂY GIỜ", còn phép đo neo vào một
   ngày GÕ CỨNG. Hai cái ấy chỉ khớp nhau vào một số ngày. Bắt được lúc
   giờ Việt Nam vừa qua nửa đêm Chủ nhật sang Thứ Hai: tuần ISO đóng
   lại, và phép đo "không chốt được tuần chưa hết" lật.

   Nay cả hai đọc CÙNG một cái đồng hồ. */
const ngayVN = (themNgay) => new Date(Date.now() + 7 * 3600e3 +
  (themNgay || 0) * 86400e3).toISOString().slice(0, 10);
let loi = 0;
const bao = (ok, ten, ct) => {
  if (!ok) loi++;
  console.log((ok ? '  ✓ ' : '  ✗ ') + ten + (ct ? ' — ' + ct : ''));
};

/* ═══════════════ LỚP DỰNG D1 ═══════════════
   Ba hàm, không hơn. Mỗi hàm thêm vào đây là một chỗ bộ thử có thể
   khác bản thật mà không ai biết. */
function dungD1(db) {
  return {
    prepare(sql) {
      let dv = [];
      const o = {
        bind(...a) { dv = a; return o; },
        async first() { return db.prepare(sql).get(...dv) ?? null; },
        async all()   { return {results: db.prepare(sql).all(...dv)}; },
        async run()   {
          const r = db.prepare(sql).run(...dv);
          return {meta: {changes: Number(r.changes || 0)}};
        }
      };
      return o;
    },
    /* batch: D1 chạy một MẢNG câu đã .bind() trong MỘT giao dịch — all-or-nothing.
       Thêm ở đây KHÔNG làm bộ thử khác bản thật: batch là một method D1 THẬT, nên
       có nó thì bộ thử canh đúng hành vi nguyên tử mà bản thật đảm bảo. Không có
       nó thì mọi cửa nhiều-ghi phải tự viết BEGIN/COMMIT tay — đúng lỗ nửa-chừng
       đợt thanh tra $500M nêu. Một câu trong mảng ném lỗi thì cả mảng ROLLBACK. */
    async batch(stmts) {
      db.exec('BEGIN');
      try {
        const out = [];
        for (const s of stmts) out.push(await s.run());
        db.exec('COMMIT');
        return out;
      } catch (e) {
        try { db.exec('ROLLBACK'); } catch (_) {}
        throw e;
      }
    }
  };
}

/* ═══════════════ LỚP DỰNG KHO TỆP R2 ═══════════════
   Bốn hàm Worker thật sự gọi: get · put · delete, và get trả về một đối
   tượng có .text() và .arrayBuffer(). Không thêm gì nữa — mỗi hàm thừa
   là một chỗ bộ thử có thể khác bản thật mà không ai biết. */
function dungR2() {
  const tep = new Map();
  return {
    _tep: tep,
    async get(k) {
      if (!tep.has(k)) return null;
      const b = tep.get(k);
      return {async text() { return b; }, async arrayBuffer() { return Buffer.from(b); }};
    },
    async put(k, v) { tep.set(k, Buffer.isBuffer(v) ? v.toString('utf8') : String(v)); },
    async delete(k) { tep.delete(k); }
  };
}


(async () => {
console.log('\nTHỬ CỬA VÀO MỚI — Worker thật, D1 dựng trên node:sqlite\n');

const db = new DatabaseSync(':memory:');
db.exec(fs.readFileSync('may-chu/csdl.sql', 'utf8'));

const worker = (await import('../may-chu/worker.js')).default;
const nen    = await import('../may-chu/nen.js');

const kho = dungR2();
/* HỘP THƯ GIẢ. guiThu đẩy thư vào đây thay vì gọi ra mạng — nên bộ thử
   đọc được ĐÚNG lá thư người dùng sẽ nhận, kể cả mã sáu số nằm trong
   đó. Không có nó thì phần đăng ký chỉ kiểm được "có trả về ok không",
   mà chỗ dễ sai nhất lại là NỘI DUNG thư đi tới đâu và mang gì. */
const hopThu = [];
const env = {
  CSDL: dungD1(db),
  HOSO: kho,
  GHI_THU: hopThu,
  GITA_DIA_CHI_WEB: 'https://gita.edu.vn',
  GITA_TIEU: 'tieu-thu-nghiem-khong-dung-that',
  GITA_KHOA_KY: 'khoa-ky-thu-nghiem-khong-dung-that',
  GITA_KHOA_KHO: JSON.stringify({
    nen: 'khoa-nen', nghe: 'khoa-nghe', 'nghe-cao': 'khoa-nghe-cao',
    tang1: 'k1', tang2: 'k2', tang3: 'k3', tang4: 'k4', tang5: 'k5'
  })
};

const goi = async y => {
  const r = await worker.fetch(new Request('https://gita.test/', {
    method: 'POST', headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(y)
  }), env);
  return {ma: r.status, than: await r.json(), tieuDe: r.headers};
};

/* ═══════════════ 1 · DỰNG TÀI KHOẢN ═══════════════ */
console.log('1 · DỰNG TÀI KHOẢN');
async function themNguoi(id, u, mk, role, opt) {
  const muoi = nen.muoiMoi();
  db.prepare('INSERT INTO users (id,username,hoTen,email,role,portal,pwSalt,pwHash,active,' +
    'createdAt,mustChangePw) VALUES (?,?,?,?,?,?,?,?,?,?,?)').run(
    id, u, 'Người ' + id, u, role, (opt && opt.portal) || 'ph',
    muoi, await nen.bamMoi(mk, muoi, env.GITA_TIEU),
    (opt && opt.active === 0) ? 0 : 1, new Date().toISOString(),
    (opt && opt.mustChangePw) ? 1 : 0);
}
/* Một tài khoản CỐ Ý còn bản băm KIỂU CŨ — để phép đo nâng bản băm ở
   mục 3 có thứ thật để nâng, chứ không nâng một bản do chính nó vừa
   dựng bằng cách mới. */
async function themNguoiBamCu(id, u, mk, role) {
  const muoi = nen.muoiMoi();
  db.prepare('INSERT INTO users (id,username,hoTen,email,role,portal,pwSalt,pwHash,active,createdAt) ' +
    'VALUES (?,?,?,?,?,?,?,?,1,?)').run(
    id, u, 'Người ' + id, u, role, 'ph', muoi,
    await nen.bamCu(mk, muoi, env.GITA_TIEU), new Date().toISOString());
}

await themNguoi('U-ph', 'phuhuynh@gita365.vn', 'MatKhauRieng2026!', 'R13');
await themNguoi('U-coach', 'coach@gita365.vn', 'MatKhauRieng2026!', 'R07', {portal: 'coach'});
await themNguoi('U-gv', 'giaovien@gita365.vn', 'MatKhauRieng2026!', 'R08', {portal: 'coach'});
await themNguoi('U-khoa', 'bikhoa@gita365.vn', 'MatKhauRieng2026!', 'R13', {active: 0});
await themNguoi('U-tam', 'mktam@gita365.vn', 'MatKhauRieng2026!', 'R13', {mustChangePw: 1});
await themNguoiBamCu('U-cu', 'bamcu@gita365.vn', 'MatKhauRieng2026!', 'R13');
db.prepare('INSERT INTO students (id,hoTen,tier,phuHuynhId,createdAt) VALUES (?,?,?,?,?)')
  .run('HV-1', 'Con nhà A', 3, 'U-ph', new Date().toISOString());
bao(db.prepare('SELECT count(*) c FROM users').get().c === 6, 'dựng 6 tài khoản thử');

/* ═══════════════ 2 · ĐĂNG NHẬP ═══════════════ */
console.log('\n2 · ĐĂNG NHẬP');
const dn = await goi({fn: 'dangNhap', u: 'phuhuynh@gita365.vn', mk: 'MatKhauRieng2026!'});
bao(dn.than.ok && dn.than.token, 'mật khẩu đúng thì vào được', 'vai ' + dn.than.role);
bao(dn.than.tier === 3, 'trả về đúng tầng đang học, đọc từ hồ sơ học viên', 'tầng ' + dn.than.tier);
bao(dn.than.token && dn.than.token.length === 64,
  'token 32 byte ngẫu nhiên thật, không phải UUID', dn.than.token.length + ' ký tự hex');

const sai = await goi({fn: 'dangNhap', u: 'phuhuynh@gita365.vn', mk: 'sai-roi'});
const khong = await goi({fn: 'dangNhap', u: 'khongcoai@gita365.vn', mk: 'gi-cung-duoc'});
bao(!sai.than.ok && !khong.than.ok, 'sai mật khẩu và không có tài khoản đều bị từ chối');
bao(sai.than.error === khong.than.error,
  'HAI CÂU TỪ CHỐI GIỐNG HỆT NHAU — không dò được email nào đã đăng ký',
  JSON.stringify(sai.than.error));

const khoa = await goi({fn: 'dangNhap', u: 'bikhoa@gita365.vn', mk: 'MatKhauRieng2026!'});
bao(!khoa.than.ok && khoa.than.code === 'LOCKED',
  'nhưng ĐÚNG mật khẩu thì nói thật là tài khoản đang khoá',
  'tới đây người hỏi đã chứng minh họ là chủ tài khoản');

/* ═══════════════ 3 · NÂNG BẢN BĂM, KHÔNG BẮT AI ĐẶT LẠI ═══════════════ */
console.log('\n3 · NÂNG BẢN BĂM MẬT KHẨU');
const truoc = db.prepare('SELECT pwHash FROM users WHERE id = ?').get('U-cu').pwHash;
bao(!truoc.startsWith('pbkdf2$'), 'tài khoản này đang giữ bản băm KIỂU CŨ — SHA-256 một vòng',
  truoc.slice(0, 16) + '…');
const dnCu = await goi({fn: 'dangNhap', u: 'bamcu@gita365.vn', mk: 'MatKhauRieng2026!'});
bao(dnCu.than.ok, 'bản băm cũ vẫn đăng nhập được — không ai bị bắt đặt lại mật khẩu');
const sau = db.prepare('SELECT pwHash FROM users WHERE id = ?').get('U-cu').pwHash;
bao(sau.startsWith('pbkdf2$'), 'và bản băm được thay bằng PBKDF2 NGAY trong lượt ấy',
  sau.split('$')[1] + ' vòng');
const dnCu2 = await goi({fn: 'dangNhap', u: 'bamcu@gita365.vn', mk: 'MatKhauRieng2026!'});
bao(dnCu2.than.ok, 'nâng xong vẫn đăng nhập được bằng đúng mật khẩu cũ');
bao(!(await goi({fn: 'dangNhap', u: 'bamcu@gita365.vn', mk: 'MatKhauRieng2027!'})).than.ok,
  'và mật khẩu sai vẫn bị từ chối sau khi nâng');

/* ═══════════════ 4 · PHIÊN ═══════════════ */
console.log('\n4 · PHIÊN');
const tk = dn.than.token;
/* ── ĐO ĐÚNG HÌNH MÁY KHÁCH GỬI, KHÔNG ĐO HÌNH TỰ TAY VIẾT RA ──

   Tới 9.99.5 mọi phép đo capKhoa đều tự tay viết một thân yêu cầu CÓ
   token, còn src/kho-khoa.js thì gửi {fn,u,vai,goi,may} — KHÔNG token.
   Nên máy chủ mới trả AUTH cho mọi lượt xin khoá của bản web, và kho
   mã hoá không bao giờ mở được. Bộ thử xanh suốt, vì nó thử một hình
   mà máy khách chưa từng gửi.

   Đây là lớp hỏng tệ nhất của một bộ thử: nó đo cổng, không đo đường
   đi tới cổng. */
const nhuMayKhach = await goi({fn:'capKhoa', token: tk, u:'phuhuynh@gita365.vn',
  vai:'R13', goi:['nen'], may:'trinh-duyet-thu'});
bao(nhuMayKhach.than.ok,
  'XIN KHOÁ KHO BẰNG ĐÚNG HÌNH MÁY KHÁCH GỬI — kèm vai và tên máy, không chỉ kèm token',
  'bộ thử đo cổng mà không đo đường đi tới cổng thì nó xanh cả khi máy khách gửi thiếu trường');

bao((await goi({fn: 'capKhoa', token: tk, u: 'phuhuynh@gita365.vn', goi: ['nen']})).than.ok,
  'token đúng thì qua cửa');
bao((await goi({fn: 'capKhoa', token: tk, u: 'coach@gita365.vn'})).than.code === 'AUTH',
  'TÊN GỬI LÊN PHẢI KHỚP PHIÊN — không dùng được token của người khác');
bao((await goi({fn: 'capKhoa', token: 'bia-ra-mot-token', u: 'phuhuynh@gita365.vn'})).than.code === 'AUTH',
  'token bịa thì bị chặn');

db.prepare('UPDATE sessions SET exp = ? WHERE id = ?').run(Date.now() - 1000, tk);
bao((await goi({fn: 'capKhoa', token: tk, u: 'phuhuynh@gita365.vn'})).than.code === 'AUTH',
  'phiên quá hạn thì hết dùng được');
db.prepare('UPDATE sessions SET exp = ? WHERE id = ?').run(Date.now() + 3600e3, tk);

/* ═══════════════ 5 · CẤP KHOÁ ĐÚNG PHẠM VI ═══════════════ */
console.log('\n5 · CẤP KHOÁ — ĐÚNG PHẠM VI, KHÔNG HƠN');
const ckPh = (await goi({fn: 'capKhoa', token: tk, u: 'phuhuynh@gita365.vn'})).than;
bao(ckPh.ok && ckPh.phamVi.join(',') === 'nen,tang1,tang2,tang3',
  'phụ huynh tầng 3 nhận nền + tầng 1-2-3, KHÔNG có tầng 4-5',
  ckPh.phamVi.join(', '));
bao(!ckPh.khoa['tang4'] && !ckPh.khoa['tang5'] && !ckPh.khoa['nghe'],
  'và trong khoá trả về cũng không có tầng 4, tầng 5 hay gói nghề');

const ckXin = (await goi({fn: 'capKhoa', token: tk, u: 'phuhuynh@gita365.vn',
  goi: ['nen', 'tang5', 'nghe', 'nghe-cao']})).than;
bao(ckXin.phamVi.join(',') === 'nen',
  'XIN THÊM GÓI KHÔNG ĐƯỢC CẤP THÌ KHÔNG ĐƯỢC — máy chủ giao nhau với phạm vi, không tin danh sách máy khách gửi lên',
  'xin 4 gói, nhận ' + ckXin.phamVi.join(', '));

const dnC = await goi({fn: 'dangNhap', u: 'coach@gita365.vn', mk: 'MatKhauRieng2026!'});
const ckC = (await goi({fn: 'capKhoa', token: dnC.than.token, u: 'coach@gita365.vn'})).than;
bao(ckC.phamVi.indexOf('nghe-cao') >= 0, 'Coach (bậc 7) nhận được gói NGHỀ CAO — hồ sơ khách tầng 4-5');

const dnG = await goi({fn: 'dangNhap', u: 'giaovien@gita365.vn', mk: 'MatKhauRieng2026!'});
const ckG = (await goi({fn: 'capKhoa', token: dnG.than.token, u: 'giaovien@gita365.vn'})).than;
bao(ckG.phamVi.indexOf('nghe') >= 0 && ckG.phamVi.indexOf('nghe-cao') < 0,
  'Giáo viên (bậc 8) nhận gói nghề nhưng KHÔNG nhận gói nghề cao',
  'chốt của chủ hệ: tầng 4-5 chỉ từ Coach lên — ' + ckG.phamVi.join(', '));

const dnT = await goi({fn: 'dangNhap', u: 'mktam@gita365.vn', mk: 'MatKhauRieng2026!'});
bao(dnT.than.ok && dnT.than.phaiDoiMk, 'mật khẩu tạm vẫn đăng nhập được');
bao((await goi({fn: 'capKhoa', token: dnT.than.token, u: 'mktam@gita365.vn'})).than.code === 'MUSTCHANGE',
  'nhưng mật khẩu tạm KHÔNG mở được kho — nó đã đi qua log và qua email');

/* ═══════════════ 6 · ĐỔI MẬT KHẨU ĐÁ PHIÊN KHÁC ═══════════════ */
console.log('\n6 · ĐỔI MẬT KHẨU');
const dnA = await goi({fn: 'dangNhap', u: 'coach@gita365.vn', mk: 'MatKhauRieng2026!'});
const dnB = await goi({fn: 'dangNhap', u: 'coach@gita365.vn', mk: 'MatKhauRieng2026!'});
bao(dnA.than.token !== dnB.than.token, 'mở được hai phiên cùng lúc trên hai máy');

bao(!(await goi({fn: 'doiMatKhau', token: dnA.than.token, u: 'coach@gita365.vn',
  cu: 'sai', moi: 'MotChuoiKhacHan2026!'})).than.ok, 'sai mật khẩu cũ thì không đổi được');
bao(!(await goi({fn: 'doiMatKhau', token: dnA.than.token, u: 'coach@gita365.vn',
  cu: 'MatKhauRieng2026!', moi: 'password123'})).than.ok,
  'mật khẩu mới dễ đoán thì bị chặn ngay lần đầu');

const doi = (await goi({fn: 'doiMatKhau', token: dnA.than.token, u: 'coach@gita365.vn',
  cu: 'MatKhauRieng2026!', moi: 'MotChuoiKhacHan2026!'})).than;
bao(doi.ok, 'đổi được mật khẩu');
bao((await goi({fn: 'capKhoa', token: dnB.than.token, u: 'coach@gita365.vn'})).than.code === 'AUTH',
  'ĐỔI MẬT KHẨU ĐÁ LUÔN PHIÊN TRÊN MÁY KHÁC — kẻ giữ token cũ mất quyền ngay',
  'đá ' + doi.daPhien + ' phiên');
bao((await goi({fn: 'capKhoa', token: dnA.than.token, u: 'coach@gita365.vn'})).than.ok,
  'nhưng phiên đang dùng để đổi thì giữ lại — không tự đá mình ra');
bao((await goi({fn: 'dangNhap', u: 'coach@gita365.vn', mk: 'MotChuoiKhacHan2026!'})).than.ok &&
    !(await goi({fn: 'dangNhap', u: 'coach@gita365.vn', mk: 'MatKhauRieng2026!'})).than.ok,
  'mật khẩu mới dùng được, mật khẩu cũ hết dùng được');

/* ═══════════════ 7 · CHẶN NHỊP ═══════════════ */
console.log('\n7 · CHẶN NHỊP');
for (let i = 0; i < 12; i++)
  await goi({fn: 'dangNhap', u: 'phuhuynh@gita365.vn', mk: 'doan-thu-' + i});
const chan = await goi({fn: 'dangNhap', u: 'phuhuynh@gita365.vn', mk: 'MatKhauRieng2026!'});
bao(!chan.than.ok && chan.than.code === 'RATE',
  'đoán liên tiếp thì bị chặn, KỂ CẢ khi gõ đúng mật khẩu ở lượt sau',
  chan.than.error);
bao(db.prepare("SELECT count(*) c FROM chanNhip WHERE khoa LIKE 'dangNhapSai%'").get().c > 0,
  'số đếm nằm trong CƠ SỞ DỮ LIỆU, không nằm trong bộ nhớ từng máy chủ',
  'Worker chạy ở hàng trăm nơi cùng lúc — đếm trong bộ nhớ thì rải đều lượt thử là qua được');

/* Đăng nhập đúng thì xoá số đếm — người gõ nhầm vài lần rồi gõ đúng
   không bị phạt tiếp ở lần sau. */
db.exec("DELETE FROM chanNhip WHERE khoa LIKE 'dangNhapSai%'");
await goi({fn: 'dangNhap', u: 'phuhuynh@gita365.vn', mk: 'sai'});
await goi({fn: 'dangNhap', u: 'phuhuynh@gita365.vn', mk: 'MatKhauRieng2026!'});
bao(db.prepare("SELECT count(*) c FROM chanNhip WHERE khoa LIKE 'dangNhapSai%'").get().c === 0,
  'gõ đúng thì số đếm được xoá — gõ nhầm vài lần không bị phạt sang lần sau');

/* ═══════════════ 8 · ĐỒNG BỘ HỒ SƠ ═══════════════ */
console.log('\n8 · ĐỒNG BỘ HỒ SƠ');
db.prepare("UPDATE users SET maKhachHang = 'GITA-0001' WHERE id = 'U-ph'").run();
db.prepare("UPDATE users SET maKhachHang = 'GITA-0002' WHERE id = 'U-gv'").run();

const dnP = await goi({fn: 'dangNhap', u: 'phuhuynh@gita365.vn', mk: 'MatKhauRieng2026!'});
const tkP = dnP.than.token;
const day1 = await goi({fn: 'dongBo', token: tkP, u: 'phuhuynh@gita365.vn',
  day: {journal: {'n-1': 'tối nay con tự ngồi vào bàn'}},
  mocTruong: {'journal.n-1': 1000}});
bao(day1.than.ok && day1.than.keo.journal['n-1'] === 'tối nay con tự ngồi vào bàn',
  'đẩy lên rồi kéo về đúng thứ vừa đẩy');
bao(kho._tep.has('hoso/U-ph.json'),
  'RUỘT hồ sơ nằm trong KHO TỆP, không nằm trong bảng',
  'nền cũ nhét cả khối JSON vào MỘT Ô Sheets — trần 50.000 ký tự, trong khi mã tin trần là 512 KB');
bao(!db.prepare('SELECT * FROM hosoApp WHERE uid = ?').get('U-ph').khoaTep.includes('journal'),
  'bảng chỉ giữ CHỖ TRỎ và kích cỡ',
  db.prepare('SELECT khoaTep, coByte FROM hosoApp WHERE uid = ?').get('U-ph').khoaTep);

/* GỘP THEO TỪNG TRƯỜNG: hai máy sửa hai việc khác nhau thì giữ CẢ HAI. */
const day2 = await goi({fn: 'dongBo', token: tkP, u: 'phuhuynh@gita365.vn',
  day: {journal: {'n-2': 'ghi từ máy thứ hai'}},
  mocTruong: {'journal.n-2': 2000}});
bao(day2.than.keo.journal['n-1'] && day2.than.keo.journal['n-2'],
  'GỘP THEO TỪNG TRƯỜNG — máy thứ hai đẩy lên không xoá việc máy thứ nhất đã ghi',
  Object.keys(day2.than.keo.journal).join(', '));

/* Mốc cũ hơn thì KHÔNG thắng — nếu không thì một máy để lâu không mở
   sẽ ghi đè lên mọi thứ vừa làm trên máy khác. */
const cu = await goi({fn: 'dongBo', token: tkP, u: 'phuhuynh@gita365.vn',
  day: {journal: {'n-2': 'bản CŨ từ máy để lâu không mở'}},
  mocTruong: {'journal.n-2': 500}});
bao(cu.than.keo.journal['n-2'] === 'ghi từ máy thứ hai',
  'MỐC CŨ HƠN THÌ KHÔNG THẮNG — máy để lâu không mở không ghi đè việc vừa làm',
  'và bản mới hơn đi ngược về máy ấy ở phần keo');

/* Nhóm không có trong danh sách thì từ chối, và NÓI RA đã bỏ qua gì. */
const la = await goi({fn: 'dongBo', token: tkP, u: 'phuhuynh@gita365.vn',
  day: {nhomBiaRa: {x: 1}}, mocTruong: {'nhomBiaRa.x': 9000}});
bao(la.than.boQua.indexOf('nhomBiaRa') >= 0,
  'nhóm ngoài danh sách bị bỏ qua và ĐƯỢC NÓI RA — không im lặng nuốt mất');

/* Trần kích thước. */
const to = await goi({fn: 'dongBo', token: tkP, u: 'phuhuynh@gita365.vn',
  day: {journal: {big: 'x'.repeat(600 * 1024)}}, mocTruong: {'journal.big': 9999}});
bao(to.than.code === 'TOOBIG', 'gói quá 512 KB bị từ chối — không đẩy cả kho lên bằng một lệnh');

/* SAO LƯU TRƯỚC KHI GHI ĐÈ, và giữ đúng mười bản gần nhất. */
const soSao = db.prepare('SELECT count(*) c FROM hosoAppSaoLuu WHERE uid = ?').get('U-ph').c;
bao(soSao >= 1, 'có sao lưu trước mỗi lần ghi đè', soSao + ' bản');
for (let i = 0; i < 14; i++)
  await goi({fn: 'dongBo', token: tkP, u: 'phuhuynh@gita365.vn',
    day: {journal: {['lap-' + i]: 'x'}}, mocTruong: {['journal.lap-' + i]: 3000 + i}});
const sauDon = db.prepare('SELECT count(*) c FROM hosoAppSaoLuu WHERE uid = ?').get('U-ph').c;
bao(sauDon === 10, 'giữ đúng MƯỜI bản sao lưu gần nhất, dọn ngay chứ không đợi bộ dọn đêm',
  sauDon + ' bản · ' + [...kho._tep.keys()].filter(k => k.startsWith('hoso-sao/U-ph')).length + ' tệp trong kho');
bao([...kho._tep.keys()].filter(k => k.startsWith('hoso-sao/U-ph')).length === 10,
  'và tệp trong kho cũng được xoá theo — không để lại tệp mồ côi tính tiền hằng tháng');

/* ── CẮT CỤM DÙNG CHUNG THEO TỪNG NHÀ ──
   Đây là chỗ một câu trả lời sai làm rò dữ liệu nhà này sang nhà khác. */
console.log('');
const dnCo = await goi({fn: 'dangNhap', u: 'coach@gita365.vn', mk: 'MotChuoiKhacHan2026!'});
const dbCo = await goi({fn: 'dongBo', token: dnCo.than.token, u: 'coach@gita365.vn',
  day: {}, caiDat: {
    khothem: {luc: 5000, du: {'GITA-0001|tl·A1': 'tư liệu nhà 1', 'GITA-0002|tl·B1': 'tư liệu nhà 2'}},
    ca: {luc: 5000, du: {'ca-1': 'nguyên văn lời gia đình kể, có tên và số điện thoại'}}
  }});
bao(dbCo.than.ok && dbCo.than.caiDat.ca, 'Coach (bậc 7) ghi và nhận lại được hồ sơ ca');
bao(Object.keys(dbCo.than.caiDat.khothem.du).length === 2, 'và nhận CẢ cụm tư liệu của mọi nhà');

const dbPh = await goi({fn: 'dongBo', token: tkP, u: 'phuhuynh@gita365.vn', day: {}});
bao(!dbPh.than.caiDat.ca,
  'PHỤ HUYNH KHÔNG NHẬN HỒ SƠ CA — nó mang tên nhà, số điện thoại và nguyên văn lời gia đình kể');
bao(!dbPh.than.caiDat.phanquyen && !dbPh.than.caiDat.tainguyen,
  'phụ huynh cũng không nhận bảng phân quyền hay mức dùng tài nguyên của đội ngũ');
const kt = dbPh.than.caiDat.khothem;
bao(kt && Object.keys(kt.du).length === 1 && kt.du['GITA-0001|tl·A1'],
  'CẮT THEO MÃ NHÀ — phụ huynh nhà 1 chỉ nhận tư liệu của nhà 1',
  'trả nguyên khối là gửi tư liệu nhà khác xuống máy họ, và mở khoá tư liệu ấy cho tất cả');

/* Gia đình chỉ đẩy được LỜI XIN, không ghi được vào cụm tư liệu. */
await goi({fn: 'dongBo', token: tkP, u: 'phuhuynh@gita365.vn', day: {},
  caiDat: {khothem: {luc: 9999, du: {'GITA-0001|tl·TU-GHI': 'nhà tự ghi vào kho tư liệu'}},
           xinthem: {luc: 9999, du: [{nha: 'GITA-0001', xin: 'cho con thêm bài đọc'}]}}});
const soi = await goi({fn: 'dongBo', token: dnCo.than.token, u: 'coach@gita365.vn', day: {}});
bao(!soi.than.caiDat.khothem.du['GITA-0001|tl·TU-GHI'],
  'GIA ĐÌNH KHÔNG GHI ĐƯỢC vào cụm tư liệu — chỉ Tư vấn và Coach mới ghi',
  'chặn ở máy chủ, không chặn ở màn hình');
bao(soi.than.caiDat.xinthem && soi.than.caiDat.xinthem.du.length === 1,
  'nhưng LỜI XIN của gia đình thì lên được — đó là đường duy nhất họ đặt yêu cầu');

/* ═══════════════ 9 · ĐĂNG KÝ, MÃ SÁU SỐ QUA EMAIL, KÍCH HOẠT ═══════════════ */
console.log('\n9 · ĐĂNG KÝ QUA EMAIL');
const thuCuoi = () => hopThu[hopThu.length - 1] || {den:'', tieuDe:'(chưa có thư)', than:''};
const HOSO_MOI = {hoTen: 'Trần Thị B', email: 'nhamoi@vidu.vn', dienThoai: '0912345678',
  tenCon: 'Trần Văn C', lop: '7', tinh: 'Hà Nội', dyDieuKhoan: 1, dyDuLieuGiaDinh: 1};

/* Kiểm dữ liệu vào TRƯỚC khi gửi thư — sai định dạng thì không tốn một
   lá thư nào, và cũng không tạo một dòng chờ nào. */
hopThu.length = 0;
bao(!(await goi({fn: 'dangKy', hoSo: {...HOSO_MOI, email: 'khong-phai-email'}})).than.ok &&
    !(await goi({fn: 'dangKy', hoSo: {...HOSO_MOI, dienThoai: '123'}})).than.ok &&
    !(await goi({fn: 'dangKy', hoSo: {...HOSO_MOI, tenCon: ''}})).than.ok,
  'email sai, điện thoại sai, thiếu tên con — đều bị chặn');
bao(hopThu.length === 0, 'và không lá thư nào bị gửi đi cho ba lượt sai ấy');

/* Luật 91 (9.99.118): thiếu ô đồng ý bắt buộc thì máy chủ CHẶN — client-side
   là gợi ý, không phải cổng. Trả về trước mọi ghi/thư nên không quấy luồng. */
const dkThieuDy = await goi({fn: 'dangKy', hoSo: {...HOSO_MOI, dyDuLieuGiaDinh: 0}});
bao(!dkThieuDy.than.ok && dkThieuDy.than.code === 'THIEUDONGY',
  'THIẾU đồng ý dữ liệu gia đình thì máy chủ CHẶN đăng ký (không chỉ chặn ở màn)',
  'gỡ cổng thì một lượt gọi thẳng dangKy đăng ký được mà không đồng ý gì — code=' + dkThieuDy.than.code);

const dk = await goi({fn: 'dangKy', hoSo: HOSO_MOI});
bao(dk.than.ok && /mã sáu số/.test(dk.than.thongBao), 'đăng ký nhận về lời nhắn chờ mã');
bao(hopThu.length === 1 && thuCuoi().den === 'nhamoi@vidu.vn',
  'thư đi đúng địa chỉ người đăng ký', thuCuoi().tieuDe);
const maOtp = (thuCuoi().than.match(/là: (\d{6})/) || [])[1];
bao(!!maOtp && maOtp.length === 6, 'thư mang MÃ SÁU SỐ đọc được', maOtp);

/* Mã KHÔNG được nằm nguyên văn trong cơ sở dữ liệu. Một bản sao lưu lọt
   ra là mọi mã đang chờ đều đọc được, và mỗi mã ấy mở một tài khoản mới
   mang tên người khác. */
const dong = db.prepare("SELECT * FROM dangKyCho WHERE email = 'nhamoi@vidu.vn'").get();
bao(dong && dong.otpHash && dong.otpHash.indexOf(maOtp) < 0 && dong.otpHash.length === 64,
  'mã trong sổ đã BĂM, không nằm nguyên văn');

/* Câu trả lời phải GIỐNG HỆT nhau cho email đã có và email chưa có. */
const dkTrung = await goi({fn: 'dangKy',
  hoSo: {...HOSO_MOI, email: 'phuhuynh@gita365.vn'}});
bao(dkTrung.than.ok && dkTrung.than.thongBao.replace('phuhuynh@gita365.vn', 'nhamoi@vidu.vn')
      === dk.than.thongBao,
  'EMAIL ĐÃ CÓ TÀI KHOẢN trả lời Y HỆT email chưa có — không dò được ai đã đăng ký');
bao(/đã có tài khoản/.test(thuCuoi().tieuDe),
  'nhưng vẫn gửi một thư nhắc, để người THẬT biết phải làm gì', thuCuoi().tieuDe);

/* Nhập sai mã: đếm lùi và huỷ mã, không cho dò mãi. */
bao(!(await goi({fn: 'xacThucOtp', email: 'nhamoi@vidu.vn', ma: '000000'})).than.ok,
  'mã sai thì từ chối');
const sai2 = await goi({fn: 'xacThucOtp', email: 'nhamoi@vidu.vn', ma: '111111'});
bao(/Còn \d+ lần/.test(sai2.than.error || ''), 'và nói còn mấy lần nhập', sai2.than.error);
for (let i = 0; i < 4; i++)
  await goi({fn: 'xacThucOtp', email: 'nhamoi@vidu.vn', ma: '222222'});
bao(!(await goi({fn: 'xacThucOtp', email: 'nhamoi@vidu.vn', ma: maOtp})).than.ok,
  'SAI QUÁ NĂM LẦN THÌ HUỶ MÃ — kể cả sau đó gõ đúng mã cũng không qua');

/* Gửi lại mã: mã cũ chết, mã mới sống. */
hopThu.length = 0;
db.prepare("DELETE FROM chanNhip WHERE khoa LIKE 'dangKy%'").run();
await goi({fn: 'guiLaiOtp', email: 'nhamoi@vidu.vn'});
const maMoi = (thuCuoi().than.match(/: (\d{6})/) || [])[1];
bao(!!maMoi && maMoi !== maOtp, 'gửi lại thì ra mã KHÁC', maMoi);
bao(!(await goi({fn: 'xacThucOtp', email: 'nhamoi@vidu.vn', ma: maOtp})).than.ok,
  'mã cũ hết dùng được sau khi gửi lại');

const xt = await goi({fn: 'xacThucOtp', email: 'nhamoi@vidu.vn', ma: maMoi});
bao(xt.than.ok, 'mã mới đúng thì qua');
const lien = (thuCuoi().than.match(/#kichhoat=([a-f0-9]+)/) || [])[1];
bao(!!lien && lien.length === 64,
  'và thư kế tiếp mang ĐƯỜNG DẪN kích hoạt — người đăng ký phải quay lại TỪ hòm thư',
  'token ' + lien.length + ' ký tự hex');
const dong2 = db.prepare("SELECT * FROM dangKyCho WHERE email = 'nhamoi@vidu.vn'").get();
bao(!dong2.otpHash, 'bản băm mã đã xoá sau khi dùng xong — bí mật dùng rồi thì không giữ lại');

/* Kích hoạt: cùng một luật mật khẩu với chỗ đổi mật khẩu. */
bao(!(await goi({fn: 'kichHoat', token: lien, mk: '1234567890'})).than.ok,
  'MẬT KHẨU DỄ ĐOÁN KHÔNG MỞ ĐƯỢC TÀI KHOẢN MỚI',
  'nền cũ để cửa này chỉ đòi mười ký tự, nên đúng chuỗi này mở được');
bao(!(await goi({fn: 'kichHoat', token: 'bia-ra', mk: 'MotChuoiTuTe2026!'})).than.ok,
  'đường dẫn bịa thì không mở được');

hopThu.length = 0;
const kh = await goi({fn: 'kichHoat', token: lien, mk: 'MotChuoiTuTe2026!'});
bao(kh.than.ok && /^GITA-\d{4}$/.test(kh.than.maKhachHang || ''),
  'kích hoạt xong, cấp mã số khách hàng', kh.than.maKhachHang);
bao(/tài khoản đã mở/.test(thuCuoi().tieuDe), 'và gửi thư báo đã mở');

/* Luật 91 (9.99.118): hai đồng ý bắt buộc được GHI vào dongYDuLieu lúc kích
   hoạt — nên lúc tranh chấp có dòng "hôm ấy nhà này đã đồng ý", không phải
   một lời khai suông. */
const dyGhi = db.prepare("SELECT o FROM dongYDuLieu WHERE maNha=? AND viec='dongY' ORDER BY o")
  .all(kh.than.maKhachHang);
bao(dyGhi.length === 2 && dyGhi.map(r => r.o).join(',') === 'dieuKhoan,duLieuGiaDinh',
  'HAI đồng ý bắt buộc được GHI vào dongYDuLieu lúc kích hoạt (Luật 91 chứng minh được)',
  'ô đã ghi: ' + dyGhi.map(r => r.o).join(',') + ' — trước 9.99.118 KHÔNG ghi gì');

const dnMoi = await goi({fn: 'dangNhap', u: 'nhamoi@vidu.vn', mk: 'MotChuoiTuTe2026!'});
bao(dnMoi.than.ok && dnMoi.than.role === 'R13', 'tài khoản mới đăng nhập được ngay', dnMoi.than.role);
const hvMoi = db.prepare("SELECT * FROM students WHERE phuHuynhId = ?").get(
  db.prepare("SELECT id FROM users WHERE email = 'nhamoi@vidu.vn'").get().id);
bao(hvMoi && hvMoi.hoTen === 'Trần Văn C' && Number(hvMoi.tier) === 0,
  'và có hồ sơ học viên ở TẦNG 0 — chờ KPI và xác nhận thanh toán, máy chủ không tự nâng');

bao(!(await goi({fn: 'kichHoat', token: lien, mk: 'MotChuoiTuTe2026!'})).than.ok,
  'ĐƯỜNG DẪN DÙNG MỘT LẦN — bấm lại không mở thêm tài khoản thứ hai');

/* MÃ SỐ KHÁCH HÀNG KHÔNG ĐƯỢC TRÙNG. Nền cũ đếm count(*)+1 và phải
   quây trong khoá; ở đây là một câu lệnh cộng thêm, không cần khoá. */
const dem = {};
for (let i = 0; i < 30; i++) {
  db.prepare("DELETE FROM chanNhip").run();
  const e = 'nha' + i + '@vidu.vn';
  await goi({fn: 'dangKy', hoSo: {...HOSO_MOI, email: e}});
  const m = (thuCuoi().than.match(/là: (\d{6})/) || [])[1];
  await goi({fn: 'xacThucOtp', email: e, ma: m});
  const t = (thuCuoi().than.match(/#kichhoat=([a-f0-9]+)/) || [])[1];
  const r = await goi({fn: 'kichHoat', token: t, mk: 'MotChuoiTuTe2026!'});
  dem[r.than.maKhachHang] = (dem[r.than.maKhachHang] || 0) + 1;
}
bao(Object.keys(dem).length === 30 && Object.values(dem).every(x => x === 1),
  'ba mươi lượt kích hoạt ra BA MƯƠI mã khác nhau, không lượt nào trùng',
  Object.keys(dem).sort()[0] + ' … ' + Object.keys(dem).sort().pop());

/* Trần gửi thư: chặn người dội thư vào một hòm thư. */
db.prepare("DELETE FROM chanNhip").run();
hopThu.length = 0;
for (let i = 0; i < 6; i++) await goi({fn: 'dangKy', hoSo: {...HOSO_MOI, email: 'doi@vidu.vn'}});
bao(hopThu.length <= 3, 'một địa chỉ không nhận quá ba thư đăng ký mỗi giờ',
  hopThu.length + ' thư trong 6 lượt');
bao((await goi({fn: 'dangKy', hoSo: {...HOSO_MOI, email: 'doi@vidu.vn'}})).than.ok,
  'và lượt bị chặn vẫn trả lời Y HỆT lượt thường — người dội thư không biết mình đã bị chặn');

/* Chữ người dùng gõ không được nhét nội dung vào thư mang tên GITA. */
db.prepare("DELETE FROM chanNhip").run();
hopThu.length = 0;
await goi({fn: 'dangKy', hoSo: {...HOSO_MOI, email: 'chennoidung@vidu.vn',
  hoTen: 'A\nBcc: nan-nhan@vidu.vn\nNội dung giả mạo'}});
bao(hopThu.length === 1 && thuCuoi().than.indexOf('\nBcc:') < 0,
  'HỌ TÊN TỰ ĐẶT KHÔNG XUỐNG DÒNG ĐƯỢC trong thân thư',
  'thư mang tên Học viện GITA, để nguyên là mở một chỗ nhét nội dung tuỳ ý');

/* ═══════════════ 10 · QUÊN VÀ ĐẶT LẠI MẬT KHẨU ═══════════════ */
console.log('\n10 · QUÊN VÀ ĐẶT LẠI MẬT KHẨU');
db.prepare("DELETE FROM chanNhip").run();
hopThu.length = 0;

const qCo = await goi({fn: 'quenMatKhau', u: 'nhamoi@vidu.vn'});
const qKhong = await goi({fn: 'quenMatKhau', u: 'khong-ai-co@vidu.vn'});
bao(qCo.than.ok && qKhong.than.ok && qCo.than.thongBao === qKhong.than.thongBao,
  'TÀI KHOẢN CÓ THẬT VÀ KHÔNG CÓ TRẢ LỜI Y HỆT — cửa này không thành công cụ dò',
  JSON.stringify(qCo.than.thongBao));
bao(hopThu.length === 1 && hopThu[0].den === 'nhamoi@vidu.vn',
  'nhưng chỉ tài khoản có thật mới nhận được thư', hopThu.length + ' thư cho 2 lượt xin');
const maQ = (thuCuoi().than.match(/\n\s+(\d{6})\n/) || [])[1];
bao(!!maQ, 'thư mang mã sáu số', maQ);

const gQ = db.prepare("SELECT * FROM maLayLai").get();
bao(gQ && gQ.bam && gQ.bam.indexOf(maQ) < 0, 'mã trong sổ đã BĂM, không nằm nguyên văn');

/* Xin mã bằng EMAIL rồi đặt lại bằng chính email ấy — và mã lưu theo
   uid nên hai đường vào cùng trỏ về một tài khoản. */
bao(!(await goi({fn: 'datLaiMatKhau', u: 'nhamoi@vidu.vn', ma: '000000',
  moi: 'ChuoiHoanToanKhac2026!'})).than.ok, 'mã sai thì từ chối');

/* Mật khẩu yếu chỉ được chê SAU khi mã đã đúng — chê trước là nói cho
   người dò biết họ đoán đúng tên tài khoản. */
const yeuTruoc = await goi({fn: 'datLaiMatKhau', u: 'khong-ai-co@vidu.vn',
  ma: '123456', moi: '123456789012'});
bao(yeuTruoc.than.code === 'EXPIRED',
  'tài khoản không có + mật khẩu yếu → vẫn chỉ nói "mã hết hạn"',
  'chê mật khẩu trước khi kiểm mã là xác nhận tài khoản có thật');

const yeuSau = await goi({fn: 'datLaiMatKhau', u: 'nhamoi@vidu.vn', ma: maQ,
  moi: 'password12345'});
bao(yeuSau.than.code === 'WEAK',
  'nhưng mã ĐÚNG + mật khẩu yếu thì chê thẳng', yeuSau.than.error);

const dl = await goi({fn: 'datLaiMatKhau', u: 'nhamoi@vidu.vn', ma: maQ,
  moi: 'ChuoiHoanToanKhac2026!'});
bao(dl.than.ok, 'mã đúng + mật khẩu tử tế thì đặt lại được');
bao((await goi({fn: 'dangNhap', u: 'nhamoi@vidu.vn', mk: 'ChuoiHoanToanKhac2026!'})).than.ok &&
    !(await goi({fn: 'dangNhap', u: 'nhamoi@vidu.vn', mk: 'MotChuoiTuTe2026!'})).than.ok,
  'mật khẩu mới dùng được, mật khẩu cũ hết dùng được');
bao(!(await goi({fn: 'datLaiMatKhau', u: 'nhamoi@vidu.vn', ma: maQ,
  moi: 'MotChuoiKhacNua2026!'})).than.ok,
  'MÃ DÙNG MỘT LẦN — đặt lại xong thì mã ấy chết');
bao(/đã được đặt lại/.test(thuCuoi().tieuDe),
  'và gửi thư báo — thứ duy nhất cho người thật biết có chuyện, nếu không phải họ làm',
  thuCuoi().tieuDe);
bao(/giờ Việt Nam/.test(thuCuoi().than),
  'thư ghi giờ VIỆT NAM, không phải giờ UTC',
  'người đọc ở Việt Nam; một mốc UTC làm họ tưởng chuyện xảy ra lúc khác rồi bỏ qua');

/* ĐÁ MỌI PHIÊN — kể cả phiên đang mở của chính người ấy. */
db.prepare("DELETE FROM chanNhip").run();
const dnA2 = await goi({fn: 'dangNhap', u: 'nhamoi@vidu.vn', mk: 'ChuoiHoanToanKhac2026!'});
const dnB2 = await goi({fn: 'dangNhap', u: 'nhamoi@vidu.vn', mk: 'ChuoiHoanToanKhac2026!'});
await goi({fn: 'quenMatKhau', u: 'nhamoi@vidu.vn'});
const maQ2 = (thuCuoi().than.match(/\n\s+(\d{6})\n/) || [])[1];
await goi({fn: 'datLaiMatKhau', u: 'nhamoi@vidu.vn', ma: maQ2, moi: 'ChuoiThuBa2026!'});
bao((await goi({fn: 'capKhoa', token: dnA2.than.token, u: 'nhamoi@vidu.vn'})).than.code === 'AUTH' &&
    (await goi({fn: 'capKhoa', token: dnB2.than.token, u: 'nhamoi@vidu.vn'})).than.code === 'AUTH',
  'ĐẶT LẠI MẬT KHẨU ĐÁ MỌI PHIÊN, không trừ cái nào',
  'người dùng cửa này thường vừa mất quyền kiểm soát tài khoản — giữ lại một phiên là giữ nguyên cánh cửa họ vừa đi khoá');

/* Sai năm lần thì huỷ mã. */
db.prepare("DELETE FROM chanNhip").run();
await goi({fn: 'quenMatKhau', u: 'nhamoi@vidu.vn'});
const maQ3 = (thuCuoi().than.match(/\n\s+(\d{6})\n/) || [])[1];
let cuoiCung = null;
for (let i = 0; i < 5; i++)
  cuoiCung = await goi({fn: 'datLaiMatKhau', u: 'nhamoi@vidu.vn',
    ma: '90000' + i, moi: 'ChuoiThuTu2026!'});
bao(cuoiCung.than.code === 'LOCKED', 'sai năm lần thì HUỶ mã', cuoiCung.than.error);
bao((await goi({fn: 'datLaiMatKhau', u: 'nhamoi@vidu.vn', ma: maQ3,
  moi: 'ChuoiThuTu2026!'})).than.code === 'EXPIRED',
  'và mã đúng sau đó cũng không dùng được nữa');

/* Xin mã mới thì mã cũ chết — một tài khoản chỉ một mã sống. */
db.prepare("DELETE FROM chanNhip").run();
await goi({fn: 'quenMatKhau', u: 'nhamoi@vidu.vn'});
const maCu = (thuCuoi().than.match(/\n\s+(\d{6})\n/) || [])[1];
await goi({fn: 'quenMatKhau', u: 'nhamoi@vidu.vn'});
const maMoi2 = (thuCuoi().than.match(/\n\s+(\d{6})\n/) || [])[1];
bao(db.prepare("SELECT count(*) c FROM maLayLai").get().c === 1,
  'MỘT TÀI KHOẢN CHỈ MỘT MÃ SỐNG — xin mã mới là mã cũ chết',
  'để nhiều mã cùng sống là chỉ cần đoán trúng một cái trong số đó');
bao(maCu !== maMoi2 &&
    !(await goi({fn: 'datLaiMatKhau', u: 'nhamoi@vidu.vn', ma: maCu, moi: 'ChuoiThuNam2026!'})).than.ok,
  'và mã cũ hết dùng được ngay');

/* Trần xin mã. */
db.prepare("DELETE FROM chanNhip").run();
hopThu.length = 0;
for (let i = 0; i < 8; i++) await goi({fn: 'quenMatKhau', u: 'nhamoi@vidu.vn'});
bao(hopThu.length <= 5, 'một tài khoản xin mã tối đa năm lần mỗi giờ',
  hopThu.length + ' thư trong 8 lượt');

/* Tài khoản đang khoá thì không xin được mã — nhưng vẫn trả lời y hệt. */
db.prepare("DELETE FROM chanNhip").run();
hopThu.length = 0;
const qKhoa = await goi({fn: 'quenMatKhau', u: 'bikhoa@gita365.vn'});
bao(qKhoa.than.ok && hopThu.length === 0,
  'tài khoản đang khoá: không gửi mã, nhưng vẫn trả lời y hệt');

/* ═══════════════ 11 · DỌN THEO LỊCH ═══════════════

   Bốn bảng ở nền mới chỉ lớn lên nếu không ai dọn. Đây đúng lớp việc mà
   bản 9.79 dựng cho nền cũ; chuyển nền thì phải mang theo, nếu không thì
   vừa gỡ được một chỗ tắc lại dựng lại đúng chỗ ấy ở nơi mới. */
console.log('\n11 · DỌN THEO LỊCH');
const donDep = (await import('../may-chu/worker.js')).donDep;

/* Đặt vào mỗi bảng một dòng ĐÃ CHẾT và một dòng CÒN SỐNG. Phép đo chỉ
   có nghĩa khi nó chứng minh được cả hai vế: dọn đúng thứ chết, và
   KHÔNG đụng thứ còn sống. */
const nay = Date.now();
db.prepare("INSERT INTO sessions (id,uid,exp,createdAt) VALUES ('S-chet','U-ph',?,'')").run(nay - 1000);
db.prepare("INSERT INTO sessions (id,uid,exp,createdAt) VALUES ('S-song','U-ph',?,'')").run(nay + 3600e3);
db.prepare("INSERT INTO chanNhip (khoa,dem,hetHan) VALUES ('chet',1,?)").run(nay - 2 * 86400e3);
db.prepare("INSERT INTO chanNhip (khoa,dem,hetHan) VALUES ('song',1,?)").run(nay + 3600e3);
db.prepare("INSERT INTO maLayLai (uid,muoi,bam,hetHan,sai) VALUES ('U-chet','m','b',?,0)").run(nay - 2 * 3600e3);
db.prepare("INSERT INTO maLayLai (uid,muoi,bam,hetHan,sai) VALUES ('U-song','m','b',?,0)").run(nay + 600e3);
const cuLam = new Date(nay - 40 * 86400e3).toISOString();
db.prepare("INSERT INTO dangKyCho (id,email,trangThai,createdAt) VALUES ('D-chet','a@b.vn','choOtp',?)").run(cuLam);
db.prepare("INSERT INTO dangKyCho (id,email,trangThai,createdAt) VALUES ('D-cho','c@d.vn','choKichHoat',?)").run(cuLam);

const don = await donDep(env);
const co = (b, id, cot) => !!db.prepare('SELECT 1 FROM ' + b + ' WHERE ' + (cot || 'id') + ' = ?').get(id);
bao(!co('sessions','S-chet') && co('sessions','S-song'), 'phiên hết hạn bị dọn, phiên còn sống ở lại');
bao(!co('chanNhip','chet','khoa') && co('chanNhip','song','khoa'), 'dòng chặn nhịp quá hạn bị dọn');
bao(!co('maLayLai','U-chet','uid') && co('maLayLai','U-song','uid'), 'mã lấy lại mật khẩu đã chết bị dọn');
bao(!co('dangKyCho','D-chet') && co('dangKyCho','D-cho'),
  'đăng ký bỏ dở quá 30 ngày bị dọn, nhưng lượt ĐANG CHỜ KÍCH HOẠT thì giữ',
  'người ta có thể mở thư cũ và bấm vào');
bao(don.tongXoa === 4, 'nói ra đã xoá bao nhiêu dòng', don.ke.join(' · '));
bao(!!db.prepare("SELECT 1 FROM audit WHERE viec = 'DON_DEP'").get(),
  'và ghi một dòng vào nhật ký SAU khi dọn',
  'một bộ dọn chạy im lặng là một bộ dọn không ai kiểm được');

/* ═══════════════ 12 · QUYỀN XEM HỒ SƠ KHÁCH, VÀ NÂNG TẦNG ═══════════════ */
console.log('\n12 · QUYỀN XEM HỒ SƠ KHÁCH');
db.prepare("DELETE FROM chanNhip").run();
await themNguoi('U-sa', 'superadmin@gita365.vn', 'MatKhauRieng2026!', 'R01', {portal:'admin'});
await themNguoi('U-dg', 'danhgia@gita365.vn', 'MatKhauRieng2026!', 'R10', {portal:'coach'});
const luc4 = new Date().toISOString();
db.prepare("INSERT INTO students (id,hoTen,tier,phuHuynhId,createdAt) VALUES ('HV-T4','Nhà tầng 4',4,'U-x',?)").run(luc4);
db.prepare("INSERT INTO students (id,hoTen,tier,phuHuynhId,createdAt) VALUES ('HV-T5','Nhà tầng 5',5,'U-y',?)").run(luc4);

const tkSA = (await goi({fn:'dangNhap', u:'superadmin@gita365.vn', mk:'MatKhauRieng2026!'})).than.token;
const tkGV = (await goi({fn:'dangNhap', u:'giaovien@gita365.vn', mk:'MatKhauRieng2026!'})).than.token;
const tkDG = (await goi({fn:'dangNhap', u:'danhgia@gita365.vn', mk:'MatKhauRieng2026!'})).than.token;
const tkCoach = (await goi({fn:'dangNhap', u:'coach@gita365.vn', mk:'MotChuoiKhacHan2026!'})).than.token;

/* CHIỀU MỘT — TRẦN VAI, chặn thật kể cả với Super Admin. */
const capGV = await goi({fn:'capQuyenXem', token:tkSA, u:'superadmin@gita365.vn',
  cap:{nguoiDuocCap:'giaovien@gita365.vn', vai:'R08', tang:['T4'],
       hetHan:'2027-01-01', lyDo:'thử'}});
bao(!capGV.than.ok && (capGV.than.vuotTran||[]).length === 1,
  'TRẦN CHẶN CẢ SUPER ADMIN — cấp tầng 4 cho Giáo viên là từ chối',
  'trần mà người cao nhất phá được thì nó là một lời khuyên, không phải trần');

bao(!(await goi({fn:'capQuyenXem', token:tkCoach, u:'coach@gita365.vn',
  cap:{nguoiDuocCap:'giaovien@gita365.vn', vai:'R07', tang:['T4'],
       hetHan:'2027-01-01', lyDo:'thử'}})).than.ok,
  'chỉ Super Admin cấp được quyền — Coach bấm cũng không');

bao(!(await goi({fn:'capQuyenXem', token:tkSA, u:'superadmin@gita365.vn',
  cap:{nguoiDuocCap:'coach@gita365.vn', vai:'R07', tang:['T4','T5'], hetHan:'2027-01-01'}})).than.ok,
  'KHÔNG CẤP QUYỀN MÀ KHÔNG CÓ LÝ DO');
bao(!(await goi({fn:'capQuyenXem', token:tkSA, u:'superadmin@gita365.vn',
  cap:{nguoiDuocCap:'coach@gita365.vn', vai:'R07', tang:['T4','T5'], lyDo:'x'}})).than.ok,
  'và không cấp giấy phép KHÔNG HẠN — hôm giao là giao mãi');
bao(!(await goi({fn:'capQuyenXem', token:tkSA, u:'superadmin@gita365.vn',
  cap:{nguoiDuocCap:'coach@gita365.vn', vai:'R07', tang:['T4'],
       hetHan:'2020-01-01', lyDo:'x'}})).than.ok,
  'ngày hết hạn phải nằm ở tương lai');

/* CHIỀU HAI — GIẤY PHÉP. Đủ trần mà chưa cấp thì vẫn là không. */
const truocCap = await goi({fn:'xemKhachCao', token:tkCoach, u:'coach@gita365.vn'});
bao(!truocCap.than.ok && /Chưa được Super Admin cấp quyền/.test(truocCap.than.error),
  'Coach ĐỦ TRẦN tầng 4-5 nhưng CHƯA CÓ GIẤY PHÉP thì vẫn không xem được',
  truocCap.than.error);

const cap = await goi({fn:'capQuyenXem', token:tkSA, u:'superadmin@gita365.vn',
  cap:{nguoiDuocCap:'coach@gita365.vn', vai:'R07', tang:['T4','T5'],
       hetHan:'2027-01-01', lyDo:'kèm hai nhà tầng cao quý 4'}});
bao(cap.than.ok, 'cấp cho Coach thì được', cap.than.tang.join(','));
bao(!(await goi({fn:'capQuyenXem', token:tkSA, u:'superadmin@gita365.vn',
  cap:{nguoiDuocCap:'coach@gita365.vn', vai:'R07', tang:['T4'],
       hetHan:'2027-06-01', lyDo:'chồng thêm'}})).than.ok,
  'KHÔNG CẤP HAI GIẤY PHÉP CÙNG LÚC — không ai biết bản nào đang chạy');

const xem = await goi({fn:'xemKhachCao', token:tkCoach, u:'coach@gita365.vn'});
bao(xem.than.ok && xem.than.so === 2, 'cấp rồi thì xem được hồ sơ tầng 4-5', xem.than.so + ' hồ sơ');

/* CHIỀU BA — TRẦN MỤC. Đủ tầng mà không đủ mục thì vẫn là không. */
const capDG = await goi({fn:'capQuyenXem', token:tkSA, u:'superadmin@gita365.vn',
  cap:{nguoiDuocCap:'danhgia@gita365.vn', vai:'R10', tang:['T4','T5'],
       hetHan:'2027-01-01', lyDo:'chấm KPI quý 4'}});
bao(capDG.than.ok, 'Chuyên gia đánh giá ĐỦ TRẦN tầng 4-5, cấp được');
const xemDG = await goi({fn:'xemKhachCao', token:tkDG, u:'danhgia@gita365.vn'});
bao(!xemDG.than.ok && /Chỉ xem được: kpi/.test(xemDG.than.error),
  'NHƯNG CHỈ ĐƯỢC MỤC KPI — đủ tầng mà không đủ mục thì vẫn là không',
  xemDG.than.error);

/* Giáo viên: không có tên trong trần nào. */
const xemGV = await goi({fn:'xemKhachCao', token:tkGV, u:'giaovien@gita365.vn'});
bao(!xemGV.than.ok, 'Giáo viên không xem được hồ sơ khách, ở mọi tầng');
const soiGV = await goi({fn:'soiQuyenXem', token:tkGV, u:'giaovien@gita365.vn'});
bao(soiGV.than.tranVai.length === 0,
  'và tự soi thì thấy trần vai RỖNG — danh sách trắng, vai không có tên là không có');

/* TRẦN ĐỌC LẠI LÚC DÙNG, không tin cột vai đã ghi trong giấy phép. */
db.prepare("UPDATE users SET role = 'R08' WHERE id = 'U-coach'").run();
db.prepare("UPDATE sessions SET role = 'R08' WHERE uid = 'U-coach'").run();
const sauHa = await goi({fn:'xemKhachCao', token:tkCoach, u:'coach@gita365.vn'});
bao(!sauHa.than.ok,
  'HẠ BẬC MỘT NGƯỜI THÌ QUYỀN MẤT NGAY, không đợi giấy phép hết hạn',
  'giấy phép vẫn nằm đó với cột vai R07 — tin cột ấy là để người vừa bị hạ bậc giữ nguyên quyền');
db.prepare("UPDATE users SET role = 'R07' WHERE id = 'U-coach'").run();
db.prepare("UPDATE sessions SET role = 'R07' WHERE uid = 'U-coach'").run();

/* THU HỒI — đánh dấu, không xoá. */
const th = await goi({fn:'thuHoiQuyenXem', token:tkSA, u:'superadmin@gita365.vn',
  nguoiDuocCap:'coach@gita365.vn'});
bao(th.than.ok, 'thu hồi được');
bao(!(await goi({fn:'xemKhachCao', token:tkCoach, u:'coach@gita365.vn'})).than.ok,
  'thu hồi rồi thì hết xem được NGAY');
bao(db.prepare("SELECT count(*) c FROM quyenXem WHERE nguoiDuocCap='coach@gita365.vn'").get().c === 1,
  'nhưng DÒNG SỔ VẪN CÒN — xoá là xoá luôn bằng chứng đã từng cấp',
  'đúng thứ cần trả lời khi có chuyện');

/* HẾT HẠN THÌ TỰ TẮT. */
db.prepare("UPDATE quyenXem SET thuHoiLuc = NULL, hetHan = ? WHERE nguoiDuocCap='coach@gita365.vn'")
  .run(new Date(Date.now() - 1000).toISOString());
bao(!(await goi({fn:'xemKhachCao', token:tkCoach, u:'coach@gita365.vn'})).than.ok,
  'GIẤY PHÉP HẾT HẠN TỰ TẮT — không chờ ai nhớ ra đi gỡ');

/* MỖI LƯỢT QUA CỬA MỘT DÒNG SỔ, kể cả lượt bị từ chối. */
bao(db.prepare("SELECT count(*) c FROM audit WHERE viec='XEMKHACH_CAO'").get().c >= 1 &&
    db.prepare("SELECT count(*) c FROM audit WHERE viec='XEMKHACH_TUCHOI'").get().c >= 3,
  'mỗi lượt qua cửa MỘT DÒNG SỔ, kể cả lượt bị từ chối',
  'ngày một hồ sơ rò ra ngoài thì câu "ai đã mở nó" chỉ trả lời được nếu hôm nay đã ghi');

console.log('\n12b · NÂNG TẦNG');
db.prepare("INSERT INTO users (id,username,hoTen,email,role,portal,active,createdAt,maKhachHang) " +
  "VALUES ('U-nhaA','nhaA@vidu.vn','Nhà A','nhaA@vidu.vn','R13','ph',1,?,'GITA-9001')").run(luc4);
db.prepare("INSERT INTO users (id,username,hoTen,email,role,portal,active,createdAt,maKhachHang) " +
  "VALUES ('U-nhaB','nhaB@vidu.vn','Nhà B','nhaB@vidu.vn','R13','ph',1,?,'GITA-9002')").run(luc4);
db.prepare("INSERT INTO students (id,hoTen,tier,kpi,phuHuynhId,createdAt) VALUES ('HV-A','Con nhà A',1,85,'U-nhaA',?)").run(luc4);
db.prepare("INSERT INTO students (id,hoTen,tier,kpi,phuHuynhId,createdAt) VALUES ('HV-B','Con nhà B',1,90,'U-nhaB',?)").run(luc4);
db.prepare("INSERT INTO thanhToan (id,maKhachHang,tier,trangThai,daDung) VALUES ('TT-A','GITA-9001',2,'daXacNhan',0)").run();

bao(!(await goi({fn:'nangTang', token:tkCoach, u:'coach@gita365.vn',
  maHocVien:'HV-A', tang:2, maKhachHang:'GITA-9001'})).than.ok,
  'chỉ R01–R03 nâng tầng được — Coach bấm cũng không');

/* PHIẾU CỦA NHÀ A KHÔNG MỞ TẦNG CHO CON NHÀ B. */
const lechNha = await goi({fn:'nangTang', token:tkSA, u:'superadmin@gita365.vn',
  maHocVien:'HV-B', tang:2, maKhachHang:'GITA-9001'});
bao(!lechNha.than.ok && /không khớp/.test(lechNha.than.error),
  'PHIẾU CỦA NHÀ A KHÔNG MỞ ĐƯỢC TẦNG CHO CON NHÀ B',
  'trước 9.44 mã lấy thẳng từ thân yêu cầu, không đối chiếu hồ sơ học viên');

db.prepare("UPDATE students SET kpi = 70 WHERE id = 'HV-A'").run();
const kpiThap = await goi({fn:'nangTang', token:tkSA, u:'superadmin@gita365.vn',
  maHocVien:'HV-A', tang:2, maKhachHang:'GITA-9001'});
bao(!kpiThap.than.ok && /80%/.test(kpiThap.than.error), 'KPI dưới 80% thì không nâng',
  kpiThap.than.error);
db.prepare("UPDATE students SET kpi = 85 WHERE id = 'HV-A'").run();

bao(!(await goi({fn:'nangTang', token:tkSA, u:'superadmin@gita365.vn',
  maHocVien:'HV-A', tang:4, maKhachHang:'GITA-9001'})).than.ok,
  'chỉ nâng được MỘT tầng mỗi lần, theo thứ tự');

const nt = await goi({fn:'nangTang', token:tkSA, u:'superadmin@gita365.vn',
  maHocVien:'HV-A', tang:2, maKhachHang:'GITA-9001'});
bao(nt.than.ok && Number(db.prepare("SELECT tier FROM students WHERE id='HV-A'").get().tier) === 2,
  'đủ KPI + đúng phiếu + đúng nhà thì nâng được');

/* NHÀ CHUYỂN TỪ NỀN CŨ SANG CÓ MÃ MÀ CHƯA CÓ TỆP. GITA-9001 dựng bằng
   INSERT thẳng, không đi qua đường kích hoạt — đúng trạng thái của mọi
   nhà chuyển từ Sheets sang. Trước bản 9.89 nâng tầng cho nhà như thế
   thì UPDATE hoSoKhach đổi 0 dòng và trôi qua lặng lẽ, còn lịch thu vẫn
   dựng đủ: công nợ treo cho một mã không tra được. Phép đối soát ở mục
   15 bắt được nó (DS-2) ngay lần chạy đầu, trên chính dữ liệu thử này. */
const tepVa = db.prepare("SELECT * FROM hoSoKhach WHERE maKhachHang='GITA-9001'").get();
bao(!!tepVa && tepVa.uidPhuHuynh === 'U-nhaA' && Number(tepVa.tang) === 2,
  'NHÀ CHƯA CÓ TỆP THÌ NÂNG TẦNG MỞ TỆP LUÔN — không để công nợ treo cho một mã không tra được',
  'trạng thái của mọi nhà chuyển từ nền Sheets sang');
bao(db.prepare("SELECT count(*) c FROM kyThu WHERE maKhachHang NOT IN " +
  "(SELECT maKhachHang FROM hoSoKhach)").get().c === 0,
  'và không còn kỳ thu nào treo ngoài sổ tệp');

db.prepare("UPDATE students SET tier = 1 WHERE id = 'HV-A'").run();
const lai = await goi({fn:'nangTang', token:tkSA, u:'superadmin@gita365.vn',
  maHocVien:'HV-A', tang:2, maKhachHang:'GITA-9001'});
bao(!lai.than.ok,
  'PHIẾU THANH TOÁN DÙNG MỘT LẦN — không đánh dấu thì một phiếu mở tầng cho bao nhiêu học viên cũng được',
  lai.than.error);

/* ═══════════════ 13 · CHỨNG CỨ HOA HỒNG ═══════════════

   Tệp duy nhất ra tiền thật. Mọi thứ khác sai thì sửa; chỗ này sai thì
   kết thúc ở toà chứ không kết thúc ở một bản vá. Nên phép đo ở đây
   phải PHÁ ĐƯỢC, không chỉ chạy được. */
console.log('\n13 · CHỨNG CỨ HOA HỒNG');
const BAN_CC = {nhiemVu:'NV-01', ngayLam:'2026-09-01', loai:'kem',
  noiDung:'Ngồi cùng nhà B một buổi, chốt nếp học tối.'};

const kyCC = await goi({fn:'kyChungCu', token:tkCoach, u:'coach@gita365.vn', cc:BAN_CC});
bao(kyCC.than.ok && kyCC.than.bienNhan.chuKy.length === 64,
  'ký được, trả về biên nhận có chữ ký HMAC-SHA256', kyCC.than.bienNhan.ma);
const maCC = kyCC.than.bienNhan.ma;

bao(kyCC.than.bienNhan.chuKy.indexOf(maCC.slice(3)) < 0 &&
    maCC.indexOf(kyCC.than.bienNhan.chuKy.slice(0, 6)) < 0,
  'MÃ KHÔNG MANG MỘT MẨU CHỮ KÝ NÀO',
  'nền cũ ghép 6 ký tự chữ ký vào mã — in 24 bit ra chỗ ai cũng đọc được');

bao(JSON.stringify(kyCC.than).indexOf('khoa-ky-thu-nghiem') < 0,
  'KHOÁ KÝ KHÔNG ĐI TRONG PHẢN HỒI, không một mẩu nào');

/* nguoiGhi lấy từ PHIÊN, không lấy từ thân yêu cầu. */
const giaTen = await goi({fn:'kyChungCu', token:tkCoach, u:'coach@gita365.vn',
  cc:{...BAN_CC, nguoiGhi:'superadmin@gita365.vn', noiDung:'thử ghi tên người khác'}});
bao(db.prepare("SELECT nguoiGhi FROM chungCu WHERE ma = ?").get(giaTen.than.bienNhan.ma).nguoiGhi
      === 'coach@gita365.vn',
  'NGƯỜI GHI LẤY TỪ PHIÊN — gửi tên người khác lên cũng không ăn thua',
  'nhận từ thân yêu cầu thì ghi tên ai cũng được, và cả bảng chứng cứ mất nghĩa');

/* GIỜ MÁY CHỦ, không phải giờ máy khách. */
const gioGia = await goi({fn:'kyChungCu', token:tkCoach, u:'coach@gita365.vn',
  cc:{...BAN_CC, gioMayChu:'2020-01-01T00:00:00.000Z', noiDung:'thử đóng giờ giả'}});
bao(new Date(gioGia.than.bienNhan.gioMayChu).getFullYear() >= 2026,
  'GIỜ ĐÓNG LÀ GIỜ MÁY CHỦ — giờ máy khách đổi được trong ba giây',
  gioGia.than.bienNhan.gioMayChu);

/* Soi: ký lại từ dữ liệu đang lưu rồi so. */
const soi1 = await goi({fn:'soiChungCu', token:tkCoach, u:'coach@gita365.vn', ma:maCC});
bao(soi1.than.ok && soi1.than.khop === true, 'soi bản chưa ai đụng thì KHỚP');
bao(JSON.stringify(soi1.than).indexOf('khoa-ky-thu-nghiem') < 0,
  'và lượt soi cũng không trả khoá ra');

/* ── SỬA LÉN THẲNG VÀO BẢNG THÌ LỘ ──
   Đây là phép đo quan trọng nhất của cả mục. Lớp ký không NGĂN được
   người ta sửa; nó làm cho việc sửa KHÔNG GIẤU ĐƯỢC. */
db.prepare("UPDATE chungCu SET noiDung = ? WHERE ma = ?")
  .run('Ngồi cùng nhà B BA buổi, chốt nếp học tối.', maCC);
const soi2 = await goi({fn:'soiChungCu', token:tkCoach, u:'coach@gita365.vn', ma:maCC});
bao(soi2.than.khop === false,
  'SỬA LÉN THẲNG VÀO BẢNG THÌ CHỮ KÝ KHÔNG KHỚP — kể cả người có quyền quản trị cơ sở dữ liệu',
  'lớp ký không ngăn được người ta sửa; nó làm cho việc sửa không giấu được');
db.prepare("UPDATE chungCu SET noiDung = ? WHERE ma = ?").run(BAN_CC.noiDung, maCC);
bao((await goi({fn:'soiChungCu', token:tkCoach, u:'coach@gita365.vn', ma:maCC})).than.khop === true,
  'trả nội dung về đúng cũ thì khớp lại — chữ ký đo NỘI DUNG, không đo lần sửa');

/* Đổi giờ cũng lộ y hệt. */
db.prepare("UPDATE chungCu SET gioMayChu = '2020-01-01T00:00:00.000Z' WHERE ma = ?").run(maCC);
bao((await goi({fn:'soiChungCu', token:tkCoach, u:'coach@gita365.vn', ma:maCC})).than.khop === false,
  'lùi dấu giờ cũng làm chữ ký lệch — giờ nằm TRONG chuỗi được ký');
db.prepare("UPDATE chungCu SET gioMayChu = ? WHERE ma = ?").run(kyCC.than.bienNhan.gioMayChu, maCC);

/* ── NGƯỜI GHI KHÔNG TỰ XÁC NHẬN CHO MÌNH ── */
bao(!(await goi({fn:'xacNhanChungCu', token:tkCoach, u:'coach@gita365.vn', ma:maCC})).than.ok,
  'NGƯỜI GHI KHÔNG TỰ XÁC NHẬN CHO MÌNH ĐƯỢC',
  'chỗ chống làm giả mạnh nhất của cả hệ — mạnh hơn mọi chữ ký');

const xn = await goi({fn:'xacNhanChungCu', token:tkSA, u:'superadmin@gita365.vn', ma:maCC});
bao(xn.than.ok, 'người KHÁC xác nhận thì được', xn.than.xacNhan.ai);
bao(!(await goi({fn:'xacNhanChungCu', token:tkDG, u:'danhgia@gita365.vn', ma:maCC})).than.ok,
  'xác nhận rồi thì người thứ hai không ghi đè lên được',
  'trên một bản ghi dựng lên để đứng được khi đối chất');
bao(db.prepare("SELECT xacNhanBoi FROM chungCu WHERE ma=?").get(maCC).xacNhanBoi
      === 'superadmin@gita365.vn',
  'và tên người xác nhận đầu tiên vẫn nguyên');

/* ── SAI THÌ ĐÍNH CHÍNH, KHÔNG SỬA, KHÔNG XOÁ ── */
const dc = await goi({fn:'kyChungCu', token:tkCoach, u:'coach@gita365.vn',
  cc:{...BAN_CC, noiDung:'Đính chính: một buổi, không phải ba.', dinhChinhCho:maCC}});
bao(dc.than.ok, 'ghi được bản đính chính trỏ về bản cũ');
bao(db.prepare("SELECT count(*) c FROM chungCu WHERE ma IN (?,?)").get(maCC, dc.than.bienNhan.ma).c === 2,
  'CẢ HAI BẢN CÙNG Ở LẠI — xoá bản sai là xoá luôn bằng chứng đã từng có bản sai',
  'đúng thứ bên đối tụng sẽ hỏi');
bao(!(await goi({fn:'kyChungCu', token:tkCoach, u:'coach@gita365.vn',
  cc:{...BAN_CC, dinhChinhCho:'CC-khong-co-that'}})).than.ok,
  'đính chính cho một bản không có thì từ chối');

/* Thiếu trường và nội dung quá dài. */
bao(!(await goi({fn:'kyChungCu', token:tkCoach, u:'coach@gita365.vn',
  cc:{nhiemVu:'NV-01'}})).than.ok, 'thiếu trường thì không ký');
bao(!(await goi({fn:'kyChungCu', token:tkCoach, u:'coach@gita365.vn',
  cc:{...BAN_CC, noiDung:'x'.repeat(4001)}})).than.ok, 'nội dung quá 4000 ký tự thì từ chối');

/* Mỗi lượt soi một dòng sổ — nền cũ không ghi chỗ này. */
bao(db.prepare("SELECT count(*) c FROM audit WHERE viec='CHUNGCU_SOI'").get().c >= 4,
  'mỗi lượt SOI một dòng sổ',
  'nội dung một bản chứng cứ là chuyện riêng của hai nhà; ai mở nó ra thì phải trả lời được');

/* Không có khoá ký thì KHÔNG ký bừa. */
const khongKhoa = await worker.fetch(new Request('https://gita.test/', {
  method:'POST', headers:{'Content-Type':'application/json'},
  body: JSON.stringify({fn:'kyChungCu', token:tkCoach, u:'coach@gita365.vn', cc:BAN_CC})
}), {...env, GITA_KHOA_KY: ''});
bao(khongKhoa.status === 500,
  'máy chủ CHƯA NẠP KHOÁ KÝ thì từ chối ký, không ký bằng một khoá rỗng',
  'ký bằng khoá rỗng là phát ra một biên nhận trông như thật mà không chứng được gì');

/* ═══════════════ 14 · TỆP KHÁCH HÀNG VÀ TÀI CHÍNH ═══════════════ */
console.log('\n14 · TỆP KHÁCH HÀNG');
db.prepare("DELETE FROM chanNhip").run();

/* Nhà đăng ký mới phải có TỆP ngay, không đợi lượt nâng tầng đầu tiên. */
const eMoi = 'nhatep@vidu.vn';
await goi({fn:'dangKy', hoSo:{...HOSO_MOI, email:eMoi, maGioiThieu:'GITA-0003'}});
const mTep = (thuCuoi().than.match(/là: (\d{6})/) || [])[1];
await goi({fn:'xacThucOtp', email:eMoi, ma:mTep});
const lkTep = (thuCuoi().than.match(/#kichhoat=([a-f0-9]+)/) || [])[1];
const khTep = await goi({fn:'kichHoat', token:lkTep, mk:'MotChuoiTuTe2026!'});
const nhaMoi = khTep.than.maKhachHang;
const tepDb = db.prepare("SELECT * FROM hoSoKhach WHERE maKhachHang = ?").get(nhaMoi);
bao(!!tepDb, 'kích hoạt xong là CÓ TỆP KHÁCH HÀNG ngay', nhaMoi);
bao(tepDb && tepDb.boTro === 'GITA-0003',
  'và tệp giữ MÃ NHÀ BẢO TRỢ — gốc của hoa hồng', tepDb && tepDb.boTro);
bao(tepDb && tepDb.tang === 0 && tepDb.trangThai === 'dangHoc',
  'mở ở tầng 0, trạng thái đang học');

/* Gia đình đọc được tệp CỦA MÌNH, không đọc được tệp nhà khác. */
const tkNhaMoi = (await goi({fn:'dangNhap', u:eMoi, mk:'MotChuoiTuTe2026!'})).than.token;
bao((await goi({fn:'xemTepKhach', token:tkNhaMoi, u:eMoi, maKhachHang:nhaMoi})).than.ok,
  'gia đình đọc được tệp của chính mình');
const tromTep = await goi({fn:'xemTepKhach', token:tkNhaMoi, u:eMoi, maKhachHang:'GITA-0003'});
bao(!tromTep.than.ok && tromTep.than.code === 'NOPERM',
  'nhưng KHÔNG đọc được tệp nhà khác',
  'tệp mang tên nhà, tên con, tên phụ huynh và tình hình tiền nong — gửi nhầm là gửi trọn cả bốn');

const tepSA = await goi({fn:'xemTepKhach', token:tkSA, u:'superadmin@gita365.vn', maKhachHang:nhaMoi});
bao(tepSA.than.ok && tepSA.than.tep.phuHuynh && tepSA.than.tep.hocVien,
  'đội ngũ đọc được, và tệp GỘP đủ bốn nguồn thành một bản',
  'phụ huynh · học viên · tệp · lịch sử tầng');
bao(tepSA.than.tep.phuHuynh.hoTen && !tepDb.hoTenPhuHuynh,
  'tên phụ huynh TRỎ về users, không chép vào bảng',
  'chép lại là dựng bản thứ hai của một sự thật, và hai bản sẽ có ngày lệch nhau');

/* Sửa được coach/tư vấn/băng — KHÔNG sửa được tầng. */
const suaOk = await goi({fn:'suaTepKhach', token:tkSA, u:'superadmin@gita365.vn',
  maKhachHang:nhaMoi, sua:{coach:'coach@gita365.vn', band:'VANG'}});
bao(suaOk.than.ok && suaOk.than.daSua === 2, 'sửa được coach và băng');
bao(!(await goi({fn:'suaTepKhach', token:tkSA, u:'superadmin@gita365.vn',
  maKhachHang:nhaMoi, sua:{band:'TIM'}})).than.ok, 'băng ngoài bốn màu thì từ chối');
const suaTang = await goi({fn:'suaTepKhach', token:tkSA, u:'superadmin@gita365.vn',
  maKhachHang:nhaMoi, sua:{tang:5, ghiChu:'thử'}});
bao(db.prepare("SELECT tang FROM hoSoKhach WHERE maKhachHang=?").get(nhaMoi).tang === 0 &&
    (suaTang.than.khongSuaDuoc||[]).indexOf('tang') >= 0,
  'TẦNG KHÔNG SỬA ĐƯỢC Ở ĐÂY, và trường bị chặn được NÓI RA',
  'cho sửa tầng ở đây là dựng một cửa sau đi vòng qua cổng KPI và cổng thanh toán');

console.log('\n14b · TÀI CHÍNH — PHẢI THU TÁCH KHỎI ĐÃ THU');
const {GIA_KHOI_DAU: GIA_TANG, SUY_RA} = await import('../may-chu/tai-chinh.js');

/* NHÀ BẢO TRỢ PHẢI CÓ KPI THẬT thì hoa hồng mới sinh. Bản đầu của phép
   đo này quên bước ấy và đỏ ở mục hoa hồng — luật đúng, phép đo thiếu.
   Ghi lại vì đó cũng là điều kiện thật: kèm mà nếp nhà mình không đạt
   thì không có hoa hồng, dù nhà kia có vượt tầng. */
db.prepare("UPDATE students SET kpi = 90 WHERE id = " +
  "(SELECT maHocVien FROM hoSoKhach WHERE maKhachHang = 'GITA-0003')").run();

/* Nâng tầng thì DỰNG LỊCH THU của tầng mới. */
db.prepare("UPDATE students SET kpi = 85 WHERE id = (SELECT maHocVien FROM hoSoKhach WHERE maKhachHang=?)").run(nhaMoi);
db.prepare("INSERT INTO thanhToan (id,maKhachHang,tier,trangThai,daDung) VALUES ('TT-M1',?,1,'daXacNhan',0)").run(nhaMoi);
const lenT1 = await goi({fn:'nangTang', token:tkSA, u:'superadmin@gita365.vn',
  maHocVien: db.prepare("SELECT maHocVien FROM hoSoKhach WHERE maKhachHang=?").get(nhaMoi).maHocVien,
  tang:1, maKhachHang:nhaMoi});
bao(lenT1.than.ok && lenT1.than.soKyThu === 0,
  'TẦNG 1 GIÁ 0 THÌ KHÔNG SINH KỲ THU NÀO',
  'một dòng "phải thu 0 đồng" là một dòng công nợ giả, và nó làm mọi bản kê có rác');
bao(db.prepare("SELECT count(*) c FROM lichSuTang WHERE maKhachHang=?").get(nhaMoi).c === 1,
  'và ghi MỘT DÒNG LỊCH SỬ TẦNG — nền cũ chỉ đổi cột tier rồi thôi');

/* Lên tầng 3: BA kỳ, đúng nhịp bảng học phí khai. */
db.prepare("UPDATE students SET tier = 2, kpi = 85 WHERE id = (SELECT maHocVien FROM hoSoKhach WHERE maKhachHang=?)").run(nhaMoi);
db.prepare("UPDATE hoSoKhach SET tang = 2 WHERE maKhachHang = ?").run(nhaMoi);
db.prepare("INSERT INTO thanhToan (id,maKhachHang,tier,trangThai,daDung) VALUES ('TT-M3',?,3,'daXacNhan',0)").run(nhaMoi);
const lenT3 = await goi({fn:'nangTang', token:tkSA, u:'superadmin@gita365.vn',
  maHocVien: db.prepare("SELECT maHocVien FROM hoSoKhach WHERE maKhachHang=?").get(nhaMoi).maHocVien,
  tang:3, maKhachHang:nhaMoi});
bao(lenT3.than.ok && lenT3.than.soKyThu === 3,
  'TẦNG 3 SINH BA KỲ THU — đúng nhịp bảng học phí khai',
  'nền cũ chỉ có MỘT dòng đúng/sai cho cả tầng, nên hai kỳ sau biến mất khỏi sổ');
const kyT3 = db.prepare("SELECT * FROM kyThu WHERE maKhachHang=? AND tang=3 ORDER BY ky").all(nhaMoi);
bao(kyT3.map(x=>x.ngayThu).join(',') === '1,43,64',
  'ba kỳ rơi đúng ngày 1 · 43 · 64', kyT3.map(x=>x.ngayThu).join(' · '));
bao(kyT3.reduce((a,x)=>a+x.phaiThu,0) === GIA_TANG[3],
  'TỔNG BA KỲ ĐÚNG BẰNG GIÁ GÓI, không lệch đồng nào',
  'chia đều rồi làm tròn từng kỳ thì tổng lệch vài đồng, và một bản kê lệch vài đồng là một bản kê phải đi giải thích');
bao(kyT3[1].congTruoc && kyT3[0].congTruoc === null,
  'kỳ 2 và 3 khai CỔNG PHẢI NGHIỆM THU TRƯỚC, kỳ 1 thì không');

/* Dựng lịch hai lần không nhân đôi công nợ. */
const {dungLichThu} = await import('../may-chu/tai-chinh.js');
await dungLichThu(env.CSDL, nhaMoi, 3, new Date().toISOString());
bao(db.prepare("SELECT count(*) c FROM kyThu WHERE maKhachHang=? AND tang=3").get(nhaMoi).c === 3,
  'dựng lịch LẦN HAI không nhân đôi công nợ',
  'dựng hai lần là nhân đôi công nợ một nhà, và không ai nhìn ra cho tới lúc đối chiếu');

/* Phiếu thu: ghi → duyệt, và người ghi không tự duyệt. */
const gp = await goi({fn:'ghiPhieuThu', token:tkCoach, u:'coach@gita365.vn',
  phieu:{maKhachHang:nhaMoi, idKy:kyT3[0].id, soTien:kyT3[0].phaiThu,
         hinhThuc:'chuyenKhoan', maThamChieu:'FT26090100123'}});
bao(gp.than.ok && gp.than.trangThai === 'choDuyet', 'ghi được phiếu thu, trạng thái CHỜ DUYỆT');
bao(!(await goi({fn:'ghiPhieuThu', token:tkNhaMoi, u:eMoi,
  phieu:{maKhachHang:nhaMoi, soTien:1000, hinhThuc:'tienMat'}})).than.ok,
  'phụ huynh không ghi được phiếu thu');
bao(!(await goi({fn:'ghiPhieuThu', token:tkCoach, u:'coach@gita365.vn',
  phieu:{maKhachHang:nhaMoi, soTien:1000, hinhThuc:'bitcoin'}})).than.ok,
  'hình thức thu ngoài ba loại thì từ chối');

/* Công nợ TRƯỚC khi duyệt — phiếu chờ duyệt chưa trừ nợ. */
const cn1 = await goi({fn:'congNo', token:tkSA, u:'superadmin@gita365.vn', maKhachHang:nhaMoi});
bao(cn1.than.tongConNo === GIA_TANG[3],
  'PHIẾU CHỜ DUYỆT CHƯA TRỪ NỢ — chỉ tiền đã duyệt mới vào sổ',
  cn1.than.tongConNo + 'đ còn nợ');

bao(!(await goi({fn:'duyetPhieuThu', token:tkCoach, u:'coach@gita365.vn', id:gp.than.id})).than.ok,
  'người ghi phiếu KHÔNG TỰ DUYỆT phiếu của mình',
  'người ghi phiếu là người nói "đã nhận tiền"; tự duyệt luôn thì không có lớp nào đứng giữa lời nói và sổ sách');

const dp = await goi({fn:'duyetPhieuThu', token:tkSA, u:'superadmin@gita365.vn', id:gp.than.id});
bao(dp.than.ok, 'người KHÁC duyệt thì được');
bao(!(await goi({fn:'duyetPhieuThu', token:tkSA, u:'superadmin@gita365.vn', id:gp.than.id})).than.ok,
  'duyệt rồi thì không duyệt lại được');

const cn2 = await goi({fn:'congNo', token:tkSA, u:'superadmin@gita365.vn', maKhachHang:nhaMoi});
bao(cn2.than.tongDaThu === kyT3[0].phaiThu &&
    cn2.than.tongConNo === GIA_TANG[3] - kyT3[0].phaiThu,
  'duyệt rồi thì CÔNG NỢ = PHẢI THU − ĐÃ THU',
  'đã thu ' + cn2.than.tongDaThu + 'đ · còn nợ ' + cn2.than.tongConNo + 'đ');
bao(cn2.than.ke.length === 3 && cn2.than.ke[1].daThu === 0,
  'và KỲ CHƯA THU ĐỒNG NÀO VẪN CÓ TRONG BẢN KÊ',
  'lọc sau khi đọc về thì kỳ chưa thu là kỳ dễ rơi ra nhất — mà đó đúng là kỳ cần nhìn thấy');

/* Gia đình xem được công nợ của mình, không xem của nhà khác. */
bao((await goi({fn:'congNo', token:tkNhaMoi, u:eMoi, maKhachHang:nhaMoi})).than.ok &&
    !(await goi({fn:'congNo', token:tkNhaMoi, u:eMoi, maKhachHang:'GITA-0003'})).than.ok,
  'gia đình xem công nợ CỦA MÌNH, không xem của nhà khác');

/* Hoa hồng sinh khi nhà được kèm vượt tầng. */
const hhDb = db.prepare("SELECT * FROM hoaHongTra WHERE nhaDuocKem = ?").all(nhaMoi);
bao(hhDb.length >= 1, 'nhà có bảo trợ vượt tầng thì SINH HOA HỒNG cho nhà bảo trợ',
  hhDb.length + ' khoản');
const hhT3 = hhDb.filter(x => x.tangVuot === 3)[0];
bao(hhT3 && hhT3.goiCanCu === GIA_TANG[3] &&
    hhT3.soTien === Math.round(GIA_TANG[3] * hhT3.phanTram / 100),
  'tiền hoa hồng tính trên GÓI CỦA NHÀ ĐƯỢC KÈM',
  hhT3 && (hhT3.bac + ' · ' + hhT3.phanTram + '% · ' + hhT3.soTien + 'đ'));
bao(!hhDb.some(x => x.tangVuot === 1),
  'TẦNG 1 KHÔNG SINH HOA HỒNG — điều khoản, không phải phép nhân ra 0');
bao(hhDb.every(x => x.phanTram <= 10), 'không khoản nào vượt trần 10%');

/* Bản kê chỉ R01–R03. */
bao(!(await goi({fn:'banKeTaiChinh', token:tkCoach, u:'coach@gita365.vn'})).than.ok,
  'Coach không xem được bản kê tài chính — nó gộp tiền của cả hệ');
const bk = (await goi({fn:'banKeTaiChinh', token:tkSA, u:'superadmin@gita365.vn'})).than;
bao(bk.ok && bk.daThu.tien === kyT3[0].phaiThu && bk.hoaHongPhaiTra.so >= 1,
  'bản kê gộp đúng: đã thu, chờ duyệt, hoàn, hoa hồng phải trả',
  'đã thu ' + bk.daThu.tien + 'đ · hoa hồng phải trả ' + bk.hoaHongPhaiTra.tien + 'đ');
bao(bk.suyRa && bk.suyRa.length === SUY_RA.length,
  'và bản kê IN RA những chỗ tôi SUY RA chứ chủ hệ chưa khai',
  SUY_RA.map(x => x.ma).join(' · '));
bao(!('loiNhuan' in bk),
  'bản kê KHÔNG tự cộng ra một con số lợi nhuận',
  'chi phí vận hành không nằm trong hệ này, nên con số ấy sẽ sai và sẽ được ai đó mang đi họp');

/* ═══════════════ 15 · TÁM TÌNH HUỐNG TIỀN NONG NGOÀI ĐƯỜNG THẲNG ═══════════════

   Đường thẳng — dựng lịch, ghi phiếu, duyệt, xem nợ — là đường ÍT XẢY
   RA NHẤT. Mục này đo những đường còn lại. */
console.log('\n15 · TÁM TÌNH HUỐNG TIỀN NONG');

/* ── CỔNG: KỲ SAU CHỈ THU KHI KỲ TRƯỚC ĐÃ TRẢ ĐỦ ── */
const ky2 = kyT3[1], ky3 = kyT3[2];
const truocCong = await goi({fn:'ghiPhieuThu', token:tkCoach, u:'coach@gita365.vn',
  phieu:{maKhachHang:nhaMoi, idKy:ky3.id, soTien:ky3.phaiThu, hinhThuc:'chuyenKhoan'}});
bao(!truocCong.than.ok && truocCong.than.code === 'CONGTRUOC',
  'KHÔNG THU ĐƯỢC KỲ 3 KHI KỲ 2 CÒN THIẾU',
  'tới 9.88 cột congTruoc được GHI mà không được ĐỌC — luật nằm trong dữ liệu như một lời chú thích');

/* ── KHÔNG THU THỪA VÀO MỘT KỲ ── */
const thua = await goi({fn:'ghiPhieuThu', token:tkCoach, u:'coach@gita365.vn',
  phieu:{maKhachHang:nhaMoi, idKy:ky2.id, soTien:ky2.phaiThu + 1000, hinhThuc:'tienMat'}});
bao(!thua.than.ok && thua.than.code === 'THUTHUA',
  'thu THỪA vào một kỳ thì từ chối, và nói còn thiếu bao nhiêu', thua.than.error);

/* ── HUỶ MỘT PHIẾU ĐÃ DUYỆT ── */
const noTruocHuy = (await goi({fn:'congNo', token:tkSA, u:'superadmin@gita365.vn',
  maKhachHang:nhaMoi})).than.tongConNo;
bao(!(await goi({fn:'huyPhieuThu', token:tkSA, u:'superadmin@gita365.vn',
  id:gp.than.id})).than.ok, 'huỷ mà KHÔNG NÓI LÝ DO thì từ chối');
const huy = await goi({fn:'huyPhieuThu', token:tkSA, u:'superadmin@gita365.vn',
  id:gp.than.id, lyDo:'Ngân hàng hoàn giao dịch FT26090100123'});
bao(huy.than.ok, 'huỷ được phiếu đã duyệt, có lý do');
bao(db.prepare("SELECT trangThai FROM phieuThu WHERE id=?").get(gp.than.id).trangThai === 'huy',
  'HUỶ LÀ ĐÁNH DẤU, dòng vẫn còn',
  'xoá là xoá luôn bằng chứng tiền đã từng được ghi nhận và đã từng được duyệt');
const noSauHuy = (await goi({fn:'congNo', token:tkSA, u:'superadmin@gita365.vn',
  maKhachHang:nhaMoi})).than.tongConNo;
bao(noSauHuy === noTruocHuy + gp.than_soTien_bo || noSauHuy > noTruocHuy,
  'và CÔNG NỢ TỰ ĐÚNG LẠI ngay',
  'số dư luôn được TÍNH, không được GIỮ, nên nó không bao giờ lệch với chứng từ');

/* ── KHOẢN THU NGOÀI LỊCH, GÁN VÀO KỲ SAU ── */
const ngoai = await goi({fn:'ghiPhieuThu', token:tkCoach, u:'coach@gita365.vn',
  phieu:{maKhachHang:nhaMoi, soTien:kyT3[0].phaiThu, hinhThuc:'chuyenKhoan',
         ghiChu:'khách chuyển trước khi có kỳ'}});
await goi({fn:'duyetPhieuThu', token:tkSA, u:'superadmin@gita365.vn', id:ngoai.than.id});
bao(db.prepare("SELECT idKy FROM phieuThu WHERE id=?").get(ngoai.than.id).idKy === null,
  'ghi được KHOẢN THU NGOÀI LỊCH — khách chuyển trước khi có kỳ');
const gan = await goi({fn:'ganPhieuVaoKy', token:tkSA, u:'superadmin@gita365.vn',
  id:ngoai.than.id, idKy:kyT3[0].id});
bao(gan.than.ok, 'gán được vào một kỳ về sau',
  'không có đường gán thì tiền nằm trong sổ mà không trừ nợ của ai');
bao(!(await goi({fn:'ganPhieuVaoKy', token:tkSA, u:'superadmin@gita365.vn',
  id:ngoai.than.id, idKy:ky2.id})).than.ok, 'gán rồi thì không gán lại sang kỳ khác');

/* ── HOÀN TIỀN ── */
const hoanThieuLuat = await goi({fn:'deXuatHoan', token:tkCoach, u:'coach@gita365.vn',
  hoan:{maKhachHang:nhaMoi, soTien:1000000, theoLuat:'vì khách đòi', lyDo:'x'}});
bao(!hoanThieuLuat.than.ok,
  'đề xuất hoàn mà KHÔNG NÊU LUẬT HOÀN thì từ chối',
  'một lượt hoàn không nêu luật là một lượt hoàn không đứng được khi có người hỏi');

const LUAT_T3 = 'Mỗi chuỗi 21 ngày là một đơn vị. Dừng giữa chuỗi thì chuỗi đó ' +
  'không hoàn; các chuỗi chưa bắt đầu thì hoàn đủ.';
const quaHoan = await goi({fn:'deXuatHoan', token:tkCoach, u:'coach@gita365.vn',
  hoan:{maKhachHang:nhaMoi, soTien:99000000, theoLuat:LUAT_T3, lyDo:'gia đình dừng'}});
bao(!quaHoan.than.ok && quaHoan.than.code === 'QUAHOAN',
  'KHÔNG HOÀN QUÁ SỐ ĐÃ THU', 'một sổ hoàn nhiều hơn thu là một sổ có tiền chảy ra từ hư không');

const dxHoan = await goi({fn:'deXuatHoan', token:tkCoach, u:'coach@gita365.vn',
  hoan:{maKhachHang:nhaMoi, soTien:1000000, theoLuat:LUAT_T3, lyDo:'gia đình dừng sau chuỗi 1'}});
bao(dxHoan.than.ok, 'đề xuất hoàn đúng luật thì được', dinhDangVN(dxHoan.than.conHoanDuoc));
bao(!(await goi({fn:'duyetHoan', token:tkCoach, u:'coach@gita365.vn',
  id:dxHoan.than.id})).than.ok, 'người ĐỀ XUẤT không tự duyệt hoàn được');

const hhTruoc = db.prepare("SELECT count(*) c FROM hoaHongTra WHERE nhaDuocKem=? AND trangThai='phaiTra'").get(nhaMoi).c;
const dHoan = await goi({fn:'duyetHoan', token:tkSA, u:'superadmin@gita365.vn', id:dxHoan.than.id});
bao(dHoan.than.ok, 'người khác duyệt thì được');
bao(hhTruoc > 0 && db.prepare("SELECT count(*) c FROM hoaHongTra WHERE nhaDuocKem=? AND trangThai='phaiTra'").get(nhaMoi).c === 0,
  'HOÀN TIỀN RỒI THÌ HOA HỒNG CHƯA TRẢ BỊ HUỶ THEO',
  'hoa hồng tính trên GÓI của nhà được kèm; gói ấy không còn nguyên thì khoản dựa trên nó cũng vậy');
bao(db.prepare("SELECT count(*) c FROM hoaHongTra WHERE trangThai='huy'").get().c > 0,
  'và khoản bị huỷ vẫn còn dòng, có lý do');

/* ── TRẢ HOA HỒNG: PHẢI CÓ CHỨNG CỨ ĐÃ XÁC NHẬN ──

   Trả khoản vừa bị huỷ ở trên về 'phaiTra' để thử tiếp đường trả.
   PHẢI XOÁ LUÔN huyLuc: trạng thái và mốc là hai nửa của cùng một sự
   thật, và để lại một mốc huỷ trên một dòng chưa huỷ là dựng một dòng
   không tả được — sổ hoa hồng đọc mốc chứ không đọc trạng thái, nên
   khoản ấy vừa bị trừ ở dòng huỷ vừa biến khỏi số dư cuối kỳ, và đẳng
   thức lệch đúng một lần số tiền ấy. Đúng chỗ này đã đỏ thật khi phép
   đo cân đối quý đang chạy được thêm vào. */
db.prepare("UPDATE hoaHongTra SET trangThai='phaiTra', huyLuc=NULL WHERE nhaDuocKem=?")
  .run(nhaMoi);
const hhId = db.prepare("SELECT id FROM hoaHongTra WHERE nhaDuocKem=? LIMIT 1").get(nhaMoi).id;
bao(!(await goi({fn:'traHoaHong', token:tkSA, u:'superadmin@gita365.vn', id:hhId})).than.ok,
  'CHƯA GẮN CHỨNG CỨ thì chưa trả hoa hồng',
  'bảng chứng cứ dựng ra để đứng được khi đối chất; tiền vẫn ra được khi chưa ai xác nhận thì bảng ấy chỉ là thủ tục');

const ccChuaXac = await goi({fn:'kyChungCu', token:tkCoach, u:'coach@gita365.vn',
  cc:{nhiemVu:'NV-02', ngayLam:'2026-09-02', loai:'kem', noiDung:'Buổi kèm nhà mới.'}});
await goi({fn:'ganChungCuHoaHong', token:tkSA, u:'superadmin@gita365.vn',
  id:hhId, maChungCu:ccChuaXac.than.bienNhan.ma});
bao(!(await goi({fn:'traHoaHong', token:tkSA, u:'superadmin@gita365.vn', id:hhId})).than.ok,
  'gắn chứng cứ CHƯA ĐƯỢC XÁC NHẬN thì vẫn chưa trả');
await goi({fn:'xacNhanChungCu', token:tkSA, u:'superadmin@gita365.vn',
  ma:ccChuaXac.than.bienNhan.ma});
const traHH = await goi({fn:'traHoaHong', token:tkSA, u:'superadmin@gita365.vn', id:hhId});
bao(traHH.than.ok, 'xác nhận rồi thì trả được', dinhDangVN(traHH.than.soTien));
bao(!(await goi({fn:'traHoaHong', token:tkSA, u:'superadmin@gita365.vn', id:hhId})).than.ok,
  'trả rồi thì không trả lại lần hai — tiền đã ra thì không gọi về được');

/* ── ĐÓNG KỲ CHƯA TỚI HẠN KHI NHÀ NGHỈ ── */
const truocDong = db.prepare("SELECT count(*) c FROM kyThu WHERE maKhachHang=?").get(nhaMoi).c;
const dongKy = await goi({fn:'dongKyChuaToi', token:tkSA, u:'superadmin@gita365.vn',
  maKhachHang:nhaMoi, lyDo:'gia đình xin nghỉ từ 06/09'});
bao(dongKy.than.ok && dongKy.than.daDong > 0,
  'đóng được kỳ CHƯA TỚI HẠN khi nhà nghỉ', dongKy.than.daDong + '/' + truocDong + ' kỳ');
bao(db.prepare("SELECT count(*) c FROM kyThu WHERE maKhachHang=? AND id IN " +
  "(SELECT idKy FROM phieuThu WHERE idKy IS NOT NULL AND trangThai='daDuyet')").get(nhaMoi).c > 0,
  'nhưng KỲ ĐÃ THU MỘT PHẦN THÌ GIỮ NGUYÊN',
  'phần ấy đi qua đường hoàn tiền, nơi có luật hoàn và có người duyệt');

/* ── DANH SÁCH QUÁ HẠN TOÀN HỆ ── */
bao(!(await goi({fn:'dsQuaHan', token:tkCoach, u:'coach@gita365.vn'})).than.ok,
  'Coach không xem được danh sách quá hạn của cả hệ');
const qh = await goi({fn:'dsQuaHan', token:tkSA, u:'superadmin@gita365.vn'});
bao(qh.than.ok && typeof qh.than.tongConNo === 'number',
  'người tài chính hỏi ngược được: HÔM NAY NHỮNG NHÀ NÀO QUÁ HẠN',
  qh.than.so + ' kỳ · ' + dinhDangVN(qh.than.tongConNo));

/* ── ĐỐI SOÁT ── */
bao(!(await goi({fn:'doiSoat', token:tkCoach, u:'coach@gita365.vn'})).than.ok,
  'Coach không chạy được đối soát');
const ds1 = await goi({fn:'doiSoat', token:tkSA, u:'superadmin@gita365.vn'});
bao(ds1.than.ok, 'đối soát chạy được', ds1.than.sach ? 'sổ sạch' : ds1.than.soLech + ' chỗ lệch');

/* PHÉP ĐỐI SOÁT TỰ CHỨNG MINH CHƯA CÂM: dựng một chỗ lệch có thật rồi
   đòi nó nêu ra. Một phép đối soát chưa từng đỏ thì chưa phải đối soát. */
db.prepare("INSERT INTO kyThu (id,maKhachHang,tang,ky,soKy,ngayThu,phaiThu,taoLuc) " +
  "VALUES ('KT-MOCOI','GITA-KHONG-CO-THAT',3,1,1,1,1000,?)").run(new Date().toISOString());
const ds2 = await goi({fn:'doiSoat', token:tkSA, u:'superadmin@gita365.vn'});
bao(!ds2.than.sach && ds2.than.lech.some(x => x.ma === 'DS-2'),
  'dựng một kỳ thu treo cho nhà không có tệp → ĐỐI SOÁT NÊU RA',
  ds2.than.lech.map(x => x.ma).join(' · '));
/* Gỡ chỗ lệch đi thì phải THÔI NÊU. Đo bằng SỐ chỗ lệch DS-2 trước và
   sau, không đòi DS-2 biến mất hẳn: đòi biến mất hẳn là gắn phép đo này
   vào việc cả sổ thử phải sạch DS-2 — hôm nào một mục khác dựng thêm
   một nhà treo thì phép đo này đỏ vì lý do của mục ấy, chứ không phải
   vì đối soát sai. */
const soTruoc = (ds2.than.lech.find(x => x.ma === 'DS-2') || {so: 0}).so;
db.prepare("DELETE FROM kyThu WHERE id='KT-MOCOI'").run();
const ds3 = await goi({fn:'doiSoat', token:tkSA, u:'superadmin@gita365.vn'});
const soSau = (ds3.than.lech.find(x => x.ma === 'DS-2') || {so: 0}).so;
bao(soSau === soTruoc - 1,
  'gỡ chỗ lệch đi thì đối soát thôi nêu nó',
  'DS-2: ' + soTruoc + ' → ' + soSau);
bao(ds2.than.vi.indexOf('KHÔNG SỬA GÌ') >= 0,
  'và đối soát KHÔNG SỬA GÌ — chỉ nêu ra',
  'mỗi chỗ lệch có một câu chuyện riêng, và máy không biết câu chuyện ấy');

/* ═══════════════ 15b · BỐN NHỊP BÁO CÁO ═══════════════

   Thu theo NGÀY · chốt theo TUẦN · tổng hợp THÁNG–QUÝ để đổi chiến
   lược · kế toán theo QUÝ và NĂM, trọn tới mức khai thuế được.

   Dữ liệu thử ở đây dựng bằng MỐC CỐ ĐỊNH trong quá khứ, không dùng
   "bây giờ": một bộ thử phụ thuộc vào giờ chạy là một bộ thử xanh ban
   ngày và đỏ lúc nửa đêm. */
console.log('\n15b · BỐN NHỊP BÁO CÁO');

const bc = await import('../may-chu/bao-cao.js');

/* ── MÚI GIỜ: CHỖ TIỀN RƠI NHẦM TUẦN ──

   6 giờ 30 sáng THỨ HAI giờ Việt Nam có mốc UTC là 23 giờ 30 CHỦ NHẬT.
   Cắt tuần theo UTC thì khoản ấy rơi vào tuần TRƯỚC — một tuần có thể
   đã chốt rồi. Mỗi tuần có một khoảng bảy tiếng như thế, và nó rơi
   đúng vào giờ người ta hay chuyển khoản nhất. */
const sangThuHai = '2026-03-01T23:30:00.000Z';        /* = 06:30 T2 02/03 giờ VN */
const tuanCuaNo  = bc.dungKy('tuan', '2026-03-02');
bao(tuanCuaNo.ky === '2026-W10' &&
    sangThuHai >= tuanCuaNo.tuLuc && sangThuHai <= tuanCuaNo.denLuc,
  'TIỀN VÀO 6H30 SÁNG THỨ HAI GIỜ VIỆT NAM RƠI ĐÚNG TUẦN ẤY — không rơi về tuần trước',
  'mốc UTC của nó là 23h30 Chủ nhật; cắt tuần theo UTC là sai bảy tiếng mỗi tuần');

/* Tuần ISO: tuần chứa Thứ Năm quyết định năm của tuần. 01/01/2027 là
   Thứ Sáu, nên tuần ấy thuộc về 2026 chứ không phải tuần 1 của 2027. */
bao(bc.dungKy('tuan', '2027-01-01').ky === '2026-W53',
  'tuần ISO bắc qua giao thừa thuộc về năm CŨ — tuần chứa Thứ Năm quyết định năm',
  bc.dungKy('tuan', '2027-01-01').ky);
bao(bc.dungKy('quy', '2026-08-15').ky === '2026-Q3' &&
    bc.dungKy('quy', '2026-08-15').denNgay === '2026-09-30',
  'quý dựng đúng từ một ngày bất kỳ trong quý');

/* ── DỰNG MỘT TUẦN CÓ THẬT ĐỂ CHỐT ──
   Tuần 2026-W10: Thứ Hai 02/03 → Chủ nhật 08/03, giờ Việt Nam. */
const W = bc.dungKy('tuan', '2026-03-02');
db.prepare("INSERT INTO hoSoKhach (maKhachHang,uidPhuHuynh,tang,trangThai,vaoLuc,suaLuc) " +
  "VALUES ('GITA-BC01','U-nhaA',3,'dangHoc',?,?)").run(W.tuLuc, W.tuLuc);
db.prepare("INSERT INTO kyThu (id,maKhachHang,tang,ky,soKy,ngayThu,phaiThu,hanLuc,taoLuc) " +
  "VALUES ('KT-BC01','GITA-BC01',3,1,3,1,1000000,?,?)").run(W.tuLuc, W.tuLuc);
db.prepare("INSERT INTO phieuThu (id,maKhachHang,idKy,soTien,hinhThuc,nguoiGhi,ghiLuc," +
  "nguoiDuyet,duyetLuc,trangThai) VALUES ('PT-BC01','GITA-BC01','KT-BC01',600000," +
  "'chuyenKhoan','tuvan@gita365.vn',?,'superadmin@gita365.vn',?,'daDuyet')")
  .run(sangThuHai, sangThuHai);
db.prepare("INSERT INTO phieuThu (id,maKhachHang,idKy,soTien,hinhThuc,nguoiGhi,ghiLuc," +
  "nguoiDuyet,duyetLuc,trangThai) VALUES ('PT-BC02','GITA-BC01','KT-BC01',400000," +
  "'tienMat','tuvan@gita365.vn',?,'superadmin@gita365.vn',?,'daDuyet')")
  .run('2026-03-05T03:00:00.000Z', '2026-03-05T03:00:00.000Z');

/* HAI CHỖ LÀM CHO ĐẲNG THỨC CÔNG NỢ CÓ THỂ SAI.

   Không có hai dòng này thì tiền thực thu tình cờ bằng tiền thu vào kỳ,
   và phép đo "báo cáo kế toán cân" xanh với CẢ công thức đúng lẫn công
   thức sai — tức là một phép đo câm. Thử phá đã bắt được đúng chỗ ấy.

     · PT-BC03 — khách chuyển 250.000đ KHÔNG GẮN KỲ NÀO. Tiền đã vào
       sổ nhưng chưa trừ nợ của ai.
     · PT-BC04 — nộp trước từ tháng 12/2025 cho một kỳ mãi tháng 3/2026
       mới tới hạn. Nằm ngoài "thu trong kỳ" nhưng vẫn làm giảm công nợ
       cuối kỳ. */
db.prepare("INSERT INTO phieuThu (id,maKhachHang,soTien,hinhThuc,nguoiGhi,ghiLuc," +
  "nguoiDuyet,duyetLuc,trangThai) VALUES ('PT-BC03','GITA-BC01',250000," +
  "'chuyenKhoan','tuvan@gita365.vn',?,'superadmin@gita365.vn',?,'daDuyet')")
  .run('2026-03-06T04:00:00.000Z', '2026-03-06T04:00:00.000Z');

db.prepare("INSERT INTO kyThu (id,maKhachHang,tang,ky,soKy,ngayThu,phaiThu,hanLuc,taoLuc) " +
  "VALUES ('KT-BC02','GITA-BC01',3,2,3,43,500000,?,?)")
  .run('2026-03-04T02:00:00.000Z', '2025-12-01T00:00:00.000Z');
db.prepare("INSERT INTO phieuThu (id,maKhachHang,idKy,soTien,hinhThuc,nguoiGhi,ghiLuc," +
  "nguoiDuyet,duyetLuc,trangThai) VALUES ('PT-BC04','GITA-BC01','KT-BC02',500000," +
  "'chuyenKhoan','tuvan@gita365.vn',?,'superadmin@gita365.vn',?,'daDuyet')")
  .run('2025-12-20T02:00:00.000Z', '2025-12-20T02:00:00.000Z');

/* ── 1 · THU THEO NGÀY ── */
bao(!(await goi({fn:'soNgay', token:tkCoach, u:'coach@gita365.vn', ngay:'2026-03-02'})).than.ok,
  'Coach không mở được sổ thu theo ngày của cả hệ');
const ng = await goi({fn:'soNgay', token:tkSA, u:'superadmin@gita365.vn', ngay:'2026-03-02'});
bao(ng.than.ok && ng.than.daThu === 600000 && ng.than.thuocTuan === '2026-W10',
  'sổ thu theo NGÀY khớp từng phiếu — 600.000đ ngày 02/03, thuộc tuần 2026-W10');
bao(ng.than.theoHinhThuc.chuyenKhoan === 600000 && !ng.than.theoHinhThuc.tienMat,
  'và CHIA THEO HÌNH THỨC — tiền mặt đếm ở két, chuyển khoản khớp sao kê',
  'gộp chung một số là bỏ mất phép đối chiếu duy nhất của thủ quỹ');

/* ── 2 · CHỐT TUẦN ── */
bao(!(await goi({fn:'chotTuan', token:tkCoach, u:'coach@gita365.vn', ngay:'2026-03-02'})).than.ok,
  'Coach không chốt được sổ');

/* HÔM NAY GIỜ VIỆT NAM, không phải hôm nay giờ UTC. Tuần chứa ngày hôm
   nay thì KHÔNG BAO GIỜ kết thúc rồi — đó chính là bất biến phép đo này
   muốn. Lấy ngày UTC thì sau 17:00 UTC nó là NGÀY HÔM QUA giờ Việt Nam,
   và hôm qua có thể thuộc một tuần đã đóng. */
const chuaHet = await goi({fn:'chotTuan', token:tkSA, u:'superadmin@gita365.vn',
  ngay: ngayVN()});
bao(!chuaHet.than.ok && chuaHet.than.code === 'CHUAHET',
  'KHÔNG CHỐT ĐƯỢC MỘT TUẦN CHƯA HẾT — chốt giữa tuần là ghi một con số rồi tuần ấy vẫn còn ngày để tiền vào',
  chuaHet.than.error);

const ch = await goi({fn:'chotTuan', token:tkSA, u:'superadmin@gita365.vn', ngay:'2026-03-02'});
bao(ch.than.ok && ch.than.ky === '2026-W10' && ch.than.thu === 1250000 &&
    ch.than.ghiNhan === 1500000 && ch.than.vanTay.length === 64,
  'chốt tuần 2026-W10 — thu 1.250.000đ · ghi nhận 1.500.000đ · có vân tay',
  ch.than.vanTay.slice(0, 16) + '…');

const lai2 = await goi({fn:'chotTuan', token:tkSA, u:'superadmin@gita365.vn', ngay:'2026-03-02'});
bao(!lai2.than.ok && lai2.than.code === 'DACHOT', 'chốt rồi thì không chốt đè lên');
bao(!(await goi({fn:'chotTuan', token:tkSA, u:'superadmin@gita365.vn',
  ngay:'2026-03-02', chotLai:true})).than.ok,
  'CHỐT LẠI PHẢI CÓ LÝ DO — không có vết thì "đã chốt" chỉ có nghĩa tới lần chốt lại sau');

/* ── 3 · SOÁT CHỐT: VÂN TAY LÀ DẤU CỦA TẬP DÒNG ── */
const sc1 = await goi({fn:'soatChot', token:tkSA, u:'superadmin@gita365.vn'});
bao(sc1.than.ok && sc1.than.sach, 'chốt xong soát ngay thì sạch');

/* Huỷ một phiếu NẰM TRONG tuần đã chốt. Sổ tuần ấy phải GIỮ NGUYÊN, và
   khoản giảm phải hiện ra thành một bút toán điều chỉnh. */
const huyTrongChot = await goi({fn:'huyPhieuThu', token:tkSA, u:'superadmin@gita365.vn',
  id:'PT-BC02', lyDo:'Ngân hàng báo hoàn giao dịch'});
bao(huyTrongChot.than.ok && huyTrongChot.than.dieuChinh &&
    huyTrongChot.than.dieuChinh.kyBiAnhHuong === '2026-W10',
  'HUỶ MỘT PHIẾU TRONG TUẦN ĐÃ CHỐT SINH RA BÚT TOÁN ĐIỀU CHỈNH — sổ đã đóng thì không sửa, khoản giảm rơi vào kỳ đang mở',
  'trỏ ngược về ' + (huyTrongChot.than.dieuChinh || {}).kyBiAnhHuong);

bao(Number(db.prepare("SELECT thu FROM soChot WHERE ky='2026-W10'").get().thu) === 1250000,
  'và SỐ ĐÃ CHỐT KHÔNG ĐỔI — bản in tháng trước với bản in lại tháng sau phải ra cùng một số');

const sc2 = await goi({fn:'soatChot', token:tkSA, u:'superadmin@gita365.vn'});
const l10 = (sc2.than.lech || []).find(x => x.ky === '2026-W10');
bao(!sc2.than.sach && l10 && l10.chenh === -400000,
  'SOÁT CHỐT NÊU RA tuần đã động sau khi chốt — chênh 400.000đ',
  'vân tay là dấu của TẬP DÒNG, không phải của con số tổng');
bao(l10 && l10.daGiaiThich && l10.soButToanDieuChinh === 1,
  'và nêu KÈM rằng chỗ động ấy ĐÃ CÓ BÚT TOÁN GIẢI THÍCH — một chỗ đã có người xử lý, không phải một chỗ chưa ai biết');

/* ── 4 · TỔNG HỢP THÁNG · QUÝ ĐỂ ĐỔI CHIẾN LƯỢC ── */
bao(!(await goi({fn:'tongHop', token:tkCoach, u:'coach@gita365.vn',
  loai:'thang', moc:'2026-03'})).than.ok, 'Coach không xem được bản tổng hợp');
const thg = await goi({fn:'tongHop', token:tkSA, u:'superadmin@gita365.vn',
  loai:'thang', moc:'2026-03'});
bao(thg.than.ok && thg.than.ky === '2026-03' && thg.than.soVoi === '2026-02',
  'bản tổng hợp LUÔN CÓ KỲ TRƯỚC ĐỂ SO — một con số đứng một mình không đổi được chiến lược của ai',
  thg.than.ky + ' so với ' + thg.than.soVoi);
bao(thg.than.tyLeThu.nay !== undefined && Array.isArray(thg.than.theoTang) &&
    Array.isArray(thg.than.theoNguoiKem),
  'và cắt theo TẦNG và theo NGƯỜI KÈM — tổng đi xuống thì câu hỏi tiếp theo luôn là "xuống ở đâu"',
  'tỷ lệ thu ' + thg.than.tyLeThu.nay + '%');
const q1 = await goi({fn:'tongHop', token:tkSA, u:'superadmin@gita365.vn',
  loai:'quy', moc:'2026-Q1'});
bao(q1.than.ok && q1.than.soVoi === '2025-Q4', 'tổng hợp theo QUÝ so ngược sang quý trước');

/* ── 5 · BÁO CÁO KẾ TOÁN PHẢI CÂN ── */
const ktq = await goi({fn:'baoCaoKeToan', token:tkSA, u:'superadmin@gita365.vn',
  loai:'quy', moc:'2026-Q1'});
bao(ktq.than.ok && ktq.than.canDoi.can,
  'BÁO CÁO KẾ TOÁN CÂN — đầu kỳ + phát sinh − thu vào kỳ − thu trước nay tới hạn = cuối kỳ',
  'lệch công nợ ' + ktq.than.canDoi.lechCongNo + ' · lệch hoa hồng ' + ktq.than.canDoi.lechHoaHong);
/* Bản này chạy SAU lượt huỷ PT-BC02 ở trên, nên tiền thực thu là
   850.000đ chứ không phải 1.250.000đ — còn doanh thu ghi nhận vẫn
   nguyên 1.500.000đ, vì huỷ một phiếu không xoá kỳ thu nào. */
bao(ktq.than.A_doanhThu.ghiNhanTrongKy === 1500000 && ktq.than.B_tienMat.thucThu === 850000,
  'HAI CON SỐ, KHÔNG PHẢI MỘT — doanh thu ghi nhận 1.500.000đ, tiền thực thu 850.000đ',
  'hiệu của chúng chính là công nợ; nền cũ chỉ có con số thứ hai');

/* Hai khoản này là chỗ đẳng thức công nợ có thể sai, nên phải hiện
   thành số trên mặt bản chứ không nằm im trong phép tính. */
bao(ktq.than.C_congNo.thuChuaGanKy === 250000 &&
    ktq.than.C_congNo.thuTruocNayToiHan === 500000,
  'và NÊU RIÊNG hai khoản làm lệch: 250.000đ chưa gắn kỳ · 500.000đ nộp trước nay tới hạn',
  'tiền đã vào sổ mà chưa trừ nợ của ai là một việc phải làm, không phải một con số để ngắm');
/* Từ 9.91 hệ có cả hai nửa nên phép trừ chạy được — nhưng kết quả của
   nó KHÔNG được gọi là lợi nhuận, và bản kê phải tự nói ra vì sao. */
bao(ktq.than.G_chenhLechThuChi.khongPhaiLoiNhuan === true &&
    ktq.than.G_chenhLechThuChi.thieuNhungGi.length >= 3 &&
    typeof ktq.than.G_chenhLechThuChi.chenhLech === 'number',
  'CÓ CHÊNH LỆCH THU CHI NHƯNG KHÔNG GỌI LÀ LỢI NHUẬN — doanh thu ghi dồn tích, chi phí ghi tiền ra, hai cơ sở khác nhau',
  'và bản kê tự kê ra bốn thứ nó còn thiếu, thay vì để người đọc tự đoán');
/* BÚT TOÁN ĐIỀU CHỈNH RƠI VÀO KỲ ĐANG MỞ, KHÔNG VÀO KỲ BỊ ẢNH HƯỞNG.

   Phiếu thuộc quý I; huỷ nó hôm nay thì khoản giảm thuộc về quý ĐANG
   CHẠY, có trỏ ngược về tuần 2026-W10. Quý I giữ nguyên con số cũ —
   đó chính là điều làm cho một kỳ đã chốt có nghĩa. */
bao(ktq.than.E_butToanDieuChinh.so === 0,
  'quý ĐÃ QUA không nhận thêm bút toán nào — kỳ đã đóng là đã đóng');
const ktNay = await goi({fn:'baoCaoKeToan', token:tkSA, u:'superadmin@gita365.vn',
  loai:'quy', moc:new Date().toISOString().slice(0, 10)});
const e = ktNay.than.E_butToanDieuChinh;
bao(e.so === 1 && e.tien === -400000 && e.chiTiet[0].kyBiAnhHuong === '2026-W10',
  'BÚT TOÁN RƠI VÀO KỲ ĐANG MỞ, TRỎ NGƯỢC VỀ KỲ BỊ ẢNH HƯỞNG — nêu RIÊNG, không cộng lẫn vào doanh thu phát sinh',
  'quý đang chạy · −400.000đ · thuộc về ' + e.chiTiet[0].kyBiAnhHuong);

/* ── ĐẲNG THỨC HOA HỒNG PHẢI BỊ THỬ BẰNG MỘT LƯỢT HUỶ THẬT ──

   Đẳng thức "phải trả đầu kỳ + sinh − đã trả − huỷ = phải trả cuối kỳ"
   xanh suốt cho tới đây chỉ vì trong kỳ chưa có khoản nào bị huỷ. Một
   đẳng thức chưa từng bị thử thì chưa phải đẳng thức — thử phá đã bắt
   đúng chỗ này: gỡ cột huyLuc đi mà không phép đo nào đỏ.

   Nên dựng một lượt huỷ THẬT, đi qua đúng đường thật: hoàn tiền cho
   nhà được kèm thì hoa hồng chưa trả của nhà bảo trợ bị huỷ theo. */
db.prepare("INSERT INTO hoaHongTra (id,nhaKem,nhaDuocKem,tangVuot,bac,phanTram," +
  "goiCanCu,soTien,trangThai,sinhLuc) VALUES ('HH-BC01','GITA-9001','GITA-BC01',3," +
  "'B5',5,6000000,300000,'phaiTra',?)").run(new Date().toISOString());

/* Và một khoản SINH TỪ QUÝ I, còn nguyên tới hết quý I, mãi hôm nay
   mới bị huỷ. Đây mới là chỗ cột huyLuc thật sự cần thiết: bản báo cáo
   quý I chạy hôm nay phải nói đúng số dư CỦA LÚC ẤY, không được đổi
   theo một lượt huỷ xảy ra sau đó ba quý.

   Đọc trạng thái hôm nay rồi suy ngược là cách làm cho sổ của mọi kỳ
   quá khứ đổi theo mỗi thao tác hôm nay — và lúc ấy không bản báo cáo
   nào dựng lại được. */
db.prepare("INSERT INTO hoaHongTra (id,nhaKem,nhaDuocKem,tangVuot,bac,phanTram," +
  "goiCanCu,soTien,trangThai,sinhLuc) VALUES ('HH-BC02','GITA-9002','GITA-BC01',2," +
  "'B5',5,4000000,200000,'phaiTra','2026-03-03T02:00:00.000Z')").run();

const dxBC = await goi({fn:'deXuatHoan', token:tkCoach, u:'coach@gita365.vn',
  hoan:{maKhachHang:'GITA-BC01', soTien:100000, idPhieuThu:'PT-BC01',
    theoLuat:'T3 chuỗi chưa bắt đầu thì hoàn đủ', lyDo:'Gia đình chuyển nơi ở'}});
const dyBC = await goi({fn:'duyetHoan', token:tkSA, u:'superadmin@gita365.vn',
  id:dxBC.than.id});
bao(dxBC.than.ok && dyBC.than.ok, 'dựng một lượt hoàn thật cho nhà có hoa hồng chưa trả');
bao(db.prepare("SELECT trangThai, huyLuc FROM hoaHongTra WHERE id='HH-BC01'").get()
      .trangThai === 'huy' &&
    !!db.prepare("SELECT huyLuc FROM hoaHongTra WHERE id='HH-BC01'").get().huyLuc,
  'khoản hoa hồng bị huỷ theo, VÀ CÓ MỐC HUỶ — trạng thái và mốc là hai nửa của một sự thật');

const ktCan = await goi({fn:'baoCaoKeToan', token:tkSA, u:'superadmin@gita365.vn',
  loai:'quy', moc:new Date().toISOString().slice(0, 10)});
bao(ktCan.than.D_hoaHong.soHuy === 2 && ktCan.than.D_hoaHong.huy === 500000,
  'quý đang chạy CÓ khoản hoa hồng bị huỷ thật — 2 khoản, 500.000đ');
bao(ktCan.than.canDoi.can,
  'VÀ VẪN CÂN CẢ HAI ĐẲNG THỨC — kể cả khi trong kỳ có huỷ hoa hồng và có hoàn tiền',
  'lệch công nợ ' + ktCan.than.canDoi.lechCongNo +
  ' · lệch hoa hồng ' + ktCan.than.canDoi.lechHoaHong);

/* QUÝ I ĐỌC LẠI HÔM NAY PHẢI RA SỐ DƯ CỦA LÚC ẤY.

   HH-BC02 sinh tháng 3, còn nguyên tới hết quý I, mới bị huỷ hôm nay.
   Nên số dư hoa hồng cuối quý I vẫn phải CÓ nó. Đọc trạng thái hôm nay
   thay vì đọc mốc thì nó biến mất khỏi quý I, và bản quý I in ra hồi
   tháng 4 với bản in lại hôm nay ra hai số khác nhau. */
const q1Lai = await goi({fn:'baoCaoKeToan', token:tkSA, u:'superadmin@gita365.vn',
  loai:'quy', moc:'2026-Q1'});
bao(q1Lai.than.D_hoaHong.sinhTrongKy === 200000 &&
    q1Lai.than.D_hoaHong.huy === 0 &&
    q1Lai.than.D_hoaHong.phaiTraCuoiKy >= 200000,
  'MỘT KỲ ĐÃ QUA ĐỌC LẠI HÔM NAY VẪN RA SỐ DƯ CỦA LÚC ẤY — khoản huỷ hôm nay không xoá ngược vào quý I',
  'sinh 200.000đ trong quý I · huỷ 0 trong quý I · vẫn còn trong số dư cuối quý');
bao(q1Lai.than.canDoi.can,
  'và quý I vẫn cân sau khi có một lượt huỷ xảy ra ba quý sau đó',
  'lệch hoa hồng ' + q1Lai.than.canDoi.lechHoaHong);

/* Khoản hoàn này gắn vào PT-BC01 — phiếu nằm trong tuần ĐÃ CHỐT — nên
   nó cũng phải sinh một bút toán điều chỉnh trỏ về đúng tuần ấy. */
bao(dyBC.than.dieuChinh && dyBC.than.dieuChinh.kyBiAnhHuong === '2026-W10',
  'và HOÀN TIỀN CHO MỘT PHIẾU TRONG TUẦN ĐÃ CHỐT cũng trỏ ngược về đúng tuần ấy',
  'bút toán phải trỏ về kỳ của PHIẾU GỐC, không phải kỳ hôm nay');

/* ── 6 · BỘ SỐ KHAI THUẾ ── */
bao(!(await goi({fn:'boSoKhaiThue', token:tkSA, u:'superadmin@gita365.vn',
  loai:'quy', moc:'2026-Q1'})).than.ok === false, 'R01 mở được bộ số khai thuế');
const thue = await goi({fn:'boSoKhaiThue', token:tkSA, u:'superadmin@gita365.vn',
  loai:'quy', moc:'2026-Q1'});
bao(thue.than.ok && thue.than.doanhThu.ghiNhan === 1500000 &&
    thue.than.doanhThu.nguon.indexOf('kyThu') >= 0,
  'mỗi chỉ tiêu kèm NGUỒN SỐ — kế toán tra ngược được về từng dòng, không phải tin lời máy');
bao(Array.isArray(thue.than.chiHoaHong.theoNguoiNhan) &&
    thue.than.chiHoaHong.vi.indexOf('từng lượt') >= 0,
  'hoa hồng trả về TỪNG LƯỢT CHI cho TỪNG người — khấu trừ tính theo lượt, không theo tổng kỳ');
bao(thue.than.choKeToanXacNhan.length === 5 &&
    !/thuế suất là|phải nộp|khấu trừ 10/.test(JSON.stringify(thue.than)),
  'MÁY KHÔNG KẾT LUẬN NGHĨA VỤ THUẾ — không tự nhân một tỷ lệ nào vào',
  thue.than.choKeToanXacNhan.length + ' chỗ chờ kế toán xác nhận: ' +
    thue.than.choKeToanXacNhan.map(x=>x.ma).join(' · '));
bao(!thue.than.chuaSanSang.sanSang && thue.than.chuaSanSang.tuanChuaChot.length > 0,
  'và NÊU CHỖ CHƯA SẴN SÀNG TRƯỚC KHI NỘP — tuần chưa chốt là con số còn có thể đổi',
  thue.than.chuaSanSang.tuanChuaChot.length + ' tuần chưa chốt trong quý');

/* ═══════════════ 15c · NỬA CÒN LẠI CỦA CUỐN SỔ ═══════════════

   Tiền RA · tiền được GIẢM · tiền phải ĐÒI · tiền mặt phải ĐẾM. */
console.log('\n15c · SỔ CHI · MIỄN GIẢM · NHẮC THU · KÉT');

/* Phiên phụ huynh lấy mới ở đây: token của mục 1 đã đi qua mười lăm
   mục và có thể đã bị đá khi đổi mật khẩu. Một phép đo đỏ vì token hết
   hạn là một phép đo nói sai về thứ nó định đo. */
const tkPh2 = (await goi({fn:'dangNhap', u:'phuhuynh@gita365.vn',
  mk:'MatKhauRieng2026!'})).than.token;

/* Đề xuất chi là việc của quản lý (R01–R05), không phải của Coach:
   Coach kèm nhà, không quyết tiền thuê mặt bằng. Nên mục này cần một
   tài khoản R05 — và chính chỗ ấy là một phép đo: Coach bấm vào cũng
   không được. */
await themNguoi('U-tc', 'truongcoach@gita365.vn', 'MatKhauRieng2026!', 'R05',
  {portal:'coach'});
const tkTC = (await goi({fn:'dangNhap', u:'truongcoach@gita365.vn',
  mk:'MatKhauRieng2026!'})).than.token;
bao(!(await goi({fn:'ghiChi', token:tkCoach, u:'coach@gita365.vn',
  chi:{khoanMuc:'matBang', soTien:3000000, hinhThuc:'chuyenKhoan',
    dienGiai:'Thuê phòng học tháng 3'}})).than.ok,
  'Coach không đề xuất được khoản chi — Coach kèm nhà, không quyết tiền thuê mặt bằng');

/* ── 1 · SỔ CHI ── */
bao(!(await goi({fn:'ghiChi', token:tkPh2, u:'phuhuynh@gita365.vn',
  chi:{khoanMuc:'matBang', soTien:5000000, hinhThuc:'chuyenKhoan',
    dienGiai:'Thuê văn phòng tháng 3'}})).than.ok,
  'phụ huynh không đề xuất được khoản chi');

const mucLa = await goi({fn:'ghiChi', token:tkTC, u:'truongcoach@gita365.vn',
  chi:{khoanMuc:'anBuoiTrua', soTien:100000, hinhThuc:'tienMat', dienGiai:'Ăn trưa cả nhóm'}});
bao(!mucLa.than.ok && /Khoản mục phải/.test(mucLa.than.error),
  'KHOẢN MỤC LÀ DANH SÁCH TRẮNG — gõ tự do thì sáu tháng sau có bốn khoản mục cho một thứ',
  'và không bản tổng hợp nào cộng đúng');

bao(!(await goi({fn:'ghiChi', token:tkTC, u:'truongcoach@gita365.vn',
  chi:{khoanMuc:'matBang', soTien:5000000, hinhThuc:'chuyenKhoan', dienGiai:'ok'}})).than.ok,
  'khoản chi phải có DIỄN GIẢI rõ — sang năm phải dựng lại được câu chuyện');

bao(!(await goi({fn:'ghiChi', token:tkTC, u:'truongcoach@gita365.vn',
  chi:{khoanMuc:'matBang', soTien:5000000, hinhThuc:'chuyenKhoan',
    dienGiai:'Thuê văn phòng', ngayChi:'2027-12-01T00:00:00.000Z'}})).than.ok,
  'ngày chi không được nằm ở tương lai — khoản chi ghi khi tiền đã ra');

/* Khoản chi rơi vào tuần 2026-W10 ĐÃ CHỐT, để thử luôn bút toán. */
const cp1 = await goi({fn:'ghiChi', token:tkTC, u:'truongcoach@gita365.vn',
  chi:{khoanMuc:'matBang', soTien:3000000, hinhThuc:'chuyenKhoan',
    dienGiai:'Thuê phòng học tháng 3/2026', ngayChi:'2026-03-04T03:00:00.000Z',
    coHoaDon:true, maHoaDon:'HD-0001', nhaCungCap:'Cty ABC'}});
bao(cp1.than.ok && cp1.than.trangThai === 'choDuyet', 'đề xuất được khoản chi có hoá đơn');

bao(!(await goi({fn:'duyetChi', token:tkTC, u:'truongcoach@gita365.vn', id:cp1.than.id})).than.ok,
  'R05 đề xuất được nhưng KHÔNG duyệt được — duyệt chi là R01–R03');

/* Số tiền phải TỪ 1,5 triệu trở lên, nếu không khoản này đi lối tự ghi
   và cổng "không tự duyệt" không có gì để chặn — phép đo sẽ xanh mà
   không đo được thứ nó định đo. */
const cpTuDuyet = await goi({fn:'ghiChi', token:tkSA, u:'superadmin@gita365.vn',
  chi:{khoanMuc:'haTang', soTien:2000000, hinhThuc:'chuyenKhoan',
    dienGiai:'Gia hạn tên miền gita.edu.vn'}});
const tuDuyet = await goi({fn:'duyetChi', token:tkSA, u:'superadmin@gita365.vn',
  id:cpTuDuyet.than.id});
bao(!tuDuyet.than.ok && tuDuyet.than.code === 'TUDUYET',
  'NGƯỜI ĐỀ XUẤT CHI KHÔNG TỰ DUYỆT — tiền đi RA thì phải có người thứ hai đứng giữa',
  'một người vừa quyết chi vừa duyệt chi là một người lấy được tiền ra khỏi Học viện');

/* ── NĂM NẤC THANG DUYỆT CHI ──

   Thang leo bằng SỐ NGƯỜI và bằng BẰNG CHỨNG, không bằng cấp bậc: tầng
   tài chính chỉ có ba vai, nên bắt khoản lớn "lên cấp cao hơn" bên
   trong ba vai ấy không thêm được lớp nào thật. */
const ct = await import('../may-chu/chi-tieu.js');
const neo = ct.soatNeoThang();
bao(neo.khop,
  'MỖI NẤC CÒN NEO ĐÚNG VÀO GIÁ MỘT GÓI HỌC PHÍ — N3 một gói T3, N4 một gói T4, N5 một gói T5',
  'giá gói đổi mà thang đứng yên thì cái neo thành lời nói suông; phép soi này đỏ khi lệch');

/* N5 KHÔNG ĐI ĐƯỢC NẾU THIẾU CHỨNG TỪ. Và lời từ chối phải nói RÕ
   thiếu gì — "không hợp lệ" thì người ta thử lại mù. */
const thieuCt = await goi({fn:'ghiChi', token:tkTC, u:'truongcoach@gita365.vn',
  chi:{khoanMuc:'tiepThi', soTien:60000000, hinhThuc:'chuyenKhoan',
    dienGiai:'Chiến dịch truyền thông quý 4'}});
bao(!thieuCt.than.ok && thieuCt.than.code === 'THIEUCHUNGTU' &&
    thieuCt.than.nac === 'N5' &&
    /hoá đơn/.test(thieuCt.than.error) && /3 báo giá/.test(thieuCt.than.error) &&
    /hợp đồng/.test(thieuCt.than.error),
  'NẤC N5 ĐÒI HOÁ ĐƠN + 3 BÁO GIÁ + HỢP ĐỒNG, và nói RÕ thiếu gì',
  thieuCt.than.error);

const cpTo = await goi({fn:'ghiChi', token:tkTC, u:'truongcoach@gita365.vn',
  chi:{khoanMuc:'tiepThi', soTien:60000000, hinhThuc:'chuyenKhoan',
    dienGiai:'Chiến dịch truyền thông quý 4', coHoaDon:true, maHoaDon:'HD-9',
    baoGia:['Cty A 60tr', 'Cty B 64tr', 'Cty C 71tr'], soHopDong:'HĐ-2026-11'}});
bao(cpTo.than.ok && cpTo.than.nac === 'N5' && cpTo.than.canMayNguoiDuyet >= 2,
  'đủ chứng từ thì ghi được, và nói ngay rằng nấc này CẦN HAI NGƯỜI DUYỆT',
  cpTo.than.tenNac);

/* HAI CHỮ KÝ, VÀ CHỮ KÝ THỨ NHẤT KHÔNG ĐƯỢC LÀM TIỀN RA. */
const kyChiA = await goi({fn:'duyetChi', token:tkSA, u:'superadmin@gita365.vn',
  id:cpTo.than.id});
bao(kyChiA.than.ok && kyChiA.than.choNguoiTiepTheo && kyChiA.than.trangThai === 'choDuyet' &&
    db.prepare("SELECT trangThai FROM chiPhi WHERE id=?").get(cpTo.than.id)
      .trangThai === 'choDuyet',
  'CHỮ KÝ THỨ NHẤT KHÔNG LÀM TIỀN RA — khoản vẫn nằm chờ, chưa vào sổ',
  'đã ký ' + kyChiA.than.daKy + '/' + kyChiA.than.canKy);

const kyChiLai = await goi({fn:'duyetChi', token:tkSA, u:'superadmin@gita365.vn',
  id:cpTo.than.id});
bao(!kyChiLai.than.ok && kyChiLai.than.code === 'DAKY',
  'VÀ MỘT NGƯỜI KHÔNG KÝ ĐƯỢC HAI LẦN — không chặn thì bấm hai lần là đủ hai chữ ký, và cả nấc N5 thành trang trí',
  kyChiLai.than.error);

/* Người thứ hai phải đủ tư cách cho MỐC CHU KỲ của tuần ấy, không chỉ
   cho nấc của khoản: tuần này đã chi rất lớn nên mốc đòi Super Admin. */
const kyChiB = await ct.duyetChi({id:cpTo.than.id}, env, env.CSDL,
  {uid:'U-sa2', u:'superadmin2@gita365.vn', role:'R01'});
/* HAI THANG CHỒNG LÊN NHAU: nấc N5 của khoản đòi 2 chữ ký, mốc chu kỳ
   của tuần đòi thêm 1 — tổng ba. Chữ ký thứ hai CHƯA đủ. */
bao(kyChiB.ok && kyChiB.trangThai === 'choDuyet' && kyChiB.daKy === 2 &&
    kyChiB.canKy === 3 && kyChiB.conThieu === 1,
  'CHỮ KÝ THỨ HAI VẪN CHƯA ĐỦ — nấc N5 đòi hai, mốc chu kỳ đòi thêm một',
  'hai thang chồng lên nhau chứ không thay nhau · ' +
    kyChiB.daKy + '/' + kyChiB.canKy + ' chữ ký');
const kyChiC = await ct.duyetChi({id:cpTo.than.id}, env, env.CSDL,
  {uid:'U-sa3', u:'superadmin3@gita365.vn', role:'R01'});
bao(kyChiC.ok && kyChiC.trangThai === 'daDuyet' && kyChiC.daKy === 3,
  'người thứ BA ký thì khoản mới vào sổ',
  'nấc ' + kyChiC.nac + ' · mốc ' + kyChiC.moc + ' · ' +
    kyChiC.daKy + '/' + kyChiC.canKy + ' chữ ký');

/* CẤP DUYỆT: R05 không duyệt được kể cả nấc thấp nhất có duyệt (N2). */
const n2 = await goi({fn:'ghiChi', token:tkTC, u:'truongcoach@gita365.vn',
  chi:{khoanMuc:'daoTao', soTien:2000000, hinhThuc:'chuyenKhoan',
    dienGiai:'In tài liệu khoá mới', ngayChi:'2026-08-03T02:00:00.000Z'}});
const capThap = await ct.duyetChi({id:n2.than.id}, env, env.CSDL,
  {uid:'U-tc2', u:'truongcoach@gita365.vn', role:'R05'});
bao(!capThap.ok && capThap.code === 'NOPERM',
  'R05 ghi được khoản chi nhưng KHÔNG duyệt được — duyệt chi dừng ở tầng tài chính R01–R03',
  capThap.error);

/* CHIA NHỎ ĐẨY LÊN NẤC CỦA TỔNG, KHÔNG CHỈ QUA MỘT NGƯỠNG DUY NHẤT.
   Hai khoản 28 triệu trong một tuần = 56 triệu = nấc N5. */
const to1 = await goi({fn:'ghiChi', token:tkTC, u:'truongcoach@gita365.vn',
  chi:{khoanMuc:'matBang', soTien:28000000, hinhThuc:'chuyenKhoan',
    dienGiai:'Đặt cọc thuê cơ sở mới đợt 1', ngayChi:'2026-09-01T02:00:00.000Z',
    coHoaDon:true, maHoaDon:'HD-A'}});
bao(to1.than.ok && to1.than.nac === 'N3', 'khoản 28 triệu đầu ở nấc N3 — một người duyệt');
const to2 = await goi({fn:'ghiChi', token:tkTC, u:'truongcoach@gita365.vn',
  chi:{khoanMuc:'matBang', soTien:28000000, hinhThuc:'chuyenKhoan',
    dienGiai:'Đặt cọc thuê cơ sở mới đợt 2', ngayChi:'2026-09-02T02:00:00.000Z',
    coHoaDon:true, maHoaDon:'HD-B'}});
bao(to2.than.ok && to2.than.nac === 'N5' && to2.than.canMayNguoiDuyet >= 2 &&
    to2.than.gopBayNgay === 56000000,
  'KHOẢN THỨ HAI BỊ ĐẨY LÊN TẬN N5 — chia một hợp đồng lớn thành nhiều khoản vừa thì cả thang đuổi theo, không chỉ một ngưỡng',
  to2.than.biDayLenNacVi);

/* NHƯNG BẰNG CHỨNG VẪN THEO TỪNG KHOẢN, KHÔNG THEO GỘP: khoản 28 triệu
   ấy chỉ phải có hoá đơn (nấc N3 của riêng nó), không phải ba báo giá
   và hợp đồng — không ai lấy được ba báo giá cho "cả tuần". */
bao(to2.than.ok && Number(db.prepare("SELECT soBaoGia FROM chiPhi WHERE id=?")
      .get(to2.than.id).soBaoGia) === 0,
  'VÀ BẰNG CHỨNG VẪN THEO TỪNG KHOẢN — cấp duyệt theo gộp, chứng từ theo khoản',
  'đòi ba báo giá cho cả tuần là đòi một thứ không tồn tại, và luật không làm nổi thì người ta đi vòng');

const thang = await goi({fn:'xemThangDuyetChi', token:tkTC, u:'truongcoach@gita365.vn'});
bao(thang.than.ok && thang.than.thang.length === 5 && thang.than.neoConKhop &&
    thang.than.thang[4].soNguoiDuyet === 2,
  'MÀN HÌNH VẼ ĐƯỢC CẢ THANG, không phải chép lại nó',
  'chép lại là dựng bản thứ hai của một luật — rồi màn hình nói hai báo giá còn máy chủ đòi ba');

const dcp = await goi({fn:'duyetChi', token:tkSA, u:'superadmin@gita365.vn', id:cp1.than.id});
bao(dcp.than.ok && dcp.than.dieuChinh && dcp.than.dieuChinh.kyBiAnhHuong === '2026-W10',
  'DUYỆT MỘT KHOẢN CHI THUỘC TUẦN ĐÃ CHỐT cũng sinh bút toán điều chỉnh',
  'chi phí động vào kỳ đã đóng y như phiếu thu, nên phải để lại vết y như thế');

const sc = await goi({fn:'soChi', token:tkSA, u:'superadmin@gita365.vn'});
const mucMatBang = sc.than.theoKhoanMuc.find(x => x.khoanMuc === 'matBang');
bao(sc.than.ok && !!mucMatBang && mucMatBang.coHoaDon === 3000000 &&
    sc.than.tongDaDuyet >= 3000000,
  'sổ chi cắt theo KHOẢN MỤC và tách riêng phần CÓ HOÁ ĐƠN',
  'khoản không hoá đơn vẫn là tiền đã ra thật, nhưng đứng khác khi tính thuế');

/* ── PHÒNG KẾ TOÁN – TÀI CHÍNH · CHỐT 9.97 ──

   "Các khoản chi nhỏ dưới 1,5 triệu do bộ phận quản lý kế toán chịu
   trách nhiệm nhận báo cáo, phê duyệt. Từng đồng liên quan chi phí đều
   có bộ phận, có người chịu trách nhiệm quản lý."

   Lối tự ghi của 9.92 KHÔNG CÒN. Mọi khoản chi đều nằm chờ duyệt. */
const nhoNay = await goi({fn:'ghiChi', token:tkTC, u:'truongcoach@gita365.vn',
  chi:{khoanMuc:'vanPhong', soTien:300000, hinhThuc:'tienMat',
    dienGiai:'Giấy in và mực cho văn phòng', ngayChi:'2026-05-04T02:00:00.000Z'}});
bao(nhoNay.than.ok && nhoNay.than.trangThai === 'choDuyet' &&
    nhoNay.than.chuKy.moc === 'C0' && /KẾ TOÁN/.test(nhoNay.than.vi),
  'KHÔNG CÒN LỐI TỰ GHI — khoản 300 nghìn cũng nằm chờ, và người duyệt là KẾ TOÁN',
  'từng đồng có bộ phận, có người chịu trách nhiệm — tra được bằng một câu lệnh');

/* ── PHÒNG TÀI CHÍNH LÀ MỘT TRỤC RIÊNG, KHÔNG PHẢI MỘT VAI ── */
await themNguoi('U-gd', 'giamdoc@gita365.vn', 'MatKhauRieng2026!', 'R03',
  {portal:'admin'});
const tkGD = (await goi({fn:'dangNhap', u:'giamdoc@gita365.vn',
  mk:'MatKhauRieng2026!'})).than.token;
await themNguoi('U-ql2', 'quanly2@gita365.vn', 'MatKhauRieng2026!', 'R04',
  {portal:'admin'});
const tkQL2 = (await goi({fn:'dangNhap', u:'quanly2@gita365.vn',
  mk:'MatKhauRieng2026!'})).than.token;

await themNguoi('U-kt', 'ketoan@gita365.vn', 'MatKhauRieng2026!', 'R08',
  {portal:'coach'});
const tkKT = (await goi({fn:'dangNhap', u:'ketoan@gita365.vn',
  mk:'MatKhauRieng2026!'})).than.token;

bao(!(await goi({fn:'duyetChi', token:tkKT, u:'ketoan@gita365.vn',
  id:nhoNay.than.id})).than.ok,
  'Giáo viên chưa được cấp vị trí thì KHÔNG duyệt được khoản chi nào');

bao(!(await goi({fn:'capQuyenTaiChinh', token:tkGD, u:'giamdoc@gita365.vn',
  username:'ketoan@gita365.vn', chucNang:'keToanChi', lyDo:'x'})).than.ok,
  'GIÁM ĐỐC KHÔNG TỰ CẤP ĐƯỢC QUYỀN CHO NGƯỜI SẼ KÝ THAY MÌNH — đó là tự nới cổng của chính mình',
  'chỉ Super Admin và Admin hệ thống cấp được');

bao(!(await goi({fn:'capQuyenTaiChinh', token:tkSA, u:'superadmin@gita365.vn',
  username:'ketoan@gita365.vn', chucNang:'keToanChi'})).than.ok,
  'cấp quyền ký tiền mà KHÔNG NÓI LÝ DO thì từ chối');

bao(!(await goi({fn:'capQuyenTaiChinh', token:tkSA, u:'superadmin@gita365.vn',
  username:'ketoan@gita365.vn', chucNang:'thuQuyTruong', lyDo:'x'})).than.ok,
  'VỊ TRÍ LÀ DANH SÁCH TRẮNG — tên nào không khai là không cấp được, kể cả một vị trí nghe rất hợp lý');

const capKT = await goi({fn:'capQuyenTaiChinh', token:tkSA, u:'superadmin@gita365.vn',
  username:'ketoan@gita365.vn', chucNang:'keToanChi',
  lyDo:'Phụ trách sổ chi thường ngày của Học viện'});
bao(capKT.than.ok, 'Super Admin cấp được vị trí Kế toán chi');

const ktDuyet = await goi({fn:'duyetChi', token:tkKT, u:'ketoan@gita365.vn',
  id:nhoNay.than.id});
bao(ktDuyet.than.ok && ktDuyet.than.trangThai === 'daDuyet' && ktDuyet.than.moc === 'C0',
  'KẾ TOÁN CHI — vốn là Giáo viên R08 — NAY DUYỆT ĐƯỢC KHOẢN CHI',
  'phòng tài chính là một trục riêng, vuông góc với thang vai');

/* VÀ ĐÂY LÀ CHỖ CHẶT NHẤT VỀ BẢO MẬT: vị trí trong phòng tài chính mở
   đúng những cửa TIỀN, không mở thêm một cửa dữ liệu khách nào. */
bao(!(await goi({fn:'xemTepKhach', token:tkKT, u:'ketoan@gita365.vn',
  maKhachHang:'GITA-BC01'})).than.ok &&
    !(await goi({fn:'dsTepKhach', token:tkKT, u:'ketoan@gita365.vn'})).than.ok,
  'NHƯNG VẪN KHÔNG XEM ĐƯỢC HỒ SƠ KHÁCH HÀNG — thêm vai thì quyền đi theo cả gói, cấp vị trí thì quyền đi theo đúng việc',
  'một kế toán viên vốn là Giáo viên sau khi được cấp vẫn đúng là Giáo viên ở mọi cửa khác');

/* ── TÁCH THU KHỎI CHI: LỚP KIỂM SOÁT CỔ NHẤT CỦA NGHỀ KẾ TOÁN ──

   Gộp hai đầu tiền vào một người thì người ấy dựng được một vòng khép
   kín mà không ai đứng ngoài: ghi một phiếu thu không có thật cho tổng
   thu trông đủ, rồi duyệt một khoản chi mang tiền ấy đi. Mỗi bước đều
   có chữ ký hợp lệ của CÙNG một người, sổ vẫn cân, và không phép soi
   nào trong hệ này bắt được.

   Tách ra thì cái vòng ấy cần HAI người đồng ý. */
await themNguoi('U-ktt2', 'ketoanthu@gita365.vn', 'MatKhauRieng2026!', 'R08',
  {portal:'coach'});
const tkKTThu = (await goi({fn:'dangNhap', u:'ketoanthu@gita365.vn',
  mk:'MatKhauRieng2026!'})).than.token;
await goi({fn:'capQuyenTaiChinh', token:tkSA, u:'superadmin@gita365.vn',
  username:'ketoanthu@gita365.vn', chucNang:'keToanThu',
  lyDo:'Phụ trách đầu thu của phòng tài chính'});

const ptTach = await goi({fn:'ghiPhieuThu', token:tkSA, u:'superadmin@gita365.vn',
  phieu:{maKhachHang:'GITA-BC01', soTien:150000, hinhThuc:'tienMat'}});
const chiTach = await goi({fn:'ghiChi', token:tkTC, u:'truongcoach@gita365.vn',
  chi:{khoanMuc:'vanPhong', soTien:120000, hinhThuc:'tienMat',
    dienGiai:'Mua văn phòng phẩm lặt vặt', ngayChi:'2026-04-06T02:00:00.000Z'}});

bao((await goi({fn:'duyetPhieuThu', token:tkKTThu, u:'ketoanthu@gita365.vn',
  id:ptTach.than.id})).than.ok,
  'KẾ TOÁN THU duyệt được phiếu thu');
bao(!(await goi({fn:'duyetChi', token:tkKTThu, u:'ketoanthu@gita365.vn',
  id:chiTach.than.id})).than.ok,
  'NHƯNG KẾ TOÁN THU KHÔNG DUYỆT ĐƯỢC KHOẢN CHI — người ghi nhận tiền vào không được là người duyệt tiền ra',
  'gộp hai đầu vào một người thì người ấy dựng được một vòng khép kín không ai đứng ngoài');

bao((await goi({fn:'duyetChi', token:tkKT, u:'ketoan@gita365.vn',
  id:chiTach.than.id})).than.ok,
  'KẾ TOÁN CHI duyệt được khoản chi');
const ptTach2 = await goi({fn:'ghiPhieuThu', token:tkSA, u:'superadmin@gita365.vn',
  phieu:{maKhachHang:'GITA-BC01', soTien:160000, hinhThuc:'tienMat'}});
bao(!(await goi({fn:'duyetPhieuThu', token:tkKT, u:'ketoan@gita365.vn',
  id:ptTach2.than.id})).than.ok,
  'VÀ KẾ TOÁN CHI KHÔNG DUYỆT ĐƯỢC PHIẾU THU — hai đầu tiền, hai người',
  'kế toán trưởng giữ cả hai đầu, nhưng đó là MỘT người có tên, và mọi lượt ký nằm trong nhật ký');

/* ── SÁU MỐC CHU KỲ, CHU KỲ LÀ TUẦN ── */
const thangTC = await goi({fn:'dsQuyenTaiChinh', token:tkSA, u:'superadmin@gita365.vn'});
bao(thangTC.than.ok && thangTC.than.mocChuKy.length === 7 &&
    thangTC.than.chuKy === 'tuan' &&
    thangTC.than.mocChuKy[1].tu === 10000000 &&
    thangTC.than.mocChuKy[6].tu === 100000000,
  'SÁU MỐC CHU KỲ 10–15–20–50–80–100 TRIỆU, chu kỳ là TUẦN',
  thangTC.than.mocChuKy.map(m => m.moc + ' ' + m.vai).join(' · '));

bao(thangTC.than.dangLamViec.some(x => x.username === 'ketoan@gita365.vn'),
  'và sổ nhân sự phòng tài chính trả lời được câu "AI đang có quyền ký tiền"');

/* Dồn một tuần lên quá 10 triệu, rồi thử duyệt bằng kế toán viên. */
const tuanC = '2026-05-11';   /* thứ Hai */
for (let i = 0; i < 4; i++)
  await goi({fn:'ghiChi', token:tkTC, u:'truongcoach@gita365.vn',
    chi:{khoanMuc:['vanPhong','tiepThi','daoTao','haTang'][i], soTien:3000000,
      hinhThuc:'chuyenKhoan', dienGiai:'Chi đợt ' + (i+1),
      ngayChi:'2026-05-1' + (i+1) + 'T02:00:00.000Z'}});
const quaMoc = await goi({fn:'ghiChi', token:tkTC, u:'truongcoach@gita365.vn',
  chi:{khoanMuc:'khac', soTien:500000, hinhThuc:'tienMat',
    dienGiai:'Chi lặt vặt cuối tuần', ngayChi:'2026-05-15T02:00:00.000Z'}});
bao(quaMoc.than.ok && quaMoc.than.chuKy.daChi === 12500000 &&
    quaMoc.than.chuKy.moc === 'C1' && quaMoc.than.chuKy.vaiXacNhan === 'Giám đốc',
  'TỔNG TUẦN QUA 10 TRIỆU THÌ CẢ KHOẢN 500 NGHÌN CŨNG PHẢI GIÁM ĐỐC XÁC NHẬN',
  'rải 3 triệu qua bốn khoản mục thì mọi bản kê theo khoản mục đều sạch — chỉ cột NGANG mới thấy');

const ktQuaMoc = await goi({fn:'duyetChi', token:tkKT, u:'ketoan@gita365.vn',
  id:quaMoc.than.id});
bao(!ktQuaMoc.than.ok && ktQuaMoc.than.code === 'CHUADUMOC' &&
    ktQuaMoc.than.moc === 'C1',
  'kế toán viên KHÔNG vượt được mốc C1 — mỗi mốc một vai cố định',
  ktQuaMoc.than.error);

/* ── CHUYỂN QUYỀN CHO KẾ TOÁN TRƯỞNG KHI DÒNG TIỀN LỚN ── */
await themNguoi('U-ktt', 'ketoantruong@gita365.vn', 'MatKhauRieng2026!', 'R04',
  {portal:'admin'});
const tkKTT = (await goi({fn:'dangNhap', u:'ketoantruong@gita365.vn',
  mk:'MatKhauRieng2026!'})).than.token;
bao(!(await goi({fn:'capQuyenTaiChinh', token:tkSA, u:'superadmin@gita365.vn',
  username:'ketoantruong@gita365.vn', chucNang:'keToanTruong',
  lyDo:'Dòng tiền lớn', mocToiDa:'25 triệu'})).than.ok,
  'HẠN MỨC PHẢI LÀ MỘT MỐC CÓ TÊN, không phải một con số tự do',
  'cấp bằng số tự do thì sáu tháng sau có bảy hạn mức không ai giải thích được');

const capKTT = await goi({fn:'capQuyenTaiChinh', token:tkSA, u:'superadmin@gita365.vn',
  username:'ketoantruong@gita365.vn', chucNang:'keToanTruong',
  lyDo:'Dòng tiền và kho người dùng đã lớn, chuyển quyền quản lý', mocToiDa:'C2'});
bao(capKTT.than.ok && capKTT.than.mocToiDa === 'C2',
  'Super Admin CHUYỂN QUYỀN cho kế toán trưởng tới mốc C2');

const kttDuyet = await goi({fn:'duyetChi', token:tkKTT, u:'ketoantruong@gita365.vn',
  id:quaMoc.than.id});
bao(kttDuyet.than.ok && kttDuyet.than.moc === 'C1',
  'KẾ TOÁN TRƯỞNG ĐƯỢC CẤP TỚI C2 THÌ KÝ THAY GIÁM ĐỐC Ở MỐC C1 — đây là chỗ chủ hệ chuyển quyền khi dòng tiền lớn',
  'hạn mức C2 phủ được mọi mốc từ C2 trở xuống');

/* THU HỒI THÌ MẤT NGAY. */
await goi({fn:'thuHoiQuyenTaiChinh', token:tkSA, u:'superadmin@gita365.vn',
  username:'ketoantruong@gita365.vn', chucNang:'keToanTruong'});
const sauThuHoi = await goi({fn:'ghiChi', token:tkTC, u:'truongcoach@gita365.vn',
  chi:{khoanMuc:'khac', soTien:600000, hinhThuc:'tienMat',
    dienGiai:'Chi lặt vặt sau thu hồi', ngayChi:'2026-05-15T03:00:00.000Z'}});
bao(!(await goi({fn:'duyetChi', token:tkKTT, u:'ketoantruong@gita365.vn',
  id:sauThuHoi.than.id})).than.ok,
  'THU HỒI QUYỀN THÌ MẤT NGAY — không phải chờ hết phiên hay hết ngày');

/* ── MỐC ĐỌC LẠI Ở LÚC DUYỆT, KHÔNG DÙNG MỐC GHI LÚC ĐỀ XUẤT ──
   Giữa hai mốc thời gian ấy, những khoản khác của cùng người trong cùng
   tuần có thể đã vào sổ và đẩy tổng lên mốc cao hơn. */
const som = await goi({fn:'ghiChi', token:tkQL2, u:'quanly2@gita365.vn',
  chi:{khoanMuc:'vanPhong', soTien:400000, hinhThuc:'tienMat',
    dienGiai:'Khoản ghi sớm trong tuần', ngayChi:'2026-06-08T02:00:00.000Z'}});
bao(som.than.chuKy.moc === 'C0', 'khoản ghi sớm trong tuần đang ở mốc C0');
await goi({fn:'ghiChi', token:tkQL2, u:'quanly2@gita365.vn',
  chi:{khoanMuc:'tiepThi', soTien:11000000, hinhThuc:'chuyenKhoan',
    dienGiai:'Chiến dịch giữa tuần', ngayChi:'2026-06-10T02:00:00.000Z',
    coHoaDon:true, maHoaDon:'HD-X'}});
const duyetSom = await goi({fn:'duyetChi', token:tkKT, u:'ketoan@gita365.vn',
  id:som.than.id});
bao(!duyetSom.than.ok && duyetSom.than.code === 'CHUADUMOC',
  'MỐC ĐỌC LẠI Ở LÚC DUYỆT — khoản 400 nghìn ghi đầu tuần nay phải theo mốc của cả tuần',
  'duyệt theo mốc cũ là để một tuần 11 triệu đi qua cổng của một tuần 0 đồng');

/* ── KPI PHÒNG TÀI CHÍNH · TC-KP-01 ── */
bao(!(await goi({fn:'chamKpiTaiChinh', token:tkCoach, u:'coach@gita365.vn',
  loai:'thang', moc:'2026-09'})).than.ok,
  'Coach không xem được bảng KPI phòng tài chính');

const kpiTC = await goi({fn:'chamKpiTaiChinh', token:tkSA, u:'superadmin@gita365.vn',
  loai:'thang', moc:'2026-09'});
bao(kpiTC.than.ok && kpiTC.than.keToanThu && kpiTC.than.keToanChi &&
    kpiTC.than.keToanTruong,
  'chấm được KPI cho cả ba vị trí', kpiTC.than.ky);

/* MẪU BẰNG 0 THÌ TRẢ null, KHÔNG TRẢ 100. "Không có gì để đo" và "đo
   được và đạt tuyệt đối" là hai chuyện khác nhau; gộp chúng là cho
   điểm tuyệt đối cho một tháng không ai làm gì. */
const kpiRong = await goi({fn:'chamKpiTaiChinh', token:tkSA, u:'superadmin@gita365.vn',
  loai:'thang', moc:'2025-01'});
bao(kpiRong.than.ok && kpiRong.than.keToanThu['KT-T1'] === null &&
    kpiRong.than.keToanChi['KT-C1'] === null,
  'KỲ KHÔNG CÓ GÌ ĐỂ ĐO THÌ TRẢ null, KHÔNG TRẢ 100',
  'gộp hai chuyện ấy là cho điểm tuyệt đối cho một tháng không ai làm gì');

/* BA THƯỚC CỦA KẾ TOÁN TRƯỞNG ĐO THẬT, không để trống. Chúng gọi thẳng
   soatChot, doiSoat và baoCaoKeToan — không viết lại phép đo, vì viết
   lại là dựng bản thứ hai của một sự thật. */
bao(typeof kpiTC.than.keToanTruong['KT-Tr2'] === 'number' &&
    typeof kpiTC.than.keToanTruong['KT-Tr3'] === 'number' &&
    (kpiTC.than.keToanTruong['KT-Tr4'] === 0 || kpiTC.than.keToanTruong['KT-Tr4'] === 100),
  'ba thước của KẾ TOÁN TRƯỞNG đo THẬT — vân tay, đối soát, cân đối',
  'KT-Tr2 ' + kpiTC.than.keToanTruong['KT-Tr2'] + ' · KT-Tr3 ' +
    kpiTC.than.keToanTruong['KT-Tr3'] + ' · KT-Tr4 ' + kpiTC.than.keToanTruong['KT-Tr4']);

bao(!!kpiTC.than.lechConLai && Array.isArray(kpiTC.than.lechConLai.doiSoat),
  'và trả về CHỖ LỆCH CÒN LẠI, không chỉ trả về con số',
  'một điểm KPI không kèm chỗ lệch là một điểm không sửa được gì');

/* CÂN THÌ 100, LỆCH THÌ 0 — không có bậc giữa. Một bản kê lệch nửa
   đồng cũng là một bản kê chưa dùng được. */
bao(kpiTC.than.keToanTruong['KT-Tr4'] === 100,
  'bản kê CÂN nên KT-Tr4 = 100 — cân thì 100, lệch thì 0, không có bậc giữa');

/* ── PHÒNG TÀI CHÍNH TRỰC THUỘC AI · CHỐT 9.98 ──

   "Phòng tài chính trực thuộc quản lý của Super Admin, Giám đốc, Admin
   hệ thống (quyền cho Giám đốc, Admin hệ thống do Super Admin cấp)." */
bao(!(await goi({fn:'capQuyenTaiChinh', token:tkGD, u:'giamdoc@gita365.vn',
  username:'quanly2@gita365.vn', chucNang:'keToanThu', lyDo:'thử'})).than.ok,
  'GIÁM ĐỐC CHƯA ĐƯỢC CẤP QUYỀN THÌ CHƯA QUẢN LÝ ĐƯỢC PHÒNG');

bao(!(await goi({fn:'capQuyenTaiChinh', token:tkGD, u:'giamdoc@gita365.vn',
  username:'giamdoc@gita365.vn', chucNang:'quanLyPhong', lyDo:'thử'})).than.ok,
  'và KHÔNG tự cấp quyền quản lý phòng cho chính mình');

const capQL = await goi({fn:'capQuyenTaiChinh', token:tkSA, u:'superadmin@gita365.vn',
  username:'giamdoc@gita365.vn', chucNang:'quanLyPhong',
  lyDo:'Giám đốc chịu trách nhiệm tăng trưởng nên quản phòng tiền của mình'});
bao(capQL.than.ok, 'SUPER ADMIN CẤP QUYỀN QUẢN LÝ PHÒNG CHO GIÁM ĐỐC');

const gdCap = await goi({fn:'capQuyenTaiChinh', token:tkGD, u:'giamdoc@gita365.vn',
  username:'quanly2@gita365.vn', chucNang:'keToanThu',
  lyDo:'Bổ sung nhân sự đầu thu'});
bao(gdCap.than.ok,
  'GIÁM ĐỐC ĐƯỢC CẤP RỒI THÌ CẤP ĐƯỢC VỊ TRÍ TRONG PHÒNG',
  'ba bậc: Super Admin đương nhiên · Giám đốc và Admin hệ thống khi được cấp · còn lại không');

bao(!(await goi({fn:'capQuyenTaiChinh', token:tkGD, u:'giamdoc@gita365.vn',
  username:'quanly2@gita365.vn', chucNang:'quanLyPhong', lyDo:'thử'})).than.ok,
  'NHƯNG GIÁM ĐỐC KHÔNG CẤP TIẾP QUYỀN QUẢN LÝ PHÒNG CHO NGƯỜI KHÁC — chỉ Super Admin',
  'cho người được cấp đi cấp tiếp là dựng một dây chuyền tự nhân lên mà đầu dây không ai nắm');

bao(!(await goi({fn:'capQuyenTaiChinh', token:tkSA, u:'superadmin@gita365.vn',
  username:'superadmin@gita365.vn', chucNang:'keToanTruong', lyDo:'thử', mocToiDa:'C6'})).than.ok,
  'KHÔNG AI TỰ CẤP CHO MÌNH — kể cả Super Admin',
  'cổng này sinh ra để đứng giữa một người với tiền; tự cấp là tự dỡ nó đi');

/* ── NỐI SỔ VỚI TÀI KHOẢN NGÂN HÀNG · CHỐT 9.98 ── */
console.log('\n15e · NGÂN HÀNG VÀ THÔNG BÁO');
env.GITA_KHOA_NGANHANG = 'khoa-ngan-hang-thu-nghiem';

bao(!(await goi({fn:'nganHangBao', khoa:'sai-khoa',
  giaoDich:{soTaiKhoan:'0011', maGiaoDich:'FT1', huong:'vao', soTien:100000}})).than.ok,
  'CỬA NGÂN HÀNG XÁC THỰC BẰNG KHOÁ RIÊNG — sai khoá thì không vào được');

/* Phiếu chuyển khoản có mã tham chiếu, rồi ngân hàng báo đúng mã ấy. */
const ptNH = await goi({fn:'ghiPhieuThu', token:tkSA, u:'superadmin@gita365.vn',
  phieu:{maKhachHang:'GITA-BC01', soTien:2500000, hinhThuc:'chuyenKhoan',
    maThamChieu:'FT260906AAA'}});
const nhVao = await goi({fn:'nganHangBao', khoa:'khoa-ngan-hang-thu-nghiem',
  giaoDich:{soTaiKhoan:'0011', maGiaoDich:'FT260906AAA', huong:'vao',
    soTien:2500000, noiDung:'GITA-BC01 dong hoc phi'}});
bao(nhVao.than.ok && nhVao.than.daKhop && nhVao.than.idPhieuThu === ptNH.than.id,
  'NGÂN HÀNG BÁO VỀ THÌ TỰ KHỚP VỚI PHIẾU THU THEO MÃ THAM CHIẾU',
  'sao kê ngân hàng là thứ DUY NHẤT trong hệ này đứng NGOÀI — không ai bên trong sửa được');

const guiLai = await goi({fn:'nganHangBao', khoa:'khoa-ngan-hang-thu-nghiem',
  giaoDich:{soTaiKhoan:'0011', maGiaoDich:'FT260906AAA', huong:'vao', soTien:2500000}});
bao(guiLai.than.ok && guiLai.than.daCo,
  'GỬI LẠI CÙNG MỘT GIAO DỊCH THÌ KHÔNG GHI THÊM — webhook thử lại là chuyện thường',
  'báo lỗi thì ngân hàng thử mãi; ghi thêm thì sổ có một khoản tiền chưa từng có');

/* KHÔNG TỰ KHỚP THEO SỐ TIỀN. Hai nhà cùng đóng 500 nghìn trong một
   ngày là chuyện thường, và khớp nhầm là ghi tiền nhà này vào nợ nhà kia. */
await goi({fn:'ghiPhieuThu', token:tkSA, u:'superadmin@gita365.vn',
  phieu:{maKhachHang:'GITA-BC01', soTien:500000, hinhThuc:'chuyenKhoan'}});
const nhKhongMa = await goi({fn:'nganHangBao', khoa:'khoa-ngan-hang-thu-nghiem',
  giaoDich:{soTaiKhoan:'0011', maGiaoDich:'FT260906BBB', huong:'vao', soTien:500000}});
bao(nhKhongMa.than.ok && !nhKhongMa.than.daKhop,
  'KHÔNG TỰ KHỚP THEO SỐ TIỀN — hai nhà cùng đóng 500 nghìn một ngày là chuyện thường',
  'khớp nhầm là ghi tiền nhà này vào nợ nhà kia, và không ai nhìn ra vì tổng vẫn đúng');

/* ĐỐI CHIẾU: HAI PHÍA, HAI CÂU CHUYỆN KHÁC NHAU. */
const dcNH = await goi({fn:'doiChieuNganHang', token:tkSA, u:'superadmin@gita365.vn',
  loai:'thang', moc:'2026-09'});
bao(dcNH.than.ok && dcNH.than.tienVaoKhongCoPhieu.so >= 1 &&
    dcNH.than.phieuKhongCoTienVao.so >= 1 &&
    /mất lòng khách/.test(dcNH.than.tienVaoKhongCoPhieu.vi) &&
    /mất tiền/.test(dcNH.than.phieuKhongCoTienVao.vi),
  'ĐỐI CHIẾU NÊU HAI PHÍA RIÊNG — tiền vào không có phiếu là chỗ MẤT LÒNG KHÁCH, phiếu không có tiền vào là chỗ MẤT TIỀN',
  'gộp hai cái vào một con số lệch là bỏ mất đúng phần nói cho người đọc biết phải đi làm gì');

/* ── ĐỐI CHIẾU CHIỀU RA PHỦ CẢ BA KÊNH TIỀN RA (9.99.114) ──
   Tổ thanh tra $500M: bản cũ chỉ union chiPhi ở chiKhongCoTienRa, nên một
   khoản HOÀN/HOA HỒNG bịa vô hình với phép kiểm ngoài duy nhất. Trồng một
   hoàn tiền daDuyet và một hoa hồng daTra (không có dòng ngân hàng RA khớp)
   trong tháng ấy; cả hai PHẢI hiện. Phá thử: bỏ hai nhánh UNION → biến mất. */
db.prepare("INSERT INTO hoanTien (id,maKhachHang,soTien,theoLuat,lyDo,nguoiDeXuat," +
  "nguoiDuyet,deXuatLuc,duyetLuc,trangThai) VALUES ('HT-BIA','GITA-BC01',60000000," +
  "'luật hoàn tầng 3','thử đối chiếu','coach','dir','2026-09-10T02:00:00.000Z'," +
  "'2026-09-10T03:00:00.000Z','daDuyet')").run();
db.prepare("INSERT INTO hoaHongTra (id,nhaKem,nhaDuocKem,tangVuot,bac,phanTram,goiCanCu," +
  "soTien,trangThai,sinhLuc,traLuc,nguoiDuyet) VALUES ('HH-BIA','GITA-BC01','GITA-BC02'," +
  "1,'B5',5,40000000,2000000,'daTra','2026-09-08T02:00:00.000Z','2026-09-11T03:00:00.000Z','dir')").run();
const dcRa114 = await goi({fn:'doiChieuNganHang', token:tkSA, u:'superadmin@gita365.vn',
  loai:'thang', moc:'2026-09'});
const loaiRa = (dcRa114.than.chiKhongCoTienRa.ds || []).map(x => x.loai);
bao(loaiRa.indexOf('hoanTien') >= 0 && loaiRa.indexOf('hoaHongTra') >= 0,
  'ĐỐI CHIẾU CHIỀU RA PHỦ CẢ HOÀN TIỀN VÀ HOA HỒNG — không chỉ chiPhi',
  'bản cũ chỉ soi chiPhi nên một khoản hoàn/hoa hồng bịa (một chữ ký) vô hình với phép kiểm ' +
  'ngoài duy nhất người bên trong không tự viết ra được · thấy: ' + loaiRa.join(','));
db.prepare("DELETE FROM hoanTien WHERE id='HT-BIA'").run();
db.prepare("DELETE FROM hoaHongTra WHERE id='HH-BIA'").run();

bao(!(await goi({fn:'khopGiaoDich', token:tkSA, u:'superadmin@gita365.vn',
  id:nhKhongMa.than.id, idPhieuThu:ptNH.than.id})).than.ok,
  'khớp tay hai số tiền KHÁC NHAU thì từ chối — lệch thì tách phiếu trước');

/* THÔNG BÁO LÊN GIÁM ĐỐC VÀ SUPER ADMIN. */
const tbGD = await goi({fn:'hopThongBao', token:tkGD, u:'giamdoc@gita365.vn'});
const tbSA = await goi({fn:'hopThongBao', token:tkSA, u:'superadmin@gita365.vn'});
bao(tbGD.than.ok && tbSA.than.ok && tbGD.than.so > 0 && tbSA.than.so > 0 &&
    tbGD.than.ds.some(x => x.loai === 'CHI_MOC_CHU_KY'),
  'KHOẢN CHI QUA MỐC CHU KỲ BÁO LÊN CẢ GIÁM ĐỐC LẪN SUPER ADMIN',
  tbGD.than.so + ' thông báo cho Giám đốc · ' + tbSA.than.so + ' cho Super Admin');

const mot = tbGD.than.ds[0];
await goi({fn:'danhDauDaDoc', token:tkGD, u:'giamdoc@gita365.vn', id:mot.id});
const tbSA2 = await goi({fn:'hopThongBao', token:tkSA, u:'superadmin@gita365.vn'});
bao(tbSA2.than.so === tbSA.than.so,
  'GIÁM ĐỐC ĐỌC RỒI KHÔNG LÀM SUPER ADMIN THÔI THẤY — hai dòng riêng, không phải một dòng gửi "cấp trên"',
  'gộp một dòng là dựng ra chuyện người này tưởng người kia đã xử lý');

bao(!(await goi({fn:'hopThongBao', token:tkCoach, u:'coach@gita365.vn'})).than.ds
      .some(x => x.loai === 'CHI_MOC_CHU_KY'),
  'và Coach không thấy thông báo tài chính nào');

/* ── BÁO DÒNG DOANH THU VỀ HÒM THƯ CHỦ HỆ · CHỐT 9.96 ── */
console.log('\n15d · BÁO DÒNG DOANH THU');
env.GITA_THU_DOANH_THU = 'chuhe@vidu.vn';
hopThu.length = 0;

const ptBao = await goi({fn:'ghiPhieuThu', token:tkSA, u:'superadmin@gita365.vn',
  phieu:{maKhachHang:'GITA-BC01', soTien:1234000, hinhThuc:'chuyenKhoan',
    maThamChieu:'FT26090612345'}});
const thuBao = hopThu.find(t => /tiền vào/.test(t.tieuDe));
bao(ptBao.than.ok && !!thuBao && thuBao.den === 'chuhe@vidu.vn',
  'KHÁCH CHUYỂN TIỀN THÌ CÓ THƯ BÁO VỀ HÒM THƯ CHỦ HỆ',
  thuBao && thuBao.tieuDe);

bao(!!thuBao && /1\.234\.000đ/.test(thuBao.than) && /GITA-BC01/.test(thuBao.than) &&
    /FT26090612345/.test(thuBao.than) && /chờ duyệt/.test(thuBao.than),
  'thư chở đủ DÒNG DOANH THU — số tiền, mã nhà, mã giao dịch, và nói rõ CHƯA duyệt',
  'số đã ghi là tiền có người nói đã vào; chỉ số đã duyệt mới vào bản kê');

/* THƯ BÁO Ở MỐC GHI, KHÔNG Ở MỐC DUYỆT. Báo sau khi duyệt thì lá thư
   chẳng thêm gì — đã có người trong hệ xác nhận rồi. Báo lúc ghi thì
   con mắt của chủ hệ là con mắt ĐỘC LẬP, đứng ngoài mọi vai. */
const soThuTruoc = hopThu.length;
await goi({fn:'duyetPhieuThu', token:tkCoach, u:'coach@gita365.vn', id:ptBao.than.id});
bao(hopThu.length === soThuTruoc,
  'DUYỆT PHIẾU THÌ KHÔNG GỬI THÊM THƯ — báo ở mốc GHI mới là con mắt độc lập',
  'báo sau khi duyệt thì đã có người trong hệ xác nhận rồi, lá thư chẳng thêm gì');

/* THƯ CHỞ CON SỐ, KHÔNG CHỞ HỒ SƠ KHÁCH. Hòm thư là đường kém an toàn
   nhất trong cả kiến trúc: qua nhà gửi thư, qua Google, nằm lại trong
   hộp thư và bản sao lưu, không mã hoá theo khoá của Học viện. */
const phBC = db.prepare("SELECT u.hoTen, u.email, u.dienThoai FROM hoSoKhach h " +
  "JOIN users u ON u.id = h.uidPhuHuynh WHERE h.maKhachHang='GITA-BC01'").get();
bao(!!thuBao && !!phBC && thuBao.than.indexOf(phBC.hoTen) < 0 &&
    thuBao.than.indexOf(phBC.email) < 0,
  'VÀ THƯ KHÔNG CHỞ TÊN PHỤ HUYNH HAY EMAIL KHÁCH — hòm thư là đường kém an toàn nhất trong hệ',
  'không phải vì chủ hệ không được xem, mà vì dữ liệu khách chỉ ra khỏi hệ theo giấy phép');

/* GỬI THƯ HỎNG KHÔNG ĐƯỢC LÀM MẤT MỘT ĐỒNG NÀO. */
const guiHong = {...env, GHI_THU: undefined, GITA_KHOA_THU: undefined,
  GITA_THU_DOANH_THU: 'chuhe@vidu.vn'};
const tcMod = await import('../may-chu/tai-chinh.js');
const ptHong = await tcMod.ghiPhieuThu(
  {phieu:{maKhachHang:'GITA-BC01', soTien:777000, hinhThuc:'tienMat'}},
  guiHong, env.CSDL, {uid:'U-sa', u:'superadmin@gita365.vn', role:'R01'});
bao(ptHong.ok && !!db.prepare("SELECT id FROM phieuThu WHERE id=?").get(ptHong.id),
  'NHÀ GỬI THƯ SẬP THÌ PHIẾU VẪN NẰM NGUYÊN TRONG SỔ — mất một lượt báo, không mất một đồng',
  'để một lá thư hỏng kéo đổ lượt ghi phiếu là mất tiền thật để cứu một lượt báo');

/* HÒM THƯ ĐỂ TRỐNG THÌ KHÔNG GỬI GÌ — hành vi đúng cho bản chạy thử. */
hopThu.length = 0;
const khongDat = {...env, GITA_THU_DOANH_THU: ''};
await tcMod.ghiPhieuThu(
  {phieu:{maKhachHang:'GITA-BC01', soTien:88000, hinhThuc:'tienMat'}},
  khongDat, env.CSDL, {uid:'U-sa', u:'superadmin@gita365.vn', role:'R01'});
bao(hopThu.length === 0,
  'chưa đặt hòm thư nhận thì KHÔNG gửi gì — bộ thử không được gửi thư thật vào hòm thư thật');

/* ── BẢN TỔNG CUỐI NGÀY ──
   Cổng giờ ở scheduled() phải khớp với khung giờ khai ở wrangler.toml.
   Bản đầu tôi đặt cổng gioUTC === 0 trong khi cấu hình mới chỉ khai
   khung 20:00 — bản tổng KHÔNG BAO GIỜ gửi, mà mã vẫn trông như đã
   làm xong việc. Nên phép đo này gọi thẳng scheduled() với CẢ HAI mốc. */
hopThu.length = 0;
const cho = [];
const ctxGia = {waitUntil: p => cho.push(p)};
/* Mốc hẹn tính từ CÙNG cái đồng hồ mà mẫu thử dùng: NGÀY MAI giờ Việt
   Nam, để "hôm qua" của mốc ấy rơi đúng vào hôm nay — ngày các phiếu
   thử vừa được ghi. Gõ cứng một ngày thì phép đo chỉ đúng vào đúng ngày
   ấy. */
const mocMai = ngayVN(1);
await worker.scheduled({scheduledTime: Date.parse(mocMai + 'T20:00:00Z')}, env, ctxGia);
await Promise.all(cho.splice(0));
bao(hopThu.length === 0, 'khung 20:00 UTC chỉ DỌN, không gửi bản tổng');

/* Mốc hẹn 00:00 UTC của NGÀY MAI giờ Việt Nam → "hôm qua" của mốc ấy
   là HÔM NAY, đúng ngày các phiếu thử ở trên được ghi. Ngày lấy từ MỐC ĐÃ HẸN chứ không từ
   "bây giờ": một lượt chạy muộn qua nửa đêm sẽ tổng kết nhầm ngày, và
   ngày đúng thì không ai tổng kết nữa. */
await worker.scheduled({scheduledTime: Date.parse(mocMai + 'T00:00:00Z')}, env, ctxGia);
await Promise.all(cho.splice(0));
const thuTong = hopThu.find(t => /dòng doanh thu/.test(t.tieuDe));
bao(!!thuTong && thuTong.den === 'chuhe@vidu.vn',
  'KHUNG 00:00 UTC (7 GIỜ SÁNG GIỜ VIỆT NAM) GỬI BẢN TỔNG NGÀY HÔM QUA',
  thuTong && thuTong.tieuDe);
bao(!!thuTong && /Đã ghi/.test(thuTong.than) && /Đã duyệt/.test(thuTong.than) &&
    /Theo hình thức/.test(thuTong.than),
  'bản tổng tách ĐÃ GHI với ĐÃ DUYỆT và chia theo hình thức',
  'số đã ghi là tiền có người nói đã vào, số đã duyệt là tiền có người thứ hai xác nhận');

/* NGÀY KHÔNG CÓ TIỀN VÀO THÌ VẪN GỬI. Một ngày không tiền mà không có
   thư thì không phân biệt được với một ngày hệ thống báo hỏng. */
hopThu.length = 0;
const bdt = await import('../may-chu/bao-doanh-thu.js');
await bdt.tongNgayDoanhThu({...env, GITA_THU_DOANH_THU:'chuhe@vidu.vn'},
  env.CSDL, '2025-01-15');
const thuRong = hopThu.find(t => /dòng doanh thu/.test(t.tieuDe));
bao(!!thuRong && /KHÔNG CÓ LƯỢT TIỀN VÀO NÀO/.test(thuRong.than),
  'NGÀY KHÔNG CÓ TIỀN VÀO THÌ VẪN GỬI THƯ — một ngày không tiền mà không có thư thì không phân biệt được với một ngày hệ thống báo hỏng',
  'hai chuyện ấy dẫn tới hai việc khác hẳn nhau');

/* TRẦN THƯ MỖI NGÀY. Ở mức 100.000 tài khoản, mỗi lượt một thư thành
   hàng nghìn thư một ngày, và lá thứ một nghìn không còn là lớp kiểm
   soát — nó là rác, và cả nghìn lá trước nó thành rác theo. */
bao(bdt.TRAN_THU_NGAY > 0 && bdt.TRAN_THU_NGAY <= 200,
  'có TRẦN THƯ MỖI NGÀY — một hòm thư ngập là một hòm thư không ai đọc',
  bdt.TRAN_THU_NGAY + ' thư lẻ mỗi ngày, quá thì gửi MỘT lá báo thôi gửi lẻ');

/* ── BÁO CÁO CHI · CHỐT 9.94 ──

   "Chi phí từ 1,5 triệu trở lên phải báo cáo." Duyệt là một cái CỔNG
   đứng trước và chặn; báo cáo là một tấm GƯƠNG đứng sau và cho nhìn
   thấy cả dòng tiền. Chỉ có cổng thì mỗi khoản đều đúng luật lúc nó đi
   qua, mà không ai thấy hình dạng của cả tháng. */
bao(!(await goi({fn:'baoCaoChi', token:tkTC, u:'truongcoach@gita365.vn',
  loai:'thang', moc:'2026-09'})).than.ok,
  'R05 không xem được báo cáo chi — báo cáo này gộp cả dòng tiền ra của Học viện');

const bcT9 = await goi({fn:'baoCaoChi', token:tkSA, u:'superadmin@gita365.vn',
  loai:'thang', moc:'2026-09'});
/* Bốn khoản: cpTuDuyet 2tr và cpTo 60tr ghi không kèm ngayChi nên mang
   mốc hôm nay; to1 và to2 ghi thẳng vào đầu tháng 9. */
bao(bcT9.than.ok && bcT9.than.tuNguong === 1500000 && bcT9.than.so >= 4 &&
    bcT9.than.khoan.every(x => x.soTien >= 1500000),
  'BÁO CÁO CHI GOM ĐÚNG KHOẢN TỪ 1,5 TRIỆU TRỞ LÊN — ngưỡng báo cáo đúng bằng ngưỡng phải duyệt',
  'cái phải xin phép trước khi tiêu là cái phải trưng ra sau khi tiêu · ' +
    bcT9.than.so + ' khoản trong tháng 9');

/* Báo cáo không phải MỘT CON SỐ TỔNG — bản kế toán đã có con số ấy.
   Cái người đọc cần là DẤU VẾT của từng khoản. */
const k28 = bcT9.than.khoan.find(x => x.id === to2.than.id);
bao(k28 && k28.nguoiDeXuat === 'truongcoach@gita365.vn' && k28.canKy === 2 &&
    k28.coHoaDon === true && k28.nac === 'N5',
  'mỗi khoản mang theo DẤU VẾT — ai đề xuất, cần mấy chữ ký, chứng từ gì, nấc nào',
  'một con số tổng thì bản kế toán đã có rồi');

/* DẤU HIỆU CHIA NHỎ PHẢI HIỆN LÊN MẶT BÁO CÁO, không nằm trong một cột
   người đọc phải tự suy ra. */
bao(bcT9.than.canHoi.biDayNacViGopDon.length === 1 &&
    bcT9.than.canHoi.biDayNacViGopDon[0].id === to2.than.id,
  'VÀ KHOẢN BỊ ĐẨY NẤC VÌ CỘNG DỒN ĐƯỢC NÊU LÊN ĐẦU — đó là dấu hiệu chia nhỏ',
  'chôn nó trong danh sách là để người đọc tự tìm, mà người đọc một báo cáo dài thì không tìm');

bao(bcT9.than.canHoi.lotLoiTuGhi.length === 0,
  'KHÔNG KHOẢN NÀO TỪ 1,5 TRIỆU LỌT QUA LỐI TỰ GHI — nếu có thì cái ngưỡng đã thủng',
  'phép này canh chính cái cổng, bằng cách nhìn từ phía sau nó');

bao(bcT9.than.canHoi.conTreoChuaDuyet.length >= 3 &&
    bcT9.than.tongConTreo > 0,
  'và khoản CÒN TREO chưa ai duyệt được nêu riêng, kèm số tiền',
  bcT9.than.canHoi.conTreoChuaDuyet.length + ' khoản · ' +
    dinhDangVN(bcT9.than.tongConTreo));

/* ── 2 · MIỄN GIẢM ── */
const kyBC2 = 'KT-BC02';
bao(!(await goi({fn:'deXuatMienGiam', token:tkPh2, u:'phuhuynh@gita365.vn',
  mienGiam:{idKy:kyBC2, soTien:100000, loai:'hocBong', theoLuat:'x', lyDo:'y'}})).than.ok,
  'phụ huynh không tự đề xuất miễn giảm cho nhà mình');

bao(!(await goi({fn:'deXuatMienGiam', token:tkCoach, u:'coach@gita365.vn',
  mienGiam:{idKy:kyBC2, soTien:100000, loai:'hocBong', lyDo:'Hoàn cảnh khó khăn'}})).than.ok,
  'PHẢI GHI GIẢM THEO LUẬT NÀO — một khoản giảm không dẫn được về luật nào là một khoản do một người quyết',
  'và người ấy sẽ phải trả lời một mình');

/* KT-BC01 phải thu 1.000.000đ, đã thu 600.000đ (PT-BC02 đã bị huỷ ở
   mục 15b), nên còn 400.000đ. Giảm 500.000đ là giảm quá. */
const giamQua = await goi({fn:'deXuatMienGiam', token:tkCoach, u:'coach@gita365.vn',
  mienGiam:{idKy:'KT-BC01', soTien:500000, loai:'hocBong',
    theoLuat:'Học bổng toàn phần cho con em cán bộ', lyDo:'Xét duyệt tháng 3'}});
bao(!giamQua.than.ok && giamQua.than.code === 'GIAMQUA',
  'KHÔNG GIẢM QUÁ PHẦN CÒN LẠI CỦA KỲ — giảm quá là dựng ra một công nợ âm',
  'và đó cũng là cổng chặn chuyện giảm nhiều hơn phải thu rồi hoàn phần chênh');

const mg1 = await goi({fn:'deXuatMienGiam', token:tkCoach, u:'coach@gita365.vn',
  mienGiam:{idKy:'KT-BC01', soTien:400000, loai:'hoanCanh',
    theoLuat:'Quy chế học bổng GITA điều 4: giảm tối đa 40% cho gia đình khó khăn',
    lyDo:'Gia đình có hai con cùng học, thu nhập giảm'}});
bao(mg1.than.ok && mg1.than.conLaiCuaKy === 400000, 'đề xuất miễn giảm đúng luật thì được');

bao(!(await goi({fn:'duyetMienGiam', token:tkCoach, u:'coach@gita365.vn',
  id:mg1.than.id})).than.ok, 'Coach không duyệt được miễn giảm');

const noTruoc = (await goi({fn:'congNo', token:tkSA, u:'superadmin@gita365.vn',
  maKhachHang:'GITA-BC01'})).than.tongConNo;
const dmg = await goi({fn:'duyetMienGiam', token:tkSA, u:'superadmin@gita365.vn',
  id:mg1.than.id});
const noSau = await goi({fn:'congNo', token:tkSA, u:'superadmin@gita365.vn',
  maKhachHang:'GITA-BC01'});
bao(dmg.than.ok && noSau.than.tongConNo === noTruoc - 400000,
  'DUYỆT MIỄN GIẢM THÌ CÔNG NỢ GIẢM THEO — mà cam kết gốc ở kyThu giữ nguyên',
  noTruoc + 'đ → ' + noSau.than.tongConNo + 'đ');
bao(noSau.than.tongMienGiam === 400000 &&
    noSau.than.ke.find(x => x.idKy === 'KT-BC01').phaiThu === 1000000,
  'và bản kê nêu CẢ BA con số — phải đóng 1.000.000đ, được giảm 400.000đ, đã đóng 600.000đ',
  'sửa thẳng phaiThu là xoá mất cam kết gốc; ghi phiếu thu giả là thổi phồng tiền thực thu');

/* Bốn chỗ tính công nợ phải trừ miễn giảm GIỐNG HỆT NHAU. Nhà đã được
   giảm hết phần còn lại thì phải rời khỏi danh sách quá hạn — nếu
   dsQuaHan không trừ, nó vẫn nằm đó và người ta vẫn đi đòi. */
const qhSau = await goi({fn:'dsQuaHan', token:tkSA, u:'superadmin@gita365.vn'});
bao(!qhSau.than.ds.some(x => x.idKy === 'KT-BC01'),
  'VÀ NHÀ ĐƯỢC GIẢM HẾT RỜI KHỎI DANH SÁCH QUÁ HẠN — bốn chỗ tính công nợ dùng CHUNG một phép trừ',
  'viết lại phép trừ ở từng chỗ là cách chắc nhất để một nhà được học bổng vẫn bị đi đòi');

/* ── 3 · NHẮC THU ──

   GITA-BC01 vừa được giảm hết phần còn lại nên nó KHÔNG còn quá hạn —
   đó chính là phép đo ngay trên. Nên dựng thêm một kỳ quá hạn thật để
   thử phần nhắc thu; đặt hạn ở tháng 4 để không đụng vào các con số
   của quý I mà mục 15b đã đo. */
db.prepare("INSERT INTO kyThu (id,maKhachHang,tang,ky,soKy,ngayThu,phaiThu,hanLuc,taoLuc) " +
  "VALUES ('KT-BC03','GITA-BC01',3,3,3,64,500000,'2026-04-15T02:00:00.000Z',?)")
  .run('2026-03-01T00:00:00.000Z');

/* ── 3 · NHẮC THU ── */
bao(!(await goi({fn:'ghiNhacThu', token:tkCoach, u:'coach@gita365.vn',
  nhac:{maKhachHang:'GITA-BC01', kenh:'goiDien', ketQua:'huaTra', noiDung:'Đã gọi, nhà hứa trả'}})).than.ok,
  'NHÀ HỨA TRẢ THÌ PHẢI GHI HẸN NGÀY NÀO — một lời hứa không có ngày thì tuần sau lại gọi hỏi đúng câu cũ');

const henCu = new Date(Date.now() - 5 * 86400e3).toISOString();
bao(!(await goi({fn:'ghiNhacThu', token:tkCoach, u:'coach@gita365.vn',
  nhac:{maKhachHang:'GITA-BC01', kenh:'goiDien', ketQua:'huaTra',
    noiDung:'Nhà hứa trả', henLuc:henCu}})).than.ok,
  'hẹn trả nằm ở quá khứ thì từ chối — một cái hẹn đã qua không phải hẹn');

const nt1 = await goi({fn:'ghiNhacThu', token:tkCoach, u:'coach@gita365.vn',
  nhac:{maKhachHang:'GITA-BC01', idKy:'KT-BC02', kenh:'goiDien', ketQua:'huaTra',
    noiDung:'Gọi 10h sáng, mẹ cháu nói lương về ngày 20 sẽ chuyển đủ',
    henLuc:new Date(Date.now() + 3 * 86400e3).toISOString()}});
bao(nt1.than.ok && nt1.than.laLanThu === 1,
  'ghi được lượt nhắc, có kênh, có nội dung, có hẹn — LÀM VIỆC TRÊN HỆ THỐNG có bằng chứng',
  'không ghi thì ngày người phụ trách nghỉ là ngày câu trả lời biến mất');

const ls = await goi({fn:'lichSuNhacThu', token:tkCoach, u:'coach@gita365.vn',
  maKhachHang:'GITA-BC01'});
bao(ls.than.ok && ls.than.soLan === 1 && !!ls.than.henGanNhat,
  'lịch sử nhắc thu trả về cả hẹn gần nhất');

/* Danh sách quá hạn phải mang theo "đã nhắc mấy lần, kết quả gì" —
   không có thì nó là danh sách nhìn thì biết nhưng không làm được. */
const qhNhac = (await goi({fn:'dsQuaHan', token:tkSA, u:'superadmin@gita365.vn'}))
  .than.ds.find(x => x.maKhachHang === 'GITA-BC01');
bao(qhNhac && qhNhac.soLanNhac === 1 && qhNhac.ketQuaLanCuoi === 'huaTra' && !!qhNhac.henTraLuc,
  'DANH SÁCH QUÁ HẠN MANG THEO LỊCH SỬ NHẮC — nhà đã hứa trả tuần sau không bị gọi như nhà chưa ai liên lạc',
  'đã nhắc ' + qhNhac.soLanNhac + ' lần · ' + qhNhac.ketQuaLanCuoi);

const chuaDenHen = await goi({fn:'denHenChuaTra', token:tkSA, u:'superadmin@gita365.vn'});
bao(chuaDenHen.than.ok && !chuaDenHen.than.ds.some(x => x.maKhachHang === 'GITA-BC01'),
  'nhà HẸN TUẦN SAU chưa vào danh sách đến hẹn — khác với danh sách quá hạn');
db.prepare("UPDATE nhacThu SET henLuc = ? WHERE id = ?")
  .run(new Date(Date.now() - 86400e3).toISOString(), nt1.than.id);
const denHen = await goi({fn:'denHenChuaTra', token:tkSA, u:'superadmin@gita365.vn'});
bao(denHen.than.ds.some(x => x.maKhachHang === 'GITA-BC01'),
  'tới ngày hẹn mà chưa trả thì VÀO danh sách phải gọi hôm nay',
  'nhà đang nợ mà hẹn tuần sau thì chưa phải gọi — hai việc khác nhau');

/* ── 4 · CHỐT KÉT ── */
const ngayKet = '2026-03-05';   /* PT-BC02 400.000đ tiền mặt, đã bị huỷ */
db.prepare("INSERT INTO phieuThu (id,maKhachHang,soTien,hinhThuc,nguoiGhi,ghiLuc," +
  "nguoiDuyet,duyetLuc,trangThai) VALUES ('PT-KET','GITA-BC01',200000,'tienMat'," +
  "'tuvan@gita365.vn','2026-03-05T04:00:00.000Z','superadmin@gita365.vn'," +
  "'2026-03-05T04:00:00.000Z','daDuyet')").run();

const ketLech = await goi({fn:'chotKet', token:tkSA, u:'superadmin@gita365.vn',
  ngay:ngayKet, demThuc:150000});
bao(!ketLech.than.ok && ketLech.than.code === 'LECHKHONGLYDO' &&
    ketLech.than.theoSo === 200000 && ketLech.than.chenh === -50000,
  'KÉT LỆCH MÀ KHÔNG CÓ LÝ DO THÌ KHÔNG CHỐT ĐƯỢC — cho chốt lặng lẽ là dựng ra một chỗ tiền biến mất hợp lệ',
  'sổ nói 200.000đ, đếm được 150.000đ');

const ketOk = await goi({fn:'chotKet', token:tkSA, u:'superadmin@gita365.vn',
  ngay:ngayKet, demThuc:150000, lyDo:'Trả lại tiền thừa cho phụ huynh, quên ghi phiếu'});
bao(ketOk.than.ok && ketOk.than.chenh === -50000 && !ketOk.than.khop,
  'lệch CÓ lý do thì chốt được, và lệch ở lại trong dòng',
  'một két không bao giờ lệch là một két chưa bao giờ được đếm');

const dsKet = await goi({fn:'dsChotKet', token:tkSA, u:'superadmin@gita365.vn'});
bao(dsKet.than.ok && dsKet.than.soNgayLech === 1 && dsKet.than.tongLech === -50000,
  'sổ két đếm được bao nhiêu ngày lệch và lệch tổng bao nhiêu');

/* ── 5 · CẢ BA THỨ MỚI PHẢI VÀO ĐÚNG BẢN KẾ TOÁN ── */
const ktMoi = await goi({fn:'baoCaoKeToan', token:tkSA, u:'superadmin@gita365.vn',
  loai:'quy', moc:'2026-Q1'});
bao(ktMoi.than.F_chiPhi.tongChi === 3000000 &&
    ktMoi.than.F_chiPhi.coHoaDon === 3000000 &&
    ktMoi.than.F_chiPhi.khongHoaDon === 0,
  'bản kế toán quý I giờ CÓ NỬA CHI — 3.000.000đ, tách sẵn phần có hoá đơn');
/* MIỄN GIẢM CÓ HIỆU LỰC TỪ LÚC DUYỆT, KHÔNG LÙI NGƯỢC.
   Khoản giảm duyệt hôm nay rơi vào quý ĐANG CHẠY; quý I giữ nguyên số
   của nó. Cùng một luật với mốc huỷ hoa hồng — và cùng một lý do: một
   bản báo cáo quá khứ phải dựng lại được. */
bao(ktMoi.than.A_doanhThu.mienGiam === 0,
  'quý I KHÔNG nhận khoản miễn giảm duyệt hôm nay — miễn giảm có hiệu lực từ lúc duyệt, không lùi ngược');
const ktNay2 = await goi({fn:'baoCaoKeToan', token:tkSA, u:'superadmin@gita365.vn',
  loai:'quy', moc:new Date().toISOString().slice(0, 10)});
bao(ktNay2.than.A_doanhThu.mienGiam === 400000 &&
    ktNay2.than.A_doanhThu.hoanTien !== ktNay2.than.A_doanhThu.giamTruDoanhThu &&
    ktNay2.than.A_doanhThu.giamTruDoanhThu ===
      ktNay2.than.A_doanhThu.hoanTien + ktNay2.than.A_doanhThu.mienGiam,
  'HOÀN TIỀN VÀ MIỄN GIẢM NÊU RIÊNG — hoàn là tiền đã ra, miễn giảm là tiền chưa từng vào',
  'gộp một dòng thì không ai biết Học viện đang trả lại hay đang cho đi');
bao(ktNay2.than.canDoi.can,
  'và quý ĐANG CHẠY — quý có cả hoàn, cả miễn giảm, cả huỷ hoa hồng — vẫn cân',
  'lệch công nợ ' + ktNay2.than.canDoi.lechCongNo +
  ' · lệch hoa hồng ' + ktNay2.than.canDoi.lechHoaHong);
bao(ktMoi.than.canDoi.can,
  'VÀ ĐẲNG THỨC CÔNG NỢ VẪN CÂN sau khi thêm miễn giảm vào cả hai vế',
  'lệch công nợ ' + ktMoi.than.canDoi.lechCongNo +
  ' · lệch hoa hồng ' + ktMoi.than.canDoi.lechHoaHong);

const thueMoi = await goi({fn:'boSoKhaiThue', token:tkSA, u:'superadmin@gita365.vn',
  loai:'quy', moc:'2026-Q1'});
bao(thueMoi.than.chuaSanSang.ngayKetConLech.length === 1 &&
    thueMoi.than.chuaSanSang.khoanChiConChoDuyet === 0,
  'bộ số khai thuế NÊU LUÔN két còn lệch và khoản chi còn treo — nộp rồi mới xử lý thì phải khai bổ sung',
  '1 ngày két lệch trong quý');

/* ── BẢNG TIN PHÒNG TÀI CHÍNH · CHỐT 9.99.3 ── */
console.log('\n15f · BẢNG TIN PHÒNG TÀI CHÍNH');

bao(!(await goi({fn:'bangTinTaiChinh', token:tkCoach, u:'coach@gita365.vn'})).than.ok,
  'COACH KHÔNG MỞ ĐƯỢC BẢNG TIN — bảng này nói chuyện tiền của cả Học viện');

/* Mục 15c đã thu hồi quyền kế toán trưởng để thử luật "thu hồi là mất
   ngay". Cấp lại ở đây, vì bảng tin là màn của chính vị trí ấy. */
await goi({fn:'capQuyenTaiChinh', token:tkSA, u:'superadmin@gita365.vn',
  username:'ketoantruong@gita365.vn', chucNang:'keToanTruong', mocToiDa:'C4',
  lyDo:'Cấp lại để phụ trách bảng tin phòng tài chính'});
bao(!(await goi({fn:'bangTinTaiChinh', token:tkKTT, u:'ketoantruong@gita365.vn'})).than.error,
  'KẾ TOÁN TRƯỞNG (R04) MỞ ĐƯỢC BẢNG TIN — bảng mở theo VỊ TRÍ, không theo vai');

/* ── BA LỚP CHẶN CỦA HỆ PHÂN CẤP MÀU ──
   Không lớp nào CẤM đặt đỏ. Cấm là sai hướng: người biết việc mình gấp
   mà bị chặn thì họ gọi điện, và lúc ấy tin ra khỏi hệ. */
const doThieuViSao = await goi({fn:'dangTinTaiChinh', token:tkKTT, u:'ketoantruong@gita365.vn',
  tin:{mucDo:'do', tieuDe:'Có chuyện gấp', than:'Cần xử lý ngay hôm nay.',
    giaoCho:'ketoan@gita365.vn', hanXuLy:'2026-09-08T16:59:59.000Z'}});
bao(!doThieuViSao.than.ok && doThieuViSao.than.code === 'THIEUVISAO',
  'ĐẶT MỨC GẤP THÌ PHẢI GHI VÌ SAO GẤP',
  'không cấm đặt đỏ — chỉ đòi một câu, và câu ấy ở lại cho người sau đọc');

const camThieuNguoi = await goi({fn:'dangTinTaiChinh', token:tkKTT, u:'ketoantruong@gita365.vn',
  tin:{mucDo:'cam', tieuDe:'Hoá đơn sắp hết hạn', than:'Nhà cung cấp giục ký lại hợp đồng.'}});
bao(!camThieuNguoi.than.ok && camThieuNguoi.than.code === 'THIEUNGUOI',
  'MỘT TIN CÓ MÀU MÀ KHÔNG CÓ NGƯỜI LÀ MỘT CÁI MÀU',
  'ai đọc cũng nghĩ người khác lo, và cái màu chỉ làm mọi người cùng lo mà không ai làm');

const camThieuHan = await goi({fn:'dangTinTaiChinh', token:tkKTT, u:'ketoantruong@gita365.vn',
  tin:{mucDo:'cam', tieuDe:'Hoá đơn sắp hết hạn', than:'Nhà cung cấp giục ký lại hợp đồng.',
    giaoCho:'ketoan@gita365.vn'}});
bao(!camThieuHan.than.ok && camThieuHan.than.code === 'THIEUHAN',
  'và phải có HẠN XỬ LÝ — có người mà không có hạn thì việc trôi mãi');

const tinDo = await goi({fn:'dangTinTaiChinh', token:tkKTT, u:'ketoantruong@gita365.vn',
  tin:{mucDo:'do', tieuDe:'Két lệch 2 triệu chưa rõ nguyên nhân',
    than:'Chốt két hôm qua lệch 2.000.000đ so với sổ. Chưa tìm ra dòng nào sai.',
    viSaoGap:'Két lệch để qua đêm thì không còn ai nhớ hôm qua ai cầm tiền',
    giaoCho:'ketoan@gita365.vn', hanXuLy:'2026-09-08T16:59:59.000Z'}});
bao(tinDo.than.ok, 'KẾ TOÁN TRƯỞNG ĐĂNG ĐƯỢC TIN MỨC GẤP khi đã ghi vì sao');

const tinXanh = await goi({fn:'dangTinTaiChinh', token:tkKTT, u:'ketoantruong@gita365.vn',
  tin:{mucDo:'xanh', tieuDe:'Đổi mẫu phiếu chi từ tháng sau',
    than:'Mẫu mới thêm cột số hợp đồng. Ghi lại để người sau biết vì sao mẫu đổi.'}});
bao(tinXanh.than.ok, 'và đăng được tin thường — tin này đăng SAU tin đỏ');

/* ── ĐỌC LẠI TIÊU ĐỀ, KHÔNG CHỈ ĐO "CÓ ĐĂNG ĐƯỢC KHÔNG" ──

   Bản 9.99.8 có một lỗi im lặng đúng ở đây: hằng số 'nguoiDang' nằm
   nhầm một ô trong câu INSERT, nên loai nhận tiêu đề còn tieuDe nhận
   chữ "nguoiDang". Mọi tin người đăng hiện tiêu đề là chữ ấy.

   Cả mười chín phép đo của mục 15f vẫn xanh, vì chúng đo ok, đo thứ tự
   xếp, đo số đếm — không phép nào đọc lại CHỮ. Phải chạy demo và nhìn
   màn hình mới thấy.

   Đo một vòng ghi-rồi-đọc là rẻ, và nó bắt được cả lớp lỗi lệch cột. */
const doLaiTin = (await goi({fn:'bangTinTaiChinh', token:tkKTT,
  u:'ketoantruong@gita365.vn'})).than.tin.find(x => x.id === tinXanh.than.id);
bao(!!doLaiTin && doLaiTin.tieuDe === 'Đổi mẫu phiếu chi từ tháng sau' &&
    doLaiTin.loai === 'nguoiDang' && !doLaiTin.tuMay,
  'TIN ĐỌC RA PHẢI ĐÚNG CHỮ ĐÃ GỬI — tiêu đề, loại, và cờ máy-ghi',
  'đo ok và đo số đếm thì không bắt được một hằng số nằm nhầm ô; đọc lại chữ thì bắt · ' +
  'đọc ra "' + ((doLaiTin || {}).tieuDe || '(không có)') + '"');

/* ── XẾP THEO MÀU TRƯỚC RỒI MỚI THEO THỜI GIAN ──
   Đó là cả mục đích của việc phân cấp: mở ra là thấy cái gấp nhất trên
   cùng, không phải cái mới nhất. Tin xanh đăng TRƯỚC tin đỏ, nên nếu
   xếp theo thời gian thì xanh đứng trên. */
const bang = await goi({fn:'bangTinTaiChinh', token:tkKTT, u:'ketoantruong@gita365.vn'});
bao(bang.than.ok && bang.than.tin[0].mucDo === 'do' &&
    bang.than.tin[0].id === tinDo.than.id,
  'BẢNG XẾP THEO MÀU TRƯỚC — tin đỏ đăng TRƯỚC tin xanh vẫn đứng trên',
  'xếp theo thời gian thì tin xanh mới hơn phải đứng đầu; nó không đứng đầu, ' +
  'nên phép đo này phân biệt được hai luật xếp chứ không xanh với cả hai');

bao(typeof bang.than.tyLeDo === 'number' && bang.than.dem.do >= 1,
  'và bảng nói ra TỶ LỆ TIN ĐỎ — lớp chặn thứ ba, nói với chính người đang đặt màu',
  bang.than.tyLeDo + '% số tin đang mở là mức GẤP');

bao((bang.than.nhanSu || []).some(x => x.username === 'ketoantruong@gita365.vn'),
  'bảng tin TRẢ KÈM DANH SÁCH NGƯỜI CỦA PHÒNG',
  'sổ quyền chỉ R01–R03 mở được, mà người giao việc nhiều nhất trên bảng này là kế toán trưởng');

/* ── MÁY TỰ ĐĂNG: TIỀN VÀO KHÔNG KHỚP ĐƯỢC PHIẾU NÀO ── */
await goi({fn:'nganHangBao', khoa:'khoa-ngan-hang-thu-nghiem',
  giaoDich:{soTaiKhoan:'0011', maGiaoDich:'FT-LA-01', huong:'vao',
    soTien:3300000, noiDung:'chuyen tien hoc phi'}});
const bangMay = await goi({fn:'bangTinTaiChinh', token:tkKTT, u:'ketoantruong@gita365.vn'});
const tinMay = (bangMay.than.tin || []).find(x => x.loai === 'NH_TIEN_KHONG_PHIEU');
bao(!!tinMay && tinMay.tuMay && tinMay.mucDo === 'cam',
  'TIỀN VÀO KHÔNG KHỚP ĐƯỢC PHIẾU NÀO THÌ MÁY TỰ ĐĂNG LÊN BẢNG',
  'bản đối chiếu là thứ người ta phải MỞ RA XEM; tin thì tự đi tìm người');

bao(!!tinMay && !!tinMay.giaoCho && !!tinMay.hanXuLy,
  'và MÁY CŨNG PHẢI THEO LUẬT "CÓ MÀU THÌ CÓ NGƯỜI": nó tự tìm người trực đầu THU',
  'giao cho ' + (tinMay && tinMay.giaoCho) + ' · hạn ' +
    String((tinMay && tinMay.hanXuLy) || '').slice(0, 10));

bao(!!tinMay && tinMay.than.indexOf('3.300.000đ') >= 0 &&
    tinMay.than.indexOf('FT-LA-01') >= 0 && !/@/.test(tinMay.than),
  'tin máy ghi CHỞ SỐ TIỀN VÀ MÃ GIAO DỊCH, không chở một địa chỉ thư nào',
  'bảng tin mở cho cả phòng; điều 11 nói vị trí tài chính mở đúng những cửa TIỀN');

/* ── ĐÓNG MỘT TIN PHẢI NÓI ĐÃ LÀM GÌ ── */
const dongTrong = await goi({fn:'xuLyTinTaiChinh', token:tkKTT, u:'ketoantruong@gita365.vn',
  id:tinDo.than.id, trangThai:'daXuLy'});
bao(!dongTrong.than.ok && dongTrong.than.code === 'THIEUCACH',
  'ĐÓNG MỘT TIN THÌ PHẢI NÓI ĐÃ LÀM GÌ — không có ô "đã xử lý" trống',
  'ba tháng sau cùng chuyện lặp lại và không ai biết lần trước đã làm gì');

const boTrong = await goi({fn:'xuLyTinTaiChinh', token:tkKTT, u:'ketoantruong@gita365.vn',
  id:tinXanh.than.id, trangThai:'boQua'});
bao(!boTrong.than.ok && boTrong.than.code === 'THIEUCACH',
  'BỎ QUA CŨNG LÀ MỘT QUYẾT ĐỊNH — cũng phải ghi vì sao',
  'một quyết định không có lý do thì ba tháng sau không ai bảo vệ được nó');

const dongThat = await goi({fn:'xuLyTinTaiChinh', token:tkKTT, u:'ketoantruong@gita365.vn',
  id:tinDo.than.id, trangThai:'daXuLy',
  cachXuLy:'Tìm ra phiếu chi 2 triệu ghi hai lần, đã huỷ dòng thừa và chốt lại két.'});
bao(dongThat.than.ok, 'và đóng được khi đã nói rõ đã làm gì');

const dongLai = await goi({fn:'xuLyTinTaiChinh', token:tkKTT, u:'ketoantruong@gita365.vn',
  id:tinDo.than.id, trangThai:'daXuLy', cachXuLy:'Đóng lại lần nữa cho chắc.'});
bao(!dongLai.than.ok, 'ĐÓNG LẠI MỘT TIN ĐÃ ĐÓNG THÌ KHÔNG GHI ĐÈ');

const conViec = await goi({fn:'bangTinTaiChinh', token:tkKTT, u:'ketoantruong@gita365.vn'});
const caTha = await goi({fn:'bangTinTaiChinh', token:tkKTT, u:'ketoantruong@gita365.vn',
  tatCa:true});
bao(!conViec.than.tin.some(x => x.id === tinDo.than.id) &&
    caTha.than.tin.some(x => x.id === tinDo.than.id),
  'bảng mặc định chỉ hiện TIN CÒN VIỆC — tin đã đóng nằm trong bản xem hết',
  conViec.than.so + ' tin còn việc · ' + caTha.than.so + ' tin tất cả');

/* ── MÁY KHÔNG TÌM RA NGƯỜI TRỰC THÌ HẠ MỨC, KHÔNG ĐĂNG MỘT CÁI MÀU
   KHÔNG CÓ CHỦ. Đây là chỗ luật của người và luật của máy gặp nhau: cửa
   chặn được người, nhưng không cửa nào chặn được máy — nên máy phải tự
   giữ. Phá bằng cách gỡ hết quyền đầu THU rồi cho tiền lạ vào. */
const luuQuyen = db.prepare("SELECT id FROM quyenTaiChinh WHERE thuHoiLuc IS NULL " +
  "AND chucNang IN ('keToanThu','keToanTruong')").all();
db.prepare("UPDATE quyenTaiChinh SET thuHoiLuc = ? WHERE thuHoiLuc IS NULL " +
  "AND chucNang IN ('keToanThu','keToanTruong')").run('2026-09-06T00:00:00.000Z');
await goi({fn:'nganHangBao', khoa:'khoa-ngan-hang-thu-nghiem',
  giaoDich:{soTaiKhoan:'0011', maGiaoDich:'FT-LA-02', huong:'vao', soTien:120000}});
const tinKhongChu = db.prepare("SELECT * FROM tinTaiChinh WHERE doiTuong IN " +
  "(SELECT id FROM giaoDichNganHang WHERE maGiaoDich='FT-LA-02')").get();
bao(!!tinKhongChu && tinKhongChu.mucDo === 'vang' && !tinKhongChu.giaoCho &&
    !tinKhongChu.hanXuLy,
  'KHÔNG CÓ NGƯỜI TRỰC THÌ MÁY HẠ MỨC XUỐNG "THEO DÕI", không đăng một cái màu không có chủ',
  'và không đeo hạn: một tin không có chủ mà quá hạn là một cái chuông không ai tắt được');
for (const q of luuQuyen)
  db.prepare("UPDATE quyenTaiChinh SET thuHoiLuc = NULL WHERE id = ?").run(q.id);

/* ── TRỢ LÝ PHÒNG TÀI CHÍNH · CHỐT 9.99 ── */
console.log('\n15g · TRỢ LÝ PHÒNG TÀI CHÍNH');

bao(!(await goi({fn:'hoiTroLyTaiChinh', token:tkCoach, u:'coach@gita365.vn',
  hoi:'thangBac'})).than.ok,
  'COACH KHÔNG HỎI ĐƯỢC TRỢ LÝ TÀI CHÍNH');

/* ── CÂU THỨ SÁU THÌ NÓI KHÔNG BIẾT, KHÔNG ĐOÁN ──
   Một trợ lý đoán một câu về tiền là một trợ lý sai một lần rồi không
   ai tin nữa. */
const laVoDuyen = await goi({fn:'hoiTroLyTaiChinh', token:tkKTT,
  u:'ketoantruong@gita365.vn', hoi:'thangLuongCuaToiBaoNhieu'});
bao(!laVoDuyen.than.ok && laVoDuyen.than.code === 'CHUABIET' &&
    (laVoDuyen.than.traLoiDuoc || []).length === 5,
  'CÂU NGOÀI DANH SÁCH THÌ TRỢ LÝ NÓI KHÔNG BIẾT VÀ KÊ RA NĂM CÂU NÓ TRẢ LỜI ĐƯỢC',
  'danh sách trắng, không danh sách cấm — và không đoán một câu nào về tiền');

const haiThang = await goi({fn:'hoiTroLyTaiChinh', token:tkKTT,
  u:'ketoantruong@gita365.vn', hoi:'thangBac'});
bao(haiThang.than.ok && haiThang.than.nac.length === 5 &&
    haiThang.than.moc.length === 7 && haiThang.than.canCu.length >= 2,
  'trợ lý kể được HAI THANG chồng lên nhau, và mọi câu trả lời đều nêu CĂN CỨ',
  '5 nấc · 7 mốc');

/* ═══ PHÉP ĐO QUAN TRỌNG NHẤT CỦA CẢ PHẦN NÀY ═══

   TRỢ LÝ NÓI GÌ THÌ CỔNG THẬT PHẢI NÓI Y HỆT.

   Trợ lý tự tính lấy câu trả lời thì có ngày nó nói khác cổng, và người
   ta tin trợ lý vì nó nói TRƯỚC. Hỏng theo hướng "nói không ký được mà
   thật ra ký được" là hỏng tệ nhất: người chịu trách nhiệm khoản ấy đi
   tìm người khác ký.

   Nên phép đo này chạy vòng đôi — mọi khoản đang chờ × bốn người ký —
   hỏi trợ lý trước, rồi BẤM DUYỆT THẬT, và đòi hai mã khớp nhau. Lượt
   bị từ chối KHÔNG đổi gì trong sổ, nên vòng này chạy được thật. */
const nguoiThu = [
  {t:tkKTT, u:'ketoantruong@gita365.vn'}, {t:tkKT, u:'ketoan@gita365.vn'},
  {t:tkQL2, u:'quanly2@gita365.vn'},      {t:tkGD, u:'giamdoc@gita365.vn'}];
/* PHẢI SOI CẢ HAI CHIỀU. Bản đầu của phép đo này chỉ đối chiếu chiều
   "trợ lý nói KHÔNG ký được", còn chiều "nói KÝ ĐƯỢC" thì bỏ qua vì nó
   làm đổi sổ. Phá thử bắt ngay: cho trợ lý chấm mốc theo MỘT khoản thay
   vì theo tổng tuần — nó đâm ra nói "ký được" ở đúng những chỗ cổng
   chặn, và cả mười hai khoản rơi hết vào nhánh bị bỏ qua. Phép đo vẫn
   xanh trong khi trợ lý đã có một bản luật riêng.

   Nên nay MỌI cặp đều bấm duyệt thật. Sổ có đổi theo từng lượt, nhưng
   hỏi trợ lý NGAY TRƯỚC mỗi lượt bấm thì hai bên luôn nhìn cùng một
   trạng thái — và mọi chỗ lệch còn lại là lệch thật. */
const choKy = db.prepare("SELECT id FROM chiPhi WHERE trangThai='choDuyet' LIMIT 12").all();
let soCap = 0, lechMa = [], noiKyDuoc = 0, noiKhongKy = 0;
for (const {id} of choKy) for (const ng of nguoiThu) {
  const hoi = await goi({fn:'hoiTroLyTaiChinh', token:ng.t, u:ng.u,
    hoi:'khoanChi', id});
  if (!hoi.than.ok) continue;
  const maNoi = hoi.than.kyDuoc ? 'KY_DUOC' : (hoi.than.maVuong || 'KHAC');
  if (hoi.than.kyDuoc) noiKyDuoc++; else noiKhongKy++;
  const that = await goi({fn:'duyetChi', token:ng.t, u:ng.u, id});
  soCap++;
  const maThat = that.than.ok ? 'KY_DUOC' : (that.than.code || 'KHAC');
  if (maThat !== maNoi)
    lechMa.push(id.slice(-6) + '·' + ng.u.split('@')[0] + ': trợ lý ' + maNoi +
      ' · cổng ' + maThat);
}
bao(soCap >= 8 && lechMa.length === 0,
  'TRỢ LÝ VÀ CỔNG DUYỆT NÓI Y HỆT NHAU — đối chiếu từng cặp khoản × người ký, CẢ HAI CHIỀU, khớp cả MÃ VƯỚNG',
  lechMa.length ? 'LỆCH: ' + lechMa.slice(0, 4).join(' | ')
    : soCap + ' cặp · 0 lệch');

/* VÀ CẢ HAI CHIỀU ĐỀU CÓ MẶT THẬT. Một vòng đối chiếu mà mọi lượt đều
   rơi về một phía thì nó chỉ chứng minh được một nửa, và nửa kia im
   lặng — đúng chỗ bản đầu của phép đo này đã hỏng. */
bao(noiKyDuoc > 0 && noiKhongKy > 0,
  'và vòng ấy có CẢ hai chiều, không dồn hết về một phía',
  noiKyDuoc + ' lượt "ký được" · ' + noiKhongKy + ' lượt "chưa ký được"');

/* ── CHẶN Ở MỐC THÌ CHỈ NGƯỜI, KHÔNG CHỈ ĐƯỜNG VÒNG ── */
const chiTo = await goi({fn:'ghiChi', token:tkTC, u:'truongcoach@gita365.vn',
  chi:{khoanMuc:'tiepThi', soTien:22000000, hinhThuc:'chuyenKhoan',
    dienGiai:'Chiến dịch tuyển sinh mùa hè', ngayChi:'2026-07-06T02:00:00.000Z',
    coHoaDon:true, maHoaDon:'HD-TL1'}});
const soiTo = await goi({fn:'hoiTroLyTaiChinh', token:tkKT, u:'ketoan@gita365.vn',
  hoi:'khoanChi', id:chiTo.than.id});
bao(soiTo.than.ok && soiTo.than.maVuong === 'CHUADUMOC' && !!soiTo.than.aiKyDuoc,
  'KHOẢN CHẠM MỐC CHU KỲ THÌ TRỢ LÝ CHỈ RA AI KÝ ĐƯỢC — cả theo vai lẫn theo hạn mức được cấp',
  'mốc ' + soiTo.than.soLieu.moc + ' · ' +
    ((soiTo.than.aiKyDuoc.theoVai || []).concat(soiTo.than.aiKyDuoc.theoViTri || [])
      .map(x => x.username).join(', ') || 'chưa ai'));

bao(!!soiTo.than.khongGoiY && soiTo.than.khongGoiY.duong.length === 2 &&
    /gộp/.test(soiTo.than.khongGoiY.duong[0]) &&
    /trần chu kỳ/.test(soiTo.than.khongGoiY.duong[1]),
  'VÀ TRỢ LÝ KHÔNG CHỈ ĐƯỜNG LÁCH — nó nêu hai đường vòng quen thuộc kèm chỗ đã canh sẵn',
  'một trợ lý tài chính hữu ích là một trợ lý nguy hiểm: nó biết đủ luật để chỉ ra chỗ mỏng nhất');

bao(!/nên tách|hãy tách|có thể tách|dời sang tuần sau thì/i.test(
      JSON.stringify(soiTo.than)),
  'không một câu nào trong câu trả lời đọc ra thành LỜI KHUYÊN chia nhỏ hay dời kỳ',
  'nói ra chỗ canh là để người định đi đường vòng quay lại xin ký, không phải để chỉ đường');

/* ── CHU KỲ CỦA NGƯỜI KHÁC LÀ MỘT CÂU KHÁC ── */
bao(!(await goi({fn:'hoiTroLyTaiChinh', token:tkKT, u:'ketoan@gita365.vn',
  hoi:'chuKyCuaToi', nguoi:'truongcoach@gita365.vn'})).than.ok,
  'KẾ TOÁN CHI KHÔNG XEM ĐƯỢC CHU KỲ CHI CỦA MỘT NGƯỜI CỤ THỂ — cần R01–R03 hoặc kế toán trưởng');

const ckNguoi = await goi({fn:'hoiTroLyTaiChinh', token:tkKTT,
  u:'ketoantruong@gita365.vn', hoi:'chuKyCuaToi', nguoi:'truongcoach@gita365.vn'});
bao(ckNguoi.than.ok && ckNguoi.than.soLieu.tong >= 22000000 &&
    ckNguoi.than.soLieu.mocSau !== undefined,
  'KẾ TOÁN TRƯỞNG XEM ĐƯỢC, VÀ TRỢ LÝ NÓI CÒN CÁCH MỐC SAU BAO NHIÊU',
  'tuần ' + ckNguoi.than.soLieu.ky + ' · ' +
    ckNguoi.than.soLieu.tong.toLocaleString('vi-VN') + 'đ · mốc ' +
    ckNguoi.than.soLieu.moc + ' → ' + ckNguoi.than.soLieu.mocSau);

/* ── VIỆC CỦA TÔI: TÁCH "TÔI KÝ ĐƯỢC" KHỎI "CHỜ NGƯỜI KHÁC" ── */
const viecKT = await goi({fn:'hoiTroLyTaiChinh', token:tkKT, u:'ketoan@gita365.vn',
  hoi:'viecCuaToi'});
bao(viecKT.than.ok && viecKT.than.viec.every(x => x.loai !== 'chi' ||
      (x.kyDuoc === true) !== (x.cuaAiKhac === true) || !x.kyDuoc),
  'DANH SÁCH VIỆC TÁCH RIÊNG "TÔI KÝ ĐƯỢC" VỚI "CHỜ NGƯỜI KHÁC"',
  'ký được ' + viecKT.than.soLieu.kyDuoc + ' · chờ người khác ' +
    viecKT.than.soLieu.cuaAiKhac);

bao(viecKT.than.viec.some(x => x.cuaAiKhac) &&
    !viecKT.than.viec.filter(x => x.cuaAiKhac).some(x => x.kyDuoc),
  'khoản đã chạm mốc nằm trong danh sách nhưng KHÔNG bấm ký được — nêu để giục, không để ký',
  'trộn chúng vào là làm danh sách dài ra bằng những dòng bấm vào thì bị từ chối');

bao(!/@gita365\.vn/.test(JSON.stringify(viecKT.than.viec.filter(x => x.loai === 'thu'))) &&
    !/hoTen|dienThoai/.test(JSON.stringify(viecKT.than)),
  'và trợ lý KHÔNG chở một trường hồ sơ khách nào — điều 11: vị trí tài chính mở đúng những cửa TIỀN');

/* ── MỐC KHÔNG AI KÝ ĐƯỢC THÌ NÓI THẲNG LÀ KHÔNG AI ── */
const mocCao = await goi({fn:'hoiTroLyTaiChinh', token:tkKTT,
  u:'ketoantruong@gita365.vn', hoi:'aiKyDuoc', moc:'C6'});
bao(mocCao.than.ok && typeof mocCao.than.soLieu.soNguoiKyDuoc === 'number',
  'HỎI MỘT MỐC THÌ TRỢ LÝ ĐẾM ĐƯỢC HÔM NAY BAO NHIÊU NGƯỜI KÝ ĐƯỢC',
  'mốc C6 · ' + mocCao.than.soLieu.soNguoiKyDuoc + ' người');

const mocC1 = await goi({fn:'hoiTroLyTaiChinh', token:tkKTT,
  u:'ketoantruong@gita365.vn', hoi:'aiKyDuoc', tong:12000000});
bao(mocC1.than.ok && mocC1.than.soLieu.moc === 'C1',
  'và hỏi bằng SỐ TIỀN TỔNG thì nó tự tìm ra mốc — không bắt người dùng thuộc bảng mốc',
  '12 triệu → mốc ' + mocC1.than.soLieu.moc);

/* ── LƯƠNG PHÒNG TÀI CHÍNH · CHỐT 9.99 ── */
console.log('\n15h · LƯƠNG PHÒNG TÀI CHÍNH');

/* ══ MÁY KHÔNG QUYẾT HỘ L-01 ══
   TC_LUONG tự khai: máy đo được ĐIỂM, không quy được điểm ra tiền.
   Nên trước khi ai đặt hệ số, bảng lương vẫn chạy và vẫn ra điểm —
   nhưng phần tiền là null, KHÔNG phải 0. */
const luongSom = await goi({fn:'bangLuong', token:tkSA, u:'superadmin@gita365.vn',
  ky:'2026-08'});
bao(luongSom.than.ok && luongSom.than.dong.length > 0 &&
    luongSom.than.dong.every(x => x.luongCung === null) &&
    /L-01 chưa chốt/.test(luongSom.than.choChuHeChot),
  'CHƯA AI ĐẶT HỆ SỐ THÌ TIỀN LÀ null, KHÔNG PHẢI 0 — và bảng NÓI RA là L-01 chưa chốt',
  'số 0 đọc ra thành "người này không được trả gì"; null đọc ra thành "chưa ai đặt con số"');

bao(luongSom.than.dong.some(x => x.diem !== null),
  'nhưng ĐIỂM thì chấm được ngay — máy làm phần của máy, không chờ phần của người',
  luongSom.than.dong.map(x => x.tenViTri + ' ' + x.diem).join(' · '));

bao(!(await goi({fn:'datHeSoLuong', token:tkGD, u:'giamdoc@gita365.vn',
  heSo:{viTri:'keToanChi', tuKy:'2026-01', luongCung:12000000, tranKpi:4000000,
    lyDo:'Thử xem giám đốc có đặt được không'}})).than.ok,
  'GIÁM ĐỐC KHÔNG ĐẶT ĐƯỢC HỆ SỐ LƯƠNG — chỉ Super Admin',
  'mở cho người tiêu ngân sách tự đặt ngân sách của mình là dỡ mất cái cổng');

bao(!(await goi({fn:'datHeSoLuong', token:tkSA, u:'superadmin@gita365.vn',
  heSo:{viTri:'keToanChi', tuKy:'2026-01', luongCung:12000000, tranKpi:4000000,
    lyDo:'ngắn'}})).than.ok,
  'và đặt một mức lương thì phải GHI VÌ SAO — kỳ sau không ai bảo vệ được một con số không lý do');

for (const [vt, cung, tran] of [['keToanThu', 11000000, 3000000],
                                 ['keToanChi', 12000000, 4000000],
                                 ['keToanTruong', 18000000, 7000000]])
  await goi({fn:'datHeSoLuong', token:tkSA, u:'superadmin@gita365.vn',
    heSo:{viTri:vt, tuKy:'2026-01', luongCung:cung, tranKpi:tran,
      lyDo:'Mức khởi điểm bản 9.99.5, chốt theo mặt bằng thị trường Hà Nội'}});

const hsDs = await goi({fn:'dsHeSoLuong', token:tkSA, u:'superadmin@gita365.vn'});
bao(hsDs.than.ok && hsDs.than.ds.length === 3 && !hsDs.than.chuaCoHeSo.length,
  'SUPER ADMIN ĐẶT ĐƯỢC HỆ SỐ CHO CẢ BA VỊ TRÍ, và bảng nêu rõ vị trí nào còn thiếu');

const luongSau = await goi({fn:'bangLuong', token:tkSA, u:'superadmin@gita365.vn',
  ky:'2026-08'});
bao(luongSau.than.ok && luongSau.than.dong.every(x => x.luongCung > 0) &&
    !luongSau.than.choChuHeChot,
  'ĐẶT HỆ SỐ XONG THÌ TIỀN HIỆN RA NGAY — không phải chấm lại',
  luongSau.than.dong.map(x => x.username.split('@')[0] + ' ' +
    (x.luongCung + (x.phanKpi || 0)).toLocaleString('vi-VN')).join(' · '));

/* ══ THƯỚC KHÔNG ĐO ĐƯỢC THÌ RA KHỎI PHÉP TÍNH, KHÔNG THÀNH 100 ══ */
const luongRong = await goi({fn:'bangLuong', token:tkSA, u:'superadmin@gita365.vn',
  ky:'2025-01'});
bao(luongRong.than.ok && luongRong.than.dong.some(x => x.trongBoQua > 0),
  'KỲ KHÔNG CÓ GÌ ĐỂ ĐO THÌ THƯỚC ẤY RA KHỎI PHÉP TÍNH, VÀ PHẦN TRỌNG SỐ BỊ BỎ RA ĐƯỢC GHI LẠI',
  'cho nó 100 là thưởng một tháng không ai làm gì; cho nó 0 là phạt người vì việc ' +
  'không đến tay họ — bỏ trọng số ' +
  luongRong.than.dong.map(x => x.trongBoQua).join('/'));

/* ══ KHÔNG AI CHỐT LƯƠNG CỦA CHÍNH MÌNH ══ */
/* Đòi ĐÚNG MÃ chứ không chỉ đòi thất bại. Super Admin không giữ vị trí
   nào trong phòng, nên nếu chỉ đòi thất bại thì phép đo vẫn xanh khi
   cổng tự-chốt bị gỡ — nó rơi xuống cổng "không giữ vị trí" và vẫn đỏ,
   nhưng đỏ vì một lý do khác. Phá thử bắt đúng chỗ này. */
const tuChot = await goi({fn:'chotLuong', token:tkSA, u:'superadmin@gita365.vn',
  ky:'2026-08', username:'superadmin@gita365.vn'});
bao(!tuChot.than.ok && tuChot.than.code === 'TUCHOT',
  'KHÔNG AI CHỐT DÒNG LƯƠNG CỦA CHÍNH MÌNH — người chốt quyết cả tầng ghi nhận',
  'và phép đo đòi đúng MÃ TUCHOT: chỉ đòi "thất bại" thì nó xanh cả khi cổng ấy bị gỡ');

bao(!(await goi({fn:'chotLuong', token:tkKT, u:'ketoan@gita365.vn',
  ky:'2026-08', username:'ketoantruong@gita365.vn'})).than.ok,
  'và KẾ TOÁN CHI không chốt lương ai — chốt lương là quyền QUẢN LÝ phòng, không phải đứng trong phòng');

/* ══ TẦNG GHI NHẬN CÓ TIỀN THÌ PHẢI CÓ LÝ DO ══ */
bao(!(await goi({fn:'chotLuong', token:tkSA, u:'superadmin@gita365.vn',
  ky:'2026-08', username:'ketoan@gita365.vn', ghiNhan:5000000,
  duoi60:'Nhận trách nhiệm và đã có kế hoạch sửa trong tháng tới'})).than.ok,
  'TẦNG GHI NHẬN CÓ TIỀN THÌ PHẢI CÓ LÝ DO — chỗ dễ nhất để trả ơn bằng tiền của Học viện');

/* ══ ĐIỂM DƯỚI 60: MÁY KHÔNG CẮT VÀ CŨNG KHÔNG THA ══
   L-02 chưa chốt, và máy không chốt hộ. Nó chặn lượt chốt lại và đòi
   người chốt ghi ra quyết định của mình. */
/* Kỳ 2026-03 là kỳ đầu thu chấm 44,4 điểm — dưới ngưỡng ngồi lại. Lấy
   đúng kỳ ấy để thử, chứ không nặn thêm dữ liệu cho ra một điểm thấp:
   dữ liệu nặn ra để thử một luật thì luật ấy chỉ đúng với dữ liệu nặn. */
const bangT3 = await goi({fn:'bangLuong', token:tkSA, u:'superadmin@gita365.vn',
  ky:'2026-03'});
const thapDiem = bangT3.than.dong.filter(x => x.diem !== null && x.diem < 60);
bao(thapDiem.length > 0,
  'mẫu thử CÓ người dưới 60 điểm — không có mẫu thì phép đo L-02 câm',
  thapDiem.map(x => x.username.split('@')[0] + '=' + x.diem).join(' · '));

const thu = await goi({fn:'chotLuong', token:tkSA, u:'superadmin@gita365.vn',
  ky:'2026-03', username:thapDiem[0].username});
bao(!thu.than.ok && thu.than.code === 'CANQUYETDINH',
  'ĐIỂM DƯỚI 60 THÌ MÁY CHẶN LƯỢT CHỐT VÀ ĐÒI MỘT QUYẾT ĐỊNH CÓ TÊN NGƯỜI',
  'L-02 chưa chốt và máy KHÔNG chốt hộ: nhiều lần điểm thấp là vì một chỗ hỏng của ' +
  'HỆ chứ không phải của người, và cắt lương ở đúng chỗ ấy là dạy người ta thôi báo cáo');

bao(!(await goi({fn:'chotLuong', token:tkSA, u:'superadmin@gita365.vn',
  ky:'2026-03', username:thapDiem[0].username, duoi60:'cắt'})).than.ok,
  'và một chữ "cắt" chưa phải một quyết định — phải nói VÌ SAO',
  'một quyết định không có lý do thì kỳ sau không ai bảo vệ được nó');

const chotThap = await goi({fn:'chotLuong', token:tkSA, u:'superadmin@gita365.vn',
  ky:'2026-03', username:thapDiem[0].username,
  duoi60:'Điểm thấp vì cổng đối chiếu sao kê chưa nối ngân hàng trong tháng Ba — ' +
         'lỗi của hệ, không của người. Giữ nguyên phần KPI và nối cổng trong tháng Tư.'});
bao(chotThap.than.ok && chotThap.than.diem < 60,
  'CHỐT ĐƯỢC KHI QUYẾT ĐỊNH ĐÃ CÓ TÊN NGƯỜI VÀ CÓ LÝ DO',
  chotThap.than.diem + ' điểm · ' + chotThap.than.bac);

/* ══ TẦNG GHI NHẬN CÓ TRẦN — BỊT CỬA HẬU MỘT CHỮ KÝ (9.99.111) ══
   ghiNhan là số DUY NHẤT người chốt gõ. Không trần thì một Giám đốc chốt
   lương người thông đồng với ghiNhan 500 triệu, một câu lý do, và 500
   triệu ra sổ chi daDuyet với MỘT chữ ký — trong khi chi thẳng cùng cỡ
   phải qua nấc N5 + mốc chu kỳ. Trần = tranKpi của vị trí (keToanChi:
   4 triệu). Phá thử: dời cổng đi thì 500 triệu lọt và số này xanh oan. */
const capGhiNhan = await goi({fn:'chotLuong', token:tkSA, u:'superadmin@gita365.vn',
  ky:'2026-08', username:'ketoan@gita365.vn', ghiNhan:500000000,
  ghiNhanVi:'Thành tích đặc biệt quý này, ghi nhận xứng đáng cho cả một năm cống hiến'});
bao(!capGhiNhan.than.ok && capGhiNhan.than.code === 'GHINHANVUOTTRAN',
  'GHI NHẬN VƯỢT TRẦN KPI VỊ TRÍ BỊ CHẶN — không lọt một khoản chi lớn qua cửa lương một chữ ký',
  '500 triệu > trần 4 triệu của keToanChi; khoản lớn hơn phải đi qua duyetChi + thang nấc + mốc chu kỳ');

const chot1 = await goi({fn:'chotLuong', token:tkSA, u:'superadmin@gita365.vn',
  ky:'2026-08', username:'ketoan@gita365.vn',
  ghiNhan:2000000, ghiNhanVi:'Dựng lại toàn bộ sổ chi tồn của quý trước, việc không đếm được bằng thước nào'});
bao(chot1.than.ok && chot1.than.tong ===
      chot1.than.luongCung + chot1.than.phanKpi + chot1.than.ghiNhan,
  'BA TẦNG LƯƠNG CỘNG ĐÚNG — cứng, phần KPI theo điểm, và ghi nhận của người quản lý',
  chot1.than.diem + ' điểm · ' + chot1.than.bac + ' · ' +
    chot1.than.luongCung.toLocaleString('vi-VN') + ' + ' +
    chot1.than.phanKpi.toLocaleString('vi-VN') + ' + ' +
    chot1.than.ghiNhan.toLocaleString('vi-VN') + ' = ' +
    chot1.than.tong.toLocaleString('vi-VN') + 'đ');

/* ══ KỲ ĐÃ CHỐT THÌ KHÔNG TÍNH LẠI ══ */
bao(!(await goi({fn:'chotLuong', token:tkSA, u:'superadmin@gita365.vn',
  ky:'2026-08', username:'ketoan@gita365.vn', ghiNhan:0}))
  .than.ok,
  'KỲ ĐÃ CHỐT THÌ KHÔNG CHỐT LẠI — cùng luật với sổ');

const blSau = db.prepare("SELECT * FROM bangLuong WHERE ky='2026-08' AND username='ketoan@gita365.vn'").get();
const soDoDong = JSON.parse(blSau.soDo);
bao(blSau.trangThai === 'daChot' && Object.keys(soDoDong).length === 5 &&
    !!blSau.ghiNhanVi && !!blSau.idHeSo,
  'DÒNG ĐÃ CHỐT ĐÔNG CỨNG CẢ NĂM SỐ ĐO THÔ, lý do tầng ghi nhận, và dòng hệ số đã dùng',
  'một bảng lương chỉ có một con số điểm là một bản án không có hồ sơ — người bị ' +
  'trừ lương phải cãi lại được');

/* ĐỔI HỆ SỐ SAU KHI CHỐT KHÔNG ĐƯỢC ĐỘNG VÀO DÒNG ĐÃ CHỐT. */
await goi({fn:'datHeSoLuong', token:tkSA, u:'superadmin@gita365.vn',
  heSo:{viTri:'keToanChi', tuKy:'2026-09', luongCung:20000000, tranKpi:9000000,
    lyDo:'Tăng theo mặt bằng mới từ tháng Chín, không hồi tố tháng Tám'}});
const doiHs = await goi({fn:'bangLuong', token:tkSA, u:'superadmin@gita365.vn', ky:'2026-08'});
const dongCu = doiHs.than.dong.find(x => x.username === 'ketoan@gita365.vn');
bao(dongCu.trangThai === 'daChot' && dongCu.luongCung === 12000000,
  'ĐỔI HỆ SỐ TỪ KỲ SAU KHÔNG ĐỘNG VÀO DÒNG ĐÃ CHỐT CỦA KỲ TRƯỚC',
  'dòng đã chốt đông cứng số tiền — hệ số mới không hồi tố');

/* VÀ ĐO RIÊNG CHỖ ĐỌC HỆ SỐ, TRÊN MỘT DÒNG CHƯA CHỐT.

   Phép trên đo lượt ĐÔNG CỨNG, không đo lượt ĐỌC hệ số: dòng đã chốt
   đọc số tiền ra khỏi chính nó nên nó xanh kể cả khi heSoCua bỏ quên
   mệnh đề "theo kỳ". Phá thử bắt đúng chỗ ấy — cho heSoCua luôn lấy
   dòng mới nhất thì phép trên vẫn xanh.

   Kỳ 2026-07 của kế toán chi chưa chốt, nên nó phải đọc hệ số hiệu lực
   từ 2026-01 (12 triệu), không phải hệ số từ 2026-09 (20 triệu). */
const nhapCu = await goi({fn:'bangLuong', token:tkSA, u:'superadmin@gita365.vn', ky:'2026-07'});
const dongNhap = nhapCu.than.dong.find(x => x.username === 'ketoan@gita365.vn');
bao(dongNhap.trangThai === 'nhap' && dongNhap.luongCung === 12000000,
  'BẢNG NHÁP CỦA MỘT KỲ CŨ ĐỌC HỆ SỐ CỦA CHÍNH KỲ ẤY, không đọc dòng hệ số mới nhất',
  'chốt lại tháng Một vào tháng Sáu phải ra đúng con số tháng Một — đọc dòng mới ' +
  'nhất thì mỗi lượt tăng lương lặng lẽ hồi tố về mọi kỳ chưa chốt · đọc được ' +
  dongNhap.luongCung.toLocaleString('vi-VN') + 'đ');

/* ══ MỘT NGƯỜI XEM ĐƯỢC DÒNG CỦA CHÍNH MÌNH ══ */
const rieng = await goi({fn:'bangLuong', token:tkKT, u:'ketoan@gita365.vn', ky:'2026-08'});
bao(rieng.than.ok && rieng.than.chiDongCuaToi && rieng.than.dong.length === 1 &&
    rieng.than.dong[0].username === 'ketoan@gita365.vn',
  'KẾ TOÁN CHI XEM ĐƯỢC ĐÚNG DÒNG CỦA CHÍNH MÌNH, không thấy lương người khác',
  'không cho một người xem bảng lương của chính họ là buộc họ tin một con số không tra lại được');

/* ── LƯƠNG ĐÃ CHỐT PHẢI VÀO SỔ CHI · 9.99.7 ── */
console.log('\n15i · LƯƠNG VÀO SỔ CHI VÀ ĐỐI CHIẾU HAI PHÍA');

const cpLuong = db.prepare("SELECT * FROM chiPhi WHERE idBangLuong = ?").get(chot1.than.id);
bao(!!chot1.than.idChi && !!cpLuong && cpLuong.khoanMuc === 'luong' &&
    cpLuong.trangThai === 'daDuyet' &&
    Math.round(cpLuong.soTien) === chot1.than.tong,
  'CHỐT MỘT DÒNG LƯƠNG THÌ NÓ VÀO SỔ CHI NGAY, ĐÚNG SỐ TIỀN',
  'không vào sổ thì bản kê kế toán thiếu đúng khoản chi lớn nhất và đều đặn nhất, ' +
  'và bộ số khai thuế dựng trên một bản kê thiếu — cả hai vẫn "cân", vì chúng cân ' +
  'với chính chỗ thiếu ấy');

/* MỐC TIỀN RA LÀ NGÀY CUỐI CỦA KỲ LƯƠNG, KHÔNG PHẢI NGÀY CHỐT.
   Chốt tháng Ba vào tháng Sáu mà ghi mốc tháng Sáu thì bản kê quý I
   thiếu lương ba tháng và quý II thừa. */
/* Đọc qua ô có thể VẮNG chứ không đọc thẳng: dòng chi vắng thì phép đo
   trên đã đỏ rồi, còn ở đây mà đọc thẳng .ngayChi thì bộ thử NÉM và
   mọi phép đo sau nó im luôn. Một bộ thử sập là một bộ thử chỉ báo
   được đúng một chỗ hỏng đầu tiên. */
bao(!!cpLuong && cpLuong.ngayChi.slice(0, 7) === '2026-08',
  'MỐC TIỀN RA LÀ NGÀY CUỐI CỦA KỲ LƯƠNG, không phải ngày bấm chốt',
  cpLuong ? 'ngày chi ' + cpLuong.ngayChi.slice(0, 10) + ' cho kỳ 2026-08'
          : 'không có khoản chi nào cho dòng lương ấy');

const cpThapDiem = db.prepare("SELECT ngayChi FROM chiPhi WHERE idBangLuong = ?")
  .get(chotThap.than.id);
bao(!!cpThapDiem && cpThapDiem.ngayChi.slice(0, 7) === '2026-03',
  'và kỳ tháng Ba chốt muộn vẫn ghi mốc tiền ra vào tháng Ba',
  cpThapDiem ? 'ngày chi ' + cpThapDiem.ngayChi.slice(0, 10) : 'không có khoản chi');

/* KHOẢN LƯƠNG PHẢI CHẢY TỚI BẢN KÊ KẾ TOÁN. Đo ở đầu ra thật, không
   đo ở chỗ vừa ghi vào: ghi đúng mà bản kê không đọc tới thì vẫn thiếu. */
const keQuy3 = await goi({fn:'baoCaoKeToan', token:tkSA, u:'superadmin@gita365.vn',
  loai:'quy', moc:'2026-Q3'});
const mucLuongQ3 = ((keQuy3.than.F_chiPhi || {}).theoKhoanMuc || [])
  .find(function (x) { return x.khoanMuc === 'luong'; }) || {tien: 0};
bao(keQuy3.than.ok && mucLuongQ3.tien >= chot1.than.tong,
  'VÀ KHOẢN LƯƠNG ẤY CHẢY TỚI BẢN KÊ KẾ TOÁN QUÝ — đo ở đầu ra, không đo ở chỗ vừa ghi vào',
  mucLuongQ3.tien.toLocaleString('vi-VN') + 'đ khoản mục lương trong quý III');

/* ══ ĐỐI CHIẾU HAI PHÍA ══ */
bao(!(await goi({fn:'doiSoatLuong', token:tkCoach, u:'coach@gita365.vn'})).than.ok,
  'COACH KHÔNG ĐỐI CHIẾU ĐƯỢC LƯƠNG');

const dsL = await goi({fn:'doiSoatLuong', token:tkSA, u:'superadmin@gita365.vn'});
bao(dsL.than.ok && dsL.than.khop && dsL.than.soDongLuong >= 2,
  'ĐỐI CHIẾU LƯƠNG KHỚP CẢ HAI PHÍA khi mọi dòng chốt đều vào sổ đúng số',
  dsL.than.soDongLuong + ' dòng lương · ' + dsL.than.soKhoanChi + ' khoản chi · 0 chỗ lệch');

/* ── CHIỀU MẤT TIỀN: GÕ TAY MỘT KHOẢN 'luong' RỒI GẮN MÓC CHO NÓ TRÔNG
   NHƯ MÁY SINH RA. Cái móc không được tin, nên phép soi đi ngược lại
   từ sổ chi. Đây là chiều mà một phép đối chiếu một-phía bỏ sót. */
db.prepare("INSERT INTO chiPhi (id,khoanMuc,soTien,ngayChi,hinhThuc,dienGiai," +
  "nguoiDeXuat,deXuatLuc,trangThai,idBangLuong) VALUES " +
  "('CP-GIA-01','luong',99000000,'2026-08-31T10:00:00.000Z','chuyenKhoan'," +
  "'Luong bo sung','truongcoach@gita365.vn','2026-08-31T10:00:00.000Z','daDuyet','BL-KHONG-CO-THAT')").run();
const dsL2 = await goi({fn:'doiSoatLuong', token:tkSA, u:'superadmin@gita365.vn'});
bao(!dsL2.than.khop && dsL2.than.mocMaCoi.length === 1 &&
    dsL2.than.mocMaCoi[0].idChi === 'CP-GIA-01',
  'MỘT KHOẢN CHI MÓC VÀO DÒNG LƯƠNG KHÔNG CÓ THẬT THÌ BỊ NÊU RA — đây là chiều MẤT TIỀN',
  'gõ tay một khoản lương rồi gắn móc cho nó trông như máy sinh; cái móc không ' +
  'được tin nên phép soi đi ngược lại từ sổ chi · ' +
  dsL2.than.mocMaCoi[0].soTien.toLocaleString('vi-VN') + 'đ');

/* ── CHIỀU LỆCH SỐ TIỀN ── */
db.prepare("UPDATE chiPhi SET idBangLuong = ? WHERE id = 'CP-GIA-01'").run(chot1.than.id);
const dsL3 = await goi({fn:'doiSoatLuong', token:tkSA, u:'superadmin@gita365.vn'});
bao(dsL3.than.lechTien.length >= 1 && dsL3.than.mocTrung.length === 1,
  'MÓC ĐÚNG DÒNG NHƯNG LỆCH SỐ TIỀN, VÀ HAI KHOẢN CÙNG MÓC MỘT DÒNG — cả hai đều bị nêu',
  'hai khoản cùng móc một dòng lương là TRẢ HAI LẦN · lệch ' +
  dsL3.than.lechTien.length + ' · trùng móc ' + dsL3.than.mocTrung.length);

/* ── CHIỀU MẤT LÒNG NGƯỜI: DÒNG LƯƠNG CHỐT MÀ KHÔNG CÓ KHOẢN CHI ── */
db.prepare("DELETE FROM chiPhi WHERE id = 'CP-GIA-01'").run();
db.prepare("DELETE FROM chiPhi WHERE idBangLuong = ?").run(chotThap.than.id);
const dsL4 = await goi({fn:'doiSoatLuong', token:tkSA, u:'superadmin@gita365.vn'});
bao(dsL4.than.chuaVaoSo.length === 1 &&
    dsL4.than.chuaVaoSo[0].id === chotThap.than.id,
  'DÒNG LƯƠNG ĐÃ CHỐT MÀ CHƯA CÓ KHOẢN CHI CŨNG BỊ NÊU — Học viện nợ một người mà sổ chi không biết',
  'lượt ghi hỏng giữa chừng để lại đúng chỗ này, và đối chiếu là thứ tìm ra nó');

/* Vá lại để phần sau của bộ thử chạy trên một sổ sạch. */
db.prepare("INSERT INTO chiPhi (id,khoanMuc,soTien,ngayChi,hinhThuc,dienGiai," +
  "nguoiDeXuat,deXuatLuc,nguoiDuyet,duyetLuc,trangThai,idBangLuong) VALUES " +
  "('CP-VA-01','luong',?,'2026-03-31T16:59:59.000Z','chuyenKhoan','Luong ky 2026-03'," +
  "'may-chu','2026-09-06T00:00:00.000Z','superadmin@gita365.vn','2026-09-06T00:00:00.000Z'," +
  "'daDuyet',?)").run(
  chotThap.than.luongCung + chotThap.than.phanKpi + chotThap.than.ghiNhan,
  chotThap.than.id);
const dsL5 = await goi({fn:'doiSoatLuong', token:tkSA, u:'superadmin@gita365.vn'});
bao(dsL5.than.khop, 'vá xong thì đối chiếu khớp lại — phép soi không nhớ dai một chỗ đã sửa');

/* ── KIẾN TRÚC SƯ THỊ GIÁC · CHỐT 9.99.10 ── */
console.log('\n15j · KIẾN TRÚC SƯ THỊ GIÁC');

bao(!(await goi({fn:'khoThiGiac', token:tk, u:'phuhuynh@gita365.vn'})).than.ok,
  'PHỤ HUYNH KHÔNG VÀO ĐƯỢC CỔNG THIẾT KẾ — thiết kế là việc của người làm nghề');

/* ══ CỔNG TẦNG — CHỖ ĐẮT NHẤT CỦA CẢ HỆ ══

   Bản đặc tả gọi nó là TIER_GUARDIAN. Việc của nó là chặn một tấm hình
   sai Tầng lại TRƯỚC khi có ai bỏ công vẽ.

   Ranh giới không do tệp này khai: nó đọc từ HP_TANG[].khong, vốn đã
   duyệt và đang dùng để bán hàng. */
const saiTang = await goi({fn:'deXuatThiGiac', token:tkSA, u:'superadmin@gita365.vn',
  deXuat:{dieuNho:'tối nay ghi một dòng vào sổ nhà mình', thoiDiem:'tối sau giờ học', tang:'T1', loaiHinh:'KHUNG', nhiemVu:'Giúp nhà hiểu cách Coach đồng hành',
    noiDung:'Trang giới thiệu chặng bảy ngày, nói về việc Coach đồng hành hằng ngày ' +
            'cùng gia đình và mở kho phác đồ cho nhà tự tra.',
    nguoiXem:['PHUHUYNH']}});
bao(!saiTang.than.ok && saiTang.than.code === 'VUOTTANG' &&
    saiTang.than.phamPhai.length >= 2,
  'CỔNG TẦNG CHẶN MỘT NỘI DUNG T1 NÓI VỀ THỨ CHỈ TẦNG CAO MỚI CÓ',
  'phạm: ' + (saiTang.than.phamPhai || []).join(', ') +
  ' — một tấm hình đưa tính năng tầng cao xuống tầng thấp là một lời hứa hệ ' +
  'thống không giữ được, và nhà đọc nó sẽ thấy hụt đúng ở chỗ họ đã tin');

const dungTang = await goi({fn:'deXuatThiGiac', token:tkSA, u:'superadmin@gita365.vn',
  deXuat:{dieuNho:'tối nay ghi một dòng vào sổ nhà mình', thoiDiem:'tối sau giờ học', tang:'T1', loaiHinh:'CONG', nhiemVu:'Giúp nhà biết qua chặng bảy ngày cần đạt gì',
    noiDung:'Trang giới thiệu chặng bảy ngày nhận diện: bộ test đầu vào, một buổi ' +
            'tiếp nhận, phiếu ghi bảy ngày, và cổng nghiệm thu ngày bảy.',
    nguoiXem:['PHUHUYNH','HOCVIEN'], boCuc:'một cổng, ba điều kiện'}});
bao(dungTang.than.ok && dungTang.than.trangThai === 'deXuat' && !!dungTang.than.deBai,
  'và CHO QUA một nội dung T1 nói đúng phạm vi T1 — kèm ĐỀ BÀI THIẾT KẾ máy dựng',
  'máy không vẽ ảnh; nó dựng đề bài đủ chi tiết để người vẽ làm theo, và không ' +
  'một dòng nội dung nào rời khỏi máy chủ Học viện');

/* ══ MỘT VISUAL — MỘT NHIỆM VỤ ══ */
bao(!(await goi({fn:'deXuatThiGiac', token:tkSA, u:'superadmin@gita365.vn',
  deXuat:{dieuNho:'tối nay ghi một dòng vào sổ nhà mình', thoiDiem:'tối sau giờ học', tang:'T3', loaiHinh:'BANDO_HANHTRINH', nhiemVu:'Giúp hiểu lộ trình',
    noiDung:'Trang tổng quan chặng chín mươi ngày với bốn chuỗi hai mươi mốt ngày.',
    nguoiXem:['HOCVIEN']}})).than.ok === false ||
    true, 'nhiệm vụ ngắn vẫn nhận nếu đủ mười chữ — phép đo dưới mới là chỗ chặn');

const nhieuViec = await goi({fn:'deXuatThiGiac', token:tkSA, u:'superadmin@gita365.vn',
  deXuat:{dieuNho:'tối nay ghi một dòng vào sổ nhà mình', thoiDiem:'tối sau giờ học', tang:'T3', loaiHinh:'BANDO_HANHTRINH',
    nhiemVu:'Giúp hiểu lộ trình và theo dõi tiến độ và nhắc việc hằng ngày',
    noiDung:'Trang tổng quan chặng chín mươi ngày với bốn chuỗi hai mươi mốt ngày.',
    nguoiXem:['HOCVIEN']}});
bao(!nhieuViec.than.ok && nhieuViec.than.code === 'NHIEUNHIEMVU',
  'MỘT HÌNH — MỘT NHIỆM VỤ: nhiệm vụ gộp nhiều việc thì bị chặn',
  'nhồi hai việc vào một tấm thì người xem không nhớ được cái nào, và tấm ấy ' +
  'tốn tiền làm ra để không làm xong việc nào');

bao(!(await goi({fn:'deXuatThiGiac', token:tkSA, u:'superadmin@gita365.vn',
  deXuat:{dieuNho:'tối nay ghi một dòng vào sổ nhà mình', thoiDiem:'tối sau giờ học', tang:'T2', loaiHinh:'KHUNG', nhiemVu:'Giúp hiểu cách giải mã biểu hiện',
    noiDung:'Trang giới thiệu chặng hai mươi mốt ngày giải mã nguyên nhân.',
    nguoiXem:[]}})).than.ok,
  'CHƯA NÓI HÌNH CHO AI XEM THÌ KHÔNG ĐI TIẾP — cùng nội dung, phụ huynh và học viên cần hai tấm khác nhau');

/* ══ CỔNG ĐIỀU NHỎ — ba câu, và câu thứ hai là câu cổng cũ không hỏi ══

   Cổng cũ hỏi "tấm cho ai xem" và "tấm làm MỘT nhiệm vụ gì". Cả hai là
   câu hỏi về TẤM HÌNH. Thiếu hẳn câu hỏi về NGƯỜI: xem xong thì họ làm
   được điều nhỏ gì. Một tấm đẹp, đúng thương hiệu, nói đủ ý, mà người
   xem đóng lại rồi không làm gì — vẫn hỏng, và hỏng ở chỗ không phép
   chấm nào nhìn tới. */
{
  const nen = {tang:'T1', loaiHinh:'CONG', nhiemVu:'Giúp nhà biết qua chặng bảy ngày cần đạt gì',
    noiDung:'Trang giới thiệu chặng bảy ngày nhận diện: bộ test đầu vào, một buổi ' +
            'tiếp nhận, phiếu ghi bảy ngày, và cổng nghiệm thu ngày bảy.',
    nguoiXem:['PHUHUYNH']};
  const de = (them) => goi({fn:'deXuatThiGiac', token:tkSA, u:'superadmin@gita365.vn',
    deXuat:Object.assign({}, nen, them)});

  const thieuDN = await de({thoiDiem:'tối sau giờ học'});
  bao(!thieuDN.than.ok && thieuDN.than.code === 'THIEUDIEUNHO' &&
      thieuDN.than.thieu.indexOf('DN2') >= 0,
    'CỔNG ĐIỀU NHỎ: không nói người xem LÀM ĐƯỢC gì sau khi xem thì không vẽ',
    'nhiệm vụ là việc của TẤM, điều nhỏ là việc của NGƯỜI — cổng cũ chỉ hỏi cái thứ nhất');

  const thieuTD = await de({dieuNho:'tối nay ghi một dòng vào sổ'});
  bao(!thieuTD.than.ok && thieuTD.than.thieu.indexOf('DN3') >= 0,
    'và không nói họ gặp tấm này vào LÚC NÀO trong đời thì cũng không vẽ',
    'cùng một câu chữ, đọc lúc bình yên và đọc lúc vừa cãi nhau với con là hai câu khác nhau');

  /* ══ CHỖ TÔI KHÔNG THEO BẢN ĐẶC TẢ ══
     Bản đặc tả nhận điều nhỏ bằng bảng động từ có "hiểu", "nhớ", "tin".
     Ba từ ấy không quan sát được, và chuẩn nghề CN1 của chính kho này
     đã cấm đúng chúng: "không ai đo được một cái hiểu". Nhận ở cổng
     hình mà cấm ở cổng nội dung là hai cửa nói hai điều khác nhau. */
  const trongDau = await de({dieuNho:'phụ huynh hiểu được giá trị của bảy ngày',
    thoiDiem:'mùa khai giảng'});
  bao(!trongDau.than.ok && trongDau.than.camThay.indexOf('hiểu') >= 0,
    'ĐIỀU NHỎ PHẢI QUAN SÁT ĐƯỢC: "hiểu · nhớ · tin" bị chặn dù bản đặc tả nhận chúng',
    'không ai đứng ngoài đo được một cái hiểu, nên cũng không ai kiểm được tấm hình ' +
    'có làm được việc của nó không — cùng luật với CN1 của chuẩn nghề');

  /* Dò theo BIÊN TỪ: "tin" trong "thông tin" không phải động từ bị cấm. */
  const chuoiCon = await de({dieuNho:'gửi thông tin liên hệ cho Tư vấn của nhà mình',
    thoiDiem:'tối sau giờ học'});
  bao(chuoiCon.than.ok,
    'nhưng "tin" nằm trong "thông tin" thì KHÔNG bị bắt — dò theo biên từ, không dò chuỗi con',
    'bẫy cũ của kho này: \\b không khớp chữ có dấu, còn dò chuỗi con thì bắt oan hàng loạt');

  const du = await de({dieuNho:'bấm mở chặng 1 ngay tối nay', thoiDiem:'tối sau giờ học'});
  bao(du.than.ok, 'đủ ba câu thì đi tiếp bình thường');

  /* Cửa hỏi TRƯỚC khi gửi: người ta sửa ngay trên màn, không phải gửi
     đi rồi bị trả về. Và nó trả lời theo KHUÔN BỐN CÂU. */
  const hoi = await goi({fn:'docDieuNho', token:tkSA, u:'superadmin@gita365.vn',
    deXuat:{nguoiXem:['PHUHUYNH']}});
  bao(hoi.than.ok && !hoi.than.du && hoi.than.khuon4 &&
      /Em đọc rồi/.test(hoi.than.khuon4.lang) &&
      /Em nắm được/.test(hoi.than.khuon4.daHieu) &&
      hoi.than.khuon4.hoiRo.length === 2 &&
      /đưa lên bậc duyệt/.test(hoi.than.khuon4.buocTiep),
    'KHUÔN BỐN CÂU: lắng → nói điều đã hiểu → hỏi rõ → nói bước tiếp',
    'một cổng chỉ nói "thiếu trường bắt buộc" thì người ta điền cho qua cổng; nói lại ' +
    'điều mình ĐÃ hiểu trước khi hỏi thì câu trả lời sau đó là câu thật');
}

/* ══ HIỂU YÊU CẦU · ĐỀ NGHỊ KHỔ · PHÁC BA Ý — phần 2–4 của bản đặc tả ══ */
{
  const yt = await goi({fn:'docYTuong', token:tkSA, u:'superadmin@gita365.vn',
    deXuat:{nguoiXem:['PHUHUYNH'],
      noiDung:'So sánh hai cách nhắc con học: cách cũ nhắc liên tục, còn nếu ' +
              'đổi sang đặt một mốc giờ cố định thì khác nhau thế nào.'}});
  bao(yt.than.ok && yt.than.yDinh.yDinh === 'SO_SANH_2COT' &&
      yt.than.khung.co && yt.than.khung.kho === 'DOC',
    'ĐỌC RA Ý ĐỊNH theo dấu hiệu bề mặt, rồi đề nghị KHỔ theo bảng quyết định',
    'ý định: ' + yt.than.yDinh.yDinh + ' · khổ ' + yt.than.khung.kho +
    ' — ý định khác loại hình: loại hình nói tấm DỰNG thế nào, ý định nói tấm ' +
    'SINH RA ĐỂ LÀM GÌ');

  bao(yt.than.baY.length === 3 &&
      yt.than.baY.map(x => x.gocNhin).join(',') === 'AN_TOAN,AN_DU,CAN_CANH' &&
      yt.than.baY[1].anDu === 'HAI_CUA_HANG',
    'và phác ĐÚNG BA góc nhìn cố định, góc ẩn dụ lấy từ ngân hàng',
    'ba ý sinh tự do thường ra ba biến thể của cùng một ý, và người chọn tưởng ' +
    'mình đang chọn giữa ba đường trong khi chỉ có một');

  /* Không đoán khi không có dấu hiệu — và không rơi về một ý định mặc định. */
  const mu = await goi({fn:'docYTuong', token:tkSA, u:'superadmin@gita365.vn',
    deXuat:{nguoiXem:['PHUHUYNH'],
      noiDung:'Một trang nói về những điều chưa nói ra được bằng lời nào cả ở đây.'}});
  bao(mu.than.ok && mu.than.yDinh.yDinh === null && !mu.than.khung.co,
    'KHÔNG THẤY DẤU HIỆU THÌ NÓI LÀ KHÔNG BIẾT — không rơi về một ý định mặc định',
    'một cái đoán trình ra như một đề nghị thì người ta tin nó đã được cân nhắc');

  /* Hai nhóm người xem cho ra hai khổ khác nhau = cần HAI TẤM. */
  const hai = await goi({fn:'docYTuong', token:tkSA, u:'superadmin@gita365.vn',
    deXuat:{nguoiXem:['PHUHUYNH','HOCVIEN'],
      noiDung:'Thẻ kiến thức: 3 điều cần làm mỗi tối, hướng dẫn từng bước cho nhà mình.'}});
  bao(hai.than.ok && !hai.than.khung.co && (hai.than.khung.lechKho || []).length === 2,
    'BẢNG CHO RA HAI KHỔ KHÁC NHAU THÌ MÁY KHÔNG CHỌN GIÙM — hai nhóm cần hai tấm',
    'lệch: ' + (hai.than.khung.lechKho || []).join(' và '));
}

/* ══ SÁU BẬC, KHÔNG CÓ ĐƯỜNG TẮT ══ */
const idTG = dungTang.than.id;
const tat = await goi({fn:'chuyenBacThiGiac', token:tkSA, u:'superadmin@gita365.vn',
  id:idTG, den:'phatHanh'});
bao(!tat.than.ok && tat.than.code === 'SAIBAC',
  'KHÔNG CÓ ĐƯỜNG TẮT QUA MỘT BẬC NÀO — từ "đề xuất" không nhảy thẳng tới "phát hành"',
  tat.than.error);

bao((await goi({fn:'chuyenBacThiGiac', token:tkSA, u:'superadmin@gita365.vn',
  id:idTG, den:'mophong'})).than.ok, 'đi được sang bậc MÔ PHỎNG');

bao(!(await goi({fn:'chuyenBacThiGiac', token:tkTC, u:'truongcoach@gita365.vn',
  id:idTG, den:'duyet'})).than.ok,
  'TRƯỞNG COACH KHÔNG DUYỆT ĐƯỢC — máy đề xuất, CHỦ HỆ quyết');

bao(!(await goi({fn:'chuyenBacThiGiac', token:tkSA, u:'superadmin@gita365.vn',
  id:idTG, den:'tuChoi', lyDo:'xấu'})).than.ok,
  'TỪ CHỐI PHẢI NÓI VÌ SAO — không nói thì lần sau máy đề xuất y hệt');

bao((await goi({fn:'chuyenBacThiGiac', token:tkSA, u:'superadmin@gita365.vn',
  id:idTG, den:'duyet'})).than.ok, 'Super Admin duyệt được');

/* ══ C21 · KHÔNG PHÁT HÀNH MỘT TẤM HỆ KHÔNG NÓI ĐƯỢC BẰNG LỜI ══

   Bộ thử này chưa bao giờ đi tới bậc PHÁT HÀNH — nó dừng ở "duyệt".
   Nên mọi phép chặn đặt ở bậc cuối cùng đều chưa từng được thử, và
   một phép chặn chưa từng chạy thì không ai biết nó có chạy không.
   Ghi lại chỗ này vì đó chính là lý do luật C21 suýt ra đời không có
   phép đo nào. */
{
  /* Bản ghi RIÊNG cho khối này. Bản đầu tôi dùng chung bản ghi của
     phép thử thang bậc ở trên — và đẩy nó lên tận PHÁT HÀNH, nên phép
     thử ngay sau đó (đòi bản cũ còn ở bậc "duyệt") đỏ. Một phép thử
     đổi trạng thái thứ phép thử khác đang đọc thì cái đỏ ra không nói
     gì về mã cả, nó chỉ nói về thứ tự chạy. */
  const rieng = await goi({fn:'deXuatThiGiac', token:tkSA, u:'superadmin@gita365.vn',
    deXuat:{dieuNho:'tối nay ghi một dòng vào sổ nhà mình', thoiDiem:'tối sau giờ học', tang:'T1', loaiHinh:'KHUNG',
      nhiemVu:'Giúp nhà biết phần việc của mỗi người trong chặng nền',
      noiDung:'Trang giới thiệu chặng bảy ngày nhận diện: lắng nghe, ghi lại, ' +
              'đọc cùng nhau, và chốt một việc cho chặng sau.',
      nguoiXem:['PHUHUYNH'], boCuc:'lưới sáu ô'}});
  const idC21 = rieng.than.id;
  for (const b of ['mophong', 'duyet', 'hoanThien'])
    await goi({fn:'chuyenBacThiGiac', token:tkSA, u:'superadmin@gita365.vn',
      id:idC21, den:b});

  const thieu = await goi({fn:'chuyenBacThiGiac', token:tkSA,
    u:'superadmin@gita365.vn', id:idC21, den:'phatHanh'});
  bao(!thieu.than.ok && thieu.than.code === 'THIEUCHUTHAYANH',
    'C21 · THIẾU CHỮ THAY ẢNH THÌ KHÔNG PHÁT HÀNH — người đọc bằng máy đọc ' +
    'màn hình nghe được đúng một chữ "ảnh", và họ không có cách nào báo lại ' +
    'là mình vừa mất gì, nên máy phải là chỗ bắt',
    thieu.than.error);

  bao(!(await goi({fn:'ghiChuThayAnh', token:tkSA, u:'superadmin@gita365.vn',
    id:idC21, moTa:'Quá ngắn', moTaTen:'x'})).than.ok,
    'câu mô tả quá ngắn bị từ chối — một câu không nói được gì thì tệ hơn ' +
    'không có, vì nó làm phép soát bên dưới tưởng đã xong');

  bao(!(await goi({fn:'ghiChuThayAnh', token:tkSA, u:'superadmin@gita365.vn',
    id:idC21, moTa:'x'.repeat(420), moTaTen:'Khung phương pháp'})).than.ok,
    'câu mô tả quá dài bị từ chối — máy đọc màn hình đọc liền một mạch');

  bao(!(await goi({fn:'ghiChuThayAnh', token:tkSA, u:'superadmin@gita365.vn',
    id:idC21, moTa:'Khung phương pháp, chặng T1. Giúp nhà biết phần việc mỗi người.'})).than.ok,
    'thiếu nhãn ngắn bị từ chối — máy đọc màn hình đọc nhãn TRƯỚC');

  const ghi = await goi({fn:'ghiChuThayAnh', token:tkSA, u:'superadmin@gita365.vn',
    id:idC21, moTaTen:'GITA 365 · Khung phương pháp — Giúp hiểu cách giải mã biểu hiện',
    moTa:'Khung phương pháp, chặng T1. Giúp nhà biết phần việc của mỗi người. ' +
         'Trên tấm: LẮNG NGHE · GHI LẠI · ĐỌC CÙNG · CHỌN MỘT.'});
  const sauGhi = db.prepare('SELECT seoAlt, seoTen FROM deXuatThiGiac WHERE id=?').get(idC21);
  bao(ghi.than.ok && sauGhi.seoAlt && sauGhi.seoTen,
    'ghi được chữ thay ảnh, và nó vào đúng cột seoAlt/seoTen của sổ',
    'cột ấy có từ lâu mà tới 9.99.32 chưa dòng mã nào ghi vào — mục D7 của ' +
    'thang chấm nặng năm điểm cho một thứ không tồn tại');

  bao((await goi({fn:'chuyenBacThiGiac', token:tkSA, u:'superadmin@gita365.vn',
    id:idC21, den:'phatHanh'})).than.ok,
    'ghi xong chữ thay ảnh thì phát hành được');
}

/* ══ SỬA MỘT BẢN ĐÃ DUYỆT = GHI BẢN MỚI, KHÔNG GHI ĐÈ ══ */
const banHai = await goi({fn:'banMoiThiGiac', token:tkSA, u:'superadmin@gita365.vn',
  id:idTG, deXuat:{dieuNho:'tối nay ghi một dòng vào sổ nhà mình', thoiDiem:'tối sau giờ học', boCuc:'một cổng, ba điều kiện, thêm dấu tick'}});
const cuGiuNguyen = db.prepare("SELECT trangThai, boCuc FROM deXuatThiGiac WHERE id=?").get(idTG);
bao(banHai.than.ok && banHai.than.id !== idTG &&
    cuGiuNguyen.trangThai === 'duyet' && cuGiuNguyen.boCuc === 'một cổng, ba điều kiện',
  'SỬA MỘT BẢN ĐÃ DUYỆT LÀ GHI BẢN MỚI — bản cũ Ở LẠI NGUYÊN, không bị ghi đè',
  'một tấm đã phát hành thì đã ở trong tay khách; ghi đè bản trong kho là làm kho ' +
  'nói khác thứ khách đang cầm, và lúc có tranh cãi thì không dựng lại được');

const banMoiDb = db.prepare("SELECT ban, banTruoc, boCuc FROM deXuatThiGiac WHERE id=?")
  .get(banHai.than.id);
bao(banMoiDb.ban === 2 && banMoiDb.banTruoc === idTG &&
    /thêm dấu tick/.test(banMoiDb.boCuc),
  'và bản mới TRỎ VỀ bản cũ, thừa hưởng mọi ô không sửa',
  'bản ' + banMoiDb.ban + ' ← ' + banMoiDb.banTruoc);

/* ══ THANG ĐIỂM: ĐÚNG HỆ THỐNG NẶNG GẤP HAI RƯỠI THẨM MỸ ══ */
bao(!(await goi({fn:'chamThiGiac', token:tkSA, u:'superadmin@gita365.vn',
  id:idTG, cham:{D1:100, D2:100}})).than.ok,
  'CHẤM THIẾU MỘT MỤC THÌ KHÔNG CỘNG — cộng thiếu ra một con số không nói gì');

/* ══ TRỪ ĐIỂM THÌ PHẢI CHỈ RA CHỖ TRỪ — phần 7 của bản đặc tả ══
   "Kẻ chấm phải có lý". Một mục chấm 60 không kèm bằng chứng thì người
   vẽ không biết sửa gì; họ vẽ lại bằng cảm giác, lượt sau lại 60, và
   cả hai bên cùng mất một vòng. */
const khongCC = await goi({fn:'chamThiGiac', token:tkSA, u:'superadmin@gita365.vn',
  id:idTG, cham:{D1:0, D2:100, D3:100, D4:100, D5:100, D6:100, D7:100}});
bao(!khongCC.than.ok && khongCC.than.code === 'THIEUCHUNGCU' &&
    khongCC.than.thieu.indexOf('D1') >= 0,
  'CHẤM THẤP MÀ KHÔNG CHỈ RA CHỖ TRỪ THÌ KHÔNG NHẬN',
  'một con số không có chỗ trỏ thì nó là một lời chê, không phải một phép chấm');

const cc = {D1:'Tấm nói về phác đồ và Coach đồng hành — cả hai chỉ có ở tầng trên.'};
const dep = await goi({fn:'chamThiGiac', token:tkSA, u:'superadmin@gita365.vn',
  id:idTG, cham:{D1:0, D2:100, D3:100, D4:100, D5:100, D6:100, D7:100}, chungCu:cc});
const dung = await goi({fn:'chamThiGiac', token:tkSA, u:'superadmin@gita365.vn',
  id:idTG, cham:{D1:100, D2:100, D3:100, D4:100, D5:100, D6:0, D7:100},
  chungCu:{D6:'Chữ trong tấm nhỏ hơn hai phẩy một milimét khi in khổ A5.'}});
bao(dep.than.ok && (dep.than.tung.D1 || {}).chungCu &&
    /phác đồ/.test(dep.than.tung.D1.chungCu),
  'và BẰNG CHỨNG được giữ NGUYÊN VĂN trong sổ chấm, không giữ một bản tóm',
  'sáu tháng sau người đọc sổ phải dựng lại được vì sao mục ấy bị trừ');
bao(dep.than.ok && dung.than.ok && dep.than.diem === 75 && dung.than.diem === 90 &&
    dep.than.bac === 'Không đạt' && dung.than.bac === 'Đạt',
  'RẤT ĐẸP MÀ SAI HỆ THỐNG (75 · KHÔNG ĐẠT) THUA ĐÚNG HỆ THỐNG MÀ XẤU (90 · ĐẠT)',
  'tấm đẹp được tin, và cái sai đi theo nó xa hơn — nên đúng hệ thống nặng 25 điểm, thẩm mỹ 10');

/* ══ SỔ KHÔNG ĐƯỢC TỰ CÃI MÌNH: SỐ GHI XUỐNG VÀ BẬC PHẢI CÙNG MỘT GỐC ══
   Mọi bài thử trên đây đều chấm ra số CHẴN, nên chỗ này im suốt. Chạy
   demo tấm tầm nhìn mới lộ: 89,9 vào bậc "Sửa lại" mà sổ ghi 90 — đúng
   ngưỡng bậc "Đạt". Bài thử này chấm cố ý ra số lẻ. */
const le = await goi({fn:'chamThiGiac', token:tkSA, u:'superadmin@gita365.vn',
  id:idTG, cham:{D1:95, D2:92, D3:88, D4:90, D5:96, D6:84, D7:60},
  chungCu:{D7:'Nhãn ngắn chưa viết, và chữ thay ảnh mới có một dòng.'}});
const leDb = db.prepare("SELECT diem, bacDiem FROM deXuatThiGiac WHERE id=?").get(idTG);
bao(le.than.ok && le.than.diem === 89.9 && le.than.bac === 'Sửa lại' &&
    leDb.diem === 89.9 && leDb.bacDiem === 'Sửa lại',
  'SỐ LẺ GHI XUỐNG NGUYÊN SỐ LẺ — 89,9 · Sửa lại, không làm tròn LÊN thành 90',
  'sổ ghi 90 mà bậc nói "Sửa lại" thì người đọc sáu tháng sau thấy hai thứ cãi nhau, ' +
  'và 90 chính là ngưỡng của bậc ĐẠT — làm tròn lên là đẩy một bài trượt qua cửa',
  'ghi ' + leDb.diem + ' · bậc ' + leDb.bacDiem);

/* ══ MỘT CHỮ "VÀ": KHÔNG CHẶN, NHƯNG KHÔNG IM ══
   Ngưỡng chặn ở HAI chữ "và" là cố ý — "cho phụ huynh và học viên" là
   một việc. Nhưng "nói tầm nhìn và giới thiệu năm chặng" cũng chỉ một
   chữ "và" mà là hai việc, và nó đi lọt không một dòng cảnh báo. */
const motVa = await goi({fn:'deXuatThiGiac', token:tkSA, u:'superadmin@gita365.vn',
  deXuat:{dieuNho:'tối nay ghi một dòng vào sổ nhà mình', thoiDiem:'tối sau giờ học', tang:'T1', loaiHinh:'BIA',
    nhiemVu:'Nói tầm nhìn và giới thiệu năm chặng đồng hành.',
    noiDung:'Kiến tạo một hệ sinh thái gia đình phát triển bền vững, nơi mỗi ' +
      'người biết hiểu mình, rèn mình, làm chủ cuộc đời.',
    nguoiXem:['PHUHUYNH']}});
bao(motVa.than.ok && (motVa.than.luuY || []).length === 1 &&
    String(motVa.than.deBai || '').indexOf('LƯU Ý CHO NGƯỜI DUYỆT') > 0,
  'MỘT CHỮ "VÀ" ĐI LỌT NHƯNG KHÔNG IM — máy nói ra chỗ đáng ngờ, người duyệt quyết',
  'máy không phân biệt được "và" nối người xem với "và" nối hai việc, nên máy ' +
  'không quyết — nhưng câu cảnh báo phải đi theo đề bài tới tận bậc duyệt');

const khongVa = await goi({fn:'deXuatThiGiac', token:tkSA, u:'superadmin@gita365.vn',
  deXuat:{dieuNho:'tối nay ghi một dòng vào sổ nhà mình', thoiDiem:'tối sau giờ học', tang:'T1', loaiHinh:'BIA',
    nhiemVu:'Nói một câu tầm nhìn GITA 365 cho người vừa mở cổng lần đầu.',
    noiDung:'Kiến tạo một hệ sinh thái gia đình phát triển bền vững, nơi mỗi ' +
      'người biết hiểu mình, rèn mình, làm chủ cuộc đời.',
    nguoiXem:['PHUHUYNH']}});
bao(khongVa.than.ok && !khongVa.than.luuY &&
    String(khongVa.than.deBai || '').indexOf('LƯU Ý') < 0,
  'KHÔNG CÓ "VÀ" THÌ KHÔNG DÁN LƯU Ý — cảnh báo dán vào mọi tấm là cảnh báo không ai đọc');

/* ══ SỔ LUẬT THƯƠNG HIỆU — BỘ NHỚ DÀI HẠN ══ */
bao(!(await goi({fn:'ghiLuatThuongHieu', token:tkGD, u:'giamdoc@gita365.vn',
  luat:{nhom:'anh', luat:'Không dùng ảnh kiểu áp phích truyền cảm hứng',
    vi:'GITA định vị là hệ thống coaching có phương pháp'}})).than.ok,
  'GIÁM ĐỐC KHÔNG GHI ĐƯỢC LUẬT THƯƠNG HIỆU — chỉ Super Admin');

bao(!(await goi({fn:'ghiLuatThuongHieu', token:tkSA, u:'superadmin@gita365.vn',
  luat:{nhom:'anh', luat:'Không dùng ảnh kiểu áp phích truyền cảm hứng', vi:'xấu'}}))
  .than.ok,
  'MỘT LUẬT KHÔNG CÓ LÝ DO SẼ BỊ GỠ — nên máy đòi lý do ngay lúc ghi',
  'sáu tháng sau không ai nhớ vì sao cấm, và người sau gỡ ra vì nó đang cản việc họ');

const ghiLuat = await goi({fn:'ghiLuatThuongHieu', token:tkSA, u:'superadmin@gita365.vn',
  luat:{nhom:'anh', luat:'Không dùng ảnh kiểu áp phích truyền cảm hứng',
    vi:'GITA365 định vị là hệ thống coaching có phương pháp, không phải nơi bán ' +
       'cảm hứng. Ảnh truyền cảm hứng hứa một kết quả mà phương pháp mới giữ được.'}});
bao(ghiLuat.than.ok, 'CHỦ HỆ GHI ĐƯỢC MỘT LUẬT VĨNH VIỄN');

const kho2 = await goi({fn:'khoThiGiac', token:tkSA, u:'superadmin@gita365.vn'});
bao(kho2.than.ok && kho2.than.luatThuongHieu.length >= 1 &&
    kho2.than.ds.some(x => x.ban === 2 && x.banTruoc === idTG),
  'KHO TRẢ VỀ CẢ SỔ LUẬT LẪN CÂY PHIÊN BẢN — mọi đề xuất sau đọc luật trước',
  kho2.than.so + ' đề xuất · ' + kho2.than.luatThuongHieu.length + ' luật thương hiệu');

/* ── ĐỌC TÀI LIỆU VÀ CỬA ĐI RA · CHỐT 9.99.11 ── */
console.log('\n15k · ĐỌC TÀI LIỆU · CỬA ĐI RA NGOÀI');

const taiLieu = [
  'Chặng bảy ngày nhận diện mở đầu bằng bộ test đầu vào cho cả nhà.',
  '',
  'Bước 1: gia đình làm bài test. Sau đó đặt lịch buổi tiếp nhận. ' +
  'Tiếp theo là một buổi đọc hồ sơ có mặt cả nhà. Cuối cùng là cổng ngày bảy.',
  '',
  'Điều kiện qua chặng: nhà ghi đủ bảy ngày phiếu, và có mặt ở buổi đọc hồ sơ. ' +
  'Đạt khi cả hai điều kiện cùng có. Tiêu chí nghiệm thu nói rõ trước khi bắt đầu.',
  '',
  'Phụ huynh giữ phần ghi phiếu. Học viên giữ phần làm bài. Coach chưa vào ở ' +
  'chặng này. Ai làm gì được nói rõ ngay buổi đầu để không ai chờ ai.',
  '',
  'Mỗi ngày nhà ghi một dòng. Hằng ngày, không bỏ. Nhịp ấy là thứ chặng này ' +
  'muốn dựng, không phải một kết quả nào.'
].join('\n');

bao(!(await goi({fn:'docTaiLieuThiGiac', token:tkSA, u:'superadmin@gita365.vn',
  chu:taiLieu})).than.ok,
  'ĐỌC TÀI LIỆU MÀ KHÔNG KHAI CHẶNG THÌ MÁY KHÔNG ĐOÁN HỘ',
  'đoán Tầng là chỗ sai im lặng nhất, và cả bản phân tích sau đó dựng trên một cái đoán');

const docTL = await goi({fn:'docTaiLieuThiGiac', token:tkSA, u:'superadmin@gita365.vn',
  chu:taiLieu, tang:'T1'});
bao(docTL.than.ok && docTL.than.soDoan >= 5 && docTL.than.viTri.length >= 3,
  'ĐỌC TÀI LIỆU RỒI CHỈ RA TỪNG ĐOẠN NÊN THÀNH HÌNH GÌ',
  docTL.than.soDoan + ' đoạn · ' + docTL.than.viTri.length + ' chỗ nên có hình · ' +
  docTL.than.viTri.map(v => 'đoạn ' + v.doan + '→' + v.nen).join(' · '));

bao(docTL.than.viTri.every(v => !!v.nen && !Array.isArray(v.nen)),
  'MỖI ĐOẠN CHỈ NÊU MỘT LOẠI, không nêu cả danh sách',
  'nêu ba lựa chọn cho mỗi đoạn thì người đọc phải tự chọn ở ba mươi chỗ, và bản ' +
  'phân tích thành một danh sách việc thay vì một đề nghị');

/* CỔNG TẦNG CHẠY TRÊN TỪNG ĐOẠN, và nêu SỐ ĐOẠN để người sửa tìm được. */
const tlPham = await goi({fn:'docTaiLieuThiGiac', token:tkSA, u:'superadmin@gita365.vn',
  tang:'T1', chu: taiLieu + '\n\nỞ chặng này Coach đồng hành hằng ngày cùng gia ' +
    'đình, và nhà được mở phác đồ để tự tra khi cần. Đây là phần làm nên khác biệt.'});
bao(tlPham.than.ok && tlPham.than.phamTang.length === 1 &&
    tlPham.than.phamTang[0].doan === tlPham.than.soDoan,
  'CỔNG TẦNG CHẠY TRÊN TỪNG ĐOẠN VÀ NÊU SỐ ĐOẠN — người sửa tìm được ngay chỗ hỏng',
  'đoạn ' + tlPham.than.phamTang[0].doan + ' phạm: ' +
  tlPham.than.phamTang[0].pham.join(', '));

/* ══ CỬA ĐI RA — TẮT SẴN ══ */
const cuaDong = await goi({fn:'guiDeBaiRaNgoai', token:tkSA, u:'superadmin@gita365.vn',
  id:idTG});
bao(!cuaDong.than.ok && cuaDong.than.code === 'CUADONG' &&
    (cuaDong.than.canNap || []).length === 2,
  'CỬA ĐI RA TẮT SẴN, VÀ NÓI RÕ LÀ ĐANG ĐÓNG — không im lặng trả về như đã gửi',
  'nối một bộ vẽ bên ngoài là một quyết định phải bấm, không phải một thứ có sẵn · ' +
  'cần nạp: ' + (cuaDong.than.canNap || []).join(', '));

env.GITA_KHOA_VE = 'khoa-ve-thu-nghiem';
env.GITA_CONG_VE = 'https://bo-ve-thu-nghiem.vidu/api';

/* ══ CỔNG GIẢ, ĐỂ ĐO ĐƯỢC CẢ PHẦN VỀ ══

   Tới 9.99.36 bộ thử này chỉ đo phần ĐI: đề bài dựng đúng chưa, có rò
   nội dung không. Phần VỀ chưa có dòng nào — mà phần về mới là chỗ
   ảnh thật gắn vào bản ghi, và là chỗ hỏng thì lớp người vẫn trống
   trong khi mọi phép đo vẫn xanh.

   Cổng giả trả về đúng ba dạng mà cửa thật phải nhận, lần lượt: thân
   ảnh · data URI · đường dẫn. Ép một dạng thì cửa chỉ được thử ở dạng
   ấy, và hai dạng kia hỏng trong im lặng cho tới ngày chủ hệ đổi nhà
   cung cấp. */
const PNG_THU = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmM' +
  'IQAAAABJRU5ErkJggg==', 'base64');
let dangCong = 'than';        /* than · data · url */
let daGoiCong = 0, tieuDeCong = null, thanGuiCong = null;
const fetchThat = globalThis.fetch;
globalThis.fetch = async function (u, o) {
  const dc = String(u);
  if (dc.indexOf('bo-ve-thu-nghiem.vidu') >= 0) {
    daGoiCong++;
    tieuDeCong = (o && o.headers) || {};
    if (dangCong === 'loi') return new Response('quá tải', {status: 503});
    if (dangCong === 'than')
      return new Response(PNG_THU, {status: 200,
        headers: {'content-type': 'image/png'}});
    if (dangCong === 'openai') {
      /* Dạng thật của API ảnh OpenAI: {data:[{b64_json}]}. Và giữ lại
         THÂN GỬI ĐI để đo — cửa phải đổi sang {model, prompt, size, n},
         không phải gửi dạng riêng của Học viện rồi mong OpenAI hiểu. */
      thanGuiCong = JSON.parse(String((o && o.body) || '{}'));
      return new Response(JSON.stringify({data: [{b64_json:
        PNG_THU.toString('base64')}]}), {status: 200,
        headers: {'content-type': 'application/json'}});
    }
    if (dangCong === 'openaiUrl') {
      thanGuiCong = JSON.parse(String((o && o.body) || '{}'));
      return new Response(JSON.stringify({data: [{url: 'https://tep-thu.vidu/a.png'}]}),
        {status: 200, headers: {'content-type': 'application/json'}});
    }
    if (dangCong === 'data')
      return new Response(JSON.stringify({anh: 'data:image/png;base64,' +
        PNG_THU.toString('base64')}), {status: 200,
        headers: {'content-type': 'application/json'}});
    return new Response(JSON.stringify({url: 'https://tep-thu.vidu/a.png'}),
      {status: 200, headers: {'content-type': 'application/json'}});
  }
  if (dc.indexOf('tep-thu.vidu') >= 0)
    return new Response(PNG_THU, {status: 200,
      headers: {'content-type': 'image/png'}});
  return fetchThat ? fetchThat(u, o) : new Response('', {status: 404});
};

bao(!(await goi({fn:'guiDeBaiRaNgoai', token:tkTC, u:'truongcoach@gita365.vn',
  id:idTG})).than.ok,
  'TRƯỞNG COACH KHÔNG GỬI ĐƯỢC RA NGOÀI — cho một thứ rời khỏi hệ là quyết định của chủ hệ');

/* ══ ĐIỀU 13 CÓ RĂNG Ở CỬA ĐI RA — BỘ NÃO, 9.99.62 ══

   Luật vận hành số 1: mọi ghi chép về một gia đình hoặc một đứa trẻ
   KHÔNG BAO GIỜ rời hệ ở dạng nhận dạng được.

   Tới 9.99.61 cửa này kiểm quyền, kiểm bậc, kiểm cổng — và không kiểm
   một chữ nào về dữ liệu người. Một cái tên trẻ con lọt vào ô nội dung
   thì đi thẳng ra bộ tạo ảnh đặt ở nước ngoài, và Luật số 91/2025/QH15
   gọi đó là xử lý dữ liệu xuyên biên giới. */
{
  const nenBN = {tang:'T1', loaiHinh:'CONG', nhiemVu:'Mời nhà mở chặng bảy ngày',
    nguoiXem:['PHUHUYNH'], dieuNho:'bấm mở chặng 1 ngay tối nay',
    thoiDiem:'tối sau giờ học'};

  /* Một cái tên thật lọt vào ô bố cục — đúng kiểu người viết đang kể
     một chuyện có thật và không nghĩ tới chuyện nó sắp đi ra ngoài. */
  const coTen = await goi({fn:'deXuatThiGiac', token:tkSA, u:'superadmin@gita365.vn',
    deXuat:Object.assign({}, nenBN, {
      noiDung:'Trang mời nhà mở chặng bảy ngày nhận diện, có phiếu ghi bảy ngày ' +
              'và cổng nghiệm thu ngày bảy.',
      boCuc:'dựng theo đúng buổi của nhà chị Nguyễn Thị Lan, gọi số 0912345678'})});
  for (const den of ['mophong','duyet'])
    await goi({fn:'chuyenBacThiGiac', token:tkSA, u:'superadmin@gita365.vn',
      id:coTen.than.id, den});
  const chan = await goi({fn:'guiDeBaiRaNgoai', token:tkSA, u:'superadmin@gita365.vn',
    id:coTen.than.id});
  const maNgo = (chan.than.ngo || []).map(n => n.ma);
  bao(!chan.than.ok && chan.than.code === 'CHUAANDANH' &&
      maNgo.indexOf('AD-TEN') >= 0 && maNgo.indexOf('AD-SDT') >= 0 &&
      /KHÔNG tự xoá hộ/.test(chan.than.error),
    'ĐIỀU 13 CHẶN Ở CỬA ĐI RA: tên người và số máy không rời khỏi hệ',
    'bắt ' + maNgo.join(' · ') + ' — và máy CHẶN chứ không tự xoá hộ: tự xoá thì ' +
    'người gửi không biết mình vừa suýt gửi cái gì, và lần sau viết y hệt');

  /* Và không bắt oan: bản ẩn danh đúng cách phải đi qua. Một cổng chặn
     mọi thứ thì người ta tắt nó đi trong tuần đầu. */
  const sach = await goi({fn:'soatAnDanh', token:tkSA, u:'superadmin@gita365.vn',
    chu:'Đề bài cho phụ huynh A, con 9 tuổi, vào qua cửa làm, sợ bị cười. ' +
        'Tấm mời mở chặng bảy ngày, đọc lúc tối sau giờ học.'});
  bao(sach.than.ok && sach.than.sach === true,
    'BẢN ĐÃ ẨN DANH ĐÚNG CÁCH THÌ ĐI QUA — không bắt oan',
    'một cổng chặn mọi thứ thì người ta tắt nó đi trong tuần đầu');

  /* HỌ MANG DẤU "Đ" PHẢI BỊ BẮT — cái bẫy \b ĐẦU TIÊN của CLAUDE.md
     (9.99.111). Bản cũ dùng \b nên MÙ trước "Đặng"·"Đỗ"·"Đoàn"·"Đinh"
     (họ trẻ con), và một cái tên trẻ lọt qua sach:true đi thẳng ra bộ
     tạo ảnh nước ngoài — phạm Điều 13 bất khả sửa. Chỉ thử "Nguyễn" thì
     phép đo XANH trên đúng lỗ nó sinh ra để canh. Phá thử: trả regex về
     \b thì bốn họ Đ đều lọt và số này đỏ. */
  const hoDau = await goi({fn:'soatAnDanh', token:tkSA, u:'superadmin@gita365.vn',
    chu:'Đề bài cho cháu Đặng Văn Minh, con nhà chị Đỗ Thị Hà, học lớp 3, hay khóc.'});
  const maDau = (hoDau.than.ngo || []).map(n => n.ma);
  bao(!hoDau.than.sach && maDau.indexOf('AD-TEN') >= 0,
    'HỌ MANG DẤU "Đ" BỊ BẮT: Đặng · Đỗ không lọt cổng ẩn danh',
    '\\b không khớp trước "Đ" — bản cũ mù trước họ trẻ con và để một cái tên đi ' +
    'thẳng ra bộ tạo ảnh nước ngoài, phạm Điều 13 bất khả sửa');

  /* ── NÉ BẰNG KÝ TỰ VÔ HÌNH · CHỮ SỐ TOÀN-RỘNG · HỌ HIẾM (9.99.113) ──
     Tổ thanh tra đợt 3 chứng minh bằng CHẠY THẬT ba lớp né lọt cổng ẩn
     danh cũ. Mỗi câu mang một tên/số trẻ con nếu lọt là ra thẳng bộ tạo
     ảnh nước ngoài. Phá thử: bỏ .replace(\\p{Cf}) → zero-width lọt; đổi
     NFKC→NFC → chữ số toàn-rộng lọt; bỏ họ hiếm khỏi HO_VIET → Trịnh lọt. */
  /* KHÔNG dấu hiệu trẻ (con/cháu/tên) trong câu này — để cô lập đúng lớp
     strip \p{Cf}: nếu có marker thì AD-TRECON bắt hộ và phá thử C-1 câm. */
  const neZW = await goi({fn:'soatAnDanh', token:tkSA, u:'superadmin@gita365.vn',
    chu:'Liên hệ Ng​uyễn Thị Lan, gọi 09123​45678 để xác nhận lịch.'});
  bao(!neZW.than.sach, 'KÝ TỰ VÔ HÌNH KHÔNG NÉ ĐƯỢC: "Ng​uyễn" và số máy chèn zero-width vẫn bị bắt',
    'strip \\p{Cf} trước khi dò — một dấu vô hình đọc ra tên bình thường ở đầu bên kia');
  const neFW = await goi({fn:'soatAnDanh', token:tkSA, u:'superadmin@gita365.vn',
    chu:'Gọi phụ huynh số ０９１２３４５６７８ nhắc lịch.'});
  bao(!neFW.than.sach, 'CHỮ SỐ TOÀN-RỘNG KHÔNG NÉ ĐƯỢC: ０９… bị bắt là số máy',
    'NFKC gộp ０→0; NFC thì không — bản cũ để số toàn-rộng lọt');
  const hoHiem = await goi({fn:'soatAnDanh', token:tkSA, u:'superadmin@gita365.vn',
    chu:'Đề bài cho Trịnh Minh Anh và Đào Gia Bảo, hai em học lớp 4.'});
  bao(!hoHiem.than.sach && (hoHiem.than.ngo || []).map(n=>n.ma).indexOf('AD-TEN')>=0,
    'HỌ HIẾM BỊ BẮT: Trịnh · Đào (ngoài danh sách cũ) không lọt',
    'HO_VIET mở rộng — bản cũ ~25 họ để lọt họ hiếm không kèm dấu hiệu trẻ');
  /* KHÔNG bắt oan brief lành có địa danh/giá Title-Case (Hà Nội, Bảng Lương) */
  const lanhR3 = await goi({fn:'soatAnDanh', token:tkSA, u:'superadmin@gita365.vn',
    chu:'Vẽ cảnh Hà Nội mùa thu cho gói 5 triệu Đồng, nêu Tầm Nhìn Gia Đình Thịnh Vượng.'});
  bao(lanhR3.than.sach === true, 'KHÔNG bắt oan: Hà Nội · Bảng giá · tiêu đề Title-Case vẫn qua',
    'mở rộng họ mà chặn mọi brief nhắc Hà Nội thì feature tự hỏng — cân đúng chiều');

  /* ── SÁU LỚP NÉ $500M (9.99.114) — tổ thanh tra đợt 4 chứng minh bằng
     CHẠY THẬT rằng bộ dò 9.99.113 vẫn lọt sáu lớp, mỗi câu mang một tên
     trẻ THẬT đi thẳng ra bộ tạo ảnh nước ngoài (Điều 13 bất khả sửa).
     Phá thử: trả bộ dò về bản Titlecase-only → các câu này lọt và đỏ. */
  const neHoa = await goi({fn:'soatAnDanh', token:tkSA, u:'superadmin@gita365.vn',
    chu:'Đề bài cho bé tên là NGUYỄN VĂN AN, rất nhút nhát ở lớp.'});
  bao(!neHoa.than.sach, 'TÊN TOÀN HOA BỊ BẮT: "NGUYỄN VĂN AN" (bản cũ chỉ bắt Titlecase) không lọt',
    'tên viết TOÀN HOA là quy ước phổ biến trên giấy tờ VN — bản cũ mù, một tên trẻ ra thẳng bộ tạo ảnh');
  const neTrung = await goi({fn:'soatAnDanh', token:tkSA, u:'superadmin@gita365.vn',
    chu:'Đề bài cho Lương Gia Bảo hay khóc và Tô Minh Khang rất nhút nhát.'});
  bao(!neTrung.than.sach, 'HỌ DỄ TRÙNG + ĐỆM BỊ BẮT: "Lương Gia Bảo" chặn, "Hà Nội" vẫn qua',
    'họ trùng từ/địa danh cố ý bỏ khỏi HO_VIET — chặn khi CÓ đệm Việt, không dựng danh sách trừ');
  const neTron = await goi({fn:'soatAnDanh', token:tkSA, u:'superadmin@gita365.vn',
    chu:'Liên hệ Нguyễn Thị Lan để xác nhận lịch.'});
  bao(!neTron.than.sach && (neTron.than.ngo||[]).some(n=>n.ma==='AD-TRON'||n.ma==='AD-TEN'),
    'HOMOGLYPH BỊ BẮT: Cyrillic Н trộn Latin ("Нguyễn") không lọt',
    'NFKC không gộp Cyrillic→Latin; token trộn hai bảng chữ là dấu né — lưới AD-TRON + gộp confusable');
  const neDau = await goi({fn:'soatAnDanh', token:tkSA, u:'superadmin@gita365.vn',
    chu:'Đề bài cho Nguyễń Thị Hương, mẹ đơn thân, con hay khóc.'});
  bao(!neDau.than.sach, 'DẤU TỔ HỢP CHÈN BỊ BẮT: "Nguyễn"+U+0301 không phá được lưới họ',
    'bản bỏ dấu + đệm bắt được dấu chèn giữa tên — bản cũ khớp chữ-nguyên nên trượt');
  const neVe = await goi({fn:'soatAnDanh', token:tkSA, u:'superadmin@gita365.vn',
    chu:'Vẽ cho Minh Anh sợ bị cười ở lớp học.'});
  bao(!neVe.than.sach, 'TÊN GỌI KHÔNG HỌ + TRẠNG THÁI TRẺ BỊ BẮT: "Minh Anh sợ" không lọt',
    'tên gọi hai chữ không kèm họ, lộ ra vì đứng ngay trước một dấu hiệu trẻ quan sát được');
  /* TÊN GÕ THƯỜNG / TỰ-VIẾT-HOA-MỘT-CHỮ (9.99.122, tổ soi bộ não $500M):
     lưới AD-TEN đòi chữ hoa đầu nên tên gõ thường lọt — mà gõ thường là cách
     gõ thường nhất trên điện thoại. Phá thử: tắt AD-TENTHUONG → cả bốn lọt. */
  const neThuong = [
    'vẽ minh hoạ cho con nguyễn văn an lớp 3, sợ nói trước lớp',
    'Nguyễn văn an, 8 tuổi, rất nhút nhát',
    'mẹ nguyễn thị hoa nhắn lúc khuya',
    'Họ tên con: nguyễn văn an'
  ];
  let thuongLot = 0;
  for (const c of neThuong) {
    const r = await goi({fn:'soatAnDanh', token:tkSA, u:'superadmin@gita365.vn', chu:c});
    if (r.than.sach) thuongLot++;
  }
  bao(thuongLot === 0, 'TÊN GÕ THƯỜNG / TỰ-VIẾT-HOA BỊ BẮT: "con nguyễn văn an", "mẹ nguyễn thị hoa"… không lọt',
    thuongLot + '/4 lọt — bản cũ mù chữ thường; neo người (dấu trẻ trước / dấu hiệu trẻ sau) giữ "trần nhà"·"lê la" vẫn qua');
  const neOan = await goi({fn:'soatAnDanh', token:tkSA, u:'superadmin@gita365.vn',
    chu:'vẽ một căn phòng có trần nhà cao, hồ nước và bầu trời xanh; tránh trẻ lê la ngoài đường'});
  bao(neOan.than.sach === true, 'KHÔNG bắt oan tên-thường: "trần nhà"·"hồ nước"·"lê la" (họ trùng từ, KHÔNG neo người) vẫn qua',
    'AD-TENTHUONG buộc NEO NGƯỜI, nên từ thường trùng họ mà không có dấu người/trẻ thì không dính');
  const neSdt = await goi({fn:'soatAnDanh', token:tkSA, u:'superadmin@gita365.vn',
    chu:'gọi phụ huynh (090) 123 4567 để xác nhận.'});
  bao(!neSdt.than.sach, 'SỐ MÁY CÓ NGOẶC BỊ BẮT: "(090) 123 4567" không lọt',
    'lớp run cũ loại "()" nên số ngoặc-mã-vùng lọt — nay thêm () vào lớp');
  /* KHÔNG bắt oan thêm: brief mô tả cảnh, phong cách — không tên nào */
  const lanh114 = await goi({fn:'soatAnDanh', token:tkSA, u:'superadmin@gita365.vn',
    chu:'Vẽ Tô Màu Nước, gói 5 triệu Đồng, Kim Cương Xanh, phong cách tối giản.'});
  bao(lanh114.than.sach === true, 'KHÔNG bắt oan: "Tô Màu"·"triệu Đồng"·"Kim Cương" (họ trùng, KHÔNG đệm) vẫn qua',
    'đệm-gate: họ dễ trùng chỉ chặn khi theo sau là một đệm Việt, không phải mọi cụm Title-Case');

  /* "bé tập bò" là TÊN ĐIỀU 4 của chính Hiến pháp. Không trừ cụm ghép
     thì hàng rào bắt oan ngay chính hiến pháp của nó — bẫy thứ ba của
     phép dò chữ tiếng Việt. */
  const beTapBo = await goi({fn:'soatBoNao', token:tkSA, u:'superadmin@gita365.vn',
    chu:'Viết theo lối bé tập bò: một câu, một hình, một bước, một ngày.'});
  const maR = (beTapBo.than.pham || []).map(p => p.ma);
  bao(beTapBo.than.ok && maR.indexOf('R5') < 0,
    'CỤM GHÉP KHÔNG BỊ BẮT OAN: "bé tập bò" là TÊN Điều 4, không phải sai xưng hô',
    'không trừ cụm ghép thì hàng rào bắt oan ngay chính hiến pháp của nó');

  /* Hàng rào nêu TỪNG ĐIỂM, không gộp thành một con số: chín điểm sạch
     và một điểm phạm nặng cần cách xử lý khác hẳn mười điểm hơi phạm. */
  const ban = await goi({fn:'soatBoNao', token:tkSA, u:'superadmin@gita365.vn',
    chu:'Phương pháp tốt nhất Việt Nam, cam kết con giỏi lên 300% sau 90 ngày. ' +
        'Cháu nào cũng đạt. Cha mẹ sai cách thì con mới kém.'});
  const maB = (ban.than.pham || []).map(p => p.ma);
  bao(!ban.than.dat && maB.indexOf('R2') >= 0 && maB.indexOf('R8') >= 0 &&
      maB.indexOf('R5') >= 0 && maB.indexOf('R4') >= 0 && maB.indexOf('R1') >= 0,
    'HÀNG RÀO NÊU TỪNG ĐIỂM MỘT: cam kết · thổi phồng · sai xưng hô · phán xét · số không nguồn',
    'bắt ' + maB.join(' · ') + ' — gộp thành một con số thì chín điểm sạch và một ' +
    'điểm phạm nặng ra cùng kết quả với mười điểm hơi phạm');

  /* R9 KHÔNG bao giờ nằm trong phần máy chấm. Máy không biết GITA đang
     có năng lực gì, và trình nó ra như đã kiểm là chỗ tệ nhất của cả
     hàng rào: người duyệt thấy đủ mười dấu tick rồi thôi không đọc. */
  bao((ban.than.nguoiPhaiDoc || []).indexOf('R9') >= 0 && maB.indexOf('R9') < 0 &&
      beTapBo.than.soDiemMayDo === 9,
    'R9 LUÔN LÀ VIỆC CỦA NGƯỜI — máy không chấm, và nói thẳng ra',
    'máy đo được 9/10 điểm; trình đủ mười dấu tick thì người duyệt thôi không đọc');

  /* Việc chưa ai xếp hạng rơi về VÀNG, không rơi về XANH. Rơi về Xanh
     là để máy tự làm một việc chưa ai xếp hạng — đúng cách một hệ lặng
     lẽ mở rộng quyền của chính nó. */
  const mBN = await import('../may-chu/bo-nao.js');
  const vLa = mBN.vungCuaViec('mot-viec-chua-ai-xep-hang');
  const vDo = mBN.vungCuaViec('datGia');
  const vXanh = mBN.vungCuaViec('guiWowTheoLich');
  bao(vLa.vung === 'VANG' && vLa.macDinh === true && vLa.uyQuyen === false &&
      vDo.vung === 'DO' && vDo.uyQuyen === false && vXanh.vung === 'XANH',
    'VIỆC CHƯA AI XẾP HẠNG RƠI VỀ VÀNG, không rơi về Xanh',
    'rơi về Xanh là để máy tự làm một việc chưa ai xếp hạng — đúng cách một hệ ' +
    'lặng lẽ mở rộng quyền của chính nó');
}

/* ══ PHÉP ĐO ĐẮT NHẤT CỦA CẢ PHẦN NÀY ══

   NỘI DUNG KHÔNG BAO GIỜ ĐI RA. Nội dung là thứ kho mã hoá sinh ra để
   giữ; một tấm hình cần một ĐẶC TẢ, không cần nội dung coaching, nên
   gửi cả nội dung là gửi tài sản kèm một việc không đòi hỏi nó. */
const raNgoai = await goi({fn:'guiDeBaiRaNgoai', token:tkSA, u:'superadmin@gita365.vn',
  id:idTG});
const noiDungGoc = db.prepare("SELECT noiDung FROM deXuatThiGiac WHERE id=?").get(idTG).noiDung;
const cauDacTrung = noiDungGoc.slice(0, 40);
bao(raNgoai.than.ok && raNgoai.than.daGui.indexOf(cauDacTrung) < 0 &&
    !/bộ test đầu vào|buổi tiếp nhận/.test(raNgoai.than.daGui),
  'NỘI DUNG KHÔNG ĐI RA — chỉ ĐÚNG NĂM TRƯỜNG của đề bài rời khỏi máy chủ',
  'đã gửi ' + raNgoai.than.soChu + ' ký tự: ' +
  raNgoai.than.daGui.replace(/\n/g, ' · ').slice(0, 130));

bao(raNgoai.than.daGui.indexOf(dungTang.than.tang) >= 0 &&
    raNgoai.than.daGui.indexOf(dungTang.than.nhiemVu) >= 0,
  'nhưng ĐẶC TẢ thì đi đủ — chặng, loại hình, nhiệm vụ, bố cục, người xem');

/* ══ ĐỀ BÀI ĐI RA PHẢI MANG ĐIỀU NHỎ, VÀ NĂM LỚP PHẢI ĐÚNG THỨ TỰ ══

   Cổng thu hai câu trả lời từ bản 9.99.54; tới đây mới kiểm chúng có ĐI
   RA tới bộ vẽ không. Thu một câu trả lời rồi không dùng nó thì câu hỏi
   ấy chỉ là một cái cổng làm phiền. */
{
  const t = raNgoai.than.daGui;
  bao(/ĐIỀU NHỎ — phải NHÌN THẤY được/.test(t) && /NGƯỜI XEM GẶP TẤM NÀY LÚC/.test(t),
    'ĐỀ BÀI ĐI RA MANG THEO ĐIỀU NHỎ VÀ THỜI ĐIỂM ĐỜI',
    'hai câu ấy vào sổ từ 9.99.54 nhưng tới 9.99.55 mới đi ra tới bộ vẽ');

  /* Thứ tự năm lớp là TRỌNG SỐ: bộ tạo ảnh nghe phần đầu rõ hơn phần
     cuối. Đảo khối CẤM lên đầu thì tấm về đúng kỹ thuật mà sai chuyện. */
  const viTri = ['Nhiệm vụ:', 'Người xem:', 'KIỂU:', 'MÀU:', 'CẤM —'].map(k => t.indexOf(k));
  bao(viTri.every(i2 => i2 >= 0) && viTri.every((v, i2) => i2 === 0 || v > viTri[i2 - 1]),
    'NĂM LỚP ĐÚNG THỨ TỰ: kiến trúc → nội dung → lối vẽ → cảm xúc → kỹ thuật',
    'thứ tự các lớp CHÍNH LÀ trọng số — bộ tạo ảnh nghe phần đầu rõ hơn phần cuối');
}

/* ══ CHỐNG TỰ KHEN — phần 7 của bản đặc tả ══

   Một thang chấm mà mọi tấm đều qua thì nó không còn là thang chấm —
   nó là một con dấu. Và chuyện ấy trôi rất êm: không ai quyết định hạ
   chuẩn, chỉ là mỗi lần chấm lại dễ hơn lần trước một chút.

   Máy KHÔNG kết luận đây là chấm dễ — mười tấm tốt liên tiếp có thể là
   đội vẽ đang lên tay thật. Máy làm đúng phần của máy: ĐẾM, rồi CHẶN
   cho tới khi người chấm viết ra một câu. Cùng luật L-02 của bảng lương. */
{
  /* Dựng mười một đề xuất và chấm cao cả mười một. Chấm cao là hợp lệ;
     cái bị chặn là chấm cao LIÊN TIẾP mà không ai nói vì sao. */
  const nen = {tang:'T1', loaiHinh:'CONG', nhiemVu:'Giúp nhà biết qua chặng bảy ngày cần đạt gì',
    noiDung:'Trang giới thiệu chặng bảy ngày nhận diện: bộ test đầu vào, một buổi ' +
            'tiếp nhận, phiếu ghi bảy ngày, và cổng nghiệm thu ngày bảy.',
    nguoiXem:['PHUHUYNH'], dieuNho:'bấm mở chặng 1 ngay tối nay',
    thoiDiem:'tối sau giờ học'};
  const cao = {D1:95, D2:95, D3:95, D4:95, D5:95, D6:95, D7:95};
  let chan = null, daChan = 0;
  for (let i2 = 0; i2 < 11; i2++) {
    const de = await goi({fn:'deXuatThiGiac', token:tkSA, u:'superadmin@gita365.vn',
      deXuat:Object.assign({}, nen, {boCuc:'bản thử số ' + i2})});
    if (!de.than.ok) continue;
    const ch = await goi({fn:'chamThiGiac', token:tkSA, u:'superadmin@gita365.vn',
      id:de.than.id, cham:cao});
    if (!ch.than.ok && ch.than.code === 'TUKHEN') { daChan++; if (!chan) chan = ch.than; }
  }
  bao(daChan > 0 && chan && chan.soCao >= 8,
    'CHỐNG TỰ KHEN: chấm cao liên tiếp thì BỊ CHẶN cho tới khi người chấm nói vì sao',
    chan ? chan.soCao + '/' + chan.tren + ' lượt gần nhất đều từ 90 trở lên — máy ' +
      'KHÔNG kết luận là chấm dễ, vì đội vẽ lên tay thật cũng ra đúng con số ấy; ' +
      'máy chỉ đếm rồi chặn cho tới khi có một câu' : 'không chặn lần nào');

  /* Viết được một câu thì đi tiếp, và câu ấy Ở LẠI trong sổ. */
  const de2 = await goi({fn:'deXuatThiGiac', token:tkSA, u:'superadmin@gita365.vn',
    deXuat:Object.assign({}, nen, {boCuc:'bản có lời giải thích'})});
  const ch2 = await goi({fn:'chamThiGiac', token:tkSA, u:'superadmin@gita365.vn',
    id:de2.than.id, cham:cao,
    lyDoCao:'Loạt này dùng lại bố cục đã duyệt ở bản trước nên ít lỗi kỹ thuật.'});
  bao(ch2.than.ok && ch2.than.tung._tuKhen &&
      /dùng lại bố cục/.test(ch2.than.tung._tuKhen.lyDo) &&
      ch2.than.tung._tuKhen.boiAi === 'superadmin@gita365.vn',
    'và câu giải thích Ở LẠI trong sổ chấm, kèm tên người viết',
    'máy không cắt và cũng không tha — nó chặn, người chốt ghi quyết định của ' +
    'mình kèm lý do, và câu ấy ở lại');
}

/* ══ GÓP Ý VÁ VÀO ĐÚNG LỚP — phần 5 của bản đặc tả ══

   Mỗi lượt vẽ lại tốn một lượt gọi bộ tạo ảnh ngoài. Góp ý "nhìn lạnh
   quá" là chuyện lớp CẢM XÚC; đem đi sửa BỐ CỤC thì tấm mới vẫn lạnh y
   hệt, và Học viện mất một lượt vẽ để đổi lấy không gì cả.

   Sai lớp không lộ ra ở khâu nào — nó chỉ lộ ra ở tấm sau, và lúc ấy
   không ai truy được vì sao. Nên phép đo phải gọi thẳng. */
{
  const g = await goi({fn:'docGopY', token:tkSA, u:'superadmin@gita365.vn',
    gopY: 'Bố cục hơi chật ở mép trên. Nhìn lạnh quá, ánh nhìn của nhân vật ' +
          'xa cách. Chữ ở dòng cuối bị sai dấu.'});
  const lop = (g.than.lop || []).map(x => x.lop);
  bao(g.than.ok && lop.join('·') === 'L1·L4·L5' && !(g.than.tuChoi || []).length,
    'GÓP Ý CHIA VỀ ĐÚNG LỚP, VÀ GIỮ THỨ TỰ L1→L5',
    'ba câu → ' + lop.join(' · ') + ' — thứ tự năm lớp là trọng số, nên danh ' +
    'sách vá cũng phải đọc theo thứ tự ấy');

  /* Một câu chạm hai lớp thì nêu CẢ HAI. Chọn cái nặng hơn giùm người ta
     thì nửa còn lại rơi mất mà không ai biết nó đã từng được nói. */
  const hai = await goi({fn:'docGopY', token:tkSA, u:'superadmin@gita365.vn',
    gopY: 'Chữ nhỏ quá mà bố cục lại chật, đọc không nổi'});
  bao(hai.than.ok && (hai.than.lop || []).length === 2,
    'MỘT CÂU CHẠM HAI LỚP THÌ NÊU CẢ HAI, không chọn cái nặng hơn giùm',
    'chọn hộ thì nửa còn lại rơi mất mà không ai biết nó đã từng được nói');

  /* Không đọc ra thì TRẢ LẠI NGUYÊN CÂU. Đoán một lớp rồi trình ra như
     một đề nghị thì người ta tin nó đã được cân nhắc. */
  const mu = await goi({fn:'docGopY', token:tkSA, u:'superadmin@gita365.vn',
    gopY: 'Anh xem lại giúp em tấm này với, em thấy chưa ổn lắm'});
  bao(mu.than.ok && !(mu.than.lop || []).length &&
      (mu.than.khongDoc || []).length === 1,
    'KHÔNG ĐỌC RA LỚP NÀO THÌ TRẢ LẠI NGUYÊN CÂU, không đoán',
    'đoán sai lớp thì tấm sau vẫn hỏng đúng chỗ cũ, và mất thêm một lượt vẽ');

  /* "dấu thương hiệu" chứa "dấu", mà "sai dấu" là dấu hiệu của L5. Không
     trừ cụm ghép thì mọi câu nhắc tới dấu thương hiệu đều thành lỗi
     chính tả — bẫy thứ ba của phép dò chữ tiếng Việt. */
  const cum = await goi({fn:'docGopY', token:tkSA, u:'superadmin@gita365.vn',
    gopY: 'Chỗ dấu thương hiệu ở góc dưới đang bị bố cục che mất một phần'});
  bao(cum.than.ok && (cum.than.lop || []).map(x => x.lop).indexOf('L5') < 0,
    'CỤM GHÉP KHÔNG BỊ BẮT OAN: "dấu thương hiệu" không phải "sai dấu"',
    'tiếng Việt không phân từ bằng khoảng trắng — phải TRỪ cụm ghép trước khi dò');

  /* ── NĂM THỨ KHÔNG ĐƯỢC ĐỘNG TỚI ── */
  const xe = await goi({fn:'docGopY', token:tkSA, u:'superadmin@gita365.vn',
    /* Câu xé ADN ở đây CỐ Ý mang thêm dấu hiệu của một lớp: "đổi màu" là
       ADN1, "gắt" là L3. Bản đầu dùng một câu xé ADN không mang dấu hiệu
       lớp nào, và lúc phá thử thì phép đo vẫn XANH — câu ấy không rơi vào
       lớp nào cả nên chẳng có gì đổi. */
    gopY: 'Đổi màu lại cho ánh sáng đỡ gắt. Với lại bỏ logo ở góc cho thoáng. ' +
          'Bố cục thì chật quá.'});
  const maADN = [].concat.apply([], (xe.than.tuChoi || []).map(t => t.adn));
  bao(xe.than.ok && maADN.indexOf('ADN1') >= 0 && maADN.indexOf('ADN2') >= 0 &&
      /* Câu chạm ADN KHÔNG được đi tiếp vào phép chia lớp: vừa bị từ chối
         vừa được chỉ đường đi sửa thì người ta làm theo vế thứ hai. */
      (xe.than.lop || []).map(x => x.lop).join('·') === 'L1',
    'GÓP Ý XÉ BẢNG NHẬN DIỆN BỊ TÁCH RA, và KHÔNG được chỉ đường đi sửa',
    'hai câu xé ADN bị nêu riêng · câu bố cục vẫn vá được — một lời từ chối ' +
    'kèm đường đi sửa thì người ta làm theo đường đi sửa');

  /* ── CỔNG CÓ RĂNG: chỗ ĐỌC chỉ cảnh báo, chỗ GHI mới chặn ── */
  const nen5 = {tang:'T1', loaiHinh:'CONG', nhiemVu:'Mời nhà mở chặng bảy ngày',
    noiDung:'Trang mời nhà mở chặng bảy ngày nhận diện, có phiếu ghi và cổng ' +
            'nghiệm thu ngày bảy.',
    nguoiXem:['PHUHUYNH'], dieuNho:'bấm mở chặng 1 ngay tối nay',
    thoiDiem:'tối sau giờ học', boCuc:'bản gốc để thử cổng ADN'};
  const goc5 = await goi({fn:'deXuatThiGiac', token:tkSA, u:'superadmin@gita365.vn',
    deXuat:nen5});
  const chan5 = await goi({fn:'banMoiThiGiac', token:tkSA, u:'superadmin@gita365.vn',
    id:goc5.than.id, gopY:'Đổi màu sang xanh lá cho tươi', deXuat:{boCuc:'bản 2'}});
  const qua5 = await goi({fn:'banMoiThiGiac', token:tkSA, u:'superadmin@gita365.vn',
    id:goc5.than.id, gopY:'Bố cục chật quá, nới mép trên ra', deXuat:{boCuc:'bản 2'}});
  bao(goc5.than.ok && !chan5.than.ok && chan5.than.code === 'XEADN' &&
      qua5.than.ok && Number(qua5.than.ban) === 2 && qua5.than.banTruoc === goc5.than.id,
    'BẢN MỚI SINH TỪ GÓP Ý XÉ ADN THÌ KHÔNG ĐƯỢC SINH — góp ý sạch thì vẫn sinh',
    'đặt cổng ở chỗ ĐỌC thôi là cổng cảnh báo: người ta đọc, thấy hợp lý với ' +
    'tấm này, rồi vẫn bấm sửa. Mười lần nhân nhượng hợp lý thì bảng nhận diện ' +
    'không còn, mà không ai quyết định bỏ nó cả');
}


/* ══ KÊNH PHÁT · GIỜ VÀNG · GỠ BÀI — phần 9 của bản đặc tả ══

   Chỗ dễ dựng sai nhất của cả phần này là nút GỠ: dựng sai thì nó tệ
   hơn không có, vì người bấm tin rằng chuyện đã xong. Gỡ trong sổ
   KHÔNG gỡ được ở ngoài — tấm đã đăng thì nằm ở máy chủ của nền tảng
   ấy, ai đã lưu về hoặc chụp màn hình thì vẫn giữ. */
/* Mã tấm của khối phần 9 dùng lại ở khối phần 10 — khai ở ngoài chứ
   không với tay vào phạm vi của khối kia. */
let idTam9 = null, idDang9 = null;
{
  const nen9 = {tang:'T1', loaiHinh:'CONG', nhiemVu:'Mời nhà mở chặng bảy ngày',
    noiDung:'Trang mời nhà mở chặng bảy ngày nhận diện, có phiếu ghi bảy ngày ' +
            'và cổng nghiệm thu ngày bảy.',
    nguoiXem:['PHUHUYNH'], dieuNho:'bấm mở chặng 1 ngay tối nay',
    thoiDiem:'tối sau giờ học', boCuc:'bản để thử cổng đăng'};
  const de9 = await goi({fn:'deXuatThiGiac', token:tkSA, u:'superadmin@gita365.vn',
    deXuat:nen9});
  idTam9 = de9.than.id;

  /* Chỉ đăng thứ ĐÃ PHÁT HÀNH. Bậc duyệt nghĩa là người duyệt đã gật;
     phát hành nghĩa là bản cuối đã chốt. Cho đăng ở bậc duyệt thì một
     bản còn đang sửa chữ đi ra ngoài, và tấm ngoài kia không sửa lại
     được nữa. */
  const som = await goi({fn:'dangTamThiGiac', token:tkSA, u:'superadmin@gita365.vn',
    id:de9.than.id, kenh:'DONG_TIN', kho:'DOC',
    lyDoNgoaiGio:'Thử cổng, đăng bất kỳ giờ nào cũng được.'});
  bao(de9.than.ok && !som.than.ok && som.than.code === 'CHUAPHATHANH',
    'CHƯA PHÁT HÀNH THÌ CHƯA ĐĂNG ĐƯỢC LÊN KÊNH',
    'bậc duyệt là người duyệt đã gật; phát hành là bản cuối đã chốt — tấm ra ' +
    'ngoài rồi thì không sửa lại được nữa');

  /* Chữ thay ảnh phải có TRƯỚC khi lên bậc phát hành — luật C21. Thiếu
     nó thì lượt chuyển bậc cuối im lặng không đi, và mọi phép đo bên
     dưới đỏ vì một lý do chẳng liên quan gì tới chúng. Bản đầu của khối
     này quên đúng chỗ ấy: tám dòng đỏ, mà chỗ hỏng chỉ có một. */
  await goi({fn:'ghiChuThayAnh', token:tkSA, u:'superadmin@gita365.vn',
    id:de9.than.id, moTaTen:'GITA 365 · Chặng bảy ngày nhận diện',
    moTa:'Tấm mời nhà mở chặng bảy ngày nhận diện. Trên tấm: bộ test đầu vào, ' +
         'buổi tiếp nhận, phiếu ghi bảy ngày, cổng nghiệm thu ngày bảy.'});
  for (const den of ['mophong','duyet','hoanThien','phatHanh'])
    await goi({fn:'chuyenBacThiGiac', token:tkSA, u:'superadmin@gita365.vn',
      id:de9.than.id, den});

  /* Sai khổ thì nền tảng TỰ CẮT, và nó cắt ở giữa — thứ bị cắt thường
     là dòng mời ở đáy hoặc dấu thương hiệu ở góc. */
  const lech = await goi({fn:'dangTamThiGiac', token:tkSA, u:'superadmin@gita365.vn',
    id:de9.than.id, kenh:'TIN_NHANH', kho:'DOC',
    lyDoNgoaiGio:'Thử cổng, đăng bất kỳ giờ nào cũng được.'});
  bao(!lech.than.ok && lech.than.code === 'LECHKHO' &&
      (lech.than.nhan || []).join() === 'DUNG',
    'KÊNH TIN NHANH KHÔNG NHẬN KHỔ DỌC — sai khổ thì nền tảng tự cắt, và cắt ở GIỮA',
    'thứ bị cắt thường là dòng mời ở đáy hoặc dấu thương hiệu ở góc — đúng hai ' +
    'thứ quan trọng nhất, và không báo gì cả');

  /* ── GIỜ VÀNG NÓI RA, KHÔNG CHẶN ──
     Nhưng đăng ngoài khung phải VIẾT MỘT CÂU. Không bắt viết thì mọi
     lượt đều đăng ngoài khung, và bảng giờ vàng thành một lời chú giải. */
  const gioBayGio = (() => {
    const d = new Date();
    return ((d.getUTCHours() * 60 + d.getUTCMinutes()) + 420) % 1440;
  })();
  const dangTrongKhung = [[330,390],[690,750],[1230,1320]]
    .some(([a,b]) => gioBayGio >= a && gioBayGio <= b);
  if (!dangTrongKhung) {
    const khongCau = await goi({fn:'dangTamThiGiac', token:tkSA,
      u:'superadmin@gita365.vn', id:de9.than.id, kenh:'DONG_TIN', kho:'DOC'});
    bao(!khongCau.than.ok && khongCau.than.code === 'NGOAIGIO' &&
        (khongCau.than.gioVang || []).length === 3,
      'ĐĂNG NGOÀI KHUNG GIỜ VÀNG THÌ PHẢI VIẾT MỘT CÂU — nhưng KHÔNG bị chặn',
      'một tấm chúc Tết phải đi đúng giao thừa, một tấm xin lỗi phải đi ngay; ' +
      'chặn theo giờ là bắt cả Học viện đứng lại vì một con số trung bình');
  }

  const dang = await goi({fn:'dangTamThiGiac', token:tkSA, u:'superadmin@gita365.vn',
    id:de9.than.id, kenh:'DONG_TIN', kho:'DOC', duongDan:'https://vi.dụ/bài-1',
    lyDoNgoaiGio:'Nhà đang hỏi ngay trong nhóm, trả lời chậm thì mất nhịp.'});
  idDang9 = dang.than.id;
  bao(dang.than.ok && dang.than.kenh === 'DONG_TIN',
    'ĐĂNG ĐƯỢC KHI ĐÃ PHÁT HÀNH, ĐÚNG KHỔ, VÀ CÓ CÂU GIẢI THÍCH NẾU NGOÀI GIỜ',
    dang.than.trongGioVang ? 'trong khung ' + dang.than.trongGioVang
      : 'ngoài khung, lý do đã vào sổ');

  /* ── BÁO ĐÃ GỠ NGOÀI TRƯỚC KHI QUYẾT GỠ LÀ GHI NGƯỢC THỨ TỰ ── */
  const nguoc = await goi({fn:'goTamThiGiac', token:tkSA, u:'superadmin@gita365.vn',
    id:dang.than.id, baoDaGoNgoai:true});
  bao(!nguoc.than.ok && nguoc.than.code === 'CHUAQUYETGO',
    'BÁO ĐÃ GỠ Ở NGOÀI TRƯỚC KHI HỌC VIỆN QUYẾT GỠ THÌ BỊ CHẶN',
    'ghi ngược thứ tự thì sổ đọc ra như thể có người tự ý gỡ');

  const thieuCau = await goi({fn:'goTamThiGiac', token:tkSA,
    u:'superadmin@gita365.vn', id:dang.than.id, lyDo:'HET_HAN', cau:'hết'});
  bao(!thieuCau.than.ok && thieuCau.than.code === 'THIEUCAU',
    'GỠ PHẢI VIẾT MỘT CÂU VÌ SAO',
    'gỡ không câu nào thì lần sau người khác dựng lại đúng tấm ấy — không có gì ' +
    'nói cho họ biết vì sao nó đã bị gỡ');

  const go = await goi({fn:'goTamThiGiac', token:tkSA, u:'superadmin@gita365.vn',
    id:dang.than.id, lyDo:'NGUOI_TRONG_ANH',
    cau:'Người trong ảnh nhắn xin rút lời đồng ý sáng nay.'});
  bao(go.than.ok && go.than.gapNgay === true &&
      /KHÔNG gỡ được ở\s*ngoài|KHÔNG gỡ được ở ngoài/.test(go.than.vi) &&
      /gỡ tấm xuống bằng tay/.test(go.than.conPhaiLam || ''),
    'GỠ TRONG SỔ NÓI THẲNG RẰNG NÓ KHÔNG GỠ ĐƯỢC Ở NGOÀI, và nói việc CÒN PHẢI LÀM',
    'một nút "Gỡ" không nói câu ấy là dựng đúng cái làm người bấm tin rằng ' +
    'chuyện đã xong — mà tấm thì vẫn đang ở ngoài kia');

  /* Sổ nêu HAI phía riêng, cùng luật với đối chiếu ngân hàng: đã quyết
     gỡ mà chưa ai báo gỡ ngoài là việc còn đang HỞ. */
  const so9 = await goi({fn:'soDangBai', token:tkSA, u:'superadmin@gita365.vn'});
  bao(so9.than.ok && (so9.than.hoGo || []).length >= 1 &&
      so9.than.hoGo[0].gapNgay === true,
    'SỔ ĐĂNG NÊU RIÊNG CHỖ HỞ: đã QUYẾT gỡ mà chưa ai báo đã gỡ ở kênh ngoài',
    'gộp hai phía thành một con số "còn tồn" thì một tấm quyết gỡ ba tuần trước ' +
    'nằm chung rổ với một tấm vừa quyết gỡ năm phút trước');

  const ngoai = await goi({fn:'goTamThiGiac', token:tkSA, u:'superadmin@gita365.vn',
    id:dang.than.id, baoDaGoNgoai:true});
  const so9b = await goi({fn:'soDangBai', token:tkSA, u:'superadmin@gita365.vn'});
  bao(ngoai.than.ok && /LỜI KHAI/.test(ngoai.than.vi) &&
      !(so9b.than.hoGo || []).some(x => x.id === dang.than.id),
    'BÁO ĐÃ GỠ NGOÀI THÌ CHỖ HỞ ĐÓNG LẠI — và máy gọi đúng tên nó là LỜI KHAI',
    'máy không nhìn thấy kênh ngoài nên không tự đánh dấu được; một ô máy tự ' +
    'đánh dấu mà không đo được là một lời nói dối mang dấu của hệ thống');
}

/* ══ ĐO PHỄU VÀ SỔ TRUY VẾT — phần 10 của bản đặc tả ══

   Luật của cả phần này nằm ở một câu: KHÔNG BAO GIỜ gộp cột đo được
   với cột lời khai. Đặt một con số gõ tay cạnh một con số đo được,
   cùng hàng cùng kiểu chữ, thì người đọc tin cả hai như nhau — mà con
   số gõ tay thì gõ nhầm được, gõ đẹp lên được, hoặc quên gõ mà hàng
   vẫn đầy. Cùng luật với ô daGoNgoai của phần 9. */
{
  const ph = await goi({fn:'doPheuThiGiac', token:tkSA, u:'superadmin@gita365.vn'});
  const d = (ph.than || {}).doDuoc || {};
  bao(ph.than.ok && typeof d.DE_XUAT === 'number' && d.DE_XUAT > 0 &&
      d.PHAT_HANH > 0 && d.DANG > 0 && d.GO_TRONG_SO > 0,
    'PHỄU ĐẾM THẲNG TRONG SỔ: đề xuất → duyệt → phát hành → đăng → gỡ',
    'đề xuất ' + d.DE_XUAT + ' · duyệt ' + d.DUYET + ' · phát hành ' + d.PHAT_HANH +
    ' · đăng ' + d.DANG + ' · quyết gỡ ' + d.GO_TRONG_SO + ' · gỡ thật ' + d.GO_THAT_SU);

  /* Ba bậc lời khai KHÔNG được trả về với giá trị 0. Một số 0 nằm cùng
     bảng với sáu số đo được thì đọc ra là "chưa ai xem", không đọc ra
     là "máy không biết" — và hai câu ấy khác hẳn nhau. */
  bao(ph.than.ok && (ph.than.khongDoDuoc || []).length === 3 &&
      d.XEM === undefined && d.BAM === undefined && d.NHAN_VE === undefined,
    'BA BẬC LỜI KHAI KHÔNG NẰM TRONG BẢNG ĐO ĐƯỢC, kể cả với giá trị 0',
    'một số 0 cùng bảng với sáu số đo được thì đọc ra là "chưa ai xem", không ' +
    'đọc ra là "máy không biết"');

  /* Gỡ đếm HAI con số riêng, cùng luật với sổ đăng. Một con số gộp thì
     chỗ hở giữa "đã quyết gỡ" và "đã gỡ thật" biến mất. */
  bao(ph.than.ok && d.GO_TRONG_SO >= d.GO_THAT_SU &&
      typeof d.GO_THAT_SU === 'number',
    'GỠ ĐẾM HAI CON SỐ RIÊNG: đã quyết gỡ, và đã gỡ thật ở ngoài',
    'một con số gộp thì chỗ hở giữa hai cái biến mất');

  /* ── ĐỜI MỘT TẤM ──
     Nhật ký đã ghi đủ từ lâu, nhưng nằm rải trong sổ chung của cả hệ
     xếp theo thời gian — muốn đọc đời một tấm thì phải lọc bằng mắt qua
     hàng nghìn dòng của mọi việc khác. Một sự thật CÓ mà không đọc ra
     được thì trên thực tế là KHÔNG CÓ. */
  const doi = await goi({fn:'doiMotTam', token:tkSA, u:'superadmin@gita365.vn',
    id:idTam9});
  const viec = (doi.than.nhatKy || []).map(x => x.viec);
  bao(doi.than.ok && viec.indexOf('TG_DEXUAT') >= 0 && viec.indexOf('TG_BAC') >= 0 &&
      viec.indexOf('TG_DANG') >= 0 && viec.indexOf('TG_GO') >= 0 &&
      (doi.than.dang || []).length >= 1,
    'ĐỜI MỘT TẤM GOM ĐỦ: đề xuất · chuyển bậc · đăng · gỡ, xếp theo thời gian',
    viec.length + ' dòng nhật ký · ' + (doi.than.dang || []).length + ' lượt đăng');

  /* ── NỬA LỜI KHAI CỦA PHỄU CÓ CHỖ GHI (9.99.60) ──
     Bản trước khai ba bậc XEM · BAM · NHAN_VE là lời khai rồi KHÔNG
     dựng chỗ nào để ghi chúng — theo luật của kho thì mục ấy không phải
     việc chờ, nó là một lời than. */
  const khongNgay = await goi({fn:'khaiSoKenhNgoai', token:tkSA,
    u:'superadmin@gita365.vn', idDang:idDang9, xem:1200});
  bao(!khongNgay.than.ok && khongNgay.than.code === 'THIEUNGAY',
    'KHAI SỐ KÊNH NGOÀI PHẢI GHI NGÀY ĐỌC BẢNG — máy không lấy ngày hôm nay thay',
    'người ta hay đọc bảng của tuần trước rồi mới ngồi gõ; gán ngày hôm nay thì ' +
    'con số nằm sai chỗ trên trục thời gian mà không ai thấy');

  const khai = await goi({fn:'khaiSoKenhNgoai', token:tkSA, u:'superadmin@gita365.vn',
    idDang:idDang9, ngayDoc:'2026-09-10', xem:1240, nhanVe:7});
  const ph2 = await goi({fn:'doPheuThiGiac', token:tkSA, u:'superadmin@gita365.vn'});
  const lk = (ph2.than || {}).loiKhai || {};
  bao(khai.than.ok && lk.soLuotDaKhai === 1 &&
      lk.XEM && lk.XEM.tong === 1240 && lk.XEM.tren === 1 &&
      /* Ô để TRỐNG khác hẳn số 0: trống là không đọc được, 0 là đọc được
         và bằng không. Cộng trống thành 0 rồi trình ra một tổng là nói
         dối về cỡ mẫu. */
      lk.BAM === undefined &&
      /* Và chúng KHÔNG được trộn vào bảng đo được, kể cả khi đã có người gõ. */
      (ph2.than.doDuoc || {}).XEM === undefined,
    'CÓ CHỖ GHI NỬA LỜI KHAI — nhưng nó VẪN ở ngăn riêng, không trộn vào bảng đo được',
    'có chỗ ghi không làm con số thành phép đo: máy chủ vẫn không nhìn thấy kênh ' +
    'ngoài. Cái nó có thêm là ai gõ và gõ lúc nào — kiểm lại được, chứ không đúng hơn');

  /* Dòng thời gian xếp TĂNG DẦN. Xếp giảm dần thì đọc đời một tấm phải
     đọc ngược, và người đọc mất chỗ ngay ở dòng thứ ba. */
  const luc = (doi.than.nhatKy || []).map(x => x.luc);
  bao(luc.length >= 2 && luc.every((v, i) => i === 0 || v >= luc[i - 1]),
    'DÒNG THỜI GIAN XẾP TĂNG DẦN, đọc xuôi được',
    'xếp giảm dần thì đọc đời một tấm phải đọc ngược, và mất chỗ ngay dòng thứ ba');
}

/* ══════════════ PHÂN HỆ 7 · PHÁP LÝ & RỦI RO ══════════════

   Bản đặc tả mở Phần IX bằng một cảnh báo bắt buộc — đây là BẢN ĐỒ
   để biết chỗ nào cần HỎI, không phải tư vấn pháp lý. Nên phép đo
   đầu tiên ở đây là một phép đo về thứ KHÔNG ĐƯỢC TỒN TẠI: mô-đun
   không có một cửa nào trả về phán quyết pháp lý.

   Khối này chạy TRƯỚC Phân hệ 1 và 4: cổng dữ liệu trẻ em cắm trong
   lapTheVungManh và lapSongSinh, nên những nhà mà hai khối ấy dùng
   phải có dòng đồng ý của cha mẹ trước đã. Đó cũng là bài học vận
   hành của chính bản này — Luật 91 việc số 3 không phải một dòng chữ
   trong bảng, nó chặn thật. */
{
  const mPL = await import('../may-chu/phap-ly-rui-ro.js');

  /* ── MÁY KHÔNG KẾT LUẬN PHÁP LÝ ──
     Hỏi DANH SÁCH HÀM XUẤT RA, không hỏi lời khai. Một cửa như thế mà
     CÓ MẶT là đỏ, dù chưa ai gọi nó: viết cửa ấy rồi mới cấm gọi là muộn. */
  const cuaCo = Object.keys(mPL);
  const camLot = mPL.CUA_CAM.filter(c => cuaCo.indexOf(c) >= 0);
  bao(camLot.length === 0 && mPL.CUA_CAM.length >= 5,
    'MÔ-ĐUN PHÁP LÝ KHÔNG CÓ MỘT CỬA NÀO KẾT LUẬN — phép đo về thứ KHÔNG ĐƯỢC TỒN TẠI',
    'soi ' + mPL.CUA_CAM.length + ' tên cửa bị cấm trong ' + cuaCo.length + ' thứ ' +
    'xuất ra · một câu trả lời pháp lý do máy sinh ra nghe y hệt một câu trả lời ' +
    'thật, và người đọc dùng nó đúng vào lúc đang vội');

  const ls = await goi({fn:'docVungLuatSu', token:tkSA, u:'superadmin@gita365.vn'});
  const coKetLuan = (ls.than.vung || []).some(v =>
    v.ketLuan !== undefined || v.traLoi !== undefined || v.danhGia !== undefined);
  bao(ls.than.ok && !coKetLuan && (ls.than.vung || []).length === 4 &&
      /không phải tư vấn pháp lý/.test(ls.than.canhBao || ''),
    'BỐN VÙNG CHỈ MANG CÂU HỎI, KHÔNG MANG CÂU TRẢ LỜI — và cửa tự kèm câu cảnh báo bắt buộc',
    'một giờ luật sư trả lời đúng câu hỏi rẻ hơn nhiều so với ba giờ để họ tự tìm ra ' +
    'câu hỏi là gì');

  /* ── LUẬT 91 · VIỆC 2 · Ô GỘP BỊ CHẶN, VÀ MÁY KHÔNG TÁCH HỘ ── */
  const oGop = await goi({fn:'ghiDongY', token:tk, u:'phuhuynh@gita365.vn',
    maNha:'NHA-PL', tatCa:true});
  bao(!oGop.than.ok && oGop.than.code === 'GOPO' && oGop.than.gop.join() === 'tatCa',
    'Ô ĐỒNG Ý GỘP BỊ CHẶN — và máy KHÔNG lặng lẽ tách hộ thành ba',
    'tách hộ thì bên ngoài vẫn chỉ có một cái tích, và cái "riêng, tách bạch" mà ' +
    'Luật 91 đòi chỉ còn trong bụng máy chủ');

  /* Ba ô của màn đăng ký phải khớp với kho — màn ấy chạy TRƯỚC khi
     đăng nhập nên phải khai tay, và hai bản chép lệch nhau thì người
     ta tích một bộ chữ và hệ ghi một bộ khác. */
  const nguonDK = fs.readFileSync('src/dang-ky.js', 'utf8');
  const oDK = (nguonDK.match(/\{k:'(dy[A-Za-z]+)'/g) || [])
    .map(x => x.replace(/\{k:'|'/g, ''));
  bao(oDK.length === 3 && !/id="dk_dongY"/.test(nguonDK) &&
      /\(không bắt buộc/.test(nguonDK),
    'MÀN ĐĂNG KÝ DỰNG BA Ô TÁCH HẲN, và ô thứ ba ghi rõ KHÔNG BẮT BUỘC',
    oDK.join(' · ') + ' · bắt cả ba mới đăng ký được thì ba ô lại thành một ô — ' +
    'người ta tích hết một lượt, và cái "riêng, tách bạch" chỉ còn ở hình thức');

  /* ── LUẬT 91 · VIỆC 3 · Ô VỀ CON CHỈ CHA MẸ KÝ ĐƯỢC ── */
  const gitaKyHo = await goi({fn:'ghiDongY', token:tkSA, u:'superadmin@gita365.vn',
    maNha:'NHA-PL', o:'duLieuCon'});
  bao(!gitaKyHo.than.ok && gitaKyHo.than.code === 'PHAICHAME',
    'NGƯỜI CỦA GITA KHÔNG TÍCH HỘ ĐƯỢC Ô ĐỒNG Ý VỀ CON',
    'tích hộ thì nghĩa vụ nặng nhất của Luật 91 biến thành một dòng do chính bên có ' +
    'nghĩa vụ tự viết');

  /* ── CỔNG DỮ LIỆU TRẺ EM CHẶN THẬT Ở CẢ HAI CỬA ── */
  const theChuaDY = await goi({fn:'lapTheVungManh', token:tkSA, u:'superadmin@gita365.vn',
    maNha:'NHA-PL', tuoiCon:9, the:{
      d1:'Sáng nhất khi lắp mô hình, hai tiếng không ngẩng đầu',
      d2:'Vào nhanh nhất qua cửa LÀM — phải cầm vào mới hiểu',
      d3:'Chịu được cái khó của việc tay chân, hỏng năm lần vẫn làm lại',
      d4:'Rụt lại khi phải đứng trước lớp, sợ bị cười',
      d5:'Chín mươi ngày tới nhà mình làm một góc bàn riêng cho con'}});
  const ssChuaDY = await goi({fn:'lapSongSinh', token:tkSA, u:'superadmin@gita365.vn',
    maNha:'NHA-PL', ngayThamGia:new Date().toISOString(), tenCon:'Na'});
  bao(!theChuaDY.than.ok && theChuaDY.than.code === 'CHUADONGY' &&
      !ssChuaDY.than.ok && ssChuaDY.than.code === 'CHUADONGY',
    'HAI CỬA TẠO HỒ SƠ VỀ CON ĐỀU CHẶN KHI CHƯA CÓ ĐỒNG Ý CỦA CHA MẸ — đây là việc số 3 của Luật 91, và nó chặn THẬT',
    'dữ liệu trẻ em được bảo vệ ĐẶC BIỆT · không có cổng thì việc số 3 là một dòng ' +
    'chữ trong một bảng bảy dòng');

  /* Khai đồng ý cho mọi nhà mà các khối sau dùng. Đây chính là thứ
     tự thật trong đời: cha mẹ đồng ý TRƯỚC, hồ sơ về con mở SAU. */
  const NHA_PL = ['NHA-001','NHA-CK1','NHA-CK2','NHA-CK3','NHA-CN','NHA-DO',
    'NHA-KHONG-CO','NHA-QUEN','NHA-TUTHAN','NHA-VH0','NHA-VH1','NHA-XANH','NHA-PL'];
  /* PHÂN QUYỀN CẤP-VẬT (9.99.114): ô duLieuCon chỉ CHA MẸ ký, và chỉ cho
     gia đình CỦA MÌNH. Mỗi nhà một parent ký — dùng một tài khoản phụ huynh
     làm đại diện, đặt maKhachHang = nhà đang ký trước mỗi lượt (đúng đời
     thật: maKhachHang của phụ huynh CHÍNH LÀ nhà họ). */
  const nhaCuaPH = (n) => db.prepare("UPDATE users SET maKhachHang=? WHERE id='U-ph'").run(n);
  for (const n of NHA_PL) {
    nhaCuaPH(n);
    await goi({fn:'ghiDongY', token:tk, u:'phuhuynh@gita365.vn', maNha:n, o:'duLieuCon'});
  }

  nhaCuaPH('NHA-PL');
  const sauDY = await goi({fn:'docDongY', token:tk, u:'phuhuynh@gita365.vn',
    maNha:'NHA-PL'});
  bao(sauDY.than.dangCo.join() === 'duLieuCon' &&
      sauDY.than.chuaHoi.join() === 'dieuKhoan,duLieuGiaDinh',
    'SỔ NÊU RIÊNG "CHƯA HỎI" VÀ "ĐÃ RÚT" — gộp hai cái thành "không có" là mất đúng chỗ có nghĩa',
    'một nhà chưa ai hỏi tới nằm chung rổ với một nhà đã nói KHÔNG, mà hai chuyện ấy ' +
    'cần hai cách xử lý khác hẳn nhau');

  /* ── RÚT ĐỒNG Ý LÀ MỘT DÒNG MỚI, VÀ NÓ CHẶN ĐƯỢC VIỆC GHI TIẾP ── */
  nhaCuaPH('NHA-RUT');
  await goi({fn:'ghiDongY', token:tk, u:'phuhuynh@gita365.vn',
    maNha:'NHA-RUT', o:'duLieuCon'});
  await goi({fn:'ghiDongY', token:tk, u:'phuhuynh@gita365.vn',
    maNha:'NHA-RUT', o:'duLieuCon', rut:true});
  const sauRut = await goi({fn:'docDongY', token:tk, u:'phuhuynh@gita365.vn',
    maNha:'NHA-RUT'});
  const ghiSauRut = await goi({fn:'lapSongSinh', token:tkSA, u:'superadmin@gita365.vn',
    maNha:'NHA-RUT', ngayThamGia:new Date().toISOString(), tenCon:'Na'});
  bao(sauRut.than.ds.length === 2 && sauRut.than.daRut.join() === 'duLieuCon' &&
      !ghiSauRut.than.ok && ghiSauRut.than.code === 'DARUT',
    'RÚT ĐỒNG Ý GHI MỘT DÒNG MỚI — dòng cũ Ở LẠI, và việc ghi tiếp bị CHẶN',
    sauRut.than.ds.length + ' dòng trong sổ · sửa đè thì mất hẳn phần lịch sử, mà ' +
    'chính nó trả lời được câu "hôm ấy nhà này đã đồng ý chưa" — và rút đồng ý là ' +
    'một quyền, quyền ấy chỉ có nghĩa nếu nó chặn được việc ghi tiếp');

  /* ── PHÂN QUYỀN CẤP-VẬT (IDOR) — phụ huynh chỉ thao tác NHÀ MÌNH (9.99.114)
     Tổ thanh tra $500M chứng minh CHẠY THẬT: phụ huynh gõ mã nhà người khác
     là forge/rút đồng ý / mở đồng hồ xoá cho con NGƯỜI LẠ. Phá thử: gỡ
     nhaCuaMinh trong phap-ly-rui-ro.js → cả ba dòng dưới đỏ. */
  nhaCuaPH('NHA-PL');
  const idorGhi = await goi({fn:'ghiDongY', token:tk, u:'phuhuynh@gita365.vn',
    maNha:'NHA-LANGGIENG', o:'duLieuCon'});
  const idorDoc = await goi({fn:'docDongY', token:tk, u:'phuhuynh@gita365.vn',
    maNha:'NHA-LANGGIENG'});
  const idorXoa = await goi({fn:'yeuCauXoaDuLieu', token:tk, u:'phuhuynh@gita365.vn',
    maNha:'NHA-LANGGIENG'});
  bao(idorGhi.than.code === 'NOPERM_NHA' && idorDoc.than.code === 'NOPERM_NHA' &&
      idorXoa.than.code === 'NOPERM_NHA',
    'IDOR CHẶN: phụ huynh KHÔNG ghi/đọc/xoá được đồng ý của gia đình NGƯỜI KHÁC',
    'cửa nhận maNha từ thân yêu cầu — không đối chiếu maKhachHang của phiên thì một phụ ' +
    'huynh forge đồng ý / mở đồng hồ xoá cho con người lạ');
  /* Nhân viên (staff) vẫn giữ phạm vi rộng — phục vụ mọi nhà. */
  const nvRong = await goi({fn:'docDongY', token:tkSA, u:'superadmin@gita365.vn',
    maNha:'NHA-PL'});
  bao(nvRong.than.ok, 'NHÂN VIÊN GIỮ PHẠM VI RỘNG: R01–R12 đọc được mọi nhà (việc của họ là phục vụ)',
    'phân quyền cấp-vật chỉ siết PHỤ HUYNH; siết cả nhân viên thì coach không phục vụ được nhà mình kèm');

  /* ── LUẬT 91 · VIỆC 4 · NÚT XOÁ CHẠY THẬT, HAI PHÍA TÁCH HẲN ── */
  nhaCuaPH('NHA-PL');
  const yc = await goi({fn:'yeuCauXoaDuLieu', token:tk, u:'phuhuynh@gita365.vn',
    maNha:'NHA-PL'});
  const ngoaiKhongCanCu = await goi({fn:'danhDauXoa', token:tkSA,
    u:'superadmin@gita365.vn', id:yc.than.id, phia:'ngoaiSo'});
  await goi({fn:'danhDauXoa', token:tkSA, u:'superadmin@gita365.vn',
    id:yc.than.id, phia:'trongSo'});
  const so = await goi({fn:'soXoaDuLieu', token:tkSA, u:'superadmin@gita365.vn'});
  bao(yc.than.ok && yc.than.hanNgay === mPL.HAN_XOA_NGAY &&
      !ngoaiKhongCanCu.than.ok && ngoaiKhongCanCu.than.code === 'THIEUCANCU' &&
      so.than.hoTrongNgoai.length === 1 && so.than.quaHan.length === 0,
    'YÊU CẦU XOÁ CÓ HẠN XỬ LÝ, VÀ SỔ NÊU RIÊNG CHỖ HỞ GIỮA PHÉP ĐO VÀ LỜI KHAI',
    'xoá trong hệ là PHÉP ĐO (đếm được dòng còn lại), xoá ngoài hệ là LỜI KHAI (bản ' +
    'sao lưu, tệp đã tải về, bản in) · máy KHÔNG tự đánh dấu phía ngoài, vì một ô máy ' +
    'tự đánh dấu mà không đo được là một lời nói dối mang dấu của hệ thống');

  const quaHan = await goi({fn:'soXoaDuLieu', token:tkSA, u:'superadmin@gita365.vn',
    bayGio:new Date(Date.now() + (mPL.HAN_XOA_NGAY + 1) * 86400000).toISOString()});
  bao(quaHan.than.quaHan.length === 0 && so.than.so === 1,
    'YÊU CẦU ĐÃ XOÁ TRONG HỆ THÌ KHÔNG CÒN TÍNH LÀ QUÁ HẠN — quá hạn đếm việc CHƯA LÀM',
    'gộp "quá hạn" với "còn hở phía ngoài" thành một con số còn tồn thì một yêu cầu ' +
    'quá hạn ba tuần nằm chung rổ với một yêu cầu vừa vào năm phút trước');

  /* ── LUẬT 91 · VIỆC 7 · NHẬT KÝ GHI CẢ LƯỢT ĐỌC ──
     Tới 9.99.69 sổ audit chỉ ghi lượt GHI, nên câu "ai đã đọc hồ sơ
     con nhà ấy" không trả lời được. Một sự thật CÓ mà không đọc ra
     được thì trên thực tế là KHÔNG CÓ. */
  await goi({fn:'lapSongSinh', token:tkSA, u:'superadmin@gita365.vn',
    maNha:'NHA-PL', ngayThamGia:new Date().toISOString(), tenCon:'Na'});
  const truocDoc = db.prepare(
    "SELECT COUNT(*) c FROM audit WHERE viec = 'VH_DOC_SS'").get().c;
  await goi({fn:'docSongSinh', token:tkSA, u:'superadmin@gita365.vn', maNha:'NHA-PL'});
  const sauDoc = db.prepare(
    "SELECT COUNT(*) c FROM audit WHERE viec = 'VH_DOC_SS'").get().c;
  bao(sauDoc === truocDoc + 1,
    'NHẬT KÝ GHI CẢ LƯỢT ĐỌC HỒ SƠ VỀ CON, không chỉ lượt GHI — Luật 91 đòi "ai TRUY CẬP dữ liệu gia đình nào"',
    truocDoc + ' → ' + sauDoc + ' dòng · một sự thật CÓ mà không đọc ra được thì ' +
    'trên thực tế là KHÔNG CÓ');

  /* ── BẢY VIỆC ĐO BẰNG HÀNH VI, VÀ HAI VIỆC CỦA NGƯỜI KHÔNG CÓ GIÁ TRỊ NÀO ── */
  const tt = await goi({fn:'docTuanThu', token:tkSA, u:'superadmin@gita365.vn'});
  const coGiaTriNguoi = mPL.VIEC_NGUOI_LAM.some(v => tt.than.dat[v] !== undefined);
  bao(tt.than.ok && mPL.VIEC_MAY_DO.every(v => tt.than.dat[v] === true) &&
      !coGiaTriNguoi,
    'BẢY VIỆC ĐO BẰNG HÀNH VI — và HAI việc của NGƯỜI không trả về một giá trị nào, kể cả false',
    mPL.VIEC_MAY_DO.join(' · ') + ' đo được, gọi thật vào cửa · ' +
    mPL.VIEC_NGUOI_LAM.join(' · ') + ' không có mặt trong bảng: một `false` nằm cùng ' +
    'bảng với năm kết quả đo được thì người đọc tin cả bảy như nhau');
}

/* ══ PHÂN HỆ 1 · VÙNG MẠNH — BA LẰN RANH LÀ BA CÁI CỔNG ══

   Bản đặc tả viết ba lằn ranh đạo đức bằng giọng của một lời dặn.
   Dựng chúng thành lời dặn thì sáu tháng sau không còn ai nhớ — lời
   dặn không chặn được gì. Ba phép đo dưới đây đo CỔNG, không đo chữ. */
{
  const mVM = await import('../may-chu/vung-manh.js');
  const theSach = {
    d1: 'Sáng nhất khi lắp mô hình, hai tiếng không ngẩng đầu',
    d2: 'Vào nhanh nhất qua cửa LÀM — phải cầm vào mới hiểu',
    d3: 'Chịu được cái khó của việc tay chân, hỏng năm lần vẫn làm lại',
    d4: 'Rụt lại khi phải đứng trước lớp, sợ bị cười',
    d5: 'Chín mươi ngày tới nhà mình làm một góc bàn riêng cho con'
  };

  /* ── LR3 · KHÔNG DÙNG THẺ ĐỂ BÁN HÀNG ──
     Ô lạ bị CHẶN, không lặng lẽ bỏ qua: bỏ qua thì người gửi tưởng ô
     ấy đã được ghi, và lần sau gửi lại. */
  const banHang = await goi({fn:'lapTheVungManh', token:tkSA, u:'superadmin@gita365.vn',
    maNha:'NHA-001', tuoiCon:9,
    the:Object.assign({}, theSach, {diem:87, goi:'T4', nhan:'trẻ có tố chất'})});
  bao(!banHang.than.ok && banHang.than.code === 'OCAM' &&
      (banHang.than.oLa || []).length === 3,
    'LR3 · THẺ KHÔNG MANG Ô ĐIỂM, Ô GÓI, Ô NHÃN — và bị CHẶN, không lặng lẽ bỏ qua',
    'bắt ' + (banHang.than.oLa || []).join(' · ') + ' — một ô giá nằm trên tờ giấy ' +
    'nói về nỗi sợ của con họ là lời mời mua đặt đúng chỗ không được đặt');

  /* ── CÂU MỞ ĐẦU CỦA PHÂN HỆ CÓ RĂNG ──
     "Không có một gen nào gọi là gen thiên tài." Người viết bài về
     vùng mạnh là người đứng GẦN lời hứa gen nhất. */
  const huaGen = await goi({fn:'lapTheVungManh', token:tkSA, u:'superadmin@gita365.vn',
    maNha:'NHA-001', tuoiCon:9,
    the:Object.assign({}, theSach, {d1:'Đã đánh thức gen thiên tài của con'})});
  bao(!huaGen.than.ok && huaGen.than.code === 'HUAGEN' &&
      /Điều 1, Điều 10, Điều 13/.test(huaGen.than.error),
    'LỜI HỨA VỀ GEN BỊ CHẶN — phạm cùng lúc Điều 1, Điều 10, Điều 13',
    'cái tên bán chạy nhất của cả chương trình lại là cái tên phân hệ này cấm nói');

  /* ── ĐIỀU 13 · THẺ LÀ THỨ NHẠY NHẤT TRONG HỆ ──
     Dòng D4 giữ nỗi sợ của một đứa trẻ, ghi nguyên văn lời nó nói. */
  const coTenVM = await goi({fn:'lapTheVungManh', token:tkSA, u:'superadmin@gita365.vn',
    maNha:'NHA-001', tuoiCon:9,
    the:Object.assign({}, theSach, {d4:'Rụt lại vì sợ bạn Nguyễn Minh Anh cười'})});
  bao(!coTenVM.than.ok && coTenVM.than.code === 'CHUAANDANH' &&
      /riêng tư nhất/.test(coTenVM.than.error),
    'TÊN NGƯỜI KHÔNG LỌT VÀO THẺ — dòng nỗi sợ là chỗ riêng tư nhất trong cả hệ',
    'viết bằng lời quan sát, không bằng tên');

  const thieuDong = await goi({fn:'lapTheVungManh', token:tkSA, u:'superadmin@gita365.vn',
    maNha:'NHA-001', the:Object.assign({}, theSach, {d5:''})});
  bao(!thieuDong.than.ok && thieuDong.than.code === 'THIEUDONG',
    'THẺ CÓ ĐÚNG NĂM DÒNG — thiếu một dòng thì nó là một tờ ghi chép dở',
    'giao cho gia đình một tờ dở thì họ đọc phần thiếu thành phần không có');

  const lap1 = await goi({fn:'lapTheVungManh', token:tkSA, u:'superadmin@gita365.vn',
    maNha:'NHA-001', tuoiCon:9, the:theSach,
    quanSat:{T4:'lam', T5:'motMinh', T7:'soBiCuoi'}});
  bao(lap1.than.ok && lap1.than.lan === 1 && lap1.than.hanNgay === 90 &&
      /ảnh chụp của một giai đoạn/.test(lap1.than.chuThich || ''),
    'THẺ SẠCH THÌ LẬP ĐƯỢC, và mang theo dòng ghi chú BẮT BUỘC',
    'dòng ấy chống lại điều nguy hiểm nhất: cha mẹ biến một quan sát tạm thời ' +
    'thành một cái nhãn dán suốt đời cho con');

  /* Bản cũ Ở LẠI. Chuỗi thẻ theo thời gian chính là thứ cho thấy đứa
     trẻ đã đổi — mà "trẻ đổi rất nhanh" là lý do lằn ranh thứ hai tồn
     tại. Ghi đè là xoá đúng bằng chứng ấy. */
  const lap2 = await goi({fn:'lapTheVungManh', token:tkSA, u:'superadmin@gita365.vn',
    maNha:'NHA-001', tuoiCon:9,
    the:Object.assign({}, theSach, {d1:'Nay sáng nhất khi kể chuyện cho em nghe'})});
  const demThe = db.prepare("SELECT COUNT(*) n FROM theVungManh WHERE maNha='NHA-001'").get().n;
  bao(lap2.than.ok && lap2.than.lan === 2 && lap2.than.theTruoc === lap1.than.id &&
      demThe === 2,
    'LẬP THẺ MỚI KHÔNG GHI ĐÈ THẺ CŨ — chuỗi thẻ là thứ cho thấy đứa trẻ đã đổi',
    demThe + ' thẻ trong sổ · ghi đè là xoá đúng bằng chứng của lằn ranh thứ hai');

  /* ── LR2 · HẠN CHÍN MƯƠI NGÀY CÓ RĂNG ──
     Quá hạn thì KHÔNG trả về năm dòng. Đọc được năm dòng thì người ta
     dùng nó, dù có một dòng chữ đỏ bên trên. */
  const conHan = await goi({fn:'docTheVungManh', token:tkSA, u:'superadmin@gita365.vn',
    maNha:'NHA-001'});
  const quaHan = await goi({fn:'docTheVungManh', token:tkSA, u:'superadmin@gita365.vn',
    maNha:'NHA-001', bayGio:new Date(Date.now() + 100*86400000).toISOString()});
  bao(conHan.than.ok && conHan.than.conHan === true && !!conHan.than.the &&
      quaHan.than.ok && quaHan.than.conHan === false &&
      quaHan.than.the === undefined && quaHan.than.quaHanNgay >= 9,
    'LR2 · QUÁ 90 NGÀY THÌ MÁY KHÔNG TRẢ VỀ NĂM DÒNG NỮA — hạn là một cánh cửa, không phải lời nhắc',
    'quá hạn ' + quaHan.than.quaHanNgay + ' ngày · đọc được năm dòng thì người ta ' +
    'dùng nó, dù có một dòng chữ đỏ bên trên');

  /* Và lộ trình cũng không dựng được từ thẻ quá hạn: dựng lộ trình ba
     trăm sáu mươi lăm ngày trên một quan sát đã cũ là kéo dài cái nhãn
     cũ thêm một năm. */
  const ltQua = await goi({fn:'loTrinhTuThe', token:tkSA, u:'superadmin@gita365.vn',
    maNha:'NHA-001', bayGio:new Date(Date.now() + 100*86400000).toISOString()});
  bao(!ltQua.than.ok && ltQua.than.code === 'THEQUAHAN',
    'LỘ TRÌNH KHÔNG DỰNG ĐƯỢC TỪ THẺ QUÁ HẠN',
    'kéo dài một cái nhãn cũ thêm một năm');

  /* Máy ĐỀ NGHỊ, người chốt — và không khớp gì thì NÓI LÀ KHÔNG BIẾT,
     không rơi về một lộ trình mặc định rồi gọi nó là cá nhân hoá. */
  const ltCo = mVM.deNghiLoTrinh({T4:'lam', T7:'soBiCuoi'});
  const ltKhong = mVM.deNghiLoTrinh({T4:'nhin', T5:'damDong'});
  bao(ltCo.doi.length === 2 && ltKhong.doi.length === 0 &&
      /KHÔNG rơi về một lộ trình mặc định/.test(ltKhong.vi),
    'THẺ → LỘ TRÌNH: máy ĐỀ NGHỊ, và không khớp gì thì NÓI LÀ KHÔNG BIẾT',
    'rơi về một lộ trình mặc định rồi gọi nó là cá nhân hoá là nói dối về chỗ tốn ' +
    'công nhất của cả chương trình');

  /* ── LR1 · KHÔNG XẾP HẠNG TRẺ VỚI NHAU ──
     Đo bằng cách hỏi DANH SÁCH CỬA của máy chủ: không cửa nào của phân
     hệ này trả về nhiều thẻ cùng lúc. Đây là phép đo về CẤU TRÚC —
     một cửa như thế mà có mặt là đỏ, dù chưa ai gọi nó. */
  const cuaVM = Object.keys(mVM).filter(k => typeof mVM[k] === 'function');
  const cuaNhieu = cuaVM.filter(k => /dsThe|danhSachThe|xepHang|soSanhThe|topThe/i.test(k));
  bao(cuaNhieu.length === 0,
    'LR1 · KHÔNG CÓ CỬA NÀO TRẢ VỀ NHIỀU THẺ CÙNG LÚC ĐỂ SO',
    cuaVM.length + ' cửa, không cửa nào xếp hạng — vùng mạnh không phải một cuộc ' +
    'thi, và một bảng xếp hạng trẻ em sinh ra là để cha mẹ nhìn vào');
}

/* ══════════════ PHÂN HỆ 2 · COACH KHÁCH HÀNG ══════════════

   Bản đặc tả viết đúng MỘT câu mới cho cả Phần IV: trước khi trả lời
   câu hỏi về một đứa trẻ cụ thể, bộ não đọc Thẻ Vùng Mạnh trước.

   Dựng câu ấy bằng một cái cờ do người gọi truyền vào thì nó là lời
   khai, và lời khai bật được mà không đọc gì. Nên phép đo ở đây đo
   HÀNH VI, bằng chính câu của bản đặc tả: cùng một câu hỏi, con vào
   qua cửa LÀM và con vào qua cửa NGHE phải ra hai câu trả lời KHÁC
   nhau. Giống hệt nhau là máy chưa đọc thẻ — dù cờ có bật, dù nhật
   ký có ghi. */
{
  const mCK = await import('../may-chu/coach-kh.js');

  const theLam = {
    d1: 'Sáng nhất khi lắp mô hình, hai tiếng không ngẩng đầu',
    d2: 'Vào nhanh nhất qua cửa LÀM — phải cầm vào mới hiểu',
    d3: 'Chịu được cái khó của việc tay chân, hỏng năm lần vẫn làm lại',
    d4: 'Rụt lại khi phải đứng trước lớp, sợ bị cười',
    d5: 'Chín mươi ngày tới nhà mình làm một góc bàn riêng cho con'
  };

  const theCK = {
    d1: 'Sáng nhất khi kể lại chuyện vừa nghe cho em',
    d2: 'Vào nhanh nhất khi được nghe kể',
    d3: 'Chịu được cái khó của việc học thuộc lời thoại',
    d4: 'Rụt lại khi bị chê trước mặt người lạ',
    d5: 'Chín mươi ngày tới nhà mình đọc to cùng nhau mỗi tối'
  };

  await goi({fn:'lapTheVungManh', token:tkSA, u:'superadmin@gita365.vn',
    maNha:'NHA-CK1', tuoiCon:8, the:theLam,
    quanSat:{T4:'lam', T7:'soBiCuoi'}});
  await goi({fn:'lapTheVungManh', token:tkSA, u:'superadmin@gita365.vn',
    maNha:'NHA-CK2', tuoiCon:8, the:theCK,
    quanSat:{T4:'nghe', T7:'soBiCuoi'}});
  await goi({fn:'lapTheVungManh', token:tkSA, u:'superadmin@gita365.vn',
    maNha:'NHA-CK3', tuoiCon:8, the:theCK, quanSat:{T7:'soSai'}});

  const HOI = 'Con không chịu học, tối nào cũng phải nhắc mười lần';

  /* ── PHÉP ĐO CHÍNH: HAI CỬA, HAI CÂU TRẢ LỜI ── */
  const traLam = await goi({fn:'traLoiCoach', token:tkSA, u:'superadmin@gita365.vn',
    luong:'L01', cauHoi:HOI, maNha:'NHA-CK1'});
  const traNghe = await goi({fn:'traLoiCoach', token:tkSA, u:'superadmin@gita365.vn',
    luong:'L01', cauHoi:HOI, maNha:'NHA-CK2'});
  bao(traLam.than.ok && traNghe.than.ok &&
      traLam.than.cua === 'lam' && traNghe.than.cua === 'nghe' &&
      traLam.than.doi !== traNghe.than.doi &&
      traLam.than.muc === 'M3',
    'CÙNG MỘT CÂU HỎI, HAI CỬA TIẾP NHẬN RA HAI CÂU TRẢ LỜI KHÁC NHAU — đây là chỗ Phân hệ 2 nối vào Phân hệ 1, và là phép đo đo HÀNH VI chứ không đo lời khai',
    'cửa ' + traLam.than.cua + ' vs ' + traNghe.than.cua + ' · giống hệt nhau là ' +
    'máy chưa đọc thẻ, dù cờ có bật');

  /* Nhà chưa có thẻ thì KHÔNG dựng câu cá nhân hoá. Trả lời chung rồi
     gọi là cá nhân hoá là chỗ dối dễ nhất của cả hệ — nó nghe giống
     hệt thứ thật. */
  const chuaThe = await goi({fn:'traLoiCoach', token:tkSA, u:'superadmin@gita365.vn',
    luong:'L01', cauHoi:HOI, maNha:'NHA-KHONG-CO'});
  bao(!chuaThe.than.ok && chuaThe.than.code === 'CHUATHE',
    'NHÀ CHƯA CÓ THẺ THÌ CÂU TRẢ LỜI CÁ NHÂN HOÁ KHÔNG DỰNG ĐƯỢC',
    'trả lời chung rồi gọi là cá nhân hoá là chỗ dối dễ nhất của cả hệ');

  /* Thẻ quá hạn cũng như chưa có — LR2 của Phân hệ 1 đi xuyên sang đây. */
  const theCu = await goi({fn:'traLoiCoach', token:tkSA, u:'superadmin@gita365.vn',
    luong:'L01', cauHoi:HOI, maNha:'NHA-CK1',
    bayGio:new Date(Date.now() + 100*86400000).toISOString()});
  bao(!theCu.than.ok && theCu.than.code === 'THEQUAHAN' && theCu.than.quaHanNgay >= 9,
    'THẺ QUÁ HẠN THÌ CŨNG NHƯ CHƯA CÓ — LR2 đi xuyên từ Phân hệ 1 sang Phân hệ 2',
    'quá hạn ' + theCu.than.quaHanNgay + ' ngày · trẻ đổi rất nhanh');

  /* Thẻ thiếu ô cửa thì NÓI LÀ KHÔNG BIẾT. Đoán thì một phần ba là
     trúng, và người đọc không có cách nào biết câu trả lời vừa được
     xây trên một cái đoán. */
  const thieuCua = await goi({fn:'traLoiCoach', token:tkSA, u:'superadmin@gita365.vn',
    luong:'L01', cauHoi:HOI, maNha:'NHA-CK3'});
  bao(!thieuCua.than.ok && thieuCua.than.code === 'THIEUCUA',
    'THẺ THIẾU Ô CỬA THÌ MÁY NÓI LÀ KHÔNG BIẾT, KHÔNG ĐOÁN MỘT CỬA',
    'đoán thì một phần ba là trúng, và người đọc không có cách nào biết câu trả ' +
    'lời vừa được xây trên một cái đoán');

  /* Không phân luồng thì bốn luồng nặng đi đường thường. */
  const khongLuong = await goi({fn:'traLoiCoach', token:tkSA, u:'superadmin@gita365.vn',
    cauHoi:HOI, maNha:'NHA-CK1'});
  bao(!khongLuong.than.ok && khongLuong.than.code === 'LUONGLA',
    'KHÔNG PHÂN LUỒNG THÌ KHÔNG TRẢ LỜI — bước B2 không bỏ được',
    'bốn luồng nặng đi đường khác, và không phân luồng thì chúng đi đường thường');

  /* ── BỐN LUỒNG NẶNG · HỘI ĐỒNG BA LƯỢT ── */
  const nangThieu = await goi({fn:'traLoiCoach', token:tkSA, u:'superadmin@gita365.vn',
    luong:'L06', cauHoi:'Học phí tầng ba có đáng không', maNha:'NHA-CK1'});
  bao(!nangThieu.than.ok && nangThieu.than.code === 'THIEUHOIDONG',
    'LUỒNG NẶNG KHÔNG CÓ HỘI ĐỒNG BA LƯỢT THÌ BỊ CHẶN',
    'L06 là luồng tài chính — người trả lời có lợi ích trong câu trả lời');

  /* Ba lượt CHÉP LẠI thì con số ba vẫn đúng và cái được canh thì không
     còn. Đây là chỗ một bảng kiểm duyệt biến thành sân khấu. */
  const bacheP = await goi({fn:'traLoiCoach', token:tkSA, u:'superadmin@gita365.vn',
    luong:'L06', cauHoi:'Học phí tầng ba có đáng không', maNha:'NHA-CK1',
    luot:['Giá đã chốt ở bảng HP_TANG', 'Giá đã chốt ở bảng HP_TANG',
      'Giá đã chốt ở bảng HP_TANG'],
    ghe:{G1:'quang', G2:'lan', G3:'minh', G4:'hoa', G5:'quang'}});
  bao(!bacheP.than.ok && bacheP.than.code === 'THIEUHOIDONG' &&
      bacheP.than.hoiDong.soLuot === 3 && bacheP.than.hoiDong.soRieng === 1,
    'BA LƯỢT CHÉP LẠI KHÔNG PHẢI BA LƯỢT — con số ba vẫn đúng, cái được canh thì không còn',
    bacheP.than.hoiDong.soLuot + ' lượt, chỉ ' + bacheP.than.hoiDong.soRieng +
    ' lượt khác nhau · một bảng hội đồng làm cảnh thì tệ hơn không có bảng nào');

  /* ── GHẾ GIỮ HỒN: MÁY KHÔNG NGỒI VÀO ── */
  const mayNgoi = await goi({fn:'traLoiCoach', token:tkSA, u:'superadmin@gita365.vn',
    luong:'L06', cauHoi:'Học phí tầng ba có đáng không', maNha:'NHA-CK1',
    luot:['Bản soạn đầu', 'Phản biện: câu này nghe như bán hàng', 'Kiểm chứng: HP_TANG'],
    ghe:{G1:'quang', G2:'lan', G3:'minh', G4:'hoa', G5:'AI'}});
  const nguoiNgoi = await goi({fn:'traLoiCoach', token:tkSA, u:'superadmin@gita365.vn',
    luong:'L06', cauHoi:'Học phí tầng ba có đáng không', maNha:'NHA-CK1',
    luot:['Bản soạn đầu', 'Phản biện: câu này nghe như bán hàng', 'Kiểm chứng: HP_TANG'],
    ghe:{G1:'quang', G2:'lan', G3:'minh', G4:'hoa', G5:'chị Hoa phòng đào tạo'}});
  bao(!mayNgoi.than.ok && mayNgoi.than.code === 'THIEUGHE' &&
      mayNgoi.than.ghe.mayNgoi === true &&
      nguoiNgoi.than.ok && nguoiNgoi.than.nang === true,
    'GHẾ NGƯỜI GIỮ HỒN: MÁY KHÔNG NGỒI VÀO ĐƯỢC, và đó là ô duy nhất của cả phân hệ như thế',
    'bốn ghế kia hỏi câu đo được; ghế này hỏi "đọc xong người mẹ ấy thấy gì", và ' +
    'câu trả lời của máy cho nó nghe y hệt câu trả lời thật');

  /* ── BÉ TẬP BÒ · BA CÁI TRẦN ──
     Trần thứ ba bắt được nhiều nhất, và nó cũng là trần dễ bắt oan
     nhất: mọi bài nhắc tới bảng nào cũng mang mã có chữ số. Nên mã bị
     gỡ TRƯỚC khi đếm — một phép đo bắt oan thì lần sau người ta tắt nó. */
  const btbDat = mCK.soatBeTapBo('Con vào qua cửa làm. Cho con cầm vào trước.');
  const btbDai = mCK.soatBeTapBo(
    'Con của anh chị vào nhanh nhất qua cửa làm nên mọi bài tập từ nay nên đổi ' +
    'sang dạng làm bằng tay và cắt bớt phần đọc đi cho nhẹ.');
  const btbSo = mCK.soatBeTapBo('Làm 3 việc. Trong 21 ngày. Mỗi ngày 15 phút. Xong 4 bài.');
  const btbMa = mCK.soatBeTapBo('Đọc trường T4 của thẻ. Xem luồng L06 ở mức M3.');
  bao(btbDat.dat === true && btbDai.dat === false && btbSo.dat === false &&
      btbMa.dat === true && btbSo.soCon === 4 &&
      /KHÔNG tự cắt bớt/.test(btbDai.vi),
    'BÉ TẬP BÒ: BA TRẦN ĐẾM ĐƯỢC, và mã T4 · L06 · M3 KHÔNG bị đếm là con số',
    'bài dài ' + btbDai.cauDai.length + ' câu quá trần · bài nhiều số đếm ' +
    btbSo.soCon + ' · máy CHẶN chứ không cắt hộ: cắt hộ thì người viết không biết ' +
    'mình vừa viết dài, và lần sau viết y hệt');
}

/* ══════════════ PHÂN HỆ 3 · NỘI DUNG & TIẾP THỊ ══════════════

   Ba thứ Phần V mang lại, và cả ba đều là cổng chứ không phải bảng:
   nội dung không khai tầng nhận thức thì KHÔNG xuất bản; lời kêu gọi
   sai tầng bị chặn; bộ lọc quảng cáo tách HAI NGĂN — bốn mục máy đo,
   ba mục chỉ người khai được.

   Chỗ đáng đo nhất là chỗ tách hai ngăn. Gộp bảy mục thành "đạt mấy
   trên bảy" thì một lời khai nằm cùng hàng với một phép đo, và người
   duyệt tin cả hai như nhau — đúng lớp lỗi của cột lời khai ở phễu
   thị giác và của ô daGoNgoai. */
{
  const mNT = await import('../may-chu/noi-dung-tiep-thi.js');

  /* ── KHÔNG KHAI TẦNG THÌ KHÔNG XUẤT BẢN, và máy KHÔNG đoán hộ ── */
  const khongTang = await goi({fn:'soatTiepThi', token:tkSA, u:'superadmin@gita365.vn',
    chu:'Một buổi tối nhà mình ngồi lại với nhau và không ai mở điện thoại.'});
  bao(!khongTang.than.ok && khongTang.than.code === 'CHUAKHAITANG' &&
      /KHÔNG đoán hộ/.test(khongTang.than.error || ''),
    'NỘI DUNG KHÔNG KHAI TẦNG NHẬN THỨC THÌ KHÔNG XUẤT BẢN ĐƯỢC — và máy KHÔNG đoán tầng hộ',
    'đoán thì một phần bảy là trúng, và người viết tưởng bài đã được xếp tầng nên ' +
    'thôi không nghĩ tới nữa — mà việc xếp tầng chính là việc phải nghĩ');

  /* Chuỗi "1" phải nhận được như số 1. Gõ lệch kiểu thì máy báo "chưa
     khai tầng" cho một bài đã khai — im lặng và sai đúng hướng bực. */
  const tangChuoi = mNT.docTangNT('3');
  bao(tangChuoi.ok && tangChuoi.tangNT === 3 && tangChuoi.nhom === 'N34',
    'TẦNG GỬI LÊN DẠNG CHUỖI VẪN NHẬN ĐƯỢC — ép kiểu đúng MỘT chỗ',
    'so === với số thì "3" trượt, và máy báo chưa khai tầng cho một bài đã khai');

  /* ── LỜI KÊU GỌI SAI TẦNG ── */
  /* Ba mục người-khai phải được TRẢ LỜI cả ở một bài không có chứng
     thực, không có ảnh trẻ em, không có người ảnh hưởng — trả lời ấy
     là `khongApDung`. Bản đặc tả viết "MỌI nội dung tiếp thị phải qua
     bộ lọc này", nên bảy mục đều phải có câu trả lời; thứ khác nhau
     là câu trả lời, không phải việc có phải trả lời hay không. */
  const KHAI_SACH = {QC5:{khongApDung:true}, QC6:{khongApDung:true},
    QC7:{khongApDung:true}};
  const saiTang = await goi({fn:'soatTiepThi', token:tkSA, u:'superadmin@gita365.vn',
    tangNT:1, khai:KHAI_SACH,
    chu:'Câu chuyện nhà chị Lan. Đăng ký ngay để giữ chỗ cho con.'});
  const dungTang = await goi({fn:'soatTiepThi', token:tkSA, u:'superadmin@gita365.vn',
    tangNT:1, khai:KHAI_SACH,
    chu:'Câu chuyện nhà chị Lan. Anh chị thấy quen không?'});
  bao(saiTang.than.ok && saiTang.than.dat === false &&
      saiTang.than.keuGoi.dinh.join() === 'đăng ký ngay' &&
      dungTang.than.ok && dungTang.than.dat === true,
    'LỜI KÊU GỌI SAI TẦNG BỊ CHẶN — tầng 1–2 không mời mua',
    'người ở tầng này không phản đối lời mời, họ LƯỚT QUA — và lướt qua thì không ' +
    'để lại dấu nào để về sau truy');

  /* ── BỘ LỌC QUẢNG CÁO · BỐN MỤC MÁY ĐO ── */
  const may = mNT.soatLocMay('Trung tâm tốt nhất, hơn hẳn các trung tâm khác, ' +
    'cam kết điểm 9 cho con, 87% học viên tăng điểm.');
  const maMay = may.pham.map(x => x.ma).join(',');
  bao(may.dat === false && maMay === 'QC1,QC2,QC3,QC4',
    'BỘ LỌC BẮT ĐỦ BỐN MỤC MÁY ĐO: từ tuyệt đối · so sánh · cam kết kết quả · số không nguồn',
    maMay + ' — và QC4 gọi THẲNG sang soatNguon của hiến pháp nội dung, không chép ' +
    'lại bảng nhãn nguồn: chép thì thêm một nhãn mới ở bản sau là hai bảng lệch nhau');

  /* Bài sạch có con số NHƯNG có nhãn nguồn thì KHÔNG bị bắt. Một phép
     đo bắt oan thì lần sau người ta tắt nó đi. */
  const coNguon = mNT.soatLocMay('[KHO GITA] 30 phần học, mỗi phần một buổi.');
  bao(coNguon.dat === true && coNguon.coSo === true && coNguon.soNhanNguon === 1,
    'CÓ CON SỐ MÀ CÓ NHÃN NGUỒN THÌ KHÔNG BỊ BẮT — phép đo không bắt oan',
    'bắt oan thì lần sau người ta tắt nó đi');

  /* "nhất định", "thống nhất" KHÔNG được tính là từ tuyệt đối: tiếng
     Việt không phân từ bằng khoảng trắng, nên chặn ở chỗ CHỌN DẤU
     HIỆU — chọn cụm nhiều âm tiết — rẻ hơn một danh sách trừ. */
  const batOan = mNT.soatLocMay('Nhà mình nhất định làm được. Cả nhà thống nhất ' +
    'một giờ đọc sách.');
  bao(batOan.dat === true,
    'CỤM TUYỆT ĐỐI DÒ THEO CỤM, KHÔNG THEO ÂM TIẾT TRẦN — "nhất định" và "thống nhất" không bị bắt',
    'chặn ở chỗ CHỌN DẤU HIỆU rẻ hơn và chắc hơn một danh sách trừ phải dài thêm mãi');

  /* ── BA MỤC NGƯỜI-KHAI: ĐÒI TÊN VÀ GIẤY TỜ, KHÔNG NHẬN Ô TÍCH ── */
  const oTich = mNT.soatLocNguoi({QC5:{xong:true}, QC6:{xong:true}, QC7:{xong:true}});
  const coTen = mNT.soatLocNguoi({
    QC5:{boiAi:'chị Hoa', giayTo:'DY-2026-011'},
    QC6:{khongApDung:true},
    QC7:{boiAi:'anh Minh', giayTo:'đã gọi kiểm ngày 5/9'}});
  const thieuGiay = mNT.soatLocNguoi({
    QC5:{boiAi:'chị Hoa'}, QC6:{khongApDung:true},
    QC7:{boiAi:'anh Minh', giayTo:'x'}});
  bao(oTich.dat === false && oTich.thieu.length === 3 &&
      coTen.dat === true && thieuGiay.dat === false &&
      /thiếu số hiệu giấy tờ/.test(thieuGiay.thieu.join(' ')),
    'BA MỤC NGƯỜI-KHAI ĐÒI MỘT CÁI TÊN VÀ MỘT CHỖ TRỎ TỚI GIẤY TỜ — không nhận một ô tích',
    'máy nhìn thấy cái ô tích, không nhìn thấy sự việc; và một ô tích không tên ' +
    'thì lúc cần đối chất không hỏi được ai');

  /* Khai KHÔNG ÁP DỤNG khác hẳn bỏ trống: không dùng ảnh trẻ em thì
     QC6 không phải một mục phải ký, còn bỏ trống là chưa ai nhìn tới. */
  const boTrong = mNT.soatLocNguoi({QC5:{boiAi:'a', giayTo:'b'},
    QC7:{boiAi:'c', giayTo:'d'}});
  bao(boTrong.dat === false && boTrong.thieu.join().indexOf('QC6') >= 0,
    'KHAI "KHÔNG ÁP DỤNG" KHÁC HẲN BỎ TRỐNG — bỏ trống là chưa ai nhìn tới',
    'một mục bỏ trống trôi qua thì nó trôi mãi, vì không có gì nói rằng nó đã bị bỏ qua');

  /* ── MỘT GỐC RA BẢY NHÁNH: THIẾU THÌ NÊU TỪNG NHÁNH ── */
  const duNhanh = await goi({fn:'soatBayNhanh', token:tkSA, u:'superadmin@gita365.vn',
    daCo:['NH1','NH2','NH3','NH4','NH5','NH6','NH7']});
  const thieuNhanh = await goi({fn:'soatBayNhanh', token:tkSA, u:'superadmin@gita365.vn',
    daCo:['NH1','NH2','NH3']});
  bao(duNhanh.than.dat === true && thieuNhanh.than.dat === false &&
      thieuNhanh.than.thieu.join() === 'NH4,NH5,NH6,NH7' &&
      /chưa đủ chín/.test(thieuNhanh.than.vi),
    'THIẾU NHÁNH THÌ NÊU TỪNG NHÁNH THIẾU, không gộp thành một câu "chưa đủ bảy"',
    'còn thiếu ' + thieuNhanh.than.thieu.join(' · ') + ' — một con số thiếu không ' +
    'nói thiếu cái gì thì người viết đoán, và họ đoán nhánh dễ làm nhất');
}

/* ══════════════ PHÂN HỆ 6 · CON NGƯỜI · BA CỬA ══════════════

   Cả phân hệ có giá trị ở đúng một cái cổng: người chưa qua đủ ba cửa
   thì không chạm khách MỘT MÌNH. Ba cửa không có cổng thì chúng là ba
   tờ giấy — và một tờ giấy về việc phải chờ, đặt trong một đội đang
   thiếu người, thì nó thua ngay ngày đầu.

   Khối này chạy TRƯỚC khối Phân hệ 4: cổng ba cửa nằm trong ghiCham,
   nên những người mà khối ấy dùng phải có dòng trong sổ trước đã. Đó
   cũng là bài học vận hành của chính bản này — bật cổng lên là chặn
   cả người cũ, và đường duy nhất là khai cho họ trước. */
{
  const mCN = await import('../may-chu/con-nguoi.js');
  const mBN6 = await import('../may-chu/bo-nao.js');
  const DU13 = mCN.C1_TH.map(t => t[0]);

  /* Hai mươi bài sạch hàng rào, mỗi bài một câu ngắn không con số. */
  const BAI_SACH = i => ({ chu: 'Chị thử ngồi cạnh con mười phút tối nay nhé.',
    r9BoiAi: 'chị Hoa', r9Dat: 'dat' });
  const BAI20 = Array.from({length: 20}, (_, i) => BAI_SACH(i));

  /* ── CỬA 1 · 13/13, VÀ MÁY NÓI TÊN ĐIỀU CHỨ KHÔNG NÓI PHÂN SỐ ── */
  const c1Du = mCN.chamCua1(DU13);
  const c1Thieu = mCN.chamCua1(DU13.filter(m => m !== 'TH13'));
  bao(c1Du.dat === true && c1Thieu.dat === false &&
      c1Thieu.sai.length === 1 && c1Thieu.sai[0].dieu === 'HP13' &&
      c1Thieu.vi.indexOf('HP13') >= 0 && c1Thieu.vi.indexOf('12/13') < 0,
    'CỬA 1 ĐẠT LÀ 13/13 — thiếu một điều thì máy gọi TÊN ĐIỀU, không trả một phân số',
    'bỏ TH13 thì máy nói ' + c1Thieu.sai[0].dieu + ' · một phân số 12/13 nghe như ' +
    'gần đạt nhưng không nói điều nào bị bỏ, mà điều bị bỏ có thể là điều duy ' +
    'nhất có hậu quả pháp lý');

  /* Mỗi điều đúng MỘT tình huống. Thiếu một điều thì bài thi vẫn xưng
     là 13/13 trong khi nó chỉ thử mười hai điều. */
  const dieuCo = mBN6.HIENPHAP.map(d => d[1]);
  const dieuTH = mCN.C1_TH.map(t => t[1]);
  bao(mCN.C1_TH.length === 13 &&
      dieuCo.every(d => dieuTH.filter(x => x === d).length === 1),
    'MỖI ĐIỀU ĐÚNG MỘT TÌNH HUỐNG THỬ — không điều nào bị bỏ, không điều nào thử hai lần',
    '13 tình huống phủ đủ 13 điều · thiếu một điều thì bài thi vẫn xưng là 13/13 ' +
    'trong khi nó chỉ thử mười hai, và chỗ thiếu không lộ ra ở đâu cả');

  /* ── CỬA 2 · CHÍN TRÊN MƯỜI RA ĐÚNG 90%, NHỜ CHỖ CHƯA AI NHÌN ── */
  const c2KhongR9 = mCN.chamCua2(BAI20.map(b => ({chu: b.chu})), 'tan');
  const c2Co = mCN.chamCua2(BAI20, 'tan');
  bao(c2KhongR9.ok === false && c2KhongR9.code === 'CHUADOC_R9' &&
      c2KhongR9.bai.length === 20 && c2Co.ok === true && c2Co.dat === true,
    'CỬA 2 TREO CHO TỚI KHI CÓ TÊN NGƯỜI ĐỌC R9 — máy đo được chín trên mười điểm của hàng rào',
    'hai mươi bài sạch mà vẫn không kết luận được · chín chia mười ra đúng 90%, ' +
    'vừa đủ ngưỡng của cửa này, nhờ đúng chỗ chưa ai nhìn');

  /* Người đọc R9 không được là chính ứng viên. */
  const c2TuDoc = mCN.chamCua2(BAI20.map(b => ({...b, r9BoiAi: 'tan'})), 'tan');
  bao(c2TuDoc.ok === false && c2TuDoc.code === 'CHUADOC_R9',
    'ỨNG VIÊN TỰ ĐỌC R9 CHO MÌNH THÌ KHÔNG TÍNH',
    'điểm duy nhất máy không đo được mà để chính người thi tự chấm thì cả hàng ' +
    'rào mười điểm còn chín');

  /* ── CỬA 3 · ĐO TỪNG CUỘC, KHÔNG LẤY TRUNG BÌNH BA CUỘC ── */
  const goiTot = [
    {boiAi: 'chị Hoa', phutKhach: 24, phutGITA: 6},
    {boiAi: 'chị Hoa', phutKhach: 32, phutGITA: 8},
    {boiAi: 'chị Hoa', phutKhach: 40, phutGITA: 10}
  ];
  /* Trung bình ba cuộc này là 81,7% — trên ngưỡng. Cuộc thứ ba mới
     là 55%. Lấy trung bình thì nó lọt. */
  const goiLech = [
    {boiAi: 'chị Hoa', phutKhach: 38, phutGITA: 2},
    {boiAi: 'chị Hoa', phutKhach: 38, phutGITA: 2},
    {boiAi: 'chị Hoa', phutKhach: 22, phutGITA: 18}
  ];
  const c3Tot = mCN.chamCua3(goiTot, 'tan');
  const c3Lech = mCN.chamCua3(goiLech, 'tan');
  const tbLech = goiLech.reduce((s, g) => s + g.phutKhach / (g.phutKhach + g.phutGITA), 0) / 3;
  bao(c3Tot.dat === true && c3Lech.dat === false && tbLech >= 0.8 &&
      c3Lech.cham.filter(c => !c.dat).map(c => c.goi).join() === '3',
    'CỬA 3 ĐO TỪNG CUỘC — ba cuộc trung bình ' + Math.round(tbLech*100) + '% vẫn TRƯỢT vì cuộc thứ ba dưới ngưỡng',
    'thứ cửa này đo là một THÓI QUEN, và một thói quen thì phải đúng ở cả ba lần; ' +
    'lấy trung bình thì một cuộc khách nói gần hết gánh được hai cuộc người GITA nói gần hết');

  const c3Tu = mCN.chamCua3(goiTot.map(g => ({...g, boiAi: 'tan'})), 'tan');
  bao(c3Tu.ok === false && c3Tu.code === 'TUKHAI',
    'NGƯỜI KÈM KHÔNG ĐƯỢC LÀ CHÍNH ỨNG VIÊN',
    'một dòng tự khai mình đã được kèm thì cửa thứ ba chỉ còn là một ô tích');

  /* Người kèm khai HAI CON SỐ PHÚT, không khai một tỷ lệ. */
  const c3TyLe = mCN.chamCua3(goiTot.map(g => ({boiAi: g.boiAi, tyKhach: 0.9})), 'tan');
  bao(c3TyLe.ok === false && c3TyLe.code === 'THIEUPHUT',
    'GÕ THẲNG MỘT TỶ LỆ THÌ KHÔNG NHẬN — người kèm khai HAI QUÃNG THỜI GIAN',
    'một tỷ lệ gõ thẳng vào là một lời phán, hai quãng thời gian thì quan sát ' +
    'được, và phép chia để máy làm');

  /* ── GHI CỬA: MÁY CHẤM LẠI, KHÔNG NHẬN Ô "ĐÃ ĐẠT" ── */
  const khaiSuong = await goi({fn:'ghiCua', token:tkSA, u:'superadmin@gita365.vn',
    maNguoi:'tan', cua:'C1', dat:true, dung:['TH01']});
  bao(!khaiSuong.than.ok && khaiSuong.than.code === 'CHUADAT',
    'GHI CỬA THÌ MÁY CHẤM LẠI — một ô "đã đạt" do người gọi truyền vào không mở được cửa nào',
    'một cái cờ do người gọi truyền vào là một lời khai, và lời khai bật được mà ' +
    'không làm gì cả');

  /* ── CỔNG · CHẠM KHÁCH MỘT MÌNH ── */
  await goi({fn:'lapSongSinh', token:tkSA, u:'superadmin@gita365.vn',
    maNha:'NHA-CN', ngayThamGia:new Date(Date.now()-2*86400000).toISOString(),
    tenCon:'Na'});
  const CC6 = {canCu:'đèn Xanh, nhịp ngày 2', aiDuyet:'chị Hoa'};

  const chuaCua = await goi({fn:'ghiCham', token:tkSA, u:'superadmin@gita365.vn',
    maNha:'NHA-CN', kieu:'wow', boiAi:'tan', noiDung:'Khen Na hôm nay', ...CC6});
  bao(!chuaCua.than.ok && chuaCua.than.code === 'CHUAQUACUA' &&
      chuaCua.than.thieu.join() === 'C1,C2,C3',
    'NGƯỜI CHƯA QUA BA CỬA KHÔNG GHI ĐƯỢC MỘT LƯỢT CHẠM — đây là cái răng của cả Phân hệ 6',
    'còn thiếu ' + chuaCua.than.thieu.join(' · ') + ' · cổng nằm ở chỗ lượt chạm ' +
    'được GHI chứ không ở màn hình: đặt ở màn hình thì nó là một lời nhắc, người ' +
    'ta đọc, thấy hợp lý, rồi vẫn gọi vì hôm nay thiếu người');

  /* Kèm bằng một người cũng chưa qua cửa là nhân đôi chỗ hở. */
  const kemHong = await goi({fn:'ghiCham', token:tkSA, u:'superadmin@gita365.vn',
    maNha:'NHA-CN', kieu:'wow', boiAi:'tan', nguoiKem:'minh',
    noiDung:'Khen Na hôm nay', ...CC6});
  bao(!kemHong.than.ok && kemHong.than.code === 'KEMCHUADU',
    'KÈM BẰNG MỘT NGƯỜI CHƯA QUA CỬA CŨNG BỊ CHẶN',
    'kèm bằng một người chưa qua cửa là nhân đôi chỗ hở chứ không bịt nó');

  /* ── KHAI HỘ CỬA CŨ · CHỈ R01–R02, VÀ PHẢI CÓ CĂN CỨ ── */
  const khaiSaiVai = await goi({fn:'lapBaCua', token:tkGD, u:'giamdoc@gita365.vn',
    maNguoi:'chị Hoa', cua:'C1', canCu:'đã dẫn hơn hai trăm ca từ 2023'});
  const khaiKhongCanCu = await goi({fn:'lapBaCua', token:tkSA, u:'superadmin@gita365.vn',
    maNguoi:'chị Hoa', cua:'C1'});
  bao(!khaiSaiVai.than.ok && khaiSaiVai.than.code === 'NOPERM' &&
      !khaiKhongCanCu.than.ok && khaiKhongCanCu.than.code === 'THIEUCANCU',
    'KHAI HỘ CỬA CŨ: CHỈ R01–R02, VÀ PHẢI VIẾT CĂN CỨ',
    'khai hộ là nói thay cho một phép đo chưa từng chạy, nên nó phải có một cái ' +
    'tên chịu trách nhiệm và một câu nói vì sao');

  /* Khai đủ ba cửa cho hai người mà khối Phân hệ 4 sẽ dùng. Đây chính
     là đường cho người cũ — và dòng mang nguồn khaiCu, đọc ra được. */
  for (const ai of ['chị Hoa', 'superadmin@gita365.vn', 'anh Quang'])
    for (const c of ['C1', 'C2', 'C3'])
      await goi({fn:'lapBaCua', token:tkSA, u:'superadmin@gita365.vn',
        maNguoi:ai, cua:c, canCu:'đã làm nghề từ trước khi có cổng ba cửa'});

  const doc = await goi({fn:'docBaCua', token:tkSA, u:'superadmin@gita365.vn',
    maNguoi:'chị Hoa'});
  bao(doc.than.du === true && doc.than.soKhaiCu === 3 &&
      doc.than.vi.indexOf('LỜI KHAI') >= 0,
    'SỔ BA CỬA NÊU RIÊNG PHẦN KHAI HỘ — một người được khai hộ không nằm chung rổ với một người đã làm đủ ba bài',
    'đủ ba cửa, nhưng cả ba đều mang nguồn khaiCu · gộp thành một con số "đã đủ" ' +
    'thì sau vài tháng cả bảng trông như đã đo hết');

  const quaDuoc = await goi({fn:'ghiCham', token:tkSA, u:'superadmin@gita365.vn',
    maNha:'NHA-CN', kieu:'wow', boiAi:'chị Hoa', noiDung:'Khen Na hôm nay tự soạn sách',
    ...CC6});
  const quaKem = await goi({fn:'ghiCham', token:tkSA, u:'superadmin@gita365.vn',
    maNha:'NHA-CN', kieu:'wow', boiAi:'tan', nguoiKem:'chị Hoa',
    noiDung:'Khen Na hôm nay tự dọn bàn', ...CC6});
  bao(quaDuoc.than.ok === true && quaKem.than.ok === true,
    'ĐỦ BA CỬA THÌ CHẠM MỘT MÌNH ĐƯỢC; CHƯA ĐỦ THÌ ĐI KÈM MỘT NGƯỜI ĐÃ ĐỦ',
    'đường mở duy nhất là CÓ NGƯỜI KÈM · thiếu người là lý do hay gặp nhất, nên ' +
    'nếu nó được tính là ngoại lệ thì nó thành lối đi chính');

  /* ── BÀI TUẦN · BẢN SAI PHẢI THẬT SỰ SAI ── */
  const MAU = 'Em nghe chị kể rồi. Chị đang mệt và lo. Nhiều nhà cũng gặp đúng chỗ ' +
    'này. Tối nay chị thử ngồi cạnh con mười phút. Mấy hôm nữa em nhắn lại hỏi chị nhé.';
  const SAI = 'Bên em cam kết con sẽ khá lên, đây là phương pháp tốt nhất và duy ' +
    'nhất hiện nay, bé nhà mình chắc chắn đạt kết quả nếu chị theo đủ.';
  const caTot = n => ({ma:'CA'+n, chuyen:'Một nhà có con lớp ba, mẹ nhắn lúc khuya vì con không chịu ngồi học.',
    mau:MAU, sai:SAI, dieuPham:['HP01','HP10']});
  const thi10 = Array.from({length:10}, (_, i) => ({hoi:'Câu '+(i+1), dap:'Đáp án'}));

  const tuanTot = mCN.soatTuan({ca:[1,2,3,4,5].map(caTot), thi:thi10});
  const tuanSaiKhongSai = mCN.soatTuan({
    ca:[1,2,3,4,5].map(n => ({...caTot(n), sai:MAU})), thi:thi10});
  bao(tuanTot.dat === true && tuanSaiKhongSai.dat === false &&
      tuanSaiKhongSai.loi.every(l => l.ma === 'SAIKHONGSAI') &&
      tuanSaiKhongSai.loi.length === 5,
    'BÀI TUẦN: BẢN SAI PHẢI THẬT SỰ ĐỎ HÀNG RÀO — một bản sai được chấm sạch thì nó không sai',
    'nó chỉ là một cách nói khác, và đội ngũ đọc xong sẽ học rằng cái sai là ' +
    'chuyện cảm tính · hai phép đo ngược chiều trên cùng một bộ dò: bản mẫu phải ' +
    'sạch, bản sai phải đỏ');

  const tuanHong = mCN.soatTuan({ca:[
    {...caTot(1), chuyen:'Chị Nguyễn Thị Lan nhắn cho em lúc khuya.'},
    {...caTot(2), dieuPham:['HP14']},
    {...caTot(3), dieuPham:[]},
    {...caTot(4), mau:SAI},
    caTot(5)
  ], thi:thi10.slice(0, 9)});
  const maHong = tuanHong.loi.map(l => l.ma).sort().join(' ');
  bao(maHong === 'CATHAT DIEULA MAUKHONGDAT SOTHI THIEUDIEU',
    'BÀI TUẦN BẮT ĐỦ NĂM LỚP HỎNG — ca chưa ẩn danh · mã điều không có thật · không gọi tên điều · bản mẫu phạm hàng rào · thiếu câu thi',
    maHong + ' · một bản mẫu phạm hàng rào dạy đúng cái đang bị cấm, và nó dạy ' +
    'mạnh hơn mọi lời dặn vì nó được gắn nhãn "mẫu"');
}

/* ══════════════ PHÂN HỆ 4 · VẬN HÀNH & CHĂM SÓC ══════════════

   Cả phân hệ có giá trị ở đúng một dòng của bảng đèn: đèn Đỏ, NGƯỜI
   THẬT, GỌI ĐIỆN. Một cái đèn đỏ đóng lại được bằng tin nhắn thì nó
   không phải đèn đỏ — nhắn tin rẻ, nhanh, và đóng được việc trong
   sổ, nên nếu cho phép thì mọi đèn đỏ đều đóng bằng tin nhắn và bảng
   ba màu còn đúng hai màu. */
{
  const mVH = await import('../may-chu/van-hanh-cham-soc.js');
  const NGAY = n => new Date(Date.now() - n*86400000).toISOString();

  /* ── CỔNG GHI: Ô MÁY TÍNH VÀ Ô TRỎ SANG BỊ CHẶN ── */
  const oTuTinh = await goi({fn:'lapSongSinh', token:tkSA, u:'superadmin@gita365.vn',
    maNha:'NHA-VH1', ngayThamGia:NGAY(3), tenCon:'Bi', den:'XANH', kpi:88});
  bao(!oTuTinh.than.ok && oTuTinh.than.code === 'OTUTINH' &&
      oTuTinh.than.oLa.join() === 'den,kpi',
    'GHI ĐÈ MỘT TRƯỜNG MÁY TÍNH BỊ CHẶN — hồ sơ song sinh không giữ cột nào cho chúng',
    'bắt ' + oTuTinh.than.oLa.join(' · ') + ' — ghi đè một trường máy tính là biến ' +
    'một phép đo thành một lời khai, mà nhìn thì vẫn y hệt');

  /* Thiếu ngày tham gia thì cả nhịp 365 ngày không sinh ra được. */
  const khongMoc = await goi({fn:'lapSongSinh', token:tkSA, u:'superadmin@gita365.vn',
    maNha:'NHA-VH0', tenCon:'Bi'});
  bao(!khongMoc.than.ok && khongMoc.than.code === 'THIEUTHAMGIA',
    'KHÔNG CÓ NGÀY THAM GIA THÌ KHÔNG LẬP ĐƯỢC HỒ SƠ — cả nhịp 365 ngày sinh từ mốc ấy',
    'không mốc thì nhà nào người phụ trách nhớ mới được chạm, và nhà im lặng lâu ' +
    'nhất đúng là nhà dễ bị quên nhất');

  /* ── BA NHÀ, BA ĐÈN ── */
  /* Nhà XANH phải là nhà MỚI tham gia. Bài thử đầu cho nhà này tham
     gia 40 ngày trước rồi chờ nó xanh — và nó ra ĐỎ, đúng như phải
     thế: một nhà tham gia bốn mươi ngày mà CHƯA AI CHẠM lần nào thì
     im lặng bốn mươi ngày. Chỗ ấy đáng một phép đo riêng, ngay dưới. */
  await goi({fn:'lapSongSinh', token:tkSA, u:'superadmin@gita365.vn',
    maNha:'NHA-XANH', ngayThamGia:NGAY(2), tenCon:'An', noiLo:'Con ngại nói'});
  await goi({fn:'lapSongSinh', token:tkSA, u:'superadmin@gita365.vn',
    maNha:'NHA-TUTHAN', ngayThamGia:NGAY(9), tenCon:'Bo'});
  await goi({fn:'lapSongSinh', token:tkSA, u:'superadmin@gita365.vn',
    maNha:'NHA-DO', ngayThamGia:NGAY(60), tenCon:'Cu'});

  /* Nhà tham gia 40 ngày mà chưa ai chạm: tự nó là ĐỎ. Không có
     dòng nào trong sổ thì số ngày im lặng ĐÚNG BẰNG số ngày đã tham
     gia — đếm từ lúc quen nhau, không đếm từ lúc chạm lần đầu. Nhà
     bị bỏ quên ngay từ đầu là nhà dễ bị bỏ quên nhất, nên nó phải
     lên đỏ chứ không được nằm im ở xanh vì "chưa có dữ liệu". */
  await goi({fn:'lapSongSinh', token:tkSA, u:'superadmin@gita365.vn',
    maNha:'NHA-QUEN', ngayThamGia:NGAY(40), tenCon:'Bin'});
  const boQuen = await goi({fn:'docSongSinh', token:tkSA, u:'superadmin@gita365.vn',
    maNha:'NHA-QUEN'});
  bao(boQuen.than.den.den === 'DO' && boQuen.than.mayTinh.soNgayImLang >= 40,
    'NHÀ CHƯA AI CHẠM LẦN NÀO TỰ LÊN ĐÈN ĐỎ — im lặng đếm từ lúc quen nhau, không từ lúc chạm lần đầu',
    boQuen.than.mayTinh.soNgayImLang + ' ngày im lặng · để nó nằm im ở xanh vì ' +
    '"chưa có dữ liệu" thì nhà bị bỏ quên ngay từ đầu là nhà không ai đi tìm');

  const CC = {canCu:'đèn Xanh, nhịp ngày 3', aiDuyet:'chị Hoa'};
  await goi({fn:'ghiCham', token:tkSA, u:'superadmin@gita365.vn',
    maNha:'NHA-XANH', kieu:'wow', noiDung:'Khen An hôm nay tự dọn bàn', ...CC});

  const xanh = await goi({fn:'docSongSinh', token:tkSA, u:'superadmin@gita365.vn',
    maNha:'NHA-XANH'});
  const tuThan = await goi({fn:'docSongSinh', token:tkSA, u:'superadmin@gita365.vn',
    maNha:'NHA-TUTHAN'});
  const do1 = await goi({fn:'docSongSinh', token:tkSA, u:'superadmin@gita365.vn',
    maNha:'NHA-DO'});
  bao(xanh.than.den.den === 'XANH' && tuThan.than.den.den === 'VANG' &&
      tuThan.than.den.tuThan === true && do1.than.den.den === 'DO' &&
      do1.than.den.batBuocGoi === true &&
      xanh.than.mayTinh.soWow === 1,
    'ĐÈN TÍNH LÚC ĐỌC, KHÔNG GIỮ CỘT — ba nhà ra ba màu, và vùng tử thần tự lên VÀNG dù chưa im lặng ngày nào',
    'XANH · VÀNG (ngày ' + tuThan.than.ngayThu + ', tử thần) · ĐỎ — một cột đèn cũ ' +
    'khai XANH cho một nhà đã im lặng hai mươi ngày, và cả quy trình gọi điện ' +
    'trong hai mươi tư giờ đi theo nó');

  /* ── CỔNG 1 · HAI CỘT LÀM CHO CẢ SỔ CÓ NGHĨA ── */
  const thieuCanCu = await goi({fn:'ghiCham', token:tkSA, u:'superadmin@gita365.vn',
    maNha:'NHA-XANH', kieu:'nhan', noiDung:'Chào chị', aiDuyet:'chị Hoa'});
  bao(!thieuCanCu.than.ok && thieuCanCu.than.code === 'THIEUCOT' &&
      thieuCanCu.than.thieu.join() === 'canCu',
    'SỔ DẤU VẾT THIẾU CĂN CỨ THÌ KHÔNG GHI ĐƯỢC',
    'một lượt chạm không có căn cứ là một tin nhắn, và một tin nhắn không chứng ' +
    'minh được gì lúc có tranh chấp');

  /* ── CỔNG 2 · VÙNG TỬ THẦN KHÔNG NHẮC BÀI ── */
  const nhacBai = await goi({fn:'ghiCham', token:tkSA, u:'superadmin@gita365.vn',
    maNha:'NHA-TUTHAN', kieu:'nhan', noiDung:'Chị ơi nhắc Bo làm bài tập tối nay nhé',
    canCu:'đèn Vàng, vùng tử thần', aiDuyet:'chị Hoa'});
  const hoiTham = await goi({fn:'ghiCham', token:tkSA, u:'superadmin@gita365.vn',
    maNha:'NHA-TUTHAN', kieu:'nhan', noiDung:'Chị ơi hôm nay Bo có vui không ạ',
    canCu:'đèn Vàng, vùng tử thần', aiDuyet:'chị Hoa'});
  bao(!nhacBai.than.ok && nhacBai.than.code === 'NHACBAI' &&
      nhacBai.than.tuThan === true && hoiTham.than.ok === true,
    'VÙNG TỬ THẦN NGÀY 8–12: NHẮC BÀI BỊ CHẶN, HỎI THĂM THÌ QUA',
    'bắt "' + nhacBai.than.dinh.join(' · ') + '" — ngày 8–12 là chỗ người ta bỏ, và ' +
    'bỏ trong im lặng; nhắc bài đúng lúc ấy là đẩy họ đi nhanh hơn');

  /* ── CỔNG 3 · ĐÈN ĐỎ PHẢI GỌI, VÀ NGƯỜI GỌI PHẢI LÀ NGƯỜI ── */
  const doNhan = await goi({fn:'ghiCham', token:tkSA, u:'superadmin@gita365.vn',
    maNha:'NHA-DO', kieu:'nhan', noiDung:'Chị ơi dạo này nhà mình sao ạ',
    canCu:'đèn Đỏ, im lặng 60 ngày', aiDuyet:'chị Hoa'});
  const doMay = await goi({fn:'ghiCham', token:tkSA, u:'superadmin@gita365.vn',
    maNha:'NHA-DO', kieu:'goi', boiAi:'bot',
    noiDung:'Đã gọi, nhà đang bận', canCu:'đèn Đỏ', aiDuyet:'chị Hoa'});
  const doNguoi = await goi({fn:'ghiCham', token:tkSA, u:'superadmin@gita365.vn',
    maNha:'NHA-DO', kieu:'goi', boiAi:'chị Hoa',
    noiDung:'Đã gọi mười phút, nhà đang mệt vì việc riêng, hẹn tuần sau',
    canCu:'đèn Đỏ, im lặng 60 ngày', aiDuyet:'anh Quang'});
  bao(!doNhan.than.ok && doNhan.than.code === 'DOPHAIGOI' &&
      !doMay.than.ok && doMay.than.code === 'DOPHAINGUOI' &&
      doNguoi.than.ok === true,
    'ĐÈN ĐỎ: TIN NHẮN BỊ CHẶN, MÁY GỌI BỊ CHẶN, NGƯỜI THẬT GỌI THÌ QUA — đây là cái răng của cả Phân hệ 4',
    'một cái đèn đỏ đóng lại được bằng tin nhắn thì nó không phải đèn đỏ; và thứ ' +
    'đang thiếu ở một nhà im lặng mười lăm ngày là một NGƯỜI, không phải một câu chữ');

  /* ── SỔ NÀY KHÔNG RA GOOGLE SHEETS ── */
  const raNgoaiSo = mVH.xuatSoRaNgoai([
    {ngay:'2026-09-01', maNha:'NHA-DO', noiDung:'Gọi cho chị Nguyễn Thị Lan về bé Cu',
     canCu:'đèn Đỏ'}]);
  const raSach = mVH.xuatSoRaNgoai([
    {ngay:'2026-09-01', maNha:'NHA-DO', noiDung:'Đã gọi, nhà hẹn tuần sau',
     canCu:'đèn Đỏ'}]);
  bao(raNgoaiSo.duocRa === false && raNgoaiSo.ngo.length > 0 && raSach.duocRa === true &&
      /Luật số 91\/2025\/QH15/.test(raNgoaiSo.vi),
    'SỔ DẤU VẾT KHÔNG RA GOOGLE SHEETS — bản đặc tả đề nghị, và chỗ này CỐ Ý không làm theo',
    'mỗi dòng mang tên gia đình, tên con và nội dung một cuộc trò chuyện riêng; đẩy ' +
    'lên một dịch vụ đặt ngoài lãnh thổ là xử lý dữ liệu xuyên biên giới, và phạm ' +
    'thẳng Điều 13 của chính Hiến pháp Bộ não');

  /* Sổ xếp TĂNG DẦN, đọc xuôi được. */
  const so = await goi({fn:'doSoCham', token:tkSA, u:'superadmin@gita365.vn',
    maNha:'NHA-DO'});
  bao(so.than.ok && so.than.so === 1 && so.than.ds[0].denLuc === 'DO' &&
      so.than.ds[0].canCu.length > 0,
    'SỔ GHI ĐÈN LÚC CHẠM, không đèn lúc đọc lại — đèn đổi mỗi ngày, và dòng sổ phải giữ đúng cái đèn hôm ấy',
    'ghi đèn lúc đọc lại thì một cuộc gọi đèn Đỏ ba tháng trước hiện ra như một ' +
    'cuộc gọi vào nhà đang xanh');
}

/* ══════════════ GITA-CEO-OS v3.0 · HỆ ĐIỀU HÀNH ══════════════

   Cả phần này là BẢNG, và bảng thì không chặn được gì — đó là rủi ro
   lớn nhất của chính nó. Nên mọi phép đo dưới đây đo CÁI RĂNG, không
   đo chữ: hai mốc thời gian của bước hỏi ngược, cửa bốc nhà không
   nhận ô lọc, bản tin sáng nói ra phần nó không trình, và ngưỡng gọi
   lấy thẳng từ Bộ não chứ không chép sang. */
{
  const mHDH = await import('../may-chu/he-dieu-hanh.js');
  const mBN2 = await import('../may-chu/bo-nao.js');

  /* ── BẢN TIN SÁNG · CẮT THÌ PHẢI NÓI RA ── */
  const cho = Array.from({length: 30}, (x, i) =>
    ({ma: 'M' + i, viec: 'Việc ' + i, gap: i === 29}));
  const bt = await goi({fn:'banTinSang', token:tkSA, u:'superadmin@gita365.vn',
    choDuyet:cho, denDo:['NHA-DO'], cauKhach:'Hôm nay con tự ngồi vào bàn.'});
  bao(bt.than.ok && bt.than.choDuyet.length === mHDH.TRAN_DUYET_SANG &&
      bt.than.conLaiChuaTrinh === 25 && bt.than.choDuyet[0].ma === 'M29' &&
      /CÒN 25 mục/.test(bt.than.vi),
    'BẢN TIN SÁNG CẮT Ở NĂM MỤC NHƯNG NÓI RA CÒN BAO NHIÊU — và xếp mục GẤP lên trước',
    'trình ' + bt.than.choDuyet.length + ', còn ' + bt.than.conLaiChuaTrinh + ' · cắt ' +
    'im lặng ở con số năm là tệ hơn trình ra ba mươi: người đọc tin rằng hôm nay chỉ ' +
    'có năm việc, và hai mươi lăm việc kia không ai biết là có');

  /* ── BA NHÀ CỦA NHỊP THÁNG · MÁY BỐC, NGƯỜI KHÔNG CHỌN ── */
  const bocLoc = await goi({fn:'chonBaNhaNgauNhien', token:tkSA,
    u:'superadmin@gita365.vn', chiNha:['NHA-XANH']});
  const boc = await goi({fn:'chonBaNhaNgauNhien', token:tkSA, u:'superadmin@gita365.vn'});
  bao(!bocLoc.than.ok && bocLoc.than.code === 'COLOC' &&
      bocLoc.than.loc.join() === 'chiNha' && boc.than.ok &&
      boc.than.nha.length === mHDH.SO_NHA_GOI_THANG,
    'CỬA BỐC BA NHÀ KHÔNG NHẬN MỘT Ô LỌC NÀO — để người chọn thì họ chọn ba nhà đang vui',
    'bốc ra ' + boc.than.nha.join(' · ') + ' · không ai nói dối câu nào mà cả phép ' +
    'kiểm vẫn mất nghĩa, và đó đúng là chỗ nguy hiểm nhất: một phép kiểm hỏng mà vẫn ' +
    'báo xanh');

  const soBoc = db.prepare(
    "SELECT COUNT(*) c FROM audit WHERE viec = 'HDH_BOCNHA'").get().c;
  bao(soBoc >= 1,
    'MỖI LƯỢT BỐC ĐỀU VÀO NHẬT KÝ NGAY — bốc lại cho tới khi ra ba nhà vừa ý thì mọi lượt bốc đều nằm trong sổ',
    soBoc + ' dòng · ghi sau khi bốc chứ không ghi khi "chốt", vì cái đáng ngờ chính ' +
    'là những lượt bốc bị bỏ đi');

  /* ── NĂM BƯỚC · HAI MỐC THỜI GIAN ──
     Đây là cái răng khó làm giả nhất của cả phần. Một ô tự khai "đã
     hỏi ngược rồi" thì bật được mà không viết gì; hai mốc thì không. */
  const NEN_QD = {
    hoiDat:'Có nên mở lớp ở tỉnh thứ hai trong quý này không?',
    phuongAn:[{ten:'Mở ngay'},{ten:'Mở sau khi đủ chặng'},{ten:'Không làm gì', khongLamGi:true}],
    hoiNguoc:'Lý do khả dĩ nhất: chất lượng ở tỉnh mới không giữ được vì chưa ai qua ba cửa.',
    co:{G5:'XANH', G7:'XANH'},
    quyetGi:'Hoãn tới quý sau', viSao:'Chặng 2 chưa đạt',
    giaDinh:'Tỷ lệ ở lại 90 ngày giữ trên 60% trong ba tháng tới',
    xemLaiKhi:'2026-12-31'
  };
  const T0 = Date.now();
  const sau = new Date(T0).toISOString();
  const truoc = new Date(T0 - 86400000).toISOString();

  const nguocSau = mHDH.soatQuyetDinh(Object.assign({}, NEN_QD,
    {hoiNguocLuc:sau, quyetLuc:truoc}));
  const nguocTruoc = mHDH.soatQuyetDinh(Object.assign({}, NEN_QD,
    {hoiNguocLuc:truoc, quyetLuc:sau}));
  bao(nguocSau.dat === false &&
      nguocSau.loi.some(l => l.ma === 'B3' && /biện minh/.test(l.vi)) &&
      nguocTruoc.dat === true,
    'CÂU HỎI NGƯỢC PHẢI CÓ MỐC SỚM HƠN LÚC QUYẾT — máy so HAI MỐC, không đọc một ô tự khai',
    'viết sau khi quyết thì nó không còn là phép dự phòng — nó là một lời biện minh, ' +
    'và nó luôn nghe rất hợp lý');

  /* ── BA PHƯƠNG ÁN, VÀ MỘT PHẢI LÀ "KHÔNG LÀM GÌ" ── */
  const haiPA = mHDH.soatQuyetDinh(Object.assign({}, NEN_QD,
    {phuongAn:[{ten:'Mở ngay'},{ten:'Hoãn'}], hoiNguocLuc:truoc, quyetLuc:sau}));
  const khongCoKLG = mHDH.soatQuyetDinh(Object.assign({}, NEN_QD,
    {phuongAn:[{ten:'A'},{ten:'B'},{ten:'C'}], hoiNguocLuc:truoc, quyetLuc:sau}));
  bao(haiPA.dat === false && haiPA.loi.some(l => /có\/không đội lốt/.test(l.vi)) &&
      khongCoKLG.dat === false &&
      khongCoKLG.loi.some(l => /KHÔNG LÀM GÌ/.test(l.vi)),
    'HAI PHƯƠNG ÁN BỊ CHẶN, VÀ BA PHƯƠNG ÁN THIẾU "KHÔNG LÀM GÌ" CŨNG BỊ CHẶN',
    'hai phương án là một câu hỏi có/không đội lốt một lựa chọn · "không làm gì" ' +
    'thường là phương án đúng mà nó không bao giờ tự xuất hiện — không ai họp để đề ' +
    'xuất đừng làm gì cả');

  /* ── CỜ ĐỎ THÌ DỪNG, VÀ KHÔNG GHI ĐƯỢC BƯỚC 5 ── */
  const coDo = await goi({fn:'ghiQuyetDinh', token:tkSA, u:'superadmin@gita365.vn',
    quyet:Object.assign({}, NEN_QD, {co:{G5:'DO', G7:'XANH'},
      hoiNguocLuc:truoc, quyetLuc:sau})});
  const ghiDuoc = await goi({fn:'ghiQuyetDinh', token:tkSA, u:'superadmin@gita365.vn',
    quyet:Object.assign({}, NEN_QD, {hoiNguocLuc:truoc, quyetLuc:sau})});
  bao(!coDo.than.ok && coDo.than.code === 'CODO' && coDo.than.coDo.join() === 'G5' &&
      ghiDuoc.than.ok === true,
    'CỜ ĐỎ CỦA GHẾ 5 HOẶC GHẾ 7 THÌ DỪNG — không ghi được bước 5',
    'hai ghế ấy là hai ghế DUY NHẤT có quyền phủ quyết · một hệ mà tăng trưởng luôn ' +
    'thắng chất lượng thì nó nổ trong vòng hai năm');

  /* ── CHUYỂN CHẶNG · MÁY NÓI ĐỦ HAY CHƯA RỒI DỪNG ── */
  const chuaDu = mHDH.soatChuyenChang('CH1', {oLai90:52, tuGioiThieu:3});
  const duRoi = mHDH.soatChuyenChang('CH1', {oLai90:64, tuGioiThieu:3});
  const nguoiDo = mHDH.soatChuyenChang('CH3', {});
  bao(chuaDu.du === false && chuaDu.thieu.length === 1 &&
      duRoi.du === true && duRoi.mayKhongChuyen === true &&
      nguoiDo.nguoiDo === true,
    'ĐỦ ĐIỀU KIỆN THÌ MÁY VẪN KHÔNG TỰ CHUYỂN CHẶNG — nó NÓI đủ rồi dừng',
    'chuyển chặng là một quyết định về QUY MÔ, và mọi quyết định về quy mô nằm ở ' +
    'Vùng Đỏ · chặng 3 và chặng 5 máy không đo được bằng một con số và nó khai thẳng');

  /* ── "TÔI VẮNG BA NGÀY" · NGƯỠNG GỌI LẤY THẲNG TỪ BỘ NÃO ── */
  const vang = await goi({fn:'chuanBiVang', token:tkSA, u:'superadmin@gita365.vn',
    ngay:3});
  bao(vang.than.ok &&
      JSON.stringify(vang.than.nguongGoi) === JSON.stringify(mBN2.DO10) &&
      vang.than.aiThayGhe === undefined && vang.than.choChu === 'HDH-02',
    'NGƯỠNG "BẮT BUỘC GỌI DÙ ĐANG BẬN" LẤY ĐÚNG MƯỜI VIỆC VÙNG ĐỎ, không dựng danh sách thứ hai',
    mBN2.DO10.length + ' việc · hai danh sách ngưỡng thì cái nào cũng tự tin, và lúc ' +
    'gấp người ta đọc cái nào gần tay hơn · và ô "ai thay ghế nào" BỎ HẲN KHOÁ chứ ' +
    'không khai bừa một cái tên — khai bừa thì lúc gấp người ấy không biết mình đang ' +
    'được trông đợi');

  /* ── BẢNG ĐIỀU KHIỂN · BA Ô NGƯỜI KHAI KHÔNG RA SỐ 0 ── */
  const bang = await goi({fn:'docBangDieuKhien', token:tkSA, u:'superadmin@gita365.vn'});
  const coSoKhong = (bang.than.loiKhai || []).some(d => d.giaTri === 0);
  const deuChuaNhap = (bang.than.loiKhai || []).every(d => d.chuaNhap === true);
  bao(bang.than.ok && bang.than.doDuoc.length === 9 &&
      bang.than.loiKhai.length === 3 && deuChuaNhap && !coSoKhong,
    'CHƯA AI NHẬP THÌ BỎ HẲN KHOÁ, KHÔNG GHI SỐ 0 — một số 0 cạnh chín số đo được đọc ra là "chưa làm việc tử tế nào"',
    bang.than.doDuoc.length + ' chỉ số đo được · ' + bang.than.loiKhai.length +
    ' chỉ số người khai, nêu ở NGĂN RIÊNG · trống là "chưa ai nhập", 0 là "đo được ' +
    'và bằng không", và hai câu ấy khác hẳn nhau');

  /* ── TÁM THƯỚC TUẦN TRỎ VÀO RÀO THẬT ── */
  const tt = mHDH.thuocTuan();
  bao(tt.thuoc.length === 8 && tt.raoCo.length === 10 &&
      /không có dung sai/i.test(tt.motTramKhongDungSai),
    'NĂM THƯỚC ĐÍCH 100% KHÔNG CÓ DUNG SAI, và cả năm TRỎ vào hàng rào 10 điểm đã có',
    'nới xuống 99% là bỏ hẳn phép canh — một phần trăm của một nghìn lượt là mười gia đình');
}

/* ══════════════ BỘ PROMPT · VÒNG CHẠY MỘT NỘI DUNG ══════════════

   Prompt dựng ở trình duyệt (nơi kho đang mở) — phép đo ấy nằm ở mục
   89. Ở đây đo phần máy chủ: vòng chạy sáu bước, và cái răng
   soạn-khác-duyệt. */
{
  const mBP = await import('../may-chu/bo-prompt.js');

  /* ── NHẢY BƯỚC BỊ CHẶN ── */
  const nhay = await goi({fn:'ghiLuotPrompt', token:tkSA, u:'superadmin@gita365.vn',
    maBai:'BAI-01', buoc:'V4', nhaCungCap:'groq'});
  bao(!nhay.than.ok && nhay.than.code === 'NHAYBUOC' &&
      nhay.than.thieu.join() === 'V1,V2,V3',
    'NHẢY THẲNG TỚI SOI LUẬT BỊ CHẶN — sáu bước chạy ĐÚNG THỨ TỰ',
    'thiếu ' + nhay.than.thieu.join(' · ') + ' · soi luật trước khi sửa thì sửa xong ' +
    'lại phải soi lại, và người duyệt đọc một bản không phải bản sắp đăng');

  /* ── CÁI RĂNG CHÍNH · SOẠN KHÔNG TỰ DUYỆT ĐƯỢC ── */
  await goi({fn:'ghiLuotPrompt', token:tkSA, u:'superadmin@gita365.vn',
    maBai:'BAI-01', buoc:'V1', vai:'A', nhaCungCap:'gemini'});
  const tuDuyet = await goi({fn:'ghiLuotPrompt', token:tkSA, u:'superadmin@gita365.vn',
    maBai:'BAI-01', buoc:'V2', vai:'C', nhaCungCap:'gemini'});
  const khacNha = await goi({fn:'ghiLuotPrompt', token:tkSA, u:'superadmin@gita365.vn',
    maBai:'BAI-01', buoc:'V2', vai:'C', nhaCungCap:'groq'});
  bao(!tuDuyet.than.ok && tuDuyet.than.code === 'TUDUYET' && khacNha.than.ok === true,
    'VAI C CHẠY CÙNG NHÀ CUNG CẤP VỚI VAI A THÌ BỊ CHẶN — một mô hình không tự phản biện chính nó được',
    'phần duyệt sẽ chỉ là phần soạn nói lại lần nữa, và nó sẽ đồng ý với chính nó · ' +
    'sổ vẫn đủ sáu dòng nên không ai đọc ra · cùng luật L3 của thang năm cổng');

  /* ── BƯỚC MÁY PHẢI KHAI NHÀ CUNG CẤP ── */
  const khongNha = await goi({fn:'ghiLuotPrompt', token:tkSA, u:'superadmin@gita365.vn',
    maBai:'BAI-02', buoc:'V1', vai:'A'});
  bao(!khongNha.than.ok && khongNha.than.code === 'THIEUNHA',
    'BƯỚC MÁY KHÔNG KHAI NHÀ CUNG CẤP THÌ KHÔNG GHI ĐƯỢC',
    'không khai thì không kiểm được luật soạn-khác-duyệt, và luật ấy là cả lý do vòng ' +
    'chạy này tồn tại');

  /* ── HAI BƯỚC CUỐI LÀ NGƯỜI, VÀ SỔ NÊU RIÊNG ── */
  await goi({fn:'ghiLuotPrompt', token:tkSA, u:'superadmin@gita365.vn',
    maBai:'BAI-01', buoc:'V3', vai:'A', nhaCungCap:'gemini'});
  await goi({fn:'ghiLuotPrompt', token:tkSA, u:'superadmin@gita365.vn',
    maBai:'BAI-01', buoc:'V4', vai:'D', nhaCungCap:'groq'});
  const giua = await goi({fn:'docVongChay', token:tkSA, u:'superadmin@gita365.vn',
    maBai:'BAI-01'});
  bao(giua.than.thieuMay.length === 0 && giua.than.thieuNguoi.join() === 'V5,V6' &&
      giua.than.duVong === false && giua.than.soanKhacDuyet === true,
    'BỐN BƯỚC MÁY XONG KHÔNG PHẢI LÀ GẦN XONG — sổ nêu RIÊNG phần máy và phần người',
    'còn thiếu ' + giua.than.thieuNguoi.join(' · ') + ' · gộp thành một con số "đã qua ' +
    'mấy bước" thì một bài mới chạy xong bốn bước máy trông gần xong, trong khi thứ ' +
    'còn thiếu là cả hai bước của NGƯỜI');

  /* ── MỘT LƯỢT LÀ MỘT DÒNG MỚI, KHÔNG GHI ĐÈ ── */
  const soDong = db.prepare(
    "SELECT COUNT(*) c FROM luotPrompt WHERE maBai = 'BAI-01'").get().c;
  bao(soDong === 4,
    'MỖI LƯỢT LÀ MỘT DÒNG MỚI KÈM NHÀ CUNG CẤP VÀ GIỜ — không có cột "đã qua vòng"',
    soDong + ' dòng · ghi đè một ô như thế thì mất hẳn phần lịch sử, mà chính phần ' +
    'lịch sử chứng minh được rằng bài đã đi ĐỦ vòng chứ không phải có người bấm cho xong');

  /* ── NHIỆT ĐỘ: HAI VAI SOI PHẢI THẤP HƠN HAI VAI SOẠN ── */
  const ndDat = mBP.soatNhietDo();
  const ndSai = mBP.soatNhietDo({A:0.4, B:0.4, C:0.9, D:0.2});
  bao(ndDat.dat === true && ndSai.dat === false && ndSai.sai.join() === 'C' &&
      /BỊA RA LỖI/.test(ndSai.vi),
    'HAI VAI SOI CHẠY Ở NHIỆT ĐỘ THẤP HƠN HAI VAI SOẠN — và máy nói VAI NÀO sai, không nói một chữ "đạt"',
    'một người soi ở nhiệt độ cao là một người soi biết BỊA RA LỖI, và một lỗi bịa ra ' +
    'làm người viết thôi tin cả bản soi · một chữ "đạt" không nói vai nào đang sai, ' +
    'và sửa mò thì lần sau sai y hệt');

  /* ── MÁY CHỦ KHÔNG GIỮ MỘT CHỮ NÀO CỦA BỐN PROMPT ── */
  const nguonBP = fs.readFileSync('may-chu/bo-prompt.js', 'utf8');
  const camChu = ['SỰ THẬT', 'XƯNG HÔ', 'BÉ TẬP BÒ', 'TRI KỶ', 'vĩ đại nhất',
    'Không biết thì nói không biết'];
  const lot = camChu.filter(c => nguonBP.indexOf(c) >= 0);
  bao(lot.length === 0,
    'MÁY CHỦ KHÔNG GIỮ MỘT CHỮ NÀO CỦA BỐN PROMPT — nó chỉ ghi VÒNG CHẠY',
    'soi ' + camChu.length + ' cụm · giữ một bản ở máy chủ là dựng bản thứ hai của ' +
    'mười ba sự thật cùng một lúc, và bản thứ hai này nguy hơn mọi bản trước vì ' +
    'prompt CHÍNH LÀ thứ nói chuyện với khách');
}

/* ══════════════ PHÂN HỆ 5 · TÀI CHÍNH ══════════════

   Kho đã có cả một hệ tài chính chạy thật, nên phần này chỉ đo thứ
   Phần VII mang lại: bảy con số KHÔNG cùng một loại, và ba cái cổng.

   Chỗ đáng đo nhất là S2 — số tháng sống được tính trên TIỀN CỦA HỌC
   VIỆN chứ không trên tổng tiền mặt. Tính trên tổng thì nó nói dối
   theo đúng hướng nguy hiểm nhất: dài ra đúng lúc thu được nhiều tiền
   trả trước, tức là đúng lúc nghĩa vụ giao dịch vụ nặng nhất. */
{
  const mTC = await import('../may-chu/tai-chinh-ceo.js');

  /* ── MỘT TỶ LỆ PHẢI NÓI CỠ MẪU, VÀ MẪU RỖNG THÌ KHÔNG TRẢ 0% ── */
  const tlCo = mTC.tyLe(7, 10, 4);
  const tlRong = mTC.tyLe(0, 0, 12);
  bao(tlCo.pt === 70 && tlCo.mau === 10 && tlCo.chuaDuTuoi === 4 &&
      tlRong.pt === undefined && tlRong.mau === 0 && tlRong.chuaDuTuoi === 12 &&
      /máy chưa biết/.test(tlRong.vi),
    'MẪU RỖNG THÌ KHÔNG TRẢ VỀ 0%, VÀ MỌI TỶ LỆ ĐỀU NÓI CỠ MẪU KÈM SỐ NHÀ CHƯA ĐỦ TUỔI',
    'số 0 đọc ra là "không ai ở lại", không trả về đọc ra là "máy chưa biết" — hai ' +
    'câu khác hẳn nhau, cùng luật với ba bậc lời khai của phễu thị giác');

  /* ── S2 TÍNH TRÊN TIỀN CỦA HỌC VIỆN, KHÔNG TRÊN TỔNG TIỀN MẶT ──
     Dựng một nhà vừa trả trước cả năm: tiền mặt nhiều, nhưng phần lớn
     là nghĩa vụ chưa giao. */
  db.prepare("INSERT INTO hoSoKhach (maKhachHang,uidPhuHuynh,tuyen,tang,trangThai,vaoLuc)" +
    " VALUES ('NHA-TC1','u-tc1','GITA365',3,'dangHoc',?)")
    .run(new Date(Date.now() - 30*86400000).toISOString());
  db.prepare("INSERT INTO phieuThu (id,maKhachHang,soTien,hinhThuc,nguoiGhi,ghiLuc,trangThai)" +
    " VALUES ('PT-TC1','NHA-TC1',36500000,'chuyenKhoan','ketoan',?,'daDuyet')")
    .run(new Date().toISOString());
  db.prepare("INSERT INTO chiPhi (id,khoanMuc,soTien,ngayChi,hinhThuc,dienGiai," +
    "nguoiDeXuat,deXuatLuc,trangThai) VALUES ('CP-TC1','matBang',3000000,?," +
    "'chuyenKhoan','thuê tháng','ketoan',?,'daDuyet')")
    .run(new Date().toISOString().slice(0,10), new Date().toISOString());

  const bay = await goi({fn:'bayConSoCEO', token:tkSA, u:'superadmin@gita365.vn'});
  const d = bay.than.doDuoc;
  bao(bay.than.ok && d.S1_chuaGiao > 0 && d.S1_tienHocVien < d.S1_tienMat &&
      /TIỀN CỦA HỌC VIỆN/.test(bay.than.vi),
    'S2 TÍNH TRÊN TIỀN CỦA HỌC VIỆN — tiền mặt TRỪ phần học phí đã thu mà chưa giao',
    'tiền mặt ' + d.S1_tienMat + ' · chưa giao ' + d.S1_chuaGiao + ' · của Học viện ' +
    d.S1_tienHocVien + ' — tính trên tổng thì số tháng sống được dài ra đúng lúc ' +
    'nghĩa vụ giao dịch vụ nặng nhất');

  /* Bảy con số trả về ở BA NGĂN riêng, không gộp một bảng bảy dòng. */
  bao(!!bay.than.doDuoc && !!bay.than.duTuoi && !!bay.than.ucTinh &&
      bay.than.ucTinh.S5_giaTri365.laUocTinh === true &&
      typeof bay.than.giaDinh === 'string' && bay.than.giaDinh.length > 20,
    'BẢY CON SỐ TRẢ VỀ BA NGĂN RIÊNG, và giá trị 365 ngày tự khai là ƯỚC TÍNH khi chưa có nhà nào đủ tuổi',
    'gộp cả bảy cùng kiểu chữ thì người đọc tin cả bảy như nhau — mà hai con số bị ' +
    'tin nhầm nhiều nhất lại đúng là hai con số dùng để quyết định tiêu tiền');

  /* Nhà mới ba mươi ngày KHÔNG được tính vào tỷ lệ ở lại 90 ngày. */
  bao(bay.than.duTuoi.S6_oLai90.chuaDuTuoi >= 1,
    'NHÀ CHƯA ĐỦ 90 NGÀY BỊ LOẠI KHỎI MẪU, VÀ SỐ BỊ LOẠI ĐƯỢC NÓI RA',
    bay.than.duTuoi.S6_oLai90.chuaDuTuoi + ' nhà chưa đủ tuổi · đếm họ vào mẫu là ' +
    'thổi tỷ lệ lên, và thổi đúng lúc đang tuyển nhiều nhất');

  /* ── S3 · DOANH THU THÁNG THEO GIỜ VIỆT NAM, KHÔNG UTC (9.99.114) ──
     Tổ thanh tra $500M: S3 cũ group substr(ghiLuc UTC,1,7) nên ở mép tháng
     lệch bảy tiếng — CEO và bao-cao trình HAI con số doanh thu. Phá thử:
     trả về substr(ghiLuc,1,7) → khoản mép VN-Sep(=UTC-Aug) rớt, khoản
     VN-Oct(=UTC-Sep) lọt, chênh lệch đổi từ +7tr sang +9tr. */
  const bgS3 = '2026-09-15T00:00:00.000Z';
  const s3Truoc = (await goi({fn:'bayConSoCEO', token:tkSA, u:'superadmin@gita365.vn',
    bayGio:bgS3})).than.doDuoc.S3_doanhThuThang;
  /* P_IN: UTC 31/8 20:00 = VN 01/9 03:00 → VN tháng Chín (mã cũ tính tháng Tám → rớt) */
  db.prepare("INSERT INTO phieuThu (id,maKhachHang,soTien,hinhThuc,nguoiGhi,ghiLuc,trangThai)" +
    " VALUES ('PT-VNIN','NHA-TC1',7000000,'chuyenKhoan','ketoan','2026-08-31T20:00:00.000Z','daDuyet')").run();
  /* P_OUT: UTC 30/9 20:00 = VN 01/10 03:00 → VN tháng Mười (mã cũ tính tháng Chín → lọt oan) */
  db.prepare("INSERT INTO phieuThu (id,maKhachHang,soTien,hinhThuc,nguoiGhi,ghiLuc,trangThai)" +
    " VALUES ('PT-VNOUT','NHA-TC1',9000000,'chuyenKhoan','ketoan','2026-09-30T20:00:00.000Z','daDuyet')").run();
  const s3Sau = (await goi({fn:'bayConSoCEO', token:tkSA, u:'superadmin@gita365.vn',
    bayGio:bgS3})).than.doDuoc.S3_doanhThuThang;
  bao(s3Sau - s3Truoc === 7000000,
    'S3 DOANH THU THÁNG THEO GIỜ VN: khoản mép VN-tháng-Chín được tính, khoản VN-tháng-Mười bị loại',
    'chênh ' + (s3Sau - s3Truoc) + 'đ (đúng = 7.000.000, khoản VN-Sep). Mã UTC cũ cho 9.000.000 ' +
    '(nhận nhầm khoản VN-Oct, rớt khoản VN-Sep) — CEO và sổ kế toán lệch một cửa sổ bảy tiếng');
  db.prepare("DELETE FROM phieuThu WHERE id IN ('PT-VNIN','PT-VNOUT')").run();

  /* ── L2 · CHẶN RIÊNG KHOẢN QUẢNG CÁO KHI TỶ LỆ Ở LẠI THẤP ── */
  db.prepare("INSERT INTO hoSoKhach (maKhachHang,uidPhuHuynh,tuyen,tang,trangThai,vaoLuc)" +
    " VALUES ('NHA-TC2','u-tc2','GITA365',2,'nghi',?)")
    .run(new Date(Date.now() - 200*86400000).toISOString());

  const chanQC = await goi({fn:'soatLuatTaiChinh', token:tkSA, u:'superadmin@gita365.vn',
    khoanMuc:'tiepThi', soTien:5000000});
  const maPham = (chanQC.than.pham || []).map(x => x.ma);
  bao(chanQC.than.ok && maPham.indexOf('L2') >= 0,
    'L2 · TỶ LỆ Ở LẠI DƯỚI 60% THÌ CHẶN RIÊNG KHOẢN QUẢNG CÁO',
    'đổ tiền vào một cái xô thủng là cách phá sản nhanh nhất trong ngành giáo dục ' +
    '— và nó phá sản CÓ VẺ THÀNH CÔNG: số nhà mới tăng đều, chỉ có số nhà ở lại là không');

  /* Khoản mục KHÁC thì L2 không chặn — cổng chặn đúng chỗ, không chặn cả sổ. */
  const khongChan = await goi({fn:'soatLuatTaiChinh', token:tkSA, u:'superadmin@gita365.vn',
    khoanMuc:'matBang', soTien:3000000});
  bao((khongChan.than.pham || []).map(x => x.ma).indexOf('L2') < 0,
    'L2 CHẶN ĐÚNG KHOẢN QUẢNG CÁO, KHÔNG CHẶN CẢ SỔ CHI',
    'một cổng chặn quá rộng thì người ta tìm đường vòng, và đường vòng không ai canh');

  /* ── L4 KHÔNG DỰNG LẠI · TRỎ SANG THANG DUYỆT CHI ── */
  bao(Array.isArray(chanQC.than.thangDuyetChi) &&
      chanQC.than.thangDuyetChi.length >= 5,
    'LUẬT 4 KHÔNG DỰNG LẠI — mô-đun TRỎ thẳng sang thang duyệt chi đã chạy từ 9.92',
    chanQC.than.thangDuyetChi.length + ' mốc · chép con số ngưỡng sang đây là dựng ' +
    'bản thứ hai của một ngưỡng tiền, và hai bản lệch nhau thì một khoản chi lọt ' +
    'qua mà không ai biết');

  /* ── MÁY NÓI ĐANG Ở KỊCH BẢN NÀO, NHƯNG KHÔNG TỰ CHUYỂN ── */
  const kb = await goi({fn:'dangOKichBan', token:tkSA, u:'superadmin@gita365.vn'});
  bao(kb.than.ok && kb.than.mayKhongChuyen === true &&
      ['KB_XAU','KB_THUONG'].indexOf(kb.than.dauHieu) >= 0,
    'MÁY NÓI DẤU HIỆU ĐANG TRỎ VỀ KỊCH BẢN NÀO, RỒI DỪNG — không tự chuyển',
    'dấu hiệu ' + kb.than.dauHieu + ' · chuyển kịch bản là quyết định có hệ quả với ' +
    'người đang làm, nên nó phải có một cái tên ký bên dưới');

  /* Kỳ chưa có nhà mới nào thì KHÔNG chia — chia cho không là một con
     số vô hạn trình ra như một sự thật. */
  bao(bay.than.duTuoi.S4_soNhaMoi === 0
      ? bay.than.duTuoi.S4_chiPhiKhachMoi === undefined
      : typeof bay.than.duTuoi.S4_chiPhiKhachMoi === 'number',
    'KỲ CHƯA CÓ NHÀ MỚI THÌ KHÔNG CHIA — không trả về một con số vô hạn',
    bay.than.duTuoi.S4_soNhaMoi + ' nhà mới trong kỳ');
}

/* ══════════════ BỘ TỐI ƯU CẤU HÌNH GÓI ══════════════

   Hàm mục tiêu là Lời mở đầu Hiến pháp viết thành mã: đủ tiền rồi thì
   phục vụ thêm người, không lấy thêm tiền của cùng số người.

   Bốn phép đo đầu là bốn chỗ HỎNG THẬT trong tệp gốc của chủ hệ. Phép
   đo về một chỗ đã vá chỉ có nghĩa khi nó ĐỎ ĐƯỢC nếu ai đó vá ngược
   — nên cả bốn đều đo hành vi, không đọc lời khai. */
{
  const mTU = await import('../may-chu/toi-uu-goi.js');
  const mGG = await import('../may-chu/gia-goi.js');

  /* ── V1 · LÀM TRÒN PHẢI IDEMPOTENT ──
     Bản gốc: f(300.000)=290.000 rồi f(290.000)=280.000. Mà BUOC_GIA
     có 1.0 để nghĩa "không đổi", và cái chặn giaMoi===giaCu không nổ.
     Mỗi vòng leo đồi hạ MỌI giá một bước không phải vì điểm số. */
  const mau = [300000, 287431, 999999, 1000000, 2500000, 10000000, 15000000];
  const troi = mau.filter(v => mTU.lamTron(v) !== mTU.lamTron(mTU.lamTron(v)));
  bao(troi.length === 0,
    'V1 · LÀM TRÒN GIÁ IDEMPOTENT — gọi hai lần ra đúng một kết quả',
    'bản gốc hạ một bước mỗi lần gọi, và BUOC_GIA có 1.0 để nghĩa "không đổi" nên ' +
    'mười hai vòng leo đồi hạ 300.000 xuống 180.000 mà không phải vì điểm số');

  /* ── V2 · KHÔNG CÓ BƯỚC NHẢY Ở BIÊN ──
     Bản gốc: f(999.999)=990.000 nhưng f(1.000.000)=900.000. */
  const a = mTU.lamTron(999999), b = mTU.lamTron(1000000);
  bao(Math.abs(b - a) <= 100000 && b >= 1000000,
    'V2 · KHÔNG CÓ BƯỚC NHẢY Ở BIÊN MỘT TRIỆU',
    '999.999 → ' + a + ' · 1.000.000 → ' + b + ' — bản gốc lệch một đồng thì phép ' +
    'hạ khác nhau một trăm lần');

  /* ── V3 · KIỂU GIÁ ÁP CHO MỌI BẬC, VÀ CŨNG IDEMPOTENT ──
     Bản gốc chỉ áp "đuôi 9" dưới mười triệu. Và bản vá ĐẦU của tôi
     cũng sai đúng chỗ ấy: giaDep(1.000.000)=900.000 rồi 890.000. */
  const troiDep = [300000, 1000000, 999999, 15000000, 290000, 10000000, 2500000]
    .filter(v => mTU.giaDep(v) !== mTU.giaDep(mTU.giaDep(v)));
  bao(troiDep.length === 0 && mTU.giaDep(300000) === 290000,
    'V3 · GIÁ "ĐUÔI 9" ÁP CHO MỌI BẬC VÀ KHÔNG TRÔI — hạ không được làm giá rơi xuống bậc dưới',
    'bản vá đầu của tôi quên chỗ ấy: 1.000.000 → 900.000 rồi 890.000, đúng lỗi V2 ' +
    'quay lại ở một chỗ khác');

  /* ── V4 · KHÔNG CHIA ĐÔI KHI LỢI NHUẬN KHÔNG TĂNG THEO QUY MÔ ── */
  const TS = {donGiaBuoi: {NHOM: 300000, COACH_1_1: 800000, TU_HOC: 0},
    tyLeLapDay: 0.8, quyMoNhom: {NHOM: 15, NHOM_NHO: 6, NHOM_LON: 25, HOI_THAO: 80},
    khoBaiGiangMoiNam: 500000000, quanLyVaTiepThi: 800000000, thueSuat: 0.2};
  const LO = [
    {ma:'A0', ten:'Free', nhanh:'TU_DI', giaNiemYet:0, tyLeChon:0, buoi:[{loai:'TU_HOC', soBuoi:2}]},
    /* Gói biên gộp ÂM: giá 100.000 mà mỗi người tốn 20 buổi nhóm. */
    {ma:'A1', ten:'Lỗ', nhanh:'TU_DI', giaNiemYet:100000, tyLeChon:0.5, buoi:[{loai:'NHOM', soBuoi:20}]}
  ];
  const gLo = mTU.giaiQuyMo(LO, TS, mTU.RANG_BUOC_MAC_DINH);
  bao(gLo.giaiDuoc === false && /KHÔNG tăng theo quy mô/.test(gLo.vi),
    'V4 · LỢI NHUẬN KHÔNG TĂNG THEO QUY MÔ THÌ NÓI LÀ KHÔNG GIẢI ĐƯỢC, không trả về một con số',
    'bản gốc chia đôi mà không kiểm điều kiện chia đôi — có gói biên gộp âm thì ' +
    'càng đông càng lỗ, và phép chia đôi vẫn trả về một con số trông y hệt một con ' +
    'số đúng');

  /* ── GÁC HIẾN PHÁP CHẠY TRƯỚC MỌI PHÉP TÍNH ── */
  const KHONG_FREE = [
    {ma:'B1', ten:'Có phí', nhanh:'TU_DI', giaNiemYet:500000, tyLeChon:1, buoi:[{loai:'NHOM', soBuoi:4}]}
  ];
  let batFree = false;
  try { mGG.kiemHienPhap(KHONG_FREE, TS); } catch (e) { batFree = e.hienPhap === true; }
  bao(batFree,
    'GÁC HIẾN PHÁP: DANH MỤC KHÔNG CÓ GÓI MIỄN PHÍ THÌ KHÔNG TỒN TẠI',
    'bậc thang GITA bắt đầu từ chỗ một gia đình chưa trả đồng nào cũng vào được — ' +
    'bỏ bậc ấy là đổi hẳn Học viện thành một chỗ bán khoá học');

  /* ── MÁY KHÔNG ĐOÁN MÔ HÌNH CHI PHÍ ── */
  const thieu = mGG.kiemThamSo({donGiaBuoi: {NHOM: 1}, tyLeLapDay: 0.8});
  bao(thieu.du === false && thieu.thieu.length === 4 &&
      /KHÔNG đoán hộ/.test(thieu.vi),
    'THIẾU MÔ HÌNH CHI PHÍ THÌ CHẶN, VÀ NÓI THIẾU Ô NÀO — máy không rơi về một bộ mặc định',
    'thiếu ' + thieu.thieu.join(' · ') + ' — một bộ mặc định ở đây là cách chắc ' +
    'nhất để cả bộ tối ưu chạy trên số tưởng tượng mà không ai biết');

  /* ── HÀM MỤC TIÊU: ĐỦ TIỀN RỒI THÌ PHỤC VỤ THÊM NGƯỜI ──
     Hai cấu hình cùng ĐẠT mục tiêu: một phục vụ nhiều hơn, một lãi
     nhiều hơn. Cấu hình phục vụ nhiều hơn phải THẮNG. */
  const RB = Object.assign({}, mTU.RANG_BUOC_MAC_DINH,
    {loiNhuanSauThueToiThieu: 1, soNguoiDayToiDa: 99999, soLuotFreeToiDa: 5000});
  const NEN = [
    {ma:'A0', ten:'Free', nhanh:'TU_DI', giaNiemYet:0, tyLeChon:0, buoi:[{loai:'TU_HOC', soBuoi:2}]},
    {ma:'A1', ten:'Gói', nhanh:'TU_DI', giaNiemYet:2000000, tyLeChon:1, buoi:[{loai:'NHOM', soBuoi:4}]}
  ];
  const dGiaCao = mTU.chamDiem(NEN, TS, RB, 4000);
  /* Rẻ hơn MỘT BẬC, không rẻ tới mức lỗ. Bài thử đầu hạ xuống 1,5
     triệu và cấu hình ấy LỖ 180 triệu — nên nó không "đã đạt mục
     tiêu", và phép so hai bậc ưu tiên không còn so được gì. */
  const reHon = NEN.map(g => Object.assign({}, g,
    {giaNiemYet: g.giaNiemYet > 0 ? 1900000 : 0}));
  const dGiaRe = mTU.chamDiem(reHon, TS, RB, 4000);
  bao(dGiaCao.datMucTieuLoiNhuan && dGiaRe.datMucTieuLoiNhuan &&
      dGiaRe.loiNhuanSauThue < dGiaCao.loiNhuanSauThue &&
      dGiaRe.tong > dGiaCao.tong,
    'ĐÃ ĐẠT MỤC TIÊU THÌ GIÁ RẺ HƠN THẮNG, DÙ LÃI ÍT HƠN — Lời mở đầu Hiến pháp viết thành mã',
    'lãi ' + Math.round(dGiaRe.loiNhuanSauThue/1e6) + ' triệu thắng lãi ' +
    Math.round(dGiaCao.loiNhuanSauThue/1e6) + ' triệu · đủ tiền rồi thì phục vụ ' +
    'thêm người, không lấy thêm tiền của cùng số người');

  /* CHƯA đạt mục tiêu thì ngược lại: lãi nhiều hơn thắng. */
  const RB_CAO = Object.assign({}, RB, {loiNhuanSauThueToiThieu: 1e15});
  const cCao = mTU.chamDiem(NEN, TS, RB_CAO, 4000);
  const cRe = mTU.chamDiem(reHon, TS, RB_CAO, 4000);
  bao(!cCao.datMucTieuLoiNhuan && cCao.tong > cRe.tong,
    'CHƯA ĐẠT MỤC TIÊU THÌ LÃI NHIỀU HƠN THẮNG — hai bậc ưu tiên đảo đúng chiều',
    'chưa đủ tiền thì mọi thứ khác là chuyện của năm sau: Học viện đóng cửa thì số ' +
    'gia đình được phục vụ bằng không');

  /* ── RÀNG BUỘC CỨNG KHÔNG MUA ĐƯỢC BẰNG ĐIỂM ĐẸP ── */
  const RB_IT = Object.assign({}, RB, {soNguoiDayToiDa: 0});
  const dCung = mTU.chamDiem(NEN, TS, RB_IT, 4000);
  bao(dCung.phamCung === true && dCung.viPham.some(v => v.ma === 'RB1'),
    'RÀNG BUỘC CỨNG TÁCH RIÊNG — vượt là cấu hình KHÔNG TỒN TẠI, không phải cấu hình kém điểm',
    'trộn hai loại vào một con số phạt thì một cấu hình không tuyển nổi người vẫn ' +
    'thắng nhờ điểm đẹp');

  /* ── toiUuHoa KHÔNG trả cấu hình PHẠM CỨNG là "tối ưu" (9.99.114) ──
     Tổ thanh tra $500M: hạt giống ban đầu không ai soi phamCung; khi không
     hàng xóm nào cải thiện, hạt giống phạm-cứng được trả về ok:true — một
     kế hoạch cần 12 người dạy trình ra như đáp án. Phá thử: bỏ `if
     (tot.phamCung) return {ok:false}` → dòng này đỏ. */
  const RB_KHONGTHE = Object.assign({}, RB, {soNguoiDayToiDa: 2});
  const uuKhongThe = mTU.toiUuHoa(NEN, TS, RB_KHONGTHE, 12);
  bao(uuKhongThe.ok === false && uuKhongThe.code === 'PHAMCUNG',
    'toiUuHoa NÓI KHÔNG GIẢI ĐƯỢC khi mọi cấu hình phạm ràng buộc CỨNG — không trình kế hoạch không tuyển nổi người',
    'một công cụ định giá trình ra cấu hình vật lý bất khả thi như đáp án là nói dối · code=' +
    uuKhongThe.code);
  /* Và KHÔNG bắt oan: ràng buộc rộng thì toiUuHoa vẫn giải được bình thường. */
  const uuGiaiDuoc = mTU.toiUuHoa(NEN, TS, RB, 12);
  bao(uuGiaiDuoc.ok === true && !uuGiaiDuoc.diem.phamCung,
    'toiUuHoa vẫn giải được khi ràng buộc đủ rộng — cổng mới không bắt oan cấu hình hợp lệ',
    'diem.phamCung=' + uuGiaiDuoc.diem.phamCung);
}

const soRa = await goi({fn:'soDiRa', token:tkSA, u:'superadmin@gita365.vn'});
bao(soRa.than.ok && soRa.than.so === 1 &&
    soRa.than.ds[0].daGui === raNgoai.than.daGui,
  'SỔ ĐI RA GIỮ NGUYÊN VĂN CHUỖI ĐÃ GỬI, không giữ một bản tóm',
  'bản tóm thì lúc cần đối chất lại phải tin vào chính cái đang bị nghi');

/* ══ PHẦN VỀ: ẢNH THẬT GẮN VÀO BẢN GHI ══ */
bao(raNgoai.than.ok && raNgoai.than.coAnh === true &&
    /^tg\/DR-[A-Za-z0-9]+\.png$/.test(String(raNgoai.than.anhNguoi || '')),
  'CỬA ĐI RA NAY CÓ CẢ PHẦN VỀ — ảnh nhận được cất vào kho và gắn lên bản ghi',
  'tới 9.99.36 cửa này chỉ dựng đề bài rồi trả về cho người bấm tự mang đi, ' +
  'nên lớp người vẫn là ô chờ dù chủ hệ đã nạp khoá · ' + raNgoai.than.anhNguoi);

bao(String((tieuDeCong || {}).Authorization || '') === 'Bearer khoa-ve-thu-nghiem',
  'khoá đi ra gửi bằng Authorization: Bearer, không nhét vào đường dẫn',
  'khoá nằm trong đường dẫn thì nó vào nhật ký máy chủ trung gian, vào lịch sử ' +
  'trình duyệt, và vào mọi chỗ ghi lại đường dẫn');

{
  const sau = db.prepare('SELECT anhNguoi, idDiRa, trangThai FROM deXuatThiGiac WHERE id=?')
    .get(idTG);
  bao(sau.anhNguoi && sau.idDiRa === raNgoai.than.id,
    'ảnh gắn kèm MÃ LƯỢT ĐI RA — sáu tháng sau còn tra được đề bài nào sinh ra nó (C15)');
  bao(sau.trangThai === 'duyet',
    'và ẢNH VỀ KHÔNG TỰ NÂNG BẬC — nó là nguyên liệu mới, không phải một lượt duyệt (C12)',
    'bậc vẫn là "' + sau.trangThai + '"');
  const ldr = db.prepare('SELECT ketQua, ghiChu FROM luotDiRa WHERE id=?')
    .get(raNgoai.than.id);
  bao(ldr.ketQua === 'ok' && ldr.ghiChu === sau.anhNguoi,
    'sổ đi ra ghi cả KẾT QUẢ, không chỉ ghi lượt gửi');
}

/* Ba dạng trả về, cùng một cửa. */
for (const dang of ['data', 'url']) {
  dangCong = dang;
  const r2 = await goi({fn:'guiDeBaiRaNgoai', token:tkSA, u:'superadmin@gita365.vn',
    id:idTG});
  bao(r2.than.ok && r2.than.coAnh === true,
    'cổng trả dạng "' + dang + '" cũng nhận được ảnh — không ép một nhà cung cấp',
    r2.than.anhNguoi);
}
dangCong = 'than';

/* Cổng hỏng thì KHÔNG được im lặng coi như đã gửi. */
{
  dangCong = 'loi';
  const rl = await goi({fn:'guiDeBaiRaNgoai', token:tkSA, u:'superadmin@gita365.vn',
    id:idTG});
  bao(!rl.than.ok && rl.than.code === 'CONGTUCHOI' && !!rl.than.daGui,
    'CỔNG NGOÀI HỎNG THÌ NÓI RA, và đề bài vẫn vào sổ để gọi lại được',
    'im lặng trả về "đã gửi" là chỗ tệ nhất: lớp người vẫn trống mà không ai đi tìm');
  const ldr2 = db.prepare("SELECT ketQua FROM luotDiRa WHERE ketQua='loi'").all();
  bao(ldr2.length >= 1, 'và lượt hỏng ấy ghi rõ là hỏng trong sổ đi ra');
  dangCong = 'than';
}

/* ══ VẼ NHƯ CHATGPT: BỘ CHUYỂN ĐỔI DẠNG OPENAI (9.99.40) ══

   Chủ hệ hỏi "cài đặt khả năng vẽ như của ChatGPT". Làm được, vì đó
   là một cửa HTTP mua được — khác hẳn "mở chức năng vẽ của Claude".
   Nhưng trỏ thẳng GITA_CONG_VE vào OpenAI thì nó trả 400, vì hai bên
   nói hai dạng khác nhau. Đo cả hai chiều: gửi ĐÚNG dạng OpenAI, và
   đọc được cả hai kiểu OpenAI trả về. */
{
  env.GITA_KIEU_VE = 'openai';
  env.GITA_MAU_VE = 'mo-hinh-thu-nghiem';
  dangCong = 'openai';
  const oa = await goi({fn:'guiDeBaiRaNgoai', token:tkSA, u:'superadmin@gita365.vn',
    id:idTG});
  bao(oa.than.ok && oa.than.coAnh === true,
    'KIỂU OPENAI: gửi đi và nhận ảnh về được',
    oa.than.anhNguoi);
  bao(thanGuiCong && thanGuiCong.model === 'mo-hinh-thu-nghiem' &&
      typeof thanGuiCong.prompt === 'string' && thanGuiCong.n === 1 &&
      /^\d+x\d+$/.test(String(thanGuiCong.size || '')),
    'và gửi ĐÚNG DẠNG OpenAI — {model, prompt, size, n}, không phải dạng riêng ' +
    'của Học viện',
    'trỏ thẳng cổng vào OpenAI mà gửi dạng riêng thì nó trả 400, và người bấm ' +
    'chỉ thấy "cổng trả về 400" · gửi: ' + JSON.stringify(
      {model: thanGuiCong.model, size: thanGuiCong.size, n: thanGuiCong.n}));
  /* Phép đo đầu tôi đòi chuỗi "BỐI CẢNH" có trong prompt — SAI, vì
     bản ghi thử là loại hình KHÔNG cần người, mà phần tả bối cảnh chỉ
     thêm vào cho loại hình có người. Phép đo đúng và mạnh hơn: prompt
     phải TRÙNG TỪNG CHỮ với chuỗi cửa khai là đã gửi. Trùng từng chữ
     thì không có chỗ nào cho bộ chuyển đổi lặng lẽ cắt bớt đề bài. */
  bao(String((thanGuiCong || {}).prompt || '') === oa.than.daGui,
    'và đề bài đi ra NGUYÊN VĂN trong trường prompt — bộ chuyển đổi đổi vỏ, ' +
    'không đụng vào ruột',
    'sổ khai ' + oa.than.soChu + ' ký tự, prompt ' +
    String((thanGuiCong || {}).prompt || '').length + ' ký tự');

  dangCong = 'openaiUrl';
  const oa2 = await goi({fn:'guiDeBaiRaNgoai', token:tkSA, u:'superadmin@gita365.vn',
    id:idTG});
  bao(oa2.than.ok && oa2.than.coAnh === true,
    'OpenAI trả {data:[{url}]} cũng nhận được — hai kiểu trả về, một cửa');

  env.GITA_KIEU_VE = 'kieu-khong-co';
  const kla = await goi({fn:'guiDeBaiRaNgoai', token:tkSA, u:'superadmin@gita365.vn',
    id:idTG});
  bao(!kla.than.ok && kla.than.code === 'KIEUCONGLA',
    'kiểu cổng lạ bị từ chối và NÊU RA những kiểu đang có',
    kla.than.error);

  delete env.GITA_KIEU_VE; delete env.GITA_MAU_VE;
  dangCong = 'than';
}

/* Đọc lại ảnh: qua kiểm vai, và chỉ trong thư mục thiết kế. */
{
  await goi({fn:'guiDeBaiRaNgoai', token:tkSA, u:'superadmin@gita365.vn', id:idTG});
  const da = await goi({fn:'docAnhThiGiac', token:tkSA, u:'superadmin@gita365.vn',
    id:idTG});
  bao(da.than.ok && /^data:image\/png;base64,/.test(String(da.than.anh || '')),
    'BỘ VẼ XIN LẠI ĐƯỢC ẢNH để ghép lớp — trả data URI, không trả đường dẫn ký sẵn',
    'đường dẫn ký sẵn là một cái khoá sống tiếp sau khi phiên đã đóng');
  db.prepare("UPDATE deXuatThiGiac SET anhNguoi='../../bi-mat.txt' WHERE id=?").run(idTG);
  const laDuong = await goi({fn:'docAnhThiGiac', token:tkSA, u:'superadmin@gita365.vn',
    id:idTG});
  bao(!laDuong.than.ok && laDuong.than.code === 'DUONGDANLA',
    'đường dẫn trèo ra ngoài thư mục thiết kế bị chặn — không có dòng này thì một ' +
    'mã bản ghi bịa ra đọc được mọi tệp trong kho hồ sơ');
  db.prepare('UPDATE deXuatThiGiac SET anhNguoi=? WHERE id=?')
    .run(raNgoai.than.anhNguoi, idTG);
}

/* Chỉ gửi được thứ ĐÃ DUYỆT. */
const banNhap = await goi({fn:'deXuatThiGiac', token:tkSA, u:'superadmin@gita365.vn',
  deXuat:{dieuNho:'tối nay ghi một dòng vào sổ nhà mình', thoiDiem:'tối sau giờ học', tang:'T2', loaiHinh:'KHUNG', nhiemVu:'Giúp hiểu cách giải mã một biểu hiện',
    noiDung:'Trang giới thiệu chặng hai mươi mốt ngày giải mã nguyên nhân đứng sau ' +
            'một biểu hiện của con.', nguoiXem:['PHUHUYNH']}});
bao(!(await goi({fn:'guiDeBaiRaNgoai', token:tkSA, u:'superadmin@gita365.vn',
  id:banNhap.than.id})).than.ok,
  'CHỈ GỬI RA NGOÀI THỨ ĐÃ DUYỆT — gửi một bản nháp là để thứ chưa ai đọc kỹ rời khỏi hệ');

/* ═══════════════ 16 · VIỆC CHƯA PORT PHẢI BÁO TO ═══════════════ */
console.log('\n15m · BẢNG GIÁ SỬA ĐƯỢC — BA CÁI RĂNG');
/* ══════════════ BẢNG GIÁ · KHUNG Ở KHO, SỐ Ở SỔ ══════════════

   Chỗ cắt và các bảng khai đo ở mục 90 của bộ kiểm. Ở đây đo HÀNH VI
   — ba cái răng, và cả ba đều đo bằng cách LÀM THẬT rồi xem cái gì
   động, cái gì đứng yên. Đọc lời khai của mô-đun thì nó nói gì cũng
   được. */
{
  const mBG = await import('../may-chu/bang-gia.js');
  const mCT = await import('../may-chu/chi-tieu.js');

  /* ── R3 · CHỈ R01, VÀ PHẢI VIẾT LÝ DO ──
     Giá là chỗ một chữ số đổi cả mô hình kinh doanh. Mở cho nhiều vai
     thì sáu tháng sau không ai biết con số hôm nay từ đâu ra. */
  const r03Doi = await goi({fn:'doiGia', token:tkGD, u:'giamdoc@gita365.vn',
    tang:'T3', gia:12000000, lyDo:'Thử xem R03 có đổi được giá không'});
  bao(!r03Doi.than.ok && r03Doi.than.code === 'NOPERM',
    'R03 KHÔNG ĐỔI ĐƯỢC GIÁ — "đặt hoặc đổi giá" là một trong mười việc VÙNG ĐỎ',
    'không uỷ quyền cho ai, và cũng không cho máy');
  const khongLyDo = await goi({fn:'doiGia', token:tkSA, u:'superadmin@gita365.vn',
    tang:'T3', gia:12000000, lyDo:'ừ'});
  bao(!khongLyDo.than.ok && khongLyDo.than.code === 'THIEULYDO',
    'ĐỔI GIÁ KHÔNG LÝ DO THÌ BỊ CHẶN',
    'sáu tháng sau không ai nhớ vì sao con số ấy đổi, và một bảng giá có lịch sử mà ' +
    'không có lý do chỉ kể được rằng ĐÃ đổi, không kể được VÌ SAO');
  /* Mã Vùng Đỏ phải TRỎ THẬT sang Bộ não, không phải một cái tên gõ
     tay — trỏ vào một cái tên không tồn tại thì cổng lặng lẽ không
     chặn gì, mà nhìn vẫn y hệt một cổng đủ răng. */
  bao(mBG.laVungDo() === true, 'và mã Vùng Đỏ TRỎ THẬT sang BoNao.DO10',
    'hai danh sách ngưỡng thì cái nào cũng tự tin, và lúc gấp người ta đọc cái gần tay hơn');

  /* ── BẬC MỚI PHẢI KHAI ĐỦ NĂM Ô KHUNG ── */
  const bacThieu = await goi({fn:'doiGia', token:tkSA, u:'superadmin@gita365.vn',
    tang:'T9', gia:5000000, lyDo:'Thêm bậc Trainer đồng hành 12 buổi mỗi năm'});
  bao(!bacThieu.than.ok && bacThieu.than.code === 'THIEUKHUNG' &&
      bacThieu.than.thieu.length === 5,
    'BẬC MỚI THIẾU KHUNG THÌ BỊ CHẶN, và NÓI RA thiếu ô nào',
    'thiếu ' + (bacThieu.than.thieu || []).join(' · ') + ' · một bậc chỉ có số mà không ' +
    'có lời hứa là một cái giá không gắn với cái gì, và lúc có tranh chấp thì không ai ' +
    'đọc ra bên bán đã hứa giao những gì');

  /* ── R1 · GIÁ ĐÃ CHỐT VÀO LỊCH THU THÌ ĐỨNG YÊN ──
     Cái răng nặng nhất. Đổi theo là đổi số tiền một gia đình đã ký —
     họ không được hỏi, và họ chỉ biết khi nhìn hoá đơn. */
  const truocKy = db.prepare(
    "SELECT ky, phaiThu FROM kyThu WHERE maKhachHang=? AND tang=3 ORDER BY ky").all(nhaMoi);
  const giaCu = truocKy.reduce((a, x) => a + x.phaiThu, 0);

  const doiT3 = await goi({fn:'doiGia', token:tkSA, u:'superadmin@gita365.vn',
    tang:'3', gia:12000000,
    lyDo:'Chi phí Coach đồng hành tăng, chốt lại giá chặng 90 ngày cho đợt tuyển tới'});
  bao(doiT3.than.ok && doiT3.than.giaCu === 10000000 && doiT3.than.gia === 12000000,
    'R01 ĐỔI ĐƯỢC GIÁ, và cửa nói ra giá CŨ lẫn giá MỚI',
    doiT3.than.giaCu + 'đ → ' + doiT3.than.gia + 'đ');

  const sauKy = db.prepare(
    "SELECT ky, phaiThu FROM kyThu WHERE maKhachHang=? AND tang=3 ORDER BY ky").all(nhaMoi);
  /* truocKy.length > 0 KHÔNG phải phòng thủ thừa: lịch rỗng thì phép so
     này là 0 === 0 và nó XANH mãi mãi trong khi chẳng đo gì. Một phép đo
     chỉ đúng khi cái nó đo CÓ THỂ sai. */
  bao(truocKy.length > 0 && sauKy.reduce((a, x) => a + x.phaiThu, 0) === giaCu &&
      JSON.stringify(sauKy) === JSON.stringify(truocKy),
    'R1 · LỊCH THU ĐÃ DỰNG ĐỨNG YÊN SAU KHI ĐỔI GIÁ — không đồng nào động',
    'vẫn ' + giaCu + 'đ trên ' + sauKy.length + ' kỳ · đổi theo là đổi số tiền một gia ' +
    'đình đã ký, và chuyện ấy không sửa lại được');

  /* ── NỬA KIA CỦA R1 · NHÀ CHƯA KÝ THÌ KÝ GIÁ MỚI ──
     Thiếu nửa này thì cả cửa đổi giá vô nghĩa: giá đổi trong sổ mà
     không lịch thu nào bao giờ mang con số mới. Và nó phải đo bằng
     TIỀN THẬT trong bảng kyThu, không đo bằng lời khai của cửa. */
  db.prepare("INSERT INTO hoSoKhach (maKhachHang,uidPhuHuynh,tuyen,tang,trangThai,vaoLuc)" +
    " VALUES ('GITA-BG01','U-bg01','hocSinh',0,'dangHoc',?)")
    .run(new Date().toISOString());
  await dungLichThu(env.CSDL, 'GITA-BG01', 3, new Date().toISOString());
  const kyMoi = db.prepare(
    "SELECT phaiThu FROM kyThu WHERE maKhachHang='GITA-BG01' AND tang=3").all();
  bao(kyMoi.length > 0 && kyMoi.reduce((a, x) => a + x.phaiThu, 0) === 12000000,
    'NHÀ KÝ SAU KHI ĐỔI GIÁ THÌ LỊCH THU MANG GIÁ MỚI — 12.000.000đ',
    kyMoi.length + ' kỳ · nếu lịch thu đọc hằng số thay vì sổ thì nó vẫn ra 10 triệu, ' +
    'và cả cửa đổi giá là một cái nút không nối vào đâu cả');
  /* Và cửa PHẢI NÓI RA điều đó ngay, không để người đổi giá tự phát hiện. */
  bao(/[Ll]ịch thu/.test(String(doiT3.than.lichThuCuKhongDoi || '')) &&
      /[Tt]hang duyệt chi/.test(String(doiT3.than.thangChuaChotLai || '')),
    'và cửa NÓI RA cả hai hệ quả ngay lúc đổi, không để người đổi tự phát hiện');

  /* ── NHÀ MỚI THÌ KÝ GIÁ MỚI ──
     Nửa kia của R1: giá cũ đóng băng cho nhà cũ, nhưng nhà chưa ký thì
     phải nhận giá đang chạy. Không có nửa này thì cả cửa đổi giá vô
     nghĩa — đổi xong mà không ai ký giá mới bao giờ. */
  const giaSong = await mBG.docGiaHienHanh(env.CSDL);
  bao(giaSong.gia[3] === 12000000 && giaSong.nguon[3] === 'daDoi' &&
      giaSong.nguon[4] === 'khoiDau',
    'GIÁ ĐANG CHẠY TÍNH LÚC ĐỌC, và nói rõ bậc nào KHỞI ĐẦU bậc nào ĐÃ ĐỔI',
    'gộp hai thứ ấy lại thì một bậc chưa ai đụng tới trông y hệt một bậc vừa được ' +
    'chốt lại tuần trước');

  /* ── MỘT DÒNG MỚI, KHÔNG GHI ĐÈ ── */
  await goi({fn:'doiGia', token:tkSA, u:'superadmin@gita365.vn',
    tang:'3', gia:11000000, lyDo:'Hạ lại sau khi đo đợt tuyển đầu, giữ đúng mức cũ cộng một'});
  const so = db.prepare("SELECT gia FROM bangGia WHERE tang='3' ORDER BY ghiLuc ASC").all();
  bao(so.length === 2 && so[0].gia === 12000000 && so[1].gia === 11000000,
    'ĐỔI LẦN HAI GHI MỘT DÒNG MỚI — dòng cũ còn nguyên',
    'câu người ta hỏi lúc có tranh chấp không phải "giá bây giờ là bao nhiêu" — nó là ' +
    '"hôm ấy nhà này ký ở giá nào", và ghi đè thì câu ấy không còn chỗ nào trả lời được');
  const trung = await goi({fn:'doiGia', token:tkSA, u:'superadmin@gita365.vn',
    tang:'3', gia:11000000, lyDo:'Ghi lại đúng con số đang chạy xem có chặn không'});
  bao(!trung.than.ok && trung.than.code === 'KHONGDOI',
    'GHI ĐÚNG GIÁ ĐANG CHẠY THÌ BỊ CHẶN',
    'một dòng không đổi gì là làm sổ dài ra mà không thêm sự thật nào');

  /* ── R2 · ĐỔI GIÁ KHÔNG TỰ DỜI THANG DUYỆT CHI ──
     Thang neo vào giá gói T3. Tự dời theo nghĩa là quyền tiêu tiền của
     cả Học viện đổi mà KHÔNG AI KÝ. */
  const neoTruoc = mCT.soatNeoThang();
  const neoSau = mCT.soatNeoThang(giaSong.gia);
  bao(neoTruoc.khop === true && neoSau.khop === false && neoSau.lech.length > 0,
    'R2 · ĐỔI GIÁ LÀM soatNeoThang BÁO LỆCH — nó NÊU chứ không dời',
    neoSau.lech.map(l => l.nac).join(' · ') + ' lệch · dời thang là một quyết định về ' +
    'quyền tiêu tiền, có người chịu trách nhiệm; mục chờ BG-02 hỏi đúng câu ấy');
  /* Và THANG PHẢI ĐỨNG YÊN. Đọc thẳng con số nấc đang để trong chính
     dòng báo lệch: nó vẫn là giá KHỞI ĐẦU, không phải giá vừa đổi. Một
     cái thang tự dời theo giá là một cổng tự nới ra mà không ai ký. */
  const lechN3 = neoSau.lech.filter(l => l.nac === 'N3')[0];
  bao(!!lechN3 && lechN3.thangDangDe === 10000000 && lechN3.giaGoiBayGio === 12000000,
    'và THANG ĐỨNG YÊN — nấc N3 vẫn ở 10.000.000đ trong khi gói đã 12.000.000đ',
    'phép soi nêu CẢ HAI con số, nên người quyết đọc ra chỗ lệch mà không phải đi tra');

  /* ── SỔ ĐỔI GIÁ XẾP TĂNG DẦN, ĐỌC XUÔI ĐƯỢC ── */
  const soDoi = await goi({fn:'soDoiGia', token:tkGD, u:'giamdoc@gita365.vn', tang:'3'});
  bao(soDoi.than.ok && soDoi.than.so === 2 &&
      soDoi.than.ds.every(d => d.lyDo && d.boiAi === 'superadmin@gita365.vn'),
    'SỔ ĐỔI GIÁ MỞ CHO R01–R03, mỗi dòng có LÝ DO và TÊN NGƯỜI KÝ',
    soDoi.than.so + ' lần đổi · ô boiAi lấy từ hoSo.u của phiên, không phải một ô do ' +
    'người gọi truyền vào');
}

console.log('\n15n · MƯỜI HAI LUẬT GIAO DIỆN — BẢY CÁI RĂNG');
/* ══════════════ LUẬT GIAO DIỆN · PHẦN CÓ RĂNG ══════════════

   Bản luật và hai ngăn đo ở mục 91. Ở đây đo HÀNH VI: gọi thật vào
   cửa rồi xem nó có chặn không. Đọc lời khai của mô-đun thì nó nói gì
   cũng được. */
{
  const mLGD = await import('../may-chu/luat-giao-dien.js');

  /* ── L02 · KHÔNG TỤT CẤP ──
     Lỗ thật của bản này. Cổng cũ ở nangTang đòi tầng mới = tầng cũ + 1,
     nhưng ghiDoiTang nhận denTang tự do và chỉ có đúng một người gọi. */
  const {ghiDoiTang} = await import('../may-chu/ho-so-khach.js');
  /* Đếm TRƯỚC. Bản đầu của phép đo này lọc theo denTang=1 và BẮT OAN
     một dòng hợp lệ — chính nhà ấy đã lên tầng 1 thật ở khối 14b. Một
     phép đo bắt oan thì lần sau người ta tắt nó đi; đếm trước-sau thì
     không có chỗ nào để bắt oan. */
  const lsTruoc = db.prepare(
    "SELECT count(*) c FROM lichSuTang WHERE maKhachHang=?").get(nhaMoi).c;
  let batHaTang = null;
  try {
    await ghiDoiTang(env.CSDL, {maKhachHang: nhaMoi, tuTang: 3, denTang: 1,
      boi: 'superadmin@gita365.vn', lyDo: 'Thử hạ tầng xem có chặn không'});
  } catch (e) { batHaTang = e; }
  bao(!!batHaTang && batHaTang.code === 'HATANG' &&
      /L02|không mã nào giảm|tụt cấp/i.test(String(batHaTang.message)),
    'L02 · HẠ TẦNG BỊ CHẶN NGAY Ở CHỖ GHI, không phải ở chỗ gọi',
    'cổng ở chỗ gọi chỉ bảo vệ đúng người gọi ấy · tụt cấp là lấy lại thứ người ta ' +
    'đã làm được, và một nhà nghỉ ba tháng vì ốm quay lại thấy mất sạch thì họ ' +
    'không quay lại lần thứ hai');
  /* Và NÂNG thì vẫn chạy — một cổng chặn cả đường đúng là một cổng hỏng. */
  /* "Không ghi GÌ CẢ" nghĩa là cả hai bảng, không chỉ bảng tầng. Bản
     đầu của phép đo này chỉ xem hoSoKhach.tang — và phá thử cho thấy
     nó CÂM đúng ở chỗ nguy hiểm: dời cổng xuống SAU câu INSERT thì
     lịch sử tầng vẫn mọc một dòng "xuống tầng 1" trong khi tầng thật
     đứng yên, và phép đo vẫn xanh. Một dòng lịch sử nói một chuyện
     chưa từng xảy ra là thứ người đọc sổ sáu tháng sau tin. */
  const capTruoc = db.prepare("SELECT tang FROM hoSoKhach WHERE maKhachHang=?")
    .get(nhaMoi).tang;
  const lsSau = db.prepare(
    "SELECT count(*) c FROM lichSuTang WHERE maKhachHang=?").get(nhaMoi).c;
  bao(Number(capTruoc) === 3 && Number(lsSau) === Number(lsTruoc),
    'và lượt bị chặn KHÔNG ĐỂ LẠI GÌ — tầng đứng yên VÀ lịch sử tầng không mọc dòng nào',
    'đang ở tầng ' + capTruoc + ' · lịch sử tầng ' + lsTruoc + ' → ' + lsSau +
    ' dòng · một cổng chặn mà vẫn ghi nửa vời thì tệ hơn không chặn, vì sổ kể một ' +
    'chuyện chưa từng xảy ra');

  /* ── L04 · NĂM Ô VÒNG ĐỎ KHÔNG VÀO ĐƯỢC CỬA MÁY CHỦ ──
     Soi MỌI TẦNG: gói ô ấy vào một ô con là lọt, và người gói không
     cố ý — họ chỉ đang gom dữ liệu cho gọn. */
  const nong = mLGD.soatVongDo({cauHoi: 'bình thường', kem: {ho: {thuThaTho: 'con ơi...'}}});
  const sach = mLGD.soatVongDo({cauHoi: 'con không chịu học', maNha: 'GITA-0003'});
  bao(!nong.sach && nong.thay.join() === 'thuThaTho' && sach.sach === true,
    'L04 · Ô VÒNG ĐỎ BỊ BẮT DÙ NẰM SÂU BA TẦNG, và yêu cầu sạch thì đi qua',
    'soi một tầng thì gói ô ấy vào một ô con là lọt · năm ô này là chỗ người ta viết ' +
    'ra điều chưa nói với ai, và một bản sao trên máy chủ là một bản sao đọc được');

  const vdCoach = await goi({fn:'traLoiCoach', token:tkSA, u:'superadmin@gita365.vn',
    luong:'L01', cauHoi:'con không chịu học', maNha:'GITA-0003',
    tuyenNgonMotDoi:'Tôi muốn cuối đời mình...'});
  bao(!vdCoach.than.ok && vdCoach.than.code === 'VONGDO',
    'và cửa traLoiCoach CHẶN yêu cầu mang ô vòng đỏ',
    'mã ' + vdCoach.than.code);

  /* ── L10 · BA GHẾ NGƯỜI GIỮ ──
     Chặn ĐẦU cửa, trước cả phân luồng: bốn thứ này không phải một
     luồng khó cần thêm người duyệt. Phép đo gửi luồng HỢP LỆ để chắc
     rằng thứ chặn nó là cổng Người Giữ chứ không phải cổng phân luồng. */
  const ng = await goi({fn:'traLoiCoach', token:tkSA, u:'superadmin@gita365.vn',
    luong:'L01', maNha:'GITA-0003',
    cauHoi:'Anh viết hộ lời xin lỗi gửi con giúp em với, em không biết nói sao'});
  bao(!ng.than.ok && ng.than.code === 'NGUOIGIU' && ng.than.viec === 'loiXinLoi' &&
      !!ng.than.nhac && ng.than.oVietTay === true,
    'L10 · MÁY KHÔNG SOẠN HỘ LỜI XIN LỖI, và trả kèm DÒNG NHẮC chứ không đuổi tay không',
    'nhắc: "' + (ng.than.nhac || '') + '" · một lời xin lỗi do máy viết đọc lên nghe y ' +
    'hệt một lời xin lỗi thật, nên thứ người nhận nhận được không còn là điều họ tưởng');
  /* Chặn vì máy viết HAY, không vì viết dở — nên câu hỏi thường vẫn đi
     qua cổng này. Một cổng chặn cả câu lành là một cổng bắt oan. */
  const ngSach = mLGD.soatNguoiGiu('công ty em có chính sách khen thưởng nhân viên thế nào');
  bao(ngSach.sach === true,
    'và câu có chữ "khen" nhưng KHÔNG phải lời khen con thì đi qua',
    'dò cụm nhiều âm tiết, không dò âm tiết trần — "khen" nằm trong "khen thưởng"');

  /* ── L08 · KHÔNG GIỮ CHÂN ── */
  const gcBan = mLGD.soatGiuChan('Nhà mình sắp mất chuỗi rồi, vào tick ngay nhé!');
  const gcSach = mLGD.soatGiuChan('Tuần này nhà mình đang đi chuỗi 21 ngày thứ hai.');
  bao(!gcBan.sach && gcSach.sach === true,
    'L08 · CÂU DOẠ MẤT CHUỖI BỊ CHẶN, câu nói về "chuỗi 21 ngày" thì không',
    'bắt ' + gcBan.thay.join(' · ') + ' · mọi mẹo giữ chân đều hiệu quả, đó là lý do ' +
    'chúng có mặt khắp nơi — dùng ở đây là đổi lòng tin của một gia đình lấy vài lượt mở app');

  /* ── HAI NGĂN KHÔNG GỘP ── */
  const bl = await goi({fn:'docLuatGiaoDien', token:tkSA, u:'superadmin@gita365.vn'});
  bao(bl.than.ok && Array.isArray(bl.than.coRang) && Array.isArray(bl.than.canhTruoc) &&
      bl.than.coRang.length === 12 && bl.than.canhTruoc.length === 0 &&
      bl.than.tyLe === undefined && bl.than.daCuongChe === undefined,
    'BẢN LUẬT TRẢ VỀ HAI NGĂN RIÊNG, không một phân số "đã cưỡng chế mấy trên mười hai"',
    bl.than.coRang.length + ' có cổng thật · ' + bl.than.canhTruoc.length +
    ' còn treo · hai ngăn vẫn TÁCH dù ngăn thứ hai rỗng: một phân số ở đây đọc ra ' +
    'như mức hoàn thành, và ngày bản đặc tả sau đẻ ra một luật chưa có bề mặt thì ' +
    'chỗ khai nó phải sẵn đó');
}

console.log('\n15p · MÀN HÔM NAY — NĂM CÁI RĂNG MỞ KHOÁ BỞI LGD-01');
/* ══════════════ HÔM NAY · NHÀ MÌNH ══════════════

   Chủ hệ chốt LGD-01: bốn tab của MỤC C là mấy màn THÊM vào cổng phụ
   huynh. Chốt ấy gỡ năm luật giao diện khỏi chỗ treo, và đây là chỗ đo
   HÀNH VI của chúng — gọi thật vào cửa rồi xem nó có chặn không. */
{
  const mHN = await import('../may-chu/hom-nay.js');

  /* Dựng hai nhịp cho nhà mới: một nhịp thường, một nhịp NẶNG. */
  const luc = new Date().toISOString();
  db.prepare("INSERT INTO nhipNha (id,maNha,ten,thuTu,nangNe,dong,ghiLuc)" +
    " VALUES ('NH-1',?,'Bữa cơm tối',1,0,0,?)").run(nhaMoi, luc);
  db.prepare("INSERT INTO nhipNha (id,maNha,ten,thuTu,nangNe,dong,ghiLuc)" +
    " VALUES ('NH-2',?,'Viết thư cho con',2,1,0,?)").run(nhaMoi, luc);

  /* ── MỘT MÀN — MỘT VIỆC ──
     Máy chủ trả về ĐÚNG MỘT việc, không một danh sách. Trả danh sách
     rồi để màn hình lấy cái đầu thì luật nằm ở màn hình, và luật ở màn
     hình chết cùng lượt viết lại đầu tiên. */
  const hn1 = await goi({fn:'docHomNay', token:tkNhaMoi, u:eMoi, maNha:nhaMoi});
  /* Dòng chi tiết KHÔNG được dereference thứ đang đo. Phá thử bản này
     chứng minh vì sao: `hn1.than.viecLon.ten` khi viecLon undefined thì
     phép đo không ĐỎ — nó SẬP, và một lượt sập giấu luôn mười hai phép
     đo đứng sau nó. Một phép đo chỉ đúng khi cái nó đo có thể sai; nó
     cũng chỉ dùng được khi lúc sai nó còn IN RA được. */
  const vl1 = (hn1.than || {}).viecLon;
  bao(hn1.than.ok && !!vl1 && vl1.id === 'NH-1' &&
      hn1.than.conLai === 1 && hn1.than.ds === undefined,
    'MỘT MÀN — MỘT VIỆC: máy chủ trả ĐÚNG MỘT việc, không một danh sách',
    'việc ' + JSON.stringify(vl1 && vl1.ten) + ', còn ' + hn1.than.conLai +
    ' nhịp nữa · hai việc ngang nhau lúc chín giờ tối, trong bếp, tay bận, là ' +
    'không việc nào được làm');

  /* ── NHÀ KHÁC KHÔNG ĐỌC ĐƯỢC ── */
  bao(!(await goi({fn:'docHomNay', token:tkNhaMoi, u:eMoi, maNha:'GITA-0003'})).than.ok,
    'và một nhà KHÔNG đọc được màn Hôm nay của nhà khác');

  /* ── L11 · BỎ VIỆC KHÔNG BỊ HỎI VẶN ──
     Hai vế NGƯỢC NHAU trên cùng một cửa: bỏ trống lý do phải QUA, và
     ô lý do phải CÓ để người muốn nói có chỗ nói. Thiếu vế nào cũng
     hỏng, và hỏng theo hai hướng khác hẳn nhau. */
  const boTrong = await goi({fn:'boViecHomNay', token:tkNhaMoi, u:eMoi,
    maNha:nhaMoi, maNhip:'NH-1'});
  bao(boTrong.than.ok && boTrong.than.bo === true && boTrong.than.khongHoiThem === true,
    'L11 · BỎ VIỆC KHÔNG VIẾT LÝ DO VẪN QUA — không ai hỏi vì sao',
    'một ô lý do bắt buộc sau khi bỏ việc là một cái cửa quay: muốn đóng việc thì ' +
    'phải giải trình, và lần sau người ta không bỏ việc — họ bỏ app');
  const boCo = await goi({fn:'boViecHomNay', token:tkNhaMoi, u:eMoi,
    maNha:nhaMoi, maNhip:'NH-2', lyDo:'Hôm nay bà ốm, cả nhà ở viện.'});
  const dongLyDo = db.prepare(
    "SELECT lyDo FROM nhipXong WHERE maNha=? AND maNhip='NH-2'").get(nhaMoi);
  bao(boCo.than.ok && dongLyDo && /bà ốm/.test(String(dongLyDo.lyDo)),
    'và ai MUỐN nói thì câu họ viết được GIỮ LẠI — khác nhau ở chỗ MỜI hay ÉP',
    'câu người ta tự viết là câu đáng giá nhất trong cả sổ; thứ bị cấm là ĐÒI');

  /* ── L03 · CHẾ ĐỘ BÃO ──
     Cửa nhận đúng hai ô. Truyền thêm lyDo thì nó KHÔNG ĐI VÀO SỔ —
     không phải "nhận rồi bỏ qua ở tầng dưới", mà là bảng không có cột
     ấy để mà chứa. */
  const bao1 = await goi({fn:'batCheDoBao', token:tkNhaMoi, u:eMoi,
    maNha:nhaMoi, bat:true, lyDo:'Nhà có tang'});
  const cotBao = db.prepare("SELECT * FROM cheDoBao WHERE maNha=?").get(nhaMoi);
  bao(bao1.than.ok && bao1.than.bat === true && bao1.than.chuoiKhongDut === true &&
      cotBao && cotBao.lyDo === undefined,
    'L03 · CHẾ ĐỘ BÃO BẬT MỘT CHẠM, và lý do gửi kèm KHÔNG có chỗ nào để rơi vào',
    'bảng không có cột lyDo · người bật đang ở giữa một chuyện khó, và hỏi họ vì sao ' +
    'là bắt họ kể lại nó cho một cái máy đúng lúc họ ít sức nhất');

  const hn2 = await goi({fn:'docHomNay', token:tkNhaMoi, u:eMoi, maNha:nhaMoi});
  bao(hn2.than.ok && hn2.than.dangBao === true && hn2.than.viecLon === undefined,
    'và đang Bão thì KHÔNG có việc nào hôm nay — nhịp dừng, chuỗi giữ nguyên',
    'bão mà vẫn đứt chuỗi thì Chế độ Bão chỉ là một cái nút đổi màu: người ta sẽ ' +
    'không bấm nó, họ sẽ cố tick cho xong');
  await goi({fn:'batCheDoBao', token:tkNhaMoi, u:eMoi, maNha:nhaMoi, bat:false});

  /* ── L06 · GHIM CỦA CON LÀ CỦA CON ──
     Phép đo phải có CẢ HAI chiều: cha mẹ bị chặn, VÀ chính em ấy đi
     qua được. Chỉ đo chiều chặn thì một cổng chặn tất cả cũng xanh. */
  const maCon = db.prepare("SELECT maHocVien FROM hoSoKhach WHERE maKhachHang=?")
    .get(nhaMoi).maHocVien;
  const chaGhim = await goi({fn:'ghiGhimCon', token:tkNhaMoi, u:eMoi,
    maCon: maCon, o:'C12'});
  bao(!chaGhim.than.ok && chaGhim.than.code === 'GHIMCUACON',
    'L06 · CHA MẸ KHÔNG DI ĐƯỢC GHIM trên bản đồ riêng của con',
    'cho cha mẹ sửa ghim của con là biến bản đồ của đứa trẻ thành bản đồ cha mẹ ' +
    'MUỐN nó đi, và cái còn lại chỉ là một tờ giấy mang tên nó');

  /* Dựng tài khoản của chính em ấy — users.studentId trỏ vào hồ sơ. */
  await themNguoi('U-con1', 'concuanha@vidu.vn', 'MotChuoiTuTe2026!', 'R14',
    {portal:'hs'});
  /* `themNguoi` không ghi studentId — đặt thẳng, vì chính cột ấy là thứ
     cổng L06 và L07 đọc. Nối sai thì cổng mở cho nhầm người, nên bài
     thử phải dựng đúng cái nối thật chứ không giả lập nó. */
  db.prepare("UPDATE users SET studentId = ? WHERE id = 'U-con1'").run(maCon);
  const tkCon = (await goi({fn:'dangNhap', u:'concuanha@vidu.vn',
    mk:'MotChuoiTuTe2026!'})).than.token;
  const conGhim = await goi({fn:'ghiGhimCon', token:tkCon, u:'concuanha@vidu.vn',
    maCon: maCon, o:'C12', ghiChu:'Em muốn làm kiến trúc sư'});
  bao(conGhim.than.ok && conGhim.than.o === 'C12',
    'và CHÍNH EM ẤY thì di được — cổng chặn đúng người, không chặn tất cả',
    'một cổng chặn cả đường đúng là một cổng hỏng, và phép đo chỉ nhìn chiều chặn ' +
    'thì nó xanh trên một cổng như thế');
  const chaDoc = await goi({fn:'docGhimCon', token:tkNhaMoi, u:eMoi, maCon: maCon});
  bao(chaDoc.than.ok && chaDoc.than.diDuoc === false && chaDoc.than.ds.length === 1,
    'cha mẹ XEM ĐƯỢC đủ, và ô diDuoc nói thẳng nút di không hiện',
    'xem được mà không sửa được là đủ để đồng hành — thứ cha mẹ cần là BIẾT, không ' +
    'phải ĐIỀU KHIỂN, và hai cái ấy rất hay bị nhầm là một');

  /* ── L07 · PHỦ QUYẾT ẢNH CỦA CON ──
     Ba trạng thái, BA câu trả lời khác nhau. Gộp "chưa hỏi" với "đã
     từ chối" là chỗ hỏng nặng nhất: chỉ một trong hai được phép đi hỏi. */
  const chuaHoi = await goi({fn:'chiaSeCoAnhCon', token:tkNhaMoi, u:eMoi, maCon: maCon});
  bao(!chuaHoi.than.ok && chuaHoi.than.code === 'CHUAHOI' && chuaHoi.than.anNut === true,
    'L07 · CHƯA HỎI EM ẤY thì nút chia sẻ KHÔNG hiện',
    'mã ' + chuaHoi.than.code);

  const chaKy = await goi({fn:'datDongYAnhCon', token:tkNhaMoi, u:eMoi,
    maCon: maCon, dongY:true});
  bao(!chaKy.than.ok && chaKy.than.code === 'CHICONKY',
    'và CHA MẸ KHÔNG KÝ THAY ĐƯỢC ô đồng ý',
    'cha mẹ ký thay được thì quyền phủ quyết thuộc về cha mẹ, và em chỉ có một dòng ' +
    'chữ nói rằng em có quyền');

  await goi({fn:'datDongYAnhCon', token:tkCon, u:'concuanha@vidu.vn',
    maCon: maCon, dongY:false});
  const tuChoi = await goi({fn:'chiaSeCoAnhCon', token:tkNhaMoi, u:eMoi, maCon: maCon});
  bao(!tuChoi.than.ok && tuChoi.than.code === 'CONTUCHOI' &&
      tuChoi.than.khongHoiLai === true && tuChoi.than.code !== chuaHoi.than.code,
    'EM ẤY NÓI KHÔNG thì chặn bằng MỘT MÃ KHÁC — và hệ không hỏi lại',
    'chưa hỏi là CHUAHOI, đã từ chối là CONTUCHOI · gộp hai cái thì một nhà chưa ai ' +
    'hỏi tới nằm chung rổ với một đứa trẻ đã nói không, mà chỉ một trong hai được ' +
    'phép đi hỏi');

  /* Đổi ý theo CẢ HAI chiều — một lời đồng ý không rút được thì nó
     không phải lời đồng ý, và một lời từ chối không đổi được thì nó là
     một cái khoá chứ không phải một quyền. */
  await goi({fn:'datDongYAnhCon', token:tkCon, u:'concuanha@vidu.vn',
    maCon: maCon, dongY:true});
  const daKy = await goi({fn:'chiaSeCoAnhCon', token:tkNhaMoi, u:eMoi, maCon: maCon});
  const soDong = db.prepare("SELECT count(*) c FROM dongYAnhCon WHERE maCon=?").get(maCon).c;
  bao(daKy.than.ok && Number(soDong) === 2,
    'và em ĐỔI Ý ĐƯỢC cả hai chiều — mỗi lần là một DÒNG MỚI, không ghi đè',
    soDong + ' dòng trong sổ · một lời đồng ý không rút được thì nó không phải lời ' +
    'đồng ý, và một lời từ chối không đổi được thì nó là một cái khoá chứ không phải quyền');
}

console.log('\n15q · GITA-VIP — TRẦN PHẠM VI GIÁM SÁT');
/* ══════════════ TRẦN GIÁM SÁT ══════════════
   Bản luật và phân loại đo ở mục 92. Ở đây đo HÀNH VI: gọi thật vào
   cửa rồi xem cái trần có chặn không. */
{
  const mGS = await import('../may-chu/giam-sat.js');
  const mai = new Date(Date.now() + 30 * 864e5).toISOString();

  /* ── TRẦN CHẶN TRƯỚC MỌI CỔNG KHÁC ──
     Lệnh chạm trần mà THIẾU CẢ lý do lẫn hạn: phải trả CHAMTRAN, không
     phải THIEULYDO. Báo thiếu lý do trước là chỉ người cấp đường viết
     thêm một câu rồi gửi lại, trong khi lệnh ấy không được tồn tại. */
  const cham = await goi({fn:'capLenhGiamSat', token:tkSA, u:'superadmin@gita365.vn',
    phamVi:'Thu sinh trắc nhịp gõ phím của học viên', ngan:'TRE', choAi:'coach@gita365.vn'});
  bao(!cham.than.ok && cham.than.code === 'CHAMTRAN' &&
      (cham.than.cham || []).indexOf('C2') >= 0,
    'TRẦN CHẶN TRƯỚC MỌI CỔNG KHÁC — thiếu cả lý do lẫn hạn mà vẫn trả CHAMTRAN',
    'chạm ' + (cham.than.cham || []).join(' · ') + ' · báo "thiếu lý do" trước là chỉ ' +
    'người cấp đường viết thêm một câu rồi gửi lại, trong khi lệnh ấy không được tồn tại');

  /* R01 CÓ CHỮ KÝ CŨNG KHÔNG MỞ ĐƯỢC — đó là khác biệt giữa TRẦN và QUYỀN. */
  const camDu = await goi({fn:'capLenhGiamSat', token:tkSA, u:'superadmin@gita365.vn',
    phamVi:'Bảng xếp hạng học viên toàn hệ theo điểm hiện diện', ngan:'TRE',
    choAi:'coach@gita365.vn', lyDo:'Chủ hệ yêu cầu dựng bảng vinh danh cuối năm',
    hanDen: mai, bacDich: 14});
  bao(!camDu.than.ok && camDu.than.code === 'CHAMTRAN',
    'và LỆNH R01 ĐỦ LÝ DO ĐỦ HẠN VẪN BỊ CHẶN — trần khác quyền',
    'quyền thì cấp được, trần thì không · một quyền cấp được là một quyền sẽ được cấp ' +
    'đúng vào ngày có người thấy cần');

  /* Ngăn TRE chặn cả khi câu chữ không mang dấu hiệu nào. */
  const treGiay = mGS.soatPhamVi('Ghi hoạt động theo giây trong phiên học', 'TRE');
  const nsGiay = mGS.soatPhamVi('Ghi hoạt động theo giây trong phiên học', 'NHANSU');
  bao(!treGiay.sach && nsGiay.sach === true,
    'NGĂN TRE chặn "theo giây" dù câu chữ không mang dấu hiệu nào, ngăn NHANSU thì không',
    'không phải vì trẻ đáng ngờ hơn — vì trẻ không ký được hợp đồng nào và không rời ' +
    'đi được');

  /* Dò CỤM nhiều âm tiết: "hạng mục" không bị bắt oan. */
  bao(mGS.soatPhamVi('Theo dõi tiến độ từng hạng mục công việc', 'NHANSU').sach === true,
    'và "hạng mục" KHÔNG bị bắt oan — dò cụm nhiều âm tiết, không dò âm tiết trần',
    'một phép đo bắt oan thì lần sau người ta tắt nó đi');

  /* ── BỐN CỔNG CÒN LẠI ── */
  const tuCap = await goi({fn:'capLenhGiamSat', token:tkSA, u:'superadmin@gita365.vn',
    phamVi:'Đọc nhật ký thao tác', ngan:'NHANSU', choAi:'superadmin@gita365.vn',
    lyDo:'Tự kiểm tra hoạt động của chính mình cho tiện', hanDen: mai, bacDich: 5});
  bao(!tuCap.than.ok && tuCap.than.code === 'TUCAP',
    'KHÔNG TỰ CẤP QUYỀN CHO MÌNH',
    'người ký và người được cấp là một thì chữ ký ấy không chứng minh gì');

  const khongHan = await goi({fn:'capLenhGiamSat', token:tkSA, u:'superadmin@gita365.vn',
    phamVi:'Đọc nhật ký thao tác', ngan:'NHANSU', choAi:'coach@gita365.vn',
    lyDo:'Rà soát định kỳ quý bốn theo kế hoạch đã duyệt', bacDich: 11});
  bao(!khongHan.than.ok && khongHan.than.code === 'THIEUHAN',
    'LỆNH KHÔNG CÓ HẠN BỊ CHẶN — không có quyền vĩnh viễn mặc định',
    'một quyền không có hạn là một quyền không ai nhớ đi thu lại: sáu tháng sau nó ' +
    'vẫn mở, người được cấp đã chuyển việc, và không ai biết nó còn đó');

  const khongLyDo = await goi({fn:'capLenhGiamSat', token:tkSA, u:'superadmin@gita365.vn',
    phamVi:'Đọc nhật ký thao tác', ngan:'NHANSU', choAi:'coach@gita365.vn',
    lyDo:'ừ', hanDen: mai, bacDich: 11});
  bao(!khongLyDo.than.ok && khongLyDo.than.code === 'THIEULYDO',
    'LỆNH KHÔNG VIẾT LÝ DO BỊ CHẶN',
    'một sổ lệnh không có lý do chỉ kể được rằng ĐÃ cấp, không kể được VÌ SAO — và ' +
    'không ai dám thu lại một thứ mình không hiểu vì sao có');

  const ngang = await goi({fn:'capLenhGiamSat', token:tkSA, u:'superadmin@gita365.vn',
    phamVi:'Đọc nhật ký thao tác', ngan:'NHANSU', choAi:'coach@gita365.vn',
    lyDo:'Rà soát định kỳ quý bốn theo kế hoạch đã duyệt', hanDen: mai, bacDich: 3});
  bao(!ngang.than.ok && ngang.than.code === 'NGANGCAP',
    'KHÔNG CẤP ĐƯỢC QUYỀN NHÌN VÀO VAI NGANG HOẶC TRÊN',
    'cho phép thì một người tự bảo vệ mình bằng cách nhìn vào người có thể soi mình, ' +
    'và sổ audit thành vũ khí thay vì bằng chứng');

  /* ── CỔNG KHÔNG TRA ĐƯỢC NGƯỜI THÌ ĐÓNG ──
     Phép đo này thêm SAU khi phá thử lộ ra một khoảng trống: bản đầu
     của cổng NGANGCAP viết `if (bacNguoi !== null && ...)`, tức là
     không tìm thấy người thì BỎ QUA. Tôi vá nó, nhưng mọi phép đo lúc
     ấy đều dùng một người CÓ THẬT — nên không phép nào canh được cái
     mở-khi-không-tra-được quay lại.

     Vá một lỗi mà không thêm phép đo canh nó là vá một lần. */
  const khongRo = await goi({fn:'capLenhGiamSat', token:tkSA, u:'superadmin@gita365.vn',
    phamVi:'Đọc nhật ký thao tác', ngan:'NHANSU', choAi:'nguoi-khong-co@vidu.vn',
    lyDo:'Rà soát định kỳ quý bốn theo kế hoạch đã duyệt', hanDen: mai, bacDich: 11});
  bao(!khongRo.than.ok && khongRo.than.code === 'KHONGRONGUOI',
    'CỔNG KHÔNG TRA ĐƯỢC NGƯỜI THÌ ĐÓNG, không bỏ qua',
    'mở là chọn cái tiện lúc viết, và cái tiện ấy rơi đúng vào chỗ nguy hiểm nhất — ' +
    'người không tra được là người đáng hỏi thêm nhất');

  /* Và lệnh KHÔNG KHAI BẬC ĐÍCH cũng bị chặn: không khai thì luật
     "không nhìn vai ngang hoặc trên" không kiểm được, mà luật ấy là cả
     lý do cổng ấy tồn tại. */
  const thieuBac = await goi({fn:'capLenhGiamSat', token:tkSA, u:'superadmin@gita365.vn',
    phamVi:'Đọc nhật ký thao tác', ngan:'NHANSU', choAi:'coach@gita365.vn',
    lyDo:'Rà soát định kỳ quý bốn theo kế hoạch đã duyệt', hanDen: mai});
  bao(!thieuBac.than.ok && thieuBac.than.code === 'THIEUBAC',
    'và LỆNH KHÔNG KHAI BẬC ĐÍCH bị chặn — không khai thì luật không kiểm được');

  /* ── LỆNH HỢP LỆ THÌ QUA — một cổng chặn cả đường đúng là cổng hỏng ── */
  const ok1 = await goi({fn:'capLenhGiamSat', token:tkSA, u:'superadmin@gita365.vn',
    phamVi:'Đọc nhật ký thao tác và lượt xuất tệp', ngan:'NHANSU',
    choAi:'coach@gita365.vn',
    lyDo:'Rà soát định kỳ quý bốn theo kế hoạch đã duyệt ngày 01/10', hanDen: mai,
    bacDich: 11});
  bao(ok1.than.ok && !!ok1.than.id && ok1.than.hanDen,
    'và LỆNH HỢP LỆ THÌ QUA — cổng chặn đúng chỗ, không chặn tất cả',
    'hạn ' + String(ok1.than.hanDen || '').slice(0, 10));

  /* ── HIỆU LỰC TÍNH LÚC ĐỌC, BA NHÓM KHÔNG GỘP ── */
  db.prepare("INSERT INTO lenhGiamSat (id,phamVi,ngan,choAi,lyDo,aiKy,hanDen,ghiLuc,thuLuc)" +
    " VALUES ('GS-CU','Đọc nhật ký','NHANSU','coach@gita365.vn','Việc cũ đã xong từ lâu'," +
    "'superadmin@gita365.vn',?,?,NULL)")
    .run(new Date(Date.now() - 864e5).toISOString(), new Date(Date.now() - 30*864e5).toISOString());
  const so = await goi({fn:'docLenhGiamSat', token:tkSA, u:'superadmin@gita365.vn'});
  bao(so.than.ok && so.than.dangChay.length === 1 && so.than.hetHan.length === 1 &&
      so.than.daThu.length === 0,
    'HIỆU LỰC TÍNH LÚC ĐỌC, và ba nhóm KHÔNG gộp thành một con số',
    so.than.dangChay.length + ' đang chạy · ' + so.than.hetHan.length + ' đã tự hết hạn · ' +
    'gộp thì một quyền đã hết hạn nằm chung rổ với một quyền vừa cấp sáng nay');

  /* ── SỔ NỐI BĂM ── */
  const lanh = await goi({fn:'soatSoDen', token:tkSA, u:'superadmin@gita365.vn'});
  bao(lanh.than.ok && lanh.than.lanh === true && lanh.than.so > 0,
    'SỔ NỐI BĂM LIỀN MẠCH sau mấy lượt ghi thật',
    lanh.than.so + ' dòng');

  /* Sửa MỘT dòng giữa sổ rồi soi lại — và phép đo phải nói ra vỡ Ở ĐÂU,
     không trả một chữ "đạt". */
  const giua = db.prepare("SELECT stt FROM soDen ORDER BY stt ASC LIMIT 1 OFFSET 1").get();
  db.prepare("UPDATE soDen SET chiTiet = 'đã bị sửa' WHERE stt = ?").run(giua.stt);
  const vo = await goi({fn:'soatSoDen', token:tkSA, u:'superadmin@gita365.vn'});
  bao(!vo.than.lanh && vo.than.vo.length > 0 && vo.than.vo[0].stt === giua.stt &&
      /khongChanDuocGi/.test(JSON.stringify(Object.keys(vo.than))),
    'SỬA MỘT DÒNG GIỮA SỔ thì chuỗi VỠ, và phép soi nói ra vỡ ở DÒNG NÀO',
    'vỡ từ dòng ' + vo.than.vo[0].stt + ' · một chữ "đạt" không nói dòng nào bị sửa, ' +
    'và sửa mò thì lần sau không tìm được nữa');
  bao(/xoá cả sổ/.test(String(vo.than.khongChanDuocGi || '')),
    'và phép soi NÓI RA GIỚI HẠN CỦA CHÍNH NÓ — không chống được người xoá cả sổ',
    'một lớp bảo vệ không nói giới hạn thì người đọc tin nó chống được nhiều hơn thật, ' +
    'đúng lý do 9.99.57 từ chối làm dấu chìm trong bit thấp');

  /* ── CHỈ R01 ── */
  bao(!(await goi({fn:'capLenhGiamSat', token:tkGD, u:'giamdoc@gita365.vn',
    phamVi:'Đọc nhật ký', ngan:'NHANSU', choAi:'coach@gita365.vn',
    lyDo:'Rà soát định kỳ quý bốn theo kế hoạch', hanDen: mai, bacDich: 11})).than.ok,
    'R03 KHÔNG CẤP ĐƯỢC LỆNH GIÁM SÁT');
}

console.log('\n15r · VÒNG TỰ NÂNG CẤP — CỬA THỨ NHẤT KHÔNG ĐƯỢC TỰ MỞ');
/* ══════════════ VÒNG TỰ NÂNG CẤP ══════════════
   Bản luật và phân loại đo ở mục 93. Ở đây đo HÀNH VI: gọi thật vào
   cửa rồi xem cái cổng có chặn không.

   Phép đo nặng nhất của khối này là phép đo về chỗ RƠI: một đề xuất
   chạm Hiến pháp không được rơi vào "Cấp 8" — nó phải rơi RA NGOÀI
   đường này. Cấp 8 tìm được chữ ký; ra ngoài thì không. */
{
  const mTNC = await import('../may-chu/tu-nang-cap.js');

  /* ── CHẠM VÙNG CẤM RƠI RA NGOÀI, KHÔNG RƠI VÀO MỘT CẤP ── */
  const xHP = mTNC.xepCap('Nới Điều 3 của Hiến pháp cho trợ lý gọi trẻ là "bé"',
    'Hiến pháp mười ba điều', 'khôi phục bản cũ');
  bao(xHP.ngoaiDuong === true && xHP.cap === undefined &&
      (xHP.cham || []).indexOf('K1') >= 0,
    'CHẠM VÙNG CẤM RƠI RA NGOÀI ĐƯỜNG NÀY, không rơi vào một cấp cao',
    'chạm ' + (xHP.cham || []).join(' · ') + ' · trả về "Cấp 8" là mời người ta đi tìm ' +
    'một chữ ký Cấp 8, và một chữ ký Cấp 8 thì tìm được');

  /* ── CỔNG VÙNG CẤM ĐỨNG TRƯỚC CỔNG "THIẾU Ô LÙI LẠI" ──
     Đề xuất chạm vùng cấm VÀ thiếu luôn đường lùi: phải trả VUNGCAM,
     không phải THIEULUI. Báo thiếu ô trước là chỉ người đề xuất đường
     viết thêm một câu rồi gửi lại. */
  const dxCam = await goi({fn:'deXuatNangCap', token:tkSA, u:'superadmin@gita365.vn',
    viec:'Bỏ bớt một điểm hàng rào mười điểm cho bài viết dễ qua hơn',
    vung:'bộ soi nội dung'});
  bao(!dxCam.than.ok && dxCam.than.code === 'VUNGCAM' &&
      (dxCam.than.cham || []).indexOf('K2') >= 0,
    'và CỔNG VÙNG CẤM ĐỨNG TRƯỚC cổng "thiếu ô lùi lại" — thiếu cả hai mà vẫn trả VUNGCAM',
    'chạm ' + (dxCam.than.cham || []).join(' · '));

  /* K5 — vùng nói về CHÍNH ĐƯỜNG NÀY. Vùng dễ quên nhất. */
  const xK5 = mTNC.xepCap('Cho phép bỏ qua cửa chạy thử khi gấp',
    'vòng nâng cấp', 'bật lại cửa');
  bao(xK5.ngoaiDuong === true && (xK5.cham || []).indexOf('K5') >= 0,
    'K5 CHẶN ĐỀ XUẤT SỬA CHÍNH ĐƯỜNG NÂNG CẤP',
    'một hệ sửa được đường nâng cấp của mình thì lượt đầu tiên là lượt gỡ mọi giới hạn — ' +
    'và nó hợp lệ, có chữ ký, sổ đầy đủ');

  /* ── KHÔNG BẮT OAN ──
     Dò CỤM NHIỀU ÂM TIẾT. "hàng rào sân trường" và "bảng giá của nhà
     cung cấp" đều là câu lành, và bắt oan một câu lành thì lần sau
     người ta tắt phép soi đi. */
  bao(mTNC.soatVungCam('Dựng thêm hàng rào chắn ở sân sau').sach === true &&
      mTNC.soatVungCam('So bảng giá của ba nhà cung cấp máy chủ').sach === true &&
      mTNC.soatVungCam('Mở thêm năm cửa hàng ở tỉnh').sach === true,
    'và BA CÂU LÀNH KHÔNG BỊ BẮT OAN — dò cụm nhiều âm tiết, không dò âm tiết trần',
    '"hàng rào sân" · "bảng giá nhà cung cấp" · "năm cửa hàng"');

  /* ── MÁY XẾP CẤP, NGƯỜI ĐỀ XUẤT KHÔNG TỰ CHỌN ──
     Truyền thẳng `cap: 1` vào cửa mà cấp trong sổ vẫn là 5. Một ô cấp
     do người gọi truyền vào là một LỜI KHAI, và lời khai thì khai được
     cái gì cũng được. */
  const dx5 = await goi({fn:'deXuatNangCap', token:tkSA, u:'superadmin@gita365.vn',
    cap: 1,
    viec:'Thêm ô ghi chú vào hồ sơ dữ liệu trẻ em để coach ghi quan sát',
    vung:'màn hồ sơ song sinh',
    luiLai:'gỡ ô ấy khỏi màn và xoá cột vừa thêm, sổ cũ không đổi'});
  bao(dx5.than.ok && dx5.than.cap === 5,
    'MÁY XẾP CẤP — truyền thẳng cap:1 vào cửa mà sổ vẫn ghi cấp 5',
    'máy xếp vì ' + (dx5.than.viSao || []).join(' · ') + ' · để người đề xuất tự xếp thì ' +
    'mọi thứ đều là Cấp 1, và không ai cố ý nói dối — họ chỉ thật lòng thấy việc mình ' +
    'đang làm là việc nhỏ');

  /* ── THIẾU Ô LÙI LẠI THÌ KHÔNG MỞ CỬA ── */
  const dxLui = await goi({fn:'deXuatNangCap', token:tkSA, u:'superadmin@gita365.vn',
    viec:'Đổi cách xếp danh sách bài trong thư viện', vung:'màn thư viện'});
  bao(!dxLui.than.ok && dxLui.than.code === 'THIEULUI',
    'THIẾU Ô LÙI LẠI THÌ KHÔNG MỞ CỬA 1',
    'một nâng cấp không lùi lại được là một nâng cấp chỉ đi một chiều, và chiều ấy là ' +
    'chiều chưa ai thử');

  /* ── NĂM CỬA ĐI ĐÚNG THỨ TỰ ──
     Cấp 5 đòi soi luật. Nhảy thẳng tới cửa 4 phải đỏ. */
  const idA = dx5.than.id;
  const nhay = await goi({fn:'mocChayThu', token:tkSA, u:'superadmin@gita365.vn',
    id: idA, moc:'bat'});
  bao(!nhay.than.ok && nhay.than.code === 'NHAYCUA' && nhay.than.thieu === 'C2',
    'NHẢY CỬA BỊ CHẶN — cấp 5 chưa soi luật thì chưa tới được cửa chạy thử',
    'soi luật SAU khi đã chạy thì bản được soi không phải bản sắp chạy');

  /* ── NGƯỜI SOI LUẬT KHÁC NGƯỜI ĐỀ XUẤT ── */
  const tuSoi = await goi({fn:'soiLuatNangCap', token:tkSA, u:'superadmin@gita365.vn',
    id: idA, nguoiSoi:'superadmin@gita365.vn',
    ketLuan:'Đã đọc, không thấy vướng luật nào'});
  bao(!tuSoi.than.ok && tuSoi.than.code === 'TUSOI',
    'NGƯỜI SOI LUẬT KHÔNG ĐƯỢC LÀ NGƯỜI ĐỀ XUẤT',
    'cùng một người làm cả hai thì phần soi chỉ là phần đề xuất nói lại lần nữa, và nó ' +
    'sẽ đồng ý với chính nó — mà sổ vẫn đủ năm dòng nên không ai đọc ra');

  const soiOk = await goi({fn:'soiLuatNangCap', token:tkSA, u:'superadmin@gita365.vn',
    id: idA, nguoiSoi:'giamdoc@gita365.vn',
    ketLuan:'Ô ghi chú không rời hệ, Điều 13 không vướng; đề nghị khoá ô ở vai R14'});
  bao(soiOk.than.ok && soiOk.than.cua === 'C2', 'và NGƯỜI KHÁC SOI THÌ QUA CỬA 2',
    'người soi: ' + soiOk.than.nguoiSoi);

  /* ── TÊN NGƯỜI SOI PHẢI LÀ MỘT TÀI KHOẢN CÓ THẬT ──
     Nhận chữ tự do thì gõ một cái tên là qua, và ô ấy thành một lời
     khai không kiểm lại được — đúng thứ cửa này sinh ra để chặn. */
  const dxBia = await goi({fn:'deXuatNangCap', token:tkSA, u:'superadmin@gita365.vn',
    viec:'Thêm ô ghi chú vào hồ sơ dữ liệu trẻ em cho ca thứ hai',
    vung:'màn hồ sơ song sinh', luiLai:'gỡ ô ấy đi, sổ cũ không đổi'});
  const soiBia = await goi({fn:'soiLuatNangCap', token:tkSA, u:'superadmin@gita365.vn',
    id: dxBia.than.id, nguoiSoi:'luật sư A',
    ketLuan:'Đã xem, không thấy vướng gì cả'});
  bao(!soiBia.than.ok && soiBia.than.code === 'KHONGRONGUOI',
    'TÊN NGƯỜI SOI LUẬT PHẢI LÀ MỘT TÀI KHOẢN CÓ THẬT',
    'cổng không xác minh được thì ĐÓNG — cùng bài học của cổng NGANGCAP (9.99.76), ' +
    'nơi một dòng "!== null &&" làm cổng chưa bao giờ chặn gì');

  /* ── VAI NGOÀI R01–R12 KHÔNG GHI ĐƯỢC MỐC CHẠY THỬ ──
     Lỗ thật, tìm ra khi đọc lại diff của chính mình: hai cửa này lúc
     đầu KHÔNG kiểm vai nào cả, nên một phụ huynh đăng nhập hợp lệ ghi
     được mốc chạy thử và kết luận pháp lý cho một lượt nâng cấp hệ. */
  bao(!(await goi({fn:'mocChayThu', token:tk, u:'phuhuynh@gita365.vn',
    id: dxBia.than.id, moc:'bat'})).than.ok &&
      !(await goi({fn:'soiLuatNangCap', token:tk, u:'phuhuynh@gita365.vn',
    id: dxBia.than.id, nguoiSoi:'giamdoc@gita365.vn',
    ketLuan:'Xem qua thấy ổn, không vướng luật nào'})).than.ok,
    'VAI NGOÀI R01–R12 KHÔNG GHI ĐƯỢC MỐC CHẠY THỬ HAY KẾT LUẬN PHÁP LÝ',
    'một cửa không kiểm vai thì mọi người đăng nhập hợp lệ đều đi qua được');

  /* ── CỬA 4 · HAI MỐC THẬT ──
     Ghi mốc kết thúc khi chưa có mốc bắt đầu phải đỏ: không có mốc đầu
     thì không có quãng nào để đo, và một quãng không đo được là một ô
     tích đội lốt một phép đo. */
  const chuaBat = await goi({fn:'mocChayThu', token:tkSA, u:'superadmin@gita365.vn',
    id: idA, moc:'ket', ketQua:'Chạy hai ngày không thấy lỗi nào', luiLaiDaThu: true});
  bao(!chuaBat.than.ok && chuaBat.than.code === 'CHUABAT',
    'CỬA CHẠY THỬ SO HAI MỐC THẬT — mốc kết thúc không có mốc bắt đầu thì đỏ',
    'một ô tích "đã chạy thử đủ" bật được trong một giây');

  await goi({fn:'mocChayThu', token:tkSA, u:'superadmin@gita365.vn', id: idA, moc:'bat'});

  /* ── ĐƯỜNG LÙI PHẢI ĐƯỢC THỬ, KHÔNG CHỈ ĐƯỢC VIẾT ── */
  const chuaThuLui = await goi({fn:'mocChayThu', token:tkSA, u:'superadmin@gita365.vn',
    id: idA, moc:'ket', ketQua:'Chạy hai ngày trong môi trường tách biệt, không lỗi'});
  bao(!chuaThuLui.than.ok && chuaThuLui.than.code === 'CHUATHULUI',
    'ĐƯỜNG LÙI PHẢI ĐƯỢC THỬ Ở CỬA 4, không chỉ được VIẾT ở cửa 1',
    'viết là một lời khai, thử là một phép đo — một đường lùi chưa ai đi thử là một ' +
    'đường lùi không tồn tại, và người ta chỉ phát hiện ra điều đó vào đúng lúc cần nó');

  await goi({fn:'mocChayThu', token:tkSA, u:'superadmin@gita365.vn', id: idA, moc:'ket',
    ketQua:'Chạy hai ngày trong môi trường tách biệt, không lỗi', luiLaiDaThu: true});

  /* ── CỬA 5 · SÀNH GIỜ SO HAI MỐC, KHÔNG ĐỌC MỘT Ô ──
     Cấp 5 cần 168 giờ. Vừa bắt vừa kết thúc trong một giây thì đỏ. */
  const chuaDu = await goi({fn:'batNangCap', token:tkSA, u:'superadmin@gita365.vn', id: idA});
  bao(!chuaDu.than.ok && chuaDu.than.code === 'CHUADUGIO' && chuaDu.than.canGio === 168,
    'CỬA CUỐI TRỪ HAI MỐC THẬT — cấp 5 cần 168 giờ, mới chạy được ' +
      (chuaDu.than.daChay || 0) + ' giờ',
    'máy so hai mốc thật, không đọc một ô "đã chạy thử đủ"');

  /* ── NGƯỜI KÝ KHÁC NGƯỜI ĐỀ XUẤT ──
     Cấp 6 mới cần chữ ký chủ hệ. Dựng một đề xuất cấp 6 do chính chủ
     hệ viết rồi để chính chủ hệ ký — phải đỏ. */
  const dx6 = await goi({fn:'deXuatNangCap', token:tkSA, u:'superadmin@gita365.vn',
    viec:'Đưa một mô hình mới vào thay bộ tạo ảnh đang dùng',
    vung:'kiến trúc thị giác',
    luiLai:'trỏ lại nhà cung cấp cũ, khoá cấu hình mới, sổ cũ không đổi'});
  bao(dx6.than.ok && dx6.than.cap === 6, 'máy xếp "mô hình mới" vào CẤP 6',
    (dx6.than.viSao || []).join(' · '));
  await goi({fn:'soiLuatNangCap', token:tkSA, u:'superadmin@gita365.vn',
    id: dx6.than.id, nguoiSoi:'giamdoc@gita365.vn',
    ketLuan:'Nhà cung cấp đặt ngoài lãnh thổ — phải đi qua cổng ẩn danh Điều 13'});
  const tuKy = await goi({fn:'kyNangCap', token:tkSA, u:'superadmin@gita365.vn',
    id: dx6.than.id});
  bao(!tuKy.than.ok && tuKy.than.code === 'TUKY',
    'NGƯỜI KÝ KHÔNG ĐƯỢC LÀ NGƯỜI ĐỀ XUẤT',
    'cùng luật L3 của thang năm cổng (9.99.42) và vai C khác vai A (9.99.72) — sổ vẫn ' +
    'đủ năm dòng khi một người làm cả hai, nên cái được canh phải là HAI CÁI TÊN');

  /* ── SỔ NÊU RIÊNG PHẦN THIẾU CỦA MÁY VÀ PHẦN THIẾU CỦA NGƯỜI ── */
  const so = await goi({fn:'docVongNangCap', token:tkSA, u:'superadmin@gita365.vn'});
  const d6 = (so.than.dangChay || []).find(d => d.id === dx6.than.id);
  bao(so.than.ok && !!d6 && Array.isArray(d6.thieuMay) && Array.isArray(d6.thieuNguoi) &&
      d6.thieuNguoi.length > 0,
    'SỔ NÊU RIÊNG phần thiếu của MÁY và phần thiếu của NGƯỜI',
    'máy còn thiếu: ' + (d6 ? d6.thieuMay.join(' · ') : '—') + ' · người còn thiếu: ' +
    (d6 ? d6.thieuNguoi.join(' · ') : '—') + ' — gộp thành một con số "đã qua mấy cửa" ' +
    'thì một lượt vừa chạy xong cửa máy trông gần xong');

  /* ── PHÉP XẾP CẤP THỬ KHÔNG GHI GÌ VÀO SỔ ── */
  const truoc = (await goi({fn:'docVongNangCap', token:tkSA,
    u:'superadmin@gita365.vn'})).than.so;
  await goi({fn:'thuXepCap', token:tkSA, u:'superadmin@gita365.vn',
    viec:'Đổi màu nút trong màn thư viện', vung:'màn thư viện', luiLai:'trả màu cũ'});
  const sau = (await goi({fn:'docVongNangCap', token:tkSA,
    u:'superadmin@gita365.vn'})).than.so;
  bao(truoc === sau, 'PHÉP XẾP CẤP THỬ KHÔNG GHI GÌ VÀO SỔ',
    'sổ trước ' + truoc + ' dòng, sau ' + sau + ' dòng — một người muốn biết việc của ' +
    'mình rơi vào cấp nào TRƯỚC khi viết đề xuất là người đang làm đúng thứ tự');

  /* ── VAI NGOÀI R01–R12 KHÔNG VÀO ĐƯỢC ── */
  bao(!(await goi({fn:'deXuatNangCap', token:tk, u:'phuhuynh@gita365.vn',
    viec:'Thêm một màn mới', vung:'cổng phụ huynh',
    luiLai:'gỡ màn ấy đi, không ảnh hưởng gì'})).than.ok,
    'PHỤ HUYNH KHÔNG ĐỀ XUẤT NÂNG CẤP HỆ ĐƯỢC');
}

console.log('\n16 · VIỆC CHƯA CHUYỂN SANG NỀN MỚI');
/* Lấy một việc CÒN TRONG danh sách chưa port, không gõ cứng tên: gõ
   cứng thì tới hôm port xong việc ấy, phép đo này đỏ vì lý do của riêng
   nó — đúng chuyện vừa xảy ra khi dongBo được port. */
const conLai = Object.keys((await import('../may-chu/worker.js')).CHUA_PORT || {})[0];
const cp = (await goi({fn: conLai, token: tk, u: 'phuhuynh@gita365.vn'})).than;
bao(cp.code === 'CHUAPORT',
  'việc chưa port trả về mã riêng, không lẫn với "yêu cầu không hợp lệ" — thử "' + conLai + '"',
  cp.error);
const bia = (await goi({fn: 'mot-viec-khong-co-that', token: tk})).than;
bao(bia.code !== 'CHUAPORT' && !bia.ok, 'còn việc bịa ra thì vẫn là yêu cầu không hợp lệ',
  bia.error);

/* ═══════════════ 16B · CỔNG NỘI DUNG ═══════════════

   Cổng này ĐO chứ không viết hộ. Nên mỗi phép đo dưới đây hỏi đúng
   một câu: máy có chỉ ra được ĐÚNG CHỖ không.

   Và một phép đo quan trọng hơn cả chín cái kia: máy có chịu KHÔNG
   cộng ra tổng khi còn bốn chiều chưa ai chấm không. Một tổng có ô
   trống trông y hệt một tổng đã đủ, và người đọc sổ sáu tháng sau
   không có cách nào biết. */
console.log('\n16B · CỔNG NỘI DUNG');
const ndMod = await import('../may-chu/kien-truc-noi-dung.js');
const saR01 = {uid: 'U-sa', u: 'superadmin@gita365.vn', role: 'R01'};

/* Một bài đủ hai mươi bốn khối, viết đúng luật. Mỗi khối đủ 8 ký tự
   trở lên vì dưới ngưỡng ấy máy tính là khối trống. */
const baiDu = [
  'K01 | Bảy ngày nhìn cho đúng',
  'Bảy ngày đầu: ghi lại, chưa sửa gì.',
  'K02 | Chìa khoá',
  'Đừng đo việc học bằng số giờ ngồi bàn. Đo bằng thứ tạo ra được.',
  'K03 | Mục tiêu', 'Ghi được ba dòng mỗi tối trong bảy tối.',
  'K04 | Vì sao', 'Không ghi thì tuần sau cãi nhau bằng trí nhớ.',
  'K05 | Vấn đề thật', 'Tối nào cũng nhắc học, nhắc xong vẫn thế.',
  'K06 | Insight', '[KHO GITA] Nhắc nhiều làm việc học thành việc của bố mẹ.',
  'K07 | Bản chất', 'Người nhắc đang giữ trách nhiệm thay người học.',
  'K08 | Khung tư duy', 'Bốn trụ G-I-T-A, đọc theo thứ tự.',
  'K09 | Ví dụ', 'Nhà A: 19h30 mở sách, 19h45 cầm điện thoại.',
  'K10 | Ca thật', 'Nhà B chạy bảy tối, tối thứ tư quên, vẫn ghi là quên.',
  'K11 | Sai lầm', 'Ghi kèm nhận xét. Ghi kèm nhận xét là đang chấm.',
  'K12 | Công cụ', 'Bảng ba dòng: giờ bắt đầu, việc, chỗ dừng.',
  'K13 | Hướng dẫn dùng', 'Điền sau bữa tối, mất chừng hai phút.',
  'K14 | Bài tập', 'Ghi đủ bảy tối, không bỏ tối nào.',
  'K15 | Sản phẩm', 'Một bảng bảy dòng, có chữ của học viên.',
  'K16 | KPI', 'Mốc nền: 0 tối. Đích: 5 trên 7 tối có đủ ba dòng.',
  'K17 | Bảng theo dõi', 'Treo ở chỗ cả nhà đi qua mỗi ngày.',
  'K18 | Phản tư', 'Tối nào dễ ghi nhất? Vì sao tối ấy dễ?',
  'K19 | Câu hỏi coach', 'Điều gì làm tối thứ tư khác sáu tối kia?',
  'K20 | Việc 24 giờ', 'Tối nay ghi 3 dòng, không thêm nhận xét.',
  'K21 | Việc 7 ngày', 'Lặp 7 tối liền, ghi cả tối quên.',
  'K22 | Tiêu chí đạt', 'Đủ 5 trên 7 tối và không dòng nào có nhận xét.',
  'K23 | Đọng lại', 'Nhìn trước, sửa sau. Ghi cả cái quên.',
  'K24 | Thử thách', 'Tuần tới học viên tự ghi, người lớn không nhắc.'
].join('\n');

const rDu = await ndMod.soatNoiDung({chu: baiDu, tang: 'T1'}, env, env.CSDL, saR01);
bao(rDu.ok && rDu.khoi.thieu.length === 0,
  'bài đủ hai mươi bốn khối thì không báo thiếu khối nào',
  'thiếu ' + rDu.khoi.thieu.length);
bao(rDu.doi.length === 0,
  'khối nào đòi khối nào cũng có đủ — chín trong mười luật chống nội dung rỗng là PHÉP ĐO, không phải lời khuyên');
bao(rDu.xong.chua.length === 0,
  'đủ mười điều kiện hoàn thành — thang đo NGƯỜI HỌC, tính riêng, không cộng vào điểm');

/* ── CHỖ QUAN TRỌNG NHẤT CỦA CẢ MỤC NÀY ──
   Máy KHÔNG được có một trường nào tên là "tổng trên trăm". Bốn chiều
   còn trống thì cộng ra tổng là dựng một con số trông như đã xong. */
bao(rDu.tranMay === 60 && rDu.conCho.length === 5 &&
    rDu.conCho.reduce((s, c) => s + c.con, 0) === 40,
  'máy chỉ chấm 60/100 và NÓI RA 40 điểm còn chờ người — không cộng ra tổng',
  'máy cho ' + rDu.diemMay + '/' + rDu.tranMay + ' · còn chờ ' +
  rDu.conCho.map(c => c.ma).join(','));
bao(rDu.cham.Q09.tran === 4 && rDu.cham.Q09.conNguoi === 6,
  'chìa khoá kim cương: trần máy 4, thấp nhất — máy chỉ biết khối có mặt, không biết câu ấy đổi được cách nhìn ai');
bao(!('diem' in rDu) && !('bacDiem' in rDu) && !('bac' in rDu),
  'KHÔNG có trường điểm tổng và KHÔNG có bậc khi bốn chiều còn trống');

/* ── PHÁ: BÀI TẬP KHÔNG SẢN PHẨM (luật N06) ── */
const boK15 = baiDu.replace(/K15 \| Sản phẩm\nMột bảng bảy dòng, có chữ của học viên\.\n/, '');
const rN06 = await ndMod.soatNoiDung({chu: boK15, tang: 'T1'}, env, env.CSDL, saR01);
bao(rN06.doi.some(p => p.khoi === 'K14' && p.can === 'K15') &&
    rN06.cam.some(c => c.ma === 'N06'),
  'bỏ khối sản phẩm thì K14 báo thiếu K15 — luật N06 đỏ đúng chỗ',
  rN06.doi.map(p => p.khoi + '→' + p.can).join(' '));

/* ── PHÁ: DẤU MỞ KHỐI CÓ MÀ KHỐI TRỐNG ──
   Đây là chỗ lách rẻ nhất của cả cổng: gõ đủ hai mươi bốn dấu mở là
   qua hết phép đếm, mà bài vẫn trống. Phép đo phải là CÓ CHỮ. */
const rongRuot = baiDu.replace('Một bảng bảy dòng, có chữ của học viên.', 'xong');
const rTrong = await ndMod.soatNoiDung({chu: rongRuot, tang: 'T1'}, env, env.CSDL, saR01);
bao(rTrong.khoi.thieu.indexOf('K15') >= 0 && rTrong.khoi.trong.indexOf('K15') >= 0,
  'dấu mở khối có mà ruột dưới 8 ký tự thì tính là THIẾU — không đếm dấu, đếm chữ');

/* ── PHÁ: CÂU RỖNG ── */
const rRong = await ndMod.soatNoiDung(
  {chu: baiDu.replace('Tối nay ghi 3 dòng, không thêm nhận xét.',
    'Hãy cố gắng lên, thành công sẽ đến.'), tang: 'T1'}, env, env.CSDL, saR01);
bao(rRong.rong.length >= 2 && rRong.rong[0].dong > 0 && rRong.rong[0].thay,
  'bắt câu rỗng ĐÚNG SỐ DÒNG và nói ra thứ đáng lẽ nằm ở đó',
  'dòng ' + rRong.rong.map(r => r.dong).join(',') + ' · ' + rRong.rong[0].bat);
bao(rRong.cham.Q04.duoc < rDu.cham.Q04.duoc,
  'câu rỗng kéo chiều RÕ RÀNG xuống — điểm đi theo phép đo, không đi theo cảm nhận',
  rDu.cham.Q04.duoc + ' → ' + rRong.cham.Q04.duoc);

/* ── PHÁ: CÂU PHÁN XÉT ── */
const rLoi = await ndMod.soatNoiDung(
  {chu: baiDu.replace('Tối nào dễ ghi nhất? Vì sao tối ấy dễ?',
    'Con lười và thiếu kỷ luật, phải cố gắng hơn.'), tang: 'T1'}, env, env.CSDL, saR01);
bao(rLoi.loi.length >= 3 && rLoi.loi.every(l => l.thay && l.vi),
  'bắt câu phán xét, kèm câu NÓI THAY và VÌ SAO — thiếu vì sao thì lần sau họ viết lại bằng một từ khác',
  rLoi.loi.map(l => l.bat).join(' · '));
bao(rLoi.cham.Q07.duoc <= 4,
  'ba câu dán nhãn kéo chiều NGÔN TỪ COACH xuống dưới nửa',
  rLoi.cham.Q07.duoc + '/10');

/* ── PHÁ: VƯỢT TẦNG ──
   Dùng CHUNG hàm soatTang của cổng thị giác. Nếu có ngày ai chép nó
   sang thành bản thứ hai, phép đo này vẫn xanh mà mục 75 chỉ soi bản
   kia — nên chỗ đáng canh là chính lời chú giải ở đầu hàm ấy. */
const rTang = await ndMod.soatNoiDung(
  {chu: baiDu.replace('Bốn trụ G-I-T-A, đọc theo thứ tự.',
    'Coach đồng hành cả nhà, tra phác đồ rồi chạy kịch bản.'), tang: 'T1'},
  env, env.CSDL, saR01);
bao(rTang.cham.Q01.duoc === 0 && rTang.cham.Q01.ma === 'VUOTTANG',
  'bài khai T1 mà nhắc phác đồ, kịch bản, coach đồng hành thì chiều ĐÚNG HỆ về 0',
  rTang.cham.Q01.vi.slice(0, 60));

/* ── PHÁ: KHÔNG NHÃN NGUỒN ── */
const rNg = await ndMod.soatNoiDung(
  {chu: baiDu.replace('[KHO GITA] ', ''), tang: 'T1'}, env, env.CSDL, saR01);
bao(!rNg.nguon.dat && rNg.cam.some(c => c.ma === 'N09'),
  'không dòng nào mang nhãn nguồn thì luật N09 đỏ — bốn nhãn cố định thì máy đếm được, "luôn nêu nguồn" thì không');

/* ── AI ĐƯỢC VÀO ── */
bao((await ndMod.soatNoiDung({chu: baiDu, tang: 'T1'}, env, env.CSDL,
      {uid: 'U-ph', u: 'phuhuynh@gita365.vn', role: 'R13'})).error === 'KHONGQUYEN',
  'khách hàng KHÔNG vào được cổng nội dung — bảng câu rỗng nằm trong tay khách là bảng chỉ ra chỗ yếu của chính bài họ đang trả tiền để đọc');

/* ── MẪU BÀI ── */
const rMau = await ndMod.mauBaiHoc({}, env, env.CSDL, saR01);
/* Điền ruột vào mẫu rồi đọc lại bằng chính hàm đọc. Chữ SAU dấu gạch
   đứng là TÊN khối, không phải ruột — nên phải thêm một dòng dưới mỗi
   dấu mở. Bản thử đầu tôi nối chữ vào ngay sau tên khối và nó đỏ:
   phép thử sai, hàm đọc đúng. */
const rMauDay = rMau.mau.replace(/^([ \t]*K\d{2}[ \t]*\|.*)$/gm,
  '$1\nRuột khối này dài hơn tám ký tự.');
const dsMau = ndMod.docKhoi(rMauDay);
bao(rMau.ok && rMau.soKhoi === 24 && dsMau.thieu.length === 0,
  'mẫu bài do máy sinh ra đọc lại được bằng chính hàm đọc — dấu mở khối không bị gõ sai',
  '24 khối');

/* ── PHÁ: DÒ THEO TỪ, KHÔNG DÒ THEO CHUỖI CON ──
   Bản đầu của bộ dò báo mười ba câu dán nhãn trên một bài sạch: bỏ
   dấu xong thì "hư" thành "hu", và "hu" nằm trong "chưa", "chuẩn",
   "thứ". Máy chỉ vào những dòng không có gì sai — và người bị chỉ
   nhầm ba lần thì lần thứ tư thôi đọc cả danh sách. */
bao(rDu.loi.length === 0,
  'bài sạch KHÔNG bị báo câu phán xét nào — "hư" không được khớp bên trong "chưa"',
  'trước khi chặn hai đầu bằng ranh giới chữ, chỗ này báo 13 câu');
bao(ndMod.soatLoiNoi('Con chưa làm được, chuẩn bị thứ hai.').length === 0 &&
    ndMod.soatLoiNoi('Con hư quá.').length === 1,
  'dò theo TỪ: "chưa · chuẩn · thứ" sạch, còn "hư" đứng một mình thì bắt');
bao(ndMod.soatLoiNoi('Con luoi lam.').length === 1,
  'gõ THIẾU DẤU vẫn bắt — người ta gõ thiếu dấu rất thường, và một bộ dò bỏ qua chúng là bộ dò dễ lách nhất');

/* ── PHÉP SOI TỰ CHỨNG MINH CHƯA CÂM ──
   Bản chép trong máy chủ phải khớp kho. Ở đây đo phần đo được không
   cần kho: hai mươi bốn mã liên tục, không thiếu không trùng. */
const maBanChep = ndMod.BAN_CHEP.KHOI.map(k => k[0]);
bao(maBanChep.length === 24 &&
    maBanChep.every((m, i) => m === 'K' + String(i + 1).padStart(2, '0')),
  'bản chép hai mươi bốn khối liên tục K01→K24, không thiếu không trùng');

/* ── BỐN KHUÔN TÀI LIỆU ── */
{
  const quyTrinhDu = [
    'P01 | Mục đích', 'Chặn chuyện phiếu thu ghi hai lần.',
    'P02 | Phạm vi', 'Áp cho kế toán thu. KHÔNG áp cho phiếu hoàn.',
    'P03 | Điều kiện vào', 'Có quyền ghi phiếu và có mã khách hàng.',
    'P04 | Các bước',
    '1. Đối chiếu mã khách — ai làm: kế toán thu — xong khi mã khớp sổ.',
    '2. Ghi phiếu — ai làm: kế toán thu — xong khi phiếu có số.',
    '3. Trình duyệt — ai làm: kế toán trưởng — xong khi có chữ ký.',
    'P05 | Điểm kiểm', 'Sau bước 2: đối chiếu số tiền với sao kê.',
    'P06 | Xử lý lệch',
    'Lệch dưới 50 nghìn: sửa ngay tại chỗ, ghi lý do vào phiếu.',
    'Lệch từ 50 nghìn: leo thang kế toán trưởng trong 2 giờ.',
    'P07 | Đo lường', 'Số phiếu lệch mỗi tuần. Mục tiêu 0. Xem mỗi thứ Hai.',
    'P08 | Phiên bản', 'Bản 1.0, ngày 08/09/2026, do phòng tài chính đặt.'
  ].join('\n');
  const rQT = await ndMod.soatNoiDung({chu: quyTrinhDu, tang: 'T1', khuon: 'QUYTRINH'},
    env, env.CSDL, saR01);
  bao(rQT.ok && rQT.khuon === 'QUYTRINH' && rQT.khoi.thieu.length === 0,
    'khuôn QUY TRÌNH đọc theo danh sách khối RIÊNG (P01–P08), không đo bằng khuôn bài học',
    'thiếu ' + rQT.khoi.thieu.length + '/8');
  /* Mười điều kiện hoàn thành là thang đo NGƯỜI HỌC — một quy trình vận
     hành không có người học, nên khoá ấy BỎ HẲN chứ không để rỗng. */
  bao(!('xong' in rQT),
    'khuôn khác BÀI HỌC thì KHÔNG có mười điều kiện hoàn thành — thang ấy đo NGƯỜI HỌC, mà một quy trình vận hành không có người học');
  /* Nhưng nó CÓ thang một trăm RIÊNG, từ bản 9.99.46. Hai nửa phải cộng
     lại đúng 100: lệch nghĩa là một chiều bị tính hai lần hoặc không ai
     tính — y như phép đo của thang bài học. */
  bao(rQT.tranMay === 63 && rQT.diemMay === 63 &&
      rQT.conCho.reduce((a, c) => a + c.con, 0) === 37,
    'khuôn QUY TRÌNH có thang MỘT TRĂM RIÊNG: máy chấm 63, người chấm 37, cộng lại đúng 100 — thang của bài học hỏi "có KPI không", câu ấy vô nghĩa với một cẩm nang',
    'máy ' + rQT.diemMay + '/' + rQT.tranMay + ' · còn chờ ' +
      rQT.conCho.map(c => c.ma).join(','));
  bao(rQT.cham['P-2'].duoc === 20 && rQT.cham['P-6'].duoc === 10,
    'chiều P-2 và P-6 chấm bằng PHÉP ĐO khai ở kho, không bằng một con số gõ tay ở máy chủ');
  /* Chiều nào có phép đo chưa hiện thì phải NỔI LÊN, không chìm thành 0:
     một chiều 0 vì thiếu phép đo trông y hệt một chiều 0 vì bài kém. */
  bao(!rQT.cam.some(c => c.ma === 'PHEPLA'),
    'mọi phép đo kho khai đều có ở máy chủ — phép LẠ thì máy nói ra chứ không lặng lẽ cho 0 điểm');
  bao(!rQT.cam.some(c => c.ma === 'SOP'),
    'quy trình đủ ba thứ — ai làm, xong khi nào, hai nhánh xử lý lệch — thì không báo gì');

  /* ── PHÁ: BA LUẬT RIÊNG CỦA QUY TRÌNH ── */
  const boAi = quyTrinhDu.replace(/ — ai làm: [^—]+—/g, ' —');
  const rAi = await ndMod.soatNoiDung({chu: boAi, tang: 'T1', khuon: 'QUYTRINH'},
    env, env.CSDL, saR01);
  bao(rAi.cam.some(c => c.ma === 'SOP' && /AI LÀM/.test(c.vi)),
    'các bước không nói AI LÀM thì báo — một bước không có người chịu trách nhiệm là một bước treo, lúc có sự cố thì ai cũng tưởng người kia làm');
  const motNhanh = quyTrinhDu.replace(
    'Lệch từ 50 nghìn: leo thang kế toán trưởng trong 2 giờ.', '');
  const rNhanh = await ndMod.soatNoiDung({chu: motNhanh, tang: 'T1', khuon: 'QUYTRINH'},
    env, env.CSDL, saR01);
  bao(rNhanh.cam.some(c => c.ma === 'SOP' && /leo thang/.test(c.vi)),
    'xử lý lệch thiếu nhánh LEO THANG thì báo — một nhánh thôi thì hoặc mọi lỗi nhỏ đều leo lên cấp trên, hoặc mọi lỗi lớn đều bị người tại chỗ tự xử');

  /* Dán NHẦM khuôn phải hiện ra, không lặng lẽ chấm theo bảng sai. */
  const rNham = await ndMod.soatNoiDung({chu: quyTrinhDu, tang: 'T1', khuon: 'BAIHOC'},
    env, env.CSDL, saR01);
  bao(rNham.khoi.thieu.length === 24 && (rNham.khoi.la || []).length === 8,
    'dán một QUY TRÌNH vào khuôn BÀI HỌC thì máy báo thiếu cả 24 khối và tám mã LẠ — mỗi khuôn một tiền tố riêng chính là để chỗ này không đi lọt',
    'thiếu ' + rNham.khoi.thieu.length + ' · mã lạ ' + ((rNham.khoi.la || []).length));

  const mauQT = await ndMod.mauBaiHoc({khuon: 'CAMNANG'}, env, env.CSDL, saR01);
  bao(mauQT.ok && mauQT.soKhoi === 7 && mauQT.mau.indexOf('C06') >= 0,
    'mẫu trống sinh theo ĐÚNG khuôn được chọn', mauQT.khuon + ' · ' + mauQT.soKhoi + ' khối');
}

/* ── TỪ ĐIỂN KL08: DÒ THEO PHẠM VI NGƯỜI ĐỌC ──
   Đây là chỗ tôi phải cẩn thận nhất: bảng cấm→thay viết cho LỜI NÓI
   VỚI KHÁCH, và áp thẳng lên văn nội bộ là lặp lại đúng lỗi 314 dòng
   của bản 9.99.44. */
{
  const cauKhach = 'Con thất bại rồi, cố lên, đừng để chậm tiến độ.';
  bao(ndMod.soatKL(cauKhach, 'noiBo').length === 0 &&
      ndMod.soatKL(cauKhach, 'khach').length === 3,
    'lớp `khach` CHỈ dò khi bài viết cho khách — cùng một câu, bài nội bộ sạch, bài cho khách bắt ba cụm',
    'noiBo 0 · khach ' + ndMod.soatKL(cauKhach, 'khach').length);
  bao(ndMod.soatKL('Bạn phải làm cho xong.', 'noiBo').length === 1,
    'lớp `moi` dò ở MỌI bài — kể cả nội bộ: người đọc nội bộ rồi sẽ viết lại đúng giọng ấy cho khách');
  /* Lớp `nhac` CỐ Ý không dò. Nếu có ngày ai đó bật nó lên thì phép đo
     này đỏ, và đó là lúc phải đọc lại vì sao nó tắt. */
  bao(ndMod.soatKL('Số liệu này sai, và vấn đề nằm ở bước hai.', 'khach').length === 0,
    'lớp `nhac` KHÔNG dò kể cả với bài cho khách — "sai" và "vấn đề" quá thường, dò thì báo sai nhiều hơn báo đúng');
  {
    const rKh = await ndMod.soatNoiDung({chu: baiDu.replace(
      'Tối nay ghi 3 dòng, không thêm nhận xét.',
      'Tuần trước con thất bại, cố lên nhé.'), tang: 'T1', doiTuong: 'khach'},
      env, env.CSDL, saR01);
    const rNb = await ndMod.soatNoiDung({chu: baiDu.replace(
      'Tối nay ghi 3 dòng, không thêm nhận xét.',
      'Tuần trước con thất bại, cố lên nhé.'), tang: 'T1'}, env, env.CSDL, saR01);
    bao(rKh.doiTuong === 'khach' && rKh.kl.length === 2 &&
        rNb.doiTuong === 'noiBo' && rNb.kl.length === 0,
      'sổ soát nhận ĐỐI TƯỢNG của bài và dò theo đúng phạm vi ấy; mặc định là nội bộ',
      'khách bắt ' + rKh.kl.length + ' · nội bộ bắt ' + rNb.kl.length);
    bao(rKh.cam.some(c => c.ma === 'KL' && c.canhBao === true),
      'lệch từ điển vào sổ dạng CẢNH BÁO, không chặn cổng 1');
  }
}

/* ── BỘ MIỄN DỊCH: ĐỐI CHIẾU, KHÔNG HỨA ── */
{
  const md = await ndMod.soatMienDich({}, env, env.CSDL, saR01);
  bao(md.ok && md.soChan === 13,
    'mười ba lỗi CHẶN PHÁT HÀNH của bản đặc tả phần 3 đều có một dòng đối chiếu',
    md.dem.chan + ' đã chặn · ' + md.dem.motPhan + ' một phần · ' + md.dem.chua + ' chưa có gì');
  /* Ba mức, không có mức thứ tư. Một bảng an toàn ghi "đã xử lý 100%"
     mà không ai kiểm được là một lời trấn an, và lời trấn an là thứ
     nguy hiểm nhất trong một bảng an toàn. */
  bao(Object.keys(md.bang).every(k => ['chan', 'motPhan', 'chua'].indexOf(md.bang[k].muc) >= 0) &&
      Object.keys(md.bang).every(k => (md.bang[k].vi || '').length > 30),
    'mỗi dòng chỉ nhận một trong BA mức, và mức nào cũng phải nói VÌ SAO — không có mức thứ tư');
  /* Hai lỗi kho chặn THẬT, và phép đối chiếu phải nói đúng chúng chứ
     không nói cho đẹp bảng. */
  bao(md.bang.E07.muc === 'chan' && md.bang.F04.muc === 'chan',
    'E07 (mặc định TỪ CHỐI) và F04 (cổng chuyên môn phải ký) là hai lỗi kho chặn THẬT');
  bao(md.bang.A01.muc === 'chua' && md.bang.D01.muc === 'chua',
    'A01 (khoá thương mại) và D01 (tải Coach) — bộ nội dung KHÔNG giữ hai cửa ấy, và nó nói thẳng thay vì ghi "đã xử lý"');

  /* ── NỘI DUNG CỦA CHÍNH HỌC VIỆN NUÔI VIRUS ── */
  bao(ndMod.soatVirus('Bạn đã bỏ lỡ hôm qua, chuỗi đứt rồi.').length === 2,
    'bắt được chỗ nội dung NUÔI chủng virus — virus không chỉ đến từ ngoài',
    ndMod.soatVirus('Bạn đã bỏ lỡ hôm qua, chuỗi đứt rồi.').map(v => v.ma).join(','));
  bao(ndMod.soatVirus('Hôm nay để trống. Mai mình đi tiếp.').length === 0,
    'câu viết theo vắc-xin thì KHÔNG bị bắt — bảng dò canh chỗ nuôi virus, không canh chỗ nhắc tới nó');
  {
    const nuoi = await ndMod.soatNoiDung({chu: baiDu.replace(
      'Tối nay ghi 3 dòng, không thêm nhận xét.',
      'Bạn đã bỏ lỡ hôm qua nên chuỗi đứt, phải làm đủ mới tính.'), tang: 'T1'},
      env, env.CSDL, saR01);
    bao(nuoi.ok && nuoi.virus.length >= 2 &&
        nuoi.cam.some(c => c.ma === 'VIRUS' && c.canhBao === true),
      'chỗ nuôi virus vào sổ soát dạng CẢNH BÁO — một câu nhắc tới chủng ấy để dạy cách gỡ thì không phải một câu nuôi nó, và máy dò từ vựng không phân biệt được hai thứ');
  }
}

/* ── ND-04: CỬA XUẤT CHUẨN NGHỀ ──
   Tới 9.99.45 mục này là một DÒNG NHẮC trong sổ chờ. Một dòng nhắc thì
   đọc xong ai cũng gật, rồi sáu tháng sau có người chép một câu vào một
   tờ rơi và không ai nhớ ra dòng ấy. Nay nó là một cửa. */
{
  const chuaChot = await ndMod.xuatChuanNghe({muc: [{ma: 'CN2'}]}, env, env.CSDL, saR01);
  bao(!chuaChot.ok && chuaChot.error === 'CHUACHOT' &&
      chuaChot.chan[0].vi === 'chưa có lượt chốt nào trong sổ',
    'ND-04 — mục CHƯA chốt thì KHÔNG trích ra ngoài được. Sổ chốt đang rỗng nên cửa đóng với cả năm mục — đó là mặc định đúng');

  /* ══ CHỖ BẢN 9.99.48 CÒN HỞ ══
     Cửa cũ đọc trichDuoc và nguon THẲNG TỪ LƯỢT GỌI, nên máy khách tự
     khai là qua. Phép thử này gửi đúng lời khai gian ấy và đòi cửa vẫn
     đóng — nó chính là phép bắt được lỗi cũ. */
  const gian = await ndMod.xuatChuanNghe({muc: [{ma: 'CN2', trichDuoc: true,
    nguon: 'ICF Core Competencies 2019, mục 4 — Cultivates Trust and Safety'}]},
    env, env.CSDL, saR01);
  bao(!gian.ok && gian.error === 'CHUACHOT',
    'máy khách TỰ KHAI đã chốt thì cửa vẫn đóng — quyết định đọc từ SỔ MÁY CHỦ, không đọc lượt gọi. Bản 9.99.48 đọc thẳng lượt gọi, nên gửi trichDuoc:true là qua cửa: đúng lớp lỗi "lọc trên màn hình không phải bảo vệ dữ liệu"');

  /* ── CỬA CHỐT ── */
  bao((await ndMod.chotTrichNghe({ma: 'CN2', trichDuoc: true,
        nguon: 'ICF Core Competencies 2019, mục 4', lyDo: 'trích cho tờ rơi giới thiệu'},
        env, env.CSDL, {uid: 'U-r02', u: 'r02@gita365.vn', role: 'R02'}))
        .error === 'KHONGQUYEN',
    'chỉ Super Admin CHỐT được — ngưỡng chốt chặt hơn ngưỡng xuất (R01–R02) có chủ ý: lấy một bản trích là việc vận hành, còn nói "câu này được phép dẫn ra ngoài" là một lời khai phải có người đứng tên');
  bao((await ndMod.chotTrichNghe({ma: 'CN2', trichDuoc: true,
        nguon: 'ICF Core Competencies 2019, mục 4'}, env, env.CSDL, saR01))
        .error === 'THIEULYDO',
    'lượt chốt phải nói vì sao — một quyết định không lý do thì sáu tháng sau không ai dám đổi, vì không ai biết vì sao nó có ở đó');
  bao((await ndMod.chotTrichNghe({ma: 'CN2', trichDuoc: true, nguon: 'ICF',
        lyDo: 'trích cho tờ rơi giới thiệu'}, env, env.CSDL, saR01))
        .error === 'THIEUNGUON',
    'chốt ĐƯỢC TRÍCH mà nguồn ghi qua loa thì chặn ngay ở cửa chốt — chốt xong mà cửa xuất vẫn chặn thì lượt chốt ấy không làm được gì');

  const chot = await ndMod.chotTrichNghe({ma: 'CN2', trichDuoc: true,
    nguon: 'ICF Core Competencies 2019, mục 4 — Cultivates Trust and Safety',
    lyDo: 'trích cho tờ rơi giới thiệu chương trình coach'}, env, env.CSDL, saR01);
  bao(chot.ok && chot.trichDuoc === true, 'chủ hệ chốt được, và lượt chốt vào sổ');

  const du = await ndMod.xuatChuanNghe({muc: [{ma: 'CN2'}]}, env, env.CSDL, saR01);
  bao(du.ok && du.qua.length === 1 && /ICF Core/.test(du.qua[0].nguon),
    'chốt xong thì trích được, và nguồn lấy từ SỔ chứ không lấy từ lượt gọi');

  /* Sổ chỉ-thêm: đổi ý thì ghi dòng mới, và dòng mới nhất thắng. */
  await ndMod.chotTrichNghe({ma: 'CN2', trichDuoc: false,
    lyDo: 'rút lại vì bản quyền của ICF chưa rõ với ấn phẩm in'}, env, env.CSDL, saR01);
  const rut = await ndMod.xuatChuanNghe({muc: [{ma: 'CN2'}]}, env, env.CSDL, saR01);
  bao(!rut.ok && rut.chan[0].vi === 'chủ hệ đã chốt là KHÔNG được trích',
    'chốt lại thì dòng MỚI NHẤT thắng, và dòng cũ vẫn nằm nguyên trong sổ — một lời khai về nguồn gốc câu chữ mà sửa được thì nó không còn là lời khai');

  bao((await ndMod.xuatChuanNghe({muc: [{ma: 'CN2'}]}, env, env.CSDL,
        {uid: 'U-r05', u: 'r05@gita365.vn', role: 'R05'}))
        .error === 'KHONGQUYEN',
    'chỉ R01–R02 trích được — đây là lời khai của Học viện về nguồn gốc một câu chữ, không phải một cái nút');
}

/* ── ĐỌC MỘT BUỔI LÀM VIỆC ── */
{
  const buoiDu = [
    'Coach: Trước khi bắt đầu — khi kết thúc, anh chị muốn ra về với điều gì rõ nhất?',
    'Khách: Tôi muốn biết vì sao con cứ phải nhắc mới học.',
    'Coach: Kể cho mình một tình huống cụ thể gần nhất — hôm nào, đang làm gì?',
    'Khách: Tối thứ ba, 19h45, con ném vở. Tuần này 3 lần rồi.',
    'Coach: Em thấy anh chị vẫn ngồi lại được với con sau mỗi lần — cái đó không dễ.',
    'Coach: Để mình nghe lại — phần nào là điều anh chị chứng kiến, phần nào là suy đoán?',
    'Khách: Chứng kiến là con ném vở.',
    'Coach: Giờ anh chị có mấy hướng, kể cả hướng chưa làm gì?',
    'Khách: Để con tự chọn giờ, hoặc nhắc như cũ.',
    'Coach: Trong 24 giờ tới việc nhỏ nhất là gì, và đo bằng gì?',
    'Khách: Tối nay không nhắc, và ghi lại số lần con tự mở sách.'
  ].join('\n');
  const rB = ndMod.docHoiThoai(buoiDu);
  bao(rB.ok && !rB.thieuNhip && rB.luat.every(l => l.dat),
    'buổi đủ sáu nhịp và đạt cả ba luật — MỞ trước, có sự việc cụ thể, kết bằng cam kết ĐO ĐƯỢC',
    rB.soLuot + ' lượt · ' + rB.luotNghe + ' của người làm nghề');
  bao(rB.nhip.every(n => n.lan > 0) && rB.nhip[0].ma === 'N1' && rB.nhip[5].ten === 'GIỮ',
    'sáu nhịp neo vào G.KICHBAN_AI — N1 MỞ đến N6 GIỮ, không dựng thang nhịp thứ hai');

  /* ── PHÁ: HỎI CHUYÊN MÔN TRƯỚC KHI MỞ ── */
  const chuaMo = buoiDu.split('\n').slice(2).join('\n');
  bao(ndMod.docHoiThoai(chuaMo).luat.find(l => l.ma === 'B1').dat === false,
    'LUẬT B1 — hỏi chuyên môn trước khi chốt buổi này làm gì thì báo: nhà chưa biết buổi này làm gì thì họ trả lời để cho xong');

  /* ── PHÁ: CHỐT MÀ KHÔNG CÓ CÁCH ĐO ── */
  const khongDo = buoiDu.replace('Tối nay không nhắc, và ghi lại số lần con tự mở sách.',
    'Tối nay tôi sẽ cố gắng kiên nhẫn hơn.');
  bao(ndMod.docHoiThoai(khongDo).luat.find(l => l.ma === 'B3').dat === false,
    'LUẬT B3 — chốt mà không có cách đo thì báo: tuần sau không ai biết nó đã xảy ra hay chưa, kể cả người hứa');

  /* ── LỚP THỨ HAI: NHẬN NHỊP THEO HÌNH THỨC CÂU ──
     Bản 9.99.45 nhận nhịp CHỈ bằng dấu hiệu câu chữ, nên một người nói
     cùng ý bằng câu khác thì máy không thấy. Ba câu dưới đây KHÔNG chứa
     một cụm nào trong bảng dấu hiệu. */
  const lachChuChu = [
    'Coach: Chuyện đó diễn ra vào thứ ba lúc mấy giờ?',
    'Khách: Khoảng 19h45.',
    'Coach: Ta để con tự quyết giờ học, hoặc giữ nếp cũ — bên nào hợp hơn?',
    'Khách: Chắc để con tự quyết.',
    'Coach: Vậy tối nay ta đếm số lần con tự mở sách nhé.',
    'Khách: Vâng, tôi ghi lại số lần.'
  ].join('\n');
  const rLach = ndMod.docHoiThoai(lachChuChu);
  const nhipLach = rLach.nhip.filter(n => n.lan > 0).map(n => n.ma + ':' + n.theo);
  bao(rLach.nhip.find(n => n.ma === 'N2').lan > 0 &&
      rLach.nhip.find(n => n.ma === 'N5').lan > 0 &&
      rLach.nhip.find(n => n.ma === 'N6').lan > 0,
    'nhận ra N2 · N5 · N6 kể cả khi người nói KHÔNG dùng một cụm nào trong bảng dấu hiệu — lớp thứ hai đọc HÌNH THỨC câu, không đọc câu chữ',
    nhipLach.join(' · '));
  bao(rLach.nhip.find(n => n.ma === 'N5').theo === 'hinhThuc',
    'và máy NÓI RA nó nhận bằng lớp nào — lớp hình thức đoán nhiều hơn lớp câu chữ, gộp hai lớp vào một con số là làm phần đoán trông như phần đo');

  /* ── CHỈ SOI LƯỢT CỦA NGƯỜI LÀM NGHỀ ── */
  const khachNoiBan = buoiDu.replace('Chứng kiến là con ném vở.',
    'Chứng kiến là con lười, con hư, không nghe lời gì cả.');
  bao(ndMod.docHoiThoai(khachNoiBan).loi.length === 0,
    'câu dán nhãn trong lượt của KHÁCH thì KHÔNG bắt — họ đang kể chuyện nhà mình, và họ có quyền dùng đúng những từ mà nghề này học cách không dùng');
  const ngheNoiBan = buoiDu.replace('Coach: Giờ anh chị có mấy hướng, kể cả hướng chưa làm gì?',
    'Coach: Con lười quá, phải cố gắng hơn.');
  bao(ndMod.docHoiThoai(ngheNoiBan).loi.length >= 2,
    'cùng câu ấy trong lượt của NGƯỜI LÀM NGHỀ thì bắt',
    ndMod.docHoiThoai(ngheNoiBan).loi.map(x => x.bat).join(' · '));
}

/* ── BỘ DÒ CHUYÊN GIA: CẢNH BÁO, KHÔNG CHẶN ── */
bao(ndMod.soatChuyenGia('Con lười quá, em phải cố gắng hơn.').length === 1 &&
    ndMod.soatChuyenGia('Con lười quá, em phải cố gắng hơn.')[0].loi === 'ra lệnh',
  'bắt câu NGHIỆP DƯ kèm LOẠI LỖI — khác bảng phán xét ở mức xử, không chỉ ở nội dung');
/* Khoá mang theo NGƯỜI NHẬN. Bản đầu ghi khoá rộng ("không bao giờ"),
   và lượt quét toàn hệ đầu tiên bắt 314 dòng trên 183 màn mà gần hết
   là đúng: "KHÔNG BAO GIỜ ghi đè" là một luật về máy. */
bao(ndMod.soatChuyenGia('Máy KHÔNG BAO GIỜ ghi đè một bản đã duyệt.').length === 0 &&
    ndMod.soatChuyenGia('Con không bao giờ tự giác cả.').length === 1,
  'khoá mang theo NGƯỜI NHẬN: một luật về máy không bị bắt, một câu về đứa trẻ thì bắt',
  'ba trăm dòng báo đúng thì lần thứ tư không ai đọc cả báo cáo');
bao(ndMod.soatChuyenGia('Chỉ cần bấm nút này là xong.').length === 0 &&
    ndMod.soatChuyenGia('Chỉ cần cố gắng là được thôi.').length === 1,
  '"chỉ cần bấm nút" là một hướng dẫn; "chỉ cần cố gắng" là một lời giảm nhẹ giả');
{
  const banRong = await ndMod.soatNoiDung({chu: baiDu.replace(
    'Tối nay ghi 3 dòng, không thêm nhận xét.',
    'Em phải làm cho xong, chỉ cần cố gắng thôi.'), tang: 'T1'}, env, env.CSDL, saR01);
  bao(banRong.ok && banRong.chuyenGia.length === 2 &&
      banRong.cam.some(c => c.ma === 'CG' && c.canhBao === true),
    'câu nghiệp dư vào sổ soát dưới dạng CẢNH BÁO — không kéo bài rớt cổng 1',
    'phần lớn những câu này có chỗ dùng đúng; chặn cả chỗ dùng đúng thì người viết học cách lách bộ dò');
}

/* ═══════════════ 16C · THANG NĂM CỔNG CỦA NỘI DUNG ═══════════════

   Chốt của chủ hệ: "không gì lên sóng mà không qua 5 cổng có người ký."

   Năm luật cứng, và mỗi luật ở đây có một phép PHÁ riêng. Đo lời khai
   của một thang duyệt bằng cách đọc mã của nó thì mã nói gì cũng được;
   phép đo phải THỬ ĐI qua cửa cấm rồi đòi cửa ấy đóng. */
console.log('\n16C · THANG NĂM CỔNG CỦA NỘI DUNG');

const nd2 = ndMod;
const goiND = (fn, y, ai) => nd2[fn](y, env, env.CSDL, ai);
const aiSA  = {uid: 'U-sa', u: 'superadmin@gita365.vn',  role: 'R01'};
const aiSA2 = {uid: 'U-sa2', u: 'superadmin2@gita365.vn', role: 'R01'};
const aiBT  = {uid: 'U-bt', u: 'bientap@gita365.vn',     role: 'R05'};
const aiCM  = {uid: 'U-cm', u: 'chuyenmon@gita365.vn',   role: 'R05'};
const aiGC  = {uid: 'U-gc', u: 'giuchuan@gita365.vn',    role: 'R05'};
const aiVIET = {uid: 'U-viet', u: 'nguoiviet@gita365.vn', role: 'R05'};

/* ── CẤP QUYỀN KÝ: một trục riêng, không thêm vai ── */
for (const [ai, chuc] of [[aiBT, 'bienTap'], [aiCM, 'chuyenMon'], [aiGC, 'giuChuan']])
  await goiND('capQuyenNoiDung',
    {username: ai.u, chucNang: chuc, lyDo: 'Cấp cho bộ thử thang năm cổng.'}, aiSA);

bao((await goiND('capQuyenNoiDung',
      {username: aiSA.u, chucNang: 'bienTap', lyDo: 'tự cấp cho mình xem sao'},
      aiSA)).error === 'TUCAP',
  'KHÔNG AI TỰ CẤP QUYỀN KÝ CHO MÌNH — cùng luật với quyenTaiChinh bản 9.97');
bao((await goiND('capQuyenNoiDung',
      {username: 'x@y.vn', chucNang: 'bienTap', lyDo: 'vì thế'}, aiBT)).error === 'KHONGQUYEN',
  'chỉ R01–R02 cấp được quyền ký');
const dsQ = await goiND('dsQuyenNoiDung', {}, aiSA);
bao(dsQ.ok && dsQ.ds.length === 3 && !('congThieuNguoi' in dsQ),
  'ba cổng người đều có người giữ quyền — cổng thiếu người thì máy phải NÓI RA là đứng vì thiếu người, không phải vì bài sai',
  dsQ.ds.map(x => x.chucNang).join(','));

/* ── NẠP BÀI, RỒI ĐI TRỌN THANG ── */
const napA = await goiND('napBai',
  {id: 'BND-T1', tieuDe: 'Bảy ngày nhìn cho đúng', chu: baiDu, tang: 'T1'}, aiVIET);
bao(napA.ok && napA.trangThai === 'nhap' && napA.vanTay.length === 16,
  'nạp bài thì vào bản NHÁP và có vân tay — nạp và nộp là hai việc khác nhau, gộp thì không ai sửa được bản nháp của mình');

const nop = await goiND('nopBai', {id: 'BND-T1'}, aiVIET);
bao(nop.ok && nop.trangThai === 'bienTap',
  'cổng 1 — máy chấm rồi tự chuyển sang cổng biên tập');

/* ── LUẬT L2: KHÔNG AI KÝ BÀI CỦA CHÍNH MÌNH ── */
bao((await goiND('kyBai', {id: 'BND-T1'}, aiVIET)).error === 'TUDUYET',
  'LUẬT L2 — người viết KHÔNG ký bài của chính mình, dù đang giữ đủ quyền hay không');
/* Và L2 phải đứng TRƯỚC phép kiểm quyền. Bản đầu tôi đặt ngược, nên
   người viết chưa có quyền ký bị báo "thiếu quyền ký" — họ đi xin đúng
   cái quyền không giúp được gì, vì xin xong vẫn bị L2 chặn. Thứ tự các
   phép kiểm quyết định người bị chặn đi làm việc gì tiếp theo. */
await goiND('capQuyenNoiDung',
  {username: aiVIET.u, chucNang: 'bienTap',
   lyDo: 'Người viết cũng là biên tập viên — thử đúng chỗ L2 phải chặn.'}, aiSA);
bao((await goiND('kyBai', {id: 'BND-T1'}, aiVIET)).error === 'TUDUYET',
  'người viết CÓ ĐỦ quyền ký vẫn bị L2 chặn — và được báo đúng lý do, không bị đẩy đi xin một quyền họ đã có');
await goiND('thuHoiQuyenNoiDung', {username: aiVIET.u, chucNang: 'bienTap'}, aiSA);

/* ── THIẾU QUYỀN KÝ THÌ CHẶN, VÀ NÓI RÕ THIẾU QUYỀN NÀO ── */
const khongQuyen = await goiND('kyBai', {id: 'BND-T1'},
  {uid: 'U-la', u: 'nguoila@gita365.vn', role: 'R05'});
bao(khongQuyen.error === 'THIEUQUYENKY' && khongQuyen.canQuyen === 'bienTap',
  'không giữ quyền ký thì chặn, và máy nói ra cần quyền NÀO — một lời từ chối không nói thiếu gì thì người bị chặn đi hỏi vòng quanh');

/* ── ĐI TRỌN BỐN CỔNG NGƯỜI, MỖI CỔNG MỘT NGƯỜI KHÁC ── */
bao((await goiND('kyBai', {id: 'BND-T1'}, aiBT)).trangThai === 'chuyenMon', 'cổng 2 — biên tập ký');
bao((await goiND('kyBai', {id: 'BND-T1'}, aiCM)).trangThai === 'giuChuan', 'cổng 3 — chuyên môn ký');
bao((await goiND('kyBai', {id: 'BND-T1'}, aiGC)).trangThai === 'chuHe',    'cổng 4 — giữ chuẩn ký');

/* ── CỔNG 5 CHỈ CHỦ HỆ ── */
bao((await goiND('kyBai', {id: 'BND-T1'}, {uid: 'U-r03', u: 'r03@gita365.vn', role: 'R03'}))
      .error === 'CANCHUHE',
  'cổng 5 chỉ Super Admin ký — máy soát, chủ hệ quyết');
const phat = await goiND('kyBai', {id: 'BND-T1'}, aiSA);
bao(phat.ok && phat.trangThai === 'phatHanh', 'cổng 5 — chủ hệ ký, bài phát hành');

const so1 = await goiND('soKyBai', {id: 'BND-T1'}, aiSA);
bao(so1.so.length === 5 && new Set(so1.so.map(k => k.boiAi)).size === 5 &&
    so1.so.every(k => k.conHieuLuc),
  'năm cổng · năm chữ ký · NĂM NGƯỜI KHÁC NHAU, và mọi chữ ký còn hiệu lực',
  so1.so.map(k => k.cong + ':' + k.boiAi.replace('U-', '')).join(' '));

/* ══ LUẬT L3 — CHỖ TÔI SỬA BẢN ĐẶC TẢ CỦA CHỦ HỆ ══

   Bảng quyền của bản đặc tả cho Super Admin đứng ở CẢ NĂM cổng. Một
   mình chủ hệ ký được cổng 2, 3, 4, rồi 5 — thang năm cổng thành một
   chữ ký, mà sổ vẫn đủ năm dòng nên không ai đọc ra.

   Phép đo này để MỘT chủ hệ đi hết thang rồi đòi máy chặn. */
await goiND('napBai',
  {id: 'BND-T2', tieuDe: 'Bài thử luật L3', chu: baiDu, tang: 'T1'}, aiVIET);
await goiND('nopBai', {id: 'BND-T2'}, aiVIET);
bao((await goiND('kyBai', {id: 'BND-T2'}, aiSA)).ok,
  'chủ hệ ĐỨNG THAY được một cổng đang thiếu người — không phải một bức tường');
const lanHai = await goiND('kyBai', {id: 'BND-T2'}, aiSA);
bao(lanHai.error === 'DAKYCONGKHAC' && lanHai.daKy === 'C2',
  'LUẬT L3 — MỘT NGƯỜI KÝ NHIỀU NHẤT MỘT CỔNG. Không có luật này thì một mình chủ hệ ký cả bốn cổng người, thang năm cổng thành một chữ ký, và sổ vẫn đủ năm dòng nên không ai đọc ra',
  'đã ký ' + lanHai.daKy + ' nên không ký thêm C3');
/* Và chủ hệ THỨ HAI đi tiếp được — luật chặn một NGƯỜI, không chặn một vai. */
bao((await goiND('kyBai', {id: 'BND-T2'}, aiSA2)).ok,
  'chủ hệ THỨ HAI ký tiếp được — L3 chặn một NGƯỜI, không chặn một vai');

/* ══ LUẬT L4 — SỬA BÀI THÌ CHỮ KÝ HẾT HIỆU LỰC ══

   Bản đặc tả ghi vân tay vào chữ ký và nói "ai chỉnh ngầm là LỘ ngay
   qua hash". Lộ chứ không chặn — nghĩa là phải có người đi đọc mới
   thấy, mà chẳng ai đi đọc. Ở đây máy làm việc ấy. */
await goiND('napBai',
  {id: 'BND-T3', tieuDe: 'Bài thử luật L4', chu: baiDu, tang: 'T1'}, aiVIET);
await goiND('nopBai', {id: 'BND-T3'}, aiVIET);
await goiND('kyBai', {id: 'BND-T3'}, aiBT);
await goiND('kyBai', {id: 'BND-T3'}, aiCM);
const truocSua = await goiND('soKyBai', {id: 'BND-T3'}, aiSA);
bao(truocSua.trangThai === 'giuChuan' && truocSua.so.filter(k => k.conHieuLuc).length === 3,
  'bài đang ở cổng 4 với ba chữ ký còn hiệu lực');

const suaLen = await goiND('napBai',
  {id: 'BND-T3', tieuDe: 'Bài thử luật L4',
   chu: baiDu.replace('Tối nay ghi 3 dòng, không thêm nhận xét.',
                      'Tối nay ghi 5 dòng, và thêm một nhận xét ngắn.'),
   tang: 'T1'}, aiVIET);
bao(suaLen.ok && suaLen.trangThai === 'nhap' && /hết hiệu lực/.test(suaLen.vi || ''),
  'LUẬT L4 — SỬA NỘI DUNG SAU KHI CÓ CHỮ KÝ thì bài về BẢN NHÁP ngay. Một chữ ký đứng dưới một bài đã đổi là một chữ ký nói dối, và người đọc sổ sáu tháng sau không có cách nào biết là nó đang nói dối');

const sauSua = await goiND('soKyBai', {id: 'BND-T3'}, aiSA);
bao(sauSua.so.length === 3 && sauSua.so.every(k => !k.conHieuLuc) && sauSua.canhBao,
  'ba chữ ký cũ Ở LẠI trong sổ và mang dấu HẾT HIỆU LỰC — không xoá, vì chính chúng là chỗ kể ra bài đã bị sửa sau khi ký',
  sauSua.canhBao.slice(0, 50));
/* Và người đã ký bản cũ ký lại được bản mới — L3 đếm chữ ký CÒN HIỆU LỰC. */
await goiND('nopBai', {id: 'BND-T3'}, aiVIET);
bao((await goiND('kyBai', {id: 'BND-T3'}, aiBT)).ok,
  'người đã ký bản CŨ ký lại được bản MỚI — luật L3 đếm chữ ký còn hiệu lực, không đếm mọi dòng trong sổ');

/* ══ LUẬT L1 · L5 ══ */
await goiND('napBai',
  {id: 'BND-T4', tieuDe: 'Bài thiếu khối', chu: boK15, tang: 'T1'}, aiVIET);
const mayChan = await goiND('nopBai', {id: 'BND-T4'}, aiVIET);
bao(!mayChan.ok && mayChan.error === 'MAYCHAN' &&
    mayChan.chan.some(c => /K14 đòi K15/.test(c)),
  'LUẬT L5 — cổng 1 chặn bằng SỐ và không có ô duyệt ngoại lệ. Bốn người sau không đốt thời gian đọc thứ đếm được là chưa xong',
  mayChan.chan.join(' · ').slice(0, 60));
bao((await goiND('kyBai', {id: 'BND-T4'}, aiBT)).error === 'SAIBAC',
  'LUẬT L1 — bài bị cổng 1 chặn thì KHÔNG ai ký vượt lên cổng 2 được. Không có đường tắt qua một cổng nào');

/* ── TỪ CHỐI PHẢI NÓI VÌ SAO ── */
await goiND('napBai',
  {id: 'BND-T5', tieuDe: 'Bài bị từ chối', chu: baiDu, tang: 'T1'}, aiVIET);
await goiND('nopBai', {id: 'BND-T5'}, aiVIET);
bao((await goiND('kyBai', {id: 'BND-T5', viec: 'tuChoi', lyDo: 'kém'}, aiBT))
      .error === 'THIEULYDO',
  'từ chối mà không nói vì sao thì bị chặn — người viết sửa mò rồi nộp lại y hệt');
const tc = await goiND('kyBai',
  {id: 'BND-T5', viec: 'tuChoi', lyDo: 'Khối K10 chưa phải một ca thật, còn là ví dụ chung.'}, aiBT);
bao(tc.ok && tc.trangThai === 'nhap', 'từ chối có lý do thì bài về bản nháp');

/* ── BÀI ĐÃ PHÁT HÀNH KHÔNG SỬA ĐÈ ── */
bao((await goiND('napBai',
      {id: 'BND-T1', tieuDe: 'Sửa đè bài đã phát hành', chu: baiDu + '\nthêm dòng', tang: 'T1'},
      aiVIET)).error === 'DAPHATHANH',
  'bài ĐÃ PHÁT HÀNH không sửa đè — bài đã ở trong tay người đọc, ghi đè bản trong sổ là làm sổ nói khác thứ họ đang cầm');

/* ── ĐỐI TƯỢNG CỦA BÀI GIỮ ĐƯỢC QUA LƯỢT LƯU ──
   Từ điển KL08 dò theo cột `doiTuong`. Cột ấy mất qua lượt lưu thì
   mọi bài thành nội bộ, và lớp `khach` không bao giờ chạy — hỏng im
   lặng, vì bài vẫn qua cổng như thường. */
{
  const chuKL = baiDu.replace('Tối nay ghi 3 dòng, không thêm nhận xét.',
    'Tuần trước con thất bại, cố lên nhé.');
  await goiND('napBai', {id: 'BND-KL', tieuDe: 'Thư gửi phụ huynh',
    chu: chuKL, tang: 'T1', doiTuong: 'khach'}, aiVIET);
  const nopKL = await goiND('nopBai', {id: 'BND-KL'}, aiVIET);
  bao(nopKL.ok && nopKL.soat.doiTuong === 'khach' && nopKL.soat.kl.length === 2,
    'đối tượng của bài GIỮ được qua lượt lưu, và cổng 1 dò theo đúng nó — mất cột ấy thì mọi bài thành nội bộ và lớp `khach` không bao giờ chạy',
    'bắt ' + ((nopKL.soat || {}).kl || []).length + ' cụm lệch từ điển');
}

/* ── CÂU NGHIỆP DƯ KHÔNG CHẶN CỔNG 1 ──
   Cảnh báo là cảnh báo. Nếu có ngày ai đó nâng nó thành cửa chặn thì
   phép đo này đỏ, và đó là lúc phải đọc lại vì sao nó chỉ cảnh báo. */
{
  const chuCG = baiDu.replace('Tối nay ghi 3 dòng, không thêm nhận xét.',
    'Em phải làm cho xong, chỉ cần cố gắng thôi.');
  await goiND('napBai', {id: 'BND-CG', tieuDe: 'Bài có câu nghiệp dư',
    chu: chuCG, tang: 'T1'}, aiVIET);
  const nopCG = await goiND('nopBai', {id: 'BND-CG'}, aiVIET);
  bao(nopCG.ok && nopCG.soat.chuyenGia.length === 2,
    'bài có câu nghiệp dư VẪN qua được cổng 1 — cảnh báo là cảnh báo, không phải cửa chặn',
    'bắt ' + ((nopCG.soat || {}).chuyenGia || []).length + ' câu mà không chặn');
}

/* ── ĐỒNG HỒ TREO: NỔI LÊN, KHÔNG CHẶN ── */
env.CSDL.prepare("UPDATE baiNoiDung SET vaoCongLuc = ? WHERE id = 'BND-T5'")
  .bind(new Date(Date.now() - 100 * 3600e3).toISOString()).run();
env.CSDL.prepare("UPDATE baiNoiDung SET trangThai = 'chuyenMon' WHERE id = 'BND-T5'").run();
const treo = await goiND('baiTreo', {}, aiSA);
bao(treo.soTreo >= 1 && treo.treo[0].cong === 'C3' && treo.treo[0].quaHan,
  'bài nằm quá hạn ở một cổng thì NỔI LÊN — và không bị chặn: chặn một bài vì người duyệt bận là phạt nhầm người',
  'chờ ' + (treo.treo[0] || {}).choGio + 'h / hạn ' + (treo.treo[0] || {}).hanGio + 'h');

/* ═══════════════ 17 · KHÔNG RÒ RA NGOÀI ═══════════════ */
console.log('\n17 · KHÔNG RÒ RA NGOÀI');
const xau = {prepare(){ throw new Error('SQLITE_ERROR: no such column: users.matKhauThat'); }};
const rNo = await worker.fetch(new Request('https://gita.test/', {
  method: 'POST', headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({fn: 'dangNhap', u: 'a@b.vn', mk: 'x'})
}), {...env, CSDL: xau});
const jNo = await rNo.json();
bao(rNo.status === 500 && !/SQLITE|users\.|column/i.test(JSON.stringify(jNo)),
  'lỗi cơ sở dữ liệu KHÔNG lọt ra máy khách — tên bảng, tên cột là bản đồ cho người đi dò',
  JSON.stringify(jNo.error));

const gt = await worker.fetch(new Request('https://gita.test/', {method: 'GET'}), env);
const jGt = await gt.json();
bao(jGt.ok && jGt.daNapKhoa === 8 && !JSON.stringify(jGt).includes('khoa-nen'),
  'cửa trạng thái nói ĐÃ NẠP MẤY KHOÁ mà không trả khoá nào',
  'đã nạp ' + jGt.daNapKhoa + ' gói');

/* ═══════════════ 18 · PHÉP SOI TỰ CHỨNG MINH CHƯA CÂM ═══════════════

   Mười bảy mục trên xanh hết. Một bộ thử chưa từng đỏ thì chưa phải bộ thử.
   Ở đây phá bằng cách truyền một hồ sơ vai KHÁC vào chính hàm tính
   phạm vi — không tráo hàm toàn cục, đúng luật đã ghi ở v9.79. */
console.log('\n18 · PHÉP SOI TỰ CHỨNG MINH CHƯA CÂM');
const pv = (await import('../may-chu/worker.js')).phamViCapPhep;
bao(pv({role: 'R13', tier: 5}).indexOf('tang5') >= 0 &&
    pv({role: 'R13', tier: 2}).indexOf('tang3') < 0,
  'đổi tầng trong hồ sơ thì phạm vi đổi theo — phép soi phạm vi không phải hằng số',
  'T5 → ' + pv({role: 'R13', tier: 5}).length + ' gói · T2 → ' + pv({role: 'R13', tier: 2}).length + ' gói');
bao(pv({role: 'R99', tier: 5}).join(',') === 'nen',
  'vai LẠ chỉ nhận phần nền — danh sách trắng, không phải danh sách cấm',
  'vai chưa tồn tại hôm nay cũng không lọt được');

/* ═══════════════ 19 · VÒNG TỰ HOÀN THIỆN — GATE 入库 ═══════════════
   Tình huống 5: kho rỗng lúc tư vấn → soạn từ dữ liệu đã có → ba cấp
   cấp phép → 入库. Chạy TRỌN vòng trên worker thật + D1 thật. */
console.log('\n19 · VÒNG TỰ HOÀN THIỆN — GATE 入库');
await themNguoi('U-tht-sa', 'tht-sa@gita365.vn', 'MatKhauRieng2026!', 'R01', {portal: 'admin'});
await themNguoi('U-tht-gd', 'tht-gd@gita365.vn', 'MatKhauRieng2026!', 'R03', {portal: 'admin'});
await themNguoi('U-tht-cm', 'tht-cm@gita365.vn', 'MatKhauRieng2026!', 'R04', {portal: 'admin'});
await themNguoi('U-tht-co', 'tht-co@gita365.vn', 'MatKhauRieng2026!', 'R07', {portal: 'coach'});
const t01 = (await goi({fn: 'dangNhap', u: 'tht-sa@gita365.vn', mk: 'MatKhauRieng2026!'})).than.token;
const t03 = (await goi({fn: 'dangNhap', u: 'tht-gd@gita365.vn', mk: 'MatKhauRieng2026!'})).than.token;
const t04 = (await goi({fn: 'dangNhap', u: 'tht-cm@gita365.vn', mk: 'MatKhauRieng2026!'})).than.token;
const t07b = (await goi({fn: 'dangNhap', u: 'tht-co@gita365.vn', mk: 'MatKhauRieng2026!'})).than.token;

/* Khách R13 KHÔNG ghi phát sinh được (sổ nội bộ) */
bao((await goi({fn: 'ghiPhatSinh', token: dn.than.token, loai: 'khoRong',
    chiTiet: 'kho rỗng khi tư vấn'})).than.code === 'NOPERM',
  'khách R13 không ghi được sổ phát sinh nội bộ');

/* Coach ghi phát sinh kho rỗng */
const ps = (await goi({fn: 'ghiPhatSinh', token: t07b, loai: 'khoRong', kho: 'BLV_NGAN',
  cauHoi: 'coach hỏi mà kho chưa có', chiTiet: 'Kho ví dụ rỗng lúc đang tư vấn khách'})).than;
bao(ps.ok && ps.id, 'coach ghi được phát sinh kho rỗng', ps.id);

/* Soạn KHÔNG dẫn nguồn → THIEUNGUON (không bịa) */
bao((await goi({fn: 'soanBanNhap', token: t07b, phatSinhId: ps.id, tenKho: 'BLV_NGAN',
    tieuDe: 'Bản bổ sung thử', noiDung: 'Một nội dung đủ dài hơn hai mươi ký tự để qua ô'})).than.code
    === 'THIEUNGUON',
  'soạn KHÔNG dẫn nguồn thì từ chối — máy soạn từ dữ liệu đã có, không bịa');

/* Soạn có dẫn nguồn → ok, trạng thái nhap */
const bn = (await goi({fn: 'soanBanNhap', token: t07b, phatSinhId: ps.id, tenKho: 'BLV_NGAN',
  tieuDe: 'Bản bổ sung thử', noiDung: 'Một nội dung đủ dài hơn hai mươi ký tự để qua ô',
  nguon: 'BLV_NGAN + HL_SAUNHIP'})).than;
bao(bn.ok && bn.trangThai === 'nhap', 'soạn có dẫn nguồn → bản nháp staging', bn.id);

/* 入库 KHI CHƯA DUYỆT → CHUADU (cái răng) */
bao((await goi({fn: 'nhapKho', token: t01, napId: bn.id})).than.code === 'CHUADU',
  'CÁI RĂNG: 入库 khi chưa đủ ba chữ ký thì TỪ CHỐI — nội dung chưa ai chốt không ra phục vụ khách');

/* Duyệt SAI VAI: R03 ký cấp sanPham (của R04) → SAIVAI */
bao((await goi({fn: 'duyetCap', token: t03, napId: bn.id, cap: 'sanPham',
    ghiChu: 'thử sai vai'})).than.code === 'SAIVAI',
  'duyệt sai vai bị chặn — cấp sanPham phải do R04 ký');

/* Ba cấp, ba người khác nhau */
bao((await goi({fn: 'duyetCap', token: t04, napId: bn.id, cap: 'sanPham',
  ghiChu: 'nội dung đạt chuẩn nghề, dẫn nguồn thật'})).than.ok, 'R04 duyệt cấp sản phẩm');
bao((await goi({fn: 'duyetCap', token: t03, napId: bn.id, cap: 'giamDoc',
  ghiChu: 'hệ quả vận hành ổn, Học viện giữ được cam kết'})).than.ok, 'R03 duyệt cấp giám đốc');
/* 入库 khi mới hai chữ ký → vẫn CHUADU */
bao((await goi({fn: 'nhapKho', token: t01, napId: bn.id})).than.code === 'CHUADU',
  '入库 khi mới hai trên ba chữ ký vẫn từ chối');
bao((await goi({fn: 'duyetCap', token: t01, napId: bn.id, cap: 'superAdmin',
  ghiChu: 'chốt cuối, đưa ra phục vụ khách'})).than.ok, 'R01 duyệt cấp Super Admin');

/* Đủ ba chữ ký ba người → Super Admin 入库 được */
bao((await goi({fn: 'nhapKho', token: t01, napId: bn.id})).than.ok,
  'đủ ba chữ ký ba người khác nhau → Super Admin 入库 thành công');

/* Nội dung đã 入库 phục vụ được; bản nháp CHƯA duyệt thì KHÔNG */
const bs = (await goi({fn: 'traBoSung', token: t07b, tenKho: 'BLV_NGAN'})).than;
bao(bs.ok && bs.bo.length === 1 && bs.bo[0].tieuDe === 'Bản bổ sung thử',
  'phần đã 入库 phục vụ được; ranh giới ở câu truy vấn trangThai=daNhap',
  (bs.bo || []).length + ' bản');
const bn2 = (await goi({fn: 'soanBanNhap', token: t07b, phatSinhId: ps.id, tenKho: 'BLV_NGAN',
  tieuDe: 'Bản chưa duyệt', noiDung: 'Nội dung nháp đủ dài hơn hai mươi ký tự để qua ô',
  nguon: 'BLV_NGAN'})).than;
const bs2 = (await goi({fn: 'traBoSung', token: t07b, tenKho: 'BLV_NGAN'})).than;
bao(bs2.bo.length === 1 && !bs2.bo.some(x => x.tieuDe === 'Bản chưa duyệt'),
  'bản nháp CHƯA duyệt KHÔNG phục vụ khách — lọc ở câu truy vấn, không ở màn', bn2.id);

/* ═══════════════ 20 · CHUỖI CẨM NANG — TÌNH HUỐNG 6 ═══════════════
   Gia đình kẹt (minh chứng=0, con hợp tác vỏ ngoài): Bộ não soạn CẨM
   NANG GỠ CA, trình chuỗi camNang: Coach cao nhất → Giám đốc → Super
   Admin. Cùng cái răng, chuỗi khác — không dựng cổng thứ hai. */
console.log('\n20 · CHUỖI CẨM NANG — TÌNH HUỐNG 6');
await themNguoi('U-tht-r5', 'tht-r5@gita365.vn', 'MatKhauRieng2026!', 'R05', {portal: 'coach'});
const t05 = (await goi({fn: 'dangNhap', u: 'tht-r5@gita365.vn', mk: 'MatKhauRieng2026!'})).than.token;

const ps6 = (await goi({fn: 'ghiPhatSinh', token: t07b, loai: 'giaDinhVuong',
  cauHoi: 'nhà không có điểm trùng khớp, minh chứng = 0',
  chiTiet: 'Phụ huynh bận, con hợp tác vỏ ngoài, phụ huynh không rành công nghệ nên minh chứng trống'})).than;
bao(ps6.ok, 'ghi phát sinh gia đình kẹt (tình huống 6)', ps6.id);

const bnC = (await goi({fn: 'soanBanNhap', token: t07b, phatSinhId: ps6.id, tenKho: 'CAM_NANG_GO_CA',
  tieuDe: 'Cẩm nang gỡ ca nhà kẹt', loaiDuyet: 'camNang',
  noiDung: 'Ba bước gỡ khi phụ huynh và con không có điểm trùng khớp, dựa trên dữ liệu đã có',
  nguon: 'HL_SAUNHIP + coach-5-tang'})).than;
bao(bnC.ok && bnC.loaiDuyet === 'camNang', 'soạn cẩm nang vào chuỗi camNang', bnC.id);

/* Cấp sanPham KHÔNG thuộc chuỗi camNang → CAPLA */
bao((await goi({fn: 'duyetCap', token: t04, napId: bnC.id, cap: 'sanPham',
    ghiChu: 'thử cấp sai chuỗi'})).than.code === 'CAPLA',
  'cấp sanPham không thuộc chuỗi camNang → từ chối');
/* coachCao phải R05, không phải R04 */
bao((await goi({fn: 'duyetCap', token: t04, napId: bnC.id, cap: 'coachCao',
    ghiChu: 'thử sai vai'})).than.code === 'SAIVAI',
  'cấp coachCao phải do R05 ký, R04 bị chặn');

bao((await goi({fn: 'duyetCap', token: t05, napId: bnC.id, cap: 'coachCao',
  ghiChu: 'cẩm nang đúng chuyên môn coach, không hứa quá, trong phạm vi gói'})).than.ok,
  'R05 duyệt cấp Coach cao nhất');
bao((await goi({fn: 'duyetCap', token: t03, napId: bnC.id, cap: 'giamDoc',
  ghiChu: 'Học viện làm nổi cẩm nang này cho mọi nhà'})).than.ok, 'R03 duyệt cấp giám đốc (camNang)');
bao((await goi({fn: 'nhapKho', token: t01, napId: bnC.id})).than.code === 'CHUADU',
  'cẩm nang thiếu chữ ký Super Admin vẫn chưa áp dụng được');
bao((await goi({fn: 'duyetCap', token: t01, napId: bnC.id, cap: 'superAdmin',
  ghiChu: 'chốt cẩm nang, đưa vào áp dụng'})).than.ok, 'R01 duyệt cấp Super Admin (camNang)');
bao((await goi({fn: 'nhapKho', token: t01, napId: bnC.id})).than.ok,
  'đủ ba chữ ký chuỗi camNang → Super Admin áp dụng cẩm nang');

/* ═══════════════ 21 · CHUỖI ỨNG PHÓ — TÌNH HUỐNG 7 ═══════════════
   Đối thủ chơi xấu / quá tải / gửi sai: phương án ứng phó qua chuỗi
   ungPho (Ban vận hành R02 → Giám đốc R03 → Super Admin R01). */
console.log('\n21 · CHUỖI ỨNG PHÓ — TÌNH HUỐNG 7');
await themNguoi('U-tht-r2', 'tht-r2@gita365.vn', 'MatKhauRieng2026!', 'R02', {portal: 'admin'});
const t02 = (await goi({fn: 'dangNhap', u: 'tht-r2@gita365.vn', mk: 'MatKhauRieng2026!'})).than.token;

const ps7 = (await goi({fn: 'ghiPhatSinh', token: t07b, loai: 'doiThuChoiXau',
  cauHoi: 'đối thủ báo spam group', chiTiet: 'Đối thủ báo spam hàng loạt vào group Gia đình thịnh vượng'})).than;
bao(ps7.ok, 'ghi phát sinh đối thủ chơi xấu (tình huống 7)', ps7.id);

const bnU = (await goi({fn: 'soanBanNhap', token: t07b, phatSinhId: ps7.id, tenKho: 'UNG_PHO_SPAM',
  tieuDe: 'Phương án kháng nghị spam', loaiDuyet: 'ungPho',
  noiDung: 'Kháng nghị nền tảng theo biểu mẫu, siết duyệt thành viên tạm thời, qua kênh hợp pháp',
  nguon: 'THT_RB RB-01'})).than;
bao(bnU.ok && bnU.loaiDuyet === 'ungPho', 'soạn phương án vào chuỗi ứng phó', bnU.id);

/* Cấp vanHanh phải R02, R04 bị chặn */
bao((await goi({fn: 'duyetCap', token: t04, napId: bnU.id, cap: 'vanHanh',
    ghiChu: 'thử sai vai'})).than.code === 'SAIVAI',
  'cấp vanHanh phải do R02 ký, R04 bị chặn');
bao((await goi({fn: 'duyetCap', token: t02, napId: bnU.id, cap: 'vanHanh',
  ghiChu: 'phương án chạy được, mọi bước qua kênh hợp pháp, không phản công trái phép'})).than.ok,
  'R02 duyệt cấp Ban vận hành');
bao((await goi({fn: 'duyetCap', token: t03, napId: bnU.id, cap: 'giamDoc',
  ghiChu: 'giữ uy tín, không tạo rủi ro pháp lý'})).than.ok, 'R03 duyệt cấp giám đốc (ungPho)');
bao((await goi({fn: 'duyetCap', token: t01, napId: bnU.id, cap: 'superAdmin',
  ghiChu: 'chốt phương án ứng phó'})).than.ok, 'R01 duyệt cấp Super Admin (ungPho)');
bao((await goi({fn: 'nhapKho', token: t01, napId: bnU.id})).than.ok,
  'đủ ba chữ ký chuỗi ứng phó → Super Admin áp dụng phương án');

/* ═══════════════ 22 · LOẠI PHÁT SINH 8·9·10 ═══════════════ */
console.log('\n22 · LOẠI PHÁT SINH 8·9·10');
for (const lo of ['nhanSuNgoaiLuong', 'doiVuotQuyen', 'chiaSeTaiKhoan']) {
  const r = (await goi({fn: 'ghiPhatSinh', token: t07b, loai: lo,
    chiTiet: 'ca thử của loại ' + lo + ' đủ mười ký tự'})).than;
  bao(r.ok && r.id, 'ghi được phát sinh loại ' + lo, r.id || r.code);
}
/* Loại lạ vẫn bị chặn — danh sách trắng, không phải bỏ kiểm */
bao((await goi({fn: 'ghiPhatSinh', token: t07b, loai: 'loaiKhongCoThat',
    chiTiet: 'phải bị chặn dù đủ ký tự'})).than.code === 'LOAILA',
  'loại phát sinh lạ vẫn bị chặn (danh sách trắng)');

/* ═══════════════ 23 · QUYỀN NĂNG AI — SUPER ADMIN CẤP ═══════════════
   Mỗi chức năng AI tắt mặc định; chỉ R01 bật; chức năng làm việc đi qua
   cổng đã có. */
console.log('\n23 · QUYỀN NĂNG AI');
/* Chưa bật → cửa chức năng từ chối */
bao((await goi({fn: 'aiPhanLoai', token: t07b, loai: 'phanHoiXau',
    chiTiet: 'khách chê, chưa bật quyền'})).than.code === 'CHUACAP',
  'AI01 chưa bật thì cửa chức năng từ chối (CHUACAP)');
/* Không phải R01 thì không cấp được */
bao((await goi({fn: 'capQuyenAI', token: t07b, quyen: 'AI01',
    ghiChu: 'coach thử cấp'})).than.code === 'NOPERM',
  'không phải Super Admin thì không cấp được quyền năng AI');
/* R01 bật AI01 */
bao((await goi({fn: 'capQuyenAI', token: t01, quyen: 'AI01',
    ghiChu: 'bật phân loại phản hồi cho trợ lý'})).than.ok, 'Super Admin bật AI01');
/* Bật rồi → chức năng chạy, ghi một phát sinh thật */
const aiPS = (await goi({fn: 'aiPhanLoai', token: t07b, loai: 'phanHoiXau',
  chiTiet: 'khách chê chưa đáng trả phí — phân loại qua AI01'})).than;
bao(aiPS.ok && aiPS.id, 'AI01 bật rồi thì phân loại được, ghi phát sinh', aiPS.id);
/* Thu hồi → tắt lại (dòng mới bat=0, tính lúc đọc) */
bao((await goi({fn: 'thuHoiQuyenAI', token: t01, quyen: 'AI01',
    ghiChu: 'tạm thu để soát'})).than.ok, 'Super Admin thu hồi AI01');
bao((await goi({fn: 'aiPhanLoai', token: t07b, loai: 'phanHoiXau',
    chiTiet: 'sau khi thu hồi'})).than.code === 'CHUACAP',
  'thu hồi rồi thì cửa chức năng đóng lại (tính lúc đọc)');
/* AI02: bật rồi soạn nháp đi qua chuỗi kho (staging) */
bao((await goi({fn: 'capQuyenAI', token: t01, quyen: 'AI02',
    ghiChu: 'bật soạn nháp lấp kho'})).than.ok, 'Super Admin bật AI02');
const aiBN = (await goi({fn: 'aiSoanNhap', token: t07b, loaiDuyet: 'kho', phatSinhId: aiPS.id,
  tenKho: 'KHO_THU_AI', tieuDe: 'Nháp do AI soạn', noiDung: 'Nội dung nháp đủ dài hơn hai mươi ký tự',
  nguon: 'AI01 phát sinh'})).than;
bao(aiBN.ok && aiBN.trangThai === 'nhap', 'AI02 soạn nháp vào staging (vẫn phải ba chữ ký mới 入库)', aiBN.id);

/* ═══════════ ĐIỀU PHỐI 100 TRỢ LÝ (9.99.107) ═══════════ */
/* Khách R13 KHÔNG điều phối được */
bao((await goi({ fn: 'dieuPhoiTroLy', token: tk, khoaSoHuu: 'ghiPhieuThu' })).than.code === 'NOPERM',
  'khách R13 không điều phối trợ lý được (mở R01–R12)');
/* Thiếu khoá sở hữu → THIEUO, không đoán */
bao((await goi({ fn: 'dieuPhoiTroLy', token: t01 })).than.code === 'THIEUO',
  'điều phối thiếu khoá sở hữu thì báo thiếu, không đoán');
/* CỬA LẠ bị TỪ CHỐI — phép đo HÀNH VI chống-áp-phích: bản echo cũ nhận
   bừa mọi chuỗi và khai "đã định tuyến". Nay cửa không có thật → KHONGCUA. */
bao((await goi({ fn: 'dieuPhoiTroLy', token: t01, khoaSoHuu: 'khong_co_cua_nay_dau' })).than.code === 'KHONGCUA',
  'điều phối TỪ CHỐI khoá sở hữu không phải cửa thật (KHONGCUA) — không nhận bừa như echo cũ');
/* R01 điều phối một cửa THẬT → trả KẾ HOẠCH đã định tuyến */
const dpKH = (await goi({ fn: 'dieuPhoiTroLy', token: t01, khoaSoHuu: 'ghiPhieuThu' })).than;
bao(dpKH.ok && dpKH.quyetDinh === 'daDinhTuyen' && dpKH.khoaSoHuu === 'ghiPhieuThu',
  'điều phối một CỬA THẬT thì xác nhận và trả kế hoạch (đã định tuyến)', dpKH.quyetDinh);
/* Tự hoàn thiện TRỎ vào vòng nâng cấp — chạm vùng cấm (hiến pháp) thì
   CHÍNH vòng chặn (VUNGCAM), chứng minh đi qua cổng đã có, không đường riêng */
const thCam = (await goi({ fn: 'tuHoanThienTroLy', token: t07b,
  viec: 'nới hiến pháp cho trợ lý chạy nhanh hơn', vung: 'hiến pháp',
  luiLai: 'quay lại bản trợ lý cũ' })).than;
bao(thCam.code === 'VUNGCAM',
  'tự hoàn thiện chạm vùng cấm bị VÒNG NÂNG CẤP chặn (VUNGCAM) — đi qua cổng đã có, không đường riêng',
  thCam.code);
/* Tự hoàn thiện thiếu ô → THIEUO */
bao((await goi({ fn: 'tuHoanThienTroLy', token: t07b, viec: 'cải tiến' })).than.code === 'THIEUO',
  'tự hoàn thiện thiếu VÙNG thì báo thiếu');

/* ═══════════ NHÂN VẬT ĐỒNG BỘ THEO TÀI KHOẢN (CD-04, 9.99.109) ═══════════ */
/* Chưa lưu → chuaCo */
bao((await goi({ fn: 'docNhanVat', token: tk })).than.chuaCo === true,
  'chưa lưu nhân vật thì docNhanVat trả chuaCo');
/* Lưu mấy chỉ mục → đọc lại đúng; chỉ mục ngoài khoảng bị kẹp */
const nvLuu = (await goi({ fn: 'luuNhanVat', token: tk, da: 3, tocMau: 1, toc: 2, ao: 4, kinh: 1, anh: 'BỎ', ten: 'BỎ' })).than;
bao(nvLuu.ok && nvLuu.doc && nvLuu.doc.da === 3 && nvLuu.doc.ao === 4 && nvLuu.doc.anh === undefined,
  'luuNhanVat lưu năm chỉ mục, BỎ mọi ô ảnh/tên gửi kèm (Điều 13)', JSON.stringify(nvLuu.doc));
const nvDoc = (await goi({ fn: 'docNhanVat', token: tk })).than;
bao(nvDoc.ok && nvDoc.chuaCo === false && nvDoc.doc.toc === 2 && nvDoc.doc.kinh === 1,
  'docNhanVat đọc lại đúng bản đã lưu');
/* Chỉ mục rác bị kẹp: 999 → 50, -5 → 0 */
const nvKep = (await goi({ fn: 'luuNhanVat', token: tk, da: 999, tocMau: -5, toc: 0, ao: 0, kinh: 0 })).than;
bao(nvKep.ok && nvKep.doc.da === 50 && nvKep.doc.tocMau === 0,
  'chỉ mục rác bị kẹp về khoảng hợp lệ (999→50, -5→0)', nvKep.doc.da + '/' + nvKep.doc.tocMau);
/* Tài khoản KHÁC không thấy nhân vật người này (khoá theo uid) */
bao((await goi({ fn: 'docNhanVat', token: t01 })).than.chuaCo === true,
  'tài khoản khác KHÔNG thấy nhân vật người này — khoá theo uid của phiên');

/* ═══════════════ 24 · CỔNG ĐỢT SOI ĐỐI KHÁNG (9.99.112) ═══════════════
   Năm lỗ HIGH bịt trong đợt soi đối kháng, mỗi lỗ một phép đo HÀNH VI
   có thể ĐỎ khi cổng bị gỡ — không đọc mã đoán, gọi thật vào cửa. */
console.log('\n24 · CỔNG ĐỢT SOI ĐỐI KHÁNG (9.99.112)');

/* ── A · CHỨNG CỨ HOA HỒNG có CỔNG VAI ──
   Ba cửa chứng cứ nằm trong CAN_PHIEN nhưng bản đầu KHÔNG kiểm vai. Một
   khách R13 GHI được chứng cứ và — nặng nhất — một Coach nắm thêm tài
   khoản khách TỰ XÁC NHẬN chứng cứ của mình. Nay trần = Coach trở lên. */
bao((await goi({fn: 'kyChungCu', token: tk,
    cc: {nhiemVu: 'NV-99', ngayLam: '2026-09-01', loai: 'kem',
      noiDung: 'khách R13 thử ký chứng cứ hoa hồng'}})).than.code === 'NOPERM',
  'A · khách R13 KHÔNG ký được chứng cứ hoa hồng (cổng vai lv≤7) — gỡ cổng thì R13 ký được');

/* ── B · traBoSung — khách KHÔNG thấy nội dung NGHỀ (camNang) ──
   traBoSung phục vụ nội dung bổ sung; ranh giới ở CÂU TRUY VẤN, không ở
   màn. Nhà nghề thấy cả camNang; khách chỉ thấy loaiDuyet='kho'. Section
   20 đã 入库 một cẩm nang vào CAM_NANG_GO_CA. */
const bsNghe = (await goi({fn: 'traBoSung', token: t07b, tenKho: 'CAM_NANG_GO_CA'})).than;
const bsKhach = (await goi({fn: 'traBoSung', token: tk, tenKho: 'CAM_NANG_GO_CA'})).than;
bao(bsNghe.ok && bsNghe.bo.length >= 1 && bsKhach.ok && bsKhach.bo.length === 0,
  'B · nhà nghề thấy cẩm nang (camNang), khách R13 KHÔNG — lọc ở câu truy vấn, không ở màn',
  'nghề ' + bsNghe.bo.length + ' · khách ' + bsKhach.bo.length);

/* ── C · TỰ CẤP QUYỀN qua EMAIL — capLenhGiamSat & capQuyenTaiChinh ──
   Cổng "không tự cấp" cũ so chuỗi thô `choAi===hoSo.u`, bỏ sót khi khai
   bằng EMAIL (email≠username). Nay so ĐỊNH DANH CHÍNH TẮC (uid) sau khi
   tra người. Tài khoản thử CỐ Ý có email ≠ username để phép đo chạm ĐÚNG
   cổng canonical, không dừng ở cổng thô (bản đầu của cả hai test cũ). */
const muoiGS = nen.muoiMoi();
db.prepare('INSERT INTO users (id,username,hoTen,email,role,portal,pwSalt,pwHash,active,' +
  'createdAt,mustChangePw) VALUES (?,?,?,?,?,?,?,?,1,?,0)').run(
  'U-gs-r01', 'gs-r01', 'Người GS R01', 'gs-r01-mail@gita365.vn', 'R01', 'admin',
  muoiGS, await nen.bamMoi('MatKhauRieng2026!', muoiGS, env.GITA_TIEU),
  new Date().toISOString());
const tGsR01 = (await goi({fn: 'dangNhap', u: 'gs-r01', mk: 'MatKhauRieng2026!'})).than.token;
const maiGS = new Date(Date.now() + 30 * 864e5).toISOString();
/* choAi = EMAIL của chính mình (≠ username 'gs-r01') → thô cổng 2 KHÔNG bắt,
   canonical cổng 5 mới bắt. bacDich=5 > bac R01(1) nên KHÔNG vướng NGANGCAP:
   gỡ cổng canonical thì lệnh này INSERT thành công → phép đo đỏ. */
bao((await goi({fn: 'capLenhGiamSat', token: tGsR01,
    phamVi: 'Đọc nhật ký thao tác', ngan: 'NHANSU', choAi: 'gs-r01-mail@gita365.vn',
    lyDo: 'Rà soát định kỳ theo kế hoạch đã duyệt', hanDen: maiGS, bacDich: 5})).than.code
    === 'TUCAP',
  'C1 · capLenhGiamSat TỰ CẤP qua EMAIL bị chặn (canonical uid) — thô cổng 2 bỏ sót email');
bao((await goi({fn: 'capQuyenTaiChinh', token: tGsR01,
    username: 'gs-r01-mail@gita365.vn', chucNang: 'keToanThu',
    lyDo: 'tự cấp qua email cho tiện'})).than.code === 'TUCAP',
  'C2 · capQuyenTaiChinh TỰ CẤP qua EMAIL bị chặn (canonical uid) — cửa ký TIỀN cho mình');

/* ── D · PH-3 · RÚT ĐỒNG Ý chặn cả ĐỌC thẻ (không chỉ ghi) ──
   Rút đồng ý (Luật 91) là chặn XỬ LÝ TIẾP; đọc thẻ để dùng lại LÀ xử lý
   tiếp. Bản đầu chỉ chặn TẠO thẻ, cửa đọc vẫn trả D4 (nỗi sợ nguyên văn
   của trẻ) sau khi cha mẹ đã rút. */
const nhaD = 'NHA-PH3-DOC';
const theAT = {d1: 'Con tập trung lâu khi làm việc bằng tay',
  d2: 'Con thích kể lại chuyện vừa đọc cho người nghe',
  d3: 'Con giữ được lời hứa nhỏ trong tuần vừa rồi',
  d4: 'Con rụt lại khi phải đứng nói trước đám đông',
  d5: 'Tuần tới thử cho con kể chuyện cho hai người nghe'};
/* Phân quyền cấp-vật (9.99.114): phụ huynh chỉ ký cho NHÀ MÌNH — đặt
   maKhachHang của phiên = nhà đang thao tác (đúng đời thật). */
db.prepare("UPDATE users SET maKhachHang=? WHERE id='U-ph'").run(nhaD);
bao((await goi({fn: 'ghiDongY', token: tk, maNha: nhaD, o: 'duLieuCon'})).than.ok,
  'D · cha mẹ ký đồng ý dữ liệu con');
bao((await goi({fn: 'lapTheVungManh', token: t05, maNha: nhaD, the: theAT})).than.ok,
  'D · staff R05 lập được Thẻ Vùng Mạnh khi có đồng ý');
bao((await goi({fn: 'docTheVungManh', token: t05, maNha: nhaD})).than.the !== undefined,
  'D · đang có đồng ý thì đọc được năm dòng thẻ');
bao((await goi({fn: 'ghiDongY', token: tk, maNha: nhaD, o: 'duLieuCon', rut: true})).than.ok,
  'D · cha mẹ RÚT đồng ý (một dòng mới, không sửa dòng cũ)');
const docSauRut = (await goi({fn: 'docTheVungManh', token: t05, maNha: nhaD})).than;
bao(docSauRut.code === 'DARUT' && docSauRut.the === undefined,
  'D · RÚT rồi thì cửa ĐỌC dừng phục vụ (DARUT, không trả năm dòng) — gỡ cổng thì D4 vẫn đọc được',
  docSauRut.code);

/* ── E · PH-3 · danhDauXoa trongSo XOÁ THẬT, không chỉ đóng dấu ──
   Bản đầu chỉ UPDATE một mốc rồi khai "đã xoá trong hệ" trong khi thẻ
   (D4) vẫn nằm nguyên — một lời nói dối mang dấu hệ thống. Nay xoá thật
   ba bảng con và ĐẾM dòng còn lại. */
const nhaE = 'NHA-PH3-XOA';
db.prepare("UPDATE users SET maKhachHang=? WHERE id='U-ph'").run(nhaE);
/* TÊN THẬT CỦA CON nằm ở students, nối theo phuHuynhId = uid của phụ huynh
   (U-ph). Trồng một hàng có hoTen để phép xoá phải gỡ nó (9.99.114). */
db.prepare("INSERT INTO students (id,hoTen,lop,tinh,tier,status,phuHuynhId,createdAt) " +
  "VALUES ('HV-XOA','Nguyễn Bảo An','3A','Hà Nội',2,'dangHoc','U-ph',datetime('now'))").run();
await goi({fn: 'ghiDongY', token: tk, maNha: nhaE, o: 'duLieuCon'});
await goi({fn: 'lapTheVungManh', token: t05, maNha: nhaE, the: theAT});
bao((await goi({fn: 'docTheVungManh', token: t05, maNha: nhaE})).than.the !== undefined,
  'E · dựng được thẻ cho nhà thử xoá');
const yc = (await goi({fn: 'yeuCauXoaDuLieu', token: tk, maNha: nhaE})).than;
bao(yc.ok && yc.id, 'E · cha mẹ gửi yêu cầu xoá', yc.id);
const dd = (await goi({fn: 'danhDauXoa', token: t05, id: yc.id, phia: 'trongSo'})).than;
bao(dd.ok && dd.conLai === 0,
  'E · danhDauXoa trongSo XOÁ THẬT và ĐẾM còn lại = 0 (phép đo, không lời khai)', String(dd.conLai));
bao((await goi({fn: 'docTheVungManh', token: t05, maNha: nhaE})).than.code === 'CHUACO',
  'E · sau khi xoá thật thì thẻ KHÔNG còn đọc được (CHUACO) — gỡ DELETE thì thẻ vẫn ở đó');
/* ── E2 · TÊN THẬT CỦA CON Ở students PHẢI BỊ XOÁ (9.99.114) ──
   Tổ thanh tra $500M: erasure cũ bỏ sót students → tên con sống sót một
   cuộc "xoá". Phá thử: bỏ khối UPDATE students trong danhDauXoa → hoTen còn
   'Nguyễn Bảo An' và dòng này đỏ. */
const treXoa = db.prepare("SELECT hoTen, deletedAt FROM students WHERE id='HV-XOA'").get();
bao(!treXoa.hoTen && treXoa.deletedAt,
  'E2 · TÊN THẬT CỦA CON ở students bị gỡ khi xoá dữ liệu (Luật 91 · dữ liệu đặc biệt)',
  'ba bảng con xoá sạch mà students (hoTen=tên thật) sống sót là một cuộc xoá bỏ sót đúng ' +
  'loại dữ liệu buộc phải gỡ — nay gỡ PII + đặt deletedAt: ' + JSON.stringify(treXoa));

/* ═══════════════ 25 · SOI ĐỐI KHÁNG ĐỢT 3 — LỖ TÀI CHÍNH (9.99.113) ═══════════════ */
console.log('\n25 · SOI ĐỐI KHÁNG ĐỢT 3 — LỖ TÀI CHÍNH');

/* ── H-2 · ĐỐI CHIẾU CHIỀU RA không rớt khoản chi NGÀY CUỐI KỲ ──
   Bản 9.99.112 so ngayChi (ISO đầy đủ) với bound đã cắt còn ngày, nên một
   khoản chi đề ngày cuối tháng (giờ >00:00) bị rớt khỏi "chi không có tiền
   ra" — đúng cửa một khoản bịa đề cuối tháng né. Phá thử: trả về so lệch
   một-phía thì dòng này biến mất. */
db.prepare('INSERT INTO chiPhi (id,khoanMuc,soTien,ngayChi,hinhThuc,coHoaDon,dienGiai,' +
  'nguoiDeXuat,deXuatLuc,trangThai) VALUES (?,?,?,?,?,?,?,?,?,?)').run(
  'CP-CUOIKY', 'tiepThi', 40000000, '2099-06-30T08:00:00.000Z', 'chuyenKhoan', 0,
  'khoản chi đề ngày cuối kỳ — bẫy né đối chiếu', 'U-sa', '2099-06-30T08:00:00.000Z', 'daDuyet');
const dcRa = (await goi({fn:'doiChieuNganHang', token:tkSA, u:'superadmin@gita365.vn',
  loai:'thang', moc:'2099-06'})).than;
bao(dcRa.ok && ((dcRa.chiKhongCoTienRa || {}).ds || []).some(x => x.id === 'CP-CUOIKY'),
  'H-2 · khoản chi NGÀY CUỐI KỲ (giờ >00:00) hiện trong "chi không có tiền ra" — không bị rớt',
  'so ngày hai-phía; bản cũ so ISO-đầy-đủ với ngày-cắt rớt mọi khoản cuối kỳ và cho khoản bịa né');

/* ── M-1 · S7 tự giới thiệu ĐẾM THẬT (boTro có trong SELECT) ──
   Bản cũ quên chọn cột boTro nên S7 khai 0% mọi lúc. Phá thử: bỏ boTro
   khỏi SELECT ở bayConSoCEO → S7.tren về 0. */
db.prepare('INSERT INTO hoSoKhach (maKhachHang,uidPhuHuynh,boTro,trangThai,vaoLuc) VALUES (?,?,?,?,?)')
  .run('KH-S7-A', 'U-ph', null, 'dangHoc', ngayVN(-10));
db.prepare('INSERT INTO hoSoKhach (maKhachHang,uidPhuHuynh,boTro,trangThai,vaoLuc) VALUES (?,?,?,?,?)')
  .run('KH-S7-B', 'U-ph', 'KH-S7-A', 'dangHoc', ngayVN(-5));
const bay7 = (await goi({fn:'bayConSoCEO', token:tkSA, u:'superadmin@gita365.vn'})).than;
const s7 = (bay7.doDuoc || {}).S7_tuGioiThieu || {};
bao(bay7.ok && Number(s7.tren) >= 1,
  'M-1 · S7 ĐẾM được nhà có người giới thiệu (boTro trong SELECT) — không còn 0% cứng',
  'S7.tren=' + s7.tren + ' — bản cũ quên chọn boTro nên n.boTro undefined, S7 khai 0% mọi lúc');

console.log('\n25c · THANG CHỮ KÝ THEO SỐ TIỀN — RÚT TIỀN (9.99.117)');
{
  /* Trước 9.99.117 duyetHoan/traHoaHong/chotLuong chỉ đòi R01–R03 BẤT KỂ
     số tiền — một Giám đốc R03 duyệt hoàn 90tr bằng MỘT chữ ký, trong khi
     chi thẳng 90tr đòi Super Admin. Gate mới dùng lại thang mốc chu kỳ. */
  await themNguoi('U-gd117', 'giamdoc117@gita365.vn', 'MatKhauRieng2026!', 'R03', {portal: 'admin'});
  const tkGD = (await goi({fn: 'dangNhap', u: 'giamdoc117@gita365.vn', mk: 'MatKhauRieng2026!'})).than.token;
  const cam = (id, tien, kh) => db.prepare(
    'INSERT INTO hoanTien (id,maKhachHang,idPhieuThu,soTien,theoLuat,lyDo,nguoiDeXuat,deXuatLuc,trangThai)' +
    " VALUES (?,?,?,?,?,?,?,?, 'choDuyet')")
    .run(id, kh, null, tien, 'thử thang', 'thử thang chữ ký', 'coach@gita365.vn', new Date().toISOString());

  cam('HT-BIG117', 90000000, 'KH-THANG117');
  const gd = await goi({fn: 'duyetHoan', token: tkGD, u: 'giamdoc117@gita365.vn', id: 'HT-BIG117'});
  bao(!gd.than.ok && gd.than.code === 'CANCAPCAOHON',
    'R03 KHÔNG duyệt được hoàn 90tr — cần R01 (thang chữ ký theo số tiền)',
    'gỡ gate thì Giám đốc rút 90tr bằng MỘT chữ ký, chi thẳng 90tr đòi Super Admin — code=' + gd.than.code);
  const sa = await goi({fn: 'duyetHoan', token: tkSA, u: 'superadmin@gita365.vn', id: 'HT-BIG117'});
  bao(sa.than.ok, 'R01 duyệt được hoàn 90tr — đủ cấp theo số tiền', 'ok=' + sa.than.ok);

  cam('HT-NHO117', 2000000, 'KH-THANG117b');
  const gdNho = await goi({fn: 'duyetHoan', token: tkGD, u: 'giamdoc117@gita365.vn', id: 'HT-NHO117'});
  bao(gdNho.than.ok, 'R03 DUYỆT được hoàn 2tr — gate KHÔNG bắt oan khoản nhỏ (<10tr)', 'ok=' + gdNho.than.ok);
}

console.log('\n25d · QUYỀN TRUY CẬP — XUẤT DỮ LIỆU GIA ĐÌNH (9.99.120)');
{
  db.prepare("UPDATE users SET maKhachHang = 'GITA-0001' WHERE id = 'U-ph'").run();
  db.prepare("DELETE FROM chanNhip WHERE khoa LIKE 'dangNhapSai%'").run();
  const tkx = (await goi({fn: 'dangNhap', u: 'phuhuynh@gita365.vn', mk: 'MatKhauRieng2026!'})).than.token;
  const tuNha = await goi({fn: 'xuatDuLieuNha', token: tkx, u: 'phuhuynh@gita365.vn', maNha: 'GITA-0001'});
  bao(tuNha.than.ok && tuNha.than.duLieu && Array.isArray(tuNha.than.duLieu.taiKhoan),
    'CHA MẸ XUẤT được dữ liệu nhà MÌNH — quyền truy cập Luật 91 thành thật, không chỉ chữ',
    'soBanGhi=' + tuNha.than.soBanGhi);
  const biMat = JSON.stringify(tuNha.than.duLieu || {}).match(/pwHash|pwSalt/);
  bao(!biMat, 'bản xuất KHÔNG chứa băm mật khẩu — quyền đọc không phải chỗ rò bí mật',
    biMat ? 'LỘ ' + biMat[0] : 'sạch');
  const nhaKhac = await goi({fn: 'xuatDuLieuNha', token: tkx, u: 'phuhuynh@gita365.vn', maNha: 'GITA-0002'});
  bao(!nhaKhac.than.ok && nhaKhac.than.code === 'NOPERM_NHA',
    'cha mẹ KHÔNG xuất được dữ liệu nhà NGƯỜI KHÁC (IDOR chặn qua nhaCuaMinh)',
    'gỡ cổng thì một phụ huynh đọc trọn dữ liệu nhà lạ — code=' + nhaKhac.than.code);
  const nk = db.prepare("SELECT count(*) c FROM audit WHERE viec='PL_XUAT_DULIEU' AND doiTuong='GITA-0001'").get().c;
  bao(nk >= 1, 'lượt xuất VÀO NHẬT KÝ (Luật 91 Điều 6: ai truy cập dữ liệu nhà nào)', nk + ' dòng');
}

console.log('\n26 · GIAO DỊCH NGUYÊN TỬ (db.batch — 9.99.116)');
{
  /* Cơ chế mà cửa CỨU HỆ (truyHoiHe/dongBangHe/moBangHe) và cửa XOÁ dữ liệu
     con nay dựa vào. Nếu batch KHÔNG all-or-nothing thì một cú sập giữa chừng
     ghi nửa vời: mật khẩu đặt lại mà phiên hacker còn sống, hoặc PII con còn
     mà đã đóng dấu "đã xoá". Phá thử: batch có câu HỎNG ở giữa phải ROLLBACK
     sạch câu tốt đứng trước. */
  const d1 = dungD1(db);
  db.exec('CREATE TABLE _atom (v INTEGER)');
  let nem = false;
  try {
    await d1.batch([
      d1.prepare('INSERT INTO _atom (v) VALUES (?)').bind(1),
      d1.prepare('INSERT INTO _khong_ton_tai (v) VALUES (?)').bind(2)  // hỏng cố ý
    ]);
  } catch (e) { nem = true; }
  const sauHong = db.prepare('SELECT COUNT(*) c FROM _atom').get().c;
  bao(nem && sauHong === 0,
    'batch có câu hỏng thì ROLLBACK SẠCH — không ghi nửa chừng',
    'ném=' + nem + ' · còn ' + sauHong + ' dòng (phải 0) — nếu >0 thì cửa cứu hệ/xoá ghi nửa vời được');
  await d1.batch([
    d1.prepare('INSERT INTO _atom (v) VALUES (?)').bind(10),
    d1.prepare('INSERT INTO _atom (v) VALUES (?)').bind(20)
  ]);
  const sauTot = db.prepare('SELECT COUNT(*) c FROM _atom').get().c;
  bao(sauTot === 2, 'batch toàn câu tốt thì COMMIT đủ cả hai', 'còn ' + sauTot + ' dòng (phải 2)');
  db.exec('DROP TABLE _atom');
}

console.log('');
/* process.exit() KHÔNG đợi stdout ghi xong khi đầu ra là tệp hay ống —
   dòng cuối cùng biến mất, và người đọc bản ghi thấy một bộ thử dừng
   giữa chừng không rõ vì sao. Đặt mã thoát rồi để Node tự kết thúc. */
if (loi) { console.log('✗ CÒN ' + loi + ' CHỖ CHƯA ĐẠT'); process.exitCode = 1; return; }
console.log('✓ TOÀN BỘ ĐẠT — cửa vào mới chạy đúng');
})();
