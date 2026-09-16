/* ═══════════════════════════════════════════════════════════════
   GITA 365 · v8.8 — NHẬT KÝ TỪNG VỊ TRÍ · CUỘC THI VIẾT

   Hai màn, một nguồn dữ liệu. Nhật ký nuôi cuộc thi: số ngày đã ghi
   quyết định mốc nào mở ra, và sổ nhật ký chính là nguyên liệu để viết
   bài. Không ghi thì tới ngày thứ 90 ngồi nhớ, và nhớ thì chỉ nhớ được
   tuần vừa rồi.

   Dữ liệu nằm trong hồ sơ riêng của tài khoản (G.S.nhatky, G.S.baithi)
   và đi lên máy chủ theo đường đồng bộ TỪNG TRƯỜNG khoá theo uid —
   không đi qua cụm cài đặt dùng chung.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;

(function(){
var U = G.U, h = U.h, ic = U.ic;
G.VIEWS = G.VIEWS || {};

/* ─── Kho riêng của tài khoản ─── */
function nk(){
  if(!G.S) return {};
  if(!G.S.nhatky || typeof G.S.nhatky !== 'object') G.S.nhatky = {};
  return G.S.nhatky;
}
function bt(){
  if(!G.S) return {};
  if(!G.S.baithi || typeof G.S.baithi !== 'object') G.S.baithi = {};
  return G.S.baithi;
}
function ghiNK(k, v){
  nk()[k] = v;
  if(G.danhDau) G.danhDau('nhatky', k);
  if(G.save) G.save();
}
function ghiBT(k, v){
  bt()[k] = v;
  if(G.danhDau) G.danhDau('baithi', k);
  if(G.save) G.save();
}

