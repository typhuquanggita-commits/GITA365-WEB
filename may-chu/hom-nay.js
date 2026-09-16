/* ═══════════════════════════════════════════════════════════════
   GITA 365 — HÔM NAY · NHÀ MÌNH

   Chủ hệ chốt LGD-01: bốn tab của MỤC C là mấy màn THÊM vào cổng phụ
   huynh đã có. Chốt ấy gỡ năm luật giao diện khỏi chỗ treo — L03 Chế
   độ Bão · L06 Ghim của con · L07 Phủ quyết ảnh con · L11 Không hỏi
   vặn · L12 Đường thoát nay có bề mặt để cắm răng.

   ══ MÔ-ĐUN NÀY LÀ CHỖ NĂM CÁI RĂNG ẤY SỐNG ══

   Răng ở MÁY CHỦ, không ở màn hình — luật đã chốt ở 9.99.74. Giao diện
   là thứ bị viết lại nhiều nhất trong mọi kho; một luật sống trong mã
   giao diện thì chết cùng lượt viết lại đầu tiên, và chết lặng lẽ vì
   bản mới trông vẫn đẹp.

   ══ BỐN CHỖ CỔNG CÓ HÌNH LẠ, VÀ CẢ BỐN ĐỀU CỐ Ý ══

   1. `batCheDoBao` KHÔNG NHẬN ô lý do — không phải "nhận rồi bỏ qua".
      Nhận rồi bỏ qua thì màn hình sau vẫn hỏi được, và cổng thành một
      lời chú giải.
   2. `boViecHomNay` NHẬN ô lý do nhưng KHÔNG BAO GIỜ ĐÒI. Khác nhau ở
      chỗ MỜI hay ÉP, và chỗ ấy là cả cái luật.
   3. `ghiGhimCon` so uid của PHIÊN với chủ ghim. Không đọc một ô
      `laCon` do người gọi truyền vào — một ô như thế là lời khai của
      chính người đi qua cổng.
   4. `chiaSeCoAnhCon` chặn khi CHƯA HỎI y như khi ĐÃ TỪ CHỐI, nhưng
      trả về HAI MÃ KHÁC NHAU. Gộp thì một nhà chưa ai hỏi tới nằm
      chung rổ với một đứa trẻ đã nói không.
   ═══════════════════════════════════════════════════════════════ */

import { Kho } from './nen.js';

/* ═══════════════ AI VÀO ĐƯỢC ═══════════════

   Màn này của GIA ĐÌNH. Người của Học viện xem được nhà mình phụ trách
   qua cửa khác; ở đây chỉ nhà ấy.

   ══ CHỖ NÀY ĐÃ SẬP MỘT LẦN, VÀ SẬP TRONG IM LẶNG ══

   Bản đầu viết `hoSo.maKhachHang`. Hồ sơ phiên KHÔNG CÓ ô ấy — nó có
   `uid`, `u`, `role`, `tier`, `studentId`, và mã khách hàng nằm ở HÀNG
   users chứ không ở hồ sơ phiên. JavaScript trả `undefined`, phép so
   luôn sai, và **cổng đóng với mọi người mà không báo gì cả**: cả bốn
   cửa trả NOPERM, màn hình hiện "chưa đọc được nhịp" mãi mãi, và không
   có một dòng lỗi nào để lần theo.

   Đây là LẦN THỨ TƯ cái bẫy này cắn kho — `hoSo.username` (9.99.55),
   `hoSo.vai` (9.99.62), và nay `hoSo.maKhachHang`. Bộ thử bắt được vì
   nó gọi cửa THẬT bằng một phiên THẬT, không đọc lời khai của mô-đun.

   Đọc từ hàng users, cùng đường `xemTepKhach` đã dùng từ lâu. */
async function laNhaMinh(db, hoSo, maNha) {
  const nha = String(maNha || '').trim();
  if (!nha) return false;
  const nd = await Kho.nguoiTheoId(db, (hoSo || {}).uid);
  return !!nd && String(nd.maKhachHang || '') === nha;
}

