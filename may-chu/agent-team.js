/* ═══════════════════════════════════════════════════════════════
   GITA 365 — AGENT TEAMWORK ORCHESTRATION

   Bộ điều phối đội nhóm Agent làm việc cùng nhau trên một công việc phức
   tạp. Mỗi Agent vẫn giữ một cửa riêng, một khoá sở hữu, và phải qua cổng
   của mình — module này chỉ lập KẾ HOẠCH chạy, ghi vết, và đo lường.

   Nguyên tắc:
     · Không tự ra tay: chỉ trả plan + gọi đúng cửa theo thứ tự.
     · Mỗi bước phải có input/output rõ ràng.
     · Audit log đầy đủ để truy vết.
   ═══════════════════════════════════════════════════════════════ */

import { Kho } from './nen.js';
import { chamMotLuot } from './khung-van-hanh.js';
import { aiCoQuyen } from './quyen-nang-ai.js';
import { laNguoiNha } from './vai-tro.js';

/* Các workflow teamwork đã định nghĩa. Mỗi workflow là một chuỗi bước,
   mỗi bước chỉ định Agent/cửa, input lấy từ đâu, output ghi vào đâu. */
const WORKFLOW = {
  'youtube-365': [
    { buoc: 1, agent: 'YT-A', cua: 'aiSoanNhap', input: 'deXuatKenh', output: 'YT-BP', canQuyen: 'AI02' },
    { buoc: 2, agent: 'YT-B', cua: 'aiSoanNhap', input: 'YT-BP', output: 'YT-RE', canQuyen: 'AI02' },
    { buoc: 3, agent: 'YT-C', cua: 'aiSoanNhap', input: 'YT-RE', output: 'YT-SC', canQuyen: 'AI02' },
    { buoc: 4, agent: 'YT-D', cua: 'aiSoanNhap', input: 'YT-SC', output: 'YT-SD', canQuyen: 'AI02' },
    { buoc: 5, agent: 'YT-D', cua: 'aiSoanNhap', input: 'YT-SC', output: 'YT-SB', canQuyen: 'AI02' },
    { buoc: 6, agent: 'YT-C', cua: 'aiSoanNhap', input: 'YT-SC', output: 'YT-VD', canQuyen: 'AI02' }
  ],
  'vip-cham-soc': [
    { buoc: 1, agent: 'AIC03', cua: 'crmTroLy', input: 'hoSoKhach', output: 'tomTat360', canQuyen: null },
    { buoc: 2, agent: 'AIC04', cua: 'crmDieuPhoiAI', input: 'tomTat360', output: 'keHoachChamSoc', canQuyen: null },
    { buoc: 3, agent: 'AI01', cua: 'aiPhanLoai', input: 'phanHoiMoi', output: 'phatSinh', canQuyen: 'AI01' },
    { buoc: 4, agent: 'AI04', cua: 'aiSoanNhap', input: 'phatSinh', output: 'phuongAnUngPho', canQuyen: 'AI04' }
  ],
  'kenh-ve-tinh': [
    { buoc: 1, agent: 'AI02', cua: 'aiSoanNhap', input: 'kichBanGoc', output: 'baiVietBlog', canQuyen: 'AI02' },
    { buoc: 2, agent: 'AI02', cua: 'aiSoanNhap', input: 'baiVietBlog', output: 'emailSequence', canQuyen: 'AI02' },
    { buoc: 3, agent: 'AI02', cua: 'aiSoanNhap', input: 'baiVietBlog', output: 'socialPosts', canQuyen: 'AI02' },
    { buoc: 4, agent: 'AI05', cua: 'aiTongHopGiamSat', input: 'ketQuaKenh', output: 'baoCaoKenh', canQuyen: null }
  ],
  /* 9.99.254 — đội Agent xưởng phim 0 đồng, cá nhân hoá theo cấp hành trình
     50 cấp của khách. Cả bốn bước đi qua cửa phimMienPhi (Workers AI miễn
     phí, trần neuron mỗi ngày, cổng Điều 13). Phần dựng — giọng Piper,
     chiều sâu 2.5D, chỉnh màu, xuất MP4 — chạy trong trình duyệt, không
     phải cửa máy chủ nên không nằm trong danh sách bước. */
  'xuong-phim-ca-nhan': [
    { buoc: 1, agent: 'XP-BK', cua: 'phimMienPhi', input: 'hanhTrinhKhach', output: 'kinhBoPhim', canQuyen: null },
    { buoc: 2, agent: 'XP-DUYET', cua: 'phimMienPhi', input: 'kinhBoPhim', output: 'kinhDaDuyet', canQuyen: null },
    { buoc: 3, agent: 'XP-DD', cua: 'phimMienPhi', input: 'kinhDaDuyet', output: 'phanCanhTap', canQuyen: null },
    { buoc: 4, agent: 'XP-HOA', cua: 'phimMienPhi', input: 'phanCanhTap', output: 'anhCanh', canQuyen: null }
  ]
};

