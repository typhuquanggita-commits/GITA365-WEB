/* ═══════════════════════════════════════════════════════════════
   GITA 365 — KIẾN TRÚC HỢP NHẤT (mô hình mục tiêu ↔ mã đang chạy)

   Chủ hệ gửi sơ đồ mô hình chuẩn doanh nghiệp (Hiến pháp OPA/Rego ·
   Bộ não LangGraph/Letta · 6 Agent · hệ nghiệp vụ Twenty/ERPNext/
   Mautic/Documenso · Vectorize/Langfuse/Zero Trust · nền Cloudflare
   đủ loại). Màn này HỢP NHẤT sơ đồ ấy với GITA theo ba trạng thái:

     co          — GITA ĐÃ CÓ, trỏ vào mã thật (CI đo mỗi PR)
     tuongduong  — GITA TỰ XÂY tương đương, tối giản, 0đ
     chua        — CHƯA có và CHƯA CẦN; ghi rõ NGƯỠNG KÍCH HOẠT

   Nguyên tắc: không mua/nhập một mảnh vì nó đẹp trên hình. Một mảnh
   chỉ vào khi chạm ngưỡng đo được — đổi được từng mảnh mà không sập
   hệ (mỗi mảnh là một cửa/bảng/khoang riêng, khoang.js).
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;
G.VIEWS = G.VIEWS || {};

/* tt: co · tuongduong · chua. Mục `chua` BẮT BUỘC có `kichHoat`. */
function o(ma, ten, mau, gita, tro, tt, kichHoat) {
  return { ma: ma, ten: ten, mau: mau, gita: gita, tro: tro || [], tt: tt, kichHoat: kichHoat || '' };
}
G.KT_LOP = [
  { ma: 'L1', ten: 'Hiến pháp — gác mọi hành động', muc: [
    o('KT-HP1', 'Chính sách dưới dạng mã', 'OPA / Rego',
      'Hiến pháp gác bằng mã: 12 luật + 18 virus/vắc-xin có người kiểm + 9 điều bất khả sửa.',
      ['v:hanh-lang', 'v:bo-nao'], 'tuongduong',
      'Khi người KHÔNG lập trình cần đổi luật thường xuyên → việc đổi luật thành dữ liệu, lúc ấy học mẫu OPA.'),
    o('KT-HP2', 'Guardrails cho AI', 'NeMo · Guardrails AI',
      'Cổng Điều 13 chặn dữ liệu nhận dạng trước mọi lượt AI + khuôn tự soát trong lời hệ.',
      ['m:may-chu/an-toan-ai.js#soatRaNhaCungCap'], 'tuongduong',
      'Khi cổng luật-if không còn đủ cho luồng hội thoại đa lượt → thêm lớp guardrails chuyên.')
  ]},
  { ma: 'L2', ten: 'Bộ não trung tâm — Main tự chủ', muc: [
    o('KT-BN1', 'Điều phối · quyết định', 'LangGraph',
      'Định tuyến bậc 0–4 + độ chắc sharp/split + tuyến chốt chặn (đồ thị chặng dừng chờ người).',
      ['v:bo-nao-da-tri', 'f:chayChangDaTri'], 'tuongduong',
      'Khi tuyến việc cần rẽ nhánh phức tạp tự phục hồi đa ngày → Cloudflare Workflows trước, LangGraph sau.'),
    o('KT-BN2', 'Trí nhớ dài hạn', 'Letta',
      'Kho giải pháp đã duyệt + đệm D1 + Thẻ Vùng Mạnh — nhớ bằng dữ liệu có người duyệt.',
      ['m:may-chu/csdl.sql#khoGiaiPhapDaTri', 'm:may-chu/csdl.sql#theVungManh'], 'tuongduong', ''),
    o('KT-BN3', 'Trí tuệ nền', 'Claude / Anthropic',
      'Một trong 5 nhà cung cấp bậc 4, chỉ việc chiến lược, R01, có ngân sách.',
      ['m:may-chu/bo-nao-da-tri.js#anthropic'], 'co', '')
  ]},
  { ma: 'L3', ten: 'Đội Agent sáu ban', muc: [
    o('KT-AG1', 'Agent CSKH', '—', 'crm-ai + vận hành chăm sóc; mỗi chạm vào sổ có căn cứ, có người duyệt.',
      ['t:may-chu/crm-ai.js', 't:may-chu/van-hanh-cham-soc.js'], 'co', ''),
    o('KT-AG2', 'Agent Tài chính', '—', 'trợ lý tài chính + phiếu thu có duyệt hai người.',
      ['t:may-chu/tro-ly-tai-chinh.js', 'f:ghiPhieuThu'], 'co', ''),
    o('KT-AG3', 'Agent Marketing', '—', 'nội dung tiếp thị qua cổng soát đạo đức.',
      ['t:may-chu/noi-dung-tiep-thi.js', 'f:soatTiepThi'], 'co', ''),
    o('KT-AG4', 'Agent Pháp lý', '—', 'rà soát pháp lý đối chiếu hàm đang chạy + chứng cứ HMAC.',
      ['t:may-chu/phap-ly-rui-ro.js', 't:may-chu/chung-cu.js'], 'co', ''),
    o('KT-AG5', 'Agent R&D', '—', 'tự hoàn thiện + vòng nhà khoa học 0 token mỗi đêm.',
      ['t:may-chu/tu-hoan-thien.js', 'f:docVongKhoaHoc'], 'co', ''),
    o('KT-AG6', 'Agent Bảo vệ', '—', 'thanh tra 6 chu kỳ + trần giám sát + hộp đen.',
      ['t:may-chu/thanh-tra.js', 't:may-chu/giam-sat.js'], 'co', ''),
    o('KT-AG0', 'Khung điều phối chung', '—',
      '100 trợ lý · 8 miền · khoá sở hữu đôi một khác nhau · SOP từng miền · trần tự chủ.',
      ['v:dieu-phoi', 'g:DP_MIEN', 'f:lapKeHoachAgent'], 'co', '')
  ]},
  { ma: 'L4', ten: 'Hệ nghiệp vụ', muc: [
    o('KT-NV1', 'Khách hàng · CRM', 'Twenty · ERPNext',
      'CRM tự xây theo giai đoạn + hồ sơ khách + kênh chăm sóc.', ['v:crm', 'm:may-chu/csdl.sql#hoSoKhach'], 'tuongduong',
      'Khi đội chăm sóc > 20 người cần UI CRM chuẩn ngoài → nhập Twenty tự lưu (self-host), dữ liệu vẫn qua Worker.'),
    o('KT-NV2', 'Tài chính · Kế toán', 'ERPNext · Lago',
      'Thu chi có phiếu hai người · kế toán-thuế · bảng lương · đối chiếu ngân hàng.',
      ['v:phong-tai-chinh', 'v:ke-toan-thue', 'f:doiChieuNganHang'], 'tuongduong',
      'Khi cần tính tiền theo lượng dùng (metered billing) → học mẫu Lago.'),
    o('KT-NV3', 'Marketing', 'Mautic · Listmonk · PostHog',
      'Nội dung có kỳ có duyệt + thư qua cầu nối Gmail/Resend.', ['v:noi-dung-tiep-thi', 'f:thuGuiThu'], 'tuongduong',
      'Khi cần phân tích hành vi trang không định danh → đếm theo trang tự xây (Plausible-mẫu), PostHog sau đó.'),
    o('KT-NV4', 'Văn bản · Pháp lý', 'Documenso · OPA',
      'Ký kết 3 cấp có sổ + bằng chứng điện tử đọc từ nhật ký thật.', ['v:ky-ket', 'v:bang-chung'], 'tuongduong',
      'Khi cần chữ ký điện tử có giá trị pháp lý VN (NĐ 23/2025) → nhà cung cấp chữ ký số được cấp phép, không tự xây.'),
    o('KT-NV5', 'Giải pháp trọn gói đa vai', '—',
      'Kho giải pháp 0 token + SOP từng miền + thư viện tình huống.', ['v:quy-trinh-toan-he', 'g:H16_SOP'], 'co', '')
  ]},
  { ma: 'L5', ten: 'Vận hành nội lực · tăng trưởng', muc: [
    o('KT-VH1', 'Tự vận hành (Self-*)', 'self-healing · self-backup',
      'Tự soát + tự chữa mỗi đêm · sao lưu theo người trên R2 · version bằng git.', ['f:tuSoatVaChua', 'm:may-chu/csdl.sql#hosoAppSaoLuu'], 'co', ''),
    o('KT-VH2', 'R&D X10 / 6 tháng', 'eval · benchmark · học liên tục',
      'Thử mô hình mới trên đề của GITA + vòng khoa học mỗi đêm + mốc nền cải tiến.',
      ['f:thuMauDaTri', 'v:cai-tien'], 'co', ''),
    o('KT-VH3', '1000 chiến lược', 'thư viện + A/B + bandit',
      'Không gian 10×10×10 có mã, chấm ICE.', ['g:H16_CL'], 'chua',
      'A/B và bandit CHƯA có: khi đủ lưu lượng để thử nghiệm có nghĩa thống kê (≥ vài trăm lượt/nhánh/tuần) → thêm đo A/B vào điểm chạm.'),
    o('KT-VH4', 'Thuê ngoài', 'MCP · n8n · nhà cung cấp',
      'Cổng ngoài cố định chống SSRF + ẩn danh Điều 13 + mỗi nhà một khoang.', ['f:guiDeBaiRaNgoai', 'v:ket-noi'], 'tuongduong',
      'MCP khi cần cắm công cụ bên ba theo chuẩn; n8n khi có luồng tự động không cần mã. Cả hai: chỉ sau khi có nhu cầu thật đo được.')
  ]},
  { ma: 'L6', ten: 'Dữ liệu · mã nguồn · đo lường · bảo mật', muc: [
    o('KT-DL1', 'Dữ liệu / thông tin', 'D1 ✓ · Vectorize · pgvector · Qdrant',
      'D1 (SQLite, 93 bảng) + R2; tìm kiếm kho giải pháp bằng từ khoá Jaccard — đủ ở quy mô hiện tại.',
      ['t:may-chu/csdl.sql'], 'tuongduong',
      'Khi kho giải pháp/tri thức vượt vài nghìn mục và Jaccard bắt đầu hụt (đo bằng tỉ lệ "hỏi mới") → Vectorize của Cloudflare, vẫn một nhà cung cấp.'),
    o('KT-DL2', 'Quản trị mã nguồn', 'GitHub ✓ · semantic-release · Biome',
      'GitHub + CI 9 bước + CODEOWNERS; mã thuần JS, không dependency.',
      ['t:.github/workflows/kiem-tra.yml'], 'co',
      'semantic-release khi đội quen quy ước commit; Biome khi cần định dạng tự động — hiện node --check + rà soát đã đủ.'),
    o('KT-DL3', 'Quan sát · đo lường', 'Langfuse · OpenTelemetry · Sentry',
      'Nhật ký audit mọi việc ghi + hộp đen + sổ token từng nhà + trần giám sát.',
      ['v:giam-sat', 'm:may-chu/csdl.sql#soDen', 'm:may-chu/csdl.sql#soTokenDaTri'], 'tuongduong',
      'Sentry/OTel khi hệ vượt một Worker (nhiều dịch vụ cần tracing xuyên); Langfuse khi cần so sánh prompt theo thời gian.'),
    o('KT-DL4', 'Bảo mật nhiều lớp', 'Zero Trust · CodeQL ✓ · Trivy · SBOM',
      'Lá chắn 30 tầng đo bằng CI + CodeQL mỗi tuần + soát bí mật mỗi PR.',
      ['v:la-chan-30', 't:.github/workflows/codeql.yml'], 'tuongduong',
      'Trivy/SBOM: repo KHÔNG có dependency (không package.json) nên chưa có gì để quét — khi nào thêm dependency, thêm Trivy cùng ngày. Zero Trust truy cập nội bộ: khi có đội > 5 người.')
  ]},
  { ma: 'L7', ten: 'Nền tảng chạy', muc: [
    o('KT-NT1', 'Cloudflare', 'Workers ✓ · D1 ✓ · R2 ✓ · Workers AI · Durable Objects · Queues · Workflows · Vectorize',
      'Workers + D1 + R2 đang chạy; Workers AI + Rate Limiting đã khai, bật bằng một dòng.',
      ['m:may-chu/wrangler.toml#name = "gita365"'], 'tuongduong',
      'Durable Objects: khi cần realtime nhiều người cùng sửa. Queues: khi tác vụ nền vượt 30 giây CPU. Workflows: khi tuyến chốt chặn cần bền đa ngày không chờ người bấm.'),
    o('KT-NT2', 'GitHub (mã nguồn · CI/CD)', '—', 'CI mọi PR + deploy tự động + mirror GitHub Pages.',
      ['t:.github/workflows/deploy.yml'], 'co', ''),
    o('KT-NT3', 'Google Drive của Học viện', '—',
      'Tài liệu nguồn + minh chứng giữ nguyên; app trỏ về, không chép.', ['v:kho-tai-lieu'], 'co', '')
  ]}
];