/* CHÍNH EM ẤY hay không — hỏi TÀI KHOẢN CỦA PHIÊN, không hỏi một ô do
   người gọi truyền vào. Một ô `laCon` truyền vào là lời khai của chính
   người đang đi qua cổng: nó bật được mà không chứng minh gì.

   ══ users.studentId MANG HAI NGHĨA, VÀ ĐÓ LÀ CHỖ CỔNG SUÝT THỦNG ══

   Bản đầu chỉ so `nd.studentId === maCon`. Bộ thử bắt ngay: CHA MẸ CŨNG
   QUA. `dang-ky.js` ghi `studentId = maHV` vào chính hàng của phụ huynh
   lúc đăng ký, nên cột ấy nói được hai câu khác hẳn nhau —

     tài khoản NÀY LÀ em ấy          (vai R14, cổng `hs`)
     tài khoản NÀY CÓ CON LÀ em ấy   (vai R13, cổng `ph`)

   Một cột mang hai nghĩa là một cột không trả lời được câu hỏi nào, và
   cổng đọc nó một mình thì mở cho cha mẹ — đúng thứ L06 và L07 sinh ra
   để chặn, và mở trong im lặng vì mọi thứ vẫn trông đúng.

   Nên hỏi CẢ HAI: đúng hồ sơ, VÀ tài khoản này là tài khoản của chính
   học viên. Vai đọc từ hàng users chứ không từ ô `role` của phiên —
   vai trong phiên đổi được sau khi mở phiên (nen.js dòng 21). */
const VAI_HOC_VIEN = 'R14';
async function laChinhEmAy(db, hoSo, maCon) {
  const ma = String(maCon || '').trim();
  if (!ma) return false;
  const nd = await Kho.nguoiTheoId(db, (hoSo || {}).uid);
  return !!nd && String(nd.studentId || '') === ma &&
    String(nd.role || '') === VAI_HOC_VIEN;
}

/* ═══════════════ L03 · CHẾ ĐỘ BÃO ═══════════════

   Bản đặc tả viết ba chữ: một chạm, không hỏi lý do, không hộp thoại
   xác nhận. Ba chữ ấy LÀ cả cái cổng.

   Hàm nhận đúng hai ô — mã nhà và bật/tắt. KHÔNG có ô lý do, KHÔNG có
   ô xác nhận, và mục 91 canh đúng chỗ ấy bằng phép đo về thứ không
   được tồn tại.

   Vì sao không nhận-rồi-bỏ-qua: một ô nhận vào là một ô màn hình hỏi
   được. Người viết màn sau thấy cửa có ô `lyDo` thì họ điền nó — họ
   không đọc chú giải, họ đọc chữ ký hàm. */
export async function batCheDoBao(y, env, db, hoSo) {
  const x = y || {};
  const maNha = String(x.maNha || '').trim();
  if (!(await laNhaMinh(db, hoSo, maNha))) return { ok: false, code: 'NOPERM',
    error: 'Chế độ Bão chỉ bật được cho chính nhà mình.' };

  const bat = x.bat !== false;
  const luc = new Date().toISOString();
  await db.prepare(
    'INSERT INTO cheDoBao (id,maNha,bat,boiAi,ghiLuc) VALUES (?,?,?,?,?)')
    .bind('CB-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6),
      maNha, bat ? 1 : 0, String(hoSo.u || ''), luc).run();

  await Kho.ghiNhatKy(db, { uid: hoSo.uid, username: hoSo.u,
    viec: bat ? 'NM_BAO_BAT' : 'NM_BAO_TAT', doiTuong: maNha });

  return { ok: true, bat, ghiLuc: luc,
    chuoiKhongDut: true,
    vi: bat
      ? 'Đã bật. Nhịp dừng lại, mọi nhắc tắt, và CHUỖI GIỮ NGUYÊN. Bão mà vẫn đứt ' +
        'chuỗi thì Chế độ Bão chỉ là một cái nút đổi màu — người ta sẽ không bấm nó, ' +
        'họ sẽ cố tick cho xong.'
      : 'Đã tắt. Nhịp chạy lại từ hôm nay.',
    khongHoiGi: 'Không hỏi vì sao, không khảo sát. Người bật đang ở giữa một chuyện ' +
      'khó, và hỏi họ vì sao là bắt họ kể lại nó cho một cái máy đúng lúc họ ít sức nhất.' };
}

