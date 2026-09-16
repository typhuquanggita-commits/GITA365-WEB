/* ═══════════════════════════════════════════════════════════════
   GITA 365 · CỬA VÀO MỚI — ĐỒNG BỘ HỒ SƠ

   App máy tính giữ dữ liệu trong máy và chạy được khi mất mạng. Có
   mạng thì đẩy phần đã đổi lên và kéo phần mới về. Xung đột giải bằng
   MỐC THỜI GIAN TỪNG TRƯỜNG, không ghi đè cả khối — hai máy sửa hai
   việc khác nhau thì giữ được cả hai.

   ── RUỘT HỒ SƠ RA KHO TỆP, KHÔNG NẰM TRONG CƠ SỞ DỮ LIỆU ──

   Hai lý do, và lý do thứ nhất là một lỗi CÓ THẬT của nền cũ:

   1. Sheets nhận tối đa 50.000 KÝ TỰ MỖI Ô, mà nền cũ nhét cả khối
      JSON hồ sơ vào một ô, trong khi chính mã ấy tin trần là 512 KB.
      Lệch hơn mười lần, và chỗ hỏng rơi đúng vào người dùng LÂU NHẤT —
      hồ sơ càng dày càng dễ chạm. Không ai gặp vì hôm nay chưa ai dùng
      đủ lâu.

   2. Nửa triệu hồ sơ × 50 KB là 25 GB. D1 chứa tối đa 10 GB; kho tệp
      R2 thì 10 GB đầu miễn phí rồi tính theo dung lượng — vài trăm
      nghìn đồng một tháng ở mức đầy.

   Nên: một tệp mỗi người, chứa CẢ ruột lẫn bảng mốc. Một lượt đọc, một
   lượt ghi. Cơ sở dữ liệu chỉ giữ chỗ trỏ và kích cỡ.
   ═══════════════════════════════════════════════════════════════ */

import { Kho, tokenMoi } from './nen.js';

const TRAN_DAY_KB = 512;

/* Nhóm dữ liệu được phép đồng bộ. Ngoài danh sách này là từ chối.
   PHẢI KHỚP ĐÚNG NHOM trong src/dong-bo.js — lệch một tên là dữ liệu
   đi lên rồi bị bỏ vào danh sách "bỏ qua" mà người dùng không thấy gì
   bất thường, cứ tưởng đã lưu. */
const NHOM = ['checks', 'journal', 'vision', 'test', 'mood', 'thuvien',
  'minhchung', 'bando', 'chuyen', 'nhatky', 'baithi', 'thoigian',
  'sathach', 'khoahoc', 'tgdoc'];

const BAC = {R01:1,R02:2,R03:3,R04:4,R05:5,R06:6,R07:7,R08:8,
             R09:9,R10:10,R11:11,R12:12,R13:13,R14:14,R15:15};

const CUM_NGHE = ['khothem', 'xinthem', 'ca', 'tainguyen'];
const CUM_QUAN_TRI = ['sapxep', 'noidung', 'phanquyen'];

const tepHoSo = uid => 'hoso/' + uid + '.json';
/* Tên tệp sao lưu lấy theo MÃ BẢN GHI, không theo mốc thời gian.

   Bản đầu ghép theo suaLuc. Hai lượt đồng bộ cùng một mi-li-giây thì ra
   cùng một tên tệp: lượt sau ghi đè lượt trước, và sổ có hai dòng cùng
   trỏ vào một tệp. Bộ dọn xoá dòng thứ mười một rồi xoá luôn tệp — mà
   tệp ấy còn là bản sao lưu của dòng thứ mười. Mất một bản sao lưu vì
   một cái tên trùng.

   Cùng đúng lớp lỗi với id bản ghi ngay dưới: MỐC THỜI GIAN KHÔNG PHẢI
   KHOÁ, ở đâu cũng vậy. */
const tepSao  = (uid, ma) => 'hoso-sao/' + uid + '/' + ma + '.json';

/* ═══════════════ RUỘT HỒ SƠ ═══════════════ */

