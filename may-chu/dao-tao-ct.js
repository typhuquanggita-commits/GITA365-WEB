/* ═══════════════════════════════════════════════════════════════
   GITA 365 — CHƯƠNG TRÌNH ĐÀO TẠO: TƯ VẤN · NHÂN SỰ · COACH

   Bản chép của G.DTC_CT (src/dao-tao-ct.js). tools/thu-dao-tao-ct.mjs
   đối chiếu hai bản từng bước một — lệch một ô là đỏ.

   ══ VÌ SAO CẦN PHẦN NÀY ══

   Kho đã có nội dung học (khoá 30 bài, sổ tay tư vấn, nghề coach, kho
   nghề, sát hạch 348 câu, ba cửa con người). Thứ chưa có là SỔ: ai đang
   học chương trình nào, tới bước nào, ai chấm, và ai ký chứng nhận. Tiến
   độ cũ chỉ nằm trong bản đồng bộ của từng máy — tức là người học tự
   ghi, tự giữ, và không ai kiểm lại được.

   ══ BA LOẠI BƯỚC, KHÔNG GỘP ══

   | loại      | ai đánh dấu          | là gì                          |
   |-----------|----------------------|--------------------------------|
   | tuHoc     | chính người học      | LỜI KHAI, kèm một câu bắt buộc |
   | nguoiCham | người chấm ≠ người học | điểm 0–100, kèm nhận xét     |
   | mayCham   | không ai — máy đọc   | đọc thẳng sổ ba cửa            |

   Trình ba loại như nhau thì người duyệt thấy mười dấu tick rồi thôi
   không đọc — mà bước nặng nhất (người kèm nghe một cuộc thật) lại nằm
   giữa sáu bước tự khai. Nên mỗi bước khai đúng một loại, và cửa đọc
   trả loại về cùng trạng thái.

   ══ SÁT HẠCH LÀ BƯỚC NGƯỜI CHẤM, KHÔNG PHẢI BƯỚC MÁY CHẤM ══

   Điểm sát hạch nằm ở bản đồng bộ của máy khách — người học tự ghi lên.
   Máy chủ đọc nó rồi gọi là "máy chấm" thì một lời khai mặc áo phép đo.
   Người chấm cũng không có bản bài trên máy chủ để xem lại, nên bước này
   ghi rõ: làm TRƯỚC MẶT người chấm, và người chấm ghi điểm mình thấy.

   ══ BA CHƯƠNG TRÌNH ĐỘC LẬP ══

   Xếp Tư vấn → Nhân sự → Coach là thứ tự TRÌNH BÀY, không phải điều
   kiện: không chương trình nào đòi chứng nhận của chương trình khác, và
   chứng nhận chưa mở quyền gì. Nối chứng nhận vào quyền (vd chạm khách)
   là quyết định của chủ hệ — không tự dựng ở đây.

   ══ GHI DANH THEO VAI CHÍNH ══

   Mỗi chương trình chỉ nhận vai mà mọi bài của nó MỞ được với vai ấy
   (bộ thử đối chiếu G.PERM). Ghi danh một vai không mở được bài thì
   người học tự khai "đã học" một bài họ không đọc được.

   ══ KHÔNG CÓ CỘT "ĐÃ ĐỦ" ══

   Đủ điều kiện hay chưa tính LÚC ĐỌC từ sổ bước. Chứng chỉ là một HÀNH
   ĐỘNG có chữ ký (dtChungChi), không phải một cột tự bật. Cùng luật cột
   `conHan` (9.99.63) · `den` (9.99.66) · ba cửa (9.99.69).
   ═══════════════════════════════════════════════════════════════ */

import { Kho } from './nen.js';

const BAC = { R01: 1, R02: 2, R03: 3, R04: 4, R05: 5, R06: 6, R07: 7, R08: 8,
  R09: 9, R10: 10, R11: 11, R12: 12 };

