/**
 * ═══════════════════════════════════════════════════════════════
 * GITA 365 — ĐỒNG BỘ APP ↔ WEB APP
 * Dán vào cùng dự án Apps Script với GITA_CapPhep.gs.
 *
 * App máy tính giữ dữ liệu trong máy và chạy được khi mất mạng.
 * Có mạng thì đẩy phần đã đổi lên máy chủ Admin và kéo phần mới về.
 * Xung đột giải bằng mốc thời gian từng trường, không ghi đè cả khối.
 * ═══════════════════════════════════════════════════════════════
 */

/** Trần kích thước một lần đẩy — chặn đẩy cả kho lên bằng một lệnh. */
var GITA_TRAN_DONGBO_KB = 512;

/** Những nhóm dữ liệu được phép đồng bộ. Ngoài danh sách này là từ chối. */
/* Phải khớp đúng NHOM trong src/dong-bo.js. Lệch một tên là dữ liệu đi lên
   rồi bị bỏ vào danh sách "bỏ qua" mà người dùng không thấy gì bất thường. */
var GITA_NHOM_DONGBO = ['checks', 'journal', 'vision', 'test', 'mood', 'thuvien', 'minhchung', 'bando', 'chuyen', 'nhatky', 'baithi', 'thoigian', 'sathach', 'khoahoc', 'tgdoc'];

function gitaKhoaHoSo_(uid) { return 'HOSO_' + uid; }

/**
 * Thân yêu cầu:
 *   { fn:'dongBo', u, token, tuLuc: <ISO|null>, day: { checks:{...}, journal:{...}, ... },
 *     mocTruong: { 'checks.kpi-1-0': 1787900000000, ... } }
 * Trả về:
 *   { ok, keo: {...}, mocTruong: {...}, mocMayChu: <ISO>, boQua: [] }
 */
/* Cài đặt của chủ hệ thống — bố cục, chữ hiển thị, bảng phân quyền.
   Đồng bộ theo cả cụm: ai sửa sau thì bản đó thắng. Chỉ vai bậc ≤ 2
   được ghi; vai khác chỉ NHẬN về, không đẩy lên. */
