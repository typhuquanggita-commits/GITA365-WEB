/* ═══════════════════════════════════════════════════════════════
   GITA 365 · CỬA VÀO MỚI — TRỢ LÝ PHÒNG TÀI CHÍNH

   Chốt của chủ hệ thống bản 9.99: "Lập trình cho trợ lý AI hỗ trợ cho
   phòng tài chính."

   ══ NÓI THẲNG TRỢ LÝ NÀY LÀ GÌ ══

   Nó KHÔNG gọi ra một mô hình ngôn ngữ nào. Không có một dòng nào của
   sổ tiền rời khỏi máy chủ của Học viện — đó là điều kiện, không phải
   lựa chọn: sổ tài chính là thứ cuối cùng được phép đi ra ngoài.

   Nó là một BỘ LUẬT BIẾT NÓI. Nó đọc đúng những hằng số mà cổng thật
   đọc, chạy đúng những phép mà cổng thật chạy, rồi kể lại bằng tiếng
   Việt. Cái nó thêm vào không phải trí thông minh — mà là việc nối ba
   thứ vốn nằm ba chỗ: khoản chi, tuần của người đề xuất, và bảng ai
   đang giữ vị trí nào.

   Vì sao phải nói thẳng chỗ này: một trợ lý được người dùng tưởng là
   thông minh sẽ được tin ở cả những câu nó không có căn cứ. Nên nó chỉ
   trả lời ĐÚNG NĂM CÂU, và câu thứ sáu thì nó nói là không biết.

   ══ TRỢ LÝ VÀ CỔNG PHẢI ĐỌC CÙNG MỘT LUẬT ══

   Đây là chỗ dễ hỏng nhất và hỏng im lặng nhất. Trợ lý tự tính lấy
   "anh ký được không" thì có ngày nó nói khác cổng, và người ta tin
   trợ lý vì nó nói TRƯỚC. Hai đường hỏng, đường thứ hai tệ hơn:

     nói "ký được" mà cổng từ chối  → người ta bực, rồi đi hỏi
     nói "không ký được" mà thật ra ký được
                                    → người ta đi tìm người khác ký,
                                      trong khi CHÍNH HỌ là người phải
                                      chịu trách nhiệm khoản ấy

   Nên trợ lý không có bản luật riêng: nó gọi giaiPhauChi() và
   vuongCuaNao() trong chi-tieu.js — đúng hai hàm mà duyetChi() gọi.
   Và bộ thử đối chiếu hai đường mỗi lần chạy: hỏi trợ lý, rồi bấm
   duyệt thật, và đòi hai câu trả lời khớp mã.

   ══ TRỢ LÝ KHÔNG BAO GIỜ CHỈ ĐƯỜNG LÁCH ══

   Một trợ lý tài chính hữu ích là một trợ lý nguy hiểm: nó biết đủ luật
   để chỉ ra chỗ mỏng nhất. "Khoản này 11 triệu nên phải qua Giám đốc"
   chỉ cách một bước với "tách làm hai khoản 5,5 triệu thì không phải".

   Nên nó có một luật cứng: khi một khoản bị chặn, nó nói AI KÝ ĐƯỢC và
   CẦN THÊM GÌ — không bao giờ nói cách để không phải xin ký. Và ở đúng
   chỗ ấy nó nói ra rằng hai đường lách quen thuộc đều đã có người canh:
   chia nhỏ thì phép gộp 7 ngày bắt, dời sang tuần sau thì trần chu kỳ
   bắt. Nói ra chỗ canh không phải để doạ — mà để người đang định đi
   đường vòng biết là đường ấy không dẫn tới đâu, và quay lại xin ký.

   ══ MỌI CÂU TRẢ LỜI ĐỀU NÊU CĂN CỨ ══

   Cùng luật với trợ lý GITA từ bản 8.1: nêu nguồn, có mã tra lại được,
   và kho chưa có thì nói thẳng là chưa có chứ không đoán. Một con số
   không có căn cứ thì người đọc không cãi lại được, và không cãi lại
   được thì không kiểm được.
   ═══════════════════════════════════════════════════════════════ */

import { quyenCua, oDauTien, giaiPhauChi, vuongCuaNao, mocCua, tongChuKy,
  NAC_THANG, MOC_CHU_KY, CHU_KY, VI_TRI_TC, KHOAN_MUC,
  TRAN_PHAI_DUYET, TRAN_CHU_KY, NGAY_GOP } from './chi-tieu.js';