/* ═══════════════ BẢN CHÉP CỦA G.DTC_CT ═══════════════
   nguoiCham / capChungChi: bậc cao nhất (số nhỏ nhất là cao) được làm. */
export const CT = [
  { ma: 'tuvan', ten: 'Tư vấn viên', vaiChinh: ['R11'], chamToi: 4, capToi: 3, buoc: [
    { ma: 'TV01', loai: 'tuHoc', man: 'bo-nao', ten: 'Hiến pháp 13 điều và hàng rào 10 điểm' },
    { ma: 'TV02', loai: 'tuHoc', man: 'phap-ly-rui-ro', ten: 'Điều 13 và quyền dữ liệu của gia đình' },
    { ma: 'TV03', loai: 'tuHoc', man: 'so-tay-tu-van', ten: 'Sổ tay tư vấn' },
    { ma: 'TV04', loai: 'tuHoc', man: 'nghe-tu-van', ten: 'Nghề tư vấn: hành trình khách qua năm tầng' },
    { ma: 'TV05', loai: 'tuHoc', man: 'kich-ban', ten: 'Kịch bản và cách đáp phản đối' },
    { ma: 'TV06', loai: 'tuHoc', man: 'kn-tuvan', ten: 'Kho nghề tư vấn' },
    { ma: 'TV07', loai: 'nguoiCham', man: 'kich-ban', nguong: 80, ten: 'Đóng vai một cuộc tư vấn đầu, có người kèm nghe' },
    { ma: 'TV08', loai: 'nguoiCham', man: 'sat-hach', nguong: 70, ten: 'Sát hạch vai tư vấn, làm trước mặt người chấm' },
    { ma: 'TV09', loai: 'mayCham', man: 'con-nguoi', cua: ['C1', 'C2', 'C3'], ten: 'Ba cửa con người' }
  ] },
  { ma: 'nhansu', ten: 'Nhập môn nhân sự', vaiChinh: ['R01', 'R02', 'R03', 'R04', 'R05', 'R06',
    'R07', 'R08', 'R09', 'R10', 'R11', 'R12'], chamToi: 6, capToi: 3, buoc: [
    { ma: 'NS01', loai: 'tuHoc', man: 'luat-lam-viec', ten: 'Luật làm việc' },
    { ma: 'NS02', loai: 'tuHoc', man: 'phap-ly-rui-ro', ten: 'Bảo mật và Điều 13' },
    { ma: 'NS03', loai: 'tuHoc', man: 'luat-giao-dien', ten: 'Mười hai lời hứa với gia đình' },
    { ma: 'NS04', loai: 'tuHoc', man: 'bang-viec', ten: 'Bàn làm việc và đầu việc' },
    { ma: 'NS05', loai: 'tuHoc', man: 'bo-nao', ten: 'Hiến pháp 13 điều và hàng rào 10 điểm' },
    { ma: 'NS06', loai: 'tuHoc', man: 'khoa-dao-tao', ten: 'Khoá đào tạo 30 bài: Học · Làm · Nộp' },
    { ma: 'NS07', loai: 'nguoiCham', man: 'bang-viec', nguong: 70, ten: 'Buổi kèm việc đầu tiên với người quản lý' },
    { ma: 'NS08', loai: 'mayCham', man: 'con-nguoi', cua: ['C1'], ten: 'Cửa 1 · Hiến pháp 13 trên 13' }
  ] },
  { ma: 'coach', ten: 'Coach', vaiChinh: ['R05', 'R06', 'R07', 'R08'], chamToi: 6, capToi: 5, buoc: [
    { ma: 'CO01', loai: 'tuHoc', man: 'coach-ct', ten: 'Hệ điều hành Coach: chương trình' },
    { ma: 'CO02', loai: 'tuHoc', man: 'coach-5-tang', ten: 'Năm tầng đồng hành' },
    { ma: 'CO03', loai: 'tuHoc', man: 'nghe-coach', ten: 'Nghề coach' },
    { ma: 'CO04', loai: 'tuHoc', man: 'kn-coach', ten: 'Kho nghề coach' },
    { ma: 'CO05', loai: 'tuHoc', man: 'dao-tao-dh', ten: 'Đào tạo đồng hành 40 giờ' },
    { ma: 'CO06', loai: 'tuHoc', man: 'coach-kh', ten: 'Coach khách hàng và Thẻ Vùng Mạnh' },
    { ma: 'CO07', loai: 'nguoiCham', man: 'coach-kh', nguong: 80, ten: 'Ba buổi coach có người kèm' },
    { ma: 'CO08', loai: 'nguoiCham', man: 'sat-hach', nguong: 70, ten: 'Sát hạch vai coach, làm trước mặt người chấm' },
    { ma: 'CO09', loai: 'mayCham', man: 'con-nguoi', cua: ['C1', 'C2', 'C3'], ten: 'Ba cửa con người' }
  ] }
];

