/* ═══════════════════════════════════════════════════════════════
   GITA 365 — VÒNG CHẠY CỦA MỘT NỘI DUNG CÔNG KHAI

   Bản chép của G.BP_* — bộ kiểm mục 89 đối chiếu từng ô với kho.

   ══ MÔ-ĐUN NÀY KHÔNG GIỮ MỘT CHỮ NÀO CỦA BỐN PROMPT ══

   Prompt được DỰNG LÚC CHẠY ở trình duyệt, nơi kho đang mở —
   `G.bpDung(vai)` ở `src/bo-prompt.js`. Máy chủ chỉ ghi VÒNG CHẠY:
   bài nào đã qua bước nào, ở nhà cung cấp nào, lúc mấy giờ.

   Vì sao tách như thế: prompt chứa cả Hiến pháp và toàn bộ hàng rào.
   Giữ một bản ở máy chủ là dựng bản thứ hai của mười ba sự thật cùng
   một lúc — và bản thứ hai này nguy hơn mọi bản trước, vì prompt
   CHÍNH LÀ thứ nói chuyện với khách.

   ══ CÁI RĂNG: SOẠN ≠ DUYỆT ══

   Bước 2 phải chạy ở nhà cung cấp KHÁC bước 1. Cùng một mô hình làm
   cả hai thì phần duyệt chỉ là phần soạn nói lại lần nữa, và nó sẽ
   đồng ý với chính nó — sổ vẫn đủ sáu dòng nên không ai đọc ra. Cùng
   luật L3 của thang năm cổng (9.99.42): một người ký nhiều nhất một
   cổng.
   ═══════════════════════════════════════════════════════════════ */

import { Kho } from './nen.js';

/* ═══════════════ BẢN CHÉP CỦA KHO ═══════════════ */

export const VAI4 = ['A', 'B', 'C', 'D'];
/* Hai vai soi chạy ở nhiệt độ THẤP hơn hai vai soạn. Một người soi ở
   nhiệt độ cao là một người soi biết bịa ra lỗi, và một lỗi bịa ra
   làm người viết thôi tin cả bản soi. */
export const NHIET_DO = { A: 0.4, B: 0.4, C: 0.2, D: 0.2 };
export const VAI_KHAC_A = ['C', 'D'];

export const VONG = ['V1', 'V2', 'V3', 'V4', 'V5', 'V6'];
export const VONG_MAY = ['V1', 'V2', 'V3', 'V4'];
export const VONG_NGUOI = ['V5', 'V6'];
/* Bước nào phải đổi nhà cung cấp so với bước trước nó. */
export const VONG_DOI_NHA = ['V2'];

export const KHOI = ['K01', 'K02', 'K03', 'K04', 'K05', 'K06', 'K07', 'K08',
  'K09', 'K10', 'K11', 'K12', 'K13', 'K14', 'K15', 'K16', 'K17'];

function duocVaoBP(hoSo) {
  return /^R(0[1-9]|1[0-2])$/.test(String((hoSo || {}).role || ''));
}

/* ═══════════════ GHI MỘT LƯỢT CỦA VÒNG CHẠY ═══════════════

   MỘT LƯỢT LÀ MỘT DÒNG MỚI kèm nhà cung cấp và giờ. Ghi đè một ô "đã
   qua vòng" thì mất hẳn phần lịch sử — mà chính phần lịch sử chứng
   minh được rằng bài đã đi đủ vòng, chứ không phải có người bấm cho
   xong. */