function gitaCaiDat_(y, hoSo) {
  var kho = PropertiesService.getScriptProperties();
  var cu = gitaDocCaiDat_();
  var truoc = JSON.parse(JSON.stringify(cu));   /* bản trước khi sửa, để trả lại nếu cụm quá lớn */
  var doiCum = {};                              /* cụm nào thật sự đổi — chỉ ghi lại những cụm ấy */
  var lv = (ROLES[hoSo.role] || { lv: 99 }).lv;
  var gui = y.caiDat || {}, doi = 0;

  /* Hai cụm khác luật: tư liệu Tư vấn và Coach gửi thêm cho từng nhà, và
     những lời xin đang chờ. Ghi được từ Tư vấn trở lên (bậc ≤ 11) — vì
     chính họ là người đứng giữa kho và gia đình. Gia đình chỉ đặt lời xin
     qua cụm xinthem, không bao giờ tự ghi vào cụm khothem. */
  var CUM_NGHE = ['khothem', 'xinthem', 'ca', 'tainguyen'];
  if (lv <= 11) {
    Object.keys(gui).forEach(function (k) {
      if (CUM_NGHE.indexOf(k) < 0) return;
      var v = gui[k];
      if (!v || typeof v !== 'object' || !v.du) return;
      if (Number(v.luc || 0) <= Number((cu[k] || {}).luc || 0)) return;
      cu[k] = { luc: Number(v.luc), du: v.du, boi: hoSo.u };
      doiCum[k] = 1; doi++;
    });
  } else {
    /* Gia đình và cộng tác viên: chỉ được đẩy lời XIN lên, không hơn. */
    var vx = gui.xinthem;
    if (vx && typeof vx === 'object' && vx.du &&
        Number(vx.luc || 0) > Number((cu.xinthem || {}).luc || 0)) {
      cu.xinthem = { luc: Number(vx.luc), du: vx.du, boi: hoSo.u };
      doiCum.xinthem = 1; doi++;
    }
  }

  if (lv <= 2) {
    Object.keys(gui).forEach(function (k) {
      if (['sapxep', 'noidung', 'phanquyen'].indexOf(k) < 0) return;
      var v = gui[k];
      if (!v || typeof v !== 'object' || !v.du) return;
      if (Number(v.luc || 0) <= Number((cu[k] || {}).luc || 0)) return;
      cu[k] = { luc: Number(v.luc), du: v.du, boi: hoSo.u };
      doiCum[k] = 1; doi++;
    });
  }

  if (doi) {
    /* Script Properties chỉ nhận 9 KB MỖI GIÁ TRỊ (và 500 KB cả kho). Trần
       400.000 ký tự đặt trước đây là sai gấp bốn mươi lần: vượt là Apps
       Script ném "Argument too large", cả lượt đồng bộ trả về lỗi, người
       dùng bấm lại, mỗi lần lại thêm một dòng sao lưu — mà cài đặt thì
       vĩnh viễn không lưu được.

       Cụm hồ sơ ca cộng dồn theo thời gian nên chắc chắn vượt 9 KB sớm.
       Nên mỗi cụm nay nằm ở MỘT khoá riêng, và cụm nào quá lớn thì bị từ
       chối riêng cụm đó, nói rõ lý do, không kéo đổ cả lượt đồng bộ. */
    var quaLon = [];
    Object.keys(cu).forEach(function (k) {
      if (!doiCum[k]) return;                       /* cụm không đổi thì khỏi ghi lại */
      var tho = JSON.stringify(cu[k]);
      if (tho.length > GITA_TRAN_CUM_BYTE) {
        quaLon.push(k);
        cu[k] = truoc[k];                           /* trả về bản cũ, không mất dữ liệu */
        return;
      }
      try { kho.setProperty(gitaKhoaCum_(k), tho); }
      catch (e) { quaLon.push(k); cu[k] = truoc[k]; }
    });

    ghiNhatKy_({ viec: 'DONG_BO_CAI_DAT', u: hoSo.u, role: hoSo.role,
      chiTiet: 'Cập nhật ' + doi + ' cụm' +
        (quaLon.length ? ' · TỪ CHỐI vì quá lớn: ' + quaLon.join(',') : '') });
    if (quaLon.length) cu.__quaLon = quaLon;
  }

  return gitaLocCaiDat_(cu, lv, hoSo.phien && hoSo.phien.uid);
}

/* Mỗi cụm một khoá riêng — 9 KB cho mỗi cụm thay vì 9 KB cho tất cả. */
var GITA_TRAN_CUM_BYTE = 8500;
var GITA_CUM_CAI_DAT = ['sapxep', 'noidung', 'phanquyen', 'khothem', 'xinthem', 'ca', 'tainguyen'];
function gitaKhoaCum_(k) { return 'GITA_CD_' + k; }

function gitaDocCaiDat_() {
  var kho = PropertiesService.getScriptProperties();
  var ra = {};
  GITA_CUM_CAI_DAT.forEach(function (k) {
    var t = kho.getProperty(gitaKhoaCum_(k));
    if (!t) return;
    try { ra[k] = JSON.parse(t); } catch (e) {}
  });
  /* Đọc nốt bản cũ gộp một khoá, để máy chủ đang chạy không mất cài đặt
     khi nâng cấp. Đọc xong là thôi, không ghi lại vào khoá cũ nữa. */
  try {
    var goc = JSON.parse(kho.getProperty('GITA_CAI_DAT') || '{}');
    Object.keys(goc).forEach(function (k) { if (!ra[k]) ra[k] = goc[k]; });
  } catch (e) {}
  return ra;
}

/* ══ AI ĐƯỢC NHẬN CỤM NÀO ══
   Chặn GHI thôi thì chưa đủ: trả về cả khối là gửi hồ sơ ca của mọi nhà
   xuống máy của từng phụ huynh. Hồ sơ ca có tên nhà, số điện thoại và
   nguyên văn lời gia đình kể. Nó chỉ được đi tới người trong nghề. */