async function docRuot(kho, uid) {
  if (!kho) return {duLieu: {}, moc: {}};
  const o = await kho.get(tepHoSo(uid));
  if (!o) return {duLieu: {}, moc: {}};
  try {
    const j = JSON.parse(await o.text());
    return {duLieu: j.duLieu || {}, moc: j.moc || {}};
  } catch (e) {
    /* Tệp hỏng thì KHÔNG coi như hồ sơ rỗng rồi ghi đè lên nó — như thế
       là xoá sạch hồ sơ của người ta để chữa một lỗi đọc. Ném ra, để
       lượt đồng bộ dừng lại và người ta còn hồ sơ để cứu. */
    throw new Error('Hồ sơ trên máy chủ đọc không ra: ' + e.message);
  }
}

/* ═══════════════ CÀI ĐẶT CHUNG ═══════════════ */

async function docCaiDat(db) {
  const r = await db.prepare('SELECT cum, du, luc, boi FROM caiDat').all();
  const ra = {};
  for (const x of (r.results || [])) {
    try { ra[x.cum] = {luc: Number(x.luc), du: JSON.parse(x.du), boi: x.boi || ''}; }
    catch (e) { /* một cụm hỏng không được kéo đổ sáu cụm còn lại */ }
  }
  return ra;
}

async function ghiCum(db, cum, v) {
  await db.prepare(
    'INSERT INTO caiDat (cum, du, luc, boi) VALUES (?,?,?,?) ' +
    'ON CONFLICT(cum) DO UPDATE SET du = excluded.du, luc = excluded.luc, boi = excluded.boi'
  ).bind(cum, JSON.stringify(v.du), Number(v.luc), v.boi || '').run();
}

/** Cắt phần của MỘT nhà ra khỏi cụm dùng chung.

    Vì sao cần: hai cụm khothem và xinthem đồng bộ toàn cục. Trả nguyên
    khối cho gia đình là gửi cho họ tư liệu và lời xin của MỌI nhà khác
    — và tệ hơn, tư liệu gửi riêng cho một nhà sẽ mở khoá cho tất cả. */
async function catTheoNha(db, cum, du, uid) {
  let maNha = '';
  const nd = await Kho.nguoiTheoId(db, uid);
  if (nd) maNha = String(nd.maKhachHang || nd.studentId || '');
  if (!maNha) return cum === 'xinthem' ? [] : {};

  if (cum === 'xinthem')
    return Array.isArray(du) ? du.filter(x => String(x && x.nha) === maNha) : [];

  /* khothem: khoá có dạng "<mã nhà>|<loại>·<mã tư liệu>" */
  const ra = {};
  for (const k of Object.keys(du || {})) if (k.indexOf(maNha + '|') === 0) ra[k] = du[k];
  return ra;
}

/** AI ĐƯỢC NHẬN CỤM NÀO.

    Chặn GHI thôi thì chưa đủ: trả về cả khối là gửi hồ sơ ca của mọi
    nhà xuống máy của từng phụ huynh. Hồ sơ ca mang tên nhà, số điện
    thoại và nguyên văn lời gia đình kể — gửi xuống rồi thì mở công cụ
    nhà phát triển là đọc được hết, và lọc trên màn hình không gọi
    ngược được thứ đã đi. Kho này đã mắc đúng lớp lỗi ấy ba lần. */
async function locCaiDat(db, cu, lv, uid) {
  const ra = {};
  for (const k of Object.keys(cu)) {
    if (k === '__quaLon') { ra[k] = cu[k]; continue; }
    if (k === 'ca' && lv > 11) continue;          /* hồ sơ ca: chỉ người trong nghề */
    if (k === 'tainguyen' && lv > 2) continue;    /* mức dùng tài nguyên của đội ngũ */
    if (k === 'phanquyen' && lv > 2) continue;    /* bảng phân quyền */
    if (k === 'khothem' || k === 'xinthem') {
      if (lv <= 11) { ra[k] = cu[k]; continue; }  /* đội ngũ: nhận cả */
      const v = cu[k];
      if (!v || !v.du) continue;
      /* Gia đình PHẢI nhận được phần của mình, nếu không thì Tư vấn bấm
         gửi mà nhà kia không bao giờ mở ra được. */
      ra[k] = {luc: v.luc, boi: v.boi, du: await catTheoNha(db, k, v.du, uid)};
      continue;
    }
    ra[k] = cu[k];
  }
  return ra;
}

