#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════
   GITA 365 — ĐO KHUNG MÀN: 183 MÀN TRÊN BỐN KHỔ MÀN THẬT

       npx http-server -p 8099 -s .
       xvfb-run -a node tools/do-khung-man.js
       xvfb-run -a node tools/do-khung-man.js --im     (chỉ in chỗ đỏ)

   ══ VÌ SAO CẦN BỘ NÀY ══

   Kho đã có hai bộ soi màn hình: kiem-tra.js hỏi "màn có chạy không",
   ra-soat-day-du.js hỏi "màn có rỗng chỗ nào không". Cả hai đọc CHUỖI
   HTML mà màn trả về, và cả hai chạy ở đúng MỘT khổ màn để bàn.

   Nghĩa là không bộ nào trả lời được câu của người cầm điện thoại:
   chữ có tràn ra ngoài không, bảng có đẩy cả trang lệch sang phải
   không, nút có đủ to để bấm bằng ngón tay không.

   Chuyện ấy đã xảy ra thật. Ở bản 9.99.50 tôi đo một màn trên khổ
   420px và thấy vùng nội dung chỉ rộng 268px thay vì 388px — một dòng
   CSS thua về độ nặng chọn lọc, có từ rất lâu, ở MỌI màn. Không ai
   thấy suốt nhiều bản vì mọi bộ soi đều chạy ở khổ để bàn.

   ══ BỘ NÀY ĐO GÌ ══

     1. TRÀN NGANG   — cả trang có cuộn sang ngang không. Đây là lỗi
                       nặng nhất trên điện thoại: người ta vuốt dọc,
                       trang trượt ngang, và chữ nhảy khỏi tầm mắt.
     2. PHẦN TỬ TRÀN — chính xác thẻ nào thò ra ngoài, và thò bao nhiêu.
                       Bỏ qua thẻ nằm trong hộp cuộn ngang CÓ CHỦ Ý
                       (bảng, khối mã, sơ đồ) — đó là cách làm đúng.
     3. NÚT QUÁ NHỎ  — trên khổ chạm, nút dưới 32px một chiều thì ngón
                       tay bấm trượt. Đo trên khổ chạm thôi; chuột thì
                       nhỏ vẫn bấm trúng.
     4. CHỮ QUÁ NHỎ  — dưới 10px thì trên điện thoại đọc không nổi.

   ══ VÀ MỘT LUẬT CỦA CHÍNH BỘ NÀY ══

   Nó KHÔNG khai tay danh sách màn. Nó đọc G.NAV lúc chạy, nên thêm
   một màn mới là màn ấy tự vào phép đo. Khai tay thì bản sau thêm màn
   mà quên chép, và đúng màn mới ấy là màn chưa ai soi.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
const PW = process.env.PW_PATH || '/opt/node22/lib/node_modules/playwright';
const URL = process.env.GITA_URL || 'http://127.0.0.1:8099/index.html';
const { chromium } = require(PW);
const IM = process.argv.includes('--im');

/* Bốn khổ đại diện. Không lấy thêm cho nhiều: mỗi khổ là một lượt đi
   hết mọi màn, và bốn khổ đã phủ đủ ba chỗ giao diện đổi hình
   (860px · 1180px · cột phải). */
const KHO = [
  { ten: 'điện thoại', w: 390,  h: 844, cham: true },
  { ten: 'điện thoại to', w: 430, h: 932, cham: true },
  { ten: 'máy bảng', w: 820,  h: 1180, cham: true },
  { ten: 'để bàn',   w: 1440, h: 900, cham: false }
];

/* Hai vai phủ gần hết màn: Super Admin thấy phần nghề và quản trị,
   phụ huynh thấy phần gia đình. Thêm vai nữa thì tốn gấp đôi thời
   gian mà phần lớn là đo lại cùng một màn. */
const VAI = ['superadmin@gita365.vn', 'phuhuynh@gita365.vn'];