function gitaLocCaiDat_(cu, lv, uid) {
  var ra = {};
  Object.keys(cu).forEach(function (k) {
    if (k === '__quaLon') { ra[k] = cu[k]; return; }

    /* Hồ sơ ca: chỉ người trong nghề. Nó mang tên nhà, số điện thoại và
       nguyên văn lời gia đình kể — không được xuống máy của nhà nào cả. */
    if (k === 'ca' && lv > 11) return;

    /* Mức dùng tài nguyên của đội ngũ: chỉ Super Admin và Admin hệ thống.
       Nó mang tên tài khoản và thói quen làm việc của từng người. */
    if (k === 'tainguyen' && lv > 2) return;

    /* Bảng phân quyền: chỉ Super Admin và Admin hệ thống */
    if (k === 'phanquyen' && lv > 2) return;

    /* Tư liệu đã gửi thêm và lời xin: gia đình PHẢI nhận được, nếu không
       thì Tư vấn bấm gửi mà nhà kia không bao giờ mở ra được. Nhưng chỉ
       nhận PHẦN CỦA MÌNH — cắt theo mã nhà trước khi trả về. */
    if (k === 'khothem' || k === 'xinthem') {
      if (lv <= 11) { ra[k] = cu[k]; return; }      /* đội ngũ: nhận cả */
      var v = cu[k];
      if (!v || !v.du) return;
      ra[k] = { luc: v.luc, boi: v.boi, du: gitaCatTheoNha_(k, v.du, uid) };
      return;
    }

    ra[k] = cu[k];
  });
  return ra;
}

/**
 * Cắt phần của một nhà ra khỏi cụm dùng chung.
 *
 * Vì sao cần: hai cụm này đồng bộ toàn cục. Trả nguyên khối cho gia đình là
 * gửi cho họ tư liệu và lời xin của mọi nhà khác — và tệ hơn, tư liệu gửi
 * cho một nhà sẽ mở khoá cho tất cả các nhà.
 */
function gitaCatTheoNha_(cum, du, uid) {
  var maNha = '';
  try {
    var nd = Store.find('users', uid);
    if (nd) maNha = String(nd.maKhachHang || nd.studentId || '');
  } catch (e) {}
  if (!maNha) return (cum === 'xinthem') ? [] : {};

  if (cum === 'xinthem') {
    if (!Array.isArray(du)) return [];
    return du.filter(function (x) { return String(x && x.nha) === maNha; });
  }

  /* khothem: khoá có dạng "<mã nhà>|<loại>·<mã tư liệu>" */
  var ra = {};
  Object.keys(du || {}).forEach(function (k) {
    if (k.indexOf(maNha + '|') === 0) ra[k] = du[k];
  });
  return ra;
}