export const LOAI = ['tuHoc', 'nguoiCham', 'mayCham'];
/* Câu bắt buộc khi tự đánh dấu và khi chấm. Tick không câu nào thì một
   bước "đã học" không khác gì một bước đã lướt qua. */
export const CAU_TOI_THIEU = 20;
/* Cột KHÔNG được có trong ba bảng — phép đo về thứ không được tồn tại. */
export const COT_CAM = ['daDu', 'duDieuKien', 'daXong', 'tienDo', 'soBuocXong'];

const ct = ma => CT.find(c => c.ma === ma) || null;
const vaiNV = hoSo => BAC[String((hoSo || {}).role || '')] || 0;
const lamCau = s => String(s || '').trim();

/* Định danh chính tắc: quy id · tên · email về username viết thường.
   So bằng chuỗi thô một vế thì email của chính mình lọt cổng
   "người chấm khác người học" — đúng lỗ 9.99.112. Không tra được thì
   trả null, nơi gọi ĐÓNG. */
async function tenChinh(db, raw) {
  const uid = await Kho.layUid(db, raw);
  if (!uid) return null;
  const nd = await Kho.nguoiTheoId(db, uid);
  if (!nd || !Number(nd.active) || nd.deletedAt) return null;
  return { uid, ten: String(nd.username || '').toLowerCase(), email: String(nd.email || '').toLowerCase(), role: nd.role };
}

/* Sổ ba cửa ghi tên đúng như người ta gõ (hoa/thường, đôi khi là email),
   còn ở đây tên đã quy về chữ thường — so khớp chính xác thì một người
   viết hoa tên đăng nhập không bao giờ qua được bước máy đọc. So không
   phân biệt hoa thường, nhận cả tên lẫn email. Trạng thái mỗi cửa = dòng
   cuối (rowid phá hoà), cùng luật con-nguoi.js. */
async function docBaCuaCua(db, ai) {
  const r = await db.prepare('SELECT cua, nguon FROM baCuaConNguoi WHERE lower(maNguoi) IN (?, ?)' +
    ' ORDER BY ghiLuc ASC, rowid ASC').bind(ai.ten, ai.email || ai.ten).all();
  const theoCua = {};
  (r.results || []).forEach(d => { theoCua[d.cua] = d; });
  return { theoCua };
}
const hopVai = (c, ai) => !!BAC[ai.role] && c.vaiChinh.indexOf(ai.role) >= 0;

