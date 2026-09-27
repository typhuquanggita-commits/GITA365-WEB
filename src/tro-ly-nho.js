/* ═══════════════════════════════════════════════════════════════
   GITA 365 · v9.76 — TRỢ LÝ NHỚ LƯỢT TRƯỚC

   VẤN ĐỀ

   Tới 9.75 trợ lý trả lời từng câu một, và mỗi câu đứng riêng. Hỏi
   "bộ hồ sơ gồm những hợp đồng nào" thì nó liệt kê. Hỏi tiếp "còn
   cái nào nữa" thì nó đem đúng bốn tiếng ấy đi tra kho — và tra ra
   một thứ chẳng liên quan gì.

   Đó là cách nói của người: câu thứ hai lược đi phần đã nói. Máy
   không nhớ thì người phải gõ lại cả câu mỗi lượt, và tới lượt thứ
   ba thì họ thôi hỏi.

   BỐN KIỂU NÓI TIẾP

     CÒN NỮA   "còn cái nào nữa", "tiếp"      → phần chưa hiện của kho cũ
     MỤC       "cái thứ ba", "mục 5"          → mở đúng mục ấy
     CHI TIẾT  "nói rõ hơn", "vì sao"         → mở ruột mục đang nói
     GỌN LẠI   "ngắn hơn", "nói cho con"      → cùng nội dung, ít dòng

   BA CHỖ KHÔNG ĐƯỢC PHÉP HỎNG, VÀ CẢ BA ĐỀU CÓ KHOÁ

   1. LƯỚI KHẨN SOI CÂU VỪA GÕ, KHÔNG SOI CÂU ĐÃ DỰNG LẠI.
      Một phụ huynh đang hỏi về học phí, lượt sau gõ "con nói muốn
      chết" — bốn tiếng, rất ngắn, trông hệt một câu nói tiếp. Nếu
      lưới khẩn soi câu đã dựng lại thì nó soi "học phí…" và không
      bao giờ nhìn thấy bốn tiếng kia. Nên thứ tự là: KHẨN trước,
      dựng lại sau. Không có ngoại lệ nào.

   2. CẤP KHÔNG HẠ ĐƯỢC BẰNG CÁCH HỎI CỤT.
      Hỏi "nhà tôi dừng giữa chừng thì hoàn tiền bao nhiêu" là cấp 6,
      phải chờ người bật. Hỏi tiếp "còn nữa" mà máy chấm lại từ đầu
      thì bốn tiếng ấy ra cấp 1 và máy tự trả lời — đúng cái mà cả
      thang độ khó dựng lên để chặn. Nên ngữ cảnh mang theo CẤP, và
      lượt nối tiếp lấy cấp CAO HƠN giữa cấp cũ và cấp mới.

   3. NGỮ CẢNH KHÔNG ĐI QUA LƯỢT ĐĂNG NHẬP KHÁC.
      Ngữ cảnh giữ mã bản ghi của kho vai trước được cấp. Một máy vừa
      đăng nhập Coach rồi đăng nhập lại bằng phụ huynh mà ngữ cảnh
      còn nguyên thì phụ huynh gõ "còn nữa" là mở tiếp kho nghề. Cùng
      lớp lỗi mà mục 40 của bộ kiểm canh với dữ liệu nghề.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;

(function () {

function boDau(s) {
  return String(s == null ? '' : s).toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd').replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ').trim();
}

/* ═══════ NGỮ CẢNH ═══════
   Sống trong bộ nhớ phiên, KHÔNG ghi ra đĩa. Ngữ cảnh mang mã bản
   ghi của kho vai hiện tại; ghi xuống đĩa là để nó sống lâu hơn
   phiên đăng nhập, và lúc ấy nó thành một đường rò. */
G.TL_NGU = null;

/* Ngữ cảnh cũ quá thì bỏ. Nửa giờ là mốc: lâu hơn thế thì "còn nữa"
   gần như chắc chắn nói về một chuyện khác, và dựng lại theo ngữ
   cảnh cũ là trả lời lạc đề mà rất tự tin. */
var HAN_NGU = 30 * 60e3;

G.tlQuenNgu = function () { G.TL_NGU = null; };

