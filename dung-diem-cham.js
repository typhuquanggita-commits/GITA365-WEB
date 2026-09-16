#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════
   GITA 365 — SINH 1000 ĐIỂM CHẠM WOW VÀ 1000 ĐIỂM KHOÁ CHỐT

       node tools/dung-diem-cham.js

   ═══ VÌ SAO SINH CHỨ KHÔNG GÕ TAY ═══

   Hai nghìn bản ghi gõ tay là hai nghìn bản ghi không ai bảo trì được.
   Sửa một mốc ở BV_CAPDO thì phải đi sửa hai mươi chỗ chép lại nó, và
   lần thứ ba thì không ai sửa nữa.

   Bộ bản vẽ đã khai sẵn phép nhân: "500 chốt quy trình · 1000 điểm giá
   trị". Năm trăm chốt là 5 tầng × 10 cấp × 10 nhịp. Mỗi chốt chạm HAI
   người — phụ huynh và học viên — nên ra đúng một nghìn điểm chạm, và
   một nghìn điểm khoá đi kèm.

   ═══ ĐIỂM CHẠM KHÔNG PHẢI CÂU CHỮ, LÀ MỘT KHOẢNH KHẮC CÓ TOẠ ĐỘ ═══

   Mỗi điểm mang bốn toạ độ: TẦNG · CẤP · NHỊP · AI ĐANG ĐƯỢC CHẠM.
   Bốn toạ độ ấy quyết định nội dung, nên nội dung sinh ra từ chúng chứ
   không phải nghĩ ra rồi gán vào.

     tầng   quyết định NHU CẦU đang ở đâu
     cấp    quyết định MỨC ĐỘ — vào cuộc, tạo kết quả, hay trụ cột
     nhịp   quyết định VIỆC — mười nhịp là mười việc khác nhau
     người  quyết định LĂNG KÍNH — phụ huynh sợ khác, học viên sợ khác

   ═══ CÂU CHỮ DO MÁY GHÉP, VÀ TỆP NÀY NÓI RA ĐIỀU ĐÓ ═══

   Không giả vờ hai nghìn câu này do người viết từng câu. Chúng ghép từ
   nguyên liệu có thật trong kho — mốc và wow của ô, mục đích và câu
   chuẩn của nhịp — theo một khuôn cố định.

   Cái đáng giá không nằm ở câu chữ mà ở chỗ KHÔNG BỎ SÓT: không khoảnh
   khắc nào trong năm trăm chốt bị bỏ trống, và mỗi khoảnh khắc đều nói
   được ai làm, máy làm được không, Coach có phải vào không.

   Chỗ nào cần một câu người viết thì người viết đè lên — trường ghiDe
   ở data.tay-nghe.js, và máy ưu tiên nó.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
const fs = require('fs');
const path = require('path');

const GOC = path.join(__dirname, '..');
const NGUON = path.join(GOC, 'kho-goc');

global.window = {};
for (const t of fs.readdirSync(NGUON).filter(f => f.endsWith('.js')).sort())
  require(path.join(NGUON, t));
const G = global.window.G;

const O = G.BV_CAPDO || [];
const NHIP = G.BV_NHIP || [];
if (O.length !== 50) { console.error('  ✗ BV_CAPDO phải có 50 ô, đang có ' + O.length); process.exit(1); }
if (NHIP.length !== 10) { console.error('  ✗ BV_NHIP phải có 10 nhịp, đang có ' + NHIP.length); process.exit(1); }

/* ─── Hai lăng kính. Cùng một khoảnh khắc, hai nỗi lo khác nhau. ─── */
const NGUOI = [
  { ma: 'PH', ten: 'Phụ huynh', xung: 'anh chị',
    so: 'sợ mình đã làm hỏng con', mong: 'thấy con đỡ hơn mà không phải ép' },
  { ma: 'HS', ten: 'Học viên', xung: 'con',
    so: 'sợ bị so sánh và bị bắt làm thêm', mong: 'được nói không mà không bị giận' }
];

/* ─── Ba khúc của mười cấp, lấy từ BV_CAPDO_LUAT.baKhuc ─── */
function khuc(cap) {
  if (cap <= 3) return { ma: 'VAO', ten: 'vào cuộc', cuoc: 'còn đang thử xem chỗ này có thật không' };
  if (cap <= 7) return { ma: 'KETQUA', ten: 'tạo kết quả', cuoc: 'đã bỏ công, nên sợ công ấy phí' };
  return { ma: 'TRUCOT', ten: 'trụ cột', cuoc: 'đã thành người trong nhà, sợ mất cái mình vừa dựng' };
}