const BAC = {R01:1,R02:2,R03:3,R04:4,R05:5,R06:6,R07:7,R08:8,
             R09:9,R10:10,R11:11,R12:12,R13:13,R14:14,R15:15};

const dinhDang = n => Number(n).toLocaleString('vi-VN') + 'đ';

/* NĂM CÂU TRỢ LÝ TRẢ LỜI ĐƯỢC — danh sách trắng, không danh sách cấm.

   Câu thứ sáu KHÔNG được đoán. Một trợ lý đoán một câu về tiền là một
   trợ lý sai một lần rồi không ai tin nữa; một trợ lý nói "câu này tôi
   chưa trả lời được" thì người ta còn dùng nó cho năm câu kia. */
const CAU_HOI = {
  khoanChi:   {ten: 'Khoản chi này cần gì, và tôi ký được không'},
  chuKyCuaToi:{ten: 'Tuần này tôi đã chi bao nhiêu, còn cách mốc nào'},
  viecCuaToi: {ten: 'Việc gì đang chờ tôi'},
  aiKyDuoc:   {ten: 'Mốc này ai ký được'},
  thangBac:   {ten: 'Thang nấc và mốc chu kỳ đang đặt ở đâu'}
};

/** Ai đứng trong phòng tài chính, hoặc là quản lý tầng trên. */
async function trongPhong(db, hoSo) {
  const lv = BAC[hoSo.role] || 99;
  const q = await quyenCua(db, hoSo.u);
  return {duoc: lv <= 3 || q.keToanThu || q.keToanChi || q.keToanTruong,
    quyen: q, lv};
}

/* Danh sách người của phòng, kèm vai — dùng để trả lời "ai ký được".
   Chỉ TÊN TÀI KHOẢN và VỊ TRÍ: đủ để đi tìm người, không hơn. */
async function nguoiCuaPhong(db) {
  const bay = new Date().toISOString();
  const r = await db.prepare(
    'SELECT q.username, q.chucNang, q.mocToiDa, u.role FROM quyenTaiChinh q ' +
    'LEFT JOIN users u ON u.username = q.username ' +
    'WHERE q.thuHoiLuc IS NULL AND (q.hetHan IS NULL OR q.hetHan > ?) ' +
    'ORDER BY q.chucNang, q.username LIMIT 60'
  ).bind(bay).all();
  return (r.results || []).map(x => ({username: x.username, viTri: x.chucNang,
    tenViTri: (VI_TRI_TC[x.chucNang] || {}).ten || x.chucNang,
    mocToiDa: x.mocToiDa || undefined, role: x.role || undefined}));
}

/* Ai đủ tư cách xác nhận ở MỘT MỐC, hôm nay.

   Hai đường vào, và trợ lý phải nêu CẢ HAI vì chúng dẫn tới hai việc
   khác nhau: đi tìm đúng người có vai, hay đi xin cấp hạn mức cho kế
   toán trưởng. Nêu mỗi đường thứ nhất thì mọi khoản lớn đều dồn lên
   Giám đốc, và đó chính là chỗ chủ hệ dựng đường thứ hai để tránh. */
async function aiKyDuocMoc(db, moc) {
  const ds = await nguoiCuaPhong(db);
  const theoVai = await db.prepare(
    'SELECT username, role FROM users WHERE role = ? LIMIT 20'
  ).bind(moc.vai === 'keToan' ? 'R03' : moc.vai).all();

  const i = MOC_CHU_KY.findIndex(x => x.ma === moc.ma);
  const theoHanMuc = ds.filter(x => x.viTri === 'keToanTruong' && x.mocToiDa &&
    MOC_CHU_KY.findIndex(m => m.ma === x.mocToiDa) >= i);

  return {
    /* Mốc C0 do kế toán chi ký, không phải một vai trên thang. */
    theoViTri: moc.vai === 'keToan'
      ? ds.filter(x => x.viTri === 'keToanChi' || x.viTri === 'keToanTruong')
          .map(x => ({username: x.username, vi: x.tenViTri}))
      : theoHanMuc.map(x => ({username: x.username,
          vi: 'Kế toán trưởng, hạn mức tới ' + x.mocToiDa})),
    theoVai: moc.vai === 'keToan' ? []
      : (theoVai.results || []).map(x => ({username: x.username,
          vi: moc.tenVai + ' (' + x.role + ')'})),
    vaiCan: moc.tenVai};
}