G.tlGhiNgu = function (cauHoi, soan, cap, congDon) {
  var u = (G.S && G.S.acc && G.S.acc.u) || '';
  if (!soan || !soan.kho) { G.TL_NGU = null; return null; }
  /* ── daHien PHẢI CỘNG DỒN QUA CÁC LƯỢT "CÒN NỮA" ──
     Bản đầu ghi đè, và bộ đo hội thoại bắt ngay: gõ "còn nữa" hai lần
     liền thì lượt hai đưa ra lại đúng mười hai mục đã hiện ở lượt
     một. Người dùng thấy một danh sách quay vòng và không bao giờ tới
     được cuối kho. */
  var cu = (congDon && G.TL_NGU && G.TL_NGU.kho === soan.kho)
    ? (G.TL_NGU.daHien || []) : [];
  var moi = (soan.dong || []).map(function (d) { return d.nhan; });
  var gop = cu.slice(), co = {};
  cu.forEach(function (m) { co[m] = 1; });
  moi.forEach(function (m) { if (!co[m]) { co[m] = 1; gop.push(m); } });

  G.TL_NGU = {
    u: u,
    hoi: String(cauHoi || ''),
    kho: soan.kho, loai: soan.loai, y: soan.y,
    /* Mã của những mục ĐÃ hiện ra, để lượt "còn nữa" biết chỗ tiếp. */
    daHien: gop,
    cap: Number(cap) || 1,
    luc: Date.now()
  };
  return G.TL_NGU;
};

function nguConDung() {
  var n = G.TL_NGU;
  if (!n) return null;
  var u = (G.S && G.S.acc && G.S.acc.u) || '';
  if (n.u !== u) { G.TL_NGU = null; return null; }      /* đổi vai thì quên */
  if (Date.now() - n.luc > HAN_NGU) { G.TL_NGU = null; return null; }
  return n;
}

/* ═══════ NHẬN RA CÂU NÓI TIẾP ═══════

   Ba điều kiện CÙNG LÚC, thiếu một là không phải nói tiếp:
     · có ngữ cảnh còn dùng được
     · câu NGẮN — nói tiếp thì người ta lược, không viết dài
     · có dấu hiệu nói tiếp

   Điều kiện "ngắn" quan trọng hơn vẻ ngoài của nó: bỏ nó ra thì một
   câu hỏi mới có chữ "còn" ở giữa cũng bị hiểu thành nói tiếp, và
   trợ lý trả lời một câu mà người ta không hỏi. */
var DAU = [
  { kieu: 'CON_NUA', re: /^(con|xem|cho xem|liet ke)?\s*(nua|tiep|them|con nua|con gi nua|con cai nao|con cai gi|het|day du|tat ca)\b/ },
  { kieu: 'MUC',     re: /\b(cai|muc|so|dieu|buoc|cua|luat|cap|bac)\s+(thu\s+)?(\d{1,3}|mot|hai|ba|bon|tu|nam|sau|bay|tam|chin|muoi|dau|dau tien|cuoi|cuoi cung)\b/ },
  { kieu: 'CHITIET', re: /\b(chi tiet|noi ro|ro hon|cu the|giai thich|vi sao|tai sao|nghia la sao|the nao)\b/ },
  { kieu: 'GONLAI',  re: /\b(ngan hon|gon hon|ngan gon|de hieu hon|noi cho con|cho con doc|cho phu huynh|tom lai|tom tat)\b/ }
];
var SO_CHU = { mot: 1, hai: 2, ba: 3, bon: 4, tu: 4, nam: 5, sau: 6, bay: 7,
  tam: 8, chin: 9, muoi: 10 };

G.tlDocNoiTiep = function (cauHoi) {
  var n = nguConDung();
  if (!n) return { la: false, vi: 'chưa có ngữ cảnh' };
  var chu = boDau(cauHoi);
  var soTieng = chu ? chu.split(' ').length : 0;
  if (soTieng > 8) return { la: false, vi: 'câu dài — đây là câu hỏi mới' };

  for (var i = 0; i < DAU.length; i++) {
    var m = chu.match(DAU[i].re);
    if (!m) continue;
    var r = { la: true, kieu: DAU[i].kieu, ngu: n };
    if (DAU[i].kieu === 'MUC') {
      var t = m[3];
      r.chiSo = /^\d+$/.test(t) ? parseInt(t, 10)
        : (t.indexOf('cuoi') === 0 ? -1
          : (t.indexOf('dau') === 0 ? 1 : (SO_CHU[t] || 0)));
      if (!r.chiSo) return { la: false, vi: 'không đọc được thứ tự' };
    }
    return r;
  }
  return { la: false, vi: 'không có dấu hiệu nói tiếp' };
};