export async function docCheDoBao(db, maNha) {
  const r = await db.prepare(
    /* Tiebreak rowid DESC: ghiLuc là chuỗi ISO mili-giây, hai lượt bật/tắt
       trong CÙNG mili-giây thì ORDER BY ghiLuc một mình chọn TÙY Ý — và
       ties resolve về dòng CŨ, tức latest-row-wins nói dối. Sổ chỉ thêm,
       không xoá, nên rowid tăng đơn điệu theo lượt ghi: nó là mốc phá hoà
       đúng đắn, không cần đổi lược đồ. Cùng lớp lỗi làm bộ kiểm đỏ chập
       chờn ở 9.99.112. */
    'SELECT bat, ghiLuc FROM cheDoBao WHERE maNha = ? ORDER BY ghiLuc DESC, rowid DESC LIMIT 1')
    .bind(String(maNha)).first();
  /* Tính LÚC ĐỌC từ dòng mới nhất, không giữ một cột "đang bão". Cùng
     luật với cột conHan không có trong theVungManh (9.99.63). */
  return { dangBao: !!(r && Number(r.bat) === 1), tuLuc: r ? r.ghiLuc : undefined };
}

/* ═══════════════ MỘT VIỆC HÔM NAY ═══════════════

   Trả về ĐÚNG MỘT việc lớn. Không trả một danh sách rồi để màn hình tự
   chọn cái đầu — màn hình chọn thì luật "một màn một việc" nằm ở màn
   hình, và nó chết cùng lượt viết lại đầu tiên. */
export async function docHomNay(y, env, db, hoSo) {
  const maNha = String((y || {}).maNha || '').trim();
  if (!(await laNhaMinh(db, hoSo, maNha))) return { ok: false, code: 'NOPERM',
    error: 'Chỉ đọc được màn Hôm nay của chính nhà mình.' };

  const bao = await docCheDoBao(db, maNha);
  if (bao.dangBao) return { ok: true, dangBao: true, tuLuc: bao.tuLuc,
    vi: 'Nhà mình đang ở Chế độ Bão. Không có việc nào hôm nay, và chuỗi vẫn giữ nguyên.' };

  const hom = new Date().toISOString().slice(0, 10);
  const r = await db.prepare(
    'SELECT * FROM nhipNha WHERE maNha = ? AND dong = 0 ORDER BY thuTu ASC')
    .bind(maNha).all();
  const ds = (r.results || r || []);

  const xong = await db.prepare(
    'SELECT maNhip, bo FROM nhipXong WHERE maNha = ? AND ngay = ?')
    .bind(maNha, hom).all();
  const daXong = {};
  ((xong.results || xong || [])).forEach(d => { daXong[d.maNhip] = d; });

  const conLai = ds.filter(d => !daXong[d.id]);

  return { ok: true, dangBao: false, ngay: hom,
    soNhip: ds.length,
    /* ĐÚNG MỘT việc, không phải một danh sách. */
    viecLon: conLai[0] ? { id: conLai[0].id, ten: conLai[0].ten, nangNe: !!conLai[0].nangNe }
      : undefined,
    conLai: Math.max(0, conLai.length - 1),
    xongHet: ds.length > 0 && conLai.length === 0,
    chuaCoNhip: ds.length === 0,
    vi: ds.length === 0
      ? 'Bảng vận hành của nhà mình còn trống. Bắt đầu bằng một nhịp thôi — bữa cơm tối.'
      : conLai.length === 0 ? 'Xong rồi. Cất máy đi.'
      : 'Một việc. Làm xong thì tick, rồi cất máy đi.' };
}