/* ─── Mốc thời gian ─── */
function haiSo(n){ return (n < 10 ? '0' : '') + n; }
function maNgay(d){
  d = d || new Date();
  return 'N' + d.getFullYear() + '-' + haiSo(d.getMonth()+1) + '-' + haiSo(d.getDate());
}
function maThang(d){
  d = d || new Date();
  return 'M' + d.getFullYear() + '-' + haiSo(d.getMonth()+1);
}
/* Tuần ISO — dùng thứ Năm trong tuần làm mốc, cách chuẩn và không lệch cuối năm */
function maTuan(d){
  d = new Date(d || new Date());
  d.setHours(0,0,0,0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  var d1 = new Date(d.getFullYear(), 0, 4);
  var tuan = 1 + Math.round(((d - d1) / 864e5 - 3 + ((d1.getDay() + 6) % 7)) / 7);
  return 'T' + d.getFullYear() + '-W' + haiSo(tuan);
}
G.nkMaNgay = maNgay; G.nkMaTuan = maTuan; G.nkMaThang = maThang;

/* ─── Ngày bắt đầu hành trình ─── */
G.nkNgayBatDau = function(){
  var k = nk().__batdau;
  if(!k){
    k = maNgay().slice(1);
    nk().__batdau = k;
    if(G.danhDau) G.danhDau('nhatky', '__batdau');
    if(G.save) G.save();
  }
  return k;
};
G.nkSoNgayDaDi = function(){
  var b = new Date(G.nkNgayBatDau() + 'T00:00:00');
  var n = new Date(); n.setHours(0,0,0,0);
  return Math.max(1, Math.round((n - b) / 864e5) + 1);
};

/* ─── Đếm ─── */
function coGhi(o){
  if(!o || typeof o !== 'object') return false;
  return Object.keys(o).some(function(k){ return String(o[k] || '').trim().length > 0; });
}
G.nkDem = function(nhip){
  var d = nk(), c = nhip === 'ngay' ? 'N' : (nhip === 'tuan' ? 'T' : 'M');
  return Object.keys(d).filter(function(k){ return k.charAt(0) === c && coGhi(d[k]); }).length;
};
/* Chuỗi ngày liên tiếp tính ngược từ hôm nay */
G.nkChuoi = function(){
  var d = nk(), n = 0, t = new Date();
  for(var i = 0; i < 400; i++){
    var x = new Date(t); x.setDate(t.getDate() - i);
    if(coGhi(d[maNgay(x)])) n++;
    else if(i > 0) break;              /* hôm nay chưa ghi thì chuỗi vẫn tính từ hôm qua */
    else if(i === 0) continue;
  }
  return n;
};

/* ─── Cấp vị trí: dùng chung cách xếp của kho chuyện ─── */
function cap(){ return (G.chCapCuaToi && G.chCapCuaToi()) || 'PH'; }
function oCua(nhip){
  var b = (G.NK_O || {})[cap()] || (G.NK_O || {}).PH || {};
  return b[nhip] || [];
}
function nhipObj(ma){
  return (G.NK_NHIP || []).filter(function(x){ return x.ma === ma; })[0] || {ten:ma, c:'var(--gita)', ic:'sun'};
}

/* ═══════════════ MÀN NHẬT KÝ ═══════════════ */
var nhipDang = 'ngay';
var xemLai = 0;         /* xem lại bao nhiêu kỳ trước */

function khoaKy(nhip, lui){
  var d = new Date();
  if(nhip === 'ngay'){ d.setDate(d.getDate() - lui); return maNgay(d); }
  if(nhip === 'tuan'){ d.setDate(d.getDate() - lui * 7); return maTuan(d); }
  d.setMonth(d.getMonth() - lui); return maThang(d);
}
function tenKy(nhip, lui){
  if(nhip === 'ngay') return lui === 0 ? 'Hôm nay' : (lui === 1 ? 'Hôm qua' : khoaKy('ngay', lui).slice(1));
  if(nhip === 'tuan') return lui === 0 ? 'Tuần này' : (lui === 1 ? 'Tuần trước' : khoaKy('tuan', lui).slice(1));
  return lui === 0 ? 'Tháng này' : (lui === 1 ? 'Tháng trước' : khoaKy('thang', lui).slice(1));
}

G.VIEWS['nhat-ky-vi-tri'] = function(){
  var c = cap();
  var capObj = ((G.CH_CAP || []).filter(function(x){ return x.ma === c; })[0]) || {ten:c};
  var soNgay = G.nkDem('ngay'), soTuan = G.nkDem('tuan'), soThang = G.nkDem('thang');
  var chuoi = G.nkChuoi(), daDi = G.nkSoNgayDaDi();

  var o = U.ph({eyebrow:'MỌI VỊ TRÍ ĐỀU CÓ SỔ · NGÀY · TUẦN · THÁNG', ic:'book', grad:1,
    t: c === 'HS' ? 'Sổ tay của em' : (c === 'PH' ? 'Sổ tay của nhà mình' : 'Sổ tay nghề của tôi'),
    lead: c === 'HS'
      ? 'Ghi ba dòng mỗi tối. Không cần hay, không ai chấm điểm. Dòng "hôm nay em quên" cũng là dữ liệu thật — '+
        'và một tháng sau đọc lại, chính dòng đó cho em biết mình hay tuột vào hôm nào.'
      : c === 'PH'
      ? 'Ghi ba dòng mỗi tối. Một tháng sau đọc lại, anh chị sẽ thấy nhà mình hay căng vào hôm nào, giờ nào — '+
        'thứ mà ngồi nhớ thì không bao giờ thấy.'
      : 'Sổ nghề: ghi trong ngày, nhìn lại mỗi tuần, tổng kết mỗi tháng. Đây cũng là nguyên liệu cho bài dự thi '+
        'ở các mốc 7 · 21 · 90 · 365 ngày.'});

  o += '<div class="row wrap mt2" style="gap:12px">'+
    [[String(daDi), 'NGÀY ĐÃ ĐI', 'var(--gita)'],
     [String(soNgay), 'NGÀY ĐÃ GHI', soNgay ? 'var(--ok)' : 'var(--ink-4)'],
     [String(chuoi), 'CHUỖI LIÊN TIẾP', chuoi >= 7 ? 'var(--ok)' : 'var(--ink-4)'],
     [soTuan + ' · ' + soThang, 'TUẦN · THÁNG ĐÃ TỔNG KẾT', 'var(--gita)']]
    .map(function(x){
      return '<div class="card" style="flex:1;min-width:150px;text-align:center">'+
        '<b style="font-size:21px;color:'+x[2]+'">'+h(x[0])+'</b>'+
        '<div class="tiny up muted mt">'+h(x[1])+'</div></div>';
    }).join('')+'</div>';

  /* Ba nhịp */
  o += U.sec('BA NHỊP GHI', 'Sổ này viết riêng cho vai ' + capObj.ten + ' — ô ghi khác nhau theo từng vị trí');
  o += '<div class="row wrap" style="gap:10px">'+ (G.NK_NHIP || []).map(function(n){
    var on = nhipDang === n.ma;
    return '<button class="card" data-nknhip="'+h(n.ma)+'" style="flex:1;min-width:220px;text-align:left;'+
      'cursor:pointer;border-color:'+(on ? n.c : 'var(--line)')+';'+(on ? 'background:'+n.c+'0E' : '')+'">'+
      '<div class="row" style="gap:8px;align-items:center">'+ic(n.ic,'w-4 h-4')+
        '<b style="font-size:16px;color:'+n.c+'">'+h(n.ten)+'</b></div>'+
      '<p class="tiny mt" style="line-height:1.6">'+h(n.y)+'</p>'+
      '<p class="tiny mt muted" style="line-height:1.55">'+h(n.nhac)+'</p></button>';
  }).join('') +'</div>';

  /* Bảng ghi của kỳ đang chọn */
  var N = nhipObj(nhipDang);
  var khoa = khoaKy(nhipDang, xemLai);
  var duLieu = nk()[khoa] || {};
  var os = oCua(nhipDang);

  o += U.sec(N.ten.toUpperCase() + ' · ' + tenKy(nhipDang, xemLai).toUpperCase(),
    xemLai ? 'Đang xem lại kỳ trước — sửa được, vì ghi muộn còn hơn không ghi' : 'Ghi xong bấm Lưu');

  o += '<div class="card">';
  os.forEach(function(x){
    var v = duLieu[x.k] == null ? '' : duLieu[x.k];
    o += '<div class="mt2">'+
      '<label class="tiny up muted" for="nk_'+h(x.k)+'">'+h(x.t)+'</label>'+
      (x.ngan
        ? '<input id="nk_'+h(x.k)+'" class="inp mt" data-nko="'+h(x.k)+'" value="'+h(v)+'" placeholder="'+h(x.g||'')+'" style="width:100%">'
        : '<textarea id="nk_'+h(x.k)+'" class="inp mt" data-nko="'+h(x.k)+'" rows="'+(x.dong||2)+'" '+
          'placeholder="'+h(x.g||'')+'" style="width:100%;line-height:1.65;resize:vertical">'+h(v)+'</textarea>')+
    '</div>';
  });
  o += '<div class="row mt2" style="gap:9px;flex-wrap:wrap">'+
    '<button class="btn pri sm" data-nkluu="'+h(khoa)+'">'+ic('check','w-3 h-3')+' Lưu '+h(tenKy(nhipDang, xemLai).toLowerCase())+'</button>'+
    '<button class="btn ghost sm" data-nklui="1">← Kỳ trước</button>'+
    (xemLai ? '<button class="btn ghost sm" data-nklui="0">Về kỳ này</button>' : '')+
  '</div></div>';

  /* Đọc lại — chỗ sổ mới có giá trị */
  var dsCu = [];
  for(var i = 1; i <= (nhipDang === 'ngay' ? 14 : 6); i++){
    var k2 = khoaKy(nhipDang, i), v2 = nk()[k2];
    if(coGhi(v2)) dsCu.push({k:k2, ten:tenKy(nhipDang, i), v:v2});
  }
  o += U.sec('ĐỌC LẠI', dsCu.length ? dsCu.length + ' kỳ đã ghi — đọc lại là chỗ sổ này mới có giá trị'
                                    : 'Chưa có kỳ nào đã ghi');
  if(!dsCu.length){
    o += '<div class="card" style="background:var(--phu-1)">'+
      '<p class="sm" style="line-height:1.75">Sổ chưa có gì để đọc lại. Điều đó bình thường ở ngày đầu.\n'+
      'Ghi được bảy kỳ thì phần này bắt đầu nói cho mình biết những thứ mà ngồi nhớ không bao giờ thấy: '+
      'hay tuột vào hôm nào, hay căng vào giờ nào, và điều gì thật sự làm mọi thứ khác đi.</p></div>';
  } else {
    dsCu.forEach(function(x){
      o += '<div class="card mt2">'+
        '<b class="sm">'+h(x.ten)+'</b>'+
        os.map(function(f){
          var v = String(x.v[f.k] || '').trim();
          if(!v) return '';
          return '<div class="mt" style="line-height:1.65"><span class="tiny up muted">'+h(f.t)+'</span>'+
            '<div class="sm">'+U.nl(v)+'</div></div>';
        }).join('')+
      '</div>';
    });
  }

  o += '<div class="card mt2" style="border-color:var(--gita-vien-1)">'+
    '<b>'+ic('quote','w-4 h-4')+' Vì sao phải ghi</b>'+
    '<p class="sm dim mt" style="line-height:1.75">Không ai nhớ nổi ba mươi ngày. Người ta chỉ nhớ tuần vừa rồi, '+
    'và tuần vừa rồi thì luôn có vẻ giống mọi tuần. Sổ ghi là cách duy nhất để một tháng sau nhìn ra mô thức '+
    'của chính mình — và mô thức là thứ sửa được, còn cảm giác thì không.</p>'+
    '<p class="sm dim mt" style="line-height:1.75">Sổ này cũng là nguyên liệu cho bài dự thi ở các mốc '+
    '7 · 21 · 90 · 365 ngày. Người có sổ thì mở ra là có bài.</p>'+
    '<button class="btn ghost sm mt" data-v="thi-viet">Xem cuộc thi viết</button></div>';

  return o;
};

/* ═══════════════ MÀN CUỘC THI VIẾT ═══════════════ */
var moBai = '';

function nhomDe(){
  var c = cap();
  return (c === 'HS' || c === 'PH') ? c : 'NG';
}
function demChu(s){
  s = String(s || '').trim();
  return s ? s.split(/\s+/).length : 0;
}
function dieuKien(t){
  var daDi = G.nkSoNgayDaDi(), ghi = G.nkDem('ngay'), thang = G.nkDem('thang'), tuan = G.nkDem('tuan');
  var kpi = G.kpiCuaToi ? G.kpiCuaToi() : 100;
  var ds = [];
  ds.push({t:'Đã đi ' + t.ngay + ' ngày', dat: daDi >= t.ngay, hien: daDi + ' ngày'});
  var canGhi = t.ma === 'TV07' ? 5 : (t.ma === 'TV21' ? 15 : (t.ma === 'TV90' ? 60 : 240));
  ds.push({t:'Đã ghi nhật ký ' + canGhi + ' ngày', dat: ghi >= canGhi, hien: ghi + ' ngày'});
  if(t.ma === 'TV21') ds.push({t:'Có ít nhất 1 lần nhìn lại tuần', dat: tuan >= 1, hien: tuan + ' tuần'});
  if(t.ma === 'TV90') ds.push({t:'Đủ 3 lần tổng kết tháng', dat: thang >= 3, hien: thang + ' tháng'});
  if(t.ma === 'TV365'){
    ds.push({t:'Đủ 12 lần tổng kết tháng', dat: thang >= 12, hien: thang + ' tháng'});
    ds.push({t:'Đã dự thi ít nhất một mốc trước', dat: ['TV07','TV21','TV90'].some(function(m){
      return (bt()[m] || {}).nop; }), hien: ''});
  }
  if(t.ma === 'TV90' || t.ma === 'TV365')
    ds.push({t:'KPI từ 80%', dat: kpi >= 80, hien: kpi + '%'});
  return ds;
}

G.VIEWS['thi-viet'] = function(){
  var nd = nhomDe();
  var daDi = G.nkSoNgayDaDi();

  var o = U.ph({eyebrow:'BỐN MỐC · 7 · 21 · 90 · 365 NGÀY', ic:'crown', grad:1,
    t:'Cuộc thi viết về hành trình thay đổi',
    lead:'Bài đạt ở mốc 90 ngày và 365 ngày nhận HỌC BỔNG 10% cho lộ trình GITA365 tiếp theo. '+
      'Nhưng phần thưởng thật nằm ở chỗ khác: viết ra thì chính người viết mới thấy rõ mình đã đi được bao xa. '+
      'Học bổng chỉ là cái cớ để ngồi xuống viết.'});

  o += '<div class="row wrap mt2" style="gap:12px">'+
    [[String(daDi), 'NGÀY ĐÃ ĐI', 'var(--gita)'],
     [String(G.nkDem('ngay')), 'NGÀY ĐÃ GHI SỔ', 'var(--ok)'],
     [String(Object.keys(bt()).filter(function(k){ return (bt()[k]||{}).nop; }).length) + ' / 4',
      'BÀI ĐÃ NỘP', 'var(--gita)'],
     ['10%', 'HỌC BỔNG MỐC 90 · 365', 'var(--gold-ink)']]
    .map(function(x){
      return '<div class="card" style="flex:1;min-width:150px;text-align:center">'+
        '<b style="font-size:21px;color:'+x[2]+'">'+h(x[0])+'</b>'+
        '<div class="tiny up muted mt">'+h(x[1])+'</div></div>';
    }).join('')+'</div>';

  o += U.sec('BỐN MỐC','Mốc mở ra khi đủ điều kiện — điều kiện tính từ sổ nhật ký của chính mình');

  (G.THI_VIET || []).forEach(function(t){
    var dk = dieuKien(t);
    var mo = dk.every(function(x){ return x.dat; });
    var bai = bt()[t.ma] || {};
    var daNop = !!bai.nop;
    var mang = moBai === t.ma;

    o += '<div class="card mt2" style="border-color:'+(daNop ? 'var(--ok)' : (mo ? t.c : 'var(--line)'))+'">'+
      '<div class="row" style="gap:11px;align-items:center;flex-wrap:wrap">'+
        '<span style="width:34px;height:34px;border-radius:11px;flex:none;display:flex;align-items:center;'+
          'justify-content:center;background:'+t.c+'18;color:'+t.c+'">'+ic(t.ic,'w-4 h-4')+'</span>'+
        '<div style="flex:1;min-width:200px">'+
          '<b style="font-size:16px">'+h(t.ten)+'</b>'+
          '<div class="tiny muted mt">'+h(t.chuDe)+'</div></div>'+
        '<span class="chip">'+h(t.do)+'</span>'+
        (daNop ? '<span class="chip" style="color:var(--ok)">✓ Đã nộp</span>'
               : '<span class="chip" style="color:'+(mo ? t.c : 'var(--ink-4)')+'">'+
                 (mo ? 'Đang mở' : 'Chưa tới lượt')+'</span>')+
      '</div>';

    /* Điều kiện — luôn hiện, kể cả khi chưa đủ, và nói rõ còn thiếu gì */
    o += '<div class="mt2" style="padding:11px 14px;border-radius:11px;background:var(--phu-1)">'+
      '<span class="tiny up muted">ĐIỀU KIỆN DỰ THI</span>'+
      dk.map(function(x){
        return '<div class="tiny mt" style="line-height:1.6;color:'+(x.dat ? 'var(--ok)' : 'var(--ink-3)')+'">'+
          (x.dat ? '✓ ' : '○ ')+h(x.t)+(x.hien ? ' <span class="muted">· hiện tại: '+h(x.hien)+'</span>' : '')+'</div>';
      }).join('')+'</div>';

    /* Đề bài — hiện luôn, để ai cũng biết mình sẽ viết gì mà chuẩn bị dần */
    o += '<div class="mt2" style="padding:12px 15px;border-radius:12px;border-left:3px solid '+t.c+';background:'+t.c+'0E">'+
      '<span class="tiny up" style="color:'+t.c+'">ĐỀ BÀI CHO VAI CỦA MÌNH</span>'+
      '<p class="sm mt" style="line-height:1.75">'+h((t.de || {})[nd] || t.chuDe)+'</p></div>';

    o += '<div class="row wrap mt2" style="gap:11px">'+
      '<div style="flex:1;min-width:230px">'+
        '<span class="tiny up muted">BAN CHẤM XEM GÌ</span>'+
        '<ul class="tiny mt" style="line-height:1.7;padding-left:18px;margin:0">'+
          (t.cham || []).map(function(x){ return '<li>'+h(x)+'</li>'; }).join('')+'</ul></div>'+
      '<div style="flex:1;min-width:230px">'+
        '<span class="tiny up" style="color:var(--gold-ink)">PHẦN THƯỞNG</span>'+
        '<p class="tiny mt" style="line-height:1.7">'+h(t.thuong)+'</p></div>'+
    '</div>';

    /* Khung viết */
    if(mang){
      var sc = demChu(bai.bai);
      o += '<div class="mt2">'+
        '<label class="tiny up muted" for="tv_'+h(t.ma)+'">BÀI VIẾT CỦA TÔI</label>'+
        '<textarea id="tv_'+h(t.ma)+'" class="inp mt" data-tvbai="'+h(t.ma)+'" rows="14" '+
          (daNop ? 'readonly ' : '')+'placeholder="Bắt đầu bằng một chuyện thật, có ngày và có người. '+
          'Đừng mở bài bằng câu khẩu hiệu." style="width:100%;line-height:1.75;resize:vertical">'+
          h(bai.bai || '')+'</textarea>'+
        '<div class="row mt" style="gap:9px;flex-wrap:wrap;align-items:center">'+
          '<span class="tiny muted">Đã viết '+sc+' chữ · yêu cầu '+h(t.do)+'</span>'+
          (daNop
            ? '<span class="chip" style="color:var(--ok)">Đã nộp lúc '+h(bai.nop)+' — bài đã nộp không sửa được</span>'
            : '<button class="btn ghost sm" data-tvluu="'+h(t.ma)+'">Lưu nháp</button>'+
              (mo ? '<button class="btn pri sm" data-tvnop="'+h(t.ma)+'">Nộp bài dự thi</button>'
                  : '<span class="tiny muted">Viết trước được — nộp khi đủ điều kiện</span>'))+
        '</div></div>';
    } else {
      o += '<button class="btn '+(mo ? 'pri' : 'ghost')+' sm mt2" data-tvmo="'+h(t.ma)+'">'+
        (daNop ? 'Đọc lại bài đã nộp' : (bai.bai ? 'Viết tiếp bản nháp' : 'Mở khung viết — viết trước được'))+
      '</button>';
    }
    o += '</div>';
  });

  /* Luật */
  o += U.sec('LUẬT DỰ THI','Đọc trước khi viết — không ai bị loại vì một điều mình không biết');
  o += '<div class="card">'+ (G.THI_LUAT || []).map(function(x, i){
    return '<div style="'+(i ? 'border-top:1px solid var(--line);padding-top:12px;margin-top:12px' : '')+'">'+
      '<b class="sm">'+(i+1)+'. '+h(x.t)+'</b>'+
      '<p class="tiny mt" style="line-height:1.7">'+h(x.y)+'</p></div>';
  }).join('') +'</div>';

  o += '<div class="card mt2" style="background:var(--phu-1)">'+
    '<p class="sm" style="line-height:1.75">Chưa tới mốc nào vẫn mở khung viết được, và nên mở. '+
    'Bài hay nhất không phải bài viết một đêm trước hạn — là bài được bồi dần suốt chặng đường, '+
    'mỗi tuần thêm một đoạn lấy từ sổ nhật ký.</p>'+
    '<button class="btn ghost sm mt" data-v="nhat-ky-vi-tri">Mở sổ nhật ký của tôi</button></div>';

  return o;
};

/* ═══════════════ BẤM ═══════════════ */
document.addEventListener('click', function(e){
  var t = e.target;
  if(!t || !t.closest) return;

  var n = t.closest('[data-nknhip]');
  if(n){ nhipDang = n.getAttribute('data-nknhip'); xemLai = 0; if(G.render) G.render(); return; }

  var l = t.closest('[data-nklui]');
  if(l){
    xemLai = l.getAttribute('data-nklui') === '0' ? 0 : xemLai + 1;
    if(G.render) G.render();
    return;
  }

  var s = t.closest('[data-nkluu]');
  if(s){
    var khoa = s.getAttribute('data-nkluu'), v = {};
    document.querySelectorAll('[data-nko]').forEach(function(x){ v[x.getAttribute('data-nko')] = x.value; });
    ghiNK(khoa, v);
    U.toast('Đã ghi vào sổ. Đọc lại sau ba mươi ngày mới thấy hết giá trị của dòng này.','ok');
    if(G.render) G.render();
    return;
  }

  var m = t.closest('[data-tvmo]');
  if(m){ moBai = (moBai === m.getAttribute('data-tvmo')) ? '' : m.getAttribute('data-tvmo');
         if(G.render) G.render(); return; }

  var lb = t.closest('[data-tvluu]');
  if(lb){
    var ma = lb.getAttribute('data-tvluu');
    var el = document.getElementById('tv_' + ma);
    var cu = bt()[ma] || {};
    ghiBT(ma, {bai: el ? el.value : (cu.bai || ''), nop: cu.nop || ''});
    U.toast('Đã lưu nháp. Viết dần từng tuần thì tới hạn không phải viết vội.','ok');
    if(G.render) G.render();
    return;
  }

  var nb = t.closest('[data-tvnop]');
  if(nb){
    var ma2 = nb.getAttribute('data-tvnop');
    var t2 = (G.THI_VIET || []).filter(function(x){ return x.ma === ma2; })[0];
    var el2 = document.getElementById('tv_' + ma2);
    var bai = el2 ? el2.value : '';
    var sc = demChu(bai);
    var toiThieu = ma2 === 'TV07' ? 250 : (ma2 === 'TV21' ? 400 : (ma2 === 'TV90' ? 800 : 1500));
    if(sc < toiThieu){
      U.toast('Bài mới có '+sc+' chữ, mốc này cần ít nhất '+toiThieu+' chữ. Bài chưa đủ dài thường là bài chưa kể chuyện thật.','err');
      return;
    }
    if(!dieuKien(t2).every(function(x){ return x.dat; })){
      U.toast('Chưa đủ điều kiện dự thi mốc này. Phần điều kiện ở trên nói rõ còn thiếu gì.','err');
      return;
    }
    ghiBT(ma2, {bai: bai, nop: new Date().toLocaleDateString('vi-VN')});
    if(G.secLog) G.secLog('Cuộc thi viết', 'Nộp bài ' + ma2 + ' · ' + sc + ' chữ', 'Ghi nhận');
    U.toast('Đã nộp. Ban chấm đọc theo đúng các tiêu chí đã công bố ở trên.','ok');
    if(G.render) G.render();
  }
});

})();