/* ═══════════════ CỬA CHÍNH ═══════════════ */
export async function hoiTroLyTaiChinh(y, env, db, hoSo) {
  const {duoc, quyen} = await trongPhong(db, hoSo);
  if (!duoc) return {ok: false, code: 'NOPERM',
    error: 'Trợ lý tài chính chỉ trả lời cho R01–R03 và người của phòng tài chính.'};

  const hoi = String(y.hoi || '').trim();
  if (!CAU_HOI[hoi]) return {ok: false, code: 'CHUABIET',
    error: 'Câu này tôi chưa trả lời được. Tôi đọc sổ thật nên chỉ dám trả lời ' +
           'những câu có căn cứ đọc được — đoán một câu về tiền thì sai một lần ' +
           'là hết dùng được.',
    traLoiDuoc: Object.keys(CAU_HOI).map(k => ({hoi: k, ten: CAU_HOI[k].ten}))};

  if (hoi === 'khoanChi')    return await soiKhoanChi(y, db, hoSo, quyen);
  if (hoi === 'chuKyCuaToi') return await soiChuKy(y, db, hoSo, quyen);
  if (hoi === 'viecCuaToi')  return await soiViec(y, db, hoSo, quyen);
  if (hoi === 'aiKyDuoc')    return await soiAiKy(y, db, hoSo);
  return soiThangBac();
}

/* ═══════════════ CÂU 1 · KHOẢN CHI NÀY CẦN GÌ ═══════════════ */
async function soiKhoanChi(y, db, hoSo, quyen) {
  const cp = await db.prepare('SELECT * FROM chiPhi WHERE id = ?')
    .bind(String(y.id || '')).first();
  if (!cp) return {ok: false, error: 'Không tìm thấy khoản chi này.'};

  /* ĐÚNG HAI HÀM MÀ CỔNG DUYỆT GỌI. Không tính lại một phép nào. */
  const gp = await giaiPhauChi(db, cp);
  const vuong = vuongCuaNao(cp, hoSo, quyen, gp);

  const daKy = gp.chuKyThu - 1;
  const conThieu = Math.max(0, gp.canKy - daKy);
  const tra = [];

  tra.push('Khoản ' + dinhDang(cp.soTien) + ' · ' +
    (KHOAN_MUC[cp.khoanMuc] || cp.khoanMuc) + ' · ' + String(cp.dienGiai).slice(0, 120));
  tra.push('Nấc ' + gp.nac.ma + ' — ' + gp.nac.ten + '. ' + gp.nac.viec);
  tra.push('Tuần ' + gp.ck.ky + ': người đề xuất đã chi ' + dinhDang(gp.ck.tong) +
    ' qua ' + gp.ck.so + ' khoản — mốc ' + gp.moc.ma + '. ' + gp.moc.viec);
  tra.push(gp.canKy === 1
    ? 'Cần 1 chữ ký. Đã có ' + daKy + '.'
    : 'Cần ' + gp.canKy + ' chữ ký khác nhau — ' + Math.max(1, gp.nac.soDuyet) +
      ' của nấc ' + gp.nac.ma + ' cộng ' + gp.moc.themChuKy + ' của mốc ' +
      gp.moc.ma + '. Đã có ' + daKy + ', còn thiếu ' + conThieu + '.');

  if (cp.trangThai !== 'choDuyet')
    tra.push('Khoản này đang ở trạng thái "' + cp.trangThai + '" — không còn chờ ký.');
  else if (!vuong)
    tra.push('BẠN KÝ ĐƯỢC khoản này bây giờ.' + (conThieu > 1
      ? ' Ký xong vẫn còn thiếu ' + (conThieu - 1) + ' chữ ký nữa, tiền chưa ra.'
      : ' Đây là chữ ký cuối — ký xong là tiền ra và khoản vào sổ.'));
  else
    tra.push('BẠN CHƯA KÝ ĐƯỢC: ' + vuong.error);

  const canCu = [
    {ma: gp.nac.ma, ten: 'Nấc thang duyệt chi — neo vào ' + gp.nac.neo},
    {ma: gp.moc.ma, ten: 'Mốc chu kỳ ' + CHU_KY + ' — vai ' + gp.moc.tenVai}
  ];

  const ra = {ok: true, hoi: 'khoanChi', tra, canCu,
    soLieu: {soTien: Number(cp.soTien), nac: gp.nac.ma, moc: gp.moc.ma,
      tongChuKy: gp.ck.tong, ky: gp.ck.ky, canKy: gp.canKy, daKy, conThieu,
      trangThai: cp.trangThai},
    /* Mã vướng trả về NGUYÊN VĂN mã của cổng. Bộ thử đối chiếu chính ô
       này với mã mà duyetChi trả về, nên nó không được diễn giải lại. */
    kyDuoc: !vuong && cp.trangThai === 'choDuyet',
    maVuong: vuong ? (vuong.code || 'KHAC') : undefined};

  /* ── CHẶN Ở MỐC THÌ CHỈ NGƯỜI, KHÔNG CHỈ ĐƯỜNG VÒNG ── */
  if (vuong && vuong.code === 'CHUADUMOC') {
    ra.aiKyDuoc = await aiKyDuocMoc(db, gp.moc);
    ra.khongGoiY = {
      vi: 'Tôi không chỉ đường để khỏi phải xin ký. Hai đường quen thuộc đều đã ' +
          'có người canh, nên đi vòng chỉ mất thêm thời gian:',
      duong: [
        'Tách một khoản làm nhiều khoản nhỏ — phép gộp ' + NGAY_GOP +
          ' ngày cộng lại theo khoản mục và đẩy về đúng nấc.',
        'Dời sang tuần sau — trần chu kỳ ' + dinhDang(TRAN_CHU_KY) +
          ' cộng TỔNG mọi khoản mục của một người trong kỳ, nên nó vẫn chạm.'
      ],
      nen: 'Đường ngắn nhất là gửi cho một trong những người ở trên ký.'};
  }
  return ra;
}