async function dongBoCaiDat(db, y, hoSo) {
  const cu = await docCaiDat(db);
  const lv = BAC[hoSo.role] || 99;
  const gui = y.caiDat || {};
  let doi = 0;

  const nhan = async (k) => {
    const v = gui[k];
    if (!v || typeof v !== 'object' || !v.du) return;
    if (Number(v.luc || 0) <= Number((cu[k] || {}).luc || 0)) return;
    cu[k] = {luc: Number(v.luc), du: v.du, boi: hoSo.u};
    await ghiCum(db, k, cu[k]);
    doi++;
  };

  if (lv <= 11) { for (const k of Object.keys(gui)) if (CUM_NGHE.includes(k)) await nhan(k); }
  else await nhan('xinthem');   /* gia đình và CTV: chỉ đẩy được LỜI XIN, không hơn */

  if (lv <= 2) { for (const k of Object.keys(gui)) if (CUM_QUAN_TRI.includes(k)) await nhan(k); }

  if (doi) await Kho.ghiNhatKy(db, {uid: hoSo.uid, username: hoSo.u,
    viec: 'DONG_BO_CAI_DAT', chiTiet: 'Cập nhật ' + doi + ' cụm'});

  return await locCaiDat(db, cu, lv, hoSo.uid);
}

/* ═══════════════ ĐỒNG BỘ ═══════════════ */

