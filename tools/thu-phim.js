/* ═══════════════════════════════════════════════════════════════
   GITA 365 — THỬ ĐƯỜNG DỰNG PHIM, TỪ ĐỀ BÀI TỚI TỆP MP4
   Chạy: xvfb-run -a node tools/thu-phim.js

   ══ ĐO CẢ ĐƯỜNG, KHÔNG ĐO TỪNG KHÚC ══

   Đường dựng phim đi qua ba nhà: bộ vẽ trong trình duyệt → tệp PNG →
   ffmpeg. Đo từng khúc thì mỗi khúc đều xanh mà cuốn phim vẫn có thể
   sai — chỗ sai của một đường ba khúc gần như luôn nằm ở MỐI NỐI:
   khổ tấm không khớp, một cảnh rơi mất, thời lượng không bằng công
   thức. Nên bộ này chạy trọn đường một lần và đo tệp RA, không đo
   lời khai của hàm.

   ══ PHÉP ĐO VÀ PHÉP PHÁ ══

   Đo — trên TỆP RA, không trên lời khai của hàm:
     · cả bộ ra đủ tấm, không tấm nào rơi trong im lặng
     · mọi tấm cùng khổ, và khổ ấy đúng khổ bộ vẽ đã khoá
     · thời lượng, đo bằng ffprobe, bằng đúng n·giây − (n−1)·chồng
     · số khung hình khớp thời lượng ấy ở đúng nhịp hình
     · phim đúng khổ của bộ, và đủ số cảnh
     · tệp ra là H.264 / yuv420p — máy nào cũng mở được
     · cả năm kiểu chuyển cảnh đều dựng được, đúng thời lượng
     · lời đọc rơi đúng chỗ cảnh bắt đầu TRONG BẢN ĐÃ NỐI — không
       phải chỗ nó bắt đầu nếu nối thẳng (hai chỗ ấy lệch dồn)
     · một đề bài ra nhiều khổ, mỗi khổ VẼ LẠI chứ không đệm đen

   Phá (một phép kiểm chưa từng đỏ thì chưa phải phép kiểm):
     · một tấm khác khổ → TỪ CHỐI, và từ chối nêu tên tấm
     · thư mục rỗng → TỪ CHỐI
     · bộ có một tấm bộ vẽ không vẽ được → raAnh phải KHAI ra, chứ
       không lặng lẽ trả về phần còn lại
     · tấm CHƯA phát hành → TỪ CHỐI, nêu đúng bậc nó đang đứng (C19)
     · ảnh lạ thả vào thư mục, không có trong sổ nguồn → TỪ CHỐI
     · mất nguon.json → TỪ CHỐI
     · kiểu chuyển cảnh lạ → TỪ CHỐI, nêu tên kiểu
     · lời đọc dài hơn cảnh → TỪ CHỐI, nói thừa mấy giây
     · lời đọc không trùng tên tấm nào → TỪ CHỐI, nêu tên tệp
     · nhạc ngắn hơn phim → TỪ CHỐI, máy không tự lặp
   ═══════════════════════════════════════════════════════════════ */
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync, spawnSync } = require('child_process');
const { raAnh } = require('./tam-ra-anh');
const phim = require('./dung-phim');
const { boPhim } = require('./bo-phim');

/* Bài thử là nội dung GITA thật, không phải chữ lấp chỗ: một tấm lấp
   chỗ ngắn thì bố cục nào cũng vừa, và cuốn phim dựng từ nó không
   giống cuốn phim dựng từ tấm thật ở chỗ nào đáng đo cả. */
/* `trangThai: 'phatHanh'` ở mọi bản ghi — luật C19 đòi thế, và bài
   thử phải đi đúng đường thật chứ không đi một đường riêng cho dễ. */
