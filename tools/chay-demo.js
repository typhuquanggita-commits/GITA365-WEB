#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════
   GITA 365 — CHẠY DEMO TẠI CHỖ

       node tools/chay-demo.js            (giữ máy chủ chạy, cổng 8098)
       node tools/chay-demo.js --im       (không in nhật ký từng lượt gọi)

   Dựng MỘT máy chủ thật ở cổng 8098, rồi mở bản web ở 8099 trỏ vào nó.

   ══ VÌ SAO CẦN CÁI NÀY ══

   Bản web không có máy chủ thì chạy CHẾ ĐỘ MẪU: xem được giao diện,
   kho chuyên môn khoá, và mọi màn gọi máy chủ — phòng tài chính, bảng
   tin, trợ lý, bảng lương — chỉ hiện đúng một câu "chưa nối máy chủ".
   Nghĩa là thứ đáng xem nhất lại là thứ không xem được.

   ══ VÀ VÌ SAO NÓ DÙNG worker.js THẬT, KHÔNG DỰNG BẢN GIẢ ══

   Một máy chủ giả cho demo là một máy chủ sẽ trả lời khác bản thật ở
   đúng những chỗ khó, và demo xanh trong khi sản phẩm đỏ. Tệp này nạp
   thẳng may-chu/worker.js, chạy trên node:sqlite — cùng cỗ máy cơ sở
   dữ liệu mà D1 chạy — y như tools/thu-worker.js đã làm từ 9.9x.

   Khác bản thật đúng ba chỗ, và cả ba đều nói ra:
     · cơ sở dữ liệu nằm trong bộ nhớ, tắt là mất
     · thư không gửi đi đâu, chỉ in ra màn hình
     · khoá kho đọc từ kho/khoa.json của máy này

   ══ DỮ LIỆU MẪU ══

   Đủ để mọi màn có cái để vẽ: bốn vị trí phòng tài chính, vài phiếu
   thu, vài khoản chi ở các nấc khác nhau, một dòng sao kê không khớp
   được phiếu nào (để bảng tin có tin máy tự đăng).
   ═══════════════════════════════════════════════════════════════ */
'use strict';
const fs = require('fs');
const path = require('path');
const http = require('http');
const { DatabaseSync } = require('node:sqlite');

const GOC = path.join(__dirname, '..');
const CONG = Number(process.env.CONG_DEMO || 8098);
const IM = process.argv.includes('--im');

function dungD1(db) {
  return {
    prepare(sql) {
      let dv = [];
      const o = {
        bind(...a) { dv = a; return o; },
        async first() { return db.prepare(sql).get(...dv) ?? null; },
        async all()   { return {results: db.prepare(sql).all(...dv)}; },
        async run()   {
          const r = db.prepare(sql).run(...dv);
          return {meta: {changes: Number(r.changes || 0)}};
        }
      };
      return o;
    }
  };
}
function dungR2() {
  const tep = new Map();
  return {
    async get(k) {
      if (!tep.has(k)) return null;
      const b = tep.get(k);
      return {async text() { return b; }, async arrayBuffer() { return Buffer.from(b); }};
    },
    async put(k, v) { tep.set(k, Buffer.isBuffer(v) ? v.toString('utf8') : String(v)); },
    async delete(k) { tep.delete(k); }
  };
}