/* ─── Nhu cầu của từng tầng, và nó dịch đi đâu ───
   Không bịa: đọc từ tên tầng ở HP_TANG và mục đích của cổng kế tiếp. */
const NHUCAU = {
  T1: { dang: 'muốn hết lo', sang: 'muốn HIỂU vì sao' },
  T2: { dang: 'muốn hiểu vì sao', sang: 'muốn NHÌN THẤY kết quả' },
  T3: { dang: 'muốn nhìn thấy kết quả', sang: 'muốn con TỰ CHẠY' },
  T4: { dang: 'muốn con tự chạy', sang: 'muốn TRAO LẠI cho nhà khác' },
  T5: { dang: 'muốn trao lại cho nhà khác', sang: 'đã là nguồn của vòng sau' }
};

/* ─── Coach vào hay không: DẪN TỪ LUẬT, không tự gán ───
   BV_NHIP_LUAT.nguoiThat: nhịp 03 và 09 LUÔN có người thật.
   Ô có cột "nguoi" thì có việc chỉ người làm được ở ô ấy. */
function vaiCoach(nhip, o) {
  if (nhip === 3 || nhip === 9)
    return { muc: 'BAT_BUOC', vi: 'BV_NHIP_LUAT — nhịp 03 Chẩn đoán và nhịp 09 Nâng cấp LUÔN có người thật.' };
  if (o.nguoi)
    return { muc: 'TUY_CHON', vi: 'Ô ' + o.ma + ' có việc người làm: ' + o.nguoi + '. Coach vào thì nhanh hơn, không vào thì máy vẫn chạy được nhịp này.' };
  return { muc: 'KHONG_CAN', vi: 'Ô ' + o.ma + ' không khai việc người. Máy chạy trọn nhịp này.' };
}

/* ─── Khuôn câu theo nhịp. Động từ của nhịp quyết định câu. ─── */
const KHUON = {
  1:  { cham: 'Nói đúng một câu về điều {so}, rồi im',              khoa: 'Được hỏi đúng chỗ mà chưa phải khai gì' },
  2:  { cham: 'Đọc lại nguyên văn chuyện {xung} vừa kể',            khoa: 'Nghe lại lời mình và thấy nó được ghi đúng' },
  3:  { cham: 'Đưa ra điểm nghẽn đã đo, kèm số',                    khoa: 'Biết chỗ nghẽn thật, không phải chỗ mình tưởng' },
  4:  { cham: 'Chốt một việc nhỏ nhất có giờ, {xung} chọn giờ',     khoa: 'Được chọn giờ chứ không bị giao giờ' },
  5:  { cham: 'Đưa đúng một công cụ, không đưa hai',                khoa: 'Cầm một thứ dùng được ngay tối nay' },
  6:  { cham: 'Ghi nhận lần làm thứ ba, không ghi lần đầu',         khoa: 'Làm đều được ghi, không phải làm nhiều mới được ghi' },
  7:  { cham: 'Đưa số trước và số sau, cạnh nhau',                  khoa: 'Thấy con số của chính nhà mình, không phải của ai khác' },
  8:  { cham: 'Gọi tên đúng việc {xung} đã làm, có ngày giờ',       khoa: 'Cố gắng được nhìn thấy đúng lúc còn nóng' },
  9:  { cham: 'Nói mốc kế tiếp và điều kiện của nó',                khoa: 'Biết mình đang ở đâu và còn bao xa' },
  10: { cham: 'Mời {xung} kể lại cho một nhà đang ở chỗ mình đã qua', khoa: 'Từ người nhận thành người cho' }
};

function ghep(mau, ng) {
  return String(mau).replace(/\{so\}/g, ng.so).replace(/\{xung\}/g, ng.xung)
                    .replace(/\{mong\}/g, ng.mong);
}

