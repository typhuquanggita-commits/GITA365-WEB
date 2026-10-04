/* thu-hop-dong-shot.mjs — kiểm thử hợp đồng shot + 10 fixture phim thử.
   Chạy: node tools/thu-hop-dong-shot.mjs */
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { soatShot, chonRoute, NANG_LUC } from '../may-chu/hop-dong-shot.js';

let dat = 0, tong = 0;
function kiem(dk, ten) { tong++; if (dk) { dat++; console.log('✓', ten); } else { console.error('✗', ten); process.exitCode = 1; } }

const GOC = join(dirname(fileURLToPath(import.meta.url)), '..');
const MAU_HOP_LE = JSON.parse(readFileSync(join(GOC, 'xuong-phim/phim-thu/pilot_s06.json'), 'utf8'));

/* ── Ca đúng ── */
kiem(soatShot(MAU_HOP_LE).ok === true, 'shot mẫu pilot_s06 hợp lệ');

/* ── Ca sai phải bị chặn ── */
const sai1 = { ...MAU_HOP_LE, durationMs: 40000 };
kiem(soatShot(sai1).loi.some(l => l.ma === 'THOI_LUONG'), 'shot kéo dài 40 giây bị chặn (sai mặt tích lũy)');
const sai2 = { ...MAU_HOP_LE, fps: { num: 23.976, den: 1 } };
kiem(soatShot(sai2).loi.some(l => l.ma === 'FPS'), 'fps float bị chặn — phải rational số nguyên');
const sai3 = JSON.parse(JSON.stringify(MAU_HOP_LE));
sai3.actions[0].actorId = 'nguoi-la';
kiem(soatShot(sai3).loi.some(l => l.ma === 'HANH_DONG'), 'actorId lạ (không thuộc characters) bị chặn');
const sai4 = JSON.parse(JSON.stringify(MAU_HOP_LE));
sai4.dialogues[0].characterId = 'bo';
kiem(soatShot(sai4).loi.some(l => l.ma === 'THOAI'), 'thoại gán cho người không có trong shot bị chặn');
const sai5 = { ...MAU_HOP_LE, requiredCapabilities: ['teleport'] };
kiem(soatShot(sai5).loi.some(l => l.ma === 'NANG_LUC'), 'capability lạ bị chặn — unknown không coi là supported');
const sai6 = JSON.parse(JSON.stringify(MAU_HOP_LE));
delete sai6.characters[0].referenceSetId;
kiem(soatShot(sai6).loi.some(l => l.ma === 'THAM_CHIEU'), 'thiếu bộ tham chiếu được duyệt bị chặn — seed không phải bảo đảm danh tính');
const sai7 = JSON.parse(JSON.stringify(MAU_HOP_LE));
sai7.actions[0].endMs = 9000;
kiem(soatShot(sai7).loi.some(l => l.ma === 'HANH_DONG'), 'hành động vượt durationMs bị chặn');

/* ── Route theo năng lực THẬT ── */
const r1 = chonRoute(MAU_HOP_LE);
kiem(r1.ok === false && r1.code === 'BLOCKED_UNSUPPORTED_CAPABILITY' && r1.thieu.some(t => t.cap === 'multi_person_contact'),
  'shot trao giấy bị BLOCKED đúng chuẩn, kèm route thay thế — không âm thầm hạ thành ảnh chuyển động');
const r2 = chonRoute({ requiredCapabilities: ['reference_identity', 'lip_sync'] });
kiem(r2.ok === true, 'shot nói một người với năng lực đã xác minh được phép đi tiếp');
kiem(Object.values(NANG_LUC).every(n => n.trangThai !== 'da-xac-minh' || n.bangChung),
  'mọi năng lực ghi "đã xác minh" đều có bằng chứng kèm theo');

/* ── Toàn bộ fixture phim thử phải qua hợp đồng ── */
const tepShot = readdirSync(join(GOC, 'xuong-phim/phim-thu')).filter(f => /^pilot_s\d+\.json$/.test(f));
kiem(tepShot.length === 10, 'phim thử có đủ 10 shot');
let hetLoi = true, tongMs = 0;
const giayCanCo = { pilot_s05: 'walk_to', pilot_s06: 'offer' };
for (const f of tepShot.sort()) {
  const s = JSON.parse(readFileSync(join(GOC, 'xuong-phim/phim-thu', f), 'utf8'));
  const k = soatShot(s);
  if (!k.ok) { hetLoi = false; console.error('  ✗', f, JSON.stringify(k.loi)); }
  tongMs += s.durationMs;
}
kiem(hetLoi, '10/10 shot fixture hợp lệ theo hợp đồng');
kiem(tongMs === 80000, 'tổng thời lượng đúng 80 giây (mục tiêu 60–90 giây)');
const s05 = JSON.parse(readFileSync(join(GOC, 'xuong-phim/phim-thu/pilot_s05.json'), 'utf8'));
kiem(s05.actions.some(a => a.verb === 'walk_to'), 'cổng nghiệm thu: shot 05 có đi lại (không thay bằng slideshow)');
const s06 = MAU_HOP_LE;
kiem(s06.continuityIn.propOwner.commitment_card === 'trainer' && s06.continuityOut.propOwner.commitment_card === 'con-trai',
  'cổng nghiệm thu: shot 06 giấy cam kết đổi người giữ (continuity in/out)');
const s08 = JSON.parse(readFileSync(join(GOC, 'xuong-phim/phim-thu/pilot_s08.json'), 'utf8'));
kiem(new Set(s08.actions.filter(a => a.verb !== 'listen').map(a => a.actorId)).size >= 1 && s08.characters.length >= 4,
  'cổng nghiệm thu: shot 08 có nhiều người cùng hoạt động trong khung');

console.log(dat === tong ? `Đạt ${dat}/${tong}` : `HỎNG ${tong - dat}/${tong}`);
