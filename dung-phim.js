#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════
   GITA 365 — DỰNG PHIM TỪ MỘT BỘ ẢNH ĐÃ VẼ

   Chủ hệ chốt 9.99.31: làm phim. 9.99.32 thêm ba thứ chủ hệ gửi
   trong bản đề xuất v6.1/v7 mà LÀM ĐƯỢC TRONG MÁY:

     · chuyển cảnh chọn được — năm kiểu, không chỉ mờ chồng
     · lời đọc và nhạc nền — từ TỆP ÂM THANH CÓ SẴN, không sinh máy
     · khổ nào cũng dựng được (xem tools/bo-phim.js)

   ══ LÀM THEO CÁCH CỦA KHO NÀY, KHÔNG THEO BẢN ĐỀ XUẤT ══

   Bản đề xuất dựng phim bằng bốn dịch vụ ngoài: một mô hình sinh
   chuyển động từ ảnh, một mô hình đọc lời, một mô hình soạn nhạc, và
   một mô hình thị giác viết kịch bản từ NỘI DUNG SÁCH gửi ra ngoài.

   Ba thứ cần một khoá API chủ hệ chưa nạp. Thứ thứ tư — gửi nội dung
   sách ra ngoài để viết kịch bản — là chỗ luật C11 cấm thẳng.

   Còn một chỗ đáng nói riêng: gửi TẤM ĐÃ DỰNG ra một mô hình sinh
   chuyển động cũng là gửi nội dung ra ngoài. Tấm ấy mang tiêu đề,
   câu phụ, ô việc, dấu GITA — nó KHÔNG phải một đề bài, nó là ấn
   phẩm. Luật C11 nói chỉ ĐỀ BÀI được rời hệ, và một tấm hoàn chỉnh
   thì không phải đề bài.

   Nên bộ này làm phần LÀM ĐƯỢC HÔM NAY, và làm trọn:

     · Ảnh vào là chính những tấm BỘ VẼ TRONG MÁY đã dựng — cùng khoá
       kiểu, cùng khổ, cùng nền (luật boAnh)
     · Chuyển động: Ken Burns — phóng chậm VÀ trôi ngang, luân phiên
       vào/ra để có nhịp. Đây không phải "3D giả": nó là cách một cuốn
       phim tài liệu làm cho một tấm ảnh tĩnh sống, và nó có từ trước
       khi có mô hình sinh video
     · Nối cảnh bằng năm kiểu chuyển, mặc định là mờ chồng
     · Lời đọc và nhạc: nhận TỆP có sẵn, trộn đúng chỗ. Không sinh
     · Không chữ cháy thêm — chữ ĐÃ nằm trong tấm rồi, do máy đặt, đo
       được từng chữ (luật C14)

   ══ VÌ SAO KHÔNG BURN PHỤ ĐỀ ══

   Bản đề xuất cháy phụ đề bằng ffmpeg drawtext với font Playfair. Ở
   đây không cần: mỗi cảnh LÀ một tấm áp phích đã có tiêu đề, câu phụ,
   ô việc — tất cả đã qua phép đo tương phản và phép đo chữ-trong-khung.
   Cháy thêm một lớp chữ nữa là chồng chữ lên chữ.

   ══ VÌ SAO KHÔNG CHỈNH MÀU CẢ PHIM ══

   Bản đề xuất thêm `eq=saturation=1.05:contrast=1.03` vào mọi cảnh.
   Không lấy. Cả bảng màu của kho này đã đi qua phép đo tương phản
   WCAG trên chính điểm ảnh đã vẽ ra; kéo bão hoà và tương phản lên
   sau đó là đổi MỌI màu đã đo, và không phép đo nào của kho này soi
   tệp mp4. Một lớp chỉnh màu vô hình trên đường ra là chỗ tệ nhất
   để đặt nó.

   ══ CHỈ DỰNG TỪ TẤM ĐÃ PHÁT HÀNH (luật C19) ══

   Thư mục ảnh phải có `nguon.json` do `tam-ra-anh.js` ghi: mỗi tệp
   PNG truy về một bản ghi thị giác và bậc duyệt của nó. Không có sổ,
   có ảnh ngoài sổ, hay có tấm chưa tới bậc `phatHanh` thì dừng.

   Chạy:  node tools/tam-ra-anh.js <đề-bài.json> <thư mục ảnh>
          node tools/dung-phim.js  <thư mục ảnh> <ra.mp4> [giây/cảnh] \
                                   [--chuyen=fade] [--loi=<thư mục>] \
                                   [--nhac=<tệp>]
   ═══════════════════════════════════════════════════════════════ */
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const FPS = 30;
const GIAY_MOI_CANH = 5;
const CHONG = 0.8;          /* chuyển cảnh chồng bao nhiêu giây */
const NHAC_TO = 0.15;       /* nhạc nền to bằng bao nhiêu phần lời */
const NHAC_TAT = 3.0;       /* nhạc nhỏ dần trong mấy giây cuối */