function gitaDongBo_(y, hoSo) {
  var uid = hoSo.phien.uid;

  // 1. Kích thước
  var co = JSON.stringify(y.day || {}).length;
  if (co > GITA_TRAN_DONGBO_KB * 1024)
    return { ok: false, code: 'TOOBIG', error: 'Gói đẩy lên vượt trần ' + GITA_TRAN_DONGBO_KB + ' KB.' };

  // 2. Đọc hồ sơ đang có trên máy chủ
  var cu = null;
  try { cu = Store.find('hosoApp', uid); } catch (e) { cu = null; }
  var duLieu = {}, moc = {};
  if (cu && cu.duLieu) {
    try { duLieu = JSON.parse(cu.duLieu) || {}; } catch (e) { duLieu = {}; }
    try { moc = JSON.parse(cu.moc || '{}') || {}; } catch (e) { moc = {}; }
  }

  // 3. Gộp theo TỪNG TRƯỜNG, bên nào mới hơn thì thắng.
  //    Không ghi đè cả khối — hai máy sửa hai việc khác nhau thì giữ được cả hai.
  var day = y.day || {}, mocDay = y.mocTruong || {}, boQua = [];
  Object.keys(day).forEach(function (nhom) {
    if (GITA_NHOM_DONGBO.indexOf(nhom) < 0) { boQua.push(nhom); return; }
    var v = day[nhom];
    if (v === null || typeof v !== 'object') return;
    duLieu[nhom] = duLieu[nhom] || {};
    Object.keys(v).forEach(function (k) {
      var khoa = nhom + '.' + k;
      var tMay = Number(mocDay[khoa] || 0);
      var tChu = Number(moc[khoa] || 0);
      if (tMay >= tChu) { duLieu[nhom][k] = v[k]; moc[khoa] = tMay || Date.now(); }
      // tMay < tChu: máy chủ mới hơn, giữ nguyên và trả về ở phần keo
    });
  });

  // 4. Ghi lại, luôn giữ một bản sao lưu trước khi ghi đè
  var ban = { duLieu: JSON.stringify(duLieu), moc: JSON.stringify(moc), suaLuc: new Date().toISOString() };
  try {
    if (cu) {
      /* MỐC THỜI GIAN KHÔNG PHẢI KHOÁ. Trước 9.83 dòng này ghép
         id = uid + '-' + Date.now(). Máy tính bàn đồng bộ theo nhịp
         máy chứ không theo nhịp người, nên hai lượt rơi vào cùng một
         mi-li-giây là chuyện thường — và lúc ấy sổ có hai dòng TRÙNG
         ID.

         Bảng tính không có khoá chính nên nó không kêu; nó nhận cả
         hai. Rồi bộ dọn 9.79 gom mười bản gần nhất theo uid, gọi
         Store.xoa với danh sách id, mà xoa xoá MỌI dòng có id nằm
         trong danh sách — nên xoá bản thứ mười một là xoá luôn bản
         thứ mười đi cùng nó. Mất một bản sao lưu vì một cái tên trùng.
         Lỗi này lộ ra khi dựng nền mới, nơi id là khoá chính thật. */
      Store.insert('hosoAppSaoLuu', { id: Utilities.getUuid(), uid: uid,
        duLieu: cu.duLieu, luc: cu.suaLuc || '' });
      Store.update('hosoApp', uid, ban);
    } else {
      Store.insert('hosoApp', { id: uid, uid: uid, u: hoSo.u, role: hoSo.role,
        duLieu: ban.duLieu, moc: ban.moc, suaLuc: ban.suaLuc, taoLuc: ban.suaLuc });
    }
  } catch (e) {
    return { ok: false, error: 'Không ghi được hồ sơ: ' + e.message };
  }

  ghiNhatKy_({ viec: 'DONG_BO', u: hoSo.u, role: hoSo.role, tier: hoSo.tier,
    may: String(y.may || '').slice(0, 120), phien: hoSo.phien,
    chiTiet: Math.round(co / 1024) + ' KB · ' + Object.keys(day).join(',') +
             (boQua.length ? ' · bỏ qua: ' + boQua.join(',') : '') });

  return { ok: true, caiDat: gitaCaiDat_(y, hoSo), keo: duLieu, mocTruong: moc, mocMayChu: ban.suaLuc, boQua: boQua };
}

/**
 * Kiểm bản mới của ứng dụng và của kho — app hỏi mỗi lần mở và mỗi 6 giờ.
 * Thân: { fn:'kiemBanMoi', banApp:'7.5.0' }
 */
function gitaKiemBanMoi_(y) {
  var P = PropertiesService.getScriptProperties();
  return {
    ok: true,
    banMoiNhat: P.getProperty('GITA_BAN_MOI_NHAT') || '',
    tai: P.getProperty('GITA_LINK_TAI') || '',
    bacBuoc: P.getProperty('GITA_BAN_BAT_BUOC') || '',
    khoBam: JSON.parse(P.getProperty('GITA_KHO_BAM') || '{}'),
    banApp: String(y.banApp || '')
  };
}