async function docTrangThai(db, ai, c) {
  const maNguoi = ai.ten;
  const gd = await db.prepare('SELECT ghiLuc FROM dtGhiDanh WHERE maNguoi = ? AND ct = ? ORDER BY ghiLuc ASC, rowid ASC')
    .bind(maNguoi, c.ma).all();
  const ghiDanh = (gd.results || [])[0] || null;
  const r = await db.prepare('SELECT buoc, loai, boiAi, diem, ghiChu, ghiLuc FROM dtBuoc' +
    ' WHERE maNguoi = ? AND ct = ? ORDER BY ghiLuc ASC, rowid ASC').bind(maNguoi, c.ma).all();
  const cuoi = {};
  (r.results || []).forEach(d => { cuoi[d.buoc] = d; });

  let baCua = null;
  if (c.buoc.some(b => b.loai === 'mayCham')) baCua = await docBaCuaCua(db, ai);

  const buoc = c.buoc.map(b => {
    const o = { ma: b.ma, ten: b.ten, loai: b.loai, man: b.man };
    if (b.loai === 'mayCham') {
      const thieu = b.cua.filter(k => !baCua.theoCua[k]);
      o.xong = thieu.length === 0;
      o.thieuCua = thieu;
      /* Khai hộ là LỜI KHAI — vẫn tính đủ cửa theo luật ba cửa, nhưng nói ra. */
      o.coKhaiCu = b.cua.some(k => baCua.theoCua[k] && baCua.theoCua[k].nguon === 'khaiCu');
      return o;
    }
    const d = cuoi[b.ma];
    if (b.loai === 'tuHoc') {
      o.xong = !!d;
      if (d) { o.cau = d.ghiChu; o.luc = d.ghiLuc; }
      return o;
    }
    o.nguong = b.nguong;
    if (d) { o.diem = Number(d.diem); o.boiAi = d.boiAi; o.nhanXet = d.ghiChu; o.luc = d.ghiLuc; }
    o.xong = !!d && Number(d.diem) >= b.nguong;
    return o;
  });

  const cc = await db.prepare('SELECT loai, boiAi, ghiChu, ghiLuc FROM dtChungChi WHERE maNguoi = ? AND ct = ?' +
    ' ORDER BY ghiLuc ASC, rowid ASC').bind(maNguoi, c.ma).all();
  const ccCuoi = (cc.results || []).slice(-1)[0] || null;
  const thieu = buoc.filter(b => !b.xong).map(b => b.ma);
  /* Đếm RIÊNG từng loại. Một phân số chung "6/9 bước" gộp sáu lời khai với
     ba bước được chấm — đọc ra như đã đi hai phần ba trong khi chưa ai chấm gì. */
  const theoLoai = {};
  LOAI.forEach(l => { const ds = buoc.filter(b => b.loai === l); theoLoai[l] = { xong: ds.filter(b => b.xong).length, tong: ds.length }; });
  return { ct: c.ma, ten: c.ten, ghiDanh: !!ghiDanh, ghiDanhLuc: ghiDanh && ghiDanh.ghiLuc, buoc,
    theoLoai, thieu, duDieuKien: thieu.length === 0,
    chungChi: ccCuoi && ccCuoi.loai === 'cap' ? { boiAi: ccCuoi.boiAi, luc: ccCuoi.ghiLuc } : undefined,
    nguoiCham: [...new Set(buoc.filter(b => b.loai === 'nguoiCham' && b.boiAi).map(b => b.boiAi))],
    daThuHoi: ccCuoi && ccCuoi.loai === 'thuHoi' ? { boiAi: ccCuoi.boiAi, luc: ccCuoi.ghiLuc, lyDo: ccCuoi.ghiChu } : undefined };
}

/* ═══════════════ CỬA ═══════════════ */

/* Đọc: chính mình luôn được; người khác thì từ bậc người chấm trở lên
   (R01–R06) — người kèm phải thấy được tiến độ của người mình kèm. */
