/* ═══════════════════════════════════════════════════════════════
   GITA 365 — LÁI WEB APP NHƯ NGƯỜI THẬT
   Chạy: xvfb-run -a node tools/thu-nhu-that.js

   KHÁC GÌ tools/kiem-tra.js

   Bộ kiểm phát hành hỏi "luật có được thi hành không" — 980 phép đo
   trên hàm và trên kho. Nó KHÔNG hỏi "người mở màn này ra thì thấy
   gì". Một màn dựng đúng luật mà trả về ba dòng chữ vẫn qua được cả
   980 phép.

   Bộ này đứng ở phía NGƯỜI DÙNG: đăng nhập thật, bấm qua từng mục
   trong cột trái, và đo bốn thứ mà chỉ người mới thấy —

     · màn NÉM LỖI khi mở
     · màn TRỐNG hoặc gần trống
     · màn CHẬM tới mức người ta tưởng treo
     · màn có chữ GIỮ CHỖ chưa thay ("đang cập nhật", "TODO", "…")

   Và một phần riêng: THỬ NHƯ NGƯỜI CỐ Ý. Đăng nhập vai khách rồi gọi
   thẳng những hàm và kho mà giao diện không cho chạm — vì lọc trên
   màn hình không phải bảo vệ dữ liệu, và kho này đã mắc đúng lớp lỗi
   ấy bốn lần.
   ═══════════════════════════════════════════════════════════════ */
const { chromium } = require(process.env.PW_PATH || '/opt/node22/lib/node_modules/playwright');
const fs = require('fs');

const VAI = ['superadmin@gita365.vn', 'giamdoc@gita365.vn', 'coach@gita365.vn',
  'tuvan@gita365.vn', 'giaovien@gita365.vn', 'phuhuynh@gita365.vn',
  'hocvien@gita365.vn', 'daisu@gita365.vn'];

/* Ngưỡng đặt theo cái người CẢM THẤY, không theo cái máy đo được:
   dưới 900 byte HTML là một màn gần như trống; trên 800 mili-giây là
   lúc người ta bắt đầu nghĩ máy treo. */
const TRONG = 900, CHAM = 800;

/* ── HAI CHỖ BỘ ĐO NÀY TỪNG BÁO OAN, GHI LẠI ──

   1. "chưa viết" là TÊN CỘT trong bảng độ phủ của màn Chiều sâu năm
      lớp — "CHƯA VIẾT 0 · VIẾT DỞ 0". Bắt nó là bắt một cái nhãn
      đang làm đúng việc của nó. Gỡ khỏi danh sách.
   2. "..." ở cuối đoạn trích 400 ký tự là do CHÍNH bộ đo cắt, không
      phải chữ giữ chỗ của màn.

   Một bộ đo báo oan thì lần sau người ta tắt nó đi, nên hai chỗ này
   đắt hơn vẻ ngoài của chúng. */
const GIU_CHO = /(đang cập nhật|sắp có|coming soon|\bTODO\b|\bFIXME\b|lorem ipsum)/i;

/* Màn ngắn mà NÓI RÕ vì sao ngắn thì không phải màn hỏng — đó là một
   ô trống nói thật. Màn ngắn mà im lặng mới đáng báo. */
const NOI_THAT = /(chưa có|chưa đầu việc nào|chưa gắn|không có bản ghi|chưa mở|trống)/i;