export async function tickNhip(y, env, db, hoSo) {
  const x = y || {};
  const maNha = String(x.maNha || '').trim();
  if (!(await laNhaMinh(db, hoSo, maNha))) return { ok: false, code: 'NOPERM',
    error: 'Chỉ tick được nhịp của chính nhà mình.' };
  return await ghiXong(db, hoSo, maNha, String(x.maNhip || '').trim(), 0, '');
}

/* ═══════════════ L11 · BỎ MỘT VIỆC — KHÔNG HỎI VẶN ═══════════════

   Hàm NHẬN ô lý do và KHÔNG BAO GIỜ ĐÒI nó. Khác nhau ở chỗ MỜI hay
   ÉP, và chỗ ấy là cả cái luật.

   Một ô lý do bắt buộc sau khi bỏ việc là một cái cửa quay: muốn đóng
   việc thì phải giải trình. Lần sau người ta không bỏ việc — họ bỏ app.

   Vẫn giữ ô ấy vì có người MUỐN nói, và câu họ tự viết là câu đáng giá
   nhất trong cả sổ. Thứ bị cấm là ĐÒI. */
export async function boViecHomNay(y, env, db, hoSo) {
  const x = y || {};
  const maNha = String(x.maNha || '').trim();
  if (!(await laNhaMinh(db, hoSo, maNha))) return { ok: false, code: 'NOPERM',
    error: 'Chỉ bỏ được việc của chính nhà mình.' };
  return await ghiXong(db, hoSo, maNha, String(x.maNhip || '').trim(), 1,
    String(x.lyDo || '').trim());
}

async function ghiXong(db, hoSo, maNha, maNhip, bo, lyDo) {
  if (!maNhip) return { ok: false, code: 'THIEUO', error: 'Thiếu mã nhịp.' };
  const hom = new Date().toISOString().slice(0, 10);
  await db.prepare(
    'INSERT INTO nhipXong (id,maNha,maNhip,ngay,bo,lyDo,boiAi,ghiLuc)' +
    ' VALUES (?,?,?,?,?,?,?,?) ON CONFLICT(maNha,maNhip,ngay) DO NOTHING')
    .bind('NX-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6),
      maNha, maNhip, hom, bo, lyDo || null, String(hoSo.u || ''),
      new Date().toISOString()).run();

  return { ok: true, maNhip, bo: !!bo,
    khongHoiThem: true,
    vi: bo
      ? 'Đã bỏ việc này hôm nay. Không hỏi gì thêm, và không nhắc lại trong ngày.'
      : 'Xong.',
    oLyDoKhongBatBuoc: bo
      ? 'Ô lý do có, nhưng không bắt buộc — bỏ trống vẫn đóng được việc. Một ô bắt ' +
        'buộc ở đây là một cái cửa quay, và lần sau người ta không bỏ việc, họ bỏ app.'
      : undefined };
}

/* ═══════════════ L06 · GHIM CỦA CON LÀ CỦA CON ═══════════════

   Cổng so uid của PHIÊN với chủ ghim. KHÔNG đọc một ô `laCon` do người
   gọi truyền vào — một ô như thế là lời khai của chính người đang đi
   qua cổng, và nó bật được mà không chứng minh gì.

   Cùng cái bẫy đã ghi ở cổng dữ liệu trẻ em (9.99.70) và cờ daDocThe
   (9.99.64). */