/* ═══════════════ CÂU 2 · TUẦN NÀY TÔI ĐÃ CHI BAO NHIÊU ═══════════════ */
async function soiChuKy(y, db, hoSo, quyen) {
  /* Xem chu kỳ của NGƯỜI KHÁC là việc của quản lý phòng và tầng trên.
     Kế toán chi xem được sổ chi qua báo cáo chi; nhưng "tuần này người
     P đã chi bao nhiêu" là một câu về MỘT NGƯỜI, và câu ấy chỉ đúng
     chỗ khi người hỏi có trách nhiệm với người ấy. */
  const nguoi = String(y.nguoi || '').trim() || hoSo.u;
  const lv = BAC[hoSo.role] || 99;
  if (nguoi !== hoSo.u && lv > 3 && !quyen.keToanTruong)
    return {ok: false, code: 'NOPERM',
      error: 'Xem chu kỳ chi của người khác cần vai R01–R03 hoặc vị trí Kế toán trưởng.'};

  /* Gọi thẳng tongChuKy chứ không dựng một dòng chiPhi giả để đưa vào
     giaiPhauChi: một dòng giả chạy qua được hôm nay vì giaiPhauChi tình
     cờ chỉ đọc hai trường của nó, và ngày nó đọc thêm trường thứ ba thì
     chỗ này sai mà không ai nhớ có một dòng giả nằm đây. */
  const ck = await tongChuKy(db, nguoi, new Date().toISOString());
  const moc = mocCua(ck.tong);
  const sau = MOC_CHU_KY[MOC_CHU_KY.findIndex(x => x.ma === moc.ma) + 1];

  const tra = [];
  tra.push('Tuần ' + ck.ky + ': ' + (nguoi === hoSo.u ? 'bạn' : nguoi) +
    ' đã chi ' + dinhDang(ck.tong) + ' qua ' + ck.so + ' khoản ' +
    '(tính cả khoản đang chờ duyệt — tiền chưa ra vẫn là tiền đã hứa ra).');
  tra.push('Đang ở mốc ' + moc.ma + '. ' + moc.viec);
  tra.push(sau
    ? 'Còn ' + dinhDang(sau.tu - ck.tong) + ' nữa thì chạm mốc ' + sau.ma +
      ' — lúc ấy ' + sau.viec.charAt(0).toLowerCase() + sau.viec.slice(1)
    : 'Đây là mốc cao nhất của thang.');

  return {ok: true, hoi: 'chuKyCuaToi', tra,
    canCu: [{ma: moc.ma, ten: 'Mốc chu kỳ ' + CHU_KY},
            {ma: 'TRAN_CHU_KY', ten: 'Trần chu kỳ ' + dinhDang(TRAN_CHU_KY) +
              ' — tổng MỌI khoản mục của một người'}],
    soLieu: {ky: ck.ky, tong: ck.tong, so: ck.so, moc: moc.ma,
      mocSau: sau ? sau.ma : null,
      conCachMocSau: sau ? sau.tu - ck.tong : null}};
}

