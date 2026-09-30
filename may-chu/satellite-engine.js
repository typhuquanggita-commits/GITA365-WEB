/* ═══════════════════════════════════════════════════════════════
   GITA 365 — SATELLITE CHANNEL ENGINE

   Động cơ xây kênh vệ tinh tự động từ A-Z theo chiến lược 365 ngày.
   Nhận một kịch bản gốc (KBS), sinh nội dung đa kênh, và trả về kế hoạch
   phát hành. Không tự đăng lên mạng xã hội — chỉ sinh nội dung + lịch.

   Nguyên tắc:
     · Mỗi kênh có một vai Agent riêng.
     · Nội dung không rời hệ dưới dạng nhận diện được.
     · Lịch 365 ngày chia theo tuần, gắn với 5 tầng và 7 chuyển dịch.
   ═══════════════════════════════════════════════════════════════ */

import { Kho } from './nen.js';

const BAC = {R01:1,R02:2,R03:3,R04:4,R05:5,R06:6,R07:7,R08:8,
  R09:9,R10:10,R11:11,R12:12,R13:13,R14:14,R15:15};

/* 52 tuần × 1 video + 2 blog + 3 social posts */
const KENH = [
  { ma: 'youtube', ten: 'YouTube', tanSuat: '1 video/tuần' },
  { ma: 'blog', ten: 'Blog', tanSuat: '2 bài/tuần' },
  { ma: 'email', ten: 'Email', tanSuat: '1 newsletter/tuần' },
  { ma: 'facebook', ten: 'Facebook', tanSuat: '3 bài/tuần' },
  { ma: 'zalo', ten: 'Zalo OA', tanSuat: '3 bài/tuần' }
];

function laNguoiNha(hoSo) {
  return /^R(0[1-9]|1[0-2])$/.test(String((hoSo || {}).role || ''));
}

/** Sinh lịch 365 ngày từ chủ đề năm. */
export async function lich365Ngay(y, env, db, hoSo) {
  if (!laNguoiNha(hoSo)) return { ok: false, code: 'NOPERM' };
  const chuDeNam = String(y.chuDeNam || 'Gia đình vận hành được').trim();
  const lich = [];
  for (let tuan = 1; tuan <= 52; tuan++) {
    const tang = Math.min(5, Math.ceil(tuan / 10.4));
    lich.push({
      tuan, tang,
      chuDeTuan: 'Tuần ' + tuan + ' · Tầng ' + tang + ' · ' + chuDeNam,
      youtube: { deBai: 'Video T' + tang + ' — ' + chuDeNam, agent: 'YT-C' },
      blog: [
        { deBai: 'Bài 1 tuần ' + tuan + ' — Lý do T' + tang, agent: 'AI02' },
        { deBai: 'Bài 2 tuần ' + tuan + ' — Ca thật T' + tang, agent: 'AI02' }
      ],
      social: [
        { deBai: 'Hook tuần ' + tuan, agent: 'AI02' },
        { deBai: 'Quote tuần ' + tuan, agent: 'AI02' },
        { deBai: 'CTA tuần ' + tuan, agent: 'AI02' }
      ]
    });
  }
  return { ok: true, chuDeNam, tongTuan: 52, lich };
}

/** Sinh nội dung đa kênh từ một kịch bản gốc. */
export async function sinhNoiDungKenh(y, env, db, hoSo) {
  if (!laNguoiNha(hoSo)) return { ok: false, code: 'NOPERM' };
  const kichBan = String(y.kichBan || '').trim();
  if (!kichBan) return { ok: false, error: 'Thiếu kịch bản gốc.' };

  const noiDung = {
    youtube: { deBai: '[YT] ' + kichBan, scriptBrief: 'Hook → insight → CTA', agent: 'YT-C' },
    blog: { deBai: '[Blog] ' + kichBan, outline: 'Problem → data → solution → CTA', agent: 'AI02' },
    email: { deBai: '[Email] ' + kichBan, subject: 'Câu hỏi về ' + kichBan, agent: 'AI02' },
    facebook: { deBai: '[FB] ' + kichBan, format: 'Hook ngắn + ảnh', agent: 'AI02' },
    zalo: { deBai: '[Zalo] ' + kichBan, format: 'Tin nhắn ngắn + link', agent: 'AI02' }
  };

  await Kho.ghiNhatKy(db, { uid: hoSo.uid, username: hoSo.u,
    viec: 'SATELLITE_SINH_NOI_DUNG', doiTuong: kichBan.slice(0, 80),
    chiTiet: Object.keys(noiDung).join(', ') });

  return { ok: true, kichBan, noiDung, kenh: KENH.map(k => k.ma) };
}

/** Ước tính lead tiềm năng từ kế hoạch kênh. */
export async function duBaoLead(y, env, db, hoSo) {
  if (!laNguoiNha(hoSo)) return { ok: false, code: 'NOPERM' };
  const lich = (y.lich || []).length ? y.lich : (await lich365Ngay(y, env, db, hoSo)).lich;
  if (!lich) return { ok: false, error: 'Không có lịch để dự báo.' };

  const views = lich.length * 1500;          /* 1,500 view/tuần ước tính */
  const leads = Math.floor(views * 0.035);   /* 3.5% lead rate */
  const monthly = Math.floor(leads / 12);

  return { ok: true, tongView: views, tongLead: leads, trungBinhThang: monthly,
    mucTieu: 2000, canTangGap: monthly < 2000 ? Math.ceil(2000 / monthly) : 1 };
}

/** Liệt kê các kênh vệ tinh được hỗ trợ. */
export async function dsKenhVeTinh(y, env, db, hoSo) {
  if (!laNguoiNha(hoSo)) return { ok: false, code: 'NOPERM' };
  return { ok: true, ds: KENH };
}
