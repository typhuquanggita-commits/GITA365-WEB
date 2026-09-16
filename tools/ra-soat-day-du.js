#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════
   GITA 365 — RÀ SOÁT CHỖ TRỐNG

       npx http-server -p 8099 -s .
       node tools/ra-soat-day-du.js

   Bộ kiểm phát hành (tools/kiem-tra.js) hỏi: "màn hình có chạy không?"
   Bộ này hỏi câu khác: "màn hình có RỖNG chỗ nào không?"

   Chạy hết mọi màn hình của mọi vai rồi soi bảy loại chỗ trống:

     1. Màn dựng ra quá ngắn      — có khung mà không có ruột
     2. Chữ tạm                   — "đang cập nhật", "sắp có", TODO, Lorem
     3. Ô rỗng trên màn            — nhãn có, nội dung không
     4. Bản ghi thiếu trường       — kho dữ liệu có ô để trống
     5. Mảng rỗng                  — biến toàn cục khai báo mà không có gì
     6. Chuỗi chưa dịch            — mục có tiếng Việt mà không có tiếng Anh
     7. Nút bấm không tới đâu      — data-* không có người nhận

   Ra 0 là không còn chỗ nào để trống.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
const PW = process.env.PW_PATH || '/opt/node22/lib/node_modules/playwright';
const URL = process.env.GITA_URL || 'http://127.0.0.1:8099/index.html';
const { chromium } = require(PW);

/* Ngưỡng: dưới mức này thì màn coi như chưa có ruột. Thẻ khoá và thẻ
   "chưa mở được" là chặn có chủ đích, không tính là trống. */