const DE = [
  {id: 'TG-phim-1', tang: 'T1', loaiHinh: 'AP_PHICH', soatTang: 'thử',
   trangThai: 'phatHanh',
   nhiemVu: 'Cho thấy bảy ngày đầu gồm những gì.', nguoiXem: ['PHUHUYNH'],
   noiDung: 'BẢY NGÀY ĐẦU\n\nNHÃN: Chặng nền\n' +
     'PHỤ: Bảy ngày đầu chỉ để nhìn cho đúng\n' +
     'KÝ: Nhìn đúng trước, sửa sau.\n' +
     'Ô | Bộ test đầu vào | Cho cả học viên lẫn phụ huynh\n' +
     'Ô | Buổi tiếp nhận | Bốn mươi lăm tới sáu mươi phút\n' +
     'Ô | Phiếu ghi bảy ngày | Kèm hướng dẫn ghi từng ngày\n' +
     'Ô | Buổi đọc hồ sơ | Có mặt cả nhà\n' +
     'Ô | Cổng nghiệm thu ngày bảy | Một quyết định rõ cho chặng sau\n' +
     'Ô | Cùng bạn | Kiến tạo phiên bản tốt nhất của chính mình'},
  {id: 'TG-phim-2', tang: 'T1', trangThai: 'phatHanh', loaiHinh: 'KHUNG', soatTang: 'thử',
   nhiemVu: 'Cho thấy phần việc của mỗi người trong chặng nền.',
   nguoiXem: ['PHUHUYNH'],
   noiDung: 'LẮNG NGHE — Nghe hết câu chuyện của con mà chưa vội chữa\n' +
     'GHI LẠI — Ghi phiếu bảy ngày, mỗi ngày một dòng ngắn\n' +
     'ĐỌC CÙNG — Ngồi lại đọc hồ sơ, có mặt cả nhà\n' +
     'CHỌN MỘT — Chốt một việc cho chặng sau, không chốt mười\n' +
     'GIỮ NHỊP — Giữ đúng nhịp hai mươi mốt ngày, không nhanh hơn\n' +
     'CÙNG BẠN — Kiến tạo phiên bản tốt nhất của chính mình'},
  {id: 'TG-phim-3', tang: 'T1', trangThai: 'phatHanh', loaiHinh: 'MOT_SO', soatTang: 'thử',
   nhiemVu: 'Cho thấy một chuỗi giữ nhịp dài bao nhiêu ngày.',
   nguoiXem: ['PHUHUYNH'],
   noiDung: '21 ngày\n\nMột chuỗi giữ nhịp dài hai mươi mốt ngày. Hết chuỗi ' +
     'có một buổi ngồi lại, và buổi ấy cho một quyết định rõ cho chặng sau ' +
     'chứ không cho một lời khen.'},
  {id: 'TG-phim-4', tang: 'T1', trangThai: 'phatHanh', loaiHinh: 'CONG', soatTang: 'thử',
   nhiemVu: 'Cho thấy điều kiện qua cổng ngày bảy.', nguoiXem: ['PHUHUYNH'],
   noiDung: 'CỔNG | Cổng nghiệm thu ngày bảy\n' +
     'Phiếu bảy ngày — Ghi đủ bảy ngày, mỗi ngày một dòng\n' +
     'Buổi đọc hồ sơ — Đã ngồi lại đủ bốn mươi lăm phút\n' +
     'Một việc chốt — Nhà chọn được một việc cho chặng sau'}
];

const GIAY = 3;   /* ngắn hơn bản thật, chỉ để đo công thức */

function doTep(tep) {
  const r = execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0',
    '-show_entries', 'stream=codec_name,width,height,pix_fmt,nb_frames',
    '-show_entries', 'format=duration', '-of', 'default=nw=1', tep]).toString();
  const lay = k => (new RegExp('^' + k + '=(.*)$', 'm').exec(r) || [])[1];
  return {ma: lay('codec_name'), w: +lay('width'), h: +lay('height'),
          diem: lay('pix_fmt'), khung: +lay('nb_frames'),
          giay: +lay('duration')};
}

let loi = 0;
const bao = (ok, ten, chi) => {
  if (!ok) loi++;
  console.log('  ' + (ok ? '✓ ' : '✗ ') + ten + (chi ? ' — ' + chi : ''));
};