/* ═══════ DỰNG LẠI CÂU HỎI ĐẦY ĐỦ ═══════
   Trả về câu hỏi mà lượt này THẬT SỰ đang hỏi, để mọi tầng phía sau —
   chấm độ khó, tra kho, soạn — làm việc trên một câu hoàn chỉnh. */
G.tlDungLai = function (cauHoi, t) {
  if (!t || !t.la) return cauHoi;
  var n = t.ngu;
  /* MỤC không dựng lại thành mã nữa — tlSoanTiep đọc thẳng từ kho đã
     nói. Nhưng câu dựng lại vẫn phải là câu CŨ, để phần chấm độ khó
     và phần tra kho làm việc trên đúng chuyện đang nói. */
  /* Ba kiểu còn lại hỏi tiếp về CÙNG kho, nên dựng lại bằng chính câu
     trước. Giữ nguyên câu cũ chứ không ghép thêm chữ: ghép thêm là
     đổi trọng số tra kho và kết quả lệch khỏi lượt trước. */
  return n.hoi;
};

/* ═══════ SOẠN LẠI THEO KIỂU NÓI TIẾP ═══════ */
/* Tham số trongTang: phép phá truyền một trần giả vào đây thay vì
   TRÁO G.tlBanGhiKho.

   Đây là lần THỨ BA cùng một cái bẫy trong ba bản liền — 9.74 với
   G.aiCoKhan, 9.75 với G.aiTrongTang, 9.76 với G.tlBanGhiKho — và
   mục 67 của bộ kiểm bắt được cả ba. Nên ghi thành một luật của kho
   này: PHÉP PHÁ TRUYỀN VÀO, KHÔNG BAO GIỜ TRÁO MỘT TÊN TRÊN G.

   Lý do không đổi qua ba lần: một phép phá ném lỗi giữa chừng thì
   hàm bị tráo nằm nguyên trạng thái giả suốt phiên còn lại, và cả ba
   lần ấy đều là một lớp bảo vệ — lưới khẩn, trần tầng, trần tầng. */