(async () => {
  const khoa = JSON.parse(fs.readFileSync('/home/user/Quang-GITA/kho/khoa.json', 'utf8')).khoa;
  const b = await chromium.launch();
  const tong = { man: 0, loi: [], trong: [], cham: [], giuCho: [] };
  const theoVai = [];

  for (const u of VAI) {
    const p = await b.newPage();
    const loiTrang = [];
    p.on('pageerror', e => loiTrang.push(String(e.message).slice(0, 120)));
    await p.addInitScript(x => { window.GITA_KHOA = x; }, khoa);
    await p.goto('http://127.0.0.1:8099/index.html');
    await p.waitForFunction(() => window.G && window.G.doLogin, null, { timeout: 30000 });

    /* ── ĐỢI KHO NẠP XONG HẲN, KHÔNG ĐỢI GÓI ĐẦU TIÊN ──
       Bản đầu của bộ đo này đợi daNap.length >= 1 rồi đo ngay, và đo
       trúng một máy MỚI NẠP XONG GÓI ĐẦU: 211 kho thay vì 528. Kết
       quả là 129 màn "ném lỗi" và 217 màn "gần trống" — gần như toàn
       bộ là do kho chưa về, không phải do màn hỏng.

       Suýt nữa tôi đưa cho chủ hệ 350 chỗ hỏng không có thật. Nên đợi
       tới khi số gói ĐỨNG YÊN hai lượt liền. */
    const t0 = Date.now();
    await p.evaluate(v => G.doLogin(v), u);
    await p.waitForFunction(() => window.G.KHO && window.G.KHO.daNap &&
      window.G.KHO.daNap.length, null, { timeout: 40000 });
    const msDangNhap = Date.now() - t0;
    let truoc = -1;
    for (let i = 0; i < 40; i++) {
      const n = await p.evaluate(() => (window.G.KHO.daNap || []).length);
      if (n === truoc && n > 0) break;
      truoc = n;
      await p.waitForTimeout(400);
    }

    const r = await p.evaluate(() => {
      /* Mục cột trái mà vai này MỞ ĐƯỢC — đi qua đúng cổng quyền,
         không tự dựng danh sách riêng. */
      /* HỎI CHÍNH BỘ LỌC CỦA CỘT TRÁI, không dựng lại luật ở đây.
         Bản đầu tự kiểm m.perm, và thế là bỏ sót ba điều kiện khác
         mà visible() còn xét — hienKhi, gói, và màn có thật không.
         Kết quả: bộ đo báo bốn mục "ném lỗi" mà cột trái thật KHÔNG
         hề hiện chúng ra. Dựng lại một luật đã có là cách chắc nhất
         để hai bản lệch nhau. */
      var loc = G.hienTrongCot || function () { return true; };
      var man = [];
      (G.NAV || []).forEach(function (nhom) {
        (nhom.items || []).forEach(function (m) {
          if (!m.v || !loc(m)) return;
          man.push({ v: m.v, ten: (G.iname ? G.iname(m) : m.t) || m.v });
        });
      });
      var ra = [], da = {}, giuView = G.S.view;
      man.forEach(function (m) {
        if (da[m.v]) return; da[m.v] = 1;
        /* Mục cần một gói chưa được cấp là MỤC CHẾT, không phải màn
           nổ. Hai chuyện khác hẳn nhau và phải báo khác nhau. */
        var can = G.goiCanCho ? G.goiCanCho(m.v) : '';
        if (can && G.coGoi && !G.coGoi(can)) {
          ra.push({ v: m.v, ten: m.ten, chet: 'cần gói ' + can }); return;
        }
        var f = (G.VIEWS || {})[m.v];
        if (typeof f !== 'function') {
          ra.push({ v: m.v, ten: m.ten, loi: 'không có hàm dựng màn' }); return;
        }
        /* Đi đúng đường người dùng: G.go() đặt G.S.view trước khi dựng.
           Không đặt thì nhiều màn đọc nhầm trạng thái. */
        G.S.view = m.v;
        var t = Date.now(), h = '';
        try { h = String(f() || ''); }
        catch (e) { ra.push({ v: m.v, ten: m.ten, loi: String(e.message).slice(0, 110) }); return; }
        ra.push({ v: m.v, ten: m.ten, ms: Date.now() - t, dai: h.length,
          nut: (h.match(/<button|data-act=|data-v=/g) || []).length,
          chu: h.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 400) });
      });
      G.S.view = giuView;
      return { man: ra, soGoi: (G.KHO.daNap || []).length,
        soKho: Object.keys(G).filter(function (k) {
        return /^[A-Z][A-Z0-9_]{2,}$/.test(k) && Array.isArray(G[k]);
      }).length };
    });

    const v = { u, msDangNhap, soMan: r.man.length, soKho: r.soKho, soGoi: r.soGoi,
      loi: [], trong: [], cham: [], giuCho: [], chet: [], loiTrang };
    r.man.forEach(m => {
      tong.man++;
      if (m.chet) { v.chet.push(m.ten + ' — ' + m.chet); return; }
      if (m.loi) { v.loi.push(m.ten + ' — ' + m.loi); return; }
      if (m.dai < TRONG && !NOI_THAT.test(m.chu))
        v.trong.push(m.ten + ' (' + m.dai + ' byte, và không nói vì sao trống)');
      if (m.ms > CHAM) v.cham.push(m.ten + ' (' + m.ms + 'ms)');
      if (GIU_CHO.test(m.chu)) v.giuCho.push(m.ten);
    });
    ['loi', 'trong', 'cham', 'giuCho'].forEach(k => { tong[k] = tong[k].concat(v[k]); });
    theoVai.push(v);
    await p.close();
  }

  /* ═══ THỬ NHƯ NGƯỜI CỐ Ý ═══ */
  const p = await b.newPage();
  await p.addInitScript(x => { window.GITA_KHOA = x; }, khoa);
  await p.goto('http://127.0.0.1:8099/index.html');
  await p.waitForFunction(() => window.G && window.G.doLogin, null, { timeout: 30000 });
  await p.evaluate(() => G.doLogin('phuhuynh@gita365.vn'));
  await p.waitForFunction(() => window.G.KHO && window.G.KHO.daNap &&
    window.G.KHO.daNap.length, null, { timeout: 40000 });

  const co = await p.evaluate(() => {
    var NGHE = ['PHACDO', 'TINHHUONG', 'MOTHUC', 'KICHBAN', 'FAMILIES', 'CV_HANG',
      'HH_BAC', 'KBTV_KB', 'TEST750', 'RASOAT', 'MATRAN_T5', 'HSH_HD', 'STA_NHOM'];
    var coTrongMay = NGHE.filter(function (k) { return Array.isArray(G[k]) && G[k].length; });

    /* Gọi THẲNG hàm tra kho — bỏ qua mọi giao diện */
    var tra = [];
    ['phác đồ cho trẻ mất tập trung', 'bảng hệ số lương', 'hoa hồng đại sứ',
     'kịch bản tư vấn chốt', 'hồ sơ nhà khác'].forEach(function (q) {
      var kq = (G.aiTra ? G.aiTra(q) : []) || [];
      kq.slice(0, 3).forEach(function (x) { if (tra.indexOf(x.khoNguon) < 0) tra.push(x.khoNguon); });
    });

    return {
      khoNgheTrongMay: coTrongMay,
      khoTraRa: tra,
      inDuoc: G.coTheIn ? G.coTheIn() : null,
      chepBiKhoa: G.BI_KHOA_CHEP ? G.BI_KHOA_CHEP() : null,
      xuatPdf: G.can ? G.can('xuat_pdf') : null,
      tuKiem: G.tlSoanSoat ? G.tlSoanSoat().y : '(chưa có)',
      tuMoKhoa: (function () {
        if (!G.dkXinKhoa || !G.dkMoKhoa) return '(chưa có)';
        var x = G.dkXinKhoa('CA-THU-CO-Y', 7, 'thử tự mở', 'T2');
        if (!x) return 'không dựng được lượt xin';
        var r = G.dkMoKhoa(x.ma, 'tôi tự bật cho tôi');
        G.DK_XIN = (G.DK_XIN || []).filter(function (o) { return o.ca !== 'CA-THU-CO-Y'; });
        return r.ok ? 'MỞ ĐƯỢC — HỞ' : 'bị chặn';
      })()
    };
  });
  await p.close();
  await b.close();

  /* ═══ IN ═══ */
  console.log('\n══ LÁI THỬ ' + VAI.length + ' VAI · ' + tong.man + ' MÀN ══\n');
  theoVai.forEach(v => {
    const xau = v.loi.length + v.trong.length + v.cham.length + v.giuCho.length +
      v.loiTrang.length;
    console.log((xau ? ' ✗ ' : ' ✓ ') + v.u.padEnd(24) +
      v.soMan + ' màn · ' + v.soGoi + ' gói · ' + v.soKho + ' kho · vào trong ' +
      v.msDangNhap + 'ms' + (v.chet.length ? ' · ' + v.chet.length + ' mục chưa cấp gói' : ''));
    if (v.loiTrang.length) console.log('     lỗi trang: ' + v.loiTrang.slice(0, 3).join(' | '));
    if (v.loi.length) console.log('     màn ném lỗi: ' + v.loi.slice(0, 4).join(' | '));
    if (v.trong.length) console.log('     màn gần trống: ' + v.trong.slice(0, 5).join(' | '));
    if (v.cham.length) console.log('     màn chậm: ' + v.cham.slice(0, 5).join(' | '));
    if (v.giuCho.length) console.log('     còn chữ giữ chỗ: ' + v.giuCho.slice(0, 5).join(' | '));
  });

  console.log('\n══ THỬ NHƯ NGƯỜI CỐ Ý — vai phụ huynh ══\n');
  console.log('  kho nghề nằm trong máy   : ' +
    (co.khoNgheTrongMay.length ? '✗ ' + co.khoNgheTrongMay.join(', ') : '✓ không có cái nào'));
  console.log('  gọi thẳng aiTra ra kho   : ' + co.khoTraRa.join(', '));
  console.log('  in được (Ctrl+P)         : ' + (co.inDuoc ? '✗ CÓ' : '✓ không'));
  console.log('  sao chép bị khoá         : ' + (co.chepBiKhoa ? '✓ có' : '✗ KHÔNG'));
  console.log('  quyền xuất PDF           : ' + (co.xuatPdf ? '✗ CÓ' : '✓ không'));
  console.log('  chạy được phần tự kiểm   : ' +
    (co.tuKiem === 'SOAT_CAM' ? '✓ bị từ chối' : '✗ ' + co.tuKiem));
  console.log('  tự bật khoá xử lý cấp 7  : ' +
    (co.tuMoKhoa === 'bị chặn' ? '✓ bị chặn' : '✗ ' + co.tuMoKhoa));

  const xau = tong.loi.length + tong.trong.length + tong.cham.length + tong.giuCho.length;
  console.log('\n══ TỔNG ══');
  console.log('  ' + tong.man + ' lượt mở màn · ' + tong.loi.length + ' ném lỗi · ' +
    tong.trong.length + ' gần trống · ' + tong.cham.length + ' chậm · ' +
    tong.giuCho.length + ' còn chữ giữ chỗ');
  if (xau) { console.log('✗ CÒN ' + xau + ' CHỖ ĐỂ SỬA'); process.exit(1); }
  console.log('✓ KHÔNG MÀN NÀO NÉM LỖI, TRỐNG, CHẬM HAY CÒN CHỮ GIỮ CHỖ');
})();