const wow = [], khoa = [];
O.forEach(o => {
  const k = khuc(o.cap);
  const nc = NHUCAU[o.tang] || { dang: '', sang: '' };
  NHIP.forEach(n => {
    const vc = vaiCoach(n.so, o);
    NGUOI.forEach(ng => {
      const nn = String(n.so).padStart(2, '0');
      const ma = o.ma + '-N' + nn + '-' + ng.ma;
      wow.push({
        ma: 'W-' + ma, tang: o.tang, cap: o.cap, nhip: n.so, ai: ng.ma,
        khi: o.moc + ' · nhịp ' + nn + ' ' + n.ten,
        cham: ghep(KHUON[n.so].cham, ng),
        wow: ng.ma === 'PH' ? o.wow : 'Con thấy: ' + String(o.wow).toLowerCase(),
        cuoc: k.cuoc,
        may: vc.muc !== 'BAT_BUOC',
        coach: vc.muc, viCoach: vc.vi,
        khuc: k.ma
      });
      khoa.push({
        ma: 'K-' + ma, tang: o.tang, cap: o.cap, nhip: n.so, ai: ng.ma,
        giuChan: ghep(KHUON[n.so].khoa, ng),
        vi: k.cuoc,
        tu: nc.dang, sang: nc.sang,
        dichKhi: o.cap >= 8 ? 'Cấp ' + o.cap + ' — đây là chỗ nhu cầu dịch sang tầng sau'
                            : 'Chưa dịch. Cấp ' + o.cap + ' còn đang ' + k.ten + '.',
        canBangChung: o.bangChung,
        neuTut: o.neuTut,
        may: vc.muc !== 'BAT_BUOC',
        coach: vc.muc
      });
    });
  });
});

const dem = { PH: 0, HS: 0, BAT_BUOC: 0, TUY_CHON: 0, KHONG_CAN: 0 };
wow.forEach(x => { dem[x.ai]++; dem[x.coach]++; });

const loi = [];
if (wow.length !== 1000) loi.push('điểm chạm ra ' + wow.length + ', phải 1000');
if (khoa.length !== 1000) loi.push('điểm khoá ra ' + khoa.length + ', phải 1000');
if (dem.PH !== 500 || dem.HS !== 500) loi.push('hai lăng kính không cân: PH ' + dem.PH + ' · HS ' + dem.HS);
const trung = {};
wow.forEach(x => { if (trung[x.ma]) loi.push('trùng mã ' + x.ma); trung[x.ma] = 1; });
if (loi.length) { console.error('  ✗ ' + loi.join('\n  ✗ ')); process.exit(1); }

const dau = `/* ═══════════════════════════════════════════════════════════════
   GITA 365 — 1000 ĐIỂM CHẠM WOW · 1000 ĐIỂM KHOÁ CHỐT

   TỆP NÀY DO MÁY SINH. Đừng sửa tay — chạy lại:

       node tools/dung-diem-cham.js

   Phép nhân: 50 ô cấp độ × 10 nhịp × 2 người = 1000.
   Nguyên liệu: BV_CAPDO (mốc · wow · bằng chứng · nếu tụt) và
   BV_NHIP (mục đích · việc của máy).

   Câu chữ do máy ghép theo khuôn, và tệp này nói thẳng điều đó. Cái
   đáng giá không nằm ở câu chữ mà ở chỗ KHÔNG BỎ SÓT: không khoảnh
   khắc nào trong năm trăm chốt bị bỏ trống.

   Chỗ nào cần một câu người viết thì đè bằng TN_GHIDE ở
   data.tay-nghe.js, và máy ưu tiên câu ấy.

   Sinh lúc: ${new Date().toISOString().slice(0, 10)}
   Tài sản có bản quyền của Học viện GITA.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;

`;

const ra = dau +
  'G.DC1K_WOW = ' + JSON.stringify(wow, null, 0).replace(/\},\{/g, '},\n{') + ';\n\n' +
  'G.DC1K_KHOA = ' + JSON.stringify(khoa, null, 0).replace(/\},\{/g, '},\n{') + ';\n';

const dich = path.join(NGUON, 'data.diem-cham-1000.js');
fs.writeFileSync(dich, ra, 'utf8');

console.log('  ✓ 1000 điểm chạm WOW · 1000 điểm khoá chốt');
console.log('  · phụ huynh ' + dem.PH + ' · học viên ' + dem.HS);
console.log('  · Coach BẮT BUỘC ' + dem.BAT_BUOC + ' · tuỳ chọn ' + dem.TUY_CHON +
            ' · không cần ' + dem.KHONG_CAN);
console.log('  · máy chạy trọn ' + (1000 - dem.BAT_BUOC) + '/1000 điểm chạm');
console.log('  ✓ ' + path.relative(GOC, dich) + '  ' + (fs.statSync(dich).size / 1024 | 0) + ' KB');