(function () {
  var U = G.U, h = U.h, ic = U.ic;
  var TT_TEN = { co: 'Đã có', tuongduong: 'Tự xây tương đương', chua: 'Chưa — có ngưỡng kích hoạt' };
  var TT_MAU = { co: 'var(--ok)', tuongduong: 'var(--gita-sau)', chua: '#9aa0a6' };
  function veTro(ds) {
    return (ds || []).map(function (x) {
      var k = (G.h16DoTro || function () { return {}; })(x);
      return '<code>' + h(x) + '</code>' + (k.noi === 'may' ? (k.song ? ' ✓' : ' ✗') : '');
    }).join(' ');
  }

  G.VIEWS['kien-truc-hop-nhat'] = function () {
    var lop = G.KT_LOP || [];
    var dem = { co: 0, tuongduong: 0, chua: 0 };
    lop.forEach(function (l) { l.muc.forEach(function (m) { dem[m.tt]++; }); });
    var o = '<div class="hd"><h2>' + ic('map') + ' Kiến trúc hợp nhất — mô hình mục tiêu ↔ mã đang chạy</h2>' +
      '<p class="sub">Hợp nhất sơ đồ mô hình chuẩn doanh nghiệp với GITA. Ba trạng thái: ' +
      '<b style="color:var(--ok)">Đã có</b> (' + dem.co + ') · <b style="color:var(--gita-sau)">Tự xây tương đương</b> (' + dem.tuongduong +
      ') · <b>Chưa — có ngưỡng kích hoạt</b> (' + dem.chua + '). Nguyên tắc: <b>không nhập một mảnh vì nó đẹp trên hình</b> — ' +
      'một mảnh chỉ vào khi chạm ngưỡng đo được, và mọi mảnh đổi được mà không sập hệ (mỗi mảnh một cửa/bảng/khoang riêng).</p></div>';

    /* Vòng lặp tự chủ của sơ đồ gốc, nói bằng mã GITA */
    o += '<div class="card mt" style="border-color:var(--gita-sau)"><b>Vòng lặp tự chủ</b><div class="sm mt">' +
      'Bộ não ra lệnh xuống đội Agent và các hệ nghiệp vụ (<code>lapKeHoachAgent</code>) · mọi hành động qua khung hiến pháp ' +
      '(<code>soatRaNhaCungCap</code> · hàng rào <code>hanh-lang</code>) · kết quả và chỉ số chảy ngược lên ' +
      '(<code>chamDaTri</code> · <code>vongKhoaHoc</code> · <code>docKpiCayTien</code>) nuôi quyết định kế tiếp. ' +
      'Máy đề xuất, chủ hệ quyết (AT5).</div></div>';

    lop.forEach(function (l) {
      o += '<div class="card mt"><b>' + h(l.ma) + ' · ' + h(l.ten) + '</b>' +
        '<table class="tbl sm mt"><tr><th>Mảnh</th><th>Mẫu tham chiếu</th><th>GITA đang chạy</th><th>Trạng thái</th><th>Con trỏ</th><th>Ngưỡng kích hoạt</th></tr>' +
        l.muc.map(function (m) {
          return '<tr><td><b>' + h(m.ten) + '</b></td><td class="tiny muted">' + h(m.mau) + '</td>' +
            '<td class="tiny">' + h(m.gita) + '</td>' +
            '<td><span class="chip" style="color:' + TT_MAU[m.tt] + '">' + TT_TEN[m.tt] + '</span></td>' +
            '<td class="mono tiny">' + (m.tro.length ? veTro(m.tro) : '—') + '</td>' +
            '<td class="tiny muted">' + (m.kichHoat ? h(m.kichHoat) : '—') + '</td></tr>';
        }).join('') + '</table></div>';
    });
    o += '<p class="note hvh-note">Bản as-built (đo từ repo) ở tài liệu KIEN_TRUC_TONG_THE.md · sơ đồ vận hành ở SO_DO_VAN_HANH_TONG_THE.md. ' +
      'Màn này được CI đo trong tools/do-16-he.js — con trỏ chết là đỏ.</p>';
    return o;
  };
})();