G.tlSoanTiep = function (t, soan, kq, trongTang) {
  if (!t || !t.la) return soan;
  var n = t.ngu;
  function docKho(k) {
    return G.tlBanGhiKho ? G.tlBanGhiKho(k, kq ? kq.tangNha : null, trongTang) : [];
  }

  if (t.kieu === 'MUC') {
    /* Mở thẳng từ kho ĐÃ NÓI, không đi vòng qua tra kho.
       Đi vòng thì mã va nhau: "cái thứ ba" của bộ hồ sơ hợp đồng
       dựng lại thành "HĐ-03", và tra kho trả về HD-03 của HD_CHUAN —
       cùng ba ký tự sau khi bỏ dấu, khác hẳn kho. Đã biết kho rồi thì
       đọc thẳng, không đoán lại. */
    var ds = docKho(n.kho);
    var maCan = (n.daHien || [])[t.chiSo === -1 ? (n.daHien || []).length - 1 : t.chiSo - 1];
    var x = ds.filter(function (o) { return o.ma === maCan; })[0];
    if (!x) return soan;
    var dong = [];
    var g = x.goc || {};
    Object.keys(g).forEach(function (k) {
      var v = g[k];
      if (v == null || v === '' || typeof v === 'object') return;
      if (String(v) === x.ten) return;
      dong.push({ nhan: k.replace(/([a-z0-9])([A-Z])/g, '$1 $2'), chu: String(v) });
    });
    return { y: 'MA', kho: n.kho, loai: n.loai,
      cau: x.ma + ' — ' + x.ten, dong: dong.slice(0, 8),
      conNua: Math.max(0, dong.length - 8), nguon: [x.ma] };
  }

  if (t.kieu === 'CON_NUA') {
    /* Phần CHƯA hiện của đúng kho ấy. Đọc lại qua tlBanGhiKho nên
       trần tầng chạy lại từ đầu — không dùng lại danh sách cũ, vì
       tầng của nhà có thể đã đổi giữa hai lượt. */
    var ds = docKho(n.kho);
    var da = {};
    (n.daHien || []).forEach(function (m) { da[m] = 1; });
    var con = ds.filter(function (x) { return !da[x.ma]; });
    if (!con.length)
      return { y: 'HET', kho: n.kho, loai: n.loai, so: ds.length,
        cau: 'Đã hiện hết ' + ds.length + ' mục của ' + n.loai + '. Không còn mục nào.',
        dong: [], conNua: 0, nguon: [] };
    return { y: 'CON_NUA', kho: n.kho, loai: n.loai, so: ds.length,
      cau: 'Còn ' + con.length + ' mục nữa trong ' + n.loai + ':',
      dong: con.slice(0, 20).map(function (x) { return { nhan: x.ma, chu: x.ten }; }),
      conNua: Math.max(0, con.length - 20),
      nguon: con.slice(0, 20).map(function (x) { return x.ma; }) };
  }

  /* Chỉ GỌN LẠI cần bản soạn cũ — nó BỚT ĐI từ bản ấy. CÒN NỮA và
     MỤC tự dựng từ kho, nên chặn !soan trước chúng là chặn nhầm: hai
     khoá tnSoiConNua và tnSoiVanTheoTang gọi với soan rỗng và cả hai
     báo "không soạn được gì". */
  if (!soan) return soan;

  if (t.kieu === 'GONLAI') {
    /* Cùng nội dung, ít dòng hơn, KHÔNG viết lại câu nào. Rút gọn ở
       đây là BỚT ĐI, không phải diễn đạt lại — diễn đạt lại là sinh
       chữ mới, mà bộ soạn không được sinh chữ. */
    return { y: 'GONLAI', kho: soan.kho, loai: soan.loai, so: soan.so,
      cau: soan.cau,
      dong: (soan.dong || []).slice(0, 5).map(function (d) {
        return { nhan: d.nhan, chu: String(d.chu).split(' — ')[0].slice(0, 90) };
      }),
      conNua: Math.max(0, (soan.dong || []).length - 5),
      nguon: soan.nguon };
  }

  return soan;      /* MUC và CHITIET đã đi qua đường dựng lại câu hỏi */
};

/* ═══════════════════════════════════════════════════════════════
   KHOÁ — NĂM ĐIỀU CHỨNG MINH BẰNG CÁCH CHẠY
   ═══════════════════════════════════════════════════════════════ */

/* 1 · Nhận đúng bốn kiểu nói tiếp, và KHÔNG nhận nhầm câu hỏi mới. */
G.tnSoiNhanRa = function () {
  var loi = [];
  G.tlGhiNgu('bộ hồ sơ gồm những hợp đồng nào',
    { kho: 'HSH_HD', loai: 'Hồ sơ hợp đồng', y: 'LIETKE',
      dong: [{ nhan: 'HĐ-01' }, { nhan: 'HĐ-02' }, { nhan: 'HĐ-03' }] }, 1);

  [['còn cái nào nữa', 'CON_NUA'], ['tiếp', 'CON_NUA'],
   ['cái thứ ba', 'MUC'], ['mục 2', 'MUC'],
   ['nói rõ hơn', 'CHITIET'], ['vì sao', 'CHITIET'],
   ['ngắn hơn', 'GONLAI'], ['nói cho phụ huynh', 'GONLAI']
  ].forEach(function (p) {
    var t = G.tlDocNoiTiep(p[0]);
    if (!t.la || t.kieu !== p[1])
      loi.push('"' + p[0] + '" đọc ra ' + (t.la ? t.kieu : 'KHÔNG PHẢI NỐI TIẾP') +
        ', đáng lẽ ' + p[1]);
  });

  /* KHÔNG được nhận nhầm: câu dài là câu hỏi mới, kể cả khi có chữ
     "còn" hay "chi tiết" trong đó. */
  ['nhà tôi còn bao nhiêu ngày nữa thì xong tầng ba',
   'cho tôi xem chi tiết hợp đồng lao động của Coach đồng hành',
   'con tôi nói muốn chết'
  ].forEach(function (q) {
    var t = G.tlDocNoiTiep(q);
    if (t.la) loi.push('"' + q.slice(0, 40) + '" bị nhận nhầm thành nối tiếp ' + t.kieu);
  });

  /* Chỉ số đọc đúng */
  var t3 = G.tlDocNoiTiep('cái thứ ba');
  if (t3.la && t3.chiSo !== 3) loi.push('"cái thứ ba" ra chỉ số ' + t3.chiSo);
  var tc = G.tlDocNoiTiep('cái cuối');
  if (tc.la && tc.chiSo !== -1) loi.push('"cái cuối" ra chỉ số ' + tc.chiSo);
  G.tlQuenNgu();
  return { chuaDo: false, loi: loi };
};