/* ── NĂM KIỂU CHUYỂN CẢNH, DANH SÁCH TRẮNG ──
   ffmpeg nhận vài chục kiểu. Không mở hết: một cuốn phim đổi kiểu
   chuyển ở mỗi mối nối thì người xem nhìn CHUYỂN CẢNH chứ không nhìn
   nội dung. Năm kiểu, mỗi kiểu một việc — và tên gõ sai thì nói ra
   ngay chứ không để ffmpeg ném một dòng lỗi khó đọc.

   `mo` là mặc định và là kiểu của thương hiệu: nó không tự nhận là
   một hiệu ứng. Bốn kiểu kia dành cho bản cắt đăng mạng xã hội, chỗ
   người ta lướt và một cú chuyển phải giữ được mắt lại. */
const CHUYEN = {
  mo:      {ff: 'fade',       ten: 'Mờ chồng — mặc định, không tự nhận là hiệu ứng'},
  quaDen:  {ff: 'fadeblack',  ten: 'Chìm qua đen — tách hẳn hai phần'},
  gatTrai: {ff: 'wipeleft',   ten: 'Gạt sang trái — nhịp nhanh'},
  truotLen:{ff: 'slideup',    ten: 'Trượt lên — hợp khổ dọc'},
  moTron:  {ff: 'circleopen', ten: 'Mở tròn — mở đầu hoặc kết'}
};

/* ── CÓ FFMPEG KHÔNG ──
   Thiếu ffmpeg thì execFileSync ném ENOENT — một dòng lỗi không nói
   được phải làm gì. Hỏi trước, và trả lời bằng câu người đọc hiểu. */
function coFfmpeg() {
  try {
    execFileSync('ffmpeg', ['-version'], {stdio: 'ignore'});
    execFileSync('ffprobe', ['-version'], {stdio: 'ignore'});
    return true;
  } catch (e) { return false; }
}

function chay(args) {
  return execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error'].concat(args),
    {maxBuffer: 1 << 28});
}

/* Đo tấm ra bao nhiêu điểm ảnh — đọc từ chính tệp, không tin tên. */
function coAnh(tep) {
  const r = execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0',
    '-show_entries', 'stream=width,height', '-of', 'csv=p=0:s=x', tep])
    .toString().trim().split('x');
  return {w: Number(r[0]), h: Number(r[1])};
}

/* Tệp âm dài bao nhiêu giây — cũng đọc từ tệp. */
function daiAm(tep) {
  return Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries',
    'format=duration', '-of', 'csv=p=0', tep]).toString().trim()) || 0;
}