export async function dongBo(y, env, db, hoSo) {
  const kho = env.HOSO;
  const uid = hoSo.uid;

  /* 1 · Trần kích thước — chặn đẩy cả kho lên bằng một lệnh. */
  const co = JSON.stringify(y.day || {}).length;
  if (co > TRAN_DAY_KB * 1024)
    return {ok: false, code: 'TOOBIG', error: 'Gói đẩy lên vượt trần ' + TRAN_DAY_KB + ' KB.'};

  /* 2 · Hồ sơ đang có */
  const {duLieu, moc} = await docRuot(kho, uid);

  /* 3 · Gộp theo TỪNG TRƯỜNG, bên nào mới hơn thì thắng. */
  const day = y.day || {}, mocDay = y.mocTruong || {}, boQua = [];
  for (const nhom of Object.keys(day)) {
    if (NHOM.indexOf(nhom) < 0) { boQua.push(nhom); continue; }
    const v = day[nhom];
    if (v === null || typeof v !== 'object') continue;
    duLieu[nhom] = duLieu[nhom] || {};
    for (const k of Object.keys(v)) {
      const khoa = nhom + '.' + k;
      const tMay = Number(mocDay[khoa] || 0);
      const tChu = Number(moc[khoa] || 0);
      /* tMay < tChu: máy chủ mới hơn — giữ nguyên, và bản mới ấy đi về
         máy khách ở phần "keo" ngay dưới. */
      if (tMay >= tChu) { duLieu[nhom][k] = v[k]; moc[khoa] = tMay || Date.now(); }
    }
  }

  /* 4 · SAO LƯU TRƯỚC, GHI ĐÈ SAU — thứ tự này không đổi được.

     Ghi đè trước rồi sao lưu là sao lưu chính bản vừa ghi, tức là không
     sao lưu gì cả; và nếu lượt ghi hỏng giữa chừng thì mất luôn bản cũ.
     Sao lưu chỉ có nghĩa khi nó đứng TRƯỚC. */
  const luc = new Date().toISOString();
  const cuDb = await db.prepare('SELECT * FROM hosoApp WHERE uid = ?').bind(uid).first();
  if (cuDb && kho) {
    const cuTep = await kho.get(tepHoSo(uid));
    if (cuTep) {
      const maSao = tokenMoi().slice(0, 24);
      const khoaSao = tepSao(uid, maSao);
      await kho.put(khoaSao, await cuTep.arrayBuffer());
      /* MỐC THỜI GIAN KHÔNG PHẢI KHOÁ.

         Nền cũ ghép id = uid + '-' + Date.now(), và tôi chép nguyên
         sang đây. Hai lượt đồng bộ rơi vào CÙNG MỘT MI-LI-GIÂY là đụng
         khoá chính, cả lượt ghi ném ra, và người dùng thấy "máy chủ gặp
         trục trặc" trong khi hồ sơ họ vừa sửa không được lưu.

         Ở Sheets chuyện này không nổ, vì một dòng bảng tính không có
         khoá chính — nó lặng lẽ tạo hai dòng trùng id, rồi Store.find
         trả về dòng đầu tiên, nên lượt sửa sau ghi vào nhầm bản. Hỏng
         im lặng thay vì hỏng ồn ào; chuyển sang cơ sở dữ liệu thật là
         chỗ ấy mới chịu kêu.

         Máy tính bàn đồng bộ theo nhịp máy, không theo nhịp người — hai
         lượt cách nhau dưới một mi-li-giây là chuyện thường. */
      await db.prepare('INSERT INTO hosoAppSaoLuu (id,uid,khoaTep,coByte,luc) VALUES (?,?,?,?,?)')
        .bind(maSao, uid, khoaSao, Number(cuDb.coByte || 0), cuDb.suaLuc || luc).run();
      await donSaoLuu(db, kho, uid);
    }
  }

  const than = JSON.stringify({duLieu: duLieu, moc: moc});
  if (kho) await kho.put(tepHoSo(uid), than);

  if (cuDb) {
    await db.prepare('UPDATE hosoApp SET coByte = ?, suaLuc = ? WHERE uid = ?')
      .bind(than.length, luc, uid).run();
  } else {
    await db.prepare(
      'INSERT INTO hosoApp (id,uid,u,role,khoaTep,coByte,taoLuc,suaLuc) VALUES (?,?,?,?,?,?,?,?)'
    ).bind(uid, uid, hoSo.u, hoSo.role, tepHoSo(uid), than.length, luc, luc).run();
  }

  await Kho.ghiNhatKy(db, {uid: uid, username: hoSo.u, viec: 'DONG_BO',
    chiTiet: Math.round(co / 1024) + ' KB · ' + Object.keys(day).join(',') +
             (boQua.length ? ' · bỏ qua: ' + boQua.join(',') : '')});

  return {ok: true, caiDat: await dongBoCaiDat(db, y, hoSo),
    keo: duLieu, mocTruong: moc, mocMayChu: luc, boQua: boQua};
}

/* GIỮ MƯỜI BẢN GẦN NHẤT MỖI NGƯỜI — cùng luật với GITA_HAN của bộ dọn.

   Dọn NGAY lúc sao lưu, không đợi bộ dọn đêm. Sao lưu sinh ra theo nhịp
   người dùng, còn bộ dọn chạy mỗi ngày một lần; để dồn thì một người
   đồng bộ liên tục cả ngày có thể để lại vài trăm tệp trước lượt dọn
   đầu tiên, và tiền kho tệp tính theo dung lượng nằm đó. */
async function donSaoLuu(db, kho, uid) {
  const r = await db.prepare(
    /* Xếp thêm theo id khi mốc bằng nhau: hai bản sao lưu cùng một
       mi-li-giây là chuyện có thật, và một thứ tự không xác định thì
       mỗi lần dọn lại giữ một bộ mười khác nhau. */
    'SELECT id, khoaTep FROM hosoAppSaoLuu WHERE uid = ? ORDER BY luc DESC, id DESC'
  ).bind(uid).all();
  const ds = r.results || [];
  for (let i = 10; i < ds.length; i++) {
    if (kho) { try { await kho.delete(ds[i].khoaTep); } catch (e) {} }
    await db.prepare('DELETE FROM hosoAppSaoLuu WHERE id = ?').bind(ds[i].id).run();
  }
}
