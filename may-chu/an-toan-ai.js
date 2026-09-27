/* ═══════════════════════════════════════════════════════════════
   GITA 365 — AN TOÀN MỞ RỘNG AI (9.99.171)

   TRẦN TRƯỚC, CỬA SAU — theo tài liệu chủ hệ (GITA365 V13 "$0/tháng").
   Tài liệu ấy đề nghị một AI Gateway định tuyến qua SÁU nhà cung cấp,
   trong đó NĂM nằm NGOÀI lãnh thổ — Gemini · Groq · OpenRouter · Together
   · HF — cho cả tác vụ 'generate' · 'grade' · 'translate'. Nghĩa là gửi
   NỘI DUNG (có thể mang tên trẻ, chuyện một gia đình) tới máy chủ nước
   ngoài. Và tài liệu KHÔNG có một cổng ẩn danh nào đứng trước các nhà
   cung cấp ấy.

   Đó là lỗ Điều 13 (BẤT KHẢ SỬA) + Luật 91/2025 lớn nhất mà một bản mở
   rộng có thể mở: "mọi ghi chép về một gia đình hoặc một đứa trẻ không
   bao giờ rời hệ ở dạng nhận dạng được." Một cái tên trẻ con đi tới
   Gemini là xử lý dữ liệu XUYÊN BIÊN GIỚI.

   Vì sao dựng CÁI TRẦN này TRƯỚC khi có gateway: một cổng dựng SAU một
   cửa đã chạy chỉ là một lời nhắc — người ta đọc, thấy hợp lý, rồi vẫn
   gọi thẳng nhà cung cấp. Đặt trần trước thì mọi cửa ngoài viết sau
   PHẢI đi qua đây, và mục 121 canh đúng chỗ ấy (phép đo về thứ KHÔNG
   ĐƯỢC TỒN TẠI: không may-chu/ nào fetch tới host nhà cung cấp AI ngoài
   mà không qua cổng này).

   BA điều cố ý:
   1. KHÔNG dựng bộ dò ẩn danh thứ hai. GITA đã có ĐÚNG một — soatRaNgoai
      (bo-nao.js), đã chống sáu lối né qua nhiều đợt thanh tra. Hai bảng
      dấu hiệu lệch nhau thì cả hai xanh trên hai thứ khác nhau (9.99.70).
   2. Cổng này KHÔNG gọi một nhà cung cấp nào (KHÔNG fetch). Nó chỉ SÀNG.
      Cửa thật gọi provider nằm ở tầng trên và phải gọi cổng này TRƯỚC —
      tách "sàng" khỏi "gửi" để cổng không bao giờ tự làm rò.
   3. Máy KHÔNG tự xoá hộ (9.99.62). Bẩn thì CHẶN và trả danh sách dấu
      hiệu để người gửi tự sửa — tự xoá thì người gửi không biết mình vừa
      suýt gửi gì, và lần sau viết y hệt.
   ═══════════════════════════════════════════════════════════════ */
'use strict';

import { soatRaNgoai } from './bo-nao.js';

/* Nhà cung cấp NGOÀI lãnh thổ — gửi nội dung tới đây là xử lý dữ liệu
   xuyên biên giới. Cloudflare Workers AI (cf-workers-ai) chạy TRONG vùng
   nên khác loại, nhưng cổng vẫn sàng nó để phòng thủ nhiều lớp. */
export const NHA_NGOAI = ['gemini', 'groq', 'openrouter', 'together', 'hf', 'openai', 'anthropic'];
export const NHA_TRONG = ['cf-workers-ai'];

/* Host thật của các nhà cung cấp ngoài — mục 121 dò các host này trong
   MỌI tệp may-chu/ và đòi cổng đứng trước. Dò HOST, không dò tên ngắn
   (tên ngắn "hf"/"together" bắt oan chữ thường). */
export const HOST_NGOAI = [
  'generativelanguage.googleapis.com', 'api.groq.com', 'openrouter.ai',
  'api.together.xyz', 'api-inference.huggingface.co', 'api.openai.com', 'api.anthropic.com'
];

/* Dựng CHUỖI ĐÃ GHÉP XONG rồi mới soi (luật 9.99.62: soi chuỗi đã dựng,
   KHÔNG soi từng ô — một cái tên nằm ở ô nội dung, ô bố cục hay ô ngữ
   cảnh đều như nhau nguy hiểm; soi từng ô là nhiều phép soi phải cùng
   nhớ, và cái ô người viết cổng KHÔNG NGHĨ TỚI là cái lọt).

   Vì sao ĐỆ QUY MỌI CHUỖI, không whitelist trường: bản đầu chỉ soi
   systemPrompt · prompt · messages · fields. Nhưng một AI Gateway thật
   mang thêm trường bất kỳ — ngữ cảnh RAG, tài liệu đính kèm, ví dụ
   few-shot — và một tên trẻ nằm ở trường mới ấy thì lọt cổng trong khi
   nhìn cổng vẫn "đủ". Nên gom MỌI giá trị chuỗi trong opts, ở mọi độ
   sâu. Tên nhà cung cấp/model cũng bị soi kèm — vô hại, chúng không phải
   tên người Việt. Thà soi thừa còn hơn sót đúng trường không ai ngờ. */