/* ── MỘT CẢNH: KEN BURNS ──
   zoompan phóng từ 1,0 tới 1,10 trong đúng số khung của cảnh. Luân
   phiên phóng-vào và phóng-ra: mười cảnh cùng phóng vào thì phim ra
   một nhịp đều đều, và nhịp đều đều thì người xem thôi nhìn.

   TRÔI NGANG NỮA (9.99.32). Bản 9.99.31 chỉ phóng, tâm đứng yên —
   và phóng quanh một tâm cố định trông giống một cái ảnh đang to ra
   hơn là một máy quay đang đi. Trôi ngang nửa phần trăm khung mỗi
   cảnh, đổi chiều theo cảnh, thì mắt đọc ra là MÁY QUAY di chuyển.

   Biên trôi tính theo phần thừa của phép phóng: phóng 1,10 thì thừa
   ra 10% bề rộng, trôi tối đa một nửa phần thừa ấy về mỗi bên. Trôi
   quá thì mép ảnh lọt vào khung — mà mép ảnh lọt vào khung là một
   vệt đen, và một vệt đen thì không ai gọi là hiệu ứng.

   PHÓNG TỪ BẢN GẤP ĐÔI. zoompan lấy mẫu lại ảnh ở mỗi khung; phóng
   thẳng trên ảnh gốc thì nét chữ rung lăn tăn suốt cảnh — thấy rõ nhất
   ở chữ nhỏ, mà tấm nào của kho này cũng có chữ nhỏ. */
