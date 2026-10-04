/* Kiểm bộ nhân vật chuẩn được khóa (may-chu/nhan-vat-chuan.js) và bộ
   phân giải ảnh khóa trong phim-phan-tu.js — D1 giả lập bằng SQLite
   thật (node:sqlite), R2 giả lập bằng Map.
   Chạy: node tools/thu-nhan-vat-chuan.mjs */
import { DatabaseSync } from 'node:sqlite';
import { NHAN_VAT_CHUAN, ID_NHAN_VAT, nhanVatHopLe, loaiHatNV, giongNV } from '../may-chu/nhan-vat-chuan.js';
import { layRefNhanVat, maRefNhanVat } from '../may-chu/phim-phan-tu.js';
import { GIONG_VI } from '../may-chu/xuong-quay.js';

let dat = 0, hong = 0;
function kiem(dk, ten) { if (dk) dat++; else { hong++; console.error('✗ ' + ten); } }

/* ── Hồ sơ nhân vật ── */
kiem(ID_NHAN_VAT.length >= 7, 'có ít nhất 7 nhân vật chuẩn (trainer, mc, giảng viên, gia đình)');
kiem(ID_NHAN_VAT.indexOf('trainer') >= 0 && ID_NHAN_VAT.indexOf('mc') >= 0 && ID_NHAN_VAT.indexOf('giang-vien') >= 0,
  'đủ ba vai chủ lực: trainer, mc, giang-vien');
for (const id of ID_NHAN_VAT) {
  const nv = NHAN_VAT_CHUAN[id];
  kiem(/^[a-z0-9-]+$/.test(id), 'id hợp lệ: ' + id);
  kiem(nv && nv.ten && nv.vai && nv.moTaVe, 'đủ tên/vai/mô tả: ' + id);
  kiem(GIONG_VI.indexOf(nv.giong) >= 0, 'giọng của ' + id + ' nằm trong danh sách edge-tts được phép');
  kiem(typeof nv.promptEn === 'string' && nv.promptEn.length >= 80 && /Vietnamese/.test(nv.promptEn),
    'promptEn khóa đủ dài và mô tả người Việt: ' + id);
  kiem(/photorealistic/.test(nv.promptEn), 'promptEn của ' + id + ' yêu cầu ảnh chụp thật');
}
kiem(nhanVatHopLe('trainer') && !nhanVatHopLe('khong-co') && !nhanVatHopLe(''), 'nhanVatHopLe đúng/sai');
kiem(loaiHatNV('trainer') === 'nvchuan-trainer', 'loại hạt theo id');
kiem(giongNV('mc') === 'vi-VN-HoaiMyNeural' && giongNV('la') === giongNV('trainer'), 'giọng theo vai, id lạ về mặc định');

/* ── Bộ phân giải ảnh khóa (D1/R2 giả) ── */
const s = new DatabaseSync(':memory:');
s.exec(`CREATE TABLE phim_pt_hat (ma TEXT PRIMARY KEY, bam TEXT NOT NULL UNIQUE, loai TEXT NOT NULL, mime TEXT NOT NULL, byte INTEGER NOT NULL, soLan INTEGER NOT NULL DEFAULT 1)`);
const db = {
  prepare(sql) {
    let ts = [];
    const o = {
      bind(...a) { ts = a; return o; },
      async first() { return s.prepare(sql).get(...ts) || null; },
      async all() { return { results: s.prepare(sql).all(...ts) }; },
      async run() { const r = s.prepare(sql).run(...ts); return { meta: { changes: Number(r.changes) } }; }
    };
    return o;
  }
};
const kho = new Map();
const env = {
  HOSO: {
    async get(k) { const x = kho.get(k); return x ? { body: x } : null; },
    async put(k, v) { kho.set(k, v); }
  }
};

function khoaGia(id, bam, loai, byte) {
  s.prepare('INSERT INTO phim_pt_hat (ma, bam, loai, mime, byte, soLan) VALUES (?, ?, ?, ?, ?, 1)')
    .run(id, bam, loai, 'image/jpeg', byte);
  kho.set('pt/' + bam, Buffer.concat([Buffer.from([0xFF, 0xD8, 0xFF, 0xE0]), Buffer.alloc(64, byte & 0xFF)]));
}

/* trainer: 5 ảnh khóa (quá trần 4 — phải cắt còn 4, đúng thứ tự) */
for (let i = 0; i < 5; i++) khoaGia('t'.repeat(31) + i, 'bam-t' + i, 'nvchuan-trainer', 100 + i);
khoaGia('m'.repeat(32), 'bam-mc', 'nvchuan-mc', 200);

const refTrainer = await layRefNhanVat(env, db, 'trainer');
kiem(refTrainer.length === 4, 'klein nhận tối đa 4 ảnh khóa dù đã khóa 5');
kiem(refTrainer.every(b => typeof b === 'string' && b.length > 44), 'ảnh khóa trả về base64 đọc được');
kiem((await maRefNhanVat(env, db, 'trainer')) === 't'.repeat(31) + '0', 'mã khóa đầu tiên làm dấu nvRef');
kiem((await layRefNhanVat(env, db, 'mc')).length === 1, 'mc có đúng 1 ảnh khóa');
kiem((await layRefNhanVat(env, db, 'bo')).length === 0, 'nhân vật chưa khóa ảnh → mảng rỗng (rơi về chuỗi mặc định)');
kiem((await layRefNhanVat(env, db, 'la')).length === 0, 'id lạ → mảng rỗng, không lỗi');
kiem((await layRefNhanVat({ HOSO: null }, db, 'trainer')).length === 0, 'thiếu R2 → mảng rỗng, không lỗi');

console.log((hong ? '✗' : '✓') + ' thu-nhan-vat-chuan: ' + dat + '/' + (dat + hong));
process.exit(hong ? 1 : 0);