export async function ghiGhimCon(y, env, db, hoSo) {
  const x = y || {};
  const maCon = String(x.maCon || '').trim();
  if (!maCon) return { ok: false, code: 'THIEUO', error: 'Thiếu mã học viên.' };

  const hv = await db.prepare('SELECT id, phuHuynhId FROM students WHERE id = ?')
    .bind(maCon).first();
  if (!hv) return { ok: false, error: 'Không tìm thấy hồ sơ học viên.' };

  /* Đọc TÀI KHOẢN CỦA PHIÊN và hỏi nó trỏ vào hồ sơ nào. `users.studentId`
     đã nối sẵn từ lâu, nên không thêm một cột thứ hai vào students —
     hai chỗ nói cùng một sự thật thì sẽ có ngày lệch nhau.

     Người lớn xem được — cửa docGhimCon — nhưng không ghi được ở đây. */
  if (!(await laChinhEmAy(db, hoSo, maCon)))
    return { ok: false, code: 'GHIMCUACON',
      error: 'Chỉ chính em ấy di được ghim trên bản đồ của mình. Người lớn XEM được, ' +
        'không sửa được. Cho cha mẹ sửa ghim của con là biến bản đồ của đứa trẻ thành ' +
        'bản đồ cha mẹ MUỐN nó đi, và cái còn lại chỉ là một tờ giấy mang tên nó.' };

  const luc = new Date().toISOString();
  await db.prepare(
    'INSERT INTO ghimCon (id,maCon,o,ghiChu,ghiLuc) VALUES (?,?,?,?,?)')
    .bind('GC-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6),
      maCon, String(x.o || '').trim(), String(x.ghiChu || '').trim() || null, luc).run();

  return { ok: true, maCon, o: String(x.o || '').trim(), ghiLuc: luc };
}

export async function docGhimCon(y, env, db, hoSo) {
  const maCon = String((y || {}).maCon || '').trim();
  if (!maCon) return { ok: false, code: 'THIEUO', error: 'Thiếu mã học viên.' };
  const hv = await db.prepare('SELECT id, phuHuynhId FROM students WHERE id = ?')
    .bind(maCon).first();
  if (!hv) return { ok: false, error: 'Không tìm thấy hồ sơ học viên.' };

  const laChu = await laChinhEmAy(db, hoSo, maCon);
  const laNguoiLon = String(hv.phuHuynhId || '') === String(hoSo.uid || '');
  if (!laChu && !laNguoiLon) return { ok: false, code: 'NOPERM',
    error: 'Bản đồ riêng của một em chỉ em ấy và cha mẹ em đọc được.' };

  const r = await db.prepare(
    'SELECT o, ghiChu, ghiLuc FROM ghimCon WHERE maCon = ? ORDER BY ghiLuc ASC, rowid ASC')
    .bind(maCon).all();

  return { ok: true, maCon, ds: (r.results || r || []),
    /* Ô này là ô quan trọng nhất của cả bản trả về: nó nói NÚT DI có
       hiện hay không, và màn hình đọc nó chứ không tự đoán theo vai. */
    diDuoc: laChu,
    vi: laChu
      ? 'Bản đồ của em. Em di ghim được.'
      : 'Xem được, không sửa được. Thứ cha mẹ cần là BIẾT, không phải ĐIỀU KHIỂN — ' +
        'và hai cái ấy rất hay bị nhầm là một.' };
}

/* ═══════════════ L07 · PHỦ QUYẾT ẢNH CỦA CON ═══════════════

   CHÍNH ĐỨA TRẺ ký, bằng tài khoản của nó. Cha mẹ không ký thay được —
   nếu ký thay được thì cái quyền phủ quyết ấy thuộc về cha mẹ, và đứa
   trẻ chỉ có một dòng chữ nói rằng nó có quyền. */