export async function docDaoTao(y, env, db, hoSo) {
  const lv = vaiNV(hoSo);
  if (!lv) return { ok: false, code: 'NOPERM', error: 'Chương trình đào tạo mở cho nhân sự R01–R12.' };
  const ai = await tenChinh(db, (y || {}).maNguoi || hoSo.u);
  if (!ai) return { ok: false, code: 'KHONGNGUOI', error: 'Không tra được tài khoản này.' };
  const minh = await tenChinh(db, hoSo.u);
  if (!minh || (minh.uid !== ai.uid && lv > 6))
    return { ok: false, code: 'NOPERM', error: 'Chỉ người kèm (R01–R06) xem được tiến độ của người khác.' };
  if (!BAC[ai.role]) return { ok: false, code: 'NOPERM', error: 'Chỉ xem được tiến độ của nhân sự R01–R12.' };
  const ds = [];
  for (const c of CT) ds.push(await docTrangThai(db, ai, c));
  return { ok: true, maNguoi: ai.ten, vai: ai.role, ct: ds };
}

export async function ghiDanhDaoTao(y, env, db, hoSo) {
  const lv = vaiNV(hoSo);
  if (!lv) return { ok: false, code: 'NOPERM', error: 'Chương trình đào tạo mở cho nhân sự R01–R12.' };
  const c = ct((y || {}).ct);
  if (!c) return { ok: false, code: 'SAI', error: 'Không có chương trình này.' };
  const ai = await tenChinh(db, (y || {}).maNguoi || hoSo.u);
  const minh = await tenChinh(db, hoSo.u);
  if (!ai || !minh) return { ok: false, code: 'KHONGNGUOI', error: 'Không tra được tài khoản.' };
  if (ai.uid !== minh.uid && lv > 6)
    return { ok: false, code: 'NOPERM', error: 'Ghi danh cho người khác cần bậc R01–R06.' };
  if (!hopVai(c, ai)) return { ok: false, code: 'NGOAIVAI',
    error: 'Chương trình ' + c.ten + ' dành cho vai ' + c.vaiChinh.join(' · ') + '. Vai ' + ai.role + ' chưa mở được hết bài của chương trình này.' };
  const co = await db.prepare('SELECT 1 FROM dtGhiDanh WHERE maNguoi = ? AND ct = ?').bind(ai.ten, c.ma).first();
  if (co) return { ok: true, daCo: true };
  await db.prepare('INSERT INTO dtGhiDanh (id, maNguoi, ct, boiAi, ghiLuc) VALUES (?,?,?,?,?)')
    .bind(crypto.randomUUID(), ai.ten, c.ma, minh.ten, new Date().toISOString()).run();
  return { ok: true };
}