/* ═══════════════ CÂU 3 · VIỆC GÌ ĐANG CHỜ TÔI ═══════════════

   Xếp theo TIỀN ĐANG TREO chứ không theo thời gian: một khoản 50 triệu
   chờ ba ngày đáng xem trước một khoản 200 nghìn chờ mười ngày. Nhưng
   số ngày treo vẫn nêu ra, vì đó là thứ KPI đo. */
async function soiViec(y, db, hoSo, quyen) {
  const lv = BAC[hoSo.role] || 99;
  const dauChi = oDauTien(quyen, 'chi') || lv <= 3;
  const dauThu = oDauTien(quyen, 'thu') || lv <= 3;
  const tra = [], viec = [];

  if (dauChi) {
    const r = await db.prepare(
      "SELECT * FROM chiPhi WHERE trangThai = 'choDuyet' AND nguoiDeXuat <> ? " +
      'ORDER BY soTien DESC LIMIT 40'
    ).bind(hoSo.u).all();
    for (const cp of (r.results || [])) {
      const gp = await giaiPhauChi(db, cp);
      const vuong = vuongCuaNao(cp, hoSo, quyen, gp);
      const treo = Math.floor((Date.now() - new Date(cp.ngayChi).getTime()) / 86400000);
      viec.push({loai: 'chi', id: cp.id, soTien: Number(cp.soTien),
        dienGiai: String(cp.dienGiai).slice(0, 100),
        nac: gp.nac.ma, moc: gp.moc.ma, soNgayTreo: treo > 0 ? treo : 0,
        kyDuoc: !vuong, maVuong: vuong ? (vuong.code || 'KHAC') : undefined,
        /* Vướng vì mốc thì nó KHÔNG phải việc của người này — nó là việc
           của người khác, và nêu nó lẫn vào danh sách "việc của tôi" là
           làm danh sách ấy dài ra bằng những dòng không bấm được. */
        cuaAiKhac: !!(vuong && vuong.code === 'CHUADUMOC')});
    }
  }
  if (dauThu) {
    const r = await db.prepare(
      "SELECT COUNT(*) n, COALESCE(SUM(soTien),0) t FROM phieuThu WHERE trangThai = 'choDuyet'"
    ).first();
    if (Number(r.n)) viec.push({loai: 'thu', so: Number(r.n), soTien: Number(r.t)});
  }

  const kyDuoc = viec.filter(x => x.loai === 'chi' && x.kyDuoc);
  const cuaKhac = viec.filter(x => x.cuaAiKhac);
  const oThu = viec.find(x => x.loai === 'thu');

  if (!dauChi && !dauThu)
    tra.push('Bạn chưa có vị trí nào trong phòng tài chính, nên chưa có việc nào ' +
      'ở đây chờ bạn.');
  if (oThu) tra.push('Đầu THU: ' + oThu.so + ' phiếu thu chờ duyệt, tổng ' +
    dinhDang(oThu.soTien) + '.');
  if (dauChi) tra.push(kyDuoc.length
    ? 'Đầu CHI: ' + kyDuoc.length + ' khoản bạn ký được ngay, tổng ' +
      dinhDang(kyDuoc.reduce((s, x) => s + x.soTien, 0)) + '.'
    : 'Đầu CHI: không có khoản nào đang chờ chữ ký của bạn.');
  if (cuaKhac.length)
    tra.push(cuaKhac.length + ' khoản nữa đang treo nhưng CHỜ NGƯỜI KHÁC — chúng ' +
      'đã chạm mốc chu kỳ và cần vai cao hơn xác nhận. Nêu ra để bạn biết mà giục, ' +
      'không phải để bạn ký.');

  const lau = viec.filter(x => x.loai === 'chi' && x.soNgayTreo >= 3);
  if (lau.length) tra.push(lau.length + ' khoản đã treo từ 3 ngày trở lên. ' +
    'Từ chối thì nói từ chối — để treo là không quyết mà cũng không nói, và ' +
    'thước KT-C2 đo đúng chỗ này.');

  return {ok: true, hoi: 'viecCuaToi', tra,
    canCu: [{ma: 'KT-C2', ten: 'Thước KPI khoản chi treo quá 3 ngày'},
            {ma: 'VI_TRI_TC', ten: 'Việc chia theo VỊ TRÍ trong phòng, không theo vai'}],
    soLieu: {kyDuoc: kyDuoc.length, cuaAiKhac: cuaKhac.length,
      phieuThuChoDuyet: oThu ? oThu.so : 0, treoTuBaNgay: lau.length},
    viec};
}