export async function datDongYAnhCon(y, env, db, hoSo) {
  const x = y || {};
  const maCon = String(x.maCon || '').trim();
  const hv = await db.prepare('SELECT id FROM students WHERE id = ?')
    .bind(maCon).first();
  if (!hv) return { ok: false, error: 'Không tìm thấy hồ sơ học viên.' };

  if (!(await laChinhEmAy(db, hoSo, maCon)))
    return { ok: false, code: 'CHICONKY',
      error: 'Chỉ chính em ấy ký được ô này, bằng tài khoản của em. Cha mẹ ký thay ' +
        'được thì quyền phủ quyết thuộc về cha mẹ, và em chỉ có một dòng chữ nói ' +
        'rằng em có quyền.' };

  const dongY = x.dongY === true;
  const luc = new Date().toISOString();
  /* MỘT DÒNG MỚI, không ghi đè. Đổi ý theo CẢ HAI chiều, bất cứ lúc
     nào — một lời đồng ý không rút được thì nó không phải lời đồng ý.
     Cùng luật với bảng dongYDuLieu (9.99.70). */
  await db.prepare(
    'INSERT INTO dongYAnhCon (id,maCon,dongY,ghiLuc) VALUES (?,?,?,?)')
    .bind('DA-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6),
      maCon, dongY ? 1 : 0, luc).run();

  await Kho.ghiNhatKy(db, { uid: hoSo.uid, username: hoSo.u,
    viec: dongY ? 'NM_ANH_DONGY' : 'NM_ANH_TUCHOI', doiTuong: maCon });

  return { ok: true, maCon, dongY, ghiLuc: luc,
    doiYDuoc: 'Đổi ý được bất cứ lúc nào, cả hai chiều, và mỗi lần là một dòng mới.' };
}

export async function docDongYAnhCon(db, maCon) {
  const r = await db.prepare(
    /* Tiebreak rowid DESC — xem docCheDoBao. Không có nó thì con vừa ĐỒNG Ý
       lại trong cùng mili-giây với lần TỪ CHỐI trước đó có thể đọc ra là
       vẫn từ chối (hoặc ngược lại): một quyết định phủ quyết ảnh trẻ resolve
       sai, phạm L07 · Điều 13. rowid tăng đơn điệu theo lượt ghi. */
    'SELECT dongY, ghiLuc FROM dongYAnhCon WHERE maCon = ? ORDER BY ghiLuc DESC, rowid DESC LIMIT 1')
    .bind(String(maCon)).first();
  if (!r) return { chuaHoi: true };
  return { chuaHoi: false, dongY: Number(r.dongY) === 1, ghiLuc: r.ghiLuc };
}

/* Cổng có RĂNG của L07. Mọi cửa chia sẻ có ảnh trẻ phải đi qua đây.

   Chặn khi CHƯA HỎI y như khi ĐÃ TỪ CHỐI, nhưng trả về HAI MÃ KHÁC
   NHAU: gộp thì một nhà chưa ai hỏi tới nằm chung rổ với một đứa trẻ
   đã nói không — và hai chuyện ấy cần hai cách xử lý khác hẳn nhau.
   Chỉ một trong hai được phép đi hỏi. */
export async function chiaSeCoAnhCon(y, env, db, hoSo) {
  const maCon = String((y || {}).maCon || '').trim();
  if (!maCon) return { ok: false, code: 'THIEUO', error: 'Thiếu mã học viên.' };

  const t = await docDongYAnhCon(db, maCon);
  if (t.chuaHoi) return { ok: false, code: 'CHUAHOI', anNut: true,
    error: 'Chưa hỏi em ấy. Nút chia sẻ KHÔNG hiện cho tới khi chính em ký ô đồng ý ' +
      'bằng tài khoản của em.' };
  if (!t.dongY) return { ok: false, code: 'CONTUCHOI', anNut: true, khongHoiLai: true,
    error: 'Em ấy đã nói KHÔNG. Nút chia sẻ bị ẩn, và hệ KHÔNG hỏi lại. Hỏi lại một ' +
      'đứa trẻ đã nói không là dạy nó rằng lời từ chối của nó chỉ là bước đầu của ' +
      'một cuộc mặc cả — và nó sẽ dùng bài học ấy ở những chỗ nguy hiểm hơn nhiều.' };

  return { ok: true, maCon, kyLuc: t.ghiLuc,
    vi: 'Em ấy đã đồng ý, và đổi ý lại được bất cứ lúc nào.' };
}