const NUT_NHO = 32;   /* mỗi chiều, tính bằng điểm ảnh CSS */
const CHU_NHO = 10;

(async () => {
  const b = await chromium.launch();
  let loi = 0, soDo = 0;
  const bao = (ok, ten, ct) => {
    if (!ok) loi++;
    if (!ok || !IM) console.log((ok ? '  ✓ ' : '  ✗ ') + ten + (ct ? ' — ' + ct : ''));
  };

  console.log('\nĐO KHUNG MÀN — 4 khổ màn thật, 2 vai\n');

  const tong = { tran: [], phanTu: [], nut: [], chu: [], ro: [], oNho: [], che: [], a11y: [] };

  for (const k of KHO) {
    const p = await b.newPage({ viewport: { width: k.w, height: k.h },
      hasTouch: k.cham, isMobile: k.cham, deviceScaleFactor: 1 });
    try {
      const kh = JSON.parse(require('fs').readFileSync(
        require('path').join(__dirname, '..', 'kho', 'khoa.json'), 'utf8'));
      if (kh && kh.khoa) await p.addInitScript(x => { window.GITA_KHOA = x; }, kh.khoa);
    } catch (e) { /* không có khoá — đo phần nền thôi */ }

    await p.goto(URL, { waitUntil: 'networkidle' });
    await p.evaluate(() => localStorage.clear());
    await p.reload({ waitUntil: 'networkidle' });
    await p.waitForTimeout(500);

    /* ══ MÀN CHƯA ĐĂNG NHẬP — ĐO TRƯỚC, VÌ ĐÓ LÀ MÀN ĐẦU TIÊN ══

       Bộ này `doLogin` ngay sau khi tải, nên suốt mười một tháng nó
       chưa bao giờ đo cái màn mà MỌI người lạ nhìn thấy đầu tiên. Chỗ
       mù ấy có giá thật: ở 9.99.80 một lượt đi thử bằng chân tìm ra
       cổng vào đẩy CẢ TRANG cuộn ngang ở mọi khổ điện thoại —
       scrollWidth 447px cố định, từ 320px tới 414px — trong khi bộ đo
       vẫn xanh 1.584 lượt.

       Ba nguyên nhân, cả ba là lớp lỗi tệp CLAUDE.md đã ghi: `.gate-top`
       là flex `nowrap`; rãnh lưới khai `1fr` nên không co dưới
       min-content; và một nhãn nút dài khai `white-space:nowrap`.

       Màn đầu tiên là màn đáng đo nhất — nó là màn duy nhất mà người
       chưa tin gì cả đang nhìn. */
    {
      const d0 = await p.evaluate(() => {
        const W = document.documentElement.clientWidth;
        const tran = Math.round(document.documentElement.scrollWidth - W);
        const vuot = [];
        document.querySelectorAll('*').forEach(e => {
          const r = e.getBoundingClientRect();
          if (!r.width || !r.height) return;
          if (r.right > W + 1) {
            const conVuot = [...e.children].some(c => {
              const rc = c.getBoundingClientRect();
              return rc.width && rc.right > W + 1;
            });
            if (!conVuot) vuot.push(e.tagName.toLowerCase() +
              (e.className ? '.' + e.className.toString().split(' ')[0] : '') +
              ' vượt ' + Math.round(r.right - W) + 'px');
          }
        });
        return { tran, vuot: vuot.slice(0, 4),
          coChu: (document.body.innerText || '').trim().length,
          daDangNhap: !!(window.G.S && window.G.S.acc) };
      });
      /* Đếm ba phép đo này vào tổng. Chạy mà không đếm thì con số in ra
         báo ÍT hơn thật — và một con số sai theo chiều nào cũng làm
         người đọc tin nhầm: ở đây nó giấu đúng ba phép đo vừa thêm. */
      soDo += 3;
      const nhan0 = k.ten + ' · CỔNG VÀO (chưa đăng nhập)';
      if (d0.daDangNhap) tong.tran.push(nhan0 + ' — đã đăng nhập sẵn, không đo được màn lạ');
      if (d0.tran > 1) tong.tran.push(nhan0 + ' — trang cuộn ngang ' + d0.tran +
        'px · ' + d0.vuot.join(' · '));
      if (d0.coChu < 300) tong.tran.push(nhan0 + ' — chỉ ' + d0.coChu +
        ' ký tự: người lạ mở link ra mà gần như không đọc được gì');
    }

    for (const em of VAI) {
      await p.evaluate(x => window.G.doLogin(x), em);
      await p.waitForTimeout(1600);
      const man = await p.evaluate(() => {
        const r = [];
        (window.G.NAV || []).forEach(g => (g.items || []).forEach(i => r.push(i.v)));
        return r;
      });

      for (const v of man) {
        const d = await p.evaluate(async (opt) => {
          window.G.go(opt.v);
          await new Promise(r => setTimeout(r, 90));
          const W = document.documentElement.clientWidth;

          /* Thẻ nằm trong một hộp cuộn ngang có chủ ý thì KHÔNG tính.
             Bảng rộng trong hộp cuộn là cách làm ĐÚNG — bắt nó là dạy
             người sau đi cắt bớt cột cho vừa màn. */
          /* DỪNG TRƯỚC <body>. Bản đầu tôi đi hết lên tới thẻ gốc, mà
             body có sẵn overflow-x:hidden — nên MỌI thẻ đều "nằm trong
             hộp cuộn" và phép đo này KHÔNG BAO GIỜ báo gì. Nó xanh suốt
             1464 lượt đo trong khi có một màn đang đẩy cả trang rộng
             555px trên màn 390px. Một phép kiểm chưa từng đỏ thì chưa
             phải phép kiểm, và đây đúng là một phép kiểm câm. */
          const trongHopCuon = (el) => {
            let q = el.parentElement;
            while (q && q !== document.body && q !== document.documentElement) {
              const ox = getComputedStyle(q).overflowX;
              if (ox === 'auto' || ox === 'scroll' || ox === 'hidden') return true;
              q = q.parentElement;
            }
            return false;
          };

          const thoRa = [];
          const goc = document.getElementById('main');
          if (goc) {
            const ds = goc.querySelectorAll('*');
            for (let i = 0; i < ds.length; i++) {
              const el = ds[i], r = el.getBoundingClientRect();
              if (r.width < 2 || r.height < 2) continue;
              const thua = Math.round(Math.max(r.right - W, -r.left));
              if (thua <= 1) continue;
              if (trongHopCuon(el)) continue;
              /* Chỉ giữ thẻ NGOÀI CÙNG. Một thẻ tràn kéo theo mọi thẻ
                 con của nó, và in cả chùm thì báo cáo dài gấp mười mà
                 vẫn chỉ một chỗ phải sửa. */
              if (thoRa.some(x => x.el.contains(el))) continue;
              thoRa.push({ el, thua,
                ten: el.tagName.toLowerCase() +
                     (el.className && typeof el.className === 'string'
                       ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.') : '') });
            }
          }

          const nutNho = [], chuNho = [], oNho = [], oThieuNhan = [];
          if (opt.cham && goc) {
            /* Thanh dưới cũng là chỗ bấm bằng ngón tay — đo luôn, dù nó
             nằm ngoài #main. */
          const nut = document.querySelectorAll(
            '#main button,#main a[href],#main [data-act],#main [role="button"],' +
            '#main input,#main select,#duoi button');
            for (let i = 0; i < nut.length; i++) {
              const el = nut[i];
              if (getComputedStyle(el).display === 'none') continue;
              /* ĐO VÙNG CHẠM THẬT, KHÔNG ĐO CÁI Ô VUÔNG.
                 Một ô tích 16px nằm trong một nhãn cao 44px thì ngón tay
                 bấm vào nhãn là trúng — bắt cái ô 16px ấy là báo nhầm,
                 và bản đầu của bộ này báo nhầm đúng như thế ở màn thư
                 viện: bảy "nút nhỏ" mà cả bảy đều bấm được. */
              const bao = el.closest('label,button') || el;
              const r = bao.getBoundingClientRect();
              if (r.width < 2 || r.height < 2) continue;
              /* ĐƯỜNG DẪN NẰM GIỮA CÂU VĂN thì bỏ qua. Nâng nó lên 32px
                 là chèn một khoảng trống giữa hai dòng chữ — đổi một chỗ
                 khó bấm lấy một đoạn văn vỡ. */
              if (el.tagName === 'A' && getComputedStyle(el).display === 'inline' &&
                  /^(P|LI|SPAN|TD|SMALL|EM|STRONG)$/.test(el.parentElement.tagName)) continue;
              if (r.height < opt.nutNho || r.width < opt.nutNho)
                nutNho.push(Math.round(r.width) + '×' + Math.round(r.height) + ' ' +
                  (el.textContent || '').trim().slice(0, 18));
            }
            /* ── Ô NHẬP DƯỚI 16px LÀM iOS PHÓNG CẢ TRANG ──
               Luật của Safari trên iPhone, không tắt được: chạm vào một
               ô chữ nhỏ hơn 16px thì nó phóng cả trang lên cho dễ gõ, và
               KHÔNG thu lại khi gõ xong. Người dùng phải tự chụm ngón tay
               thu về sau MỖI lần gõ một ô. */
            const oN = goc.querySelectorAll('input,textarea,select');
            for (let i = 0; i < oN.length; i++) {
              const el = oN[i];
              if (el.type === 'checkbox' || el.type === 'radio') continue;
              if (getComputedStyle(el).display === 'none') continue;
              const cx = parseFloat(getComputedStyle(el).fontSize);
              if (cx && cx < 16) oNho.push(cx + 'px · <' + el.tagName.toLowerCase() + '>');
            }
            /* ── Ô NHẬP THIẾU TÊN ĐỌC ĐƯỢC (a11y) ──
               Người khiếm thị nghe trình đọc màn đọc TÊN của ô để biết đang
               điền gì. Một ô không có tên đọc được (aria-label · aria-labelledby
               · <label for> · <label> bọc ngoài · title) là một ô người mù gặp
               phải là "ô nhập, không tên". placeholder KHÔNG tính: nó biến mất
               khi gõ và trình đọc màn có thể bỏ qua. */
            for (let i = 0; i < oN.length; i++) {
              const el = oN[i];
              if (el.type === 'hidden') continue;
              if (getComputedStyle(el).display === 'none') continue;
              const lbById = el.getAttribute('aria-labelledby');
              const co = (el.getAttribute('aria-label') || '').trim() ||
                (lbById && document.getElementById(lbById)) ||
                (el.getAttribute('title') || '').trim() ||
                (el.id && document.querySelector('label[for="' + el.id.replace(/["\\]/g, '') + '"]')) ||
                (el.closest && el.closest('label'));
              if (!co) oThieuNhan.push('<' + el.tagName.toLowerCase() +
                (el.type ? ' ' + el.type : '') + '>' + (el.id ? ' #' + el.id : ''));
            }
            const chu = goc.querySelectorAll('*');
            for (let i = 0; i < chu.length; i++) {
              const el = chu[i];
              if (!el.firstChild || el.firstChild.nodeType !== 3) continue;
              if (!(el.textContent || '').trim()) continue;
              const cx = parseFloat(getComputedStyle(el).fontSize);
              if (cx && cx < opt.chuNho) chuNho.push(cx + 'px: ' +
                (el.textContent || '').trim().slice(0, 20));
            }
          }

          /* ── CHỮ RÒ RA TỪ PHẦN ĐẦU TRANG ──
             Một thẻ <meta> bị cắt đôi thì nửa sau của nó rơi xuống thân
             trang và trình duyệt đọc như chữ thường. Chuyện ấy đã xảy ra
             thật: dòng khai quyền sở hữu trí tuệ của Học viện hiện ra
             thành chữ ở đầu MỌI trang, sống qua rất nhiều bản, vì trên
             màn để bàn nó nằm khuất sau thanh trên.
             Bắt bằng một luật đơn giản và không bao giờ sai: thân trang
             KHÔNG được có chữ nằm trần, ngoài mọi thẻ. */
          const roRa = [];
          for (let n = document.body.firstChild; n; n = n.nextSibling) {
            if (n.nodeType !== 3) continue;
            const t = (n.nodeValue || '').trim();
            if (t) roRa.push(t.slice(0, 60));
          }

          /* ── THANH DƯỚI CÓ CHE MẤT DÒNG CUỐI KHÔNG ──
             Thanh đứng đè lên đáy trang. Thiếu chỗ chừa thì dòng cuối
             của MỌI màn nằm dưới nó — và không ai báo, vì người ta
             tưởng màn hết ở đó. Cuộn xuống đáy rồi đo thẻ nội dung cuối
             cùng; đo lề của #main thì không thấy, vì chính lề ấy là chỗ
             chừa. */
          let che = 0;
          const td = document.getElementById('duoi');
          if (td && getComputedStyle(td).display !== 'none') {
            window.scrollTo(0, document.body.scrollHeight);
            await new Promise(r => setTimeout(r, 60));
            const v = document.querySelector('#main .view');
            const con = v ? Array.prototype.filter.call(v.children,
              x => x.getBoundingClientRect().height > 2) : [];
            if (con.length) {
              const cuoi = con[con.length - 1].getBoundingClientRect();
              che = Math.round(cuoi.bottom - td.getBoundingClientRect().top);
            }
            window.scrollTo(0, 0);
          }

          return {
            che,
            roRa,
            cuonNgang: Math.round(document.documentElement.scrollWidth - W),
            thoRa: thoRa.slice(0, 4).map(x => x.ten + ' thừa ' + x.thua + 'px'),
            soThoRa: thoRa.length,
            nutNho: nutNho.slice(0, 3), soNutNho: nutNho.length,
            oNho: oNho.slice(0, 3), soONho: oNho.length,
            chuNho: chuNho.slice(0, 2), soChuNho: chuNho.length,
            thieuNhan: oThieuNhan.slice(0, 6), soThieuNhan: oThieuNhan.length
          };
        }, { v, cham: k.cham, nutNho: NUT_NHO, chuNho: CHU_NHO });

        soDo++;
        const nhan = k.ten + ' · ' + v;
        if (d.che > 1) tong.che.push(nhan + ' — dòng cuối nằm dưới thanh ' + d.che + 'px');
        if (d.roRa.length) tong.ro.push(nhan + ' — chữ nằm trần trong thân trang: "' +
          d.roRa.join('" · "') + '"');
        if (d.cuonNgang > 1) tong.tran.push(nhan + ' — trang cuộn ngang ' + d.cuonNgang + 'px');
        if (d.soThoRa) tong.phanTu.push(nhan + ' — ' + d.soThoRa + ' thẻ tràn: ' + d.thoRa.join(' · '));
        if (d.soNutNho) tong.nut.push(nhan + ' — ' + d.soNutNho + ' nút nhỏ: ' + d.nutNho.join(' · '));
        if (d.soONho) tong.oNho.push(nhan + ' — ' + d.soONho + ' ô: ' + d.oNho.join(' · '));
        if (d.soChuNho) tong.chu.push(nhan + ' — ' + d.soChuNho + ' chỗ chữ nhỏ: ' + d.chuNho.join(' · '));
        if (d.soThieuNhan) tong.a11y.push(nhan + ' — ' + d.soThieuNhan + ' ô thiếu tên: ' + d.thieuNhan.join(' · '));
      }
    }
    await p.close();
    if (!IM) console.log('  đã đo xong khổ ' + k.ten + ' (' + k.w + 'px)');
  }

  /* Gộp theo MÀN chứ không theo lượt đo: một màn tràn ở cả bốn khổ là
     MỘT chỗ phải sửa, không phải bốn. In bốn dòng cho một chỗ là cách
     chắc nhất để người đọc bỏ qua cả báo cáo. */
  const gom = (ds) => {
    const m = {};
    ds.forEach(x => {
      const man = x.split(' · ')[1].split(' — ')[0];
      (m[man] = m[man] || []).push(x.split(' · ')[0]);
    });
    return Object.keys(m).map(k => k + ' (' + m[k].join(', ') + ')');
  };

  console.log('');
  bao(!tong.tran.length, 'KHÔNG MÀN NÀO LÀM CẢ TRANG CUỘN NGANG. Trên điện thoại đây là lỗi nặng nhất: người ta vuốt dọc, trang trượt ngang, chữ nhảy khỏi tầm mắt, và không ai báo lỗi ấy vì họ tưởng mình vuốt sai',
    tong.tran.length ? gom(tong.tran).slice(0, 12).join(' · ') : soDo + ' lượt đo');
  bao(!tong.phanTu.length, 'KHÔNG THẺ NÀO THÒ RA NGOÀI BỀ NGANG MÀN — trừ thẻ nằm trong hộp cuộn ngang có chủ ý, vì bảng rộng trong hộp cuộn là cách làm ĐÚNG',
    tong.phanTu.length ? tong.phanTu.slice(0, 10).join(' · ') : 'sạch');
  bao(!tong.nut.length, 'MỌI NÚT TRÊN KHỔ CHẠM ĐỀU ĐẠT ' + NUT_NHO + 'px MỖI CHIỀU — nhỏ hơn thì ngón tay bấm trượt, và người dùng đổ lỗi cho mình chứ không cho ứng dụng',
    tong.nut.length ? tong.nut.slice(0, 8).join(' · ') : 'sạch');
  bao(!tong.chu.length, 'KHÔNG CHỖ NÀO DÙNG CHỮ DƯỚI ' + CHU_NHO + 'px',
    tong.chu.length ? tong.chu.slice(0, 6).join(' · ') : 'sạch');
  bao(!tong.oNho.length, 'MỌI Ô NHẬP TRÊN KHỔ CHẠM ĐỀU DÙNG CHỮ TỪ 16px. Dưới mức ấy, Safari trên iPhone phóng CẢ TRANG lên khi người ta chạm vào ô — và không thu lại khi gõ xong, nên sau mỗi lần gõ họ phải tự chụm ngón tay thu về',
    tong.oNho.length ? Array.from(new Set(tong.oNho.map(x => x.split(' — ')[1]))).slice(0, 4).join(' · ') : 'sạch');
  bao(!tong.che.length, 'THANH DƯỚI ĐÁY KHÔNG CHE MẤT DÒNG CUỐI CỦA MÀN NÀO. Thanh đứng đè lên đáy trang, nên vùng nội dung phải chừa chỗ cho nó kể cả phần dưới vạch về nhà — thiếu chỗ chừa thì dòng cuối nằm khuất, và không ai báo vì người ta tưởng màn hết ở đó',
    tong.che.length ? tong.che.slice(0, 6).join(' · ') : 'sạch');
  bao(!tong.ro.length, 'THÂN TRANG KHÔNG CÓ CHỮ NẰM TRẦN NGOÀI MỌI THẺ. Một thẻ meta bị cắt đôi thì nửa sau rơi xuống thân trang và hiện ra thành chữ — đã xảy ra thật với dòng khai quyền sở hữu trí tuệ, sống qua rất nhiều bản vì trên màn để bàn nó khuất sau thanh trên',
    tong.ro.length ? Array.from(new Set(tong.ro.map(x => x.split(' — ')[1]))).slice(0, 3).join(' · ') : 'sạch');
  bao(!tong.a11y.length, 'MỌI Ô NHẬP CÓ TÊN ĐỌC ĐƯỢC cho trình đọc màn hình (aria-label · <label for> · <label> bọc · title). Người khiếm thị nghe TÊN ô để biết đang điền gì; một ô không tên đọc ra là "ô nhập, không tên" — placeholder KHÔNG tính vì nó biến mất khi gõ',
    tong.a11y.length ? gom(tong.a11y).slice(0, 24).join(' · ') : 'sạch');

  /* ══ HAI PHÉP SOI TĨNH ══
     Hai luật dưới đây KHÔNG đo được bằng trình duyệt ở đây: Playwright
     không giả lập được tai thỏ, và chiều cao 100vh chỉ sai khi thanh
     địa chỉ thật thu vào. Nên soi thẳng tệp kiểu. Soi tĩnh yếu hơn đo
     thật, nhưng bỏ hẳn thì hai lớp lỗi ấy không có ai canh. */
  {
    const css = require('fs').readFileSync(
      require('path').join(__dirname, '..', 'assets', 'style.css'), 'utf8');
    const htm = require('fs').readFileSync(
      require('path').join(__dirname, '..', 'index.html'), 'utf8');

    const nhanViec = /viewport-fit\s*=\s*cover/.test(htm);
    const coLo = /safe-area-inset-top/.test(css) && /safe-area-inset-bottom/.test(css);
    bao(!nhanViec || coLo,
      'ĐÃ KHAI viewport-fit=cover THÌ PHẢI ĐỌC env(safe-area-inset-*). Hai dòng ấy nói với máy "trang tự lo phần dưới tai thỏ và phần dưới vạch về nhà" — nhận việc mà không làm thì trên iPhone thanh trên chui xuống dưới tai thỏ và đáy trang nằm dưới vạch về nhà',
      nhanViec ? (coLo ? 'có nhận và có làm' : 'NHẬN MÀ KHÔNG LÀM') : 'không nhận việc');

    /* 100vh đứng MỘT MÌNH. Có dòng 100dvh ngay sau thì 100vh chỉ là bản
       lùi cho trình duyệt cũ — đúng cách làm, không bắt. */
    /* Bỏ lời chú giải trước khi soi — chính chú giải giải thích luật
       này cũng nhắc chữ 100vh, và một phép soi bắt luôn lời giải thích
       của chính nó thì không ai giữ nổi. Thay bằng khoảng trắng cùng
       số dòng, để số dòng báo ra vẫn đúng. */
    const cssSach = css.replace(/\/\*[\s\S]*?\*\//g,
      m => m.replace(/[^\n]/g, ' '));
    const traiPhep = [];
    cssSach.split('\n').forEach((d, i) => {
      if (!/\b100vh\b/.test(d)) return;
      if (/100dvh/.test(d)) return;
      traiPhep.push('dòng ' + (i + 1) + ': ' + d.trim().slice(0, 54));
    });
    bao(!traiPhep.length,
      'KHÔNG CHỖ NÀO DÙNG 100vh MỘT MÌNH. Trên điện thoại thanh địa chỉ của trình duyệt thu vào rồi lại thò ra, mà 100vh luôn tính theo lúc nó ĐÃ thu — nên đáy trang bị cắt đúng bằng chiều cao thanh ấy. Phải kèm 100dvh; giữ 100vh đứng trước làm bản lùi thì được',
      traiPhep.length ? traiPhep.slice(0, 4).join(' · ') : 'sạch');
  }

  console.log('\n' + (loi ? '✗ CÒN ' + loi + ' LOẠI LỖI KHỔ MÀN' : '✓ KHUNG MÀN SẠCH TRÊN CẢ BỐN KHỔ') +
    ' · ' + soDo + ' lượt đo');
  await b.close();
  process.exit(loi ? 1 : 0);
})();