export async function ghiBuocDaoTao(y, env, db, hoSo) {
  const lv = vaiNV(hoSo);
  if (!lv) return { ok: false, code: 'NOPERM', error: 'Chương trình đào tạo mở cho nhân sự R01–R12.' };
  y = y || {};
  const c = ct(y.ct);
  const b = c && c.buoc.find(x => x.ma === y.buoc);
  if (!b) return { ok: false, code: 'SAI', error: 'Không có bước này.' };
  /* Máy đọc thẳng sổ ba cửa — không cửa nào ghi đè được nó từ đây. */
  if (b.loai === 'mayCham') return { ok: false, code: 'MAYCHAM',
    error: 'Bước này do máy đọc từ sổ ba cửa. Qua cửa ở màn Con người · Ba cửa.' };
  const ai = await tenChinh(db, y.maNguoi || hoSo.u);
  const minh = await tenChinh(db, hoSo.u);
  if (!ai || !minh) return { ok: false, code: 'KHONGNGUOI', error: 'Không tra được tài khoản.' };
  const gd = await db.prepare('SELECT 1 FROM dtGhiDanh WHERE maNguoi = ? AND ct = ?').bind(ai.ten, c.ma).first();
  if (!gd) return { ok: false, code: 'CHUAGHIDANH', error: 'Người này chưa ghi danh chương trình ' + c.ten + '.' };
  /* Vai có thể đổi sau khi ghi danh (vd chuyển sang tài khoản khách) — kiểm lại mỗi lượt ghi. */
  if (!hopVai(c, ai)) return { ok: false, code: 'NGOAIVAI', error: 'Vai hiện tại của người này không thuộc chương trình ' + c.ten + '.' };
  const cau = lamCau(y.ghiChu);

  if (b.loai === 'tuHoc') {
    if (ai.uid !== minh.uid) return { ok: false, code: 'TUHOC',
      error: 'Bước tự học do chính người học đánh dấu. Người khác không đánh dấu hộ.' };
    if (cau.length < CAU_TOI_THIEU) return { ok: false, code: 'THIEUCAU',
      error: 'Viết một câu (từ ' + CAU_TOI_THIEU + ' ký tự): sau bài này bạn sẽ làm gì khác.' };
    await db.prepare('INSERT INTO dtBuoc (id, maNguoi, ct, buoc, loai, boiAi, diem, ghiChu, ghiLuc) VALUES (?,?,?,?,?,?,?,?,?)')
      .bind(crypto.randomUUID(), ai.ten, c.ma, b.ma, b.loai, minh.ten, null, cau, new Date().toISOString()).run();
    return { ok: true };
  }

  /* nguoiCham */
  if (ai.uid === minh.uid) return { ok: false, code: 'TUCHAM',
    error: 'Không tự chấm bước của chính mình. Người chấm phải là người khác.' };
  if (lv > c.chamToi) return { ok: false, code: 'NOPERM',
    error: 'Chấm bước này cần bậc R01–R' + String(c.chamToi).padStart(2, '0') + '.' };
  const diem = Number(y.diem);
  if (!Number.isInteger(diem) || diem < 0 || diem > 100)
    return { ok: false, code: 'SAI', error: 'Điểm là số nguyên 0–100.' };
  if (cau.length < CAU_TOI_THIEU) return { ok: false, code: 'THIEUCAU',
    error: 'Viết nhận xét (từ ' + CAU_TOI_THIEU + ' ký tự): người học đã làm được gì, còn thiếu gì.' };
  await db.prepare('INSERT INTO dtBuoc (id, maNguoi, ct, buoc, loai, boiAi, diem, ghiChu, ghiLuc) VALUES (?,?,?,?,?,?,?,?,?)')
    .bind(crypto.randomUUID(), ai.ten, c.ma, b.ma, b.loai, minh.ten, diem, cau, new Date().toISOString()).run();
  return { ok: true, dat: diem >= b.nguong };
}

export async function capChungChiDaoTao(y, env, db, hoSo) {
  const lv = vaiNV(hoSo);
  y = y || {};
  const c = ct(y.ct);
  if (!c) return { ok: false, code: 'SAI', error: 'Không có chương trình này.' };
  if (!lv || lv > c.capToi) return { ok: false, code: 'NOPERM',
    error: 'Ký chứng nhận ' + c.ten + ' cần bậc R01–R' + String(c.capToi).padStart(2, '0') + '.' };
  const ai = await tenChinh(db, y.maNguoi);
  const minh = await tenChinh(db, hoSo.u);
  if (!ai || !minh) return { ok: false, code: 'KHONGNGUOI', error: 'Không tra được tài khoản.' };
  if (ai.uid === minh.uid) return { ok: false, code: 'TUCAP', error: 'Không tự ký chứng nhận cho chính mình.' };
  if (!hopVai(c, ai)) return { ok: false, code: 'NGOAIVAI', error: 'Vai hiện tại của người này không thuộc chương trình ' + c.ten + '.' };
  const tt = await docTrangThai(db, ai, c);
  if (!tt.ghiDanh) return { ok: false, code: 'CHUAGHIDANH', error: 'Người này chưa ghi danh.' };
  if (tt.chungChi) return { ok: false, code: 'DACO', error: 'Chứng nhận này đang còn hiệu lực.' };
  /* Luật kiểm Ở MÁY CHỦ, lúc ký — không tin cờ nào máy khách gửi lên. */
  if (!tt.duDieuKien) return { ok: false, code: 'CHUADU', thieu: tt.thieu,
    error: 'Chưa đủ điều kiện. Còn thiếu: ' + tt.thieu.join(' · ') + '.' };
  /* Người ký phải khác người chấm: cùng một người chấm rồi tự ký thì phần
     duyệt chỉ là phần chấm nói lại lần nữa (luật L3, 9.99.72 · 9.99.77). */
  if (tt.nguoiCham.indexOf(minh.ten) >= 0) return { ok: false, code: 'CHAMVAKY',
    error: 'Bạn đã chấm một bước của người này. Người ký chứng nhận phải là người khác người chấm.' };
  await db.prepare('INSERT INTO dtChungChi (id, maNguoi, ct, loai, boiAi, ghiChu, ghiLuc) VALUES (?,?,?,?,?,?,?)')
    .bind(crypto.randomUUID(), ai.ten, c.ma, 'cap', minh.ten, lamCau(y.ghiChu) || null, new Date().toISOString()).run();
  return { ok: true };
}

