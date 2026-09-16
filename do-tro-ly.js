/* ═══════════════════════════════════════════════════════════════
   GITA 365 — ĐO TRỢ LÝ
   Chạy: xvfb-run -a node tools/do-tro-ly.js

   ĐO ĐỘ TRÚNG, KHÔNG ĐO ĐỘ CÓ TRẢ VỀ

   Bộ đo đầu tiên tôi viết đếm "trợ lý có trả về gì không" và ra
   20/20 = 100%. Con số ấy lừa: trợ lý LUÔN trả về mười hai tư liệu,
   vì chấm điểm theo từ khoá thì kho nào cũng có thứ gần giống.

   Nên bộ này khai với mỗi câu hỏi một KHO ĐÁNG LẼ PHẢI RA, và đếm
   xem kho ấy có nằm trong ba kết quả đầu không. Đo lần đầu: 1/20.

   Sau khi mở kho, khớp trọn tiếng và chấm theo độ hiếm: 10/20.

   9.73 — CHỈ MỤC TỰ DÒ. Trợ lý thôi tra 30 kho khai tay mà dò lấy
   toàn bộ kho vai ấy được cấp: 833 kho · 18.140 bản ghi. Bộ đo mở
   từ 20 lên 40 câu, hai mươi câu thêm nhắm đúng phần vừa mở ra.

     20 câu cũ, chỉ mục cũ  : 10/20
     20 câu cũ, chỉ mục mới : 17/20
     40 câu, chỉ mục mới    : 28/40

   Mốc đặt lại theo số đo được, không theo số mong muốn.

   VÌ SAO KHÔNG ĐẶT ĐÍCH 20/20

   Một bộ đo mà đạt điểm tuyệt đối thường là bộ đo đã được viết vừa
   khít với lời giải. Đích ở đây là KHÔNG TỤT: bản sau phải trúng
   bằng hoặc hơn bản trước, và ngày nào tụt thì phải biết ngay là
   tụt vì đâu.
   ═══════════════════════════════════════════════════════════════ */