function veCanh(anh, ra, giay, vao, kg) {
  const khung = Math.round(giay * FPS);
  const buoc = (0.10 / khung).toFixed(6);
  const z = vao ? `min(zoom+${buoc},1.10)` : `max(1.10-${buoc}*on,1.0)`;
  /* Trôi: từ giữa lệch dần sang một bên, tối đa 1/4 phần thừa. */
  const bien = `(iw-iw/zoom)/4`;
  const t = `(on/${khung})`;
  const x = vao ? `iw/2-(iw/zoom/2)+${bien}*${t}`
                : `iw/2-(iw/zoom/2)-${bien}*${t}`;
  chay(['-y', '-loop', '1', '-i', anh, '-t', String(giay),
    '-vf', `scale=${kg.w * 2}:${kg.h * 2}:flags=lanczos,` +
           `zoompan=z='${z}':x='${x}':y='ih/2-(ih/zoom/2)':` +
           `d=${khung}:s=${kg.w}x${kg.h}:fps=${FPS},format=yuv420p`,
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-an', ra]);
}

/* ── NỐI CẢNH ──
   xfade chồng hai cảnh, nên MỖI mối nối ăn mất CHONG giây của tổng.
   Bản đề xuất tính offset bằng một biến `label` gán hai lần với hai
   luật khác nhau — chuỗi filter nó dựng ra không hợp lệ khi có hơn hai
   cảnh. Ở đây offset cộng dồn tường minh, và tổng thời lượng tính lại
   theo đúng công thức chứ không đoán. */
function noiCanh(ds, ra, kieu) {
  if (ds.length === 1) { fs.copyFileSync(ds[0].tep, ra); return ds[0].giay; }
  const vao = [];
  ds.forEach(function (c) { vao.push('-i', c.tep); });
  let loc = '', nhan = '[0:v]', don = ds[0].giay;
  for (let i = 1; i < ds.length; i++) {
    const cuoi = i === ds.length - 1 ? '[ra]' : `[v${i}]`;
    loc += `${nhan}[${i}:v]xfade=transition=${kieu}:duration=${CHONG}:` +
           `offset=${(don - CHONG).toFixed(3)}${cuoi};`;
    don = don + ds[i].giay - CHONG;
    nhan = cuoi;
  }
  chay(vao.concat(['-filter_complex', loc.replace(/;$/, ''), '-map', '[ra]',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '18',
    '-pix_fmt', 'yuv420p', '-r', String(FPS), '-y', ra]));
  return don;
}

/* ── TRỘN TIẾNG ──
   Lời đọc: mỗi cảnh một tệp, đặt đúng chỗ cảnh ấy BẮT ĐẦU trong bản
   đã nối — không phải chỗ nó bắt đầu nếu nối thẳng. Hai chỗ ấy lệch
   nhau i·CHONG giây, và lệch dồn: cảnh thứ mười lệch tám giây. Bản
   đề xuất ghi chú "chấp nhận được"; ở đây không, vì tám giây là lời
   đọc rơi hẳn sang cảnh khác.

   Nhạc: nhỏ còn NHAC_TO, và nhỏ dần trong NHAC_TAT giây cuối. Không
   lặp: một bản nhạc lặp giữa câu thì nghe ra ngay, và nghe ra một
   mối nối là nghe ra rằng không ai chọn bản nhạc này cho đúng phim
   này. Ngắn quá thì nói ra chứ không tự vá. */
function tronTieng(phimCam, ra, tong, am, nhac) {
  const vao = ['-i', phimCam];
  const loc = [];
  const nhan = [];
  am.forEach(function (a, i) {
    vao.push('-i', a.tep);
    const tre = Math.round(a.batDau * 1000);
    loc.push(`[${i + 1}:a]adelay=${tre}|${tre},volume=1.0[loi${i}]`);
    nhan.push(`[loi${i}]`);
  });
  if (nhac) {
    vao.push('-i', nhac);
    const j = am.length + 1;
    loc.push(`[${j}:a]volume=${NHAC_TO},` +
      `afade=t=out:st=${Math.max(0, tong - NHAC_TAT).toFixed(2)}:d=${NHAC_TAT}[nhac]`);
    nhan.push('[nhac]');
  }
  if (!nhan.length) { fs.copyFileSync(phimCam, ra); return false; }
  loc.push(nhan.join('') + 'amix=inputs=' + nhan.length +
    ':duration=longest:normalize=0[tieng]');
  chay(vao.concat(['-filter_complex', loc.join(';'),
    '-map', '0:v', '-map', '[tieng]', '-t', tong.toFixed(3),
    '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-y', ra]));
  return true;
}

/* Đọc thư mục lời đọc: mỗi tệp phải trùng TÊN với một tấm, chỉ khác
   đuôi. Trùng tên là cách duy nhất biết chắc lời nào của cảnh nào —
   đánh số riêng thì hai danh sách lệch nhau một lần là cả cuốn phim
   đọc sai cảnh, mà nghe thì vẫn trôi. */
function docLoi(thuMucLoi, tenTam, giay) {
  if (!thuMucLoi) return [];
  if (!fs.existsSync(thuMucLoi))
    throw new Error('Không có thư mục lời đọc: ' + thuMucLoi);
  const co = fs.readdirSync(thuMucLoi).filter(function (f) {
    return /\.(mp3|m4a|aac|wav|opus)$/i.test(f); });
  const goc = {};
  co.forEach(function (f) { goc[f.replace(/\.[^.]+$/, '')] = f; });

  const la = co.filter(function (f) {
    return tenTam.indexOf(f.replace(/\.[^.]+$/, '') + '.png') < 0 &&
           tenTam.indexOf(f.replace(/\.[^.]+$/, '') + '.jpg') < 0; });
  if (la.length) throw new Error('Tệp lời đọc không trùng tên tấm nào: ' +
    la.join(', ') + '. Đặt tên lời đọc y hệt tên tấm, chỉ khác đuôi — ' +
    'đó là cách duy nhất biết chắc lời nào của cảnh nào.');

  const ra = [];
  tenTam.forEach(function (t, i) {
    const f = goc[t.replace(/\.[^.]+$/, '')];
    if (!f) return;
    const tep = path.join(thuMucLoi, f);
    const dai = daiAm(tep);
    /* Lời dài hơn cảnh thì cuối câu bị cảnh sau đè lên. Máy KHÔNG tự
       kéo dài cảnh: kéo dài là đổi nhịp cả phim vì một tệp âm, và
       người dựng không được báo. Nói ra, để họ cắt lời hoặc nới cảnh. */
    if (dai > giay + 0.05) throw new Error('Lời đọc "' + f + '" dài ' +
      dai.toFixed(1) + ' giây mà cảnh chỉ có ' + giay + ' giây — thừa ' +
      (dai - giay).toFixed(1) + '. Cắt lời ngắn lại, hoặc dựng với ' +
      Math.ceil(dai) + ' giây mỗi cảnh.');
    ra.push({tep: tep, canh: i, batDau: i * (giay - CHONG), dai: dai});
  });
  return ra;
}

function dungPhim(thuMuc, raTep, chon) {
  if (!coFfmpeg()) throw new Error('Máy này chưa có ffmpeg/ffprobe — ' +
    'phim dựng bằng chúng. Cài: apt-get install -y ffmpeg');
  /* Đối số thứ ba từng là một con số. Giữ nhận cả hai để lệnh cũ và
     bộ thử cũ không gãy. */
  const o = (chon && typeof chon === 'object') ? chon : {giay: chon};
  const giay = Number(o.giay) || GIAY_MOI_CANH;

  const kieuTen = o.chuyen || 'mo';
  if (!CHUYEN[kieuTen]) throw new Error('Không có kiểu chuyển cảnh "' +
    kieuTen + '". Có: ' + Object.keys(CHUYEN).join(' · ') + '.');
  const kieu = CHUYEN[kieuTen].ff;

  const anh = fs.readdirSync(thuMuc).filter(function (f) {
    return /\.(png|jpe?g)$/i.test(f); }).sort();
  if (!anh.length) throw new Error('Không có ảnh nào trong ' + thuMuc);

  /* ── SỔ NGUỒN, VÀ ĐÒI ĐỦ BẬC (luật C19) ──
     Phim chỉ dựng từ tấm ĐÃ phát hành. Tệp PNG không mang theo bậc
     duyệt của bản ghi sinh ra nó, nên nếu chỉ đọc thư mục ảnh thì
     luật ấy không kiểm được — nó thành một câu trong sổ.
     `tam-ra-anh.js` ghi kèm `nguon.json`. Ở đây ĐÒI sổ ấy, và đòi
     nó khớp từng tệp: danh sách trắng chứ không danh sách cấm, vì
     một danh sách cấm thì chỉ cần thả thêm một tệp lạ vào thư mục
     là qua được. */
  var soNguon;
  try {
    soNguon = JSON.parse(fs.readFileSync(path.join(thuMuc, 'nguon.json'), 'utf8'));
  } catch (e) {
    throw new Error('Thiếu nguon.json trong ' + thuMuc + '. Phim chỉ dựng từ ' +
      'tấm ĐÃ phát hành (luật C19), mà tệp PNG không mang theo bậc duyệt — ' +
      'sổ nguồn là chỗ duy nhất biết. Dựng tấm bằng: node tools/tam-ra-anh.js ' +
      '<đề-bài.json> ' + thuMuc);
  }
  var theoTen = {};
  (soNguon.tam || []).forEach(function (t) { theoTen[t.tep] = t; });
  var laTep = anh.filter(function (f) { return !theoTen[f]; });
  if (laTep.length) throw new Error('Có ảnh không nằm trong nguon.json: ' +
    laTep.join(', ') + '. Mỗi cảnh phải truy được về một bản ghi thị giác.');
  var chuaDuyet = anh.filter(function (f) {
    return theoTen[f].trangThai !== 'phatHanh'; })
    .map(function (f) { return f + ' (' + theoTen[f].trangThai + ')'; });
  if (chuaDuyet.length) throw new Error('Tấm chưa phát hành, không vào phim ' +
    'được (luật C19): ' + chuaDuyet.join(', ') + '. Phim đi xa hơn tấm rời, ' +
    'nên nó không được là lối vòng qua thang duyệt.');

  /* ── MỌI TẤM PHẢI CÙNG KHỔ ──
     Luật boAnh đã đòi thế. Chỗ chặn này thì để đỡ một lớp hỏng KHÁC.

     Tôi từng viết ở đây rằng "xfade từ chối nối hai luồng khác kích
     thước, nên phải chặn trước". SAI, và phép phá đã bắt: bỏ chỗ
     chặn này ra thì phim vẫn dựng xong, không một dòng lỗi nào. Vì
     `veCanh` scale từng cảnh về đúng kg.w×kg.h trước khi nối — nên
     một tấm 640×640 lọt vào bộ 1080×1080 sẽ được KÉO GIÃN cho vừa,
     và cuốn phim ra có một cảnh méo mà không ai được báo.

     Máy im lặng làm méo thì tệ hơn máy báo lỗi. Nên chặn — và chặn
     vì lý do ấy, không vì lý do tôi đoán lúc đầu. */
  const kg = coAnh(path.join(thuMuc, anh[0]));
  const lech = anh.map(function (f) {
    const c = coAnh(path.join(thuMuc, f));
    return (c.w !== kg.w || c.h !== kg.h) ? f + ' (' + c.w + '×' + c.h + ')' : null;
  }).filter(Boolean);
  if (lech.length) throw new Error('Ảnh khác khổ so với tấm đầu ' + kg.w + '×' +
    kg.h + ': ' + lech.join(', ') + '. Cả bộ phải cùng khổ — dựng bằng ' +
    'G.veThiGiacBo() thì khổ đã khoá sẵn.');

  const tongDoi = anh.length * giay - (anh.length - 1) * CHONG;
  const am = docLoi(o.loi, anh, giay);
  if (o.nhac) {
    if (!fs.existsSync(o.nhac)) throw new Error('Không có tệp nhạc: ' + o.nhac);
    const dn = daiAm(o.nhac);
    if (dn < tongDoi - 0.05) throw new Error('Bản nhạc dài ' + dn.toFixed(1) +
      ' giây mà phim dài ' + tongDoi.toFixed(1) + ' — thiếu ' +
      (tongDoi - dn).toFixed(1) + '. Máy KHÔNG lặp nhạc cho đủ: một bản ' +
      'nhạc lặp giữa câu thì nghe ra ngay, và nghe ra một mối nối là nghe ' +
      'ra rằng không ai chọn bản nhạc này cho đúng cuốn phim này.');
  }

  const tam = fs.mkdtempSync(path.join(path.dirname(raTep), 'phim-'));
  try {
    const ds = anh.map(function (f, i) {
      const ra = path.join(tam, 'c' + String(i).padStart(3, '0') + '.mp4');
      veCanh(path.join(thuMuc, f), ra, giay, i % 2 === 0, kg);
      return {tep: ra, giay: giay};
    });
    const cam = path.join(tam, 'cam.mp4');
    const tong = noiCanh(ds, cam, kieu);
    const coTieng = tronTieng(cam, raTep, tong, am, o.nhac || null);
    const kb = Math.round(fs.statSync(raTep).size / 1024);
    return {soCanh: ds.length, giay: Math.round(tong * 10) / 10, kb: kb,
            w: kg.w, h: kg.h, chuyen: kieuTen, soLoi: am.length,
            coNhac: !!o.nhac, coTieng: coTieng};
  } finally {
    fs.rmSync(tam, {recursive: true, force: true});
  }
}

module.exports = {dungPhim, coAnh, daiAm, coFfmpeg, CHUYEN,
                  FPS, CHONG, GIAY_MOI_CANH, NHAC_TO, NHAC_TAT};

if (require.main === module) {
  const dv = process.argv.slice(2);
  const co = {};
  const thuong = dv.filter(function (a) {
    const m = /^--([a-z]+)=(.*)$/.exec(a);
    if (m) { co[m[1]] = m[2]; return false; }
    return true;
  });
  if (thuong.length < 2) {
    console.log('Dùng: node tools/dung-phim.js <thư mục ảnh> <ra.mp4> ' +
      '[giây/cảnh] [--chuyen=kiểu] [--loi=<thư mục>] [--nhac=<tệp>]');
    console.log('\nKiểu chuyển cảnh:');
    Object.keys(CHUYEN).forEach(function (k) {
      console.log('  ' + k.padEnd(9) + CHUYEN[k].ten); });
    process.exit(2);
  }
  const r = dungPhim(thuong[0], thuong[1],
    {giay: thuong[2], chuyen: co.chuyen, loi: co.loi, nhac: co.nhac});
  console.log('✓ ' + thuong[1] + ' · ' + r.soCanh + ' cảnh · ' + r.giay +
    ' giây · ' + r.w + '×' + r.h + ' · ' + r.kb + ' KB · chuyển ' + r.chuyen +
    (r.soLoi ? ' · ' + r.soLoi + ' lời đọc' : '') +
    (r.coNhac ? ' · có nhạc' : ''));
}