/** Lập kế hoạch teamwork cho một workflow. */
export async function lapKeHoachAgent(y, env, db, hoSo) {
  if (!laNguoiNha(hoSo)) return { ok: false, code: 'NOPERM',
    error: 'Điều phối Agent teamwork chỉ mở cho R01–R12.' };
  const x = y || {};
  const ma = String(x.workflow || '').trim();
  if (!WORKFLOW[ma]) return { ok: false, code: 'KHONGCO',
    error: 'Workflow chưa định nghĩa: ' + ma };

  const plan = [];
  for (const b of WORKFLOW[ma]) {
    let duoc = true;
    if (b.canQuyen) duoc = await aiCoQuyen(db, b.canQuyen, 'he');
    plan.push({ ...b, duoc });
  }

  await Kho.ghiNhatKy(db, { uid: hoSo.uid, username: hoSo.u,
    viec: 'AGENT_LAP_KE_HOACH', doiTuong: ma,
    chiTiet: plan.length + ' bước · ' + plan.filter(p => p.duoc).length + ' được cấp quyền' });

  return { ok: true, workflow: ma, plan, canChay: plan.every(p => p.duoc) };
}

/** Chạy một bước teamwork: chỉ xác minh rồi trả plan cụ thể cho cửa.
    Không tự gọi cửa ghi. */
export async function chayBuocAgent(y, env, db, hoSo, danhSachCua) {
  if (!laNguoiNha(hoSo)) return { ok: false, code: 'NOPERM',
    error: 'Chạy bước Agent teamwork chỉ mở cho R01–R12.' };
  const x = y || {};
  const ma = String(x.workflow || '').trim();
  const buoc = Number(x.buoc || 0);
  const plan = WORKFLOW[ma];
  if (!plan || buoc < 1 || buoc > plan.length)
    return { ok: false, code: 'KHONGCO', error: 'Bước không hợp lệ.' };

  const b = plan[buoc - 1];
  if (b.canQuyen && !(await aiCoQuyen(db, b.canQuyen, 'he')))
    return { ok: false, code: 'AIOFF', error: 'Quyền năng ' + b.canQuyen + ' chưa bật.' };

  /* Kiểm tra V20 trước khi cho phép bước này chạy */
  const v20 = await chamMotLuot({
    khoaSoHuu: b.cua,
    nguCanh: 'Agent teamwork ' + ma + ' · bước ' + buoc,
    tuKiem: 'Đã kiểm quyền ' + (b.canQuyen || '—')
  }, env, db, hoSo, danhSachCua);
  if (!v20.dat) return { ok: false, code: 'V20_LOI', loi: v20.lots, v20 };

  await Kho.ghiNhatKy(db, { uid: hoSo.uid, username: hoSo.u,
    viec: 'AGENT_CHAY_BUOC', doiTuong: b.agent,
    chiTiet: ma + ' · bước ' + buoc + ' · cửa ' + b.cua });

  return { ok: true, workflow: ma, buoc, agent: b.agent, cua: b.cua,
    input: b.input, output: b.output,
    vi: 'Bước đã đạt V20. Gọi đúng cửa ' + b.cua + ' để thực thi.' };
}

/** Liệt kê các workflow teamwork có sẵn. */
export async function dsWorkflowAgent(y, env, db, hoSo) {
  if (!laNguoiNha(hoSo)) return { ok: false, code: 'NOPERM' };
  return { ok: true, ds: Object.keys(WORKFLOW).map(ma => ({ ma, soBuoc: WORKFLOW[ma].length })) };
}