const { chromium } = require(process.env.PW_PATH || '/opt/node22/lib/node_modules/playwright');
const fs = require('fs');
const pathGoc = require('path');
const doiKhoXong = require('./doi-kho-xong');
/* Mỗi câu khai KHO ĐÁNG LẼ PHẢI TRÚNG. */
const HOI = [
  ['Coach một người phụ trách tối đa mấy nhà', 'BV_VAI'],
  ['Bàn làm việc của Coach có mấy ngăn', 'BLV'],
  ['Trần hoa hồng của đại sứ là bao nhiêu', 'HOAHONG'],
  ['Ký hợp đồng lao động thì dùng cấp chữ ký nào', 'HSH_KY'],
  ['Có bao nhiêu hợp đồng trong bộ hồ sơ', 'HSH_HD'],
  ['Điều khoản DK16 nói gì', 'HSH_DK'],
  ['Khách hàng xin xoá dữ liệu thì làm thế nào', 'PL_CO'],
  ['Bảy quyền của gia đình gồm những gì', 'PL_QUYEN'],
  ['Máy không được nhận những việc gì', 'TDH_CHAN'],
  ['Trần thông báo mỗi ngày là bao nhiêu', 'BTN_TRAN'],
  ['Ai đọc được bảng tin nội bộ', 'BTN_NGAN'],
  ['Super Admin mỗi ngày phải làm gì', 'STA_NHIP'],
  ['Mười tám virus của hành lang thành công', 'HL_VIRUS'],
  ['Sáu Nhịp gồm những nhịp nào', 'HL_SAUNHIP'],
  ['Chuẩn bằng chứng có mấy tính chất', 'BCD_TINHCHAT'],
  ['Bảy cửa trước khi ký kết là gì', 'KK_CUA'],
  ['Phụ huynh nói con tôi lười học thì trả lời sao', 'TINHHUONG'],
  ['Nhà mình không có thời gian thì làm thế nào', 'TINHHUONG'],
  ['Phác đồ cho trẻ mất tập trung', 'PHACDO'],
  ['Mô thức về dòng thời gian', 'MOTHUC'],

  /* ── HAI MƯƠI CÂU THÊM Ở 9.73 ──
     Hai mươi câu đầu viết khi trợ lý tra được 30 kho. Nay nó tra 833
     kho, nên bộ đo cũ đo một góc quá hẹp: đạt cao trên đó không nói
     được gì về phần vừa mở ra.

     Hai mươi câu này nhắm vào kho TRƯỚC ĐÂY KHÔNG TRA ĐƯỢC. Viết
     trước khi chạy, không sửa sau khi thấy kết quả — bộ đo mà chỉnh
     theo lời giải thì chỉ còn đo chính nó. */
  ['Khiếu nại của khách đi theo mấy bước', 'NAM_BUOC_KHIEUNAI'],
  ['Mười hai nguyên tắc gồm những gì', 'MUOIHAI_NGUYENTAC'],
  ['Tầm nhìn của Học viện là gì', 'TAM_NHIN'],
  ['Học phí từng tầng bao nhiêu', 'HP_TANG'],
  ['Huy hiệu có những loại nào', 'HUYHIEU'],
  ['Chín khoá bất biến của hành lang', 'HL_KHOA9'],
  ['Mười hai luật hành lang thành công', 'HL_LUAT12'],
  ['Đại sứ có mấy bậc hoa hồng', 'HH_BAC'],
  ['Sổ tay quản trị có mấy nhóm màn', 'STA_NHOM'],
  ['Bảng vinh danh xét theo tiêu chí nào', 'BTN_VINHDANH'],
  ['Văn bản pháp lý cần soạn gồm những gì', 'RSP_VB'],
  ['Luật mới về dữ liệu cá nhân hiệu lực khi nào', 'RSP_LUATMOI'],
  ['Thao tác nào sinh ra bằng chứng', 'BCD_THAOTAC'],
  ['Cây quyết định chọn hợp đồng nào', 'KK_CHON'],
  ['Việc nào máy đã làm được rồi', 'TDH_HE'],
  ['Chín bậc thu nhập của nhân sự', 'HSH_BAC'],
  ['Nghi lễ trong nhà gồm những nghi lễ nào', 'NGHILE'],
  ['Bản đồ cá nhân có mấy nhịp', 'BDCN_NHIP'],
  ['Trò chơi hành trình quy đổi điểm thế nào', 'TG_QUYDOI'],
  ['Ngôn từ nào bị cấm khi nói với phụ huynh', 'NGONTU_RANH'],
];
(async () => {
  const khoa = JSON.parse(fs.readFileSync('/home/user/Quang-GITA/kho/khoa.json','utf8')).khoa;
  const b = await chromium.launch();
  const p = await b.newPage();
  await p.addInitScript(x => { window.GITA_KHOA = x; }, khoa);
  await p.goto('http://127.0.0.1:8099/index.html');
  await p.waitForFunction(() => window.G && window.G.doLogin, null, {timeout:30000});
  await p.evaluate(() => G.doLogin('coach@gita365.vn'));
  await p.waitForFunction(() => typeof window.G.aiTra === 'function', null, {timeout:40000});
  /* Đợi KHO XONG HẲN, không đợi một cái tên — xem tools/doi-kho-xong.js.
     Chính bộ đo này ra 28/40 khi chạy riêng và 27/40 khi chạy trong đường
     phát hành, chỉ vì đo sớm mất một gói; mốc chặn đúng bằng 28 nên đường
     phát hành dừng ở một chỗ không hỏng. */
  console.log('  (kho đã mở ' + (await doiKhoXong(p)) + ' gói)');
  const r = await p.evaluate((HOI) => HOI.map(function(h){
    var kq = G.aiTra(h[0]) || [];
    /* Trúng = kho đáng lẽ phải ra nằm trong 3 kết quả đầu */
    var top3 = kq.slice(0,3).map(function(x){ return (x.khoNguon||'') + '|' + x.loai + '|' + x.ma; });
    var trung = top3.some(function(s){ return s.indexOf(h[1]) >= 0; });
    /* HAI CON SỐ, VÀ CON SỐ THỨ HAI KHÔNG THAY CON SỐ THỨ NHẤT.

       TRÚNG đo kho cần tìm có lên được BA CHỖ ĐẦU không — đó là thứ
       người dùng thật sự đọc, và nó vẫn là điều kiện đạt.

       CÓ MẶT đo kho ấy có lọt vào danh sách không, dù ở hạng mấy.
       Dựng ở 9.99.7 để nhìn được phần cải thiện mà con số đầu không
       thấy: bỏ trần mỗi kho thì HP_TANG và TINHHUONG không có mặt
       trong cả mười hai kết quả; đặt trần thì chúng vào được, ở hạng
       tám và mười hai. Đó là chuyện khác hẳn "vẫn trượt như cũ" —
       một kho đã vào danh sách thì một lượt chỉnh cách chấm còn kéo
       nó lên được, còn một kho không có mặt thì không.

       Nới con số đầu ra thành "có mặt là đạt" mới là tự lừa mình; nêu
       riêng hai con số thì không. */
    var hang = -1;
    for (var i = 0; i < kq.length; i++)
      if (String(kq[i].khoNguon||'') === h[1]) { hang = i + 1; break; }
    return { hoi: h[0], can: h[1], so: kq.length, trung: trung, hang: hang,
      dau: kq.length ? (kq[0].loai + ' · ' + String(kq[0].ten).slice(0,40)) : '(trống)' };
  }), HOI);
  let t = 0, coMat = 0;
  r.forEach(x => { if (x.trung) t++; if (x.hang > 0) coMat++; });
  r.forEach(x => console.log((x.trung ? ' ✓ ' : ' ✗ ') + x.hoi +
    '\n     cần ' + x.can + ' · nhận ' + x.dau +
    (x.trung ? '' : (x.hang > 0 ? ' · (kho cần tìm ở hạng ' + x.hang + ')'
                                : ' · (kho cần tìm KHÔNG có mặt)'))));
  const ti = Math.round(t/r.length*100);
  console.log('\nTRÚNG ' + t + '/' + r.length + ' = ' + ti + '%' +
    '   ·   CÓ MẶT ' + coMat + '/' + r.length +
    ' = ' + Math.round(coMat/r.length*100) + '%');

  /* ══ MỐC KHÔNG ĐƯỢC TỤT — VÀ MỐC PHẢI TỰ NÂNG ══

     Tụt xuống dưới mốc là có người vừa làm hỏng phần tra kho, và lớp
     hỏng ấy im lặng: trợ lý vẫn trả lời, chỉ là trả lời sai.

     Tới 9.99.5 mốc là một con số GÕ CỨNG trong tệp này, đặt bằng số đo
     được hôm dựng bộ. Nó chặn được lượt tụt về dưới 28, nhưng nó không
     chặn được lớp tụt nguy hiểm hơn: ai đó cải thiện phần tra kho lên
     34, rồi ba tháng sau một lượt sửa khác kéo về 28 — và bộ đo nói
     "không tụt", vì nó vẫn đang so với 28.

     Nghĩa là mỗi lần cải thiện đều tự nguyện vứt đi phần bảo vệ mà
     chính nó vừa tạo ra. Cái bẫy ở chỗ nó không đòi ai làm gì sai cả:
     người cải thiện chỉ cần QUÊN nâng một con số trong một tệp khác.

     Nên mốc ra khỏi mã và vào một tệp riêng mà bộ đo TỰ GHI khi số đo
     tốt lên. Ghi tự động chứ không nhắc người nâng, vì một lời nhắc là
     một việc người ta phải nhớ; còn tệp mốc đổi thì nó nằm trong lượt
     duyệt mã, ai cũng thấy. */
  const duongMoc = pathGoc.join(__dirname, 'moc-tro-ly.json');
  let moc = {trung: 28, tong: 40, luc: '', vi: 'Mốc gõ cứng trước 9.99.6'};
  try { moc = JSON.parse(fs.readFileSync(duongMoc, 'utf8')); } catch (e) {}

  /* Số câu hỏi đổi thì mốc CŨ không so được nữa — so 28 câu trúng trên
     40 với 28 trên 50 là so hai thứ khác nhau. Đổi bộ câu hỏi thì mốc
     đặt lại theo tỷ lệ, và nói ra là đã đặt lại. */
  if (Number(moc.tong) !== r.length) {
    const cu = moc.trung + '/' + moc.tong;
    moc = {trung: Math.round(Number(moc.trung) / Number(moc.tong) * r.length),
      tong: r.length, luc: moc.luc,
      vi: 'Bộ câu hỏi đổi từ ' + moc.tong + ' lên ' + r.length + ' câu — mốc quy theo tỷ lệ từ ' + cu};
    console.log('  (bộ câu hỏi đổi cỡ — mốc quy lại thành ' + moc.trung + '/' + r.length + ')');
  }

  if (t < moc.trung) {
    console.log('✗ TỤT so với mốc ' + moc.trung + '/' + moc.tong +
      ' — phần tra kho vừa hỏng ở đâu đó');
    if (moc.luc) console.log('  (mốc ấy đạt được lúc ' + moc.luc + ')');
    await b.close(); process.exit(1);
  }

  /* CÓ MẶT cũng có mốc riêng, và cũng không được tụt. Không có mốc thì
     một lượt sửa kéo kho cần tìm ra khỏi danh sách vẫn đi qua, miễn là
     ba chỗ đầu không đổi — mà ra khỏi danh sách là chỗ khó cứu hơn. */
  const mocCoMat = Number(moc.coMat || 0);
  if (coMat < mocCoMat) {
    console.log('✗ TỤT phần CÓ MẶT: ' + coMat + '/' + r.length + ' so với mốc ' +
      mocCoMat + ' — kho cần tìm vừa bị đẩy ra khỏi danh sách ở đâu đó');
    await b.close(); process.exit(1);
  }

  if (t > moc.trung || coMat > mocCoMat) {
    const cu = moc.trung + '/' + mocCoMat;
    moc = {trung: Math.max(t, moc.trung), coMat: Math.max(coMat, mocCoMat),
      tong: r.length, luc: new Date().toISOString().slice(0, 16),
      vi: 'Bộ đo tự nâng khi số đo tốt lên — nâng từ ' + cu};
    fs.writeFileSync(duongMoc, JSON.stringify(moc, null, 2) + '\n');
    console.log('✓ TỐT LÊN ' + cu + ' → ' + t + '/' + coMat +
      ' — đã nâng mốc trong tools/moc-tro-ly.json, nhớ đẩy tệp ấy lên cùng lượt sửa');
  } else {
    console.log('✓ Không tụt — trúng ' + moc.trung + '/' + moc.tong +
      ' · có mặt ' + mocCoMat + '/' + moc.tong);
  }
  await b.close();
})();
