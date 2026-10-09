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

import { BAC } from './vai-tro.js';

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
const tepSao  = (uid, ma, nen) => 'hoso-sao/' + uid + '/' + ma + (nen ? '.json.gz' : '.json');

/* NÉN BẢN SAO LƯU. JSON hồ sơ nén gzip còn ~10–20% — mười bản sao mỗi
   người là phần lớn dung lượng R2, nên nén ở đây là thứ giữ giai đoạn 1
   (dưới 200.000 tài khoản) nằm trong 10 GB miễn phí. Bản sao chỉ đọc khi
   cứu hộ (tải về, gunzip) nên không tốn CPU lượt đồng bộ thường.
   Môi trường không có CompressionStream thì ghi nguyên — không hỏng. */
async function nenGzip(chu) {
  if (typeof CompressionStream !== 'function') return null;
  const luong = new Blob([chu]).stream().pipeThrough(new CompressionStream('gzip'));
  return new Uint8Array(await new Response(luong).arrayBuffer());
}

/* ═══════════════ RUỘT HỒ SƠ ═══════════════ */

async function docRuot(kho, uid) {
  if (!kho) return {duLieu: {}, moc: {}, etag: null, tep: null};
  const o = await kho.get(tepHoSo(uid));
  if (!o) return {duLieu: {}, moc: {}, etag: null, tep: null};
  const tep = await o.text();
  try {
    const j = JSON.parse(tep);
    /* etag để ghi có điều kiện; tep (chuỗi gốc) để sao lưu khỏi get lại. */
    return {duLieu: j.duLieu || {}, moc: j.moc || {}, etag: o.etag || null, tep: tep};
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
async function maNhaCua(db, uid) {
  const nd = await Kho.nguoiTheoId(db, uid);
  return nd ? String(nd.maKhachHang || nd.studentId || '') : '';
}

async function catTheoNha(db, cum, du, uid) {
  const maNha = await maNhaCua(db, uid);
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
    if (k === 'phanquyen' && lv > 2) continue;    /* bảng phân quyền: R01–R02 ĐỌC; chỉ R01 GHI (dưới) */
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
  else await nhanXinThemCuaNha();   /* gia đình và CTV: chỉ đẩy được LỜI XIN CỦA NHÀ MÌNH */

  /* GỘP THEO NHÀ, KHÔNG GHI ĐÈ (9/10/2026). xinthem là MỘT khối dùng chung
     cho mọi nhà, nhưng mỗi nhà chỉ được ĐỌC phần của mình (catTheoNha). Bản
     cũ cho gia đình ghi bằng nhan() — tức là thay CẢ khối bằng thứ máy họ
     gửi lên, mà máy họ chỉ giữ phần của chính họ. Hậu quả: mỗi lượt một
     nhà bấm "xin thêm" là lời xin của MỌI nhà khác biến mất, và một lượt
     gửi {du:[]} là xoá sạch cả sổ. Nay: giữ nguyên phần của các nhà khác,
     chỉ thay phần của nhà người gửi, và bỏ mọi dòng mang mã nhà khác. */
  async function nhanXinThemCuaNha() {
    const v = gui.xinthem;
    if (!v || typeof v !== 'object' || !Array.isArray(v.du)) return;
    if (Number(v.luc || 0) <= Number((cu.xinthem || {}).luc || 0)) return;
    const maNha = await maNhaCua(db, hoSo.uid);
    if (!maNha) return;
    const cuDu = Array.isArray((cu.xinthem || {}).du) ? cu.xinthem.du : [];
    const cuaNha = v.du.filter(x => x && typeof x === 'object' && String(x.nha) === maNha);
    const du = cuDu.filter(x => String(x && x.nha) !== maNha).concat(cuaNha);
    cu.xinthem = {luc: Number(v.luc), du, boi: hoSo.u};
    await ghiCum(db, 'xinthem', cu.xinthem);
    doi++;
  }

  /* Bảng phân quyền (vai → quyền) là cấp quyền → V50·168: chỉ Super Admin ghi. */
  if (lv <= 2) { for (const k of Object.keys(gui)) if (CUM_QUAN_TRI.includes(k) && (k !== 'phanquyen' || lv === 1)) await nhan(k); }

  if (doi) await Kho.ghiNhatKy(db, {uid: hoSo.uid, username: hoSo.u,
    viec: 'DONG_BO_CAI_DAT', chiTiet: 'Cập nhật ' + doi + ' cụm'});

  return await locCaiDat(db, cu, lv, hoSo.uid);
}

/* ═══════════════ ĐỒNG BỘ ═══════════════

   BA LUẬT TIẾT KIỆM VÀ NHẤT QUÁN (xem docs/TOI_UU_CHI_PHI_CHAT_LUONG.md):

   1. KHÔNG ĐỔI GÌ THÌ KHÔNG GHI GÌ. Phần lớn lượt đồng bộ chỉ để KÉO về
      (mở app, có mạng lại, nhịp sáu giờ). Bản cũ lượt nào cũng chép sao
      lưu, ghi đè tệp, sửa D1, ghi nhật ký — năm lượt ghi để không đổi
      gì. Nay lượt không đổi chỉ ĐỌC: một lượt R2 + một câu caiDat.
   2. SAO LƯU THEO NHỊP, KHÔNG THEO LƯỢT. Bản sao gần nhất còn mới hơn
      SAO_LUU_PHUT thì không chép thêm — vẫn luôn có một bản trước mỗi
      khoảng nửa giờ sửa, mà một buổi sửa liên tục không đẻ ra hàng chục
      bản sao giống nhau.
   3. GHI CÓ ĐIỀU KIỆN. Hai máy đồng bộ cùng lúc thì bản cũ đọc–gộp–ghi
      không khoá gì: lượt ghi sau xoá phần lượt trước vừa gộp. Nay ghi R2
      kèm etag đã đọc; etag đổi giữa chừng thì đọc lại, gộp lại, ghi lại
      (tối đa BA lần). */

const SAO_LUU_PHUT = 30;
const SO_LAN_THU = 3;

/* Gộp phần máy đẩy lên vào hồ sơ. Trả số trường THỰC SỰ đổi. */
function gop(duLieu, moc, day, mocDay, boQua) {
  let doi = 0;
  for (const nhom of Object.keys(day)) {
    if (NHOM.indexOf(nhom) < 0) { if (boQua.indexOf(nhom) < 0) boQua.push(nhom); continue; }
    const v = day[nhom];
    if (v === null || typeof v !== 'object') continue;
    duLieu[nhom] = duLieu[nhom] || {};
    for (const k of Object.keys(v)) {
      const khoa = nhom + '.' + k;
      const tMay = Number(mocDay[khoa] || 0);
      const tChu = Number(moc[khoa] || 0);
      /* tMay < tChu: máy chủ mới hơn — giữ nguyên, và bản mới ấy đi về
         máy khách ở phần "keo" ngay dưới. */
      if (tMay < tChu) continue;
      const tMoi = tMay || Date.now();
      if (tMoi === tChu && JSON.stringify(duLieu[nhom][k]) === JSON.stringify(v[k])) continue;
      duLieu[nhom][k] = v[k]; moc[khoa] = tMoi; doi++;
    }
  }
  return doi;
}

/* SAO LƯU TRƯỚC, GHI ĐÈ SAU — thứ tự này không đổi được.

   Ghi đè trước rồi sao lưu là sao lưu chính bản vừa ghi, tức là không
   sao lưu gì cả; và nếu lượt ghi hỏng giữa chừng thì mất luôn bản cũ.
   Sao lưu chỉ có nghĩa khi nó đứng TRƯỚC.

   Chép từ chuỗi ĐÃ ĐỌC (tep), không get thêm lượt nữa — đúng bản đã gộp,
   và đỡ một lượt R2. */
async function saoLuuNeuCan(db, kho, uid, cuDb, tep, luc, giu, phut) {
  if (!cuDb || !kho || !tep) return;
  const gan = await db.prepare(
    'SELECT luc FROM hosoAppSaoLuu WHERE uid = ? ORDER BY luc DESC LIMIT 1').bind(uid).first();
  if (gan && Date.parse(gan.luc) > Date.now() - (phut || SAO_LUU_PHUT) * 60e3) return;

  const maSao = tokenMoi().slice(0, 24);
  let nen = null;
  try { nen = await nenGzip(tep); } catch (e) { nen = null; }
  const khoaSao = tepSao(uid, maSao, !!nen);
  await kho.put(khoaSao, nen || tep, nen ? {httpMetadata: {contentType: 'application/gzip'}} : undefined);
  /* MỐC THỜI GIAN KHÔNG PHẢI KHOÁ.

     Nền cũ ghép id = uid + '-' + Date.now(), và tôi chép nguyên
     sang đây. Hai lượt đồng bộ rơi vào CÙNG MỘT MI-LI-GIÂY là đụng
     khoá chính, cả lượt ghi ném ra, và người dùng thấy "máy chủ gặp
     trục trặc" trong khi hồ sơ họ vừa sửa không được lưu.

     Máy tính bàn đồng bộ theo nhịp máy, không theo nhịp người — hai
     lượt cách nhau dưới một mi-li-giây là chuyện thường. */
  try {
    await db.prepare('INSERT INTO hosoAppSaoLuu (id,uid,khoaTep,coByte,luc) VALUES (?,?,?,?,?)')
      .bind(maSao, uid, khoaSao, Number(cuDb.coByte || 0), cuDb.suaLuc || luc).run();
  } catch (e) {
    /* BÙ TRỪ: D1 không nhận dòng thì xoá tệp vừa chép — không để lại tệp
       "mồ côi" trong R2 mà không sổ nào trỏ tới (tiền kho tính theo dung
       lượng). Bộ quét đêm (quetSaoLuuMoCoi) là lưới thứ hai. */
    try { await kho.delete(khoaSao); } catch (e2) {}
    throw e;
  }
  await donSaoLuu(db, kho, uid, giu);
}

export async function dongBo(y, env, db, hoSo) {
  const kho = env.HOSO;
  const uid = hoSo.uid;

  /* 1 · Trần kích thước — chặn đẩy cả kho lên bằng một lệnh. */
  const co = JSON.stringify(y.day || {}).length;
  if (co > TRAN_DAY_KB * 1024)
    return {ok: false, code: 'TOOBIG', error: 'Gói đẩy lên vượt trần ' + TRAN_DAY_KB + ' KB.'};

  const day = y.day || {}, mocDay = y.mocTruong || {};
  let boQua = [], duLieu, moc, doi = 0, luc = new Date().toISOString(), daChua = false;

  for (let lan = 0; lan < SO_LAN_THU; lan++) {
    /* 2 · Hồ sơ đang có (kèm etag để ghi có điều kiện).
       TỰ CHỮA THEO KHO: tệp hỏng, hoặc sổ D1 nói có hồ sơ mà R2 mất tệp
       → dựng lại từ bản sao lưu gần nhất còn đọc được, RỒI mới gộp.
       Không chữa thì lượt gộp coi như hồ sơ rỗng và ghi đè — mất trắng. */
    let r;
    try { r = await docRuot(kho, uid); }
    catch (e) {
      if (daChua || !(await khoiPhucTuSaoLuu(db, kho, uid, 'hong'))) throw e;
      daChua = true; r = await docRuot(kho, uid);
    }
    if (kho && !r.tep && !daChua) {
      const soCo = await db.prepare('SELECT coByte FROM hosoApp WHERE uid = ?').bind(uid).first();
      if (soCo && Number(soCo.coByte) > 0 && await khoiPhucTuSaoLuu(db, kho, uid, 'mat')) {
        daChua = true; r = await docRuot(kho, uid);
      }
    }
    duLieu = r.duLieu; moc = r.moc; boQua = [];

    /* 3 · Gộp theo TỪNG TRƯỜNG, bên nào mới hơn thì thắng. */
    doi = gop(duLieu, moc, day, mocDay, boQua);

    /* Luật 1: không đổi gì thì chỉ trả phần kéo về. */
    if (!doi) break;

    luc = new Date().toISOString();
    const cuDb = await db.prepare('SELECT * FROM hosoApp WHERE uid = ?').bind(uid).first();

    /* 4 · Sao lưu (theo nhịp) rồi mới ghi đè. */
    await saoLuuNeuCan(db, kho, uid, cuDb, r.tep, luc, soGiuSaoLuu(env), phutSaoLuu(env));

    const than = JSON.stringify({duLieu: duLieu, moc: moc});
    if (kho) {
      /* Luật 3: ghi khi etag còn đúng bản đã đọc. R2 trả null nếu điều
         kiện hỏng (có máy khác vừa ghi) → vòng lặp đọc lại và gộp lại. */
      const ghi = r.etag
        ? await kho.put(tepHoSo(uid), than, {onlyIf: {etagMatches: r.etag}})
        : await kho.put(tepHoSo(uid), than);
      if (!ghi) {
        if (lan === SO_LAN_THU - 1)
          return {ok: false, code: 'BUSY', thuLaiSau: 5,
            error: 'Hồ sơ đang được máy khác đồng bộ. Thử lại sau vài giây — dữ liệu trong máy vẫn nguyên.'};
        continue;
      }
    }

    if (cuDb) {
      await db.prepare('UPDATE hosoApp SET coByte = ?, suaLuc = ? WHERE uid = ?')
        .bind(than.length, luc, uid).run();
    } else {
      await db.prepare(
        'INSERT INTO hosoApp (id,uid,u,role,khoaTep,coByte,taoLuc,suaLuc) VALUES (?,?,?,?,?,?,?,?)'
      ).bind(uid, uid, hoSo.u, hoSo.role, tepHoSo(uid), than.length, luc, luc).run();
    }
    break;
  }

  /* Nhật ký chỉ khi CÓ đổi (hoặc có nhóm bị từ chối — thứ ấy phải thấy). */
  if (doi || boQua.length)
    await Kho.ghiNhatKy(db, {uid: uid, username: hoSo.u, viec: 'DONG_BO',
      chiTiet: Math.round(co / 1024) + ' KB · ' + doi + ' trường · ' + Object.keys(day).join(',') +
               (boQua.length ? ' · bỏ qua: ' + boQua.join(',') : '')});

  return {ok: true, caiDat: await dongBoCaiDat(db, y, hoSo),
    keo: duLieu, mocTruong: moc, mocMayChu: luc, boQua: boQua, doi: doi};
}

/* ═══════════════ TỰ CHỮA HỒ SƠ TỪ BẢN SAO LƯU ═══════════════

   Agent tự chữa "theo kho dữ liệu": nguồn sự thật để chữa là chính các
   bản sao lưu đã có (hoso-sao/), không đoán, không dựng dữ liệu mới.
   Thử tối đa 5 bản gần nhất; bản nào giải nén + đọc JSON được thì chép
   về chỗ hồ sơ chính. Tệp hỏng được giữ lại ở hoso-hong/ để điều tra —
   không xoá chứng cứ. Trả true nếu đã chữa. */
async function giaiNen(o, khoa) {
  if (!/\.gz$/.test(khoa)) return await o.text();
  if (typeof DecompressionStream !== 'function') throw new Error('không giải nén được');
  const luong = (o.body || new Blob([await o.arrayBuffer()]).stream()).pipeThrough(new DecompressionStream('gzip'));
  return await new Response(luong).text();
}

export async function khoiPhucTuSaoLuu(db, kho, uid, viSao) {
  if (!kho || !db) return false;
  const r = await db.prepare(
    'SELECT khoaTep FROM hosoAppSaoLuu WHERE uid = ? ORDER BY luc DESC, id DESC LIMIT 5').bind(uid).all();
  for (const x of (r.results || [])) {
    try {
      const o = await kho.get(x.khoaTep);
      if (!o) continue;
      const chu = await giaiNen(o, x.khoaTep);
      JSON.parse(chu);
      if (viSao === 'hong') {
        try {
          const cu = await kho.get(tepHoSo(uid));
          if (cu) await kho.put('hoso-hong/' + uid + '/' + Date.now() + '.json', await cu.arrayBuffer());
        } catch (e) {}
      }
      await kho.put(tepHoSo(uid), chu);
      try { await Kho.ghiNhatKy(db, {uid: uid, viec: 'TU_CHUA_HO_SO', doiTuong: 'tự động',
        chiTiet: (viSao === 'hong' ? 'tệp hỏng' : 'mất tệp') + ' → dựng lại từ ' + x.khoaTep}); } catch (e) {}
      return true;
    } catch (e) { /* bản này hỏng — thử bản cũ hơn */ }
  }
  return false;
}

/* ═══════════════ QUÉT SAO LƯU MỒ CÔI (chạy đêm) ═══════════════

   Lưới thứ hai cho tính nhất quán D1 ↔ R2: tệp trong hoso-sao/ mà sổ
   hosoAppSaoLuu không còn dòng nào trỏ tới (Worker chết giữa hai bước,
   lượt bù trừ cũng hỏng) — quá một ngày tuổi thì xoá.

   Mỗi đêm chỉ quét MỘT TRANG (≤ 500 tệp) rồi ghi con trỏ vào chính R2,
   lượt sau đi tiếp; hết vòng thì quay lại đầu. Chi phí cố định mỗi đêm:
   1 lượt list + 1 lượt ghi con trỏ + ≤ 10 câu đọc D1 — không phình theo
   số người dùng. Con trỏ KHÔNG nằm trong caiDat vì caiDat gửi xuống máy
   khách. */
const KHOA_CON_TRO = 'he-thong/con-tro-quet-sao-luu.txt';

export async function quetSaoLuuMoCoi(env, trang) {
  const kho = env && env.HOSO, db = env && env.CSDL;
  if (!kho || !db || typeof kho.list !== 'function') return {ok: true, boQua: 'khong-co-kho'};
  let conTro;
  try { const o = await kho.get(KHOA_CON_TRO); conTro = o ? (await o.text()) || undefined : undefined; }
  catch (e) {}
  const ds = await kho.list({prefix: 'hoso-sao/', limit: trang || 500, cursor: conTro});
  const tep = (ds && ds.objects) || [];
  const han = Date.now() - 86400e3;
  let xoa = 0;
  for (let i = 0; i < tep.length; i += 50) {
    const lo = tep.slice(i, i + 50);
    const r = await db.prepare('SELECT khoaTep FROM hosoAppSaoLuu WHERE khoaTep IN (' +
      lo.map(() => '?').join(',') + ')').bind(...lo.map(o => o.key)).all();
    const con = new Set((r.results || []).map(x => x.khoaTep));
    for (const o of lo) {
      const tuoi = o.uploaded ? new Date(o.uploaded).getTime() : 0;
      if (con.has(o.key) || tuoi > han) continue;
      try { await kho.delete(o.key); xoa++; } catch (e) {}
    }
  }
  const tiep = ds && ds.truncated && ds.cursor ? ds.cursor : '';
  try { await kho.put(KHOA_CON_TRO, tiep); } catch (e) {}
  if (xoa) {
    try { await Kho.ghiNhatKy(db, {viec: 'DON_SAO_LUU_MO_COI', doiTuong: 'tự động',
      chiTiet: 'xoá ' + xoa + '/' + tep.length + ' tệp sao lưu không còn trong sổ'}); } catch (e) {}
  }
  return {ok: true, daXem: tep.length, xoa: xoa, conTiep: !!tiep};
}

/* GIỮ MƯỜI BẢN GẦN NHẤT MỖI NGƯỜI — cùng luật với GITA_HAN của bộ dọn.

   Dọn NGAY lúc sao lưu, không đợi bộ dọn đêm. Sao lưu sinh ra theo nhịp
   người dùng, còn bộ dọn chạy mỗi ngày một lần; để dồn thì một người
   đồng bộ liên tục cả ngày có thể để lại vài trăm tệp trước lượt dọn
   đầu tiên, và tiền kho tệp tính theo dung lượng nằm đó. */
/* Số bản sao lưu giữ mỗi người — đòn bẩy dung lượng R2 (10 GB miễn phí).
   Mặc định 10; đặt GITA_GIU_SAO_LUU = 5 khi R2 vượt 8 GB (docs/KIEN_TRUC_NOI_LUC.md). */
/* Khoảng cách tối thiểu giữa hai bản sao lưu (phút, 30–10080). Đặt 4320
   (3 ngày) từ ~200k tài khoản để giữ ghi D1 < 100k/ngày và R2 lớp A < 1M/tháng. */
export function phutSaoLuu(env) {
  const n = parseInt(env && env.GITA_SAO_LUU_PHUT, 10);
  return n >= 30 && n <= 10080 ? n : SAO_LUU_PHUT;
}

export function soGiuSaoLuu(env) {
  const n = parseInt(env && env.GITA_GIU_SAO_LUU, 10);
  return n >= 3 && n <= 30 ? n : 10;
}

async function donSaoLuu(db, kho, uid, giu) {
  const r = await db.prepare(
    /* Xếp thêm theo id khi mốc bằng nhau: hai bản sao lưu cùng một
       mi-li-giây là chuyện có thật, và một thứ tự không xác định thì
       mỗi lần dọn lại giữ một bộ mười khác nhau. */
    'SELECT id, khoaTep FROM hosoAppSaoLuu WHERE uid = ? ORDER BY luc DESC, id DESC'
  ).bind(uid).all();
  const ds = r.results || [];
  for (let i = giu || 10; i < ds.length; i++) {
    if (kho) { try { await kho.delete(ds[i].khoaTep); } catch (e) {} }
    await db.prepare('DELETE FROM hosoAppSaoLuu WHERE id = ?').bind(ds[i].id).run();
  }
}