/* 2 · Ngữ cảnh QUÊN khi đổi vai đăng nhập.
      Không tráo hàm nào — chỉ đổi G.S.acc, đúng thứ lượt đăng nhập
      thật sự đổi. */
G.tnSoiQuenKhiDoiVai = function () {
  var loi = [];
  var giu = G.S && G.S.acc;
  G.tlGhiNgu('câu thử', { kho: 'HSH_HD', loai: 'Hồ sơ hợp đồng', y: 'LIETKE',
    dong: [{ nhan: 'HĐ-01' }] }, 1);
  if (!G.TL_NGU) { loi.push('không ghi được ngữ cảnh'); return { chuaDo: false, loi: loi }; }

  if (G.S) G.S.acc = { u: 'nguoi-khac@gita365.vn' };
  var t = G.tlDocNoiTiep('còn nữa');
  if (t.la) loi.push('đổi tài khoản mà ngữ cảnh vẫn còn — vai mới mở tiếp được kho của vai cũ');
  if (G.S) G.S.acc = giu;

  /* Hạn ngữ cảnh: cũ quá thì bỏ */
  G.tlGhiNgu('câu thử', { kho: 'HSH_HD', loai: 'Hồ sơ hợp đồng', y: 'LIETKE',
    dong: [{ nhan: 'HĐ-01' }] }, 1);
  G.TL_NGU.luc = Date.now() - HAN_NGU - 1000;
  if (G.tlDocNoiTiep('còn nữa').la)
    loi.push('ngữ cảnh quá hạn ' + Math.round(HAN_NGU / 60000) + ' phút mà vẫn dùng được');

  G.tlQuenNgu();
  return { chuaDo: false, loi: loi };
};

/* 3 · CẤP KHÔNG HẠ ĐƯỢC BẰNG CÁCH HỎI CỤT.
      Đây là đường vòng nguy nhất mà bộ nhớ ngữ cảnh mở ra, nên nó
      phải được đo bằng chính hai hàm đang chạy, không bằng lời khai. */
G.tnSoiCapKhongHa = function () {
  var loi = [];
  var q1 = 'nhà tôi dừng giữa chừng thì hoàn tiền bao nhiêu';
  var d1 = G.dkDoCap(q1, G.aiTra(q1));
  if (d1.cap < 6) { loi.push('câu gốc chỉ ra cấp ' + d1.cap + ' — mẫu thử không còn hợp'); }

  G.tlGhiNgu(q1, { kho: 'HP_TANG', loai: 'Học phí', y: 'LIETKE',
    dong: [{ nhan: 'T1' }, { nhan: 'T2' }] }, d1.cap);

  var t = G.tlDocNoiTiep('còn nữa');
  if (!t.la) { loi.push('"còn nữa" không được nhận là nối tiếp'); }
  else {
    var capCut = G.dkDoCap('còn nữa', []).cap;
    var capThat = G.tlCapNoiTiep(t, capCut);
    if (capThat < d1.cap)
      loi.push('hỏi cụt "còn nữa" hạ cấp từ ' + d1.cap + ' xuống ' + capThat +
        ' — máy tự trả lời một ca đang chờ người bật');
  }
  G.tlQuenNgu();
  return { chuaDo: false, loi: loi };
};

/* Cấp của một lượt nối tiếp: LỚN HƠN giữa cấp ngữ cảnh và cấp vừa
   chấm. Không lấy cấp ngữ cảnh không thôi — lượt này có thể vừa chạm
   một dấu hiệu NẶNG HƠN lượt trước. */
G.tlCapNoiTiep = function (t, capMoi) {
  if (!t || !t.la) return capMoi;
  return Math.max(Number(t.ngu.cap) || 1, Number(capMoi) || 1);
};