function gomChuoi(v, ra, sau) {
  if (v == null || sau > 6) return;
  if (typeof v === 'string') { ra.push(v); return; }
  if (Array.isArray(v)) { v.forEach(x => gomChuoi(x, ra, sau + 1)); return; }
  if (typeof v === 'object') { Object.keys(v).forEach(k => gomChuoi(v[k], ra, sau + 1)); return; }
}
function chuoiRa(opts) {
  const ra = [];
  gomChuoi(opts, ra, 0);
  return ra.join('\n');
}

async function ghiSo(db, hoSo, provider, code, chiTiet) {
  if (!db) return;
  try {
    await db.prepare('INSERT INTO audit (viec,boiAi,chiTiet,luc) VALUES (?,?,?,?)')
      .bind('ATAI_' + code, (hoSo && hoSo.u) || '?', provider + ' · ' + chiTiet, new Date().toISOString())
      .run();
  } catch (e) { /* nhật ký hỏng không được chặn phép sàng — sàng là chính */ }
}

/* CỬA DUY NHẤT ra nhà cung cấp AI. Mọi lời gọi provider (bất kể tác vụ:
   generate · grade · translate · embed) PHẢI gọi cửa này TRƯỚC.

   Trả về:
     { cho:true,  sach:true,  ngoai }            — được đi, chuỗi sạch
     { cho:false, code:'DIEU13', ngoai, ngo }    — CHẶN: chuỗi mang dữ liệu
                                                    nhận dạng được, mang cả
                                                    danh sách dấu hiệu để sửa
     { cho:false, code:'NHALA' }                 — nhà cung cấp không trong
                                                    danh sách trắng (thêm vào
                                                    NHA_NGOAI/NHA_TRONG trước) */
export async function soatRaNhaCungCap(opts, env, db, hoSo) {
  const provider = (opts && (opts.preferredProvider || opts.provider)) || '';
  const laNgoai = NHA_NGOAI.indexOf(provider) >= 0;
  const laTrong = NHA_TRONG.indexOf(provider) >= 0;
  if (!laNgoai && !laTrong) {
    await ghiSo(db, hoSo, provider || '?', 'NHALA', 'không trong danh sách trắng');
    return { cho: false, code: 'NHALA',
      vi: 'Nhà cung cấp không có trong danh sách trắng. Khai vào NHA_NGOAI hoặc NHA_TRONG trước khi gọi.' };
  }
  const ra = soatRaNgoai(chuoiRa(opts));
  if (!ra.sach) {
    await ghiSo(db, hoSo, provider, 'DIEU13', ra.ngo.map(n => n.ma).join(','));
    return { cho: false, code: 'DIEU13', ngoai: laNgoai, ngo: ra.ngo,
      vi: 'Chuỗi mang dữ liệu nhận dạng được — KHÔNG gửi tới nhà cung cấp AI. ' +
        'Sửa chuỗi rồi gửi lại; máy không tự xoá hộ.' };
  }
  await ghiSo(db, hoSo, provider, 'RA', laNgoai ? 'ngoài lãnh thổ · sạch' : 'trong vùng · sạch');
  return { cho: true, sach: true, ngoai: laNgoai };
}

/* Luật an toàn mở rộng AI — mỗi luật TRỎ một luật/cổng ĐÃ CÓ (không chép).
   Đọc bởi mục 121 và hiện cho chủ hệ ở bản đọc được. */
export const ATAI_LUAT = [
  { ma: 'AT1', luat: 'Mọi chuỗi tới nhà cung cấp AI NGOÀI phải qua soatRaNgoai trước khi rời hệ',
    tro: 'Điều 13 bất khả sửa · Luật 91/2025', cong: 'soatRaNhaCungCap' },
  { ma: 'AT2', luat: 'Reputation cộng đồng KHÔNG thành bảng xếp hạng người công khai — chỉ gương soi riêng',
    tro: 'LR1 · VIP_CAM C1 · F.51 (gương soi riêng, không phải bảng xếp thứ tự)', cong: '—' },
  { ma: 'AT3', luat: 'Dịch tự động phải ẩn danh nội dung gia đình TRƯỚC khi ra ngoài — cùng cổng AT1',
    tro: 'Điều 13 bất khả sửa', cong: 'soatRaNhaCungCap' },
  { ma: 'AT4', luat: 'Rate-limit theo NGƯỜI cho cửa sinh nội dung / chat, chống lạm dụng',
    tro: 'guard.js quét-chặn (client) — cần lớp máy chủ khi mở gateway', cong: '—' },
  { ma: 'AT5', luat: 'Đổi nền V13 (Hono · đa nhà cung cấp) là VÙNG ĐỎ — máy không tự dựng; nếu dựng, mọi cửa ngoài qua AT1',
    tro: 'luật kho: máy đề xuất, chủ hệ quyết', cong: '—' }
];