(async () => {
  const db = new DatabaseSync(':memory:');
  db.exec(fs.readFileSync(path.join(GOC, 'may-chu/csdl.sql'), 'utf8'));

  const worker = (await import('../may-chu/worker.js')).default;
  const nen = await import('../may-chu/nen.js');

  /* KHOÁ KHO THẬT của máy này. Không có thì demo vẫn chạy nhưng kho
     chuyên môn khoá — nói ra chứ không để người xem tự đoán vì sao
     màn nào cũng trống. */
  let khoaKho = null;
  try {
    khoaKho = JSON.parse(fs.readFileSync(path.join(GOC, 'kho/khoa.json'), 'utf8')).khoa;
  } catch (e) { khoaKho = null; }

  const hopThu = [];
  const env = {
    CSDL: dungD1(db),
    HOSO: dungR2(),
    GHI_THU: hopThu,
    GITA_DIA_CHI_WEB: 'http://127.0.0.1:8099',
    GITA_TIEU: 'tieu-demo-tai-cho-khong-dung-that',
    GITA_KHOA_KY: 'khoa-ky-demo-khong-dung-that',
    GITA_KHOA_THU: 'khoa-thu-demo',
    GITA_KHOA_NGANHANG: 'khoa-ngan-hang-demo',
    GITA_THU_DOANH_THU: 'chuhe@vidu.vn',
    /* Cửa đi ra bộ tạo ảnh: TẮT SẴN, đúng như máy chủ thật — không nạp
       thì cổng trả về CUADONG. Bật bằng CUA_VE=1 khi cần xem đề bài đi
       ra trông thế nào. Giá trị là giả và bản demo KHÔNG gọi ra ngoài:
       guiDeBaiRaNgoai dựng đề bài rồi ghi sổ, không mở một lượt mạng
       nào. Nên đây là chỗ đọc đề bài, không phải chỗ sinh ảnh. */
    ...(process.env.CUA_VE ? {
      GITA_KHOA_VE: 'khoa-ve-demo-khong-dung-that',
      GITA_CONG_VE: 'demo://doc-de-bai-tai-cho'} : {}),
    GITA_KHOA_KHO: JSON.stringify(khoaKho || {
      nen: 'k', nghe: 'k', 'nghe-cao': 'k',
      tang1: 'k', tang2: 'k', tang3: 'k', tang4: 'k', tang5: 'k'})
  };

  const MK = 'MatKhauRieng2026!';
  async function nguoi(id, u, role, portal) {
    const muoi = nen.muoiMoi();
    db.prepare('INSERT INTO users (id,username,hoTen,email,role,portal,pwSalt,pwHash,' +
      'active,createdAt,mustChangePw) VALUES (?,?,?,?,?,?,?,?,1,?,0)').run(
      id, u, 'Người ' + id, u, role, portal || 'ph', muoi,
      await nen.bamMoi(MK, muoi, env.GITA_TIEU), new Date().toISOString());
  }

  const goi = async y => {
    const r = await worker.fetch(new Request('http://demo/', {
      method: 'POST', headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(y)}), env);
    return await r.json();
  };

  /* ─── Tài khoản ─── */
  await nguoi('U-sa', 'superadmin@gita365.vn', 'R01', 'admin');
  await nguoi('U-gd', 'giamdoc@gita365.vn', 'R03', 'admin');
  await nguoi('U-ktt', 'ketoantruong@gita365.vn', 'R04', 'coach');
  await nguoi('U-ktt2', 'ketoanthu@gita365.vn', 'R08', 'coach');
  await nguoi('U-ktc', 'ketoanchi@gita365.vn', 'R08', 'coach');
  await nguoi('U-tc', 'truongcoach@gita365.vn', 'R05', 'coach');
  await nguoi('U-ph', 'phuhuynh@gita365.vn', 'R13', 'ph');
  db.prepare('INSERT INTO students (id,hoTen,tier,phuHuynhId,createdAt) VALUES (?,?,?,?,?)')
    .run('HV-1', 'Con nhà A', 3, 'U-ph', new Date().toISOString());

  const tkSA = (await goi({fn: 'dangNhap', u: 'superadmin@gita365.vn', mk: MK})).token;
  const nhu = (u, t) => ({token: t, u});

  /* ─── Vị trí phòng tài chính ─── */
  for (const [u, cn, moc] of [
    ['ketoantruong@gita365.vn', 'keToanTruong', 'C4'],
    ['ketoanthu@gita365.vn', 'keToanThu', null],
    ['ketoanchi@gita365.vn', 'keToanChi', null]])
    await goi({fn: 'capQuyenTaiChinh', ...nhu('superadmin@gita365.vn', tkSA),
      username: u, chucNang: cn, mocToiDa: moc || undefined,
      lyDo: 'Dựng dữ liệu mẫu cho bản chạy thử tại chỗ'});

  /* ─── Ba nhà, ba tầng ───
     ghiPhieuThu đòi một hồ sơ khách có thật: không có nhà thì không có
     phiếu thu nào, và mọi màn tiền vào trống trơn. */
  const ngay = n => new Date(Date.now() - n * 86400000).toISOString();
  const NHA = [['GITA-D01', 3, 'U-ph'], ['GITA-D02', 1, 'U-ph'], ['GITA-D03', 4, 'U-ph']];
  for (const [ma, tang, uid] of NHA) {
    db.prepare("INSERT INTO hoSoKhach (maKhachHang,uidPhuHuynh,tang,coach,trangThai," +
      "vaoLuc,suaLuc) VALUES (?,?,?,'truongcoach@gita365.vn','dangHoc',?,?)")
      .run(ma, uid, tang, ngay(120), ngay(120));
    db.prepare("INSERT INTO kyThu (id,maKhachHang,tang,ky,soKy,ngayThu,phaiThu,hanLuc,taoLuc) " +
      "VALUES (?,?,?,1,3,1,?,?,?)").run('KT-' + ma, ma, tang,
      tang === 1 ? 500000 : tang === 3 ? 10000000 : 30000000, ngay(30), ngay(120));
  }
  for (const [ma, tien, ht, ref] of [
    ['GITA-D01', 10000000, 'chuyenKhoan', 'FT26D001'],
    ['GITA-D02', 500000, 'tienMat', ''],
    ['GITA-D03', 30000000, 'chuyenKhoan', 'FT26D003']])
    await goi({fn: 'ghiPhieuThu', ...nhu('superadmin@gita365.vn', tkSA),
      phieu: {maKhachHang: ma, soTien: tien, hinhThuc: ht,
        maThamChieu: ref || undefined}});

  /* Một dòng sao kê KHỚP, và một dòng KHÔNG khớp được phiếu nào —
     dòng thứ hai làm bảng tin có một tin do máy tự đăng. */
  await goi({fn: 'nganHangBao', khoa: env.GITA_KHOA_NGANHANG,
    giaoDich: {soTaiKhoan: '0011', maGiaoDich: 'FT26D001', huong: 'vao',
      soTien: 10000000, noiDung: 'GITA-D01 dong hoc phi'}});
  await goi({fn: 'nganHangBao', khoa: env.GITA_KHOA_NGANHANG,
    giaoDich: {soTaiKhoan: '0011', maGiaoDich: 'FT26LA99', huong: 'vao',
      soTien: 4200000, noiDung: 'chuyen tien khong ro noi dung'}});

  /* ─── Tiền ra, ở ba nấc khác nhau ─── */
  for (const [muc, tien, dg, hd] of [
    ['vanPhong', 900000, 'Mua giấy in và mực cho văn phòng', false],
    ['haTang', 4500000, 'Gia hạn tên miền và máy chủ một năm', false],
    ['tiepThi', 12000000, 'Chiến dịch tuyển sinh mùa thu', true]])
    await goi({fn: 'ghiChi', ...nhu('truongcoach@gita365.vn',
      (await goi({fn: 'dangNhap', u: 'truongcoach@gita365.vn', mk: MK})).token),
      chi: {khoanMuc: muc, soTien: tien, hinhThuc: 'chuyenKhoan', dienGiai: dg,
        ngayChi: ngay(3), coHoaDon: hd, maHoaDon: hd ? 'HD-D01' : undefined}});

  /* ─── Một tin người đăng trên bảng tin ─── */
  const tkKtt = (await goi({fn: 'dangNhap', u: 'ketoantruong@gita365.vn', mk: MK})).token;
  await goi({fn: 'dangTinTaiChinh', ...nhu('ketoantruong@gita365.vn', tkKtt),
    tin: {mucDo: 'cam', tieuDe: 'Hợp đồng thuê mặt bằng hết hạn cuối tháng',
      than: 'Chủ nhà đã nhắn hỏi có ký tiếp không. Cần trả lời trước ngày 25 để ' +
            'giữ giá cũ; sau ngày ấy họ báo tăng.',
      giaoCho: 'ketoanchi@gita365.vn',
      hanXuLy: new Date(Date.now() + 5 * 86400000).toISOString()}});

  const dem = t => db.prepare('SELECT count(*) c FROM ' + t).get().c;

  /* ═══════════════ MÁY CHỦ ═══════════════ */
  const may = http.createServer(async (rq, rs) => {
    let than = '';
    rq.on('data', c => than += c);
    rq.on('end', async () => {
      try {
        const r = await worker.fetch(new Request('http://demo' + rq.url, {
          method: rq.method,
          headers: {'Content-Type': 'application/json'},
          body: (rq.method === 'GET' || rq.method === 'OPTIONS') ? undefined : than
        }), env);
        const vb = await r.text();
        const h = {};
        r.headers.forEach((v, k) => { h[k] = v; });
        rs.writeHead(r.status, h);
        rs.end(vb);
        if (!IM && rq.method === 'POST') {
          let fn = '?'; try { fn = JSON.parse(than).fn; } catch (e) {}
          let ok = ''; try { ok = JSON.parse(vb).ok === false ? ' ✗' : ' ✓'; } catch (e) {}
          console.log('   ' + fn + ok);
        }
      } catch (e) {
        rs.writeHead(500, {'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'});
        rs.end(JSON.stringify({ok: false, error: String(e && e.message || e)}));
        console.error('   ✗ ' + String(e && e.stack || e).split('\n')[0]);
      }
    });
  });

  may.listen(CONG, '127.0.0.1', () => {
    console.log('\nMÁY CHỦ DEMO — worker.js THẬT trên node:sqlite');
    console.log('  Địa chỉ    : http://127.0.0.1:' + CONG + '/');
    console.log('  Bản web    : http://127.0.0.1:8099/index.html');
    console.log('  Khoá kho   : ' + (khoaKho ? 'đọc từ kho/khoa.json — kho mở thật'
      : 'KHÔNG có kho/khoa.json — kho sẽ khoá, chạy node tools/ma-hoa-kho.js trước'));
    console.log('  Dữ liệu    : ' + dem('users') + ' tài khoản · ' +
      dem('quyenTaiChinh') + ' vị trí tài chính · ' + dem('phieuThu') + ' phiếu thu · ' +
      dem('chiPhi') + ' khoản chi · ' + dem('giaoDichNganHang') + ' dòng sao kê · ' +
      dem('tinTaiChinh') + ' tin');
    console.log('\n  Đăng nhập  : superadmin@gita365.vn · ketoantruong@gita365.vn ·');
    console.log('               ketoanthu@ · ketoanchi@ · giamdoc@ · phuhuynh@');
    console.log('  Mật khẩu   : ' + MK);
    console.log('\n  KHÁC BẢN THẬT ĐÚNG BA CHỖ:');
    console.log('    · cơ sở dữ liệu nằm trong bộ nhớ — tắt là mất sạch');
    console.log('    · thư không gửi đi đâu, chỉ nằm trong bộ nhớ');
    console.log('    · khoá kho đọc từ máy này, không từ Cloudflare');
    console.log('\n  Ctrl-C để dừng.\n');
  });
})();