export async function ghiLuotPrompt(y, env, db, hoSo) {
  if (!duocVaoBP(hoSo)) return { ok: false, code: 'NOPERM',
    error: 'Vòng chạy nội dung mở cho R01–R12.' };

  const x = y || {};
  const maBai = String(x.maBai || '').trim();
  const buoc = String(x.buoc || '').trim();
  const nha = String(x.nhaCungCap || '').trim();

  if (!maBai || VONG.indexOf(buoc) < 0) return { ok: false, code: 'THIEUO',
    error: 'Thiếu mã bài, hoặc bước không phải ' + VONG.join(' · ') + '.' };

  const daCo = await docVong(db, maBai);

  /* ── CỔNG 1 · ĐÚNG THỨ TỰ, KHÔNG NHẢY BƯỚC ── */
  const i = VONG.indexOf(buoc);
  const thieuTruoc = VONG.slice(0, i).filter(b => !daCo.buocDaQua[b]);
  if (thieuTruoc.length) return { ok: false, code: 'NHAYBUOC', thieu: thieuTruoc,
    error: 'Chưa qua bước ' + thieuTruoc.join(' · ') + ' mà đã ghi ' + buoc + '. Sáu ' +
      'bước chạy ĐÚNG THỨ TỰ — soi luật trước khi sửa thì sửa xong lại phải soi lại, ' +
      'và người duyệt đọc một bản không phải bản sắp đăng.' };

  /* ── CỔNG 2 · BƯỚC MÁY PHẢI KHAI NHÀ CUNG CẤP ── */
  const laMay = VONG_MAY.indexOf(buoc) >= 0;
  if (laMay && !nha) return { ok: false, code: 'THIEUNHA',
    error: 'Bước máy phải khai NHÀ CUNG CẤP. Không khai thì không kiểm được luật ' +
      'soạn-khác-duyệt, và luật ấy là cả lý do vòng chạy này tồn tại.' };

  /* ── CỔNG 3 · SOẠN ≠ DUYỆT ──
     Cái răng chính. Cùng nhà cung cấp thì người soạn đang tự duyệt
     mình, và sổ vẫn đủ sáu dòng nên không ai đọc ra. */
  if (VONG_DOI_NHA.indexOf(buoc) >= 0) {
    const truoc = daCo.buocDaQua[VONG[i - 1]];
    if (truoc && String(truoc.nhaCungCap) === nha)
      return { ok: false, code: 'TUDUYET', nhaCungCap: nha,
        error: 'Bước ' + buoc + ' đang chạy ở CÙNG nhà cung cấp với bước trước (' +
          nha + '). Một mô hình KHÔNG tự phản biện chính nó được — phần duyệt sẽ chỉ ' +
          'là phần soạn nói lại lần nữa, và nó sẽ đồng ý với chính nó. Cùng luật L3 ' +
          'của thang năm cổng: một người ký nhiều nhất một cổng.' };
  }

  /* ── CỔNG 4 · BƯỚC NGƯỜI PHẢI CÓ TÊN NGƯỜI ── */
  const boiAi = String(x.boiAi || hoSo.u || '').trim();
  if (!laMay && !boiAi) return { ok: false, code: 'THIEUNGUOI',
    error: 'Bước ' + buoc + ' là bước của NGƯỜI, và nó phải có một cái tên. Cơ chế ' +
      'hậu kiểm nghĩa là sai thì sai công khai — lúc ấy câu hỏi đầu tiên là ai đã duyệt.' };

  const id = 'LP-' + Date.now().toString(36) + '-' +
    Math.random().toString(36).slice(2, 6);
  const ghiLuc = new Date().toISOString();
  await db.prepare(
    'INSERT INTO luotPrompt (id,maBai,buoc,vai,nhaCungCap,boiAi,ghiChu,ghiLuc)' +
    ' VALUES (?,?,?,?,?,?,?,?)')
    .bind(id, maBai, buoc, String(x.vai || '').trim() || null, nha || null,
      boiAi, String(x.ghiChu || '').trim() || null, ghiLuc).run();

  await Kho.ghiNhatKy(db, { uid: hoSo.uid, username: hoSo.u, viec: 'BP_LUOT',
    doiTuong: maBai, chiTiet: buoc + (nha ? ' · ' + nha : '') });

  return { ok: true, id, maBai, buoc, nhaCungCap: nha || undefined,
    conThieu: VONG.filter(b => b !== buoc && !daCo.buocDaQua[b]),
    vi: 'Đã ghi một DÒNG MỚI. Chính phần lịch sử chứng minh được rằng bài đã đi đủ ' +
      'vòng, chứ không phải có người bấm cho xong.' };
}

async function docVong(db, maBai) {
  const r = await db.prepare(
    'SELECT buoc, vai, nhaCungCap, boiAi, ghiLuc FROM luotPrompt' +
    ' WHERE maBai = ? ORDER BY ghiLuc ASC, rowid ASC').bind(String(maBai)).all();
  const ds = (r.results || r || []);
  const buocDaQua = {};
  ds.forEach(d => { buocDaQua[d.buoc] = d; });
  return { ds, buocDaQua };
}

export async function docVongChay(y, env, db, hoSo) {
  if (!duocVaoBP(hoSo)) return { ok: false, code: 'NOPERM',
    error: 'Vòng chạy nội dung mở cho R01–R12.' };
  const maBai = String((y || {}).maBai || '').trim();
  if (!maBai) return { ok: false, error: 'Thiếu mã bài.' };

  const t = await docVong(db, maBai);
  const thieu = VONG.filter(b => !t.buocDaQua[b]);
  const nhaA = (t.buocDaQua.V1 || {}).nhaCungCap;
  const nhaC = (t.buocDaQua.V2 || {}).nhaCungCap;

  return { ok: true, maBai, ds: t.ds, thieu,
    duVong: thieu.length === 0,
    /* Nêu RIÊNG phần máy và phần người. Gộp thành một con số "đã qua
       mấy bước" thì một bài mới chạy xong bốn bước máy trông gần
       xong, trong khi thứ còn thiếu là cả hai bước của người. */
    thieuMay: thieu.filter(b => VONG_MAY.indexOf(b) >= 0),
    thieuNguoi: thieu.filter(b => VONG_NGUOI.indexOf(b) >= 0),
    soanKhacDuyet: (nhaA && nhaC) ? nhaA !== nhaC : undefined,
    vi: thieu.length === 0
      ? 'Đủ sáu bước.'
      : 'Còn thiếu ' + thieu.join(' · ') + '. Máy chạy được bốn bước đầu; hai bước ' +
        'cuối là NGƯỜI, và không bước máy nào thay được.' };
}

/* ═══════════════ ĐỐI CHIẾU NHIỆT ĐỘ ═══════════════

   Hai vai soi phải chạy ở nhiệt độ THẤP HƠN hai vai soạn. Trả về
   từng cặp chứ không một chữ "đạt": một chữ "đạt" không nói vai nào
   đang sai, và sửa mò thì lần sau sai y hệt. */
export function soatNhietDo(khai) {
  const k = khai || NHIET_DO;
  const soan = Math.max(Number(k.A), Number(k.B));
  const sai = VAI_KHAC_A.filter(v => !(Number(k[v]) < soan));
  return { ok: true, dat: sai.length === 0, sai, nguongSoan: soan,
    vi: sai.length === 0
      ? 'Hai vai soi chạy thấp hơn hai vai soạn.'
      : 'Vai ' + sai.join(' · ') + ' đang chạy ở nhiệt độ không thấp hơn vai soạn. ' +
        'Một người soi ở nhiệt độ cao là một người soi biết BỊA RA LỖI — và một lỗi ' +
        'bịa ra làm người viết thôi tin cả bản soi.' };
}