(async () => {
  if (!phim.coFfmpeg()) {
    console.log('\n⚠ Máy này chưa có ffmpeg/ffprobe — không đo được đường ' +
      'dựng phim.\n  Cài: apt-get install -y ffmpeg\n');
    process.exit(1);
  }

  const tam = fs.mkdtempSync(path.join(os.tmpdir(), 'gita-phim-'));
  try {
    console.log('\n══ 1. TỪ ĐỀ BÀI RA TẤM ══\n');
    const anh = path.join(tam, 'anh');
    const bo = await raAnh(DE, anh);
    bao(bo.hong.length === 0, 'không tấm nào rơi',
      bo.hong.length ? bo.hong.map(h => h.id + ': ' + h.error).join(' · ') : null);
    bao(bo.tep.length === DE.length, 'ra đủ tấm',
      bo.tep.length + '/' + DE.length);

    const khoTam = bo.tep.map(t => phim.coAnh(t));
    bao(khoTam.every(k => k.w === bo.kg.w && k.h === bo.kg.h),
      'mọi tấm cùng khổ đã khoá',
      bo.kg.w + '×' + bo.kg.h + ' · nền ' + bo.khoa.che);

    console.log('\n══ 2. TỪ TẤM RA PHIM ══\n');
    const ra = path.join(tam, 'phim.mp4');
    const kq = phim.dungPhim(anh, ra, GIAY);
    const d = doTep(ra);

    /* Công thức, không phải lời khai: mỗi mối nối chồng CHONG giây,
       nên n cảnh dài n·giây − (n−1)·chồng. Đo trên TỆP RA — hàm tự
       khai đúng mà tệp ra sai là chuyện đã xảy ra ở kho này. */
    const dung = DE.length * GIAY - (DE.length - 1) * phim.CHONG;
    bao(Math.abs(d.giay - dung) < 0.05, 'thời lượng bằng công thức',
      d.giay + ' giây (đợi ' + dung.toFixed(1) + ')');
    bao(d.khung === Math.round(dung * phim.FPS), 'đủ khung hình',
      d.khung + ' khung @ ' + phim.FPS + ' hình/giây');
    bao(d.w === bo.kg.w && d.h === bo.kg.h, 'phim đúng khổ của bộ',
      d.w + '×' + d.h);
    bao(d.ma === 'h264' && d.diem === 'yuv420p', 'H.264 / yuv420p',
      d.ma + ' / ' + d.diem);
    bao(kq.soCanh === DE.length, 'đủ cảnh', kq.soCanh + ' cảnh · ' + kq.kb + ' KB');

    console.log('\n══ 2b. NĂM KIỂU CHUYỂN CẢNH ══\n');
    /* Mỗi kiểu phải DỰNG ĐƯỢC và ra đúng thời lượng. Một kiểu tên
       đúng mà ffmpeg không nhận thì nó ném lỗi giữa chừng — và người
       dựng chỉ biết khi đang cần gấp. Đo cả năm, mỗi kiểu hai cảnh
       cho nhanh. */
    {
      const hai = path.join(tam, 'hai');
      fs.mkdirSync(hai);
      bo.tep.slice(0, 2).forEach(f =>
        fs.copyFileSync(f, path.join(hai, path.basename(f))));
      const so2 = JSON.parse(JSON.stringify(bo.nguon));
      so2.tam = so2.tam.slice(0, 2);
      fs.writeFileSync(path.join(hai, 'nguon.json'), JSON.stringify(so2), 'utf8');
      const doi2 = 2 * GIAY - phim.CHONG;
      for (const k of Object.keys(phim.CHUYEN)) {
        let d2 = null, noi = null;
        try {
          phim.dungPhim(hai, path.join(tam, 'ch_' + k + '.mp4'),
            {giay: GIAY, chuyen: k});
          d2 = doTep(path.join(tam, 'ch_' + k + '.mp4'));
        } catch (e) { noi = e.message; }
        bao(!!d2 && Math.abs(d2.giay - doi2) < 0.05, 'chuyển "' + k + '" dựng được',
          d2 ? d2.giay + ' giây' : noi);
      }
    }

    console.log('\n══ 2c. LỜI ĐỌC VÀ NHẠC ══\n');
    /* Lời đọc và nhạc là TỆP CÓ SẴN, không sinh máy. Bản đề xuất gọi
       một dịch vụ đọc lời ngoài; ở đây không, và lý do không nằm ở
       khoá API: giọng đọc trên một cuốn phim của Học viện là giọng
       của MỘT NGƯỜI đứng sau lời hứa trong phim. Một giọng máy đọc
       câu "nhà mình sẽ khác đi" là một lời hứa không ai đứng sau. */
    const loi = path.join(tam, 'loi');
    fs.mkdirSync(loi);
    bo.tep.forEach(function (f, i) {
      execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y',
        '-f', 'lavfi', '-i', 'sine=frequency=' + (300 + i * 120) + ':duration=1.5',
        path.join(loi, path.basename(f).replace(/\.png$/, '.mp3'))]);
    });
    const nhac = path.join(tam, 'nhac.mp3');
    execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y',
      '-f', 'lavfi', '-i', 'sine=frequency=180:duration=40', nhac]);

    const coAm = path.join(tam, 'co-am.mp4');
    const kqAm = phim.dungPhim(anh, coAm, {giay: GIAY, loi: loi, nhac: nhac});
    const dAm = doTep(coAm);
    bao(kqAm.soLoi === DE.length && kqAm.coNhac, 'nhận đủ lời đọc và nhạc',
      kqAm.soLoi + ' lời · nhạc: ' + kqAm.coNhac);
    bao(Math.abs(dAm.giay - dung) < 0.06, 'có tiếng rồi thời lượng vẫn đúng',
      dAm.giay + ' giây');

    /* ── LỜI ĐỌC RƠI ĐÚNG CẢNH ──
       Đây là chỗ bản đề xuất sai và tự ghi chú "chấp nhận được": nó
       đặt lời theo mốc trong KỊCH BẢN, mà bản đã nối ngắn hơn kịch
       bản CHONG giây mỗi mối. Lệch dồn — cảnh thứ mười lệch tám giây,
       tức là lời đọc rơi hẳn sang cảnh khác.
       Đo thật: dựng bản CHỈ có lời (không nhạc, vì nhạc chạy suốt thì
       không còn khoảng lặng nào để đo), rồi hỏi ffmpeg chỗ nào im. */
    {
      const chiLoi = path.join(tam, 'chi-loi.mp4');
      phim.dungPhim(anh, chiLoi, {giay: GIAY, loi: loi});
      /* silencedetect in ra STDERR, không phải stdout — execFileSync
         chỉ trả stdout nên phải dùng spawnSync mới đọc được. */
      const ra2 = spawnSync('ffmpeg', ['-hide_banner', '-nostats',
        '-i', chiLoi, '-af', 'silencedetect=noise=-40dB:d=0.2', '-f', 'null', '-'],
        {encoding: 'utf8', maxBuffer: 1 << 26}).stderr || '';
      const het = [...ra2.matchAll(/silence_end:\s*([\d.]+)/g)].map(m => +m[1]);
      const doi = [];
      for (let i = 1; i < DE.length; i++) doi.push(i * (GIAY - phim.CHONG));
      const lech = doi.map((t, i) => Math.abs((het[i] === undefined ? -99 : het[i]) - t));
      bao(lech.length === doi.length && lech.every(x => x < 0.15),
        'lời đọc rơi đúng chỗ cảnh bắt đầu trong bản ĐÃ NỐI',
        'đợi ' + doi.map(x => x.toFixed(1)).join(' · ') + ' · đo ' +
        het.map(x => x.toFixed(1)).join(' · '));
    }

    console.log('\n══ 3. MƯỜI PHÉP PHÁ ══\n');

    /* PHÁ 1 — một tấm khác khổ. Đây là chỗ hỏng THẬT dễ xảy ra nhất:
       ai đó vẽ thêm một tấm bằng G.veThiGiac() (không qua bộ) rồi bỏ
       chung thư mục. xfade sẽ ném một dòng lỗi khó đọc ở giữa chừng
       nếu không chặn trước. */
    /* Dựng một bản sao của thư mục ảnh để mỗi phép phá tự do đập. */
    const chep = function (ten, sua) {
      const t = path.join(tam, ten);
      fs.mkdirSync(t);
      bo.tep.forEach(f => fs.copyFileSync(f, path.join(t, path.basename(f))));
      const so = JSON.parse(JSON.stringify(bo.nguon));
      if (sua) sua(t, so);
      if (so) fs.writeFileSync(path.join(t, 'nguon.json'),
        JSON.stringify(so, null, 1), 'utf8');
      return t;
    };

    {
      /* Tấm lạ được GHI VÀO sổ nguồn với bậc đã phát hành, để phép
         phá này chạm đúng chỗ định chạm — nếu bỏ nó ngoài sổ thì cửa
         sổ-nguồn chặn trước, và phép đo khổ không bao giờ được thử. */
      const t2 = chep('lech', function (t, so) {
        execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y',
          '-f', 'lavfi', '-i', 'color=c=black:s=640x640', '-frames:v', '1',
          path.join(t, 'zzz-lech.png')]);
        so.tam.push({tep: 'zzz-lech.png', id: 'TG-lech', loaiHinh: 'BIA',
          trangThai: 'phatHanh'});
      });
      let noi = null;
      try { phim.dungPhim(t2, path.join(tam, 'x.mp4'), GIAY); }
      catch (e) { noi = e.message; }
      bao(noi && noi.indexOf('zzz-lech.png') >= 0 && noi.indexOf('640×640') >= 0,
        'tấm khác khổ bị từ chối, và từ chối nêu tên tấm',
        noi ? noi.slice(0, 60) + '…' : 'KHÔNG TỪ CHỐI');
    }

    /* PHÁ 2 — thư mục rỗng. Không chặn thì ffmpeg dựng một tệp 0 cảnh
       và bộ này vẫn xanh. */
    {
      const t3 = path.join(tam, 'rong');
      fs.mkdirSync(t3);
      let noi = null;
      try { phim.dungPhim(t3, path.join(tam, 'y.mp4'), GIAY); }
      catch (e) { noi = e.message; }
      bao(!!noi && /Không có ảnh nào/.test(noi), 'thư mục rỗng bị từ chối',
        noi || 'KHÔNG TỪ CHỐI');
    }

    /* PHÁ 3 — một đề bài bộ vẽ không vẽ được. MOT_SO không có con số
       là chỗ từ chối có thật của bộ vẽ. raAnh phải KHAI tấm rơi ra,
       vì một cuốn phim thiếu một cảnh trông y hệt một cuốn phim đủ. */
    {
      const de2 = DE.slice(0, 2).concat([Object.assign({}, DE[2], {
        id: 'TG-phim-hong',
        noiDung: 'Vài ngày\n\nMột chuỗi giữ nhịp, không nêu con số nào cả.'})]);
      const bo2 = await raAnh(de2, path.join(tam, 'anh2'));
      bao(bo2.hong.length === 1 && bo2.hong[0].id === 'TG-phim-hong',
        'tấm không vẽ được thì được khai ra',
        bo2.hong.length ? bo2.hong[0].id : 'KHÔNG KHAI');
      bao(bo2.tep.length === 2, 'và không lẫn vào thư mục ảnh',
        bo2.tep.length + ' tấm');
    }

    /* ── BA PHÉP PHÁ CỦA LUẬT C19 ──
       Phim đi xa hơn tấm rời, nên nếu nó dựng được từ tấm chưa duyệt
       thì cả thang duyệt thị giác có một lối vòng. Ba cách vòng, ba
       phép phá: hạ bậc một tấm · thả thêm một ảnh ngoài sổ · bỏ sổ
       đi. Cả ba phải bị chặn, và chặn có nêu tên. */
    {
      const t4 = chep('chuaduyet', function (t, so) {
        so.tam[1].trangThai = 'duyet'; });
      let noi = null;
      try { phim.dungPhim(t4, path.join(tam, 'z1.mp4'), GIAY); }
      catch (e) { noi = e.message; }
      bao(!!noi && /C19/.test(noi) && noi.indexOf('(duyet)') >= 0,
        'tấm chưa phát hành bị từ chối, nêu đúng bậc nó đang đứng',
        noi ? noi.slice(0, 70) + '…' : 'KHÔNG TỪ CHỐI');
    }
    {
      const t5 = chep('anhla', function (t, so) {
        fs.copyFileSync(bo.tep[0], path.join(t, 'zzz-la.png'));
        /* KHÔNG ghi vào sổ — đó chính là chỗ đang thử. */
      });
      let noi = null;
      try { phim.dungPhim(t5, path.join(tam, 'z2.mp4'), GIAY); }
      catch (e) { noi = e.message; }
      bao(!!noi && noi.indexOf('zzz-la.png') >= 0,
        'ảnh không có trong sổ nguồn bị từ chối',
        noi ? noi.slice(0, 70) + '…' : 'KHÔNG TỪ CHỐI');
    }
    {
      const t6 = chep('mat-so', null);
      fs.rmSync(path.join(t6, 'nguon.json'), {force: true});
      let noi = null;
      try { phim.dungPhim(t6, path.join(tam, 'z3.mp4'), GIAY); }
      catch (e) { noi = e.message; }
      bao(!!noi && /Thiếu nguon\.json/.test(noi),
        'mất sổ nguồn thì không dựng được phim',
        noi ? noi.slice(0, 70) + '…' : 'KHÔNG TỪ CHỐI');
    }

    /* ── BỐN PHÉP PHÁ CỦA PHẦN MỚI 9.99.32 ── */
    {
      let noi = null;
      try { phim.dungPhim(anh, path.join(tam, 'z4.mp4'),
        {giay: GIAY, chuyen: 'xoay-vong-vo'}); }
      catch (e) { noi = e.message; }
      bao(!!noi && noi.indexOf('xoay-vong-vo') >= 0,
        'kiểu chuyển cảnh lạ bị từ chối, nêu tên kiểu',
        noi ? noi.slice(0, 70) + '…' : 'KHÔNG TỪ CHỐI');
    }
    {
      /* Lời dài hơn cảnh: cuối câu bị cảnh sau đè lên, mà nghe thì
         vẫn trôi — không ai biết là đã mất nửa câu. */
      const loi2 = path.join(tam, 'loi-dai');
      fs.mkdirSync(loi2);
      execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y',
        '-f', 'lavfi', '-i', 'sine=frequency=300:duration=' + (GIAY + 2),
        path.join(loi2, path.basename(bo.tep[0]).replace(/\.png$/, '.mp3'))]);
      let noi = null;
      try { phim.dungPhim(anh, path.join(tam, 'z5.mp4'), {giay: GIAY, loi: loi2}); }
      catch (e) { noi = e.message; }
      bao(!!noi && /dài .* mà cảnh chỉ có/.test(noi),
        'lời đọc dài hơn cảnh bị từ chối, nói thừa mấy giây',
        noi ? noi.slice(0, 78) + '…' : 'KHÔNG TỪ CHỐI');
    }
    {
      /* Tên lời đọc không trùng tấm nào: nếu nhận bừa theo thứ tự thì
         một tệp thêm vào giữa là cả cuốn phim đọc lệch một cảnh. */
      const loi3 = path.join(tam, 'loi-la');
      fs.mkdirSync(loi3);
      fs.copyFileSync(path.join(loi, fs.readdirSync(loi)[0]),
        path.join(loi3, 'canh-mot.mp3'));
      let noi = null;
      try { phim.dungPhim(anh, path.join(tam, 'z6.mp4'), {giay: GIAY, loi: loi3}); }
      catch (e) { noi = e.message; }
      bao(!!noi && noi.indexOf('canh-mot.mp3') >= 0,
        'lời đọc không trùng tên tấm nào bị từ chối, nêu tên tệp',
        noi ? noi.slice(0, 70) + '…' : 'KHÔNG TỪ CHỐI');
    }
    {
      /* Nhạc ngắn hơn phim: máy KHÔNG lặp cho đủ. */
      const nhacNgan = path.join(tam, 'nhac-ngan.mp3');
      execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y',
        '-f', 'lavfi', '-i', 'sine=frequency=180:duration=3', nhacNgan]);
      let noi = null;
      try { phim.dungPhim(anh, path.join(tam, 'z7.mp4'),
        {giay: GIAY, nhac: nhacNgan}); }
      catch (e) { noi = e.message; }
      bao(!!noi && /Bản nhạc dài/.test(noi),
        'nhạc ngắn hơn phim bị từ chối, máy không tự lặp',
        noi ? noi.slice(0, 70) + '…' : 'KHÔNG TỪ CHỐI');
    }

    console.log('\n══ 4. MỘT ĐỀ BÀI, NHIỀU KHỔ ══\n');
    /* Điều đáng đo ở đây KHÔNG phải "ra ba tệp". Nó là: ba cuốn phim
       dựng từ BA BỘ TẤM KHÁC NHAU, mỗi bộ do bộ vẽ xếp lại bố cục cho
       khổ ấy — chứ không phải một bộ tấm duy nhất bị thu nhỏ và đệm
       đen hai bên như bản đề xuất làm.

       TÔI ĐÃ THỬ ĐO BẰNG cropdetect VÀ NÓ KHÔNG ĐO ĐƯỢC. Dựng một
       bản đệm đen thật rồi cho cropdetect soi: nó vẫn báo khung đầy
       đủ, vì sau khi đổi sang yuv420p thì màu đen là Y=16 chứ không
       phải 0, mà ngưỡng phải đặt ở 0 để nền tối của thương hiệu không
       bị cắt oan. Một phép đo không phân biệt được hai trường hợp thì
       không phải phép đo — bỏ, và ghi lại để lần sau khỏi thử lại.

       Đo được, và đúng chỗ: ba bộ tấm phải KHÁC BYTE nhau. Một bộ
       dùng lại thì tệp giống hệt. */
    {
      const ba = path.join(tam, 'ba-kho');
      const r3 = await boPhim(DE, ba, {giay: GIAY, kho: 'vuong,doc,dung'});
      bao(r3.length === 3, 'ra đủ ba cuốn', r3.map(x => x.kho).join(' · '));
      bao(r3[0].w === 1080 && r3[0].h === 1080 &&
          r3[1].w === 1080 && r3[1].h === 1350 &&
          r3[2].w === 1080 && r3[2].h === 1920,
        'mỗi cuốn đúng khổ của nó',
        r3.map(x => x.w + '×' + x.h).join(' · '));
      bao(r3.every(x => x.soCanh === DE.length &&
                   Math.abs(x.giay - dung) < 0.05),
        'ba cuốn cùng số cảnh và cùng thời lượng',
        r3.map(x => x.giay).join(' · ') + ' giây');
      const bam = k => require('crypto').createHash('sha1')
        .update(fs.readFileSync(path.join(ba, 'tam-' + k, 'tam-000-ap-phich.png')))
        .digest('hex').slice(0, 12);
      const b1 = bam('vuong'), b2 = bam('doc'), b3 = bam('dung');
      bao(b1 !== b2 && b2 !== b3 && b1 !== b3,
        'ba bộ tấm được VẼ LẠI cho từng khổ, không dùng lại một bộ',
        b1 + ' · ' + b2 + ' · ' + b3);
    }
  } finally {
    fs.rmSync(tam, {recursive: true, force: true});
  }

  console.log('');
  if (loi) { console.log('✗ CÒN ' + loi + ' CHỖ ĐỂ SỬA\n'); process.exit(1); }
  console.log('✓ ĐƯỜNG DỰNG PHIM CHẠY TRỌN — ĐÚNG KHỔ, ĐÚNG CÔNG THỨC, ĐÚNG CHỖ LỜI RƠI\n');
})().catch(e => { console.error('✗ ' + e.stack); process.exit(1); });