/* ═══════════════ CÂU 4 · MỐC NÀY AI KÝ ĐƯỢC ═══════════════ */
async function soiAiKy(y, db, hoSo) {
  const ma = String(y.moc || '').trim();
  const moc = MOC_CHU_KY.find(x => x.ma === ma) ||
    (y.tong !== undefined ? mocCua(Number(y.tong)) : null);
  if (!moc) return {ok: false,
    error: 'Cho tôi một mã mốc (' + MOC_CHU_KY.map(x => x.ma).join(', ') +
           ') hoặc một số tiền tổng chu kỳ.'};

  const ai = await aiKyDuocMoc(db, moc);
  const tra = ['Mốc ' + moc.ma + ' — từ ' + dinhDang(moc.tu) + ' trở lên. ' + moc.viec];

  if (ai.theoVai.length)
    tra.push('Theo vai: ' + ai.theoVai.map(x => x.username).join(', ') + '.');
  if (ai.theoViTri.length)
    tra.push((moc.vai === 'keToan' ? 'Theo vị trí trong phòng: ' :
      'Theo hạn mức được cấp: ') + ai.theoViTri.map(x => x.username).join(', ') + '.');
  if (!ai.theoVai.length && !ai.theoViTri.length)
    tra.push('HÔM NAY KHÔNG AI KÝ ĐƯỢC MỐC NÀY. Cần một người vai ' + moc.tenVai +
      ', hoặc Super Admin cấp hạn mức tới ' + moc.ma + ' cho kế toán trưởng. ' +
      'Đây là chỗ tiền đứng lại vì thiếu người, không vì thiếu luật.');

  return {ok: true, hoi: 'aiKyDuoc', tra,
    canCu: [{ma: moc.ma, ten: 'Mốc chu kỳ ' + CHU_KY + ' — vai ' + moc.tenVai},
            {ma: 'keToanTruong', ten: 'Đường thứ hai: hạn mức cấp cho kế toán trưởng'}],
    soLieu: {moc: moc.ma, tu: moc.tu, vaiCan: moc.tenVai,
      soNguoiKyDuoc: ai.theoVai.length + ai.theoViTri.length},
    aiKyDuoc: ai};
}

/* ═══════════════ CÂU 5 · THANG ĐANG ĐẶT Ở ĐÂU ═══════════════ */
function soiThangBac() {
  return {ok: true, hoi: 'thangBac',
    tra: [
      'Hai thang chồng lên nhau, và một khoản chi phải qua CẢ HAI.',
      'Thang NẤC nhìn MỘT KHOẢN: ' + NAC_THANG.map(n =>
        n.ma + ' từ ' + dinhDang(n.tu)).join(' · ') + '.',
      'Thang MỐC nhìn TỔNG một người trong một ' + CHU_KY + ': ' +
        MOC_CHU_KY.map(m => m.ma + ' từ ' + dinhDang(m.tu)).join(' · ') + '.',
      'Số chữ ký cần = chữ ký của nấc + chữ ký thêm của mốc. Nên một khoản ' +
        'nhỏ trong một tuần lớn vẫn phải qua vai cao — đó là điểm của việc có ' +
        'hai thang: một cái nhìn theo hàng NGANG, một cái nhìn theo cột DỌC, ' +
        'và không cái nào thay được cái kia.',
      'Từ ' + dinhDang(TRAN_PHAI_DUYET) + ' trở lên là phải xin duyệt VÀ phải ' +
        'vào báo cáo chi — một ngưỡng, hai nghĩa vụ.'
    ],
    canCu: [{ma: 'NAC_THANG', ten: 'Thang nấc, neo vào giá gói học phí'},
            {ma: 'MOC_CHU_KY', ten: 'Mốc chu kỳ ' + CHU_KY}],
    soLieu: {tranPhaiDuyet: TRAN_PHAI_DUYET, tranChuKy: TRAN_CHU_KY,
      chuKy: CHU_KY, ngayGop: NGAY_GOP},
    nac: NAC_THANG.map(n => ({ma: n.ma, ten: n.ten, tu: n.tu, neo: n.neo,
      soDuyet: n.soDuyet, viec: n.viec})),
    moc: MOC_CHU_KY.map(m => ({ma: m.ma, tu: m.tu, vai: m.tenVai,
      themChuKy: m.themChuKy, viec: m.viec}))};
}

export { CAU_HOI };
