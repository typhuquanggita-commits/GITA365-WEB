/* ═══════════════════════════════════════════════════════════════
   GITA 365 — HỆ THỐNG PHÒNG BAN & VẬN HÀNH CÔNG VIỆC  (Giai đoạn 2)

   Màn "Quản trị hệ thống các phòng ban, vận hành hệ thống công việc".
   Super Admin quản trị; Giám đốc / Quản lý chuyên môn xem (perm
   dh_toan_he · bậc ≤ 4).

   Bám DỮ LIỆU THẬT, không bịa bộ máy:
     · G.H16_HE   — 16 ban chuẩn (mã · tên · icon · màn · tài liệu · còn
                    thiếu · bước kế)
     · G.ROLES    — 15 vai, dùng làm cấp bậc nhân sự của ban
     · G.H16_SOP  — SOP/KPI từng miền (dùng cho báo cáo ban)
   Lớp tổ chức thêm ở đây (PB_MAP): mỗi ban có vai nào phụ trách & nhiệm
   vụ, có Agent nào được phân công (bấm xem lý lịch: vai trò · chức năng ·
   nghiệp vụ · KPI · Skills · phiên bản), có nội quy/văn hoá/tiêu chuẩn.

   Màn của ban (troVao v:) nối thẳng tới màn thật — nhưng vẫn qua
   G.allowed(): ai đủ quyền mới mở được. Bấm một ban → mở hồ sơ ban bên
   dưới (G.S.pbBan). Bấm một Agent → mở lý lịch (modal).

   MÀU QUY ƯỚC: mỗi ban một màu tầng (t1..t5) luân phiên để phân biệt;
   nhân sự tô theo màu vai (ROLES[].c).
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G; G.VIEWS = G.VIEWS || {};
(function(){
  var U = G.U, h = U.h, ic = U.ic;

  /* Lớp tổ chức cho 16 ban. Khoá theo mã H16. `ns` = vai phụ trách +
     nhiệm vụ; `ag` = Agent được phân công (lý lịch đầy đủ); `nq` = nội
     quy/văn hoá/tiêu chuẩn. Màn & tài liệu & KPI lấy từ H16_HE/H16_SOP. */
  var PB_MAP = {
    H01:{ c:'--t1',
      ns:[['Super Admin',1,'Giữ chìa khoá gốc; cấp & thu quyền toàn hệ; chốt cấu hình'],
          ['Admin hệ thống',2,'Dựng chuẩn phân quyền; mở tài khoản; vận hành vòng đời tài khoản']],
      ag:[{t:'Trợ lý Phân quyền',vt:'Gác cổng quyền',cn:'Soát & đề xuất cấp quyền theo vai–cấp–tầng',nv:'Ma trận vai × quyền; phát hiện quyền thừa',kpi:'Quyền cấp có lý do · quyền thừa = 0',sk:['RBAC','Kiểm toán quyền','ABAC (mẫu)'],pb:'v2.3'}],
      nq:['Một cửa chỉ một chủ quyền','Mọi lần cấp quyền có lý do & hạn soi lại','Không cửa hậu — mọi cửa tự kiểm cổng'] },
    H02:{ c:'--t1',
      ns:[['Phân tích dữ liệu',12,'Đọc mô thức, dựng chỉ mục, canh toàn vẹn dữ liệu'],
          ['Admin hệ thống',2,'Đồng bộ kho, xử lý yêu cầu xoá dữ liệu']],
      ag:[{t:'Trợ lý Dữ liệu',vt:'Người giữ sổ sạch',cn:'Chỉ mục & tìm kiếm trên dữ liệu đã giải mã (không rời máy)',nv:'Dựng chỉ mục toàn văn phía khách',kpi:'Dữ liệu lệch = 0 · tìm kiếm < 200ms',sk:['Chỉ mục toàn văn','Toàn vẹn dữ liệu','Đồng bộ'],pb:'v1.8'}],
      nq:['Dữ liệu khách không rời máy khi chưa giải mã','Xoá dữ liệu xử lý đúng hạn luật'] },
    H03:{ c:'--t3',
      ns:[['Admin hệ thống',2,'Vận hành nội lực: tự vá, tự nâng cấp, giám sát sức khoẻ hệ'],
          ['Quản lý chuyên môn',4,'Theo dõi dòng chảy công việc, đo lường vận hành']],
      ag:[{t:'Trợ lý Vận hành',vt:'Thợ máy của hệ',cn:'Đo sức khoẻ hệ, đề xuất nâng cấp, tự soát cứu hệ',nv:'Giám sát & tự chữa theo ngưỡng',kpi:'Thời gian phát hiện sự cố · số lần tự chữa thành công',sk:['Giám sát','Tự phục hồi','Phát hành'],pb:'v2.0'}],
      nq:['Phát hành có kiểm trước khi lên','Mọi thay đổi có nhật ký'] },
    H04:{ c:'--t5',
      ns:[['Chuyên gia tư vấn',11,'Tư vấn & chăm sóc khách; thao tác CRM (khi được cấp)'],
          ['Coach',7,'Đồng hành khách theo hành trình 5 tầng'],
          ['Quản lý chuyên môn',4,'Giữ chuẩn nghề chăm sóc, nghiệm thu chuyên môn']],
      ag:[{t:'Trợ lý CRM',vt:'Người nhắc chăm sóc',cn:'Nhắc hẹn, chấm điểm sức khoẻ khách, gợi kịch bản',nv:'Dòng chảy khách: mới · cũ · tái · chăm lại',kpi:'Tỉ lệ chốt · lượt chăm đúng nhịp · khách rời giảm',sk:['Chấm sức khoẻ khách','Nhắc nhịp','Kịch bản chăm sóc'],pb:'v3.1'},
          {t:'Trợ lý Assessment',vt:'Người chẩn đoán',cn:'Chạy chẩn đoán Tầng 1, phân hạng khách',nv:'Chẩn đoán đầu vào, định vị tầng',kpi:'Chẩn đoán có bằng chứng · phân hạng đúng',sk:['Chẩn đoán','Phân hạng VIP','Định vị tầng'],pb:'v1.5'}],
      nq:['Giữ bí mật thông tin khách tuyệt đối','Tuân thủ Hiến pháp; vi phạm → khoá tài khoản','Mọi lượt xem khách có quyền hợp lệ'] },
    H05:{ c:'--t4',
      ns:[['Giám đốc',3,'Cầm bảy con số CEO, chịu trách nhiệm tăng trưởng'],
          ['Admin hệ thống',2,'Vận hành thu–chi–lương–thuế, đối soát']],
      ag:[{t:'Trợ lý Tài chính',vt:'Người giữ sổ kép',cn:'Ghi phiếu thu, đối chiếu ngân hàng, bảng lương, báo cáo thuế',nv:'Bất biến kế toán: nợ = có',kpi:'Chi vượt trần = 0 · tuần chốt sổ không lỗi',sk:['Kế toán kép','Đối soát','Bảng lương'],pb:'v2.6'}],
      nq:['Nợ = có trên mọi bút toán','Chi đúng thang duyệt','Mọi đổi giá có sổ'] },
    H06:{ c:'--t2',
      ns:[['Quản lý chuyên môn',4,'Giữ chuẩn thương hiệu & nội dung tiếp thị'],
          ['Admin hệ thống',2,'Vận hành xưởng nội dung, kiến trúc thị giác']],
      ag:[{t:'Trợ lý Marketing',vt:'Người dựng chuỗi WOW',cn:'Soạn nội dung, soát luật thương hiệu, dựng chuỗi lan toả',nv:'Chuỗi WOW → Fan → Lan toả',kpi:'Bài trả về vì sai luật thương hiệu (giảm dần)',sk:['Nội dung','Luật thương hiệu','Thị giác'],pb:'v2.2'}],
      nq:['Nội dung đúng luật thương hiệu','Đếm theo trang — không theo dõi cá nhân'] },
    H07:{ c:'--t1',
      ns:[['Admin hệ thống',2,'Giữ hiến pháp, văn bản chuẩn, rà soát pháp lý'],
          ['Super Admin',1,'Chốt hiến pháp 13 điều — năm điều không ai được sửa']],
      ag:[{t:'Trợ lý Pháp lý',vt:'Người canh hiến pháp',cn:'Soát tuân thủ, canh mọi cửa ra ngoài qua soát ẩn danh',nv:'Luật-thành-mã: cổng tuân thủ',kpi:'Cửa ra ngoài lộ danh tính = 0',sk:['Tuân thủ','Rà soát pháp lý','Ký kết'],pb:'v1.9'}],
      nq:['Hiến pháp một nơi, không bản thứ hai','Mọi cửa ra ngoài qua soát ẩn danh'] },
    H08:{ c:'--t2',
      ns:[['Super Admin',1,'Cấp quyền AI, điều phối 100 trợ lý'],
          ['Phân tích dữ liệu',12,'Đọc sổ audit, chấm KPI Agent']],
      ag:[{t:'Bộ não điều phối',vt:'Đầu điều phối chung',cn:'Phân việc đúng trợ lý theo khoá sở hữu; miền chồng lấn thì phân xử',nv:'Điều phối không bỏ qua cổng',kpi:'Việc trùng chủ = 0 · lượt vượt cổng = 0',sk:['Điều phối','Phân xử miền','Kiểm cổng'],pb:'v4.0'},
          {t:'Agent 8 năng lực',vt:'Thợ chuyên miền',cn:'Chạy SOP trên cửa thật của đúng miền, bàn giao chéo',nv:'SOP từng miền, KPI đọc từ sổ audit',kpi:'SOP đúng cửa · bàn giao có biên nhận',sk:['SOP','Teamwork','Tự hoàn thiện'],pb:'v2.8'}],
      nq:['Một cửa một trợ lý sở hữu','Miền chồng lấn thì Bộ não phân xử','Điều phối không bỏ qua cổng'] },
    H09:{ c:'--t3',
      ns:[['Super Admin',1,'Giữ bộ não trung tâm, bảng điều khiển, bản tin sáng'],
          ['Admin hệ thống',2,'Vận hành sổ lệnh có trạng thái']],
      ag:[{t:'Trợ lý Bộ não',vt:'Cố vấn đa trí',cn:'Tạo tuyến đa trí, chạy chặng, đo chắc định tuyến',nv:'Sổ lệnh chung có trạng thái',kpi:'Lệnh có trạng thái & hạn soi lại',sk:['Đa trí','Định tuyến','Điều hành'],pb:'v3.3'}],
      nq:['Một bộ não — không hiến pháp thứ hai','Quyết định có ghi lý do & hạn soi lại'] },
    H10:{ c:'--t3',
      ns:[['Admin hệ thống',2,'Giữ cron đêm, lịch khai báo được, đo sức khoẻ']],
      ag:[{t:'Trợ lý Tự chủ',vt:'Người canh đêm',cn:'Chạy chuỗi việc đêm theo khai báo, đo bằng sức khoẻ hệ',nv:'Lịch khai báo được, không cứng',kpi:'Việc đêm chạy đủ · lỗi âm thầm = 0',sk:['Lập lịch','Tự vận hành','Đo sức khoẻ'],pb:'v1.4'}],
      nq:['Giữ cron đơn, thêm việc bằng khai báo'] },
    H11:{ c:'--t4',
      ns:[['Giám đốc',3,'Chốt đối tác & mức dịch vụ (SLA)'],
          ['Admin hệ thống',2,'Mỗi nhà cung cấp một cửa, một cầu dao']],
      ag:[{t:'Trợ lý Đối tác',vt:'Người giữ cầu dao',cn:'Gửi đề bài ra ngoài qua soát ẩn danh, quản cầu dao từng nhà',nv:'Mỗi nhà cung cấp một khoang',kpi:'Lộ danh tính khi gửi ngoài = 0 · SLA đạt',sk:['Cầu dao','Ẩn danh','SLA'],pb:'v1.7'}],
      nq:['Ra ngoài phải qua soát ẩn danh','Mỗi nhà một cầu dao riêng'] },
    H12:{ c:'--t5',
      ns:[['Quản lý chuyên môn',4,'Giữ khuôn giải pháp chung cho toàn hệ'],
          ['Chuyên gia tư vấn',11,'Xử lý ca theo quy trình'],
          ['Mentor',9,'Gỡ nút thắt ca khó']],
      ag:[{t:'Trợ lý Giải pháp',vt:'Người dựng khuôn',cn:'Một khuôn: tình huống → chẩn đoán → giải pháp → kết quả → bài học',nv:'Thư viện tình huống một khuôn chung',kpi:'Ca đóng có bài học ghi sổ',sk:['Xử lý ca','Chuẩn hoá','Bài học'],pb:'v2.1'}],
      nq:['Mọi ca theo một khuôn chung','Ca đóng bằng bằng chứng, không bằng cảm giác'] },
    H13:{ c:'--t2',
      ns:[['Phân tích dữ liệu',12,'Chụp mốc nền, sổ thí nghiệm, so tỉ số 6 tháng'],
          ['Quản lý chuyên môn',4,'Chọn cải tiến ưu tiên']],
      ag:[{t:'Trợ lý Nghiên cứu',vt:'Người giữ mốc nền',cn:'Chụp mốc nền, gắn mã chiến lược cho thí nghiệm, so khi hết chu kỳ',nv:'Sổ thí nghiệm X10 theo chu kỳ 6 tháng',kpi:'Thí nghiệm có mốc nền & kết luận',sk:['Thí nghiệm','Đo tỉ số','X10'],pb:'v1.2'}],
      nq:['Cải tiến phải có mốc nền để so'] },
    H14:{ c:'--t1',
      ns:[['Giám đốc',3,'Chọn chiến lược theo điểm ICE'],
          ['Quản lý chuyên môn',4,'Chấm & chứng minh chiến lược']],
      ag:[{t:'Trợ lý Chiến lược',vt:'Người chấm ICE',cn:'Dựng không gian 1000 chiến lược có mã, chấm ICE',nv:'10×10×10 câu hỏi có mã',kpi:'Chiến lược "chứng minh" chỉ khi có bằng chứng',sk:['ICE','Bản đồ chiến lược','Thẻ điểm cân bằng'],pb:'v1.0'}],
      nq:['Chỉ "chứng minh" khi có bằng chứng'] },
    H15:{ c:'--t1',
      ns:[['Super Admin',1,'Chốt cổng PR, lá chắn 30 tầng, quét bảo mật'],
          ['Admin hệ thống',2,'Giữ mã nguồn, mã định dạng, rà soát đủ ruột']],
      ag:[{t:'Trợ lý Mã nguồn',vt:'Người gác cổng PR',cn:'Cổng PR, quét bảo mật mã, rà soát đủ ruột 100%',nv:'Kiểm tra trước khi hợp nhất',kpi:'PR qua cổng · lỗ bảo mật mã = 0',sk:['Cổng PR','Quét bảo mật','Rà soát đủ'],pb:'v2.4'}],
      nq:['Không hợp nhất khi chưa qua cổng kiểm','Bí mật không nằm trong mã'] },
    H16:{ c:'--t3',
      ns:[['Giám đốc',3,'Canh hai trần chi phí thật & sức chứa'],
          ['Admin hệ thống',2,'Đòn bẩy sao lưu, theo dõi tài nguyên']],
      ag:[{t:'Trợ lý Chi phí',vt:'Người canh trần',cn:'Theo dõi tài nguyên, cảnh báo khi gần trần D1/R2',nv:'Hai trần: 100k ghi/ngày · 1 triệu/tháng',kpi:'Chạm trần có cảnh báo sớm · chi phí/tài khoản giảm',sk:['Theo dõi tài nguyên','Cảnh báo trần','Tối ưu chi phí'],pb:'v1.6'}],
      nq:['Giữ chi phí 0đ tới 300k tài khoản nếu có thể'] }
  };

  function banList(){ return (G.H16_HE || []).map(function(b){
    return { b:b, m:PB_MAP[b.ma] || {c:'--t1',ns:[],ag:[],nq:[]} };
  }); }

  /* Màn thật & tài liệu của ban — bóc từ troVao của H16_HE. */
  function manCuaBan(b){ return (b.troVao||[]).filter(function(x){return x.indexOf('v:')===0;})
    .map(function(x){return x.slice(2);}); }
  function khoCuaBan(b){ return (b.troVao||[]).filter(function(x){return x.indexOf('d:')===0;})
    .map(function(x){return x.slice(2).replace(/^docs\//,'');}); }

  function stat(k,v,d){ return U.stat ? U.stat({k:k,v:v,d:d}) : '<div class="card pad-sm"><b>'+h(v)+'</b> '+h(k)+'</div>'; }

  /* ── Lý lịch Agent (modal) ── */
  G.pbAgent = function(banMa, idx){
    var m = PB_MAP[banMa]; if(!m || !m.ag || !m.ag[idx]) return;
    var b = (G.H16_HE||[]).filter(function(x){return x.ma===banMa;})[0] || {ten:banMa};
    var a = m.ag[idx], c = m.c || '--t1';
    var html =
      '<div class="pb-ald" style="--c:var('+c+')">'+
        '<div class="pb-alh">'+ic('orbit')+'<div><b>'+h(a.t)+'</b>'+
          '<span>'+h(a.vt)+' · Ban '+h(b.ten)+' · '+h(a.pb)+'</span></div></div>'+
        '<div class="pb-alg">'+
          '<div class="pb-alr"><span>Chức năng</span><p>'+h(a.cn)+'</p></div>'+
          '<div class="pb-alr"><span>Nghiệp vụ chuyên môn</span><p>'+h(a.nv)+'</p></div>'+
          '<div class="pb-alr"><span>KPI</span><p>'+h(a.kpi)+'</p></div>'+
          '<div class="pb-alr"><span>Skills</span><p>'+a.sk.map(function(s){return '<span class="pb-sk">'+h(s)+'</span>';}).join('')+'</p></div>'+
          '<div class="pb-alr"><span>Phiên bản nâng cấp</span><p><b class="mono">'+h(a.pb)+'</b></p></div>'+
        '</div></div>';
    if(U.modal) U.modal(html);
  };

  /* ── Chọn ban ── */
  G.pbMoBan = function(ma){ G.S.pbBan = ma; if(G.render) G.render(); };

  function theBan(o, on){
    var b=o.b, m=o.m, man=manCuaBan(b), c=m.c||'--t1';
    return '<button class="pb-ban'+(on?' on':'')+'" data-pbban="'+h(b.ma)+'" style="--c:var('+c+')">'+
      '<span class="pb-ic">'+ic(b.ic||'grid')+'</span>'+
      '<span class="pb-bt"><b>'+h(b.ten)+'</b>'+
        '<span class="pb-bm">'+h(b.ma)+' · '+(m.ns?m.ns.length:0)+' vai · '+(m.ag?m.ag.length:0)+' Agent · '+man.length+' màn</span></span>'+
      ic('chev','cv')+'</button>';
  }

  function hoSoBan(ma){
    var b=(G.H16_HE||[]).filter(function(x){return x.ma===ma;})[0];
    var m=PB_MAP[ma]; if(!b||!m) return '';
    var c=m.c||'--t1';
    var man=manCuaBan(b), kho=khoCuaBan(b);
    /* KPI ban: nối từ H16_SOP không map 1:1 theo mã, nên dùng baocao của
       ban + bước kế (ke) + còn thiếu (trong) từ H16_HE làm báo cáo thật. */
    var rid='pbtab-'+ma;
    function tab(k,lbl,on){ return '<input type="radio" name="'+rid+'" id="'+rid+'-'+k+'"'+(on?' checked':'')+'>'+
      '<label for="'+rid+'-'+k+'" class="pb-tab">'+h(lbl)+'</label>'; }

    var nsRows = (m.ns||[]).map(function(r,i){
      var role=(G.ROLES?Object.keys(G.ROLES).map(function(k){return G.ROLES[k];}):[]).filter(function(x){return x.n===r[0];})[0];
      var col=role?role.c:'var(--gita)';
      return '<tr><td class="mono dim">'+(i+1)+'</td>'+
        '<td><span class="pb-vai" style="--vc:'+col+'">'+h(r[0])+'</span></td>'+
        '<td class="mono">Bậc '+h(r[1])+'</td>'+
        '<td>'+h(r[2])+'</td></tr>';
    }).join('');

    var agCards = (m.ag||[]).map(function(a,i){
      return '<button class="pb-ag" data-pbag="'+h(ma)+'" data-pbagi="'+i+'">'+
        ic('orbit')+'<span class="pb-agt"><b>'+h(a.t)+'</b><span>'+h(a.vt)+' · '+h(a.pb)+'</span></span>'+
        '<span class="pb-agk">'+h(a.kpi)+'</span></button>';
    }).join('');

    var manChips = man.map(function(v){
      var it=G.navItem?G.navItem(v):null, ten=it?(G.iname?G.iname(it):it.t):v;
      var mo=G.allowed?G.allowed(v):true;
      return mo ? '<button class="pb-man" data-v="'+h(v)+'">'+ic(it&&it.ic||'grid','w-3 h-3')+h(ten)+'</button>'
                : '<span class="pb-man off">'+ic('lock','w-3 h-3')+h(ten)+'</span>';
    }).join('');

    var bcList = [].concat(
      ['<li>'+ic('alert','w-3 h-3')+'<b>Còn thiếu:</b> '+h(b.trong||'—')+'</li>'],
      ['<li>'+ic('arrow','w-3 h-3')+'<b>Bước kế:</b> '+h(b.ke||'—')+'</li>']
    ).join('');

    return '<div class="pb-hs" style="--c:var('+c+')">'+
      '<div class="pb-hsh"><span class="pb-ic lg">'+ic(b.ic||'grid')+'</span>'+
        '<div><b>'+h(b.ten)+'</b><span class="mono dim">Ban '+h(b.ma)+'</span></div>'+
        '<button class="btn ghost sm" data-pbban="">'+ic('arrow','w-3 h-3')+'Đóng</button></div>'+
      '<div class="pb-tabs">'+
        tab('ns','Nhân sự',true)+tab('ag','Agent')+tab('man','Màn & công cụ')+
        tab('bc','Báo cáo')+tab('kho','Kho tài liệu')+tab('nq','Nội quy')+
        '<div class="pb-pan pb-ns">'+
          '<table class="pb-tb"><thead><tr><th>STT</th><th>Vai</th><th>Cấp bậc</th><th>Nhiệm vụ</th></tr></thead>'+
          '<tbody>'+(nsRows||'<tr><td colspan="4" class="dim">Chưa gán nhân sự</td></tr>')+'</tbody></table></div>'+
        '<div class="pb-pan"><div class="pb-ags">'+(agCards||'<p class="dim sm">Chưa phân công Agent</p>')+'</div></div>'+
        '<div class="pb-pan pb-manp"><div class="pb-mans">'+(manChips||'<span class="dim sm">—</span>')+'</div>'+
          '<p class="tiny dim mt">Màn mở được tô màu; màn khoá (ngoài quyền của anh/chị) mờ đi — đúng cấp–tầng–vai.</p></div>'+
        '<div class="pb-pan pb-bcp"><ul class="pb-bc">'+bcList+'</ul></div>'+
        '<div class="pb-pan pb-khop">'+(kho.length?('<ul class="pb-kho">'+kho.map(function(d){return '<li>'+ic('book','w-3 h-3')+h(d)+'</li>';}).join('')+'</ul>'):'<p class="dim sm">—</p>')+'</div>'+
        '<div class="pb-pan pb-nqp"><ul class="pb-nq">'+(m.nq||[]).map(function(x){return '<li>'+ic('shield','w-3 h-3')+h(x)+'</li>';}).join('')+'</ul></div>'+
      '</div></div>';
  }

  G.VIEWS['phong-ban'] = function(){
    var ds = banList();
    var tongNS=0, tongAg=0;
    ds.forEach(function(o){ tongNS+=(o.m.ns?o.m.ns.length:0); tongAg+=(o.m.ag?o.m.ag.length:0); });
    var chon = G.S.pbBan && PB_MAP[G.S.pbBan] ? G.S.pbBan : '';

    var head = U.ph ? U.ph({eyebrow:'QUẢN TRỊ VẬN HÀNH', ic:'grid', grad:1,
      t:'Hệ thống Phòng ban', lead:'Mười sáu ban của GITA 365 — nhân sự, Agent, báo cáo, kho tài liệu và nội quy, gom về một chỗ để vận hành bài bản từ A đến Z.'})
      : '<h2>Hệ thống Phòng ban</h2>';

    var thongke = '<div class="grid g3 mb">'+
      stat('Phòng ban', String(ds.length), 'mười sáu hệ')+
      stat('Vai phụ trách', String(tongNS), 'theo cấp–tầng')+
      stat('Agent phân công', String(tongAg), 'bấm xem lý lịch')+'</div>';

    var luoi = '<div class="pb-luoi">'+ds.map(function(o){return theBan(o, o.b.ma===chon);}).join('')+'</div>';

    var hoso = chon ? hoSoBan(chon)
      : '<div class="card center pad" style="margin-top:14px"><p class="dim sm">'+ic('grid','w-5 h-5')+'<br>Bấm một ban ở trên để mở hồ sơ: nhân sự · Agent · báo cáo · kho · nội quy.</p></div>';

    return head + thongke +
      (U.sec?U.sec('Mười sáu ban','Bấm để mở hồ sơ từng ban'):'<h3>Mười sáu ban</h3>') +
      luoi + hoso;
  };

})();