/* 4 · "Còn nữa" đưa ra phần CHƯA hiện, và không lặp lại phần đã hiện. */
G.tnSoiConNua = function () {
  var loi = [];
  var ds = G.tlBanGhiKho ? G.tlBanGhiKho('HSH_HD', null) : [];
  if (ds.length < 6) return { chuaDo: true, thieu: 'HSH_HD quá ít bản ghi', loi: [] };

  var daHien = ds.slice(0, 4).map(function (x) { return x.ma; });
  G.tlGhiNgu('bộ hồ sơ gồm những hợp đồng nào',
    { kho: 'HSH_HD', loai: 'Hồ sơ hợp đồng', y: 'LIETKE',
      dong: daHien.map(function (m) { return { nhan: m }; }) }, 1);

  var t = G.tlDocNoiTiep('còn nữa');
  var s = G.tlSoanTiep(t, null, []);
  if (!s) { loi.push('"còn nữa" không soạn được gì'); G.tlQuenNgu(); return { chuaDo: false, loi: loi }; }
  if (s.y !== 'CON_NUA') loi.push('"còn nữa" ra ý ' + s.y);
  if (s.dong.length !== ds.length - 4)
    loi.push('còn ' + (ds.length - 4) + ' mục mà đưa ra ' + s.dong.length);
  var lap = s.dong.filter(function (d) { return daHien.indexOf(d.nhan) >= 0; });
  if (lap.length) loi.push('lặp lại ' + lap.length + ' mục đã hiện ở lượt trước');

  /* Cộng dồn: ghi tiếp phần vừa hiện rồi hỏi lại, phải KHÔNG lặp */
  G.tlGhiNgu('bộ hồ sơ gồm những hợp đồng nào', s, 1, true);
  var s3 = G.tlSoanTiep(G.tlDocNoiTiep('còn nữa'), null, []);
  if (s3 && s3.y === 'CON_NUA' && s3.dong.length)
    loi.push('gõ "còn nữa" hai lần liền mà lượt hai còn đưa ra ' + s3.dong.length +
      ' mục — daHien đang bị ghi đè thay vì cộng dồn, danh sách quay vòng');

  /* Hiện hết rồi thì nói HẾT, không nói suông một danh sách rỗng */
  G.tlGhiNgu('bộ hồ sơ gồm những hợp đồng nào',
    { kho: 'HSH_HD', loai: 'Hồ sơ hợp đồng', y: 'LIETKE',
      dong: ds.map(function (x) { return { nhan: x.ma }; }) }, 1);
  var s2 = G.tlSoanTiep(G.tlDocNoiTiep('còn nữa'), null, []);
  if (!s2 || s2.y !== 'HET') loi.push('hiện hết rồi mà không nói HẾT');
  G.tlQuenNgu();
  return { chuaDo: false, loi: loi };
};

/* 5 · "Còn nữa" vẫn đi qua trần tầng, không dùng lại danh sách cũ. */
G.tnSoiVanTheoTang = function () {
  var loi = [];
  var het = G.tlBanGhiKho ? G.tlBanGhiKho('HSH_HD', null) : [];
  if (het.length < 6) return { chuaDo: true, thieu: 'HSH_HD quá ít bản ghi', loi: [] };
  G.tlGhiNgu('bộ hồ sơ gồm những hợp đồng nào',
    { kho: 'HSH_HD', loai: 'Hồ sơ hợp đồng', y: 'LIETKE',
      dong: [{ nhan: het[0].ma }] }, 1);

  var truoc = G.tlSoanTiep(G.tlDocNoiTiep('còn nữa'), null, []);
  /* Cắm một trần giả chặn một nửa, rồi đòi con số giảm. Truyền qua
     tlBanGhiKho chứ không tráo G.aiTrongTang — xem 9.75. */
  var dem = 0;
  var sau = G.tlSoanTiep(G.tlDocNoiTiep('còn nữa'), null, [],
    function () { dem++; return { ok: dem % 2 === 0 }; });

  if (!truoc || !sau) loi.push('không soạn được một trong hai lượt');
  else if (sau.dong.length >= truoc.dong.length)
    loi.push('trần giả chặn một nửa mà "còn nữa" vẫn đưa ra ' + sau.dong.length +
      ' mục (trước ' + truoc.dong.length + ') — đang dùng lại danh sách cũ, ' +
      'không đọc lại qua trần tầng');
  G.tlQuenNgu();
  return { chuaDo: false, loi: loi };
};

})();