export async function thuHoiChungChiDaoTao(y, env, db, hoSo) {
  const lv = vaiNV(hoSo);
  y = y || {};
  const c = ct(y.ct);
  if (!c) return { ok: false, code: 'SAI', error: 'Không có chương trình này.' };
  if (!lv || lv > c.capToi) return { ok: false, code: 'NOPERM', error: 'Thu hồi cần cùng bậc với người ký.' };
  const ai = await tenChinh(db, y.maNguoi);
  const minh = await tenChinh(db, hoSo.u);
  if (!ai || !minh) return { ok: false, code: 'KHONGNGUOI', error: 'Không tra được tài khoản.' };
  const lyDo = lamCau(y.lyDo);
  if (lyDo.length < CAU_TOI_THIEU) return { ok: false, code: 'THIEUCAU',
    error: 'Thu hồi phải viết lý do (từ ' + CAU_TOI_THIEU + ' ký tự).' };
  const tt = await docTrangThai(db, ai, c);
  if (!tt.chungChi) return { ok: false, code: 'KHONGCO', error: 'Không có chứng nhận đang hiệu lực để thu hồi.' };
  /* Không thu hồi chữ ký của người bậc cao hơn mình. */
  const nguoiKy = await tenChinh(db, tt.chungChi.boiAi);
  if (nguoiKy && BAC[nguoiKy.role] && lv > BAC[nguoiKy.role]) return { ok: false, code: 'NOPERM',
    error: 'Chứng nhận do ' + nguoiKy.role + ' ký — chỉ bậc ấy trở lên thu hồi được.' };
  await db.prepare('INSERT INTO dtChungChi (id, maNguoi, ct, loai, boiAi, ghiChu, ghiLuc) VALUES (?,?,?,?,?,?,?)')
    .bind(crypto.randomUUID(), ai.ten, c.ma, 'thuHoi', minh.ten, lyDo, new Date().toISOString()).run();
  return { ok: true };
}

/* Đội: người kèm (R01–R06) xem mọi người đã ghi danh một chương trình. */
export async function doiDaoTao(y, env, db, hoSo) {
  const lv = vaiNV(hoSo);
  if (!lv || lv > 6) return { ok: false, code: 'NOPERM', error: 'Xem đội cần bậc R01–R06.' };
  const c = ct((y || {}).ct);
  if (!c) return { ok: false, code: 'SAI', error: 'Không có chương trình này.' };
  const r = await db.prepare('SELECT maNguoi FROM dtGhiDanh WHERE ct = ? ORDER BY ghiLuc ASC, rowid ASC').bind(c.ma).all();
  const ds = [];
  for (const d of (r.results || [])) {
    const ai = (await tenChinh(db, d.maNguoi)) || { ten: d.maNguoi, email: '' };
    const tt = await docTrangThai(db, ai, c);
    ds.push({ maNguoi: d.maNguoi, theoLoai: tt.theoLoai, thieu: tt.thieu,
      duDieuKien: tt.duDieuKien, coChungChi: !!tt.chungChi });
  }
  return { ok: true, ct: c.ma, ds };
}