const NGAN = 700;

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1600, height: 1000 } });

  let coKhoa = false;
  try {
    const k = JSON.parse(require('fs').readFileSync(
      require('path').join(__dirname, '..', 'kho', 'khoa.json'), 'utf8'));
    if (k && k.khoa) { await p.addInitScript(x => { window.GITA_KHOA = x; }, k.khoa); coKhoa = true; }
  } catch { /* không có khoá — chạy chế độ mẫu */ }
  if (!coKhoa) {
    console.error('✗ Cần bộ khoá (kho/khoa.json) để soi được nội dung đã cấp phép.');
    console.error('  Chạy: node tools/ma-hoa-kho.js');
    await b.close();
    process.exit(1);
  }

  const errs = [];
  p.on('pageerror', e => errs.push(e.message));
  await p.goto(URL, { waitUntil: 'networkidle' });
  await p.evaluate(() => localStorage.clear());
  await p.reload({ waitUntil: 'networkidle' });
  await p.waitForTimeout(400);

  let loi = 0;
  const bao = (ok, ten, chiTiet) => {
    if (!ok) loi++;
    console.log((ok ? '  ✓ ' : '  ✗ ') + ten + (chiTiet ? ' — ' + chiTiet : ''));
  };

  /* Danh sách tài khoản để đi hết các vai */
  const ai = await p.evaluate(() => (window.G.ACCOUNTS || []).map(a => a.e || a.email || a.u));
  console.log('\n(có bộ khoá — soi cả nội dung đã cấp phép · ' + ai.length + ' vai)');

  /* ══════ 1 · MÀN RỖNG VÀ CHỮ TẠM ══════ */
  console.log('\n1 · MÀN RỖNG · CHỮ TẠM · Ô RỖNG');
  const quet = await p.evaluate(async (opt) => {
    const G = window.G;
    const NGAN = opt.NGAN;
    const KHOA = '<div class="card center" style="padding:40px">';
    /* Chữ tạm: chỉ bắt chữ THẬT SỰ là chỗ trống. "Đang cập nhật" trong một
       câu nói về quy trình thì không phải chỗ trống, nên bắt theo cụm đứng
       một mình trong một ô, không bắt theo từ nằm giữa câu. */
    const TAM = [
      /\bTODO\b/i, /\bFIXME\b/i, /lorem ipsum/i, /coming soon/i,
      /\bXXX\b/, /\bTBD\b/i,
      /placeholder(?!=)/i,   /* placeholder="…" là thuộc tính ô nhập, không phải chữ tạm */
      />\s*(đang cập nhật|sắp có|sắp ra mắt|chưa có nội dung|nội dung đang|đang xây dựng)\s*</i,
      />\s*(undefined|null|NaN|\[object Object\])\s*</
    ];
    const ra = { ngan: [], tam: [], oRong: [], loi: [], thoat2: [], nang: [] };
    const daXet = {};
    /* Hộp để ĐỌC RA CHỮ người dùng thật sự nhìn thấy. Phải đo trên chữ
       chứ không đo trên mã: &quot; trong mã là cách thoát ĐÚNG, chỉ khi
       nó còn nguyên sau khi trình duyệt giải mã một lần thì mới là thoát
       hai lần — và lúc ấy người đọc thấy chữ &quot; giữa câu tiếng Việt. */
    const hop = document.createElement('div');

    for (const em of opt.ai) {
      G.doLogin(em);
      await new Promise(r => setTimeout(r, 900));
      const vai = (G.S.roleObj || {}).short || em;
      const man = [];
      (G.NAV || []).forEach(g => (g.items || []).forEach(i => man.push(i.v)));

      for (const v of man) {
        let html;
        try { html = G.VIEWS[v] ? G.VIEWS[v]() : null; }
        catch (e) { ra.loi.push(vai + ' · ' + v + ' · ' + e.message); continue; }
        if (typeof html !== 'string') { ra.loi.push(vai + ' · ' + v + ' · không trả về chuỗi'); continue; }
        const t = html.trim();
        /* Thẻ khoá là chặn có chủ đích, không phải chỗ trống */
        if (t.indexOf(KHOA) === 0) continue;

        /* Màn nói rõ "phần này nằm trong kho nghề" hay "mở khi được cấp
           phép" là chặn có chủ đích giống thẻ khoá, không phải màn rỗng. */
        const coLoiChan = /kho nghề|cấp phép|chưa mở được|chưa có|Đăng nhập lại|chưa thao tác được|dành cho/i.test(t);
        if (t.length < NGAN && !coLoiChan && !daXet['n' + v]) {
          daXet['n' + v] = 1;
          ra.ngan.push(v + ' (' + t.length + ' ký tự, vai ' + vai + ')');
        }
        /* CHỮ THOÁT HAI LẦN. U.sec(), U.quote() và mấy hàm khung khác tự
           gọi U.h() trên tham số của chúng. Truyền h(...) vào là thoát
           lần thứ hai, và người đọc thấy &quot; giữa câu. Lỗi này không
           làm hỏng gì, không sinh lỗi trang, nên nó sống được rất lâu —
           bản 9.24 tìm ra bốn màn đang mắc, màn cũ nhất từ bản 9.19. */
        hop.innerHTML = html;
        /* CÂN NẶNG MÀN. Hộp này đã dựng sẵn để đọc chữ — đếm nút luôn ở
           đây, không tốn thêm lượt nào.

           Đo trên máy điện thoại phổ thông (CPU chậm sáu lần) ở bản
           9.27: tai-lieu-goc dựng 12.384 nút và mất 3.136 ms. Ba giây
           đứng hình sau một cú bấm. Máy làm việc nhanh nên chỗ này
           không bao giờ lộ ra — nó chỉ lộ khi đo trên máy yếu, và
           không ai đo trên máy yếu trừ khi có phép kiểm bắt phải đo. */
        if (!daXet['w' + v]) {
          daXet['w' + v] = 1;
          const nut = hop.querySelectorAll('*').length;
          if (nut > 0) ra.nang.push({ v: v, nut: nut });
        }
        const chu = hop.innerText || hop.textContent || '';
        const t2 = chu.match(/&(?:quot|amp|lt|gt|#39|nbsp);/g);
        if (t2 && !daXet['e' + v]) {
          daXet['e' + v] = 1;
          ra.thoat2.push(v + ' · ×' + t2.length + ' · …' +
            (chu.match(/.{0,40}&(?:quot|amp|lt|gt|#39|nbsp);.{0,20}/) || [''])[0]
              .replace(/\s+/g, ' ').trim());
        }
        for (const rx of TAM) {
          if (rx.test(html) && !daXet['t' + v + rx.source]) {
            daXet['t' + v + rx.source] = 1;
            const m = html.match(rx);
            ra.tam.push(v + ' · ' + String(m && m[0]).slice(0, 60).replace(/\s+/g, ' '));
          }
        }
        /* Ô rỗng: nhãn có mà nội dung trống. Bỏ qua thẻ TRANG TRÍ — vạch
           kẻ, ô đệm, chấm tròn: chúng rỗng đúng nghĩa vì phần nhìn thấy
           nằm ở nền, ở màu và ở kích thước, không nằm ở chữ: vạch kẻ, ô
           màu trong bộ nhận diện, chấm tròn đầu dòng. */
        const TRANG_TRI =
          /height:|width:|background|border-radius|color:|flex:none|class="[^"]*\b(grow|tr|dot|mau|line|sep|bar|ring|chip|nd-[a-z-]+)\b/;
        const rong = (html.match(/<(p|b|span|div)[^>]*>\s*<\/\1>/g) || [])
          .filter(x => !TRANG_TRI.test(x));
        if (rong.length > 2 && !daXet['o' + v]) {
          daXet['o' + v] = 1;
          ra.oRong.push(v + ' · ' + rong.length + ' thẻ rỗng');
        }
      }
      localStorage.clear();
    }
    return ra;
  }, { ai, NGAN });

  bao(!quet.loi.length, 'mọi màn hình dựng ra không lỗi', quet.loi.slice(0, 3).join(' | '));
  bao(!quet.ngan.length, 'không màn nào có khung mà không có ruột (dưới ' + NGAN + ' ký tự)',
    quet.ngan.slice(0, 5).join(' | '));
  bao(!quet.tam.length, 'không còn chữ tạm nào trên giao diện', quet.tam.slice(0, 5).join(' | '));
  bao(!quet.oRong.length, 'không màn nào có nhiều ô rỗng', quet.oRong.slice(0, 5).join(' | '));
  /* Ngưỡng 5.000 nút. Không phải con số thiêng — nó là chỗ mà trên máy
     yếu một màn bắt đầu mất hơn một giây để bày xong, và trên một giây
     thì người dùng nghĩ máy treo chứ không nghĩ màn đang tải.

     kiem-theo-vai được tha, và tha có lý do ghi thẳng ra: nó là MA TRẬN
     157 màn × 15 vai, mà một ma trận chỉ dùng được khi thấy hết. Cắt nó
     ra từng trang là giữ được con số mà làm hỏng công dụng. Nó cũng chỉ
     hai vai quản trị mở, gần như luôn trên máy bàn. */
  const THA_NANG = { 'kiem-theo-vai':
    'ma trận 157 màn × 15 vai — chỉ dùng được khi thấy hết, và chỉ quản trị mở' };
  const qua = (quet.nang || []).filter(x => x.nut > 5000 && !THA_NANG[x.v])
    .sort((a, b) => b.nut - a.nut);
  const nangNhat = (quet.nang || []).slice().sort((a, b) => b.nut - a.nut).slice(0, 3);
  bao(!qua.length,
    'không màn nào dựng quá 5.000 nút DOM. Bản 9.27 có tai-lieu-goc dựng 12.384 nút và mất 3.136 ms trên máy điện thoại phổ thông — ba giây đứng hình sau một cú bấm. Đoạn văn ở màn ấy đã mở dần theo lô từ bản trước, nhưng BẢNG thì bị bỏ sót và dựng hết một lượt; mỗi ô lại bọc thêm một <span> không đổi gì trên màn. Máy làm việc nhanh nên chỗ này không bao giờ lộ ra — nó chỉ lộ khi đo trên máy yếu',
    qua.length ? 'quá nặng: ' + qua.map(x => x.v + ' ' + x.nut.toLocaleString('vi-VN')).join(' · ')
      : 'nặng nhất: ' + nangNhat.map(x => x.v + ' ' + x.nut.toLocaleString('vi-VN')).join(' · ') +
        ' · tha 1 màn có lý do');
  bao(!quet.thoat2.length,
    'không chữ nào bị thoát hai lần — U.sec() và U.quote() TỰ gọi U.h() trên tham số, nên truyền h(...) vào là thoát lần thứ hai và người đọc thấy &quot; giữa câu tiếng Việt. Lỗi này không sinh lỗi trang nên nó sống rất lâu: bản 9.24 tìm ra bốn màn đang mắc, chỗ cũ nhất từ 9.19, và gỡ 77 chỗ h() thừa trong 15 tệp',
    quet.thoat2.slice(0, 5).join(' | '));

  /* ══════ 2 · KHO DỮ LIỆU CÓ Ô ĐỂ TRỐNG ══════ */
  console.log('\n2 · BẢN GHI THIẾU TRƯỜNG · MẢNG RỖNG');
  await p.evaluate(() => window.G.doLogin('superadmin@gita365.vn'));
  await p.waitForTimeout(2200);
  const kho = await p.evaluate(() => {
    const G = window.G;
    /* Trường được phép để trống, kèm lý do — mỗi ngoại lệ phải có lý do,
       không thì nó chỉ là chỗ trống được tha.

       NGUỒN GỐC là G.SOAT_THA trong kho (kho-goc/data.soat-day-du.js) —
       cùng bảng mà màn tự soát trong ứng dụng dùng. Bảng dưới đây chỉ
       BỔ SUNG những ngoại lệ mà bảng kia chưa có, và được gộp vào ở
       ngay dưới. Trước v7.8 hai bảng nằm rời nhau, nên thêm một ngoại lệ
       ở một bên là bên kia vẫn đỏ — đúng chuyện đã xảy ra với
       TUYEN.doBang. */
    const THA = {
      'AD_GIONG.ten':      'hồ sơ giọng đọc để trống có chủ đích: chưa ký hợp đồng thu âm thì không được điền tên ai',
      'AD_GIONG.hopDong':  'như trên — số hợp đồng chỉ điền khi đã ký thật',
      'AD_GIONG.den':      'như trên — hạn dùng chỉ có khi có hợp đồng',
      'MATRAN_T1.quyTrinh':'cột quy trình của tầng 1 gộp vào cột lộ trình',
      'MATRAN_T2.quyTrinh':'như trên',
      'MATRAN_T3.quyTrinh':'như trên',
      'MATRAN_T4.quyTrinh':'như trên',
      'MATRAN_T5.quyTrinh':'như trên',
      'CHUYEN_TG.luu':     'ghi chú NÓI CHO ĐÚNG chỉ có ở chuyện mà bản kể phổ biến đã bị thổi lên',
      'AD_GIONG.tu':       'như ba trường kia của hồ sơ giọng đọc: ngày bắt đầu chỉ có khi đã ký hợp đồng thu âm',
      'TAILIEU_GOC.soTrang':'tài liệu Word không có số trang cố định — đếm chữ mới là đơn vị đúng',
      'KICHBAN.ngay':      'kịch bản không gắn với một ngày cụ thể (khai vấn, xử lý tình huống) thì ngay để null đúng nghĩa',
      'HP_TANG.gia':       'mức học phí là quyết định của chủ Học viện — điền bừa vào đây thì người tư vấn sẽ đọc nó ra trước mặt gia đình',
      'QUA1000.pd':        'quà thuộc nhóm "Nền tảng chung" không gắn với một trong 220 mã phác đồ — pd để null là đúng nghĩa',
      'BDCN.o':            'ô B06 và B09 dùng bảng riêng (BDCN_MUOI_VIEC, BDCN_QUY_TAC) thay cho ô nhập chung',
      'TANG_HIENTHI.perm': 'nhóm "chung cho mọi tài khoản" không có điều kiện quyền — perm null là đúng nghĩa',
      'KHACH_TANG.nhipDonVi':'hạng Chì không có nhịp thăm hỏi định kỳ, nên không có đơn vị nhịp'
    };
    /* Gộp bảng ngoại lệ của kho vào — một ngoại lệ khai một lần là cả
       màn tự soát lẫn bộ rà soát này cùng biết. */
    (G.SOAT_THA || []).forEach(x => { if (x && x.o && !THA[x.o]) THA[x.o] = x.y || ''; });
    const thieu = [], rong = [];
    Object.keys(G).forEach(k => {
      if (!/^[A-Z][A-Z0-9_]*$/.test(k)) return;      /* chỉ soi kho dữ liệu */
      const v = G[k];
      if (!Array.isArray(v)) return;
      /* Mảng TRẠNG THÁI LÚC CHẠY — dữ liệu của chính người dùng, rỗng khi
         chưa ai làm gì. Rỗng ở đây là đúng, không phải chỗ trống. */
      const TRANG_THAI = ['SOI_LUAT','XIN_THEM','CA','AI_HOI','CHAT','THUVIEN',
                          'MINHCHUNG','SECLOG','NHOM','CHUYEN_DOC','TG_DOC'];
      /* Kho rỗng CÓ CHỦ Ý phải được khai ở G.RONG_CO_Y, kèm lý do và điều
         kiện lấp. Danh sách TRANG_THAI cứng ở trên là bản cũ, giữ lại để
         tương thích; sổ khai mới là đường chính, vì nó bắt người tha phải
         viết ra vì sao — tha lặng một lần là mở đường tha lần sau. */
      const KHAI = ((window.G.RONG_CO_Y || []).map(x => x.kho));
      if (!v.length) { if (TRANG_THAI.indexOf(k) < 0 && KHAI.indexOf(k) < 0) rong.push(k); return; }
      if (typeof v[0] !== 'object' || v[0] === null) return;
      /* Trường nào có ở đa số bản ghi thì coi là trường bắt buộc */
      const dem = {};
      v.forEach(r => r && typeof r === 'object' &&
        Object.keys(r).forEach(f => { dem[f] = (dem[f] || 0) + 1; }));
      const batBuoc = Object.keys(dem).filter(f => dem[f] >= v.length * 0.9);
      batBuoc.forEach(f => {
        if (THA[k + '.' + f]) return;
        const so = v.filter(r => {
          if (!r || typeof r !== 'object') return false;
          const x = r[f];
          if (x === undefined || x === null) return true;
          if (typeof x === 'string' && !x.trim()) return true;
          if (Array.isArray(x) && !x.length) return true;
          return false;
        }).length;
        if (so) thieu.push(k + '.' + f + ' · ' + so + '/' + v.length + ' bản ghi trống');
      });
    });
    return { thieu, rong };
  });
  bao(!kho.thieu.length, 'không kho nào có bản ghi để trống trường bắt buộc',
    kho.thieu.slice(0, 8).join(' | '));
  /* ── Kiểm chính sổ khai rỗng ──
     Sổ này là chỗ duy nhất được phép tha một kho rỗng, nên nó phải chặt
     hơn thứ nó tha: mỗi dòng phải nói rõ VÌ SAO và LẤP KHI NÀO, và không
     dòng nào được ở lại sau khi kho đã có dữ liệu. */
  const G_RONG = await p.evaluate(() => (window.G.RONG_CO_Y || []).map(x => x.kho));
  const soKhai = await p.evaluate(() => {
    const G = window.G, ds = G.RONG_CO_Y || [];
    return {
      so: ds.length,
      mong: ds.filter(x => !x.vi || String(x.vi).length < 80).map(x => x.kho),
      thieuLap: ds.filter(x => !x.lapKhi || String(x.lapKhi).length < 20).map(x => x.kho),
      cu: ds.filter(x => Array.isArray(G[x.kho]) && G[x.kho].length).map(x => x.kho),
      laKho: ds.filter(x => G[x.kho] === undefined).map(x => x.kho)
    };
  });
  /* Không đặt sàn số lượng — một con số tuỳ tiện chỉ tạo áp lực khai thêm
     cho đủ. Điều thật sự phải chốt là kho đánh giá công khai có mặt trong
     sổ, vì đó là kho mà việc lấp bừa gây hại nhất. */
  bao((G_RONG || []).indexOf('DANHGIA_THAT') >= 0,
    'kho đánh giá công khai được khai rõ là rỗng có chủ ý — không ai lấp nó cho bộ rà soát xanh',
    soKhai.so + ' kho được khai');
  bao(!soKhai.mong.length, 'mỗi dòng trong sổ nói rõ VÌ SAO rỗng, đủ dài để người sau hiểu',
    soKhai.mong.join(' ') || 'mọi lý do đều đủ dài');
  bao(!soKhai.thieuLap.length, 'và nói rõ LẤP KHI NÀO — không có mốc lấp thì là bỏ quên, không phải chủ ý',
    soKhai.thieuLap.join(' ') || 'mọi dòng đều có mốc lấp');
  bao(!soKhai.cu.length, 'không dòng nào ở lại sau khi kho đã có dữ liệu — lời tha cũ phải gỡ đi',
    soKhai.cu.join(' ') || 'sổ còn đúng');
  bao(!soKhai.laKho.length, 'sổ không khai kho không tồn tại', soKhai.laKho.join(' ') || 'tên kho đều có thật');

  bao(!kho.rong.length, 'không mảng dữ liệu nào khai báo mà rỗng ngoài sổ khai',
    kho.rong.slice(0, 8).join(' | '));

  /* ══════ 3 · CHUỖI CHƯA DỊCH ══════ */
  console.log('\n3 · BẢN TIẾNG ANH');
  const dich = await p.evaluate(() => {
    const G = window.G;
    const man = [];
    (G.NAV || []).forEach(g => (g.items || []).forEach(i => man.push(i.v)));
    const en = G.ITEM_EN || {};
    const thieu = man.filter(v => !en[v]);
    const hong = Object.keys(en).filter(k => !Array.isArray(en[k]) || en[k].length < 2 ||
      !String(en[k][0]).trim() || !String(en[k][1]).trim());
    return { tong: man.length, thieu, hong };
  });
  bao(!dich.thieu.length, 'mọi mục điều hướng đều có bản tiếng Anh',
    dich.thieu.length + '/' + dich.tong + ' thiếu: ' + dich.thieu.slice(0, 8).join(' '));
  bao(!dich.hong.length, 'không bản dịch nào để trống một nửa', dich.hong.slice(0, 8).join(' '));

  /* ══════ 4 · NÚT BẤM KHÔNG TỚI ĐÂU ══════ */
  console.log('\n4 · NÚT BẤM CÓ NGƯỜI NHẬN');
  const nut = await p.evaluate(async () => {
    const G = window.G;
    /* Gom mọi thuộc tính data-* mà giao diện dựng ra, rồi đối chiếu với
       các bộ nhận sự kiện đã đăng ký trong mã nguồn. */
    const dung = {};
    const man = [];
    (G.NAV || []).forEach(g => (g.items || []).forEach(i => man.push(i.v)));
    for (const v of man) {
      let html; try { html = G.VIEWS[v] ? G.VIEWS[v]() : ''; } catch { continue; }
      if (typeof html !== 'string') continue;
      const m = html.match(/\sdata-([a-z0-9-]+)=/g) || [];
      m.forEach(x => { const t = x.trim().slice(5).replace('=', ''); dung[t] = (dung[t] || 0) + 1; });
    }
    return dung;
  });
  /* Đọc mã nguồn để biết thuộc tính nào đã có bộ nhận */
  const fs = require('fs'), path = require('path');
  const goc = path.join(__dirname, '..', 'src');
  let ma = '';
  for (const t of fs.readdirSync(goc)) if (t.endsWith('.js')) ma += fs.readFileSync(path.join(goc, t), 'utf8');
  /* Thuộc tính chỉ để đánh dấu hoặc để lọc, không cần bộ nhận */
  /* Thuộc tính chỉ để lọc, để đánh dấu, hoặc đi kèm một data-act khác —
     không cần bộ nhận riêng. */
  const KHONG_CAN = ['f', 'v', 'go', 'act', 'mtp', 'shchon', 'tgmach', 'nhom', 'ma',
                     'id', 'k', 'tang', 'cap', 'loai', 'u', 'l'];
  /* Bộ nhận có thể viết ba kiểu:  '[data-x]'  ·  "data-x]"  ·  '['+t+']' với
     t lấy từ danh sách. Kiểu thứ ba chỉ tra được bằng tên trong dấu nháy. */
  const khongNhan = Object.keys(nut).filter(t =>
    KHONG_CAN.indexOf(t) < 0 &&
    ma.indexOf('data-' + t + ']') < 0 &&
    ma.indexOf("'data-" + t + "'") < 0 &&
    ma.indexOf('"data-' + t + '"') < 0);
  bao(!khongNhan.length, 'mọi nút bấm trên giao diện đều có bộ nhận sự kiện',
    khongNhan.slice(0, 10).join(' '));

  /* ══════ 5 · HÀM CANH CỬA PHẢI CÓ THẬT ══════
     Lớp chỗ trống khó thấy nhất: `G.foo ? G.foo(x) : 'một dòng dự phòng'`
     — nếu G.foo chưa từng được định nghĩa thì câu điều kiện LUÔN rơi xuống
     nhánh dự phòng, và màn hình vĩnh viễn chỉ có một dòng chữ. Không lỗi,
     không cảnh báo, chỉ là ruột rỗng đội lốt phòng hờ.

     Đúng một lỗi loại này đã nằm trong kho: so-tay-nhan-dien gọi
     G.manChuaCapPhep — một hàm không tồn tại — nên màn ấy chỉ dựng ra
     136 ký tự thay vì màn xin cấp phép đầy đủ. */
  console.log('\n5 · HÀM CANH CỬA PHẢI CÓ THẬT');
  {
    const fs = require('fs'), path = require('path');
    const thuMuc = path.join(__dirname, '..', 'src');
    const ten = new Set();
    for (const f of fs.readdirSync(thuMuc)) {
      if (!f.endsWith('.js')) continue;
      const ma = fs.readFileSync(path.join(thuMuc, f), 'utf8');
      /* Bắt đúng dạng "G.foo ? G.foo(" và "G.foo && G.foo(" */
      const re = /G\.([A-Za-z_$][\w$]*)\s*(\?|&&)\s*G\.\1\s*\(/g;
      let m; while ((m = re.exec(ma))) ten.add(m[1]);
    }
    const ds = Array.from(ten).sort();
    const thieu = await p.evaluate(list =>
      list.filter(n => typeof window.G[n] !== 'function'), ds);
    bao(!thieu.length,
      'mọi hàm được canh trước khi gọi đều tồn tại thật — ' + ds.length + ' hàm được soi',
      thieu.length ? ('KHÔNG CÓ: G.' + thieu.join(' · G.')) : '');
  }

  /* ══════ 6 · KHÔNG LỖI TRANG ══════ */
  console.log('\n6 · KHÔNG LỖI TRANG');
  bao(!errs.length, 'không lỗi nào khi chạy hết mọi màn của mọi vai', errs.slice(0, 3).join(' | '));

  /* ══════ 7 · CHUẨN NHÌN ══════
     Ba thứ quyết định một trang đọc ra chuyên nghiệp hay nghiệp dư, và
     cả ba đều ĐO ĐƯỢC — nên cả ba nằm ở đây chứ không nằm ở cảm giác.

     Không thứ nào trong ba lộ ra khi nhìn ảnh chụp: trang vẫn đầy đặn,
     thẳng thớm, không có gì lệch. Chúng chỉ lộ ra khi đo. Đó đúng là
     loại lỗi sống lâu nhất. */
  console.log('\n7 · CHUẨN NHÌN — BỀ NGANG DÒNG · THANG CỠ CHỮ · THANG MỰC');
  {
    /* `goc` ở mục 5 trỏ vào src/, không phải gốc kho — khai riêng ở đây
       chứ không mượn, vì mượn một biến có tên chung là cách lấy nhầm. */
    const fs7 = require('fs'), path7 = require('path');
    const css = fs7.readFileSync(path7.join(__dirname, '..', 'assets', 'style.css'), 'utf8');

    /* ── Thang cỡ chữ ── */
    const co = [...new Set((css.match(/font-size:[0-9.]+px/g) || [])
      .map(x => parseFloat(x.slice(10))))].sort((a, b) => a - b);
    bao(co.length <= 9,
      'tệp kiểu dùng tối đa CHÍN bậc cỡ chữ. Bản 9.25 có hai mươi sáu — nghĩa là không có thang nào cả, mỗi mảnh giao diện tự nghĩ ra cỡ của mình. Hai cỡ cách nhau nửa pixel thì mắt không phân biệt được, nên chúng không tạo ra thứ bậc, chỉ tạo ra tạp',
      co.length + ' bậc: ' + co.join(' · '));

    /* ── Thang mực: phải giảm dần đều, và mọi bậc đạt 4,5:1 ── */
    const sang = /:root\{([\s\S]*?)\}/.exec(css);
    function lay(khoi, ten) {
      const m = new RegExp('--' + ten + ':\\s*(#[0-9A-Fa-f]{6})').exec(khoi || '');
      return m ? m[1] : null;
    }
    function L(hx) {
      const r = parseInt(hx.slice(1, 3), 16) / 255, g = parseInt(hx.slice(3, 5), 16) / 255,
        b = parseInt(hx.slice(5, 7), 16) / 255;
      const f = c => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
    }
    const tp = (a, b) => { const x = L(a), y = L(b), hi = Math.max(x, y), lo = Math.min(x, y);
      return (hi + 0.05) / (lo + 0.05); };
    const khoi = sang ? sang[1] : '';
    const nen = lay(khoi, 'bg-0') || '#FFFFFF';
    const muc = ['ink', 'ink-2', 'ink-3', 'ink-4'].map(t => lay(khoi, t));
    const duMuc = muc.every(Boolean);
    const ti = duMuc ? muc.map(c => tp(c, nen)) : [];
    /* Bốn bậc mà bậc cuối lật ngược thì chỉ ba bậc phân biệt được — đó
       là lý do một trang đọc ra phẳng lì dù mỗi thẻ đều có ba tầng chữ. */
    const giamDan = duMuc && ti.every((v, i) => i === 0 || ti[i - 1] > v);
    const duTuongPhan = duMuc && ti.every(v => v >= 4.5);
    bao(giamDan && duTuongPhan,
      'thang mực bốn bậc GIẢM DẦN ĐỀU trên nền trang, và mọi bậc đạt 4,5:1. Tới bản 9.25 bậc cuối lật ngược — lớp chữ lặng nhất lại nổi hơn lớp trên nó — nên bốn bậc chỉ còn ba bậc phân biệt được, và trang đọc ra phẳng. Chữa bằng cách làm bậc ba ĐẬM hơn chứ không làm bậc bốn nhạt hơn: nhạt đi thì nó tụt xuống 3,98:1, tức là đổi một lỗi nhìn thấy lấy một lỗi không nhìn thấy',
      duMuc ? ti.map((v, i) => ['ink', 'ink-2', 'ink-3', 'ink-4'][i] + ' ' + v.toFixed(2)).join(' → ')
            : 'không đọc được bảng mực');

    /* ── Trung tính phải cùng họ màu với LOGO ──
       Đọc sắc độ từ CHÍNH TỆP LOGO, không từ một con số chép tay: chép
       tay thì tệp logo đổi mà con số ở lại, và cả bộ nhận diện trôi đi
       trong khi phép kiểm vẫn xanh.

       Tới bản 9.26 logo là xanh 216° và đỏ 356°, màu nhấn khớp (212°,
       357°), nhưng mọi màu trung tính lại là TÍM 250–260°. Nhấn thì
       theo dấu, còn nền và chữ thuộc một họ khác — đó là lý do trang
       không đọc ra như một bộ. */
    const sacLogo = await p.evaluate(() => new Promise(giai => {
      const im = new Image();
      im.onload = () => {
        const c = document.createElement('canvas');
        c.width = 96; c.height = 96;
        const x = c.getContext('2d'); x.drawImage(im, 0, 0, 96, 96);
        const d = x.getImageData(0, 0, 96, 96).data, dem = {};
        for (let i = 0; i < d.length; i += 4) {
          const r = d[i], g = d[i + 1], b = d[i + 2], a = d[i + 3];
          if (a < 200) continue;
          const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
          if (mx - mn < 40) continue;             /* xám và trắng không mang sắc */
          let h;
          if (mx === r) h = ((g - b) / (mx - mn)) % 6;
          else if (mx === g) h = (b - r) / (mx - mn) + 2;
          else h = (r - g) / (mx - mn) + 4;
          h = Math.round(((h * 60) + 360) % 360 / 10) * 10;
          dem[h] = (dem[h] || 0) + 1;
        }
        const xep = Object.entries(dem).sort((u, v) => v[1] - u[1]);
        giai(xep.length ? Number(xep[0][0]) : null);
      };
      im.onerror = () => giai(null);
      im.src = 'assets/brand/logo-gita.png';
    }));
    function sacCua(hx2) {
      const r = parseInt(hx2.slice(1, 3), 16), g = parseInt(hx2.slice(3, 5), 16),
        b = parseInt(hx2.slice(5, 7), 16);
      const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
      if (mx === mn) return null;
      let h2 = mx === r ? ((g - b) / (mx - mn)) % 6
        : mx === g ? (b - r) / (mx - mn) + 2 : (r - g) / (mx - mn) + 4;
      return ((h2 * 60) + 360) % 360;
    }
    const trungTinh = ['ink', 'ink-2', 'ink-3', 'ink-4', 'bg-0', 'bg-2']
      .map(t => [t, lay(khoi, t)]).filter(x => x[1]);
    const lech = trungTinh.map(([t, c]) => {
      const s2 = sacCua(c);
      if (s2 == null || sacLogo == null) return null;
      let d = Math.abs(s2 - sacLogo); if (d > 180) d = 360 - d;
      return { t: t, c: c, sac: Math.round(s2), lech: Math.round(d) };
    }).filter(Boolean);
    const xa = lech.filter(x => x.lech > 25);
    bao(sacLogo != null && !xa.length,
      'MÀU TRUNG TÍNH CÙNG HỌ VỚI LOGO — sắc độ đọc từ chính tệp assets/brand/logo-gita.png lúc chạy, không từ con số chép tay: chép tay thì tệp logo đổi mà con số ở lại, và cả bộ nhận diện trôi đi trong khi phép kiểm vẫn xanh. Tới bản 9.26 logo xanh 216° còn mọi màu nền và chữ là tím 250–260°: màu nhấn theo dấu, nền thì thuộc họ khác, nên trang không đọc ra như MỘT bộ. Kéo trung tính về họ của dấu, và giữ nguyên độ sáng để không đổi một lỗi nhìn thấy lấy một lỗi không nhìn thấy',
      sacLogo == null ? 'không đọc được sắc độ logo'
        : 'logo ' + sacLogo + '° · ' + lech.map(x => x.t + ' ' + x.sac + '°').join(' · ') +
          (xa.length ? ' · LỆCH QUÁ 25°: ' + xa.map(x => x.t).join(' ') : ''));

    /* ── Bề ngang một dòng chữ ── */
    await p.evaluate(() => window.G.doLogin('admin@gita365.vn'));
    await p.waitForTimeout(2200);
    const dong = await p.evaluate(() => {
      const G = window.G, dai = [];
      const man = [];
      (G.NAV || []).forEach(g => (g.items || []).forEach(i => man.push(i.v)));
      man.slice(0, 40).forEach(v => {
        if (!G.VIEWS[v]) return;
        try { G.S.view = v; G.render(); } catch { return; }
        document.getElementById('main').querySelectorAll('p,li').forEach(el => {
          const t = (el.textContent || '').trim();
          if (!t || el.children.length || t.length < 120) return;
          const s = getComputedStyle(el);
          const lh = parseFloat(s.lineHeight) || parseFloat(s.fontSize) * 1.6;
          /* Đếm SỐ DÒNG THẬT rồi chia, không ước bề rộng một ký tự: chữ
             Việt có dấu, ước bằng công thức thì lệch tới ba mươi phần trăm
             — và một thước lệch ba mươi phần trăm thì chỉnh theo nó là
             chỉnh trượt. */
          const sd = Math.max(1, Math.round(el.getBoundingClientRect().height / lh));
          if (sd >= 2) dai.push(Math.round(t.length / sd));
        });
      });
      dai.sort((a, b) => a - b);
      return { so: dai.length, giua: dai[Math.floor(dai.length / 2)] || 0,
        max: dai[dai.length - 1] || 0, qua85: dai.filter(x => x > 85).length };
    });
    bao(dong.so > 20 && dong.giua <= 75 && dong.qua85 <= dong.so * 0.05,
      'BỀ NGANG MỘT DÒNG CHỮ nằm trong 45–75 ký tự. Bản 9.25 đo được GIỮA 82, cao nhất 114. Trên 90 ký tự thì mắt mất chỗ xuống dòng: đọc hết dòng rồi quét ngược tìm đầu dòng sau, quét trượt một dòng — và người đọc không biết mình vừa trượt, họ chỉ thấy đoạn văn khó vào. Chặn ở CHỮ chứ không chặn ở thẻ, để bảng và hình vẫn rộng hết cột',
      dong.so + ' đoạn · giữa ' + dong.giua + ' ký tự · cao nhất ' + dong.max +
      ' · quá 85: ' + dong.qua85);
  }

  console.log('\n' + (loi
    ? '✗ CÒN ' + loi + ' CHỖ TRỐNG PHẢI LẤP'
    : '✓ KHÔNG CÒN CHỖ NÀO ĐỂ TRỐNG'));
  await b.close();
  process.exit(loi ? 1 : 0);
})();
